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

// The board judges the overall score against fixed bands (see the prompt), so
// ideas spread across the scale instead of averaging out around 6. These rules
// then hold it to its own sub-scores and set the verdict from the number:
//   KILL     under 4    most likely won't work
//   PIVOT    4 to 6.9   could work, with a real change or an unproven assumption
//   PROCEED  7 or more  most likely could work as described
export const PROCEED_AT = 7;
export const KILL_BELOW = 4;
const FATAL_CAP = 3.9;
const WEAK = 2.5; // a sub-score this low is a serious hole
const NO_PROCEED_CAP = 6.9;

const BANDS: Record<string, [number, number]> = {
  cannot_work: [0, 1.9],
  unlikely: [2, 3.9],
  needs_change: [4, 5.4],
  promising: [5.5, 6.9],
  likely: [7, 8.4],
  exceptional: [8.5, 10],
};

// The band is the board's actual judgement; keep the number inside it.
export function fitBand(overall: number, band: unknown) {
  const range = typeof band === "string" ? BANDS[band] : undefined;
  return range ? Math.min(range[1], Math.max(range[0], overall)) : overall;
}

type Scores = Record<"problem_clarity" | "market_demand" | "execution_difficulty" | "differentiation", number>;

export function scoreIdea(overall: number, scores: Scores, fatalFlaw: string | null) {
  let score = overall;
  // Can't be "most likely works" with no demand, no real problem, or a copy of what exists.
  if (Math.min(scores.market_demand, scores.problem_clarity, scores.differentiation) <= WEAK) {
    score = Math.min(score, NO_PROCEED_CAP);
  }
  // Can't be "most likely works" if the parts are mostly weak.
  const strong = [scores.market_demand >= 7, scores.problem_clarity >= 7, scores.differentiation >= 6, scores.execution_difficulty <= 7];
  if (strong.filter(Boolean).length < 3) score = Math.min(score, NO_PROCEED_CAP);
  if (fatalFlaw) score = Math.min(score, FATAL_CAP);
  score = Math.round(score * 10) / 10;
  const verdict: Verdict = score >= PROCEED_AT ? "PROCEED" : score < KILL_BELOW ? "KILL" : "PIVOT";
  return { overall: score, verdict };
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
  const boardOverall = clampScore(raw?.overall_score);
  if (boardOverall === null) throw new VexError("internal", "verdict failed validation");
  const fatalFlaw = cleanText(raw?.fatal_flaw, 300);
  const { overall, verdict } = scoreIdea(fitBand(boardOverall, raw?.band), scores as Scores, fatalFlaw);

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
    case_for: cleanText(raw?.case_for, 400) ?? "",
    case_against: cleanText(raw?.case_against, 400) ?? "",
    competitors,
    competitors_status: !searchOk ? "unverified" : competitors.length ? "verified" : "none_found",
    regulatory_flags: cleanList(raw?.regulatory_flags, 4, 240),
    what_would_change_my_mind: cleanText(raw?.what_would_change_my_mind, 400) ?? "",
    confidence,
    sources: sources.map(({ id, title, url }) => ({ id, title, url })),
  };
}
