const LS_ID = 'long-shot';
const LS_D0 = Date.UTC(2026, 10, 13);
const LS_K = 200;
const LS_SECS = 25;
const LS_DUEL_SECS = 15;
const LS_N = 7;
const LS_AU = 149597870.7;
const LS_TIERS = [
  { n: 'Stardust', p: 10, min: .1, c: '#b9c3dd', e: '⚪' },
  { n: 'Satellite', p: 20, min: .04, c: '#4aa8ff', e: '🔵' },
  { n: 'Comet', p: 35, min: .015, c: '#36d6a0', e: '🟢' },
  { n: 'Nebula', p: 55, min: .006, c: '#b77dff', e: '🟣' },
  { n: 'Supernova', p: 80, min: .002, c: '#ff8b3d', e: '🟠' },
  { n: 'Long Shot', p: 100, min: 0, c: '#ffd447', e: '🟡' }
];
const LS_MISS = { n: 'No answer', p: 0, c: '#5d6684', e: '⚫' };
const LS_BODIES = [
  { n: 'Earth', au: 1 }, { n: 'Mars', au: 1.52 }, { n: 'Asteroid belt', au: 2.7 }, { n: 'Jupiter', au: 5.2 }, { n: 'Saturn', au: 9.58 },
  { n: 'Uranus', au: 19.2 }, { n: 'Neptune', au: 30.07 }, { n: 'Pluto', au: 39.5 }, { n: 'Kuiper Belt', au: 48 }, { n: 'Eris', au: 67.9 },
  { n: 'Termination shock', au: 94 }, { n: 'Heliopause', au: 121 }, { n: 'Voyager 1', au: 167 }, { n: 'Oort Cloud', au: 2000 }
];
const LS_ART = new Set(['the', 'a', 'an', 'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd']);
const LS_SYN = { st: 'saint', ste: 'sainte', mt: 'mount' };
const LS_MAPC = { 'œ': 'oe', 'æ': 'ae', 'ß': 'ss', 'ø': 'o', 'ł': 'l', 'đ': 'd', 'ı': 'i', 'þ': 'th', 'ð': 'd' };
const LS_RUDE = /(^|[^a-z])(f+u+c*k+|sh+i+t+|b+i+t+c+h+|c+u+n+t+|n+i+gg+(?:e+r+|a+)|f+a+g+(?:g*o+t+)?|r+e+t+a+r+d+(?:e+d+|s+)|wh+o+r+e+|s+l+u+t+|d+i+c+k+h+e+a+d+|p+u+s+s+y+|c+o+c+k+s+u+c+k+|a+s+s+h+o+l+e+|b+a+s+t+a+r+d+|w+a+n+k+|t+w+a+t+|p+o+r+n+o*|r+a+p+e+|k+y+s+|p+e+d+o+|put(?:e|ain)|salop(?:e|ard)|conn(?:ard|asse)|encul[eé]|merde|niqu(?:e|er)|nazi|hitler)(?:s|e[dr]|ing|y)?(?![a-z])/;
const LS_LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };

const lsLang = () => { const g = window.gpI18n; return g && typeof g.lang === 'string' ? g.lang : 'en'; };
const T = (s, o) => {
  const g = window.gpI18n;
  if (g && typeof g.t === 'function') { try { return g.t(s, o); } catch (e) {} }
  return o ? String(s).replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m) : s;
};
const lsEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lsFmt = (n, d) => { const k = d || 0; try { return new Intl.NumberFormat(lsLang(), { minimumFractionDigits: k, maximumFractionDigits: k }).format(n); } catch (e) { return Number(n).toFixed(k); } };
const lsPlain = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[œæßøłđıþð]/g, c => LS_MAPC[c]).replace(/&/g, ' and ');
function lsNorm(s, drop) {
  let t = lsPlain(s).split(/[^a-z0-9]+/).filter(Boolean).map(w => LS_SYN[w] || w);
  while (t.length > 1 && LS_ART.has(t[0])) t.shift();
  if (drop && drop.size) { const u = t.filter(w => !drop.has(w)); if (u.length) t = u; }
  return t.join('');
}
const lsSlug = s => lsPlain(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const lsRude = s => LS_RUDE.test(lsPlain(String(s == null ? '' : s).replace(/[013457@$]/g, c => LS_LEET[c] || c)));
function lsHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function lsRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function lsShuffle(a, R) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

const LS_SETC = new Map();
function lsSet(id) {
  let s = LS_SETC.get(id);
  if (s) return s;
  const raw = LS_SETS[id];
  if (!raw) return null;
  const drop = new Set(raw.d), keys = new Map();
  const rows = raw.e.split('\n').map((ln, i) => {
    const p = ln.split('|'), en = p[1].split('/'), fr = p[2] ? p[2].split('/') : [];
    const r = { i, f: +p[0], w: Math.pow(2, +p[0]), en, fr, tags: p[3] ? p[3].split(' ') : [], k: lsSlug(en[0]), names: [] };
    en.forEach(n => r.names.push({ n, fr: false, k: lsNorm(n, drop) }));
    fr.forEach(n => r.names.push({ n, fr: true, k: lsNorm(n, drop) }));
    r.names.forEach(x => { if (!keys.has(x.k)) keys.set(x.k, r); });
    return r;
  });
  const bySlug = new Map(rows.map(r => [r.k, r]));
  s = { id, drop, z: raw.z, rows, keys, bySlug };
  LS_SETC.set(id, s);
  return s;
}
function lsFilter(set, flt, letter) {
  let suf = '';
  if (flt.includes('~')) { const a = flt.split('~'); flt = a[0]; suf = a[1]; }
  const alts = flt && flt !== '*' ? flt.split(',').map(a => a.split('+').filter(Boolean)) : null;
  const lx = letter ? letter.toLowerCase() : '';
  return set.rows.filter(r => {
    if (r.tags.includes('no')) return false;
    if (alts && !alts.some(need => need.every(x => x[0] === '!' ? !r.tags.includes(x.slice(1)) : r.tags.includes(x)))) return false;
    if (lx && !r.names.some(x => x.k[0] === lx)) return false;
    if (suf && !r.names.some(x => lsPlain(x.n).endsWith(suf))) return false;
    return true;
  });
}

const LS_PC = new Map();
const LS_PROMPT_BY = new Map(LS_PROMPTS.map(p => [p[0], p]));
function lsPromptRaw(id) { return LS_PROMPT_BY.get(id) || null; }
function lsVariant(raw, lang) {
  const v = {};
  raw[3].split(';').forEach(part => { const i = part.indexOf('='); if (i > 0) v[part.slice(0, i)] = part.slice(i + 1); else v['*'] = part; });
  if (v[lang]) return [lang, v[lang]];
  if (v['*']) return ['*', v['*']];
  return ['en', v.en || Object.values(v)[0]];
}
function lsPrompt(id, lang) {
  const raw = lsPromptRaw(id);
  if (!raw) return null;
  const [vl, src] = lsVariant(raw, lang || lsLang());
  const ck = id + '|' + vl;
  let P = LS_PC.get(ck);
  if (P) return P;
  const ci = src.indexOf(':'), set = lsSet(ci < 0 ? src : src.slice(0, ci));
  if (!set) return null;
  const x = raw[5] || '', lx = x.toLowerCase();
  const rows = lsFilter(set, ci < 0 ? '' : src.slice(ci + 1), x);
  const keys = new Map(), stems = new Map(), list = [];
  let sum = 0;
  rows.forEach(r => {
    sum += r.w;
    r.names.forEach(nm => {
      if (lx && nm.k[0] !== lx) return;
      if (!keys.has(nm.k)) { keys.set(nm.k, r); list.push(nm.k, r); }
    });
  });
  keys.forEach((r, k) => {
    if (k.length > 4 && k.endsWith('es') && !keys.has(k.slice(0, -2))) stems.set(k.slice(0, -2), r);
    if (k.length > 3 && /[sx]$/.test(k) && !keys.has(k.slice(0, -1))) stems.set(k.slice(0, -1), r);
  });
  const multi = raw[3].includes('=');
  P = { id, ck, vl, fam: raw[1], fl: raw[2], text: raw[4], x, set, rows, keys, stems, list, sum, multi, sorted: rows.slice().sort((a, b) => b.w - a.w || a.i - b.i) };
  LS_PC.set(ck, P);
  return P;
}
const lsPromptText = P => P.x ? T(P.text, { x: P.x }) : T(P.text);
function lsName(P, r, lang) {
  const fr = (lang || lsLang()) === 'fr' && r.fr.length;
  const first = fr ? r.fr[0] : r.en[0];
  if (!P || !P.x) return first;
  const lx = P.x.toLowerCase(), set = P.set;
  if (lsNorm(first, set.drop)[0] === lx) return first;
  const alt = (fr ? r.fr.concat(r.en) : r.en.concat(r.fr)).find(n => lsNorm(n, set.drop)[0] === lx);
  return alt || first;
}
function lsOsa(a, b, max) {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  const W = lb + 1, d = lsOsa.buf || (lsOsa.buf = new Int16Array(3 * 64));
  if (W > 64) return max + 1;
  let p2 = 0, p1 = W, c = 2 * W;
  for (let j = 0; j <= lb; j++) d[p1 + j] = j;
  for (let i = 1; i <= la; i++) {
    d[c] = i;
    let best = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let v = Math.min(d[p1 + j] + 1, d[c + j - 1] + 1, d[p1 + j - 1] + cost);
      if (i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) v = Math.min(v, d[p2 + j - 2] + 1);
      d[c + j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    const t = p2; p2 = p1; p1 = c; c = t;
  }
  return d[p1 + lb];
}
const lsTol = (len, z) => z <= 0 ? 0 : z >= 2 ? (len >= 7 ? 2 : len >= 4 ? 1 : 0) : (len >= 8 ? 2 : len >= 5 ? 1 : 0);
function lsMatch(P, text) {
  const t = String(text == null ? '' : text).trim();
  if (!t) return { ok: false, why: 'empty' };
  const k = lsNorm(t, P.set.drop);
  if (!k) return { ok: false, why: 'none' };
  const cands = [k];
  if (k.length > 4 && k.endsWith('es')) cands.push(k.slice(0, -2));
  if (k.length > 3 && /[sx]$/.test(k)) cands.push(k.slice(0, -1));
  for (const c of cands) {
    const r = P.keys.get(c) || P.stems.get(c);
    if (r) return { ok: true, row: r, exact: c === k };
  }
  if (lsRude(t)) return { ok: false, why: 'rude' };
  for (const c of cands) if (P.set.keys.has(c)) return { ok: false, why: 'fit' };
  const tol = lsTol(k.length, P.set.z);
  if (tol > 0) {
    let best = null, bd = tol + 1;
    for (let i = 0; i < P.list.length; i += 2) {
      const key = P.list[i];
      if (key[0] !== k[0]) continue;
      const d = lsOsa(k, key, Math.min(tol, bd));
      if (d < bd || (d === bd && best && P.list[i + 1].w > best.w)) { bd = d; best = P.list[i + 1]; }
    }
    if (best && bd <= tol) return { ok: true, row: best, exact: false };
  }
  return { ok: false, why: 'none' };
}
const lsSeedShare = (P, r) => P.sum > 0 ? r.w / P.sum : 0;
const lsShare = (P, r, live) => {
  const s = lsSeedShare(P, r);
  if (!live || !(live.t > 0)) return s;
  return Math.max(0, Math.min(1, (LS_K * s + Math.max(0, live.n)) / (LS_K + live.t)));
};
const lsTier = sh => { for (let i = 0; i < LS_TIERS.length; i++) if (sh >= LS_TIERS[i].min) return i; return LS_TIERS.length - 1; };
const lsPct = sh => sh >= .1 ? lsFmt(Math.round(sh * 100)) + '%' : sh >= .001 ? lsFmt(sh * 100, 1) + '%' : '<' + lsFmt(.1, 1) + '%';
function lsRare(P, n) {
  const R = lsRng(lsHash('rare:' + P.ck)), cut = P.sum * LS_TIERS[4].min, pool = P.rows.filter(r => r.w <= cut);
  return lsShuffle(pool.length >= n ? pool : P.sorted.slice(-Math.max(n, 6)), R).slice(0, n);
}

const lsDay = () => Math.max(0, Math.floor((Date.now() - LS_D0) / 864e5));
const lsNextDayMs = () => LS_D0 + (lsDay() + 1) * 864e5 - Date.now();
let LS_POOL = null;
function lsPool() {
  if (!LS_POOL) LS_POOL = LS_PROMPTS.filter(p => p[2].includes('d')).map(p => p[0]).sort();
  return LS_POOL;
}
const LS_DAYC = new Map();
function lsDaily(d) {
  if (LS_DAYC.has(d)) return LS_DAYC.get(d);
  const pool = lsPool(), L = Math.max(1, Math.floor(pool.length / LS_N)), c = Math.floor(d / L), pos = d - c * L;
  const deck = lsShuffle(pool.slice(), lsRng(lsHash('long-shot-cycle:' + c)));
  let out = [];
  for (let day = 0; day <= pos; day++) {
    const pick = [], fams = new Set();
    for (let j = 0; j < deck.length && pick.length < LS_N; j++) { const f = lsPromptRaw(deck[j])[1]; if (!fams.has(f)) { fams.add(f); pick.push(j); } }
    for (let j = 0; j < deck.length && pick.length < LS_N; j++) if (!pick.includes(j)) pick.push(j);
    out = pick.map(j => deck[j]);
    pick.slice().sort((a, b) => b - a).forEach(j => deck.splice(j, 1));
  }
  LS_DAYC.set(d, out);
  return out;
}
function lsRandomPrompts(n, seed, opt) {
  const o = opt || {}, R = lsRng(seed >>> 0), all = LS_PROMPTS.filter(p => (p[2].includes('d') || p[2].includes('e')) && !(o.solo === false && p[3].includes('='))).map(p => p[0]);
  const deck = lsShuffle(all.slice(), R), out = [], fams = [];
  const avoid = new Set(o.avoid || []);
  while (out.length < n && deck.length) {
    let j = deck.findIndex(id => !avoid.has(id) && !fams.slice(-3).includes(lsPromptRaw(id)[1]));
    if (j < 0) j = deck.findIndex(id => !avoid.has(id));
    if (j < 0) j = 0;
    const id = deck.splice(j, 1)[0];
    out.push(id); fams.push(lsPromptRaw(id)[1]);
  }
  return out;
}

const lsAuOf = pts => 1 + Math.max(0, pts) / 10;
function lsKm(pts) {
  const km = Math.max(0, pts) / 10 * LS_AU;
  if (km <= 0) return T('{n} km', { n: '0' });
  if (km < 1e9) return T('{n} million km', { n: lsFmt(Math.round(km / 1e6)) });
  return T('{n} billion km', { n: lsFmt(km / 1e9, 2) });
}
function lsZone(pts) {
  const au = lsAuOf(pts);
  let last = LS_BODIES[0], next = null;
  for (const b of LS_BODIES) { if (b.au <= au) last = b; else { next = b; break; } }
  return { last, next, au };
}
const lsAuTxt = au => T('{n} AU', { n: lsFmt(au, au < 10 ? 2 : 1) });

function lsBlank() { return { v: 1, days: {}, best: 0, endless: 0, eRuns: 0, rating: 1000, duel: { w: 0, l: 0, d: 0 }, rooms: { p: 0, w: 0 }, tiers: [0, 0, 0, 0, 0, 0, 0], bot: 1, room: { n: 7, s: 25, b: 1 } }; }
const lsInt = (v, lo, hi, d) => typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : d;
function lsClean(raw) {
  const s = lsBlank();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return s;
  const today = lsDay();
  if (raw.days && typeof raw.days === 'object' && !Array.isArray(raw.days)) {
    const ks = Object.keys(raw.days).filter(k => /^\d{1,6}$/.test(k) && +k <= today + 1).sort((a, b) => b - a).slice(0, 400);
    ks.forEach(k => {
      const d = raw.days[k];
      if (!d || typeof d !== 'object' || !Array.isArray(d.a)) return;
      const a = d.a.slice(0, LS_N).map(x => Array.isArray(x) ? [typeof x[0] === 'string' && /^[a-z0-9-]{1,40}$/.test(x[0]) ? x[0] : '', lsInt(x[1], 0, 100, 0), lsInt(x[2], -1, 5, -1), lsInt(x[3], 0, 120000, 0), typeof x[4] === 'number' && isFinite(x[4]) ? Math.max(0, Math.min(1, x[4])) : 0, x[5] ? 1 : 0] : ['', 0, -1, 0, 0, 0]);
      const ids = Array.isArray(d.p) ? d.p.slice(0, LS_N).filter(x => typeof x === 'string' && x.length < 60) : [];
      s.days[k] = { a, p: ids, done: !!d.done && a.length >= LS_N, at: lsInt(d.at, 0, 4e12, 0) };
    });
  }
  s.best = lsInt(raw.best, 0, 700, 0);
  s.endless = lsInt(raw.endless, 0, 1e7, 0);
  s.eRuns = lsInt(raw.eRuns, 0, 1e7, 0);
  s.rating = lsInt(raw.rating, 100, 4000, 1000);
  if (raw.duel && typeof raw.duel === 'object') s.duel = { w: lsInt(raw.duel.w, 0, 1e6, 0), l: lsInt(raw.duel.l, 0, 1e6, 0), d: lsInt(raw.duel.d, 0, 1e6, 0) };
  if (raw.rooms && typeof raw.rooms === 'object') s.rooms = { p: lsInt(raw.rooms.p, 0, 1e6, 0), w: lsInt(raw.rooms.w, 0, 1e6, 0) };
  if (Array.isArray(raw.tiers) && raw.tiers.length === 7) s.tiers = raw.tiers.map(x => lsInt(x, 0, 1e7, 0));
  s.bot = lsInt(raw.bot, 0, 3, 1);
  if (raw.room && typeof raw.room === 'object') s.room = { n: [5, 7, 10, 15].includes(raw.room.n) ? raw.room.n : 7, s: [15, 20, 25, 30].includes(raw.room.s) ? raw.room.s : 25, b: lsInt(raw.room.b, 0, 3, 1) };
  return s;
}
function lsStreak(sv) {
  const t = lsDay();
  let d = sv.days[t] && sv.days[t].done ? t : t - 1, n = 0;
  while (sv.days[d] && sv.days[d].done) { n++; d--; }
  return n;
}
function lsBestStreak(sv) {
  const ks = Object.keys(sv.days).map(Number).filter(k => sv.days[k].done).sort((a, b) => a - b);
  let b = 0, c = 0, p = -9;
  ks.forEach(k => { c = k === p + 1 ? c + 1 : 1; p = k; if (c > b) b = c; });
  return b;
}
const lsDayPts = d => d ? d.a.reduce((s, x) => s + x[1], 0) : 0;
