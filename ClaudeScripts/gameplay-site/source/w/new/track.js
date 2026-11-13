const TRS = { t0: Date.now(), vis: 0, vt: performance.now(), von: document.visibilityState === 'visible', foc: 0, blur: 0, keys: 0, clicks: 0, taps: 0, games: 0, gset: new Set(), fs: 0, off: 0, errs: 0, idle: 0, la: performance.now(), seq: 0 };
const RQ = { n: 0, f: 0, s5: 0, s4: 0, l: 0, t: 0 };
const TR_IDLE = 60000;
const TR = { li: performance.now(), idle: false, vis: null, g: null, v0: 0, sy: 0, impQ: [], io: null, clicks: [], dw: 0, vit: { cls: 0, inp: 0, lcp: null }, vsent: false, pads: new Set(), kb: '', env: 0, asked: new Set(), pf: null, pj: 0, rdy: null, hz: (() => { try { return +sessionStorage.getItem('gameplay:hz') || null; } catch (e) { return null; } })() };
const TR_DC = /amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|vultr|choopa|oracle|contabo|leaseweb|m247|datacamp|cdn77|scaleway|alibaba|tencent|hostinger|ionos|psychz|zenlayer|packethub|tzulo|quadranet|nordvpn|expressvpn|proton|mullvad|surfshark|private internet|cyberghost|ipvanish|hide\.me|windscribe|cloudflare|fastly|gcore|constant company|hostwinds|kamatera|clouvider|serverius|worldstream|hivelocity|colocrossing/i;
const trPadKind = id => /054c|sony|playstation|dualsense|dualshock/i.test(id) ? 'PlayStation' : /045e|xbox|xinput/i.test(id) ? 'Xbox' : /057e|nintendo|switch|joy-con/i.test(id) ? 'Switch' : /8bitdo/i.test(id) ? '8BitDo' : /046d|logitech/i.test(id) ? 'Logitech' : 'Other';
const trSel = el => { const a = el.closest('[id],[data-id],a,button,[role="button"]') || el, t = a.tagName.toLowerCase(); return (t + (a.id ? '#' + a.id : a.dataset && a.dataset.id ? '[' + a.dataset.id + ']' : typeof a.className === 'string' && a.className.trim() ? '.' + a.className.trim().split(/\s+/)[0] : '') + (a !== el ? ' ' + el.tagName.toLowerCase() : '')).slice(0, 80); };
const trTo = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
const trOff = tz => { try { const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(x => x.type === 'timeZoneName'); return p ? p.value : ''; } catch (e) { return ''; } };
const trKbOf = (q, y, w) => q === 'a' ? 'azerty' : y === 'z' ? 'qwertz' : q === "'" ? 'dvorak' : q === 'q' && w === 'w' && y === 'y' ? 'qwerty' : '';
const trVis = () => { const t = performance.now(); if (TRS.von) TRS.vis += t - TRS.vt; TRS.vt = t; TRS.von = document.visibilityState === 'visible'; };
const trZoom = () => { if (!trMq('(pointer: fine)') || window.top !== window || !outerWidth || !innerWidth) return null; const z = outerWidth / innerWidth, s = [.25, .33, .5, .67, .75, .8, .9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5].reduce((a, b) => Math.abs(b - z) < Math.abs(a - z) ? b : a); return Math.abs(s - z) / s < .03 ? s : null; };
const trVotes = () => { try { return JSON.parse(localStorage.getItem('gameplay:votes')) || {}; } catch (e) { return {}; } };
const TR_TAG = { game_launch: 1, game_play: 1, game_time: 1, game_quit: 1, error: 1, restart: 1, pause: 1, fullscreen: 1 };
const TR_ERR = { m: '', s: '', t: 0 };
const TR_X = { op: null, l1: 0, set: null, inv: 0, pt: null, su: new Set(), lu: -1e9, ach: 0, mem: 0 };
const trStk = s => String(s || '').split('\n').slice(0, 7).map(l => l.replace(/(?:https?|blob|file|chrome-extension|moz-extension):\/\/[^\s)]*\/([^/\s)?#]*)(?:[?#][^\s):]*)?/g, '$1').replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | ').slice(0, 400);
const trErrNote = (m, st) => { if (!st) return; TR_ERR.m = String(m || '').slice(0, 60); TR_ERR.s = trStk(st); TR_ERR.t = Date.now(); };
addEventListener('error', e => { try { if (e && e.error && e.error.stack) trErrNote(e.message, e.error.stack); } catch (x) {} }, true);
addEventListener('unhandledrejection', e => { try { const r = e && e.reason; if (r && r.stack) trErrNote(r.message || r, r.stack); } catch (x) {} }, true);
function trSetSnap() {
  const o = {};
  try { Object.keys(S.prefs || {}).forEach(k => { const v = S.prefs[k]; if (v == null || typeof v !== 'object') o[k] = v; }); o.theater = S.theater !== false; o.lang = window.gpI18n && gpI18n.lang || document.documentElement.lang || ''; } catch (e) {}
  return o;
}
function trPartyEnd(why) {
  const P = TR_X.pt;
  if (!P) return;
  TR_X.pt = null;
  track('party_end', { game: P.g, role: P.role, sec: Math.round((performance.now() - P.t) / 1000), drops: P.drops, backs: P.backs, players: P.n || null, pub: P.pub, via: P.via || null, why: String(why || '').slice(0, 16) });
}
function trOnline(id) { if (TR.g && TR.g.g.id === id) TR.g.onl = 1; }
function trTag(e, p) {
  try {
    const now = performance.now();
    if (TR_TAG[e] && TR.vis && p.game === TR.vis.game && p.v == null) p.v = TR.vis.id;
    if (e === 'party_join' && TR.pj && now - TR.pj < 120000) { p.ms = Math.round(now - TR.pj); TR.pj = 0; }
    if (e === 'game_open') TR_X.op = { g: p.game, t: now };
    else if (e === 'game_launch') {
      if (TR_X.op && TR_X.op.g === p.game && now - TR_X.op.t < 600000) p.lt = Math.round(now - TR_X.op.t);
      TR_X.op = null;
      if (!TR_X.l1) { TR_X.l1 = 1; p.ttf = Math.round(now); }
    } else if (e === 'error') {
      if (!p.stk && TR_ERR.s && Date.now() - TR_ERR.t < 3000 && (!p.msg || String(p.msg).slice(0, 60) === TR_ERR.m || String(p.msg).indexOf(TR_ERR.m.slice(0, 30)) >= 0)) p.stk = TR_ERR.s;
    } else if (e === 'setting' && p.k) {
      if (!TR_X.set) TR_X.set = trSetSnap();
      const o = TR_X.set[p.k];
      if (o != null && typeof o !== 'object') p.old = String(o).slice(0, 40);
      TR_X.set[p.k] = p.v;
    } else if (e === 'party_create' || e === 'party_join') {
      if (TR_X.pt) trPartyEnd('new');
      TR_X.pt = { g: p.game, t: now, role: e === 'party_create' ? 'host' : 'guest', pub: p.pub ? 1 : 0, via: p.via || (p.rt ? 'site' : p.peer ? 'peerjs' : ''), drops: 0, backs: 0, n: 0 };
      if (e === 'party_join' && TR_X.inv && now - TR_X.inv < 180000) { p.inv = 1; TR_X.inv = 0; }
      trOnline(p.game);
    } else if (e === 'party_play' || e === 'online_party') {
      if (TR_X.pt && p.players) TR_X.pt.n = Math.max(TR_X.pt.n, +p.players || 0);
      trOnline(p.game);
    } else if (e === 'auth' && p.act === 'return' && p.kind === 'google') trSu('google', 'back');
  } catch (x) {}
}
function trSu(m, s) {
  const k = m + ':' + s;
  if (TR_X.su.has(k)) return;
  TR_X.su.add(k);
  track('su_step', { m, s });
}
function trSec(kind, method, ok, code) {
  if (!SB.on) return;
  try { sbRest('rpc/sec_note', { method: 'POST', body: { p_kind: kind, p_method: method, p_ok: !!ok, p_code: code ? String(code).slice(0, 40) : null }, auth: !!SB.user, keep: true }).catch(() => {}); } catch (e) {}
}
function trAuthSeen(u, init, r) {
  const m = String(init && init.method || 'GET').toUpperCase();
  if (m !== 'POST' && m !== 'PATCH') return;
  const path = u.replace(/^[a-z]+:\/\/[^/]+/i, ''), st = r ? r.status : 0, ok = st >= 200 && st < 300;
  const code = () => r && !ok && r.status !== 0 ? r.clone().json().then(j => j && (j.error_code || j.code || j.error) || 'http_' + r.status, () => 'http_' + r.status) : Promise.resolve(r ? 'http_' + r.status : 'network');
  const body = init && typeof init.body === 'string' ? init.body : '';
  if (/\/rpc\/login_email(\?|$)/.test(path)) {
    TR_X.lu = performance.now();
    if (r && r.status === 429) trSec('login', 'username', false, 'rate_limited');
    else if (ok) r.clone().text().then(t => { if (!t || t === 'null' || t === '""') trSec('login', 'username', false, 'invalid_credentials'); }, () => {});
  } else if (/\/auth\/v1\/token\?grant_type=password/.test(path)) {
    const by = performance.now() - TR_X.lu < 20000 ? 'username' : 'email';
    code().then(c => trSec('login', by, ok, ok ? null : c));
  } else if (/\/auth\/v1\/token\?grant_type=id_token/.test(path)) {
    code().then(c => trSec('login', 'google_relay', ok, ok ? null : c));
    if (ok) trSu('google', 'back');
  } else if (/\/auth\/v1\/token\?grant_type=pkce/.test(path)) {
    const k = typeof SB_RET !== 'undefined' && SB_RET ? SB_RET.kind : '';
    if (k === 'google') code().then(c => trSec('login', 'google', ok, ok ? null : c));
  } else if (/\/auth\/v1\/signup(\?|$)/.test(path)) {
    code().then(c => trSec('signup', 'email', ok, ok ? null : c));
    if (ok) trSu('email', 'created');
  } else if (/\/auth\/v1\/verify(\?|$)/.test(path)) {
    const sig = /"type"\s*:\s*"signup"/.test(body);
    code().then(c => trSec('verify', sig ? 'email' : '', ok, ok ? null : c));
    if (ok && sig) trSu('email', 'verified');
  } else if (m === 'PATCH' && ok && /\/rest\/v1\/profiles\?id=eq\./.test(path) && /"username"/.test(body)) {
    let g = false;
    try { g = sessionStorage.getItem('gameplay:su') === 'google'; } catch (e) {}
    if (g) trSu('google', 'saved');
  }
}
function trSuWatch() {
  const am = document.getElementById('aumodal'), un = document.getElementById('unmodal');
  if (!am || !window.MutationObserver) return;
  let t = 0;
  const look = () => {
    if (!am.hidden && SB.view === 'main' && SB.mode === 'up') { trSu('email', 'open'); trSu('google', 'open'); }
    if (un && !un.hidden) { let g = false; try { g = sessionStorage.getItem('gameplay:su') === 'google'; } catch (e) {} if (g) trSu('google', 'name'); }
  };
  const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(look, 300); });
  mo.observe(am, { attributes: true, attributeFilter: ['hidden', 'class', 'data-auv', 'data-aumode'], subtree: true });
  if (un) mo.observe(un, { attributes: true, attributeFilter: ['hidden'] });
  look();
  document.addEventListener('focusin', e => { const f = e.target && e.target.closest && e.target.closest('#auupform'); if (f) trSu('email', 'start'); }, true);
  document.addEventListener('submit', e => { if (e.target && e.target.id === 'auupform') trSu('email', 'submit'); }, true);
  document.addEventListener('click', e => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('#auupgo')) trSu('email', 'submit');
    if (t.closest('[data-auth="google"]') && SB.mode === 'up') { trSu('google', 'click'); try { if (anOk()) sessionStorage.setItem('gameplay:su', 'google'); } catch (x) {} }
    if (t.closest('[data-ch="go"]')) TR_X.inv = performance.now();
  }, true);
}
function trDiag(k, d) {
  if (k === 'track') return;
  if (k === 'toast') {
    if (typeof d === 'string' && TR.g && TR_X.ach < 30 && /achievement|unlocked|trophy|badge|milestone|succ[eè]s d[ée]bloqu/i.test(d)) { TR_X.ach++; track('milestone', { game: TR.g.g.id, k: 'ach' }); }
    return;
  }
  if (k !== 'net' || !d || !TR_X.pt) return;
  const a = d.a, P = TR_X.pt;
  if (a === 'guest-lost' || a === 'guest-away' || (a === 'rt-link-end' && d.why && d.why !== 'closed' && d.why !== 'shut')) P.drops++;
  else if (a === 'rt-door-rejoin' || (a === 'join-start' && d.resume)) P.backs++;
  else if (a === 'shut') trPartyEnd(d.keep ? 'keep' : 'shut');
}
function trDiagHook() {
  try {
    if (typeof DIAG === 'undefined' || !DIAG || DIAG.__tr || typeof DIAG.ev !== 'function') return;
    const ev0 = DIAG.ev;
    DIAG.ev = function (k, d) { try { trDiag(k, d); } catch (e) {} return ev0.apply(this, arguments); };
    DIAG.__tr = 1;
  } catch (e) {}
}
function trMem() {
  if (TR_X.mem) return;
  TR_X.mem = 1;
  const m = performance.memory;
  if (!m || !m.usedJSHeapSize) return;
  track('mem10', { mb: Math.round(m.usedJSHeapSize / 1048576), lim: m.jsHeapSizeLimit ? Math.round(m.jsHeapSizeLimit / 1048576) : null, game: TR.g ? TR.g.g.id : null });
}
const TR_DK = /^(diff|difficulty|skill|level|lvl|lv|ai|cpu|bots?|speed|hard)$/i, TR_MK = /^(mode|opp|opponent|vs|players|play)$/i;
const TR_WIN = /\b(you win|you won|wins|win!|victory|victorious|winner|cleared|complete|completed|champion|escaped|solved)\b/i;
const TR_LOSS = /\b(you lose|you lost|lost|game over|defeat|defeated|crashed|dead|died|wasted|busted|eliminated|time'?s up|out of (?:lives|moves|time)|no moves left|failed)\b/i;
function trSegKey(b) { const h = b.closest('[data-k]'); return String(b.dataset.k || (h ? h.dataset.k : '') || '').toLowerCase(); }
function trSegPick(G, b) {
  const k = trSegKey(b), v = String(b.dataset.v == null ? '' : b.dataset.v).slice(0, 16);
  if (!k || v === '') return;
  if (TR_DK.test(k)) G.dif = (k + '=' + v).slice(0, 24);
  else if (TR_MK.test(k)) G.mk = v;
}
function trSegScan(G) {
  try {
    const root = frame.querySelector('.g-root');
    if (!root) return;
    root.querySelectorAll('[data-k] [data-v].on, [data-k] [data-v][aria-checked="true"], [data-k] [data-v][aria-pressed="true"], [data-k][data-v].on').forEach(b => { const k = trSegKey(b); if ((TR_DK.test(k) && !G.dif) || (TR_MK.test(k) && !G.mk)) trSegPick(G, b); });
  } catch (e) {}
}
function trMode(G) {
  const m = String(G.mk || '').toLowerCase(), pl = G.g.info && G.g.info.pl || 's';
  if (G.onl || /net|online/.test(m)) return 'online';
  if (/(^|[^a-z])(ai|cpu|bots?|computer|solo)([^a-z]|$)/.test(m)) return 'bots';
  if (/2p|pvp|local|duo|two|pass|hot|versus|friend/.test(m)) return 'local';
  if (pl === 's') return 'solo';
  return G.dif ? 'bots' : 'offline';
}
function trTake(G) {
  const b = S.best[G.g.id], o = { fr: G.pf, ft: G.pt, sl: G.ps, lf: G.pl, rn: G.rounds - G.r0, rec: b != null && b !== G.b0 ? 1 : 0 };
  G.pf = G.pt = G.ps = G.pl = 0; G.r0 = G.rounds; G.b0 = b;
  return o;
}
function trPerf(id) {
  try {
    const a = TR.g && TR.g.g.id === id ? trTake(TR.g) : null, b = TR.pf && TR.pf.game === id ? TR.pf.o : null;
    TR.pf = null;
    if (!a && !b) return {};
    const o = { fr: 0, ft: 0, sl: 0, lf: 0, rn: 0, rec: 0 };
    [a, b].forEach(x => { if (x) for (const k in o) o[k] += x[k] || 0; });
    const out = { rn: o.rn, rec: o.rec ? 1 : 0 };
    if (o.fr >= 60 && o.ft > 0) { out.fps = o.fr * 1000 / o.ft; out.fr = o.fr; out.sl = o.sl; out.lf = o.lf; out.hz = TR.hz; }
    return out;
  } catch (e) { return {}; }
}
function trNet() {
  const F = window.fetch;
  if (typeof F !== 'function' || !SB.on) return;
  const hosts = SBN.all();
  window.fetch = function (input) {
    const p = F.apply(this, arguments);
    try {
      const u = typeof input === 'string' ? input : input instanceof URL ? input.href : input && input.url || '';
      if (hosts.some(b => u.indexOf(b + '/') === 0)) {
        const t = performance.now(), init = arguments[1], au = /\/auth\/v1\/(token|signup|verify)|\/rpc\/login_email|\/rest\/v1\/profiles\?id=eq\./.test(u);
        p.then(r => { RQ.n++; RQ.t += performance.now() - t; if (r.status === 429) RQ.l++; else if (r.status >= 500) RQ.s5++; else if (r.status >= 400) RQ.s4++; if (au) { try { trAuthSeen(u, init, r); } catch (x) {} } }, e => { if (!(e && e.name === 'AbortError')) { RQ.n++; RQ.f++; } });
      }
    } catch (e) {}
    return p;
  };
}
function trRq() {
  const o = { rq: RQ.n, rqf: RQ.f, rq5: RQ.s5, rq4: RQ.s4, rql: RQ.l, rqt: Math.round(RQ.t) };
  RQ.n = RQ.f = RQ.s5 = RQ.s4 = RQ.l = RQ.t = 0;
  return o;
}

function trIdle() { return !!TR.g && performance.now() - TR.li > TR_IDLE; }
function trTick(G, t) {
  const V = G && G.vis;
  if (!V) return;
  if (V.on) { const e = Math.min(t, TR.li + TR_IDLE); if (e > V.t) V.ms += e - V.t; }
  V.t = t;
  V.on = TR.g === G && document.visibilityState === 'visible' && !PAUSE.on;
}
function trWake() { if (typeof ttSync === 'function') { try { ttSync(); } catch (e) {} } }
function trInput() {
  const t = performance.now();
  if (t - TR.li > TR_IDLE && TR.g) { trTick(TR.g, t); TR.li = t; if (TR.idle) { TR.idle = false; trWake(); } }
  else TR.li = t;
}
function trEmit(V) {
  if (!V) return;
  const s = Math.floor(V.ms / 1000);
  V.st = performance.now();
  if (s < 1 || s <= V.sent) return;
  V.sent = s;
  track('game_active', { game: V.game, v: V.id, sec: s });
}
function trBeat() {
  const G = TR.g;
  if (!G) return;
  const t = performance.now(), id = t - TR.li > TR_IDLE;
  trTick(G, t);
  if (id !== TR.idle) { TR.idle = id; trWake(); }
  if (t - G.vis.st >= 60000) trEmit(G.vis);
}
function trStart(g, ctl) {
  TRS.games++; TRS.gset.add(g.id);
  const t0 = performance.now(), A = ctl.api, G = { g, t0, why: 'exit', rounds: 0, sc: [], last: null, lv: null, fr: 0, ft: 0, fs: [], fh: new Uint32Array(4000), inp: { k: 0, m: 0, t: 0, p: 0 }, on: {}, pf: 0, pt: 0, ps: 0, pl: 0, r0: 0, b0: S.best[g.id], li: 0, fin: 0, w: 0, l: 0, dif: '', mk: '', onl: TR_X.pt && TR_X.pt.g === g.id ? 1 : 0 };
  if (TR.g) trEnd1(TR.g);
  if (!TR.vis || TR.vis.game !== g.id || TR.vis.done) TR.vis = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), game: g.id, ms: 0, t: t0, on: false, sent: 0, st: t0, done: false };
  G.vis = TR.vis; G.a0 = TR.vis.ms;
  TR.g = G; TR.li = t0; TR.idle = false;
  trTick(G, t0);
  const sc = A.score, sb = A.submit, ov = A.overlay;
  A.score = v => { if (typeof v === 'number' && isFinite(v)) G.last = v; return sc(v); };
  A.submit = v => { if (typeof v === 'number' && isFinite(v) && G.sc.length < 40) G.sc.push(v); return sb(v); };
  A.overlay = (o = {}) => { const r = ov(o); if (o && o.stats && o.stats.length) trRound(G, o); else if (performance.now() - G.t0 > 90000) trAsk(G); return r; };
  A.on(window, 'keydown', e => { if (!isField(e.target)) { G.on.k = 1; G.li = performance.now(); } }, true);
  A.on(frame, 'pointerdown', e => { G.on[e.pointerType === 'touch' || e.pointerType === 'pen' ? 't' : 'm'] = 1; G.li = performance.now(); }, true);
  A.on(frame, 'click', e => { const b = e.target instanceof Element && e.target.closest('[data-v]'); if (b) trSegPick(G, b); }, true);
  ctl.add(() => trEnd1(G));
  let last = 0, s0 = 0, n = 0, k = 0;
  const step = t => {
    if (TR.g !== G) return;
    requestAnimationFrame(step);
    if (PAUSE.on || document.visibilityState !== 'visible') { last = 0; return; }
    if (!last || t - last > 1000) { last = s0 = t; n = 0; return; }
    const dt = t - last;
    G.fr++; G.ft += dt; G.fh[Math.min(3999, dt * 4 | 0)]++; last = t; n++;
    G.pf++; G.pt += dt; if (dt > 34) { G.ps++; if (dt > 100) G.pl++; }
    if (++k % 10 === 0 && navigator.getGamepads) { for (const p of navigator.getGamepads()) if (p && (p.buttons.some(b => b.pressed) || p.axes.some(a => Math.abs(a) > .5))) { G.on.p = 1; trInput(); break; } }
    if (t - s0 >= 1000) {
      if (t - G.t0 > 3000 && G.fs.length < 7200) G.fs.push(n * 1000 / (t - s0));
      for (const x in G.on) G.inp[x]++;
      G.on = {}; n = 0; s0 = t;
    }
  };
  requestAnimationFrame(step);
}
function trLow(h, n) {
  if (!n) return null;
  let need = Math.ceil(n * .1), k = 0, ms = 0;
  for (let i = h.length - 1; i >= 0 && k < need; i--) { const c = Math.min(h[i], need - k); k += c; ms += c * (i + .5) / 4; }
  return ms ? k * 1000 / ms : null;
}
function trRound(G, o) {
  G.rounds++;
  G.fin = performance.now();
  const ttl = String((o.kicker || '') + ' ' + (o.title || '')).replace(/<[^>]*>/g, ' ');
  if (TR_WIN.test(ttl)) G.w++; else if (TR_LOSS.test(ttl)) G.l++;
  if (!G.dif || !G.mk) trSegScan(G);
  for (const [k, v] of o.stats) {
    if (!/^(level|wave|stage|floor|round|lap|world|chapter|zone|tier|night|day)s?\b/i.test(String(k))) continue;
    const n = parseFloat(String(v).replace(/<[^>]*>/g, '').replace(/[^\d.-]/g, ''));
    if (isFinite(n) && (G.lv == null || n > G.lv)) G.lv = n;
  }
  trAsk(G);
}
function trAsk(G) {
  const id = G.g.id, card = frame.querySelector('.g-overlay:last-child .g-ov-card');
  if (!card || TR.asked.has(id) || trVotes()[id]) return;
  TR.asked.add(id);
  const box = document.createElement('div');
  box.className = 'g-vote';
  box.innerHTML = `<span>${esc(auT('Enjoying {g}?').replace('{g}', G.g.title))}</span><button type="button" data-gv="1" aria-label="${esc(auT('I like it'))}"><svg viewBox="0 0 24 24"><path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 1H7"/></svg></button><button type="button" data-gv="-1" aria-label="${esc(auT('Not for me'))}"><svg viewBox="0 0 24 24"><path d="M17 13V4h3v9zM17 13l-4 8a2 2 0 0 1-3-2l1-5H5a2 2 0 0 1-2-2l2-7a2 2 0 0 1 2-1h10"/></svg></button>`;
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-gv]');
    e.stopPropagation();
    if (!b) return;
    trVote(id, +b.dataset.gv);
    box.innerHTML = `<span>${esc(auT('Thanks for the feedback!'))}</span>`;
    frame.focus({ preventScroll: true });
  });
  card.append(box);
}
const TR_VT = {};
function trVote(id, v) {
  const V = trVotes(), k = id + ':' + v, now = Date.now();
  V[id] = v;
  try { localStorage.setItem('gameplay:votes', JSON.stringify(V)); } catch (e) {}
  if (now - (TR_VT[k] || 0) < 15000) return;
  TR_VT[k] = now;
  if (SB.on) sbRest('rpc/vote_game', { method: 'POST', body: { p_game: id, p_vote: v }, auth: !!SB.user }).catch(() => {});
}
function trEnd1(G) {
  if (TR.g !== G) return;
  const now = performance.now();
  trTick(G, now);
  TR.g = null;
  G.vis.on = false;
  const tk = trTake(G), was = TR.pf && TR.pf.game === G.g.id ? TR.pf.o : null;
  if (was) for (const k in tk) tk[k] += was[k] || 0;
  TR.pf = { game: G.g.id, o: tk };
  if (G.why !== 'restart') { G.vis.done = true; trEmit(G.vis); }
  if (TR.idle) { TR.idle = false; trWake(); }
  const fs = G.fs.slice().sort((a, b) => a - b), I = G.inp, act = Math.round((G.vis.ms - G.a0) / 1000);
  if (!G.dif || !G.mk) trSegScan(G);
  const ab = G.rounds ? (G.li > G.fin + 1500 ? 1 : 0) : (act >= 5 ? 1 : 0);
  track('game_quit', { game: G.g.id, sec: Math.round((now - G.t0) / 1000), act, why: G.why, rounds: G.rounds, rs: G.rounds + ab, ab, w: G.w, l: G.l, dif: G.dif || null, mo: trMode(G), sc: G.sc, last: G.last, lv: G.lv, fps: G.ft ? G.fr * 1000 / G.ft : null, fpsmin: fs.length ? fs[0] : null, fps5: fs.length ? fs[Math.floor(fs.length * .05)] : null, fps10: trLow(G.fh, G.fr), hz: TR.hz, ik: I.k, im: I.m, it: I.t, ip: I.p });
}
function trView(from) {
  const now = performance.now();
  if (from) track('page_time', { v: from, sec: Math.round((now - TR.v0) / 1000) });
  if (from === 'home') trScroll();
  TR.v0 = now;
}
function trScroll() {
  if (TR.sy > 0) track('scroll', { v: 'home', pct: Math.min(100, Math.round(TR.sy / 5) * 5) });
  TR.sy = 0;
}
function trImpFlush() { while (TR.impQ.length) track('impr', { l: TR.impQ.splice(0, 40) }); }
function trImpScan() {
  if (!window.IntersectionObserver) return;
  if (!TR.io) TR.io = new IntersectionObserver(es => es.forEach(e => {
    const el = e.target;
    if (!e.isIntersecting) { clearTimeout(el._it); return; }
    el._it = setTimeout(() => { if (!el.isConnected) return; TR.io.unobserve(el); TR.impQ.push(el.dataset.id + '|' + el.dataset.src + '|' + [...el.parentNode.children].indexOf(el)); if (TR.impQ.length >= 40) trImpFlush(); }, 1000);
  }), { threshold: .5 });
  document.querySelectorAll('a[data-id][data-src]:not([data-imp])').forEach(el => { el.dataset.imp = '1'; TR.io.observe(el); });
}
function trDead(t) {
  if (TR.dw || !window.MutationObserver) return;
  const href = location.href, sy = scrollY;
  let hit = false;
  const mo = new MutationObserver(() => { hit = true; });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
  TR.dw = setTimeout(() => { mo.disconnect(); TR.dw = 0; if (!hit && location.href === href && Math.abs(scrollY - sy) < 2) track('dead', { t: trSel(t), v: view }); }, 900);
}
function trVitalsSend() {
  if (TR.vsent) return;
  TR.vsent = true;
  const n = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null, f = performance.getEntriesByName ? performance.getEntriesByName('first-contentful-paint')[0] : null, fp = performance.getEntriesByName ? performance.getEntriesByName('first-paint')[0] : null;
  track('vitals', { lcp: TR.vit.lcp, cls: Math.round(TR.vit.cls * 1000) / 1000, inp: TR.vit.inp || null, fp: fp ? fp.startTime : null, fcp: f ? f.startTime : null, ttfb: n ? n.responseStart : null, load: n && n.loadEventEnd ? n.loadEventEnd : null, rdy: TR.rdy, v: view });
}
function trHz() {
  return new Promise(r => {
    if (document.visibilityState !== 'visible') { r(null); return; }
    const t = [];
    const f = x => {
      t.push(x);
      if (t.length < 61) { requestAnimationFrame(f); return; }
      const d = t.slice(1).map((v, i) => v - t[i]).sort((a, b) => a - b), hz = 1000 / d[d.length >> 1];
      r([30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 170, 180, 200, 240, 360].reduce((a, b) => Math.abs(b - hz) < Math.abs(a - hz) ? b : a));
    };
    requestAnimationFrame(f);
  });
}
async function trGeo() {
  try { const c = JSON.parse(sessionStorage.getItem('gameplay:geo')); if (c) return c; } catch (e) {}
  try {
    const j = await (await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' })).json();
    const org = String(j.organization_name || j.organization || '').replace(/^AS\d+\s*/, '');
    const o = { cc: String(j.country_code || '').slice(0, 2).toUpperCase(), country: j.country || '', region: j.region || '', dc: TR_DC.test(org), gtz: j.timezone || '' };
    try { sessionStorage.setItem('gameplay:geo', JSON.stringify(o)); } catch (e) {}
    return o;
  } catch (e) { return null; }
}
const TR_GLW = 'onmessage=function(e){var o={r:"",mtex:null,glx:null,ok:false};try{var c=new OffscreenCanvas(1,1),gl=c.getContext("webgl");if(gl){var x=e.data?null:gl.getExtension("WEBGL_debug_renderer_info");o.r=String(gl.getParameter(x?x.UNMASKED_RENDERER_WEBGL:gl.RENDERER)||"");o.mtex=gl.getParameter(gl.MAX_TEXTURE_SIZE);o.glx=(gl.getSupportedExtensions()||[]).length;o.ok=true}}catch(_){}postMessage(o)}';
let TR_GLP = null, TR_GLK = null;
function trGlName(r) { return String(r || '').replace(/^ANGLE \((.*)\)$/, '$1').replace(/,? ?(Direct3D|D3D|OpenGL|Vulkan|Metal).*$/i, '').replace(/ \(0x[0-9a-f]+\)/gi, '').replace(/^[^,]{2,24}, (?=.*\S)/, '').trim().slice(0, 100); }
function trGlMain(ff) {
  const o = { r: '', mtex: null, glx: null, ok: false };
  try {
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return o;
    TR_GLK = gl;
    const x = ff ? null : gl.getExtension('WEBGL_debug_renderer_info');
    o.r = String(gl.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
    o.mtex = gl.getParameter(gl.MAX_TEXTURE_SIZE); o.glx = (gl.getSupportedExtensions() || []).length; o.ok = true;
  } catch (e) {}
  return o;
}
function trGlWorker(ff) {
  return new Promise(res => {
    let w = null, u = null, t = 0, fin = false;
    const end = o => { if (fin) return; fin = true; clearTimeout(t); try { if (w) w.terminate(); } catch (e) {} try { if (u) URL.revokeObjectURL(u); } catch (e) {} res(o); };
    try {
      if (!window.OffscreenCanvas || !window.Worker || !window.Blob) return end(null);
      u = URL.createObjectURL(new Blob([TR_GLW], { type: 'text/javascript' }));
      w = new Worker(u);
      w.onmessage = e => end(e.data && e.data.ok ? e.data : null);
      w.onerror = () => end(null);
      t = setTimeout(() => end(undefined), 60000);
      w.postMessage(ff);
    } catch (e) { end(null); }
  });
}
function trGl() {
  if (TR_GLP) return TR_GLP;
  return TR_GLP = (async () => {
    try { const k = JSON.parse(localStorage.getItem('gameplay:gpu') || 'null'); if (k && typeof k === 'object' && typeof k.r === 'string') return k; } catch (e) {}
    const ff = /Firefox\//.test(navigator.userAgent);
    let o = await trGlWorker(ff);
    if (o === undefined) return { r: '', mtex: null, glx: null };
    if (!o) o = trGlMain(ff);
    const v = { r: trGlName(o.r), mtex: o.mtex == null ? null : +o.mtex || null, glx: o.glx == null ? null : +o.glx || 0 };
    try { if (consent && consent.level !== 'session') localStorage.setItem('gameplay:gpu', JSON.stringify(v)); } catch (e) {}
    return v;
  })();
}
function trOs(hi) {
  const ua = navigator.userAgent, d = device().os, pv = hi && hi.platformVersion ? String(hi.platformVersion) : '';
  let m;
  if (d === 'Windows') { const v = parseInt(pv, 10); return v >= 13 ? 'Windows 11' : v > 0 ? 'Windows 10' : (m = ua.match(/Windows NT ([\d.]+)/)) ? 'Windows ' + ({ '10.0': '10 or 11', '6.3': '8.1', '6.2': '8', '6.1': '7' }[m[1]] || m[1]) : 'Windows'; }
  if (d === 'Android') return 'Android ' + (pv ? pv.split('.')[0] : (m = ua.match(/Android (\d+)/)) ? m[1] : '');
  if ((m = ua.match(/(?:iPhone|iPad|CPU) OS (\d+)_(\d+)/))) return 'iOS ' + m[1] + '.' + m[2];
  if (d === 'iOS') return (m = ua.match(/Version\/(\d+\.\d+)/)) ? 'iPadOS ' + m[1] : 'iPadOS';
  if (d === 'macOS') return 'macOS' + (pv ? ' ' + pv.split('.').slice(0, 2).join('.') : (m = ua.match(/Mac OS X (\d+)[_.](\d+)/)) ? ' ' + m[1] + '.' + m[2] : '');
  return d;
}
function trBr(hi) {
  const b = device().browser, ua = navigator.userAgent, want = { Chrome: 'Google Chrome', Edge: 'Microsoft Edge', Opera: 'Opera' }[b];
  const fv = hi && hi.fullVersionList && want ? hi.fullVersionList.find(x => x.brand === want) : null;
  if (fv) return b + ' ' + String(fv.version).split('.')[0];
  const m = ua.match(b === 'Firefox' ? /Firefox\/(\d+)/ : b === 'Safari' ? /Version\/(\d+(?:\.\d+)?)/ : b === 'Samsung' ? /SamsungBrowser\/(\d+)/ : b === 'Edge' ? /Edg\/(\d+)/ : b === 'Opera' ? /OPR\/(\d+)/ : /Chrome\/(\d+)/);
  return b + (m ? ' ' + m[1] : '');
}
async function trEnv() {
  if (!anOk() || TR.env) return;
  TR.env = 1;
  try { if (sessionStorage.getItem('gameplay:env') === SID) return; sessionStorage.setItem('gameplay:env', SID); } catch (e) {}
  const ud = navigator.userAgentData, c = navigator.connection || {}, now = new Date(), tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();
  const [hi, kbm, geo, hz, glI] = await Promise.all([
    trTo(ud && ud.getHighEntropyValues ? ud.getHighEntropyValues(['platformVersion', 'model', 'architecture', 'bitness', 'fullVersionList']).catch(() => null) : Promise.resolve(null), 2000),
    trTo(navigator.keyboard && navigator.keyboard.getLayoutMap ? navigator.keyboard.getLayoutMap().catch(() => null) : Promise.resolve(null), 2000),
    trTo(trGeo(), 6000), trTo(trHz(), 4000), trTo(trGl(), 5000)
  ]);
  if (hz) { TR.hz = hz; try { sessionStorage.setItem('gameplay:hz', hz); } catch (e) {} }
  if (kbm && !TR.kb) TR.kb = trKbOf(kbm.get('KeyQ'), kbm.get('KeyY'), kbm.get('KeyW'));
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean).map(p => trPadKind(p.id)) : [];
  track('env_dev', { osv: trOs(hi), brv: trBr(hi), model: hi && hi.model ? hi.model : device().type === 'desktop' ? null : /iPhone/.test(navigator.userAgent) ? 'iPhone' : /iPad|Macintosh/.test(navigator.userAgent) ? 'iPad' : 'Unknown model', arch: hi && hi.architecture ? hi.architecture + (hi.bitness ? '-' + hi.bitness : '') : null, cores: navigator.hardwareConcurrency || null, mem: navigator.deviceMemory || null, gpu: glI && glI.r ? glI.r : null, gl2: 'WebGL2RenderingContext' in window, wgpu: 'gpu' in navigator, hz, kb: TR.kb || null, pads, langs: (navigator.languages || []).slice(0, 1) });
  const g = geo || {}, dc = !!g.dc, tzm = !!(g.gtz && tz && g.gtz !== tz && trOff(g.gtz) !== trOff(tz));
  setTimeout(() => trMore().catch(() => {}), 2500);
  track('env_geo', { tz, off: -now.getTimezoneOffset(), net: c.effectiveType || null, ctype: c.type || 'unknown', dl: c.downlink != null ? c.downlink : null, rtt: c.rtt != null ? c.rtt : null, save: c.saveData != null ? !!c.saveData : null, cc: g.cc || null, country: g.country || null, region: g.region || null, dc, tzm, vpn: dc || tzm });
}
const trMq = q => { try { return matchMedia(q).matches; } catch (e) { return false; } };
const trHost = u => { try { return u ? new URL(u).hostname.replace(/^www\./, '').slice(0, 60) : ''; } catch (e) { return ''; } };
async function trMore() {
  const sc = screen || {}, o = sc.orientation || {}, dpr = window.devicePixelRatio || 1, n = navigator;
  track('env_scr', { cd: sc.colorDepth || null, dpr: Math.round(dpr * 100) / 100, ori: o.type || null, vw: innerWidth, vh: innerHeight, tp: n.maxTouchPoints || 0, ptr: trMq('(pointer: fine)') ? 'fine' : trMq('(pointer: coarse)') ? 'coarse' : 'none', hov: trMq('(hover: hover)'), dark: trMq('(prefers-color-scheme: dark)'), rmo: trMq('(prefers-reduced-motion: reduce)'), con: trMq('(prefers-contrast: more)'), fcol: trMq('(forced-colors: active)'), rtr: trMq('(prefers-reduced-transparency: reduce)'), hdr: trMq('(dynamic-range: high)'), gam: trMq('(color-gamut: rec2020)') ? 'rec2020' : trMq('(color-gamut: p3)') ? 'p3' : 'srgb', dm: ['fullscreen', 'standalone', 'minimal-ui'].find(m => trMq('(display-mode: ' + m + ')')) || 'browser', ext: sc.isExtended != null ? !!sc.isExtended : null, zoom: trZoom(), res: (sc.width || 0) + 'x' + (sc.height || 0) });
  const nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
  track('env_caps', { bot: !!n.webdriver, wasm: typeof WebAssembly === 'object', ref: trHost(document.referrer) || 'direct', land: (location.pathname + location.hash).slice(0, 60), navt: nav ? nav.type : null, route: SB.on ? (SBN.best() === SUPABASE_DIRECT ? 'direct' : 'relay') : 'none', down: !!window.__gpSbDown });
}
function trSess(final) {
  if (!anOk()) return;
  const t = performance.now();
  trVis();
  TRS.idle = Math.max(TRS.idle, t - TRS.la);
  track('sess_sum', Object.assign({ seq: ++TRS.seq, final: !!final, dur: Math.round((Date.now() - TRS.t0) / 1000), vis: Math.round(TRS.vis / 1000), foc: TRS.foc, blur: TRS.blur, keys: TRS.keys, clicks: TRS.clicks, taps: TRS.taps, games: TRS.games, gset: TRS.gset.size, gl: [...TRS.gset].slice(0, 30), fs: TRS.fs, off: TRS.off, errs: TRS.errs, idle: Math.round(TRS.idle / 1000), route: SB.on ? (SBN.best() === SUPABASE_DIRECT ? 'direct' : 'relay') : 'none', acct: SB.user ? 'user' : SB.guest ? 'guest' : 'none', lang: document.documentElement.lang || null, theme: document.documentElement.getAttribute('data-theme') || 'system' }, trRq()));
}
function trHidden() { if (TR.g) { trTick(TR.g, performance.now()); trEmit(TR.g.vis); } trImpFlush(); trVitalsSend(); trSess(false); }
function trEnd() {
  if (TR.g) { TR.g.why = 'close'; trEnd1(TR.g); }
  trPartyEnd('close');
  trScroll(); trImpFlush(); trVitalsSend();
  track('page_time', { v: view, sec: Math.round((performance.now() - TR.v0) / 1000), exit: true });
  trSess(true);
}
function trBoot() {
  TR.v0 = performance.now();
  TR.rdy = Math.round(TR.v0);
  trNet();
  trDiagHook();
  TR_X.set = trSetSnap();
  try { trSuWatch(); } catch (e) {}
  setTimeout(trMem, Math.max(1000, 600000 - performance.now()));
  const ob = (type, fn, o) => { try { new PerformanceObserver(l => l.getEntries().forEach(fn)).observe(Object.assign({ type, buffered: true }, o)); } catch (e) {} };
  ob('layout-shift', e => { if (!e.hadRecentInput) TR.vit.cls += e.value; });
  ob('largest-contentful-paint', e => { TR.vit.lcp = e.startTime; });
  ob('event', e => { if (e.interactionId) TR.vit.inp = Math.max(TR.vit.inp, e.duration); }, { durationThreshold: 40 });
  addEventListener('scroll', () => { if (view !== 'home') return; const h = document.documentElement.scrollHeight; if (h > 0) TR.sy = Math.max(TR.sy, 100 * (scrollY + innerHeight) / h); }, { passive: true });
  document.addEventListener('click', e => {
    const t = e.target;
    if (!(t instanceof Element) || t.closest('.g-root, input, textarea, select, [contenteditable]')) return;
    const now = performance.now(), x = e.clientX, y = e.clientY;
    TR.clicks = TR.clicks.filter(c => now - c.t < 800 && Math.hypot(c.x - x, c.y - y) < 30);
    TR.clicks.push({ t: now, x, y });
    if (TR.clicks.length === 3) track('rage', { t: trSel(t), v: view });
    if (getComputedStyle(t).cursor === 'pointer' || t.closest('a, button, [role="button"], img, label')) trDead(t);
  }, true);
  addEventListener('keydown', e => {
    if (TR.kb || !e.key || e.key.length !== 1 || !/^Key[QWYZA]$/.test(e.code)) return;
    const k = e.key.toLowerCase(), c = e.code;
    const l = (c === 'KeyQ' && k === 'a') || (c === 'KeyA' && k === 'q') || (c === 'KeyW' && k === 'z') ? 'azerty' : (c === 'KeyY' && k === 'z') || (c === 'KeyZ' && k === 'y') ? 'qwertz' : (c === 'KeyY' && k === 'y') || (c === 'KeyZ' && k === 'z') ? 'qwerty' : '';
    if (l) { TR.kb = l; if (TR.env) track('kb', { kb: l }); }
  }, true);
  addEventListener('gamepadconnected', e => {
    const id = String(e.gamepad && e.gamepad.id || '');
    if (!id || TR.pads.has(id)) return;
    TR.pads.add(id);
    track('pad', { kind: trPadKind(id), id: id.replace(/\s*\(.*?\)\s*/g, ' ').trim().slice(0, 60) || trPadKind(id), map: e.gamepad.mapping || '' });
  });
  let mt = 0;
  if (window.MutationObserver) new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(trImpScan, 400); }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  trImpScan();
  setInterval(trImpFlush, 30000);
  if (anOk()) setTimeout(trEnv, 1500);
  const act = () => { const t = performance.now(); TRS.idle = Math.max(TRS.idle, t - TRS.la); TRS.la = t; trInput(); };
  addEventListener('keydown', () => { TRS.keys++; act(); }, { capture: true, passive: true });
  const lob = e => { const t = e.target; if (t && t.closest && t.closest('.g-lobby') && (e.type !== 'keydown' || e.key === 'Enter')) TR.pj = performance.now(); };
  addEventListener('keydown', lob, { capture: true, passive: true });
  addEventListener('pointerdown', e => { if (e.pointerType === 'touch') TRS.taps++; else TRS.clicks++; act(); lob(e); }, { capture: true, passive: true });
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') trInput(); else act(); }, { capture: true, passive: true });
  addEventListener('wheel', act, { capture: true, passive: true });
  addEventListener('focus', () => TRS.foc++);
  addEventListener('blur', () => TRS.blur++);
  addEventListener('offline', () => TRS.off++);
  addEventListener('error', () => TRS.errs++);
  document.addEventListener('fullscreenchange', () => { if (document.fullscreenElement) TRS.fs++; });
  addEventListener('touchmove', trInput, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => { trVis(); if (TR.g) trTick(TR.g, performance.now()); });
  setInterval(trBeat, 1000);
  setInterval(() => { if (document.visibilityState === 'visible') trSess(false); }, 300000);
}
Ameplay.ads = {
  watch(el, slot, net) {
    if (!el || !window.IntersectionObserver) return;
    let t = 0;
    const io = new IntersectionObserver(es => es.forEach(e => { clearTimeout(t); if (e.isIntersecting) t = setTimeout(() => { io.disconnect(); track('ad_impression', { slot: String(slot || ''), net: String(net || '') }); }, 1000); }), { threshold: .5 });
    io.observe(el);
    el.addEventListener('click', () => track('ad_click', { slot: String(slot || ''), net: String(net || '') }), true);
  },
  revenue(slot, usd, net) { track('ad_revenue', { slot: String(slot || ''), net: String(net || ''), usd: +usd || 0 }); }
};
