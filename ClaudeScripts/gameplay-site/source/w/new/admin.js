const AD = { role: null, locked: false, reason: null, until: null, ut: 0, uti: 0, at: 0, game: null, gat: 0, users: null, q: '', f: 'all', sort: ['created_at', -1], sel: null, tab: 'users', wait: 0, busy: false };
const adHref = () => (PATH_MODE ? '/' : '#/') + 'admin';
const adIsAdmin = () => (AD.role === 'admin' || AD.role === 'owner') && !AD.locked;
const adIsOwner = () => AD.role === 'owner' && !AD.locked;
const adStaff = u => u.role === 'admin' || u.role === 'owner';
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
const adRole = u => u.role === 'owner' ? adPill('Owner', 'acc') : u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User');
const adErr = e => { const m = String(e && e.message || ''); return /admins only/i.test(m) ? 'Admins only' : /change an owner/i.test(m) ? 'Only an owner can change an owner.' : /at least one owner/i.test(m) ? 'There must be at least one owner' : /owners only|owner can do/i.test(m) ? 'Only an owner can do this.' : /at least one admin/i.test(m) ? 'There must be at least one admin' : /own account/i.test(m) ? 'You cannot lock your own account' : /at least 8/i.test(m) ? 'Use at least 8 characters.' : /at most 72/i.test(m) ? 'Use at most 72 characters.' : /not found/i.test(m) ? 'Not found. Refresh and try again.' : /too many/i.test(m) ? 'Too many messages. Wait a minute and try again.' : /account locked/i.test(m) ? 'Your account is locked.' : /end time/i.test(m) ? 'Pick an end time in the future.' : /write a subject/i.test(m) ? 'Write a subject.' : /write a message/i.test(m) ? 'Write a message.' : 'Could not update. Check your connection and try again.'; };

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
  } catch (e) { if (view === 'admin' && !AD.at) adBounce(); }
}
function adSeen(id) {
  if (!SB.user || (AD.game === id && Date.now() - AD.gat < 60000)) return;
  AD.game = id; AD.gat = Date.now();
  adCheck(id);
}
function adSignedOut() {
  AD.role = null; AD.at = 0; AD.users = null; AD.sel = null; AD.until = null; clearTimeout(AD.ut);
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
    if (el.hidden) { el.hidden = false; const b = tkBox($('#tkb'), 'user'); tkLoad(b); }
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
  adTab(AD.tab);
  await adLoad();
  tkLoad(tkBox($('#tka'), 'admin'));
  setTimeout(stSample, 15000);
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
  const T = [['Accounts', U.length], ['New this week', U.filter(u => now - Date.parse(u.created_at) < 6048e5).length], ['Active today', U.filter(u => now - Date.parse(u.last_seen || 0) < 864e5).length], ['Admins', U.filter(adStaff).length], ['Locked', U.filter(u => u.locked).length], ['Open tickets', open]];
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
  ['role', 'Role', adRole],
  ['email_confirmed', 'Email confirmed', u => u.email_confirmed ? adPill('Yes', 'ok') : adPill('No', 'warn')],
  ['locked', 'Locked', u => u.locked ? `<span title="${esc(u.locked_reason || '')}">${adPill('Locked', 'bad')}</span><small class="adm-left">${esc(adLeft(u))}</small>` : adPill('No')]
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
    if (f === 'admin') return adStaff(u);
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
  $('#adusers').hidden = t !== 'users'; $('#adtickets').hidden = t !== 'tickets'; $('#adstats').hidden = t !== 'stats'; $('#adlog').hidden = t !== 'log'; $('#adsite').hidden = t !== 'site';
  if (t === 'tickets') tkLoad(tkBox($('#tka'), 'admin'));
  if (t === 'stats') stLoad();
  if (t === 'log') alLoad();
  if (t === 'site') sfaDraw();
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
  $('#adppic').textContent = name.charAt(0).toUpperCase();
  $('#adpn').textContent = name;
  $('#adpu').textContent = [u.username ? '@' + u.username : '', u.email || ''].filter(Boolean).join(' · ');
  $('#adpp').innerHTML = adRole(u) + (u.locked ? adPill('Locked', 'bad') + adPill(adLeft(u), 'bad') : '') + (u.email_confirmed ? adPill('Email confirmed', 'ok') : adPill('Email not confirmed', 'warn')) + (me ? adPill('You', 'acc') : '');
  $('#adplive').innerHTML = adLiveTxt(u);
  $('#adpq').innerHTML = [['Time played', adHrs(u.seconds_played), 'clock'], ['Plays', stN(u.plays), 'play'], ['Friends', stN(u.friends), 'users'], ['Favourite game', adGame(u.fav_game), 'star'], ['Account created', adAgo(u.created_at), 'cake'], ['Last seen', RT.pres[u.id] ? auT('Online now') : adAgo(u.last_seen), 'eye']].map(([k, v, i], n) => `<div style="--i:${n}">${AD_SI[i]}<small>${esc(auT(k))}</small><b title="${esc(v)}">${esc(v)}</b></div>`).join('');
  const F = [['User id', `<code>${esc(u.id)}</code>`], ['Email', esc(u.email || '—')], ['Username', u.username ? '@' + esc(u.username) : '—'], ['Display name', esc(u.display_name || '—')], ['Last log in', esc(adDate(u.last_sign_in_at, 1))], ['Last used website', esc(adDate(u.last_seen, 1))], ['Log in method', esc(adProv(u))], ['Account created', esc(adDate(u.created_at, 1))], ['Password', adPw(u)], ['Favourite game', esc(adGame(u.fav_game))], ['Friends', String(+u.friends || 0)], ['Role', adRole(u)], ['Email confirmed', u.email_confirmed ? esc(adDate(u.email_confirmed_at, 1)) : adPill('No', 'warn')], ['Locked', u.locked ? adPill('Locked', 'bad') + ` <span class="adm-mut">${esc(u.locked_until ? auT('until {d}').replace('{d}', adDate(u.locked_until, 1)) : auT('Permanent'))}</span>` + (u.locked_reason ? `<div class="adm-why">${esc(u.locked_reason)}</div>` : '') : adPill('No')], ['Last game opened', esc(adGame(u.last_game))], ['Language', esc(adLangName(u.last_lang))]];
  $('#adpdl').innerHTML = F.map(([k, v]) => `<div><dt>${esc(auT(k))}</dt><dd>${v}</dd></div>`).join('');
  const prot = u.role === 'owner' && !adIsOwner(), rl = adStaff(u) && !adIsOwner();
  p.querySelectorAll('[data-adrole]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.adrole === u.role)); b.disabled = rl; adUnconfirm(b); });
  const lb = $('#adlock');
  adUnconfirm(lb);
  lb.textContent = auT(u.locked ? 'Unlock account' : 'Lock account');
  lb.className = 'btn2 ' + (u.locked ? 'pri' : 'danger');
  lb.disabled = (me && !u.locked) || prot;
  $('#adlr').hidden = u.locked; $('#adlrl').hidden = u.locked; $('#adld').hidden = u.locked; $('#adldl').hidden = u.locked;
  const lt = $('#adlt'); lt.hidden = !u.locked; lt.textContent = u.locked ? (u.locked_until ? auT('Locked until {d} ({r}).').replace('{d}', adDate(u.locked_until, 1)).replace('{r}', adAgo(u.locked_until)) : auT('Locked with no end date.')) : '';
  ['adpwb', 'adrst', 'adunb', 'addelb'].forEach(id => adUnconfirm($('#' + id)));
  $('#adrst').disabled = !u.email || prot;
  $('#adpwb').disabled = prot; $('#adunb').disabled = prot;
  $('#adpwt').textContent = auT(u.has_password ? 'Hidden (hashed). Passwords are stored as one-way hashes, so nobody can see them.' : 'This account has no password: it signs in with Google.');
  $('#addelb').disabled = !!me || adStaff(u);
  if (!keep) {
    ['adprn', 'adpwn', 'adln', 'adrstn', 'adunn', 'addeln'].forEach(id => auMsg(id, ''));
    $('#adpw').value = ''; $('#adlr').value = ''; $('#addel').value = ''; $('#adun').value = u.username || '';
    if (me) { auMsg('adln', 'You cannot lock your own account'); auMsg('addeln', 'You cannot delete your own account here.'); }
    else if (adStaff(u)) auMsg('addeln', 'Make this admin a regular user first.');
    if (prot) auMsg('adprn', 'Only an owner can change an owner.'); else if (rl) auMsg('adprn', 'Only an owner can change the role of an admin.');
    $('#adpw').type = 'password';
    const eye = p.querySelector('.au-eye'); if (eye) auEye(eye, true);
    adGames(u);
    alHist(u);
    const was = p.hidden;
    vis(p, true);
    p.classList.remove('swap'); void p.offsetWidth; if (!was) p.classList.add('swap');
    requestAnimationFrame(() => p.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' }));
    if (was && !auCoarse()) p.focus({ preventScroll: true });
  }
}
async function adGames(u) {
  const box = $('#adpg');
  box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i><i class="sk sk-td"></i>';
  try {
    const r = await adRpc('admin_user_games', { p_uid: u.id });
    if (AD.sel !== u.id) return;
    const L = Array.isArray(r) ? r : [], max = Math.max(1, ...L.map(g => +g.seconds_played || 0));
    box.innerHTML = L.length ? L.map((g, i) => `<div class="apc-g" style="--i:${Math.min(i, 12)};--c:${esc(TINT[g.game_id] || 'var(--accent)')}"><span class="apc-gi">${esc(adGame(g.game_id).charAt(0))}</span><span class="apc-gn">${esc(adGame(g.game_id))}</span><b>${esc(adHrs(g.seconds_played))}</b><i><s style="width:${Math.max(2, Math.round(100 * (+g.seconds_played || 0) / max))}%"></s></i><small>${esc(auT('{n} plays').replace('{n}', +g.plays || 0))}${g.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', g.best_score)) : ''}${g.last_played ? ' · ' + esc(adAgo(g.last_played)) : ''}</small></div>`).join('') : `<div class="adm-mut apc-none">${esc(auT('No games played yet.'))}</div>`;
  } catch (e) { box.innerHTML = `<div class="adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
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
  if (!u || b.disabled) return;
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
    try { const c = await sbClient(); const { error } = await c.auth.resetPasswordForEmail(u.email, { redirectTo: sbRedirect('recovery') }); if (error) throw error; auMsg('adrstn', auT('Sent to {e}. They get a 6-digit code to choose a new password.').replace('{e}', u.email), 'ok'); track('admin', { act: 'reset' }); await adRpc('admin_log_reset', { p_uid: u.id }).catch(() => {}); alHist(u); }
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
    const hrs = +$('#adld').value || 0, until = on && hrs ? new Date(Date.now() + hrs * 3600e3).toISOString() : null;
    try {
      if (on) await adRpc('admin_lock_until', { p_uid: u.id, p_reason: $('#adlr').value, p_until: until }); else await adRpc('admin_lock', { p_uid: u.id, p_locked: false, p_reason: null });
      u.locked = on; u.locked_until = until; u.locked_reason = on ? (String($('#adlr').value).replace(/\s+/g, ' ').trim().slice(0, 500) || null) : null;
      auMsg('adln', on ? (until ? auT('Account locked until {d}. They only see the blocked page until then.').replace('{d}', adDate(until, 1)) : 'Account locked. They now only see the blocked page.') : 'Account unlocked.', 'ok'); track('admin', { act: on ? 'lock' : 'unlock', hrs }); rtSend(u.id, { t: 'status' });
    }
    catch (e) { auMsg('adln', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  }
  adTiles(); adDraw(); adPanel(u, true);
  alHist(u);
  adLoad();
}

const AL = { list: [], more: false, busy: false, seq: 0 };
const alWho = (un, dn, id) => un ? '@' + un : dn || (id ? id.slice(0, 8) : '');
const AL_T = { role_owner: '{a} made {t} an owner', role_admin: '{a} made {t} an admin', role_user: '{a} made {t} a regular user', username: '{a} changed the username of {t} to {n}', lock_until: '{a} locked {t} until {d}', lock: '{a} locked {t} with no end date', unlock: '{a} unlocked {t}', expire: 'The lock on {t} ended', password: '{a} set a new password for {t}', reset_email: '{a} sent a password reset email to {t}', delete_user: '{a} deleted the account of {t}', ticket_delete: '{a} deleted a ticket from {t}', ticket_reply: '{a} replied to a ticket from {t}', ticket_closed: '{a} closed a ticket from {t}', ticket_open: '{a} reopened a ticket from {t}', site: '{a} changed the site switches', site_password: '{a} changed the site password' };
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
  const ex = x.action === 'lock' && d.reason ? auT('Reason: {r}').replace('{r}', d.reason) : /^ticket_/.test(x.action) && d.subject ? '“' + d.subject + '”' : x.action === 'site' ? alSite(d) : x.action === 'username' && d.from ? auT('Was @{u}').replace('{u}', d.from) : '';
  const ic = { lock: AD_ICO.lock, unlock: AD_ICO.lock, expire: AD_SI.clock, delete_user: AD_ICO.trash, ticket_delete: AD_ICO.trash, site: SF_ICO.tool, site_password: AD_ICO.lock, ticket_reply: AD_ICO.send, ticket_status: AD_ICO.send, password: AD_SI.eye, reset_email: AD_SI.eye, role: AD_SI.star, username: AD_SI.users }[x.action] || AD_SI.clock;
  return `<div class="al-r al-${esc(x.action)}" style="--i:${Math.min(i, 14)}"><span class="al-i">${ic}</span><div class="al-t"><span>${txt}</span>${ex ? `<em>${esc(ex)}</em>` : ''}<small title="${esc(adDate(x.at, 1))}">${esc(adAgo(x.at))} · ${esc(adDate(x.at, 1))}</small></div></div>`;
}
async function alLoad(more) {
  if (!adIsAdmin() || AL.busy) return;
  AL.busy = true;
  const box = $('#adlog');
  if (!more && !AL.list.length) box.innerHTML = '<div class="st-card">' + '<i class="sk sk-td"></i>'.repeat(6) + '</div>';
  try {
    const r = await adRpc('admin_log_list', { p_limit: 50, p_before: more && AL.list.length ? AL.list[AL.list.length - 1].id : null, p_target: null });
    const L = Array.isArray(r) ? r : [];
    AL.list = more ? AL.list.concat(L) : L; AL.more = L.length === 50;
    box.innerHTML = `<div class="st-card al-card"><div class="sx-ch"><div><h3>${esc(auT('Admin log'))}</h3><p class="sx-note">${esc(auT('Every change made by an admin, newest first.'))}</p></div></div><div class="al-list" translate="no">${AL.list.length ? AL.list.map(alRow).join('') : `<div class="adm-empty">${esc(auT('Nothing here yet.'))}</div>`}</div>${AL.more ? `<button class="btn2 al-more" type="button" data-almore>${esc(auT('Show more'))}</button>` : ''}</div>`;
  } catch (e) { if (!AL.list.length) box.innerHTML = `<div class="adm-empty">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
  finally { AL.busy = false; }
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
    box.innerHTML = L.length ? L.map(alRow).join('') : `<div class="adm-mut apc-none">${esc(auT('No admin changes for this player yet.'))}</div>`;
  } catch (e) { if (n === AL.seq) box.innerHTML = `<div class="adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
}

const sfaLocal = iso => { const t = Date.parse(iso || ''); if (!t) return ''; const d = new Date(t); return new Date(t - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
function sfaDraw() {
  const d = SF.d || {}, box = $('#adsite'), off = new Set(d.disabled_games || []);
  box.innerHTML = `<div class="sfa">
  <div class="st-card sfa-c"><div class="sfa-row"><div><h3>${esc(auT('Maintenance mode'))}</h3><p class="sx-note">${esc(auT('Players see a maintenance page. Admins can still use the site.'))}</p></div><button class="sw${d.maintenance ? ' on' : ''}" type="button" role="switch" id="sfam" aria-checked="${!!d.maintenance}" aria-label="${esc(auT('Maintenance mode'))}"></button></div>
   <label class="apc-l" for="sfamm">${esc(auT('Message on the maintenance page (optional)'))}</label><textarea id="sfamm" maxlength="500" rows="2" placeholder="${esc(auT('We are making the site better. Please come back in a little while.'))}">${esc(d.maintenance_msg || '')}</textarea></div>
  <div class="st-card sfa-c"><h3>${esc(auT('Announcement banner'))}</h3><p class="sx-note">${esc(auT('Shown at the top of the site for everyone. Leave it empty to hide it.'))}</p>
   <textarea id="sfab" maxlength="300" rows="2">${esc(d.banner || '')}</textarea>
   <div class="sfa-2"><label class="apc-l">${esc(auT('Style'))}<select id="sfal"><option value="info"${d.banner_level !== 'warning' ? ' selected' : ''}>${esc(auT('Info'))}</option><option value="warning"${d.banner_level === 'warning' ? ' selected' : ''}>${esc(auT('Warning'))}</option></select></label><label class="apc-l">${esc(auT('Ends (optional)'))}<input type="datetime-local" id="sfau" value="${esc(sfaLocal(d.banner_until))}"></label></div></div>
  <div class="st-card sfa-c"><h3>${esc(auT('Turned off games'))}</h3><p class="sx-note">${esc(auT('These games show as temporarily unavailable and cannot be started.'))}</p>
   <label class="search sfa-q"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="sfaq" type="search" placeholder="${esc(auT('Search games'))}" autocomplete="off" spellcheck="false" aria-label="${esc(auT('Search games'))}"></label>
   <div class="sfa-g" id="sfag" translate="no">${games.slice().sort((a, b) => (off.has(b.id) - off.has(a.id)) || a.title.localeCompare(b.title)).map(g => `<button type="button" class="chip" data-sfg="${esc(g.id)}" aria-pressed="${off.has(g.id)}">${esc(g.title)}</button>`).join('')}</div>
   <label class="apc-l" for="sfadm">${esc(auT('Message for turned off games (optional)'))}</label><textarea id="sfadm" maxlength="300" rows="2" placeholder="${esc(auT('This game is being fixed. Try again a bit later.'))}">${esc(d.disabled_msg || '')}</textarea></div>
  <div class="sfa-f"><div class="note" id="sfan" role="status"></div><button class="btn2 pri" type="button" id="sfas">${esc(auT('Save and publish'))}</button></div>${adIsOwner() ? `
  <div class="st-card sfa-c" id="sfpw"><h3>${esc(auT('Site password'))}</h3><p class="sx-note">${esc(auT('The password everyone types to open the site. Only owners can see and change this.'))}</p>
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
async function sfpSave(b) {
  const a = $('#sfp1').value, c = $('#sfp2').value;
  if (a.length < 6) { auMsg('sfpn', 'Use at least 6 characters.', 'bad'); auShake($('#sfp1').closest('.au-pw')); return; }
  if (a !== c) { auMsg('sfpn', 'The two passwords do not match.', 'bad'); auShake($('#sfp2').closest('.au-pw')); return; }
  if (!LZ.key) { auMsg('sfpn', 'This copy of the site is not password protected.', 'bad'); return; }
  if (!adConfirm(b)) return;
  b.disabled = true; b.classList.add('is-busy'); auMsg('sfpn', '');
  try {
    await adRpc('owner_set_gate', { p_slot: await gpSlot(a, lzB64(LZ.key)) });
    $('#sfp1').value = ''; $('#sfp2').value = '';
    auMsg('sfpn', 'Site password changed. Everyone needs the new password; devices that already unlocked this version stay unlocked.', 'ok');
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

const ST = { d: null, at: 0, busy: false, days: 30, game: null, ci: -1, anim: true, ps: 0, ch: {} };
const stN = v => (+v || 0).toLocaleString(adLang());
const stH = v => { const n = +v || 0; return (n < 10 ? n.toFixed(1) : stN(Math.round(n))) + ' h'; };
const stDay = (t, o) => { const d = Date.parse(String(t).slice(0, 10) + 'T12:00:00'); try { return new Date(d).toLocaleDateString(adLang(), o || { day: 'numeric', month: 'short' }); } catch (e) { return String(t).slice(0, 10); } };
const stNice = (v, int) => { if (!(v > 0)) return int ? 2 : 1; if (int && v <= 5) return Math.max(2, Math.ceil(v / 2) * 2); const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const ST_DEV = { desktop: 'Desktop', phone: 'Phone', tablet: 'Tablet', unknown: 'Unknown' }, ST_DK = { desktop: 0, phone: 1, tablet: 2, unknown: 'o' };
async function stLoad(force) {
  if (!adIsAdmin() || ST.busy) return;
  if (!force && ST.d && Date.now() - ST.at < 20000) { stDraw(); return; }
  ST.busy = true;
  const box = $('#adstats');
  box.classList.add('sx-busy');
  if (!ST.d) box.innerHTML = '<div class="tiles adm-tiles">' + '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(4) + '</div><i class="sk sk-chart"></i><i class="sk sk-chart"></i>';
  try {
    ST.d = await adRpc('admin_stats_v2', { p_days: ST.days }).catch(e => { if (/admins only/i.test(e.message || '')) throw e; return adRpc('admin_stats'); });
    ST.at = Date.now(); stDraw();
  } catch (e) { if (!ST.d) box.innerHTML = `<div class="adm-empty">${esc(auT('Could not load the stats. Check your connection and try again.'))}</div>`; }
  finally { ST.busy = false; box.classList.remove('sx-busy'); }
}
function stSample() {
  if (view !== 'admin' || !adIsAdmin() || document.visibilityState === 'hidden' || Date.now() - ST.ps < 295000) return;
  ST.ps = Date.now();
  adRpc('admin_presence_sample', { p_online: Object.keys(RT.pres).length }).catch(() => {});
}
function stLive() {
  const box = $('#stlive');
  if (!box) return;
  const P = Object.entries(RT.pres), by = {};
  P.forEach(([, p]) => { const k = p.g || ''; by[k] = (by[k] || 0) + 1; });
  const top = Object.entries(by).filter(([k]) => k).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $('#stln').textContent = P.length;
  box.innerHTML = P.length ? P.sort((a, b) => (b[1].g ? 1 : 0) - (a[1].g ? 1 : 0)).map(([id, p]) => {
    const u = (AD.users || []).find(x => x.id === id), name = (u && (u.display_name || u.username || u.email)) || id.slice(0, 8);
    return `<button class="st-on" type="button" data-stu="${esc(id)}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot on"></i></span><span><b>${esc(name)}</b><small>${esc(u && u.username ? '@' + u.username : '')}${p.h ? ' · ' + esc(auT('hidden from friends')) : ''}</small></span><em>${esc(p.g ? adGame(p.g) : auT('Browsing'))}</em></button>`;
  }).join('') : `<div class="adm-mut sx-nobody">${esc(auT('Nobody is online right now.'))}</div>`;
  $('#stlg').innerHTML = top.map(([g, n]) => `<span class="adm-pill acc">${esc(adGame(g))} · ${n}</span>`).join('');
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
  if (bar && n) { const bw = W / n * (n > 40 ? .78 : .64); g += vals[0].map((v, i) => { const h = Math.max(v ? 2 : 0, H * (v || 0) / max); return `<rect data-i="${i}" style="--i:${i}" x="${(X(i) - bw / 2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}"/>`; }).join(''); }
  else g += vals.map((vs, s) => { const [d, a] = stPath(vs.map((v, i) => v == null ? null : [+X(i).toFixed(1), Y(v)]), H); return (s ? '' : `<path class="sx-a" d="${a}" fill="url(#sxg-${id})"/>`) + `<path class="sx-l sx-s${s}" d="${d}"/>`; }).join('');
  const lab = v => o.dec ? fmt(v) : stN(v);
  const xl = n ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, A) => A.indexOf(v) === i).map(i => `<span style="left:${(100 * X(i) / W).toFixed(2)}%">${esc(stDay(rows[i].day))}</span>`).join('') : '';
  return `<div class="st-card sx-c${o.wide ? ' sx-wide' : ''}" style="--i:${o.i || 0}">
   <div class="sx-ch"><div><h3>${esc(auT(title))}</h3>${o.note ? `<p class="sx-note">${esc(auT(o.note))}</p>` : ''}</div><div class="sx-kpi"><b>${esc(o.dec ? fmt(kv) : stN(Math.round(kv * 10) / 10))}</b><small>${esc(auT(kl))}</small></div></div>
   ${keys.length > 1 ? `<div class="sx-leg">${keys.map((k, s) => `<span><i class="sx-s${s}"></i>${esc(auT(k.l))}</span>`).join('')}</div>` : ''}
   <div class="sx-plot"><div class="sx-y" aria-hidden="true"><span>${esc(lab(max))}</span><span>${esc(lab(max / 2))}</span><span>0</span></div>
    <div class="sx-area" data-ch="${id}">
     <svg class="sx-svg${bar ? ' sx-bars' : ''}${ST.anim ? ' an' : ''}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(auT(title))}"><defs><linearGradient id="sxg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sx0);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--sx0);stop-opacity:0"/></linearGradient></defs>${g}</svg>
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
  if (!tot) return `<div class="adm-mut sx-empty">${esc(auT('No data yet.'))}</div>`;
  const top = L.slice(0, 5), rest = L.slice(5).reduce((s, x) => s + x[1], 0);
  if (rest > 0) top.push(['', rest]);
  let off = 0;
  const gap = top.length > 1 ? .8 : 0;
  const segs = top.map(([id, h], s) => { const p = 100 * h / tot, len = Math.max(.01, p - gap), c = `<circle class="sx-seg sx-k${id ? s : 'o'}" data-seg="${s}" cx="21" cy="21" r="15.915" pathLength="100" stroke-dasharray="${len.toFixed(2)} ${(100 - len).toFixed(2)}" stroke-dashoffset="${(25 - off).toFixed(2)}" style="--i:${s}"><title>${esc(id ? adGame(id) : auT('Other games'))}: ${esc(stH(h))} (${Math.round(p)}%)</title></circle>`; off += p; return c; }).join('');
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
  if (!tot) return `<div class="adm-mut sx-empty">${esc(auT('No data yet.'))}</div>`;
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
function stSpark(a) {
  if (!a || !a.length) return '';
  const max = Math.max(1, ...a), n = a.length, W = 120, H = 34, X = i => n > 1 ? i * W / (n - 1) : W / 2, P = a.map((v, i) => [+X(i).toFixed(1), +(H - 2 - (H - 4) * v / max).toFixed(1)]), [d, ar] = stPath(P, H);
  return `<svg class="sx-spark${ST.anim ? ' an' : ''}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="sx-a" d="${ar}"/><path class="sx-l sx-s0" d="${d}"/></svg>`;
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
  ul.innerHTML = O.length ? O.map((o, i) => `<li role="option" id="stgo${i}" data-g="${esc(o.id)}" aria-selected="${o.id === ST.game}" class="${i === ST.ci ? 'act' : ''}"><i style="background:${esc(TINT[o.id] || 'var(--accent)')}"></i><span translate="no">${hl(o.t)}</span><small>${esc(auT('{n} launches').replace('{n}', stN(o.l)))}</small></li>`).join('') : `<li class="sx-cbn" role="presentation">${esc(auT('No games match.'))}</li>`;
  ul.hidden = false; inp.setAttribute('aria-expanded', 'true');
  if (ST.ci >= 0) { inp.setAttribute('aria-activedescendant', 'stgo' + ST.ci); const a = $('#stgo' + ST.ci); if (a) a.scrollIntoView({ block: 'nearest' }); } else inp.removeAttribute('aria-activedescendant');
}
function stPick(id) {
  ST.game = id;
  const inp = $('#stgq');
  if (inp) { inp.value = adGame(id); inp.dataset.typed = ''; }
  stCombo(false);
  stGameCard();
}
function stGameCard() {
  const box = $('#stgd');
  if (!box) return;
  const g = stGames().find(x => x.game_id === ST.game);
  if (!g) { box.innerHTML = ''; return; }
  const D = ST.d || {}, sp = (D.game_days || {})[g.game_id], gm = byId.get(g.game_id), tint = TINT[g.game_id] || 'var(--accent)';
  const P = (D.players || []).filter(p => p.game_id === g.game_id).sort((a, b) => (+b.seconds_played || 0) - (+a.seconds_played || 0)).slice(0, 5);
  const spSum = sp ? sp.reduce((s, v) => s + (+v || 0), 0) : null;
  const C = [
    ['Launches', stN(g.launches), 'rocket', spSum != null ? `${stSpark(sp)}<small>${esc(auT('{n} in the last {d} days').replace('{n}', stN(spSum)).replace('{d}', ST.days))}</small>` : `<small>${esc(auT('{n} in the last 7 days').replace('{n}', stN(g.launches_7d)))}</small>`, 'sx-gw'],
    ['Players', stN(g.players), 'users'],
    ['Rounds played', stN(g.plays), 'play'],
    ['Hours played', stH(g.hours), 'clock', `<small>${esc(auT('{n} in the last 7 days').replace('{n}', stH(g.hours_7d)))}</small>`],
    ['Avg minutes per visit', (+g.avg_min || 0).toFixed(1), 'timer'],
    ['Accounts with records', stN(g.accounts), 'save'],
    ['Errors', stN(g.errors), 'bug', `<span class="sx-hp">${stHealth(g)}</span><small>${esc(auT('{n} in the last 7 days').replace('{n}', stN(g.errors_7d)))}</small>`, +g.errors_7d ? 'sx-gbad' : ''],
    ['Last launch', g.last_launch ? adAgo(g.last_launch) : auT('Never'), 'eye', g.last_launch ? `<small>${esc(adDate(g.last_launch, 1))}</small>` : '', 'sx-gw']
  ];
  box.innerHTML = `<div class="sx-gh2" style="--c:${esc(tint)}"><span class="sx-gt">${esc(adGame(g.game_id).charAt(0))}</span><div><b translate="no">${esc(adGame(g.game_id))}</b><span><code>${esc(g.game_id)}</code>${gm && gm.info ? `<small>${esc(gm.info.genres.join(' · '))}</small>` : ''}</span></div>${gm ? `<a class="btn2" href="${esc(href(g.game_id))}" data-stopen="${esc(g.game_id)}">${esc(auT('Open game'))}</a>` : ''}</div>
   <div class="sx-gc">${C.map(([k, v, ic, x, cl], i) => `<div class="sx-gk ${cl || ''}" style="--i:${i}"><span class="sx-gki">${AD_SI[ic]}</span><small>${esc(auT(k))}</small><b>${esc(v)}</b>${x || ''}</div>`).join('')}</div>
   <div class="sx-g2">
    <div class="sx-gb"><h4>${esc(auT('Last error'))}</h4>${g.last_error ? `<div class="sx-err"><code translate="no">${esc(String(g.last_error).slice(0, 400))}</code><small>${esc(g.last_error_at ? adAgo(g.last_error_at) : '')}</small></div>` : `<div class="adm-mut">${esc(auT('No errors. Everything works.'))}</div>`}</div>
    <div class="sx-gb"><h4>${esc(auT('Top players'))}</h4>${P.length ? `<div class="sx-tp">${P.map((p, i) => `<button type="button" class="sx-tpr" data-stu="${esc(p.user_id)}"><span class="sx-rk">${i + 1}</span><span class="pic">${esc((p.display_name || p.username || '?').charAt(0).toUpperCase())}</span><span class="sx-tpn"><b translate="no">${esc(p.display_name || p.username || '—')}</b><small>${p.username ? '@' + esc(p.username) + ' · ' : ''}${esc(auT('{n} plays').replace('{n}', +p.plays || 0))}${p.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', p.best_score)) : ''}</small></span><em>${esc(adHrs(p.seconds_played))}</em></button>`).join('')}</div>` : `<div class="adm-mut">${esc(auT('No games played yet.'))}</div>`}</div>
   </div>`;
}
function stDraw() {
  const D = ST.d || {}, O = D.overview || {}, box = $('#adstats'), S = stSeries(), days = D.series ? ST.days : S.length;
  const T = [['Active 7 days', O.active_7d], ['Active 30 days', O.active_30d]];
  const PL = (D.players || []).slice(0, 100), ER = D.errors || [], DV = D.devices || [], SQ = D.searches || [], RE = D.retention || [];
  const peakOk = S.some(r => r.peak != null);
  if (!ST.game || !stGames().some(g => g.game_id === ST.game)) ST.game = (stGames().slice().sort((a, b) => (+b.launches || 0) - (+a.launches || 0))[0] || {}).game_id || null;
  const keep = document.activeElement && document.activeElement.id === 'stgq';
  ST.ch = {};
  box.innerHTML = `
  <div class="st-top"><div class="st-card st-livec"><div class="st-h"><h3><i class="adm-dot"></i>${esc(auT('Live now'))}</h3><b class="st-big" id="stln">0</b></div><div class="st-lg" id="stlg"></div><div class="st-live" id="stlive"></div></div>
  <div class="tiles adm-tiles st-tiles">${T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${+n || 0}">${stN(n)}</b></div>`).join('')}</div></div>
  <div class="sx-bar"><h3>${esc(auT('Trends'))}</h3><div class="sx-rng" role="group" aria-label="${esc(auT('Time range'))}">${[7, 30, 90].map(d => `<button type="button" data-strng="${d}" aria-pressed="${d === ST.days}">${esc(auT('{n} days').replace('{n}', d))}</button>`).join('')}</div></div>
  ${stChart('act', 'Active players per day', S, [{ k: 'active', l: 'Active players' }, { k: 'signed_in', l: 'Signed in' }], { agg: 'avg', wide: true })}
  <div class="sx-grid">
   ${peakOk ? stChart('peak', 'Peak online per day', S, [{ k: 'peak', l: 'Peak online' }], { agg: 'max', i: 1, note: 'Most people online at the same time' }) : stChart('ses', 'Sessions per day', S, [{ k: 'sessions', l: 'Sessions' }], { agg: 'sum', i: 1, note: 'Peak online starts recording while an admin has this page open' })}
   ${peakOk ? stChart('ses', 'Sessions per day', S, [{ k: 'sessions', l: 'Sessions' }], { agg: 'sum', i: 2 }) : ''}
   ${stChart('hrs', 'Hours played per day', S, [{ k: 'hours', l: 'Hours played' }], { agg: 'sum', dec: true, fmt: stH, i: 3 })}
   ${stChart('new', 'New accounts per day', S, [{ k: 'signups', l: 'New accounts' }], { agg: 'sum', type: 'bar', i: 4 })}
   ${stChart('lch', 'Game launches per day', S, [{ k: 'launches', l: 'Game launches' }], { agg: 'sum', type: 'bar', i: 5 })}
   <div class="st-card sx-c" style="--i:6"><div class="sx-ch"><div><h3>${esc(auT('Share of playtime'))}</h3><p class="sx-note">${esc(D.game_hours ? auT('Last {n} days').replace('{n}', days) : auT('All time'))}</p></div></div>${stDonut()}</div>
  </div>
  <div class="st-card sx-gm"><div class="sx-gh"><h3>${esc(auT('Games'))}</h3>
   <div class="sx-cb"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="stgq" role="combobox" aria-expanded="false" aria-controls="stgl" aria-autocomplete="list" aria-label="${esc(auT('Choose a game'))}" placeholder="${esc(auT('Search games'))}" autocomplete="off" spellcheck="false" value="${esc(ST.game ? adGame(ST.game) : '')}"><button type="button" class="sx-cbt" data-stcb tabindex="-1" aria-label="${esc(auT('Show all games'))}">${AD_ICO.chev}</button><ul id="stgl" role="listbox" aria-label="${esc(auT('Games'))}" hidden></ul></div>
  </div><div id="stgd"></div></div>
  <div class="st-card"><h3>${esc(auT('Time played per player'))}</h3><div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Player', 'Game', 'Time played', 'Rounds', 'Best', 'Last played'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody translate="no">${PL.length ? PL.map(p => `<tr data-stu="${esc(p.user_id)}"><td>${esc(p.display_name || p.username || '—')}${p.username ? ` <span class="adm-mut">@${esc(p.username)}</span>` : ''}</td><td>${esc(adGame(p.game_id))}</td><td>${esc(adHrs(p.seconds_played))}</td><td>${stN(p.plays)}</td><td>${p.best_score != null ? esc(String(p.best_score)) : '—'}</td><td>${esc(adAgo(p.last_played))}</td></tr>`).join('') : `<tr><td colspan="6" class="adm-empty">${esc(auT('No games played yet.'))}</td></tr>`}</tbody></table></div></div>
  <div class="st-grid">
   <div class="st-card"><h3>${esc(auT('Devices'))}</h3>${stDevices()}<div class="st-list sx-dvl">${DV.slice(0, 6).map(d => `<div class="st-kv"><span>${esc([auT(ST_DEV[d.device] || d.device || ''), d.os, d.browser].filter(Boolean).join(' · '))}</span><b>${stN(d.sessions)}</b></div>`).join('')}</div></div>
   <div class="st-card"><h3>${esc(auT('Recent errors'))}</h3><div class="st-list">${ER.length ? ER.slice(0, 30).map(e => `<div class="st-err"><b>${esc(adGame(e.game_id))}</b><span>${esc(e.message || '')}</span><small>${esc(e.place || '')} · ${esc(e.device || '')} · ${esc(adAgo(e.created_at))}</small></div>`).join('') : `<div class="adm-mut">${esc(auT('No errors. Everything works.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Top searches'))}</h3><div class="st-list">${SQ.length ? SQ.map(s => `<div class="st-kv"><span>${esc(s.query)}${+s.with_no_results ? ` <span class="adm-pill warn">${esc(auT('no result'))}</span>` : ''}</span><b>${stN(s.searches)}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Players coming back'))}</h3><div class="st-list">${RE.length ? RE.map(r => `<div class="st-kv"><span>${esc(adDate(r.cohort_day))} · ${esc(auT('{n} new').replace('{n}', r.new_players))}</span><b>${esc(auT('next day {a}% · week {b}%').replace('{a}', r.day1_pct).replace('{b}', r.back_within_7d_pct))}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
  </div>
  <p class="adm-mut st-at">${esc(auT('Updated {t}. Refreshes every 30 seconds; the live list updates instantly.').replace('{t}', new Date(D.at || Date.now()).toLocaleTimeString()))}</p>`;
  if (ST.anim) countUp(box.querySelector('.st-tiles'));
  stGameCard(); stLive();
  if (keep) $('#stgq').focus({ preventScroll: true });
  ST.anim = false;
}
function stBoot() {
  const box = $('#adstats');
  box.addEventListener('click', e => {
    const r = e.target.closest('[data-strng]');
    if (r) { const d = +r.dataset.strng; if (d === ST.days) return; ST.days = d; ST.anim = true; box.querySelectorAll('[data-strng]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.strng === d))); stLoad(true); return; }
    if (e.target.closest('[data-stcb]')) { const inp = $('#stgq'); if ($('#stgl').hidden) { inp.dataset.typed = ''; inp.focus(); stCombo(true); } else stCombo(false); return; }
    const o = e.target.closest('#stgl [data-g]');
    if (o) { stPick(o.dataset.g); return; }
    const u = e.target.closest('[data-stu]');
    if (u) { const x = (AD.users || []).find(y => y.id === u.dataset.stu); if (x) { adTab('users'); adPanel(x); } return; }
    const g = e.target.closest('[data-stopen]');
    if (g) { e.preventDefault(); go(href(g.dataset.stopen), false); }
  });
  box.addEventListener('mousedown', e => { if (e.target.closest('#stgl, [data-stcb]')) e.preventDefault(); });
  box.addEventListener('input', e => { if (e.target.id === 'stgq') { e.target.dataset.typed = '1'; ST.ci = e.target.value.trim() ? 0 : -1; stCombo(true); } });
  box.addEventListener('focusin', e => { if (e.target.id === 'stgq') { e.target.select(); stCombo(true); } });
  box.addEventListener('focusout', e => { if (e.target.id === 'stgq') setTimeout(() => { if (document.activeElement !== e.target) { stCombo(false); if (ST.game) e.target.value = adGame(ST.game); e.target.dataset.typed = ''; } }, 120); });
  box.addEventListener('keydown', e => {
    if (e.target.id !== 'stgq') return;
    const ul = $('#stgl'), n = (ST.opts || []).length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (ul.hidden) { stCombo(true); return; } if (!n) return; ST.ci = e.key === 'ArrowDown' ? (ST.ci + 1) % n : (ST.ci - 1 + n) % n; stCombo(true); }
    else if (e.key === 'Enter') { e.preventDefault(); const o = (ST.opts || [])[Math.max(0, ST.ci)]; if (!ul.hidden && o) { stPick(o.id); e.target.blur(); } }
    else if (e.key === 'Escape') { if (!ul.hidden) { e.preventDefault(); e.stopPropagation(); stCombo(false); e.target.value = ST.game ? adGame(ST.game) : ''; e.target.dataset.typed = ''; } }
    else if (e.key === 'Home' || e.key === 'End') { if (!ul.hidden && n && e.target.dataset.typed !== '1') { e.preventDefault(); ST.ci = e.key === 'Home' ? 0 : n - 1; stCombo(true); } }
  });
  box.addEventListener('pointermove', e => { const a = e.target.closest('.sx-area'); if (a) stHover(a, e); });
  box.addEventListener('pointerdown', e => { const a = e.target.closest('.sx-area'); if (a) stHover(a, e); });
  box.addEventListener('pointerout', e => { const a = e.target.closest('.sx-area'); if (a && !a.contains(e.relatedTarget)) stUnhover(a); });
  box.addEventListener('pointerover', e => { const dn = e.target.closest('.sx-dn'); if (dn) stSeg(dn, e.target.closest('[data-seg]')); });
  box.addEventListener('pointerout', e => { const dn = e.target.closest('.sx-dn'); if (dn && !dn.contains(e.relatedTarget)) stSeg(dn, null); });
  setInterval(() => { if (view === 'admin' && AD.tab === 'stats' && document.visibilityState === 'visible' && !(document.activeElement && document.activeElement.id === 'stgq')) stLoad(true); }, 30000);
  setInterval(stSample, 60000);
}

function tkBox(el, mode) {
  if (el._tk) return el;
  el._tk = { mode, list: null, cur: null, n: 0, sig: '', compose: false };
  el.classList.add('tk');
  el.dataset.mode = mode;
  el.innerHTML = `<div class="tk-side">${mode === 'user' ? `<form class="tk-new" novalidate hidden><div class="fld"><label>${esc(auT('Subject'))}</label><input class="tk-subj-in" maxlength="120" autocomplete="off"></div><div class="fld"><label>${esc(auT('Message'))}</label><textarea class="tk-body-in" maxlength="2000" rows="4"></textarea></div><div class="tk-row"><button class="btn2 tk-cancel" type="button" data-tk="cancel">${esc(auT('Cancel'))}</button><button class="btn2 pri" type="submit">${esc(auT('Send ticket'))}</button></div></form><button class="btn2 pri tk-open" type="button" data-tk="new">${esc(auT('New ticket'))}</button>` : ''}<div class="tk-list" role="list"></div></div><div class="tk-main" hidden><div class="tk-h"><button class="back" type="button" data-tk="back">${AD_ICO.back}${esc(auT('All tickets'))}</button><div class="tk-ht"><b class="tk-subj" translate="no"></b><span class="tk-meta"></span></div><button class="btn2 tk-tog" type="button" data-tk="toggle"></button>${mode === 'admin' ? `<button class="btn2 danger tk-del" type="button" data-tk="del">${esc(auT('Delete ticket'))}</button>` : ''}</div><div class="tk-msgs" translate="no" aria-live="polite"></div><form class="tk-comp" novalidate><textarea maxlength="2000" rows="2" placeholder="${esc(auT('Write a message'))}"></textarea><button class="btn2 pri" type="submit" aria-label="${esc(auT('Send'))}">${AD_ICO.send}<span>${esc(auT('Send'))}</span></button></form></div><div class="note tk-note" role="status"></div>`;
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
    if (t.closest('#adref')) { adLoad(); tkLoad(tkBox($('#tka'), 'admin')); if (AD.tab === 'stats') stLoad(true); if (AD.tab === 'log') alLoad(); if (AD.tab === 'site') sfLoad(true).then(sfaDraw); return; }
    if (t.closest('[data-almore]')) { alLoad(true); return; }
    const alu = t.closest('[data-alu]');
    if (alu) { const x = (AD.users || []).find(y => y.id === alu.dataset.alu); if (x) { adTab('users'); adPanel(x); } return; }
    const sg = t.closest('[data-sfg]');
    if (sg) { sg.setAttribute('aria-pressed', String(sg.getAttribute('aria-pressed') !== 'true')); return; }
    const sm = t.closest('#sfam');
    if (sm) { sm.classList.toggle('on'); sm.setAttribute('aria-checked', String(sm.classList.contains('on'))); return; }
    if (t.closest('#sfas')) { sfaSave(t.closest('#sfas')); return; }
    if (t.closest('#sfps')) { sfpSave(t.closest('#sfps')); return; }
    if (t.closest('#adpclose')) { adPanelClose(); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const a = t.closest('[data-adact]');
    if (a) { adAct(a.dataset.adact, a); return; }
    const tr = t.closest('#adt tbody tr[data-uid]');
    if (tr) { const u = (AD.users || []).find(x => x.id === tr.dataset.uid); if (u) adPanel(u); }
  });
  va.addEventListener('keydown', e => {
    if (e.key === 'Escape' && AD.tab === 'users' && !$('#adpanel').hidden) { e.preventDefault(); e.stopPropagation(); adPanelClose(); return; }
    const tr = e.target.closest && e.target.closest('#adt tbody tr[data-uid]');
    if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tr.click(); }
  });
  $('#adtabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const T = ['users', 'tickets', 'stats', 'log', 'site'], i = T.indexOf(AD.tab); adTab(T[(i + (e.key === 'ArrowRight' ? 1 : T.length - 1)) % T.length]); $('#adtabs [aria-selected="true"]').focus(); } });
  stBoot();
  $('#adq').addEventListener('input', e => { AD.q = e.target.value; adDraw(); });
  $('#adsite').addEventListener('input', e => { if (e.target.id !== 'sfaq') return; const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('#sfag [data-sfg]').forEach(c => { c.hidden = !!q && !c.textContent.toLowerCase().includes(q) && !c.dataset.sfg.includes(q); }); });
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
