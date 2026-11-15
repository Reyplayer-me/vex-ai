// Talks to the waitlist backend function (supabase/functions/waitlist).
// In development, set VITE_WAITLIST_MOCK=true to use a local mock so every form state
// can be tried without touching the real backend. Production builds never mock.

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/waitlist`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_WAITLIST_MOCK === 'true';

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'ref'];
const ATTRIBUTION_STORAGE = 'vex-waitlist-attribution';

let attribution = {};

export function captureAttribution() {
  const url = new URL(window.location.href);
  const found = {};
  ATTRIBUTION_KEYS.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) found[key] = value.slice(0, 100);
    url.searchParams.delete(key);
  });

  if (Object.keys(found).length) {
    attribution = found;
    try {
      sessionStorage.setItem(ATTRIBUTION_STORAGE, JSON.stringify(found));
    } catch (e) {}
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    return;
  }

  try {
    attribution = JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORAGE)) || {};
  } catch (e) {
    attribution = {};
  }
}

class RequestError extends Error {
  constructor(status) {
    super(`Waitlist request failed (${status || 'network'})`);
    this.status = status;
  }
}

async function post(action, body) {
  if (USE_MOCK) return mock(action, body);
  if (!ENDPOINT) {
    console.error('REACT_APP_WAITLIST_ENDPOINT is not set');
    throw new RequestError(0);
  }

  const headers = { 'Content-Type': 'application/json' };
  if (ANON_KEY) {
    headers.apikey = ANON_KEY;
    headers.Authorization = `Bearer ${ANON_KEY}`;
  }

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...body }),
      keepalive: action === 'event',
    });
  } catch (e) {
    throw new RequestError(0);
  }
  if (!res.ok) throw new RequestError(res.status);
  return res.json();
}

// Network errors and 5xx get one automatic retry. 4xx answers are final.
async function withRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.status >= 400 && err.status < 500) throw err;
    await new Promise((r) => setTimeout(r, 600));
    return fn();
  }
}

// Resolves to { status: 'joined' | 'duplicate', token } or rejects with
// { kind: 'invalid' | 'error' }.
export async function joinWaitlist(email, honeypot) {
  try {
    return await withRetry(() => post('signup', { email, hp: honeypot, ...attribution }));
  } catch (err) {
    throw { kind: err.status === 400 ? 'invalid' : 'error' };
  }
}

export async function sendFollowup(token, note) {
  return withRetry(() => post('followup', { token, note }));
}

export function track(name) {
  post('event', { name, ...attribution }).catch(() => {});
}

// Local stand-in for the backend during development.
// Emails ending in @fail.test simulate a server error. Going offline simulates a network error.
const MOCK_STORAGE = 'vex-waitlist-mock';

async function mock(action, body) {
  await new Promise((r) => setTimeout(r, action === 'event' ? 0 : 700));

  if (action === 'event') {
    console.debug('[waitlist mock] event', body);
    return { ok: true };
  }
  if (!navigator.onLine) throw new RequestError(0);

  if (action === 'followup') {
    console.debug('[waitlist mock] follow-up', body);
    return { ok: true };
  }

  if (body.email.endsWith('@fail.test')) throw new RequestError(500);
  let emails = [];
  try {
    emails = JSON.parse(localStorage.getItem(MOCK_STORAGE)) || [];
  } catch (e) {}
  if (body.hp) return { status: 'joined', token: 'mock' };
  if (emails.includes(body.email)) return { status: 'duplicate', token: 'mock' };
  emails.push(body.email);
  try {
    localStorage.setItem(MOCK_STORAGE, JSON.stringify(emails));
  } catch (e) {}
  console.debug('[waitlist mock] signup', body);
  return { status: 'joined', token: 'mock' };
}
