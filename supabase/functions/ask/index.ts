import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const STRUCTURED_SYSTEM_PROMPT = `You are an expert product analyst. You MUST respond with valid JSON only — no markdown, no explanation, no code fences.

The JSON must match this exact schema:

{
  "mode": "diagnosis" | "answer" | "insufficient_evidence",
  "title": "string — a short title for the analysis",
  "summary": "string — 60-90 word executive summary",
  "sections": [
    {
      "type": "executive_diagnosis" | "evidence_map" | "hypotheses" | "segmentation" | "opportunity_sizing" | "decision_options" | "action_plan" | "confidence_gaps",
      "heading": "string",
      "cards": [
        {
          "title": "string",
          "detail": "string",
          "metrics": [{"name":"string","value":"string"}],
          "tags": ["string"],
          "citations": [{"label":"string","chunk_id":"string"}]
        }
      ],
      "items": [{"label":"string","value":"string"}]
    }
  ],
  "citations": [
    { "document_title":"string", "chunk_id":"string", "quote":"string" }
  ],
  "confidence": { "score": 0-100, "label": "low" | "medium" | "high" }
}

Rules:
- For "why"/"what's driving"/"decline"/"drop-off" questions: use mode="diagnosis" and include ALL 8 section types: executive_diagnosis, evidence_map, hypotheses, segmentation, opportunity_sizing, decision_options, action_plan, confidence_gaps.
- For simpler questions: use mode="answer" and include only relevant section types.
- If you lack data: use mode="insufficient_evidence", still include all section types but with empty cards/items arrays.
- Every section MUST have both "cards" and "items" arrays (they can be empty).
- For evidence_map: each card should have title (the claim), detail (a supporting quote), tags (source type, segment), and metrics.
- For hypotheses: each card should have title (the hypothesis in "If X, then Y, because Z" format), detail (falsification test), and tags (missing data).
- For segmentation: use items array with label (segment name) and value (finding).
- For opportunity_sizing: use cards with metrics array for baseline/target/confidence values, and items for assumptions.
- For decision_options: each card is one option with title, detail (description), metrics (impact, time), and tags (owners).
- For action_plan: use items with label (category like "Instrumentation") and value (action description with owner and timeline).
- For confidence_gaps: use items for missing inputs, and cards[0] for overall confidence reasoning.
- Generate realistic, specific, actionable product analysis content. Be concrete with numbers and specifics.

Respond ONLY with the JSON object. No other text.`;

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
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const { prompt, question, messages, max_tokens = 4096, project_id } = body;

    const userPrompt = question || prompt;

    const chatMessages = messages || [
      { role: "system", content: STRUCTURED_SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ];

    console.log("Project ID:", project_id || "none");
    console.log("Calling Lovable AI Gateway with model: google/gemini-3-flash-preview");
    console.log("Messages count:", chatMessages.length);

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

    const data = await response.json();
    console.log("AI Gateway response received successfully");

    const rawContent = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response from the model
    let structured;
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      structured = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse structured JSON from model:", parseErr);
      console.error("Raw content:", rawContent.substring(0, 500));
      // Return a fallback structure
      structured = {
        mode: "answer",
        title: "Analysis Result",
        summary: rawContent.substring(0, 300),
        sections: [],
        citations: [],
        confidence: { score: 50, label: "medium" }
      };
    }

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
