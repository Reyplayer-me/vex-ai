import { db } from "@/lib/db";

// Anonymous funnel events. Payloads carry only the event name, a random
// visitor id and the path: never idea text, emails or user ids.
export type VexEvent =
  | "page_view"
  | "idea_submitted"
  | "verdict_shown"
  | "share_card_downloaded"
  | "share_link_copied"
  | "email_submitted"
  | "full_report_requested"
  | "full_report_viewed"
  | "price_intent_yes"
  | "price_intent_maybe"
  | "price_intent_no"
  | "idea_tracker_created"
  | "return_visit_7d";

const VISITOR_KEY = "vex-visitor-id";
const FIRST_SEEN_KEY = "vex-first-seen";
const RETURN_SENT_KEY = "vex-return-7d-sent";

const safeGet = (store: Storage, key: string) => {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
};
const safeSet = (store: Storage, key: string, value: string) => {
  try {
    store.setItem(key, value);
  } catch {
    /* storage unavailable (private mode); fall back to in-memory id */
  }
};

let memoryId: string | null = null;
const newId = () => crypto.randomUUID().replace(/-/g, "");

/** Visitors who declined cookies get an id that only lasts for this tab. */
export function getVisitorId() {
  const declined = safeGet(localStorage, "vex-cookie-consent") === "declined";
  const store = declined ? sessionStorage : localStorage;
  let id = safeGet(store, VISITOR_KEY);
  if (!id) {
    id = memoryId ?? newId();
    safeSet(store, VISITOR_KEY, id);
  }
  memoryId = id;
  return id;
}

export function track(event: VexEvent) {
  const path = window.location.pathname.replace(/\/(r|idea)\/[^/]+/, "/$1/:id").slice(0, 100);
  // Fire and forget: analytics must never break the product.
  void db
    .from("analytics_events")
    .insert({ event, visitor_id: getVisitorId(), path })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.warn("track failed", event, error);
    });
}

/** Records page_view, and return_visit_7d once for visitors first seen 7+ days ago. */
export function trackVisit() {
  track("page_view");
  if (safeGet(localStorage, "vex-cookie-consent") === "declined") return;
  const now = Date.now();
  const first = Number(safeGet(localStorage, FIRST_SEEN_KEY));
  if (!first) {
    safeSet(localStorage, FIRST_SEEN_KEY, String(now));
  } else if (now - first >= 7 * 24 * 3600_000 && !safeGet(localStorage, RETURN_SENT_KEY)) {
    safeSet(localStorage, RETURN_SENT_KEY, "1");
    track("return_visit_7d");
  }
}
