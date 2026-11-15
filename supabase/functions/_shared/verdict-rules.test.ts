// Run with: deno test supabase/functions/_shared/verdict-rules.test.ts
import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildResult, precheck } from "./verdict-rules.ts";

const sources = [
  { id: "C1", title: "MealPrep Pal - student meal planner", url: "https://mealpreppal.example/", content: "MealPrep Pal plans cheap weekly meals." },
  { id: "C2", title: "Budget Bites app", url: "https://www.budgetbites.example/about", content: "Budget Bites helps students cook." },
  { id: "P1", title: "Budget Bites pricing", url: "https://budgetbites.example/pricing", content: "Budget Bites costs $4.99 per month." },
];

const raw = (competitors: unknown[], extra: Record<string, unknown> = {}) => ({
  verdict: "PIVOT",
  overall_score: 5.44,
  scores: { problem_clarity: 7, market_demand: 6, execution_difficulty: 12, differentiation: -1 },
  one_liner: "Crowded, but students are underserved.",
  top_risks: ["Risk one", "Risk two", "Risk three"],
  killer_question: "Will students pay?",
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
  assertEquals(r.overall_score, 5.4);
  assertEquals(r.scores.execution_difficulty, 10);
  assertEquals(r.scores.differentiation, 0);
});

Deno.test("rejects output that is missing required fields", () => {
  assertThrows(() => buildResult(raw([], { verdict: "MAYBE" }), sources, true));
  assertThrows(() => buildResult(raw([], { top_risks: ["only one"] }), sources, true));
  assertThrows(() => buildResult(raw([], { killer_question: "" }), sources, true));
});

Deno.test("precheck rejects empty, too-short and gibberish input, accepts a real idea", () => {
  assert(precheck("hi") !== null);
  assert(precheck("!!!! ???? #### $$$$ %%%% ^^^^ &&&& ****") !== null);
  assert(precheck("aaaaaaaaaaaaaaaaaaaaaaaa bbb ccc") !== null);
  assertEquals(precheck("An app that plans cheap weekly meals for students."), null);
});
