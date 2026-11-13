const LS_LIVE = { st: 'unknown', stats: new Map(), seen: new Map() };
const lsSrvKey = P => P.multi ? P.id + '.' + P.vl : P.id;
function lsBridge() { const a = window.Ameplay && Ameplay.account; return a && typeof a.rpc === 'function' && a.signedIn ? a : null; }
function lsRpc(fn, args) {
  const a = lsBridge();
  if (!a || LS_LIVE.st === 'off') return Promise.resolve(null);
  let p;
  try { p = Promise.resolve(a.rpc(fn, args)); } catch (e) { p = Promise.reject(e); }
  return p.then(r => r, e => {
    const m = String(e && e.message || '');
    if (e && (e.status === 404 || e.code === 'PGRST202' || e.code === '42883' || /could not find the function|does not exist/i.test(m))) LS_LIVE.st = 'off';
    return null;
  });
}
const lsNum = v => typeof v === 'number' && isFinite(v) && v >= 0 ? Math.floor(v) : -1;
function lsRecord(P, r) {
  const key = lsSrvKey(P) + '|' + r.k;
  if (LS_LIVE.seen.has(key)) return Promise.resolve(LS_LIVE.seen.get(key));
  return lsRpc('long_shot_answer', { p_prompt: lsSrvKey(P), p_answer: r.k }).then(x => {
    if (!x || typeof x !== 'object') return null;
    const n = lsNum(x.n), t = lsNum(x.t);
    if (n < 0 || t < 1 || n > t) return null;
    LS_LIVE.st = 'live';
    const v = { n, t };
    LS_LIVE.seen.set(key, v);
    return v;
  });
}
function lsFetchStats(Ps) {
  const want = Ps.filter(P => !LS_LIVE.stats.has(lsSrvKey(P))).map(lsSrvKey).slice(0, 10);
  if (!want.length) return Promise.resolve(true);
  return lsRpc('long_shot_stats', { p_prompts: want }).then(x => {
    if (!Array.isArray(x)) return false;
    x.slice(0, 10).forEach(o => {
      if (!o || typeof o.p !== 'string' || !want.includes(o.p)) return;
      const t = lsNum(o.t), a = Array.isArray(o.a) ? o.a.filter(e => Array.isArray(e) && typeof e[0] === 'string' && lsNum(e[1]) > 0).slice(0, 40).map(e => [e[0], lsNum(e[1])]) : [];
      if (t >= 0) LS_LIVE.stats.set(o.p, { t, a, m: new Map(a) });
    });
    LS_LIVE.st = 'live';
    return true;
  });
}
function lsLiveOf(P, r) {
  const s = LS_LIVE.stats.get(lsSrvKey(P));
  if (s && s.t > 0) return { n: s.m.get(r.k) || 0, t: s.t };
  return null;
}
function lsTop(P, n) {
  const s = LS_LIVE.stats.get(lsSrvKey(P));
  if (s && s.t >= LS_K) {
    const out = [];
    s.a.forEach(([k, c]) => { const r = P.set.bySlug.get(k); if (r && P.rows.includes(r) && out.length < n) out.push([r, lsShare(P, r, { n: c, t: s.t })]); });
    if (out.length >= Math.min(n, 2)) return out;
  }
  return P.sorted.slice(0, n).map(r => [r, lsShare(P, r, lsLiveOf(P, r))]);
}
const LS_BOTS = [
  { n: 'Easy', miss: .3, pow: 1.15, t0: 6, t1: 18, r: 800 },
  { n: 'Medium', miss: .15, pow: .7, t0: 4.5, t1: 14, r: 1000 },
  { n: 'Hard', miss: .07, pow: .3, t0: 3.5, t1: 10, r: 1250 },
  { n: 'Hardest', miss: .03, pow: -.3, t0: 2.5, t1: 7.5, r: 1550 }
];
const LS_BOTN = ['Nova', 'Orbit', 'Pulsar', 'Quasar', 'Vega', 'Lyra', 'Atlas', 'Cosmo', 'Halley', 'Kepler', 'Juno', 'Rigel', 'Sirius', 'Titan', 'Zenith'];
function lsBotPick(P, lvl, R) {
  const b = LS_BOTS[lvl] || LS_BOTS[1];
  if (R() < b.miss) return null;
  let sum = 0;
  const w = P.rows.map(r => { const v = Math.pow(lsSeedShare(P, r), b.pow); sum += v; return v; });
  let x = R() * sum;
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) return P.rows[i]; }
  return P.rows[P.rows.length - 1];
}
const lsBotTime = (lvl, secs, R) => { const b = LS_BOTS[lvl] || LS_BOTS[1], f = secs / 25; return (b.t0 + (b.t1 - b.t0) * Math.pow(R(), 1.3)) * f; };
function lsElo(me, opp, res, k) { const e = 1 / (1 + Math.pow(10, (opp - me) / 400)); return Math.round(k * (res - e)); }
const lsDate = d => { try { return new Intl.DateTimeFormat(lsLang(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(LS_D0 + d * 864e5)); } catch (e) { return ''; } };
const lsDur = ms => { const m = Math.max(1, Math.ceil(ms / 6e4)), h = Math.floor(m / 60); return h ? T('{h} h {m} min', { h, m: m % 60 }) : T('{m} min', { m }); };

function lsSave(G) { G.api.save(G.sv); }
function lsHud(G, on) {
  G.$hud.hidden = !on;
  if (!on) return;
  const R = G.R;
  if (!R) return;
  G.$chip.innerHTML = R.mode === 'daily' ? lsEsc(T('Daily #{n}', { n: R.day + 1 })) : R.mode === 'endless' ? lsEsc(T('Endless')) : R.mode === 'room' ? lsEsc(T('Live room')) : lsEsc(T('Duel'));
  if (R.mode === 'endless') G.$dots.innerHTML = [0, 1, 2].map(i => `<span class="fuel${i < R.lives ? '' : ' out'}" title="${lsEsc(T('Fuel'))}"></span>`).join('');
  else {
    const n = R.n;
    let h = '';
    for (let i = 0; i < n; i++) { const t = R.tiers[i]; h += `<span class="${i === R.i && R.phase !== 'end' ? 'on' : ''}" style="${t != null && t >= 0 ? 'background:' + LS_TIERS[t].c + ';border-color:' + LS_TIERS[t].c : t === -1 ? 'background:' + LS_MISS.c : ''}"></span>`; }
    G.$dots.innerHTML = h;
  }
  G.$pts.textContent = T('{n} pts', { n: lsFmt(R.pts) });
  G.$dist.textContent = lsKm(R.pts);
  G.api.score(R.pts);
}
function lsFeedback(G, why) {
  const t = { none: 'Not on our list. Try another answer!', fit: 'That’s real, but it doesn’t fit this prompt.', rude: 'Keep it friendly.', empty: 'Type an answer first.', host: 'Not accepted. Try another answer.' }[why] || '';
  G.$fb.textContent = T(t); G.$fb.className = 'ls-fb bad';
  if (why !== 'empty') { G.$in.classList.remove('shake'); void G.$in.offsetWidth; G.$in.classList.add('shake'); }
  if (why === 'rude') { G.$in.value = ''; G.snd.rude(); } else G.snd.no();
}
function lsShowQ(G, P, idx, n, secs) {
  G.$q.hidden = false;
  G.$q.classList.remove('in'); void G.$q.offsetWidth; G.$q.classList.add('in');
  G.$qk.textContent = n ? T('Prompt {i} of {n}', { i: idx + 1, n }) : T('Prompt {i}', { i: idx + 1 });
  G.$qt.textContent = lsPromptText(P);
  G.$res.hidden = true; G.$res.innerHTML = '';
  G.$form.hidden = false; G.$in.value = ''; G.$in.classList.remove('locked', 'shake'); G.$in.placeholder = T('Type your answer…');
  G.$fb.textContent = ''; G.$fb.className = 'ls-fb';
  G.$pass.hidden = false; G.$lk.hidden = true;
  G.$bar.style.transform = 'scaleX(1)'; G.$tm.classList.remove('low', 'done'); G.$secs.classList.remove('low'); G.$secs.textContent = String(secs);
  G.lastSec = secs;
  if (G.$pane.hidden || G.paneKey === 'rv') G.$in.focus({ preventScroll: true });
}
function lsTimerUI(G, left, secs) {
  const f = Math.max(0, Math.min(1, left / secs));
  G.$bar.style.transform = 'scaleX(' + f.toFixed(4) + ')';
  const s = Math.max(0, Math.ceil(left - 1e-6));
  if (s !== G.lastSec) {
    G.lastSec = s; G.$secs.textContent = String(s);
    const low = s <= 5;
    G.$tm.classList.toggle('low', low); G.$secs.classList.toggle('low', low);
    if (low && s > 0) G.snd.tick(s <= 3);
  }
}
function lsResCard(G, P, r, t, sh, pts, opt) {
  const o = opt || {};
  G.$pass.hidden = true;
  G.$in.value = ''; G.$in.classList.add('locked');
  G.$in.placeholder = G.port ? T('Locked in') : G.online || (G.R && G.R.bot) ? T('Locked in. Waiting for the others…') : T('Locked in. Press Enter to continue.');
  G.$tm.classList.add('done');
  G.$res.hidden = false;
  G.$res.className = 'ls-res' + (r ? '' : ' miss');
  if (!r) { G.$res.innerHTML = `<div class="nm">${lsEsc(T(o.why === 'pass' ? 'Passed' : 'Nothing landed'))}</div>${lsTierPill(-1)}<div class="pt">+0</div>`; return; }
  G.$res.innerHTML = `<div class="nm">${lsEsc(lsName(P, r))}</div>${t == null ? `<span class="ls-tier scan">${lsEsc(T('Measuring…'))}</span>` : lsTierPill(t, sh)}<div class="pt">${t == null ? '' : '+' + pts}</div>`;
}
function lsPopup(G, t, pts) {
  const p = G.$pop, S = G.scene;
  p.style.left = (S.px() + (S.port ? 120 : 190)) + 'px'; p.style.top = (S.py() + (S.port ? 70 : 10)) + 'px';
  p.innerHTML = t >= 0 ? `<b style="color:${LS_TIERS[t].c}">${lsEsc(T(LS_TIERS[t].n))}</b><span>+${pts}</span>` : `<b style="color:#ff9b9b">${lsEsc(T('Nothing landed'))}</b><span>+0</span>`;
  p.classList.remove('go'); void p.offsetWidth; p.classList.add('go');
}
function lsMilestone(G, before, after) {
  const a = lsZone(before).last, b = lsZone(after).last;
  if (a !== b && b.au > 1) { G.snd.milestone(); G.api.toast(T('Past {name}', { name: T(b.n) })); }
}

function lsStartRound(G, o) {
  lsHidePane(G);
  const R = { mode: o.mode, ids: o.ids.slice(), n: o.mode === 'endless' ? 0 : o.ids.length, secs: o.secs, day: o.day || 0, i: o.start || 0, phase: 'idle', left: 0, grace: 0, pts: 0, res: [], tiers: [], lives: 3, tok: 0, lvl: o.lvl || 0, bot: o.mode === 'bot' ? { name: 'Bot ' + LS_BOTN[(o.lvl * 3 + Math.floor(Date.now() / 1024)) % LS_BOTN.length], pts: 0, res: [], at: 0, done: false } : null, rng: lsRng(o.seed || (Date.now() >>> 0)), wait: 0, P: null, me: false, botDone: false };
  if (R.mode === 'daily') {
    const d = G.sv.days[R.day];
    if (d) d.a.forEach((x, i) => { R.res[i] = { k: x[0], pts: x[1], t: x[2], ms: x[3], sh: x[4] }; R.tiers[i] = x[2]; R.pts += x[1]; });
  }
  G.R = R;
  G.mode = R.mode;
  G.scene.best = R.mode === 'endless' ? G.sv.endless : R.mode === 'daily' ? G.sv.best : 0;
  G.scene.pmax = R.mode === 'endless' ? 2500 : 130;
  G.scene.set(R.pts, true);
  const pre = R.ids.slice(R.i, R.i + 10).map(id => lsPrompt(id)).filter(Boolean);
  lsFetchStats(pre);
  lsNextQ(G);
}
function lsNextQ(G) {
  const R = G.R;
  if (!R) return;
  if (R.mode === 'endless' && R.i >= R.ids.length) R.ids = R.ids.concat(lsRandomPrompts(30, R.rng() * 4294967296, { avoid: R.ids.slice(-60) }));
  if (R.mode !== 'endless' && R.i >= R.n) return lsEndRound(G);
  const P = lsPrompt(R.ids[R.i]);
  if (!P) { R.i++; return lsNextQ(G); }
  R.P = P; R.phase = 'ask'; R.left = R.secs; R.grace = .8; R.me = false; R.tok++; R.t0 = performance.now(); R.used = 0;
  if (R.bot) { R.bot.row = lsBotPick(P, R.lvl, R.rng); R.bot.at = lsBotTime(R.lvl, R.secs, R.rng); R.bot.done = false; if (R.bot.at > R.secs - .3) R.bot.row = null; }
  if (R.mode === 'daily') {
    const d = G.sv.days[R.day] || (G.sv.days[R.day] = { a: [], p: R.ids.slice(), done: false, at: Date.now() });
    if (d.a.length <= R.i) { d.a[R.i] = ['', 0, -1, 0, 0, 0]; lsSave(G); }
  }
  lsShowQ(G, P, R.i, R.n, R.secs);
  if (R.bot) { G.$lk.hidden = false; G.$lk.innerHTML = `<span class="ls-opp">${lsAv(R.bot.name, 1)}<span data-opp>${lsEsc(T('Thinking…'))}</span></span>`; }
  lsHud(G, true);
}
function lsTick(G, dt) {
  const R = G.R;
  if (!R || G.online) return;
  if (R.phase === 'ask') {
    if (R.grace > 0) R.grace -= dt; else R.left -= dt;
    R.used += dt;
    if (R.bot && !R.bot.done && R.used >= R.bot.at) lsBotLock(G);
    if (R.left <= 0) { R.left = 0; lsTimeUp(G); }
    else lsTimerUI(G, R.left, R.secs);
  } else if (R.phase === 'wait') {
    if (R.left > 0) { R.left -= dt; R.used += dt; }
    if (R.bot && !R.bot.done && R.used >= R.bot.at) lsBotLock(G);
    if (R.left <= 0 && R.bot && !R.bot.done) { R.bot.done = true; R.bot.res[R.i] = null; }
    lsTimerUI(G, Math.max(0, R.left), R.secs);
    if (R.fin && (!R.bot || R.bot.done)) lsDuelReveal(G);
  } else if (R.phase === 'lock' || R.phase === 'show') {
    R.wait -= dt;
    if (R.wait <= 0) { R.phase = 'idle'; if (R.over) return lsEndRound(G); R.i++; lsNextQ(G); }
  }
}
function lsBotLock(G) {
  const R = G.R, b = R.bot;
  b.done = true;
  if (b.row) { const sh = lsShare(R.P, b.row, lsLiveOf(R.P, b.row)), t = lsTier(sh); b.res[R.i] = { k: b.row.k, t, sh, pts: LS_TIERS[t].p, ms: Math.round(b.at * 1000) }; b.pts += LS_TIERS[t].p; }
  else b.res[R.i] = null;
  const o = G.$lk.querySelector('[data-opp]');
  if (o) o.textContent = b.row ? T('Locked in') : T('Thinking…');
  if (b.row) G.snd.tap();
}
function lsSubmit(G, auto) {
  const R = G.R;
  if (G.online) return G.onlineSubmit(auto);
  if (!R) return;
  if (R.phase === 'lock' || R.phase === 'show') { if (!auto && R.fin && !R.over) R.wait = Math.min(R.wait, .12); return; }
  if (R.phase !== 'ask' || R.me) return;
  const m = lsMatch(R.P, G.$in.value);
  if (!m.ok) { if (!auto) lsFeedback(G, m.why); return false; }
  lsLock(G, m.row);
  return true;
}
function lsLock(G, r) {
  const R = G.R, P = R.P, tok = R.tok, i = R.i, ms = Math.round(R.used * 1000);
  R.me = true; R.fin = false;
  R.phase = R.bot ? 'wait' : 'lock'; R.wait = 9;
  G.$in.value = ''; G.$in.classList.add('locked');
  lsResCard(G, P, r, null);
  G.snd.lock();
  const t0 = performance.now();
  const done = live => {
    if (!G.alive || G.R !== R || R.tok !== tok) return;
    const sh = lsShare(P, r, live || lsLiveOf(P, r)), t = lsTier(sh), pts = LS_TIERS[t].p, before = R.pts;
    R.res[i] = { k: r.k, t, sh, pts, ms, live: !!live };
    R.tiers[i] = t; R.pts += pts; R.fin = true;
    lsResCard(G, P, r, t, sh, pts);
    G.scene.boost(t); G.scene.set(R.pts);
    G.snd.tier(t); G.snd.burn(t);
    lsPopup(G, t, pts);
    lsMilestone(G, before, R.pts);
    G.sv.tiers[t]++;
    if (R.mode === 'endless' && t === 5 && R.lives < 3) { R.lives++; G.snd.fuel(); G.api.toast(T('Long Shot! +1 fuel')); }
    if (R.mode === 'daily') { const d = G.sv.days[R.day]; if (d) d.a[i] = [r.k, pts, t, ms, Math.round(sh * 1e6) / 1e6, live ? 1 : 0]; }
    lsSave(G);
    lsHud(G, true);
    if (R.phase === 'lock') R.wait = 2.3;
  };
  const req = lsRecord(P, r);
  let fired = false;
  const fire = v => { if (fired) return; fired = true; done(v); };
  req.then(v => { const wt = Math.max(0, 650 - (performance.now() - t0)); setTimeout(() => fire(v), wt); });
  setTimeout(() => fire(null), 1400);
}
function lsTimeUp(G) {
  const R = G.R;
  if (R.me) return;
  if (G.$in.value.trim() && lsSubmit(G, true)) return;
  lsMiss(G, 'time');
}
function lsMiss(G, why) {
  const R = G.R;
  if (!R || R.me || (R.phase !== 'ask')) return;
  R.me = true; R.fin = true;
  R.res[R.i] = null; R.tiers[R.i] = -1;
  lsResCard(G, R.P, null, -1, 0, 0, { why });
  G.$fb.textContent = why === 'time' ? T('Time’s up!') : ''; G.$fb.className = 'ls-fb bad';
  lsPopup(G, -1, 0);
  if (why === 'pass') G.snd.pass(); else G.snd.miss();
  if (R.mode === 'endless') { R.lives--; if (R.lives <= 0) { R.phase = 'show'; R.wait = 1.8; R.over = true; lsHud(G, true); return; } }
  if (R.bot) R.phase = 'wait';
  else { R.phase = 'show'; R.wait = 1.9; }
  lsHud(G, true);
}
function lsDuelReveal(G) {
  const R = G.R;
  if (R.phase === 'show') return;
  R.phase = 'show'; R.wait = 3.4; R.fin = true;
  const P = R.P, me = R.res[R.i], b = R.bot.res[R.i];
  const row = (name, x, cls, i) => `<div class="ls-pl${cls}">${lsAv(name, i)}<div class="nm"><b>${lsEsc(name)}</b><span>${x ? lsEsc(lsName(P, P.set.bySlug.get(x.k))) : lsEsc(T('No answer'))}</span></div>${x ? lsTierPill(x.t) : lsTierPill(-1)}<div class="pt">+${x ? x.pts : 0}</div><div class="tot">${lsFmt(cls ? R.pts : R.bot.pts)}</div></div>`;
  G.$lk.hidden = false;
  G.$lk.innerHTML = `<span class="ls-opp">${lsEsc(R.bot.name)}: ${b ? lsEsc(lsName(P, P.set.bySlug.get(b.k))) + ' · +' + b.pts : lsEsc(T('No answer'))}</span>`;
  G.$in.placeholder = T('Press Enter to continue.');
  lsPane(G, `<div class="ls-rv"><div class="ls-rvq">${lsEsc(T('Prompt {i} of {n}', { i: R.i + 1, n: R.n }))}</div><div class="ls-rvt">${lsEsc(lsPromptText(P))}</div>${row(G.myName(), me, ' me', 0)}${row(R.bot.name, b, '', 1)}</div>`, { clear: true, low: true, key: 'rv', keep: true });
}
function lsEndRound(G) {
  const R = G.R;
  R.phase = 'end';
  G.$q.hidden = true;
  lsHud(G, true);
  if (R.mode === 'daily') {
    const d = G.sv.days[R.day];
    if (d) { d.done = true; d.at = Date.now(); }
    if (R.pts > G.sv.best) G.sv.best = R.pts;
    lsSave(G);
    G.api.submit(R.pts);
    G.snd.fanfare();
    lsDailyResults(G, R.day);
  } else if (R.mode === 'endless') {
    G.sv.eRuns++;
    const nb = R.pts > G.sv.endless;
    if (nb) G.sv.endless = R.pts;
    lsSave(G);
    G.snd.lose();
    lsEndlessResults(G, R, nb);
  } else if (R.mode === 'bot') {
    const me = R.pts, op = R.bot.pts, tm = x => x.reduce((s, v) => s + (v ? v.ms : 0), 0);
    const res = me > op ? 1 : me < op ? 0 : tm(R.res) < tm(R.bot.res) ? 1 : tm(R.res) > tm(R.bot.res) ? 0 : .5;
    const dr = lsElo(G.sv.rating, LS_BOTS[R.lvl].r, res, 24);
    G.sv.rating = Math.max(100, G.sv.rating + dr);
    if (res === 1) G.sv.duel.w++; else if (res === 0) G.sv.duel.l++; else G.sv.duel.d++;
    lsSave(G);
    if (res === 1) G.snd.win(); else G.snd.lose();
    lsDuelResults(G, { me, op, res, dr, opName: R.bot.name, myRes: R.res, opRes: R.bot.res, ids: R.ids, again: 'bot:' + R.lvl });
  }
}
function lsSheet(G, items) {
  return `<div class="ls-sheet">${items.map((x, i) => {
    const P = lsPrompt(x.id);
    if (!P) return '';
    const r = x.k ? P.set.bySlug.get(x.k) : null;
    const extra = x.opp !== undefined ? `<br>${lsEsc(x.oppName)}: <b>${x.opp ? lsEsc(lsName(P, P.set.bySlug.get(x.opp.k))) : lsEsc(T('No answer'))}</b>${x.opp ? ' · ' + x.opp.pts : ''}` : '';
    return `<div class="ls-it"><button type="button" data-act="sheet" data-i="${i}" aria-expanded="false"><span class="n">${i + 1}</span><span><span class="q">${lsEsc(lsPromptText(P))}</span><span class="a${r ? '' : ' miss'}">${r ? lsEsc(lsName(P, r)) : lsEsc(T('No answer'))}</span></span>${r ? lsTierPill(x.t, x.sh) : lsTierPill(-1)}<span class="p">${x.pts}</span></button><div class="x" hidden data-id="${lsEsc(x.id)}"><span data-fill></span>${extra}</div></div>`;
  }).join('')}</div>`;
}
function lsSheetOpen(G, btn) {
  const it = btn.parentElement, x = it.querySelector('.x');
  if (!x) return;
  const open = x.hidden;
  x.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) lsSheetFill(x);
}
function lsSheetFill(x) {
  const f = x.querySelector('[data-fill]'), P = lsPrompt(x.dataset.id);
  if (!f || !P) return;
  const top = lsTop(P, 3).map(([r, sh]) => `<b>${lsEsc(lsName(P, r))}</b> ${lsEsc(lsPct(sh))}`).join(' · ');
  const rare = lsRare(P, 3).map(r => `<em>${lsEsc(lsName(P, r))}</em>`).join(' · ');
  f.innerHTML = `${lsEsc(T('Most said:'))} ${top}<br>${lsEsc(T('Long shots you could have said:'))} ${rare}`;
}
function lsDailyResults(G, day) {
  const d = G.sv.days[day];
  if (!d) return lsMenu(G);
  const pts = lsDayPts(d), z = lsZone(pts), ids = d.p.length ? d.p : lsDaily(day);
  const items = d.a.map((x, i) => ({ id: ids[i], k: x[0], pts: x[1], t: x[2], sh: x[4] }));
  const tiers = d.a.map(x => x[2]);
  G.R = G.R && G.R.mode === 'daily' ? G.R : null;
  lsFetchStats(ids.map(id => lsPrompt(id)).filter(Boolean)).then(ok => { if (ok && G.paneKey === 'daily' && G.alive) G.$pane.querySelectorAll('.ls-it .x:not([hidden])').forEach(lsSheetFill); });
  G.scene.set(pts, false);
  const html = `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Daily launch #{n}', { n: day + 1 }))} · ${lsEsc(lsDate(day))}</div>
<h2>${lsEsc(T('Mission complete'))}</h2>
<div class="ls-big">${lsEsc(lsKm(pts))}</div>
<div class="ls-zone">${lsEsc(z.last.au > 1 ? T('Your probe flew past {name}', { name: T(z.last.n) }) : T('Your probe stayed near Earth'))}</div>
<div class="ls-stats"><div><b>${lsFmt(pts)} / ${LS_N * 100}</b><span>${lsEsc(T('Points'))}</span></div><div><b>${lsStreak(G.sv)}</b><span>${lsEsc(T('Streak'))}</span></div><div><b>${lsFmt(G.sv.best)}</b><span>${lsEsc(T('Best day'))}</span></div></div>
<div class="ls-tl">${tiers.map(t => t >= 0 ? `<span style="background:${LS_TIERS[t].c}">${LS_TIERS[t].p}</span>` : `<span style="background:${LS_MISS.c};color:#fff">0</span>`).join('')}</div>
${lsSheet(G, items)}
<div class="ls-pair"><button class="ls-btn hot" type="button" data-act="share" data-focus>${lsEsc(T('Share card'))}</button><button class="ls-btn blue" type="button" data-act="endless">${lsEsc(T('Endless'))}<small>${lsEsc(T('Keep flying'))}</small></button></div>
<button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Menu'))}</button>
<p class="ls-note">${lsEsc(T('Next launch in {t}', { t: lsDur(lsNextDayMs()) }))}</p>${lsLiveNote()}</div>`;
  G.shareInfo = { day, pts, tiers, mode: 'daily' };
  G.rerender = () => lsDailyResults(G, day);
  lsPane(G, html, { key: 'daily' });
}
function lsEndlessResults(G, R, nb) {
  const items = R.ids.slice(0, R.i + 1).map((id, i) => { const x = R.res[i]; return x ? { id, k: x.k, pts: x.pts, t: x.t, sh: x.sh } : { id, k: '', pts: 0, t: -1 }; });
  const z = lsZone(R.pts);
  G.shareInfo = { pts: R.pts, tiers: items.map(x => x.t), mode: 'endless' };
  G.rerender = () => lsEndlessResults(G, R, nb);
  lsPane(G, `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Endless'))}</div><h2>${lsEsc(T('Out of fuel'))}</h2>
<div class="ls-big">${lsEsc(lsKm(R.pts))}</div><div class="ls-zone">${lsEsc(z.last.au > 1 ? T('Your probe flew past {name}', { name: T(z.last.n) }) : T('Your probe stayed near Earth'))}</div>
<div class="ls-stats"><div><b>${lsFmt(R.pts)}</b><span>${lsEsc(T('Points'))}</span></div><div><b>${items.filter(x => x.k).length}</b><span>${lsEsc(T('Answers landed'))}</span></div><div><b>${lsFmt(G.sv.endless)}</b><span>${lsEsc(nb ? T('New best!') : T('Best'))}</span></div></div>
${lsSheet(G, items)}
<div class="ls-pair"><button class="ls-btn hot" type="button" data-act="endless" data-focus>${lsEsc(T('Fly again'))}</button><button class="ls-btn blue" type="button" data-act="share">${lsEsc(T('Share card'))}</button></div>
<button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Menu'))}</button>${lsLiveNote()}</div>`, { key: 'endless' });
}
function lsDuelResults(G, o) {
  const items = o.ids.map((id, i) => { const x = o.myRes[i]; return Object.assign(x ? { id, k: x.k, pts: x.pts, t: x.t, sh: x.sh } : { id, k: '', pts: 0, t: -1 }, { opp: o.opRes[i] || null, oppName: o.opName }); });
  const title = o.res === 1 ? T('You win!') : o.res === 0 ? T('You lose') : T('Draw');
  G.rerender = () => lsDuelResults(G, o);
  lsPane(G, `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Duel'))} · ${lsEsc(o.opName)}</div><h2>${lsEsc(title)}</h2>
<div class="ls-stats"><div><b>${lsFmt(o.me)}</b><span>${lsEsc(T('You'))}</span></div><div><b>${lsFmt(o.op)}</b><span>${lsEsc(o.opName)}</span></div>${o.dr != null ? `<div><b>${lsFmt(G.sv.rating)} <small style="font-size:14px;color:${o.dr >= 0 ? '#36d6a0' : '#ff9b9b'}">${o.dr >= 0 ? '+' : ''}${o.dr}</small></b><span>${lsEsc(T('Rating'))}</span></div>` : ''}</div>
${lsSheet(G, items)}
${o.again ? `<button class="ls-btn hot" type="button" data-act="${o.again === 'online' ? 'again' : 'duelbot'}" data-v="${o.again.split(':')[1] || ''}" data-focus>${lsEsc(o.again === 'online' ? T('Back to lobby') : T('Rematch'))}</button>` : ''}
<button class="ls-btn ghost" type="button" data-act="${o.online ? 'leave' : 'menu'}">${lsEsc(T('Menu'))}</button>${lsLiveNote()}</div>`, { key: 'duel' });
}
function lsShareText(G, s) {
  const em = s.tiers.map(t => t >= 0 ? LS_TIERS[t].e : LS_MISS.e).join('');
  const head = s.mode === 'daily' ? 'Long Shot #' + (s.day + 1) : 'Long Shot · ' + T('Endless');
  return head + ' · ' + lsKm(s.pts) + '\n' + em + ' ' + lsFmt(s.pts) + (s.mode === 'daily' ? ' / ' + LS_N * 100 : '') + ' ' + T('pts') + '\n' + 'https://gameplaygames.web.app/long-shot';
}
function lsShareCard(G) {
  const s = G.shareInfo;
  if (!s) return;
  const z = lsZone(s.pts);
  const cv = lsCardCanvas({ day: s.day || 0, kicker: s.mode === 'daily' ? T('Daily launch #{n}', { n: s.day + 1 }) + ' · ' + lsDate(s.day) : T('Endless'), sub: T('Name the answer nobody else thinks of'), pts: s.pts, dist: lsKm(s.pts), zone: z.last.au > 1 ? T('Past {name}', { name: T(z.last.n) }) : T('Near Earth'), tiers: s.tiers.slice(0, 12), score: s.mode === 'daily' ? lsFmt(s.pts) + ' / ' + LS_N * 100 + ' ' + T('pts') : lsFmt(s.pts) + ' ' + T('pts') });
  let url = '';
  try { url = cv.toDataURL('image/png'); } catch (e) {}
  G.shareCv = cv;
  const txt = lsShareText(G, s);
  G.shareTxt = txt;
  if (G.paneKey !== 'share') G.shareBack = G.rerender;
  G.rerender = () => lsShareCard(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Share card'))}</div>${url ? `<img class="ls-card" src="${url}" alt="${lsEsc(T('Your Long Shot share card'))}">` : ''}<div class="ls-share">${lsEsc(txt)}</div>
<div class="ls-grid"><button class="ls-btn hot" type="button" data-act="share-go" data-focus>${lsEsc(T('Share'))}</button><button class="ls-btn blue" type="button" data-act="share-copy">${lsEsc(T('Copy text'))}</button><button class="ls-btn teal" type="button" data-act="share-save">${lsEsc(T('Save image'))}</button></div>
<p class="ls-note">${lsEsc(T('The card shows your rarity tiers, never your answers.'))}</p><button class="ls-btn ghost" type="button" data-act="share-back">${lsEsc(T('Back'))}</button></div>`, { key: 'share' });
}
function lsCopy(G, txt) {
  const ok = () => G.api.toast(T('Copied'));
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(ok, () => lsCopyOld(G, txt)); return; } } catch (e) {}
  lsCopyOld(G, txt);
}
function lsCopyOld(G, txt) {
  const ta = document.createElement('textarea');
  ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.append(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove();
  G.api.toast(ok ? T('Copied') : T('Could not copy'));
}
function lsShareGo(G) {
  const txt = G.shareTxt || '', cv = G.shareCv;
  if (navigator.share && cv && cv.toBlob) {
    cv.toBlob(b => {
      const f = b && typeof File === 'function' ? new File([b], 'long-shot.png', { type: 'image/png' }) : null;
      const data = f && navigator.canShare && navigator.canShare({ files: [f] }) ? { text: txt, files: [f] } : { text: txt };
      navigator.share(data).catch(() => {});
    }, 'image/png');
    return;
  }
  lsCopy(G, txt);
}
function lsShareSave(G) {
  const cv = G.shareCv;
  if (!cv || !cv.toBlob) return;
  cv.toBlob(b => {
    if (!b) return;
    const u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = 'long-shot.png'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  }, 'image/png');
}
function lsMenu(G) {
  G.R = null; G.mode = 'menu'; G.online = false;
  G.$q.hidden = true; lsHud(G, false);
  G.api.score(null);
  const day = lsDay(), d = G.sv.days[day], done = d && d.done, part = d && !d.done && d.a.length > 0;
  G.scene.set(done ? lsDayPts(d) : 0, false);
  G.scene.best = G.sv.best; G.scene.pmax = 130;
  G.rerender = () => lsMenu(G);
  const daily = done ? `<button class="ls-btn teal" type="button" data-act="today" data-focus>${lsEsc(T('See today’s results'))}<small>${lsEsc(T('{n} pts · next launch in {t}', { n: lsFmt(lsDayPts(d)), t: lsDur(lsNextDayMs()) }))}</small></button>` : `<button class="ls-btn hot" type="button" data-act="daily" data-focus>${lsEsc(part ? T('Continue daily launch #{n}', { n: day + 1 }) : T('Daily launch #{n}', { n: day + 1 }))}<small>${lsEsc(part ? T('Prompt {i} of {n}', { i: Math.min(LS_N, d.a.length + 1), n: LS_N }) : T('Same 7 prompts for everyone today'))}</small></button>`;
  lsPane(G, `<div class="ls-box"><div class="ls-logo"><b>LONG SHOT</b></div>
<p>${lsEsc(T('Name something that fits the prompt. The fewer players who say it, the further your probe flies.'))}</p>
${daily}
<div class="ls-grid"><button class="ls-btn blue" type="button" data-act="endless">${lsEsc(T('Endless'))}<small>${lsEsc(T('3 fuel cells'))}</small></button><button class="ls-btn vio" type="button" data-act="room">${lsEsc(T('Live room'))}<small>${lsEsc(T('Up to {n} players', { n: 16 }))}</small></button><button class="ls-btn teal" type="button" data-act="duel">${lsEsc(T('1 v 1 duel'))}<small>${lsEsc(T('Rating {n}', { n: lsFmt(G.sv.rating) }))}</small></button></div>
<div class="ls-stats"><div><b>${lsStreak(G.sv)}</b><span>${lsEsc(T('Streak'))}</span></div><div><b>${lsFmt(G.sv.best)}</b><span>${lsEsc(T('Best day'))}</span></div><div><b>${lsFmt(G.sv.endless)}</b><span>${lsEsc(T('Endless best'))}</span></div></div>
<div class="ls-pair"><button class="ls-btn ghost" type="button" data-act="how">${lsEsc(T('How to play'))}</button><button class="ls-btn ghost" type="button" data-act="stats">${lsEsc(T('Statistics'))}</button></div>
${lsLiveNote()}<p class="ls-note">${lsEsc(T('Answers are checked in English and French.'))}</p></div>`, { key: 'menu' });
}
function lsHow(G) {
  G.rerender = () => lsHow(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('How to play'))}</div><h2>${lsEsc(T('Think of the answer nobody else will'))}</h2>
<p>${lsEsc(T('Each prompt asks for one thing, like a country in Africa. Type an answer before the clock runs out. Wrong answers cost nothing but time, so keep trying.'))}</p>
<p>${lsEsc(T('Your first accepted answer locks in. The fewer players who gave it, the more points it scores. Points push your probe out through the Solar System: every point is 15 million km.'))}</p>
<div class="ls-tl">${LS_TIERS.map(t => `<span style="background:${t.c}">${lsEsc(T(t.n))} · ${t.p}</span>`).join('')}</div>
<p>${lsEsc(T('Daily launch: the same 7 prompts for everyone, 25 seconds each, once a day. Endless: keep going until your 3 fuel cells run out; a Long Shot answer refuels one. Live room: everyone gets the same prompt at the same moment. Duel: 7 prompts, 15 seconds each, against a player or the computer, for a rating.'))}</p>
<p>${lsEsc(T('Small typos and plurals are fine. Press Enter to launch an answer.'))}</p>
<button class="ls-btn hot" type="button" data-act="menu" data-focus>${lsEsc(T('Got it'))}</button></div>`, { key: 'how' });
}
function lsStats(G) {
  const sv = G.sv, days = Object.keys(sv.days).map(Number).filter(k => sv.days[k].done), tot = days.reduce((s, k) => s + lsDayPts(sv.days[k]), 0), mx = Math.max(1, ...sv.tiers);
  G.rerender = () => lsStats(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Statistics'))}</div><h2>${lsEsc(T('Your flight log'))}</h2>
<div class="ls-stats"><div><b>${days.length}</b><span>${lsEsc(T('Daily launches'))}</span></div><div><b>${days.length ? lsFmt(Math.round(tot / days.length)) : '—'}</b><span>${lsEsc(T('Average'))}</span></div><div><b>${lsFmt(sv.best)}</b><span>${lsEsc(T('Best day'))}</span></div></div>
<div class="ls-stats"><div><b>${lsStreak(sv)}</b><span>${lsEsc(T('Streak'))}</span></div><div><b>${lsBestStreak(sv)}</b><span>${lsEsc(T('Best streak'))}</span></div><div><b>${lsFmt(sv.endless)}</b><span>${lsEsc(T('Endless best'))}</span></div></div>
<div class="ls-stats"><div><b>${lsFmt(sv.rating)}</b><span>${lsEsc(T('Rating'))}</span></div><div><b>${sv.duel.w}–${sv.duel.l}${sv.duel.d ? '–' + sv.duel.d : ''}</b><span>${lsEsc(T('Duels'))}</span></div><div><b>${sv.rooms.w} / ${sv.rooms.p}</b><span>${lsEsc(T('Room wins'))}</span></div></div>
<h3>${lsEsc(T('Answers by rarity'))}</h3>
<div class="ls-bars">${LS_TIERS.map((t, i) => `<div><span>${lsEsc(T(t.n))}</span><i style="width:${Math.round(sv.tiers[i] / mx * 100)}%;background:${t.c}"></i><b>${sv.tiers[i]}</b></div>`).join('')}</div>
<button class="ls-btn hot" type="button" data-act="menu" data-focus>${lsEsc(T('Back'))}</button></div>`, { key: 'stats' });
}
function lsDailyIntro(G) {
  const day = lsDay();
  G.rerender = () => lsDailyIntro(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Daily launch #{n}', { n: day + 1 }))} · ${lsEsc(lsDate(day))}</div><h2>${lsEsc(T('Ready for launch?'))}</h2>
<p>${lsEsc(T('7 prompts, 25 seconds each. Everyone gets the same prompts today, and you only get one go.'))}</p>
<div class="ls-tl">${LS_TIERS.map(t => `<span style="background:${t.c}">${lsEsc(T(t.n))} · ${t.p}</span>`).join('')}</div>
<button class="ls-btn hot" type="button" data-act="daily-go" data-focus>${lsEsc(T('Launch'))}</button><button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Back'))}</button></div>`, { key: 'intro' });
}
function lsDailyStart(G) {
  const day = lsDay(), d = G.sv.days[day];
  if (d && d.done) return lsDailyResults(G, day);
  const ids = d && d.p.length === LS_N ? d.p : lsDaily(day);
  if (d) d.p = ids.slice();
  const start = d ? d.a.length : 0;
  lsStartRound(G, { mode: 'daily', ids, secs: LS_SECS, day, start });
}
function lsDuelMenu(G) {
  G.rerender = () => lsDuelMenu(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('1 v 1 duel'))}</div><h2>${lsEsc(T('Rating {n}', { n: lsFmt(G.sv.rating) }))}</h2>
<p>${lsEsc(T('Same 7 prompts, 15 seconds each. More points wins; if it is a tie, the faster scorer wins.'))}</p>
<button class="ls-btn vio" type="button" data-act="duel-net" data-focus>${lsEsc(T('Play a person online'))}<small>${lsEsc(T('Share a code or join a public duel'))}</small></button>
<h3>${lsEsc(T('Play the computer'))}</h3>
<div class="ls-pair">${LS_BOTS.map((b, i) => `<button class="ls-btn ${['teal', 'blue', 'vio', 'hot'][i]}" type="button" data-act="duelbot" data-v="${i}">${lsEsc(T(b.n))}<small>${lsEsc(T('Rating {n}', { n: b.r }))}</small></button>`).join('')}</div>
<button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Back'))}</button></div>`, { key: 'duelmenu' });
}
function lsRoomMenu(G) {
  const o = G.sv.room;
  G.rerender = () => lsRoomMenu(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Live room'))}</div><h2>${lsEsc(T('Room settings'))}</h2>
<p>${lsEsc(T('Everyone answers the same prompt at the same moment. These settings are used when you host.'))}</p>
<div class="ls-opt"><span>${lsEsc(T('Prompts'))}</span>${lsSeg('n', [[5, '5'], [7, '7'], [10, '10'], [15, '15']], o.n)}</div>
<div class="ls-opt"><span>${lsEsc(T('Seconds per prompt'))}</span>${lsSeg('s', [[15, '15'], [20, '20'], [25, '25'], [30, '30']], o.s)}</div>
<div class="ls-opt"><span>${lsEsc(T('Bot level'))}</span>${lsSeg('b', LS_BOTS.map((b, i) => [i, T(b.n)]), o.b)}</div>
<button class="ls-btn vio" type="button" data-act="room-go" data-focus>${lsEsc(T('Open the room'))}</button><button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Back'))}</button></div>`, { key: 'roommenu' });
}
