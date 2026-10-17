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
    if (AD.del && Array.isArray(r) && !r.length) { AD.del = false; toast(auT('This account was deleted')); auSignOut(); return; }
    AD.del = false;
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
    $('#adt tbody').innerHTML = `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('Could not load the users. Check your connection and try again.'))}</td></tr>`;
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
const adPw = u => u.has_password ? adPill('Set · hidden', 'ok') : adPill('None · Google only');
const adHrs = sec => { const m = Math.round((+sec || 0) / 60); return m < 60 ? m + ' min' : (m / 60).toFixed(m < 600 ? 1 : 0) + ' h'; };
const adDot = () => `<span class="adm-dot" title="${esc(auT('Online now'))}"></span>`;
const AD_COLS = [
  ['id', 'User id', u => `${adDot(u)}<code title="${esc(u.id)}">${esc(u.id.slice(0, 8))}</code>`],
  ['email', 'Email', u => esc(u.email || '—')],
  ['username', 'Username', u => u.username ? '@' + esc(u.username) : '<span class="adm-mut">—</span>'],
  ['display_name', 'Display name', u => esc(u.display_name || '—')],
  ['last_sign_in_at', 'Last log in', u => `<span title="${esc(adDate(u.last_sign_in_at, 1))}">${esc(adAgo(u.last_sign_in_at))}</span>`],
  ['last_seen', 'Last used website', u => `<span class="ls-on">${adPill('Online now', 'ok')}</span><span class="ls-off" title="${esc(adDate(u.last_seen, 1))}">${esc(adAgo(u.last_seen))}</span>`],
  ['providers', 'Log in method', u => esc(adProv(u))],
  ['created_at', 'Account created', u => `<span title="${esc(adDate(u.created_at, 1))}">${esc(adDate(u.created_at))}</span>`],
  ['has_password', 'Password', adPw],
  ['fav_game', 'Favourite game', u => esc(adGame(u.fav_game))],
  ['friends', 'Friends', u => String(+u.friends || 0)],
  ['role', 'Role', u => u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User')],
  ['email_confirmed', 'Email confirmed', u => u.email_confirmed ? adPill('Yes', 'ok') : adPill('No', 'warn')],
  ['locked', 'Locked', u => u.locked ? `<span title="${esc(u.locked_reason || '')}">${adPill('Locked', 'bad')}</span>` : adPill('No')]
];
function adHead() {
  $('#adt thead').innerHTML = '<tr>' + AD_COLS.map(([k, l]) => k ? `<th><button type="button" data-adsort="${k}" aria-sort="${AD.sort[0] === k ? (AD.sort[1] > 0 ? 'ascending' : 'descending') : 'none'}">${esc(auT(l))}<i></i></button></th>` : `<th><span>${esc(auT(l))}</span></th>`).join('') + '</tr>';
}
function adSortVal(u, k) {
  const v = k === 'providers' ? adProv(u) : u[k];
  if (k === 'last_seen' && RT.pres[u.id]) return Date.now() + 1;
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
    if (f === 'online') return !!RT.pres[u.id];
    return true;
  }).sort((a, b) => { const x = adSortVal(a, k), y = adSortVal(b, k); const ex = x === '' || x === 0, ey = y === '' || y === 0; if (ex !== ey) return ex ? 1 : -1; return (x < y ? -1 : x > y ? 1 : 0) * d; });
}
function adDraw() {
  adHead();
  const rows = adRows(), tb = $('#adt tbody');
  $('#adcount').textContent = auT('{n} of {t} users').replace('{n}', rows.length).replace('{t}', (AD.users || []).length);
  tb.innerHTML = rows.length ? rows.map((u, i) => `<tr tabindex="0" data-uid="${esc(u.id)}" class="${u.id === AD.sel ? 'sel' : ''}${RT.pres[u.id] ? ' on' : ''}" style="--i:${Math.min(i, 14)}">${AD_COLS.map(c => `<td>${c[2](u)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('No users match.'))}</td></tr>`;
}
function adTab(t) {
  AD.tab = t;
  const tabs = $('#adtabs');
  tabs.dataset.m = t;
  tabs.querySelectorAll('[data-adtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.adtab === t)));
  $('#adusers').hidden = t !== 'users'; $('#adtickets').hidden = t !== 'tickets'; $('#adstats').hidden = t !== 'stats';
  if (t === 'tickets') tkLoad(tkBox($('#tka'), 'admin'));
  if (t === 'stats') stLoad();
}
function adLiveTxt(u) {
  const pr = RT.pres[u.id];
  if (!pr) return `<span class="adm-mut">${esc(auT('Offline'))} · ${esc(auT('last seen {t}').replace('{t}', adAgo(u.last_seen)))}</span>`;
  return `<span class="adm-dot"></span><b>${esc(auT('Online now'))}</b> · ${esc(pr.g ? auT('playing {g}').replace('{g}', adGame(pr.g)) : auT('browsing'))}`;
}
function adPanel(u, keep) {
  AD.sel = u.id;
  const p = $('#adpanel'), me = SB.user && SB.user.id === u.id, name = u.display_name || u.username || u.email || '?';
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  const tr = document.querySelector(`#adt tr[data-uid="${CSS.escape(u.id)}"]`); if (tr) tr.classList.add('sel');
  p.querySelector('.pic').textContent = name.charAt(0).toUpperCase();
  $('#adpn').textContent = name;
  $('#adpu').innerHTML = esc(u.username ? '@' + u.username : u.email || '') + ' ' + (u.role === 'admin' ? adPill('Admin', 'acc') : '') + (u.locked ? adPill('Locked', 'bad') : '') + (u.email_confirmed ? '' : adPill('Email not confirmed', 'warn'));
  $('#adplive').innerHTML = adLiveTxt(u);
  $('#adpq').innerHTML = [['Time played', adHrs(u.seconds_played)], ['Plays', String(+u.plays || 0)], ['Friends', String(+u.friends || 0)], ['Favourite game', adGame(u.fav_game)]].map(([k, v]) => `<div><small>${esc(auT(k))}</small><b>${esc(v)}</b></div>`).join('');
  const F = [['User id', `<code>${esc(u.id)}</code>`], ['Email', esc(u.email || '—')], ['Username', u.username ? '@' + esc(u.username) : '—'], ['Display name', esc(u.display_name || '—')], ['Last log in', esc(adDate(u.last_sign_in_at, 1))], ['Last used website', esc(adDate(u.last_seen, 1))], ['Log in method', esc(adProv(u))], ['Account created', esc(adDate(u.created_at, 1))], ['Password', adPw(u)], ['Favourite game', esc(adGame(u.fav_game))], ['Friends', String(+u.friends || 0)], ['Role', u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User')], ['Email confirmed', u.email_confirmed ? esc(adDate(u.email_confirmed_at, 1)) : adPill('No', 'warn')], ['Locked', u.locked ? adPill('Locked', 'bad') + (u.locked_reason ? `<div class="adm-why">${esc(u.locked_reason)}</div>` : '') : adPill('No')], ['Last game opened', esc(adGame(u.last_game))], ['Language', esc(adLangName(u.last_lang))]];
  $('#adpdl').innerHTML = F.map(([k, v]) => `<div><dt>${esc(auT(k))}</dt><dd>${v}</dd></div>`).join('');
  p.querySelectorAll('[data-adrole]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.adrole === u.role)); adUnconfirm(b); });
  const lb = $('#adlock');
  adUnconfirm(lb);
  lb.textContent = auT(u.locked ? 'Unlock account' : 'Lock account');
  lb.className = 'btn2 ' + (u.locked ? 'pri' : 'danger');
  lb.disabled = me && !u.locked;
  $('#adlr').hidden = u.locked; $('#adlrl').hidden = u.locked;
  ['adpwb', 'adrst', 'adunb', 'addelb'].forEach(id => adUnconfirm($('#' + id)));
  $('#adrst').disabled = !u.email;
  $('#adpwt').textContent = auT(u.has_password ? 'Hidden (hashed). Passwords are stored as one-way hashes, so nobody can see them.' : 'This account has no password: it signs in with Google.');
  $('#addelb').disabled = !!me || u.role === 'admin';
  if (!keep) {
    ['adprn', 'adpwn', 'adln', 'adrstn', 'adunn', 'addeln'].forEach(id => auMsg(id, ''));
    $('#adpw').value = ''; $('#adlr').value = ''; $('#addel').value = ''; $('#adun').value = u.username || '';
    if (me) { auMsg('adln', 'You cannot lock your own account'); auMsg('addeln', 'You cannot delete your own account here.'); }
    else if (u.role === 'admin') auMsg('addeln', 'Make this admin a regular user first.');
    $('#adpw').type = 'password';
    const eye = p.querySelector('.au-eye'); if (eye) auEye(eye, true);
    adGames(u);
  }
  if (p.hidden) { p.hidden = false; $('#adpback').hidden = false; p.scrollTop = 0; if (!auCoarse()) $('#adpclose').focus({ preventScroll: true }); }
}
async function adGames(u) {
  const box = $('#adpg');
  box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i>';
  try {
    const r = await adRpc('admin_user_games', { p_uid: u.id });
    if (AD.sel !== u.id) return;
    const L = Array.isArray(r) ? r : [], max = Math.max(1, ...L.map(g => +g.seconds_played || 0));
    box.innerHTML = L.length ? L.map(g => `<div class="adp-g"><span>${esc(adGame(g.game_id))}</span><b>${esc(adHrs(g.seconds_played))}</b><i style="--w:${Math.max(2, Math.round(100 * (+g.seconds_played || 0) / max))}%"></i><small>${esc(auT('{n} plays').replace('{n}', +g.plays || 0))}${g.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', g.best_score)) : ''}</small></div>`).join('') : `<div class="adm-mut">${esc(auT('No games played yet.'))}</div>`;
  } catch (e) { box.innerHTML = `<div class="adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
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
    try { await adRpc('admin_set_role', { p_uid: u.id, p_role: r }); u.role = r; auMsg('adprn', r === 'admin' ? 'This user is now an admin.' : 'This user is now a regular user.', 'ok'); track('admin', { act: 'role' }); rtSend(u.id, { t: 'status' }); if (SB.user && u.id === SB.user.id && r !== 'admin') { adCheck(); return; } }
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
  } else if (k === 'reset') {
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adrstn', '');
    try { const c = await sbClient(); const { error } = await c.auth.resetPasswordForEmail(u.email, { redirectTo: sbRedirect('recovery') }); if (error) throw error; auMsg('adrstn', auT('Sent to {e}. They get a 6-digit code to choose a new password.').replace('{e}', u.email), 'ok'); track('admin', { act: 'reset' }); }
    catch (e) { auMsg('adrstn', auErrText(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'un') {
    const v = $('#adun').value.trim().toLowerCase().replace(/^@/, '');
    if (v === (u.username || '')) return;
    if (!UN_RE.test(v) || /^\.|\.$|\.\./.test(v)) { auMsg('adunn', 'Use 3 to 20 lowercase letters, numbers, dots or underscores.', 'bad'); auShake($('#adun')); return; }
    b.disabled = true; b.classList.add('is-busy'); auMsg('adunn', '');
    try { u.username = await adRpc('admin_set_username', { p_uid: u.id, p_name: v }); auMsg('adunn', 'Username saved.', 'ok'); track('admin', { act: 'username' }); rtSend(u.id, { t: 'profile' }); }
    catch (e) { auMsg('adunn', /taken/i.test(e.message || '') ? 'That username is taken.' : /not allowed/i.test(e.message || '') ? 'That username is not allowed.' : adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'del') {
    const t = $('#addel').value.trim().toLowerCase().replace(/^@/, '');
    if (!t || (t !== String(u.username || '').toLowerCase() && t !== String(u.email || '').toLowerCase())) { auMsg('addeln', 'Type the username or email exactly to confirm.', 'bad'); auShake($('#addel')); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('addeln', '');
    try {
      await adRpc('admin_delete_user', { p_uid: u.id });
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
    try { await adRpc('admin_lock', { p_uid: u.id, p_locked: on, p_reason: on ? $('#adlr').value : null }); u.locked = on; u.locked_reason = on ? (String($('#adlr').value).replace(/\s+/g, ' ').trim().slice(0, 500) || null) : null; auMsg('adln', on ? 'Account locked. They now only see the blocked page.' : 'Account unlocked.', 'ok'); track('admin', { act: on ? 'lock' : 'unlock' }); rtSend(u.id, { t: 'status' }); }
    catch (e) { auMsg('adln', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  }
  adTiles(); adDraw(); adPanel(u, true);
  adLoad();
}

const ST = { d: null, at: 0, busy: false, sort: ['launches_7d', -1], q: '' };
const stN = v => (+v || 0).toLocaleString(adLang());
async function stLoad(force) {
  if (!adIsAdmin() || ST.busy) return;
  if (!force && ST.d && Date.now() - ST.at < 20000) { stDraw(); return; }
  ST.busy = true;
  const box = $('#adstats');
  if (!ST.d) box.innerHTML = '<div class="tiles adm-tiles">' + '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(8) + '</div><i class="sk sk-chart"></i>';
  try { ST.d = await adRpc('admin_stats'); ST.at = Date.now(); stDraw(); }
  catch (e) { if (!ST.d) box.innerHTML = `<div class="adm-empty">${esc(auT('Could not load the stats. Check your connection and try again.'))}</div>`; }
  finally { ST.busy = false; }
}
function stLive() {
  const box = $('#stlive');
  if (!box) return;
  const P = Object.entries(RT.pres), by = {};
  P.forEach(([, p]) => { const k = p.g || ''; by[k] = (by[k] || 0) + 1; });
  const top = Object.entries(by).filter(([k]) => k).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $('#stln').textContent = P.length;
  box.innerHTML = P.length ? P.sort((a, b) => (b[1].g ? 1 : 0) - (a[1].g ? 1 : 0)).map(([id, p]) => {
    const u = (AD.users || []).find(x => x.id === id), name = p.d || p.u || (u && (u.display_name || u.username || u.email)) || '?';
    return `<button class="st-on" type="button" data-stu="${esc(id)}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot on"></i></span><span><b>${esc(name)}</b><small>${esc(p.u ? '@' + p.u : '')}${p.h ? ' · ' + esc(auT('hidden from friends')) : ''}</small></span><em>${esc(p.g ? adGame(p.g) : auT('Browsing'))}</em></button>`;
  }).join('') : `<div class="adm-mut">${esc(auT('Nobody is online right now.'))}</div>`;
  $('#stlg').innerHTML = top.map(([g, n]) => `<span class="adm-pill acc">${esc(adGame(g))} · ${n}</span>`).join('');
}
function stBars(rows, key, lab, fmt) {
  if (!rows.length) return `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`;
  const max = Math.max(1, ...rows.map(r => +r[key] || 0)), W = 600, H = 150, bw = W / rows.length;
  return `<svg class="st-svg" viewBox="0 0 ${W} ${H + 18}" preserveAspectRatio="none" role="img" aria-label="${esc(auT(lab))}">${rows.map((r, i) => { const v = +r[key] || 0, h = Math.max(v ? 3 : 1, Math.round(H * v / max)); return `<g><title>${esc(adDate(r.day))}: ${esc(fmt ? fmt(v) : stN(v))}</title><rect x="${(i * bw + bw * .14).toFixed(1)}" y="${H - h}" width="${(bw * .72).toFixed(1)}" height="${h}" rx="3"/></g>`; }).join('')}<text x="0" y="${H + 14}">${esc(adDate(rows[0].day))}</text><text x="${W}" y="${H + 14}" text-anchor="end">${esc(adDate(rows[rows.length - 1].day))}</text></svg><div class="st-max">${esc(auT('max {n}').replace('{n}', fmt ? fmt(max) : stN(max)))}</div>`;
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
const ST_GC = [['game_id', 'Game', g => esc(adGame(g.game_id))], ['', 'Status', stHealth], ['launches', 'Launches', g => stN(g.launches)], ['launches_7d', 'Launches 7 days', g => stN(g.launches_7d)], ['players', 'Players', g => stN(g.players)], ['plays', 'Rounds played', g => stN(g.plays)], ['hours', 'Hours played', g => (+g.hours || 0).toFixed(1)], ['hours_7d', 'Hours 7 days', g => (+g.hours_7d || 0).toFixed(1)], ['avg_min', 'Avg minutes per visit', g => (+g.avg_min || 0).toFixed(1)], ['accounts', 'Accounts with records', g => stN(g.accounts)], ['errors_7d', 'Errors 7 days', g => +g.errors_7d ? `<b class="st-bad">${stN(g.errors_7d)}</b>` : '0'], ['last_error', 'Last error', g => g.last_error ? `<span title="${esc(g.last_error)}">${esc(String(g.last_error).slice(0, 60))}</span>` : '<span class="adm-mut">—</span>']];
function stGameRows() {
  const [k, d] = ST.sort, q = ST.q.trim().toLowerCase();
  return stGames().filter(g => !q || adGame(g.game_id).toLowerCase().includes(q) || g.game_id.includes(q)).sort((a, b) => { const x = k === 'game_id' ? adGame(a.game_id).toLowerCase() : +a[k] || 0, y = k === 'game_id' ? adGame(b.game_id).toLowerCase() : +b[k] || 0; return (x < y ? -1 : x > y ? 1 : 0) * d; });
}
function stGameTable() {
  const t = $('#stgt');
  if (!t) return;
  t.querySelector('thead').innerHTML = '<tr>' + ST_GC.map(([k, l]) => k ? `<th><button type="button" data-stsort="${k}" aria-sort="${ST.sort[0] === k ? (ST.sort[1] > 0 ? 'ascending' : 'descending') : 'none'}">${esc(auT(l))}<i></i></button></th>` : `<th><span>${esc(auT(l))}</span></th>`).join('') + '</tr>';
  t.querySelector('tbody').innerHTML = stGameRows().map(g => `<tr data-stg="${esc(g.game_id)}">${ST_GC.map(c => `<td>${c[2](g)}</td>`).join('')}</tr>`).join('');
}
function stDraw() {
  const D = ST.d || {}, O = D.overview || {}, box = $('#adstats');
  const T = [['Accounts', O.accounts], ['New accounts 7 days', O.new_accounts_7d], ['Active today', O.active_today], ['Active 7 days', O.active_7d], ['Active 30 days', O.active_30d], ['Game launches 7 days', O.launches_7d], ['Hours played 7 days', O.hours_played_7d], ['Events recorded', O.events]];
  const G = stGames(), work = G.filter(g => +g.launches || +g.plays), bad = G.filter(g => +g.errors_7d > 0).length;
  const PL = (D.players || []).slice(0, 100), ER = D.errors || [], DV = D.devices || [], SQ = D.searches || [], RE = D.retention || [];
  box.innerHTML = `
  <div class="st-top"><div class="st-card st-livec"><div class="st-h"><h3><i class="adm-dot"></i>${esc(auT('Live now'))}</h3><b class="st-big" id="stln">0</b></div><div class="st-lg" id="stlg"></div><div class="st-live" id="stlive"></div></div>
  <div class="tiles adm-tiles st-tiles">${T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b${Number.isInteger(+n || 0) ? ` data-n="${+n || 0}"` : ''}>${stN(n)}</b></div>`).join('')}<div class="tile" style="--i:8"><small>${esc(auT('Games played at least once'))}</small><b>${work.length} / ${G.length}</b></div><div class="tile" style="--i:9"><small>${esc(auT('Games with errors (7 days)'))}</small><b class="${bad ? 'st-bad' : ''}">${bad}</b></div></div></div>
  <div class="st-grid"><div class="st-card"><h3>${esc(auT('Active players per day'))}</h3>${stBars(D.daily || [], 'active_players', 'Active players per day')}</div><div class="st-card"><h3>${esc(auT('Hours played per day'))}</h3>${stBars(D.daily || [], 'hours_played', 'Hours played per day', v => (+v).toFixed(1) + ' h')}</div><div class="st-card"><h3>${esc(auT('New accounts per day'))}</h3>${stBars(D.signups || [], 'signups', 'New accounts per day')}</div></div>
  <div class="st-card"><div class="st-h"><h3>${esc(auT('Games'))}</h3><label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="stq" type="search" placeholder="${esc(auT('Search games'))}" autocomplete="off" value="${esc(ST.q)}"></label></div><div class="adm-tw"><table class="adm-t st-t" id="stgt"><thead></thead><tbody translate="no"></tbody></table></div></div>
  <div class="st-card"><h3>${esc(auT('Time played per player'))}</h3><div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Player', 'Game', 'Time played', 'Rounds', 'Best', 'Last played'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody translate="no">${PL.length ? PL.map(p => `<tr data-stu="${esc(p.user_id)}"><td>${esc(p.display_name || p.username || '—')}${p.username ? ` <span class="adm-mut">@${esc(p.username)}</span>` : ''}</td><td>${esc(adGame(p.game_id))}</td><td>${esc(adHrs(p.seconds_played))}</td><td>${stN(p.plays)}</td><td>${p.best_score != null ? esc(String(p.best_score)) : '—'}</td><td>${esc(adAgo(p.last_played))}</td></tr>`).join('') : `<tr><td colspan="6" class="adm-empty">${esc(auT('No games played yet.'))}</td></tr>`}</tbody></table></div></div>
  <div class="st-grid">
   <div class="st-card"><h3>${esc(auT('Recent errors'))}</h3><div class="st-list">${ER.length ? ER.slice(0, 30).map(e => `<div class="st-err"><b>${esc(adGame(e.game_id))}</b><span>${esc(e.message || '')}</span><small>${esc(e.place || '')} · ${esc(e.device || '')} · ${esc(adAgo(e.created_at))}</small></div>`).join('') : `<div class="adm-mut">${esc(auT('No errors. Everything works.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Devices'))}</h3><div class="st-list">${DV.length ? DV.map(d => `<div class="st-kv"><span>${esc([d.device, d.os, d.browser].filter(Boolean).join(' · '))}</span><b>${stN(d.sessions)}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Top searches'))}</h3><div class="st-list">${SQ.length ? SQ.map(s => `<div class="st-kv"><span>${esc(s.query)}${+s.with_no_results ? ` <span class="adm-pill warn">${esc(auT('no result'))}</span>` : ''}</span><b>${stN(s.searches)}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Players coming back'))}</h3><div class="st-list">${RE.length ? RE.map(r => `<div class="st-kv"><span>${esc(adDate(r.cohort_day))} · ${esc(auT('{n} new').replace('{n}', r.new_players))}</span><b>${esc(auT('next day {a}% · week {b}%').replace('{a}', r.day1_pct).replace('{b}', r.back_within_7d_pct))}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
  </div>
  <p class="adm-mut st-at">${esc(auT('Updated {t}. Refreshes every 30 seconds; the live list updates instantly.').replace('{t}', new Date(D.at || Date.now()).toLocaleTimeString()))}</p>`;
  countUp(box.querySelector('.st-tiles'));
  stGameTable(); stLive();
}
function stBoot() {
  const box = $('#adstats');
  box.addEventListener('click', e => {
    const s = e.target.closest('[data-stsort]');
    if (s) { const k = s.dataset.stsort; ST.sort = ST.sort[0] === k ? [k, -ST.sort[1]] : [k, k === 'game_id' ? 1 : -1]; stGameTable(); return; }
    const u = e.target.closest('[data-stu]');
    if (u) { const x = (AD.users || []).find(y => y.id === u.dataset.stu); if (x) adPanel(x); return; }
    const g = e.target.closest('[data-stg]');
    if (g && byId.has(g.dataset.stg)) { go(href(g.dataset.stg), false); }
  });
  box.addEventListener('input', e => { if (e.target.id === 'stq') { ST.q = e.target.value; stGameTable(); } });
  setInterval(() => { if (view === 'admin' && AD.tab === 'stats' && document.visibilityState === 'visible') stLoad(true); }, 30000);
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
    if (t.closest('#adref')) { adLoad(); tkLoad(tkBox($('#tka'), 'admin')); if (AD.tab === 'stats') stLoad(true); return; }
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
  $('#adtabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const T = ['users', 'tickets', 'stats'], i = T.indexOf(AD.tab); adTab(T[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3]); $('#adtabs [aria-selected="true"]').focus(); } });
  stBoot();
  $('#adq').addEventListener('input', e => { AD.q = e.target.value; adDraw(); });
  $('#adf').addEventListener('change', e => { AD.f = e.target.value; adDraw(); });
  $('#adpw').parentNode.insertAdjacentHTML('beforeend', EYE);
  $('#adpw').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('pw', $('#adpwb')); } });
  $('#adun').addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; });
  $('#adun').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('un', $('#adunb')); } });
  setInterval(() => {
    if (!SB.user || document.visibilityState === 'hidden') return;
    document.querySelectorAll('.tk').forEach(el => { if (!el._tk || el.closest('[hidden]')) return; if (el._tk.cur) tkThread(el); if (++el._tk.n % 5 === 0) tkLoad(el); });
  }, 6000);
  setInterval(() => { if (SB.user && document.visibilityState !== 'hidden') adCheck(); }, 180000);
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible' && Date.now() - AD.at > 60000) adCheck(); });
}
