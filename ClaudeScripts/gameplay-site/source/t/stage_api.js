const fs = require('fs');
const conf = () => {
  const f = process.env.STAGE_JSON;
  const o = f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
  return { url: (process.env.STAGE_SB_URL || o.API_URL || 'http://127.0.0.1:54321').replace(/\/+$/, ''), key: process.env.STAGE_SB_KEY || o.PUBLISHABLE_KEY || o.ANON_KEY, service: process.env.STAGE_SERVICE_KEY || o.SERVICE_ROLE_KEY || o.SECRET_KEY };
};
async function call(path, { method = 'POST', body, token, key } = {}) {
  const c = conf(), k = key || c.key, h = { apikey: k, 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token; else if (/^eyJ/.test(k)) h.Authorization = 'Bearer ' + k;
  const r = await fetch(c.url + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  const t = await r.text();
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
  if (!r.ok) { const e = new Error((j && (j.message || j.msg || j.error_description || j.error)) || 'HTTP ' + r.status); e.status = r.status; e.body = j; throw e; }
  return j;
}
const login = (email, password) => call('/auth/v1/token?grant_type=password', { body: { email, password } });
const signup = (email, password, data) => call('/auth/v1/signup', { body: { email, password, data } });
const rpc = (name, body, token) => call('/rest/v1/rpc/' + name, { body: body || {}, token });
const rest = (path, o) => call('/rest/v1/' + path, o);
module.exports = { conf, call, login, signup, rpc, rest };
if (require.main === module) {
  const [cmd, ...a] = process.argv.slice(2);
  (async () => {
    if (cmd === 'login') { const s = await login(a[0], a[1]); console.log(JSON.stringify({ uid: s.user.id, token: s.access_token })); }
    else if (cmd === 'rpc') { const s = a[2] ? await login(a[2], a[3]) : null; console.log(JSON.stringify(await rpc(a[0], JSON.parse(a[1] || '{}'), s && s.access_token), null, 1)); }
    else console.log('usage: stage_api.js login <email> <password> | rpc <name> <json> [email password]');
  })().catch(e => { console.error('ERROR', e.status || '', e.message, JSON.stringify(e.body || '')); process.exit(1); });
}
