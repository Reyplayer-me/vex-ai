// Run with: deno test supabase/functions/_shared/verdict-rules.test.ts
import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildResult, fitBand, precheck, scoreIdea } from "./verdict-rules.ts";

const sources = [
  { id: "C1", title: "MealPrep Pal - student meal planner", url: "https://mealpreppal.example/", content: "MealPrep Pal plans cheap weekly meals." },
  { id: "C2", title: "Budget Bites app", url: "https://www.budgetbites.example/about", content: "Budget Bites helps students cook." },
  { id: "P1", title: "Budget Bites pricing", url: "https://budgetbites.example/pricing", content: "Budget Bites costs $4.99 per month." },
];

const raw = (competitors: unknown[], extra: Record<string, unknown> = {}) => ({
  band: "needs_change",
  overall_score: 5.44,
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

Deno.test("clamps sub-scores to 0-10 and rounds the overall to one decimal", () => {
  const r = buildResult(raw([]), sources, true);
  assertEquals(r.scores.execution_difficulty, 10);
  assertEquals(r.scores.differentiation, 0);
  assertEquals(r.overall_score, 5.4);
  assertEquals(r.verdict, "PIVOT");
});

Deno.test("rejects output that is missing required fields", () => {
  assertThrows(() => buildResult(raw([], { scores: { problem_clarity: 7 } }), sources, true));
  assertThrows(() => buildResult(raw([], { overall_score: "high" }), sources, true));
  assertThrows(() => buildResult(raw([], { top_risks: ["only one"] }), sources, true));
  assertThrows(() => buildResult(raw([], { killer_question: "" }), sources, true));
});

const strong = { problem_clarity: 8.5, market_demand: 8, execution_difficulty: 4, differentiation: 7 };

Deno.test("verdict bands: under 4 KILL, 4-6.9 PIVOT, 7+ PROCEED", () => {
  assertEquals(scoreIdea(2.8, strong, null).verdict, "KILL");
  assertEquals(scoreIdea(4, strong, null).verdict, "PIVOT");
  assertEquals(scoreIdea(6.9, strong, null).verdict, "PIVOT");
  assertEquals(scoreIdea(7, strong, null).verdict, "PROCEED");
  assertEquals(scoreIdea(9.1, strong, null).overall, 9.1);
});

Deno.test("the score stays inside the band the board chose", () => {
  assertEquals(fitBand(6.5, "unlikely"), 3.9);
  assertEquals(fitBand(2, "likely"), 7);
  assertEquals(fitBand(7.6, "likely"), 7.6);
  assertEquals(fitBand(7.6, "made_up"), 7.6);
  const r = buildResult(raw([], { band: "unlikely", overall_score: 6 }), sources, true);
  assertEquals([r.overall_score, r.verdict], [3.9, "KILL"]);
});

// The accounting sample: strong problem and demand, but differentiation 2.5. It came out PROCEED 6.5 before.
Deno.test("no PROCEED for a near-copy, no demand, or mostly weak parts", () => {
  const accounting = { problem_clarity: 9, market_demand: 8.5, execution_difficulty: 4.5, differentiation: 2.5 };
  assertEquals(scoreIdea(7.8, accounting, null), { overall: 6.9, verdict: "PIVOT" });
  assertEquals(scoreIdea(7.5, { ...strong, market_demand: 2 }, null).verdict, "PIVOT");
  const mostlyWeak = { problem_clarity: 6, market_demand: 6, execution_difficulty: 8, differentiation: 7 };
  assertEquals(scoreIdea(7.5, mostlyWeak, null).verdict, "PIVOT");
});

Deno.test("a fatal flaw is always a KILL", () => {
  assertEquals(scoreIdea(8, strong, "Selling this is illegal."), { overall: 3.9, verdict: "KILL" });
  const r = buildResult(raw([], { band: "likely", overall_score: 7.5, fatal_flaw: "Selling this is illegal." }), sources, true);
  assertEquals([r.verdict, r.fatal_flaw], ["KILL", "Selling this is illegal."]);
});

Deno.test("precheck rejects empty, too-short and gibberish input, accepts a real idea", () => {
  assert(precheck("hi") !== null);
  assert(precheck("!!!! ???? #### $$$$ %%%% ^^^^ &&&& ****") !== null);
  assert(precheck("aaaaaaaaaaaaaaaaaaaaaaaa bbb ccc") !== null);
  assertEquals(precheck("An app that plans cheap weekly meals for students."), null);
});
