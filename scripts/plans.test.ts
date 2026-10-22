import { describe, expect, test } from "bun:test";
import { planAvailability, planDestination } from "../src/lib/plans";

describe("Paid plan availability", () => {
  test("Professional remains paid and locked", () => {
    expect(planAvailability.professional).toMatchObject({ monthly: "$29", annually: "$24", comingSoon: true });
    expect(planDestination("professional")).toBe("/plans/professional");
  });
  test("Enterprise remains paid and locked", () => {
    expect(planAvailability.enterprise).toMatchObject({ monthly: "$39", annually: "$32", comingSoon: true });
    expect(planDestination("enterprise")).toBe("/plans/enterprise");
  });
  test("Starter remains free and available", () => {
    expect(planAvailability.starter).toMatchObject({ monthly: "Free", annually: "Free", comingSoon: false });
    expect(planDestination("starter")).toBe("/auth?mode=signup");
  });
});