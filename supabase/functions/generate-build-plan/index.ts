import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a startup product architect. You help founders create concrete build foundations.

You MUST respond with valid JSON in this exact format:
{
  "tech_stack": {
    "frontend": ["technology 1", "technology 2"],
    "backend": ["technology 1", "technology 2"],
    "tools": ["tool 1", "tool 2"],
    "reasoning": "Why this stack fits the idea and the founder's skill level"
  },
  "architecture": {
    "overview": "One paragraph describing the high-level architecture",
    "components": ["component 1 description", "component 2 description", "component 3 description"],
    "data_model": "Brief description of core data entities and relationships"
  },
  "feature_priority": {
    "must_have": ["feature 1", "feature 2", "feature 3"],
    "nice_to_have": ["feature 1", "feature 2"],
    "cut_for_mvp": ["feature 1", "feature 2"]
  },
  "project_structure": {
    "description": "Overview of how to organize the project",
    "key_files": ["file/folder 1 and purpose", "file/folder 2 and purpose"],
    "starter_guidance": "Specific guidance based on skill level - code snippets for technical founders, platform recommendations for non-technical"
  },
  "first_weekend_plan": {
    "saturday": ["task 1", "task 2", "task 3"],
    "sunday": ["task 1", "task 2", "task 3"],
    "goal": "What you should have by Sunday night"
  }
}

GUIDELINES:
- For TECHNICAL founders: Include specific frameworks, code patterns, and architecture decisions
- For NON-TECHNICAL founders: Recommend no-code/low-code platforms, tools, and services
- Feature priority must be BRUTAL - cut everything that isn't core
- The first weekend plan should be achievable and specific
- Tech stack must match the idea's complexity and the founder's capabilities
- Be specific to the actual idea, not generic advice`;

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

    const userPrompt = `Create a product build foundation for this startup idea:

IDEA: ${idea}
TARGET USER: ${targetUser}
INDUSTRY: ${industry}
FOUNDER GOAL: ${goal}
SKILL LEVEL: ${skillLevel || 'not specified'}
VALIDATION VERDICT: ${verdict || 'not yet validated'}

Generate a concrete, actionable build plan. Be specific to this exact idea. No generic advice.`;

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
    console.error("Build plan error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
