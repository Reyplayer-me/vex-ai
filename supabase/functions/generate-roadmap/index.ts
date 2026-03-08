import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a ruthless startup execution strategist. You create minimal, realistic execution roadmaps.

Your roadmaps must be:
- Brutally realistic about time and effort
- Minimal - only what's absolutely necessary
- Free of buzzwords and fluff
- Focused on validation before building

You MUST respond with valid JSON in this exact format:
{
  "phases": {
    "foundations": {
      "name": "Phase 1: Foundations",
      "duration": "2-3 weeks",
      "objectives": ["objective 1", "objective 2"],
      "deliverables": ["deliverable 1", "deliverable 2"],
      "avoid": ["what NOT to do 1", "what NOT to do 2"],
      "skills_tools": ["skill or tool needed"]
    },
    "product": {
      "name": "Phase 2: Product",
      "duration": "4-6 weeks",
      "objectives": ["objective 1", "objective 2"],
      "deliverables": ["deliverable 1", "deliverable 2"],
      "avoid": ["what NOT to do"],
      "skills_tools": ["skill or tool needed"]
    },
    "launch": {
      "name": "Phase 3: Launch",
      "duration": "2-4 weeks",
      "objectives": ["objective 1", "objective 2"],
      "deliverables": ["deliverable 1", "deliverable 2"],
      "avoid": ["what NOT to do"],
      "skills_tools": ["skill or tool needed"]
    }
  },
  "tech_stack": {
    "recommended": ["tech 1", "tech 2", "tech 3"],
    "reasoning": "Why this stack fits the idea"
  },
  "first_traction_metric": "The ONE metric to track first",
  "critical_assumptions": ["assumption 1 to test", "assumption 2 to test"]
}

Guidelines:
- Foundations phase: Research, validation, core decisions. NO BUILDING yet.
- Product phase: Core MVP features ONLY. No nice-to-haves.
- Launch phase: First users, feedback loops, initial traction.
- Each phase should have 3-5 objectives and deliverables.
- The "avoid" section is CRITICAL - founders waste time on wrong things.
- Tech stack must be practical for the idea's scale and founder's likely skill level.
- First traction metric should be specific and measurable.
- Critical assumptions are things that must be true for the idea to work.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { idea, targetUser, industry, goal, verdict, verdict_reasoning } = await req.json();

    // Input validation
    const MAX_LEN = 2000;
    const fields = { idea, targetUser, industry, goal, verdict, verdict_reasoning };
    for (const [key, val] of Object.entries(fields)) {
      if (typeof val !== 'string' || val.trim().length === 0 || val.length > MAX_LEN) {
        return new Response(JSON.stringify({ error: `Invalid input: ${key}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Create an execution roadmap for this validated startup idea:

IDEA: ${idea}
TARGET USER: ${targetUser}
INDUSTRY: ${industry}
FOUNDER GOAL: ${goal}
VALIDATION VERDICT: ${verdict}
VALIDATION REASONING: ${verdict_reasoning}

Generate a realistic, minimal 3-phase execution roadmap. Be specific to this exact idea and industry. No generic advice.`;

    console.log("Generating roadmap for idea:", idea.substring(0, 50) + "...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
