import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Chunk a document's text into overlapping pieces for context packing
function chunkText(text: string, docId: string, chunkSize = 1500, overlap = 200): Array<{ chunk_id: string; text: string; start_char: number; end_char: number }> {
  const chunks: Array<{ chunk_id: string; text: string; start_char: number; end_char: number }> = [];
  let start = 0;
  let idx = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({
      chunk_id: `${docId}__chunk_${idx}`,
      text: text.slice(start, end),
      start_char: start,
      end_char: end,
    });
    start += chunkSize - overlap;
    idx++;
  }
  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Authenticated user:", user.id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const { question, project_id, max_tokens = 8192 } = body;

    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 1: Fetch documents for the project ──
    let docsQuery = supabaseClient.from('documents').select('id, title, content, source_type, created_at');
    if (project_id) {
      docsQuery = docsQuery.eq('project_id', project_id);
    }
    docsQuery = docsQuery.eq('user_id', user.id);
    const { data: docs, error: docsError } = await docsQuery;

    if (docsError) {
      console.error("Error fetching documents:", docsError);
    }

    const documents = docs || [];
    console.log(`project_id=${project_id || 'none'}, doc_count=${documents.length}`);

    // ── Step 2: Build context pack with chunks ──
    const contextChunks: Array<{
      doc_id: string;
      doc_title: string;
      chunk_id: string;
      text: string;
      start_char: number;
      end_char: number;
    }> = [];

    let totalChars = 0;
    for (const doc of documents) {
      const text = doc.content || '';
      totalChars += text.length;
      const chunks = chunkText(text, doc.id);
      for (const chunk of chunks) {
        contextChunks.push({
          doc_id: doc.id,
          doc_title: doc.title || 'Untitled',
          chunk_id: chunk.chunk_id,
          text: chunk.text,
          start_char: chunk.start_char,
          end_char: chunk.end_char,
        });
      }
    }
    console.log(`extracted_char_count=${totalChars}, chunk_count=${contextChunks.length}`);

    // ── Step 3: If no documents / no content, return need_more_context immediately ──
    if (documents.length === 0 || totalChars < 50) {
      console.log("status=need_more_context (no documents)");
      const result = {
        status: "need_more_context",
        answer: { format: "chat_with_evidence", title: "I need a bit more context to answer correctly.", summary: "There are no documents uploaded for this project yet. Upload some documents so I can ground my analysis in your actual data.", sections: [] },
        evidence: [],
        suggested_prompts: [
          { label: "Summarize uploaded documents", prompt: "Summarize the key themes across all uploaded documents" },
          { label: "Extract pain points", prompt: "What are the top user pain points mentioned in the documents?" },
          { label: "List mentioned metrics", prompt: "What metrics or KPIs are mentioned in the documents? List them with quotes." },
          { label: "Find workflow issues", prompt: "Which workflow step is most frequently described as confusing?" },
        ],
        missing_context: [
          { need: "Product documents", why: "No documents found for this project. Upload user research, analytics exports, support tickets, or product specs." }
        ],
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 4: Build LLM prompt with strict grounding instructions ──
    // Limit context to ~60k chars to stay within token limits
    const maxContextChars = 60000;
    let contextText = '';
    const includedChunks: typeof contextChunks = [];
    for (const chunk of contextChunks) {
      if (contextText.length + chunk.text.length > maxContextChars) break;
      contextText += `\n\n--- [DOC: "${chunk.doc_title}" | ID: ${chunk.doc_id} | CHUNK: ${chunk.chunk_id} | CHARS: ${chunk.start_char}-${chunk.end_char}] ---\n${chunk.text}`;
      includedChunks.push(chunk);
    }

    const docList = documents.map(d => `- "${d.title || 'Untitled'}" (id: ${d.id}, type: ${d.source_type || 'unknown'})`).join('\n');

    const systemPrompt = `You are a rigorous product analyst. You answer ONLY using evidence from the CONTEXT PACK below. You MUST respond with valid JSON only — no markdown, no prose, no code fences.

ABSOLUTE RULES:
1. Every claim you make MUST be supported by a verbatim quote from the context pack.
2. If you cannot cite at least 2 evidence items with verbatim quotes that directly support your answer, you MUST set status="need_more_context".
3. NEVER invent document titles, doc_ids, chunk_ids, numbers, company names, metrics, or quotes. Every evidence quote must be an exact substring of the provided text.
4. If the question is unrelated to the documents or product topics, set status="unrelated".
5. If evidence exists but is thin, answer cautiously and list what's missing in missing_context.

AVAILABLE DOCUMENTS:
${docList}

CONTEXT PACK:
${contextText}

JSON RESPONSE SCHEMA (output ONLY this JSON, nothing else):
{
  "status": "ok" | "need_more_context" | "unrelated",
  "answer": {
    "format": "diagnosis_page" | "chat_with_evidence",
    "title": "string",
    "summary": "string (60-90 words)",
    "sections": [
      { "heading": "string", "content": "string" }
    ]
  },
  "evidence": [
    {
      "doc_id": "string (must match an actual doc id from above)",
      "doc_title": "string (must match actual doc title)",
      "chunk_id": "string (must match a chunk_id from above)",
      "quote": "string (VERBATIM substring from the chunk text)",
      "start_char": number,
      "end_char": number
    }
  ],
  "suggested_prompts": [
    { "label": "string (short label)", "prompt": "string (full prompt text)" }
  ],
  "missing_context": [
    { "need": "string", "why": "string" }
  ]
}

FORMAT SELECTION:
- Use "diagnosis_page" ONLY for investigative "why / what's driving / decline / drop-off / metric investigation / recommend actions" questions. Include sections: Executive Diagnosis, Evidence Map, Causal Hypotheses, Segmentation Findings, Opportunity Sizing, Decision Options, Action Plan, Confidence & Gaps.
- Use "chat_with_evidence" for general questions. Include 1-3 focused sections.

SUGGESTED PROMPTS:
- Always generate 4-6 suggested_prompts based on the user's question intent and the actual document content.
- Suggestions must be answerable from the available documents. Never suggest prompts requiring data not present.

Respond ONLY with the JSON object.`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ];

    console.log("Calling Lovable AI Gateway with grounded context");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: chatMessages,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your Lovable workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI Gateway error", details: errorText }), { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // ── Step 5: Parse and validate JSON ──
    let structured;
    try {
      const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      structured = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse JSON from model:", parseErr);
      console.error("Raw content:", rawContent.substring(0, 500));
      structured = {
        status: "need_more_context",
        answer: { format: "chat_with_evidence", title: "Analysis could not be completed", summary: "The system was unable to parse a structured response. Please try rephrasing your question.", sections: [] },
        evidence: [],
        suggested_prompts: [
          { label: "Summarize documents", prompt: "Summarize the key themes across all uploaded documents" },
          { label: "Find pain points", prompt: "What are the top user pain points mentioned in the documents?" },
        ],
        missing_context: [{ need: "Parsing failure", why: "The AI response could not be parsed. Try a simpler question." }],
      };
    }

    // Ensure required fields exist
    if (!structured.status) structured.status = "need_more_context";
    if (!structured.answer) structured.answer = { format: "chat_with_evidence", title: "Analysis", summary: "", sections: [] };
    if (!structured.evidence) structured.evidence = [];
    if (!structured.suggested_prompts) structured.suggested_prompts = [];
    if (!structured.missing_context) structured.missing_context = [];

    console.log(`status=${structured.status}, evidence_count=${structured.evidence.length}, suggested_prompts=${structured.suggested_prompts.length}`);

    return new Response(JSON.stringify(structured), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in ask function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
