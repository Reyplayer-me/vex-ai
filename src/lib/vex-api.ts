import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "@/lib/analytics";
import { db } from "@/lib/db";
import { quickVerdictSchema, type FullReport, type IdeaRecord, type QuickVerdict } from "@/types/verdict";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GENERIC_ERROR = "Something went wrong on our side. Please try again.";

export { db };

export class VexApiError extends Error {
  constructor(public code: string, message: string, public retryable = false) {
    super(message);
  }
}

async function headers() {
  const { data } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    apikey: ANON_KEY,
    Authorization: `Bearer ${data.session?.access_token ?? ANON_KEY}`,
  };
}

// Codes our functions return with a user-facing message. Anything else (gateway
// or platform errors) gets the generic message so raw technical text never shows.
const KNOWN_CODES = new Set(["invalid_input", "rejected_input", "rate_limited", "unauthorized", "not_found", "busy", "internal"]);

async function errorFrom(res: Response) {
  try {
    const body = await res.json();
    if (KNOWN_CODES.has(body?.error) && typeof body.message === "string") {
      return new VexApiError(body.error, body.message, res.status >= 500);
    }
  } catch {
    /* not JSON */
  }
  console.error("Vex function error", res.status);
  return new VexApiError("internal", GENERIC_ERROR, res.status >= 500 || res.status === 404);
}

async function callFunction<T>(name: string, payload: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${FUNCTIONS_URL}/${name}`, { method: "POST", headers: await headers(), body: JSON.stringify(payload) });
  } catch {
    throw new VexApiError("network", "We couldn't reach Vex. Check your connection and try again.", true);
  }
  if (!res.ok) throw await errorFrom(res);
  return res.json();
}

// ---------- Free verdict ----------

export type RunStage = "screening" | "searching" | "board" | "checking" | "cached";

export interface RunResult {
  id: string;
  createdAt: string;
  claimToken: string | null;
  result: QuickVerdict;
}

async function streamVerdict(idea: string, audience: string, onStage: (s: RunStage) => void): Promise<RunResult> {
  let res: Response;
  try {
    res = await fetch(`${FUNCTIONS_URL}/quick-verdict`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify({ idea, audience, visitorId: getVisitorId() }),
    });
  } catch {
    throw new VexApiError("network", "We couldn't reach Vex. Check your connection and try again.", true);
  }
  if (!res.ok || !res.body) throw await errorFrom(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let split: number;
    while ((split = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);
      const event = block.match(/^event: (.+)$/m)?.[1];
      const data = block.match(/^data: (.+)$/m)?.[1];
      if (!event || !data) continue;
      const payload = JSON.parse(data);
      if (event === "stage") onStage(payload.stage);
      if (event === "error") throw new VexApiError(payload.error, payload.message ?? GENERIC_ERROR, !!payload.retryable);
      if (event === "result") {
        const parsed = quickVerdictSchema.safeParse(payload.result);
        if (!parsed.success) throw new VexApiError("invalid_result", GENERIC_ERROR, true);
        return { ...payload, result: parsed.data };
      }
    }
  }
  throw new VexApiError("incomplete", "The connection dropped before the board finished.", true);
}

/** Runs the free verdict, retrying once automatically on retryable failures. */
export async function runQuickVerdict(idea: string, audience: string, onStage: (s: RunStage) => void) {
  try {
    return await streamVerdict(idea, audience, onStage);
  } catch (err) {
    if (err instanceof VexApiError && err.retryable) {
      onStage("screening");
      return streamVerdict(idea, audience, onStage);
    }
    throw err;
  }
}

// ---------- Anonymous runs kept on this device ----------

const RUNS_KEY = "vex-runs";

export interface LocalRun extends RunResult {
  idea: string;
  audience: string;
}

export function loadLocalRuns(): Record<string, LocalRun> {
  try {
    return JSON.parse(localStorage.getItem(RUNS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveLocalRun(run: LocalRun) {
  try {
    const runs = loadLocalRuns();
    runs[run.id] = run;
    const recent = Object.values(runs).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
    localStorage.setItem(RUNS_KEY, JSON.stringify(Object.fromEntries(recent.map((r) => [r.id, r]))));
  } catch {
    /* storage unavailable: the result still shows for this page view */
  }
}

export function forgetLocalRuns(ids: string[]) {
  try {
    const runs = loadLocalRuns();
    ids.forEach((id) => delete runs[id]);
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
  } catch {
    /* ignore */
  }
}

// ---------- Ownership, sharing, full report ----------

/** Attaches this device's anonymous runs (and any emailed ones) to the signed-in account. */
export async function claimIdeas() {
  const runs = Object.values(loadLocalRuns()).filter((r) => r.claimToken);
  const { claimed } = await callFunction<{ claimed: string[] }>("idea-actions", {
    action: "claim",
    items: runs.map((r) => ({ id: r.id, token: r.claimToken })),
  });
  forgetLocalRuns(claimed);
  return claimed;
}

export const rememberEmail = (id: string, token: string, email: string) =>
  callFunction<{ ok: true }>("idea-actions", { action: "remember_email", id, token, email });

export const shareIdea = (id: string, token: string | null, image?: string) =>
  callFunction<{ shareId: string }>("idea-actions", { action: "share", id, token, image });

export const unshareIdea = (id: string, token: string | null) =>
  callFunction<{ ok: true }>("idea-actions", { action: "unshare", id, token });

export const deleteMyData = () => callFunction<{ ok: true }>("idea-actions", { action: "delete_my_data" });

/** Generates (or reloads) the full report; retries once if the server failed. */
export async function requestFullReport(ideaId: string, technical: boolean) {
  const call = () => callFunction<{ report: FullReport; technical: boolean; reused: boolean }>("full-report", { ideaId, technical });
  try {
    return await call();
  } catch (err) {
    if (err instanceof VexApiError && err.retryable) return call();
    throw err;
  }
}

export async function fetchIdea(id: string): Promise<IdeaRecord | null> {
  const { data, error } = await db
    .from("ideas")
    .select("id, idea, audience, result, full_report, technical_founder, share_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new VexApiError("internal", "We couldn't load that idea. Please refresh.", true);
  return data;
}

export const shareUrl = (shareId: string) => `${window.location.origin}/r/${shareId}`;
