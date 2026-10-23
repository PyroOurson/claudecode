
(() => {
  'use strict';

  const CFG = {
    W: 640, H: 632, HDR: 64, BORDER: 16,
    TICK: 0.135,
    SPEEDS: { slow: 1.33, normal: 1, fast: 0.66 },
    SIZES: { small: [10, 9], medium: [17, 15], large: [24, 21] },
    COUNTS: [1, 3, 5],
    START_LEN: 4, APPLE_RADIUS: 2, WALL_GAP: 3,
    SPEED_MODE_MUL: 0.97, SPEED_MODE_MIN: 0.45,
    QUEUE: 2, DIE_FLASH: 0.9, OVER_DELAY: 1.05,
    COL: {
      hdr: '#4A752C', border: '#578A34', light: '#AAD751', dark: '#A2D149',
      snake: '#4E7CF6', tail: '#3A68E0', eye: '#fff', pupil: '#1f2a44',
      apple: '#E7471D', appleD: '#C4361A', leaf: '#5BA62F', stem: '#6B3F1F',
      poison: '#8E44C9', poisonD: '#6A2C9C', card: '#4DC1F9', btn: '#1155CC', menu: '#4A752C', wall: '#5E6A75'
    },
    PAIR: ['#FF8F1F', '#2F8CFF', '#B45CFF', '#22C3B0', '#FF4FA3'],
    SKINS: [{ a: '#4E7CF6', b: '#3A68E0' }, { a: '#9B51E0', b: '#7B3FC4' }]
  };

  const MODES = [
    ['classic', 'Classic', 'The original. Eat apples, grow, stay off the walls.'],
    ['wall', 'Wall', 'A new wall pops up every time you eat.'],
    ['portal', 'Portal', 'Apples come in pairs. Eat one, slither out of the other.'],
    ['cheese', 'Cheese', 'Your body has gaps. Slip through the thin parts.'],
    ['borderless', 'Borderless', 'No walls. Leave one side, come back on the other.'],
    ['twin', 'Twin', 'Every apple swaps head and tail. Now steer the other end.'],
    ['speed', 'Speed', 'Every apple makes you a little faster.'],
    ['peaceful', 'Peaceful', 'You cannot crash. Wrap around and relax.'],
    ['poison', 'Poison', 'One apple is poisoned. Do not eat the purple one.']
  ];
  const MODE_OF = Object.fromEntries(MODES.map(m => [m[0], m]));
  const DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  const KEYS = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  const TAU = Math.PI * 2;
  const FONT = 'Nunito, Roboto, Arial, sans-serif';
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  const opp = (a, b) => a.x === -b.x && a.y === -b.y;

  function disc(c, x, y, r, col) { if (r > 0) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = col; c.fill(); } }
  function rr(c, x, y, w, h, r, col) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = col; c.fill(); }
  function text(c, s, x, y, size, col, align = 'center', weight = 900) {
    c.font = `${weight} ${size}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y);
  }
  function apple(c, x, y, r, kind, ring) {
    if (!(r > 0.5)) return;
    const poison = kind === 'poison';
    disc(c, x, y + r * 0.08, r, poison ? CFG.COL.poisonD : CFG.COL.appleD);
    disc(c, x - r * 0.06, y, r * 0.92, poison ? CFG.COL.poison : CFG.COL.apple);
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(x - r * 0.42, y - r * 0.32, r * 0.18, r * 0.28, 0.5, 0, TAU); c.fill();
    c.strokeStyle = CFG.COL.stem; c.lineWidth = r * 0.18; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - r * 0.7); c.quadraticCurveTo(x + r * 0.04, y - r * 1.05, x + r * 0.22, y - r * 1.2); c.stroke();
    c.fillStyle = CFG.COL.leaf; c.beginPath(); c.ellipse(x + r * 0.5, y - r * 0.98, r * 0.4, r * 0.19, -0.55, 0, TAU); c.fill();
    if (poison) {
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x - r * 0.05, y + r * 0.02, r * 0.42, r * 0.36, 0, 0, TAU); c.fill();
      c.fillRect(x - r * 0.25, y + r * 0.2, r * 0.4, r * 0.26);
      disc(c, x - r * 0.21, y + r * 0.02, r * 0.11, CFG.COL.poisonD); disc(c, x + r * 0.11, y + r * 0.02, r * 0.11, CFG.COL.poisonD);
    }
    if (ring) {
      c.strokeStyle = ring; c.lineWidth = Math.max(2, r * 0.18); c.globalAlpha = 0.9;
      c.beginPath(); c.arc(x, y, r * 1.45, 0, TAU); c.stroke(); c.globalAlpha = 1;
    }
  }
  function trophy(c, x, y, s) {
    c.fillStyle = '#FFC107';
    c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.5); c.lineTo(x + s * 0.5, y - s * 0.5); c.quadraticCurveTo(x + s * 0.48, y + s * 0.12, x, y + s * 0.18); c.quadraticCurveTo(x - s * 0.48, y + s * 0.12, x - s * 0.5, y - s * 0.5); c.fill();
    c.strokeStyle = '#FFC107'; c.lineWidth = s * 0.12;
    c.beginPath(); c.arc(x - s * 0.5, y - s * 0.2, s * 0.2, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.arc(x + s * 0.5, y - s * 0.2, s * 0.2, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
    c.fillRect(x - s * 0.08, y + s * 0.14, s * 0.16, s * 0.2);
    rr(c, x - s * 0.3, y + s * 0.32, s * 0.6, s * 0.16, s * 0.04, '#FFC107');
    c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - s * 0.32, y - s * 0.42, s * 0.12, s * 0.36);
  }
  function speaker(c, x, y, s, on) {
    c.fillStyle = '#fff';
    c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.18); c.lineTo(x - s * 0.22, y - s * 0.18); c.lineTo(x + s * 0.1, y - s * 0.45); c.lineTo(x + s * 0.1, y + s * 0.45); c.lineTo(x - s * 0.22, y + s * 0.18); c.lineTo(x - s * 0.5, y + s * 0.18); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = s * 0.1; c.lineCap = 'round';
    if (on) {
      c.beginPath(); c.arc(x + s * 0.1, y, s * 0.25, -0.8, 0.8); c.stroke();
      c.beginPath(); c.arc(x + s * 0.1, y, s * 0.45, -0.8, 0.8); c.stroke();
    } else {
      c.beginPath(); c.moveTo(x + s * 0.24, y - s * 0.18); c.lineTo(x + s * 0.56, y + s * 0.18); c.moveTo(x + s * 0.56, y - s * 0.18); c.lineTo(x + s * 0.24, y + s * 0.18); c.stroke();
    }
  }
  function gear(c, x, y, s, col = '#fff') {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU, r = i % 2 ? s * 0.36 : s * 0.5;
      c.lineTo(x + Math.cos(a - 0.12) * r, y + Math.sin(a - 0.12) * r); c.lineTo(x + Math.cos(a + 0.12) * r, y + Math.sin(a + 0.12) * r);
    }
    c.closePath(); c.fill();
    c.globalCompositeOperation = 'destination-out'; disc(c, x, y, s * 0.17, '#000'); c.globalCompositeOperation = 'source-over';
  }
  function bricks(c, x, y, t) {
    rr(c, x + t * 0.04, y + t * 0.04, t * 0.92, t * 0.92, t * 0.14, '#47525C');
    rr(c, x + t * 0.04, y + t * 0.04, t * 0.92, t * 0.8, t * 0.14, CFG.COL.wall);
    c.strokeStyle = '#47525C'; c.lineWidth = Math.max(1.5, t * 0.06);
    c.beginPath();
    c.moveTo(x + t * 0.06, y + t * 0.32); c.lineTo(x + t * 0.94, y + t * 0.32);
    c.moveTo(x + t * 0.06, y + t * 0.58); c.lineTo(x + t * 0.94, y + t * 0.58);
    c.moveTo(x + t * 0.5, y + t * 0.06); c.lineTo(x + t * 0.5, y + t * 0.32);
    c.moveTo(x + t * 0.28, y + t * 0.32); c.lineTo(x + t * 0.28, y + t * 0.58);
    c.moveTo(x + t * 0.72, y + t * 0.32); c.lineTo(x + t * 0.72, y + t * 0.58);
    c.moveTo(x + t * 0.5, y + t * 0.58); c.lineTo(x + t * 0.5, y + t * 0.84);
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x + t * 0.12, y + t * 0.1, t * 0.3, t * 0.08);
  }
  function modeIcon(c, id, x, y, s) {
    const C = CFG.COL;
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (id === 'classic') apple(c, x, y + s * 0.06, s * 0.36);
    else if (id === 'wall') bricks(c, x - s * 0.42, y - s * 0.42, s * 0.84);
    else if (id === 'portal') { c.lineWidth = s * 0.1; c.strokeStyle = CFG.PAIR[0]; c.beginPath(); c.arc(x - s * 0.22, y, s * 0.2, 0, TAU); c.stroke(); c.strokeStyle = CFG.PAIR[1]; c.beginPath(); c.arc(x + s * 0.22, y, s * 0.2, 0, TAU); c.stroke(); disc(c, x - s * 0.22, y, s * 0.09, CFG.PAIR[0]); disc(c, x + s * 0.22, y, s * 0.09, CFG.PAIR[1]); }
    else if (id === 'cheese') {
      c.strokeStyle = C.snake; c.lineWidth = s * 0.1; c.beginPath(); c.moveTo(x - s * 0.42, y); c.lineTo(x + s * 0.42, y); c.stroke();
      c.lineWidth = s * 0.3; for (let i = -1; i <= 1; i += 2) { c.beginPath(); c.moveTo(x + i * s * 0.28 - s * 0.08, y); c.lineTo(x + i * s * 0.28 + s * 0.08, y); c.stroke(); }
    } else if (id === 'borderless') {
      c.setLineDash([s * 0.12, s * 0.1]); c.strokeStyle = '#fff'; c.lineWidth = s * 0.08; c.strokeRect(x - s * 0.36, y - s * 0.36, s * 0.72, s * 0.72); c.setLineDash([]);
      c.strokeStyle = C.snake; c.lineWidth = s * 0.16; c.beginPath(); c.moveTo(x - s * 0.5, y); c.lineTo(x + s * 0.5, y); c.stroke();
    } else if (id === 'twin') {
      c.strokeStyle = C.snake; c.lineWidth = s * 0.22; c.beginPath(); c.moveTo(x - s * 0.34, y + s * 0.12); c.lineTo(x - s * 0.34, y - s * 0.12); c.lineTo(x + s * 0.34, y - s * 0.12); c.lineTo(x + s * 0.34, y + s * 0.12); c.stroke();
      for (const sx of [-1, 1]) { disc(c, x + sx * s * 0.34, y + s * 0.2, s * 0.15, C.snake); disc(c, x + sx * s * 0.34 - s * 0.06, y + s * 0.22, s * 0.05, '#fff'); disc(c, x + sx * s * 0.34 + s * 0.06, y + s * 0.22, s * 0.05, '#fff'); }
    } else if (id === 'speed') {
      c.fillStyle = '#FFD43B'; c.beginPath(); c.moveTo(x + s * 0.08, y - s * 0.46); c.lineTo(x - s * 0.26, y + s * 0.06); c.lineTo(x - s * 0.02, y + s * 0.06); c.lineTo(x - s * 0.1, y + s * 0.46); c.lineTo(x + s * 0.26, y - s * 0.08); c.lineTo(x + s * 0.02, y - s * 0.08); c.closePath(); c.fill();
    } else if (id === 'peaceful') {
      c.fillStyle = '#FF7A9A'; c.beginPath(); c.moveTo(x, y + s * 0.36);
      c.bezierCurveTo(x - s * 0.5, y, x - s * 0.36, y - s * 0.42, x, y - s * 0.16); c.bezierCurveTo(x + s * 0.36, y - s * 0.42, x + s * 0.5, y, x, y + s * 0.36); c.fill();
    } else if (id === 'poison') apple(c, x, y + s * 0.06, s * 0.36, 'poison');
  }

  Ameplay.register({
    id: 'snake',
    title: 'Snake',
    category: 'Arcade',
    tint: '#4E7CF6',
    blurb: 'Eat apples, grow longer, and never bite your own tail.',
    help: '<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to steer · swipe on touch · gear icon for speed, size, apples and 9 modes',
    better: 'high',
    width: 680,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="50" height="50" rx="11" opacity=".3"/><path d="M17 46h13V30h15" stroke-width="7"/><circle cx="45" cy="18" r="3.4" fill="currentColor" stroke="none"/></svg>',
    css: '.gm-snake{gap:0}.gm-snake .g-canvas{background:#4A752C;cursor:pointer}',
    mount(root, api) {
      const { W, H, HDR, BORDER, COL } = CFG;
      const view = api.canvas(W, H), canvas = view.canvas, ctx = view.ctx;
      const saved = api.load() || {};
      const cfg = {
        speed: CFG.SPEEDS[saved.speed] ? saved.speed : 'normal',
        size: CFG.SIZES[saved.size] ? saved.size : 'medium',
        count: CFG.COUNTS.includes(saved.count) ? saved.count : 1,
        mode: MODE_OF[saved.mode] ? saved.mode : 'classic'
      };
      const bests = saved.bests && typeof saved.bests === 'object' ? saved.bests : {};
      let snd = saved.snd !== false;
      const store = () => api.save({ ...cfg, bests, snd });
      const bestKey = () => `${cfg.mode}|${cfg.speed}|${cfg.size}|${cfg.count}`;

      let ac = null, master = null, noise = null;
      function audio() {
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
          noise = ac.createBuffer(1, ac.sampleRate >> 2, ac.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function tone(t, dur, type, f0, f1, vol) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
      }
      function crunch(t, dur, f, vol) {
        const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = 1.2;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
      }
      function sfx(name) {
        if (api.muted || !snd || !audio()) return;
        const t = ac.currentTime + 0.003;
        if (name === 'eat') { crunch(t, 0.07, 2400, 0.5); crunch(t + 0.05, 0.06, 1600, 0.35); tone(t, 0.08, 'triangle', 620, 940, 0.18); }
        else if (name === 'turn') tone(t, 0.035, 'sine', 300, 240, 0.06);
        else if (name === 'die') { tone(t, 0.1, 'square', 220, 110, 0.12); tone(t + 0.08, 0.45, 'triangle', 330, 70, 0.3); crunch(t, 0.18, 500, 0.4); }
        else if (name === 'portal') { tone(t, 0.18, 'sine', 400, 1400, 0.16); tone(t + 0.06, 0.16, 'sine', 900, 500, 0.1); }
        else if (name === 'wall') { crunch(t, 0.12, 300, 0.5); tone(t, 0.12, 'square', 140, 90, 0.08); }
        else if (name === 'start') { tone(t, 0.08, 'triangle', 520, 520, 0.14); tone(t + 0.08, 0.12, 'triangle', 780, 780, 0.14); }
        else if (name === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.11, 0.22, 'triangle', f, f, 0.2));
        else if (name === 'click') tone(t, 0.04, 'sine', 700, 600, 0.08);
      }

      let cols, rows, T, ox, oy, boardImg;
      let body, dir, queue, grow, lastTail, apples, walls, score, interval, acc, reverseNext, portalFrom, eatFx, tickN;
      let state = 'title', stateT = 0, clock = 0, submitted = false, won = false, deathWhy = '';
      let skin = CFG.SKINS[0];
      let coarse = matchMedia('(pointer: coarse)').matches;
      let look = 0, mouth = 0, blink = 3, tongue = 0, tongueT = 2, chomp = 0, hover = null; let lumps = [], curP = 1;
      const parts = [];

      const wrapMode = () => cfg.mode === 'borderless' || cfg.mode === 'peaceful';
      function layout() {
        [cols, rows] = CFG.SIZES[cfg.size];
        const fw = W - BORDER * 2, fh = H - HDR - BORDER * 2;
        T = Math.min(fw / cols, fh / rows);
        ox = BORDER + (fw - cols * T) / 2; oy = HDR + BORDER + (fh - rows * T) / 2;
        const c = document.createElement('canvas'), dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
        const g = c.getContext('2d'); g.scale(dpr, dpr);
        g.fillStyle = COL.border; g.fillRect(0, HDR, W, H - HDR);
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { g.fillStyle = (x + y) & 1 ? COL.dark : COL.light; g.fillRect(ox + x * T, oy + y * T, Math.ceil(T), Math.ceil(T)); }
        if (wrapMode()) {
          g.setLineDash([T * 0.35, T * 0.25]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3;
          g.strokeRect(ox - 4, oy - 4, cols * T + 8, rows * T + 8); g.setLineDash([]);
        }
        boardImg = c;
      }
      const idx = (x, y) => y * cols + x;
      const px = x => ox + (x + 0.5) * T, py = y => oy + (y + 0.5) * T;

      function occupied(x, y) {
        if (walls[idx(x, y)]) return true;
        for (let i = 0; i < body.length; i++) if (body[i].x === x && body[i].y === y) return true;
        for (let i = 0; i < apples.length; i++) if (apples[i].x === x && apples[i].y === y) return true;
        return false;
      }
      function freeCell(minHead) {
        const h = body[0], near = [], far = [];
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          if (occupied(x, y)) continue;
          (Math.max(Math.abs(x - h.x), Math.abs(y - h.y)) > minHead ? far : near).push({ x, y });
        }
        const pool = far.length ? far : near;
        return pool.length ? pool[(Math.random() * pool.length) | 0] : null;
      }
      let pairId = 0;
      function spawnApple() {
        if (cfg.mode === 'portal') {
          const a = freeCell(CFG.APPLE_RADIUS); if (!a) return false;
          const id = pairId++; apples.push({ x: a.x, y: a.y, kind: 'apple', pair: id, t: clock });
          const b = freeCell(CFG.APPLE_RADIUS);
          if (!b) { apples.pop(); return false; }
          apples.push({ x: b.x, y: b.y, kind: 'apple', pair: id, t: clock });
          return true;
        }
        const a = freeCell(CFG.APPLE_RADIUS); if (!a) return false;
        apples.push({ x: a.x, y: a.y, kind: 'apple', pair: -1, t: clock });
        return true;
      }
      function placePoison() {
        const i = apples.findIndex(a => a.kind === 'poison');
        if (i >= 0) apples.splice(i, 1);
        const a = freeCell(CFG.APPLE_RADIUS);
        if (a) apples.push({ x: a.x, y: a.y, kind: 'poison', pair: -1, t: clock });
      }
      function reset() {
        layout();
        const my = rows >> 1, hx = Math.max(CFG.START_LEN - 1, cols >> 2);
        body = []; for (let i = 0; i < CFG.START_LEN; i++) body.push({ x: hx - i, y: my, g: (i & 1) === 1 });

        dir = DIRS.right; queue = []; grow = 0; lastTail = null; apples = []; walls = new Uint8Array(cols * rows);
        score = 0; acc = 0; reverseNext = false; portalFrom = null; eatFx = null; tickN = 0; pairId = 0;
        interval = CFG.TICK * CFG.SPEEDS[cfg.speed];
        submitted = false; won = false; mouth = 0; chomp = 0; look = 0; parts.length = 0; lumps.length = 0;
        const ax = cols - 1 - (cols >> 2);
        if (cfg.mode === 'portal') {
          apples.push({ x: ax, y: my, kind: 'apple', pair: 0, t: clock });
          const b = freeCell(CFG.APPLE_RADIUS); if (b) apples.push({ x: b.x, y: b.y, kind: 'apple', pair: 0, t: clock });
          pairId = 1;
        } else apples.push({ x: ax, y: my, kind: 'apple', pair: -1, t: clock });
        for (let i = 1; i < cfg.count; i++) spawnApple();
        if (cfg.mode === 'poison') placePoison();
        api.score(0);
      }

      function setState(s) { state = s; stateT = 0; }
      function startPlay(d) {
        audio();
        if (state !== 'ready') reset();
        dir = d && !opp(DIRS[d], DIRS.right) ? DIRS[d] : DIRS.right;
        setState('play'); acc = 0; sfx('start');
        tick();
      }
      function turn(name) {
        const d = DIRS[name];
        const last = queue.length ? queue[queue.length - 1] : dir;
        if (d === last || opp(d, last) || queue.length >= CFG.QUEUE) return;
        queue.push(d); sfx('turn');
      }

      function wrapDelta(a, n) { if (!wrapMode()) return a; if (a > 1) return a - n; if (a < -1) return a + n; return a; }
      function blocked(x, y, willGrow) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return 'wall';
        if (walls[idx(x, y)]) return 'wall';
        if (cfg.mode === 'peaceful') return null;
        const n = willGrow ? body.length : body.length - 1;
        for (let i = 0; i < n; i++) {
          const b = body[i];
          if (b.x === x && b.y === y && !(cfg.mode === 'cheese' && b.g && i > 0)) return 'self';
        }
        return null;
      }
      function reverse() {
        body.reverse();
        const dx = wrapDelta(body[0].x - body[1].x, cols), dy = wrapDelta(body[0].y - body[1].y, rows);
        dir = dx > 0 ? DIRS.right : dx < 0 ? DIRS.left : dy > 0 ? DIRS.down : DIRS.up;
        queue.length = 0;
        const fwd = d => { let x = body[0].x + d.x, y = body[0].y + d.y; if (wrapMode()) { x = (x + cols) % cols; y = (y + rows) % rows; } return !blocked(x, y, false); };
        if (!fwd(dir)) {
          const alts = dir.x ? [DIRS.up, DIRS.down] : [DIRS.left, DIRS.right];
          const ok = alts.filter(fwd);
          if (ok.length) dir = ok[(Math.random() * ok.length) | 0];
        }
      }
      function tick() {
        tickN++;
        for (let i = lumps.length - 1; i >= 0; i--) if (++lumps[i] >= body.length) lumps.splice(i, 1);
        portalFrom = null;
        if (eatFx && eatFx.tick < tickN) { burst(eatFx.x, eatFx.y, eatFx.kind === 'poison' ? ['#B57AE8', '#8E44C9'] : ['#E7471D', '#FF8A65', '#FFD54F']); eatFx = null; }
        if (reverseNext) { reverseNext = false; reverse(); }
        if (queue.length) { const d = queue.shift(); if (!opp(d, dir)) dir = d; }
        let nx = body[0].x + dir.x, ny = body[0].y + dir.y;
        if (wrapMode()) { nx = (nx + cols) % cols; ny = (ny + rows) % rows; }
        const ai = apples.findIndex(a => a.x === nx && a.y === ny);
        const ap = ai >= 0 ? apples[ai] : null;
        if (ap && ap.kind === 'poison') return die('poison');
        const willGrow = grow > 0 || !!ap;
        const why = blocked(nx, ny, willGrow);
        if (why) return die(why);
        let hx = nx, hy = ny;
        if (ap && cfg.mode === 'portal') {
          const other = apples.find(a => a !== ap && a.pair === ap.pair);
          if (other) { portalFrom = { x: nx, y: ny }; hx = other.x; hy = other.y; }
        }
        body.unshift({ x: hx, y: hy, g: !body[0].g });
        if (ap) eat(ap, nx, ny);
        if (grow > 0) { grow--; lastTail = null; } else lastTail = body.pop();
      }
      function eat(ap, x, y) {
        grow++; score++; api.score(score); chomp = 1;
        if (ap.kind !== 'poison') lumps.push(0);
        eatFx = { x, y, kind: ap.kind, tick: tickN, ring: ap.pair >= 0 ? CFG.PAIR[ap.pair % CFG.PAIR.length] : null };
        if (cfg.mode === 'portal') { for (let i = apples.length - 1; i >= 0; i--) if (apples[i].pair === ap.pair) apples.splice(i, 1); sfx('portal'); }
        else apples.splice(apples.indexOf(ap), 1);
        sfx('eat');
        if (cfg.mode === 'wall') {
          const h = body[0];
          const cand = [];
          for (let yy = 0; yy < rows; yy++) for (let xx = 0; xx < cols; xx++) {
            if (occupied(xx, yy) || (xx === x && yy === y)) continue;
            if (Math.abs(xx - h.x) + Math.abs(yy - h.y) < CFG.WALL_GAP) continue;
            const ax = xx - h.x, ay = yy - h.y;
            if ((dir.x && ay === 0 && Math.sign(ax) === dir.x && Math.abs(ax) < 6) || (dir.y && ax === 0 && Math.sign(ay) === dir.y && Math.abs(ay) < 6)) continue;
            cand.push(idx(xx, yy));
          }
          if (cand.length) { walls[cand[(Math.random() * cand.length) | 0]] = 1; sfx('wall'); }
        }
        if (cfg.mode === 'speed') interval = CFG.TICK * CFG.SPEEDS[cfg.speed] * Math.max(CFG.SPEED_MODE_MIN, Math.pow(CFG.SPEED_MODE_MUL, score));
        if (cfg.mode === 'twin') reverseNext = true;
        const goods = () => apples.filter(a => a.kind !== 'poison').length;
        const want = cfg.mode === 'portal' ? cfg.count * 2 : cfg.count;
        let guard = 0;
        while (goods() < want && guard++ < 10 && spawnApple());
        if (cfg.mode === 'poison') placePoison();
        if (!goods()) win();
      }
      function finishRun() {
        if (submitted) return;
        submitted = true;
        const k = bestKey();
        if (score > (bests[k] || 0)) { bests[k] = score; store(); }
        api.submit(score);
      }
      function die(why) {
        deathWhy = why; setState('dying'); queue.length = 0; acc = 0;
        sfx('die'); finishRun();
      }
      function win() { won = true; setState('dying'); acc = 0; sfx('win'); finishRun(); }

      function burst(x, y, cols3) {
        for (let i = 0; i < 12; i++) {
          const a = Math.random() * TAU, v = (0.6 + Math.random()) * T * 3.2;
          parts.push({ x: px(x), y: py(y), vx: Math.cos(a) * v, vy: Math.sin(a) * v - T, life: 0.5 + Math.random() * 0.25, t: 0, c: cols3[i % cols3.length], r: T * (0.06 + Math.random() * 0.07) });
        }
      }


      function stepParts(dt) {
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i]; q.t += dt; q.vy += T * 14 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
          if (q.t > q.life) parts.splice(i, 1);
        }
      }
      function critter(dt) {
        if ((blink -= dt) < -0.12) blink = 2 + Math.random() * 3;
        tongue = Math.max(0, tongue - dt);
        if ((tongueT -= dt) <= 0) { tongue = 0.32; tongueT = 2.2 + Math.random() * 3; }
        chomp = Math.max(0, chomp - dt * 5);
      }
      api.on(window, 'keydown', e => {
        const d = KEYS[e.code];
        if (d || e.code === 'Space') e.preventDefault();
        if (state === 'settings') {
          if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); applySettings(); }
          return;
        }
        if (d) {
          e.preventDefault();
          if (state === 'play') turn(d);
          else if (state === 'title' || state === 'ready' || (state === 'over' && stateT > 0.35)) startPlay(d);
          return;
        }
        if (e.repeat) return;
        if ((state === 'title' || state === 'ready') && (e.code === 'Enter' || e.code === 'Space')) startPlay(null);
        else if (state === 'over' && stateT > 0.35 && (e.code === 'Enter' || e.code === 'Space')) startPlay(null);
      });

      const BTN = {
        sound: { x: W - 136, y: 0, w: 64, h: HDR },
        gear: { x: W - 68, y: 0, w: 64, h: HDR },
        play: { x: W / 2 - 160, y: 400, w: 236, h: 68 },
        menu: { x: W / 2 + 88, y: 400, w: 72, h: 68 }
      };
      const hit = (b, p) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
      const SET = (() => {
        const rowsDef = [
          ['speed', 'Speed', ['slow', 'normal', 'fast'], 66],
          ['count', 'Apples', CFG.COUNTS, 162],
          ['size', 'Board size', ['small', 'medium', 'large'], 258]
        ];
        const items = [];
        for (const [key, , vals, y] of rowsDef) {
          const w = 160, gap = 18, x0 = W / 2 - (w * 3 + gap * 2) / 2;
          vals.forEach((v, i) => items.push({ key, v, x: x0 + i * (w + gap), y, w, h: 64 }));
        }
        MODES.forEach((m, i) => {
          const row = i < 5 ? 0 : 1, n = row ? 4 : 5, j = row ? i - 5 : i, w = 104, gap = 12, x0 = W / 2 - (w * n + gap * (n - 1)) / 2;
          items.push({ key: 'mode', v: m[0], x: x0 + j * (w + gap), y: 354 + row * 74, w, h: 66 });
        });
        return { rowsDef, items, play: { x: W / 2 - 130, y: 548, w: 260, h: 66 } };
      })();
      let pending = null;
      function openSettings() { pending = { ...cfg }; setState('settings'); sfx('click'); }
      function applySettings() {
        Object.assign(cfg, pending); store();
        reset();
        setState('ready'); sfx('click');
      }

      let sw = null;
      canvas.addEventListener('contextmenu', e => e.preventDefault());
      canvas.addEventListener('pointerdown', e => {
        e.preventDefault();
        audio();
        if (e.pointerType === 'touch') coarse = true;
        const p = view.toLocal(e);
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        sw = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
        if (state === 'settings') {
          for (const it of SET.items) if (hit(it, p)) { pending[it.key] = it.v; sfx('click'); return; }
          if (hit(SET.play, p)) applySettings();
          sw = null;
          return;
        }
        if (hit(BTN.sound, p)) { snd = !snd; store(); sfx('click'); sw = null; return; }
        if (hit(BTN.gear, p) && state !== 'play') { openSettings(); sw = null; return; }
        if (state === 'title' || state === 'over') {
          if (state === 'over' && stateT < 0.35) { sw = null; return; }
          if (hit(BTN.menu, p)) { openSettings(); sw = null; return; }
          reset(); setState('ready'); sfx('click'); sw.ready = true;
        }
      });
      canvas.addEventListener('pointermove', e => {
        if (!sw || e.pointerId !== sw.id) { if (e.pointerType === 'mouse') hover = view.toLocal(e); return; }
        const dx = e.clientX - sw.x, dy = e.clientY - sw.y, ax = Math.abs(dx), ay = Math.abs(dy);
        if (Math.max(ax, ay) < 14) return;
        const d = ax > ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        if (state === 'play') turn(d);
        else if (state === 'ready') startPlay(d);
        sw.x = e.clientX; sw.y = e.clientY; sw.moved = true;
      });
      canvas.addEventListener('pointerup', e => {
        if (!sw || e.pointerId !== sw.id) return;
        if (!sw.moved && !sw.ready && state === 'ready') startPlay(null);
        sw = null;
      });
      canvas.addEventListener('pointercancel', () => { sw = null; });
      canvas.addEventListener('pointerleave', () => { hover = null; });


      reset();
      api.loop(dt => {
        clock += dt; stateT += dt;
        if (state === 'play') {
          acc += dt;
          let n = 0;
          while (acc >= interval && state === 'play' && n++ < 3) { acc -= interval; tick(); }
        } else if (state === 'dying' && stateT >= CFG.OVER_DELAY) setState('over');
        critter(dt);
        const want = Math.atan2(dir.y, dir.x);
        look += Math.atan2(Math.sin(want - look), Math.cos(want - look)) * (1 - Math.exp(-dt * 28));
        let target = 0;
        if (state === 'play' || state === 'ready') {
          for (let k = 1; k <= 2; k++) {
            let x = body[0].x + dir.x * k, y = body[0].y + dir.y * k;
            if (wrapMode()) { x = (x + cols) % cols; y = (y + rows) % rows; }
            if (apples.some(a => a.kind !== 'poison' && a.x === x && a.y === y)) target = 1;
          }
          if (eatFx && eatFx.tick === tickN) target = 1 - Math.min(1, acc / interval) * 1.4;
        }
        mouth += (Math.max(0, target) - mouth) * (1 - Math.exp(-dt * 18));
        stepParts(dt);
        render();
      });


      const PX = [], PY = [], RUN = [];
      function buildPath(p) {
        PX.length = PY.length = RUN.length = 0;
        const n = body.length;
        let cx = body[0].x, cy = body[0].y;
        PX.push(cx - dir.x * (1 - p)); PY.push(cy - dir.y * (1 - p)); RUN.push(0);
        let run = 0;
        for (let i = 1; i < n; i++) {
          const dx = wrapDelta(body[i].x - body[i - 1].x, cols), dy = wrapDelta(body[i].y - body[i - 1].y, rows);
          if (Math.abs(dx) + Math.abs(dy) !== 1) {
            run++;
            cx = body[i].x; cy = body[i].y;
            if (portalFrom && i === 1) { PX.push(cx + (portalFrom.x - cx) * p); PY.push(cy + (portalFrom.y - cy) * p); RUN.push(run); }
          } else { cx += dx; cy += dy; }
          PX.push(cx); PY.push(cy); RUN.push(run);
        }
        if (lastTail && state === 'play') {
          const t = body[n - 1], dx = wrapDelta(lastTail.x - t.x, cols), dy = wrapDelta(lastTail.y - t.y, rows);
          if (Math.abs(dx) + Math.abs(dy) === 1) { PX.push(cx + dx * (1 - p)); PY.push(cy + dy * (1 - p)); RUN.push(run); }
        }
      }
      function strokeSnake(offx, offy, flash) {
        const n = PX.length;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        let fill = '#E8F0FF';
        if (!flash) {
          fill = ctx.createLinearGradient(px(PX[0] + offx), py(PY[0] + offy), px(PX[n - 1] + offx), py(PY[n - 1] + offy));
          fill.addColorStop(0, skin.a); fill.addColorStop(1, skin.b);
        }
        ctx.strokeStyle = fill;
        const cheese = cfg.mode === 'cheese', wBody = T * 0.84;
        ctx.lineWidth = cheese ? T * 0.26 : wBody;
        ctx.beginPath();
        for (let k = 0; k < n; k++) {
          const x = px(PX[k] + offx), y = py(PY[k] + offy);
          if (k === 0 || RUN[k] !== RUN[k - 1]) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (!cheese) {
          ctx.fillStyle = fill;
          for (const L of lumps) {
            const f = Math.max(0, L - 1 + curP), a = Math.floor(f), b = Math.min(n - 1, a + 1);
            if (a >= n || RUN[a] !== RUN[b]) continue;
            const q = f - a;
            ctx.beginPath(); ctx.arc(px(PX[a] + (PX[b] - PX[a]) * q + offx), py(PY[a] + (PY[b] - PY[a]) * q + offy), wBody * 0.62, 0, TAU); ctx.fill();
          }
        }
        if (cheese) {
          ctx.lineWidth = wBody; ctx.beginPath();
          for (let k = 1; k < body.length && k < n; k++) {
            if (body[k].g) continue;
            const ax = k + 1 < n ? (PX[k] + PX[k + 1]) / 2 : PX[k], ay = k + 1 < n ? (PY[k] + PY[k + 1]) / 2 : PY[k];
            const bx = (PX[k] + PX[k - 1]) / 2, by = (PY[k] + PY[k - 1]) / 2;
            ctx.moveTo(px(ax + offx), py(ay + offy)); ctx.lineTo(px(PX[k] + offx), py(PY[k] + offy)); ctx.lineTo(px(bx + offx), py(by + offy));
          }
          ctx.stroke();
        }
        head(px(PX[0] + offx), py(PY[0] + offy), flash);
      }
      function head(x, y, flash) {
        const c = Math.cos(look), s = Math.sin(look), r = T * 0.46;
        const dead = state === 'dying' && !won || (state === 'over' && !won);
        if (tongue > 0 && mouth < 0.2 && !dead && state !== 'title') {
          const L = T * (0.18 + 0.26 * Math.sin((tongue / 0.32) * Math.PI)), bx = x + c * r * 0.8, by = y + s * r * 0.8, tx = bx + c * L, ty = by + s * L, f = T * 0.12;
          ctx.strokeStyle = '#E5394B'; ctx.lineWidth = Math.max(2, T * 0.07); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.lineTo(tx + (c - s) * f, ty + (s + c) * f); ctx.moveTo(tx, ty); ctx.lineTo(tx + (c + s) * f, ty + (s - c) * f); ctx.stroke();
        }
        disc(ctx, x, y, r, flash ? '#E8F0FF' : skin.a);
        if (mouth > 0.04 && !dead) {
          const m = Math.min(1, mouth);
          ctx.save(); ctx.translate(x + c * r * 0.78, y + s * r * 0.78); ctx.rotate(look);
          ctx.fillStyle = '#7A1430'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.36 * m + 1, r * 0.66 * m + 1, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#F06A8A'; ctx.beginPath(); ctx.ellipse(-r * 0.08, 0, r * 0.18 * m, r * 0.34 * m, 0, 0, TAU); ctx.fill();
          ctx.restore();
        }
        for (let side = -1; side <= 1; side += 2) {
          const ex = x + c * r * 0.16 - s * r * 0.5 * side, ey = y + s * r * 0.16 + c * r * 0.5 * side, er = r * 0.4;
          disc(ctx, ex, ey, er, COL.eye);
          if (dead) {
            const q = er * 0.55; ctx.strokeStyle = COL.pupil; ctx.lineWidth = Math.max(2, er * 0.32); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(ex - q, ey - q); ctx.lineTo(ex + q, ey + q); ctx.moveTo(ex + q, ey - q); ctx.lineTo(ex - q, ey + q); ctx.stroke();
          } else if (blink < 0) {
            ctx.strokeStyle = COL.pupil; ctx.lineWidth = Math.max(2, er * 0.3);
            ctx.beginPath(); ctx.moveTo(ex - s * er * 0.7, ey + c * er * 0.7); ctx.lineTo(ex + s * er * 0.7, ey - c * er * 0.7); ctx.stroke();
          } else {
            disc(ctx, ex + c * er * 0.38, ey + s * er * 0.38, er * 0.52, COL.pupil);
            disc(ctx, ex + c * er * 0.2 - er * 0.18, ey + s * er * 0.2 - er * 0.2, er * 0.18, '#fff');
          }
        }
      }
      function drawSnake(flash, prog, bumpT) {
        const p = prog === undefined ? (state === 'play' ? Math.min(1, acc / interval) : 1) : prog;
        buildPath(p); curP = p;
        const bt = bumpT === undefined ? (state === 'dying' && !won ? stateT : null) : bumpT;
        if (bt !== null) {
          const b = Math.sin(Math.min(1, bt / 0.22) * Math.PI) * 0.22;
          PX[0] = body[0].x + dir.x * b; PY[0] = body[0].y + dir.y * b;
        }
        ctx.save();
        ctx.beginPath(); ctx.rect(ox, oy, cols * T, rows * T); ctx.clip();
        if (wrapMode()) {
          let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
          for (let i = 0; i < PX.length; i++) { x0 = Math.min(x0, PX[i]); x1 = Math.max(x1, PX[i]); y0 = Math.min(y0, PY[i]); y1 = Math.max(y1, PY[i]); }
          for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
            const sx = a * cols, sy = b * rows;
            if (x1 + sx < -1 || x0 + sx > cols || y1 + sy < -1 || y0 + sy > rows) continue;
            strokeSnake(sx, sy, flash);
          }
        } else strokeSnake(0, 0, flash);
        ctx.restore();
      }

      function header() {
        ctx.fillStyle = COL.hdr; ctx.fillRect(0, 0, W, HDR);
        apple(ctx, 40, HDR / 2 + 2, 15);
        text(ctx, String(score), 66, HDR / 2 + 1, 26, '#fff', 'left');
        trophy(ctx, 150, HDR / 2 + 1, 28);
        text(ctx, String(bests[bestKey()] || 0), 176, HDR / 2 + 1, 26, '#fff', 'left');
        speaker(ctx, BTN.sound.x + 32, HDR / 2, 26, snd && !api.muted);
        ctx.globalAlpha = state === 'play' ? 0.35 : 1; gear(ctx, BTN.gear.x + 32, HDR / 2, 28); ctx.globalAlpha = 1;
        if (state === 'play' || state === 'ready') text(ctx, MODE_OF[cfg.mode][1], W / 2 + 30, HDR / 2 + 1, 18, 'rgba(255,255,255,.75)', 'center', 800);
      }
      function apples_() {
        for (const a of apples) {
          const age = clock - a.t, pop = Math.min(1, age / 0.25), s = (pop < 1 ? 1.25 * Math.sin(pop * Math.PI * 0.72) / Math.sin(Math.PI * 0.72) : 1) * (1 + Math.sin(clock * 4 + a.x) * 0.035);
          const ring = a.pair >= 0 ? CFG.PAIR[a.pair % CFG.PAIR.length] : null;
          if (ring) {
            ctx.save(); ctx.translate(px(a.x), py(a.y)); ctx.globalAlpha = 0.4; disc(ctx, 0, 0, T * 0.5, ring); ctx.rotate(clock * 2.4);
            ctx.strokeStyle = ring; ctx.lineWidth = T * 0.1; ctx.globalAlpha = 1;
            for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(0, 0, T * 0.5, k * TAU / 3, k * TAU / 3 + 1.3); ctx.stroke(); }
            ctx.restore(); ctx.globalAlpha = 1;
          }
          if (a.kind === 'poison') { ctx.globalAlpha = 0.25 + 0.15 * Math.sin(clock * 5); disc(ctx, px(a.x), py(a.y), T * 0.48, '#C58CF5'); ctx.globalAlpha = 1; }
          apple(ctx, px(a.x), py(a.y) + T * 0.05, T * 0.37 * s, a.kind);
        }
        if (eatFx && eatFx.tick === tickN && state === 'play') {
          const k = 1 - Math.min(1, acc / interval);
          apple(ctx, px(eatFx.x), py(eatFx.y) + T * 0.05, T * 0.37 * k, eatFx.kind);
        }
      }
      function card(title) {
        ctx.fillStyle = 'rgba(30,50,20,.38)'; ctx.fillRect(0, HDR, W, H - HDR);
        const x = W / 2 - 160, y = 170, w = 320, h = 200;
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.roundRect(x, y + 6, w, h, 14); ctx.fill();
        rr(ctx, x, y, w, h, 14, COL.card);
        if (title) {
          text(ctx, title, W / 2, y + 44, 30, '#fff');
          apple(ctx, W / 2 - 70, y + 118, 26);
          text(ctx, String(score), W / 2 - 70, y + 168, 30, '#fff');
          trophy(ctx, W / 2 + 70, y + 118, 46);
          text(ctx, String(bests[bestKey()] || 0), W / 2 + 70, y + 168, 30, '#fff');
        }
        const pb = BTN.play, mb = BTN.menu;
        const hv = hover && hit(pb, hover);
        rr(ctx, pb.x, pb.y + 4, pb.w, pb.h, 10, '#0B3D91'); rr(ctx, pb.x, pb.y, pb.w, pb.h, 10, hv ? '#1A63E0' : COL.btn);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(pb.x + 58, pb.y + 20); ctx.lineTo(pb.x + 58, pb.y + 48); ctx.lineTo(pb.x + 82, pb.y + 34); ctx.fill();
        text(ctx, 'Play', pb.x + 140, pb.y + 35, 30, '#fff');
        rr(ctx, mb.x, mb.y + 4, mb.w, mb.h, 10, '#0B3D91'); rr(ctx, mb.x, mb.y, mb.w, mb.h, 10, hover && hit(mb, hover) ? '#1A63E0' : COL.btn);
        gear(ctx, mb.x + mb.w / 2, mb.y + mb.h / 2, 34);
      }
      function titleCard() {
        ctx.fillStyle = 'rgba(30,50,20,.38)'; ctx.fillRect(0, HDR, W, H - HDR);
        const x = W / 2 - 160, y = 170, w = 320, h = 200;
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.roundRect(x, y + 6, w, h, 14); ctx.fill();
        rr(ctx, x, y, w, h, 14, COL.card);
        ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.clip();
        for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) { ctx.fillStyle = (i + j) & 1 ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,0)'; ctx.fillRect(x + i * 40, y + j * 40, 40, 40); }
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = COL.snake; ctx.lineWidth = 30;
        ctx.beginPath(); ctx.moveTo(x + 40, y + 150); ctx.lineTo(x + 120, y + 150); ctx.lineTo(x + 120, y + 100); ctx.lineTo(x + 200, y + 100); ctx.stroke();
        const sl = look; look = 0;
        const sT = T; T = 36; head(x + 205, y + 100, false); T = sT; look = sl;
        apple(ctx, x + 270, y + 104, 15);
        ctx.restore();
        text(ctx, 'Snake', W / 2, y + 44, 34, '#fff');
        trophy(ctx, x + 40, y + 46, 26);
        text(ctx, String(bests[bestKey()] || 0), x + 62, y + 47, 22, '#fff', 'left');
        const pb = BTN.play, mb = BTN.menu;
        rr(ctx, pb.x, pb.y + 4, pb.w, pb.h, 10, '#0B3D91'); rr(ctx, pb.x, pb.y, pb.w, pb.h, 10, hover && hit(pb, hover) ? '#1A63E0' : COL.btn);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(pb.x + 58, pb.y + 20); ctx.lineTo(pb.x + 58, pb.y + 48); ctx.lineTo(pb.x + 82, pb.y + 34); ctx.fill();
        text(ctx, 'Play', pb.x + 140, pb.y + 35, 30, '#fff');
        rr(ctx, mb.x, mb.y + 4, mb.w, mb.h, 10, '#0B3D91'); rr(ctx, mb.x, mb.y, mb.w, mb.h, 10, hover && hit(mb, hover) ? '#1A63E0' : COL.btn);
        gear(ctx, mb.x + mb.w / 2, mb.y + mb.h / 2, 34);
      }
      function chipIcon(it, x, y) {
        if (it.key === 'speed') {
          const n = it.v === 'slow' ? 1 : it.v === 'normal' ? 2 : 3;
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          for (let i = 0; i < n; i++) { const cx = x + (i - (n - 1) / 2) * 14; ctx.beginPath(); ctx.moveTo(cx - 5, y - 10); ctx.lineTo(cx + 5, y); ctx.lineTo(cx - 5, y + 10); ctx.stroke(); }
        } else if (it.key === 'count') {
          const n = it.v, r = n > 3 ? 6 : 8, sp = n > 3 ? 12 : 17;
          for (let i = 0; i < n; i++) apple(ctx, x - 6 + (i - (n - 1) / 2) * sp, y + 3, r);
        } else if (it.key === 'size') {
          const s = it.v === 'small' ? 22 : it.v === 'medium' ? 30 : 38, k = it.v === 'small' ? 3 : it.v === 'medium' ? 4 : 5, c = s / k;
          for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) { ctx.fillStyle = (i + j) & 1 ? COL.dark : COL.light; ctx.fillRect(x - s / 2 + i * c, y - s / 2 + j * c, c + 0.5, c + 0.5); }
        } else modeIcon(ctx, it.v, x, y, 36);
      }
      function settings() {
        ctx.fillStyle = COL.menu; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        for (let y = 0; y < H; y += 40) for (let x = ((y / 40) & 1) * 40; x < W; x += 80) ctx.fillRect(x, y, 40, 40);
        text(ctx, 'Settings', W / 2, 26, 26, '#fff');
        for (const [key, label, , y] of SET.rowsDef) text(ctx, label, SET.items.find(i => i.key === key).x, y - 14, 17, 'rgba(255,255,255,.85)', 'left', 800);
        const m = MODE_OF[pending.mode];
        text(ctx, 'Mode · ' + m[1], SET.items.find(i => i.key === 'mode').x, 340, 17, 'rgba(255,255,255,.85)', 'left', 800);
        for (const it of SET.items) {
          const on = pending[it.key] === it.v;
          rr(ctx, it.x, it.y, it.w, it.h, 10, on ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.2)');
          if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(it.x + 1.5, it.y + 1.5, it.w - 3, it.h - 3, 9); ctx.stroke(); }
          const label = it.key === 'mode' ? MODE_OF[it.v][1] : it.key === 'count' ? String(it.v) : it.v[0].toUpperCase() + it.v.slice(1);
          if (it.key === 'mode') { chipIcon(it, it.x + it.w / 2, it.y + 25); text(ctx, label, it.x + it.w / 2, it.y + it.h - 11, 13, '#fff', 'center', 800); }
          else { chipIcon(it, it.x + 44, it.y + it.h / 2); text(ctx, label, it.x + 100, it.y + it.h / 2 + 1, 18, '#fff', 'center', 800); }
        }
        text(ctx, m[2], W / 2, 520, 16, '#fff', 'center', 700);
        const pb = SET.play;
        rr(ctx, pb.x, pb.y + 4, pb.w, pb.h, 10, '#0B3D91'); rr(ctx, pb.x, pb.y, pb.w, pb.h, 10, COL.btn);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(pb.x + 70, pb.y + 19); ctx.lineTo(pb.x + 70, pb.y + 47); ctx.lineTo(pb.x + 94, pb.y + 33); ctx.fill();
        text(ctx, 'Play', pb.x + 150, pb.y + 34, 30, '#fff');
      }
      function readyHint() {
        const a = 0.55 + 0.35 * Math.sin(clock * 5);
        ctx.globalAlpha = a;
        const cx = W / 2, cy = oy + rows * T * 0.78;
        if (coarse) {
          rr(ctx, cx - 120, cy - 26, 240, 52, 26, 'rgba(0,0,0,.35)');
          text(ctx, 'Swipe to start', cx, cy + 1, 22, '#fff');
        } else {
          const k = 40;
          const keycap = (x, y, ang) => {
            rr(ctx, x - k / 2, y - k / 2, k, k, 8, 'rgba(0,0,0,.35)');
            ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -8); ctx.lineTo(-5, 8); ctx.fill(); ctx.restore();
          };
          keycap(cx, cy - k / 2 - 3, -Math.PI / 2); keycap(cx - k - 6, cy + k / 2 + 3, Math.PI); keycap(cx, cy + k / 2 + 3, Math.PI / 2); keycap(cx + k + 6, cy + k / 2 + 3, 0);
        }
        ctx.globalAlpha = 1;
      }
      function render() {
        ctx.clearRect(0, 0, W, H);
        if (state === 'settings') { settings(); return; }
        ctx.drawImage(boardImg, 0, 0, W, H);
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (walls[idx(x, y)]) bricks(ctx, ox + x * T, oy + y * T, T);
        apples_();
        const flash = state === 'dying' && stateT < CFG.DIE_FLASH && (Math.floor(stateT / 0.15) & 1) === 1;
        if (!(state === 'dying' && won && (Math.floor(stateT / 0.15) & 1))) drawSnake(flash);
        for (const q of parts) { ctx.globalAlpha = Math.max(0, 1 - q.t / q.life); disc(ctx, q.x, q.y, q.r, q.c); }
        ctx.globalAlpha = 1;
        header();
        if (state === 'ready') readyHint();
        else if (state === 'title') titleCard();
        else if (state === 'over') card(won ? 'You win!' : deathWhy === 'poison' ? 'Poisoned!' : 'Game over');
      }

      root.__sn = {
        snap: () => ({ state, score, len: body.length, dir, cols, rows, apples: apples.map(a => ({ ...a })), walls: walls.reduce((s, v) => s + v, 0), mode: cfg.mode, interval, queue: queue.length, submitted }),
        set: o => { Object.assign(cfg, o); reset(); setState('ready'); },
        body: () => body.map(b => ({ ...b }))
      };
      return {
        destroy() {
          delete root.__sn;
          if (ac) { try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {} ac = null; }
        }
      };
    }
  });

  Ameplay.covers['snake'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><pattern id="snk2-ck" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#AAD751"/><rect width="40" height="40" fill="#A2D149"/><rect x="40" y="40" width="40" height="40" fill="#A2D149"/></pattern></defs>
<rect width="400" height="300" fill="#578A34"/>
<rect x="0" y="0" width="400" height="44" fill="#4A752C"/>
<rect x="12" y="56" width="376" height="232" rx="6" fill="url(#snk2-ck)"/>
<circle cx="30" cy="23" r="11" fill="#E7471D"/><path d="M30 13q2-6 7-7" stroke="#6B3F1F" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="37" cy="12" rx="6" ry="3" fill="#5BA62F" transform="rotate(-30 37 12)"/>
<rect x="50" y="17" width="16" height="12" rx="3" fill="#fff"/>
<path d="M92 13h20q0 14-10 15q-10-1-10-15z" fill="#FFC107"/><rect x="99" y="27" width="6" height="5" fill="#FFC107"/><rect x="95" y="31" width="14" height="4" rx="1" fill="#FFC107"/>
<path d="M52 254H132V174H252V134" stroke="#4E7CF6" stroke-width="34" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44 248H124V168H244" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/>
<circle cx="252" cy="128" r="22" fill="#4E7CF6"/>
<ellipse cx="252" cy="104" rx="11" ry="9" fill="#7A1430"/><ellipse cx="252" cy="108" rx="6" ry="4" fill="#F06A8A"/>
<circle cx="240" cy="132" r="9" fill="#fff"/><circle cx="264" cy="132" r="9" fill="#fff"/><circle cx="240" cy="128" r="5" fill="#1f2a44"/><circle cx="264" cy="128" r="5" fill="#1f2a44"/><circle cx="238" cy="126" r="1.8" fill="#fff"/><circle cx="262" cy="126" r="1.8" fill="#fff"/>
<circle cx="252" cy="78" r="17" fill="#C4361A"/><circle cx="250" cy="76" r="16" fill="#E7471D"/><ellipse cx="243" cy="70" rx="4" ry="6" fill="#fff" opacity=".45" transform="rotate(30 243 70)"/>
<path d="M252 62q1-8 6-11" stroke="#6B3F1F" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="262" cy="56" rx="8" ry="4" fill="#5BA62F" transform="rotate(-32 262 56)"/>
<circle cx="330" cy="236" r="15" fill="#C4361A"/><circle cx="328" cy="234" r="14" fill="#E7471D"/><path d="M330 221q1-7 5-9" stroke="#6B3F1F" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="339" cy="215" rx="7" ry="3.5" fill="#5BA62F" transform="rotate(-32 339 215)"/>
<g stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"><path d="M222 60l-8-8M282 60l8-8M252 46v-10"/></g>
</svg>`;
})();

