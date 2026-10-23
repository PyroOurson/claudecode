
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const FONT = 'Nunito, system-ui, sans-serif';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const damp = (k, dt) => 1 - Math.exp(-k * dt);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeBack = t => { const u = t - 1; return 1 + 2.70158 * u * u * u + 1.70158 * u * u; };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };

  const uiScale = (canvas, w) => 1 / clamp((canvas.clientWidth || w) / w, 0.5, 1);

  function dot(ctx, x, y, r, color) {
    if (!(r > 0)) return;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = color; ctx.fill();
  }
  function ring(ctx, x, y, r, color, lw) {
    if (!(r > 0)) return;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
  }
  function txt(ctx, s, x, y, size, color, align = 'center', outline) {
    ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (outline) { ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.strokeStyle = outline; ctx.strokeText(s, x, y); }
    ctx.fillStyle = color; ctx.fillText(s, x, y);
  }
  function shaker() {
    let a = 0;
    return {
      kick(v) { a = Math.max(a, v); },
      apply(ctx, dt) { a = Math.max(0, a - dt * 9); if (a) ctx.translate(rand(-a, a), rand(-a, a)); }
    };
  }
  function layer(w, h, draw) {
    const c = document.createElement('canvas'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    const g = c.getContext('2d');
    g.scale(dpr, dpr); draw(g, w, h);
    return c;
  }

  function burst(list, x, y, cols, n = 10, sp = 220) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rand(-0.3, 0.3), v = rand(0.5, 1) * sp;
      list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rand(0.4, 0.7), col: cols[i % cols.length], s: rand(2.2, 4.2) });
    }
  }
  function stepParts(list, dt, grav = 0) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      if ((p.t += dt) >= p.life) { list.splice(i, 1); continue; }
      if (p.vx !== undefined) { const d = Math.exp(-3 * dt); p.vy += grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= d; p.vy *= d; }
    }
  }
  function drawParts(ctx, list, ui = 1) {
    for (const p of list) {
      const k = p.t / p.life;
      if (p.s !== undefined && p.text === undefined) { ctx.globalAlpha = 1 - k; dot(ctx, p.x, p.y, p.s * (1 - k * 0.4), p.col); continue; }
      ctx.globalAlpha = k < 0.12 ? k / 0.12 : 1 - Math.max(0, k - 0.5) / 0.5;
      txt(ctx, p.text, p.x, p.y - 26 * easeOut(k), (p.size || 22) * Math.min(ui, 1.4), p.col, 'center', 'rgba(20,20,40,.45)');
    }
    ctx.globalAlpha = 1;
  }
  const popText = (list, x, y, text, col, size, life = 0.9) => list.push({ x, y, text, col, size, t: 0, life });

  const segCss = id => `
.gm-${id} .seg-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.gm-${id} .seg{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:var(--sunk)}
.gm-${id} .seg[hidden]{display:none}
.gm-${id} .seg button{height:32px;padding:0 14px;border:0;border-radius:999px;background:none;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap}
.gm-${id} .seg button:hover{color:var(--ink)}
.gm-${id} .seg button[aria-pressed="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 12px -6px rgba(108,92,231,.55)}
@media (max-width:520px){.gm-${id} .seg button{height:30px;padding:0 10px;font-size:12px}}
@media (pointer:coarse){.gm-${id} .seg button{height:40px}}`;
  function segBar(parent, groups, sel, onPick) {
    const bar = document.createElement('div');
    bar.className = 'seg-bar';
    bar.innerHTML = groups.map(([k, items]) => `<div class="seg" data-g="${k}">${items.map(([v, t]) => `<button type="button" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`).join('');
    const sync = () => bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(sel[b.dataset.k] === b.dataset.v)));
    bar.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      b.blur();
      if (sel[b.dataset.k] === b.dataset.v) return;
      sel[b.dataset.k] = b.dataset.v;
      sync(); onPick(b.dataset.k);
    });
    sync(); parent.append(bar);
    return bar;
  }


  const BK_COLORS = ['#ff5d73', '#ff8f4d', '#ffc53d', '#7ed957', '#35d0c0', '#4cb3ff', '#7c7cf8', '#c86ff0'];
  const BK_LEVELS = [
    ['2222222222', '1111111111', '1111111111', '1111111111', '1111111111'],
    ['....22....', '...2112...', '..211112..', '.21111112.', '2111111112'],
    ['2.2.2.2.2.', '.2.2.2.2.2', '1.1.1.1.1.', '.1.1.1.1.1', '1.1.1.1.1.', '.1.1.1.1.1'],
    ['222.22.222', '111.11.111', '111.11.111', '111.11.111', '111.11.111', '111.11.111'],
    ['....11....', '...1221...', '..122221..', '.12233221.', '..122221..', '...1221...', '....11....'],
    ['X22222222X', 'X11111111X', 'X11.XX.11X', 'X11111111X', '1111111111'],
    ['..1....1..', '...1..1...', '..222222..', '.22.22.22.', '2222222222', '2.222222.2', '2.2....2.2', '...22.22..'],
    ['3333333333', '..........', '2222222222', '..........', '1111111111', '1111111111'],
    ['.11....11.', '1221..1221', '1222112221', '1222222221', '.12222221.', '..122221..', '...1221...', '....11....'],
    ['3333333333', '2222222222', 'X.XX..XX.X', '1111111111', '1111111111', '1111111111']
  ];
  const BK_POW = { multi: ['3', '#a855f7', 'Multi-ball!'], wide: ['W', '#22b07d', 'Wide paddle!'], laser: ['L', '#ef4f4f', 'Lasers! Hold to fire'], slow: ['S', '#3d8bfd', 'Slow ball'], life: ['+', '#ff6fae', 'Extra ball!'] };
  const BK_BAG = ['multi', 'multi', 'multi', 'wide', 'wide', 'wide', 'laser', 'laser', 'slow', 'slow', 'life'];

  Ameplay.register({
    id: 'breakout',
    title: 'Breakout',
    category: 'Arcade',
    blurb: 'Smash the wall, catch power-ups and keep the ball in play.',
    help: 'Move the mouse or drag to steer · <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> · click, tap or <kbd>Space</kbd> to launch and fire lasers',
    better: 'high',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="10" width="14" height="7" rx="2"/><rect x="25" y="10" width="14" height="7" rx="2"/><rect x="42" y="10" width="14" height="7" rx="2"/><rect x="8" y="21" width="14" height="7" rx="2" opacity=".3"/><rect x="42" y="21" width="14" height="7" rx="2" opacity=".3"/><circle cx="35" cy="39" r="3.5" fill="currentColor" stroke="none"/><path d="M22 52h20" stroke-width="4"/></svg>',
    css: '.gm-breakout .g-canvas{cursor:none;box-shadow:0 14px 34px -18px rgba(40,30,110,.8)}' +

      '@media (pointer:coarse){.gm-breakout{touch-action:none;justify-content:flex-start;gap:0}.gm-breakout::after{content:"Drag here to steer";display:flex;align-items:center;justify-content:center;width:100%;height:96px;margin-top:10px;border:2px dashed var(--line-2);border-radius:var(--r);font:800 13px/1 var(--sans);color:var(--muted);text-align:center;padding:0 12px}}',
    mount(root, api) {
      const W = 800, H = 560, COLS = 10, ROWS = 8, GAP = 4, MX = 22, TOP = 64, CEIL = 42, BH = 24, PH = 16, PY = H - 46, R = 8, PW0 = 112;
      const BW = (W - MX * 2 - GAP * (COLS - 1)) / COLS;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      const keys = api.keys, sh = shaker(), sprites = new Map(), fx = [], frags = [];
      const PAD_COL = ['#b8fff4', '#2ec4b6', '#13867c', 'rgba(53,208,192,.18)', '#35d0c0'];
      const newPad = (i, x) => ({ i, x, tg: x, v: 0, w: PW0, wideT: 0, laserT: 0, fireCd: 0, squash: 0, held: false });
      let state = 'ready', grid = [], live = 0, balls = [], drops = [], bolts = [];
      let idleT = 0, lives = 3, level = 1, score = 0, base = 370, cap = 610, speed = 370, pads = [newPad(0, W / 2)];
      let slowT = 0, banner = 0, clock = 0, wait = 0;
      const lmax = () => 5;

      const bgL = layer(W + 12, H + 12, g => {
        g.translate(6, 6);
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#302c6e'); gr.addColorStop(1, '#16153a');
        g.fillStyle = gr; g.fillRect(-6, -6, W + 12, H + 12);
        for (const [x, y, r, c] of [[W * 0.18, H * 0.3, 260, 'rgba(168,85,247,.22)'], [W * 0.86, H * 0.78, 300, 'rgba(255,93,143,.16)'], [W * 0.6, H * 0.05, 200, 'rgba(76,179,255,.14)']]) {
          const rg = g.createRadialGradient(x, y, 0, x, y, r);
          rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = rg; g.fillRect(-6, -6, W + 12, H + 12);
        }
        g.fillStyle = 'rgba(255,255,255,.07)';
        for (let x = 13; x < W; x += 26) for (let y = CEIL + 13; y < H; y += 26) g.fillRect(x - 1, y - 1, 2, 2);
        g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-6, -6, W + 12, CEIL + 6);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(-6, CEIL - 2, W + 12, 2);
      });
      function brickArt(g, col, hp, steel) {
        const top = steel ? '#eef1f7' : mix(col, '#ffffff', 0.4), mid = steel ? '#a7b1c2' : col, bot = steel ? '#6c778a' : mix(col, '#000000', 0.2);
        g.fillStyle = steel ? '#4b5566' : mix(col, '#000000', 0.4);
        g.beginPath(); g.roundRect(0, 2, BW, BH - 2, 6); g.fill();
        const lg = g.createLinearGradient(0, 0, 0, BH - 3);
        lg.addColorStop(0, top); lg.addColorStop(0.55, mid); lg.addColorStop(1, bot);
        g.fillStyle = lg; g.beginPath(); g.roundRect(0, 0, BW, BH - 3, 6); g.fill();
        g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.roundRect(6, 3, BW - 12, 4.5, 2.25); g.fill();
        if (steel) {
          g.fillStyle = '#596476';
          for (const [x, y] of [[6, 7], [BW - 6, 7], [6, BH - 9], [BW - 6, BH - 9]]) { g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); }
        } else if (hp >= 2) {
          g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; g.beginPath(); g.roundRect(4.5, 4.5, BW - 9, BH - 12, 4); g.stroke();
        }
        if (hp >= 3 && !steel) {
          g.fillStyle = 'rgba(255,255,255,.9)';
          for (const [x, y] of [[9, 9], [BW - 9, 9], [9, BH - 10], [BW - 9, BH - 10]]) { g.beginPath(); g.arc(x, y, 1.8, 0, TAU); g.fill(); }
        }
      }
      function sprite(b) {
        const key = b.steel ? 'steel' : b.col + b.hp;
        let s = sprites.get(key);
        if (!s) { s = layer(BW, BH, g => brickArt(g, b.col, b.hp, b.steel)); sprites.set(key, s); }
        return s;
      }
      const newBall = (x, y, vx, vy, own = 0) => ({ x, y, vx, vy, own, tr: new Float32Array(24), ti: 0, tn: 0 });
      function renorm() {
        for (const b of balls) { const m = Math.hypot(b.vx, b.vy); if (m) { b.vx *= speed / m; b.vy *= speed / m; } }
      }
      function steep(b) {
        const s = Math.hypot(b.vx, b.vy), min = 0.4 * s;
        if (s && Math.abs(b.vy) < min) { b.vy = (b.vy <= 0 ? -1 : 1) * min; b.vx = (b.vx < 0 ? -1 : 1) * Math.sqrt(s * s - min * min); }
      }

      function build() {
        const L = BK_LEVELS[(level - 1) % BK_LEVELS.length], loop = Math.floor((level - 1) / BK_LEVELS.length);
        grid = new Array(COLS * ROWS).fill(null); live = 0;
        L.forEach((row, r) => {
          for (let c = 0; c < COLS; c++) {
            const ch = row[c];
            if (ch === '.') continue;
            const steel = ch === 'X';
            let hp = steel ? 1 : +ch;
            if (!steel && loop && Math.random() < 0.25 * loop) hp = Math.min(3, hp + 1);
            grid[r * COLS + c] = { c, r, x: MX + c * (BW + GAP), y: TOP + r * (BH + GAP), hp, max: hp, steel, col: BK_COLORS[r % 8], flash: 0, crack: null, born: clock + 0.1 + r * 0.05 + c * 0.02 };
            if (!steel) live++;
          }
        });
        base = Math.min(560, 370 + 26 * (level - 1)); cap = Math.min(840, base + 240); speed = base;
        drops = []; bolts = [];
      }
      function serve() { state = 'serve'; balls = [newBall(pads[0].x, PY - R - 1, 0, 0, 0)]; }
      function begin() {
        lives = 3; level = 1; score = 0; frags.length = 0; fx.length = 0;
        slowT = 0; pads[0].wideT = pads[0].laserT = 0; pads[0].held = false;
        build(); serve(); banner = 1.8;
        api.score(0);
      }
      function launch() {
        state = 'play'; idleT = 0;
        const a = (Math.random() < 0.5 ? -1 : 1) * rand(0.12, 0.38) + clamp(pads[0].v / 3000, -0.25, 0.25), b = balls[0];
        b.vx = Math.sin(a) * speed; b.vy = -Math.cos(a) * speed;
        api.sfx('tap');
      }
      function fire(p) {
        if (p.laserT <= 0 || p.fireCd > 0 || state !== 'play') return;
        p.fireCd = 0.2;
        bolts.push({ x: p.x - p.w / 2 + 12, y: PY - 6, own: p.i }, { x: p.x + p.w / 2 - 12, y: PY - 6, own: p.i });
        api.sfx('tick');
      }
      function brickAt(x, y, r) {
        const c0 = Math.max(0, Math.floor((x - r - MX) / (BW + GAP))), c1 = Math.min(COLS - 1, Math.floor((x + r - MX) / (BW + GAP)));
        const r0 = Math.max(0, Math.floor((y - r - TOP) / (BH + GAP))), r1 = Math.min(ROWS - 1, Math.floor((y + r - TOP) / (BH + GAP)));
        for (let rr = r0; rr <= r1; rr++) for (let c = c0; c <= c1; c++) {
          const b = grid[rr * COLS + c];
          if (!b) continue;
          const dx = x - clamp(x, b.x, b.x + BW), dy = y - clamp(y, b.y, b.y + BH);
          if (dx * dx + dy * dy < r * r) return b;
        }
        return null;
      }
      function crack(b) {
        const x0 = b.x + rand(BW * 0.3, BW * 0.7), main = [[x0, b.y]];
        for (let i = 1; i <= 3; i++) main.push([x0 + rand(-9, 9), b.y + (BH - 3) * i / 3]);
        const s = Math.random() < 0.5 ? -1 : 1, m = main[1];
        return [main, [m, [m[0] + s * rand(8, 14), m[1] + rand(3, 6)]]];
      }
      function damage(b, own) {
        b.flash = 1;
        if (b.steel) { api.sfx('tick'); return; }
        idleT = 0;
        if (--b.hp > 0) { b.crack = crack(b); api.sfx('tick'); return; }
        grid[b.r * COLS + b.c] = null; live--;
        score += 10 * b.max; api.score(score);
        speed = Math.min(cap, speed + 4); renorm();
        for (let i = 0; i < 9; i++) frags.push({ x: b.x + rand(4, BW - 4), y: b.y + rand(3, BH - 3), vx: rand(-160, 160), vy: rand(-220, 20), w: rand(5, 12), h: rand(4, 8), r: rand(0, TAU), vr: rand(-9, 9), life: 1, col: b.col });
        if (Math.random() < 0.15 && drops.length < 3) {
          const k = BK_BAG[(Math.random() * BK_BAG.length) | 0];
          if (k !== 'life' || lives < lmax()) drops.push({ x: b.x + BW / 2, y: b.y + BH / 2, k, t: 0 });
        }
        api.sfx('pop');
        if (!live) {
          state = 'clear'; wait = 1.4;
          drops = []; bolts = [];
          score += 100 * level; api.score(score); popText(fx, W / 2, H / 2 + 20, `Level clear! +${100 * level}`, '#ffd166', 30, 1.3);
          api.sfx('win');
        }
      }
      function power(k, p) {
        const [, col, name] = BK_POW[k];
        score += 25; api.score(score);
        api.sfx('good');
        popText(fx, p.x, PY - 36, name, col, 20, 1.1);
        burst(fx, p.x, PY, [col, '#fff'], 12, 200);
        if (k === 'multi') {
          for (const b of balls.slice(0, 3)) {
            for (const turn of [-0.45, 0.45]) {
              if (balls.length >= 8) break;
              const a = Math.atan2(b.vx, -b.vy) + turn, nb = newBall(b.x, b.y, Math.sin(a) * speed, -Math.cos(a) * speed, b.own);
              steep(nb); balls.push(nb);
            }
          }
        } else if (k === 'wide') p.wideT = 14;
        else if (k === 'laser') p.laserT = 10;
        else if (k === 'slow') slowT = 10;
        else lives = Math.min(lmax(), lives + 1);
      }
      function lose() {
        lives--; sh.kick(5); slowT = 0; for (const p of pads) p.wideT = p.laserT = 0; drops = []; bolts = [];
        if (lives > 0) { api.sfx('bad'); speed = Math.max(base, speed * 0.85); serve(); return; }
        state = 'over';
        api.sfx('lose');
        const nb = api.submit(score);
        api.timeout(() => api.overlay({
          kicker: nb ? 'New best!' : 'Game over', title: 'Out of balls',
          stats: [['Score', score], ['Level', level], ['Best', api.best ?? '—']],
          button: 'Play again', onAction: begin
        }), 700);
      }
      function physics(dt) {
        const sf = slowT > 0 ? 0.62 : 1;
        if ((idleT += dt) > 10) {
          idleT = 7;
          for (const b of balls) { const a = rand(-.14, .14), c = Math.cos(a), s = Math.sin(a), vx = b.vx * c - b.vy * s; b.vy = b.vx * s + b.vy * c; b.vx = vx; }
        }
        for (let j = balls.length - 1; j >= 0; j--) {
          const b = balls[j], n = Math.max(1, Math.ceil(speed * sf * dt / 4)), h = dt * sf / n;
          for (let i = 0; i < n; i++) {
            let br;
            b.x += b.vx * h;
            if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
            else if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); }
            else if ((br = brickAt(b.x, b.y, R))) { b.x -= b.vx * h; b.vx = -b.vx; damage(br, b.own); }
            b.y += b.vy * h;
            if (b.y < CEIL + R) { b.y = CEIL + R; b.vy = Math.abs(b.vy); }
            else if ((br = brickAt(b.x, b.y, R))) { b.y -= b.vy * h; b.vy = -b.vy; damage(br, b.own); }
            if (state !== 'play') return;
            const pd = b.vy > 0 && b.y + R >= PY && b.y < PY + PH ? pads.find(q => Math.abs(b.x - q.x) < q.w / 2 + R * 0.75) : null;
            if (pd) {
              const a = clamp((b.x - pd.x) / (pd.w / 2), -1, 1) * 1.05;
              b.vx = Math.sin(a) * speed; b.vy = -Math.cos(a) * speed; b.y = PY - R;
              pd.squash = 1; b.own = pd.i; api.sfx('tap');
            }
            if (b.y - R > H) { balls.splice(j, 1); break; }
          }
        }
        if (!balls.length) lose();
      }

      api.on(window, 'pointermove', e => {
        pads[0].tg = toLocal(e).x;
      });
      root.addEventListener('pointerdown', e => {
        if (e.button) return;
        e.preventDefault();
        const x = toLocal(e).x, p = pads[0];
        p.tg = x; p.held = true;
        if (state === 'serve') launch(); else fire(p);
      });
      const unhold = () => { pads[0].held = false; };
      api.on(window, 'pointerup', unhold);
      api.on(window, 'pointercancel', unhold);
      api.on(window, 'keydown', e => {
        if (!(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) return;
        if (state === 'serve') { if (!e.repeat) launch(); } else fire(pads[0]);
      });

      api.loop(dt => {
        clock += dt;
        if (state !== 'over') {
          pads[0].tg += ((keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0)) * 900 * dt;
        }
        for (const p of pads) {
          p.w += ((p.wideT > 0 ? 172 : PW0) - p.w) * damp(12, dt);
          p.tg = clamp(p.tg, p.w / 2, W - p.w / 2);
          p.v = dt ? (p.tg - p.x) / dt : 0; p.x = p.tg;
          p.squash = Math.max(0, p.squash - dt * 5);
          p.fireCd -= dt;
          if (p.held) fire(p);
        }
        if (state === 'serve' || state === 'ready') { const b = balls[0]; if (b) { b.x = pads[0].x; b.y = PY - R - 1; } }
        else if (state === 'play') {
          for (const p of pads) { p.wideT -= dt; p.laserT -= dt; }
          slowT -= dt;
          physics(dt);
          for (let i = bolts.length - 1; i >= 0; i--) {
            const z = bolts[i];
            if (!z) break;
            const br = (z.y -= 950 * dt) < CEIL ? null : brickAt(z.x, z.y, 3);
            if (z.y < CEIL || br) { bolts.splice(i, 1); if (br) { damage(br, z.own); burst(fx, z.x, z.y, ['#ff6b6b', '#ffd166'], 5, 120); } }
          }
          for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i];
            d.t += dt; d.y += 165 * dt;
            const pd = d.y + 11 >= PY && d.y - 11 <= PY + PH ? pads.find(q => Math.abs(d.x - q.x) < q.w / 2 + 18) : null;
            if (pd) { drops.splice(i, 1); power(d.k, pd); }
            else if (d.y > H + 20) drops.splice(i, 1);
          }
        } else if (state === 'clear' && (wait -= dt) <= 0) {
          level++; build(); serve(); banner = 1.8;
        }
        for (const b of balls) { b.tr[b.ti * 2] = b.x; b.tr[b.ti * 2 + 1] = b.y; b.ti = (b.ti + 1) % 12; b.tn = Math.min(12, b.tn + 1); }
        banner = Math.max(0, banner - dt);
        for (let i = frags.length - 1; i >= 0; i--) {
          const f = frags[i];
          f.vy += 1100 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.r += f.vr * dt;
          if ((f.life -= dt * 1.4) <= 0) frags.splice(i, 1);
        }
        stepParts(fx, dt);
        render(dt);
      });

      function drawBall(b) {
        for (let i = 1; i < b.tn; i++) {
          const j = (b.ti - 1 - i + 24) % 12;
          ctx.globalAlpha = 0.32 * (1 - i / b.tn);
          dot(ctx, b.tr[j * 2], b.tr[j * 2 + 1], R * (1 - i / 14), slowT > 0 ? '#7cc4ff' : '#ffd166');
        }
        ctx.globalAlpha = 0.16; dot(ctx, b.x, b.y, R * 2, '#fff'); ctx.globalAlpha = 1;
        dot(ctx, b.x, b.y, R, '#fff');
        dot(ctx, b.x + 1.5, b.y + 1.8, R * 0.62, '#dfe3ff');
        dot(ctx, b.x - 2.4, b.y - 2.6, R * 0.32, '#fff');
      }
      function render(dt) {
        const ui = uiScale(canvas, W), s = Math.min(ui, 1.4);
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        sh.apply(ctx, dt);
        ctx.drawImage(bgL, -6, -6, W + 12, H + 12);
        for (let i = 0; i < Math.max(3, lives); i++) {
          const x = MX + 8 * s + i * 20 * s;
          if (i < lives) { dot(ctx, x, 21, 6.5 * s, '#fff'); dot(ctx, x + 1, 22, 4 * s, '#dfe3ff'); } else ring(ctx, x, 21, 5.5 * s, 'rgba(255,255,255,.3)', 2);
        }
        txt(ctx, 'LEVEL ' + level, W - MX, 21, 15 * s, 'rgba(255,255,255,.85)', 'right');
        let px = W / 2 - 75;
        for (const [k, t, max] of [['wide', pads[0].wideT, 14], ['laser', pads[0].laserT, 10], ['slow', slowT, 10]]) {
          if (t <= 0 || state !== 'play') continue;
          const [ch, col] = BK_POW[k];
          dot(ctx, px, 21, 11, col); txt(ctx, ch, px, 21.5, 12, '#fff');
          ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(px, 21, 14.5, -Math.PI / 2, -Math.PI / 2 + TAU * (t / max)); ctx.stroke();
          px += 75;
        }

        for (const b of grid) {
          if (!b) continue;
          const k = clamp((clock - b.born) / 0.45, 0, 1);
          if (!k) continue;
          const e = easeOut(k), y = b.y - (1 - e) * 14;
          ctx.globalAlpha = e;
          ctx.drawImage(sprite(b), b.x, y, BW, BH);
          if (b.crack) {
            ctx.beginPath();
            for (const line of b.crack) line.forEach(([qx, qy], i) => (i ? ctx.lineTo(qx, qy + y - b.y) : ctx.moveTo(qx, qy + y - b.y)));
            ctx.strokeStyle = 'rgba(40,20,40,.45)'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();
          }
          if (b.flash > 0) {
            ctx.globalAlpha = b.flash * 0.55; ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.roundRect(b.x, y, BW, BH - 3, 6); ctx.fill();
            b.flash = Math.max(0, b.flash - dt * 6);
          }
        }
        ctx.globalAlpha = 1;
        for (const f of frags) {
          ctx.globalAlpha = Math.max(0, f.life);
          ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.r);
          ctx.fillStyle = f.col; ctx.beginPath(); ctx.roundRect(-f.w / 2, -f.h / 2, f.w, f.h, 1.5); ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        for (const d of drops) {
          const [ch, col] = BK_POW[d.k], wob = Math.sin(d.t * 8) * 0.12;
          ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(wob);
          ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.roundRect(-20, -8, 40, 20, 10); ctx.fill();
          ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-20, -11, 40, 22, 11); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.roundRect(-14, -8, 28, 5, 2.5); ctx.fill();
          txt(ctx, ch, 0, 1, 14, '#fff');
          ctx.restore();
        }
        ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (const z of bolts) { ctx.globalAlpha = 0.35; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(z.x, z.y); ctx.lineTo(z.x, z.y + 16); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(z.x, z.y); ctx.lineTo(z.x, z.y + 16); ctx.stroke(); }

        for (const p of pads) {
          const c = PAD_COL, pw = p.w * (1 + p.squash * 0.06), ph = PH * (1 - p.squash * 0.25), x0 = p.x - pw / 2, y0 = PY + PH - ph;
          ctx.fillStyle = p.wideT > 0 ? 'rgba(126,217,87,.25)' : c[3]; ctx.beginPath(); ctx.roundRect(x0 - 6, y0 - 5, pw + 12, ph + 10, (ph + 10) / 2); ctx.fill();
          if (p.laserT > 0) {
            ctx.fillStyle = '#ef4f4f';
            ctx.beginPath(); ctx.roundRect(x0 + 6, y0 - 7, 12, 10, 3); ctx.roundRect(x0 + pw - 18, y0 - 7, 12, 10, 3); ctx.fill();
          }
          const pg = ctx.createLinearGradient(0, y0, 0, y0 + ph);
          pg.addColorStop(0, c[0]); pg.addColorStop(0.5, c[1]); pg.addColorStop(1, c[2]);
          ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(x0, y0, pw, ph, ph / 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.roundRect(x0 + 10, y0 + 2.5, pw - 20, 3.5, 1.75); ctx.fill();
        }
        if (state !== 'over' && state !== 'clear') for (const b of balls) drawBall(b);

        drawParts(ctx, fx, ui);
        if (state === 'serve') {
          ctx.globalAlpha = 0.7 + 0.3 * Math.sin(clock * 3);
          txt(ctx, 'Click, tap or press Space to launch', W / 2, PY - 70, 15 * s, 'rgba(255,255,255,.9)');
          ctx.globalAlpha = 1;
        }
        if (banner > 0) {
          ctx.globalAlpha = Math.min(1, banner / 0.4, (1.8 - banner) / 0.3);
          txt(ctx, 'Level ' + level, W / 2, 330, 50 * s, '#fff', 'center', 'rgba(108,92,231,.7)');
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      const intro = () => api.overlay({
        kicker: 'Arcade', title: 'Breakout',
        text: 'Smash every brick to clear the level, using the mouse, drag, ← → or A D, and Space to launch. Where the ball meets the paddle sets its angle. Catch falling capsules: 3 multi-ball, W wide paddle, L lasers, S slow ball, + extra ball.',
        button: 'Play', onAction: begin
      });
      function menu() {
        lives = 3; level = 1; score = 0; slowT = 0; pads[0].wideT = pads[0].laserT = 0; pads[0].held = false;
        frags.length = 0; fx.length = 0; banner = 0;
        build(); balls = [newBall(pads[0].x, PY - R - 1, 0, 0)]; state = 'ready';
        api.score('—');
        intro();
      }

      build(); balls = [newBall(pads[0].x, PY - R - 1, 0, 0)];
      intro();
    }
  });

  const PG_AI = {
    easy: { name: 'Easy', miss: s => Math.max(0.22, 0.5 - s * 0.02), err: s => Math.max(14, 36 - s), wait: s => Math.max(0.16, 0.32 - s * 0.01), v: s => Math.min(560, 280 + s * 14), ball: s => Math.min(620, 340 + s * 12) },
    normal: { name: 'Normal', miss: s => Math.max(0.08, 0.36 - s * 0.022), err: s => Math.max(6, 28 - s * 1.5), wait: s => Math.max(0.07, 0.24 - s * 0.012), v: s => Math.min(820, 340 + s * 22), ball: s => Math.min(760, 400 + s * 16) },
    hard: { name: 'Hard', miss: s => Math.max(0.03, 0.2 - s * 0.015), err: s => Math.max(3, 14 - s), wait: s => Math.max(0.05, 0.12 - s * 0.008), v: s => Math.min(980, 520 + s * 24), ball: s => Math.min(880, 470 + s * 18) }
  };
  const PG_MODES = [['1p', 'vs CPU'], ['net', 'Online']];
  Ameplay.register({
    id: 'pong',
    title: 'Pong',
    category: 'Arcade',
    blurb: 'Rally against the computer or a friend online.',
    help: 'vs CPU: mouse, drag, <kbd>W</kbd> <kbd>S</kbd> or <kbd>↑</kbd> <kbd>↓</kbd> · Online: a friend on another device',
    better: 'high',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="11" width="52" height="42" rx="8" opacity=".3"/><path d="M32 16v32" stroke-dasharray="2.5 5" opacity=".3"/><path d="M15 22v12M49 30v12" stroke-width="4"/><circle cx="37" cy="26" r="3" fill="currentColor" stroke="none"/></svg>',
    css: segCss('pong') + '.gm-pong{gap:12px}.gm-pong .g-canvas{cursor:none;box-shadow:0 14px 34px -18px rgba(30,30,70,.8)}',
    mount(root, api) {
      const W = 800, H = 500, PW = 14, PH = 86, HALF = PH / 2, R = 9, M = 28, WIN = 7, TN = 14, STEP = 1 / 120, DELAY = 90;

      const V = matchMedia('(orientation: portrait) and (max-width: 1100px)').matches, CW = V ? H : W, CH = V ? W : H;
      const coarse = matchMedia('(pointer: coarse)').matches, net = api.net, invited = !!net.invite;

      const XF = V ? [[0, -1, 1, 0, 0, W], [0, 1, -1, 0, H, 0]] : [[1, 0, 0, 1, 0, 0], [-1, 0, 0, -1, W, H]];
      const saved = api.load() || {};
      const sel = { mode: invited ? 'net' : PG_MODES.some(m => m[0] === saved.mode) ? saved.mode : '1p', diff: PG_AI[saved.diff] ? saved.diff : 'normal' };
      const store = () => api.save({ mode: sel.mode, diff: sel.diff });
      const bar = segBar(root, [['mode', PG_MODES], ['diff', Object.entries(PG_AI).map(([k, d]) => [k, d.name])]], sel, () => { store(); syncBar(); toReady(); });
      const diffSeg = bar.querySelector('[data-g="diff"]');
      const { canvas, ctx, toLocal } = api.canvas(CW, CH);
      const fit = () => { if (V) canvas.style.width = `min(100%, ${CW}px, calc((100dvh - var(--goff, 250px) - ${bar.offsetHeight + 12}px) * ${(CW / CH).toFixed(4)}))`; };
      const syncBar = () => { diffSeg.hidden = sel.mode !== '1p'; fit(); };
      const keys = api.keys, sh = shaker(), fx = [], pops = [], one = [null], trail = new Float32Array(TN * 2), hist = [], buf = [], evq = [], P = { x: 0, y: 0 };
      const L = { y: H / 2, t: H / 2, sq: 0, v: 0, col: '#ff5d8f', dark: '#c9306a' }, Rp = { y: H / 2, t: H / 2, sq: 0, v: 0, goal: H / 2, wait: 0, col: '#4cc9f0', dark: '#1f8fbf' };
      const ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, vis: 1, last: L, ox: 0, oy: 0 };
      let state = 'ready', A = PG_AI[sel.diff], score = 0, lives = 3, pts = [0, 0], rally = 0, longest = 0, sp = 0, serveT = 0, serveDir = -1, ti = 0, tn = 0, clock = 0, cd = 0, cdN = 0, overAt = 0;
      let flip = 0, online = null, wired = false, lobbying = false, acc = 0, simT = 0, stepN = 0, epoch = 0, pend = null, off = 0, meRe = false, peerRe = false, mg = 0, sentY = -1;

      const bg = layer(W + 12, H + 12, g => {
        g.translate(6, 6);
        const gr = g.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.65);
        gr.addColorStop(0, '#3d4166'); gr.addColorStop(1, '#1f2137');
        g.fillStyle = gr; g.fillRect(-6, -6, W + 12, H + 12);
        g.fillStyle = 'rgba(255,255,255,.035)';
        for (let x = 0; x < W; x += 40) g.fillRect(x, 0, 1, H);
        for (let y = 0; y < H; y += 40) g.fillRect(0, y, W, 1);
        g.strokeStyle = 'rgba(141,153,174,.4)'; g.lineWidth = 4;
        g.beginPath(); g.roundRect(10, 10, W - 20, H - 20, 16); g.stroke();
        g.setLineDash([14, 14]); g.lineCap = 'round'; g.lineWidth = 5; g.strokeStyle = 'rgba(141,153,174,.45)';
        g.beginPath(); g.moveTo(W / 2, 28); g.lineTo(W / 2, H - 28); g.stroke(); g.setLineDash([]);
        g.lineWidth = 3; g.strokeStyle = 'rgba(141,153,174,.3)';
        g.beginPath(); g.arc(W / 2, H / 2, 62, 0, TAU); g.stroke();
        for (const [x, c] of [[M + PW / 2, 'rgba(255,93,143,.07)'], [W - M - PW / 2, 'rgba(76,201,240,.07)']]) { g.fillStyle = c; g.fillRect(x - 30, 12, 60, H - 24); }
      });

      const toField = e => { const q = toLocal(e), [a, b, c, d, ex, f] = XF[flip], X = q.x - ex, Y = q.y - f, det = a * d - b * c; return { x: (d * X - c * Y) / det, y: (a * Y - b * X) / det }; };
      const toScreen = (x, y) => { const t = XF[flip]; P.x = t[0] * x + t[2] * y + t[4]; P.y = t[1] * x + t[3] * y + t[5]; return P; };
      const along = (sx, sy) => { const [a, b, c, d] = XF[flip]; return clamp((a * sy - b * sx) / (a * d - b * c), -1, 1); };
      const near = p => p === (flip ? Rp : L);
      const side = (p, x, y) => (near(p) ? [x, y] : V ? [CW - x, CH - y] : [CW - x, y]);
      const anchor = (p, s) => (V ? side(p, 64 * s, CH / 2 + 70 * s) : side(p, CW / 2 - 64 * s, 66 * s));
      const me = () => (online === 'guest' ? Rp : L);
      const mine = () => (online === 'guest' ? [pts[1], pts[0]] : pts);
      const scoreText = () => mine().join(' : ');
      const pop = (p, lx, ly, text, col, size) => pops.push({ x: 0, y: 0, lx, ly, p, text, col, size, t: 0, life: 0.9 });
      const ev = o => { o.t = 'e'; o.T = Math.round(simT); net.send(o); };
      const r1 = v => Math.round(v * 10) / 10;

      const base = () => (sel.mode === '1p' ? A.ball(score) : Math.min(760, 400 + (pts[0] + pts[1]) * 14));
      function toReady() {
        if (online) { online = null; net.close(); }
        flip = 0; mg++; pend = null; api.hideOverlay();
        state = 'ready'; A = PG_AI[sel.diff];
        score = 0; lives = 3; pts = [0, 0]; fx.length = 0; pops.length = 0; tn = 0;
        ball.x = W / 2; ball.y = H / 2; ball.vis = 1; ball.ox = ball.oy = 0;
        api.score('—');
      }
      function begin() {
        if (sel.mode === 'net') { if (!online) goOnline(); return; }
        newMatch();
      }
      function newMatch() {
        mg++; A = PG_AI[sel.diff];
        score = 0; lives = 3; pts = [0, 0]; longest = 0; fx.length = 0; pops.length = 0; pend = null;
        api.score(sel.mode === '1p' ? 0 : '0 : 0');
        if (sel.mode === '1p') { serveDir = -1; return serve(); }
        serveDir = Math.random() < 0.5 ? -1 : 1;
        state = 'count'; cd = 3; tn = 0; ball.x = W / 2; ball.y = H / 2; ball.vis = 0;
      }
      function serve() {
        state = 'serve'; serveT = 0.9; rally = 0; tn = 0; epoch++; pend = null;
        ball.x = W / 2; ball.y = H / 2; ball.vis = 0;
        Rp.goal = H / 2; Rp.wait = 0;
      }
      function plan() {
        const span = H - 2 * R, t = (W - M - PW - R - ball.x) / ball.vx;
        let y = (ball.y - R + ball.vy * t) % (2 * span);
        if (y < 0) y += 2 * span;
        if (y > span) y = 2 * span - y;
        const miss = Math.random() < A.miss(score);
        const err = miss ? (Math.random() < 0.5 ? -1 : 1) * (HALF + R + rand(6, 34)) : rand(-1, 1) * A.err(score);
        Rp.goal = clamp(y + R + err, HALF, H - HALF);
        Rp.wait = A.wait(score);
      }
      function hit(p, d) {
        pend = null;
        const a = clamp((ball.y - p.y) / (HALF + R) + p.v / 2600, -1, 1) * 0.95, b = base();
        sp = Math.min(1000, b * 1.5, Math.max(sp, b) * 1.03);
        ball.vx = d * Math.cos(a) * sp; ball.vy = Math.sin(a) * sp;
        ball.x = d > 0 ? M + PW + R : W - M - PW - R;
        ball.last = p; p.sq = 1; rally++; longest = Math.max(longest, rally); api.sfx('tap');
        burst(fx, ball.x, ball.y, [p.col, '#fff'], 7, 180);
        if (online === 'host') ev({ e: 'hit', s: d > 0 ? 0 : 1, x: Math.round(ball.x), y: Math.round(ball.y) });
        if (sel.mode === '1p') { if (d > 0) plan(); else { Rp.goal = H / 2; Rp.wait = 0.15; } }
      }
      function over(kicker, title, text, stats, sound) {
        state = 'over'; overAt = clock; api.sfx(sound);
        const g = mg;
        api.timeout(() => { if (g === mg) api.overlay({ kicker, title, text, stats, button: 'Play again', onAction: begin, secondary: 'Change mode', onSecondary: toReady }); }, 700);
      }
      function fxPoint(leftScored, x, y) {
        const p = leftScored ? L : Rp;
        sh.kick(4); burst(fx, x, y, [p.col, '#fff', '#ffd166'], 18, 300);
        pop(p, leftScored ? W * 0.25 : W * 0.75, H / 2, 'Point!', p.col, 34);
      }
      function point(leftScored) {
        const x = clamp(ball.x, 0, W);
        if (sel.mode !== '1p') {
          pts[leftScored ? 0 : 1]++;
          fxPoint(leftScored, x, ball.y);
          api.score(scoreText());
          if (online === 'host') ev({ e: 'pt', w: leftScored ? 0 : 1, x: Math.round(x), y: Math.round(ball.y) });
          if (pts[0] >= WIN || pts[1] >= WIN) return matchOver();
          api.sfx(online && !leftScored ? 'bad' : 'good'); serveDir = leftScored ? 1 : -1; return serve();
        }
        sh.kick(4); burst(fx, x, ball.y, leftScored ? [L.col, '#fff', '#ffd166'] : [Rp.col, '#fff', '#ffd166'], 18, 300);
        if (leftScored) { score++; api.score(score); api.sfx('good'); pop(Rp, W * 0.75, H / 2, '+1', '#ffd166', 34); return serve(); }
        lives--;
        if (lives > 0) { api.sfx('bad'); return serve(); }
        const nb = api.submit(score);
        over(nb ? 'New best!' : 'Game over', 'Match over', `${A.name} computer.`, [['Score', score], ['Longest rally', longest], ['Best', api.best ?? '—']], nb ? 'win' : 'lose');
      }
      function matchOver() {
        if (online === 'host') { ev({ e: 'over', a: pts[0], b: pts[1], l: longest }); state = 'over'; overAt = clock; return netOver(); }
      }
      function physics(dt) {
        const n = Math.max(1, Math.ceil(sp * dt / 4)), h = dt / n;
        for (let i = 0; i < n && state === 'play'; i++) {
          ball.x += ball.vx * h; ball.y += ball.vy * h;
          if (ball.y < R + 12) { ball.y = R + 12; ball.vy = Math.abs(ball.vy); }
          else if (ball.y > H - R - 12) { ball.y = H - R - 12; ball.vy = -Math.abs(ball.vy); }
          if (ball.vx < 0 && ball.x - R <= M + PW && ball.x > M && Math.abs(ball.y - L.y) <= HALF + R) hit(L, 1);
          else if (ball.vx > 0 && ball.x + R >= W - M - PW && ball.x < W - M) {
            if (Math.abs(ball.y - Rp.y) <= HALF + R) hit(Rp, -1);
            else if (online === 'host' && !pend) pend = { T: simT, x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy };
          }
          if (ball.x < -R * 2) point(false);
          else if (ball.x > W + R * 2 && !pend) point(true);
        }
      }

      function retro() {
        if (!pend) return;
        const late = simT - pend.T;
        for (let i = hist.length - 1; i >= 0; i--) {
          const e = hist[i];
          if (Math.abs(e.rt - pend.T) > 40 || Math.abs(pend.y - e.y) > HALF + R) continue;
          const ox = ball.x + ball.ox, oy = ball.y + ball.oy, y0 = Rp.y, v0 = Rp.v;
          ball.x = pend.x; ball.y = pend.y; ball.vx = pend.vx; ball.vy = pend.vy;
          Rp.y = e.y; Rp.v = e.v; hit(Rp, -1); Rp.y = y0; Rp.v = v0;
          physics(late / 1000);
          ball.ox = ox - ball.x; ball.oy = oy - ball.y;
          return;
        }
        if (late > clamp(net.rtt + DELAY + 50, 120, 360)) pend = null;
      }
      function sim(h) {
        if (state === 'count') { if ((cd -= h) <= 0) serve(); }
        else if (state === 'serve') {
          ball.vis = Math.min(1, ball.vis + h * 3);
          if ((serveT -= h) <= 0) {
            state = 'play';
            const a = rand(-0.4, 0.4);
            sp = base() * 0.8; ball.vx = serveDir * Math.cos(a) * sp; ball.vy = Math.sin(a) * sp;
            if (sel.mode === '1p' && serveDir > 0) plan();
          }
        } else if (state === 'play') physics(h);
      }

      const snap = () => net.send({ t: 's', T: Math.round(simT), k: epoch, x: r1(ball.x), y: r1(ball.y), vx: Math.round(ball.vx), vy: Math.round(ball.vy), l: r1(L.y), st: state, c: r1(cd), v: r1(ball.vis), h: ball.last === L ? 0 : 1, a: pts[0], b: pts[1] }, true);
      const sendPad = () => { sentY = clamp(Rp.t, HALF, H - HALF); net.send({ t: 'p', y: r1(sentY), v: Math.round(Rp.v), rt: Math.round(performance.now() + off - DELAY) }, true); };
      api.interval(() => { if (online === 'guest') sendPad(); }, 50);
      function netOver() {
        const [a, b] = mine(), g = mg;
        api.sfx(a > b ? 'win' : 'lose');
        api.timeout(() => {
          if (g !== mg || !online) return;
          api.overlay({ kicker: 'Online', title: a > b ? 'You win!' : 'Your friend wins', text: `Final score ${a} – ${b}.`, stats: [['You', a], ['Friend', b], ['Longest rally', longest]], button: 'Rematch', onAction: rematch, secondary: 'Leave', onSecondary: toReady });
        }, 900);
      }
      function rematch() {
        if (!online) return toReady();
        meRe = true; net.send({ t: 're' });
        if (online === 'host' && peerRe) return hostStart();
        api.overlay({ kicker: 'Online', title: 'Rematch', text: 'Waiting for your friend to tap Rematch…', button: null, secondary: 'Leave', onSecondary: toReady });
      }
      function hostStart() {
        if (online !== 'host') return;
        meRe = peerRe = false; api.hideOverlay();
        newMatch(); net.send({ t: 'start' });
      }
      function onMsg(m) {
        if (!online || !m) return;
        if (m.t === 're') { peerRe = true; if (online === 'host' && meRe) hostStart(); else if (!meRe) api.toast('Your friend wants a rematch'); return; }
        if (online === 'host') {
          if (m.t !== 'p') return;
          Rp.t = Rp.y = clamp(+m.y || H / 2, HALF, H - HALF); Rp.v = clamp(+m.v || 0, -4000, 4000);
          hist.push({ rt: +m.rt || 0, y: Rp.y, v: Rp.v }); if (hist.length > 60) hist.shift();
          return;
        }
        if (m.t === 's' && typeof m.T === 'number') {
          if (buf.length && m.T <= buf[buf.length - 1].T) return;
          const o = m.T - performance.now();
          off = !buf.length || o > off ? o : off + (o - off) * 0.02;
          buf.push(m); if (buf.length > 40) buf.shift();
        } else if (m.t === 'e') evq.push(m);
        else if (m.t === 'start') {
          mg++; meRe = peerRe = false; api.hideOverlay();
          pts = [0, 0]; longest = 0; fx.length = 0; pops.length = 0; evq.length = 0; api.score('0 : 0');
        }
      }
      function guestFrame() {
        if (!buf.length) return;
        const rt = performance.now() + off - DELAY;
        let i = buf.length - 1;
        while (i > 0 && buf[i].T > rt) i--;
        const a = buf[i], b = buf[i + 1];
        let x = a.x, y = a.y, ly = a.l;
        if (b && b.k === a.k && rt >= a.T) {
          const u = clamp((rt - a.T) / (b.T - a.T || 1), 0, 1);
          x = lerp(a.x, b.x, u); y = lerp(a.y, b.y, u); ly = lerp(a.l, b.l, u);
        } else if (!b && a.st === 'play') {
          const e = clamp(rt - a.T, 0, 150) / 1000, lo = R + 12, span = H - 2 * lo;
          x += a.vx * e;
          let k = (y + a.vy * e - lo) % (2 * span);
          if (k < 0) k += 2 * span;
          y = lo + (k > span ? 2 * span - k : k);
        }
        ball.x = x; ball.y = y; L.y = L.t = clamp(+ly || H / 2, HALF, H - HALF);
        state = a.st; cd = +a.c || 0; ball.vis = +a.v || 0; ball.last = a.h ? Rp : L;
        if (a.a !== pts[0] || a.b !== pts[1]) { pts = [a.a | 0, a.b | 0]; api.score(scoreText()); }
        while (evq.length && evq[0].T <= rt) {
          const m = evq.shift();
          if (m.e === 'hit') { const p = m.s ? Rp : L; p.sq = 1; api.sfx('tap'); burst(fx, +m.x || 0, +m.y || 0, [p.col, '#fff'], 7, 180); }
          else if (m.e === 'pt') { fxPoint(!m.w, +m.x || 0, +m.y || 0); api.sfx(m.w ? 'good' : 'bad'); }
          else if (m.e === 'over') { pts = [m.a | 0, m.b | 0]; longest = m.l | 0; state = 'over'; overAt = clock; api.score(scoreText()); netOver(); }
        }
      }
      function wire() {
        if (wired) return;
        wired = true;
        net.on('open', role => {
          online = role; flip = role === 'guest' ? 1 : 0; mg++; pend = null; off = 0; meRe = peerRe = false;
          buf.length = evq.length = hist.length = 0; fx.length = pops.length = 0;
          state = 'count'; cd = 3; pts = [0, 0]; ball.x = W / 2; ball.y = H / 2; ball.vis = 0; tn = 0;
          api.score('0 : 0');
          if (role === 'host') api.timeout(hostStart, 400);
        });
        net.on('data', onMsg);
        net.on('close', () => {
          if (!online) return;
          online = null; mg++; state = 'left'; api.sfx('bad');
          api.overlay({ kicker: 'Online', title: 'Your friend left', text: 'The connection to your friend was lost.', button: 'Back to menu', onAction: toReady });
        });
      }
      async function goOnline() {
        if (lobbying || online) return;
        wire(); lobbying = true; state = 'ready';
        const role = await net.lobby({ title: 'Pong online', text: `Create a room and send the code or invite link to a friend on another device, or type their code to join. First to ${WIN} wins.` });
        lobbying = false;
        if (!role && api.alive && !online) toReady();
      }

      api.on(window, 'pointermove', e => {
        me().t = toField(e).y;
        if (online === 'guest') sendPad();
      });
      const restartable = () => state === 'ready';
      canvas.addEventListener('pointerdown', e => {
        const q = toField(e);
        me().t = q.y; if (online === 'guest') sendPad();
        if (restartable()) begin();
      });
      api.on(window, 'keydown', e => { if (restartable() && !e.repeat && (e.code === 'Space' || e.code === 'Enter')) begin(); });
      api.on(window, 'hashchange', () => {
        if (!net.invite || online || lobbying) return;
        if (sel.mode !== 'net') bar.querySelector('[data-v="net"]').click();
        toReady(); goOnline();
      });

      const follow = (p, dt) => { p.t = clamp(p.t, HALF, H - HALF); p.v = dt ? (p.t - p.y) / dt : 0; p.y = p.t; };
      function controls(dt) {
        const k1 = along((keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0), (keys.has('KeyS') ? 1 : 0) - (keys.has('KeyW') ? 1 : 0));
        const k2 = along((keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0), (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0));
        const p = me(), k = clamp(k1 + k2, -1, 1);
        if (k) p.t += k * 760 * dt;
        follow(p, dt);
        if (online === 'guest' && Math.abs(Rp.y - sentY) > 0.4) sendPad();
        if (sel.mode !== '1p') return;
        if (Rp.wait > 0) Rp.wait -= dt;
        else {
          const maxV = A.v(score) * (ball.vx > 0 && state === 'play' ? 1 : 0.45), y0 = Rp.y;
          Rp.y = clamp(Rp.y + clamp((Rp.goal - Rp.y) * 9, -maxV, maxV) * dt, HALF, H - HALF);
          Rp.v = dt ? (Rp.y - y0) / dt : 0;
        }
      }
      api.loop(dt => {
        clock += dt;
        controls(dt);
        if (online === 'guest') guestFrame();
        else if (online === 'host') {
          acc = Math.min(acc + dt, 0.1);
          while (acc >= STEP) { acc -= STEP; sim(STEP); simT += STEP * 1000; retro(); if (++stepN % 4 === 0) snap(); }
        } else sim(dt);
        const n = state === 'count' ? Math.ceil(cd) : 0;
        if (n !== cdN) { cdN = n; if (n) api.sfx('tick'); }
        const k = Math.exp(-dt * 18); ball.ox *= k; ball.oy *= k;
        L.sq = Math.max(0, L.sq - dt * 6); Rp.sq = Math.max(0, Rp.sq - dt * 6);
        if (state === 'play') { trail[ti * 2] = ball.x + ball.ox; trail[ti * 2 + 1] = ball.y + ball.oy; ti = (ti + 1) % TN; tn = Math.min(TN, tn + 1); }
        stepParts(fx, dt); stepParts(pops, dt);
        render(dt);
      });

      function paddle(x, p) {
        const w = PW * (1 + p.sq * 0.45), h = PH * (1 - p.sq * 0.12), x0 = x + PW / 2 - w / 2, y0 = p.y - h / 2;
        ctx.globalAlpha = 0.22; ctx.fillStyle = p.col; ctx.beginPath(); ctx.roundRect(x0 - 7, y0 - 7, w + 14, h + 14, (w + 14) / 2); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = p.dark; ctx.beginPath(); ctx.roundRect(x0, y0 + 3, w, h, w / 2); ctx.fill();
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.roundRect(x0, y0, w, h - 2, w / 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.roundRect(x0 + w * 0.22, y0 + 8, w * 0.26, h - 22, w * 0.13); ctx.fill();
      }
      function heart(x, y, s, full) {
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.9);
        ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
        ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
        if (full) { ctx.fillStyle = '#ff5d8f'; ctx.fill(); } else { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; ctx.stroke(); }
      }
      const field = () => { const t = XF[flip]; ctx.save(); ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]); };
      function pill(x, y, r, t1, t2, s) {
        const bw = Math.min(380 * s, CW - 24), bh = 70 * s;
        ctx.save(); ctx.translate(x, y); ctx.rotate(r);
        ctx.fillStyle = 'rgba(255,255,255,.94)'; ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fill();
        txt(ctx, t1, 0, -13 * s, 18 * s, C.accent);
        txt(ctx, t2, 0, 13 * s, 14 * s, C.muted);
        ctx.restore();
      }
      const who = p => (sel.mode === '1p' ? (p === L ? 'YOU' : 'CPU · ' + A.name.toUpperCase()) : near(p) ? 'YOU' : 'FRIEND');
      function render(dt) {
        const ui = uiScale(canvas, CW), s = Math.min(ui, 1.4);
        ctx.clearRect(0, 0, CW, CH);
        ctx.save();
        sh.apply(ctx, dt);
        field(); ctx.drawImage(bg, -6, -6, W + 12, H + 12); ctx.restore();
        for (const p of [L, Rp]) {
          const [x, y] = anchor(p, s);
          ctx.save(); ctx.translate(x, y);
          if (sel.mode !== '1p') txt(ctx, String(pts[p === L ? 0 : 1]), 0, 0, 64 * s, 'rgba(255,255,255,.2)');
          else if (p === L) { txt(ctx, String(score), 0, 0, 64 * s, 'rgba(255,255,255,.2)'); for (let i = 0; i < 3; i++) heart((i - 1) * 24 * s, 76 * s, 9 * s, i < lives); }
          txt(ctx, who(p), 0, 46 * s, 12 * s, p === L ? 'rgba(255,93,143,.75)' : 'rgba(76,201,240,.75)');
          ctx.restore();
        }
        field();
        paddle(M, L); paddle(W - M - PW, Rp);
        if (state !== 'over' && state !== 'left') {
          for (let i = 1; i < tn; i++) {
            const j = (ti - 1 - i + TN * 2) % TN;
            ctx.globalAlpha = 0.35 * (1 - i / tn);
            dot(ctx, trail[j * 2], trail[j * 2 + 1], R * (1 - i / (TN + 2)), ball.last.col);
          }
          const r = R * (ball.vis < 1 ? easeBack(ball.vis) : 1), bx = ball.x + ball.ox, by = ball.y + ball.oy;
          ctx.globalAlpha = 0.18; dot(ctx, bx, by, r * 2.1, '#fff'); ctx.globalAlpha = 1;
          dot(ctx, bx, by, r, '#fff');
          dot(ctx, bx - r * 0.3, by - r * 0.32, r * 0.35, '#ffffff');
        }
        drawParts(ctx, fx, ui);
        ctx.restore();
        for (const q of pops) {
          toScreen(q.lx, q.ly);
          ctx.save(); ctx.translate(P.x, P.y); one[0] = q; drawParts(ctx, one, ui); ctx.restore();
        }
        if (state === 'ready') {
          const t1 = sel.mode === 'net' ? `Online · first to ${WIN}` : `vs CPU · ${A.name}`;
          const t2 = sel.mode === 'net' ? (coarse ? 'Tap to play a friend' : 'Click or press Space to play a friend') : coarse ? 'Tap to serve' : 'Click or press Space to serve';
          pill(CW / 2, V ? CH * 0.72 : H * 0.7, 0, t1, t2, s);
        } else if (state === 'count' && cd > 0) {
          const f = cd - Math.floor(cd), z = 1 + 0.4 * Math.max(0, f - 0.75) * 4;
          ctx.save(); ctx.translate(CW / 2, CH / 2); ctx.scale(z, z);
          txt(ctx, String(Math.ceil(cd)), 0, 0, 84 * s, '#fff', 'center', 'rgba(108,92,231,.75)');
          ctx.restore();
        }
        if (online) {
          const ms = net.rtt;
          dot(ctx, 22 * s, 22 * s, 4 * s, ms < 90 ? '#22b07d' : ms < 180 ? '#ffd166' : '#ef4f4f');
          txt(ctx, net.connected ? ms + ' ms' : '…', 30 * s, 22 * s, 11 * s, 'rgba(255,255,255,.6)', 'left');
        }
        ctx.restore();
      }

      if (invited) store();
      syncBar(); toReady(); api.timeout(fit, 60);
      if (invited) goOnline();
      else api.overlay({
        kicker: 'Arcade', title: 'Pong',
        text: `Get the ball past your rival to score. Where it meets your paddle (and how you swing) sets the angle. vs CPU: three lives on Easy, Normal or Hard. Online: a friend on another device. First to ${WIN}.`,
        button: 'Play', onAction: begin, secondary: 'Change mode', onSecondary: toReady
      });
    }
  });
})();

