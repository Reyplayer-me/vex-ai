import { Crown, Wrench, ShieldAlert, Brain, Telescope } from "lucide-react";
import type { AdvisorRole } from "@/types/verdict";

// The only five advisors Vex uses, everywhere.
export const advisors: { name: AdvisorRole; icon: typeof Crown; line: string; color: string; bg: string; border: string }[] = [
  { name: "CEO", icon: Crown, line: "Cuts through the noise. Asks if this is a business.", color: "text-advisor-ceo", bg: "bg-advisor-ceo/10", border: "border-advisor-ceo/40" },
  { name: "Execution Officer", icon: Wrench, line: "Finds the smallest thing you can actually ship.", color: "text-advisor-execution", bg: "bg-advisor-execution/10", border: "border-advisor-execution/40" },
  { name: "Risk Analyst", icon: ShieldAlert, line: "Finds the assumption that could sink it.", color: "text-advisor-risk", bg: "bg-advisor-risk/10", border: "border-advisor-risk/40" },
  { name: "Psychologist", icon: Brain, line: "Calls out the bias behind your conviction.", color: "text-advisor-psychologist", bg: "bg-advisor-psychologist/10", border: "border-advisor-psychologist/40" },
  { name: "Industry Expert", icon: Telescope, line: "Checks what the market already knows.", color: "text-advisor-industry", bg: "bg-advisor-industry/10", border: "border-advisor-industry/40" },
];

export const advisorByName = (name: string) => advisors.find((a) => a.name === name) ?? advisors[0];
