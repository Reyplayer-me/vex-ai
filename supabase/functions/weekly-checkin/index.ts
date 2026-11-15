// Daily job: clean up stale data, then send the weekly "Did you test your top
// assumption?" email to users who opted in (at most one per user per week).
// Call once a day from a scheduler with header `x-cron-secret: $CRON_SECRET`.
// Sends through Resend; does nothing until RESEND_API_KEY and CHECKIN_FROM_EMAIL are set.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, fail, json, serviceClient } from "../_shared/vex.ts";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://vex-ai.lovable.app";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return fail("unauthorized");

  const db = serviceClient();
  const { error: cleanupError } = await db.rpc("cleanup_stale_data");
  if (cleanupError) console.error("weekly-checkin: cleanup failed", cleanupError.message);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("CHECKIN_FROM_EMAIL");
  if (!resendKey || !from) return json({ sent: 0, skipped: "email sender not configured" });

  const weekAgo = new Date(Date.now() - 6.5 * 24 * 3600_000).toISOString();
  const { data: profiles, error } = await db
    .from("profiles")
    .select("user_id, email, last_checkin_sent_at")
    .eq("weekly_checkin", true)
    .or(`last_checkin_sent_at.is.null,last_checkin_sent_at.lt.${weekAgo}`)
    .limit(200);
  if (error) {
    console.error("weekly-checkin: profile query failed", error.message);
    return fail("internal");
  }

  let sent = 0;
  for (const p of profiles ?? []) {
    const { data: open } = await db
      .from("assumptions")
      .select("text, idea_id")
      .eq("user_id", p.user_id)
      .eq("done", false)
      .order("created_at")
      .limit(1);
    const top = open?.[0];
    if (!top) continue;

    const link = `${SITE_URL}/idea/${top.idea_id}`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: p.email,
        subject: "Did you test your top assumption this week?",
        html: `<p>Quick check-in from Vex.</p>
<p>Your top open assumption:<br><strong>${escapeHtml(top.text)}</strong></p>
<p>Did you test it this week? <a href="${link}">Tick it off or update it</a>.</p>
<p style="color:#666;font-size:12px">You get this because you turned on weekly check-ins. <a href="${SITE_URL}/ideas#settings">Turn them off</a> in one click.</p>`,
      }),
    });
    if (res.ok) {
      sent++;
      await db.from("profiles").update({ last_checkin_sent_at: new Date().toISOString() }).eq("user_id", p.user_id);
    } else {
      console.error("weekly-checkin: send failed", res.status);
    }
  }
  return json({ sent });
});
