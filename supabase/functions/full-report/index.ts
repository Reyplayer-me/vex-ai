// Full report for a signed-in owner: boardroom debate, roadmap, build plan and
// launch plan, generated once per idea and saved. Limited per account per day.
/* eslint-disable @typescript-eslint/no-explicit-any -- request bodies and AI output are untyped JSON; every field is checked before use */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  aiToolCall, asData, cleanList, cleanText, corsHeaders, DATA_RULE, fail, getUser, json, serviceClient, VexError,
} from "../_shared/vex.ts";

const DAILY_FULL_REPORTS = 3;
const ROLES = ["CEO", "Execution Officer", "Risk Analyst", "Psychologist", "Industry Expert"] as const;

const str = { type: "string" };
const strList = (max: number) => ({ type: "array", items: str, maxItems: max });

const DEBATE_SCHEMA = {
  type: "object",
  properties: {
    advisors: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          role: { type: "string", enum: [...ROLES] },
          stance: { type: "string", enum: ["PROCEED", "PIVOT", "KILL"] },
          view: { type: "string", description: "3-4 sentences in this advisor's voice" },
          biggest_concern: str,
        },
        required: ["role", "stance", "view", "biggest_concern"],
      },
    },
    disagreements: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: { between: strList(2), topic: str, summary: str },
        required: ["between", "topic", "summary"],
      },
    },
    board_decision: {
      type: "object",
      properties: {
        verdict: { type: "string", enum: ["PROCEED", "PIVOT", "KILL"] },
        reasoning: str,
        conditions: strList(4),
      },
      required: ["verdict", "reasoning", "conditions"],
    },
  },
  required: ["advisors", "disagreements", "board_decision"],
};

const phase = {
  type: "object",
  properties: { goal: str, duration: str, tasks: strList(5), done_when: str },
  required: ["goal", "duration", "tasks", "done_when"],
};
const focus = {
  type: "object",
  properties: { headline: str, changes: strList(3) },
  required: ["headline", "changes"],
};
const ROADMAP_SCHEMA = {
  type: "object",
  properties: {
    phases: {
      type: "object",
      properties: { foundations: phase, mvp: phase, launch: phase, iterate: phase },
      required: ["foundations", "mvp", "launch", "iterate"],
    },
    focus: {
      type: "object",
      properties: { speed: focus, cost: focus, learning: focus, scale: focus },
      required: ["speed", "cost", "learning", "scale"],
    },
  },
  required: ["phases", "focus"],
};

const BUILD_SCHEMA = {
  type: "object",
  properties: {
    tech_stack: {
      type: "array",
      maxItems: 6,
      items: { type: "object", properties: { layer: str, choice: str, why: str }, required: ["layer", "choice", "why"] },
    },
    feature_priority: {
      type: "object",
      properties: { must_have: strList(5), later: strList(5), cut: strList(5) },
      required: ["must_have", "later", "cut"],
    },
    first_weekend: {
      type: "object",
      properties: { goal: str, saturday: strList(5), sunday: strList(5) },
      required: ["goal", "saturday", "sunday"],
    },
  },
  required: ["tech_stack", "feature_priority", "first_weekend"],
};

const LAUNCH_SCHEMA = {
  type: "object",
  properties: {
    first_user_persona: {
      type: "object",
      properties: { who: str, pain: str, where_to_find_them: strList(4) },
      required: ["who", "pain", "where_to_find_them"],
    },
    growth_channel: {
      type: "object",
      properties: { channel: str, why: str, first_steps: strList(4) },
      required: ["channel", "why", "first_steps"],
    },
    week_1_target: str,
    month_1_target: str,
    metric_to_watch: str,
  },
  required: ["first_user_persona", "growth_channel", "week_1_target", "month_1_target", "metric_to_watch"],
};

const TONE = `Tone: direct and human. Specific to this idea. No hype, no invented statistics or market sizes, no promise of success. Targets are goals for the founder to aim at, phrased as goals (e.g. "Talk to 10 ..."), not predictions.`;

function context(idea: any, technical: boolean) {
  const r = idea.result;
  return `<founder_idea>\n${asData(idea.idea)}\n</founder_idea>
<audience>\n${asData(idea.audience ?? "") || "not specified"}\n</audience>
<result>
Free verdict: ${r.verdict} (${r.overall_score}/10). Summary: ${asData(r.one_liner)}
Top risks: ${r.top_risks.map((x: string) => asData(x)).join(" | ")}
Competitors found: ${r.competitors.length ? r.competitors.map((c: any) => `${asData(c.name)} (${asData(c.pricing)})`).join("; ") : "none verified"}
Regulatory flags: ${r.regulatory_flags.map((x: string) => asData(x)).join(" | ") || "none"}
</result>
Founder: ${technical ? "can code" : "does not code (prefer no-code and low-code tools)"}.`;
}

const checkList = (v: unknown, max: number) => cleanList(v, max, 300);

function validateDebate(d: any) {
  const advisors = (Array.isArray(d?.advisors) ? d.advisors : [])
    .filter((a: any) => ROLES.includes(a?.role))
    .map((a: any) => ({
      role: a.role,
      stance: ["PROCEED", "PIVOT", "KILL"].includes(a.stance) ? a.stance : "PIVOT",
      view: cleanText(a.view, 900) ?? "",
      biggest_concern: cleanText(a.biggest_concern, 300) ?? "",
    }));
  const decision = d?.board_decision;
  if (advisors.length < 5 || !cleanText(decision?.reasoning)) throw new VexError("internal", "debate failed validation");
  return {
    advisors: ROLES.map((role) => advisors.find((a: any) => a.role === role)).filter(Boolean),
    disagreements: (Array.isArray(d?.disagreements) ? d.disagreements : []).slice(0, 3).map((x: any) => ({
      between: checkList(x?.between, 2),
      topic: cleanText(x?.topic, 120) ?? "",
      summary: cleanText(x?.summary, 500) ?? "",
    })),
    board_decision: {
      verdict: ["PROCEED", "PIVOT", "KILL"].includes(decision.verdict) ? decision.verdict : "PIVOT",
      reasoning: cleanText(decision.reasoning, 900)!,
      conditions: checkList(decision.conditions, 4),
    },
  };
}

function validateRoadmap(d: any) {
  const p = (x: any) => ({
    goal: cleanText(x?.goal, 300) ?? "",
    duration: cleanText(x?.duration, 60) ?? "",
    tasks: checkList(x?.tasks, 5),
    done_when: cleanText(x?.done_when, 300) ?? "",
  });
  const f = (x: any) => ({ headline: cleanText(x?.headline, 200) ?? "", changes: checkList(x?.changes, 3) });
  const phases = { foundations: p(d?.phases?.foundations), mvp: p(d?.phases?.mvp), launch: p(d?.phases?.launch), iterate: p(d?.phases?.iterate) };
  if (Object.values(phases).some((x) => x.tasks.length === 0)) throw new VexError("internal", "roadmap failed validation");
  return { phases, focus: { speed: f(d?.focus?.speed), cost: f(d?.focus?.cost), learning: f(d?.focus?.learning), scale: f(d?.focus?.scale) } };
}

function validateBuild(d: any, technical: boolean) {
  const stack = (Array.isArray(d?.tech_stack) ? d.tech_stack : []).slice(0, 6).map((t: any) => ({
    layer: cleanText(t?.layer, 60) ?? "",
    choice: cleanText(t?.choice, 120) ?? "",
    why: cleanText(t?.why, 300) ?? "",
  }));
  if (!stack.length) throw new VexError("internal", "build plan failed validation");
  return {
    founder_type: technical ? "technical" : "non-technical",
    tech_stack: stack,
    feature_priority: {
      must_have: checkList(d?.feature_priority?.must_have, 5),
      later: checkList(d?.feature_priority?.later, 5),
      cut: checkList(d?.feature_priority?.cut, 5),
    },
    first_weekend: {
      goal: cleanText(d?.first_weekend?.goal, 300) ?? "",
      saturday: checkList(d?.first_weekend?.saturday, 5),
      sunday: checkList(d?.first_weekend?.sunday, 5),
    },
  };
}

function validateLaunch(d: any) {
  if (!cleanText(d?.growth_channel?.channel)) throw new VexError("internal", "launch plan failed validation");
  return {
    first_user_persona: {
      who: cleanText(d?.first_user_persona?.who, 400) ?? "",
      pain: cleanText(d?.first_user_persona?.pain, 400) ?? "",
      where_to_find_them: checkList(d?.first_user_persona?.where_to_find_them, 4),
    },
    growth_channel: {
      channel: cleanText(d.growth_channel.channel, 120)!,
      why: cleanText(d?.growth_channel?.why, 400) ?? "",
      first_steps: checkList(d?.growth_channel?.first_steps, 4),
    },
    week_1_target: cleanText(d?.week_1_target, 300) ?? "",
    month_1_target: cleanText(d?.month_1_target, 300) ?? "",
    metric_to_watch: cleanText(d?.metric_to_watch, 300) ?? "",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const user = await getUser(req);
  if (!user) return fail("unauthorized");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("invalid_input");
  }
  const ideaId = typeof body?.ideaId === "string" ? body.ideaId : "";
  const technical = body?.technical === true;
  if (!/^[0-9a-f-]{36}$/i.test(ideaId)) return fail("invalid_input");

  const db = serviceClient();
  const { data: idea } = await db.from("ideas").select("*").eq("id", ideaId).eq("user_id", user.id).maybeSingle();
  if (!idea) return fail("not_found");
  if (idea.full_report) return json({ report: idea.full_report, technical: idea.technical_founder, reused: true });

  const { data: allowed, error: limitError } = await db.rpc("consume_rate_limit", {
    _keys: [`full:${user.id}`],
    _limits: [DAILY_FULL_REPORTS],
  });
  if (limitError) {
    console.error("full-report: rate limit check failed", limitError.message);
    return fail("internal");
  }
  if (!allowed) {
    return fail("rate_limited", `You've unlocked ${DAILY_FULL_REPORTS} full reports today. Saved reports stay free to reopen; new ones unlock tomorrow.`);
  }

  try {
    const ctx = context(idea, technical);
    const started = Date.now();
    const [debate, roadmap, build, launch] = await Promise.all([
      aiToolCall<any>({
        system: `You run a debate between five startup advisors about one idea.
- CEO: is this a business worth a founder's next year?
- Execution Officer: what is the smallest thing that can ship, and what blocks it?
- Risk Analyst: the assumptions that could sink it, including legal and regulatory ones.
- Psychologist: the founder biases visible in how the idea is framed (overconfidence, solution-first thinking, sunk cost).
- Industry Expert: what the market and the listed competitors already show.
Advisors must genuinely disagree where the evidence allows. The board decision weighs them and lists the conditions that would change it. Do not cite competitors that are not in <result>.
${DATA_RULE}
${TONE}`,
        user: `${ctx}\n\nRun the board debate.`,
        toolName: "board_debate",
        schema: DEBATE_SCHEMA,
        maxTokens: 3500,
      }),
      aiToolCall<any>({
        system: `You write an execution roadmap in four phases: Foundations (validate before building), MVP (smallest shippable product), Launch (first users), Iterate (learn and decide). Then say how the plan changes if the founder optimises for speed, cost, learning or scale.
${DATA_RULE}
${TONE}`,
        user: `${ctx}\n\nWrite the roadmap.`,
        toolName: "roadmap",
        schema: ROADMAP_SCHEMA,
        maxTokens: 3000,
      }),
      aiToolCall<any>({
        system: `You write a build plan for a first-time founder. ${technical ? "They can code: name concrete frameworks and services." : "They do not code: recommend no-code or AI app builders and managed services, and no custom code."} Feature priority must be ruthless. The First Weekend Plan is what they can finish in two days.
${DATA_RULE}
${TONE}`,
        user: `${ctx}\n\nWrite the build plan.`,
        toolName: "build_plan",
        schema: BUILD_SCHEMA,
        maxTokens: 2500,
      }),
      aiToolCall<any>({
        system: `You write a launch plan to get the first users: one specific persona, one growth channel to start with, and week-1 and month-1 targets phrased as goals.
${DATA_RULE}
${TONE}`,
        user: `${ctx}\n\nWrite the launch plan.`,
        toolName: "launch_plan",
        schema: LAUNCH_SCHEMA,
        maxTokens: 2000,
      }),
    ]);

    const report = {
      debate: validateDebate(debate),
      roadmap: validateRoadmap(roadmap),
      build_plan: validateBuild(build, technical),
      launch_plan: validateLaunch(launch),
      generated_at: new Date().toISOString(),
    };

    const { error: saveError } = await db
      .from("ideas")
      .update({ full_report: report, full_report_at: report.generated_at, technical_founder: technical })
      .eq("id", idea.id);
    if (saveError) throw new VexError("internal", `save failed: ${saveError.message}`);

    const { count } = await db.from("assumptions").select("id", { count: "exact", head: true }).eq("idea_id", idea.id);
    if (!count) {
      const seeded = [
        ...idea.result.top_risks.map((risk: string) => `Test: ${risk}`.slice(0, 300)),
        "Talk to 5 potential users about the problem (not your solution)",
      ];
      await db.from("assumptions").insert(seeded.map((text) => ({ idea_id: idea.id, user_id: user.id, text, source: "risk" })));
    }

    console.log("full-report ok", { ms: Date.now() - started });
    return json({ report, technical, reused: false });
  } catch (err) {
    const e = err instanceof VexError ? err : new VexError("internal", err instanceof Error ? err.message : String(err));
    console.error("full-report failed", { code: e.code, detail: e.detail });
    await db.rpc("refund_rate_limit", { _keys: [`full:${user.id}`] });
    return fail(e.code);
  }
});
