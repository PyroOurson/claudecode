const SB = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const TURNSTILE = Deno.env.get('TURNSTILE_SECRET') ?? '';
const RELAY = Deno.env.get('RELAY_KEY') ?? '';
const ORIGINS = new Set(['https://gameplaygames.web.app', 'https://gameplaygames.firebaseapp.com', 'https://pyroourson.github.io', ...(Deno.env.get('EXTRA_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean)]);

const head = (origin: string) => ({
  'Access-Control-Allow-Origin': ORIGINS.has(origin) ? origin : 'https://gameplaygames.web.app',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-gp-device',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '3600',
  'Vary': 'Origin',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Content-Type': 'application/json'
});

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function challenge(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE) return true;
  if (!token || token.length > 4096) return false;
  try {
    const body = new FormData();
    body.append('secret', TURNSTILE);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const j = await r.json();
    return !!(j && j.success);
  } catch (_e) {
    return false;
  }
}

Deno.serve(async req => {
  const origin = req.headers.get('Origin') ?? '';
  const h = head(origin);
  const out = (status: number, o: Record<string, unknown>) => new Response(JSON.stringify(o), { status, headers: h });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  if (req.method !== 'POST') return out(405, { error: 'method_not_allowed' });
  if (!ORIGINS.has(origin)) return out(403, { error: 'origin_not_allowed' });
  if (!SB || !SERVICE || !ANON) return out(500, { error: 'not_configured' });
  let b: Record<string, unknown> | null = null;
  try { b = await req.json(); } catch (_e) { b = null; }
  const login = String(b?.login ?? '').trim().toLowerCase().replace(/^@/, '');
  const password = String(b?.password ?? '');
  const token = String(b?.challenge ?? '');
  if (!/^[a-z0-9_.]{3,20}$/.test(login) || !password || password.length > 200) return out(400, { error: 'invalid_credentials' });
  const relayed = !!RELAY && req.headers.get('x-gp-relay') === RELAY;
  const ip = ((relayed ? req.headers.get('x-gp-ip') : null) ?? req.headers.get('cf-connecting-ip') ?? (req.headers.get('x-forwarded-for') ?? '').split(',')[0]).trim().slice(0, 64);
  if (!(await challenge(token, ip))) return out(403, { error: 'challenge_failed' });
  const g = await fetch(SB + '/rest/v1/rpc/login_gate', {
    method: 'POST',
    headers: { apikey: SERVICE, Authorization: 'Bearer ' + SERVICE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_login: login, p_ip: ip })
  });
  const gj = await g.json().catch(() => null);
  if (!g.ok) {
    const m = String(gj?.message ?? '');
    if (/too many/i.test(m)) return out(429, { error: 'too_many_attempts' });
    if (/blocked/i.test(m)) return out(403, { error: 'access_blocked', hint: 'access_blocked', details: String(gj?.details ?? '{}') });
    return out(502, { error: 'server_error' });
  }
  const email = typeof gj === 'string' ? gj : null;
  if (!email) {
    await sleep(250 + Math.floor(Math.random() * 250));
    return out(400, { error: 'invalid_credentials' });
  }
  const t = await fetch(SB + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: Object.assign({ apikey: ANON, 'Content-Type': 'application/json' }, ip ? { 'X-Forwarded-For': ip } : {}),
    body: JSON.stringify({ email, password })
  });
  const tj = await t.json().catch(() => null);
  if (!t.ok) {
    const code = String(tj?.error_code ?? tj?.code ?? '');
    if (t.status === 429) return out(429, { error: 'too_many_attempts' });
    if (code === 'email_not_confirmed') return out(400, { error: 'email_not_confirmed' });
    return out(400, { error: 'invalid_credentials' });
  }
  return out(200, { session: { access_token: tj.access_token, refresh_token: tj.refresh_token, expires_in: tj.expires_in } });
});
