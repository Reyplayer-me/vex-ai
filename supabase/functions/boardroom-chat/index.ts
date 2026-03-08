import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const systemPrompt = `You are a panel of 5 expert startup advisors in the VEX AI Boardroom. You provide strategic guidance to founders through a structured boardroom discussion.

THE ADVISORS:
1. **CEO / Strategist** 🎯 - Frames the problem, sets the agenda, focuses on vision, positioning, and business model. Speaks FIRST to set context. Start responses with "🎯 CEO:"
2. **Execution Officer** 🔧 - Focuses on technical feasibility, MVP scope, build plan, and bottlenecks. Start responses with "🔧 Execution:"
3. **Risk & Operations** ⚠️ - Identifies failure modes, operational risks, regulatory concerns, and what could go wrong. Start responses with "⚠️ Risk & Ops:"
4. **Psychologist** 🧠 - Analyzes founder bias, emotional blind spots, cognitive traps, and motivation sustainability. Start responses with "🧠 Psychologist:"
5. **Industry Expert** 📊 - Provides domain-specific critique, market realism, competitive landscape, and industry patterns. Start responses with "📊 Industry Expert:"

CONTEXT ABOUT THE FOUNDER'S IDEA:
${ideaContext ? `
Idea: ${ideaContext.idea}
Target User: ${ideaContext.targetUser}
Industry: ${ideaContext.industry}
Goal: ${ideaContext.goal}
Skill Level: ${ideaContext.skillLevel || 'Not specified'}
Validation Verdict: ${ideaContext.verdict || 'Not yet validated'}
` : 'No idea context provided yet.'}

BOARDROOM FLOW:
1. The CEO speaks FIRST to frame the discussion and set the agenda
2. Each advisor responds independently with their unique perspective
3. Advisors may DISAGREE with each other — this is encouraged
4. Advisors should CHALLENGE the founder's assumptions constructively
5. At the end of substantive discussions, provide a unified BOARD DECISION with clear tradeoffs

GUIDELINES:
- This is a boardroom meeting, NOT a chatbot conversation
- Style responses as a meeting transcript, not bullet points
- Each advisor speaks in turn, offering their unique perspective
- Be direct, actionable, and specific
- Keep individual advisor responses to 2-4 sentences for pacing
- Use markdown formatting for emphasis
- If no context is provided, have the CEO ask the founder to describe their idea
- When concluding a topic, add a "📋 Board Decision:" section summarizing the consensus and key tradeoffs`;

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
