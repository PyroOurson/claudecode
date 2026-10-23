const FV_KEY = 'gameplay:favs', FV_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const FV = { ids: [], uid: null, at: 0, q: Promise.resolve() };
const FV_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z"/></svg>';
const fvRead = k => { try { const a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? [...new Set(a.filter(x => typeof x === 'string' && FV_RE.test(x)))] : []; } catch (e) { return []; } };
const fvKey = () => FV.uid ? FV_KEY + ':' + FV.uid : FV_KEY;
const fvHas = id => FV.ids.includes(id);
const fvBtn = (id, cls) => `<button class="fav${cls ? ' ' + cls : ''}" type="button" data-fav="${id}" aria-pressed="${fvHas(id)}" aria-label="${fvHas(id) ? 'Remove from favourites' : 'Add to favourites'}">${FV_ICO}</button>`;
(() => { let uid = null; try { const s = JSON.parse(localStorage.getItem(SB_STORE) || 'null'); uid = s && s.user && s.user.id || null; } catch (e) {} if (SB.on && uid) FV.uid = uid; FV.ids = fvRead(fvKey()); })();
function fvStore() { try { localStorage.setItem(fvKey(), JSON.stringify(FV.ids)); } catch (e) {} }
function fvPaint() {
  document.querySelectorAll('[data-fav]').forEach(b => { const on = fvHas(b.dataset.fav); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', auT(on ? 'Remove from favourites' : 'Add to favourites')); b.title = auT(on ? 'Remove from favourites' : 'Add to favourites'); });
  if (view === 'home') { fvRail(); if (state.f.size) renderResults(); }
}
function fvRail() {
  const L = FV.ids.map(id => byId.get(id)).filter(Boolean).slice(0, 10), sec = $('#favs');
  sec.hidden = !L.length || !!(activeCount() || state.q.trim());
  $('#favrail').innerHTML = L.map((g, i) => card(g, 'fav', i)).join('');
  lzScan();
}
function fvToggle(id) {
  if (!byId.get(id)) return;
  const on = !fvHas(id), uid = FV.uid;
  FV.ids = on ? [id, ...FV.ids.filter(x => x !== id)] : FV.ids.filter(x => x !== id);
  fvStore(); fvPaint();
  toast(auT(on ? 'Added to favourites' : 'Removed from favourites'));
  track('favourite', { game: id, on });
  if (!uid || !SB.user || SB.user.id !== uid) return;
  FV.q = FV.q.then(async () => {
    try {
      if (on) await sbRest('favourites', { method: 'POST', body: [{ user_id: uid, game_id: id }], prefer: 'resolution=ignore-duplicates,return=minimal' });
      else await sbRest('favourites?user_id=eq.' + uid + '&game_id=eq.' + encodeURIComponent(id), { method: 'DELETE', prefer: 'return=minimal' });
    } catch (e) {
      if (FV.uid !== uid) return;
      FV.ids = on ? FV.ids.filter(x => x !== id) : [id, ...FV.ids.filter(x => x !== id)];
      fvStore(); fvPaint();
      toast(auT('Could not save your favourite. Check your connection and try again.'));
    }
  });
}
async function fvSync() {
  const uid = SB.user && SB.user.id;
  if (!uid) return;
  const guest = FV_KEY === fvKey() ? FV.ids.slice() : fvRead(FV_KEY);
  if (FV.uid !== uid) { FV.uid = uid; FV.ids = fvRead(fvKey()); }
  FV.ids = [...new Set(guest.concat(FV.ids))];
  fvStore(); fvPaint();
  FV.at = Date.now();
  try {
    if (guest.length) { await sbRest('favourites', { method: 'POST', body: guest.map(g => ({ user_id: uid, game_id: g })), prefer: 'resolution=ignore-duplicates,return=minimal' }); try { localStorage.removeItem(FV_KEY); } catch (e) {} }
    await FV.q;
    const r = await sbRest('favourites?select=game_id&order=created_at.desc&limit=300');
    if (!SB.user || SB.user.id !== uid || !Array.isArray(r)) return;
    FV.ids = r.map(x => x.game_id).filter(x => FV_RE.test(x));
    fvStore(); fvPaint();
  } catch (e) {}
}
function fvBar(g) { const b = $('#pFav'); b.dataset.fav = g.id; fvPaint(); }

const SF = { d: null, at: 0, ch: null, peek: false, shown: false, off: new Set(), gk: null, og: null };
const SF_KEY = 'gameplay:site', SF_HIDE = 'gameplay:sitehide';
try { const o = JSON.parse(localStorage.getItem(SF_KEY) || 'null'); if (o && typeof o === 'object') { SF.d = o; SF.off = new Set(Array.isArray(o.disabled_games) ? o.disabled_games : []); } } catch (e) {}
const sfOff = id => SF.off.has(id);
const sfBlocked = g => !!g && sfOff(g.id) && !adIsAdmin();
const SF_ICO = {
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  warning: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20zM12 10v4M12 17h.01"/></svg>',
  tool: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 0-5-5L13 5zM3 21l6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>'
};
async function sfLoad(force) {
  if (!SB.on || (!force && Date.now() - SF.at < 15000)) return;
  SF.at = Date.now();
  try {
    const d = await sbRest('rpc/get_site_flags', { method: 'POST', body: {} });
    if (!d || typeof d !== 'object' || Array.isArray(d)) return;
    SF.d = d;
    try { localStorage.setItem(SF_KEY, JSON.stringify(d)); } catch (e) {}
    sfPaint();
  } catch (e) {}
}
function sfRt() {
  if (SF.ch || !SB.c) return;
  try { SF.ch = SB.c.channel('site').on('broadcast', { event: 'n' }, () => sfLoad(true)).subscribe(); } catch (e) {}
}
function sfNudge() {
  sfRt();
  try { if (SF.ch) SF.ch.send({ type: 'broadcast', event: 'n', payload: { t: Date.now() } }).catch(() => {}); } catch (e) {}
}
const BLK = { el: {}, mo: null, t: 0, q: false };
const gpBlocked = () => !!(SF.shown || AD.locked || !consent);
function sfLock() {
  const on = gpBlocked();
  document.documentElement.classList.toggle('gp-block', on);
  document.documentElement.classList.toggle('ck-block', !consent);
  ['top', 'side', 'main'].forEach(id => { const n = document.getElementById(id); if (n && n.inert !== on) n.inert = on; });
  const keep = new Set(['sfmaint', 'adblock', 'ckbar', 'lgsheet', 'toast', 'sfbar', 'sfalert', 'upbar', 'clp']);
  for (const c of document.body.children) {
    if (/^(SCRIPT|STYLE|LINK|NOSCRIPT)$/.test(c.tagName) || keep.has(c.id) || c.contains(document.getElementById('main'))) continue;
    if (on && !c.inert) { c.inert = true; c.dataset.gpi = '1'; } else if (!on && c.dataset.gpi) { c.inert = false; delete c.dataset.gpi; }
  }
  [['sfmaint', SF.shown], ['adblock', !!AD.locked], ['ckbar', !consent]].forEach(([id, want]) => {
    const el = BLK.el[id] || (BLK.el[id] = document.getElementById(id));
    if (!want || !el) return;
    if (!el.isConnected) document.body.append(el);
    if (el.hidden) el.hidden = false;
    if (el.inert) el.inert = false;
    if (el.getAttribute('style')) el.removeAttribute('style');
  });
  if (on && (cur || pend)) go(homeHref(), true);
  if (on && !BLK.mo && window.MutationObserver) {
    BLK.mo = new MutationObserver(() => { if (BLK.q) return; BLK.q = true; queueMicrotask(() => { BLK.q = false; sfLock(); }); });
    BLK.mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['inert', 'hidden', 'style', 'class'] });
    BLK.t = setInterval(sfLock, 1000);
  } else if (!on && BLK.mo) { BLK.mo.disconnect(); BLK.mo = null; clearInterval(BLK.t); }
}
function sfOffFrame(g) {
  SF.og = g;
  frame.textContent = '';
  const el = document.createElement('div');
  el.className = 'g-overlay sf-off';
  el.innerHTML = `<div class="g-ov-card"><span class="sf-offi">${SF_ICO.tool}</span><h3 class="g-ov-title">${esc(auT('Temporarily unavailable'))}</h3><p class="g-ov-text"${SF.d && SF.d.disabled_msg ? ' translate="no"' : ''}>${esc(SF.d && SF.d.disabled_msg || auT('This game is being fixed. Try again a bit later.'))}</p><div class="g-ov-btns"><button class="g-btn" type="button" data-sfback>${esc(auT('All games'))}</button></div></div>`;
  el.addEventListener('click', e => { if (e.target.closest('[data-sfback]')) { const a = document.querySelector('.am-back'); if (a) a.click(); } });
  const box = document.createElement('div');
  box.style.cssText = 'position:relative;width:min(100%,' + (g.width || 880) + 'px);aspect-ratio:16/10;min-height:340px;max-height:calc(100dvh - var(--goff, 250px));margin:0 auto';
  box.append(el); frame.append(box); void el.offsetWidth; el.classList.add('show');
}
function sfPaint() {
  const bar = $('#sfbar');
  if (!bar) return;
  const d = SF.d || {}, adm = adIsAdmin(), now = Date.now();
  const until = Date.parse(d.banner_until || '') || 0, txt = d.banner && (!until || until > now) ? String(d.banner) : '';
  let hid = '';
  try { hid = localStorage.getItem(SF_HIDE) || ''; } catch (e) {}
  const lv = d.banner_level === 'warning' ? 'warning' : 'info', showB = !!txt && hid !== syHash(txt), showM = !!d.maintenance && adm;
  const top = showB && lv === 'info', mid = showB && lv === 'warning';
  bar.innerHTML = (showM ? `<div class="sfb sfb-adm">${SF_ICO.tool}<span>${esc(auT('Maintenance mode is on. Players see the maintenance page.'))}</span><button class="btn2" type="button" data-adgo="site">${esc(auT('Site switches'))}</button></div>` : '') + (top ? `<div class="sfb sfb-info" role="status">${SF_ICO.info}<span translate="no">${esc(txt)}</span><button class="x" type="button" data-sfhide aria-label="${esc(auT('Hide announcement'))}">${SF_ICO.x}</button></div>` : '');
  bar.hidden = !top && !showM;
  let al = $('#sfalert');
  if (mid) {
    if (!al) { document.body.insertAdjacentHTML('beforeend', '<div class="sfal" id="sfalert" role="alertdialog" aria-modal="true" aria-labelledby="sfalt"><div class="sfal-c"><span class="sfal-i"></span><h2 id="sfalt"></h2><p class="sfal-t" translate="no"></p><button class="btn2 pri sfal-ok" type="button" data-sfhide></button></div></div>'); al = $('#sfalert'); }
    al.querySelector('.sfal-i').innerHTML = SF_ICO.warning;
    al.querySelector('h2').textContent = auT('Alert');
    al.querySelector('.sfal-t').textContent = txt;
    al.querySelector('.sfal-ok').textContent = auT('OK');
    if (al.hidden !== false || !al.classList.contains('on')) { al.hidden = false; void al.offsetWidth; al.classList.add('on'); }
  } else if (al) { al.classList.remove('on'); al.hidden = true; }
  clearTimeout(SF.bt);
  if (showB && until) SF.bt = setTimeout(sfPaint, Math.min(until - now + 500, 3600000));
  const m = !!d.maintenance && !adm && !(SB.user && !AD.at && Date.now() - T0 < 10000) && !SF.peek, el = $('#sfmaint');
  if (d.maintenance && SB.user && !AD.at && !SF.mt) SF.mt = setTimeout(sfPaint, Math.max(0, 10500 - (Date.now() - T0)));
  if (m !== SF.shown) {
    SF.shown = m;
    if (m) {
      if (openK && openK !== 'mauth') closeAll();
      if (cur || pend || view !== 'home') go(homeHref(), true);
      el.hidden = false;
    } else el.hidden = true;
    sfLock();
  }
  if (m) {
    const mm = $('#sfmm');
    mm.textContent = d.maintenance_msg || auT('We are making the site better. Please come back in a little while.');
    if (d.maintenance_msg) mm.setAttribute('translate', 'no'); else mm.removeAttribute('translate');
    $('#sfmin').hidden = !!SB.user || !SB.on;
  }
  const off = new Set(Array.isArray(d.disabled_games) ? d.disabled_games.filter(x => typeof x === 'string') : []), k = [...off].sort().join(',') + '|' + adm;
  if (k !== SF.gk) {
    const first = SF.gk == null;
    SF.off = off; SF.gk = k;
    if (!first) {
      if (view === 'home') renderHome();
      else if (view === 'game') { const g = (cur && cur.g) || pend || SF.og; if (g) { $('#more').innerHTML = related(g).slice(0, 10).map(x => card(x, 'more')).join(''); lzScan(); } }
    }
  }
  if (cur && sfBlocked(cur.g)) { const g = cur.g; setPause(false); cur.kill(); cur = null; ttSync(); sfOffFrame(g); }
  else if (pend && sfBlocked(pend)) { const g = pend; pend = null; sfOffFrame(g); }
  else if (SF.og && view === 'game' && !cur && !pend && !sfBlocked(SF.og)) { const g = SF.og, loc = parseLocation(); SF.og = null; if (loc.game && loc.game.id === g.id) { if (g.mount) start(g); else waitStart(g); } }
}

const CL_KEY = 'gameplay:seen', CL_NEW = Date.now() - (+S.since || 0) < 15000;
const CL = { open: false, t: 0, done: false };
const clTop = () => CHANGELOG.reduce((m, c) => Math.max(m, c.v), 0);
const clSeen = () => { try { return +localStorage.getItem(CL_KEY) || 0; } catch (e) { return 0; } };
function clMark(remote) {
  const v = clTop();
  try { localStorage.setItem(CL_KEY, String(v)); } catch (e) {}
  if (remote && SB.user) sbRest('profiles?id=eq.' + SB.user.id, { method: 'PATCH', body: { seen_version: v }, prefer: 'return=minimal' }).catch(() => {});
}
function clDay(s) { try { return new Date(String(s).slice(0, 10) + 'T12:00:00').toLocaleDateString(adLang(), { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return String(s).slice(0, 10); } }
function clOpen() {
  clearTimeout(CL.t); CL.done = true;
  const L = CHANGELOG.slice().sort((a, b) => b.v - a.v);
  $('#clpb').innerHTML = L.map((c, i) => `<section class="clp-s" style="--i:${i}"><h4>${esc(clDay(c.date))}${i === 0 ? `<em>${esc(auT('New'))}</em>` : ''}</h4><ul>${c.items.map((t, j) => `<li style="--j:${j}">${esc(auT(t))}</li>`).join('')}</ul></section>`).join('');
  const el = $('#clp');
  vis(el, true); CL.open = true;
  el.querySelector('.clp-card').scrollTop = 0;
  if (!auCoarse()) setTimeout(() => { const b = el.querySelector('.clp-f .btn2'); if (b && CL.open) b.focus({ preventScroll: true }); }, 60);
}
function clClose() {
  if (!CL.open) return;
  CL.open = false;
  vis($('#clp'), false);
  clMark(true);
}
function clAuto(seenRemote) {
  if (CL.done || CL.open) return;
  const top = clTop();
  if (clSeen() >= top) { CL.done = true; if (seenRemote !== undefined && (+seenRemote || 0) < top) clMark(true); return; }
  if (seenRemote != null && +seenRemote >= top) { CL.done = true; clMark(false); return; }
  if (CL_NEW && !clSeen()) { CL.done = true; clMark(false); return; }
  clOpen();
}

const UP = { base: null, at: 0, busy: false, shown: false };
const upUrl = () => PATH_MODE ? location.origin + '/' : location.origin + location.pathname;
async function upSig() {
  let r = await fetch(upUrl(), { method: 'HEAD', cache: 'no-store', credentials: 'omit' });
  const h = r.ok ? (r.headers.get('etag') || r.headers.get('last-modified')) : null;
  if (h) return 'h:' + h;
  r = await fetch(upUrl(), { cache: 'no-store', credentials: 'omit' });
  return r.ok ? 't:' + syHash(await r.text()) : null;
}
async function upCheck(force) {
  if (UP.busy || UP.shown || !/^https?:$/.test(location.protocol) || (!force && Date.now() - UP.at < 60000)) return;
  UP.busy = true; UP.at = Date.now();
  try { const s = await upSig(); if (s) { if (UP.base == null) UP.base = s; else if (s !== UP.base) upShow(); } } catch (e) {}
  finally { UP.busy = false; }
}
function upShow() {
  UP.shown = true;
  const el = $('#upbar');
  vis(el, true);
  track('update_ready', {});
}

function siteBoot() {
  document.body.insertAdjacentHTML('afterbegin', '<div class="sfbar" id="sfbar" hidden></div>');
  document.body.insertAdjacentHTML('beforeend', `<div class="adblock sfm" id="sfmaint" hidden role="dialog" aria-modal="true" aria-labelledby="sfmt"><div class="adb-wrap"><div class="adb-brand"><span class="logo"><svg viewBox="0 0 16 16"><path d="M2 1.5v13l12-6.5z"/></svg></span><span>gameplay</span></div><div class="adb-card"><span class="adb-ico sfm-ico">${SF_ICO.tool}</span><h3 id="sfmt">${esc(auT('We will be right back'))}</h3><p class="adb-sub" id="sfmm"></p><p class="adb-sub sfm-s">${esc(auT('This page refreshes by itself when the site is back.'))}</p><button class="btn2" type="button" id="sfmin" hidden>${esc(auT('Admin? Log in'))}</button></div></div></div>
<div class="clp" id="clp" hidden role="dialog" aria-modal="true" aria-labelledby="clpt"><div class="clp-card"><div class="clp-h"><span class="clp-ico">${SF_ICO.spark}</span><div><h3 id="clpt">${esc(auT('What\'s new'))}</h3><p>${esc(auT('The latest changes to gameplay'))}</p></div><button class="x" type="button" data-clx aria-label="${esc(auT('Close'))}">${SF_ICO.x}</button></div><div class="clp-b" id="clpb"></div><div class="clp-f"><button class="btn2 pri" type="button" data-clx>${esc(auT('Got it'))}</button></div></div></div>
<div class="upbar" id="upbar" hidden role="status"><span>${SF_ICO.spark}</span><b>${esc(auT('A new version is ready.'))}</b><button class="btn2 pri" type="button" id="upgo">${esc(auT('Reload'))}</button><button class="x" type="button" id="upx" aria-label="${esc(auT('Later'))}">${SF_ICO.x}</button></div>`);
  document.addEventListener('click', e => {
    const t = e.target, f = t.closest && t.closest('[data-fav]');
    if (f) { e.preventDefault(); e.stopPropagation(); if (f.dataset.fav) fvToggle(f.dataset.fav); return; }
    if (t.closest && t.closest('[data-sfhide]')) { e.stopPropagation(); const txt = SF.d && SF.d.banner || ''; try { localStorage.setItem(SF_HIDE, syHash(String(txt))); } catch (x) {} sfPaint(); }
  }, true);
  $('#clp').addEventListener('click', e => { e.stopPropagation(); if (e.target === e.currentTarget || e.target.closest('[data-clx]')) clClose(); });
  $('#upgo').addEventListener('click', () => location.reload());
  $('#upx').addEventListener('click', e => { e.stopPropagation(); vis($('#upbar'), false); });
  $('#sfmin').addEventListener('click', e => { e.stopPropagation(); SF.peek = true; sfPaint(); auOpen('main', '', '', 'in'); });
  $('#clopen').addEventListener('click', e => { e.stopPropagation(); closeAll(); clOpen(); });
  addEventListener('keydown', e => { if (!CL.open) return; if (e.key === 'Escape') { e.preventDefault(); clClose(); } e.stopImmediatePropagation(); }, true);
  const wake = () => { if (document.visibilityState === 'hidden') return; sfLoad(); upCheck(); if (SB.user && Date.now() - FV.at > 60000) fvSync(); };
  document.addEventListener('visibilitychange', wake);
  addEventListener('focus', wake);
  setInterval(() => { if (document.visibilityState !== 'hidden') { sfLoad(true); upCheck(true); } }, 300000);
  setInterval(() => { if (SF.shown) sfLoad(true); }, 20000);
  setTimeout(() => upCheck(true), 4000);
  sfPaint(); sfLock(); sfLoad(true);
  if (SB.on) sbClient().then(() => sfRt()).catch(() => {});
  setInterval(() => { if (!SF.shown && document.visibilityState !== 'hidden') sfLoad(true); }, 30000);
  if (SB.on && sbHasSession()) CL.t = setTimeout(() => clAuto(), 8000);
  else CL.t = setTimeout(() => clAuto(), 1200);
  Ameplay.debug.site = { check: () => upCheck(true), load: () => sfLoad(true), flags: () => SF.d, favs: () => FV.ids.slice(), route: () => ({ api: SB.on ? SBN.best() : 'none', live: SBN.ws(), routes: SBN.all(), accounts: SB.on }) };
}
async function siteSignedIn() {
  const uid = SB.user.id;
  SF.peek = false;
  sfRt(); sfLoad(); fvSync();
  if (CL.done || CL.open) return;
  let sv = null;
  try { const r = await sbRest('profiles?select=seen_version&id=eq.' + uid); sv = r && r[0] ? r[0].seen_version : null; } catch (e) {}
  if (!SB.user || SB.user.id !== uid) return;
  clAuto(sv);
}
function siteSignedOut() { FV.uid = null; FV.ids = fvRead(FV_KEY); fvPaint(); sfPaint(); }
