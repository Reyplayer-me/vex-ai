// Waitlist backend: signup, optional follow-up note, anonymous events.
// Deploy with: supabase functions deploy waitlist --no-verify-jwt
// Secrets: WAITLIST_IP_SALT (any long random string), WAITLIST_ALLOWED_ORIGIN (e.g. https://vex-ai.lovable.app)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const IP_SALT = Deno.env.get('WAITLIST_IP_SALT') ?? '';
const ALLOWED_ORIGIN = Deno.env.get('WAITLIST_ALLOWED_ORIGIN') ?? '*';
const SIGNUPS_PER_HOUR = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const EVENTS = new Set([
  'waitlist_view',
  'waitlist_submitted',
  'waitlist_duplicate',
  'waitlist_followup_sent',
  'waitlist_example_next',
]);

const cors = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  Vary: 'Origin',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function clip(value: unknown, max = 100) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
}

function attribution(body: Record<string, unknown>) {
  return {
    utm_source: clip(body.utm_source),
    utm_medium: clip(body.utm_medium),
    utm_campaign: clip(body.utm_campaign),
    ref: clip(body.ref),
  };
}

async function signup(req: Request, body: Record<string, unknown>) {
  // Honeypot filled: answer like a normal signup and store nothing.
  if (body.hp) return json(200, { status: 'joined', token: crypto.randomUUID() });

  const email = String(body.email ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(400, { error: 'invalid_email' });

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const ipHash = await sha256(`${IP_SALT}:${ip}`);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from('waitlist_rate_limit')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  if (countError) throw countError;
  if ((count ?? 0) >= SIGNUPS_PER_HOUR) return json(429, { error: 'rate_limited' });

  const { error: limitError } = await supabase.from('waitlist_rate_limit').insert({ ip_hash: ipHash });
  if (limitError) throw limitError;

  const token = crypto.randomUUID();
  const { error } = await supabase
    .from('waitlist')
    .insert({ email, followup_token_hash: await sha256(token), ...attribution(body) });

  // Duplicates get a token that matches no row, so a follow-up for them is accepted and discarded.
  if (error?.code === '23505') return json(200, { status: 'duplicate', token: crypto.randomUUID() });
  if (error) throw error;

  return json(200, { status: 'joined', token });
}

async function followup(body: Record<string, unknown>) {
  const token = clip(body.token, 64);
  const note = clip(body.note, 500);
  if (token && note) {
    const { error } = await supabase
      .from('waitlist')
      .update({ idea_note: note })
      .eq('followup_token_hash', await sha256(token))
      .is('idea_note', null);
    if (error) throw error;
  }
  return json(200, { ok: true });
}

async function event(body: Record<string, unknown>) {
  const name = String(body.name ?? '');
  if (!EVENTS.has(name)) return json(400, { error: 'unknown_event' });
  const { error } = await supabase.from('waitlist_events').insert({ name, ...attribution(body) });
  if (error) throw error;
  return json(200, { ok: true });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'bad_request' });
  }

  try {
    switch (body.action) {
      case 'signup':
        return await signup(req, body);
      case 'followup':
        return await followup(body);
      case 'event':
        return await event(body);
      default:
        return json(400, { error: 'unknown_action' });
    }
  } catch (err) {
    console.error(`waitlist ${String(body.action)} failed`, err);
    return json(500, { error: 'server_error' });
  }
});
