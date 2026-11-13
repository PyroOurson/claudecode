const AD = { role: null, locked: false, reason: null, until: null, ut: 0, uti: 0, at: 0, game: null, gat: 0, users: null, q: '', f: 'all', sort: ['created_at', -1], sel: null, tab: 'users', wait: 0, busy: false, lt: 0, ok: 0, bad: false, fresh: new Set() };
const SG = { d: null, kh: null, err: null, busy: false, cf: false, msg: null, seq: 0 };
const adHref = () => (PATH_MODE ? '/' : '#/') + 'admin';
const adIsAdmin = () => (AD.role === 'admin' || AD.role === 'owner') && !AD.locked;
const adIsOwner = () => AD.role === 'owner' && !AD.locked;
const adStaff = u => u.role === 'admin' || u.role === 'owner';
const adRank = r => r === 'owner' ? 2 : r === 'admin' ? 1 : 0;
const adCan = u => adIsAdmin() && (adIsOwner() || adRank(AD.role) > adRank(u.role));
const adRpc = (f, b) => sbRest('rpc/' + f, { method: 'POST', body: b || {} });
const adLang = () => window.gpI18n ? gpI18n.lang : 'en';
const AD_ICO = {
  lock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>'
};
const AD_SI = {
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/></svg>',
  cake: '<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="10" rx="2"/><path d="M3 15c3 0 3-2 6-2s3 2 6 2 3-2 6-2M12 10V6M12 3v.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  rocket: '<svg viewBox="0 0 24 24"><path d="M5 15c-1.5 1.3-2 4-2 6 2 0 4.7-.5 6-2M9 15l-3-3 7-7c2-2 5-2 8-2 0 3 0 6-2 8l-7 7z"/><circle cx="15" cy="9" r="1.5"/></svg>',
  bug: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="13" rx="5"/><path d="M12 11v9M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2M9 7a3 3 0 0 1 6 0"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a4 4 0 0 0 4 4M16 6h4a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4M9 2h6"/></svg>'
};
function adAgo(t) {
  const d = Date.parse(t);
  if (!d) return auT('Never');
  const s = (d - Date.now()) / 1000, a = Math.abs(s);
  const [n, u] = a < 60 ? [s, 'second'] : a < 3600 ? [s / 60, 'minute'] : a < 86400 ? [s / 3600, 'hour'] : a < 2592000 ? [s / 86400, 'day'] : a < 31536000 ? [s / 2592000, 'month'] : [s / 31536000, 'year'];
  try { if (adRtf.l !== adLang() || !adRtf.f) { adRtf.f = new Intl.RelativeTimeFormat(adLang(), { numeric: 'auto' }); adRtf.l = adLang(); } return adRtf.f.format(Math.round(n), u); } catch (e) { return new Date(d).toLocaleString(); }
}
function adDate(t, full) {
  const d = Date.parse(t);
  if (!d) return auT('Never');
  try { return new Date(d).toLocaleString(adLang(), full ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }); } catch (e) { return new Date(d).toLocaleString(); }
}
function adLangName(c) {
  if (!c) return '—';
  try { const n = new Intl.DisplayNames([adLang()], { type: 'language' }).of(c); return n ? n.charAt(0).toUpperCase() + n.slice(1) : c; } catch (e) { return c; }
}
const adGame = id => id ? (byId.get(id) ? byId.get(id).title : id) : '—';
const adCv = (id, c) => { const g = byId.get(id); if (!g || !thumbsOn()) return `<span class="${c} adcv0" style="--c:${esc(TINT[id] || 'var(--accent)')}">${esc(adGame(id).charAt(0))}</span>`; const u = coverUrl(g); if (u === BLANK) lzCover(id); return `<img class="${c}" src="${u}"${u === BLANK ? ` data-cv="${esc(id)}"` : ''} alt="" decoding="async" draggable="false">`; };
const adProv = u => (u.providers && u.providers.length ? u.providers : ['email']).map(p => p === 'google' ? 'Google' : p === 'email' ? auT('Email') : p).join(' + ');
const adPill = (t, k) => `<span class="adm-pill${k ? ' ' + k : ''}">${esc(auT(t))}</span>`;
const adRole = u => u.role === 'owner' ? adPill('Owner', 'acc') : u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User');
const adErr = e => { const m = String(e && e.message || ''); return /admins only/i.test(m) ? 'Admins only' : /below your rank|change an owner/i.test(m) ? 'You can only manage accounts below your rank.' : /at least one owner/i.test(m) ? 'There must be at least one owner' : /owners only|owner can do/i.test(m) ? 'Only an owner can do this.' : /at least one admin/i.test(m) ? 'There must be at least one admin' : /own account/i.test(m) ? 'You cannot lock your own account' : /at least 8/i.test(m) ? 'Use at least 8 characters.' : /at most 72/i.test(m) ? 'Use at most 72 characters.' : /no site password/i.test(m) ? 'Set a site password below first.' : /bad site key/i.test(m) ? 'This copy of the site has no valid key. Reload the page and try again.' : /not found/i.test(m) ? 'Not found. Refresh and try again.' : /rate_limited/i.test(m) || (e && e.status === 429) ? 'Slow down a little and try again in a minute.' : /too many/i.test(m) ? 'Too many messages. Wait a minute and try again.' : /account locked/i.test(m) ? 'Your account is locked.' : /end time/i.test(m) ? 'Pick an end time in the future.' : /write a subject/i.test(m) ? 'Write a subject.' : /write a message/i.test(m) ? 'Write a message.' : 'Could not update. Check your connection and try again.'; };
const adKey = n => n.nodeType === 1 ? n.getAttribute('data-k') || n.getAttribute('data-uid') || n.id || null : null;
function adAttrs(a, b) {
  const keep = a.tagName === 'DETAILS' ? 'open' : /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) ? 'value' : '';
  for (const x of [...a.attributes]) if (x.name !== keep && !b.hasAttribute(x.name)) a.removeAttribute(x.name);
  for (const x of [...b.attributes]) if (x.name !== keep && a.getAttribute(x.name) !== x.value) a.setAttribute(x.name, x.value);
}
function adKids(a, b) {
  const map = new Map();
  for (const n of a.childNodes) { const k = adKey(n); if (k) map.set(k, n); }
  let cur = a.firstChild;
  for (const n of [...b.childNodes]) {
    const k = adKey(n);
    let o = k ? map.get(k) : cur && !adKey(cur) ? cur : null;
    if (o && (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName)) o = null;
    if (!o) { a.insertBefore(n, cur); continue; }
    if (k) map.delete(k);
    if (o === cur) cur = cur.nextSibling; else a.insertBefore(o, cur);
    if (o.nodeType === 1) { adAttrs(o, n); adKids(o, n); }
    else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  }
  while (cur) { const x = cur.nextSibling; cur.remove(); cur = x; }
}
function adMorph(el, html) {
  if (!el) return;
  const t = document.createElement('template');
  t.innerHTML = html;
  adKids(el, t.content);
}
const adClock = t => { try { return new Date(t).toLocaleTimeString(adLang(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); } catch (e) { return new Date(t).toTimeString().slice(0, 8); } };
function adStamp(ok) {
  if (ok) AD.ok = Date.now();
  AD.bad = !ok;
  lvBar();
}
const LV = { t: 0, busy: false, fail: 0, d: null, at: 0, ms: 0, db: {}, key: '', marks: null, miss: false, hk: 0, staff: (() => { try { return localStorage.getItem('gameplay:adstaff') === '1'; } catch (e) { return false; } })() };
const lvOk = () => !!LV.at && Date.now() - LV.at < 5000;
const lvWant = () => view === 'admin' && adIsAdmin() && !AD.locked && document.visibilityState !== 'hidden';
const adOn = id => lvOk() ? LV.db[id] || null : RT.pres[id] || null;
const adOnIds = () => Object.keys(lvOk() ? LV.db : RT.pres);
const adDay0 = () => new Date().setHours(0, 0, 0, 0);
const adData = (what, days, arg) => adRpc('admin_data', { p_what: what, p_days: days || ST.days, p_staff: LV.staff, p_arg: arg == null ? null : String(arg) });
const adText = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
const adRtf = { l: '', f: null };
function adAgoS(t) {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  return s < 2 ? auT('just now') : s < 90 ? auT('{n} s ago').replace('{n}', s) : s < 5400 ? auT('{n} min ago').replace('{n}', Math.round(s / 60)) : auT('{n} h ago').replace('{n}', Math.round(s / 3600));
}
function adAgoPaint(el) {
  const t = +el.dataset.ago;
  adText(el, t ? auT('Updated {t}').replace('{t}', adAgoS(t)) : '');
}
function lvReset() {
  clearTimeout(LV.t); LV.t = 0; LV.busy = false; LV.fail = 0; LV.d = null; LV.at = 0; LV.db = {}; LV.key = ''; LV.marks = null;
}
function lvKick() {
  if (!lvWant() || LV.miss) { lvBar(); return; }
  if (LV.t || LV.busy) return;
  lvPoll();
}
async function lvPoll() {
  clearTimeout(LV.t); LV.t = 0;
  if (!lvWant() || LV.busy) { lvBar(); return; }
  LV.busy = true;
  const t0 = performance.now(), uid = SB.user && SB.user.id;
  let ok = false;
  try {
    const d = await adRpc('admin_live', { p_uid: AD.sel || null, p_staff: LV.staff });
    if (d && typeof d === 'object' && SB.user && SB.user.id === uid) { LV.ms = Math.round(performance.now() - t0); lvApply(d); ok = true; }
  } catch (e) {
    if (sbMissing(e)) LV.miss = true;
    else if (/admins only/i.test(e.message || '')) { LV.busy = false; adStatus({ role: 'user', locked: false }); return; }
  }
  LV.busy = false;
  LV.fail = ok ? 0 : LV.fail + 1;
  if (!ok) lvDraw();
  if (lvWant() && !LV.miss) LV.t = setTimeout(lvPoll, ok ? Math.max(150, 1000 - (performance.now() - t0)) : Math.min(30000, 1000 * Math.pow(2, Math.min(LV.fail, 5))));
  lvBar();
}
function lvApply(d) {
  const me = SB.user ? SB.user.id : '', m = {}, db = {};
  (Array.isArray(d.on) ? d.on : []).forEach(x => {
    if (!x || typeof x.id !== 'string') return;
    const o = { g: typeof x.g === 'string' ? x.g : null, a: x.a ? 1 : 0, p: x.p ? 1 : 0, h: x.h ? 1 : 0, s: +x.s || 0, l: +x.l || 0, t: Date.now() };
    db[x.id] = o;
    if (x.id !== me) m[x.id] = x.h ? { h: 1 } : o;
  });
  const key = Object.keys(db).sort().map(k => k + ':' + (db[k].g || '') + db[k].a + db[k].p + db[k].h).join('|'), first = !LV.at;
  if (LV.at && AD.users) { const iso = new Date().toISOString(); for (const id in LV.db) if (!db[id]) { const u = AD.users.find(x => x.id === id), el = document.querySelector(`#adt tr[data-uid="${CSS.escape(id)}"] .ls-off`); if (u) u.last_seen = iso; if (el) { el.dataset.rtt = iso; el.title = adDate(iso, 1); } } }
  LV.d = d; LV.at = Date.now(); LV.db = db;
  PB.db = m; PB.at = Date.now(); if (d.n) PB.n = Math.max(0, +d.n.shown || 0);
  if (key !== LV.key) { LV.key = key; rtSync(); }
  const M = d.marks || {}, was = LV.marks;
  LV.marks = M;
  if (was) {
    if (M.users !== was.users) { AD.lt = Date.now(); adLoad(true); }
    if (M.tickets !== was.tickets) tkLoad(tkBox($('#tka'), 'admin'));
    if (M.log !== was.log && AD.tab === 'log') alLoad(false, true);
  }
  if (d.hk && Date.now() - LV.hk > 600000) { LV.hk = Date.now(); adRpc('admin_housekeep', {}).catch(() => {}); }
  lvDraw(first);
}
function lvDraw() {
  lvBar();
  if (view !== 'admin' || !AD.users) return;
  if (LV.rk !== LV.key || LV.ru !== AD.users) { LV.rk = LV.key; LV.ru = AD.users; document.querySelectorAll('#adt tbody tr[data-uid]').forEach(tr => tr.classList.toggle('on', !!adOn(tr.dataset.uid))); adTiles(); if (AD.tab === 'users' && (AD.f === 'online' || AD.f === 'today' || AD.sort[0] === 'last_seen')) adDraw(); }
  const u = adCur();
  if (u && !$('#adpanel').hidden) { adMorph($('#adplive'), adLiveTxt(u)); const b = $('#adpq div:last-child b'); if (b) adText(b, adOn(u.id) ? auT('Online now') : adAgo(u.last_seen)); }
  if (AD.tab === 'stats') { if (INS.sub === 'ov') stLive(); else if (INS.sub === 'par') adMorph($('#mxpl'), mxPartyLive()); else if (INS.sub === 'hl') adMorph($('#mxhl'), mxHealthLive()); else if (INS.sub === 'act') adText($('#mxln'), stN(adOnIds().length)); }
}
function lvBar() {
  let el = $('#adupd');
  if (!el) { const r = $('#adref'); if (!r) return; r.insertAdjacentHTML('beforebegin', '<span class="adm-upd" id="adupd" role="status" translate="no"><i></i><span></span></span>'); el = $('#adupd'); }
  const live = lvOk(), st = LV.miss ? 'old' : live ? 'live' : document.visibilityState === 'hidden' ? 'idle' : LV.fail > 1 ? 'bad' : LV.at ? 'slow' : 'wait';
  if (el.dataset.s !== st) { el.dataset.s = st; el.classList.toggle('bad', st === 'bad'); el.classList.toggle('live', st === 'live'); }
  const n = LV.d && LV.d.n ? +LV.d.n.all || 0 : 0;
  const txt = st === 'live' ? auT(n === 1 ? 'Live · 1 online' : 'Live · {n} online').replace('{n}', stN(n)) : st === 'wait' ? auT('Connecting…') : st === 'slow' ? auT('Updated {t}').replace('{t}', adAgoS(LV.at)) : st === 'old' ? (AD.ok ? auT('Updated {t}').replace('{t}', adAgoS(AD.ok)) : '') : st === 'idle' ? auT('Paused') : LV.at ? auT('Offline · updated {t}').replace('{t}', adAgoS(LV.at)) : auT('Offline');
  const pk = LV.pk && LV.pk.peak;
  adText(el.lastChild, pk && pk.n ? txt + ' · ' + auT('All-time peak {n} on {d}').replace('{n}', stN(pk.n)).replace('{d}', adDate(pk.at, 1)) : txt);
  el.title = auT(st === 'live' ? 'Live numbers refresh every second while this tab is open.' : st === 'old' ? 'Run round19_analytics.sql in the Supabase SQL editor to get live updates every second.' : st === 'bad' ? 'Could not reach the server. Trying again.' : 'Live updates pause while the tab is in the background.');
}
function lvErrHtml() {
  const E = LV.d && Array.isArray(LV.d.errs) ? LV.d.errs : null;
  if (!E) return (ST.d && ST.d.errors || []).slice(0, 8).map(e => `<div class="st-err"><b>${esc(adGame(e.game_id))}</b><span>${esc(e.message || '')}</span><small>${esc(e.place || '')} · ${esc(e.device || '')} · ${esc(adAgo(e.created_at))}</small></div>`).join('') || `<p class="ins-why">${esc(auT('No errors in this period.'))}</p>`;
  return E.length ? E.map(e => `<button type="button" class="st-err" data-k="le:${+e.id}" data-mxerr="${esc(e.g || '')}"><b>${esc(e.g ? adGame(e.g) : auT('Site'))}</b><span>${esc(e.m || '')}</span><small>${esc([e.w, e.d].filter(Boolean).join(' · '))} · <i data-rt="${esc(e.at)}">${esc(adAgo(e.at))}</i></small></button>`).join('') : `<p class="ins-why">${esc(auT('No errors in the last hour.'))}</p>`;
}
function adTick() {
  if (view !== 'admin' || document.visibilityState === 'hidden') return;
  lvBar();
  if (!adIsAdmin()) return;
  if (!LV.pkBusy && Date.now() - (LV.pkAt || 0) > 950) { LV.pkBusy = true; LV.pkAt = Date.now(); adRpc('admin_online', { p_range: '1m' }).then(r => { LV.pk = r; }).catch(() => {}).finally(() => { LV.pkBusy = false; }); }
  document.querySelectorAll('#vAdmin [data-ago]').forEach(adAgoPaint);
  document.querySelectorAll('#vAdmin [data-rt]').forEach(el => adText(el, adAgo(el.dataset.rt)));
  const tb = $('#adt tbody'), rows = tb ? tb.rows : [];
  if (AD.tab === 'users' && rows.length && rows[0].dataset.uid) {
    const tw = tb.closest('.adm-tw'), h = rows[0].offsetHeight || 44, r = tw.getBoundingClientRect(), i0 = Math.max(0, Math.floor((tw.scrollTop + Math.max(0, -r.top)) / h) - 3), i1 = Math.min(rows.length, i0 + Math.ceil(Math.min(innerHeight, r.height || innerHeight) / h) + 8);
    for (let i = i0; i < i1; i++) rows[i].querySelectorAll('[data-rtt]').forEach(el => adText(el, adAgo(el.dataset.rtt)));
  }
  if (!LV.t && !LV.busy) lvKick();
  adSlow();
}
function adSlow() {
  if (!lvWant()) return;
  const now = Date.now(), typing = document.activeElement && /^(stgq|mxq|dgq)$/.test(document.activeElement.id);
  adLive(false);
  if (AD.tab !== 'stats' || typing) return;
  const k = INS.sub;
  if (k === 'ov') { if (now - ST.at > MX_EVERY.ov && !ST.busy) stLoad(true); }
  else if (k === 'ins') { if (now - INS.at > MX_EVERY.ins && !INS.busy) insLoad(true); }
  else if (MX_T[k] && now - (MX.at[k] || 0) > MX_EVERY[k] && !MX.busy[k] && now - (MX.try[k] || 0) > 8000) mxLoad(k, true);
}
function adStaffSet(on) {
  LV.staff = !!on;
  try { localStorage.setItem('gameplay:adstaff', on ? '1' : '0'); } catch (e) {}
  const b = $('#ststaff'); if (b) { b.classList.toggle('on', LV.staff); b.setAttribute('aria-checked', String(LV.staff)); }
  ST.at = 0; INS.at = 0; MX.at = {}; ST.anim = 1;
  stOpen(true);
  if (LV.t) { clearTimeout(LV.t); LV.t = 0; lvPoll(); }
}

function adStatus(s) {
  const was = adIsAdmin(), wl = AD.locked;
  AD.role = s ? s.role : null; AD.locked = !!(s && s.locked); AD.reason = s && s.locked_reason || null; AD.until = AD.locked && s.locked_until || null; AD.at = Date.now();
  document.querySelectorAll('[data-admin]').forEach(el => { el.hidden = !adIsAdmin(); });
  document.querySelectorAll('[data-owner]').forEach(el => { el.hidden = !adIsOwner(); });
  clearTimeout(AD.ut);
  if (AD.locked && AD.until) { const d = Date.parse(AD.until) - Date.now(); AD.ut = setTimeout(adCheck, d > 0 ? Math.min(d + 1500, 3600000) : 30000); }
  if (AD.locked !== wl || AD.locked) adBlock(AD.locked);
  sfPaint();
  if (view === 'admin') { if (adIsAdmin()) { if (!was || !AD.users) adEnter(); } else adBounce(); }
}
async function adCheck(game) {
  if (!SB.user) return;
  const uid = SB.user.id;
  try {
    const r = await adRpc('touch_presence', { p_lang: adLang(), p_game: game || (cur ? cur.g.id : null) });
    if (!SB.user || SB.user.id !== uid) return;
    if (AD.del && Array.isArray(r) && !r.length) { AD.del = false; toast(auT('This account was deleted')); auSignOut(); return; }
    AD.del = false;
    adStatus(Array.isArray(r) ? r[0] : null);
  } catch (e) {
    if (/session ended/i.test(e.message || '') && SB.user && SB.user.id === uid) { toast(auT('You were signed out')); auSignOut(); return; }
    if (view === 'admin' && !AD.at) adBounce();
  }
}
function adSeen(id) {
  if (!SB.user || (AD.game === id && Date.now() - AD.gat < 60000)) return;
  AD.game = id; AD.gat = Date.now();
  adCheck(id);
}
function adSignedOut() {
  AD.role = null; AD.at = 0; AD.users = null; AD.sel = null; AD.until = null; AD.ok = 0; clearTimeout(AD.ut);
  lvReset();
  SG.d = null; SG.err = null; SG.msg = null; SG.cf = false;
  document.querySelectorAll('[data-admin], [data-owner]').forEach(el => { el.hidden = true; });
  if (AD.locked) { AD.locked = false; adBlock(false); }
  document.querySelectorAll('.tk').forEach(b => { if (b._tk) { b._tk.list = null; b._tk.cur = null; } });
  if (view === 'admin') adBounce();
}

function adBlock(on) {
  const el = $('#adblock');
  document.documentElement.classList.toggle('ad-locked', on);
  sfLock();
  clearInterval(AD.uti);
  if (on) {
    adUntil(); AD.uti = setInterval(adUntil, 30000);
    if (openK) closeAll();
    if (!$('#unmodal').hidden) unClose();
    if (view !== 'home' || cur || pend) go(homeHref(), true);
    $('#adbrt').textContent = AD.reason || '';
    $('#adbr').hidden = !AD.reason;
    el.hidden = false;
    const b = tkBox($('#tkb'), 'user'); if (!b._tk.list) tkLoad(b);
  } else el.hidden = true;
}

function adUntil() {
  const t = $('#adbut');
  if (!t) return;
  t.textContent = AD.until ? auT('{d} ({r})').replace('{d}', adDate(AD.until, 1)).replace('{r}', adAgo(AD.until)) : auT('Permanent');
  $('#adbu').classList.toggle('perm', !AD.until);
}
const adLeft = u => u.locked_until ? auT('ends {t}').replace('{t}', adAgo(u.locked_until)) : auT('Permanent');
function adBounce() {
  if (view !== 'admin') return;
  clearTimeout(AD.wait);
  toast('Admins only');
  go(homeHref(), true);
}
function adRoute() {
  closeGame();
  showView('admin');
  setHead(auT('Admin dashboard') + ' | gameplay', 'gameplay admin dashboard.', '/admin');
  scrollTo({ top: 0, behavior: 'instant' });
  if (!SB.on) return adBounce();
  if (!SB.user) {
    if (!sbHasSession()) return adBounce();
    clearTimeout(AD.wait); AD.wait = setTimeout(() => { if (view === 'admin' && !adIsAdmin()) adBounce(); }, 9000);
    return;
  }
  if (adIsAdmin() && Date.now() - AD.at < 60000) adEnter(); else adCheck();
}
async function adEnter() {
  clearTimeout(AD.wait);
  ST.anim = 2; AD.anim = true; AD.lt = Date.now();
  adTab(AD.tab);
  lvKick();
  await adLoad();
  tkLoad(tkBox($('#tka'), 'admin'));
}
async function adLoad(quiet) {
  if (!adIsAdmin() || AD.busy) return;
  AD.busy = true;
  if (!quiet) $('#adref').classList.add('spin');
  if (!AD.users) { $('#adt tbody').innerHTML = ('<tr aria-hidden="true">' + '<td><i class="sk sk-td"></i></td>'.repeat(AD_COLS.length) + '</tr>').repeat(7); $('#adtiles').innerHTML = '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(6); }
  try {
    const r = await adRpc('admin_list_users');
    const prev = AD.users ? new Set(AD.users.map(u => u.id)) : null;
    AD.users = Array.isArray(r) ? r : [];
    AD.fresh = prev ? new Set(AD.users.filter(u => !prev.has(u.id)).map(u => u.id)) : new Set();
    adTiles(AD.anim); adDraw(AD.anim); AD.anim = false;
    if (AD.sel) { const u = adCur(); if (!u) adPanelClose(); else if (quiet) adPanelLive(u); else adPanel(u, true); }
    if (!quiet) taLoad();
    adStamp(true);
  } catch (e) {
    if (/admins only/i.test(e.message || '')) { AD.role = 'user'; adStatus({ role: 'user', locked: false }); return; }
    if (AD.users && AD.users.length) adStamp(false);
    else $('#adt tbody').innerHTML = `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('Could not load the users. Check your connection and try again.'))}</td></tr>`;
  } finally { AD.busy = false; $('#adref').classList.remove('spin'); }
}
function adLive(force) {
  if (!lvWant()) return;
  const now = Date.now();
  if (!force && now - AD.lt < (lvOk() ? 45000 : 20000)) return;
  AD.lt = now;
  adLoad(true);
  tkLoad(tkBox($('#tka'), 'admin'));
  if (AD.tab === 'log') alLoad(false, true);
  if (AD.tab === 'site') sfgLoad();
}
function adTiles(an) {
  const U = AD.users || [], now = Date.now(), tk = ($('#tka')._tk || {}).list || [];
  const open = tk.filter(t => t.status === 'open').length;
  const T = [['Accounts', U.length, 'all', 'users'], ['New this week', U.filter(u => now - Date.parse(u.created_at) < 6048e5).length, 'new', 'cake'], ['Active today', U.filter(u => adOn(u.id) || Date.parse(u.last_seen || 0) >= adDay0()).length, 'today', 'eye'], ['Admins', U.filter(adStaff).length, 'admin', 'star'], ['Locked', U.filter(u => u.locked).length, 'locked', 'lock'], ['Open tickets', open, 'tickets', 'chat']];
  const box = $('#adtiles'), old = box.querySelectorAll('b[data-n]');
  if (!U.length && !AD.users) return;
  if (!an && old.length === T.length) T.forEach(([, n], i) => { if (old[i].dataset.n !== String(n)) { old[i].dataset.n = n; old[i].textContent = stN(n); } });
  else { box.innerHTML = T.map(([k, n, f, ic], i) => `<button type="button" class="tile" data-adtile="${f}" style="--i:${i}" title="${esc(auT(f === 'tickets' ? 'Open the tickets' : 'Show these players'))}"><span class="tile-ic" aria-hidden="true">${AD_TI[ic]}</span><small>${esc(auT(k))}</small><b data-n="${n}" data-f="l">${stN(n)}</b></button>`).join(''); countUp(box); }
  box.querySelectorAll('.tile').forEach((t, i) => t.classList.toggle('hot', (T[i][2] === 'locked' || T[i][2] === 'tickets') && T[i][1] > 0));
  const tn = $('#adtn'); tn.textContent = open || ''; tn.hidden = !open;
}
const AD_TI = { users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>', cake: '<svg viewBox="0 0 24 24"><path d="M12 3v4M4 21h16v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zM4 16c2 1.3 4 1.3 5.3 0 1.4-1.3 3.4-1.3 5.4 0 1.3 1.3 3.3 1.3 5.3 0"/></svg>', eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>', star: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/></svg>', lock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>', chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg>' };
function adTileGo(f) {
  if (f === 'tickets') { adTab('tickets'); return; }
  const sel = $('#adf'), map = { all: 'all', new: 'all', today: 'today', admin: 'admin', locked: 'locked' }, v = map[f] || 'all';
  AD.f = v; if (sel) { if (v === 'today' && !sel.querySelector('[value="today"]')) sel.insertAdjacentHTML('beforeend', `<option value="today">${esc(auT('Active today'))}</option>`); sel.value = v; }
  if (f === 'new') AD.sort = ['created_at', -1];
  if (f === 'today') { AD.f = 'today'; AD.sort = ['last_seen', -1]; }
  if (AD.tab !== 'users') adTab('users');
  adDraw(true);
  const tw = $('#adusers .adm-tw'); if (tw) { tw.scrollTop = 0; tw.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'nearest' }); }
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-adtile]'); if (t && t.closest('#adtiles')) adTileGo(t.dataset.adtile); });
const adPw = u => u.has_password ? adPill('Set · hidden', 'ok') : adPill('None · Google only');
const adHrs = sec => { const m = Math.round((+sec || 0) / 60); return m < 60 ? m + ' min' : (m / 60).toFixed(m < 600 ? 1 : 0) + ' h'; };
const AD_CP = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
function adCopyFallback(t) {
  const ta = document.createElement('textarea');
  ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove();
  return ok;
}
async function adCopyId(id, b) {
  let ok = false;
  try { await navigator.clipboard.writeText(id); ok = true; } catch (e) { ok = adCopyFallback(id); }
  if (!ok) { toast(id); return; }
  b.classList.add('ok'); b.title = auT('Copied'); toast(auT('Copied'));
  setTimeout(() => { if (b.isConnected) { b.classList.remove('ok'); b.title = auT('Copy user id'); } }, 1400);
}
const adDot = () => `<span class="adm-dot" title="${esc(auT('Online now'))}"></span>`;
const AD_COLS = [
  ['id', 'Player', u => { const n = u.display_name || u.username || u.email || '?'; return `<span class="adm-who"><span class="adm-av" aria-hidden="true">${esc(n.charAt(0).toUpperCase())}${adDot(u)}</span><span class="adm-wn"><b>${esc(n)}</b><small>${u.username ? '@' + esc(u.username) : esc(auT('No username'))}</small></span></span>`; }],
  ['email', 'Email', u => esc(u.email || '—')],
  ['last_sign_in_at', 'Last log in', u => `<span title="${esc(adDate(u.last_sign_in_at, 1))}"${u.last_sign_in_at ? ` data-rtt="${esc(u.last_sign_in_at)}"` : ''}>${esc(adAgo(u.last_sign_in_at))}</span>`],
  ['last_seen', 'Last used website', u => `<span class="ls-on">${adPill('Online now', 'ok')}</span><span class="ls-off" title="${esc(adDate(u.last_seen, 1))}"${u.last_seen ? ` data-rtt="${esc(u.last_seen)}"` : ''}>${esc(adAgo(u.last_seen))}</span>`],
  ['providers', 'Log in method', u => esc(adProv(u))],
  ['created_at', 'Account created', u => `<span title="${esc(adDate(u.created_at, 1))}">${esc(adDate(u.created_at))}</span>`],
  ['has_password', 'Password', adPw],
  ['fav_game', 'Favourite game', u => esc(adGame(u.fav_game))],
  ['friends', 'Friends', u => String(+u.friends || 0)],
  ['role', 'Role', adRole],
  ['email_confirmed', 'Email confirmed', u => u.email_confirmed ? adPill('Yes', 'ok') : adPill('No', 'warn')],
  ['locked', 'Locked', u => u.locked ? `<span title="${esc(u.locked_reason || '')}">${adPill('Locked', 'bad')}</span><small class="adm-left">${esc(adLeft(u))}</small>` : adPill('No')]
];
function adHead() {
  adMorph($('#adt thead'), '<tr>' + AD_COLS.map(([k, l]) => k ? `<th>${k === 'id' ? '<div class="adm-thw">' : ''}<button type="button" data-adsort="${k}" aria-sort="${AD.sort[0] === k ? (AD.sort[1] > 0 ? 'ascending' : 'descending') : 'none'}">${esc(auT(l))}<i></i></button>${k === 'id' ? `<button type="button" class="adm-plus" data-adnew aria-label="${esc(auT('Create a user'))}" title="${esc(auT('Create a user'))}"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button></div>` : ''}</th>` : `<th><span>${esc(auT(l))}</span></th>`).join('') + '</tr>');
}
function adSortVal(u, k) {
  const v = k === 'providers' ? adProv(u) : k === 'id' ? u.display_name || u.username || u.email : u[k];
  if (k === 'last_seen' && adOn(u.id)) return Date.now() + 1;
  if (/_at$|last_seen/.test(k)) return Date.parse(v) || 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return v;
  return v == null ? '' : String(v).toLowerCase();
}
function adRows() {
  const q = AD.q.trim().toLowerCase().replace(/^@/, ''), f = AD.f, now = Date.now(), [k, d] = AD.sort;
  return (AD.users || []).filter(u => {
    if (q && ![u.id, u.email, u.username, u.display_name].some(x => x && String(x).toLowerCase().includes(q))) return false;
    if (f === 'admin') return adStaff(u);
    if (f === 'locked') return u.locked;
    if (f === 'unconfirmed') return !u.email_confirmed;
    if (f === 'google' || f === 'email') return (u.providers || []).includes(f);
    if (f === 'active') return now - Date.parse(u.last_seen || 0) < 6048e5;
    if (f === 'today') return !!adOn(u.id) || Date.parse(u.last_seen || 0) >= adDay0();
    if (f === 'online') return !!adOn(u.id);
    return true;
  }).sort((a, b) => { const x = adSortVal(a, k), y = adSortVal(b, k), dt = /_at$|last_seen/.test(k); const ex = x === '' || (dt && x === 0), ey = y === '' || (dt && y === 0); if (ex !== ey) return ex ? 1 : -1; return (x < y ? -1 : x > y ? 1 : 0) * d; });
}
function adDraw(an) {
  adHead();
  const rows = adRows(), tb = $('#adt tbody');
  tb.classList.toggle('an', !!an);
  $('#adcount').textContent = auT('{n} of {t} users').replace('{n}', rows.length).replace('{t}', (AD.users || []).length);
  const h = rows.length ? rows.map((u, i) => `<tr tabindex="0" data-uid="${esc(u.id)}" class="${[u.id === AD.sel ? 'sel' : '', adOn(u.id) ? 'on' : '', AD.fresh.has(u.id) ? 'nw' : ''].filter(Boolean).join(' ')}" style="--i:${Math.min(i, 14)}">${AD_COLS.map(c => `<td>${c[2](u)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('No users match.'))}</td></tr>`;
  if (an || !tb.querySelector('tr[data-uid]') || !rows.length) { tb.innerHTML = h; return; }
  const tw = tb.closest('.adm-tw'), top = tw ? tw.getBoundingClientRect().top + (tb.previousElementSibling ? tb.previousElementSibling.offsetHeight : 0) : 0;
  const ref = tw && tw.scrollTop > 0 ? [...tb.rows].find(r => r.getBoundingClientRect().bottom > top + 1) : null, y0 = ref ? ref.getBoundingClientRect().top : 0;
  adMorph(tb, h);
  if (ref && ref.isConnected) tw.scrollTop += ref.getBoundingClientRect().top - y0;
}
const AD_TABS = ['users', 'tickets', 'stats', 'log', 'site', 'ideas'];
const AD_OPEN = {};
function adTabBar(tabs) {
  const B = [...tabs.querySelectorAll('[role="tab"]')], i = B.findIndex(b => b.getAttribute('aria-selected') === 'true');
  tabs.style.setProperty('--tn', B.length || 1);
  tabs.style.setProperty('--ti', Math.max(0, i));
}
function adTab(t) {
  if (!$('#ad' + t)) t = 'users';
  const was = $('#ad' + AD.tab) ? AD.tab : 'users', tabs = $('#adtabs'), o = $('#ad' + was), fade = was !== t && view === 'admin' && !o.hidden && motionOK(), top = fade ? o.offsetTop : 0;
  AD.tab = t;
  tabs.dataset.m = t;
  tabs.querySelectorAll('[data-adtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.adtab === t)));
  adTabBar(tabs);
  if (AD_OPEN[t]) AD_OPEN[t](was);
  if (tabs.scrollWidth > tabs.clientWidth + 2) { const b = tabs.querySelector(`[data-adtab="${t}"]`); if (b) tabs.scrollTo({ left: Math.max(0, b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2), behavior: motionOK() ? 'smooth' : 'auto' }); }
  if (was !== t) tabs.parentNode.dataset.dir = AD_TABS.indexOf(t) < AD_TABS.indexOf(was) ? 'l' : 'r';
  if (t === 'stats' && was !== t) ST.anim = 2;
  AD_TABS.forEach(k => {
    const s = $('#ad' + k);
    clearTimeout(s._xt); s.classList.remove('adx'); s.style.top = '';
    if (k === t) s.hidden = false;
    else if (k === was && fade) { s.style.top = top + 'px'; s.classList.add('adx'); s._xt = setTimeout(() => { s.hidden = true; s.classList.remove('adx'); s.style.top = ''; }, 180); }
    else s.hidden = true;
  });
  if (t === 'tickets') tkLoad(tkBox($('#tka'), 'admin'));
  if (t === 'stats') stOpen();
  if (t === 'log') alLoad();
  if (t === 'site') { sfaDraw(); sfgLoad(); }
  if (t === 'ideas') idaTab();
}
function adLiveTxt(u) {
  const pr = adOn(u.id), sel = LV.d && LV.d.sel && LV.d.sel.id === u.id ? LV.d.sel : null, seen = sel && sel.seen && Date.parse(sel.seen) > Date.parse(u.last_seen || 0) ? sel.seen : u.last_seen;
  if (!pr) return `<span class="adm-mut">${esc(auT('Offline'))} · ${esc(auT('last seen {t}').replace('{t}', adAgo(seen)))}</span>`;
  const what = pr.g ? auT(pr.p ? 'in a party · {g}' : 'playing {g}').replace('{g}', adGame(pr.g)) : auT('browsing');
  return `<span class="adm-dot${pr.a ? ' away' : ''}"></span><b>${esc(auT(pr.a ? 'Online · away' : 'Online now'))}</b> · ${esc(what)}${pr.h ? ' · ' + esc(auT('hidden from friends')) : ''}`;
}
const adPk = u => [u.locked, u.locked_until, u.role, u.email, u.has_password, u.username].join('|');
function adPanelView(u) {
  const name = u.display_name || u.username || u.email || '?', me = SB.user && SB.user.id === u.id;
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  const tr = document.querySelector(`#adt tr[data-uid="${CSS.escape(u.id)}"]`); if (tr) tr.classList.add('sel');
  $('#adppic').textContent = name.charAt(0).toUpperCase();
  $('#adpn').textContent = name;
  $('#adpu').textContent = [u.username ? '@' + u.username : '', u.email || ''].filter(Boolean).join(' · ');
  adMorph($('#adpp'), adRole(u) + (u.locked ? adPill('Locked', 'bad') + adPill(adLeft(u), 'bad') : '') + (u.email_confirmed ? adPill('Email confirmed', 'ok') : adPill('Email not confirmed', 'warn')) + (me ? adPill('You', 'acc') : ''));
  adMorph($('#adplive'), adLiveTxt(u));
  adMorph($('#adpq'), [['Time played', adHrs(u.seconds_played), 'clock'], ['Plays', stN(u.plays), 'play'], ['Friends', stN(u.friends), 'users'], ['Favourite game', adGame(u.fav_game), 'star'], ['Account created', adAgo(u.created_at), 'cake'], ['Last seen', adOn(u.id) ? auT('Online now') : adAgo(u.last_seen), 'eye']].map(([k, v, i], n) => `<div style="--i:${n}">${AD_SI[i]}<small>${esc(auT(k))}</small><b title="${esc(v)}">${esc(v)}</b></div>`).join(''));
  const F = [['User id', `<code class="adm-uid">${esc(u.id)}</code><button type="button" class="adm-cp" data-adcopy="${esc(u.id)}" aria-label="${esc(auT('Copy user id'))}" title="${esc(auT('Copy user id'))}">${AD_CP}</button>`], ['Email', esc(u.email || '—')], ['Username', u.username ? '@' + esc(u.username) : '—'], ['Display name', esc(u.display_name || '—')], ['Last log in', esc(adDate(u.last_sign_in_at, 1))], ['Last used website', esc(adDate(u.last_seen, 1))], ['Log in method', esc(adProv(u))], ['Account created', esc(adDate(u.created_at, 1))], ['Password', adPw(u)], ['Favourite game', esc(adGame(u.fav_game))], ['Friends', String(+u.friends || 0)], ['Role', adRole(u)], ['Email confirmed', u.email_confirmed ? esc(adDate(u.email_confirmed_at, 1)) : adPill('No', 'warn')], ['Locked', u.locked ? adPill('Locked', 'bad') + ` <span class="adm-mut">${esc(u.locked_until ? auT('until {d}').replace('{d}', adDate(u.locked_until, 1)) : auT('Permanent'))}</span>` + (u.locked_reason ? `<div class="adm-why">${esc(u.locked_reason)}</div>` : '') : adPill('No')], ['Last game opened', esc(adGame(u.last_game))], ['Language', esc(adLangName(u.last_lang))]];
  adMorph($('#adpdl'), F.map(([k, v]) => `<div><dt>${esc(auT(k))}</dt><dd>${v}</dd></div>`).join(''));
}
function adPanelLive(u) {
  if (adPk(u) !== AD.pk) { adPanel(u, true); return; }
  adPanelView(u);
  adGames(u, true);
  alHist(u);
}
function adPanel(u, keep) {
  AD.sel = u.id;
  AD.pk = adPk(u);
  const p = $('#adpanel'), me = SB.user && SB.user.id === u.id;
  adPanelView(u);
  const can = adCan(u), own = adIsOwner(), rc = p.querySelector('[data-adrole]').closest('.apc-card');
  ['#adun', '#adrst', '#adso', '#adlock', '#addelb'].forEach(q => { $(q).closest('.apc-card').hidden = !can; });
  rc.hidden = !own;
  rc.closest('.apc-col').hidden = !can && !own;
  if (!keep) p.querySelectorAll('.is-busy').forEach(x => x.classList.remove('is-busy'));
  p.querySelectorAll('[data-adrole]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.adrole === u.role)); b.disabled = false; adUnconfirm(b); });
  const lb = $('#adlock');
  adUnconfirm(lb);
  lb.textContent = auT(u.locked ? 'Unlock account' : 'Lock account');
  lb.className = 'btn2 ' + (u.locked ? 'pri' : 'danger');
  lb.disabled = me && !u.locked;
  $('#adlr').hidden = u.locked; $('#adlrl').hidden = u.locked; $('#adld').hidden = u.locked; $('#adldl').hidden = u.locked;
  const lt = $('#adlt'); lt.hidden = !u.locked; lt.textContent = u.locked ? (u.locked_until ? auT('Locked until {d} ({r}).').replace('{d}', adDate(u.locked_until, 1)).replace('{r}', adAgo(u.locked_until)) : auT('Locked with no end date.')) : '';
  ['adpwb', 'adrst', 'adunb', 'addelb', 'adso', 'ademb'].forEach(id => adUnconfirm($('#' + id)));
  taSaved(u);
  $('#adrst').disabled = !u.email;
  $('#adpwt').textContent = auT(u.has_password ? 'Hidden.' : 'No password (Google sign-in).');
  $('#addelb').disabled = !!me || adStaff(u);
  if (!keep) {
    ['adprn', 'adpwn', 'adln', 'adrstn', 'adunn', 'addnn', 'ademn', 'adson', 'addeln'].forEach(id => auMsg(id, ''));
    $('#adpw').value = ''; $('#adlr').value = ''; $('#addel').value = ''; $('#adun').value = u.username || ''; $('#addn').value = u.display_name || ''; $('#adem').value = u.email || '';
    if (me) { auMsg('adln', 'You cannot lock your own account'); auMsg('addeln', 'You cannot delete your own account here.'); }
    else if (adStaff(u)) auMsg('addeln', 'Make this admin a regular user first.');
    $('#adpw').type = 'password';
    const eye = p.querySelector('.au-eye'); if (eye) auEye(eye, true);
    adGames(u);
    adDevices(u);
    alHist(u);
    achLoad(u);
    const was = p.hidden;
    vis(p, true);
    p.classList.remove('swap'); void p.offsetWidth; if (!was) p.classList.add('swap');
    requestAnimationFrame(() => p.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' }));
    if (was && !auCoarse()) p.focus({ preventScroll: true });
  }
}
async function adGames(u, quiet) {
  const box = $('#adpg');
  if (!quiet || box.dataset.u !== u.id) box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i><i class="sk sk-td"></i>';
  box.dataset.u = u.id;
  try {
    const r = await adRpc('admin_user_games', { p_uid: u.id });
    if (AD.sel !== u.id) return;
    const L = Array.isArray(r) ? r : [], max = Math.max(1, ...L.map(g => +g.seconds_played || 0));
    const h = L.length ? L.map((g, i) => `<div class="apc-g" data-k="g:${esc(g.game_id)}" style="--i:${Math.min(i, 12)};--c:${esc(TINT[g.game_id] || 'var(--accent)')}">${adCv(g.game_id, 'apc-gi')}<span class="apc-gn">${esc(adGame(g.game_id))}</span><b>${esc(adHrs(g.seconds_played))}</b><i><s style="width:${Math.max(2, Math.round(100 * (+g.seconds_played || 0) / max))}%"></s></i><small>${esc(auT('{n} plays').replace('{n}', +g.plays || 0))}${g.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', g.best_score)) : ''}${g.last_played ? ' · ' + esc(adAgo(g.last_played)) : ''}</small></div>`).join('') : `<div class="adm-mut apc-none">${esc(auT('No games played yet.'))}</div>`;
    if (quiet && box.querySelector('.apc-g')) adMorph(box, h); else box.innerHTML = h;
  } catch (e) { if (!quiet || !box.querySelector('.apc-g')) box.innerHTML = `<div class="adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
}
async function adDevices(u, all) {
  const box = $('#adpd');
  if (!box) return;
  box._all = !!all;
  box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i>';
  let L;
  try { L = await adRpc('admin_user_devices', { p_uid: u.id }); }
  catch (e) { if (AD.sel === u.id) box.innerHTML = `<div class="adm-mut">${esc(/admin_user_devices|function|404|PGRST/i.test(e.message || '') ? auT('Run round9_more.sql in the Supabase SQL editor to see this part.') : auT('Could not load. Check your connection and try again.'))}</div>`; return; }
  if (AD.sel !== u.id) return;
  L = Array.isArray(L) ? L : [];
  if (!L.length) { box.innerHTML = `<div class="adm-mut">${esc(auT('No device data yet.'))}</div>`; return; }
  const kv = (k, v) => v == null || v === '' ? '' : `<span>${esc(auT(k))}</span><b translate="no">${esc(String(v))}</b>`;
  const yn = v => v == null ? null : v ? auT('Yes') : auT('No');
  const more = L.length > 3 && !box._all;
  box.innerHTML = L.slice(0, more ? 3 : L.length).map((x, i) => {
    const d = x.dev || {}, g = x.geo || {}, sc = x.scr || {}, c = x.caps || {}, sm = x.sum || {};
    const when = new Date(x.last).toLocaleString(adLang()), dur = sm.dur != null ? (sm.dur >= 60 ? Math.round(sm.dur / 60) + ' min' : sm.dur + ' s') : null;
    const head = [d.osv, d.brv, d.model].filter(Boolean).join(' · ') || x.device || '—', where = [g.region, g.country].filter(Boolean).join(', ');
    return `<details class="apc-dv" style="--i:${Math.min(i, 12)}"${i ? '' : ' open'}><summary><b translate="no">${esc(head)}</b><small>${esc(when)}${where ? ' · ' + esc(where) : ''}${dur ? ' · ' + esc(dur) : ''}</small></summary><div class="ins-kv apc-kv">${[
      kv('VPN or datacenter', yn(g.vpn)), kv('Time zone', g.tz), kv('Connection', [g.net, g.ctype, g.dl != null ? g.dl + ' Mb/s' : '', g.rtt != null ? g.rtt + ' ms' : ''].filter(Boolean).join(' · ')),
      kv('Screen', sc.res), kv('Window', sc.vw ? sc.vw + '×' + sc.vh : null), kv('Pixel density', sc.dpr), kv('Pointer', sc.ptr), kv('Touch points', sc.tp), kv('Dark mode', yn(sc.dark)),
      kv('Graphics card', d.gpu), kv('CPU cores', d.cores), kv('Memory (GB)', d.mem), kv('Refresh rate (Hz)', d.hz), kv('Keyboard layout', d.kb), kv('Controllers', (d.pads || []).join(', ')), kv('Language', (d.langs || [])[0]),
      kv('Arrived from', c.ref), kv('Bot', yn(c.bot)),
      kv('Session', dur), kv('Time looking', sm.vis != null ? Math.round(sm.vis / 60) + ' min' : null), kv('Games opened', sm.games), kv('Games', (sm.gl || []).map(adGame).join(', ')), kv('Keys / clicks / taps', sm.keys != null ? [sm.keys, sm.clicks, sm.taps].join(' / ') : null), kv('Connection used', sm.route), kv('Events', x.events)
    ].join('')}</div></details>`;
  }).join('') + (more ? `<button class="btn2 apc-more" type="button" data-addev>${esc(auT('Show all {n}').replace('{n}', L.length))}</button>` : '');
}
function adPanelClose() {
  const p = $('#adpanel');
  if (p.hidden) return;
  const tr = document.querySelector('#adt tr.sel');
  AD.sel = null;
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  vis(p, false);
  if (tr && p.contains(document.activeElement)) tr.focus({ preventScroll: true });
}
function adUnconfirm(b) { if (b && b.dataset.c) { delete b.dataset.c; b.textContent = b.dataset.l; b.classList.remove('dangerfill'); } }
function adConfirm(b) {
  if (b.dataset.c) { adUnconfirm(b); return true; }
  b.dataset.l = b.textContent; b.dataset.c = '1';
  b.textContent = auT('Click again to confirm'); b.classList.add('dangerfill');
  clearTimeout(b._ct); b._ct = setTimeout(() => adUnconfirm(b), 4000);
  return false;
}
const adCur = () => (AD.users || []).find(x => x.id === AD.sel);
async function adAct(k, b) {
  const u = adCur();
  if (!u || b.disabled || !(k === 'role' ? adIsOwner() : adCan(u))) return;
  if (k === 'role') {
    const r = b.dataset.adrole;
    if (r === u.role) return;
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adprn', '');
    try { await adRpc('admin_set_role', { p_uid: u.id, p_role: r }); u.role = r; auMsg('adprn', r === 'owner' ? 'This user is now an owner.' : r === 'admin' ? 'This user is now an admin.' : 'This user is now a regular user.', 'ok'); track('admin', { act: 'role' }); rtSend(u.id, { t: 'status' }); if (SB.user && u.id === SB.user.id) { adCheck(); if (r === 'user') return; } }
    catch (e) { auMsg('adprn', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'pw') {
    const pw = $('#adpw').value;
    if (pw.length < 8) { auMsg('adpwn', 'Use at least 8 characters.', 'bad'); auShake($('#adpw').closest('.au-pw')); return; }
    if (utf8Len(pw) > 72) { auMsg('adpwn', 'Use at most 72 characters.', 'bad'); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adpwn', '');
    try { const r = await adRpc('admin_set_password', { p_uid: u.id, p_password: pw }); $('#adpw').value = ''; auMsg('adpwn', r === 'signed_out' ? 'New password saved. They were signed out on their devices.' : 'New password saved.', 'ok'); track('admin', { act: 'password' }); alHist(u); }
    catch (e) { auMsg('adpwn', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'reset') {
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adrstn', '');
    try { await adRpc('admin_log_reset', { p_uid: u.id }).catch(e => { if (/rank|admins only/i.test(e.message || '')) { e.ad = 1; throw e; } }); const c = await sbClient(); const { error } = await c.auth.resetPasswordForEmail(u.email, { redirectTo: sbRedirect('recovery') }); if (error) throw error; auMsg('adrstn', auT('Sent to {e}. They get a 6-digit code to choose a new password.').replace('{e}', u.email), 'ok'); track('admin', { act: 'reset' }); alHist(u); }
    catch (e) { auMsg('adrstn', e.ad ? adErr(e) : auErrText(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'un') {
    const v = $('#adun').value.trim().toLowerCase().replace(/^@/, '');
    if (v === (u.username || '')) return;
    if (!UN_NEW.test(v) || /^\.|\.$|\.\./.test(v)) { auMsg('adunn', 'Use 4 to 20 lowercase letters, numbers, dots or underscores.', 'bad'); auShake($('#adun')); return; }
    b.disabled = true; b.classList.add('is-busy'); auMsg('adunn', '');
    try { u.username = await adRpc('admin_set_username', { p_uid: u.id, p_name: v }); auMsg('adunn', 'Username saved.', 'ok'); track('admin', { act: 'username' }); rtSend(u.id, { t: 'profile' }); }
    catch (e) { auMsg('adunn', /taken/i.test(e.message || '') ? 'That username is taken.' : /not allowed/i.test(e.message || '') ? 'That username is not allowed.' : adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'dn') {
    const v = $('#addn').value.replace(/\s+/g, ' ').trim();
    if (v === (u.display_name || '')) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('addnn', '');
    try { u.display_name = await adRpc('admin_set_display_name', { p_uid: u.id, p_name: v }); $('#addn').value = u.display_name || ''; auMsg('addnn', 'Display name saved.', 'ok'); track('admin', { act: 'display_name' }); rtSend(u.id, { t: 'profile' }); }
    catch (e) { auMsg('addnn', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'em') {
    const v = $('#adem').value.trim().toLowerCase();
    if (v === String(u.email || '').toLowerCase()) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { auMsg('ademn', 'That email does not look valid.', 'bad'); auShake($('#adem')); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('ademn', '');
    try { u.email = await adRpc('admin_set_email', { p_uid: u.id, p_email: v }); u.email_confirmed = true; auMsg('ademn', 'Email saved. They log in with the new one.', 'ok'); track('admin', { act: 'email' }); }
    catch (e) { auMsg('ademn', /already has an account/i.test(e.message || '') ? 'That email already has an account.' : adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'so') {
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adson', '');
    try { const n = await adRpc('admin_sign_out', { p_uid: u.id }); rtSend(u.id, { t: 'status' }); auMsg('adson', n ? auT('Signed out on {n} device(s). Open pages log out within a few minutes.').replace('{n}', n) : 'They were not logged in anywhere.', 'ok'); track('admin', { act: 'sign_out' }); }
    catch (e) { auMsg('adson', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    if (SB.user && u.id === SB.user.id) { auSignOut(); return; }
  } else if (k === 'del') {
    const t = $('#addel').value.trim().toLowerCase().replace(/^@/, '');
    if (!t || (t !== String(u.username || '').toLowerCase() && t !== String(u.email || '').toLowerCase())) { auMsg('addeln', 'Type the username or email exactly to confirm.', 'bad'); auShake($('#addel')); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('addeln', '');
    try {
      await adRpc('admin_delete_user', { p_uid: u.id });
      b.disabled = false; b.classList.remove('is-busy'); adUnconfirm(b);
      track('admin', { act: 'delete' });
      rtSend(u.id, { t: 'deleted' });
      AD.users = (AD.users || []).filter(x => x.id !== u.id);
      adPanelClose(); adTiles(); adDraw(); toast(auT('Account deleted'));
    } catch (e) { auMsg('addeln', /regular user first/i.test(e.message || '') ? 'Make this admin a regular user first.' : /own account/i.test(e.message || '') ? 'You cannot delete your own account here.' : adErr(e), 'bad'); b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'lock') {
    const on = !u.locked;
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adln', '');
    const hrs = +$('#adld').value || 0, until = on && hrs ? new Date(Date.now() + hrs * 3600e3).toISOString() : null;
    try {
      if (on) await adRpc('admin_lock_until', { p_uid: u.id, p_reason: $('#adlr').value, p_until: until }); else await adRpc('admin_lock', { p_uid: u.id, p_locked: false, p_reason: null });
      u.locked = on; u.locked_until = until; u.locked_reason = on ? (String($('#adlr').value).replace(/\s+/g, ' ').trim().slice(0, 500) || null) : null;
      auMsg('adln', on ? (until ? auT('Account locked until {d}.').replace('{d}', adDate(until, 1)) : 'Account locked.') : 'Account unlocked.', 'ok'); track('admin', { act: on ? 'lock' : 'unlock', hrs }); rtSend(u.id, { t: 'status' });
    }
    catch (e) { auMsg('adln', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  }
  adTiles(); adDraw(); adPanel(u, true);
  alHist(u);
  adLoad();
}

const AL = { list: [], more: false, busy: false, seq: 0, top: 0 };
const alWho = (un, dn, id) => un ? '@' + un : dn || id || '';
const AL_T = { view_chat: '{a} read the messages of {t}', search_chat: '{a} searched all messages', display_name: '{a} changed the display name of {t}', email: '{a} changed the email of {t}', sign_out: '{a} signed {t} out on every device', role_owner: '{a} made {t} an owner', role_admin: '{a} made {t} an admin', role_user: '{a} made {t} a regular user', username: '{a} changed the username of {t} to {n}', lock_until: '{a} locked {t} until {d}', lock: '{a} locked {t} with no end date', unlock: '{a} unlocked {t}', expire: 'The lock on {t} ended', password: '{a} set a new password for {t}', reset_email: '{a} sent a password reset email to {t}', delete_user: '{a} deleted the account of {t}', ticket_delete: '{a} deleted a ticket from {t}', ticket_reply: '{a} replied to a ticket from {t}', ticket_closed: '{a} closed a ticket from {t}', ticket_open: '{a} reopened a ticket from {t}', site: '{a} changed the site switches', site_password: '{a} changed the site password', test_account: '{a} created the test account {t}', rate_reset: '{a} reset the rate limits of {t}', gate_open: '{a} turned the site password off: anyone who opens the site gets in', gate_closed: '{a} turned the site password back on' };
function alSite(d) {
  const a = d.after || {}, b = d.before || {}, out = [], ga = new Set(a.disabled_games || []), gb = new Set(b.disabled_games || []);
  if (!!a.maintenance !== !!b.maintenance) out.push(auT(a.maintenance ? 'Maintenance mode on' : 'Maintenance mode off'));
  if ((a.banner || '') !== (b.banner || '')) out.push(a.banner ? auT('Announcement: {b}').replace('{b}', a.banner) : auT('Announcement removed'));
  const on = [...ga].filter(x => !gb.has(x)), off = [...gb].filter(x => !ga.has(x));
  if (on.length) out.push(auT('Turned off: {g}').replace('{g}', on.map(adGame).join(', ')));
  if (off.length) out.push(auT('Turned back on: {g}').replace('{g}', off.map(adGame).join(', ')));
  return out.length ? out.join(' · ') : auT('Messages updated');
}
function alRow(x, i) {
  const d = x.detail || {}, k = x.action === 'role' ? 'role_' + (d.to === 'owner' || d.to === 'admin' ? d.to : 'user') : x.action === 'lock' && d.until ? 'lock_until' : x.action === 'ticket_status' ? (d.status === 'closed' ? 'ticket_closed' : 'ticket_open') : x.action;
  const a = alWho(x.admin_username, x.admin_display, x.admin_id) || auT('An admin'), t = alWho(x.target_username, x.target_display, null) || (d.username ? '@' + d.username : d.display_name) || (x.target_user ? auT('a deleted account') : '');
  const tt = x.target_user && (AD.users || []).some(u => u.id === x.target_user) ? `<button type="button" class="al-u" data-alu="${esc(x.target_user)}">${esc(t)}</button>` : `<b>${esc(t)}</b>`;
  const txt = esc(auT(AL_T[k] || '{a} did something ({x})')).replace('{a}', `<b>${esc(a)}</b>`).replace('{t}', tt).replace('{n}', `<b>@${esc(d.to || '')}</b>`).replace('{d}', esc(adDate(d.until, 1))).replace('{x}', esc(x.action));
  const ex = x.action === 'lock' && d.reason ? auT('Reason: {r}').replace('{r}', d.reason) : /^ticket_/.test(x.action) && d.subject ? '“' + d.subject + '”' : x.action === 'site' ? alSite(d) : x.action === 'username' && d.from ? auT('Was @{u}').replace('{u}', d.from) : (x.action === 'display_name' || x.action === 'email') && d.from ? auT('Was {u}').replace('{u}', d.from) : '';
  const ic = { lock: AD_ICO.lock, unlock: AD_ICO.lock, expire: AD_SI.clock, delete_user: AD_ICO.trash, ticket_delete: AD_ICO.trash, site: SF_ICO.tool, site_password: AD_ICO.lock, gate_open: AD_ICO.lock, gate_closed: AD_ICO.lock, rate_reset: AD_SI.timer, ticket_reply: AD_ICO.send, ticket_status: AD_ICO.send, password: AD_SI.eye, reset_email: AD_SI.eye, role: AD_SI.star, username: AD_SI.users, test_account: AD_SI.users }[x.action] || AD_SI.clock;
  return `<div class="al-r al-${esc(x.action)}${AL.top && +x.id > AL.top ? ' nw' : ''}" data-k="al:${+x.id}" style="--i:${Math.min(i, 14)}"><span class="al-i">${ic}</span><div class="al-t"><span>${txt}</span>${ex ? `<em>${esc(ex)}</em>` : ''}<small title="${esc(adDate(x.at, 1))}">${esc(adAgo(x.at))} · ${esc(adDate(x.at, 1))}</small></div></div>`;
}
async function alLoad(more, quiet) {
  if (!adIsAdmin() || AL.busy) return;
  AL.busy = true;
  const box = $('#adlog');
  if (!more && !AL.list.length && !quiet) box.innerHTML = '<div class="st-card">' + '<i class="sk sk-td"></i>'.repeat(6) + '</div>';
  try {
    const r = await adRpc('admin_log_list', { p_limit: 50, p_before: more && AL.list.length ? AL.list[AL.list.length - 1].id : null, p_target: null });
    const L = Array.isArray(r) ? r : [], was = AL.list.length ? +AL.list[0].id : 0;
    if (more) { AL.list = AL.list.concat(L); AL.more = L.length === 50; }
    else if (quiet && AL.list.length && L.length === 50) { const lo = +L[L.length - 1].id; AL.list = L.concat(AL.list.filter(x => +x.id < lo)); }
    else { AL.list = L; AL.more = L.length === 50; }
    AL.top = quiet ? was : 0;
    const card = `<div class="st-card al-card" id="alc"><div class="sx-ch"><div><h3>${esc(auT('Admin log'))}</h3></div></div><div class="al-list" translate="no">${AL.list.length ? AL.list.map(alRow).join('') : `<div class="adm-empty">${esc(auT('Nothing here yet.'))}</div>`}</div>${AL.more ? `<button class="btn2 al-more" type="button" data-almore>${esc(auT('Show more'))}</button>` : ''}</div>`;
    AL.top = 0;
    if ($('#alc') && $('#adab')) adMorph($('#alc'), card.slice(card.indexOf('>') + 1, -6)); else box.innerHTML = msHtml() + card + `<div id="adab">${AB.html}</div>`;
    abLoad(quiet);
    if (quiet) adStamp(true);
  } catch (e) { if (!AL.list.length) box.innerHTML = `<div class="adm-empty">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; else if (quiet) adStamp(false); }
  finally { AL.busy = false; }
}
const AB = { html: '', busy: false, h: 24 };
const AB_T = { party: 'Party invites (1 per 3 s)', party_h: 'Party invites per hour', people: 'Player list loads per minute', people_h: 'Player list loads per hour', invite: 'Party invites per minute', invite_h: 'Party invites per hour', invite_pair: 'Invite cooldown per friend', dm_text: 'Messages per minute', dm_text_h: 'Messages per hour', dm_image: 'Pictures per minute', dm_image_d: 'Pictures per day', dm_upload: 'Picture uploads per minute', dm_upload_d: 'Picture uploads per day', friend_request: 'Friend requests per hour', friend_request_d: 'Friend requests per day', friend_pair: 'Friend requests to one player', friend_respond: 'Friend request answers', search: 'Player searches per minute', search_h: 'Player searches per hour', username_check: 'Username checks per minute', username_check_h: 'Username checks per hour', username_change: 'Username changes per day', display_change: 'Display name changes per day', ticket_create: 'Tickets per 10 minutes', ticket_create_d: 'Tickets per day', ticket_send: 'Ticket messages per minute', ticket_send_d: 'Ticket messages per day', sync: 'Stat syncs', save_write: 'Save uploads', export: 'Data exports', delete_account: 'Account deletions', block: 'Blocks', unblock: 'Unblocks', report: 'Reports per hour', report_d: 'Reports per day', dm_file: 'Files sent per minute', dm_file_d: 'Files sent per day', login: 'Log in attempts', login_ip: 'Log in attempts per network', idea_create: 'Ideas per hour', idea_create_d: 'Ideas per day', log_chat: 'Party chat lines per minute', log_chat_h: 'Party chat lines per hour', party: 'Party invites and join requests (one every 3 s)', party_h: 'Party invites and join requests per hour', people: 'Player list loads per minute', people_h: 'Player list loads per hour' };
const AB_R = { spam: 'Spam', harassment: 'Harassment', cheating: 'Cheating', inappropriate: 'Inappropriate', other: 'Something else' };
function abWho(id, un, dn, fb) {
  const t = un ? '@' + un : dn || fb || auT('A deleted account');
  return id && (AD.users || []).some(u => u.id === id) ? `<button type="button" class="al-u" data-alu="${esc(id)}">${esc(t)}</button>` : `<b>${esc(t)}</b>`;
}
function abHtml(A, R) {
  const rep = R.length ? `<div class="adm-tw ab-tw"><table class="adm-t st-t ab-t"><thead><tr>${['When', 'Reported player', 'Reason', 'Details', 'By', ''].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${R.map(r => {
    const M = r.context && Array.isArray(r.context.messages) ? r.context.messages : [];
    const msgs = M.length ? `<details class="ab-msgs"><summary>${esc(auT('{n} recent messages').replace('{n}', M.length))}</summary>${M.map(m => `<div class="adm-mut"><b>${esc(m.from_reported ? auT('Reported') : auT('Reporter'))}</b> · ${esc(m.kind === 'text' ? String(m.body || '') : m.kind === 'image' ? auT('Picture') : m.kind === 'file' ? auT('File · {n}').replace('{n}', m.meta && m.meta.name || '') : auT('Party invite') + ' · ' + adGame(m.meta && m.meta.game))}</div>`).join('')}</details>` : '';
    return `<tr data-k="ab:${+r.id}"><td title="${esc(adDate(r.created_at, 1))}">${esc(adAgo(r.created_at))}</td><td>${abWho(r.target, r.target_username, r.target_display)}${r.target_locked ? ' ' + adPill('Locked', 'bad') : ''}${+r.target_reports > 1 ? ' ' + adPill(auT('{n} reports').replace('{n}', +r.target_reports), 'warn') : ''}</td><td>${esc(auT(AB_R[r.reason] || r.reason))}</td><td class="ab-d">${r.details ? `<span>${esc(r.details)}</span>` : ''}${msgs}</td><td>${abWho(r.reporter, r.reporter_username, null)}</td><td><div class="ab-acts">${r.ticket_id ? `<button class="btn2" type="button" data-abt="${+r.ticket_id}">${esc(auT('Open ticket'))}</button>` : ''}<button class="btn2" type="button" data-abr="${+r.id}">${esc(auT('Close'))}</button></div></td></tr>`;
  }).join('')}</tbody></table></div>` : `<div class="adm-empty">${esc(auT('No open reports.'))}</div>`;
  const lim = A.length ? `<div class="adm-tw ab-tw"><table class="adm-t st-t ab-t"><thead><tr>${['Player', 'Limit', 'Requests', 'Times at the limit', 'Last', ''].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${A.map(a => `<tr><td>${a.uid ? abWho(a.uid, a.username, a.display_name) : `<span class="adm-mut">${esc(auT('Signed out visitor'))} · <code>${esc(a.ip || '')}</code></span>`}</td><td>${esc(auT(AB_T[a.action] || a.action))}</td><td>${stN(a.hits)}</td><td>${+a.at_limit ? adPill(stN(a.at_limit), 'warn') : '0'}</td><td title="${esc(adDate(a.last_at, 1))}">${esc(adAgo(a.last_at))}</td><td>${a.uid ? `<button class="btn2" type="button" data-abreset="${esc(a.uid)}">${esc(auT('Reset limits'))}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-empty">${esc(auT('Nobody came close to a limit.'))}</div>`;
  return `<div class="st-card al-card"><div class="sx-ch"><div><h3>${esc(auT('Player reports'))}${R.length ? ` <span class="adm-pill warn">${stN(R.length)}</span>` : ''}</h3></div></div>${rep}</div><div class="st-card al-card"><div class="sx-ch"><div><h3>${esc(auT('Rate limits'))}</h3></div><button class="btn2" type="button" data-abh>${esc(auT(AB.h === 24 ? 'Last 7 days' : 'Last 24 hours'))}</button></div>${lim}</div>`;
}
async function abLoad(quiet) {
  const box = $('#adab');
  if (!box || !adIsAdmin()) return;
  if (AB.busy) { AB.again = true; return; }
  AB.busy = true;
  if (!AB.html && !box.children.length) box.innerHTML = '<div class="st-card">' + '<i class="sk sk-td"></i>'.repeat(4) + '</div>';
  let A = null, R = null, miss = false;
  try { [A, R] = await Promise.all([adRpc('admin_abuse', { p_hours: AB.h }), adRpc('admin_reports', { p_status: 'open', p_limit: 100 })]); }
  catch (e) { if (sbMissing(e)) miss = true; else { AB.busy = false; AB.again = false; if (!AB.html && $('#adab')) $('#adab').innerHTML = `<div class="adm-empty">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; return; } }
  AB.busy = false;
  const h = miss ? `<div class="st-card al-card"><h3>${esc(auT('Player reports and rate limits'))}</h3><p class="sx-note">${esc(auT('Run round14_security.sql in the Supabase SQL editor to see player reports and rate-limit hits here.'))}</p></div>` : abHtml(Array.isArray(A) ? A : [], Array.isArray(R) ? R : []);
  const el = $('#adab');
  if (!el) { AB.html = h; return; }
  if (AB.html && el.querySelector('.al-card') && quiet) { if (h !== AB.html) adMorph(el, h); } else el.innerHTML = h;
  AB.html = h;
  if (AB.again) { AB.again = false; abLoad(true); }
}
async function abAct(t) {
  const r = t.closest('[data-abr]'), x = t.closest('[data-abreset]'), tk = t.closest('[data-abt]');
  if (t.closest('[data-abh]')) { AB.h = AB.h === 24 ? 168 : 24; abLoad(); return true; }
  if (tk) { const el = tkBox($('#tka'), 'admin'), id = +tk.dataset.abt; adTab('tickets'); if (el._tk.list && el._tk.list.some(z => z.id === id)) tkOpen(el, id); else tkLoad(el).then(() => { if ((el._tk.list || []).some(z => z.id === id)) tkOpen(el, id); }); return true; }
  if (!r && !x) return false;
  const b = r || x;
  b.disabled = true;
  try {
    if (r) { await adRpc('admin_report_set', { p_id: +r.dataset.abr, p_status: 'closed' }); toast(auT('Report closed')); abLoad(true); }
    else { await adRpc('admin_rate_reset', { p_uid: x.dataset.abreset }); toast(auT('Limits reset')); alLoad(false, true); }
  } catch (e) { b.disabled = false; toast(auT(adErr(e))); }
  return true;
}
async function alHist(u) {
  const box = $('#adph'), n = ++AL.seq;
  if (!box) return;
  if (!box.children.length || box.dataset.u !== u.id) box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i>';
  box.dataset.u = u.id;
  try {
    const r = await adRpc('admin_log_list', { p_limit: 20, p_before: null, p_target: u.id });
    if (n !== AL.seq || AD.sel !== u.id) return;
    const L = Array.isArray(r) ? r : [];
    const h = L.length ? L.map(alRow).join('') : `<div class="adm-mut apc-none">${esc(auT('No admin changes for this player yet.'))}</div>`;
    if (box.querySelector('.al-r') && L.length) adMorph(box, h); else box.innerHTML = h;
  } catch (e) { if (n === AL.seq && !box.querySelector('.al-r')) box.innerHTML = `<div class="adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
}

const sfaLocal = iso => { const t = Date.parse(iso || ''); if (!t) return ''; const d = new Date(t); return new Date(t - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
function sfaDraw() {
  const d = SF.d || {}, box = $('#adsite'), off = new Set(d.disabled_games || []);
  box.innerHTML = `<div class="sfa">
  <div class="st-card sfa-c"><div class="sfa-row"><div><h3>${esc(auT('Maintenance mode'))}</h3></div><button class="sw${d.maintenance ? ' on' : ''}" type="button" role="switch" id="sfam" aria-checked="${!!d.maintenance}" aria-label="${esc(auT('Maintenance mode'))}"></button></div>
   <label class="apc-l" for="sfamm">${esc(auT('Message on the maintenance page (optional)'))}</label><textarea id="sfamm" maxlength="500" rows="2" placeholder="${esc(auT('We are making the site better. Please come back in a little while.'))}">${esc(d.maintenance_msg || '')}</textarea></div>
  <div class="st-card sfa-c"><h3>${esc(auT('Announcement banner'))}</h3>
   <textarea id="sfab" maxlength="300" rows="2">${esc(d.banner || '')}</textarea>
   <div class="sfa-2"><label class="apc-l">${esc(auT('Style'))}<select id="sfal"><option value="info"${d.banner_level !== 'warning' ? ' selected' : ''}>${esc(auT('Info'))}</option><option value="warning"${d.banner_level === 'warning' ? ' selected' : ''}>${esc(auT('Alert (middle of the screen)'))}</option></select></label><label class="apc-l">${esc(auT('Ends (optional)'))}<input type="datetime-local" id="sfau" value="${esc(sfaLocal(d.banner_until))}"></label></div></div>
  <div class="st-card sfa-c"><h3>${esc(auT('Turned off games'))}</h3>
   <label class="search sfa-q"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="sfaq" type="search" placeholder="${esc(auT('Search games'))}" autocomplete="off" spellcheck="false" aria-label="${esc(auT('Search games'))}"></label>
   <div class="sfa-g" id="sfag" translate="no">${games.slice().sort((a, b) => (off.has(b.id) - off.has(a.id)) || a.title.localeCompare(b.title)).map(g => `<button type="button" class="chip" data-sfg="${esc(g.id)}" aria-pressed="${off.has(g.id)}">${esc(g.title)}</button>`).join('')}</div>
   <label class="apc-l" for="sfadm">${esc(auT('Message for turned off games (optional)'))}</label><textarea id="sfadm" maxlength="300" rows="2" placeholder="${esc(auT('This game is being fixed. Try again a bit later.'))}">${esc(d.disabled_msg || '')}</textarea></div>
  <div class="sfa-f"><div class="note" id="sfan" role="status"></div><button class="btn2 pri" type="button" id="sfas">${esc(auT('Save and publish'))}</button></div>${adIsOwner() ? `
  <div class="st-card sfa-c" id="sfpw"><h3>${esc(auT('Site password'))}</h3>
   <div class="sfg" id="sfg">${sfgHtml()}</div>
   <h4 class="sfg-h">${esc(auT('Change the password'))}</h4>
   <div class="sfa-2"><div><label class="apc-l" for="sfp1">${esc(auT('New password'))}</label><div class="au-pw"><input id="sfp1" type="password" autocomplete="new-password" maxlength="200" spellcheck="false">${EYE}</div></div><div><label class="apc-l" for="sfp2">${esc(auT('Confirm password'))}</label><div class="au-pw"><input id="sfp2" type="password" autocomplete="new-password" maxlength="200" spellcheck="false">${EYE}</div></div></div>
   <div class="sfa-f"><div class="note" id="sfpn" role="status"></div><button class="btn2 pri" type="button" id="sfps">${esc(auT('Save password'))}</button></div></div>` : ''}</div>`;
}
const gpEnc = u => btoa(String.fromCharCode.apply(null, u));
async function gpKek(pw, s, n) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.importKey('raw', await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: s, iterations: n, hash: 'SHA-256' }, base, 256), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function gpSlot(pw, k) {
  const s = crypto.getRandomValues(new Uint8Array(16)), i = crypto.getRandomValues(new Uint8Array(12)), n = 310000;
  const c = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: i }, await gpKek(pw, s, n), k));
  const o = { v: 1, s: gpEnc(s), n, i: gpEnc(i), c: gpEnc(c) };
  const back = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: lzB64(o.i) }, await gpKek(pw, lzB64(o.s), o.n), lzB64(o.c)));
  if (back.length !== k.length || back.some((x, j) => x !== k[j])) throw new Error('Slot check failed');
  return o;
}
async function sfgHash() {
  if (!LZ.key) return null;
  try { const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(LZ.key))); return [...h.slice(0, 8)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch (e) { return null; }
}
function sfgHtml() {
  const d = SG.d, ready = !!(d && d.ready), on = !(d && d.open), stale = !!(d && d.open && SG.kh && d.kh && d.kh !== SG.kh);
  const dis = !LZ.key || SG.busy || !ready || !!SG.err;
  const st = SG.err ? SG.err : !LZ.key ? auT('This copy of the site is not password protected, so there is nothing to switch.') : !d ? auT('Checking…') : !ready ? auT('Set a site password below first.') : on ? auT('Everyone types the password to open the site.') : auT('Since {t}: anyone who opens the site gets straight in, without the password.').replace('{t}', adDate(d.at, 1)) + (d.by_name ? ' ' + auT('Turned off by {u}.').replace('{u}', d.by_name) : '');
  const msg = SG.msg && Date.now() - SG.msg[2] < 20000 ? `<div class="note ${SG.msg[1]}" role="status">${esc(auT(SG.msg[0]))}</div>` : '';
  return `<div class="sfa-row"><div><b class="sfg-st ${!d ? '' : on ? 'on' : 'off'}">${esc(auT(!d ? 'Site password' : on ? 'Site password: On' : 'Site password: Off'))}</b><p class="sx-note">${esc(st)}</p></div><button class="sw${on ? ' on' : ''}${dis ? ' dis' : ''}${SG.busy ? ' is-busy' : ''}" type="button" role="switch" id="sfgo" aria-checked="${on}" aria-label="${esc(auT('Site password'))}"${dis ? ' disabled' : ''}></button></div>`
    + (stale ? `<div class="sfg-cf warn"><span>${esc(auT('The saved key is out of date. Save the current key to let visitors in.'))}</span><button class="btn2 pri" type="button" data-sfgo="fix">${esc(auT('Save the current key'))}</button></div>` : '')
    + (SG.cf ? `<div class="sfg-cf"><span>${esc(auT('Anyone with the address gets in without the password.'))}</span><div class="sfg-b"><button class="btn2" type="button" data-sfgo="cancel">${esc(auT('Cancel'))}</button><button class="btn2 danger" type="button" data-sfgo="off">${esc(auT('Turn the password off'))}</button></div></div>` : '')
    + msg
    + ``;
}
function sfgPaint() { const el = $('#sfg'); if (el) adMorph(el, sfgHtml()); }
async function sfgLoad() {
  if (!adIsOwner() || !$('#sfg') || SG.busy) return;
  const n = ++SG.seq;
  if (SG.kh == null) SG.kh = await sfgHash();
  try { const d = await adRpc('owner_gate_state'); if (n !== SG.seq || SG.busy) return; SG.d = d && typeof d === 'object' ? d : null; SG.err = null; }
  catch (e) { if (n !== SG.seq || SG.busy) return; const miss = sbMissing(e) || /owner_gate_state|schema cache/i.test(e.message || ''); if (miss) SG.d = null; SG.err = miss ? auT('Run round15_admin.sql in the Supabase SQL editor to use this switch.') : SG.d ? null : auT('Could not load. Check your connection and try again.'); }
  sfgPaint();
}
async function sfgSet(open) {
  if (!adIsOwner() || SG.busy || (open && !LZ.key)) return;
  SG.busy = true; SG.cf = false; SG.msg = null; SG.seq++; sfgPaint();
  try {
    const d = await adRpc('owner_set_gate_open', { p_open: open, p_key: open ? LZ.key : null });
    SG.d = d && typeof d === 'object' ? d : SG.d;
    SG.msg = [open ? 'The site password is off. Anyone who opens the site now gets straight in.' : 'The site password is back on. New visitors have to type it again.', 'ok', Date.now()];
    track('admin', { act: open ? 'gate_open' : 'gate_closed' });
    AL.list = [];
  } catch (e) { SG.msg = [sbMissing(e) ? 'Run round15_admin.sql in the Supabase SQL editor to use this switch.' : adErr(e), 'bad', Date.now()]; }
  finally { SG.busy = false; sfgPaint(); }
}
async function sfpSave(b) {
  if (!adIsOwner()) return;
  const a = $('#sfp1').value, c = $('#sfp2').value;
  if (a.length < 6) { auMsg('sfpn', 'Use at least 6 characters.', 'bad'); auShake($('#sfp1').closest('.au-pw')); return; }
  if (a !== c) { auMsg('sfpn', 'The two passwords do not match.', 'bad'); auShake($('#sfp2').closest('.au-pw')); return; }
  if (!LZ.key) { auMsg('sfpn', 'This copy of the site is not password protected.', 'bad'); return; }
  if (!adConfirm(b)) return;
  b.disabled = true; b.classList.add('is-busy'); auMsg('sfpn', '');
  try {
    await adRpc('owner_set_gate', { p_slot: await gpSlot(a, lzB64(LZ.key)) });
    $('#sfp1').value = ''; $('#sfp2').value = '';
    auMsg('sfpn', 'Site password changed.', 'ok');
    track('admin', { act: 'gate' });
    AL.list = [];
  } catch (e) { auMsg('sfpn', adErr(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function sfaSave(b) {
  const v = id => $('#' + id).value, au = v('sfau'), until = au ? new Date(au) : null;
  if (until && !(until.getTime() > Date.now())) { auMsg('sfan', 'Pick an end time in the future.', 'bad'); auShake($('#sfau')); return; }
  const flags = { maintenance: $('#sfam').classList.contains('on'), maintenance_msg: v('sfamm'), banner: v('sfab'), banner_level: v('sfal'), banner_until: until ? until.toISOString() : null, disabled_games: [...document.querySelectorAll('#sfag [aria-pressed="true"]')].map(x => x.dataset.sfg), disabled_msg: v('sfadm') };
  b.disabled = true; b.classList.add('is-busy'); auMsg('sfan', '');
  try {
    const r = await adRpc('admin_set_site_flags', { p_flags: flags });
    if (r && typeof r === 'object') { SF.d = r; try { localStorage.setItem(SF_KEY, JSON.stringify(r)); } catch (e) {} }
    sfPaint(); sfNudge();
    auMsg('sfan', 'Saved. Every open tab updates right away.', 'ok');
    track('admin', { act: 'site' });
    AL.list = [];
  } catch (e) { auMsg('sfan', adErr(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}

const ST = { d: null, at: 0, busy: false, days: 30, game: null, ci: -1, anim: 2, ps: 0, ch: {}, lv: new Set() };
const ST_SUB = [['ov', 'Overview'], ['act', 'Players'], ['use', 'Games'], ['perf', 'Performance'], ['err', 'Errors'], ['par', 'Parties'], ['hl', 'Health'], ['ins', 'Player data']];
const stN = v => (+v || 0).toLocaleString(adLang());
const stH = v => { const n = +v || 0; return (n < 10 ? n.toFixed(1) : stN(Math.round(n))) + ' h'; };
const stDay = (t, o) => { const d = Date.parse(String(t).slice(0, 10) + 'T12:00:00'); try { return new Date(d).toLocaleDateString(adLang(), o || { day: 'numeric', month: 'short' }); } catch (e) { return String(t).slice(0, 10); } };
const stNice = (v, int) => { if (!(v > 0)) return int ? 2 : 1; if (int && v <= 5) return Math.max(2, Math.ceil(v / 2) * 2); const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const ST_DEV = { desktop: 'Desktop', phone: 'Phone', tablet: 'Tablet', unknown: 'Unknown' }, ST_DK = { desktop: 0, phone: 1, tablet: 2, unknown: 'o' };
function stShell() {
  const box = $('#adstats');
  if (!ST_SUB.some(x => x[0] === INS.sub)) INS.sub = 'ov';
  if (!$('#stov')) box.innerHTML = `<div class="adm-tabs ins-sub" role="tablist" aria-label="${esc(auT('Stats sections'))}">${ST_SUB.map(([k, l]) => `<button type="button" role="tab" data-stsub="${k}">${esc(auT(l))}</button>`).join('')}<i></i></div>
   <div class="mx-bar"><div class="sx-rng" role="group" aria-label="${esc(auT('Time range'))}">${[7, 30, 90].map(d => `<button type="button" data-strng="${d}" aria-pressed="${d === ST.days}">${esc(auT('{n} days').replace('{n}', d))}</button>`).join('')}</div><label class="mx-sw" title="${esc(auT('Admins and owners are left out of every number unless this is on. Test accounts are always left out.'))}"><button class="sw${LV.staff ? ' on' : ''}" type="button" role="switch" id="ststaff" aria-checked="${LV.staff}" aria-label="${esc(auT('Count staff activity'))}"></button><span>${esc(auT('Count staff activity'))}</span></label><span class="mx-upd" id="stupd" role="status"><i></i><span data-ago=""></span></span></div>
   <div id="stov"></div><div id="stmx"></div><div id="insv"></div>`;
  const tabs = box.querySelector('.ins-sub');
  box.querySelectorAll('[data-stsub]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.stsub === INS.sub)));
  adTabBar(tabs);
  if (tabs.scrollWidth > tabs.clientWidth + 2) { const b = tabs.querySelector('[aria-selected="true"]'); if (b) tabs.scrollTo({ left: Math.max(0, b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2), behavior: motionOK() ? 'smooth' : 'auto' }); }
  box.querySelectorAll('[data-strng]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.strng === ST.days)));
  $('#stov').hidden = INS.sub !== 'ov'; $('#insv').hidden = INS.sub !== 'ins'; $('#stmx').hidden = !MX_T[INS.sub];
  stStamp();
  return $('#stov');
}
function stStamp() {
  const el = $('#stupd');
  if (!el) return;
  const k = INS.sub, at = k === 'ov' ? ST.at : k === 'ins' ? INS.at : MX.at[k] || 0, busy = k === 'ov' ? ST.busy : k === 'ins' ? INS.busy : !!MX.busy[k];
  el.lastChild.dataset.ago = at || '';
  el.classList.toggle('busy', busy);
  el.classList.toggle('bad', k === 'ov' ? !!ST.bad : k === 'ins' ? !!INS.bad : !!MX.err[k]);
  adAgoPaint(el.lastChild);
}
function stOpen(force) {
  stShell();
  if (INS.sub === 'ins') insLoad(!!force); else if (INS.sub === 'ov') stLoad(!!force); else mxLoad(INS.sub, !!force);
}
async function stLoad(force) {
  if (!adIsAdmin() || ST.busy) return;
  if (!force && ST.d && Date.now() - ST.at < 20000) { stDraw(); return; }
  ST.busy = true;
  const box = $('#adstats'), el = stShell();
  if (ST.anim || !ST.d) box.classList.add('sx-busy');
  if (!ST.d) el.innerHTML = '<div class="st-top"><div class="st-card st-livec" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-td"></i><i class="sk sk-td"></i></div><div class="tiles adm-tiles st-tiles">' + '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(5) + '</div></div><i class="sk sk-chart"></i><i class="sk sk-chart"></i>';
  try {
    ST.d = await adData('stats', ST.days).catch(e => { if (!sbMissing(e)) throw e; return adRpc('admin_stats_v2', { p_days: ST.days }); });
    ST.at = Date.now(); ST.bad = false; stDraw(); adStamp(true);
  } catch (e) { ST.bad = true; if (!ST.d) el.innerHTML = `<div class="adm-empty">${esc(auT('Could not load the stats. Check your connection and try again.'))}</div>`; else adStamp(false); }
  finally { ST.busy = false; box.classList.remove('sx-busy'); stStamp(); }
}
function stLiveParts() {
  const ids = adOnIds(), by = {}, U = new Map((AD.users || []).map(u => [u.id, u]));
  const P = ids.map(id => [id, adOn(id)]).filter(x => x[1]);
  P.forEach(([, p]) => { const k = p.g || ''; by[k] = (by[k] || 0) + 1; });
  const top = Object.entries(by).filter(([k]) => k).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const seen = ST.lv;
  ST.lv = new Set(P.map(([id]) => id));
  const name = id => { const u = U.get(id); return (u && (u.display_name || u.username || u.email)) || id.slice(0, 8); };
  const list = P.length ? P.sort((a, b) => (b[1].g ? 1 : 0) - (a[1].g ? 1 : 0) || name(a[0]).localeCompare(name(b[0]))).map(([id, p]) => {
    const u = U.get(id), nm = name(id), st = adStaff(u || {}) ? auT('Staff') : p.l === 2 ? auT('Test account') : '';
    return `<button class="st-on${seen.has(id) || !seen.size ? '' : ' nw'}" type="button" data-stu="${esc(id)}" data-k="on:${esc(id)}"><span class="pic">${esc(nm.charAt(0).toUpperCase())}<i class="fr-dot ${p.a ? 'away' : 'on'}"></i></span><span><b>${esc(nm)}</b><small>${esc([u && u.username ? '@' + u.username : '', st, p.h ? auT('hidden from friends') : '', p.a ? auT('away') : ''].filter(Boolean).join(' · '))}</small></span><em class="${p.g ? 'pl' : ''}">${esc(p.g ? (p.p ? auT('Party') + ' · ' : '') + adGame(p.g) : auT('Browsing'))}</em></button>`;
  }).join('') : `<div class="adm-mut sx-nobody">${esc(auT('Nobody is online right now.'))}</div>`;
  return { n: P.length, play: P.filter(x => x[1].g).length, party: P.filter(x => x[1].p).length, lg: top.map(([g, n]) => `<span class="adm-pill acc" data-k="lg:${esc(g)}">${esc(adGame(g))} · ${n}</span>`).join(''), list };
}
function stLive() {
  const box = $('#stlive');
  if (!box) return;
  const L = stLiveParts();
  adText($('#stln'), stN(L.n));
  adMorph($('#stlg'), L.lg);
  adMorph(box, L.list);
  adMorph($('#stle'), lvErrHtml());
}
function stSeries() {
  const D = ST.d || {};
  if (Array.isArray(D.series)) return D.series;
  const S = new Map((D.signups || []).map(s => [String(s.day).slice(0, 10), +s.signups || 0]));
  return (D.daily || []).map(d => ({ day: d.day, active: d.active_players, signed_in: d.signed_in_players, sessions: d.sessions, launches: d.game_launches, hours: d.hours_played, signups: S.get(String(d.day).slice(0, 10)) || 0, peak: null }));
}
function stPath(pts, base) {
  let d = '', a = '', seg = [];
  const flush = () => { if (!seg.length) return; d += 'M' + seg.map(p => p.join(',')).join('L'); a += 'M' + seg[0][0] + ',' + base + 'L' + seg.map(p => p.join(',')).join('L') + 'L' + seg[seg.length - 1][0] + ',' + base + 'Z'; seg = []; };
  pts.forEach(p => { if (p) seg.push(p); else flush(); });
  flush();
  return [d, a];
}
function stChart(id, title, rows, keys, o) {
  const W = 600, H = 150, n = rows.length, bar = o.type === 'bar', fmt = o.fmt || stN;
  const vals = keys.map(k => rows.map(r => r[k.k] == null ? null : +r[k.k] || 0));
  const all = vals.flat().filter(v => v != null), max = stNice(Math.max(0, ...all), !o.dec);
  ST.ch[id] = { rows, keys, vals, max, bar, fmt };
  const main = vals[0].filter(v => v != null), kv = o.agg === 'max' ? Math.max(0, ...main) : o.agg === 'avg' ? main.reduce((s, v) => s + v, 0) / Math.max(1, main.length) : main.reduce((s, v) => s + v, 0);
  const kl = o.agg === 'max' ? 'Highest' : o.agg === 'avg' ? 'Daily average' : 'Total';
  const X = i => bar ? (i + .5) * W / n : n > 1 ? i * W / (n - 1) : W / 2, Y = v => +(H - H * v / max).toFixed(1);
  let g = [0, .5, 1].map(f => `<line class="sx-gl" x1="0" x2="${W}" y1="${H * f}" y2="${H * f}"/>`).join('');
  const sd = (Math.min(25, 420 / Math.max(1, n))).toFixed(1);
  if (bar && n) { const bw = W / n * (n > 40 ? .78 : .64); g += vals[0].map((v, i) => { const h = Math.max(v ? 2 : 0, H * (v || 0) / max); return `<rect data-i="${i}" style="--i:${i}" x="${(X(i) - bw / 2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}"/>`; }).join(''); }
  else g += vals.map((vs, s) => { const [d, a] = stPath(vs.map((v, i) => v == null ? null : [+X(i).toFixed(1), Y(v)]), H); return (s ? '' : `<path class="sx-a" d="${a}" fill="url(#sxg-${id})"/>`) + `<path class="sx-l sx-s${s}" d="${d}"/>`; }).join('');
  const lab = v => o.dec ? fmt(v) : stN(v);
  const xl = n ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, A) => A.indexOf(v) === i).map(i => `<span style="left:${(100 * X(i) / W).toFixed(2)}%">${esc(stDay(rows[i].day))}</span>`).join('') : '';
  return `<div class="st-card sx-c${o.wide ? ' sx-wide' : ''}" style="--i:${o.i || 0}">
   <div class="sx-ch"><div><h3>${esc(auT(title))}</h3></div><div class="sx-kpi"><b${!o.dec && Number.isInteger(kv) ? ` data-n="${kv}" data-f="l"` : ''}>${esc(o.dec ? fmt(kv) : stN(Math.round(kv * 10) / 10))}</b><small>${esc(auT(kl))}</small></div></div>
   ${keys.length > 1 ? `<div class="sx-leg">${keys.map((k, s) => `<span><i class="sx-s${s}"></i>${esc(auT(k.l))}</span>`).join('')}</div>` : ''}
   <div class="sx-plot"><div class="sx-y" aria-hidden="true"><span>${esc(lab(max))}</span><span>${esc(lab(max / 2))}</span><span>0</span></div>
    <div class="sx-area" data-ch="${id}">
     <div class="sx-w${ST.anim && !bar ? ' an' : ''}"><svg class="sx-svg${bar ? ' sx-bars' : ''}${ST.anim ? ' an' : ''}" style="--sd:${sd}ms" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(auT(title))}"><defs><linearGradient id="sxg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sx0);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--sx0);stop-opacity:0"/></linearGradient></defs>${g}</svg></div>
     <div class="sx-ov" aria-hidden="true"><i class="sx-x"></i>${bar ? '' : keys.map((k, s) => `<i class="sx-dot sx-s${s}"></i>`).join('')}<div class="sx-tip"></div></div>
     <div class="sx-xl" aria-hidden="true">${xl}</div>
    </div>
   </div>
  </div>`;
}
function stHover(a, e) {
  const c = ST.ch[a.dataset.ch];
  if (!c || !c.rows.length) return;
  const r = a.querySelector('svg').getBoundingClientRect(), n = c.rows.length, f = (e.clientX - r.left) / r.width;
  if (f < 0 || f > 1) { stUnhover(a); return; }
  const i = c.bar ? Math.min(n - 1, Math.floor(f * n)) : Math.round(f * (n - 1)), xp = c.bar ? (i + .5) / n : n > 1 ? i / (n - 1) : .5;
  a.classList.add('hov');
  a.querySelector('.sx-x').style.left = (xp * 100) + '%';
  a.querySelectorAll('.sx-dot').forEach((d, s) => { const v = c.vals[s][i]; d.hidden = v == null; d.style.left = (xp * 100) + '%'; d.style.top = (100 - 100 * (v || 0) / c.max) + '%'; });
  a.querySelectorAll('rect.on').forEach(x => x.classList.remove('on'));
  if (c.bar) { const b = a.querySelector(`rect[data-i="${i}"]`); if (b) b.classList.add('on'); }
  const t = a.querySelector('.sx-tip');
  t.innerHTML = `<small>${esc(stDay(c.rows[i].day, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))}</small>` + c.keys.map((k, s) => `<span>${c.keys.length > 1 ? `<i class="sx-s${s}"></i>` : ''}${esc(auT(k.l))}<b>${c.vals[s][i] == null ? esc(auT('No data')) : esc(c.fmt(c.vals[s][i]))}</b></span>`).join('');
  t.style.left = (xp * 100) + '%';
  t.style.transform = `translateX(${xp < .18 ? -6 : xp > .82 ? -94 : -50}%)`;
}
function stUnhover(a) { a.classList.remove('hov'); a.querySelectorAll('rect.on').forEach(x => x.classList.remove('on')); }
function stDonut() {
  const D = ST.d || {}, H = D.game_hours || null;
  const src = H ? Object.entries(H).map(([id, h]) => [id, +h || 0]) : stGames().map(g => [g.game_id, +g.hours || 0]);
  const L = src.filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]), tot = L.reduce((s, x) => s + x[1], 0);
  if (!tot) return '<div class="adm-mut sx-empty">—</div>';
  const top = L.slice(0, 5), rest = L.slice(5).reduce((s, x) => s + x[1], 0);
  if (rest > 0) top.push(['', rest]);
  let off = 0;
  const ms = 7, gap = top.length > 1 ? .8 : 0;
  const segs = top.map(([id, h], s) => { const p = 100 * h / tot, len = Math.max(.01, p - gap), c = `<circle class="sx-seg sx-k${id ? s : 'o'}" data-seg="${s}" cx="21" cy="21" r="15.915" pathLength="100" stroke-dasharray="${len.toFixed(2)} ${(100 - len).toFixed(2)}" stroke-dashoffset="${(25 - off).toFixed(2)}" style="--d:${Math.round(off * ms)}ms;--t:${Math.max(90, Math.round(p * ms))}ms"><title>${esc(id ? adGame(id) : auT('Other games'))}: ${esc(stH(h))} (${Math.round(p)}%)</title></circle>`; off += p; return c; }).join('');
  ST.dn = top.map(([id, h]) => ({ n: id ? adGame(id) : auT('Other games'), h, p: Math.round(100 * h / tot) }));
  return `<div class="sx-dn"><div class="sx-ring"><svg viewBox="0 0 42 42" class="${ST.anim ? 'an' : ''}" role="img" aria-label="${esc(auT('Share of playtime'))}"><circle class="sx-track" cx="21" cy="21" r="15.915"/>${segs}</svg><div class="sx-dc" data-h="${esc(`<b>${esc(stH(tot))}</b><small>${esc(auT('Hours played'))}</small>`)}"><b>${esc(stH(tot))}</b><small>${esc(auT('Hours played'))}</small></div></div>
   <div class="sx-dl">${top.map(([id, h], s) => `<div class="sx-dr" data-seg="${s}"><i class="sx-k${id ? s : 'o'}"></i><span>${esc(id ? adGame(id) : auT('Other games'))}</span><b>${Math.round(100 * h / tot)}%</b><small>${esc(stH(h))}</small></div>`).join('')}</div></div>`;
}
function stSeg(dn, s) {
  const k = s ? s.dataset.seg : null, d = k != null && ST.dn ? ST.dn[+k] : null, c = dn.querySelector('.sx-dc');
  dn.querySelectorAll('[data-seg]').forEach(x => x.classList.toggle('dim', k != null && x.dataset.seg !== k));
  c.innerHTML = d ? `<b>${d.p}%</b><small>${esc(d.n)}</small>` : c.dataset.h;
}
function stDevices() {
  const D = ST.d || {}, by = {};
  (D.device_split || D.devices || []).forEach(d => { const k = ST_DEV[d.device] ? d.device : 'unknown'; by[k] = (by[k] || 0) + (+d.sessions || 0); });
  const L = Object.entries(by).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]), tot = L.reduce((s, x) => s + x[1], 0);
  if (!tot) return '<div class="adm-mut sx-empty">—</div>';
  const DI = { desktop: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>', phone: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>', tablet: '<svg viewBox="0 0 24 24"><rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>', unknown: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01"/></svg>' };
  return `<div class="sx-stack" aria-hidden="true">${L.map(([k, n]) => `<i class="sx-k${ST_DK[k]}" style="flex:${n}"></i>`).join('')}</div><div class="sx-dv">${L.map(([k, n], s) => `<div class="sx-dvr" style="--i:${s}"><span class="sx-dvi sx-k${ST_DK[k]}">${DI[k]}</span><span>${esc(auT(ST_DEV[k]))}</span><b>${Math.round(100 * n / tot)}%</b><small>${esc(auT('{n} sessions').replace('{n}', stN(n)))}</small></div>`).join('')}</div>`;
}
function stGames() {
  const D = ST.d || {}, M = new Map((D.games || []).map(g => [g.game_id, g]));
  const all = games.map(g => g.id).concat([...M.keys()].filter(id => !byId.has(id)));
  return [...new Set(all)].map(id => Object.assign({ game_id: id, launches: 0, plays: 0, players: 0, launches_7d: 0, hours: 0, hours_7d: 0, avg_min: 0, errors: 0, errors_7d: 0, accounts: 0 }, M.get(id) || {}));
}
function stHealth(g) {
  if (+g.errors_7d >= Math.max(3, (+g.launches_7d || 0) / 2)) return adPill('Broken?', 'bad');
  if (+g.errors_7d > 0) return adPill('Some errors', 'warn');
  if (!+g.launches && !+g.plays) return adPill('Not played yet');
  return adPill('Working', 'ok');
}
function stSpark(a, an) {
  if (!a || !a.length) return '';
  const max = Math.max(1, ...a), n = a.length, W = 120, H = 34, X = i => n > 1 ? i * W / (n - 1) : W / 2, P = a.map((v, i) => [+X(i).toFixed(1), +(H - 2 - (H - 4) * v / max).toFixed(1)]), [d, ar] = stPath(P, H);
  return `<div class="sx-w${an ? ' an' : ''}"><svg class="sx-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="sx-a" d="${ar}"/><path class="sx-l sx-s0" d="${d}"/></svg></div>`;
}
function stOpts(q) {
  q = (q || '').trim().toLowerCase();
  const M = new Map(stGames().map(g => [g.game_id, g]));
  return stGames().map(g => ({ id: g.game_id, t: adGame(g.game_id), l: +g.launches || 0 })).filter(o => !q || o.t.toLowerCase().includes(q) || o.id.includes(q)).sort((a, b) => (q ? (b.t.toLowerCase().startsWith(q) ? 1 : 0) - (a.t.toLowerCase().startsWith(q) ? 1 : 0) : 0) || b.l - a.l || a.t.localeCompare(b.t)).slice(0, 60).map(o => Object.assign(o, { g: M.get(o.id) }));
}
function stCombo(open) {
  const inp = $('#stgq'), ul = $('#stgl');
  if (!inp) return;
  if (!open) { ul.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.removeAttribute('aria-activedescendant'); ST.ci = -1; return; }
  const q = inp.dataset.typed === '1' ? inp.value : '', O = stOpts(q), ql = q.trim().toLowerCase();
  ST.opts = O;
  if (ST.ci >= O.length) ST.ci = O.length - 1;
  const hl = t => { const i = ql ? t.toLowerCase().indexOf(ql) : -1; return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + ql.length)) + '</mark>' + esc(t.slice(i + ql.length)); };
  ul.innerHTML = O.length ? O.map((o, i) => `<li role="option" id="stgo${i}" data-g="${esc(o.id)}" aria-selected="${o.id === ST.game}" class="${i === ST.ci ? 'act' : ''}">${adCv(o.id, 'sx-cv')}<span translate="no">${hl(o.t)}</span><small>${esc(auT('{n} launches').replace('{n}', stN(o.l)))}</small></li>`).join('') : `<li class="sx-cbn" role="presentation">${esc(auT('No games match.'))}</li>`;
  ul.hidden = false; inp.setAttribute('aria-expanded', 'true');
  if (ST.ci >= 0) { inp.setAttribute('aria-activedescendant', 'stgo' + ST.ci); const a = $('#stgo' + ST.ci); if (a) a.scrollIntoView({ block: 'nearest' }); } else inp.removeAttribute('aria-activedescendant');
}
function stPick(id) {
  ST.game = id;
  const inp = $('#stgq');
  if (inp) { inp.value = adGame(id); inp.dataset.typed = ''; }
  stCombo(false);
  stGameCard(true);
}
function stGameHtml(an) {
  const g = stGames().find(x => x.game_id === ST.game);
  if (!g) return '';
  const D = ST.d || {}, v2 = D.measure === 2, sp = (D.game_days || {})[g.game_id], gm = byId.get(g.game_id), tint = TINT[g.game_id] || 'var(--accent)';
  const P = (D.players || []).filter(p => p.game_id === g.game_id).sort((a, b) => (+b.seconds_played || 0) - (+a.seconds_played || 0)).slice(0, 5);
  const spSum = sp ? sp.reduce((s, v) => s + (+v || 0), 0) : null, sm = t => `<small>${esc(t)}</small>`;
  const C = [
    ['Launches', stN(g.launches), 'rocket', v2 ? `${sp ? stSpark(sp, an) : ''}${sm(auT('{n} all time').replace('{n}', stN(g.launches_all)))}` : spSum != null ? `${stSpark(sp, an)}${sm(auT('{n} in the last {d} days').replace('{n}', stN(spSum)).replace('{d}', ST.days))}` : sm(auT('{n} in the last 7 days').replace('{n}', stN(g.launches_7d))), 'sx-gw', g.launches],
    ['Players', stN(g.players), 'users', '', '', g.players],
    ['Rounds played', stN(g.plays), 'play', '', '', g.plays],
    ['Hours played', stH(g.hours), 'clock', sm(auT('{n} in the last 7 days').replace('{n}', stH(g.hours_7d)))],
    ['Avg minutes per visit', (+g.avg_min || 0).toFixed(1), 'timer', v2 ? sm(auT('{n} visits').replace('{n}', stN(g.visits))) : ''],
    ['Accounts with records', stN(g.accounts), 'save', v2 && +g.acct_hours ? sm(auT('{h} on their accounts').replace('{h}', stH(g.acct_hours))) : '', '', g.accounts],
    ['Errors', stN(g.errors), 'bug', `<span class="sx-hp">${stHealth(g)}</span>${sm(auT('{n} in the last 7 days').replace('{n}', stN(g.errors_7d)))}`, +g.errors_7d ? 'sx-gbad' : '', g.errors],
    ['Last launch', g.last_launch ? adAgo(g.last_launch) : auT('Never'), 'eye', g.last_launch ? sm(adDate(g.last_launch, 1)) : '', 'sx-gw']
  ];
  return `<div class="sx-gh2" style="--c:${esc(tint)}"><span class="sx-gt">${adCv(g.game_id, '')}</span><div><b translate="no">${esc(adGame(g.game_id))}</b><span><code>${esc(g.game_id)}</code>${gm && gm.info ? `<small>${esc(gm.info.genres.join(' · '))}</small>` : ''}</span></div>${gm ? `<a class="btn2" href="${esc(href(g.game_id))}" data-stopen="${esc(g.game_id)}">${esc(auT('Open game'))}</a>` : ''}</div>
   <div class="sx-gc">${C.map(([k, v, ic, x, cl, n], i) => `<div class="sx-gk ${cl || ''}" style="--i:${i}"><span class="sx-gki">${AD_SI[ic]}</span><small>${esc(auT(k))}</small><b${Number.isInteger(+n) && n !== '' && n != null ? ` data-n="${+n}" data-f="l"` : ''}>${esc(v)}</b>${x || ''}</div>`).join('')}</div>
   <div class="sx-g2">
    <div class="sx-gb"><h4>${esc(auT('Last error'))}</h4>${g.last_error ? `<div class="sx-err"><code translate="no">${esc(String(g.last_error).slice(0, 400))}</code><small>${esc(g.last_error_at ? adAgo(g.last_error_at) : '')}</small></div>` : '<div class="adm-mut">—</div>'}</div>
    <div class="sx-gb"><h4>${esc(auT('Top players'))}</h4>${P.length ? `<div class="sx-tp">${P.map((p, i) => `<button type="button" class="sx-tpr" data-stu="${esc(p.user_id)}"><span class="sx-rk">${i + 1}</span><span class="pic">${esc((p.display_name || p.username || '?').charAt(0).toUpperCase())}</span><span class="sx-tpn"><b translate="no">${esc(p.display_name || p.username || '—')}</b><small>${p.username ? '@' + esc(p.username) + ' · ' : ''}${esc(auT('{n} plays').replace('{n}', +p.plays || 0))}${p.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', p.best_score)) : ''}</small></span><em>${esc(adHrs(p.seconds_played))}</em></button>`).join('')}</div>` : '<div class="adm-mut">—</div>'}</div>
   </div>`;
}
function stGameCard(an) {
  const box = $('#stgd');
  if (!box) return;
  if (!motionOK()) an = 0;
  box.classList.toggle('sx-gp', an === true);
  const h = stGameHtml(an);
  if (an || !box.firstElementChild) { box.innerHTML = h; if (an) countUp(box); } else adMorph(box, h);
}
function stReveal(box, k) {
  k = k || 'io';
  const C = [...box.querySelectorAll('.sx-c, .st-grid > .st-card, .ins-sec')];
  if (!window.IntersectionObserver) { C.forEach(countUp); return; }
  if (ST[k]) ST[k].disconnect();
  const io = ST[k] = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); e.target.classList.remove('sx-wait'); countUp(e.target); }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  C.forEach(c => { c.classList.add('sx-wait'); io.observe(c); });
}
function stDraw() {
  const D = ST.d || {}, O = D.overview || {}, box = $('#adstats'), el = stShell(), S = stSeries();
  const PL = D.play || null, avg = PL && +PL.visits ? (+PL.hours || 0) * 60 / +PL.visits : null, acc = n => n == null ? '' : auT('{n} with an account').replace('{n}', stN(n));
  const T = (O.active_today != null ? [['Active today', stN(O.active_today), +O.active_today || 0, acc(O.signed_in_today)]] : []).concat([['Active 7 days', stN(O.active_7d), +O.active_7d || 0, acc(O.signed_in_7d)], ['Active 30 days', stN(O.active_30d), +O.active_30d || 0, acc(O.signed_in_30d)]]).concat(PL ? [['Hours played', stH(PL.hours), null, auT('last {d} days').replace('{d}', ST.days)], ['Avg minutes per visit', avg == null ? '—' : avg.toFixed(1), null, auT('{n} visits').replace('{n}', stN(PL.visits))]] : []);
  const ER = D.errors || [], DV = D.devices || [], SQ = D.searches || [], RE = D.retention || [];
  const peakOk = S.some(r => r.peak != null), NR = new Set(SQ.filter(q => +q.with_no_results).map(q => q.query)), td = D.today || dayKey();
  const reCell = v => v == null ? '<td>—</td>' : `<td><span class="st-hc" style="--a:${Math.min(1, (+v || 0) / 100).toFixed(2)}">${Math.round(+v || 0)}%</span></td>`;
  if (!ST.game || !stGames().some(g => g.game_id === ST.game)) ST.game = (stGames().slice().sort((a, b) => (+b.launches || 0) - (+a.launches || 0))[0] || {}).game_id || null;
  const keep = document.activeElement && document.activeElement.id === 'stgq', an = motionOK() ? ST.anim : 0, live = !an && !!el.querySelector('.st-top');
  ST.anim = an;
  ['act', 'peak', 'ses', 'hrs', 'new', 'lch'].forEach(k => { delete ST.ch[k]; });
  box.classList.toggle('sx-q', !an); box.classList.toggle('sx-r', an === 1);
  const LP = stLiveParts();
  const html = `
  <div class="st-top"><div class="st-card st-livec"><div class="st-h"><h3><i class="adm-dot"></i>${esc(auT('Live now'))}</h3><b class="st-big" id="stln">${stN(LP.n)}</b></div><div class="st-lg" id="stlg">${LP.lg}</div><div class="st-live" id="stlive">${LP.list}</div></div>
  <div class="tiles adm-tiles st-tiles">${T.map(([k, v, n, sub], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b${n != null ? ` data-n="${n}" data-f="l"` : ''}>${esc(v)}</b>${sub ? `<em class="st-ts">${esc(sub)}</em>` : ''}</div>`).join('')}</div></div>
  <div class="sx-bar"><h3>${esc(auT('Trends'))}</h3></div>
  ${stChart('act', 'Active players per day', S, [{ k: 'active', l: 'Active players' }, { k: 'signed_in', l: 'Signed in' }], { agg: 'avg', wide: true })}
  <div class="sx-grid">
   ${peakOk ? stChart('peak', 'Peak online per day', S, [{ k: 'peak', l: 'Peak online' }], { agg: 'max', i: 1 }) : stChart('ses', 'Sessions per day', S, [{ k: 'sessions', l: 'Sessions' }], { agg: 'sum', i: 1 })}
   ${peakOk ? stChart('ses', 'Sessions per day', S, [{ k: 'sessions', l: 'Sessions' }], { agg: 'sum', i: 2 }) : ''}
   ${stChart('hrs', 'Hours played per day', S, [{ k: 'hours', l: 'Hours played' }], { agg: 'sum', dec: true, fmt: stH, i: 3 })}
   ${stChart('new', 'New accounts per day', S, [{ k: 'signups', l: 'New accounts' }], { agg: 'sum', type: 'bar', i: 4 })}
   ${stChart('lch', 'Game launches per day', S, [{ k: 'launches', l: 'Game launches' }], { agg: 'sum', type: 'bar', i: 5 })}
   <div class="st-card sx-c" style="--i:6"><div class="sx-ch"><div><h3>${esc(auT('Share of playtime'))}</h3></div></div>${stDonut()}</div>
  </div>
  <div class="st-card sx-gm"><div class="sx-gh"><h3>${esc(auT('Games'))}</h3>
   <div class="sx-cb"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="stgq" role="combobox" aria-expanded="false" aria-controls="stgl" aria-autocomplete="list" aria-label="${esc(auT('Choose a game'))}" placeholder="${esc(auT('Search games'))}" autocomplete="off" spellcheck="false" value="${esc(ST.game ? adGame(ST.game) : '')}"><button type="button" class="sx-cbt" data-stcb tabindex="-1" aria-label="${esc(auT('Show all games'))}">${AD_ICO.chev}</button><ul id="stgl" role="listbox" aria-label="${esc(auT('Games'))}" hidden></ul></div>
  </div>${D.measure === 2 ? `<p class="sx-note sx-gnote">${esc(auT('Last {d} days. Only active play time counts.').replace('{d}', ST.days))}</p>` : ''}<div id="stgd">${stGameHtml(an)}</div></div>
  <div class="st-grid">
   <div class="st-card"><h3>${esc(auT('Devices'))}</h3>${stDevices()}<div class="st-list sx-dvl">${DV.slice(0, 6).map(d => `<div class="st-kv"><span>${esc([auT(ST_DEV[d.device] || d.device || ''), d.os, d.browser].filter(Boolean).join(' · '))}</span><b>${stN(d.sessions)}</b></div>`).join('')}</div></div>
   <div class="st-card"><div class="sx-ch"><div><h3>${esc(auT('Recent errors'))}</h3></div><button class="btn2" type="button" data-stsub="err">${esc(auT('All errors'))}</button></div><div class="st-list" id="stle">${lvErrHtml()}</div></div>
   <div class="st-card"><h3>${esc(auT('Top searches'))}</h3>${insList(SQ.map(q => ({ k: q.query, n: +q.searches || 0 })), { val: r => stN(r.n), fmt: k => esc(k) + (NR.has(k) ? ` <span class="adm-pill warn">${esc(auT('no result'))}</span>` : '') })}</div>
   <div class="st-card"><h3>${esc(auT('Players coming back'))}</h3>${RE.length ? `<div class="adm-tw st-re"><table class="adm-t st-t"><thead><tr>${['First day', 'New', 'Next day', 'Within a week'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${RE.map(r => `<tr><td>${esc(stDay(r.cohort_day))}</td><td>${stN(r.new_players)}</td>${String(r.cohort_day).slice(0, 10) >= td ? `<td><span class="adm-mut" title="${esc(auT('Too early to tell'))}">—</span></td>` : reCell(r.day1_pct)}${reCell(r.back_within_7d_pct)}</tr>`).join('')}</tbody></table></div>` : insWhy()}</div>
  </div>`;
  if (live) adMorph(el, html);
  else {
    el.innerHTML = html;
    if (an === 2) countUp(el.querySelector('.st-top'));
    if (an) { stReveal(el); countUp($('#stgd')); }
  }
  if (keep) $('#stgq').focus({ preventScroll: true });
  ST.anim = 0;
}
function stBoot() {
  const box = $('#adstats');
  box.addEventListener('click', e => {
    const sb = e.target.closest('[data-stsub]');
    if (sb) { if (sb.dataset.stsub !== INS.sub) { INS.sub = sb.dataset.stsub; ST.anim = 2; stOpen(); scrollTo({ top: Math.min(scrollY, box.getBoundingClientRect().top + scrollY - 80), behavior: 'instant' }); } return; }
    const r = e.target.closest('[data-strng]');
    if (r) { const d = +r.dataset.strng; if (d === ST.days) return; ST.days = INS.days = d; ST.anim = 1; ST.at = 0; INS.at = 0; MX.at = {}; MX.es = null; stOpen(true); return; }
    if (e.target.closest('#ststaff')) { adStaffSet(!LV.staff); return; }
    const so = e.target.closest('[data-mxsort]');
    if (so) { const [kind, k] = so.dataset.mxsort.split(':'), cur = MX.sort[kind] || []; MX.sort[kind] = cur[0] === k ? [k, -cur[1]] : [k, k === 'name' || k === 'game' || k === 'place' ? 1 : -1]; mxDraw(kind); return; }
    if (e.target.closest('[data-mxall]')) { MX.all = true; mxDraw('use'); return; }
    if (e.target.closest('[data-mxsweep]')) { const b = e.target.closest('[data-mxsweep]'); b.disabled = true; adRpc('admin_housekeep', { p_force: true }).then(() => { toast(auT('Old data removed')); mxLoad('hl', true); }, x => toast(auT(adErr(x)))).then(() => { b.disabled = false; }); return; }
    const es = e.target.closest('[data-mxsig]');
    if (es && !e.target.closest('.mx-dr')) { mxErrOpen(es.dataset.mxsig); return; }
    if (e.target.closest('[data-mxerr]')) { INS.sub = 'err'; stOpen(); return; }
    if (e.target.closest('[data-stcb]')) { const inp = $('#stgq'); if ($('#stgl').hidden) { inp.dataset.typed = ''; inp.focus(); stCombo(true); } else stCombo(false); return; }
    const o = e.target.closest('#stgl [data-g]');
    if (o) { if (o.dataset.g !== ST.game) adConfetti(e); stPick(o.dataset.g); return; }
    const u = e.target.closest('[data-stu]');
    if (u) { const x = (AD.users || []).find(y => y.id === u.dataset.stu); if (x) { adTab('users'); adPanel(x); } return; }
    const g = e.target.closest('[data-stopen]');
    if (g) { e.preventDefault(); go(href(g.dataset.stopen), false); }
  });
  box.addEventListener('mousedown', e => { if (e.target.closest('#stgl, [data-stcb]')) e.preventDefault(); });
  box.addEventListener('input', e => { if (e.target.id === 'stgq') { e.target.dataset.typed = '1'; ST.ci = e.target.value.trim() ? 0 : -1; stCombo(true); } else if (e.target.id === 'mxq') { MX.q = e.target.value; mxDraw('use'); } });
  box.addEventListener('focusin', e => { if (e.target.id === 'stgq') { e.target.select(); stCombo(true); } });
  box.addEventListener('focusout', e => { if (e.target.id === 'stgq') setTimeout(() => { if (document.activeElement !== e.target) { stCombo(false); if (ST.game) e.target.value = adGame(ST.game); e.target.dataset.typed = ''; } }, 120); });
  box.addEventListener('keydown', e => {
    const er = e.target.closest && e.target.closest('tr[data-mxsig]');
    if (er && e.target === er && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); mxErrOpen(er.dataset.mxsig); return; }
    const st = e.target.closest && e.target.closest('.ins-sub');
    if (st && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); const i = ST_SUB.findIndex(x => x[0] === INS.sub); INS.sub = ST_SUB[(i + (e.key === 'ArrowRight' ? 1 : ST_SUB.length - 1)) % ST_SUB.length][0]; ST.anim = 2; stOpen(); const b = box.querySelector('.ins-sub [aria-selected="true"]'); if (b) b.focus(); return; }
    if (e.target.id !== 'stgq') return;
    const ul = $('#stgl'), n = (ST.opts || []).length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (ul.hidden) { stCombo(true); return; } if (!n) return; ST.ci = e.key === 'ArrowDown' ? (ST.ci + 1) % n : (ST.ci - 1 + n) % n; stCombo(true); }
    else if (e.key === 'Enter') { e.preventDefault(); const o = (ST.opts || [])[Math.max(0, ST.ci)]; if (!ul.hidden && o) { if (o.id !== ST.game) adConfetti(e); stPick(o.id); e.target.blur(); } }
    else if (e.key === 'Escape') { if (!ul.hidden) { e.preventDefault(); e.stopPropagation(); stCombo(false); e.target.value = ST.game ? adGame(ST.game) : ''; e.target.dataset.typed = ''; } }
    else if (e.key === 'Home' || e.key === 'End') { if (!ul.hidden && n && e.target.dataset.typed !== '1') { e.preventDefault(); ST.ci = e.key === 'Home' ? 0 : n - 1; stCombo(true); } }
  });
  box.addEventListener('pointermove', e => { const a = e.target.closest('.sx-area'); if (a) stHover(a, e); });
  box.addEventListener('pointerdown', e => { const a = e.target.closest('.sx-area'); if (a) stHover(a, e); });
  box.addEventListener('pointerout', e => { const a = e.target.closest('.sx-area'); if (a && !a.contains(e.relatedTarget)) stUnhover(a); });
  box.addEventListener('pointerover', e => { const dn = e.target.closest('.sx-dn'); if (dn) stSeg(dn, e.target.closest('[data-seg]')); });
  box.addEventListener('pointerout', e => { const dn = e.target.closest('.sx-dn'); if (dn && !dn.contains(e.relatedTarget)) stSeg(dn, null); });
}

function adConfetti(e) {
  if (!motionOK()) return;
  const cv = document.createElement('canvas'), x = cv.getContext('2d'), d = devicePixelRatio || 1, W = innerWidth, H = innerHeight;
  if (!x) return;
  cv.className = 'adcf'; cv.width = W * d; cv.height = H * d; x.scale(d, d);
  document.body.append(cv);
  const el = e && e.target && e.target.closest ? e.target.closest('button, li') || e.target : null, bb = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  const ox = e && e.clientX ? e.clientX : bb ? bb.left + bb.width / 2 : W / 2, oy = e && e.clientY ? e.clientY : bb ? bb.top + bb.height / 2 : H / 3;
  const C = ['#6c5ce7', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#3aa0ff'];
  const P = Array.from({ length: 70 }, () => { const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, s = 5 + Math.random() * 7; return { x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, w: 5 + Math.random() * 5, h: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: C[Math.random() * C.length | 0] }; });
  const t0 = performance.now();
  (function f(t) {
    const k = (t - t0) / 1300;
    x.clearRect(0, 0, W, H);
    if (k >= 1) { cv.remove(); return; }
    x.globalAlpha = 1 - k * k;
    P.forEach(p => { p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); x.restore(); });
    requestAnimationFrame(f);
  })(t0);
}

const INS = { d: null, days: 30, busy: false, sub: 'ov', at: 0 };
const insPct = (a, b) => b ? Math.round(100 * a / b) : 0;
const insMs = v => v == null ? '—' : v >= 1000 ? (v / 1000).toFixed(1) + ' s' : Math.round(v) + ' ms';
const insVit = (k, v) => { const T = { lcp: [2500, 4000], inp: [200, 500], cls: [.1, .25], fcp: [1800, 3000], ttfb: [800, 1800] }[k]; if (v == null) return '<span class="adm-mut">—</span>'; const c = v <= T[0] ? 'ok' : v <= T[1] ? 'warn' : 'bad'; return `<span class="adm-pill ${c}">${esc(k === 'cls' ? String(v) : insMs(v))}</span>`; };
const insCountry = c => { try { return new Intl.DisplayNames([adLang()], { type: 'region' }).of(c) || c; } catch (e) { return c; } };
const insFlag = c => /^[A-Z]{2}$/.test(c) && !/Windows/.test(navigator.userAgent) ? String.fromCodePoint(...[...c].map(x => 127397 + x.charCodeAt(0))) : '';
const insNum = (v, d) => v == null || v === '' || !isFinite(+v) ? '—' : (+v).toLocaleString(adLang(), { maximumFractionDigits: d == null ? 1 : d });
const insDur = v => v == null ? '—' : v >= 3600 ? (v / 3600).toFixed(1) + ' h' : v >= 60 ? Math.round(v / 60) + ' min' : Math.round(v) + ' s';
const insWhy = () => '<p class="ins-why">—</p>';
const insTw = (t, tag, cls) => `<${tag} class="tw${cls ? ' ' + cls : ''}" style="--tn:${Math.max(1, Math.min(60, t.length))}">${esc(t)}</${tag}>`;
const insRows = rows => (rows || []).filter(r => r && +r.n > 0).sort((a, b) => b.n - a.n);
function insCard(title, body, o) {
  o = o || {};
  return `<div class="st-card ins-c${o.cls ? ' ' + o.cls : ''}"${o.tip ? ` title="${esc(auT(o.tip))}"` : ''}><h3>${esc(auT(title))}</h3>${o.cap ? `<p class="sx-note">${esc(o.cap)}</p>` : ''}${body}</div>`;
}
function insKpis(T) {
  return `<div class="ins-kpis">${T.map((t, i) => {
    const v = String(t.v == null ? '—' : t.v), num = Number.isInteger(t.n) && v !== '—';
    return `<div class="ins-k" style="--i:${i}" title="${esc(auT(t.tip || t.k))}"><small>${esc(auT(t.k))}</small>${t.id ? `<b id="${t.id}">${esc(v)}</b>` : num ? `<b data-n="${t.n}" data-f="${t.f || 'l'}">${esc(v)}</b>` : insTw(v, 'b')}${t.s || t.x ? `<em>${esc(t.s || '')}${t.x ? ' ' + t.x : ''}</em>` : ''}</div>`;
  }).join('')}</div>`;
}
function insList(rows, o) {
  o = o || {};
  const R = insRows(rows), max = Math.max(1, ...R.map(r => +r.n)), tot = R.reduce((s, r) => s + (+r.n || 0), 0), k = o.k || 10, nm = o.name || (x => String(x));
  if (!R.length) return insWhy();
  const val = r => o.val ? o.val(r) : stN(r.n) + ' · ' + insPct(r.n, tot) + '%';
  const row = (r, i) => `<div class="ins-b" style="--i:${Math.min(i, 9)}" title="${esc(o.tip ? o.tip(r) : nm(r.k) + ': ' + val(r))}"><span class="ins-bk" translate="no">${o.fmt ? o.fmt(r.k) : esc(r.k)}</span><i><s style="width:${(100 * r.n / max).toFixed(1)}%"></s></i><b>${o.val ? esc(o.val(r)) : `${stN(r.n)}<small> · ${insPct(r.n, tot)}%</small>`}</b></div>`;
  return `<div class="ins-bars">${R.slice(0, k).map(row).join('')}</div>`;
}
function insStk(label, rows, o) {
  o = o || {};
  const R = insRows(rows), tot = R.reduce((s, r) => s + (+r.n || 0), 0), nm = k => o.fmt ? o.fmt(k) : String(k);
  if (!tot) return `<div class="ins-sk ins-sk0" title="${esc(auT(label))}"><span class="ins-skl">${esc(auT(label))}</span><span class="ins-skn">—</span></div>`;
  const top = R.slice(0, 4), rest = R.slice(4).reduce((s, r) => s + +r.n, 0);
  const seg = top.map((r, i) => [nm(r.k), +r.n, 'sx-k' + i]).concat(rest ? [[auT('Other'), rest, 'sx-ko']] : []);
  return `<div class="ins-sk" title="${esc(auT(label) + ': ' + seg.map(([k, n]) => k + ' ' + insPct(n, tot) + '%').join(', '))}"><span class="ins-skl">${esc(auT(label))}</span><span class="ins-skb">${seg.map(([k, n, c]) => `<i class="${c}" style="flex:${n}" title="${esc(k + ': ' + stN(n) + ' · ' + insPct(n, tot) + '%')}"><em translate="no">${esc(k)}<small> · ${insPct(n, tot)}%</small></em></i>`).join('')}</span></div>`;
}
const insStks = L => `<div class="ins-sks">${L.join('')}</div>`;
function insMeters(L) {
  return `<div class="ins-ms">${L.map(([l, s]) => { const n = s && +s.n || 0, p = n ? insPct(s.yes, n) : null; return `<div class="ins-m" title="${esc(auT(l) + ' · ' + (n ? auT('{a} of {b}').replace('{a}', stN(s.yes)).replace('{b}', stN(n)) : auT('Not reported by any browser yet')))}"><span>${esc(auT(l))}</span><i><s style="width:${p || 0}%"></s></i><b>${p == null ? '—' : p + '%'}</b></div>`; }).join('')}</div>`;
}
function insDonut(rows, o) {
  o = o || {};
  const R = insRows(rows), tot = R.reduce((s, r) => s + +r.n, 0);
  if (!tot) return insWhy();
  const top = R.slice(0, 4), rest = R.slice(4).reduce((s, r) => s + +r.n, 0), L = top.map((r, i) => [o.fmt ? o.fmt(r.k) : String(r.k), +r.n, 'sx-k' + i]).concat(rest ? [[auT('Other'), rest, 'sx-ko']] : []);
  let off = 0;
  const gap = L.length > 1 ? 1.2 : 0;
  const segs = L.map(([k, n, c]) => { const p = 100 * n / tot, len = Math.max(.01, p - gap), s = `<circle class="sx-seg ${c}" cx="21" cy="21" r="15.915" pathLength="100" stroke-dasharray="${len.toFixed(2)} ${(100 - len).toFixed(2)}" stroke-dashoffset="${(25 - off).toFixed(2)}" style="--d:${Math.round(off * 7)}ms;--t:${Math.max(90, Math.round(p * 7))}ms"><title>${esc(k + ': ' + stN(n) + ' · ' + Math.round(p) + '%')}</title></circle>`; off += p; return s; }).join('');
  return `<div class="ins-dn"><svg viewBox="0 0 42 42" class="an" role="img" aria-label="${esc(auT(o.label || ''))}"><circle class="sx-track" cx="21" cy="21" r="15.915"/>${segs}</svg><div class="ins-dl">${L.map(([k, n, c]) => `<span class="${c}" title="${esc(k + ': ' + stN(n) + ' · ' + insPct(n, tot) + '%')}"><i></i><em translate="no">${esc(k)}</em><b>${insPct(n, tot)}%</b></span>`).join('')}</div></div>`;
}
const insDns = L => `<div class="ins-dns">${L.map(([t, h]) => `<div><small>${esc(auT(t))}</small>${h}</div>`).join('')}</div>`;
function insHist(rows, o) {
  o = o || {};
  const R = rows || [], max = Math.max(1, ...R.map(r => +r.n || 0)), tot = R.reduce((s, r) => s + (+r.n || 0), 0);
  if (!tot) return insWhy();
  return `<div class="ins-hg">${R.map((r, i) => `<div style="--i:${i}" title="${esc(r.k + ': ' + stN(r.n) + ' · ' + insPct(r.n, tot) + '%')}"><b>${stN(r.n)}</b><i><s style="height:${(100 * (+r.n || 0) / max).toFixed(1)}%"></s></i><small>${esc(r.k)}</small></div>`).join('')}</div>`;
}
function insFunnel(F) {
  const S = [['Visited', F.visited], ['Launched a game', F.launched], ['Played 1 minute', F.played], ['Created an account', F.account], ['Came back another day', F.returned]].map(([k, n]) => [k, +n || 0]), top = S[0][1];
  if (!top) return insWhy();
  return `<div class="ins-fun">${S.map(([k, n], i) => `<div class="ins-fs" style="--i:${i}" title="${esc(auT(k) + ': ' + stN(n) + ' · ' + auT('{p}% of visitors').replace('{p}', insPct(n, top)))}"><span>${esc(auT(k))}</span><i><s style="width:${Math.min(100, 100 * n / top).toFixed(1)}%"></s></i><b>${stN(n)}</b><em>${insPct(n, top)}%</em></div>`).join('')}</div>`;
}
function insHeat(H) {
  const M = {}, max = Math.max(.01, ...(H || []).map(x => +x.v || 0));
  (H || []).forEach(x => { M[x.d + '-' + x.h] = +x.v || 0; });
  const day = d => { try { return new Date(2024, 0, 1 + d).toLocaleDateString(adLang(), { weekday: 'short' }); } catch (e) { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d]; } };
  let h = '<div class="ins-hm" role="img" aria-label="' + esc(auT('Hours played by local weekday and hour')) + '"><span></span>';
  for (let c = 0; c < 24; c++) h += `<span class="ins-hh">${c % 3 ? '' : c}</span>`;
  for (let d = 0; d < 7; d++) { h += `<span class="ins-hd">${esc(day(d))}</span>`; for (let c = 0; c < 24; c++) { const v = M[d + '-' + c] || 0; h += `<i style="--a:${(v / max).toFixed(3)};--i:${d * 24 + c}" title="${esc(day(d) + ' ' + c + ':00 · ' + stH(v))}"></i>`; } }
  return h + '</div>';
}
function insSlots(S) {
  const by = {}, max = Math.max(.001, ...S.map(s => s.imp ? s.clk / s.imp : 0));
  S.forEach(s => (by[s.src] = by[s.src] || []).push(s));
  return Object.entries(by).map(([src, L]) => `<div class="ins-sl"><span>${esc(auT(src === 'grid' ? 'Grid' : src === 'rail' ? 'Row' : src))}</span><div>${L.sort((a, b) => a.pos - b.pos).map((s, i) => { const r = s.imp ? s.clk / s.imp : 0; return `<i class="${r / max > .55 ? 'hi' : ''}" style="--a:${(r / max).toFixed(3)};--i:${i}" title="${esc(auT('Slot {n}').replace('{n}', s.pos + 1) + ': ' + (100 * r).toFixed(1) + '% · ' + auT('{a} clicks of {b} views').replace('{a}', stN(s.clk)).replace('{b}', stN(s.imp)))}"><b>${Math.round(100 * r)}</b></i>`; }).join('')}</div></div>`).join('');
}
const INS_SEC = [['ret', 'Retention'], ['games', 'Games'], ['rl', 'Rocket League'], ['beh', 'Clicks and behaviour'], ['geo', 'Where players are'], ['dev', 'Devices'], ['ses', 'Sessions'], ['scr', 'Screens and display'], ['hw', 'Hardware'], ['ads', 'Ads']];
function insDraw(an) {
  const box = $('#insv');
  if (!box) return;
  if (!motionOK()) an = false;
  const D = INS.d || {}, M = INS.m && !INS.m.__err ? INS.m : {}, PI = INS.p && !INS.p.__err ? INS.p : null, V = D.dev || {}, B = D.behaviour || {}, RL = D.rl || {}, A = D.ads || {};
  const G = Object.assign({}, D.geo || {}, PI ? { hours: PI.hours || [] } : {}), R0 = D.retention || {}, UH = PI ? PI.user_hours || {} : {}, PG = new Map((PI ? PI.games || [] : []).map(x => [x.id, x]));
  const R = Object.assign({}, R0, PI ? { funnel: Object.assign({}, R0.funnel || {}, { played: PI.played }), churn: (R0.churn || []).map(p => UH[p.id] != null ? Object.assign({}, p, { hours: UH[p.id] }) : p) } : {});
  const coh = d => (R.cohort || []).find(x => x.d === d) || {}, S = R.streaks || {}, sc = B.scroll || {}, all = RL.all || {}, LF = M.rl_left || {}, SS = M.sessions || {}, FL = M.flags || {}, EX = M.extra || {};
  const P = (k, a, b, o) => { const p = b ? insPct(a, b) : null; return Object.assign({ k, v: p == null ? '—' : p + '%', n: p, f: 'p' }, o || {}); };
  const K = (k, v, d, tip) => ({ k, v: insNum(v, d), n: v != null && Number.isInteger(+v) ? +v : null, tip });
  const cohT = (d, k) => { const c = coh(d); return c.eligible ? P(k, c.back, c.eligible, { s: auT('of {n} players').replace('{n}', stN(c.eligible)), tip: 'New players seen again exactly that many days after their first visit' }) : { k, v: '—' }; };
  const user = (p, x) => `<button type="button" class="sx-tpr" data-stu="${esc(p.id)}"><span class="pic">${esc((p.name || p.username || '?').charAt(0).toUpperCase())}</span><span class="sx-tpn"><b translate="no">${esc(p.name || p.username || '—')}</b><small>${p.username ? '@' + esc(p.username) : ''}</small></span><em>${esc(x)}</em></button>`;
  const rng = `<div class="sx-bar"><h3>${esc(auT('Player data'))}</h3></div>`;
  const mau = +R.mau || 0, dau = +R.dau || 0;
  const ret = insKpis([
    { k: 'Stickiness', v: mau ? insPct(dau, mau) + '%' : '—', n: mau ? insPct(dau, mau) : null, f: 'p', tip: 'Average players per day divided by players in the last 30 days' },
    cohT(1, 'Back next day'), cohT(7, 'Back after 7 days'), cohT(30, 'Back after 30 days'),
    { k: 'At risk of leaving', v: stN(R.churn_all), n: +R.churn_all || 0, tip: 'Played 3+ days in the last 60, gone for 14+ days' },
    { k: 'On a streak now', v: stN(S.active), n: +S.active || 0, s: S.avg_cur ? auT('average {n} days').replace('{n}', S.avg_cur) : '' }
  ]) + insCard('Funnel', insFunnel(R.funnel || {})) + `<div class="ins-grid">
   ${insCard('Longest streak', insHist([['1 day', S.b1], ['2–3 days', S.b3], ['4–7 days', S.b7], ['8–14 days', S.b14], ['15+ days', S.b15]].map(([k, n]) => ({ k: auT(k), n: +n || 0 }))))}
   ${insCard('Top current streaks', (R.top_streaks || []).length ? `<div class="sx-tp">${R.top_streaks.slice(0, 10).map(p => user(p, auT('{n} days').replace('{n}', p.cur))).join('')}</div>` : insWhy())}
   ${insCard('Players at risk of leaving', (R.churn || []).length ? `<div class="sx-tp">${R.churn.slice(0, 10).map(p => user(p, auT('{d} days · {h} h · {t}').replace('{d}', p.days).replace('{h}', p.hours).replace('{t}', adAgo(p.last)))).join('')}</div>` : insWhy())}
  </div>`;
  const games = (D.games || []).slice(0, 60), votes = new Map((D.votes || []).map(v => [v.id, v])), GD = (ST.d || {}).game_days || {}, MS = M.scores || {};
  const inBar = g => { const I = [['Keyboard', +g.ik || 0, 'sx-k0'], ['Mouse', +g.im || 0, 'sx-k1'], ['Touch', +g.it || 0, 'sx-k2'], ['Controller', +g.ip || 0, 'sx-k3']].filter(x => x[1]), t = I.reduce((s, x) => s + x[1], 0); if (!t) return `<span class="adm-mut" title="${esc(auT('No input recorded'))}">—</span>`; const top = I.slice().sort((a, b) => b[1] - a[1])[0]; return `<span class="ins-in" title="${esc(I.map(x => auT(x[0]) + ' ' + insPct(x[1], t) + '%').join(' · '))}"><span>${I.map(x => `<i class="${x[2]}" style="flex:${x[1]}"></i>`).join('')}</span><small>${esc(auT(top[0]))} ${insPct(top[1], t)}%</small></span>`; };
  const scoreCell = s => { if (!s || !s.n) return `<span class="adm-mut" title="${esc(auT('This game does not report a score'))}">—</span>`; const lo = Math.min(+(s.min != null ? s.min : s.p10 != null ? s.p10 : 0) || 0, +s.p25 || 0), mx = Math.max(+s.max || 0, lo + 1e-9), X = v => Math.max(0, Math.min(100, 100 * ((+v || 0) - lo) / (mx - lo))); return `<span class="ins-sc" title="${esc(auT('Median {m} · middle half {a}–{b} · best {x} · {n} scores').replace('{m}', insNum(s.p50)).replace('{a}', insNum(s.p25)).replace('{b}', insNum(s.p75)).replace('{x}', insNum(s.max)).replace('{n}', stN(s.n)))}"><b>${esc(insNum(s.p50))}</b><i><s style="left:${X(s.p25).toFixed(1)}%;width:${Math.max(2, X(s.p75) - X(s.p25)).toFixed(1)}%"></s><u style="left:${X(s.p50).toFixed(1)}%"></u></i><small>${esc(auT('max {n}').replace('{n}', insNum(s.max)))}</small></span>`; };
  const insFps = g => { const a = Math.round(+g.fps), lo = g.fps_low != null ? Math.round(+g.fps_low) : null, P = v => Math.max(0, Math.min(100, v / 2.4)).toFixed(1); return `<span class="ins-fps" style="--p:${P(a)}" title="${esc(auT('Average {a} FPS, worst 10% {l} FPS, out of 240').replace('{a}', a).replace('{l}', lo == null ? '—' : lo))}"><i><s style="width:${P(a)}%"></s>${lo == null ? '' : `<u style="left:${P(lo)}%"></u>`}</i><span><b>${a}</b><small>${lo == null ? '' : ' · ' + esc(auT('low {n}').replace('{n}', lo))} / 240</small></span></span>`; };
  const mut = (t, v) => `<span class="adm-mut" title="${esc(auT(t))}">${v || '—'}</span>`;
  const gRows = games.map((g, i) => { const vt = votes.get(g.id) || g.votes || {}, l = g.load || {}, q = insPct(g.early, g.n); return `<tr style="--i:${Math.min(i, 14)}"><td><span class="ins-gn">${adCv(g.id, 'ins-cv')}<span translate="no">${esc(adGame(g.id))}</span></span></td><td><span class="ins-gs"><b>${stN(g.n)}</b>${GD[g.id] ? stSpark(GD[g.id], an) : ''}</span></td><td>${g.n ? `<span class="adm-pill ${q > 40 ? 'bad' : q > 20 ? 'warn' : 'ok'}">${q}%</span>` : '—'}</td><td>${(PI ? (PG.has(g.id) ? PG.get(g.id).sec : null) : g.sec) != null ? esc(adHrs(PI ? PG.get(g.id).sec : g.sec)) : '—'}</td><td>${g.fps != null ? insFps(g) : mut('Not measured: the game was closed within 3 seconds')}</td><td>${l.n ? esc(insMs(l.p50)) + ' <span class="adm-mut">/ ' + esc(insMs(l.p90)) + '</span>' : mut('Part of the page, nothing extra to download')}</td><td>${scoreCell(MS[g.id] || g.scores)}</td><td>${g.lv_n ? `${esc(String(g.lv_avg))} <span class="adm-mut">/ ${esc(String(g.lv_max))}</span>` : mut('This game does not show a level')}</td><td>${inBar(g)}</td><td>${vt.up || vt.down ? `<span class="ins-vt"><b>▲ ${vt.up | 0}</b> <span>▼ ${vt.down | 0}</span></span>` : mut('No thumbs yet. Players are asked after a round or after 90 seconds of play.')}</td></tr>`; }).join('');
  const gTab = `<div class="st-card ins-tc"><div class="adm-tw"><table class="adm-t st-t ins-t"><thead><tr>${[['Game'], ['Measured', 'Play sessions that ended normally and sent a summary, with launches per day'], ['Quit < 30 s', 'Share of measured sessions closed within 30 seconds'], ['Avg session', PI ? 'Play time per visit: game open, tab visible and input in the last minute' : ''], ['FPS', 'Frames per second out of 240: average and worst 10%'], ['Load', 'Download time: median / slowest 10%'], ['Scores', 'Final scores: median, middle half and best'], ['Level', 'Level reached at the end: average / highest'], ['Input', 'Main input used while playing'], ['Votes', 'Thumbs up and down']].map(([h, t]) => `<th${t ? ` title="${esc(auT(t))}"` : ''}><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody class="${an ? 'an' : ''}">${gRows || `<tr><td colspan="10">${insWhy()}</td></tr>`}</tbody></table></div></div>`;
  const rl = insKpis([
    { k: 'Matches finished', v: stN(all.n), n: +all.n || 0 },
    P('Win rate', all.wins, all.n),
    { k: 'Left before the end', v: stN(LF.n), n: +LF.n || 0, tip: 'Matches the player left (menu, restart or closing the game) before the clock ran out' },
    P('MVP', all.mvp, all.n), P('Overtime', all.ot, all.n),
    K('Boost used per match', all.n ? all.boost : null, 0)
  ]) + `<div class="ins-grid">
   ${insCard('Per match (average)', all.n ? insList([['Goals', all.goals], ['Assists', all.assists], ['Saves', all.saves], ['Shots', all.shots], ['Demos', all.demos]].map(([k, n]) => ({ k: auT(k), n: +n || 0 })), { val: r => insNum(r.n, 2) }) : insWhy())}
   ${insCard('By bot level', (RL.by_diff || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Bot level', 'Matches', 'Win rate', 'Goal margin'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${RL.by_diff.map(r => `<tr><td>${esc(auT(r.diff))}</td><td>${stN(r.n)}</td><td>${insPct(r.wins, r.n)}%</td><td>${r.margin > 0 ? '+' : ''}${esc(String(r.margin))}</td></tr>`).join('')}</tbody></table></div>` : insWhy())}
   ${insCard('Matches left early', LF.n ? `<div class="ins-kv"><span>${esc(auT('Played before leaving'))}</span><b>${esc(insDur(LF.played))}</b><span>${esc(auT('Goals / saves per match'))}</span><b>${esc(insNum(LF.goals, 2))} / ${esc(insNum(LF.saves, 2))}</b><span>${esc(auT('Winning when they left'))}</span><b>${insPct(LF.ahead, LF.n)}%</b><span>${esc(auT('Losing when they left'))}</span><b>${insPct(LF.behind, LF.n)}%</b></div>` : insWhy())}
   ${insCard('Controls players rebind', insList((D.rebinds || []).map(r => ({ k: `${adGame(r.game)} · ${r.dev === 'pad' ? auT('Controller') : auT('Keyboard')} · ${r.act}${r.to ? ' → ' + r.to : ''}`, n: r.n })), { val: r => stN(r.n) }))}
  </div>`;
  const slots = (B.slots || []).filter(s => s.src !== 'side');
  const ctr = (B.ctr || []).slice(0, 15).map(r => ({ k: r.id, n: r.imp ? 100 * r.clk / r.imp || .0001 : .0001, imp: r.imp, clk: r.clk }));
  const beh = `${insCard('Click rate per slot', slots.length ? insSlots(slots) : insWhy())}<div class="ins-grid">
   ${insCard('How far people scroll the home page', insHist([['Under 25%', sc.b25], ['25–50%', sc.b50], ['50–75%', sc.b75], ['75–90%', sc.b90], ['90–100%', sc.b100]].map(([k, n]) => ({ k: auT(k), n: +n || 0 }))), { cap: sc.n ? auT('Average {n}%').replace('{n}', sc.avg) : '' })}
   ${insCard('Click rate per game', insList(ctr, { fmt: id => adCv(id, 'ins-cv') + esc(adGame(id)), name: adGame, val: r => (r.imp ? (100 * r.clk / r.imp).toFixed(1) : 0) + '%', tip: r => adGame(r.k) + ': ' + (r.imp ? (100 * r.clk / r.imp).toFixed(1) : 0) + '% · ' + auT('{a} clicks of {b} views').replace('{a}', stN(r.clk)).replace('{b}', stN(r.imp)) }))}
   ${insCard('Time on each page and exits', (B.pages || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Page', 'Visits', 'Avg time', 'Left the site here'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${B.pages.map(p => `<tr><td>${esc(auT({ home: 'Home', game: 'Game', legal: 'Legal pages', admin: 'Admin' }[p.v] || p.v))}</td><td>${stN(p.n)}</td><td>${esc(adHrs(p.sec))}</td><td>${stN(p.exits)}<span class="adm-mut"> · ${insPct(p.exits, p.n)}%</span></td></tr>`).join('')}</tbody></table></div>` : insWhy())}
   ${insCard('Rage clicks', insList(B.rage, { val: r => stN(r.n) }), { tip: '3 fast clicks in one spot' })}
   ${insCard('Dead clicks', insList(B.dead, { val: r => stN(r.n) }), { tip: 'Clicks where nothing happened' })}
  </div>`;
  const ctype = M.ctype || G.ctype, spd2 = G.speed || {};
  const geo = `${insCard('When people play', (G.hours || []).length ? insHeat(G.hours) : insWhy(), { tip: 'Hours played by local weekday and hour' })}<div class="ins-grid">
   ${insCard('Countries', insList(G.countries, { fmt: c => `<span class="ins-fl" aria-hidden="true">${insFlag(c)}</span>${esc(insCountry(c))} <span class="adm-mut">${esc(c)}</span>`, name: insCountry }))}
   ${insCard('Regions', insList(G.regions))}
   ${insCard('Network', insDns([['Connection speed class', insDonut(G.net, { label: 'Connection speed class' })], ['Connection type', insDonut(ctype, { label: 'Connection type', fmt: k => k === 'unknown' ? auT('Not reported') : k })]]) + `<div class="ins-kv ins-kv2"><span>${esc(auT('Median download speed'))}</span><b>${spd2.dl != null ? esc(insNum(spd2.dl)) + ' Mb/s' : '—'}</b><span>${esc(auT('Median latency'))}</span><b>${spd2.rtt != null ? esc(insNum(spd2.rtt, 0)) + ' ms' : '—'}</b></div>` + insMeters([['Behind a VPN or datacenter', G.vpn], ['Data saver on', G.save], ['Time zone differs from location', FL.tzm]]))}
   ${insCard('Time zones', insList(G.tz))}
  </div>`;
  const dev = `<div class="ins-grid">
   ${insCard('Operating system versions', insList(V.os))}
   ${insCard('Browser versions', insList(V.browsers))}
   ${insCard('Graphics cards', insList(V.gpus))}
   ${insCard('Phone models', insList(M.models || V.models, { fmt: k => esc(k === 'Unknown model' ? auT('Unknown model') : k) }))}
   ${insCard('Controllers', (V.pads || []).length ? insDonut(V.pads, { label: 'Controllers' }) + `<div class="ins-sp">${insList(V.pad_ids, { k: 3 })}</div>` : insWhy())}
  </div>`;
  const nm = +SS.nm || 0;
  const AC = { user: 'Signed in', guest: 'Guest', none: 'Not signed in' }, RT = { direct: 'Direct', relay: 'Relay', none: 'Offline' }, TH = { system: 'System', dark: 'Dark', light: 'Light' }, NV = { navigate: 'Link or address', reload: 'Reload', back_forward: 'Back or forward', prerender: 'Prerender' };
  const tr = T => k => auT(T[k] || k);
  const ses = (INS.m && INS.m.__err ? `<p class="ins-why">${esc(auT('Run round10_stats.sql in the Supabase SQL editor to see this part.'))}</p>` : '') + insKpis([
    K('Sessions', SS.n, 0, 'Every visit in this period, counted from all events'),
    K('Measured in detail', SS.nm, 0, 'Visits that sent a session summary (needs cookies accepted). The keyboard, mouse and screen numbers come from these.'),
    { k: 'Median session', v: insDur(SS.dur) }, { k: 'Longest 10% of sessions', v: insDur(SS.dur90) },
    { k: 'Median time actually looking', v: insDur(SS.vis), tip: 'Time the tab was visible on screen' }, { k: 'Longest idle moment (median)', v: insDur(SS.idle) },
    { k: 'Sessions with a game', v: SS.played != null ? SS.played + '%' : '—', n: SS.played != null ? +SS.played : null, f: 'p' },
    K('Games per session', SS.games), K('Different games per session', SS.gset),
    K('Keys pressed per session', SS.keys, 0), K('Mouse clicks per session', SS.clicks, 0), K('Screen taps per session', SS.taps, 0)
  ]) + `<div class="ins-grid">
   ${insCard('Other habits per session', `<div class="ins-kv ins-kv2">${[['Tab switches per session', insNum(SS.blur)], ['Went offline', nm && SS.off != null ? SS.off + '%' : '—'], ['JavaScript errors per session', insNum(SS.errs, 2)], ['Sessions using full screen', nm && SS.fs != null ? SS.fs + '%' : '—']].map(([k, v]) => `<span>${esc(auT(k))}</span><b>${esc(v)}</b>`).join('')}</div>`)}
   ${insCard('Session length', insHist((SS.b || []).map(r => ({ k: auT(r.k), n: +r.n || 0 }))))}
   ${insCard('Account, server and theme', insDns([['Account state', insDonut(M.acct, { fmt: tr(AC) })], ['Connection to the accounts server', insDonut(M.route, { fmt: tr(RT) })], ['Theme', insDonut(M.theme, { fmt: tr(TH) })]]))}
   ${insCard('Arrived from', insList(M.refs, { fmt: k => esc(k === 'direct' ? auT('Direct') : k), name: k => k === 'direct' ? auT('Direct') : k }))}
   ${insCard('First page opened', insList(M.land))}
   ${insCard('Page opened by', insDonut(M.navt, { fmt: tr(NV) }))}
   ${insCard('Site language', insDonut(M.slang, { fmt: adLangName }))}
   ${insCard('Why joining a party needed a retry', insList(M.retries))}
  </div>`;
  const PT = { fine: 'Mouse or trackpad', coarse: 'Touch', none: 'None' }, OM = { browser: 'Browser tab', standalone: 'Installed app', fullscreen: 'Full screen', 'minimal-ui': 'Minimal window' }, OR = { 'landscape-primary': 'Landscape', 'landscape-secondary': 'Landscape (flipped)', 'portrait-primary': 'Portrait', 'portrait-secondary': 'Portrait (flipped)' };
  const scr = `<div class="st-card ins-c">${insMeters([['Dark mode preferred', M.dark], ['Reduced motion', M.rmo], ['HDR screen', M.hdr], ['Mouse or trackpad (hover)', M.hov], ['Several screens', M.ext], ['More contrast', FL.con], ['Forced colours', FL.fcol], ['Reduced transparency', FL.rtr]])}${insStks([insStk('Screen resolutions', M.screens), insStk('Browser window sizes', M.viewports), insStk('Pixel density', M.dpr, { fmt: k => k + '×' }), insStk('Browser zoom', M.zoom, { fmt: k => Math.round(+k * 100) + '%' }), insStk('Main pointer', M.pointer, { fmt: tr(PT) }), insStk('Touch points', M.touch), insStk('Orientation', M.orient, { fmt: tr(OR) }), insStk('Colour range', M.gamut), insStk('Colour depth (bits)', M.depth), insStk('Opened as', M.mode, { fmt: tr(OM) })])}</div>`;
  const hw = insCard('Hardware', insStks([insStk('CPU cores', V.cores), insStk('Memory (GB)', V.mem), insStk('Screen refresh rate (Hz)', V.hz), insStk('Keyboard layouts', V.kb, { fmt: k => String(k).toUpperCase() }), insStk('CPU architecture', V.arch), insStk('Main browser language', V.langs)]) + insMeters([['WebGL 2 support', V.gl2], ['WebGPU support', V.wgpu], ['WebAssembly', FL.wasm], ['Automated browsers (bots)', M.bot]]));
  const ads = `<div class="st-card ins-tc">${(A.slots || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Slot', 'Impressions', 'Clicks', 'Click rate', 'Revenue (USD)', 'Per 1,000 views'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${A.slots.map(s => `<tr><td>${esc(s.slot)}</td><td>${stN(s.imp)}</td><td>${stN(s.clk)}</td><td>${s.imp ? (100 * s.clk / s.imp).toFixed(2) : 0}%</td><td>${(+s.usd || 0).toFixed(2)}</td><td>${s.imp ? (1000 * s.usd / s.imp).toFixed(2) : '—'}</td></tr>`).join('')}</tbody></table></div>` : insWhy()}</div>`;
  const body = { ret, games: gTab, rl, beh, geo, dev, ses, scr, hw, ads };
  box.classList.toggle('sx-q', !an);
  if (an) $('#adstats').classList.remove('sx-q', 'sx-r');
  const html = rng + `<div class="ins-main">${INS_SEC.map(([id, t]) => `<section class="ins-sec" id="ins-${id}">${insTw(auT(t), 'h2')}<div class="ins-body">${body[id]}</div></section>`).join('')}</div>`;
  if (an || !box.querySelector('.ins-main')) box.innerHTML = html; else adMorph(box, html);
  if (an) stReveal(box, 'iio');
}
async function insLoad(force) {
  if (!adIsAdmin() || INS.busy) return;
  const box = $('#insv');
  if (!force && INS.d && Date.now() - INS.at < 60000) { insDraw(!!ST.anim); ST.anim = 0; return; }
  INS.busy = true;
  if (!INS.d) box.innerHTML = '<div class="tiles adm-tiles">' + '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(4) + '</div><i class="sk sk-chart"></i><i class="sk sk-chart"></i>';
  box.classList.add('sx-busy');
  stStamp();
  try {
    const one = await adData('insights', INS.days).catch(e => { if (!sbMissing(e)) throw e; return null; });
    const [d, m, pi] = one ? [one.d, one.m, one.p] : await Promise.all([adRpc('admin_insights', { p_days: INS.days }), adRpc('admin_insights_more', { p_days: INS.days }).catch(e => ({ __err: String(e && e.message || e) })), adRpc('admin_play_insights', { p_days: INS.days }).catch(e => ({ __err: String(e && e.message || e) }))]);
    INS.d = d; INS.m = m; INS.p = pi; INS.at = Date.now(); INS.bad = false; insDraw(!INS.drawn || !!ST.anim); INS.drawn = true; ST.anim = 0; adStamp(true);
  }
  catch (e) { INS.bad = true; if (INS.d && force) { adStamp(false); return; } box.innerHTML = `<div class="adm-empty">${esc(/admin_insights|function|404|PGRST/i.test(e.message || '') ? auT('The insights database update is not installed yet. Run round8_insights.sql in the Supabase SQL editor.') : auT('Could not load the stats. Check your connection and try again.'))}</div>`; }
  finally { INS.busy = false; box.classList.remove('sx-busy'); stStamp(); }
}

const MX = { d: {}, at: {}, busy: {}, err: {}, try: {}, sort: { use: ['launches', -1], perf: ['n', -1], err: ['last', -1], par: ['attempts', -1] }, q: '', all: false, es: null, ed: null, eb: false };
const MX_T = { act: 'activity', use: 'usage', perf: 'perf', err: 'errors', par: 'parties', hl: 'health' };
const MX_EVERY = { ov: 20000, act: 60000, use: 45000, perf: 60000, err: 20000, par: 30000, hl: 45000, ins: 120000 };
const MX_VIA = { peerjs: 'Direct, PeerJS signalling', 'rt-p2p': 'Direct, own signalling', 'rt-relay': 'Relayed through the server', unknown: 'Unknown' };
const MX_WHY = { ice: 'No direct route (firewall or strict network)', 'peer-unavailable': 'Party not found or host gone', timeout: 'Timed out', network: 'Network dropped', 'server-error': 'Signalling server error', 'socket-error': 'Signalling connection failed', 'socket-closed': 'Signalling connection closed', disconnected: 'Disconnected from signalling', unknown: 'Unknown', dup: 'Duplicate id', 'unavailable-id': 'Code already in use', 'browser-incompatible': 'Browser cannot connect', 'webrtc': 'WebRTC error' };
const mxWhy = k => auT(MX_WHY[k] || MX_WHY[String(k).replace(/^peer-/, '')] || k);
const mxNone = t => `<p class="ins-why">${esc(auT(t))}</p>`;
const mxPc = (a, b, d) => b > 0 ? (100 * a / b).toFixed(d == null ? 0 : d) + '%' : '—';
const mxT = s => (+s || 0) < 3600 ? insDur(+s || 0) : adHrs(s);
const mxList = (rows, o, empty) => (rows || []).some(r => +r.n > 0) ? insList(rows, o) : mxNone(empty || 'Nothing in this period yet.');
function mxChart(id, title, rows, keys, o, empty) {
  if (!(rows || []).some(r => keys.some(k => +r[k.k] > 0))) return `<div class="st-card sx-c mx-none${o.wide ? ' sx-wide' : ''}"><div class="sx-ch"><div><h3>${esc(auT(title))}</h3></div></div>${mxNone(empty || 'Nothing in this period yet.')}</div>`;
  return stChart(id, title, rows, keys, o);
}
function mxDelta(cur, prev, bad) {
  cur = +cur || 0; prev = +prev || 0;
  if (!prev) return cur ? `<em class="mx-d nw">${esc(auT('new'))}</em>` : '';
  const p = Math.round(100 * (cur - prev) / prev);
  return p ? `<em class="mx-d ${(p > 0) !== !!bad ? 'up' : 'dn'}" title="${esc(auT('Compared with the {n} days before').replace('{n}', ST.days))}">${p > 0 ? '▲' : '▼'} ${Math.abs(p)}%</em>` : `<em class="mx-d">=</em>`;
}
function mxTh(kind, cols) {
  const [sk, sd] = MX.sort[kind] || [];
  return `<thead><tr>${cols.map(([k, l, tip]) => `<th${tip ? ` title="${esc(auT(tip))}"` : ''}>${k ? `<button type="button" data-mxsort="${kind}:${k}" aria-sort="${sk === k ? (sd > 0 ? 'ascending' : 'descending') : 'none'}">${esc(auT(l))}<i></i></button>` : `<span>${esc(auT(l))}</span>`}</th>`).join('')}</tr></thead>`;
}
function mxSorted(kind, L, val) {
  const [k, d] = MX.sort[kind] || [];
  if (!k) return L;
  const v = x => { const y = val ? val(x, k) : x[k]; return y == null ? null : typeof y === 'string' && !isNaN(Date.parse(y)) && /^\d{4}-/.test(y) ? Date.parse(y) : y; };
  return L.slice().sort((a, b) => { const x = v(a), y = v(b); if (x == null || y == null) return (x == null) - (y == null); return (x < y ? -1 : x > y ? 1 : 0) * d; });
}
const mxGame = id => `<span class="ins-gn">${adCv(id, 'ins-cv')}<span translate="no">${esc(adGame(id))}</span></span>`;
function mxSkel() {
  return '<div class="ins-kpis" aria-hidden="true">' + '<div class="ins-k"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(6) + '</div><i class="sk sk-chart"></i><div class="st-card" aria-hidden="true">' + '<i class="sk sk-td"></i>'.repeat(6) + '</div>';
}
async function mxLoad(k, force) {
  const el = $('#stmx');
  if (!el || !adIsAdmin() || !MX_T[k] || MX.busy[k]) return;
  const fresh = MX.d[k] && MX.d[k].days === ST.days && Date.now() - (MX.at[k] || 0) < MX_EVERY[k] / 2;
  if (!force && fresh) { mxDraw(k, el.dataset.k !== k); return; }
  MX.busy[k] = true; MX.try[k] = Date.now();
  const had = MX.d[k] && el.dataset.k === k;
  if (!had) { el.dataset.k = k + ':sk'; el.innerHTML = mxSkel(); }
  stStamp();
  try {
    const d = await adData(MX_T[k], ST.days);
    if (!d || typeof d !== 'object') throw new Error('empty');
    MX.d[k] = d; MX.at[k] = Date.now(); MX.err[k] = null;
    if (INS.sub === k) mxDraw(k, !had);
    adStamp(true);
  } catch (e) {
    MX.err[k] = sbMissing(e) ? 'miss' : 'net';
    if (INS.sub === k && !had) { el.dataset.k = k + ':err'; el.innerHTML = `<div class="adm-empty">${esc(auT(sbMissing(e) ? 'Run round19_analytics.sql in the Supabase SQL editor to see this part.' : 'Could not load the stats. Check your connection and try again.'))}</div>`; }
  } finally { MX.busy[k] = false; stStamp(); }
}
function mxDraw(k, an) {
  const el = $('#stmx'), d = MX.d[k];
  if (!el || !d || INS.sub !== k) return;
  an = an && motionOK();
  const keep = document.activeElement && document.activeElement.id === 'mxq' ? document.activeElement.selectionStart : null, a0 = ST.anim;
  ST.anim = an ? 1 : 0;
  const h = MXV[k](d, an);
  ST.anim = a0;
  el.classList.toggle('sx-q', !an);
  if (an || el.dataset.k !== k) { el.innerHTML = h; el.dataset.k = k; if (an) countUp(el); } else adMorph(el, h);
  if (keep != null) { const q = $('#mxq'); if (q) { q.focus({ preventScroll: true }); try { q.setSelectionRange(keep, keep); } catch (e) {} } }
  lvDraw();
}
function mxHours(vals) {
  const max = Math.max(.01, ...vals.map(v => +v || 0)), pk = vals.indexOf(Math.max(...vals));
  return `<div class="mx-hod" role="img" aria-label="${esc(auT('Average players active in each hour of the day'))}">${vals.map((v, h) => `<div class="${h === pk && +v ? 'pk' : ''}" style="--i:${h}" title="${esc(String(h).padStart(2, '0') + ':00 · ' + insNum(v, 2))}"><i><s style="height:${(100 * (+v || 0) / max).toFixed(1)}%"></s></i><small>${h % 3 ? '' : h}</small></div>`).join('')}</div>`;
}
function mxHeat(H) {
  const M = {}, max = Math.max(.01, ...(H || []).map(x => +x.v || 0));
  (H || []).forEach(x => { M[x.d + '-' + x.h] = +x.v || 0; });
  const day = d => { try { return new Date(2024, 0, 1 + d).toLocaleDateString(adLang(), { weekday: 'short' }); } catch (e) { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d]; } };
  let h = '<div class="ins-hm" role="img" aria-label="' + esc(auT('Players active by weekday and hour')) + '"><span></span>';
  for (let c = 0; c < 24; c++) h += `<span class="ins-hh">${c % 3 ? '' : c}</span>`;
  for (let d = 0; d < 7; d++) { h += `<span class="ins-hd">${esc(day(d))}</span>`; for (let c = 0; c < 24; c++) { const v = M[d + '-' + c] || 0; h += `<i style="--a:${(v / max).toFixed(3)};--i:${d * 24 + c}" title="${esc(day(d) + ' ' + c + ':00 · ' + insNum(v, 1))}"></i>`; } }
  return h + '</div>';
}
const MXV = {
  act(D, an) {
    const N = D.now || {}, S = D.sess || {}, SP = D.split || {}, C = D.cohorts || [], t = k => N[k] || {};
    const sub = o => auT('{n} with an account').replace('{n}', stN(o.accounts));
    const kp = insKpis([
      { k: 'Live now', v: stN(adOnIds().length), id: 'mxln', tip: 'Signed-in players with the site open right now' },
      { k: 'Today', v: stN(t('today').players), n: +t('today').players || 0, s: sub(t('today')), tip: 'Different players seen since midnight (Paris time)' },
      { k: 'Yesterday', v: stN(t('yesterday').players), n: +t('yesterday').players || 0, s: sub(t('yesterday')) },
      { k: 'Last 7 days', v: stN(t('d7').players), n: +t('d7').players || 0, s: sub(t('d7')), x: mxDelta(t('d7').players, t('p7').players) },
      { k: 'Last 30 days', v: stN(t('d30').players), n: +t('d30').players || 0, s: sub(t('d30')), x: mxDelta(t('d30').players, t('p30').players) },
      { k: 'New players', v: stN(SP.new), n: +SP.new || 0, s: SP.players ? auT('{p} of everyone active').replace('{p}', mxPc(SP.new, SP.players)) : '', tip: 'First seen in this period (looking back 400 days)' },
      { k: 'Returning players', v: stN(SP.back), n: +SP.back || 0, s: SP.players ? auT('{p} of everyone active').replace('{p}', mxPc(SP.back, SP.players)) : '', tip: 'Seen before this period and active again in it' }
    ]);
    const rc = (n, v) => v == null ? `<td><span class="adm-mut" title="${esc(auT('Too early to tell'))}">—</span></td>` : `<td><span class="st-hc" style="--a:${n ? Math.min(1, v / n).toFixed(2) : 0}" title="${esc(auT('{a} of {b}').replace('{a}', stN(v)).replace('{b}', stN(n)))}">${n ? Math.round(100 * v / n) : 0}%</span></td>`;
    return `${kp}
    ${mxChart('mxnr', 'Active and new players per day', D.series || [], [{ k: 'active', l: 'Active players' }, { k: 'new', l: 'New players' }, { k: 'back', l: 'Returning players' }], { agg: 'avg', wide: true }, 'No activity in this period yet.')}
    <div class="sx-grid mx-g2">
     ${insCard('Session length', insKpis([{ k: 'Sessions', v: stN(S.n), n: +S.n || 0 }, { k: 'Median', v: insDur(S.med) }, { k: 'Longest 10%', v: insDur(S.p90) }, { k: 'Sessions per player', v: S.players ? insNum(S.n / S.players, 1) : '—' }, { k: 'With a game', v: mxPc(S.played, S.n) }, { k: 'Left in 10 s', v: mxPc(S.short, S.n), tip: 'Sessions shorter than 10 seconds without a game' }]) + insHist((S.b || []).map(r => ({ k: auT(r.k), n: +r.n || 0 }))), { cap: auT('A session ends after 30 minutes without activity.') })}
     ${insCard('Peak hours', (D.hod || []).some(v => +v) ? mxHours(D.hod) + mxHeat(D.hours) : mxNone('No activity in this period yet.'), { cap: auT('Average number of different players active in each hour, Paris time.') })}
    </div>
    ${insCard('Weekly retention', C.length ? `<div class="adm-tw st-re"><table class="adm-t st-t"><thead><tr>${['First week', 'New players', 'Week 1', 'Week 2', 'Week 3', 'Week 4'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${C.map(c => `<tr><td>${esc(stDay(c.wk))}</td><td>${stN(c.n)}</td>${(c.r || []).map(v => rc(+c.n || 0, v)).join('')}</tr>`).join('')}</tbody></table></div>` : mxNone('No players yet.'), { cap: auT('Of the players first seen in a week, the share who came back in each of the following weeks.') })}`;
  },
  use(D, an) {
    const T = D.total || {}, q = MX.q.trim().toLowerCase();
    let L = (D.games || []).filter(g => +g.launches || +g.sec || +g.favs || +g.opens);
    const kp = insKpis([
      { k: 'Game launches', v: stN(T.launches), n: +T.launches || 0, x: mxDelta(T.launches, T.prev), tip: 'Times a game finished loading and started' },
      { k: 'Real plays', v: stN(T.plays), n: +T.plays || 0, s: auT('{p} of launches').replace('{p}', mxPc(T.plays, T.launches)), tip: 'Launches where the player pressed a key, clicked or tapped in the game' },
      { k: 'Time played', v: mxT(T.sec), x: mxDelta(T.sec, T.sec_prev), tip: 'Active time only: game open, tab visible and input in the last minute' },
      { k: 'Average per launch', v: +T.launches ? insDur(T.sec / T.launches) : '—' },
      { k: 'Bounce rate', v: mxPc(T.bounced, T.bn), s: +T.bn ? auT('{a} of {b}').replace('{a}', stN(T.bounced)).replace('{b}', stN(T.bn)) : '', tip: 'Launches left within 10 seconds without any input' },
      { k: 'Rounds finished', v: stN(T.rounds), n: +T.rounds || 0, tip: 'Game-over or results screens reached' },
      { k: 'New records', v: stN(T.recs), n: +T.recs || 0, tip: 'Play sessions that ended with a new personal best' },
      { k: 'Favourites', v: stN(T.favs), n: +T.favs || 0, tip: 'Games currently saved as a favourite' },
      { k: 'Games played', v: stN(T.games), n: +T.games || 0, s: auT('of {n}').replace('{n}', games.length) }
    ]);
    if (q) L = L.filter(g => adGame(g.id).toLowerCase().includes(q) || g.id.includes(q));
    L = mxSorted('use', L, (g, k) => k === 'rate' ? (+g.launches ? g.plays / g.launches : null) : k === 'avg' ? (+g.launches ? g.sec / g.launches : null) : k === 'bounce' ? (+g.bn ? g.bounced / g.bn : null) : k === 'trend' ? (+g.prev ? (g.launches - g.prev) / g.prev : +g.launches ? 9 : null) : k === 'name' ? adGame(g.id).toLowerCase() : +g[k] || 0);
    const more = L.length > 40 && !MX.all && !q;
    const rows = L.slice(0, more ? 40 : L.length).map((g, i) => { const b = +g.bn ? 100 * g.bounced / g.bn : null; return `<tr data-k="u:${esc(g.id)}" style="--i:${Math.min(i, 14)}"><td>${mxGame(g.id)}</td><td><span class="ins-gs"><b>${stN(g.launches)}</b>${g.days ? stSpark(g.days, an) : ''}</span></td><td>${mxDelta(g.launches, g.prev) || '<span class="adm-mut">—</span>'}</td><td>${stN(g.plays)} <span class="adm-mut">· ${mxPc(g.plays, g.launches)}</span></td><td>${stN(g.players)}</td><td>${esc(mxT(g.sec))}</td><td>${+g.launches ? esc(insDur(g.sec / g.launches)) : '—'}</td><td>${b == null ? `<span class="adm-mut" title="${esc(auT('Measured for launches from the updated site only'))}">—</span>` : `<span class="adm-pill ${b > 50 ? 'bad' : b > 25 ? 'warn' : 'ok'}" title="${esc(auT('{a} of {b}').replace('{a}', stN(g.bounced)).replace('{b}', stN(g.bn)))}">${Math.round(b)}%</span>`}</td><td>${stN(g.rounds)}</td><td>${stN(g.recs)}</td><td>${stN(g.favs)}${+g.fav_add ? ` <span class="adm-mut">+${stN(g.fav_add)}</span>` : ''}</td></tr>`; }).join('');
    return `${kp}
    <div class="st-card ins-tc mx-tc"><div class="sx-gh"><h3>${esc(auT('Every game'))}</h3><label class="sx-cb mx-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="mxq" type="search" placeholder="${esc(auT('Search games'))}" aria-label="${esc(auT('Search games'))}" autocomplete="off" spellcheck="false" value="${esc(MX.q)}"></label></div>
    <div class="adm-tw"><table class="adm-t st-t ins-t mx-t">${mxTh('use', [['name', 'Game'], ['launches', 'Launches', 'Times the game started, with launches per day'], ['trend', 'Trend', 'Launches compared with the same number of days before'], ['plays', 'Real plays', 'Launches with input, and their share of all launches'], ['players', 'Players', 'Different players who launched it'], ['sec', 'Time played', 'Active play time'], ['avg', 'Per launch', 'Average active time per launch'], ['bounce', 'Bounce', 'Launches left within 10 seconds without any input'], ['rounds', 'Rounds', 'Game-over or results screens reached'], ['recs', 'Records', 'Play sessions that ended with a new personal best'], ['favs', 'Favourites', 'Players who have it as a favourite now, and added in this period']])}<tbody>${rows || `<tr><td colspan="11">${mxNone(q ? 'No games match.' : 'No game was opened in this period.')}</td></tr>`}</tbody></table></div>${more ? `<button class="btn2 al-more" type="button" data-mxall>${esc(auT('Show all {n}').replace('{n}', L.length))}</button>` : ''}</div>`;
  },
  perf(D, an) {
    const P = D.page || [], all = P.find(p => p.device === 'all') || {}, T = D.total || {}, G = D.games || [];
    const vit = (k, v) => insVit(k, v), ms2 = (a, b) => a == null ? '<span class="adm-mut">—</span>' : `${esc(insMs(b))} <span class="adm-mut">· ${esc(insMs(a))}</span>`;
    const kp = insKpis([
      { k: 'Site ready', v: insMs(all.rdy75), tip: 'Time from opening the page until the site can be used, 3 of 4 visits are faster' },
      { k: 'Page load', v: insMs(all.load75), tip: 'Browser load event, 3 of 4 visits are faster' },
      { k: 'Main content shown', v: insMs(all.lcp75), tip: 'Largest contentful paint, 3 of 4 visits are faster' },
      { k: 'Average frame rate', v: T.fps != null || T.fps_all != null ? insNum(T.fps != null ? T.fps : T.fps_all, 0) + ' fps' : '—', s: +T.n ? auT('{n} play sessions').replace('{n}', stN(T.n)) : '' },
      { k: 'Slow frames', v: T.slow != null ? insNum(T.slow, 1) + '%' : '—', tip: 'Share of frames that took longer than 34 ms (under 30 frames per second)' },
      { k: 'Slow play sessions', v: mxPc(T.bad, T.n), s: +T.n ? auT('{a} of {b}').replace('{a}', stN(T.bad)).replace('{b}', stN(T.n)) : '', tip: 'Sessions under 30 frames per second on average, or with 1 frame in 5 slow' }
    ]);
    const pt = P.length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${[['Device'], ['Visits'], ['Server reply', 'Time to first byte: 3 of 4 visits · median'], ['First paint', 'First contentful paint'], ['Main content', 'Largest contentful paint'], ['Page load', 'Browser load event'], ['Site ready', 'Until the site can be used'], ['Reaction', 'Interaction to next paint'], ['Layout jumps', 'Cumulative layout shift']].map(([h, t]) => `<th${t ? ` title="${esc(auT(t))}"` : ''}><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${P.map(v => `<tr data-k="pg:${esc(v.device)}"><td>${v.device === 'all' ? `<b>${esc(auT('All devices'))}</b>` : esc(auT(ST_DEV[v.device] || v.device))}</td><td>${stN(v.n)}</td><td>${ms2(v.ttfb50, v.ttfb75)}</td><td>${ms2(v.fcp50, v.fcp75)}</td><td>${vit('lcp', v.lcp75)}</td><td>${ms2(v.load50, v.load75)}</td><td>${ms2(v.rdy50, v.rdy75)}</td><td>${vit('inp', v.inp75)}</td><td>${vit('cls', v.cls75)}</td></tr>`).join('')}</tbody></table></div>` : mxNone('No page was measured in this period yet. Timings are sent when a visit ends.');
    const GL = mxSorted('perf', G, (g, k) => k === 'name' ? adGame(g.id).toLowerCase() : k === 'badp' ? (+g.n ? g.bad / g.n : null) : g[k] == null ? null : +g[k]);
    const gt = GL.length ? GL.map((g, i) => `<tr data-k="pf:${esc(g.id)}" style="--i:${Math.min(i, 14)}"><td>${mxGame(g.id)}</td><td>${stN(g.n)}</td><td>${g.fps == null ? '<span class="adm-mut">—</span>' : `<span class="adm-pill ${g.fps < 30 ? 'bad' : g.fps < 50 ? 'warn' : 'ok'}">${Math.round(g.fps)}</span>`}</td><td>${g.fps_p10 == null ? '—' : Math.round(g.fps_p10)}</td><td>${g.slow == null ? `<span class="adm-mut" title="${esc(auT('Measured for sessions from the updated site only'))}">—</span>` : esc(insNum(g.slow, 1)) + '%'}</td><td>${g.freezes == null ? '<span class="adm-mut">—</span>' : esc(insNum(g.freezes, 2))}</td><td>${+g.n ? `<span class="adm-pill ${g.bad / g.n > .3 ? 'bad' : g.bad ? 'warn' : 'ok'}">${mxPc(g.bad, g.n)}</span>` : '—'}</td><td>${+g.ln ? esc(insMs(g.l50)) + ' <span class="adm-mut">· ' + esc(insMs(g.l90)) + '</span>' : `<span class="adm-mut" title="${esc(auT('Part of the page, nothing extra to download'))}">—</span>`}</td></tr>`).join('') : '';
    const worst = G.filter(g => +g.n && (+g.bad || (g.fps != null && g.fps < 50))).sort((a, b) => b.bad / b.n - a.bad / a.n || a.fps - b.fps).slice(0, 8), slowL = G.filter(g => +g.ln).sort((a, b) => b.l90 - a.l90).slice(0, 8);
    const bl = (rows, f) => insList((rows || []).filter(r => +r.n).map(r => ({ k: r.k, n: +r.bad || .0001, t: +r.n, fps: r.fps })), { fmt: f, val: r => `${mxPc(Math.round(r.n), r.t)} · ${Math.round(r.n)}/${r.t}`, tip: r => `${r.k}: ${auT('{a} of {b} sessions were slow').replace('{a}', Math.round(r.n)).replace('{b}', r.t)}${r.fps != null ? ' · ' + Math.round(r.fps) + ' fps' : ''}` });
    return `${kp}
    <div class="st-card ins-tc"><h3>${esc(auT('Page load by device'))}</h3><p class="sx-note">${esc(auT('3 of 4 visits are faster than the first number; the second is the median.'))}</p>${pt}</div>
    ${mxChart('mxpl', 'Site ready and page load per day', D.page_days || [], [{ k: 'rdy', l: 'Site ready' }, { k: 'load', l: 'Page load' }, { k: 'lcp', l: 'Main content' }], { agg: 'avg', wide: true, dec: true, fmt: insMs }, 'No page was measured in this period yet. Timings are sent when a visit ends.')}
    <div class="sx-grid mx-g2">
     ${insCard('Slowest games', worst.length ? insList(worst.map(g => ({ k: g.id, n: 100 * g.bad / g.n || .0001, g })), { fmt: id => adCv(id, 'ins-cv') + esc(adGame(id)), name: adGame, val: r => `${Math.round(r.n)}% · ${r.g.fps == null ? '—' : Math.round(r.g.fps) + ' fps'}` }) : mxNone(+T.n ? 'No game ran slowly in this period.' : 'No frame rates measured yet. They are sent with play time when a game is closed or the tab is hidden.'), { cap: auT('Share of play sessions that were slow, with the average frame rate.') })}
     ${insCard('Slowest to load', slowL.length ? insList(slowL.map(g => ({ k: g.id, n: +g.l90 || .0001, g })), { fmt: id => adCv(id, 'ins-cv') + esc(adGame(id)), name: adGame, val: r => insMs(r.g.l90) + ' · ' + insMs(r.g.l50) }) : mxNone('No game had to be downloaded in this period.'), { cap: auT('Download time: slowest 10% and median.') })}
    </div>
    <div class="st-card ins-tc mx-tc"><h3>${esc(auT('Frame rate and loading by game'))}</h3><div class="adm-tw"><table class="adm-t st-t ins-t mx-t">${mxTh('perf', [['name', 'Game'], ['n', 'Sessions', 'Play sessions with a frame rate measurement'], ['fps', 'Frame rate', 'Average frames per second'], ['fps_p10', 'Worst 10%', 'One session in ten ran below this frame rate'], ['slow', 'Slow frames', 'Share of frames that took longer than 34 ms'], ['freezes', 'Freezes per minute', 'Frames that took longer than 100 ms'], ['badp', 'Slow sessions', 'Sessions under 30 frames per second on average, or with 1 frame in 5 slow'], ['l50', 'Load', 'Download time: median · slowest 10%']])}<tbody>${gt || `<tr><td colspan="8">${mxNone('No frame rates measured yet. They are sent with play time when a game is closed or the tab is hidden.')}</td></tr>`}</tbody></table></div></div>
    <h3 class="mx-h">${esc(auT('Where slow sessions happen'))}</h3>
    <div class="ins-grid">
     ${insCard('By device', +T.n ? bl(D.by_device, k => esc(auT(ST_DEV[k] || k))) : mxNone('No frame rates measured yet.'))}
     ${insCard('By browser', +T.n ? bl(D.by_browser) : mxNone('No frame rates measured yet.'))}
     ${insCard('By system', +T.n ? bl(D.by_os) : mxNone('No frame rates measured yet.'))}
     ${insCard('By graphics card', (D.by_gpu || []).length ? bl(D.by_gpu) : mxNone('No frame rates measured yet.'))}
    </div>`;
  },
  err(D, an) {
    const G = mxSorted('err', D.groups || [], (g, k) => k === 'game' ? adGame(g.game).toLowerCase() : g[k]);
    const kp = insKpis([
      { k: 'Errors', v: stN(D.n), n: +D.n || 0 },
      { k: 'Different errors', v: stN(D.kinds), n: +D.kinds || 0 },
      { k: 'Players affected', v: stN(D.users), n: +D.users || 0 },
      { k: 'Sessions with an error', v: mxPc(D.sessions, D.sess_all, 1), s: auT('{a} of {b}').replace('{a}', stN(D.sessions)).replace('{b}', stN(D.sess_all)) }
    ]);
    const WH = { mount: 'Game start', load: 'Game download', window: 'Script error', promise: 'Failed operation', route: 'Missing page', other: 'Other' };
    const rows = G.map((g, i) => `<tr tabindex="0" role="button" aria-expanded="${MX.es === g.sig}" data-mxsig="${esc(g.sig)}" data-k="e:${esc(g.sig)}" class="${MX.es === g.sig ? 'sel' : ''}" style="--i:${Math.min(i, 14)}"><td>${g.game ? mxGame(g.game) : `<span class="adm-mut">${esc(auT('Site'))}</span>`}</td><td class="mx-msg" title="${esc(g.msg || '')}"><code translate="no">${esc(String(g.msg || '—').slice(0, 140))}</code>${g.src ? `<small translate="no">${esc(g.src)}${g.line ? ':' + esc(String(g.line)) : ''}</small>` : ''}</td><td>${esc(auT(WH[g.place] || g.place || 'Other'))}</td><td><b>${stN(g.n)}</b>${+g.n24 ? ` <span class="adm-pill warn" title="${esc(auT('In the last 24 hours'))}">+${stN(g.n24)}</span>` : ''}</td><td>${stN(g.users)}</td><td title="${esc(adDate(g.first, 1))}">${esc(adDate(g.first))}</td><td title="${esc(adDate(g.last, 1))}"><span data-rt="${esc(g.last)}">${esc(adAgo(g.last))}</span></td></tr>${MX.es === g.sig ? `<tr class="mx-dr" data-k="ed:${esc(g.sig)}"><td colspan="7">${mxErrDetail()}</td></tr>` : ''}`).join('');
    return `${kp}
    ${mxChart('mxer', 'Errors per day', D.by_day || [], [{ k: 'n', l: 'Errors' }], { agg: 'sum', type: 'bar', wide: true }, 'No errors in this period.')}
    <div class="st-card ins-tc mx-tc"><h3>${esc(auT('Errors by game and message'))}</h3><p class="sx-note">${esc(auT('Messages that only differ by a number are grouped. Choose a row to see who was affected and on which devices.'))}</p><div class="adm-tw"><table class="adm-t st-t ins-t mx-t mx-et">${mxTh('err', [['game', 'Game'], [null, 'Message'], ['place', 'Where'], ['n', 'Count'], ['users', 'Players'], ['first', 'First seen'], ['last', 'Last seen']])}<tbody>${rows || `<tr><td colspan="7">${mxNone('No errors in this period.')}</td></tr>`}</tbody></table></div></div>
    <div class="ins-grid">
     ${insCard('By kind', mxList((D.by_where || []).map(r => ({ k: auT(WH[r.k] || r.k), n: r.n })), null, 'No errors in this period.'))}
     ${insCard('Games with the most errors', mxList((D.by_game || []).map(r => ({ k: r.id, n: r.n, u: r.users })), { fmt: id => adCv(id, 'ins-cv') + esc(adGame(id)), name: adGame, val: r => stN(r.n) + ' · ' + auT('{n} players').replace('{n}', stN(r.u)) }, 'No errors in this period.'))}
    </div>`;
  },
  par(D, an) {
    const ms = D.ms || {}, W = D.waited || {}, BG = mxSorted('par', D.by_game || [], (g, k) => k === 'name' ? adGame(g.id).toLowerCase() : k === 'rate' ? (+g.attempts ? g.joined / g.attempts : null) : k === 'relayp' ? (+g.joined ? g.relay / g.joined : null) : g[k] == null ? null : +g[k]);
    const kp = insKpis([
      { k: 'Parties created', v: stN(D.creates), n: +D.creates || 0, s: auT('{n} hosts').replace('{n}', stN(D.hosts)) },
      { k: 'Join attempts', v: stN(D.attempts), n: +D.attempts || 0, s: auT('{n} retries').replace('{n}', stN(D.retries)), tip: 'Times a player tried to join a party; retries within one try count once' },
      { k: 'Joined', v: mxPc(D.joined, D.attempts), s: auT('{a} of {b}').replace('{a}', stN(D.joined)).replace('{b}', stN(D.attempts)), tip: 'Share of join attempts that ended connected' },
      { k: 'Connected first try', v: mxPc(D.first_try, D.joined), tip: 'Joins that needed no retry' },
      { k: 'Time to connect', v: +ms.n ? insMs(ms.p50) : '—', s: +ms.n ? auT('slowest 10%: {t}').replace('{t}', insMs(ms.p90)) : '', tip: 'From the last click in the lobby until connected (median)' },
      { k: 'Games started', v: stN(D.plays), n: +D.plays || 0, s: D.play_players ? auT('{n} players on average').replace('{n}', insNum(D.play_players, 1)) : '' }
    ]);
    const rows = BG.map((g, i) => `<tr data-k="pg:${esc(g.id)}" style="--i:${Math.min(i, 14)}"><td>${mxGame(g.id)}</td><td>${stN(g.creates)}</td><td>${stN(g.attempts)}</td><td>${+g.attempts ? `<span class="adm-pill ${g.joined / g.attempts < .7 ? 'bad' : g.joined / g.attempts < .9 ? 'warn' : 'ok'}">${mxPc(g.joined, g.attempts)}</span>` : '—'}</td><td>${stN(g.retried)}</td><td>${stN(g.failed)}</td><td>${+g.joined ? mxPc(g.relay, g.joined) : '—'}</td><td>${g.ms50 == null ? '—' : esc(insMs(g.ms50))}</td><td>${stN(g.plays)}</td></tr>`).join('');
    return `${kp}
    ${mxChart('mxpd', 'Join attempts per day', D.by_day || [], [{ k: 'attempts', l: 'Join attempts' }, { k: 'joined', l: 'Joined' }, { k: 'creates', l: 'Parties created' }], { agg: 'sum', wide: true }, 'No online party in this period.')}
    <div class="ins-grid">
     ${insCard('Route used', (D.routes || []).length ? insDonut((D.routes || []).map(r => ({ k: auT(MX_VIA[r.k] || r.k), n: r.n })), { label: 'Route used' }) : mxNone('Nobody joined a party in this period.'), { cap: auT('How joined players reached the host.') })}
     ${insCard('Why a try failed', mxList((D.why || []).map(r => ({ k: mxWhy(r.k), n: r.n })), null, 'No failed try in this period.'), { cap: auT('Each failed try that was retried.') })}
     ${insCard('Why players gave up', mxList((D.fail_why || []).map(r => ({ k: mxWhy(r.k), n: r.n })), null, 'Nobody gave up in this period.'), { cap: auT('Last reason before a join attempt ended without connecting. A party that is full or refused at once is not counted.') })}
     ${insCard('Time to connect by route', mxList((D.ms_route || []).map(r => ({ k: auT(MX_VIA[r.k] || r.k), n: +r.p50 || .0001, c: r.n })), { val: r => insMs(r.n) + ' · ' + stN(r.c) }, 'Not measured yet. It is recorded by the updated site when a player joins from the lobby.'), { cap: +W.n ? auT('Joins that needed a retry lost {t} on average.').replace('{t}', insDur(W.p50)) : '' })}
     ${insCard('Happening now', `<div class="st-list" id="mxpl">${mxPartyLive()}</div>`)}
    </div>
    <div class="st-card ins-tc mx-tc"><h3>${esc(auT('By game'))}</h3><div class="adm-tw"><table class="adm-t st-t ins-t mx-t">${mxTh('par', [['name', 'Game'], ['creates', 'Created'], ['attempts', 'Join attempts'], ['rate', 'Joined'], ['retried', 'Needed a retry'], ['failed', 'Gave up'], ['relayp', 'Relayed', 'Share of joins that went through the server relay'], ['ms50', 'Time to connect'], ['plays', 'Games started']])}<tbody>${rows || `<tr><td colspan="9">${mxNone('No online party in this period.')}</td></tr>`}</tbody></table></div></div>`;
  },
  hl(D, an) {
    const R = D.req || {}, LT = D.limit_total || {}, RT0 = D.routes || [], rt = k => (RT0.find(r => r.k === k) || {}).n || 0, rtAll = RT0.reduce((s, r) => s + (+r.n || 0), 0), SW = D.sweep || {}, EX = D.excluded || {}, DN = D.down || {};
    const kp = insKpis([
      { k: 'Sessions through the relay', v: mxPc(rt('relay'), rtAll), s: rtAll ? auT('{a} of {b}').replace('{a}', stN(rt('relay'))).replace('{b}', stN(rtAll)) : '', tip: 'Sessions that reached the accounts server through the relay instead of directly' },
      { k: 'Requests', v: stN(R.n), n: +R.n || 0, s: +R.sessions ? auT('{n} sessions measured').replace('{n}', stN(R.sessions)) : '', tip: 'Requests to the accounts server counted by browsers that accepted analytics' },
      { k: 'Failed requests', v: mxPc((+R.failed || 0) + (+R.s5 || 0), R.n, 2), s: auT('{a} lost · {b} server errors').replace('{a}', stN(R.failed)).replace('{b}', stN(R.s5)), tip: 'Requests that never got an answer, or got a server error' },
      { k: 'Rejected requests', v: stN(R.s4), n: +R.s4 || 0, tip: 'Answered with a 4xx status, for example a wrong password or a missing permission' },
      { k: 'Rate-limit hits', v: stN(LT.full), n: +LT.full || 0, s: auT('{n} players · last {d} days').replace('{n}', stN(LT.who)).replace('{d}', LT.days || 8), tip: 'Times a player reached a limit on the server' },
      { k: 'Average response', v: R.ms != null ? insMs(R.ms) : '—' },
      { k: 'Sessions that went offline', v: mxPc(R.offline, R.all), tip: 'The browser reported losing its connection at least once' },
      { k: 'Games that failed to load', v: stN(D.game_fail), n: +D.game_fail || 0 }
    ]);
    const lim = (D.limits || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Limit', 'Requests', 'Times at the limit', 'Players'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${D.limits.map(l => `<tr data-k="lm:${esc(l.k)}"><td>${esc(auT(AB_T[l.k] || l.k))}</td><td>${stN(l.n)}</td><td>${+l.full ? adPill(stN(l.full), 'warn') : '0'}</td><td>${stN(l.who)}</td></tr>`).join('')}</tbody></table></div>` : mxNone('Nobody came close to a limit.');
    const del = SW.deleted && typeof SW.deleted === 'object' ? Object.values(SW.deleted).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0) : 0;
    return `<div class="st-card mx-now" id="mxhl">${mxHealthLive()}</div>
    ${kp}
    ${mxChart('mxrt', 'Sessions by route per day', D.by_day || [], [{ k: 'direct', l: 'Direct' }, { k: 'relay', l: 'Relay' }, { k: 'none', l: 'No accounts server' }], { agg: 'sum', wide: true })}
    <div class="sx-grid mx-g2">
     ${mxChart('mxfr', 'Failed requests per day', D.by_day || [], [{ k: 'bad', l: 'Failed requests' }], { agg: 'sum', type: 'bar' }, +R.n ? 'No request failed in this period.' : 'Not measured yet. Requests are counted by the updated site.')}
     ${mxChart('mxrl', 'Rate-limit hits per day', D.by_day || [], [{ k: 'limited', l: 'Times at the limit' }], { agg: 'sum', type: 'bar' }, 'Nobody reached a limit.')}
    </div>
    <div class="sx-grid mx-g2">
     <div class="st-card ins-c"><h3>${esc(auT('Rate limits'))}</h3><p class="sx-note">${esc(auT('Last {d} days. Staff are not limited.').replace('{d}', LT.days || 8))}</p>${lim}</div>
     <div class="st-card ins-c"><h3>${esc(auT('Data housekeeping'))}</h3><div class="ins-kv ins-kv2"><span>${esc(auT('Old data last removed'))}</span><b>${SW.at && Date.parse(SW.at) > 1e9 ? `<span data-rt="${esc(SW.at)}">${esc(adAgo(SW.at))}</span>` : esc(auT('Never'))}</b><span>${esc(auT('Rows removed that time'))}</span><b>${stN(del)}</b><span>${esc(auT('Nightly job in the database'))}</span><b>${esc(auT(SW.cron ? 'On' : 'Off'))}</b><span>${esc(auT('Events from test accounts, left out'))}</span><b>${stN(EX.test)}</b><span>${esc(auT('Events from staff'))}</span><b>${stN(EX.staff)} <span class="adm-mut">· ${esc(auT(LV.staff ? 'counted' : 'left out'))}</span></b><span>${esc(auT('Accounts server unreachable at start'))}</span><b>${+DN.n ? mxPc(DN.yes, DN.n, 1) : '—'}</b></div><p class="sx-note">${esc(auT(SW.cron ? 'Data past its keeping time is removed every night.' : 'Data past its keeping time is removed once a day when someone uses the site. Turn on pg_cron in Supabase and run round19_analytics.sql again for a nightly job.'))}</p><button class="btn2" type="button" data-mxsweep>${esc(auT('Remove old data now'))}</button></div>
    </div>`;
  }
};
function mxPartyLive() {
  const P = LV.d && Array.isArray(LV.d.party) ? LV.d.party : [], U = new Map((AD.users || []).map(u => [u.id, u])), on = adOnIds().map(id => adOn(id)).filter(p => p && p.p);
  const K = { create: 'opened a party', join: 'joined a party', retry: 'is retrying', play: 'started the game' };
  const head = `<div class="st-kv" data-k="pn"><span>${esc(auT('Players in a party right now'))}</span><b>${stN(on.length)}</b></div>`;
  return head + (P.length ? P.map(e => { const u = U.get(e.u), nm = u ? u.display_name || u.username || u.email : auT('A player'); return `<div class="st-err mx-pe" data-k="pe:${+e.id}"><b>${esc(nm)} <span>${esc(auT(K[e.k] || e.k))}</span></b><span>${esc(adGame(e.g))}${e.via ? ' · ' + esc(auT(MX_VIA[e.via] || e.via)) : ''}${e.why ? ' · ' + esc(mxWhy(e.why)) : ''}${e.ms ? ' · ' + esc(insMs(e.ms)) : ''}</span><small data-rt="${esc(e.at)}">${esc(adAgo(e.at))}</small></div>`; }).join('') : mxNone('No party activity in the last 30 minutes.'));
}
function mxHealthLive() {
  const route = SB.on ? (SBN.best() === SUPABASE_DIRECT ? 'Direct' : 'Relay') : 'Off', ok = lvOk(), E = LV.d && LV.d.ev || {};
  const cell = (k, v, c) => `<div data-k="h:${esc(k)}"><small>${esc(auT(k))}</small><b class="${c || ''}">${v}</b></div>`;
  return `<h3><i class="adm-dot${ok ? '' : ' off'}"></i>${esc(auT('Right now'))}</h3><div class="mx-nowg">${cell('This browser reaches the server', esc(auT(route)), route === 'Relay' ? 'warn' : '')}${cell('Live updates', esc(auT(ok ? 'Working' : LV.miss ? 'Not installed' : 'Reconnecting…')), ok ? 'ok' : 'bad')}${cell('Server reply time', ok ? esc(insMs(LV.ms)) : '—', ok && LV.ms > 800 ? 'warn' : '')}${cell('Events in the last minute', stN(E.m1))}${cell('Sessions in the last minute', stN(E.ses))}${cell('Game launches, 5 minutes', stN(E.lau))}${cell('Errors, 5 minutes', stN(E.err), +E.err ? 'bad' : '')}${cell('Rate-limit hits, 5 minutes', stN(E.rl), +E.rl ? 'warn' : '')}</div>`;
}
function mxErrDetail() {
  const d = MX.ed;
  if (MX.eb || !d) return '<div class="mx-ed"><i class="sk sk-td"></i><i class="sk sk-td"></i><i class="sk sk-td"></i></div>';
  if (d.__err) return `<div class="mx-ed adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`;
  const R = d.rows || [], ls = (t, L) => `<div><small>${esc(auT(t))}</small>${(L || []).length ? L.map(x => `<span class="adm-pill">${esc(t === 'Devices' ? auT(ST_DEV[x.k] || x.k) : x.k)} · ${stN(x.n)}</span>`).join('') : '—'}</div>`;
  return `<div class="mx-ed"><div class="mx-edh">${ls('Devices', d.devices)}${ls('Browsers', d.browsers)}${ls('Systems', d.os)}</div>
   <code class="mx-full" translate="no">${esc(R[0] ? R[0].msg || '' : '')}</code>
   <div class="mx-occ">${R.map(r => `<div class="mx-or"><time title="${esc(adDate(r.at, 1))}">${esc(adDate(r.at, 1))}</time><span>${r.user && (AD.users || []).some(u => u.id === r.user) ? `<button type="button" class="al-u" data-stu="${esc(r.user)}">${esc(r.username ? '@' + r.username : r.name || auT('Player'))}</button>` : `<span class="adm-mut">${esc(auT(r.user ? 'A player' : 'Not signed in'))}</span>`}</span><span translate="no">${esc([auT(ST_DEV[r.device] || r.device || ''), r.os, r.browser].filter(Boolean).join(' · '))}</span><span class="adm-mut" translate="no">${esc([r.src ? r.src + (r.line ? ':' + r.line : '') : '', r.gpu].filter(Boolean).join(' · '))}</span></div>`).join('')}</div>
   ${+d.n > R.length ? `<p class="sx-note">${esc(auT('Showing the latest {a} of {b}.').replace('{a}', R.length).replace('{b}', stN(d.n)))}</p>` : ''}</div>`;
}
async function mxErrOpen(sig) {
  if (MX.es === sig) { MX.es = null; MX.ed = null; mxDraw('err'); return; }
  MX.es = sig; MX.ed = null; MX.eb = true;
  mxDraw('err');
  try { const d = await adData('error', ST.days, sig); if (MX.es !== sig) return; MX.ed = d || { __err: 1 }; }
  catch (e) { if (MX.es !== sig) return; MX.ed = { __err: 1 }; }
  MX.eb = false;
  mxDraw('err');
}

const DG_N = 200;
const DGV = { list: null, acc: null, busy: false, cur: null, info: null, rows: [], total: 0, before: 0, after: 0, kinds: new Set(), bad: false, q: '', open: new Set(), seq: 0, lb: false, at: 0, dl: false };
const DG_K = [['err', 'Errors', ['err']], ['log', 'Logs', ['log']], ['req', 'Requests', ['req', 'res']], ['ws', 'WebSocket', ['ws', 'rt']], ['dc', 'Data channel', ['dc']], ['pc', 'Connection', ['pc', 'net']], ['fps', 'Frame rate', ['fps', 'perf']], ['in', 'Inputs', ['in']], ['etc', 'Other', ['boot', 'life', 'game', 'cfg', 'track']]];
const dgCut = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) + '…' : s; };
const dgPath = u => { try { const x = new URL(u, location.href); return (x.origin === location.origin ? '' : x.host) + x.pathname + (x.search ? '?…' : ''); } catch (e) { return String(u || ''); } };
function dgSum(k, d) {
  d = d && typeof d === 'object' ? d : {};
  if (k === 'err') return d.kind === 'resource' ? auT('Could not load {s}').replace('{s}', dgPath(d.src)) : dgCut(d.m, 220) + (d.src ? ' · ' + dgPath(d.src) + (d.line ? ':' + d.line : '') : '');
  if (k === 'log') return dgCut((d.a || []).join(' '), 240);
  if (k === 'req') return (d.m || 'GET') + ' ' + dgPath(d.u);
  if (k === 'res') return (d.e ? auT('Failed') + ' · ' + dgCut(d.e, 120) : d.s) + ' · ' + insMs(d.ms) + (d.len ? ' · ' + stN(d.len) + ' B' : '');
  if (k === 'ws') return '#' + d.id + ' ' + d.a + (d.u ? ' ' + dgPath(d.u) : '') + (d.code ? ' ' + d.code : '') + (d.n != null && (d.a === 'rx' || d.a === 'tx') ? ' · ' + stN(d.n) + ' B' : '') + (d.b ? ' · ' + dgCut(d.b, 140) : '');
  if (k === 'dc') return '#' + d.pc + ' ' + (d.ch || '') + ' ' + d.a + (d.a === 'sum' ? ' · ↑' + stN(d.tx) + ' ↓' + stN(d.rx) : d.n != null ? ' · ' + stN(d.n) + ' B' : '') + (d.b ? ' · ' + dgCut(d.b, 140) : '') + (d.m ? ' · ' + dgCut(d.m, 120) : '');
  if (k === 'pc') return '#' + d.id + ' ' + d.a + (d.s ? ' ' + d.s : '') + (d.ms != null ? ' · ' + insMs(d.ms) : '') + (d.a === 'pair' ? ' · ' + [d.local, d.remote, d.relay].filter(Boolean).join(' → ') + (d.rtt != null ? ' · ' + Math.round(d.rtt * 1000) + ' ms' : '') : '') + (d.c ? ' · ' + dgCut(d.c, 120) : '') + (d.m ? ' · ' + dgCut(d.m, 100) : '');
  if (k === 'net') return dgCut(d.a + ' ' + Object.entries(d).filter(x => x[0] !== 'a').map(x => x[0] + '=' + (typeof x[1] === 'object' ? JSON.stringify(x[1]) : x[1])).join(' '), 220);
  if (k === 'rt') return dgCut([d.k, d.m, d.d].filter(Boolean).join(' · '), 220);
  if (k === 'fps') return (d.g || '') + ' · ' + d.fps + ' fps · ' + auT('worst frame {n} ms').replace('{n}', d.worst) + (d.slow ? ' · ' + auT('{n} slow').replace('{n}', d.slow) : '') + (d.heap ? ' · ' + d.heap + ' MB' : '');
  if (k === 'perf') return d.a + (d.u ? ' ' + dgPath(d.u) : '') + (d.ms != null ? ' · ' + insMs(d.ms) : '') + (d.kb ? ' · ' + d.kb + ' kB' : '') + (d.at != null && d.ms == null ? ' · ' + insMs(d.at) : '');
  if (k === 'in') return d.a + ' ' + (d.c || (d.x != null ? d.x + ',' + d.y + (d.p ? ' ' + d.p : '') : ''));
  if (k === 'track') return (d.e || '') + (d.p ? ' ' + dgCut(JSON.stringify(d.p), 180) : '');
  if (k === 'life') return d.a + (d.s ? ' ' + d.s : '') + (d.u ? ' ' + d.u : '');
  if (k === 'game') return d.id ? auT('Opened {g}').replace('{g}', adGame(d.id)) : auT('Closed the game');
  if (k === 'boot') return dgCut((d.u || '') + ' · ' + (d.ua || ''), 220);
  return dgCut(JSON.stringify(d), 220);
}
function dgBad(k, d) {
  d = d || {};
  return k === 'err' || (k === 'log' && (d.l === 'error' || d.l === 'warn')) || (k === 'res' && (d.e != null || +d.s >= 400)) || (k === 'ws' && (d.a === 'error' || (d.a === 'close' && d.clean === false))) || (k === 'pc' && (d.s === 'failed' || d.s === 'disconnected' || d.a === 'canderr')) || (k === 'dc' && d.a === 'error') || (k === 'net' && /fail|lost|error|timeout/.test(String(d.a))) || (k === 'life' && d.a === 'offline');
}
function dgShell() {
  const box = $('#addiag');
  if (!box || $('#dgl')) return;
  box.innerHTML = `<div class="dg">
   <div class="dg-side">
    <div class="st-card dg-ses"><div class="sx-ch"><div><h3>${esc(auT('Recorded sessions'))}</h3></div><button class="btn2 danger" type="button" data-dgclear="all">${esc(auT('Delete all'))}</button></div><div class="dg-list" id="dgl" role="list"></div></div>
    <div class="st-card dg-acc"><h3>${esc(auT('Recorded accounts'))}</h3><p class="sx-note">${esc(auT('Only accounts switched on here are recorded. Use it for test accounts, never for real players.'))}</p><div id="dga"></div></div>
   </div>
   <div class="st-card dg-main" id="dgm"><div class="adm-empty">${esc(auT('Choose a session to see what happened in it.'))}</div></div>
  </div>`;
}
function dgOpen() {
  dgShell();
  dgLoad();
  dgAcc();
}
async function dgAcc() {
  const box = $('#dga');
  if (!box) return;
  if (!DGV.acc) box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i>';
  try { const r = await adRpc('admin_diag_accounts'); DGV.acc = Array.isArray(r) ? r : []; DGV.accErr = null; }
  catch (e) { if (!DGV.acc) DGV.accErr = sbMissing(e) ? 'miss' : 'net'; }
  dgAccDraw();
}
function dgAccDraw() {
  const box = $('#dga'), A = DGV.acc;
  if (!box) return;
  if (!A) { box.innerHTML = `<p class="ins-why">${esc(auT(DGV.accErr === 'miss' ? 'Run round17_platform.sql in the Supabase SQL editor to choose which accounts are recorded.' : 'Could not load. Check your connection and try again.'))}</p>`; return; }
  adMorph(box, A.length ? A.map(a => `<div class="dg-ar" data-k="da:${esc(a.user_id)}"><div><b translate="no">${esc(a.username ? '@' + a.username : a.email || '')}</b><small>${a.note ? esc(a.note) + ' · ' : ''}${a.last_event ? esc(auT('last recorded {t}').replace('{t}', adAgo(a.last_event))) : esc(auT('nothing recorded yet'))}</small></div><button class="sw${a.diag ? ' on' : ''}" type="button" role="switch" aria-checked="${!!a.diag}" data-dgacc="${esc(a.user_id)}" aria-label="${esc(auT('Record {u}').replace('{u}', a.username || a.email || ''))}"></button></div>${DGV.ask === a.user_id ? `<div class="sfg-cf dg-ask" data-k="dq:${esc(a.user_id)}"><span>${esc(auT('Everything this account does on the site will be recorded: requests, messages sent over the network, key presses in games and errors. Only switch it on for an account you test with.'))}</span><div class="sfg-b"><button class="btn2" type="button" data-dgask="no">${esc(auT('Cancel'))}</button><button class="btn2 pri" type="button" data-dgask="yes">${esc(auT('Start recording'))}</button></div></div>` : ''}`).join('') : `<p class="ins-why">${esc(auT('No account created in the dashboard yet. Create one with the + button in the Users tab.'))}</p>`);
}
async function dgAccSet(uid, on) {
  const a = (DGV.acc || []).find(x => x.user_id === uid);
  if (!a) return;
  if (on && DGV.ask !== uid) { DGV.ask = uid; dgAccDraw(); return; }
  DGV.ask = null;
  const was = a.diag;
  a.diag = on; dgAccDraw();
  try { await adRpc('admin_set_diag', { p_uid: uid, p_on: on }); toast(auT(on ? 'Recording switched on' : 'Recording switched off')); rtSend(uid, { t: 'status' }); }
  catch (e) { a.diag = was; dgAccDraw(); toast(auT(adErr(e))); }
}
async function dgLoad(quiet) {
  const box = $('#dgl');
  if (!box || DGV.lb) return;
  DGV.lb = true;
  if (!DGV.list) box.innerHTML = '<i class="sk sk-msg"></i>'.repeat(3);
  try {
    const r = await adRpc('admin_diag_sessions', { p_uid: null, p_limit: 200 });
    DGV.list = Array.isArray(r) ? r : []; DGV.at = Date.now();
    dgList();
  } catch (e) { if (!DGV.list) box.innerHTML = `<div class="adm-empty">${esc(auT(sbMissing(e) ? 'Run round17_platform.sql in the Supabase SQL editor to see recorded sessions.' : 'Could not load. Check your connection and try again.'))}</div>`; }
  DGV.lb = false;
}
function dgList() {
  const box = $('#dgl'), L = DGV.list || [];
  if (!box) return;
  const h = L.length ? L.map(s => { const dur = (Date.parse(s.last_at) - Date.parse(s.first_at)) / 1000, on = DGV.cur && DGV.cur.sid === s.sid; return `<button type="button" class="dg-s${on ? ' on' : ''}" role="listitem" data-dgsid="${esc(s.sid)}" data-k="ds:${esc(s.sid)}" aria-current="${on}"><b translate="no">${esc(s.username ? '@' + s.username : String(s.user_id).slice(0, 8))}</b><span data-rt="${esc(s.last_at)}">${esc(adAgo(s.last_at))}</span><small>${esc(adDate(s.first_at, 1))} · ${esc(insDur(dur))} · ${esc(auT('{n} events').replace('{n}', stN(s.events)))}</small><small>${+s.errors ? `<i class="adm-pill bad">${esc(auT('{n} errors').replace('{n}', stN(s.errors)))}</i>` : ''}${+s.failed_requests ? `<i class="adm-pill warn">${esc(auT('{n} failed requests').replace('{n}', stN(s.failed_requests)))}</i>` : ''}${(s.games || []).slice(0, 3).map(g => `<i class="adm-pill">${esc(adGame(g))}</i>`).join('')}</small></button>`; }).join('') : `<div class="adm-empty">${esc(auT('Nothing recorded yet. Sessions appear here when a recorded account uses the site.'))}</div>`;
  if (box.querySelector('.dg-s') && L.length) adMorph(box, h); else box.innerHTML = h;
}
function dgHead() {
  const s = DGV.cur, I = DGV.info || {}, K = I.kinds || {}, B = I.boot || {};
  const n = g => g[2].reduce((t, k) => t + (+K[k] || 0), 0);
  return `<div class="dg-h"><div class="dg-ht"><button class="back dg-back" type="button" data-dgback>${AD_ICO.back}${esc(auT('All sessions'))}</button><b translate="no">${esc(s.username ? '@' + s.username : String(s.user_id).slice(0, 8))} · ${esc(s.sid)}</b><small>${esc(adDate(s.first_at, 1))} → ${esc(adClock(Date.parse(s.last_at)))} · ${esc(auT('{n} events').replace('{n}', stN(I.n != null ? I.n : s.events)))}</small></div><div class="dg-act"><button class="btn2" type="button" data-dgdl${DGV.dl ? ' disabled' : ''}>${esc(auT(DGV.dl ? 'Preparing…' : 'Download JSON'))}</button><button class="btn2 danger" type="button" data-dgclear="one">${esc(auT('Delete session'))}</button></div></div>
   ${B.ua ? `<p class="dg-ua adm-mut" translate="no">${esc(dgCut(B.u || '', 80))} · ${esc(dgCut(B.ua, 160))}${B.vp ? ' · ' + esc(B.vp.join('×')) : ''}${B.net && B.net.type ? ' · ' + esc(B.net.type) : ''}</p>` : ''}
   <div class="dg-f"><label class="search dg-q"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="dgq" type="search" placeholder="${esc(auT('Search in this session'))}" aria-label="${esc(auT('Search in this session'))}" autocomplete="off" spellcheck="false" maxlength="80" value="${esc(DGV.q)}"></label>
    <div class="dg-chips" role="group" aria-label="${esc(auT('Kinds of events'))}"><button type="button" class="chip dg-c bad" data-dgbad aria-pressed="${DGV.bad}">${esc(auT('Problems only'))}<i>${stN(I.bad)}</i></button>${DG_K.map(g => `<button type="button" class="chip dg-c" data-dgkind="${g[0]}" aria-pressed="${DGV.kinds.has(g[0])}"${n(g) ? '' : ' disabled'}>${esc(auT(g[1]))}<i>${stN(n(g))}</i></button>`).join('')}</div></div>`;
}
function dgRow(r, t0) {
  const [q, t, k, d] = r, bad = dgBad(k, d), open = DGV.open.has(q), off = (t - t0) / 1000;
  return `<div class="dg-r k-${esc(k)}${bad ? ' bad' : ''}${open ? ' open' : ''}" data-k="dr:${q}"><button type="button" class="dg-rb" data-dgrow="${q}" aria-expanded="${open}"><time title="${esc(adClock(t))}">${off < 0 ? '0.0' : off.toFixed(1)} s</time><i class="dg-k">${esc(k)}${k === 'log' && d && d.l ? ' ' + esc(d.l) : ''}</i><span translate="no">${esc(dgSum(k, d))}</span></button>${open ? `<pre class="dg-j" translate="no" tabindex="0">${esc(JSON.stringify(d, null, 1))}</pre>` : ''}</div>`;
}
function dgBody() {
  const R = DGV.rows, t0 = DGV.info && DGV.info.first ? Date.parse(DGV.info.first) : R.length ? R[0][1] : 0;
  if (DGV.busy && !R.length) return '<div class="dg-rows" id="dgr"><i class="sk sk-td"></i><i class="sk sk-td"></i><i class="sk sk-td"></i><i class="sk sk-td"></i></div>';
  const a = DGV.before + 1, b = DGV.before + R.length;
  const nav = `<div class="dg-nav"><span>${DGV.total ? esc(auT('{a}–{b} of {n}').replace('{a}', stN(a)).replace('{b}', stN(b)).replace('{n}', stN(DGV.total))) : ''}</span><div><button class="btn2" type="button" data-dgpage="first"${DGV.before ? '' : ' disabled'}>${esc(auT('First'))}</button><button class="btn2" type="button" data-dgpage="prev"${DGV.before ? '' : ' disabled'}>${esc(auT('Earlier'))}</button><button class="btn2" type="button" data-dgpage="next"${DGV.after ? '' : ' disabled'}>${esc(auT('Later'))}</button><button class="btn2" type="button" data-dgpage="last"${DGV.after ? '' : ' disabled'}>${esc(auT('Last'))}</button></div></div>`;
  return nav + `<div class="dg-rows${DGV.busy ? ' busy' : ''}" id="dgr">${R.length ? R.map(r => dgRow(r, t0)).join('') : `<div class="adm-empty">${esc(auT(DGV.err ? 'Could not load. Check your connection and try again.' : DGV.q || DGV.bad || DGV.kinds.size ? 'No events match.' : 'This session has no events.'))}</div>`}</div>` + (R.length > 30 ? nav : '');
}
function dgDraw(top) {
  const m = $('#dgm');
  if (!m || !DGV.cur) return;
  const keep = document.activeElement && document.activeElement.id === 'dgq' ? document.activeElement.selectionStart : null, h = dgHead() + `<div id="dgb">${dgBody()}</div>`;
  if (m.querySelector('.dg-h')) adMorph(m, h); else m.innerHTML = h;
  if (keep != null) { const q = $('#dgq'); if (q && document.activeElement !== q) { q.focus({ preventScroll: true }); try { q.setSelectionRange(keep, keep); } catch (e) {} } }
  if (top) { const r = $('#dgr'); if (r) r.scrollTop = 0; }
}
function dgKinds() {
  if (!DGV.kinds.size) return null;
  return DG_K.filter(g => DGV.kinds.has(g[0])).reduce((a, g) => a.concat(g[2]), []);
}
async function dgPage(how) {
  const s = DGV.cur;
  if (!s) return;
  const my = ++DGV.seq, R = DGV.rows, lo = R.length ? R[0][0] : 0, hi = R.length ? R[R.length - 1][0] : 0;
  const p = { p_uid: s.user_id, p_sid: s.sid, p_after: 0, p_before: null, p_limit: DG_N, p_kinds: dgKinds(), p_q: DGV.q.trim() || null, p_bad: DGV.bad };
  if (how === 'next') p.p_after = hi; else if (how === 'prev') p.p_before = lo; else if (how === 'last') p.p_before = 2147483647;
  DGV.busy = true; DGV.err = false;
  dgDraw();
  try {
    const r = await adRpc('admin_diag_page', p);
    if (my !== DGV.seq || DGV.cur !== s) return;
    DGV.rows = Array.isArray(r.rows) ? r.rows : []; DGV.total = +r.total || 0; DGV.before = +r.before || 0; DGV.after = +r.after || 0;
  } catch (e) { if (my !== DGV.seq) return; DGV.err = true; DGV.miss = sbMissing(e); DGV.rows = []; DGV.total = 0; DGV.before = DGV.after = 0; }
  DGV.busy = false;
  dgDraw(true);
  if (DGV.miss) { const b = $('#dgb'); if (b) b.innerHTML = `<div class="adm-empty">${esc(auT('Run round19_analytics.sql in the Supabase SQL editor to see this part.'))}</div>`; }
}
async function dgPick(sid) {
  const s = (DGV.list || []).find(x => x.sid === sid);
  if (!s) return;
  DGV.cur = s; DGV.info = null; DGV.rows = []; DGV.total = 0; DGV.before = DGV.after = 0; DGV.kinds = new Set(); DGV.bad = false; DGV.q = ''; DGV.open = new Set();
  dgList();
  $('#addiag .dg').classList.add('in');
  $('#dgm').innerHTML = '';
  dgPage('first');
  try { const i = await adRpc('admin_diag_info', { p_uid: s.user_id, p_sid: s.sid }); if (DGV.cur === s) { DGV.info = i; dgDraw(); } } catch (e) {}
}
function dgBack() {
  DGV.cur = null; DGV.seq++;
  const d = $('#addiag .dg'); if (d) d.classList.remove('in');
  $('#dgm').innerHTML = `<div class="adm-empty">${esc(auT('Choose a session to see what happened in it.'))}</div>`;
  dgList();
}
async function dgDownload() {
  const s = DGV.cur;
  if (!s || DGV.dl) return;
  DGV.dl = true; dgDraw();
  const all = [];
  try {
    for (let after = 0, i = 0; i < 400; i++) {
      const r = await adRpc('admin_diag_page', { p_uid: s.user_id, p_sid: s.sid, p_after: after, p_before: null, p_limit: 2000, p_kinds: null, p_q: null, p_bad: false });
      const R = Array.isArray(r.rows) ? r.rows : [];
      R.forEach(x => all.push({ q: x[0], t: x[1], k: x[2], d: x[3] }));
      if (!R.length || !+r.after) break;
      after = R[R.length - 1][0];
    }
    const u = URL.createObjectURL(new Blob([JSON.stringify({ sid: s.sid, user_id: s.user_id, username: s.username, first_at: s.first_at, last_at: s.last_at, events: all })], { type: 'application/json' })), a = document.createElement('a');
    a.href = u; a.download = 'gameplay-diagnostics-' + s.sid + '.json';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  } catch (e) { toast(auT('Could not load. Check your connection and try again.')); }
  DGV.dl = false;
  if (DGV.cur === s) dgDraw();
}
async function dgClear(b, all) {
  if (!adConfirm(b)) return;
  b.disabled = true;
  try {
    const n = await adRpc('admin_diag_clear', { p_sid: all ? null : DGV.cur.sid });
    toast(auT('{n} events deleted').replace('{n}', stN(n)));
    DGV.list = null;
    if (!all || DGV.cur) dgBack();
    await dgLoad();
    AL.list = [];
  } catch (e) { toast(auT(adErr(e))); }
  b.disabled = false;
}
function dgBoot() {
  const tabs = $('#adtabs'), sec = document.createElement('section');
  if (!tabs || $('#addiag')) return;
  tabs.querySelector('i').insertAdjacentHTML('beforebegin', `<button type="button" role="tab" data-adtab="diag" aria-selected="false">${esc(auT('Diagnostics'))}</button>`);
  sec.className = 'adm-sec'; sec.id = 'addiag'; sec.hidden = true;
  tabs.parentNode.append(sec);
  AD_TABS.push('diag');
  AD_OPEN.diag = dgOpen;
  adTabBar(tabs);
  let qt = 0;
  sec.addEventListener('click', e => {
    const t = e.target, c = s => t.closest(s);
    let b;
    if ((b = c('[data-dgsid]'))) dgPick(b.dataset.dgsid);
    else if (c('[data-dgback]')) dgBack();
    else if ((b = c('[data-dgrow]'))) { const q = +b.dataset.dgrow; if (DGV.open.has(q)) DGV.open.delete(q); else DGV.open.add(q); dgDraw(); }
    else if ((b = c('[data-dgkind]'))) { const k = b.dataset.dgkind; if (DGV.kinds.has(k)) DGV.kinds.delete(k); else DGV.kinds.add(k); dgPage('first'); }
    else if (c('[data-dgbad]')) { DGV.bad = !DGV.bad; dgPage('first'); }
    else if ((b = c('[data-dgpage]'))) dgPage(b.dataset.dgpage);
    else if (c('[data-dgdl]')) dgDownload();
    else if ((b = c('[data-dgclear]'))) dgClear(b, b.dataset.dgclear === 'all');
    else if ((b = c('[data-dgacc]'))) dgAccSet(b.dataset.dgacc, b.getAttribute('aria-checked') !== 'true');
    else if ((b = c('[data-dgask]'))) { const uid = DGV.ask; if (b.dataset.dgask === 'yes' && uid) dgAccSet(uid, true); else { DGV.ask = null; dgAccDraw(); } }
  });
  sec.addEventListener('input', e => { if (e.target.id !== 'dgq') return; DGV.q = e.target.value; clearTimeout(qt); qt = setTimeout(() => dgPage('first'), 350); });
  setInterval(() => { if (view === 'admin' && AD.tab === 'diag' && lvWant() && Date.now() - DGV.at > 15000) { dgLoad(true); } }, 5000);
}

function tkBox(el, mode) {
  if (el._tk) return el;
  el._tk = { mode, list: null, cur: null, n: 0, sig: '', compose: false };
  el.classList.add('tk');
  el.dataset.mode = mode;
  el.innerHTML = `<div class="tk-side">${mode === 'user' ? `<form class="tk-new" novalidate hidden><div class="fld"><label>${esc(auT('Subject'))}</label><input class="tk-subj-in" maxlength="120" autocomplete="off"></div><div class="fld"><label>${esc(auT('Message'))}</label><textarea class="tk-body-in" maxlength="2000" rows="4"></textarea></div><div class="tk-fx tk-fxn"></div><div class="tk-row"><button class="btn2 tk-cancel" type="button" data-tk="cancel">${esc(auT('Cancel'))}</button><button class="btn2 pri" type="submit">${esc(auT('Send ticket'))}</button></div></form><button class="btn2 pri tk-open" type="button" data-tk="new">${esc(auT('New ticket'))}</button>` : ''}<div class="tk-list" role="list"></div></div><div class="tk-main" hidden><div class="tk-h"><button class="back" type="button" data-tk="back">${AD_ICO.back}${esc(auT('All tickets'))}</button><div class="tk-ht"><b class="tk-subj" translate="no"></b><span class="tk-meta"></span></div><button class="btn2 tk-tog" type="button" data-tk="toggle"></button>${mode === 'admin' ? `<button class="btn2 danger tk-del" type="button" data-tk="del">${esc(auT('Delete ticket'))}</button>` : ''}</div><div class="tk-msgs" translate="no" aria-live="polite"></div><form class="tk-comp" novalidate><textarea maxlength="2000" rows="2" placeholder="${esc(auT('Write a message'))}"></textarea><button class="btn2 pri" type="submit" aria-label="${esc(auT('Send'))}">${AD_ICO.send}<span>${esc(auT('Send'))}</span></button><div class="tk-fx tk-fxc"></div></form></div><div class="note tk-note" role="status"></div>`;
  if (el.id !== 'tkb') {
    const nf = el.querySelector('.tk-new'), cf = el.querySelector('.tk-comp');
    if (nf) el._tk.fxn = fxBox(nf.querySelector('.tk-fxn'), { drop: nf, paste: [nf] });
    el._tk.fx = fxBox(cf.querySelector('.tk-fxc'), { drop: el.querySelector('.tk-main'), paste: [cf] });
  }
  el.addEventListener('click', e => { const b = e.target.closest('[data-tk]'); if (b) { e.stopPropagation(); tkAct(el, b.dataset.tk, b); } });
  el.addEventListener('submit', e => { e.preventDefault(); if (e.target.classList.contains('tk-new')) tkCreate(el); else tkSend(el); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.tagName === 'TEXTAREA') { e.preventDefault(); e.target.form.requestSubmit(); } });
  return el;
}
const tkNote = (el, m, k) => { const n = el.querySelector('.tk-note'); n.textContent = m ? auT(m) : ''; n.className = 'note tk-note' + (k ? ' ' + k : ''); };
async function tkLoad(el) {
  const T = el._tk;
  if (!SB.user || (T.mode === 'admin' && !adIsAdmin())) return;
  if (!T.list) el.querySelector('.tk-list').innerHTML = '<i class="sk sk-tk" aria-hidden="true"></i>'.repeat(4);
  try {
    const r = await adRpc(T.mode === 'admin' ? 'admin_tickets' : 'my_tickets');
    T.list = Array.isArray(r) ? r : [];
    tkList(el);
    if (T.cur) tkHead(el, true);
    if (T.mode === 'admin' && view === 'admin') adTiles();
  } catch (e) { if (!T.list) el.querySelector('.tk-list').innerHTML = `<div class="adm-empty">${esc(auT('Could not load the tickets. Check your connection and try again.'))}</div>`; }
}
function tkList(el) {
  const T = el._tk, L = T.list || [], adm = T.mode === 'admin';
  const nf = el.querySelector('.tk-new'), ob = el.querySelector('.tk-open');
  if (nf) { const show = T.compose || !L.length; nf.hidden = !show; ob.hidden = show; nf.querySelector('.tk-cancel').hidden = !L.length; }
  const lb = el.querySelector('.tk-list'), h = L.length ? L.map((t, i) => {
    const who = adm ? (t.username ? '@' + t.username : t.email || '') : '';
    const flag = t.status === 'open' ? (adm ? (!t.last_admin ? adPill('Needs a reply', 'warn') : '') : (t.last_admin ? adPill('New reply', 'acc') : '')) : '';
    return `<button type="button" class="tk-item${t.id === T.cur ? ' on' : ''}" data-tk="open" data-id="${+t.id}" data-k="tk:${+t.id}" role="listitem" style="--i:${Math.min(i, 12)}"><span class="tk-it"><b translate="no">${esc(t.subject)}</b>${t.status === 'open' ? adPill('Open', 'ok') : adPill('Closed')}</span><span class="tk-is">${who ? `<span translate="no">${esc(who)}</span>` : ''}${adm && t.locked ? adPill('Locked', 'bad') : ''}${flag}<span>${esc(adAgo(t.updated_at))}</span><span>${esc(auT(t.messages === 1 ? '1 message' : '{n} messages').replace('{n}', +t.messages))}</span></span></button>`;
  }).join('') : adm ? `<div class="adm-empty">${esc(auT('No tickets yet.'))}</div>` : '';
  if (L.length && lb.querySelector('.tk-item')) adMorph(lb, h); else lb.innerHTML = h;
}
function tkShow(el, main) {
  el.classList.toggle('tk-in', main);
  el.querySelector('.tk-main').hidden = !main;
  if (el._tk.mode === 'user') el.querySelector('.tk-side').hidden = main;
}
async function tkOpen(el, id) {
  const T = el._tk;
  if (T.fx && T.cur !== id) T.fx.clear();
  T.cur = id; T.sig = '';
  const t = (T.list || []).find(x => x.id === id);
  el.querySelector('.tk-subj').textContent = t ? t.subject : '';
  el.querySelector('.tk-msgs').innerHTML = '<i class="sk sk-msg" aria-hidden="true"></i>'.repeat(4);
  tkHead(el);
  tkShow(el, true); tkNote(el, '');
  el.querySelectorAll('.tk-item').forEach(b => b.classList.toggle('on', +b.dataset.id === id));
  await tkThread(el);
  if (!auCoarse()) el.querySelector('.tk-comp textarea').focus({ preventScroll: true });
}
function tkHead(el, live) {
  const T = el._tk, t = (T.list || []).find(x => x.id === T.cur);
  if (!t) return;
  if (live) { const b = el.querySelector('.tk-tog'), want = auT(t.status === 'open' ? 'Close ticket' : 'Reopen'); if (b.textContent !== want && !b.disabled) b.textContent = want; adMorph(el.querySelector('.tk-meta'), (T.mode === 'admin' ? `<span translate="no">${esc(t.username ? '@' + t.username : t.email || '')}</span>` : '') + (t.status === 'open' ? adPill('Open', 'ok') : adPill('Closed')) + `<span>${esc(auT('Opened {d}').replace('{d}', adDate(t.created_at)))}</span>`); return; }
  el.querySelector('.tk-meta').innerHTML = (T.mode === 'admin' ? `<span translate="no">${esc(t.username ? '@' + t.username : t.email || '')}</span>` : '') + (t.status === 'open' ? adPill('Open', 'ok') : adPill('Closed')) + `<span>${esc(auT('Opened {d}').replace('{d}', adDate(t.created_at)))}</span>`;
  const b = el.querySelector('.tk-tog');
  b.textContent = auT(t.status === 'open' ? 'Close ticket' : 'Reopen');
  adUnconfirm(el.querySelector('.tk-del'));
}
async function tkThread(el) {
  const T = el._tk, id = T.cur;
  if (!id || !SB.user) return;
  try {
    const r = await adRpc('ticket_thread', { p_ticket: id });
    if (T.cur !== id) return;
    const ms = Array.isArray(r) ? r : [], sig = ms.length + ':' + (ms.length ? ms[ms.length - 1].id : 0);
    if (sig === T.sig) return;
    const box = el.querySelector('.tk-msgs'), near = !T.sig || box.scrollHeight - box.scrollTop - box.clientHeight < 80, old = T.sig ? +T.sig.split(':')[0] : ms.length;
    T.sig = sig;
    box.innerHTML = ms.map((m, i) => {
      const who = m.mine ? auT('You') : m.is_admin ? (T.mode === 'admin' && m.author ? auT('Admin') + ' · @' + m.author : auT('Admin')) : T.mode === 'admin' ? (m.author ? '@' + m.author : auT('User')) : auT('You');
      return `<div class="tk-m${m.mine ? ' me' : ''}${m.is_admin ? ' tk-adm' : ''}${i >= old ? ' new' : ''}"><div class="tk-b">${esc(m.body)}</div>${fxAtts(m.attachments, 'tickets', { staff: T.mode === 'admin', del: m.mine })}<span class="tk-w">${esc(who)} · ${esc(adAgo(m.created_at))}</span></div>`;
    }).join('');
    fxFill(box);
    if (near) box.scrollTop = box.scrollHeight;
  } catch (e) { tkNote(el, 'Could not load the messages. Check your connection and try again.', 'bad'); }
}
async function tkSend(el) {
  const T = el._tk, ta = el.querySelector('.tk-comp textarea'), b = el.querySelector('.tk-comp [type=submit]'), v = ta.value.trim(), id = T.cur, n = T.fx ? T.fx.items.length : 0;
  if (!id || b.disabled) return;
  if (!v) { auShake(ta); if (n) tkNote(el, 'Write a short message to go with your files.', 'bad'); ta.focus({ preventScroll: true }); return; }
  b.disabled = true; b.classList.add('is-busy'); tkNote(el, n ? 'Uploading your files…' : '');
  try {
    const files = n ? await T.fx.upload('tickets', SB.user.id) : [];
    if (n) tkNote(el, '');
    await tkRpc('ticket_send', { p_ticket: id, p_body: v }, files);
    if (T.fx) T.fx.clear();
    ta.value = '';
    track('ticket', { act: 'send', admin: T.mode === 'admin' });
    await tkThread(el);
    await tkLoad(el); tkHead(el);
  } catch (e) { tkNote(el, tkErr(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
const tkErr = e => e && e.fx ? e.message : /attachment/i.test(e && e.message || '') ? 'One of your files could not be attached. Remove it and try again.' : adErr(e);
async function tkRpc(fn, args, files) {
  try { return await adRpc(fn, Object.assign({}, args, { p_files: files })); }
  catch (e) { if (!sbMissing(e)) throw e; if (files.length) throw Object.assign(new Error(auT('Files cannot be attached yet. Send your message without them.')), { fx: true }); return adRpc(fn, args); }
}
async function tkCreate(el) {
  const f = el.querySelector('.tk-new'), s = f.querySelector('.tk-subj-in'), m = f.querySelector('.tk-body-in'), b = f.querySelector('[type=submit]');
  if (!s.value.trim()) { tkNote(el, 'Write a subject.', 'bad'); auShake(s.closest('.fld')); return; }
  if (!m.value.trim()) { tkNote(el, 'Write a message.', 'bad'); auShake(m.closest('.fld')); return; }
  if (b.disabled) return;
  const fx = el._tk.fxn, n = fx ? fx.items.length : 0;
  b.disabled = true; tkNote(el, n ? 'Uploading your files…' : 'Sending…');
  try {
    const files = n ? await fx.upload('tickets', SB.user.id) : [];
    if (n) tkNote(el, 'Sending…');
    const id = await tkRpc('ticket_create', { p_subject: s.value, p_body: m.value }, files);
    if (fx) fx.clear();
    s.value = ''; m.value = ''; el._tk.compose = false;
    track('ticket', { act: 'create' });
    tkNote(el, '');
    await tkLoad(el);
    tkOpen(el, +id);
  } catch (e) { tkNote(el, tkErr(e) === 'Too many messages. Wait a minute and try again.' ? 'Too many tickets. Wait a while and try again.' : tkErr(e), 'bad'); }
  finally { b.disabled = false; }
}
async function tkAct(el, k, b) {
  const T = el._tk;
  if (k === 'new') { T.compose = true; tkList(el); if (!auCoarse()) el.querySelector('.tk-subj-in').focus(); return; }
  if (k === 'cancel') { T.compose = false; tkNote(el, ''); tkList(el); return; }
  if (k === 'open') { tkOpen(el, +b.dataset.id); return; }
  if (k === 'back') { T.cur = null; tkShow(el, false); tkNote(el, ''); tkList(el); tkLoad(el); return; }
  if (k === 'del') {
    const id = T.cur;
    if (!id || T.mode !== 'admin' || !adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); tkNote(el, '');
    try {
      await adRpc('admin_delete_ticket', { p_ticket: id });
      track('ticket', { act: 'delete', admin: true });
      T.list = (T.list || []).filter(x => x.id !== id);
      if (T.cur === id) { T.cur = null; T.sig = ''; tkShow(el, false); }
      tkList(el); tkNote(el, 'Ticket deleted.', 'ok'); toast(auT('Ticket deleted.'));
      if (view === 'admin') adTiles();
      tkLoad(el);
    } catch (e) { tkNote(el, adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  }
  if (k === 'toggle') {
    const t = (T.list || []).find(x => x.id === T.cur);
    if (!t) return;
    b.disabled = true;
    try { const s = await adRpc('ticket_set_status', { p_ticket: t.id, p_status: t.status === 'open' ? 'closed' : 'open' }); t.status = s; tkHead(el); tkList(el); track('ticket', { act: s }); tkLoad(el); }
    catch (e) { tkNote(el, adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  }
}
function adSupport() {
  if (!SB.user) { closeAll(); auOpen('main', '', '', 'in'); return; }
  const el = tkBox($('#tks'), 'user');
  tkLoad(el);
}

addEventListener('keydown', e => {
  if (!AD.locked) return;
  const s = document.getElementById('lgsheet');
  if (s && !s.hidden) return;
  if (e.target && e.target.closest && e.target.closest('#adblock')) return;
  e.stopImmediatePropagation();
}, true);
const TA = { list: null, busy: false };
async function taLoad() {
  if (!adIsAdmin()) return;
  try { const r = await adRpc('admin_test_accounts'); TA.list = Array.isArray(r) ? r : []; } catch (e) {}
  const u = adCur(); if (u) taSaved(u);
}
const taOf = id => (Array.isArray(TA.list) ? TA.list : []).find(t => t.user_id === id);
function taSaved(u) {
  const t = taOf(u.id), el = $('#adpws');
  if (!el) return;
  el.hidden = !t;
  el.innerHTML = t ? `<span>${esc(auT('Password set when an admin created this account'))}</span><code translate="no">${esc(t.password)}</code><button class="btn2" type="button" data-tacopy="${esc(u.id)}">${esc(auT('Copy log in details'))}</button>${t.note ? `<small translate="no">${esc(t.note)}</small>` : ''}` : '';
}
const taText = t => auT('Site: {s}\nEmail or username: {u}\nPassword: {p}').replace('{s}', location.origin).replace('{u}', t.username || t.email).replace('{p}', t.password);
async function taCopy(t, b) {
  try { await navigator.clipboard.writeText(taText(t)); const l = b.textContent; b.textContent = auT('Copied'); setTimeout(() => { if (b.isConnected) b.textContent = l; }, 1500); }
  catch (e) { toast(taText(t)); }
}
function anOpen() {
  const d = $('#adnew');
  ['anem', 'anun', 'andn', 'anpw', 'annt'].forEach(id => { $('#' + id).value = ''; });
  $('#anrl').value = 'user'; $('#anpw').type = 'password';
  d.querySelectorAll('[data-owner]').forEach(o => { o.hidden = !adIsOwner(); });
  $('#adnewb').hidden = false; $('#adnewok').hidden = true; $('#adnews').hidden = false; $('#adnewc').textContent = auT('Cancel');
  auMsg('adnnote', '');
  if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  setTimeout(() => $('#anem').focus(), 30);
}
function anClose() { const d = $('#adnew'); if (d.close) d.close(); else d.removeAttribute('open'); }
async function anCreate() {
  if (TA.busy) return;
  const em = $('#anem').value.trim().toLowerCase(), un = $('#anun').value.trim().toLowerCase().replace(/^@/, ''), dn = $('#andn').value.replace(/\s+/g, ' ').trim(), pw = $('#anpw').value, rl = $('#anrl').value, nt = $('#annt').value.trim();
  if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { auMsg('adnnote', 'That email does not look valid.', 'bad'); auShake($('#anem')); return; }
  if (un && (!UN_NEW.test(un) || /^\.|\.$|\.\./.test(un))) { auMsg('adnnote', 'Use 4 to 20 lowercase letters, numbers, dots or underscores.', 'bad'); auShake($('#anun')); return; }
  if (pw.length < 8) { auMsg('adnnote', 'Choose a password of at least 8 characters.', 'bad'); auShake($('#anpw').closest('.au-pw')); return; }
  if (utf8Len(pw) > 72) { auMsg('adnnote', 'Use at most 72 characters.', 'bad'); return; }
  const b = $('#adnews');
  TA.busy = true; b.disabled = true; b.classList.add('is-busy'); auMsg('adnnote', '');
  try {
    const r = await adRpc('admin_create_user', { p_email: em || null, p_username: un || null, p_display: dn || null, p_password: pw, p_role: rl, p_note: nt || null });
    track('admin', { act: 'create_user' });
    const t = { user_id: r.id, email: r.email, username: r.username, password: r.password };
    $('#adnewb').hidden = true; b.hidden = true; $('#adnewc').textContent = auT('Done');
    const ok = $('#adnewok');
    ok.hidden = false;
    ok.innerHTML = `<p class="adm-ok">${esc(auT('Account created. Give these details to the person.'))}</p><dl class="apc-dl"><div><dt>${esc(auT('Email'))}</dt><dd translate="no">${esc(r.email)}</dd></div><div><dt>${esc(auT('Username'))}</dt><dd translate="no">@${esc(r.username)}</dd></div><div><dt>${esc(auT('Display name'))}</dt><dd translate="no">${esc(r.display_name || '—')}</dd></div><div><dt>${esc(auT('Password'))}</dt><dd translate="no"><code>${esc(r.password)}</code></dd></div><div><dt>${esc(auT('Role'))}</dt><dd>${adRole({ role: r.role })}</dd></div></dl><div class="apc-row"><button class="btn2 pri" type="button" data-ancopy>${esc(auT('Copy log in details'))}</button><button class="btn2" type="button" data-anopen="${esc(r.id)}">${esc(auT('Open player card'))}</button></div>`;
    ok._t = t;
    await Promise.all([taLoad(), adLoad()]);
  } catch (e) { auMsg('adnnote', /taken/i.test(e.message || '') ? 'That username is taken.' : /already has an account/i.test(e.message || '') ? 'That email already has an account.' : /admin_create_user|schema cache/i.test(e.message || '') ? 'Run round13_users.sql in the Supabase SQL editor first.' : adErr(e), 'bad'); }
  finally { TA.busy = false; b.disabled = false; b.classList.remove('is-busy'); }
}
function adBoot() {
  $('#adbout').addEventListener('click', () => { auSignOut(); });
  document.addEventListener('click', e => {
    const t = e.target;
    const ag = t.closest && t.closest('[data-adgo]');
    if (ag) { e.preventDefault(); closeAll(); AD.tab = ag.dataset.adgo || 'users'; if (view === 'admin') adTab(AD.tab); else go(adHref(), false); }
  });
  const va = $('#vAdmin');
  va.addEventListener('click', e => {
    const t = e.target;
    const s = t.closest('[data-adsort]');
    if (s) { const k = s.dataset.adsort; AD.sort = AD.sort[0] === k ? [k, -AD.sort[1]] : [k, /_at$|last_seen|friends|email_confirmed|locked|role|has_password/.test(k) ? -1 : 1]; adDraw(); return; }
    const tb = t.closest('[data-adtab]');
    if (tb) { adTab(tb.dataset.adtab); return; }
    if (t.closest('#adref')) { AD.lt = Date.now(); adLoad(); tkLoad(tkBox($('#tka'), 'admin')); if (AD.tab === 'stats') stOpen(true); if (AD.tab === 'log') alLoad(false, true); if (AD.tab === 'site') sfLoad(true).then(() => { sfaDraw(); sfgLoad(); }); if (AD.tab === 'diag') { dgLoad(); dgAcc(); } if (LV.fail || LV.miss) { LV.miss = false; LV.fail = 0; clearTimeout(LV.t); LV.t = 0; lvPoll(); } return; }
    if (t.closest('[data-almore]')) { alLoad(true); return; }
    if (t.closest('[data-abr], [data-abreset], [data-abh], [data-abt]')) { abAct(t); return; }
    const alu = t.closest('[data-alu]');
    if (alu) { const x = (AD.users || []).find(y => y.id === alu.dataset.alu); if (x) { adTab('users'); adPanel(x); } return; }
    const sg = t.closest('[data-sfg]');
    if (sg) { sg.setAttribute('aria-pressed', String(sg.getAttribute('aria-pressed') !== 'true')); return; }
    const sm = t.closest('#sfam');
    if (sm) { sm.classList.toggle('on'); sm.setAttribute('aria-checked', String(sm.classList.contains('on'))); return; }
    if (t.closest('#sfas')) { sfaSave(t.closest('#sfas')); return; }
    if (t.closest('#sfps')) { sfpSave(t.closest('#sfps')); return; }
    if (t.closest('#sfgo')) { const on = !(SG.d && SG.d.open); if (on) { SG.cf = !SG.cf; SG.msg = null; sfgPaint(); } else sfgSet(false); return; }
    const gq = t.closest('[data-sfgo]');
    if (gq) { const k = gq.dataset.sfgo; if (k === 'cancel') { SG.cf = false; sfgPaint(); } else sfgSet(true); return; }
    if (t.closest('#adpclose')) { adPanelClose(); return; }
    if (t.closest('[data-adnew]')) { anOpen(); return; }
    if (t.closest('[data-adnewx]')) { anClose(); return; }
    if (t.closest('[data-ancopy]')) { const ok = $('#adnewok'); if (ok._t) taCopy(ok._t, t.closest('[data-ancopy]')); return; }
    const ao = t.closest('[data-anopen]');
    if (ao) { const x = (AD.users || []).find(y => y.id === ao.dataset.anopen); anClose(); if (x) adPanel(x); return; }
    if (t.closest('[data-addev]')) { const u = adCur(); if (u) adDevices(u, true); return; }
    const tc = t.closest('[data-tacopy]');
    if (tc) { const x = taOf(tc.dataset.tacopy); if (x) taCopy(x, tc); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const a = t.closest('[data-adact]');
    if (a) { adAct(a.dataset.adact, a); return; }
    const cp = t.closest('[data-adcopy]');
    if (cp) { e.stopPropagation(); adCopyId(cp.dataset.adcopy, cp); return; }
    const tr = t.closest('#adt tbody tr[data-uid]');
    if (tr) { const u = (AD.users || []).find(x => x.id === tr.dataset.uid); if (u) adPanel(u); }
  });
  va.addEventListener('keydown', e => {
    if (e.key === 'Escape' && AD.tab === 'users' && !$('#adpanel').hidden) { e.preventDefault(); e.stopPropagation(); adPanelClose(); return; }
    const tr = e.target.closest && e.target.closest('#adt tbody tr[data-uid]');
    if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tr.click(); }
  });
  $('#adtabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const T = [...$('#adtabs').querySelectorAll('[data-adtab]')].map(b => b.dataset.adtab), i = T.indexOf(AD.tab); adTab(T[(i + (e.key === 'ArrowRight' ? 1 : T.length - 1)) % T.length]); $('#adtabs [aria-selected="true"]').focus(); } });
  stBoot();
  dgBoot();
  setInterval(adTick, 1000);
  $('#adq').addEventListener('input', e => { AD.q = e.target.value; adDraw(); });
  $('#adsite').addEventListener('input', e => { if (e.target.id !== 'sfaq') return; const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('#sfag [data-sfg]').forEach(c => { c.hidden = !!q && !c.textContent.toLowerCase().includes(q) && !c.dataset.sfg.includes(q); }); });
  $('#adf').addEventListener('change', e => { AD.f = e.target.value; adDraw(); });
  $('#anpw').parentNode.insertAdjacentHTML('beforeend', EYE);
  $('#anun').addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; });
  $('#adnewf').addEventListener('submit', e => { e.preventDefault(); if (!$('#adnewb').hidden) anCreate(); else anClose(); });
  $('#adnew').addEventListener('click', e => { if (e.target === e.currentTarget) anClose(); });
  [['#addn', 'dn', '#addnb'], ['#adem', 'em', '#ademb']].forEach(([q, k, bq]) => $(q).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct(k, $(bq)); } }));
  $('#adpw').parentNode.insertAdjacentHTML('beforeend', EYE);
  $('#adpw').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('pw', $('#adpwb')); } });
  $('#adun').addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; });
  $('#adun').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('un', $('#adunb')); } });
  setInterval(() => {
    if (!SB.user || document.visibilityState === 'hidden') return;
    document.querySelectorAll('.tk').forEach(el => { if (!el._tk || el.closest('[hidden]')) return; if (el._tk.cur) tkThread(el); if (++el._tk.n % 5 === 0) tkLoad(el); });
  }, 6000);
  setInterval(() => { if (SB.user && document.visibilityState !== 'hidden') adCheck(); }, 180000);
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible' && Date.now() - AD.at > 60000) adCheck(); if (document.visibilityState === 'visible') { lvKick(); if (Date.now() - AD.lt > 10000) adLive(true); adTick(); } else lvBar(); });
  setInterval(() => {
    if (view !== 'admin' || !AD.users) return;
    const miss = AD.miss || (AD.miss = new Set()), nw = adOnIds().filter(id => !miss.has(id) && !AD.users.some(u => u.id === id));
    if (nw.length && Date.now() - AD.lt > 8000) { nw.forEach(id => miss.add(id)); adLive(true); }
  }, 4000);
}

const ACH = { uid: null, kind: 'dm', rows: [], more: false, busy: 0, room: null };
const ACH_N = 60;
function achSeg() { document.querySelectorAll('#adcs [data-adck]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.adck === ACH.kind))); }
async function achLoad(u, older) {
  const box = $('#adcl');
  if (!box || !u || !adIsAdmin()) return;
  if (ACH.uid !== u.id) { ACH.uid = u.id; ACH.rows = []; ACH.more = false; ACH.room = null; }
  if (!older) { ACH.rows = []; ACH.room = null; box.innerHTML = '<i class="sk sk-msg" aria-hidden="true"></i>'.repeat(3); $('#adcm').hidden = true; }
  achSeg();
  const kind = ACH.kind, uid = u.id, before = older && ACH.rows.length ? ACH.rows[ACH.rows.length - 1].id : null, my = ++ACH.busy;
  try {
    const r = await adRpc('admin_user_chat', { p_uid: uid, p_kind: kind, p_before: before, p_limit: ACH_N });
    if (my !== ACH.busy || ACH.uid !== uid || ACH.kind !== kind) return;
    const L = Array.isArray(r) ? r : [];
    ACH.rows = older ? ACH.rows.concat(L) : L; ACH.more = L.length === ACH_N;
    achDraw();
  } catch (e) {
    if (my !== ACH.busy) return;
    box.innerHTML = `<div class="adm-empty">${esc(/admin_user_chat|schema cache|could not find/i.test(e.message || '') ? auT('Message history is not set up on the server yet.') : auT('Could not load the messages. Check your connection and try again.'))}</div>`;
  }
}
function achWhat(m) {
  if (m.kind === 'image') return `<i>${esc(auT('Sent a picture'))}</i>`;
  if (m.kind === 'file') return `<span class="ach-file">${FX_ICO.file}<i>${esc(auT('Sent a file'))}</i></span>${m.body ? ' · ' + esc(m.body) : ''}`;
  if (m.kind === 'invite') return `<i>${esc(auT('Party invite · {g}').replace('{g}', adGame(m.game)))}${m.room ? ' · ' + esc(m.room) : ''}</i>`;
  if (m.kind === 'join') return `<i>${esc(auT('Asked to join · {g}').replace('{g}', adGame(m.game)))}</i>`;
  return esc(m.body || '');
}
function achDraw() {
  const box = $('#adcl'), q = String(($('#adcq') || {}).value || '').trim().toLowerCase();
  if (!box) return;
  const L = q ? ACH.rows.filter(m => [m.body, m.other_username, m.other_display, m.game, m.room].some(x => x && String(x).toLowerCase().includes(q))) : ACH.rows;
  const empty = { dm: 'No direct messages.', party: 'No party chat messages.', game: 'No in-game chat messages.' }[ACH.kind];
  box.innerHTML = L.length ? L.map(m => {
    let who;
    if (ACH.kind === 'dm') { const o = m.other_username ? '@' + m.other_username : m.other_display || auT('Deleted account'); who = esc(auT(m.outgoing ? 'To {u}' : 'From {u}').replace('{u}', o)); }
    else who = esc(adGame(m.game) || auT('Unknown game')) + (m.room ? ` · <button type="button" class="ach-room" data-adroom="${esc(m.room)}" data-at="${esc(m.created_at)}" title="${esc(auT('Show the whole chat of this party'))}">${esc(auT('Party {code}').replace('{code}', m.room))}</button>` : '');
    return `<div class="ach-m${m.outgoing && ACH.kind === 'dm' ? ' out' : ''}"><div class="ach-h"><b>${who}</b><time title="${esc(adDate(m.created_at, 1))}">${esc(adAgo(m.created_at))}</time></div><p>${achWhat(m)}</p></div>`;
  }).join('') : `<div class="adm-empty">${esc(auT(q ? 'No messages match.' : empty))}</div>`;
  $('#adcm').hidden = !ACH.more || !!q;
}
async function achRoom(room, at) {
  const box = $('#adcl');
  ACH.room = room; box.innerHTML = '<i class="sk sk-msg" aria-hidden="true"></i>'.repeat(3); $('#adcm').hidden = true;
  try {
    const r = await adRpc('admin_room_chat', { p_room: room, p_at: at });
    if (ACH.room !== room) return;
    const L = Array.isArray(r) ? r : [];
    box.innerHTML = `<div class="ach-rh"><button type="button" class="btn2" data-adcback>${esc(auT('Back'))}</button><b>${esc(auT('Party {code}').replace('{code}', room))}</b><small>${esc(auT('3 hours before and after'))}</small></div>` + (L.length ? L.map(m => `<div class="ach-m${m.user_id === ACH.uid ? ' out' : ''}"><div class="ach-h"><b>${esc(m.username ? '@' + m.username : m.display_name || auT('Player'))} · ${esc(adGame(m.game))}</b><time title="${esc(adDate(m.created_at, 1))}">${esc(adClock(Date.parse(m.created_at)))}</time></div><p>${esc(m.body)}</p></div>`).join('') : `<div class="adm-empty">${esc(auT('No messages.'))}</div>`);
  } catch (e) { box.innerHTML = `<div class="adm-empty">${esc(auT('Could not load the messages. Check your connection and try again.'))}</div>`; }
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-adck], #adcm, #adcc, [data-adroom], [data-adcback]');
  if (!t || !t.closest('#adpanel')) return;
  const u = adCur();
  if (!u) return;
  if (t.dataset.adck) { if (ACH.kind !== t.dataset.adck || ACH.room) { ACH.kind = t.dataset.adck; achLoad(u); } }
  else if (t.id === 'adcm') achLoad(u, true);
  else if (t.id === 'adcc') achCopy(u);
  else if (t.dataset.adroom) achRoom(t.dataset.adroom, t.dataset.at);
  else if (t.hasAttribute('data-adcback')) { ACH.room = null; achDraw(); }
});
document.addEventListener('input', e => { if (e.target && e.target.id === 'adcq' && !ACH.room) achDraw(); });

const MS = { busy: 0 };
const msHtml = () => `<div class="st-card ms-card" id="adms"><div class="sx-ch"><div><h3>${esc(auT('Search all messages'))}</h3></div></div><form class="ms-f" id="admsf" novalidate><input type="search" id="admsq" placeholder="${esc(auT('Word or phrase, at least 2 letters'))}" aria-label="${esc(auT('Search all messages'))}" autocomplete="off" maxlength="80"><button class="btn2 pri" type="submit">${esc(auT('Search'))}</button></form><div class="apc-chatl ms-l" id="admsl" translate="no"></div></div>`;
async function msSearch() {
  const q = $('#admsq').value.trim(), box = $('#admsl');
  if (q.length < 2) { box.innerHTML = `<div class="adm-empty">${esc(auT('Type at least 2 letters.'))}</div>`; return; }
  const my = ++MS.busy;
  box.innerHTML = '<i class="sk sk-msg" aria-hidden="true"></i>'.repeat(3);
  try {
    const r = await adRpc('admin_chat_search', { p_q: q, p_limit: 150 });
    if (my !== MS.busy) return;
    const L = Array.isArray(r) ? r : [], K = { dm: 'Direct message', party: 'Party chat', game: 'In-game chat' };
    box.innerHTML = L.length ? `<p class="ms-n">${esc(auT(L.length === 1 ? '1 message' : '{n} messages').replace('{n}', L.length))}</p>` + L.map(m => `<div class="ach-m"><div class="ach-h"><b>${abWho(m.user_id, m.username, m.display_name)} · ${esc(auT(K[m.kind] || m.kind))}${m.kind === 'dm' && m.other_username ? ' · ' + esc(auT('to {u}').replace('{u}', '@' + m.other_username)) : ''}${m.game ? ' · ' + esc(adGame(m.game)) : ''}${m.room ? ' · ' + esc(m.room) : ''}</b><time title="${esc(adDate(m.created_at, 1))}">${esc(adAgo(m.created_at))}</time></div><p>${esc(m.body || '')}</p></div>`).join('') : `<div class="adm-empty">${esc(auT('No messages match.'))}</div>`;
  } catch (e) { if (my === MS.busy) box.innerHTML = `<div class="adm-empty">${esc(/admin_chat_search|schema cache|could not find/i.test(e.message || '') ? auT('Message history is not set up on the server yet.') : adErr(e))}</div>`; }
}
document.addEventListener('submit', e => { if (e.target && e.target.id === 'admsf') { e.preventDefault(); msSearch(); } });
async function achCopy(u) {
  if (!ACH.rows.length) { toast(auT('Nothing to copy')); return; }
  const K = { dm: 'Direct messages', party: 'Party chat', game: 'In-game chat' }[ACH.kind];
  const txt = [(u.username ? '@' + u.username : u.email || u.id) + ' · ' + auT(K)].concat(ACH.rows.slice().reverse().map(m => `[${adDate(m.created_at, 1)}] ${ACH.kind === 'dm' ? (m.outgoing ? '→ @' : '← @') + (m.other_username || '?') : adGame(m.game) + (m.room ? ' ' + m.room : '')}: ${m.body || m.kind}`)).join(String.fromCharCode(10));
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) { ok = adCopyFallback(txt); }
  toast(auT(ok ? 'Copied' : 'Could not copy'));
}
