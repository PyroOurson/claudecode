function lsAct(G, a, el) {
  if (a !== 'sheet' && a !== 'set') G.snd.tap();
  if (a === 'daily') return lsDailyIntro(G);
  if (a === 'daily-go') return lsDailyStart(G);
  if (a === 'today') return lsDailyResults(G, lsDay());
  if (a === 'endless') return lsStartRound(G, { mode: 'endless', ids: lsRandomPrompts(30, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0), secs: LS_SECS });
  if (a === 'room') return lsRoomMenu(G);
  if (a === 'room-go') return lsOnline(G, 'room');
  if (a === 'duel') return lsDuelMenu(G);
  if (a === 'duel-net') return lsOnline(G, 'duel');
  if (a === 'duelbot') { const lvl = Math.max(0, Math.min(3, +el.dataset.v || 0)); return lsStartRound(G, { mode: 'bot', ids: lsRandomPrompts(LS_N, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, { solo: false }), secs: LS_DUEL_SECS, lvl }); }
  if (a === 'how') return lsHow(G);
  if (a === 'stats') return lsStats(G);
  if (a === 'menu') return lsMenu(G);
  if (a === 'share') return lsShareCard(G);
  if (a === 'share-go') return lsShareGo(G);
  if (a === 'share-copy') return lsCopy(G, G.shareTxt || '');
  if (a === 'share-save') return lsShareSave(G);
  if (a === 'share-back') { const f = G.shareBack; G.shareBack = null; return f ? f() : lsMenu(G); }
  if (a === 'sheet') return lsSheetOpen(G, el);
  if (a === 'set') { const k = el.dataset.k, v = +el.dataset.v; if (k === 'n' || k === 's' || k === 'b') { G.sv.room[k] = v; lsSave(G); G.snd.tap(); } return lsRoomMenu(G); }
  if (a === 'pass') return G.online ? lsNetPass(G) : lsMiss(G, 'pass');
  if (a === 'again') { if (G.online && G.role === 'host') return lsOnline(G, G.netKind || 'room'); return; }
  if (a === 'leave') { try { G.api.net.close(); } catch (e) {} G.ntok++; G.online = false; G.H = null; G.C = null; G.role = null; return lsMenu(G); }
}
function lsMount(root, api) {
  const G = { api, root, alive: true, snd: lsSound(api), sv: lsClean(api.load()), ntok: 0, online: false, role: null, R: null, C: null, H: null, lang: lsLang(), paneKey: '', rerender: null, port: false, W: 960, H0: 600, scale: 1, lastSec: 0 };
  G.myName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); if (p && (p.username || p.displayName)) return String(p.username || p.displayName).replace(/[<>&"']/g, '').slice(0, 16); } catch (e) {} return T('You'); };
  G.onlineSubmit = auto => lsNetSubmit(G, auto);
  lsBuild(G);
  root._ls = { G, prompt: lsPrompt, match: lsMatch, share: lsShare, tier: lsTier, daily: lsDaily, day: lsDay };
  lsTexts(G);
  lsFit(G, true);
  api.on(G.$form, 'submit', e => { e.preventDefault(); lsSubmit(G, false); });
  api.on(G.$in, 'input', () => {
    const R = G.R, C = G.C;
    const locked = G.online ? !!(C && (C.me || C.wait || C.phase !== 'q')) : !!(R && (R.me || R.phase !== 'ask'));
    if (locked) { G.$in.value = ''; return; }
    if (G.$fb.classList.contains('bad')) { G.$fb.textContent = ''; G.$fb.className = 'ls-fb'; }
  });
  api.on(G.$in, 'keydown', e => { if (e.key && e.key.length === 1) G.snd.key(); e.stopPropagation(); });
  api.on(G.st, 'click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || !G.st.contains(el)) return;
    e.preventDefault();
    lsAct(G, el.dataset.act, el);
  });
  api.on(G.st, 'contextmenu', e => { if (e.target.closest('canvas')) e.preventDefault(); });
  api.on(window, 'keydown', e => {
    if (!G.alive || e.target === G.$in) return;
    const R = G.R;
    if (e.key === 'Enter' && R && !G.online && (R.phase === 'lock' || R.phase === 'show') && R.fin && !R.over && G.$pane.hidden) { e.preventDefault(); R.wait = Math.min(R.wait, .12); }
  });
  api.on(window, 'resize', () => lsFit(G));
  let ro = null;
  if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => { if (G.alive) lsFit(G); }); ro.observe(root); }
  let last = performance.now(), acc = 0;
  const STEP = 1 / 120;
  api.loop(() => {
    const now = performance.now();
    let dt = (now - last) / 1000;
    last = now;
    if (dt > .25) dt = 0;
    acc = Math.min(acc + dt, .25);
    while (acc >= STEP) { G.scene.step(STEP); acc -= STEP; }
    if (!G.online) lsTick(G, dt); else lsNetTick(G);
    G.scene.draw();
  });
  api.interval(() => {
    lsHostTick(G);
    const p = !!api.paused;
    if (p !== G.paused) { G.paused = p; G.st.classList.toggle('paused', p); if (!p && !G.$q.hidden && G.$pane.hidden) G.$in.focus({ preventScroll: true }); }
    const l = lsLang();
    if (l !== G.lang) {
      G.lang = l; lsTexts(G);
      if (G.rerender && !G.$pane.hidden && G.paneKey !== 'rv') G.rerender();
      if (!G.$q.hidden) { const P = G.online ? G.C && G.C.P : G.R && G.R.P; if (P) G.$qt.textContent = lsPromptText(P); }
      lsHud(G, !G.$hud.hidden);
    }
  }, 120);
  let kind = 'room';
  try { kind = sessionStorage.getItem(LS_NK) || 'room'; } catch (e) {}
  if (api.net.invite) lsOnline(G, kind === 'duel' ? 'duel' : 'room');
  else lsMenu(G);
  return { destroy() { G.alive = false; G.ntok++; G.R = null; G.H = null; G.C = null; G.snd.close(); if (ro) ro.disconnect(); } };
}
Ameplay.register({
  id: LS_ID,
  title: 'Long Shot',
  category: 'Brain',
  tint: '#3a3f9a',
  blurb: 'Name the answer nobody else thinks of. Rare answers fly your probe further.',
  get help() { return [T('Type one answer that fits the prompt, then press Enter'), T('Wrong answers cost only time: keep trying until the clock runs out'), T('The fewer players who give your answer, the more points it scores'), T('Pass skips a prompt'), T('Endless: a Long Shot answer refuels one cell')].map(lsEsc).join(' · '); },
  better: 'high',
  format: v => v + ' pts',
  width: 960,
  icon: LS_ICON,
  css: LS_CSS,
  mount: lsMount
});
