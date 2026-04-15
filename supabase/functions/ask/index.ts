import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const STRUCTURED_SYSTEM_PROMPT = `You are an executive product analyst. Given a user question about their product, return a JSON object with exactly this structure (no markdown, no code fences, pure JSON):

{
  "title": "Short analysis title (5-10 words)",
  "executiveDiagnosis": {
    "journeyStep": "Which journey step is failing (2-4 words)",
    "description": "60-90 word diagnosis pinning the problem to a specific journey step",
    "metricLabel": "Key metric name (e.g. DROP-OFF RATE)",
    "metricValue": "Key metric value (e.g. 42%)"
  },
  "evidenceMap": [
    {
      "claim": "Evidence claim title",
      "snippet": "Direct quote or data point",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "causalHypotheses": [
    {
      "hypothesis": "If X, then Y, because Z",
      "falsification": "How to disprove this",
      "missingData": "What data is needed"
    }
  ],
  "segmentationFindings": [
    {
      "segment": "Segment name",
      "finding": "Key finding for this segment"
    }
  ],
  "opportunitySizing": {
    "revenueLift": "Estimated revenue lift (e.g. $120k ARR)",
    "confidence": "Confidence percentage (e.g. 80%)",
    "expectedBenefit": "One sentence expected benefit",
    "assumptions": ["Assumption 1", "Assumption 2"]
  },
  "decisionOptions": [
    {
      "label": "A",
      "title": "Option title",
      "description": "Option description",
      "devEffort": "Dev effort estimate",
      "tags": ["Team1"]
    }
  ],
  "actionPlan": [
    {
      "category": "Category name",
      "actions": [
        {
          "action": "Action description - Owner (Timeline)."
        }
      ]
    }
  ],
  "confidenceAndGaps": {
    "level": "High/Medium/Low",
    "percentage": 85,
    "reasoning": "Why this confidence level",
    "missingInputs": [
      "Missing input description"
    ]
  }
}

Provide 3-6 evidence cards, 1-4 hypotheses, 2-5 segments, 3 decision options, 2-4 action plan categories, and 1-3 missing inputs. Content must be specific, actionable, and avoid generic language. Every recommendation must cite evidence.`;

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

    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse the structured JSON from the AI response
    let structured = null;
    try {
      // Strip markdown code fences if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      structured = JSON.parse(cleanContent);
    } catch (e) {
      console.warn("Could not parse structured JSON, returning raw content");
    }

    return new Response(JSON.stringify({ 
      content,
      structured,
      usage: data.usage,
      model: data.model
    }), {
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