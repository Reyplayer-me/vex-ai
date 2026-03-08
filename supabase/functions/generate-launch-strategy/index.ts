import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a startup launch strategist focused on getting first traction — not marketing fluff.

You MUST respond with valid JSON in this exact format:
{
  "first_user_persona": {
    "description": "Detailed description of the ideal first 10 users",
    "where_they_hang_out": ["place 1", "place 2", "place 3"],
    "pain_level": "How urgently they need this solution (1-10 with explanation)",
    "how_to_reach_them": "Specific outreach strategy"
  },
  "growth_channel": {
    "primary": "The ONE channel to focus on first",
    "why": "Why this channel fits this specific idea and audience",
    "how_to_start": ["step 1", "step 2", "step 3"],
    "expected_timeline": "When to expect first results"
  },
  "launch_checklist": {
    "pre_launch": ["task 1", "task 2", "task 3"],
    "launch_day": ["task 1", "task 2", "task 3"],
    "first_week": ["task 1", "task 2", "task 3"],
    "first_month": ["task 1", "task 2", "task 3"]
  },
  "traction_metrics": {
    "primary_metric": "The ONE number to track",
    "target_week_1": "Realistic target for week 1",
    "target_month_1": "Realistic target for month 1",
    "how_to_measure": "How to actually track this"
  },
  "anti_patterns": ["common mistake 1 to avoid", "common mistake 2 to avoid", "common mistake 3 to avoid"]
}

GUIDELINES:
- Focus on FIRST TRACTION, not scaling
- Recommend only ONE primary growth channel — don't spread thin
- Be brutally specific — "post in r/startups" not "use social media"
- Launch checklist should be actionable in days, not weeks
- Anti-patterns should be specific to this type of product/market
- No marketing jargon — just concrete actions`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, targetUser, industry, goal, skillLevel, verdict } = await req.json();

    const MAX_LEN = 2000;
    const fields = { idea, targetUser, industry, goal };
    for (const [key, val] of Object.entries(fields)) {
      if (typeof val !== 'string' || val.trim().length === 0 || val.length > MAX_LEN) {
        return new Response(JSON.stringify({ error: `Invalid input: ${key}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Create a launch strategy for getting first traction with this startup:

IDEA: ${idea}
TARGET USER: ${targetUser}
INDUSTRY: ${industry}
FOUNDER GOAL: ${goal}
SKILL LEVEL: ${skillLevel || 'not specified'}
VALIDATION VERDICT: ${verdict || 'not yet validated'}

Focus on getting the first 10-20 users. No scaling advice. Just first traction.`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Launch strategy error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
