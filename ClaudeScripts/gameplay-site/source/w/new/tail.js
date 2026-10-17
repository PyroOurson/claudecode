const INFO = new Map();
ROWS.forEach((r, i) => INFO.set(r[0], { id: r[0], name: r[1], genres: r[2].split(','), pl: r[3], mins: r[4], kw: r[5], remake: r[6].includes('r'), hot: r[6].includes('h'), fresh: r[6].includes('n'), rank: i }));
const NEWEST_RANK = new Map(NEWEST.map((id, i) => [id, i]));
const KEYS_RE = /[←↑→↓]|\bwasd\b|\bw a s d\b|\bspace\b|\bshift\b|\bkeys?\b|\barrows?\b|\bd f j k\b|\bq w e\b|\btype\b|\btyping\b|\bpress\b|\benter\b/i;
const gname = k => GENRE_NAME[k] || k;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bucket = m => m <= 3 ? 'q' : m <= 12 ? 'm' : 'l';
const onlineMax = pl => pl.includes('o') ? +((pl.match(/\d+/) || ['2'])[0]) : 0;
const playersText = pl => { const n = onlineMax(pl); return n ? (pl.includes('s') ? 'Solo · Online up to ' + n : 'Online up to ' + n) : 'Solo'; };
S.time = S.time && typeof S.time === 'object' ? S.time : {};
S.daily = S.daily && typeof S.daily === 'object' ? S.daily : {};
S.last = S.last && typeof S.last === 'object' ? S.last : {};
S.prefs = S.prefs && typeof S.prefs === 'object' ? S.prefs : {};
if (!S.since) { S.since = Date.now(); save(); }

const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const toks = s => { const n = norm(s); return n ? n.split(' ') : []; };
function stem(w) {
  if (w.length <= 3 || /^\d/.test(w)) return w;
  let s = w;
  if (s.length > 4 && s.endsWith('ing')) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith('ers')) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith('ies')) s = s.slice(0, -3) + 'y';
  else if (s.length > 4 && s.endsWith('er')) s = s.slice(0, -2);
  else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
  else if (s.length > 4 && s.endsWith('es')) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  if (s.length > 3 && s[s.length - 1] === s[s.length - 2] && !/(ss|ll|ff|zz)$/.test(s)) s = s.slice(0, -1);
  if (s.length > 3 && s.endsWith('e')) s = s.slice(0, -1);
  return s;
}
function dist(a, b) {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 2) return 3;
  let p2 = null, p1 = Array.from({ length: lb + 1 }, (_, j) => j);
  for (let i = 1; i <= la; i++) {
    const cur = [i];
    for (let j = 1; j <= lb; j++) {
      let v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      cur[j] = v;
    }
    p2 = p1; p1 = cur;
  }
  return p1[lb];
}
function matchTok(q, t, exactOnly, allowPrefix) {
  if (t === q) return 1;
  if (exactOnly) return 0;
  if (q.length >= 2 && allowPrefix && t.startsWith(q)) return q.length >= 4 ? .85 : .6;
  if (q.length < 4) return 0;
  if (t.length >= 4 && t.includes(q)) return .6;
  const d = dist(q, t);
  if (d <= (q.length >= 7 ? 2 : 1)) return d === 1 ? .6 : .5;
  if (t.length > q.length && dist(q, t.slice(0, q.length)) <= 1) return .5;
  return 0;
}
const uniq = a => [...new Set(a)];
function buildIndex() {
  games.forEach(g => {
    const m = g.info;
    const forms = s => { const t = toks(s); return uniq(t.concat(t.map(stem))); };
    const players = [...m.pl].map(c => PL_KW[c] || '').join(' ') + (g.is3d ? ' 3d three dimensional' : ' 2d') + (m.remake ? ' remake clone version like famous' : '');
    const help = String(g.help || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    g.fields = [
      { w: 10, t: forms(m.name + ' ' + g.oldTitle + ' ' + g.id.replace(/-/g, ' ')) },
      { w: 6, t: forms(m.kw) },
      { w: 5, t: forms(m.genres.map(k => gname(k) + ' ' + GENRE_KW[k]).join(' ')) },
      { w: 4, t: forms(players) },
      { w: 1.5, t: forms(g.blurb || '') },
      { w: 1, t: forms(help) }
    ];
    g.kb = KEYS_RE.test(help);
  });
}
function runSearch(qt, pool, allowPrefix) {
  const scores = new Map(), misses = new Map();
  pool.forEach(g => {
    let total = 0, hit = 0, miss = 0;
    qt.forEach(raw => {
      let best = 0;
      const st = stem(raw);
      g.fields.forEach(f => {
        for (const t of f.t) {
          let s = matchTok(raw, t, false, allowPrefix);
          if (st !== raw) s = Math.max(s, matchTok(st, t, true, false) * .95);
          if (s * f.w > best) best = s * f.w;
        }
      });
      if (best > 0) { total += best; hit++; } else miss++;
    });
    if (hit) { scores.set(g, total); misses.set(g, miss); }
  });
  return { scores, misses };
}
function search(q, pool) {
  const full = norm(q);
  const pre = g => norm(g.info.name).startsWith(full);
  const alpha = l => l.slice().sort((x, y) => x.title.localeCompare(y.title, 'en', { sensitivity: 'base' }));
  if (full.length < 3) {
    const list = alpha(pool.filter(pre)), scores = new Map();
    list.forEach((g, i) => scores.set(g, 1000 - i * .01));
    return { list, partial: false, scores };
  }
  const qt = toks(q).filter(t => !STOP.has(t));
  if (!qt.length) return { list: pool, partial: false, scores: null };
  let r = runSearch(qt, pool, qt.every(t => t.length >= 4 || false) || qt.length > 1 && qt[qt.length - 1].length >= 4);
  let list = [...r.scores.keys()].filter(g => r.misses.get(g) === 0);
  if (!list.length) { r = runSearch(qt, pool, true); list = [...r.scores.keys()].filter(g => r.misses.get(g) === 0); }
  let partial = false;
  if (!list.length && qt.length > 1) { list = [...r.scores.keys()]; partial = list.length > 0; }
  const scores = r.scores;
  list.forEach(g => {
    const nm = norm(g.info.name), old = norm(g.oldTitle);
    if (nm === full || old === full) scores.set(g, scores.get(g) + 40);
    else if (nm.startsWith(full) || old.startsWith(full)) scores.set(g, scores.get(g) + 12);
  });
  const head = alpha(list.filter(pre));
  head.forEach((g, i) => scores.set(g, 1000 - i * .01));
  let rest = list.filter(g => !pre(g));
  if (rest.length > 6) {
    const top = Math.max(...rest.map(g => scores.get(g)));
    rest = rest.filter(g => scores.get(g) >= top * .2);
  }
  list = head.concat(rest);
  return { list, partial, scores };
}

const state = { q: '', g: new Set(), p: new Set(), t: new Set(), v: new Set(), c: new Set(), sort: '' };
const FKEYS = ['g', 'p', 't', 'v', 'c'];
function resetState() { state.q = ''; FKEYS.forEach(k => state[k].clear()); state.sort = ''; }
const activeCount = () => FKEYS.reduce((n, k) => n + state[k].size, 0);
const defSort = () => state.q.trim() ? 'rel' : 'rec';
const nFilters = () => activeCount() + (state.sort && state.sort !== defSort() ? 1 : 0);
function passes(g) {
  const m = g.info;
  if (state.g.size && !m.genres.some(x => state.g.has(x))) return false;
  if (state.p.size && ![...state.p].some(c => m.pl.includes(c))) return false;
  if (state.t.size && !state.t.has(bucket(m.mins))) return false;
  if (state.v.size && !state.v.has(g.is3d ? '3d' : '2d')) return false;
  if (state.c.size && !state.c.has(g.kb ? 'kb' : 'tp') && !(state.c.has('kb') && g.kb)) return false;
  return true;
}
function compute() {
  const q = state.q.trim();
  let list = games.filter(passes), partial = false, scores = null;
  if (q) ({ list, partial, scores } = search(q, list));
  const sort = state.sort || defSort();
  const byRank = (a, b) => a.info.rank - b.info.rank;
  const cmp = {
    rel: (a, b) => ((scores && scores.get(b)) || 0) - ((scores && scores.get(a)) || 0) || byRank(a, b),
    rec: byRank,
    az: (a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
    new: (a, b) => (NEWEST_RANK.get(a.id) ?? 999) - (NEWEST_RANK.get(b.id) ?? 999) || byRank(a, b),
    played: (a, b) => (S.plays[b.id] || 0) - (S.plays[a.id] || 0) || byRank(a, b),
    short: (a, b) => a.info.mins - b.info.mins || byRank(a, b)
  }[sort] || byRank;
  list = list.slice().sort(cmp);
  return { list, partial, q, sort };
}

const LEGAL_KEYS = ['terms', 'privacy', 'cookies'];
const href = (id, code) => PATH_MODE ? '/' + id + (code ? '/' + code : '') : '#/' + id + (code ? '/' + code : '');
const legalHref = k => (PATH_MODE ? '/' : '#/') + k;
function stateQuery() {
  const p = new URLSearchParams();
  if (state.q.trim()) p.set('q', state.q.trim());
  FKEYS.forEach(k => { if (state[k].size) p.set(k, [...state[k]].join(',')); });
  if (state.sort) p.set('s', state.sort);
  const s = p.toString();
  return s ? '?' + s : '';
}
const homeHref = () => (PATH_MODE ? '/' : '#/') + stateQuery();
function parseLocation() {
  let path, query;
  if (PATH_MODE) {
    path = location.pathname.replace(/^\/+|\/+$/g, '');
    query = location.search;
    if (!path && /^#\/[\w-]/.test(location.hash)) { path = location.hash.slice(2); const i = path.indexOf('?'); if (i >= 0) { query = path.slice(i); path = path.slice(0, i); } }
  } else {
    const h = location.hash.replace(/^#\/?/, '');
    const i = h.indexOf('?');
    path = (i < 0 ? h : h.slice(0, i)).replace(/\/+$/, '');
    query = i < 0 ? '' : h.slice(i);
  }
  if (LEGAL_KEYS.includes(path)) return { legal: path };
  if (path === 'admin') return { admin: true };
  const m = /^([\w-]+)(?:\/([A-Za-z0-9]{4}))?$/.exec(path);
  if (m && m[1] !== 'all' && byId.get(m[1])) return { game: byId.get(m[1]), code: m[2] || null };
  const p = new URLSearchParams(query);
  const st = { q: p.get('q') || '', sort: p.get('s') || '' };
  FKEYS.forEach(k => { st[k] = (p.get(k) || '').split(',').filter(Boolean); });
  return { game: null, state: st, toAll: location.hash === '#all' || path === 'all', missing: m && m[1] !== 'all' ? m[1] : null };
}
function applyLocState(st) {
  state.q = st.q; state.sort = SORTS.some(x => x[0] === st.sort) ? st.sort : '';
  FKEYS.forEach(k => { const ok = (FGROUPS.find(x => x.key === k) || { opts: [] }).opts.map(o => o[0]); state[k] = new Set(st[k].filter(v => ok.includes(v))); });
  $('#q').value = state.q;
}
function syncUrl(replace = true) {
  const url = homeHref();
  const same = PATH_MODE ? location.pathname + location.search === url : location.hash === url;
  if (same) return;
  if (PATH_MODE || replace) history[replace ? 'replaceState' : 'pushState'](null, '', url);
  else location.hash = url;
}
function go(url, replace) {
  if (PATH_MODE) { history[replace ? 'replaceState' : 'pushState'](null, '', url); route(replace ? undefined : false); return; }
  if (replace) { history.replaceState(null, '', url); route(); return; }
  if (location.hash === url) route(); else { progNav = true; location.hash = url; }
}

const LZ = { key: null, kp: null, dir: '', root: '', raw: {}, code: {}, packs: [], packOf: {}, pk: {}, done: new Set(), io: null };
const BLANK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"/>');
const lzB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const lzUrl = (f, ext) => LZ.root + LZ.dir + f + ext;
function lzFetch(f) {
  if (LZ.raw[f]) return LZ.raw[f];
  const get = () => fetch(lzUrl(f, '.bin')).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); });
  const pre = window.__gpPre && window.__gpPre[f];
  if (pre) delete window.__gpPre[f];
  return LZ.raw[f] = (pre ? pre.catch(get) : get()).catch(e => { delete LZ.raw[f]; throw e; });
}
async function lzPlain(buf) {
  if (!LZ.kp) LZ.kp = crypto.subtle.importKey('raw', lzB64(LZ.key), 'AES-GCM', false, ['decrypt']);
  const u = new Uint8Array(buf);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, await LZ.kp, u.subarray(12));
  return new Response(new Blob([pt]).stream().pipeThrough(new DecompressionStream('gzip')));
}
const lzOpen = buf => lzPlain(buf).then(r => r.text());
const lzOpenBuf = buf => lzPlain(buf).then(r => r.arrayBuffer());
function lzRun(f) {
  if (LZ.code[f]) return LZ.code[f];
  const p = LZ.key ? lzFetch(f).then(lzOpen).then(txt => { const s = document.createElement('script'); s.textContent = txt; document.head.append(s); s.remove(); }) : new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = lzUrl(f, '.js'); s.async = true;
    s.onload = () => { s.remove(); res(); };
    s.onerror = () => { s.remove(); rej(new Error('script failed')); };
    document.head.append(s);
  });
  return LZ.code[f] = p.catch(e => { delete LZ.code[f]; delete LZ.raw[f]; throw e; });
}
function need(g) {
  if (g.mount) return Promise.resolve(g);
  return lzRun(g.lazy).then(() => { const r = byId.get(g.id); if (!r || !r.mount) { delete LZ.code[g.lazy]; throw new Error('game did not register'); } return r; });
}
function lzPrefetch(g) {
  if (!g || g.mount || !g.lazy || LZ.code[g.lazy]) return;
  if (LZ.key) lzFetch(g.lazy).catch(() => {});
  else if (!LZ.raw[g.lazy]) LZ.raw[g.lazy] = fetch(lzUrl(g.lazy, '.js')).catch(() => { delete LZ.raw[g.lazy]; });
}
function lazyLanded(old, g) {
  if (old.fields) { g.fields = old.fields; g.kb = old.kb; }
  ['cv', 'cvx', 'cvt', 'cc'].forEach(k => { if (old[k] && !g[k]) g[k] = old[k]; });
  const i = games.indexOf(old);
  if (i >= 0) games[i] = g; else games.push(g);
  byId.set(g.id, g);
  if (g.css && g.css.trim()) { const st = document.createElement('style'); st.textContent = g.css; document.head.append(st); }
}
function setImgs(id, u) {
  document.querySelectorAll('img[data-cv="' + id + '"]').forEach(im => { im.removeAttribute('data-cv'); im.src = u; });
}
function lzPack(i) {
  if (LZ.pk[i]) return LZ.pk[i];
  const pk = LZ.packs[i];
  const p = (LZ.key ? lzFetch(pk.f).then(lzOpen) : fetch(lzUrl(pk.f, '.json')).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })).then(t => {
    const d = JSON.parse(t);
    Object.keys(d.c || {}).forEach(id => { if (!Ameplay.covers[id]) Ameplay.covers[id] = d.c[id]; });
    Object.keys(d.s || {}).forEach(id => { if (!Ameplay.shots[id]) Ameplay.shots[id] = d.s[id]; });
    pk.ids.forEach(id => { LZ.done.add(id); const g = byId.get(id); if (g && !g.cv) { coverCache.delete(id); setImgs(id, coverUrl(g)); } });
    delete LZ.raw[pk.f];
  });
  return LZ.pk[i] = p.catch(e => { delete LZ.pk[i]; throw e; });
}
const CV = { url: {}, p: {}, bad: {}, q: [], n: 0 };
function cvWant(id, hi) {
  const g = byId.get(id);
  if (!g || !g.cv || CV.url[id] || CV.p[id] || CV.bad[id]) return;
  const at = CV.q.indexOf(id);
  if (at >= 0) { if (!hi) return; CV.q.splice(at, 1); }
  if (hi) CV.q.unshift(id); else CV.q.push(id);
  cvPump();
}
function cvPump() {
  while (CV.n < 6 && CV.q.length) {
    const id = CV.q.shift(), g = byId.get(id);
    if (!g || !g.cv) continue;
    CV.n++;
    CV.p[id] = lzFetch(g.cv).then(lzOpenBuf).then(buf => {
      delete LZ.raw[g.cv];
      const u = URL.createObjectURL(new Blob([buf], { type: g.cvt || 'image/webp' }));
      CV.url[id] = u; coverCache.delete(id); setImgs(id, u);
    }, e => {
      CV.bad[id] = 1; coverCache.delete(id); setImgs(id, coverUrl(g));
    }).finally(() => { delete CV.p[id]; CV.n--; cvPump(); });
  }
}
const lzCover = (id, hi) => { const g = byId.get(id); if (g && g.cv) { cvWant(id, hi); return; } const i = LZ.packOf[id]; if (i != null && !LZ.done.has(id)) lzPack(i).catch(() => {}); };
function lzScan(now) {
  const imgs = document.querySelectorAll('img[data-cv]');
  if (!imgs.length) return;
  const wait = now === true ? null : pend;
  if (wait) need(wait).then(() => lzScan(true), () => lzScan(true));
  if (!LZ.io && window.IntersectionObserver) LZ.io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { LZ.io.unobserve(e.target); if (e.target.dataset.cv) lzCover(e.target.dataset.cv); } }), { rootMargin: '500px 0px' });
  imgs.forEach(im => { if (im.closest('#pThumb')) lzCover(im.dataset.cv, true); else if (wait) return; else if (!LZ.io || im.closest('.rail')) lzCover(im.dataset.cv); else LZ.io.observe(im); });
}
function lzIdle(now) {
  if (now !== true && pend) { need(pend).then(() => lzIdle(true), () => lzIdle(true)); return; }
  const later = fn => window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 800);
  const rest = LZ.packs.map((p, i) => i).filter(i => !LZ.pk[i]);
  if (rest.length && rest.length <= 6) later(function step() { const i = rest.shift(); if (i == null) return; (LZ.pk[i] || lzPack(i)).then(() => later(step), () => {}); });
  let budget = 600000;
  S.recent.slice(0, 2).map(id => byId.get(id)).forEach(g => { if (g && !g.mount && g.lazy && (g.size || 0) <= budget) { budget -= g.size || 0; later(() => lzPrefetch(g)); } });
}
Ameplay.lazy = d => {
  LZ.key = typeof d.k === 'string' && d.k.length > 20 ? d.k : null;
  LZ.dir = d.dir || '';
  LZ.root = PATH_MODE ? location.origin + '/' : new URL('.', location.href).href;
  (d.packs || []).forEach((p, i) => { LZ.packs.push(p); p.ids.forEach(id => { LZ.packOf[id] = i; }); });
  (d.games || []).forEach(g => Ameplay.register(g));
};

const coverCache = new Map();
function svgCover(g) {
  let svg = Ameplay.covers[g.id];
  if (!svg) {
    const icon = (g.icon || '').replace('<svg', '<svg x="135" y="85" width="130" height="130"');
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${TINT[g.id] || '#6c5ce7'}"/><circle cx="200" cy="150" r="96" fill="#fff" opacity=".16"/><g style="color:#fff">${icon}</g></svg>`;
  }
  if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function coverUrl(g) {
  if (coverCache.has(g.id)) return coverCache.get(g.id);
  let url;
  if (g.cv && !CV.bad[g.id]) {
    if (CV.url[g.id]) url = CV.url[g.id];
    else if (!LZ.key) url = lzUrl(g.cv, '.' + (g.cvx || 'webp'));
    else return BLANK;
  } else {
    if (LZ.packOf[g.id] != null && !LZ.done.has(g.id) && !Ameplay.shots[g.id] && !Ameplay.covers[g.id]) return BLANK;
    const shot = Ameplay.shots[g.id];
    if (shot) {
      try {
        const bin = atob(shot.slice(shot.indexOf(',') + 1)), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        url = URL.createObjectURL(new Blob([bytes], { type: shot.slice(5, shot.indexOf(';')) }));
      } catch (e) { url = shot; }
    } else url = svgCover(g);
  }
  coverCache.set(g.id, url);
  return url;
}
const thumbsOn = () => S.prefs.thumbs !== false;
const tint = g => g.cc || TINT[g.id] || '#6c5ce7';
const img = (g, pri) => { if (!thumbsOn()) return ''; const u = coverUrl(g); return `<img src="${u}"${u === BLANK ? ` data-cv="${g.id}"` : ''} alt="" width="16" height="10"${pri ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async" draggable="false">`; };
let sel = null;
const card = (g, src, i) => `<a class="card${sel === g.id && src === 'grid' ? ' sel' : ''}" href="${href(g.id)}" data-id="${g.id}" data-src="${src}" style="--c:${tint(g)};--i:${i || 0}"><div class="art">${img(g, i != null && i < 10)}</div><div class="name">${esc(g.title)}</div></a>`;
const srow = g => `<a class="srow${sel === g.id ? ' sel' : ''}" href="${href(g.id)}" data-id="${g.id}" data-src="side" ><span class="n">${esc(g.title)}</span></a>`;
function related(g) {
  const mine = new Set(g.info.genres);
  const scored = games.filter(x => x !== g).map(x => {
    const shared = x.info.genres.filter(k => mine.has(k)).length;
    const uni = new Set([...mine, ...x.info.genres]).size;
    let s = shared / uni * 10;
    if (x.is3d === g.is3d) s += 1.2;
    if (x.info.pl === g.info.pl) s += 1.2;
    if (bucket(x.info.mins) === bucket(g.info.mins)) s += .8;
    if (x.info.remake && g.info.remake) s += .5;
    const kw = new Set(toks(g.info.kw)), ov = toks(x.info.kw).filter(w => kw.has(w) && w.length > 3).length;
    s += Math.min(ov, 4) * .5;
    return [s - x.info.rank / 400, x];
  });
  return scored.sort((a, b) => b[0] - a[0]).map(x => x[1]);
}

const SB = { on: !!(SUPABASE_URL && SUPABASE_ANON_KEY), c: null, p: null, lib: null, user: null, session: null, prof: null, syncing: false, again: false, fail: 0, t: 0, loud: false, mode: 'in', choosing: false, view: 'main' };
const AN_KEY = 'gameplay:analytics', CK_KEY = 'gameplay:consent', AN_MAX = 2000;
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
let consent = null;
try { consent = JSON.parse(localStorage.getItem(CK_KEY)); } catch (e) {}
if (!consent || typeof consent !== 'object' || consent.v !== 2) consent = null;
const anOk = () => !!(consent && consent.analytics);
let anQ = [];
try { anQ = JSON.parse(localStorage.getItem(AN_KEY)) || []; } catch (e) {}
if (!Array.isArray(anQ)) anQ = [];
if (!anOk()) anQ = [];
let anHold = [], anT = 0, anErr = 0, anBusy = false;
const SID = (() => { try { const o = JSON.parse(sessionStorage.getItem('gameplay:sid')); if (o && o.id && Date.now() - o.t < 30 * 60e3) return o.id; } catch (e) {} return rid(); })();
const T0 = Date.now();
function anSave() { try { if (anOk()) localStorage.setItem(AN_KEY, JSON.stringify(anQ)); } catch (e) { anQ.splice(0, Math.ceil(anQ.length / 4)); } }
function anClean(p) {
  const o = {};
  Object.keys(p).slice(0, 24).forEach(k => {
    const v = p[k];
    if (v == null) return;
    if (typeof v === 'number') o[k] = isFinite(v) ? Math.round(v * 100) / 100 : null;
    else if (typeof v === 'boolean') o[k] = v;
    else if (typeof v === 'string') o[k] = v.slice(0, 160);
    else if (Array.isArray(v)) o[k] = v.slice(0, 12).map(x => typeof x === 'object' ? String(x) : x);
  });
  return o;
}
function track(e, p) {
  if (typeof e !== 'string' || !e) return;
  const ev = { e: e.slice(0, 40), t: Date.now(), s: SID };
  if (SB.user) { ev.u = SB.user.id; if (e === 'game_play' || e === 'game_time' || e === 'record') syNudge(); }
  if (p && typeof p === 'object') ev.p = anClean(p);
  try { sessionStorage.setItem('gameplay:sid', JSON.stringify({ id: SID, t: Date.now() })); } catch (x) {}
  if (!consent) { if (anHold.length < 400) anHold.push(ev); return; }
  if (!anOk()) return;
  anQ.push(ev);
  if (anQ.length > AN_MAX) anQ.splice(0, anQ.length - AN_MAX);
  clearTimeout(anT); anT = setTimeout(anSave, 500);
}
async function anFlush() {
  const A = Ameplay.analytics;
  if (!anOk() || anBusy || !anQ.length || typeof A.sink !== 'function') return false;
  const batch = anQ.slice(0, 250), set = new Set(batch);
  anBusy = true;
  try { await A.sink(batch.map(x => Object.assign({}, x))); anQ = anQ.filter(x => !set.has(x)); anSave(); return true; }
  catch (e) { return false; }
  finally { anBusy = false; }
}
function device() {
  const ua = navigator.userAgent || '', coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  const w = screen.width || innerWidth, h = screen.height || innerHeight, small = Math.min(w, h);
  const type = /iPad|Tablet/i.test(ua) || (coarse && small >= 600) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'tablet' : coarse || /Mobi|Android|iPhone/i.test(ua) ? 'phone' : 'desktop';
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'other';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'other';
  return { type, os, browser, touch: coarse, sw: w, sh: h, vw: innerWidth, vh: innerHeight, dpr: Math.round((devicePixelRatio || 1) * 100) / 100, lang: (navigator.language || '').slice(0, 12), standalone: !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches) };
}
function anReport() {
  const ev = anQ.slice(), by = {}, gm = {}, searches = {}, filters = {}, errors = [], parties = [], sessions = new Set(), dev = {};
  const G = id => gm[id] || (gm[id] = { game: id, clicks: 0, opens: 0, launches: 0, plays: 0, seconds: 0 });
  ev.forEach(x => {
    by[x.e] = (by[x.e] || 0) + 1; sessions.add(x.s);
    const p = x.p || {};
    if (x.e === 'tile_click' && p.game) G(p.game).clicks++;
    if (x.e === 'game_open' && p.game) G(p.game).opens++;
    if (x.e === 'game_launch' && p.game) G(p.game).launches++;
    if (x.e === 'game_play' && p.game) G(p.game).plays++;
    if (x.e === 'game_time' && p.game) G(p.game).seconds += p.sec || 0;
    if (x.e === 'search' && p.q) searches[p.q] = (searches[p.q] || 0) + 1;
    if (x.e === 'filter') { const k = p.k + ':' + p.v; filters[k] = (filters[k] || 0) + (p.on ? 1 : 0); }
    if (x.e === 'error') errors.push(p);
    if (x.e === 'online_party') parties.push(p);
    if (x.e === 'session' && p.type) dev[p.type] = (dev[p.type] || 0) + 1;
  });
  const out = { consent: consent ? (anOk() ? 'accepted' : 'rejected') : 'not chosen', queued: ev.length, held: anHold.length, sessions: sessions.size, events: by, games: Object.values(gm).sort((a, b) => b.seconds - a.seconds || b.opens - a.opens), searches, filters, devices: dev, parties, errors };
  try {
    console.group('gameplay analytics');
    console.log('consent:', out.consent, '| queued events:', out.queued, '| sessions:', out.sessions, '| sink:', typeof Ameplay.analytics.sink === 'function' ? 'set' : 'none');
    console.table(by);
    if (out.games.length) console.table(out.games);
    if (Object.keys(searches).length) console.table(searches);
    if (Object.keys(filters).length) console.table(filters);
    if (Object.keys(dev).length) console.table(dev);
    if (parties.length) console.table(parties);
    if (errors.length) console.table(errors);
    console.groupEnd();
  } catch (e) {}
  return out;
}
Ameplay.analytics = {
  sink: null,
  track,
  flush: anFlush,
  report: anReport,
  events: () => anQ.map(x => Object.assign({}, x)),
  clear() { anQ = []; anHold = []; try { localStorage.removeItem(AN_KEY); } catch (e) {} },
  get consent() { return consent ? { analytics: anOk(), at: consent.at } : null; },
  get session() { return SID; }
};
function setConsent(an, lv) {
  consent = { v: 2, analytics: !!an, level: lv || (an ? 'all' : 'essential'), terms: true, at: Date.now() };
  try { localStorage.setItem(CK_KEY, JSON.stringify(consent)); } catch (e) {}
  if (an) { anQ = anQ.concat(anHold); anHold = []; track('consent', { analytics: true }); anSave(); }
  else { anQ = []; anHold = []; try { localStorage.removeItem(AN_KEY); if (SB.on) localStorage.removeItem(VIDK); } catch (e) {} }
  $('#ckbar').hidden = true;
  document.documentElement.classList.remove('ck-open');
  syncSwitches();
}
const TT = { g: null, since: 0, acc: 0 };
const ttRunning = () => !!(cur && !PAUSE.on && document.visibilityState !== 'hidden');
const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function ttAccrue() {
  const now = performance.now();
  if (TT.g && TT.since) TT.acc += Math.min(600, (now - TT.since) / 1000);
  TT.since = TT.g && ttRunning() ? now : 0;
}
function ttCommit(final) {
  ttAccrue();
  const id = TT.g, sec = TT.acc;
  if (!id || sec < .5) return;
  TT.acc = 0;
  S.time[id] = (S.time[id] || 0) + sec;
  const k = dayKey(), d = S.daily[k] || (S.daily[k] = { s: 0, p: 0 });
  d.s += sec;
  const keys = Object.keys(S.daily).sort();
  while (keys.length > 60) delete S.daily[keys.shift()];
  save();
  TT.sec = (TT.sec || 0) + sec;
  if (final && TT.sec >= 1) { track('game_time', { game: id, sec: Math.round(TT.sec) }); TT.sec = 0; }
}
function ttSync() {
  const id = cur ? cur.g.id : null;
  if (id !== TT.g) { ttCommit(true); TT.g = id; TT.acc = 0; TT.sec = 0; TT.since = 0; }
  ttAccrue();
}
let clickSrc = null, searchT = 0, errN = 0;

function start(g) {
  frame.textContent = '';
  const root = document.createElement('div');
  root.className = 'g-root gm-' + g.id;
  frame.append(root);
  $('#pScore').textContent = '—'; $('#pScoreK').textContent = g.info.stat || 'Score'; setBest(g);
  setPause(false);
  const ctl = makeApi(g, root);
  cur = { g, api: ctl.api, kill: ctl.kill, counted: cur ? cur.counted : false };
  ttSync();
  const mark = e => {
    if (!cur || cur.g !== g || cur.counted) return;
    if (e && e.type === 'keydown' && (isField(e.target) || (e.target.closest && !e.target.closest('.g-root') && e.target.closest('.top, .side, .modal, .menu, .ckbar')))) return;
    markPlayed(g);
  };
  ctl.api.on(frame, 'pointerdown', mark, true);
  ctl.api.on(window, 'keydown', mark, true);
  const fail = e => { console.error('[gameplay]', g.id, e); track('error', { game: g.id, where: 'mount', msg: String(e && e.message || e) }); if (ctl.api.alive) root.innerHTML = '<p class="g-muted">This game hit an error and could not start.</p>'; };
  const hook = r => {
    if (!r || typeof r.destroy !== 'function') return;
    if (ctl.api.alive) ctl.add(() => r.destroy());
    else { try { r.destroy(); } catch (e) {} }
  };
  try {
    const inst = g.mount(root, ctl.api);
    if (inst && typeof inst.then === 'function') inst.then(hook, fail); else hook(inst);
  } catch (e) { fail(e); }
  frame.focus({ preventScroll: true });
  [60, 400, 1200, 2800].forEach(ms => setTimeout(queueFit, ms));
}
function markPlayed(g) {
  if (!cur || cur.g !== g || cur.counted) return;
  cur.counted = true;
  S.plays[g.id] = (S.plays[g.id] || 0) + 1;
  S.last[g.id] = Date.now();
  S.recent = [g.id, ...S.recent.filter(id => id !== g.id)].slice(0, 8);
  const k = dayKey(), d = S.daily[k] || (S.daily[k] = { s: 0, p: 0 });
  d.p++;
  save();
  track('game_play', { game: g.id, n: S.plays[g.id] });
}
let pauseEl = null;
function setPause(on) {
  if (PAUSE.on === on && (on ? pauseEl : !pauseEl)) return;
  PAUSE.on = on;
  ttSync();
  if (pauseEl) { const p = pauseEl; pauseEl = null; p.classList.remove('show'); p.style.pointerEvents = 'none'; setTimeout(() => p.remove(), 300); }
  if (!on) { frame.focus({ preventScroll: true }); return; }
  dispatchEvent(new Event('blur'));
  const el = document.createElement('div');
  el.className = 'g-overlay g-pause';
  el.innerHTML = '<div class="g-ov-card"><h3 class="g-ov-title">Paused</h3><div class="g-ov-btns"><button class="g-btn" data-p="r">Resume</button><button class="g-btn ghost" data-p="s">Restart</button><button class="g-btn ghost" data-p="x">All games</button></div></div>';
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-p]');
    if (!b) return;
    sfx('tap');
    if (b.dataset.p === 'r') setPause(false);
    else if (b.dataset.p === 's') { setPause(false); restartCurrent(); }
    else { setPause(false); const a = document.querySelector('.am-back'); if (a) a.click(); }
  });
  frame.append(el); void el.offsetWidth; el.classList.add('show');
  pauseEl = el;
}
const canPause = () => !!(cur && !cur.g.ownPause && !(cur.api && cur.api.online));
function restartCurrent() {
  if (!cur) return;
  const g = cur.g; cur.kill();
  frame.classList.remove('swap'); void frame.offsetWidth; frame.classList.add('swap');
  start(g);
}
const canon = $('#canon'), metaDesc = $('#metaDesc');
function setHead(title, desc, path) {
  document.title = title;
  if (metaDesc) metaDesc.setAttribute('content', desc);
  document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]').forEach(m => m.setAttribute('content', title));
  document.querySelectorAll('meta[property="og:description"],meta[name="twitter:description"]').forEach(m => m.setAttribute('content', desc));
  if (canon && /^https?:/.test(location.protocol) && PATH_MODE) { canon.setAttribute('href', location.origin + path); document.querySelectorAll('meta[property="og:url"]').forEach(m => m.setAttribute('content', location.origin + path)); }
}
let pend = null;
function waitStart(g) {
  pend = g;
  frame.textContent = '';
  $('#pScore').textContent = '—'; setBest(g);
  const t0 = performance.now();
  const box = document.createElement('div');
  box.style.cssText = 'position:relative;width:min(100%,' + (g.width || 880) + 'px);aspect-ratio:16/10;max-height:calc(100dvh - var(--goff, 250px));margin:0 auto';
  frame.append(box);
  const t = setTimeout(() => { if (pend !== g || !box.isConnected) return; const el = document.createElement('div'); el.className = 'g-loading pg-sk'; el.innerHTML = '<i></i><span>Loading…</span>'; box.append(el); }, 200);
  need(g).then(r => {
    clearTimeout(t);
    if (pend !== g) return;
    pend = null; start(r); markSide();
    track('game_launch', { game: g.id, ms: Math.round(performance.now() - t0), lazy: true });
  }, e => {
    clearTimeout(t);
    if (pend !== g) return;
    console.warn('[gameplay]', g.id, e);
    track('error', { game: g.id, where: 'load', msg: String(e && e.message || e) });
    frame.textContent = '';
    const el = document.createElement('div');
    el.className = 'g-overlay';
    el.innerHTML = '<div class="g-ov-card"><h3 class="g-ov-title">Couldn’t load the game</h3><p class="g-ov-text">Check your connection and try again.</p><div class="g-ov-btns"><button class="g-btn" data-a="1">Retry</button></div></div>';
    el.addEventListener('click', ev => { if (ev.target.closest('[data-a]') && pend === g) { sfx('tap'); waitStart(g); } });
    frame.append(el); void el.offsetWidth; el.classList.add('show');
  });
}
function openGame(g) {
  if (cur && cur.g === g) return;
  if (pend && pend.id === g.id) return;
  if (cur) { cur.kill(); cur = null; ttSync(); }
  pend = null;
  track('game_open', { game: g.id, src: clickSrc || 'link' });
  adSeen(g.id);
  rtTrack();
  clickSrc = null;
  setHead(g.title + ' — play free online | gameplay', g.title + ' on gameplay: ' + (g.blurb || '') + ' Free to play in your browser, no download.', '/' + g.id);
  $('#pTitle').textContent = g.title;
  $('#pSub').textContent = gname(g.info.genres[0]) + ' · ' + playersText(g.info.pl);
  $('#pScoreK').textContent = g.info.stat || 'Score';
  $('#pThumb').innerHTML = img(g, true); $('#pThumb').style.setProperty('--c', tint(g));
  gamebox.style.setProperty('--fw', (g.width || 880) + 'px');
  $('#more').innerHTML = related(g).slice(0, 10).map(x => card(x, 'more')).join('');
  showView('game');
  if (!$('#slist').children.length) renderResults();
  scrollTo({ top: 0, behavior: 'instant' });
  gamebox.classList.remove('enter'); void gamebox.offsetWidth; gamebox.classList.add('enter');
  syncTheater();
  if (shortQuery.matches) requestAnimationFrame(toStage);
  if (g.mount) { start(g); track('game_launch', { game: g.id, ms: 0, lazy: false }); } else waitStart(g);
  markSide();
  lzScan();
}
function closeGame() {
  const was = !!(cur || pend);
  pend = null;
  if (!was) return;
  setPause(false);
  if (cur) { cur.kill(); cur = null; }
  ttSync();
  if (gamebox.classList.contains('fs')) fsExit();
  frame.textContent = '';
  $('#stage').style.height = '';
  frame.style.transform = '';
  setHead(BASE_TITLE, BASE_DESC, '/');
  rtTrack();
}

let view = '', homeY = 0;
function showView(v) {
  closeAll();
  document.body.classList.toggle('in-game', v === 'game');
  if (view === v) return false;
  if (view === 'home') homeY = scrollY;
  view = v;
  ['home', 'game', 'legal', 'admin'].forEach(k => { const el = $('#v' + k[0].toUpperCase() + k.slice(1)); el.hidden = k !== v; if (k === v) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; } });
  if (v !== 'home' && !$('#slist').children.length) { lastList = compute().list; renderSide(lastList); markSide(); }
  track('view', { v });
  return true;
}

function filterLabel(k, v) {
  const gr = FGROUPS.find(x => x.key === k), o = gr && gr.opts.find(x => x[0] === v);
  return o ? o[1] : v;
}
function renderPanel() {
  const sorts = SORTS.filter(s => s[0] !== 'rel' || state.q.trim());
  const cs = state.sort || defSort();
  $('#fgroups').innerHTML = FGROUPS.map(gr => `<div class="fg"><h4>${gr.name}</h4><div class="chips">${gr.opts.map(o => `<button class="chip" type="button" data-f="${gr.key}" data-v="${o[0]}" aria-pressed="${state[gr.key].has(o[0])}">${esc(o[1])}</button>`).join('')}</div></div>`).join('')
    + `<div class="fg"><h4>Sort by</h4><div class="chips">${sorts.map(s => `<button class="chip" type="button" data-sort="${s[0]}" aria-pressed="${s[0] === cs}">${s[1]}</button>`).join('')}</div></div>`;
}
function fbtnState() {
  const n = nFilters(), fc = $('#fcount');
  fc.hidden = !n; fc.textContent = n;
  $('#fbtn').classList.toggle('on', n > 0 && openK !== 'filters');
}
function recentList() { return S.recent.map(id => byId.get(id)).filter(Boolean).slice(0, 5); }
function renderSide(list) {
  const sl = $('#slist'), sy = sl.scrollTop;
  sl.innerHTML = list.map(srow).join('');
  sl.scrollTop = sy;
  $('#scount').textContent = list.length;
  const g = sel && byId.get(sel), p = $('#play');
  p.disabled = !g; p.textContent = g ? 'Play ' + g.title : 'Select a game';
}
let lastList = [];
function renderResults() {
  const { list, partial, q, sort } = compute();
  lastList = list;
  const n = list.length, filt = activeCount() > 0;
  $('#title').textContent = filt || q ? 'Results' : 'All games';
  $('#count').textContent = n + (n === 1 ? ' game' : ' games') + (partial ? ', partial matches' : '');
  $('#grid').innerHTML = list.map((g, i) => card(g, 'grid', i)).join('');
  $('#grid').hidden = !n; $('#empty').hidden = n > 0;
  $('#continue').hidden = !!(filt || q) || !recentList().length;
  const chips = [];
  FKEYS.forEach(k => state[k].forEach(v => chips.push(`<button class="chip" type="button" data-x="${k}:${v}" aria-label="Remove ${esc(filterLabel(k, v))}">${esc(filterLabel(k, v))} &times;</button>`)));
  if (state.sort && state.sort !== defSort()) { const s = SORTS.find(x => x[0] === state.sort); chips.push(`<button class="chip" type="button" data-x="s:" aria-label="Reset sort">${esc(s ? s[1] : state.sort)} &times;</button>`); }
  $('#active').innerHTML = chips.join(''); $('#active').hidden = !chips.length;
  $('#apply').textContent = 'Show ' + n + (n === 1 ? ' game' : ' games');
  renderPanel(); fbtnState();
  renderSide(list);
  markSide();
  lzScan();
}
function renderHome() {
  const rec = recentList();
  $('#rail').innerHTML = rec.map((g, i) => card(g, 'rail', i)).join('');
  renderResults();
}
function renderChrome() {
  $('#q').placeholder = `Search ${games.length} games`;
  document.querySelectorAll('[data-legal]').forEach(a => a.setAttribute('href', legalHref(a.dataset.legal)));
  $('#about').textContent = 'gameplay, ' + games.length + ' games';
}
function markSide() {
  const on = view === 'game' ? (cur ? cur.g.id : pend ? pend.id : null) : sel;
  document.querySelectorAll('#slist .srow').forEach(a => a.classList.toggle('sel', a.dataset.id === on));
  document.querySelectorAll('#grid .card').forEach(a => a.classList.toggle('sel', view === 'home' && a.dataset.id === sel));
}
function select(id, scroll) {
  sel = id;
  const g = byId.get(id), p = $('#play');
  p.disabled = !g; p.textContent = g ? 'Play ' + g.title : 'Select a game';
  markSide();
  if (scroll === 'grid') { const el = document.querySelector('#grid [data-id="' + id + '"]'); if (el) el.scrollIntoView({ block: 'center', behavior: S.prefs.motion ? 'instant' : 'smooth' }); }
}
function toAll(smooth) { requestAnimationFrame(() => $('#all').scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })); }
function changeState(mut, o = {}) {
  mut();
  if (view !== 'home') { go(homeHref(), false); return; }
  syncUrl(true);
  renderResults();
  if (o.scroll) toAll(true);
}
function toggleFilter(k, v) {
  let on = false;
  changeState(() => { if (state[k].has(v)) state[k].delete(v); else { state[k].add(v); on = true; } });
  track('filter', { k, v, on, n: lastList.length });
}

const LEGAL = {
  terms: ['Terms of Service', `<p>These terms apply when you use gameplay, a free website of browser games. By playing on the site you agree to them. If you do not agree, please do not use the site.</p>
<h2>1. What gameplay is</h2><p>gameplay is a fan-made, non-commercial hobby project. Most games are remakes inspired by well-known games. gameplay is not affiliated with, endorsed by or sponsored by the creators, publishers or owners of the original games. Game names are used only to say which game a remake is inspired by. All trademarks and original works belong to their owners.</p>
<h2>2. Using the site</h2><ul><li>The site is free and for personal, non-commercial use.</li><li>Do not try to break, overload, copy at scale or misuse the site, and do not use it to cheat or harm other players.</li><li>Some versions of the site are protected by a password. Do not share it publicly.</li></ul>
<h2>3. Online play</h2><p>Online games connect you directly to the other players in your party using a party code. Be respectful: no harassment, hate, threats, spam or sharing other people's personal information. Do not share your own personal details in names or chat. The host of a party can remove players, and you can leave a party at any time.</p>
<h2>4. Names and messages</h2><p>Your username, display name and chat messages must not be offensive, misleading or impersonate someone else. We may block names or content that break these terms.</p>
<h2>5. Accounts</h2><p>Today you play without an account and your data stays in your browser. We plan to add optional sign-in with Google. When we do, these terms will be updated.</p>
<h2>6. Your data on this device</h2><p>Records, saves and settings are kept in your browser. Clearing your browser data, using private browsing or switching devices can remove them. We cannot restore data that was stored only on your device.</p>
<h2>7. No warranty</h2><p>The site is provided "as is" and "as available". Games can change, move or be removed at any time, and the site may sometimes be unavailable or contain bugs.</p>
<h2>8. Liability</h2><p>To the extent the law allows, the people who run gameplay are not liable for indirect or consequential losses, or for loss of data, arising from your use of the site. Nothing in these terms limits liability that cannot be limited by law.</p>
<h2>9. Rights holders</h2><p>If you own the rights to a game, name or artwork and want something changed or removed, contact us and we will act promptly.</p>
<h2>10. Changes</h2><p>We may update these terms. The date at the top shows the latest version. If you keep using the site after a change, the new terms apply.</p>
<h2>11. Contact</h2><p>Questions, requests about your data, or a rights holder asking for a change: email <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>.</p>`],
  privacy: ['Privacy Policy', `<p>In short: you do not need an account, there are no ads, we do not sell data, and what the site remembers about you is stored in your own browser.</p>
<h2>What is stored on your device</h2><table><thead><tr><th>Name</th><th>What it holds</th><th>Kind</th></tr></thead><tbody>
<tr><td><code>gameplay:v1</code></td><td>Best scores, play counts, time played, recently played games and settings such as theme and sound</td><td>Essential</td></tr>
<tr><td><code>gameplay:save:…</code></td><td>Saved progress for games that support it</td><td>Essential</td></tr>
<tr><td><code>gameplay:profile</code></td><td>The username and display name you choose</td><td>Essential</td></tr>
<tr><td><code>gameplay:consent</code></td><td>Your cookie choice</td><td>Essential</td></tr>
<tr><td><code>gameplay:gate</code>, <code>gpgate</code></td><td>Password unlock and wrong attempts, only on the password-protected version</td><td>Essential</td></tr>
<tr><td><code>gameplay:analytics</code>, <code>gameplay:sid</code></td><td>Usage events and a random session ID, only if you accept analytics</td><td>Analytics</td></tr>
</tbody></table>
<h2>Analytics</h2><p>Only if you accept analytics, the site records events such as which games are opened and clicked, how long they are played (only while the tab is visible and the game is not paused), searches typed in the search box, filters used, online parties started, errors, and basic device information: device type (phone, tablet or computer), operating system and browser family, screen size and language. Events are linked to a random session ID, not to your name or email.</p><p>Right now these events stay in your browser and are not sent anywhere. We plan to send them to our own database (hosted on Supabase) to learn which games people enjoy. We will update this policy before that starts. If you reject analytics, nothing is recorded.</p>
<h2>Online play</h2><p>Online games connect players directly using WebRTC. To find each other, browsers use the PeerJS connection service and connection helper (STUN and TURN) servers. Players in your party see the name you enter and your chat messages. As with any direct connection, the other players and these services can see your IP address. We do not store chat messages.</p>
<h2>Other services</h2><ul><li>Firebase Hosting (Google) delivers the website and may keep standard server logs, such as IP address and time of request.</li><li>Google Fonts provides the fonts. Your browser downloads them from Google, which receives your IP address.</li><li>The 3D engine and the networking library are downloaded from public content delivery networks (cdnjs and jsDelivr).</li></ul>
<h2>Accounts, coming later</h2><p>We plan to add optional sign-in with Google, with profiles, friends and records stored in our database on Supabase. Signing in will stay optional. When it launches, this policy will explain exactly what is stored, for how long and why.</p>
<h2>Your choices</h2><ul><li>Change your cookie choice at any time in Cookie settings.</li><li>Download your data in Settings, Privacy and data.</li><li>Delete it in Settings, Account, or by clearing this site's data in your browser.</li></ul><p>Depending on where you live, you may have rights to access, correct, delete or object to the use of your personal data. Because today we hold no personal data on our servers, most requests can be handled directly in your browser with the tools above.</p>
<h2>Children</h2><p>The site is meant for a general audience. Children under 13, or under the age of digital consent in their country, should ask a parent or guardian before playing online with others.</p>
<h2>Changes</h2><p>We will update this policy when the site changes, in particular before analytics are sent to a server or accounts are introduced. The date at the top shows the latest version.</p>
<h2>Contact</h2><p>Questions, requests about your data, or a rights holder asking for a change: email <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>.</p>`],
  cookies: ['Cookie Policy', `<p>This policy explains the cookies and similar browser storage (local storage and session storage) used by gameplay.</p>
<h2>Essential</h2><p>These make the site work and are always on: your records, saves, profile, settings, your cookie choice and, on the password-protected version, the password unlock. They stay in your browser and are never used to track you.</p>
<h2>Analytics (optional)</h2><p>If you accept, the site stores anonymous usage events, such as games opened, time played, searches and filters, with a random session ID (<code>gameplay:analytics</code>, <code>gameplay:sid</code>). They help us understand which games people play. For now they stay on your device. Rejecting analytics turns this off and deletes what was stored.</p>
<h2>No advertising cookies</h2><p>gameplay does not use advertising or cross-site tracking cookies.</p>
<h2>Third parties</h2><p>Fonts, the 3D engine and the networking library are loaded from Google Fonts, cdnjs and jsDelivr, and online games use the PeerJS service. These services receive your IP address when your browser contacts them, but gameplay does not let them set cookies through the site.</p>
<h2>Your choice</h2><p>You can change your choice at any time: <button class="btn2" type="button" data-cookieset>Cookie settings</button></p><p>You can also delete all site data in your browser settings.</p>
<h2>Contact</h2><p>Questions, requests about your data, or a rights holder asking for a change: email <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>.</p>`]
};
function openLegal(k) {
  closeGame();
  showView('legal');
  const d = LEGAL[k];
  $('#doc').innerHTML = `<h1>${d[0]}</h1><p class="upd">Last updated 16 October 2026</p>${d[1]}`;
  document.querySelectorAll('.ltabs a').forEach(a => a.setAttribute('aria-current', a.dataset.legal === k ? 'page' : 'false'));
  setHead(d[0] + ' | gameplay', d[0] + ' for gameplay.', '/' + k);
  scrollTo({ top: 0, behavior: 'instant' });
}

const MENUS = { filters: ['#fpanel', '#fbtn'], friends: ['#fmodal', '#abtn'], profile: ['#pmenu', '#pbtn'], settings: ['#smenu', '#sbtn'], mprofile: ['#prmodal'], mstats: ['#stmodal'], msettings: ['#semodal'], msignout: ['#sgmodal'], cookies: ['#ckmodal'], mauth: ['#aumodal'], msupport: ['#tkmodal'] };
let openK = null;
const motionOK = () => !S.prefs.motion && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
function vis(el, on) {
  clearTimeout(el._vt);
  if (on) { el.classList.remove('out'); el.hidden = false; return; }
  if (el.hidden) return;
  if (!motionOK()) { el.classList.remove('out'); el.hidden = true; return; }
  el.classList.add('out');
  el._vt = setTimeout(() => { el.hidden = true; el.classList.remove('out'); }, 170);
}
function countUp(box) {
  const els = [...box.querySelectorAll('[data-n]')];
  if (!els.length || !motionOK()) return;
  const f = el => el.dataset.f === 'd' ? fmtDur : x => String(Math.round(x));
  const t0 = performance.now() + 120, D = 900;
  els.forEach(el => { el.textContent = f(el)(0); });
  const step = t => {
    const k = Math.max(0, Math.min(1, (t - t0) / D)), e = 1 - Math.pow(1 - k, 3);
    els.forEach(el => { if (el.isConnected) el.textContent = f(el)(+el.dataset.n * e); });
    if (k < 1 && els[0].isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function setOpen(k) {
  if (auLocked() && (openK === 'mauth' || k !== 'mauth')) { if (openK !== 'mauth') auGate(); return; }
  openK = openK === k ? null : k;
  Object.keys(MENUS).forEach(m => { const on = m === openK; const el = $(MENUS[m][0]); if (el) vis(el, on); if (MENUS[m][1]) $(MENUS[m][1]).setAttribute('aria-expanded', String(on)); });
  const modal = !!openK && /modal/.test(MENUS[openK][0]);
  document.body.classList.toggle('modal-open', modal);
  if (openK && (modal || openK === 'filters') && cur && !PAUSE.on && canPause()) setPause(true);
  if (openK) track('ui', { open: openK });
  if (openK === 'mprofile') fillProfile();
  if (openK === 'mstats') renderStats();
  if (openK === 'profile' || openK === 'msettings') renderProfileBits();
  if (openK === 'friends') renderFriends();
  if (openK === 'cookies') { const b = $('#ckan'); b.classList.toggle('on', consent ? anOk() : true); b.setAttribute('aria-checked', String(b.classList.contains('on'))); }
  if (openK === 'filters') renderPanel();
  if (openK === 'mauth') auShow();
  if (openK === 'msupport') adSupport();
  fbtnState();
  ckPlace();
}
function closeAll() { if (openK) setOpen(openK); }
function showPane(p) {
  document.querySelectorAll('.pane').forEach(x => { const on = x.dataset.pane === p; if (on && !x.hidden) { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; } x.hidden = !on; });
  document.querySelectorAll('#snav button').forEach(b => b.setAttribute('aria-current', String(b.dataset.p === p)));
}

const PKEY = 'gameplay:profile';
function getProfile() { try { const o = JSON.parse(localStorage.getItem(PKEY)); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
function setProfile(patch) {
  const o = Object.assign(getProfile(), patch);
  try { localStorage.setItem(PKEY, JSON.stringify(o)); } catch (e) {}
  renderProfileBits();
  track('profile', { fields: Object.keys(patch).join(',') });
}
const USER_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
function renderProfileBits() {
  const p = getProfile(), un = String(p.username || '').trim(), dn = String(p.displayName || '').trim(), name = dn || un;
  document.querySelectorAll('[data-pic]').forEach(el => { if (name) el.textContent = name[0].toUpperCase(); else el.innerHTML = USER_ICON; });
  document.querySelectorAll('[data-pname]').forEach(el => { el.textContent = name || 'Guest'; });
  document.querySelectorAll('[data-psub]').forEach(el => { el.textContent = un ? '@' + un : SB.user ? SB.user.email || 'Signed in' : 'Not signed in'; });
  document.querySelectorAll('[data-pun]').forEach(el => { el.textContent = un ? '@' + un : 'No username yet'; });
}
function fillProfile() {
  renderProfileBits();
  const p = Object.assign({}, getProfile());
  if (SB.user) p.username = SB.prof && SB.prof.username || '';
  $('#pcun').textContent = p.username ? '@' + p.username : 'No username yet';
  $('#pcsince').textContent = 'Player since ' + new Date(S.since).toLocaleDateString('en', { month: 'long', year: 'numeric' });
  $('#pcg').textContent = $('#pcg').dataset.n = Object.keys(S.plays).filter(id => byId.has(id)).length;
  $('#pcr').textContent = $('#pcr').dataset.n = Object.keys(S.best).filter(id => byId.has(id)).length;
  countUp($('#prmodal'));
  $('#un').value = p.username || '';
  $('#dn').value = p.displayName || '';
  $('#unedit').textContent = p.username ? 'Change' : 'Choose';
  say('unnote', ''); say('dnnote', '');
}
function say(id, m, ok) { const n = $('#' + id); n.textContent = m; n.className = 'note' + (ok ? ' ok' : ''); }
let unStep = 1, unPending = '';
function unClose() { $('#unmodal').hidden = true; }
function renderFriends() { frOpen(); }
const fmtDur = s => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + 'h ' + m + 'm' : m ? m + 'm' : s + 's'; };
function ago(t) {
  if (!t) return '—';
  const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / 864e5);
  return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 7 ? d + ' days ago' : d < 14 ? 'Last week' : new Date(t).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
function renderStats() {
  if (SB.user && !SY.at && !SB.fail) { $('#stbody').innerHTML = '<div class="tiles" aria-hidden="true">' + '<div class="tile"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(4) + '</div><i class="sk sk-blk"></i><i class="sk sk-blk2"></i>'; return; }
  const ids = Object.keys(S.plays).filter(id => byId.has(id));
  const plays = ids.reduce((n, id) => n + S.plays[id], 0), time = Object.keys(S.time).filter(id => byId.has(id)).reduce((n, id) => n + S.time[id], 0);
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const wk = days.map(d => S.daily[dayKey(d)] || { s: 0, p: 0 }), wkS = wk.reduce((n, x) => n + x.s, 0), wkP = wk.reduce((n, x) => n + x.p, 0);
  const played = Object.keys(S.daily).filter(k => S.daily[k].s > 0 || S.daily[k].p > 0);
  let streak = 0;
  for (let i = 0; i < 400; i++) { const d = new Date(); d.setDate(d.getDate() - i); const x = S.daily[dayKey(d)]; if (x && (x.s > 0 || x.p > 0)) streak++; else if (i > 0) break; }
  const max = Math.max(1, ...wk.map(x => x.s));
  const top = Object.keys(S.time).filter(id => byId.has(id) && S.time[id] >= 1).sort((a, b) => S.time[b] - S.time[a]).slice(0, 5);
  const tmax = top.length ? S.time[top[0]] : 1;
  const recs = Object.keys(S.best).filter(id => byId.has(id)).sort((a, b) => (S.last[b] || 0) - (S.last[a] || 0));
  const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  $('#stbody').innerHTML = `<div class="tiles"><div class="tile" style="--i:0"><small>Games played</small><b data-n="${plays}">${plays}</b><em>+${wkP} this week</em></div><div class="tile" style="--i:1"><small>Time played</small><b data-n="${Math.round(time)}" data-f="d">${fmtDur(time)}</b><em>+${fmtDur(wkS)} this week</em></div><div class="tile" style="--i:2"><small>Records</small><b data-n="${recs.length}">${recs.length}</b><em>in ${ids.length} ${ids.length === 1 ? 'game' : 'games'} played</em></div><div class="tile" style="--i:3"><small>Days played</small><b data-n="${played.length}">${played.length}</b><em>Current streak: ${streak}</em></div></div>
<div class="two"><div class="grp"><h4>Playtime this week</h4><div class="wk">${wk.map((x, i) => `<div${i === 6 ? ' class="hi"' : ''} style="--i:${i}"><i style="height:${Math.round(x.s / max * 100)}%"></i>${DN[days[i].getDay()]}</div>`).join('')}</div></div>
<div class="grp"><h4>Most played</h4>${top.length ? `<div class="tg">${top.map((id, i) => `<div style="--i:${i}"><b>${esc(byId.get(id).title)}</b><i style="--w:${Math.max(4, Math.round(S.time[id] / tmax * 100))}%"></i><span>${fmtDur(S.time[id])}</span></div>`).join('')}</div>` : '<div class="nofr">No games played yet</div>'}</div></div>
<div class="grp"><h4>Personal records</h4>${recs.length ? `<div class="tw"><table class="rec"><thead><tr><th>Game</th><th>Best</th><th>Played</th><th>Last</th></tr></thead><tbody>${recs.map((id, i) => { const g = byId.get(id); return `<tr style="--i:${Math.min(i, 14)}"><td>${esc(g.title)}</td><td>${esc(fmt(g, S.best[id]))}</td><td>${S.plays[id] || 0}</td><td>${ago(S.last[id])}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="nofr">No records yet</div>'}</div>`;
  countUp($('#stbody'));
}

function applyTheme() {
  const t = S.prefs.theme || 'light', r = document.documentElement;
  if (t === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', t);
  document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
  const dark = t === 'dark' || (t === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#12101f' : '#f6f4ff');
}
function swVal(k) {
  if (k === 'sound') return !S.muted;
  if (k === 'analytics') return anOk();
  if (k === 'thumbs') return thumbsOn();
  if (k === 'motion') return !!S.prefs.motion;
  if (k === 'p_game') return S.prefs.p_game !== false;
  if (k === 'n_inv' || k === 'n_req' || k === 'n_msg' || k === 'n_game') return S.prefs[k] !== false;
  return !!S.prefs[k];
}
function syncSwitches() {
  document.querySelectorAll('[data-sw]').forEach(b => { const on = swVal(b.dataset.sw); b.classList.toggle('on', on); if (b.getAttribute('role') === 'switch') b.setAttribute('aria-checked', String(on)); });
  document.querySelectorAll('[data-sel]').forEach(s => { if (S.prefs[s.dataset.sel]) s.value = S.prefs[s.dataset.sel]; });
}
function setSwitch(k) {
  const v = !swVal(k);
  if (k === 'sound') { setMuted(!v); if (v) sfx('tap'); }
  else if (k === 'analytics') setConsent(v);
  else {
    S.prefs[k] = v; save(); if (k === 'p_game') rtTrack();
    if (k === 'motion') document.documentElement.classList.toggle('rm', v);
    if (k === 'thumbs') { document.documentElement.classList.toggle('nothumb', !v); coverCache.clear(); if (view === 'home') renderHome(); else if (cur || pend) { const g = (cur && cur.g) || pend; $('#pThumb').innerHTML = img(g, true); $('#more').innerHTML = related(g).slice(0, 10).map(x => card(x, 'more')).join(''); renderSide(lastList); } }
  }
  track('setting', { k, v });
  syncSwitches();
}
function setMuted(m) {
  S.muted = m; save();
  document.querySelectorAll('[data-sound]').forEach(b => b.setAttribute('aria-pressed', String(!m)));
  syncSwitches();
}
function resetRecords() {
  S.best = {}; S.plays = {}; S.recent = []; S.time = {}; S.daily = {}; S.last = {}; save();
  if (SB.on) { SY.base = { p: {}, t: {}, b: {} }; SY.pend = null; SY.saves = {}; sySave(); }
  games.forEach(g => { try { localStorage.removeItem('gameplay:save:' + g.id); } catch (e) {} });
  if (view === 'home') renderHome(); else if (cur) setBest(cur.g);
}
function downloadData(extra) {
  const out = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('gameplay:') && k !== 'gameplay:gate') { const v = localStorage.getItem(k); try { out[k] = JSON.parse(v); } catch (e) { out[k] = v; } } } } catch (e) {}
  if (extra) out.account = extra;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }));
  a.download = 'gameplay-data-' + dayKey() + '.json';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function deleteData() {
  try { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('gameplay:') && k !== 'gameplay:gate') ks.push(k); } ks.forEach(k => localStorage.removeItem(k)); } catch (e) {}
  try { sessionStorage.removeItem('gameplay:sid'); } catch (e) {}
  if (SB.on) { try { [SB_STORE, SB_STORE + '-code-verifier', SB_STORE + '-user'].forEach(k => localStorage.removeItem(k)); } catch (e) {} }
  S = { best: {}, plays: {}, recent: [], muted: false };
  setTimeout(() => location.reload(), 600);
}

let fromPop = false, progNav = false, navFromHome = false;
function route() {
  const pop = fromPop; fromPop = false;
  const loc = parseLocation();
  if (loc.legal) return openLegal(loc.legal);
  if (auLocked() && (loc.game || loc.admin)) { SB.blk = 1; closeGame(); showView('home'); renderHome(); auGate(); return; }
  if (loc.admin) return adRoute();
  if (loc.game) {
    const g = loc.game;
    if (view !== 'game') navFromHome = view === 'home' && !pop; else if (!(cur && cur.g === g) && !(pend && pend.id === g.id)) navFromHome = false;
    if (loc.code) { invite = { id: g.id, code: loc.code.toUpperCase() }; history.replaceState(null, '', href(g.id)); if (cur && cur.g === g) return restartCurrent(); }
    return openGame(g);
  }
  const wasGame = view === 'game';
  closeGame();
  const changed = showView('home');
  applyLocState(loc.state);
  if (loc.missing) { history.replaceState(null, '', homeHref()); toast('That game is not available any more'); track('error', { where: 'route', msg: 'missing game', game: loc.missing }); }
  renderHome();
  if (changed && motionOK()) { const gr = $('#grid'); gr.classList.remove('anim'); void gr.offsetWidth; gr.classList.add('anim'); clearTimeout(gr._at); gr._at = setTimeout(() => gr.classList.remove('anim'), 1400); }
  setHead(BASE_TITLE, BASE_DESC, '/');
  if (loc.toAll) toAll(!changed);
  else scrollTo({ top: changed && wasGame && pop ? homeY : 0, behavior: 'instant' });
}
const wideQuery = window.matchMedia ? window.matchMedia('(min-width: 900px)') : { matches: true };
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;
function fsEnter() {
  track('fullscreen', { game: cur ? cur.g.id : pend ? pend.id : null });
  const rq = gamebox.requestFullscreen || gamebox.webkitRequestFullscreen;
  if (rq && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
    try { const r = rq.call(gamebox, { navigationUI: 'hide' }); if (r && r.catch) r.catch(() => { gamebox.classList.add('pfs'); fsSync(); }); return; } catch (e) {}
  }
  gamebox.classList.add('pfs'); fsSync();
}
function fsExit() {
  if (gamebox.classList.contains('pfs')) { gamebox.classList.remove('pfs'); fsSync(); return; }
  const ex = document.exitFullscreen || document.webkitExitFullscreen;
  if (fsEl() && ex) { try { const r = ex.call(document); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
}
function fsSync() {
  const on = fsEl() === gamebox || gamebox.classList.contains('pfs');
  if (on === gamebox.classList.contains('fs')) return;
  gamebox.classList.toggle('fs', on); gamebox.classList.remove('fs-ui');
  document.body.classList.toggle('fs-on', on);
  document.querySelectorAll('[data-fs]').forEach(b => { b.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Fullscreen'); b.title = on ? 'Exit fullscreen' : 'Fullscreen'; });
  clearInterval(fitTimer);
  frame.classList.add('no-anim');
  if (on) { frame.style.transform = ''; fsScale = 1; fsT = [0, 0]; requestAnimationFrame(() => requestAnimationFrame(() => { fitStage(); frame.classList.remove('no-anim'); })); fitTimer = setInterval(fitStage, 1500); }
  else { $('#stage').style.height = ''; frame.style.transform = ''; fsScale = 1; fsT = [0, 0]; applyGlScale(1); requestAnimationFrame(() => { frame.classList.remove('no-anim'); startFitTimer(); queueFit(); }); }
  frame.focus({ preventScroll: true });
}
const toStage = () => { let y = 0; for (let el = gamebox; el; el = el.offsetParent) y += el.offsetTop; scrollTo({ top: Math.max(0, y), behavior: 'instant' }); };
function syncTheater() {
  const on = S.theater !== false;
  gamebox.classList.toggle('theater', (on && wideQuery.matches) || shortQuery.matches);
  document.querySelectorAll('[data-theater]').forEach(b => b.setAttribute('aria-pressed', String(on)));
  queueFit();
}

function boot() {
  const rank = g => g.info.rank;
  games.sort((a, b) => rank(a) - rank(b));
  const css = games.map(g => g.css || '').join('\n');
  if (css.trim()) { const st = document.createElement('style'); st.textContent = css; document.head.append(st); }
  buildIndex();
  renderChrome(); setMuted(S.muted); applyTheme(); renderProfileBits(); syncSwitches();
  document.documentElement.classList.toggle('rm', !!S.prefs.motion);
  document.documentElement.classList.toggle('nothumb', !thumbsOn());
  if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', applyTheme); }
  history.scrollRestoration = 'manual';
  if (!consent) $('#ckbar').hidden = false;
  const dv = device();
  let ref = '';
  try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
  track('session', Object.assign(dv, { ref: ref === location.hostname ? '' : ref, returning: Date.now() - S.since > 864e5, gated: !!LZ.key, path: PATH_MODE, games: games.length }));
  addEventListener('error', e => { if (errN++ > 20) return; track('error', { where: 'window', msg: String(e.message || '').slice(0, 160), src: String(e.filename || '').split('/').pop().slice(0, 40), line: e.lineno || 0, game: cur ? cur.g.id : null }); });
  addEventListener('unhandledrejection', e => { if (errN++ > 20) return; const r = e.reason; track('error', { where: 'promise', msg: String(r && r.message || r).slice(0, 160), game: cur ? cur.g.id : null }); });
  document.addEventListener('visibilitychange', () => { ttSync(); if (document.visibilityState === 'hidden') { ttCommit(true); anSave(); anFlush(); } });
  addEventListener('pagehide', () => { ttCommit(true); track('session_end', { sec: Math.round((Date.now() - T0) / 1000) }); anSave(); anFlush(); });
  setInterval(() => { if (cur) ttCommit(false); }, 15000);
  setInterval(anFlush, 30000);

  const q = $('#q');
  q.addEventListener('input', () => {
    changeState(() => { state.q = q.value; state.sort = state.sort === 'rel' && !q.value.trim() ? '' : state.sort; });
    const top = $('#all').getBoundingClientRect().top + scrollY - 70;
    if (scrollY > top) scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    clearTimeout(searchT);
    const v = norm(q.value);
    if (v) searchT = setTimeout(() => track('search', { q: v.slice(0, 60), n: lastList.length }), 900);
  });
  q.addEventListener('focus', () => { if (openK === 'filters' || openK === 'profile' || openK === 'settings') closeAll(); });
  ['keydown', 'keyup'].forEach(t => q.addEventListener(t, e => e.stopPropagation()));
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = $('#grid .card'); if (first && state.q.trim()) { clickSrc = 'search'; track('search_go', { q: norm(state.q).slice(0, 60), game: first.dataset.id }); go(first.getAttribute('href'), false); q.blur(); } }
    if (e.key === 'Escape') { q.value = ''; changeState(() => { state.q = ''; }); q.blur(); }
  });
  document.querySelectorAll('.modal, .menu, .ckbar').forEach(el => ['keydown', 'keyup'].forEach(t => el.addEventListener(t, e => { if (e.key !== 'Escape') e.stopPropagation(); })));
  let warmT = 0;
  const warm = e => {
    const a = e.target.closest && e.target.closest('[data-id]'), h = a && byId.get(a.dataset.id);
    if (h && h.is3d) loadThree().catch(() => {});
    clearTimeout(warmT);
    if (h && !h.mount) { if (e.type === 'mouseover') warmT = setTimeout(() => lzPrefetch(h), 80); else lzPrefetch(h); }
  };
  document.addEventListener('mouseover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
  document.addEventListener('focusin', warm, { passive: true });
  ['fbtn', 'abtn', 'sbtn', 'pbtn'].forEach((id, i) => $('#' + id).addEventListener('click', e => { e.stopPropagation(); setOpen(['filters', 'friends', 'settings', 'profile'][i]); }));
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('.g-root')) { if (openK) closeAll(); return; }
    if (openK && !t.closest('.menu, .mc, [data-go], [data-cookieset], [data-legal], #unmodal')) { const was = openK; closeAll(); if (!/modal/.test(MENUS[was][0]) && t.closest('a[href], button')) { e.preventDefault(); return; } }
    if (t.closest('.am-back') && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); if (navFromHome) history.back(); else go(homeHref(), false); return; }
    const lg = t.closest('[data-legal]');
    if (lg && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); if (openK) closeAll(); if (!$('#unmodal').hidden) unClose(); go(legalHref(lg.dataset.legal), false); return; }
    if (t.closest('[data-cookieset]')) { e.stopPropagation(); if (openK !== 'cookies') setOpen('cookies'); return; }
    const ck = t.closest('[data-ck]');
    if (ck) { const k = ck.dataset.ck; setConsent(k === 'accept' ? true : k === 'reject' ? false : $('#ckan').classList.contains('on')); if (openK === 'cookies') closeAll(); toast('Cookie choice saved'); return; }
    const gob = t.closest('[data-go]');
    if (gob) { e.stopPropagation(); const k = gob.dataset.go; if (openK !== k) setOpen(k); if (gob.dataset.pane) showPane(gob.dataset.pane); return; }
    if (t.closest('[data-close]')) { closeAll(); return; }
    const ckb = t.closest('#ckan');
    if (ckb) { e.stopPropagation(); ckb.classList.toggle('on'); ckb.setAttribute('aria-checked', String(ckb.classList.contains('on'))); return; }
    const sw = t.closest('[data-sw]');
    if (sw) { e.stopPropagation(); setSwitch(sw.dataset.sw); return; }
    if (t.closest('#snd')) { setSwitch('sound'); return; }
    const sg = t.closest('.seg button');
    if (sg) { e.stopPropagation(); S.prefs.theme = sg.dataset.t; save(); applyTheme(); track('setting', { k: 'theme', v: sg.dataset.t }); return; }
    const soon = t.closest('[data-soon]');
    if (soon) { toast(soon.dataset.soon + ' is coming soon'); track('soon', { what: soon.dataset.soon }); return; }
    const a = t.closest('a[href]');
    const tile = t.closest('a[data-id]');
    if (tile && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      const src = tile.dataset.src || 'link', id = tile.dataset.id;
      const pos = [...tile.parentNode.children].indexOf(tile);
      if (src === 'side' && view === 'home') { e.preventDefault(); track('tile_click', { game: id, src, pos, select: true }); select(id, 'grid'); return; }
      track('tile_click', { game: id, src, pos });
      clickSrc = src;
    }
    if (a && PATH_MODE && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && a.target !== '_blank' && !a.hasAttribute('download')) {
      const u = a.getAttribute('href');
      if (u === '#' || a.hasAttribute('data-home')) { e.preventDefault(); resetState(); $('#q').value = ''; sel = null; go('/', false); return; }
      if (u.startsWith('/')) { e.preventDefault(); const gm = a.dataset.genre; if (gm) { resetState(); state.g.add(gm); go(homeHref(), false); toAll(false); } else go(u, false); return; }
    }
    if (a && !PATH_MODE && a.hasAttribute('data-home')) { e.preventDefault(); resetState(); $('#q').value = ''; sel = null; go('#/', false); return; }
    const fb = t.closest('[data-f]');
    if (fb) { e.stopPropagation(); toggleFilter(fb.dataset.f, fb.dataset.v); return; }
    const sb = t.closest('[data-sort]');
    if (sb) { e.stopPropagation(); const v = sb.dataset.sort; changeState(() => { state.sort = v === defSort() ? '' : v; }); track('sort', { v }); return; }
    const x = t.closest('[data-x]');
    if (x) { const [k, v] = x.dataset.x.split(':'); if (k === 's') changeState(() => { state.sort = ''; }); else toggleFilter(k, v); return; }
    if (a && !PATH_MODE && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && a.target !== '_blank') { const u = a.getAttribute('href'); if (u && u[0] === '#' && u !== location.hash) progNav = true; }
  });
  $('#slist').addEventListener('dblclick', e => { const r = e.target.closest('.srow'); if (r && view === 'home') { clickSrc = 'side'; go(href(r.dataset.id), false); } });
  $('#play').addEventListener('click', () => { if (sel && byId.get(sel)) { clickSrc = 'side_play'; go(href(sel), false); } });
  $('#clear').addEventListener('click', e => { e.stopPropagation(); changeState(() => { FKEYS.forEach(k => state[k].clear()); state.sort = ''; }); track('filter_clear', {}); });
  $('#apply').addEventListener('click', e => { e.stopPropagation(); closeAll(); });
  $('#reset').addEventListener('click', () => { changeState(() => { resetState(); $('#q').value = ''; }); });
  $('#snav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) showPane(b.dataset.p); });
  showPane('account');
  document.querySelectorAll('.sech').forEach(b => b.addEventListener('click', () => { const g = $('#' + b.dataset.sec), c = g.classList.toggle('collapsed'); b.setAttribute('aria-expanded', String(!c)); }));
  document.querySelectorAll('[data-sel]').forEach(s => s.addEventListener('change', () => { S.prefs[s.dataset.sel] = s.value; save(); track('setting', { k: s.dataset.sel, v: s.value }); rtTrack(); }));
  $('#dnsave').addEventListener('click', () => { const v = $('#dn').value.trim().replace(/\s+/g, ' '); if (!v) { say('dnnote', 'Enter a display name.'); return; } if (SB.user) { auDisplayName(v.slice(0, 24)); return; } setProfile({ displayName: v.slice(0, 24) }); say('dnnote', 'Display name saved.', 1); });
  $('#dn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#dnsave').click(); } });
  $('#unedit').addEventListener('click', () => { unStep = 1; $('#un1').hidden = false; $('#un2').hidden = true; $('#unt').textContent = $('#un').value ? 'Change username' : 'Choose a username'; $('#uncont').textContent = 'Continue'; $('#unew').value = $('#un').value; say('unerr', ''); $('#unmodal').hidden = false; $('#unew').focus(); $('#unew').select(); });
  $('#uncont').addEventListener('click', () => {
    if (SB.user) { auUsername(); return; }
    if (unStep === 1) {
      const v = $('#unew').value.trim();
      if (!/^[A-Za-z0-9_.-]{3,20}$/.test(v)) { say('unerr', 'Use 3 to 20 letters, numbers, dots, dashes or underscores.'); return; }
      if (v === $('#un').value) { say('unerr', 'That is already your username.'); return; }
      if (!$('#un').value) { setProfile({ username: v }); fillProfile(); say('unnote', 'Username saved.', 1); unClose(); return; }
      unPending = v; $('#uno').textContent = $('#un').value; $('#unn').textContent = v;
      $('#un1').hidden = true; $('#un2').hidden = false; $('#unt').textContent = 'Are you sure?'; $('#uncont').textContent = 'Yes, change it'; unStep = 2;
    } else { setProfile({ username: unPending }); fillProfile(); say('unnote', 'Username changed.', 1); unClose(); }
  });
  $('#uncancel').addEventListener('click', unClose);
  $('#unew').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#uncont').click(); } });
  $('#unmodal').addEventListener('click', e => { e.stopPropagation(); if (e.target === e.currentTarget || e.target.closest('[data-unclose]')) unClose(); });
  $('#dosignout').addEventListener('click', () => { closeAll(); if (SB.user) { auSignOut(); return; } toast('Accounts are coming soon.'); track('soon', { what: 'sign_out' }); });
  $('#delc').addEventListener('input', e => { $('#delbtn').disabled = e.target.value !== 'DELETE'; });
  $('#delbtn').addEventListener('click', () => { say('delnote', 'Your data was deleted. Reloading…', 1); deleteData(); });
  $('#dl').addEventListener('click', async () => { let extra = null; if (SB.user) { say('datanote', 'Preparing your file…'); try { extra = await sbRest('rpc/export_my_data', { method: 'POST', body: {} }); } catch (e) { extra = { error: 'Could not download your account data. Try again later.' }; } } downloadData(extra); say('datanote', 'Your data file was downloaded.', 1); track('data_download', {}); });
  $('#rr').addEventListener('click', () => { const b = $('#rr'); if (b.dataset.c) { b.textContent = 'Reset'; delete b.dataset.c; b.classList.remove('dangerfill'); if (SB.user) { say('datanote', 'Resetting…'); auResetCloud().then(() => { resetRecords(); say('datanote', 'Your records were reset on this device and in your account.', 1); }, () => say('datanote', 'Could not reset your account records. Check your connection and try again.')); } else { resetRecords(); say('datanote', 'Your records were reset.', 1); } track('records_reset', {}); } else { b.dataset.c = '1'; b.textContent = 'Click again to confirm'; b.classList.add('dangerfill'); } });
  document.querySelectorAll('[data-sound]').forEach(b => b.addEventListener('click', () => { setMuted(!S.muted); b.blur(); if (!S.muted) sfx('tap'); }));
  const th = $('[data-theater]');
  th.addEventListener('click', () => { th.blur(); S.theater = S.theater === false; save(); syncTheater(); track('setting', { k: 'theater', v: S.theater }); });
  if (wideQuery.addEventListener) { wideQuery.addEventListener('change', syncTheater); shortQuery.addEventListener('change', () => { syncTheater(); if (shortQuery.matches && view === 'game') toStage(); }); }
  document.querySelectorAll('[data-fs]').forEach(b => b.addEventListener('click', () => { b.blur(); if (gamebox.classList.contains('fs')) fsExit(); else fsEnter(); }));
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => { if (!fsEl() && gamebox.classList.contains('pfs')) return; fsSync(); }));
  let fsUiT = 0;
  gamebox.addEventListener('pointermove', e => { if (!gamebox.classList.contains('fs') || e.pointerType === 'touch') return; if (!gamebox.classList.contains('fs-ui')) gamebox.classList.add('fs-ui'); clearTimeout(fsUiT); fsUiT = setTimeout(() => gamebox.classList.remove('fs-ui'), 2200); }, { passive: true });
  addEventListener('resize', queueFit);
  if (window.ResizeObserver) new ResizeObserver(() => { if (stageMode() !== 'off') queueFit(); }).observe(frame);
  startFitTimer();
  $('#pRestart').addEventListener('click', e => { e.currentTarget.blur(); restartCurrent(); track('restart', { game: cur ? cur.g.id : null }); });
  addEventListener('storage', e => { if (e.key === PKEY) renderProfileBits(); });
  addEventListener('keyup', e => { if (PAUSE.on && !isField(e.target) && !openK) e.stopImmediatePropagation(); }, true);
  const unmodal = $('#unmodal');
  addEventListener('keydown', e => {
    if (!unmodal.hidden) { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); unClose(); } return; }
    if (openK) { if (e.key === 'Escape' && !e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); closeAll(); } return; }
    if (e.key === 'Escape' && gamebox.classList.contains('pfs')) { e.preventDefault(); e.stopImmediatePropagation(); fsExit(); return; }
    if (e.key === '/' && !isField(e.target) && !cur && !pend && view === 'home') { e.preventDefault(); q.focus(); return; }
    if (!cur && !pend) return;
    if (PAUSE.on) {
      if (isField(e.target)) return;
      if (e.target.closest && e.target.closest('.g-pause') && (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab')) return;
      e.stopImmediatePropagation();
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) setPause(false); }
      return;
    }
    if (e.key === 'Escape' && !e.repeat && !isField(e.target) && canPause()) { e.preventDefault(); e.stopImmediatePropagation(); setPause(true); track('pause', { game: cur.g.id }); return; }
    if (ov && (e.key === 'Enter' || e.key === ' ') && !isField(e.target) && !(e.target.closest && e.target.closest('.top, .side, .play-bar, .ckbar'))) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!e.repeat && performance.now() - ov.at > 600) ov.fire();
      return;
    }
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isField(e.target)) e.preventDefault();
  }, true);
  if (PATH_MODE) addEventListener('popstate', () => { fromPop = true; route(); });
  else addEventListener('hashchange', () => { fromPop = !progNav; progNav = false; route(); });
  if (PATH_MODE && !location.pathname.replace(/\//g, '') && /^#\/[\w-]/.test(location.hash)) history.replaceState(null, '', '/' + location.hash.slice(2));
  route();
  lzIdle();
  auBoot();
  adBoot();
  soBoot();
  inBoot();
  if (S.recent.some(id => byId.get(id) && byId.get(id).is3d)) { const warmUp = () => loadThree().catch(() => {}); if (window.requestIdleCallback) requestIdleCallback(warmUp, { timeout: 4000 }); else setTimeout(warmUp, 1500); }
}

