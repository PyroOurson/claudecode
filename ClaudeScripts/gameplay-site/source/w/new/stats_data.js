(() => {
const SDK = 'gameplay:sd';
const sdT = s => window.gpI18n && typeof gpI18n.t === 'function' ? gpI18n.t(s) : s;
const sdTf = (s, o) => Object.keys(o || {}).reduce((a, k) => a.split('{' + k + '}').join(o[k]), sdT(s));
const sdLang = () => window.gpI18n && gpI18n.lang || document.documentElement.lang || 'en';
const sdEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sdNum = (v, d) => { const x = +v; if (!isFinite(x)) return '–'; try { return x.toLocaleString(sdLang(), { maximumFractionDigits: d == null ? (Math.abs(x) < 10 && x % 1 ? 1 : 0) : d }); } catch (e) { return String(Math.round(x)); } };
const sdPct = (a, b) => b > 0 ? sdNum(100 * a / b, 1) + ' %' : '–';
const sdDur = v => { const s = +v; if (!isFinite(s)) return '–'; if (s < 60) return sdNum(s, 0) + ' ' + sdT('s'); if (s < 3600) return sdNum(s / 60, 1) + ' ' + sdT('min'); if (s < 86400 * 2) return sdNum(s / 3600, 1) + ' ' + sdT('h'); return sdNum(s / 86400, 1) + ' ' + sdT('days'); };
const sdMs = v => { const s = +v; if (!isFinite(s)) return '–'; return s < 1000 ? sdNum(s, 0) + ' ms' : sdNum(s / 1000, 2) + ' ' + sdT('s'); };
const sdMb = v => isFinite(+v) ? sdNum(+v, 0) + ' MB' : '–';
const sdAvg = (s, n) => n > 0 ? s / n : NaN;
const sdGames = () => { try { return (window.Ameplay && Ameplay.debug && Ameplay.debug.games) || []; } catch (e) { return []; } };
const sdGame = id => id === '-' ? sdT('Outside a game') : id === '' ? sdT('Whole site') : ((sdGames().find(g => g.id === id) || {}).title || id);
const sdCountry = cc => { if (!cc || cc === '??') return sdT('Unknown'); if (cc === 'T1') return 'Tor'; try { return new Intl.DisplayNames([sdLang()], { type: 'region' }).of(cc) || cc; } catch (e) { return cc; } };
const SD_UNITS = { sec: sdDur, ms: sdMs, mb: sdMb, num: v => sdNum(v), mbps: v => sdNum(v) + ' Mbit/s', ms0: v => sdNum(v) + ' ms', s1: v => sdNum(v) + ' ' + sdT('s') };
const sdBk = (lab, u) => { const m = String(lab).match(/^(<|>=)(-?[0-9.]+)$/); if (!m) return lab === '?' ? sdT('Unknown') : lab; const f = SD_UNITS[u] || SD_UNITS.num; return (m[1] === '<' ? '< ' : '≥ ') + f(+m[2]); };
const sdBkOrd = lab => { const m = String(lab).match(/^(<|>=)(-?[0-9.]+)$/); return m ? +m[2] + (m[1] === '>=' ? .5 : 0) : 1e18; };
const SD_ACCT = [['players', 'Players (no staff or test accounts)'], ['user', 'With an account'], ['anon', 'Without an account'], ['staff', 'Staff'], ['test', 'Test accounts'], ['all', 'Everyone']];
const SD_RANGES = [['1', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months'], ['c', 'Custom']];
const SD_GROUPS = [['act', 'Activity and retention'], ['games', 'Games'], ['dev', 'Devices and performance'], ['multi', 'Multiplayer'], ['social', 'Social and support'], ['safe', 'Accounts and safety']];
const SD = { el: null, st: null, d: null, busy: false, err: '', seq: 0, sort: {}, open: {}, dims: null, tries: 0, tm: 0 };
const sdLoad = () => { let o = null; try { o = JSON.parse(localStorage.getItem(SDK) || 'null'); } catch (e) {} o = o && typeof o === 'object' ? o : {}; return { range: SD_RANGES.some(r => r[0] === o.range) ? o.range : '30', from: /^\d{4}-\d{2}-\d{2}$/.test(o.from || '') ? o.from : '', to: /^\d{4}-\d{2}-\d{2}$/.test(o.to || '') ? o.to : '', game: typeof o.game === 'string' ? o.game : '', cc: typeof o.cc === 'string' ? o.cc : '', dev: ['phone', 'tablet', 'desktop'].includes(o.dev) ? o.dev : '', acct: SD_ACCT.some(a => a[0] === o.acct) ? o.acct : 'players' }; };
const sdSave = () => { try { localStorage.setItem(SDK, JSON.stringify(SD.st)); } catch (e) {} };
const sdDay = d => { const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return x.toISOString().slice(0, 10); };
function sdSpan() {
  const st = SD.st, to = new Date();
  if (st.range === 'c' && st.from) return { from: st.from, to: st.to || sdDay(to) };
  const n = +st.range || 30, f = new Date(to.getTime() - (n - 1) * 864e5);
  return { from: sdDay(f), to: sdDay(to) };
}
async function sdRpc(f, b) {
  const S = window.Ameplay && Ameplay.statsData;
  if (S && typeof S.rpc === 'function') return S.rpc(f, b || {});
  if (typeof sbRest === 'function') return sbRest('rpc/' + f, { method: 'POST', body: b || {} });
  throw new Error('No connection to the database');
}
function sdIndex(d) {
  const R = new Map(), F = new Map();
  (d.rows || []).forEach(([k, g, n, s]) => {
    const x = { k, g, n: +n || 0, s: +s || 0 };
    const c = k.indexOf(':'), f = c < 0 ? k : k.slice(0, c);
    if (!F.has(f)) F.set(f, []);
    F.get(f).push(Object.assign(x, { v: c < 0 ? '' : k.slice(c + 1) }));
    const t = R.get(k) || { n: 0, s: 0 };
    t.n += x.n; t.s += x.s; R.set(k, t);
  });
  const days = [], D = new Map();
  const n0 = Math.round((Date.parse(d.to) - Date.parse(d.from)) / 864e5) + 1;
  for (let i = 0; i < n0; i++) days.push(sdDay(new Date(Date.parse(d.from + 'T12:00:00') + i * 864e5)));
  (d.daily || []).forEach(([i, f, n, s]) => { if (!D.has(f)) D.set(f, new Map()); D.get(f).set(i, { n: +n || 0, s: +s || 0 }); });
  return {
    d, days,
    tot: k => R.get(k) || { n: 0, s: 0 },
    fam: f => F.get(f) || [],
    val: (f, v) => (F.get(f) || []).filter(x => x.v === v).reduce((a, x) => ({ n: a.n + x.n, s: a.s + x.s }), { n: 0, s: 0 }),
    byV: f => { const m = new Map(); (F.get(f) || []).forEach(x => { const o = m.get(x.v) || { v: x.v, n: 0, s: 0 }; o.n += x.n; o.s += x.s; m.set(x.v, o); }); return [...m.values()]; },
    byG: f => { const m = new Map(); (F.get(f) || []).forEach(x => { const o = m.get(x.g) || { g: x.g, n: 0, s: 0 }; o.n += x.n; o.s += x.s; m.set(x.g, o); }); return m; },
    day: f => { const m = D.get(f) || new Map(); return days.map((x, i) => m.get(i) || { n: 0, s: 0 }); }
  };
}
const SD_COL = ['var(--sd-c0)', 'var(--sd-c1)', 'var(--sd-c2)', 'var(--sd-c3)', 'var(--sd-c4)', 'var(--sd-c5)'];
function sdLine(series, labels, o = {}) {
  const W = 640, H = o.h || 170, P = { l: 40, r: 10, t: 10, b: 22 }, n = labels.length;
  if (!n) return '';
  const max = Math.max(1, ...series.flatMap(s => s.v.map(v => +v || 0)));
  const x = i => P.l + (n === 1 ? (W - P.l - P.r) / 2 : i * (W - P.l - P.r) / (n - 1)), y = v => H - P.b - (v / max) * (H - P.t - P.b);
  const grid = [0, .5, 1].map(f => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(max * f)}" y2="${y(max * f)}" class="sd-gl"/><text x="${P.l - 6}" y="${y(max * f) + 4}" class="sd-ax" text-anchor="end">${sdEsc(o.fmt ? o.fmt(max * f) : sdNum(max * f))}</text>`).join('');
  const tick = Math.max(1, Math.ceil(n / 6)), xl = labels.map((l, i) => i % tick === 0 || i === n - 1 ? `<text x="${x(i)}" y="${H - 6}" class="sd-ax" text-anchor="middle">${sdEsc(l)}</text>` : '').join('');
  const lines = series.map((s, j) => { const pts = s.v.map((v, i) => x(i).toFixed(1) + ',' + y(+v || 0).toFixed(1)).join(' '); return n === 1 ? `<circle cx="${x(0)}" cy="${y(+s.v[0] || 0)}" r="3.5" style="fill:${SD_COL[j % 6]}"/>` : `<polyline points="${pts}" fill="none" style="stroke:${SD_COL[j % 6]}" class="sd-ln"/>`; }).join('');
  const dots = n <= 62 ? series.map((s, j) => s.v.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(+v || 0).toFixed(1)}" r="7" class="sd-hit"><title>${sdEsc(labels[i] + ' · ' + s.t + ': ' + (o.fmt ? o.fmt(+v || 0) : sdNum(+v || 0)))}</title></circle>`).join('')).join('') : '';
  const leg = series.length > 1 ? `<div class="sd-leg">${series.map((s, j) => `<span><i style="background:${SD_COL[j % 6]}"></i>${sdEsc(s.t)}</span>`).join('')}</div>` : '';
  return `<figure class="sd-fig"><svg viewBox="0 0 ${W} ${H}" class="sd-svg" role="img" aria-label="${sdEsc(o.label || series.map(s => s.t).join(', '))}">${grid}${lines}${dots}${xl}</svg>${leg}</figure>`;
}
function sdBars(items, o = {}) {
  const L = items.filter(x => x.v > 0).slice(0, o.top || 12);
  if (!L.length) return '';
  const max = Math.max(...L.map(x => x.v)), tot = o.tot || items.reduce((a, x) => a + x.v, 0);
  return `<div class="sd-bars">${L.map((x, i) => `<div class="sd-bar" style="--w:${(100 * x.v / max).toFixed(1)}%;--i:${i}"><span class="sd-bl" title="${sdEsc(x.l)}">${sdEsc(x.l)}</span><b>${sdEsc(o.fmt ? o.fmt(x.v) : sdNum(x.v))}</b><em>${o.share === false ? '' : sdPct(x.v, tot)}</em></div>`).join('')}</div>`;
}
function sdCols(items, o = {}) {
  const L = items.slice(0, 30);
  if (!L.length || !L.some(x => x.v > 0)) return '';
  const W = o.w || 640, H = o.h || (o.w ? 130 : 150), n = L.length, bw = Math.min(64, (W - 16) / n), P = { l: (W - bw * n) / 2, r: 8, t: 14, b: 32 }, max = Math.max(1, ...L.map(x => x.v));
  const bars = L.map((x, i) => { const h = (x.v / max) * (H - P.t - P.b), X = P.l + i * bw + bw * .12; return `<rect x="${X.toFixed(1)}" y="${(H - P.b - h).toFixed(1)}" width="${(bw * .76).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="3" class="sd-col"><title>${sdEsc(x.l + ': ' + (o.fmt ? o.fmt(x.v) : sdNum(x.v)))}</title></rect>${x.v && n <= 16 ? `<text x="${(X + bw * .38).toFixed(1)}" y="${(H - P.b - h - 3).toFixed(1)}" class="sd-ax" text-anchor="middle">${sdEsc(sdNum(x.v))}</text>` : ''}`; }).join('');
  const tick = Math.max(1, Math.ceil(n / 12)), lab = L.map((x, i) => i % tick === 0 ? `<text x="${(P.l + i * bw + bw / 2).toFixed(1)}" y="${H - 12}" class="sd-ax" text-anchor="middle">${sdEsc(String(x.l).slice(0, 12))}</text>` : '').join('');
  return `<figure class="sd-fig"><svg viewBox="0 0 ${W} ${H}" class="sd-svg" role="img" aria-label="${sdEsc(o.label || '')}">${bars}${lab}</svg></figure>`;
}
function sdHeat(cells) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(sdT), max = Math.max(.01, ...cells.map(c => +c[2] || 0)), cw = 24, ch = 20, L = 40, T = 18, W = L + 24 * cw + 4, H = T + 7 * ch + 4;
  const r = cells.map(([d, h, v]) => `<rect x="${L + h * cw + 1}" y="${T + d * ch + 1}" width="${cw - 2}" height="${ch - 2}" rx="4" style="fill:var(--sd-c0);fill-opacity:${(0.06 + 0.94 * (+v || 0) / max).toFixed(3)}"><title>${sdEsc(days[d] + ' ' + String(h).padStart(2, '0') + ':00 · ' + sdNum(v, 2))}</title></rect>`).join('');
  const hl = [0, 3, 6, 9, 12, 15, 18, 21].map(h => `<text x="${L + h * cw + cw / 2}" y="12" class="sd-ax" text-anchor="middle">${String(h).padStart(2, '0')}</text>`).join('');
  const dl = days.map((d, i) => `<text x="${L - 6}" y="${T + i * ch + 14}" class="sd-ax" text-anchor="end">${sdEsc(d)}</text>`).join('');
  return `<figure class="sd-fig"><svg viewBox="0 0 ${W} ${H}" class="sd-svg sd-heat" role="img" aria-label="${sdEsc(sdT('Players by hour of day and day of week'))}">${hl}${dl}${r}</svg></figure>`;
}
function sdFunnel(steps) {
  const top = Math.max(1, ...steps.map(s => s.n));
  return `<div class="sd-fun">${steps.map((s, i) => `<div class="sd-fs" style="--w:${(100 * s.n / top).toFixed(1)}%"><span>${sdEsc(s.l)}</span><b>${sdNum(s.n)}</b><em>${i ? sdTf('{p} kept, {q} left', { p: sdPct(s.n, steps[i - 1].n), q: sdNum(Math.max(0, steps[i - 1].n - s.n)) }) : ''}</em></div>`).join('')}</div>`;
}
const sdKpis = list => `<div class="sd-kpis">${list.map(k => `<div class="sd-kpi"><span>${sdEsc(k[0])}</span><b>${sdEsc(k[1])}</b>${k[2] ? `<em>${sdEsc(k[2])}</em>` : ''}</div>`).join('')}</div>`;
function sdTableHtml(id, t) {
  const so = SD.sort[id] || { k: t.sort || (t.cols.find(c => c.num) || t.cols[0]).k, d: t.sort ? (t.dir || -1) : -1 };
  const rows = t.rows.slice().sort((a, b) => { const x = a[so.k], y = b[so.k]; const r = typeof x === 'number' || typeof y === 'number' ? (+x || 0) - (+y || 0) : String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), sdLang()); return r * so.d; });
  const lim = SD.open[id] ? rows.length : Math.min(rows.length, t.lim || 15);
  const body = rows.slice(0, lim).map(r => `<tr>${t.cols.map(c => `<td class="${c.num ? 'sd-n' : ''}">${c.html ? c.html(r) : sdEsc(c.f ? c.f(r[c.k], r) : r[c.k] == null ? '–' : r[c.k])}</td>`).join('')}</tr>`).join('');
  const more = rows.length > lim ? `<button type="button" class="sd-more" data-sdm="${sdEsc(id)}">${sdEsc(sdTf('Show all {n} rows', { n: sdNum(rows.length) }))}</button>` : '';
  return `<div class="sd-tw">${t.title ? `<h4 class="sd-tt">${sdEsc(t.title)}</h4>` : ''}<div class="sd-ts"><table class="sd-tab" data-sdt="${sdEsc(id)}"><thead><tr>${t.cols.map(c => `<th class="${c.num ? 'sd-n' : ''}" aria-sort="${c.k === so.k ? (so.d > 0 ? 'ascending' : 'descending') : 'none'}"><button type="button" data-sdk="${sdEsc(c.k)}">${sdEsc(c.t)}${c.k === so.k ? (so.d > 0 ? ' ▲' : ' ▼') : ''}</button></th>`).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${t.cols.length}" class="sd-none">${sdEsc(sdT('No data for these filters yet.'))}</td></tr>`}</tbody></table></div>${more}</div>`;
}
const cG = { k: 'game', t: 'Game', f: v => sdGame(v) };
const cN = (k, t, f) => ({ k, t, num: true, f: f || (v => sdNum(v)) });
const cS = (k, t, f) => ({ k, t, f });
const gRows = (I, f, extra) => [...I.byG(f).values()].map(x => Object.assign({ game: x.g, n: x.n, s: x.s }, extra ? extra(x) : {}));
const vRows = (I, f, lab) => { const L = I.byV(f), tot = L.reduce((a, x) => a + x.n, 0); return L.map(x => ({ v: lab ? lab(x.v) : x.v, raw: x.v, n: x.n, s: x.s, sh: tot ? 100 * x.n / tot : 0 })); };
const shCol = { k: 'sh', t: 'Share', num: true, f: v => sdNum(v, 1) + ' %' };
const bkItems = (I, f, u) => I.byV(f).sort((a, b) => sdBkOrd(a.v) - sdBkOrd(b.v)).map(x => ({ l: sdBk(x.v, u), v: x.n, raw: x.v }));
const bkTable = (I, f, u, t) => ({ title: t, cols: [cS('l', 'Range'), cN('v', 'Count'), shCol], sort: 'o', dir: 1, rows: (() => { const L = bkItems(I, f, u), tot = L.reduce((a, x) => a + x.v, 0); return L.map((x, i) => ({ l: x.l, v: x.v, sh: tot ? 100 * x.v / tot : 0, o: i })); })() });
const bkPct = (I, f, p) => { const L = I.byV(f).sort((a, b) => sdBkOrd(a.v) - sdBkOrd(b.v)), tot = L.reduce((a, x) => a + x.n, 0); let c = 0; for (const x of L) { c += x.n; if (c >= p * tot) return x.v; } return null; };
const gameSum = (I, f) => { const m = new Map(); I.fam(f).forEach(x => { const o = m.get(x.g) || { n: 0, s: 0, c: {} }; o.n += x.n; o.s += x.s; o.c[x.v] = (o.c[x.v] || 0) + x.n; m.set(x.g, o); }); return m; };
const dayLab = I => I.days.map(d => d.slice(5));
const M = [];
const def = (n, g, t, d, nf, draw) => M.push({ n, g, t, d, nf, draw });

def(1, 'act', 'Daily, weekly and monthly active players', 'Distinct players active on each day, in the 7 days and in the 30 days up to that day.', [], I => {
  const by = new Map((I.d.act || []).map(a => [a.d, a])), A = I.days.map(d => by.get(d) || { d, dau: 0, wau: 0, mau: 0 }), last = A[A.length - 1] || {};
  const avg = A.reduce((a, x) => a + x.dau, 0) / Math.max(1, A.length);
  return { html: sdKpis([[sdT('Active today'), sdNum(last.dau || 0)], [sdT('Last 7 days'), sdNum(last.wau || 0)], [sdT('Last 30 days'), sdNum(last.mau || 0)], [sdT('Average per day'), sdNum(avg, 1)], [sdT('Stickiness'), sdPct(last.dau || 0, last.mau || 0), sdT('active today among the last 30 days')]]) + sdLine([{ t: sdT('Daily'), v: A.map(x => x.dau) }, { t: sdT('Weekly'), v: A.map(x => x.wau) }, { t: sdT('Monthly'), v: A.map(x => x.mau) }], dayLab(I)),
    tables: [{ cols: [cS('d', 'Day'), cN('dau', 'Daily'), cN('wau', 'Weekly'), cN('mau', 'Monthly')], sort: 'd', dir: -1, rows: A.filter(x => x.dau || x.wau || x.mau) }] };
});
def(2, 'act', 'Retention after 1, 7 and 30 days', 'For each week of sign-up (first visit for players without an account): the share who came back exactly 1, 7 and 30 days later.', ['game'], I => {
  const R = (I.d.ret || []).map(r => ({ wk: r.wk, n: r.n, d1: r.e1 ? 100 * r.r1 / r.e1 : null, d7: r.e7 ? 100 * r.r7 / r.e7 : null, d30: r.e30 ? 100 * r.r30 / r.e30 : null, r1: r.r1, r7: r.r7, r30: r.r30 }));
  const w = (k, e) => { const t = (I.d.ret || []).reduce((a, r) => [a[0] + (r['r' + k] || 0), a[1] + (r['e' + k] || 0)], [0, 0]); return sdPct(t[0], t[1]); };
  const pf = v => v == null ? sdT('not yet') : sdNum(v, 1) + ' %';
  return { html: sdKpis([[sdT('Day 1'), w(1)], [sdT('Day 7'), w(7)], [sdT('Day 30'), w(30)], [sdT('New players'), sdNum(R.reduce((a, r) => a + r.n, 0))]]),
    tables: [{ cols: [cS('wk', 'Week of sign-up'), cN('n', 'New players'), cN('d1', 'Day 1', pf), cN('d7', 'Day 7', pf), cN('d30', 'Day 30', pf)], sort: 'wk', dir: -1, rows: R }] };
});
def(3, 'act', 'Session start, end and length', 'A session is one visit: from the first to the last event, or the length the browser reported, whichever is longer.', ['game'], I => {
  const t = I.tot('m3.n'), hrs = [...Array(24).keys()].map(h => ({ l: String(h).padStart(2, '0'), v: I.val('m3.h0', String(h)).n, e: I.val('m3.h1', String(h)).n }));
  return { html: sdKpis([[sdT('Sessions'), sdNum(t.n)], [sdT('Average length'), sdDur(sdAvg(t.s, t.n))], [sdT('Half are shorter than'), sdBk(bkPct(I, 'm3.b', .5) || '?', 'sec')], [sdT('Total time on the site'), sdDur(t.s)]]) + sdLine([{ t: sdT('Sessions'), v: I.day('m3.n').map(x => x.n) }], dayLab(I)) + `<div class="sd-two"><div><h4 class="sd-tt">${sdEsc(sdT('Length'))}</h4>${sdCols(bkItems(I, 'm3.b', 'sec'), { w: 320 })}</div><div><h4 class="sd-tt">${sdEsc(sdT('Start hour'))}</h4>${sdCols(hrs, { label: sdT('Start hour'), w: 320 })}</div></div>`,
    tables: [bkTable(I, 'm3.b', 'sec', sdT('Length')), { title: sdT('Start and end hour'), cols: [cS('l', 'Hour'), cN('v', 'Sessions started'), cN('e', 'Sessions ended')], sort: 'l', dir: 1, rows: hrs.filter(x => x.v || x.e) }] };
});
def(4, 'act', 'Screens per session, entry and exit screen', 'Screens are the home page, a game, the legal pages and the dashboard.', ['game'], I => {
  const t = I.tot('m4.scr'), lab = v => ({ home: sdT('Home'), game: sdT('Game'), legal: sdT('Legal pages'), admin: sdT('Dashboard'), '?': sdT('Unknown') }[v] || v);
  return { html: sdKpis([[sdT('Screens per session'), sdNum(sdAvg(t.s, t.n), 2)], [sdT('Sessions'), sdNum(t.n)]]),
    tables: [{ title: sdT('Entry screen'), cols: [cS('v', 'Screen'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm4.ent', lab) }, { title: sdT('Exit screen'), cols: [cS('v', 'Screen'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm4.ext', lab) }] };
});
def(5, 'act', 'Activity by hour of day and day of week', 'Average number of distinct players active in each hour (Paris time).', [], I => {
  const H = I.d.heat || [], rows = H.map(([d, h, v]) => ({ d: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(sdT)[d], o: d * 24 + h, h: String(h).padStart(2, '0') + ':00', v: +v }));
  return { html: sdHeat(H), tables: [{ cols: [cS('d', 'Day'), cS('h', 'Hour'), cN('v', 'Average players', v => sdNum(v, 2))], sort: 'v', rows: rows.filter(r => r.v > 0) }] };
});
def(6, 'act', 'Peak concurrent players', 'Players online at the same time, counted by the server every second: now, the highest second and minute of the last 48 hours, each day and of all time, per game when a game is chosen.', ['cc', 'dev', 'acct'], I => {
  const m = I.d.m6 || {}, D = m.days || [], by = new Map(D.map(x => [x.d, x])), tm = t => t ? new Date(t).toLocaleString(sdLang()) : '';
  const h1 = (m.h1 || []).map(([t, n]) => ({ t: new Date(t * 1000).toLocaleTimeString(sdLang(), { hour: '2-digit', minute: '2-digit' }), n }));
  return { html: sdKpis([[sdT('Online now'), sdNum(m.now || 0)], [sdT('All-time peak'), m.best ? sdNum(m.best.n) : '–', m.best ? tm(m.best.at) : ''], [sdT('Highest second, 48 h'), m.sec ? sdNum(m.sec.n) : '–', m.sec ? tm(m.sec.at) : ''], [sdT('Highest minute, 48 h'), m.min ? sdNum(m.min.n) : '–', m.min ? tm(m.min.at) : ''], [sdT('Highest day in this period'), sdNum(Math.max(0, ...D.map(x => x.n)))]]) + sdLine([{ t: sdT('Daily peak'), v: I.days.map(d => (by.get(d) || {}).n || 0) }], dayLab(I)) + (h1.length ? `<h4 class="sd-tt">${sdEsc(sdT('Last hour, per minute'))}</h4>` + sdLine([{ t: sdT('Players'), v: h1.map(x => x.n) }], h1.map(x => x.t), { h: 130 }) : ''),
    tables: [{ title: sdT('Daily peak'), cols: [cS('d', 'Day'), cN('n', 'Players'), cS('t', 'Time')], sort: 'd', dir: -1, rows: D.map(x => ({ d: x.d, n: x.n, t: x.at ? new Date(x.at).toLocaleTimeString(sdLang(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '' })) }, { title: sdT('Online now per game'), cols: [cG, cN('n', 'Players')], rows: (m.games || []).map(x => ({ game: x.g, n: x.n })) }] };
});
def(7, 'act', 'Where visitors came from', 'The website that linked to the site, or direct when there was none.', ['game'], I => {
  const R = vRows(I, 'm7', v => v === 'direct' ? sdT('Direct') : v);
  return { html: sdBars(R.map(x => ({ l: x.v, v: x.n }))), tables: [{ cols: [cS('v', 'Source'), cN('n', 'Sessions'), shCol], rows: R }] };
});
def(8, 'act', 'Time from arriving to the first game', 'Time between the start of a session and the first game started in it.', ['game'], I => {
  const t = I.tot('m8.t'), no = I.tot('m8.none').n;
  return { html: sdKpis([[sdT('Average'), sdDur(sdAvg(t.s, t.n))], [sdT('Half start within'), sdBk(bkPct(I, 'm8.b', .5) || '?', 'sec')], [sdT('Sessions that started a game'), sdPct(t.n, t.n + no)]]) + sdCols(bkItems(I, 'm8.b', 'sec')), tables: [bkTable(I, 'm8.b', 'sec')] };
});
def(9, 'games', 'Game opened compared with game started', 'Opened: the game page was opened. Loaded: the game started. Played: the player pressed a key or touched it. Failed: the game could not load or start.', [], I => {
  const o = I.byG('m9.open'), l = I.byG('m9.launch'), p = I.byG('m9.play'), f = I.byG('m9.fail'), ids = new Set([...o.keys(), ...l.keys(), ...f.keys()]);
  const rows = [...ids].map(g => { const a = (o.get(g) || {}).n || 0, b = (l.get(g) || {}).n || 0, c = (p.get(g) || {}).n || 0, e = (f.get(g) || {}).n || 0; return { game: g, o: a, l: b, p: c, f: e, r: a ? 100 * e / a : 0 }; });
  const T = k => rows.reduce((a, r) => a + r[k], 0);
  return { html: sdKpis([[sdT('Opened'), sdNum(T('o'))], [sdT('Loaded'), sdNum(T('l'))], [sdT('Played'), sdNum(T('p'))], [sdT('Failed'), sdNum(T('f')), sdPct(T('f'), T('o'))]]) + sdLine([{ t: sdT('Opened'), v: I.day('m9.open').map(x => x.n) }, { t: sdT('Played'), v: I.day('m9.play').map(x => x.n) }, { t: sdT('Failed'), v: I.day('m9.fail').map(x => x.n) }], dayLab(I)),
    tables: [{ cols: [cG, cN('o', 'Opened'), cN('l', 'Loaded'), cN('p', 'Played'), cN('f', 'Failed'), cN('r', 'Failed share', v => sdNum(v, 1) + ' %')], rows }] };
});
def(10, 'games', 'Load time per game', 'Time from opening a game to the moment it started.', [], I => {
  const rows = [...gameSum(I, 'm10.b').entries()].map(([g, x]) => { const t = (I.byG('m10.t').get(g) || { n: 0, s: 0 }); const c = Object.entries(x.c).sort((a, b) => sdBkOrd(a[0]) - sdBkOrd(b[0])); let k = 0, med = null; for (const [v, n] of c) { k += n; if (med == null && k >= x.n / 2) med = v; } return { game: g, n: t.n, a: sdAvg(t.s, t.n), m: med, sl: c.filter(([v]) => sdBkOrd(v) > 4000).reduce((a, [, n]) => a + n, 0) }; });
  const t = I.tot('m10.t');
  return { html: sdKpis([[sdT('Average'), sdMs(sdAvg(t.s, t.n))], [sdT('Half load within'), sdBk(bkPct(I, 'm10.b', .5) || '?', 'ms')], [sdT('Loads'), sdNum(t.n)]]) + sdCols(bkItems(I, 'm10.b', 'ms')),
    tables: [{ cols: [cG, cN('n', 'Loads'), cN('a', 'Average', sdMs), cS('m', 'Half within', v => v ? sdBk(v, 'ms') : '–'), cN('sl', 'Over 4 s')], rows }] };
});
def(11, 'games', 'Playtime per game per session', 'Time spent in each game during one session, counting only time with the page visible and the player active.', [], I => {
  const rows = gRows(I, 'm11.t', x => ({ a: sdAvg(x.s, x.n) }));
  const t = I.tot('m11.t');
  return { html: sdKpis([[sdT('Total playtime'), sdDur(t.s)], [sdT('Average per game per session'), sdDur(sdAvg(t.s, t.n))]]) + sdBars(rows.sort((a, b) => b.s - a.s).map(r => ({ l: sdGame(r.game), v: r.s })), { fmt: sdDur }),
    tables: [{ cols: [cG, cN('n', 'Sessions'), cN('s', 'Total', sdDur), cN('a', 'Average per session', sdDur)], sort: 's', rows }, bkTable(I, 'm11.b', 'sec', sdT('Time per game per session'))] };
});
def(12, 'games', 'Rounds started, finished and abandoned', 'A round is finished when the game shows its result screen. Abandoned: the player left or restarted during a round.', [], I => {
  const s = I.byG('m12.start'), f = I.byG('m12.fin'), a = I.byG('m12.ab');
  const rows = [...s.keys()].map(g => { const x = (s.get(g) || {}).s || 0, y = (f.get(g) || {}).s || 0, z = (a.get(g) || {}).s || 0; return { game: g, st: x, fi: y, ab: z, r: x ? 100 * z / x : 0 }; });
  const T = k => rows.reduce((q, r) => q + r[k], 0);
  return { html: sdKpis([[sdT('Started'), sdNum(T('st'))], [sdT('Finished'), sdNum(T('fi'))], [sdT('Abandoned'), sdNum(T('ab')), sdPct(T('ab'), T('st'))]]),
    tables: [{ cols: [cG, cN('st', 'Started'), cN('fi', 'Finished'), cN('ab', 'Abandoned'), cN('r', 'Abandoned share', v => sdNum(v, 1) + ' %')], rows }] };
});
def(13, 'games', 'Where players quit', 'The level, wave or stage reached when the player left the game, and the score shown at that moment.', [], I => {
  const L = gameSum(I, 'm13.lv'), W = gameSum(I, 'm13.why'), last = I.byG('m13.last');
  const rows = [...L.entries()].map(([g, x]) => { const lv = Object.entries(x.c).filter(([v]) => v !== 'none'), n = lv.reduce((a, [, c]) => a + c, 0), top = lv.sort((a, b) => b[1] - a[1])[0], w = (W.get(g) || { c: {} }).c, ls = last.get(g); return { game: g, n: x.n, wl: n, top: top ? top[0] : null, tn: top ? top[1] : 0, ex: w.exit || 0, cl: w.close || 0, rs: w.restart || 0, sc: ls ? sdAvg(ls.s, ls.n) : null }; });
  const g = SD.st.game || (rows.sort((a, b) => b.wl - a.wl)[0] || {}).game, x = L.get(g);
  const dist = x ? Object.entries(x.c).filter(([v]) => v !== 'none').sort((a, b) => (parseFloat(a[0]) || 99) - (parseFloat(b[0]) || 99)).map(([v, n]) => ({ l: v, v: n })) : [];
  return { html: (dist.length ? `<h4 class="sd-tt">${sdEsc(sdTf('Level when leaving · {g}', { g: sdGame(g) }))}</h4>` + sdCols(dist) : ''),
    tables: [{ cols: [cG, cN('n', 'Quits'), cN('wl', 'With a level'), cS('top', 'Most common level'), cN('tn', 'Quits there'), cN('sc', 'Average score at quit'), cN('ex', 'Left the game'), cN('cl', 'Closed the page'), cN('rs', 'Restarted')], rows }] };
});
def(14, 'games', 'Difficulty chosen and win rate', 'The difficulty or computer level picked in the game menu, and the share of finished rounds won.', [], I => {
  const n = I.fam('m14.n'), l = I.fam('m14.l'), key = x => x.g + '|' + x.v, ls = new Map(l.map(x => [key(x), x]));
  const rows = n.map(x => { const y = ls.get(key(x)) || { s: 0 }, w = x.s, lo = y.s; return { game: x.g, dif: x.v === '-' ? sdT('No difficulty') : x.v.replace(/^[a-z]+=/, ''), n: x.n, w, l: lo, r: w + lo ? 100 * w / (w + lo) : null }; });
  return { html: '', tables: [{ cols: [cG, cS('dif', 'Difficulty'), cN('n', 'Game visits'), cN('w', 'Rounds won'), cN('l', 'Rounds lost'), cN('r', 'Win rate', v => v == null ? '–' : sdNum(v, 1) + ' %')], sort: 'n', rows }] };
});
def(15, 'games', 'Score distribution per game', 'Scores submitted at the end of rounds, grouped on a scale of powers of ten.', [], I => {
  const S = gameSum(I, 'm15.b'), sums = I.byG('m15.b');
  const fx = v => { const a = Math.pow(10, +v), b = Math.pow(10, +v + .25); return sdNum(a, a < 10 ? 1 : 0) + '–' + sdNum(b, b < 10 ? 1 : 0); };
  const rows = [...S.entries()].map(([g, x]) => { const c = Object.entries(x.c).sort((a, b) => +a[0] - +b[0]); let k = 0, med = null, p9 = null; for (const [v, n] of c) { k += n; if (med == null && k >= x.n / 2) med = v; if (p9 == null && k >= x.n * .9) p9 = v; } return { game: g, n: x.n, a: sdAvg((sums.get(g) || {}).s || 0, x.n), m: med, p: p9 }; });
  const g = SD.st.game || (rows.sort((a, b) => b.n - a.n)[0] || {}).game, x = S.get(g);
  const dist = x ? Object.entries(x.c).sort((a, b) => +a[0] - +b[0]).map(([v, n]) => ({ l: fx(v), v: n })) : [];
  return { html: dist.length ? `<h4 class="sd-tt">${sdEsc(sdGame(g))}</h4>` + sdCols(dist) : '', tables: [{ cols: [cG, cN('n', 'Scores'), cN('a', 'Average'), cS('m', 'Median range', v => v == null ? '–' : fx(v)), cS('p', 'Top 10 % from', v => v == null ? '–' : fx(v))], rows }] };
});
def(16, 'games', 'Played alone, against bots or online', 'Worked out from the mode picked in the game and from party events. Offline means a game that has other players was played without a party, without a clear computer or local mode.', [], I => {
  const lab = v => ({ solo: sdT('Alone'), bots: sdT('Against the computer'), local: sdT('Two players on one device'), online: sdT('Online'), offline: sdT('Offline, mode not known'), unknown: sdT('Not recorded') }[v] || v);
  const V = vRows(I, 'm16', lab), S = gameSum(I, 'm16');
  return { html: sdBars(V.map(x => ({ l: x.v, v: x.n }))), tables: [{ cols: [cG, cN('n', 'Game visits'), cN('solo', 'Alone'), cN('bots', 'Computer'), cN('local', 'Local'), cN('online', 'Online'), cN('offline', 'Offline')], rows: [...S.entries()].map(([g, x]) => ({ game: g, n: x.n, solo: x.c.solo || 0, bots: x.c.bots || 0, local: x.c.local || 0, online: x.c.online || 0, offline: x.c.offline || 0 })) }] };
});
def(17, 'games', 'Restarts within a session', 'How often players pressed Restart, per game.', [], I => {
  const rows = gRows(I, 'm17', x => ({ a: sdAvg(x.s, x.n) })), t = I.tot('m17');
  return { html: sdKpis([[sdT('Restarts'), sdNum(t.s)], [sdT('Sessions with a restart'), sdNum(t.n)], [sdT('Restarts per such session'), sdNum(sdAvg(t.s, t.n), 2)]]), tables: [{ cols: [cG, cN('n', 'Sessions with a restart'), cN('s', 'Restarts'), cN('a', 'Per session', v => sdNum(v, 2))], sort: 's', rows }] };
});
const SRC = v => ({ rail: sdT('Continue playing'), fav: sdT('Favourites'), shelf: sdT('Category rows'), grid: sdT('All games'), side: sdT('Side list'), gotd: sdT('Game of the day'), more: sdT('More like this'), search: sdT('Search'), random: sdT('Random game'), link: sdT('Link'), '?': sdT('Unknown') }[v] || v);
def(18, 'games', 'Cover shown compared with cover clicked', 'A cover counts as shown when at least half of it stays on screen for one second.', [], I => {
  const sh = gameSum(I, 'm18.show'), ck = gameSum(I, 'm18.click'), ids = new Set([...sh.keys(), ...ck.keys()]);
  const rows = [...ids].map(g => { const a = (sh.get(g) || {}).n || 0, b = (ck.get(g) || {}).n || 0; return { game: g, a, b, r: a ? 100 * b / a : null }; });
  const src = new Map(); I.fam('m18.show').forEach(x => { const o = src.get(x.v) || { a: 0, b: 0 }; o.a += x.n; src.set(x.v, o); }); I.fam('m18.click').forEach(x => { const o = src.get(x.v) || { a: 0, b: 0 }; o.b += x.n; src.set(x.v, o); });
  const T = rows.reduce((q, r) => [q[0] + r.a, q[1] + r.b], [0, 0]);
  return { html: sdKpis([[sdT('Shown'), sdNum(T[0])], [sdT('Clicked'), sdNum(T[1])], [sdT('Click rate'), sdPct(T[1], T[0])]]),
    tables: [{ cols: [cG, cN('a', 'Shown'), cN('b', 'Clicked'), cN('r', 'Click rate', v => v == null ? '–' : sdNum(v, 1) + ' %')], sort: 'a', rows }, { title: sdT('By place on the page'), cols: [cS('v', 'Place'), cN('a', 'Shown'), cN('b', 'Clicked'), cN('r', 'Click rate', v => v == null ? '–' : sdNum(v, 1) + ' %')], rows: [...src.entries()].map(([v, x]) => ({ v: SRC(v), a: x.a, b: x.b, r: x.a ? 100 * x.b / x.a : null })) }] };
});
def(19, 'games', 'Continue playing, favourites, search and categories', 'Clicks on game covers by place, favourites added and removed, searches and category filters.', [], I => {
  const ck = vRows(I, 'm18.click', SRC), fav = I.byV('m19.fav'), fo = (fav.find(x => x.v === 'on') || {}).n || 0, ff = (fav.find(x => x.v === 'off') || {}).n || 0;
  return { html: sdKpis([[sdT('From Continue playing'), sdNum(I.val('m18.click', 'rail').n)], [sdT('Favourites added'), sdNum(fo)], [sdT('Favourites removed'), sdNum(ff)], [sdT('Searches'), sdNum(I.tot('m19.search').n)], [sdT('Search then Enter'), sdNum(I.tot('m19.search_go').n)]]) + sdBars(ck.map(x => ({ l: x.v, v: x.n }))),
    tables: [{ title: sdT('Clicks by place'), cols: [cS('v', 'Place'), cN('n', 'Clicks'), shCol], rows: ck }, { title: sdT('Category and filter use'), cols: [cS('v', 'Filter'), cN('n', 'Uses'), shCol], rows: vRows(I, 'm19.cat') }, { title: sdT('Sort order'), cols: [cS('v', 'Sort'), cN('n', 'Uses'), shCol], rows: vRows(I, 'm19.sort') }] };
});
def(20, 'games', 'Search terms and searches with no result', 'What players typed in the game search box (the 300 most frequent).', ['game'], I => {
  const R = I.byV('m20').map(x => ({ v: x.v, n: x.n, z: x.s }));
  const T = R.reduce((a, r) => [a[0] + r.n, a[1] + r.z], [0, 0]);
  return { html: sdKpis([[sdT('Searches'), sdNum(T[0])], [sdT('With no result'), sdNum(T[1]), sdPct(T[1], T[0])]]), tables: [{ cols: [cS('v', 'Term'), cN('n', 'Searches'), cN('z', 'No result')], rows: R }, { title: sdT('Searches with no result'), cols: [cS('v', 'Term'), cN('z', 'Searches')], sort: 'z', rows: R.filter(r => r.z > 0) }] };
});
def(21, 'games', 'Fullscreen and theater use', 'Times fullscreen was entered per game, and theater mode switched on or off.', [], I => {
  const th = I.byV('m21.th');
  return { html: sdKpis([[sdT('Fullscreen entered'), sdNum(I.tot('m21.fs').n)], [sdT('Theater switched on'), sdNum((th.find(x => x.v === 'on') || {}).n || 0)], [sdT('Theater switched off'), sdNum((th.find(x => x.v === 'off') || {}).n || 0)]]), tables: [{ cols: [cG, cN('n', 'Fullscreen')], rows: gRows(I, 'm21.fs') }] };
});
def(22, 'games', 'Achievements and milestones', 'New personal bests, and achievements announced by games that have them.', [], I => {
  const b = I.byG('m22.best'), a = I.byG('m22.ach'), ids = new Set([...b.keys(), ...a.keys()]);
  return { html: sdKpis([[sdT('New personal bests'), sdNum(I.tot('m22.best').n)], [sdT('Achievements'), sdNum(I.tot('m22.ach').n)]]), tables: [{ cols: [cG, cN('b', 'New bests'), cN('a', 'Achievements')], sort: 'b', rows: [...ids].map(g => ({ game: g, b: (b.get(g) || {}).n || 0, a: (a.get(g) || {}).n || 0 })) }] };
});
const envM = (n, t, d, f, lab) => def(n, 'dev', t, d, ['game'], I => { const R = vRows(I, f, lab); return { html: sdBars(R.map(x => ({ l: x.v, v: x.n }))), tables: [{ cols: [cS('v', t), cN('n', 'Sessions'), shCol], rows: R }] }; });
envM(23, 'Browser and version', 'One count per session.', 'm23');
envM(24, 'Operating system', 'One count per session.', 'm24');
def(25, 'dev', 'Device type, screen size and pixel density', 'One count per session.', ['game'], I => {
  const t = vRows(I, 'm25.t', v => ({ phone: sdT('Phone'), tablet: sdT('Tablet'), desktop: sdT('Computer'), unknown: sdT('Unknown') }[v] || v));
  return { html: sdBars(t.map(x => ({ l: x.v, v: x.n }))), tables: [{ title: sdT('Device type'), cols: [cS('v', 'Type'), cN('n', 'Sessions'), shCol], rows: t }, { title: sdT('Screen size'), cols: [cS('v', 'Screen'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm25.res') }, { title: sdT('Pixel density'), cols: [cS('v', 'Pixels per point'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm25.dpr') }] };
});
def(26, 'dev', 'Graphics card family', 'Vendor and broad tier only, worked out on the server from the name the browser reports.', ['game'], I => {
  const tier = { discrete: sdT('Separate card'), integrated: sdT('Built in'), mobile: sdT('Phone or tablet chip'), software: sdT('No graphics card (software)'), unknown: sdT('Unknown') };
  const R = vRows(I, 'm26').map(x => { const [v, t] = String(x.raw).split('|'); return Object.assign(x, { ven: v, tier: tier[t] || t }); });
  return { html: sdBars(R.map(x => ({ l: x.ven + ' · ' + x.tier, v: x.n }))), tables: [{ cols: [cS('ven', 'Vendor'), cS('tier', 'Tier'), cN('n', 'Sessions'), shCol], rows: R }] };
});
def(27, 'dev', 'Processor cores and device memory', 'Cores in groups, and memory as the browser rounds it.', ['game'], I => {
  const cl = v => ({ '<3': '1–2', '<5': '3–4', '<9': '5–8', '<17': '9–16', '>=17': '17+', '?': sdT('Unknown') }[v] || v);
  return { html: '', tables: [{ title: sdT('Processor cores'), cols: [cS('v', 'Cores'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm27.c', cl) }, { title: sdT('Device memory'), cols: [cS('v', 'Memory'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm27.m', v => v === '?' ? sdT('Unknown') : v + ' GB') }] };
});
def(28, 'dev', 'Frame rate and slow frames per game', 'Average frames per second while playing, the share of frames slower than 34 ms and freezes longer than 100 ms.', [], I => {
  const fr = I.byG('m28.fr'), ft = I.byG('m28.ft'), sl = I.byG('m28.sl'), lf = I.byG('m28.lf');
  const rows = [...fr.keys()].map(g => { const a = (fr.get(g) || {}).s || 0, b = (ft.get(g) || {}).s || 0; return { game: g, n: (fr.get(g) || {}).n || 0, fps: b ? a / b : null, sl: a ? 100 * ((sl.get(g) || {}).s || 0) / a : null, lf: (lf.get(g) || {}).s || 0 }; });
  const A = I.tot('m28.fr').s, B = I.tot('m28.ft').s;
  return { html: sdKpis([[sdT('Average frame rate'), B ? sdNum(A / B, 1) + ' fps' : '–'], [sdT('Slow frames'), sdPct(I.tot('m28.sl').s, A)], [sdT('Freezes'), sdNum(I.tot('m28.lf').s)]]) + sdCols(bkItems(I, 'm28.b', 'num').map(x => Object.assign(x, { l: x.l + ' fps' }))),
    tables: [{ cols: [cG, cN('n', 'Samples'), cN('fps', 'Frames per second', v => v == null ? '–' : sdNum(v, 1)), cN('sl', 'Slow frames', v => v == null ? '–' : sdNum(v, 2) + ' %'), cN('lf', 'Freezes')], sort: 'n', rows }] };
});
def(29, 'dev', 'Memory use after ten minutes', 'Script memory used by the page after ten minutes, where the browser reports it (Chrome and Edge).', [], I => {
  const t = I.tot('m29.t');
  return { html: sdKpis([[sdT('Average'), sdMb(sdAvg(t.s, t.n))], [sdT('Samples'), sdNum(t.n)]]) + sdCols(bkItems(I, 'm29.b', 'mb')), tables: [{ cols: [cG, cN('n', 'Samples'), cN('a', 'Average', sdMb)], rows: gRows(I, 'm29.t', x => ({ a: sdAvg(x.s, x.n) })) }, bkTable(I, 'm29.b', 'mb')] };
});
def(30, 'dev', 'Page load timings', 'Time to first byte, first paint, first contentful paint and largest contentful paint of the site page.', ['game'], I => {
  const K = [['ttfb', 'Time to first byte'], ['fp', 'First paint'], ['fcp', 'First contentful paint'], ['lcp', 'Largest contentful paint']];
  const rows = K.map(([k, l]) => { const L = I.byV('m30.' + k), n = L.reduce((a, x) => a + x.n, 0), s = L.reduce((a, x) => a + x.s, 0); return { k: sdT(l), n, a: sdAvg(s, n), m: bkPct(I, 'm30.' + k, .5), p: bkPct(I, 'm30.' + k, .75) }; });
  return { html: `<h4 class="sd-tt">${sdEsc(sdT('Largest contentful paint'))}</h4>` + sdCols(bkItems(I, 'm30.lcp', 'ms')), tables: [{ cols: [cS('k', 'Measure'), cN('n', 'Pages'), cN('a', 'Average', sdMs), cS('m', 'Half within', v => v ? sdBk(v, 'ms') : '–'), cS('p', 'Three quarters within', v => v ? sdBk(v, 'ms') : '–')], sort: 'o', rows: rows.map((r, i) => Object.assign(r, { o: -i })) }] };
});
def(31, 'dev', 'Connection type and rough speed', 'As reported by the browser (Chrome, Edge and Android only).', ['game'], I => ({ html: '', tables: [
  { title: sdT('Effective type'), cols: [cS('v', 'Type'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm31.net', v => v === '?' ? sdT('Unknown') : v) },
  { title: sdT('Connection'), cols: [cS('v', 'Connection'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm31.ct', v => v === '?' || v === 'unknown' ? sdT('Unknown') : v) },
  bkTable(I, 'm31.dl', 'mbps', sdT('Download speed')), bkTable(I, 'm31.rtt', 'ms0', sdT('Round trip'))] }));
def(32, 'dev', 'Script errors per game', 'Errors grouped by message, with the newest stack trace and the browsers where they happened.', [], I => {
  const E = (I.d.errs || []), byK = new Map(E.map(e => [e.k + '|' + e.game, e]));
  const rows = I.fam('m32').map(x => { const e = byK.get('m32:' + x.v + '|' + x.g) || {}; return { v: x.v, game: x.g, n: x.n, at: e.at || '', stk: e.stk || '', src: e.src ? e.src + (e.line ? ':' + e.line : '') : '' }; });
  return { html: sdKpis([[sdT('Errors'), sdNum(rows.reduce((a, r) => a + r.n, 0))], [sdT('Different errors'), sdNum(rows.length)]]),
    tables: [{ cols: [{ k: 'v', t: 'Error', html: r => `<details class="sd-det"><summary>${sdEsc(r.v)}</summary>${r.src ? `<div class="sd-src">${sdEsc(r.src)}</div>` : ''}${r.stk ? `<pre class="sd-stk">${sdEsc(r.stk.split(' | ').join('\n'))}</pre>` : `<div class="sd-src">${sdEsc(sdT('No stack trace recorded'))}</div>`}</details>` }, cG, cN('n', 'Count'), cS('at', 'Newest', v => v ? new Date(v).toLocaleString(sdLang()) : '–')], rows },
      { title: sdT('Browsers with errors'), cols: [cS('v', 'Browser'), cN('n', 'Errors'), shCol], rows: vRows(I, 'm32.br') }] };
});
const RT = v => ({ peerjs: sdT('Direct (PeerJS)'), 'rt-p2p': sdT('Direct (site signalling)'), 'rt-relay': sdT('Relayed through the site'), site: sdT('Site channel'), both: sdT('Both'), '?': sdT('Unknown') }[String(v).replace(/\+turn$/, '')] || v) + (/\+turn$/.test(v) ? ' + TURN' : '');
def(33, 'multi', 'Parties created, joined and failed', 'Per connection route. Failures are joins or hosts that gave up, with the reason.', [], I => {
  const cr = I.fam('m33.create').reduce((a, x) => a + x.n, 0), jn = I.fam('m33.join').reduce((a, x) => a + x.n, 0), fl = I.fam('m33.fail').reduce((a, x) => a + x.n, 0);
  return { html: sdKpis([[sdT('Created'), sdNum(cr)], [sdT('Joined'), sdNum(jn)], [sdT('Failed'), sdNum(fl)], [sdT('Retries'), sdNum(I.tot('m33.retry').n)]]) + sdLine([{ t: sdT('Created'), v: I.day('m33.create').map(x => x.n) }, { t: sdT('Joined'), v: I.day('m33.join').map(x => x.n) }, { t: sdT('Failed'), v: I.day('m33.fail').map(x => x.n) }], dayLab(I)),
    tables: [{ title: sdT('Created by route'), cols: [cS('v', 'Route'), cN('n', 'Parties'), shCol], rows: vRows(I, 'm33.create', RT) }, { title: sdT('Joined by route'), cols: [cS('v', 'Route'), cN('n', 'Joins'), shCol], rows: vRows(I, 'm33.join', RT) }, { title: sdT('Failures by reason'), cols: [cS('v', 'Reason'), cN('n', 'Failures'), shCol], rows: vRows(I, 'm33.fail') }, { title: sdT('Per game'), cols: [cG, cN('c', 'Created'), cN('j', 'Joined'), cN('f', 'Failed')], rows: (() => { const A = gameSum(I, 'm33.create'), B = gameSum(I, 'm33.join'), F = gameSum(I, 'm33.fail'); return [...new Set([...A.keys(), ...B.keys(), ...F.keys()])].map(g => ({ game: g, c: (A.get(g) || {}).n || 0, j: (B.get(g) || {}).n || 0, f: (F.get(g) || {}).n || 0 })); })() }] };
});
def(34, 'multi', 'Time to join a party', 'From pressing Join to being connected to the host.', [], I => {
  const t = I.tot('m34.t');
  return { html: sdKpis([[sdT('Average'), sdMs(sdAvg(t.s, t.n))], [sdT('Half join within'), sdBk(bkPct(I, 'm34.b', .5) || '?', 's1')], [sdT('Joins'), sdNum(t.n)]]) + sdCols(bkItems(I, 'm34.b', 's1')), tables: [{ cols: [cG, cN('n', 'Joins'), cN('a', 'Average', sdMs)], rows: gRows(I, 'm34.t', x => ({ a: sdAvg(x.s, x.n) })) }] };
});
def(35, 'multi', 'Connection route used', 'Direct between players, relayed through the site, or through a TURN relay.', [], I => {
  const R = vRows(I, 'm35', RT);
  return { html: sdBars(R.map(x => ({ l: x.v, v: x.n }))) + `<p class="sd-note">${sdEsc(sdT('TURN is shown once the party code reports it.'))}</p>`, tables: [{ cols: [cS('v', 'Route'), cN('n', 'Joins'), shCol], rows: R }] };
});
def(36, 'multi', 'Disconnects and reconnects per match', 'A match runs from creating or joining a party until it closes.', [], I => {
  const d = I.byG('m36.drop'), b = I.byG('m36.back'), td = I.tot('m36.drop'), tb = I.tot('m36.back');
  return { html: sdKpis([[sdT('Matches'), sdNum(td.n)], [sdT('Disconnects per match'), sdNum(sdAvg(td.s, td.n), 2)], [sdT('Reconnects per match'), sdNum(sdAvg(tb.s, tb.n), 2)]]), tables: [{ cols: [cG, cN('n', 'Matches'), cN('d', 'Disconnects'), cN('b', 'Reconnects')], rows: [...d.keys()].map(g => ({ game: g, n: d.get(g).n, d: d.get(g).s, b: (b.get(g) || {}).s || 0 })) }] };
});
def(37, 'multi', 'Party size and duration', 'Players when the match started, and how long the party lasted.', [], I => {
  const t = I.tot('m37.dur'), sz = I.byV('m37.size').sort((a, b) => +a.v - +b.v);
  return { html: sdKpis([[sdT('Average duration'), sdDur(sdAvg(t.s, t.n))], [sdT('Parties'), sdNum(t.n)]]) + `<div class="sd-two"><div><h4 class="sd-tt">${sdEsc(sdT('Players'))}</h4>${sdCols(sz.map(x => ({ l: x.v, v: x.n })), { w: 320 })}</div><div><h4 class="sd-tt">${sdEsc(sdT('Duration'))}</h4>${sdCols(bkItems(I, 'm37.b', 'sec'), { w: 320 })}</div></div>`,
    tables: [{ title: sdT('Players'), cols: [cS('v', 'Players'), cN('n', 'Matches'), shCol], rows: vRows(I, 'm37.size') }, bkTable(I, 'm37.b', 'sec', sdT('Duration'))] };
});
def(38, 'multi', 'Public and private parties, invites by message', 'Invites sent are counted on the server from party invite messages; accepted means the player joined from the invite card.', [], I => {
  const pu = I.tot('m38.pub').n, pr = I.tot('m38.priv').n, iv = I.tot('m38.inv').n, ac = I.tot('m38.acc').n;
  return { html: sdKpis([[sdT('Public parties'), sdNum(pu), sdPct(pu, pu + pr)], [sdT('Private parties'), sdNum(pr)], [sdT('Invites sent'), sdNum(iv)], [sdT('Invites accepted'), sdNum(ac), sdPct(ac, iv)]]), tables: [{ cols: [cG, cN('pu', 'Public'), cN('pr', 'Private'), cN('ac', 'Joined from an invite')], rows: (() => { const A = I.byG('m38.pub'), B = I.byG('m38.priv'), C = I.byG('m38.acc'); return [...new Set([...A.keys(), ...B.keys(), ...C.keys()])].filter(g => g).map(g => ({ game: g, pu: (A.get(g) || {}).n || 0, pr: (B.get(g) || {}).n || 0, ac: (C.get(g) || {}).n || 0 })); })() }] };
});
def(39, 'social', 'Friend requests sent and accepted', 'Counted on the server. Answer time is from the request to its answer.', ['game', 'cc', 'dev'], I => {
  const s = I.tot('m39.sent').n, a = I.tot('m39.accepted'), d = I.tot('m39.declined');
  return { html: sdKpis([[sdT('Sent'), sdNum(s)], [sdT('Accepted'), sdNum(a.n), sdPct(a.n, s)], [sdT('Declined'), sdNum(d.n)], [sdT('Average time to accept'), sdDur(sdAvg(a.s, a.n))]]) + sdLine([{ t: sdT('Sent'), v: I.day('m39.sent').map(x => x.n) }, { t: sdT('Accepted'), v: I.day('m39.accepted').map(x => x.n) }], dayLab(I)), tables: [{ cols: [cS('v', 'Answer'), cN('n', 'Requests'), cN('a', 'Average time', sdDur)], rows: [['accepted', 'Accepted'], ['declined', 'Declined']].map(([k, l]) => { const x = I.tot('m39.' + k); return { v: sdT(l), n: x.n, a: sdAvg(x.s, x.n) }; }) }] };
});
def(40, 'social', 'Messages sent per day', 'Counts only. The content of messages is never read for statistics.', ['game', 'cc', 'dev'], I => {
  const lab = v => ({ text: sdT('Text'), image: sdT('Picture'), file: sdT('File'), invite: sdT('Party invite'), join: sdT('Join request') }[v] || v);
  const R = vRows(I, 'm40', lab), D = I.day('m40');
  return { html: sdKpis([[sdT('Messages'), sdNum(R.reduce((a, r) => a + r.n, 0))], [sdT('Average per day'), sdNum(D.reduce((a, x) => a + x.n, 0) / Math.max(1, D.length), 1)]]) + sdLine([{ t: sdT('Messages'), v: D.map(x => x.n) }], dayLab(I)), tables: [{ cols: [cS('v', 'Type'), cN('n', 'Messages'), shCol], rows: R }, { title: sdT('Per day'), cols: [cS('d', 'Day'), cN('n', 'Messages')], sort: 'd', dir: -1, rows: I.days.map((d, i) => ({ d, n: D[i].n })).filter(x => x.n) }] };
});
def(41, 'social', 'Blocks and reports', 'Players blocked, and reports with the reason chosen.', ['game', 'cc', 'dev'], I => {
  const R = vRows(I, 'm41.rep');
  return { html: sdKpis([[sdT('Blocks'), sdNum(I.tot('m41.block').n)], [sdT('Reports'), sdNum(R.reduce((a, r) => a + r.n, 0))]]), tables: [{ cols: [cS('v', 'Reason'), cN('n', 'Reports'), shCol], rows: R }] };
});
def(42, 'social', 'Support tickets', 'Opened, time to the first staff reply and time to resolution (until the ticket was closed).', ['game', 'cc', 'dev'], I => {
  const o = I.tot('m42.open').n, r = I.tot('m42.reply'), z = I.tot('m42.res');
  return { html: sdKpis([[sdT('Opened'), sdNum(o)], [sdT('First staff replies'), sdNum(r.n)], [sdT('Average time to first reply'), sdDur(sdAvg(r.s, r.n))], [sdT('Resolved'), sdNum(z.n)], [sdT('Average time to resolution'), sdDur(sdAvg(z.s, z.n))]]) + sdLine([{ t: sdT('Opened'), v: I.day('m42.open').map(x => x.n) }, { t: sdT('Resolved'), v: I.day('m42.res').map(x => x.n) }], dayLab(I)), tables: [{ cols: [cS('v', 'Measure'), cN('n', 'Tickets'), cN('a', 'Average time', sdDur)], sort: 'o', dir: 1, rows: [{ o: 0, v: sdT('Opened'), n: o, a: null }, { o: 1, v: sdT('First staff replies'), n: r.n, a: sdAvg(r.s, r.n) }, { o: 2, v: sdT('Resolved'), n: z.n, a: sdAvg(z.s, z.n) }] }] };
});
def(43, 'social', 'Ideas submitted and votes', 'Ideas sent to the idea box by type, and thumbs up or down given to games.', ['cc', 'dev'], I => {
  const up = I.byG('m43.vote').size ? I.fam('m43.vote') : [];
  const G = new Map(); up.forEach(x => { const o = G.get(x.g) || { u: 0, d: 0 }; o[x.v === 'up' ? 'u' : 'd'] += x.n; G.set(x.g, o); });
  return { html: sdKpis([[sdT('Ideas'), sdNum(I.fam('m43.idea').reduce((a, x) => a + x.n, 0))], [sdT('Votes up'), sdNum(I.val('m43.vote', 'up').n)], [sdT('Votes down'), sdNum(I.val('m43.vote', 'down').n)]]), tables: [{ title: sdT('Ideas by type'), cols: [cS('v', 'Type'), cN('n', 'Ideas'), shCol], rows: vRows(I, 'm43.idea') }, { title: sdT('Votes per game'), cols: [cG, cN('u', 'Up'), cN('d', 'Down'), cN('r', 'Liked', v => v == null ? '–' : sdNum(v, 1) + ' %')], rows: [...G.entries()].map(([g, x]) => ({ game: g, u: x.u, d: x.d, r: x.u + x.d ? 100 * x.u / (x.u + x.d) : null })) }] };
});
def(44, 'safe', 'Sign-up funnel', 'Steps reached in the sign-up form, per method. Accounts created are counted on the server for everyone.', ['game'], I => {
  const st = (m, s) => I.val('m44.' + m, s).n;
  const E = [['open', 'Sign-up form shown'], ['start', 'Started typing'], ['submit', 'Pressed Create account'], ['created', 'Account created'], ['verified', 'Email confirmed']].map(([s, l]) => ({ l: sdT(l), n: st('email', s) }));
  const Gg = [['open', 'Sign-up form shown'], ['click', 'Pressed Google'], ['back', 'Came back from Google'], ['name', 'Username screen'], ['saved', 'Username saved']].map(([s, l]) => ({ l: sdT(l), n: st('google', s) }));
  return { html: `<div class="sd-two"><div><h4 class="sd-tt">${sdEsc(sdT('Email and username'))}</h4>${sdFunnel(E)}</div><div><h4 class="sd-tt">Google</h4>${sdFunnel(Gg)}</div></div>`, tables: [{ title: sdT('Accounts created'), cols: [cS('v', 'Method'), cN('n', 'Accounts'), shCol], rows: vRows(I, 'm44.acct', v => v === 'email' ? sdT('Email and username') : v === 'google' ? 'Google' : v) }, { title: sdT('Sign-up and confirmation attempts'), cols: [cS('v', 'Attempt'), cN('n', 'Count')], rows: vRows(I, 'm44.srv', v => { const [m, r] = v.split(':'); return (m === 'signup' ? sdT('Sign-up') : m === 'verify' ? sdT('Email confirmation') : m) + ' · ' + (r === 'ok' ? sdT('Succeeded') : sdT('Failed')); }) }] };
});
def(45, 'safe', 'Log-in successes and failures', 'Security record, kept whatever the analytics choice. Per method, with the failure reason.', ['game', 'dev'], I => {
  const M2 = new Map(['email', 'username', 'google', 'google_relay'].map(m => [m, { ok: I.val('m45.' + m, 'ok').n, fail: I.val('m45.' + m, 'fail').n }]).filter(([, x]) => x.ok || x.fail));
  const lab = { email: sdT('Email'), username: sdT('Username'), google: 'Google', google_relay: sdT('Google through the relay') };
  const rows = [...M2.entries()].map(([m, x]) => ({ m: lab[m] || m, ok: x.ok, fail: x.fail, r: x.ok + x.fail ? 100 * x.fail / (x.ok + x.fail) : 0 }));
  return { html: sdKpis([[sdT('Successful log-ins'), sdNum(rows.reduce((a, r) => a + r.ok, 0))], [sdT('Failed log-ins'), sdNum(rows.reduce((a, r) => a + r.fail, 0))]]), tables: [{ cols: [cS('m', 'Method'), cN('ok', 'Succeeded'), cN('fail', 'Failed'), cN('r', 'Failed share', v => sdNum(v, 1) + ' %')], rows }, { title: sdT('Failure reasons'), cols: [cS('v', 'Reason'), cN('n', 'Failures'), shCol], rows: vRows(I, 'm45.code') }] };
});
def(46, 'safe', 'Account deletions', 'Deletions by the player or by staff, with the optional reason the player chose and the age of the account.', ['game', 'cc', 'dev'], I => {
  const why = { none: sdT('No reason given'), not_playing: sdT('I do not play any more'), new_account: sdT('I made another account'), privacy: sdT('Privacy reasons'), too_many_messages: sdT('Too many messages or notifications'), problems: sdT('Games or the site do not work well for me'), other: sdT('Another reason') };
  const who = { self: sdT('By the player'), staff: sdT('By staff'), request: sdT('Requested'), system: sdT('By the system') };
  const rows = Object.keys(who).flatMap(k => I.byV('m46.' + k).map(x => ({ k: who[k], v: why[x.v] || x.v, n: x.n, a: sdAvg(x.s, x.n) })));
  return { html: sdKpis([[sdT('Deletions'), sdNum(rows.reduce((a, r) => a + r.n, 0))]]), tables: [{ cols: [cS('k', 'Who'), cS('v', 'Reason'), cN('n', 'Accounts'), cN('a', 'Average account age', v => sdNum(v, 1) + ' ' + sdT('days'))], rows }] };
});
def(47, 'safe', 'Rate-limit hits per action', 'Actions counted by the rate limits, and how often a limit was reached.', ['game', 'cc', 'dev'], I => {
  const R = I.byV('m47').map(x => ({ v: x.v, n: x.n, s: x.s }));
  return { html: sdKpis([[sdT('Limits reached'), sdNum(R.reduce((a, r) => a + r.s, 0))], [sdT('Actions counted'), sdNum(R.reduce((a, r) => a + r.n, 0))]]), tables: [{ cols: [cS('v', 'Action'), cN('n', 'Actions counted'), cN('s', 'Limit reached')], sort: 's', rows: R }] };
});
def(48, 'safe', 'Country and region', 'From the network address on the server, never a precise location.', ['game'], I => {
  const R = vRows(I, 'm48', sdCountry);
  return { html: sdBars(R.map(x => ({ l: x.v, v: x.n }))), tables: [{ cols: [cS('v', 'Country'), cS('raw', 'Code'), cN('n', 'Sessions'), shCol], rows: R }, { title: sdT('Regions'), cols: [cS('v', 'Region'), cN('n', 'Sessions')], rows: I.byV('m48.r').map(x => ({ v: sdCountry(x.v.split('/')[0]) + ' · ' + x.v.split('/').slice(1).join('/'), n: x.n })) }] };
});
def(49, 'safe', 'Settings changed, language and theme', 'Which setting changed, from which value to which; and the language and theme in use per session.', ['game'], I => {
  const ch = I.byV('m49').map(x => { const [k, rest] = [x.v.split(':')[0], x.v.split(':').slice(1).join(':')]; const [o, n] = rest.split('>'); return { k, o: o === '?' ? '–' : o, nv: n, n: x.n }; });
  return { html: '', tables: [{ title: sdT('Changes'), cols: [cS('k', 'Setting'), cS('o', 'Old value'), cS('nv', 'New value'), cN('n', 'Times')], rows: ch }, { title: sdT('Language in use'), cols: [cS('v', 'Language'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm49.lang', v => { try { return new Intl.DisplayNames([sdLang()], { type: 'language' }).of(v) || v; } catch (e) { return v; } }) }, { title: sdT('Theme in use'), cols: [cS('v', 'Theme'), cN('n', 'Sessions'), shCol], rows: vRows(I, 'm49.theme', v => ({ light: sdT('Light'), dark: sdT('Dark'), system: sdT('Same as the device') }[v] || v)) }] };
});
def(50, 'safe', 'Bans by type and repeat offences', 'From the admin log. A repeat offence is a ban on an account or address that was banned before.', ['game', 'cc', 'dev'], I => {
  const lab = { account: sdT('Account'), device: sdT('Account and devices'), ip: sdT('Network address') };
  const rows = ['account', 'device', 'ip'].map(k => ({ k: lab[k], n: I.val('m50', k).n, r: I.val('m50.rep', k).n, u: I.val('m50', 'un:' + k).n }));
  return { html: sdKpis([[sdT('Bans'), sdNum(rows.reduce((a, r) => a + r.n, 0))], [sdT('Repeat offences'), sdNum(rows.reduce((a, r) => a + r.r, 0))]]), tables: [{ cols: [cS('k', 'Type'), cN('n', 'Bans'), cN('r', 'Repeat offences'), cN('u', 'Lifted')], rows }] };
});

const NF = { game: 'Not split by game', cc: 'Not split by country', dev: 'Not split by device', acct: 'Not split by account type' };
function sdCard(m, I) {
  let r;
  try { r = m.draw(I); } catch (e) { r = { html: `<p class="sd-err">${sdEsc(sdT('This measure could not be drawn.'))} ${sdEsc(e && e.message || '')}</p>`, tables: [] }; }
  m.last = r;
  const st = SD.st, act = m.nf.filter(k => (k === 'game' && st.game) || (k === 'cc' && st.cc) || (k === 'dev' && st.dev) || (k === 'acct' && st.acct !== 'players'));
  const tabs = (r.tables || []).map((t, i) => sdTableHtml(m.n + ':' + i, Object.assign({}, t, { cols: t.cols.map(c => Object.assign({}, c, { t: sdT(c.t) })) }))).join('');
  return `<article class="sd-card" id="sd-m${m.n}" data-sdn="${m.n}"><header class="sd-ch"><span class="sd-no">${m.n}</span><div class="sd-cht"><h3>${sdEsc(sdT(m.t))}</h3><p>${sdEsc(sdT(m.d))}</p></div><button type="button" class="sd-csv" data-sdcsv="${m.n}" title="${sdEsc(sdT('Download this measure as CSV'))}">CSV</button></header>${act.length ? `<p class="sd-nf">${act.map(k => sdEsc(sdT(NF[k]))).join(' · ')}</p>` : ''}<div class="sd-cb">${r.html || ''}${tabs}</div></article>`;
}
const sdCell = v => { const s = v == null ? '' : String(v); return /[",;\n\r]/.test(s) || /^[=+\-@\t]/.test(s) ? '"' + (/^[=+\-@\t]/.test(s) ? "'" : '') + s.replace(/"/g, '""') + '"' : s; };
function sdCsvOf(m) {
  const r = m.last || { tables: [] }, out = [];
  (r.tables || []).forEach(t => {
    out.push([m.n, sdT(m.t), t.title || ''].map(sdCell).join(','));
    out.push(t.cols.map(c => sdCell(sdT(c.t))).join(','));
    t.rows.forEach(row => out.push(t.cols.map(c => { const v = row[c.k]; return sdCell(c.k === 'game' ? sdGame(v) : typeof v === 'number' ? Math.round(v * 100) / 100 : v); }).join(',')));
    out.push('');
  });
  return out.join('\r\n');
}
function sdDownload(name, csv) {
  try {
    const u = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a');
    a.href = u; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  } catch (e) {}
  SD.lastCsv = csv;
}
const sdName = n => 'gameplay-data-' + (n ? 'measure-' + n + '-' : '') + (SD.d ? SD.d.from + '-to-' + SD.d.to : 'export') + '.csv';
function sdBar() {
  const st = SD.st, sp = sdSpan(), gl = sdGames().slice().sort((a, b) => String(a.title).localeCompare(String(b.title), sdLang()));
  const opt = (v, t, cur) => `<option value="${sdEsc(v)}"${v === cur ? ' selected' : ''}>${sdEsc(t)}</option>`;
  const cc = (SD.dims && SD.dims.cc) || [];
  return `<div class="sd-filt" role="search"><label class="sd-f"><span>${sdEsc(sdT('Period'))}</span><select data-sdf="range">${SD_RANGES.map(([v, t]) => opt(v, sdT(t), st.range)).join('')}</select></label>
<label class="sd-f sd-fd"${st.range === 'c' ? '' : ' hidden'}><span>${sdEsc(sdT('From'))}</span><input type="date" data-sdf="from" value="${sdEsc(st.from || sp.from)}"></label>
<label class="sd-f sd-fd"${st.range === 'c' ? '' : ' hidden'}><span>${sdEsc(sdT('To'))}</span><input type="date" data-sdf="to" value="${sdEsc(st.to || sp.to)}"></label>
<label class="sd-f"><span>${sdEsc(sdT('Game'))}</span><select data-sdf="game">${opt('', sdT('All games'), st.game)}${gl.map(g => opt(g.id, g.title, st.game)).join('')}</select></label>
<label class="sd-f"><span>${sdEsc(sdT('Country'))}</span><select data-sdf="cc">${opt('', sdT('All countries'), st.cc)}${cc.map(c => opt(c, sdCountry(c), st.cc)).join('')}${st.cc && !cc.includes(st.cc) ? opt(st.cc, sdCountry(st.cc), st.cc) : ''}</select></label>
<label class="sd-f"><span>${sdEsc(sdT('Device'))}</span><select data-sdf="dev">${opt('', sdT('All devices'), st.dev)}${opt('desktop', sdT('Computer'), st.dev)}${opt('tablet', sdT('Tablet'), st.dev)}${opt('phone', sdT('Phone'), st.dev)}</select></label>
<label class="sd-f"><span>${sdEsc(sdT('Account type'))}</span><select data-sdf="acct">${SD_ACCT.map(([v, t]) => opt(v, sdT(t), st.acct)).join('')}</select></label>
<div class="sd-act"><button type="button" class="sd-btn" data-sda="reload">${sdEsc(sdT('Refresh'))}</button><button type="button" class="sd-btn pri" data-sda="csv">${sdEsc(sdT('Export all to CSV'))}</button></div></div>
<nav class="sd-nav" aria-label="${sdEsc(sdT('Groups of measures'))}">${SD_GROUPS.map(([k, t]) => `<a href="#sd-g-${k}" data-sdg="${k}">${sdEsc(sdT(t))}</a>`).join('')}</nav><div class="sd-msg" role="status"></div>`;
}
function sdDraw() {
  const el = SD.el;
  if (!el) return;
  const box = el.querySelector('.sd-body');
  if (!SD.d) { box.innerHTML = `<p class="sd-wait">${sdEsc(SD.err || sdT('Loading the data…'))}</p>`; return; }
  const I = sdIndex(SD.d);
  box.innerHTML = SD_GROUPS.map(([k, t]) => `<section class="sd-grp" id="sd-g-${k}"><h2>${sdEsc(sdT(t))}</h2><div class="sd-grid">${M.filter(m => m.g === k).map(m => sdCard(m, I)).join('')}</div></section>`).join('');
  sdMsg();
}
function sdMsg() {
  const m = SD.el && SD.el.querySelector('.sd-msg');
  if (!m) return;
  const d = SD.d, t = [];
  if (SD.busy) t.push(sdT('Updating…'));
  if (SD.err) t.push(SD.err);
  if (d) t.push(sdTf('{a} to {b}', { a: new Date(d.from + 'T12:00:00').toLocaleDateString(sdLang()), b: new Date(d.to + 'T12:00:00').toLocaleDateString(sdLang()) }) + ' · ' + sdTf('updated {t}', { t: new Date(d.at).toLocaleTimeString(sdLang(), { hour: '2-digit', minute: '2-digit' }) }));
  if (d && d.pending > 0) t.push(sdTf('Still preparing {n} older days', { n: sdNum(d.pending) }));
  m.textContent = t.join(' · ');
  m.classList.toggle('bad', !!SD.err);
}
async function sdFetch(fresh) {
  const my = ++SD.seq, sp = sdSpan(), st = SD.st;
  SD.busy = true; SD.err = ''; sdMsg();
  try {
    if (!SD.dims) sdRpc('admin_measures_dims', {}).then(x => { if (x && my === SD.seq) { SD.dims = x; const b = SD.el && SD.el.querySelector('.sd-top'); if (b) { b.innerHTML = sdBar(); } } }).catch(() => {});
    const d = await sdRpc('admin_measures', { p_from: sp.from, p_to: sp.to, p_game: st.game || null, p_cc: st.cc || null, p_dev: st.dev || null, p_acct: st.acct, p_fresh: fresh === true });
    if (my !== SD.seq) return;
    SD.d = d; SD.busy = false;
    sdDraw();
    clearTimeout(SD.tm);
    if (d && d.pending > 0 && SD.tries++ < 20) SD.tm = setTimeout(sdFetch, 1200); else SD.tries = 0;
  } catch (e) {
    if (my !== SD.seq) return;
    SD.busy = false; SD.err = /admins only/i.test(String(e && e.message)) ? sdT('Only admins can see this data.') : sdT('Could not load the data. Check the connection and try again.');
    if (!SD.d) sdDraw(); else sdMsg();
  }
}
function sdWire(el) {
  el.addEventListener('change', e => {
    const f = e.target.closest && e.target.closest('[data-sdf]');
    if (!f) return;
    const k = f.dataset.sdf;
    SD.st[k] = f.value;
    if (k === 'range') { el.querySelectorAll('.sd-fd').forEach(x => { x.hidden = f.value !== 'c'; }); if (f.value === 'c') { const sp = sdSpan(); SD.st.from = SD.st.from || sp.from; SD.st.to = SD.st.to || sp.to; } }
    if (k === 'from' || k === 'to') SD.st.range = 'c';
    SD.sort = {}; SD.open = {};
    sdSave(); sdFetch();
  });
  el.addEventListener('click', e => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const a = t.closest('[data-sda]');
    if (a) { if (a.dataset.sda === 'reload') sdFetch(true); else if (SD.d) sdDownload(sdName(0), M.map(sdCsvOf).join('\r\n')); return; }
    const c = t.closest('[data-sdcsv]');
    if (c) { const m = M.find(x => x.n === +c.dataset.sdcsv); if (m) sdDownload(sdName(m.n), sdCsvOf(m)); return; }
    const g = t.closest('[data-sdg]');
    if (g) { e.preventDefault(); const s = el.querySelector('#sd-g-' + g.dataset.sdg); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const mo = t.closest('[data-sdm]');
    const h = t.closest('[data-sdk]');
    if (!mo && !h) return;
    const card = t.closest('.sd-card'), m = card && M.find(x => x.n === +card.dataset.sdn);
    if (!m) return;
    if (mo) SD.open[mo.dataset.sdm] = true;
    else { const id = h.closest('[data-sdt]').dataset.sdt, k = h.dataset.sdk, cur = SD.sort[id]; SD.sort[id] = { k, d: cur && cur.k === k ? -cur.d : (m.last.tables[+id.split(':')[1]].cols.find(x => x.k === k) || {}).num ? -1 : 1 }; }
    card.outerHTML = sdCard(m, sdIndex(SD.d));
  });
}
function render(el) {
  if (!el) return;
  SD.el = el; SD.st = sdLoad();
  el.classList.add('sd');
  el.innerHTML = `<div class="sd-top">${sdBar()}</div><div class="sd-body"></div>`;
  if (!el.__sd) { el.__sd = 1; sdWire(el); }
  sdDraw();
  sdFetch();
}
window.Ameplay = window.Ameplay || {};
Ameplay.statsData = Object.assign(Ameplay.statsData || {}, { render, refresh: () => sdFetch(true), measures: () => M.map(m => ({ n: m.n, group: m.g, title: m.t })), csv: () => M.map(sdCsvOf).join('\r\n') });
Object.defineProperty(Ameplay.statsData, 'data', { configurable: true, get: () => SD.d });
})();
