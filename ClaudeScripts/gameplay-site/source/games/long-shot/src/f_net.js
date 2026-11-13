const LS_NK = 'gameplay:long-shot:kind';
function lsNetHook(G) {
  if (G.netHooked) return;
  G.netHooked = true;
  const net = G.api.net;
  net.on('data', (m, from) => { if (G.alive) lsNetData(G, m, from); });
  net.on('leave', p => { if (G.H && p) lsHostGone(G, p.id); });
  net.on('rejoin', p => { if (G.H && p) lsHostSnap(G, p.id); });
  net.on('lobby', () => { if (G.online && G.role === 'guest') lsOnline(G, G.netKind || 'room'); });
  net.on('close', reason => {
    if (!G.online) return;
    G.ntok++; G.online = false; G.H = null; G.C = null; G.role = null;
    G.$q.hidden = true; lsHud(G, false);
    const hd = reason === 'kicked' ? T('You were removed') : reason === 'host-left' ? T('The host left') : T('Connection lost');
    G.rerender = null;
    lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Online'))}</div><h2>${lsEsc(hd)}</h2><p>${lsEsc(T('The match has ended.'))}</p><button class="ls-btn vio" type="button" data-act="room" data-focus>${lsEsc(T('Live room'))}</button><button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Menu'))}</button></div>`, { key: 'gone' });
  });
}
function lsSend(G, m) {
  if (G.role !== 'host') return;
  try { G.api.net.send(m); } catch (e) {}
  lsClient(G, m);
}
function lsSendTo(G, id, m) {
  if (id === G.me) { lsClient(G, m); return; }
  try { G.api.net.sendTo(id, m); } catch (e) {}
}
async function lsOnline(G, kind) {
  lsNetHook(G);
  const tok = ++G.ntok;
  G.R = null; G.online = true; G.role = null; G.H = null; G.C = null; G.netKind = kind;
  try { sessionStorage.setItem(LS_NK, kind); } catch (e) {}
  G.$q.hidden = true; lsHud(G, false); lsHidePane(G);
  G.scene.set(0, false);
  const o = kind === 'duel' ? { sizes: [2], defaultSize: 2, min: 2, bots: false } : { sizes: [2, 3, 4, 6, 8, 10, 12, 16, 24, 32, 40], defaultSize: 8, min: 2, bots: true };
  let r = null;
  try { r = await G.api.net.room(o); } catch (e) { r = null; }
  if (!G.alive || tok !== G.ntok) return;
  if (!r) { G.online = false; return lsMenu(G); }
  G.role = r.role; G.me = r.id;
  if (r.role === 'host') lsHostStart(G, r, kind);
  else {
    G.rerender = () => lsWaitPane(G);
    lsWaitPane(G);
    const ask = n => G.api.timeout(() => {
      if (tok !== G.ntok || G.role !== 'guest' || G.C) return;
      try { G.api.net.send({ t: 'hi', r: G.sv.rating }); } catch (e) {}
      if (n < 25) ask(n + 1);
    }, n ? 2500 : 300);
    ask(0);
  }
}
function lsWaitPane(G) {
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Online'))}</div><h2>${lsEsc(T('Connected'))}</h2><p>${lsEsc(T('Waiting for the host to start…'))}</p><button class="ls-btn ghost" type="button" data-act="leave">${lsEsc(T('Leave'))}</button></div>`, { key: 'wait' });
}
function lsHostStart(G, r, kind) {
  const duel = kind === 'duel' && r.players.length === 2 && !r.bots;
  const n = duel ? LS_N : G.sv.room.n, secs = duel ? LS_DUEL_SECS : G.sv.room.s;
  const pl = r.players.map(p => ({ id: p.id, name: p.name, bot: false, tot: 0, ms: 0, res: [], gone: false, lk: false, cur: null, r: p.id === r.id ? G.sv.rating : (G.hiR && G.hiR[p.id]) || 1000 }));
  if (r.bots && !duel) for (let i = pl.length; i < r.size; i++) pl.push({ id: 'b' + i, name: 'Bot ' + LS_BOTN[(i * 7) % LS_BOTN.length], bot: true, lvl: G.sv.room.b, tot: 0, ms: 0, res: [], gone: false, lk: false, cur: null, r: LS_BOTS[G.sv.room.b].r });
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  const ids = lsRandomPrompts(n, seed, { solo: false });
  G.H = { m: duel ? 'duel' : 'room', n, secs, ids, i: -1, pl, phase: 'start', at: Date.now() + 2200, dl: 0, qAt: 0, rng: lsRng(seed ^ 0x5bd1e995), go: null };
  const Ps = ids.map(id => lsPrompt(id)).filter(Boolean);
  lsFetchStats(Ps.slice(0, 10)).then(() => lsFetchStats(Ps.slice(10)));
  G.H.go = { t: 'go', m: G.H.m, n, secs, pl: pl.map(p => ({ id: p.id, name: p.name, bot: p.bot })) };
  lsSend(G, G.H.go);
}
function lsHostTick(G) {
  const H = G.H;
  if (!H || G.role !== 'host') return;
  const now = Date.now();
  if (H.phase === 'start') { if (now >= H.at) lsHostQ(G); return; }
  if (H.phase === 'q') {
    const el = now - H.qAt;
    H.pl.forEach(p => { if (p.bot && !p.lk && p.row !== undefined && el >= p.botAt) { if (p.row) lsHostLock(G, p, p.row, Math.round(p.botAt - 800)); else p.lk = true; } });
    if (now >= H.dl + 700 || H.pl.every(p => p.gone || p.lk)) lsHostReveal(G);
    return;
  }
  if (H.phase === 'rv' && now >= H.at) { if (H.i + 1 >= H.n) lsHostEnd(G); else lsHostQ(G); }
}
function lsHostQ(G) {
  const H = G.H, now = Date.now();
  H.i++; H.phase = 'q'; H.qAt = now; H.dl = now + 800 + H.secs * 1000;
  const P = lsPrompt(H.ids[H.i], 'en');
  H.P = P;
  H.pl.forEach(p => {
    p.lk = false; p.cur = null;
    if (p.bot) { p.row = lsBotPick(P, p.lvl, H.rng); p.botAt = 800 + lsBotTime(p.lvl, H.secs, H.rng) * 1000; if (p.botAt > 800 + H.secs * 1000 - 300) p.row = null; }
  });
  lsSend(G, { t: 'q', i: H.i, n: H.n, p: H.ids[H.i], left: H.dl - now, secs: H.secs });
}
function lsHostLock(G, p, row, ms) {
  const H = G.H, P = H.P, sh = lsShare(P, row, lsLiveOf(P, row)), t = lsTier(sh), pts = LS_TIERS[t].p;
  p.lk = true; p.cur = { k: row.k, t, sh, pts, ms: Math.max(0, ms) };
  if (!p.bot) lsSendTo(G, p.id, { t: 'ok', i: H.i, k: row.k, tier: t, sh: Math.round(sh * 1e6), pts });
  lsSend(G, { t: 'lk', i: H.i, ids: H.pl.filter(x => x.lk && !x.gone).map(x => x.id) });
}
function lsHostAnswer(G, from, m) {
  const H = G.H;
  if (!H || H.phase !== 'q' || m.i !== H.i) return;
  const p = H.pl.find(x => x.id === from && !x.bot);
  if (!p || p.lk || p.gone) return;
  const now = Date.now();
  if (now > H.dl + 700) return;
  const r = lsMatch(H.P, String(m.s || '').slice(0, 48));
  if (!r.ok) { lsSendTo(G, from, { t: 'no', i: H.i, why: r.why }); return; }
  lsHostLock(G, p, r.row, now - H.qAt - 800);
}
function lsHostReveal(G) {
  const H = G.H;
  H.phase = 'rv'; H.at = Date.now() + (H.m === 'duel' ? 4200 : 5600);
  H.pl.forEach(p => { const c = p.cur; p.res[H.i] = c; if (c) { p.tot += c.pts; p.ms += c.ms; } });
  lsSend(G, { t: 'rv', i: H.i, p: H.ids[H.i], res: H.pl.map(p => { const c = p.cur; return [p.id, c ? c.k : '', c ? c.t : -1, c ? Math.round(c.sh * 1e6) : 0, c ? c.pts : 0, p.tot, c ? c.ms : 0]; }) });
}
function lsHostEnd(G) {
  const H = G.H;
  H.phase = 'end';
  const rank = H.pl.slice().sort((a, b) => b.tot - a.tot || a.ms - b.ms).map(p => [p.id, p.name, p.tot, p.ms, p.bot ? 1 : 0, p.r, p.gone ? 1 : 0]);
  lsSend(G, { t: 'end', m: H.m, rank, ids: H.ids });
}
function lsHostGone(G, id) {
  const H = G.H, p = H && H.pl.find(x => x.id === id);
  if (!p || p.bot) return;
  p.gone = true;
  if (H.phase !== 'end') G.api.toast(T('{name} left the match', { name: p.name }));
}
function lsHostSnap(G, id) {
  const H = G.H;
  if (!H || !H.go) return;
  const p = H.pl.find(x => x.id === id);
  if (!p) return;
  p.gone = false;
  const now = Date.now();
  const s = { t: 'snap', go: H.go, i: H.i, phase: H.phase, p: H.ids[H.i] || '', left: H.phase === 'q' ? Math.max(0, H.dl - now) : 0, tot: H.pl.map(x => [x.id, x.tot]), lk: H.pl.filter(x => x.lk).map(x => x.id), mine: p.res.map(c => c ? [c.k, c.t, Math.round(c.sh * 1e6), c.pts, c.ms] : null), cur: p.cur ? [p.cur.k, p.cur.t, Math.round(p.cur.sh * 1e6), p.cur.pts] : null };
  lsSendTo(G, id, s);
}
function lsNetData(G, m, from) {
  if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
  if (G.role === 'host') {
    if (m.t === 'a') lsHostAnswer(G, from, m);
    else if (m.t === 'pass') lsHostPass(G, from, m);
    else if (m.t === 'hi') {
      G.hiR = G.hiR || {};
      G.hiR[from] = Math.max(100, Math.min(4000, Math.round(+m.r) || 1000));
      const H = G.H, p = H && H.pl.find(x => x.id === from);
      if (p) p.r = G.hiR[from];
      if (H && H.go) lsHostSnap(G, from);
    }
    return;
  }
  lsClient(G, m);
}
function lsCBegin(G, go) {
  const pl = Array.isArray(go.pl) ? go.pl.slice(0, 48).filter(p => p && typeof p.id === 'string').map(p => ({ id: p.id.slice(0, 20), name: String(p.name || 'Player').replace(/[<>&"']/g, '').slice(0, 20), bot: !!p.bot, tot: 0 })) : [];
  const n = Math.max(1, Math.min(20, Math.round(+go.n) || LS_N)), secs = Math.max(5, Math.min(60, Math.round(+go.secs) || LS_SECS));
  G.C = { m: go.m === 'duel' ? 'duel' : 'room', n, secs, pl, i: -1, P: null, dl: 0, lk: new Set(), me: false, wait: false, res: [], pts: 0, phase: 'start' };
  G.R = { mode: G.C.m === 'duel' ? 'duel' : 'room', n, secs, i: 0, pts: 0, tiers: [], phase: 'start', lives: 3 };
  G.rerender = null;
  lsHidePane(G);
  G.scene.set(0, true);
  lsHud(G, true);
  G.$q.hidden = true;
  lsPopText(G, T('Get ready…'));
}
function lsPopText(G, txt) {
  const p = G.$pop, S = G.scene;
  p.style.left = (S.W / 2) + 'px'; p.style.top = (S.H * .4) + 'px';
  p.innerHTML = `<b style="color:#ffd28a">${lsEsc(txt)}</b>`;
  p.classList.remove('go'); void p.offsetWidth; p.classList.add('go');
}
function lsClient(G, m) {
  if (m.t === 'go') { lsCBegin(G, m); return; }
  if (m.t === 'snap') {
    if (!m.go) return;
    lsCBegin(G, m.go);
    const C = G.C;
    (Array.isArray(m.tot) ? m.tot : []).forEach(([id, t]) => { const p = C.pl.find(x => x.id === id); if (p) p.tot = Math.max(0, +t || 0); });
    (Array.isArray(m.mine) ? m.mine : []).forEach((c, i) => { if (c && Array.isArray(c)) { C.res[i] = { k: String(c[0]), t: Math.max(0, Math.min(5, +c[1] || 0)), sh: (+c[2] || 0) / 1e6, pts: +c[3] || 0, ms: +c[4] || 0 }; G.R.tiers[i] = C.res[i].t; C.pts += C.res[i].pts; } else { C.res[i] = null; G.R.tiers[i] = -1; } });
    G.R.pts = C.pts; G.scene.set(C.pts, true);
    if (m.phase === 'q' && m.p) {
      lsClient(G, { t: 'q', i: m.i, n: C.n, p: m.p, left: m.left, secs: C.secs });
      (Array.isArray(m.lk) ? m.lk : []).forEach(id => C.lk.add(id));
      if (Array.isArray(m.cur)) lsClient(G, { t: 'ok', i: m.i, k: m.cur[0], tier: m.cur[1], sh: m.cur[2], pts: m.cur[3] });
      lsLockRow(G);
    }
    lsHud(G, true);
    return;
  }
  const C = G.C;
  if (!C) return;
  if (m.t === 'q') {
    const P = lsPrompt(String(m.p || ''));
    if (!P) return;
    C.i = Math.max(0, Math.min(C.n - 1, Math.round(+m.i) || 0)); C.P = P; C.me = false; C.wait = false; C.timedOut = false; C.phase = 'q'; C.lk = new Set();
    const rtt = G.role === 'host' ? 0 : (+G.api.net.rtt || 0);
    C.dl = performance.now() + Math.max(0, (+m.left || 0) - rtt / 2);
    C.secs = Math.max(5, Math.min(60, Math.round(+m.secs) || C.secs));
    G.R.i = C.i; G.R.phase = 'ask';
    lsHidePane(G);
    lsShowQ(G, P, C.i, C.n, C.secs);
    lsLockRow(G);
    lsHud(G, true);
    return;
  }
  if (m.t === 'lk') { if (+m.i === C.i && Array.isArray(m.ids)) { C.lk = new Set(m.ids.filter(x => typeof x === 'string')); lsLockRow(G); } return; }
  if (m.t === 'no') { if (+m.i === C.i && C.wait) { C.wait = false; G.$res.hidden = true; G.$pass.hidden = false; G.$in.classList.remove('locked'); G.$in.placeholder = T('Type your answer…'); lsFeedback(G, 'host'); } return; }
  if (m.t === 'ok') {
    if (+m.i !== C.i) return;
    const P = C.P, r = P && P.set.bySlug.get(String(m.k || ''));
    if (!r) return;
    const t = Math.max(0, Math.min(5, Math.round(+m.tier) || 0)), sh = Math.max(0, Math.min(1, (+m.sh || 0) / 1e6)), pts = LS_TIERS[t].p, before = C.pts;
    C.me = true; C.wait = false;
    if (!C.res[C.i]) { C.res[C.i] = { k: r.k, t, sh, pts }; C.pts += pts; }
    G.R.pts = C.pts; G.R.tiers[C.i] = t;
    lsResCard(G, P, r, t, sh, pts);
    G.scene.boost(t); G.scene.set(C.pts);
    G.snd.tier(t); G.snd.burn(t);
    lsPopup(G, t, pts); lsMilestone(G, before, C.pts);
    G.sv.tiers[t]++; lsSave(G);
    lsRecord(P, r);
    lsHud(G, true);
    return;
  }
  if (m.t === 'rv') {
    if (+m.i !== C.i || !C.P) return;
    C.phase = 'rv'; G.R.phase = 'show';
    const P = C.P, rows = Array.isArray(m.res) ? m.res : [];
    rows.forEach(x => { if (!Array.isArray(x)) return; const p = C.pl.find(q => q.id === x[0]); if (p) { p.tot = Math.max(0, +x[5] || 0); p.last = { k: String(x[1] || ''), t: Math.round(+x[2]), sh: (+x[3] || 0) / 1e6, pts: +x[4] || 0, ms: +x[6] || 0 }; p.hist = p.hist || []; p.hist[C.i] = p.last.k ? p.last : null; } });
    if (!C.res[C.i]) { C.res[C.i] = null; G.R.tiers[C.i] = -1; if (!C.me) { lsResCard(G, P, null, -1, 0, 0, { why: 'time' }); G.snd.miss(); } }
    lsHud(G, true);
    const list = C.pl.slice().sort((a, b) => (b.last ? b.last.pts : 0) - (a.last ? a.last.pts : 0) || (a.last ? a.last.ms : 9e9) - (b.last ? b.last.ms : 9e9));
    const html = list.map((p, i) => { const x = p.last, r = x && x.k ? P.set.bySlug.get(x.k) : null; return `<div class="ls-pl${p.id === G.me ? ' me' : ''}" style="animation-delay:${Math.min(i, 12) * .06}s">${lsAv(p.name, C.pl.indexOf(p))}<div class="nm"><b>${lsEsc(p.name)}</b><span>${r ? lsEsc(lsName(P, r)) : lsEsc(T('No answer'))}</span></div>${r ? lsTierPill(x.t) : lsTierPill(-1)}<div class="pt">+${r ? x.pts : 0}</div><div class="tot">${lsFmt(p.tot)}</div></div>`; }).join('');
    G.$lk.hidden = true; G.$pass.hidden = true;
    G.$in.placeholder = T('Next prompt coming up…');
    if (!G.port) G.$q.hidden = true;
    lsPane(G, `<div class="ls-rv${!G.port && list.length > 7 ? ' two' : ''}"><div class="ls-rvq">${lsEsc(T('Prompt {i} of {n}', { i: C.i + 1, n: C.n }))}</div><div class="ls-rvt">${lsEsc(lsPromptText(P))}</div><div class="ls-list">${html}</div></div>`, { clear: true, low: G.port, key: 'rv', keep: true });
    return;
  }
  if (m.t === 'end') {
    C.phase = 'end'; G.R.phase = 'end';
    G.$q.hidden = true;
    const rank = (Array.isArray(m.rank) ? m.rank : []).filter(x => Array.isArray(x)).slice(0, 48);
    const ids = Array.isArray(m.ids) ? m.ids.filter(x => typeof x === 'string').slice(0, 20) : [];
    const myIx = rank.findIndex(x => x[0] === G.me);
    if (C.m === 'duel' && rank.length === 2 && myIx >= 0) {
      const me = rank[myIx], op = rank[1 - myIx], res = me[2] > op[2] ? 1 : me[2] < op[2] ? 0 : me[3] < op[3] ? 1 : me[3] > op[3] ? 0 : .5;
      const dr = lsElo(G.sv.rating, Math.max(100, Math.min(4000, +op[5] || 1000)), res, 32);
      G.sv.rating = Math.max(100, G.sv.rating + dr);
      if (res === 1) G.sv.duel.w++; else if (res === 0) G.sv.duel.l++; else G.sv.duel.d++;
      lsSave(G);
      if (res === 1) G.snd.win(); else G.snd.lose();
      const opP = C.pl.find(p => p.id === op[0]);
      lsDuelResults(G, { me: me[2], op: op[2], res, dr, opName: String(op[1] || 'Player'), myRes: C.res, opRes: (opP && opP.hist) || [], ids, again: G.role === 'host' ? 'online' : '', online: true });
      if (G.role !== 'host') G.$pane.querySelector('.ls-box').insertAdjacentHTML('beforeend', `<p class="ls-note">${lsEsc(T('Waiting for the host…'))}</p>`);
      return;
    }
    G.sv.rooms.p++;
    if (myIx === 0) G.sv.rooms.w++;
    lsSave(G);
    if (myIx === 0) G.snd.win(); else G.snd.fanfare();
    lsRoomResults(G, rank, ids);
  }
}
function lsRoomResults(G, rank, ids) {
  const C = G.C;
  G.rerender = () => lsRoomResults(G, rank, ids);
  const rows = rank.map((x, i) => `<div class="ls-pl${x[0] === G.me ? ' me' : ''}" style="animation-delay:${Math.min(i, 12) * .07}s"><span class="av" style="background:${i === 0 ? '#ffd447' : i === 1 ? '#c9d3e6' : i === 2 ? '#e0a060' : 'rgba(255,255,255,.14)'};color:#0b1130">${i + 1}</span><div class="nm"><b>${lsEsc(x[1])}</b><span>${lsEsc(lsKm(+x[2] || 0))}${x[6] ? ' · ' + lsEsc(T('Left')) : ''}</span></div><span></span><div class="pt"></div><div class="tot">${lsFmt(+x[2] || 0)}</div></div>`).join('');
  const items = ids.map((id, i) => { const c = C && C.res[i]; return c ? { id, k: c.k, pts: c.pts, t: c.t, sh: c.sh } : { id, k: '', pts: 0, t: -1 }; });
  const myIx = rank.findIndex(x => x[0] === G.me);
  lsPane(G, `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Live room'))}</div><h2>${lsEsc(myIx === 0 ? T('You win!') : myIx > 0 ? T('You finished #{n}', { n: myIx + 1 }) : T('Final standings'))}</h2>
<div style="text-align:left;margin-top:10px">${rows}</div>
${lsSheet(G, items)}
${G.role === 'host' ? `<button class="ls-btn hot" type="button" data-act="again" data-focus>${lsEsc(T('Back to lobby'))}</button>` : `<p class="ls-note">${lsEsc(T('Waiting for the host…'))}</p>`}
<button class="ls-btn ghost" type="button" data-act="leave">${lsEsc(T('Leave'))}</button>${lsLiveNote()}</div>`, { key: 'roomend' });
}
function lsLockRow(G) {
  const C = G.C;
  if (!C || C.phase !== 'q') return;
  G.$lk.hidden = false;
  const others = C.pl.filter(p => p.id !== G.me);
  if (C.m === 'duel' && others[0]) { const o = others[0]; G.$lk.innerHTML = `<span class="ls-opp">${lsAv(o.name, 1)}<span>${lsEsc(C.lk.has(o.id) ? T('Locked in') : T('Thinking…'))}</span></span>`; return; }
  const n = C.pl.length, k = C.pl.filter(p => C.lk.has(p.id)).length;
  G.$lk.innerHTML = (n <= 10 ? C.pl.map((p, i) => `<i class="${C.lk.has(p.id) ? 'ok' : ''}" title="${lsEsc(p.name)}">${lsEsc(p.name.replace(/^Bot\s+/, '').slice(0, 1).toUpperCase())}</i>`).join('') : '') + `<span>${lsEsc(T('{k} of {n} locked in', { k, n }))}</span>`;
}
function lsNetTick(G) {
  const C = G.C;
  if (!C || C.phase !== 'q') return;
  const left = (C.dl - performance.now()) / 1000;
  lsTimerUI(G, Math.max(0, left), C.secs);
  if (left <= 0 && !C.me && !C.wait && !C.timedOut) {
    C.timedOut = true;
    if (G.$in.value.trim()) lsNetSubmit(G, true);
    if (!C.wait) { G.$fb.textContent = T('Time’s up!'); G.$fb.className = 'ls-fb bad'; }
  }
}
function lsNetSubmit(G, auto) {
  const C = G.C;
  if (!C || C.phase !== 'q' || C.me || C.wait) return;
  if (!auto && C.timedOut) return;
  const txt = G.$in.value.trim(), m = lsMatch(C.P, txt);
  if (!m.ok) { if (!auto) lsFeedback(G, m.why); return; }
  C.wait = true;
  G.$in.value = ''; G.$in.classList.add('locked');
  lsResCard(G, C.P, m.row, null);
  G.snd.lock();
  if (G.role === 'host') lsHostAnswer(G, G.me, { t: 'a', i: C.i, s: txt });
  else { try { G.api.net.send({ t: 'a', i: C.i, s: txt.slice(0, 48) }); } catch (e) {} }
}
function lsNetPass(G) {
  const C = G.C;
  if (!C || C.phase !== 'q' || C.me || C.wait) return;
  C.timedOut = true; C.me = true;
  G.$in.value = '';
  lsResCard(G, C.P, null, -1, 0, 0, { why: 'pass' });
  G.snd.pass();
  if (G.role === 'host') lsHostPass(G, G.me, { i: C.i });
  else { try { G.api.net.send({ t: 'pass', i: C.i }); } catch (e) {} }
}
function lsHostPass(G, from, m) {
  const H = G.H;
  if (!H || H.phase !== 'q' || +m.i !== H.i) return;
  const p = H.pl.find(x => x.id === from && !x.bot);
  if (!p || p.lk) return;
  p.lk = true; p.cur = null;
  lsSend(G, { t: 'lk', i: H.i, ids: H.pl.filter(x => x.lk && !x.gone).map(x => x.id) });
}
