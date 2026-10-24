(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeIO = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const rint = (n, R = Math.random) => Math.floor(R() * n);
  const shuffle = (a, R = Math.random) => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1, R); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const NAMES = ['Maya', 'Leo', 'Nora', 'Theo', 'Iris', 'Kai', 'Zoe', 'Finn', 'Ada', 'Otto', 'Luna', 'Remy', 'Sasha', 'Milo', 'Vera', 'Jules'];
  const SEAT = ['#f4c542', '#ff7a6b', '#49c9bd', '#9d8cff', '#6ec26a', '#ff9f43'];
  const now = () => performance.now();

  const ICON = {
    menu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    help: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>',
    hint: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    undo: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>'
  };

  function audioKit(api) {
    let ac = null, nb = null;
    const ctx = () => {
      try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; }
    };
    const tone = (f, d, type, vol, f2, delay = 0) => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .03);
      } catch (e) {}
    };
    const noise = (d, vol, freq, q, delay = 0) => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        if (!nb) { nb = c.createBuffer(1, c.sampleRate * .3, c.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
        const t = c.currentTime + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = nb; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        s.connect(f).connect(g).connect(c.destination); s.start(t, Math.random() * .1); s.stop(t + d + .02);
      } catch (e) {}
    };
    const K = {
      clack(v = 1) { noise(.05, .5 * v, 1500 + Math.random() * 700, 2.2); tone(190 + Math.random() * 40, .07, 'triangle', .16 * v, 90); },
      slide() { noise(.12, .12, 900, 1.2); },
      die(v = 1) { noise(.04, .42 * v, 2300 + Math.random() * 900, 3.4); tone(520 + Math.random() * 160, .035, 'square', .03 * v, 260); },
      rattle(n = 9) { for (let i = 0; i < n; i++) noise(.035, .28, 1800 + Math.random() * 1600, 2.8, i * .055 + Math.random() * .02); },
      tick() { tone(1500, .03, 'square', .02, 1100); },
      peg() { noise(.03, .3, 1100, 2); tone(300, .06, 'sine', .08, 160); },
      pop() { tone(880, .06, 'sine', .06, 440); },
      good() { tone(660, .1, 'sine', .07, 990); },
      bad() { tone(220, .18, 'triangle', .08, 120); },
      pass() { tone(330, .12, 'sine', .06, 250); tone(250, .16, 'sine', .05, 190, .1); },
      score(n = 1) { for (let i = 0; i < Math.min(4, n); i++) tone(660 + i * 165, .16, 'sine', .08, 0, i * .07); },
      win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .24, 'triangle', .09, 0, i * .11)); },
      lose() { [392, 330, 262].forEach((f, i) => tone(f, .26, 'sine', .08, 0, i * .14)); },
      close() { try { if (ac) ac.close(); } catch (e) {} }
    };
    return K;
  }

  function Pane(host) {
    const el = document.createElement('div');
    el.className = 'gx-pane'; el.hidden = true; host.append(el);
    let cb = null, kind = '';
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-a]');
      if (!b || !cb) return;
      ev.stopPropagation();
      cb(b.dataset.a, b, ev);
    });
    return {
      el,
      get open() { return !el.hidden; },
      get kind() { return kind; },
      show(k, html, fn, cls = '') { kind = k; cb = fn; el.className = 'gx-pane ' + cls; el.innerHTML = html; el.hidden = false; el.scrollTop = 0; },
      hide() { el.hidden = true; kind = ''; cb = null; el.innerHTML = ''; }
    };
  }

  const seg = (k, opts, cur) => `<div class="gx-seg">${opts.map(([v, l]) => `<button data-a="set:${k}:${v}" class="${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const row = (label, hint, ctl) => `<div class="gx-opt"><span>${label}${hint ? `<small>${hint}</small>` : ''}</span>${ctl}</div>`;
  const parseV = v => v === 'true' ? true : v === 'false' ? false : /^-?\d+(\.\d+)?$/.test(v) ? +v : v;

  const svGet = (id, code) => { try { const x = JSON.parse(sessionStorage.getItem('gameplay:sv-' + id) || 'null'); return x && x.code === code && Date.now() - x.at < 432e5 ? x.o : null; } catch (e) { return null; } };
  const svPut = (id, code, o) => { try { sessionStorage.setItem('gameplay:sv-' + id, JSON.stringify({ code, at: Date.now(), o })); } catch (e) {} };
  const svDel = id => { try { sessionStorage.removeItem('gameplay:sv-' + id); } catch (e) {} };
  function svMap(sv, players) {
    const used = {}, map = {};
    for (const g of players.slice(1)) {
      const q = sv.human.findIndex((h, i) => i > 0 && h && !used[i] && sv.names[i] === g.name);
      if (q < 0) return null;
      used[q] = 1; map[q] = g;
    }
    return map;
  }
  const svAsk = (pane, txt, fn) => pane.show('resume', `<div class="gx-box"><p class="gx-kick">Online</p><h3>Game in progress</h3><p>${txt}</p><button class="gx-big" data-a="go">Resume game</button><button class="gx-big alt" data-a="new">New game</button><button class="gx-big red" data-a="leave">Leave</button></div>`, fn);

  function hookNet(api, h) {
    const n = api.net;
    n.on('data', h.data);
    n.on('leave', p => h.leave && h.leave(p));
    n.on('rejoin', p => h.rejoin && h.rejoin(p));
    n.on('lobby', () => h.lobby && h.lobby());
    n.on('close', r => h.close && h.close(r));
  }

  const baseCss = (id, acc) => `
.gm-${id}{gap:0;--gx-acc:${acc};--gx-ink:#f4f1e6}
.gm-${id} [hidden]{display:none!important}
.gm-${id} *{box-sizing:border-box}
.gm-${id} .gx-ui{position:absolute;inset:0;pointer-events:none;font-family:var(--sans);color:var(--gx-ink)}
.gm-${id} .gx-ui button,.gm-${id} .gx-pane button{font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-${id} .gx-top{position:absolute;left:8px;right:8px;top:8px;display:flex;align-items:center;gap:8px;pointer-events:none}
.gm-${id} .gx-ico{pointer-events:auto;width:42px;height:42px;border-radius:14px;border:2px solid rgba(255,255,255,.2);background:rgba(10,14,12,.42);color:#fff;display:grid;place-items:center;padding:0;flex:none;transition:background .2s,transform .15s}
.gm-${id} .gx-ico:hover{background:rgba(10,14,12,.62)}
.gm-${id} .gx-ico:active{transform:scale(.94)}
.gm-${id} .gx-ico:disabled{opacity:.35;pointer-events:none}
.gm-${id} .gx-ico.on{background:var(--gx-acc);border-color:#fff;color:#1b1b1f}
.gm-${id} .gx-stat{flex:1;min-width:0;text-align:center;font:800 14px/1.25 var(--sans);text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none}
.gm-${id} .gx-stat b{color:var(--gx-acc)}
.gm-${id} .gx-net{position:absolute;right:8px;bottom:8px;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.4);font:800 11px var(--sans);color:#fff;pointer-events:none}
.gm-${id} .gx-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-${id} .gx-net.bad i{background:#ff5b4b}
.gm-${id} .gx-pane{position:absolute;inset:0;z-index:6;display:flex;align-items:flex-start;justify-content:center;padding:12px;pointer-events:auto;background:rgba(5,12,9,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);overflow:auto;touch-action:pan-y;border-radius:inherit}
.gm-${id} .gx-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-${id} .gx-box{width:100%;max-width:420px;margin:auto;background:linear-gradient(#2a3552,#171e33);border:3px solid rgba(255,255,255,.15);border-radius:22px;padding:16px 16px 14px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.5);animation:gx-in .32s cubic-bezier(.2,1.4,.4,1);color:#fff}
.gm-${id} .gx-box.wide{max-width:600px}
.gm-${id} .gx-box.warm{background:linear-gradient(#4a3a2a,#2a2016)}
@keyframes gx-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-${id} .gx-box h3{margin:2px 0 8px;font:900 24px var(--sans);letter-spacing:.2px}
.gm-${id} .gx-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.86)}
.gm-${id} .gx-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:var(--gx-acc)!important;margin:0 0 2px!important}
.gm-${id} .gx-big{display:block;width:100%;min-height:52px;margin:8px 0;border:0;border-radius:16px;color:#14110a;font:900 19px/1.05 var(--sans);padding:6px 10px;background:var(--gx-acc);box-shadow:inset 0 -5px 0 rgba(0,0,0,.2),0 6px 14px rgba(0,0,0,.3);transition:transform .15s,filter .2s}
.gm-${id} .gx-big:hover{filter:brightness(1.08)}
.gm-${id} .gx-big:active{transform:translateY(2px)}
.gm-${id} .gx-big small{display:block;font:800 12px var(--sans);opacity:.75;margin-top:2px}
.gm-${id} .gx-big.alt{background:linear-gradient(#5b6a92,#3d4a6e);color:#fff}
.gm-${id} .gx-big.red{background:linear-gradient(#ff6a5a,#d12a1d);color:#fff}
.gm-${id} .gx-big:disabled{opacity:.4;pointer-events:none}
.gm-${id} .gx-sm{min-height:42px;padding:0 14px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px}
.gm-${id} .gx-sm:hover{background:rgba(255,255,255,.18)}
.gm-${id} .gx-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-${id} .gx-opt{display:flex;align-items:center;gap:10px;margin:7px 0;text-align:left}
.gm-${id} .gx-opt>span{flex:0 0 33%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.88)}
.gm-${id} .gx-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.5);margin-top:2px}
.gm-${id} .gx-seg{flex:1;display:flex;gap:4px;flex-wrap:wrap}
.gm-${id} .gx-seg button{flex:1;min-width:46px;min-height:38px;border-radius:11px;border:2px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff;font:900 13px var(--sans);padding:0 5px}
.gm-${id} .gx-seg button.on{background:var(--gx-acc);border-color:#fff;color:#1b1b1f}
.gm-${id} .gx-sec{margin:12px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:var(--gx-acc)!important}
.gm-${id} .gx-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans)}
.gm-${id} .gx-tbl td,.gm-${id} .gx-tbl th{padding:6px 5px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.gm-${id} .gx-tbl th{font:900 11px var(--sans);letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.55)}
.gm-${id} .gx-tbl td:first-child,.gm-${id} .gx-tbl th:first-child{text-align:left}
.gm-${id} .gx-tbl tr.win td{color:var(--gx-acc)}
.gm-${id} .gx-tbl i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:2px solid #fff}
.gm-${id} .gx-rules{text-align:left}
.gm-${id} .gx-rules p{font:700 13px/1.45 var(--sans)!important;margin:7px 0!important}
.gm-${id} .gx-rules h4{margin:12px 0 2px;font:900 12px var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:var(--gx-acc)}
.gm-${id} .gx-rules kbd{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:5px;padding:0 5px;font:800 12px var(--sans)}
@media (min-width:640px){.gm-${id} .gx-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 22px}.gm-${id} .gx-grid .gx-opt>span{flex-basis:38%}}
@media (max-width:520px){.gm-${id} .gx-opt{flex-direction:column;align-items:stretch;gap:4px}.gm-${id} .gx-opt>span{flex:none}.gm-${id} .gx-box{padding:14px 12px 12px}.gm-${id} .gx-box h3{font-size:21px}}
`;

  const dmTiles = n => { const t = []; for (let a = 0; a <= n; a++) for (let b = a; b <= n; b++) t.push([a, b]); return t; };
  const DM_T = { 6: dmTiles(6), 9: dmTiles(9) };
  const DM_HAND = {
    6: { draw: { 2: 7, 3: 5, 4: 5 }, block: { 2: 7, 3: 7, 4: 6 }, fives: { 2: 7, 3: 5, 4: 5 } },
    9: { draw: { 2: 11, 3: 9, 4: 8 }, block: { 2: 11, 3: 11, 4: 9 }, fives: { 2: 11, 3: 9, 4: 8 } }
  };
  const DM_MODES = { draw: 'Draw', block: 'Block', fives: 'All Fives' };
  const dmW = (s, id) => s.T[id][0] + s.T[id][1];
  const round5 = v => Math.round(v / 5) * 5;

  function dmCreate(o) {
    return {
      n: o.n, set: o.set, mode: o.mode, spin: !!o.spin, target: o.target || 0, T: DM_T[o.set],
      hands: [], yard: [], arms: [], placed: [], center: null, spinner: null, scores: Array(o.n).fill(0),
      turn: 0, phase: 'idle', round: 0, passes: 0, lack: Array(o.n).fill(0), last: -1, starter: 0, forced: -1, over: false, champ: -1
    };
  }

  function dmClone(s) {
    return {
      n: s.n, set: s.set, mode: s.mode, spin: s.spin, target: s.target, T: s.T,
      hands: s.hands.map(h => h.slice()), yard: s.yard.slice(), arms: s.arms.map(a => Object.assign({}, a)),
      placed: s.placed.slice(), center: s.center, spinner: s.spinner ? Object.assign({}, s.spinner) : null,
      scores: s.scores.slice(), turn: s.turn, phase: s.phase, round: s.round, passes: s.passes, lack: s.lack.slice(),
      last: s.last, starter: s.starter, forced: s.forced, over: s.over, champ: s.champ
    };
  }

  function dmLite(s) {
    return { T: s.T, spin: s.spin, arms: s.arms.map(a => Object.assign({}, a)), spinner: s.spinner ? Object.assign({}, s.spinner) : null, center: s.center, placed: { length: s.placed.length } };
  }

  function dmPut(s, id, arm) {
    const [a, b] = s.T[id], dbl = a === b;
    let inV, outV, sp = false;
    if (arm < 0) {
      inV = a; outV = b;
      s.arms = [{ end: a, n: 0, dbl, open: true, side: false }, { end: b, n: 0, dbl, open: true, side: false }];
      s.center = { id, a, b };
      if (s.spin && dbl) {
        s.spinner = { arm: -1, n0: 0 }; sp = true;
        s.arms.push({ end: a, n: 0, dbl: false, open: false, side: true }, { end: a, n: 0, dbl: false, open: false, side: true });
      }
    } else {
      const A = s.arms[arm];
      if (a === A.end) { inV = a; outV = b; } else { inV = b; outV = a; }
      A.end = outV; A.n++; A.dbl = dbl;
      if (s.spin && !s.spinner && dbl) {
        s.spinner = { arm, n0: A.n }; sp = true;
        s.arms.push({ end: a, n: 0, dbl: false, open: false, side: true }, { end: a, n: 0, dbl: false, open: false, side: true });
      }
    }
    if (s.spinner) {
      const sp0 = s.spinner, open = sp0.arm < 0 ? s.arms[0].n > 0 && s.arms[1].n > 0 : s.arms[sp0.arm].n > sp0.n0;
      s.arms[2].open = open; s.arms[3].open = open;
    }
    return { id, arm, inV, outV, dbl, sp };
  }

  function dmEndsSum(s) {
    if (s.placed.length === 1) return s.center.a + s.center.b;
    let t = 0;
    for (const A of s.arms) {
      if (!A.open) continue;
      t += A.side && A.n === 0 ? A.end : A.dbl ? 2 * A.end : A.end;
    }
    return t;
  }

  const dmEndMask = s => { let m = 0; for (const A of s.arms) if (A.open) m |= 1 << A.end; return m; };

  const dmMoves = (s, p) => dmMovesH(s, s.hands[p]);
  function dmMovesH(s, h) {
    const out = [];
    if (!s.placed.length) {
      for (const id of h) if (s.forced < 0 || id === s.forced) out.push({ id, arm: -1 });
      return out;
    }
    for (const id of h) {
      const [a, b] = s.T[id];
      for (let i = 0; i < s.arms.length; i++) {
        const A = s.arms[i];
        if (A.open && (a === A.end || b === A.end)) out.push({ id, arm: i });
      }
    }
    return out;
  }

  const dmCanDraw = s => s.mode !== 'block' && s.yard.length > 0;
  const P = (ev, e) => { if (ev) ev.push(e); };

  function dmDeal(s, R, ev) {
    const N = s.T.length, ids = shuffle(Array.from({ length: N }, (_, i) => i), R), per = DM_HAND[s.set][s.mode][s.n];
    s.hands = []; for (let p = 0; p < s.n; p++) s.hands.push(ids.splice(0, per));
    s.yard = ids; s.placed = []; s.arms = []; s.center = null; s.spinner = null; s.passes = 0; s.lack = Array(s.n).fill(0);
    s.round++; s.forced = -1; s.phase = 'play';
    let st = -1;
    if (s.round === 1) {
      for (let v = s.set; v >= 0 && st < 0; v--) {
        const id = s.T.findIndex(t => t[0] === v && t[1] === v);
        for (let p = 0; p < s.n; p++) if (s.hands[p].includes(id)) { st = p; s.forced = id; break; }
      }
      if (st < 0) {
        let best = -1, bp = 0, bid = -1;
        for (let p = 0; p < s.n; p++) for (const id of s.hands[p]) { const sc = dmW(s, id) * 100 + Math.max(...s.T[id]); if (sc > best) { best = sc; bp = p; bid = id; } }
        st = bp; s.forced = bid;
      }
    } else st = s.last >= 0 ? s.last : (s.starter + 1) % s.n;
    s.starter = st; s.turn = st;
    P(ev, { k: 'deal', round: s.round, starter: st, hands: s.hands.map(h => h.slice()), yardN: s.yard.length, forced: s.forced });
    dmSettle(s, ev);
  }

  function dmSettle(s, ev) {
    while (s.phase === 'play') {
      const p = s.turn;
      if (dmMoves(s, p).length) { P(ev, { k: 'turn', p, need: 'move' }); return; }
      s.lack[p] |= dmEndMask(s);
      if (dmCanDraw(s)) { P(ev, { k: 'turn', p, need: 'draw' }); return; }
      P(ev, { k: 'pass', p }); s.passes++;
      if (s.passes >= s.n) { dmEnd(s, -1, true, ev); return; }
      s.turn = (p + 1) % s.n;
    }
  }

  function dmDraw(s, p, ev) {
    if (s.phase !== 'play' || s.turn !== p || !dmCanDraw(s) || dmMoves(s, p).length) return false;
    const id = s.yard.pop();
    s.hands[p].push(id);
    P(ev, { k: 'draw', p, id, yardN: s.yard.length });
    dmSettle(s, ev);
    return true;
  }

  function dmPlay(s, p, id, arm, ev) {
    if (s.phase !== 'play' || s.turn !== p) return false;
    if (!dmMoves(s, p).some(m => m.id === id && m.arm === arm)) return false;
    const h = s.hands[p]; h.splice(h.indexOf(id), 1);
    const rec = dmPut(s, id, arm);
    rec.p = p;
    s.placed.push(rec);
    s.passes = 0; s.forced = -1;
    const e = { k: 'play', p, rec };
    P(ev, e);
    if (s.mode === 'fives') {
      const sum = dmEndsSum(s);
      if (sum > 0 && sum % 5 === 0) { s.scores[p] += sum; P(ev, { k: 'score', p, pts: sum, why: 'ends', scores: s.scores.slice() }); }
    }
    if (!h.length) { dmEnd(s, p, false, ev); return true; }
    s.turn = (p + 1) % s.n;
    dmSettle(s, ev);
    return true;
  }

  function dmEnd(s, w, blocked, ev) {
    const tot = s.hands.map(h => h.reduce((a, id) => a + dmW(s, id), 0)), sum = tot.reduce((a, b) => a + b, 0);
    let pts = 0, win = w;
    if (blocked) {
      const mn = Math.min(...tot), lows = tot.map((t, i) => t === mn ? i : -1).filter(i => i >= 0);
      if (lows.length === 1) { win = lows[0]; pts = Math.max(0, sum - tot[win] - tot[win]); } else win = -1;
    } else pts = sum;
    if (s.mode === 'fives') pts = round5(pts);
    if (win >= 0) s.scores[win] += pts;
    s.last = win >= 0 ? win : s.last;
    s.phase = 'end';
    if (s.target) {
      const mx = Math.max(...s.scores);
      if (mx >= s.target) { s.over = true; s.champ = s.scores.indexOf(mx); s.phase = 'over'; }
    }
    P(ev, { k: 'end', w: win, pts, blocked, hands: s.hands.map(h => h.slice()), tot, scores: s.scores.slice(), over: s.over, champ: s.champ, round: s.round });
  }

  function dmView(s, q) {
    return {
      n: s.n, set: s.set, mode: s.mode, spin: s.spin, target: s.target, round: s.round, turn: s.turn, phase: s.phase,
      hand: s.hands[q].slice(), counts: s.hands.map(h => h.length), yardN: s.yard.length, placed: s.placed.map(r => Object.assign({}, r)),
      arms: s.arms.map(a => Object.assign({}, a)), spinner: s.spinner ? Object.assign({}, s.spinner) : null, center: s.center,
      scores: s.scores.slice(), forced: s.forced, over: s.over, champ: s.champ, need: s.phase === 'play' ? (dmMoves(s, s.turn).length ? 'move' : 'draw') : '',
      last: s.last
    };
  }

  function dmFilter(e, q, s) {
    if (e.k === 'draw' && e.p !== q) return { k: 'draw', p: e.p, yardN: e.yardN };
    if (e.k === 'deal') return { k: 'deal', round: e.round, starter: e.starter, hand: e.hands[q], counts: e.hands.map(h => h.length), yardN: e.yardN, forced: e.forced };
    return e;
  }

  const DMW = {
    Easy: { pts: 2, heavy: .15, dbl: .5, mob: .2, hold: .1, opp: .3, lack: .3, risk: .3, noise: 5 },
    Normal: { pts: 3, heavy: .55, dbl: 2.2, mob: .9, hold: .45, opp: 1.8, lack: 2.2, risk: 1.5, noise: .6 },
    Hard: { pts: 3, heavy: .55, dbl: 2.2, mob: .9, hold: .45, opp: 1.8, lack: 2.2, risk: 1.5, noise: .05 }
  };

  function dmUnseen(s, p) {
    const seen = new Set(s.hands[p]);
    for (const r of s.placed) seen.add(r.id);
    const out = [];
    for (let i = 0; i < s.T.length; i++) if (!seen.has(i)) out.push(i);
    return out;
  }

  function dmPick(s, p, lvl, R = Math.random) {
    const moves = dmMoves(s, p);
    if (moves.length <= 1) return moves[0] || null;
    const w = DMW[lvl] || DMW.Normal, fives = s.mode === 'fives';
    const uns = dmUnseen(s, p), cnt = Array(s.set + 1).fill(0);
    for (const id of uns) { const [a, b] = s.T[id]; cnt[a]++; if (b !== a) cnt[b]++; }
    let oppLack = 0;
    for (let q = 0; q < s.n; q++) if (q !== p) oppLack |= s.lack[q];
    const scored = moves.map(m => {
      const ls = dmLite(s), [a, b] = s.T[m.id];
      dmPut(ls, m.id, m.arm); ls.placed.length++;
      const sum = dmEndsSum(ls);
      let v = 0;
      if (fives && sum > 0 && sum % 5 === 0) v += sum * w.pts;
      v += (a + b) * w.heavy * (s.mode === 'fives' ? .6 : 1);
      if (a === b) v += w.dbl + (s.spin && !s.spinner ? 2 : 0);
      const ends = [];
      for (const A of ls.arms) if (A.open) ends.push(A.end);
      const rest = s.hands[p].filter(x => x !== m.id);
      let mob = 0, hold = 0;
      for (const r of rest) {
        const [x, y] = s.T[r];
        let ok = false;
        for (const e of ends) if (x === e || y === e) { hold++; ok = true; }
        if (ok) mob++;
      }
      v += mob * w.mob + hold * w.hold;
      let blk = 0, risk = 0;
      const ut = Math.max(1, uns.length);
      for (const e of ends) {
        blk += cnt[e] / ut;
        if (oppLack & (1 << e)) v += w.lack;
        if (fives) {
          for (const id of uns) {
            const [x, y] = s.T[id];
            if (x !== e && y !== e) continue;
            const o = x === e ? y : x, ns = sum - e + o + (x === y ? e : 0);
            if (ns > 0 && ns % 5 === 0) risk += ns / ut;
          }
        }
      }
      v -= blk * w.opp * 3;
      v -= risk * w.risk * (s.n > 2 ? .6 : 1);
      if (!rest.length) v += 1000;
      v += (R() - .5) * w.noise * 4;
      return { m, v };
    });
    scored.sort((x, y) => y.v - x.v);
    if (lvl !== 'Hard' || scored.length < 2) return scored[0].m;
    return dmMC(s, p, scored.slice(0, 5).map(x => x.m), uns, R);
  }

  function dmQuick(s, p, R) {
    const moves = dmMoves(s, p);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];
    const fives = s.mode === 'fives';
    let best = null, bv = -1e9;
    for (const m of moves) {
      let v = dmW(s, m.id) * .5 + (s.T[m.id][0] === s.T[m.id][1] ? 2 : 0) + R() * .4;
      if (fives) {
        const ls = dmLite(s); dmPut(ls, m.id, m.arm); ls.placed.length++;
        const sum = dmEndsSum(ls);
        if (sum > 0 && sum % 5 === 0) v += sum * 3;
      }
      if (v > bv) { bv = v; best = m; }
    }
    return best;
  }

  function dmRoll(sim, R) {
    for (let guard = 0; guard < 120 && sim.phase === 'play'; guard++) {
      const p = sim.turn, m = dmQuick(sim, p, R);
      if (m) dmPlay(sim, p, m.id, m.arm, null);
      else if (!dmDraw(sim, p, null)) break;
    }
    return sim;
  }

  function dmMC(s, p, cands, uns, R) {
    const K = 36, opp = [];
    for (let q = 0; q < s.n; q++) if (q !== p) opp.push(q);
    const tot = cands.map(() => 0);
    for (let k = 0; k < K; k++) {
      const pool = shuffle(uns.slice(), R), hands = [];
      for (let q = 0; q < s.n; q++) hands[q] = q === p ? s.hands[p].slice() : [];
      for (const q of opp) {
        const need = s.hands[q].length, lk = s.lack[q];
        const okp = [], rest = [];
        for (const id of pool) { const [a, b] = s.T[id]; ((lk & (1 << a)) || (lk & (1 << b)) ? rest : okp).push(id); }
        const take = okp.splice(0, need);
        if (take.length < need) take.push(...rest.splice(0, need - take.length));
        hands[q] = take;
        pool.length = 0; pool.push(...okp, ...rest);
      }
      const yard = pool;
      cands.forEach((m, i) => {
        const sim = dmClone(s);
        sim.hands = hands.map(h => h.slice()); sim.yard = yard.slice();
        const base = sim.scores.slice();
        dmPlay(sim, p, m.id, m.arm, null);
        dmRoll(sim, R);
        let d = sim.scores[p] - base[p], o = 0;
        for (const q of opp) o += sim.scores[q] - base[q];
        tot[i] += d - o / opp.length;
      });
    }
    let bi = 0;
    for (let i = 1; i < cands.length; i++) if (tot[i] > tot[bi]) bi = i;
    return cands[bi];
  }

  const DM_PIPS = [
    [], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [1, 1]],
    [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
    [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]
  ];

  function dmPipHalf(c, v, cx, W) {
    const step = W * .27, rad = W * (v > 6 ? .082 : .1);
    for (const [u, w] of DM_PIPS[v]) {
      const px = cx + u * step, py = w * step;
      c.fillStyle = '#14161a'; c.beginPath(); c.arc(px, py, rad, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.arc(px - rad * .3, py - rad * .3, rad * .45, 0, TAU); c.fill();
    }
  }

  function dmTile(c, x, y, ang, L, a, b, o) {
    o = o || {};
    const W = L / 2, r = W * .17;
    c.save(); c.translate(x, y); c.rotate(ang);
    if (o.alpha != null) c.globalAlpha = o.alpha;
    if (!o.noShadow) {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(-L / 2 + W * .05, -W / 2 + W * .09, L, W, r); c.fill();
    }
    c.beginPath(); c.roundRect(-L / 2, -W / 2, L, W, r);
    const g = c.createLinearGradient(0, -W / 2, 0, W / 2);
    if (o.back) { g.addColorStop(0, '#3a4a4a'); g.addColorStop(.5, '#26332f'); g.addColorStop(1, '#161f1d'); }
    else if (o.dim) { g.addColorStop(0, '#cbc5b0'); g.addColorStop(1, '#a9a28a'); }
    else { g.addColorStop(0, '#fffdf3'); g.addColorStop(.5, '#f4edd4'); g.addColorStop(1, '#dccfa9'); }
    c.fillStyle = g; c.fill();
    c.lineWidth = Math.max(1, W * .05); c.strokeStyle = o.back ? '#0a0e0d' : '#9d8f68'; c.stroke();
    c.beginPath(); c.roundRect(-L / 2 + W * .07, -W / 2 + W * .07, L - W * .14, W - W * .14, r * .6);
    c.strokeStyle = o.back ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(1, W * .035); c.stroke();
    if (o.back) {
      c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(0, 0, W * .09, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-W * .02, -W * .025, W * .035, 0, TAU); c.fill();
    } else {
      c.strokeStyle = '#8c7d57'; c.lineWidth = Math.max(1, W * .045);
      c.beginPath(); c.moveTo(0, -W * .36); c.lineTo(0, W * .36); c.stroke();
      c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(0, 0, W * .06, 0, TAU); c.fill();
      dmPipHalf(c, a, -L / 4, W); dmPipHalf(c, b, L / 4, W);
    }
    if (o.glow) {
      c.beginPath(); c.roundRect(-L / 2 - W * .04, -W / 2 - W * .04, L + W * .08, W + W * .08, r * 1.2);
      c.strokeStyle = o.glow; c.lineWidth = W * .1; c.stroke();
    }
    c.restore();
  }

  function dmTry(placed, R, L, force) {
    const Wd = L / 2, D4 = [[1, 0], [0, 1], [-1, 0], [0, -1]], rects = [], tiles = [], arms = [];
    const cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2;
    const fits = (x, y, hw, hh, relax) => {
      const m = relax ? L * .6 : 0;
      if (x - hw < R.x0 - m || x + hw > R.x1 + m || y - hh < R.y0 - m || y + hh > R.y1 + m) return false;
      for (const r of rects) if (Math.abs(x - r.x) < hw + r.hw - 2 && Math.abs(y - r.y) < hh + r.hh - 2) return false;
      return true;
    };
    const cand = (st, dbl, turn) => {
      const d = D4[st.d], horiz = d[0] !== 0;
      if (dbl) return { x: st.x + d[0] * Wd / 2, y: st.y + d[1] * Wd / 2, hw: horiz ? Wd / 2 : Wd, hh: horiz ? Wd : Wd / 2, ang: horiz ? Math.PI / 2 : 0, nx: st.x + d[0] * Wd, ny: st.y + d[1] * Wd, nd: st.d };
      if (!turn) return { x: st.x + d[0] * Wd, y: st.y + d[1] * Wd, hw: horiz ? Wd : Wd / 2, hh: horiz ? Wd / 2 : Wd, ang: Math.atan2(d[1], d[0]), nx: st.x + d[0] * L, ny: st.y + d[1] * L, nd: st.d };
      const nd = (st.d + turn + 4) % 4, e = D4[nd], eh = e[0] !== 0;
      const nhx = st.x + d[0] * Wd / 2, nhy = st.y + d[1] * Wd / 2;
      return { x: nhx + e[0] * Wd / 2, y: nhy + e[1] * Wd / 2, hw: eh ? Wd : Wd / 2, hh: eh ? Wd / 2 : Wd, ang: Math.atan2(e[1], e[0]), nx: nhx + e[0] * 1.5 * Wd, ny: nhy + e[1] * 1.5 * Wd, nd };
    };
    const find = (st, dbl) => {
      let c = cand(st, dbl, 0);
      if (fits(c.x, c.y, c.hw, c.hh, false)) return c;
      if (dbl) return fits(c.x, c.y, c.hw, c.hh, true) ? c : null;
      for (const t of [1, -1]) { c = cand(st, false, t); if (fits(c.x, c.y, c.hw, c.hh, false)) return c; }
      return null;
    };
    for (const rec of placed) {
      let c;
      if (rec.arm < 0) {
        const dbl = rec.dbl;
        c = { x: cx, y: cy, hw: dbl ? Wd / 2 : Wd, hh: dbl ? Wd : Wd / 2, ang: dbl ? Math.PI / 2 : 0 };
        if (dbl) { arms[0] = { x: cx - Wd / 2, y: cy, d: 2 }; arms[1] = { x: cx + Wd / 2, y: cy, d: 0 }; }
        else { arms[0] = { x: cx - Wd, y: cy, d: 2 }; arms[1] = { x: cx + Wd, y: cy, d: 0 }; }
        if (rec.sp) { arms[2] = { x: cx, y: cy - Wd, d: 3 }; arms[3] = { x: cx, y: cy + Wd, d: 1 }; }
      } else {
        const st = arms[rec.arm];
        c = find(st, rec.dbl);
        if (!c) { if (!force) return null; c = cand(st, rec.dbl, 0); }
        const d0 = st.d;
        st.x = c.nx; st.y = c.ny; st.d = c.nd;
        if (rec.sp) {
          const e1 = D4[(d0 + 1) % 4], e3 = D4[(d0 + 3) % 4];
          arms[2] = { x: c.x + e1[0] * Wd, y: c.y + e1[1] * Wd, d: (d0 + 1) % 4 };
          arms[3] = { x: c.x + e3[0] * Wd, y: c.y + e3[1] * Wd, d: (d0 + 3) % 4 };
        }
      }
      rects.push({ x: c.x, y: c.y, hw: c.hw, hh: c.hh });
      tiles.push({ rec, x: c.x, y: c.y, ang: c.ang });
    }
    return { L, tiles, arms, ghost(i, dbl) { const st = arms[i]; if (!st) return null; return find(st, dbl) || cand(st, dbl, 0); } };
  }

  function dmLayout(placed, R, L) {
    for (const k of [1, .92, .84, .76, .68, .6, .53, .47, .42]) {
      const r = dmTry(placed, R, L * k, false);
      if (r) return r;
    }
    return dmTry(placed, R, L * .42, true);
  }

  const dmRules = mode => `<div class="gx-rules">
<h4>Goal</h4><p>Empty your hand first. ${mode === 'fives' ? 'You also score during play by making the open ends add up to a multiple of five.' : 'The winner of a round scores the pips left in the other hands.'} First to the target score wins the match.</p>
<h4>Playing</h4><p>Match a tile half to a number at an open end of the line. Doubles lie across the line. A tile that fits more than one end asks where it should go.</p>
<h4>Draw</h4><p>With no playable tile you must draw from the boneyard until you can play. When it is empty you pass.</p>
<h4>Block</h4><p>No boneyard: with no playable tile you pass. If everyone passes the game is blocked and the lowest hand wins the difference.</p>
<h4>All Fives (Muggins)</h4><p>After every tile (including the first), add the open ends. A double at the end of the line counts both halves. If the total is a multiple of 5 you score it. Going out also scores the other hands rounded to the nearest 5.</p>
<h4>Spinner</h4><p>With the spinner on, the first double played can be built on at its sides as well, once both of its ends are covered, giving up to four open ends.</p>
<h4>Starting</h4><p>The highest double (or heaviest tile) starts the first round, afterwards the previous winner starts.</p>
<h4>Controls</h4><p>Tap a tile, then the glowing spot to place it (a tile with one possible spot plays at once), or drag it. <kbd>&larr;</kbd><kbd>&rarr;</kbd> pick, <kbd>Enter</kbd> play, <kbd>D</kbd> draw, <kbd>H</kbd> hint.</p></div>`;

  const dmLogo = `<svg viewBox="0 0 220 84" width="190" height="73" style="display:block;margin:2px auto 6px"><g transform="translate(46 42) rotate(-12)"><rect x="-32" y="-16" width="64" height="32" rx="6" fill="#fffbe9" stroke="#9d8f68" stroke-width="2"/><path d="M0-12V12" stroke="#8c7d57" stroke-width="2"/><g fill="#14161a"><circle cx="-22" cy="-7" r="3.3"/><circle cx="-16" cy="0" r="3.3"/><circle cx="-10" cy="7" r="3.3"/><circle cx="10" cy="-7" r="3.3"/><circle cx="22" cy="-7" r="3.3"/><circle cx="10" cy="7" r="3.3"/><circle cx="22" cy="7" r="3.3"/><circle cx="16" cy="0" r="3.3"/></g></g><g transform="translate(112 44)"><rect x="-32" y="-16" width="64" height="32" rx="6" fill="#fffbe9" stroke="#9d8f68" stroke-width="2"/><path d="M0-12V12" stroke="#8c7d57" stroke-width="2"/><g fill="#14161a"><circle cx="-16" cy="0" r="3.3"/><circle cx="16" cy="-7" r="3.3"/><circle cx="16" cy="7" r="3.3"/><circle cx="22" cy="0" r="3.3"/><circle cx="10" cy="0" r="3.3"/></g></g><g transform="translate(176 40) rotate(14)"><rect x="-32" y="-16" width="64" height="32" rx="6" fill="#fffbe9" stroke="#9d8f68" stroke-width="2"/><path d="M0-12V12" stroke="#8c7d57" stroke-width="2"/><g fill="#14161a"><circle cx="-22" cy="-7" r="3.3"/><circle cx="-10" cy="7" r="3.3"/><circle cx="-16" cy="0" r="3.3"/><circle cx="22" cy="-7" r="3.3"/><circle cx="10" cy="7" r="3.3"/><circle cx="22" cy="7" r="3.3"/><circle cx="10" cy="-7" r="3.3"/></g></g></svg>`;

  Ameplay.register({
    id: 'dominoes',
    title: 'Dominoes',
    category: 'Board',
    tint: '#2f9a5f',
    blurb: 'Classic ivory tiles with Draw, Block and All Fives scoring. Double-six or double-nine, spinner, smart bots, and online play.',
    help: 'Tap a tile then the glowing spot (or drag) · tap the boneyard to draw · <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> · <kbd>D</kbd> draw · <kbd>H</kbd> hint',
    better: 'high',
    format: v => v + ' pts',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="14" width="22" height="40" rx="4" transform="rotate(-14 19 34)"/><path d="M10.5 32.5l17.6-4.4" transform="rotate(-14 19 34)"/><rect x="34" y="10" width="22" height="40" rx="4" transform="rotate(10 45 30)"/><path d="M34 30h22" transform="rotate(10 45 30)"/><circle cx="16" cy="22" r="1.6" fill="currentColor"/><circle cx="23" cy="43" r="1.6" fill="currentColor"/><circle cx="41" cy="20" r="1.6" fill="currentColor"/><circle cx="49" cy="20" r="1.6" fill="currentColor"/><circle cx="45" cy="40" r="1.6" fill="currentColor"/></svg>',
    css: baseCss('dominoes', '#f4c542') + `
.gm-dominoes .dm-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(8,40,22,.35);touch-action:none;background:#0d4429}
.gm-dominoes .dm-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-dominoes .dm-wrap .gx-box{background:linear-gradient(#1f4a35,#0f2a1f);border-color:rgba(255,255,255,.18)}
`,
    mount(root, api) {
      const opt = Object.assign({ mode: 'draw', set: 6, n: 2, diff: 'Normal', spin: 'auto', target: 100, assist: true, wins: 0 }, api.load() || {});
      if (!DMW[opt.diff]) opt.diff = 'Normal';
      const save = () => api.save(opt);
      const au = audioKit(api);
      const wrap = document.createElement('div'); wrap.className = 'gx-wrap dm-wrap';
      const cv = document.createElement('canvas');
      const ui = document.createElement('div'); ui.className = 'gx-ui';
      ui.innerHTML = `<div class="gx-top"><button class="gx-ico" data-u="menu" aria-label="Menu" hidden>${ICON.menu}</button><div style="flex:1"></div><button class="gx-ico" data-u="hint" aria-label="Hint" hidden>${ICON.hint}</button><button class="gx-ico" data-u="help" aria-label="Rules">${ICON.help}</button></div><div class="gx-net" hidden><i></i><span>Online</span></div>`;
      wrap.append(cv, ui); root.append(wrap);
      const ctx = cv.getContext('2d');
      const pane = Pane(ui);
      const bMenu = ui.querySelector('[data-u=menu]'), bHint = ui.querySelector('[data-u=hint]'), bHelp = ui.querySelector('[data-u=help]'), netEl = ui.querySelector('.gx-net');

      let W = 960, H = 640, PORT = null, DPR = 1, scene = 'title', feltC = null, G = null, LY = null, layKey = '', viewer = 0, busy = 0, killed = false;
      const M = { mode: 'cpu', role: 'local', n: 2, names: [], human: [], pids: [], players: [], bots: false, size: 2, tok: 0, hooked: false, awaiting: 0, pv: null, bot: 0 };
      let S = null;
      const D = { n: 2, mode: 'draw', set: 6, spin: false, target: 100, T: DM_T[6], round: 0, turn: -1, phase: '', need: '', hand: [], counts: [], yardN: 0, placed: [], arms: [], spinner: null, center: null, scores: [], reveal: null, forced: -1, ver: 0, endInfo: null, last: -1 };
      const Q = [], fly = [], fx = [], hv = new Map(), bt = new Map(), flying = new Set();
      const U = { sel: -1, opts: [], drag: null, hover: -1, kbd: -1, kbdArm: 0, hint: null, shake: new Map(), pulse: 0 };

      const useSpin = () => opt.spin === 'on' || (opt.spin === 'auto' && opt.mode === 'fives');
      const nameOf = p => p === viewer ? 'You' : (M.names[p] || 'Player ' + (p + 1));
      const fullName = p => M.names[p] || 'Player ' + (p + 1);
      const rel = p => (p - viewer + D.n) % D.n;

      function buildFelt() {
        feltC = document.createElement('canvas'); feltC.width = Math.round(W * DPR); feltC.height = Math.round(H * DPR);
        const c = feltC.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
        const wd = c.createLinearGradient(0, 0, W, H); wd.addColorStop(0, '#6b4528'); wd.addColorStop(.5, '#4e2f19'); wd.addColorStop(1, '#6a4327');
        c.fillStyle = wd; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 90; i++) { c.strokeStyle = `rgba(${i % 2 ? '255,220,170' : '30,12,2'},${.03 + Math.random() * .05})`; c.lineWidth = 1 + Math.random() * 2; const y = Math.random() * H; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * .3, y + 12 * Math.random(), W * .6, y - 12 * Math.random(), W, y + 6); c.stroke(); }
        const m = PORT ? 7 : 14;
        const fg = c.createRadialGradient(W / 2, H * .45, 30, W / 2, H * .45, Math.max(W, H) * .7);
        fg.addColorStop(0, '#2f9a5f'); fg.addColorStop(.6, '#1c7444'); fg.addColorStop(1, '#0c3f26');
        c.fillStyle = fg; c.beginPath(); c.roundRect(m, m, W - 2 * m, H - 2 * m, PORT ? 14 : 22); c.fill();
        for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .05})`; c.fillRect(m + Math.random() * (W - 2 * m), m + Math.random() * (H - 2 * m), 1.3, 1.3); }
        c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.roundRect(m, m, W - 2 * m, H - 2 * m, PORT ? 14 : 22); c.stroke();
        c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.roundRect(m + 6, m + 6, W - 2 * m - 12, H - 2 * m - 12, PORT ? 10 : 18); c.stroke();
        const hz = PORT ? 560 : 490;
        c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 2; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(m + 14, hz - 10); c.lineTo(W - m - 14, hz - 10); c.stroke(); c.setLineDash([]);
      }

      function geom() {
        const n = D.n, g = { seats: [] };
        if (!PORT) {
          g.board = n === 2 ? { x0: 44, y0: 116, x1: W - 44, y1: 448 } : n === 3 ? { x0: 160, y0: 36, x1: W - 160, y1: 448 } : { x0: 160, y0: 116, x1: W - 160, y1: 448 };
          g.tileL = D.set === 9 ? 56 : 68;
          g.me = { x: 14, y: H - 118, w: 150, h: 52 };
          g.yard = { x: W - 76, y: H - 90 };
          g.hand = { y: H - 14, zone: 510 };
          const top = { plate: { x: W / 2 - 95, y: 20, w: 190, h: 46 }, rx: W / 2, ry: 100, horiz: false, side: 'top' };
          const left = { plate: { x: 20, y: 140, w: 124, h: 46 }, rx: 60, ry: 300, horiz: true, side: 'left' };
          const right = { plate: { x: W - 144, y: 140, w: 124, h: 46 }, rx: W - 60, ry: 300, horiz: true, side: 'right' };
          g.seats = n === 2 ? [null, top] : n === 3 ? [null, left, right] : [null, left, top, right];
        } else {
          g.board = { x0: 12, y0: 108, x1: W - 12, y1: 452 };
          g.tileL = D.set === 9 ? 38 : 46;
          g.me = { x: 10, y: 488, w: 132, h: 44 };
          g.yard = { x: W - 64, y: 508 };
          g.hand = { y: H - 12, zone: 560 };
          const k = Math.max(1, n - 1);
          for (let i = 0; i < k; i++) {
            const cx = W * (i + .5) / k, cw = W / k;
            g.seats.push({ plate: { x: cx - Math.min(70, cw / 2 - 4), y: 10, w: Math.min(140, cw - 8), h: 40 }, rx: cx, ry: 78, horiz: false, side: 'top', cw });
          }
          g.seats.unshift(null);
        }
        return g;
      }

      function handSlots(cnt) {
        const out = [];
        if (!cnt) return { slots: out, ws: 40 };
        let rows = 1, per = cnt, ws;
        if (PORT) { rows = cnt > 7 ? 2 : 1; per = Math.ceil(cnt / rows); ws = clamp(Math.floor((W - 20) / per) - 6, 26, 50); }
        else ws = clamp(Math.floor((W - 330) / cnt) - 6, 28, 52);
        const gap = 6;
        for (let i = 0; i < cnt; i++) {
          const r = Math.floor(i / per), idx = i % per, inRow = Math.min(per, cnt - r * per);
          const total = inRow * (ws + gap) - gap;
          const x = (PORT ? W / 2 : W / 2 + 14) - total / 2 + idx * (ws + gap) + ws / 2;
          const y = G.hand.y - ws - (rows - 1 - r) * (2 * ws + 10);
          out.push({ x, y });
        }
        return { slots: out, ws };
      }

      function relayout(snap) {
        G = geom(); layKey = '';
        if (snap) { hv.forEach(h => { h.x = h.tx = W / 2; h.y = h.ty = H; }); bt.clear(); }
      }

      function fit(force) {
        const port = (root.clientWidth || 800) < 620;
        if (!force && port === PORT) return;
        PORT = port; W = port ? 430 : 960; H = port ? 720 : 640;
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        wrap.classList.toggle('dm-port', port);
        buildFelt(); relayout(false);
      }
      api.on(window, 'resize', () => fit(false));

      const loc = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };

      function board() {
        const key = D.ver + '|' + W + '|' + D.n + '|' + D.set;
        if (key !== layKey) { LY = dmLayout(D.placed, G.board, G.tileL); layKey = key; }
        return LY;
      }
      const boardPos = id => { const t = board().tiles.find(x => x.rec.id === id); return t ? { x: t.x, y: t.y, ang: t.ang, L: LY.L } : { x: W / 2, y: H / 2, ang: 0, L: G.tileL }; };
      const anchor = p => { const s = G.seats[rel(p)]; return s ? { x: s.rx, y: s.ry } : { x: W / 2, y: H - 80 }; };
      const myMoves = () => dmMovesH(D, D.hand);
      const sortHand = () => D.hand.sort((x, y) => D.T[y][0] + D.T[y][1] - D.T[x][0] - D.T[x][1] || y - x);

      function resetD(v) {
        D.n = v.n; D.mode = v.mode; D.set = v.set; D.spin = v.spin; D.target = v.target; D.T = DM_T[v.set];
        D.round = v.round || 0; D.turn = v.turn == null ? -1 : v.turn; D.phase = v.phase || ''; D.need = v.need || '';
        D.hand = (v.hand || []).slice(); D.counts = (v.counts || Array(v.n).fill(0)).slice(); D.yardN = v.yardN || 0;
        D.placed = (v.placed || []).map(r => Object.assign({}, r)); D.arms = (v.arms || []).map(a => Object.assign({}, a));
        D.spinner = v.spinner ? Object.assign({}, v.spinner) : null; D.center = v.center || null; D.scores = (v.scores || Array(v.n).fill(0)).slice();
        D.forced = v.forced == null ? -1 : v.forced; D.reveal = null; D.endInfo = null; D.last = v.last == null ? -1 : v.last; D.ver++;
        sortHand();
        hv.clear(); bt.clear(); flying.clear(); U.sel = -1; U.opts = [];
        relayout(false);
        const sl = handSlots(D.hand.length).slots;
        D.hand.forEach((id, i) => hv.set(id, { x: sl[i].x, y: sl[i].y, tx: sl[i].x, ty: sl[i].y, L: 0, show: 0 }));
      }

      function applyEvent(e) {
        const t = now();
        switch (e.k) {
          case 'turn':
            D.turn = e.p; D.need = e.need; U.sel = -1; U.opts = []; U.kbdArm = 0; U.hint = null; busy = t + 40;
            if (e.p === viewer) { au.tick(); if (U.kbd < 0 || U.kbd >= D.hand.length) U.kbd = 0; }
            break;
          case 'deal': {
            fx.length = 0; fly.length = 0; flying.clear(); bt.clear(); hv.clear();
            D.round = e.round; D.placed = []; D.arms = []; D.center = null; D.spinner = null; D.ver++; D.phase = 'play'; D.endInfo = null; D.reveal = null;
            D.hand = e.hand.slice(); sortHand(); D.counts = e.counts.slice(); D.yardN = e.yardN; D.forced = e.forced; D.last = S ? S.last : D.last;
            const sl = handSlots(D.hand.length).slots, y0 = G.yard;
            D.hand.forEach((id, i) => hv.set(id, { x: y0.x, y: y0.y, tx: sl[i].x, ty: sl[i].y, L: 0, show: t + 80 + i * 70 }));
            for (let i = 0; i < D.hand.length; i++) api.timeout(() => au.clack(.5), 100 + i * 70);
            busy = t + 140 + D.hand.length * 70;
            U.kbd = 0; M.awaiting = 0;
            break;
          }
          case 'play': {
            const r = e.rec, p = e.p;
            let from;
            if (p === viewer) { const h = hv.get(r.id); from = h ? { x: h.x, y: h.y, ang: Math.PI / 2, L: h.L || 80 } : { x: W / 2, y: H - 70, ang: Math.PI / 2, L: 80 }; hv.delete(r.id); D.hand = D.hand.filter(x => x !== r.id); }
            else { const a = anchor(p), sd = G.seats[rel(p)]; from = { x: a.x, y: a.y, ang: sd && sd.horiz ? 0 : Math.PI / 2, L: 52, back: true }; D.counts[p] = Math.max(0, D.counts[p] - 1); }
            D.placed.push(r); dmPut(D, r.id, r.arm); D.ver++;
            flying.add(r.id);
            fly.push({ id: r.id, v1: r.inV, v2: r.outV, from, to: () => boardPos(r.id), t0: t, dur: p === viewer ? 420 : 520, flip: from.back, kind: 'board' });
            busy = t + (p === viewer ? 380 : 480);
            U.sel = -1; U.opts = []; U.hint = null; M.awaiting = 0;
            break;
          }
          case 'draw': {
            D.yardN = e.yardN;
            const y0 = G.yard;
            if (e.id != null) {
              D.hand.push(e.id); sortHand();
              const sl = handSlots(D.hand.length).slots;
              D.hand.forEach((id, i) => { const h = hv.get(id); if (h) { h.tx = sl[i].x; h.ty = sl[i].y; } else hv.set(id, { x: y0.x, y: y0.y, tx: sl[i].x, ty: sl[i].y, L: 0, show: t + 30 }); });
            } else {
              D.counts[e.p]++;
              const a = anchor(e.p);
              fly.push({ back: true, from: { x: y0.x, y: y0.y, ang: 0, L: 40 }, to: () => ({ x: a.x, y: a.y, ang: 0, L: 52 }), t0: t, dur: 420, kind: 'rack' });
            }
            au.slide(); busy = t + 420; M.awaiting = 0;
            break;
          }
          case 'pass':
            fx.push({ k: 'bubble', p: e.p, text: 'Pass', t0: t, dur: 1100 }); au.pass(); busy = t + 950;
            break;
          case 'score': {
            D.scores = e.scores.slice();
            fx.push({ k: 'pop', text: '+' + e.pts, x: W / 2, y: (G.board.y0 + G.board.y1) / 2, t0: t, dur: 1300, p: e.p }); au.score(e.pts / 5);
            if (e.p === viewer) api.score(D.scores[viewer]);
            busy = t + 800;
            break;
          }
          case 'end':
            D.phase = e.over ? 'over' : 'end'; D.reveal = e.hands; D.scores = e.scores.slice(); D.endInfo = e; D.counts = e.hands.map(h => h.length);
            api.score(D.scores[viewer]);
            busy = t + 1300;
            break;
        }
      }

      function syncD(v) {
        resetD(v); scene = 'game'; pane.hide(); busy = 0; M.awaiting = 0;
        hud();
        if (v.phase === 'end' || v.phase === 'over') showWait();
      }

      function pump() {
        const t = now();
        if (t < busy) return;
        if (Q.length) { applyEvent(Q.shift()); return; }
        if (M.pv) {
          const v = M.pv; M.pv = null;
          const same = v.hand.slice().sort().join() === D.hand.slice().sort().join() && v.placed.length === D.placed.length && v.yardN === D.yardN;
          if (!same) syncD(v); else { D.turn = v.turn; D.need = v.need; D.scores = v.scores.slice(); }
        }
        if (D.endInfo && !pane.open) { showEnd(); return; }
        if (M.role !== 'guest' && S && S.phase === 'play' && !M.human[S.turn] && scene === 'game' && !pane.open) botStep(t);
        if (M.awaiting && t - M.awaiting > 3000) M.awaiting = 0;
      }

      function botStep(t) {
        if (!M.bot) { M.bot = t + (opt.diff === 'Easy' ? 520 : 700) + Math.random() * 600; return; }
        if (t < M.bot) return;
        M.bot = 0;
        const p = S.turn;
        if (dmMoves(S, p).length) {
          const m = dmPick(S, p, M.mode === 'online' ? opt.diff : opt.diff);
          if (m) engineDo(p, { k: 'play', id: m.id, arm: m.arm });
        } else engineDo(p, { k: 'draw' });
      }

      function saveHost() {
        if (M.mode !== 'online' || M.role !== 'host' || !S) return;
        if (S.phase === 'over') svDel('dominoes'); else svPut('dominoes', api.net.code, { S: Object.assign({}, S, { T: null }), names: M.names, human: M.human });
      }
      function flush(ev) {
        if (!ev.length) return;
        saveHost();
        for (const e of ev) Q.push(dmFilter(e, 0, S));
        if (M.mode === 'online' && M.role === 'host') {
          M.pids.forEach((id, q) => {
            if (id && q !== 0 && M.human[q]) api.net.sendTo(id, { t: 'ev', es: ev.map(e => dmFilter(e, q, S)), v: dmView(S, q) });
          });
        }
      }

      function engineDo(q, a) {
        if (!S) return false;
        const ev = [];
        let ok = false;
        if (a.k === 'play') ok = dmPlay(S, q, a.id, a.arm, ev);
        else if (a.k === 'draw') ok = dmDraw(S, q, ev);
        if (ok) flush(ev);
        return ok;
      }

      function act(a) {
        if (M.role === 'guest') { M.awaiting = now(); api.net.send({ t: 'act', a }); return; }
        M.awaiting = now();
        if (!engineDo(0, a)) M.awaiting = 0;
      }

      function startRound() {
        pane.hide(); scene = 'game'; D.endInfo = null;
        const ev = []; dmDeal(S, Math.random, ev);
        Q.length = 0; M.bot = 0;
        flush(ev); hud();
      }

      function seatNames(n, humans) {
        const pool = shuffle(NAMES.slice()), out = [];
        for (let p = 0; p < n; p++) out[p] = humans[p] || pool.pop();
        return out;
      }

      function setupMsg(q) {
        return { t: 'setup', n: S.n, seat: q, names: M.names, human: M.human, set: S.set, mode: S.mode, spin: S.spin, target: S.target };
      }

      function newMatch() {
        M.tok++; M.bot = 0; Q.length = 0; fly.length = 0; fx.length = 0;
        const online = M.mode === 'online' && M.role === 'host';
        let n, humans = [];
        if (online) {
          const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
          M.players = live;
          const k = Math.max(1, Math.min(4, live.length));
          n = clamp(M.bots ? Math.max(k, M.size || k) : k, 2, 4);
          M.pids = Array(n).fill(null);
          for (let i = 0; i < k; i++) { M.pids[i] = live[i].id; humans[i] = live[i].name; }
          M.human = Array.from({ length: n }, (_, i) => i < k);
        } else { M.mode = 'cpu'; M.role = 'local'; n = opt.n; M.human = Array.from({ length: n }, (_, i) => i === 0); humans[0] = 'You'; M.pids = []; }
        M.n = n; M.names = seatNames(n, humans);
        S = dmCreate({ n, set: opt.set, mode: opt.mode, spin: useSpin(), target: opt.target });
        viewer = 0;
        resetD({ n, mode: S.mode, set: S.set, spin: S.spin, target: S.target, scores: Array(n).fill(0), counts: Array(n).fill(0) });
        D.phase = '';
        api.score(0);
        if (online) M.pids.forEach((id, q) => { if (id && q !== 0) api.net.sendTo(id, setupMsg(q)); });
        startRound();
      }

      function nextRound() {
        if (M.role === 'guest') return;
        if (S.phase !== 'end') return;
        startRound();
      }

      function hud() {
        const inGame = scene === 'game';
        bMenu.hidden = !inGame; bHint.hidden = !(inGame && M.role !== 'guest' && M.mode !== 'online' && D.phase === 'play');
        netEl.hidden = !(inGame && M.mode === 'online');
        statusUpdate();
      }

      function statusUpdate() {
        let a = '', b = '';
        if (scene === 'game') {
          b = `${DM_MODES[D.mode]}${D.spin ? ' + spinner' : ''} · Round ${D.round} · first to ${D.target}`;
          if (D.mode === 'fives' && D.placed.length) b += ` · ends ${dmEndsSum(D)}`;
          if (D.phase === 'play') {
            if (D.turn === viewer) a = D.need === 'draw' ? 'Nothing fits: draw from the boneyard' : U.sel >= 0 ? 'Choose where to place it' : (D.forced >= 0 && !D.placed.length ? 'You start: play the highest double' : 'Your turn');
            else if (D.turn >= 0) a = `${fullName(D.turn)} ${D.need === 'draw' ? 'draws' : 'is thinking'}…`;
          } else if (D.phase === 'end') a = 'Round over';
          else if (D.phase === 'over') a = 'Match over';
        }
        U.st = { a, b };
      }

      function drawStatus(t) {
        if (!U.st || !U.st.a) return;
        const y = PORT ? 470 : 476;
        ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        const mine = D.turn === viewer && D.phase === 'play';
        ctx.font = `900 ${PORT ? 15 : 17}px ${FONT}`; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(5,30,16,.85)'; ctx.strokeText(U.st.a, W / 2, y);
        ctx.fillStyle = mine ? '#ffe58a' : '#fff'; ctx.fillText(U.st.a, W / 2, y);
        ctx.font = `800 ${PORT ? 11 : 12}px ${FONT}`; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(5,30,16,.85)'; ctx.strokeText(U.st.b, W / 2, y + (PORT ? 16 : 18));
        ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.fillText(U.st.b, W / 2, y + (PORT ? 16 : 18));
        ctx.restore();
      }

      function canAct() { return scene === 'game' && !pane.open && D.phase === 'play' && D.turn === viewer && !Q.length && now() >= busy && !M.awaiting && !api.paused; }

      function tryTile(id) {
        if (!canAct()) return;
        const mv = myMoves().filter(m => m.id === id);
        if (!mv.length) { U.shake.set(id, now()); au.bad(); U.sel = -1; U.opts = []; return; }
        if (mv.length === 1) { au.clack(.8); act({ k: 'play', id, arm: mv[0].arm }); return; }
        U.sel = id; U.opts = mv; U.kbdArm = 0; au.pop();
      }
      function tryDraw() {
        if (!canAct()) return;
        if (D.need !== 'draw') { au.bad(); return; }
        act({ k: 'draw' });
      }

      function ghostFor(m) {
        const L = board();
        const dbl = D.T[m.id][0] === D.T[m.id][1];
        if (m.arm < 0) return { x: (G.board.x0 + G.board.x1) / 2, y: (G.board.y0 + G.board.y1) / 2, hw: dbl ? L.L / 4 : L.L / 2, hh: dbl ? L.L / 2 : L.L / 4, ang: dbl ? Math.PI / 2 : 0, m };
        const g = L.ghost(m.arm, dbl);
        return g ? Object.assign({ m }, g) : null;
      }

      function dropAt(x, y, id) {
        const mv = myMoves().filter(m => m.id === id);
        if (!mv.length) return false;
        let best = null, bd = 1e9;
        for (const m of mv) {
          const g = ghostFor(m); if (!g) continue;
          const d = Math.hypot(g.x - x, g.y - y);
          if (d < bd) { bd = d; best = m; }
        }
        if (!best) return false;
        if (mv.length > 1 && bd > board().L * 1.6) return false;
        au.clack(.8); act({ k: 'play', id, arm: best.arm });
        return true;
      }

      let hs = null;
      function handHit(x, y) {
        if (!hs) return -1;
        let hit = -1;
        D.hand.forEach((id, i) => {
          const h = hv.get(id); if (!h) return;
          const ws = hs.ws;
          if (Math.abs(x - h.x) <= ws / 2 + 2 && Math.abs(y - h.y + (h.lift || 0)) <= ws + 2) hit = i;
        });
        return hit;
      }
      const yardHit = (x, y) => G && Math.hypot(x - G.yard.x, y - G.yard.y) < 44 && D.yardN > 0 && D.mode !== 'block';

      api.on(cv, 'pointerdown', e => {
        au.tick();
        if (pane.open || scene !== 'game') return;
        const p = loc(e);
        if (U.sel >= 0) {
          let best = null, bd = 1e9;
          for (const m of U.opts) { const g = ghostFor(m); if (!g) continue; const d = Math.hypot(g.x - p.x, g.y - p.y); if (d < bd) { bd = d; best = m; } }
          if (best && bd < board().L * 1.3) { au.clack(.8); act({ k: 'play', id: best.id, arm: best.arm }); return; }
        }
        const hi = handHit(p.x, p.y);
        if (hi >= 0) {
          const id = D.hand[hi];
          U.drag = { id, x0: p.x, y0: p.y, x: p.x, y: p.y, moved: false, pid: e.pointerId };
          try { cv.setPointerCapture(e.pointerId); } catch (x) {}
          return;
        }
        if (yardHit(p.x, p.y)) { tryDraw(); return; }
        U.sel = -1; U.opts = [];
      });
      api.on(cv, 'pointermove', e => {
        const p = loc(e);
        if (!U.drag) {
          if (e.pointerType === 'mouse' && scene === 'game' && !pane.open) { const hi = handHit(p.x, p.y); U.hover = hi >= 0 ? D.hand[hi] : -1; cv.style.cursor = hi >= 0 || yardHit(p.x, p.y) ? 'pointer' : ''; }
          return;
        }
        if (e.pointerId !== U.drag.pid) return;
        U.drag.x = p.x; U.drag.y = p.y;
        if (Math.hypot(p.x - U.drag.x0, p.y - U.drag.y0) > 12 && canAct()) {
          if (!U.drag.moved) { U.drag.moved = true; const mv = myMoves().filter(m => m.id === U.drag.id); if (mv.length) { U.sel = U.drag.id; U.opts = mv; } }
        }
      });
      const upDrag = e => {
        const d = U.drag; if (!d || e.pointerId !== d.pid) return;
        U.drag = null;
        const p = loc(e);
        if (d.moved) {
          const ok = p.y < G.hand.zone - 30 && dropAt(p.x, p.y, d.id);
          if (!ok) { U.sel = -1; U.opts = []; }
        } else {
          if (!canAct()) return;
          if (U.sel === d.id) { U.sel = -1; U.opts = []; } else tryTile(d.id);
        }
      };
      api.on(cv, 'pointerup', upDrag);
      api.on(cv, 'pointercancel', () => { U.drag = null; });

      api.on(window, 'keydown', e => {
        if (!api.alive || pane.open || scene !== 'game') return;
        const k = e.key;
        if (k === 'ArrowLeft' || k === 'ArrowRight') {
          e.preventDefault();
          const d = k === 'ArrowLeft' ? -1 : 1;
          if (U.sel >= 0 && U.opts.length > 1) U.kbdArm = (U.kbdArm + d + U.opts.length) % U.opts.length;
          else if (D.hand.length) { U.kbd = (U.kbd + d + D.hand.length) % D.hand.length; U.sel = -1; U.opts = []; }
        } else if (k === 'Enter' || k === ' ') {
          e.preventDefault();
          if (U.sel >= 0 && U.opts.length) { const m = U.opts[U.kbdArm % U.opts.length]; act({ k: 'play', id: m.id, arm: m.arm }); }
          else if (D.need === 'draw') tryDraw();
          else if (D.hand[U.kbd] != null) tryTile(D.hand[U.kbd]);
        } else if (k === 'd' || k === 'D') tryDraw();
        else if (k === 'h' || k === 'H') showHint();
      });

      function showHint() {
        if (!canAct() || !S || M.mode === 'online') return;
        const m = dmPick(S, 0, 'Normal');
        if (m) { U.hint = m.id; U.sel = m.id; U.opts = myMoves().filter(x => x.id === m.id); U.kbdArm = Math.max(0, U.opts.findIndex(x => x.arm === m.arm)); }
      }

      function drawBackRack(sd, n, p) {
        if (n <= 0) return;
        const seatShow = D.reveal && D.reveal[p] && D.phase !== 'play';
        const list = seatShow ? D.reveal[p] : null;
        if (!sd.horiz) {
          const tw = PORT ? 17 : 24, step = Math.min(tw + 5, ((sd.cw || 560) - 20) / Math.max(1, n));
          const total = (n - 1) * step;
          for (let i = 0; i < n; i++) {
            const x = sd.rx - total / 2 + i * step;
            if (list) dmTile(ctx, x, sd.ry, Math.PI / 2, tw * 2.1, D.T[list[i]][0], D.T[list[i]][1], { noShadow: false });
            else dmTile(ctx, x, sd.ry, Math.PI / 2, tw * 2.1, 0, 0, { back: true });
          }
        } else {
          const tw = 24, step = Math.min(tw + 5, 330 / Math.max(1, n));
          const total = (n - 1) * step;
          for (let i = 0; i < n; i++) {
            const y = sd.ry - total / 2 + i * step;
            if (list) dmTile(ctx, sd.rx, y, 0, tw * 2.1, D.T[list[i]][0], D.T[list[i]][1], {});
            else dmTile(ctx, sd.rx, y, 0, tw * 2.1, 0, 0, { back: true });
          }
        }
      }

      function plate(x, y, w, h, p, t) {
        const act = scene === 'game' && D.phase === 'play' && D.turn === p;
        ctx.save();
        ctx.fillStyle = 'rgba(8,20,14,.62)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
        ctx.lineWidth = act ? 3 : 1.5; ctx.strokeStyle = act ? SEAT[p % 6] : 'rgba(255,255,255,.18)';
        if (act) { ctx.shadowColor = SEAT[p % 6]; ctx.shadowBlur = 10 + Math.sin(t * .006) * 5; }
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = SEAT[p % 6]; ctx.beginPath(); ctx.arc(x + h / 2, y + h / 2, h * .32, 0, TAU); ctx.fill();
        ctx.fillStyle = '#16140a'; ctx.font = `900 ${h * .34}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((nameOf(p)[0] || '?').toUpperCase(), x + h / 2, y + h / 2 + 1);
        ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.min(14, h * .3)}px ${FONT}`;
        let nm = nameOf(p); if (nm.length > 11) nm = nm.slice(0, 10) + '…';
        ctx.fillText(nm, x + h + 2, y + h * .34);
        ctx.fillStyle = '#ffe58a'; ctx.font = `900 ${h * .36}px ${FONT}`;
        ctx.fillText(String(D.scores[p] || 0), x + h + 2, y + h * .74);
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = `800 ${h * .24}px ${FONT}`; ctx.textAlign = 'right';
        ctx.fillText((D.counts[p] != null ? D.counts[p] : 0) + ' tiles', x + w - 8, y + h * .74);
        ctx.restore();
      }

      function drawYard(t) {
        if (D.mode === 'block') return;
        const y = G.yard, n = Math.min(5, Math.ceil(D.yardN / 4));
        const need = D.phase === 'play' && D.turn === viewer && D.need === 'draw' && !Q.length;
        for (let i = 0; i < n; i++) dmTile(ctx, y.x + (i % 2 ? 4 : -3), y.y - i * 4, (i * 37 % 11 - 5) * .03, PORT ? 40 : 52, 0, 0, { back: true, glow: need && i === n - 1 ? `rgba(255,229,138,${.55 + .4 * Math.sin(t * .008)})` : null });
        ctx.fillStyle = 'rgba(8,20,14,.72)'; ctx.beginPath(); ctx.roundRect(y.x - 30, y.y + 22, 60, 22, 11); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `800 12px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(D.yardN ? D.yardN + ' left' : 'empty', y.x, y.y + 33);
      }

      function drawGhosts(t) {
        if (U.sel < 0) return;
        U.opts.forEach((m, i) => {
          const g = ghostFor(m); if (!g) return;
          const pulse = .6 + .4 * Math.sin(t * .007 + i), sel = U.opts.length > 1 && i === U.kbdArm % U.opts.length;
          ctx.save(); ctx.translate(g.x, g.y);
          ctx.fillStyle = `rgba(255,229,138,${.14 * pulse + (sel ? .12 : 0)})`; ctx.strokeStyle = `rgba(255,229,138,${.55 + .4 * pulse})`; ctx.lineWidth = sel ? 4 : 2.5;
          ctx.setLineDash([7, 5]);
          ctx.beginPath(); ctx.roundRect(-g.hw - 2, -g.hh - 2, g.hw * 2 + 4, g.hh * 2 + 4, 8); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
          const val = m.arm < 0 ? '' : D.arms[m.arm].end;
          if (val !== '') {
            ctx.fillStyle = '#ffe58a'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill();
            ctx.fillStyle = '#2a2108'; ctx.font = `900 14px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(val, 0, 1);
          }
          ctx.restore();
        });
      }

      function drawBoard(t, dt) {
        if (!D.placed.length) return;
        const L = board(), k = Math.min(1, dt * 12);
        for (const tl of L.tiles) {
          const id = tl.rec.id;
          let b = bt.get(id);
          if (!b) { b = { x: tl.x, y: tl.y, ang: tl.ang, L: L.L }; bt.set(id, b); }
          else { b.x += (tl.x - b.x) * k; b.y += (tl.y - b.y) * k; b.L += (L.L - b.L) * k; let da = tl.ang - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += da * k; }
          if (flying.has(id)) continue;
          const last = D.placed[D.placed.length - 1].id === id;
          dmTile(ctx, b.x, b.y, b.ang, b.L, tl.rec.inV, tl.rec.outV, { glow: last && D.phase === 'play' ? 'rgba(255,229,138,.5)' : null });
        }
        if (D.spinner && D.spin) {
          const sp = D.placed.find(r => r.sp), tl = sp && L.tiles.find(x => x.rec === sp);
          if (tl) { const b = bt.get(tl.rec.id); if (b && !flying.has(tl.rec.id)) { ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(b.x, b.y, b.L * .075, 0, TAU); ctx.fill(); } }
        }
      }

      function drawHand(t, dt) {
        const hsn = handSlots(D.hand.length);
        hs = hsn;
        const k = Math.min(1, dt * 14);
        const moves = canAct() || (D.turn === viewer && D.phase === 'play' && !Q.length) ? myMoves() : [];
        const playable = new Set(moves.map(m => m.id));
        const myTurn = D.turn === viewer && D.phase === 'play' && !Q.length && now() >= busy;
        D.hand.forEach((id, i) => {
          let h = hv.get(id);
          if (!h) { h = { x: G.yard.x, y: G.yard.y, tx: hsn.slots[i].x, ty: hsn.slots[i].y, L: 0, show: 0 }; hv.set(id, h); }
          h.tx = hsn.slots[i].x; h.ty = hsn.slots[i].y;
          if (U.drag && U.drag.id === id && U.drag.moved) { h.x += (U.drag.x - h.x) * Math.min(1, dt * 30); h.y += (U.drag.y - h.y) * Math.min(1, dt * 30); }
          else { h.x += (h.tx - h.x) * k; h.y += (h.ty - h.y) * k; }
          h.L += (hsn.ws * 2 - h.L) * k;
          const want = (U.hover === id && myTurn ? -10 : 0) + (U.sel === id ? -18 : 0) + (U.kbd === i && myTurn && !U.drag ? -6 : 0) + (opt.assist && myTurn && playable.has(id) ? -4 : 0);
          h.lift = (h.lift || 0) + (-want - (h.lift || 0)) * Math.min(1, dt * 16);
        });
        const order = D.hand.slice();
        order.forEach((id, i) => {
          const h = hv.get(id);
          if (!h || now() < h.show) return;
          let sx = 0;
          const sk = U.shake.get(id);
          if (sk) { const a = (now() - sk) / 350; if (a >= 1) U.shake.delete(id); else sx = Math.sin(a * 26) * 6 * (1 - a); }
          const dim = opt.assist && myTurn && !playable.has(id);
          const glow = U.sel === id ? 'rgba(255,229,138,.95)' : U.hint === id ? 'rgba(120,255,170,.95)' : null;
          dmTile(ctx, h.x + sx, h.y - h.lift, Math.PI / 2, h.L, D.T[id][0], D.T[id][1], { dim, glow });
        });
        if (U.drag && U.drag.moved) drawGhosts(t);
      }

      function drawFly(t) {
        for (let i = fly.length - 1; i >= 0; i--) {
          const f = fly[i], a = (t - f.t0) / f.dur;
          const to = f.to();
          if (a >= 1) {
            fly.splice(i, 1);
            if (f.id != null) { flying.delete(f.id); bt.set(f.id, { x: to.x, y: to.y, ang: to.ang, L: to.L }); au.clack(); fx.push({ k: 'ring', x: to.x, y: to.y, t0: t, dur: 380 }); }
            continue;
          }
          const e = easeIO(a), x = lerp(f.from.x, to.x, e), y = lerp(f.from.y, to.y, e) - Math.sin(e * Math.PI) * 22;
          let da = to.ang - f.from.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
          const ang = f.from.ang + da * e, L = lerp(f.from.L, to.L, e) * (1 + Math.sin(e * Math.PI) * .12);
          dmTile(ctx, x, y, ang, L, f.v1 || 0, f.v2 || 0, { back: f.back && (f.flip ? e < .55 : true) });
        }
      }

      function drawFx(t) {
        for (let i = fx.length - 1; i >= 0; i--) {
          const f = fx[i], a = (t - f.t0) / f.dur;
          if (a >= 1) { fx.splice(i, 1); continue; }
          if (f.k === 'ring') { ctx.strokeStyle = `rgba(255,255,255,${.5 * (1 - a)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, 10 + a * 34, 0, TAU); ctx.stroke(); }
          else if (f.k === 'pop') {
            ctx.save(); ctx.globalAlpha = a < .7 ? 1 : 1 - (a - .7) / .3; ctx.translate(f.x, f.y - a * 46);
            const s = .6 + easeOut(a * 3) * .6; ctx.scale(s, s);
            ctx.font = `900 56px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = '#1b3a28'; ctx.lineJoin = 'round'; ctx.strokeText(f.text, 0, 0);
            ctx.fillStyle = SEAT[f.p % 6]; ctx.fillText(f.text, 0, 0);
            ctx.font = `800 15px ${FONT}`; ctx.fillStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeText(nameOf(f.p), 0, 36); ctx.fillText(nameOf(f.p), 0, 36);
            ctx.restore();
          } else if (f.k === 'bubble') {
            const s = G.seats[rel(f.p)], pos = s ? { x: s.rx, y: s.ry + (PORT ? 40 : 30) } : { x: W / 2, y: H - 150 };
            ctx.save(); ctx.globalAlpha = a < .8 ? 1 : 1 - (a - .8) / .2;
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(pos.x - 36, pos.y - 17 - a * 8, 72, 34, 17); ctx.fill();
            ctx.fillStyle = '#222'; ctx.font = `900 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, pos.x, pos.y - a * 8);
            ctx.restore();
          }
        }
      }

      function drawTitleBg(t) {
        const ids = [[6, 6], [5, 3], [4, 4], [2, 1], [3, 0]];
        ids.forEach((v, i) => {
          const x = W / 2 + (i - 2) * (PORT ? 70 : 130), y = H * .78 + Math.sin(t * .0016 + i) * 5 + Math.abs(i - 2) * 6;
          dmTile(ctx, x, y, (i - 2) * .22 + Math.PI / 2, PORT ? 70 : 96, v[0], v[1], {});
        });
      }

      api.loop((dtc, t) => {
        const dt = Math.min(.05, dtc);
        pump();
        ctx.drawImage(feltC, 0, 0, W, H);
        if (scene === 'title') { drawTitleBg(t); return; }
        statusUpdate();
        for (let p = 0; p < D.n; p++) {
          if (p === viewer) { const m = G.me; plate(m.x, m.y, m.w, m.h, p, t); continue; }
          const sd = G.seats[rel(p)]; if (!sd) continue;
          plate(sd.plate.x, sd.plate.y, sd.plate.w, sd.plate.h, p, t);
          drawBackRack(sd, D.counts[p], p);
        }
        drawBoard(t, dt);
        if (!(U.drag && U.drag.moved)) drawGhosts(t);
        drawYard(t);
        drawHand(t, dt);
        drawFly(t);
        drawFx(t);
        drawStatus(t);
        if (scene === 'game' && D.phase === 'play' && D.turn === viewer && D.need === 'draw' && !Q.length && now() >= busy) {
          ctx.fillStyle = `rgba(255,229,138,${.7 + .3 * Math.sin(t * .008)})`; ctx.font = `900 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('DRAW', G.yard.x, G.yard.y - 40);
        }
        if (M.mode === 'online' && scene === 'game') {
          const on = api.net.connected || M.role === 'host';
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · hosting' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }
      });

      function settingsHtml(online) {
        return `${row('Variant', 'Scoring rules', seg('mode', [['draw', 'Draw'], ['block', 'Block'], ['fives', 'All Fives']], opt.mode))}
${row('Tiles', '', seg('set', [[6, 'Double six'], [9, 'Double nine']], opt.set))}
${online ? '' : row('Players', 'You and bots', seg('n', [[2, '2'], [3, '3'], [4, '4']], opt.n))}
${online ? '' : row('Bots', '', seg('diff', [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']], opt.diff))}
${row('Spinner', 'First double opens its sides', seg('spin', [['auto', 'Auto'], ['on', 'On'], ['off', 'Off']], opt.spin))}
${row('Game to', 'Points', seg('target', [[50, '50'], [100, '100'], [150, '150'], [200, '200'], [250, '250']], opt.target))}
${row('Highlight', 'Playable tiles', seg('assist', [[true, 'On'], [false, 'Off']], opt.assist))}`;
      }

      function showTitle() {
        scene = 'title'; M.mode = 'cpu'; M.role = 'local'; S = null; D.endInfo = null; Q.length = 0; fly.length = 0; fx.length = 0;
        hud();
        const render = () => pane.show('title', `<div class="gx-box wide"><p class="gx-kick">Board game</p><h3>Dominoes</h3>${dmLogo}<div class="gx-grid">${settingsHtml(false)}</div><button class="gx-big" data-a="play">Play vs bots</button><button class="gx-big alt" data-a="online">Play online<small>2-4 players, bots can fill seats</small></button><div class="gx-row"><button class="gx-sm" data-a="rules">How to play</button></div></div>`, onTitle, 'clear');
        const onTitle = a => {
          if (a.startsWith('set:')) { const [, k, v] = a.split(':'); opt[k] = parseV(v); save(); render(); return; }
          if (a === 'play') { M.mode = 'cpu'; M.role = 'local'; opt.online = false; save(); newMatch(); }
          else if (a === 'online') startOnline();
          else if (a === 'rules') showRules(() => render());
        };
        render();
      }

      function showRules(back) {
        pane.show('rules', `<div class="gx-box wide"><p class="gx-kick">How to play</p><h3>Dominoes</h3>${dmRules(opt.mode)}<button class="gx-big" data-a="x">Got it</button></div>`, () => { if (back) back(); else pane.hide(); });
      }

      function showMenu() {
        const online = M.mode === 'online';
        pane.show('menu', `<div class="gx-box"><h3>Paused</h3><button class="gx-big" data-a="resume">Resume</button>${online && M.role === 'host' ? '<button class="gx-big alt" data-a="lobby">Back to lobby</button>' : ''}${online ? '' : '<button class="gx-big alt" data-a="restart">New match</button>'}<button class="gx-big alt" data-a="rules">How to play</button><button class="gx-big red" data-a="quit">${online ? 'Leave game' : 'Main menu'}</button></div>`, a => {
          if (a === 'resume') pane.hide();
          else if (a === 'restart') newMatch();
          else if (a === 'rules') showRules(() => showMenu());
          else if (a === 'lobby') { pane.hide(); svDel('dominoes'); startOnline(); }
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }

      function showWait() {
        pane.show('wait', `<div class="gx-box"><p class="gx-kick">Online</p><h3>${D.phase === 'over' ? 'Match over' : 'Round over'}</h3><p>Waiting for the host…</p><div class="gx-row"><button class="gx-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); }, 'clear');
      }

      function showEnd() {
        const e = D.endInfo; if (!e) return;
        D.endInfo = null;
        const over = e.over, win = e.w, host = M.role !== 'guest';
        let head, sub;
        if (over) { head = e.champ === viewer ? 'You win the match!' : `${E(fullName(e.champ))} wins the match`; sub = `First to ${D.target} points.`; }
        else if (win < 0) { head = 'Blocked: a tie'; sub = 'No one scores this round.'; }
        else { head = win === viewer ? 'You win the round!' : `${E(fullName(win))} wins the round`; sub = e.blocked ? 'The game is blocked: lowest hand wins.' : 'Out of tiles.'; }
        if (e.pts > 0 && win >= 0) sub += ` +${e.pts} points.`;
        const rows = D.scores.map((s, p) => ({ p, s, pips: e.tot[p] })).sort((a, b) => b.s - a.s).map(r => `<tr class="${r.p === (over ? e.champ : win) ? 'win' : ''}"><td><i style="background:${SEAT[r.p % 6]}"></i>${E(nameOf(r.p))}</td><td>${r.pips} pips</td><td>${r.s}</td></tr>`).join('');
        const youWin = over && e.champ === viewer;
        if (over) {
          if (youWin) { au.win(); opt.wins = (opt.wins || 0) + 1; save(); api.submit(D.scores[viewer]); } else au.lose();
        } else if (win === viewer) au.win(); else if (win >= 0) au.good();
        const btns = host ? (over ? `<button class="gx-big" data-a="again">${M.mode === 'online' ? 'Rematch' : 'Play again'}</button>${M.mode === 'online' ? '<button class="gx-big alt" data-a="lobby">Back to lobby</button>' : ''}<button class="gx-big alt" data-a="menu">${M.mode === 'online' ? 'Leave' : 'Main menu'}</button>` : `<button class="gx-big" data-a="next">Next round</button>`) : `<p>Waiting for the host…</p><button class="gx-sm" data-a="menu">Leave</button>`;
        pane.show('end', `<div class="gx-box"><p class="gx-kick">${over ? 'Match over' : 'Round ' + e.round}</p><h3>${head}</h3><p>${sub}</p><table class="gx-tbl"><tr><th>Player</th><th>Hand</th><th>Score</th></tr>${rows}</table>${btns}</div>`, a => {
          if (a === 'next') { pane.hide(); nextRound(); }
          else if (a === 'again') newMatch();
          else if (a === 'lobby') { pane.hide(); svDel('dominoes'); startOnline(); }
          else if (a === 'menu') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        }, 'clear');
      }

      bMenu.addEventListener('click', () => { au.tick(); if (pane.open && pane.kind === 'menu') pane.hide(); else showMenu(); });
      bHelp.addEventListener('click', () => { au.tick(); showRules(() => { if (scene === 'title') showTitle(); else pane.hide(); }); });
      bHint.addEventListener('click', () => { au.tick(); showHint(); });

      function leaveOnline() {
        M.tok++; M.mode = 'cpu'; M.role = 'local'; S = null; M.pids = []; M.players = [];
        svDel('dominoes'); api.net.close(); showTitle();
      }

      function hookOnline() {
        if (M.hooked) return;
        M.hooked = true;
        hookNet(api, {
          data: onData,
          leave: p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); },
          rejoin: p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); },
          lobby: () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); },
          close: reason => {
            if (M.mode !== 'online' || !M.role || M.role === 'local') return;
            M.tok++; M.role = 'local'; S = null; Q.length = 0;
            au.lose();
            const hh = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
            const tt = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
            pane.show('left', `<div class="gx-box"><p class="gx-kick">Online</p><h3>${hh}</h3><p>${tt}</p><button class="gx-big" data-a="room">Online lobby</button><button class="gx-big alt" data-a="menu">Main menu</button></div>`, a => { if (a === 'room') startOnline(); else { api.net.close(); showTitle(); } });
          }
        });
      }

      function seatToBot(id) {
        const q = M.pids.indexOf(id);
        if (q < 0 || !S) return;
        const who = M.names[q];
        M.pids[q] = null; M.human[q] = false; M.names[q] = who + ' (bot)';
        M.pids.forEach((pid, s2) => { if (pid && s2 !== 0 && M.human[s2]) api.net.sendTo(pid, { t: 'seats', names: M.names, human: M.human }); });
        api.toast(who + ' left. A bot takes the seat.');
      }

      function sendSync(id) {
        if (!S) return;
        const q = M.pids.indexOf(id);
        if (q < 0 || !M.human[q]) return;
        api.net.sendTo(id, setupMsg(q));
        api.net.sendTo(id, { t: 'ev', es: [], v: dmView(S, q), sync: 1 });
      }

      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookOnline();
        pane.hide(); scene = 'title'; hud();
        Q.length = 0; fly.length = 0; fx.length = 0; S = null;
        M.mode = 'online'; M.role = null;
        const r = await api.net.room({ title: 'Dominoes', sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; M.role = 'local'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, 4); M.bots = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') hostStart();
        else { pane.show('wait', `<div class="gx-box"><p class="gx-kick">Online</p><h3>Connected</h3><p>Waiting for the host to deal…</p><div class="gx-row"><button class="gx-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); }); }
      }

      function hostStart() {
        const sv = svGet('dominoes', api.net.code), map = sv && sv.S.phase !== 'over' && svMap(sv, M.players);
        if (!map) return newMatch();
        const left = sv.human.filter((h, i) => i > 0 && h).length - Object.keys(map).length;
        svAsk(pane, `Saved game: round ${sv.S.round}.${left ? ` ${left} missing player${left > 1 ? 's' : ''} will be replaced by bots.` : ''}`, a => {
          if (a === 'go') resumeMatch(sv, map); else if (a === 'new') newMatch(); else leaveOnline();
        });
      }

      function resumeMatch(sv, map) {
        M.tok++; M.bot = 0; Q.length = 0; fly.length = 0; fx.length = 0;
        S = sv.S; S.T = DM_T[S.set];
        const n = S.n;
        M.n = n; M.names = sv.names.slice(); M.human = Array(n).fill(false); M.pids = Array(n).fill(null);
        M.human[0] = true; M.pids[0] = M.players[0].id;
        for (let q = 1; q < n; q++) {
          if (!sv.human[q]) continue;
          if (map[q]) { M.pids[q] = map[q].id; M.human[q] = true; } else M.names[q] += ' (bot)';
        }
        viewer = 0; M.mode = 'online'; M.role = 'host';
        resetD(Object.assign(dmView(S, 0), { counts: S.hands.map(h => h.length) }));
        scene = 'game'; pane.hide(); busy = 0; api.score(0); hud();
        M.pids.forEach((id, q) => { if (id && q !== 0) sendSync(id); });
        if (S.phase === 'end') startRound();
      }

      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !S || d.t !== 'act' || !d.a) return;
          const q = M.pids.indexOf(from);
          if (q < 0 || q === 0 || !M.human[q] || typeof d.a !== 'object') return;
          const a = d.a;
          if (!engineDo(q, a)) api.net.sendTo(from, { t: 'ev', es: [], v: dmView(S, q), sync: 1 });
        } else {
          if (d.t === 'setup') {
            M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat; M.names = d.names; M.human = d.human; M.n = d.n;
            Q.length = 0; fly.length = 0; fx.length = 0; M.pv = null;
            resetD({ n: d.n, mode: d.mode, set: d.set, spin: d.spin, target: d.target, scores: Array(d.n).fill(0), counts: Array(d.n).fill(0) });
            scene = 'game'; pane.hide(); busy = 0; M.awaiting = 0; hud(); api.score(0);
          } else if (M.role !== 'guest') return;
          else if (d.t === 'ev') {
            if (d.sync) syncD(d.v);
            else { for (const e of d.es) Q.push(e); M.pv = d.v; M.awaiting = 0; }
          } else if (d.t === 'seats') { M.names = d.names; M.human = d.human; }
        }
      }

      fit(true);
      root._dm = { M, D, Q, opt, get S() { return S; }, get viewer() { return viewer; }, pane, hv, act, canAct, myMoves, board, G: () => G, handSlots, ghostFor, dmPick, busy: () => busy - now() };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { killed = true; M.tok++; au.close(); } };
    }
  });

  Ameplay.covers.dominoes = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dmc-g" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#2f9a5f"/><stop offset=".65" stop-color="#1c7444"/><stop offset="1" stop-color="#0c3f26"/></radialGradient><linearGradient id="dmc-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf3"/><stop offset="1" stop-color="#dccfa9"/></linearGradient></defs><rect width="400" height="300" fill="url(#dmc-g)"/><g stroke="#9d8f68" stroke-width="3"><g transform="translate(110 150) rotate(-8)"><rect x="-70" y="-35" width="140" height="70" rx="12" fill="#000" opacity=".25" transform="translate(5 8)" stroke="none"/><rect x="-70" y="-35" width="140" height="70" rx="12" fill="url(#dmc-t)"/><path d="M0-26V26" stroke="#8c7d57"/><g fill="#14161a" stroke="none"><circle cx="-48" cy="-16" r="7"/><circle cx="-35" cy="0" r="7"/><circle cx="-22" cy="16" r="7"/><circle cx="22" cy="-16" r="7"/><circle cx="48" cy="-16" r="7"/><circle cx="22" cy="16" r="7"/><circle cx="48" cy="16" r="7"/><circle cx="35" cy="0" r="7"/></g></g><g transform="translate(228 138) rotate(6)"><rect x="-70" y="-35" width="140" height="70" rx="12" fill="#000" opacity=".25" transform="translate(5 8)" stroke="none"/><rect x="-70" y="-35" width="140" height="70" rx="12" fill="url(#dmc-t)"/><path d="M0-26V26" stroke="#8c7d57"/><g fill="#14161a" stroke="none"><circle cx="-35" cy="0" r="7"/><circle cx="-48" cy="-16" r="7"/><circle cx="-22" cy="16" r="7"/><circle cx="22" cy="-16" r="7"/><circle cx="48" cy="16" r="7"/><circle cx="35" cy="0" r="7"/><circle cx="22" cy="16" r="7"/><circle cx="48" cy="-16" r="7"/></g></g><g transform="translate(290 200) rotate(80)"><rect x="-70" y="-35" width="140" height="70" rx="12" fill="#000" opacity=".25" transform="translate(5 8)" stroke="none"/><rect x="-70" y="-35" width="140" height="70" rx="12" fill="url(#dmc-t)"/><path d="M0-26V26" stroke="#8c7d57"/><g fill="#14161a" stroke="none"><circle cx="-35" cy="0" r="7"/><circle cx="35" cy="0" r="7"/><circle cx="22" cy="-16" r="7"/><circle cx="48" cy="16" r="7"/><circle cx="22" cy="16" r="7"/><circle cx="48" cy="-16" r="7"/></g></g></g></svg>`;

  const YZ_NAMES = ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes', 'Three of a Kind', 'Four of a Kind', 'Full House', 'Small Straight', 'Large Straight', 'YAHTZEE', 'Chance'];
  const YZ_SHORT = ['Aces', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes', '3 of a Kind', '4 of a Kind', 'Full House', 'Sm. Straight', 'Lg. Straight', 'YAHTZEE', 'Chance'];
  const YZ_HINT = ['Total of 1s', 'Total of 2s', 'Total of 3s', 'Total of 4s', 'Total of 5s', 'Total of 6s', 'Sum of all dice', 'Sum of all dice', '25', '30', '40', '50', 'Sum of all dice'];
  const YZ_PAR = [2.1, 5.3, 8.6, 12.1, 15.7, 19.2, 21.7, 13.1, 22.6, 29.5, 32.7, 16.9, 22];

  const yzCnt = d => { const k = [0, 0, 0, 0, 0, 0, 0]; for (const v of d) k[v]++; return k; };
  const yzSum = d => d[0] + d[1] + d[2] + d[3] + d[4];

  function yzBase(c, d) {
    const k = yzCnt(d);
    if (c < 6) return k[c + 1] * (c + 1);
    const mx = Math.max(k[1], k[2], k[3], k[4], k[5], k[6]);
    if (c === 6) return mx >= 3 ? yzSum(d) : 0;
    if (c === 7) return mx >= 4 ? yzSum(d) : 0;
    if (c === 8) return k.includes(3) && k.includes(2) ? 25 : 0;
    if (c === 9) return (k[1] && k[2] && k[3] && k[4]) || (k[2] && k[3] && k[4] && k[5]) || (k[3] && k[4] && k[5] && k[6]) ? 30 : 0;
    if (c === 10) return (k[1] && k[2] && k[3] && k[4] && k[5]) || (k[2] && k[3] && k[4] && k[5] && k[6]) ? 40 : 0;
    if (c === 11) return mx === 5 ? 50 : 0;
    return yzSum(d);
  }

  function yzNew(n) {
    return { n, turn: 0, round: 1, rolls: 0, dice: [1, 1, 1, 1, 1], held: [false, false, false, false, false], sh: Array.from({ length: n }, () => ({ s: Array(13).fill(null), yb: 0 })), over: false };
  }

  function yzOptions(sh, d) {
    const yz = d[0] === d[1] && d[1] === d[2] && d[2] === d[3] && d[3] === d[4];
    const out = [];
    if (yz && sh.s[11] !== null) {
      const b = sh.s[11] === 50 ? 1 : 0, f = d[0] - 1, sum = yzSum(d);
      if (sh.s[f] === null) return [{ c: f, pts: 5 * d[0], j: 1, b }];
      for (let c = 6; c < 13; c++) if (c !== 11 && sh.s[c] === null) out.push({ c, pts: c === 8 ? 25 : c === 9 ? 30 : c === 10 ? 40 : sum, j: 1, b });
      if (out.length) return out;
      for (let c = 0; c < 6; c++) if (sh.s[c] === null) out.push({ c, pts: 0, j: 1, b });
      return out;
    }
    for (let c = 0; c < 13; c++) if (sh.s[c] === null) out.push({ c, pts: yzBase(c, d), j: 0, b: 0 });
    return out;
  }

  function yzTot(sh) {
    let up = 0, lo = 0, open = 0, room = 0;
    for (let c = 0; c < 6; c++) { if (sh.s[c] === null) { open++; room += 5 * (c + 1); } else up += sh.s[c]; }
    for (let c = 6; c < 13; c++) lo += sh.s[c] || 0;
    const bonus = up >= 63 ? 35 : 0, yb = sh.yb * 100;
    return { up, bonus, lo, yb, total: up + bonus + lo + yb, dead: up < 63 && up + room < 63, need: Math.max(0, 63 - up) };
  }

  function yzApply(S, a, R, fx) {
    if (S.over) return false;
    if (a.k === 'roll') {
      if (S.rolls >= 3) return false;
      if (S.rolls === 0) S.held = [false, false, false, false, false];
      const idx = [];
      for (let i = 0; i < 5; i++) if (!S.held[i]) { S.dice[i] = 1 + rint(6, R); idx.push(i); }
      if (!idx.length) return false;
      S.rolls++;
      fx.push({ k: 'roll', idx, vals: S.dice.slice(), by: S.turn, first: S.rolls === 1 });
      return true;
    }
    if (a.k === 'hold') {
      if (S.rolls < 1 || S.rolls > 2 || !(a.i >= 0 && a.i < 5)) return false;
      S.held[a.i] = !S.held[a.i];
      fx.push({ k: 'hold', held: S.held.slice() });
      return true;
    }
    if (a.k === 'holds') {
      if (S.rolls < 1 || S.rolls > 2 || !Array.isArray(a.flags) || a.flags.length !== 5) return false;
      const nf = a.flags.map(Boolean);
      if (nf.every((v, i) => v === S.held[i])) return true;
      S.held = nf;
      fx.push({ k: 'hold', held: nf.slice() });
      return true;
    }
    if (a.k === 'score') {
      if (S.rolls < 1) return false;
      const sh = S.sh[S.turn], o = yzOptions(sh, S.dice).find(x => x.c === a.c);
      if (!o) return false;
      sh.s[o.c] = o.pts;
      if (o.b) sh.yb++;
      const p = S.turn;
      S.turn = (S.turn + 1) % S.n;
      if (S.turn === 0) S.round++;
      S.rolls = 0; S.held = [false, false, false, false, false];
      if (S.round > 13) S.over = true;
      fx.push({ k: 'score', p, c: o.c, pts: o.pts, j: o.j, b: o.b, over: S.over });
      return true;
    }
    return false;
  }

  let YZ_MS = null, YZ_IDX = null, YZ_HO = null;
  const YZ_TR = new Map();

  function yzInit() {
    if (YZ_MS) return;
    YZ_MS = []; YZ_IDX = new Map();
    for (let a = 1; a <= 6; a++) for (let b = a; b <= 6; b++) for (let c = b; c <= 6; c++) for (let d = c; d <= 6; d++) for (let e = d; e <= 6; e++) {
      const dice = [a, b, c, d, e], cnt = yzCnt(dice).slice(1);
      YZ_IDX.set(cnt.join(''), YZ_MS.length); YZ_MS.push({ dice, cnt });
    }
    YZ_HO = YZ_MS.map(m => {
      const out = [];
      const rec = (i, cur, tot) => {
        if (i === 6) { if (tot < 5) out.push(cur.slice()); return; }
        for (let n = 0; n <= m.cnt[i]; n++) { cur[i] = n; rec(i + 1, cur, tot + n); }
        cur[i] = 0;
      };
      rec(0, [0, 0, 0, 0, 0, 0], 0);
      return out;
    });
  }

  function yzTrans(h) {
    const key = h.join('');
    let t = YZ_TR.get(key);
    if (t) return t;
    const r = 5 - h.reduce((a, b) => a + b, 0), idx = [], pr = [];
    const fact = [1, 1, 2, 6, 24, 120];
    const rec = (i, left, cur, w) => {
      if (i === 5) {
        const add = cur.concat([left]);
        const prob = fact[r] / (w * fact[left]) / Math.pow(6, r);
        idx.push(YZ_IDX.get(h.map((x, j) => x + add[j]).join(''))); pr.push(prob);
        return;
      }
      for (let n = 0; n <= left; n++) rec(i + 1, left - n, cur.concat([n]), w * fact[n]);
    };
    rec(0, r, [], 1);
    t = { idx, pr }; YZ_TR.set(key, t);
    return t;
  }

  function yzBonusP(delta, nOpen) {
    if (!nOpen) return delta >= 0 ? 1 : 0;
    return 1 / (1 + Math.exp(-1.7 * delta / (3.4 * Math.sqrt(nOpen) + .8)));
  }

  function yzBot(S, lvl, R = Math.random) {
    yzInit();
    const sh = S.sh[S.turn], left = 3 - S.rolls;
    let delta = 0, nOpen = 0;
    for (let c = 0; c < 6; c++) { if (sh.s[c] === null) nOpen++; else delta += sh.s[c] - 3 * (c + 1); }
    const pB = yzBonusP(delta, nOpen);
    const val = o => {
      let v = o.pts + (o.b ? 100 : 0);
      if (lvl === 'Easy') return v;
      v -= YZ_PAR[o.c];
      if (lvl === 'Hard' && o.c < 6) v += 35 * (yzBonusP(delta + o.pts - 3 * (o.c + 1), nOpen - 1) - pB);
      return v;
    };
    const best = ms => {
      let bo = null, bv = -1e9;
      for (const o of yzOptions(sh, ms.dice)) { const v = val(o); if (v > bv) { bv = v; bo = o; } }
      return { o: bo, v: bv };
    };
    const V = [new Float64Array(YZ_MS.length)];
    YZ_MS.forEach((m, i) => { V[0][i] = best(m).v; });
    const depth = lvl === 'Hard' ? left : Math.min(1, left);
    for (let k = 1; k < depth; k++) {
      const Vk = new Float64Array(YZ_MS.length), Vp = V[k - 1];
      for (let i = 0; i < YZ_MS.length; i++) {
        let bv = V[0][i];
        for (const h of YZ_HO[i]) { const t = yzTrans(h); let e = 0; for (let j = 0; j < t.idx.length; j++) e += t.pr[j] * Vp[t.idx[j]]; if (e > bv) bv = e; }
        Vk[i] = bv;
      }
      V.push(Vk);
    }
    const di = YZ_IDX.get(yzCnt(S.dice).slice(1).join(''));
    const stop = best(YZ_MS[di]);
    let bh = null, bv = -1e9;
    if (depth > 0) {
      const Vp = V[depth - 1], hs = YZ_HO[di];
      for (const h of hs) { const t = yzTrans(h); let e = 0; for (let j = 0; j < t.idx.length; j++) e += t.pr[j] * Vp[t.idx[j]]; if (e > bv) { bv = e; bh = h; } }
    }
    if (lvl !== 'Hard' && depth > 0 && R() < (lvl === 'Easy' ? .4 : .05)) bh = YZ_HO[di][rint(YZ_HO[di].length, R)], bv = 1e9;
    if (!bh || stop.v >= bv) {
      let c = stop.o.c;
      if (lvl !== 'Hard' && R() < (lvl === 'Easy' ? .3 : .05)) { const os = yzOptions(sh, S.dice); c = os[rint(os.length, R)].c; }
      return { stop: true, c, ev: stop.v };
    }
    const rem = bh.slice(), flags = S.dice.map(v => { if (rem[v - 1] > 0) { rem[v - 1]--; return true; } return false; });
    return { stop: false, hold: flags, ev: bv };
  }

  const m3 = {
    mul(a, b) {
      return [
        a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
        a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
        a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
      ];
    },
    ax(x, y, z, ang) {
      const c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
      return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
    },
    v(m, p) { return [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]]; }
  };

  const YZ_ID = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const YZ_UP = [
    null,
    YZ_ID,
    m3.ax(1, 0, 0, -Math.PI / 2),
    m3.ax(0, 1, 0, -Math.PI / 2),
    m3.ax(0, 1, 0, Math.PI / 2),
    m3.ax(1, 0, 0, Math.PI / 2),
    m3.ax(1, 0, 0, Math.PI)
  ];

  const YZ_FACES = [
    { v: 1, n: [0, 0, 1], u: [1, 0, 0], w: [0, 1, 0] },
    { v: 6, n: [0, 0, -1], u: [1, 0, 0], w: [0, -1, 0] },
    { v: 2, n: [0, -1, 0], u: [1, 0, 0], w: [0, 0, 1] },
    { v: 5, n: [0, 1, 0], u: [1, 0, 0], w: [0, 0, -1] },
    { v: 3, n: [1, 0, 0], u: [0, 1, 0], w: [0, 0, 1] },
    { v: 4, n: [-1, 0, 0], u: [0, 1, 0], w: [0, 0, -1] }
  ];

  const YZ_PIP = [
    [], [[0, 0]], [[-.5, -.5], [.5, .5]], [[-.5, -.5], [0, 0], [.5, .5]], [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]],
    [[-.5, -.5], [.5, -.5], [0, 0], [-.5, .5], [.5, .5]], [[-.5, -.5], [.5, -.5], [-.5, 0], [.5, 0], [-.5, .5], [.5, .5]]
  ];

  const YZ_LIGHT = (() => { const l = [-.38, -.5, .78], n = Math.hypot(l[0], l[1], l[2]); return l.map(x => x / n); })();

  function yzRest(v, yaw) { return m3.mul(m3.ax(0, 0, 1, yaw), YZ_UP[v]); }

  function yzDie(c, G, x, y, z, R, v, h, o) {
    const cp = G.cp, sp = G.sp;
    const P = (X, Y, Z) => [G.ox + X, G.oy - (Y * cp + Z * sp)];
    const lift = z * sp;
    const hs = h * (1 + Math.max(0, z - h) * .0022);
    const faces = [];
    for (const f of YZ_FACES) {
      const nw = m3.v(R, f.n);
      if (-nw[1] * sp + nw[2] * cp <= .02) continue;
      const U = m3.v(R, f.u), W = m3.v(R, f.w);
      const c0 = [x + nw[0] * hs, y + nw[1] * hs, z + nw[2] * hs];
      const pc = P(c0[0], c0[1], c0[2]), pu = P(c0[0] + U[0] * hs, c0[1] + U[1] * hs, c0[2] + U[2] * hs), pw = P(c0[0] + W[0] * hs, c0[1] + W[1] * hs, c0[2] + W[2] * hs);
      faces.push({ f, nw, pc, ux: pu[0] - pc[0], uy: pu[1] - pc[1], wx: pw[0] - pc[0], wy: pw[1] - pc[1] });
    }
    c.save();
    if (o.alpha != null) c.globalAlpha = o.alpha;
    const sc = P(x, y, 0), sr = hs * 1.22, sa = clamp(.34 - (z - h) * .0022, .08, .34);
    c.fillStyle = `rgba(0,0,0,${sa})`; c.beginPath(); c.ellipse(sc[0] + hs * .14 + (z - h) * .07, sc[1] + hs * .1, sr, sr * cp * .92, 0, 0, TAU); c.fill();
    if (o.ring) {
      c.strokeStyle = o.ring; c.lineWidth = Math.max(2, hs * .12); c.globalAlpha = (o.alpha == null ? 1 : o.alpha) * (o.ringA == null ? 1 : o.ringA);
      c.beginPath(); c.ellipse(sc[0], sc[1] + hs * .06, hs * 1.48, hs * 1.48 * cp, 0, 0, TAU); c.stroke();
      c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    }
    c.fillStyle = '#b7aa86'; c.strokeStyle = '#b7aa86'; c.lineJoin = 'round'; c.lineWidth = hs * .16;
    for (const q of faces) {
      c.beginPath();
      const k = .93;
      c.moveTo(q.pc[0] + (-q.ux - q.wx) * k, q.pc[1] + (-q.uy - q.wy) * k);
      c.lineTo(q.pc[0] + (q.ux - q.wx) * k, q.pc[1] + (q.uy - q.wy) * k);
      c.lineTo(q.pc[0] + (q.ux + q.wx) * k, q.pc[1] + (q.uy + q.wy) * k);
      c.lineTo(q.pc[0] + (-q.ux + q.wx) * k, q.pc[1] + (-q.uy + q.wy) * k);
      c.closePath(); c.fill(); c.stroke();
    }
    for (const q of faces) {
      const lit = Math.max(0, q.nw[0] * YZ_LIGHT[0] + q.nw[1] * YZ_LIGHT[1] + q.nw[2] * YZ_LIGHT[2]);
      c.save();
      c.transform(q.ux, q.uy, q.wx, q.wy, q.pc[0], q.pc[1]);
      c.beginPath(); c.roundRect(-.9, -.9, 1.8, 1.8, .26);
      const g = c.createLinearGradient(-.9, -.9, .9, .9);
      if (o.tint) { g.addColorStop(0, '#fff3c4'); g.addColorStop(1, '#f3d27a'); }
      else { g.addColorStop(0, '#fffef6'); g.addColorStop(1, '#efe6cb'); }
      c.fillStyle = g; c.fill();
      c.fillStyle = `rgba(70,45,10,${(1 - lit) * .42 + .03})`; c.fill();
      c.lineWidth = .05; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
      const pr = q.f.v === 1 ? .27 : .165, col = q.f.v === 1 ? '#c3281f' : '#17181c';
      for (const [px, py] of YZ_PIP[q.f.v]) {
        c.fillStyle = col; c.beginPath(); c.arc(px, py, pr, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.arc(px - pr * .3, py - pr * .3, pr * .4, 0, TAU); c.fill();
      }
      c.restore();
    }
    c.restore();
    return P(x, y, z);
  }

  function yzCup(c, x, y, rot, sc, glow) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
    if (glow > 0) {
      const g = c.createRadialGradient(0, -56, 10, 0, -56, 120);
      g.addColorStop(0, `rgba(255,214,90,${.5 * glow})`); g.addColorStop(1, 'rgba(255,214,90,0)');
      c.fillStyle = g; c.beginPath(); c.arc(0, -56, 120, 0, TAU); c.fill();
    }
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(5, 6, 46, 11, 0, 0, TAU); c.fill();
    const g = c.createLinearGradient(-50, 0, 50, 0);
    g.addColorStop(0, '#4e170d'); g.addColorStop(.3, '#b8472c'); g.addColorStop(.55, '#a43a22'); g.addColorStop(1, '#40130a');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-36, 0); c.bezierCurveTo(-39, -40, -45, -80, -50, -112); c.lineTo(50, -112); c.bezierCurveTo(45, -80, 39, -40, 36, 0);
    c.quadraticCurveTo(0, 20, -36, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,225,170,.5)'; c.lineWidth = 1.6; c.setLineDash([5, 4]);
    c.beginPath(); c.moveTo(-40, -22); c.quadraticCurveTo(0, -2, 40, -22); c.stroke();
    c.beginPath(); c.moveTo(-47, -92); c.quadraticCurveTo(0, -78, 47, -92); c.stroke();
    c.setLineDash([]);
    c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.moveTo(-26, -100); c.bezierCurveTo(-30, -70, -28, -40, -24, -14); c.lineTo(-16, -14); c.bezierCurveTo(-20, -40, -22, -70, -18, -100); c.fill();
    c.fillStyle = '#d6aa4f'; c.beginPath(); c.ellipse(0, -112, 53, 15, 0, 0, TAU); c.fill();
    c.fillStyle = '#1c0a06'; c.beginPath(); c.ellipse(0, -112, 46, 11.5, 0, 0, TAU); c.fill();
    c.fillStyle = '#4a1d12'; c.beginPath(); c.ellipse(0, -110, 40, 7, 0, 0, TAU); c.fill();
    c.restore();
  }

  const yzRules = `<div class="gx-rules">
<h4>Goal</h4><p>Score the most points over 13 rounds. Each round you fill exactly one box of your score sheet.</p>
<h4>Your turn</h4><p>Roll five dice up to three times. After the first and second roll tap the dice you want to keep, the others are rolled again. You may score after any roll, then pick one open box. If a roll fits nothing you must put a zero in a box.</p>
<h4>Upper section</h4><p>Aces to Sixes score the total of the matching dice. Reach 63 or more in the upper section (three of each number) for a 35 point bonus.</p>
<h4>Lower section</h4><p>Three of a Kind and Four of a Kind score the total of all dice. Full House (three and two) 25. Small Straight (four in a row) 30. Large Straight (five in a row) 40. YAHTZEE (five alike) 50. Chance scores the total of all dice.</p>
<h4>Yahtzee bonus and Joker</h4><p>Another YAHTZEE after you scored 50 in the YAHTZEE box earns 100 bonus points. It is also a Joker and must be placed: first in the matching upper box if open. Otherwise in any open lower box (Full House, Small and Large Straight then score their full value). With none open, put a zero in any open upper box. After a zero in the YAHTZEE box the Joker still applies but there is no bonus.</p>
<h4>Controls</h4><p>Tap the cup or <kbd>Space</kbd> to roll. Tap a die or press <kbd>1</kbd>-<kbd>5</kbd> to hold it. Tap a box on your sheet (or <kbd>&uarr;</kbd><kbd>&darr;</kbd>), then tap it again, press <kbd>Enter</kbd> or the Score button. <kbd>H</kbd> shows a hint.</p></div>`;

  const yzLogo = `<svg viewBox="0 0 220 74" width="180" height="61" style="display:block;margin:2px auto 6px"><g transform="translate(46 40) rotate(-14)"><rect x="-22" y="-22" width="44" height="44" rx="9" fill="#fffbe9" stroke="#b7aa86" stroke-width="3"/><g fill="#17181c"><circle cx="-10" cy="-10" r="4.6"/><circle cx="10" cy="-10" r="4.6"/><circle cx="-10" cy="0" r="4.6"/><circle cx="10" cy="0" r="4.6"/><circle cx="-10" cy="10" r="4.6"/><circle cx="10" cy="10" r="4.6"/></g></g><g transform="translate(110 36) rotate(8)"><rect x="-22" y="-22" width="44" height="44" rx="9" fill="#fffbe9" stroke="#b7aa86" stroke-width="3"/><circle cx="0" cy="0" r="7.5" fill="#c3281f"/></g><g transform="translate(174 40) rotate(-6)"><rect x="-22" y="-22" width="44" height="44" rx="9" fill="#fffbe9" stroke="#b7aa86" stroke-width="3"/><g fill="#17181c"><circle cx="-10" cy="-10" r="4.6"/><circle cx="10" cy="-10" r="4.6"/><circle cx="0" cy="0" r="4.6"/><circle cx="-10" cy="10" r="4.6"/><circle cx="10" cy="10" r="4.6"/></g></g></svg>`;

  const yzGeom = port => {
    const g = port ? {
      W: 430, H: 726, floor: { x0: 22, x1: 408, y0: 68, y1: 288 }, tray: { x: 8, y: 52, w: 414, h: 246 }, h: 21, railH: 64,
      cup: { x: 54, y: 372 }, cs: .62, shake: { x: 215, y: 214 }, sheet: { x: 8, y: 384, w: 414, h: 334 },
      roll: { x: 100, y: 314, w: 158, h: 58 }, score: { x: 266, y: 314, w: 156, h: 58 }, top: { x: 6, y: 6, w: 418, h: 42 }
    } : {
      W: 960, H: 640, floor: { x0: 30, x1: 494, y0: 92, y1: 428 }, tray: { x: 14, y: 56, w: 496, h: 388 }, h: 28, railH: 84,
      cup: { x: 86, y: 606 }, cs: 1, shake: { x: 262, y: 236 }, sheet: { x: 526, y: 12, w: 422, h: 616 },
      roll: { x: 160, y: 500, w: 176, h: 76 }, score: { x: 344, y: 500, w: 164, h: 76 }, top: { x: 8, y: 8, w: 504, h: 44 }
    };
    g.sp = Math.sin(.42); g.cp = Math.cos(.42);
    const f = g.floor;
    g.ox = (f.x0 + f.x1) / 2; g.oy = (f.y0 + f.y1) / 2; g.wh = (f.x1 - f.x0) / 2; g.dh = (f.y1 - f.y0) / 2 / g.cp;
    g.yr = -g.dh + g.railH / 2 / g.cp;
    g.zy0 = -g.dh + (g.railH + 8) / g.cp;
    g.slot = i => -g.wh + (i + .5) * (2 * g.wh / 5);
    return g;
  };

  Ameplay.register({
    id: 'yahtzee',
    title: 'Yahtzee',
    category: 'Board',
    tint: '#c8342a',
    blurb: 'The classic dice game: shake the cup, hold your keepers, fill the official score sheet. Joker rules, smart bots, 1 to 6 players, and online play.',
    help: 'Tap the cup or <kbd>Space</kbd> to roll · tap dice (or <kbd>1</kbd>-<kbd>5</kbd>) to hold · tap a box twice or <kbd>Enter</kbd> to score · <kbd>H</kbd> hint',
    better: 'high',
    format: v => v + ' pts',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="26" width="24" height="24" rx="5" transform="rotate(-10 20 38)"/><rect x="34" y="12" width="22" height="22" rx="5" transform="rotate(12 45 23)"/><circle cx="14" cy="32" r="1.8" fill="currentColor"/><circle cx="26" cy="32" r="1.8" fill="currentColor"/><circle cx="20" cy="38" r="1.8" fill="currentColor"/><circle cx="14" cy="44" r="1.8" fill="currentColor"/><circle cx="26" cy="44" r="1.8" fill="currentColor"/><circle cx="45" cy="23" r="2.2" fill="currentColor"/></svg>',
    css: baseCss('yahtzee', '#f4c542') + `
.gm-yahtzee .yz-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(30,12,4,.4);touch-action:manipulation;background:#4b2d18;--u:1px}
.gm-yahtzee .yz-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-yahtzee .yz-wrap .gx-box{background:linear-gradient(#4a2f1d,#2a190e);border-color:rgba(255,255,255,.18)}
.gm-yahtzee .gx-stat{font-size:calc(var(--u)*15);line-height:1.2}
.gm-yahtzee .yz-btn{position:absolute;pointer-events:auto;border:0;border-radius:calc(var(--u)*16);font:900 calc(var(--u)*24)/1.05 var(--sans);color:#1b130a;background:linear-gradient(#ffd75a,#f0a91f);box-shadow:inset 0 calc(var(--u)*-5) 0 rgba(0,0,0,.2),0 calc(var(--u)*6) calc(var(--u)*14) rgba(0,0,0,.35);transition:transform .12s,filter .2s,opacity .2s;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 calc(var(--u)*6)}
.gm-yahtzee .yz-btn small{font:800 calc(var(--u)*13) var(--sans);opacity:.75;margin-top:calc(var(--u)*2)}
.gm-yahtzee .yz-btn:hover{filter:brightness(1.08)}
.gm-yahtzee .yz-btn:active{transform:translateY(calc(var(--u)*2))}
.gm-yahtzee .yz-btn.go{background:linear-gradient(#7be08a,#2f9d49);color:#0c2a14}
.gm-yahtzee .yz-btn.zero{background:linear-gradient(#ff9a8a,#d4412e);color:#fff}
.gm-yahtzee .yz-btn[hidden]{display:none}
.gm-yahtzee .yz-btn:disabled{opacity:.35;pointer-events:none;filter:grayscale(.5)}
.gm-yahtzee .gx-net{right:auto;left:8px}
.gm-yahtzee .yz-sheet{position:absolute;pointer-events:auto;background:#fbf5e4;border-radius:calc(var(--u)*12);box-shadow:0 calc(var(--u)*6) calc(var(--u)*18) rgba(0,0,0,.45),inset 0 0 0 calc(var(--u)*3) #c8342a;overflow:hidden;color:#2a2218;font-family:var(--sans);padding:calc(var(--u)*5)}
.gm-yahtzee .yz-sheet table{width:100%;height:100%;border-collapse:collapse;table-layout:fixed}
.gm-yahtzee .yz-sheet td,.gm-yahtzee .yz-sheet th{padding:0 calc(var(--u)*2);text-align:center;font:800 calc(var(--u)*13)/1 var(--sans);border-bottom:calc(var(--u)*1) solid rgba(90,60,20,.22);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.gm-yahtzee .yz-sheet .lab{width:32%;text-align:left;padding-left:calc(var(--u)*6);font-weight:900;color:#3a2b14}
.gm-yahtzee .yz-sheet .lab small{font:700 calc(var(--u)*10) var(--sans);color:#9a8a68;margin-left:calc(var(--u)*5)}
.gm-yahtzee .yz-sheet th{font:900 calc(var(--u)*12) var(--sans);color:#3a2b14;border-bottom:calc(var(--u)*2) solid #c8342a}
.gm-yahtzee .yz-sheet th.lab{color:#c8342a;font-size:calc(var(--u)*17);letter-spacing:.5px}
.gm-yahtzee .yz-sheet th i{display:inline-block;width:calc(var(--u)*9);height:calc(var(--u)*9);border-radius:50%;margin-right:calc(var(--u)*4);border:calc(var(--u)*1.5) solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25);vertical-align:calc(var(--u)*-1)}
.gm-yahtzee .yz-sheet tr.sum td,.gm-yahtzee .yz-sheet tr.sum th{background:#efe4c4;font-weight:900}
.gm-yahtzee .yz-sheet tr.sum .lab{color:#6a5430}
.gm-yahtzee .yz-sheet tr.tot td,.gm-yahtzee .yz-sheet tr.tot th{background:#3a2b14;color:#ffe58a;font-size:calc(var(--u)*15);border-bottom:0}
.gm-yahtzee .yz-sheet tr.tot .lab{color:#ffe58a;font-size:calc(var(--u)*13)}
.gm-yahtzee .yz-sheet tr.gap td{border-bottom:calc(var(--u)*2) solid #c8342a}
.gm-yahtzee .yz-sheet td.me,.gm-yahtzee .yz-sheet th.me{background-image:linear-gradient(rgba(200,52,42,.07),rgba(200,52,42,.07))}
.gm-yahtzee .yz-sheet td.cur,.gm-yahtzee .yz-sheet th.cur{background-color:#fff0b8}
.gm-yahtzee .yz-sheet tr.sum td.cur,.gm-yahtzee .yz-sheet tr.tot td.cur{filter:brightness(1.1)}
.gm-yahtzee .yz-sheet td.pv{color:#9b8f77;font-style:italic;font-weight:700}
.gm-yahtzee .yz-sheet td.ok{cursor:pointer;color:#2a7a3b;font-style:normal;font-weight:900;background:rgba(80,190,100,.14)}
.gm-yahtzee .yz-sheet td.ok.zero{color:#b3392b;background:rgba(220,90,70,.1)}
.gm-yahtzee .yz-sheet td.ok:hover{background:rgba(80,190,100,.34)}
.gm-yahtzee .yz-sheet td.ok.zero:hover{background:rgba(220,90,70,.28)}
.gm-yahtzee .yz-sheet td.sel{background:#4caf5c!important;color:#fff!important;font-style:normal;box-shadow:inset 0 0 0 calc(var(--u)*2) #1f7a32}
.gm-yahtzee .yz-sheet td.sel.zero{background:#d4412e!important;box-shadow:inset 0 0 0 calc(var(--u)*2) #8f2416}
.gm-yahtzee .yz-sheet td.flash{animation:yz-fl 1.3s ease-out}
.gm-yahtzee .yz-sheet td.dim{color:#bbb09a}
.gm-yahtzee .yz-sheet td.hint{box-shadow:inset 0 0 0 calc(var(--u)*2.5) #4a8fe8}
@keyframes yz-fl{0%{background:#ffd75a;transform:scale(1.12)}100%{transform:none}}
.gm-yahtzee .yz-wrap.yz-port .gx-opt>span{flex:none}
.gm-yahtzee .yz-port .yz-sheet td{font-size:calc(var(--u)*15.5)}
.gm-yahtzee .yz-port .yz-sheet th{font-size:calc(var(--u)*13)}
.gm-yahtzee .yz-port .yz-sheet th.lab{font-size:calc(var(--u)*19)}
.gm-yahtzee .yz-port .yz-sheet th i{width:calc(var(--u)*8);height:calc(var(--u)*8);margin-right:calc(var(--u)*3)}
.gm-yahtzee .yz-port .yz-sheet .lab small{display:none}
.gm-yahtzee .yz-port .yz-sheet tr.tot td{font-size:calc(var(--u)*17)}
.gm-yahtzee .yz-port .yz-sheet tr.tot .lab{font-size:calc(var(--u)*15)}
`,
    mount(root, api) {
      const opt = Object.assign({ n: 2, diff: 'Normal', fast: false, prev: true, best: 0 }, api.load() || {});
      if (!['Easy', 'Normal', 'Hard'].includes(opt.diff)) opt.diff = 'Normal';
      const save = () => api.save(opt);
      const au = audioKit(api);
      const wrap = document.createElement('div'); wrap.className = 'gx-wrap yz-wrap';
      const cv = document.createElement('canvas');
      const ui = document.createElement('div'); ui.className = 'gx-ui';
      ui.innerHTML = `<div class="gx-top"><button class="gx-ico" data-u="menu" aria-label="Menu" hidden>${ICON.menu}</button><div class="gx-stat"></div><button class="gx-ico" data-u="hint" aria-label="Hint" hidden>${ICON.hint}</button><button class="gx-ico" data-u="help" aria-label="Rules">${ICON.help}</button></div><div class="yz-sheet" hidden></div><button class="yz-btn" data-u="roll" hidden></button><button class="yz-btn go" data-u="score" hidden></button><div class="gx-net" hidden><i></i><span>Online</span></div>`;
      wrap.append(cv, ui); root.append(wrap);
      const ctx = cv.getContext('2d');
      const pane = Pane(ui);
      const q = s => ui.querySelector(s);
      const bMenu = q('[data-u=menu]'), bHint = q('[data-u=hint]'), bHelp = q('[data-u=help]'), bRoll = q('[data-u=roll]'), bScore = q('[data-u=score]'), sheetEl = q('.yz-sheet'), statEl = q('.gx-stat'), netEl = q('.gx-net');

      let PORT = null, G = null, W = 960, H = 640, DPR = 1, bgC = null, scene = 'title', S = null, V = null, viewer = 0, busy = 0, uScale = 0;
      const M = { mode: 'cpu', role: 'local', n: 1, names: [], human: [], pids: [], players: [], bots: false, size: 2, tok: 0, hooked: false, bstage: 0, botAt: 0, plan: null, awaiting: 0 };
      const Q = [], fxs = [], die = [], U = { sel: -1, hover: -1, hint: null, hintDice: null, flash: null, banner: null, key: '' };
      let roll = null, cupSt = { x: 0, y: 0, rot: 0, sc: 1 }, overT = 0;
      const K = () => opt.fast ? .62 : 1;

      const nameOf = p => p === viewer ? 'You' : (M.names[p] || 'Player ' + (p + 1));
      const fullName = p => M.names[p] || 'Player ' + (p + 1);
      const toWorld = (sx, sy, z) => ({ x: sx - G.ox, y: ((G.oy - sy) - z * G.sp) / G.cp });
      const proj = (x, y, z) => [G.ox + x, G.oy - (y * G.cp + z * G.sp)];

      function mkDie() { return { v: 1, x: 0, y: 0, yaw: 0, st: 'hid', fl: null, mv: null, held: false, a: 0, R: null }; }
      for (let i = 0; i < 5; i++) die.push(mkDie());

      function buildBg() {
        bgC = document.createElement('canvas'); bgC.width = Math.round(W * DPR); bgC.height = Math.round(H * DPR);
        const c = bgC.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
        const wd = c.createLinearGradient(0, 0, W, H); wd.addColorStop(0, '#6a4326'); wd.addColorStop(.5, '#4a2d18'); wd.addColorStop(1, '#69421f');
        c.fillStyle = wd; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 110; i++) { c.strokeStyle = `rgba(${i % 2 ? '255,215,160' : '25,10,2'},${.03 + Math.random() * .05})`; c.lineWidth = 1 + Math.random() * 2; const y = Math.random() * H; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * .3, y + 12 * Math.random(), W * .6, y - 12 * Math.random(), W, y + 6); c.stroke(); }
        const t = G.tray, f = G.floor;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(t.x + 4, t.y + 8, t.w, t.h, 22); c.fill();
        const fr = c.createLinearGradient(t.x, t.y, t.x, t.y + t.h); fr.addColorStop(0, '#8a5a32'); fr.addColorStop(.5, '#6b4223'); fr.addColorStop(1, '#4c2d16');
        c.fillStyle = fr; c.beginPath(); c.roundRect(t.x, t.y, t.w, t.h, 22); c.fill();
        c.strokeStyle = 'rgba(255,225,170,.28)'; c.lineWidth = 2; c.beginPath(); c.roundRect(t.x + 2, t.y + 2, t.w - 4, t.h - 4, 20); c.stroke();
        const wallH = 22;
        const bw = c.createLinearGradient(0, f.y0 - wallH, 0, f.y0); bw.addColorStop(0, '#3c2312'); bw.addColorStop(1, '#5b3a1f');
        c.fillStyle = bw; c.beginPath(); c.moveTo(f.x0 - 8, f.y0 - wallH); c.lineTo(f.x1 + 8, f.y0 - wallH); c.lineTo(f.x1, f.y0); c.lineTo(f.x0, f.y0); c.closePath(); c.fill();
        const fg = c.createRadialGradient((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, 20, (f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, (f.x1 - f.x0) * .62);
        fg.addColorStop(0, '#2f8a58'); fg.addColorStop(.7, '#1c6a3f'); fg.addColorStop(1, '#0e472a');
        c.save(); c.beginPath(); c.rect(f.x0, f.y0, f.x1 - f.x0, f.y1 - f.y0); c.clip();
        c.fillStyle = fg; c.fillRect(f.x0, f.y0, f.x1 - f.x0, f.y1 - f.y0);
        for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .05})`; c.fillRect(f.x0 + Math.random() * (f.x1 - f.x0), f.y0 + Math.random() * (f.y1 - f.y0), 1.3, 1.3); }
        const sh = c.createLinearGradient(0, f.y0, 0, f.y0 + 26); sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = sh; c.fillRect(f.x0, f.y0, f.x1 - f.x0, 26);
        const sl = c.createLinearGradient(f.x0, 0, f.x0 + 22, 0); sl.addColorStop(0, 'rgba(0,0,0,.35)'); sl.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = sl; c.fillRect(f.x0, f.y0, 22, f.y1 - f.y0);
        const sr = c.createLinearGradient(f.x1, 0, f.x1 - 22, 0); sr.addColorStop(0, 'rgba(0,0,0,.35)'); sr.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = sr; c.fillRect(f.x1 - 22, f.y0, 22, f.y1 - f.y0);
        const ry = f.y1 - G.railH;
        c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(f.x0, ry, f.x1 - f.x0, G.railH);
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(f.x0, ry, f.x1 - f.x0, 2);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(f.x0, ry + 2, f.x1 - f.x0, 3);
        c.restore();
        c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 3; c.strokeRect(f.x0, f.y0, f.x1 - f.x0, f.y1 - f.y0);
        for (let i = 0; i < 5; i++) {
          const p = proj(G.slot(i), G.yr, 0), sz = G.h * 1.22;
          c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 2; c.setLineDash([5, 5]);
          c.beginPath(); c.roundRect(p[0] - sz, p[1] - sz * G.cp - 1, sz * 2, sz * 2 * G.cp + 2, 8); c.stroke(); c.setLineDash([]);
        }
        c.fillStyle = 'rgba(255,255,255,.3)'; c.font = `900 ${PORT ? 10 : 12}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('HELD DICE', (f.x0 + f.x1) / 2, f.y1 - 8);
      }

      function place(el, r) {
        el.style.left = (r.x / W * 100) + '%'; el.style.top = (r.y / H * 100) + '%'; el.style.width = (r.w / W * 100) + '%'; el.style.height = (r.h / H * 100) + '%';
      }

      function fit(force) {
        const port = (root.clientWidth || 800) < 620;
        if (!force && port === PORT) return;
        PORT = port; G = yzGeom(port); W = G.W; H = G.H;
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        wrap.classList.toggle('yz-port', port);
        const top = q('.gx-top'); top.style.top = (G.top.y / H * 100) + '%'; top.style.height = (G.top.h / H * 100) + '%';
        top.style.left = (G.top.x / W * 100) + '%'; top.style.width = (G.top.w / W * 100) + '%'; top.style.right = 'auto';
        place(sheetEl, G.sheet); place(bRoll, G.roll); place(bScore, G.score);
        buildBg(); uScale = 0; U.key = '';
        cupSt = { x: G.cup.x, y: G.cup.y, rot: 0, sc: G.cs };
        if (V && scene === 'game') syncDice();
      }
      api.on(window, 'resize', () => fit(false));
      const loc = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };

      const dieSpots = (cnt, keep) => {
        const out = [], h = G.h, x0 = -G.wh + 1.7 * h, x1 = G.wh - 1.7 * h, y0 = G.zy0 + 1.35 * h, y1 = G.dh - 1.7 * h;
        const all = keep.slice();
        for (let n = 0; n < cnt; n++) {
          let best = null, bd = -1;
          for (let t = 0; t < 60; t++) {
            const p = { x: lerp(x0, x1, Math.random()), y: lerp(y0, y1, Math.random()) };
            let md = 1e9; for (const o of all) md = Math.min(md, Math.hypot(o.x - p.x, (o.y - p.y) * 1.05));
            if (md > bd) { bd = md; best = p; }
            if (md > 2.7 * h) break;
          }
          all.push(best); out.push(best);
        }
        return out;
      };
      const restSpots = () => die.filter(d => d.st !== 'hid' && !d.held).map(d => ({ x: d.mv ? d.mv.x1 : d.x, y: d.mv ? d.mv.y1 : d.y }));

      function syncDice() {
        Q.length = 0; roll = null; busy = 0;
        const v = V; if (!v) return;
        const vis = v.rolls > 0, free = [];
        for (let i = 0; i < 5; i++) {
          const d = die[i]; d.fl = null; d.mv = null; d.held = !!v.held[i]; d.v = v.dice[i];
          if (!vis) { d.st = 'hid'; continue; }
          d.st = 'rest';
          if (d.held) { d.x = G.slot(i); d.y = G.yr; d.yaw = 0; } else free.push(i);
        }
        const sp = dieSpots(free.length, []);
        free.forEach((i, k) => { die[i].x = sp[k].x; die[i].y = sp[k].y; die[i].yaw = (Math.random() - .5) * 1.6; });
      }

      function resetV() { V = S; }

      function startRoll(e) {
        const k = K(), t0 = now();
        const idx = e.idx.slice();
        roll = { t0, k, idx, done: false, thrown: 0, vals: e.vals.slice(), by: e.by };
        const sp = dieSpots(idx.length, []);
        idx.forEach((i, n) => {
          const d = die[i]; d.st = 'hid'; d.held = false; d.mv = null; d.v = e.vals[i];
          const T = (950 + Math.random() * 120) * k, rel = (790 + n * 38) * k;
          const z0 = 62 + Math.random() * 40, ee = .42 + Math.random() * .12;
          const g = 1800 / (k * k), arcs = [];
          let tt = 0;
          const fall = Math.sqrt(2 * z0 / g) * 1000;
          arcs.push({ a: 0, b: fall, fall: 1, H: z0 }); tt = fall;
          let hh = z0 * ee * ee;
          while (hh > 1.2 && tt < T - 40) { const dd = 2 * Math.sqrt(2 * hh / g) * 1000; arcs.push({ a: tt, b: tt + dd, H: hh }); tt += dd; hh *= ee * ee; }
          const ax = Math.random() * 2 - 1, ay = Math.random() * 2 - 1, az = Math.random() * 1.4 - .7, nn = Math.hypot(ax, ay, az) || 1;
          d.fl = { rel, T, z0, arcs, ax: ax / nn, ay: ay / nn, az: az / nn, A0: (7 + Math.random() * 5) * (Math.random() < .5 ? -1 : 1), tx: sp[n].x, ty: sp[n].y, yaw: (Math.random() - .5) * 1.7, hits: arcs.slice(1).map(a => ({ t: a.a, v: clamp(a.H / 30, .25, 1), done: false })), x0: 0, y0: 0, started: false };
        });
        busy = t0 + (790 + (idx.length - 1) * 38 + 1060) * k + 80;
        au.rattle(7);
      }

      function mouthPos(tr) {
        const c = cupAt(tr), s = c.sc;
        return { x: c.x + 112 * Math.sin(c.rot) * s, y: c.y - 112 * Math.cos(c.rot) * s };
      }

      function cupAt(tr) {
        const k = roll ? roll.k : 1, t = tr / k, hm = G.cup, sh = G.shake, cs = G.cs, big = cs * (PORT ? 1.15 : 1.05);
        let x = hm.x, y = hm.y, rot = 0, sc = cs;
        if (t < 220) { const p = easeIO(t / 220); x = lerp(hm.x, sh.x, p); y = lerp(hm.y, sh.y, p); sc = lerp(cs, big, p); }
        else if (t < 620) { x = sh.x + Math.sin(t * .05) * 7; y = sh.y + Math.cos(t * .063) * 5; rot = Math.sin(t * .045) * .1; sc = big; }
        else if (t < 860) { const p = easeIO((t - 620) / 240); x = sh.x; y = sh.y; rot = p * 2.0; sc = big; }
        else if (t < 1010) { x = sh.x; y = sh.y; rot = 2.0 + Math.sin((t - 860) * .06) * .05; sc = big; }
        else if (t < 1330) { const p = easeIO((t - 1010) / 320); x = lerp(sh.x, hm.x, p); y = lerp(sh.y, hm.y, p); rot = 2.0 * (1 - p); sc = lerp(big, cs, p); }
        return { x, y, rot, sc };
      }

      function updateDice(tm) {
        for (let i = 0; i < 5; i++) {
          const d = die[i], f = d.fl;
          if (d.st === 'hid' && f && roll) {
            const tr = tm - roll.t0;
            if (tr >= f.rel) {
              const mp = mouthPos(f.rel), w = toWorld(mp.x + (Math.random() - .5) * 18, mp.y + (Math.random() - .5) * 10, f.z0);
              f.x0 = w.x; f.y0 = w.y; f.t0 = roll.t0 + f.rel; d.st = 'fly'; d.x = w.x; d.y = w.y;
              au.die(.5);
            }
          }
          if (d.st === 'fly') {
            const el = tm - f.t0, s = clamp(el / f.T, 0, 1), hp = 1 - Math.pow(1 - s, 2.2);
            d.x = lerp(f.x0, f.tx, hp); d.y = lerp(f.y0, f.ty, hp);
            for (const h of f.hits) if (!h.done && el >= h.t) { h.done = true; au.die(h.v); }
            if (el >= f.T) { d.st = 'rest'; d.x = f.tx; d.y = f.ty; d.yaw = f.yaw; d.fl = null; }
          } else if (d.st === 'mv') {
            const m = d.mv, s = clamp((tm - m.t0) / m.d, 0, 1), p = easeIO(s);
            d.x = lerp(m.x0, m.x1, p); d.y = lerp(m.y0, m.y1, p); d.yaw = lerp(m.yaw0, m.yaw1, p);
            if (s >= 1) { d.st = 'rest'; d.mv = null; }
          } else if (d.st === 'out' && tm - d.a > 460 * K()) { d.st = 'hid'; }
        }
        if (roll && !roll.done && die.every((d, i) => !roll.idx.includes(i) || d.st === 'rest')) { roll.done = true; afterRoll(); }
        if (roll && roll.done && tm - roll.t0 > 1400 * roll.k) roll = null;
      }

      function afterRoll() {
        const v = roll.vals;
        if (v.every(x => x === v[0])) {
          au.win(); U.banner = { t0: now(), text: 'YAHTZEE!' };
          const f = G.floor;
          for (let i = 0; i < 46; i++) fxs.push({ x: G.ox, y: G.oy - 30, vx: (Math.random() - .5) * 420, vy: -120 - Math.random() * 300, c: ['#ffd75a', '#ff6a5a', '#49c9bd', '#9d8cff', '#fff'][i % 5], r: 3 + Math.random() * 3, t0: now(), life: 1400 + Math.random() * 600 });
        }
        U.key = '';
      }

      function dieDims(d, tm) {
        const h = G.h;
        if (d.st === 'rest') return { x: d.x, y: d.y, z: h, R: yzRest(d.v, d.yaw), h };
        if (d.st === 'mv') { const s = clamp((tm - d.mv.t0) / d.mv.d, 0, 1); return { x: d.x, y: d.y, z: h + Math.sin(s * Math.PI) * h * .9, R: yzRest(d.v, d.yaw), h }; }
        if (d.st === 'fly') {
          const f = d.fl, el = tm - f.t0, s = clamp(el / f.T, 0, 1);
          const A = f.A0 * Math.pow(1 - s, 2), R = m3.mul(m3.ax(f.ax, f.ay, f.az, A), yzRest(d.v, f.yaw));
          const ext = h * (Math.abs(R[6]) + Math.abs(R[7]) + Math.abs(R[8]));
          let up = 0;
          for (const a of f.arcs) { if (el < a.b) { const u = clamp((el - a.a) / (a.b - a.a), 0, 1); up = a.fall ? a.H * (1 - u * u) : 4 * a.H * u * (1 - u); break; } }
          return { x: d.x, y: d.y, z: ext + up, R, h };
        }
        if (d.st === 'out') {
          const s = clamp((tm - d.a) / (460 * K()), 0, 1), p = easeIO(s), c = toWorld(G.cup.x, G.cup.y - 40 * G.cs, 0);
          return { x: lerp(d.x, c.x, p), y: lerp(d.y, c.y, p), z: h + Math.sin(s * Math.PI) * 24, R: yzRest(d.v, d.yaw), h: h * (1 - .55 * p), alpha: 1 - Math.pow(p, 2) };
        }
        return null;
      }

      function runFx(e) {
        const k = K(), t = now();
        if (e.k === 'roll') { U.sel = -1; U.hint = null; U.hintDice = null; startRoll(e); }
        else if (e.k === 'hold') {
          const mv = [];
          e.held.forEach((hd, i) => { if (hd !== die[i].held) mv.push(i); });
          const free = restSpots();
          const sp = dieSpots(mv.filter(i => !e.held[i]).length, free);
          let n = 0;
          for (const i of mv) {
            const d = die[i], to = e.held[i] ? { x: G.slot(i), y: G.yr, yaw: 0 } : Object.assign({}, sp[n++], { yaw: (Math.random() - .5) * 1.4 });
            d.held = e.held[i]; d.st = 'mv'; d.mv = { t0: t, d: 300 * k, x0: d.x, y0: d.y, x1: to.x, y1: to.y, yaw0: d.yaw, yaw1: to.yaw };
            au.pop();
          }
          busy = t + (mv.length ? 300 * k : 0);
          U.hintDice = null; U.key = '';
        } else if (e.k === 'score') {
          U.sel = -1; U.hint = null; U.hintDice = null; U.flash = { p: e.p, c: e.c, t };
          die.forEach(d => { if (d.st !== 'hid') { d.st = 'out'; d.a = t; d.held = false; d.fl = null; d.mv = null; } });
          if (e.pts >= 40 || e.b) au.win(); else au.score(e.pts > 0 ? 2 : 1);
          if (e.pts === 0 && !e.b) au.bad();
          if (e.b) U.banner = { t0: t, text: 'BONUS +100' };
          busy = t + 520 * k; U.key = '';
          if (e.over) overT = t + 900;
        }
        statusUpdate();
      }

      function pump() {
        while (Q.length && now() >= busy) runFx(Q.shift());
      }

      function commit(fx) {
        for (const e of fx) Q.push(e);
        if (M.mode === 'online' && M.role === 'host') { api.net.send({ t: 'st', s: S, fx }); if (S.over) svDel('yahtzee'); else svPut('yahtzee', api.net.code, { S, names: M.names, human: M.human }); }
        U.key = '';
      }

      function doEngine(p, a) {
        if (!S || S.over || S.turn !== p) return false;
        const fx = [];
        if (!yzApply(S, a, Math.random, fx)) return false;
        commit(fx);
        return true;
      }

      function act(a) {
        if (M.role === 'guest') { api.net.send({ t: 'act', a }); M.awaiting = now(); return; }
        doEngine(viewer, a);
      }

      const settled = () => !Q.length && now() >= busy && (!roll || roll.done);
      const myTurn = () => scene === 'game' && V && !V.over && V.turn === viewer && M.human[viewer];
      const canAct = () => myTurn() && settled() && !pane.open && !api.paused && !(M.role === 'guest' && M.awaiting && now() - M.awaiting < 600);
      const canRoll = () => canAct() && V.rolls < 3;
      const myOpts = () => (V && myTurn() && V.rolls > 0 && settled()) ? yzOptions(V.sh[viewer], V.dice) : [];

      function doRoll() { if (canRoll()) { au.tick(); act({ k: 'roll' }); } }
      function doHold(i) {
        if (!canAct() || V.rolls < 1 || V.rolls > 2 || die[i].st !== 'rest') return;
        act({ k: 'hold', i });
      }
      function doScore() {
        if (!canAct() || U.sel < 0) return;
        const o = myOpts().find(x => x.c === U.sel); if (!o) return;
        act({ k: 'score', c: o.c });
      }

      function statusUpdate() {
        let t = '';
        if (scene === 'game' && V) {
          const p = V.turn;
          if (V.over) t = 'Game over';
          else if (roll || Q.length || now() < busy) t = p === viewer ? 'Rolling…' : `${fullName(p)} rolls…`;
          else if (p === viewer) {
            const dice = V.dice, yzr = V.rolls > 0 && dice.every(x => x === dice[0]);
            if (V.rolls === 0) t = V.round === 1 && V.n === 1 ? 'Roll the dice' : `Round ${V.round} of 13 · your turn`;
            else if (yzr && V.sh[p].s[11] !== null) t = 'Joker! Pick where to score';
            else if (V.rolls < 3) t = `Roll ${V.rolls} of 3 · hold dice or score`;
            else t = 'Pick a box to score';
          } else t = `${fullName(p)}${M.human[p] ? '' : ''} · round ${V.round} of 13`;
        }
        statEl.textContent = t;
      }

      function hud() {
        const inGame = scene === 'game';
        bMenu.hidden = !inGame;
        bHint.hidden = !(inGame && M.mode !== 'online');
        netEl.hidden = !(inGame && M.mode === 'online');
        sheetEl.hidden = !inGame; if (!inGame) { bRoll.hidden = true; bScore.hidden = true; }
        statusUpdate();
      }

      function sheetHtml() {
        const v = V, n = v.n, tots = v.sh.map(yzTot), opts = myOpts(), cur = v.turn;
        const compact = n >= 5 || (PORT && n >= 4);
        const nm = p => { const s = p === viewer ? 'You' : fullName(p).replace(/ \(bot\)$/, ''); return E(compact ? s.slice(0, 5) : s.slice(0, 8)); };
        const pcls = (p, extra) => `${p === viewer ? 'me ' : ''}${p === cur && !v.over ? 'cur ' : ''}${extra || ''}`;
        let h = '<table><colgroup><col style="width:32%">' + `<col span="${n}" style="width:${68 / n}%">` + '</colgroup><tr><th class="lab">YAHTZEE</th>';
        for (let p = 0; p < n; p++) h += `<th class="${pcls(p)}"><i style="background:${SEAT[p % 6]}"></i>${nm(p)}</th>`;
        h += '</tr>';
        const cell = (p, c) => {
          const sc = v.sh[p].s[c];
          const fl = U.flash && U.flash.p === p && U.flash.c === c && now() - U.flash.t < 1200 ? ' flash' : '';
          if (sc !== null) return `<td class="${pcls(p)}${fl}">${sc}</td>`;
          if (p === viewer && p === cur) {
            const o = opts.find(x => x.c === c);
            if (o) {
              const sel = U.sel === c, z = o.pts === 0 && !o.b ? ' zero' : '', hint = U.hint === c ? ' hint' : '';
              return `<td class="${pcls(p)}ok${z}${sel ? ' sel' : ''}${hint}" data-c="${c}">${opt.prev ? o.pts : ''}</td>`;
            }
            if (opts.length) return `<td class="${pcls(p)}dim"></td>`;
          }
          return `<td class="${pcls(p)}"></td>`;
        };
        const catRow = c => { let r = `<tr${c === 5 ? ' class="gap"' : ''}><td class="lab" title="${YZ_HINT[c]}">${YZ_SHORT[c]}</td>`; for (let p = 0; p < n; p++) r += cell(p, c); return r + '</tr>'; };
        for (let c = 0; c < 6; c++) h += catRow(c);
        h += '<tr class="sum"><td class="lab">Upper total</td>' + tots.map((t, p) => `<td class="${pcls(p)}">${t.up || (v.sh[p].s.slice(0, 6).some(x => x !== null) ? 0 : '')}</td>`).join('') + '</tr>';
        h += '<tr class="sum gap"><td class="lab">Bonus<small>63+ = 35</small></td>' + tots.map((t, p) => {
          const filled = v.sh[p].s.slice(0, 6).some(x => x !== null);
          const s = t.bonus ? '+35' : t.dead ? '0' : filled ? '-' + t.need : '';
          return `<td class="${pcls(p)}"${t.bonus ? ' style="color:#1f7a32"' : t.dead ? ' style="color:#b3392b"' : ' style="color:#8a7a58"'}>${s}</td>`;
        }).join('') + '</tr>';
        for (let c = 6; c < 13; c++) h += catRow(c);
        h += '<tr class="sum"><td class="lab">Yahtzee bonus<small>x100</small></td>' + tots.map((t, p) => `<td class="${pcls(p)}">${t.yb ? '+' + t.yb : ''}</td>`).join('') + '</tr>';
        h += '<tr class="tot"><td class="lab">TOTAL</td>' + tots.map((t, p) => `<td class="${pcls(p)}">${t.total}</td>`).join('') + '</tr></table>';
        return h;
      }

      function renderSheet() {
        if (!V || scene !== 'game') return;
        sheetEl.innerHTML = sheetHtml();
        const tot = yzTot(V.sh[viewer]).total;
        if (M.lastTot !== tot) { M.lastTot = tot; api.score(tot); }
      }

      function renderButtons() {
        const cr = canRoll(), mine = myTurn() && settled() && !pane.open;
        const rl = V ? 3 - V.rolls : 0;
        bRoll.hidden = !(scene === 'game' && V && !V.over && mine && V.rolls < 3);
        if (!bRoll.hidden) bRoll.innerHTML = `Roll<small>${rl} left</small>`;
        bRoll.disabled = !cr;
        const o = U.sel >= 0 ? myOpts().find(x => x.c === U.sel) : null;
        bScore.hidden = !(o && mine);
        if (o) { bScore.innerHTML = `Score ${opt.prev ? o.pts : ''}<small>${YZ_SHORT[o.c]}</small>`; bScore.classList.toggle('zero', o.pts === 0 && !o.b); bScore.classList.toggle('go', !(o.pts === 0 && !o.b)); }
      }

      function refreshUi() {
        const key = [scene, V && V.turn, V && V.rolls, V && V.round, V && V.over, U.sel, settled() ? 1 : 0, pane.open ? 1 : 0, V && V.held.join(''), V && V.dice.join(''), V && JSON.stringify(V.sh), U.hint, M.role, api.paused ? 1 : 0].join('|');
        if (key === U.key) return;
        U.key = key;
        if (V && scene === 'game') { if (V.rolls === 0 || V.turn !== viewer) U.sel = -1; renderSheet(); renderButtons(); statusUpdate(); }
      }

      function showHint() {
        if (!canAct() || M.mode === 'online' || V.rolls < 1) return;
        const pl = yzBot(V, 'Hard');
        if (pl.stop) { U.hint = pl.c; U.hintDice = null; U.sel = pl.c; }
        else { U.hintDice = pl.hold; U.hint = null; }
        U.key = '';
        api.toast(pl.stop ? 'Best: ' + YZ_SHORT[pl.c] : 'Keep the highlighted dice');
      }

      function selectCat(c) {
        if (!canAct()) return;
        const o = myOpts().find(x => x.c === c); if (!o) return;
        if (U.sel === c) { doScore(); return; }
        U.sel = c; au.pop(); U.key = '';
      }

      sheetEl.addEventListener('click', ev => {
        const td = ev.target.closest('td[data-c]'); if (!td) return;
        au.tick(); selectCat(+td.dataset.c);
      });
      bRoll.addEventListener('click', () => doRoll());
      bScore.addEventListener('click', () => { au.tick(); doScore(); });
      bMenu.addEventListener('click', () => { au.tick(); if (pane.open && pane.kind === 'menu') pane.hide(); else showMenu(); });
      bHelp.addEventListener('click', () => { au.tick(); showRules(() => { if (scene === 'title') showTitle(); else pane.hide(); }); });
      bHint.addEventListener('click', () => { au.tick(); showHint(); });

      function dieAt(x, y, tm) {
        let best = -1, bd = 1e9;
        for (let i = 0; i < 5; i++) {
          const d = die[i]; if (d.st !== 'rest') continue;
          const p = proj(d.x, d.y, G.h), r = Math.hypot(x - p[0], y - p[1]);
          if (r < G.h * 1.35 && r < bd) { bd = r; best = i; }
        }
        return best;
      }
      const cupHit = (x, y) => Math.hypot(x - G.cup.x, y - (G.cup.y - 52 * G.cs)) < 66 * G.cs;

      api.on(cv, 'pointerdown', e => {
        if (pane.open || scene !== 'game') return;
        au.tick();
        const p = loc(e);
        const i = dieAt(p.x, p.y);
        if (i >= 0) { doHold(i); return; }
        if (cupHit(p.x, p.y)) doRoll();
      });
      api.on(cv, 'pointermove', e => {
        if (scene !== 'game' || pane.open || e.pointerType !== 'mouse') return;
        const p = loc(e), i = dieAt(p.x, p.y);
        U.hover = i >= 0 && canAct() && V.rolls >= 1 && V.rolls <= 2 ? i : -1;
        cv.style.cursor = U.hover >= 0 || (cupHit(p.x, p.y) && canRoll()) ? 'pointer' : '';
      });

      api.on(window, 'keydown', e => {
        if (!api.alive || pane.open || scene !== 'game' || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key;
        if (k === ' ' || k === 'Enter') {
          e.preventDefault();
          if (U.sel >= 0 && canAct()) doScore(); else doRoll();
        } else if (k >= '1' && k <= '5') doHold(+k - 1);
        else if (k === 'ArrowUp' || k === 'ArrowDown') {
          e.preventDefault();
          const os = myOpts().map(o => o.c).sort((a, b) => a - b); if (!os.length || !canAct()) return;
          const d = k === 'ArrowUp' ? -1 : 1, at = os.indexOf(U.sel);
          U.sel = os[at < 0 ? (d > 0 ? 0 : os.length - 1) : (at + d + os.length) % os.length]; au.pop(); U.key = '';
        } else if (k === 'h' || k === 'H') showHint();
      });

      function seatNames(n, humans) {
        const pool = shuffle(NAMES.slice()), out = [];
        for (let p = 0; p < n; p++) out[p] = humans[p] || pool.pop();
        return out;
      }

      function setupMsg(p) { return { t: 'setup', n: S.n, seat: p, names: M.names, human: M.human }; }

      function beginGame() {
        pane.hide(); scene = 'game'; V = S; Q.length = 0; roll = null; busy = 0; M.bstage = 0; M.plan = null; M.botAt = now() + 800; M.lastTot = -1;
        U.sel = -1; U.hint = null; U.hintDice = null; U.key = ''; overT = 0; U.banner = null; fxs.length = 0;
        die.forEach(d => { d.st = 'hid'; d.fl = null; d.mv = null; d.held = false; });
        api.score(0); hud();
      }

      function newMatch() {
        M.tok++;
        const online = M.mode === 'online' && M.role === 'host';
        let n, humans = [];
        if (online) {
          const live = M.players.filter((x, i) => !i || api.net.players.some(z => z.id === x.id && !z.away));
          M.players = live;
          const k = Math.max(1, Math.min(6, live.length));
          n = clamp(M.bots ? Math.max(k, M.size || k) : k, 1, 6);
          M.pids = Array(n).fill(null);
          for (let i = 0; i < k; i++) { M.pids[i] = live[i].id; humans[i] = live[i].name; }
          M.human = Array.from({ length: n }, (_, i) => i < k);
        } else { M.mode = 'cpu'; M.role = 'local'; n = opt.n; M.human = Array.from({ length: n }, (_, i) => i === 0); humans[0] = 'You'; M.pids = []; }
        M.n = n; M.names = seatNames(n, humans); viewer = 0;
        S = yzNew(n);
        if (online) M.pids.forEach((id, p) => { if (id && p !== 0) api.net.sendTo(id, setupMsg(p)); });
        beginGame();
        if (online) svPut('yahtzee', api.net.code, { S, names: M.names, human: M.human });
      }

      function botTick() {
        if (M.role === 'guest' || !S || S.over || scene !== 'game') return;
        const p = S.turn;
        if (M.human[p] || Q.length || roll || now() < busy || now() < M.botAt || pane.open || api.paused) return;
        const k = K();
        if (M.bstage === 0) {
          if (S.rolls === 0) { doEngine(p, { k: 'roll' }); M.botAt = now() + 250; return; }
          M.plan = yzBot(S, opt.diff); M.bstage = 1; M.botAt = now() + 650 * k; return;
        }
        const pl = M.plan;
        if (M.bstage === 1) {
          if (pl.stop) { M.bstage = 0; doEngine(p, { k: 'score', c: pl.c }); M.botAt = now() + 300; return; }
          M.bstage = 2; doEngine(p, { k: 'holds', flags: pl.hold }); M.botAt = now() + 550 * k; return;
        }
        M.bstage = 0; doEngine(p, { k: 'roll' }); M.botAt = now() + 250;
      }

      function drawBanner(tm) {
        const b = U.banner; if (!b) return;
        const el = tm - b.t0; if (el > 1800) { U.banner = null; return; }
        const s = el < 220 ? easeOut(el / 220) * 1.15 : 1.15 - Math.min(.15, (el - 220) / 1000 * .15), a = el > 1400 ? 1 - (el - 1400) / 400 : 1;
        const f = G.floor;
        ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(G.ox, (f.y0 + f.y1) / 2 - 20); ctx.scale(s, s); ctx.rotate(-.06);
        ctx.font = `900 ${PORT ? 46 : 62}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = 12; ctx.strokeStyle = '#7a1710'; ctx.strokeText(b.text, 0, 0);
        const g = ctx.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#fff2a8'); g.addColorStop(1, '#f5a623');
        ctx.fillStyle = g; ctx.fillText(b.text, 0, 0);
        ctx.restore();
      }

      function drawFx(dt) {
        const tm = now();
        for (let i = fxs.length - 1; i >= 0; i--) {
          const p = fxs[i], el = tm - p.t0;
          if (el > p.life) { fxs.splice(i, 1); continue; }
          p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          ctx.globalAlpha = clamp(1 - el / p.life, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r * 1.6, p.r);
        }
        ctx.globalAlpha = 1;
      }

      function drawDice(tm) {
        const items = [];
        for (let i = 0; i < 5; i++) {
          const d = die[i], dm = dieAtDims(d, tm); if (dm) items.push({ i, d, dm });
        }
        items.sort((a, b) => ((a.dm.z > G.h + 3) - (b.dm.z > G.h + 3)) || (b.dm.y - a.dm.y));
        for (const it of items) {
          const { i, d, dm } = it;
          const hi = U.hintDice && U.hintDice[i];
          const ring = d.held ? 'rgba(255,205,70,.95)' : hi ? 'rgba(90,170,255,.95)' : (U.hover === i ? 'rgba(255,255,255,.7)' : null);
          yzDie(ctx, G, dm.x, dm.y, dm.z, dm.R, d.v, dm.h, { alpha: dm.alpha, ring, tint: d.held });
        }
      }
      const dieAtDims = (d, tm) => dieDims(d, tm);

      function drawCup(tm) {
        let c;
        if (roll && tm - roll.t0 < 1340 * roll.k) c = cupAt(tm - roll.t0);
        else c = { x: G.cup.x, y: G.cup.y, rot: 0, sc: G.cs };
        const glow = canRoll() ? .55 + .45 * Math.sin(tm * .006) : 0;
        yzCup(ctx, c.x, c.y, c.rot, c.sc, glow);
      }

      function drawTitleBg(tm) {
        for (let i = 0; i < 5; i++) {
          const x = (i - 2) * (G.h * 3.2), y = Math.sin(tm * .0014 + i) * 8 - 10;
          const R = m3.mul(m3.ax(.3 + i * .2, .8, .4, tm * .0008 + i * 1.3), YZ_UP[1 + i % 6]);
          yzDie(ctx, G, x, y, G.h * 1.2, R, 1 + i, G.h, {});
        }
      }

      let wasW = 0;
      api.loop((dtc, t) => {
        const dt = Math.min(.05, dtc), tm = now();
        const w = wrap.clientWidth;
        if (w && w !== wasW) { wasW = w; wrap.style.setProperty('--u', (w / W) + 'px'); }
        pump(); botTick();
        updateDice(tm);
        ctx.drawImage(bgC, 0, 0, W, H);
        if (scene === 'title') { drawTitleBg(tm); return; }
        drawDice(tm);
        drawCup(tm);
        drawBanner(tm); drawFx(dt);
        refreshUi();
        if (overT && tm > overT && settled()) { overT = 0; showEnd(); }
        if (M.mode === 'online' && scene === 'game') {
          const on = api.net.connected || M.role === 'host';
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · hosting' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }
      });

      function settingsHtml(online) {
        return `${online ? '' : row('Players', 'You and bots', seg('n', [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6']], opt.n))}
${row('Bots', online ? 'Empty seats' : '', seg('diff', [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']], opt.diff))}
${row('Dice speed', '', seg('fast', [[false, 'Normal'], [true, 'Fast']], opt.fast))}
${row('Score preview', 'Show points per box', seg('prev', [[true, 'On'], [false, 'Off']], opt.prev))}`;
      }

      function showTitle() {
        scene = 'title'; M.mode = 'cpu'; M.role = 'local'; S = null; V = null; Q.length = 0; roll = null; hud();
        const render = () => pane.show('title', `<div class="gx-box"><p class="gx-kick">Dice game</p><h3>Yahtzee</h3>${yzLogo}${settingsHtml(false)}${opt.best ? `<p>Best score: <b>${opt.best}</b></p>` : ''}<button class="gx-big" data-a="play">${opt.n === 1 ? 'Play solo' : 'Play vs bots'}</button><button class="gx-big alt" data-a="online">Play online<small>2-6 players, bots can fill seats</small></button><div class="gx-row"><button class="gx-sm" data-a="rules">How to play</button></div></div>`, onTitle, 'clear');
        const onTitle = a => {
          if (a.startsWith('set:')) { const [, k, v] = a.split(':'); opt[k] = parseV(v); save(); render(); return; }
          if (a === 'play') { M.mode = 'cpu'; M.role = 'local'; newMatch(); }
          else if (a === 'online') startOnline();
          else if (a === 'rules') showRules(() => render());
        };
        render();
      }

      function showRules(back) {
        pane.show('rules', `<div class="gx-box wide"><p class="gx-kick">How to play</p><h3>Yahtzee</h3>${yzRules}<button class="gx-big" data-a="x">Got it</button></div>`, () => { if (back) back(); else pane.hide(); });
      }

      function showMenu() {
        const online = M.mode === 'online';
        pane.show('menu', `<div class="gx-box"><h3>Paused</h3><button class="gx-big" data-a="resume">Resume</button>${online && M.role === 'host' ? '<button class="gx-big alt" data-a="lobby">Back to lobby</button>' : ''}${online ? '' : '<button class="gx-big alt" data-a="restart">New game</button>'}<button class="gx-big alt" data-a="rules">How to play</button><button class="gx-big red" data-a="quit">${online ? 'Leave game' : 'Main menu'}</button></div>`, a => {
          if (a === 'resume') pane.hide();
          else if (a === 'restart') newMatch();
          else if (a === 'rules') showRules(() => showMenu());
          else if (a === 'lobby') { pane.hide(); svDel('yahtzee'); startOnline(); }
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }

      function showEnd() {
        if (!V || !V.over) return;
        const tots = V.sh.map(yzTot), order = tots.map((t, p) => ({ p, t })).sort((a, b) => b.t.total - a.t.total);
        const top = order[0].t.total, winners = order.filter(r => r.t.total === top).map(r => r.p);
        const win = winners.includes(viewer), host = M.role !== 'guest', online = M.mode === 'online';
        const mine = tots[viewer].total;
        if (V.n === 1) { au.win(); } else if (win) au.win(); else au.lose();
        if (M.human[viewer]) { api.submit(mine); if (mine > (opt.best || 0)) { opt.best = mine; save(); } }
        const head = V.n === 1 ? `You scored ${mine}` : winners.length > 1 ? 'A tie at the top' : winners[0] === viewer ? 'You win!' : `${E(fullName(winners[0]))} wins`;
        const rows = order.map(r => `<tr class="${winners.includes(r.p) ? 'win' : ''}"><td><i style="background:${SEAT[r.p % 6]}"></i>${E(nameOf(r.p))}</td><td>${r.t.up + r.t.bonus}</td><td>${r.t.lo + r.t.yb}</td><td>${r.t.total}</td></tr>`).join('');
        const btns = host ? `<button class="gx-big" data-a="again">${online ? 'Rematch' : 'Play again'}</button>${online ? '<button class="gx-big alt" data-a="lobby">Back to lobby</button>' : ''}<button class="gx-big alt" data-a="menu">${online ? 'Leave' : 'Main menu'}</button>` : '<p>Waiting for the host…</p><button class="gx-sm" data-a="menu">Leave</button>';
        pane.show('end', `<div class="gx-box"><p class="gx-kick">Game over</p><h3>${head}</h3><table class="gx-tbl"><tr><th>Player</th><th>Upper</th><th>Lower</th><th>Total</th></tr>${rows}</table>${btns}</div>`, a => {
          if (a === 'again') newMatch();
          else if (a === 'lobby') { pane.hide(); svDel('yahtzee'); startOnline(); }
          else if (a === 'menu') { if (online) leaveOnline(); else showTitle(); }
        }, 'clear');
      }

      function leaveOnline() {
        M.tok++; M.mode = 'cpu'; M.role = 'local'; S = null; V = null; M.pids = []; M.players = [];
        svDel('yahtzee'); api.net.close(); showTitle();
      }

      function hookOnline() {
        if (M.hooked) return;
        M.hooked = true;
        hookNet(api, {
          data: onData,
          leave: p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); },
          rejoin: p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); },
          lobby: () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); },
          close: reason => {
            if (M.mode !== 'online' || !M.role || M.role === 'local') return;
            M.tok++; M.role = 'local'; S = null; Q.length = 0;
            au.lose();
            const hh = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
            const tt = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
            pane.show('left', `<div class="gx-box"><p class="gx-kick">Online</p><h3>${hh}</h3><p>${tt}</p><button class="gx-big" data-a="room">Online lobby</button><button class="gx-big alt" data-a="menu">Main menu</button></div>`, a => { if (a === 'room') startOnline(); else { api.net.close(); showTitle(); } });
          }
        });
      }

      function seatToBot(id) {
        const p = M.pids.indexOf(id);
        if (p < 0 || !S) return;
        const who = M.names[p];
        M.pids[p] = null; M.human[p] = false; M.names[p] = who + ' (bot)';
        M.pids.forEach((pid, s2) => { if (pid && s2 !== 0 && M.human[s2]) api.net.sendTo(pid, { t: 'seats', names: M.names, human: M.human }); });
        M.bstage = 0; M.botAt = now() + 800;
        api.toast(who + ' left. A bot takes the seat.');
        U.key = '';
      }

      function sendSync(id) {
        if (!S) return;
        const p = M.pids.indexOf(id);
        if (p < 0 || !M.human[p]) return;
        api.net.sendTo(id, setupMsg(p));
        api.net.sendTo(id, { t: 'st', s: S, fx: null, sync: 1 });
      }

      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookOnline();
        pane.hide(); scene = 'title'; V = null; hud();
        Q.length = 0; roll = null; S = null;
        M.mode = 'online'; M.role = null;
        const r = await api.net.room({ title: 'Yahtzee', sizes: [2, 3, 4, 5, 6], defaultSize: 4, min: 2, max: 6, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; M.role = 'local'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, 6); M.bots = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') hostStart();
        else pane.show('wait', `<div class="gx-box"><p class="gx-kick">Online</p><h3>Connected</h3><p>Waiting for the host to start…</p><div class="gx-row"><button class="gx-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); });
      }

      function hostStart() {
        const sv = svGet('yahtzee', api.net.code), map = sv && !sv.S.over && svMap(sv, M.players);
        if (!map) return newMatch();
        const left = sv.human.filter((h, i) => i > 0 && h).length - Object.keys(map).length;
        svAsk(pane, `Saved game: round ${sv.S.round} of 13.${left ? ` ${left} missing player${left > 1 ? 's' : ''} will be replaced by bots.` : ''}`, a => {
          if (a === 'go') resumeMatch(sv, map); else if (a === 'new') newMatch(); else leaveOnline();
        });
      }

      function resumeMatch(sv, map) {
        M.tok++;
        S = sv.S;
        const n = S.n;
        M.n = n; M.names = sv.names.slice(); M.human = Array(n).fill(false); M.pids = Array(n).fill(null);
        M.human[0] = true; M.pids[0] = M.players[0].id;
        for (let p = 1; p < n; p++) {
          if (!sv.human[p]) continue;
          if (map[p]) { M.pids[p] = map[p].id; M.human[p] = true; } else M.names[p] += ' (bot)';
        }
        viewer = 0; M.mode = 'online'; M.role = 'host';
        beginGame(); syncDice();
        M.pids.forEach((id, p) => { if (id && p !== 0) sendSync(id); });
      }

      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !S || d.t !== 'act' || !d.a || typeof d.a !== 'object') return;
          const p = M.pids.indexOf(from);
          if (p < 0 || p === 0 || !M.human[p]) return;
          if (!Q.length && now() >= busy && !roll && (d.a.k === 'roll' || d.a.k === 'hold' || d.a.k === 'score') && doEngine(p, d.a)) return;
          api.net.sendTo(from, { t: 'st', s: S, fx: null, sync: 1 });
        } else if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat; M.names = d.names; M.human = d.human; M.n = d.n;
          S = null; V = null; scene = 'game'; pane.hide(); Q.length = 0; roll = null; busy = 0; M.awaiting = 0; overT = 0; U.banner = null; fxs.length = 0; M.lastTot = -1;
          die.forEach(x => { x.st = 'hid'; x.fl = null; x.mv = null; x.held = false; });
          hud(); api.score(0);
        } else if (M.role !== 'guest') return;
        else if (d.t === 'st' && d.s) {
          M.awaiting = 0;
          const first = !V;
          V = d.s;
          if (d.sync || first || !d.fx) { syncDice(); overT = V.over ? now() + 300 : 0; }
          else for (const e of d.fx) Q.push(e);
          U.key = '';
        } else if (d.t === 'seats') { M.names = d.names; M.human = d.human; U.key = ''; }
      }

      fit(true);
      root._yz = { proj, bot: l => yzBot(V, l), M, Q, opt, U, die, pane, get S() { return S; }, get V() { return V; }, get viewer() { return viewer; }, act, canAct, canRoll, myOpts, G: () => G, busy: () => busy - now(), roll: () => roll };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; au.close(); } };
    }
  });

  Ameplay.covers.yahtzee = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="yzc-g" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#2f8a58"/><stop offset=".7" stop-color="#1c6a3f"/><stop offset="1" stop-color="#0e472a"/></radialGradient><linearGradient id="yzc-w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a4d2a"/><stop offset="1" stop-color="#4a2d18"/></linearGradient><linearGradient id="yzc-d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffef6"/><stop offset="1" stop-color="#e3d8b8"/></linearGradient><linearGradient id="yzc-c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4e170d"/><stop offset=".4" stop-color="#b8472c"/><stop offset="1" stop-color="#40130a"/></linearGradient></defs><rect width="400" height="300" fill="url(#yzc-w)"/><rect x="26" y="30" width="348" height="240" rx="22" fill="#6b4223" stroke="#3a2210" stroke-width="4"/><rect x="42" y="46" width="316" height="208" rx="8" fill="url(#yzc-g)"/><g stroke="#b7aa86" stroke-width="3"><g transform="translate(120 140) rotate(-14)"><rect x="-34" y="-34" width="68" height="68" rx="12" fill="#000" opacity=".25" transform="translate(5 7)" stroke="none"/><rect x="-34" y="-34" width="68" height="68" rx="12" fill="url(#yzc-d)"/><g fill="#17181c" stroke="none"><circle cx="-16" cy="-16" r="6.5"/><circle cx="16" cy="-16" r="6.5"/><circle cx="-16" cy="0" r="6.5"/><circle cx="16" cy="0" r="6.5"/><circle cx="-16" cy="16" r="6.5"/><circle cx="16" cy="16" r="6.5"/></g></g><g transform="translate(212 118) rotate(9)"><rect x="-34" y="-34" width="68" height="68" rx="12" fill="#000" opacity=".25" transform="translate(5 7)" stroke="none"/><rect x="-34" y="-34" width="68" height="68" rx="12" fill="url(#yzc-d)"/><circle cx="0" cy="0" r="10" fill="#c3281f" stroke="none"/></g><g transform="translate(180 196) rotate(-5)"><rect x="-34" y="-34" width="68" height="68" rx="12" fill="#000" opacity=".25" transform="translate(5 7)" stroke="none"/><rect x="-34" y="-34" width="68" height="68" rx="12" fill="url(#yzc-d)"/><g fill="#17181c" stroke="none"><circle cx="-16" cy="-16" r="6.5"/><circle cx="16" cy="-16" r="6.5"/><circle cx="0" cy="0" r="6.5"/><circle cx="-16" cy="16" r="6.5"/><circle cx="16" cy="16" r="6.5"/></g></g></g><g transform="translate(306 214)"><ellipse cx="4" cy="4" rx="38" ry="9" fill="#000" opacity=".3"/><path d="M-30 0C-33-34-38-68-42-96H42C38-68 33-34 30 0Q0 16-30 0Z" fill="url(#yzc-c)"/><ellipse cx="0" cy="-96" rx="44" ry="13" fill="#d6aa4f"/><ellipse cx="0" cy="-96" rx="38" ry="9.5" fill="#1c0a06"/></g></svg>`;

  const MM_COL = ['#e8372c', '#f58a1f', '#f7d02b', '#2fb457', '#2f6fe8', '#9b4fe0', '#ee6fb6', '#18bdb5'];
  const MM_NAME = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Teal'];

  function mmFb(code, g) {
    const cc = [0, 0, 0, 0, 0, 0, 0, 0], gc = [0, 0, 0, 0, 0, 0, 0, 0];
    let b = 0;
    for (let i = 0; i < code.length; i++) { if (code[i] === g[i]) b++; else { cc[code[i]]++; gc[g[i]]++; } }
    let w = 0;
    for (let c = 0; c < 8; c++) w += cc[c] < gc[c] ? cc[c] : gc[c];
    return b * 10 + w;
  }

  const MM_ALL = new Map();
  function mmAll(cfg) {
    const key = cfg.pegs + '/' + cfg.colors + '/' + (cfg.dup ? 1 : 0);
    let all = MM_ALL.get(key);
    if (all) return all;
    all = [];
    const cur = [];
    const rec = i => {
      if (i === cfg.pegs) { all.push(cur.slice()); return; }
      for (let c = 0; c < cfg.colors; c++) { if (!cfg.dup && cur.includes(c)) continue; cur[i] = c; rec(i + 1); }
      cur.length = i;
    };
    rec(0);
    MM_ALL.set(key, all);
    return all;
  }

  function mmValid(cfg, code) {
    if (!Array.isArray(code) || code.length !== cfg.pegs) return false;
    for (let i = 0; i < code.length; i++) { const c = code[i]; if (!Number.isInteger(c) || c < 0 || c >= cfg.colors) return false; }
    return cfg.dup || new Set(code).size === code.length;
  }

  function mmRand(cfg, R = Math.random) {
    if (cfg.dup) return Array.from({ length: cfg.pegs }, () => rint(cfg.colors, R));
    return shuffle(Array.from({ length: cfg.colors }, (_, i) => i), R).slice(0, cfg.pegs);
  }

  const mmCands = (cfg, rows) => mmAll(cfg).filter(c => rows.every(r => mmFb(c, r.g) === r.fb));

  function mmFirst(cfg) {
    if (!cfg.dup) return Array.from({ length: cfg.pegs }, (_, i) => i);
    return cfg.pegs === 4 ? [0, 0, 1, 1] : cfg.pegs === 5 ? [0, 0, 1, 1, 2] : [0, 0, 1, 1, 2, 2].slice(0, cfg.pegs);
  }

  function mmPick(cfg, rows, lvl, R = Math.random) {
    if (!rows.length) return lvl === 'Hard' || lvl === 'Normal' ? mmFirst(cfg) : mmRand(cfg, R);
    const cands = mmCands(cfg, rows);
    if (!cands.length) return mmRand(cfg, R);
    if (lvl === 'Easy') return R() < .3 ? mmRand(cfg, R) : cands[rint(cands.length, R)];
    if (lvl === 'Normal' || cands.length <= 2) return cands[rint(cands.length, R)];
    const all = mmAll(cfg);
    const targets = cands.length > 500 ? shuffle(cands.slice(), R).slice(0, 500) : cands;
    let pool;
    if (all.length <= 1400) pool = all;
    else pool = shuffle(cands.slice(), R).slice(0, 140).concat(Array.from({ length: 50 }, () => all[rint(all.length, R)]));
    const isC = new Set(cands.map(c => c.join('')));
    let best = null, bm = 1e9, bs = 1e9, bc = 0;
    const cnt = new Int32Array(64);
    for (const g of pool) {
      cnt.fill(0);
      let mx = 0, sq = 0;
      for (const t of targets) { const f = mmFb(t, g); const k = f - ((f / 10) | 0) * 4; const v = ++cnt[k]; if (v > mx) mx = v; }
      for (let i = 0; i < 64; i++) sq += cnt[i] * cnt[i];
      const c = isC.has(g.join('')) ? 1 : 0;
      if (mx < bm || (mx === bm && (c > bc || (c === bc && sq < bs)))) { bm = mx; bs = sq; bc = c; best = g; }
    }
    return best;
  }

  const mmBrk = S => S.mode === 'solo' ? [0] : S.mode === 'race' ? [0, 1] : [1 - S.maker];
  const mmMak = S => S.mode === 'solo' ? [] : S.mode === 'race' ? [0, 1] : [S.maker];
  const mmTgt = (S, s) => S.mode === 'solo' ? 0 : S.mode === 'race' ? 1 - s : S.maker;

  function mmRound(S, R) {
    S.rows = [[], []]; S.done = [false, false]; S.won = [false, false]; S.codes = [null, null]; S.locked = [false, false]; S.rEnd = null;
    if (S.mode === 'solo') { S.codes[0] = mmRand(S.cfg, R); S.locked[0] = true; S.phase = 'play'; }
    else { S.maker = (S.round - 1) % 2; S.phase = 'set'; }
  }

  function mmNew(mode, cfg, rounds, R = Math.random) {
    const S = { mode, cfg, rounds: mode === 'turns' ? rounds : 1, n: mode === 'solo' ? 1 : 2, round: 1, maker: 0, phase: 'set', codes: [null, null], locked: [false, false], rows: [[], []], done: [false, false], won: [false, false], pts: [0, 0], winner: -1, rEnd: null };
    mmRound(S, R);
    return S;
  }

  function mmSet(S, s, code) {
    if (S.phase !== 'set' || !mmMak(S).includes(s) || S.locked[s] || !mmValid(S.cfg, code)) return false;
    S.codes[s] = code.slice(); S.locked[s] = true;
    if (mmMak(S).every(x => S.locked[x])) S.phase = 'play';
    return true;
  }

  function mmGuess(S, s, g, t) {
    if (S.phase !== 'play' || !mmBrk(S).includes(s) || S.done[s] || !mmValid(S.cfg, g)) return -1;
    const rows = S.rows[s], fb = mmFb(S.codes[mmTgt(S, s)], g);
    rows.push({ g: g.slice(), fb, t: t || 0 });
    if (((fb / 10) | 0) === S.cfg.pegs) { S.done[s] = true; S.won[s] = true; }
    else if (rows.length >= S.cfg.rows) S.done[s] = true;
    if (S.mode === 'solo') { if (S.done[0]) { S.phase = 'over'; S.winner = S.won[0] ? 0 : -1; } }
    else if (S.mode === 'race') {
      if (S.won[s]) { S.phase = 'over'; S.winner = s; }
      else if (S.done[0] && S.done[1]) { S.phase = 'over'; S.winner = -1; }
    } else if (S.done[s]) {
      const mk = S.maker, pts = rows.length + (S.won[s] ? 0 : 1);
      S.pts[mk] += pts; S.rEnd = { maker: mk, brk: s, won: S.won[s], n: rows.length, pts };
      if (S.round >= S.rounds) { S.phase = 'over'; S.winner = S.pts[0] === S.pts[1] ? -1 : S.pts[0] > S.pts[1] ? 0 : 1; }
      else S.phase = 'between';
    }
    return rows.length - 1;
  }

  function mmNext(S, R) {
    if (S.phase !== 'between') return false;
    S.round++; mmRound(S, R);
    return true;
  }

  function mmView(S, s) {
    const end = S.phase === 'over' || S.phase === 'between';
    let reveal = null;
    if (end) reveal = S.mode === 'solo' ? [S.codes[0], null] : S.mode === 'race' ? S.codes.slice() : S.codes.slice();
    return {
      mode: S.mode, cfg: S.cfg, rounds: S.rounds, n: S.n, round: S.round, maker: S.maker, phase: S.phase, rows: S.rows, done: S.done, won: S.won, pts: S.pts, winner: S.winner, locked: S.locked, rEnd: S.rEnd,
      mine: S.mode === 'solo' ? null : S.codes[s], reveal
    };
  }

  function mmMult(cfg) {
    return (cfg.pegs === 5 ? 1.6 : 1) * (cfg.colors === 8 ? 1.5 : 1) * (cfg.dup ? 1 : .7) * (cfg.rows === 12 ? .85 : 1);
  }

  const mmShade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };

  const mmRules = `<div class="gx-rules">
<h4>Goal</h4><p>Break the hidden colour code. After each guess the code maker answers with key pegs: a <b>black</b> peg means one peg has the right colour in the right place, a <b>white</b> peg means a right colour in the wrong place. The key pegs do not say which peg is which.</p>
<h4>Solo</h4><p>The game picks a secret code. You have a limited number of rows. Fewer guesses means a higher score, and harder boards (5 pegs, 8 colours, no repeats) pay more.</p>
<h4>Duel (race)</h4><p>Both players set a secret code, then both race to break the other one at the same time. The first to crack the code wins. If both run out of rows it is a draw.</p>
<h4>Turns</h4><p>Players alternate being code maker and code breaker. The maker scores one point for every guess the breaker needed, plus one extra point if the code was never broken. After all rounds the highest score wins.</p>
<h4>Options</h4><p>4 or 5 pegs, 6 or 8 colours, 10 or 12 rows, and repeated colours on or off. The hint button suggests the best next guess using Knuth's minimax method and lowers your solo score.</p>
<h4>Controls</h4><p>Tap or drag a colour into the active row, tap a peg to remove it, then Submit. Keys: <kbd>1</kbd>-<kbd>8</kbd> place a colour, <kbd>Backspace</kbd> remove, <kbd>Enter</kbd> submit, <kbd>H</kbd> hint.</p></div>`;

  const mmLogo = `<svg viewBox="0 0 220 74" width="180" height="61" style="display:block;margin:2px auto 6px"><rect x="8" y="6" width="204" height="62" rx="12" fill="#24262d" stroke="#e8e4d4" stroke-width="3"/>${[0, 1, 2, 3].map(i => `<circle cx="${42 + i * 38}" cy="30" r="13" fill="${MM_COL[[0, 4, 3, 2][i]]}" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="${38 + i * 38}" cy="25" r="4" fill="rgba(255,255,255,.55)"/>`).join('')}<circle cx="174" cy="22" r="5" fill="#16161a" stroke="#777"/><circle cx="190" cy="22" r="5" fill="#f4f4f0"/><circle cx="174" cy="38" r="5" fill="#f4f4f0"/><circle cx="190" cy="38" r="5" fill="#2a2c33" stroke="#555"/><text x="110" y="60" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="11" fill="#e8e4d4" text-anchor="middle" letter-spacing="3">MASTERMIND</text></svg>`;

  Ameplay.register({
    id: 'mastermind',
    title: 'Mastermind',
    category: 'Board',
    tint: '#2f6fe8',
    blurb: 'The classic code-breaking game with black and white key pegs. Break a secret code solo, race a friend, or take turns as code maker. Smart solver hints and bots.',
    help: 'Tap or drag colours into the row · tap a peg to remove it · <kbd>1</kbd>-<kbd>8</kbd> colour · <kbd>Enter</kbd> submit · <kbd>H</kbd> hint',
    better: 'high',
    format: v => v + ' pts',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="6" width="48" height="52" rx="7"/><circle cx="20" cy="18" r="4.5"/><circle cx="32" cy="18" r="4.5" fill="currentColor"/><circle cx="20" cy="32" r="4.5" fill="currentColor"/><circle cx="32" cy="32" r="4.5"/><circle cx="20" cy="46" r="4.5"/><circle cx="32" cy="46" r="4.5"/><circle cx="45" cy="15" r="2" fill="currentColor"/><circle cx="45" cy="22" r="2"/><circle cx="45" cy="29" r="2" fill="currentColor"/><circle cx="45" cy="36" r="2"/></svg>',
    css: baseCss('mastermind', '#7fb2ff') + `
.gm-mastermind .mm-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(6,10,30,.45);background:radial-gradient(120% 90% at 50% 40%,#2d3a52,#161c2a);--u:1px;color:#f4f1e6;font-family:var(--sans);user-select:none;-webkit-user-select:none}
.gm-mastermind .mm-main{position:absolute;inset:0;display:flex;padding:calc(var(--u)*12);gap:calc(var(--u)*14)}
.gm-mastermind .mm-left{width:calc(var(--u)*250);display:flex;flex-direction:column;gap:calc(var(--u)*10);min-width:0}
.gm-mastermind .mm-right{flex:1;display:flex;flex-direction:column;gap:calc(var(--u)*12);min-width:0;justify-content:center}
.gm-mastermind .mm-top{display:flex;align-items:center;gap:calc(var(--u)*8)}
.gm-mastermind .mm-top .gx-ico{width:calc(var(--u)*42);height:calc(var(--u)*42);border-radius:calc(var(--u)*14)}
.gm-mastermind .mm-top .gx-ico svg{width:calc(var(--u)*22);height:calc(var(--u)*22)}
.gm-mastermind .mm-ttl{font:900 calc(var(--u)*18)/1.1 var(--sans);letter-spacing:.3px;flex:1;min-width:0}
.gm-mastermind .mm-st{font:800 calc(var(--u)*16)/1.3 var(--sans);color:#fff;min-height:calc(var(--u)*42)}
.gm-mastermind .mm-st b{color:var(--gx-acc)}
.gm-mastermind .mm-info{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*6)}
.gm-mastermind .mm-info div{background:rgba(255,255,255,.07);border-radius:calc(var(--u)*10);padding:calc(var(--u)*6) calc(var(--u)*9);font:800 calc(var(--u)*11) var(--sans);color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.6px}
.gm-mastermind .mm-info div b{display:block;font:900 calc(var(--u)*20) var(--sans);color:#fff;letter-spacing:0;text-transform:none;margin-top:calc(var(--u)*1)}
.gm-mastermind .mm-board{position:relative;width:calc(var(--u)*336);flex:none;background:linear-gradient(#e9e6da,#cfcab8);border-radius:calc(var(--u)*18);padding:calc(var(--u)*10);box-shadow:0 calc(var(--u)*8) calc(var(--u)*20) rgba(0,0,0,.5),inset 0 0 0 calc(var(--u)*3) #fff8;display:flex;flex-direction:column;gap:calc(var(--u)*8)}
.gm-mastermind .mm-shield{height:calc(var(--u)*var(--sh));border-radius:calc(var(--u)*12);background:linear-gradient(#3a3d48,#1f2128);box-shadow:inset 0 calc(var(--u)*-4) 0 rgba(0,0,0,.35),0 calc(var(--u)*2) calc(var(--u)*4) rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*8);position:relative;overflow:hidden}
.gm-mastermind .mm-shield .lg{position:absolute;left:0;right:0;bottom:calc(var(--u)*3);text-align:center;font:900 calc(var(--u)*9) var(--sans);letter-spacing:calc(var(--u)*3);color:rgba(232,228,212,.45)}
.gm-mastermind .mm-shield.cover .q{width:calc(var(--u)*var(--pd));height:calc(var(--u)*var(--pd));border-radius:50%;background:linear-gradient(#4a4e5c,#2c2f38);box-shadow:inset 0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.5);display:grid;place-items:center;font:900 calc(var(--u)*var(--pd)*.5) var(--sans);color:rgba(255,255,255,.35)}
.gm-mastermind .mm-shield.open{background:linear-gradient(#d9d5c4,#bdb8a4);box-shadow:inset 0 calc(var(--u)*2) calc(var(--u)*5) rgba(0,0,0,.35)}
.gm-mastermind .mm-shield.open .lg{color:rgba(60,55,40,.55)}
.gm-mastermind .mm-shield.edit{background:linear-gradient(#f0ecd9,#d6d1bb);box-shadow:inset 0 calc(var(--u)*2) calc(var(--u)*5) rgba(0,0,0,.3),0 0 0 calc(var(--u)*3) #7fb2ff}
.gm-mastermind .mm-shield.edit .lg,.gm-mastermind .mm-shield.open .lg{color:rgba(60,55,40,.6)}
.gm-mastermind .mm-rows{flex:1;display:flex;flex-direction:column;justify-content:flex-end;background:#2a2d36;border-radius:calc(var(--u)*12);padding:calc(var(--u)*5) calc(var(--u)*6);box-shadow:inset 0 calc(var(--u)*3) calc(var(--u)*8) rgba(0,0,0,.55)}
.gm-mastermind .mm-row{height:calc(var(--u)*var(--rh));display:flex;align-items:center;gap:calc(var(--u)*6);border-radius:calc(var(--u)*9);padding:0 calc(var(--u)*4);position:relative}
.gm-mastermind .mm-row.cur{background:rgba(127,178,255,.16);box-shadow:inset 0 0 0 calc(var(--u)*2) rgba(127,178,255,.8)}
.gm-mastermind .mm-row.dim{opacity:.55}
.gm-mastermind .mm-n{width:calc(var(--u)*18);text-align:center;font:900 calc(var(--u)*11) var(--sans);color:rgba(255,255,255,.35);flex:none}
.gm-mastermind .mm-row.cur .mm-n{color:#7fb2ff}
.gm-mastermind .mm-pegs{flex:1;display:flex;justify-content:space-around;align-items:center}
.gm-mastermind .mm-keys{display:grid;grid-template-columns:repeat(var(--kc),calc(var(--u)*var(--kd)));gap:calc(var(--u)*3);justify-content:center;flex:none;width:calc(var(--u)*var(--kw))}
.gm-mastermind .pg{display:block;position:relative;flex:none;width:calc(var(--u)*var(--pd));height:calc(var(--u)*var(--pd));border-radius:50%;box-sizing:border-box;font:900 calc(var(--u)*var(--pd)*.46)/1 var(--sans);color:rgba(255,255,255,.92);display:grid;place-items:center;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.gm-mastermind .pg.hole{background:radial-gradient(circle at 50% 60%,#14161c,#23262f);box-shadow:inset 0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.7),0 calc(var(--u)*1) 0 rgba(255,255,255,.08)}
.gm-mastermind .pg.sl{cursor:pointer}
.gm-mastermind .pg.sel{box-shadow:0 0 0 calc(var(--u)*3) #7fb2ff,0 0 calc(var(--u)*10) #7fb2ff}
.gm-mastermind .pg.fill{box-shadow:0 calc(var(--u)*3) calc(var(--u)*4) rgba(0,0,0,.55),inset 0 calc(var(--u)*-3) calc(var(--u)*4) rgba(0,0,0,.28),inset 0 calc(var(--u)*2) calc(var(--u)*3) rgba(255,255,255,.35)}
.gm-mastermind .pg.hint{outline:calc(var(--u)*2.5) dashed #7fb2ff;outline-offset:calc(var(--u)*2)}
${MM_COL.map((c, i) => `.gm-mastermind .pg.c${i}{background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.75) 0 9%,transparent 22%),radial-gradient(circle at 40% 34%,${mmShade(c, .28)},${c} 58%,${mmShade(c, -.38)})}`).join('')}
.gm-mastermind .kp{width:calc(var(--u)*var(--kd));height:calc(var(--u)*var(--kd));border-radius:50%;background:radial-gradient(circle at 50% 60%,#14161c,#23262f);box-shadow:inset 0 calc(var(--u)*1) calc(var(--u)*2) rgba(0,0,0,.7)}
.gm-mastermind .kp.b{background:radial-gradient(circle at 34% 30%,#8a8f9e,#15161b 62%);box-shadow:0 calc(var(--u)*1.5) calc(var(--u)*2) rgba(0,0,0,.6),inset 0 0 0 calc(var(--u)*1) #000}
.gm-mastermind .kp.w{background:radial-gradient(circle at 34% 30%,#fff,#d9d9d2 60%,#a7a79f);box-shadow:0 calc(var(--u)*1.5) calc(var(--u)*2) rgba(0,0,0,.6)}
.gm-mastermind .mm-row.nk .kp.b,.gm-mastermind .mm-row.nk .kp.w{animation:mm-kp .34s cubic-bezier(.2,1.6,.4,1) both;animation-delay:calc(var(--i)*.13s + .12s)}
.gm-mastermind .mm-row.np .pg.fill{animation:mm-drop .36s cubic-bezier(.2,1.4,.4,1) both;animation-delay:calc(var(--i)*.07s)}
@keyframes mm-kp{from{transform:scale(0)}to{transform:none}}
@keyframes mm-drop{from{transform:translateY(calc(var(--u)*-30)) scale(1.2);opacity:0}to{transform:none;opacity:1}}
.gm-mastermind .mm-pal{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*8)}
.gm-mastermind .mm-pal button{display:flex;align-items:center;gap:calc(var(--u)*9);padding:calc(var(--u)*5) calc(var(--u)*8);border-radius:calc(var(--u)*14);border:calc(var(--u)*2) solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#fff;font:800 calc(var(--u)*13) var(--sans);text-align:left;touch-action:none}
.gm-mastermind .mm-pal button:hover{background:rgba(255,255,255,.16)}
.gm-mastermind .mm-pal button:active{transform:scale(.96)}
.gm-mastermind .mm-pal button:disabled{opacity:.4;pointer-events:none}
.gm-mastermind .mm-pal button small{display:block;font:700 calc(var(--u)*10) var(--sans);color:rgba(255,255,255,.5)}
.gm-mastermind .mm-pal .pg{--pd:34}
.gm-mastermind .mm-acts{display:flex;gap:calc(var(--u)*8)}
.gm-mastermind .mm-acts button{height:calc(var(--u)*50);border-radius:calc(var(--u)*14);border:0;font:900 calc(var(--u)*17) var(--sans);color:#fff;background:linear-gradient(#5b6a92,#3d4a6e);box-shadow:inset 0 calc(var(--u)*-4) 0 rgba(0,0,0,.25);padding:0 calc(var(--u)*12);flex:1}
.gm-mastermind .mm-acts .go{flex:2;background:linear-gradient(#ffd75a,#f0a91f);color:#1b130a}
.gm-mastermind .mm-acts button:disabled{opacity:.35;pointer-events:none}
.gm-mastermind .mm-acts button:active{transform:translateY(calc(var(--u)*2))}
.gm-mastermind .mm-mini{background:rgba(0,0,0,.25);border-radius:calc(var(--u)*12);padding:calc(var(--u)*7) calc(var(--u)*8);flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.gm-mastermind .mm-mini h5{margin:0 0 calc(var(--u)*5);font:900 calc(var(--u)*11) var(--sans);letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.6)}
.gm-mastermind .mm-mini .mr{display:flex;align-items:center;gap:calc(var(--u)*6);height:calc(var(--u)*var(--mh));flex:none}
.gm-mastermind .mm-mini .mr span{width:calc(var(--u)*14);font:800 calc(var(--u)*9) var(--sans);color:rgba(255,255,255,.35);text-align:center}
.gm-mastermind .mm-mini .pg{--pd:var(--mp)}
.gm-mastermind .mm-mini .mp{display:flex;gap:calc(var(--u)*3);flex:1}
.gm-mastermind .mm-mini .mk{display:grid;grid-template-columns:repeat(var(--kc),calc(var(--u)*7));gap:calc(var(--u)*2)}
.gm-mastermind .mm-mini .mk i{width:calc(var(--u)*7);height:calc(var(--u)*7);border-radius:50%;background:#1a1c22}
.gm-mastermind .mm-mini .mk i.b{background:#0b0b0e;box-shadow:0 0 0 1px #888}
.gm-mastermind .mm-mini .mk i.w{background:#f4f4f0}
.gm-mastermind .mm-mine{display:flex;gap:calc(var(--u)*5);align-items:center;margin-top:calc(var(--u)*5)}
.gm-mastermind .mm-mine .pg{--pd:22}
.gm-mastermind .mm-ghost{position:fixed;z-index:50;pointer-events:none;transform:translate(-50%,-50%) scale(1.15);opacity:.92}
.gm-mastermind .gx-seg button{padding:0 2px;font-size:11.5px;min-width:0}
.gm-mastermind .mm-wrap:not(.mm-port) .gx-pane.low .gx-box{max-width:calc(var(--u)*340);margin:auto 0 auto auto}
.gm-mastermind .mm-wrap.mm-port .gx-pane.low .gx-box{margin:auto auto 0}
.gm-mastermind .mm-wrap .gx-box{background:linear-gradient(#2a3552,#171e33)}
.gm-mastermind .mm-codes{display:flex;gap:calc(var(--u)*6);justify-content:center;margin:6px 0}
.gm-mastermind .mm-codes .pg{--pd:30}
.gm-mastermind .mm-wrap.mm-port .mm-main{flex-direction:column;padding:calc(var(--u)*8);gap:calc(var(--u)*8);align-items:stretch}
.gm-mastermind .mm-wrap.mm-port .mm-left{width:auto;flex-direction:row;align-items:center;gap:calc(var(--u)*8)}
.gm-mastermind .mm-wrap.mm-port .mm-st{min-height:0;flex:1;font-size:calc(var(--u)*14)}
.gm-mastermind .mm-wrap.mm-port .mm-info,.gm-mastermind .mm-wrap.mm-port .mm-mini,.gm-mastermind .mm-wrap.mm-port .mm-ttl{display:none}
.gm-mastermind .mm-wrap.mm-port .mm-board{width:100%;flex:1;min-height:0}
.gm-mastermind .mm-wrap.mm-port .mm-right{flex:none;justify-content:flex-start;gap:calc(var(--u)*8)}
.gm-mastermind .mm-wrap.mm-port .mm-pal{grid-template-columns:repeat(var(--pc),1fr);gap:calc(var(--u)*5)}
.gm-mastermind .mm-wrap.mm-port .mm-pal button{flex-direction:column;padding:calc(var(--u)*4) 0;gap:calc(var(--u)*2);align-items:center;justify-content:center;font-size:calc(var(--u)*11)}
.gm-mastermind .mm-wrap.mm-port .mm-pal button small,.gm-mastermind .mm-wrap.mm-port .mm-pal button span.nm{display:none}
.gm-mastermind .mm-wrap.mm-port .mm-pal .pg{--pd:34}
.gm-mastermind .mm-wrap.mm-port .mm-acts button{height:calc(var(--u)*46);font-size:calc(var(--u)*16)}
`,
    mount(root, api) {
      const opt = Object.assign({ pegs: 4, colors: 6, rows: 10, dup: true, diff: 'Normal', rounds: 4, omode: 'race', sym: false, best: 0 }, api.load() || {});
      if (!['Easy', 'Normal', 'Hard'].includes(opt.diff)) opt.diff = 'Normal';
      const save = () => api.save(opt);
      const au = audioKit(api);
      const wrap = document.createElement('div'); wrap.className = 'gx-wrap mm-wrap';
      wrap.innerHTML = `<div class="mm-main"><div class="mm-left"><div class="mm-top"><button class="gx-ico" data-u="menu" aria-label="Menu" hidden>${ICON.menu}</button><div class="mm-ttl"></div><button class="gx-ico" data-u="help" aria-label="Rules">${ICON.help}</button></div><div class="mm-st"></div><div class="mm-info"></div><div class="mm-mini" hidden></div></div><div class="mm-board" hidden></div><div class="mm-right" hidden></div></div><div class="gx-net" hidden><i></i><span>Online</span></div>`;
      root.append(wrap);
      const pane = Pane(wrap);
      const q = s => wrap.querySelector(s);
      const bMenu = q('[data-u=menu]'), bHelp = q('[data-u=help]'), titEl = q('.mm-ttl'), stEl = q('.mm-st'), infoEl = q('.mm-info'), miniEl = q('.mm-mini'), boardEl = q('.mm-board'), rightEl = q('.mm-right'), netEl = q('.gx-net');

      let PORT = null, W = 960, H = 640, scene = 'title', S = null, V = null, viewer = 0, wasW = 0;
      const M = { mode: 'cpu', role: 'local', names: [], human: [], pids: [], players: [], bots: false, size: 2, tok: 0, hooked: false, botAt: 0, t0: 0, tEnd: 0, hints: 0, endAt: 0, lastRows: [0, 0] };
      const U = { cur: [], sel: 0, anim: null, hint: false, drag: null, key: '' };
      const cfgOf = () => ({ pegs: opt.pegs, colors: opt.colors, rows: opt.rows, dup: opt.dup });

      const fullName = p => M.names[p] || 'Player ' + (p + 1);
      const vcfg = () => V.cfg;

      function fit(force) {
        const port = (root.clientWidth || 800) < 620;
        if (!force && port === PORT) return;
        PORT = port; W = port ? 430 : 960; H = port ? 740 : 640;
        wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        wrap.classList.toggle('mm-port', port);
        U.key = ''; layout();
      }
      api.on(window, 'resize', () => fit(false));

      function layout() {
        const cfg = V ? V.cfg : cfgOf(), n = cfg.pegs, rows = cfg.rows;
        const bh = PORT ? 536 : 616, bw = PORT ? 414 : 336;
        const sh = PORT ? 54 : 70;
        const rh = Math.min(PORT ? 44 : 52, Math.floor((bh - 20 - sh - 8 - 10) / rows));
        const kc = n === 5 ? 3 : 2, kd = clamp(Math.floor(rh * .27), 9, 14), kw = kc * kd + (kc - 1) * 3 + 6;
        const pw = bw - 20 - 12 - 18 - kw - 20;
        const pd = Math.max(16, Math.min(rh - 7, Math.floor(pw / n) - 6, PORT ? 46 : 46));
        const set = (k, v) => wrap.style.setProperty(k, v);
        set('--rh', rh); set('--kc', kc); set('--kd', kd); set('--kw', kw); set('--pd', pd); set('--sh', sh); set('--pc', cfg.colors);
        set('--mp', 13); set('--mh', Math.max(11, Math.min(20, Math.floor(300 / rows))));
      }

      const iMake = () => V && mmMak(V).includes(viewer);
      const iBreak = () => V && mmBrk(V).includes(viewer);
      const boardSeat = () => iBreak() ? viewer : mmBrk(V)[0];
      const editing = () => {
        if (!V || scene !== 'game') return null;
        if (V.phase === 'set' && iMake() && !V.locked[viewer]) return 'set';
        if (V.phase === 'play' && iBreak() && !V.done[viewer]) return 'guess';
        return null;
      };
      const animBusy = () => U.anim && now() - U.anim.t < U.anim.d;
      const canEdit = () => editing() && !pane.open && !api.paused && !animBusy();

      const pg = (c, cls) => `<i class="pg ${cls || ''} ${c >= 0 ? 'c' + c + ' fill' : 'hole'}">${c >= 0 && opt.sym ? c + 1 : ''}</i>`;

      function keysHtml(fb, n, anim) {
        const b = (fb / 10) | 0, w = fb % 10, k = [];
        for (let i = 0; i < n; i++) k.push(i < b ? 'b' : i < b + w ? 'w' : '');
        return k.map((c, i) => `<i class="kp ${c}" style="--i:${i}"></i>`).join('');
      }

      function boardHtml() {
        const v = V, cfg = v.cfg, bs = boardSeat(), rows = v.rows[bs], mode = editing();
        const tgtIdx = mmTgt(v, bs), rev = v.reveal;
        let shield;
        const showCode = rev && rev[tgtIdx];
        if (mode === 'set') shield = `<div class="mm-shield edit">${Array.from({ length: cfg.pegs }, (_, i) => pgSlot(U.cur[i] == null ? -1 : U.cur[i], i)).join('')}<span class="lg">YOUR SECRET CODE</span></div>`;
        else if (showCode) shield = `<div class="mm-shield open">${rev[tgtIdx].map(c => pg(c)).join('')}<span class="lg">THE CODE</span></div>`;
        else if (v.mode === 'turns' && iMake() && v.mine) shield = `<div class="mm-shield open">${v.mine.map(c => pg(c)).join('')}<span class="lg">YOUR CODE</span></div>`;
        else shield = `<div class="mm-shield cover">${Array.from({ length: cfg.pegs }, () => '<i class="q">?</i>').join('')}<span class="lg">MASTERMIND</span></div>`;
        let h = shield + '<div class="mm-rows">';
        const ci = rows.length;
        for (let r = cfg.rows - 1; r >= 0; r--) {
          const row = rows[r];
          const isNew = U.anim && U.anim.s === bs && U.anim.i === r && now() - U.anim.t < 2200;
          if (row) {
            h += `<div class="mm-row${isNew ? ' nk' + (bs !== viewer ? ' np' : '') : ''}"><span class="mm-n">${r + 1}</span><div class="mm-pegs">${row.g.map((c, i) => `<span style="--i:${i};display:contents">${pg(c)}</span>`).join('')}</div><div class="mm-keys">${keysHtml(row.fb, cfg.pegs)}</div></div>`;
          } else if (r === ci && mode === 'guess') {
            h += `<div class="mm-row cur"><span class="mm-n">${r + 1}</span><div class="mm-pegs">${Array.from({ length: cfg.pegs }, (_, i) => pgSlot(U.cur[i] == null ? -1 : U.cur[i], i)).join('')}</div><div class="mm-keys">${keysHtml(0, cfg.pegs)}</div></div>`;
          } else {
            h += `<div class="mm-row dim"><span class="mm-n">${r + 1}</span><div class="mm-pegs">${Array.from({ length: cfg.pegs }, () => pg(-1)).join('')}</div><div class="mm-keys">${keysHtml(0, cfg.pegs)}</div></div>`;
          }
        }
        return h + '</div>';
      }

      function pgSlot(c, i) {
        return `<i class="pg sl ${c >= 0 ? 'c' + c + ' fill' : 'hole'}${U.sel === i ? ' sel' : ''}${U.hint && c >= 0 ? ' hint' : ''}" data-slot="${i}">${c >= 0 && opt.sym ? c + 1 : ''}</i>`;
      }

      function miniHtml() {
        const v = V, cfg = v.cfg;
        if (v.mode !== 'race') { return ''; }
        const opp = 1 - viewer, rows = v.rows[opp];
        let h = `<h5>${E(fullName(opp))} · ${rows.length}/${cfg.rows}</h5>`;
        for (let r = 0; r < Math.min(cfg.rows, Math.max(rows.length, 1)) || r < 1; r++) {
          const row = rows[r]; if (!row) break;
          const b = (row.fb / 10) | 0, w = row.fb % 10, kk = Array.from({ length: cfg.pegs }, (_, i) => `<i class="${i < b ? 'b' : i < b + w ? 'w' : ''}"></i>`).join('');
          h += `<div class="mr"><span>${r + 1}</span><div class="mp">${row.g.map(c => pg(c)).join('')}</div><div class="mk">${kk}</div></div>`;
        }
        if (!rows.length) h += '<div class="mr"><span></span><div class="mp" style="opacity:.5;font:700 calc(var(--u)*12) var(--sans)">No guesses yet</div></div>';
        if (v.mine) h += `<div class="mm-mine"><small style="font:800 calc(var(--u)*10) var(--sans);color:rgba(255,255,255,.55);margin-right:calc(var(--u)*4)">YOUR CODE</small>${v.mine.map(c => pg(c)).join('')}</div>`;
        return h;
      }

      function rightHtml() {
        const v = V, cfg = v.cfg, mode = editing();
        let pal = '';
        for (let c = 0; c < cfg.colors; c++) pal += `<button data-c="${c}" ${mode ? '' : 'disabled'} aria-label="${MM_NAME[c]}">${pg(c)}<div><span class="nm">${MM_NAME[c]}</span><small>key ${c + 1}</small></div></button>`;
        const full = U.cur.length === cfg.pegs && U.cur.every(x => x >= 0);
        const hintOk = M.mode !== 'online' && mode === 'guess' && v.mode !== 'race' || (M.mode !== 'online' && mode === 'guess');
        return `<div class="mm-pal">${pal}</div><div class="mm-acts"><button class="go" data-u="submit" ${mode && full ? '' : 'disabled'}>${mode === 'set' ? 'Lock in code' : 'Submit'}</button><button data-u="clear" ${mode ? '' : 'disabled'}>Clear</button>${hintOk ? '<button data-u="hint" title="Knuth solver hint">Hint</button>' : ''}</div>`;
      }

      function statusText() {
        if (scene !== 'game' || !V) return '';
        const v = V, cfg = v.cfg, opp = 1 - viewer, on = fullName(opp);
        if (v.phase === 'set') {
          if (iMake() && !v.locked[viewer]) return v.mode === 'turns' ? `Round ${v.round}: you are the <b>code maker</b>. Choose a secret code.` : 'Choose your <b>secret code</b> for your opponent.';
          if (iMake()) return `Code locked. Waiting for <b>${E(on)}</b>…`;
          return `<b>${E(on)}</b> is choosing a secret code…`;
        }
        if (v.phase === 'play') {
          if (iBreak()) {
            if (v.done[viewer]) return v.mode === 'race' ? `Out of rows. <b>${E(on)}</b> is still going.` : 'Out of rows.';
            return `Guess <b>${v.rows[viewer].length + 1}</b> of ${cfg.rows}${v.mode === 'race' ? `<br><small>${E(on)}: ${v.rows[opp].length} guess${v.rows[opp].length === 1 ? '' : 'es'}</small>` : ''}${v.mode === 'turns' ? `<br><small>Round ${v.round} of ${v.rounds} · you break</small>` : ''}`;
          }
          return `<b>${E(on)}</b> is breaking your code · guess ${v.rows[1 - viewer].length + 1} of ${cfg.rows}`;
        }
        if (v.phase === 'between') return `Round ${v.round} complete`;
        return 'Game over';
      }

      function infoHtml() {
        if (!V || scene !== 'game') return '';
        const v = V, bs = boardSeat(), used = v.rows[bs].length;
        const cells = [];
        cells.push(`<div>Guesses<b>${used} / ${v.cfg.rows}</b></div>`);
        const el = Math.max(0, Math.floor(((M.tEnd || now()) - M.t0) / 1000));
        cells.push(`<div>Time<b>${M.t0 ? Math.floor(el / 60) + ':' + String(el % 60).padStart(2, '0') : '–'}</b></div>`);
        if (v.mode === 'turns') { cells.push(`<div>You<b>${v.pts[viewer]}</b></div>`); cells.push(`<div>${E(fullName(1 - viewer))}<b>${v.pts[1 - viewer]}</b></div>`); }
        else if (v.mode === 'solo') { cells.push(`<div>Best<b>${opt.best || '–'}</b></div>`); cells.push(`<div>Board<b>${v.cfg.pegs}/${v.cfg.colors}${v.cfg.dup ? '' : ' no rep.'}</b></div>`); }
        return cells.join('');
      }

      function refresh() {
        if (scene !== 'game' || !V) return;
        layout();
        boardEl.innerHTML = boardHtml();
        rightEl.innerHTML = rightHtml();
        stEl.innerHTML = statusText();
        infoEl.innerHTML = infoHtml();
        const mh = miniHtml(); miniEl.hidden = !mh || PORT; miniEl.innerHTML = mh;
        titEl.textContent = V.mode === 'solo' ? 'Break the code' : V.mode === 'race' ? 'Duel' : 'Turns';
      }

      function hud() {
        const g = scene === 'game';
        bMenu.hidden = !g; titEl.hidden = !g; boardEl.hidden = !g; rightEl.hidden = !g; infoEl.hidden = !g; stEl.hidden = !g;
        netEl.hidden = !(g && M.mode === 'online');
        if (!g) miniEl.hidden = true;
      }

      function place(c) {
        if (!canEdit()) return;
        const n = V.cfg.pegs;
        while (U.cur.length < n) U.cur.push(-1);
        let i = U.sel;
        if (i < 0 || i >= n) i = U.cur.findIndex(x => x < 0);
        if (i < 0) i = n - 1;
        U.cur[i] = c; U.hint = false;
        const nx = U.cur.findIndex((x, j) => x < 0 && j > i), any = U.cur.findIndex(x => x < 0);
        U.sel = nx >= 0 ? nx : any >= 0 ? any : -1;
        au.peg(); refresh();
      }
      function clearSlot(i) {
        if (!canEdit()) return;
        U.cur[i] = -1; U.sel = i; U.hint = false; au.pop(); refresh();
      }
      function clearAll() { if (!canEdit()) return; U.cur = Array(V.cfg.pegs).fill(-1); U.sel = 0; U.hint = false; au.pop(); refresh(); }
      function backspace() {
        if (!canEdit()) return;
        let i = -1; for (let j = U.cur.length - 1; j >= 0; j--) if (U.cur[j] >= 0) { i = j; break; }
        if (i >= 0) clearSlot(i);
      }

      function submit() {
        if (!canEdit()) return;
        const mode = editing();
        const n = V.cfg.pegs;
        if (U.cur.length !== n || U.cur.some(x => x < 0)) { api.toast('Fill every peg first'); return; }
        if (!V.cfg.dup && new Set(U.cur).size !== n) { api.toast('Colours cannot repeat on this board'); au.bad(); return; }
        const code = U.cur.slice();
        if (mode === 'set') act({ k: 'code', code }); else act({ k: 'guess', g: code });
        U.hint = false;
      }

      function hintNow() {
        if (!canEdit() || editing() !== 'guess' || M.mode === 'online') return;
        const bs = boardSeat();
        const g = mmPick(V.cfg, V.rows[bs], 'Hard');
        U.cur = g.slice(); U.sel = -1; U.hint = true; M.hints++;
        au.good(); refresh();
        api.toast('Knuth solver suggests this guess');
      }

      wrap.addEventListener('click', e => {
        const t = e.target;
        const u = t.closest('[data-u]');
        if (u) {
          au.tick();
          const k = u.dataset.u;
          if (k === 'submit') submit(); else if (k === 'clear') clearAll(); else if (k === 'hint') hintNow();
          else if (k === 'menu') { if (pane.open && pane.kind === 'menu') pane.hide(); else showMenu(); }
          else if (k === 'help') showRules(() => { if (scene === 'title') showTitle(); else pane.hide(); });
          return;
        }
        const s = t.closest('[data-slot]');
        if (s && !s.closest('.gx-pane')) { const i = +s.dataset.slot; if (U.cur[i] >= 0) clearSlot(i); else { U.sel = i; refresh(); } }
      });

      let dr = null;
      wrap.addEventListener('pointerdown', e => {
        const b = e.target.closest('.mm-pal button[data-c]');
        if (!b || b.disabled || !canEdit()) return;
        dr = { c: +b.dataset.c, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId, ghost: null };
        try { b.setPointerCapture(e.pointerId); } catch (x) {}
      });
      wrap.addEventListener('pointermove', e => {
        if (!dr || e.pointerId !== dr.id) return;
        if (!dr.moved && Math.hypot(e.clientX - dr.x, e.clientY - dr.y) > 7) {
          dr.moved = true;
          const g = document.createElement('div'); g.className = 'mm-ghost';
          g.innerHTML = pg(dr.c); wrap.append(g); dr.ghost = g;
        }
        if (dr.ghost) { dr.ghost.style.left = e.clientX + 'px'; dr.ghost.style.top = e.clientY + 'px'; }
      });
      const endDrag = e => {
        if (!dr || e.pointerId !== dr.id) return;
        const d = dr; dr = null;
        if (d.ghost) d.ghost.remove();
        if (d.moved) {
          const el = document.elementFromPoint(e.clientX, e.clientY), s = el && el.closest && el.closest('[data-slot]');
          if (s) { U.sel = +s.dataset.slot; place(d.c); }
        } else place(d.c);
      };
      wrap.addEventListener('pointerup', endDrag);
      wrap.addEventListener('pointercancel', e => { if (dr && dr.ghost) dr.ghost.remove(); dr = null; });

      api.on(window, 'keydown', e => {
        if (!api.alive || pane.open || scene !== 'game' || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key;
        if (k >= '1' && k <= '8' && +k <= V.cfg.colors) place(+k - 1);
        else if (k === 'Backspace') { e.preventDefault(); backspace(); }
        else if (k === 'Enter') { e.preventDefault(); submit(); }
        else if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); if (canEdit()) { const n = V.cfg.pegs, d = k === 'ArrowLeft' ? -1 : 1; U.sel = ((U.sel < 0 ? 0 : U.sel) + d + n) % n; refresh(); } }
        else if (k === 'h' || k === 'H') hintNow();
        else if (k === 'Delete') clearAll();
      });

      function commitRow(s, i) {
        if (s !== boardSeat()) return;
        U.anim = { s, i, t: now(), d: 1000 };
        const row = V.rows[s][i], b = (row.fb / 10) | 0, w = row.fb % 10;
        for (let j = 0; j < b + w; j++) api.timeout(() => { if (!api.alive) return; au.peg(); }, 120 + j * 130);
      }

      function setView(v, fx) {
        const prev = V;
        V = v;
        if (!prev || prev.phase !== v.phase || prev.round !== v.round || (prev.rows[0].length + prev.rows[1].length) > (v.rows[0].length + v.rows[1].length)) {
          U.cur = Array(v.cfg.pegs).fill(-1); U.sel = 0; U.hint = false;
          if (v.phase === 'play' && (!prev || prev.phase !== 'play')) { M.t0 = now(); M.tEnd = 0; }
        }
        if (fx) for (const e of fx) if (e.k === 'row') { commitRow(e.s, e.i); if (e.s === viewer) { U.cur = Array(v.cfg.pegs).fill(-1); U.sel = 0; U.hint = false; } }
        if (v.phase === 'over' || v.phase === 'between') { if (!M.tEnd) M.tEnd = now(); M.endAt = now() + (fx && fx.some(e => e.k === 'row') ? 1500 : 200); } else { M.tEnd = 0; M.endAt = 0; }
        scene = 'game'; hud(); refresh();
      }

      function broadcast(fx) {
        if (M.mode === 'online' && M.role === 'host') { if (S.phase === 'over') svDel('mastermind'); else svPut('mastermind', api.net.code, { S, names: M.names, human: M.human }); }
        setView(mmView(S, 0), fx);
        if (M.mode === 'online') M.pids.forEach((id, s) => { if (id && s !== 0 && M.human[s]) api.net.sendTo(id, { t: 'st', v: mmView(S, s), fx }); });
      }

      function doEngine(s, a) {
        if (!S) return false;
        const fx = [];
        let ok = false;
        if (a.k === 'code') ok = mmSet(S, s, a.code);
        else if (a.k === 'guess') { const i = mmGuess(S, s, a.g, Math.round(now() - M.t0)); ok = i >= 0; if (ok) fx.push({ k: 'row', s, i }); }
        else if (a.k === 'next' && s === 0) ok = mmNext(S, Math.random);
        if (ok) { broadcast(fx); M.botAt = now() + (S.phase === 'set' ? 900 : botDelay()); }
        return ok;
      }

      function act(a) {
        if (M.role === 'guest') { api.net.send({ t: 'act', a }); return; }
        doEngine(viewer, a);
      }

      function botDelay() {
        if (!S) return 1000;
        if (S.mode === 'race') return opt.diff === 'Easy' ? 9000 + Math.random() * 4000 : opt.diff === 'Normal' ? 6000 + Math.random() * 3000 : 4000 + Math.random() * 2500;
        return 1500 + Math.random() * 1100;
      }

      function botTick() {
        if (M.role === 'guest' || !S || scene !== 'game' || pane.open || api.paused || now() < M.botAt || (U.anim && animBusy())) return;
        for (const s of [0, 1]) {
          if (s >= S.n || M.human[s]) continue;
          if (S.phase === 'set' && mmMak(S).includes(s) && !S.locked[s]) { doEngine(s, { k: 'code', code: mmRand(S.cfg) }); M.botAt = now() + 600; return; }
          if (S.phase === 'play' && mmBrk(S).includes(s) && !S.done[s]) {
            if (S.mode === 'race' && S.rows[s].length === 0 && !M.t0) return;
            doEngine(s, { k: 'guess', g: mmPick(S.cfg, S.rows[s], opt.diff) });
            return;
          }
        }
      }

      api.loop(() => {
        if (scene === 'game' && V) {
          botTick();
          if (M.endAt && now() > M.endAt && !pane.open) { M.endAt = 0; showEnd(); }
          if (V.mode === 'solo' && V.phase === 'play' || (V.phase === 'play' && M.t0)) {
            const s = Math.floor((now() - M.t0) / 1000);
            if (s !== M.shownT) { M.shownT = s; if (!pane.open) infoEl.innerHTML = infoHtml(); }
          }
          if (U.anim && now() - U.anim.t > 2300) { U.anim = null; }
        }
        const w = wrap.clientWidth;
        if (w && w !== wasW) { wasW = w; wrap.style.setProperty('--u', (w / W) + 'px'); }
        if (M.mode === 'online' && scene === 'game') {
          const on = api.net.connected || M.role === 'host';
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · hosting' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }
      });

      function seatNames(n, humans) {
        const pool = shuffle(NAMES.slice()), out = [];
        for (let p = 0; p < n; p++) out[p] = humans[p] || pool.pop();
        return out;
      }

      function setupMsg(s) { return { t: 'setup', seat: s, names: M.names, human: M.human, cfg: S.cfg, mode: S.mode, rounds: S.rounds }; }

      function newMatch(mode) {
        M.tok++;
        const online = M.mode === 'online' && M.role === 'host';
        let humans = [];
        if (online) {
          const live = M.players.filter((x, i) => !i || api.net.players.some(z => z.id === x.id && !z.away));
          M.players = live;
          M.pids = [live[0].id, live[1] ? live[1].id : null];
          humans = [live[0].name, live[1] ? live[1].name : null];
          M.human = [true, !!live[1]];
          mode = opt.omode;
        } else if (mode === 'solo') { M.mode = 'cpu'; M.role = 'local'; M.human = [true]; humans = ['You']; M.pids = []; }
        else { M.mode = 'cpu'; M.role = 'local'; M.human = [true, false]; humans = ['You']; M.pids = []; }
        M.names = seatNames(mode === 'solo' ? 1 : 2, humans);
        viewer = 0; M.hints = 0; M.t0 = 0; M.tEnd = 0; M.lastRows = [0, 0]; U.anim = null; M.endAt = 0;
        S = mmNew(mode, cfgOf(), opt.rounds);
        if (online && M.pids[1]) api.net.sendTo(M.pids[1], setupMsg(1));
        V = null; pane.hide();
        if (S.phase === 'play') M.t0 = now();
        M.botAt = now() + 900;
        broadcast([]);
      }

      function nextRound() { if (M.role === 'guest') return; pane.hide(); doEngine(0, { k: 'next' }); }

      function soloScore() {
        const v = V, n = v.rows[0].length;
        let s = Math.round((v.cfg.rows + 1 - n) * 100 * mmMult(v.cfg));
        if (M.hints) s = Math.round(s * Math.max(.4, 1 - .2 * M.hints));
        return v.won[0] ? Math.max(10, s) : 0;
      }

      const codeHtml = c => c ? `<div class="mm-codes">${c.map(x => pg(x)).join('')}</div>` : '';

      function showEnd() {
        if (!V || (V.phase !== 'over' && V.phase !== 'between')) return;
        const v = V, host = M.role !== 'guest', online = M.mode === 'online', me = viewer, opp = 1 - viewer;
        let head, sub = '', body = '', btns;
        if (v.mode === 'solo') {
          const won = v.won[0], n = v.rows[0].length, sc = soloScore();
          head = won ? `Code cracked in ${n}!` : 'Out of guesses';
          sub = won ? `${sc} points${M.hints ? ` (${M.hints} hint${M.hints > 1 ? 's' : ''} used)` : ''} · ${Math.floor((M.tEnd - M.t0) / 1000)} s` : 'The secret code was:';
          body = codeHtml(v.reveal[0]);
          if (won) { au.win(); api.submit(sc); if (sc > (opt.best || 0)) { opt.best = sc; save(); } } else au.lose();
        } else if (v.mode === 'race') {
          const w = v.winner;
          head = w === me ? 'You cracked it first!' : w < 0 ? 'A draw' : `${E(fullName(w))} wins the race`;
          sub = w < 0 ? 'Nobody broke the code in time.' : `${E(fullName(w))} needed ${v.rows[w].length} guess${v.rows[w].length > 1 ? 'es' : ''}.`;
          body = `<p>Your opponent's code</p>${codeHtml(v.reveal[opp])}<p>Your code</p>${codeHtml(v.reveal[me])}`;
          if (w === me) au.win(); else if (w < 0) au.pass(); else au.lose();
        } else {
          const e = v.rEnd, over = v.phase === 'over';
          head = over ? (v.winner < 0 ? 'The match is a tie' : v.winner === me ? 'You win the match!' : `${E(fullName(v.winner))} wins the match`) : `Round ${v.round} of ${v.rounds}`;
          sub = e ? `${e.maker === me ? 'You made' : E(fullName(e.maker)) + ' made'} the code. ${e.brk === me ? 'You' : E(fullName(e.brk))} ${e.won ? `cracked it in ${e.n}` : 'did not crack it'}: ${e.pts} point${e.pts > 1 ? 's' : ''} for the maker.` : '';
          body = codeHtml(v.reveal[e ? e.maker : 0]) + `<table class="gx-tbl"><tr><th>Player</th><th>Points</th></tr><tr class="${v.pts[me] >= v.pts[opp] ? 'win' : ''}"><td><i style="background:${SEAT[0]}"></i>You</td><td>${v.pts[me]}</td></tr><tr class="${v.pts[opp] > v.pts[me] ? 'win' : ''}"><td><i style="background:${SEAT[1]}"></i>${E(fullName(opp))}</td><td>${v.pts[opp]}</td></tr></table>`;
          if (over) { if (v.winner === me) au.win(); else if (v.winner < 0) au.pass(); else au.lose(); } else au.good();
        }
        const over = v.phase === 'over';
        if (v.phase === 'between') btns = host ? '<button class="gx-big" data-a="next">Next round</button><button class="gx-big alt" data-a="menu">' + (online ? 'Leave' : 'Main menu') + '</button>' : '<p>Waiting for the host…</p><button class="gx-sm" data-a="menu">Leave</button>';
        else btns = host ? `<button class="gx-big" data-a="again">${online ? 'Rematch' : 'Play again'}</button>${online ? '<button class="gx-big alt" data-a="lobby">Back to lobby</button>' : ''}<button class="gx-big alt" data-a="menu">${online ? 'Leave' : 'Main menu'}</button>` : '<p>Waiting for the host…</p><button class="gx-sm" data-a="menu">Leave</button>';
        pane.show('end', `<div class="gx-box"><p class="gx-kick">${over ? 'Game over' : 'Round complete'}</p><h3>${head}</h3><p>${sub}</p>${body}${btns}</div>`, a => {
          if (a === 'next') nextRound();
          else if (a === 'again') newMatch(S.mode);
          else if (a === 'lobby') { pane.hide(); svDel('mastermind'); startOnline(); }
          else if (a === 'menu') { if (online) leaveOnline(); else showTitle(); }
        }, 'clear low');
      }

      function settingsHtml(online) {
        return `<div class="gx-grid">${row('Pegs', 'Code length', seg('pegs', [[4, '4'], [5, '5']], opt.pegs))}
${row('Colours', '', seg('colors', [[6, '6'], [8, '8']], opt.colors))}
${row('Rows', 'Guesses allowed', seg('rows', [[10, '10'], [12, '12']], opt.rows))}
${row('Repeats', 'Same colour twice', seg('dup', [[true, 'Allowed'], [false, 'No']], opt.dup))}
${row('Bots', 'Solver strength', seg('diff', [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']], opt.diff))}
${row('Turns match', 'Rounds', seg('rounds', [[2, '2'], [4, '4'], [6, '6']], opt.rounds))}
${row('Online mode', '1 v 1', seg('omode', [['race', 'Duel'], ['turns', 'Turns']], opt.omode))}
${row('Colour marks', 'Numbers on pegs', seg('sym', [[false, 'Off'], [true, 'On']], opt.sym))}</div>`;
      }

      function showTitle() {
        scene = 'title'; M.mode = 'cpu'; M.role = 'local'; S = null; V = null; U.anim = null; M.endAt = 0; hud();
        const render = () => pane.show('title', `<div class="gx-box wide"><p class="gx-kick">Code breaking</p><h3>Mastermind</h3>${mmLogo}${settingsHtml(false)}<button class="gx-big" data-a="solo">Break the code<small>Solo · random secret code${opt.best ? ` · best ${opt.best}` : ''}</small></button><div class="gx-row" style="gap:8px;flex-wrap:nowrap"><button class="gx-big alt" data-a="race" style="flex:1">Duel vs bot<small>Both race to crack</small></button><button class="gx-big alt" data-a="turns" style="flex:1">Turns vs bot<small>Maker and breaker</small></button></div><button class="gx-big alt" data-a="online">Play online<small>1 v 1 with a friend, bots can fill the seat</small></button><div class="gx-row"><button class="gx-sm" data-a="rules">How to play</button></div></div>`, onTitle, 'clear');
        const onTitle = a => {
          if (a.startsWith('set:')) { const [, k, v] = a.split(':'); opt[k] = parseV(v); save(); render(); return; }
          if (a === 'solo' || a === 'race' || a === 'turns') { M.mode = 'cpu'; M.role = 'local'; newMatch(a); }
          else if (a === 'online') startOnline();
          else if (a === 'rules') showRules(() => render());
        };
        render();
      }

      function showRules(back) {
        pane.show('rules', `<div class="gx-box wide"><p class="gx-kick">How to play</p><h3>Mastermind</h3>${mmRules}<button class="gx-big" data-a="x">Got it</button></div>`, () => { if (back) back(); else pane.hide(); });
      }

      function showMenu() {
        const online = M.mode === 'online';
        pane.show('menu', `<div class="gx-box"><h3>Paused</h3><button class="gx-big" data-a="resume">Resume</button>${online && M.role === 'host' ? '<button class="gx-big alt" data-a="lobby">Back to lobby</button>' : ''}${online ? '' : '<button class="gx-big alt" data-a="restart">New game</button>'}<button class="gx-big alt" data-a="rules">How to play</button><button class="gx-big red" data-a="quit">${online ? 'Leave game' : 'Main menu'}</button></div>`, a => {
          if (a === 'resume') pane.hide();
          else if (a === 'restart') newMatch(S.mode);
          else if (a === 'rules') showRules(() => showMenu());
          else if (a === 'lobby') { pane.hide(); svDel('mastermind'); startOnline(); }
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }

      function leaveOnline() {
        M.tok++; M.mode = 'cpu'; M.role = 'local'; S = null; V = null; M.pids = []; M.players = [];
        svDel('mastermind'); api.net.close(); showTitle();
      }

      function hookOnline() {
        if (M.hooked) return;
        M.hooked = true;
        hookNet(api, {
          data: onData,
          leave: p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); },
          rejoin: p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); },
          lobby: () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); },
          close: reason => {
            if (M.mode !== 'online' || !M.role || M.role === 'local') return;
            M.tok++; M.role = 'local'; S = null; V = null; M.endAt = 0;
            au.lose();
            const hh = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
            const tt = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
            pane.show('left', `<div class="gx-box"><p class="gx-kick">Online</p><h3>${hh}</h3><p>${tt}</p><button class="gx-big" data-a="room">Online lobby</button><button class="gx-big alt" data-a="menu">Main menu</button></div>`, a => { if (a === 'room') startOnline(); else { api.net.close(); showTitle(); } });
          }
        });
      }

      function seatToBot(id) {
        const s = M.pids.indexOf(id);
        if (s < 1 || !S) return;
        const who = M.names[s];
        M.pids[s] = null; M.human[s] = false; M.names[s] = who + ' (bot)';
        M.botAt = now() + 1500;
        api.toast(who + ' left. A bot takes the seat.');
        refresh();
      }

      function sendSync(id) {
        if (!S) return;
        const s = M.pids.indexOf(id);
        if (s < 1 || !M.human[s]) return;
        api.net.sendTo(id, setupMsg(s));
        api.net.sendTo(id, { t: 'st', v: mmView(S, s), fx: null, sync: 1 });
      }

      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookOnline();
        pane.hide(); scene = 'title'; V = null; hud();
        S = null; M.mode = 'online'; M.role = null;
        const r = await api.net.room({ title: 'Mastermind', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; M.role = 'local'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, 2); M.bots = !!r.bots; M.size = 2;
        if (r.role === 'host') hostStart();
        else pane.show('wait', `<div class="gx-box"><p class="gx-kick">Online</p><h3>Connected</h3><p>Waiting for the host to start…</p><div class="gx-row"><button class="gx-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); });
      }

      function hostStart() {
        const sv = svGet('mastermind', api.net.code), map = sv && sv.S.phase !== 'over' && svMap(sv, M.players);
        if (!map) return newMatch(opt.omode);
        const left = sv.human.filter((h, i) => i > 0 && h).length - Object.keys(map).length;
        svAsk(pane, `Saved game: ${sv.S.mode === 'turns' ? 'round ' + sv.S.round + ' of ' + sv.S.rounds : 'duel'}.${left ? ' Your opponent is missing and will be replaced by a bot.' : ''}`, a => {
          if (a === 'go') resumeMatch(sv, map); else if (a === 'new') newMatch(opt.omode); else leaveOnline();
        });
      }

      function resumeMatch(sv, map) {
        M.tok++;
        S = sv.S;
        M.names = sv.names.slice(); M.human = [true, false]; M.pids = [M.players[0].id, null];
        if (sv.human[1]) { if (map[1]) { M.pids[1] = map[1].id; M.human[1] = true; } else M.names[1] += ' (bot)'; }
        viewer = 0; M.mode = 'online'; M.role = 'host'; M.hints = 0; M.t0 = 0; M.tEnd = 0; U.anim = null; M.endAt = 0;
        V = null; pane.hide();
        if (S.phase === 'play') M.t0 = now();
        M.botAt = now() + 900;
        if (M.pids[1]) sendSync(M.pids[1]);
        broadcast([]);
      }

      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !S || d.t !== 'act' || !d.a || typeof d.a !== 'object') return;
          const s = M.pids.indexOf(from);
          if (s < 1 || !M.human[s]) return;
          const a = d.a;
          if ((a.k === 'code' || a.k === 'guess') && doEngine(s, a)) return;
          api.net.sendTo(from, { t: 'st', v: mmView(S, s), fx: null, sync: 1 });
        } else if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat; M.names = d.names; M.human = d.human;
          V = null; pane.hide(); M.endAt = 0; M.hints = 0; M.t0 = 0; U.anim = null;
          scene = 'game';
          wrap.dataset.cfg = '';
        } else if (M.role !== 'guest') return;
        else if (d.t === 'st' && d.v) {
          const first = !V;
          if (first) { V = d.v; layout(); }
          setView(d.v, d.sync ? null : d.fx);
          if (d.sync && V.phase === 'play') M.t0 = M.t0 || now();
        }
      }

      fit(true);
      root._mm = { M, U, opt, pane, place, submit, hintNow, act, get S() { return S; }, get V() { return V; }, get viewer() { return viewer; }, canEdit, editing, pick: (l) => mmPick(V.cfg, V.rows[boardSeat()], l), boardSeat };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; au.close(); } };
    }
  });

  Ameplay.covers.mastermind = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mmc-g" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#34425e"/><stop offset="1" stop-color="#121826"/></radialGradient>${MM_COL.slice(0, 6).map((c, i) => `<radialGradient id="mmc-${i}" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="${mmShade(c, .5)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${mmShade(c, -.4)}"/></radialGradient>`).join('')}</defs><rect width="400" height="300" fill="url(#mmc-g)"/><rect x="92" y="18" width="216" height="266" rx="20" fill="#e5e1d1" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><rect x="104" y="30" width="192" height="42" rx="12" fill="#2f323d"/><g fill="#4a4e5c"><circle cx="140" cy="51" r="13"/><circle cx="180" cy="51" r="13"/><circle cx="220" cy="51" r="13"/><circle cx="260" cy="51" r="13"/></g><rect x="104" y="80" width="192" height="196" rx="12" fill="#2a2d36"/>${[[0, 4, 3, 2, 1, 0], [1, 1, 5, 3, 2, 0], [4, 0, 2, 2, 1, 1], [3, 5, 0, 4, 2, 1]].map((r, k) => { const y = 242 - k * 44; const cols = [[0, 4, 2, 3], [4, 0, 1, 5], [3, 3, 0, 4], [1, 2, 4, 5]][k]; return cols.map((c, i) => `<circle cx="${135 + i * 36}" cy="${y}" r="14" fill="url(#mmc-${c})"/><circle cx="${130 + i * 36}" cy="${y - 5}" r="4" fill="#fff" opacity=".5"/>`).join('') + [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b], j) => `<circle cx="${270 + a * 14}" cy="${y - 7 + b * 14}" r="5" fill="${j < 2 - (k % 2) ? '#0c0c0f' : j < 3 ? '#f4f4f0' : '#1a1c22'}" stroke="#777" stroke-width="1"/>`).join(''); }).join('')}</svg>`;
})();
