// Pure rules for the free verdict, kept separate so they can be unit-tested:
// input pre-checks and the evidence rule (competitors must come from search results).
/* eslint-disable @typescript-eslint/no-explicit-any -- AI output is untyped JSON; every field is checked before use */
import { clampScore, cleanList, cleanText, friendly, type SearchResult, VexError } from "./vex.ts";

type Verdict = "PROCEED" | "PIVOT" | "KILL";
type Confidence = "low" | "medium" | "high";

// Cheap checks before spending anything on AI.
export function precheck(idea: string): string | null {
  const letters = (idea.match(/\p{L}/gu) ?? []).length;
  const words = idea.split(/\s+/).filter((w) => /\p{L}{2,}/u.test(w));
  if (idea.length < 15 || words.length < 3) {
    return "Give us a bit more: what you want to build and who it's for, in a sentence or two.";
  }
  if (letters / idea.length < 0.5 || /(.)\1{9,}/.test(idea)) {
    return friendly("rejected_input");
  }
  return null;
}

const lowerConfidence = (c: Confidence, cap: Confidence): Confidence => {
  const order: Confidence[] = ["low", "medium", "high"];
  return order[Math.min(order.indexOf(c), order.indexOf(cap))];
};

// The overall score and verdict are computed here, not by the model: left to
// itself the model scored the parts fairly and then gave a much harsher total.
const WEIGHTS = { market_demand: 0.3, problem_clarity: 0.25, differentiation: 0.25, ease: 0.2 };
export const PROCEED_AT = 6.5;
export const KILL_BELOW = 4;
const FATAL_CAP = 3.9;

export function scoreIdea(scores: Record<"problem_clarity" | "market_demand" | "execution_difficulty" | "differentiation", number>, fatalFlaw: string | null) {
  const weighted =
    WEIGHTS.market_demand * scores.market_demand +
    WEIGHTS.problem_clarity * scores.problem_clarity +
    WEIGHTS.differentiation * scores.differentiation +
    WEIGHTS.ease * (10 - scores.execution_difficulty);
  let overall = Math.round(weighted * 10) / 10;
  if (fatalFlaw) overall = Math.min(overall, FATAL_CAP);
  const verdict: Verdict = overall >= PROCEED_AT && !fatalFlaw ? "PROCEED" : overall < KILL_BELOW ? "KILL" : "PIVOT";
  return { overall, verdict };
}

export function buildResult(raw: any, sources: SearchResult[], searchOk: boolean) {
  const s = raw?.scores ?? {};
  const scores = {
    problem_clarity: clampScore(s.problem_clarity),
    market_demand: clampScore(s.market_demand),
    execution_difficulty: clampScore(s.execution_difficulty),
    differentiation: clampScore(s.differentiation),
  };
  const oneLiner = cleanText(raw?.one_liner, 200);
  const risks = cleanList(raw?.top_risks, 3, 300);
  const killer = cleanText(raw?.killer_question, 300);
  if (Object.values(scores).some((v) => v === null) || !oneLiner || risks.length < 3 || !killer) {
    throw new VexError("internal", "verdict failed validation");
  }
  const fatalFlaw = cleanText(raw?.fatal_flaw, 300);
  const { overall, verdict } = scoreIdea(scores as Record<keyof typeof scores, number>, fatalFlaw);

  const byId = new Map(sources.map((r) => [r.id, r]));
  const seenHosts = new Set<string>();
  const competitors = (Array.isArray(raw?.competitors) ? raw.competitors : [])
    .map((c: any) => {
      const src = byId.get(String(c?.source_id ?? "").trim());
      const name = cleanText(c?.name, 80);
      if (!src || !name) return null;
      // The product must actually appear in the result it cites.
      const haystack = `${src.title} ${src.content} ${src.url}`.toLowerCase();
      const token = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (token.length < 2 || !haystack.replace(/[^a-z0-9]/g, "").includes(token)) return null;
      const host = new URL(src.url).hostname.replace(/^www\./, "");
      if (seenHosts.has(host)) return null;
      seenHosts.add(host);
      const priceSrc = byId.get(String(c?.pricing_source_id ?? "").trim());
      const pricing = priceSrc ? cleanText(c?.pricing, 120) ?? "Pricing not found" : "Pricing not found in search results";
      return {
        name,
        url: src.url,
        pricing,
        pricing_url: priceSrc?.url ?? null,
        difference: cleanText(c?.difference, 200) ?? "",
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  let confidence: Confidence = ["low", "medium", "high"].includes(raw?.confidence) ? raw.confidence : "low";
  if (!searchOk) confidence = "low";
  else if (competitors.length === 0) confidence = lowerConfidence(confidence, "medium");

  return {
    verdict,
    overall_score: overall,
    scores,
    one_liner: oneLiner,
    top_risks: risks,
    killer_question: killer,
    fatal_flaw: fatalFlaw,
    competitors,
    competitors_status: !searchOk ? "unverified" : competitors.length ? "verified" : "none_found",
    regulatory_flags: cleanList(raw?.regulatory_flags, 4, 240),
    what_would_change_my_mind: cleanText(raw?.what_would_change_my_mind, 400) ?? "",
    confidence,
    sources: sources.map(({ id, title, url }) => ({ id, title, url })),
  };
}
