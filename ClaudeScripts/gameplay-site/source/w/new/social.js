const RT = { me: null, ch: null, on: null, pres: {}, seen: false, tt: 0, pr: {}, rj: 0, rn: 0 };
const PB = { t: 0, db: {}, n: 0, at: 0, miss: false, busy: false, sent: 0, games: {} };
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
const SO = { pend: null, want: null, act: Date.now(), away: false, party: false, ty: {}, tyAt: 0, tyT: 0, v: 'list', last: null, q: '', pt: 0, key: '', gk: '', more: false, rep: null, bc: null, bat: 0, pAt: 0, pq: Promise.resolve(), cdT: 0 };
const SO_CD = {}, RT_Q = {}, SO_PCD = 1000;
const soCool = (k, ms) => { const t = SO_CD[k] || 0, now = Date.now(); if (now - t < ms) return Math.ceil((ms - (now - t)) / 1000); SO_CD[k] = now; return 0; };
const soPWait = () => adIsAdmin() ? 0 : Math.max(0, SO.pAt + SO_PCD - Date.now());
const soSleep = ms => new Promise(r => setTimeout(r, ms));
const soSecs = s => s >= 60 ? auT('{n} min').replace('{n}', Math.ceil(s / 60)) : auT('{n} s').replace('{n}', s);
function soCdApply() {
  const w = soPWait(), s = Math.ceil(w / 1000), lab = s >= 60 ? Math.ceil(s / 60) + 'm' : s + 's';
  document.querySelectorAll('[data-ch="invite"],[data-ch="join"],[data-fr="invite"],[data-fr="join"]').forEach(b => {
    if (b.getAttribute('aria-disabled') === 'true') return;
    if (w) { if (b.dataset.cd !== lab) b.dataset.cd = lab; b.classList.add('so-cd'); b.disabled = true; }
    else if (b.classList.contains('so-cd')) { b.classList.remove('so-cd'); delete b.dataset.cd; b.disabled = false; }
  });
  clearTimeout(SO.cdT);
  if (w) SO.cdT = setTimeout(soCdApply, Math.max(20, s >= 60 ? w - Math.max((Math.ceil(s / 60) - 1) * 60000, 59000) : w - (s - 1) * 1000));
}
const BL = { ids: new Set(), list: null, key: '' };
const blHas = id => !!id && BL.ids.has(id);
const SO_REP = [['spam', 'Spam'], ['harassment', 'Harassment'], ['cheating', 'Cheating'], ['inappropriate', 'Inappropriate'], ['other', 'Something else']];
function blLoad() {
  BL.key = SB.user ? 'gameplay:blocks:' + SB.user.id : ''; BL.ids = new Set(); BL.list = null;
  try { (JSON.parse(BL.key && localStorage.getItem(BL.key) || '[]') || []).forEach(x => { if (typeof x === 'string') BL.ids.add(x); }); } catch (e) {}
}
function blSave() { if (BL.key) try { localStorage.setItem(BL.key, JSON.stringify([...BL.ids].slice(0, 500))); } catch (e) {} }
async function blSync() {
  if (!SB.user || BL.miss) return;
  try { const r = await adRpc('my_blocks'); BL.list = Array.isArray(r) ? r : []; BL.ids = new Set(BL.list.map(x => x.blocked)); blSave(); }
  catch (e) { if (sbMissing(e)) { BL.list = null; BL.miss = true; } }
  if (openK === 'friends' && FR.list) frDraw();
}
async function soBlock(id) {
  try { await adRpc('block_user', { p_uid: id }); }
  catch (e) { if (!sbMissing(e)) throw e; await adRpc('remove_friend', { p_friend: id }); }
  BL.ids.add(id); blSave();
  if (DM.open === id) dmBack();
  if (SO.last === id) SO.last = null;
  delete SO.ty[id];
  NT.list = NT.list.filter(n => n.from !== id); ntSave(); ntBadge();
  await frLoad(); await blSync(); soList();
}
async function soUnblock(id) {
  try { await adRpc('unblock_user', { p_uid: id }); }
  catch (e) { if (!sbMissing(e)) throw e; }
  BL.ids.delete(id); if (BL.list) BL.list = BL.list.filter(x => x.blocked !== id); blSave();
  await blSync();
}
async function soReport(id, reason) {
  const r = SO_REP.some(x => x[0] === reason) ? reason : 'other';
  try { await adRpc('report_user', { p_uid: id, p_reason: r, p_details: null, p_block: false }); }
  catch (e) {
    if (!sbMissing(e)) throw e;
    const f = soFriend(id), un = f && f.username ? '@' + f.username : id;
    await adRpc('ticket_create', { p_subject: ('Report: ' + un + ' (' + r + ')').slice(0, 120), p_body: 'Player: ' + un + '\nUser id: ' + id + '\nReason: ' + r });
  }
}
function soRepHtml(id, at) {
  return `<small class="so-why">${esc(auT('Why are you reporting this player?'))}</small>` + SO_REP.map(([k, t]) => `<button class="btn2" type="button" ${at}="rep" data-r="${k}" data-id="${esc(id)}">${esc(auT(t))}</button>`).join('') + `<button class="btn2" type="button" ${at}="repx" data-id="${esc(id)}">${esc(auT('Cancel'))}</button>`;
}
function soErr(e, fb) {
  const m = String(e && e.message || '');
  if (e && e.local) return e.local > 3 ? auT('Slow down a little: {what}. Try again in {t}.').replace('{what}', auT('too many invites')).replace('{t}', soSecs(e.local)) : auT('You are sending party invites too fast. Try again in {t}.').replace('{t}', soSecs(e.local));
  if (sbLimit(e) && e.details === 'party') return auT('You are sending party invites too fast. Try again in {t}.').replace('{t}', soSecs(sbWait(e) || 1));
  if (sbLimit(e)) return sbLimitText(e, /dm_text|dm_image/.test(e.details || '') ? 'too many messages' : 'too many invites');
  if (/not friends/i.test(m)) return auT('You are no longer friends.');
  if (/locked/i.test(m)) return auT('Your account is locked.');
  if (/too many/i.test(m)) return auT('Too many messages. Wait a minute and try again.');
  return auT(fb || 'Could not send. Check your connection and try again.');
}
async function soPSend(id, kind, meta) {
  SO.pAt = Date.now(); soCdApply();
  try { return await dmSend(id, kind, null, meta); }
  catch (e) { SO.pAt = sbLimit(e) ? Date.now() + (sbWait(e) || 3) * 1000 - SO_PCD : 0; soCdApply(); throw e; }
}
function soDm(id, kind, meta, queue) {
  if (!queue) { const w = soPWait(); if (w) { const e = new Error('cooldown'); e.local = Math.ceil(w / 1000); return Promise.reject(e); } return soPSend(id, kind, meta); }
  const run = async () => {
    for (let i = 0; ; i++) {
      let w;
      while ((w = soPWait()) > 0) await soSleep(w + 40);
      try { return await soPSend(id, kind, meta); }
      catch (e) { if (!sbLimit(e) || i >= 2 || sbWait(e) > 10) throw e; }
    }
  };
  const p = SO.pq.then(run, run);
  SO.pq = p.catch(() => {});
  return p;
}
function rtLater(k, fn, ms) {
  const q = RT_Q[k] || (RT_Q[k] = { at: 0, t: 0 });
  if (q.t) return;
  q.t = setTimeout(() => { q.t = 0; q.at = Date.now(); fn(); }, Math.max(0, q.at + ms - Date.now()));
}
const soIdle = () => Date.now() - SO.act > 300000 || document.visibilityState === 'hidden' && Date.now() - SO.act > 60000;
const soDot = on => on ? on.a ? ' away' : ' on' : '';

const PT = { bc: null, tabs: {}, s: -1 };
const ptScore = () => (cur ? 2 : 0) + (document.visibilityState === 'visible' ? 1 : 0);
function ptSay(bye, ask) { PT.s = bye ? -1 : ptScore(); try { if (PT.bc) PT.bc.postMessage({ id: NET_TAB, s: PT.s, ask: ask ? 1 : 0 }); } catch (e) {} }
function ptTop() { const t = Date.now(); let top = -1; for (const k in PT.tabs) { if (t - PT.tabs[k].t > 70000) delete PT.tabs[k]; else if (PT.tabs[k].s > top) top = PT.tabs[k].s; } return top; }
function ptStart() {
  if (PT.bc || !window.BroadcastChannel) return;
  try {
    PT.bc = new BroadcastChannel('gameplay-presence');
    PT.bc.onmessage = e => {
      const d = e.data;
      if (!d || typeof d.id !== 'string' || d.id === NET_TAB || !SB.user) return;
      if (d.s < 0) { delete PT.tabs[d.id]; if (PB.t) rtLater('pt', pbBeat, 1200); return; }
      PT.tabs[d.id] = { s: +d.s || 0, t: Date.now() };
      if (d.ask) ptSay();
    };
    ptSay(false, true);
  } catch (e) { PT.bc = null; }
}
async function pbBeat() {
  if (!SB.user || PB.miss || PB.busy) return;
  ptSay();
  const quiet = ptTop() > PT.s;
  const uid = SB.user.id, P = S.prefs, g = P.p_game === false || !cur ? null : cur.g.id, pa = soParty();
  PB.busy = true; PB.sent = Date.now();
  SO.away = soIdle(); SO.party = !!(g && pa && pa.game === g);
  try {
    const r = await sbRest('rpc/presence_beat', { method: 'POST', body: { p_game: g, p_hidden: P.p_status === 'Nobody', p_away: SO.away, p_party: SO.party, p_quiet: quiet } });
    if (SB.user && SB.user.id === uid && r && typeof r === 'object' && Array.isArray(r.on)) {
      const m = {}, gm = {};
      r.on.forEach(x => { if (x && typeof x.id === 'string') m[x.id] = x.h ? { h: 1 } : { g: typeof x.g === 'string' ? x.g : null, a: x.a ? 1 : 0, p: x.p ? 1 : 0, t: Date.now() }; });
      if (r.games && typeof r.games === 'object') for (const k in r.games) { const n = Math.round(+r.games[k]); if (n > 0 && /^[a-z0-9][a-z0-9-]{0,39}$/.test(k)) gm[k] = Math.min(n, 99999); }
      PB.db = m; PB.games = gm; PB.n = Math.max(0, +r.n || 0); PB.at = Date.now();
      rtSync();
    }
  } catch (e) { if (sbMissing(e)) PB.miss = true; }
  PB.busy = false;
}
function pbStart() { ptStart(); clearInterval(PB.t); PB.t = setInterval(pbBeat, 30000); pbBeat(); }
function pbStop(bye) {
  clearInterval(PB.t); PB.t = 0; PB.db = {}; PB.games = {}; PB.n = 0; PB.at = 0;
  const others = ptTop() >= 0;
  ptSay(true);
  if (bye && !others && !PB.miss && sbTok()) sbRest('rpc/presence_bye', { method: 'POST', body: {}, keep: true }).catch(() => {});
}
const PR_GAP = 8000;
function prSend(o, ch, payload, fresh) {
  if (fresh) { o.last = null; }
  o.want = payload || null; o.ch = ch;
  if (o.t) return;
  const run = () => {
    o.t = 0;
    const c = o.ch, w = o.want, j = w ? JSON.stringify(w) : '';
    if (!c || c.state !== 'joined' || j === o.last || (!w && o.last == null)) return;
    o.last = j; o.at = Date.now();
    try { const r = w ? c.track(w) : c.untrack(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
  };
  o.t = setTimeout(run, Math.max(fresh ? 0 : 250, (o.at || 0) + (payload ? PR_GAP : 2000) - Date.now()));
}
function prDrop(o) { clearTimeout(o.t); o.t = 0; o.last = null; o.want = null; o.ch = null; }
function rtStart() {
  if (!SB.c || !SB.user || RT.me === SB.user.id) return;
  rtStop();
  const me = RT.me = SB.user.id;
  try { RT.ch = SB.c.channel('u:' + me).on('broadcast', { event: 'n' }, m => rtNudge(m && m.payload || {})).subscribe(); } catch (e) {}
}
function rtStop() {
  clearTimeout(RT.tt);
  try { if (RT.ch) SB.c.removeChannel(RT.ch); } catch (e) {}
  RT.ch = RT.on = RT.me = null; RT.seen = false; RT.pres = {};
  soLive();
}
function rtTrack(now) {
  if (!SB.user) return;
  SO.away = soIdle();
  clearTimeout(RT.tt);
  RT.tt = setTimeout(pbBeat, Math.max(now === true ? 300 : 1200, PB.sent + 5000 - Date.now()));
}
function rtSync() {
  const prev = RT.pres, P = {};
  if (Date.now() - PB.at < 110000) for (const k in PB.db) P[k] = PB.db[k];
  if (SB.user && PB.at) P[SB.user.id] = S.prefs.p_status === 'Nobody' ? { h: 1 } : { g: S.prefs.p_game === false || !cur ? null : cur.g.id, t: Date.now(), a: SO.away ? 1 : 0, p: SO.party ? 1 : 0 };
  RT.pres = P;
  const now = Date.now();
  if (RT.seen && S.prefs.n_on) (FR.list || []).forEach(f => { const id = f.friend_id; if (!blHas(id) && P[id] && !P[id].h && !(prev[id] && !prev[id].h) && now - (NT.on[id] || 0) > 600000) { NT.on[id] = now; ntPush({ k: 'online', from: id, t: auT('{u} is online').replace('{u}', soName(id)), b: P[id].g ? auT('Playing {g}').replace('{g}', soGameName(P[id].g)) : '', a: { type: 'chat', uid: id } }); } });
  if (!RT.seen) (FR.list || []).forEach(f => { if (P[f.friend_id]) NT.on[f.friend_id] = now; });
  RT.seen = true;
  rtLater('live', soLive, 400);
}
const RTS = {};
function rtSend(uid, p) {
  if (!SB.c || !uid) return Promise.resolve();
  if (uid === RT.me && RT.ch) { try { const r = RT.ch.send({ type: 'broadcast', event: 'n', payload: p }); return Promise.resolve(r).then(() => {}, () => {}); } catch (e) { return Promise.resolve(); } }
  const run = () => rtSend1(uid, p), q = RTS[uid] = (RTS[uid] || Promise.resolve()).then(run, run);
  q.then(() => { if (RTS[uid] === q) delete RTS[uid]; });
  return q;
}
function rtSend1(uid, p) {
  if (!SB.c || !uid) return Promise.resolve();
  return new Promise(res => {
    let done = false;
    const ch = SB.c.channel('u:' + uid);
    const fin = () => { if (done) return; done = true; let r = null; try { r = SB.c.removeChannel(ch); } catch (e) {} Promise.resolve(r).then(res, res); };
    try { ch.subscribe(s => { if (s === 'SUBSCRIBED') ch.send({ type: 'broadcast', event: 'n', payload: p }).then(fin, fin); else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') fin(); }); } catch (e) { fin(); }
    setTimeout(fin, 6000);
  });
}
function rtNudge(p) {
  const t = p && p.t;
  if (t === 'status') rtLater('st', () => adCheck(), 4000);
  else if (t === 'deleted') { AD.del = true; rtLater('st', () => adCheck(), 4000); }
  else if (t === 'profile') rtLater('pf', () => auLoadProfile().then(() => { auRender(); renderProfileBits(); }).catch(() => {}), 5000);
  else if (t === 'dm') rtLater('dm', dmPoll, 1500);
  else if (t === 'fr') rtLater('fr', frNudge, 3000);
  else if (t === 'ty' || t === 'rd') {
    const f = typeof p.f === 'string' ? p.f : '';
    if (!soFriend(f) || blHas(f)) return;
    if (t === 'ty' && SO.ty[f] > Date.now() + 4000) return;
    if (t === 'rd') { if (DM.open === f) rtLater('rd', dmSeenSync, 2000); return; }
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
  const n = Date.now() - PB.at < 110000 ? Math.max(PB.n, 1) : 0, pill = $('#onl');
  if (pill) { pill.hidden = !SB.user || !n; pill.querySelector('b').textContent = n; pill.title = auT(n === 1 ? '1 player online' : '{n} players online').replace('{n}', n); }
  cardPills();
  if (openK === 'friends' && FR.list) frDraw();
  if (DM.open) dmHead();
  soList(); soDockSync();
  if (view === 'admin') {
    document.querySelectorAll('#adt tbody tr[data-uid]').forEach(tr => tr.classList.toggle('on', !!RT.pres[tr.dataset.uid]));
    const u = adCur(); if (u && !$('#adpanel').hidden) $('#adplive').innerHTML = adLiveTxt(u);
    if (AD.tab === 'stats') stLive();
  }
}

const NT = { list: [], key: '', on: {}, snd: 0, hold: 0, t: 0, sw: null, hov: false };
const ntKey = n => (n.k === 'image' ? 'dm' : n.k) + '|' + (n.from || '') + '|' + (n.a && n.a.game || '');
const ntLife = k => k === 'invite' || k === 'join' ? 9000 : k === 'online' ? 4000 : 5500;
const NT_MAX = 3;
function ntLoad() {
  NT.key = SB.user ? 'gameplay:notifs:' + SB.user.id : 'gameplay:notifs';
  try { NT.list = JSON.parse(localStorage.getItem(NT.key) || '[]') || []; } catch (e) { NT.list = []; }
  if (!Array.isArray(NT.list)) NT.list = [];
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
  if (blHas(n.from)) return;
  const now = Date.now(), key = ntKey(n), i = NT.list.findIndex(x => !x.r && (x.key || ntKey(x)) === key && now - x.at < 600000);
  n.c = 1;
  if (i >= 0) { n.c = Math.min(99, (+NT.list[i].c || 1) + 1); NT.list.splice(i, 1); }
  n.id = now.toString(36) + Math.random().toString(36).slice(2, 6);
  n.at = now; n.r = false; n.key = key;
  NT.list.unshift(n);
  NT.list = NT.list.slice(0, 60);
  ntSave(); ntBadge();
  if (openK === 'notifs') { ntDraw(); return; }
  ntToast(n);
}
function ntIcon(k) { return k === 'dm' ? SO_ICO.chat : k === 'image' ? SO_ICO.img : k === 'invite' || k === 'join' ? SO_ICO.pad : k === 'game' ? SO_ICO.star : SO_ICO.user; }
function ntActLabel(n) { const a = n.a || {}; return a.type === 'join' ? 'Join' : a.type === 'invite' ? 'Invite' : a.type === 'chat' ? (n.k === 'online' ? 'Say hi' : 'Reply') : a.type === 'game' ? 'Play' : a.type === 'friends' ? 'Open' : ''; }
const ntCount = c => +c > 1 ? `<em class="nt-c" aria-label="${esc(auT('{n} times').replace('{n}', +c))}">×${+c}</em>` : '';
function ntBox() {
  let box = $('#ntst');
  if (box) return box;
  box = document.createElement('div'); box.id = 'ntst'; box.className = 'ntst'; box.setAttribute('aria-live', 'polite');
  document.body.append(box);
  const open = on => { box.classList.toggle('nt-open', on); ntHold(on); };
  box.addEventListener('mouseenter', () => { NT.hov = true; open(true); });
  box.addEventListener('mouseleave', () => { NT.hov = false; if (!box.contains(document.activeElement)) open(false); });
  box.addEventListener('focusin', () => open(true));
  box.addEventListener('focusout', e => { if (!box.contains(e.relatedTarget) && !NT.hov) open(false); });
  document.addEventListener('pointerdown', e => { if (box.classList.contains('nt-open') && !NT.hov && !box.contains(e.target)) open(false); }, true);
  box.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target.closest('.nt-more')) { ntClear(); open(false); if (openK !== 'notifs') setOpen('notifs'); ntDraw(); return; }
    const el = e.target.closest('.nt');
    if (!el || el.dataset.sw) return;
    if (!box.classList.contains('nt-open') && el.dataset.i !== '0') { open(true); return; }
    const b = e.target.closest('[data-nt]');
    if (b && b.dataset.nt === 'x') { ntKill(el); return; }
    const n = NT.list.find(x => x.id === el.dataset.nid) || el._n;
    ntKill(el);
    if (n) { ntRead(n.id); ntAct(n); }
  });
  box.addEventListener('pointerdown', e => { const el = e.target.closest('.nt'); if (!el || e.pointerType === 'mouse' || e.target.closest('button')) return; NT.sw = { el, x: e.clientX, id: e.pointerId, dx: 0 }; });
  box.addEventListener('pointermove', e => { const s = NT.sw; if (!s || e.pointerId !== s.id) return; s.dx = e.clientX - s.x; if (Math.abs(s.dx) > 6) { s.el.style.transform = `translateX(${s.dx}px)`; s.el.style.opacity = String(Math.max(.2, 1 - Math.abs(s.dx) / 220)); } });
  const up = e => { const s = NT.sw; if (!s || e.pointerId !== s.id) return; NT.sw = null; if (Math.abs(s.dx) > 70) { s.el.dataset.sw = '1'; ntKill(s.el); } else { s.el.style.transform = ''; s.el.style.opacity = ''; } };
  box.addEventListener('pointerup', up);
  box.addEventListener('pointercancel', up);
  addEventListener('resize', () => ntLay());
  return box;
}
function ntToast(n) {
  if (AD.locked) return;
  const box = ntBox(), host = soHostEl(), now = Date.now(), lab = ntActLabel(n);
  if (box.parentNode !== host) host.append(box);
  let el = [...box.querySelectorAll('.nt')].find(x => x.dataset.key === n.key);
  const again = !!el;
  if (el) { clearTimeout(el._rm); el.classList.remove('out', 'nt-again'); el.style.transform = ''; el.style.opacity = ''; delete el.dataset.sw; }
  else { el = document.createElement('div'); el.className = 'nt'; el.dataset.key = n.key; }
  el.dataset.k = n.k; el.dataset.nid = n.id; el._n = n;
  el.innerHTML = `<span class="nt-i">${ntIcon(n.k)}</span><div class="nt-t"><b translate="no"><span>${esc(n.t)}</span>${ntCount(n.c)}</b>${n.b ? `<span translate="no">${esc(n.b)}</span>` : ''}</div>${lab ? `<button class="btn2 pri" type="button" data-nt="go">${esc(auT(lab))}</button>` : ''}<button class="x" type="button" data-nt="x" aria-label="${esc(auT('Close'))}">${SO_ICO.x}</button>`;
  el.exp = NT.hold ? NT.hold + ntLife(n.k) : now + ntLife(n.k);
  box.prepend(el);
  if (again) el.classList.add('nt-again');
  if (now - NT.snd > 1500) { NT.snd = now; sfx('pop'); }
  ntLay();
}
function ntPos(box) {
  let top = '', right = '', width = '';
  if (box.parentNode === document.body) {
    const ch = $('#chat');
    if (matchMedia('(max-width:760px)').matches) {
      if (ch && !ch.hidden) { const m = ch.querySelector(SO.v === 'conv' ? '.ch-m' : '.so-fl'), r = m && m.getBoundingClientRect(); if (r && r.height) top = Math.round(r.top + 8) + 'px'; }
    } else {
      const hd = $('#top'), R = hd && hd.querySelector('.right'), B = hd && hd.querySelector('.brand');
      if (R && B) {
        const h = hd.getBoundingClientRect(), r = R.getBoundingClientRect(), b = B.getBoundingClientRect(), w = Math.min(360, r.left - b.right - 36);
        if (h.bottom <= 40) top = '12px';
        else if (w >= 280) { top = Math.round(h.top + Math.max(4, (h.height - 48) / 2)) + 'px'; right = Math.round(innerWidth - r.left + 12) + 'px'; width = Math.round(w) + 'px'; }
      }
    }
  }
  if (box.style.top !== top) box.style.top = top;
  if (box.style.right !== right) box.style.right = right;
  if (box.style.width !== width) box.style.width = width;
}
function ntLay() {
  const box = $('#ntst');
  if (!box) return;
  const L = [...box.querySelectorAll('.nt:not(.out)')], max = NT_MAX, h = L.length - max;
  L.forEach((el, i) => { el.hidden = i >= max; el.dataset.i = Math.min(i, max); });
  let more = box.querySelector('.nt-more');
  if (h > 0) {
    if (!more) { more = document.createElement('button'); more.type = 'button'; more.className = 'nt-more'; }
    more.textContent = auT(h === 1 ? '+1 more notification' : '+{n} more notifications').replace('{n}', h);
    box.append(more);
  } else if (more) more.remove();
  if (!L.length && box.classList.contains('nt-open') && !NT.hov) { box.classList.remove('nt-open'); ntHold(false); }
  ntPos(box);
  ntSched();
}
function ntSched() {
  const box = $('#ntst');
  clearTimeout(NT.t);
  if (!box || NT.hold) return;
  const L = [...box.querySelectorAll('.nt:not(.out)')];
  if (!L.length) return;
  NT.t = setTimeout(ntExpire, Math.max(60, Math.min(...L.map(el => el.exp)) - Date.now()));
}
function ntExpire() {
  const box = $('#ntst'), now = Date.now();
  if (!box || NT.hold) return;
  box.querySelectorAll('.nt:not(.out)').forEach(el => { if (el.exp <= now + 40) ntKill(el, true); });
  ntLay();
}
function ntKill(el, quiet) {
  if (!el || !el.isConnected || el.classList.contains('out')) return;
  el.classList.add('out');
  el._rm = setTimeout(() => { el.remove(); ntLay(); }, motionOK() && !el.hidden ? 200 : 0);
  if (!quiet) ntLay();
}
function ntHold(on) {
  const box = $('#ntst');
  if (on) { if (!NT.hold) { NT.hold = Date.now(); clearTimeout(NT.t); } return; }
  if (!NT.hold) return;
  const d = Date.now() - NT.hold, min = Date.now() + 2000;
  NT.hold = 0;
  if (box) box.querySelectorAll('.nt').forEach(el => { el.exp = Math.max(el.exp + d, min); });
  ntSched();
}
function ntClear() { const box = $('#ntst'); if (box) { box.querySelectorAll('.nt').forEach(el => { clearTimeout(el._rm); el.remove(); }); ntLay(); } }
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
  box.innerHTML = NT.list.length ? NT.list.map(n => `<button class="nrow${n.r ? '' : ' new'}" type="button" data-nid="${esc(n.id)}"><span class="nt-i">${ntIcon(n.k)}</span><span class="nt-t"><b translate="no"><span>${esc(n.t)}</span>${ntCount(n.c)}</b>${n.b ? `<span translate="no">${esc(n.b)}</span>` : ''}<small>${esc(adAgo(new Date(n.at).toISOString()))}</small></span></button>`).join('') : `<div class="nofr">${esc(auT('No notifications yet.'))}</div>`;
}

const DM = { inbox: [], last: {}, open: null, msgs: [], urls: new Map(), unread: 0, first: true, t: 0, busy: false, prev: null };
async function dmPoll() {
  if (!SB.user) return;
  let r;
  try { r = await adRpc('dm_inbox'); } catch (e) { return; }
  if (!SB.user) return;
  const L = (Array.isArray(r) ? r : []).filter(c => !blHas(c.other_id));
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
    if (!p || S.prefs.p_inv === 'Nobody' || soCool('auto:' + id, 15000)) return false;
    soDm(id, 'invite', p, true).then(() => ntPush({ k: 'join', from: id, t: auT('{u} is joining your party').replace('{u}', soName(id)), b: soGameName(p.game) + ' · ' + auT('Code {c}').replace('{c}', p.code), a: { type: 'chat', uid: id } })).catch(() => dmNotify(c));
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
  rtLater('s:' + uid, () => rtSend(uid, { t: 'dm' }), 1200);
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
  if (!el.hidden) ntLay();
}
function soShow(on) {
  const el = soChatEl(), b = $('#sodl');
  if (on) { soPlace(); vis(el, true); document.body.classList.add('chat-open'); }
  else { vis(el, false); document.body.classList.remove('chat-open'); }
  if (b) b.setAttribute('aria-expanded', String(on));
  ntLay(); setTimeout(ntLay, 260);
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
  if (!all.length) h += `<div class="so-empty">${SO_ICO.user}<b>${esc(auT('No friends yet'))}</b><button class="btn2 pri" type="button" data-ch="find">${esc(auT('Find friends'))}</button></div>`;
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
  if (DM.open !== uid) { DM.open = uid; DM.msgs = []; DM.prev = null; SO.more = false; SO.rep = SO.bc = null; el.querySelector('.ch-m').innerHTML = '<i class="sk sk-msg"></i>'.repeat(3); el.querySelector('textarea').value = ''; soPick(false); }
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
  else if (k === 'invite') { if (b) b.disabled = true; await soInvite(id, null); if (b) b.disabled = false; soCdApply(); }
  else if (k === 'join') { if (b) b.disabled = true; await soJoin(id); if (b) b.disabled = false; soCdApply(); }
}
async function soInvite(id, game) {
  const p = soParty();
  if (p && (!game || game === p.game)) {
    try { await soDm(id, 'invite', p); soSaid(id, auT('Invite sent to {u}. They join with code {c}.').replace('{u}', soName(id)).replace('{c}', p.code), 'ok'); }
    catch (e) { soSaid(id, soErr(e), 'bad'); }
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
  toast(auT('Starting a {g} party…').replace('{g}', soGameName(game)));
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
      const w = soPWait();
      if (w) toast(auT('Sending the invite to {u} in {t}…').replace('{u}', soName(id)).replace('{t}', soSecs(Math.ceil(w / 1000))));
      try { await soDm(id, 'invite', p, true); toast(auT('Invite sent to {u}. They join with code {c}.').replace('{u}', soName(id)).replace('{c}', p.code)); }
      catch (e) { toast(e && (e.local || sbLimit(e)) ? soErr(e) : auT('Could not send the invite to {u}. Try again.').replace('{u}', soName(id))); }
    }
    return;
  }
  const away = Date.now() - P.t > 4000 && !(cur && cur.g.id === P.game) && !(pend && pend.id === P.game);
  if (away || Date.now() - P.t > 120000) {
    SO.pend = null; clearInterval(SO.pt);
    if (invite && invite.host) invite = null;
    if (!away) toast(auT('Invite not sent. Try again.'));
  }
}
async function soJoin(id) {
  const on = soOn(id);
  if (!on || !on.g) return;
  try { await soDm(id, 'join', { game: on.g }); }
  catch (e) { soSaid(id, soErr(e), 'bad'); return; }
  SO.want = { id, t: Date.now() };
  soSaid(id, on.p ? auT('Asked {u} to let you in.').replace('{u}', soName(id)) : auT('Request sent to {u}.').replace('{u}', soName(id)), 'ok');
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
  const bc = SO.bc === uid && Date.now() - SO.bat < 4000;
  el.querySelector('.ch-acts').innerHTML = SO.rep === uid ? soRepHtml(uid, 'data-ch') : soActsHtml(uid, 'data-ch') + `<button class="btn2 so-more" type="button" data-ch="more" aria-expanded="${SO.more}" aria-label="${esc(auT('More actions'))}" title="${esc(auT('More actions'))}"><span>•••</span></button>` + (SO.more ? `<button class="btn2${bc ? ' dangerfill' : ''}" type="button" data-ch="block">${esc(auT(bc ? 'Click again to block' : 'Block'))}</button><button class="btn2" type="button" data-ch="report">${esc(auT('Report'))}</button>` : '');
  el.querySelector('textarea').placeholder = auT('Message {u}').replace('{u}', '@' + (f.username || name));
  const o = DM.inbox.reduce((n, c) => n + (c.other_id === uid ? 0 : +c.unread || 0), 0), bk = el.querySelector('.so-bk em');
  bk.textContent = o > 9 ? '9+' : o; bk.hidden = !o;
  soCdApply();
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
  if (!uid) return;
  if (DM.busy) { DM.again = true; return; }
  DM.busy = true;
  try {
    const after = DM.msgs.length ? DM.msgs[DM.msgs.length - 1].id : 0;
    const r = await adRpc('dm_thread', { p_with: uid, p_after: after });
    if (DM.open !== uid || after !== (DM.msgs.length ? DM.msgs[DM.msgs.length - 1].id : 0)) { DM.again = !!DM.open; return; }
    const add = Array.isArray(r) ? r : [];
    const box = $('#chat .ch-m'), first = !after;
    if (first) { box.innerHTML = ''; DM.prev = null; }
    if (!add.length) { if (first) box.innerHTML = `<div class="ch-empty">${SO_ICO.chat}<span>${esc(auT('Say hi! This chat is between you two. Staff can review messages to keep the site safe.'))}</span></div>`; return; }
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
    soSeen(); soCdApply();
    const nw = first && box.querySelector('#soNew');
    if (nw) box.scrollTop = Math.max(0, nw.offsetTop - 12);
    else if (near || add.some(m => m.mine)) box.scrollTop = box.scrollHeight;
    if (!first && add.some(m => !m.mine)) { delete SO.ty[uid]; soTyDraw(); sfx('pop'); }
    if (add.some(m => !m.mine && !m.read_at)) { if (dmSeeing()) await dmRead(uid); else DM.unseen = uid; }
  } catch (e) { auMsg2('Could not load the messages. Check your connection and try again.', 'bad'); }
  finally { DM.busy = false; if (DM.again) { DM.again = false; if (DM.open) dmThread(); } }
}
const dmSeeing = () => document.visibilityState === 'visible' && !!$('#chat') && !$('#chat').hidden;
async function dmRead(uid) {
  DM.unseen = null;
  await adRpc('dm_read', { p_with: uid }).catch(() => {});
  rtLater('r:' + uid, () => { if (SB.user) rtSend(uid, { t: 'rd', f: SB.user.id }); }, 2000);
  const c = DM.inbox.find(x => x.other_id === uid); if (c) c.unread = 0;
  DM.unread = DM.inbox.reduce((n, c) => n + (c.other_id === DM.open ? 0 : +c.unread || 0), 0); ntBadge();
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
  const k = DM.urls.get(p);
  if (!img.dataset.rt) { img.dataset.rt = '1'; img.addEventListener('error', () => { if (img.dataset.rt === '1' && img.getAttribute('src')) { img.dataset.rt = '2'; DM.urls.delete(p); dmImg(img); } }); }
  if (k && k.u && Date.now() - k.at < 3000000) { img.src = k.u; return; }
  try {
    const c = await sbClient();
    const { data, error } = await c.storage.from('dm').createSignedUrl(p, 3600);
    if (error || !data) throw error;
    let u = data.signedUrl;
    try { const x = new URL(u); u = SBN.url(x.pathname + x.search); } catch (e) {}
    DM.urls.set(p, { u, at: Date.now() });
    img.src = u;
  } catch (e) { img.alt = auT('Picture not available'); img.classList.add('bad'); }
}
async function dmSendText() {
  const el = $('#chat'), ta = el.querySelector('textarea'), v = ta.value.trim(), uid = DM.open;
  if (!v || !uid) return;
  ta.value = ''; ta.style.height = 'auto'; auMsg2(''); SO.tyAt = 0;
  try { await dmSend(uid, 'text', v); }
  catch (e) { ta.value = v; auMsg2(soErr(e), 'bad'); }
}
async function dmImage(file) {
  const uid = DM.open;
  if (!uid || !SB.user) return;
  if (file.size > 25e6) { auMsg2('That picture is too big. Pick one under 25 MB.', 'bad'); return; }
  const w = soCool('img', 4000);
  if (w) { auMsg2(auT('You just sent one. Wait {s} s before sending another.').replace('{s}', w), 'bad'); return; }
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
  } catch (e) { auMsg2(sbLimit(e) ? soErr(e) : 'Could not send the picture. Try another one.', 'bad'); }
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
  if (k === 'more') { SO.more = !SO.more; SO.bc = null; dmHead(); return; }
  if (k === 'report') { SO.rep = uid; dmHead(); return; }
  if (k === 'repx') { SO.rep = null; dmHead(); return; }
  if (k === 'rep') { b.disabled = true; try { await soReport(uid, b.dataset.r); SO.rep = null; SO.more = false; dmHead(); soSaid(uid, 'Thanks. An admin will look at your report.', 'ok'); track('friend', { act: 'report', r: b.dataset.r }); } catch (e) { b.disabled = false; soSaid(uid, sbLimit(e) ? sbLimitText(e, 'too many reports') : 'Could not send. Check your connection and try again.', 'bad'); } return; }
  if (k === 'block') {
    if (!(SO.bc === uid && Date.now() - SO.bat < 4000)) { SO.bc = uid; SO.bat = Date.now(); dmHead(); setTimeout(() => { if (SO.bc === uid) { SO.bc = null; if (DM.open === uid) dmHead(); } }, 4100); return; }
    SO.bc = null; b.disabled = true;
    const nm = soName(uid);
    try { await soBlock(uid); SO.more = false; toast(auT('{u} is blocked.').replace('{u}', nm)); track('friend', { act: 'block' }); }
    catch (e) { b.disabled = false; soSaid(uid, sbLimit(e) ? sbLimitText(e, 'too many changes') : 'Could not update. Check your connection and try again.', 'bad'); }
    return;
  }
  if (k === 'invite' && b.dataset.g && !b.dataset.id) { b.disabled = true; await soInvite(uid, soCan(b.dataset.g) ? b.dataset.g : null); b.disabled = false; soCdApply(); return; }
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
  const x = open ? `<div class="fr-x">${FR.rep === id ? soRepHtml(id, 'data-fr') : `<button class="btn2" type="button" data-fr="chat" data-id="${esc(id)}">${SO_ICO.chat}<span>${esc(auT('Chat'))}</span></button>${soActsHtml(id, 'data-fr')}<button class="btn2" type="button" data-fr="remove" data-id="${esc(id)}">${esc(auT('Remove'))}</button><button class="btn2" type="button" data-fr="block" data-id="${esc(id)}">${esc(auT('Block'))}</button><button class="btn2" type="button" data-fr="report" data-id="${esc(id)}">${esc(auT('Report'))}</button>`}</div>` : '';
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
  blLoad(); blSync();
  rtStart();
  pbStart();
  DM.first = true; DM.last = {};
  SO.key = 'gameplay:dock:' + SB.user.id;
  let st = null;
  try { st = JSON.parse(localStorage.getItem(SO.key) || 'null'); } catch (e) {}
  if (st) { SO.v = st.v === 'conv' ? 'conv' : 'list'; SO.last = typeof st.u === 'string' ? st.u : null; }
  soDockSync();
  frLoad().then(() => {
    ntBadge(); rtSync();
    if (st && st.o && !auCoarse() && matchMedia('(min-width:761px)').matches && (!$('#chat') || $('#chat').hidden)) { if (SO.v === 'conv' && soFriend(SO.last)) dmOpen(SO.last); else { soView('list'); soShow(true); soList(); } }
  });
  dmPoll();
}
function soStop() {
  pbStop(false);
  rtStop(); dmClose();
  DM.inbox = []; DM.unread = 0; DM.msgs = []; DM.last = {}; DM.urls.clear();
  SO.pend = SO.want = null; SO.last = null; SO.v = 'list'; SO.key = ''; SO.ty = {}; SO.rep = SO.bc = null; SO.more = false; clearInterval(SO.pt);
  BL.ids = new Set(); BL.list = null; BL.key = '';
  NT.on = {}; ntClear();
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
    else if (soIdle() !== SO.away) rtTrack(true);
  }, 1000);
  const act = () => { SO.act = Date.now(); if (SO.away) { SO.away = false; rtTrack(true); } };
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'pointermove'].forEach(t => addEventListener(t, act, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible') { act(); dmPoll(); rtTrack(true); if (DM.unseen && DM.unseen === DM.open && dmSeeing()) dmRead(DM.unseen); } else if (SB.user) rtTrack(true); });
  addEventListener('pagehide', () => { if (SB.user && PB.t) pbStop(true); });
  addEventListener('pageshow', e => { if (e.persisted && SB.user && !PB.t) pbStart(); });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => setTimeout(soPlace, 0)));
  new MutationObserver(() => { const c = $('#chat'); if (document.body.classList.contains('modal-open') && c && !c.hidden && !c.classList.contains('out')) dmClose(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  ntLoad();
  setTimeout(soNewGames, 3000);
}
const CHL = { last: '', at: 0 };
function gpChatLog(kind, game, room, body) {
  body = String(body == null ? '' : body).replace(/\s+/g, ' ').trim().slice(0, 500);
  if (!body || !SB.user || AD.locked) return;
  const k = kind + '|' + body, t = Date.now();
  if (CHL.last === k && t - CHL.at < 2500) return;
  CHL.last = k; CHL.at = t;
  adRpc('log_chat', { p_kind: kind, p_game: game || null, p_room: room || null, p_body: body }).catch(() => {});
}
const clText = el => !!el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|)$/i.test(el.getAttribute('type') || ''))) && !el.closest('.g-lobby');
function clGame(v) {
  if (!cur) return;
  let room = null;
  try { const n = cur.api && cur.api.online && cur.api.net; room = n && n.code ? String(n.code) : null; } catch (e) {}
  if (!room) return;
  gpChatLog('game', cur.g.id, room, v);
}
(() => {
  const gb = document.getElementById('gamebox');
  if (!gb) return;
  gb.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing && clText(e.target)) clGame(e.target.value); }, true);
  gb.addEventListener('submit', e => { const f = e.target; if (f && f.querySelectorAll) f.querySelectorAll('input, textarea').forEach(i => { if (clText(i)) clGame(i.value); }); }, true);
  gb.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (!b || b.closest('.g-lobby') || (b.form && b.type === 'submit')) return;
    let p = b.parentElement;
    for (let i = 0; i < 2 && p && p !== gb; i++, p = p.parentElement) {
      const t = [...p.querySelectorAll('input, textarea')].filter(x => clText(x) && x.value.trim());
      if (t.length === 1) { clGame(t[0].value); return; }
      if (t.length > 1) return;
    }
  }, true);
})();
window.gpChatLog = gpChatLog;
window.gpParty = {
  signed: () => !!SB.user,
  friends: () => (FR.list || []).filter(f => !blHas(f.friend_id)).map(f => ({ id: f.friend_id, name: f.display_name || f.username || '?', status: soStatus(f.friend_id), on: !!soOn(f.friend_id) })).sort((a, b) => b.on - a.on || a.name.localeCompare(b.name)),
  invite: id => { const p = soParty(); if (!p) return Promise.reject(new Error('No party')); return soDm(id, 'invite', p, true); },
  err: e => soErr(e),
  signIn: () => { closeAll(); auOpen('main', '', '', 'in'); }
};
const PUB = { ch: null, me: 'p' + Math.random().toString(36).slice(2, 12), list: {}, mine: null, tt: 0, st: false, mo: null, q: 0, pr: {}, rj: 0, rn: 0 };
function pubStart() {
  if (PUB.st) return;
  PUB.st = true;
  sbClient().then(c => {
    if (PUB.ch) return;
    prDrop(PUB.pr);
    const ch = PUB.ch = c.channel('parties', { config: { presence: { key: PUB.me } } });
    ch.on('presence', { event: 'sync' }, pubSync).subscribe(s => {
      if (PUB.ch !== ch) return;
      if (s === 'SUBSCRIBED') { PUB.rn = 0; PUB.pr.last = null; pubTrack(true); }
      else if (s === 'CLOSED') {
        DIAG.ev('net', { a: 'presence-closed', ch: 'parties' });
        if (PUB.dead === ch) return;
        PUB.dead = ch;
        clearTimeout(PUB.rj);
        PUB.rj = setTimeout(() => { if (PUB.ch !== ch) return; PUB.ch = null; PUB.st = false; try { c.removeChannel(ch); } catch (e) {} pubStart(); }, Math.min(60000, 9000 * Math.pow(2, PUB.rn = (PUB.rn || 0) + 1)));
      }
    });
  }).catch(() => { PUB.st = false; });
}
function pubSync() {
  const s = PUB.ch ? PUB.ch.presenceState() : {}, L = {};
  for (const k in s) {
    if (k === PUB.me) continue;
    const a = s[k], p = a && a[a.length - 1];
    if (!p || typeof p.g !== 'string' || typeof p.c !== 'string' || !byId.has(p.g) || !/^[A-Z0-9]{4,8}$/.test(p.c) || sfOff(p.g)) continue;
    const n = Math.max(1, Math.min(16, +p.n || 1)), m = Math.max(2, Math.min(16, +p.m || 2));
    if (n >= m) continue;
    (L[p.g] = L[p.g] || []).push({ c: p.c, n, m, h: String(p.h || '').replace(/[<>&"'`]/g, '').slice(0, 16), b: !!p.b, t: +p.t || 0 });
  }
  for (const k in L) L[k].sort((x, y) => x.b - y.b || y.n - x.n || x.t - y.t);
  PUB.list = L;
  cardPills();
  pubStrip();
  document.dispatchEvent(new CustomEvent('gp:pub'));
}
function pubTrack(fresh) {
  if (!PUB.ch) return;
  prSend(PUB.pr, PUB.ch, PUB.mine, fresh === true);
}
window.gpPubSet = (gid, o) => {
  if (!o && (!PUB.mine || PUB.mine.g !== gid)) return;
  PUB.mine = o || null;
  if (o) pubStart();
  pubTrack();
};
window.gpPubList = gid => (PUB.list[gid] || []).slice();
function cardPills() {
  const by = Date.now() - PB.at < 110000 ? PB.games : {};
  document.querySelectorAll('.card[data-id]').forEach(el => {
    const id = el.dataset.id, art = el.querySelector('.art') || el, c = by[id] || 0, P = PUB.list[id];
    let b = el.querySelector('.livepill');
    if (!c) { if (b) b.remove(); }
    else {
      if (!b) { b = document.createElement('span'); b.className = 'livepill'; b.setAttribute('translate', 'no'); art.append(b); }
      const t = auT('{n} playing').replace('{n}', c); if (b.textContent !== t) b.textContent = t;
    }
    let q = el.querySelector('.pubpill');
    if (!P || !P.length) { if (q) q.remove(); return; }
    if (!q) { q = document.createElement('span'); q.className = 'pubpill'; q.setAttribute('role', 'button'); q.tabIndex = 0; art.append(q); }
    const p = P[0], t = P.length > 1 ? auT('{n} public parties').replace('{n}', P.length) : auT('Public party · {n}/{m}').replace('{n}', p.n).replace('{m}', p.m), h = `<i></i>${esc(t)}<b>${esc(auT('Join'))}</b>`;
    if (q.dataset.h !== h) { q.dataset.h = h; q.innerHTML = h; q.title = auT('Join {u}’s public party').replace('{u}', p.h || p.c); q.dataset.c = p.c; }
  });
}
function pubStrip() {
  const sec = $('#pubs'), box = $('#pubsl');
  if (!sec) return;
  const all = [];
  for (const id in PUB.list) if (byId.has(id)) PUB.list[id].forEach(p => all.push([id, p]));
  all.sort((a, b) => a[1].b - b[1].b || b[1].n - a[1].n);
  sec.hidden = !all.length;
  const h = all.slice(0, 8).map(([id, p]) => { const g = byId.get(id); return `<a class="pubc" href="${href(id, p.c)}" data-pid="${esc(id)}"><span class="pubc-i" style="background:${esc(tint(g))}">${img(g) || esc(g.title.charAt(0))}</span><span class="pubc-t"><b>${esc(g.title)}</b><small>${esc(p.h || p.c)} · ${p.n}/${p.m}${p.b ? ' · ' + esc(auT('In game')) : ''}</small></span><i>${esc(auT('Join'))}</i></a>`; }).join('');
  if (box.dataset.h !== h) { box.dataset.h = h; box.innerHTML = h; }
  document.querySelectorAll('#slist .srow').forEach(r => r.classList.toggle('haspub', !!(PUB.list[r.dataset.id] || []).length));
}
function pubJoin(q) {
  const el = q.closest('[data-id]'), id = el && el.dataset.id, c = q.dataset.c;
  if (!id || !c) return;
  go(href(id, c), false);
}
document.addEventListener('click', e => { const q = e.target.closest && e.target.closest('.pubpill'); if (!q) return; e.preventDefault(); e.stopPropagation(); pubJoin(q); }, true);
document.addEventListener('keydown', e => { const q = e.target.closest && e.target.closest('.pubpill'); if (!q || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault(); e.stopPropagation(); pubJoin(q); }, true);
(() => {
  if (window.MutationObserver) {
    PUB.mo = new MutationObserver(() => { if (PUB.q) return; PUB.q = requestAnimationFrame(() => { PUB.q = 0; cardPills(); }); });
    ['grid', 'rail', 'favrail', 'gotd', 'shelves', 'more'].forEach(id => { const n = document.getElementById(id); if (n) PUB.mo.observe(n, { childList: true }); });
    const sl = document.getElementById('slist'); if (sl) new MutationObserver(() => document.querySelectorAll('#slist .srow').forEach(r => r.classList.toggle('haspub', !!(PUB.list[r.dataset.id] || []).length))).observe(sl, { childList: true });
  }
  const st = () => setTimeout(pubStart, 2500);
  if (document.readyState === 'complete') st(); else addEventListener('load', st, { once: true });
})();
