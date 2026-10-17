const AD = { role: null, locked: false, reason: null, at: 0, game: null, gat: 0, users: null, q: '', f: 'all', sort: ['created_at', -1], sel: null, tab: 'users', wait: 0, busy: false };
const adHref = () => (PATH_MODE ? '/' : '#/') + 'admin';
const adIsAdmin = () => AD.role === 'admin' && !AD.locked;
const adRpc = (f, b) => sbRest('rpc/' + f, { method: 'POST', body: b || {} });
const adLang = () => window.gpI18n ? gpI18n.lang : 'en';
const AD_ICO = {
  lock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>'
};
function adAgo(t) {
  const d = Date.parse(t);
  if (!d) return auT('Never');
  const s = (d - Date.now()) / 1000, a = Math.abs(s);
  const [n, u] = a < 60 ? [s, 'second'] : a < 3600 ? [s / 60, 'minute'] : a < 86400 ? [s / 3600, 'hour'] : a < 2592000 ? [s / 86400, 'day'] : a < 31536000 ? [s / 2592000, 'month'] : [s / 31536000, 'year'];
  try { return new Intl.RelativeTimeFormat(adLang(), { numeric: 'auto' }).format(Math.round(n), u); } catch (e) { return new Date(d).toLocaleString(); }
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
const adProv = u => (u.providers && u.providers.length ? u.providers : ['email']).map(p => p === 'google' ? 'Google' : p === 'email' ? auT('Email') : p).join(' + ');
const adPill = (t, k) => `<span class="adm-pill${k ? ' ' + k : ''}">${esc(auT(t))}</span>`;
const adErr = e => { const m = String(e && e.message || ''); return /admins only/i.test(m) ? 'Admins only' : /at least one admin/i.test(m) ? 'There must be at least one admin' : /own account/i.test(m) ? 'You cannot lock your own account' : /at least 8/i.test(m) ? 'Use at least 8 characters.' : /at most 72/i.test(m) ? 'Use at most 72 characters.' : /not found/i.test(m) ? 'Not found. Refresh and try again.' : /too many/i.test(m) ? 'Too many messages. Wait a minute and try again.' : /account locked/i.test(m) ? 'Your account is locked.' : /write a subject/i.test(m) ? 'Write a subject.' : /write a message/i.test(m) ? 'Write a message.' : 'Could not update. Check your connection and try again.'; };

function adStatus(s) {
  const was = adIsAdmin(), wl = AD.locked;
  AD.role = s ? s.role : null; AD.locked = !!(s && s.locked); AD.reason = s && s.locked_reason || null; AD.at = Date.now();
  document.querySelectorAll('[data-admin]').forEach(el => { el.hidden = !adIsAdmin(); });
  if (AD.locked !== wl || AD.locked) adBlock(AD.locked);
  if (view === 'admin') { if (adIsAdmin()) { if (!was || !AD.users) adEnter(); } else adBounce(); }
}
async function adCheck(game) {
  if (!SB.user) return;
  const uid = SB.user.id;
  try {
    const r = await adRpc('touch_presence', { p_lang: adLang(), p_game: game || (cur ? cur.g.id : null) });
    if (!SB.user || SB.user.id !== uid) return;
    adStatus(Array.isArray(r) ? r[0] : null);
  } catch (e) { if (view === 'admin' && !AD.at) adBounce(); }
}
function adSeen(id) {
  if (!SB.user || (AD.game === id && Date.now() - AD.gat < 60000)) return;
  AD.game = id; AD.gat = Date.now();
  adCheck(id);
}
function adSignedOut() {
  AD.role = null; AD.at = 0; AD.users = null; AD.sel = null;
  document.querySelectorAll('[data-admin]').forEach(el => { el.hidden = true; });
  if (AD.locked) { AD.locked = false; adBlock(false); }
  document.querySelectorAll('.tk').forEach(b => { if (b._tk) { b._tk.list = null; b._tk.cur = null; } });
  if (view === 'admin') adBounce();
}

function adBlock(on) {
  const el = $('#adblock');
  document.documentElement.classList.toggle('ad-locked', on);
  ['top', 'side', 'main'].forEach(id => { const n = document.getElementById(id); if (n) n.inert = on; });
  if (on) {
    if (openK) closeAll();
    if (!$('#unmodal').hidden) unClose();
    if (view !== 'home' || cur || pend) go(homeHref(), true);
    $('#adbrt').textContent = AD.reason || '';
    $('#adbr').hidden = !AD.reason;
    if (el.hidden) { el.hidden = false; const b = tkBox($('#tkb'), 'user'); tkLoad(b); }
  } else el.hidden = true;
}

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
  adTab(AD.tab);
  await adLoad();
  tkLoad(tkBox($('#tka'), 'admin'));
}
async function adLoad() {
  if (!adIsAdmin() || AD.busy) return;
  AD.busy = true;
  $('#adref').classList.add('spin');
  if (!AD.users) { $('#adt tbody').innerHTML = ('<tr aria-hidden="true">' + '<td><i class="sk sk-td"></i></td>'.repeat(AD_COLS.length) + '</tr>').repeat(7); $('#adtiles').innerHTML = '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(6); }
  try {
    const r = await adRpc('admin_list_users');
    AD.users = Array.isArray(r) ? r : [];
    adTiles(); adDraw();
    if (AD.sel) { const u = AD.users.find(x => x.id === AD.sel); if (u) adPanel(u, true); }
  } catch (e) {
    if (/admins only/i.test(e.message || '')) { AD.role = 'user'; adStatus({ role: 'user', locked: false }); return; }
    $('#adt tbody').innerHTML = `<tr><td colspan="15" class="adm-empty">${esc(auT('Could not load the users. Check your connection and try again.'))}</td></tr>`;
  } finally { AD.busy = false; $('#adref').classList.remove('spin'); }
}
function adTiles() {
  const U = AD.users || [], now = Date.now(), tk = ($('#tka')._tk || {}).list || [];
  const open = tk.filter(t => t.status === 'open').length;
  const T = [['Accounts', U.length], ['New this week', U.filter(u => now - Date.parse(u.created_at) < 6048e5).length], ['Active today', U.filter(u => now - Date.parse(u.last_seen || 0) < 864e5).length], ['Admins', U.filter(u => u.role === 'admin').length], ['Locked', U.filter(u => u.locked).length], ['Open tickets', open]];
  const box = $('#adtiles');
  box.innerHTML = T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${n}">${n}</b></div>`).join('');
  countUp(box);
  const tn = $('#adtn'); tn.textContent = open || ''; tn.hidden = !open;
}
const AD_COLS = [
  ['id', 'User id', u => `<code title="${esc(u.id)}">${esc(u.id.slice(0, 8))}</code>`],
  ['created_at', 'Account created', u => `<span title="${esc(adDate(u.created_at, 1))}">${esc(adDate(u.created_at))}</span>`],
  ['last_sign_in_at', 'Last log in', u => `<span title="${esc(adDate(u.last_sign_in_at, 1))}">${esc(adAgo(u.last_sign_in_at))}</span>`],
  ['last_seen', 'Last used website', u => `<span title="${esc(adDate(u.last_seen, 1))}">${esc(adAgo(u.last_seen))}</span>`],
  ['providers', 'Log in method', u => esc(adProv(u))],
  ['email_confirmed', 'Email confirmed', u => u.email_confirmed ? adPill('Yes', 'ok') : adPill('No', 'warn')],
  ['last_lang', 'Language', u => esc(adLangName(u.last_lang))],
  ['', 'Password', () => `<span class="adm-mut">${esc(auT('Hidden (hashed)'))}</span>`],
  ['role', 'Role', u => u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User')],
  ['email', 'Email', u => esc(u.email || '—')],
  ['username', 'Username', u => u.username ? '@' + esc(u.username) : '<span class="adm-mut">—</span>'],
  ['display_name', 'Display name', u => esc(u.display_name || '—')],
  ['friends', 'Friends', u => String(+u.friends || 0)],
  ['fav_game', 'Favourite game', u => esc(adGame(u.fav_game))],
  ['locked', 'Locked', u => u.locked ? `<span title="${esc(u.locked_reason || '')}">${adPill('Locked', 'bad')}</span>` : adPill('No')]
];
function adHead() {
  $('#adt thead').innerHTML = '<tr>' + AD_COLS.map(([k, l]) => k ? `<th><button type="button" data-adsort="${k}" aria-sort="${AD.sort[0] === k ? (AD.sort[1] > 0 ? 'ascending' : 'descending') : 'none'}">${esc(auT(l))}<i></i></button></th>` : `<th><span>${esc(auT(l))}</span></th>`).join('') + '</tr>';
}
function adSortVal(u, k) {
  const v = k === 'providers' ? adProv(u) : u[k];
  if (/_at$|last_seen/.test(k)) return Date.parse(v) || 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return v;
  return v == null ? '' : String(v).toLowerCase();
}
function adRows() {
  const q = AD.q.trim().toLowerCase().replace(/^@/, ''), f = AD.f, now = Date.now(), [k, d] = AD.sort;
  return (AD.users || []).filter(u => {
    if (q && ![u.id, u.email, u.username, u.display_name].some(x => x && String(x).toLowerCase().includes(q))) return false;
    if (f === 'admin') return u.role === 'admin';
    if (f === 'locked') return u.locked;
    if (f === 'unconfirmed') return !u.email_confirmed;
    if (f === 'google' || f === 'email') return (u.providers || []).includes(f);
    if (f === 'active') return now - Date.parse(u.last_seen || 0) < 6048e5;
    return true;
  }).sort((a, b) => { const x = adSortVal(a, k), y = adSortVal(b, k); const ex = x === '' || x === 0, ey = y === '' || y === 0; if (ex !== ey) return ex ? 1 : -1; return (x < y ? -1 : x > y ? 1 : 0) * d; });
}
function adDraw() {
  adHead();
  const rows = adRows(), tb = $('#adt tbody');
  $('#adcount').textContent = auT('{n} of {t} users').replace('{n}', rows.length).replace('{t}', (AD.users || []).length);
  tb.innerHTML = rows.length ? rows.map((u, i) => `<tr tabindex="0" data-uid="${esc(u.id)}" class="${u.id === AD.sel ? 'sel' : ''}" style="--i:${Math.min(i, 14)}">${AD_COLS.map(c => `<td>${c[2](u)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="15" class="adm-empty">${esc(auT('No users match.'))}</td></tr>`;
}
function adTab(t) {
  AD.tab = t;
  const tabs = $('#adtabs');
  tabs.dataset.m = t;
  tabs.querySelectorAll('[data-adtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.adtab === t)));
  $('#adusers').hidden = t !== 'users'; $('#adtickets').hidden = t !== 'tickets';
  if (t === 'tickets') tkLoad(tkBox($('#tka'), 'admin'));
}
function adPanel(u, keep) {
  AD.sel = u.id;
  const p = $('#adpanel'), me = SB.user && SB.user.id === u.id, name = u.display_name || u.username || u.email || '?';
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  const tr = document.querySelector(`#adt tr[data-uid="${CSS.escape(u.id)}"]`); if (tr) tr.classList.add('sel');
  p.querySelector('.pic').textContent = name.charAt(0).toUpperCase();
  $('#adpn').textContent = name;
  $('#adpu').textContent = u.username ? '@' + u.username : u.email || '';
  const F = [['User id', `<code>${esc(u.id)}</code>`], ['Email', esc(u.email || '—')], ['Email confirmed', u.email_confirmed ? esc(adDate(u.email_confirmed_at, 1)) : adPill('No', 'warn')], ['Username', u.username ? '@' + esc(u.username) : '—'], ['Display name', esc(u.display_name || '—')], ['Role', u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User')], ['Account created', esc(adDate(u.created_at, 1))], ['Last log in', esc(adDate(u.last_sign_in_at, 1))], ['Last used website', esc(adDate(u.last_seen, 1))], ['Last game opened', esc(adGame(u.last_game))], ['Language', esc(adLangName(u.last_lang))], ['Log in method', esc(adProv(u))], ['Friends', String(+u.friends || 0)], ['Favourite game', esc(adGame(u.fav_game))], ['Password', `<span class="adm-mut">${esc(auT('Hidden (hashed)'))}</span>`], ['Locked', u.locked ? adPill('Locked', 'bad') + (u.locked_reason ? `<div class="adm-why">${esc(u.locked_reason)}</div>` : '') : adPill('No')]];
  $('#adpdl').innerHTML = F.map(([k, v]) => `<div><dt>${esc(auT(k))}</dt><dd>${v}</dd></div>`).join('');
  p.querySelectorAll('[data-adrole]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.adrole === u.role)); adUnconfirm(b); });
  const lb = $('#adlock');
  adUnconfirm(lb);
  lb.textContent = auT(u.locked ? 'Unlock account' : 'Lock account');
  lb.className = 'btn2 ' + (u.locked ? 'pri' : 'danger');
  lb.disabled = me && !u.locked;
  $('#adlr').hidden = u.locked; $('#adlrl').hidden = u.locked;
  adUnconfirm($('#adpwb'));
  if (!keep) {
    ['adprn', 'adpwn', 'adln'].forEach(id => auMsg(id, ''));
    $('#adpw').value = ''; $('#adlr').value = '';
    if (me) auMsg('adln', 'You cannot lock your own account');
    $('#adpw').type = 'password';
    const eye = p.querySelector('.au-eye'); if (eye) auEye(eye, true);
  }
  if (p.hidden) { p.hidden = false; $('#adpback').hidden = false; p.scrollTop = 0; if (!auCoarse()) $('#adpclose').focus({ preventScroll: true }); }
}
function adPanelClose() {
  const p = $('#adpanel');
  if (p.hidden) return;
  AD.sel = null;
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  vis(p, false); vis($('#adpback'), false);
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
  if (!u || b.disabled) return;
  if (k === 'role') {
    const r = b.dataset.adrole;
    if (r === u.role) return;
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adprn', '');
    try { await adRpc('admin_set_role', { p_uid: u.id, p_role: r }); u.role = r; auMsg('adprn', r === 'admin' ? 'This user is now an admin.' : 'This user is now a regular user.', 'ok'); track('admin', { act: 'role' }); if (SB.user && u.id === SB.user.id && r !== 'admin') { adCheck(); return; } }
    catch (e) { auMsg('adprn', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'pw') {
    const pw = $('#adpw').value;
    if (pw.length < 8) { auMsg('adpwn', 'Use at least 8 characters.', 'bad'); auShake($('#adpw').closest('.au-pw')); return; }
    if (utf8Len(pw) > 72) { auMsg('adpwn', 'Use at most 72 characters.', 'bad'); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adpwn', '');
    try { const r = await adRpc('admin_set_password', { p_uid: u.id, p_password: pw }); $('#adpw').value = ''; auMsg('adpwn', r === 'signed_out' ? 'New password saved. They were signed out on their devices.' : 'New password saved.', 'ok'); track('admin', { act: 'password' }); }
    catch (e) { auMsg('adpwn', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'lock') {
    const on = !u.locked;
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adln', '');
    try { await adRpc('admin_lock', { p_uid: u.id, p_locked: on, p_reason: on ? $('#adlr').value : null }); u.locked = on; u.locked_reason = on ? (String($('#adlr').value).replace(/\s+/g, ' ').trim().slice(0, 500) || null) : null; auMsg('adln', on ? 'Account locked. They now only see the blocked page.' : 'Account unlocked.', 'ok'); track('admin', { act: on ? 'lock' : 'unlock' }); }
    catch (e) { auMsg('adln', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  }
  adTiles(); adDraw(); adPanel(u, true);
  adLoad();
}

function tkBox(el, mode) {
  if (el._tk) return el;
  el._tk = { mode, list: null, cur: null, n: 0, sig: '', compose: false };
  el.classList.add('tk');
  el.dataset.mode = mode;
  el.innerHTML = `<div class="tk-side">${mode === 'user' ? `<form class="tk-new" novalidate hidden><div class="fld"><label>${esc(auT('Subject'))}</label><input class="tk-subj-in" maxlength="120" autocomplete="off"></div><div class="fld"><label>${esc(auT('Message'))}</label><textarea class="tk-body-in" maxlength="2000" rows="4"></textarea></div><div class="tk-row"><button class="btn2 tk-cancel" type="button" data-tk="cancel">${esc(auT('Cancel'))}</button><button class="btn2 pri" type="submit">${esc(auT('Send ticket'))}</button></div></form><button class="btn2 pri tk-open" type="button" data-tk="new">${esc(auT('New ticket'))}</button>` : ''}<div class="tk-list" role="list"></div></div><div class="tk-main" hidden><div class="tk-h"><button class="back" type="button" data-tk="back">${AD_ICO.back}${esc(auT('All tickets'))}</button><div class="tk-ht"><b class="tk-subj" translate="no"></b><span class="tk-meta"></span></div><button class="btn2 tk-tog" type="button" data-tk="toggle"></button></div><div class="tk-msgs" translate="no" aria-live="polite"></div><form class="tk-comp" novalidate><textarea maxlength="2000" rows="2" placeholder="${esc(auT('Write a message'))}"></textarea><button class="btn2 pri" type="submit" aria-label="${esc(auT('Send'))}">${AD_ICO.send}<span>${esc(auT('Send'))}</span></button></form></div><div class="note tk-note" role="status"></div>`;
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
    if (T.mode === 'admin' && view === 'admin') adTiles();
  } catch (e) { if (!T.list) el.querySelector('.tk-list').innerHTML = `<div class="adm-empty">${esc(auT('Could not load the tickets. Check your connection and try again.'))}</div>`; }
}
function tkList(el) {
  const T = el._tk, L = T.list || [], adm = T.mode === 'admin';
  const nf = el.querySelector('.tk-new'), ob = el.querySelector('.tk-open');
  if (nf) { const show = T.compose || !L.length; nf.hidden = !show; ob.hidden = show; nf.querySelector('.tk-cancel').hidden = !L.length; }
  el.querySelector('.tk-list').innerHTML = L.length ? L.map((t, i) => {
    const who = adm ? (t.username ? '@' + t.username : t.email || '') : '';
    const flag = t.status === 'open' ? (adm ? (!t.last_admin ? adPill('Needs a reply', 'warn') : '') : (t.last_admin ? adPill('New reply', 'acc') : '')) : '';
    return `<button type="button" class="tk-item${t.id === T.cur ? ' on' : ''}" data-tk="open" data-id="${+t.id}" role="listitem" style="--i:${Math.min(i, 12)}"><span class="tk-it"><b translate="no">${esc(t.subject)}</b>${t.status === 'open' ? adPill('Open', 'ok') : adPill('Closed')}</span><span class="tk-is">${who ? `<span translate="no">${esc(who)}</span>` : ''}${adm && t.locked ? adPill('Locked', 'bad') : ''}${flag}<span>${esc(adAgo(t.updated_at))}</span><span>${esc(auT(t.messages === 1 ? '1 message' : '{n} messages').replace('{n}', +t.messages))}</span></span></button>`;
  }).join('') : adm ? `<div class="adm-empty">${esc(auT('No tickets yet.'))}</div>` : '';
}
function tkShow(el, main) {
  el.classList.toggle('tk-in', main);
  el.querySelector('.tk-main').hidden = !main;
  if (el._tk.mode === 'user') el.querySelector('.tk-side').hidden = main;
}
async function tkOpen(el, id) {
  const T = el._tk;
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
function tkHead(el) {
  const T = el._tk, t = (T.list || []).find(x => x.id === T.cur);
  if (!t) return;
  el.querySelector('.tk-meta').innerHTML = (T.mode === 'admin' ? `<span translate="no">${esc(t.username ? '@' + t.username : t.email || '')}</span>` : '') + (t.status === 'open' ? adPill('Open', 'ok') : adPill('Closed')) + `<span>${esc(auT('Opened {d}').replace('{d}', adDate(t.created_at)))}</span>`;
  const b = el.querySelector('.tk-tog');
  b.textContent = auT(t.status === 'open' ? 'Close ticket' : 'Reopen');
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
      return `<div class="tk-m${m.mine ? ' me' : ''}${m.is_admin ? ' tk-adm' : ''}${i >= old ? ' new' : ''}"><div class="tk-b">${esc(m.body)}</div><span class="tk-w">${esc(who)} · ${esc(adAgo(m.created_at))}</span></div>`;
    }).join('');
    if (near) box.scrollTop = box.scrollHeight;
  } catch (e) { tkNote(el, 'Could not load the messages. Check your connection and try again.', 'bad'); }
}
async function tkSend(el) {
  const T = el._tk, ta = el.querySelector('.tk-comp textarea'), b = el.querySelector('.tk-comp button'), v = ta.value.trim();
  if (!v || !T.cur) { auShake(ta); return; }
  b.disabled = true; b.classList.add('is-busy'); tkNote(el, '');
  try {
    await adRpc('ticket_send', { p_ticket: T.cur, p_body: v });
    ta.value = '';
    track('ticket', { act: 'send', admin: T.mode === 'admin' });
    await tkThread(el);
    await tkLoad(el); tkHead(el);
  } catch (e) { tkNote(el, adErr(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function tkCreate(el) {
  const f = el.querySelector('.tk-new'), s = f.querySelector('.tk-subj-in'), m = f.querySelector('.tk-body-in'), b = f.querySelector('[type=submit]');
  if (!s.value.trim()) { tkNote(el, 'Write a subject.', 'bad'); auShake(s.closest('.fld')); return; }
  if (!m.value.trim()) { tkNote(el, 'Write a message.', 'bad'); auShake(m.closest('.fld')); return; }
  b.disabled = true; tkNote(el, 'Sending…');
  try {
    const id = await adRpc('ticket_create', { p_subject: s.value, p_body: m.value });
    s.value = ''; m.value = ''; el._tk.compose = false;
    track('ticket', { act: 'create' });
    tkNote(el, '');
    await tkLoad(el);
    tkOpen(el, +id);
  } catch (e) { tkNote(el, adErr(e) === 'Too many messages. Wait a minute and try again.' ? 'Too many tickets. Wait a while and try again.' : adErr(e), 'bad'); }
  finally { b.disabled = false; }
}
async function tkAct(el, k, b) {
  const T = el._tk;
  if (k === 'new') { T.compose = true; tkList(el); if (!auCoarse()) el.querySelector('.tk-subj-in').focus(); return; }
  if (k === 'cancel') { T.compose = false; tkNote(el, ''); tkList(el); return; }
  if (k === 'open') { tkOpen(el, +b.dataset.id); return; }
  if (k === 'back') { T.cur = null; tkShow(el, false); tkNote(el, ''); tkList(el); tkLoad(el); return; }
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
  e.stopImmediatePropagation();
}, true);
function adBoot() {
  $('#adbout').addEventListener('click', () => { auSignOut(); });
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest && t.closest('[data-adgo]')) { e.preventDefault(); closeAll(); go(adHref(), false); }
  });
  const va = $('#vAdmin');
  va.addEventListener('click', e => {
    const t = e.target;
    const s = t.closest('[data-adsort]');
    if (s) { const k = s.dataset.adsort; AD.sort = AD.sort[0] === k ? [k, -AD.sort[1]] : [k, /_at$|last_seen|friends|email_confirmed|locked|role/.test(k) ? -1 : 1]; adDraw(); return; }
    const tb = t.closest('[data-adtab]');
    if (tb) { adTab(tb.dataset.adtab); return; }
    if (t.closest('#adref')) { adLoad(); tkLoad(tkBox($('#tka'), 'admin')); return; }
    if (t.closest('#adpback') || t.closest('#adpclose')) { adPanelClose(); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const a = t.closest('[data-adact]');
    if (a) { adAct(a.dataset.adact, a); return; }
    const tr = t.closest('#adt tbody tr[data-uid]');
    if (tr) { const u = (AD.users || []).find(x => x.id === tr.dataset.uid); if (u) adPanel(u); }
  });
  va.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#adpanel').hidden) { e.preventDefault(); e.stopPropagation(); adPanelClose(); return; }
    const tr = e.target.closest && e.target.closest('#adt tbody tr[data-uid]');
    if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tr.click(); }
  });
  $('#adtabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); adTab(AD.tab === 'users' ? 'tickets' : 'users'); $('#adtabs [aria-selected="true"]').focus(); } });
  $('#adq').addEventListener('input', e => { AD.q = e.target.value; adDraw(); });
  $('#adf').addEventListener('change', e => { AD.f = e.target.value; adDraw(); });
  $('#adpw').parentNode.insertAdjacentHTML('beforeend', EYE);
  $('#adpw').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('pw', $('#adpwb')); } });
  setInterval(() => {
    if (!SB.user || document.visibilityState === 'hidden') return;
    document.querySelectorAll('.tk').forEach(el => { if (!el._tk || el.closest('[hidden]')) return; if (el._tk.cur) tkThread(el); if (++el._tk.n % 5 === 0) tkLoad(el); });
  }, 6000);
  setInterval(() => { if (SB.user && document.visibilityState !== 'hidden') adCheck(); }, 180000);
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible' && Date.now() - AD.at > 60000) adCheck(); });
}
