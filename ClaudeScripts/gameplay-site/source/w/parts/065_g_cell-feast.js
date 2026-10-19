
(() => {
  'use strict';

  const CFG = {
    tickHz: 25,
    world: 7000,
    gridStep: 50,
    foodMax: 1500, foodSpawn: 40, spawnEvery: 12, foodMass: 1,
    virusMin: 22, virusMax: 40, virusMass: 100, virusMaxSize: 140, virusShoot: 780,
    startMass: 10, minSize: 32, maxMass: 22500,
    minSplitSize: 60, minEjectSize: 60, maxCells: 16, popMin: 36,
    splitBoost: 780, boostMax: 78, boostDiv: 10,
    ejectSize: 38, ejectLoss: 43, ejectBoost: 780, ejectCooldown: 3, ejectSpread: 0.3, ejectMaxCount: 400,
    eatRatio: 1.15, eatOverlap: 1 / 3,
    noCollideTicks: 15,
    mergeBase: 30, mergePerMass: 0.0233,
    decayRate: 0.002,
    speedK: 2.1106, speedExp: 0.449, tickMs: 40,
    zoomRef: 64, zoomExp: 0.4,
    boardEvery: 12,
    bots: [20, 25, 30], aggro: [0.25, 0.4, 0.6], think: [8, 6, 4], splitReach: 640, splitWorth: 0.08,
    leaveMass: 5000, leaveEvery: 30, leaveChance: 0.3
  };

  const NAMES = ['Blobby', 'Nom Nom', 'Mochi', 'Sir Swallow', 'Gloop', 'Pebble', 'Tofu', 'Bubbles', 'Zippy', 'Kiwi', 'Nugget', 'Big Bertha', 'Pudding', 'Noodle', 'Comet', 'Waffle', 'Pixel', 'Turbo', 'Sprout', 'Jelly', 'Dumpling', 'Gizmo', 'Biscuit', 'Pickle', 'Yeti', 'Mango', 'Orbit', 'Taco', 'Wobble', 'Cosmo', 'Doodle', 'Snacky'];
  const SW_HUE = [0, 22, 48, 90, 140, 178, 205, 235, 272, 318];
  const UNNAMED = 'An unnamed cell';
  const SKINS = (() => {
    const circ = (g, x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
    const hb = (g, n, cols) => cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * n / cols.length, n, n / cols.length + 1); });
    const vb = (g, n, cols) => cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * n / cols.length, 0, n / cols.length + 1, n); });
    const blobs = (g, n, col, k, seed, rmin, rmax) => { let s = seed; const rr = () => (s = (s * 16807) % 2147483647) / 2147483647; g.fillStyle = col; for (let i = 0; i < k; i++) { const x = rr() * n, y = rr() * n, r = n * (rmin + rr() * (rmax - rmin)); g.beginPath(); for (let a = 0; a < 12; a++) { const q = r * (0.7 + rr() * 0.5), an = a / 12 * TAU; g.lineTo(x + Math.cos(an) * q, y + Math.sin(an) * q); } g.closePath(); g.fill(); } };
    const shine = (g, n) => { const gr = g.createRadialGradient(n * 0.35, n * 0.3, n * 0.05, n * 0.5, n * 0.5, n * 0.55); gr.addColorStop(0, 'rgba(255,255,255,.25)'); gr.addColorStop(0.6, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = gr; g.fillRect(0, 0, n, n); };
    const star = (g, x, y, r, c) => { g.fillStyle = c; g.beginPath(); for (let k = 0; k < 10; k++) { const q = k & 1 ? r * 0.42 : r, a = k / 10 * TAU - Math.PI / 2; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); };
    return [
      ['earth', 'Earth', (g, n) => { g.fillStyle = '#1f6fd1'; g.fillRect(0, 0, n, n); blobs(g, n, '#3fa34d', 9, 7, 0.08, 0.2); blobs(g, n, '#e9d39a', 4, 33, 0.03, 0.07); blobs(g, n, 'rgba(255,255,255,.75)', 7, 91, 0.03, 0.08); shine(g, n); }],
      ['moon', 'Moon', (g, n) => { g.fillStyle = '#c9c9c9'; g.fillRect(0, 0, n, n); let s = 5; const rr = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 16; i++) { const x = rr() * n, y = rr() * n, r = n * (0.03 + rr() * 0.08); circ(g, x, y, r, '#a9a9a9'); circ(g, x - r * 0.15, y - r * 0.15, r * 0.75, '#b8b8b8'); } shine(g, n); }],
      ['mars', 'Mars', (g, n) => { g.fillStyle = '#c1440e'; g.fillRect(0, 0, n, n); blobs(g, n, '#8e2f0b', 8, 11, 0.06, 0.16); blobs(g, n, '#e07a3f', 6, 23, 0.04, 0.1); circ(g, n * 0.5, n * 0.04, n * 0.18, '#f4efe9'); shine(g, n); }],
      ['sun', 'Sun', (g, n) => { const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n * 0.5); gr.addColorStop(0, '#fff6a8'); gr.addColorStop(0.5, '#ffc61a'); gr.addColorStop(1, '#ff7b00'); g.fillStyle = gr; g.fillRect(0, 0, n, n); blobs(g, n, 'rgba(255,140,0,.35)', 10, 3, 0.04, 0.09); }],
      ['jupiter', 'Jupiter', (g, n) => { hb(g, n, ['#c99e72', '#e8d3b0', '#a8774f', '#f1e2c6', '#b8875c', '#e3c9a1', '#9e6c45', '#e8d3b0']); g.fillStyle = '#c4583a'; g.beginPath(); g.ellipse(n * 0.66, n * 0.62, n * 0.13, n * 0.07, 0, 0, TAU); g.fill(); shine(g, n); }],
      ['france', 'France', (g, n) => vb(g, n, ['#0055a4', '#ffffff', '#ef4135'])],
      ['italy', 'Italy', (g, n) => vb(g, n, ['#009246', '#ffffff', '#ce2b37'])],
      ['germany', 'Germany', (g, n) => hb(g, n, ['#000000', '#dd0000', '#ffce00'])],
      ['ukraine', 'Ukraine', (g, n) => hb(g, n, ['#0057b7', '#ffd700'])],
      ['poland', 'Poland', (g, n) => hb(g, n, ['#ffffff', '#dc143c'])],
      ['japan', 'Japan', (g, n) => { g.fillStyle = '#fff'; g.fillRect(0, 0, n, n); circ(g, n / 2, n / 2, n * 0.27, '#bc002d'); }],
      ['sweden', 'Sweden', (g, n) => { g.fillStyle = '#006aa7'; g.fillRect(0, 0, n, n); g.fillStyle = '#fecc00'; g.fillRect(n * 0.32, 0, n * 0.16, n); g.fillRect(0, n * 0.42, n, n * 0.16); }],
      ['brazil', 'Brazil', (g, n) => { g.fillStyle = '#009c3b'; g.fillRect(0, 0, n, n); g.fillStyle = '#ffdf00'; g.beginPath(); g.moveTo(n / 2, n * 0.12); g.lineTo(n * 0.92, n / 2); g.lineTo(n / 2, n * 0.88); g.lineTo(n * 0.08, n / 2); g.closePath(); g.fill(); circ(g, n / 2, n / 2, n * 0.2, '#002776'); g.strokeStyle = '#fff'; g.lineWidth = n * 0.03; g.beginPath(); g.arc(n * 0.5, n * 0.75, n * 0.32, -2.2, -0.95); g.stroke(); }],
      ['usa', 'USA', (g, n) => { for (let i = 0; i < 13; i++) { g.fillStyle = i & 1 ? '#fff' : '#b22234'; g.fillRect(0, i * n / 13, n, n / 13 + 1); } g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, n * 0.48, n * 0.54); for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) star(g, n * (0.05 + i * 0.075), n * (0.06 + j * 0.105), n * 0.025, '#fff'); }],
      ['canada', 'Canada', (g, n) => { vb(g, n, ['#d52b1e', '#ffffff', '#ffffff', '#d52b1e']); star(g, n / 2, n / 2, n * 0.17, '#d52b1e'); }],
      ['pizza', 'Pizza', (g, n) => { g.fillStyle = '#e8a33d'; g.fillRect(0, 0, n, n); circ(g, n / 2, n / 2, n * 0.44, '#f7d26a'); let s = 9; const rr = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 9; i++) { const a = rr() * TAU, d = rr() * n * 0.32; circ(g, n / 2 + Math.cos(a) * d, n / 2 + Math.sin(a) * d, n * 0.06, '#c0392b'); } g.strokeStyle = 'rgba(160,90,20,.5)'; g.lineWidth = n * 0.012; for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI; g.beginPath(); g.moveTo(n / 2 - Math.cos(a) * n / 2, n / 2 - Math.sin(a) * n / 2); g.lineTo(n / 2 + Math.cos(a) * n / 2, n / 2 + Math.sin(a) * n / 2); g.stroke(); } }],
      ['donut', 'Donut', (g, n) => { g.fillStyle = '#d99a4e'; g.fillRect(0, 0, n, n); circ(g, n / 2, n / 2, n * 0.43, '#ff7fb0'); circ(g, n / 2, n / 2, n * 0.14, '#d99a4e'); circ(g, n / 2, n / 2, n * 0.1, '#7a4a1e'); let s = 4; const rr = () => (s = (s * 16807) % 2147483647) / 2147483647; const SP = ['#fff', '#58c4ff', '#ffe14d', '#7ee07e']; for (let i = 0; i < 40; i++) { const a = rr() * TAU, d = n * (0.18 + rr() * 0.22), x = n / 2 + Math.cos(a) * d, y = n / 2 + Math.sin(a) * d; g.save(); g.translate(x, y); g.rotate(rr() * TAU); g.fillStyle = SP[i % 4]; g.fillRect(-n * 0.018, -n * 0.006, n * 0.036, n * 0.012); g.restore(); } }],
      ['watermelon', 'Watermelon', (g, n) => { g.fillStyle = '#2e8b3a'; g.fillRect(0, 0, n, n); circ(g, n / 2, n / 2, n * 0.44, '#b6e388'); circ(g, n / 2, n / 2, n * 0.4, '#f2475a'); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, d = n * (i & 1 ? 0.2 : 0.29); g.save(); g.translate(n / 2 + Math.cos(a) * d, n / 2 + Math.sin(a) * d); g.rotate(a); g.fillStyle = '#2a1a12'; g.beginPath(); g.ellipse(0, 0, n * 0.022, n * 0.012, 0, 0, TAU); g.fill(); g.restore(); } }],
      ['basketball', 'Hoops', (g, n) => { g.fillStyle = '#ee6c24'; g.fillRect(0, 0, n, n); g.strokeStyle = '#2b1408'; g.lineWidth = n * 0.025; g.beginPath(); g.moveTo(0, n / 2); g.lineTo(n, n / 2); g.moveTo(n / 2, 0); g.lineTo(n / 2, n); g.stroke(); g.beginPath(); g.arc(-n * 0.15, n / 2, n * 0.5, -1, 1); g.stroke(); g.beginPath(); g.arc(n * 1.15, n / 2, n * 0.5, Math.PI - 1, Math.PI + 1); g.stroke(); shine(g, n); }],
      ['soccer', 'Goal', (g, n) => { g.fillStyle = '#fff'; g.fillRect(0, 0, n, n); const pent = (x, y, r) => { g.fillStyle = '#1b1b1b'; g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU - Math.PI / 2; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); }; pent(n / 2, n / 2, n * 0.14); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU - Math.PI / 2; pent(n / 2 + Math.cos(a) * n * 0.38, n / 2 + Math.sin(a) * n * 0.38, n * 0.11); } shine(g, n); }],
      ['eye', 'Eye', (g, n) => { g.fillStyle = '#fbfbfb'; g.fillRect(0, 0, n, n); g.strokeStyle = 'rgba(220,40,40,.45)'; g.lineWidth = n * 0.008; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; g.beginPath(); g.moveTo(n / 2 + Math.cos(a) * n * 0.48, n / 2 + Math.sin(a) * n * 0.48); g.quadraticCurveTo(n / 2 + Math.cos(a + 0.2) * n * 0.38, n / 2 + Math.sin(a + 0.2) * n * 0.38, n / 2 + Math.cos(a) * n * 0.26, n / 2 + Math.sin(a) * n * 0.26); g.stroke(); } circ(g, n / 2, n / 2, n * 0.22, '#3a8fd8'); circ(g, n / 2, n / 2, n * 0.11, '#111'); circ(g, n * 0.45, n * 0.44, n * 0.035, '#fff'); }],
      ['smile', 'Smiley', (g, n) => { g.fillStyle = '#ffd43b'; g.fillRect(0, 0, n, n); circ(g, n * 0.35, n * 0.38, n * 0.06, '#3b2a10'); circ(g, n * 0.65, n * 0.38, n * 0.06, '#3b2a10'); g.strokeStyle = '#3b2a10'; g.lineWidth = n * 0.045; g.lineCap = 'round'; g.beginPath(); g.arc(n / 2, n * 0.5, n * 0.24, 0.35, Math.PI - 0.35); g.stroke(); }],
      ['panda', 'Panda', (g, n) => { g.fillStyle = '#fff'; g.fillRect(0, 0, n, n); circ(g, n * 0.18, n * 0.12, n * 0.16, '#111'); circ(g, n * 0.82, n * 0.12, n * 0.16, '#111'); g.fillStyle = '#111'; g.beginPath(); g.ellipse(n * 0.33, n * 0.45, n * 0.11, n * 0.14, 0.5, 0, TAU); g.ellipse(n * 0.67, n * 0.45, n * 0.11, n * 0.14, -0.5, 0, TAU); g.fill(); circ(g, n * 0.34, n * 0.44, n * 0.035, '#fff'); circ(g, n * 0.66, n * 0.44, n * 0.035, '#fff'); g.beginPath(); g.ellipse(n / 2, n * 0.63, n * 0.07, n * 0.05, 0, 0, TAU); g.fill(); }],
      ['ladybug', 'Ladybug', (g, n) => { g.fillStyle = '#e3242b'; g.fillRect(0, 0, n, n); g.fillStyle = '#111'; g.fillRect(n * 0.48, 0, n * 0.04, n); for (const [x, y, r] of [[0.3, 0.3, 0.09], [0.7, 0.3, 0.09], [0.25, 0.62, 0.08], [0.75, 0.62, 0.08], [0.38, 0.85, 0.06], [0.62, 0.85, 0.06]]) circ(g, n * x, n * y, n * r, '#111'); shine(g, n); }]
    ];
  })();
  const SKIN_BY = new Map(SKINS.map(s => [s[0], s]));

  const TAU = Math.PI * 2;

  const sz = m => 10 * Math.sqrt(m);
  const hsv = (h, s, v) => {
    const f = n => { const k = (n + h / 60) % 6; return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)))); };
    return [f(5), f(3), f(1)];
  };
  const rgb = a => `rgb(${a[0]},${a[1]},${a[2]})`;
  const shade = (a, k) => rgb(a.map(v => Math.round(v * k)));
  const esc = s => String(s).replace(/[&<>"']/g, ch => '&#' + ch.charCodeAt(0) + ';');
  const TRIG = [];
  const trig = n => {
    if (!TRIG[n]) {
      const c = new Float32Array(n), s = new Float32Array(n);
      for (let i = 0; i < n; i++) { c[i] = Math.cos(i / n * TAU); s[i] = Math.sin(i / n * TAU); }
      TRIG[n] = { c, s };
    }
    return TRIG[n];
  };
  const FOOD_COLS = Array.from({ length: 12 }, (_, i) => rgb(hsv(i * 30 + 8, 0.85, 1)));
  const SWATCH = SW_HUE.map(h => hsv(h, 0.9, 1));
  const THEME = {
    light: { out: '#dde6ec', bg: '#f2fbff', grid: '#000000' },
    dark: { out: '#000000', bg: '#111111', grid: '#aaaaaa' }
  };

  Ameplay.register({
    id: 'cell-feast',
    title: 'Cell Feast',
    category: 'Arcade',
    tint: '#3fb4ec',
    blurb: 'Eat pellets, swallow smaller cells, split and rule the leaderboard.',
    help: '<kbd>Mouse</kbd> steer · <kbd>Space</kbd> split · <kbd>W</kbd> eject mass · <kbd>P</kbd> pause · touch: drag to steer, Split / Eject buttons',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="30" r="16"/><circle cx="48" cy="44" r="7"/><circle cx="50" cy="16" r="3"/><circle cx="12" cy="54" r="3"/><circle cx="38" cy="58" r="2.5"/></svg>',
    css: `.gm-cell-feast{gap:0}
.gm-cell-feast .cf-wrap{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.07)}
.gm-cell-feast .cf-wrap .g-canvas{width:100%!important;border-radius:0;background:#f2fbff}
.gm-cell-feast .cf-ov{background:rgba(0,0,0,.32);-webkit-backdrop-filter:none;backdrop-filter:none;padding:10px;transition:none;overflow:auto}
.gm-cell-feast .cf-ov[hidden]{display:none}
.gm-cell-feast .cf-card{box-sizing:border-box;width:100%;max-width:340px;background:#fff;border-radius:12px;padding:16px 18px 12px;box-shadow:0 14px 40px rgba(0,0,0,.35);text-align:center;color:#333;font-family:var(--sans)}
.gm-cell-feast .cf-logo{margin:0 0 12px;font-size:40px;font-weight:900;line-height:1;letter-spacing:-.03em;color:#333}
.gm-cell-feast .cf-nick{box-sizing:border-box;width:100%;height:44px;padding:0 12px;border:1px solid #c8ccd2;border-radius:6px;font:700 17px var(--sans);color:#333;outline:0;text-align:center;background:#fff}
.gm-cell-feast .cf-nick:focus{border-color:#66afe9;box-shadow:0 0 0 3px rgba(102,175,233,.35)}
.gm-cell-feast .cf-sw{display:flex;flex-wrap:wrap;justify-content:center;margin:6px -6px 2px}
.gm-cell-feast .cf-sw button{width:40px;height:40px;padding:0;border:0;background:none;cursor:pointer;display:grid;place-items:center}
.gm-cell-feast .cf-sw i{display:block;width:24px;height:24px;border-radius:50%;background:var(--c);box-shadow:inset 0 0 0 3px rgba(0,0,0,.16);transition:transform .15s}
.gm-cell-feast .cf-sw .on i{transform:scale(1.2);box-shadow:inset 0 0 0 3px rgba(0,0,0,.16),0 0 0 2px #fff,0 0 0 4px #333}
.gm-cell-feast .cf-sw .rnd i{background:conic-gradient(#ff4b4b,#ffd23f,#3fe05a,#3fc8ff,#7a5cff,#ff4bd2,#ff4b4b)}
.gm-cell-feast .cf-sk{display:flex;gap:6px;overflow-x:auto;padding:4px 2px 8px;margin:0 -4px;scrollbar-width:thin}
.gm-cell-feast .cf-sk button{flex:none;width:38px;height:38px;border-radius:50%;border:0;padding:0;cursor:pointer;background:#eef1f5 center/cover no-repeat;box-shadow:inset 0 0 0 2px rgba(0,0,0,.12);font:800 10px var(--sans);color:#888}
.gm-cell-feast .cf-sk .on{box-shadow:0 0 0 2px #fff,0 0 0 4px #333}
.gm-cell-feast .cf-seg{display:flex;margin:6px 0 10px;border:1px solid #c8ccd2;border-radius:6px;overflow:hidden}
.gm-cell-feast .cf-seg button{flex:1;height:40px;border:0;border-right:1px solid #c8ccd2;background:#fff;font:800 14px var(--sans);color:#666;cursor:pointer}
.gm-cell-feast .cf-seg button:last-child{border-right:0}
.gm-cell-feast .cf-seg .on{background:#e6f1fc;color:#2a78cc}
.gm-cell-feast .cf-play{width:100%;height:46px;border:0;border-bottom:3px solid #2b6db0;border-radius:6px;background:#3b8fe0;color:#fff;font:900 20px var(--sans);cursor:pointer}
.gm-cell-feast .cf-play:hover{background:#4a9cec}
.gm-cell-feast .cf-play:active{transform:translateY(1px)}
.gm-cell-feast .cf-alt{width:100%;height:42px;margin-top:8px;border:1px solid #c8ccd2;border-radius:6px;background:#f6f7f9;color:#555;font:800 15px var(--sans);cursor:pointer}
.gm-cell-feast .cf-opts{display:flex;justify-content:center;gap:0 16px;flex-wrap:wrap;margin-top:4px}
.gm-cell-feast .cf-opts label{display:flex;align-items:center;gap:6px;min-height:40px;font-weight:700;font-size:13.5px;color:#555;cursor:pointer}
.gm-cell-feast .cf-opts input{width:17px;height:17px;margin:0;accent-color:#3b8fe0}
.gm-cell-feast .cf-help{margin:4px 0 0;font-size:12.5px;font-weight:600;line-height:1.5;color:#888}
.gm-cell-feast .cf-h{margin:0 0 2px;font-size:26px;font-weight:900;letter-spacing:-.02em}
.gm-cell-feast .cf-sub{margin:0;font-size:14px;font-weight:700;color:#777}
.gm-cell-feast .cf-kick{display:inline-block;margin:0 0 8px;padding:4px 10px;border-radius:999px;background:#fff1c2;color:#a8720a;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
.gm-cell-feast .cf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0}
.gm-cell-feast .cf-stats div{background:#f3f5f8;border-radius:8px;padding:8px 4px}
.gm-cell-feast .cf-stats span{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#8a8f98;line-height:1.2}
.gm-cell-feast .cf-stats b{display:block;margin-top:2px;font-size:20px;font-weight:900;color:#333;font-variant-numeric:tabular-nums}
@media (max-width:480px){.gm-cell-feast .cf-stats{grid-template-columns:1fr 1fr}.gm-cell-feast .cf-logo{font-size:34px}}`,

    mount(root, api) {
      const mq = q => { try { return matchMedia(q).matches; } catch (e) { return false; } };
      const COARSE = mq('(pointer: coarse)');
      const portrait = mq('(max-width: 640px) and (orientation: portrait)') || (COARSE && innerHeight > innerWidth);
      const W = portrait ? 420 : 960, H = portrait ? 680 : 600;
      const BASE = Math.sqrt(W * H / (1920 * 1080)) * (portrait ? 1.35 : 1);
      const wrap = document.createElement('div');
      wrap.className = 'cf-wrap';
      root.append(wrap);
      const cv = api.canvas(W, H, wrap), canvas = cv.canvas, ctx = cv.ctx;
      wrap.style.width = canvas.style.width;
      canvas.style.width = '100%';
      const DPR = canvas.width / W;

      const saved = api.load() || {};
      const pref = {
        nick: typeof saved.nick === 'string' ? saved.nick.slice(0, 15) : '',
        col: Number.isInteger(saved.col) && saved.col >= 0 && saved.col <= SWATCH.length ? saved.col : SWATCH.length,
        diff: [0, 1, 2].includes(saved.diff) ? saved.diff : 1,
        mass: saved.mass !== false,
        skin: typeof saved.skin === 'string' && SKIN_BY.has(saved.skin) ? saved.skin : '',
        dark: !!saved.dark
      };
      const savePref = () => api.save(pref);
      if (!pref.nick) { try { const pf = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); if (pf && typeof pf.username === 'string') pref.nick = pf.username.slice(0, 15); } catch (e) {} }
      const skinCache = new Map();
      const skinImg = k => {
        let c = skinCache.get(k);
        if (!c) { const d = SKIN_BY.get(k); if (!d) return null; c = document.createElement('canvas'); c.width = c.height = 256; d[2](c.getContext('2d'), 256); skinCache.set(k, c); }
        return c;
      };
      const skinURL = k => { try { return skinImg(k).toDataURL('image/png'); } catch (e) { return ''; } };
      const botSkin = () => Math.random() < 0.4 ? SKINS[Math.random() * SKINS.length | 0] : null;

      const WORLD = CFG.world, TPS = CFG.tickHz, TICK = 1 / TPS, NC = CFG.noCollideTicks;
      const DECAY = Math.pow(1 - CFG.decayRate, TICK);
      const FOOD_S = sz(CFG.foodMass), EJ_M = CFG.ejectSize * CFG.ejectSize / 100;
      const speedOf = s => CFG.speedK / Math.pow(s, CFG.speedExp) * CFG.tickMs;

      let T = 0, state = 'menu', touchUI = COARSE, thinkEvery = CFG.think[pref.diff];
      const cells = [], ejs = [], viruses = [], players = [], dying = [], board = [], vis = [], order = [];
      const FMAX = CFG.foodMax, fx = new Float32Array(FMAX), fy = new Float32Array(FMAX), fc = new Uint8Array(FMAX), fDead = new Uint8Array(FMAX);
      let fN = 0;
      const G = 250, GN = Math.ceil(WORLD / G), gHead = new Int32Array(GN * GN).fill(-1), gNext = new Int32Array(FMAX);
      const RAD = new Float32Array(64), TMP = new Float32Array(64);
      const cam = { x: WORLD / 2, y: WORLD / 2, z: BASE * 0.7 };
      const mouse = { x: W / 2, y: H / 2 };
      let stats = null, lastEject = -99, ejectKey = false, ejectTouch = 0, myRank = 0, lastScore = -1, deadAt = 0, uid = 0;

      const mkPlayer = (name, color, bot) => ({ skin: '', name, rgbc: color, col: rgb(color), bcol: shade(color, 0.82), bot, aggr: false, cells: [], tx: WORLD / 2, ty: WORLD / 2, alive: false, respawnAt: 0, mass: 0, wx: 0, wy: 0, wt: 0 });
      const me = mkPlayer('', SWATCH[0], false);
      players.push(me);

      function mkCell(o, x, y, m) {
        const s = sz(m);
        const c = { k: 0, o, x, y, px: x, py: y, rx: x, ry: y, m, s, rr: s, bd: 0, bx: 0, by: 0, born: T - 100, mt: -1e9, dead: false, kick: 0, jo: new Float32Array(64), jv: new Float32Array(64), id: uid++ };
        cells.push(c); o.cells.push(c);
        return c;
      }
      function mkVirus(x, y) {
        const s = sz(CFG.virusMass);
        const v = { k: 2, x, y, px: x, py: y, rx: x, ry: y, m: CFG.virusMass, s, rr: s, bd: 0, bx: 0, by: 0, dead: false };
        viruses.push(v);
        return v;
      }
      const canMerge = c => T - c.mt >= (CFG.mergeBase + CFG.mergePerMass * c.m) * TPS;

      function spawnFood(n) {
        while (n-- > 0 && fN < FMAX) {
          fx[fN] = 20 + Math.random() * (WORLD - 40); fy[fN] = 20 + Math.random() * (WORLD - 40);
          fc[fN] = Math.random() * FOOD_COLS.length | 0; fDead[fN] = 0; fN++;
        }
      }
      function spawnPos() {
        let bx = WORLD / 2, by = WORLD / 2, best = -1e9;
        for (let t = 0; t < 18; t++) {
          const x = 300 + Math.random() * (WORLD - 600), y = 300 + Math.random() * (WORLD - 600);
          let dmin = 1e9;
          for (const c of cells) if (c.m > 20) { const d = Math.hypot(c.x - x, c.y - y) - c.s * 1.5 - (c.m > 28 ? CFG.splitReach : 0); if (d < dmin) dmin = d; }
          for (const v of viruses) { const d = Math.hypot(v.x - x, v.y - y) - v.s - 200; if (d < dmin) dmin = d; }
          if (dmin > best) { best = dmin; bx = x; by = y; }
          if (dmin > 700) break;
        }
        return [bx, by];
      }
      function spawnPlayer(p, m) {
        const [x, y] = spawnPos();
        mkCell(p, x, y, m);
        p.alive = true; p.tx = x; p.ty = y; p.wt = 0;
      }
      function spawnVirus() {
        for (let t = 0; t < 6; t++) {
          const x = 200 + Math.random() * (WORLD - 400), y = 200 + Math.random() * (WORLD - 400);
          let ok = true;
          for (const c of cells) if (Math.hypot(c.x - x, c.y - y) < c.s + 160) { ok = false; break; }
          if (ok) for (const v of viruses) if (Math.hypot(v.x - x, v.y - y) < 400) { ok = false; break; }
          if (ok) { mkVirus(x, y); return; }
        }
      }

      function resetBots() {
        for (const p of players) if (p.bot) for (const c of p.cells) c.dead = true;
        sweep();
        players.length = 1;
        const n = CFG.bots[pref.diff], names = NAMES.slice().sort(() => Math.random() - 0.5);
        thinkEvery = CFG.think[pref.diff];
        for (let i = 0; i < n; i++) {
          const b = mkPlayer(names[i % names.length], hsv(Math.random() * 360, 0.92, 1), true), bs = botSkin();
          if (bs && !players.some(p => p.skin === bs[0])) { b.skin = bs[0]; b.name = bs[1]; }
          b.aggr = Math.random() < CFG.aggro[pref.diff];
          players.push(b);
          spawnPlayer(b, i < 3 ? 250 + Math.random() * 700 : 10 + Math.random() * Math.random() * 160);
        }
        updateBoard();
      }

      function splitCell(c, ux, uy) {
        const h = c.m / 2;
        c.m = h; c.s = sz(h); c.mt = T; c.kick = 1;
        const n = mkCell(c.o, c.x, c.y, h);
        n.bd = CFG.splitBoost; n.bx = ux; n.by = uy; n.born = T; n.mt = T; n.rr = c.rr * 0.71; n.kick = 1;
        return n;
      }
      const byMass = (a, b) => b.m - a.m;
      function split(o) {
        const cs = o.cells;
        if (!cs.length) return;
        order.length = 0;
        for (const c of cs) order.push(c);
        order.sort(byMass);
        let did = false;
        for (const c of order) {
          if (cs.length >= CFG.maxCells) break;
          if (c.dead || c.s < CFG.minSplitSize) continue;
          let dx = o.tx - c.x, dy = o.ty - c.y, d = Math.hypot(dx, dy);
          if (d < 1) { dx = 1; dy = 0; d = 1; }
          splitCell(c, dx / d, dy / d);
          did = true;
        }
        if (did && o === me) snd('split');
      }
      function eject(o) {
        lastEject = T;
        let did = false;
        for (const c of o.cells) {
          if (c.dead || c.s < CFG.minEjectSize) continue;
          const s2 = c.s * c.s - CFG.ejectLoss * CFG.ejectLoss;
          if (s2 < CFG.minSize * CFG.minSize) continue;
          c.s = Math.sqrt(s2); c.m = s2 / 100;
          let dx = o.tx - c.x, dy = o.ty - c.y;
          if (dx * dx + dy * dy < 1) { dx = 1; dy = 0; }
          const a = Math.atan2(dy, dx) + (Math.random() * 2 - 1) * CFG.ejectSpread, ux = Math.cos(a), uy = Math.sin(a);
          const x = c.x + ux * c.s, y = c.y + uy * c.s;
          ejs.push({ k: 1, x, y, px: x, py: y, rx: x, ry: y, m: EJ_M, s: CFG.ejectSize, rr: CFG.ejectSize * 0.6, bd: CFG.ejectBoost, bx: ux, by: uy, born: T, dead: false, col: o.col, bcol: o.bcol });
          did = true;
        }
        if (ejs.length > CFG.ejectMaxCount) ejs.splice(0, ejs.length - CFG.ejectMaxCount);
        if (did && o === me) snd('eject');
      }
      function pop(c) {
        const o = c.o;
        let left = CFG.maxCells - o.cells.length;
        c.mt = T; c.kick = 1;
        if (left <= 0) return;
        const mass = c.m, MIN = CFG.popMin, out = order;
        out.length = 0;
        if (mass / left < MIN) {
          let n = 2, pm = mass / n;
          while (pm > MIN && n * 2 < left) pm = mass / (n *= 2);
          n = Math.min(n, left);
          pm = mass / (n + 1);
          for (let i = 0; i < n; i++) out.push(pm);
        } else {
          let rest = mass / 2, pm = mass / 2;
          while (left > 0) {
            if (rest / left < MIN) { const e = rest / left; while (left-- > 0) out.push(e); break; }
            while (pm >= rest) pm /= 2;
            out.push(pm); rest -= pm; left--;
          }
        }
        const a0 = Math.random() * TAU, n = out.length;
        for (let i = 0; i < n; i++) {
          const pm = out[i], a = a0 + i / n * TAU;
          c.m -= pm;
          const p = mkCell(o, c.x, c.y, pm);
          p.bd = CFG.splitBoost; p.bx = Math.cos(a); p.by = Math.sin(a); p.born = T; p.mt = T; p.rr = p.s * 0.4;
        }
        c.s = sz(c.m);
        if (o === me) snd('virus');
      }

      function boostStep(e, bounce) {
        let st = e.bd / CFG.boostDiv;
        if (st > CFG.boostMax) st = CFG.boostMax;
        e.x += e.bx * st; e.y += e.by * st; e.bd -= st;
        if (e.bd < 1) e.bd = 0;
        if (bounce) {
          const h = e.s / 2;
          if (e.x < h) { e.x = h; e.bx = -e.bx; } else if (e.x > WORLD - h) { e.x = WORLD - h; e.bx = -e.bx; }
          if (e.y < h) { e.y = h; e.by = -e.by; } else if (e.y > WORLD - h) { e.y = WORLD - h; e.by = -e.by; }
        }
      }
      function moveCell(c) {
        const o = c.o, dx = o.tx - c.x, dy = o.ty - c.y, d = Math.hypot(dx, dy);
        if (d > 1) { const sp = Math.min(speedOf(c.s), d); c.x += dx / d * sp; c.y += dy / d * sp; }
        if (c.bd) boostStep(c, false);
        if (c.m > CFG.startMass) { c.m = Math.max(CFG.startMass, c.m * DECAY); c.s = sz(c.m); }
        if (c.m > CFG.maxMass) {
          if (o.cells.length < CFG.maxCells) { const a = Math.random() * TAU; splitCell(c, Math.cos(a), Math.sin(a)); }
          else { c.m = CFG.maxMass; c.s = sz(c.m); }
        }
        const h = c.s / 2;
        if (c.x < h) c.x = h; else if (c.x > WORLD - h) c.x = WORLD - h;
        if (c.y < h) c.y = h; else if (c.y > WORLD - h) c.y = WORLD - h;
      }

      function absorb(a, b, merge) {
        a.m += b.m; a.s = sz(a.m); a.kick = 1; b.dead = true;
        dying.push({ x: b.rx, y: b.ry, r: b.rr, col: b.o.col, bcol: b.o.bcol, e: a, t: 0 });
        if (merge) { if (a.o === me) snd('merge'); return; }
        if (a.o === me && stats) { stats.cells++; snd('eat'); }
        if (b.o === me && stats) { stats.killer = a.o.name || UNNAMED; if (me.cells.every(c => c.dead)) snd('die'); else snd('lose'); }
      }
      const byLeft = (a, b) => (a.x - a.s) - (b.x - b.s);
      function collideCells() {
        const L = vis;
        L.length = 0;
        for (const c of cells) if (!c.dead) L.push(c);
        L.sort(byLeft);
        const n = L.length;
        for (let i = 0; i < n; i++) {
          const a = L[i];
          if (a.dead) continue;
          for (let j = i + 1; j < n; j++) {
            const b = L[j];
            if (b.x - b.s > a.x + a.s) break;
            if (b.dead) continue;
            const dx = b.x - a.x, dy = b.y - a.y, rs = a.s + b.s;
            if (dy >= rs || dy <= -rs) continue;
            const d2 = dx * dx + dy * dy;
            if (d2 >= rs * rs) continue;
            const big = a.s >= b.s ? a : b, sm = big === a ? b : a, lim = big.s - sm.s * CFG.eatOverlap;
            if (a.o === b.o) {
              if (T - a.born < NC || T - b.born < NC) continue;
              if (canMerge(a) && canMerge(b)) { if (d2 < lim * lim) absorb(big, sm, true); }
              else {
                const d = Math.sqrt(d2), pen = rs - d;
                const nx = d > 0.01 ? dx / d : 1, ny = d > 0.01 ? dy / d : 0, ma = a.s * a.s, mb = b.s * b.s, tot = ma + mb;
                a.x -= nx * pen * mb / tot; a.y -= ny * pen * mb / tot;
                b.x += nx * pen * ma / tot; b.y += ny * pen * ma / tot;
              }
            } else if (big.s > sm.s * CFG.eatRatio && d2 < lim * lim) absorb(big, sm, false);
            if (a.dead) break;
          }
        }
      }
      function eatFood() {
        gHead.fill(-1);
        for (let i = 0; i < fN; i++) { const k = (fy[i] / G | 0) * GN + (fx[i] / G | 0); gNext[i] = gHead[k]; gHead[k] = i; }
        let eaten = 0;
        for (const c of cells) {
          if (c.dead) continue;
          const lim = c.s - FOOD_S * CFG.eatOverlap, l2 = lim * lim;
          const gx0 = Math.max(0, (c.x - c.s) / G | 0), gx1 = Math.min(GN - 1, (c.x + c.s) / G | 0);
          const gy0 = Math.max(0, (c.y - c.s) / G | 0), gy1 = Math.min(GN - 1, (c.y + c.s) / G | 0);
          let got = 0;
          for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
            for (let i = gHead[gy * GN + gx]; i >= 0; i = gNext[i]) {
              if (fDead[i]) continue;
              const dx = fx[i] - c.x, dy = fy[i] - c.y;
              if (dx * dx + dy * dy < l2) { fDead[i] = 1; got++; }
            }
          }
          if (got) { c.m += got * CFG.foodMass; c.s = sz(c.m); eaten += got; if (c.o === me && stats) stats.food += got; }
        }
        if (eaten) {
          let j = 0;
          for (let i = 0; i < fN; i++) if (!fDead[i]) { fx[j] = fx[i]; fy[j] = fy[i]; fc[j] = fc[i]; fDead[j] = 0; j++; }
          fN = j;
        }
      }
      function eatEjected() {
        for (const e of ejs) {
          if (e.dead) continue;
          for (const v of viruses) {
            if (v.dead) continue;
            const dx = v.x - e.x, dy = v.y - e.y, lim = v.s - e.s * CFG.eatOverlap;
            if (dx * dx + dy * dy < lim * lim) { feedVirus(v, e); break; }
          }
          if (e.dead) continue;
          for (const c of cells) {
            if (c.dead || c.s <= e.s * CFG.eatRatio) continue;
            const dx = c.x - e.x, dy = c.y - e.y, lim = c.s - e.s * CFG.eatOverlap;
            if (dx > lim || dx < -lim || dy > lim || dy < -lim) continue;
            if (dx * dx + dy * dy < lim * lim) { c.m += e.m; c.s = sz(c.m); e.dead = true; break; }
          }
        }
      }
      function feedVirus(v, e) {
        e.dead = true;
        v.m += e.m; v.s = sz(v.m);
        if (v.s >= CFG.virusMaxSize) {
          v.m = CFG.virusMass; v.s = sz(v.m);
          if (viruses.length < CFG.virusMax) {
            const nv = mkVirus(v.x, v.y);
            nv.bd = CFG.virusShoot; nv.bx = e.bx; nv.by = e.by;
            if (Math.abs(v.x - cam.x) * cam.z < W && Math.abs(v.y - cam.y) * cam.z < H) snd('shoot');
          }
        }
      }
      function eatViruses() {
        for (const v of viruses) {
          if (v.dead) continue;
          for (const c of cells) {
            if (c.dead || c.s <= v.s * CFG.eatRatio) continue;
            const dx = c.x - v.x, dy = c.y - v.y, lim = c.s - v.s * CFG.eatOverlap;
            if (dx > lim || dx < -lim || dy > lim || dy < -lim) continue;
            if (dx * dx + dy * dy < lim * lim) { v.dead = true; c.m += v.m; c.s = sz(c.m); pop(c); break; }
          }
        }
      }
      const compact = a => { let j = 0; for (let i = 0; i < a.length; i++) if (!a[i].dead) a[j++] = a[i]; a.length = j; };
      function sweep() {
        compact(cells); compact(ejs); compact(viruses);
        for (const p of players) {
          compact(p.cells);
          if (!p.cells.length && p.alive) { p.alive = false; p.respawnAt = T + Math.round(TPS * (1.5 + Math.random() * 3.5)); }
        }
      }
      const byBoard = (a, b) => b.mass - a.mass;
      function updateBoard() {
        board.length = 0;
        for (const p of players) {
          if (!p.cells.length) continue;
          let m = 0;
          for (const c of p.cells) m += c.m;
          p.mass = m;
          board.push(p);
        }
        board.sort(byBoard);
        myRank = me.cells.length ? board.indexOf(me) + 1 : 0;
        if (state === 'play' && myRank && stats) {
          stats.top = Math.min(stats.top, myRank);
          if (myRank <= 10) stats.lbTicks += CFG.boardEvery;
        }
      }

      function botsLeave() {
        const hw = W / cam.z, hh = H / cam.z;
        for (const b of players) {
          if (!b.bot || b.mass < CFG.leaveMass || Math.random() > CFG.leaveChance) continue;
          if (b.cells.some(c => Math.abs(c.x - cam.x) < hw + c.s && Math.abs(c.y - cam.y) < hh + c.s)) continue;
          for (const c of b.cells) c.dead = true;
          const used = new Set(players.map(p => p.name)), free = NAMES.filter(n => !used.has(n));
          if (free.length) b.name = free[Math.random() * free.length | 0];
          const col = hsv(Math.random() * 360, 0.92, 1), bs = botSkin();
          b.skin = '';
          if (bs && !players.some(p => p.skin === bs[0])) { b.skin = bs[0]; b.name = bs[1]; }
          b.rgbc = col; b.col = rgb(col); b.bcol = shade(col, 0.82); b.aggr = Math.random() < CFG.aggro[pref.diff];
        }
        sweep();
      }
      function nearestFood(x, y, maxD) {
        const gx0 = Math.max(0, (x - maxD) / G | 0), gx1 = Math.min(GN - 1, (x + maxD) / G | 0);
        const gy0 = Math.max(0, (y - maxD) / G | 0), gy1 = Math.min(GN - 1, (y + maxD) / G | 0);
        let best = -1, bd = maxD * maxD;
        for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
          for (let i = gHead[gy * GN + gx]; i >= 0; i = gNext[i]) {
            if (i >= fN) continue;
            const dx = fx[i] - x, dy = fy[i] - y, d2 = dx * dx + dy * dy;
            if (d2 < bd) { bd = d2; best = i; }
          }
        }
        return best;
      }
      function think(b) {
        const cs = b.cells;
        let main = cs[0], cx = 0, cy = 0, tm = 0;
        for (const c of cs) { if (c.m > main.m) main = c; cx += c.x * c.m; cy += c.y * c.m; tm += c.m; }
        cx /= tm; cy /= tm;
        const R = main.s, vis = 650 + R * 4, passive = !b.aggr;
        let fxv = 0, fyv = 0, danger = 0, prey = null, pScore = 0, near = 1e9;
        for (const c of cells) {
          if (c.o === b || c.dead) continue;
          const dx = c.x - cx, dy = c.y - cy;
          if (dx > vis || dx < -vis || dy > vis || dy < -vis) continue;
          const d = Math.hypot(dx, dy) || 1;
          if (c.s > R * 1.1) {
            const splitter = c.m * 0.5 > main.m * 1.33 && c.o.cells.length < CFG.maxCells;
            const reach = c.s + R + (splitter ? CFG.splitReach : 150) + (passive ? 220 : 0);
            if (d < reach) { const w = (reach - d) / reach * 3 + 0.4; fxv -= dx / d * w; fyv -= dy / d * w; danger += w; }
            if (d - c.s < near) near = d - c.s;
          } else if (R > c.s * CFG.eatRatio) {
            const edge = Math.max(1, d - R + 60);
            if (passive && edge > 450) continue;
            const sc = c.m / edge;
            if (sc > pScore) { pScore = sc; prey = c; }
          }
        }
        if (b.aggr && danger < 1.6 && main.m > 140 && main.s >= CFG.minEjectSize && T - (b.ej || 0) >= CFG.ejectCooldown) {
          for (const v of viruses) {
            const vx = v.x - main.x, vy = v.y - main.y, vd = Math.hypot(vx, vy) || 1;
            if (vd > R + 520 || vd < R + v.s * 0.5) continue;
            let hit = false;
            for (const c of cells) {
              if (c.dead || c.o === b || c.m < Math.max(260, main.m * 1.3)) continue;
              const ex = c.x - v.x, ey = c.y - v.y, ed = Math.hypot(ex, ey) || 1;
              if (ed < 760 && (ex * vx + ey * vy) / (ed * vd) > 0.93) { hit = true; break; }
            }
            if (hit) { b.tx = v.x; b.ty = v.y; b.ej = T; eject(b); return; }
          }
        }
        let gx, gy;
        if (danger > 0.2) {
          const m = 400;
          if (cx < m) fxv += (m - cx) / m * 3; else if (cx > WORLD - m) fxv -= (cx - WORLD + m) / m * 3;
          if (cy < m) fyv += (m - cy) / m * 3; else if (cy > WORLD - m) fyv -= (cy - WORLD + m) / m * 3;
          const l = Math.hypot(fxv, fyv) || 1;
          gx = cx + fxv / l * 900; gy = cy + fyv / l * 900;
        } else if (prey) {
          gx = prey.x + (prey.x - prey.px) * 6; gy = prey.y + (prey.y - prey.py) * 6;
          if (b.aggr && cs.length <= 4 && near > 700) {
            const d = Math.hypot(prey.x - main.x, prey.y - main.y);
            if (main.m * 0.5 > prey.m * 1.4 && prey.m > main.m * CFG.splitWorth && main.s >= CFG.minSplitSize && d > R * 0.6 && d < CFG.splitReach + R * 0.5 && Math.random() < 0.55) {
              b.tx = prey.x; b.ty = prey.y;
              split(b);
              return;
            }
          }
        } else {
          const f = R < 260 ? nearestFood(main.x, main.y, 500) : -1;
          if (f >= 0) { gx = fx[f]; gy = fy[f]; }
          else {
            if (T > b.wt || Math.hypot(b.wx - cx, b.wy - cy) < 200) { b.wx = 300 + Math.random() * (WORLD - 600); b.wy = 300 + Math.random() * (WORLD - 600); b.wt = T + TPS * 8; }
            gx = b.wx; gy = b.wy;
          }
        }
        if (R > sz(CFG.virusMass) * CFG.eatRatio && cs.length < CFG.maxCells) {
          for (const v of viruses) {
            const dx = v.x - main.x, dy = v.y - main.y, lim = R + v.s + 120, d = Math.hypot(dx, dy) || 1;
            if (d < lim) { const w = (lim - d) / lim * 700; gx -= dx / d * w; gy -= dy / d * w; }
          }
        }
        b.tx = Math.max(0, Math.min(WORLD, gx));
        b.ty = Math.max(0, Math.min(WORLD, gy));
      }

      function aimHuman() {
        me.tx = cam.x + (mouse.x - W / 2) / cam.z;
        me.ty = cam.y + (mouse.y - H / 2) / cam.z;
      }
      function tick() {
        T++;
        if (me.cells.length) {
          aimHuman();
          if ((ejectKey || ejectTouch > 0) && T - lastEject >= CFG.ejectCooldown) eject(me);
        }
        for (let i = 1; i < players.length; i++) {
          const b = players[i];
          if (b.cells.length) { if ((T + i) % thinkEvery === 0) think(b); }
          else if (T >= b.respawnAt) spawnPlayer(b, CFG.startMass);
        }
        for (let i = 0; i < cells.length; i++) { const c = cells[i]; c.px = c.x; c.py = c.y; moveCell(c); }
        for (const e of ejs) { e.px = e.x; e.py = e.y; if (e.bd) boostStep(e, true); }
        for (const v of viruses) { v.px = v.x; v.py = v.y; if (v.bd) boostStep(v, true); }
        collideCells();
        eatFood();
        eatEjected();
        eatViruses();
        sweep();
        if (T % CFG.spawnEvery === 0) {
          spawnFood(Math.min(CFG.foodSpawn, FMAX - fN));
          for (let k = 0; k < 2 && viruses.length < CFG.virusMin; k++) spawnVirus();
        }
        if (T % CFG.boardEvery === 0) updateBoard();
        if (T % (TPS * CFG.leaveEvery) === 0) botsLeave();
        if (state === 'play' || state === 'pause') {
          if (me.cells.length) {
            stats.ticks++;
            let m = 0;
            for (const c of me.cells) m += c.m;
            if (m > stats.best) stats.best = m;
            const sc = Math.floor(m);
            if (sc !== lastScore) { lastScore = sc; api.score(sc); }
          } else died();
        }
      }

      function play() {
        if (state === 'play') return;
        const inp = ov.querySelector('.cf-nick');
        if (inp) pref.nick = inp.value.trim().slice(0, 15);
        savePref();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        hidePanel();
        const color = pref.col < SWATCH.length ? SWATCH[pref.col] : hsv(Math.random() * 360, 0.92, 1);
        me.name = pref.nick; me.skin = pref.skin; me.rgbc = color; me.col = rgb(color); me.bcol = shade(color, 0.82);
        for (const c of me.cells) c.dead = true;
        sweep();
        spawnPlayer(me, CFG.startMass);
        const c0 = me.cells[0];
        cam.x = c0.x; cam.y = c0.y; cam.z = BASE;
        mouse.x = W / 2; mouse.y = H / 2;
        stats = { food: 0, best: CFG.startMass, ticks: 0, cells: 0, top: 99, lbTicks: 0, killer: '' };
        lastScore = -1; ejectKey = false; ejectTouch = 0; ptr.clear();
        state = 'play';
        api.score(CFG.startMass);
        updateBoard();
        snd('start');
      }
      function died() {
        state = 'dying';
        ejectKey = false; ejectTouch = 0;
        const best = Math.round(stats.best);
        const nb = api.submit(best);
        api.timeout(() => showDead(nb), 900);
      }
      function pause() {
        if (state !== 'play') return;
        state = 'pause';
        ejectKey = false; ejectTouch = 0;
        panel(`<div class="cf-card"><h3 class="cf-h">Paused</h3><p class="cf-sub" style="margin-bottom:14px">The world is frozen.</p><button class="cf-play" data-a="1">Resume</button><button class="cf-alt" data-act="menu">Leave game</button></div>`);
      }
      function resume() {
        if (state !== 'pause') return;
        hidePanel();
        state = 'play';
      }
      function leave() {
        for (const c of me.cells) c.dead = true;
        sweep();
        if (stats && state === 'pause') { state = 'dying'; api.submit(Math.round(stats.best)); }
        showMenu();
      }

      const ov = document.createElement('div');
      ov.className = 'g-overlay show cf-ov';
      wrap.append(ov);
      function panel(html) { ov.innerHTML = html; ov.hidden = false; }
      function hidePanel() { ov.hidden = true; ov.innerHTML = ''; }
      const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
      function showMenu() {
        state = 'menu';
        const logo = 'Agar.io'.split('').map((ch, i) => ch === ' ' ? ' ' : `<span style="color:${rgb(hsv([200, 0, 48, 140, 0, 272, 22, 178, 318, 90][i], 0.85, 0.92))}">${ch}</span>`).join('');
        const sw = SWATCH.map((c, i) => `<button type="button" data-col="${i}" class="${i === pref.col ? 'on' : ''}" aria-label="Colour ${i + 1}"><i style="--c:${rgb(c)}"></i></button>`).join('') +
          `<button type="button" data-col="${SWATCH.length}" class="rnd${pref.col === SWATCH.length ? ' on' : ''}" aria-label="Random colour"><i></i></button>`;
        panel(`<div class="cf-card">
<h2 class="cf-logo">${logo}</h2>
<input class="cf-nick" maxlength="15" placeholder="Nick" value="${esc(pref.nick)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
<div class="cf-sw">${sw}</div>
<div class="cf-sk"><button type="button" data-skin="" class="${pref.skin ? '' : 'on'}" aria-label="No skin">None</button>${SKINS.map(k => `<button type="button" data-skin="${k[0]}" class="${pref.skin === k[0] ? 'on' : ''}" aria-label="${k[1]}" title="${k[1]}" style="background-image:url(${skinURL(k[0])})"></button>`).join('')}</div>
<div class="cf-seg">${['Chill', 'Normal', 'Hard'].map((t, i) => `<button type="button" data-diff="${i}" class="${i === pref.diff ? 'on' : ''}">${t}</button>`).join('')}</div>
<button type="button" class="cf-play" data-a="1">Play</button>
<div class="cf-opts"><label><input type="checkbox" data-opt="mass"${pref.mass ? ' checked' : ''}>Show mass</label><label><input type="checkbox" data-opt="dark"${pref.dark ? ' checked' : ''}>Dark theme</label></div>
<p class="cf-help">${touchUI ? 'Drag to steer your cell.<br>Tap <b>Split</b> to split, <b>Eject</b> to shoot some mass.' : 'Move your mouse to control your cell.<br><b>Space</b> to split · <b>W</b> to eject some mass'}</p>
</div>`);
        if (!touchUI) { const inp = ov.querySelector('.cf-nick'); if (inp) try { inp.focus({ preventScroll: true }); } catch (e) {} }
      }
      function showDead(nb) {
        if (state !== 'dying') return;
        state = 'dead';
        deadAt = performance.now();
        const s = stats, st = [['Food eaten', s.food], ['Highest mass', Math.round(s.best)], ['Time alive', fmtT(s.ticks / TPS)], ['Leaderboard time', fmtT(s.lbTicks / TPS)], ['Cells eaten', s.cells], ['Top position', s.top < 99 ? s.top : '-']];
        panel(`<div class="cf-card">${nb ? '<p class="cf-kick">New best!</p>' : ''}<h3 class="cf-h">You got eaten</h3><p class="cf-sub">${s.killer ? 'by <b>' + esc(s.killer) + '</b>' : '&nbsp;'}</p>
<div class="cf-stats">${st.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
<button type="button" class="cf-play" data-a="1">Play</button><button type="button" class="cf-alt" data-act="menu">Menu</button></div>`);
      }
      api.on(ov, 'click', e => {
        const t = e.target.closest('button');
        if (!t) return;
        if (t.dataset.a) { snd('tap'); if (state === 'pause') resume(); else play(); }
        else if (t.dataset.act === 'menu') { snd('tap'); if (state === 'pause') leave(); else showMenu(); }
        else if (t.dataset.col != null) {
          pref.col = +t.dataset.col; savePref();
          ov.querySelectorAll('[data-col]').forEach(b => b.classList.toggle('on', b === t));
        } else if (t.dataset.skin != null) {
          pref.skin = t.dataset.skin; savePref();
          ov.querySelectorAll('[data-skin]').forEach(b => b.classList.toggle('on', b === t));
        } else if (t.dataset.diff != null) {
          const d = +t.dataset.diff;
          ov.querySelectorAll('[data-diff]').forEach(b => b.classList.toggle('on', b === t));
          if (d !== pref.diff) { pref.diff = d; savePref(); resetBots(); }
        }
      });
      api.on(ov, 'change', e => { const k = e.target.dataset && e.target.dataset.opt; if (k) { pref[k] = e.target.checked; savePref(); } });
      api.on(ov, 'input', e => { if (e.target.classList.contains('cf-nick')) pref.nick = e.target.value.slice(0, 15); });

      const isField = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
      api.on(window, 'keydown', e => {
        if (state === 'menu') {
          if (e.key === 'Enter' || (e.code === 'Space' && !isField(e.target))) { e.preventDefault(); if (!e.repeat) play(); }
          return;
        }
        if (state === 'dead') {
          if ((e.key === 'Enter' || e.code === 'Space') && !e.repeat && performance.now() - deadAt > 500) { e.preventDefault(); play(); }
          return;
        }
        if (state === 'pause') {
          if ((e.key === 'Enter' || e.code === 'Space' || e.code === 'KeyP') && !e.repeat) { e.preventDefault(); resume(); }
          return;
        }
        if (state !== 'play' || isField(e.target)) return;
        if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) { aimHuman(); split(me); } }
        else if (e.code === 'KeyW') { if (!e.repeat) { ejectKey = true; if (T - lastEject >= CFG.ejectCooldown) { aimHuman(); eject(me); } } }
        else if (e.code === 'KeyP') pause();
      });
      api.on(window, 'keyup', e => { if (e.code === 'KeyW') ejectKey = false; });
      api.on(window, 'blur', () => { ejectKey = false; });

      const BS = { x: W - 64, y: H - 70, r: 42 }, BE = { x: W - 64, y: H - 178, r: 32 }, BP = { x: 10, y: 10, w: 38, h: 38 };
      const ptr = new Map();
      const inC = (p, b) => (p.x - b.x) ** 2 + (p.y - b.y) ** 2 < (b.r + 8) ** 2;
      let flashS = 0, flashE = 0;
      api.on(canvas, 'pointerdown', e => {
        if (e.pointerType === 'touch') touchUI = true;
        const p = cv.toLocal(e);
        if (state !== 'play') return;
        e.preventDefault();
        if (p.x >= BP.x - 4 && p.x <= BP.x + BP.w + 4 && p.y >= BP.y - 4 && p.y <= BP.y + BP.h + 4) { pause(); return; }
        if (touchUI && inC(p, BS)) { ptr.set(e.pointerId, 's'); flashS = 1; aimHuman(); split(me); return; }
        if (touchUI && inC(p, BE)) {
          ptr.set(e.pointerId, 'e'); ejectTouch++; flashE = 1;
          if (T - lastEject >= CFG.ejectCooldown) { aimHuman(); eject(me); }
          return;
        }
        ptr.set(e.pointerId, 'm');
        mouse.x = p.x; mouse.y = p.y;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      });
      api.on(window, 'pointermove', e => {
        if (e.pointerType === 'mouse' || ptr.get(e.pointerId) === 'm') { const p = cv.toLocal(e); mouse.x = p.x; mouse.y = p.y; }
      });
      const up = e => { if (ptr.get(e.pointerId) === 'e') ejectTouch = Math.max(0, ejectTouch - 1); ptr.delete(e.pointerId); };
      api.on(window, 'pointerup', up);
      api.on(window, 'pointercancel', up);
      api.on(canvas, 'contextmenu', e => e.preventDefault());

      let actx = null, noise = null;
      const lastSnd = {};
      function snd(kind) {
        if (api.muted) return;
        const now = performance.now();
        if (now - (lastSnd[kind] || 0) < 45) return;
        lastSnd[kind] = now;
        try {
          if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
          if (actx.state === 'suspended') actx.resume();
          const t = actx.currentTime, out = actx.destination;
          const tone = (type, f0, f1, dur, vol, dl = 0) => {
            const o = actx.createOscillator(), g = actx.createGain();
            o.type = type; o.frequency.setValueAtTime(f0, t + dl); o.frequency.exponentialRampToValueAtTime(f1, t + dl + dur);
            g.gain.setValueAtTime(0.0001, t + dl); g.gain.exponentialRampToValueAtTime(vol, t + dl + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dl + dur);
            o.connect(g); g.connect(out); o.start(t + dl); o.stop(t + dl + dur + 0.03);
          };
          const hiss = (dur, vol, f0, f1) => {
            if (!noise) { noise = actx.createBuffer(1, actx.sampleRate * 0.5 | 0, actx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
            const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
            s.buffer = noise; f.type = 'bandpass'; f.Q.value = 1.2;
            f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
            g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.02);
          };
          if (kind === 'eat') { tone('sine', 620, 240, 0.11, 0.16); tone('sine', 900, 500, 0.06, 0.06, 0.02); }
          else if (kind === 'split') { hiss(0.16, 0.12, 600, 2400); tone('triangle', 260, 520, 0.1, 0.06); }
          else if (kind === 'eject') tone('sine', 820, 420, 0.06, 0.07);
          else if (kind === 'merge') tone('sine', 330, 520, 0.14, 0.08);
          else if (kind === 'virus') { hiss(0.35, 0.22, 2000, 200); tone('sine', 180, 50, 0.3, 0.2); }
          else if (kind === 'shoot') { hiss(0.2, 0.08, 400, 1600); tone('square', 140, 90, 0.12, 0.03); }
          else if (kind === 'lose') tone('triangle', 420, 200, 0.12, 0.08);
          else if (kind === 'die') { tone('triangle', 440, 70, 0.6, 0.14); hiss(0.3, 0.08, 1200, 200); }
          else if (kind === 'start') { tone('sine', 523, 523, 0.08, 0.08); tone('sine', 784, 784, 0.12, 0.08, 0.08); }
          else if (kind === 'tap') tone('sine', 660, 660, 0.04, 0.04);
        } catch (err) {}
      }

      let wobA = 0, wobS = 1;
      function wobble(c, n) {
        const jo = c.jo, jv = c.jv, kick = 0.22 + c.kick * 1.4;
        c.kick *= 0.9;
        for (let i = 0; i < n; i++) { jv[i] = (jv[i] + (Math.random() - 0.5) * kick) * 0.88; }
        for (let i = 0; i < n; i++) TMP[i] = (jv[i === 0 ? n - 1 : i - 1] + jv[i === n - 1 ? 0 : i + 1] + 8 * jv[i]) / 10;
        for (let i = 0; i < n; i++) { let v = (jo[i] + TMP[i]) * 0.9; if (v > 1.6) v = 1.6; else if (v < -1.6) v = -1.6; jo[i] = v; jv[i] = TMP[i]; }
      }
      function drawText(c, x, y, r, sc) {
        const o = c.o, name = o.name, mass = pref.mass;
        let fs = Math.max(r * 0.4, 24);
        if (name) {
          if (o.nwFor !== name) { ctx.font = '700 100px Ubuntu, Nunito, system-ui, sans-serif'; o.nw = ctx.measureText(name).width; o.nwFor = name; }
          const w = o.nw * fs / 100;
          if (w > r * 1.8 && fs > 24) fs = Math.max(24, fs * r * 1.8 / w);
        }
        if (fs * sc < 6 || (!name && !mass)) return;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff';
        if (name) {
          ctx.font = `700 ${fs}px Ubuntu, Nunito, system-ui, sans-serif`;
          ctx.lineWidth = fs * 0.14 + 0.6 / sc;
          ctx.strokeText(name, x, y); ctx.fillText(name, x, y);
        }
        const ms = fs * (name ? 0.6 : 0.8);
        if (mass && ms * sc >= 5) {
          const my = name ? y + fs * 0.78 : y;
          ctx.font = `700 ${ms}px Ubuntu, Nunito, system-ui, sans-serif`;
          ctx.lineWidth = ms * 0.16 + 0.6 / sc;
          const t = String(Math.floor(c.m));
          ctx.strokeText(t, x, my); ctx.fillText(t, x, my);
        }
      }
      function drawCell(c, sc) {
        const x = c.rx, y = c.ry, r = c.rr, rs = r * sc, o = c.o;
        ctx.beginPath();
        if (rs < 6) ctx.arc(x, y, r, 0, TAU);
        else {
          const n = Math.max(18, Math.min(64, Math.round(rs * 0.7))), t = trig(n), jo = c.jo, amp = 1.2 + r * 0.018;
          for (let k = 0; k < wobS; k++) wobble(c, n);
          for (let i = 0; i < n; i++) RAD[i] = r + jo[i] * amp;
          if (o.cells.length > 1) {
            for (const b of o.cells) {
              if (b === c || b.dead) continue;
              const dx = b.rx - x, dy = b.ry - y, rb = b.rr, d2 = dx * dx + dy * dy;
              if (d2 >= (r + rb) * (r + rb) || d2 < 1) continue;
              if (T - c.born < NC || T - b.born < NC || (canMerge(c) && canMerge(b))) continue;
              const d = Math.sqrt(d2), t0 = (d2 + r * r - rb * rb) / (2 * d), ux = dx / d, uy = dy / d;
              if (t0 < r * 0.25) continue;
              for (let i = 0; i < n; i++) {
                const cs = t.c[i] * ux + t.s[i] * uy;
                if (cs > 0.05) { const lim = t0 / cs; if (RAD[i] > lim) RAD[i] = lim; }
              }
            }
          }
          let qx = x + t.c[0] * RAD[0], qy = y + t.s[0] * RAD[0];
          ctx.moveTo((qx + x + t.c[n - 1] * RAD[n - 1]) / 2, (qy + y + t.s[n - 1] * RAD[n - 1]) / 2);
          for (let i = 0; i < n; i++) {
            const j = i + 1 === n ? 0 : i + 1, nx = x + t.c[j] * RAD[j], ny = y + t.s[j] * RAD[j];
            ctx.quadraticCurveTo(qx, qy, (qx + nx) / 2, (qy + ny) / 2);
            qx = nx; qy = ny;
          }
          ctx.closePath();
        }
        ctx.fillStyle = o.col; ctx.fill();
        const si = o.skin && rs > 9 ? skinImg(o.skin) : null;
        if (si) { ctx.save(); ctx.clip(); ctx.drawImage(si, x - r, y - r, r * 2, r * 2); ctx.restore(); }
        ctx.strokeStyle = o.bcol; ctx.lineWidth = 3 + r * 0.045; ctx.stroke();
        drawText(c, x, y, r, sc);
      }
      function drawVirus(v) {
        const r = v.rr, x = v.rx, y = v.ry, n = 2 * Math.round(Math.max(24, Math.min(80, r * 0.36))), t = trig(n);
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const rad = i & 1 ? r * 0.955 : r * 1.03;
          if (i) ctx.lineTo(x + t.c[i] * rad, y + t.s[i] * rad); else ctx.moveTo(x + t.c[i] * rad, y + t.s[i] * rad);
        }
        ctx.closePath();
        ctx.fillStyle = '#33ff33'; ctx.fill();
        ctx.strokeStyle = '#1fc41f'; ctx.lineWidth = 5; ctx.lineJoin = 'miter'; ctx.stroke();
      }
      function drawBlob(x, y, r, col, bcol) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = col; ctx.fill();
        ctx.strokeStyle = bcol; ctx.lineWidth = Math.min(10, 3 + r * 0.05); ctx.stroke();
      }
      function zoomFor(cs) {
        let ss = 0;
        for (const c of cs) ss += c.s;
        return Math.pow(Math.min(CFG.zoomRef / Math.max(ss, 1), 1), CFG.zoomExp) * BASE;
      }
      function updateCam(dt) {
        let tx = cam.x, ty = cam.y, tz = cam.z, k = 1 - Math.exp(-dt * 20);
        const kz = 1 - Math.exp(-dt * 6);
        let src = null;
        if (me.cells.length) src = me.cells;
        else if (state === 'menu' && board.length) { src = board[0].cells; k = 1 - Math.exp(-dt * 1.5); }
        if (src && src.length) {
          let sx = 0, sy = 0, sm = 0;
          for (const c of src) { sx += c.rx * c.m; sy += c.ry * c.m; sm += c.m; }
          tx = sx / sm; ty = sy / sm; tz = src === me.cells ? zoomFor(src) : Math.max(zoomFor(src) * 0.85, BASE * 0.5);
        }
        cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.z += (tz - cam.z) * kz;
      }
      const byR = (a, b) => a.rr - b.rr;
      function render(alpha, dt) {
        const kR = Math.min(1, dt * 12);
        wobA = Math.min(4, wobA + dt * 60); wobS = wobA | 0; wobA -= wobS;
        for (const c of cells) { c.rx = c.px + (c.x - c.px) * alpha; c.ry = c.py + (c.y - c.py) * alpha; c.rr += (c.s - c.rr) * kR; }
        for (const e of ejs) { e.rx = e.px + (e.x - e.px) * alpha; e.ry = e.py + (e.y - e.py) * alpha; e.rr += (e.s - e.rr) * kR; }
        for (const v of viruses) { v.rx = v.px + (v.x - v.px) * alpha; v.ry = v.py + (v.y - v.py) * alpha; v.rr += (v.s - v.rr) * kR; }
        updateCam(dt);
        const sc = cam.z, hw = W / 2 / sc, hh = H / 2 / sc;
        const x0 = cam.x - hw, x1 = cam.x + hw, y0 = cam.y - hh, y1 = cam.y + hh;
        const th = pref.dark ? THEME.dark : THEME.light;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.fillStyle = th.out; ctx.fillRect(0, 0, W, H);
        ctx.setTransform(DPR * sc, 0, 0, DPR * sc, DPR * (W / 2 - cam.x * sc), DPR * (H / 2 - cam.y * sc));
        const wx0 = Math.max(0, x0), wx1 = Math.min(WORLD, x1), wy0 = Math.max(0, y0), wy1 = Math.min(WORLD, y1);
        if (wx1 > wx0 && wy1 > wy0) {
          ctx.fillStyle = th.bg; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
          const st = CFG.gridStep;
          ctx.beginPath();
          for (let gx = Math.ceil(wx0 / st) * st; gx <= wx1; gx += st) { ctx.moveTo(gx, wy0); ctx.lineTo(gx, wy1); }
          for (let gy = Math.ceil(wy0 / st) * st; gy <= wy1; gy += st) { ctx.moveTo(wx0, gy); ctx.lineTo(wx1, gy); }
          ctx.globalAlpha = 0.2; ctx.strokeStyle = th.grid; ctx.lineWidth = Math.min(1, sc / BASE) / sc; ctx.stroke(); ctx.globalAlpha = 1;
        }
        const m = FOOD_S + 2;
        for (let col = 0; col < FOOD_COLS.length; col++) {
          ctx.beginPath();
          let any = false;
          for (let i = 0; i < fN; i++) {
            if (fc[i] !== col) continue;
            const x = fx[i], y = fy[i];
            if (x < x0 - m || x > x1 + m || y < y0 - m || y > y1 + m) continue;
            ctx.moveTo(x + FOOD_S, y); ctx.arc(x, y, FOOD_S, 0, TAU); any = true;
          }
          if (any) { ctx.fillStyle = FOOD_COLS[col]; ctx.fill(); }
        }
        for (let i = dying.length - 1; i >= 0; i--) {
          const d = dying[i];
          d.t += dt / 0.14;
          if (d.t >= 1 || d.e.dead) { dying[i] = dying[dying.length - 1]; dying.pop(); continue; }
          const k = d.t * d.t;
          drawBlob(d.x + (d.e.rx - d.x) * k, d.y + (d.e.ry - d.y) * k, d.r * (1 - 0.4 * k), d.col, d.bcol);
        }
        vis.length = 0;
        for (const c of cells) if (c.rx + c.rr > x0 && c.rx - c.rr < x1 && c.ry + c.rr > y0 && c.ry - c.rr < y1) vis.push(c);
        for (const e of ejs) if (e.rx + e.rr > x0 && e.rx - e.rr < x1 && e.ry + e.rr > y0 && e.ry - e.rr < y1) vis.push(e);
        for (const v of viruses) if (v.rx + v.rr > x0 && v.rx - v.rr < x1 && v.ry + v.rr > y0 && v.ry - v.rr < y1) vis.push(v);
        vis.sort(byR);
        for (const e of vis) {
          if (e.k === 0) drawCell(e, sc);
          else if (e.k === 2) drawVirus(e);
          else drawBlob(e.rx, e.ry, e.rr, e.col, e.bcol);
        }
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        drawHud(dt);
      }
      function fitText(s, w) {
        if (ctx.measureText(s).width <= w) return s;
        while (s.length > 1 && ctx.measureText(s + '…').width > w) s = s.slice(0, -1);
        return s + '…';
      }
      function drawHud(dt) {
        const small = W < 600, F = 'Ubuntu, Nunito, system-ui, sans-serif';
        const n = Math.min(10, board.length), out = myRank > 10;
        const lw = small ? 134 : 200, tf = small ? 16 : 24, ef = small ? 12 : 16, lh = small ? 16 : 23;
        const lx = W - lw - 10, ly = 10, h = 16 + tf + 8 + (n + (out ? 1 : 0)) * lh + 6;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.roundRect(lx, ly, lw, h, 6); ctx.fill();
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.font = `700 ${tf}px ${F}`;
        ctx.fillText('Leaderboard', lx + lw / 2, ly + 10 + tf / 2);
        ctx.font = `700 ${ef}px ${F}`;
        const row = (i, p) => {
          ctx.fillStyle = p === me ? '#ffaaaa' : '#fff';
          ctx.fillText(fitText((i + 1) + '. ' + (p.name || UNNAMED), lw - 16), lx + lw / 2, ly + 16 + tf + 8 + lh * (row.k++) + lh / 2);
        };
        row.k = 0;
        for (let i = 0; i < n; i++) row(i, board[i]);
        if (out) row(myRank - 1, me);
        const playing = state === 'play' || state === 'pause' || state === 'dying';
        if (playing && stats) {
          const txt = 'Score: ' + Math.max(0, lastScore), sf = small ? 17 : 22;
          ctx.font = `700 ${sf}px ${F}`;
          const tw = ctx.measureText(txt).width + 20, bh = sf + 14;
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.beginPath(); ctx.roundRect(10, H - 10 - bh, tw, bh, 6); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
          ctx.fillText(txt, 20, H - 10 - bh / 2);
        }
        if (state === 'play') {
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath(); ctx.roundRect(BP.x, BP.y, BP.w, BP.h, 7); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillRect(BP.x + 12, BP.y + 11, 5, 16); ctx.fillRect(BP.x + 21, BP.y + 11, 5, 16);
          if (touchUI) {
            flashS = Math.max(0, flashS - dt * 5); flashE = Math.max(0, flashE - dt * 5);
            touchBtn(BS, 'Split', flashS, 0);
            touchBtn(BE, 'Eject', flashE || (ejectTouch ? 0.6 : 0), 1);
          }
        }
      }
      function touchBtn(b, label, fl, kind) {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fillStyle = `rgba(0,0,0,${0.28 + fl * 0.25})`; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.stroke();
        ctx.fillStyle = '#fff';
        if (kind === 0) {
          ctx.beginPath(); ctx.arc(b.x - 9, b.y - 7, 9, 0, TAU); ctx.arc(b.x + 11, b.y - 9, 6, 0, TAU); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(b.x - 6, b.y - 5, 8, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(b.x + 10, b.y - 10, 3.5, 0, TAU); ctx.fill();
        }
        ctx.font = `800 ${kind === 0 ? 13 : 11}px Ubuntu, Nunito, system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, b.x, b.y + b.r * 0.45);
      }

      spawnFood(FMAX);
      for (let i = 0; i < CFG.virusMin; i++) spawnVirus();
      resetBots();
      for (let i = 0; i < TPS * 2; i++) tick();
      if (board.length) { const lead = board[0].cells; let sx = 0, sy = 0, sm = 0; for (const c of lead) { sx += c.x * c.m; sy += c.y * c.m; sm += c.m; } cam.x = sx / sm; cam.y = sy / sm; }
      showMenu();

      let acc = 0;
      api.loop(dt => {
        if (state !== 'pause') {
          acc += dt;
          while (acc >= TICK) { acc -= TICK; tick(); }
        }
        render(state === 'pause' ? 1 : acc / TICK, dt);
      });

      return { destroy() { if (actx) { try { actx.close(); } catch (e) {} actx = null; } } };
    }
  });
  Ameplay.covers['cell-feast'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cfe-bg" cx="42%" cy="45%" r="75%"><stop offset="0" stop-color="#f6fcff"/><stop offset="1" stop-color="#c4e6f7"/></radialGradient><pattern id="cfe-gr" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#6f9bb3" stroke-width="3" opacity=".2"/></pattern><radialGradient id="cfe-hl" cx="35%" cy="30%" r="65%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#cfe-bg)"/><rect width="400" height="300" fill="url(#cfe-gr)"/><circle cx="30" cy="40" r="6" fill="#ff5a5a"/><circle cx="78" cy="22" r="6" fill="#ffc83d"/><circle cx="120" cy="60" r="6" fill="#3fe08a"/><circle cx="22" cy="120" r="6" fill="#b05cff"/><circle cx="60" cy="170" r="6" fill="#ff8a3d"/><circle cx="110" cy="252" r="6" fill="#3fc8ff"/><circle cx="150" cy="282" r="6" fill="#ff4fc3"/><circle cx="205" cy="270" r="6" fill="#9be03f"/><circle cx="250" cy="250" r="6" fill="#ff5a5a"/><circle cx="262" cy="205" r="6" fill="#3f7bff"/><circle cx="236" cy="40" r="6" fill="#3fe0d0"/><circle cx="190" cy="24" r="6" fill="#ff8a3d"/><circle cx="300" cy="166" r="6" fill="#ffc83d"/><circle cx="384" cy="150" r="6" fill="#b05cff"/><circle cx="392" cy="212" r="6" fill="#3fe08a"/><circle cx="18" cy="214" r="6" fill="#ffc83d"/><circle cx="100" cy="110" r="6" fill="#ff4fc3"/><circle cx="268" cy="292" r="6" fill="#3fc8ff"/><circle cx="380" cy="14" r="92" fill="#ff4d6d" stroke="#d93454" stroke-width="9"/><circle cx="380" cy="14" r="92" fill="url(#cfe-hl)"/><g fill="#2a4a5e" opacity=".14"><ellipse cx="172" cy="252" rx="74" ry="14"/><ellipse cx="298" cy="156" rx="34" ry="8"/><ellipse cx="338" cy="290" rx="46" ry="9"/></g><path d="M384 241L378 248L381 255L374 260L374 268L366 270L364 278L356 277L352 285L344 282L338 288L331 283L323 287L318 280L310 282L307 274L299 273L298 265L290 262L292 254L285 249L289 241L284 235L290 228L287 221L294 216L294 208L302 206L304 198L312 199L316 191L324 194L330 188L337 193L345 189L350 196L358 194L361 202L369 203L370 211L378 214L376 222L383 227L379 235Z" fill="#33ff33" stroke="#1fc41f" stroke-width="6" stroke-linejoin="round"/><path d="M384 241L378 248L381 255L374 260L374 268L366 270L364 278L356 277L352 285L344 282L338 288L331 283L323 287L318 280L310 282L307 274L299 273L298 265L290 262L292 254L285 249L289 241L284 235L290 228L287 221L294 216L294 208L302 206L304 198L312 199L316 191L324 194L330 188L337 193L345 189L350 196L358 194L361 202L369 203L370 211L378 214L376 222L383 227L379 235Z" fill="url(#cfe-hl)"/><circle cx="238" cy="160" r="24" fill="#ffa31a" stroke="#d9850a" stroke-width="6"/><circle cx="168" cy="170" r="80" fill="#3b82f6" stroke="#2563c9" stroke-width="10"/><circle cx="168" cy="170" r="80" fill="url(#cfe-hl)"/><path d="M262 98h-42M268 114h-52M262 130h-36" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/><circle cx="336" cy="88" r="15" fill="#ffd43b" stroke="#d9b21c" stroke-width="5"/><circle cx="296" cy="112" r="38" fill="#3b82f6" stroke="#2563c9" stroke-width="8"/><circle cx="296" cy="112" r="38" fill="url(#cfe-hl)"/><circle cx="262" cy="222" r="10" fill="#3b82f6" stroke="#2563c9" stroke-width="4"/><circle cx="236" cy="212" r="10" fill="#3b82f6" stroke="#2563c9" stroke-width="4"/><g fill="#fff"><circle cx="142" cy="150" r="11"/><circle cx="194" cy="150" r="11"/></g><g fill="#1d1b26"><circle cx="145" cy="152" r="5"/><circle cx="197" cy="152" r="5"/></g><path d="M140 186q28 22 56 0" fill="none" stroke="#1d1b26" stroke-width="6" stroke-linecap="round"/></svg>`;
})();

