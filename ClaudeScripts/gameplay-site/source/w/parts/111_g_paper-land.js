
(() => {
  'use strict';
  const TAU = Math.PI * 2, PI = Math.PI;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';

  const CFG = {
    unit: 4,
    speed: 4.6,
    turn: 9.5,
    trailR: 1.5,
    depth: 1.25,
    blockDepth: 1.15,
    startR: 2.6,
    selfGap: 7,
    wallKill: 0.97,
    headR: 2.6,
    respawn: [2.5, 6],
    fov: 0.05,
    zoom: { desk: 5.8, phone: 5 },
    tick: 1 / 60,
    modes: {
      classic: { name: 'Classic', R: 50, bots: 12, speed: 1 },
      small: { name: 'Small', R: 30, bots: 10, speed: 1 },
      fast: { name: 'Fast', R: 50, bots: 12, speed: 1.5 }
    }
  };
  const MODE_KEYS = ['classic', 'small', 'fast'];
  const OUT = 255;

  const BASES = ['#ff5e5b', '#4d8dff', '#ffc93c', '#4cd47a', '#b066ff', '#ff9a3c', '#2ec4b6', '#ff6fb5', '#7a6cff', '#a5dd3b', '#3cc8f0', '#f0507a', '#ff7f66', '#5fe0b5', '#7cb7ff', '#d184ff'];
  const NAMES = ['Milo', 'Zara', 'Kenji', 'Lola', 'Ivan', 'Nora', 'Pablo', 'Yuki', 'Omar', 'Greta', 'Theo', 'Ines', 'Bruno', 'Mia', 'Leo', 'Sasha', 'Hugo', 'Aiko', 'Rafa', 'Elsa', 'Dante', 'Noor', 'Felix', 'Kaia', 'Otto', 'Luz', 'Ravi', 'Juno', 'Pip', 'Tess', 'Arlo', 'Vera', 'Nico', 'Wren', 'Cleo', 'Iggy', 'Mabel', 'Remy', 'Suki', 'Boxy', 'PaperKing', 'LoopLord', 'Inkster', 'Corners', 'Origami', 'Scissors', 'Crayon', 'Doodle', 'Sketchy', 'SquareOne', 'Fold', 'Tilly', 'Max', 'Anya', 'Kofi', 'Lars', 'Mina', 'Zed', 'Ozzy', 'Bea'];

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > PI) d -= TAU; else if (d < -PI) d += TAU; return d; };
  const easeBack = t => { const u = t - 1; return 1 + 2.70158 * u * u * u + 1.70158 * u * u; };
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixc = (a, b, t) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const rgba = (h, al) => { const A = rgb(h); return `rgba(${A[0]},${A[1]},${A[2]},${al})`; };
  const FACE_OF = ['eyes', 'cat', 'robot', 'cool', 'panda', 'happy', 'alien', 'frog', 'ninja', 'angry', 'pumpkin', 'star', 'cat', 'cool', 'happy', 'robot'];
  const SKINS = BASES.map((base, i) => ({ face: FACE_OF[i % FACE_OF.length],
    base, side: mixc(base, '#26204a', 0.3), trail: rgba(mixc(base, '#ffffff', 0.22), 0.6),
    block: mixc(base, '#26204a', 0.14), blockSide: mixc(base, '#26204a', 0.42), dark: mixc(base, '#1d1b3a', 0.42),
    light: mixc(base, '#ffffff', 0.5), hi: mixc(base, '#ffffff', 0.3)
  }));
  const fmtTime = s => { s = Math.floor(s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const fmtPct = v => (v >= 100 ? '100' : v.toFixed(2)) + '%';


  Ameplay.register({
    id: 'paper-land',
    title: 'Paper Land',
    category: 'Arcade',
    tint: '#ff5e5b',
    blurb: 'Leave your land, draw a loop and claim the map. Guard your trail!',
    help: 'Steer with the <kbd>mouse</kbd> or <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> / <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> · drag anywhere on touch · close loops to grab land, cut rival trails to kill',
    better: 'high',
    format: v => fmtPct(+v),
    width: 880,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 40c0-10 6-16 16-16h8v22H16c-4 0-6-2-6-6z" fill="currentColor" opacity=".3"/><path d="M34 30c4-12 18-14 20-4 2 9-8 16-20 16" stroke-width="5" opacity=".55"/><rect x="28" y="36" width="12" height="12" rx="3" fill="currentColor"/></svg>',
    css: '.gm-paper-land{gap:0}.gm-paper-land .g-canvas{box-shadow:0 14px 34px -20px rgba(60,70,120,.75);background:#dde2ec;cursor:default}',
    mount(root, api) {
      const portrait = (root.clientWidth || 880) < 600;
      const W = portrait ? 400 : 880, H = portrait ? 600 : 560;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      const keys = api.keys;
      const saved = api.load() || {};
      let skin = Number.isInteger(saved.skin) && saved.skin >= 0 && saved.skin < SKINS.length ? saved.skin : 0;
      let mode = CFG.modes[saved.mode] ? saved.mode : 'classic';
      const store = () => api.save({ skin, mode });

      let G = 0, C = 0, RM = 0, RC = 0, owner, tOwn, tSeq, mark, stack, stolen, gen = 1, total = 1, speed = 18;
      let players = [], human = null, ghosts = [], parts = [], floats = [], feed = [], banner = null, nameBag = [];
      let state = 'title', clock = 0, acc = 0, elapsed = 0, maxPct = 0, lastRank = 0, stateT = 0, submitted = false, newBest = false;
      let deathMsg = '', camBot = null, shake = 0;
      const cam = { x: 0, y: 0, s: 6, snap: true };
      const rank = [], drawList = [];
      let btns = [];
      const mouse = { x: W / 2, y: H / 2, kx: 0, ky: 0 };
      const touch = { id: null, ax: 0, ay: 0 };
      let inputMode = 'mouse';

      let actx = null;
      const audio = () => {
        if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
        if (actx && actx.state === 'suspended') actx.resume().catch(() => {});
        return actx;
      };
      const tone = (f0, f1, dur, type, vol, delay = 0) => {
        if (api.muted || !actx) return;
        const a = actx, t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
      };
      const noise = (dur, vol, freq) => {
        if (api.muted || !actx) return;
        const a = actx, n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
        s.buffer = buf; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start();
      };
      const sfx = {
        capture(k) { const b = 520 + Math.min(k, 8) * 40; tone(b, b * 1.5, 0.12, 'sine', 0.16); tone(b * 1.5, b * 2, 0.16, 'triangle', 0.1, 0.07); },
        kill() { tone(880, 1760, 0.09, 'square', 0.06); tone(660, 1320, 0.18, 'triangle', 0.14, 0.05); noise(0.12, 0.25, 2400); },
        die() { noise(0.35, 0.45, 1200); tone(420, 70, 0.5, 'sawtooth', 0.09); },
        pop() { tone(300, 160, 0.12, 'triangle', 0.08); },
        tap() { tone(700, 900, 0.05, 'sine', 0.07); },
        win() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f * 1.01, 0.32, 'triangle', 0.13, i * 0.11)); }
      };

      const tile = (px, draw) => { const c = document.createElement('canvas'); c.width = c.height = px; draw(c.getContext('2d'), px); return c; };
      const groundTile = tile(128, (g, n) => {
        g.fillStyle = '#f6f7fb'; g.fillRect(0, 0, n, n);
        g.fillStyle = '#eceef5';
        const dia = (x, y, r) => { g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); g.fill(); };
        dia(32, 32, 9); dia(96, 96, 9); dia(96, 32, 4); dia(32, 96, 4);
      });
      const outTile = tile(64, (g, n) => {
        g.fillStyle = '#d9deea'; g.fillRect(0, 0, n, n);
        g.strokeStyle = '#d1d7e5'; g.lineWidth = 10;
        for (let k = -1; k <= 2; k++) { g.beginPath(); g.moveTo(k * 32 - 8, n + 8); g.lineTo(k * 32 + n + 8, -8); g.stroke(); }
      });
      const patIn = ctx.createPattern(groundTile, 'repeat'), patOut = ctx.createPattern(outTile, 'repeat');
      try { patIn.setTransform(new DOMMatrix().scale(14 / 128)); patOut.setTransform(new DOMMatrix().scale(8 / 64)); } catch (e) {}

      const nextName = () => {
        if (!nameBag.length) { nameBag = NAMES.slice(); for (let i = nameBag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [nameBag[i], nameBag[j]] = [nameBag[j], nameBag[i]]; } }
        let n = nameBag.pop();
        if (players.some(p => p.name === n) && nameBag.length) n = nameBag.pop();
        return n;
      };
      const newAI = () => ({ mode: 'home', tt: rand(0, 0.15), want: 0, theta: 0, side: 1, d1: 0, d2: 0, travel: 0, homeT: 0, greed: rand(0.7, 1.5), aggro: rand(0.1, 0.9), caution: rand(0.7, 1.4), maxTrail: 0, target: null, chaseT: 0, hx: 0, hy: 0, hd: 0 });
      const makePlayer = (id, name, col, bot) => ({ id, name, col, bot, alive: false, x: 0, y: 0, a: 0, want: 0, odo: 0, trail: [], tcells: [], tbb: [0, 0, 0, 0], bb: [0, 0, 0, 0], count: 0, path: null, dirty: false, kills: 0, cx: 0, cy: 0, wall: false, respawnT: 0, born: -9, trailStart: 0, ai: bot ? newAI() : null });

      function newWorld(m, withHuman) {
        const M = CFG.modes[m], U = CFG.unit;
        RM = M.R * U; RC = RM - 1; G = Math.ceil(RM * 2) + 10; C = G / 2;
        const N = G * G;
        owner = new Uint8Array(N); tOwn = new Uint8Array(N); tSeq = new Float32Array(N); mark = new Int32Array(N); stack = new Int32Array(N); gen = 1;
        total = 0;
        for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
          const dx = i + 0.5 - C, dy = j + 0.5 - C;
          if (dx * dx + dy * dy > RM * RM) owner[j * G + i] = OUT; else total++;
        }
        speed = CFG.speed * U * M.speed;
        players = []; ghosts = []; parts = []; floats = []; feed = []; banner = null; human = null; camBot = null;
        const cols = [];
        for (let k = 0; k < SKINS.length; k++) if (!withHuman || k !== skin) cols.push(k);
        if (withHuman) {
          const cd = k => { const A = rgb(BASES[k]), B = rgb(BASES[skin]); return (A[0] - B[0]) ** 2 * 0.3 + (A[1] - B[1]) ** 2 * 0.59 + (A[2] - B[2]) ** 2 * 0.11; };
          cols.sort((x, y) => cd(y) - cd(x)); cols.length = Math.max(M.bots, cols.length - 3);
        }
        for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cols[i], cols[j]] = [cols[j], cols[i]]; }
        if (withHuman) { human = makePlayer(1, 'You', SKINS[skin], false); players.push(human); }
        for (let k = 0; k < M.bots; k++) players.push(makePlayer(players.length + 1, nextName(), SKINS[cols[k % cols.length]], true));
        stolen = new Int32Array(players.length + 1);
        if (human) spawn(human, [C + rand(-0.4, 0.4) * RM, C + rand(-0.4, 0.4) * RM]);
        for (const p of players) if (p.bot) { const s = pickSpot(p); if (s) spawn(p, s); else p.respawnT = 1; }
      }

      function pickSpot(p) {
        const U = CFG.unit, sr = CFG.startR * U, lim = RC - sr - 2 * U;
        let best = null, bs = 1e9;
        for (let k = 0; k < 70; k++) {
          const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * lim, x = C + Math.cos(a) * r, y = C + Math.sin(a) * r;
          let sc = 0;
          for (const q of players) if (q !== p && q.alive) { const d = Math.hypot(q.x - x, q.y - y); if (d < 12 * U) sc += (12 * U - d) * (q === human ? 400 : 20); }
          for (let dy = -sr; dy <= sr; dy += 2) for (let dx = -sr; dx <= sr; dx += 2) {
            if (dx * dx + dy * dy > sr * sr) continue;
            const c = ((y + dy) | 0) * G + ((x + dx) | 0), o = owner[c];
            if (tOwn[c]) sc += 1e6;
            if (o && o !== OUT) sc += human && o === human.id ? 1e6 : 40;
          }
          if (sc < bs) { bs = sc; best = [x, y]; }
        }
        return bs < 1e6 ? best : null;
      }

      function spawn(p, at) {
        const U = CFG.unit, sr = CFG.startR * U;
        p.alive = true; p.x = at[0]; p.y = at[1]; p.a = p.want = rand(-PI, PI); p.odo = 0; p.trail.length = 0; p.tcells.length = 0;
        p.wall = false; p.born = clock; p.count = 0;
        if (p.ai) { p.ai = Object.assign(newAI(), { greed: p.ai.greed, aggro: p.ai.aggro, caution: p.ai.caution }); }
        const i0 = Math.floor(p.x - sr), i1 = Math.floor(p.x + sr), j0 = Math.floor(p.y - sr), j1 = Math.floor(p.y + sr);
        stolen.fill(0);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const dx = i + 0.5 - p.x, dy = j + 0.5 - p.y;
          if (dx * dx + dy * dy > sr * sr) continue;
          const c = j * G + i, o = owner[c];
          if (o === OUT) continue;
          if (o && o !== p.id) stolen[o]++;
          owner[c] = p.id; p.count++;
        }
        p.bb = [i0, j0, i1, j1]; p.dirty = true;
        for (let o = 1; o < stolen.length; o++) if (stolen[o]) { const q = players[o - 1]; q.count -= stolen[o]; q.dirty = true; if (q.count <= 0) die(q, null, 'land'); }
        if (p.bot) plan(p);
      }

      let rowA = new Float32Array(256), rowB = new Float32Array(256), HR = [0, 1, 2, 3, 4].map(() => new Float32Array(256));
      const PB = new Float32Array(16);
      function hRow(R, j, x0, w, id) {
        const r = j * G + x0 - 1;
        for (let k = 0; k < w; k++) {
          const c = r + k;
          R[k] = (owner[c - 2] === id) + 4 * (owner[c - 1] === id) + 6 * (owner[c] === id) + 4 * (owner[c + 1] === id) + (owner[c + 2] === id);
        }
      }
      function vRow(S, j, w) {
        const a = HR[(j - 2) % 5], b = HR[(j - 1) % 5], c = HR[j % 5], d = HR[(j + 1) % 5], e = HR[(j + 2) % 5];
        for (let k = 0; k < w; k++) S[k] = (a[k] + 4 * b[k] + 6 * c[k] + 4 * d[k] + e[k]) / 256;
      }
      function poly(path, bx, by, a, b, c, d) {
        const A = a >= 0.5, B = b >= 0.5, Cc = c >= 0.5, D = d >= 0.5;
        let n = 0;
        if (A) { PB[n++] = 0; PB[n++] = 0; }
        if (A !== B) { PB[n++] = (0.5 - a) / (b - a); PB[n++] = 0; }
        if (B) { PB[n++] = 1; PB[n++] = 0; }
        if (B !== Cc) { PB[n++] = 1; PB[n++] = (0.5 - b) / (c - b); }
        if (Cc) { PB[n++] = 1; PB[n++] = 1; }
        if (Cc !== D) { PB[n++] = 1 - (0.5 - c) / (d - c); PB[n++] = 1; }
        if (D) { PB[n++] = 0; PB[n++] = 1; }
        if (D !== A) { PB[n++] = 0; PB[n++] = 1 - (0.5 - d) / (a - d); }
        path.moveTo(bx + PB[0], by + PB[1]);
        for (let k = 2; k < n; k += 2) path.lineTo(bx + PB[k], by + PB[k + 1]);
        path.closePath();
      }
      function buildPath(p) {
        const id = p.id, path = new Path2D(), bb = p.bb;
        const x0 = bb[0], y0 = bb[1], x1 = bb[2], y1 = bb[3], w = x1 - x0 + 3;
        if (rowA.length < w) { rowA = new Float32Array(w * 2); rowB = new Float32Array(w * 2); HR = HR.map(() => new Float32Array(w * 2)); }
        let RA = rowA, RB = rowB;
        for (let jj = y0 - 3; jj <= y0 + 1; jj++) hRow(HR[jj % 5], jj, x0, w, id);
        vRow(RA, y0 - 1, w);
        let nx0 = G, ny0 = G, nx1 = -1, ny1 = -1, sx = 0, sy = 0, n = 0;
        for (let j = y0 - 1; j <= y1; j++) {
          hRow(HR[(j + 3) % 5], j + 3, x0, w, id);
          vRow(RB, j + 1, w);
          const r0 = j * G;
          let run = -1;
          for (let i = x0 - 1; i <= x1; i++) {
            if (owner[r0 + i] === id) { n++; sx += i; sy += j; if (i < nx0) nx0 = i; if (i > nx1) nx1 = i; if (j < ny0) ny0 = j; if (j > ny1) ny1 = j; }
            const k = i - x0 + 1, a = RA[k], b = RA[k + 1], c = RB[k + 1], d = RB[k];
            const code = (a >= 0.5 ? 1 : 0) | (b >= 0.5 ? 2 : 0) | (c >= 0.5 ? 4 : 0) | (d >= 0.5 ? 8 : 0);
            if (code === 15) { if (run < 0) run = i; continue; }
            if (run >= 0) { path.rect(run + 0.5, j + 0.5, i - run, 1); run = -1; }
            if (code) poly(path, i + 0.5, j + 0.5, a, b, c, d);
          }
          if (run >= 0) path.rect(run + 0.5, j + 0.5, x1 + 1 - run, 1);
          const t = RA; RA = RB; RB = t;
        }
        p.dirty = false;
        p.count = n;
        if (!n) { p.path = null; return; }
        p.bb = [nx0, ny0, nx1, ny1]; p.cx = sx / n + 0.5; p.cy = sy / n + 0.5; p.path = path;
      }

      function stamp(p, x, y) {
        const r = CFG.trailR, r2 = r * r, id = p.id, b = p.tbb;
        const i0 = Math.floor(x - r), i1 = Math.floor(x + r), j0 = Math.floor(y - r), j1 = Math.floor(y + r);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const dx = i + 0.5 - x, dy = j + 0.5 - y;
          if (dx * dx + dy * dy > r2) continue;
          const c = j * G + i;
          if (tOwn[c] || owner[c] === id || owner[c] === OUT) continue;
          tOwn[c] = id; tSeq[c] = p.odo; p.tcells.push(c);
          if (i < b[0]) b[0] = i; if (i > b[2]) b[2] = i; if (j < b[1]) b[1] = j; if (j > b[3]) b[3] = j;
        }
      }

      function capture(p) {
        const id = p.id, g = ++gen;
        const x0 = Math.max(0, Math.min(p.bb[0], p.tbb[0]) - 1), y0 = Math.max(0, Math.min(p.bb[1], p.tbb[1]) - 1);
        const x1 = Math.min(G - 1, Math.max(p.bb[2], p.tbb[2]) + 1), y1 = Math.min(G - 1, Math.max(p.bb[3], p.tbb[3]) + 1);
        let sp = 0;
        const seed = c => { if (mark[c] !== g && owner[c] !== id && tOwn[c] !== id) { mark[c] = g; stack[sp++] = c; } };
        for (let i = x0; i <= x1; i++) { seed(y0 * G + i); seed(y1 * G + i); }
        for (let j = y0; j <= y1; j++) { seed(j * G + x0); seed(j * G + x1); }
        while (sp) {
          const c = stack[--sp], i = c % G, j = (c - i) / G;
          let n;
          if (i > x0) { n = c - 1; if (mark[n] !== g && owner[n] !== id && tOwn[n] !== id) { mark[n] = g; stack[sp++] = n; } }
          if (i < x1) { n = c + 1; if (mark[n] !== g && owner[n] !== id && tOwn[n] !== id) { mark[n] = g; stack[sp++] = n; } }
          if (j > y0) { n = c - G; if (mark[n] !== g && owner[n] !== id && tOwn[n] !== id) { mark[n] = g; stack[sp++] = n; } }
          if (j < y1) { n = c + G; if (mark[n] !== g && owner[n] !== id && tOwn[n] !== id) { mark[n] = g; stack[sp++] = n; } }
        }
        stolen.fill(0);
        let gained = 0;
        const bb = p.bb;
        for (let j = y0 + 1; j < y1; j++) {
          const r = j * G;
          for (let i = x0 + 1; i < x1; i++) {
            const c = r + i;
            if (mark[c] === g) continue;
            const o = owner[c];
            if (o === id || o === OUT) continue;
            if (o) stolen[o]++;
            owner[c] = id; gained++;
            if (i < bb[0]) bb[0] = i; if (i > bb[2]) bb[2] = i; if (j < bb[1]) bb[1] = j; if (j > bb[3]) bb[3] = j;
          }
        }
        for (const c of p.tcells) if (tOwn[c] === id) tOwn[c] = 0;
        p.tcells.length = 0; p.trail.length = 0;
        if (gained > 0 && p.path) {
          let R2 = 0;
          for (const [qx, qy] of [[bb[0], bb[1]], [bb[2] + 1, bb[1]], [bb[0], bb[3] + 1], [bb[2] + 1, bb[3] + 1]]) R2 = Math.max(R2, Math.hypot(qx - p.x, qy - p.y));
          p.cap = { old: p.cap ? p.cap.old : p.path, x: p.x, y: p.y, t: 0, R: R2 + 1 };
        }
        p.count += gained; p.dirty = true;
        for (let o = 1; o < stolen.length; o++) if (stolen[o]) {
          const q = players[o - 1];
          q.count -= stolen[o]; q.dirty = true;
          if (q.count <= 0 && q.alive) die(q, p, 'land');
        }
        if (p === human && gained > 0) {
          const pct = gained / total * 100;
          floats.push({ x: p.x, y: p.y, text: '+' + (pct < 0.01 ? '0.01' : pct.toFixed(2)) + '%', col: '#ffffff', oc: p.col.dark, t: 0, life: 1.3, size: 24 });
          sfx.capture(Math.floor(pct * 2));
          if (p.count >= total) win();
        }
      }

      function die(p, by, why) {
        if (!p.alive) return;
        p.alive = false;
        for (const c of p.tcells) if (tOwn[c] === p.id) tOwn[c] = 0;
        if (p.count > 0) {
          const b = p.bb;
          let nf = 0;
          const fr = Math.min(1, 40 / Math.max(1, p.count));
          for (let j = b[1]; j <= b[3]; j++) for (let i = b[0]; i <= b[2]; i++) {
            const c = j * G + i;
            if (owner[c] !== p.id) continue;
            owner[c] = 0;
            if (nf < 60 && Math.random() < fr) { nf++; parts.push({ x: i + 0.5, y: j + 0.5, vx: rand(-5, 5), vy: rand(-9, -2), t: 0, life: rand(0.45, 0.95), s: rand(1.4, 2.6), r: rand(0, TAU), vr: rand(-6, 6), col: nf & 1 ? p.col.base : p.col.side }); }
          }
          if (p.path) ghosts.push({ path: p.path, col: p.col, t: 0, cx: p.cx, cy: p.cy });
        }
        p.path = null; p.cap = null; p.count = 0; p.dirty = false; p.trail.length = 0; p.tcells.length = 0;
        for (let k = 0; k < 22; k++) {
          const a = rand(0, TAU), v = rand(6, 22);
          parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, t: 0, life: rand(0.5, 1), s: rand(0.6, 1.4), r: rand(0, TAU), vr: rand(-10, 10), col: k % 4 ? p.col.base : k % 8 ? '#ffffff' : p.col.blockSide });
        }
        parts.push({ ring: true, x: p.x, y: p.y, t: 0, life: 0.45, col: p.col.base });
        const killer = by && by !== p ? by : null;
        const text = killer ? (why === 'land' ? ' took all land of ' : ' killed ') : why === 'self' ? ' crossed own trail' : why === 'wall' ? ' hit the wall' : ' was wiped out';
        feed.push({ a: killer ? killer.name : p.name, ac: killer ? killer.col.dark : p.col.dark, mid: text, b: killer ? p.name : '', bc: p.col.dark, t: 0 });
        if (feed.length > 4) feed.shift();
        if (killer) {
          killer.kills++;
          if (killer === human) {
            banner = { text: 'You killed ' + p.name + '!', col: p.col.base, t: 0 };
            floats.push({ x: human.x, y: human.y - 3, text: '+1 kill', col: '#ffffff', oc: '#e8344a', t: 0, life: 1.2, size: 22 });
            sfx.kill(); shake = Math.max(shake, 0.6);
          }
        }
        if (p === human) {
          deathMsg = killer ? (why === 'land' ? killer.name + ' took all your land' : 'Killed by ' + killer.name) : why === 'self' ? 'You crossed your own trail' : why === 'wall' ? 'You hit the wall' : 'Your land was wiped out';
          if (state === 'play') { state = 'dying'; stateT = 0; }
          sfx.die(); shake = 1.4;
        } else {
          p.respawnT = rand(CFG.respawn[0], CFG.respawn[1]);
          if (human && Math.abs(p.x - cam.x) * cam.s < W && Math.abs(p.y - cam.y) * cam.s < H) sfx.pop();
        }
      }

      function move(p, dt) {
        const d = angDiff(p.want, p.a), mt = CFG.turn * dt;
        p.a += d > mt ? mt : d < -mt ? -mt : d;
        if (p.a > PI) p.a -= TAU; else if (p.a < -PI) p.a += TAU;
        const v = speed * dt, ox = p.x, oy = p.y;
        let nx = ox + Math.cos(p.a) * v, ny = oy + Math.sin(p.a) * v;
        const dx = nx - C, dy = ny - C, dd = Math.hypot(dx, dy);
        if (dd > RC) {
          const ux = dx / dd, uy = dy / dd, ca = Math.cos(p.a), sa = Math.sin(p.a);
          if (!p.wall && ca * ux + sa * uy > CFG.wallKill) { die(p, null, 'wall'); return; }
          nx = C + ux * RC; ny = C + uy * RC;
          p.a = Math.atan2(uy, ux) + (-ca * uy + sa * ux > 0 ? PI / 2 : -PI / 2);
          p.wall = true;
        } else p.wall = false;
        p.odo += Math.hypot(nx - ox, ny - oy);
        p.x = nx; p.y = ny;
        const c = (ny | 0) * G + (nx | 0), t = tOwn[c];
        if (t) {
          if (t !== p.id) die(players[t - 1], p, 'trail');
          else if (p.odo - tSeq[c] > CFG.selfGap) { die(p, p, 'self'); return; }
        }
        if (owner[c] === p.id) { if (p.trail.length) capture(p); return; }
        const tr = p.trail;
        if (!tr.length) {
          tr.push(ox, oy); p.trailStart = p.odo;
          p.tbb[0] = p.tbb[2] = nx | 0; p.tbb[1] = p.tbb[3] = ny | 0;
          if (p.bot && p.ai.mode === 'home') { p.ai.mode = 'out'; p.ai.travel = 0; }
        }
        stamp(p, nx, ny);
        const n = tr.length, lx = tr[n - 2], ly = tr[n - 1];
        if ((nx - lx) * (nx - lx) + (ny - ly) * (ny - ly) > 0.36) tr.push(nx, ny);
        if (p.bot) p.ai.travel += v;
      }

      function headOn() {
        const r2 = CFG.headR * CFG.headR;
        for (let i = 0; i < players.length; i++) {
          const a = players[i];
          if (!a.alive) continue;
          for (let j = i + 1; j < players.length && a.alive; j++) {
            const b = players[j];
            if (!b.alive) continue;
            const dx = a.x - b.x, dy = a.y - b.y;
            if (dx * dx + dy * dy > r2) continue;
            const ha = owner[(a.y | 0) * G + (a.x | 0)] === a.id, hb = owner[(b.y | 0) * G + (b.x | 0)] === b.id;
            if (ha && !hb) die(b, a, 'head');
            else if (hb && !ha) die(a, b, 'head');
            else if (!ha && !hb) { die(a, b, 'head'); die(b, a, 'head'); }
          }
        }
      }

      function plan(b) {
        const ai = b.ai, U = CFG.unit;
        let best = -1e9, bt = 0;
        for (let k = 0; k < 12; k++) {
          const a = k / 12 * TAU + rand(-0.2, 0.2), ca = Math.cos(a), sa = Math.sin(a);
          let sc = rand(0, 3);
          for (let r = 8; r <= 48; r += 8) {
            const x = b.x + ca * r, y = b.y + sa * r, dx = x - C, dy = y - C;
            if (dx * dx + dy * dy > (RC - 2 * U) * (RC - 2 * U)) { sc -= 7; break; }
            const o = owner[(y | 0) * G + (x | 0)];
            if (o === 0) sc += 1; else if (o !== b.id) sc += 1 + ai.aggro;
          }
          for (const q of players) if (q !== b && q.alive) {
            const qx = q.x - b.x, qy = q.y - b.y, d = Math.hypot(qx, qy);
            if (d < 14 * U && (qx * ca + qy * sa) / (d || 1) > 0.5) sc -= 2.5 * ai.caution;
          }
          if (sc > best) { best = sc; bt = a; }
        }
        const big = 1 + Math.sqrt(b.count / total) * 1.8;
        ai.mode = 'home'; ai.theta = bt; ai.side = Math.random() < 0.5 ? 1 : -1; ai.homeT = 0;
        ai.d1 = rand(2.5, 7) * U * ai.greed * big; ai.d2 = rand(2.5, 8) * U * ai.greed * big;
        ai.maxTrail = (ai.d1 + ai.d2) * 2.6 + 8 * U;
      }
      function findHome(b) {
        const ai = b.ai;
        let best = 1e9; ai.hx = b.cx; ai.hy = b.cy; ai.hd = Math.hypot(b.cx - b.x, b.cy - b.y);
        for (let k = 0; k < 20; k++) {
          const a = k / 20 * TAU, ca = Math.cos(a), sa = Math.sin(a), turn = Math.abs(angDiff(a, b.a)) * 7;
          for (let r = 2; r < 240; r += 1.5) {
            const x = b.x + ca * r, y = b.y + sa * r, c = (y | 0) * G + (x | 0), o = owner[c];
            if (o === OUT) break;
            if (o === b.id) { if (r + turn < best) { best = r + turn; ai.hx = x + ca * 2; ai.hy = y + sa * 2; ai.hd = r; } break; }
            if (tOwn[c] === b.id && b.odo - tSeq[c] > CFG.selfGap) break;
          }
        }
      }
      function dangerDist(b) {
        let m = 1e12;
        const t = b.trail, n = t.length;
        for (const e of players) {
          if (e === b || !e.alive) continue;
          let dx = e.x - b.x, dy = e.y - b.y, d = dx * dx + dy * dy;
          for (let k = 0; k < n; k += 6) { dx = e.x - t[k]; dy = e.y - t[k + 1]; const q = dx * dx + dy * dy; if (q < d) d = q; }
          if (d < m) m = d;
        }
        return Math.sqrt(m);
      }
      function nearestTrail(b, radius, only) {
        let bd = radius * radius, res = null;
        for (const e of players) {
          if (e === b || !e.alive || !e.trail.length || (only && e !== only)) continue;
          const t = e.trail, f = e === human ? 0.7 : 1;
          for (let k = 0; k < t.length; k += 4) {
            const dx = t[k] - b.x, dy = t[k + 1] - b.y, d = (dx * dx + dy * dy) * f;
            if (d < bd) { bd = d; res = { p: e, x: t[k], y: t[k + 1] }; }
          }
        }
        return res;
      }
      function trailFree(b, a) {
        const ca = Math.cos(a), sa = Math.sin(a);
        for (let r = 3; r <= 11; r += 4) {
          const x = b.x + ca * r, y = b.y + sa * r, c = (y | 0) * G + (x | 0);
          if (owner[c] === OUT) return false;
          if (tOwn[c] === b.id && b.odo - tSeq[c] > CFG.selfGap) return false;
        }
        return true;
      }
      function think(b, dt) {
        const ai = b.ai, U = CFG.unit, out = b.trail.length > 0, len = out ? b.odo - b.trailStart : 0;
        let want = ai.want;
        if (!out && ai.mode !== 'home' && ai.mode !== 'chase') plan(b);
        if (!out) { ai.homeT += dt; if (ai.mode === 'home' && ai.homeT > 6) plan(b); }
        if (!out && ai.mode !== 'chase' && clock - b.born > 1.5) {
          for (const e of players) {
            if (e === b || !e.alive || !e.trail.length) continue;
            const inMine = owner[(e.y | 0) * G + (e.x | 0)] === b.id, dd = Math.hypot(e.x - b.x, e.y - b.y);
            if ((inMine && dd < 30 * U) || (dd < (8 + 10 * ai.aggro) * U && e.odo - e.trailStart > 5 * U)) {
              if (Math.random() < (inMine ? 0.6 : 0.2) + ai.aggro * 0.3) { ai.mode = 'chase'; ai.target = e; ai.chaseT = 0; }
              break;
            }
          }
        }
        if (ai.mode !== 'chase' && ai.mode !== 'back' && len < 6 * U && clock - b.born > 2.5 && Math.random() < ai.aggro * 0.12) {
          const t = nearestTrail(b, (6 + 8 * ai.aggro) * U, null), e = t && t.p;
          if (e && e.odo - e.trailStart > 3 * U && Math.hypot(t.x - b.x, t.y - b.y) < Math.hypot(e.x - e.trail[0], e.y - e.trail[1]) * 1.3 + 2 * U) { ai.mode = 'chase'; ai.target = e; ai.chaseT = 0; }
        }
        if (ai.mode === 'chase') {
          ai.chaseT += dt;
          const t = ai.target && ai.target.alive && ai.target.trail.length ? nearestTrail(b, 40 * U, ai.target) : null;
          if (!t || ai.chaseT > 5 || len > 16 * U || (out && dangerDist(b) < 2.5 * U)) {
            ai.target = null;
            if (out) ai.mode = 'back'; else plan(b);
          } else want = Math.atan2(t.y - b.y, t.x - b.x);
        }
        if (out && ai.mode !== 'chase') {
          if (ai.mode === 'home') { ai.mode = 'out'; ai.travel = 0; }
          findHome(b);
          if (ai.mode !== 'back' && (dangerDist(b) < ai.hd * ai.caution + 1.5 * U || len > ai.maxTrail)) ai.mode = 'back';
          if (ai.mode === 'out' && ai.travel >= ai.d1) { ai.mode = 'side'; ai.travel = 0; }
          if (ai.mode === 'side' && ai.travel >= ai.d2) ai.mode = 'back';
          want = ai.mode === 'out' ? ai.theta : ai.mode === 'side' ? ai.theta + ai.side * PI / 2 : Math.atan2(ai.hy - b.y, ai.hx - b.x);
        } else if (!out && ai.mode === 'home') want = ai.theta;
        const look = 4 * U, px = b.x + Math.cos(want) * look - C, py = b.y + Math.sin(want) * look - C;
        if (px * px + py * py > (RC - U) * (RC - U)) {
          const ra = Math.atan2(b.y - C, b.x - C), t1 = ra + PI / 2 + 0.35, t2 = ra - PI / 2 - 0.35;
          want = Math.abs(angDiff(t1, want)) < Math.abs(angDiff(t2, want)) ? t1 : t2;
          if (!out && ai.mode === 'home') ai.theta = want;
        }
        if (out && !trailFree(b, want)) {
          for (let d = 0.5; d < 3; d += 0.5) {
            if (trailFree(b, want + d)) { want += d; break; }
            if (trailFree(b, want - d)) { want -= d; break; }
          }
        }
        ai.want = want;
      }

      function startGame() {
        newWorld(mode, true);
        state = 'play'; stateT = 0; elapsed = 0; submitted = false; newBest = false; lastRank = 0; acc = 0;
        maxPct = human.count / total * 100;
        api.score(+maxPct.toFixed(2));
        cam.snap = true; touch.id = null;
        sfx.tap();
      }
      function toTitle() {
        newWorld(mode, false);
        state = 'title'; stateT = 0; cam.snap = true;
      }
      function finishRun() {
        if (submitted) return;
        submitted = true;
        newBest = api.submit(+Math.max(0.01, maxPct).toFixed(2));
      }
      function win() {
        if (state !== 'play') return;
        maxPct = 100; api.score(100);
        state = 'win'; stateT = 0;
        finishRun();
        sfx.win();
        for (let k = 0; k < 90; k++) parts.push({ conf: true, x: rand(0, W), y: rand(-H * 0.6, 0), vx: rand(-40, 40), vy: rand(80, 200), t: 0, life: rand(2.5, 4), s: rand(5, 9), r: rand(0, TAU), vr: rand(-6, 6), col: BASES[k % BASES.length] });
      }

      function step(dt) {
        clock += dt;
        for (const p of players) {
          if (!p.alive) {
            if (p.bot && (p.respawnT -= dt) <= 0) {
              const s = pickSpot(p);
              if (s) { p.name = nextName(); spawn(p, s); } else p.respawnT = 1.5;
            }
            continue;
          }
          if (p.bot) {
            if ((p.ai.tt -= dt) <= 0) { const iv = rand(0.08, 0.16); think(p, iv); p.ai.tt = iv; }
            p.want = p.ai.want;
          } else steerHuman(p);
          move(p, dt);
        }
        headOn();
        if (human && human.alive && state === 'play') {
          elapsed += dt;
          const pct = human.count / total * 100;
          if (pct > maxPct + 0.004) { maxPct = Math.min(100, pct); api.score(+maxPct.toFixed(2)); }
        }
      }

      const STEER = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, KeyA: 1, KeyD: 1, KeyW: 1, KeyS: 1 };
      function keyDir() {
        let dx = 0, dy = 0;
        if (keys.has('ArrowLeft') || keys.has('KeyA')) dx--;
        if (keys.has('ArrowRight') || keys.has('KeyD')) dx++;
        if (keys.has('ArrowUp') || keys.has('KeyW')) dy--;
        if (keys.has('ArrowDown') || keys.has('KeyS')) dy++;
        return dx || dy ? Math.atan2(dy, dx) : null;
      }
      function steerHuman(p) {
        if (state !== 'play') return;
        if (inputMode === 'keys') { const a = keyDir(); if (a !== null) p.want = a; }
        else if (inputMode === 'mouse') {
          const sx = (p.x - cam.x) * cam.s + W / 2, sy = (p.y - cam.y) * cam.s + H / 2, dx = mouse.x - sx, dy = mouse.y - sy;
          if (dx * dx + dy * dy > 36) p.want = Math.atan2(dy, dx);
        }
      }

      const hit = pt => { for (const b of btns) if (pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h) return b; return null; };
      api.on(canvas, 'pointerdown', e => {
        audio();
        const pt = toLocal(e);
        if (e.pointerType === 'mouse') { mouse.x = pt.x; mouse.y = pt.y; }
        if (state === 'title' || state === 'over' || state === 'win') {
          e.preventDefault();
          const b = hit(pt);
          if (b) { b.act(); if (state !== 'play') sfx.tap(); }
          else if (state === 'title') startGame();
          if (state === 'play' && e.pointerType !== 'mouse') { touch.id = e.pointerId; touch.ax = pt.x; touch.ay = pt.y; inputMode = 'touch'; }
          return;
        }
        if (state === 'play') {
          if (e.pointerType === 'mouse') inputMode = 'mouse';
          else { e.preventDefault(); touch.id = e.pointerId; touch.ax = pt.x; touch.ay = pt.y; inputMode = 'touch'; }
        }
      });
      api.on(canvas, 'pointermove', e => {
        const pt = toLocal(e);
        if (e.pointerType === 'mouse') {
          mouse.x = pt.x; mouse.y = pt.y;
          if (inputMode === 'keys' && Math.hypot(pt.x - mouse.kx, pt.y - mouse.ky) > 14) inputMode = 'mouse';
          canvas.style.cursor = state !== 'play' && state !== 'dying' && hit(pt) ? 'pointer' : 'default';
          return;
        }
        if (touch.id !== e.pointerId || state !== 'play' || !human) return;
        const dx = pt.x - touch.ax, dy = pt.y - touch.ay, d = Math.hypot(dx, dy);
        if (d > 5) { human.want = Math.atan2(dy, dx); inputMode = 'touch'; }
        if (d > 34) { touch.ax = pt.x - dx / d * 34; touch.ay = pt.y - dy / d * 34; }
      });
      const lift = e => { if (touch.id === e.pointerId) touch.id = null; };
      api.on(canvas, 'pointerup', lift);
      api.on(canvas, 'pointercancel', lift);
      api.on(canvas, 'contextmenu', e => e.preventDefault());
      api.on(window, 'keydown', e => {
        audio();
        const k = e.code;
        if (state === 'title') { if (!e.repeat && k !== 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) startGame(); return; }
        if (state === 'over' || state === 'win') { if ((k === 'Enter' || k === 'Space') && stateT > 0.5) startGame(); return; }
        if (state === 'play' && STEER[k] && human) {
          inputMode = 'keys'; mouse.kx = mouse.x; mouse.ky = mouse.y;
          const a = keyDir(); if (a !== null) human.want = a;
        }
      });

      const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
      const text = (s, x, y, size, col, align = 'center', weight = 900, outline = null, ow = 0) => {
        ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
        if (outline) { ctx.lineJoin = 'round'; ctx.lineWidth = ow || size * 0.22; ctx.strokeStyle = outline; ctx.strokeText(s, x, y); }
        ctx.fillStyle = col; ctx.fillText(s, x, y);
      };
      const fit = (s, maxW, size) => {
        ctx.font = `900 ${size}px ${FONT}`;
        if (ctx.measureText(s).width <= maxW) return s;
        while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
        return s + '…';
      };

      function drawBlock(x, y, a, col, sc, crown) {
        const S = CFG.unit * sc, h = S / 2, r = S * 0.26, dep = CFG.blockDepth * sc;
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = 'rgba(34,36,80,.16)';
        ctx.beginPath(); ctx.ellipse(0, dep + h * 0.2, h * 1.1, h * 0.85, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = col.blockSide;
        for (let k = 2; k >= 1; k--) { ctx.save(); ctx.translate(0, dep * k / 2); ctx.rotate(a); rr(-h, -h, S, S, r); ctx.fill(); ctx.restore(); }
        ctx.rotate(a);
        ctx.fillStyle = col.block; rr(-h, -h, S, S, r); ctx.fill();
        ctx.strokeStyle = col.hi; ctx.lineWidth = 0.32 * sc; rr(-h + 0.3 * sc, -h + 0.3 * sc, S - 0.6 * sc, S - 0.6 * sc, r * 0.8); ctx.stroke();
        drawFace(col.face, h, col);
        ctx.restore();
        if (crown) {
          ctx.save(); ctx.translate(x, y - h - dep - 1.4 * sc);
          ctx.fillStyle = '#ffcf33'; ctx.strokeStyle = '#c88a10'; ctx.lineWidth = 0.25; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(-1.6, 0.8); ctx.lineTo(-1.8, -1); ctx.lineTo(-0.8, -0.1); ctx.lineTo(0, -1.4); ctx.lineTo(0.8, -0.1); ctx.lineTo(1.8, -1); ctx.lineTo(1.6, 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.restore();
        }
      }

      function drawFace(f, h, col) {
        const INK = '#1d1b2e', c = ctx;
        const circ = (x, y, rad, fs) => { c.fillStyle = fs; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
        const eyes = (r1, r2, x = 0.3, y = 0.4) => { for (let s = -1; s <= 1; s += 2) { circ(h * x, s * h * y, h * r1, '#fff'); circ(h * (x + 0.12), s * h * y, h * r2, INK); circ(h * (x + 0.17), s * h * y - h * 0.06, h * r2 * 0.35, '#fff'); } };
        const blush = () => { c.fillStyle = 'rgba(255,140,160,.5)'; c.beginPath(); c.ellipse(-h * 0.05, -h * 0.7, h * 0.18, h * 0.12, 0, 0, TAU); c.ellipse(-h * 0.05, h * 0.7, h * 0.18, h * 0.12, 0, 0, TAU); c.fill(); };
        const mouth = (rad, a0, a1, w) => { c.strokeStyle = INK; c.lineWidth = h * (w || 0.12); c.lineCap = 'round'; c.beginPath(); c.arc(h * 0.02, 0, h * rad, PI - a0, PI + a1); c.stroke(); };
        c.lineJoin = 'round';
        switch (f) {
          case 'cat': {
            c.fillStyle = col.blockSide;
            for (let s = -1; s <= 1; s += 2) { c.beginPath(); c.moveTo(h * 0.05, s * h * 0.98); c.lineTo(h * 0.7, s * h * 0.98); c.lineTo(h * 1.12, s * h * 1.18); c.closePath(); c.fill(); c.fillStyle = '#ff9db4'; c.beginPath(); c.moveTo(h * 0.3, s * h * 0.95); c.lineTo(h * 0.62, s * h * 0.95); c.lineTo(h * 0.85, s * h * 1.05); c.closePath(); c.fill(); c.fillStyle = col.blockSide; }
            for (let s = -1; s <= 1; s += 2) { circ(h * 0.25, s * h * 0.4, h * 0.27, '#f6ffb0'); c.fillStyle = INK; c.beginPath(); c.ellipse(h * 0.3, s * h * 0.4, h * 0.07, h * 0.2, 0, 0, TAU); c.fill(); }
            c.fillStyle = '#ff7a9a'; c.beginPath(); c.moveTo(h * 0.62, 0); c.lineTo(h * 0.45, -h * 0.13); c.lineTo(h * 0.45, h * 0.13); c.closePath(); c.fill();
            c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = h * 0.06;
            for (let s = -1; s <= 1; s += 2) for (const d of [-0.12, 0.12]) { c.beginPath(); c.moveTo(h * 0.5, s * h * 0.3); c.lineTo(h * (0.62 + d), s * h * 0.92); c.stroke(); }
            break;
          }
          case 'robot': {
            c.fillStyle = '#26304a'; rr(h * 0.02, -h * 0.72, h * 0.72, h * 1.44, h * 0.18); c.fill();
            c.fillStyle = '#5ff2ff'; for (let s = -1; s <= 1; s += 2) { rr(h * 0.24, s * h * 0.38 - h * 0.14, h * 0.32, h * 0.28, h * 0.06); c.fill(); }
            c.strokeStyle = col.dark; c.lineWidth = h * 0.1; c.beginPath(); c.moveTo(-h * 0.2, 0); c.lineTo(-h * 0.7, 0); c.stroke();
            circ(-h * 0.72, 0, h * 0.14, '#ff4d6d');
            break;
          }
          case 'cool': {
            blush();
            c.fillStyle = INK;
            for (let s = -1; s <= 1; s += 2) { rr(h * 0.12, s * h * 0.42 - h * 0.26, h * 0.42, h * 0.52, h * 0.16); c.fill(); }
            c.fillRect(h * 0.32, -h * 0.18, h * 0.1, h * 0.36);
            c.fillStyle = 'rgba(255,255,255,.55)'; for (let s = -1; s <= 1; s += 2) c.fillRect(h * 0.38, s * h * 0.42 - h * 0.18, h * 0.08, h * 0.16);
            mouth(0.34, 0.7, 0.7);
            break;
          }
          case 'panda': {
            circ(h * 0.1, 0, h * 0.82, '#ffffff');
            c.fillStyle = INK; for (let s = -1; s <= 1; s += 2) { circ(-h * 0.55, s * h * 0.8, h * 0.3, INK); c.beginPath(); c.ellipse(h * 0.3, s * h * 0.38, h * 0.26, h * 0.2, s * 0.5, 0, TAU); c.fill(); circ(h * 0.36, s * h * 0.38, h * 0.08, '#fff'); }
            circ(h * 0.62, 0, h * 0.12, INK);
            break;
          }
          case 'happy': {
            blush();
            c.strokeStyle = INK; c.lineWidth = h * 0.13; c.lineCap = 'round';
            for (let s = -1; s <= 1; s += 2) { c.beginPath(); c.arc(h * 0.36, s * h * 0.4, h * 0.17, -PI / 2 - 1.2, -PI / 2 + 1.2); c.stroke(); }
            c.fillStyle = '#d6304a'; c.beginPath(); c.arc(h * 0.05, 0, h * 0.34, PI / 2, PI * 1.5); c.closePath(); c.fill();
            c.fillStyle = '#ff8fa3'; c.beginPath(); c.arc(-h * 0.14, 0, h * 0.13, 0, TAU); c.fill();
            break;
          }
          case 'alien': {
            c.fillStyle = INK;
            for (let s = -1; s <= 1; s += 2) { c.beginPath(); c.ellipse(h * 0.32, s * h * 0.38, h * 0.36, h * 0.2, s * 0.55, 0, TAU); c.fill(); circ(h * 0.42, s * h * 0.3, h * 0.07, '#fff'); }
            c.strokeStyle = INK; c.lineWidth = h * 0.08; c.beginPath(); c.moveTo(-h * 0.3, -h * 0.12); c.lineTo(-h * 0.3, h * 0.12); c.stroke();
            break;
          }
          case 'frog': {
            for (let s = -1; s <= 1; s += 2) { circ(h * 0.45, s * h * 0.62, h * 0.38, col.blockSide); circ(h * 0.45, s * h * 0.62, h * 0.3, '#fff'); circ(h * 0.55, s * h * 0.62, h * 0.15, INK); }
            c.strokeStyle = INK; c.lineWidth = h * 0.1; c.lineCap = 'round'; c.beginPath(); c.arc(h * 0.35, 0, h * 0.62, PI - 0.55, PI + 0.55); c.stroke();
            blush();
            break;
          }
          case 'ninja': {
            c.fillStyle = INK; c.fillRect(h * 0.08, -h, h * 0.62, S2(h));
            c.fillStyle = '#e8344a'; c.fillRect(-h * 0.22, -h, h * 0.2, S2(h)); c.beginPath(); c.moveTo(-h * 0.12, h * 0.95); c.lineTo(-h * 0.5, h * 1.35); c.lineTo(-h * 0.2, h * 1.4); c.closePath(); c.fill();
            c.fillStyle = '#ffffff'; for (let s = -1; s <= 1; s += 2) { c.beginPath(); c.ellipse(h * 0.4, s * h * 0.36, h * 0.12, h * 0.24, 0, 0, TAU); c.fill(); }
            break;
          }
          case 'angry': {
            eyes(0.27, 0.13);
            c.strokeStyle = INK; c.lineWidth = h * 0.14; c.lineCap = 'round';
            for (let s = -1; s <= 1; s += 2) { c.beginPath(); c.moveTo(h * 0.56, s * h * 0.14); c.lineTo(h * 0.78, s * h * 0.7); c.stroke(); }
            c.beginPath(); c.arc(-h * 0.45, 0, h * 0.3, -0.8, 0.8); c.stroke();
            break;
          }
          case 'pumpkin': {
            c.fillStyle = 'rgba(0,0,0,.12)'; for (const y of [-0.5, 0, 0.5]) c.fillRect(-h, y * h - h * 0.04, S2(h), h * 0.08);
            c.fillStyle = '#2a1a10';
            for (let s = -1; s <= 1; s += 2) { c.beginPath(); c.moveTo(h * 0.65, s * h * 0.4); c.lineTo(h * 0.2, s * h * 0.62); c.lineTo(h * 0.2, s * h * 0.18); c.closePath(); c.fill(); }
            c.beginPath(); c.moveTo(-h * 0.1, -h * 0.55);
            for (let k = 0; k <= 6; k++) c.lineTo(k & 1 ? -h * 0.3 : -h * 0.5, -h * 0.55 + k * h * 0.183);
            c.lineTo(-h * 0.1, h * 0.55); c.closePath(); c.fill();
            break;
          }
          case 'star': {
            c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath();
            for (let k = 0; k < 10; k++) { const rr2 = k & 1 ? h * 0.32 : h * 0.78, an = k / 10 * TAU - PI / 2; c.lineTo(Math.cos(an) * rr2 - h * 0.05, Math.sin(an) * rr2); }
            c.closePath(); c.fill();
            for (let s = -1; s <= 1; s += 2) circ(h * 0.08, s * h * 0.17, h * 0.08, INK);
            break;
          }
          default: {
            blush();
            eyes(0.3, 0.15);
            mouth(0.3, 0.85, 0.85);
          }
        }
      }
      const S2 = h => h * 2;
      const CAPT = 0.5;
      function fillLand(p) {
        const cp = p.cap;
        if (!cp) { ctx.fill(p.path); return; }
        if (cp.old) ctx.fill(cp.old);
        ctx.save(); ctx.beginPath(); ctx.arc(cp.x, cp.y, Math.max(0.1, cp.R * easeOut(cp.t / CAPT)), 0, TAU); ctx.clip(); ctx.fill(p.path); ctx.restore();
      }
      const easeOut = t => { t = Math.min(1, t); return 1 - (1 - t) * (1 - t) * (1 - t); };
      function drawWorld(dpr) {
        const s = cam.s, sh = shake > 0 ? shake * 3 : 0;
        const ox = W / 2 - cam.x * s + (sh ? rand(-sh, sh) : 0), oy = H / 2 - cam.y * s + (sh ? rand(-sh, sh) : 0);
        ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
        const vx0 = cam.x - W / 2 / s - 6, vx1 = cam.x + W / 2 / s + 6, vy0 = cam.y - H / 2 / s - 6, vy1 = cam.y + H / 2 / s + 6;
        const vis = b => b[2] >= vx0 && b[0] <= vx1 && b[3] >= vy0 - 3 && b[1] <= vy1;
        ctx.fillStyle = patOut; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
        ctx.fillStyle = '#b9c1d3'; ctx.beginPath(); ctx.arc(C, C + 2.2, RM + 0.5, 0, TAU); ctx.fill();
        ctx.fillStyle = patIn; ctx.beginPath(); ctx.arc(C, C, RM + 0.5, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(120,130,170,.18)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(C, C, RM + 0.1, 0, TAU); ctx.stroke();
        for (const p of players) if (p.dirty) buildPath(p);
        const D = CFG.depth;
        ctx.translate(0, D + 0.8); ctx.fillStyle = 'rgba(40,46,90,.1)';
        for (const p of players) if (p.path && vis(p.bb)) fillLand(p);
        ctx.translate(0, -(D + 0.8));
        for (let k = 2; k >= 1; k--) {
          const off = D * k / 2;
          ctx.translate(0, off);
          for (const p of players) if (p.path && vis(p.bb)) { ctx.fillStyle = p.col.side; fillLand(p); }
          ctx.translate(0, -off);
        }
        for (const p of players) if (p.path && vis(p.bb)) {
          ctx.fillStyle = p.col.base; fillLand(p);
          const cp = p.cap;
          if (cp) {
            const k = cp.t / CAPT, rad = cp.R * easeOut(k);
            ctx.save(); ctx.clip(p.path);
            ctx.globalAlpha = 0.55 * (1 - k); ctx.fillStyle = p.col.light; ctx.beginPath(); ctx.arc(cp.x, cp.y, rad, 0, TAU); ctx.fill();
            ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cp.x, cp.y, Math.max(0.1, rad - 0.8), 0, TAU); ctx.stroke();
            ctx.restore(); ctx.globalAlpha = 1;
          }
        }
        for (const g of ghosts) {
          const k = g.t / 0.7, sc = 1 - 0.35 * k * k;
          ctx.save(); ctx.translate(g.cx, g.cy); ctx.scale(sc, sc); ctx.translate(-g.cx, -g.cy);
          ctx.globalAlpha = Math.max(0, 1 - k) * 0.9; ctx.fillStyle = k < 0.15 ? '#ffffff' : g.col.base; ctx.fill(g.path);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = CFG.trailR * 2;
        for (const p of players) {
          const t = p.trail;
          if (!p.alive || t.length < 2 || !vis(p.tbb)) continue;
          ctx.beginPath(); ctx.moveTo(t[0], t[1]);
          for (let k = 2; k < t.length; k += 2) ctx.lineTo(t[k], t[k + 1]);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = p.col.trail; ctx.stroke();
        }
        for (const q of parts) {
          if (q.conf) continue;
          const k = q.t / q.life;
          if (q.ring) { ctx.globalAlpha = 1 - k; ctx.strokeStyle = q.col; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(q.x, q.y, 2 + k * 9, 0, TAU); ctx.stroke(); continue; }
          ctx.globalAlpha = 1 - k * k;
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillStyle = q.col; ctx.fillRect(-q.s / 2, -q.s / 2, q.s, q.s); ctx.restore();
        }
        ctx.globalAlpha = 1;
        drawList.length = 0;
        for (const p of players) if (p.alive && p.x > vx0 && p.x < vx1 && p.y > vy0 && p.y < vy1) drawList.push(p);
        drawList.sort((a, b) => a.y - b.y);
        const king = rank.length && rank[0].count > 0 ? rank[0] : null;
        for (const p of drawList) drawBlock(p.x, p.y, p.a, p.col, Math.min(1, Math.max(0.05, easeBack(Math.min(1, (clock - p.born) / 0.35)))), p === king);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const ns = portrait ? 11.5 : 13;
        for (const p of drawList) {
          if (p === human) continue;
          const sx = (p.x - cam.x) * s + W / 2, sy = (p.y - cam.y) * s + H / 2 - (CFG.unit * 0.5 + CFG.blockDepth) * s - (p === king ? 26 : 9);
          text(p.name, sx, sy, ns, p.col.dark, 'center', 900, 'rgba(255,255,255,.85)', 3.5);
        }
        for (const f of floats) {
          const k = f.t / f.life, sx = (f.x - cam.x) * s + W / 2, sy = (f.y - cam.y) * s + H / 2 - 30 - k * 46;
          ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
          const sc = k < 0.15 ? easeBack(k / 0.15) : 1;
          text(f.text, sx, sy, f.size * sc, f.col, 'center', 900, f.oc, 6);
        }
        ctx.globalAlpha = 1;
      }

      function computeRank() {
        rank.length = 0;
        for (const p of players) if (p.alive) rank.push(p);
        rank.sort((a, b) => b.count - a.count || (a === human) - (b === human));
      }

      function drawHud() {
        const ph = portrait, U = ph ? 0.88 : 1;
        const lw = ph ? 150 : 200, rh = ph ? 21 : 25, x = W - lw - 10;
        let y = 10;
        const lead = rank.length ? Math.max(1, rank[0].count) : 1, top = Math.min(5, rank.length);
        const row = (p, n) => {
          const pct = p.count / total * 100;
          ctx.fillStyle = 'rgba(255,255,255,.78)'; rr(x, y, lw, rh, 7); ctx.fill();
          const bw = Math.max(rh * 1.6, lw * p.count / lead);
          ctx.fillStyle = p.col.base; rr(x, y, bw, rh, 7); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x + 7, y + rh - 3, bw - 14, 3);
          const fs = ph ? 11.5 : 13.5;
          const pt = fmtPct(pct);
          ctx.font = `900 ${fs}px ${FONT}`;
          const pw = ctx.measureText(pt).width;
          text(n + '  ' + fit(p === human ? 'You' : p.name, lw - pw - 34, fs), x + 8, y + rh / 2 + 0.5, fs, '#ffffff', 'left', 900, 'rgba(30,24,60,.35)', 3);
          text(pt, x + lw - 7, y + rh / 2 + 0.5, fs, '#2b2840', 'right', 900, 'rgba(255,255,255,.9)', 3);
          if (p === human) { ctx.strokeStyle = '#2b2840'; ctx.lineWidth = 2; rr(x - 1, y - 1, lw + 2, rh + 2, 8); ctx.stroke(); }
          y += rh + 4;
        };
        for (let k = 0; k < top; k++) row(rank[k], k + 1);
        if (human && human.alive) {
          const i = rank.indexOf(human);
          if (i >= top) { text('···', x + lw / 2, y + 3, 14, '#7a7f99'); y += 12; row(human, i + 1); }
        }
        if (human && state !== 'title') {
          const pw = ph ? 132 : 158, phh = ph ? 54 : 62;
          ctx.fillStyle = 'rgba(255,255,255,.82)'; rr(10, 10, pw, phh, 12); ctx.fill();
          ctx.fillStyle = human.col.blockSide; rr(18, 20 * U + 2, 22 * U, 22 * U, 6); ctx.fill();
          ctx.fillStyle = human.col.block; rr(18, 18 * U, 22 * U, 22 * U, 6); ctx.fill();
          const pct = human.alive ? human.count / total * 100 : 0;
          text(fmtPct(pct), 18 + 22 * U + 8, 10 + 21 * U, ph ? 21 : 25, '#2b2840', 'left');
          const sy = 10 + phh - 13 * U;
          text('KILLS', 18, sy, 10, '#8a8ea8', 'left', 900);
          text(String(human.kills), 18 + 34, sy, 13, '#2b2840', 'left');
          text('TIME', 18 + (ph ? 58 : 70), sy, 10, '#8a8ea8', 'left', 900);
          text(fmtTime(elapsed), 18 + (ph ? 86 : 100), sy, 13, '#2b2840', 'left');
        }
        let fy = human && state !== 'title' ? (ph ? 80 : 90) : 14;
        ctx.font = `800 ${ph ? 11 : 12.5}px ${FONT}`;
        for (const f of feed) {
          const al = f.t < 3.5 ? 1 : Math.max(0, 1 - (f.t - 3.5) / 0.6);
          if (al <= 0) continue;
          ctx.globalAlpha = al;
          const fs = ph ? 11 : 12.5;
          ctx.font = `900 ${fs}px ${FONT}`;
          const w1 = ctx.measureText(f.a).width, w2 = ctx.measureText(f.mid).width, w3 = f.b ? ctx.measureText(f.b).width : 0;
          ctx.fillStyle = 'rgba(255,255,255,.7)'; rr(10, fy - 9, w1 + w2 + w3 + 14, 19, 9); ctx.fill();
          text(f.a, 17, fy + 0.5, fs, f.ac, 'left');
          text(f.mid, 17 + w1, fy + 0.5, fs, '#7a7f99', 'left', 800);
          if (f.b) text(f.b, 17 + w1 + w2, fy + 0.5, fs, f.bc, 'left');
          fy += 23;
        }
        ctx.globalAlpha = 1;
        if (banner) {
          const k = banner.t / 1.8, sc = k < 0.12 ? easeBack(k / 0.12) : 1;
          ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
          text(banner.text, W / 2, H * (ph ? 0.2 : 0.22), (ph ? 24 : 30) * sc, banner.col, 'center', 900, '#ffffff', 7);
          ctx.globalAlpha = 1;
        }
      }

      function button(x, y, w, h, label, col, act, size) {
        const hov = mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
        const dep = Math.round(h * 0.11);
        ctx.fillStyle = 'rgba(30,30,70,.18)'; rr(x, y + dep + 3, w, h, h / 2); ctx.fill();
        ctx.fillStyle = mixc(col, '#26204a', 0.35); rr(x, y + dep, w, h, h / 2); ctx.fill();
        ctx.fillStyle = hov ? mixc(col, '#ffffff', 0.12) : col; rr(x, y, w, h, h / 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.22)'; rr(x + h * 0.3, y + 4, w - h * 0.6, h * 0.3, h * 0.15); ctx.fill();
        text(label, x + w / 2, y + h / 2 + 1, size || h * 0.42, '#ffffff', 'center', 900, 'rgba(0,0,0,.15)', 3);
        btns.push({ x, y: y - 2, w, h: h + dep + 4, act });
      }
      function pill(x, y, w, h, label, on, act) {
        ctx.fillStyle = on ? '#2b2840' : 'rgba(255,255,255,.9)'; rr(x, y, w, h, h / 2); ctx.fill();
        if (!on) { ctx.strokeStyle = '#d6d9e6'; ctx.lineWidth = 2; rr(x + 1, y + 1, w - 2, h - 2, h / 2); ctx.stroke(); }
        text(label, x + w / 2, y + h / 2 + 1, h * 0.4, on ? '#ffffff' : '#4a4766');
        btns.push({ x, y, w, h, act });
      }
      function logo(cx, cy, size) {
        const words = [['PAPER', '#ff5e5b'], ['.IO', '#4d8dff']];
        ctx.font = `900 ${size}px ${FONT}`;
        const gap = size * 0.02, w1 = ctx.measureText(words[0][0]).width, w2 = ctx.measureText(words[1][0]).width;
        let x = cx - (w1 + gap + w2) / 2;
        for (const [w, c] of words) {
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#ffffff';
          for (let d = size * 0.12; d > 0; d -= 2) { ctx.strokeText(w, x, cy + d); }
          for (let d = size * 0.1; d > 0; d -= 1.5) { ctx.fillStyle = mixc(c, '#26204a', 0.35); ctx.fillText(w, x, cy + d); }
          ctx.strokeText(w, x, cy);
          ctx.fillStyle = c; ctx.fillText(w, x, cy);
          x += ctx.measureText(w).width + gap;
        }
      }

      function drawTitle() {
        const ph = portrait;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, 'rgba(246,247,251,.9)'); g.addColorStop(0.5, 'rgba(246,247,251,.72)'); g.addColorStop(1, 'rgba(246,247,251,.92)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        logo(W / 2, H * (ph ? 0.15 : 0.17), ph ? 50 : 70);
        const by = H * (ph ? 0.385 : 0.43), sk = SKINS[skin], bs = ph ? 15 : 17;
        ctx.save(); ctx.translate(W / 2, by); ctx.scale(bs, bs);
        drawBlock(0, 0, -PI / 2 + Math.sin(clock * 1.6) * 0.25, sk, 1, false);
        ctx.restore();
        const ax = ph ? 92 : 112, ar = 24;
        for (const s of [-1, 1]) {
          const cx = W / 2 + s * ax;
          ctx.fillStyle = 'rgba(30,30,70,.15)'; ctx.beginPath(); ctx.arc(cx, by + 4, ar, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, by, ar, 0, TAU); ctx.fill();
          ctx.strokeStyle = '#2b2840'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(cx - s * 4, by - 9); ctx.lineTo(cx + s * 5, by); ctx.lineTo(cx - s * 4, by + 9); ctx.stroke();
          btns.push({ x: cx - ar - 6, y: by - ar - 6, w: ar * 2 + 12, h: ar * 2 + 12, act: () => { skin = (skin + s + SKINS.length) % SKINS.length; store(); } });
        }
        text('SKIN ' + (skin + 1) + '/' + SKINS.length, W / 2, by + (ph ? 52 : 58), 11, '#8a8ea8');
        const mw = ph ? 108 : 118, mh = 42, mg = 10, mx = W / 2 - (mw * 3 + mg * 2) / 2, my = H * (ph ? 0.55 : 0.6);
        MODE_KEYS.forEach((k, i) => pill(mx + i * (mw + mg), my, mw, mh, CFG.modes[k].name, mode === k, () => { if (mode !== k) { mode = k; store(); toTitle(); } }));
        const pw = ph ? 210 : 240, phh = ph ? 62 : 66;
        button(W / 2 - pw / 2, H * (ph ? 0.68 : 0.73), pw, phh, 'PLAY', '#3ccf6e', startGame, ph ? 28 : 30);
        const best = api.best;
        text(best != null ? 'BEST ' + fmtPct(best) : 'Claim as much of the map as you can', W / 2, H * (ph ? 0.84 : 0.885), ph ? 14 : 15, '#4a4766', 'center', 900);
        text(ph ? 'Drag anywhere to steer · tap to play' : 'Steer with the mouse or arrow keys · any key to play', W / 2, H * (ph ? 0.885 : 0.93), 12.5, '#8a8ea8', 'center', 800);
      }

      function drawCard() {
        const ph = portrait, won = state === 'win';
        const k = Math.min(1, stateT / 0.45), sc = easeBack(k);
        ctx.fillStyle = `rgba(36,34,70,${0.35 * k})`; ctx.fillRect(0, 0, W, H);
        const cw = ph ? 340 : 380, ch = ph ? 372 : 384, cx = W / 2 - cw / 2, cy = H / 2 - ch / 2 - (ph ? 6 : 0);
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
        ctx.fillStyle = 'rgba(30,30,70,.25)'; rr(cx, cy + 8, cw, ch, 24); ctx.fill();
        ctx.fillStyle = '#ffffff'; rr(cx, cy, cw, ch, 24); ctx.fill();
        const col = human ? human.col : SKINS[skin];
        ctx.fillStyle = won ? '#ffcf33' : col.base; rr(cx, cy, cw, 64, [24, 24, 0, 0]); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(cx, cy + 60, cw, 4);
        text(won ? 'YOU WIN!' : 'GAME OVER', W / 2, cy + 33, 30, '#ffffff', 'center', 900, 'rgba(0,0,0,.18)', 5);
        let y = cy + 88;
        text(won ? 'You painted the whole map!' : deathMsg, W / 2, y, 15, '#4a4766', 'center', 800);
        y += 26;
        if (newBest) {
          ctx.fillStyle = '#ff5e5b'; rr(W / 2 - 52, y - 11, 104, 22, 11); ctx.fill();
          text('NEW BEST!', W / 2, y + 0.5, 12, '#ffffff');
        } else text('BEST ' + fmtPct(Math.max(maxPct, api.best || 0)), W / 2, y, 12, '#8a8ea8');
        y += 46;
        text(fmtPct(maxPct), W / 2, y + 2, 52, col.side);
        text(fmtPct(maxPct), W / 2, y - 1, 52, col.base);
        y += 34;
        text('TERRITORY', W / 2, y, 11, '#8a8ea8');
        y += 22;
        const sw = (cw - 48) / 3;
        [['KILLS', String(human ? human.kills : 0)], ['RANK', lastRank ? '#' + lastRank : '-'], ['TIME', fmtTime(elapsed)]].forEach(([l, v], i) => {
          const sx = cx + 16 + i * (sw + 8);
          ctx.fillStyle = '#f2f3f8'; rr(sx, y, sw, 52, 12); ctx.fill();
          text(l, sx + sw / 2, y + 15, 10, '#8a8ea8');
          text(v, sx + sw / 2, y + 35, 19, '#2b2840');
        });
        const bw = cw - 150, bh = 52, by = cy + ch - 74, nb = btns.length;
        button(cx + 18, by, bw, bh, 'PLAY AGAIN', '#3ccf6e', startGame, 21);
        button(cx + 30 + bw, by, cw - bw - 48, bh, 'MENU', '#8a8ea8', toTitle, 18);
        if (k < 1) btns.length = nb;
        ctx.restore();
      }

      newWorld(mode, false);
      api.score('—');
      if (api.__probe) api.__probe({ get players() { return players; }, get human() { return human; }, get total() { return total; }, get state() { return state; }, get owner() { return owner; }, get tOwn() { return tOwn; }, get G() { return G; }, get maxPct() { return maxPct; }, get deathMsg() { return deathMsg; }, set input(v) { inputMode = v; }, start: startGame, step, toTitle });

      api.loop(dt => {
        if (state !== 'win') {
          acc += dt;
          let n = 0;
          while (acc >= CFG.tick && n < 4) { step(CFG.tick); acc -= CFG.tick; n++; }
          if (n >= 4) acc = 0;
        }
        stateT += dt;
        if (state === 'dying' && stateT > 1.3) { finishRun(); state = 'over'; stateT = 0; }
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i];
          if ((q.t += dt) >= q.life) { parts.splice(i, 1); continue; }
          if (q.ring) continue;
          const f = q.conf ? 1 : Math.exp(-3 * dt);
          q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= f; q.vy *= f; q.r += q.vr * dt;
          if (q.conf) q.vx += Math.sin(q.t * 3 + q.r) * 20 * dt;
        }
        for (let i = floats.length - 1; i >= 0; i--) if ((floats[i].t += dt) >= floats[i].life) floats.splice(i, 1);
        for (let i = ghosts.length - 1; i >= 0; i--) if ((ghosts[i].t += dt) >= 0.7) ghosts.splice(i, 1);
        for (const p of players) if (p.cap && (p.cap.t += dt) >= CAPT) p.cap = null;
        for (let i = feed.length - 1; i >= 0; i--) if ((feed[i].t += dt) > 4.2) feed.splice(i, 1);
        if (banner && (banner.t += dt) > 1.8) banner = null;
        shake = Math.max(0, shake - dt * 2.5);
        computeRank();
        if (human && human.alive && state === 'play') lastRank = rank.indexOf(human) + 1;
        let tx = cam.x, ty = cam.y;
        const base = portrait ? CFG.zoom.phone : CFG.zoom.desk;
        let ts = base;
        if (human) {
          if (human.alive) { tx = human.x; ty = human.y; }
          ts = base * (1 - CFG.fov * Math.floor(human.count / total * 10));
        } else {
          if (!camBot || !camBot.alive) camBot = rank[Math.floor(Math.random() * Math.min(4, rank.length))] || null;
          if (camBot) { tx = camBot.x; ty = camBot.y; }
          ts = base * 0.85;
        }
        if (cam.snap) { cam.x = tx; cam.y = ty; cam.s = ts; cam.snap = false; }
        const kf = 1 - Math.exp(-(human ? 9 : 2.5) * dt);
        cam.x += (tx - cam.x) * kf; cam.y += (ty - cam.y) * kf; cam.s += (ts - cam.s) * (1 - Math.exp(-2 * dt));
        const dpr = canvas.width / W;
        btns = [];
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawWorld(dpr);
        if (state === 'title') drawTitle();
        else {
          drawHud();
          if (state === 'over' || state === 'win') drawCard();
        }
        for (const q of parts) {
          if (!q.conf) continue;
          ctx.globalAlpha = Math.min(1, (q.life - q.t) * 2);
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillStyle = q.col; ctx.fillRect(-q.s / 2, -q.s * 0.3, q.s, q.s * 0.6); ctx.restore();
        }
        ctx.globalAlpha = 1;
      });

      return {
        destroy() {
          if (actx) { try { actx.close(); } catch (e) {} actx = null; }
          players = []; owner = tOwn = tSeq = mark = stack = null;
        }
      };
    }
  });
  Ameplay.covers['paper-land'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="pl-pt" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M17 11l5 6-5 6-5-6z" fill="#e4e8f1"/></pattern><pattern id="pl-po" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="20" fill="#d5dbe8"/><rect width="9" height="20" fill="#cdd4e3"/></pattern><path id="pl-r" d="M20 168C30 130 90 128 120 142C150 156 182 150 192 182C202 214 178 230 186 256C192 280 150 296 110 290C70 286 30 292 18 260C8 230 12 196 20 168Z"/><path id="pl-b" d="M292 28C322 10 372 14 388 38C402 60 386 92 392 120C396 146 360 160 332 150C304 142 282 150 276 120C270 92 274 44 292 28Z"/><path id="pl-y" d="M296 236C314 212 354 210 372 228C392 248 386 278 358 286C332 294 302 290 292 270C286 258 288 246 296 236Z"/><path id="pl-g" d="M74 36C94 18 134 22 144 44C154 66 136 88 112 90C88 92 62 80 60 60C59 50 66 42 74 36Z"/></defs><rect width="400" height="300" fill="url(#pl-po)"/><circle cx="262" cy="318" r="318" fill="#b7bfd2"/><circle cx="262" cy="310" r="318" fill="#f5f6fa"/><circle cx="262" cy="310" r="318" fill="url(#pl-pt)"/><use href="#pl-r" y="16" fill="#2a2850" opacity=".12"/><use href="#pl-r" y="11" fill="#c2423f"/><use href="#pl-r" y="5" fill="#c2423f"/><use href="#pl-r" fill="#ff5e5b"/><use href="#pl-b" y="16" fill="#2a2850" opacity=".12"/><use href="#pl-b" y="11" fill="#3466c4"/><use href="#pl-b" y="5" fill="#3466c4"/><use href="#pl-b" fill="#4d8dff"/><use href="#pl-y" y="16" fill="#2a2850" opacity=".12"/><use href="#pl-y" y="11" fill="#c49a26"/><use href="#pl-y" y="5" fill="#c49a26"/><use href="#pl-y" fill="#ffc93c"/><use href="#pl-g" y="16" fill="#2a2850" opacity=".12"/><use href="#pl-g" y="11" fill="#2f9e58"/><use href="#pl-g" y="5" fill="#2f9e58"/><use href="#pl-g" fill="#4cd47a"/><path d="M120 146C112 88 154 48 210 52C262 56 286 104 264 144C252 166 228 178 206 184" fill="none" stroke="#ff8f8c" stroke-opacity=".75" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/><path d="M334 154C330 168 320 176 304 178" fill="none" stroke="#86afff" stroke-opacity=".8" stroke-width="19" stroke-linecap="round"/><g stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"><path d="M330 192h22M336 204h14"/></g><ellipse cx="198" cy="202" rx="27" ry="17" fill="#2a2850" opacity=".16"/><g transform="translate(198 194) rotate(200)"><rect x="-22" y="-22" width="44" height="44" rx="11" fill="#9a3331"/></g><g transform="translate(198 190) rotate(200)"><rect x="-22" y="-22" width="44" height="44" rx="11" fill="#9a3331"/></g><g transform="translate(198 186) rotate(200)"><rect x="-22" y="-22" width="44" height="44" rx="11" fill="#e8504d"/><rect x="-19.5" y="-19.5" width="39" height="39" rx="9" fill="none" stroke="#ff8a87" stroke-width="2.5"/><circle cx="6" cy="-9" r="6.6" fill="#fff"/><circle cx="6" cy="9" r="6.6" fill="#fff"/><circle cx="8.6" cy="-9" r="3.3" fill="#1d1b2e"/><circle cx="8.6" cy="9" r="3.3" fill="#1d1b2e"/><path d="M-7 -6Q-12 0 -7 6" fill="none" stroke="#1d1b2e" stroke-width="2.8" stroke-linecap="round"/></g><ellipse cx="298" cy="192" rx="27" ry="17" fill="#2a2850" opacity=".16"/><g transform="translate(298 184) rotate(196)"><rect x="-22" y="-22" width="44" height="44" rx="11" fill="#264a94"/></g><g transform="translate(298 180) rotate(196)"><rect x="-22" y="-22" width="44" height="44" rx="11" fill="#264a94"/></g><g transform="translate(298 176) rotate(196)"><rect x="-22" y="-22" width="44" height="44" rx="11" fill="#3f77e0"/><rect x="-19.5" y="-19.5" width="39" height="39" rx="9" fill="none" stroke="#7fa6ff" stroke-width="2.5"/><circle cx="6" cy="-9" r="6.6" fill="#fff"/><circle cx="6" cy="9" r="6.6" fill="#fff"/><circle cx="8.6" cy="-9" r="3.3" fill="#1d1b2e"/><circle cx="8.6" cy="9" r="3.3" fill="#1d1b2e"/><path d="M-2 -15L4 -12M-2 15L4 12" stroke="#1d1b2e" stroke-width="2.8" stroke-linecap="round"/><path d="M-7 -6Q-12 0 -7 6" fill="none" stroke="#1d1b2e" stroke-width="2.8" stroke-linecap="round"/></g><g fill="#fff"><path d="M262 146l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/><circle cx="248" cy="180" r="3.5"/><circle cx="276" cy="132" r="3"/></g></svg>`;
})();

