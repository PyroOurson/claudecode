const RT = { me: null, ch: null, on: null, pres: {}, seen: false, tt: 0 };
const SO_ICO = {
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg>',
  img: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pad: '<svg viewBox="0 0 24 24"><path d="M7 8h10a5 5 0 0 1 4.6 7l-.6 1.4a2.5 2.5 0 0 1-4.3.4L15 15H9l-1.7 1.8a2.5 2.5 0 0 1-4.3-.4L2.4 15A5 5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3M16 12h.01M18 11h.01"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  min: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  add: '<svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 12.5-4.3M19 14v6M16 17h6"/></svg>',
  join: '<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg>',
  find: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>'
};
const soName = id => { const f = (FR.list || []).find(x => x.friend_id === id); return f ? (f.display_name || f.username || '?') : auT('A friend'); };
const soFriend = id => (FR.list || []).find(x => x.friend_id === id) || null;
const soOn = id => { const p = RT.pres[id]; return p && !p.h ? p : null; };
const soParty = () => { try { if (cur && cur.api && cur.api.online) { const n = cur.api.net; if (n && n.code) return { game: cur.g.id, code: String(n.code).toUpperCase() }; } } catch (e) {} return null; };
const soGameName = id => id ? (byId.get(id) ? byId.get(id).title : id) : '';
const soCan = id => { const g = id && byId.get(id); return !!(g && g.info && onlineMax(g.info.pl) > 0); };
const SO = { pend: null, want: null, act: Date.now(), away: false, party: false, ty: {}, tyAt: 0, tyT: 0, v: 'list', last: null, q: '', pt: 0, key: '', gk: '' };
const soIdle = () => Date.now() - SO.act > 300000 || document.visibilityState === 'hidden' && Date.now() - SO.act > 60000;
const soDot = on => on ? on.a ? ' away' : ' on' : '';

function rtStart() {
  if (!SB.c || !SB.user || RT.me === SB.user.id) return;
  rtStop();
  const me = RT.me = SB.user.id;
  try {
    RT.ch = SB.c.channel('u:' + me).on('broadcast', { event: 'n' }, m => rtNudge(m && m.payload || {})).subscribe();
    RT.on = SB.c.channel('online', { config: { presence: { key: me } } }).on('presence', { event: 'sync' }, rtSync).subscribe(s => { if (s === 'SUBSCRIBED') rtTrack(true); });
  } catch (e) {}
}
function rtStop() {
  try { if (RT.ch) SB.c.removeChannel(RT.ch); if (RT.on) SB.c.removeChannel(RT.on); } catch (e) {}
  RT.ch = RT.on = RT.me = null; RT.seen = false; RT.pres = {};
  soLive();
}
function rtTrack(now) {
  clearTimeout(RT.tt);
  if (!RT.on) return;
  RT.tt = setTimeout(() => {
    if (!RT.on || !SB.user) return;
    const P = S.prefs, hide = P.p_status === 'Nobody', g = P.p_game === false || !cur ? null : cur.g.id, pa = soParty();
    SO.away = soIdle(); SO.party = !!(g && pa && pa.game === g);
    RT.on.track(hide ? { h: 1 } : { g, t: Date.now(), a: SO.away ? 1 : 0, p: SO.party ? 1 : 0 }).catch(() => {});
  }, now ? 0 : 400);
}
function rtSync() {
  const s = RT.on ? RT.on.presenceState() : {}, prev = RT.pres, P = {};
  for (const k in s) { const a = s[k]; if (a && a.length) P[k] = a[a.length - 1]; }
  RT.pres = P;
  if (RT.seen && S.prefs.n_on) (FR.list || []).forEach(f => { const id = f.friend_id; if (P[id] && !P[id].h && !(prev[id] && !prev[id].h)) ntPush({ k: 'online', from: id, t: auT('{u} is online').replace('{u}', soName(id)), b: P[id].g ? auT('Playing {g}').replace('{g}', soGameName(P[id].g)) : '', a: { type: 'chat', uid: id } }); });
  RT.seen = true;
  soLive();
}
function rtSend(uid, p) {
  if (!SB.c || !uid) return Promise.resolve();
  return new Promise(res => {
    let done = false;
    const ch = SB.c.channel('u:' + uid);
    const fin = () => { if (done) return; done = true; try { SB.c.removeChannel(ch); } catch (e) {} res(); };
    try { ch.subscribe(s => { if (s === 'SUBSCRIBED') ch.send({ type: 'broadcast', event: 'n', payload: p }).then(fin, fin); else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') fin(); }); } catch (e) { fin(); }
    setTimeout(fin, 6000);
  });
}
function rtNudge(p) {
  const t = p && p.t;
  if (t === 'status') adCheck();
  else if (t === 'deleted') { AD.del = true; adCheck(); }
  else if (t === 'profile') auLoadProfile().then(() => { auRender(); renderProfileBits(); }).catch(() => {});
  else if (t === 'dm') dmPoll();
  else if (t === 'fr') frNudge();
  else if (t === 'ty' || t === 'rd') {
    const f = typeof p.f === 'string' ? p.f : '';
    if (!soFriend(f)) return;
    if (t === 'rd') { if (DM.open === f) dmSeenSync(); return; }
    SO.ty[f] = Date.now() + 6000;
    soTyDraw(); soList();
  }
}

function soStatus(id) {
  const on = soOn(id);
  if (!on) return auT('Offline');
  const g = on.g ? soGameName(on.g) : '';
  if (on.p && g) return auT('In a party · {g}').replace('{g}', g);
  if (g) return on.a ? auT('Away · {g}').replace('{g}', g) : auT('Playing {g}').replace('{g}', g);
  return on.a ? auT('Away') : auT('Online');
}
function soLive() {
  const n = Object.keys(RT.pres).filter(k => !RT.pres[k].h).length, pill = $('#onl');
  if (pill) { pill.hidden = !SB.user || !n; pill.querySelector('b').textContent = n; pill.title = auT(n === 1 ? '1 player online' : '{n} players online').replace('{n}', n); }
  const by = {};
  Object.values(RT.pres).forEach(p => { if (p.g && !p.h) by[p.g] = (by[p.g] || 0) + 1; });
  document.querySelectorAll('#grid [data-id]').forEach(el => {
    const c = by[el.dataset.id] || 0;
    let b = el.querySelector('.livepill');
    if (!c) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('span'); b.className = 'livepill'; b.setAttribute('translate', 'no'); (el.querySelector('.art') || el).append(b); }
    b.textContent = auT('{n} playing').replace('{n}', c);
  });
  if (openK === 'friends' && FR.list) frDraw();
  if (DM.open) dmHead();
  soList(); soDockSync();
  if (view === 'admin') {
    document.querySelectorAll('#adt tbody tr[data-uid]').forEach(tr => tr.classList.toggle('on', !!RT.pres[tr.dataset.uid]));
    const u = adCur(); if (u && !$('#adpanel').hidden) $('#adplive').innerHTML = adLiveTxt(u);
    if (AD.tab === 'stats') stLive();
  }
}

const NT = { list: [], key: '' };
function ntLoad() {
  NT.key = SB.user ? 'gameplay:notifs:' + SB.user.id : 'gameplay:notifs';
  try { NT.list = JSON.parse(localStorage.getItem(NT.key) || '[]') || []; } catch (e) { NT.list = []; }
  ntBadge();
}
function ntSave() { try { localStorage.setItem(NT.key, JSON.stringify(NT.list.slice(0, 60))); } catch (e) {} }
function ntBadge() {
  const n = NT.list.filter(x => !x.r).length, b = $('#nbtn em');
  if (b) { b.textContent = n > 9 ? '9+' : n; b.hidden = !n; }
  const fb = $('#abtn em'), u = DM.unread + (FR.req || []).filter(r => r.direction === 'incoming').length;
  if (fb) { fb.textContent = u > 9 ? '9+' : u; fb.hidden = !u; }
  const db = $('#sodl em');
  if (db) { db.textContent = DM.unread > 9 ? '9+' : DM.unread; db.hidden = !DM.unread; $('#sodl').classList.toggle('so-hot', !!DM.unread); }
  soDockSync();
}
function ntPush(n) {
  n.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  n.at = Date.now(); n.r = false;
  NT.list.unshift(n);
  NT.list = NT.list.slice(0, 60);
  ntSave(); ntBadge();
  if (openK === 'notifs') ntDraw();
  ntToast(n);
}
function ntIcon(k) { return k === 'dm' ? SO_ICO.chat : k === 'image' ? SO_ICO.img : k === 'invite' || k === 'join' ? SO_ICO.pad : k === 'game' ? SO_ICO.star : SO_ICO.user; }
function ntActLabel(n) { const a = n.a || {}; return a.type === 'join' ? 'Join' : a.type === 'invite' ? 'Invite' : a.type === 'chat' ? (n.k === 'online' ? 'Say hi' : 'Reply') : a.type === 'game' ? 'Play' : a.type === 'friends' ? 'Open' : ''; }
function ntToast(n) {
  let box = $('#ntst');
  if (!box) { box = document.createElement('div'); box.id = 'ntst'; box.className = 'ntst'; box.setAttribute('aria-live', 'polite'); document.body.append(box); }
  if (AD.locked) return;
  const host = soHostEl();
  if (box.parentNode !== host) host.append(box);
  sfx('pop');
  const el = document.createElement('div'), lab = ntActLabel(n);
  el.className = 'nt';
  el.dataset.k = n.k;
  el.innerHTML = `<span class="nt-i">${ntIcon(n.k)}</span><div class="nt-t"><b translate="no">${esc(n.t)}</b>${n.b ? `<span translate="no">${esc(n.b)}</span>` : ''}</div>${lab ? `<button class="btn2 pri" type="button" data-nt="go">${esc(auT(lab))}</button>` : ''}<button class="x" type="button" data-nt="x" aria-label="${esc(auT('Close'))}">${SO_ICO.x}</button>`;
  const kill = () => { if (!el.isConnected) return; el.classList.add('out'); setTimeout(() => el.remove(), motionOK() ? 220 : 0); };
  let t = setTimeout(kill, n.k === 'invite' || n.k === 'join' ? 25000 : 7000);
  el.addEventListener('mouseenter', () => clearTimeout(t));
  el.addEventListener('mouseleave', () => { t = setTimeout(kill, 4000); });
  el.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-nt]'); if (b && b.dataset.nt === 'x') { kill(); return; } ntRead(n.id); ntAct(n); kill(); });
  box.append(el);
  while (box.children.length > 4) box.firstElementChild.remove();
}
function ntRead(id) { const n = NT.list.find(x => x.id === id); if (n && !n.r) { n.r = true; ntSave(); ntBadge(); } }
async function ntAct(n) {
  const a = n.a || {};
  if (a.type === 'chat') dmOpen(a.uid);
  else if (a.type === 'join') { closeAll(); go(href(a.game, a.code), false); toast(auT('Joining the party…')); }
  else if (a.type === 'invite') soInvite(a.uid, soCan(a.game) ? a.game : null);
  else if (a.type === 'game') { closeAll(); go(href(a.game), false); }
  else if (a.type === 'friends') { if (openK !== 'friends') setOpen('friends'); }
}
function ntDraw() {
  const box = $('#nlist');
  if (!box) return;
  box.innerHTML = NT.list.length ? NT.list.map(n => `<button class="nrow${n.r ? '' : ' new'}" type="button" data-nid="${esc(n.id)}"><span class="nt-i">${ntIcon(n.k)}</span><span class="nt-t"><b translate="no">${esc(n.t)}</b>${n.b ? `<span translate="no">${esc(n.b)}</span>` : ''}<small>${esc(adAgo(new Date(n.at).toISOString()))}</small></span></button>`).join('') : `<div class="nofr">${esc(auT('No notifications yet.'))}</div>`;
}

const DM = { inbox: [], last: {}, open: null, msgs: [], urls: new Map(), unread: 0, first: true, t: 0, busy: false, prev: null };
async function dmPoll() {
  if (!SB.user) return;
  let r;
  try { r = await adRpc('dm_inbox'); } catch (e) { return; }
  if (!SB.user) return;
  const L = Array.isArray(r) ? r : [];
  L.forEach(c => {
    const was = DM.last[c.other_id] || 0, fresh = !DM.first && !c.last_mine && c.last_id > was;
    DM.last[c.other_id] = c.last_id;
    if (!fresh) return;
    delete SO.ty[c.other_id];
    if (soAuto(c)) return;
    if (!(DM.open === c.other_id && document.visibilityState === 'visible')) dmNotify(c);
  });
  DM.first = false; DM.inbox = L;
  DM.unread = L.reduce((n, c) => n + (c.other_id === DM.open ? 0 : +c.unread || 0), 0);
  ntBadge();
  if (openK === 'friends' && FR.list) frDraw();
  soList();
  if (DM.open) dmThread();
}
function soAuto(c) {
  const m = c.last_meta || {}, id = c.other_id;
  if (c.last_kind === 'invite' && SO.want && SO.want.id === id && Date.now() - SO.want.t < 180000 && m.game && m.code) {
    SO.want = null;
    dmClose(); closeAll();
    go(href(m.game, m.code), false);
    toast(auT('{u} let you in. Joining the party…').replace('{u}', soName(id)));
    return true;
  }
  if (c.last_kind === 'join') {
    const p = soParty();
    if (!p || S.prefs.p_inv === 'Nobody') return false;
    dmSend(id, 'invite', null, p).then(() => ntPush({ k: 'join', from: id, t: auT('{u} is joining your party').replace('{u}', soName(id)), b: soGameName(p.game) + ' · ' + auT('Code {c}').replace('{c}', p.code), a: { type: 'chat', uid: id } })).catch(() => dmNotify(c));
    return true;
  }
  return false;
}
function dmNotify(c) {
  const name = soName(c.other_id), m = c.last_meta || {}, P = S.prefs;
  if (c.last_kind === 'invite') { if (P.n_inv === false || P.p_inv === 'Nobody') return; ntPush({ k: 'invite', from: c.other_id, t: auT('{u} invited you to play').replace('{u}', name), b: soGameName(m.game), a: { type: 'join', game: m.game, code: m.code, uid: c.other_id } }); }
  else if (c.last_kind === 'join') { if (P.n_inv === false || P.p_inv === 'Nobody') return; ntPush({ k: 'join', from: c.other_id, t: auT('{u} wants to join your party').replace('{u}', name), b: soGameName(m.game), a: { type: 'invite', game: m.game, uid: c.other_id } }); }
  else { if (P.n_msg === false) return; ntPush({ k: c.last_kind === 'image' ? 'image' : 'dm', from: c.other_id, t: name, b: c.last_kind === 'image' ? auT('Sent a picture') : String(c.last_body || '').slice(0, 140), a: { type: 'chat', uid: c.other_id } }); }
}
async function dmSend(uid, kind, body, meta) {
  const id = await adRpc('dm_send', { p_to: uid, p_kind: kind, p_body: body || null, p_meta: meta || {} });
  rtSend(uid, { t: 'dm' });
  track('dm', { act: kind });
  if (DM.open === uid) dmThread();
  else dmPoll();
  return id;
}

function soHostEl() { return document.fullscreenElement || (gamebox.classList.contains('pfs') ? gamebox : document.body); }
function soPlace() {
  const h = soHostEl();
  ['#sodl', '#chat', '#ntst', '#soLight'].forEach(s => { const el = $(s); if (el && el.parentNode !== h) h.append(el); });
}
function soDockSync() {
  const b = $('#sodl');
  if (!b) return;
  b.hidden = !SB.user || !!AD.locked;
  const n = (FR.list || []).filter(f => soOn(f.friend_id)).length, o = b.querySelector('.so-dlo');
  o.hidden = !n; o.querySelector('b').textContent = n;
  b.setAttribute('aria-label', auT('Chat') + (DM.unread ? ' · ' + auT('{n} unread').replace('{n}', DM.unread) : '') + (n ? ' · ' + auT('{n} friends online').replace('{n}', n) : ''));
}
function soSave() { if (!SO.key) return; const el = $('#chat'); try { localStorage.setItem(SO.key, JSON.stringify({ o: !!(el && !el.hidden), v: SO.v, u: SO.last })); } catch (e) {} }
function soView(v) {
  SO.v = v;
  const el = soChatEl();
  el.classList.toggle('so-v-list', v === 'list'); el.classList.toggle('so-v-conv', v === 'conv');
  el.setAttribute('aria-label', v === 'list' ? auT('Chats') : auT('Chat with {u}').replace('{u}', soName(DM.open)));
}
function soShow(on) {
  const el = soChatEl(), b = $('#sodl');
  if (on) { soPlace(); vis(el, true); document.body.classList.add('chat-open'); }
  else { vis(el, false); document.body.classList.remove('chat-open'); }
  if (b) b.setAttribute('aria-expanded', String(on));
}
function soDock() {
  const el = soChatEl();
  if (!el.hidden) { dmClose(); return; }
  closeAll();
  if (SO.v === 'conv' && SO.last && soFriend(SO.last)) { dmOpen(SO.last); return; }
  soView('list'); soShow(true); soList(); soSave();
  if (!FR.list) frLoad().then(soList);
  if (!auCoarse()) el.querySelector('.so-sr input').focus({ preventScroll: true });
}
function dmBack() {
  clearInterval(DM.t); DM.open = null;
  soPick(false); soView('list'); soList(); soSave(); dmPoll();
  DM.unread = DM.inbox.reduce((n, c) => n + (+c.unread || 0), 0); ntBadge();
  const i = $('#chat .so-sr input'); if (i && !auCoarse()) i.focus({ preventScroll: true });
}
function soChatEl() {
  let el = $('#chat');
  if (el) return el;
  el = document.createElement('aside');
  el.id = 'chat'; el.className = 'chat so-v-list'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', auT('Chats'));
  const xb = `<button class="x" type="button" data-ch="close" aria-label="${esc(auT('Minimize chat'))}" title="${esc(auT('Minimize chat'))}">${SO_ICO.min}</button>`;
  el.innerHTML = `<div class="so-lv"><div class="ch-h so-lh"><span class="so-li">${SO_ICO.chat}</span><div class="ch-n"><b>${esc(auT('Chats'))}</b><span class="ch-s so-lc"></span></div><button class="x" type="button" data-ch="find" aria-label="${esc(auT('Add friends'))}" title="${esc(auT('Add friends'))}">${SO_ICO.add}</button>${xb}</div><label class="so-sr">${SO_ICO.find}<input type="search" placeholder="${esc(auT('Search friends'))}" aria-label="${esc(auT('Search friends'))}" autocomplete="off" spellcheck="false" maxlength="40"></label><div class="so-fl"></div></div>` +
    `<div class="so-cv"><div class="ch-h"><button class="x so-bk" type="button" data-ch="back" aria-label="${esc(auT('Back to chats'))}" title="${esc(auT('Back to chats'))}">${SO_ICO.back}<em hidden></em></button><span class="pic"></span><div class="ch-n"><b translate="no"></b><span class="ch-s"></span></div>${xb}</div><div class="ch-acts"></div><div class="ch-m" translate="no" aria-live="polite"></div><div class="so-ty" aria-live="polite" hidden></div><div class="note ch-note" role="status"></div><form class="ch-f" novalidate><button class="ch-ib" type="button" data-ch="img" aria-label="${esc(auT('Send a picture'))}" title="${esc(auT('Send a picture'))}">${SO_ICO.img}</button><input type="file" accept="image/*" hidden><textarea rows="1" maxlength="2000" aria-label="${esc(auT('Message'))}"></textarea><button class="ch-sb" type="submit" aria-label="${esc(auT('Send'))}">${SO_ICO.send}</button></form>` +
    `<div class="so-pk" hidden><div class="ch-h"><button class="x" type="button" data-ch="pkx" aria-label="${esc(auT('Back'))}">${SO_ICO.back}</button><div class="ch-n"><b class="so-pt"></b><span class="ch-s">${esc(auT('A party starts and your invite goes out with the code.'))}</span></div></div><div class="so-pl"></div></div></div>`;
  document.body.append(el);
  const ta = el.querySelector('textarea'), fi = el.querySelector('input[type=file]'), sr = el.querySelector('.so-sr input');
  el.addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) { e.stopPropagation(); dmAct(b.dataset.ch, b); } const im = e.target.closest('.ch-pic img'); if (im && im.src) soLight(im.src); });
  el.addEventListener('submit', e => { e.preventDefault(); dmSendText(); });
  el.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); if (!el.querySelector('.so-pk').hidden) soPick(false); else { dmClose(); const b = $('#sodl'); if (b && !b.hidden) b.focus({ preventScroll: true }); } return; }
    if (e.key === 'Enter' && !e.shiftKey && e.target === ta) { e.preventDefault(); dmSendText(); }
    if (e.key === 'ArrowDown' && e.target === sr) { e.preventDefault(); const f = el.querySelector('.so-fl [data-ch="so"]'); if (f) f.focus(); }
  });
  el.addEventListener('keyup', e => e.stopPropagation());
  ta.addEventListener('input', () => {
    ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
    if (ta.value.trim() && DM.open && SB.user && Date.now() - SO.tyAt > 3000) { SO.tyAt = Date.now(); rtSend(DM.open, { t: 'ty', f: SB.user.id }); }
  });
  ta.addEventListener('paste', e => { const f = [...(e.clipboardData && e.clipboardData.files || [])].find(x => /^image\//.test(x.type)); if (f) { e.preventDefault(); dmImage(f); } });
  sr.addEventListener('input', () => { SO.q = sr.value.trim().toLowerCase().replace(/^@/, ''); soList(); });
  fi.addEventListener('change', () => { const f = fi.files && fi.files[0]; fi.value = ''; if (f) dmImage(f); });
  el.addEventListener('dragover', e => { if (DM.open) { e.preventDefault(); el.classList.add('so-drop'); } });
  el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) el.classList.remove('so-drop'); });
  el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('so-drop'); const f = [...(e.dataTransfer && e.dataTransfer.files || [])].find(x => /^image\//.test(x.type)); if (f && DM.open) dmImage(f); });
  return el;
}
function soPreview(c) {
  const m = c.last_meta || {}, k = c.last_kind;
  const s = k === 'image' ? auT('Picture') : k === 'invite' ? auT('Party invite · {g}').replace('{g}', soGameName(m.game)) : k === 'join' ? auT('Asked to join · {g}').replace('{g}', soGameName(m.game)) : String(c.last_body || '').split('\n')[0];
  return c.last_mine ? auT('You: {m}').replace('{m}', s) : s;
}
function soWhen(t) {
  const d = new Date(t), n = new Date();
  if (isNaN(d)) return '';
  if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (n - d < 6 * 864e5) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function soDay(t) {
  const d = new Date(t), n = new Date(), y = new Date(n - 864e5);
  if (d.toDateString() === n.toDateString()) return auT('Today');
  if (d.toDateString() === y.toDateString()) return auT('Yesterday');
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: d.getFullYear() === n.getFullYear() ? undefined : 'numeric' });
}
function soList() {
  const el = $('#chat');
  if (!el || el.hidden || SO.v !== 'list') return;
  const box = el.querySelector('.so-fl'), q = SO.q, all = FR.list;
  const req = (FR.req || []).filter(r => r.direction === 'incoming').length;
  const on = (all || []).filter(f => soOn(f.friend_id)).length;
  el.querySelector('.so-lc').textContent = all ? auT('{n} online').replace('{n}', on) + ' · ' + auT(all.length === 1 ? '1 friend' : '{n} friends').replace('{n}', all.length) : '';
  if (!all) { box.innerHTML = '<i class="sk sk-row"></i>'.repeat(3); return; }
  const conv = id => DM.inbox.find(c => c.other_id === id);
  const at = f => { const c = conv(f.friend_id); return c ? Date.parse(c.last_at) || 0 : 0; };
  const un = f => { const c = conv(f.friend_id); return c ? +c.unread || 0 : 0; };
  const rank = f => { const o = soOn(f.friend_id); return o ? (o.p ? 3 : o.g ? 2 : 1) - (o.a ? 1.5 : 0) : 0; };
  const L = all.filter(f => !q || (f.username || '').includes(q) || (f.display_name || '').toLowerCase().includes(q));
  const srt = (a, b) => (un(b) > 0) - (un(a) > 0) || rank(b) - rank(a) || at(b) - at(a) || (a.display_name || a.username || '').localeCompare(b.display_name || b.username || '');
  const A = L.filter(f => soOn(f.friend_id)).sort(srt), B = L.filter(f => !soOn(f.friend_id)).sort(srt);
  const row = f => {
    const id = f.friend_id, o = soOn(id), c = conv(id), n = c ? +c.unread || 0 : 0, name = f.display_name || f.username || '?', ty = SO.ty[id] > Date.now();
    const pv = ty ? `<span class="so-pv so-typ">${esc(auT('typing…'))}</span>` : c ? `<span class="so-pv">${esc(soPreview(c))}</span>` : `<span class="so-pv">@${esc(f.username || '')}</span>`;
    return `<button class="so-fr${n ? ' un' : ''}${o ? '' : ' off'}" type="button" data-ch="so" data-id="${esc(id)}" aria-label="${esc(name + ', ' + soStatus(id) + (n ? ', ' + auT('{n} unread').replace('{n}', n) : ''))}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot${soDot(o)}"></i></span><span class="so-ft"><span class="so-fn"><b translate="no">${esc(name)}</b>${c ? `<time>${esc(soWhen(c.last_at))}</time>` : ''}</span><small class="so-st${o ? o.a ? ' aw' : ' on' : ''}">${esc(soStatus(id))}</small><span class="so-fn2" translate="no">${pv}${n ? `<em>${n > 9 ? '9+' : n}</em>` : ''}</span></span></button>`;
  };
  const sec = (t, a) => a.length ? `<div class="so-sh">${esc(t)} — ${a.length}</div>` + a.map(row).join('') : '';
  let h = req ? `<button class="so-req" type="button" data-ch="find">${SO_ICO.add}<span>${esc(auT(req === 1 ? '1 friend request' : '{n} friend requests').replace('{n}', req))}</span></button>` : '';
  if (!all.length) h += `<div class="so-empty">${SO_ICO.user}<b>${esc(auT('No friends yet'))}</b><span>${esc(auT('Add friends to chat and play together.'))}</span><button class="btn2 pri" type="button" data-ch="find">${esc(auT('Find friends'))}</button></div>`;
  else if (!L.length) h += `<div class="so-empty"><span>${esc(auT('No friend matches “{q}”.').replace('{q}', q))}</span></div>`;
  else h += sec(auT('Online'), A) + sec(auT('Offline'), B);
  const f = document.activeElement && document.activeElement.closest && document.activeElement.closest('.so-fr'), fid = f && f.dataset.id;
  box.innerHTML = h;
  if (fid) { const g = box.querySelector(`.so-fr[data-id="${CSS.escape(fid)}"]`); if (g) g.focus({ preventScroll: true }); }
}
async function dmOpen(uid) {
  if (!SB.user || !uid) return;
  if (!FR.list) await frLoad();
  if (!soFriend(uid)) { toast(auT('You can only chat with friends')); return; }
  const el = soChatEl();
  if (openK) closeAll();
  if (DM.open !== uid) { DM.open = uid; DM.msgs = []; DM.prev = null; el.querySelector('.ch-m').innerHTML = '<i class="sk sk-msg"></i>'.repeat(3); el.querySelector('textarea').value = ''; soPick(false); }
  SO.last = uid;
  soView('conv'); dmHead(); auMsg2(''); soTyDraw();
  soShow(true); soSave();
  DM.unread = DM.inbox.reduce((n, c) => n + (c.other_id === uid ? 0 : +c.unread || 0), 0); ntBadge();
  await dmThread();
  if (!auCoarse() && DM.open === uid) el.querySelector('textarea').focus({ preventScroll: true });
  clearInterval(DM.t); DM.t = setInterval(() => { if (DM.open && document.visibilityState === 'visible') dmThread(); }, 5000);
}
function dmClose() {
  const el = $('#chat');
  clearInterval(DM.t); DM.open = null;
  if (el) soShow(false);
  soSave();
}
function auMsg2(m, k) { const n = document.querySelector('#chat .ch-note'); if (n) { n.textContent = m ? auT(m) : ''; n.className = 'note ch-note' + (k ? ' ' + k : ''); } }
function soSaid(id, m, k) { if (DM.open === id && $('#chat') && !$('#chat').hidden) auMsg2(m, k); else toast(m); }
function soActs(id) {
  const f = soFriend(id), name = f ? (f.display_name || f.username || '?') : '', on = soOn(id), party = soParty(), mine = cur && soCan(cur.g.id) ? cur.g.id : null;
  const inv = party ? { k: 'invite', i: SO_ICO.pad, t: auT('Invite to my party · {g}').replace('{g}', soGameName(party.game)) } : mine ? { k: 'invite', i: SO_ICO.pad, t: auT('Invite to {g}').replace('{g}', soGameName(mine)) } : { k: 'pick', i: SO_ICO.pad, t: auT('Invite to play…') };
  let j;
  if (!on) j = { t: auT('Join'), why: auT('{u} is offline. You can still send an invite.').replace('{u}', name) };
  else if (on.g && on.p) j = { t: auT('Join party · {g}').replace('{g}', soGameName(on.g)) };
  else if (on.g && soCan(on.g)) j = { t: auT('Ask to join · {g}').replace('{g}', soGameName(on.g)) };
  else if (on.g) j = { t: auT('Join'), why: auT('{g} has no online mode. Invite {u} to a game that does.').replace('{g}', soGameName(on.g)).replace('{u}', name) };
  else j = { t: auT('Join'), why: auT('{u} is not in a game right now. Invite them instead.').replace('{u}', name) };
  j.k = 'join'; j.i = SO_ICO.join;
  return on && on.g && on.p ? [j, inv] : [inv, j];
}
function soActsHtml(id, at) {
  const A = soActs(id), why = A.map(a => a.why).filter(Boolean)[0];
  return A.map((a, i) => `<button class="btn2${!i ? ' pri' : ''}${a.why ? ' so-dis' : ''}" type="button" ${at}="${a.k}" data-id="${esc(id)}"${a.why ? ` aria-disabled="true" title="${esc(a.why)}"` : ''}>${a.i}<span>${esc(a.t)}</span></button>`).join('') + (why ? `<small class="so-why">${esc(why)}</small>` : '');
}
async function soDo(k, id, b) {
  if (b && b.getAttribute('aria-disabled') === 'true') { soSaid(id, b.title); return; }
  if (k === 'chat') { closeAll(); dmOpen(id); }
  else if (k === 'pick') { closeAll(); await dmOpen(id); soPick(true); }
  else if (k === 'invite') { if (b) b.disabled = true; await soInvite(id, null); if (b) b.disabled = false; }
  else if (k === 'join') { if (b) b.disabled = true; await soJoin(id); if (b) b.disabled = false; }
}
async function soInvite(id, game) {
  const p = soParty();
  if (p && (!game || game === p.game)) {
    try { await dmSend(id, 'invite', null, p); soSaid(id, auT('Invite sent to {u}. They join with code {c}.').replace('{u}', soName(id)).replace('{c}', p.code), 'ok'); }
    catch (e) { soSaid(id, auT('Could not send. Check your connection and try again.'), 'bad'); }
    return;
  }
  game = game || (cur && soCan(cur.g.id) ? cur.g.id : null);
  if (!game) { if (DM.open !== id) await dmOpen(id); soPick(true); return; }
  soHost(game, id);
}
function soHost(game, id) {
  if (SO.pend && SO.pend.game === game) SO.pend.ids.add(id); else SO.pend = { game, ids: new Set([id]) };
  SO.pend.t = Date.now();
  const here = cur && cur.g.id === game;
  toast(auT('Starting a {g} party. Your invite goes out as soon as it is ready.').replace('{g}', soGameName(game)));
  if (!(here && cur.api && cur.api.online)) {
    invite = { id: game, code: null, host: true };
    soPick(false);
    dmClose();
    closeAll();
    if (here) restartCurrent(); else go(href(game), false);
  }
  clearInterval(SO.pt); SO.pt = setInterval(soPendTick, 500);
}
async function soPendTick() {
  const P = SO.pend;
  if (!P) { clearInterval(SO.pt); return; }
  const p = soParty();
  if (p && p.game === P.game) {
    SO.pend = null; clearInterval(SO.pt);
    rtTrack(true);
    for (const id of P.ids) {
      try { await dmSend(id, 'invite', null, p); toast(auT('Invite sent to {u}. They join with code {c}.').replace('{u}', soName(id)).replace('{c}', p.code)); }
      catch (e) { toast(auT('Could not send the invite to {u}. Try again.').replace('{u}', soName(id))); }
    }
    return;
  }
  const away = Date.now() - P.t > 4000 && !(cur && cur.g.id === P.game) && !(pend && pend.id === P.game);
  if (away || Date.now() - P.t > 120000) {
    SO.pend = null; clearInterval(SO.pt);
    if (invite && invite.host) invite = null;
    if (!away) toast(auT('The party did not start, so the invite was not sent. Try again.'));
  }
}
async function soJoin(id) {
  const on = soOn(id);
  if (!on || !on.g) return;
  try { await dmSend(id, 'join', null, { game: on.g }); }
  catch (e) { soSaid(id, auT('Could not send. Check your connection and try again.'), 'bad'); return; }
  SO.want = { id, t: Date.now() };
  soSaid(id, on.p ? auT('Asked {u} to let you in. You join as soon as they accept.').replace('{u}', soName(id)) : auT('Request sent. {u} gets a notification and can start a party for you.').replace('{u}', soName(id)), 'ok');
}
function soPick(on) {
  const el = $('#chat');
  if (!el) return;
  const pk = el.querySelector('.so-pk');
  if (!on) { pk.hidden = true; return; }
  const L = games.filter(g => soCan(g.id)).sort((a, b) => (b === (cur && cur.g)) - (a === (cur && cur.g)) || a.title.localeCompare(b.title));
  pk.querySelector('.so-pt').textContent = auT('Play with {u}').replace('{u}', soName(DM.open));
  pk.querySelector('.so-pl').innerHTML = L.map(g => `<button class="so-gm" type="button" data-ch="pk" data-g="${esc(g.id)}"><span class="so-gi" style="background:${esc(tint(g))}">${img(g) || esc(g.title.charAt(0))}</span><span class="so-ft"><b>${esc(g.title)}</b><small>${esc(auT(playersText(g.info.pl)))}</small></span>${SO_ICO.pad}</button>`).join('');
  pk.hidden = false;
  const f = pk.querySelector('.so-gm'); if (f) f.focus({ preventScroll: true });
}
function dmHead() {
  const el = $('#chat'), uid = DM.open, f = soFriend(uid);
  if (!el || !uid || !f) return;
  const name = f.display_name || f.username || '?', on = soOn(uid);
  el.querySelector('.so-cv .pic').innerHTML = `${esc(name.charAt(0).toUpperCase())}<i class="fr-dot${soDot(on)}"></i>`;
  el.querySelector('.so-cv .ch-n b').textContent = name;
  el.querySelector('.so-cv .ch-s').innerHTML = `<span class="so-st${on ? on.a ? ' aw' : ' on' : ''}">${esc(soStatus(uid))}</span><span class="so-un">@${esc(f.username || '')}</span>`;
  el.querySelector('.ch-acts').innerHTML = soActsHtml(uid, 'data-ch');
  el.querySelector('textarea').placeholder = auT('Message {u}').replace('{u}', '@' + (f.username || name));
  const o = DM.inbox.reduce((n, c) => n + (c.other_id === uid ? 0 : +c.unread || 0), 0), bk = el.querySelector('.so-bk em');
  bk.textContent = o > 9 ? '9+' : o; bk.hidden = !o;
}
function soTyDraw() {
  const t = $('#chat .so-ty');
  if (!t) return;
  clearTimeout(SO.tyT);
  const on = DM.open && SO.ty[DM.open] > Date.now();
  t.hidden = !on;
  if (on) { t.innerHTML = `<i></i><i></i><i></i><span>${esc(auT('{u} is typing…').replace('{u}', soName(DM.open)))}</span>`; SO.tyT = setTimeout(() => { soTyDraw(); soList(); }, SO.ty[DM.open] - Date.now() + 50); }
}
function soSeen() {
  const box = $('#chat .ch-m');
  if (!box) return;
  const s = box.querySelector('.so-seen'); if (s) s.remove();
  const L = DM.msgs[DM.msgs.length - 1];
  if (L && L.mine && L.read_at) box.insertAdjacentHTML('beforeend', `<div class="so-seen">${esc(auT('Seen'))}</div>`);
}
async function dmSeenSync() {
  const uid = DM.open, M = DM.msgs.filter(m => m.mine && !m.read_at);
  if (!uid || !M.length) return;
  try { const r = await adRpc('dm_thread', { p_with: uid, p_after: M[0].id - 1 }); if (DM.open !== uid) return; (Array.isArray(r) ? r : []).forEach(x => { const m = DM.msgs.find(y => y.id === x.id); if (m && x.read_at) m.read_at = x.read_at; }); soSeen(); } catch (e) {}
}
async function dmThread() {
  const uid = DM.open;
  if (!uid || DM.busy) return;
  DM.busy = true;
  try {
    const after = DM.msgs.length ? DM.msgs[DM.msgs.length - 1].id : 0;
    const r = await adRpc('dm_thread', { p_with: uid, p_after: after });
    if (DM.open !== uid) return;
    const add = Array.isArray(r) ? r : [];
    const box = $('#chat .ch-m'), first = !after;
    if (first) { box.innerHTML = ''; DM.prev = null; }
    if (!add.length) { if (first) box.innerHTML = `<div class="ch-empty">${SO_ICO.chat}<span>${esc(auT('Say hi! Messages are only seen by the two of you.'))}</span></div>`; return; }
    const near = first || box.scrollHeight - box.scrollTop - box.clientHeight < 120;
    const em = box.querySelector('.ch-empty'); if (em) em.remove();
    const un = first ? add.findIndex(m => !m.mine && !m.read_at) : -1;
    DM.msgs.push(...add);
    box.insertAdjacentHTML('beforeend', add.map((m, i) => {
      const p = DM.prev;
      let s = '';
      if (!p || new Date(p.created_at).toDateString() !== new Date(m.created_at).toDateString()) s += `<div class="so-sep so-day"><span>${esc(soDay(m.created_at))}</span></div>`;
      if (i === un && i > 0) s += `<div class="so-sep so-new" id="soNew"><span>${esc(auT('New messages'))}</span></div>`;
      const card = k => k === 'invite' || k === 'join';
      const grp = !s && p && p.mine === m.mine && !card(p.kind) && !card(m.kind) && Date.parse(m.created_at) - Date.parse(p.created_at) < 300000;
      DM.prev = m;
      return s + dmRow(m, !first, grp);
    }).join(''));
    box.querySelectorAll('img[data-path]:not([src])').forEach(dmImg);
    soSeen();
    const nw = first && box.querySelector('#soNew');
    if (nw) box.scrollTop = Math.max(0, nw.offsetTop - 12);
    else if (near || add.some(m => m.mine)) box.scrollTop = box.scrollHeight;
    if (!first && add.some(m => !m.mine)) { delete SO.ty[uid]; soTyDraw(); sfx('pop'); }
    if (add.some(m => !m.mine && !m.read_at)) {
      await adRpc('dm_read', { p_with: uid }).catch(() => {});
      rtSend(uid, { t: 'rd', f: SB.user.id });
      const c = DM.inbox.find(x => x.other_id === uid); if (c) c.unread = 0;
      DM.unread = DM.inbox.reduce((n, c) => n + (c.other_id === DM.open ? 0 : +c.unread || 0), 0); ntBadge();
    }
  } catch (e) { auMsg2('Could not load the messages. Check your connection and try again.', 'bad'); }
  finally { DM.busy = false; }
}
function dmRow(m, anim, grp) {
  const d = new Date(m.created_at), hm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const cls = 'ch-r' + (m.mine ? ' me' : '') + (anim ? ' new' : '') + (grp ? ' so-g' : ''), t = grp ? '' : `<small>${esc(hm)}</small>`, g = m.meta || {}, name = soName(DM.open), tt = ` title="${esc(d.toLocaleString())}"`;
  if (m.kind === 'image') return `<div class="${cls}"${tt}><div class="ch-pic"><img data-path="${esc(g.path || '')}" alt="${esc(auT('Picture'))}" width="${+g.w || 320}" height="${+g.h || 240}" loading="lazy"></div>${t}</div>`;
  if (m.kind === 'invite') return `<div class="${cls}"${tt}><div class="ch-card">${SO_ICO.pad}<div><b>${esc(m.mine ? auT('You invited {u} to your party').replace('{u}', name) : auT('{u} invited you to their party').replace('{u}', name))}</b><span>${esc(soGameName(g.game))} · ${esc(auT('Code {c}').replace('{c}', g.code || ''))}</span></div>${m.mine ? '' : `<button class="btn2 pri" type="button" data-ch="go" data-g="${esc(g.game || '')}" data-c="${esc(g.code || '')}">${esc(auT('Join'))}</button>`}</div>${t}</div>`;
  if (m.kind === 'join') return `<div class="${cls}"${tt}><div class="ch-card">${SO_ICO.pad}<div><b>${esc(m.mine ? auT('You asked to join {u}').replace('{u}', name) : auT('{u} wants to join your party').replace('{u}', name))}</b><span>${esc(soGameName(g.game))}</span></div>${m.mine ? '' : `<button class="btn2 pri" type="button" data-ch="invite" data-g="${esc(g.game || '')}">${esc(auT('Invite'))}</button>`}</div>${t}</div>`;
  return `<div class="${cls}"${tt}><div class="ch-b">${esc(m.body || '')}</div>${t}</div>`;
}
async function dmImg(img) {
  const p = img.dataset.path;
  if (!p) return;
  if (DM.urls.has(p)) { img.src = DM.urls.get(p); return; }
  try {
    const c = await sbClient();
    const { data, error } = await c.storage.from('dm').createSignedUrl(p, 3600);
    if (error || !data) throw error;
    DM.urls.set(p, data.signedUrl);
    img.src = data.signedUrl;
  } catch (e) { img.alt = auT('Picture not available'); img.classList.add('bad'); }
}
async function dmSendText() {
  const el = $('#chat'), ta = el.querySelector('textarea'), v = ta.value.trim(), uid = DM.open;
  if (!v || !uid) return;
  ta.value = ''; ta.style.height = 'auto'; auMsg2(''); SO.tyAt = 0;
  try { await dmSend(uid, 'text', v); }
  catch (e) { ta.value = v; auMsg2(/too many/i.test(e.message || '') ? 'Too many messages. Wait a minute and try again.' : /not friends/i.test(e.message || '') ? 'You are no longer friends.' : /locked/i.test(e.message || '') ? 'Your account is locked.' : 'Could not send. Check your connection and try again.', 'bad'); }
}
async function dmImage(file) {
  const uid = DM.open;
  if (!uid || !SB.user) return;
  if (file.size > 25e6) { auMsg2('That picture is too big. Pick one under 25 MB.', 'bad'); return; }
  auMsg2('Sending the picture…');
  try {
    let blob = file, ext = 'gif', w = 0, h = 0;
    const bm = await createImageBitmap(file);
    w = bm.width; h = bm.height;
    if (file.type !== 'image/gif' || file.size > 3e6) {
      const k = Math.min(1, 1600 / Math.max(w, h)), cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      cv.getContext('2d').drawImage(bm, 0, 0, cw, ch);
      blob = await new Promise(r => cv.toBlob(r, 'image/webp', .85));
      if (!blob || blob.type !== 'image/webp') blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', .85));
      ext = blob.type === 'image/webp' ? 'webp' : 'jpg'; w = cw; h = ch;
    }
    bm.close && bm.close();
    const path = SB.user.id + '/' + uid + '/' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)) + '.' + ext;
    const c = await sbClient();
    const { error } = await c.storage.from('dm').upload(path, blob, { contentType: blob.type || 'image/' + ext, upsert: false });
    if (error) throw error;
    await dmSend(uid, 'image', null, { path, w, h });
    auMsg2('');
  } catch (e) { auMsg2('Could not send the picture. Try another one.', 'bad'); }
}
async function dmAct(k, b) {
  const uid = DM.open;
  if (k === 'close') { dmClose(); const l = $('#sodl'); if (l && !l.hidden) l.focus({ preventScroll: true }); return; }
  if (k === 'back') { dmBack(); return; }
  if (k === 'so') { dmOpen(b.dataset.id); return; }
  if (k === 'find') { dmClose(); setOpen('friends'); return; }
  if (k === 'img') { $('#chat input[type=file]').click(); return; }
  if (k === 'pkx') { soPick(false); return; }
  if (k === 'go') { dmClose(); closeAll(); go(href(b.dataset.g, b.dataset.c), false); toast(auT('Joining the party…')); return; }
  if (!uid) return;
  if (k === 'pk') { soHost(b.dataset.g, uid); return; }
  if (k === 'invite' && b.dataset.g && !b.dataset.id) { b.disabled = true; await soInvite(uid, soCan(b.dataset.g) ? b.dataset.g : null); b.disabled = false; return; }
  if (k === 'invite' || k === 'pick' || k === 'join') { await soDo(k, uid, b); if (DM.open === uid) dmHead(); }
}
function soLight(src) {
  let lb = $('#soLight');
  if (!lb) { lb = document.createElement('div'); lb.id = 'soLight'; lb.className = 'solight'; lb.innerHTML = '<img alt="">'; lb.addEventListener('click', () => vis(lb, false)); document.body.append(lb); }
  soPlace();
  lb.querySelector('img').src = src; vis(lb, true);
}

function soFriendRow(f) {
  const id = f.friend_id, on = soOn(id), open = FR.open === id, c = DM.inbox.find(x => x.other_id === id), un = c ? +c.unread || 0 : 0;
  const name = f.display_name || f.username || '?';
  const x = open ? `<div class="fr-x"><button class="btn2" type="button" data-fr="chat" data-id="${esc(id)}">${SO_ICO.chat}<span>${esc(auT('Chat'))}</span></button>${soActsHtml(id, 'data-fr')}<button class="btn2" type="button" data-fr="remove" data-id="${esc(id)}">${esc(auT('Remove'))}</button></div>` : '';
  return `<div class="frow fr-f${open ? ' open' : ''}" role="listitem" tabindex="0" data-frc="${esc(id)}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot${soDot(on)}"></i></span><div class="fr-n"><b>${esc(name)}</b><span>@${esc(f.username || '')}</span><em class="fr-st${on ? on.a ? ' aw' : ' on' : ''}">${esc(soStatus(id))}</em></div><div class="fr-a">${un ? `<span class="fr-un">${un > 9 ? '9+' : un}</span>` : ''}<button class="btn2 icon2" type="button" data-fr="chat" data-id="${esc(id)}" aria-label="${esc(auT('Chat'))}">${SO_ICO.chat}</button></div>${x}</div>`;
}
async function soFrAct(k, b) {
  if (!['chat', 'invite', 'pick', 'join'].includes(k)) return false;
  const id = b.dataset.id;
  if (b.getAttribute('aria-disabled') === 'true') { toast(b.title); return true; }
  await soDo(k, id, b);
  if (openK === 'friends' && FR.list) frDraw();
  return true;
}
async function frNudge() {
  const old = new Set((FR.req || []).filter(r => r.direction === 'incoming').map(r => r.id)), oldF = new Set((FR.list || []).map(f => f.friend_id)), had = !!FR.list;
  await frLoad();
  soList();
  if (!had) return;
  (FR.req || []).filter(r => r.direction === 'incoming' && !old.has(r.id)).forEach(r => { if (S.prefs.n_req !== false) ntPush({ k: 'fr', from: r.other_id, t: auT('{u} sent you a friend request').replace('{u}', r.display_name || r.username), b: '@' + r.username, a: { type: 'friends' } }); });
  (FR.list || []).filter(f => !oldF.has(f.friend_id)).forEach(f => ntPush({ k: 'fr', from: f.friend_id, t: auT('You are now friends with {u}').replace('{u}', f.display_name || f.username), b: '@' + f.username, a: { type: 'chat', uid: f.friend_id } }));
  ntBadge();
  rtSync();
}
function soNewGames() {
  const ids = games.map(g => g.id);
  let known = null;
  try { known = JSON.parse(localStorage.getItem('gameplay:known') || 'null'); } catch (e) {}
  try { localStorage.setItem('gameplay:known', JSON.stringify(ids)); } catch (e) {}
  if (!Array.isArray(known) || S.prefs.n_game === false) return;
  const K = new Set(known), fresh = ids.filter(id => !K.has(id));
  fresh.slice(0, 3).forEach(id => ntPush({ k: 'game', t: auT('New game: {g}').replace('{g}', soGameName(id)), b: auT('Just added. Be the first to set a record!'), a: { type: 'game', game: id } }));
  if (fresh.length > 3) ntPush({ k: 'game', t: auT('{n} new games').replace('{n}', fresh.length), b: auT('Check the home page to see them all.'), a: {} });
}
function soStart() {
  ntLoad();
  if (!SB.user) return;
  rtStart();
  DM.first = true; DM.last = {};
  SO.key = 'gameplay:dock:' + SB.user.id;
  let st = null;
  try { st = JSON.parse(localStorage.getItem(SO.key) || 'null'); } catch (e) {}
  if (st) { SO.v = st.v === 'conv' ? 'conv' : 'list'; SO.last = typeof st.u === 'string' ? st.u : null; }
  soDockSync();
  frLoad().then(() => {
    ntBadge(); rtSync();
    if (st && st.o && !auCoarse() && matchMedia('(min-width:761px)').matches && $('#chat') && $('#chat').hidden) { if (SO.v === 'conv' && soFriend(SO.last)) dmOpen(SO.last); else { soView('list'); soShow(true); soList(); } }
  });
  dmPoll();
}
function soStop() {
  rtStop(); dmClose();
  DM.inbox = []; DM.unread = 0; DM.msgs = []; DM.last = {}; DM.urls.clear();
  SO.pend = SO.want = null; SO.last = null; SO.v = 'list'; SO.key = ''; SO.ty = {}; clearInterval(SO.pt);
  ntLoad();
  soDockSync();
}
function soBoot() {
  MENUS.notifs = ['#nmenu', '#nbtn'];
  const right = document.querySelector('#top .right');
  right.insertAdjacentHTML('afterbegin', `<span class="onl" id="onl" hidden translate="no"><i></i><b>0</b> ${esc(auT('online'))}</span><button class="icon" id="nbtn" type="button" aria-label="${esc(auT('Notifications'))}" aria-haspopup="true" aria-expanded="false" aria-controls="nmenu">${SO_ICO.bell}<em hidden></em></button>`);
  $('#abtn').insertAdjacentHTML('beforeend', '<em hidden></em>');
  right.insertAdjacentHTML('beforeend', `<div class="menu r nmenu" id="nmenu" hidden><div class="nm-h"><b>${esc(auT('Notifications'))}</b><button class="au-link" type="button" id="nall">${esc(auT('Mark all as read'))}</button></div><div class="nlist" id="nlist"></div></div>`);
  document.body.insertAdjacentHTML('beforeend', `<button class="so-dl" id="sodl" type="button" hidden aria-expanded="false" aria-controls="chat">${SO_ICO.chat}<span class="so-dlt">${esc(auT('Chat'))}</span><span class="so-dlo" hidden translate="no"><i></i><b>0</b></span><em hidden></em></button>`);
  $('#sodl').addEventListener('click', e => { e.stopPropagation(); soDock(); });
  $('#nbtn').addEventListener('click', e => { e.stopPropagation(); setOpen('notifs'); if (openK === 'notifs') ntDraw(); });
  $('#nall').addEventListener('click', e => { e.stopPropagation(); NT.list.forEach(n => { n.r = true; }); ntSave(); ntBadge(); ntDraw(); });
  $('#nlist').addEventListener('click', e => { const b = e.target.closest('[data-nid]'); if (!b) return; const n = NT.list.find(x => x.id === b.dataset.nid); if (!n) return; ntRead(n.id); closeAll(); ntAct(n); });
  $('#fr-l').addEventListener('click', async e => {
    const b = e.target.closest('[data-fr]');
    if (b && ['chat', 'invite', 'pick', 'join'].includes(b.dataset.fr)) { e.stopPropagation(); await soFrAct(b.dataset.fr, b); return; }
    if (b) return;
    const r = e.target.closest('[data-frc]');
    if (r) { e.stopPropagation(); FR.open = FR.open === r.dataset.frc ? null : r.dataset.frc; frDraw(); }
  }, true);
  $('#fr-l').addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('[data-frc]'); if (r && e.target === r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); r.click(); } });
  setInterval(() => { if (SB.user && document.visibilityState === 'visible') dmPoll(); }, 30000);
  setInterval(() => {
    if (!SB.user) return;
    const pa = soParty(), k = (cur ? cur.g.id : '') + '|' + (pa ? pa.code : '');
    if (k !== SO.gk) { SO.gk = k; if (DM.open) dmHead(); if (openK === 'friends' && FR.list) frDraw(); rtTrack(true); }
    else if (RT.on && soIdle() !== SO.away) rtTrack(true);
  }, 1000);
  const act = () => { SO.act = Date.now(); if (SO.away && RT.on) { SO.away = false; rtTrack(true); } };
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'pointermove'].forEach(t => addEventListener(t, act, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible') { act(); dmPoll(); rtTrack(); } });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => setTimeout(soPlace, 0)));
  new MutationObserver(() => { const c = $('#chat'); if (document.body.classList.contains('modal-open') && c && !c.hidden && !c.classList.contains('out')) dmClose(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  ntLoad();
  setTimeout(soNewGames, 3000);
}
