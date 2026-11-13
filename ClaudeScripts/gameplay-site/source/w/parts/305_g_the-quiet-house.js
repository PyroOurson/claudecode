(() => {
  'use strict';
  const ID = 'the-quiet-house';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; };
  const T = (s, o) => { const w = window.gpI18n; if (w && w.t) return w.t(s, o); return o ? s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m)) : s; };
  const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.append(e); return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const mkRng = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fitPR(api, v, hook) {
    const r = v.renderer, c = v.canvas, Q = [1, 0.75, 0.55], sz = new v.THREE.Vector2();
    let lvl = 0, cw = 0, avg = 0.016, t = -2, wait = 8, chk = 0, lf = -1, up = 0;
    const apply = () => {
      const d = Math.min(2, window.devicePixelRatio || 1), B = Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * d * d * 1.05);
      const lw = r.getSize(sz).x || v.w, pr = Math.max(0.5, Math.min(4, d * cw / lw, Math.sqrt(B / (lw * (sz.y || v.h))))) * Q[lvl];
      if (Math.abs(r.getPixelRatio() - pr) > 0.01) r.setPixelRatio(pr);
    };
    const size = () => { const w = c.getBoundingClientRect().width; if (w && Math.abs(w - cw) > Math.max(2, cw * 0.02)) { cw = w; apply(); } };
    const set = n => { lvl = n; t = 0; apply(); if (hook) hook(lvl); };
    r.forceContextLoss = () => {};
    size(); api.on(window, 'resize', size);
    api.loop(dt => {
      const f = r.info.render.frame;
      if (f === lf || !(dt > 0)) return;
      lf = f;
      avg += (dt - avg) * Math.min(1, dt * 1.5); t += dt;
      if (performance.now() - chk > 500) { chk = performance.now(); size(); }
      if (t < 1.5) return;
      if (avg > 0.021 && lvl < Q.length - 1) { if (up && t < 6) wait = Math.min(64, wait * 2); up = 0; set(lvl + 1); }
      else if (avg < 0.0175 && lvl && t > wait) { up = 1; set(lvl - 1); }
    });
    return { get lvl() { return lvl; } };
  }

  const W = 20, D = 14, LY = [-3, 0, 3], CEIL = 2.8, WH = 3.0, WT = 0.07, EYE = 1.6, CREYE = 0.95, PR = 0.27;
  const MAPS = [
    ['......cccccccooooooo', '......cccccccooooooo', '......cccccccooooooo', '......cccccccooooooo', '......cccccccooooooo', '......cccccccooooooo', '......cccccccooooooo',
      '......cccccccvvvvvvv', '......cccccccvvvvvvv', '......Sccccccvvvvvvv', '......Sccccccvvvvvvv', '......Sccccccvvvvvvv', '......Sccccccvvvvvvv', '......cccccccvvvvvvv'],
    ['ppppppkkkkkkkkdddddd', 'ppppppkkkkkkkkdddddd', 'ppppppkkkkkkkkdddddd', 'ppppppkkkkkkkkdddddd', 'ppppppkkkkkkkkdddddd', 'ggggggkkkkkkkkdddddd', 'ggggggkkkkkkkkllllll',
      'gggggguuuhhhhhllllll', 'gggggguuuhhhhhllllll', 'ggggggOuuhhhhSllllll', 'ggggggOuuhhhhSllllll', 'ggggggOuuhhhhSllllll', 'ggggggOuuhhhhSllllll', 'gggggguuuhhhhhllllll'],
    ['......rrrrrbbbmmmmmm', '......rrrrrbbbmmmmmm', '......rrrrrbbbmmmmmm', '......rrrrrbbbmmmmmm', '......rrrrrbbbmmmmmm', '......rrrrrbbbmmmmmm', '......aaaaaaaammmmmm',
      '......aaaaaaaassssss', '......aaaaaaaassssss', '......nnnnnnnOssssss', '......nnnnnnnOssssss', '......nnnnnnnOssssss', '......nnnnnnnOssssss', '......nnnnnnnnssssss']
  ];
  const ROOMS = {
    p: { n: 'Pantry', w: 'pla', f: 'chk' }, k: { n: 'Kitchen', w: 'til', f: 'chk' }, d: { n: 'Dining room', w: 'dam', f: 'dark' }, l: { n: 'Living room', w: 'str', f: 'wood' },
    g: { n: 'Garage', w: 'bri', f: 'con' }, u: { n: 'Back hall', w: 'pla', f: 'wood' }, h: { n: 'Entrance hall', w: 'dam', f: 'dark' },
    r: { n: 'Your room', w: 'flo', f: 'wood' }, b: { n: 'Bathroom', w: 'til', f: 'btl' }, m: { n: 'Keeper’s bedroom', w: 'mau', f: 'dark' }, a: { n: 'Landing', w: 'str', f: 'wood' },
    s: { n: 'Study', w: 'pan', f: 'dark' }, n: { n: 'Nursery', w: 'nur', f: 'wood' }, c: { n: 'Cellar', w: 'sto', f: 'con' }, o: { n: 'Boiler room', w: 'bri', f: 'con' }, v: { n: 'Storeroom', w: 'sto', f: 'con' }
  };
  const STAIRS = [{ lv: 1, x: 13, z: 12, dx: 0, dz: -1, n: 4, w: 'dam' }, { lv: 0, x: 6, z: 9, dx: 0, dz: 1, n: 4, w: 'pla' }];
  const EDGES = [
    [1, 'h', 11, 14, 'front'], [1, 'h', 1, 14, 'roll'], [1, 'h', 2, 14, 'roll'], [1, 'h', 3, 14, 'roll'], [1, 'h', 4, 14, 'roll'],
    [1, 'h', 11, 7, 'd', { s: 1 }], [1, 'h', 7, 7, 'd', { s: 1, hg: 1 }], [1, 'v', 6, 2, 'd', { s: -1 }], [1, 'v', 14, 2, 'o'], [1, 'v', 14, 3, 'o'],
    [1, 'h', 16, 6, 'd', { s: 1 }], [1, 'v', 14, 7, 'o'], [1, 'v', 14, 8, 'o'], [1, 'v', 9, 11, 'd', { s: -1, hg: 1 }], [1, 'v', 6, 7, 'd', { s: -1, lock: 'garageKey' }],
    [1, 'h', 6, 13, 'd', { s: 1, cellar: 1 }], [1, 'h', 2, 5, 'vent'], [1, 'h', 13, 13, 'o'],
    [0, 'h', 6, 9, 'o'], [0, 'v', 13, 3, 'd', { s: 1 }], [0, 'v', 13, 10, 'd', { s: 1, hg: 1 }],
    [2, 'h', 13, 9, 'o'], [2, 'h', 8, 6, 'd', { s: -1, hg: 1 }], [2, 'h', 12, 6, 'd', { s: -1 }], [2, 'v', 14, 6, 'd', { s: 1 }], [2, 'v', 14, 7, 'd', { s: 1, lock: 'studyKey' }],
    [2, 'h', 9, 9, 'd', { s: 1 }], [2, 'v', 14, 2, 'vent'],
    [1, 'h', 8, 0, 'win'], [1, 'h', 11, 0, 'win'], [1, 'h', 17, 0, 'win'], [1, 'v', 20, 3, 'win'], [1, 'v', 20, 8, 'win'], [1, 'v', 20, 12, 'win'], [1, 'h', 17, 14, 'win'],
    [1, 'h', 13, 14, 'win'], [1, 'h', 3, 0, 'win'], [1, 'v', 0, 10, 'win'], [1, 'h', 8, 14, 'win'],
    [2, 'h', 8, 0, 'win'], [2, 'h', 12, 0, 'win'], [2, 'h', 16, 0, 'win'], [2, 'v', 20, 3, 'win'], [2, 'v', 20, 10, 'win'], [2, 'h', 17, 14, 'win'], [2, 'h', 8, 14, 'win'],
    [2, 'h', 11, 14, 'win'], [2, 'v', 6, 2, 'win'], [2, 'v', 6, 11, 'win'], [2, 'v', 6, 7, 'win']
  ];
  const DIFFS = [
    { n: 'Practice', d: 'No Keeper. Walk the house and learn where everything is.', keeper: 0, pat: 1.3, ch: 3, hear: 1, stun: 30, traps: 0, creak: 3, wires: 0, dark: 1.75, code: 1, chain: 0, plug: 1, free: 1 },
    { n: 'Easy', d: 'He is slower and hard of hearing. Fewer locks and traps.', keeper: 1, pat: 1.2, ch: 2.5, hear: 0.7, stun: 30, traps: 0.5, creak: 3, wires: 0, dark: 1.7, code: 0, chain: 0, plug: 0, free: 1 },
    { n: 'Normal', d: 'The whole house. A code lock on the front door.', keeper: 1, pat: 1.4, ch: 3.1, hear: 1, stun: 20, traps: 1, creak: 5, wires: 1, dark: 1.55, code: 1, chain: 0, plug: 1, free: 1.4 },
    { n: 'Hard', d: 'He moves faster and hears more. A chain on the door and more traps.', keeper: 1, pat: 1.55, ch: 3.5, hear: 1.25, stun: 15, traps: 1.5, creak: 7, wires: 2, dark: 1.4, code: 1, chain: 1, plug: 1, free: 1.7 },
    { n: 'Hardest', d: 'He is faster than you can run. Darker, more creaking boards, short stuns.', keeper: 1, pat: 1.8, ch: 4.25, hear: 1.5, stun: 10, traps: 2, creak: 9, wires: 3, dark: 1.2, code: 1, chain: 1, plug: 1, free: 2 }
  ];

  function grain(g, w, h, a, n, lo, hi) {
    for (let i = 0; i < n; i++) {
      const v = Math.random() < .5 ? (lo == null ? 0 : lo) : (hi == null ? 255 : hi);
      g.fillStyle = `rgba(${v},${v},${v},${(Math.random() * a).toFixed(3)})`;
      g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  }
  function stains(g, w, h, n, col, a) {
    for (let i = 0; i < n; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 20 + Math.random() * 90, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  function drips(g, w, h, n, a) {
    for (let i = 0; i < n; i++) {
      const x = Math.random() * w, l = 60 + Math.random() * 260, gr = g.createLinearGradient(0, 0, 0, l), wd = 3 + Math.random() * 10;
      gr.addColorStop(0, `rgba(40,30,20,${a})`); gr.addColorStop(1, 'rgba(40,30,20,0)');
      g.fillStyle = gr; g.fillRect(x, 0, wd, l);
    }
  }
  function dado(g, w, h, top, base) {
    const y0 = Math.round(h * (1 - 0.9 / 2.8));
    g.fillStyle = base; g.fillRect(0, y0, w, h - y0);
    for (let x = 0; x < w; x += 128) {
      g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + 14, y0 + 22, 100, h - y0 - 56);
      g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x + 16, y0 + 24, 96, 3);
      g.fillStyle = base; g.fillRect(x + 20, y0 + 28, 88, h - y0 - 68);
    }
    g.fillStyle = top; g.fillRect(0, y0 - 6, w, 12);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y0 - 6, w, 2);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y0 + 6, w, 3);
    for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(0,0,0,${(Math.random() * .08).toFixed(3)})`; g.fillRect(x, y0 + 6, 2, h - y0); }
  }
  function damask(g, w, h, fg, sx, sy) {
    g.fillStyle = fg;
    for (let row = 0, y = 0; y < h + sy; y += sy, row++) for (let x = (row % 2) * sx / 2; x < w + sx; x += sx) {
      g.save(); g.translate(x, y);
      g.beginPath(); g.ellipse(0, 0, sx * .16, sy * .3, 0, 0, TAU); g.fill();
      for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * sx * .2, -sy * .08, sx * .1, sy * .14, s * .7, 0, TAU); g.fill(); g.beginPath(); g.ellipse(s * sx * .16, sy * .2, sx * .07, sy * .1, -s * .5, 0, TAU); g.fill(); }
      g.beginPath(); g.moveTo(0, -sy * .46); g.lineTo(sx * .05, -sy * .32); g.lineTo(0, -sy * .26); g.lineTo(-sx * .05, -sy * .32); g.fill();
      g.beginPath(); g.moveTo(0, sy * .46); g.lineTo(sx * .05, sy * .34); g.lineTo(0, sy * .3); g.lineTo(-sx * .05, sy * .34); g.fill();
      g.restore();
    }
  }
  const PAINT = {
    dam(g, w, h) { g.fillStyle = '#4f1c21'; g.fillRect(0, 0, w, h); damask(g, w, h, '#62272b', 128, 150); grain(g, w, h, .1, 5000); drips(g, w, h * .7, 6, .25); stains(g, w, h, 6, '30,18,10', .25); dado(g, w, h, '#2e1c12', '#3a2416'); },
    str(g, w, h) { g.fillStyle = '#34402f'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = '#3e4c37'; g.fillRect(x, 0, 32, h); g.fillStyle = 'rgba(160,140,80,.35)'; g.fillRect(x + 31, 0, 2, h); } grain(g, w, h, .1, 5000); drips(g, w, h * .6, 5, .22); stains(g, w, h, 6, '30,24,10', .22); dado(g, w, h, '#2c2015', '#38281a'); },
    flo(g, w, h) {
      g.fillStyle = '#4e6176'; g.fillRect(0, 0, w, h);
      for (let row = 0, y = 20; y < h; y += 64, row++) for (let x = (row % 2) * 32 + 16; x < w; x += 64) {
        for (let k = 0; k < 5; k++) { const a = k * TAU / 5; g.fillStyle = '#7d8fa6'; g.beginPath(); g.ellipse(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5, 3, a, 0, TAU); g.fill(); }
        g.fillStyle = '#b8a77c'; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill();
        g.strokeStyle = '#5f7a6a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 6, y + 8); g.quadraticCurveTo(x + 18, y + 16, x + 14, y + 28); g.stroke();
      }
      grain(g, w, h, .1, 5000); drips(g, w, h * .7, 7, .25); stains(g, w, h, 8, '40,30,20', .25);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - 40, w, 40);
    },
    nur(g, w, h) {
      g.fillStyle = '#9c7d76'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 48) { g.fillStyle = '#a98a83'; g.fillRect(x, 0, 24, h); }
      const by = Math.round(h * (1 - 1.25 / 2.8));
      g.fillStyle = '#d2c4a8'; g.fillRect(0, by - 30, w, 60); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, by + 28, w, 3);
      for (let x = 30; x < w; x += 85) { const c = ['#8f5a5a', '#5a7a8f', '#8f8a5a'][(x / 85 | 0) % 3]; g.fillStyle = c; g.beginPath(); g.ellipse(x, by - 6, 11, 14, 0, 0, TAU); g.fill(); g.strokeStyle = '#6b5a4a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, by + 8); g.quadraticCurveTo(x + 6, by + 18, x, by + 26); g.stroke(); }
      grain(g, w, h, .1, 5000); drips(g, w, h * .8, 9, .3); stains(g, w, h, 10, '50,35,25', .3);
    },
    mau(g, w, h) { g.fillStyle = '#3c2639'; g.fillRect(0, 0, w, h); damask(g, w, h, '#4b3047', 100, 120); grain(g, w, h, .1, 5000); drips(g, w, h * .6, 5, .25); stains(g, w, h, 6, '20,10,18', .3); dado(g, w, h, '#24160f', '#2e1d14'); },
    pla(g, w, h) {
      g.fillStyle = '#7d7464'; g.fillRect(0, 0, w, h); grain(g, w, h, .14, 9000); stains(g, w, h, 12, '60,50,35', .3); drips(g, w, h * .8, 8, .3);
      g.strokeStyle = 'rgba(30,25,20,.5)'; g.lineWidth = 1;
      for (let i = 0; i < 4; i++) { let x = Math.random() * w, y = Math.random() * h * .6; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (Math.random() - .5) * 26; y += 8 + Math.random() * 14; g.lineTo(x, y); } g.stroke(); }
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h - 36, w, 36);
    },
    til(g, w, h) {
      g.fillStyle = '#88897f'; g.fillRect(0, 0, w, h); grain(g, w, h, .12, 6000); stains(g, w, h * .5, 8, '60,55,40', .3);
      const ty = Math.round(h * (1 - 1.5 / 2.8)), s = 38;
      g.fillStyle = '#5e5d55'; g.fillRect(0, ty - 4, w, h - ty + 4);
      for (let y = ty; y < h; y += s) for (let x = 0; x < w; x += s) { const v = 182 + Math.random() * 22 | 0; g.fillStyle = `rgb(${v},${v},${v - 10})`; g.fillRect(x + 2, y + 2, s - 4, s - 4); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 3, y + 3, s - 8, 3); }
      g.fillStyle = '#4a6a6a'; g.fillRect(0, ty - 10, w, 10);
      stains(g, w, h, 6, '70,60,40', .25); grain(g, w, h, .08, 4000);
    },
    pan(g, w, h) {
      g.fillStyle = '#3b2617'; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 128) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 12, 40, 104, h * .55); g.fillRect(x + 12, h * .62 + 10, 104, h * .3); g.fillStyle = '#45301d'; g.fillRect(x + 18, 46, 92, h * .55 - 12); g.fillRect(x + 18, h * .62 + 16, 92, h * .3 - 12); g.fillStyle = 'rgba(255,220,170,.05)'; g.fillRect(x + 18, 46, 92, 3); }
      for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(0,0,0,${(Math.random() * .1).toFixed(3)})`; g.fillRect(0, y, w, 1); }
      grain(g, w, h, .08, 4000);
    },
    bri(g, w, h) {
      g.fillStyle = '#3e352e'; g.fillRect(0, 0, w, h);
      const bw = 64, bh = 20;
      for (let row = 0, y = 0; y < h; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < w; x += bw) { const v = Math.random(); g.fillStyle = `rgb(${92 + v * 30 | 0},${50 + v * 18 | 0},${38 + v * 12 | 0})`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x + 2, y + bh - 6, bw - 4, 4); }
      grain(g, w, h, .15, 8000); stains(g, w, h, 14, '20,18,15', .4); drips(g, w, h, 6, .3);
    },
    sto(g, w, h) {
      g.fillStyle = '#35332f'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h;) { const bh = 40 + Math.random() * 40 | 0; for (let x = -Math.random() * 60; x < w;) { const bw = 60 + Math.random() * 90 | 0, v = Math.random(); g.fillStyle = `rgb(${78 + v * 26 | 0},${75 + v * 24 | 0},${68 + v * 22 | 0})`; g.beginPath(); g.roundRect ? g.roundRect(x + 3, y + 3, bw - 6, bh - 6, 8) : g.rect(x + 3, y + 3, bw - 6, bh - 6); g.fill(); x += bw; } y += bh; }
      grain(g, w, h, .18, 10000); stains(g, w, h, 16, '20,22,18', .4); drips(g, w, h, 8, .35);
    },
    ext(g, w, h) { g.fillStyle = '#2a2d31'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 36) { g.fillStyle = '#33373c'; g.fillRect(0, y, w, 30); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y + 30, w, 6); } grain(g, w, h, .15, 6000); },
    wood(g, w, h, dk) {
      const base = dk ? [62, 42, 28] : [104, 72, 44];
      g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, w, h);
      const pw = 46;
      for (let x = 0; x < w; x += pw) {
        let y = -Math.random() * 300;
        while (y < h) {
          const l = 180 + Math.random() * 260, v = .78 + Math.random() * .34;
          g.fillStyle = `rgb(${base[0] * v | 0},${base[1] * v | 0},${base[2] * v | 0})`; g.fillRect(x + 1, y + 1, pw - 2, l - 2);
          for (let k = 0; k < 7; k++) { g.fillStyle = `rgba(0,0,0,${(.05 + Math.random() * .08).toFixed(3)})`; g.fillRect(x + 3 + Math.random() * (pw - 6), y, 1.5, l); }
          g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, y, pw, 2);
          y += l;
        }
        g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(x, 0, 2, h);
      }
      grain(g, w, h, .1, 6000); stains(g, w, h, 6, '20,12,6', .3);
    },
    dark(g, w, h) { PAINT.wood(g, w, h, 1); },
    chk(g, w, h) { const s = 64; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { const k = ((x + y) / s) % 2, v = Math.random() * 14; g.fillStyle = k ? `rgb(${36 + v},${34 + v},${30 + v})` : `rgb(${170 + v},${162 + v},${140 + v})`; g.fillRect(x, y, s, s); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y, s, 2); g.fillRect(x, y, 2, s); } grain(g, w, h, .12, 7000); stains(g, w, h, 10, '50,40,25', .3); },
    btl(g, w, h) { const s = 26; g.fillStyle = '#4c5250'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { const v = Math.random() * 16; g.fillStyle = `rgb(${150 + v},${164 + v},${164 + v})`; g.fillRect(x + 1.5, y + 1.5, s - 3, s - 3); } grain(g, w, h, .1, 5000); stains(g, w, h, 8, '60,55,40', .3); },
    con(g, w, h) { g.fillStyle = '#4e4c48'; g.fillRect(0, 0, w, h); grain(g, w, h, .2, 14000); stains(g, w, h, 18, '25,24,22', .35); g.strokeStyle = 'rgba(20,20,18,.6)'; g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { let x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 10; k++) { x += (Math.random() - .5) * 40; y += (Math.random() - .5) * 40; g.lineTo(x, y); } g.stroke(); } },
    ceil(g, w, h) { g.fillStyle = '#7f7b70'; g.fillRect(0, 0, w, h); grain(g, w, h, .12, 8000); stains(g, w, h, 10, '70,55,35', .35); for (let i = 0; i < 3; i++) { const x = Math.random() * w, y = Math.random() * h; g.strokeStyle = 'rgba(80,60,35,.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 40 + Math.random() * 40, 30 + Math.random() * 30, Math.random(), 0, TAU); g.stroke(); } }
  };
  function paintGrain(g, s) { g.fillStyle = '#d8d0c4'; g.fillRect(0, 0, s, s); for (let x = 0; x < s; x += 1) { const v = Math.sin(x * .21) * .5 + Math.sin(x * .053) * .5; g.fillStyle = `rgba(60,40,20,${(.08 + v * .06 + Math.random() * .05).toFixed(3)})`; g.fillRect(x, 0, 1, s); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(60,40,20,.12)'; g.fillRect(Math.random() * s, 0, 1 + Math.random() * 2, s); } grain(g, s, s, .08, 2000); }
  function paintFabric(g, s) { g.fillStyle = '#d6d2cc'; g.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 2) { g.fillStyle = `rgba(0,0,0,${(.04 + Math.random() * .05).toFixed(3)})`; g.fillRect(0, y, s, 1); } for (let x = 0; x < s; x += 2) { g.fillStyle = `rgba(0,0,0,${(.03 + Math.random() * .04).toFixed(3)})`; g.fillRect(x, 0, 1, s); } grain(g, s, s, .1, 3000); stains(g, s, s, 4, '40,30,20', .15); }
  function paintPlain(g, s) { g.fillStyle = '#dcdcd8'; g.fillRect(0, 0, s, s); grain(g, s, s, .08, 3000); stains(g, s, s, 5, '50,45,35', .18); }
  function paintDoor(g, w, h) {
    g.fillStyle = '#cfc4b4'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x++) { g.fillStyle = `rgba(70,45,20,${(.06 + Math.random() * .06).toFixed(3)})`; g.fillRect(x, 0, 1, h); }
    const P = [[28, 30, 84, 190], [144, 30, 84, 190], [28, 260, 84, 220], [144, 260, 84, 220]];
    for (const [x, y, pw, ph] of P) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y, pw, ph); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + pw - 4, y, 4, ph); g.fillRect(x, y + ph - 4, pw, 4); g.fillStyle = '#c4b8a6'; g.fillRect(x + 8, y + 8, pw - 16, ph - 16); }
    grain(g, w, h, .08, 2500); stains(g, w, h, 5, '40,30,20', .2);
  }
  function paintWindow(g, w, h) {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b3a55'); gr.addColorStop(.6, '#18223a'); gr.addColorStop(1, '#0c1220');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(200,215,255,.5)'; g.beginPath(); g.arc(w * .72, h * .2, 9, 0, TAU); g.fill();
    g.fillStyle = '#05080e';
    for (let i = 0; i < 9; i++) { const x = (i / 8) * w + (Math.random() - .5) * 20, th = h * (.35 + Math.random() * .35), tw = 16 + Math.random() * 18; g.beginPath(); g.moveTo(x, h * .62 - th); g.lineTo(x + tw, h * .7); g.lineTo(x - tw, h * .7); g.fill(); }
    g.fillRect(0, h * .68, w, h);
    for (let i = 0; i < 70; i++) { const x = Math.random() * w, y = Math.random() * h, l = 6 + Math.random() * 22; g.strokeStyle = `rgba(180,200,240,${(.08 + Math.random() * .2).toFixed(3)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1, y + l); g.stroke(); }
    g.strokeStyle = '#2a2018'; g.lineWidth = 8; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  }
  function paintFace(g, s) {
    const gr = g.createRadialGradient(s * .5, s * .45, s * .05, s * .5, s * .5, s * .55); gr.addColorStop(0, '#e6e0d4'); gr.addColorStop(.7, '#c9c1b2'); gr.addColorStop(1, '#8f8676');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    grain(g, s, s, .08, 1500);
    g.strokeStyle = 'rgba(90,80,70,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(s * .62, s * .1); g.lineTo(s * .58, s * .25); g.lineTo(s * .64, s * .34); g.stroke();
    for (const x of [s * .36, s * .64]) {
      const eg = g.createRadialGradient(x, s * .44, 1, x, s * .44, s * .1); eg.addColorStop(0, '#050404'); eg.addColorStop(.6, '#1a1512'); eg.addColorStop(1, 'rgba(60,50,40,0)');
      g.fillStyle = eg; g.beginPath(); g.ellipse(x, s * .44, s * .1, s * .075, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,236,190,.95)'; g.beginPath(); g.arc(x, s * .445, s * .012, 0, TAU); g.fill();
    }
    g.strokeStyle = 'rgba(70,40,40,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(s * .38, s * .72); g.quadraticCurveTo(s * .5, s * .76, s * .62, s * .71); g.stroke();
    g.strokeStyle = 'rgba(90,80,70,.45)'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { const x = s * (.4 + i * .05); g.beginPath(); g.moveTo(x, s * .7); g.lineTo(x + 1, s * .77); g.stroke(); }
    g.fillStyle = 'rgba(90,80,70,.25)'; g.beginPath(); g.ellipse(s * .5, s * .58, s * .03, s * .05, 0, 0, TAU); g.fill();
  }
  function paintPortrait(g, s, seed) {
    const r = mkRng(seed), bgc = ['#2b2a20', '#1f2a2a', '#2a1f24', '#262420'][seed % 4];
    g.fillStyle = bgc; g.fillRect(0, 0, s, s * 1.3);
    const gr = g.createRadialGradient(s * .5, s * .45, 10, s * .5, s * .5, s * .8); gr.addColorStop(0, 'rgba(120,100,70,.35)'); gr.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = gr; g.fillRect(0, 0, s, s * 1.3);
    const coat = ['#1c1a1a', '#2c2418', '#1a2230', '#30201c'][(r() * 4) | 0];
    g.fillStyle = coat; g.beginPath(); g.ellipse(s * .5, s * 1.25, s * .42, s * .5, 0, 0, TAU); g.fill();
    g.fillStyle = '#b8ad98'; g.beginPath(); g.ellipse(s * .5, s * .52, s * .16, s * .21, 0, 0, TAU); g.fill();
    g.fillStyle = ['#2a1c12', '#5a4a3a', '#16120f', '#8a8070'][(r() * 4) | 0]; g.beginPath(); g.ellipse(s * .5, s * .4, s * .18, s * .14, 0, Math.PI, TAU); g.fill();
    g.fillStyle = 'rgba(20,14,10,.85)'; for (const x of [.44, .56]) { g.beginPath(); g.ellipse(s * x, s * .52, s * .028, s * .018, 0, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(60,30,30,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(s * .45, s * .63); g.lineTo(s * .55, s * .63); g.stroke();
    if (r() < .5) { g.strokeStyle = 'rgba(10,8,6,.9)'; g.lineWidth = 6; g.beginPath(); g.moveTo(s * .35, s * .42); g.lineTo(s * .65, s * .68); g.moveTo(s * .65, s * .42); g.lineTo(s * .35, s * .68); g.stroke(); }
    grain(g, s, s * 1.3, .15, 3000); for (let i = 0; i < 300; i++) { g.strokeStyle = 'rgba(255,240,200,.04)'; g.beginPath(); const x = r() * s, y = r() * s * 1.3; g.moveTo(x, y); g.lineTo(x + 8, y + 3); g.stroke(); }
  }
  function paintClue(g, s, num, dig) {
    g.clearRect(0, 0, s, s);
    g.save(); g.translate(s / 2, s / 2); g.rotate(-.06);
    g.font = `700 ${s * .26}px Georgia, 'Times New Roman', serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(230,228,215,.85)'; g.fillText(num, 0, -s * .22);
    g.fillRect(-s * .3, -s * .06, s * .6, s * .025);
    g.font = `700 ${s * .4}px Georgia, 'Times New Roman', serif`; g.fillText(String(dig), 0, s * .18);
    g.restore();
    for (let i = 0; i < 900; i++) { g.clearRect(Math.random() * s, Math.random() * s, 2, 1); }
  }
  function paintNote(g, w, h, lines) {
    g.fillStyle = '#d9ceb2'; g.fillRect(0, 0, w, h); stains(g, w, h, 4, '120,90,50', .25); grain(g, w, h, .08, 1500);
    g.fillStyle = '#2a2420'; g.font = `600 ${h * .1}px Georgia, serif`; g.textAlign = 'center';
    lines.forEach((l, i) => g.fillText(l, w / 2, h * (.2 + i * .16)));
  }
  function paintRug(g, s, c1, c2) {
    g.fillStyle = c1; g.fillRect(0, 0, s, s);
    g.strokeStyle = c2; g.lineWidth = 10; g.strokeRect(14, 14, s - 28, s - 28); g.lineWidth = 3; g.strokeRect(34, 34, s - 68, s - 68);
    g.fillStyle = c2; for (let i = 0; i < 6; i++) { g.save(); g.translate(s / 2, s / 2); g.rotate(i * TAU / 6); g.beginPath(); g.ellipse(0, s * .16, s * .05, s * .14, 0, 0, TAU); g.fill(); g.restore(); }
    g.beginPath(); g.arc(s / 2, s / 2, s * .06, 0, TAU); g.fill();
    for (let y = 0; y < s; y += 2) { g.fillStyle = `rgba(0,0,0,${(Math.random() * .08).toFixed(3)})`; g.fillRect(0, y, s, 1); }
    grain(g, s, s, .12, 4000); stains(g, s, s, 6, '20,15,10', .3);
  }
  function paintBooks(g, w, h) {
    g.fillStyle = '#1a120c'; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 4; row++) { let x = 0; const y0 = row * h / 4; while (x < w) { const bw = 6 + Math.random() * 12, bh = h / 4 * (.6 + Math.random() * .32), v = Math.random(); g.fillStyle = ['#5a2a22', '#2a3a4a', '#3a4a2a', '#5a4a2a', '#3a2a3a', '#6a5a40'][(v * 6) | 0]; g.fillRect(x, y0 + h / 4 - bh - 4, bw - 1, bh); g.fillStyle = 'rgba(220,190,120,.35)'; g.fillRect(x + 1, y0 + h / 4 - bh + 6, bw - 3, 2); x += bw; } g.fillStyle = '#2b1d12'; g.fillRect(0, y0 + h / 4 - 4, w, 4); }
    grain(g, w, h, .1, 2000);
  }
  function paintStatic(g, w, h) { const d = g.createImageData(w, h); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 200 | 0; d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v + 20; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }

  const cellAt = (lv, i, j) => (i < 0 || j < 0 || i >= W || j >= D || lv < 0 || lv > 2) ? '.' : MAPS[lv][j][i];
  const E_OPEN = 0, E_WALL = 1, E_DOOR = 2, E_ARCH = 3, E_WIN = 4, E_VENT = 5, E_FRONT = 6, E_ROLL = 7;
  const EV = [0, 1, 2].map(() => new Int8Array((W + 1) * D)), EH = [0, 1, 2].map(() => new Int8Array(W * (D + 1)));
  const XV = [0, 1, 2].map(() => new Int16Array((W + 1) * D).fill(-1)), XH = [0, 1, 2].map(() => new Int16Array(W * (D + 1)).fill(-1));
  const SC = [0, 1, 2].map(() => new Int8Array(W * D));
  STAIRS.forEach((s, k) => { for (let q = 0; q < s.n; q++) { const i = s.x + s.dx * q, j = s.z + s.dz * q; SC[s.lv][j * W + i] = k + 1; SC[s.lv + 1][j * W + i] = k + 1; } });
  for (let lv = 0; lv < 3; lv++) {
    for (let j = 0; j < D; j++) for (let x = 0; x <= W; x++) { const a = cellAt(lv, x - 1, j), b = cellAt(lv, x, j); EV[lv][j * (W + 1) + x] = a === b ? E_OPEN : E_WALL; }
    for (let z = 0; z <= D; z++) for (let i = 0; i < W; i++) { const a = cellAt(lv, i, z - 1), b = cellAt(lv, i, z); EH[lv][z * W + i] = a === b ? E_OPEN : E_WALL; }
  }
  const ET = { d: E_DOOR, o: E_ARCH, win: E_WIN, vent: E_VENT, front: E_FRONT, roll: E_ROLL };
  EDGES.forEach((e, k) => { const [lv, ax, x, z, t] = e; if (ax === 'v') { EV[lv][z * (W + 1) + x] = ET[t]; XV[lv][z * (W + 1) + x] = k; } else { EH[lv][z * W + x] = ET[t]; XH[lv][z * W + x] = k; } });
  const evAt = (lv, x, j) => (j < 0 || j >= D || x < 0 || x > W) ? E_WALL : EV[lv][j * (W + 1) + x];
  const ehAt = (lv, i, z) => (i < 0 || i >= W || z < 0 || z > D) ? E_WALL : EH[lv][z * W + i];
  const stairOf = (lv, i, j) => (i < 0 || j < 0 || i >= W || j >= D) ? 0 : SC[lv][j * W + i];
  const stairT = (s, x, z) => s.dz ? (z - (s.dz > 0 ? s.z : s.z + 1)) * s.dz : (x - (s.dx > 0 ? s.x : s.x + 1)) * s.dx;
  function groundY(lv, x, z) { const k = stairOf(lv, Math.floor(x), Math.floor(z)); if (k) { const s = STAIRS[k - 1]; return LY[s.lv] + WH * clamp(stairT(s, x, z) / s.n, 0, 1); } return LY[lv]; }
  function levelAt(lv, x, z, y) { const k = stairOf(lv, Math.floor(x), Math.floor(z)); if (!k) return lv; const s = STAIRS[k - 1]; return y > LY[s.lv] + 1.5 ? s.lv + 1 : s.lv; }
  const roomKey = (lv, i, j) => { const c = cellAt(lv, i, j); if (c === 'S' || c === 'O') { const k = stairOf(lv, i, j); return k ? 'st' + (k - 1) : '.'; } return c; };
  const wallStyle = (lv, i, j) => { const c = cellAt(lv, i, j); if (c === '.') return lv === 0 ? null : 'ext'; if (c === 'S' || c === 'O') { const k = stairOf(lv, i, j); return k ? STAIRS[k - 1].w : 'pla'; } return ROOMS[c].w; };
  const passLight = t => t === E_OPEN || t === E_DOOR || t === E_ARCH || t === E_FRONT;
  function gridRay(lv, ax, az, bx, bz, pass) {
    let i = Math.floor(ax), j = Math.floor(az);
    const ti = Math.floor(bx), tj = Math.floor(bz), dx = bx - ax, dz = bz - az;
    const sx = dx > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    const tdx = dx ? Math.abs(1 / dx) : Infinity, tdz = dz ? Math.abs(1 / dz) : Infinity;
    let tmx = dx ? (sx > 0 ? (i + 1 - ax) : (ax - i)) * tdx : Infinity, tmz = dz ? (sz > 0 ? (j + 1 - az) : (az - j)) * tdz : Infinity;
    for (let n = 0; n < 64 && (i !== ti || j !== tj); n++) {
      if (tmx < tmz) { const x = sx > 0 ? i + 1 : i; if (!pass(EV[lv][j * (W + 1) + x], 'v', x, j, tmx)) return false; i += sx; tmx += tdx; }
      else { const z = sz > 0 ? j + 1 : j; if (!pass(EH[lv][z * W + i], 'h', i, z, tmz)) return false; j += sz; tmz += tdz; }
      if (i < 0 || j < 0 || i >= W || j >= D) return false;
    }
    return true;
  }
  const lightPass = t => passLight(t);

  function buildHouse(THREE, own, tex, renderer) {
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const mkT = (w, h, paint, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = own(new THREE.CanvasTexture(c)); t.wrapS = t.wrapT = rep === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso; return t; };
    const bakeU = { value: 1 };
    const patch = (m, probe) => {
      m.onBeforeCompile = sh => {
        sh.uniforms.uBake = bakeU;
        if (probe) sh.uniforms.uProbe = m.userData.probe;
        sh.vertexShader = (probe ? '' : 'attribute vec3 bake;\nvarying vec3 vBake;\n') + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + (probe ? '' : 'vBake = bake;'));
        sh.fragmentShader = 'uniform float uBake;\n' + (probe ? 'uniform vec3 uProbe;\n' : 'varying vec3 vBake;\n') + sh.fragmentShader.replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\nirradiance += ' + (probe ? 'uProbe' : 'vBake') + ' * (3.14159265 * uBake);');
      };
      m.customProgramCacheKey = () => probe ? 'qh-probe' : 'qh-bake';
      return m;
    };
    const bakeMat = o => own(patch(new THREE.MeshPhongMaterial(Object.assign({ shininess: 6, specular: 0x111111, vertexColors: true }, o)), false));
    const probeMat = o => { const m = new THREE.MeshPhongMaterial(Object.assign({ shininess: 10, specular: 0x222222 }, o)); m.userData.probe = { value: new THREE.Color(0.1, 0.1, 0.1) }; return own(patch(m, true)); };
    const TX = {};
    for (const k of ['dam', 'str', 'flo', 'nur', 'mau', 'pla', 'til', 'pan', 'bri', 'sto', 'ext']) TX[k] = mkT(512, 720, PAINT[k]);
    for (const k of ['wood', 'dark', 'chk', 'btl', 'con', 'ceil']) TX[k] = mkT(512, 512, PAINT[k]);
    TX.grain = mkT(256, 256, (g, s) => paintGrain(g, s)); TX.fabric = mkT(256, 256, (g, s) => paintFabric(g, s)); TX.plain = mkT(256, 256, (g, s) => paintPlain(g, s));
    TX.door = mkT(256, 512, paintDoor, false); TX.win = mkT(128, 192, paintWindow, false); TX.books = mkT(256, 256, paintBooks);
    TX.rugA = mkT(256, 256, (g, s) => paintRug(g, s, '#4a1e1e', '#a07a4a'), false); TX.rugB = mkT(256, 256, (g, s) => paintRug(g, s, '#1e2c3a', '#8a7a5a'), false); TX.rugC = mkT(256, 256, (g, s) => paintRug(g, s, '#3a3020', '#6a2a2a'), false);
    for (let i = 0; i < 4; i++) TX['por' + i] = mkT(128, 166, (g, w) => paintPortrait(g, w, i + 3), false);
    const M = {};
    for (const k of ['dam', 'str', 'flo', 'nur', 'mau', 'pla', 'til', 'pan', 'bri', 'sto', 'ext', 'wood', 'dark', 'chk', 'btl', 'con', 'ceil']) M[k] = bakeMat({ map: TX[k] });
    M.w = bakeMat({ map: TX.grain }); M.f = bakeMat({ map: TX.fabric }); M.p = bakeMat({ map: TX.plain, shininess: 30, specular: 0x333333 }); M.m = bakeMat({ shininess: 60, specular: 0x666666 });
    M.k = bakeMat({ map: TX.books }); M.win = bakeMat({ map: TX.win, emissive: 0x0a1222, emissiveMap: TX.win });
    for (const k of ['rugA', 'rugB', 'rugC', 'por0', 'por1', 'por2', 'por3']) M[k] = bakeMat({ map: TX[k] });
    M.g = own(new THREE.MeshBasicMaterial({ vertexColors: true }));
    const ACC = [0, 1, 2].map(() => ({}));
    const acc = (lv, k) => ACC[lv][k] || (ACC[lv][k] = { P: [], N: [], U: [], C: [], F: [] });
    const LAMPS = [[], [], []], COLL = [[], [], []], HIDES = [], DRAWERS = [], WARD = [], SPOTS = {}, FIX = [], DYN = [];
    const lin = new THREE.Color();
    const tint = hex => { lin.set(hex).convertSRGBToLinear(); return [lin.r, lin.g, lin.b]; };
    const WHITE = [1, 1, 1];
    function quad(a, k, p0, p1, p2, p3, n, uv, col, flag) {
      const c = col || WHITE;
      for (const [p, u] of [[p0, uv[0]], [p1, uv[1]], [p2, uv[2]], [p0, uv[0]], [p2, uv[2]], [p3, uv[3]]]) { a.P.push(p[0], p[1], p[2]); a.N.push(n[0], n[1], n[2]); a.U.push(u[0], u[1]); a.C.push(c[0], c[1], c[2]); a.F.push(flag || 0); }
    }
    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = new THREE.Vector3(), s4 = new THREE.Vector3(), nm3 = new THREE.Matrix3();
    function addGeo(a, g, pos, rot, scl, col, uvk, flag) {
      const t = g.index ? g.toNonIndexed() : g;
      m4.compose(v4.set(pos[0], pos[1], pos[2]), q4.setFromEuler(e4.set(rot[0], rot[1], rot[2], 'YXZ')), s4.set(scl[0], scl[1], scl[2]));
      nm3.getNormalMatrix(m4);
      const P = t.attributes.position, N = t.attributes.normal, c = col || WHITE, k = uvk || 1, pv = new THREE.Vector3(), nv = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) {
        pv.set(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(m4); nv.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(nm3).normalize();
        a.P.push(pv.x, pv.y, pv.z); a.N.push(nv.x, nv.y, nv.z);
        const ax = Math.abs(nv.x), ay = Math.abs(nv.y), az = Math.abs(nv.z);
        if (ay >= ax && ay >= az) a.U.push(pv.x * k, pv.z * k); else if (ax >= az) a.U.push(pv.z * k, pv.y * k); else a.U.push(pv.x * k, pv.y * k);
        a.C.push(c[0], c[1], c[2]); a.F.push(flag || 0);
      }
      if (t !== g) t.dispose();
    }
    const GB = own(new THREE.BoxGeometry(1, 1, 1)), GCC = {}, GC = n => GCC[n] || (GCC[n] = own(new THREE.CylinderGeometry(1, 1, 1, n))), GS = own(new THREE.SphereGeometry(1, 10, 8));
    const GCN = {}, gcone = (rt, rb, n, open) => { const key = rt + '|' + rb + '|' + n + '|' + (open ? 1 : 0); return GCN[key] || (GCN[key] = own(new THREE.CylinderGeometry(rt, rb, 1, n, 1, !!open))); };
    function pc(lv, x, z, r, room) {
      const th = (r || 0) * Math.PI / 2, cs = Math.cos(th), sn = Math.sin(th), y0 = LY[lv];
      const tw = (lx, lz) => [x + lx * cs + lz * sn, z - lx * sn + lz * cs];
      const P = {
        lv, x, z, r: r || 0, th, y0, tw,
        box(lx, ly, lz, sx, sy, sz, ch, col, coll, rx, ry, rz) { const [wx, wz] = tw(lx, lz); addGeo(acc(lv, ch), GB, [wx, y0 + ly, wz], [rx || 0, th + (ry || 0), rz || 0], [sx, sy, sz], col ? tint(col) : null, ch === 'k' ? 1.6 : 1.6, 1); if (coll) P.col(lx, lz, sx, sz); return P; },
        cyl(lx, ly, lz, rr, h, n, ch, col, rt, rx, rz) { const [wx, wz] = tw(lx, lz); const g = rt != null ? gcone(rt, 1, n || 12) : GC(n || 12); addGeo(acc(lv, ch), g, [wx, y0 + ly, wz], [rx || 0, th, rz || 0], [rr, h, rr], col ? tint(col) : null, 1.6, 1); return P; },
        sph(lx, ly, lz, sx, sy, sz, ch, col) { const [wx, wz] = tw(lx, lz); addGeo(acc(lv, ch), GS, [wx, y0 + ly, wz], [0, th, 0], [sx, sy, sz], col ? tint(col) : null, 1.6, 1); return P; },
        col(lx, lz, sx, sz, fl) { const [wx, wz] = tw(lx, lz), odd = (r || 0) % 2, hx = (odd ? sz : sx) / 2, hz = (odd ? sx : sz) / 2; COLL[lv].push({ x0: wx - hx, z0: wz - hz, x1: wx + hx, z1: wz + hz, f: (fl || 1) | 16, on: true }); return P; },
        lamp(lx, ly, lz, p, R, c, r0) { const [wx, wz] = tw(lx, lz); const cl = tint(c || '#ffb86a'); LAMPS[lv].push({ x: wx, y: y0 + ly, z: wz, p, R, R2: R * R, r02: (r0 || 1.1) * (r0 || 1.1), c: cl, room: roomKey(lv, Math.floor(wx), Math.floor(wz)) }); return P; },
        spot(id, lx, ly, lz, surf, extra) { const [wx, wz] = tw(lx, lz); SPOTS[id] = Object.assign({ id, lv, x: wx, y: y0 + ly, z: wz, surf: surf || 'hard', room: roomKey(lv, Math.floor(wx), Math.floor(wz)) }, extra || {}); return P; },
        world(lx, ly, lz) { const [wx, wz] = tw(lx, lz); return new THREE.Vector3(wx, y0 + ly, wz); }
      };
      return P;
    }
    const WOOD = '#5a3a22', DWOOD = '#3a2616', TRIM = '#2c1d12';
    const F = {
      legs(p, w, d, h, t, col, ly) { for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box(sx * (w / 2 - t / 2), (ly || 0) + h / 2, sz * (d / 2 - t / 2), t, h, t, 'w', col); },
      table(p, w, d, h, col) { p.box(0, h - 0.025, 0, w, 0.05, d, 'w', col || WOOD); p.box(0, h - 0.09, 0, w - 0.1, 0.08, d - 0.1, 'w', col || WOOD); F.legs(p, w - 0.08, d - 0.08, h - 0.05, 0.06, col || WOOD); p.col(0, 0, w, d); return p; },
      chair(p, col) { const c = col || DWOOD; p.box(0, 0.45, 0, 0.44, 0.04, 0.42, 'w', c); F.legs(p, 0.4, 0.38, 0.43, 0.04, c); p.box(0, 0.75, -0.19, 0.42, 0.56, 0.04, 'w', c); p.box(0, 0.95, -0.19, 0.46, 0.08, 0.05, 'w', c); p.col(0, 0, 0.44, 0.44); return p; },
      bed(p, w, col, cover, id) {
        const L = 2.0, c = col || WOOD;
        F.legs(p, w + 0.04, L, 0.32, 0.07, c); p.box(0, 0.36, 0, w + 0.04, 0.14, L, 'w', c);
        p.box(0, 0.53, 0.02, w - 0.04, 0.2, L - 0.08, 'f', '#b9b2a2'); p.box(0, 0.66, -L / 2 + 0.26, w - 0.2, 0.1, 0.36, 'f', '#d8d2c4');
        p.box(0, 0.62, 0.28, w + 0.06, 0.1, L * 0.62, 'f', cover || '#6a4a52'); p.box(-w / 2 - 0.02, 0.45, 0.28, 0.03, 0.34, L * 0.62, 'f', cover || '#6a4a52'); p.box(w / 2 + 0.02, 0.45, 0.28, 0.03, 0.34, L * 0.62, 'f', cover || '#6a4a52');
        p.box(0, 0.62, -L / 2 - 0.02, w + 0.1, 1.24, 0.07, 'w', c); p.box(0, 1.27, -L / 2 - 0.02, w + 0.16, 0.06, 0.1, 'w', c); p.box(0, 0.42, L / 2 + 0.02, w + 0.1, 0.84, 0.06, 'w', c);
        p.col(0, 0, w + 0.12, L + 0.1, 2);
        const side = p.world(w / 2 + 0.55, 0, 0.3), under = p.world(0.05, 0.17, 0.25), look = p.world(w / 2 + 1.5, 0.17, 0.25);
        HIDES.push({ id, kind: 'bed', lv: p.lv, x: p.x, z: p.z, out: side, cam: under, look, th: p.th, w, room: roomKey(p.lv, Math.floor(p.x), Math.floor(p.z)), hx: (p.r % 2 ? L : w) / 2 + 0.06, hz: (p.r % 2 ? w : L) / 2 + 0.06 });
        return p;
      },
      wardrobe(p, w, col, id) {
        const h = 2.05, d = 0.6, c = col || DWOOD;
        p.box(-w / 2 + 0.02, h / 2, 0, 0.04, h, d, 'w', c); p.box(w / 2 - 0.02, h / 2, 0, 0.04, h, d, 'w', c); p.box(0, h - 0.02, 0, w, 0.04, d, 'w', c); p.box(0, 0.06, 0, w, 0.12, d, 'w', c); p.box(0, h / 2, -d / 2 + 0.01, w, h, 0.02, 'w', '#1a120c');
        p.box(0, h + 0.05, 0.02, w + 0.08, 0.1, d + 0.06, 'w', c); p.box(0, 1.75, -0.05, w - 0.1, 0.03, 0.03, 'm', '#555');
        p.col(0, 0, w + 0.04, d + 0.04, 2);
        const doors = [];
        for (const s of [-1, 1]) {
          const hinge = p.world(s * (w / 2 - 0.03), 0, d / 2), g = new THREE.Group(); g.position.copy(hinge); g.rotation.y = p.th;
          const dw = w / 2 - 0.035, a = { P: [], N: [], U: [], C: [], F: [] };
          const add = (lx, ly, sx, sy, sz, cl) => addGeo(a, GB, [-s * (lx), ly, 0.012], [0, 0, 0], [sx, sy, sz], tint(cl || c), 1.6, 0);
          add(dw / 2, 0.15, dw, 0.06, 0.024); add(dw / 2, h - 0.2, dw, 0.06, 0.024); add(0.03, h / 2, 0.06, h - 0.3, 0.024); add(dw - 0.03, h / 2, 0.06, h - 0.3, 0.024);
          add(dw / 2, 0.55, dw - 0.06, 0.7, 0.018); add(dw / 2, 0.92, dw, 0.04, 0.024);
          for (let y = 1.0; y < h - 0.25; y += 0.07) addGeo(a, GB, [-s * dw / 2, y, 0.012], [0.65, 0, 0], [dw - 0.08, 0.016, 0.05], tint(c), 1.6, 0);
          addGeo(a, GS, [-s * (dw - 0.07), 1.05, 0.04], [0, 0, 0], [0.018, 0.018, 0.018], tint('#9a8a5a'), 1, 0);
          doors.push({ g, a, s });
        }
        const hide = { id, kind: 'ward', lv: p.lv, x: p.x, z: p.z, out: p.world(0, 0, d / 2 + 0.6), cam: p.world(0, 1.48, 0.02), look: p.world(0, 1.48, 2.5), th: p.th, w, doors, open: 0, room: roomKey(p.lv, Math.floor(p.x), Math.floor(p.z)), hx: (p.r % 2 ? d : w) / 2 + 0.05, hz: (p.r % 2 ? w : d) / 2 + 0.05 };
        HIDES.push(hide); WARD.push(hide);
        return p;
      },
      dresser(p, w, n, col, id, h) {
        const H = h || 0.85, d = 0.48, c = col || WOOD;
        p.box(0, H / 2, -0.02, w, H - 0.04, d - 0.04, 'w', c); p.box(0, H - 0.015, 0, w + 0.04, 0.03, d + 0.02, 'w', c); F.legs(p, w - 0.04, d - 0.08, 0.06, 0.05, c);
        p.col(0, 0, w + 0.04, d + 0.04);
        const dh = (H - 0.12) / n;
        for (let i = 0; i < n; i++) {
          const y = 0.08 + dh * i + dh / 2, a = { P: [], N: [], U: [], C: [], F: [] };
          addGeo(a, GB, [0, 0, 0], [0, 0, 0], [w - 0.06, dh - 0.03, 0.025], tint(c), 1.6, 0);
          addGeo(a, GB, [0, -dh / 2 + 0.04, -0.2], [0, 0, 0], [w - 0.1, 0.015, 0.38], tint('#3a2a1a'), 1.6, 0);
          for (const sx of [-1, 1]) addGeo(a, GB, [sx * (w / 2 - 0.06), -dh / 2 + 0.06, -0.2], [0, 0, 0], [0.015, 0.06, 0.38], tint('#3a2a1a'), 1.6, 0);
          addGeo(a, GB, [0, 0, 0.02], [0, 0, 0], [0.09, 0.025, 0.02], tint('#a08a50'), 1, 0);
          const base = p.world(0, y, d / 2 - 0.01), dir = new THREE.Vector3(Math.sin(p.th), 0, Math.cos(p.th));
          const dr = { id: id + i, lv: p.lv, base, dir, th: p.th, open: 0, want: 0, a, w, dh, items: [], room: roomKey(p.lv, Math.floor(p.x), Math.floor(p.z)) };
          DRAWERS.push(dr);
          p.spot(id + i, 0, y - dh / 2 + 0.05, d / 2 - 0.22, 'drawer', { dr });
        }
        return p;
      },
      counter(p, w, top) {
        p.box(0, 0.44, 0, w, 0.88, 0.58, 'w', '#6a5a44'); p.box(0, 0.05, 0.27, w, 0.1, 0.04, 'w', '#2a2018');
        for (let x = -w / 2 + 0.25; x < w / 2; x += 0.5) { p.box(x, 0.48, 0.295, 0.46, 0.66, 0.012, 'w', '#75644c'); p.box(x + 0.16, 0.7, 0.305, 0.02, 0.1, 0.012, 'm', '#888'); }
        p.box(0, 0.9, 0.01, w + 0.02, 0.04, 0.63, top ? 'p' : 'w', top || '#3a3a36');
        p.col(0, 0, w, 0.62); return p;
      },
      upper(p, w) { p.box(0, 1.8, -0.12, w, 0.7, 0.34, 'w', '#6a5a44'); for (let x = -w / 2 + 0.25; x < w / 2; x += 0.5) p.box(x, 1.8, 0.055, 0.46, 0.64, 0.012, 'w', '#75644c'); return p; },
      sink(p) { F.counter(p, 1.0, '#8a8a84'); p.box(0, 0.88, 0.03, 0.6, 0.06, 0.4, 'p', '#2a2a28'); p.cyl(0, 1.02, -0.22, 0.02, 0.26, 8, 'm', '#9a9a9a'); p.box(0, 1.14, -0.15, 0.03, 0.03, 0.16, 'm', '#9a9a9a'); return p; },
      stove(p) { p.box(0, 0.45, 0, 0.9, 0.9, 0.6, 'p', '#b8b2a0'); p.box(0, 0.42, 0.302, 0.72, 0.5, 0.01, 'p', '#2a2826'); p.box(0, 0.73, 0.305, 0.6, 0.03, 0.02, 'm', '#888'); for (const [x, z] of [[-0.2, -0.13], [0.2, -0.13], [-0.2, 0.13], [0.2, 0.13]]) p.cyl(x, 0.905, z, 0.09, 0.02, 12, 'm', '#2a2a2a'); p.box(0, 1.1, -0.28, 0.9, 0.4, 0.04, 'p', '#a8a290'); p.col(0, 0, 0.9, 0.62); return p; },
      fridge(p) { p.box(0, 0.85, 0, 0.7, 1.7, 0.68, 'p', '#c9c2ac'); p.box(0, 1.22, 0.342, 0.66, 0.012, 0.01, 'p', '#555'); p.box(0.27, 1.45, 0.36, 0.03, 0.28, 0.04, 'm', '#aaa'); p.box(0.27, 0.9, 0.36, 0.03, 0.22, 0.04, 'm', '#aaa'); p.col(0, 0, 0.7, 0.68); return p; },
      sofa(p, w, col) { const c = col || '#4a2a30'; p.box(0, 0.22, 0, w, 0.3, 0.86, 'f', c); p.box(0, 0.42, 0.05, w - 0.36, 0.14, 0.72, 'f', c); p.box(0, 0.66, -0.34, w, 0.64, 0.2, 'f', c); for (const s of [-1, 1]) p.box(s * (w / 2 - 0.1), 0.42, 0, 0.2, 0.42, 0.86, 'f', c); F.legs(p, w - 0.1, 0.76, 0.08, 0.05, DWOOD); p.col(0, 0, w, 0.88); return p; },
      armchair(p, col) { return F.sofa(p, 0.9, col); },
      rocker(p) { const c = DWOOD; p.box(0, 0.45, 0, 0.46, 0.04, 0.44, 'w', c); for (const s of [-1, 1]) { p.box(s * 0.21, 0.24, 0, 0.04, 0.42, 0.04, 'w', c); p.box(s * 0.22, 0.04, 0, 0.03, 0.03, 0.9, 'w', c, 0, 0, 0, 0); p.box(s * 0.21, 0.82, -0.2, 0.04, 0.8, 0.04, 'w', c); p.box(s * 0.23, 0.62, 0, 0.04, 0.03, 0.44, 'w', c); } for (let i = 0; i < 5; i++) p.box(-0.16 + i * 0.08, 0.86, -0.2, 0.025, 0.68, 0.025, 'w', c); p.box(0, 1.2, -0.2, 0.48, 0.06, 0.05, 'w', c); p.col(0, 0, 0.5, 0.8); return p; },
      fireplace(p) {
        p.box(-0.62, 0.55, 0, 0.36, 1.1, 0.42, 'p', '#5a5450'); p.box(0.62, 0.55, 0, 0.36, 1.1, 0.42, 'p', '#5a5450'); p.box(0, 0.98, 0, 0.9, 0.26, 0.42, 'p', '#5a5450');
        p.box(0, 1.15, 0.03, 1.8, 0.08, 0.52, 'w', DWOOD); p.box(0, 0.42, -0.1, 0.9, 0.84, 0.2, 'p', '#141210'); p.box(0, 0.04, 0.12, 1.7, 0.08, 0.5, 'p', '#3e3a36');
        p.box(0, 0.1, -0.02, 0.5, 0.08, 0.2, 'g', '#ff5a1a'); p.box(-0.08, 0.16, 0, 0.36, 0.06, 0.06, 'w', '#2a1a10', 0, 0, 0.4); p.box(0.08, 0.16, -0.03, 0.36, 0.06, 0.06, 'w', '#2a1a10', 0, 0, -0.4);
        p.box(0, 1.9, -0.17, 0.8, 1.0, 0.04, 'w', '#2a1c12'); p.box(0, 1.9, -0.145, 0.7, 0.9, 0.02, 'm', '#101418');
        p.lamp(0, 0.4, 0.6, 0.4, 4.5, '#ff6a2a', 0.9); p.col(0, 0, 1.8, 0.5); return p;
      },
      shelf(p, w, h, d, books, col) {
        const c = col || DWOOD, n = Math.max(3, Math.round(h / 0.42));
        for (const s of [-1, 1]) p.box(s * (w / 2 - 0.02), h / 2, 0, 0.04, h, d, 'w', c);
        p.box(0, h / 2, -d / 2 + 0.01, w, h, 0.02, 'w', c);
        for (let i = 0; i <= n; i++) p.box(0, 0.04 + i * (h - 0.06) / n, 0, w - 0.04, 0.03, d - 0.02, 'w', c);
        if (books) for (let i = 0; i < n; i++) p.box(0, 0.06 + i * (h - 0.06) / n + 0.13, -0.02, w - 0.1, 0.24, d * 0.6, 'k', null);
        p.col(0, 0, w, d + 0.02); return p;
      },
      rack(p, w, h, d) {
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box(sx * (w / 2 - 0.02), h / 2, sz * (d / 2 - 0.02), 0.035, h, 0.035, 'm', '#4a4a48');
        for (let i = 0; i < 4; i++) p.box(0, 0.12 + i * (h - 0.14) / 3, 0, w, 0.025, d, 'm', '#5a5a56');
        const R = mkRng((p.x * 13 + p.z * 7) | 0);
        for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) { if (R() < 0.35) continue; const y = 0.12 + i * (h - 0.14) / 3 + 0.0125, x = -w / 2 + 0.15 + k * (w - 0.3) / 3, v = R(); if (v < 0.5) p.cyl(x, y + 0.09, (R() - 0.5) * 0.15, 0.06, 0.18, 8, 'p', ['#6a7a5a', '#8a6a3a', '#5a4a3a'][(R() * 3) | 0]); else p.box(x, y + 0.11, 0, 0.26, 0.22, d * 0.7, 'f', ['#7a6a4a', '#6a5a40'][(R() * 2) | 0]); }
        p.col(0, 0, w, d); return p;
      },
      desk(p, w, col) { const c = col || WOOD; F.table(p, w, 0.65, 0.76, c); p.box(w / 2 - 0.22, 0.4, 0, 0.4, 0.6, 0.6, 'w', c); for (let i = 0; i < 3; i++) p.box(w / 2 - 0.22, 0.2 + i * 0.19, 0.305, 0.36, 0.16, 0.01, 'w', '#4a3020'); return p; },
      clock(p) { p.box(0, 0.4, 0, 0.5, 0.8, 0.32, 'w', DWOOD); p.box(0, 1.2, 0, 0.4, 0.8, 0.28, 'w', DWOOD); p.box(0, 1.2, 0.145, 0.26, 0.6, 0.01, 'm', '#1a1a18'); p.cyl(0, 1.0, 0.15, 0.06, 0.01, 12, 'm', '#a08a40', null, Math.PI / 2); p.box(0, 1.85, 0, 0.5, 0.5, 0.32, 'w', DWOOD); p.cyl(0, 1.86, 0.162, 0.17, 0.01, 16, 'p', '#d8ceb0', null, Math.PI / 2); p.box(0, 1.9, 0.17, 0.012, 0.12, 0.005, 'p', '#111'); p.box(0.04, 1.86, 0.17, 0.09, 0.012, 0.005, 'p', '#111'); p.box(0, 2.16, 0, 0.56, 0.1, 0.36, 'w', DWOOD); p.col(0, 0, 0.52, 0.34); return p; },
      tv(p) { p.box(0, 0.25, 0, 0.8, 0.5, 0.45, 'w', DWOOD); p.box(0, 0.78, 0, 0.66, 0.56, 0.5, 'p', '#3a3630'); p.box(0, 0.8, 0.252, 0.5, 0.4, 0.01, 'g', '#5a6a7a'); p.lamp(0, 0.8, 0.5, 0.18, 3.5, '#9ab0ff', 0.8); p.col(0, 0, 0.8, 0.5); return p; },
      tub(p) { const L = 1.6; p.box(0, 0.32, 0, L, 0.5, 0.74, 'p', '#d8d4c8'); p.box(0, 0.3, 0, L - 0.12, 0.42, 0.6, 'p', '#9a9a90'); p.box(0, 0.575, 0, L + 0.02, 0.04, 0.76, 'p', '#e0dcd0'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.sph(sx * (L / 2 - 0.12), 0.05, sz * 0.28, 0.06, 0.07, 0.06, 'm', '#9a8a50'); p.cyl(-L / 2 + 0.1, 0.75, -0.3, 0.02, 0.3, 8, 'm', '#9a9a9a'); p.col(0, 0, L, 0.76); return p; },
      toilet(p) { p.cyl(0, 0.2, 0.05, 0.15, 0.4, 12, 'p', '#d8d4c8', 0.8); p.cyl(0, 0.41, 0.08, 0.2, 0.04, 16, 'p', '#c8c4b8'); p.box(0, 0.62, -0.2, 0.42, 0.4, 0.18, 'p', '#d8d4c8'); p.box(0, 0.83, -0.2, 0.46, 0.03, 0.2, 'p', '#c8c4b8'); p.col(0, 0, 0.46, 0.66); return p; },
      basin(p) { p.cyl(0, 0.38, 0, 0.09, 0.76, 10, 'p', '#d8d4c8', 0.7); p.box(0, 0.8, 0, 0.56, 0.14, 0.42, 'p', '#d8d4c8'); p.box(0, 0.86, 0.02, 0.42, 0.04, 0.28, 'p', '#7a7a74'); p.cyl(0, 0.96, -0.16, 0.015, 0.18, 8, 'm', '#9a9a9a'); p.box(0, 1.55, -0.2, 0.6, 0.8, 0.03, 'w', '#3a2a1a'); p.box(0, 1.55, -0.18, 0.52, 0.72, 0.01, 'm', '#2a3036'); p.col(0, 0, 0.58, 0.44); return p; },
      bench(p, w) { F.table(p, w, 0.62, 0.9, '#5a4a36'); p.box(0, 0.25, 0, w - 0.1, 0.03, 0.55, 'w', '#4a3a2a'); p.box(w / 2 - 0.2, 0.98, 0.18, 0.16, 0.12, 0.14, 'm', '#3a4a5a'); p.box(0, 1.5, -0.3, w, 0.9, 0.03, 'w', '#6a5a40'); for (let i = 0; i < 5; i++) p.box(-w / 2 + 0.3 + i * (w - 0.6) / 4, 1.5, -0.27, 0.05, 0.3, 0.03, 'm', '#5a5a5a'); return p; },
      boiler(p) { p.cyl(0, 0.9, 0, 0.48, 1.8, 16, 'm', '#5a4a3a'); p.cyl(0, 1.85, 0, 0.5, 0.1, 16, 'm', '#3a3028'); p.box(0, 0.5, 0.47, 0.22, 0.14, 0.02, 'g', '#ff7a2a'); p.cyl(0.2, 2.35, 0, 0.07, 1.0, 8, 'm', '#4a4038'); p.cyl(-0.25, 2.35, 0.1, 0.05, 1.0, 8, 'm', '#4a4038'); p.lamp(0, 0.5, 0.9, 0.55, 5, '#ff6a20', 0.9); p.col(0, 0, 1.0, 1.0); return p; },
      barrel(p, col) { p.cyl(0, 0.45, 0, 0.3, 0.9, 12, 'w', col || '#5a4028'); for (const y of [0.15, 0.75]) p.cyl(0, y, 0, 0.305, 0.05, 12, 'm', '#3a3a36'); p.col(0, 0, 0.6, 0.6); return p; },
      crate(p, s, col) { p.box(0, s / 2, 0, s, s, s, 'w', col || '#7a6040'); for (const sx of [-1, 1]) p.box(sx * (s / 2 - 0.04), s / 2, s / 2 + 0.005, 0.07, s, 0.01, 'w', '#5a4428'); p.col(0, 0, s, s); return p; },
      sheet(p, w, d, h) { p.box(0, h * 0.45, 0, w, h * 0.9, d, 'f', '#a8a69c'); p.sph(0, h * 0.85, 0, w * 0.52, h * 0.22, d * 0.55, 'f', '#b0aea4'); p.box(0, 0.04, 0, w + 0.08, 0.08, d + 0.08, 'f', '#9a988e'); p.col(0, 0, w + 0.08, d + 0.08); return p; },
      cot(p) { const w = 1.2, d = 0.64; p.box(0, 0.42, 0, w - 0.06, 0.12, d - 0.06, 'f', '#c8bca8'); F.legs(p, w, d, 1.0, 0.05, '#d8d0c0'); for (const sz of [-1, 1]) { p.box(0, 0.95, sz * (d / 2 - 0.025), w, 0.04, 0.04, 'w', '#d8d0c0'); p.box(0, 0.36, sz * (d / 2 - 0.025), w, 0.04, 0.04, 'w', '#d8d0c0'); for (let x = -w / 2 + 0.1; x < w / 2 - 0.05; x += 0.1) p.box(x, 0.66, sz * (d / 2 - 0.025), 0.02, 0.58, 0.02, 'w', '#d8d0c0'); } p.col(0, 0, w, d); return p; },
      horse(p) { p.box(0, 0.48, 0, 0.18, 0.2, 0.62, 'p', '#c8b090'); p.box(0, 0.68, 0.32, 0.12, 0.3, 0.14, 'p', '#c8b090', 0, -0.5); p.box(0, 0.84, 0.4, 0.1, 0.14, 0.22, 'p', '#c8b090'); p.box(0, 0.72, 0.26, 0.03, 0.2, 0.2, 'f', '#3a2a1a'); for (const sx of [-1, 1]) { p.box(sx * 0.08, 0.3, 0.18, 0.04, 0.3, 0.04, 'p', '#c8b090'); p.box(sx * 0.08, 0.3, -0.18, 0.04, 0.3, 0.04, 'p', '#c8b090'); p.box(sx * 0.12, 0.08, 0, 0.04, 0.04, 0.9, 'w', '#7a2a22'); } p.col(0, 0, 0.36, 0.9); return p; },
      chest(p, w, col) { const c = col || '#5a3a24'; p.box(0, 0.24, 0, w, 0.44, 0.45, 'w', c); p.box(0, 0.48, 0, w + 0.03, 0.06, 0.48, 'w', c); for (const sx of [-1, 1]) p.box(sx * (w / 2 - 0.08), 0.26, 0.23, 0.05, 0.44, 0.01, 'm', '#6a5a3a'); p.box(0, 0.4, 0.235, 0.08, 0.08, 0.01, 'm', '#8a7a4a'); p.col(0, 0, w + 0.03, 0.48); return p; },
      washer(p) { p.box(0, 0.43, 0, 0.6, 0.86, 0.6, 'p', '#c8c4b4'); p.cyl(0, 0.45, 0.3, 0.19, 0.02, 16, 'm', '#3a4048', null, Math.PI / 2); p.cyl(0, 0.45, 0.31, 0.15, 0.02, 16, 'm', '#1a2028', null, Math.PI / 2); p.col(0, 0, 0.6, 0.6); return p; },
      coat(p) { p.cyl(0, 0.9, 0, 0.025, 1.8, 8, 'w', DWOOD); p.cyl(0, 0.02, 0, 0.2, 0.04, 12, 'w', DWOOD); p.box(0.08, 1.35, 0.04, 0.3, 0.7, 0.18, 'f', '#3a3a40'); p.box(-0.06, 1.5, -0.06, 0.26, 0.5, 0.16, 'f', '#4a3a2a'); p.col(0, 0, 0.45, 0.45); return p; },
      portrait(p, ly, k, w) { const W2 = w || 0.5, H2 = W2 * 1.3; p.box(0, ly, 0.03, W2 + 0.1, H2 + 0.1, 0.04, 'w', '#4a3418'); F.plane(p, 'por' + k, 0, ly, 0.052, W2, H2); return p; },
      plane(p, k, lx, ly, lz, w, h) { const a = acc(p.lv, k), n = [Math.sin(p.th), 0, Math.cos(p.th)], pt = (u, v) => { const [wx, wz] = p.tw(lx + u, lz); return [wx, p.y0 + ly + v, wz]; }; quad(a, k, pt(-w / 2, -h / 2), pt(w / 2, -h / 2), pt(w / 2, h / 2), pt(-w / 2, h / 2), n, [[0, 0], [1, 0], [1, 1], [0, 1]], null, 1); return p; },
      rug(p, w, d, k) { const a = acc(p.lv, k), [cx, cz] = p.tw(0, 0), odd = p.r % 2, hw = (odd ? d : w) / 2, hd = (odd ? w : d) / 2, y = p.y0 + 0.006; quad(a, k, [cx - hw, y, cz + hd], [cx + hw, y, cz + hd], [cx + hw, y, cz - hd], [cx - hw, y, cz - hd], [0, 1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]], null, 2); return p; },
      pendant(p, ly, pw, shade) { const h = CEIL - ly; p.cyl(0, ly + h / 2, 0, 0.008, h, 6, 'm', '#222'); if (shade) { addGeo(acc(p.lv, 'f'), gcone(0.06, 1, 12, true), (() => { const [wx, wz] = p.tw(0, 0); return [wx, p.y0 + ly + 0.02, wz]; })(), [0, 0, 0], [0.26, 0.2, 0.26], tint(shade), 1.6, 1); } p.sph(0, ly - 0.05, 0, 0.05, 0.07, 0.05, 'g', '#fff4d8'); p.lamp(0, ly - 0.08, 0, pw * 1.35, 8.5, '#ffc070', 1.5); return p; },
      bulb(p, ly, pw) { const h = CEIL - ly; p.cyl(0, ly + h / 2, 0, 0.006, h, 6, 'm', '#222'); p.sph(0, ly - 0.04, 0, 0.045, 0.06, 0.045, 'g', '#ffe8b8'); p.lamp(0, ly - 0.05, 0, pw * 1.45, 7.5, '#ffb870', 1.35); return p; },
      tlamp(p, ly, pw, col) { p.cyl(0, ly + 0.12, 0, 0.06, 0.24, 10, 'p', col || '#8a7a5a', 0.6); p.cyl(0, ly + 0.36, 0, 0.17, 0.22, 12, 'g', '#e0a860', 0.7); p.lamp(0, ly + 0.32, 0.05, pw * 1.6, 6.5, '#ffb060', 1.2); return p; },
      flamp(p, pw) { p.cyl(0, 0.02, 0, 0.18, 0.04, 12, 'm', '#3a3028'); p.cyl(0, 0.75, 0, 0.018, 1.5, 6, 'm', '#3a3028'); p.cyl(0, 1.58, 0, 0.24, 0.3, 12, 'g', '#d89850', 0.6); p.lamp(0, 1.5, 0.08, pw * 1.5, 6.5, '#ffaa58', 1.3); p.col(0, 0, 0.36, 0.36); return p; },
      sconce(p, ly, pw) { p.box(0, ly, 0.04, 0.1, 0.16, 0.06, 'm', '#6a5a3a'); p.cyl(0, ly + 0.1, 0.12, 0.08, 0.14, 10, 'g', '#e8b070', 0.6); p.lamp(0, ly + 0.1, 0.25, pw * 1.5, 6, '#ffb468', 1.1); return p; },
      candle(p, ly, pw) { p.cyl(0, ly + 0.02, 0, 0.07, 0.04, 10, 'm', '#8a7a4a'); for (const sx of [-0.1, 0, 0.1]) { p.cyl(sx, ly + 0.13 + (sx ? 0 : 0.05), 0, 0.018, 0.18 + (sx ? 0 : 0.1), 8, 'p', '#e8e0c8'); p.sph(sx, ly + 0.25 + (sx ? 0 : 0.1), 0, 0.012, 0.028, 0.012, 'g', '#ffd070'); } p.box(0, ly + 0.05, 0, 0.24, 0.015, 0.02, 'm', '#8a7a4a'); p.lamp(0, ly + 0.3, 0, pw * 1.6, 6.5, '#ffaa50', 1.2); return p; },
      car(p) {
        const B = '#2e4436', CH = '#9a9a96', G = '#141a1e';
        p.box(0, 0.55, 0, 1.78, 0.5, 4.3, 'p', B); p.box(0, 0.38, 0, 1.7, 0.12, 4.2, 'p', '#1a2620');
        p.box(0, 1.03, 0.25, 1.62, 0.46, 2.0, 'p', B); p.box(0, 1.03, 0.25, 1.64, 0.36, 1.9, 'm', G);
        p.box(0, 1.27, 0.25, 1.5, 0.04, 1.9, 'p', B);
        for (const sz of [-1, 1]) p.box(0, 0.42, sz * 2.17, 1.8, 0.16, 0.1, 'm', CH);
        for (const sx of [-1, 1]) { p.box(sx * 0.62, 0.64, -2.151, 0.28, 0.16, 0.01, 'g', '#a8a490'); p.box(sx * 0.7, 0.62, 2.151, 0.22, 0.1, 0.01, 'g', '#5a1414'); }
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) { p.cyl(sx * 0.82, 0.33, sz * 1.38, 0.33, 0.24, 16, 'm', '#141414', null, 0, Math.PI / 2); p.cyl(sx * 0.95, 0.33, sz * 1.38, 0.15, 0.02, 12, 'm', '#8a8a86', null, 0, Math.PI / 2); }
        p.col(0, 0, 1.84, 4.36, 4);
        return p;
      }
    };
    const WS = 2, VS = 2.8;
    function wallRect(lv, ax, X, J, side, u0, u1, ya, yb, style, flag) {
      const a = acc(lv, style), y0 = LY[lv], off = side * WT;
      const ys = [ya]; for (const b of [0.9, 1.9]) if (b > ya + 0.01 && b < yb - 0.01) ys.push(b); ys.push(yb);
      const us = [u0]; if (u0 < 0.5 - 0.01 && u1 > 0.5 + 0.01) us.push(0.5); us.push(u1);
      for (let yi = 0; yi < ys.length - 1; yi++) for (let ui = 0; ui < us.length - 1; ui++) {
        const ua = us[ui], ub = us[ui + 1], yA = y0 + ys[yi], yB = y0 + ys[yi + 1];
        if (ax === 'v') {
          const x = X + off, za = J + ua, zb = J + ub, n = [side, 0, 0];
          const uvA = za / WS, uvB = zb / WS, vA = ys[yi] / VS, vB = ys[yi + 1] / VS;
          if (side > 0) quad(a, style, [x, yA, zb], [x, yA, za], [x, yB, za], [x, yB, zb], n, [[-uvB, vA], [-uvA, vA], [-uvA, vB], [-uvB, vB]], null, flag);
          else quad(a, style, [x, yA, za], [x, yA, zb], [x, yB, zb], [x, yB, za], n, [[uvA, vA], [uvB, vA], [uvB, vB], [uvA, vB]], null, flag);
        } else {
          const z = X + off, xa = J + ua, xb = J + ub, n = [0, 0, side];
          const uvA = xa / WS, uvB = xb / WS, vA = ys[yi] / VS, vB = ys[yi + 1] / VS;
          if (side > 0) quad(a, style, [xa, yA, z], [xb, yA, z], [xb, yB, z], [xa, yB, z], n, [[uvA, vA], [uvB, vA], [uvB, vB], [uvA, vB]], null, flag);
          else quad(a, style, [xb, yA, z], [xa, yA, z], [xa, yB, z], [xb, yB, z], n, [[-uvB, vA], [-uvA, vA], [-uvA, vB], [-uvB, vB]], null, flag);
        }
      }
    }
    const edgeBox = (lv, ax, X, J, f, u0, u1) => { const b = ax === 'v' ? { x0: X - WT - 0.01, x1: X + WT + 0.01, z0: J + (u0 || 0) - 0.02, z1: J + (u1 == null ? 1 : u1) + 0.02 } : { z0: X - WT - 0.01, z1: X + WT + 0.01, x0: J + (u0 || 0) - 0.02, x1: J + (u1 == null ? 1 : u1) + 0.02 }; if (ax !== 'v') { const t0 = b.z0, t1 = b.z1; b.z0 = t0; b.z1 = t1; } b.f = f; b.on = true; COLL[lv].push(b); return b; };
    const DOORS = [];
    const trimBox = (lv, ax, X, J, u, y, h, len, ch, col) => { const y0 = LY[lv]; if (ax === 'v') addGeo(acc(lv, ch || 'w'), GB, [X, y0 + y + h / 2, J + u], [0, 0, 0], [WT * 2 + 0.05, h, len], tint(col || TRIM), 1.6, 1); else addGeo(acc(lv, ch || 'w'), GB, [J + u, y0 + y + h / 2, X], [0, 0, 0], [len, h, WT * 2 + 0.05], tint(col || TRIM), 1.6, 1); };
    function buildEdge(lv, ax, X, J, t, ei) {
      const info = ei >= 0 && EDGES[ei][5] || {};
      const A = ax === 'v' ? [X - 1, J] : [J, X - 1], B = ax === 'v' ? [X, J] : [J, X];
      const sa = wallStyle(lv, A[0], A[1]), sb = wallStyle(lv, B[0], B[1]);
      const faces = (u0, u1, ya, yb) => { if (sa) wallRect(lv, ax, X, J, -1, u0, u1, ya, yb, sa, sa === 'ext' ? 3 : 0); if (sb) wallRect(lv, ax, X, J, 1, u0, u1, ya, yb, sb, sb === 'ext' ? 3 : 0); };
      const bx = (u0, u1) => ax === 'v' ? edgeBox(lv, 'v', X, J, 1, u0, u1) : (() => { const b = { x0: J + (u0 || 0) - 0.02, x1: J + (u1 == null ? 1 : u1) + 0.02, z0: X - WT - 0.01, z1: X + WT + 0.01, f: 1, on: true }; COLL[lv].push(b); return b; })();
      const ca = cellAt(lv, A[0], A[1]), cb = cellAt(lv, B[0], B[1]);
      const skirt = (u0, u1) => { for (const [s, st, cc] of [[-1, sa, ca], [1, sb, cb]]) { if (!st || st === 'ext' || cc === 'S' || cc === 'O') continue; const len = u1 - u0, mid = (u0 + u1) / 2, y0 = LY[lv]; if (ax === 'v') addGeo(acc(lv, 'w'), GB, [X + s * (WT + 0.012), y0 + 0.07, J + mid], [0, 0, 0], [0.024, 0.14, len], tint(TRIM), 1.6, 1); else addGeo(acc(lv, 'w'), GB, [J + mid, y0 + 0.07, X + s * (WT + 0.012)], [0, 0, 0], [len, 0.14, 0.024], tint(TRIM), 1.6, 1); } };
      if (t === E_WALL) { faces(0, 1, 0, WH); skirt(0, 1); bx(0, 1); return; }
      if (t === E_WIN) {
        faces(0, 1, 0, 0.9); faces(0, 1, 2.1, WH); faces(0, 0.15, 0.9, 2.1); faces(0.85, 1, 0.9, 2.1); skirt(0, 1); bx(0, 1);
        trimBox(lv, ax, X, J, 0.5, 0.86, 0.05, 0.84, 'w', '#3a2a1c'); trimBox(lv, ax, X, J, 0.5, 2.08, 0.05, 0.84, 'w', '#3a2a1c'); trimBox(lv, ax, X, J, 0.14, 0.9, 1.2, 0.04, 'w', '#3a2a1c'); trimBox(lv, ax, X, J, 0.86, 0.9, 1.2, 0.04, 'w', '#3a2a1c');
        const y0 = LY[lv], a = acc(lv, 'win'), n = ax === 'v' ? [1, 0, 0] : [0, 0, 1];
        const pt = (u, y) => ax === 'v' ? [X, y0 + y, J + u] : [J + u, y0 + y, X];
        const inside = sa && sa !== 'ext' ? -1 : 1;
        if (ax === 'v') { if (inside > 0) quad(a, 'win', pt(0.85, 0.9), pt(0.15, 0.9), pt(0.15, 2.1), pt(0.85, 2.1), [1, 0, 0], [[1, 0], [0, 0], [0, 1], [1, 1]], null, 2); else quad(a, 'win', pt(0.15, 0.9), pt(0.85, 0.9), pt(0.85, 2.1), pt(0.15, 2.1), [-1, 0, 0], [[0, 0], [1, 0], [1, 1], [0, 1]], null, 2); }
        else { if (inside > 0) quad(a, 'win', pt(0.15, 0.9), pt(0.85, 0.9), pt(0.85, 2.1), pt(0.15, 2.1), [0, 0, 1], [[0, 0], [1, 0], [1, 1], [0, 1]], null, 2); else quad(a, 'win', pt(0.85, 0.9), pt(0.15, 0.9), pt(0.15, 2.1), pt(0.85, 2.1), [0, 0, -1], [[1, 0], [0, 0], [0, 1], [1, 1]], null, 2); }
        const R = mkRng(lv * 977 + X * 31 + J * 7);
        for (let k = 0; k < 3; k++) { const yy = 1.05 + k * 0.42 + (R() - 0.5) * 0.1, rz = (R() - 0.5) * 0.5; if (ax === 'v') addGeo(acc(lv, 'w'), GB, [X + inside * (WT + 0.03), y0 + yy, J + 0.5], [rz, 0, 0], [0.025, 0.14, 0.98], tint('#6a5236'), 1.6, 1); else addGeo(acc(lv, 'w'), GB, [J + 0.5, y0 + yy, X + inside * (WT + 0.03)], [0, 0, rz], [0.98, 0.14, 0.025], tint('#6a5236'), 1.6, 1); }
        const [lx, lz] = ax === 'v' ? [X + inside * 0.5, J + 0.5] : [J + 0.5, X + inside * 0.5];
        if (lv) LAMPS[lv].push({ x: lx, y: y0 + 1.5, z: lz, p: 0.32, R: 5, R2: 25, r02: 1.8, c: [0.32, 0.42, 0.75], room: roomKey(lv, Math.floor(lx), Math.floor(lz)), moon: 1 });
        return;
      }
      if (t === E_VENT) {
        faces(0, 1, 0.72, WH); faces(0, 0.18, 0, 0.72); faces(0.82, 1, 0, 0.72); skirt(0, 0.18); skirt(0.82, 1);
        trimBox(lv, ax, X, J, 0.5, 0.68, 0.05, 0.7, 'm', '#4a4a46'); trimBox(lv, ax, X, J, 0.17, 0, 0.72, 0.03, 'm', '#4a4a46'); trimBox(lv, ax, X, J, 0.83, 0, 0.72, 0.03, 'm', '#4a4a46');
        bx(0, 0.2); bx(0.8, 1); const vb = bx(0.18, 0.82); vb.f = 8;
        return;
      }
      if (t === E_DOOR || t === E_ARCH || t === E_FRONT || t === E_ROLL) {
        const top = t === E_ARCH ? 2.3 : t === E_ROLL ? 2.4 : 2.12;
        faces(0, 1, top, WH);
        if (t !== E_ROLL) { trimBox(lv, ax, X, J, 0.035, 0, top, 0.07, 'w', TRIM); trimBox(lv, ax, X, J, 0.965, 0, top, 0.07, 'w', TRIM); trimBox(lv, ax, X, J, 0.5, top - 0.02, 0.1, 1.08, 'w', TRIM); bx(-0.05, 0.06); bx(0.94, 1.05); }
        if (t === E_DOOR || t === E_FRONT) DOORS.push({ lv, ax, X, J, t, info, ei, k: DOORS.length });
        return;
      }
    }
    for (let lv = 0; lv < 3; lv++) {
      for (let j = 0; j < D; j++) for (let x = 0; x <= W; x++) { const t = EV[lv][j * (W + 1) + x]; if (t !== E_OPEN) buildEdge(lv, 'v', x, j, t, XV[lv][j * (W + 1) + x]); }
      for (let z = 0; z <= D; z++) for (let i = 0; i < W; i++) { const t = EH[lv][z * W + i]; if (t !== E_OPEN) buildEdge(lv, 'h', z, i, t, XH[lv][z * W + i]); }
      for (let z = 0; z <= D; z++) for (let x = 0; x <= W; x++) {
        const eh = (i, zz) => (i < 0 || i >= W || zz < 0 || zz > D) ? 0 : EH[lv][zz * W + i], ev = (xx, j) => (j < 0 || j >= D || xx < 0 || xx > W) ? 0 : EV[lv][j * (W + 1) + xx];
        const ww = t => t === E_WALL || t === E_WIN || t === E_VENT, e4 = [eh(x - 1, z), eh(x, z), ev(x, z - 1), ev(x, z)];
        if (!e4.some(ww)) continue;
        if (ww(e4[0]) && ww(e4[1]) && !e4[2] && !e4[3]) continue;
        if (ww(e4[2]) && ww(e4[3]) && !e4[0] && !e4[1]) continue;
        const outside = [cellAt(lv, x - 1, z - 1), cellAt(lv, x, z - 1), cellAt(lv, x - 1, z), cellAt(lv, x, z)].some(c => c === '.');
        if (lv === 0 && outside) continue;
        addGeo(acc(lv, outside ? 'ext' : 'w'), GB, [x, LY[lv] + WH / 2, z], [0, 0, 0], [WT * 2 - 0.004, WH, WT * 2 - 0.004], outside ? null : tint('#5a4a3a'), 1, outside ? 3 : 1);
      }
      for (let j = 0; j < D; j++) for (let i = 0; i < W; i++) {
        const c = cellAt(lv, i, j); if (c === '.') continue;
        const y = LY[lv];
        if (c !== 'S' && c !== 'O') {
          const st = ROOMS[c].f, a = acc(lv, st);
          for (let sz = 0; sz < 2; sz++) for (let sx = 0; sx < 2; sx++) { const x0 = i + sx * 0.5, x1 = x0 + 0.5, z0 = j + sz * 0.5, z1 = z0 + 0.5; quad(a, st, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [0, 1, 0], [[x0 / 2, -z1 / 2], [x1 / 2, -z1 / 2], [x1 / 2, -z0 / 2], [x0 / 2, -z0 / 2]], null, 2); }
        }
        if (c !== 'S') { const a = acc(lv, 'ceil'), yc = y + CEIL; quad(a, 'ceil', [i, yc, j], [i + 1, yc, j], [i + 1, yc, j + 1], [i, yc, j + 1], [0, -1, 0], [[i / 2, j / 2], [(i + 1) / 2, j / 2], [(i + 1) / 2, (j + 1) / 2], [i / 2, (j + 1) / 2]], null, 4); }
      }
    }
    STAIRS.forEach(s => {
      const steps = s.n * 4, rise = WH / steps, run = 1 / 4;
      for (let k = 0; k < steps; k++) {
        const t0 = k * run, y = LY[s.lv] + rise * (k + 1);
        const cx = s.dz ? s.x + 0.5 : (s.dx > 0 ? s.x : s.x + 1) + s.dx * (t0 + run / 2), cz = s.dz ? (s.dz > 0 ? s.z : s.z + 1) + s.dz * (t0 + run / 2) : s.z + 0.5;
        const h = rise * (k + 1);
        addGeo(acc(s.lv, 'dark'), GB, [cx, LY[s.lv] + h / 2, cz], [0, 0, 0], [s.dz ? 0.86 : run, h, s.dz ? run : 0.86], null, 1, 2);
        addGeo(acc(s.lv, 'w'), GB, [cx - (s.dz ? 0 : s.dx * 0.11), y + 0.005, cz - (s.dz ? s.dz * 0.11 : 0)], [0, 0, 0], [s.dz ? 0.88 : run, 0.03, s.dz ? 0.04 : 0.88], tint('#2a1a10'), 1.6, 1);
      }
      for (const sd of [-1, 1]) { const len = s.n; if (s.dz) { const zc = s.z + s.dz * (s.n - 1) / 2 + 0.5, ang = Math.atan2(WH, len) * (s.dz > 0 ? 1 : -1); addGeo(acc(s.lv, 'w'), GB, [s.x + 0.5 + sd * 0.4, LY[s.lv] + 0.95 + WH / 2, zc], [-ang, 0, 0], [0.05, 0.05, Math.hypot(len, WH)], tint('#4a3020'), 1.6, 1); } }
    });
    return { THREE, M, TX, ACC, LAMPS, COLL, HIDES, DRAWERS, WARD, SPOTS, DOORS, F, pc, acc, addGeo, quad, tint, GB, GC, GS, gcone, bakeU, bakeMat, probeMat, mkT, FIX, DYN };
  }

  function furnish(H) {
    const { F, pc } = H, WD = '#5a3a22', DW = '#3a2616';
    const sack = (p) => { p.sph(0, 0.24, 0, 0.24, 0.26, 0.2, 'f', '#8a7a5a'); p.sph(0, 0.5, 0, 0.1, 0.08, 0.08, 'f', '#7a6a4a'); p.col(0, 0, 0.45, 0.4); return p; };
    F.rack(pc(1, 1.4, 0.3, 0), 1.8, 1.9, 0.45); pc(1, 1.4, 0.3, 0).spot('pShelf', 0.35, 0.72, 0);
    F.rack(pc(1, 5.0, 0.3, 0), 1.3, 1.9, 0.45);
    F.rack(pc(1, 0.3, 2.6, 1), 1.6, 1.9, 0.45);
    F.table(pc(1, 3.0, 2.7, 0), 1.2, 0.7, 0.8, '#6a5a44'); pc(1, 3.25, 2.7, 0).spot('pTable', 0, 0.8, 0);
    F.barrel(pc(1, 0.55, 4.4, 0)); sack(pc(1, 1.3, 4.5, 0)); sack(pc(1, 1.8, 4.6, 0)); F.crate(pc(1, 5.3, 4.4, 0), 0.6);
    F.bulb(pc(1, 3.0, 2.0, 0), 2.3, 0.7);
    F.counter(pc(1, 7.0, 0.31, 0), 2.0); F.upper(pc(1, 7.0, 0.18, 0), 2.0); F.sink(pc(1, 8.5, 0.31, 0));
    F.counter(pc(1, 9.3, 0.31, 0), 0.6); F.stove(pc(1, 10.05, 0.32, 0)); F.counter(pc(1, 11.75, 0.31, 0), 2.5); F.fridge(pc(1, 13.35, 0.4, 0));
    F.upper(pc(1, 9.8, 0.18, 0), 1.4); F.upper(pc(1, 12.5, 0.18, 0), 0.9);
    pc(1, 6.7, 0.31, 0).spot('kCounterW', 0, 0.92, 0); pc(1, 12.8, 0.31, 0).spot('kCounterE', 0, 0.92, 0);
    F.dresser(pc(1, 6.31, 5.3, 1), 1.4, 3, '#5a4a36', 'kHutch', 0.9);
    for (let i = 0; i < 4; i++) pc(1, 6.31, 4.8 + i * 0.32, 1).cyl(0, 0.92, 0, 0.12, 0.02, 12, 'p', '#d8d0bc');
    F.table(pc(1, 10.0, 3.8, 0), 1.8, 0.9, 0.78, '#5a4028'); pc(1, 10.4, 3.65, 0).spot('kTable', 0, 0.78, 0);
    F.chair(pc(1, 9.45, 3.1, 0)); F.chair(pc(1, 10.55, 3.1, 0)); F.chair(pc(1, 9.45, 4.5, 2)); F.chair(pc(1, 10.55, 4.5, 2));
    F.pendant(pc(1, 10.0, 3.8, 0), 2.05, 1.0, '#3a4a3a');
    F.table(pc(1, 17.2, 2.8, 0), 2.4, 1.0, 0.76, '#3a2418'); pc(1, 16.5, 2.6, 0).spot('dTable', 0, 0.76, 0);
    for (const x of [16.4, 17.2, 18.0]) { F.chair(pc(1, x, 2.05, 0), '#2a1a10'); F.chair(pc(1, x, 3.55, 2), '#2a1a10'); }
    F.candle(pc(1, 17.4, 2.8, 0), 0.76, 0.55);
    F.dresser(pc(1, 18.6, 5.69, 2), 1.6, 3, '#3a2418', 'dSide', 0.9);
    F.clock(pc(1, 14.24, 5.5, 1));
    F.portrait(pc(1, 16.0, 0.07, 0), 1.6, 0); F.portrait(pc(1, 19.93, 1.5, 3), 1.6, 1);
    F.fireplace(pc(1, 19.72, 10.2, 3)); pc(1, 19.6, 10.6, 3).spot('lMantel', 0, 1.19, 0);
    F.sofa(pc(1, 16.6, 10.2, 1), 2.0, '#4a2a30'); pc(1, 16.7, 10.7, 1).spot('lSofa', 0, 0.49, 0, 'soft');
    F.table(pc(1, 17.85, 10.2, 1), 0.9, 0.55, 0.42, DW); pc(1, 17.85, 10.0, 1).spot('lCoffee', 0, 0.42, 0);
    F.bed(pc(1, 15.05, 13.4, 1), 0.9, DW, '#3a4a3a', 'dayBed');
    F.tv(pc(1, 19.35, 13.62, 2)); F.rocker(pc(1, 18.4, 12.3, 2));
    F.shelf(pc(1, 18.6, 6.25, 0), 1.8, 2.0, 0.36, true); pc(1, 18.3, 6.25, 0).spot('lShelf', 0, 0.71, 0.02);
    F.flamp(pc(1, 16.5, 8.65, 0), 0.75);
    F.rug(pc(1, 17.3, 10.2, 1), 3.0, 2.2, 'rugA');
    F.portrait(pc(1, 14.07, 10.4, 1), 1.6, 2);
    F.bench(pc(1, 5.62, 11.0, 3), 1.8); pc(1, 5.6, 11.4, 3).spot('gBench', 0, 0.9, 0);
    F.rack(pc(1, 4.6, 5.3, 0), 1.6, 1.9, 0.45); pc(1, 4.4, 5.3, 0).spot('gShelf', 0, 0.72, 0);
    F.rack(pc(1, 0.3, 7.0, 1), 1.4, 1.9, 0.45);
    F.bulb(pc(1, 1.6, 12.4, 0), 2.35, 0.3);
    { const p = pc(1, 0.55, 13.3, 0); for (let k = 0; k < 3; k++) { p.cyl(0, 0.11 + k * 0.22, 0, 0.34, 0.2, 16, 'm', '#161616'); p.cyl(0, 0.11 + k * 0.22, 0, 0.18, 0.205, 12, 'm', '#2a2a2a'); } p.col(0, 0, 0.7, 0.7); }
    F.washer(pc(1, 8.63, 9.6, 3)); F.rack(pc(1, 8.73, 7.6, 3), 0.9, 1.6, 0.4); pc(1, 8.73, 7.6, 3).spot('uShelf', 0, 0.62, 0);
    F.coat(pc(1, 8.6, 13.5, 0)); F.bulb(pc(1, 7.6, 10.5, 0), 2.3, 0.65);
    { const p = pc(1, 7.35, 13.6, 0); p.cyl(0, 0.15, 0, 0.14, 0.3, 10, 'm', '#5a5a5a', 0.85); p.cyl(0.05, 0.7, 0, 0.015, 1.2, 6, 'w', '#6a5a3a'); }
    F.table(pc(1, 9.27, 9.0, 1), 0.7, 0.4, 0.8, DW); pc(1, 9.3, 9.15, 1).spot('hTable', 0, 0.8, 0);
    { const p = pc(1, 9.27, 8.8, 1); p.box(0, 0.85, 0, 0.18, 0.1, 0.22, 'p', '#1a1a1a'); p.box(0, 0.93, 0, 0.06, 0.05, 0.24, 'p', '#1a1a1a'); }
    { const p = pc(1, 9.07, 9.0, 1); p.box(0, 1.55, 0.02, 0.62, 0.82, 0.03, 'w', '#4a3418'); p.box(0, 1.55, 0.04, 0.54, 0.74, 0.01, 'm', '#283038'); }
    F.wardrobe(pc(1, 9.37, 13.35, 1), 1.0, DW, 'hallCloset');
    { const p = pc(1, 12.5, 7.3, 0); p.box(0, 0.45, 0, 1.0, 0.05, 0.4, 'w', DW); F.legs(p, 0.96, 0.36, 0.43, 0.05, DW); p.box(0, 0.75, -0.17, 1.0, 0.55, 0.04, 'w', DW); p.col(0, 0, 1.0, 0.42); }
    { const p = pc(1, 10.4, 13.6, 0); p.cyl(0, 0.28, 0, 0.13, 0.56, 10, 'p', '#5a4a3a'); p.cyl(0.03, 0.75, 0, 0.012, 0.5, 6, 'm', '#222'); p.col(0, 0, 0.3, 0.3); }
    F.pendant(pc(1, 11.0, 10.5, 0), 2.1, 0.9, '#5a3a2a'); F.sconce(pc(1, 12.4, 13.93, 2), 1.85, 0.45);
    F.rug(pc(1, 11.0, 10.3, 0), 1.1, 5.0, 'rugB');
    F.portrait(pc(1, 12.93, 10.6, 3), 1.6, 3);
    F.bed(pc(2, 7.12, 4.5, 1), 0.95, WD, '#4a5a7a', 'myBed');
    F.wardrobe(pc(2, 10.63, 2.5, 3), 1.1, DW, 'myWard');
    F.desk(pc(2, 9.6, 0.4, 0), 1.0); F.chair(pc(2, 9.6, 1.05, 2)); pc(2, 9.75, 0.4, 0).spot('rDesk', 0, 0.76, 0);
    F.chest(pc(2, 6.32, 1.0, 1), 0.8, '#5a3a5a'); pc(2, 6.32, 1.0, 1).spot('rChest', 0, 0.51, 0);
    F.table(pc(2, 6.3, 3.6, 1), 0.4, 0.4, 0.55, WD); F.tlamp(pc(2, 6.3, 3.68, 1), 0.55, 0.5); pc(2, 6.3, 3.48, 1).spot('rNight', 0, 0.55, 0);
    F.rug(pc(2, 8.7, 3.0, 0), 1.6, 2.0, 'rugC');
    F.tub(pc(2, 11.9, 0.45, 0)); pc(2, 11.6, 0.45, 0).spot('bTub', 0, 0.12, 0);
    F.toilet(pc(2, 13.6, 1.3, 3)); F.basin(pc(2, 11.3, 3.6, 1)); F.dresser(pc(2, 13.68, 4.8, 3), 0.7, 2, '#c8c0b0', 'bCab', 0.8);
    F.bulb(pc(2, 12.5, 3.0, 0), 2.25, 0.8);
    F.bed(pc(2, 17.8, 1.1, 0), 1.5, DW, '#4a2a3a', 'kBed');
    F.table(pc(2, 16.58, 0.3, 0), 0.42, 0.4, 0.6, DW); F.tlamp(pc(2, 16.58, 0.3, 0), 0.6, 0.45); F.table(pc(2, 19.02, 0.3, 0), 0.42, 0.4, 0.6, DW); F.tlamp(pc(2, 19.02, 0.25, 0), 0.6, 0.4); pc(2, 19.02, 0.42, 0).spot('kNight', 0, 0.6, 0);
    F.wardrobe(pc(2, 19.63, 5.4, 3), 1.2, DW, 'kWard');
    F.dresser(pc(2, 14.31, 4.4, 1), 1.2, 3, DW, 'kDres', 0.95);
    F.armchair(pc(2, 16.8, 6.47, 2), '#3a2030');
    F.portrait(pc(2, 17.8, 0.07, 0), 1.9, 1, 0.55);
    F.rug(pc(2, 16.9, 3.6, 0), 2.2, 1.6, 'rugA');
    F.table(pc(2, 10.5, 6.27, 0), 0.9, 0.38, 0.8, DW); pc(2, 10.25, 6.27, 0).spot('aTable', 0, 0.8, 0);
    { const p = pc(2, 10.8, 6.27, 0); p.cyl(0, 0.92, 0, 0.08, 0.24, 10, 'p', '#5a6a7a', 0.6); p.cyl(0, 1.08, 0, 0.05, 0.08, 10, 'p', '#5a6a7a', 1.3); }
    F.chest(pc(2, 7.0, 8.7, 2), 0.9, '#4a3020'); pc(2, 7.0, 8.7, 2).spot('aChest', 0, 0.51, 0);
    F.pendant(pc(2, 9.5, 7.5, 0), 2.15, 0.85, '#4a3a2a'); F.sconce(pc(2, 12.0, 8.93, 2), 1.75, 0.45);
    F.portrait(pc(2, 10.5, 6.07, 0), 1.7, 2, 0.45); F.portrait(pc(2, 6.07, 8.0, 1), 1.6, 0, 0.4);
    F.desk(pc(2, 17.2, 11.2, 2), 1.4, '#3a2418'); F.chair(pc(2, 17.2, 10.45, 0), '#2a1a10'); F.tlamp(pc(2, 16.65, 11.3, 2), 0.76, 0.6, '#2a4a2a'); pc(2, 17.5, 11.3, 2).spot('sDesk', 0, 0.76, 0);
    F.shelf(pc(2, 14.27, 10.5, 1), 2.0, 2.2, 0.36, true); F.shelf(pc(2, 14.27, 12.85, 1), 1.6, 2.2, 0.36, true);
    F.shelf(pc(2, 17.5, 7.25, 0), 2.0, 2.2, 0.36, true); pc(2, 17.2, 7.25, 0).spot('sShelf', 0, 0.79, 0.04);
    F.armchair(pc(2, 19.49, 13.2, 3), '#2a3a2a');
    { const p = pc(2, 19.3, 8.3, 0); p.cyl(0, 0.35, 0, 0.04, 0.7, 8, 'w', DW); p.cyl(0, 0.02, 0, 0.2, 0.04, 10, 'w', DW); p.sph(0, 0.95, 0, 0.24, 0.24, 0.24, 'p', '#6a7a5a'); p.col(0, 0, 0.45, 0.45); }
    F.rug(pc(2, 17.2, 11.0, 0), 2.4, 2.0, 'rugB');
    F.cot(pc(2, 7.4, 9.4, 0));
    F.bed(pc(2, 7.12, 13.4, 1), 0.9, '#c8bca8', '#7a5a5a', 'nBed');
    F.wardrobe(pc(2, 11.5, 9.37, 0), 1.1, '#a8987e', 'nWard');
    F.horse(pc(2, 9.8, 11.6, 1)); F.chest(pc(2, 12.4, 13.68, 2), 0.8, '#6a4a6a'); pc(2, 12.4, 13.68, 2).spot('nChest', 0, 0.51, 0);
    F.table(pc(2, 8.9, 11.0, 0), 0.6, 0.6, 0.55, '#c8bca8'); F.tlamp(pc(2, 8.75, 11.1, 0), 0.55, 0.32, '#c8a0a0'); pc(2, 9.05, 10.9, 0).spot('nTable', 0, 0.55, 0);
    { const p = pc(2, 12.6, 11.4, 3); p.box(0, 0.3, 0, 0.3, 0.6, 0.3, 'w', '#a8987e'); p.sph(0, 0.72, 0, 0.09, 0.1, 0.08, 'p', '#e8dcc8'); p.box(0, 0.48, 0.02, 0.18, 0.2, 0.12, 'f', '#8a5a6a'); p.col(0, 0, 0.32, 0.32); }
    F.bench(pc(0, 11.5, 0.38, 0), 1.8); pc(0, 11.0, 0.32, 0).spot('cBench', 0, 0.9, 0);
    F.rack(pc(0, 6.3, 3.0, 1), 2.0, 1.9, 0.45); pc(0, 6.3, 3.3, 1).spot('cShelf', 0, 0.72, 0);
    F.rack(pc(0, 6.3, 5.8, 1), 1.4, 1.9, 0.45);
    F.sheet(pc(0, 9.6, 6.2, 0), 1.6, 0.8, 1.0); F.sheet(pc(0, 11.3, 11.6, 1), 1.2, 0.7, 1.3);
    F.crate(pc(0, 12.4, 13.4, 0), 0.6); F.crate(pc(0, 7.5, 13.4, 0), 0.6); F.crate(pc(0, 6.5, 13.45, 0), 0.6); F.barrel(pc(0, 10.2, 13.5, 0)); F.barrel(pc(0, 9.5, 13.55, 0), '#4a3a2a');
    { const p = pc(0, 9.5, 8.8, 0); p.box(0, 1.4, 0, 0.3, 2.8, 0.3, 'p', '#5a5650'); p.col(0, 0, 0.3, 0.3); }
    pc(0, 12.2, 7.8, 0).spot('cFloor', 0, 0, 0);
    F.bulb(pc(0, 9.5, 3.5, 0), 2.2, 0.65); F.bulb(pc(0, 9.5, 10.8, 0), 2.2, 0.5);
    F.boiler(pc(0, 18.6, 1.3, 0)); { const p = pc(0, 16.0, 0.8, 0); p.sph(0, 0.1, 0, 0.7, 0.32, 0.5, 'p', '#161412'); p.col(0, 0, 1.2, 0.9); }
    F.rack(pc(0, 19.68, 5.0, 3), 1.4, 1.9, 0.45); pc(0, 19.68, 5.2, 3).spot('oShelf', 0, 0.72, 0);
    F.bulb(pc(0, 16.0, 3.8, 0), 2.2, 0.45);
    { const p = pc(0, 16.5, 0.2, 0); p.cyl(0, 2.55, 0, 0.06, 6.0, 8, 'm', '#4a4038', null, 0, Math.PI / 2); }
    F.wardrobe(pc(0, 19.63, 9.0, 3), 1.1, '#4a3a2a', 'vWard');
    F.rack(pc(0, 16.5, 7.3, 0), 2.4, 1.9, 0.45); pc(0, 16.0, 7.3, 0).spot('vShelf', 0, 0.72, 0);
    F.sheet(pc(0, 17.0, 12.0, 0), 1.4, 0.9, 1.2); F.crate(pc(0, 14.4, 13.4, 0), 0.7); F.crate(pc(0, 15.2, 13.45, 0), 0.5);
    { const p = pc(0, 13.35, 12.8, 1); p.box(0, 0.95, 0, 1.0, 1.9, 0.2, 'f', '#8a8470', 0.18); p.col(0, 0, 1.0, 0.4); }
    pc(0, 18.4, 13.2, 0).spot('vFloor', 0, 0, 0);
    F.bulb(pc(0, 16.5, 10.5, 0), 2.2, 0.45);
  }
  const CLUES = [
    { lv: 2, x: 7.4, y: 1.65, z: 9.075, nx: 0, nz: 1 }, { lv: 0, x: 12.925, y: 1.5, z: 6.5, nx: -1, nz: 0 }, { lv: 1, x: 19.0, y: 1.6, z: 0.075, nx: 0, nz: 1 },
    { lv: 2, x: 11.14, y: 1.58, z: 3.6, nx: 1, nz: 0 }, { lv: 1, x: 4.5, y: 1.5, z: 4.925, nx: 0, nz: -1 }, { lv: 0, x: 18.5, y: 1.5, z: 7.075, nx: 0, nz: 1 }, { lv: 1, x: 0.075, y: 1.5, z: 12.5, nx: 1, nz: 0 }
  ];
  const CREAKS = [[1, 10, 9], [2, 10, 7], [1, 11, 12], [2, 7, 7], [1, 16, 8], [2, 12, 7], [1, 15, 4], [2, 9, 11], [1, 12, 8], [2, 8, 5]];
  const WIRES = [[0, 'v', 13, 3], [1, 'v', 9, 11], [2, 'h', 9, 9], [1, 'v', 6, 2], [0, 'v', 13, 10]];
  const TRAPS = [[2, 8, 7], [2, 11, 7], [1, 10, 10], [1, 12, 13], [1, 8, 5], [1, 12, 5], [1, 7, 9], [0, 8, 8], [0, 10, 4], [1, 15, 8], [1, 16, 4], [2, 16, 4], [2, 9, 12], [0, 15, 10]];
  const ITEMS = {
    hammer: { n: 'Hammer', at: ['cBench', 'oShelf', 'uShelf', 'gBench'] },
    padKey: { n: 'Padlock key', at: ['kDres0', 'kHutch1', 'bCab0', 'nChest'] },
    doorKey: { n: 'Front door key', at: ['sDesk', 'kNight', 'vFloor', 'kDres2'] },
    cutters: { n: 'Bolt cutters', at: ['cShelf', 'vShelf', 'gShelf'], need: 'chain' },
    studyKey: { n: 'Study key', at: ['hTable', 'lMantel', 'bTub', 'pShelf'] },
    garageKey: { n: 'Garage key', at: ['aChest', 'nTable', 'dSide1', 'rChest'] },
    carKey: { n: 'Car key', at: ['sShelf', 'kDres1', 'lSofa', 'kCounterE'] },
    battery: { n: 'Car battery', at: ['oShelf', 'vFloor', 'cFloor', 'pTable'] },
    fuel: { n: 'Fuel can', at: ['cFloor', 'vShelf', 'vFloor', 'gShelf'] },
    plug: { n: 'Spark plug', at: ['kHutch0', 'dSide0', 'aTable', 'nTable'], need: 'plug' },
    fuse: { n: 'Fuse', at: ['rDesk', 'bCab1', 'aTable', 'dTable', 'lShelf'] },
    camera: { n: 'Flash camera', at: ['sDesk', 'sShelf'] },
    bulb: { n: 'Flash bulb', at: ['kCounterW', 'lCoffee', 'rNight', 'cBench', 'pShelf', 'dSide2'], count: 2 },
    bottle: { n: 'Glass bottle', at: ['kTable', 'dTable', 'uShelf', 'hTable', 'aTable', 'cShelf', 'kCounterW'], count: 3 }
  };

  function makeBaker(H) {
    const L = H.LAMPS, cache = L.map(ll => ll.map(() => new Int8Array(W * D)));
    const vis = (lv, k, i, j) => { if (i < 0 || j < 0 || i >= W || j >= D) return false; const c = cache[lv][k], id = j * W + i; if (!c[id]) { const lp = L[lv][k]; c[id] = (i === Math.floor(lp.x) && j === Math.floor(lp.z)) || gridRay(lv, lp.x, lp.z, i + 0.5, j + 0.5, passLight) ? 1 : 2; } return c[id] === 1; };
    const FURN = H.COLL.map(cl => cl.filter(b => b.f & 16));
    const ewall = t => t === E_WALL || t === E_WIN || t === E_VENT;
    return function bakeAt(lv, x, y, z, nx, ny, nz, flag, out, omni) {
      let r = 0.045, g = 0.046, b = 0.062;
      if (flag === 3) { out[0] = 0.05; out[1] = 0.06; out[2] = 0.09; return out; }
      const px = x + nx * 0.06, pz = z + nz * 0.06, ci = Math.floor(px), cj = Math.floor(pz), rk = roomKey(lv, ci, cj), LL = L[lv];
      for (let k = 0; k < LL.length; k++) {
        const lp = LL[k], dx = lp.x - x, dy = lp.y - y, dz = lp.z - z, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > lp.R2) continue;
        const d = Math.sqrt(d2) || 1e-3, ndl = omni ? 0.6 : (dx * nx + dy * ny + dz * nz) / d;
        if (ndl < -0.25) continue;
        if (lp.room !== rk && !vis(lv, k, ci, cj)) continue;
        const f = 1 - d2 / lp.R2, att = lp.p / (1 + d2 / lp.r02) * f * f * Math.max(0, (ndl + 0.25) / 1.25);
        r += lp.c[0] * att; g += lp.c[1] * att; b += lp.c[2] * att;
      }
      const h = y - LY[lv];
      let ao = 1;
      if (flag === 0) ao = (0.5 + 0.5 * sstep(0, 0.9, h)) * (0.82 + 0.18 * sstep(0, 0.5, CEIL - h));
      else if (flag === 1) ao = 0.6 + 0.4 * sstep(0, 0.7, h);
      else if (flag === 4) ao = 0.8;
      else if (flag === 2) {
        for (const q of FURN[lv]) { if (px > q.x0 - 0.06 && px < q.x1 + 0.06 && pz > q.z0 - 0.06 && pz < q.z1 + 0.06) { ao = Math.min(ao, 0.38); } else if (px > q.x0 - 0.3 && px < q.x1 + 0.3 && pz > q.z0 - 0.3 && pz < q.z1 + 0.3) ao = Math.min(ao, 0.72); }
        const fx = px - ci, fz = pz - cj;
        if (fx < 0.3 && ewall(evAt(lv, ci, cj))) ao *= 0.6 + 0.4 * fx / 0.3; if (fx > 0.7 && ewall(evAt(lv, ci + 1, cj))) ao *= 0.6 + 0.4 * (1 - fx) / 0.3;
        if (fz < 0.3 && ewall(ehAt(lv, ci, cj))) ao *= 0.6 + 0.4 * fz / 0.3; if (fz > 0.7 && ewall(ehAt(lv, ci, cj + 1))) ao *= 0.6 + 0.4 * (1 - fz) / 0.3;
      }
      out[0] = Math.min(2, r * ao); out[1] = Math.min(2, g * ao); out[2] = Math.min(2, b * ao);
      return out;
    };
  }
  function toGeo(THREE, a, bake, lv, mtx) {
    const g = new THREE.BufferGeometry(), n = a.P.length / 3, B = new Float32Array(n * 3), o = [0, 0, 0], v = new THREE.Vector3(), nv = new THREE.Vector3(), nm = mtx ? new THREE.Matrix3().getNormalMatrix(mtx) : null;
    for (let i = 0; i < n; i++) {
      v.set(a.P[i * 3], a.P[i * 3 + 1], a.P[i * 3 + 2]); nv.set(a.N[i * 3], a.N[i * 3 + 1], a.N[i * 3 + 2]);
      if (mtx) { v.applyMatrix4(mtx); nv.applyMatrix3(nm).normalize(); }
      bake(lv, v.x, v.y, v.z, nv.x, nv.y, nv.z, a.F[i], o);
      B[i * 3] = o[0]; B[i * 3 + 1] = o[1]; B[i * 3 + 2] = o[2];
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(a.P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(a.N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(a.U, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(a.C, 3)); g.setAttribute('bake', new THREE.BufferAttribute(B, 3));
    g.computeBoundingSphere();
    return g;
  }
  function collGrid(COLL) {
    return COLL.map(list => {
      const G = Array.from({ length: W * D }, () => []);
      list.forEach((b, k) => { for (let j = Math.max(0, Math.floor(b.z0 - 0.45)); j <= Math.min(D - 1, Math.floor(b.z1 + 0.45)); j++) for (let i = Math.max(0, Math.floor(b.x0 - 0.45)); i <= Math.min(W - 1, Math.floor(b.x1 + 0.45)); i++) G[j * W + i].push(k); });
      return G;
    });
  }
  function makeNav(COLL, doorAtEdge) {
    const N = 3 * W * D, walk = new Uint8Array(N);
    for (let lv = 0; lv < 3; lv++) for (let j = 0; j < D; j++) for (let i = 0; i < W; i++) {
      const c = cellAt(lv, i, j); if (c === '.' || c === 'O') continue;
      const cx = i + 0.5, cz = j + 0.5;
      let ok = 1;
      for (const b of COLL[lv]) if ((b.f & 16) && b.x0 < cx + 0.28 && b.x1 > cx - 0.28 && b.z0 < cz + 0.28 && b.z1 > cz - 0.28) { ok = 0; break; }
      walk[lv * W * D + j * W + i] = ok;
    }
    const links = new Map();
    STAIRS.forEach(s => { const li = s.x + s.dx * (s.n - 1), lj = s.z + s.dz * (s.n - 1), ei = s.x + s.dx * s.n, ej = s.z + s.dz * s.n; const a = s.lv * W * D + lj * W + li, b = (s.lv + 1) * W * D + ej * W + ei; const ax = s.dz ? 'h' : 'v', ex = s.dz ? li : Math.max(li, ei), ez = s.dz ? Math.max(lj, ej) : lj; const l = { a, b, lv: s.lv + 1, ax, x: ex, z: ez }; links.set(a, l); links.set(b, l); });
    const edgeT = (lv, ax, x, z) => ax === 'v' ? evAt(lv, x, z) : ehAt(lv, x, z);
    const g = new Float32Array(N), came = new Int32Array(N), seen = new Int32Array(N), shut = new Int32Array(N);
    let stamp = 0;
    function find(from, to) {
      if (from < 0 || to < 0 || !walk[from] || !walk[to]) return null;
      stamp++;
      const tl = (to / (W * D)) | 0, tj = ((to % (W * D)) / W) | 0, ti = to % W;
      const hf = id => { const l = (id / (W * D)) | 0, j = ((id % (W * D)) / W) | 0, i = id % W; return Math.hypot(i - ti, j - tj) + Math.abs(l - tl) * 3; };
      const heap = [from], fv = new Map([[from, hf(from)]]);
      g[from] = 0; seen[from] = stamp; came[from] = -1;
      const push = id => { heap.push(id); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (fv.get(heap[p]) <= fv.get(heap[k])) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
      const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && fv.get(heap[l]) < fv.get(heap[m])) m = l; if (r < heap.length && fv.get(heap[r]) < fv.get(heap[m])) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
      const relax = (cur, nb, cost) => { if (!walk[nb] || shut[nb] === stamp) return; const ng = g[cur] + cost; if (seen[nb] !== stamp || ng < g[nb]) { seen[nb] = stamp; g[nb] = ng; came[nb] = cur; fv.set(nb, ng + hf(nb)); push(nb); } };
      let n = 0;
      while (heap.length && n++ < 4000) {
        const cur = pop(); if (shut[cur] === stamp) continue; shut[cur] = stamp;
        if (cur === to) { const out = []; for (let k = cur; k >= 0; k = came[k]) out.push(k); return out.reverse(); }
        const lv = (cur / (W * D)) | 0, j = ((cur % (W * D)) / W) | 0, i = cur % W, base = lv * W * D;
        const pass = (t, ax, x, z) => { if (t === E_OPEN || t === E_ARCH) return 1; if (t === E_DOOR) { const d = doorAtEdge(lv, ax, x, z); return d ? (d.locked ? 4 : d.a > 0.5 ? 1 : 1.6) : 1.6; } return 0; };
        let c;
        if (i > 0 && (c = pass(evAt(lv, i, j), 'v', i, j))) relax(cur, base + j * W + i - 1, c);
        if (i < W - 1 && (c = pass(evAt(lv, i + 1, j), 'v', i + 1, j))) relax(cur, base + j * W + i + 1, c);
        if (j > 0 && (c = pass(ehAt(lv, i, j), 'h', i, j))) relax(cur, base + (j - 1) * W + i, c);
        if (j < D - 1 && (c = pass(ehAt(lv, i, j + 1), 'h', i, j + 1))) relax(cur, base + (j + 1) * W + i, c);
        for (const [di, dj] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= W || nj >= D) continue;
          if (!walk[base + j * W + ni] || !walk[base + nj * W + i]) continue;
          const vx = di > 0 ? i + 1 : i, hz = dj > 0 ? j + 1 : j;
          if (evAt(lv, vx, j) || evAt(lv, vx, nj) || ehAt(lv, i, hz) || ehAt(lv, ni, hz)) continue;
          relax(cur, base + nj * W + ni, 1.414);
        }
        const L = links.get(cur);
        if (L) { const t = edgeT(L.lv, L.ax, L.x, L.z), cc = pass(t, L.ax, L.x, L.z); if (cc) relax(cur, L.a === cur ? L.b : L.a, cc + 0.5); }
      }
      return null;
    }
    const nodeAt = (lv, x, z) => { const i = Math.floor(x), j = Math.floor(z); if (i < 0 || j < 0 || i >= W || j >= D) return -1; let id = lv * W * D + j * W + i; if (walk[id]) return id; if (stairOf(lv, i, j) && lv > 0 && cellAt(lv, i, j) === 'O') { id = (lv - 1) * W * D + j * W + i; if (walk[id]) return id; } let best = -1, bd = 9; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= W || jj >= D) continue; const k = lv * W * D + jj * W + ii; if (!walk[k]) continue; const dd = Math.hypot(ii + 0.5 - x, jj + 0.5 - z); if (dd < bd) { bd = dd; best = k; } } return best; };
    const pos = id => { const lv = (id / (W * D)) | 0, j = ((id % (W * D)) / W) | 0, i = id % W; return { lv, x: i + 0.5, z: j + 0.5 }; };
    return { walk, find, nodeAt, pos, links };
  }

  function itemGeos(THREE, H, own) {
    const { addGeo, tint, GB, GC, GS, gcone } = H;
    const mk = fn => { const a = { P: [], N: [], U: [], C: [], F: [] }; const b = (x, y, z, sx, sy, sz, c, rx, ry, rz) => addGeo(a, GB, [x, y, z], [rx || 0, ry || 0, rz || 0], [sx, sy, sz], tint(c), 4, 0); const cy = (x, y, z, r, h, c, rx, rz, n, rt) => addGeo(a, rt != null ? gcone(rt, 1, n || 10) : GC(n || 12), [x, y, z], [rx || 0, 0, rz || 0], [r, h, r], tint(c), 4, 0); const sp = (x, y, z, sx, sy, sz, c) => addGeo(a, GS, [x, y, z], [0, 0, 0], [sx, sy, sz], tint(c), 4, 0); const tor = (x, y, z, R, t, c, rx) => addGeo(a, own(new THREE.TorusGeometry(R, t, 6, 14)), [x, y, z], [rx || 0, 0, 0], [1, 1, 1], tint(c), 4, 0); fn(b, cy, sp, tor); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a.P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(a.N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(a.U, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(a.C, 3)); g.computeBoundingSphere(); g.computeBoundingBox(); return own(g); };
    const key = (tagc, big) => (b, cy, sp, tor) => { const s = big ? 1.5 : 1.15; tor(-0.07 * s, 0.008, 0, 0.026 * s, 0.007 * s, big ? '#4a4844' : '#b89a4a', Math.PI / 2); b(0.02 * s, 0.008, 0, 0.12 * s, 0.012 * s, 0.014 * s, big ? '#4a4844' : '#b89a4a'); b(0.07 * s, 0.008, 0.018 * s, 0.022 * s, 0.012 * s, 0.03 * s, big ? '#4a4844' : '#b89a4a'); b(0.045 * s, 0.008, 0.014 * s, 0.014 * s, 0.012 * s, 0.022 * s, big ? '#4a4844' : '#b89a4a'); if (tagc) { b(-0.15 * s, 0.004, 0.01, 0.07, 0.006, 0.045, tagc); cy(-0.108 * s, 0.006, 0.006, 0.003, 0.05, '#d8d0b8', 0, Math.PI / 2, 6); } };
    return {
      hammer: mk((b, cy) => { b(0, 0.016, 0, 0.32, 0.028, 0.032, '#7a5434'); b(0.17, 0.022, 0, 0.045, 0.044, 0.13, '#5a5a5e'); b(0.17, 0.022, -0.075, 0.035, 0.03, 0.03, '#4a4a4e'); b(-0.1, 0.016, 0, 0.1, 0.032, 0.036, '#2a2a2a'); }),
      padKey: mk(key(null, false)), studyKey: mk(key('#b8322a', false)), garageKey: mk(key('#2a5ab8', false)), doorKey: mk(key(null, true)),
      carKey: mk((b, cy, sp, tor) => { key(null, false)(b, cy, sp, tor); b(-0.13, 0.014, 0, 0.06, 0.026, 0.04, '#181818'); b(-0.13, 0.028, 0, 0.02, 0.004, 0.02, '#8a2020'); }),
      cutters: mk((b, cy) => { for (const s of [-1, 1]) { b(0, 0.016, s * 0.03, 0.42, 0.02, 0.02, '#6a6a6e', 0, s * 0.06); b(-0.16, 0.016, s * 0.045, 0.16, 0.03, 0.03, '#b82a2a', 0, s * 0.06); } b(0.23, 0.018, 0, 0.09, 0.035, 0.05, '#4a4a4e'); cy(0.18, 0.018, 0, 0.018, 0.04, '#3a3a3e'); }),
      battery: mk((b, cy) => { b(0, 0.1, 0, 0.27, 0.19, 0.17, '#1e1e20'); b(0, 0.2, 0, 0.27, 0.015, 0.17, '#2a2a2c'); cy(0.08, 0.215, 0.04, 0.014, 0.03, '#b82a2a'); cy(-0.08, 0.215, 0.04, 0.014, 0.03, '#2a2a2a'); b(0, 0.12, 0.086, 0.2, 0.05, 0.003, '#c8b040'); b(0, 0.23, -0.03, 0.12, 0.02, 0.02, '#111'); }),
      fuel: mk((b, cy) => { b(0, 0.17, 0, 0.3, 0.33, 0.14, '#a82018'); b(0, 0.17, 0.071, 0.22, 0.22, 0.003, '#8a1810'); b(-0.03, 0.36, 0, 0.16, 0.04, 0.03, '#a82018'); cy(0.11, 0.37, 0, 0.022, 0.07, '#2a2a2a'); }),
      plug: mk((b, cy) => { const s = 1.6; cy(0, 0.012 * s, 0, 0.011 * s, 0.05 * s, '#e8e4d8', 0, Math.PI / 2); cy(0.04 * s, 0.012 * s, 0, 0.013 * s, 0.02 * s, '#8a8a8e', 0, Math.PI / 2, 6); cy(0.06 * s, 0.012 * s, 0, 0.007 * s, 0.025 * s, '#a8a8aa', 0, Math.PI / 2); cy(-0.032 * s, 0.012 * s, 0, 0.004 * s, 0.02 * s, '#8a8a8e', 0, Math.PI / 2); }),
      fuse: mk((b, cy) => { const s = 1.8; cy(0, 0.012 * s, 0, 0.011 * s, 0.05 * s, '#c8e0e8', 0, Math.PI / 2); for (const x of [-0.03, 0.03]) cy(x * s, 0.012 * s, 0, 0.012 * s, 0.014 * s, '#b89a4a', 0, Math.PI / 2); cy(0, 0.012 * s, 0, 0.002 * s, 0.05 * s, '#5a4a2a', 0, Math.PI / 2, 6); }),
      camera: mk((b, cy, sp) => { b(0, 0.055, 0, 0.16, 0.1, 0.09, '#1c1c1e'); b(0, 0.055, 0.0455, 0.13, 0.07, 0.002, '#2c2c2e'); cy(0, 0.055, 0.06, 0.03, 0.03, '#3a3a3e', Math.PI / 2); cy(0, 0.055, 0.076, 0.022, 0.004, '#20283a', Math.PI / 2); b(0.05, 0.115, -0.01, 0.03, 0.03, 0.03, '#8a8a8e'); cy(0.05, 0.16, 0.01, 0.06, 0.05, '#c8c8cc', Math.PI / 2.4, 0, 14, 0.3); b(-0.05, 0.11, 0, 0.02, 0.012, 0.02, '#8a8a8e'); }),
      bulb: mk((b, cy, sp) => { sp(0, 0.03, 0, 0.026, 0.03, 0.026, '#dce8f0'); cy(0, 0.006, 0, 0.012, 0.012, '#b89a4a'); }),
      bottle: mk((b, cy) => { cy(0, 0.1, 0, 0.034, 0.2, '#2a5a32', 0, 0, 10); cy(0, 0.22, 0, 0.034, 0.045, '#2a5a32', 0, 0, 10, 0.35); cy(0, 0.27, 0, 0.012, 0.06, '#2a5a32', 0, 0, 8); b(0, 0.1, 0.034, 0.04, 0.06, 0.002, '#c8b890'); })
    };
  }
  function keeperModel(THREE, H, own, faceTex) {
    const { tint } = H;
    const mat = H.probeMat({ vertexColors: true, shininess: 8 }), faceM = H.probeMat({ map: faceTex, shininess: 20 });
    const part = (parent, geo, x, y, z, sx, sy, sz, col, rx) => { const g = geo.clone(); const c = tint(col), n = g.attributes.position.count, C = new Float32Array(n * 3); for (let i = 0; i < n; i++) { C[i * 3] = c[0]; C[i * 3 + 1] = c[1]; C[i * 3 + 2] = c[2]; } g.setAttribute('color', new THREE.BufferAttribute(C, 3)); own(g); const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); if (rx) m.rotation.x = rx; parent.add(m); return m; };
    const B = own(new THREE.BoxGeometry(1, 1, 1)), CY = own(new THREE.CylinderGeometry(1, 1, 1, 12)), CN = own(new THREE.CylinderGeometry(0.7, 1, 1, 14, 1, true)), SP = own(new THREE.SphereGeometry(1, 14, 10));
    const COAT = '#1e1c1b', DARK = '#141312', SKIN = '#cfc6b6', TROU = '#25231f';
    const root = new THREE.Group(), hips = new THREE.Group(); hips.position.y = 1.0; root.add(hips);
    const leg = s => { const hip = new THREE.Group(); hip.position.set(s * 0.1, 0, 0); hips.add(hip); part(hip, B, 0, -0.25, 0, 0.13, 0.52, 0.14, TROU); const knee = new THREE.Group(); knee.position.y = -0.5; hip.add(knee); part(knee, B, 0, -0.23, 0, 0.11, 0.46, 0.12, TROU); part(knee, B, 0, -0.475, 0.06, 0.12, 0.06, 0.29, DARK); return { hip, knee }; };
    const L = leg(-1), R = leg(1);
    part(hips, CN, 0, -0.32, 0.01, 0.3, 0.66, 0.24, COAT);
    const torso = new THREE.Group(); hips.add(torso);
    part(torso, B, 0, 0.36, 0, 0.44, 0.74, 0.27, COAT); part(torso, B, 0, 0.7, 0, 0.5, 0.1, 0.3, COAT); part(torso, B, 0, 0.02, 0, 0.42, 0.06, 0.28, '#2a2016'); part(torso, B, 0.08, 0.02, 0.145, 0.06, 0.05, 0.01, '#8a7a4a');
    for (let i = 0; i < 4; i++) part(torso, CY, 0, 0.12 + i * 0.15, 0.137, 0.018, 0.012, 0.018, '#3a3530', Math.PI / 2);
    part(torso, CY, 0, 0.8, 0.0, 0.06, 0.12, 0.06, SKIN);
    const ring = own(new THREE.TorusGeometry(0.05, 0.006, 5, 12)); { const m = new THREE.Mesh(ring, mat); const g = ring; const c = tint('#9a8a5a'), n = g.attributes.position.count, C = new Float32Array(n * 3); for (let i = 0; i < n; i++) { C[i * 3] = c[0]; C[i * 3 + 1] = c[1]; C[i * 3 + 2] = c[2]; } g.setAttribute('color', new THREE.BufferAttribute(C, 3)); m.position.set(0.24, -0.04, 0.05); m.rotation.y = Math.PI / 2; torso.add(m); for (let k = 0; k < 4; k++) part(torso, B, 0.245, -0.1 - (k % 2) * 0.02, 0.02 + k * 0.022, 0.008, 0.07, 0.012, '#8a7a4a'); }
    const head = new THREE.Group(); head.position.y = 0.86; torso.add(head);
    part(head, SP, 0, 0.12, 0, 0.125, 0.16, 0.135, SKIN);
    const face = new THREE.Mesh(own(new THREE.SphereGeometry(1, 18, 14, Math.PI / 2 - Math.PI * 0.36, Math.PI * 0.72, Math.PI * 0.2, Math.PI * 0.62)), faceM); face.position.set(0, 0.12, 0); face.scale.set(0.128, 0.163, 0.138); head.add(face);
    part(head, CY, 0, 0.25, 0, 0.3, 0.018, 0.3, DARK); part(head, CY, 0, 0.36, 0, 0.165, 0.22, 0.165, DARK); part(head, CY, 0, 0.29, 0, 0.17, 0.035, 0.17, '#3a2a20');
    part(head, B, 0, -0.03, -0.02, 0.2, 0.08, 0.16, '#3a2a24');
    const arm = s => { const sh = new THREE.Group(); sh.position.set(s * 0.27, 0.64, 0); torso.add(sh); part(sh, B, 0, -0.21, 0, 0.1, 0.44, 0.11, COAT); const el = new THREE.Group(); el.position.y = -0.42; sh.add(el); part(el, B, 0, -0.2, 0, 0.09, 0.42, 0.1, COAT); part(el, B, 0, -0.4, 0, 0.1, 0.04, 0.11, DARK); const hand = new THREE.Group(); hand.position.y = -0.44; el.add(hand); part(hand, B, 0, -0.06, 0, 0.06, 0.12, 0.035, SKIN); for (let f = 0; f < 4; f++) part(hand, B, -0.022 + f * 0.015, -0.17, 0.004, 0.011, 0.11 + (f === 1 || f === 2 ? 0.02 : 0), 0.013, SKIN); return { sh, el, hand }; };
    const AL = arm(-1), AR = arm(1);
    const lantern = new THREE.Group(); lantern.position.set(0, -0.1, 0.04); AL.hand.add(lantern);
    part(lantern, B, 0, -0.08, 0, 0.012, 0.16, 0.012, '#3a3022'); part(lantern, B, 0, -0.17, 0, 0.13, 0.025, 0.13, '#8a7038'); part(lantern, B, 0, -0.38, 0, 0.14, 0.03, 0.14, '#8a7038');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(lantern, B, sx * 0.06, -0.275, sz * 0.06, 0.012, 0.2, 0.012, '#6a5a2c');
    const glowM = own(new THREE.MeshBasicMaterial({ color: 0xffc068 })), glass = new THREE.Mesh(own(new THREE.BoxGeometry(0.1, 0.17, 0.1)), glowM); glass.position.y = -0.275; lantern.add(glass);
    const light = new THREE.PointLight(0xffa850, 1.6, 9, 2); light.position.y = -0.27; lantern.add(light);
    root.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
    return { root, hips, torso, head, L, R, AL, AR, lantern, light, glowM, mat, faceM };
  }
  function trapGeo(THREE, H, own, sprung) {
    const { addGeo, tint, GB, GC } = H, a = { P: [], N: [], U: [], C: [], F: [] }, M = '#3a3834';
    addGeo(a, own(new THREE.TorusGeometry(0.17, 0.012, 5, 20)), [0, 0.012, 0], [Math.PI / 2, 0, 0], [1, 1, 1], tint(M), 4, 0);
    addGeo(a, GC(12), [0, 0.01, 0], [0, 0, 0], [0.05, 0.02, 0.05], tint('#5a5244'), 4, 0);
    addGeo(a, GB, [0, 0.008, 0], [0, 0, 0], [0.4, 0.008, 0.03], tint(M), 4, 0);
    for (const s of [-1, 1]) {
      const ang = sprung ? s * 1.3 : 0, cz = sprung ? s * 0.0 : s * 0.17;
      for (let k = 0; k < 7; k++) { const x = -0.13 + k * 0.043, h = 0.03; addGeo(a, GB, [x, sprung ? 0.085 : 0.02, sprung ? s * 0.012 : cz], [ang, 0, 0], [0.012, h + 0.02, 0.008], tint('#5a5650'), 4, 0); }
      addGeo(a, GB, [0, sprung ? 0.06 : 0.012, sprung ? s * 0.02 : cz], [ang, 0, 0], [0.32, sprung ? 0.1 : 0.012, 0.012], tint(M), 4, 0);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a.P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(a.N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(a.U, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(a.C, 3));
    return own(g);
  }

  function makeAudio(api) {
    let ctx = null, out = null, sfx = null, amb = null, ten = null, nb = null, pad = null, padF = null, str = null, strG = null, started = false, hb = 0, drum = 0;
    const ensure = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ctx.destination);
        out = ctx.createGain(); out.gain.value = api.muted ? 0 : 0.9; out.connect(comp);
        sfx = ctx.createGain(); sfx.connect(out); amb = ctx.createGain(); amb.gain.value = 0.8; amb.connect(out); ten = ctx.createGain(); ten.connect(out);
        nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
      return ctx;
    };
    const now = () => ctx.currentTime;
    const env = (g, t, a, peak, dur, rel) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.setValueAtTime(Math.max(0.0002, peak), t + a + Math.max(0, dur - a)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + (rel || 0.05)); };
    const tone = (dest, f0, f1, dur, type, vol, when, a, rel) => { const t = now() + (when || 0), o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur); env(g, t, a || 0.005, vol, dur, rel); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + (rel || 0.05) + 0.05); return o; };
    const noise = (dest, dur, vol, f, q, type, f1, when, a, rel) => { const t = now() + (when || 0), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = nb; fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q || 1; env(g, t, a || 0.004, vol, dur, rel); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + dur + (rel || 0.05) + 0.05); };
    const lp = new Map();
    const node3 = (x, y, z, occ) => {
      const p = ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 1.4; p.rolloffFactor = 1.3; p.maxDistance = 60;
      if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = occ || 12000; f.connect(p); p.connect(sfx);
      setTimeout(() => { try { f.disconnect(); p.disconnect(); } catch (e) {} }, 6000);
      return f;
    };
    const S = {
      step(d, surf, v) { const k = v || 0.5; if (surf === 'tile') { noise(d, 0.05, 0.18 * k, 2600, 1.5, 'bandpass'); tone(d, 160, 90, 0.06, 'sine', 0.12 * k); } else if (surf === 'con') { noise(d, 0.08, 0.2 * k, 1400, 0.8, 'bandpass', 700); tone(d, 110, 70, 0.07, 'sine', 0.1 * k); } else if (surf === 'soft') { noise(d, 0.09, 0.08 * k, 500, 0.7, 'lowpass'); } else { tone(d, 130, 70, 0.08, 'sine', 0.22 * k); noise(d, 0.06, 0.1 * k, 900, 1, 'bandpass', 400); } },
      creak(d, v) { const k = v || 1, t = now(), g = ctx.createGain(), f = ctx.createBiquadFilter(), oo = ctx.createOscillator(); oo.type = 'sawtooth'; oo.frequency.setValueAtTime(140 + Math.random() * 50, t); oo.frequency.linearRampToValueAtTime(110 + Math.random() * 60, t + 0.25); oo.frequency.linearRampToValueAtTime(85, t + 0.55); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 7; env(g, t, 0.03, 0.22 * k, 0.5, 0.15); oo.connect(f); f.connect(g); g.connect(d); oo.start(t); oo.stop(t + 0.8); },
      door(d, v) { const t = now(), g = ctx.createGain(), f = ctx.createBiquadFilter(), o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(190, t); o.frequency.linearRampToValueAtTime(260 + Math.random() * 80, t + 0.35); o.frequency.linearRampToValueAtTime(210, t + 0.6); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 9; env(g, t, 0.05, 0.08 * (v || 1), 0.55, 0.15); o.connect(f); f.connect(g); g.connect(d); o.start(t); o.stop(t + 0.85); noise(d, 0.12, 0.08 * (v || 1), 300, 1, 'lowpass', 0, 0.55); },
      shut(d) { tone(d, 110, 55, 0.18, 'sine', 0.35); noise(d, 0.12, 0.2, 500, 1, 'lowpass'); },
      locked(d) { for (let i = 0; i < 3; i++) { noise(d, 0.05, 0.16, 1800, 3, 'bandpass', 0, i * 0.09); tone(d, 700, 600, 0.05, 'square', 0.03, i * 0.09); } },
      unlock(d) { tone(d, 1200, 900, 0.05, 'square', 0.05); tone(d, 600, 500, 0.08, 'square', 0.05, 0.1); noise(d, 0.06, 0.18, 2400, 2, 'bandpass', 0, 0.1); },
      pick(d) { tone(d, 500, 760, 0.07, 'triangle', 0.08); noise(d, 0.05, 0.05, 3000, 1, 'highpass'); },
      drop(d, kind, v) { const k = v || 1; if (kind === 'soft') { noise(d, 0.12, 0.08 * k, 400, 0.7, 'lowpass'); return; } tone(d, 150, 60, 0.16, 'sine', 0.4 * k); noise(d, 0.1, 0.25 * k, 900, 1, 'bandpass'); if (kind === 'metal') { tone(d, 1300 + Math.random() * 400, 1200, 0.35, 'sine', 0.08 * k, 0.01); tone(d, 2400 + Math.random() * 500, 2300, 0.25, 'sine', 0.04 * k, 0.02); } },
      glass(d) { noise(d, 0.35, 0.4, 4500, 0.8, 'highpass'); for (let i = 0; i < 9; i++) tone(d, 2600 + Math.random() * 4000, 0, 0.08 + Math.random() * 0.12, 'sine', 0.05, Math.random() * 0.25); },
      plank(d) { noise(d, 0.18, 0.5, 700, 1.2, 'bandpass', 300); tone(d, 90, 50, 0.2, 'triangle', 0.3); noise(d, 0.25, 0.25, 1800, 2, 'bandpass', 900, 0.15); },
      pad(d) { tone(d, 900, 900, 0.04, 'square', 0.05); tone(d, 1400, 1300, 0.12, 'square', 0.05, 0.06); noise(d, 0.1, 0.2, 2000, 2, 'bandpass', 0, 0.05); },
      click(d) { tone(d, 2200, 2000, 0.025, 'square', 0.03); },
      chain(d) { noise(d, 0.08, 0.4, 3000, 2, 'bandpass'); for (let i = 0; i < 6; i++) tone(d, 1500 + Math.random() * 1500, 0, 0.12, 'sine', 0.06, 0.08 + i * 0.05); },
      clunk(d) { tone(d, 90, 45, 0.3, 'square', 0.12); noise(d, 0.2, 0.3, 600, 1, 'lowpass'); },
      hum(d) { const t = now(), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = 50; o2.type = 'sine'; o2.frequency.value = 100; env(g, t, 0.3, 0.05, 2.0, 1.0); o.connect(g); o2.connect(g); g.connect(d); o.start(t); o2.start(t); o.stop(t + 3.2); o2.stop(t + 3.2); },
      motor(d) { const t = now(), o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = 68; f.type = 'lowpass'; f.frequency.value = 500; lfo.frequency.value = 11; lg.gain.value = 0.12; lfo.connect(lg); lg.connect(g.gain); env(g, t, 0.2, 0.25, 4.6, 0.4); o.connect(f); f.connect(g); g.connect(d); o.start(t); lfo.start(t); o.stop(t + 5.2); lfo.stop(t + 5.2); for (let i = 0; i < 18; i++) noise(d, 0.05, 0.12, 2200, 3, 'bandpass', 0, 0.2 + i * 0.25); },
      crank(d) { for (let i = 0; i < 10; i++) { noise(d, 0.08, 0.35, 260, 1.2, 'bandpass', 0, i * 0.13); tone(d, 70, 50, 0.08, 'square', 0.08, i * 0.13); } },
      engine(d) { const t = now() + 1.3, o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(38, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.6); o.frequency.exponentialRampToValueAtTime(55, t + 1.6); f.type = 'lowpass'; f.frequency.value = 420; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.2); g.gain.setValueAtTime(0.4, t + 4); g.gain.exponentialRampToValueAtTime(0.0001, t + 6); o.connect(f); f.connect(g); g.connect(d); o.start(t); o.stop(t + 6.2); noise(d, 0.6, 0.3, 200, 0.8, 'lowpass', 0, 1.3); },
      flash(d) { tone(d, 1800, 7800, 0.45, 'sine', 0.04); noise(d, 0.15, 0.6, 3000, 0.5, 'highpass', 0, 0.45); tone(d, 400, 80, 0.2, 'triangle', 0.2, 0.45); },
      snap(d) { noise(d, 0.06, 0.8, 3500, 0.7, 'highpass'); tone(d, 190, 60, 0.18, 'square', 0.25); tone(d, 1800, 1700, 0.7, 'sine', 0.1, 0.01); tone(d, 2700, 2650, 0.5, 'sine', 0.05, 0.01); },
      cans(d) { for (let i = 0; i < 14; i++) { const w = Math.random() * 0.8; tone(d, 900 + Math.random() * 2200, 0, 0.1 + Math.random() * 0.15, 'triangle', 0.08, w); noise(d, 0.04, 0.15, 2500, 2, 'bandpass', 0, w); } },
      struggle(d) { noise(d, 0.12, 0.2, 1600, 1.5, 'bandpass'); tone(d, 1600 + Math.random() * 400, 0, 0.1, 'sine', 0.04, 0.02); },
      rustle(d) { noise(d, 0.25, 0.08, 1200, 0.7, 'bandpass', 600); },
      kstep(d) { tone(d, 95, 50, 0.14, 'sine', 0.55); noise(d, 0.08, 0.2, 500, 1, 'lowpass'); },
      keys(d) { for (let i = 0; i < 3; i++) { const w = Math.random() * 0.12; tone(d, 2800 + Math.random() * 2400, 0, 0.09, 'sine', 0.035, w); tone(d, 4200 + Math.random() * 1600, 0, 0.06, 'sine', 0.02, w + 0.01); } },
      humm(d) { const N = [64, 67, 66, 62, 64, 59, 60, 62, 57, 0, 64, 62, 60, 59], t0 = now(); N.forEach((m, i) => { if (!m) return; const f = 440 * Math.pow(2, (m - 81) / 12), t = t0 + i * 0.42, o = ctx.createOscillator(), v = ctx.createOscillator(), vg = ctx.createGain(), g = ctx.createGain(), bp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; v.frequency.value = 5.2; vg.gain.value = f * 0.012; v.connect(vg); vg.connect(o.frequency); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 1.2; env(g, t, 0.08, 0.16, 0.38, 0.1); o.connect(bp); bp.connect(g); g.connect(d); o.start(t); v.start(t); o.stop(t + 0.6); v.stop(t + 0.6); }); },
      shh(d, v) { noise(d, 1.0, 0.22 * (v || 1), 3800, 0.9, 'bandpass', 3200, 0, 0.12, 0.5); },
      gasp(d) { noise(d, 0.35, 0.3, 1400, 1.2, 'bandpass', 2600, 0, 0.05, 0.1); },
      sting() { const d = ten; [311, 330, 349, 370, 466].forEach((f, i) => tone(d, f, f * 0.98, 1.3, 'sawtooth', 0.035, i * 0.012, 0.01, 0.5)); noise(d, 0.6, 0.25, 5000, 0.6, 'highpass', 1500, 0, 0.01, 0.3); tone(d, 60, 35, 1.2, 'sine', 0.4, 0, 0.01, 0.4); },
      caught() { const d = ten; tone(d, 55, 28, 2.2, 'sine', 0.6, 0, 0.01, 0.6); noise(d, 1.2, 0.35, 300, 0.8, 'lowpass', 80, 0, 0.01, 0.6); [233, 247, 262].forEach(f => tone(d, f, f * 0.9, 2.0, 'sawtooth', 0.025, 0.05, 0.02, 0.6)); noise(d, 1.1, 0.25, 3800, 0.9, 'bandpass', 3000, 0.25, 0.1, 0.5); },
      bell() { const d = ten; [[196, 0.25], [392.8, 0.12], [588, 0.07], [1003, 0.03]].forEach(([f, v]) => tone(d, f, f * 0.995, 3.8, 'sine', v, 0, 0.005, 1.2)); },
      win() { const d = ten; [262, 330, 392, 523].forEach((f, i) => { tone(d, f, f, 2.4, 'triangle', 0.08, i * 0.18, 0.05, 0.8); tone(d, f * 2, f * 2, 2.0, 'sine', 0.03, i * 0.18, 0.05, 0.8); }); },
      lose() { const d = ten; [220, 208, 196, 147].forEach((f, i) => tone(d, f, f * 0.97, 1.6, 'sawtooth', 0.03, i * 0.5, 0.05, 0.6)); tone(d, 49, 36, 3, 'sine', 0.4, 1.4, 0.05, 1); },
      thunder() { noise(amb, 3.2, 0.5, 160, 0.6, 'lowpass', 60, 0.3 + Math.random() * 0.8, 0.2, 1.5); noise(amb, 0.4, 0.3, 900, 0.6, 'lowpass', 200, 0.2, 0.01, 0.3); },
      tick(d) { tone(d, 2400, 2200, 0.02, 'square', 0.02); noise(d, 0.02, 0.05, 4000, 2, 'bandpass'); },
      tap() { tone(sfx, 700, 900, 0.05, 'sine', 0.05); },
      ui() { tone(sfx, 520, 620, 0.06, 'triangle', 0.05); }
    };
    function startAmb() {
      if (started || !ctx) return; started = true;
      const loopN = (f, q, type, vol) => { const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = nb; s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(amb); s.start(); return { fl, g }; };
      loopN(1800, 0.4, 'bandpass', 0.07); loopN(500, 0.5, 'lowpass', 0.05);
      const wind = loopN(320, 1.2, 'bandpass', 0.03); const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 180; lfo.connect(lg); lg.connect(wind.fl.frequency); lfo.start();
      for (const f of [55, 55.6, 82.4]) { const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 160; g.gain.value = 0.018; o.connect(fl); fl.connect(g); g.connect(amb); o.start(); }
      padF = ctx.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 300; pad = ctx.createGain(); pad.gain.value = 0; padF.connect(pad); pad.connect(ten);
      for (const f of [116.5, 123.5, 174.6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = Math.random() * 10 - 5; o.connect(padF); o.start(); }
      str = ctx.createOscillator(); str.type = 'sawtooth'; str.frequency.value = 932; const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 6.5; vg.gain.value = 18; vib.connect(vg); vg.connect(str.frequency); const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1400; sf.Q.value = 2; strG = ctx.createGain(); strG.gain.value = 0; str.connect(sf); sf.connect(strG); strG.connect(ten); str.start(); vib.start();
    }
    let lastMute = null;
    return {
      get ctx() { return ctx; },
      unlock() { const c = ensure(); if (!c) return; if (c.state !== 'running') c.resume().catch(() => {}); startAmb(); },
      play(n, a, b) { if (!ctx || api.muted || ctx.state !== 'running') return; try { S[n](sfx, a, b); } catch (e) {} },
      at(n, x, y, z, occ, a, b) { if (!ctx || api.muted || ctx.state !== 'running') return; try { S[n](node3(x, y, z, occ), a, b); } catch (e) {} },
      listener(px, py, pz, fx, fy, fz) { if (!ctx) return; const L = ctx.listener; if (L.positionX) { L.positionX.value = px; L.positionY.value = py; L.positionZ.value = pz; L.forwardX.value = fx; L.forwardY.value = fy; L.forwardZ.value = fz; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; } else { L.setPosition(px, py, pz); L.setOrientation(fx, fy, fz, 0, 1, 0); } },
      tension(danger, chase, dt) {
        if (!ctx || !pad) return;
        const t = now();
        pad.gain.setTargetAtTime(danger * 0.06, t, 0.4); padF.frequency.setTargetAtTime(220 + danger * 900, t, 0.5);
        strG.gain.setTargetAtTime(chase * 0.022, t, 0.25);
        hb -= dt; if (danger > 0.25 && hb <= 0) { hb = 1.15 - danger * 0.6; tone(ten, 62, 40, 0.12, 'sine', 0.18 + danger * 0.3); tone(ten, 58, 38, 0.12, 'sine', 0.12 + danger * 0.22, 0.18); }
        drum -= dt; if (chase > 0.5 && drum <= 0) { drum = 0.42; tone(ten, 80, 38, 0.2, 'sine', 0.35); noise(ten, 0.06, 0.12, 2500, 1, 'bandpass'); }
      },
      tick() { if (!ctx) return; const m = !!api.muted; if (m !== lastMute) { lastMute = m; out.gain.setTargetAtTime(m ? 0 : 0.9, now(), 0.05); } },
      pause(on) { if (!ctx) return; if (on) ctx.suspend().catch(() => {}); else ctx.resume().catch(() => {}); },
      close() { if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
  }

  function run(root, wrap, api, V) {
    const { THREE, renderer, canvas, w, h } = V;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio; canvas.style.width = '100%'; wrap.prepend(canvas);
    const bin = [], own = o => (bin.push(o), o);
    renderer.shadowMap.enabled = false; renderer.toneMappingExposure = 1.5; renderer.autoClear = false;
    const PRQ = fitPR(api, V);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020203);
    const fog = new THREE.FogExp2(0x040406, 0.07); scene.fog = fog;
    const cam = new THREE.PerspectiveCamera(h > w ? 80 : 66, w / h, 0.03, 70); cam.rotation.order = 'YXZ';
    const ambL = new THREE.AmbientLight(0x9aa8d8, 0); scene.add(ambL);
    const garL = new THREE.PointLight(0xffd8a0, 0, 10, 2); garL.position.set(3, 2.55, 9.6); scene.add(garL);
    const audio = makeAudio(api);
    const H = buildHouse(THREE, own, null, renderer);
    furnish(H);
    const bake = makeBaker(H);
    const LG = [0, 1, 2].map(() => { const g = new THREE.Group(); scene.add(g); return g; });
    const carG = new THREE.Group(); scene.add(carG);
    const sample = (lv, x, y, z, out) => bake(clamp(lv, 0, 2), x, y, z, 0, 1, 0, 1, out, true);
    const tmp3 = [0, 0, 0];
    const DOORS = H.DOORS.map(d => {
      const lock = d.info.lock || null, front = d.t === E_FRONT, hg = d.info.hg || 0, s = d.info.s || 1;
      const dir = hg ? -1 : 1, hx = d.ax === 'v' ? d.X : d.J + (hg ? 0.96 : 0.04), hz = d.ax === 'v' ? d.J + (hg ? 0.96 : 0.04) : d.X;
      const thc = d.ax === 'v' ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? Math.PI / 2 : -Math.PI / 2), phi = 1.72;
      let tho = thc + phi; if ((d.ax === 'v' ? Math.sin(tho) : Math.cos(tho)) * s < 0) tho = thc - phi;
      const g = new THREE.Group(); g.position.set(hx, LY[d.lv], hz); g.rotation.y = thc;
      const a = { P: [], N: [], U: [], C: [], F: [] }, col = H.tint(front ? '#3a2a1e' : lock === 'studyKey' ? '#6a4a3a' : '#7a5a3c');
      const bx = new THREE.BoxGeometry(0.045, 2.06, 0.92); bx.translate(0, 1.03, 0.46);
      const nb = bx.toNonIndexed(); bx.dispose();
      const P = nb.attributes.position, N = nb.attributes.normal, U = nb.attributes.uv;
      for (let i = 0; i < P.count; i++) { a.P.push(P.getX(i), P.getY(i), P.getZ(i)); a.N.push(N.getX(i), N.getY(i), N.getZ(i)); const nx = Math.abs(N.getX(i)); a.U.push(nx > 0.5 ? U.getX(i) : U.getX(i) * 0.1, U.getY(i)); a.C.push(col[0], col[1], col[2]); a.F.push(0); }
      nb.dispose();
      for (const sd of [-1, 1]) { H.addGeo(a, H.GS, [sd * 0.055, 1.0, 0.8], [0, 0, 0], [0.028, 0.028, 0.028], H.tint('#a8904a'), 4, 1); H.addGeo(a, H.GB, [sd * 0.026, 1.0, 0.8], [0, 0, 0], [0.012, 0.18, 0.06], H.tint(lock === 'studyKey' ? '#b8322a' : lock === 'garageKey' ? '#2a5ab8' : '#6a5a3a'), 4, 1); }
      g.updateMatrixWorld(true);
      const geo = toGeo(THREE, a, bake, d.lv, g.matrixWorld); own(geo);
      const doorM = H.M.door || (H.M.door = H.bakeMat({ map: H.TX.door }));
      const mesh = new THREE.Mesh(geo, doorM); g.add(mesh); LG[d.lv].add(g);
      const box = { x0: 0, z0: 0, x1: 0, z1: 0, f: 1, on: true }, obox = { x0: 0, z0: 0, x1: 0, z1: 0, f: 1, on: false };
      if (d.ax === 'v') { box.x0 = d.X - 0.06; box.x1 = d.X + 0.06; box.z0 = d.J; box.z1 = d.J + 1; } else { box.z0 = d.X - 0.06; box.z1 = d.X + 0.06; box.x0 = d.J; box.x1 = d.J + 1; }
      const ox = hx + Math.sin(tho) * 0.92, oz = hz + Math.cos(tho) * 0.92;
      obox.x0 = Math.min(hx, ox) - 0.04; obox.x1 = Math.max(hx, ox) + 0.04; obox.z0 = Math.min(hz, oz) - 0.04; obox.z1 = Math.max(hz, oz) + 0.04;
      H.COLL[d.lv].push(box, obox);
      const cx = d.ax === 'v' ? d.X : d.J + 0.5, cz = d.ax === 'v' ? d.J + 0.5 : d.X;
      return { k: d.k, ei: d.ei, lv: d.lv, ax: d.ax, X: d.X, J: d.J, g, thc, tho, a: 0, want: 0, lock, locked: !!lock, front, box, obox, cx, cz, s, info: d.info, relock: 0 };
    });
    const doorByEi = new Map(DOORS.map(d => [d.ei, d]));
    const doorAtEdge = (lv, ax, x, z) => { const ei = ax === 'v' ? XV[lv][z * (W + 1) + x] : XH[lv][z * W + x]; return ei >= 0 ? doorByEi.get(ei) : null; };
    const FRONT = DOORS.find(d => d.front);
    const DRW = H.DRAWERS.map(dr => {
      const g = new THREE.Group(); g.position.copy(dr.base); g.rotation.y = dr.th; g.updateMatrixWorld(true);
      const geo = own(toGeo(THREE, dr.a, bake, dr.lv, g.matrixWorld)), m = new THREE.Mesh(geo, H.M.w); g.add(m); LG[dr.lv].add(g);
      dr.g = g; return dr;
    });
    const drawerById = new Map(DRW.map(d => [d.id, d]));
    H.WARD.forEach(wd => wd.doors.forEach(dd => { dd.g.updateMatrixWorld(true); const geo = own(toGeo(THREE, dd.a, bake, wd.lv, dd.g.matrixWorld)); dd.g.add(new THREE.Mesh(geo, H.M.w)); LG[wd.lv].add(dd.g); dd.th0 = dd.g.rotation.y; }));
    let staticTris = 0;
    for (let lv = 0; lv < 3; lv++) for (const k in H.ACC[lv]) {
      const a = H.ACC[lv][k]; if (!a.P.length) continue;
      const geo = own(toGeo(THREE, a, bake, lv, null)); staticTris += a.P.length / 9;
      const mat = H.M[k] || H.M.p, mesh = new THREE.Mesh(geo, mat); mesh.matrixAutoUpdate = false;
      LG[lv].add(mesh);
    }
    const PM = o => H.probeMat(o);
    const sbox = (geoW, geoH, geoD, col, matO) => own(new THREE.BoxGeometry(geoW, geoH, geoD));
    const solid = (parent, geo, col, x, y, z, rx, ry, rz, mo) => { const m = new THREE.Mesh(geo, PM(Object.assign({ color: col }, mo || {}))); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(m); return m; };
    const setProbe = (m, lv, x, y, z, add) => { sample(lv, x, y, z, tmp3); const p = m.material.userData.probe; if (p) p.value.setRGB(tmp3[0] + (add || 0), tmp3[1] + (add || 0), tmp3[2] + (add || 0)); };
    const FD = new THREE.Group(); LG[1].add(FD);
    const fz = 14 - WT - 0.03;
    const planks = [0, 1].map(i => { const m = solid(FD, sbox(1.24, 0.15, 0.03), 0x6a5236, 11.5, 1.15 + i * 0.55, fz - 0.03, 0, 0, i ? -0.16 : 0.14); setProbe(m, 1, 11.5, 1.3, 13.6); for (const sx of [-0.55, 0.55]) solid(m, sbox(0.02, 0.02, 0.02), 0x888888, sx, 0, -0.02); return m; });
    const hasp = solid(FD, sbox(0.05, 0.14, 0.02), 0x5a5a5a, 11.9, 0.98, fz - 0.005); setProbe(hasp, 1, 11.9, 1, 13.6);
    const padlock = new THREE.Group(); padlock.position.set(11.9, 0.88, fz - 0.03); FD.add(padlock);
    { const b = solid(padlock, sbox(0.07, 0.08, 0.03), 0xb89a4a, 0, 0, 0, 0, 0, 0, { shininess: 60 }); setProbe(b, 1, 11.9, 0.9, 13.6, 0.05); const s = solid(padlock, own(new THREE.TorusGeometry(0.025, 0.006, 5, 10, Math.PI)), 0x9a9a9a, 0, 0.04, 0); setProbe(s, 1, 11.9, 0.9, 13.6, 0.05); }
    const codeLock = new THREE.Group(); codeLock.position.set(11.9, 0.62, fz - 0.03); FD.add(codeLock);
    { const b = solid(codeLock, sbox(0.09, 0.1, 0.035), 0x2a2a2e, 0, 0, 0); setProbe(b, 1, 11.9, 0.6, 13.6, 0.05); for (let i = 0; i < 4; i++) { const wq = solid(codeLock, own(new THREE.CylinderGeometry(0.012, 0.012, 0.018, 10)), 0xc8c0a0, -0.03 + i * 0.02, -0.01, -0.02, 0, 0, Math.PI / 2); setProbe(wq, 1, 11.9, 0.6, 13.6, 0.05); } const hs = solid(FD, sbox(0.05, 0.12, 0.02), 0x5a5a5a, 11.9, 0.7, fz - 0.005); setProbe(hs, 1, 11.9, 0.7, 13.6); codeLock.userData.hasp = hs; }
    const chain = new THREE.Group(); FD.add(chain);
    { const lg = own(new THREE.TorusGeometry(0.03, 0.007, 5, 10)); for (let i = 0; i < 17; i++) { const m = solid(chain, lg, 0x6a6a6a, 11.02 + i * 0.06, 1.42 - Math.sin(i / 16 * Math.PI) * 0.08, fz - 0.035, 0, i % 2 ? Math.PI / 2 : 0, 0); setProbe(m, 1, 11.5, 1.4, 13.6, 0.03); } }
    const keyhole = solid(FD, sbox(0.06, 0.1, 0.015), 0x9a8040, 11.82, 1.02, fz + 0.008); setProbe(keyhole, 1, 11.82, 1.02, 13.6, 0.04);
    const fuseBox = new THREE.Group(); fuseBox.position.set(9.0, -3 + 1.45, 0.07 + 0.07); LG[0].add(fuseBox);
    { const b = solid(fuseBox, sbox(0.44, 0.56, 0.14), 0x5a5e60); setProbe(b, 0, 9, -1.5, 0.5, 0.02); const sl = solid(fuseBox, sbox(0.08, 0.14, 0.02), 0x1a1a1a, -0.08, 0.06, 0.075); setProbe(sl, 0, 9, -1.5, 0.5); fuseBox.userData.slot = sl; const pz = solid(fuseBox, sbox(0.3, 0.07, 0.01), 0xd8cc90, 0, 0.2, 0.075); setProbe(pz, 0, 9, -1.5, 0.5, 0.03); }
    const lever = new THREE.Group(); lever.position.set(0.27, 0, 0.0); fuseBox.add(lever);
    { const a = solid(lever, sbox(0.03, 0.22, 0.03), 0x8a2a20, 0, 0.1, 0); setProbe(a, 0, 9.2, -1.5, 0.5, 0.03); const k = solid(lever, own(new THREE.SphereGeometry(0.03, 8, 6)), 0x1a1a1a, 0, 0.22, 0); setProbe(k, 0, 9.2, -1.4, 0.5); lever.rotation.x = 2.4; }
    const fuseIn = solid(fuseBox, own(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8)), 0xc8e0e8, -0.08, 0.06, 0.09); fuseIn.visible = false; setProbe(fuseIn, 0, 9, -1.5, 0.5, 0.05);
    const roller = new THREE.Group(); roller.position.set(3, 2.4, 14 - 0.1); LG[1].add(roller);
    { const geo = own(new THREE.BoxGeometry(4.0, 0.2, 0.05)); for (let i = 0; i < 12; i++) { const m = solid(roller, geo, i % 2 ? 0x6a6e70 : 0x5e6264, 0, -0.1 - i * 0.2, 0, 0, 0, 0, { shininess: 40 }); setProbe(m, 1, 3, 1.2, 13.4, 0.01); } }
    const gate = new THREE.Group(); gate.position.set(3, 0, 16.2); scene.add(gate);
    { const bar = own(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6)); for (let i = 0; i < 22; i++) { const m = solid(gate, bar, 0x222428, -2.6 + i * 0.25, 1.1, 0); m.material.userData.probe.value.setRGB(0.05, 0.06, 0.1); } for (const y of [0.3, 1.9]) { const m = solid(gate, sbox(5.4, 0.06, 0.05), 0x222428, 0, y, 0); m.material.userData.probe.value.setRGB(0.05, 0.06, 0.1); } }
    const button = solid(LG[1], sbox(0.04, 0.16, 0.1), 0x3a3a3a, 5.93 - 0.02, 1.3, 8.6); setProbe(button, 1, 5.8, 1.3, 8.6, 0.03);
    const led = new THREE.Mesh(own(new THREE.SphereGeometry(0.014, 8, 6)), own(new THREE.MeshBasicMaterial({ color: 0x5a1010 }))); led.position.set(5.885, 1.35, 8.6); LG[1].add(led);
    const garBulb = new THREE.Mesh(own(new THREE.SphereGeometry(0.06, 10, 8)), own(new THREE.MeshBasicMaterial({ color: 0x3a3428 }))); garBulb.position.set(3, 2.6, 9.6); LG[1].add(garBulb);
    const CAR = new THREE.Group(); CAR.position.set(3.0, 0, 9.3); LG[1].add(CAR);
    { const p = H.pc(1, 0, 0, 0), saveAcc = H.ACC[1]; H.ACC[1] = {}; H.F.car(p); H.COLL[1].pop(); const carAcc = H.ACC[1]; H.ACC[1] = saveAcc; H.COLL[1].push({ x0: 3.0 - 0.92, x1: 3.0 + 0.92, z0: 9.3 - 2.18, z1: 9.3 + 2.18, f: 1 | 4 | 16, on: true }); CAR.updateMatrixWorld(true); for (const k in carAcc) { const geo = own(toGeo(THREE, carAcc[k], bake, 1, CAR.matrixWorld)); CAR.add(new THREE.Mesh(geo, H.M[k])); } }
    const hood = new THREE.Group(); hood.position.set(0, 0.8, -0.88); CAR.add(hood);
    { const m = solid(hood, sbox(1.72, 0.04, 1.28), 0x2e4436, 0, 0.02, -0.64, 0, 0, 0, { shininess: 30 }); setProbe(m, 1, 3, 1, 7.5, 0.01); }
    { const m = solid(CAR, sbox(0.9, 0.1, 0.7), 0x2a2a2a, 0, 0.84, -1.6); setProbe(m, 1, 3, 1, 7.5); const t = solid(CAR, sbox(0.32, 0.05, 0.22), 0x1a1a1a, 0.5, 0.82, -1.25); setProbe(t, 1, 3, 1, 7.5); }
    const carBat = solid(CAR, sbox(0.27, 0.19, 0.17), 0x1e1e20, 0.5, 0.92, -1.25); carBat.visible = false; setProbe(carBat, 1, 3, 1, 7.5);
    const carPlug = solid(CAR, own(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8)), 0xe8e4d8, -0.1, 0.94, -1.6); carPlug.visible = false; setProbe(carPlug, 1, 3, 1, 7.5);
    const fuelCap = solid(CAR, own(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10)), 0x8a8a8a, -0.9, 0.72, 1.45, 0, 0, Math.PI / 2); setProbe(fuelCap, 1, 2.1, 0.7, 10.7, 0.02);
    const headL = [-1, 1].map(sx => { const m = new THREE.Mesh(own(new THREE.PlaneGeometry(0.26, 0.14)), own(new THREE.MeshBasicMaterial({ color: 0x2a2820 }))); m.position.set(sx * 0.62, 0.64, -2.16); m.rotation.y = Math.PI; CAR.add(m); return m; });
    const carLight = new THREE.SpotLight(0xfff0d0, 0, 18, 0.5, 0.5, 1.5); carLight.position.set(0, 0.7, -2.2); CAR.add(carLight); const clt = new THREE.Object3D(); clt.position.set(0, 0.2, -8); CAR.add(clt); carLight.target = clt;
    const clueTex = CLUES.map(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const t = own(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; return { c, t }; });
    const clueMesh = CLUES.map((q, i) => { const m = new THREE.Mesh(own(new THREE.PlaneGeometry(0.42, 0.42)), PM({ map: clueTex[i].t, transparent: true, alphaTest: 0.08, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.set(q.x + q.nx * 0.005, LY[q.lv] + q.y, q.z + q.nz * 0.005); m.rotation.y = Math.atan2(q.nx, q.nz); m.visible = false; setProbe(m, q.lv, q.x + q.nx * 0.3, LY[q.lv] + q.y, q.z + q.nz * 0.3, 0.06); LG[q.lv].add(m); return m; });
    const creakMesh = CREAKS.map(([lv, i, j]) => { const g = new THREE.Group(); g.position.set(i + 0.5, LY[lv] + 0.004, j + 0.5); for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(own(new THREE.PlaneGeometry(0.17, 0.95)), PM({ color: 0x2a1c12 })); m.rotation.x = -Math.PI / 2; m.position.x = -0.09 + k * 0.18; g.add(m); setProbe(m, lv, i + 0.5, LY[lv] + 0.1, j + 0.5); } g.visible = false; LG[lv].add(g); return g; });
    const wireMesh = WIRES.map(([lv, ax, x, z]) => {
      const g = new THREE.Group(), y = LY[lv] + 1.15; if (ax === 'v') g.position.set(x, y, z + 0.5); else g.position.set(x + 0.5, y, z);
      g.rotation.y = ax === 'v' ? 0 : Math.PI / 2;
      const wm = new THREE.Mesh(own(new THREE.CylinderGeometry(0.004, 0.004, 0.96, 4)), PM({ color: 0x9a9a9a, shininess: 60 })); wm.rotation.x = Math.PI / 2; g.add(wm); setProbe(wm, lv, g.position.x, y, g.position.z, 0.1);
      for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(own(new THREE.CylinderGeometry(0.033, 0.033, 0.1, 10)), PM({ color: 0x8a8a84, shininess: 50 })); c.position.set(0, -0.12, -0.3 + k * 0.3); g.add(c); setProbe(c, lv, g.position.x, y, g.position.z, 0.08); const s = new THREE.Mesh(own(new THREE.CylinderGeometry(0.002, 0.002, 0.08, 3)), c.material); s.position.set(0, -0.04, -0.3 + k * 0.3); g.add(s); }
      g.visible = false; LG[lv].add(g); return g;
    });
    const trapOpenG = trapGeo(THREE, H, own, false), trapShutG = trapGeo(THREE, H, own, true);
    const trapPool = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(trapOpenG, PM({ vertexColors: true, shininess: 40 })); m.visible = false; scene.add(m); return m; });
    const IG = itemGeos(THREE, H, own);
    const ITEMLIST = [];
    for (const k in ITEMS) { const n = ITEMS[k].count || 1; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(IG[k], PM({ vertexColors: true, shininess: 40, emissive: 0x0c0a08 })); m.visible = false; scene.add(m); const bb = IG[k].boundingBox; ITEMLIST.push({ k, i, mesh: m, lv: 1, x: 0, y: 0, z: 0, ry: 0, spot: null, dr: null, st: 'x', vx: 0, vy: 0, vz: 0, fly: false, size: [Math.max(0.1, (bb.max.x - bb.min.x) / 2 + 0.06), Math.max(0.06, (bb.max.y - bb.min.y) / 2 + 0.05), Math.max(0.1, (bb.max.z - bb.min.z) / 2 + 0.06)], cy: (bb.max.y + bb.min.y) / 2 }); } }
    const vscene = new THREE.Scene(), vg = new THREE.Group(); vscene.add(vg);
    const vItems = {}; for (const k in IG) { const m = new THREE.Mesh(IG[k], PM({ vertexColors: true, shininess: 40 })); m.visible = false; vg.add(m); vItems[k] = m; }
    const faceC = document.createElement('canvas'); faceC.width = faceC.height = 256; paintFace(faceC.getContext('2d'), 256); const faceT = own(new THREE.CanvasTexture(faceC)); faceT.encoding = THREE.sRGBEncoding;
    const KM = keeperModel(THREE, H, own, faceT); scene.add(KM.root); KM.root.visible = false;
    const tvTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 48; const t = own(new THREE.CanvasTexture(c)); return { c, g: c.getContext('2d'), t }; })();
    const tvScreen = new THREE.Mesh(own(new THREE.PlaneGeometry(0.5, 0.4)), own(new THREE.MeshBasicMaterial({ map: tvTex.t, color: 0x8090a0 }))); tvScreen.position.set(19.35, 0.8, 13.62 - 0.258); tvScreen.rotation.y = Math.PI; LG[1].add(tvScreen);
    const roofM = own(new THREE.MeshBasicMaterial({ color: 0x07080a }));
    { const r1 = new THREE.Mesh(own(new THREE.PlaneGeometry(6, 9)), roofM); r1.rotation.x = -Math.PI / 2; r1.position.set(3, 3.0, 9.5); scene.add(r1); const r2 = new THREE.Mesh(own(new THREE.PlaneGeometry(14.4, 14.4)), roofM); r2.rotation.x = -Math.PI / 2; r2.position.set(13, 6.0, 7); scene.add(r2); const gr = new THREE.Mesh(own(new THREE.PlaneGeometry(60, 30)), PM({ color: 0x101810 })); gr.rotation.x = -Math.PI / 2; gr.position.set(10, -0.02, 29); gr.material.userData.probe.value.setRGB(0.04, 0.05, 0.08); scene.add(gr); const trunk = own(new THREE.CylinderGeometry(0.18, 0.25, 6, 7)), crown = own(new THREE.ConeGeometry(1.6, 5, 8)), tm = PM({ color: 0x0c0e0c }); tm.userData.probe.value.setRGB(0.03, 0.035, 0.06); const R0 = mkRng(7); for (let i = 0; i < 26; i++) { const x = -6 + R0() * 32, z = 17.5 + R0() * 14; if (Math.abs(x - 3) < 2.2 && z < 24) continue; const t = new THREE.Mesh(trunk, tm); t.position.set(x, 3, z); scene.add(t); const c = new THREE.Mesh(crown, tm); c.position.set(x, 6 + R0(), z); scene.add(c); } }

    const CG = collGrid(H.COLL), NAV = makeNav(H.COLL, doorAtEdge);
    const stampA = H.COLL.map(l => new Int32Array(l.length)); let stampN = 0;
    function collide(lv, o, r, crouch, keeper) {
      const L = H.COLL[lv], G = CG[lv], st = stampA[lv];
      for (let it = 0; it < 3; it++) {
        stampN++; let hit = false;
        const i0 = Math.max(0, Math.floor(o.x - r)), i1 = Math.min(W - 1, Math.floor(o.x + r)), j0 = Math.max(0, Math.floor(o.z - r)), j1 = Math.min(D - 1, Math.floor(o.z + r));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) for (const k of G[j * W + i]) {
          if (st[k] === stampN) continue; st[k] = stampN;
          const b = L[k]; if (!b.on) continue; if ((b.f & 8) && crouch && !keeper) continue;
          const qx = o.x < b.x0 ? b.x0 : o.x > b.x1 ? b.x1 : o.x, qz = o.z < b.z0 ? b.z0 : o.z > b.z1 ? b.z1 : o.z, dx = o.x - qx, dz = o.z - qz, d2 = dx * dx + dz * dz;
          if (d2 >= r * r) continue;
          hit = true;
          if (d2 > 1e-9) { const d = Math.sqrt(d2), p = (r - d) / d; o.x += dx * p; o.z += dz * p; }
          else { const l = o.x - b.x0, rr = b.x1 - o.x, t = o.z - b.z0, bt = b.z1 - o.z, m = Math.min(l, rr, t, bt); if (m === l) o.x = b.x0 - r; else if (m === rr) o.x = b.x1 + r; else if (m === t) o.z = b.z0 - r; else o.z = b.z1 + r; }
        }
        if (!hit) break;
      }
      if (o.x < 0.2) o.x = 0.2; if (o.z < 0.2) o.z = 0.2; if (o.x > W - 0.2) o.x = W - 0.2; if (o.z > D - 0.2) o.z = D - 0.2;
    }
    const seePass = [0, 1, 2].map(lv => (t, ax, x, z) => { if (t === E_OPEN || t === E_ARCH) return true; if (t === E_DOOR || t === E_FRONT) { const d = doorAtEdge(lv, ax, x, z); return !!d && d.a > 0.45; } if (t === E_ROLL) return !!(R && R.garage >= 2); return false; });
    let blockT = 1;
    const blockPass = [0, 1, 2].map(lv => (t, ax, x, z, tm) => { if (seePass[lv](t, ax, x, z)) return true; blockT = tm; return false; });
    const rayBlock = (lv, ax, az, bx, bz) => { blockT = 1; gridRay(lv, ax, az, bx, bz, blockPass[lv]); return blockT; };
    const los = (la, ax, az, lb, bx, bz) => { if (la === lb) return gridRay(la, ax, az, bx, bz, seePass[la]); const sa = stairOf(la, Math.floor(ax), Math.floor(az)), sb = stairOf(lb, Math.floor(bx), Math.floor(bz)); if (!sa && !sb) return false; return gridRay(la, ax, az, bx, bz, seePass[la]) || gridRay(lb, ax, az, bx, bz, seePass[lb]); };

    const STEP = 1 / 60;
    let SV = loadSave(), mode = 'title', R = null, acc = 0, paused = false, last = 0, titleT = 0, msgT = 0, flashT = 0, lightT = 6 + Math.random() * 10, lightK = 0, cut = null, focus = null, saveT = 0, codeSel = 0, codeVal = [0, 0, 0, 0], lockedPtr = false, wantLock = false, freeLook = false, gpPrev = null, journalOpen = false, menuStack = [], noiseHud = 0, hintT = 0, hintI = 0;
    const P = { x: 8.4, y: 3, z: 4.5, lv: 2, yaw: -Math.PI / 2, pitch: 0, vx: 0, vz: 0, cr: 0, crT: 0, crHold: false, crTog: false, stam: 1, tired: false, hide: null, hideK: 0, trap: null, trapK: 0, bob: 0, stepD: 0, ox: 8.4, oy: 3, oz: 4.5, run: false, moving: false, cell: -1, wireCool: 0, rustleT: 0, held: null, look: 0, lookP: 0, act: null };
    const K = { on: false, x: 16, y: 3, z: 4, lv: 2, yaw: 0, st: 'off', t: 0, path: null, pi: 0, goal: null, spd: 0, notice: 0, sees: false, lostT: 0, last: null, sawHide: null, door: null, doorT: 0, phase: 0, stepAcc: 0, humT: 12, shhT: 8, stuckT: 0, sx: 0, sz: 0, repath: 0, checks: [], heard: null, mem: [], trapQ: 0, ox: 16, oy: 3, oz: 4, cur: -1, head: 0, react: 0, pend: null, relock: null, faceYaw: 0 };

    function loadSave() {
      const base = { v: 1, opt: { sens: 1, inv: false, bright: 1, bob: true }, st: { runs: 0, esc: [0, 0, 0, 0, 0], best: [0, 0, 0, 0, 0], caught: 0 }, run: null };
      let s = null; try { s = api.load(); } catch (e) { s = null; }
      if (!s || typeof s !== 'object' || Array.isArray(s)) return base;
      try {
        const o = s.opt && typeof s.opt === 'object' ? s.opt : {};
        if (typeof o.sens === 'number' && isFinite(o.sens)) base.opt.sens = clamp(o.sens, 0.2, 3);
        if (typeof o.bright === 'number' && isFinite(o.bright)) base.opt.bright = clamp(o.bright, 0.6, 1.8);
        if (typeof o.inv === 'boolean') base.opt.inv = o.inv; if (typeof o.bob === 'boolean') base.opt.bob = o.bob;
        const t = s.st && typeof s.st === 'object' ? s.st : {};
        if (Number.isInteger(t.runs) && t.runs >= 0 && t.runs < 1e7) base.st.runs = t.runs;
        if (Number.isInteger(t.caught) && t.caught >= 0 && t.caught < 1e8) base.st.caught = t.caught;
        for (const k of ['esc', 'best']) if (Array.isArray(t[k]) && t[k].length === 5) base.st[k] = t[k].map(v => (typeof v === 'number' && isFinite(v) && v >= 0 && v < 1e7 ? v : 0));
        base.run = checkRun(s.run);
      } catch (e) { base.run = null; }
      return base;
    }
    function checkRun(r) {
      if (!r || typeof r !== 'object' || r.v !== 1) return null;
      const int = (v, a, b) => Number.isInteger(v) && v >= a && v <= b, num = (v, a, b) => typeof v === 'number' && isFinite(v) && v >= a && v <= b, arr = (v, n) => Array.isArray(v) && (n == null || v.length === n);
      if (!int(r.diff, 0, 4) || !int(r.day, 1, 5) || !num(r.t, 0, 1e6) || !int(r.seed, 0, 2 ** 31) || !arr(r.code, 4) || !r.code.every(d => int(d, 0, 9))) return null;
      if (!arr(r.clues, 4) || !r.clues.every(i => int(i, 0, CLUES.length - 1)) || new Set(r.clues).size !== 4 || !arr(r.found, 4) || !r.found.every(b => typeof b === 'boolean')) return null;
      if (!arr(r.creaks) || r.creaks.length > CREAKS.length || !r.creaks.every(i => int(i, 0, CREAKS.length - 1)) || !arr(r.wires) || r.wires.length > WIRES.length || !r.wires.every(i => int(i, 0, WIRES.length - 1))) return null;
      const L = r.locks; if (!L || typeof L !== 'object' || !int(L.planks, 0, 2) || ['pad', 'code', 'key', 'chain'].some(k => typeof L[k] !== 'boolean')) return null;
      const C = r.car; if (!C || typeof C !== 'object' || ['hood', 'bat', 'plug', 'fuel'].some(k => typeof C[k] !== 'boolean')) return null;
      if (typeof r.power !== 'boolean' || typeof r.fuse !== 'boolean' || !int(r.garage, 0, 2) || !int(r.flashes, 0, 9) || !int(r.caught, 0, 5)) return null;
      if (!arr(r.items, ITEMLIST.length)) return null;
      for (const q of r.items) { if (!arr(q) || q.length < 2) return null; if (q[0] === 's') { if (typeof q[1] !== 'string' || !H.SPOTS[q[1]]) return null; } else if (q[0] === 'w') { if (q.length !== 5 || !int(q[1], 0, 2) || !num(q[2], 0, W) || !num(q[3], -3.5, 6.5) || !num(q[4], 0, D)) return null; } else if (q[0] !== 'h' && q[0] !== 'u' && q[0] !== 'x') return null; }
      if (r.items.filter(q => q[0] === 'h').length > 1) return null;
      if (!arr(r.doors, DOORS.length) || !r.doors.every(q => arr(q, 2) && (q[0] === 0 || q[0] === 1) && (q[1] === 0 || q[1] === 1))) return null;
      if (!arr(r.traps) || r.traps.length > 10 || !r.traps.every(q => arr(q, 2) && int(q[0], 0, TRAPS.length - 1) && (q[1] === 0 || q[1] === 1))) return null;
      return r;
    }
    function snapshot() {
      if (!R) return null;
      return { v: 1, diff: R.diff, day: R.day, t: Math.round(R.t * 10) / 10, seed: R.seed, code: R.code.slice(), clues: R.clues.slice(), found: R.found.slice(), creaks: R.creaks.slice(), wires: R.wires.slice(), locks: Object.assign({}, R.locks), car: Object.assign({}, R.car), power: R.power, fuse: R.fuse, garage: R.garage >= 2 ? 2 : 0, flashes: R.flashes, caught: R.caught,
        items: ITEMLIST.map(it => it.st === 'h' ? ['h', 0] : it.st === 'u' ? ['u', 0] : it.st === 'x' ? ['x', 0] : it.spot ? ['s', it.spot] : ['w', it.lv, Math.round(clamp(it.x, 0, W) * 100) / 100, Math.round(clamp(it.y, -3.5, 6.5) * 100) / 100, Math.round(clamp(it.z, 0, D) * 100) / 100]),
        doors: DOORS.map(d => [d.want > 0.5 ? 1 : 0, d.locked ? 1 : 0]), traps: R.traps.map(t => [t.i, t.sprung ? 1 : 0]) };
    }
    const persist = () => { SV.run = R && mode !== 'end' ? snapshot() : SV.run; try { api.save(SV); } catch (e) {} };

    const ui = el('div', 'ui', wrap);
    const hud = el('div', 'hud', ui);
    const dayEl = el('div', 'day', hud), xh = el('div', 'xh', hud), lab = el('div', 'lab', hud), heldEl = el('div', 'held', hud), stamEl = el('div', 'stam', hud, '<i></i>'), noiseEl = el('div', 'noise', hud, '<svg viewBox="0 0 24 24"><path d="M8 18a3 3 0 0 0 5-2c0-2 4-3 4-7a5 5 0 0 0-10 0"/><path d="M10 10a2 2 0 0 1 4 0"/></svg><b></b>'), msgEl = el('div', 'msg', hud), hintEl = el('div', 'hint', hud), barEl = el('div', 'hold', hud, '<i></i>');
    const vig = el('div', 'vig', ui), grainEl = el('div', 'grain', ui), flashEl = el('div', 'flash', ui), fade = el('div', 'fade', ui), card = el('div', 'card', fade);
    const touch = el('div', 'touch', ui);
    const joy = el('div', 'joy', touch, '<i></i>'), joyK = joy.firstChild;
    const TB = {};
    for (const [k, t] of [['use', 'Use'], ['crouch', 'Crouch'], ['run', 'Run'], ['throw', 'Throw'], ['drop', 'Drop'], ['notes', 'Notes'], ['pause', 'II']]) TB[k] = el('button', 'tb tb-' + k, touch, esc(k === 'pause' ? 'II' : T(t)));
    const panel = el('div', 'panel', ui), codeEl = el('div', 'code', ui), jEl = el('div', 'journal', ui);
    panel.hidden = true; codeEl.hidden = true; jEl.hidden = true;
    let touchOn = COARSE;
    const setTouch = v => { touchOn = v; wrap.classList.toggle('touchon', v); };
    setTouch(COARSE);
    const fmtT = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    const iname = k => T(ITEMS[k].n);
    let msgQ = '';
    function say(s, dur) { msgEl.textContent = s; msgQ = s; msgEl.classList.remove('on'); void msgEl.offsetWidth; msgEl.classList.add('on'); msgT = dur || 2.6; }
    let labT = null;
    function setLab(s, ok) { if (s === labT) return; labT = s; lab.textContent = s || ''; lab.classList.toggle('bad', !ok); xh.classList.toggle('on', !!s); if (touchOn) TB.use.textContent = s ? (ok ? T('Use') : T('Look')) : T('Use'); }

    function hearR(loud) { return loud * R.D.hear * (1 + 0.1 * (R.day - 1)); }
    function noise(x, y, z, lv, loud, mine) {
      if (!R) return;
      if (mine) noiseHud = Math.max(noiseHud, clamp(loud / 20, 0.15, 1));
      if (!K.on || K.st === 'stun' || K.st === 'catch' || K.st === 'off') return;
      let d = Math.hypot(x - K.x, z - K.z) + Math.abs(lv - K.lv) * 4;
      if (lv === K.lv && !los(lv, x, z, K.lv, K.x, K.z)) d *= 1.3;
      if (d > hearR(loud)) return;
      K.mem.push({ x, z, lv, t: R.t, w: loud }); if (K.mem.length > 12) K.mem.shift();
      if (K.st === 'chase' || (K.st === 'check' && K.sawHide)) return;
      if (K.st === 'goto' && K.goal && K.goal.w > loud + 4 && R.t - K.goal.t < 6) return;
      K.pend = { x, z, lv, w: loud, t: R.t }; K.react = 0.25 + R.rng() * 0.35;
    }
    const surfAt = (lv, x, z) => { const c = cellAt(lv, Math.floor(x), Math.floor(z)); if (c === 'S' || c === 'O') return 'wood'; const f = ROOMS[c] ? ROOMS[c].f : 'wood'; return f === 'chk' || f === 'btl' ? 'tile' : f === 'con' ? 'con' : 'wood'; };
    const occ = (lv, x, z) => lv === P.lv ? (los(lv, x, z, P.lv, P.x, P.z) ? 14000 : 1500) : Math.abs(lv - P.lv) === 1 ? 700 : 300;
    const sfxAt = (n, lv, x, y, z, a, b) => audio.at(n, x, y, z, occ(lv, x, z), a, b);

    function placeItem(it, spot) {
      const sp = H.SPOTS[spot]; it.spot = spot; it.st = 'w'; it.fly = false; it.lv = sp.lv; it.x = sp.x; it.y = sp.y; it.z = sp.z; it.dr = sp.dr || null; it.ry = (R ? R.rng() : Math.random()) * TAU;
      if (it.dr) it.dr.items.push(it);
      it.mesh.visible = true; syncItem(it, true);
    }
    function syncItem(it, probe) {
      if (it.st !== 'w') { it.mesh.visible = false; return; }
      let x = it.x, y = it.y, z = it.z;
      if (it.dr) { const o = it.dr.open * 0.36; x += it.dr.dir.x * o; z += it.dr.dir.z * o; it.mesh.visible = it.dr.open > 0.05; } else it.mesh.visible = true;
      it.mesh.position.set(x, y, z); it.mesh.rotation.set(0, it.ry, 0);
      if (probe) setProbe(it.mesh, it.lv, x, y + 0.2, z, 0.04);
    }
    function freeItem(it) { if (it.dr) { const a = it.dr.items, i = a.indexOf(it); if (i >= 0) a.splice(i, 1); it.dr = null; } it.spot = null; }
    function newRun(diff, from) {
      const seed = from ? from.seed : (Math.random() * 2 ** 31) | 0, rng = mkRng(seed), D2 = DIFFS[diff];
      R = { diff, D: D2, day: 1, t: 0, seed, rng: mkRng(seed ^ 0x5bd1e995), code: [], clues: [], found: [false, false, false, false], creaks: [], wires: [], locks: { planks: 2, pad: false, code: !D2.code, key: false, chain: !D2.chain }, car: { hood: false, bat: false, plug: !D2.plug, fuel: false }, power: false, fuse: false, garage: 0, gT: 0, flashes: 1, caught: 0, traps: [], noted: {}, start: performance.now() };
      for (let i = 0; i < 4; i++) R.code.push((rng() * 10) | 0);
      const ci = CLUES.map((_, i) => i); for (let i = ci.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [ci[i], ci[j]] = [ci[j], ci[i]]; } R.clues = ci.slice(0, 4);
      const cr = CREAKS.map((_, i) => i); for (let i = cr.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [cr[i], cr[j]] = [cr[j], cr[i]]; } R.creaks = cr.slice(0, D2.creak);
      const wr = WIRES.map((_, i) => i); for (let i = wr.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [wr[i], wr[j]] = [wr[j], wr[i]]; } R.wires = wr.slice(0, D2.wires);
      DOORS.forEach(d => { d.a = d.want = 0; d.locked = !!d.lock; d.g.rotation.y = d.thc; d.box.on = true; d.obox.on = false; });
      DRW.forEach(d => { d.open = d.want = 0; d.items.length = 0; d.g.position.copy(d.base); });
      H.WARD.forEach(wd => { wd.open = 0; wd.doors.forEach(dd => { dd.g.rotation.y = dd.th0; }); });
      ITEMLIST.forEach(it => { it.st = 'x'; it.spot = null; it.dr = null; it.mesh.visible = false; it.fly = false; });
      const used = new Set(), order = ITEMLIST.slice();
      for (let i = order.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [order[i], order[j]] = [order[j], order[i]]; }
      order.sort((a, b) => ITEMS[a.k].at.length - ITEMS[b.k].at.length);
      for (const it of order) {
        const def = ITEMS[it.k]; if (def.need === 'chain' && !D2.chain) continue; if (def.need === 'plug' && !D2.plug) continue;
        const c = def.at.filter(s => H.SPOTS[s] && !used.has(s)); if (!c.length) continue;
        const s = c[(rng() * c.length) | 0]; used.add(s); placeItem(it, s);
      }
      P.held = null;
      if (from) applyRun(from);
      for (let i = 0; i < 4; i++) { const q = CLUES[R.clues[i]]; paintClue(clueTex[R.clues[i]].c.getContext('2d'), 128, ['I', 'II', 'III', 'IV'][i], R.code[i]); clueTex[R.clues[i]].t.needsUpdate = true; }
      clueMesh.forEach((m, i) => { m.visible = R.clues.includes(i) && !!R.D.code; });
      creakMesh.forEach((m, i) => { m.visible = R.creaks.includes(i); });
      wireMesh.forEach((m, i) => { m.visible = R.wires.includes(i); });
      syncLocks(); syncTraps();
      H.bakeU.value = R.D.dark * SV.opt.bright; fog.density = 0.11 / R.D.dark;
      K.on = !!R.D.keeper; KM.root.visible = K.on;
    }
    function applyRun(s) {
      Object.assign(R, { day: s.day, t: s.t, code: s.code.slice(), clues: s.clues.slice(), found: s.found.slice(), creaks: s.creaks.slice(), wires: s.wires.slice(), locks: Object.assign({}, s.locks), car: Object.assign({}, s.car), power: s.power, fuse: s.fuse, garage: s.garage, flashes: s.flashes, caught: s.caught });
      ITEMLIST.forEach(it => { freeItem(it); it.st = 'x'; it.mesh.visible = false; }); DRW.forEach(d => { d.items.length = 0; });
      s.items.forEach((q, i) => { const it = ITEMLIST[i]; if (q[0] === 's') placeItem(it, q[1]); else if (q[0] === 'w') { it.st = 'w'; it.lv = q[1]; it.x = q[2]; it.y = q[3]; it.z = q[4]; it.ry = 0; syncItem(it, true); } else if (q[0] === 'h') { it.st = 'h'; P.held = it; } else it.st = q[0]; });
      DOORS.forEach((d, i) => { d.locked = !!s.doors[i][1]; d.want = d.a = s.doors[i][0] && !d.locked ? 1 : 0; d.g.rotation.y = d.a ? d.tho : d.thc; d.box.on = !d.a; d.obox.on = !!d.a; });
      R.traps = s.traps.map(q => ({ i: q[0], lv: TRAPS[q[0]][0], x: TRAPS[q[0]][1] + 0.5, z: TRAPS[q[0]][2] + 0.5, sprung: !!q[1] }));
    }
    function syncLocks() {
      planks.forEach((m, i) => { m.visible = i < R.locks.planks; });
      padlock.visible = hasp.visible = !R.locks.pad; codeLock.visible = codeLock.userData.hasp.visible = !R.locks.code; chain.visible = !R.locks.chain; keyhole.material.color.set(R.locks.key ? 0x5a5a5a : 0x9a8040);
      fuseIn.visible = R.fuse; lever.rotation.x = R.power ? 0.6 : 2.4; led.material.color.set(R.power ? 0x30ff60 : 0x5a1010); garBulb.material.color.set(R.power ? 0xfff0c8 : 0x3a3428); garL.intensity = R.power ? 1.1 : 0;
      carBat.visible = R.car.bat; carPlug.visible = R.car.plug && R.D.plug; hood.rotation.x = R.car.hood ? -1.15 : 0;
      roller.scale.y = R.garage >= 2 ? 0.04 : 1;
    }
    function syncTraps() { trapPool.forEach((m, i) => { const t = R && R.traps[i]; m.visible = !!t; if (t) { m.geometry = t.sprung ? trapShutG : trapOpenG; m.position.set(t.x, LY[t.lv] + 0.002, t.z); m.rotation.y = t.i * 1.3; setProbe(m, t.lv, t.x, LY[t.lv] + 0.3, t.z, 0.03); } }); }

    function startDay(first) {
      const D2 = R.D;
      P.x = 8.6; P.z = 4.55; P.lv = 2; P.y = 3; P.yaw = Math.PI * 0.82; P.pitch = -0.12; P.vx = P.vz = 0; P.cr = 0; P.crTog = false; P.stam = 1; P.tired = false; P.hide = null; P.trap = null; P.cell = -1; P.ox = P.x; P.oy = P.y; P.oz = P.z; P.act = null;
      R.traps = R.traps.filter(t => !t.sprung);
      if (first && R.diff >= 3) { const c = TRAPS[(R.rng() * TRAPS.length) | 0]; if (!R.traps.some(t => t.i === TRAPS.indexOf(c))) R.traps.push({ i: TRAPS.indexOf(c), lv: c[0], x: c[1] + 0.5, z: c[2] + 0.5, sprung: false }); }
      K.trapQ = R.day >= 2 ? Math.round(D2.traps * (R.day - 1) * 0.75 + 0.25) : 0;
      syncTraps();
      resetKeeper();
      cut = { k: 'wake', t: 0, d: 3.2 };
      card.innerHTML = `<b>${esc(T('Day {n}', { n: R.day }))}</b><span>${esc(R.day === 5 ? T('Last day') : T('{n} days left', { n: 6 - R.day }))}</span>`;
      fade.classList.add('on'); fade.classList.add('card'); audio.play('bell');
      api.score(T('Day {n} of 5', { n: R.day }));
      dayEl.innerHTML = `<b>${esc(T('Day {n}', { n: R.day }))}</b>` + [1, 2, 3, 4, 5].map(i => `<i class="${i < R.day ? 'x' : i === R.day ? 'c' : ''}"></i>`).join('');
      dayEl.hidden = false;
    }
    function resetKeeper() {
      Object.assign(K, { x: 16.2, z: 4.0, lv: 2, y: 3, yaw: Math.PI * 0.75, st: K.on ? 'wait' : 'off', t: (R.day >= 5 ? 5 : [99, 14, 10, 8, 6][R.diff]), path: null, goal: null, notice: 0, sees: false, lostT: 0, last: null, sawHide: null, door: null, phase: 0, stepAcc: 0, humT: 6 + R.rng() * 6, shhT: 6, checks: [], mem: [], pend: null, react: 0, relock: null, stuckT: 0, repath: 0 });
      K.ox = K.x; K.oy = K.y; K.oz = K.z; K.cur = NAV.nodeAt(K.lv, K.x, K.z);
    }

    const roomCells = {};
    for (let lv = 0; lv < 3; lv++) for (let j = 0; j < D; j++) for (let i = 0; i < W; i++) { const c = cellAt(lv, i, j); if (!ROOMS[c]) continue; const id = lv * W * D + j * W + i; if (!NAV.walk[id]) continue; (roomCells[c] || (roomCells[c] = [])).push(id); }
    const ROOMK = Object.keys(roomCells);
    function pickPatrol() {
      const wts = ROOMK.map(k => {
        let w = 1;
        if (k === 's' && DOORS.find(d => d.lock === 'studyKey').locked) w = 0.4;
        if (k === 'g' && DOORS.find(d => d.lock === 'garageKey').locked) w = 0.4;
        if (R.day >= 2) for (const m of K.mem) if (roomKey(m.lv, Math.floor(m.x), Math.floor(m.z)) === k && R.t - m.t < 150) w += 2.5;
        if (R.day >= 2 && K.last && roomKey(K.last.lv, Math.floor(K.last.x), Math.floor(K.last.z)) === k && R.t - K.last.t < 200) w += 3;
        if (R.day >= 4) { const fp = (2 - R.locks.planks) + R.locks.pad + R.locks.key + (R.D.chain ? R.locks.chain : 0) + (R.D.code ? R.locks.code : 0), cp = R.car.bat + R.car.fuel + R.power + R.car.plug; if (k === 'h' && fp >= cp && fp > 0) w += 4; if ((k === 'g' || k === 'u') && cp > fp) w += 4; }
        if (k === roomKey(K.lv, Math.floor(K.x), Math.floor(K.z))) w *= 0.25;
        return w;
      });
      let s = wts.reduce((a, b) => a + b, 0) * R.rng();
      for (let i = 0; i < ROOMK.length; i++) { s -= wts[i]; if (s <= 0) { const cells = roomCells[ROOMK[i]]; return cells[(R.rng() * cells.length) | 0]; } }
      const cells = roomCells.h; return cells[0];
    }
    function goTo(id, st, spd) { const from = NAV.nodeAt(K.lv, K.x, K.z); const p = NAV.find(from, id); if (!p) return false; K.path = p; K.pi = 1; K.st = st; K.spd = spd; K.stuckT = 0; K.sx = K.x; K.sz = K.z; return true; }
    const kSpd = mul => R.D.pat * mul * (R.day >= 5 ? 1.08 : 1);
    const chaseSpd = () => R.D.ch * (R.day >= 5 ? 1.05 : 1);
    function playerVisible() {
      if (P.hide || cut) return false;
      const dx = P.x - K.x, dz = P.z - K.z, d = Math.hypot(dx, dz), dy = Math.abs((P.y + 1.2) - (K.y + 1.9));
      if (dy > 2.4 || d > 15) return false;
      if (K.lv !== P.lv && !(stairOf(K.lv, Math.floor(K.x), Math.floor(K.z)) || stairOf(P.lv, Math.floor(P.x), Math.floor(P.z)))) return false;
      const fx = Math.sin(K.yaw), fz = Math.cos(K.yaw), dot = d > 0.01 ? (fx * dx + fz * dz) / d : 1;
      if (d > 1.4 && dot < (K.st === 'chase' ? -0.2 : 0.45)) return false;
      if (!los(K.lv, K.x, K.z, P.lv, P.x, P.z)) return false;
      sample(P.lv, P.x, P.y + 1, P.z, tmp3); const lit = tmp3[0] + tmp3[1] + tmp3[2] + (d < 6 ? 0.5 : 0);
      const range = K.st === 'chase' ? 15 : (P.cr > 0.5 ? 7 : 11) * (lit > 0.12 ? 1 : 0.7);
      return d <= range;
    }
    function stepKeeper(dt) {
      if (!K.on || K.st === 'off' || K.st === 'catch') return;
      K.ox = K.x; K.oy = K.y; K.oz = K.z;
      if (K.st === 'stun') { K.t -= dt; if (K.t <= 0) { K.last = { x: P.x, z: P.z, lv: P.lv, t: R.t }; startSearch(); } return; }
      if (K.st === 'wait') { K.t -= dt; if (K.t <= 0) { K.st = 'patrol'; K.path = null; } return; }
      const vis = playerVisible(); K.sees = vis;
      const dP = Math.hypot(P.x - K.x, P.z - K.z);
      if (vis) {
        if (K.st !== 'chase') { const rate = (dP < 2.6 ? 7 : 2.4 / (0.5 + dP * 0.16)) * (P.cr > 0.5 ? 0.55 : 1) * (P.moving ? 1 : 0.6) * Math.sqrt(R.D.hear) * (1 + 0.06 * (R.day - 1)); K.notice += rate * dt; if (K.notice >= 1) spot(); }
        else { K.last = { x: P.x, z: P.z, lv: P.lv, t: R.t, vx: P.vx, vz: P.vz }; K.lostT = 0; }
      } else { K.notice = Math.max(0, K.notice - dt * 0.45); if (K.st === 'chase') K.lostT += dt; }
      if (K.pend && K.st !== 'chase') { K.react -= dt; if (K.react <= 0) { const n = K.pend; K.pend = null; K.goal = n; const id = NAV.nodeAt(n.lv, n.x, n.z); if (id >= 0 && goTo(id, 'goto', kSpd(n.w >= 14 ? 1.75 : 1.4))) { if (R.rng() < 0.4) sfxAt('shh', K.lv, K.x, K.y + 1.9, K.z, 0.7); } } }
      if (K.door) { K.doorT -= dt; if (K.doorT <= 0) { if (K.door.locked) { K.relock = K.door; } K.door.want = 1; if (K.door.a < 0.1) sfxAt('door', K.door.lv, K.door.cx, LY[K.door.lv] + 1, K.door.cz, 0.8); K.door = null; } return; }
      switch (K.st) {
        case 'patrol': if (!K.path) { if (!goTo(pickPatrol(), 'patrol', kSpd(1))) { K.st = 'look'; K.t = 1.5; } } break;
        case 'look': case 'listen': K.t -= dt; K.head = Math.sin(R.t * (K.st === 'listen' ? 0.8 : 1.6)) * 0.9; if (K.t <= 0) { K.head = 0; if (K.checks.length) nextCheck(); else { K.st = 'patrol'; K.path = null; } } break;
        case 'chase': {
          K.repath -= dt;
          if (K.sawHide) { if (K.repath <= 0) { K.repath = 0.5; const hs = K.sawHide; goTo(NAV.nodeAt(hs.lv, hs.out.x, hs.out.z), 'chase', chaseSpd()); } if (Math.hypot(K.sawHide.out.x - K.x, K.sawHide.out.z - K.z) < 0.9 && K.lv === K.sawHide.lv) { if (P.hide === K.sawHide) return startCatch(true); K.sawHide = null; startSearch(); } break; }
          if (K.lostT > 0.7) { startSearch(); break; }
          if (vis && K.lv === P.lv && dP < 5 && directClear(K.lv, K.x, K.z, P.x, P.z)) { K.path = null; moveToward(P.x, P.z, chaseSpd(), dt); K.yaw = damp(K.yaw, K.yaw + angDiff(K.yaw, Math.atan2(P.x - K.x, P.z - K.z)), 10, dt); }
          else if (K.repath <= 0 || !K.path) { K.repath = 0.35; const tx = K.last ? K.last.x : P.x, tz = K.last ? K.last.z : P.z, tl = K.last ? K.last.lv : P.lv; goTo(NAV.nodeAt(tl, tx, tz), 'chase', chaseSpd()); }
          if (dP < 0.95 && Math.abs(P.y - K.y) < 1.2 && vis) return startCatch(false);
          break;
        }
        case 'check': if (!K.path) { K.t -= dt; const hs = K.checks[0]; if (hs) { K.yaw = damp(K.yaw, K.yaw + angDiff(K.yaw, Math.atan2(hs.x - K.x, hs.z - K.z)), 6, dt); if (hs.kind === 'ward') hs.open = Math.min(1, hs.open + dt * 2.5); } if (K.t <= 0.6 && hs && P.hide === hs) return startCatch(true); if (K.t <= 0) { if (hs && hs.kind === 'ward') hs.open = 0; K.checks.shift(); nextCheck(); } } break;
      }
      if (K.path && K.st !== 'look' && K.st !== 'listen') followPath(dt);
      if (K.relock && K.relock.a > 0.9 && K.st !== 'chase' && Math.hypot(K.x - K.relock.cx, K.z - K.relock.cz) > 1.4) { const d = K.relock; K.relock = null; if (!(P.lv === d.lv && Math.hypot(P.x - d.cx, P.z - d.cz) < 1.3)) { d.want = 0; d.locked = true; sfxAt('shut', d.lv, d.cx, LY[d.lv] + 1, d.cz); sfxAt('unlock', d.lv, d.cx, LY[d.lv] + 1, d.cz); } }
      if (R.day >= 2 && K.trapQ > 0 && K.st === 'patrol' && Math.hypot(P.x - K.x, P.z - K.z) > 7) {
        for (let i = 0; i < TRAPS.length; i++) { const c = TRAPS[i]; if (c[0] !== K.lv || Math.hypot(c[1] + 0.5 - K.x, c[2] + 0.5 - K.z) > 0.5 || R.traps.some(t => t.i === i)) continue; if (R.traps.length >= trapPool.length) break; R.traps.push({ i, lv: c[0], x: c[1] + 0.5, z: c[2] + 0.5, sprung: false }); K.trapQ--; syncTraps(); K.st = 'look'; K.t = 1.6; K.path = null; break; }
      }
      K.humT -= dt; if (K.humT <= 0) { K.humT = 14 + R.rng() * 14; if (K.st === 'patrol' || K.st === 'look') sfxAt('humm', K.lv, K.x, K.y + 1.9, K.z); }
      if (K.st === 'goto' || K.st === 'check') { K.shhT -= dt; if (K.shhT <= 0) { K.shhT = 7 + R.rng() * 6; sfxAt('shh', K.lv, K.x, K.y + 1.9, K.z, 0.8); } }
      K.y = groundY(K.lv, K.x, K.z); K.lv = levelAt(K.lv, K.x, K.z, K.y);
    }
    function directClear(lv, ax, az, bx, bz) { if (!gridRay(lv, ax, az, bx, bz, seePass[lv])) return false; const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.4); for (let i = 1; i < n; i++) { const t = i / n, id = lv * W * D + Math.floor(az + (bz - az) * t) * W + Math.floor(ax + (bx - ax) * t); if (!NAV.walk[id]) return false; } return true; }
    const ko = { x: 0, z: 0 };
    function moveToward(tx, tz, spd, dt) {
      const dx = tx - K.x, dz = tz - K.z, d = Math.hypot(dx, dz); if (d < 1e-3) return d;
      const s = Math.min(d, spd * dt); ko.x = K.x + dx / d * s; ko.z = K.z + dz / d * s; collide(K.lv, ko, 0.28, false, true);
      const moved = Math.hypot(ko.x - K.x, ko.z - K.z); K.x = ko.x; K.z = ko.z; K.stepAcc += moved; K.phase += moved;
      const stride = spd > 2.2 ? 1.05 : 0.78;
      if (K.stepAcc > stride) { K.stepAcc -= stride; sfxAt('kstep', K.lv, K.x, K.y + 0.1, K.z); if (spd < 3 || R.rng() < 0.5) sfxAt('keys', K.lv, K.x, K.y + 1.0, K.z); }
      return d;
    }
    function followPath(dt) {
      const p = K.path; if (!p || K.pi >= p.length) { arrive(); return; }
      const id = p[K.pi], q = NAV.pos(id), prev = NAV.pos(p[K.pi - 1]);
      if (q.lv === prev.lv && (Math.abs(q.x - prev.x) + Math.abs(q.z - prev.z) === 1)) {
        const ax = q.x !== prev.x ? 'v' : 'h', ex = ax === 'v' ? Math.max(q.x, prev.x) - 0.5 : Math.floor(q.x), ez = ax === 'v' ? Math.floor(q.z) : Math.max(q.z, prev.z) - 0.5;
        const t = ax === 'v' ? evAt(q.lv, ex, ez) : ehAt(q.lv, ex, ez);
        if (t === E_DOOR) { const dd = doorAtEdge(q.lv, ax, ex, ez); if (dd && dd.want < 0.5 && Math.hypot(dd.cx - K.x, dd.cz - K.z) < 0.85) { K.door = dd; K.doorT = dd.locked ? 1.1 : 0.4; if (dd.locked) sfxAt('locked', dd.lv, dd.cx, LY[dd.lv] + 1, dd.cz); return; } }
      } else if (q.lv !== prev.lv) { const L = NAV.links.get(p[K.pi - 1]); if (L && (L.ax === 'v' ? evAt(L.lv, L.x, L.z) : ehAt(L.lv, L.x, L.z)) === E_DOOR) { const dd = doorAtEdge(L.lv, L.ax, L.x, L.z); if (dd && dd.want < 0.5 && Math.hypot(dd.cx - K.x, dd.cz - K.z) < 1.0) { K.door = dd; K.doorT = dd.locked ? 1.1 : 0.4; return; } } }
      let tx = q.x, tz = q.z;
      if (K.pi + 1 < p.length) { const q2 = NAV.pos(p[K.pi + 1]); if (q2.lv === K.lv && q.lv === K.lv && directClear(K.lv, K.x, K.z, q2.x, q2.z) && Math.hypot(q.x - K.x, q.z - K.z) < 1.2) { K.pi++; tx = q2.x; tz = q2.z; } }
      const d = moveToward(tx, tz, K.spd, dt);
      const want = Math.atan2(tx - K.x, tz - K.z); K.yaw += angDiff(K.yaw, want) * Math.min(1, dt * 7);
      if (d < 0.3) { K.pi++; if (q.lv !== K.lv && stairOf(K.lv, Math.floor(K.x), Math.floor(K.z)) === 0) K.lv = q.lv; }
      K.stuckT += dt;
      if (K.stuckT > 1.6) { if (Math.hypot(K.x - K.sx, K.z - K.sz) < 0.25) { K.repath = 0; const goal = p[p.length - 1]; if (!goTo(goal, K.st, K.spd)) { K.path = null; } else if (Math.hypot(P.x - K.x, P.z - K.z) > 6 || P.lv !== K.lv) { const nq = NAV.pos(K.path[Math.min(1, K.path.length - 1)]); K.x = nq.x; K.z = nq.z; K.lv = nq.lv; } } K.stuckT = 0; K.sx = K.x; K.sz = K.z; }
    }
    function arrive() {
      K.path = null;
      if (K.st === 'patrol') { K.st = R.day >= 5 && R.rng() < 0.35 ? 'listen' : 'look'; K.t = K.st === 'listen' ? 4 + R.rng() * 3 : 1.5 + R.rng() * 2.5; }
      else if (K.st === 'goto') { K.st = 'look'; K.t = 2.5 + R.rng() * 2.5; if (R.day >= 3 && K.goal) planChecks(K.goal.x, K.goal.z, K.goal.lv); }
      else if (K.st === 'search') { K.st = 'look'; K.t = 2.5 + R.rng() * 2; if (R.day >= 3 && K.last) planChecks(K.last.x, K.last.z, K.last.lv); }
      else if (K.st === 'check') { K.t = 1.4; }
      else if (K.st === 'chase') { if (!K.sawHide) startSearch(); }
    }
    function planChecks(x, z, lv) {
      const n = R.day >= 4 ? 2 : 1, p = [0, 0.3, 0.38, 0.48, 0.6][R.diff] * (R.day >= 5 ? 1.25 : 1);
      const near = H.HIDES.filter(hs => hs.lv === lv && Math.hypot(hs.x - x, hs.z - z) < 5.5).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z)).slice(0, n);
      K.checks = near.filter(() => R.rng() < p);
    }
    function nextCheck() { const hs = K.checks[0]; if (!hs) { K.st = 'patrol'; K.path = null; return; } const id = NAV.nodeAt(hs.lv, hs.out.x, hs.out.z); if (!goTo(id, 'check', kSpd(1.2))) { K.checks.shift(); K.st = 'patrol'; K.path = null; } K.t = 1.6; }
    function startSearch() { K.sawHide = null; const L = K.last || { x: P.x, z: P.z, lv: P.lv }; let tx = L.x + (L.vx || 0) * 0.6, tz = L.z + (L.vz || 0) * 0.6; const id = NAV.nodeAt(L.lv, tx, tz); if (!goTo(id >= 0 ? id : NAV.nodeAt(L.lv, L.x, L.z), 'search', kSpd(1.6))) { K.st = 'look'; K.t = 3; } sfxAt('shh', K.lv, K.x, K.y + 1.9, K.z, 1); }
    function spot() {
      K.notice = 1; K.st = 'chase'; K.path = null; K.repath = 0.25; K.lostT = 0; K.last = { x: P.x, z: P.z, lv: P.lv, t: R.t };
      audio.play('sting'); sfxAt('gasp', K.lv, K.x, K.y + 1.9, K.z);
      if (!R.noted.spot) { R.noted.spot = 1; say(T('He has seen you. Run and hide!'), 3); }
    }
    function startCatch(pulled) {
      K.st = 'catch'; cut = { k: 'catch', t: 0, d: 2.6, pulled };
      if (P.hide) { const hs = P.hide; P.hide = null; P.x = hs.out.x; P.z = hs.out.z; P.lv = hs.lv; P.y = groundY(P.lv, P.x, P.z); if (hs.kind === 'ward') hs.open = 1; }
      P.trap = null; audio.play('caught'); releaseHeld(true);
      R.caught++; SV.st.caught++;
    }
    function releaseHeld(drop) {
      const it = P.held; if (!it) return; P.held = null;
      if (drop) { it.st = 'w'; it.spot = null; it.dr = null; it.lv = P.lv; it.x = clamp(P.x, 0.3, W - 0.3); it.z = clamp(P.z, 0.3, D - 0.3); it.y = groundY(P.lv, it.x, it.z); it.ry = R.rng() * TAU; syncItem(it, true); }
    }

    const HINT = { hammer: 'It could pry the planks off the front door.', padKey: 'A small brass key. It looks like it fits a padlock.', doorKey: 'A heavy iron key. The front door, maybe.', cutters: 'Strong enough to cut through a chain.', studyKey: 'The tag is red, like the plate on the study door.', garageKey: 'The tag is blue, like the plate on a door downstairs.', carKey: 'The key to the car in the garage.', battery: 'A car battery. The car needs one.', fuel: 'Enough fuel for a car.', plug: 'A spark plug. An engine part.', fuse: 'A fuse. The fuse box in the cellar is missing one.', camera: 'The flash can blind him for a moment. Use it when he is close.', bulb: 'A flash bulb for the camera.', bottle: 'Throw it to make a noise somewhere else.' };
    const fwd = new THREE.Vector3();
    const TG = [];
    const add = o => (TG.push(o), o);
    const keyName = k => k === 'studyKey' ? T('red key') : T('blue key');
    const holding = k => P.held && P.held.k === k;
    const consume = () => { const it = P.held; if (it) { it.st = 'u'; P.held = null; } };
    ITEMLIST.forEach(it => add({ kind: 'item', lv: () => it.lv, en: () => it.st === 'w' && !it.fly && (!it.dr || it.dr.open > 0.6), box: () => [it.mesh.position.x, it.mesh.position.y + it.cy, it.mesh.position.z, Math.max(it.size[0], it.size[2]), it.size[1], Math.max(it.size[0], it.size[2])], label: () => [holding('camera') && it.k === 'bulb' ? T('Load the flash bulb') : P.held ? T('Swap for the {item}', { item: iname(it.k) }) : T('Take the {item}', { item: iname(it.k) }), 1], act: () => pickup(it) }));
    DOORS.filter(d => !d.front).forEach(d => add({ kind: 'door', lv: () => d.lv, en: () => true, box: () => { const th = d.thc + (d.tho - d.thc) * d.a, hx = d.g.position.x, hz = d.g.position.z, cx = hx + Math.sin(th) * 0.46, cz = hz + Math.cos(th) * 0.46; return [cx, LY[d.lv] + 1.05, cz, Math.abs(Math.sin(th)) * 0.46 + 0.05, 1.05, Math.abs(Math.cos(th)) * 0.46 + 0.05]; }, label: () => d.a > 0.5 ? [T('Close door'), 1] : d.locked ? (holding(d.lock) ? [T('Unlock the door'), 1] : [T('Locked ({key})', { key: keyName(d.lock) }), 0]) : [T('Open door'), 1], act: () => useDoor(d) }));
    DRW.forEach(dr => add({ kind: 'drawer', lv: () => dr.lv, en: () => true, box: () => { const o = dr.open * 0.36, x = dr.base.x + dr.dir.x * o, z = dr.base.z + dr.dir.z * o, ax = Math.abs(dr.dir.x) > 0.5; return [x, dr.base.y, z, ax ? 0.06 : dr.w / 2, dr.dh / 2, ax ? dr.w / 2 : 0.06]; }, label: () => [dr.open > 0.5 ? T('Close drawer') : T('Open drawer'), 1], act: () => { dr.want = dr.want > 0.5 ? 0 : 1; audio.at('rustle', dr.base.x, dr.base.y, dr.base.z, 14000); audio.at('click', dr.base.x, dr.base.y, dr.base.z, 14000); noise(dr.base.x, dr.base.y, dr.base.z, dr.lv, 2.5, true); } }));
    H.HIDES.forEach(hs => add({ kind: 'hide', lv: () => hs.lv, en: () => true, box: () => hs.kind === 'bed' ? [hs.x, LY[hs.lv] + 0.42, hs.z, hs.hx, 0.42, hs.hz] : [hs.x, LY[hs.lv] + 1.0, hs.z, hs.hx, 1.0, hs.hz], label: () => [hs.kind === 'bed' ? T('Hide under the bed') : T('Hide in the wardrobe'), 1], act: () => enterHide(hs) }));
    const allDone = () => R.locks.planks === 0 && R.locks.pad && R.locks.code && R.locks.key && R.locks.chain;
    planks.forEach((m, i) => add({ kind: 'plank', lv: () => 1, en: () => i === R.locks.planks - 1, box: () => [11.5, 1.15 + i * 0.55, fz - 0.03, 0.62, 0.12, 0.07], label: () => holding('hammer') ? [T('Pry off the plank'), 1] : [T('Boarded up · needs a hammer'), 0], act: () => { if (!holding('hammer')) return deny(); R.locks.planks--; audio.at('plank', 11.5, 1.3, 13.8, 14000); noise(11.5, 1.3, 13.8, 1, 16, true); syncLocks(); say(T('The plank comes off.')); } }));
    add({ kind: 'pad', lv: () => 1, en: () => !R.locks.pad, box: () => [11.9, 0.9, fz - 0.03, 0.06, 0.08, 0.06], label: () => holding('padKey') ? [T('Open the padlock'), 1] : [T('Padlock · needs the padlock key'), 0], act: () => { if (!holding('padKey')) return deny(); consume(); R.locks.pad = true; audio.at('pad', 11.9, 0.9, 13.8, 14000); noise(11.9, 0.9, 13.8, 1, 6, true); syncLocks(); say(T('The padlock opens.')); } });
    add({ kind: 'code', lv: () => 1, en: () => !R.locks.code, box: () => [11.9, 0.62, fz - 0.03, 0.07, 0.07, 0.06], label: () => [T('Code lock · try a code'), 1], act: () => openCode() });
    add({ kind: 'chain', lv: () => 1, en: () => !R.locks.chain, box: () => [11.5, 1.4, fz - 0.035, 0.52, 0.07, 0.06], label: () => holding('cutters') ? [T('Cut the chain'), 1] : [T('Chain · needs bolt cutters'), 0], act: () => { if (!holding('cutters')) return deny(); R.locks.chain = true; audio.at('chain', 11.5, 1.4, 13.8, 14000); noise(11.5, 1.4, 13.8, 1, 12, true); syncLocks(); say(T('The chain falls away.')); } });
    add({ kind: 'keyhole', lv: () => 1, en: () => !R.locks.key, box: () => [11.82, 1.02, fz, 0.05, 0.07, 0.05], label: () => holding('doorKey') ? [T('Unlock the front door'), 1] : [T('Locked · needs the front door key'), 0], act: () => { if (!holding('doorKey')) return deny(); consume(); R.locks.key = true; audio.at('unlock', 11.8, 1, 13.8, 14000); noise(11.8, 1, 13.8, 1, 5, true); syncLocks(); say(T('The lock turns.')); } });
    add({ kind: 'front', lv: () => 1, en: () => true, box: () => [11.5, 1.05, 14, 0.48, 1.05, 0.09], label: () => allDone() ? [T('Open the front door'), 1] : [T('The front door will not open'), 0], act: () => { if (allDone()) return escape('door'); audio.at('locked', 11.5, 1, 13.9, 14000); noise(11.5, 1, 13.9, 1, 6, true); const left = []; if (R.locks.planks) left.push(T('planks')); if (!R.locks.pad) left.push(T('padlock')); if (!R.locks.code) left.push(T('code lock')); if (!R.locks.chain) left.push(T('chain')); if (!R.locks.key) left.push(T('door lock')); say(T('Still in the way: {list}', { list: left.join(', ') }), 3.5); } });
    const carW = (lx, ly, lz) => [CAR.position.x + lx, ly, CAR.position.z + lz];
    const carReady = () => R.car.bat && R.car.fuel && R.car.plug;
    add({ kind: 'hood', lv: () => 1, en: () => !cut, box: () => R.car.hood ? [...carW(0, 1.62, -1.05), 0.86, 0.4, 0.22] : [...carW(0, 0.95, -1.5), 0.86, 0.12, 0.66], label: () => [R.car.hood ? T('Close the hood') : T('Open the hood'), 1], act: () => { R.car.hood = !R.car.hood; audio.at('clunk', 3, 1, 7.8, 14000); noise(3, 1, 7.8, 1, 6, true); syncLocks(); } });
    add({ kind: 'bat', lv: () => 1, en: () => R.car.hood && !R.car.bat, box: () => [...carW(0.5, 0.92, -1.25), 0.18, 0.12, 0.14], label: () => holding('battery') ? [T('Put in the battery'), 1] : [T('The battery is missing'), 0], act: () => { if (!holding('battery')) return deny(); consume(); R.car.bat = true; audio.at('clunk', 3.5, 1, 8, 14000); noise(3.5, 1, 8, 1, 6, true); syncLocks(); say(T('The battery is in.')); } });
    add({ kind: 'plug', lv: () => 1, en: () => R.car.hood && !R.car.plug, box: () => [...carW(-0.1, 0.95, -1.6), 0.09, 0.08, 0.09], label: () => holding('plug') ? [T('Fit the spark plug'), 1] : [T('A spark plug is missing'), 0], act: () => { if (!holding('plug')) return deny(); consume(); R.car.plug = true; audio.at('click', 2.9, 1, 7.7, 14000); syncLocks(); say(T('The spark plug is in.')); } });
    add({ kind: 'fuelcap', lv: () => 1, en: () => !R.car.fuel, box: () => [...carW(-0.92, 0.72, 1.45), 0.07, 0.09, 0.09], label: () => holding('fuel') ? [T('Fill the tank'), 1] : [T('The tank is empty'), 0], act: () => { if (!holding('fuel')) return deny(); consume(); R.car.fuel = true; audio.at('rustle', 2.1, 0.7, 10.7, 14000); audio.at('drop', 2.1, 0.7, 10.7, 14000, 'soft'); noise(2.1, 0.7, 10.7, 1, 6, true); say(T('The tank is full.')); } });
    add({ kind: 'drive', lv: () => 1, en: () => !cut, box: () => [...carW(-0.92, 1.0, 0.1), 0.07, 0.35, 0.55], label: () => !carReady() ? [T('The car will not start yet'), 0] : !holding('carKey') ? [T('Needs the car key'), 0] : R.garage < 2 ? [T('The garage door is shut'), 0] : [T('Start the car and go'), 1], act: () => { if (carReady() && holding('carKey') && R.garage >= 2) return escape('car'); deny(); } });
    add({ kind: 'button', lv: () => 1, en: () => R.garage === 0, box: () => [5.9, 1.3, 8.6, 0.06, 0.1, 0.08], label: () => R.power ? [T('Open the garage door'), 1] : [T('Nothing happens. No power.'), 0], act: () => { if (!R.power) { audio.at('click', 5.9, 1.3, 8.6, 14000); return; } R.garage = 1; R.gT = 0; audio.at('motor', 3, 2, 13.5, 14000); noise(3, 1.5, 13, 1, 30, true); say(T('The garage door rattles open. Loudly.'), 3); } });
    add({ kind: 'fuse', lv: () => 0, en: () => !R.fuse, box: () => [8.92, -1.45, 0.22, 0.22, 0.28, 0.1], label: () => holding('fuse') ? [T('Put in the fuse'), 1] : [T('Fuse box · a fuse is missing'), 0], act: () => { if (!holding('fuse')) return deny(); consume(); R.fuse = true; audio.at('click', 9, -1.5, 0.3, 14000); syncLocks(); } });
    add({ kind: 'lever', lv: () => 0, en: () => R.fuse && !R.power, box: () => [9.27, -1.4, 0.22, 0.06, 0.16, 0.08], label: () => [T('Pull the lever'), 1], act: () => { R.power = true; audio.at('clunk', 9.3, -1.4, 0.3, 14000); audio.at('hum', 9.3, -1.4, 0.3, 14000); noise(9.3, -1.4, 0.3, 0, 10, true); syncLocks(); say(T('The power is back on. Something hums in the garage.'), 3.2); } });
    function deny() { audio.play('locked'); }
    function useDoor(d) {
      if (d.a > 0.5) { d.want = 0; audio.at('shut', d.cx, LY[d.lv] + 1, d.cz, 14000); noise(d.cx, LY[d.lv] + 1, d.cz, d.lv, 5, true); return; }
      if (d.locked) { if (holding(d.lock)) { consume(); d.locked = false; d.want = 1; audio.at('unlock', d.cx, LY[d.lv] + 1, d.cz, 14000); audio.at('door', d.cx, LY[d.lv] + 1, d.cz, 14000); noise(d.cx, LY[d.lv] + 1, d.cz, d.lv, 5, true); say(T('Unlocked.')); return; } audio.at('locked', d.cx, LY[d.lv] + 1, d.cz, 14000); noise(d.cx, LY[d.lv] + 1, d.cz, d.lv, 4, true); return; }
      d.want = 1; audio.at('door', d.cx, LY[d.lv] + 1, d.cz, 14000, P.cr > 0.5 ? 0.5 : 1); noise(d.cx, LY[d.lv] + 1, d.cz, d.lv, P.cr > 0.5 ? 2.5 : 4.5, true);
    }
    function pickup(it) {
      if (holding('camera') && it.k === 'bulb') { freeItem(it); it.st = 'u'; syncItem(it); R.flashes++; audio.play('pick'); say(T('The camera has {n} flashes.', { n: R.flashes })); return; }
      const old = P.held, sx = it.x, sy = it.y, sz = it.z, slv = it.lv, sdr = it.dr, ssp = it.spot;
      freeItem(it); it.st = 'h'; it.fly = false; syncItem(it); P.held = it;
      if (old) { old.st = 'w'; old.lv = slv; old.x = sx; old.y = sy; old.z = sz; old.dr = sdr; old.spot = ssp; if (sdr) sdr.items.push(old); syncItem(old, true); }
      audio.play('pick');
      if (!R.noted['i_' + it.k]) { R.noted['i_' + it.k] = 1; say(T(HINT[it.k]), 3.4); }
    }
    function dropHeld() {
      const it = P.held; if (!it || cut) return;
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), o = { x: P.x + fx * 0.45, z: P.z + fz * 0.45 };
      collide(P.lv, o, 0.12, true, false);
      it.st = 'w'; it.lv = P.lv; it.x = o.x; it.z = o.z; it.y = groundY(P.lv, o.x, o.z); it.ry = Math.random() * TAU; it.spot = null; it.dr = null; P.held = null; syncItem(it, true);
      const soft = P.cr > 0.5, metal = /Key|hammer|cutters|camera/.test(it.k);
      audio.at('drop', it.x, it.y, it.z, 14000, soft ? 'soft' : metal ? 'metal' : 'hard', soft ? 0.5 : 1);
      noise(it.x, it.y, it.z, it.lv, soft ? 3 : 9, true);
      if (!R.noted.drop && !soft) { R.noted.drop = 1; say(T('Crouch before you drop things to put them down quietly.'), 3.4); }
    }
    function throwHeld() {
      const it = P.held; if (!it || cut) return;
      const cp = Math.cos(P.pitch), dx = -Math.sin(P.yaw) * cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * cp, ey = P.y + lerp(EYE, CREYE, P.cr);
      it.st = 'w'; it.lv = P.lv; it.x = P.x + dx * 0.35; it.y = ey - 0.15; it.z = P.z + dz * 0.35; it.vx = dx * 7.2; it.vy = dy * 7.2 + 1.5; it.vz = dz * 7.2; it.fly = true; it.spot = null; it.dr = null; P.held = null; it.mesh.visible = true;
      audio.play('rustle');
    }
    function useCamera() {
      if (R.flashes <= 0) { say(T('No flash left. Find a flash bulb.')); audio.play('click'); return; }
      R.flashes--; flashT = 0.4; audio.play('flash'); noise(P.x, P.y, P.z, P.lv, 8, true);
      if (K.on && K.st !== 'stun' && K.st !== 'catch' && K.lv === P.lv) {
        const dx = K.x - P.x, dz = K.z - P.z, d = Math.hypot(dx, dz), fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
        if (d < 7.5 && (fx * dx + fz * dz) / Math.max(0.01, d) > 0.72 && los(P.lv, P.x, P.z, K.lv, K.x, K.z)) { K.st = 'stun'; K.t = R.D.stun; K.path = null; K.sawHide = null; K.door = null; K.notice = 0; sfxAt('gasp', K.lv, K.x, K.y + 1.9, K.z); say(T('The flash blinds him! Go!'), 2.6); }
      }
    }
    function enterHide(hs) {
      P.hide = hs; P.look = 0; P.lookP = 0; P.vx = P.vz = 0; hs.open = 1;
      if (hs.kind === 'ward') audio.at('door', hs.x, LY[hs.lv] + 1, hs.z, 14000, 0.4); else audio.at('rustle', hs.x, LY[hs.lv] + 0.3, hs.z, 14000);
      noise(hs.x, LY[hs.lv] + 0.5, hs.z, hs.lv, 2.5, true);
      if (K.on && K.st !== 'stun' && (K.sees || (K.st === 'chase' && K.lostT < 0.4 && Math.hypot(K.x - P.x, K.z - P.z) < 10))) { K.sawHide = hs; K.st = 'chase'; K.repath = 0; }
      if (!R.noted.hide) { R.noted.hide = 1; say(T('Stay still. He cannot find you unless he saw you hide.'), 3.6); }
    }
    function exitHide() { const hs = P.hide; if (!hs) return; P.hide = null; hs.open = 1; P.x = hs.out.x; P.z = hs.out.z; P.lv = hs.lv; P.y = groundY(P.lv, P.x, P.z); P.ox = P.x; P.oz = P.z; P.oy = P.y; P.yaw = Math.atan2(-(hs.out.x - hs.x), -(hs.out.z - hs.z)); P.pitch = 0; audio.at(hs.kind === 'ward' ? 'door' : 'rustle', hs.x, LY[hs.lv] + 1, hs.z, 14000, 0.4); noise(hs.x, LY[hs.lv] + 0.5, hs.z, hs.lv, 2.5, true); }

    const pin = { mx: 0, mz: 0, run: false, crouch: false, use: false };
    const PAD = { on: false, active: false, lx: 0, ly: 0, rx: 0, ry: 0, run: false, use: false };
    const JOY = { id: null, ox: 0, oy: 0, x: 0, y: 0 }, LOOK = { id: null, x: 0, y: 0 }, TBH = {};
    function stepPlayer(h) {
      const keys = api.keys;
      let mx = 0, mz = 0, runK = false, crK = false, useK = false;
      if (mode === 'play') {
        if (keys.has('KeyW') || keys.has('ArrowUp')) mz += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) mz -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
        runK = keys.has('ShiftLeft') || keys.has('ShiftRight') || !!TBH.run || PAD.run; crK = keys.has('ControlLeft') || keys.has('ControlRight'); useK = keys.has('KeyE') || keys.has('KeyF') || !!TBH.use || PAD.use || P.mouseUse;
        if (JOY.id != null) { mx += JOY.x; mz -= JOY.y; }
        if (PAD.on) { mx += PAD.lx; mz -= PAD.ly; }
      }
      const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
      P.rustleT -= h; P.wireCool -= h;
      if (P.trap) {
        if (useK) { P.trapK += h / R.D.free; if (P.rustleT <= 0) { P.rustleT = 0.45; audio.play('struggle'); noise(P.x, P.y, P.z, P.lv, 5, true); } if (P.trapK >= 1) { P.trap = null; P.trapK = 0; say(T('You pull your foot free.')); } }
        else P.trapK = Math.max(0, P.trapK - h * 0.4);
        P.moving = false; return;
      }
      if (P.hide) { P.moving = false; if (ml > 0.2 && P.rustleT <= 0) { P.rustleT = 0.9; audio.play('rustle'); noise(P.x, P.y, P.z, P.lv, 2.5, true); } return; }
      const wantC = P.crTog || crK;
      P.cr = damp(P.cr, wantC ? 1 : 0, 9, h);
      const canRun = runK && !P.tired && mz > 0.3 && P.cr < 0.35;
      P.run = canRun && ml > 0.2;
      if (P.run) { P.stam -= h / 5.5; if (P.stam <= 0) { P.stam = 0; P.tired = true; } } else { P.stam = Math.min(1, P.stam + h / (P.moving ? 8 : 5)); if (P.tired && P.stam > 0.4) P.tired = false; }
      const spd = P.run ? 4.0 : lerp(2.6, 1.3, P.cr) * (P.tired ? 0.85 : 1);
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
      const tvx = (fx * mz + rx * mx) * spd, tvz = (fz * mz + rz * mx) * spd;
      P.vx = damp(P.vx, tvx, 12, h); P.vz = damp(P.vz, tvz, 12, h);
      const o = { x: P.x + P.vx * h, z: P.z + P.vz * h };
      collide(P.lv, o, PR, P.cr > 0.6, false);
      const dx = o.x - P.x, dz = o.z - P.z, dd = Math.hypot(dx, dz);
      for (const wi of R.wires) { const [wl, ax, X, Z] = WIRES[wi]; if (wl !== P.lv || P.wireCool > 0) continue; const a0 = ax === 'v' ? P.x - X : P.z - Z, a1 = ax === 'v' ? o.x - X : o.z - Z, u = ax === 'v' ? o.z - Z : o.x - X; if (a0 * a1 <= 0 && Math.abs(a0 - a1) > 1e-5 && u > 0.05 && u < 0.95) { if (P.cr < 0.55) { P.wireCool = 2.5; audio.at('cans', ax === 'v' ? X : X + 0.5, LY[wl] + 1, ax === 'v' ? Z + 0.5 : Z, 14000); noise(o.x, P.y, o.z, P.lv, 22, true); if (!R.noted.wire) { R.noted.wire = 1; say(T('Tin cans on a wire! Crouch to slip under them.'), 3.4); } } else if (!R.noted.wireC) { R.noted.wireC = 1; say(T('You slip under the wire.')); } } }
      P.x = o.x; P.z = o.z;
      P.y = groundY(P.lv, P.x, P.z); P.lv = levelAt(P.lv, P.x, P.z, P.y);
      P.moving = dd > 0.004;
      const stride = P.run ? 0.95 : lerp(0.72, 0.55, P.cr);
      if (P.moving) { P.stepD += dd; P.bob += dd * Math.PI / stride; if (P.stepD > stride) { P.stepD -= stride; const surf = surfAt(P.lv, P.x, P.z), v = P.run ? 1 : P.cr > 0.5 ? 0.22 : 0.55; audio.play('step', surf, v); const loud = P.run ? 9 : P.cr > 0.5 ? 0 : 3.2; if (loud) noise(P.x, P.y, P.z, P.lv, loud, true); } }
      const ci = Math.floor(P.x), cj = Math.floor(P.z), cell = P.lv * 1000 + cj * W + ci;
      if (cell !== P.cell) { P.cell = cell; P.creakArm = true; }
      if (P.creakArm) for (const k of R.creaks) { const [cl, i, j] = CREAKS[k]; if (cl === P.lv && i === ci && j === cj && Math.abs(P.x - i - 0.5) < 0.42 && Math.abs(P.z - j - 0.5) < 0.42) { P.creakArm = false; audio.play('creak', P.cr > 0.5 ? 0.55 : 1); noise(P.x, P.y, P.z, P.lv, P.cr > 0.5 ? 7 : 13, true); if (!R.noted.creak) { R.noted.creak = 1; say(T('A loose board creaks. Darker boards are loose.'), 3.2); } } }
      for (const t of R.traps) { if (t.sprung || t.lv !== P.lv) continue; if (Math.hypot(P.x - t.x, P.z - t.z) < 0.27) { t.sprung = true; syncTraps(); P.trap = t; P.trapK = 0; P.x = t.x; P.z = t.z; P.vx = P.vz = 0; audio.play('snap'); noise(P.x, P.y, P.z, P.lv, 20, true); say(touchOn ? T('Caught in a trap! Hold Use to free your foot.') : T('Caught in a trap! Hold E to free your foot.'), 3.4); break; } }
      if (R.D.code) for (let i = 0; i < 4; i++) { if (R.found[i]) continue; const q = CLUES[R.clues[i]]; if (q.lv !== P.lv) continue; const ex = q.x - P.x, ez = q.z - P.z, d = Math.hypot(ex, ez); if (d > 3.2 || d < 0.2) continue; const lf = (-Math.sin(P.yaw) * ex - Math.cos(P.yaw) * ez) / d; if (lf < 0.8 || ex * q.nx + ez * q.nz > 0) continue; if (!los(P.lv, P.x, P.z, q.lv, q.x + q.nx * 0.2, q.z + q.nz * 0.2)) continue; R.found[i] = true; say(T('A number on the wall: {n} = {d}', { n: ['I', 'II', 'III', 'IV'][i], d: R.code[i] }), 3.4); audio.play('pick'); }
    }
    function stepWorld(h) {
      for (const d of DOORS) { if (d.a !== d.want) { d.a += clamp(d.want - d.a, -h * 2.4, h * 2.4); const e = d.a * d.a * (3 - 2 * d.a); d.g.rotation.y = d.thc + (d.tho - d.thc) * e; d.box.on = d.a < 0.5; d.obox.on = d.a >= 0.5; } }
      for (const dr of DRW) { if (dr.open !== dr.want) { dr.open += clamp(dr.want - dr.open, -h * 3, h * 3); const o = dr.open * 0.36; dr.g.position.set(dr.base.x + dr.dir.x * o, dr.base.y, dr.base.z + dr.dir.z * o); for (const it of dr.items) syncItem(it, false); } }
      for (const hs of H.WARD) { const tgt = P.hide === hs ? 0 : 0; if (hs.open > tgt) { hs.open = Math.max(0, hs.open - h * (K.st === 'check' && K.checks[0] === hs ? 0 : 1.6)); } const e = Math.min(1, hs.open) * 1.3; hs.doors.forEach(dd => { dd.g.rotation.y = dd.th0 + dd.s * e; }); }
      for (const it of ITEMLIST) {
        if (!it.fly) continue;
        it.vy -= 9.8 * h; const o = { x: it.x + it.vx * h, z: it.z + it.vz * h }; collide(it.lv, o, 0.07, true, false);
        if (Math.abs(o.x - (it.x + it.vx * h)) > 1e-4) it.vx *= -0.3; if (Math.abs(o.z - (it.z + it.vz * h)) > 1e-4) it.vz *= -0.3;
        it.x = o.x; it.z = o.z; it.y += it.vy * h; it.ry += h * 9;
        if (it.y > LY[it.lv] + 2.7) { it.y = LY[it.lv] + 2.7; it.vy = -Math.abs(it.vy) * 0.3; }
        const gy = groundY(it.lv, it.x, it.z);
        if (it.y <= gy) {
          it.y = gy; it.fly = false; it.lv = levelAt(it.lv, it.x, it.z, gy + 0.01);
          if (it.k === 'bottle') { it.st = 'u'; it.mesh.visible = false; audio.at('glass', it.x, it.y, it.z, occ(it.lv, it.x, it.z)); noise(it.x, it.y, it.z, it.lv, 22, true); }
          else { audio.at('drop', it.x, it.y, it.z, occ(it.lv, it.x, it.z), /Key|hammer|cutters|camera/.test(it.k) ? 'metal' : 'hard'); noise(it.x, it.y, it.z, it.lv, 17, true); syncItem(it, true); }
        } else { it.mesh.position.set(it.x, it.y, it.z); it.mesh.rotation.set(it.ry * 0.7, it.ry, 0); }
      }
      if (R.garage === 1) { R.gT += h; roller.scale.y = 1 - 0.96 * Math.min(1, R.gT / 4.5); if (R.gT >= 4.5) R.garage = 2; }
    }

    function escape(route) {
      if (cut) return;
      if (route === 'door') { FRONT.locked = false; FRONT.want = 1; audio.at('door', 11.5, 1, 13.9, 14000); cut = { k: 'door', t: 0, d: 3.8, x: P.x, z: P.z, yaw: P.yaw, pitch: P.pitch }; }
      else { consume(); cut = { k: 'car', t: 0, d: 5.6 }; audio.at('crank', 3, 0.8, 8, 14000); audio.at('engine', 3, 0.8, 8, 14000); noise(3, 1, 9, 1, 40, true); headL.forEach(m => m.material.color.set(0xfff4d0)); carLight.intensity = 2.2; if (K.on) { K.st = 'catch'; K.x = K.ox = 5.4; K.z = K.oz = 7.55; K.lv = 1; K.y = K.oy = 0; K.yaw = -Math.PI / 2; } }
      unlockPtr(); journal(false); codeEl.hidden = true; if (mode === 'code') mode = 'play';
    }
    function endCatch() {
      if (R.day >= 5) { cut = { k: 'bad', t: 0, d: 4.2 }; card.innerHTML = `<b>${esc(T('The house is quiet again'))}</b><span>${esc(T('He kept you. Try again.'))}</span>`; fade.classList.add('on', 'card'); audio.play('lose'); SV.run = null; persist(); return; }
      R.day++; persist(); startDay(false);
    }
    function stepCut(h) {
      cut.t += h;
      if (cut.k === 'wake') { if (cut.t > 1.5) fade.classList.remove('on'); if (cut.t >= cut.d) { cut = null; fade.classList.remove('card'); if (R.day === 1) { hintI = 0; hintT = 0.6; } if (!touchOn && !lockedPtr && mode === 'play') say(T('Click to look around'), 2.5); } }
      else if (cut.k === 'catch') { if (cut.t > 1.15 && !cut.f) { cut.f = 1; card.innerHTML = ''; fade.classList.remove('card'); fade.classList.add('on'); } if (cut.t >= cut.d) { cut = null; endCatch(); } }
      else if (cut.k === 'door') { if (cut.t > 2.6 && !cut.f) { cut.f = 1; card.innerHTML = ''; fade.classList.add('on'); audio.play('win'); } if (cut.t >= cut.d) { cut = null; showEnd(true, 'door'); } }
      else if (cut.k === 'car') { const z = 9.3 + Math.pow(Math.max(0, cut.t - 1.7), 2) * 1.1; CAR.position.z = z; if (z + 2.2 > 16.1) gate.rotation.x = Math.min(1.45, gate.rotation.x + h * 4); if (cut.t > 4.4 && !cut.f) { cut.f = 1; card.innerHTML = ''; fade.classList.add('on'); audio.play('win'); } if (cut.t >= cut.d) { cut = null; showEnd(true, 'car'); } }
      else if (cut.k === 'bad') { if (cut.t >= cut.d) { cut = null; showEnd(false); } }
    }
    function step(h) {
      if (!R) return;
      P.ox = P.x; P.oy = P.y; P.oz = P.z;
      if (cut) stepCut(h); else if (mode === 'play' || mode === 'code') { stepPlayer(h); R.t += h; }
      if (!R) return;
      if (!cut || cut.k === 'wake' || cut.k === 'door') stepKeeper(h); else { K.ox = K.x; K.oy = K.y; K.oz = K.z; }
      stepWorld(h);
      if (hintT > 0 && !cut) { hintT -= h; if (hintT <= 0 && hintI < 4) { const HT = touchOn ? ['Find a way out before the fifth day.', 'Every sound carries. Crouch to move without a sound.', 'Look at things and tap Use.', 'Notes keeps track of what you found.'] : ['Find a way out before the fifth day.', 'Every sound carries. Crouch (C) to move without a sound.', 'Look at things and press E or click to use them.', 'Tab opens your notes.']; say(T(HT[hintI]), 4); hintI++; hintT = 5.2; } }
      saveT += h; if (saveT > 10 && !cut) { saveT = 0; persist(); }
    }

    function btn(a, t, cls) { return `<button class="b ${cls || ''}" data-a="${a}">${esc(t)}</button>`; }
    function showPanel(html, cls) { panel.className = 'panel ' + (cls || ''); panel.innerHTML = html; panel.hidden = false; const f = panel.querySelector('button'); if (f && !touchOn) f.focus({ preventScroll: true }); }
    function hidePanel() { panel.hidden = true; panel.innerHTML = ''; }
    const bestTxt = i => SV.st.best[i] ? fmtT(SV.st.best[i]) : '—';
    function showTitle() {
      mode = 'title'; R = null; hud.hidden = true; touch.hidden = true; dayEl.hidden = true; api.score(null); fade.classList.remove('on', 'card'); journal(false);
      const r = SV.run, esc0 = SV.st.esc.reduce((a, b) => a + b, 0);
      showPanel(`<div class="tt"><h1>${esc(T('The Quiet House'))}</h1><p>${esc(T('Five days. One way out. Stay quiet.'))}</p></div><div class="bs">${r ? btn('cont', T('Continue') + ' · ' + T('Day {n}', { n: r.day }) + ' · ' + T(DIFFS[r.diff].n), 'pri') : ''}${btn('new', T('New game'), r ? '' : 'pri')}${btn('help', T('How to play'))}${btn('opts', T('Options'))}</div><p class="st">${esc(T('Escapes'))} <b>${esc0}</b>${SV.st.best.some(v => v) ? ' · ' + esc(T('Best time')) + ' <b>' + fmtT(Math.min(...SV.st.best.filter(v => v))) + '</b>' : ''}</p>`, 'title');
    }
    function showDiff() {
      mode = 'diff';
      showPanel(`<h2>${esc(T('Choose a difficulty'))}</h2><div class="dl">${DIFFS.map((d, i) => `<button class="b dc${i === 2 ? ' pri' : ''}" data-a="d${i}"><b>${esc(T(d.n))}</b><span>${esc(T(d.d))}</span><em>${esc(T('Best time'))} ${bestTxt(i)}</em></button>`).join('')}</div>${SV.run ? `<p class="warn">${esc(T('Starting a new game replaces your saved game.'))}</p>` : ''}<div class="bs row">${btn('back', T('Back'))}</div>`, 'diff');
    }
    function showHelp(back) {
      const prev = mode; mode = 'help'; menuStack.push(back || prev);
      const kb = [['WASD / arrows', 'Move'], ['Mouse', 'Look'], ['Shift', 'Run (noisy)'], ['C or Ctrl', 'Crouch (silent)'], ['E or click', 'Use, take, hide'], ['G', 'Drop the item you hold'], ['R or right click', 'Throw it'], ['Tab or J', 'Notes'], ['Esc', 'Pause']];
      const tc = [['Left stick', 'Move'], ['Drag right side', 'Look'], ['Use', 'Use, take, hide'], ['Crouch · Run · Throw · Drop', 'The other buttons']];
      showPanel(`<h2>${esc(T('How to play'))}</h2><p class="lead">${esc(T('You have five days to escape. The Keeper hears every sound. If he catches you, the day ends and you wake up in your bed. Find the tools and keys to open the front door, or get the car going and drive out of the garage.'))}</p><div class="kt">${(touchOn ? tc : kb).map(([k, v]) => `<div><kbd>${esc(T(k))}</kbd><span>${esc(T(v))}</span></div>`).join('')}</div><ul class="tips"><li>${esc(T('His footsteps, his keys and his lantern give him away.'))}</li><li>${esc(T('Hide under beds or in wardrobes. He finds you only if he saw you go in.'))}</li><li>${esc(T('Throw a bottle to lure him away. Crouch before dropping things.'))}</li><li>${esc(T('The flash camera blinds him for a few seconds.'))}</li></ul><div class="bs row">${btn('back', T('Back'))}</div>`, 'help');
    }
    function showOpts(back) {
      const prev = mode; mode = 'opts'; menuStack.push(back || prev);
      const o = SV.opt;
      showPanel(`<h2>${esc(T('Options'))}</h2><label class="sl">${esc(T('Mouse sensitivity'))}<input type="range" min="0.2" max="3" step="0.1" value="${o.sens}" data-o="sens"><b>${o.sens.toFixed(1)}</b></label><label class="sl">${esc(T('Brightness'))}<input type="range" min="0.6" max="1.8" step="0.05" value="${o.bright}" data-o="bright"><b>${Math.round(o.bright * 100)}%</b></label><div class="bs row">${btn('inv', T('Invert look') + ' · ' + (o.inv ? T('On') : T('Off')))}${btn('bob', T('Head bob') + ' · ' + (o.bob ? T('On') : T('Off')))}</div><div class="bs row">${btn('back', T('Back'))}</div>`, 'opts');
    }
    function back() { const to = menuStack.pop() || 'title'; if (to === 'pause') showPause(); else if (to === 'title') showTitle(); else showTitle(); }
    function showPause() {
      mode = 'pause'; paused = true; audio.pause(true); unlockPtr(); persist(); journal(false);
      showPanel(`<h2>${esc(T('Paused'))}</h2><p class="lead">${esc(T('Day {n} of 5', { n: R.day }))} · ${esc(T(R.D.n))} · ${fmtT(R.t)}</p><div class="bs">${btn('resume', T('Resume'), 'pri')}${btn('help', T('How to play'))}${btn('opts', T('Options'))}${btn('quit', T('Quit to menu'))}</div><p class="st">${esc(T('Your game is saved. Continue it from the menu.'))}</p>`, 'pause');
    }
    function openPause() { if (!R || cut || mode === 'end') return; if (mode === 'code') { codeEl.hidden = true; } showPause(); }
    function resume() { hidePanel(); mode = 'play'; paused = false; audio.pause(false); last = 0; lockPtr(); }
    function showEnd(win, route) {
      mode = 'end'; paused = false; unlockPtr(); journal(false); codeEl.hidden = true; hud.hidden = true; touch.hidden = true;
      const t = Math.round(R.t), i = R.diff;
      let rec = false;
      if (win) { SV.st.esc[i]++; if (!SV.st.best[i] || t < SV.st.best[i]) { rec = true; SV.st.best[i] = t; } if (i >= 2) api.submit(Math.max(1, t)); }
      SV.run = null; persist();
      const rows = [[T('Time'), fmtT(t)], [T('Days used'), String(R.day)], [T('Difficulty'), T(R.D.n)], [T('Best time'), bestTxt(i)]];
      if (win) rows.splice(1, 0, [T('Way out'), route === 'car' ? T('By car') : T('Through the front door')]);
      showPanel(`<p class="kick">${esc(win ? T('You escaped') : T('Caught on the last day'))}</p><h2>${esc(win ? (route === 'car' ? T('You drove out of the garage') : T('You ran out into the night')) : T('The house is quiet again'))}</h2>${win && rec ? `<p class="rec">${esc(T('New best time'))}</p>` : ''}<div class="rows">${rows.map(([a, b]) => `<div><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('')}</div>${win && i < 2 ? `<p class="st">${esc(T('Records count from Normal up.'))}</p>` : ''}<div class="bs">${btn('again', T('Play again'), 'pri')}${btn('menu', T('Main menu'))}</div>`, 'end');
      fade.classList.remove('on', 'card'); api.score(win ? fmtT(t) : null);
      audio.tension(0, 0, 0);
    }
    function start(diff, from) {
      audio.unlock();
      newRun(diff, from); SV.st.runs += from ? 0 : 1; SV.run = snapshot(); persist();
      hidePanel(); mode = 'play'; paused = false; hud.hidden = false; touch.hidden = false; CAR.position.z = 9.3; gate.rotation.x = 0; headL.forEach(m => m.material.color.set(0x2a2820)); carLight.intensity = 0;
      startDay(!from); last = 0; lockPtr();
    }
    panel.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a; audio.unlock(); audio.play('ui');
      if (a === 'new') showDiff(); else if (a === 'cont') { const r = SV.run; if (r) start(r.diff, r); else showTitle(); }
      else if (a === 'help') showHelp(); else if (a === 'opts') showOpts(); else if (a === 'back') { if (mode === 'diff') showTitle(); else back(); }
      else if (a[0] === 'd' && a.length === 2) start(+a[1], null);
      else if (a === 'resume') resume(); else if (a === 'quit') { persist(); paused = false; audio.pause(false); showTitle(); }
      else if (a === 'again') { const d = R ? R.diff : 2; start(d, null); } else if (a === 'menu') showTitle();
      else if (a === 'inv' || a === 'bob') { SV.opt[a] = !SV.opt[a]; persist(); menuStack.pop(); showOpts(menuStack.length ? menuStack[menuStack.length - 1] : 'title'); menuStack.pop(); }
    });
    panel.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.o; if (!k) return; SV.opt[k] = clamp(+e.target.value, k === 'sens' ? 0.2 : 0.6, k === 'sens' ? 3 : 1.8); e.target.nextElementSibling.textContent = k === 'sens' ? SV.opt.sens.toFixed(1) : Math.round(SV.opt.bright * 100) + '%'; if (R) H.bakeU.value = R.D.dark * SV.opt.bright; persist(); });
    function menuKey(e) {
      const c = e.code, bs = [...panel.querySelectorAll('button, input')].filter(b => b.offsetParent);
      if (!bs.length) return;
      const i = bs.indexOf(document.activeElement);
      if (c === 'ArrowDown' || c === 'KeyS' || (c === 'ArrowRight' && document.activeElement.tagName !== 'INPUT')) { e.preventDefault(); bs[(i + 1) % bs.length].focus(); }
      else if (c === 'ArrowUp' || c === 'KeyW' || (c === 'ArrowLeft' && document.activeElement.tagName !== 'INPUT')) { e.preventDefault(); bs[(i - 1 + bs.length) % bs.length].focus(); }
      else if ((c === 'Enter' || c === 'Space' || c === 'KeyE') && i >= 0 && bs[i].tagName === 'BUTTON') { e.preventDefault(); if (!e.repeat) bs[i].click(); }
      else if (c === 'Escape' && !e.repeat) { e.preventDefault(); if (mode === 'pause') resume(); else if (mode === 'diff') showTitle(); else if (mode === 'help' || mode === 'opts') back(); }
    }
    function openCode() { mode = 'code'; codeSel = 0; codeVal = [0, 0, 0, 0]; renderCode(); codeEl.hidden = false; }
    function renderCode() {
      codeEl.innerHTML = `<h3>${esc(T('Code lock'))}</h3><div class="wh">${codeVal.map((v, i) => `<div class="w${i === codeSel ? ' on' : ''}" data-w="${i}"><button data-c="u${i}" aria-label="+">▲</button><b>${v}</b><button data-c="d${i}" aria-label="-">▼</button></div>`).join('')}</div><div class="bs row"><button class="b pri" data-c="try">${esc(T('Try the code'))}</button><button class="b" data-c="x">${esc(T('Leave'))}</button></div><p class="st">${esc(touchOn ? T('Tap the arrows to set the numbers.') : T('W S to turn · A D to move · E to try · Esc to leave'))}</p>`;
    }
    function codeTry() {
      if (codeVal.every((v, i) => v === R.code[i])) { R.locks.code = true; audio.at('pad', 11.9, 0.6, 13.8, 14000); noise(11.9, 0.6, 13.8, 1, 6, true); syncLocks(); codeEl.hidden = true; mode = 'play'; say(T('The code lock springs open.')); }
      else { audio.play('locked'); noise(11.9, 0.6, 13.8, 1, 3, true); codeEl.classList.remove('shake'); void codeEl.offsetWidth; codeEl.classList.add('shake'); }
    }
    function codeKey(c) {
      if (c === 'KeyW' || c === 'ArrowUp') { codeVal[codeSel] = (codeVal[codeSel] + 1) % 10; audio.play('click'); }
      else if (c === 'KeyS' || c === 'ArrowDown') { codeVal[codeSel] = (codeVal[codeSel] + 9) % 10; audio.play('click'); }
      else if (c === 'KeyA' || c === 'ArrowLeft') codeSel = (codeSel + 3) % 4; else if (c === 'KeyD' || c === 'ArrowRight') codeSel = (codeSel + 1) % 4;
      else if (c === 'KeyE' || c === 'Enter' || c === 'Space') return codeTry();
      else if (c === 'Escape' || c === 'Tab' || c === 'KeyQ') { codeEl.hidden = true; mode = 'play'; lockPtr(); return; }
      renderCode();
    }
    codeEl.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; const c = b.dataset.c; if (c === 'try') return codeTry(); if (c === 'x') { codeEl.hidden = true; mode = 'play'; lockPtr(); return; } const i = +c.slice(1); codeSel = i; codeVal[i] = (codeVal[i] + (c[0] === 'u' ? 1 : 9)) % 10; audio.play('click'); renderCode(); });
    function journal(on) {
      journalOpen = on == null ? !journalOpen : on;
      if (!journalOpen || !R) { jEl.hidden = true; journalOpen = false; return; }
      const ck = (ok, t) => `<li class="${ok ? 'ok' : ''}">${esc(t)}</li>`, L = R.locks, C = R.car;
      const found = R.found.map((f, i) => `<span class="${f ? 'ok' : ''}">${['I', 'II', 'III', 'IV'][i]}<b>${f ? R.code[i] : '?'}</b></span>`).join('');
      jEl.innerHTML = `<h3>${esc(T('Notes'))} <small>${esc(T('Day {n} of 5', { n: R.day }))}</small></h3><div class="cols"><div><h4>${esc(T('Front door'))}</h4><ul>${ck(!L.planks, T('Planks · a hammer'))}${ck(L.pad, T('Padlock · the padlock key'))}${R.D.code ? ck(L.code, T('Code lock · four numbers')) : ''}${R.D.chain ? ck(L.chain, T('Chain · bolt cutters')) : ''}${ck(L.key, T('Door lock · the front door key'))}</ul></div><div><h4>${esc(T('Car'))}</h4><ul>${ck(C.bat, T('Battery'))}${R.D.plug ? ck(C.plug, T('Spark plug')) : ''}${ck(C.fuel, T('Fuel'))}${ck(R.power, T('Power · the fuse box in the cellar'))}${ck(R.garage >= 2, T('Garage door open'))}${ck(false, T('Car key'))}</ul></div></div>${R.D.code ? `<h4>${esc(T('Numbers on the walls'))}</h4><div class="code4">${found}</div>` : ''}<p class="st">${esc(T('Camera flashes'))}: <b>${R.flashes}</b> · ${esc(touchOn ? T('Tap Notes to close') : T('Tab to close'))}</p>`;
      jEl.hidden = false;
    }

    let unlockIntent = false;
    function lockPtr() { if (touchOn || !canvas.requestPointerLock || document.pointerLockElement === canvas) return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { freeLook = true; }); } catch (e) { freeLook = true; } }
    function unlockPtr() { if (document.pointerLockElement === canvas) { unlockIntent = true; try { document.exitPointerLock(); } catch (e) {} } }
    api.on(document, 'pointerlockchange', () => { const was = lockedPtr; lockedPtr = document.pointerLockElement === canvas; if (lockedPtr) freeLook = false; if (was && !lockedPtr) { if (unlockIntent) { unlockIntent = false; return; } if ((mode === 'play' || mode === 'code') && R && !cut) openPause(); } });
    api.on(document, 'visibilitychange', () => { if (document.visibilityState === 'hidden') { persist(); if ((mode === 'play' || mode === 'code') && R && !cut) openPause(); } });
    api.on(window, 'blur', () => { P.mouseUse = false; Object.keys(TBH).forEach(k => { TBH[k] = false; }); if ((mode === 'play' || mode === 'code') && R && !cut && !touchOn) openPause(); });
    const look = (dx, dy) => {
      const s = 0.0022 * SV.opt.sens, inv = SV.opt.inv ? -1 : 1;
      if (P.hide) { P.look = clamp(P.look - dx * s, -1.0, 1.0); P.lookP = clamp(P.lookP - dy * s * inv, -0.4, 0.4); return; }
      if (cut) return;
      P.yaw -= dx * s; P.pitch = clamp(P.pitch - dy * s * inv, -1.45, 1.45);
    };
    api.on(document, 'mousemove', e => { if (!R || (mode !== 'play' && mode !== 'code')) return; if (lockedPtr) look(e.movementX || 0, e.movementY || 0); else if (freeLook && P.drag) look(e.movementX || 0, e.movementY || 0); });
    api.on(wrap, 'contextmenu', e => e.preventDefault());
    api.on(wrap, 'wheel', e => { if (mode === 'play') e.preventDefault(); }, { passive: false });
    api.on(wrap, 'pointerdown', e => {
      if (e.pointerType === 'touch') { if (!touchOn) setTouch(true); return; }
      if (e.target.closest('.panel, .code, .journal, .tb')) return;
      if (touchOn && e.pointerType === 'mouse') setTouch(false);
      if (!R || mode !== 'play' || cut) return;
      if (!lockedPtr && !freeLook) { lockPtr(); return; }
      if (!lockedPtr && freeLook) P.drag = true;
      if (e.button === 0) { P.mouseUse = true; use(); } else if (e.button === 2) throwHeld();
    });
    api.on(window, 'pointerup', e => { if (e.pointerType !== 'touch') { P.mouseUse = false; P.drag = false; } });
    function use() {
      if (!R || cut || mode !== 'play') return;
      if (P.trap) return;
      if (P.hide) { exitHide(); return; }
      if (focus) { focus.act(); focus = null; labT = null; return; }
      if (holding('camera')) useCamera();
    }
    api.on(window, 'keydown', e => {
      const c = e.code;
      if (mode === 'play') {
        if (c === 'Tab' || c === 'Space') e.preventDefault();
        if (e.repeat) return;
        if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); if (journalOpen) journal(false); else openPause(); return; }
        if (touchOn) setTouch(false);
        if (cut) return;
        if (c === 'KeyE' || c === 'KeyF' || c === 'Enter') use(); else if (c === 'KeyG') dropHeld(); else if (c === 'KeyR') throwHeld(); else if (c === 'KeyC') P.crTog = !P.crTog; else if (c === 'Tab' || c === 'KeyJ') journal();
        return;
      }
      if (mode === 'code') { e.preventDefault(); if (!e.repeat || /Arrow|KeyW|KeyS/.test(c)) codeKey(c); return; }
      if (!panel.hidden) menuKey(e);
    });
    const tLayer = touch;
    api.on(tLayer, 'pointerdown', e => {
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      if (!touchOn) setTouch(true);
      const b = e.target.closest('.tb');
      if (b) {
        e.preventDefault(); const k = [...b.classList].find(x => x.startsWith('tb-')).slice(3); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (er) {}
        audio.unlock();
        if (k === 'use') { TBH.use = true; use(); } else if (k === 'crouch') { P.crTog = !P.crTog; } else if (k === 'run') TBH.run = true; else if (k === 'throw') throwHeld(); else if (k === 'drop') dropHeld(); else if (k === 'notes') journal(); else if (k === 'pause') openPause();
        return;
      }
      if (!R || mode !== 'play') return;
      const r = wrap.getBoundingClientRect(), x = e.clientX - r.left;
      if (x < r.width * 0.42 && JOY.id == null) { JOY.id = e.pointerId; JOY.ox = e.clientX; JOY.oy = e.clientY; JOY.x = JOY.y = 0; joy.style.left = (x) + 'px'; joy.style.top = (e.clientY - r.top) + 'px'; joy.classList.add('on'); }
      else if (LOOK.id == null) { LOOK.id = e.pointerId; LOOK.x = e.clientX; LOOK.y = e.clientY; }
      try { tLayer.setPointerCapture(e.pointerId); } catch (er) {}
    });
    api.on(tLayer, 'pointermove', e => {
      if (e.pointerId === JOY.id) { const R0 = Math.max(36, wrap.clientWidth * 0.07), dx = e.clientX - JOY.ox, dy = e.clientY - JOY.oy, l = Math.hypot(dx, dy), k = l > R0 ? R0 / l : 1; JOY.x = dx * k / R0; JOY.y = dy * k / R0; joyK.style.transform = `translate(${dx * k}px,${dy * k}px)`; TBH.run = TBH.runJ = l > R0 * 1.6 && JOY.y < -0.5 ? true : TBH.runJ ? false : TBH.run; }
      else if (e.pointerId === LOOK.id) { const dx = e.clientX - LOOK.x, dy = e.clientY - LOOK.y; LOOK.x = e.clientX; LOOK.y = e.clientY; look(dx * 2.4, dy * 2.4); }
    });
    const tEnd = e => {
      if (e.pointerId === JOY.id) { JOY.id = null; JOY.x = JOY.y = 0; joyK.style.transform = ''; joy.classList.remove('on'); if (TBH.runJ) { TBH.runJ = false; TBH.run = false; } }
      if (e.pointerId === LOOK.id) LOOK.id = null;
      const b = e.target.closest && e.target.closest('.tb'); if (b) { b.classList.remove('on'); const k = [...b.classList].find(x => x.startsWith('tb-')).slice(3); if (k === 'use') TBH.use = false; if (k === 'run') TBH.run = false; }
    };
    api.on(tLayer, 'pointerup', tEnd); api.on(tLayer, 'pointercancel', tEnd);
    function pollPad(dt) {
      const list = navigator.getGamepads ? navigator.getGamepads() : null; let gp = null;
      if (list) for (const g of list) if (g && g.connected) { gp = g; break; }
      if (!gp) { PAD.on = PAD.active = false; PAD.run = PAD.use = false; gpPrev = null; return; }
      const now = gp.buttons.map(x => !!x.pressed);
      if (!gpPrev) { gpPrev = now; return; }
      const dz = v => Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82, b = i => !!now[i], edge = i => now[i] && !gpPrev[i];
      if (!PAD.active) { if (now.some((x, i) => x && !gpPrev[i])) PAD.active = true; else { gpPrev = now; return; } }
      PAD.on = true; PAD.lx = dz(gp.axes[0] || 0); PAD.ly = dz(gp.axes[1] || 0); PAD.rx = dz(gp.axes[2] || 0); PAD.ry = dz(gp.axes[3] || 0); PAD.run = b(10) || b(6); PAD.use = b(0);
      if (mode === 'play' && R) {
        if (PAD.rx || PAD.ry) { const s = 2.6 * SV.opt.sens * dt / 0.0022; look(PAD.rx * s, PAD.ry * s); }
        if (edge(0)) use(); if (edge(1)) P.crTog = !P.crTog; if (edge(2)) dropHeld(); if (edge(5) || edge(7)) throwHeld(); if (edge(3)) journal(); if (edge(9)) openPause();
      } else if (mode === 'code') { if (edge(12)) codeKey('KeyW'); if (edge(13)) codeKey('KeyS'); if (edge(14)) codeKey('KeyA'); if (edge(15)) codeKey('KeyD'); if (edge(0)) codeKey('KeyE'); if (edge(1)) codeKey('Escape'); }
      else if (!panel.hidden) { const fake = c => menuKey({ code: c, repeat: false, preventDefault() {} }); if (edge(12) || (PAD.ly < -0.6 && !gpPrev.up)) fake('ArrowUp'); if (edge(13) || (PAD.ly > 0.6 && !gpPrev.dn)) fake('ArrowDown'); if (edge(0)) fake('Enter'); if (edge(1) || edge(9)) { if (mode === 'pause') resume(); else fake('Escape'); } }
      gpPrev = now; gpPrev.up = PAD.ly < -0.6; gpPrev.dn = PAD.ly > 0.6;
    }

    const ray = new THREE.Vector3(), rayO = new THREE.Vector3();
    function updFocus() {
      focus = null;
      if (!R || cut || mode !== 'play') { setLab(''); return; }
      if (P.trap) { setLab(touchOn ? T('Hold Use to free your foot') : T('Hold E to free your foot'), 1); return; }
      if (P.hide) { setLab(T('Get out'), 1); return; }
      cam.getWorldDirection(ray); rayO.copy(cam.position);
      let best = 2.1;
      for (const t of TG) {
        if (t.lv() !== P.lv || !t.en()) continue;
        const b = t.box(); let t0 = 0, t1 = best;
        for (let a = 0; a < 3; a++) { const o = a === 0 ? rayO.x : a === 1 ? rayO.y : rayO.z, d = a === 0 ? ray.x : a === 1 ? ray.y : ray.z, lo = b[a] - b[a + 3], hi = b[a] + b[a + 3]; if (Math.abs(d) < 1e-6) { if (o < lo || o > hi) { t0 = 1e9; break; } continue; } let ta = (lo - o) / d, tb = (hi - o) / d; if (ta > tb) { const q = ta; ta = tb; tb = q; } if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) break; }
        if (t0 > t1 || t0 >= best) continue;
        const hx = rayO.x + ray.x * t0, hz = rayO.z + ray.z * t0, bl = rayBlock(P.lv, rayO.x, rayO.z, hx, hz);
        if (bl < 1 && bl * t0 < t0 - 0.16) continue;
        best = t0; focus = t;
      }
      if (focus) { const [s, ok] = focus.label(); setLab(s, ok); } else setLab('');
    }
    const DBG = { cam: null };
    let cnt = 0, tvT = 0, tickT = 0, kyaw = 0;
    const kp = new THREE.Vector3();
    function poseKeeper(a, dt) {
      if (!K.on && mode !== 'title') { KM.root.visible = false; return; }
      KM.root.visible = true;
      const x = lerp(K.ox, K.x, a), y = lerp(K.oy, K.y, a), z = lerp(K.oz, K.z, a);
      const sp = Math.hypot(K.x - K.ox, K.z - K.oz) / STEP;
      KM.root.position.set(x, y, z); kyaw += angDiff(kyaw, K.yaw) * Math.min(1, dt * 10); KM.root.rotation.y = kyaw;
      const chase = K.st === 'chase' && sp > 1.5, amp = clamp(sp / 1.4, 0, 1.4), ph = K.phase * Math.PI / (chase ? 1.05 : 0.78), s = Math.sin(ph);
      const L = KM.L, Rr = KM.R;
      L.hip.rotation.x = s * 0.5 * amp; Rr.hip.rotation.x = -s * 0.5 * amp; L.knee.rotation.x = Math.max(0, -Math.cos(ph)) * 0.7 * amp; Rr.knee.rotation.x = Math.max(0, Math.cos(ph)) * 0.7 * amp;
      let lean = chase ? 0.42 : 0.16, ar = -s * 0.32 * amp, al = s * 0.12 * amp, hipY = 1.0 + Math.abs(Math.cos(ph)) * 0.03 * amp, armR = 0;
      if (K.st === 'stun') { lean = -0.1; ar = -2.5; al = -2.3; hipY = 0.98; }
      else if (K.st === 'catch' && cut && cut.k === 'catch') { lean = 0.35; ar = -1.5 - Math.min(1, cut.t) * 0.3; armR = 0.3; }
      else if (K.st === 'check' && !K.path && K.checks[0] && K.checks[0].kind === 'bed') { lean = 1.0; hipY = 0.62; L.knee.rotation.x = Rr.knee.rotation.x = 1.3; L.hip.rotation.x = Rr.hip.rotation.x = -1.2; ar = -0.9; }
      else if (chase) ar = -1.25 + s * 0.15;
      KM.hips.position.y = hipY; KM.torso.rotation.x = lean; KM.AR.sh.rotation.x = ar; KM.AR.sh.rotation.z = armR; KM.AR.el.rotation.x = chase ? -0.3 : -0.15; KM.AL.sh.rotation.x = al - (chase ? 0.25 : 0); KM.AL.el.rotation.x = -0.25;
      KM.lantern.rotation.x = -(KM.AL.sh.rotation.x + KM.AL.el.rotation.x + lean);
      KM.head.rotation.y = damp(KM.head.rotation.y, K.st === 'look' || K.st === 'listen' ? K.head : 0, 5, dt); KM.head.rotation.z = K.st === 'listen' ? 0.28 : 0; KM.head.rotation.x = -lean * 0.6 + (K.st === 'stun' ? 0.3 : 0);
      const fl = 0.85 + Math.sin(cnt * 0.21) * 0.06 + Math.sin(cnt * 0.53) * 0.05 + (Math.random() - 0.5) * 0.05;
      KM.light.intensity = (K.st === 'stun' ? 0.5 : 1.5) * fl; KM.glowM.color.setRGB(1, 0.75 * fl, 0.42 * fl);
      sample(K.lv, x, y + 1.4, z, tmp3); KM.mat.userData.probe.value.setRGB(tmp3[0] + 0.05, tmp3[1] + 0.04, tmp3[2] + 0.03); KM.faceM.userData.probe.value.copy(KM.mat.userData.probe.value);
    }
    function cameraFrame(a, dt) {
      H.M.ceil.visible = !DBG.noCeil; roofM.visible = !DBG.noCeil;
      if (DBG.cam) { const c = DBG.cam; cam.position.set(c[0], c[1], c[2]); cam.rotation.set(c[4], c[3], 0); if (c[6] && cam.fov !== c[6]) { cam.fov = c[6]; cam.updateProjectionMatrix(); } return c[5]; }
      if (!R || mode === 'title' || mode === 'diff' || ((mode === 'help' || mode === 'opts') && !R)) {
        titleT += dt; const t = titleT * 0.06; H.bakeU.value = 1.55 * SV.opt.bright; fog.density = 0.07;
        cam.position.set(11.2 + Math.sin(t) * 0.5, 1.5 + Math.sin(t * 1.7) * 0.05, 8.3 + Math.cos(t * 0.8) * 0.3); cam.rotation.set(-0.05, Math.PI + Math.sin(t * 0.9) * 0.12, 0);
        K.ox = K.x = 11.6; K.oz = K.z = 12.9; K.oy = K.y = 0; K.lv = 1; K.yaw = Math.PI; K.st = 'look'; K.head = Math.sin(titleT * 0.5) * 0.3; return 1;
      }
      if (cut && cut.k === 'wake') { const k = sstep(0.6, cut.d, cut.t); cam.position.set(lerp(6.75, P.x, k), lerp(3.62, P.y + EYE, k), lerp(4.5, P.z, k)); cam.rotation.set(lerp(1.25, P.pitch, k), P.yaw, lerp(0.5, 0, k)); return 2; }
      if (cut && cut.k === 'catch') { const ex = lerp(P.ox, P.x, a), ez = lerp(P.oz, P.z, a), ey = P.y + lerp(EYE, CREYE, P.cr); KM.head.getWorldPosition(kp); kp.y += 0.1; const dx = kp.x - ex, dz = kp.z - ez, dy = kp.y - ey, k = Math.min(1, cut.t / 0.45); const ty = Math.atan2(-dx, -dz), tp = Math.atan2(dy, Math.hypot(dx, dz)); cam.position.set(ex, ey - Math.min(0.5, cut.t * 0.3), ez); cam.rotation.set(lerp(P.pitch, tp, k), P.yaw + angDiff(P.yaw, ty) * k, Math.sin(cut.t * 9) * 0.02 * (1 - k * 0.5)); return P.lv; }
      if (cut && cut.k === 'door') { const k = sstep(0.4, 3.0, cut.t); cam.position.set(lerp(cut.x, 11.5, k), 1.6 + Math.sin(cut.t * 9) * 0.03 * k, lerp(cut.z, 17.5, k)); cam.rotation.set(lerp(cut.pitch, 0.05, Math.min(1, cut.t)), cut.yaw + angDiff(cut.yaw, Math.PI) * Math.min(1, cut.t * 1.2), 0); return 1; }
      if (cut && cut.k === 'car') { CAR.updateMatrixWorld(true); kp.set(-0.4, 1.12, 0.3).applyMatrix4(CAR.matrixWorld); cam.position.copy(kp); cam.position.x += Math.sin(cut.t * 30) * 0.004 * (cut.t > 1.3 ? 1 : 0); cam.rotation.set(-0.04, 0, 0); return 1; }
      if (cut && cut.k === 'bad') return P.lv;
      if (P.hide) { const hs = P.hide; const dx = hs.look.x - hs.cam.x, dz = hs.look.z - hs.cam.z, by = Math.atan2(-dx, -dz); cam.position.copy(hs.cam); cam.rotation.set(P.lookP, by + P.look, 0); return hs.lv; }
      const x = lerp(P.ox, P.x, a), z = lerp(P.oz, P.z, a), y = lerp(P.oy, P.y, a);
      const amp = SV.opt.bob && !RM ? (P.run ? 1.3 : P.cr > 0.5 ? 0.5 : 1) : 0, bob = P.moving ? -Math.abs(Math.sin(P.bob)) * 0.045 * amp : 0;
      const tr = P.trap ? Math.sin(cnt * 0.6) * 0.004 : 0;
      cam.position.set(x, y + lerp(EYE, CREYE, P.cr) + bob - (P.trap ? 0.25 : 0), z); cam.rotation.set(P.pitch + tr, P.yaw, P.moving ? Math.sin(P.bob) * 0.006 * amp : 0);
      return P.lv;
    }
    const vOff = { hammer: [0.24, -0.22, -0.45, 0.3, -1.3, 0.2], cutters: [0.22, -0.24, -0.5, 0.2, -1.4, 0.1], battery: [0.2, -0.34, -0.5, 0, 0.3, 0], fuel: [0.24, -0.38, -0.5, 0, 0.4, 0], camera: [0.2, -0.2, -0.42, 0, 0, 0], bottle: [0.2, -0.32, -0.42, 0, 0, 0.1] };
    function render(dt, a) {
      const clv = cameraFrame(a, dt);
      for (let lv = 0; lv < 3; lv++) LG[lv].visible = Math.abs(lv - clv) <= 1;
      poseKeeper(a, dt);
      renderer.clear(); renderer.render(scene, cam);
      const it = P.held;
      if (it && R && !cut && (mode === 'play' || mode === 'code' || mode === 'pause') && !P.hide) {
        for (const k in vItems) vItems[k].visible = k === it.k;
        const m = vItems[it.k], o = vOff[it.k] || [0.2, -0.2, -0.38, -0.2, -0.4, 0.4], sw = P.moving ? Math.sin(P.bob) * 0.012 : 0;
        vg.position.copy(cam.position); vg.quaternion.copy(cam.quaternion);
        m.position.set(o[0] + sw, o[1] + Math.abs(sw) * 0.6, o[2]); m.rotation.set(o[3], o[4], o[5]);
        sample(P.lv, P.x, P.y + 1.2, P.z, tmp3); const kd = K.on ? Math.max(0, 1 - Math.hypot(K.x - P.x, K.z - P.z) / 6) * (K.lv === P.lv ? 1 : 0) : 0;
        m.material.userData.probe.value.setRGB(tmp3[0] * 1.2 + 0.05 + kd * 0.5, tmp3[1] * 1.2 + 0.05 + kd * 0.35, tmp3[2] * 1.2 + 0.06 + kd * 0.2);
        renderer.clearDepth(); renderer.render(vscene, cam);
      }
    }
    function hudFrame(dt) {
      if (!R || mode === 'title' || mode === 'end') return;
      updFocus();
      const it = P.held;
      const hk = it ? it.k : null;
      const htxt = it ? `<b>${esc(iname(it.k))}</b>${it.k === 'camera' ? `<span>${esc(T('Flashes: {n}', { n: R.flashes }))}</span>` : ''}<small>${esc(touchOn ? '' : it.k === 'camera' ? T('E or click to flash · G drop · R throw') : T('G drop · R or right click throw'))}</small>` : '';
      if (heldEl._t !== htxt) { heldEl._t = htxt; heldEl.innerHTML = htxt; heldEl.classList.toggle('on', !!it); }
      void hk;
      stamEl.classList.toggle('on', P.stam < 0.98); stamEl.firstChild.style.width = (P.stam * 100).toFixed(1) + '%'; stamEl.classList.toggle('tired', P.tired);
      noiseHud = Math.max(0, noiseHud - dt * 0.8); noiseEl.style.setProperty('--n', noiseHud.toFixed(3)); noiseEl.classList.toggle('on', noiseHud > 0.02);
      let danger = 0, chase = 0;
      if (K.on && K.st !== 'off' && K.st !== 'wait') { const d = Math.hypot(K.x - P.x, K.z - P.z) + Math.abs(K.lv - P.lv) * 5; danger = clamp(1 - (d - 2) / 12, 0, 1); if (K.st === 'chase') { danger = Math.max(danger, 0.85); chase = 1; } if (K.st === 'stun') danger *= 0.4; }
      if (cut && cut.k !== 'catch') { danger *= 0.3; chase = 0; }
      vig.style.opacity = (0.35 + danger * 0.5).toFixed(3); vig.classList.toggle('red', chase > 0);
      audio.tension(mode === 'pause' ? 0 : danger, mode === 'pause' ? 0 : chase, dt);
      if (msgT > 0) { msgT -= dt; if (msgT <= 0) msgEl.classList.remove('on'); }
      barEl.classList.toggle('on', !!P.trap); if (P.trap) barEl.firstChild.style.width = (P.trapK * 100).toFixed(1) + '%';
      if (flashT > 0) { flashT -= dt; flashEl.style.opacity = Math.max(0, flashT / 0.4).toFixed(3); } else flashEl.style.opacity = 0;
      hintEl.textContent = !touchOn && mode === 'play' && !lockedPtr && !freeLook && !cut ? T('Click to look around') : '';
      touch.classList.toggle('playing', mode === 'play' && !cut);
      TB.throw.classList.toggle('dim', !it); TB.drop.classList.toggle('dim', !it); TB.crouch.classList.toggle('on2', P.crTog);
      if (journalOpen && (cnt & 31) === 0) journal(true);
    }
    api.loop((dt) => {
      cnt++;
      audio.tick(); pollPad(dt);
      if (R && !paused && mode !== 'end') { acc += dt; let n = 0; while (acc >= STEP && n < 6) { step(STEP); acc -= STEP; n++; } if (n >= 6) acc = 0; }
      const a = clamp(acc / STEP, 0, 1);
      lightT -= dt; if (lightT <= 0) { lightT = 25 + Math.random() * 35; lightK = 0.5; audio.play('thunder'); } if (lightK > 0) { lightK -= dt; ambL.intensity = (lightK > 0.42 || (lightK > 0.22 && lightK < 0.3)) ? 0.55 : 0; } else ambL.intensity = 0;
      tvT -= dt; if (tvT <= 0) { tvT = 0.07; const near = !R || (P.lv === 1 && Math.hypot(P.x - 19.3, P.z - 13.3) < 9); if (near) { paintStatic(tvTex.g, 64, 48); tvTex.t.needsUpdate = true; } }
      if (R && mode === 'play' && P.lv === 1) { tickT -= dt; if (tickT <= 0) { tickT = 1; if (Math.hypot(P.x - 14.24, P.z - 5.5) < 9) audio.at('tick', 14.4, 1.85, 5.5, occ(1, 14.4, 5.5)); } }
      render(dt, a);
      cam.getWorldDirection(fwd); audio.listener(cam.position.x, cam.position.y, cam.position.z, fwd.x, fwd.y, fwd.z);
      hudFrame(dt);
    });
    api.on(window, 'resize', () => { journal(journalOpen); });
    root.__qh = { DBG, scene, cam, THREE, pick(nx, ny) { const rc = new THREE.Raycaster(); rc.setFromCamera({ x: nx || 0, y: ny || 0 }, cam); const hits = rc.intersectObjects(scene.children, true).filter(h => h.object.visible && h.object.parent && h.object.parent.visible !== false); return hits.slice(0, 4).map(h => { const m = h.object.material; let key = null; for (const k in H.M) if (H.M[k] === m) key = k; return [key || (m.type), +h.distance.toFixed(2), h.point.x.toFixed(2), h.point.y.toFixed(2), h.point.z.toFixed(2), h.face ? [h.face.normal.x, h.face.normal.y, h.face.normal.z].map(v => v.toFixed(2)).join(',') : '']; }); }, aim(x, y, z) { const ey = P.y + lerp(EYE, CREYE, P.cr), dx = x - P.x, dz = z - P.z; P.yaw = Math.atan2(-dx, -dz); P.pitch = Math.atan2(y - ey, Math.hypot(dx, dz)); }, get R() { return R; }, P, K, get mode() { return mode; }, get focus() { return focus && focus.kind; }, NAV, H, DOORS, ITEMLIST, start: (d, from) => start(d, from || null), tp(x, z, lv) { P.x = P.ox = x; P.z = P.oz = z; P.lv = lv; P.y = P.oy = groundY(lv, x, z); }, give(k) { const it = ITEMLIST.find(i => i.k === k && i.st !== 'h'); if (!it) return false; freeItem(it); if (P.held) releaseHeld(true); it.st = 'h'; P.held = it; syncItem(it); return true; }, use, drop: dropHeld, throwIt: throwHeld, noise: (l) => noise(P.x, P.y, P.z, P.lv, l, true), snapshot, staticTris: () => staticTris, keeperTo(x, z, lv) { K.x = K.ox = x; K.z = K.oz = z; K.lv = lv; K.y = K.oy = groundY(lv, x, z); K.path = null; K.st = 'patrol'; }, pause: openPause, resume, escape, setDay(n) { R.day = n; }, quality: () => PRQ.lvl };
    showTitle();
    return () => { persist(); unlockPtr(); audio.close(); for (const o of bin) { try { o.dispose(); } catch (e) {} } bin.length = 0; delete root.__qh; };
  }

  const CSS = `
.gm-${ID} [hidden]{display:none!important}
.gm-${ID} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:#050506;container-type:inline-size;touch-action:none;user-select:none;-webkit-user-select:none;box-shadow:0 22px 50px -28px rgba(0,0,0,.9);font-family:var(--sans)}
.gm-${ID} .stage>.g-canvas{display:block;width:100%;height:100%!important;aspect-ratio:auto!important;border-radius:0;background:#050506;cursor:crosshair}
.gm-${ID} .ui{position:absolute;inset:0;pointer-events:none;color:#ece4d2}
.gm-${ID} .hud{position:absolute;inset:0}
.gm-${ID} .day{position:absolute;left:2.2%;top:3%;display:flex;align-items:center;gap:.35em;font:700 clamp(11px,1.9cqw,17px)/1 Georgia,'Times New Roman',serif;letter-spacing:.06em;text-shadow:0 2px 8px #000}
.gm-${ID} .day b{margin-right:.4em;font-weight:700}
.gm-${ID} .day i{width:.62em;height:.62em;border-radius:50%;border:1.5px solid rgba(236,228,210,.65)}
.gm-${ID} .day i.x{background:rgba(160,60,50,.85);border-color:rgba(200,90,80,.9)}
.gm-${ID} .day i.c{background:#ece4d2}
.gm-${ID} .xh{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:rgba(236,228,210,.55);box-shadow:0 0 0 1px rgba(0,0,0,.4);transition:transform .12s,background .12s}
.gm-${ID} .xh.on{transform:scale(1.9);background:rgba(255,236,200,.95)}
.gm-${ID} .lab{position:absolute;left:50%;top:calc(50% + clamp(16px,3.2cqw,30px));transform:translateX(-50%);max-width:80%;padding:.38em .8em;border-radius:.5em;background:rgba(8,6,6,.6);font:600 clamp(11px,1.75cqw,16px)/1.25 var(--sans);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transition:opacity .12s}
.gm-${ID} .lab:not(:empty){opacity:1}
.gm-${ID} .lab.bad{color:#cdb8a6;background:rgba(30,10,8,.6)}
.gm-${ID} .held{position:absolute;right:2.2%;bottom:3.5%;text-align:right;opacity:0;transition:opacity .2s;text-shadow:0 2px 8px #000}
.gm-${ID} .held.on{opacity:1}
.gm-${ID} .held b{display:block;font:700 clamp(12px,2cqw,18px)/1.2 Georgia,'Times New Roman',serif}
.gm-${ID} .held span{display:block;font:600 clamp(10px,1.5cqw,14px)/1.3 var(--sans);color:#f2d08a}
.gm-${ID} .held small{display:block;font:500 clamp(9px,1.3cqw,12px)/1.3 var(--sans);opacity:.7}
.gm-${ID} .stam{position:absolute;left:50%;bottom:4%;width:18%;height:4px;margin-left:-9%;border-radius:3px;background:rgba(255,255,255,.12);opacity:0;transition:opacity .4s}
.gm-${ID} .stam.on{opacity:1}
.gm-${ID} .stam i{display:block;height:100%;border-radius:3px;background:rgba(236,228,210,.75)}
.gm-${ID} .stam.tired i{background:#c0584a}
.gm-${ID} .noise{position:absolute;left:2.2%;bottom:3.5%;width:clamp(26px,4.2cqw,40px);height:clamp(26px,4.2cqw,40px);opacity:.25;transition:opacity .25s}
.gm-${ID} .noise.on{opacity:1}
.gm-${ID} .noise svg{width:100%;height:100%;fill:none;stroke:#ece4d2;stroke-width:1.8;stroke-linecap:round}
.gm-${ID} .noise b{position:absolute;inset:-30%;border-radius:50%;border:2px solid rgba(240,190,120,calc(var(--n,0)*.9));transform:scale(calc(.6 + var(--n,0)*.8))}
.gm-${ID} .msg{position:absolute;left:50%;top:22%;transform:translateX(-50%);max-width:86%;padding:.5em 1em;border-radius:.6em;background:rgba(8,6,6,.55);font:600 clamp(12px,1.9cqw,17px)/1.35 var(--sans);text-align:center;opacity:0;transition:opacity .35s}
.gm-${ID} .msg.on{opacity:1}
.gm-${ID} .hint{position:absolute;left:50%;top:60%;transform:translateX(-50%);font:600 clamp(11px,1.6cqw,15px)/1 var(--sans);opacity:.85;text-shadow:0 2px 8px #000}
.gm-${ID} .hold{position:absolute;left:50%;top:calc(50% + clamp(44px,7cqw,70px));width:22%;height:6px;margin-left:-11%;border-radius:4px;background:rgba(255,255,255,.15);opacity:0}
.gm-${ID} .hold.on{opacity:1}
.gm-${ID} .hold i{display:block;height:100%;border-radius:4px;background:#f2d08a}
.gm-${ID} .vig{position:absolute;inset:0;background:radial-gradient(ellipse 72% 70% at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.92) 100%);opacity:.4;transition:opacity .5s}
.gm-${ID} .vig.red{background:radial-gradient(ellipse 70% 68% at 50% 50%,rgba(0,0,0,0) 40%,rgba(70,6,6,.9) 100%)}
.gm-${ID} .grain{position:absolute;inset:-50%;opacity:.07;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");animation:gm-${ID}-gr .5s steps(4) infinite}
@keyframes gm-${ID}-gr{0%{transform:translate(0,0)}25%{transform:translate(-8%,5%)}50%{transform:translate(6%,-7%)}75%{transform:translate(-4%,-3%)}}
@media (prefers-reduced-motion:reduce){.gm-${ID} .grain{animation:none}}
.gm-${ID} .flash{position:absolute;inset:0;background:#fffaf0;opacity:0}
.gm-${ID} .fade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity 1.1s ease;display:grid;place-items:center}
.gm-${ID} .fade.on{opacity:1}
.gm-${ID} .card{text-align:center;opacity:0;transition:opacity .8s .2s}
.gm-${ID} .fade.card .card{opacity:1}
.gm-${ID} .card b{display:block;font:700 clamp(26px,6cqw,58px)/1.1 Georgia,'Times New Roman',serif;letter-spacing:.04em}
.gm-${ID} .card span{display:block;margin-top:.6em;font:500 clamp(12px,2cqw,18px)/1.3 var(--sans);opacity:.75;letter-spacing:.12em;text-transform:uppercase}
.gm-${ID} .panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7em;padding:4% 6%;background:radial-gradient(ellipse at 50% 40%,rgba(10,8,10,.55),rgba(4,3,4,.9));pointer-events:auto;text-align:center;overflow:auto}
.gm-${ID} .panel.title{background:linear-gradient(180deg,rgba(4,3,4,.25),rgba(4,3,4,.82) 70%)}
.gm-${ID} .panel h1{margin:0;font:700 clamp(30px,8cqw,78px)/1 Georgia,'Times New Roman',serif;letter-spacing:.03em;color:#efe6d0;text-shadow:0 0 30px rgba(255,190,120,.18),0 4px 18px #000}
.gm-${ID} .panel .tt p{margin:.6em 0 1em;font:500 clamp(12px,2cqw,18px)/1.3 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:#bfb29a}
.gm-${ID} .panel h2{margin:0 0 .2em;font:700 clamp(20px,4.2cqw,38px)/1.1 Georgia,'Times New Roman',serif;color:#efe6d0}
.gm-${ID} .panel .kick{margin:0;font:700 clamp(11px,1.7cqw,15px)/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:#f2d08a}
.gm-${ID} .panel .lead{max-width:40em;margin:0 0 .4em;font:500 clamp(11px,1.7cqw,15px)/1.45 var(--sans);color:#d8cdb6}
.gm-${ID} .panel .st{margin:.4em 0 0;font:500 clamp(10px,1.5cqw,13px)/1.4 var(--sans);color:#a89c86}
.gm-${ID} .panel .st b{color:#efe6d0}
.gm-${ID} .panel .warn{margin:0;font:600 clamp(10px,1.5cqw,13px)/1.4 var(--sans);color:#e0a080}
.gm-${ID} .panel .rec{margin:0;font:700 clamp(12px,2cqw,17px)/1 var(--sans);color:#f2d08a}
.gm-${ID} .bs{display:flex;flex-direction:column;gap:.5em;align-items:stretch;min-width:min(20em,80%)}
.gm-${ID} .bs.row{flex-direction:row;flex-wrap:wrap;justify-content:center;min-width:0}
.gm-${ID} .b{padding:.7em 1.4em;border:1px solid rgba(236,228,210,.28);border-radius:.55em;background:rgba(20,16,16,.72);color:#efe6d0;font:600 clamp(12px,1.9cqw,16px)/1.2 var(--sans);cursor:pointer;transition:background .15s,border-color .15s,transform .1s}
.gm-${ID} .b:hover,.gm-${ID} .b:focus-visible{background:rgba(60,44,36,.85);border-color:rgba(242,208,138,.7);outline:none}
.gm-${ID} .b:active{transform:scale(.98)}
.gm-${ID} .b.pri{background:rgba(120,70,40,.75);border-color:rgba(242,208,138,.65)}
.gm-${ID} .dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(13em,100%),1fr));gap:.55em;width:min(52em,100%)}
.gm-${ID} .dc{display:flex;flex-direction:column;gap:.3em;text-align:left;padding:.8em 1em}
.gm-${ID} .dc b{font:700 clamp(13px,2cqw,18px)/1.1 Georgia,'Times New Roman',serif}
.gm-${ID} .dc span{font:500 clamp(10px,1.45cqw,13px)/1.35 var(--sans);color:#cdbfa6}
.gm-${ID} .dc em{font:600 clamp(9px,1.3cqw,12px)/1 var(--sans);font-style:normal;color:#a89c86}
.gm-${ID} .kt{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(15em,100%),1fr));gap:.35em 1.2em;width:min(44em,100%);text-align:left}
.gm-${ID} .kt div{display:flex;gap:.6em;align-items:baseline;font:500 clamp(10px,1.5cqw,14px)/1.3 var(--sans)}
.gm-${ID} .kt kbd{flex:none;min-width:7.5em;padding:.15em .45em;border-radius:.35em;background:rgba(236,228,210,.12);font:700 .92em/1.3 var(--sans);color:#f2d08a;text-align:center}
.gm-${ID} .tips{width:min(44em,100%);margin:.4em 0;padding-left:1.2em;text-align:left;font:500 clamp(10px,1.5cqw,14px)/1.45 var(--sans);color:#cdbfa6}
.gm-${ID} .rows{display:grid;gap:.3em;min-width:min(20em,80%);margin:.4em 0}
.gm-${ID} .rows div{display:flex;justify-content:space-between;gap:2em;padding:.35em .2em;border-bottom:1px solid rgba(236,228,210,.12);font:500 clamp(11px,1.7cqw,15px)/1.2 var(--sans)}
.gm-${ID} .rows b{color:#efe6d0}
.gm-${ID} .sl{display:flex;align-items:center;gap:.8em;width:min(26em,90%);font:600 clamp(11px,1.7cqw,15px)/1 var(--sans)}
.gm-${ID} .sl input{flex:1;accent-color:#c89050}
.gm-${ID} .sl b{min-width:3em;text-align:right}
.gm-${ID} .code,.gm-${ID} .journal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:1.2em 1.6em;border-radius:.8em;background:rgba(14,11,10,.9);border:1px solid rgba(236,228,210,.2);pointer-events:auto;text-align:center;max-width:92%;max-height:92%;overflow:auto}
.gm-${ID} .code.shake{animation:gm-${ID}-sh .35s}
@keyframes gm-${ID}-sh{25%{transform:translate(calc(-50% - 8px),-50%)}75%{transform:translate(calc(-50% + 8px),-50%)}}
.gm-${ID} .code h3,.gm-${ID} .journal h3{margin:0 0 .6em;font:700 clamp(15px,2.6cqw,24px)/1 Georgia,'Times New Roman',serif}
.gm-${ID} .wh{display:flex;gap:.6em;justify-content:center;margin-bottom:.8em}
.gm-${ID} .wh .w{display:flex;flex-direction:column;align-items:center;gap:.2em;padding:.3em;border-radius:.5em;border:1px solid transparent}
.gm-${ID} .wh .w.on{border-color:rgba(242,208,138,.7);background:rgba(242,208,138,.08)}
.gm-${ID} .wh button{width:2.4em;height:2em;border:0;border-radius:.4em;background:rgba(236,228,210,.12);color:#efe6d0;font-size:clamp(11px,1.8cqw,16px);cursor:pointer}
.gm-${ID} .wh b{font:700 clamp(24px,5cqw,44px)/1.1 Georgia,'Times New Roman',serif;font-variant-numeric:tabular-nums;color:#f2e6c8}
.gm-${ID} .journal{text-align:left;pointer-events:none;background:rgba(14,11,10,.86)}
.gm-${ID} .journal small{font:500 .6em/1 var(--sans);opacity:.7;margin-left:.6em}
.gm-${ID} .journal .cols{display:grid;grid-template-columns:1fr 1fr;gap:1.4em}
.gm-${ID} .journal h4{margin:.4em 0 .3em;font:700 clamp(11px,1.7cqw,15px)/1 var(--sans);color:#f2d08a;letter-spacing:.08em;text-transform:uppercase}
.gm-${ID} .journal ul{margin:0;padding:0;list-style:none;font:500 clamp(10px,1.55cqw,14px)/1.55 var(--sans)}
.gm-${ID} .journal li:before{content:'';display:inline-block;width:.65em;height:.65em;margin-right:.5em;border:1.5px solid rgba(236,228,210,.5);border-radius:2px;vertical-align:-.05em}
.gm-${ID} .journal li.ok{color:#9a907c;text-decoration:line-through}
.gm-${ID} .journal li.ok:before{background:#8aa060;border-color:#8aa060}
.gm-${ID} .code4{display:flex;gap:.8em}
.gm-${ID} .code4 span{display:flex;flex-direction:column;align-items:center;min-width:2.6em;padding:.3em;border-radius:.4em;background:rgba(236,228,210,.07);font:600 clamp(10px,1.4cqw,13px)/1.2 var(--sans);opacity:.6}
.gm-${ID} .code4 span.ok{opacity:1}
.gm-${ID} .code4 b{font:700 clamp(16px,3cqw,26px)/1.1 Georgia,serif}
.gm-${ID} .touch{position:absolute;inset:0;pointer-events:none;display:none}
.gm-${ID} .stage.touchon .touch{display:block}
.gm-${ID} .stage.touchon .touch.playing{pointer-events:auto}
.gm-${ID} .touch:not(.playing) .tb,.gm-${ID} .touch:not(.playing) .joy{display:none}
.gm-${ID} .joy{position:absolute;width:clamp(90px,16cqw,140px);height:clamp(90px,16cqw,140px);margin:calc(clamp(90px,16cqw,140px)/-2) 0 0 calc(clamp(90px,16cqw,140px)/-2);border-radius:50%;background:rgba(236,228,210,.08);border:2px solid rgba(236,228,210,.25);opacity:0;left:16%;top:72%}
.gm-${ID} .joy.on{opacity:1}
.gm-${ID} .joy i{position:absolute;left:50%;top:50%;width:42%;height:42%;margin:-21% 0 0 -21%;border-radius:50%;background:rgba(236,228,210,.4)}
.gm-${ID} .tb{position:absolute;display:grid;place-items:center;border:1.5px solid rgba(236,228,210,.35);border-radius:50%;background:rgba(14,11,10,.45);color:#efe6d0;font:700 clamp(10px,2.2cqw,14px)/1 var(--sans);touch-action:none;pointer-events:auto;width:clamp(48px,10cqw,72px);height:clamp(48px,10cqw,72px);padding:0}
.gm-${ID} .tb.on{background:rgba(242,208,138,.35)}
.gm-${ID} .tb.on2{background:rgba(242,208,138,.25);border-color:#f2d08a}
.gm-${ID} .tb.dim{opacity:.35}
.gm-${ID} .tb-use{right:6%;bottom:22%;width:clamp(64px,14cqw,96px);height:clamp(64px,14cqw,96px);font-size:clamp(12px,2.6cqw,17px)}
.gm-${ID} .tb-crouch{right:23%;bottom:7%}
.gm-${ID} .tb-run{right:6%;bottom:5%}
.gm-${ID} .tb-throw{right:24%;bottom:30%}
.gm-${ID} .tb-drop{right:36%;bottom:12%}
.gm-${ID} .tb-notes{right:3%;top:4%;border-radius:.6em;width:auto;height:auto;padding:.5em .8em}
.gm-${ID} .tb-pause{right:3%;top:calc(4% + clamp(34px,7cqw,48px));border-radius:.6em;width:auto;height:auto;padding:.5em .9em}
.gm-${ID} .stage.touchon .held{bottom:auto;top:13%}
.gm-${ID} .stage.touchon .noise{bottom:auto;top:9%}
@container (max-width:520px){.gm-${ID} .journal .cols{grid-template-columns:1fr;gap:.4em}.gm-${ID} .panel{gap:.5em}}
`;
  const NO_GL = { kicker: '3D', title: '3D unavailable', text: 'Your browser could not start WebGL. Try another browser or turn on hardware acceleration.', button: null };
  Ameplay.register({
    id: ID, title: 'The Quiet House', category: '3D', tint: '#3b2a33',
    blurb: 'Escape a silent old house within five days while the Keeper listens for every sound.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · mouse look · <kbd>Shift</kbd> run · <kbd>C</kbd> crouch · <kbd>E</kbd> or click use, take, hide · <kbd>G</kbd> drop · <kbd>R</kbd> or right click throw · <kbd>Tab</kbd> notes · <kbd>Esc</kbd> pause · touch: stick, drag to look, buttons',
    better: 'low', width: 960, ownPause: true,
    format: v => { const s = Math.max(0, Math.round(v)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 30L32 12l22 18"/><path d="M16 26v26h32V26"/><path d="M28 52V40h8v12"/><circle cx="24" cy="33" r="2.5"/><circle cx="40" cy="33" r="2.5"/></svg>',
    css: CSS,
    mount(root, api) {
      const wrap = el('div', 'stage', root);
      let cleanup = null;
      const narrow = root.clientWidth && root.clientWidth < 560;
      api.gl(narrow ? 600 : 960, narrow ? 900 : 600).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v); }, () => { if (api.alive) api.overlay(NO_GL); });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
})();
