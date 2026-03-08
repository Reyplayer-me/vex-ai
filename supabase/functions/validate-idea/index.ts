import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert startup validator. You analyze business ideas with brutal honesty.

When given an idea, you MUST respond with a structured JSON analysis, followed by detailed reasoning for each score.

Your response MUST follow this EXACT format (no deviations):

{
  "scores": {
    "problem_clarity": {
      "score": <0-10>,
      "justification": "<one sentence explaining the score>",
      "improvement": "<one concrete suggestion to improve>"
    },
    "market_realism": {
      "score": <0-10>,
      "justification": "<one sentence explaining the score>",
      "improvement": "<one concrete suggestion to improve>"
    },
    "execution_difficulty": {
      "score": <0-10>,
      "justification": "<one sentence explaining the score>",
      "improvement": "<one concrete suggestion to improve>"
    },
    "differentiation": {
      "score": <0-10>,
      "justification": "<one sentence explaining the score>",
      "improvement": "<one concrete suggestion to improve>"
    }
  },
  "verdict": "<PROCEED|PIVOT|KILL>",
  "verdict_reasoning": "<2-3 sentences explaining the verdict>",
  "critical_risks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "next_steps": ["<step 1>", "<step 2>", "<step 3>"]
}

SCORING GUIDELINES:
- Problem Clarity (0-10): How well-defined is the problem? Is there clear pain?
- Market Realism (0-10): Does a real, reachable market exist? Is it big enough?
- Execution Difficulty (0-10): How hard is this to build? 10 = very hard, 0 = trivial
- Differentiation (0-10): What makes this unique? 10 = highly differentiated

VERDICT RULES:
- PROCEED: Average score >= 6 AND no score below 4
- PIVOT: Average score >= 4 AND at least one score below 4 OR average between 4-6
- KILL: Average score < 4 OR multiple critical flaws

Be direct. Be honest. No motivation fluff. Same input should yield similar output.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, targetUser, industry, goal } = await req.json();

    // Input validation
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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Analyze this startup idea:

IDEA: ${idea}
TARGET USER: ${targetUser}
INDUSTRY: ${industry}
GOAL: ${goal}

Provide your structured analysis. Be brutally honest.`;

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
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("validate-idea error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
