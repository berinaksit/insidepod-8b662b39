import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function buildSystemPrompt(contextPack: { doc_id: string; title: string; type: string; chunks: { chunk_id: string; text: string; start_char: number; end_char: number }[] }[]) {
  const contextBlock = contextPack.map(doc => {
    return doc.chunks.map(c =>
      `[doc_id="${doc.doc_id}" title="${doc.title}" chunk_id="${c.chunk_id}" start=${c.start_char} end=${c.end_char}]\n${c.text}`
    ).join('\n---\n');
  }).join('\n===\n');

  return `You are an expert product analyst. You MUST answer ONLY using the CONTEXT DOCUMENTS below. You are FORBIDDEN from inventing any data, metrics, quotes, numbers, customer names, company names, or sources not present in the context.

CONTEXT DOCUMENTS:
${contextBlock || "(No documents available)"}

OUTPUT FORMAT — respond with valid JSON only, no markdown fences, no extra text.

Schema:
{
  "status": "ok" | "need_more_context" | "unrelated",
  "answer": {
    "format": "diagnosis_page" | "chat_with_evidence",
    "title": "string",
    "summary": "string",
    "sections": [
      { "heading": "string", "content": "string" }
    ]
  },
  "evidence": [
    {
      "doc_id": "string",
      "doc_title": "string",
      "chunk_id": "string",
      "quote": "string (verbatim substring from the context)",
      "start_char": number,
      "end_char": number
    }
  ],
  "suggested_prompts": [
    { "label": "string", "prompt": "string" }
  ],
  "missing_context": [
    { "need": "string", "why": "string" }
  ]
}

STRICT RULES:
1. If you cannot cite at least 2 evidence items with verbatim quotes from the provided context that directly support your claims, you MUST set status="need_more_context". Do NOT guess or fabricate.
2. Every "quote" in evidence MUST be a verbatim substring copied from the context text above. Never paraphrase.
3. "doc_id", "doc_title", "chunk_id", "start_char", "end_char" must match the document metadata exactly.
4. If the question is unrelated to the documents (e.g., "write a poem", "what's the weather"), set status="unrelated".
5. If evidence exists but is thin, answer cautiously and list what's missing in missing_context.
6. For "why/what's driving/decline/drop-off/recommend/metric investigation" questions, use format="diagnosis_page" and include sections: Executive Diagnosis, Evidence Map, Causal Hypotheses, Segmentation Findings, Opportunity Sizing, Decision Options, Action Plan, Confidence & Gaps. Each section heading must match exactly.
7. For general questions, use format="chat_with_evidence" and include only relevant sections.
8. Always generate 4-6 suggested_prompts based on the user's intent AND the topics actually present in the documents. Never suggest prompts that require data not in the documents.
9. If no documents are provided, set status="need_more_context" immediately.

Respond ONLY with the JSON object.`;
}

function chunkText(text: string, chunkSize = 2000, overlap = 200): { chunk_id: string; text: string; start_char: number; end_char: number }[] {
  const chunks: { chunk_id: string; text: string; start_char: number; end_char: number }[] = [];
  let start = 0;
  let idx = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({
      chunk_id: `chunk_${idx}`,
      text: text.slice(start, end),
      start_char: start,
      end_char: end,
    });
    idx++;
    start += chunkSize - overlap;
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const { question, project_id, max_tokens = 4096 } = body;
    const userPrompt = question || "";

    // 1) Fetch documents for project
    let docsQuery = supabaseClient
      .from('documents')
      .select('id, title, content, source_type, created_at')
      .eq('user_id', user.id);

    if (project_id) {
      docsQuery = docsQuery.eq('project_id', project_id);
    }

    const { data: docs, error: docsError } = await docsQuery;

    if (docsError) {
      console.error("Error fetching documents:", docsError);
    }

    const docList = docs || [];
    console.log(`[ask] project_id=${project_id || 'none'}, doc_count=${docList.length}`);

    // 2) Build context pack with chunks
    let totalChars = 0;
    const contextPack = docList.map(doc => {
      const text = doc.content || "";
      totalChars += text.length;
      return {
        doc_id: doc.id,
        title: doc.title || "Untitled",
        type: doc.source_type || "unknown",
        chunks: chunkText(text),
      };
    });

    console.log(`[ask] extracted_char_count=${totalChars}`);

    // 3) Build messages
    const systemPrompt = buildSystemPrompt(contextPack);
    const chatMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    console.log("[ask] Calling Lovable AI Gateway");

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI Gateway error", details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // 4) Parse and validate JSON
    let structured: any;
    try {
      const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      structured = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[ask] Failed to parse JSON:", parseErr);
      console.error("[ask] Raw:", rawContent.substring(0, 500));
      // Return need_more_context as fallback instead of fabricated data
      structured = {
        status: "need_more_context",
        answer: { format: "chat_with_evidence", title: "Could not process response", summary: "The AI response could not be parsed. Please try rephrasing your question.", sections: [] },
        evidence: [],
        suggested_prompts: [
          { label: "Summarize all documents", prompt: "Summarize the key themes across all my uploaded documents" },
          { label: "List main topics", prompt: "What are the main topics covered in my documents?" },
        ],
        missing_context: [{ need: "Valid response", why: "The AI output was not in the expected format" }],
      };
    }

    // Ensure required fields
    if (!structured.status) structured.status = "need_more_context";
    if (!structured.evidence) structured.evidence = [];
    if (!structured.suggested_prompts) structured.suggested_prompts = [];
    if (!structured.missing_context) structured.missing_context = [];
    if (!structured.answer) {
      structured.answer = { format: "chat_with_evidence", title: "", summary: "", sections: [] };
    }

    console.log(`[ask] status=${structured.status}, evidence_count=${structured.evidence.length}, suggested_prompts=${structured.suggested_prompts.length}`);

    return new Response(JSON.stringify(structured), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ask function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
