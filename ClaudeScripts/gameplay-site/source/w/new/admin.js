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
const adCv = (id, c) => { const g = byId.get(id); if (!g || !thumbsOn()) return `<span class="${c} adcv0" style="--c:${esc(TINT[id] || 'var(--accent)')}">${esc(adGame(id).charAt(0))}</span>`; const u = coverUrl(g); if (u === BLANK) lzCover(id); return `<img class="${c}" src="${u}"${u === BLANK ? ` data-cv="${esc(id)}"` : ''} alt="" decoding="async" draggable="false">`; };
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
  ST.anim = 2; AD.anim = true;
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
    adTiles(AD.anim); adDraw(AD.anim); AD.anim = false;
    if (AD.sel) { const u = AD.users.find(x => x.id === AD.sel); if (u) adPanel(u, true); }
  } catch (e) {
    if (/admins only/i.test(e.message || '')) { AD.role = 'user'; adStatus({ role: 'user', locked: false }); return; }
    $('#adt tbody').innerHTML = `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('Could not load the users. Check your connection and try again.'))}</td></tr>`;
  } finally { AD.busy = false; $('#adref').classList.remove('spin'); }
}
function adTiles(an) {
  const U = AD.users || [], now = Date.now(), tk = ($('#tka')._tk || {}).list || [];
  const open = tk.filter(t => t.status === 'open').length;
  const T = [['Accounts', U.length], ['New this week', U.filter(u => now - Date.parse(u.created_at) < 6048e5).length], ['Active today', U.filter(u => now - Date.parse(u.last_seen || 0) < 864e5).length], ['Admins', U.filter(adStaff).length], ['Locked', U.filter(u => u.locked).length], ['Open tickets', open]];
  const box = $('#adtiles'), old = box.querySelectorAll('b[data-n]');
  if (!an && old.length === T.length) T.forEach(([, n], i) => { if (old[i].dataset.n !== String(n)) { old[i].dataset.n = n; old[i].textContent = stN(n); } });
  else { box.innerHTML = T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${n}" data-f="l">${stN(n)}</b></div>`).join(''); countUp(box); }
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
function adDraw(an) {
  adHead();
  const rows = adRows(), tb = $('#adt tbody');
  tb.classList.toggle('an', !!an);
  $('#adcount').textContent = auT('{n} of {t} users').replace('{n}', rows.length).replace('{t}', (AD.users || []).length);
  tb.innerHTML = rows.length ? rows.map((u, i) => `<tr tabindex="0" data-uid="${esc(u.id)}" class="${u.id === AD.sel ? 'sel' : ''}${RT.pres[u.id] ? ' on' : ''}" style="--i:${Math.min(i, 14)}">${AD_COLS.map(c => `<td>${c[2](u)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('No users match.'))}</td></tr>`;
}
const AD_TABS = ['users', 'tickets', 'stats', 'data', 'log', 'site'];
function adTab(t) {
  const was = AD.tab, tabs = $('#adtabs'), o = $('#ad' + was), fade = was !== t && view === 'admin' && !o.hidden && motionOK(), top = fade ? o.offsetTop : 0;
  AD.tab = t;
  tabs.dataset.m = t;
  tabs.querySelectorAll('[data-adtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.adtab === t)));
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
  if (t === 'stats') stLoad();
  if (t === 'data') dataOpen(was !== t);
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
    box.innerHTML = L.length ? L.map((g, i) => `<div class="apc-g" style="--i:${Math.min(i, 12)};--c:${esc(TINT[g.game_id] || 'var(--accent)')}">${adCv(g.game_id, 'apc-gi')}<span class="apc-gn">${esc(adGame(g.game_id))}</span><b>${esc(adHrs(g.seconds_played))}</b><i><s style="width:${Math.max(2, Math.round(100 * (+g.seconds_played || 0) / max))}%"></s></i><small>${esc(auT('{n} plays').replace('{n}', +g.plays || 0))}${g.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', g.best_score)) : ''}${g.last_played ? ' · ' + esc(adAgo(g.last_played)) : ''}</small></div>`).join('') : `<div class="adm-mut apc-none">${esc(auT('No games played yet.'))}</div>`;
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

const ST = { d: null, at: 0, busy: false, days: 30, game: null, ci: -1, anim: 2, ps: 0, ch: {}, lv: new Set() };
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
  if (ST.anim || !ST.d) box.classList.add('sx-busy');
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
  const seen = ST.lv;
  ST.lv = new Set(P.map(([id]) => id));
  box.innerHTML = P.length ? P.sort((a, b) => (b[1].g ? 1 : 0) - (a[1].g ? 1 : 0)).map(([id, p]) => {
    const u = (AD.users || []).find(x => x.id === id), name = (u && (u.display_name || u.username || u.email)) || id.slice(0, 8);
    return `<button class="st-on${seen.has(id) ? '' : ' nw'}" type="button" data-stu="${esc(id)}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot on"></i></span><span><b>${esc(name)}</b><small>${esc(u && u.username ? '@' + u.username : '')}${p.h ? ' · ' + esc(auT('hidden from friends')) : ''}</small></span><em>${esc(p.g ? adGame(p.g) : auT('Browsing'))}</em></button>`;
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
  const sd = (Math.min(25, 420 / Math.max(1, n))).toFixed(1);
  if (bar && n) { const bw = W / n * (n > 40 ? .78 : .64); g += vals[0].map((v, i) => { const h = Math.max(v ? 2 : 0, H * (v || 0) / max); return `<rect data-i="${i}" style="--i:${i}" x="${(X(i) - bw / 2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}"/>`; }).join(''); }
  else g += vals.map((vs, s) => { const [d, a] = stPath(vs.map((v, i) => v == null ? null : [+X(i).toFixed(1), Y(v)]), H); return (s ? '' : `<path class="sx-a" d="${a}" fill="url(#sxg-${id})"/>`) + `<path class="sx-l sx-s${s}" d="${d}"/>`; }).join('');
  const lab = v => o.dec ? fmt(v) : stN(v);
  const xl = n ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, A) => A.indexOf(v) === i).map(i => `<span style="left:${(100 * X(i) / W).toFixed(2)}%">${esc(stDay(rows[i].day))}</span>`).join('') : '';
  return `<div class="st-card sx-c${o.wide ? ' sx-wide' : ''}" style="--i:${o.i || 0}">
   <div class="sx-ch"><div><h3>${esc(auT(title))}</h3>${o.note ? `<p class="sx-note">${esc(auT(o.note))}</p>` : ''}</div><div class="sx-kpi"><b${!o.dec && Number.isInteger(kv) ? ` data-n="${kv}" data-f="l"` : ''}>${esc(o.dec ? fmt(kv) : stN(Math.round(kv * 10) / 10))}</b><small>${esc(auT(kl))}</small></div></div>
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
  if (!tot) return `<div class="adm-mut sx-empty">${esc(auT('No data yet.'))}</div>`;
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
function stGameCard(an) {
  const box = $('#stgd');
  if (!box) return;
  if (!motionOK()) an = 0;
  box.classList.toggle('sx-gp', an === true);
  const g = stGames().find(x => x.game_id === ST.game);
  if (!g) { box.innerHTML = ''; return; }
  const D = ST.d || {}, sp = (D.game_days || {})[g.game_id], gm = byId.get(g.game_id), tint = TINT[g.game_id] || 'var(--accent)';
  const P = (D.players || []).filter(p => p.game_id === g.game_id).sort((a, b) => (+b.seconds_played || 0) - (+a.seconds_played || 0)).slice(0, 5);
  const spSum = sp ? sp.reduce((s, v) => s + (+v || 0), 0) : null;
  const C = [
    ['Launches', stN(g.launches), 'rocket', spSum != null ? `${stSpark(sp, an)}<small>${esc(auT('{n} in the last {d} days').replace('{n}', stN(spSum)).replace('{d}', ST.days))}</small>` : `<small>${esc(auT('{n} in the last 7 days').replace('{n}', stN(g.launches_7d)))}</small>`, 'sx-gw', g.launches],
    ['Players', stN(g.players), 'users', '', '', g.players],
    ['Rounds played', stN(g.plays), 'play', '', '', g.plays],
    ['Hours played', stH(g.hours), 'clock', `<small>${esc(auT('{n} in the last 7 days').replace('{n}', stH(g.hours_7d)))}</small>`],
    ['Avg minutes per visit', (+g.avg_min || 0).toFixed(1), 'timer'],
    ['Accounts with records', stN(g.accounts), 'save', '', '', g.accounts],
    ['Errors', stN(g.errors), 'bug', `<span class="sx-hp">${stHealth(g)}</span><small>${esc(auT('{n} in the last 7 days').replace('{n}', stN(g.errors_7d)))}</small>`, +g.errors_7d ? 'sx-gbad' : '', g.errors],
    ['Last launch', g.last_launch ? adAgo(g.last_launch) : auT('Never'), 'eye', g.last_launch ? `<small>${esc(adDate(g.last_launch, 1))}</small>` : '', 'sx-gw']
  ];
  box.innerHTML = `<div class="sx-gh2" style="--c:${esc(tint)}"><span class="sx-gt">${adCv(g.game_id, '')}</span><div><b translate="no">${esc(adGame(g.game_id))}</b><span><code>${esc(g.game_id)}</code>${gm && gm.info ? `<small>${esc(gm.info.genres.join(' · '))}</small>` : ''}</span></div>${gm ? `<a class="btn2" href="${esc(href(g.game_id))}" data-stopen="${esc(g.game_id)}">${esc(auT('Open game'))}</a>` : ''}</div>
   <div class="sx-gc">${C.map(([k, v, ic, x, cl, n], i) => `<div class="sx-gk ${cl || ''}" style="--i:${i}"><span class="sx-gki">${AD_SI[ic]}</span><small>${esc(auT(k))}</small><b${Number.isInteger(+n) && n !== '' && n != null ? ` data-n="${+n}" data-f="l"` : ''}>${esc(v)}</b>${x || ''}</div>`).join('')}</div>
   <div class="sx-g2">
    <div class="sx-gb"><h4>${esc(auT('Last error'))}</h4>${g.last_error ? `<div class="sx-err"><code translate="no">${esc(String(g.last_error).slice(0, 400))}</code><small>${esc(g.last_error_at ? adAgo(g.last_error_at) : '')}</small></div>` : `<div class="adm-mut">${esc(auT('No errors. Everything works.'))}</div>`}</div>
    <div class="sx-gb"><h4>${esc(auT('Top players'))}</h4>${P.length ? `<div class="sx-tp">${P.map((p, i) => `<button type="button" class="sx-tpr" data-stu="${esc(p.user_id)}"><span class="sx-rk">${i + 1}</span><span class="pic">${esc((p.display_name || p.username || '?').charAt(0).toUpperCase())}</span><span class="sx-tpn"><b translate="no">${esc(p.display_name || p.username || '—')}</b><small>${p.username ? '@' + esc(p.username) + ' · ' : ''}${esc(auT('{n} plays').replace('{n}', +p.plays || 0))}${p.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', p.best_score)) : ''}</small></span><em>${esc(adHrs(p.seconds_played))}</em></button>`).join('')}</div>` : `<div class="adm-mut">${esc(auT('No games played yet.'))}</div>`}</div>
   </div>`;
  if (an) countUp(box);
}
function stReveal(box) {
  const C = [...box.querySelectorAll('.sx-c, .st-grid > .st-card')];
  if (!window.IntersectionObserver) { C.forEach(countUp); return; }
  if (ST.io) ST.io.disconnect();
  ST.io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; ST.io.unobserve(e.target); e.target.classList.remove('sx-wait'); countUp(e.target); }), { threshold: .25 });
  C.forEach(c => { c.classList.add('sx-wait'); ST.io.observe(c); });
}
function stDraw() {
  const D = ST.d || {}, O = D.overview || {}, box = $('#adstats'), S = stSeries(), days = D.series ? ST.days : S.length;
  const T = [['Active 7 days', O.active_7d], ['Active 30 days', O.active_30d]];
  const ER = D.errors || [], DV = D.devices || [], SQ = D.searches || [], RE = D.retention || [];
  const peakOk = S.some(r => r.peak != null);
  if (!ST.game || !stGames().some(g => g.game_id === ST.game)) ST.game = (stGames().slice().sort((a, b) => (+b.launches || 0) - (+a.launches || 0))[0] || {}).game_id || null;
  const keep = document.activeElement && document.activeElement.id === 'stgq', an = motionOK() ? ST.anim : 0;
  ST.anim = an;
  ST.ch = {};
  box.classList.toggle('sx-q', !an); box.classList.toggle('sx-r', an === 1);
  box.innerHTML = `
  <div class="st-top"><div class="st-card st-livec"><div class="st-h"><h3><i class="adm-dot"></i>${esc(auT('Live now'))}</h3><b class="st-big" id="stln">0</b></div><div class="st-lg" id="stlg"></div><div class="st-live" id="stlive"></div></div>
  <div class="tiles adm-tiles st-tiles">${T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${+n || 0}" data-f="l">${stN(n)}</b></div>`).join('')}</div></div>
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
  <div class="st-grid">
   <div class="st-card"><h3>${esc(auT('Devices'))}</h3>${stDevices()}<div class="st-list sx-dvl">${DV.slice(0, 6).map(d => `<div class="st-kv"><span>${esc([auT(ST_DEV[d.device] || d.device || ''), d.os, d.browser].filter(Boolean).join(' · '))}</span><b>${stN(d.sessions)}</b></div>`).join('')}</div></div>
   <div class="st-card"><h3>${esc(auT('Recent errors'))}</h3><div class="st-list">${ER.length ? ER.slice(0, 30).map(e => `<div class="st-err"><b>${esc(adGame(e.game_id))}</b><span>${esc(e.message || '')}</span><small>${esc(e.place || '')} · ${esc(e.device || '')} · ${esc(adAgo(e.created_at))}</small></div>`).join('') : `<div class="adm-mut">${esc(auT('No errors. Everything works.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Top searches'))}</h3><div class="st-list">${SQ.length ? SQ.map(s => `<div class="st-kv"><span>${esc(s.query)}${+s.with_no_results ? ` <span class="adm-pill warn">${esc(auT('no result'))}</span>` : ''}</span><b>${stN(s.searches)}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Players coming back'))}</h3><div class="st-list">${RE.length ? RE.map(r => `<div class="st-kv"><span>${esc(adDate(r.cohort_day))} · ${esc(auT('{n} new').replace('{n}', r.new_players))}</span><b>${esc(auT('next day {a}% · week {b}%').replace('{a}', r.day1_pct).replace('{b}', r.back_within_7d_pct))}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
  </div>
  <p class="adm-mut st-at">${esc(auT('Updated {t}. Refreshes every 30 seconds; the live list updates instantly.').replace('{t}', new Date(D.at || Date.now()).toLocaleTimeString()))}</p>`;
  if (an === 2) countUp(box.querySelector('.st-top'));
  if (an) stReveal(box);
  stGameCard(an); stLive();
  if (keep) $('#stgq').focus({ preventScroll: true });
  ST.anim = 0;
}
function stBoot() {
  const box = $('#adstats');
  box.addEventListener('click', e => {
    const r = e.target.closest('[data-strng]');
    if (r) { const d = +r.dataset.strng; if (d === ST.days) return; ST.days = d; ST.anim = 1; adConfetti(e); box.querySelectorAll('[data-strng]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.strng === d))); stLoad(true); return; }
    if (e.target.closest('[data-stcb]')) { const inp = $('#stgq'); if ($('#stgl').hidden) { inp.dataset.typed = ''; inp.focus(); stCombo(true); } else stCombo(false); return; }
    const o = e.target.closest('#stgl [data-g]');
    if (o) { if (o.dataset.g !== ST.game) adConfetti(e); stPick(o.dataset.g); return; }
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
    else if (e.key === 'Enter') { e.preventDefault(); const o = (ST.opts || [])[Math.max(0, ST.ci)]; if (!ul.hidden && o) { if (o.id !== ST.game) adConfetti(e); stPick(o.id); e.target.blur(); } }
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

const DC_S = ['Not yet', 'Partly', 'Collected'], DC_SC = ['', 'warn', 'ok'];
const DC_C = ['No consent needed', 'Analytics consent', 'Ads consent', 'Legal check first'], DC_CC = ['ok', 'acc', 'warn', 'bad'];
const DC = { s: -1, c: -1, q: '' };
const DC_CAT = [
  ['Time and sessions', 'clock', [
    ['Visit time', 'created_at and client_at on every event', 'Busiest hours, when to ship updates, ad dayparting', 2, 0, 'Everyone'],
    ['Time zone', 'Intl.DateTimeFormat().resolvedOptions().timeZone', 'Local hour of play, country guess without IP, VPN check against IP country', 2, 1, 'GA4, Clarity'],
    ['Local hour and weekday', 'Client clock plus time zone', 'Heatmap of play by local hour, best time for events and push', 2, 1, 'GA4'],
    ['Session length', 'session_end with seconds', 'Average engagement time', 2, 1, 'GA4'],
    ['Active vs idle time', 'visibilitychange, focus, last input time', 'Real attention time instead of open-tab time', 2, 1, 'GA4 user_engagement'],
    ['Engaged session', 'Over 10 s, or 2+ views, or a game launch', 'GA4 engagement rate, the main health number ad buyers ask for', 0, 1, 'GA4'],
    ['Visit number', 'Counter in local storage', 'New vs 2nd vs 10th visit behaviour', 0, 1, 'GA4 ga_session_number'],
    ['Days since first and last visit', 'First-seen date per visitor id', 'Lifetime, recency, churn risk', 2, 1, 'GA4 first_visit'],
    ['Time to first launch', 'Page load to first game_launch', 'Onboarding friction, homepage layout tests', 0, 1, 'Product teams'],
    ['Visits with no game launched', 'Session without game_launch', 'Bounce rate of the homepage', 2, 1, 'GA4 bounce rate'],
    ['Several tabs open', 'BroadcastChannel ping between tabs', 'Inflated live counts, multi-tab players', 0, 1, ''],
    ['Holiday and school calendar match', 'Join daily stats with a country calendar', 'Explain spikes, plan events', 0, 0, 'Poki, CrazyGames']
  ]],
  ['Device and hardware', 'eye', [
    ['Device type', 'Phone, tablet or desktop', 'Layout priorities, ad formats', 2, 0, 'Everyone'],
    ['Operating system', 'Parsed from the user agent', 'Bug triage, store/PWA decisions', 2, 0, 'Everyone'],
    ['OS version', 'navigator.userAgentData.getHighEntropyValues platformVersion', 'Drop old versions safely, Windows 10 vs 11', 2, 1, 'GA4 (uapv on Tetris)'],
    ['Browser', 'Parsed from the user agent', 'Test matrix', 2, 0, 'Everyone'],
    ['Browser version', 'userAgentData fullVersionList', 'Know when a feature can be used', 2, 1, 'GA4 (uafvl on Tetris)'],
    ['Device model', 'userAgentData model (Android)', 'Low-end phone list, performance presets', 2, 1, 'GA4, ad networks'],
    ['CPU architecture and bitness', 'userAgentData architecture, bitness', 'ARM vs x86 performance', 2, 1, 'GA4 (uaa, uab on Tetris)'],
    ['Screen, viewport, pixel ratio', 'screen and innerWidth/innerHeight, devicePixelRatio', 'Ad slot sizes, layout breakpoints', 2, 0, 'GA4 (sr on Tetris)'],
    ['Orientation and rotations', 'screen.orientation change events', 'Which games need portrait mode', 0, 1, 'Mobile game studios'],
    ['Touch or mouse', 'pointer: coarse media query', 'Show touch controls', 2, 0, ''],
    ['Hover support', 'hover: hover media query', 'Card hover previews on or off', 0, 0, ''],
    ['CPU cores', 'navigator.hardwareConcurrency', 'Auto quality setting', 2, 1, 'Unity, Poki'],
    ['Device memory', 'navigator.deviceMemory (Chrome)', 'Skip heavy games on 2 GB phones', 2, 1, 'Google'],
    ['GPU model', 'WebGL WEBGL_debug_renderer_info renderer string', 'Graphics presets, crash clusters per GPU', 2, 3, 'Unity, Steam survey'],
    ['WebGL / WebGL2 / WebGPU support', 'Feature test on load', 'Which engine tech is safe to use', 2, 0, 'Unity'],
    ['Screen refresh rate', 'Measured from requestAnimationFrame', '120 Hz users, physics step choices', 2, 1, ''],
    ['HDR and colour depth', 'dynamic-range: high media query, screen.colorDepth', 'Art pipeline choices', 0, 1, ''],
    ['Battery level and charging', 'navigator.getBattery (Chrome only)', 'Low-power mode, shorter sessions on battery', 0, 3, 'Ad networks (deprecated in most browsers)'],
    ['Gamepad model', 'navigator.getGamepads() id string', 'Which controller layouts to draw (PS, Xbox, Switch)', 2, 1, 'Steam'],
    ['Keyboard layout', 'navigator.keyboard.getLayoutMap (Chrome)', 'AZERTY / QWERTZ default bindings', 2, 1, ''],
    ['Installed as app', 'display-mode: standalone', 'PWA adoption', 2, 0, ''],
    ['Storage space', 'navigator.storage.estimate()', 'Whether offline packs fit', 0, 1, ''],
    ['Sound on or muted', 'Site mute setting', 'Whether audio ads or music matter', 1, 1, 'Ad networks (muted autoplay)']
  ]],
  ['Performance and quality', 'timer', [
    ['Frames per second per game', 'Average and 1% low from rAF timing', 'Find games that run badly, per device', 2, 1, 'Unity, Steam'],
    ['Long tasks and freezes', 'PerformanceObserver longtask', 'Jank reports, menu lag', 0, 1, 'Sentry, New Relic'],
    ['Game load time', 'Click to first playable frame', 'Players lost while loading', 2, 1, 'Poki, CrazyGames'],
    ['Web Vitals (LCP, INP, CLS, TTFB)', 'PerformanceObserver or web-vitals', 'Google ranking, homepage speed', 2, 1, 'Cloudflare beacon on Tetris'],
    ['Download sizes and cache hits', 'Resource Timing transferSize', 'Hosting costs, slow countries', 0, 1, 'Cloudflare'],
    ['JavaScript errors', 'window error and unhandledrejection', 'Bug fixing', 2, 1, 'Sentry'],
    ['Full stack traces', 'error.stack, trimmed', 'Faster bug fixing', 1, 1, 'Sentry'],
    ['WebGL context lost', 'webglcontextlost event', 'GPU crashes per device', 0, 1, 'Unity'],
    ['Silent crash detection', 'Heartbeat stops without session_end', 'Crashes that throw no error', 0, 1, 'Firebase Crashlytics'],
    ['Memory use', 'performance.memory (Chrome) or measureUserAgentSpecificMemory', 'Leaks in long sessions', 0, 1, ''],
    ['Server call time and failures', 'Time each Supabase RPC', 'Slow backend, outages', 0, 0, 'New Relic, Datadog'],
    ['Realtime disconnects', 'Channel status changes', 'Multiplayer stability', 0, 0, ''],
    ['Update installs', 'update_ready event', 'How fast new versions spread', 2, 0, '']
  ]],
  ['Network and location', 'rocket', [
    ['Country', 'From IP at the edge (Cloudflare cf-ipcountry, or a geo lookup like geojs which Tetris calls)', 'Ad prices differ hugely by country, translation priorities', 2, 1, 'Tetris (geojs), GA4'],
    ['Region and city', 'IP geolocation', 'Local events, server placement', 2, 1, 'GA4'],
    ['Internet provider and ASN', 'IP to ASN lookup (geojs and ipinfo return the organisation)', 'Spot school or office networks, outage reports per ISP', 2, 1, 'Tetris (geojs), ad fraud vendors'],
    ['Connection type and speed', 'navigator.connection effectiveType, downlink, rtt, saveData', 'Lighter assets on 3G, data saver mode', 2, 1, 'Google'],
    ['VPN, proxy or datacenter IP', 'ASN list or IP reputation API', 'Bot and fraud filtering, ad invalid traffic', 2, 1, 'Google Ad Traffic Quality (seen on Tetris)'],
    ['Preferred languages', 'navigator.languages (full list)', 'Which translation to add next', 2, 0, 'GA4 (ul on Tetris)'],
    ['Time zone vs IP country', 'Compare both', 'VPN signal', 2, 1, 'Fraud vendors'],
    ['Raw IP address', 'Request header', 'Abuse blocking only; store hashed and short-lived', 0, 3, 'Everyone (truncated in GA4)'],
    ['Latency to the server', 'Ping the realtime server', 'Multiplayer matchmaking by region', 0, 0, 'Online games'],
    ['Network type from IP (mobile, home, school)', 'ASN category lookup', 'School traffic peaks, mobile data users', 0, 1, 'Ad networks']
  ]],
  ['Where visitors come from', 'users', [
    ['Referrer site', 'document.referrer host', 'Which sites send players', 2, 1, 'GA4'],
    ['Full referrer page', 'document.referrer path', 'Which exact post or video sent them', 0, 1, 'GA4'],
    ['Campaign tags', 'utm_source, utm_medium, utm_campaign, utm_term, utm_content', 'Measure every link you share', 0, 1, 'GA4'],
    ['Ad click ids', 'gclid, fbclid, ttclid, msclkid, twclid in the URL', 'Report conversions back to ad platforms', 0, 2, 'Google Ads, Meta, TikTok'],
    ['Landing page', 'First path of the visit', 'Which game pages bring new people', 1, 1, 'GA4'],
    ['First and last channel per visitor', 'Store first-touch source', 'Credit the channel that found the player', 0, 1, 'GA4 attribution'],
    ['Invite and party links', 'party_join from a shared link', 'Viral factor (invites per player)', 1, 1, 'Mobile game studios'],
    ['Share button clicks', 'navigator.share and copy-link clicks', 'Which games get shared', 0, 1, ''],
    ['Install prompt shown and accepted', 'beforeinstallprompt, appinstalled', 'PWA installs', 0, 1, ''],
    ['Search engine keyword', 'Google Search Console export', 'SEO: which searches bring players', 0, 0, 'Everyone (Search Console)']
  ]],
  ['Navigation and clicks', 'play', [
    ['Page and view changes', 'view event', 'Funnels between pages', 2, 1, 'GA4 page_view'],
    ['Scroll depth', '25 / 50 / 75 / 90% of the page', 'Is anything below the fold seen', 2, 1, 'GA4 scroll (90% on Tetris)'],
    ['Game card clicks with position', 'tile_click with rail and slot', 'Click-through rate by slot, ranking', 2, 1, 'Poki, CrazyGames'],
    ['Game card impressions', 'IntersectionObserver on cards', 'CTR = clicks / impressions, cover A/B tests', 2, 1, 'Poki, CrazyGames, Netflix'],
    ['Cover A/B tests', 'Two covers per game, compare CTR', 'Better covers, more plays', 0, 1, 'Netflix, Poki'],
    ['Hover time on cards', 'pointerenter to pointerleave', 'Interest that did not turn into a click', 0, 1, ''],
    ['Searches and no-result searches', 'search and search_go events', 'Which games to add next', 2, 1, ''],
    ['Filters and sorting', 'filter and sort events', 'Category demand', 2, 1, ''],
    ['Outbound link clicks', 'Clicks on links to other sites', 'Where players leave to', 0, 1, 'GA4 enhanced measurement'],
    ['Rage clicks and dead clicks', 'Several fast clicks in one spot, clicks with no effect', 'Broken or confusing buttons', 2, 1, 'Clarity on Tetris'],
    ['Session replays and heatmaps', 'Record pointer and DOM changes', 'Watch where people struggle', 0, 1, 'Clarity on Tetris, Hotjar'],
    ['Exit page', 'Last view before session_end', 'Where people give up', 2, 1, 'GA4'],
    ['Time on each page', 'View change timestamps', 'Which pages hold attention', 2, 1, 'GA4'],
    ['Settings changed', 'setting event', 'Which defaults are wrong', 2, 1, '']
  ]],
  ['Gameplay', 'trophy', [
    ['Launches, rounds and time per game', 'game_launch, game_play, game_time', 'Most popular games', 2, 1, ''],
    ['Best scores and records', 'game_stats table', 'Leaderboards', 2, 0, ''],
    ['Score distribution', 'Every final score, not just the best', 'Balance difficulty, spot cheaters', 2, 1, 'Tetris, King'],
    ['Level reached and quit point', 'Level number at game over or exit', 'Funnel per level, where it gets too hard', 2, 1, 'King, Rovio'],
    ['Death and fail positions', 'x, y of each fail', 'Map heatmaps', 0, 1, 'Unity, Valve'],
    ['Round length', 'Start to end of each round', 'Pacing, where to show a break ad', 2, 1, 'Ad-based studios'],
    ['Quits in the first 30 seconds', 'Game exit soon after launch', 'Games that confuse new players', 2, 1, 'Poki'],
    ['Restarts and pauses', 'restart and pause events', 'Frustration signals', 2, 1, ''],
    ['Difficulty or mode chosen', 'Per-game mode event', 'Which modes to keep', 0, 1, ''],
    ['Input used in game', 'Last input: keyboard, mouse, touch or gamepad', 'Where to invest in controls', 2, 1, 'Steam Input'],
    ['Rebinds', 'Which actions players rebind', 'Fix bad default controls', 2, 1, 'Ubisoft, EA'],
    ['Win, loss and bot level', 'Match result and opponent', 'Matchmaking, bot balance', 0, 1, 'Psyonix'],
    ['Rocket League match stats', 'Goals, saves, shots, touches, boost used, aerials, demos', 'Bot tuning, skill rating, highlights', 2, 1, 'Psyonix'],
    ['First game of new players', 'First game_launch per visitor', 'Which game should be featured for newcomers', 1, 1, 'Poki'],
    ['Fullscreen use', 'fullscreen event', 'Default to fullscreen or not', 2, 1, ''],
    ['Party size and party length', 'party_create, party_play', 'Multiplayer demand', 1, 1, ''],
    ['Cheat signals', 'Impossible scores, timer drift, edited saves', 'Clean leaderboards', 0, 0, 'Every competitive game']
  ]],
  ['Accounts and social', 'save', [
    ['Sign ups and log ins with method', 'auth events (Google, email)', 'Which sign-in to promote', 2, 0, ''],
    ['Sign-up started but not finished', 'Form opened vs account created', 'Fix sign-up friction', 1, 1, 'GA4 funnels'],
    ['Profile completeness', 'Avatar, display name, bio set', 'Engagement predictor', 0, 0, 'LinkedIn, Steam'],
    ['Friends, messages, tickets', 'Counts per user', 'Social players stay longer', 2, 0, 'Discord, Steam'],
    ['Account age', 'created_at', 'Cohorts', 2, 0, ''],
    ['Favourites', 'favourites table', 'Personal recommendations', 2, 0, ''],
    ['Age range (self declared)', 'One question at sign-up', 'Children cannot get personalised ads; required for COPPA and GDPR-K', 0, 3, 'Google, Roblox'],
    ['Gender (self declared)', 'Optional profile field', 'Ad targeting; sensitive, keep optional', 0, 3, 'Meta, Google'],
    ['Newsletter opt-in', 'Checkbox with double opt-in', 'Bring players back by email', 0, 0, 'Everyone'],
    ['Push notification permission', 'Notification.permission and opt-in rate', 'Re-engagement channel', 0, 0, 'Mobile games'],
    ['Account deletion and data downloads', 'Requests table, data_download event', 'GDPR compliance proof', 2, 0, '']
  ]],
  ['Retention and calculated numbers', 'users', [
    ['Daily, weekly, monthly actives', 'Distinct visitors per day, 7 and 30 days', 'Core growth numbers', 2, 1, 'Everyone'],
    ['Stickiness (DAU / MAU)', 'Daily actives divided by monthly actives', 'How habit-forming the site is; 20% is good', 2, 1, 'Facebook, Zynga'],
    ['Day 1, 7 and 30 retention', 'Share of new players back on that day', 'The number investors and ad partners ask for', 2, 1, 'Everyone'],
    ['Churn risk', 'No visit for 14 days after a regular streak', 'Win-back emails', 2, 1, 'GA4 churn probability'],
    ['Returning after a long break', 'Back after 30+ days', 'What brought them back', 0, 1, ''],
    ['Streaks', 'Consecutive days played', 'Daily rewards', 2, 1, 'Duolingo'],
    ['Retention by channel', 'Cohorts split by first source', 'Which sources bring loyal players', 0, 1, 'GA4'],
    ['Full funnel', 'Visit, launch, play 1 minute, sign up, come back', 'Where most people drop', 2, 1, 'Mixpanel, Amplitude'],
    ['Lifetime playtime per player', 'Sum of game_time', 'Find super fans', 2, 1, ''],
    ['Power user share', 'Top 1% and 10% of playtime', 'How much depends on a few players', 1, 1, ''],
    ['Feature adoption', 'Share of players using parties, favourites, chat', 'Which features to keep', 1, 1, 'Amplitude'],
    ['Game ratings', 'Thumbs up or down after a round', 'Ranking, removing bad games', 2, 0, 'Poki, CrazyGames']
  ]],
  ['Ads and money', 'star', [
    ['Consent string', 'IAB TCF v2.2 via __tcfapi, plus GPP for the US', 'Required before EU ad networks can personalise; Tetris uses Google Funding Choices', 0, 0, 'Tetris (Funding Choices), every ad site'],
    ['Ad impressions and viewability', 'Ad shown and at least 50% visible for 1 s', 'Revenue reporting', 1, 2, 'Tetris (GA4 ad_impression)'],
    ['Ad clicks and CTR', 'Clicks on ad slots', 'Layout tuning', 1, 2, 'Google Ad Manager'],
    ['Revenue per thousand views (eCPM)', 'From the ad network report', 'Which countries and pages earn most', 1, 2, 'Google Ad Manager, Prebid'],
    ['Header bidding prices', 'Prebid.js bid responses per bidder', 'Which ad partners pay most; Tetris runs Prebid with Taboola, Criteo, Kueez, Seedtag, Sharethrough, RichAudience', 0, 2, 'Tetris (pbjs)'],
    ['Rewarded ads started and finished', 'Video ad events', 'Reward balance, revenue', 0, 2, 'Tetris (Google IMA SDK)'],
    ['Ad breaks between rounds', 'Interstitial shown at round end', 'Revenue without hurting retention', 0, 2, 'Tetris (H5 Games Ads), Poki'],
    ['Ad errors and timeouts', 'Failed or slow ad loads', 'Lost revenue; Tetris logs ads_google_h5 timeouts to GA4', 0, 2, 'Tetris'],
    ['Ad blocker detected', 'Bait element or blocked script check', 'Share of visitors who cannot earn money', 2, 1, 'News sites'],
    ['Interest segments', 'Ad network inferred interests', 'Higher ad prices; done by the networks, not you', 0, 2, 'Google, Taboola'],
    ['Cross-site ids', 'ID5, IntentIQ, Criteo ids', 'Better ad prices without third-party cookies; Tetris stores id5id and _iiq_fdata', 0, 2, 'Tetris (ID5, IntentIQ, Criteo)'],
    ['Revenue per daily user (ARPDAU)', 'Revenue divided by daily actives', 'The main money number', 0, 0, 'Every free game'],
    ['Purchases or donations', 'If you ever sell skins or remove ads', 'Paying user rate, ARPPU', 0, 0, 'Every free game']
  ]],
  ['Identity and fingerprinting', 'eye', [
    ['Random visitor id', 'Stored in local storage', 'Count unique visitors', 2, 1, 'GA4 _ga cookie'],
    ['Session id', 'Per tab session', 'Group events', 2, 0, 'Everyone'],
    ['Same person on several devices', 'Linked through the account', 'True user counts', 2, 0, 'Google, Meta'],
    ['Hashed email for ad matching', 'SHA-256 email sent to ad platforms', 'Match players to ad conversions; needs explicit consent', 0, 3, 'Google Enhanced Conversions, Meta CAPI'],
    ['Browser fingerprint', 'Canvas, audio, fonts, GPU hash', 'Track without cookies; treated as personal data under GDPR, avoid', 0, 3, 'Ad fraud vendors'],
    ['Bot detection', 'navigator.webdriver, headless user agents, no input events', 'Clean stats and ad traffic', 0, 0, 'Google reCAPTCHA, Cloudflare']
  ]],
  ['Accessibility and preferences', 'cake', [
    ['Reduced motion', 'prefers-reduced-motion and the site setting', 'How many need calmer animations', 1, 1, 'Apple, Google'],
    ['Dark or light theme', 'Site theme and prefers-color-scheme', 'Default theme', 1, 1, ''],
    ['High contrast and forced colours', 'prefers-contrast, forced-colors', 'Accessibility fixes', 0, 1, 'Microsoft'],
    ['Page zoom and font size', 'visualViewport.scale, root font size', 'Text that is too small', 0, 1, ''],
    ['Thumbnails off', 'Setting', 'Data saving users', 2, 1, ''],
    ['Translated by the browser', 'html lang changed by Google Translate', 'Languages to support natively', 0, 1, '']
  ]]
];
const dcAll = () => DC_CAT.flatMap(c => c[2]);
function dcList() {
  const box = $('#dcl');
  if (!box) return;
  const q = DC.q.trim().toLowerCase();
  const ok = r => (DC.s < 0 || r[3] === DC.s) && (DC.c < 0 || r[4] === DC.c) && (!q || r.slice(0, 3).concat(r[5]).join(' ').toLowerCase().includes(q));
  const cats = DC_CAT.map(([t, ic, R], ci) => [t, ic, R.filter(ok), ci]).filter(c => c[2].length);
  $('#addata').querySelectorAll('[data-dc]').forEach(b => b.setAttribute('aria-pressed', String(DC[b.dataset.dc] === +b.dataset.v)));
  box.innerHTML = cats.length ? cats.map(([t, ic, R, ci], i) => `<details class="st-card dc-cat" style="--i:${i}" open><summary><span class="sx-gki">${AD_SI[ic]}</span><h3>${esc(auT(t))}</h3><em>${R.length}</em><i class="dc-mt" title="${esc(auT('Share already collected'))}"><s style="width:${Math.round(100 * DC_CAT[ci][2].filter(r => r[3] === 2).length / DC_CAT[ci][2].length)}%"></s></i></summary>
   <div class="dc-rows">${R.map((r, j) => `<div class="dc-r" style="--j:${Math.min(j, 16)}"><div class="dc-n"><b>${esc(auT(r[0]))}</b><small>${esc(auT(r[1]))}</small></div><div class="dc-u">${esc(auT(r[2]))}${r[5] ? `<small>${esc(auT('Who does it: {w}').replace('{w}', r[5]))}</small>` : ''}</div><div class="dc-p"><span class="adm-pill ${DC_SC[r[3]]}">${esc(auT(DC_S[r[3]]))}</span><span class="adm-pill ${DC_CC[r[4]]}">${esc(auT(DC_C[r[4]]))}</span></div></div>`).join('')}</div></details>`).join('') : `<div class="adm-empty">${esc(auT('Nothing matches.'))}</div>`;
}
function dcDraw(an) {
  const box = $('#dcv');
  if (!box) return;
  if (!motionOK()) an = false;
  const all = dcAll(), cnt = [0, 1, 2].map(s => all.filter(r => r[3] === s).length);
  const chip = (k, v, l, n) => `<button type="button" data-dc="${k}" data-v="${v}" aria-pressed="${DC[k] === v}">${esc(auT(l))}${n != null ? `<em>${n}</em>` : ''}</button>`;
  const T = [['Things you could track', all.length], ['Already collected', cnt[2]], ['Partly collected', cnt[1]], ['Not collected yet', cnt[0]]];
  box.classList.toggle('sx-q', !an);
  box.innerHTML = `
  <div class="tiles adm-tiles st-tiles dc-tiles">${T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${n}" data-f="l">${stN(n)}</b></div>`).join('')}</div>
  <div class="st-card dc-intro"><h3>${AD_SI.eye}${esc(auT('What big sites collect'))}</h3><p>${esc(auT('Checked live on play.tetris.com: Google Tag Manager with Google Analytics 4 (page views, scroll depth, ad impressions, ad timeouts), Microsoft Clarity (session replays, heatmaps, rage clicks), Google Funding Choices for consent, Google Ad Manager with Prebid header bidding (Taboola, Criteo, Kueez, Seedtag, Sharethrough, RichAudience), ID5 and IntentIQ cross-site ids, a geojs IP lookup for country and provider, Cloudflare Web Analytics for page speed, and Google IMA for video ads.'))}</p><p class="adm-mut">${esc(auT('Anything marked Analytics or Ads consent may only be collected after the visitor agrees in the cookie banner (GDPR, ePrivacy, and Monaco Law 1.565). Legal check first means personal or sensitive data.'))}</p></div>
  <div class="dc-bar"><label class="search dc-q" for="dcq"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="dcq" type="search" placeholder="${esc(auT('Search the list'))}" autocomplete="off" spellcheck="false" value="${esc(DC.q)}"></label>
   <div class="dc-chips" role="group" aria-label="${esc(auT('Status'))}">${chip('s', -1, 'All')}${[2, 1, 0].map(s => chip('s', s, DC_S[s], cnt[s])).join('')}</div>
   <div class="dc-chips" role="group" aria-label="${esc(auT('Consent'))}">${chip('c', -1, 'Any consent')}${DC_C.map((l, c) => chip('c', c, l)).join('')}</div></div>
  <div class="dc-cats" id="dcl"></div>`;
  dcList();
  if (an) countUp(box.querySelector('.dc-tiles'));
}
function dcBoot() {
  const box = $('#addata');
  box.addEventListener('click', e => {
    const sb = e.target.closest('[data-dsub]');
    if (sb) { if (sb.dataset.dsub !== INS.sub) { INS.sub = sb.dataset.dsub; dataOpen(true); adConfetti(e); } return; }
    const rg = e.target.closest('[data-insrng]');
    if (rg) { const d = +rg.dataset.insrng; if (d !== INS.days) { INS.days = d; box.querySelectorAll('[data-insrng]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.insrng === d))); adConfetti(e); insLoad(true); } return; }
    const u = e.target.closest('[data-stu]');
    if (u) { const x = (AD.users || []).find(y => y.id === u.dataset.stu); if (x) { adTab('users'); adPanel(x); } return; }
    const b = e.target.closest('[data-dc]');
    if (!b) return;
    const k = b.dataset.dc, v = +b.dataset.v;
    if (DC[k] === v) return;
    DC[k] = v; box.classList.remove('sx-q'); dcList(); adConfetti(e);
  });
  box.addEventListener('input', e => { if (e.target.id === 'dcq') { DC.q = e.target.value; box.classList.add('sx-q'); dcList(); } });
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

const INS = { d: null, days: 30, busy: false, sub: 'ins', at: 0 };
const insPct = (a, b) => b ? Math.round(100 * a / b) : 0;
const insShare = o => o && o.n ? insPct(o.yes, o.n) + '%' : '—';
const insMs = v => v == null ? '—' : v >= 1000 ? (v / 1000).toFixed(1) + ' s' : Math.round(v) + ' ms';
const insVit = (k, v) => { const T = { lcp: [2500, 4000], inp: [200, 500], cls: [.1, .25], fcp: [1800, 3000], ttfb: [800, 1800] }[k]; if (v == null) return '<span class="adm-mut">—</span>'; const c = v <= T[0] ? 'ok' : v <= T[1] ? 'warn' : 'bad'; return `<span class="adm-pill ${c}">${esc(k === 'cls' ? String(v) : insMs(v))}</span>`; };
const insCountry = c => { try { return new Intl.DisplayNames([adLang()], { type: 'region' }).of(c) || c; } catch (e) { return c; } };
function insBars(title, rows, o) {
  o = o || {};
  const R = (rows || []).filter(r => r && r.n > 0), max = Math.max(1, ...R.map(r => +r.n || 0)), tot = R.reduce((s, r) => s + (+r.n || 0), 0);
  return `<div class="st-card ins-c"><h3>${esc(auT(title))}</h3>${o.note ? `<p class="sx-note">${esc(auT(o.note))}</p>` : ''}${R.length ? `<div class="ins-bars">${R.map((r, i) => `<div class="ins-b" style="--i:${Math.min(i, 14)}"><span class="ins-bk" translate="no" title="${esc(String(r.k))}">${o.fmt ? o.fmt(r.k) : esc(r.k)}</span><i><s style="width:${(100 * r.n / max).toFixed(1)}%"></s></i><b>${o.val ? esc(o.val(r)) : `${stN(r.n)}<small>${insPct(r.n, tot)}%</small>`}</b></div>`).join('')}</div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>`;
}
function insTiles(T) { return `<div class="tiles adm-tiles st-tiles ins-tiles">${T.map(([k, v, n, s], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b${Number.isInteger(n) ? ` data-n="${n}" data-f="l"` : ''}>${esc(v)}</b>${s ? `<small class="ins-ts">${esc(auT(s))}</small>` : ''}</div>`).join('')}</div>`; }
function insHeat(H) {
  const M = {}, max = Math.max(.01, ...(H || []).map(x => +x.v || 0));
  (H || []).forEach(x => { M[x.d + '-' + x.h] = +x.v || 0; });
  const day = d => { try { return new Date(2024, 0, 1 + d).toLocaleDateString(adLang(), { weekday: 'short' }); } catch (e) { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d]; } };
  let h = '<div class="ins-hm" role="img" aria-label="' + esc(auT('Hours played by local day and hour')) + '"><span></span>';
  for (let c = 0; c < 24; c++) h += `<span class="ins-hh">${c % 3 ? '' : c}</span>`;
  for (let d = 0; d < 7; d++) { h += `<span class="ins-hd">${esc(day(d))}</span>`; for (let c = 0; c < 24; c++) { const v = M[d + '-' + c] || 0; h += `<i style="--a:${(v / max).toFixed(3)};--i:${d * 24 + c}" title="${esc(day(d) + ' ' + c + ':00 · ' + stH(v))}"></i>`; } }
  return h + '</div>';
}
function insDraw(an) {
  const box = $('#insv');
  if (!box) return;
  if (!motionOK()) an = false;
  const D = INS.d || {}, G = D.geo || {}, V = D.dev || {}, B = D.behaviour || {}, R = D.retention || {}, RL = D.rl || {}, A = D.ads || {}, C = D.coverage || {};
  const coh = d => (R.cohort || []).find(x => x.d === d) || {}, F = R.funnel || {}, S = R.streaks || {}, sc = B.scroll || {}, all = RL.all || {};
  const rng = `<div class="sx-bar"><h3>${esc(auT('Insights'))}</h3><div class="sx-rng" role="group" aria-label="${esc(auT('Time range'))}">${[7, 30, 90].map(d => `<button type="button" data-insrng="${d}" aria-pressed="${d === INS.days}">${esc(auT('{n} days').replace('{n}', d))}</button>`).join('')}</div></div>`;
  const cov = `<p class="adm-mut ins-cov">${esc(auT('{a} of {b} sessions shared device details and {c} shared location. Only visitors who accepted cookies are counted.').replace('{a}', stN(C.dev)).replace('{b}', stN(C.sessions)).replace('{c}', stN(C.geo)))}</p>`;
  const games = (D.games || []).slice(0, 60), votes = new Map((D.votes || []).map(v => [v.id, v]));
  const inMain = g => { const I = [['Keyboard', g.ik], ['Mouse', g.im], ['Touch', g.it], ['Controller', g.ip]].sort((a, b) => b[1] - a[1]); const t = I.reduce((s, x) => s + (+x[1] || 0), 0); return t ? I.filter(x => x[1] > 0).slice(0, 2).map(x => auT(x[0]) + ' ' + insPct(x[1], t) + '%').join(' · ') : '—'; };
  const gRows = games.map((g, i) => { const vt = votes.get(g.id) || g.votes || {}, s = g.scores || {}, l = g.load || {}; return `<tr style="--i:${Math.min(i, 14)}"><td><span class="ins-gn">${adCv(g.id, 'ins-cv')}<span translate="no">${esc(adGame(g.id))}</span></span></td><td>${stN(g.n)}</td><td>${g.n ? `<span class="adm-pill ${insPct(g.early, g.n) > 40 ? 'bad' : insPct(g.early, g.n) > 20 ? 'warn' : 'ok'}">${insPct(g.early, g.n)}%</span>` : '—'}</td><td>${g.sec != null ? esc(adHrs(g.sec)) : '—'}</td><td>${g.fps != null ? `<b>${g.fps}</b> <span class="adm-mut">/ ${g.fps_low != null ? g.fps_low : '—'}</span>` : '—'}</td><td>${l.n ? esc(insMs(l.p50)) + ' <span class="adm-mut">/ ' + esc(insMs(l.p90)) + '</span>' : '—'}</td><td>${s.n ? `<b>${esc(stN(s.p50))}</b> <span class="adm-mut">${esc(stN(s.p25))}–${esc(stN(s.p75))} · ${esc(auT('max {n}').replace('{n}', stN(s.max)))}</span>` : '—'}</td><td>${g.lv_n ? `${esc(String(g.lv_avg))} <span class="adm-mut">/ ${esc(String(g.lv_max))}</span>` : '—'}</td><td>${esc(inMain(g))}</td><td>${vt.up || vt.down ? `<span class="ins-vt"><b>▲ ${vt.up | 0}</b> <span>▼ ${vt.down | 0}</span></span>` : '—'}</td></tr>`; }).join('');
  const user = (p, x) => `<button type="button" class="sx-tpr" data-stu="${esc(p.id)}"><span class="pic">${esc((p.name || p.username || '?').charAt(0).toUpperCase())}</span><span class="sx-tpn"><b translate="no">${esc(p.name || p.username || '—')}</b><small>${p.username ? '@' + esc(p.username) : ''}</small></span><em>${esc(x)}</em></button>`;
  const slots = (B.slots || []).filter(s => s.src !== 'side').sort((a, b) => a.pos - b.pos || a.src.localeCompare(b.src)).slice(0, 16);
  const funnel = [['Visited', F.visited], ['Launched a game', F.launched], ['Played 1 minute', F.played], ['Created an account', F.account], ['Came back another day', F.returned]];
  const dau = +R.dau || 0, mau = +R.mau || 0;
  box.classList.toggle('sx-q', !an);
  box.innerHTML = rng + cov + `
  <h2 class="ins-h">${esc(auT('Retention'))}</h2>
  ${insTiles([['Stickiness (daily ÷ monthly)', mau ? insPct(dau, mau) + '%' : '—', null, 'Above 20% is good'], ['Back next day', coh(1).eligible ? insPct(coh(1).back, coh(1).eligible) + '%' : '—'], ['Back after 7 days', coh(7).eligible ? insPct(coh(7).back, coh(7).eligible) + '%' : '—'], ['Back after 30 days', coh(30).eligible ? insPct(coh(30).back, coh(30).eligible) + '%' : '—'], ['At risk of leaving', stN(R.churn_all), +R.churn_all || 0, 'Regulars gone 14+ days'], ['On a streak now', stN(S.active), +S.active || 0, S.avg_cur ? auT('average {n} days').replace('{n}', S.avg_cur) : '']])}
  <div class="ins-grid">
   <div class="st-card ins-c"><h3>${esc(auT('Funnel'))}</h3><p class="sx-note">${esc(auT('New visitors in this period'))}</p><div class="ins-fun">${funnel.map(([k, n], i) => `<div class="ins-fs" style="--i:${i};--w:${funnel[0][1] ? Math.max(2, 100 * (+n || 0) / funnel[0][1]).toFixed(1) : 0}%"><span>${esc(auT(k))}</span><b>${stN(n)}</b><small>${i ? insPct(n, funnel[0][1]) + '%' : ''}</small></div>`).join('')}</div></div>
   ${insBars('Longest streak (days in a row)', [['1 day', S.b1], ['2–3 days', S.b3], ['4–7 days', S.b7], ['8–14 days', S.b14], ['15+ days', S.b15]].map(([k, n]) => ({ k: auT(k), n: +n || 0 })))}
   <div class="st-card ins-c"><h3>${esc(auT('Top current streaks'))}</h3>${(R.top_streaks || []).length ? `<div class="sx-tp">${R.top_streaks.map(p => user(p, auT('{n} days').replace('{n}', p.cur))).join('')}</div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
   <div class="st-card ins-c"><h3>${esc(auT('Players at risk of leaving'))}</h3><p class="sx-note">${esc(auT('Played 3+ days in the last 60, gone for 14+ days'))}</p>${(R.churn || []).length ? `<div class="sx-tp ins-scroll">${R.churn.map(p => user(p, auT('{d} days · {h} h · {t}').replace('{d}', p.days).replace('{h}', p.hours).replace('{t}', adAgo(p.last)))).join('')}</div>` : `<div class="adm-mut">${esc(auT('Nobody right now.'))}</div>`}</div>
  </div>
  <h2 class="ins-h">${esc(auT('Games'))}</h2>
  <div class="st-card"><p class="sx-note">${esc(auT('Per game session: quits under 30 seconds, average session, frames per second (average / worst 10%), load time (median / slowest 10%), final scores (median, middle half, best), level reached at the end (average / highest), main input, thumbs.'))}</p><div class="adm-tw"><table class="adm-t st-t ins-t"><thead><tr>${['Game', 'Sessions', 'Quit < 30 s', 'Avg session', 'FPS', 'Load', 'Scores', 'Level', 'Input', 'Votes'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody class="${an ? 'an' : ''}">${gRows || `<tr><td colspan="10" class="adm-empty">${esc(auT('No data yet.'))}</td></tr>`}</tbody></table></div></div>
  <div class="ins-grid">
   <div class="st-card ins-c"><h3>${esc(auT('Rocket League matches'))}</h3>${all.n ? `<div class="ins-kv"><span>${esc(auT('Matches'))}</span><b>${stN(all.n)}</b><span>${esc(auT('Win rate'))}</span><b>${insPct(all.wins, all.n)}%</b><span>${esc(auT('Goals / assists / saves / shots per match'))}</span><b>${all.goals} / ${all.assists} / ${all.saves} / ${all.shots}</b><span>${esc(auT('Boost used per match'))}</span><b>${stN(all.boost)}</b><span>${esc(auT('Demos per match'))}</span><b>${all.demos}</b><span>${esc(auT('MVP'))}</span><b>${insPct(all.mvp, all.n)}%</b><span>${esc(auT('Overtime'))}</span><b>${insPct(all.ot, all.n)}%</b></div><div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Bot level', 'Matches', 'Win rate', 'Goal margin'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${(RL.by_diff || []).map(r => `<tr><td>${esc(auT(r.diff))}</td><td>${stN(r.n)}</td><td>${insPct(r.wins, r.n)}%</td><td>${r.margin > 0 ? '+' : ''}${esc(String(r.margin))}</td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No matches yet.'))}</div>`}</div>
   ${insBars('Controls players rebind', (D.rebinds || []).map(r => ({ k: `${adGame(r.game)} · ${r.dev === 'pad' ? auT('Controller') : auT('Keyboard')} · ${r.act}${r.to ? ' → ' + r.to : ''}`, n: r.n })), { val: r => stN(r.n) })}
  </div>
  <h2 class="ins-h">${esc(auT('Clicks and behaviour'))}</h2>
  <div class="ins-grid">
   <div class="st-card ins-c"><h3>${esc(auT('Click rate per slot'))}</h3><p class="sx-note">${esc(auT('A card counts as seen when half of it is on screen for 1 second'))}</p>${slots.length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Where', 'Slot', 'Seen', 'Clicks', 'Click rate'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${slots.map(s => `<tr><td>${esc(auT(s.src === 'grid' ? 'Grid' : s.src === 'rail' ? 'Row' : s.src))}</td><td>#${s.pos + 1}</td><td>${stN(s.imp)}</td><td>${stN(s.clk)}</td><td><b>${s.imp ? (100 * s.clk / s.imp).toFixed(1) : 0}%</b></td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
   ${insBars('Click rate per game', (B.ctr || []).slice(0, 15).map(r => ({ k: r.id, n: r.imp ? 100 * r.clk / r.imp : 0.0001, imp: r.imp, clk: r.clk })).sort((a, b) => b.n - a.n), { fmt: id => adCv(id, 'ins-cv') + esc(adGame(id)), val: r => (r.imp ? (100 * r.clk / r.imp).toFixed(1) : 0) + '% · ' + stN(r.imp) })}
   ${insBars('How far people scroll the home page', [['Under 25%', sc.b25], ['25–50%', sc.b50], ['50–75%', sc.b75], ['75–90%', sc.b90], ['90–100%', sc.b100]].map(([k, n]) => ({ k: auT(k), n: +n || 0 })), { note: sc.n ? auT('Average {n}%').replace('{n}', sc.avg) : '' })}
   <div class="st-card ins-c"><h3>${esc(auT('Time on each page and exits'))}</h3>${(B.pages || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Page', 'Visits', 'Avg time', 'Left the site here'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${B.pages.map(p => `<tr><td>${esc(auT({ home: 'Home', game: 'Game', legal: 'Legal pages', admin: 'Admin' }[p.v] || p.v))}</td><td>${stN(p.n)}</td><td>${esc(adHrs(p.sec))}</td><td>${stN(p.exits)} <span class="adm-mut">${insPct(p.exits, p.n)}%</span></td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
   ${insBars('Rage clicks (3 fast clicks in one spot)', B.rage, { val: r => stN(r.n) })}
   ${insBars('Dead clicks (nothing happened)', B.dead, { val: r => stN(r.n) })}
  </div>
  <h2 class="ins-h">${esc(auT('Speed'))}</h2>
  <div class="st-card"><p class="sx-note">${esc(auT('Web Vitals, 75th percentile (what Google uses for ranking). Green is good.'))}</p>${(D.vitals || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Device', 'Visits', 'LCP (main content)', 'INP (reaction)', 'CLS (layout jumps)', 'FCP (first paint)', 'TTFB (server)'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${D.vitals.map(v => `<tr><td>${esc(auT(ST_DEV[v.device] || v.device))}</td><td>${stN(v.n)}</td><td>${insVit('lcp', v.lcp)}</td><td>${insVit('inp', v.inp)}</td><td>${insVit('cls', v.cls)}</td><td>${insVit('fcp', v.fcp)}</td><td>${insVit('ttfb', v.ttfb)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
  <h2 class="ins-h">${esc(auT('Where players are'))}</h2>
  ${insTiles([['Behind a VPN or datacenter', insShare(G.vpn)], ['Datacenter networks', insShare(G.dc)], ['Data saver on', insShare(G.save)], ['Median download speed', G.speed && G.speed.dl != null ? G.speed.dl + ' Mb/s' : '—'], ['Median latency', G.speed && G.speed.rtt != null ? G.speed.rtt + ' ms' : '—']])}
  <div class="st-card ins-c"><h3>${esc(auT('When people play, in their own time'))}</h3><p class="sx-note">${esc(auT('Hours played by local weekday and hour'))}</p>${(G.hours || []).length ? insHeat(G.hours) : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
  <div class="ins-grid">
   ${insBars('Countries', G.countries, { fmt: c => esc(insCountry(c)) + ' <span class="adm-mut">' + esc(c) + '</span>' })}
   ${insBars('Regions', G.regions)}
   ${insBars('Cities', G.cities)}
   ${insBars('Internet providers', G.isps)}
   ${insBars('Connection speed class', G.net)}
   ${insBars('Connection type', G.ctype)}
   ${insBars('Time zones', G.tz)}
  </div>
  <h2 class="ins-h">${esc(auT('Devices'))}</h2>
  ${insTiles([['WebGL 2 support', insShare(V.gl2)], ['WebGPU support', insShare(V.wgpu)], ['Ad blocker on', insShare(A.adblock)]])}
  <div class="ins-grid">
   ${insBars('Operating system versions', V.os)}
   ${insBars('Browser versions', V.browsers)}
   ${insBars('Phone models', V.models)}
   ${insBars('Graphics cards', V.gpus)}
   ${insBars('CPU cores', V.cores)}
   ${insBars('Memory (GB)', V.mem)}
   ${insBars('Screen refresh rate (Hz)', V.hz)}
   ${insBars('Keyboard layouts', V.kb, { fmt: k => esc(String(k).toUpperCase()) })}
   ${insBars('Controllers', V.pads)}
   ${insBars('Controller models', V.pad_ids)}
   ${insBars('CPU architecture', V.arch)}
   ${insBars('Main browser language', V.langs)}
  </div>
  <h2 class="ins-h">${esc(auT('Ads'))}</h2>
  <div class="st-card">${(A.slots || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Slot', 'Impressions', 'Clicks', 'Click rate', 'Revenue (USD)', 'Per 1,000 views'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${A.slots.map(s => `<tr><td>${esc(s.slot)}</td><td>${stN(s.imp)}</td><td>${stN(s.clk)}</td><td>${s.imp ? (100 * s.clk / s.imp).toFixed(2) : 0}%</td><td>${(+s.usd || 0).toFixed(2)}</td><td>${s.imp ? (1000 * s.usd / s.imp).toFixed(2) : '—'}</td></tr>`).join('')}</tbody></table></div>` : `<p class="adm-mut">${esc(auT('No ads on the site yet. Ad blocker use is measured already; impressions, clicks and revenue start counting as soon as an ad slot calls Ameplay.ads.watch(element, slot).'))}</p>`}</div>
  <p class="adm-mut st-at">${esc(auT('Updated {t}.').replace('{t}', new Date(D.at || Date.now()).toLocaleTimeString()))}</p>`;
  if (an) countUp(box);
}
async function insLoad(force) {
  if (!adIsAdmin() || INS.busy) return;
  const box = $('#insv');
  if (!force && INS.d && Date.now() - INS.at < 60000) { insDraw(false); return; }
  INS.busy = true;
  if (!INS.d) box.innerHTML = '<div class="tiles adm-tiles">' + '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(4) + '</div><i class="sk sk-chart"></i><i class="sk sk-chart"></i>';
  box.classList.add('sx-busy');
  try { INS.d = await adRpc('admin_insights', { p_days: INS.days }); INS.at = Date.now(); insDraw(true); }
  catch (e) { box.innerHTML = `<div class="adm-empty">${esc(/admin_insights|function|404|PGRST/i.test(e.message || '') ? auT('The insights database update is not installed yet. Run round8_insights.sql in the Supabase SQL editor.') : auT('Could not load the stats. Check your connection and try again.'))}</div>`; }
  finally { INS.busy = false; box.classList.remove('sx-busy'); }
}
function dataOpen(fresh) {
  const box = $('#addata');
  if (!$('#insv')) box.innerHTML = `<div class="adm-tabs ins-sub" role="tablist" data-m="${INS.sub === 'ins' ? 'users' : 'tickets'}"><button type="button" role="tab" data-dsub="ins" aria-selected="${INS.sub === 'ins'}">${esc(auT('Insights'))}</button><button type="button" role="tab" data-dsub="cat" aria-selected="${INS.sub === 'cat'}">${esc(auT('What could be tracked'))}</button><i></i></div><div id="insv" class="ads"></div><div id="dcv" class="ads dc" hidden></div>`;
  $('#insv').hidden = INS.sub !== 'ins'; $('#dcv').hidden = INS.sub !== 'cat';
  box.querySelector('.ins-sub').dataset.m = INS.sub === 'ins' ? 'users' : 'tickets';
  box.querySelectorAll('[data-dsub]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.dsub === INS.sub)));
  if (INS.sub === 'ins') insLoad(false); else if (fresh || !$('#dcv').children.length) dcDraw(true);
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
    if (t.closest('#adref')) { adLoad(); tkLoad(tkBox($('#tka'), 'admin')); if (AD.tab === 'stats') stLoad(true); if (AD.tab === 'data' && INS.sub === 'ins') insLoad(true); if (AD.tab === 'log') alLoad(); if (AD.tab === 'site') sfLoad(true).then(sfaDraw); return; }
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
  $('#adtabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const T = AD_TABS, i = T.indexOf(AD.tab); adTab(T[(i + (e.key === 'ArrowRight' ? 1 : T.length - 1)) % T.length]); $('#adtabs [aria-selected="true"]').focus(); } });
  stBoot();
  dcBoot();
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
