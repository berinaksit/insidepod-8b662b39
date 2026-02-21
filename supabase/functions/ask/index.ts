import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractText(content: string, _sourceType: string | null): string {
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

    const docTitles = contextChunks.map(c => c.title);

    const systemPrompt = `You are an expert product analyst. You MUST answer ONLY using the provided documents below. You are FORBIDDEN from inventing data, metrics, quotes, or sources that are not present in the documents.

RULES:
1. Every claim you make MUST be supported by a verbatim excerpt from the documents.
2. If the documents do not contain enough information to answer the question confidently, you MUST respond with EXACTLY this JSON:
{"status":"need_more_context","message":"I need a bit more context to answer correctly.","suggested_prompts":["prompt1","prompt2","prompt3"]}
where the suggested_prompts are 3-5 prompts based on what the documents actually contain.
3. If the question is completely unrelated to the document content, respond with EXACTLY this JSON:
{"status":"unrelated","message":"This question doesn't match the available project data.","suggested_prompts":["prompt1","prompt2","prompt3"]}
4. If you CAN answer from the documents, respond with a structured executive analysis in EXACTLY this JSON format:

{
  "status": "ok",
  "title": "Short descriptive title for the analysis (e.g. 'User Friction & Retention Barriers Analysis')",
  "doc_count": ${contextChunks.length},
  "executive_diagnosis": {
    "journey_step": "The specific journey step or area where the problem is pinned (e.g. 'ONBOARDING DEAD-END')",
    "description": "60-90 word description of the core problem, grounded in document evidence",
    "key_metric_label": "Label for the key metric (e.g. 'DROP-OFF RATE')",
    "key_metric_value": "Value of the key metric (e.g. '42%')"
  },
  "evidence_map": [
    {
      "title": "Short evidence card title",
      "excerpt": "Verbatim quote from the document (10-80 words)",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "causal_hypotheses": [
    {
      "hypothesis": "If X, then Y, because Z format",
      "falsification": "How to test/disprove this hypothesis",
      "missing_data": "What data is needed"
    }
  ],
  "segmentation_findings": [
    {
      "segment": "Segment name (e.g. 'Free Tier Users')",
      "finding": "Key finding for this segment",
      "has_data": true
    }
  ],
  "opportunity_sizing": {
    "revenue_lift": "Estimated revenue impact (e.g. '$120k ARR')",
    "confidence": "Confidence percentage (e.g. '80%')",
    "expected_benefit": "Description of expected benefit",
    "details": "Assumptions and details"
  },
  "decision_options": [
    {
      "label": "A",
      "title": "Option title",
      "description": "Option description",
      "dev_effort": "Estimated effort (e.g. '4 Weeks')",
      "tags": ["Engineering"]
    }
  ],
  "action_plan": [
    {
      "category": "Category name (e.g. 'Instrumentation', 'UI Design')",
      "actions": ["Action item 1", "Action item 2"]
    }
  ],
  "confidence_gaps": {
    "level": "High/Medium/Low",
    "percentage": 85,
    "reasoning": "Explanation of confidence level",
    "missing_inputs": [
      "Missing input 1",
      "Missing input 2"
    ]
  }
}

IMPORTANT:
- Pin diagnosis to a specific journey step, never broad themes.
- Every recommendation must cite evidence from the evidence_map.
- Include at least one contradiction check if applicable.
- Prefer specific verbs (remove, validate, instrument) over generic ones (improve, enhance, optimize).
- If segmentation data is missing, explicitly list required instrumentation.
- Provide at least 3 evidence cards and at least 2 causal hypotheses.
- All excerpts must be VERBATIM from the documents.

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
        max_tokens: 4096,
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
      const cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Model didn't return valid JSON — wrap as ok with raw text
      parsed = { status: "ok", title: "Analysis Results", doc_count: contextChunks.length, executive_diagnosis: { journey_step: "ANALYSIS", description: rawContent, key_metric_label: "", key_metric_value: "" }, evidence_map: [], causal_hypotheses: [], segmentation_findings: [], opportunity_sizing: { revenue_lift: "", confidence: "", expected_benefit: "", details: "" }, decision_options: [], action_plan: [], confidence_gaps: { level: "Low", percentage: 50, reasoning: "Raw text response — structured parsing failed.", missing_inputs: [] } };
    }

    const status = parsed.status || "ok";
    console.log(`status=${status}, evidence_count=${parsed.evidence_map?.length || 0}`);

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
