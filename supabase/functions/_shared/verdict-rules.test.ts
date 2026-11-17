// Run with: deno test supabase/functions/_shared/verdict-rules.test.ts
import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildResult, precheck, scoreIdea } from "./verdict-rules.ts";

const sources = [
  { id: "C1", title: "MealPrep Pal - student meal planner", url: "https://mealpreppal.example/", content: "MealPrep Pal plans cheap weekly meals." },
  { id: "C2", title: "Budget Bites app", url: "https://www.budgetbites.example/about", content: "Budget Bites helps students cook." },
  { id: "P1", title: "Budget Bites pricing", url: "https://budgetbites.example/pricing", content: "Budget Bites costs $4.99 per month." },
];

const raw = (competitors: unknown[], extra: Record<string, unknown> = {}) => ({
  scores: { problem_clarity: 7, market_demand: 6, execution_difficulty: 12, differentiation: -1 },
  one_liner: "Crowded, but students are underserved.",
  top_risks: ["Risk one", "Risk two", "Risk three"],
  killer_question: "Will students pay?",
  fatal_flaw: "",
  competitors,
  regulatory_flags: [],
  what_would_change_my_mind: "Ten pre-orders.",
  confidence: "high",
  ...extra,
});

Deno.test("keeps competitors backed by a search result and uses that result's URL", () => {
  const r = buildResult(raw([{ name: "MealPrep Pal", source_id: "C1", pricing: "Free", difference: "Not local deals." }]), sources, true);
  assertEquals(r.competitors.length, 1);
  assertEquals(r.competitors[0].url, "https://mealpreppal.example/");
  assertEquals(r.competitors_status, "verified");
});

Deno.test("drops competitors with no source, an unknown source, or a name the source doesn't mention", () => {
  const r = buildResult(
    raw([
      { name: "Invented Co", source_id: "", pricing: "$10", difference: "x" },
      { name: "Ghost App", source_id: "C9", pricing: "$10", difference: "x" },
      { name: "Made Up Meals", source_id: "C1", pricing: "$10", difference: "x" },
    ]),
    sources,
    true,
  );
  assertEquals(r.competitors.length, 0);
  assertEquals(r.competitors_status, "none_found");
  assertEquals(r.confidence, "medium", "no verified competitors caps confidence at medium");
});

Deno.test("only shows a price when it is backed by a pricing source", () => {
  const r = buildResult(
    raw([
      { name: "Budget Bites", source_id: "C2", pricing: "$4.99/month", pricing_source_id: "P1", difference: "x" },
      { name: "MealPrep Pal", source_id: "C1", pricing: "$2/month", difference: "x" },
    ]),
    sources,
    true,
  );
  assertEquals(r.competitors[0].pricing, "$4.99/month");
  assertEquals(r.competitors[0].pricing_url, "https://budgetbites.example/pricing");
  assertEquals(r.competitors[1].pricing, "Pricing not found in search results");
  assertEquals(r.competitors[1].pricing_url, null);
});

Deno.test("search failure means unverified competitors and low confidence", () => {
  const r = buildResult(raw([{ name: "MealPrep Pal", source_id: "C1", pricing: "", difference: "" }]), [], false);
  assertEquals(r.competitors.length, 0);
  assertEquals(r.competitors_status, "unverified");
  assertEquals(r.confidence, "low");
});

Deno.test("clamps scores to 0-10 and rounds to one decimal", () => {
  const r = buildResult(raw([]), sources, true);
  assertEquals(r.scores.execution_difficulty, 10);
  assertEquals(r.scores.differentiation, 0);
  assert(r.overall_score >= 3.5 && r.overall_score <= 3.6, "0.3*6 + 0.25*7 + 0.25*0 + 0.2*0 = 3.55");
  assertEquals(r.verdict, "KILL");
});

Deno.test("rejects output that is missing required fields", () => {
  assertThrows(() => buildResult(raw([], { scores: { problem_clarity: 7 } }), sources, true));
  assertThrows(() => buildResult(raw([], { top_risks: ["only one"] }), sources, true));
  assertThrows(() => buildResult(raw([], { killer_question: "" }), sources, true));
});

Deno.test("the verdict comes from the scores, not the model", () => {
  const r = buildResult(raw([], { verdict: "KILL", overall_score: 1, scores: { problem_clarity: 8, market_demand: 8, execution_difficulty: 5, differentiation: 6 } }), sources, true);
  assertEquals(r.overall_score, 6.9);
  assertEquals(r.verdict, "PROCEED");
});

// Sub-scores the board gave the first published samples, which all came out KILL before.
Deno.test("a crowded but real market is a PIVOT, not a KILL", () => {
  const accounting = scoreIdea({ problem_clarity: 9, market_demand: 8.2, execution_difficulty: 6.5, differentiation: 1.8 }, null);
  const dogWalking = scoreIdea({ problem_clarity: 8.5, market_demand: 9, execution_difficulty: 8.8, differentiation: 0.5 }, null);
  const studentMeals = scoreIdea({ problem_clarity: 7.5, market_demand: 4, execution_difficulty: 8, differentiation: 5.5 }, null);
  assertEquals([accounting.verdict, dogWalking.verdict, studentMeals.verdict], ["PIVOT", "PIVOT", "PIVOT"]);
});

Deno.test("weak scores or a fatal flaw are a KILL", () => {
  assertEquals(scoreIdea({ problem_clarity: 3, market_demand: 2, execution_difficulty: 8, differentiation: 3 }, null).verdict, "KILL");
  const fatal = scoreIdea({ problem_clarity: 8, market_demand: 8, execution_difficulty: 5, differentiation: 6 }, "Selling this is illegal.");
  assertEquals(fatal.verdict, "KILL");
  assertEquals(fatal.overall, 3.9);
  const r = buildResult(raw([], { fatal_flaw: "Selling this is illegal." }), sources, true);
  assertEquals([r.verdict, r.fatal_flaw], ["KILL", "Selling this is illegal."]);
});

Deno.test("precheck rejects empty, too-short and gibberish input, accepts a real idea", () => {
  assert(precheck("hi") !== null);
  assert(precheck("!!!! ???? #### $$$$ %%%% ^^^^ &&&& ****") !== null);
  assert(precheck("aaaaaaaaaaaaaaaaaaaaaaaa bbb ccc") !== null);
  assertEquals(precheck("An app that plans cheap weekly meals for students."), null);
});
