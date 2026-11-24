// Run with: deno test supabase/functions/_shared/run-limits.test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ANON_IP_DAILY, RUN_LIMITS, runLimitPlan } from "./run-limits.ts";

Deno.test("anonymous visitors get 10 runs a day by visitor id, with an IP backstop", () => {
  assertEquals(RUN_LIMITS.anon, 10);
  const plan = runLimitPlan(null, false, "visitor-hash", "ip-hash");
  assertEquals(plan, { keys: ["v:visitor-hash", "ip:ip-hash"], limits: [10, ANON_IP_DAILY] });
});

Deno.test("signed-in users get 30 runs a day, counted by user id", () => {
  assertEquals(RUN_LIMITS.user, 30);
  const plan = runLimitPlan("user-123", false, "visitor-hash", "ip-hash");
  assertEquals(plan, { keys: ["u:user-123"], limits: [30] });
});

Deno.test("admins skip the daily cap entirely", () => {
  assertEquals(runLimitPlan("admin-1", true, "visitor-hash", "ip-hash"), null);
});
