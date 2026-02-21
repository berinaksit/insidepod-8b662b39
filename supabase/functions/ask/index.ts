import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
    const { question, project_id, max_tokens = 4096 } = body;

    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user documents for context
    let documentsContext = "";
    if (project_id) {
      const { data: docs } = await supabaseClient
        .from("documents")
        .select("title, content")
        .eq("project_id", project_id)
        .limit(20);
      if (docs && docs.length > 0) {
        documentsContext = docs.map((d: any) => `--- ${d.title || 'Untitled'} ---\n${d.content}`).join("\n\n");
      }
    }

    // Determine mode based on question
    const isDiagnosis = /why|what.?s driving|decline|drop.?off|churn|friction|barrier|cause|reason|problem/i.test(question);

    const systemPrompt = `You are a senior product analyst. You MUST respond with valid JSON only — no markdown, no code fences, no explanation outside the JSON.

${isDiagnosis ? `The user is asking a diagnostic/causal question. Return JSON with mode="diagnosis" and ALL 8 sections populated.` : `The user is asking a direct question. Return JSON with mode="answer" and populate only the relevant sections. Leave others as null.`}

${documentsContext ? `Use ONLY the following uploaded documents as evidence. Ground every claim in these documents:\n\n${documentsContext}` : `No documents are uploaded. Return mode="insufficient_evidence" with empty_reason explaining what documents are needed.`}

Return this exact JSON structure:
{
  "mode": "diagnosis" | "answer" | "insufficient_evidence",
  "title": "Analysis title (e.g. 'User Friction & Retention Barriers Analysis')",
  "source_count": number,
  "empty_reason": "string or null — only for insufficient_evidence mode",
  "executive_diagnosis": {
    "journey_step": "e.g. ONBOARDING DEAD-END",
    "description": "60-90 word diagnosis pinning the problem to a specific journey step",
    "metrics": [{"label": "DROP-OFF RATE", "value": "42%"}]
  } | null,
  "evidence_map": [
    {
      "title": "Evidence card title",
      "quote": "Verbatim quote from documents",
      "tags": ["Technical", "Performance"]
    }
  ] | null,
  "causal_hypotheses": [
    {
      "hypothesis": "If X, then Y, because Z",
      "falsification": "How to disprove this",
      "missing_data": "What data is needed"
    }
  ] | null,
  "segmentation_findings": [
    {
      "segment": "Free Tier Users",
      "finding": "Description of finding",
      "icon_hint": "users" | "monitor" | "globe" | "layers" | "activity"
    }
  ] | null,
  "opportunity_sizing": {
    "metrics": [{"label": "EST. REVENUE LIFT", "value": "$120k ARR"}, {"label": "CONFIDENCE", "value": "80%"}],
    "expected_benefit": "Description of expected benefit",
    "details": [{"label": "Assumption", "text": "Description"}]
  } | null,
  "decision_options": [
    {
      "label": "A",
      "title": "Option title",
      "description": "Option description",
      "dev_effort": "4 Weeks",
      "tags": ["Engineering"]
    }
  ] | null,
  "action_plan": [
    {
      "category": "Instrumentation",
      "steps": ["Step description - Owner (Week N)."]
    }
  ] | null,
  "confidence_gaps": {
    "level": "High Confidence (85%)",
    "reasoning": "Explanation",
    "missing_inputs": [{"label": "Missing Input", "text": "Description"}]
  } | null
}`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ];

    console.log("Project ID:", project_id || "none");
    console.log("Mode hint:", isDiagnosis ? "diagnosis" : "answer");
    console.log("Calling Lovable AI Gateway");

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
      return new Response(JSON.stringify({ error: "AI Gateway error", details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI JSON:", parseErr);
      // Fallback: return raw content
      parsed = {
        mode: "answer",
        title: "Analysis Results",
        source_count: 0,
        executive_diagnosis: null,
        evidence_map: null,
        causal_hypotheses: null,
        segmentation_findings: null,
        opportunity_sizing: null,
        decision_options: null,
        action_plan: null,
        confidence_gaps: null,
        raw_content: rawContent,
      };
    }

    console.log("Response mode:", parsed.mode);

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
