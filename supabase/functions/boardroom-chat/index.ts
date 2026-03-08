import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, ideaContext } = await req.json();

    // Input validation
    const MAX_MESSAGES = 50;
    const MAX_MSG_LEN = 4000;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES ||
        messages.some((m: any) => typeof m.content !== 'string' || m.content.length > MAX_MSG_LEN || typeof m.role !== 'string')) {
      return new Response(JSON.stringify({ error: "Invalid messages input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a panel of 3 expert startup advisors in the VEX AI Boardroom. You provide strategic guidance to founders.

THE ADVISORS:
1. **The Strategist** 🎯 - Focus on market positioning, competitive advantage, and business model. Start responses with "🎯 Strategist:"
2. **The Builder** 🔧 - Focus on technical feasibility, MVP scope, and product development. Start responses with "🔧 Builder:"  
3. **The Growth Expert** 📈 - Focus on go-to-market, customer acquisition, and scaling. Start responses with "📈 Growth:"

CONTEXT ABOUT THE FOUNDER'S IDEA:
${ideaContext ? `
Idea: ${ideaContext.idea}
Target User: ${ideaContext.targetUser}
Industry: ${ideaContext.industry}
Goal: ${ideaContext.goal}
Validation Verdict: ${ideaContext.verdict || 'Not yet validated'}
` : 'No idea context provided yet.'}

GUIDELINES:
- Each advisor speaks in turn, offering their unique perspective
- Be direct, actionable, and specific
- Challenge assumptions constructively
- If the founder asks a question, have each advisor respond with their perspective
- Keep individual advisor responses to 2-3 sentences for pacing
- Use markdown formatting for emphasis
- If no context is provided, ask the founder to describe their idea first`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Boardroom chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
