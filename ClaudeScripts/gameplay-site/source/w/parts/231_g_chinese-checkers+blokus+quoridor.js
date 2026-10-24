(() => {
  'use strict';
  const C = Ameplay.colors;
  const EASE = 'cubic-bezier(.22,.8,.2,1)';
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const rnd = a => a[Math.random() * a.length | 0];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const BOTS = ['Ada', 'Bruno', 'Chen', 'Dara', 'Eli', 'Faye', 'Gus', 'Hana', 'Ivo', 'Juno', 'Kai', 'Lena', 'Milo', 'Nora', 'Otis', 'Pia', 'Quin', 'Rhea', 'Sol', 'Tess'];
  const LEVELS = [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']];
  const paused = () => { try { return !!Ameplay.debug.pause(); } catch (e) { return false; } };

  function sounds(api) {
    let ac = null;
    const ctx = () => {
      try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; }
    };
    const tone = (f, d, type, v, f2, at) => {
      if (api.muted) return;
      const a = ctx();
      if (!a) return;
      try {
        const t = a.currentTime + (at || 0), o = a.createOscillator(), g = a.createGain();
        o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .06, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .03);
      } catch (e) {}
    };
    let nb = null;
    const noise = (d, v, f, at) => {
      if (api.muted) return;
      const a = ctx();
      if (!a) return;
      try {
        if (!nb) { nb = a.createBuffer(1, a.sampleRate * .4 | 0, a.sampleRate); const x = nb.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; }
        const t = a.currentTime + (at || 0), s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
        s.buffer = nb; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = 1.2;
        g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        s.connect(fl).connect(g).connect(a.destination); s.start(t); s.stop(t + d + .02);
      } catch (e) {}
    };
    return {
      tick: i => { tone(1500 + (i || 0) * 90, .045, 'square', .018); noise(.03, .07, 3000); },
      glass: i => { tone(880 + (i || 0) * 60, .16, 'sine', .05, 700); tone(1320 + (i || 0) * 90, .1, 'sine', .02); noise(.025, .08, 4200); },
      drop: () => { tone(170, .14, 'triangle', .12, 80); noise(.06, .1, 700); },
      wall: () => { tone(120, .2, 'triangle', .16, 55); noise(.09, .14, 500); },
      step: () => { tone(300, .07, 'triangle', .06, 220); noise(.02, .05, 1800); },
      pop: () => tone(740, .1, 'sine', .05, 520),
      bad: () => tone(190, .18, 'triangle', .07, 110),
      pass: () => tone(400, .16, 'sine', .04, 300),
      win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .28, 'sine', .07, 0, i * .1)); },
      lose: () => { [392, 330, 262].forEach((f, i) => tone(f, .3, 'triangle', .06, 0, i * .13)); }
    };
  }

  const segHtml = (k, vals, cur) => `<div class="seg" data-k="${k}" role="radiogroup">${vals.map(([v, t]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;

  const kitCss = p => `
${p}{gap:12px;padding:2px 0 6px}
${p} [hidden]{display:none!important}
${p} .gk-main{display:flex;gap:18px;justify-content:center;align-items:flex-start;width:100%}
${p} .gk-board{position:relative;flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:center;gap:10px}
${p} .gk-side{flex:0 0 232px;display:flex;flex-direction:column;gap:10px;min-width:0}
${p} .gk-chips{display:flex;flex-direction:column;gap:8px}
${p} .gk-chip{position:relative;display:flex;align-items:center;gap:10px;padding:8px 12px 8px 10px;border-radius:14px;background:var(--sunk);border:2px solid transparent;transition:border-color .25s,background .25s,box-shadow .25s,opacity .25s}
${p} .gk-chip.on{background:#fff;border-color:var(--c);box-shadow:0 8px 18px -12px var(--c)}
${p} .gk-chip.off{opacity:.5}
${p} .gk-chip .gk-dot{width:28px;height:28px;flex:none;border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.95) 0 9%,rgba(255,255,255,.2) 24%,transparent 42%),radial-gradient(circle at 50% 55%,var(--c),color-mix(in srgb,var(--c) 62%,#000) 100%);box-shadow:inset 0 -3px 5px rgba(0,0,0,.28),0 2px 5px rgba(0,0,0,.28)}
${p} .gk-chips.sq .gk-dot{border-radius:7px;background:linear-gradient(145deg,color-mix(in srgb,var(--c) 70%,#fff),var(--c) 55%,color-mix(in srgb,var(--c) 75%,#000));box-shadow:inset 0 0 0 2px rgba(255,255,255,.28),0 2px 5px rgba(0,0,0,.28)}
${p} .gk-chip div{min-width:0;flex:1}
${p} .gk-chip b{display:block;font-weight:900;font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${p} .gk-chip small{display:block;min-height:16px;font-size:12px;font-weight:800;color:var(--muted);line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${p} .gk-chip em{font-style:normal;color:var(--good)}
${p} .gk-chip .gk-bar2{height:4px;border-radius:3px;background:rgba(0,0,0,.08);margin-top:4px;overflow:hidden}
${p} .gk-chip .gk-bar2 i{display:block;height:100%;width:var(--w,0%);background:var(--c);border-radius:3px;transition:width .5s ${EASE}}
${p} .gk-dots{display:none;gap:3px}
${p} .gk-chip.think .gk-dots{display:flex}
${p} .gk-dots i{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:gk-dot 1s infinite ease-in-out}
${p} .gk-dots i:nth-child(2){animation-delay:.15s}
${p} .gk-dots i:nth-child(3){animation-delay:.3s}
@keyframes gk-dot{0%,80%,100%{transform:scale(.5);opacity:.35}40%{transform:none;opacity:1}}
${p} .gk-st{min-height:22px;text-align:center;font-weight:900;font-size:14px;line-height:1.35;color:var(--ink-2)}
${p} .gk-st.turn{align-self:center;padding:5px 16px;border-radius:999px;background:var(--accent);color:#fff;box-shadow:0 6px 14px -8px rgba(108,92,231,.9)}
${p} .gk-st.good{color:var(--good)}
${p} .gk-st.bad{color:var(--bad)}
${p} .gk-st.warn{color:#e2711d}
${p} .gk-btns{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
${p} .gk-btns .g-btn{flex:1 1 auto;min-width:0;padding:0 12px}
${p} .gk-side .gk-btns .g-btn{flex:1 1 40%}
${p} .gk-net{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:800;color:var(--muted)}
${p} .gk-net i{width:8px;height:8px;border-radius:50%;background:var(--bad)}
${p} .gk-net.on i{background:var(--good);box-shadow:0 0 0 3px rgba(34,176,125,.2)}
${p} .gk-menu{position:absolute;inset:0;z-index:12;display:grid;place-items:safe center;overflow-y:auto;padding:14px;border-radius:inherit;background:rgba(255,255,255,.8);-webkit-backdrop-filter:blur(9px);backdrop-filter:blur(9px);opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s .3s}
${p} .gk-menu.show{opacity:1;visibility:visible;transition-delay:0s}
${p} .gk-card{width:100%;max-width:440px;text-align:center;transform:translateY(12px) scale(.96);transition:transform .5s var(--spring,${EASE})}
${p} .gk-menu.show .gk-card{transform:none}
${p} .gk-card .g-ov-title{font-size:clamp(28px,5vw,40px);margin-bottom:8px}
${p} .gk-card .g-ov-text{margin-bottom:14px;font-size:14px}
${p} .gk-opts{display:flex;flex-direction:column;gap:8px;margin:0 0 16px;align-items:stretch}
${p} .gk-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:6px 6px 6px 14px;border-radius:999px;background:var(--sunk)}
${p} .gk-opt>span{font-size:12.5px;font-weight:900;color:var(--ink-2);text-align:left}
${p} .gk-opt.tog{cursor:pointer}
${p} .gk-how{margin-top:14px;text-align:left;font-size:13px;line-height:1.55;color:var(--ink-2)}
${p} .gk-how summary{cursor:pointer;font-weight:900;text-align:center;color:var(--accent)}
${p} .gk-how ul{margin:8px 0 0;padding-left:18px}
${p} .gk-how li{margin:3px 0}
${p} .seg{display:inline-flex;padding:3px;gap:2px;border-radius:999px;background:rgba(31,29,43,.06);box-shadow:inset 0 1px 2px rgba(31,29,43,.08)}
${p} .seg button{border:0;background:none;padding:8px 12px;border-radius:999px;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
${p} .seg button:hover{color:var(--ink)}
${p} .seg button[aria-checked="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 10px -4px rgba(31,29,43,.3)}
${p} .gk-board canvas{cursor:pointer;touch-action:none}
@media (max-width:760px){
  ${p} .gk-main{flex-direction:column;align-items:center;gap:12px}
  ${p} .gk-side{flex:none;width:100%;max-width:520px}
  ${p} .gk-chips{flex-direction:row;flex-wrap:wrap}
  ${p} .gk-chip{flex:1 1 140px;min-width:0}
}
@media (pointer:coarse){${p} .seg button{min-height:40px}${p} .gk-btns .g-btn{height:42px}}
`;

  function mountKit(root, api, S) {
    const saved = api.load() || {};
    const opt = {};
    for (const o of S.opts) {
      const hit = o.vals.find(([v]) => String(v) === String(saved[o.key]));
      opt[o.key] = hit ? hit[0] : o.def;
    }
    if (coarse()) root.classList.add('touch');
    root.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
    const main = h('div', 'gk-main'), board = h('div', 'gk-board'), side = h('div', 'gk-side');
    const chips = h('div', 'gk-chips' + (S.square ? ' sq' : ''));
    const net = h('div', 'gk-net', '<i></i><span></span>');
    net.hidden = true;
    const st = h('div', 'gk-st'), btns = h('div', 'gk-btns');
    st.setAttribute('role', 'status');
    side.append(chips, net, btns);
    main.append(board, side);
    const menu = h('div', 'gk-menu');
    root.append(main, st, menu);
    const K = { root, api, opt, main, board, side, chips, st, btns, menu, S, onBtn: null, onStart: null };
    const optRow = o => {
      const vis = !o.when || o.when(opt);
      return `<div class="gk-opt" data-key="${o.key}"${vis ? '' : ' hidden'}><span>${o.label}</span>${segHtml(o.key, o.vals, opt[o.key])}</div>`;
    };
    K.renderMenu = () => {
      menu.innerHTML = `<div class="gk-card"><p class="g-ov-kicker">${S.kicker || 'Board game'}</p><h3 class="g-ov-title">${S.title}</h3><p class="g-ov-text">${S.blurb}</p><div class="gk-opts">${S.opts.map(optRow).join('')}</div><div class="g-ov-btns"><button type="button" class="g-btn" data-a="solo">Play vs bots</button><button type="button" class="g-btn ghost" data-a="online">Play online</button></div><details class="gk-how"><summary>How to play</summary>${S.rules}</details></div>`;
    };
    K.renderMenu();
    menu.addEventListener('click', e => {
      const sb = e.target.closest('.seg button');
      if (sb) {
        const k = sb.parentNode.dataset.k, o = S.opts.find(x => x.key === k), v = o.vals.find(([x]) => String(x) === sb.dataset.v)[0];
        opt[k] = v; api.save({ ...opt }); api.sfx('tick');
        sb.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === sb)));
        S.opts.forEach(x => { const r = menu.querySelector(`.gk-opt[data-key="${x.key}"]`); if (r) r.hidden = !!x.when && !x.when(opt); });
        if (S.onOpt) S.onOpt(k, v);
        return;
      }
      const b = e.target.closest('[data-a]');
      if (!b) return;
      api.sfx('tap');
      if (b.dataset.a === 'solo') K.onStart('solo');
      else if (b.dataset.a === 'online') K.onStart('online');
    });
    K.showMenu = on => { menu.classList.toggle('show', on); if (on) K.renderMenu(); };
    btns.addEventListener('click', e => {
      const b = e.target.closest('button[data-b]');
      if (b && !b.disabled && K.onBtn) { api.sfx('tap'); K.onBtn(b.dataset.b); }
    });
    K.setBtns = list => {
      btns.innerHTML = list.filter(Boolean).map(([id, t, cls, dis]) => `<button type="button" class="g-btn${cls ? ' ' + cls : ' ghost'} sm" data-b="${id}"${dis ? ' disabled' : ''}>${t}</button>`).join('');
    };
    K.setChips = list => {
      chips.innerHTML = list.map(c => `<div class="gk-chip${c.on ? ' on' : ''}${c.think ? ' think' : ''}${c.off ? ' off' : ''}" style="--c:${c.color}"><i class="gk-dot"></i><div><b>${esc(c.name)}</b><small>${c.info || ''}</small>${c.bar != null ? `<div class="gk-bar2" style="--w:${Math.round(c.bar * 100)}%"><i></i></div>` : ''}</div><span class="gk-dots"><i></i><i></i><i></i></span></div>`).join('');
    };
    K.status = (t, cls) => { st.textContent = t; st.className = 'gk-st' + (cls ? ' ' + cls : ''); };
    K.netText = t => { net.hidden = t == null; if (t != null) { net.classList.toggle('on', !!t[0]); net.lastChild.textContent = t[1]; } };
    return K;
  }

  function makeTable(api, G, H, O) {
    const T = { mode: 'idle', setup: null, state: null, log: [], seats: [], me: -1, over: false, job: null, tok: 0, hooked: false, pending: false, lastBot: false };
    const hubSeats = () => T.seats.map(s => ({ bot: s.kind === 'bot', name: s.name, pid: s.pid || null, level: s.level }));
    const syncMsg = () => ({ t: 'sync', setup: T.setup, seats: hubSeats(), log: T.log });
    const cur = () => G.cur(T.state);
    T.cur = cur;
    T.seat = () => T.seats[cur()];
    T.mine = () => !!T.state && !T.over && !T.pending && T.mode !== 'idle' && T.mode !== 'lobby' && T.seats[cur()] && T.seats[cur()].kind === 'me';
    function begin(mode, setup, seats, log) {
      api.hideOverlay();
      T.tok++; T.mode = mode; T.setup = setup; T.seats = seats; T.job = null; T.over = false; T.log = []; T.pending = false; T.lastBot = false;
      T.state = G.init(setup);
      T.me = seats.findIndex(s => s.kind === 'me');
      for (const m of log || []) { if (!G.legal(T.state, m)) break; G.apply(T.state, m); T.log.push(m); }
      T.over = T.state.over;
      H.begin(T);
      if (T.over) H.over(T);
    }
    T.solo = cfg => {
      const setup = G.setup(cfg), names = shuffle(BOTS.slice());
      const seats = Array.from({ length: setup.n }, (_, i) => i === 0 ? { kind: 'me', name: 'You' } : { kind: 'bot', name: names.pop(), level: cfg.level });
      begin('solo', setup, seats);
    };
    function hostFrom(r) {
      const cfg = O.cfg(), humans = r.players.map(p => ({ pid: p.id, name: p.name }));
      const n = G.seatCount(humans.length, r.size, r.bots), setup = G.setup({ ...cfg, n }), names = shuffle(BOTS.slice());
      const list = shuffle([...humans.slice(0, setup.n), ...Array.from({ length: Math.max(0, setup.n - humans.length) }, () => ({ bot: true, name: names.pop() }))]);
      const seats = list.map(x => x.bot ? { kind: 'bot', name: x.name, level: cfg.level } : x.pid === api.net.id ? { kind: 'me', name: x.name, pid: x.pid } : { kind: 'peer', name: x.name, pid: x.pid });
      begin('host', setup, seats);
      api.net.send(syncMsg());
    }
    T.again = () => {
      if (T.mode === 'solo') return T.solo(O.cfg());
      if (T.mode !== 'host') return;
      const live = new Set((api.net.players || []).filter(p => !p.away).map(p => p.id));
      const humans = T.seats.filter(s => s.kind === 'me' || (s.kind === 'peer' && live.has(s.pid))).map(s => ({ id: s.pid || api.net.id, name: s.name }));
      hostFrom({ players: humans, size: T.seats.length, bots: true });
    };
    T.play = (seat, m) => {
      if (!T.state || T.over || cur() !== seat || !G.legal(T.state, m)) return false;
      const info = G.apply(T.state, m);
      T.log.push(m); T.pending = false;
      T.lastBot = T.seats[seat].kind === 'bot';
      if (T.mode === 'host') api.net.send({ t: 'mv', n: T.log.length - 1, m });
      H.moved(seat, m, info, T);
      if (T.state.over) { T.over = true; H.over(T); }
      return true;
    };
    T.submit = m => {
      if (!T.mine() || H.busy()) return false;
      if (T.mode === 'guest') {
        if (!G.legal(T.state, m)) return false;
        T.pending = true; api.net.send({ t: 'mv', m }); H.pending && H.pending(T);
        return true;
      }
      return T.play(cur(), m);
    };
    T.tick = () => {
      if (!T.state || T.over || T.mode === 'guest' || T.mode === 'idle' || T.mode === 'lobby' || H.busy()) return;
      const s = cur(), seat = T.seats[s];
      if (!seat || seat.kind !== 'bot') { T.job = null; return; }
      if (paused()) return;
      const now = performance.now();
      if (!T.job) T.job = { gen: G.think(G.clone(T.state), seat.level), at: now + (T.lastBot ? 140 : 420) + Math.random() * 260, n: T.log.length };
      const j = T.job;
      if (now < j.at) return;
      const t0 = performance.now();
      let r;
      do { r = j.gen.next(); } while (!r.done && performance.now() - t0 < 7);
      if (!r.done) return;
      T.job = null;
      let m = r.value;
      if (!m || !G.legal(T.state, m)) m = G.anyMove(T.state);
      if (m) T.play(s, m);
    };
    T.thinking = () => !!(T.state && !T.over && T.mode !== 'guest' && T.seat() && T.seat().kind === 'bot');
    T.leave = () => { T.tok++; T.mode = 'idle'; T.state = null; T.job = null; try { api.net.close(); } catch (e) {} };
    T.online = async () => {
      hook();
      T.tok++;
      const tok = T.tok;
      T.mode = 'lobby'; T.state = null; T.job = null; T.pending = false; api.hideOverlay();
      H.lobby();
      const r = await api.net.room(O.room);
      if (!api.alive || tok !== T.tok) return;
      if (!r) { T.mode = 'idle'; return H.menu(); }
      if (r.role === 'host') hostFrom(r);
      else { T.mode = 'guest'; H.wait(); }
    };
    const seatOf = pid => T.seats.findIndex(s => s.pid === pid && s.kind !== 'bot');
    function onData(d, from) {
      if (!d || !api.alive) return;
      if (api.net.role === 'host') {
        if (T.mode !== 'host') return;
        if (d.t === 'mv') {
          const s = seatOf(from);
          if (s < 0 || !T.state || !T.play(s, d.m)) api.net.sendTo(from, syncMsg());
        } else if (d.t === 'sync?') api.net.sendTo(from, syncMsg());
        else if (d.t === 'rq') H.request && H.request(from);
        return;
      }
      if (d.t === 'sync' && d.setup && Array.isArray(d.seats)) {
        const seats = d.seats.map(s => s.bot ? { kind: 'bot', name: s.name, level: s.level } : s.pid === api.net.id ? { kind: 'me', name: s.name, pid: s.pid } : { kind: 'peer', name: s.name, pid: s.pid });
        begin('guest', d.setup, seats, d.log);
      } else if (d.t === 'mv' && T.state && T.mode === 'guest') {
        if (d.n === T.log.length) {
          const seat = cur();
          if (!G.legal(T.state, d.m)) { api.net.send({ t: 'sync?' }); return; }
          const info = G.apply(T.state, d.m);
          T.log.push(d.m); T.pending = false;
          H.moved(seat, d.m, info, T);
          if (T.state.over) { T.over = true; H.over(T); }
        } else if (d.n > T.log.length) api.net.send({ t: 'sync?' });
      } else if (d.t === 'seats' && Array.isArray(d.seats) && T.mode === 'guest') {
        d.seats.forEach((s, i) => { const o = T.seats[i]; if (o && o.kind !== 'me') { o.kind = s.bot ? 'bot' : 'peer'; o.name = s.name; o.pid = s.pid; o.level = s.level; } });
        H.seats(T);
      }
    }
    function hook() {
      if (T.hooked) return;
      T.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => {
        if (T.mode !== 'host' || !p) return;
        const s = seatOf(p.id);
        if (s < 0) return;
        const o = T.seats[s];
        api.toast(o.name + ' left. A bot takes the seat.');
        o.kind = 'bot'; o.pid = null; o.level = O.cfg().level; o.name = o.name + ' (bot)';
        api.net.send({ t: 'seats', seats: hubSeats() });
        T.job = null;
        H.seats(T);
      });
      api.net.on('rejoin', p => { if (T.mode === 'host' && p && T.state) api.net.sendTo(p.id, syncMsg()); });
      api.net.on('lobby', () => { if (T.mode === 'guest' || T.mode === 'lobby') T.online(); });
      api.net.on('close', reason => {
        if (T.mode !== 'guest' && T.mode !== 'lobby') return;
        const was = T.mode;
        T.tok++; T.mode = 'idle'; T.state = null; T.job = null;
        if (was === 'lobby' && !reason) return;
        H.closed(reason);
      });
      api.interval(() => { if (T.mode === 'host' || T.mode === 'guest') H.net(T); }, 1000);
    }
    return T;
  }
  const CCE = (() => {
    const DIRS = [[1, -1, 0], [1, 0, -1], [0, 1, -1], [-1, 1, 0], [-1, 0, 1], [0, -1, 1]];
    const inStar = (x, y, z) => (x >= -4 && y >= -4 && z >= -4) || (x <= 4 && y <= 4 && z <= 4);
    const X = [], Y = [], Z = [], IDX = new Int16Array(289).fill(-1);
    for (let z = -8; z <= 8; z++) for (let x = -8; x <= 8; x++) {
      const y = -x - z;
      if (y >= -8 && y <= 8 && inStar(x, y, z)) { IDX[(x + 8) * 17 + z + 8] = X.length; X.push(x); Y.push(y); Z.push(z); }
    }
    const N = X.length;
    const at = (x, y, z) => (x < -8 || x > 8 || z < -8 || z > 8 || y < -8 || y > 8) ? -1 : IDX[(x + 8) * 17 + z + 8];
    const NB = new Int16Array(N * 6);
    for (let i = 0; i < N; i++) for (let d = 0; d < 6; d++) NB[i * 6 + d] = at(X[i] + DIRS[d][0], Y[i] + DIRS[d][1], Z[i] + DIRS[d][2]);
    const PCOND = [(x, y, z) => z <= -5, x => x >= 5, (x, y) => y <= -5, (x, y, z) => z >= 5, x => x <= -5, (x, y) => y >= 5];
    const TIPS = [[4, 4, -8], [8, -4, -4], [4, -8, 4], [-4, -4, 8], [-8, 4, 4], [-4, 8, -4]];
    const TIP = TIPS.map(([x, y, z]) => at(x, y, z));
    const hd = (a, b) => Math.max(Math.abs(X[a] - X[b]), Math.abs(Y[a] - Y[b]), Math.abs(Z[a] - Z[b]));
    const DIST = TIP.map(t => Int8Array.from({ length: N }, (_, i) => hd(i, t)));
    const PT = PCOND.map((f, k) => [...Array(N).keys()].filter(i => f(X[i], Y[i], Z[i])).sort((a, b) => DIST[k][a] - DIST[k][b] || a - b));
    const PT_OF = new Int8Array(N).fill(-1);
    PT.forEach((a, k) => a.forEach(i => { PT_OF[i] = k; }));
    const LAT = [
      Int8Array.from({ length: N }, (_, i) => Math.abs(X[i] - Y[i])),
      Int8Array.from({ length: N }, (_, i) => Math.abs(Y[i] - Z[i])),
      Int8Array.from({ length: N }, (_, i) => Math.abs(X[i] - Z[i]))
    ];
    const HOMES = { 2: [3, 0], 3: [3, 5, 1], 4: [3, 4, 0, 1], 6: [3, 4, 5, 0, 1, 2] };
    const COUNTS = [2, 3, 4, 6];

    function setup(o) {
      const n = COUNTS.includes(+o.n) ? +o.n : 2;
      return { n, nb: !!o.nb };
    }
    function init(s) {
      const home = HOMES[s.n], board = new Int8Array(N), pos = home.map((k, si) => PT[k].slice());
      pos.forEach((a, si) => a.forEach(i => { board[i] = si + 1; }));
      return { n: s.n, nb: !!s.nb, home, goal: home.map(k => (k + 3) % 6), board, pos, turn: 0, over: false, winner: -1, count: 0, last: [], done: [] };
    }
    function clone(st) {
      return { ...st, board: st.board.slice(), pos: st.pos.map(a => a.slice()), last: st.last.slice(), done: st.done.slice() };
    }
    function reach(st, f) {
      const b = st.board, owner = b[f];
      b[f] = 0;
      const par = new Int16Array(N).fill(-1), dest = [], q = [f];
      par[f] = f;
      for (let d = 0; d < 6; d++) { const n = NB[f * 6 + d]; if (n >= 0 && !b[n]) { par[n] = f; dest.push(n); } }
      for (let qi = 0; qi < q.length; qi++) {
        const c = q[qi];
        for (let d = 0; d < 6; d++) {
          const o = NB[c * 6 + d];
          if (o < 0 || !b[o]) continue;
          const l = NB[o * 6 + d];
          if (l < 0 || b[l] || par[l] >= 0) continue;
          par[l] = c; q.push(l); dest.push(l);
        }
      }
      b[f] = owner;
      return { dest, par };
    }
    function path(f, t, par) {
      if (par[t] === f) return [f, t];
      const p = [t];
      while (p[0] !== f) p.unshift(par[p[0]]);
      return p;
    }
    function legal(st, m) {
      if (st.over || !m || !(m.f >= 0 && m.f < N && m.t >= 0 && m.t < N) || st.board[m.f] !== st.turn + 1) return false;
      return reach(st, m.f).dest.includes(m.t);
    }
    function standing(st, s) {
      const g = st.goal[s];
      let k = 0, d = 0;
      for (const c of st.pos[s]) { if (PT_OF[c] === g) k++; d += DIST[g][c]; }
      return { k, d };
    }
    function finished(st, s) {
      const g = st.goal[s];
      let inn = 0;
      for (const c of st.pos[s]) if (PT_OF[c] === g) inn++;
      if (inn === 10) return true;
      if (!st.nb || inn < 6) return false;
      let hold = 0;
      for (const c of PT[g]) {
        const v = st.board[c];
        if (!v) return false;
        if (v - 1 === s) continue;
        if (st.home[v - 1] !== g) return false;
        hold++;
      }
      return hold > 0 && hold <= 3;
    }
    function mk(st, s, f, t) {
      const a = st.pos[s], k = a.indexOf(f);
      a[k] = t; st.board[t] = s + 1; st.board[f] = 0;
      return k;
    }
    function un(st, s, k, f, t) {
      st.pos[s][k] = f; st.board[f] = s + 1; st.board[t] = 0;
    }
    function gen(st, s) {
      const out = [], b = st.board, pos = st.pos[s];
      for (let i = 0; i < pos.length; i++) {
        const f = pos[i], r = reach(st, f);
        for (const t of r.dest) out.push(f << 7 | t);
      }
      return out;
    }
    function anyMove(st) {
      const g = gen(st, st.turn);
      return g.length ? { f: g[0] >> 7, t: g[0] & 127 } : null;
    }
    function apply(st, m) {
      const s = st.turn;
      mk(st, s, m.f, m.t);
      st.count++;
      st.last[s] = [m.f, m.t];
      const info = { passes: [] };
      for (let k = 0; k < st.n; k++) {
        const q = (s + k) % st.n;
        if (!st.done.includes(q) && finished(st, q)) st.done.push(q);
      }
      if (st.done.length) { st.over = true; st.winner = st.done[0]; return info; }
      for (let k = 1; k <= st.n; k++) {
        const q = (s + k) % st.n;
        if (gen(st, q).length) { st.turn = q; return info; }
        info.passes.push(q);
      }
      st.over = true; st.winner = -1;
      return info;
    }
    function ranking(st) {
      const o = [...Array(st.n).keys()].map(s => ({ s, ...standing(st, s) }));
      o.sort((a, b) => (b.s === st.winner) - (a.s === st.winner) || b.k - a.k || a.d - b.d);
      return o;
    }
    const W = { mx: .45, lat: .1 };
    function ev(st, s) {
      const g = st.goal[s], D = DIST[g], L = LAT[g % 3], pos = st.pos[s];
      let sum = 0, mx = 0, lat = 0;
      for (let i = 0; i < pos.length; i++) {
        const c = pos[i], d = D[c];
        sum += d;
        if (d > mx) mx = d;
        if (d > 4) lat += L[c];
      }
      return -(sum + W.mx * mx + W.lat * lat);
    }
    function ranked(st, s, moves, cap) {
      const sc = moves.map(m => { const f = m >> 7, t = m & 127, k = mk(st, s, f, t), v = ev(st, s); un(st, s, k, f, t); return [v, m]; });
      sc.sort((a, b) => b[0] - a[0]);
      return cap ? sc.slice(0, cap) : sc;
    }
    function nm(st, s, o, d, al, be, widths) {
      if (finished(st, s)) return 1e4 + d;
      if (finished(st, o)) return -1e4 - d;
      if (d === 0) return ev(st, s) - ev(st, o);
      const moves = gen(st, s);
      if (!moves.length) return -nm(st, o, s, d - 1, -be, -al, widths);
      let best = -Infinity;
      for (const [, m] of ranked(st, s, moves, widths[widths.length - d] || 4)) {
        const f = m >> 7, t = m & 127, k = mk(st, s, f, t);
        const v = -nm(st, o, s, d - 1, -be, -al, widths);
        un(st, s, k, f, t);
        if (v > best) best = v;
        if (v > al) al = v;
        if (al >= be) break;
      }
      return best;
    }
    function* think(st, level) {
      const s = st.turn, o = (s + 1) % st.n, moves = gen(st, s);
      if (!moves.length) return null;
      const last = st.last[s], two = st.n === 2;
      const dec = m => ({ f: m >> 7, t: m & 127 });
      const back = m => last && (m >> 7) === last[1] && (m & 127) === last[0];
      if (level === 'easy') {
        if (Math.random() < .12) return dec(moves[Math.random() * moves.length | 0]);
        const sc = ranked(st, s, moves).map(([v, m]) => [v + (Math.random() - .5) * 7, m]);
        sc.sort((a, b) => b[0] - a[0]);
        return dec(sc[0][1]);
      }
      const top = ranked(st, s, moves, level === 'hard' ? 9 : 7);
      yield;
      let bestM = top[0][1], bestV = -Infinity;
      const scored = [];
      for (const [v0, m] of top) {
        const f = m >> 7, t = m & 127, k = mk(st, s, f, t);
        let v;
        if (finished(st, s)) v = 1e5;
        else if (two) v = -nm(st, o, s, level === 'hard' ? 4 : 2, -Infinity, Infinity, level === 'hard' ? [8, 7, 6, 5] : [6, 5]);
        else {
          const stack = [];
          for (let q = 1; q < st.n; q++) {
            const sq = (s + q) % st.n, om = gen(st, sq);
            if (!om.length) continue;
            const bm = ranked(st, sq, om, 1)[0][1], bf = bm >> 7, bt = bm & 127;
            stack.push([sq, mk(st, sq, bf, bt), bf, bt]);
          }
          let own = ev(st, s);
          if (level === 'hard') {
            const nx = gen(st, s);
            if (nx.length) own = ranked(st, s, nx, 1)[0][0];
          }
          let oth = 0;
          for (const [sq] of stack) oth += ev(st, sq);
          v = own - (stack.length ? oth / stack.length : 0) * .6;
          while (stack.length) { const [sq, k2, bf, bt] = stack.pop(); un(st, sq, k2, bf, bt); }
        }
        un(st, s, k, f, t);
        if (back(m)) v -= 2.5;
        v += (Math.random() - .5) * (level === 'hard' ? .15 : .9);
        scored.push([v, m]);
        if (v > bestV) { bestV = v; bestM = m; }
        yield;
      }
      return dec(bestM);
    }
    return { N, X, Y, Z, NB, PT, PT_OF, DIST, TIP, HOMES, COUNTS, DIRS, IDX, at, setup, init, clone, reach, path, legal, apply, anyMove, think, standing, ranking, finished, gen, ev, W };
  })();
  const BKE = (() => {
    const SHAPES = [
      ['Mono', [[0, 0]]],
      ['Domino', [[0, 0], [0, 1]]],
      ['I3', [[0, 0], [0, 1], [0, 2]]],
      ['L3', [[0, 0], [1, 0], [1, 1]]],
      ['I4', [[0, 0], [0, 1], [0, 2], [0, 3]]],
      ['O4', [[0, 0], [0, 1], [1, 0], [1, 1]]],
      ['T4', [[0, 0], [0, 1], [0, 2], [1, 1]]],
      ['L4', [[0, 0], [1, 0], [2, 0], [2, 1]]],
      ['Z4', [[0, 0], [0, 1], [1, 1], [1, 2]]],
      ['F', [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]]],
      ['I5', [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]],
      ['L5', [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]]],
      ['N', [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]]],
      ['P', [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]]],
      ['T5', [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]]],
      ['U', [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]]],
      ['V', [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]],
      ['W', [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]],
      ['X', [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]],
      ['Y', [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]]],
      ['Z5', [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]]
    ];
    const norm = cells => {
      const mr = Math.min(...cells.map(c => c[0])), mc = Math.min(...cells.map(c => c[1]));
      return cells.map(([r, c]) => [r - mr, c - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    };
    const rot = cells => norm(cells.map(([r, c]) => [c, -r]));
    const flip = cells => norm(cells.map(([r, c]) => [r, -c]));
    const key = cells => cells.map(c => c.join(',')).join(';');
    const ORI = SHAPES.map(([, cells]) => {
      const seen = new Set(), out = [];
      let cur = norm(cells);
      for (let f = 0; f < 2; f++) {
        for (let r = 0; r < 4; r++) {
          const k = key(cur);
          if (!seen.has(k)) { seen.add(k); out.push(cur); }
          cur = rot(cur);
        }
        cur = flip(cur);
      }
      return out;
    });
    const SIZE = SHAPES.map(s => s[1].length);
    const TOTAL = SIZE.reduce((a, b) => a + b, 0);
    const oriIndex = (p, cells) => { const k = key(norm(cells)); return ORI[p].findIndex(o => key(o) === k); };

    function setup(o) {
      const n = Math.max(2, Math.min(4, +o.n || 2));
      const duo = n === 2 && o.duo === true;
      return { n, duo };
    }
    function init(s) {
      const duo = s.duo, N = duo ? 14 : 20, nc = duo ? 2 : 4, sh = !duo && s.n === 3 ? 3 : -1;
      const own = duo ? [0, 1] : s.n === 2 ? [0, 1, 0, 1] : sh >= 0 ? [0, 1, 2, -1] : [0, 1, 2, 3];
      const start = duo ? [[4, 4], [9, 9]] : [[0, 0], [0, N - 1], [N - 1, N - 1], [N - 1, 0]].slice(0, nc);
      return {
        n: s.n, duo, N, nc, own, start, sh, nn: 0,
        board: new Int8Array(N * N),
        used: Array.from({ length: nc }, () => new Uint8Array(21)),
        left: Array(nc).fill(TOTAL), last: Array(nc).fill(-1), first: Array(nc).fill(true), out: Array(nc).fill(false),
        turn: 0, over: false, count: 0, lastCells: []
      };
    }
    function clone(st) {
      return { ...st, board: st.board.slice(), used: st.used.map(u => u.slice()), left: st.left.slice(), last: st.last.slice(), first: st.first.slice(), out: st.out.slice(), lastCells: st.lastCells.slice() };
    }
    const owner = (st, ci) => ci === st.sh ? st.nn % st.n : st.own[ci];
    const cur = st => owner(st, st.turn);
    function cellsOf(m, N) {
      return ORI[m.p][m.o].map(([r, c]) => [r + m.r, c + m.c]);
    }
    function why(st, ci, cells) {
      const N = st.N, b = st.board, v = ci + 1;
      for (const [r, c] of cells) if (r < 0 || c < 0 || r >= N || c >= N) return 'out';
      for (const [r, c] of cells) if (b[r * N + c]) return 'taken';
      let corner = false;
      for (const [r, c] of cells) {
        if ((r > 0 && b[(r - 1) * N + c] === v) || (r < N - 1 && b[(r + 1) * N + c] === v) || (c > 0 && b[r * N + c - 1] === v) || (c < N - 1 && b[r * N + c + 1] === v)) return 'edge';
        if (!corner) {
          if (st.first[ci]) { if (r === st.start[ci][0] && c === st.start[ci][1]) corner = true; }
          else if ((r > 0 && c > 0 && b[(r - 1) * N + c - 1] === v) || (r > 0 && c < N - 1 && b[(r - 1) * N + c + 1] === v) || (r < N - 1 && c > 0 && b[(r + 1) * N + c - 1] === v) || (r < N - 1 && c < N - 1 && b[(r + 1) * N + c + 1] === v)) corner = true;
        }
      }
      return corner ? '' : (st.first[ci] ? 'start' : 'corner');
    }
    const ok = (st, ci, cells) => why(st, ci, cells) === '';
    function anchors(st, ci) {
      const N = st.N, b = st.board, v = ci + 1, out = [];
      if (st.first[ci]) {
        const [r, c] = st.start[ci];
        if (!b[r * N + c]) out.push(r * N + c);
        return out;
      }
      const seen = new Uint8Array(N * N);
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (b[r * N + c] !== v) continue;
        for (let k = 0; k < 4; k++) {
          const rr = r + (k & 1 ? 1 : -1), cc = c + (k & 2 ? 1 : -1);
          if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
          const i = rr * N + cc;
          if (seen[i] || b[i]) continue;
          seen[i] = 1;
          if ((rr > 0 && b[i - N] === v) || (rr < N - 1 && b[i + N] === v) || (cc > 0 && b[i - 1] === v) || (cc < N - 1 && b[i + 1] === v)) continue;
          out.push(i);
        }
      }
      return out;
    }
    function gen(st, ci, first) {
      const N = st.N, an = anchors(st, ci), out = [], seen = new Set(), used = st.used[ci];
      for (const a of an) {
        const ar = (a / N) | 0, ac = a % N;
        for (let p = 20; p >= 0; p--) {
          if (used[p]) continue;
          const oris = ORI[p];
          for (let o = 0; o < oris.length; o++) {
            const cells = oris[o];
            for (let k = 0; k < cells.length; k++) {
              const r0 = ar - cells[k][0], c0 = ac - cells[k][1];
              const id = ((p * 8 + o) * N + r0) * N + c0;
              if (seen.has(id)) continue;
              seen.add(id);
              const abs = cells.map(([r, c]) => [r + r0, c + c0]);
              if (ok(st, ci, abs)) { out.push({ p, o, r: r0, c: c0 }); if (first) return out; }
            }
          }
        }
      }
      return out;
    }
    const hasMove = (st, ci) => st.left[ci] > 0 && gen(st, ci, true).length > 0;
    function legal(st, m) {
      if (st.over || !m || !(m.p >= 0 && m.p < 21) || st.used[st.turn][m.p] || !ORI[m.p][m.o]) return false;
      if (!Number.isInteger(m.r) || !Number.isInteger(m.c)) return false;
      return ok(st, st.turn, cellsOf(m));
    }
    function advance(st) {
      const passes = [];
      if (st.sh >= 0) {
        let live = false;
        for (let ci = 0; ci < st.nc; ci++) {
          if (ci === st.sh || st.out[ci]) continue;
          if (hasMove(st, ci)) live = true; else { st.out[ci] = true; passes.push(ci); }
        }
        if (!live) { st.over = true; return passes; }
      }
      for (let k = 1; k <= st.nc; k++) {
        const ci = (st.turn + k) % st.nc;
        if (st.out[ci]) continue;
        if (hasMove(st, ci)) { st.turn = ci; return passes; }
        st.out[ci] = true; passes.push(ci);
      }
      st.over = true;
      return passes;
    }
    function place(st, ci, m) {
      const cells = cellsOf(m), N = st.N;
      for (const [r, c] of cells) st.board[r * N + c] = ci + 1;
      st.used[ci][m.p] = 1; st.left[ci] -= SIZE[m.p]; st.last[ci] = m.p; st.first[ci] = false;
      return cells;
    }
    function apply(st, m) {
      const ci = st.turn;
      st.lastCells = place(st, ci, m);
      st.count++;
      const seat = owner(st, ci);
      if (ci === st.sh) st.nn++;
      return { ci, seat, passes: advance(st) };
    }
    function score(st, ci) {
      return st.left[ci] === 0 ? 15 + (st.last[ci] === 0 ? 5 : 0) : -st.left[ci];
    }
    function seatScores(st) {
      const sc = Array(st.n).fill(0), left = Array(st.n).fill(0), pcs = Array(st.n).fill(0);
      for (let ci = 0; ci < st.nc; ci++) { if (ci === st.sh) continue; const s = st.own[ci]; sc[s] += score(st, ci); left[s] += st.left[ci]; pcs[s] += st.used[ci].reduce((a, b) => a + b, 0); }
      return { score: sc, left, pcs };
    }
    function ranking(st) {
      const r = seatScores(st);
      return [...Array(st.n).keys()].sort((a, b) => r.score[b] - r.score[a] || r.left[a] - r.left[b]);
    }

    function ctxOf(st, ci) {
      const seat = owner(st, ci);
      const N = st.N, mask = [], n2 = N * N;
      for (let o = 0; o < st.nc; o++) { const m = new Uint8Array(n2); if (!st.out[o]) for (const i of anchors(st, o)) m[i] = 1; mask.push(m); }
      const adj = new Uint8Array(n2), v = ci + 1, b = st.board;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (b[r * N + c] !== v) continue;
        if (r > 0) adj[(r - 1) * N + c] = 1;
        if (r < N - 1) adj[(r + 1) * N + c] = 1;
        if (c > 0) adj[r * N + c - 1] = 1;
        if (c < N - 1) adj[r * N + c + 1] = 1;
      }
      const placed = TOTAL * st.nc - st.left.reduce((a, x) => a + x, 0);
      return { mask, adj, placed, foes: [...Array(st.nc).keys()].filter(o => o !== st.sh && o !== ci && st.own[o] !== seat) };
    }
    const HW = { size: 3, corner: 1.7, lost: .7, cover: 1.5, centre: .45 };
    function feat(st, ci, m, cx) {
      const N = st.N, b = st.board, cells = cellsOf(m), own = cx.mask[ci], sz = cells.length;
      const inP = new Set(cells.map(([r, c]) => r * N + c));
      let cover = 0, nw = 0, lost = 0, sr = 0, sc = 0;
      const seen = new Set();
      for (const [r, c] of cells) {
        const i = r * N + c;
        sr += r; sc += c;
        for (const o of cx.foes) if (cx.mask[o][i]) cover++;
        if (own[i]) lost++;
        const nbs = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
        for (const [rr, cc] of nbs) {
          if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
          const j = rr * N + cc;
          if (own[j] && !inP.has(j) && !seen.has(j)) { seen.add(j); lost++; }
        }
        for (let k = 0; k < 4; k++) {
          const rr = r + (k & 1 ? 1 : -1), cc = c + (k & 2 ? 1 : -1);
          if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
          const j = rr * N + cc;
          if (b[j] || inP.has(j) || own[j] || cx.adj[j] || seen.has(j)) continue;
          if ((rr > 0 && inP.has(j - N)) || (rr < N - 1 && inP.has(j + N)) || (cc > 0 && inP.has(j - 1)) || (cc < N - 1 && inP.has(j + 1))) continue;
          seen.add(j); nw++;
        }
      }
      const mid = (N - 1) / 2, dist = Math.hypot(sr / sz - mid, sc / sz - mid) / mid;
      const phase = Math.max(0, 1 - cx.placed / 70);
      return HW.size * sz + HW.corner * nw - HW.lost * lost + HW.cover * cover - HW.centre * 10 * dist * phase * (sz > 1 ? 1 : 0);
    }
    function* think(st, level) {
      const ci = st.turn, moves = gen(st, ci);
      if (!moves.length) return null;
      if (level === 'easy') {
        const w = moves.map(m => Math.pow(SIZE[m.p], 1.5) * (.4 + Math.random()));
        let bi = 0;
        for (let i = 1; i < w.length; i++) if (w[i] > w[bi]) bi = i;
        return moves[bi];
      }
      const cx = ctxOf(st, ci);
      const sc = [];
      for (let i = 0; i < moves.length; i++) {
        sc.push([feat(st, ci, moves[i], cx) + (Math.random() - .5) * (level === 'hard' ? .2 : 1.4), moves[i]]);
        if ((i & 63) === 63) yield;
      }
      sc.sort((a, b) => b[0] - a[0]);
      if (level !== 'hard' || sc.length < 2) return sc[0][1];
      const K = Math.min(5, sc.length);
      let best = sc[0][1], bv = -Infinity;
      for (let k = 0; k < K; k++) {
        const m = sc[k][1], t = clone(st);
        place(t, ci, m);
        let worst = 0;
        for (const o of cx.foes.slice(0, 3)) {
          if (t.out[o] || t.left[o] === 0) continue;
          const om = gen(t, o);
          if (!om.length) continue;
          const ocx = ctxOf(t, o);
          let mxv = -Infinity;
          for (const mm of om) { const v = feat(t, o, mm, ocx); if (v > mxv) mxv = v; }
          worst += mxv;
          yield;
        }
        const v = sc[k][0] - .3 * worst / Math.max(1, cx.foes.length);
        if (v > bv) { bv = v; best = m; }
      }
      return best;
    }
    return { SHAPES, ORI, SIZE, TOTAL, norm, rot, flip, oriIndex, setup, init, clone, cur, owner, cellsOf, why, ok, anchors, gen, hasMove, legal, apply, place, score, seatScores, ranking, think, HW };
  })();
  const QDE = (() => {
    const SZ = 9;
    const STARTS = [[8, 4], [0, 4], [4, 0], [4, 8]];
    const SIDES = ['bottom', 'top', 'left', 'right'];
    const ORDER = { 2: [0, 1], 3: [0, 2, 1], 4: [0, 2, 1, 3] };
    const WALLS = { 2: 10, 3: 6, 4: 5 };
    const DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1];

    function setup(o) {
      const n = Math.max(2, Math.min(4, +o.n || 2));
      return { n };
    }
    function init(s) {
      const sides = ORDER[s.n];
      return {
        n: s.n, side: sides, pos: sides.map(k => STARTS[k].slice()), walls: Array(s.n).fill(WALLS[s.n]),
        hw: new Uint8Array(64), vw: new Uint8Array(64), turn: 0, over: false, winner: -1, count: 0, last: null
      };
    }
    function clone(st) {
      return { ...st, pos: st.pos.map(p => p.slice()), walls: st.walls.slice(), hw: st.hw.slice(), vw: st.vw.slice() };
    }
    function blocked(st, r, c, d) {
      const nr = r + DR[d], nc = c + DC[d];
      if (nr < 0 || nc < 0 || nr >= SZ || nc >= SZ) return true;
      const { hw, vw } = st;
      if (d === 0) return (c > 0 && hw[(r - 1) * 8 + c - 1] === 1) || (c < 8 && hw[(r - 1) * 8 + c] === 1);
      if (d === 1) return (c > 0 && hw[r * 8 + c - 1] === 1) || (c < 8 && hw[r * 8 + c] === 1);
      if (d === 2) return (r > 0 && vw[(r - 1) * 8 + c - 1] === 1) || (r < 8 && vw[r * 8 + c - 1] === 1);
      return (r > 0 && vw[(r - 1) * 8 + c] === 1) || (r < 8 && vw[r * 8 + c] === 1);
    }
    const goalAt = (st, s, r, c) => {
      const k = st.side[s];
      return k === 0 ? r === 0 : k === 1 ? r === 8 : k === 2 ? c === 8 : c === 0;
    };
    function occupied(st, r, c) {
      for (let i = 0; i < st.n; i++) if (st.pos[i][0] === r && st.pos[i][1] === c) return true;
      return false;
    }
    function moves(st, s) {
      const [r, c] = st.pos[s], out = [];
      for (let d = 0; d < 4; d++) {
        if (blocked(st, r, c, d)) continue;
        const nr = r + DR[d], nc = c + DC[d];
        if (!occupied(st, nr, nc)) { out.push([nr, nc]); continue; }
        if (!blocked(st, nr, nc, d) && !occupied(st, nr + DR[d], nc + DC[d])) { out.push([nr + DR[d], nc + DC[d]]); continue; }
        for (const e of d < 2 ? [2, 3] : [0, 1]) {
          if (blocked(st, nr, nc, e)) continue;
          const kr = nr + DR[e], kc = nc + DC[e];
          if (!occupied(st, kr, kc)) out.push([kr, kc]);
        }
      }
      return out;
    }
    const dq = new Int16Array(81), dd = new Int16Array(81);
    function dist(st, s, from) {
      const [sr, sc] = from || st.pos[s], seen = new Uint8Array(81);
      let h = 0, t = 0;
      dq[t] = sr * 9 + sc; dd[t++] = 0; seen[sr * 9 + sc] = 1;
      while (h < t) {
        const i = dq[h], d0 = dd[h++], r = (i / 9) | 0, c = i % 9;
        if (goalAt(st, s, r, c)) return d0;
        for (let d = 0; d < 4; d++) {
          if (blocked(st, r, c, d)) continue;
          const j = (r + DR[d]) * 9 + c + DC[d];
          if (seen[j]) continue;
          seen[j] = 1; dq[t] = j; dd[t++] = d0 + 1;
        }
      }
      return -1;
    }
    function pathOf(st, s) {
      const [sr, sc] = st.pos[s], seen = new Int16Array(81).fill(-1), q = [sr * 9 + sc];
      seen[q[0]] = q[0];
      for (let h = 0; h < q.length; h++) {
        const i = q[h], r = (i / 9) | 0, c = i % 9;
        if (goalAt(st, s, r, c)) {
          const p = [[r, c]];
          let x = i;
          while (seen[x] !== x) { x = seen[x]; p.unshift([(x / 9) | 0, x % 9]); }
          return p;
        }
        for (let d = 0; d < 4; d++) {
          if (blocked(st, r, c, d)) continue;
          const j = (r + DR[d]) * 9 + c + DC[d];
          if (seen[j] >= 0) continue;
          seen[j] = i; q.push(j);
        }
      }
      return [];
    }
    function wallFree(st, h, r, c) {
      if (r < 0 || c < 0 || r > 7 || c > 7) return false;
      const i = r * 8 + c;
      if (h) return !st.hw[i] && !st.vw[i] && !(c > 0 && st.hw[i - 1]) && !(c < 7 && st.hw[i + 1]);
      return !st.vw[i] && !st.hw[i] && !(r > 0 && st.vw[i - 8]) && !(r < 7 && st.vw[i + 8]);
    }
    function wallOk(st, s, h, r, c) {
      if (!wallFree(st, h, r, c)) return false;
      const a = h ? st.hw : st.vw;
      a[r * 8 + c] = 1;
      let ok = true;
      for (let i = 0; i < st.n && ok; i++) if (dist(st, i) < 0) ok = false;
      a[r * 8 + c] = 0;
      return ok;
    }
    function why(st, s, h, r, c) {
      if (st.walls[s] <= 0) return 'none';
      if (r < 0 || c < 0 || r > 7 || c > 7) return 'out';
      if (!wallFree(st, h, r, c)) return 'overlap';
      return wallOk(st, s, h, r, c) ? '' : 'block';
    }
    function legal(st, m) {
      if (st.over || !m) return false;
      const s = st.turn;
      if (m.w) return st.walls[s] > 0 && (m.w === 'h' || m.w === 'v') && Number.isInteger(m.r) && Number.isInteger(m.c) && wallOk(st, s, m.w === 'h', m.r, m.c);
      return Number.isInteger(m.r) && Number.isInteger(m.c) && moves(st, s).some(x => x[0] === m.r && x[1] === m.c);
    }
    function apply(st, m) {
      const s = st.turn;
      if (m.w) {
        (m.w === 'h' ? st.hw : st.vw)[m.r * 8 + m.c] = 1;
        st.walls[s]--;
      } else {
        st.pos[s] = [m.r, m.c];
        if (goalAt(st, s, m.r, m.c)) { st.over = true; st.winner = s; }
      }
      st.count++; st.last = m;
      if (!st.over) st.turn = (s + 1) % st.n;
      return { passes: [] };
    }
    function allWalls(st) {
      const out = [];
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        if (wallFree(st, true, r, c)) out.push({ w: 'h', r, c });
        if (wallFree(st, false, r, c)) out.push({ w: 'v', r, c });
      }
      return out;
    }
    function candWalls(st, s) {
      const near = new Uint8Array(64), cand = [];
      for (let o = 0; o < st.n; o++) {
        if (o === s) continue;
        const p = pathOf(st, o);
        for (let i = 0; i < Math.min(p.length, 6); i++) {
          const [r, c] = p[i];
          for (let dr = -1; dr <= 0; dr++) for (let dc = -1; dc <= 0; dc++) {
            const rr = r + dr, cc = c + dc;
            if (rr >= 0 && cc >= 0 && rr < 8 && cc < 8) near[rr * 8 + cc] = 1;
          }
        }
      }
      for (let i = 0; i < 64; i++) {
        if (!near[i]) continue;
        const r = (i / 8) | 0, c = i % 8;
        if (wallFree(st, true, r, c)) cand.push({ w: 'h', r, c });
        if (wallFree(st, false, r, c)) cand.push({ w: 'v', r, c });
      }
      return cand;
    }
    function evalFor(st, s) {
      const ds = dist(st, s);
      let mn = 99, sum = 0;
      for (let o = 0; o < st.n; o++) {
        if (o === s) continue;
        const d = dist(st, o);
        sum += d; if (d < mn) mn = d;
      }
      const oth = sum / (st.n - 1);
      let wl = st.walls[s];
      let ow = 0;
      for (let o = 0; o < st.n; o++) if (o !== s) ow += st.walls[o];
      return (st.n === 2 ? oth : .6 * mn + .4 * oth) * 1.0 - ds * 1.15 + .12 * (wl - ow / (st.n - 1));
    }
    function options(st, s, wallCap) {
      const out = [];
      for (const [r, c] of moves(st, s)) out.push({ r, c });
      if (st.walls[s] > 0) {
        let cand = candWalls(st, s);
        const base = [];
        for (const w of cand) {
          if (!wallOk(st, s, w.w === 'h', w.r, w.c)) continue;
          base.push(w);
        }
        out.push(...base);
      }
      return out;
    }
    function tryApply(st, s, m) {
      const sv = { pos: st.pos[s], walls: st.walls[s], turn: st.turn, over: st.over, winner: st.winner };
      if (m.w) { (m.w === 'h' ? st.hw : st.vw)[m.r * 8 + m.c] = 1; st.walls[s]--; }
      else { st.pos[s] = [m.r, m.c]; if (goalAt(st, s, m.r, m.c)) { st.over = true; st.winner = s; } }
      return sv;
    }
    function untry(st, s, m, sv) {
      if (m.w) (m.w === 'h' ? st.hw : st.vw)[m.r * 8 + m.c] = 0;
      st.pos[s] = sv.pos; st.walls[s] = sv.walls; st.turn = sv.turn; st.over = sv.over; st.winner = sv.winner;
    }
    function valueAfter(st, s, m) {
      const sv = tryApply(st, s, m);
      const v = st.over ? 1e3 : evalFor(st, s);
      untry(st, s, m, sv);
      return v;
    }
    function* think(st, level) {
      const s = st.turn, n = st.n;
      const opts = options(st, s);
      if (!opts.length) return null;
      const mv = opts.filter(o => !o.w);
      if (level === 'easy') {
        const dme = dist(st, s);
        const best = mv.map(m => [dist(st, s, [m.r, m.c]), m]).sort((a, b) => a[0] - b[0]);
        if (Math.random() < .25 && st.walls[s] > 0 && opts.length > mv.length) {
          const ws = opts.filter(o => o.w);
          return ws[Math.random() * ws.length | 0];
        }
        if (Math.random() < .1) return mv[Math.random() * mv.length | 0];
        return best.length ? best[0][1] : opts[0];
      }
      const sc = [];
      for (let i = 0; i < opts.length; i++) {
        sc.push([valueAfter(st, s, opts[i]) + Math.random() * .02, opts[i]]);
        if ((i & 15) === 15) yield;
      }
      sc.sort((a, b) => b[0] - a[0]);
      if (level === 'normal' || sc.length === 1) {
        const top = sc[0];
        if (level === 'normal' && n === 2 && Math.random() < .12) {
          const m2 = sc.filter(x => !x[1].w);
          if (m2.length) return m2[0][1];
        }
        return top[1];
      }
      const K = Math.min(n === 2 ? 10 : 6, sc.length);
      let best = sc[0][1], bv = -Infinity;
      for (let k = 0; k < K; k++) {
        const m = sc[k][1], sv = tryApply(st, s, m);
        let v;
        if (st.over) v = 1e3;
        else if (n === 2) {
          st.turn = 1 - s;
          v = -nmq(st, 1 - s, level === 'hard' ? 3 : 1, -Infinity, Infinity);
        } else {
          const stack = [];
          for (let q = 1; q < n; q++) {
            const o = (s + q) % n;
            st.turn = o;
            const oo = options(st, o);
            let bo = null, bvv = -Infinity;
            for (const x of oo) { const vv = valueAfter(st, o, x); if (vv > bvv) { bvv = vv; bo = x; } }
            if (!bo) continue;
            const sv2 = tryApply(st, o, bo);
            stack.push([o, bo, sv2]);
            if (st.over) break;
          }
          v = st.over && st.winner !== s ? -1e3 : evalFor(st, s);
          while (stack.length) { const [o, bo, sv2] = stack.pop(); untry(st, o, bo, sv2); }
        }
        untry(st, s, m, sv);
        v += Math.random() * .02;
        if (v > bv) { bv = v; best = m; }
        yield;
      }
      return best;
    }
    function nmq(st, s, d, al, be) {
      if (st.over) return st.winner === s ? 1e3 + d : -1e3 - d;
      if (d === 0) return evalFor(st, s);
      const opts = options(st, s);
      if (!opts.length) return evalFor(st, s);
      const sc = opts.map(o => [valueAfter(st, s, o), o]).sort((a, b) => b[0] - a[0]).slice(0, d >= 2 ? 8 : 6);
      let best = -Infinity;
      for (const [, m] of sc) {
        const sv = tryApply(st, s, m);
        st.turn = 1 - s;
        const v = -nmq(st, 1 - s, d - 1, -be, -al);
        untry(st, s, m, sv);
        if (v > best) best = v;
        if (v > al) al = v;
        if (al >= be) break;
      }
      return best;
    }
    return { SZ, STARTS, SIDES, ORDER, WALLS, setup, init, clone, blocked, moves, dist, pathOf, wallFree, wallOk, why, legal, apply, allWalls, think, evalFor, goalAt, occupied };
  })();

  const MCOL = [['Red', '#e03432'], ['Blue', '#2079dc'], ['Yellow', '#f4c40c'], ['Green', '#27a755'], ['Black', '#35343f'], ['White', '#f3f3f6']];
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const mixc = (hex, to, t) => { const a = rgb(hex); return `rgb(${a.map(v => Math.round(v + (to - v) * t)).join(',')})`; };
  const rgba = (hex, al) => `rgba(${rgb(hex).join(',')},${al})`;
  const rng32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  const CC_RULES = `<ul>
<li>Move all 10 of your marbles across the star into the opposite triangle before anyone else does.</li>
<li>On your turn move one marble: either one step into a neighbouring hole, or jump over an adjacent marble (yours or anyone's) into the empty hole behind it. You can chain jumps in one turn and stop whenever you like. Steps and jumps cannot be mixed.</li>
<li>Pick a marble, the holes it can reach light up; hover or drag over one to see the exact path.</li>
<li>2 players use opposite corners, 3 players every second corner, 4 players two opposite pairs, 6 players all corners.</li>
<li>No-blocking rule: if you only fail to finish because an opponent keeps a few marbles in their home triangle (your target), you win once every other hole of it is yours.</li>
</ul>`;

  Ameplay.register({
    id: 'chinese-checkers',
    title: 'Chinese Checkers',
    category: 'Board',
    tint: '#c98a4b',
    blurb: 'Race ten glass marbles across the star with chained jumps. Play 2 to 6 players against bots or online.',
    help: 'Click a marble, then a lit hole · drag a marble onto a lit hole · hover to preview the jump path · arrows move the cursor, <kbd>Enter</kbd> selects',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 920,
    engine: { CCE },
    icon: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 4l10 18h20L52 38l10 18H42L32 60 22 56H2L12 38 2 22h20z" opacity=".22"/><circle cx="32" cy="14" r="4"/><circle cx="26" cy="24" r="4"/><circle cx="38" cy="24" r="4"/><circle cx="32" cy="34" r="4"/><circle cx="20" cy="34" r="4"/><circle cx="44" cy="34" r="4"/><circle cx="26" cy="44" r="4"/><circle cx="38" cy="44" r="4"/><circle cx="32" cy="54" r="4"/></svg>',
    css: kitCss('.gm-chinese-checkers') + `
.gm-chinese-checkers .gk-board canvas{border-radius:18px;background:transparent}
`,
    mount(root, api) {
      const W = 640, HT = 720, D = 44, CX = W / 2, CY = HT / 2 + 2, RM = 19, PAD = 7;
      const snd = sounds(api);
      const K = mountKit(root, api, {
        title: 'Chinese Checkers', kicker: 'Board game', rules: CC_RULES,
        blurb: 'Race your ten marbles across the star. Chain jumps to get there first.',
        opts: [
          { key: 'n', label: 'Players vs bots', vals: [[2, '2'], [3, '3'], [4, '4'], [6, '6']], def: 2 },
          { key: 'level', label: 'Bot level', vals: LEVELS, def: 'normal' },
          { key: 'nb', label: 'No-blocking rule', vals: [['off', 'Off'], ['on', 'On']], def: 'off' }
        ]
      });
      const cv = api.canvas(W, HT, K.board), ctx = cv.ctx, cvs = cv.canvas;
      const G = {
        setup: CCE.setup, init: CCE.init, clone: CCE.clone, legal: CCE.legal, apply: CCE.apply, anyMove: CCE.anyMove, think: CCE.think,
        cur: st => st.turn,
        seatCount: (hum, size, bots) => { const want = bots ? Math.max(size, hum) : hum; return CCE.COUNTS.find(c => c >= want) || 6; }
      };
      const cfg = () => ({ n: K.opt.n, level: K.opt.level, nb: K.opt.nb === 'on' });
      let S = CCE.init(CCE.setup({ n: 2 })), me = 0, rot = 0, bg = null, dirty = true;
      const sx = new Float32Array(CCE.N), sy = new Float32Array(CCE.N);
      let sel = -1, dests = [], par = null, hov = -1, prev = null, kc = -1, kbd = false, drag = null, tchPrev = -1;
      let anim = null, parts = [], streak = 0, pendingOver = false, shown = false, trail = null, T = null;
      const spr = MCOL.map(([, c]) => marbleSprite(c));

      function marbleSprite(col) {
        const sz = (RM + PAD) * 2, k = 2, c = document.createElement('canvas');
        c.width = c.height = sz * k;
        const g = c.getContext('2d');
        g.scale(k, k);
        const cx = sz / 2, cy = sz / 2 - 1;
        g.shadowColor = 'rgba(50,25,5,.5)'; g.shadowBlur = 6; g.shadowOffsetY = 4;
        g.fillStyle = col; g.beginPath(); g.arc(cx, cy, RM, 0, 7); g.fill();
        g.shadowColor = 'transparent';
        let gr = g.createRadialGradient(cx - RM * .3, cy - RM * .36, RM * .08, cx, cy, RM);
        gr.addColorStop(0, mixc(col, 255, .62)); gr.addColorStop(.32, mixc(col, 255, .14)); gr.addColorStop(.72, col); gr.addColorStop(1, mixc(col, 0, .52));
        g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, RM, 0, 7); g.fill();
        gr = g.createRadialGradient(cx + RM * .34, cy + RM * .42, 0, cx + RM * .34, cy + RM * .42, RM * .7);
        gr.addColorStop(0, 'rgba(255,255,255,.34)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.save(); g.beginPath(); g.arc(cx, cy, RM, 0, 7); g.clip(); g.fillStyle = gr; g.fillRect(0, 0, sz, sz); g.restore();
        g.save(); g.translate(cx - RM * .34, cy - RM * .42); g.rotate(-.62);
        gr = g.createLinearGradient(0, -RM * .22, 0, RM * .22);
        gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,.12)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, RM * .34, RM * .2, 0, 0, 7); g.fill(); g.restore();
        g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(cx + RM * .42, cy + RM * .46, RM * .07, 0, 7); g.fill();
        g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, RM - .4, 0, 7); g.stroke();
        return c;
      }
      const drawMarble = (seat, x, y, sc, al) => {
        const r = (RM + PAD) * (sc || 1);
        if (al != null) ctx.globalAlpha = al;
        ctx.drawImage(spr[seat], x - r, y - r, r * 2, r * 2);
        if (al != null) ctx.globalAlpha = 1;
      };

      function layout() {
        me = Math.max(0, T ? T.me : 0);
        rot = ((3 - S.home[me]) % 6 + 6) % 6;
        for (let i = 0; i < CCE.N; i++) {
          let x = CCE.X[i], y = CCE.Y[i], z = CCE.Z[i];
          for (let k = 0; k < rot; k++) [x, y, z] = [-z, -x, -y];
          sx[i] = CX + D * (x + z / 2); sy[i] = CY + D * .8660254 * z;
        }
        buildBg();
      }
      const corner = (x, y, z) => { for (let k = 0; k < rot; k++) [x, y, z] = [-z, -x, -y]; return [CX + D * (x + z / 2), CY + D * .8660254 * z]; };
      function buildBg() {
        const k = 2, c = document.createElement('canvas');
        c.width = W * k; c.height = HT * k;
        const g = c.getContext('2d');
        g.scale(k, k);
        const tri = (a) => { g.beginPath(); a.forEach(([x, y, z], i) => { const [px, py] = corner(x, y, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); };
        const T1 = [[8, -4, -4], [-4, 8, -4], [-4, -4, 8]], T2 = [[-8, 4, 4], [4, -8, 4], [4, 4, -8]], m = D * .98;
        const body = (lw, style) => { g.lineJoin = 'round'; g.lineWidth = lw; g.strokeStyle = style; g.fillStyle = style; for (const t of [T1, T2]) { tri(t); g.fill(); g.stroke(); } };
        g.save(); g.shadowColor = 'rgba(40,22,6,.45)'; g.shadowBlur = 26; g.shadowOffsetY = 12; body(m * 2 + 14, '#75451d'); g.restore();
        body(m * 2 + 6, '#8d5726');
        const wood = g.createLinearGradient(0, 0, W, HT);
        wood.addColorStop(0, '#e7bb7e'); wood.addColorStop(.5, '#d4a161'); wood.addColorStop(1, '#c58c4b');
        body(m * 2, wood);
        g.save();
        g.beginPath(); for (const t of [T1, T2]) { t.forEach(([x, y, z], i) => { const [px, py] = corner(x, y, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); }
        g.lineJoin = 'round'; g.lineWidth = m * 2; g.strokeStyle = 'rgba(0,0,0,0)';
        const clipP = new Path2D();
        const circ = (x, y, r) => { clipP.moveTo(x + r, y); clipP.arc(x, y, r, 0, 7); };
        for (let i = 0; i < CCE.N; i++) circ(sx[i], sy[i], D * .86);
        g.clip(clipP);
        const rg = rng32(7);
        for (let i = 0; i < 90; i++) {
          const y0 = rg() * HT, amp = 2 + rg() * 6, ph = rg() * 6, fr = .004 + rg() * .01;
          g.strokeStyle = `rgba(${rg() < .5 ? '110,62,18' : '255,230,180'},${.05 + rg() * .07})`;
          g.lineWidth = .6 + rg() * 1.6;
          g.beginPath();
          for (let x = 0; x <= W; x += 14) { const y = y0 + Math.sin(x * fr + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); }
          g.stroke();
        }
        g.restore();
        const homes = new Map(S.home.map((kk, si) => [kk, si]));
        for (let i = 0; i < CCE.N; i++) {
          const kk = CCE.PT_OF[i], seat = kk >= 0 ? homes.get(kk) : undefined, goalSeat = kk >= 0 ? S.goal.indexOf(kk) : -1;
          const own = seat !== undefined ? seat : goalSeat;
          if (kk >= 0 && own >= 0 && seat !== undefined) {
            const grd = g.createRadialGradient(sx[i], sy[i], 0, sx[i], sy[i], D * .6);
            grd.addColorStop(0, rgba(MCOL[seat][1], .5)); grd.addColorStop(1, rgba(MCOL[seat][1], 0));
            g.fillStyle = grd; g.beginPath(); g.arc(sx[i], sy[i], D * .6, 0, 7); g.fill();
          }
          const rh = D * .39;
          g.fillStyle = 'rgba(255,238,205,.45)'; g.beginPath(); g.arc(sx[i], sy[i] + 1.4, rh + 1.2, 0, 7); g.fill();
          const hg = g.createRadialGradient(sx[i] - rh * .25, sy[i] - rh * .3, rh * .1, sx[i], sy[i], rh);
          hg.addColorStop(0, '#4a2b0f'); hg.addColorStop(.7, '#6b4019'); hg.addColorStop(1, '#8a5a2b');
          g.fillStyle = hg; g.beginPath(); g.arc(sx[i], sy[i], rh, 0, 7); g.fill();
          g.strokeStyle = 'rgba(50,26,6,.55)'; g.lineWidth = 1.4; g.stroke();
          if (seat !== undefined) { g.strokeStyle = rgba(MCOL[seat][1], .85); g.lineWidth = 2; g.beginPath(); g.arc(sx[i], sy[i], rh + 2.4, 0, 7); g.stroke(); }
        }
        bg = c;
      }
      const hit = (px, py, r) => {
        let b = -1, bd = (r || D * .62) ** 2;
        for (let i = 0; i < CCE.N; i++) { const d = (sx[i] - px) ** 2 + (sy[i] - py) ** 2; if (d < bd) { bd = d; b = i; } }
        return b;
      };
      const pathFor = (st, seat, m) => {
        st.board[m.t] = 0; st.board[m.f] = seat + 1;
        const r = CCE.reach(st, m.f), p = CCE.path(m.f, m.t, r.par);
        st.board[m.f] = 0; st.board[m.t] = seat + 1;
        return p;
      };
      const myTurn = () => T && T.mine() && !anim;
      function select(c) {
        sel = c; par = null; dests = []; prev = null; hov = -1; tchPrev = -1;
        if (c >= 0) { const r = CCE.reach(S, c); dests = r.dest; par = r.par; snd.pop(); }
        updateStatus(); dirty = true;
      }
      function tryMove(to) {
        const m = { f: sel, t: to };
        if (!T.submit(m)) return false;
        sel = -1; dests = []; prev = null; hov = -1; tchPrev = -1; drag = null;
        return true;
      }
      function onDown(e) {
        kbd = false;
        if (!T) return;
        const p = cv.toLocal(e);
        if (!myTurn()) return;
        const c = hit(p.x, p.y);
        if (c < 0) { if (sel >= 0) select(-1); return; }
        if (S.board[c] === me + 1) {
          if (c === sel && e.pointerType === 'mouse') { select(-1); return; }
          select(c);
          drag = { c, x0: p.x, y0: p.y, x: p.x, y: p.y, moved: false, id: e.pointerId };
          try { cvs.setPointerCapture(e.pointerId); } catch (x) {}
          return;
        }
        if (sel >= 0 && dests.includes(c)) {
          const p2 = CCE.path(sel, c, par);
          if (e.pointerType !== 'mouse' && p2.length > 2 && tchPrev !== c) { tchPrev = c; prev = p2; hov = c; updateStatus(); dirty = true; return; }
          tryMove(c);
        } else if (sel >= 0) select(-1);
      }
      function onMove(e) {
        const p = cv.toLocal(e);
        if (drag && e.pointerId === drag.id) {
          drag.x = p.x; drag.y = p.y;
          if (!drag.moved && Math.hypot(p.x - drag.x0, p.y - drag.y0) > 7) drag.moved = true;
          if (drag.moved) {
            const c = hit(p.x, p.y, D * .7);
            hov = c >= 0 && dests.includes(c) ? c : -1;
            prev = hov >= 0 ? CCE.path(sel, hov, par) : null;
            updateStatus(); dirty = true;
          }
          return;
        }
        if (sel >= 0 && e.pointerType === 'mouse' && myTurn()) {
          const c = hit(p.x, p.y);
          const nh = c >= 0 && dests.includes(c) ? c : -1;
          if (nh !== hov) { hov = nh; prev = nh >= 0 ? CCE.path(sel, nh, par) : null; updateStatus(); dirty = true; }
          cvs.style.cursor = nh >= 0 || (c >= 0 && S.board[c] === me + 1) ? 'pointer' : '';
        } else if (e.pointerType === 'mouse' && myTurn()) {
          const c = hit(p.x, p.y);
          cvs.style.cursor = c >= 0 && S.board[c] === me + 1 ? 'pointer' : '';
        }
      }
      function onUp(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        try { cvs.releasePointerCapture(e.pointerId); } catch (x) {}
        if (d.moved) {
          const c = hit(d.x, d.y, D * .7);
          if (c >= 0 && dests.includes(c) && myTurn()) tryMove(c);
          else { prev = null; hov = -1; updateStatus(); }
        }
        dirty = true;
      }
      api.on(cvs, 'pointerdown', onDown);
      api.on(cvs, 'pointermove', onMove);
      api.on(cvs, 'pointerup', onUp);
      api.on(cvs, 'pointercancel', onUp);
      api.on(cvs, 'pointerleave', () => { if (!drag && hov >= 0 && sel >= 0) { hov = -1; prev = null; updateStatus(); dirty = true; } });
      api.on(cvs, 'contextmenu', e => e.preventDefault());

      const NAV = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      api.on(window, 'keydown', e => {
        if (!T || !T.state || e.target.closest && e.target.closest('input,textarea')) return;
        if (NAV[e.key] && myTurn()) {
          e.preventDefault(); kbd = true;
          if (kc < 0) { kc = sel >= 0 ? sel : S.pos[me][0]; dirty = true; snd.tick(0); return; }
          const [dx, dy] = NAV[e.key];
          let b = -1, bs = 1e9;
          for (let j = 0; j < CCE.N; j++) {
            if (j === kc) continue;
            const vx = sx[j] - sx[kc], vy = sy[j] - sy[kc], len = Math.hypot(vx, vy);
            if (len > D * 3.2) continue;
            const cs = (vx * dx + vy * dy) / len;
            if (cs < .72) continue;
            const sc = len * (1.5 - cs);
            if (sc < bs) { bs = sc; b = j; }
          }
          if (b >= 0) { kc = b; if (sel >= 0 && dests.includes(kc)) { hov = kc; prev = CCE.path(sel, kc, par); } else { hov = -1; prev = null; } updateStatus(); dirty = true; snd.step(); }
        } else if ((e.key === 'Enter' || e.key === ' ') && myTurn() && kc >= 0) {
          e.preventDefault(); kbd = true;
          if (S.board[kc] === me + 1) select(kc === sel ? -1 : kc);
          else if (sel >= 0 && dests.includes(kc)) tryMove(kc);
        } else if (e.key === 'Backspace' && sel >= 0) select(-1);
        else if (e.key === 'Tab' && myTurn() && kbd) {
          e.preventDefault();
          const mine = S.pos[me], i = mine.indexOf(kc);
          kc = mine[(i + 1) % mine.length]; dirty = true;
        }
      });

      function chips() {
        if (!T || !T.state) { K.setChips([]); return; }
        const cur = S.over ? -1 : S.turn;
        K.setChips(S.pos.map((_, s) => {
          const st = CCE.standing(S, s), seat = T.seats[s] || {};
          const far = initialSum(s);
          const prog = clamp(1 - (st.d - 20) / Math.max(1, far - 20), 0, 1);
          return { name: (seat.name || 'Player') + (seat.kind === 'me' && T.mode !== 'solo' ? ' (you)' : ''), color: MCOL[s][1], on: s === cur, think: s === cur && seat.kind === 'bot' && !S.over, info: `${st.k}/10 home${S.done.includes(s) ? ' <em>finished</em>' : ''}`, bar: prog, off: false };
        }));
      }
      const initSum = {};
      function initialSum(s) { const g = S.goal[s]; return initSum[g] || (initSum[g] = CCE.PT[(g + 3) % 6].reduce((a, c) => a + CCE.DIST[g][c], 0)); }
      function updateStatus() {
        if (!T || !T.state) return;
        if (S.over) {
          const w = S.winner;
          K.status(w < 0 ? 'No one can move' : (w === me ? 'You win!' : (T.seats[w].name + ' wins')), w === me ? 'good' : 'bad');
          return;
        }
        const s = S.turn, seat = T.seats[s];
        if (seat.kind === 'me') {
          if (T.pending) return K.status('Sending move…', '');
          if (anim) return K.status('', '');
          if (prev && prev.length > 1) {
            const hops = prev.length - 1, step = hops === 1 && CCE.NB.subarray(prev[0] * 6, prev[0] * 6 + 6).includes(prev[1]);
            return K.status(step ? 'Step here' : `Jump chain · ${hops} ${hops === 1 ? 'hop' : 'hops'}` + (tchPrev >= 0 ? ' · tap again to move' : ''), 'turn');
          }
          K.status(sel >= 0 ? 'Choose a lit hole' : 'Your move', 'turn');
        } else K.status(seat.kind === 'bot' ? `${seat.name} is thinking…` : `Waiting for ${seat.name}…`, '');
      }
      function buttons() {
        if (!T || T.mode === 'idle') return K.setBtns([['menu', 'Menu']]);
        if (T.mode === 'solo') return K.setBtns([['menu', 'Menu'], ['again', 'New game', 'g-btn']]);
        if (T.mode === 'host') return K.setBtns([['lobby', 'Lobby'], ['again', 'Rematch', 'g-btn', !S.over]]);
        K.setBtns([['leave', 'Leave'], T.over ? ['ask', 'Ask rematch', 'g-btn'] : null]);
      }
      K.onBtn = id => {
        if (id === 'menu') { T.leave(); K.showMenu(true); api.hideOverlay(); }
        else if (id === 'again') T.again();
        else if (id === 'lobby') T.online();
        else if (id === 'leave') { T.leave(); K.showMenu(true); K.netText(null); api.hideOverlay(); }
        else if (id === 'ask') api.net.send({ t: 'rq' });
      };
      K.onStart = mode => {
        K.showMenu(false);
        if (mode === 'solo') T.solo(cfg());
        else T.online();
      };

      function startAnim(seat, path, mine) {
        const hop = mine ? 175 : 135;
        anim = { seat, path, t0: performance.now(), hop, end: performance.now() + hop * (path.length - 1) + 120, to: path[path.length - 1], last: 0 };
        dirty = true;
      }
      function winFx(seat) {
        parts = [];
        const cells = CCE.PT[S.goal[seat]];
        for (let i = 0; i < 44; i++) {
          const c = cells[i % cells.length];
          parts.push({ x: sx[c], y: sy[c], vx: (Math.random() - .5) * 340, vy: -200 - Math.random() * 380, s: i % S.n, r: .45 + Math.random() * .4, t: 0 });
        }
      }
      function showEnd() {
        if (shown || !T || !T.state) return;
        shown = true;
        const rk = CCE.ranking(S), w = S.winner, mineWin = w === me;
        if (T.mode === 'solo') { if (mineWin) { streak++; api.submit(streak); } else streak = 0; api.score(streak); }
        if (w >= 0) winFx(w);
        snd[mineWin ? 'win' : 'lose']();
        const list = rk.map((r, i) => `${i + 1}. ${esc(T.seats[r.s].name)}${r.s === me && T.mode !== 'solo' ? ' (you)' : ''} · ${r.k}/10 home`).join('<br>');
        const host = T.mode === 'host', guest = T.mode === 'guest';
        api.timeout(() => {
          if (!T || !T.over) return;
          api.overlay({
            kicker: mineWin ? 'Victory' : 'Game over',
            title: w < 0 ? 'Stalemate' : mineWin ? 'You win!' : esc(T.seats[w].name) + ' wins',
            text: list,
            button: host || T.mode === 'solo' ? (host ? 'Rematch' : 'Play again') : 'Ask rematch',
            onAction: () => { if (guest) api.net.send({ t: 'rq' }); else T.again(); },
            secondary: host ? 'Lobby' : guest ? 'Leave' : 'Menu',
            onSecondary: () => { if (host) T.online(); else { T.leave(); K.showMenu(true); K.netText(null); } }
          });
        }, 650);
      }
      const hooks = {
        begin(t) {
          T = t; S = t.state; anim = null; sel = -1; dests = []; prev = null; hov = -1; tchPrev = -1; drag = null; parts = []; pendingOver = false; shown = false; kc = -1;
          trail = null;
          layout(); chips(); buttons(); updateStatus();
          if (t.mode !== 'solo') api.score('—'); else api.score(streak);
          K.netText(t.mode === 'solo' ? null : [api.net.connected, 'Online']);
          dirty = true; K.showMenu(false);
        },
        moved(seat, m, info, t) {
          const p = pathFor(S, seat, m);
          sel = -1; dests = []; prev = null; hov = -1; tchPrev = -1; drag = null; kc = -1;
          startAnim(seat, p, T.seats[seat].kind === 'me');
          trail = { seat, path: p };
          if (info.passes.length) api.toast(info.passes.map(q => T.seats[q].name).join(', ') + ' cannot move and passes');
          chips(); updateStatus();
        },
        over(t) { pendingOver = true; if (!anim) { pendingOver = false; showEnd(); } chips(); updateStatus(); buttons(); },
        busy: () => !!anim,
        seats() { chips(); updateStatus(); },
        lobby() { K.showMenu(false); K.status('Opening the lobby…'); K.netText(null); },
        wait() { K.status('Waiting for the host to start…'); },
        menu() { K.showMenu(true); K.status(''); },
        pending() { updateStatus(); },
        request(from) { const p = (api.net.players || []).find(x => x.id === from); api.toast((p ? p.name : 'A player') + ' wants a rematch'); snd.pop(); },
        closed(reason) {
          snd.lose();
          const why = reason === 'kicked' ? ['You were removed', 'The host removed you from the game.'] : reason === 'host-left' ? ['The host left', 'The host ended the game.'] : ['Connection lost', 'The connection to the host was lost.'];
          api.overlay({ kicker: 'Online', title: why[0], text: why[1], button: 'New lobby', onAction: () => T.online(), secondary: 'Menu', onSecondary: () => { K.showMenu(true); K.netText(null); } });
        },
        net(t) { K.netText([api.net.connected, api.net.connected ? 'Online' + (api.net.role === 'guest' && api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '') : 'Reconnecting…']); }
      };
      const tb = makeTable(api, G, hooks, { cfg, room: { title: 'Chinese Checkers', sizes: [2, 3, 4, 6], defaultSize: 4, min: 2, max: 6, bots: true } });
      T = tb;

      let lastDraw = 0;
      api.loop((dt, t) => {
        tb.tick();
        const now = performance.now();
        if (anim) {
          const el = now - anim.t0, seg = Math.min(anim.path.length - 2, Math.floor(el / anim.hop));
          const lim = Math.min(anim.path.length - 1, Math.floor(el / anim.hop));
          while (anim.last < lim) {
            anim.last++;
            const a = anim.path[anim.last - 1], b = anim.path[anim.last];
            if (CCE.NB.subarray(a * 6, a * 6 + 6).includes(b)) snd.step(); else snd.glass(anim.last);
          }
          if (now >= anim.end) { anim = null; if (pendingOver) { pendingOver = false; showEnd(); } updateStatus(); buttons(); }
          dirty = true;
        }
        const live = sel >= 0 || parts.length || (tb.state && !S.over && tb.mine());
        if (!dirty && !live) return;
        if (!dirty && now - lastDraw < 33) return;
        lastDraw = now;
        dirty = false;
        draw(now, dt);
      });

      function draw(now, dt) {
        ctx.clearRect(0, 0, W, HT);
        if (!bg) return;
        ctx.drawImage(bg, 0, 0, W, HT);
        const my = T && T.state && T.mine() && !S.over;
        const pulse = .5 + .5 * Math.sin(now / 260);
        if (my) {
          const g = S.goal[me];
          ctx.fillStyle = rgba(MCOL[me][1], .1 + .06 * pulse);
          for (const c of CCE.PT[g]) { ctx.beginPath(); ctx.arc(sx[c], sy[c], D * .5, 0, 7); ctx.fill(); }
        }
        if (trail && !anim) {
          const p = trail.path;
          ctx.strokeStyle = rgba(MCOL[trail.seat][1], .55); ctx.lineWidth = 3; ctx.setLineDash([2, 7]); ctx.lineCap = 'round';
          ctx.beginPath(); p.forEach((c, i) => i ? ctx.lineTo(sx[c], sy[c]) : ctx.moveTo(sx[c], sy[c])); ctx.stroke(); ctx.setLineDash([]);
          ctx.strokeStyle = rgba(MCOL[trail.seat][1], .8); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(sx[p[0]], sy[p[0]], D * .31, 0, 7); ctx.stroke();
        }
        if (sel >= 0) {
          ctx.strokeStyle = rgba(MCOL[me][1], .95); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx[sel], sy[sel], D * .44 + pulse * 2, 0, 7); ctx.stroke();
          for (const d of dests) {
            const hv = d === hov;
            ctx.fillStyle = rgba(MCOL[me][1], hv ? .72 : .3 + .12 * pulse);
            ctx.beginPath(); ctx.arc(sx[d], sy[d], D * (hv ? .33 : .26), 0, 7); ctx.fill();
            ctx.strokeStyle = rgba('#ffffff', hv ? .95 : .6); ctx.lineWidth = 2; ctx.stroke();
          }
          if (prev && prev.length > 1) {
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 7;
            ctx.beginPath(); prev.forEach((c, i) => i ? ctx.lineTo(sx[c], sy[c]) : ctx.moveTo(sx[c], sy[c])); ctx.stroke();
            ctx.strokeStyle = MCOL[me][1]; ctx.lineWidth = 4;
            ctx.beginPath(); prev.forEach((c, i) => i ? ctx.lineTo(sx[c], sy[c]) : ctx.moveTo(sx[c], sy[c])); ctx.stroke();
            for (let i = 1; i < prev.length; i++) {
              ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx[prev[i]], sy[prev[i]], 6.5, 0, 7); ctx.fill();
              ctx.fillStyle = MCOL[me][1]; ctx.beginPath(); ctx.arc(sx[prev[i]], sy[prev[i]], 4, 0, 7); ctx.fill();
            }
          }
        }
        for (let i = 0; i < CCE.N; i++) {
          const v = S.board[i];
          if (!v) continue;
          if (anim && anim.to === i) continue;
          if (drag && drag.moved && sel === i) continue;
          if (i === sel) { drawMarble(v - 1, sx[i], sy[i] - 5, 1.1); continue; }
          drawMarble(v - 1, sx[i], sy[i]);
        }
        if (sel >= 0 && prev && prev.length > 1 && !(drag && drag.moved)) drawMarble(me, sx[prev[prev.length - 1]], sy[prev[prev.length - 1]], 1, .5);
        if (drag && drag.moved) drawMarble(me, drag.x, drag.y - 6, 1.15);
        if (kbd && kc >= 0 && my) {
          ctx.strokeStyle = '#6c5ce7'; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(sx[kc], sy[kc], D * .47, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        }
        if (anim) {
          const el = now - anim.t0, f = el / anim.hop, i = Math.min(anim.path.length - 2, Math.max(0, Math.floor(f))), u = clamp(f - i, 0, 1) , e = ease(u);
          const a = anim.path[i], b = anim.path[Math.min(i + 1, anim.path.length - 1)];
          const jump = !CCE.NB.subarray(a * 6, a * 6 + 6).includes(b);
          const x = sx[a] + (sx[b] - sx[a]) * e, y = sy[a] + (sy[b] - sy[a]) * e - Math.sin(Math.PI * u) * (jump ? D * .62 : D * .14);
          ctx.fillStyle = 'rgba(40,20,5,.28)';
          ctx.beginPath(); ctx.ellipse(sx[a] + (sx[b] - sx[a]) * e, sy[a] + (sy[b] - sy[a]) * e + RM * .72, RM * .8, RM * .32, 0, 0, 7); ctx.fill();
          drawMarble(anim.seat, x, y, 1.06);
        }
        if (parts.length) {
          for (const p of parts) {
            p.t += dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.y > HT - 30) { p.y = HT - 30; p.vy *= -.55; p.vx *= .9; }
            drawMarble(p.s, p.x, p.y, p.r);
          }
          parts = parts.filter(p => p.t < 3.2);
        }
      }

      layout();
      hooks.menu();
      K.showMenu(true);
      K.setBtns([]);
      if (api.net.invite) { K.showMenu(false); tb.online(); }
      return { destroy() {} };
    }
  });

  const BCOL = [['Blue', '#2b6fe0'], ['Yellow', '#f3c316'], ['Red', '#e0302e'], ['Green', '#25a85a']];
  const DCOL = [['Violet', '#7a45d4'], ['Orange', '#f08a1c']];
  const BK_RULES = `<ul>
<li>Each colour has the same 21 pieces (every shape made of 1 to 5 squares). Place them on the board one by one.</li>
<li>Your first piece must cover your corner square (marked on the board). Every later piece must touch one of your own pieces at a corner, and never along an edge. Touching other colours is fine.</li>
<li>Rotate (<kbd>R</kbd>, right-click or wheel) and flip (<kbd>F</kbd>) the piece, then click the board, or drag it from the tray. On a phone drag it on, adjust it and press the check mark.</li>
<li>If you cannot place anything you pass, and the game ends when nobody can move.</li>
<li>Score: -1 for every square you did not place. Placing all 21 pieces gives +15, and +20 if the last piece was the single square.</li>
<li>2 players control two colours each (or choose the 14x14 Duo board with one colour each). In a 3-player game the fourth colour is shared: it takes a turn after every round, placed by each player in rotation, and it scores nothing.</li>
</ul>`;
  const BK_WHY = {
    out: 'The piece sticks out of the board',
    taken: 'Those squares are taken',
    edge: 'You cannot touch your own pieces edge to edge',
    corner: 'It must touch one of your pieces at a corner',
    start: 'Your first piece must cover your corner square'
  };

  Ameplay.register({
    id: 'blokus',
    title: 'Blokus',
    category: 'Board',
    tint: '#2b6fe0',
    blurb: 'Fit all 21 polyominoes on the board, touching your own pieces only at the corners. 2 to 4 players, bots or online.',
    help: 'Pick a piece, <kbd>R</kbd> rotate · <kbd>F</kbd> flip · click the board to place · drag from the tray · arrows + <kbd>Enter</kbd> on the keyboard',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 980,
    engine: { BKE },
    icon: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M8 8h12v12H8z" opacity=".95"/><path d="M20 20h12v12H20z" opacity=".6"/><path d="M32 8h12v12H32zM44 20h12v12H44z" opacity=".35"/><path d="M8 36h24v12H8zM8 48h12v12H8z" opacity=".8"/><path d="M40 40h16v16H40z" opacity=".5"/></svg>',
    css: kitCss('.gm-blokus') + `
.gm-blokus .gk-side{flex-basis:320px}
.gm-blokus .gk-board canvas{border-radius:18px;background:transparent}
.gm-blokus .bk-tray{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:16px;background:var(--sunk)}
.gm-blokus .bk-th{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gm-blokus .bk-th b{color:var(--ink);letter-spacing:0;text-transform:none;font-size:13px}
.gm-blokus .bk-ctl{display:flex;gap:6px}
.gm-blokus .bk-ctl button{width:36px;height:34px;border-radius:10px;border:0;background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(31,29,43,.12),0 4px 10px -6px rgba(31,29,43,.4);cursor:pointer;display:grid;place-items:center;transition:transform .15s,box-shadow .2s}
.gm-blokus .bk-ctl button:hover{transform:translateY(-1px)}
.gm-blokus .bk-ctl button:active{transform:scale(.93)}
.gm-blokus .bk-ctl button:disabled{opacity:.35;pointer-events:none}
.gm-blokus .bk-ctl svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.gm-blokus .bk-ctl .ok{background:var(--good);color:#fff;width:auto;padding:0 12px;font:900 13px var(--sans);gap:4px;display:inline-flex;align-items:center}
.gm-blokus .bk-ctl [hidden]{display:none}
.gm-blokus .bk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:5px}
.gm-blokus .bk-p{position:relative;aspect-ratio:1;border:2px solid transparent;border-radius:11px;background:#fff;padding:3px;cursor:grab;touch-action:none;transition:transform .15s,border-color .2s,box-shadow .2s,opacity .2s}
.gm-blokus .bk-p svg{display:block;width:100%;height:100%;pointer-events:none}
.gm-blokus .bk-p:hover{transform:translateY(-2px)}
.gm-blokus .bk-p.sel{border-color:var(--c);box-shadow:0 8px 16px -10px var(--c)}
.gm-blokus .bk-p.used{opacity:.22;pointer-events:none;filter:grayscale(.6)}
.gm-blokus .bk-p.dis{cursor:default;pointer-events:none}
.gm-blokus .bk-p.drag{opacity:.4}
.gm-blokus .bk-float{position:fixed;z-index:60;left:0;top:0;pointer-events:none;opacity:.9;filter:drop-shadow(0 10px 8px rgba(0,0,0,.3))}
.gm-blokus .bk-float svg{display:block;overflow:visible}
@media (max-width:760px){.gm-blokus .bk-grid{grid-template-columns:repeat(auto-fill,minmax(44px,1fr))}.gm-blokus .gk-side{flex-basis:auto}.gm-blokus .bk-tray{order:-1}}
`,
    mount(root, api) {
      const W = 640, HT = 640, PADD = 16;
      const snd = sounds(api);
      const K = mountKit(root, api, {
        title: 'Blokus', kicker: 'Board game', rules: BK_RULES, square: true,
        blurb: 'Grow your colour across the board, corner to corner, and leave your rivals no room.',
        opts: [
          { key: 'n', label: 'Players vs bots', vals: [[2, '2'], [3, '3'], [4, '4']], def: 4 },
          { key: 'duo', label: 'Board (2 players)', vals: [['classic', '20x20'], ['duo', 'Duo 14x14']], def: 'classic', when: o => +o.n === 2 },
          { key: 'level', label: 'Bot level', vals: LEVELS, def: 'normal' },
          { key: 'hints', label: 'Corner hints', vals: [['on', 'On'], ['off', 'Off']], def: 'on' }
        ]
      });
      const cv = api.canvas(W, HT, K.board), ctx = cv.ctx, cvs = cv.canvas;
      const tray = h('div', 'bk-tray');
      tray.innerHTML = '<div class="bk-th"><span>Your pieces <b></b></span><div class="bk-ctl"><button type="button" data-c="rot" aria-label="Rotate" title="Rotate (R)"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg></button><button type="button" data-c="flip" aria-label="Flip" title="Flip (F)"><svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M8 7L3 12l5 5z"/><path d="M16 7l5 5-5 5z"/></svg></button><button type="button" data-c="ok" class="ok" hidden><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Place</button></div></div><div class="bk-grid"></div>';
      K.side.insertBefore(tray, K.chips.nextSibling);
      const grid = tray.querySelector('.bk-grid'), trayName = tray.querySelector('.bk-th b'), btnOk = tray.querySelector('[data-c="ok"]');
      const G = {
        setup: BKE.setup, init: BKE.init, clone: BKE.clone, legal: BKE.legal, apply: BKE.apply, think: BKE.think,
        cur: BKE.cur,
        anyMove: st => BKE.gen(st, st.turn, true)[0] || null,
        seatCount: (hum, size, bots) => clamp(bots ? Math.max(size, hum) : hum, 2, 4)
      };
      const cfg = () => ({ n: K.opt.n, duo: K.opt.duo === 'duo' && +K.opt.n === 2, level: K.opt.level });
      let S = BKE.init(BKE.setup({ n: 4 })), T = null, me = 0, dirty = true, cell = 30, ox = 0, oy = 0, bgc = null;
      let pcs = null, pic = -1, oriCells = null, hv = null, stage = null, kb = null, dnd = null, flt = null, anim = null, streak = 0, shown = false, anchorsC = null, wrong = 0;
      const pal = () => S.duo ? DCOL : BCOL;
      const col = ci => pal()[ci][1];
      const pivot = cells => {
        let sr = 0, sc = 0;
        for (const [r, c] of cells) { sr += r; sc += c; }
        sr /= cells.length; sc /= cells.length;
        let b = cells[0], bd = 1e9;
        for (const x of cells) { const d = (x[0] - sr) ** 2 + (x[1] - sc) ** 2; if (d < bd) { bd = d; b = x; } }
        return b;
      };
      function geom() {
        cell = Math.floor((W - PADD * 2) / S.N);
        ox = Math.round((W - cell * S.N) / 2); oy = Math.round((HT - cell * S.N) / 2);
        const k = 2, c = document.createElement('canvas');
        c.width = W * k; c.height = HT * k;
        const g = c.getContext('2d');
        g.scale(k, k);
        g.shadowColor = 'rgba(15,18,40,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
        rr(g, ox - 12, oy - 12, cell * S.N + 24, cell * S.N + 24, 18); g.fillStyle = '#252a3a'; g.fill();
        g.shadowColor = 'transparent';
        rr(g, ox - 12, oy - 12, cell * S.N + 24, cell * S.N + 24, 18);
        const gr = g.createLinearGradient(0, oy - 12, 0, oy + cell * S.N + 12);
        gr.addColorStop(0, '#343b52'); gr.addColorStop(1, '#1d2130');
        g.fillStyle = gr; g.fill();
        rr(g, ox - 3, oy - 3, cell * S.N + 6, cell * S.N + 6, 6); g.fillStyle = '#10131e'; g.fill();
        for (let r = 0; r < S.N; r++) for (let c2 = 0; c2 < S.N; c2++) {
          const x = ox + c2 * cell, y = oy + r * cell;
          const cg = g.createLinearGradient(x, y, x + cell, y + cell);
          cg.addColorStop(0, '#eef1f8'); cg.addColorStop(1, '#dfe4f0');
          g.fillStyle = cg; rr(g, x + 1, y + 1, cell - 2, cell - 2, 3); g.fill();
        }
        S.start.forEach(([r, c2], ci) => {
          if (ci >= S.nc) return;
          const x = ox + c2 * cell + cell / 2, y = oy + r * cell + cell / 2;
          g.strokeStyle = col(ci); g.globalAlpha = .55; g.lineWidth = 2.4;
          g.beginPath(); g.arc(x, y, cell * .3, 0, 7); g.stroke();
          g.fillStyle = col(ci); g.globalAlpha = .28; g.beginPath(); g.arc(x, y, cell * .13, 0, 7); g.fill();
          g.globalAlpha = 1;
        });
        bgc = c;
      }
      function rr(g, x, y, w, h2, r) {
        g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h2, r); g.arcTo(x + w, y + h2, x, y + h2, r); g.arcTo(x, y + h2, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
      }
      function tile(x, y, s, color, al, sc) {
        const k = sc || 1, cx = x + s / 2, cy = y + s / 2, w = (s - 1) * k, x0 = cx - w / 2, y0 = cy - w / 2;
        ctx.globalAlpha = al == null ? 1 : al;
        const g = ctx.createLinearGradient(x0, y0, x0 + w, y0 + w);
        g.addColorStop(0, mixc(color, 255, .3)); g.addColorStop(.5, color); g.addColorStop(1, mixc(color, 0, .22));
        rr(ctx, x0, y0, w, w, s * .14); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.4; rr(ctx, x0 + 1.6, y0 + 1.6, w - 3.2, w - 3.2, s * .1); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1; rr(ctx, x0 + .5, y0 + .5, w - 1, w - 1, s * .14); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const isMine = () => !S.over && BKE.cur(S) === me;
      const multi = () => S.nc > S.n && S.sh < 0;
      const cname = ci => pal()[ci][0] + (ci === S.sh ? ' · shared' : '');
      const myCols = () => [...Array(S.nc).keys()].filter(ci => S.own[ci] === me);
      const tci = () => {
        const mine = myCols();
        if (isMine()) return S.turn;
        return mine.find(ci => !S.out[ci]) ?? mine[0] ?? 0;
      };
      const myTurn = () => T && T.mine() && !anim;
      const curCells = () => oriCells;
      function setPiece(p) {
        const ci = tci();
        if (p < 0 || S.used[ci][p]) { pic = -1; oriCells = null; stage = null; trayMark(); dirty = true; return; }
        if (p !== pic) { pic = p; oriCells = BKE.ORI[p][0]; stage = null; }
        trayMark(); updateStatus(); dirty = true;
      }
      function transform(kind) {
        if (pic < 0) return;
        oriCells = kind === 'flip' ? BKE.flip(oriCells) : kind === 'ccw' ? BKE.rot(BKE.rot(BKE.rot(oriCells))) : BKE.rot(oriCells);
        snd.tick(1); trayMark(); updateStatus(); dirty = true;
      }
      function miniSvg(cells, color, sz) {
        const w = Math.max(...cells.map(c => c[1])) + 1, hh = Math.max(...cells.map(c => c[0])) + 1, m = Math.max(w, hh, 5);
        const ox2 = (m - w) / 2, oy2 = (m - hh) / 2;
        return `<svg viewBox="0 0 ${m} ${m}" ${sz ? `width="${sz * m}" height="${sz * m}"` : ''}>${cells.map(([r, c]) => `<rect x="${c + ox2 + .04}" y="${r + oy2 + .04}" width=".92" height=".92" rx=".16" fill="${color}" stroke="rgba(0,0,0,.3)" stroke-width=".05"/><rect x="${c + ox2 + .16}" y="${r + oy2 + .16}" width=".68" height=".68" rx=".1" fill="none" stroke="rgba(255,255,255,.4)" stroke-width=".07"/>`).join('')}</svg>`;
      }
      function trayRender() {
        const ci = tci(), color = col(ci), live = T && T.state && isMine();
        trayName.textContent = multi() || ci === S.sh ? '· ' + cname(ci) : '';
        grid.innerHTML = BKE.ORI.map((o, p) => {
          const used = S.used[ci][p];
          return `<button type="button" class="bk-p${used ? ' used' : ''}${live ? '' : ' dis'}" data-p="${p}" style="--c:${color}" aria-label="Piece ${p + 1}">${miniSvg(p === pic && oriCells ? oriCells : o[0], color)}</button>`;
        }).join('');
        trayMark();
      }
      function trayMark() {
        const ci = tci();
        grid.querySelectorAll('.bk-p').forEach(b => {
          const p = +b.dataset.p, on = p === pic;
          b.classList.toggle('sel', on);
          if (on || b.dataset.o) { b.innerHTML = miniSvg(on && oriCells ? oriCells : BKE.ORI[p][0], col(ci)); b.dataset.o = on ? '1' : ''; }
        });
        tray.querySelector('[data-c="rot"]').disabled = tray.querySelector('[data-c="flip"]').disabled = pic < 0;
        btnOk.hidden = !(stage && pic >= 0 && coarse() || (stage && pic >= 0));
      }
      const anchorHints = () => {
        if (K.opt.hints !== 'on' || !myTurn()) return null;
        const key = T.log.length;
        if (!anchorsC || anchorsC.key !== key) anchorsC = { key, list: BKE.anchors(S, S.turn) };
        return anchorsC.list;
      };
      function anchorCell() {
        if (stage) return stage;
        if (kb && kbOn) return kb;
        return hv;
      }
      let kbOn = false;
      function ghost() {
        const a = anchorCell();
        if (!a || pic < 0 || !oriCells) return null;
        const pv = pivot(oriCells), cells = oriCells.map(([r, c]) => [r - pv[0] + a.r, c - pv[1] + a.c]);
        const ok = S.over ? false : BKE.why(S, S.turn, cells);
        return { cells, why: ok, pv, ar: a.r, ac: a.c };
      }
      function tryPlace() {
        if (!myTurn() || pic < 0) return false;
        const g = ghost();
        if (!g) return false;
        if (g.why) { snd.bad(); api.toast(BK_WHY[g.why] || 'Cannot place here'); wrong = performance.now(); dirty = true; return false; }
        const top = [Math.min(...g.cells.map(c => c[0])), Math.min(...g.cells.map(c => c[1]))];
        const m = { p: pic, o: BKE.oriIndex(pic, oriCells), r: top[0], c: top[1] };
        if (!T.submit(m)) return false;
        pic = -1; oriCells = null; stage = null; hv = null; kbOn = false;
        trayMark(); dirty = true;
        return true;
      }
      const touchOff = y => -cell * 1.9 * 4 * clamp((y - oy) / (S.N * cell), 0, 1) * (1 - clamp((y - oy) / (S.N * cell), 0, 1));
      const cellAt = e => {
        const p = cv.toLocal(e), off = e.pointerType === 'mouse' ? 0 : touchOff(p.y);
        const r = Math.floor((p.y + off - oy) / cell), c = Math.floor((p.x - ox) / cell);
        return { r, c, in: r >= 0 && c >= 0 && r < S.N && c < S.N, p };
      };
      api.on(cvs, 'pointermove', e => {
        if (!myTurn() || dnd) return;
        kbOn = false;
        if (e.pointerType === 'mouse') { const a = cellAt(e); hv = a.in ? { r: a.r, c: a.c } : null; updateStatus(); dirty = true; }
        else if (stageDrag) { const a = cellAt(e); if (a.in) stage = { r: a.r, c: a.c }; trayMark(); dirty = true; }
      });
      let stageDrag = false;
      api.on(cvs, 'pointerdown', e => {
        if (!myTurn()) return;
        kbOn = false;
        const a = cellAt(e);
        if (e.pointerType === 'mouse') {
          if (e.button === 2) { transform('rot'); return; }
          if (pic >= 0 && a.in) { hv = { r: a.r, c: a.c }; tryPlace(); }
          else if (a.in) {
            const v = S.board[a.r * S.N + a.c];
            if (v && S.own[v - 1] === me) api.toast('Pick a piece from the tray first');
          }
          return;
        }
        if (pic < 0) { api.toast('Pick a piece from the tray first'); return; }
        if (!a.in) return;
        stage = { r: a.r, c: a.c }; stageDrag = true;
        try { cvs.setPointerCapture(e.pointerId); } catch (x) {}
        trayMark(); updateStatus(); dirty = true;
      });
      const endStage = e => { stageDrag = false; try { cvs.releasePointerCapture(e.pointerId); } catch (x) {} };
      api.on(cvs, 'pointerup', endStage);
      api.on(cvs, 'pointercancel', endStage);
      api.on(cvs, 'pointerleave', e => { if (e.pointerType === 'mouse' && !stage) { hv = null; dirty = true; updateStatus(); } });
      api.on(cvs, 'contextmenu', e => e.preventDefault());
      api.on(cvs, 'wheel', e => { if (!myTurn() || pic < 0) return; e.preventDefault(); transform(e.deltaY > 0 ? 'rot' : 'ccw'); }, { passive: false });
      api.on(tray, 'click', e => {
        const b = e.target.closest('[data-c]');
        if (!b || b.disabled) return;
        snd.tick(0);
        if (b.dataset.c === 'rot') transform('rot');
        else if (b.dataset.c === 'flip') transform('flip');
        else if (b.dataset.c === 'ok') tryPlace();
      });
      api.on(grid, 'pointerdown', e => {
        const b = e.target.closest('.bk-p');
        if (!b || !myTurn() || b.classList.contains('used')) return;
        e.preventDefault();
        const p = +b.dataset.p;
        const was = pic === p;
        if (!was) { setPiece(p); snd.pop(); }
        dnd = { p, id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, touch: e.pointerType !== 'mouse', el: b, was };
        b.classList.add('drag');
        const mv = ev => {
          if (!dnd || ev.pointerId !== dnd.id) return;
          if (!dnd.moved && Math.hypot(ev.clientX - dnd.x0, ev.clientY - dnd.y0) > 6) { dnd.moved = true; mkFloat(); }
          if (!dnd.moved) return;
          moveFloat(ev);
          const a = cellAt(ev);
          hv = a.in ? { r: a.r, c: a.c } : null;
          if (dnd.touch && a.in) stage = { r: a.r, c: a.c };
          updateStatus(); dirty = true;
        };
        const up = ev => {
          if (!dnd || ev.pointerId !== dnd.id) return;
          window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
          const d = dnd;
          dnd = null;
          d.el.classList.remove('drag');
          rmFloat();
          if (d.moved) {
            const a = cellAt(ev);
            if (a.in) {
              if (d.touch) { stage = { r: a.r, c: a.c }; trayMark(); }
              else { hv = { r: a.r, c: a.c }; tryPlace(); }
            } else { hv = null; stage = null; trayMark(); }
          } else if (d.was) { transform('rot'); }
          updateStatus(); dirty = true;
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      });
      function mkFloat() {
        const sz = cvs.getBoundingClientRect().width / W * cell;
        flt = h('div', 'bk-float', miniSvg(oriCells, col(tci()), sz));
        flt.style.setProperty('--s', sz + 'px');
        root.append(flt);
      }
      function moveFloat(ev) {
        if (!flt) return;
        const r = flt.getBoundingClientRect();
        const cr = cvs.getBoundingClientRect(), off = dnd.touch ? touchOff((ev.clientY - cr.top) * W / cr.width) * cr.width / W : 0;
        flt.style.transform = `translate(${ev.clientX - r.width / 2}px,${ev.clientY - r.height / 2 + off}px)`;
      }
      function rmFloat() { if (flt) { flt.remove(); flt = null; } }

      api.on(window, 'keydown', e => {
        if (!T || !T.state || (e.target.closest && e.target.closest('input,textarea')) || !myTurn()) return;
        const k = e.key.toLowerCase();
        const mv = { arrowleft: [0, -1], arrowright: [0, 1], arrowup: [-1, 0], arrowdown: [1, 0] }[k];
        if (mv) {
          e.preventDefault();
          if (!kbOn) { kbOn = true; kb = kb || { r: S.N >> 1, c: S.N >> 1 }; }
          kb = { r: clamp(kb.r + mv[0], 0, S.N - 1), c: clamp(kb.c + mv[1], 0, S.N - 1) };
          if (pic < 0) { const ci = tci(), f = BKE.ORI.findIndex((_, p) => !S.used[ci][p]); if (f >= 0) setPiece(S.used[ci][20] ? f : 20); }
          updateStatus(); dirty = true;
        } else if (k === 'r' || k === 'e') { e.preventDefault(); transform(e.shiftKey ? 'ccw' : 'rot'); }
        else if (k === 'q') { e.preventDefault(); transform('ccw'); }
        else if (k === 'f') { e.preventDefault(); transform('flip'); }
        else if (k === 'enter' || k === ' ') { if (pic >= 0 && (kbOn || stage)) { e.preventDefault(); tryPlace(); } }
        else if (k === 'tab' || k === ',' || k === '.') {
          e.preventDefault();
          const ci = tci(), dir = k === ',' || (k === 'tab' && e.shiftKey) ? -1 : 1;
          let p = pic < 0 ? (dir > 0 ? -1 : 21) : pic;
          for (let i = 0; i < 21; i++) { p = (p + dir + 21) % 21; if (!S.used[ci][p]) break; }
          setPiece(p); snd.pop();
        } else if (k === 'backspace' || k === 'delete') { stage = null; setPiece(-1); }
      });

      function chips() {
        if (!T || !T.state) { K.setChips([]); return; }
        const sc = BKE.seatScores(S);
        K.setChips([...Array(S.nc).keys()].map(ci => {
          const s = BKE.owner(S, ci), seat = T.seats[s] || {};
          const sh = ci === S.sh, nm = sh ? 'Shared · ' + pal()[ci][0] + (S.turn === ci && !S.over ? ' · ' + (seat.name || 'Player') : '') : (seat.name || 'Player') + (seat.kind === 'me' && T.mode !== 'solo' ? ' (you)' : '') + (multi() ? ' · ' + pal()[ci][0] : '');
          const on = !S.over && S.turn === ci;
          const val = BKE.score(S, ci);
          return { name: nm, color: col(ci), on, think: on && seat.kind === 'bot', off: S.out[ci] && !S.over, info: sh ? `${S.left[ci]} squares left · not scored${S.out[ci] ? ' · out' : ''}` : S.over || S.left[ci] === 0 ? `${val > 0 ? '+' : ''}${val} pts${S.left[ci] === 0 ? ' <em>all placed</em>' : ''}` : `${S.left[ci]} squares left${S.out[ci] ? ' · out' : ''}` };
        }));
      }
      function updateStatus() {
        if (!T || !T.state) return;
        if (S.over) {
          const rk = BKE.ranking(S), w = rk[0], top = BKE.seatScores(S).score;
          const tie = rk.length > 1 && top[rk[1]] === top[w];
          K.status(tie ? 'Draw' : w === me ? 'You win!' : T.seats[w].name + ' wins', !tie && w === me ? 'good' : 'bad');
          return;
        }
        const s = BKE.cur(S), seat = T.seats[s];
        if (seat.kind === 'me') {
          if (T.pending) return K.status('Sending move…');
          if (anim) return K.status('');
          const g = pic >= 0 ? ghost() : null;
          if (g && g.why) return K.status(BK_WHY[g.why], 'warn');
          if (g) return K.status(stage ? 'Press the check mark to place it' : 'Click to place', 'turn');
          K.status(S.turn === S.sh ? 'Your move · place the shared ' + pal()[S.turn][0] : S.first[S.turn] ? 'Your move · start on the marked corner' : pic >= 0 ? 'Aim at the board' : 'Your move · pick a piece', 'turn');
        } else K.status(seat.kind === 'bot' ? `${seat.name} is thinking…` : `Waiting for ${seat.name}…`);
      }
      function buttons() {
        if (!T || T.mode === 'idle') return K.setBtns([['menu', 'Menu']]);
        if (T.mode === 'solo') return K.setBtns([['menu', 'Menu'], ['again', 'New game', 'g-btn']]);
        if (T.mode === 'host') return K.setBtns([['lobby', 'Lobby'], ['again', 'Rematch', 'g-btn', !S.over]]);
        K.setBtns([['leave', 'Leave'], T.over ? ['ask', 'Ask rematch', 'g-btn'] : null]);
      }
      K.onBtn = id => {
        if (id === 'menu') { T.leave(); K.showMenu(true); api.hideOverlay(); }
        else if (id === 'again') T.again();
        else if (id === 'lobby') T.online();
        else if (id === 'leave') { T.leave(); K.showMenu(true); K.netText(null); api.hideOverlay(); }
        else if (id === 'ask') api.net.send({ t: 'rq' });
      };
      K.onStart = mode => {
        K.showMenu(false);
        if (mode === 'solo') T.solo(cfg());
        else T.online();
      };
      function showEnd() {
        if (shown || !T || !T.state) return;
        shown = true;
        const rk = BKE.ranking(S), sc = BKE.seatScores(S), w = rk[0];
        const tie = rk.length > 1 && sc.score[rk[1]] === sc.score[w], mineWin = !tie && w === me;
        if (T.mode === 'solo') { if (mineWin) { streak++; api.submit(streak); } else streak = 0; api.score(streak); }
        snd[mineWin ? 'win' : 'lose']();
        const host = T.mode === 'host', guest = T.mode === 'guest';
        api.timeout(() => {
          if (!T || !T.over) return;
          api.overlay({
            kicker: mineWin ? 'Victory' : 'Game over',
            title: tie ? 'It is a draw' : mineWin ? 'You win!' : esc(T.seats[w].name) + ' wins',
            stats: rk.map(s => [s === me ? 'You' : esc(T.seats[s].name).slice(0, 12), (sc.score[s] > 0 ? '+' : '') + sc.score[s]]),
            text: rk.map(s => `${esc(T.seats[s].name)}: ${sc.left[s]} squares left, ${sc.pcs[s]} of ${S.own.filter(x => x === s).length * 21} pieces placed`).join('<br>') + (S.sh >= 0 ? `<br>Shared ${pal()[S.sh][0]}: ${S.left[S.sh]} squares left, not scored` : ''),
            button: host ? 'Rematch' : T.mode === 'solo' ? 'Play again' : 'Ask rematch',
            onAction: () => { if (guest) api.net.send({ t: 'rq' }); else T.again(); },
            secondary: host ? 'Lobby' : guest ? 'Leave' : 'Menu',
            onSecondary: () => { if (host) T.online(); else { T.leave(); K.showMenu(true); K.netText(null); } }
          });
        }, 800);
      }
      const hooks = {
        begin(t) {
          T = t; S = t.state; anim = null; pic = -1; oriCells = null; hv = null; stage = null; kbOn = false; kb = null; shown = false; anchorsC = null; dnd = null; rmFloat();
          me = Math.max(0, t.me);
          geom(); chips(); trayRender(); buttons(); updateStatus();
          api.score(t.mode === 'solo' ? streak : '—');
          K.netText(t.mode === 'solo' ? null : [api.net.connected, 'Online']);
          K.showMenu(false); dirty = true;
        },
        moved(seat, m, info, t) {
          const ci = info.ci;
          anim = { cells: S.lastCells.slice(), ci, t0: performance.now(), end: performance.now() + 300, mine: t.seats[seat].kind === 'me' };
          snd.drop();
          if (info.passes.length) api.toast(info.passes.map(q => (q === S.sh ? 'Shared ' + pal()[q][0] : multi() ? pal()[q][0] : t.seats[S.own[q]].name)).join(', ') + ' cannot move and passes');
          anchorsC = null; stage = null;
          chips(); trayRender(); updateStatus(); dirty = true;
        },
        over(t) { chips(); updateStatus(); buttons(); showEnd(); },
        busy: () => !!anim,
        seats() { chips(); updateStatus(); },
        lobby() { K.showMenu(false); K.status('Opening the lobby…'); K.netText(null); },
        wait() { K.status('Waiting for the host to start…'); },
        menu() { K.showMenu(true); K.status(''); },
        pending() { updateStatus(); },
        request(from) { const p = (api.net.players || []).find(x => x.id === from); api.toast((p ? p.name : 'A player') + ' wants a rematch'); snd.pop(); },
        closed(reason) {
          snd.lose();
          const why = reason === 'kicked' ? ['You were removed', 'The host removed you from the game.'] : reason === 'host-left' ? ['The host left', 'The host ended the game.'] : ['Connection lost', 'The connection to the host was lost.'];
          api.overlay({ kicker: 'Online', title: why[0], text: why[1], button: 'New lobby', onAction: () => T.online(), secondary: 'Menu', onSecondary: () => { K.showMenu(true); K.netText(null); } });
        },
        net() { K.netText([api.net.connected, api.net.connected ? 'Online' + (api.net.role === 'guest' && api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '') : 'Reconnecting…']); }
      };
      const tb = makeTable(api, G, hooks, { cfg, room: { title: 'Blokus', sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4, bots: true } });
      T = tb;

      let lastDraw = 0, lastTurnKey = '';
      api.loop(() => {
        tb.tick();
        const now = performance.now();
        if (anim && now >= anim.end) { anim = null; trayRender(); updateStatus(); dirty = true; }
        const key = tb.state ? tb.log.length + ':' + tb.over : '';
        if (key !== lastTurnKey) { lastTurnKey = key; if (tb.state && !tb.over) { const ci = tci(); if (pic >= 0 && S.used[ci][pic]) { pic = -1; oriCells = null; } if (!anim) trayRender(); } }
        const live = anim || (tb.state && !S.over && tb.mine()) || now - wrong < 400;
        if (!dirty && !live) return;
        if (!dirty && now - lastDraw < 33) return;
        lastDraw = now; dirty = false;
        draw(now);
      });

      function draw(now) {
        ctx.clearRect(0, 0, W, HT);
        if (!bgc) return;
        ctx.drawImage(bgc, 0, 0, W, HT);
        const N = S.N, b = S.board;
        const lastSet = new Set(S.lastCells.map(([r, c]) => r * N + c));
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const v = b[r * N + c];
          if (!v) continue;
          const x = ox + c * cell, y = oy + r * cell, color = col(v - 1);
          let sc = 1, al = 1;
          if (anim && lastSet.has(r * N + c)) { const u = clamp((now - anim.t0) / 260, 0, 1); sc = 1 + .45 * (1 - ease(u)); al = .4 + .6 * u; }
          tile(x, y, cell, color, al, sc);
          if (sc === 1) {
            ctx.fillStyle = color;
            if (c < N - 1 && b[r * N + c + 1] === v) ctx.fillRect(x + cell - 2, y + 2, 4, cell - 4);
            if (r < N - 1 && b[(r + 1) * N + c] === v) ctx.fillRect(x + 2, y + cell - 2, cell - 4, 4);
          }
        }
        if (T && T.state && !S.over) {
          const ci = S.turn, pulse = .5 + .5 * Math.sin(now / 280);
          if (S.first[ci] && !b[S.start[ci][0] * N + S.start[ci][1]]) {
            const x = ox + S.start[ci][1] * cell + cell / 2, y = oy + S.start[ci][0] * cell + cell / 2;
            ctx.strokeStyle = col(ci); ctx.lineWidth = 3; ctx.globalAlpha = .6 + .4 * pulse;
            ctx.beginPath(); ctx.arc(x, y, cell * (.34 + .08 * pulse), 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
          }
          const an = anchorHints();
          if (an && pic < 0 !== undefined) {
            ctx.fillStyle = col(ci);
            for (const i of an) {
              const r = (i / N) | 0, c = i % N;
              ctx.globalAlpha = .25 + .25 * pulse;
              ctx.beginPath(); ctx.arc(ox + c * cell + cell / 2, oy + r * cell + cell / 2, cell * .14, 0, 7); ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
          if (lastSet.size && !anim) {
            ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5;
            for (const i of lastSet) {
              const r = (i / N) | 0, c = i % N;
              ctx.strokeRect(ox + c * cell + 3.5, oy + r * cell + 3.5, cell - 7, cell - 7);
            }
          }
        }
        if (myTurn() && pic >= 0) {
          const g = ghost();
          if (g) {
            const ci = S.turn, bad = !!g.why;
            for (const [r, c] of g.cells) {
              if (r < 0 || c < 0 || r >= N || c >= N) continue;
              const x = ox + c * cell, y = oy + r * cell;
              tile(x, y, cell, bad ? '#d94a4a' : col(ci), bad ? .5 : .72);
            }
            ctx.strokeStyle = bad ? '#ff2d2d' : '#fff'; ctx.lineWidth = 2;
            for (const [r, c] of g.cells) {
              if (r < 0 || c < 0 || r >= N || c >= N) continue;
              const x = ox + c * cell, y = oy + r * cell;
              ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
            }
          }
        }
      }

      geom();
      hooks.menu();
      K.showMenu(true);
      K.setBtns([]);
      if (api.net.invite) { K.showMenu(false); tb.online(); }
      return { destroy() { rmFloat(); } };
    }
  });

  const QCOL = [['Red', '#d9453b'], ['Blue', '#2f6fdb'], ['Green', '#2da35a'], ['Gold', '#e0a014']];
  const QD_RULES = `<ul>
<li>Be the first to reach the opposite side of the board with your pawn.</li>
<li>On your turn you either move your pawn one square (up, down, left, right) or place one wall. Walls are two squares long and cannot be moved.</li>
<li>Pawns and walls block movement. If a pawn stands next to yours you may jump over it. If a wall is behind that pawn, you may step diagonally around it instead.</li>
<li>You may never wall a pawn in completely: every pawn always keeps at least one path to its goal.</li>
<li>Click a highlighted square to move. Point at a groove between squares to see a wall, <kbd>R</kbd> turns it, click to place it. On a phone use the Wall button, drag to aim and press the check mark.</li>
<li>2 players get 10 walls each, 3 players 6 each and 4 players 5 each.</li>
</ul>`;
  const QD_WHY = {
    none: 'You have no walls left',
    overlap: 'A wall is already there',
    block: 'A pawn would have no path to its goal',
    out: 'Outside the board'
  };
  const KROT = [0, 2, 3, 1];

  Ameplay.register({
    id: 'quoridor',
    title: 'Quoridor',
    category: 'Board',
    tint: '#c9843a',
    blurb: 'Race your pawn across the board while dropping walls to slow your rivals, but never trap them completely. 2 to 4 players, bots or online.',
    help: 'Click a dot to move · point at a groove and click to build a wall · <kbd>W</kbd> wall mode · <kbd>R</kbd> turn the wall · arrows + <kbd>Enter</kbd>',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 960,
    engine: { QDE },
    icon: '<svg viewBox="0 0 64 64" fill="currentColor"><rect x="8" y="8" width="14" height="14" rx="3" opacity=".35"/><rect x="25" y="8" width="14" height="14" rx="3" opacity=".35"/><rect x="42" y="8" width="14" height="14" rx="3" opacity=".35"/><rect x="8" y="42" width="14" height="14" rx="3" opacity=".35"/><rect x="42" y="42" width="14" height="14" rx="3" opacity=".35"/><rect x="6" y="24.5" width="31" height="6" rx="3"/><rect x="42" y="25" width="6" height="30" rx="3" opacity=".7"/><circle cx="32" cy="48" r="8"/></svg>',
    css: kitCss('.gm-quoridor') + `
.gm-quoridor .gk-board canvas{border-radius:20px;background:transparent}
.gm-quoridor .qd-ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:10px;border-radius:16px;background:var(--sunk)}
.gm-quoridor .qd-ctl .seg{flex:none}
.gm-quoridor .qd-ctl .seg button{padding:8px 14px}
.gm-quoridor .qd-btn{width:38px;height:36px;border-radius:10px;border:0;background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(31,29,43,.12),0 4px 10px -6px rgba(31,29,43,.4);cursor:pointer;display:grid;place-items:center;transition:transform .15s,opacity .2s}
.gm-quoridor .qd-btn:hover{transform:translateY(-1px)}
.gm-quoridor .qd-btn:active{transform:scale(.93)}
.gm-quoridor .qd-btn:disabled{opacity:.35;pointer-events:none}
.gm-quoridor .qd-btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.gm-quoridor .qd-btn.ok{background:var(--good);color:#fff;width:auto;padding:0 12px;font:900 13px var(--sans);gap:4px;display:inline-flex;align-items:center}
.gm-quoridor .qd-note{flex:1 1 100%;text-align:center;font-size:12px;font-weight:800;color:var(--muted)}
`,
    mount(root, api) {
      const W = 680, HT = 680, CS = 56, GP = 12, PT = CS + GP, M = 40;
      const snd = sounds(api);
      const K = mountKit(root, api, {
        title: 'Quoridor', kicker: 'Board game', rules: QD_RULES, square: false,
        blurb: 'Wall them in, run for the line, and never get trapped yourself.',
        opts: [
          { key: 'n', label: 'Players vs bots', vals: [[2, '2'], [3, '3'], [4, '4']], def: 2 },
          { key: 'level', label: 'Bot level', vals: LEVELS, def: 'normal' },
          { key: 'hint', label: 'Show my shortest path', vals: [['off', 'Off'], ['on', 'On']], def: 'off' }
        ]
      });
      const cv = api.canvas(W, HT, K.board), ctx = cv.ctx, cvs = cv.canvas;
      const ctl = h('div', 'qd-ctl');
      ctl.innerHTML = `<div class="seg" role="radiogroup"><button type="button" role="radio" data-m="move" aria-checked="true">Move</button><button type="button" role="radio" data-m="wall" aria-checked="false">Wall</button></div><button type="button" class="qd-btn" data-c="rot" aria-label="Turn wall" title="Turn wall (R)"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg></button><button type="button" class="qd-btn ok" data-c="ok" hidden><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Place</button><button type="button" class="qd-btn" data-c="no" aria-label="Cancel" title="Cancel" hidden><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
      K.side.insertBefore(ctl, K.chips.nextSibling);
      const btnOk = ctl.querySelector('[data-c="ok"]'), btnNo = ctl.querySelector('[data-c="no"]'), btnRot = ctl.querySelector('[data-c="rot"]');
      const G = {
        setup: QDE.setup, init: QDE.init, clone: QDE.clone, legal: QDE.legal, apply: QDE.apply, think: QDE.think,
        cur: st => st.turn,
        anyMove: st => { const m = QDE.moves(st, st.turn)[0]; return m ? { r: m[0], c: m[1] } : null; },
        seatCount: (hum, size, bots) => clamp(bots ? Math.max(size, hum) : hum, 2, 4)
      };
      const cfg = () => ({ n: K.opt.n, level: K.opt.level });
      let S = QDE.init(QDE.setup({ n: 2 })), T = null, me = 0, dirty = true, bgc = null, kr = 0;
      let mode = 'move', ori = null, hov = null, stage = null, kc = null, kbOn = false, anim = null, owner = new Int8Array(128).fill(-1), pp = [], streak = 0, shown = false, wrong = 0, cache = null, drag = false;

      const rc = (k, r, c) => { for (let i = 0; i < k; i++) { const t = r; r = c; c = 8 - t; } return [r, c]; };
      const rw = (k, w, r, c) => {
        for (let i = 0; i < k; i++) { const a = c + 1, b = 9 - (r + 1); w = w === 'h' ? 'v' : 'h'; r = a - 1; c = b - 1; }
        return [w, r, c];
      };
      const toV = (r, c) => rc(kr, r, c), toL = (r, c) => rc((4 - kr) % 4, r, c);
      const wV = (w, r, c) => rw(kr, w, r, c), wL = (w, r, c) => rw((4 - kr) % 4, w, r, c);
      const X = c => M + c * PT, Y = r => M + r * PT;
      const scol = s => QCOL[S.side[s]][1];
      const rr = (g, x, y, w, h2, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h2, r); g.arcTo(x + w, y + h2, x, y + h2, r); g.arcTo(x, y + h2, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };

      function buildBg() {
        const k = 2, c = document.createElement('canvas');
        c.width = W * k; c.height = HT * k;
        const g = c.getContext('2d');
        g.scale(k, k);
        const bs = 9 * CS + 8 * GP, fx = M - 14, fs = bs + 28;
        g.shadowColor = 'rgba(30,14,4,.5)'; g.shadowBlur = 26; g.shadowOffsetY = 12;
        rr(g, fx, fx, fs, fs, 22); g.fillStyle = '#5a3217'; g.fill();
        g.shadowColor = 'transparent';
        const fg = g.createLinearGradient(fx, fx, fx + fs, fx + fs);
        fg.addColorStop(0, '#8a5530'); fg.addColorStop(.5, '#6b3f1f'); fg.addColorStop(1, '#4b2a12');
        rr(g, fx, fx, fs, fs, 22); g.fillStyle = fg; g.fill();
        let s = 7;
        const rn = () => (s = (s * 16807) % 2147483647) / 2147483647;
        g.save(); rr(g, fx, fx, fs, fs, 22); g.clip();
        for (let i = 0; i < 70; i++) {
          g.strokeStyle = `rgba(${rn() < .5 ? '255,220,170' : '30,12,2'},${.04 + rn() * .07})`; g.lineWidth = .6 + rn() * 1.6;
          const y = fx + rn() * fs, a = (rn() - .5) * 8;
          g.beginPath(); g.moveTo(fx, y); g.bezierCurveTo(fx + fs * .3, y + a, fx + fs * .7, y - a, fx + fs, y + a * .5); g.stroke();
        }
        g.restore();
        rr(g, M - 6, M - 6, bs + 12, bs + 12, 10); g.fillStyle = '#2a1508'; g.fill();
        g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.stroke();
        for (let r = 0; r < 9; r++) for (let q = 0; q < 9; q++) {
          const x = X(q), y = Y(r);
          const cg = g.createLinearGradient(x, y, x + CS, y + CS);
          cg.addColorStop(0, '#f0cf98'); cg.addColorStop(1, '#d9ac6c');
          rr(g, x, y, CS, CS, 8); g.fillStyle = cg; g.fill();
          g.save(); rr(g, x, y, CS, CS, 8); g.clip();
          for (let i = 0; i < 4; i++) {
            g.strokeStyle = `rgba(120,70,20,${.05 + rn() * .08})`; g.lineWidth = .8;
            const yy = y + rn() * CS;
            g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + CS / 2, yy + (rn() - .5) * 6, x + CS, yy + (rn() - .5) * 4); g.stroke();
          }
          g.restore();
          g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.2; rr(g, x + 1.5, y + 1.5, CS - 3, CS - 3, 7); g.stroke();
          g.strokeStyle = 'rgba(80,40,8,.45)'; g.lineWidth = 1; rr(g, x + .5, y + .5, CS - 1, CS - 1, 8); g.stroke();
        }
        bgc = c;
      }

      function curTarget() {
        if (stage) return stage;
        if (kbOn && kc) return kc;
        return hov;
      }
      function wallState(t) {
        if (!t || t.kind !== 'wall') return null;
        const [w, r, c] = wL(t.w, t.r, t.c);
        const why = S.over ? 'out' : QDE.why(S, S.turn, w === 'h', r, c);
        return { w, r, c, why, vw: t.w, vr: t.r, vc: t.c };
      }
      let lmKey = -1, lmList = [];
      function legalV() {
        if (lmKey !== T.log.length) { lmKey = T.log.length; lmList = QDE.moves(S, S.turn).map(([r, c]) => toV(r, c)); }
        return lmList;
      }
      const myTurn = () => !!(T && T.state && T.mine() && !anim);
      const touchOff = y => -CS * 1.9 * 4 * clamp((y - M) / 600, 0, 1) * (1 - clamp((y - M) / 600, 0, 1));
      function pick(p, touchy) {
        const gx = p.x, gy = touchy && mode === 'wall' ? p.y + touchOff(p.y) : p.y;
        const cV = clamp(Math.round((gx - M - CS - GP / 2) / PT), 0, 7), rH = clamp(Math.round((gy - M - CS - GP / 2) / PT), 0, 7);
        const dv = Math.abs(gx - (M + cV * PT + CS + GP / 2)), dh = Math.abs(gy - (M + rH * PT + CS + GP / 2));
        const inside = gx >= M - 6 && gy >= M - 6 && gx <= M + 9 * PT - GP + 6 && gy <= M + 9 * PT - GP + 6;
        const near = Math.min(dh, dv) < GP / 2 + (touchy ? 15 : 9);
        const canWall = S.walls[S.turn] > 0;
        if (mode === 'wall' || (near && canWall && inside)) {
          if (!inside && mode !== 'wall') return null;
          return { kind: 'wall', w: ori || (dh < dv ? 'h' : 'v'), r: rH, c: cV };
        }
        const q = clamp(Math.floor((gx - M) / PT), 0, 8), r = clamp(Math.floor((gy - M) / PT), 0, 8);
        if (!inside || gx - X(q) > CS + 3 || gy - Y(r) > CS + 3) return null;
        return { kind: 'cell', r, c: q };
      }
      function act(t) {
        if (!myTurn() || !t) return false;
        if (t.kind === 'cell') {
          if (!legalV().some(([r, c]) => r === t.r && c === t.c)) { return false; }
          const [r, c] = toL(t.r, t.c);
          return T.submit({ r, c });
        }
        const ws = wallState(t);
        if (ws.why) { snd.bad(); api.toast(QD_WHY[ws.why] || 'Cannot build there'); wrong = performance.now(); dirty = true; return false; }
        return T.submit({ w: ws.w, r: ws.r, c: ws.c });
      }
      function clearSel() { stage = null; kc = null; kbOn = false; dirty = true; }
      function setMode(m) {
        mode = m; ori = null; stage = null; kc = null; kbOn = false;
        ctl.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.m === m)));
        sync(); dirty = true;
      }
      function sync() {
        const t = curTarget();
        const wallish = mode === 'wall' || (t && t.kind === 'wall');
        btnRot.disabled = !(wallish && myTurn());
        btnOk.hidden = btnNo.hidden = !(stage && myTurn());
        const w = T && T.state ? S.walls[me] : 0;
        ctl.querySelector('[data-m="wall"]').disabled = !(w > 0);
        if (w <= 0 && mode === 'wall') { mode = 'move'; ctl.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.m === 'move'))); }
        updateStatus();
      }

      api.on(cvs, 'pointermove', e => {
        if (!myTurn()) return;
        kbOn = false;
        const p = cv.toLocal(e);
        if (e.pointerType === 'mouse') { hov = pick(p, false); dirty = true; sync(); }
        else if (drag) { const t = pick(p, true); if (t && (stage || t.kind === 'wall')) stage = t; dirty = true; sync(); }
      });
      api.on(cvs, 'pointerdown', e => {
        if (!myTurn()) return;
        kbOn = false;
        const p = cv.toLocal(e);
        if (e.pointerType === 'mouse') {
          if (e.button === 2) { flipOri(); return; }
          hov = pick(p, false);
          if (hov && !act(hov) && hov.kind === 'cell') { snd.bad(); }
          return;
        }
        const t = pick(p, true);
        if (!t) { stage = null; sync(); dirty = true; return; }
        if (t.kind === 'cell') {
          stage = null;
          if (!act(t)) snd.bad();
          sync(); dirty = true; return;
        }
        stage = t; drag = true;
        try { cvs.setPointerCapture(e.pointerId); } catch (x) {}
        sync(); dirty = true;
      });
      const endDrag = e => { drag = false; try { cvs.releasePointerCapture(e.pointerId); } catch (x) {} };
      api.on(cvs, 'pointerup', endDrag);
      api.on(cvs, 'pointercancel', endDrag);
      api.on(cvs, 'pointerleave', e => { if (e.pointerType === 'mouse' && !stage) { hov = null; dirty = true; sync(); } });
      api.on(cvs, 'contextmenu', e => e.preventDefault());
      function flipOri() {
        const t = curTarget();
        if (!(mode === 'wall' || (t && t.kind === 'wall'))) return;
        const cur = t && t.kind === 'wall' ? t.w : (ori || 'h');
        ori = cur === 'h' ? 'v' : 'h';
        if (t && t.kind === 'wall') { t.w = ori; }
        snd.tick(1); dirty = true; sync();
      }
      api.on(ctl, 'click', e => {
        const m = e.target.closest('[data-m]');
        if (m && !m.disabled) { snd.tick(0); setMode(m.dataset.m); return; }
        const b = e.target.closest('[data-c]');
        if (!b || b.disabled) return;
        if (b.dataset.c === 'rot') flipOri();
        else if (b.dataset.c === 'ok') { if (stage && act(stage)) clearSel(); sync(); }
        else if (b.dataset.c === 'no') { clearSel(); sync(); }
      });

      api.on(window, 'keydown', e => {
        if (!T || !T.state || (e.target.closest && e.target.closest('input,textarea')) || !myTurn()) return;
        const k = e.key.toLowerCase();
        const dir = { arrowleft: [0, -1], arrowright: [0, 1], arrowup: [-1, 0], arrowdown: [1, 0] }[k];
        if (k === 'w') { e.preventDefault(); if (S.walls[S.turn] > 0 || mode === 'wall') setMode(mode === 'wall' ? 'move' : 'wall'); return; }
        const dv = dir;
        if (dv) {
          e.preventDefault();
          const wallish = mode === 'wall' || (kc && kc.kind === 'wall');
          if (!kbOn) {
            kbOn = true;
            const [pr, pc] = toV(S.pos[S.turn][0], S.pos[S.turn][1]);
            kc = wallish ? { kind: 'wall', w: ori || 'h', r: 3, c: 3 } : { kind: 'cell', r: pr, c: pc };
            if (wallish) { sync(); dirty = true; return; }
          }
          if (kc.kind === 'wall') kc = { kind: 'wall', w: kc.w, r: clamp(kc.r + dv[0], 0, 7), c: clamp(kc.c + dv[1], 0, 7) };
          else {
            let best = null, bs = -9;
            for (const [r, c] of legalV()) {
              const dr = r - kc.r, dc = c - kc.c, len = Math.hypot(dr, dc);
              if (!len) continue;
              const sc = (dr * dv[0] + dc * dv[1]) / len - len * .02;
              if (sc > .45 && sc > bs) { bs = sc; best = { kind: 'cell', r, c }; }
            }
            if (best) kc = best;
          }
          snd.tick(0); sync(); dirty = true;
        } else if (k === 'r' || k === 'f') { e.preventDefault(); if (kbOn && kc && kc.kind === 'wall') { kc = { ...kc, w: kc.w === 'h' ? 'v' : 'h' }; ori = kc.w; snd.tick(1); sync(); dirty = true; } else flipOri(); }
        else if (k === 'enter' || k === ' ') {
          const t = stage || (kbOn ? kc : null);
          if (t) { e.preventDefault(); if (act(t)) clearSel(); sync(); }
        } else if (k === 'backspace' || k === 'delete') { clearSel(); sync(); }
      });

      function chips() {
        if (!T || !T.state) { K.setChips([]); return; }
        K.setChips([...Array(S.n).keys()].map(s => {
          const seat = T.seats[s] || {};
          const nm = (seat.name || 'Player') + (seat.kind === 'me' && T.mode !== 'solo' ? ' (you)' : '');
          const on = !S.over && S.turn === s;
          const d = QDE.dist(S, s);
          return { name: nm, color: scol(s), on, think: on && seat.kind === 'bot', info: S.over && S.winner === s ? '<em>Reached the goal</em>' : `${S.walls[s]} wall${S.walls[s] === 1 ? '' : 's'} · ${d} to go`, bar: S.walls[s] / QDE.WALLS[S.n] };
        }));
      }
      function updateStatus() {
        if (!T || !T.state) return;
        if (S.over) {
          const w = S.winner;
          K.status(w === me ? 'You win!' : T.seats[w].name + ' wins', w === me ? 'good' : 'bad');
          return;
        }
        const seat = T.seats[S.turn];
        if (seat.kind === 'me') {
          if (T.pending) return K.status('Sending move…');
          if (anim) return K.status('');
          const t = curTarget(), ws = wallState(t);
          if (ws && ws.why) return K.status(QD_WHY[ws.why] || 'Cannot build there', 'warn');
          if (ws) return K.status(stage ? 'Press the check mark to build it' : 'Click to build the wall', 'turn');
          if (mode === 'wall') return K.status('Aim at a groove to build a wall', 'turn');
          K.status('Your move · pick a dot, or a groove for a wall', 'turn');
        } else K.status(seat.kind === 'bot' ? `${seat.name} is thinking…` : `Waiting for ${seat.name}…`);
      }
      function buttons() {
        if (!T || T.mode === 'idle') return K.setBtns([['menu', 'Menu']]);
        if (T.mode === 'solo') return K.setBtns([['menu', 'Menu'], ['again', 'New game', 'g-btn']]);
        if (T.mode === 'host') return K.setBtns([['lobby', 'Lobby'], ['again', 'Rematch', 'g-btn', !S.over]]);
        K.setBtns([['leave', 'Leave'], T.over ? ['ask', 'Ask rematch', 'g-btn'] : null]);
      }
      K.onBtn = id => {
        if (id === 'menu') { T.leave(); K.showMenu(true); api.hideOverlay(); }
        else if (id === 'again') T.again();
        else if (id === 'lobby') T.online();
        else if (id === 'leave') { T.leave(); K.showMenu(true); K.netText(null); api.hideOverlay(); }
        else if (id === 'ask') api.net.send({ t: 'rq' });
      };
      K.onStart = m => {
        K.showMenu(false);
        if (m === 'solo') T.solo(cfg());
        else T.online();
      };
      function rank() {
        const ds = [...Array(S.n).keys()].map(s => [s, S.winner === s ? 0 : QDE.dist(S, s)]);
        return ds.sort((a, b) => (a[0] === S.winner ? -1 : b[0] === S.winner ? 1 : a[1] - b[1]));
      }
      function showEnd() {
        if (shown || !T || !T.state) return;
        shown = true;
        const w = S.winner, mineWin = w === me, rk = rank();
        if (T.mode === 'solo') { if (mineWin) { streak++; api.submit(streak); } else streak = 0; api.score(streak); }
        snd[mineWin ? 'win' : 'lose']();
        const host = T.mode === 'host', guest = T.mode === 'guest';
        api.timeout(() => {
          if (!T || !T.over) return;
          api.overlay({
            kicker: mineWin ? 'Victory' : 'Game over',
            title: mineWin ? 'You win!' : esc(T.seats[w].name) + ' wins',
            stats: rk.map(([s, d]) => [s === me ? 'You' : esc(T.seats[s].name).slice(0, 12), d === 0 ? 'Goal' : d + ' to go']),
            text: `Won in ${Math.ceil(S.count / S.n)} turns. Walls left: ` + rk.map(([s]) => `${esc(T.seats[s].name)} ${S.walls[s]}`).join(', ') + '.',
            button: host ? 'Rematch' : T.mode === 'solo' ? 'Play again' : 'Ask rematch',
            onAction: () => { if (guest) api.net.send({ t: 'rq' }); else T.again(); },
            secondary: host ? 'Lobby' : guest ? 'Leave' : 'Menu',
            onSecondary: () => { if (host) T.online(); else { T.leave(); K.showMenu(true); K.netText(null); } }
          });
        }, 900);
      }
      const hooks = {
        begin(t) {
          T = t; S = t.state; anim = null; hov = null; stage = null; kc = null; kbOn = false; ori = null; mode = 'move'; shown = false; cache = null; lmKey = -1;
          me = Math.max(0, t.me);
          kr = KROT[S.side[me]];
          const tmp = QDE.init(t.setup);
          owner.fill(-1);
          for (const m of t.log) { if (m.w) owner[(m.w === 'h' ? 0 : 64) + m.r * 8 + m.c] = tmp.turn; QDE.apply(tmp, m); }
          pp = S.pos.map(p => p.slice());
          ctl.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.m === 'move')));
          buildBg(); chips(); buttons(); sync();
          api.score(t.mode === 'solo' ? streak : '—');
          K.netText(t.mode === 'solo' ? null : [api.net.connected, 'Online']);
          K.showMenu(false); dirty = true;
        },
        moved(seat, m, info, t) {
          const now = performance.now();
          if (m.w) {
            owner[(m.w === 'h' ? 0 : 64) + m.r * 8 + m.c] = seat;
            anim = { k: 'w', seat, m, t0: now, end: now + 340 };
            snd.wall();
          } else {
            anim = { k: 'p', seat, from: pp[seat].slice(), to: [m.r, m.c], t0: now, end: now + (Math.abs(m.r - pp[seat][0]) + Math.abs(m.c - pp[seat][1]) > 1 ? 380 : 240) };
            snd.step();
          }
          pp = S.pos.map(p => p.slice());
          stage = null; kbOn = false; kc = null; cache = null;
          chips(); sync(); dirty = true;
        },
        over(t) { chips(); sync(); buttons(); showEnd(); },
        busy: () => !!anim,
        seats() { chips(); sync(); },
        lobby() { K.showMenu(false); K.status('Opening the lobby…'); K.netText(null); },
        wait() { K.status('Waiting for the host to start…'); },
        menu() { K.showMenu(true); K.status(''); },
        pending() { sync(); },
        request(from) { const p = (api.net.players || []).find(x => x.id === from); api.toast((p ? p.name : 'A player') + ' wants a rematch'); snd.pop(); },
        closed(reason) {
          snd.lose();
          const why = reason === 'kicked' ? ['You were removed', 'The host removed you from the game.'] : reason === 'host-left' ? ['The host left', 'The host ended the game.'] : ['Connection lost', 'The connection to the host was lost.'];
          api.overlay({ kicker: 'Online', title: why[0], text: why[1], button: 'New lobby', onAction: () => T.online(), secondary: 'Menu', onSecondary: () => { K.showMenu(true); K.netText(null); } });
        },
        net() { K.netText([api.net.connected, api.net.connected ? 'Online' + (api.net.role === 'guest' && api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '') : 'Reconnecting…']); }
      };
      const tb = makeTable(api, G, hooks, { cfg, room: { title: 'Quoridor', sizes: [2, 3, 4], defaultSize: 2, min: 2, max: 4, bots: true } });
      T = tb;

      let lastDraw = 0;
      api.loop(() => {
        tb.tick();
        const now = performance.now();
        if (anim && now >= anim.end) { anim = null; sync(); dirty = true; }
        const live = anim || (tb.state && !S.over) || now - wrong < 400;
        if (!dirty && !live) return;
        if (!dirty && now - lastDraw < 33) return;
        lastDraw = now; dirty = false;
        draw(now);
      });

      function wallRect(w, r, c) {
        const [vw, vr, vc] = wV(w, r, c);
        return vw === 'h' ? [X(vc), Y(vr) + CS, 2 * CS + GP, GP, vw] : [X(vc) + CS, Y(vr), GP, 2 * CS + GP, vw];
      }
      function drawWall(x, y, w, h2, color, al, sc) {
        const k = sc || 1, cx = x + w / 2, cy = y + h2 / 2, ww = w * (w > h2 ? k : 1), hh = h2 * (w > h2 ? 1 : k);
        ctx.globalAlpha = al == null ? 1 : al;
        const x0 = cx - ww / 2, y0 = cy - hh / 2, th = Math.min(w, h2);
        const big = th * 1.0;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
        const g = w > h2 ? ctx.createLinearGradient(0, y0 - 2, 0, y0 + hh + 2) : ctx.createLinearGradient(x0 - 2, 0, x0 + ww + 2, 0);
        g.addColorStop(0, mixc(color, 255, .45)); g.addColorStop(.5, color); g.addColorStop(1, mixc(color, 0, .3));
        rr(ctx, x0 - 1, y0 - 1, ww + 2, hh + 2, big * .45); ctx.fillStyle = g; ctx.fill();
        ctx.restore();
        ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; rr(ctx, x0 - .5, y0 - .5, ww + 1, hh + 1, big * .45); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      function pawn(cx, cy, color, scale, glow) {
        const R = 21 * (scale || 1);
        ctx.save();
        ctx.fillStyle = 'rgba(30,12,2,.35)'; ctx.beginPath(); ctx.ellipse(cx + 1, cy + R * .78, R * .95, R * .38, 0, 0, 7); ctx.fill();
        if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 16; }
        const g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R * 1.1);
        g.addColorStop(0, mixc(color, 255, .6)); g.addColorStop(.45, color); g.addColorStop(1, mixc(color, 0, .45));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.arc(cx, cy, R * .58, 0, 7); ctx.fill();
        const g2 = ctx.createRadialGradient(cx - R * .3, cy - R * .35, 0, cx - R * .3, cy - R * .35, R * .5);
        g2.addColorStop(0, 'rgba(255,255,255,.95)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx - R * .3, cy - R * .35, R * .5, 0, 7); ctx.fill();
        ctx.restore();
      }
      function pathCells() {
        if (!cache || cache.n !== T.log.length) cache = { n: T.log.length, p: QDE.pathOf(S, me).map(([r, c]) => toV(r, c)) };
        return cache.p;
      }

      function draw(now) {
        ctx.clearRect(0, 0, W, HT);
        if (!bgc) return;
        ctx.drawImage(bgc, 0, 0, W, HT);
        const pulse = .5 + .5 * Math.sin(now / 260);
        for (let s = 0; s < S.n; s++) {
          const k = S.side[s], col = scol(s);
          for (let i = 0; i < 9; i++) {
            const [r, c] = k === 0 ? [0, i] : k === 1 ? [8, i] : k === 2 ? [i, 8] : [i, 0], [vr, vc] = toV(r, c);
            ctx.fillStyle = col; ctx.globalAlpha = .2;
            rr(ctx, X(vc), Y(vr), CS, CS, 8); ctx.fill(); ctx.globalAlpha = 1;
          }
          const dirs = [[1, 0], [-1, 0], [0, -1], [0, 1]][k];
          let dr = dirs[0], dc = dirs[1];
          for (let i = 0; i < kr; i++) { const t = dr; dr = dc; dc = -t; }
          const n = S.walls[s], max = QDE.WALLS[S.n], pit = 11, tot = max * pit;
          ctx.fillStyle = col;
          for (let i = 0; i < n; i++) {
            if (dr) { const y = dr > 0 ? HT - 15 : 15; rr(ctx, W / 2 - tot / 2 + i * pit + 1, y - 3.5, 9, 7, 3); }
            else { const x = dc > 0 ? W - 15 : 15; rr(ctx, x - 3.5, HT / 2 - tot / 2 + i * pit + 1, 7, 9, 3); }
            ctx.globalAlpha = S.turn === s && !S.over ? .75 + .25 * pulse : .75; ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        if (K.opt.hint === 'on' && T.state && !S.over) {
          const p = pathCells();
          ctx.strokeStyle = scol(me); ctx.globalAlpha = .55; ctx.lineWidth = 4; ctx.setLineDash([2, 9]); ctx.lineCap = 'round';
          ctx.beginPath();
          p.forEach(([r, c], i) => { const x = X(c) + CS / 2, y = Y(r) + CS / 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
          ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        }
        const mt = myTurn(), tgt = mt ? curTarget() : null;
        if (mt) {
          for (const [r, c] of legalV()) {
            const x = X(c) + CS / 2, y = Y(r) + CS / 2, on = tgt && tgt.kind === 'cell' && tgt.r === r && tgt.c === c;
            ctx.fillStyle = scol(me); ctx.globalAlpha = on ? .95 : .35 + .25 * pulse;
            ctx.beginPath(); ctx.arc(x, y, on ? 14 : 8 + pulse * 1.5, 0, 7); ctx.fill();
            ctx.globalAlpha = 1;
            if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 17, 0, 7); ctx.stroke(); }
          }
        }
        for (let i = 0; i < 128; i++) {
          if (!(S.hw[i & 63] && i < 64) && !(S.vw[i & 63] && i >= 64)) continue;
          const r = ((i & 63) >> 3), c = i & 7, [x, y, w, h2] = wallRect(i < 64 ? 'h' : 'v', r, c), o = owner[i];
          let sc = 1, al = 1;
          if (anim && anim.k === 'w' && anim.m.w === (i < 64 ? 'h' : 'v') && anim.m.r === r && anim.m.c === c) { const u = clamp((now - anim.t0) / 300, 0, 1); sc = 1.5 - .5 * ease(u); al = .3 + .7 * ease(u); }
          drawWall(x, y, w, h2, o >= 0 ? scol(o) : '#8a5a2a', al, sc);
          if (S.last && S.last.w && S.last.r === r && S.last.c === c && S.last.w === (i < 64 ? 'h' : 'v') && !anim) {
            ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6; rr(ctx, x + 2, y + 2, w - 4, h2 - 4, 3); ctx.stroke();
          }
        }
        const ws = wallState(tgt);
        if (ws) {
          const [x, y, w, h2] = wallRect(ws.w, ws.r, ws.c), bad = !!ws.why;
          drawWall(x, y, w, h2, bad ? '#e0443a' : scol(S.turn), bad ? .6 : .8);
          ctx.strokeStyle = bad ? '#ff3b30' : '#fff'; ctx.lineWidth = 2; rr(ctx, x - 2, y - 2, w + 4, h2 + 4, 6); ctx.stroke();
        }
        for (let s = 0; s < S.n; s++) {
          let r = S.pos[s][0], c = S.pos[s][1], lift = 0;
          if (anim && anim.k === 'p' && anim.seat === s) {
            const u = ease(clamp((now - anim.t0) / (anim.end - anim.t0), 0, 1));
            const [fr, fc] = toV(anim.from[0], anim.from[1]), [tr, tc] = toV(anim.to[0], anim.to[1]);
            r = fr + (tr - fr) * u; c = fc + (tc - fc) * u; lift = Math.sin(u * Math.PI) * (Math.abs(tr - fr) + Math.abs(tc - fc) > 1 ? 16 : 6);
            drawPawnAt(s, r, c, lift, now);
            continue;
          }
          const [vr, vc] = toV(r, c);
          drawPawnAt(s, vr, vc, 0, now);
        }
      }
      function drawPawnAt(s, vr, vc, lift, now) {
        const cx = X(vc) + CS / 2, cy = Y(vr) + CS / 2 - lift, on = !S.over && S.turn === s;
        if (on) {
          ctx.strokeStyle = scol(s); ctx.lineWidth = 3; ctx.globalAlpha = .35 + .35 * (.5 + .5 * Math.sin(now / 260));
          ctx.beginPath(); ctx.arc(cx, cy, 27, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
        }
        pawn(cx, cy, scol(s), 1, s === me);
        if (s === me) { ctx.fillStyle = '#fff'; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(cx, cy, 3.4, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      }

      buildBg();
      hooks.menu();
      K.showMenu(true);
      K.setBtns([]);
      if (api.net.invite) { K.showMenu(false); tb.online(); }
      return { destroy() {} };
    }
  });

  Ameplay.covers['chinese-checkers'] = (() => {
    const D = 17, cx = 200, cy = 152, out = [];
    for (let z = -8; z <= 8; z++) for (let x = -8; x <= 8; x++) {
      const y = -x - z;
      if (!((x >= -4 && y >= -4 && z >= -4) || (x <= 4 && y <= 4 && z <= 4))) continue;
      const k = z <= -5 ? 0 : x >= 5 ? 1 : y <= -5 ? 2 : z >= 5 ? 3 : x <= -5 ? 4 : y >= 5 ? 5 : -1;
      const px = cx + D * (x + z / 2) * 1.18, py = cy + D * .866 * z * 1.18;
      out.push(k < 0 ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5.2" fill="#2a1a0c" opacity=".55"/>` : `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7.4" fill="url(#cc-g${k})"/><circle cx="${(px - 2.2).toFixed(1)}" cy="${(py - 2.4).toFixed(1)}" r="2.1" fill="#fff" opacity=".75"/>`);
    }
    const defs = MCOL.map((m, i) => `<radialGradient id="cc-g${i}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="${m[1]}"/><stop offset="1" stop-color="${mixc(m[1], 0, .55)}"/></radialGradient>`).join('');
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cc-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c18a"/><stop offset="1" stop-color="#b9854a"/></linearGradient>${defs}</defs><rect width="400" height="300" fill="url(#cc-bg)"/>${out.join('')}</svg>`;
  })();
  Ameplay.covers.blokus = (() => {
    const cols = ['#2b6fe0', '#f3c316', '#e0302e', '#25a85a'], s = 18, ox = 20, oy = 12, r = [];
    for (let i = 0; i < 14; i++) for (let j = 0; j < 20; j++) r.push(`<rect x="${ox + j * s + 1}" y="${oy + i * s + 1}" width="${s - 2}" height="${s - 2}" rx="3" fill="#e6eaf4"/>`);
    const shapes = [[0, [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1]], 1, 1], [1, [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]], 5, 1], [2, [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], 9, 3], [3, [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]], 13, 1], [0, [[0, 0], [0, 1], [1, 0], [1, 1]], 2, 7], [1, [[0, 0], [1, 0], [2, 0], [3, 0]], 6, 6], [2, [[0, 0], [1, 0], [1, 1]], 12, 7], [3, [[0, 0], [0, 1], [0, 2], [1, 0]], 16, 6], [0, [[0, 0], [1, 0], [0, 1]], 9, 9], [2, [[0, 0], [1, 0], [2, 0], [2, 1]], 3, 10], [3, [[0, 0], [1, 0], [1, 1]], 7, 11], [1, [[0, 0], [0, 1], [0, 2], [1, 1]], 12, 10]];
    for (const [ci, cells, c0, r0] of shapes) for (const [a, b] of cells) {
      const x = ox + (c0 + b) * s, y = oy + (r0 + a) * s;
      r.push(`<rect x="${x + 1}" y="${y + 1}" width="${s - 2}" height="${s - 2}" rx="3.5" fill="${cols[ci]}"/><rect x="${x + 3.5}" y="${y + 3.5}" width="${s - 7}" height="${s - 7}" rx="2" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/>`);
    }
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bk-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#343b52"/><stop offset="1" stop-color="#1d2130"/></linearGradient></defs><rect width="400" height="300" fill="url(#bk-bg)"/>${r.join('')}</svg>`;
  })();
  Ameplay.covers.quoridor = (() => {
    const cs = 30, g = 7, pt = cs + g, ox = 200 - (9 * cs + 8 * g) / 2, oy = 150 - (9 * cs + 8 * g) / 2 + 2, r = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) r.push(`<rect x="${ox + j * pt}" y="${oy + i * pt}" width="${cs}" height="${cs}" rx="5" fill="url(#qd-c)"/>`);
    const wall = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3.5" fill="${c}" stroke="rgba(0,0,0,.4)"/>`;
    r.push(wall(ox + 2 * pt, oy + 3 * pt - g, 2 * cs + g, g, '#2f6fdb'), wall(ox + 5 * pt, oy + 2 * pt - g, 2 * cs + g, g, '#d9453b'), wall(ox + 4 * pt - g, oy + 4 * pt, g, 2 * cs + g, '#2f6fdb'), wall(ox + 7 * pt - g, oy + 5 * pt, g, 2 * cs + g, '#d9453b'), wall(ox + 1 * pt, oy + 6 * pt - g, 2 * cs + g, g, '#d9453b'));
    const pawn = (i, j, c) => `<ellipse cx="${ox + j * pt + cs / 2 + 1}" cy="${oy + i * pt + cs / 2 + 11}" rx="12" ry="4.5" fill="rgba(30,12,2,.35)"/><circle cx="${ox + j * pt + cs / 2}" cy="${oy + i * pt + cs / 2}" r="12.5" fill="${c}" stroke="rgba(0,0,0,.35)"/><circle cx="${ox + j * pt + cs / 2 - 4}" cy="${oy + i * pt + cs / 2 - 4.5}" r="4" fill="#fff" opacity=".7"/>`;
    r.push(pawn(8, 4, '#d9453b'), pawn(0, 4, '#2f6fdb'));
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="qd-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a5530"/><stop offset="1" stop-color="#4b2a12"/></linearGradient><linearGradient id="qd-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0cf98"/><stop offset="1" stop-color="#d9ac6c"/></linearGradient></defs><rect width="400" height="300" fill="url(#qd-b)"/><rect x="${ox - 5}" y="${oy - 5}" width="${9 * cs + 8 * g + 10}" height="${9 * cs + 8 * g + 10}" rx="8" fill="#2a1508"/>${r.join('')}</svg>`;
  })();
})();
