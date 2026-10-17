const RT = { me: null, ch: null, on: null, pres: {}, seen: false, tt: 0 };
const SO_ICO = {
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg>',
  img: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pad: '<svg viewBox="0 0 24 24"><path d="M7 8h10a5 5 0 0 1 4.6 7l-.6 1.4a2.5 2.5 0 0 1-4.3.4L15 15H9l-1.7 1.8a2.5 2.5 0 0 1-4.3-.4L2.4 15A5 5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3M16 12h.01M18 11h.01"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>'
};
const soName = id => { const f = (FR.list || []).find(x => x.friend_id === id); return f ? (f.display_name || f.username || '?') : auT('A friend'); };
const soFriend = id => (FR.list || []).find(x => x.friend_id === id) || null;
const soOn = id => { const p = RT.pres[id]; return p && !p.h ? p : null; };
const soParty = () => { try { if (cur && cur.api && cur.api.online) { const n = cur.api.net; if (n && n.code) return { game: cur.g.id, code: String(n.code).toUpperCase() }; } } catch (e) {} return null; };
const soGameName = id => id ? (byId.get(id) ? byId.get(id).title : id) : '';

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
    const P = S.prefs, hide = P.p_status === 'Nobody';
    RT.on.track(hide ? { h: 1 } : { g: P.p_game === false || !cur ? null : cur.g.id, t: Date.now() }).catch(() => {});
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
  const host = document.fullscreenElement || document.body;
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
  else if (a.type === 'invite') { const p = soParty(); if (p && p.game === a.game) { await dmSend(a.uid, 'invite', null, p); toast(auT('Invite sent')); } else dmOpen(a.uid); }
  else if (a.type === 'game') { closeAll(); go(href(a.game), false); }
  else if (a.type === 'friends') { if (openK !== 'friends') setOpen('friends'); }
}
function ntDraw() {
  const box = $('#nlist');
  if (!box) return;
  box.innerHTML = NT.list.length ? NT.list.map(n => `<button class="nrow${n.r ? '' : ' new'}" type="button" data-nid="${esc(n.id)}"><span class="nt-i">${ntIcon(n.k)}</span><span class="nt-t"><b translate="no">${esc(n.t)}</b>${n.b ? `<span translate="no">${esc(n.b)}</span>` : ''}<small>${esc(adAgo(new Date(n.at).toISOString()))}</small></span></button>`).join('') : `<div class="nofr">${esc(auT('No notifications yet.'))}</div>`;
}

const DM = { inbox: [], last: {}, open: null, msgs: [], urls: new Map(), unread: 0, first: true, t: 0, busy: false };
async function dmPoll() {
  if (!SB.user) return;
  let r;
  try { r = await adRpc('dm_inbox'); } catch (e) { return; }
  if (!SB.user) return;
  const L = Array.isArray(r) ? r : [];
  L.forEach(c => {
    const was = DM.last[c.other_id] || 0;
    if (!DM.first && !c.last_mine && c.last_id > was && c.unread > 0 && !(DM.open === c.other_id && document.visibilityState === 'visible')) dmNotify(c);
    DM.last[c.other_id] = c.last_id;
  });
  DM.first = false; DM.inbox = L;
  DM.unread = L.reduce((n, c) => n + (c.other_id === DM.open ? 0 : +c.unread || 0), 0);
  ntBadge();
  if (openK === 'friends' && FR.list) frDraw();
  if (DM.open) dmThread();
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
  return id;
}
function soChatEl() {
  let el = $('#chat');
  if (el) return el;
  el = document.createElement('aside');
  el.id = 'chat'; el.className = 'chat'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', auT('Chat'));
  el.innerHTML = `<div class="ch-h"><span class="pic"></span><div class="ch-n"><b translate="no"></b><span class="ch-s"></span></div><button class="x" type="button" data-ch="close" aria-label="${esc(auT('Close'))}">${SO_ICO.x}</button></div><div class="ch-acts"><button class="btn2" type="button" data-ch="invite"></button><button class="btn2" type="button" data-ch="join"></button></div><div class="ch-m" translate="no" aria-live="polite"></div><div class="note ch-note" role="status"></div><form class="ch-f" novalidate><button class="ch-ib" type="button" data-ch="img" aria-label="${esc(auT('Send a picture'))}">${SO_ICO.img}</button><input type="file" accept="image/*" hidden><textarea rows="1" maxlength="2000"></textarea><button class="ch-sb" type="submit" aria-label="${esc(auT('Send'))}">${SO_ICO.send}</button></form>`;
  document.body.append(el);
  const ta = el.querySelector('textarea'), fi = el.querySelector('input[type=file]');
  el.addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) { e.stopPropagation(); dmAct(b.dataset.ch, b); } const im = e.target.closest('.ch-pic img'); if (im && im.src) soLight(im.src); });
  el.addEventListener('submit', e => { e.preventDefault(); dmSendText(); });
  el.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') { dmClose(); return; } if (e.key === 'Enter' && !e.shiftKey && e.target === ta) { e.preventDefault(); dmSendText(); } });
  el.addEventListener('keyup', e => e.stopPropagation());
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; });
  ta.addEventListener('paste', e => { const f = [...(e.clipboardData && e.clipboardData.files || [])].find(x => /^image\//.test(x.type)); if (f) { e.preventDefault(); dmImage(f); } });
  fi.addEventListener('change', () => { const f = fi.files && fi.files[0]; fi.value = ''; if (f) dmImage(f); });
  el.addEventListener('dragover', e => { e.preventDefault(); });
  el.addEventListener('drop', e => { e.preventDefault(); const f = [...(e.dataTransfer && e.dataTransfer.files || [])].find(x => /^image\//.test(x.type)); if (f) dmImage(f); });
  return el;
}
async function dmOpen(uid) {
  if (!SB.user || !uid) return;
  if (!FR.list) await frLoad();
  if (!soFriend(uid)) { toast(auT('You can only chat with friends')); return; }
  const el = soChatEl();
  if (openK === 'friends') closeAll();
  if (DM.open !== uid) { DM.open = uid; DM.msgs = []; el.querySelector('.ch-m').innerHTML = '<i class="sk sk-msg"></i>'.repeat(3); el.querySelector('textarea').value = ''; }
  dmHead(); auMsg2('');
  const host = document.fullscreenElement || document.body;
  if (el.parentNode !== host) host.append(el);
  vis(el, true);
  document.body.classList.add('chat-open');
  await dmThread();
  if (!auCoarse()) el.querySelector('textarea').focus({ preventScroll: true });
  clearInterval(DM.t); DM.t = setInterval(() => { if (DM.open && document.visibilityState === 'visible') dmThread(); }, 5000);
}
function dmClose() {
  const el = $('#chat');
  clearInterval(DM.t); DM.open = null;
  if (el) vis(el, false);
  document.body.classList.remove('chat-open');
}
function auMsg2(m, k) { const n = document.querySelector('#chat .ch-note'); if (n) { n.textContent = m ? auT(m) : ''; n.className = 'note ch-note' + (k ? ' ' + k : ''); } }
function dmHead() {
  const el = $('#chat'), uid = DM.open, f = soFriend(uid);
  if (!el || !uid || !f) return;
  const name = f.display_name || f.username || '?', on = soOn(uid), party = soParty();
  el.querySelector('.pic').textContent = name.charAt(0).toUpperCase();
  el.querySelector('.ch-n b').textContent = name;
  el.querySelector('.ch-s').innerHTML = on ? `<i class="fr-dot on"></i>${esc(on.g ? auT('Playing {g}').replace('{g}', soGameName(on.g)) : auT('Online'))}` : `<i class="fr-dot"></i>${esc('@' + (f.username || ''))}`;
  const ib = el.querySelector('[data-ch="invite"]'), jb = el.querySelector('[data-ch="join"]');
  ib.textContent = party ? auT('Invite to my party · {g}').replace('{g}', soGameName(party.game)) : auT('Invite to my party');
  ib.disabled = !party; ib.title = party ? '' : auT('Open online play in a game first');
  jb.textContent = on && on.g ? auT('Ask to join · {g}').replace('{g}', soGameName(on.g)) : auT('Ask to join their party');
  jb.disabled = !(on && on.g); jb.title = on && on.g ? '' : auT('They are not playing right now');
  el.querySelector('textarea').placeholder = auT('Message {u}').replace('{u}', '@' + (f.username || name));
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
    if (first) box.innerHTML = '';
    if (!add.length) { if (first) box.innerHTML = `<div class="ch-empty">${esc(auT('Say hi! Messages are only seen by the two of you.'))}</div>`; return; }
    const near = first || box.scrollHeight - box.scrollTop - box.clientHeight < 120;
    const em = box.querySelector('.ch-empty'); if (em) em.remove();
    DM.msgs.push(...add);
    box.insertAdjacentHTML('beforeend', add.map(m => dmRow(m, !first)).join(''));
    box.querySelectorAll('img[data-path]:not([src])').forEach(dmImg);
    if (near) box.scrollTop = box.scrollHeight;
    if (add.some(m => !m.mine && !m.read_at)) { await adRpc('dm_read', { p_with: uid }).catch(() => {}); const c = DM.inbox.find(x => x.other_id === uid); if (c) c.unread = 0; DM.unread = DM.inbox.reduce((n, c) => n + (c.other_id === DM.open ? 0 : +c.unread || 0), 0); ntBadge(); }
  } catch (e) { auMsg2('Could not load the messages. Check your connection and try again.', 'bad'); }
  finally { DM.busy = false; }
}
function dmRow(m, anim) {
  const cls = 'ch-r' + (m.mine ? ' me' : '') + (anim ? ' new' : ''), t = `<small>${esc(new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</small>`, g = m.meta || {}, name = soName(DM.open);
  if (m.kind === 'image') return `<div class="${cls}"><div class="ch-pic"><img data-path="${esc(g.path || '')}" alt="${esc(auT('Picture'))}" width="${+g.w || 320}" height="${+g.h || 240}" loading="lazy"></div>${t}</div>`;
  if (m.kind === 'invite') return `<div class="${cls}"><div class="ch-card">${SO_ICO.pad}<div><b>${esc(m.mine ? auT('You invited {u} to your party').replace('{u}', name) : auT('{u} invited you to their party').replace('{u}', name))}</b><span>${esc(soGameName(g.game))} · ${esc(auT('Code {c}').replace('{c}', g.code || ''))}</span></div>${m.mine ? '' : `<button class="btn2 pri" type="button" data-ch="go" data-g="${esc(g.game || '')}" data-c="${esc(g.code || '')}">${esc(auT('Join'))}</button>`}</div>${t}</div>`;
  if (m.kind === 'join') return `<div class="${cls}"><div class="ch-card">${SO_ICO.pad}<div><b>${esc(m.mine ? auT('You asked to join {u}').replace('{u}', name) : auT('{u} wants to join your party').replace('{u}', name))}</b><span>${esc(soGameName(g.game))}</span></div>${m.mine ? '' : `<button class="btn2 pri" type="button" data-ch="invite">${esc(auT('Invite'))}</button>`}</div>${t}</div>`;
  return `<div class="${cls}"><div class="ch-b">${esc(m.body || '')}</div>${t}</div>`;
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
  ta.value = ''; ta.style.height = 'auto'; auMsg2('');
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
  if (k === 'close') { dmClose(); return; }
  if (k === 'img') { $('#chat input[type=file]').click(); return; }
  if (k === 'go') { dmClose(); closeAll(); go(href(b.dataset.g, b.dataset.c), false); toast(auT('Joining the party…')); return; }
  if (!uid) return;
  if (k === 'invite') {
    const p = soParty();
    if (!p) { auMsg2('Open online play in a game first, then invite your friend.', 'bad'); return; }
    b.disabled = true;
    try { await dmSend(uid, 'invite', null, p); auMsg2('Invite sent.', 'ok'); } catch (e) { auMsg2('Could not send. Check your connection and try again.', 'bad'); }
    finally { b.disabled = false; dmHead(); }
  } else if (k === 'join') {
    const on = soOn(uid);
    if (!on || !on.g) return;
    b.disabled = true;
    try { await dmSend(uid, 'join', null, { game: on.g }); auMsg2('Request sent. You will get an invite when they accept.', 'ok'); } catch (e) { auMsg2('Could not send. Check your connection and try again.', 'bad'); }
    finally { dmHead(); }
  }
}
function soLight(src) {
  let lb = $('#soLight');
  if (!lb) { lb = document.createElement('div'); lb.id = 'soLight'; lb.className = 'solight'; lb.innerHTML = '<img alt="">'; lb.addEventListener('click', () => vis(lb, false)); document.body.append(lb); }
  lb.querySelector('img').src = src; vis(lb, true);
}

function soFriendRow(f) {
  const id = f.friend_id, on = soOn(id), open = FR.open === id, c = DM.inbox.find(x => x.other_id === id), un = c ? +c.unread || 0 : 0, party = soParty();
  const st = on ? (on.g ? auT('Playing {g}').replace('{g}', soGameName(on.g)) : auT('Online')) : auT('Offline');
  const name = f.display_name || f.username || '?';
  const x = open ? `<div class="fr-x"><button class="btn2 pri" type="button" data-fr="chat" data-id="${esc(id)}">${SO_ICO.chat}${esc(auT('Chat'))}</button><button class="btn2" type="button" data-fr="invite" data-id="${esc(id)}"${party ? '' : ' disabled'} title="${esc(party ? '' : auT('Open online play in a game first'))}">${SO_ICO.pad}${esc(party ? auT('Invite to my party · {g}').replace('{g}', soGameName(party.game)) : auT('Invite to my party'))}</button><button class="btn2" type="button" data-fr="join" data-id="${esc(id)}"${on && on.g ? '' : ' disabled'} title="${esc(on && on.g ? '' : auT('They are not playing right now'))}">${esc(on && on.g ? auT('Ask to join · {g}').replace('{g}', soGameName(on.g)) : auT('Ask to join their party'))}</button><button class="btn2" type="button" data-fr="remove" data-id="${esc(id)}">${esc(auT('Remove'))}</button></div>` : '';
  return `<div class="frow fr-f${open ? ' open' : ''}" role="listitem" tabindex="0" data-frc="${esc(id)}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot${on ? ' on' : ''}"></i></span><div class="fr-n"><b>${esc(name)}</b><span>@${esc(f.username || '')}</span><em class="fr-st${on ? ' on' : ''}">${esc(st)}</em></div><div class="fr-a">${un ? `<span class="fr-un">${un > 9 ? '9+' : un}</span>` : ''}<button class="btn2 icon2" type="button" data-fr="chat" data-id="${esc(id)}" aria-label="${esc(auT('Chat'))}">${SO_ICO.chat}</button></div>${x}</div>`;
}
async function soFrAct(k, b) {
  const id = b.dataset.id;
  if (k === 'chat') { closeAll(); dmOpen(id); return true; }
  if (k === 'invite') { const p = soParty(); if (!p) return true; b.disabled = true; try { await dmSend(id, 'invite', null, p); toast(auT('Invite sent to {u}').replace('{u}', soName(id))); } catch (e) { toast(auT('Could not send. Check your connection and try again.')); } b.disabled = false; return true; }
  if (k === 'join') { const on = soOn(id); if (!on || !on.g) return true; b.disabled = true; try { await dmSend(id, 'join', null, { game: on.g }); toast(auT('Request sent to {u}').replace('{u}', soName(id))); } catch (e) { toast(auT('Could not send. Check your connection and try again.')); } return true; }
  return false;
}
async function frNudge() {
  const old = new Set((FR.req || []).filter(r => r.direction === 'incoming').map(r => r.id)), oldF = new Set((FR.list || []).map(f => f.friend_id)), had = !!FR.list;
  await frLoad();
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
  frLoad().then(() => { ntBadge(); rtSync(); });
  dmPoll();
}
function soStop() {
  rtStop(); dmClose();
  DM.inbox = []; DM.unread = 0; DM.msgs = []; DM.last = {}; DM.urls.clear();
  ntLoad();
}
function soBoot() {
  MENUS.notifs = ['#nmenu', '#nbtn'];
  const right = document.querySelector('#top .right');
  right.insertAdjacentHTML('afterbegin', `<span class="onl" id="onl" hidden translate="no"><i></i><b>0</b> ${esc(auT('online'))}</span><button class="icon" id="nbtn" type="button" aria-label="${esc(auT('Notifications'))}" aria-haspopup="true" aria-expanded="false" aria-controls="nmenu">${SO_ICO.bell}<em hidden></em></button>`);
  $('#abtn').insertAdjacentHTML('beforeend', '<em hidden></em>');
  right.insertAdjacentHTML('beforeend', `<div class="menu r nmenu" id="nmenu" hidden><div class="nm-h"><b>${esc(auT('Notifications'))}</b><button class="au-link" type="button" id="nall">${esc(auT('Mark all as read'))}</button></div><div class="nlist" id="nlist"></div></div>`);
  $('#nbtn').addEventListener('click', e => { e.stopPropagation(); setOpen('notifs'); if (openK === 'notifs') ntDraw(); });
  $('#nall').addEventListener('click', e => { e.stopPropagation(); NT.list.forEach(n => { n.r = true; }); ntSave(); ntBadge(); ntDraw(); });
  $('#nlist').addEventListener('click', e => { const b = e.target.closest('[data-nid]'); if (!b) return; const n = NT.list.find(x => x.id === b.dataset.nid); if (!n) return; ntRead(n.id); closeAll(); ntAct(n); });
  $('#fr-l').addEventListener('click', async e => {
    const b = e.target.closest('[data-fr]');
    if (b && ['chat', 'invite', 'join'].includes(b.dataset.fr)) { e.stopPropagation(); await soFrAct(b.dataset.fr, b); return; }
    if (b) return;
    const r = e.target.closest('[data-frc]');
    if (r) { e.stopPropagation(); FR.open = FR.open === r.dataset.frc ? null : r.dataset.frc; frDraw(); }
  }, true);
  $('#fr-l').addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('[data-frc]'); if (r && e.target === r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); r.click(); } });
  setInterval(() => { if (SB.user && document.visibilityState === 'visible') dmPoll(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible') { dmPoll(); rtTrack(); } });
  ntLoad();
  setTimeout(soNewGames, 3000);
}
