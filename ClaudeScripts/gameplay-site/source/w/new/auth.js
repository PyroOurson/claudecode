function gpNetWrap(g, net) {
  if (!net || typeof net !== 'object' || net.__gpt) return net;
  try {
    ['room', 'lobby'].forEach(k => {
      const f = net[k];
      if (typeof f !== 'function') return;
      net[k] = function (...a) {
        const r = f.apply(this, a);
        if (r && typeof r.then === 'function') r.then(v => { if (!v) return; const pl = v.players; track('online_party', { game: g.id, kind: k, role: typeof v === 'string' ? v : v.role || null, size: v.size || (k === 'lobby' ? 2 : null), players: Array.isArray(pl) ? pl.length : typeof pl === 'number' ? pl : null }); }, () => {});
        return r;
      };
    });
    net.__gpt = 1;
  } catch (e) {}
  return net;
}

['load', 'error'].forEach(t => document.addEventListener(t, e => { const m = e.target; if (m && m.tagName === 'IMG') m.classList.add('ld'); }, true));
const SB_STORE = 'sb-gameplay-auth', SYK = 'gameplay:sync', VIDK = 'gameplay:vid', SAVE_P = 'gameplay:save:';
const UN_RE = /^[a-z0-9_.]{3,20}$/, UN_NEW = /^[a-z0-9_.]{4,20}$/, GID_RE = /^[a-z0-9][a-z0-9-]{0,39}$/, EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sbBase = () => PATH_MODE ? location.origin + '/' : location.origin + location.pathname;
const sbRedirect = kind => sbBase() + '?gpauth=' + kind;
const SB_RET = (() => {
  if (!SB.on) return null;
  try {
    const u = new URL(location.href), q = u.searchParams;
    if (!q.has('gpauth')) return null;
    const hp = new URLSearchParams(/^#[a-z_]+=/.test(location.hash) ? location.hash.slice(1) : '');
    const r = { kind: q.get('gpauth'), code: q.get('code'), err: q.get('error_description') || q.get('error') || hp.get('error_description') || hp.get('error') };
    ['gpauth', 'code', 'error', 'error_code', 'error_description', 'state'].forEach(k => q.delete(k));
    let back = null;
    try { back = sessionStorage.getItem('gameplay:authback'); sessionStorage.removeItem('gameplay:authback'); } catch (e) {}
    const qs = q.toString();
    let url = u.pathname + (qs ? '?' + qs : '') + (hp.toString() ? '' : u.hash);
    if (back && back.charAt(0) === '/' && back.charAt(1) !== '/' && (PATH_MODE || back.split('#')[0].split('?')[0] === u.pathname)) url = back;
    history.replaceState(null, '', url);
    return r;
  } catch (e) { return null; }
})();
const syNew = () => ({ base: { p: {}, t: {}, b: {} }, saves: {}, pend: null, uid: null, at: 0 });
let SY = syNew();
if (SB.on) { try { const o = JSON.parse(localStorage.getItem(SYK)); if (o && typeof o === 'object' && o.base && typeof o.base === 'object') { SY = Object.assign(syNew(), o); ['p', 't', 'b'].forEach(k => { if (!SY.base[k] || typeof SY.base[k] !== 'object') SY.base[k] = {}; }); if (!SY.saves || typeof SY.saves !== 'object') SY.saves = {}; } } catch (e) {} }
function sySave() { if (!SB.on) return; try { localStorage.setItem(SYK, JSON.stringify(SY)); } catch (e) {} }
const syNum = v => typeof v === 'number' && isFinite(v) ? v : 0;
const syUuid = () => {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
};
function syHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + '.' + s.length; }
const utf8Len = s => { try { return new TextEncoder().encode(s).length; } catch (e) { return s.length * 3; } };
const sbHasSession = () => { try { return !!localStorage.getItem(SB_STORE); } catch (e) { return false; } };
const sbTok = () => { const s = SB.session; return s && s.access_token && (!s.expires_at || s.expires_at * 1000 > Date.now() + 20000) ? s.access_token : null; };

function sbLib() {
  if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
  if (SB.lib) return SB.lib;
  return SB.lib = new Promise((res, rej) => {
    const urls = [libUrl(SUPABASE_JS_FILE)].concat(SUPABASE_JS);
    const tryAt = i => {
      if (i >= urls.length) { SB.lib = null; rej(new Error('Sign-in could not load')); return; }
      const s = document.createElement('script');
      s.src = urls[i]; s.async = true; s.crossOrigin = 'anonymous';
      if (SUPABASE_SRI) s.integrity = SUPABASE_SRI;
      s.onload = () => { if (window.supabase && window.supabase.createClient) res(window.supabase); else { s.remove(); tryAt(i + 1); } };
      s.onerror = () => { s.remove(); tryAt(i + 1); };
      document.head.append(s);
    };
    tryAt(0);
  });
}
function sbClient() {
  if (SB.p) return SB.p;
  const p = SB.p = sbLib().then(lib => {
    if (!SB.c) {
      SB.c = lib.createClient(SBN.best(), SUPABASE_ANON_KEY, { global: { fetch: SBN.fetch }, realtime: Object.assign({ worker: true, logger: (k, m, d) => { if (DIAG.on && k !== 'push' && k !== 'receive') DIAG.ev('rt', { k: String(k), m: String(m).slice(0, 200), d: d == null ? undefined : String(typeof d === 'object' ? (d.message || d.reason || d.code || d.type || '') : d).slice(0, 160) }); } }, SBN.WS ? { transport: SBN.WS } : {}), auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true, storageKey: SB_STORE } });
      SB.c.auth.onAuthStateChange((ev, s) => setTimeout(() => auSession(ev, s), 0));
    }
    return SB.c;
  });
  p.catch(() => { if (SB.p === p) SB.p = null; });
  return p;
}
async function sbRest(path, o = {}) {
  let tok = null;
  if (o.auth !== false && !SB.c && SB.opt && !o.keep) { try { await sbClient(); } catch (e) {} }
  if (o.auth !== false && SB.c) {
    if (o.keep) tok = sbTok();
    else { try { const r = await SB.c.auth.getSession(); tok = r && r.data && r.data.session ? r.data.session.access_token : null; } catch (e) { tok = sbTok(); } }
  }
  const h = { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', Accept: 'application/json' };
  if (tok) h.Authorization = 'Bearer ' + tok;
  else if (/^eyJ/.test(SUPABASE_ANON_KEY)) h.Authorization = 'Bearer ' + SUPABASE_ANON_KEY;
  if (o.prefer) h.Prefer = o.prefer;
  const body = o.body === undefined ? undefined : JSON.stringify(o.body);
  const r = await SBN.fetch(SBN.url('/rest/v1/' + path), { method: o.method || 'GET', headers: h, body, keepalive: !!o.keep && (!body || body.length < 60000), credentials: 'omit', cache: 'no-store' });
  if (!r.ok) {
    let j = null;
    try { j = await r.json(); } catch (e) {}
    const err = new Error((j && (j.message || j.msg || j.error)) || 'HTTP ' + r.status);
    err.status = r.status; err.code = j && j.code; err.hint = j && j.hint; err.details = j && j.details;
    throw err;
  }
  if (r.status === 204) return null;
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

const sbLimit = e => !!e && (e.status === 429 || e.code === 'PT429' || /rate_limited/.test(e.message || ''));
const sbWait = e => { const m = /retry_after=(\d+)/.exec(e && e.hint || ''); return m ? Math.max(1, Math.min(86400, +m[1])) : 0; };
const sbMissing = e => !!e && (e.code === 'PGRST202' || e.code === '42883' || e.status === 404 || /could not find the function/i.test(e.message || ''));
function sbLimitText(e, what) {
  const s = sbWait(e) || 30, t = s >= 3600 ? auT('{n} h').replace('{n}', Math.ceil(s / 3600)) : s >= 60 ? auT('{n} min').replace('{n}', Math.ceil(s / 60)) : auT('{n} s').replace('{n}', s);
  return auT('Slow down a little: {what}. Try again in {t}.').replace('{what}', auT(what)).replace('{t}', t);
}
function sbVid() {
  try {
    const st = ckStore();
    let v = st.getItem(VIDK);
    if (!/^[a-z0-9]{4,40}$/.test(v || '')) { v = (rid() + rid()).replace(/[^a-z0-9]/g, '').slice(0, 32); st.setItem(VIDK, v); }
    return v;
  } catch (e) { return null; }
}
function sbRow(x, uid, vid, dv) {
  const p = x.p && typeof x.p === 'object' && !Array.isArray(x.p) ? x.p : {};
  const js = JSON.stringify(p);
  const props = utf8Len(js) + 4 * Object.keys(p).length > 3600 ? { truncated: true, keys: Object.keys(p).slice(0, 24).join(',').slice(0, 300) } : p;
  const sid = String(x.s || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
  const ev = String(x.e || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').slice(0, 40);
  if (sid.length < 4 || !ev) return null;
  const t = syNum(x.t), at = t > 0 && t < 8.6e15 ? t : Date.now();
  return { client_at: new Date(at).toISOString(), session_id: sid, visitor_id: vid, user_id: uid && x.u === uid ? uid : null, event: ev, game_id: typeof p.game === 'string' && GID_RE.test(p.game) ? p.game : null, props, device: dv };
}
async function sbSink(batch) {
  const uid = SB.user && sbTok() ? SB.user.id : null;
  const vid = sbVid(), dv = device().type;
  const rows = batch.map(x => sbRow(x, uid, vid, dv)).filter(Boolean);
  if (!rows.length) return;
  try { await sbRest('analytics_events', { method: 'POST', body: rows, prefer: 'return=minimal', auth: !!uid, keep: true }); }
  catch (e) { if (e.status === 400 || e.status === 409 || e.status === 413 || e.status === 422) return; throw e; }
}

function syRows() {
  const B = SY.base, rows = [];
  new Set([...Object.keys(S.plays), ...Object.keys(S.time), ...Object.keys(S.best)]).forEach(id => {
    if (!GID_RE.test(id)) return;
    const dp = Math.max(0, Math.floor(syNum(S.plays[id]) - syNum(B.p[id])));
    const dt = Math.max(0, Math.floor((syNum(S.time[id]) - syNum(B.t[id])) * 10) / 10);
    const b = S.best[id], nb = typeof b === 'number' && isFinite(b) && Math.abs(b) < 1e15 && b !== B.b[id] ? b : null;
    if (!dp && dt < 1 && nb == null) return;
    const g = byId.get(id), last = syNum(S.last[id]);
    rows.push({ game_id: id, plays: Math.min(dp, 100000), seconds: Math.min(dt, 604800), best: nb, better: g && g.better === 'low' ? 'low' : 'high', last_played: last > 0 ? new Date(Math.min(last, Date.now())).toISOString() : null });
  });
  return rows.slice(0, 300);
}
function syAck(pend) {
  const B = SY.base;
  (pend.rows || []).forEach(r => {
    B.p[r.game_id] = syNum(B.p[r.game_id]) + syNum(r.plays);
    B.t[r.game_id] = syNum(B.t[r.game_id]) + syNum(r.seconds);
    if (r.best != null) B.b[r.game_id] = r.best;
  });
}
function syApply(sent, rows) {
  const B = SY.base, sentBy = {}, srv = {};
  sent.forEach(r => { sentBy[r.game_id] = r; });
  rows.forEach(r => { if (r && typeof r.game_id === 'string' && GID_RE.test(r.game_id)) srv[r.game_id] = r; });
  const ids = new Set([...Object.keys(S.plays), ...Object.keys(S.time), ...Object.keys(S.best), ...Object.keys(B.p), ...Object.keys(B.t), ...Object.keys(B.b), ...Object.keys(srv)]);
  ids.forEach(id => {
    const r = srv[id], s = sentBy[id] || {};
    const sp = r ? syNum(r.plays) : 0, st = r ? syNum(r.seconds_played) : 0;
    const up = Math.max(0, syNum(S.plays[id]) - syNum(B.p[id]) - syNum(s.plays));
    const ut = Math.max(0, syNum(S.time[id]) - syNum(B.t[id]) - syNum(s.seconds));
    if (sp + up > 0) S.plays[id] = sp + up; else delete S.plays[id];
    if (st + ut > 0) S.time[id] = st + ut; else delete S.time[id];
    if (sp) B.p[id] = sp; else delete B.p[id];
    if (st) B.t[id] = st; else delete B.t[id];
    const lb = S.best[id], rb = r && typeof r.best_score === 'number' ? r.best_score : null;
    const g = byId.get(id), low = r ? r.best_better === 'low' : !!(g && g.better === 'low');
    const unsent = typeof lb === 'number' && lb !== B.b[id] && lb !== s.best;
    if (rb != null) { S.best[id] = unsent ? (low ? Math.min(lb, rb) : Math.max(lb, rb)) : rb; B.b[id] = rb; }
    else { if (!unsent) delete S.best[id]; delete B.b[id]; }
    if (r && r.last_played) { const t = Date.parse(r.last_played); if (t && t > syNum(S.last[id])) S.last[id] = t; }
  });
  const keep = id => S.plays[id] || S.time[id] || S.best[id] != null;
  S.recent = uniq(S.recent.concat(Object.keys(S.last).filter(id => S.last[id]))).filter(id => keep(id) && byId.has(id)).sort((a, b) => syNum(S.last[b]) - syNum(S.last[a])).slice(0, 8);
  save();
}
function syLocalSaves() {
  const out = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(SAVE_P)) { const id = k.slice(SAVE_P.length); if (GID_RE.test(id)) out[id] = localStorage.getItem(k); } } } catch (e) {}
  return out;
}
function syUpBody(uid, ids, loc) {
  const body = [], M = SY.saves;
  ids.forEach(id => {
    const s = loc[id];
    let data;
    try { data = JSON.parse(s); } catch (e) { return; }
    if (data === null || data === undefined) return;
    if (utf8Len(s) > 240000) { M[id] = Object.assign(M[id] || {}, { big: syHash(s) }); return; }
    body.push({ user_id: uid, game_id: id, data });
  });
  return body;
}
function syWipe() {
  try { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && (k.startsWith(SAVE_P) || k === 'gameplay:profile' || k === 'gameplay:netname')) ks.push(k); } ks.forEach(k => localStorage.removeItem(k)); } catch (e) {}
  S.best = {}; S.plays = {}; S.time = {}; S.last = {}; S.daily = {}; S.recent = []; S.since = Date.now();
  save();
  SY = syNew(); sySave();
}
const SYP = {};
const syPullDue = id => !!(SB.on && SB.user && GID_RE.test(id) && navigator.onLine !== false && (!SY.uid || SY.uid === SB.user.id) && Date.now() - syNum(SYP[id]) > 60000 && Date.now() - syNum(SY.at) > 60000);
function syPull(id) {
  if (!syPullDue(id)) return Promise.resolve();
  const uid = SB.user.id;
  let live = true;
  const job = (async () => {
    const rows = await sbRest('game_saves?select=game_id,data,updated_at&game_id=eq.' + id);
    if (!live || !SB.user || SB.user.id !== uid || (SY.uid && SY.uid !== uid)) return;
    SYP[id] = Date.now();
    const r = rows && rows[0], t = r ? Date.parse(r.updated_at) || 0 : 0, M = SY.saves, m = M[id];
    if (!t || (m && t <= syNum(m.at) + 1)) return;
    let loc = null;
    try { loc = localStorage.getItem(SAVE_P + id); } catch (e) {}
    if (loc != null && (!m || m.h !== syHash(loc)) && ((m && m.d) || syNum(S.last[id])) >= t && !(m && m.hold)) return;
    const d = JSON.stringify(r.data);
    try { localStorage.setItem(SAVE_P + id, d); } catch (e) { return; }
    M[id] = { h: syHash(d), at: t, d: 0 }; sySave();
  })().catch(() => {});
  return Promise.race([job, new Promise(r => setTimeout(() => { live = false; r(); }, 2500))]);
}
function sySavesKeep(uid) {
  if (!SY.at) return;
  const loc = syLocalSaves(), M = SY.saves;
  const ids = Object.keys(loc).filter(id => { const h = syHash(loc[id]), m = M[id]; return !(m && (m.h === h || m.big === h || m.hold)); });
  const body = syUpBody(uid, ids, loc);
  if (!body.length || JSON.stringify(body).length > 50000) return;
  sbRest('game_saves?on_conflict=user_id,game_id', { method: 'POST', body, prefer: 'resolution=merge-duplicates,return=minimal', keep: true }).catch(() => {});
}
async function sySaves(uid) {
  const loc = syLocalSaves(), M = SY.saves, now = Date.now();
  Object.keys(loc).forEach(id => {
    const h = syHash(loc[id]), m = M[id];
    if (!m) M[id] = { h: '', at: 0, d: syNum(S.last[id]) || 1 };
    else if (m.h === h) m.d = 0;
    else if (!m.d) m.d = now;
  });
  const remote = await sbRest('game_saves?select=game_id,updated_at');
  if (!SB.user || SB.user.id !== uid) return;
  const R = {};
  (remote || []).forEach(r => { const t = Date.parse(r.updated_at); if (r && GID_RE.test(r.game_id) && t) R[r.game_id] = t; });
  const up = [], down = [];
  new Set([...Object.keys(loc), ...Object.keys(R), ...Object.keys(M)]).forEach(id => {
    const m = M[id], has = id in loc, h = has ? syHash(loc[id]) : '', r = R[id];
    if (has && m && m.big === h) return;
    const dirty = has && (!m || m.h !== h), rnew = !!r && (!m || r > syNum(m.at) + 1);
    if (dirty && rnew) { const lt = (m && m.d) || syNum(S.last[id]); (m && m.hold ? down : lt >= r ? up : down).push(id); }
    else if (dirty) up.push(id);
    else if (rnew) down.push(id);
    else if (!r && m && m.at && has && !dirty && !(cur && cur.g.id === id)) { try { localStorage.removeItem(SAVE_P + id); } catch (e) {} delete M[id]; }
    else if (!r && !has && m) delete M[id];
  });
  const dl = down.filter(id => !(cur && cur.g.id === id));
  if (cur && down.indexOf(cur.g.id) >= 0) (M[cur.g.id] || (M[cur.g.id] = { h: '', at: 0, d: 0 })).hold = R[cur.g.id];
  if (dl.length) {
    const rows = await sbRest('game_saves?select=game_id,data,updated_at&game_id=in.(' + dl.join(',') + ')');
    (rows || []).forEach(r => {
      if (!r || !GID_RE.test(r.game_id)) return;
      const s = JSON.stringify(r.data);
      try { localStorage.setItem(SAVE_P + r.game_id, s); } catch (e) { return; }
      M[r.game_id] = { h: syHash(s), at: Date.parse(r.updated_at) || now, d: 0 };
    });
  }
  const body = syUpBody(uid, up, loc);
  for (let i = 0; i < body.length; i += 20) {
    const part = body.slice(i, i + 20);
    const res = await sbRest('game_saves?on_conflict=user_id,game_id&select=game_id,updated_at', { method: 'POST', body: part, prefer: 'resolution=merge-duplicates,return=representation' });
    (res || []).forEach(r => { if (r && loc[r.game_id] != null) M[r.game_id] = { h: syHash(loc[r.game_id]), at: Date.parse(r.updated_at) || now, d: 0 }; });
  }
}
function syRefresh(before) {
  if (JSON.stringify(S.recent) !== before && view === 'home' && !cur && !pend) renderHome();
  if (cur) setBest(cur.g);
  if (openK === 'mstats') renderStats();
  if (openK === 'mprofile') { $('#pcg').textContent = Object.keys(S.plays).filter(id => byId.has(id)).length; $('#pcr').textContent = Object.keys(S.best).filter(id => byId.has(id)).length; }
}
function syAdopt() {
  if (!SB.on || SY.pend || !SY.uid) return false;
  let o = null;
  try { o = JSON.parse(localStorage.getItem(SYK) || 'null'); } catch (e) {}
  if (!o || typeof o !== 'object' || !o.base || typeof o.base !== 'object' || o.uid !== SY.uid || !(syNum(o.at) > syNum(SY.at))) return false;
  const B = SY.base, nb = {};
  ['p', 't', 'b'].forEach(k => { nb[k] = o.base[k] && typeof o.base[k] === 'object' ? o.base[k] : {}; });
  [['p', S.plays], ['t', S.time]].forEach(([k, m]) => {
    new Set([...Object.keys(m), ...Object.keys(B[k]), ...Object.keys(nb[k])]).forEach(id => {
      const v = syNum(nb[k][id]) + Math.max(0, syNum(m[id]) - syNum(B[k][id]));
      if (v > 0) m[id] = v; else delete m[id];
    });
  });
  Object.keys(nb.b).forEach(id => { if (S.best[id] == null || S.best[id] === B.b[id]) S.best[id] = nb.b[id]; });
  const held = {};
  Object.keys(SY.saves).forEach(id => { if (SY.saves[id] && SY.saves[id].hold) held[id] = SY.saves[id]; });
  SY.base = nb; SY.at = syNum(o.at);
  if (o.saves && typeof o.saves === 'object') SY.saves = Object.assign({}, o.saves, held);
  return true;
}
function syNudge(ms = 4000) { if (!SB.user) return; clearTimeout(SB.t); SB.t = setTimeout(() => sySync(), ms); }
async function sySync(o = {}) {
  if (!SB.user || !SB.c) return;
  if (SB.syncing) { SB.again = true; return; }
  const uid = SB.user.id;
  if (o.keep && !sbTok()) return;
  SB.syncing = true; clearTimeout(SB.t);
  const before = JSON.stringify(S.recent);
  try {
    if (cur && !o.keep) ttCommit(false);
    syAdopt();
    if (SY.uid !== uid) { if (SY.uid) syWipe(); const keepM = SY.saves; SY.pend = null; SY.uid = uid; SY.saves = SY.at ? {} : keepM; SY.at = 0; }
    if (!SY.pend) { const rows = syRows(); if (rows.length) SY.pend = { id: syUuid(), uid, rows }; }
    sySave();
    if (o.keep) {
      sySavesKeep(uid);
      if (!SY.pend) return;
    }
    const sent = SY.pend;
    const res = await sbRest('rpc/sync_game_stats', { method: 'POST', body: { p_batch: sent ? sent.id : null, p_rows: sent ? sent.rows : [] }, keep: !!o.keep });
    if (!SB.user || SB.user.id !== uid) return;
    syApply(sent ? sent.rows : [], Array.isArray(res) ? res : []);
    if (SY.pend === sent) SY.pend = null;
    sySave();
    if (!o.keep) await sySaves(uid);
    SY.at = Date.now(); SB.fail = 0; sySave();
    syRefresh(before);
  } catch (e) {
    SB.fail = Math.min(SB.fail + 1, 6);
    sySave();
    if (SB.user && !o.keep) { clearTimeout(SB.t); SB.t = setTimeout(() => sySync(), 5000 * Math.pow(2, SB.fail)); }
  } finally {
    SB.syncing = false;
    if (SB.again) { SB.again = false; syNudge(1500); }
    if (openK === 'mstats' && $('#stbody .sk')) renderStats();
    auSyncNote();
  }
}

const auState = () => !SB.on ? 'off' : SB.user ? 'in' : 'out';
const auT = s => window.gpI18n ? gpI18n.t(s) : s;
const auLocked = () => SB.on && !SB.user && !SB.guest;
const auCoarse = () => !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
function auMsg(id, m, kind) { const n = $('#' + id); if (!n) return; const set = () => { n.textContent = m || ''; n.className = 'note' + (kind ? ' ' + kind : ''); }; if (n.closest('#aucard') && (n.textContent || '') !== (m || '')) auMorph(set); else set(); }
function auShake(el) { if (!el) return; el.classList.remove('au-shake'); void el.offsetWidth; el.classList.add('au-shake'); }
function auErrText(e) {
  const m = String(e && (e.message || e.error_description || e) || ''), c = String(e && e.code || '');
  if (c === 'invalid_credentials' || /invalid login credentials/i.test(m)) return 'Wrong email, username or password.';
  if (c === 'email_not_confirmed' || /email not confirmed/i.test(m)) return 'Confirm your email first: type the code we sent you.';
  if (c === 'user_already_exists' || /already registered|already exists/i.test(m)) return 'An account with this email already exists. Log in instead.';
  if (c === 'same_password' || /different from the old/i.test(m)) return 'Choose a password that is different from your current one.';
  if (c === 'weak_password' || /password should/i.test(m)) return 'Choose a stronger password: at least 8 characters.';
  if (c === 'email_address_invalid' || /invalid format|email address .* is invalid/i.test(m)) return 'This email address is not valid.';
  if (c === 'email_exists' || /email address has already been registered/i.test(m)) return 'Another account already uses this email.';
  if (c === 'otp_expired' || /expired|link is invalid/i.test(m)) return 'This link has expired or was already used. Ask for a new one.';
  if (c === 'over_email_send_rate_limit' || /email rate limit|after \d+ seconds/i.test(m)) return 'Too many emails were sent. Wait a minute and try again.';
  if (/rate limit|too many|429/i.test(m + c) || (e && e.status === 429)) return 'Too many attempts. Wait a few minutes and try again.';
  if (/not authorized|email_address_not_authorized/i.test(m + ' ' + c)) return 'We cannot send emails to this address yet. Try again later.';
  if (c === 'provider_disabled' || /provider is not enabled|unsupported provider/i.test(m)) return 'This sign-in method is not available yet.';
  if (/access_denied|cancel/i.test(m)) return 'Sign-in was cancelled.';
  if (/failed to fetch|networkerror|load failed|could not load|network/i.test(m)) return 'Cannot reach the sign-in service. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
function auSyncNote() {
  const el = $('#ausync');
  if (!el || !SB.user) return;
  el.textContent = SB.fail ? 'Waiting for a connection. Your progress is kept on this device until then.' : SY.at ? auT('Records and saves synced {t}.').replace('{t}', new Date(SY.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : 'Your records and saves are kept in your account.';
}
function auRender() {
  const st = auState();
  document.querySelectorAll('[data-au]').forEach(el => { el.hidden = !el.dataset.au.split(' ').includes(st); });
  if (SB.user) {
    const u = SB.user, am = u.app_metadata || {}, provs = Array.isArray(am.providers) ? am.providers : [am.provider || 'email'];
    $('#auwho').textContent = u.email || 'Signed in';
    $('#auvia').textContent = provs.includes('google') ? (provs.includes('email') ? 'Google and email password' : 'Signed in with Google') : 'Signed in with email';
    if (document.activeElement !== $('#auem2')) $('#auem2').value = u.email || '';
    $('#aupwl').textContent = provs.includes('email') ? 'New password' : 'Set a password';
    auSyncNote();
  }
  renderProfileBits();
  if (openK === 'friends') frOpen();
}
function auGoogleUi() {
  const ok = !!(SB.on && !(SB.set && SB.set.external && SB.set.external.google === false));
  if (ok && gisWanted()) gisPaint();
  document.querySelectorAll('[data-auth="google"]').forEach(b => { if (!b.classList.contains('is-busy')) b.disabled = !ok; b.title = ok ? '' : 'Coming soon'; const em = b.querySelector('em'); if (em) em.hidden = ok; if (b.classList.contains('btn2')) b.textContent = ok ? 'Continue' : 'Coming soon'; });
}
function auSettings() {
  if (!SB.on || SB.set) return;
  if (!SB.gs) SB.gs = SBN.fetch(SBN.url('/auth/v1/settings'), { headers: { apikey: SUPABASE_ANON_KEY }, credentials: 'omit', cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null).then(j => { SB.gs = null; if (j && j.external) { SB.set = j; auGoogleUi(); } });
}
const AU_ORD = ['in', 'up', 'reset', 'check', 'newpass', 'wait'], AU_E = 'cubic-bezier(.22,.8,.2,1)';
const auKey = v => v === 'main' ? (SB.mode === 'up' ? 'up' : 'in') : v;
const auNote = () => SB.view === 'main' ? (SB.mode === 'up' ? 'auupnote' : 'aunote') : { reset: 'arnote', newpass: 'annote', check: 'acnote' }[SB.view] || 'aunote';
function auSettle() {
  const c = $('#aucard');
  if (!c) return;
  clearTimeout(SB.mt);
  c.getAnimations().forEach(a => a.cancel());
  c.querySelectorAll('.au-v').forEach(v => { v.getAnimations().forEach(a => a.cancel()); if (v.classList.contains('au-out')) { v.hidden = true; v.classList.remove('au-out'); v.style.top = ''; } });
  c.classList.remove('au-morph');
}
function auMorph(fn) {
  const c = $('#aucard');
  if (!c || openK !== 'mauth' || !motionOK() || c.classList.contains('au-morph')) { fn(); return; }
  const h0 = c.offsetHeight;
  fn();
  const h1 = c.offsetHeight;
  if (Math.abs(h1 - h0) < 2) return;
  c.classList.add('au-morph');
  const a = c.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 240, easing: AU_E });
  a.onfinish = a.oncancel = () => c.classList.remove('au-morph');
}
function auView(v) {
  SB.view = v;
  const k = auKey(v), c = $('#aucard');
  const from = c.querySelector('.au-v:not([hidden]):not(.au-out)'), to = c.querySelector('[data-auview="' + k + '"]');
  document.querySelectorAll('#aumodal .au-eye[aria-pressed="true"]').forEach(b => auEye(b, true));
  if (from !== to) {
    if (c.classList.contains('au-morph') || c.querySelector('.au-out')) auSettle();
    const anim = !!from && !SB.still && motionOK() && openK === 'mauth' && !$('#aumodal').hidden;
    const h0 = anim ? c.offsetHeight : 0, top = anim ? from.offsetTop : 0;
    c.querySelectorAll('.au-v').forEach(el => { el.hidden = el !== to; });
    if (anim) {
      const h1 = c.offsetHeight, d = AU_ORD.indexOf(k) > AU_ORD.indexOf(from.dataset.auview) ? 1 : -1;
      from.hidden = false; from.classList.add('au-out'); from.style.top = top + 'px';
      c.classList.add('au-morph');
      c.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 320, easing: AU_E });
      from.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-d * 26) + 'px)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
      to.animate([{ opacity: 0, transform: 'translateX(' + (d * 26) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 290, delay: 60, easing: AU_E, fill: 'backwards' });
      SB.mt = setTimeout(auSettle, 360);
    }
  }
  auResendTick();
}
function auFocus() {
  const f = { newpass: '#anpass', reset: '#aremail', check: '#accode', main: SB.mode === 'up' ? '#auupemail' : '#auemail' }[SB.view], n = f && $(f);
  if (n && SB.on && !auCoarse() && openK === 'mauth') n.focus({ preventScroll: true });
}
function auDown() {
  let n = $('#audown');
  clearTimeout(SB.dt);
  if (!window.__gpSbDown || SB.user) {
    if (n) n.hidden = true;
    SB.df = 0;
    if (SB.guest && !SB.user) { SB.guest = false; if (cur || pend) { closeGame(); showView('home'); renderHome(); } toast('The sign-in service works again: log in or create an account to keep playing.'); auGate(); }
    return;
  }
  if (!SB.guest) {
    if (!n) {
      n = document.createElement('div'); n.id = 'audown'; n.className = 'au-off au-dn'; n.setAttribute('role', 'status');
      n.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><div><b>Cannot reach the sign-in service from this network yet.</b><span>It keeps trying in the background. If it lasts, </span><a target="_blank" rel="noopener">run a connection check</a><button class="btn2 au-gst" type="button" hidden>Play without an account for now</button></div>';
      n.querySelector('a').href = PATH_MODE ? '/check' : 'gameplay/check.html';
      n.querySelector('button').addEventListener('click', auGuest);
      $('#auoff').after(n);
    }
    n.hidden = false;
    n.querySelector('button').hidden = (SB.df || 0) < 2;
  }
  SB.dt = setTimeout(() => SBN.fetch(SBN.url('/auth/v1/health'), { headers: { apikey: SUPABASE_ANON_KEY }, cache: 'no-store', credentials: 'omit' }).catch(() => {}).then(() => { if (window.__gpSbDown) SB.df = (SB.df || 0) + 1; auSettings(); auDown(); }), SB.guest ? 20000 : 8000);
}
function auGuest() {
  if (!window.__gpSbDown || SB.user) return;
  SB.guest = true;
  track('auth', { act: 'guest' });
  closeAll();
  toast('You can play without an account until the sign-in service can be reached. Then you will need to log in.');
  auDown();
}
function auShow() {
  if (SB.first) SB.first = false; else $('#aumodal').classList.remove('au-first');
  $('#auoff').hidden = SB.on;
  auDown();
  if (SB.on) { sbClient().catch(() => {}); auSettings(); if (gisWanted()) requestAnimationFrame(() => gisPaint()); }
  ['aunote', 'auupnote', 'arnote', 'annote', 'acnote'].forEach(id => auMsg(id, ''));
  document.querySelectorAll('#aumodal .au-err').forEach(e => auFieldErr(e.closest('.fld').querySelector('input'), ''));
  SB.still = true;
  auView(['newpass', 'reset', 'check', 'wait'].includes(SB.view) ? SB.view : 'main');
  SB.still = false;
  auBusy(false);
  setTimeout(auFocus, 80);
}
function auOpen(v, msg, kind, mode) {
  if (mode) SB.mode = mode;
  if (openK !== 'mauth') { SB.view = v; setOpen('mauth'); } else auView(v);
  if (msg) auMsg(auNote(), msg, kind);
}
function auBusy(on) {
  const m = $('#aumodal');
  document.querySelectorAll('#aumodal .au-card button, #aumodal .au-card input').forEach(b => { b.disabled = on || (!SB.on && !b.closest('[data-aumode]')); });
  m.classList.toggle('au-busy', !!on);
  m.querySelectorAll('.au-go.is-busy').forEach(b => b.classList.remove('is-busy'));
  const v = m.querySelector('.au-v:not([hidden]):not(.au-out)'), g = v && v.querySelector('.au-go');
  if (on && g) { g.classList.add('is-busy'); g.setAttribute('aria-busy', 'true'); } else m.querySelectorAll('.au-go[aria-busy]').forEach(b => b.removeAttribute('aria-busy'));
  if (!on) { auGoogleUi(); auResendTick(); }
}
function auFieldErr(inp, m) {
  if (!inp) return;
  const f = inp.closest('.fld');
  let e = f && f.querySelector('.au-err');
  if (!m && !e && !inp.hasAttribute('aria-invalid')) return;
  auMorph(() => {
    if (!m) { if (e) e.remove(); inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); return; }
    if (!e) { e = document.createElement('div'); e.className = 'au-err'; e.id = inp.id + '-err'; f.append(e); }
    e.textContent = m;
    inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', e.id);
  });
}
function auBad(id, m) {
  const n = $('#' + id);
  if (!n) return;
  auFieldErr(n, m);
  auShake(n.closest('.fld') || n);
  n.focus({ preventScroll: true });
}
function auGate() {
  if (!auLocked() || openK === 'mauth') return;
  if (openK) { const k = openK; openK = null; const el = $(MENUS[k][0]); if (el) vis(el, false); }
  const w = SB.rt || (!SB.chk && sbHasSession());
  if (w && !SB.gw) { SB.gw = 1; setTimeout(auGate, 250); return; }
  SB.view = w ? 'wait' : 'main';
  if (SB.view === 'main') SB.mode = SB.mode === 'up' ? 'up' : 'in';
  setOpen('mauth');
  clearTimeout(SB.gt);
  if (SB.view === 'wait') SB.gt = setTimeout(() => { if (auLocked() && openK === 'mauth' && SB.view === 'wait') { SB.rt = false; SB.chk = true; auView('main'); } }, 12000);
}
function auWait(on) {
  clearTimeout(SB.wt);
  document.documentElement.classList.toggle('au-wait', !!on);
  if (on) SB.wt = setTimeout(() => auWait(false), 10000);
}
async function auGoogle(b) {
  if (!SB.on) return;
  if (gisWanted()) { gisPaint(); return; }
  const inModal = openK === 'mauth';
  if (b) { b.classList.add('is-busy'); b.disabled = true; }
  if (inModal) auMsg(auNote(), '');
  try {
    try { sessionStorage.setItem('gameplay:authback', location.pathname + location.search + location.hash); } catch (e) {}
    const c = await sbClient();
    track('auth', { act: 'google' });
    const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: sbRedirect('google'), queryParams: { prompt: 'select_account' } } });
    if (error) throw error;
    setTimeout(() => { if (b) { b.classList.remove('is-busy'); auGoogleUi(); } }, 8000);
  } catch (e) {
    if (b) { b.classList.remove('is-busy'); auGoogleUi(); }
    if (inModal) auMsg(auNote(), auErrText(e), 'bad'); else toast(auErrText(e));
  }
}
const GIS = { p: null, n: '', on: false };
const gisWanted = () => !!(SB.on && SBN.best() !== SUPABASE_DIRECT && GOOGLE_CLIENT_ID && !(SB.set && SB.set.external && SB.set.external.google === false));
function gisLib() {
  if (window.google && google.accounts && google.accounts.id) return Promise.resolve(google.accounts.id);
  if (GIS.p) return GIS.p;
  return GIS.p = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => window.google && google.accounts && google.accounts.id ? res(google.accounts.id) : rej(new Error('Google sign-in could not load'));
    s.onerror = () => { s.remove(); GIS.p = null; rej(new Error('Google sign-in could not load')); };
    document.head.append(s);
  });
}
async function gisNonce() {
  const raw = rid() + rid() + rid() + rid();
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)));
  GIS.n = raw;
  return Array.from(h, b => b.toString(16).padStart(2, '0')).join('');
}
async function gisInit() {
  const id = await gisLib();
  id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: gisDone, nonce: await gisNonce(), ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, itp_support: true, context: 'signin' });
  GIS.on = true;
  return id;
}
async function gisPaint() {
  if (!gisWanted()) return;
  let id;
  try { id = GIS.on ? google.accounts.id : await gisInit(); } catch (e) { return; }
  document.querySelectorAll('[data-auth="google"]').forEach(b => {
    let w = b.nextElementSibling;
    if (!w || !w.classList.contains('au-gis')) { w = document.createElement('div'); w.className = 'au-gis' + (b.classList.contains('btn2') ? ' au-gis-s' : ''); b.after(w); }
    const wd = b.classList.contains('btn2') ? 200 : Math.round(Math.min(400, Math.max(200, (b.parentElement && b.parentElement.clientWidth) || b.offsetWidth || 340)));
    if (w.dataset.w === String(wd) && w.firstChild) { b.style.display = 'none'; return; }
    w.dataset.w = String(wd); w.textContent = '';
    try { id.renderButton(w, { type: 'standard', theme: 'outline', size: b.classList.contains('btn2') ? 'medium' : 'large', text: 'continue_with', shape: 'rectangular', logo_alignment: 'center', width: wd }); b.style.display = 'none'; }
    catch (e) { w.remove(); b.style.display = ''; }
  });
}
async function gisDone(r) {
  const inModal = openK === 'mauth';
  if (inModal) auMsg(auNote(), '');
  auWait(true);
  try {
    if (!r || !r.credential) throw new Error('Google sign-in was cancelled');
    const c = await sbClient();
    track('auth', { act: 'google', via: 'relay' });
    SB.loud = true;
    const { error } = await c.auth.signInWithIdToken({ provider: 'google', token: r.credential, nonce: GIS.n });
    if (error) throw error;
  } catch (e) {
    SB.loud = false;
    auWait(false);
    if (inModal) auMsg(auNote(), auErrText(e), 'bad'); else toast(auErrText(e));
  }
  try { google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: gisDone, nonce: await gisNonce(), ux_mode: 'popup', auto_select: false, itp_support: true, context: 'signin' }); } catch (e) {}
}
const AU_REQ = [['8+ characters', v => v.length >= 8], ['1 letter', v => /\p{L}/u.test(v)], ['1 number', v => /\d/.test(v)]];
const auPwOk = v => AU_REQ.every(r => r[1](v));
function auReqs(inp) {
  const box = inp && document.querySelector('.au-reqs[data-for="' + inp.id + '"]');
  if (!box) return;
  box.classList.toggle('idle', !inp.value && !box.classList.contains('tried'));
  [...box.children].forEach((el, i) => { const ok = AU_REQ[i][1](inp.value), was = el.classList.contains('ok'); el.classList.toggle('ok', ok); el.classList.toggle('pop', ok && !was); });
}
const UN_A = ['swift', 'lucky', 'pixel', 'turbo', 'cosmic', 'sneaky', 'mighty', 'frosty', 'sunny', 'rapid', 'clever', 'neon'], UN_B = ['fox', 'otter', 'panda', 'falcon', 'tiger', 'comet', 'ninja', 'wizard', 'rocket', 'koala', 'lynx', 'gamer'];
const unHue = v => { let h = 7; for (let i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) % 360; return h; };
function unIdeas(seed) {
  const base = String(seed || '').toLowerCase().split('@')[0].replace(/[^a-z0-9_.]/g, '').replace(/^\.+|\.+$/g, '').replace(/\.\.+/g, '.').slice(0, 12);
  const r = a => a[Math.floor(Math.random() * a.length)], n = () => String(10 + Math.floor(Math.random() * 90)), out = [];
  if (base.length >= 3) { out.push(base + n()); out.push((base + '_' + r(UN_B)).slice(0, 20)); }
  for (let k = 0; out.length < 4 && k < 30; k++) { const v = r(UN_A) + '_' + r(UN_B) + (Math.random() < .5 ? n() : ''); if (out.indexOf(v) < 0 && v.length <= 20) out.push(v); }
  return out.slice(0, 4);
}
function unChips(o, show) {
  if (!o.sug) return;
  o.sug.innerHTML = show ? '<span>' + esc(auT('Try')) + '</span>' + unIdeas(o.seed ? o.seed() : o.inp.value).map(x => '<button type="button" class="au-unc" data-un="' + esc(x) + '" translate="no">' + esc(x) + '</button>').join('') : '';
}
function unLive(o) {
  const v = o.inp.value.trim().toLowerCase();
  if (o.av) { o.av.textContent = (v.replace(/[^a-z0-9]/g, '').charAt(0) || '?').toUpperCase(); o.av.style.setProperty('--h', String(unHue(v))); }
  if (o.pv) o.pv.textContent = '@' + (v || 'username');
  if (o.cnt) o.cnt.textContent = v.length + '/20';
  const set = (k, t) => { o.st.className = 'au-unst' + (k ? ' ' + k : ''); o.st.textContent = t ? auT(t) : ''; o.state = k; };
  clearTimeout(o.t); o.seq = (o.seq || 0) + 1;
  if (!v) { set('', ''); unChips(o, !!o.idle); return; }
  if (v.length < 4) { set('warn', 'At least 4 characters'); return; }
  if (!UN_NEW.test(v) || /^\.|\.$|\.\./.test(v)) { set('bad', 'Letters, numbers, dots and underscores only'); return; }
  if (o.cur && o.cur() === v) { set('', ''); return; }
  if (!SB.on) { set('', ''); return; }
  set('wait', 'Checking…');
  const my = o.seq;
  o.t = setTimeout(async () => {
    try {
      const free = await sbRest('rpc/username_available', { method: 'POST', body: { p_name: v }, auth: o.auth });
      if (my !== o.seq || o.inp.value.trim().toLowerCase() !== v) return;
      set(free ? 'ok' : 'bad', free ? 'Available' : 'Already taken');
      unChips(o, !free);
    } catch (e) { if (my === o.seq) set('', ''); }
  }, 350);
}
const UN_UP = {}, UN_MO = {};
function unWire() {
  Object.assign(UN_UP, { inp: $('#auuser'), st: $('#auunst'), av: $('#auunav'), sug: $('#auuns'), auth: false, seed: () => $('#auupemail').value || $('#auuser').value });
  Object.assign(UN_MO, { inp: $('#unew'), st: $('#unst'), av: $('#unav'), sug: $('#unsug'), pv: $('#unpv'), cnt: $('#unn0'), idle: true, cur: () => SB.prof && SB.prof.username || '', seed: () => $('#unew').value || (SB.prof && SB.prof.display_name) || (SB.user && SB.user.email) || getProfile().username || '' });
  [UN_UP, UN_MO].forEach(o => {
    if (!o.inp || !o.sug) return;
    o.sug.addEventListener('click', e => { const b = e.target.closest('[data-un]'); if (!b) return; e.preventDefault(); e.stopPropagation(); o.inp.value = b.dataset.un; o.inp.dispatchEvent(new Event('input', { bubbles: true })); if (!auCoarse()) o.inp.focus(); });
  });
  UN_MO.inp.addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; auMsg('unerr', ''); unLive(UN_MO); });
  if (window.MutationObserver) new MutationObserver(() => { if (!$('#unmodal').hidden) unLive(UN_MO); }).observe($('#unmodal'), { attributes: true, attributeFilter: ['hidden'] });
}
function auUserCheck() { unLive(UN_UP); }
async function auLogin() {
  if (!SB.on) return;
  const id = $('#auemail').value.trim(), pw = $('#aupass').value;
  auMsg('aunote', '');
  if (!id) return auBad('auemail', 'Enter your email or username.');
  if (id.includes('@') && !EMAIL_RE.test(id)) return auBad('auemail', 'Enter a valid email address.');
  if (!pw) return auBad('aupass', 'Enter your password.');
  auBusy(true);
  let email = id;
  try {
    const c = await sbClient();
    if (!id.includes('@')) {
      const un = id.toLowerCase().replace(/^@/, '');
      email = UN_RE.test(un) ? await sbRest('rpc/login_email', { method: 'POST', body: { p_login: un, p_password: pw }, auth: false }) : null;
      if (!email) throw { code: 'invalid_credentials' };
    }
    SB.loud = true;
    const r = await c.auth.signInWithPassword({ email, password: pw });
    if (r.error) throw r.error;
    track('auth', { act: 'signin', by: id.includes('@') ? 'email' : 'username' });
    auWait(true);
    $('#aupass').value = ''; closeAll();
  } catch (e) {
    SB.loud = false;
    if (e && (e.code === 'email_not_confirmed' || /email not confirmed/i.test(e.message || ''))) { auCheck(email, 'signup', false); auMsg('acnote', 'Confirm your email first: type the code we sent you, or send a new one.', 'bad'); }
    else auMsg('aunote', auErrText(e), 'bad');
  }
  finally { auBusy(false); }
}
async function auSignup() {
  if (!SB.on) return;
  const id = $('#auupemail').value.trim(), id2 = $('#auupemail2').value.trim(), pw = $('#auuppass').value;
  const un = $('#auuser').value.trim().toLowerCase().replace(/^@/, '');
  auMsg('auupnote', '');
  if (!EMAIL_RE.test(id)) return auBad('auupemail', 'Enter a valid email address.');
  if (id.toLowerCase() !== id2.toLowerCase()) return auBad('auupemail2', 'The two email addresses do not match.');
  if (!UN_NEW.test(un) || /^\.|\.$|\.\./.test(un)) return auBad('auuser', 'Choose a username: 4 to 20 lowercase letters, numbers, dots or underscores.');
  if (!auPwOk(pw)) { const rb = document.querySelector('.au-reqs[data-for="auuppass"]'); if (rb) { rb.classList.add('tried'); rb.classList.remove('idle'); } return auBad('auuppass', 'Use at least 8 characters with 1 letter and 1 number.'); }
  auBusy(true);
  try {
    const c = await sbClient();
    const free = await sbRest('rpc/username_available', { method: 'POST', body: { p_name: un }, auth: false });
    if (!free) { auBusy(false); auBad('auuser', 'That username is taken or not allowed. Try another one.'); return; }
    const lp = getProfile(), data = { username: un };
    if (lp.displayName) data.display_name = String(lp.displayName).slice(0, 32);
    SB.loud = true;
    const r = await c.auth.signUp({ email: id, password: pw, options: { emailRedirectTo: sbRedirect('signup'), data } });
    if (r.error) throw r.error;
    const u = r.data && r.data.user;
    if (u && Array.isArray(u.identities) && !u.identities.length) throw { code: 'user_already_exists' };
    track('auth', { act: 'signup' });
    $('#auuppass').value = ''; auReqs($('#auuppass'));
    if (r.data && r.data.session) { auWait(true); closeAll(); return; }
    SB.loud = false;
    auCheck(id, 'signup', true);
  } catch (e) { SB.loud = false; auMsg('auupnote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
function auCheck(email, kind, fresh) {
  const back = $('#auckback');
  SB.cmail = email; SB.ck = kind; SB.otpAt = fresh ? Date.now() : 0;
  if (fresh) SB.rsAt = Date.now() + 60000;
  $('#aucmail').textContent = email; $('#accode').value = ''; auMsg('acnote', '');
  document.querySelectorAll('#aumodal [data-cv]').forEach(e => { e.hidden = e.dataset.cv !== kind; });
  if (kind === 'recovery') { back.removeAttribute('data-aumode'); back.dataset.auv = 'reset'; }
  else { back.removeAttribute('data-auv'); back.dataset.aumode = SB.mode === 'up' ? 'up' : 'in'; }
  auView('check'); setTimeout(auFocus, 120);
}
function auResendTick() {
  clearTimeout(SB.rsT);
  const b = $('#auresend'), left = Math.ceil((syNum(SB.rsAt) - Date.now()) / 1000);
  if (!b || b.classList.contains('is-busy')) return;
  const s = b.firstElementChild;
  if (left > 0 && SB.view === 'check') { b.disabled = true; s.textContent = auT('Resend code in {n} s').replace('{n}', left); SB.rsT = setTimeout(auResendTick, 1000); }
  else { b.disabled = !SB.on; s.textContent = 'Resend code'; }
}
async function auResend() {
  if (!SB.on || !SB.cmail || syNum(SB.rsAt) > Date.now()) return;
  const b = $('#auresend');
  b.disabled = true; b.classList.add('is-busy'); auMsg('acnote', '');
  try {
    const c = await sbClient();
    const { error } = SB.ck === 'recovery' ? await c.auth.resetPasswordForEmail(SB.cmail, { redirectTo: sbRedirect('recovery') }) : await c.auth.resend({ type: 'signup', email: SB.cmail, options: { emailRedirectTo: sbRedirect('signup') } });
    if (error) throw error;
    SB.rsAt = Date.now() + 60000; SB.otpAt = Date.now(); $('#accode').value = '';
    track('auth', { act: 'resend' });
    auMsg('acnote', 'Sent again. Use the code in the newest email: the old code no longer works.', 'ok');
  } catch (e) { auMsg('acnote', auErrText(e), 'bad'); }
  finally { b.classList.remove('is-busy'); auResendTick(); }
}
async function auVerify() {
  if (!SB.on || !SB.cmail) return;
  const code = $('#accode').value.replace(/\D/g, '');
  auMsg('acnote', '');
  if (code.length !== 6) return auBad('accode', 'Type the 6-digit code from the email.');
  auBusy(true);
  let bad = '';
  try {
    const c = await sbClient();
    const rec = SB.ck === 'recovery';
    SB.loud = !rec; SB.rec = rec;
    const { error } = await c.auth.verifyOtp({ email: SB.cmail, token: code, type: rec ? 'recovery' : 'signup' });
    if (error) throw error;
    track('auth', { act: 'verify', kind: rec ? 'recovery' : 'signup' });
    $('#accode').value = '';
    if (rec) { SB.rec = false; $('#anuser').value = SB.cmail; auView('newpass'); setTimeout(auFocus, 120); }
    else { auWait(true); closeAll(); }
  } catch (e) {
    SB.loud = false; SB.rec = false;
    const m = String(e && (e.message || e) || ''), k = String(e && e.code || '');
    if (k === 'otp_expired' || /expired|invalid/i.test(m)) {
      bad = !SB.otpAt ? 'This code is wrong or has expired. Check the newest email, or click Resend code.' : Date.now() - SB.otpAt > 3600000 ? 'This code has expired. Click Resend code to get a new one.' : 'Wrong code. Check the newest email and try again.';
    } else auMsg('acnote', auErrText(e), 'bad');
  }
  finally { auBusy(false); if (bad) auBad('accode', bad); }
}
async function auReset() {
  if (!SB.on) return;
  const email = $('#aremail').value.trim();
  auMsg('arnote', '');
  if (!EMAIL_RE.test(email)) return auBad('aremail', 'Enter a valid email address.');
  auBusy(true);
  try {
    const c = await sbClient();
    const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: sbRedirect('recovery') });
    if (error) throw error;
    track('auth', { act: 'reset' });
    auCheck(email, 'recovery', true);
    auMsg('acnote', 'If an account uses this email, we sent it a code.', 'ok');
  } catch (e) { auMsg('arnote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
async function auNewPass() {
  if (!SB.on) return;
  const pw = $('#anpass').value;
  auMsg('annote', '');
  if (!auPwOk(pw)) { const rb = document.querySelector('.au-reqs[data-for="anpass"]'); if (rb) { rb.classList.add('tried'); rb.classList.remove('idle'); } return auBad('anpass', 'Use at least 8 characters with 1 letter and 1 number.'); }
  if (pw !== $('#anpass2').value) return auBad('anpass2', 'The two passwords are not the same.');
  auBusy(true);
  try {
    const c = await sbClient();
    const { error } = await c.auth.updateUser({ password: pw });
    if (error) throw error;
    $('#anpass').value = ''; $('#anpass2').value = ''; auReqs($('#anpass')); SB.view = 'main';
    auMsg('annote', 'Password saved. You are logged in.', 'ok');
    setTimeout(() => { if (openK === 'mauth') closeAll(); }, 1400);
  } catch (e) { auMsg('annote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
async function auChangeEmail() {
  const email = $('#auem2').value.trim();
  if (!EMAIL_RE.test(email)) { auMsg('auemnote', 'Enter a valid email address.', 'bad'); return; }
  if (SB.user && email.toLowerCase() === String(SB.user.email || '').toLowerCase()) { auMsg('auemnote', 'That is already your email address.', 'bad'); return; }
  const b = $('#auemsave'); b.disabled = true; b.classList.add('is-busy'); auMsg('auemnote', 'Sending…');
  try {
    const { error } = await SB.c.auth.updateUser({ email }, { emailRedirectTo: sbRedirect('email') });
    if (error) throw error;
    auMsg('auemnote', 'Check your inbox to confirm the change.', 'ok');
  } catch (e) { auMsg('auemnote', auErrText(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function auChangePass() {
  const pw = $('#aupw2').value;
  if (pw.length < 8) { auMsg('aupwnote', 'Use at least 8 characters.', 'bad'); return; }
  const b = $('#aupwsave'); b.disabled = true; b.classList.add('is-busy'); auMsg('aupwnote', 'Saving…');
  try {
    const { error } = await SB.c.auth.updateUser({ password: pw });
    if (error) throw error;
    $('#aupw2').value = '';
    auMsg('aupwnote', 'Password saved.', 'ok');
  } catch (e) { auMsg('aupwnote', auErrText(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function auSignOut() {
  if (!SB.c) return;
  toast('Signing out…');
  try { await Promise.race([sySync(), new Promise(r => setTimeout(r, 4000))]); } catch (e) {}
  try { await SB.c.auth.signOut({ scope: 'local' }); } catch (e) {}
  track('auth', { act: 'signout' });
  toast('Signed out.');
}
async function auDeleteAccount() {
  const b = $('#adelbtn'); b.disabled = true; b.classList.add('is-busy'); auMsg('adelnote', 'Deleting your account…');
  try {
    const r = await sbRest('rpc/delete_my_account', { method: 'POST', body: {} });
    syWipe();
    try { await SB.c.auth.signOut({ scope: 'local' }); } catch (e) {}
    $('#adelc').value = ''; b.classList.remove('is-busy');
    auMsg('adelnote', '');
    closeAll();
    toast(r === 'requested' ? 'Your account will be deleted.' : 'Your account was deleted.');
  } catch (e) { auMsg('adelnote', 'Could not delete your account. Check your connection and try again.', 'bad'); b.disabled = false; b.classList.remove('is-busy'); }
}
async function auResetCloud() {
  const uid = SB.user.id;
  await sbRest('game_stats?user_id=eq.' + uid, { method: 'DELETE' });
  await sbRest('game_saves?user_id=eq.' + uid, { method: 'DELETE' });
  SY.base = { p: {}, t: {}, b: {} }; SY.pend = null; SY.saves = {}; sySave();
}
const AU_SEL = 'id,username,display_name,avatar_url,created_at';
async function auLoadProfile() {
  const uid = SB.user.id;
  let rows = await sbRest('profiles?select=' + AU_SEL + '&id=eq.' + uid);
  let p = rows && rows[0];
  if (!p) {
    const m = SB.user.user_metadata || {}, dn = String(m.full_name || m.name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 32);
    try { rows = await sbRest('profiles?select=' + AU_SEL, { method: 'POST', body: { id: uid, display_name: dn || null }, prefer: 'return=representation' }); }
    catch (e) { rows = await sbRest('profiles?select=' + AU_SEL + '&id=eq.' + uid); }
    p = rows && rows[0];
  }
  if (!p || !SB.user || SB.user.id !== uid) return;
  SB.prof = p;
  const loc = getProfile();
  if (!p.display_name && loc.displayName) {
    try { const r = await sbRest('profiles?id=eq.' + uid + '&select=' + AU_SEL, { method: 'PATCH', body: { display_name: String(loc.displayName).slice(0, 32) }, prefer: 'return=representation' }); if (r && r[0]) SB.prof = r[0]; } catch (e) {}
  }
  auToLocal();
  const t = Date.parse(p.created_at);
  if (t && t < syNum(S.since)) { S.since = t; save(); }
}
function auToLocal() {
  const p = SB.prof;
  if (!p) return;
  const loc = getProfile(), o = Object.assign({}, loc);
  if (p.username) o.username = p.username;
  if (p.display_name) o.displayName = p.display_name;
  if (o.username !== loc.username || o.displayName !== loc.displayName) { try { localStorage.setItem(PKEY, JSON.stringify(o)); } catch (e) {} }
  renderProfileBits();
}
function auChoose() {
  if (!SB.user || !SB.prof || SB.prof.username || !$('#unmodal').hidden) return;
  SB.choosing = true;
  unStep = 1; $('#un1').hidden = false; $('#un2').hidden = true;
  $('#unt').textContent = 'Choose a username'; $('#uncont').textContent = 'Save';
  $('#unmodal').classList.add('un-must');
  const sug = String(getProfile().username || '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20);
  $('#unew').value = UN_NEW.test(sug) ? sug : '';
  $('label[for="unew"]').textContent = 'Username';
  auMsg('unerr', 'Friends find you by your username: 4 to 20 lowercase letters, numbers, dots or underscores.');
  $('#unmodal').hidden = false;
  if (!auCoarse()) $('#unew').focus();
}
async function auUsername() {
  const raw = unStep === 2 ? unPending : $('#unew').value.trim().toLowerCase();
  if (!UN_NEW.test(raw) || /^\.|\.$|\.\./.test(raw)) { auMsg('unerr', 'Use 4 to 20 lowercase letters, numbers, dots or underscores.', 'bad'); return; }
  if (!SB.prof) { auMsg('unerr', 'Your profile is still loading. Try again in a moment.', 'bad'); auProfLater(0); return; }
  const old = SB.prof && SB.prof.username;
  if (raw === old) { auMsg('unerr', 'That is already your username.', 'bad'); return; }
  if (unStep === 1 && old) {
    unPending = raw; $('#uno').textContent = old; $('#unn').textContent = raw;
    $('#un1').hidden = true; $('#un2').hidden = false; $('#unt').textContent = 'Are you sure?'; $('#uncont').textContent = 'Yes, change it'; unStep = 2;
    return;
  }
  const b = $('#uncont'), back = m => { unStep = 1; $('#un1').hidden = false; $('#un2').hidden = true; $('#unt').textContent = old ? 'Change username' : 'Choose a username'; $('#uncont').textContent = old ? 'Continue' : 'Save'; auMsg('unerr', m, 'bad'); };
  b.disabled = true; b.classList.add('is-busy');
  try {
    const free = await sbRest('rpc/username_available', { method: 'POST', body: { p_name: raw } });
    if (!free) { back('That username is taken or not allowed. Try another one.'); return; }
    const r = await sbRest('profiles?id=eq.' + SB.user.id + '&select=' + AU_SEL, { method: 'PATCH', body: { username: raw }, prefer: 'return=representation' });
    if (r && r[0]) SB.prof = r[0]; else if (SB.prof) SB.prof.username = raw;
    setProfile({ username: raw });
    SB.choosing = false;
    unClose();
    if (openK === 'mprofile') fillProfile();
    say('unnote', old ? 'Username changed.' : 'Username saved.', 1);
    if (!old) toast('Welcome, @' + raw);
  } catch (e) {
    back(sbLimit(e) ? sbLimitText(e, 'too many username changes today') : e.code === '23505' ? 'That username is taken. Try another one.' : e.code === '23514' ? 'That username is not allowed.' : 'Could not save. Check your connection and try again.');
  } finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function auDisplayName(v) {
  const b = $('#dnsave'); b.disabled = true; b.classList.add('is-busy');
  try {
    const r = await sbRest('profiles?id=eq.' + SB.user.id + '&select=' + AU_SEL, { method: 'PATCH', body: { display_name: v }, prefer: 'return=representation' });
    if (r && r[0]) SB.prof = r[0];
    setProfile({ displayName: v });
    say('dnnote', 'Display name saved.', 1);
  } catch (e) { say('dnnote', 'Could not save. Check your connection and try again.'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
function auProfLater(n) {
  clearTimeout(SB.pt);
  if (!SB.user || SB.prof) return;
  SB.pt = setTimeout(async () => {
    if (!SB.user || SB.prof) return;
    const uid = SB.user.id;
    try { await auLoadProfile(); } catch (e) {}
    if (!SB.user || SB.user.id !== uid) return;
    if (SB.prof) { auRender(); if (!SB.prof.username) auChoose(); } else auProfLater(Math.min(n + 1, 5));
  }, Math.min(60000, 2000 * Math.pow(2, n)));
}
async function auSignedIn(ev) {
  try { localStorage.setItem('gameplay:acct', '1'); } catch (e) {}
  const uid = SB.user.id, loud = SB.loud;
  SB.loud = false;
  SB.prof = null;
  FR.list = FR.req = null;
  FR.pp = FR.ppRes = null; FR.ppAt = 0; FR.ppErr = ''; FR.ppAll = false;
  auRender();
  if (openK === 'mauth' && SB.view !== 'newpass' && !SB.rec) closeAll();
  if (SY.uid && SY.uid !== uid) syWipe();
  if (SB.blk && openK !== 'mauth') { SB.blk = 0; route(); }
  try { await auLoadProfile(); } catch (e) {}
  auProfLater(0);
  auWait(false);
  if (!SB.user || SB.user.id !== uid) return;
  auRender();
  adCheck();
  diagCheck();
  soStart();
  siteSignedIn();
  if (loud) toast(auT('Logged in as {name}').replace('{name}', SB.prof && SB.prof.username ? '@' + SB.prof.username : SB.user.email || 'you'));
  sySync();
  if (SB.prof && !SB.prof.username) setTimeout(auChoose, loud ? 400 : 0);
}
function auSignedOut() {
  SB.prof = null; SB.fail = 0; clearTimeout(SB.pt);
  try { if (DIAG.on) DIAG.disarm(); } catch (e) {}
  FR.list = FR.req = FR.res = null; FR.rq = '';
  clearTimeout(SB.t);
  if (SB.choosing && !$('#unmodal').hidden) unClose();
  SB.choosing = false;
  adSignedOut();
  soStop();
  siteSignedOut();
  auWait(false);
  auRender();
  if (cur || pend || view === 'game') go(homeHref(), true);
  SB.mode = 'in'; auGate();
}
function auSession(ev, s) {
  SB.session = s || null;
  const u = s && s.user || null, was = SB.user, opt = !!SB.opt;
  SB.opt = false;
  if (u && was && u.id === was.id && !opt) { SB.user = u; if (ev === 'USER_UPDATED') auRender(); return; }
  SB.chk = true;
  if (!u) { auWait(false); if (openK === 'mauth' && SB.view === 'wait' && !SB.rt) auView('main'); }
  if (!u && !was) { auRender(); return; }
  SB.user = u;
  if (u) auSignedIn(ev);
  else { auSignedOut(); if (opt && !window.__gpSbDown && navigator.onLine !== false) toast(auT('Your session ended. Log in again to keep playing.')); }
  auBootDone();
}
async function auReturn() {
  const r = SB_RET;
  if (!r) return;
  if (r.err) { auOpen(r.kind === 'recovery' ? 'reset' : 'main', auErrText({ message: r.err }), 'bad', 'in'); return; }
  if (!r.code) return;
  SB.loud = r.kind !== 'recovery' && r.kind !== 'email';
  SB.rec = r.kind === 'recovery'; SB.rt = true;
  let error = null;
  try { const x = await SB.c.auth.exchangeCodeForSession(r.code); error = x.error; } catch (e) { error = e; }
  SB.rec = false; SB.rt = false;
  if (error) {
    SB.loud = false;
    auOpen(r.kind === 'recovery' ? 'reset' : 'main', r.kind === 'signup' ? 'Your email is probably confirmed already. Log in with your email or username and your password.' : r.kind === 'recovery' ? 'This link has expired or was opened in another browser. Ask for a new one.' : r.kind === 'email' ? 'Open the link in the browser where you are logged in, or log in again.' : 'Sign-in did not finish. Please try again.', 'bad', 'in');
    return;
  }
  track('auth', { act: 'return', kind: String(r.kind || '').slice(0, 12) });
  if (r.kind === 'recovery') { const em = SB.session && SB.session.user && SB.session.user.email; if (em) $('#anuser').value = em; auOpen('newpass'); }
  else { if (openK === 'mauth' && SB.view === 'wait') closeAll(); if (r.kind === 'email') toast('Your email address was updated'); }
}
const EYE = '<button class="au-eye" type="button" aria-label="Show password" aria-pressed="false"><svg viewBox="0 0 24 24"><g class="o"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g><path class="c" d="M3 3l18 18M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg></button>';
function auEye(b, off) {
  const i = b.parentNode.querySelector('input'), on = !off && b.getAttribute('aria-pressed') !== 'true';
  i.type = on ? 'text' : 'password';
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Hide password' : 'Show password');
}
function lgOpen(k) {
  const d = LEGAL[k];
  if (!d) return;
  $('#lgt').textContent = d[0];
  $('#lgdoc').innerHTML = `<h1>${d[0]}</h1>${d[1]}`;
  const s = $('#lgsheet');
  s.hidden = false; s.scrollTop = 0;
  $('#lgback').focus({ preventScroll: true });
  track('ui', { open: 'legal_sheet', doc: k });
}
function lgClose() { $('#lgsheet').hidden = true; const f = !$('#ckbar').hidden ? $('#ckterms') : null; if (f && !f.closest('[hidden]') && !auCoarse()) f.focus({ preventScroll: true }); }
function ckPlace() {
  const ck = $('#ckbar'), inl = openK === 'mauth' && !ck.hidden && innerWidth <= 1140, w = $('#aumodal .au-wrap');
  if (inl === ck.classList.contains('ck-inline')) return;
  ck.classList.toggle('ck-inline', inl);
  if (inl) w.insertBefore(ck, w.querySelector('.au-foot')); else document.body.insertBefore(ck, $('#lgsheet'));
}
function ckChoose(k) {
  if (!$('#ckterms').checked) { auMsg('cknote', 'Tick the box first to agree to the Terms of Use and the Privacy Policy.', 'bad'); const a = $('#ckagree'); a.classList.add('ck-want'); auShake(a); $('#ckterms').focus({ preventScroll: true }); return; }
  const ck = $('#ckbar');
  if (motionOK() && !ck.classList.contains('ck-bye')) { ck.classList.add('ck-bye'); setTimeout(() => { ck.classList.remove('ck-bye'); setConsent(k !== 'essential', k); }, 220); }
  else setConsent(k !== 'essential', k);
  toast(k === 'all' ? 'Thanks! Cookie choice saved' : k === 'session' ? 'Saved for this visit only' : 'Cookie choice saved');
}
const FR = { q: '', seq: 0, t: 0, list: null, req: null, res: null, rq: '', rres: [], cd: {}, adds: [], rep: null, bc: null, bat: 0, pp: null, ppMiss: false, ppBusy: false, ppErr: '', ppAt: 0, ppTr: false, ppRes: null, ppRq: '', ppAll: false };
const SK_ROWS = '<div class="frow sk-row" aria-hidden="true"><i class="sk sk-pic"></i><div class="fr-n"><i class="sk sk-l1"></i><i class="sk sk-l2"></i></div></div>'.repeat(3);
function frRow(p, acts, hl) {
  const un = p.username || '', dn = p.display_name || un, n = Math.min(hl || 0, un.length);
  const u = n ? `<mark>${esc(un.slice(0, n))}</mark>${esc(un.slice(n))}` : esc(un);
  return `<div class="frow" role="listitem"><span class="pic">${esc((dn || '?').charAt(0).toUpperCase())}</span><div class="fr-n"><b>${esc(dn)}</b><span>@${u}</span></div><div class="fr-a">${acts}</div></div>`;
}
const ppOn = () => !FR.ppMiss && !!FR.pp;
const ppHl = (s, q) => { const i = q ? s.toLowerCase().indexOf(q) : -1; return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length)); };
const PP_RANK = { incoming: 0, none: 1, outgoing: 2, friend: 3 };
function ppState(p) {
  if (FR.list && FR.req) {
    if (FR.list.some(f => f.friend_id === p.id)) return ['friend', null];
    const r = FR.req.find(x => x.other_id === p.id);
    return r ? [r.direction === 'incoming' ? 'incoming' : 'outgoing', r.id] : ['none', null];
  }
  return [PP_RANK[p.state] == null ? 'none' : p.state, p.request_id];
}
function ppRow(p, q) {
  const [st, rid] = ppState(p), un = p.username || '', dn = p.display_name || un || '?';
  const act = st === 'friend' ? `<span class="fr-tag">${esc(auT('Friends'))}</span>` : st === 'incoming' && rid ? `<button class="btn2 pri" type="button" data-fr="accept" data-id="${+rid}">${esc(auT('Accept'))}</button>` : st === 'outgoing' ? `<span class="fr-tag">${esc(auT('Requested'))}</span>` : `<button class="btn2 pri" type="button" data-fr="add" data-un="${esc(un)}">${esc(auT('Add'))}</button>`;
  const nw = Date.now() - (Date.parse(p.created_at) || 0) < 7 * 864e5 ? `<em class="pp-new">${esc(auT('New'))}</em>` : '';
  return `<div class="frow pp-row" role="listitem"><span class="pic">${esc(dn.charAt(0).toUpperCase())}${st === 'friend' ? `<i class="fr-dot${soDot(soOn(p.id))}"></i>` : ''}</span><div class="fr-n"><b translate="no"><span>${ppHl(dn, q)}</span>${nw}</b><span translate="no">@${ppHl(un, q)}</span></div><div class="fr-a">${act}</div></div>`;
}
const ppSort = (a, b) => PP_RANK[ppState(a)[0]] - PP_RANK[ppState(b)[0]] || (a.display_name || a.username || '').localeCompare(b.display_name || b.username || '');
const ppMatch = (p, q) => (p.username || '').toLowerCase().includes(q) || (p.display_name || '').toLowerCase().includes(q);
async function ppLoad(force) {
  if (!SB.user || FR.ppMiss || FR.ppBusy) return;
  if (!force && FR.pp && Date.now() - FR.ppAt < 60000) return;
  FR.ppBusy = true; FR.ppErr = '';
  try {
    const r = await sbRest('rpc/list_people', { method: 'POST', body: {} });
    if (!SB.user) return;
    FR.pp = (Array.isArray(r) ? r : []).filter(p => p && typeof p.id === 'string' && p.username);
    FR.ppAt = Date.now(); FR.ppTr = FR.pp.length >= 500;
  } catch (e) {
    if (sbMissing(e)) FR.ppMiss = true;
    else if (!FR.pp) FR.ppErr = sbLimit(e) ? sbLimitText(e, 'too many searches') : auT('Could not load the player list.');
  } finally { FR.ppBusy = false; }
  if (openK === 'friends') { frPh(); frDraw(); if (FR.ppMiss && FR.q.length >= 2) frSearch(); }
}
async function ppQuery() {
  const q = FR.q, my = ++FR.seq;
  if (!SB.user || q.length < 2) return;
  try {
    const r = await sbRest('rpc/list_people', { method: 'POST', body: { p_q: q, p_limit: 100 } });
    if (my !== FR.seq) return;
    FR.ppRes = (Array.isArray(r) ? r : []).filter(p => p && typeof p.id === 'string' && p.username); FR.ppRq = q;
    frDraw();
  } catch (e) { if (my === FR.seq) auMsg('anote', sbLimit(e) ? sbLimitText(e, 'too many searches') : 'Could not search. Check your connection and try again.', 'bad'); }
}
function frFill(box, rows, empty) {
  const old = new Set([...box.children].map(n => n.dataset.k));
  const t = document.createElement('template');
  t.innerHTML = rows.length ? rows.map(r => r[1]).join('') : empty;
  const nodes = [...t.content.children];
  if (rows.length) nodes.forEach((n, i) => { n.dataset.k = rows[i][0]; if (!old.has(rows[i][0])) { n.classList.add('fr-in'); n.style.setProperty('--i', Math.min(i, 12)); } });
  box.replaceChildren(...nodes);
}
function frDraw() {
  const q = FR.q, fl = FR.list || [], rq = FR.req || [], pm = ppOn();
  const isF = new Set(fl.map(x => x.username)), inc = new Map(), out = new Map();
  rq.forEach(r => (r.direction === 'incoming' ? inc : out).set(r.username, r));
  const searching = pm ? q.length >= 1 : q.length >= 2;
  $('#g-res').hidden = !searching;
  if (searching && pm) {
    const L = (FR.ppTr && q.length >= 2 && FR.ppRq === q && FR.ppRes ? FR.ppRes : FR.pp.filter(p => ppMatch(p, q))).filter(p => !blHas(p.id)).sort(ppSort);
    $('#res-h').textContent = L.length === 1 ? auT('1 player') : L.length ? auT('{n} players').replace('{n}', L.length) : auT('Players');
    frFill($('#fres'), L.slice(0, 100).map(p => ['p' + p.id + ppState(p)[0], ppRow(p, q)]), `<div class="nofr">${esc(auT('No player matches “{q}”.').replace('{q}', q))}</div>`);
  } else if (searching) {
    const blU = new Set((BL.list || []).map(x => x.username).filter(Boolean)), res = FR.res;
    $('#res-h').textContent = res == null ? auT('Searching…') : res.length >= 20 ? auT('{n}+ players').replace('{n}', 20) : res.length === 1 ? auT('1 player') : res.length ? auT('{n} players').replace('{n}', res.length) : auT('Players');
    if (!res) $('#fres').innerHTML = SK_ROWS;
    else frFill($('#fres'), res.map(p => [p.username, frRow(p, isF.has(p.username) ? '<span class="fr-tag">Friend</span>' : blU.has(p.username) ? `<span class="fr-tag">${esc(auT('Blocked'))}</span>` : inc.has(p.username) ? `<button class="btn2 pri" type="button" data-fr="accept" data-id="${+inc.get(p.username).id}">Accept</button>` : out.has(p.username) ? '<span class="fr-tag">Requested</span>' : `<button class="btn2 pri" type="button" data-fr="add" data-un="${esc(p.username)}">Add friend</button>`, q.length)]), `<div class="nofr">${esc(auT('No player has a username starting with “{q}”.').replace('{q}', q))}</div>`);
  }
  $('#g-req').hidden = searching || !rq.length;
  $('#req-n').textContent = rq.length;
  frFill($('#req-l'), rq.slice().sort((a, b) => (a.direction === 'incoming' ? 0 : 1) - (b.direction === 'incoming' ? 0 : 1)).map(r => ['r' + r.id, frRow(r, r.direction === 'incoming' ? `<button class="btn2 pri" type="button" data-fr="accept" data-id="${+r.id}">Accept</button><button class="btn2" type="button" data-fr="decline" data-id="${+r.id}">Decline</button>` : `<span class="fr-tag">Sent</span><button class="btn2" type="button" data-fr="cancel" data-id="${+r.id}">Cancel</button>`)]), '');
  $('#g-fr').hidden = searching;
  $('#fr-n').textContent = fl.length;
  const fo = f => (soOn(f.friend_id) ? 2 : 0) + (DM.inbox.some(c => c.other_id === f.friend_id && c.unread) ? 1 : 0);
  frFill($('#fr-l'), fl.slice().sort((a, b) => fo(b) - fo(a)).map(f => ['f' + f.friend_id + (FR.open === f.friend_id ? 'o' : ''), soFriendRow(f)]), FR.list ? `<div class="nofr">${esc(auT(pm || FR.ppBusy ? 'No friends yet.' : 'No friends yet.'))}</div>` : SK_ROWS);
  const pcf = $('#pcf'); if (pcf && FR.list) pcf.textContent = fl.length;
  let gb = $('#g-bl');
  if (!gb && $('#g-fr')) {
    $('#g-fr').insertAdjacentHTML('afterend', `<div class="grp" id="g-bl" hidden><button class="sech" type="button" aria-expanded="true"><svg class="chev2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg><span>${esc(auT('Blocked'))}</span><i id="bl-n">0</i></button><div class="flist" id="bl-l"></div></div>`);
    gb = $('#g-bl');
    gb.querySelector('.sech').addEventListener('click', e => { e.stopPropagation(); const c = gb.classList.toggle('collapsed'); e.currentTarget.setAttribute('aria-expanded', String(!c)); });
  }
  if (gb) {
    const bl = BL.list || [...BL.ids].map(id => ({ blocked: id }));
    gb.hidden = searching || !bl.length;
    $('#bl-n').textContent = bl.length;
    frFill($('#bl-l'), bl.map(x => ['b' + x.blocked, frRow({ username: x.username || '', display_name: x.display_name || x.username || auT('Blocked player') }, `<button class="btn2" type="button" data-fr="unblock" data-id="${esc(x.blocked)}">${esc(auT('Unblock'))}</button>`)]), '');
  }
  let ga = $('#g-all');
  if (!ga && $('#g-fr')) {
    $('#g-fr').insertAdjacentHTML('afterend', `<div class="grp" id="g-all" hidden><button class="sech" type="button" aria-expanded="true"><svg class="chev2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg><span>${esc(auT('Everyone on gameplay'))}</span><i id="all-n">0</i></button><div class="flist" id="all-l" role="list"></div></div>`);
    ga = $('#g-all');
    ga.querySelector('.sech').addEventListener('click', e => { e.stopPropagation(); const c = ga.classList.toggle('collapsed'); e.currentTarget.setAttribute('aria-expanded', String(!c)); });
  }
  if (ga) {
    ga.hidden = searching || FR.ppMiss || !SB.user;
    if (pm) {
      const L = FR.pp.filter(p => !blHas(p.id)).sort(ppSort), cut = FR.ppAll ? L : L.slice(0, 60);
      $('#all-n').textContent = L.length + (FR.ppTr ? '+' : '');
      frFill($('#all-l'), cut.map(p => ['a' + p.id + ppState(p)[0], ppRow(p, '')]).concat(L.length > cut.length ? [['more', `<button class="btn2 pp-more" type="button" data-fr="ppall">${esc(auT('Show all {n} players').replace('{n}', L.length))}</button>`]] : []), `<div class="nofr">${esc(auT('Nobody else yet.'))}</div>`);
    } else if (FR.ppErr) { $('#all-n').textContent = '–'; $('#all-l').innerHTML = `<div class="nofr">${esc(FR.ppErr)} <button class="au-link" type="button" data-fr="ppretry">${esc(auT('Reload'))}</button></div>`; }
    else if (!$('#all-l .sk-row')) $('#all-l').innerHTML = SK_ROWS;
  }
  soCdApply();
}
async function frLoad() {
  if (!SB.user) return;
  try {
    const [f, r] = await Promise.all([sbRest('rpc/my_friends', { method: 'POST', body: {} }), sbRest('rpc/my_friend_requests', { method: 'POST', body: {} })]);
    if (!SB.user) return;
    FR.list = Array.isArray(f) ? f : []; FR.req = Array.isArray(r) ? r : [];
    frDraw();
  } catch (e) { auMsg('anote', 'Could not load your friends. Check your connection and try again.', 'bad'); }
}
function frPh() {
  const inp = $('#fname'), ph = auT(FR.ppMiss ? 'Find players by username' : 'Search players by name or @username');
  if (inp && inp.placeholder !== ph) { inp.placeholder = ph; inp.setAttribute('aria-label', ph); }
}
function frOpen() {
  const st = auState(), ok = st === 'in', inp = $('#fname');
  $('#frgate').hidden = ok;
  inp.disabled = !ok;
  if (!ok) {
    ['g-res', 'g-req', 'g-fr', 'g-all', 'g-bl'].forEach(id => { const g = $('#' + id); if (g) g.hidden = true; });
    $('#frgt').textContent = st === 'off' ? 'Friends are coming soon' : 'Log in to add friends';
    $('#frgs').textContent = st === 'off' ? 'Accounts are not switched on yet. Then you can find players by their username and add them as friends.' : 'Create a free account or log in, then find players by their username.';
    return;
  }
  frPh();
  FR.q = inp.value.trim().toLowerCase().replace(/^@/, '');
  frDraw(); frLoad(); ppLoad();
  if (FR.q.length >= 2 && !ppOn()) frSearch();
  if (!auCoarse()) setTimeout(() => { if (openK === 'friends') inp.focus({ preventScroll: true }); }, 60);
}
function frInput() {
  const q = $('#fname').value.trim().toLowerCase().replace(/^@/, '');
  FR.q = q; auMsg('anote', '');
  clearTimeout(FR.t);
  if (ppOn()) { FR.seq++; frDraw(); if (FR.ppTr && q.length >= 2) FR.t = setTimeout(ppQuery, 280); return; }
  if (q.length < 2) { FR.seq++; FR.res = null; frDraw(); if (q.length === 1 && FR.ppMiss) auMsg('anote', 'Type at least 2 letters.'); return; }
  if (!/^[a-z0-9_.]+$/.test(q)) { FR.seq++; FR.res = []; frDraw(); return; }
  if (FR.rq && q.startsWith(FR.rq) && FR.rres.length < 20) { FR.seq++; FR.res = FR.rres.filter(p => p.username.startsWith(q)); frDraw(); return; }
  if (FR.res) FR.res = FR.res.filter(p => p.username.startsWith(q));
  frDraw();
  FR.t = setTimeout(frSearch, 280);
}
async function frSearch() {
  if (ppOn()) { if (FR.ppTr && FR.q.length >= 2) ppQuery(); else frDraw(); return; }
  const q = FR.q, my = ++FR.seq;
  if (!SB.user || q.length < 2) return;
  try {
    const r = await sbRest('rpc/search_profiles', { method: 'POST', body: { prefix: q } });
    if (my !== FR.seq) return;
    FR.rq = q; FR.rres = Array.isArray(r) ? r : []; FR.res = FR.rres;
    frDraw();
  } catch (e) { if (my === FR.seq) { FR.res = FR.res || []; frDraw(); auMsg('anote', sbLimit(e) ? sbLimitText(e, 'too many searches') : /too many/i.test(e.message || '') ? 'Too many searches. Wait a moment and try again.' : 'Could not search. Check your connection and try again.', 'bad'); } }
}
async function frAct(k, b) {
  if (!SB.user) return;
  if (k === 'ppall') { FR.ppAll = true; frDraw(); return; }
  if (k === 'ppretry') { FR.ppErr = ''; frDraw(); ppLoad(true); return; }
  if (k === 'report') { FR.rep = FR.rep === b.dataset.id ? null : b.dataset.id; frDraw(); return; }
  if (k === 'repx') { FR.rep = null; frDraw(); return; }
  if (k === 'block' && !(FR.bc === b.dataset.id && Date.now() - FR.bat < 4000)) { FR.bc = b.dataset.id; FR.bat = Date.now(); b.textContent = auT('Click again to block'); b.classList.add('dangerfill'); setTimeout(() => { if (FR.bc === b.dataset.id && b.isConnected) { FR.bc = null; b.textContent = auT('Block'); b.classList.remove('dangerfill'); } }, 4000); return; }
  if (k === 'add') {
    const un = b.dataset.un, now = Date.now(), last = FR.cd[un] || 0;
    FR.adds = FR.adds.filter(t => now - t < 60000);
    if (now - last < 30000) { auMsg('anote', auT('You just sent a request to @{u}.').replace('{u}', un)); return; }
    if (FR.adds.length >= 6) { auMsg('anote', auT('Slow down a little: {what}. Try again in {t}.').replace('{what}', auT('too many friend requests')).replace('{t}', auT('{n} s').replace('{n}', Math.ceil((60000 - (now - FR.adds[0])) / 1000))), 'bad'); return; }
    FR.cd[un] = now; FR.adds.push(now);
  }
  if (k === 'remove' && !b.dataset.c) { b.dataset.c = '1'; b.textContent = 'Click again to remove'; b.classList.add('dangerfill'); setTimeout(() => { if (b.isConnected) { delete b.dataset.c; b.textContent = 'Remove'; b.classList.remove('dangerfill'); } }, 4000); return; }
  b.disabled = true; b.classList.add('is-busy');
  const id = b.dataset.id, name = (b.closest('.frow').querySelector('.fr-n > span') || {}).textContent || '';
  try {
    if (k === 'add') {
      const r = await sbRest('rpc/send_friend_request', { method: 'POST', body: { p_username: b.dataset.un } });
      toast(r === 'accepted' ? auT('You are now friends with {u}').replace('{u}', name) : r === 'sent' ? auT('Friend request sent to {u}').replace('{u}', name) : r === 'already_friends' ? 'You are already friends' : r === 'cooldown' ? 'This player declined your request recently. You can ask again in a few days.' : r === 'too_many_pending' ? 'You have too many requests waiting. Cancel some first.' : 'That player was not found');
      track('friend', { act: 'request', r: String(r || '') });
      FR.nudge = b.dataset.un;
    } else if (k === 'accept' || k === 'decline') {
      const rq = (FR.req || []).find(x => x.id === +id); if (rq && k === 'accept') FR.nudgeId = rq.other_id;
      const r = await sbRest('rpc/respond_friend_request', { method: 'POST', body: { p_id: +id, p_accept: k === 'accept' } });
      if (r === 'accepted') toast(auT('You are now friends with {u}').replace('{u}', name));
      track('friend', { act: k });
    } else if (k === 'cancel') {
      await sbRest('friend_requests?id=eq.' + (+id), { method: 'DELETE' });
      track('friend', { act: 'cancel' });
    } else if (k === 'block') {
      FR.bc = null; FR.open = null;
      await soBlock(id);
      toast(auT('{u} is blocked.').replace('{u}', name || auT('This player')));
      track('friend', { act: 'block' });
    } else if (k === 'unblock') {
      await soUnblock(id);
      ppLoad(true);
      toast(auT('Player unblocked'));
      track('friend', { act: 'unblock' });
    } else if (k === 'rep') {
      await soReport(id, b.dataset.r);
      FR.rep = null;
      toast(auT('Thanks. An admin will look at your report.'));
      track('friend', { act: 'report', r: b.dataset.r });
    } else if (k === 'remove') {
      await sbRest('rpc/remove_friend', { method: 'POST', body: { p_friend: id } });
      toast(auT('{u} was removed from your friends').replace('{u}', name));
      track('friend', { act: 'remove' });
    }
    await frLoad();
    if (FR.nudge) { const un = FR.nudge, o = (FR.req || []).find(x => x.username === un) || (FR.list || []).find(x => x.username === un); FR.nudge = null; if (o) rtSend(o.other_id || o.friend_id, { t: 'fr' }); }
    if (FR.nudgeId) { rtSend(FR.nudgeId, { t: 'fr' }); FR.nudgeId = null; }
    ntBadge();
  } catch (e) { b.disabled = false; b.classList.remove('is-busy'); if (k === 'add' && !sbLimit(e)) delete FR.cd[b.dataset.un]; auMsg('anote', sbLimit(e) ? sbLimitText(e, k === 'add' ? 'too many friend requests' : k === 'rep' ? 'too many reports' : 'too many changes') : 'Could not update. Check your connection and try again.', 'bad'); }
}
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const s = document.getElementById('lgsheet');
  if (s && !s.hidden) { e.preventDefault(); e.stopImmediatePropagation(); lgClose(); }
}, true);
function auBoot() {
  const ck = $('#ckbar'), ls = $('#lgsheet'), am = $('#aumodal'), fm = $('#fmodal');
  ck.addEventListener('click', e => {
    e.stopPropagation();
    const lg = e.target.closest('[data-aulegal]');
    if (lg) { e.preventDefault(); lgOpen(lg.dataset.aulegal); return; }
    const b = e.target.closest('[data-ckc]');
    if (b) ckChoose(b.dataset.ckc);
  });
  $('#ckterms').addEventListener('change', () => auMsg('cknote', ''));
  ls.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target === ls || e.target.closest('#lgback')) { lgClose(); return; }
    const lg = e.target.closest('[data-aulegal], [data-legal]');
    if (lg) { e.preventDefault(); lgOpen(lg.dataset.aulegal || lg.dataset.legal); }
  });
  ['keydown', 'keyup'].forEach(t => ls.addEventListener(t, e => { if (e.key !== 'Escape') e.stopPropagation(); }));
  const ckFit = () => { if (!ck.hidden) document.documentElement.style.setProperty('--ckh', (ck.offsetHeight + (innerWidth <= 600 ? 16 : 28)) + 'px'); };
  if (!ck.hidden) { document.documentElement.classList.add('ck-open'); ckFit(); if (window.ResizeObserver) new ResizeObserver(ckFit).observe(ck); else addEventListener('resize', ckFit); }
  addEventListener('resize', ckPlace);
  const req = AU_REQ.map(r => `<span class="au-req"><svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="5"/><path class="x" d="M3.5 3.5l3 3M6.5 3.5l-3 3"/><path class="k" d="M3 5.2l1.4 1.4L7.1 3.8"/></svg><span>${r[0]}</span></span>`).join('');
  document.querySelectorAll('#aumodal .au-reqs').forEach(b => { b.innerHTML = req; auReqs($('#' + b.dataset.for)); });
  document.querySelectorAll('#aumodal .au-pw').forEach(w => w.insertAdjacentHTML('beforeend', EYE));
  am.addEventListener('mousedown', e => { if (e.target.closest('.au-eye')) e.preventDefault(); });
  am.addEventListener('click', e => {
    const t = e.target, lg = t.closest('[data-aulegal]');
    if (lg) { e.preventDefault(); e.stopPropagation(); lgOpen(lg.dataset.aulegal); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const md = t.closest('[data-aumode]');
    if (md) { if (SB.mode !== md.dataset.aumode || SB.view !== 'main') { SB.mode = md.dataset.aumode; auMsg(SB.mode === 'up' ? 'auupnote' : 'aunote', ''); auView('main'); setTimeout(auFocus, 120); } return; }
  });
  $('#auform').addEventListener('submit', e => { e.preventDefault(); auLogin(); });
  $('#auupform').addEventListener('submit', e => { e.preventDefault(); auSignup(); });
  $('#aurform').addEventListener('submit', e => { e.preventDefault(); auReset(); });
  $('#anform').addEventListener('submit', e => { e.preventDefault(); auNewPass(); });
  $('#auresend').addEventListener('click', auResend);
  $('#acform').addEventListener('submit', e => { e.preventDefault(); auVerify(); });
  $('#accode').addEventListener('input', e => { const v = e.target.value, n = v.replace(/\D/g, '').slice(0, 6); if (n !== v) e.target.value = n; if (n.length === 6 && !$('#aumodal').classList.contains('au-busy')) auVerify(); });
  $('#auforgot').addEventListener('click', () => { const v = $('#auemail').value.trim(); if (v.includes('@')) $('#aremail').value = v; auMsg('arnote', ''); auView('reset'); setTimeout(auFocus, 120); });
  $('#auuser').addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; auUserCheck(); });
  $('#auuser').addEventListener('blur', e => { const v = e.target.value.trim(); if (v && (!UN_NEW.test(v) || /^\.|\.$|\.\./.test(v))) auFieldErr(e.target, 'Use 4 to 20 lowercase letters, numbers, dots or underscores.'); });
  $('#auupemail2').addEventListener('blur', e => { const a = $('#auupemail').value.trim(), b = e.target.value.trim(); if (a && b && a.toLowerCase() !== b.toLowerCase()) auFieldErr(e.target, 'The two email addresses do not match.'); });
  am.querySelectorAll('input').forEach(i => i.addEventListener('input', () => { const f = i.closest('.fld'); if (f) { f.classList.remove('au-shake'); if (i.id !== 'auuser') auFieldErr(i, ''); else if (f.querySelector('.au-err')) auFieldErr(i, ''); } if (i.closest('.au-pw')) auReqs(i); }));
  fm.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'fname') { e.preventDefault(); e.stopPropagation(); clearTimeout(FR.t); frSearch(); } }, true);
  fm.addEventListener('input', e => { if (e.target.id === 'fname') { e.stopPropagation(); frInput(); } }, true);
  fm.addEventListener('click', e => { const b = e.target.closest('[data-fr]'); if (b) { e.stopPropagation(); frAct(b.dataset.fr, b); } });
  document.addEventListener('click', e => {
    const t = e.target;
    const g = t.closest && t.closest('[data-auth="google"]');
    if (g) { e.preventDefault(); if (!g.disabled) auGoogle(g); return; }
    const v = t.closest && t.closest('[data-auv]');
    if (v) { if (v.dataset.auv === 'main') SB.mode = 'in'; auView(v.dataset.auv); auMsg(auNote(), ''); setTimeout(auFocus, 120); return; }
  });
  auGoogleUi();
  unWire();
  if (SB.on) {
    Ameplay.analytics.sink = sbSink;
    [[$('#delc').closest('.scard').querySelector('p'), ' You will also be signed out on this device.', 'Type DELETE'], [$('#dl').closest('.srw').querySelector('small'), ' Includes your account data.'], [$('#rr').closest('.srw').querySelector('small'), ' Your account records are cleared too.']].forEach(([el, t, before]) => { if (!el) return; const sp = document.createElement('span'); sp.dataset.au = 'in'; sp.hidden = true; sp.textContent = t; const n = before && [...el.childNodes].find(x => x.nodeType === 3 && x.nodeValue.includes(before)); if (n) { const i = n.nodeValue.indexOf(before); const rest = n.splitText(i); el.insertBefore(sp, rest); sp.textContent = t.trim() + ' '; } else el.append(sp); });
    $('#auemsave').addEventListener('click', auChangeEmail);
    $('#aupwsave').addEventListener('click', auChangePass);
    $('#auem2').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); auChangeEmail(); } });
    $('#aupw2').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); auChangePass(); } });
    $('#aunow').addEventListener('click', () => { $('#ausync').textContent = 'Syncing…'; sySync(); });
    $('#adelc').addEventListener('input', e => { $('#adelbtn').disabled = e.target.value !== 'DELETE'; });
    $('#adelbtn').addEventListener('click', () => { if ($('#adelc').value === 'DELETE' && SB.user) auDeleteAccount(); });
    $('#unmodal').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.closest('[data-unclose]')) SB.choosing = false; });
    $('#uncancel').addEventListener('click', () => { SB.choosing = false; });
    $('#unedit').addEventListener('click', () => { $('label[for="unew"]').textContent = 'New username'; if (SB.user) $('#uncont').textContent = SB.prof && SB.prof.username ? 'Continue' : 'Save'; });
    addEventListener('online', () => { if (SB.user) sySync(); });
    document.addEventListener('visibilitychange', () => { if (!SB.user) return; if (document.visibilityState === 'hidden') sySync({ keep: true }); else if (Date.now() - syNum(SY.at) > 180000) sySync(); });
    addEventListener('pagehide', () => { if (SB.user) sySync({ keep: true }); });
    addEventListener('storage', e => {
      if (e.key === SYK && SB.user && !SB.syncing) { const before = JSON.stringify(S.recent); if (syAdopt()) syRefresh(before); }
      if (e.key === KEY && e.newValue && e.oldValue) {
        let n = null, old = null;
        try { n = JSON.parse(e.newValue); old = JSON.parse(e.oldValue); } catch (x) { return; }
        if (!n || !old || typeof n !== 'object' || typeof old !== 'object') return;
        if (n.prefs && typeof n.prefs === 'object' && JSON.stringify(n.prefs) !== JSON.stringify(old.prefs || {})) { S.prefs = n.prefs; try { applyTheme(); } catch (x) {} }
        if (typeof n.muted === 'boolean' && n.muted !== !!old.muted && n.muted !== !!S.muted) { try { setMuted(n.muted); } catch (x) {} }
      }
    });
    setInterval(() => { if (SB.user && cur && document.visibilityState !== 'hidden') sySync(); }, 120000);
    if (SB_RET && SB_RET.code) SB.rt = true;
    if (!sbHasSession() && !SB.rt) SB.chk = true;
    if (!sbHasSession() && !SB_RET) { let had = false; try { had = localStorage.getItem('gameplay:acct') === '1'; } catch (e) {} if (!had) SB.mode = 'up'; }
    if (SB_RET || sbHasSession()) sbClient().then(() => auReturn()).catch(() => { auWait(false); SB.rt = false; SB.chk = true; if (SB.opt) { SB.opt = false; SB.user = null; SB.session = null; auRender(); auGate(); } auBootDone(); if (openK === 'mauth') auOpen('main', 'Sign-in could not load. Check your connection and reload the page.', 'bad', 'in'); else toast('Sign-in could not load. Check your connection and reload the page.'); });
    auSettings();
  }
  try { localStorage.removeItem('gameplay:guest'); sessionStorage.removeItem('gameplay:guest'); } catch (e) {}
  auRender();
  const pre = document.documentElement.getAttribute('data-boot');
  if (pre === 'up' || pre === 'login') { SB.first = true; am.classList.add('au-first'); }
  auGate();
  if (pre === 'check' && SB.opt) { am.classList.add('au-first'); SB.first = true; SB.bt = setTimeout(auBootDone, 8000); }
  else document.documentElement.removeAttribute('data-boot');
}
function auBootDone() {
  clearTimeout(SB.bt);
  if (document.documentElement.getAttribute('data-boot')) document.documentElement.removeAttribute('data-boot');
}
Ameplay.account = {
  get enabled() { return SB.on; },
  get signedIn() { return !!SB.user; },
  get id() { return SB.user ? SB.user.id : null; },
  get username() { return SB.prof && SB.prof.username || null; },
  signIn() { auOpen('main', '', '', 'in'); },
  sync() { return sySync(); }
};

Ameplay.debug = { open: id => go(href(id), false), close: () => go(PATH_MODE ? '/' : '#/', false), games, fire: () => ov && ov.fire(), state, compute, q: t => { const o = state.q; state.q = t; const r = compute().list.map(g => g.id); state.q = o; return r; }, info: INFO, fit: () => fitStage(), pause: () => PAUSE.on };
Ameplay.debug.t = { PUB, FR, cardPills, pubStrip, host: id => { invite = { id, code: null, host: true }; restartCurrent(); } };
document.addEventListener('DOMContentLoaded', boot);
})();
