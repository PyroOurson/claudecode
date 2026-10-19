
(() => {
  'use strict';
  const C = Ameplay.colors;
  const EASE = 'cubic-bezier(.22,.8,.2,1)';
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const rnd = a => a[Math.random() * a.length | 0];
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = (el, kf, o) => el.animate ? el.animate(kf, reduced() ? { ...o, duration: 1, delay: 0 } : o) : null;
  const onBtn = e => e.target instanceof Element && !!e.target.closest('button');
  const noFocus = root => root.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
  const seg = (k, opts, cur) => `<div class="seg" data-k="${k}" role="radiogroup">${opts.map(([v, t]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;
  const segCss = p => `
${p} .seg{display:inline-flex;padding:4px;gap:2px;border-radius:999px;background:var(--sunk);box-shadow:inset 0 1px 2px rgba(31,29,43,.08)}
${p} .seg button{border:0;background:none;padding:8px 13px;border-radius:999px;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
${p} .seg button:hover{color:var(--ink)}
${p} .seg button[aria-checked="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 10px -4px rgba(31,29,43,.3)}
${p} .opts{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
${p} .opts [hidden]{display:none}
@media (pointer:coarse){${p} .seg button{min-height:40px}${p} .g-btn.sm{height:42px}}`;
  function bindSeg(wrap, fn) {
    wrap.addEventListener('click', e => {
      const b = e.target.closest('.seg button');
      if (!b || b.getAttribute('aria-checked') === 'true') return;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      fn(b.parentNode.dataset.k, b.dataset.v);
    });
  }

  const DIFFS = ['Easy', 'Normal', 'Hard'];
  const duelCss = p => segCss(p) + `
${p}{gap:16px}
${p} .dhead{display:flex;flex-direction:column;align-items:center;gap:14px;max-width:100%}
${p} .sb{gap:6px 30px}
${p} .sb .k{display:inline-flex;align-items:center;gap:6px}
${p} .sb .g-stat::after{content:"";width:22px;height:3px;margin-top:3px;border-radius:3px;background:var(--accent);transform:scaleX(0);transition:transform .25s var(--ease)}
${p} .sb .on::after{transform:none}
${p} .dfoot{display:flex;align-items:center;justify-content:center;min-height:36px;max-width:100%}
${p} .st{font-size:15px;font-weight:800;color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
${p} .st.L{color:var(--good)}
${p} .st.R{color:var(--bad)}
${p} .st.turn{padding:5px 16px;border-radius:999px;background:var(--accent);color:#fff;box-shadow:0 6px 14px -8px rgba(108,92,231,.9)}
${p} .nx{position:relative;overflow:hidden;max-width:0;padding:0;margin-left:0;border-width:0;opacity:0;visibility:hidden;transition:max-width .5s var(--ease),padding .5s var(--ease),margin .5s var(--ease),opacity .3s,transform .25s var(--ease),visibility 0s .5s}
${p} .over .nx{max-width:170px;padding:0 16px;margin-left:14px;border-width:2px;opacity:1;visibility:visible;transition-delay:0s}
${p} .nx::after{content:"";position:absolute;left:16px;right:16px;bottom:6px;height:2px;border-radius:1px;background:currentColor;opacity:.3;transform:scaleX(0);transform-origin:left}
${p} .over .nx::after{transform:none;transition:transform var(--t, 1400ms) linear}
${p} .net .nx::after{display:none}
${p} .cn{display:flex;align-items:center;gap:6px;margin-top:-6px;font-size:12px;font-weight:800;color:var(--muted)}
${p} .cn[hidden]{display:none}
${p} .cn i{width:8px;height:8px;border-radius:50%;background:var(--bad)}
${p} .cn.on i{background:var(--good);box-shadow:0 0 0 3px rgba(34,176,125,.2)}
@media (max-width:520px){${p} .seg button{padding:8px 10px}${p} .sb{gap:6px 18px}}
`;

  function duel(root, api, o) {
    const saved = api.load() || {};
    const cfg = { mode: saved.mode === 'net' ? 'net' : 'ai', diff: DIFFS.includes(saved.diff) ? saved.diff : 'Normal' };
    if (o.extra) cfg[o.extra.key] = o.extra.opts.some(([v]) => v === saved[o.extra.key]) ? saved[o.extra.key] : o.extra.opts[0][0];
    if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) root.classList.add('touch');
    let streak = 0, round = 1, over = false, gen = 0, who = null;
    const tally = { L: 0, draw: 0, R: 0 }, N = { role: null, live: false, mine: 'L', myRe: false, theirRe: false, hooked: false };
    const head = h('div', 'dhead', `<div class="opts">${seg('mode', [['ai', 'vs AI'], ['net', 'Online']], cfg.mode)}${seg('diff', DIFFS.map(d => [d, d]), cfg.diff)}${o.extra ? seg(o.extra.key, o.extra.opts, cfg[o.extra.key]) : ''}</div><div class="cn" hidden><i></i><span></span></div><div class="g-hud sb"><div class="g-stat" data-k="L"><span class="k">${o.glyph[0]}<span class="nm"></span></span><span class="v">0</span></div><div class="g-stat" data-k="draw"><span class="k">Draws</span><span class="v">0</span></div><div class="g-stat" data-k="R"><span class="k">${o.glyph[1]}<span class="nm"></span></span><span class="v">0</span></div></div>`);
    const foot = h('div', 'dfoot', '<span class="st" role="status"></span><button type="button" class="g-btn ghost sm nx">Next round</button>');
    const opts = head.firstChild, st = foot.firstChild, nx = foot.lastChild, cn = head.querySelector('.cn'), sL = head.querySelector('[data-k="L"]'), sR = head.querySelector('[data-k="R"]');
    const net = () => cfg.mode === 'net';
    const touch = () => root.classList.contains('touch');
    const names = () => cfg.mode === 'ai' ? ['You', 'AI'] : N.mine === 'L' ? ['You', 'Friend'] : ['Friend', 'You'];
    const mark = (k, v) => opts.querySelectorAll(`.seg[data-k="${k}"] button`).forEach(x => x.setAttribute('aria-checked', String(x.dataset.v === String(v))));
    const conn = () => { const on = !!N.role && api.net.connected; cn.classList.toggle('on', on); cn.lastChild.textContent = on ? 'Connected' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '') : N.role ? 'Connection lost' : 'Not connected'; };
    const label = () => {
      const [a, b] = names();
      sL.querySelector('.nm').textContent = a; sR.querySelector('.nm').textContent = b;
      opts.querySelector('[data-k="diff"]').hidden = cfg.mode !== 'ai';
      if (o.extra) opts.querySelector(`[data-k="${o.extra.key}"]`).hidden = net() && N.role !== 'host';
      cn.hidden = !net();
      if (net()) conn();
      foot.classList.toggle('net', net());
    };
    const turn = (w, text) => {
      who = w;
      sL.classList.toggle('on', w === 'L'); sR.classList.toggle('on', w === 'R');
      let t = text, hot = false;
      if (!t) {
        if (cfg.mode === 'ai') t = 'Your move';
        else { hot = N.live && w === N.mine; t = !N.live ? 'Connecting…' : hot ? 'Your move' : 'Waiting for your friend…'; }
      }
      st.className = 'st' + (hot ? ' turn' : ''); st.textContent = t;
    };
    const resetTally = () => { tally.L = tally.draw = tally.R = 0; head.querySelectorAll('.sb .v').forEach(v => { v.textContent = '0'; }); };
    const begin = r => {
      round = r; over = false; gen++; N.myRe = N.theirRe = false;
      foot.classList.remove('over'); nx.textContent = net() ? 'Rematch' : 'Next round'; nx.disabled = false;
      if (net() && N.role === 'host' && N.live) api.net.send({ t: 'new', r, x: o.extra ? cfg[o.extra.key] : null });
      o.round(r % 2 === 0);
    };
    function rematch() {
      if (!over || !N.live || N.myRe) return;
      N.myRe = true; api.net.send({ t: 're' });
      nx.textContent = 'Waiting…'; nx.disabled = true;
      if (N.role === 'host' && N.theirRe) begin(round + 1);
      else { st.className = 'st'; st.textContent = 'Waiting for your friend…'; }
    }
    const next = () => { if (!over) return; if (net()) rematch(); else begin(round + 1); };
    const newMatch = () => {
      if (!(streak && api.submit(streak)) && !net()) api.toast(cfg.diff + ' · new match');
      streak = 0; resetTally();
      api.score(cfg.mode === 'ai' ? 0 : '—');
    };
    function setMode(m) {
      const prev = cfg.mode;
      if (prev === 'net') { N.role = null; N.live = false; api.net.close(); }
      cfg.mode = m; api.save(cfg); mark('mode', m); label();
      newMatch();
      if (m === 'net') goOnline(prev); else begin(1);
    }
    async function goOnline(prev) {
      if (!N.hooked) hook();
      N.role = null; N.live = false; N.mine = 'L'; label();
      begin(1);
      const role = await api.net.lobby({ title: 'Play ' + o.title + ' online' });
      if (!api.alive || !net()) return;
      if (!role) return setMode(prev && prev !== 'net' ? prev : 'ai');
      N.role = role; N.mine = role === 'host' ? 'L' : 'R'; label();
      st.className = 'st'; st.textContent = role === 'host' ? 'Your friend joined · starting…' : 'Connected · waiting for the host…';
      if (role === 'guest') api.net.send({ t: 'hi' });
    }
    const sync = () => ({ t: 'sync', r: round, x: o.extra ? cfg[o.extra.key] : null, mv: o.list() });
    const setup = m => {
      if (o.extra && m.x != null && cfg[o.extra.key] !== m.x) { cfg[o.extra.key] = m.x; mark(o.extra.key, m.x); if (o.reconfig) o.reconfig(o.extra.key); }
      if (m.r === 1) resetTally();
      begin(m.r);
    };
    function onData(m) {
      if (!net() || !N.role || !m) return;
      const host = N.role === 'host';
      if (m.t === 'hi') { if (host) { if (N.live) api.net.send(sync()); else { N.live = true; resetTally(); begin(1); } } }
      else if (m.t === 'new' || m.t === 'sync') { if (!host) { N.live = true; setup(m); if (m.mv) o.load(m.mv); } }
      else if (m.t === 'sync?') { if (host) api.net.send(sync()); }
      else if (m.t === 'mv') { if (m.r === round && N.live && !over && !o.remote(m.n, m.m)) api.net.send(host ? sync() : { t: 'sync?' }); }
      else if (m.t === 're') {
        if (!N.live) return;
        N.theirRe = true;
        if (!over) return;
        if (host && N.myRe) begin(round + 1);
        else if (!N.myRe) { st.className = 'st turn'; st.textContent = 'Your friend wants a rematch'; api.sfx('pop'); }
      }
    }
    function hook() {
      N.hooked = true;
      api.net.on('data', onData);
      api.net.on('close', () => {
        if (!net() || !N.role) return;
        N.role = null; N.live = false; over = true; gen++;
        sL.classList.remove('on'); sR.classList.remove('on');
        st.className = 'st R'; st.textContent = 'Your friend left'; foot.classList.remove('over'); label(); api.sfx('lose');
        api.overlay({ kicker: 'Online', title: 'Your friend left', text: 'The connection to your friend was lost.', button: 'New room', onAction: () => { newMatch(); goOnline('ai'); }, secondary: 'Play vs AI', onSecondary: () => setMode('ai') });
      });
      api.interval(() => { if (net()) conn(); }, 1000);
    }
    bindSeg(opts, (k, v) => {
      api.sfx('tick');
      if (k === 'mode') return setMode(v);
      cfg[k] = v; api.save(cfg); label();
      newMatch();
      if (o.reconfig) o.reconfig(k);
      begin(1);
    });
    nx.addEventListener('click', next);
    root.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !touch()) { root.classList.add('touch'); label(); if (!over && who) turn(who); } }, true);
    noFocus(root);
    label(); api.score(cfg.mode === 'ai' ? 0 : '—');
    return {
      head, foot, next, turn, cfg,
      get ai() { return cfg.mode === 'ai'; },
      get over() { return over; },
      local: w => cfg.mode === 'ai' ? w === 'L' : N.live && w === N.mine,
      moved(n, m, remote) { if (net() && N.live && (!remote || N.role === 'host')) api.net.send({ t: 'mv', r: round, n, m }); },
      start: () => { if (api.net.invite || net()) { cfg.mode = 'net'; mark('mode', 'net'); label(); goOnline('ai'); } else begin(1); },
      finish(res, ms) {
        over = true; tally[res]++;
        const v = head.querySelector(`[data-k="${res}"] .v`);
        v.textContent = tally[res];
        anim(v, [{ transform: 'none' }, { transform: 'scale(1.3)', color: C.accent, offset: .35 }, { transform: 'none' }], { duration: 650, easing: EASE });
        let text;
        if (cfg.mode === 'ai') {
          if (res === 'L') { streak++; api.submit(streak); }
          if (res === 'R') { if (streak) api.submit(streak); streak = 0; }
          api.score(streak);
          text = res === 'L' ? (streak > 1 ? `You win · ${streak} in a row` : 'You win!') : res === 'R' ? 'AI takes this round' : streak ? 'Draw · streak kept' : 'Draw';
          st.className = 'st ' + res;
          api.sfx(res === 'L' ? 'win' : res === 'R' ? 'lose' : 'pop');
        } else {
          const mine = res === N.mine;
          text = res === 'draw' ? 'Draw' : mine ? 'You win!' : 'Your friend wins';
          st.className = 'st ' + (res === 'draw' ? '' : mine ? 'L' : 'R');
          api.sfx(res === 'draw' ? 'pop' : mine ? 'win' : 'lose');
          if (N.theirRe) text += ' · friend wants a rematch';
        }
        sL.classList.remove('on'); sR.classList.remove('on');
        st.textContent = text;
        foot.style.setProperty('--t', ms + 'ms'); foot.classList.add('over');
        if (net()) return;
        const g = gen;
        api.timeout(() => { if (g === gen) next(); }, ms);
      }
    };
  }

  const TTL = {};
  function ttLines(n) {
    if (TTL[n]) return TTL[n];
    const L = [], d1 = [], d2 = [];
    for (let r = 0; r < n; r++) { const row = [], col = []; for (let c = 0; c < n; c++) { row.push(r * n + c); col.push(c * n + r); } L.push(row, col); d1.push(r * n + r); d2.push(r * n + n - 1 - r); }
    L.push(d1, d2);
    const by = Array.from({ length: n * n }, () => []);
    L.forEach(l => l.forEach(i => by[i].push(l)));
    const order = [...Array(n * n).keys()].sort((a, b) => by[b].length - by[a].length);
    return (TTL[n] = { L, by, order });
  }
  const ttWin = b => ttLines(Math.round(Math.sqrt(b.length))).L.find(l => b[l[0]] && l.every(i => b[i] === b[l[0]])) || null;
  const ttDead = b => ttLines(Math.round(Math.sqrt(b.length))).L.every(l => l.some(i => b[i] === 1) && l.some(i => b[i] === -1));
  function ttNm(b, p, d) {
    if (ttWin(b)) return d - 10;
    let best = -99, any = false;
    for (let i = 0; i < 9; i++) if (!b[i]) { any = true; b[i] = p; const s = -ttNm(b, -p, d + 1); b[i] = 0; if (s > best) best = s; }
    return any ? best : 0;
  }
  function ttAi(b, diff, p = -1) {
    const empt = [];
    b.forEach((v, i) => { if (!v) empt.push(i); });
    if (empt.length === 9 || (diff === 'Easy' && Math.random() < .7)) return rnd(empt);
    const sc = empt.map(i => { b[i] = p; const s = -ttNm(b, -p, 1); b[i] = 0; return s; });
    const max = Math.max(...sc), worse = empt.filter((_, k) => sc[k] < max);
    if (diff === 'Normal' && worse.length && Math.random() < .25) return rnd(worse);
    return rnd(empt.filter((_, k) => sc[k] === max));
  }

  const T4W = [0, 1, 6, 40, 0];
  function t4Scores(b, depth, me) {
    const { L, by, order } = ttLines(4);
    const won = (i, p) => by[i].some(l => l.every(k => b[k] === p));
    const ev = p => {
      let s = 0;
      for (const l of L) { let a = 0, o = 0; for (const k of l) { const v = b[k]; if (v === p) a++; else if (v) o++; } if (!o) s += T4W[a]; else if (!a) s -= T4W[o]; }
      return s;
    };
    function nm(d, al, be, p) {
      let any = false;
      for (const i of order) if (!b[i]) { any = true; b[i] = p; const w = won(i, p); b[i] = 0; if (w) return 1000 + d; }
      if (!any) return 0;
      if (d === 0) return ev(p);
      let best = -Infinity;
      for (const i of order) if (!b[i]) {
        b[i] = p; const s = -nm(d - 1, -be, -al, -p); b[i] = 0;
        if (s > best) { best = s; if (s > al) { al = s; if (al >= be) break; } }
      }
      return best;
    }
    const out = [];
    for (const i of order) if (!b[i]) {
      b[i] = me;
      const s = won(i, me) ? 2000 : -nm(depth - 1, -Infinity, Infinity, -me);
      b[i] = 0; out.push([i, s]);
    }
    return out;
  }
  function t4Ai(b, diff, p = -1) {
    const empt = [];
    b.forEach((v, i) => { if (!v) empt.push(i); });
    if (empt.length >= 15) return rnd(empt.filter(i => [5, 6, 9, 10].includes(i)));
    if (diff === 'Easy' && Math.random() < .55) return rnd(empt);
    const sc = t4Scores(b, diff === 'Hard' ? 5 : diff === 'Normal' ? 3 : 1, p), max = Math.max(...sc.map(x => x[1]));
    const worse = sc.filter(x => x[1] < max && x[1] > -900);
    if (diff === 'Normal' && worse.length && Math.random() < .2) return rnd(worse)[0];
    return rnd(sc.filter(x => x[1] === max))[0];
  }
  const MX = '<svg class="mk x" viewBox="0 0 100 100" aria-hidden="true"><path d="M30 30L70 70"/><path d="M70 30L30 70"/></svg>';
  const MO = '<svg class="mk o" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 27a23 23 0 1 1 0 46a23 23 0 1 1 0-46"/></svg>';
  const GX = '<svg class="gl" viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="#ff4d6d" stroke-width="2.6" stroke-linecap="round"/></svg>';
  const GO = '<svg class="gl" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.8" fill="none" stroke="#f5b400" stroke-width="2.6"/></svg>';

  Ameplay.register({
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    category: 'Board',
    blurb: 'Three in a row vs the AI or a friend online, plus a tricky 4×4 mode.',
    help: 'Tap a square · <kbd>1</kbd>–<kbd>9</kbd> on 3×3 · <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> + <kbd>Space</kbd> · <kbd>N</kbd> next round',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 560,
    engine: { ttAi, ttWin, t4Ai, ttDead },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 8v48M40 8v48M8 24h48M8 40h48" opacity=".3"/><path d="M12 12l8 8M20 12l-8 8M44 44l8 8M52 44l-8 8"/><circle cx="32" cy="32" r="4.5"/><circle cx="48" cy="16" r="4.5"/></svg>',
    css: duelCss('.gm-tictactoe') + `
.gm-tictactoe .gl{width:12px;height:12px}
.gm-tictactoe .board{position:relative;width:min(370px,100%,max(240px,100dvh - 440px));aspect-ratio:1;touch-action:none;border-radius:28px;background:radial-gradient(120% 90% at 30% 0%,#86e3ff,#2fb6e8 58%,#1b8fcb);box-shadow:inset 0 3px 0 rgba(255,255,255,.4),inset 0 -6px 0 rgba(0,40,80,.18),0 18px 34px -16px rgba(20,110,170,.75)}
.gm-tictactoe .board::before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 80% 85%,rgba(255,255,255,.18),transparent 40%);pointer-events:none}
.gm-tictactoe .in{position:absolute;inset:5%}
.gm-tictactoe svg.tlines,.gm-tictactoe svg.win{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.gm-tictactoe .in path{fill:none;stroke-linecap:round;animation:gm-tictactoe-draw .3s var(--ease) forwards}
.gm-tictactoe .tlines{filter:drop-shadow(0 3px 0 rgba(0,60,110,.2))}
.gm-tictactoe .tlines path{stroke:#fff;stroke-width:9;stroke-dasharray:300 600;stroke-dashoffset:301;animation-duration:.6s}
.gm-tictactoe .tlines path:nth-child(2){animation-delay:.06s}
.gm-tictactoe .tlines path:nth-child(3){animation-delay:.12s}
.gm-tictactoe .tlines path:nth-child(4){animation-delay:.18s}
.gm-tictactoe .tlines path:nth-child(5){animation-delay:.24s}
.gm-tictactoe .tlines path:nth-child(6){animation-delay:.3s}
.gm-tictactoe .cells{position:absolute;inset:0;display:grid;grid-template:repeat(var(--n),1fr)/repeat(var(--n),1fr)}
.gm-tictactoe .c{position:relative;margin:7%;border-radius:18%}
.gm-tictactoe .mine .c:not(.f){cursor:pointer}
@media (hover:hover){.gm-tictactoe .mine .c:not(.f):hover{background:rgba(255,255,255,.16)}}
.gm-tictactoe .c.cur{box-shadow:inset 0 0 0 4px rgba(255,255,255,.85)}
.gm-tictactoe .c.last{background:rgba(255,255,255,.2)}
.gm-tictactoe .c svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 4px 0 rgba(0,50,100,.25));transition:opacity .35s var(--ease)}
.gm-tictactoe .c.dim svg{opacity:.3;transition-delay:.3s}
.gm-tictactoe .c svg.out{opacity:0;transition-delay:0s}
.gm-tictactoe .mk path{stroke-width:15}
.gm-tictactoe .x path{stroke:#ff4d6d;stroke-dasharray:57 200;stroke-dashoffset:58;animation-duration:.14s}
.gm-tictactoe .x path+path{animation-delay:.1s}
.gm-tictactoe .o path{stroke:#ffd23f;stroke-dasharray:146 400;stroke-dashoffset:147;animation-duration:.24s}
.gm-tictactoe .win{filter:drop-shadow(0 0 6px rgba(255,255,255,.9))}
.gm-tictactoe .win path{stroke:#1d2b4f;stroke-width:9;animation-duration:.4s;animation-delay:.18s;transition:opacity .35s}
.gm-tictactoe .win path.out{opacity:0}
@keyframes gm-tictactoe-draw{to{stroke-dashoffset:0}}
@media (pointer:coarse){.gm-tictactoe .board{width:min(370px,100%,max(200px,100dvh - 460px))}}
`,
    mount(root, api) {
      let n = 3, b = Array(9).fill(0), turn = null, rg = 0, cur = -1, cells = [], mv = [];
      const d = duel(root, api, {
        title: 'Tic-Tac-Toe', glyph: [GX, GO],
        extra: { key: 'size', opts: [['3', '3×3'], ['4', '4×4']] },
        round: newRound, reconfig: k => { if (k === 'size') build(); },
        remote, list: () => mv.slice(), load: l => { for (const i of l) if (!remote(mv.length, i, true)) break; }
      });
      const board = h('div', 'board');
      root.append(d.head, board, d.foot);
      const sideOf = p => p === 1 ? 'L' : 'R';
      const fade = el => { el.classList.add('out'); api.timeout(() => el.remove(), 360); };
      let win;

      function build() {
        n = d.cfg.size === '4' ? 4 : 3; b = Array(n * n).fill(0); cur = -1;
        board.style.setProperty('--n', n);
        let lines = '';
        for (let k = 1; k < n; k++) { const x = k * 300 / n; lines += `<path d="M${x} 8V292"/>`; }
        for (let k = 1; k < n; k++) { const y = k * 300 / n; lines += `<path d="M8 ${y}H292"/>`; }
        board.innerHTML = `<div class="in"><svg class="tlines" viewBox="0 0 300 300" aria-hidden="true">${lines}</svg><div class="cells">${'<div class="c" role="button"></div>'.repeat(n * n)}</div><svg class="win" viewBox="0 0 300 300" aria-hidden="true"></svg></div>`;
        cells = [...board.querySelectorAll('.c')]; win = board.querySelector('svg.win');
        cells.forEach((c, i) => c.setAttribute('aria-label', 'Square ' + (i + 1)));
      }
      const canPlay = () => turn !== null && d.local(sideOf(turn));
      const showCur = () => cells.forEach((c, i) => c.classList.toggle('cur', i === cur));
      function newRound(rightFirst) {
        rg++;
        if (b.length !== n * n || cells.length !== n * n) build();
        b.fill(0); turn = null; mv = [];
        cells.forEach(c => { c.classList.remove('f', 'dim', 'last'); c.querySelectorAll('svg').forEach(fade); });
        win.querySelectorAll('path').forEach(fade);
        go(rightFirst ? -1 : 1);
      }
      function go(p) {
        turn = p;
        board.classList.toggle('mine', canPlay());
        if (d.ai && p === -1) {
          d.turn('R', 'Thinking…');
          const g = rg;
          api.timeout(() => { if (g === rg) play(n === 3 ? ttAi(b, d.cfg.diff) : t4Ai(b, d.cfg.diff), -1); }, 300 + Math.random() * 200);
        } else d.turn(sideOf(p));
      }
      function play(i, p, rem) {
        d.moved(mv.length, i, rem); mv.push(i);
        b[i] = p;
        cells.forEach(c => c.classList.toggle('last', c === cells[i]));
        cells[i].classList.add('f');
        cells[i].insertAdjacentHTML('beforeend', p === 1 ? MX : MO);
        api.sfx(p === 1 ? 'tap' : 'tick');
        const line = ttWin(b);
        if (line) return end(p === 1 ? 'L' : 'R', line, p);
        if (!b.includes(0) || ttDead(b)) return end('draw');
        go(-p);
      }
      function end(res, line) {
        turn = null; board.classList.remove('mine');
        if (line) {
          const at = k => [(k % n + .5) * 300 / n, (Math.floor(k / n) + .5) * 300 / n];
          const [x1, y1] = at(line[0]), [x2, y2] = at(line[line.length - 1]), len = Math.hypot(x2 - x1, y2 - y1);
          const ux = (x2 - x1) / len * 30, uy = (y2 - y1) / len * 30, L = Math.ceil(len + 60);
          win.innerHTML = `<path d="M${x1 - ux} ${y1 - uy}L${x2 + ux} ${y2 + uy}" style="stroke-dasharray:${L + 2} ${2 * L};stroke-dashoffset:${L + 3}"/>`;
          cells.forEach((c, i) => c.classList.toggle('dim', !line.includes(i)));
        } else cells.forEach(c => c.classList.add('dim'));
        d.finish(res, 1400);
      }
      const human = i => { if (i >= 0 && canPlay() && !b[i]) play(i, turn); };
      function remote(k, i, force) {
        if (k < mv.length) return mv[k] === i;
        if (k !== mv.length || turn === null || (!force && d.local(sideOf(turn))) || !(i >= 0 && i < b.length) || b[i]) return false;
        play(i, turn, true);
        return true;
      }

      board.addEventListener('pointerdown', e => {
        if (e.button || !e.isPrimary) return;
        if (cur >= 0) { cur = -1; showCur(); }
        human(cells.indexOf(e.target.closest('.c')));
      });
      const NUM = [7, 8, 9, 4, 5, 6, 1, 2, 3];
      const MOVE = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
      api.on(window, 'keydown', e => {
        if (e.repeat && !MOVE[e.key]) return;
        if (onBtn(e) && (e.key === 'Enter' || e.key === ' ')) return;
        const m = /^(Digit|Numpad)([1-9])$/.exec(e.code || ''), mv = MOVE[e.key];
        if (m) { if (n === 3) human(m[1] === 'Numpad' ? NUM.indexOf(+m[2]) : m[2] - 1); }
        else if (mv) {
          cur = cur < 0 ? (n === 3 ? 4 : 5) : Math.max(0, Math.min(n - 1, Math.floor(cur / n) + mv[0])) * n + Math.max(0, Math.min(n - 1, cur % n + mv[1]));
          showCur();
        } else if (e.key === 'Enter' || e.key === ' ') { if (d.over) d.next(); else if (cur >= 0) human(cur); else { cur = n === 3 ? 4 : 5; showCur(); } }
        else if (e.key === 'n' || e.key === 'N') d.next();
        else return;
        e.preventDefault();
      });
      build();
      d.start();
    }
  });

  const C4W = [], C4BY = Array.from({ length: 42 }, () => []);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const r3 = r + 3 * dr, c3 = c + 3 * dc;
    if (r3 > 5 || c3 < 0 || c3 > 6) continue;
    const w = [0, 1, 2, 3].map(k => (r + k * dr) * 7 + c + k * dc);
    C4W.push(w); w.forEach(i => C4BY[i].push(w));
  }
  const C4ORD = [3, 2, 4, 1, 5, 0, 6], C4SC = [0, 1, 5, 40], C4WIN = 1e6;
  function c4Won(b, i, p) {
    const ws = C4BY[i];
    for (let k = 0; k < ws.length; k++) { const w = ws[k]; if (b[w[0]] === p && b[w[1]] === p && b[w[2]] === p && b[w[3]] === p) return true; }
    return false;
  }
  function c4Eval(b) {
    let s = 0;
    for (let k = 0; k < C4W.length; k++) {
      const w = C4W[k];
      let a = 0, o = 0;
      for (let j = 0; j < 4; j++) { const v = b[w[j]]; if (v === 1) a++; else if (v === -1) o++; }
      if (!o) s += C4SC[a]; else if (!a) s -= C4SC[o];
    }
    for (let r = 0; r < 6; r++) s += 3 * b[r * 7 + 3];
    return s;
  }
  function c4Best(cells, depth, me = 1) {
    const b = Int8Array.from(cells), ht = new Int8Array(7);
    let n = 0;
    for (let i = 0; i < 42; i++) if (b[i]) { n++; ht[i % 7]++; }
    function nm(d, a, be, p) {
      if (n === 42) return 0;
      for (const c of C4ORD) if (ht[c] < 6) { const i = ht[c] * 7 + c; b[i] = p; const w = c4Won(b, i, p); b[i] = 0; if (w) return C4WIN + d; }
      if (d === 0) return p * c4Eval(b);
      let best = -Infinity;
      for (const c of C4ORD) {
        if (ht[c] === 6) continue;
        const i = ht[c] * 7 + c;
        b[i] = p; ht[c]++; n++;
        const s = -nm(d - 1, -be, -a, -p);
        b[i] = 0; ht[c]--; n--;
        if (s > best) { best = s; if (s > a) { a = s; if (a >= be) break; } }
      }
      return best;
    }
    let best = -Infinity, moves = [];
    for (const c of C4ORD) {
      if (ht[c] === 6) continue;
      const i = ht[c] * 7 + c;
      b[i] = me;
      let s;
      if (c4Won(b, i, me)) s = C4WIN + depth;
      else { ht[c]++; n++; s = -nm(depth - 1, -Infinity, 1 - best, -me); ht[c]--; n--; }
      b[i] = 0;
      if (s > best) { best = s; moves = [c]; } else if (s === best) moves.push(c);
    }
    return rnd(moves);
  }
  const c4Line = (b, i, p) => {
    const s = new Set();
    for (const w of C4BY[i]) if (w.every(k => b[k] === p)) w.forEach(k => s.add(k));
    return s.size ? [...s] : null;
  };
  const C4DEPTH = { Easy: 2, Normal: 4, Hard: 7 };
  const C4FACE = (() => {
    let holes = '', rims = '';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
      const x = 50 + c * 100, y = 50 + r * 100;
      holes += `M${x - 36} ${y}a36 36 0 1 0 72 0a36 36 0 1 0-72 0`;
      rims += `<circle cx="${x}" cy="${y}" r="38.5"/>`;
    }
    return `<svg class="face" viewBox="0 0 700 600" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gmc4-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a86ff"/><stop offset="1" stop-color="#2848c9"/></linearGradient></defs><path fill="url(#gmc4-blue)" fill-rule="evenodd" d="M26 0H674A26 26 0 0 1 700 26V574A26 26 0 0 1 674 600H26A26 26 0 0 1 0 574V26A26 26 0 0 1 26 0Z${holes}"/><g class="rim">${rims}</g><path class="hl" d="M26 4H674A22 22 0 0 1 696 26" /></svg>`;
  })();
  const DOT = c => `<i class="dot ${c}"></i>`;

  Ameplay.register({
    id: 'connect-four',
    title: 'Connect Four',
    category: 'Board',
    blurb: 'Drop discs, line up four, outthink the AI or a friend online.',
    help: '<kbd>1</kbd>–<kbd>7</kbd> or click a column · <kbd>←</kbd> <kbd>→</kbd> aim, <kbd>↓</kbd> drop · <kbd>N</kbd> next round',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 660,
    engine: { c4Best, c4Line },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="19" width="48" height="36" rx="6"/><circle cx="38" cy="9.5" r="3.5" fill="currentColor"/><circle cx="14" cy="25" r="3.5"/><circle cx="26" cy="25" r="3.5"/><circle cx="38" cy="25" r="3.5"/><circle cx="50" cy="25" r="3.5"/><circle cx="14" cy="37" r="3.5"/><circle cx="26" cy="37" r="3.5" fill="currentColor"/><circle cx="38" cy="37" r="3.5" fill="currentColor" opacity=".3"/><circle cx="50" cy="37" r="3.5"/><circle cx="14" cy="49" r="3.5" fill="currentColor"/><circle cx="26" cy="49" r="3.5" fill="currentColor" opacity=".3"/><circle cx="38" cy="49" r="3.5" fill="currentColor"/><circle cx="50" cy="49" r="3.5" fill="currentColor" opacity=".3"/></svg>',
    css: duelCss('.gm-connect-four') + `
.gm-connect-four .dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff9a9a,#e5262e 60%,#a50f16)}
.gm-connect-four .dot.y{background:radial-gradient(circle at 35% 30%,#fff3a0,#ffc61a 60%,#c98a00)}
.gm-connect-four .c4wrap{position:relative;width:min(560px,100%,max(260px,(100dvh - 450px) * 1.05));touch-action:none;padding-bottom:3.5%}
.gm-connect-four .c4wrap.mine{cursor:pointer}
.gm-connect-four .c4wrap::before,.gm-connect-four .c4wrap::after{content:"";position:absolute;bottom:0;width:7%;height:9%;border-radius:8px 8px 6px 6px;background:linear-gradient(#2a46b8,#1a2f85);box-shadow:0 6px 10px -4px rgba(20,30,90,.6)}
.gm-connect-four .c4wrap::before{left:-2%}
.gm-connect-four .c4wrap::after{right:-2%}
.gm-connect-four .c4aim{position:relative;aspect-ratio:7/1;margin-bottom:4px}
.gm-connect-four .c4ghost{position:absolute;top:0;left:0;width:calc(100% / 7);height:100%;transform:translateX(calc(var(--c, 3) * 100%));transition:transform .09s ease-out}
.gm-connect-four .c4ghost::before{content:"";position:absolute;inset:11%;border-radius:50%;background:radial-gradient(circle at 36% 30%,#ff9a9a 0 8%,#f43f3f 32%,#c3141c 74%);box-shadow:0 6px 10px -4px rgba(150,10,20,.6);animation:gmc4-bob 1.1s ease-in-out infinite}
.gm-connect-four .c4ghost.y::before{background:radial-gradient(circle at 36% 30%,#fff6b0 0 8%,#ffd43b 32%,#eba500 74%);box-shadow:0 6px 10px -4px rgba(170,120,0,.6)}
.gm-connect-four .c4ghost.off{opacity:0}
@keyframes gmc4-bob{50%{transform:translateY(-6%)}}
.gm-connect-four .board{position:relative;aspect-ratio:7/6;border-radius:3.7% / 4.3%;background:radial-gradient(circle at 50% 35%,#163f9c,#0a1f5a);box-shadow:0 20px 32px -16px rgba(20,40,120,.75)}
.gm-connect-four .discs{position:absolute;inset:0;clip-path:inset(-40% -2% 0 -2%);pointer-events:none}
.gm-connect-four .face{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;filter:drop-shadow(0 -1px 0 rgba(255,255,255,.2))}
.gm-connect-four .face .rim circle{fill:none;stroke:#1c39a6;stroke-width:5;opacity:.9}
.gm-connect-four .face .hl{fill:none;stroke:rgba(255,255,255,.45);stroke-width:5;stroke-linecap:round}
.gm-connect-four .d{position:absolute;width:calc(100% / 7);height:calc(100% / 6);transition:opacity .5s var(--ease) .15s}
.gm-connect-four .d::before{content:"";position:absolute;inset:11%;border-radius:50%;background:radial-gradient(circle at 36% 30%,#ff9a9a 0 8%,#f43f3f 32%,#c3141c 74%,#99101a)}
.gm-connect-four .d.y::before{background:radial-gradient(circle at 36% 30%,#fff6b0 0 8%,#ffd43b 32%,#eba500 74%,#bf8500)}
.gm-connect-four .d::after{content:"";position:absolute;inset:26%;border-radius:50%;border:3px solid rgba(0,0,0,.13);box-shadow:inset 0 2px 0 rgba(0,0,0,.08),0 2px 0 rgba(255,255,255,.28)}
.gm-connect-four .d.last::after{border-color:rgba(255,255,255,.7)}
.gm-connect-four .d.win::after{border-color:#fff;box-shadow:0 0 12px #fff,inset 0 0 8px #fff;animation:gmc4-glow .8s ease-in-out infinite alternate}
.gm-connect-four .d.dim{opacity:.55}
@keyframes gmc4-glow{to{transform:scale(1.15)}}
`,
    mount(root, api) {
      const b = new Int8Array(42), ht = new Int8Array(7), els = new Array(42).fill(null);
      let n = 0, turn = null, rg = 0, col = 3, aim = false, mv = [];
      const d = duel(root, api, { title: 'Connect Four', glyph: [DOT(''), DOT('y')], round: newRound, remote, list: () => mv.slice(), load: l => { for (const c of l) if (!remote(mv.length, c, true)) break; } });
      const sideOf = p => p === -1 ? 'L' : 'R';
      const wrap = h('div', 'c4wrap', `<div class="c4aim"><div class="c4ghost off"></div></div><div class="board"><div class="discs"></div>${C4FACE}</div>`);
      root.append(d.head, wrap, d.foot);
      const ghost = wrap.querySelector('.c4ghost'), board = wrap.querySelector('.board'), discs = wrap.querySelector('.discs');
      const canPlay = () => turn !== null && d.local(sideOf(turn));
      const showGhost = () => {
        ghost.style.setProperty('--c', col);
        ghost.classList.toggle('y', turn === 1);
        ghost.classList.toggle('off', !(canPlay() && aim && ht[col] < 6));
        wrap.classList.toggle('mine', canPlay());
      };

      function newRound(rightFirst) {
        rg++;
        els.forEach((el, i) => {
          if (!el) return;
          els[i] = null;
          const delay = (i % 7) * 22 + (i / 7 | 0) * 12;
          anim(el, [{ transform: 'none' }, { transform: 'translateY(720%)' }], { duration: 560, delay, easing: 'cubic-bezier(.5,0,.9,.45)', fill: 'forwards' });
          api.timeout(() => el.remove(), 620 + delay);
        });
        b.fill(0); ht.fill(0); n = 0; turn = null; mv = [];
        go(rightFirst ? 1 : -1);
      }
      function go(p) {
        turn = p; showGhost();
        if (d.ai && p === 1) {
          d.turn('R', 'Thinking…');
          const g = rg, t0 = performance.now();
          api.timeout(() => {
            if (g !== rg) return;
            const c = c4Best(b, C4DEPTH[d.cfg.diff]);
            api.timeout(() => { if (g === rg) drop(c, 1); }, Math.max(0, 420 + Math.random() * 200 - (performance.now() - t0)));
          }, 30);
        } else d.turn(sideOf(p));
      }
      function drop(c, p, rem) {
        if (turn !== p || ht[c] === 6) return;
        d.moved(mv.length, c, rem); mv.push(c);
        const r = ht[c], i = r * 7 + c, row = 5 - r;
        b[i] = p; ht[c]++; n++;
        const el = h('div', p === 1 ? 'd y' : 'd');
        el.style.left = c * 100 / 7 + '%'; el.style.top = row * 100 / 6 + '%';
        els.forEach(x => x && x.classList.remove('last'));
        el.classList.add('last');
        discs.append(el); els[i] = el;
        const dist = row + 1, dur = 130 * Math.sqrt(dist) + 150;
        anim(el, [
          { transform: `translateY(calc(${-dist * 100}% - 8px))`, easing: 'cubic-bezier(.5,0,1,.6)' },
          { transform: 'translateY(0)', offset: .7, easing: 'cubic-bezier(0,.5,.5,1)' },
          { transform: `translateY(${-(4 + dist * 1.6)}%)`, offset: .85, easing: 'cubic-bezier(.5,0,1,.5)' },
          { transform: 'translateY(0)' }
        ], { duration: dur });
        const g = rg, land = dur * .7;
        api.timeout(() => { if (g === rg) api.sfx(p === 1 ? 'tick' : 'tap'); }, land);
        const four = c4Line(b, i, p);
        if (four || n === 42) {
          turn = null; showGhost();
          api.timeout(() => { if (g === rg) end(four ? (p === -1 ? 'L' : 'R') : 'draw', four); }, land);
        } else go(-p);
      }
      function end(res, four) {
        turn = null; showGhost();
        if (four) els.forEach((el, i) => { if (el) el.classList.add(four.includes(i) ? 'win' : 'dim'); });
        d.finish(res, 2000);
      }
      const youDrop = c => { if (canPlay()) drop(c, turn); };
      function remote(k, c, force) {
        if (k < mv.length) return mv[k] === c;
        if (k !== mv.length || turn === null || (!force && d.local(sideOf(turn))) || !(c >= 0 && c < 7) || ht[c] === 6) return false;
        drop(c, turn, true);
        return true;
      }
      const aimAt = e => {
        const r = board.getBoundingClientRect();
        if (!r.width) return;
        col = Math.max(0, Math.min(6, Math.floor((e.clientX - r.left) / r.width * 7)));
        aim = true; showGhost();
      };
      wrap.addEventListener('pointermove', aimAt);
      wrap.addEventListener('pointerdown', e => { if (e.button === 0 && e.isPrimary) { aimAt(e); youDrop(col); showGhost(); } });
      wrap.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { aim = false; showGhost(); } });
      api.on(window, 'keydown', e => {
        if (onBtn(e) && (e.key === 'Enter' || e.key === ' ')) return;
        const m = /^(?:Digit|Numpad)([1-7])$/.exec(e.code || ''), k = e.key;
        if (m) { if (!e.repeat) { col = m[1] - 1; aim = true; youDrop(col); showGhost(); } }
        else if (k === 'ArrowLeft' || k === 'ArrowRight') { col = Math.max(0, Math.min(6, col + (k === 'ArrowLeft' ? -1 : 1))); aim = true; showGhost(); }
        else if (k === 'ArrowDown' || k === 'Enter' || k === ' ') { if (!e.repeat) { if (d.over) d.next(); else { aim = true; youDrop(col); showGhost(); } } }
        else if (k === 'n' || k === 'N') d.next();
        else return;
        e.preventDefault();
      });
      d.start();
    }
  });

})();

