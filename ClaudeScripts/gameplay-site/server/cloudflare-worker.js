const UPSTREAM = 'uafouyvtcijptspjbsqf.supabase.co';
const PATHS = /^\/(rest|auth|realtime|storage|functions|graphql)\/v1(\/|$)/;
const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
const ORIGINS = new Set(['https://gameplaygames.web.app', 'https://gameplaygames.firebaseapp.com', 'https://pyroourson.github.io']);
let turnCache = null;
const turnUsers = new Map();

async function turn(request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = { 'Access-Control-Allow-Origin': ORIGINS.has(origin) ? origin : 'https://gameplaygames.web.app', 'Vary': 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Type': 'application/json' };
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: Object.assign({ 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, apikey', 'Access-Control-Max-Age': '86400' }, headers) });
  }
  if (request.method !== 'GET') {
    return new Response('{"error":"method not allowed"}', { status: 405, headers });
  }
  if (!ORIGINS.has(origin)) {
    return new Response('{"error":"origin not allowed"}', { status: 403, headers });
  }
  if (!env || !env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) {
    return new Response('{"iceServers":[]}', { headers });
  }
  const now = Date.now();
  const auth = request.headers.get('Authorization') || '', key = request.headers.get('apikey') || '';
  if (!/^Bearer [A-Za-z0-9._-]{20,4000}$/.test(auth) || !key || key.length > 400) {
    return new Response('{"error":"sign in first"}', { status: 401, headers });
  }
  const seen = turnUsers.get(auth);
  if (!seen || seen < now) {
    if (turnUsers.size > 5000) turnUsers.clear();
    let ok = false;
    try {
      const u = await fetch('https://' + UPSTREAM + '/auth/v1/user', { headers: { Authorization: auth, apikey: key } });
      ok = u.ok;
    } catch (e) {}
    if (!ok) {
      return new Response('{"error":"sign in first"}', { status: 401, headers });
    }
    turnUsers.set(auth, now + 600000);
  }
  if (turnCache && turnCache.until > now) {
    return new Response(turnCache.body, { headers });
  }
  try {
    const r = await fetch('https://rtc.live.cloudflare.com/v1/turn/keys/' + env.TURN_KEY_ID + '/credentials/generate-ice-servers', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.TURN_KEY_API_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl: 86400 })
    });
    if (!r.ok) {
      return new Response('{"iceServers":[]}', { headers });
    }
    const j = await r.json();
    const list = (Array.isArray(j.iceServers) ? j.iceServers : j.iceServers ? [j.iceServers] : []).map(s => {
      const urls = (Array.isArray(s.urls) ? s.urls : [s.urls]).filter(u => typeof u === 'string' && !/:53(\?|$)/.test(u));
      return { urls, username: s.username, credential: s.credential };
    }).filter(s => s.urls.length);
    const body = JSON.stringify({ iceServers: list });
    turnCache = { until: now + 3600000, body };
    return new Response(body, { headers });
  } catch (e) {
    return new Response('{"iceServers":[]}', { headers });
  }
}

const bans = new Map();

async function banCheck(ip, request, env) {
  const now = Date.now(), c = bans.get(ip);
  if (c && c.until > now) return c.blocked;
  let blocked = null;
  try {
    const key = request.headers.get('apikey') || env.ANON_KEY || '';
    if (key) {
      const r = await fetch('https://' + UPSTREAM + '/rest/v1/rpc/access_status', { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json', 'X-GP-Relay': env.RELAY_KEY, 'X-GP-IP': ip, 'X-Forwarded-For': ip }, body: '{}' });
      if (r.ok) {
        const j = await r.json();
        if (j && j.blocked) blocked = { kind: j.kind, until: j.until };
      }
    }
  } catch (e) {}
  if (bans.size > 20000) bans.clear();
  bans.set(ip, { blocked, until: now + 60000 });
  return blocked;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (url.pathname === '/turn') {
      return turn(request, env);
    }
    if (!PATHS.test(url.pathname)) {
      return new Response('gameplay relay', { status: 404, headers: { 'X-Content-Type-Options': 'nosniff' } });
    }
    if (!METHODS.has(request.method)) {
      return new Response('method not allowed', { status: 405 });
    }
    url.protocol = 'https:';
    url.hostname = UPSTREAM;
    url.port = '';
    const headers = new Headers(request.headers);
    headers.delete('Host');
    headers.delete('X-Forwarded-Host');
    headers.delete('X-Real-IP');
    headers.delete('Forwarded');
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) headers.set('X-Forwarded-For', ip); else headers.delete('X-Forwarded-For');
    headers.delete('X-GP-Relay');
    headers.delete('X-GP-IP');
    headers.delete('X-GP-Country');
    headers.delete('X-GP-Region');
    if (env && env.RELAY_KEY && ip) {
      headers.set('X-GP-Relay', env.RELAY_KEY);
      headers.set('X-GP-IP', ip);
      if (request.cf && request.cf.country) headers.set('X-GP-Country', String(request.cf.country));
      if (request.cf && request.cf.regionCode) headers.set('X-GP-Region', String(request.cf.regionCode).slice(0, 8));
      if (request.method !== 'OPTIONS' && /^\/(auth|storage)\/v1\//.test(url.pathname)) {
        const blocked = await banCheck(ip, request, env);
        if (blocked) {
          const origin = request.headers.get('Origin') || '';
          return new Response(JSON.stringify({ message: 'Access blocked', hint: 'access_blocked', details: JSON.stringify(blocked), error: 'access_blocked', msg: 'Access blocked' }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGINS.has(origin) ? origin : 'https://gameplaygames.web.app', 'Vary': 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
        }
      }
    }
    const init = { method: request.method, headers, redirect: 'manual' };
    if (request.method !== 'GET' && request.method !== 'HEAD') init.body = request.body;
    return fetch(new Request(url.toString(), init));
  }
};
