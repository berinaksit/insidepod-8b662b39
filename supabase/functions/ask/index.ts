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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    const apiKey = LOVABLE_API_KEY || OPENAI_API_KEY;
    const apiUrl = LOVABLE_API_KEY 
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = LOVABLE_API_KEY ? "google/gemini-3-flash-preview" : "gpt-4o-mini";

    if (!apiKey) {
      console.error("No AI API key configured");
      throw new Error("No AI API key configured (LOVABLE_API_KEY or OPENAI_API_KEY)");
    }

    const body = await req.json();
    const { prompt, messages, max_tokens = 2048, mode, query, projectId, documentContext } = body;

    let chatMessages: Array<{ role: string; content: string }>;

    if (mode === 'grounded') {
      // Document-grounded mode: AI must only use provided context
      const systemPrompt = `You are an analytical assistant for a product insights platform. 
Answer ONLY using the provided document context below. Do NOT make up information, statistics, or data points.
If the document context does not contain enough information to answer the question, respond with a JSON object containing:
{"insufficient": true, "message": "Not enough data in your uploaded documents to answer this yet.", "suggestion": "Upload [specific type of document] to get better insights on this topic."}

Otherwise, respond with a JSON object containing:
{"answer": "your analysis here", "confidence": 0.0-1.0, "used_sources": [{"id": "doc_id", "title": "doc_title"}], "next_actions": ["suggested action 1", "suggested action 2"]}

IMPORTANT: Your response must be valid JSON only, no markdown, no extra text.

DOCUMENT CONTEXT:
${documentContext || "No documents available."}`;

      chatMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: query || prompt || "Analyze the uploaded documents" }
      ];
    } else if (mode === 'insight') {
      // Insight generation mode for agents
      const systemPrompt = `You are an AI agent that generates product insights from document data.
Analyze the provided document context and generate insights based on the agent's purpose.
Answer ONLY using the provided document context. Do NOT fabricate data, metrics, or statistics.

If there is insufficient data, respond with:
{"insufficient": true, "message": "Not enough evidence in your documents to generate this insight.", "suggestion": "Upload more documents with relevant data."}

Otherwise, respond with a JSON object:
{"title": "concise insight title (5-10 words)", "synthesis": "detailed analysis (2-3 sentences)", "confidence": 0.0-1.0, "evidence_count": number, "used_sources": [{"id": "doc_id", "title": "doc_title"}], "priority": "high|medium|low", "next_actions": ["action 1", "action 2"]}

IMPORTANT: Your response must be valid JSON only.

DOCUMENT CONTEXT:
${documentContext || "No documents available."}`;

      chatMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: query || "Generate a product insight from these documents" }
      ];
    } else if (mode === 'dashboard') {
      // Dashboard synthesis mode
      const systemPrompt = `You are an AI that synthesizes dashboard content from user documents.
Based on the provided document context, generate the requested dashboard element.
Answer ONLY from the documents. Never fabricate data.

If insufficient data, respond: {"insufficient": true}

DOCUMENT CONTEXT:
${documentContext || "No documents available."}`;

      chatMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: query || prompt || "Synthesize dashboard content" }
      ];
    } else {
      // Legacy / simple mode
      chatMessages = messages || [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: prompt }
      ];
    }

    console.log("Calling AI with mode:", mode || "legacy", "model:", model);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI API error", details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ 
      content,
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
