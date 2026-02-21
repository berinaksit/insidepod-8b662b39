import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractText(content: string, _sourceType: string | null): string {
  // Basic text extraction — works for plain text, md, etc.
  return content.replace(/\s+/g, ' ').trim();
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
    const { question, project_id } = body;

    if (!question || !question.trim()) {
      return new Response(JSON.stringify({ status: "unrelated", message: "Please provide a question.", suggested_prompts: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's documents, optionally filtered by project
    let docsQuery = supabaseClient.from('documents').select('id, title, content, source_type').eq('user_id', user.id);
    if (project_id) {
      docsQuery = docsQuery.eq('project_id', project_id);
    }
    const { data: docs, error: docsError } = await docsQuery;

    if (docsError) {
      console.error("Error fetching documents:", docsError.message);
    }

    const documents = docs || [];
    console.log(`project_id=${project_id || 'none'}, doc_count=${documents.length}`);

    // Build context pack
    const contextChunks: { id: string; title: string; text: string }[] = [];
    for (const doc of documents) {
      const text = extractText(doc.content, doc.source_type);
      if (text.length > 0) {
        contextChunks.push({ id: doc.id, title: doc.title || 'Untitled', text });
      }
    }

    const totalChars = contextChunks.reduce((sum, c) => sum + c.text.length, 0);
    console.log(`extracted_char_count=${totalChars}, chunk_count=${contextChunks.length}`);

    // If no documents at all, return need_more_context
    if (contextChunks.length === 0) {
      return new Response(JSON.stringify({
        status: "need_more_context",
        message: "I need a bit more context to answer correctly. No documents have been uploaded to this project yet.",
        suggested_prompts: [
          "Upload a document to get started",
          "What types of documents can I analyze?",
          "How do I add data sources to my project?"
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assemble grounded prompt
    const contextBlock = contextChunks.map((c, i) =>
      `--- Document ${i + 1}: "${c.title}" (id: ${c.id}) ---\n${c.text}`
    ).join('\n\n');

    const systemPrompt = `You are an expert product analyst. You MUST answer ONLY using the provided documents below. You are FORBIDDEN from inventing data, metrics, quotes, or sources that are not present in the documents.

RULES:
1. Every claim you make MUST be supported by a verbatim excerpt from the documents.
2. For each claim, provide the supporting evidence as a JSON object with fields: "document_title", "excerpt" (the exact verbatim text from the document, 10-80 words).
3. You must provide at least 2 evidence citations if you answer positively.
4. If the documents do not contain enough information to answer the question confidently, you MUST respond with EXACTLY this JSON (no other text):
{"status":"need_more_context","message":"I need a bit more context to answer correctly.","suggested_prompts":["prompt1","prompt2","prompt3"]}
where the suggested_prompts are 3-5 prompts that reframe the question into something the available documents CAN answer.
5. If the question is completely unrelated to the document content (e.g., asking about weather, sports, or topics with zero overlap), respond with EXACTLY this JSON:
{"status":"unrelated","message":"This question doesn't match the available project data.","suggested_prompts":["prompt1","prompt2","prompt3"]}
where suggested_prompts reframe into answerable questions.
6. If you CAN answer, respond with EXACTLY this JSON:
{"status":"ok","answer":"Your detailed answer here with inline references like [1], [2]...","evidence":[{"document_title":"...","excerpt":"..."},{"document_title":"...","excerpt":"..."}]}

DOCUMENTS:
${contextBlock}`;

    console.log("Calling Lovable AI Gateway with grounded context");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI Gateway error", details: errorText }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Try to parse structured JSON from the model's response
    let parsed: any = null;
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Model didn't return valid JSON — wrap as ok with raw text
      parsed = { status: "ok", answer: rawContent, evidence: [] };
    }

    const status = parsed.status || "ok";
    console.log(`status=${status}, evidence_count=${parsed.evidence?.length || 0}, suggested_prompts=${parsed.suggested_prompts?.length || 0}`);

    return new Response(JSON.stringify(parsed), {
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
