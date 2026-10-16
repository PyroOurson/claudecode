
(() => {
  'use strict';
  const CFG = {
    arenaR: 6000,
    frame: 0.008,
    seg: 10,
    baseLen: 100,
    partLen: 24,
    nsp1: 5.39,
    nsp2: 0.4,
    nsp3: 14,
    spdUnit: 31.25,
    accel: 1000,
    mamu: 4.125,
    sbpr: 14.5,
    maxParts: 360,
    startParts: 2,
    boostMin: 2.25,
    drain: 0.6,
    drainK: 0.012,
    dropEvery: 0.12,
    dropKeep: 0.6,
    deathKeep: 0.5,
    foodDensity: 1 / 7000,
    foodBatch: 40,
    eatK: 1.25,
    eatPad: 16,
    hitK: 0.5,
    botsMin: 25,
    botsMax: 35,
    cell: 150,
    view: 945,
    dieT: 0.55
  };
  const TAU = Math.PI * 2;
  const COL = ['#c080ff', '#9099ff', '#80d0d0', '#80ff80', '#eeee70', '#ffa060', '#ff9090', '#ff4040', '#e030e0', '#ffffff', '#3cc0ff', '#4a5260', '#ffc040', '#2e9e6a', '#6475ff', '#ff5fa8', '#4854ff', '#a050ff', '#ffe030', '#ff6a20', '#65e8c8', '#bfe060'];
  const FOODC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 20, 21];
  const SKINS = [
    { c: [0] }, { c: [1] }, { c: [2] }, { c: [3] }, { c: [4] }, { c: [5] }, { c: [6] }, { c: [7] }, { c: [8] },
    { c: [7, 9], w: 3 }, { c: [18, 11], w: 3 }, { c: [16, 2], w: 3 }, { c: [7, 5, 4, 3, 2, 1, 0], w: 2 },
    { c: [7, 19, 12, 18], w: 2 }, { c: [3, 9], w: 3 }, { c: [8, 0, 17], w: 2 }, { c: [13, 3], w: 4 },
    { c: [17, 15, 12], w: 3 }, { c: [9, 11], w: 2 }, { c: [10, 9, 10, 16], w: 2 }, { c: [20, 1], w: 3 }, { c: [15, 9], w: 2 }
  ];
  const NAMES = ['Noodle', 'Danger Noodle', 'SlinkyPro', 'xX_Viper_Xx', 'Coil King', 'Sneky', 'Hiss', 'Zigzag', 'Kaa', 'Mamba', 'Spaghetti', 'Bob', 'Lucas', 'Mia', 'Tiny', 'BIG BOI', 'Wiggles', 'Slurp', 'nom nom', 'Pixel', 'Ramen', 'Glowworm', 'Twisty', 'Snek Lord', 'Lil Hiss', 'Captain', 'Boop', 'Zoe', 'Leo', 'Nugget', 'Banana', 'TurboTail', 'Orbit', 'Neon', 'Comet', 'Pretzel', 'Lasso', 'Cobra', 'Python', 'Rattler', 'Slither Me', 'Mochi', 'Taco', 'Unagi', 'Ribbon', 'Hose', 'Sir Coils', 'Speedy', 'Gus', 'Ivy', 'Max', 'Nova', 'Echo', 'Fuzzy', 'Jelly', 'Marble', 'Domino', 'Rocket', 'Shadow', 'Ghost', 'Ziggy', 'Lemon', 'Mango', 'Kiwi', 'Pickle', 'Biscuit', 'Waffle', 'Zap', 'Swirl', 'Loop'];
  const QUOTES = ['hi', 'gg', 'dont trap me pls', 'I am the snek king', 'Most of the snakes are bots. Not clever ones.', 'circle me if you dare', 'stay hungry', 'hello from the top'];
  const MSC = 411, FM = new Float64Array(MSC), FP = new Float64Array(MSC);
  for (let i = 0; i < MSC; i++) FM[i] = Math.pow(1 - i / MSC, 2.25);
  for (let i = 1; i < MSC; i++) FP[i] = FP[i - 1] + 1 / FM[i - 1];
  const lengthOf = m => { const s = Math.min(MSC - 2, Math.floor(m)); return Math.max(1, Math.floor(15 * (FP[s] + (m - s) / FM[s] - 1) - 5)); };
  const gscOf = m => 0.5 + 0.4 / Math.max(1, (m + 16) / 36);
  const angAbs = a => Math.abs(a - TAU * Math.round(a / TAU));
  const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (h, f) => { const t = f > 0 ? 255 : 0, k = Math.abs(f); return 'rgb(' + rgb(h).map(v => Math.round(v + (t - v) * k)).join(',') + ')'; };
  const rgba = (h, a) => 'rgba(' + rgb(h).join(',') + ',' + a + ')';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  let SPR = null, HEX = null;
  function sprites() {
    if (SPR) return SPR;
    const mk = (S, fn) => { const c = document.createElement('canvas'); c.width = c.height = S; fn(c.getContext('2d'), S / 2); return c; };
    SPR = { b: [], f: [], g: [] };
    COL.forEach(col => {
      SPR.b.push(mk(128, (x, h) => {
        const g = x.createRadialGradient(h * 0.92, h * 0.84, 4, h, h, h);
        g.addColorStop(0, mix(col, 0.45)); g.addColorStop(0.5, col); g.addColorStop(0.84, mix(col, -0.28)); g.addColorStop(1, mix(col, -0.62));
        x.fillStyle = g; x.beginPath(); x.arc(h, h, h - 1, 0, TAU); x.fill();
      }));
      SPR.f.push(mk(64, (x, h) => {
        const g = x.createRadialGradient(h, h, 0, h, h, h);
        g.addColorStop(0, mix(col, 0.6)); g.addColorStop(0.1, mix(col, 0.25)); g.addColorStop(0.2, rgba(col, 0.9)); g.addColorStop(0.27, rgba(col, 0.36));
        g.addColorStop(0.55, rgba(col, 0.1)); g.addColorStop(1, rgba(col, 0));
        x.fillStyle = g; x.fillRect(0, 0, h * 2, h * 2);
      }));
      SPR.g.push(mk(64, (x, h) => {
        const g = x.createRadialGradient(h, h, 0, h, h, h);
        g.addColorStop(0, rgba(col, 0.8)); g.addColorStop(0.4, rgba(col, 0.32)); g.addColorStop(1, rgba(col, 0));
        x.fillStyle = g; x.fillRect(0, 0, h * 2, h * 2);
      }));
    });
    SPR.s = mk(64, (x, h) => {
      const g = x.createRadialGradient(h, h, 0, h, h, h);
      g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(0.55, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, h * 2, h * 2);
    });
    return SPR;
  }
  function hexTile() {
    if (HEX) return HEX;
    const a = 44, hw = a * 3, hh = Math.sqrt(3) * a, cols = 4, rows = 7, tw = hw * cols, th = hh * rows;
    const c = document.createElement('canvas'); c.width = Math.round(tw * 1.5); c.height = Math.round(th * 1.5);
    const x = c.getContext('2d'); x.scale(c.width / tw, c.height / th);
    x.fillStyle = '#0a0e13'; x.fillRect(0, 0, tw, th);
    for (let i = -1; i <= cols; i++) for (let j = -1; j <= rows; j++) for (let o = 0; o < 2; o++) {
      const cx = i * hw + o * hw / 2, cy = j * hh + o * hh / 2;
      x.beginPath();
      for (let k = 0; k < 6; k++) { const t = k * Math.PI / 3; x.lineTo(cx + Math.cos(t) * (a - 3.2), cy + Math.sin(t) * (a - 3.2)); }
      x.closePath();
      const g = x.createLinearGradient(cx - a * 0.5, cy - a * 0.85, cx + a * 0.5, cy + a * 0.85);
      g.addColorStop(0, '#232b35'); g.addColorStop(0.5, '#181e26'); g.addColorStop(1, '#12161c');
      x.fillStyle = g; x.fill();
      x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 1.6; x.stroke();
    }
    HEX = { c, tw, th };
    return HEX;
  }

  const MENU = `<div class="sl-menu"><div class="sl-logo">Slither.io</div><div class="sl-last"></div><input class="sl-nick" maxlength="16" placeholder="Nickname" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"><button class="sl-play" type="button">Play</button><div class="sl-skin"><button class="sl-arr" type="button" data-d="-1" aria-label="Previous skin"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg></button><canvas class="sl-prev"></canvas><button class="sl-arr" type="button" data-d="1" aria-label="Next skin"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></button></div><div class="sl-hint"></div></div>`;

  Ameplay.register({
    id: 'slither',
    title: 'Slither',
    category: 'Arcade',
    tint: '#8a5cff',
    blurb: 'Eat glowing orbs, grow huge and make rival snakes crash into you.',
    help: 'Mouse to steer · hold click or <kbd>Space</kbd> to boost · <kbd>←</kbd> <kbd>→</kbd> also steer · touch: drag to steer, second finger or Boost button',
    better: 'high',
    width: 880,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 48c6 8 18 7 21-1s-3-15 3-21 17-5 20 4"/><circle cx="50" cy="26" r="7"/><circle cx="52" cy="25" r="1.5" fill="currentColor"/><circle cx="14" cy="18" r="2"/><circle cx="34" cy="50" r="2"/></svg>',
    css: `.gm-slither{gap:0}
.gm-slither .sl-wrap{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:#11161c;touch-action:none;box-shadow:0 10px 30px -14px rgba(10,14,30,.6)}
.gm-slither .sl-wrap .g-canvas{width:100%;border-radius:0;background:#11161c}
.gm-slither .sl-menu{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;text-align:center;color:#fff;font-family:Arial,Helvetica,sans-serif;background:radial-gradient(ellipse at 50% 45%,rgba(12,17,24,.5),rgba(6,9,13,.86));transition:opacity .35s}
.gm-slither .sl-menu.off{opacity:0;pointer-events:none}
.gm-slither .sl-logo{font:900 clamp(46px,10vw,80px)/1 var(--sans);letter-spacing:-.01em;padding:0 6px 6px;background:repeating-linear-gradient(100deg,#c080ff 0 22px,#9a5cff 22px 44px,#80d0ff 44px 66px,#80ff9a 66px 88px);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px rgba(160,110,255,.55))}
.gm-slither .sl-last{font-size:15px;line-height:1.5;color:#c3ccd6}
.gm-slither .sl-last:empty{display:none}
.gm-slither .sl-last b{color:#fff;font-size:17px}
.gm-slither .sl-last small{display:block;font-size:13px;color:#8d99a8}
.gm-slither .sl-last em{font-style:normal;color:#7dff9a;font-weight:700}
.gm-slither .sl-nick{width:min(250px,82%);height:44px;padding:0 16px;border:0;border-radius:22px;background:#4c447c;color:#e8e6ff;text-align:center;font:700 17px Arial,Helvetica,sans-serif;outline:0;box-shadow:inset 0 0 0 2px rgba(255,255,255,.07),0 6px 16px -8px rgba(0,0,0,.8)}
.gm-slither .sl-nick::placeholder{color:#a49fcf}
.gm-slither .sl-nick:focus{box-shadow:inset 0 0 0 2px rgba(200,180,255,.5)}
.gm-slither .sl-play{height:46px;min-width:156px;border:0;border-radius:23px;background:linear-gradient(#63dc90,#349a5c);color:#fff;font:700 21px Arial,Helvetica,sans-serif;cursor:pointer;box-shadow:0 8px 20px -8px rgba(70,220,130,.85),inset 0 -3px 0 rgba(0,0,0,.18)}
.gm-slither .sl-play:hover{filter:brightness(1.08)}
.gm-slither .sl-skin{display:flex;align-items:center;gap:6px}
.gm-slither .sl-arr{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;cursor:pointer}
.gm-slither .sl-arr:hover{background:rgba(255,255,255,.2)}
.gm-slither .sl-prev{width:180px;height:56px;cursor:pointer}
.gm-slither .sl-hint{max-width:30em;font-size:12.5px;line-height:1.45;color:#8592a1}`,
    mount(root, api) {
      const coarse = matchMedia('(pointer: coarse)').matches;
      const tall = coarse && innerHeight > innerWidth;
      const W = tall ? 400 : 880, H = tall ? 640 : 560, F = tall ? 0.95 : 1, BASE = Math.sqrt(W * H) / CFG.view * (tall ? 1.2 : 1);
      const wrap = document.createElement('div');
      wrap.className = 'sl-wrap';
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
      root.append(wrap);
      const { canvas, ctx, toLocal } = api.canvas(W, H, wrap);
      canvas.style.width = '100%';
      const DPR = canvas.width / W;
      wrap.insertAdjacentHTML('beforeend', MENU);
      const menu = wrap.querySelector('.sl-menu'), nickEl = wrap.querySelector('.sl-nick'), lastEl = wrap.querySelector('.sl-last'), prevC = wrap.querySelector('.sl-prev');
      wrap.querySelector('.sl-hint').textContent = coarse ? 'Drag anywhere to steer · hold a second finger or the boost button to speed up' : 'Move the mouse to steer · hold the mouse button or Space to speed up';
      prevC.width = Math.round(180 * DPR); prevC.height = Math.round(56 * DPR);
      const pctx = prevC.getContext('2d');
      const SP = sprites(), SPRB = SP.b, SPRF = SP.f, SPRG = SP.g, SHADOW = SP.s, HX = hexTile();
      const saved = api.load() || {};
      let skinIdx = Number.isInteger(saved.skin) && saved.skin >= 0 && saved.skin < SKINS.length ? saved.skin : (Math.random() * 9) | 0;
      nickEl.value = typeof saved.nick === 'string' ? saved.nick.slice(0, 16) : '';

      const R = CFG.arenaR, SEG = CFG.seg, CS = CFG.cell, G0 = -R - 2 * CS, GN = Math.ceil((2 * R + 4 * CS) / CS), GC = GN * GN;
      const MAXN = Math.ceil((CFG.baseLen + CFG.partLen * CFG.maxParts) / SEG) + 2, CAP = MAXN + 8, SLOTS = 48;
      const hHead = new Int32Array(GC).fill(-1), hNext = new Int32Array(SLOTS << 10);
      const cellX = v => { const c = ((v - G0) / CS) | 0; return c < 0 ? 0 : c >= GN ? GN - 1 : c; };
      const cellIdx = (x, y) => cellX(y) * GN + cellX(x);

      const FMAX = 26000;
      const fx = new Float32Array(FMAX), fy = new Float32Array(FMAX), fv = new Float32Array(FMAX), fr = new Float32Array(FMAX), fb = new Float32Array(FMAX);
      const fc = new Uint8Array(FMAX), fk = new Uint8Array(FMAX), fcell = new Int32Array(FMAX), fpos = new Int32Array(FMAX), free = new Int32Array(FMAX);
      let freeTop = FMAX, natCount = 0;
      for (let i = 0; i < FMAX; i++) free[i] = FMAX - 1 - i;
      const fCell = new Array(GC), cellVal = new Float32Array(GC);
      const natTarget = Math.round(Math.PI * R * R * CFG.foodDensity);
      const EMAX = 800, ex = new Float32Array(EMAX), ey = new Float32Array(EMAX), er = new Float32Array(EMAX), et = new Float32Array(EMAX), ec = new Uint8Array(EMAX), es = new Int16Array(EMAX);
      let eN = 0;
      const sn = new Array(SLOTS).fill(null);
      const gx = new Float32Array(4096), gy = new Float32Array(4096), gr = new Float32Array(4096);
      let gN = 0;
      const lblS = new Array(SLOTS), lblX = new Float32Array(SLOTS), lblY = new Float32Array(SLOTS);
      let lblN = 0;

      let state = 'menu', player = null, camX = 0, camY = 0, zoom = 0.62, gt = 0, menuGuard = 0, shownLen = -1, submitted = false, spectate = null;
      let acc = 0, boardT = 0, rank = 0, total = 0, botTarget = 30, botT = 20, respawnT = 0;
      const board = [];
      const ptr = { x: W / 2 + 100, y: H / 2 };
      let mouseBoost = false, keyBoost = false, turnL = false, turnR = false, kbMode = false, touchMode = coarse, lastTapEnd = -1e9;
      const touches = new Map();
      const BB = { x: Math.round(54 * F), y: H - Math.round(104 * F), r: Math.round(32 * F) };

      function addFood(x, y, v, ci, kind, born) {
        if (!freeTop) return;
        const d2 = x * x + y * y, lim = R - 30;
        if (d2 > lim * lim) { const k = lim / Math.sqrt(d2); x *= k; y *= k; }
        const id = free[--freeTop];
        fx[id] = x; fy[id] = y; fv[id] = v; fr[id] = 2.6 + Math.sqrt(v) * 1.55; fc[id] = ci; fk[id] = kind; fb[id] = born;
        const c = cellIdx(x, y), arr = fCell[c] || (fCell[c] = []);
        fcell[id] = c; fpos[id] = arr.length; arr.push(id); cellVal[c] += v;
        if (kind === 0) natCount++;
      }
      function removeFood(id) {
        const c = fcell[id], arr = fCell[c], p = fpos[id], last = arr.pop();
        if (last !== id) { arr[p] = last; fpos[last] = p; }
        cellVal[c] -= fv[id];
        if (cellVal[c] < 0.01) cellVal[c] = 0;
        if (fk[id] === 0) natCount--;
        free[freeTop++] = id;
      }
      function spawnNat(born) {
        const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (R - 60);
        addFood(Math.cos(a) * d, Math.sin(a) * d, 4 + ((Math.random() ** 2 * 13) | 0), FOODC[(Math.random() * FOODC.length) | 0], 0, born);
      }

      function alloc() {
        for (let i = 0; i < SLOTS; i++) {
          let s = sn[i];
          if (!s) s = sn[i] = { si: i, used: false, alive: false, rx: new Float32Array(CAP), ry: new Float32Array(CAP), bx: new Float32Array(CAP), by: new Float32Array(CAP) };
          if (!s.used) { s.used = true; return s; }
        }
        return null;
      }
      function derive(s) {
        if (s.m > CFG.maxParts) s.m = CFG.maxParts;
        s.sc = Math.min(6, 1 + Math.max(0, s.m - 2) / 106);
        s.r = CFG.sbpr * s.sc;
        s.n = Math.min(MAXN, Math.ceil((CFG.baseLen + CFG.partLen * s.m) / SEG) + 1);
        s.st = Math.max(1, Math.round(s.r * 0.55 / SEG));
      }
      function push(s, x, y) {
        let i = s.rh + 1;
        if (i >= CAP) i = 0;
        s.rh = i; s.rx[i] = x; s.ry[i] = y;
        if (s.filled < CAP) s.filled++;
      }
      function initSnake(s, x, y, ang, m, skin, name, isPlayer) {
        Object.assign(s, { alive: true, dying: 0, player: isPlayer, name, skin, hx: x, hy: y, ang, wang: ang, boost: false, bst: false, m, acc: 0, rh: 0, filled: 0, dropAcc: 0, think: Math.random() * 0.2, mode: 0, modeT: 0, tgt: null, side: 1, coil: 1, aggr: 0, skill: 1, greed: 0.5, x0: x, x1: x, y0: y, y1: y });
        derive(s);
        s.sp = (CFG.nsp1 + CFG.nsp2 * s.sc) * CFG.spdUnit;
        const pts = s.n + 2, lim = (R * 0.9) ** 2;
        let px = x, py = y, b = ang + Math.PI, curl = (Math.random() - 0.5) * 0.08;
        s.bx[0] = x; s.by[0] = y;
        for (let k = 1; k < pts; k++) {
          if (px * px + py * py > lim) { const d = Math.atan2(-py, -px) - b; b += (d - TAU * Math.round(d / TAU)) * 0.2; }
          else { curl = Math.max(-0.09, Math.min(0.09, curl + (Math.random() - 0.5) * 0.02)); b += curl; }
          px += Math.cos(b) * SEG; py += Math.sin(b) * SEG;
          s.bx[k] = px; s.by[k] = py;
        }
        for (let k = pts - 1; k >= 0; k--) push(s, s.bx[k], s.by[k]);
      }
      const beadCol = (s, k) => { const sk = SKINS[s.skin], b = (k / s.st) | 0; return sk.c[((b / (sk.w || 1)) | 0) % sk.c.length]; };

      function move(s, dt) {
        if (!s.boost) s.bst = false;
        else if (!s.bst && s.m > CFG.boostMin) s.bst = true;
        if (s.bst) {
          const d = (CFG.drain + CFG.drainK * s.m) * dt;
          s.m -= d; s.dropAcc += d;
          if (s.dropAcc >= CFG.dropEvery) { const k = s.n - 1; addFood(s.bx[k], s.by[k], s.dropAcc * 100 * CFG.dropKeep, beadCol(s, k), 2, gt); s.dropAcc = 0; }
          if (s.m <= CFG.startParts) { s.m = CFG.startParts; s.bst = false; }
          derive(s);
        }
        const scang = 0.13 + 0.87 * ((7 - s.sc) / 6) ** 2, mt = CFG.mamu * scang * dt;
        let d = s.wang - s.ang;
        d -= TAU * Math.round(d / TAU);
        s.ang += d > mt ? mt : d < -mt ? -mt : d;
        if (s.ang > Math.PI) s.ang -= TAU; else if (s.ang < -Math.PI) s.ang += TAU;
        const want = s.bst ? CFG.nsp3 * CFG.spdUnit : (CFG.nsp1 + CFG.nsp2 * s.sc) * CFG.spdUnit, ac = CFG.accel * dt, dv = want - s.sp;
        s.sp += dv > ac ? ac : dv < -ac ? -ac : dv;
        const dist = s.sp * dt, cx = Math.cos(s.ang), cy = Math.sin(s.ang), ox = s.hx, oy = s.hy;
        s.hx += cx * dist; s.hy += cy * dist;
        let a = s.acc, off = 0;
        while (a + dist - off >= SEG) { off += SEG - a; a = 0; push(s, ox + cx * off, oy + cy * off); }
        s.acc = a + dist - off;
      }

      function build() {
        hHead.fill(-1);
        for (let i = 0; i < SLOTS; i++) {
          const s = sn[i];
          if (!s || !s.used || !s.alive) continue;
          const n = s.n, bx = s.bx, by = s.by, rx = s.rx, ry = s.ry, t = 1 - s.acc / SEG, fill = s.filled, base = i << 10;
          const ins = s.r > 34 ? 3 : s.r > 22 ? 2 : 1;
          let x0 = rx[s.rh], y0 = ry[s.rh], minx = s.hx, maxx = s.hx, miny = s.hy, maxy = s.hy;
          bx[0] = s.hx; by[0] = s.hy;
          let c = cellIdx(s.hx, s.hy);
          hNext[base] = hHead[c]; hHead[c] = base;
          for (let k = 1; k < n; k++) {
            let j = s.rh - (k < fill ? k : fill - 1);
            if (j < 0) j += CAP;
            const x1 = rx[j], y1 = ry[j], x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
            bx[k] = x; by[k] = y; x0 = x1; y0 = y1;
            if (x < minx) minx = x; else if (x > maxx) maxx = x;
            if (y < miny) miny = y; else if (y > maxy) maxy = y;
            if (k % ins === 0) { c = cellIdx(x, y); hNext[base + k] = hHead[c]; hHead[c] = base + k; }
          }
          s.x0 = minx; s.x1 = maxx; s.y0 = miny; s.y1 = maxy;
        }
      }
      function nearBody(x, y, d) {
        const x0 = cellX(x - d), x1 = cellX(x + d), y0 = cellX(y - d), y1 = cellX(y + d), d2 = d * d;
        for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) for (let c = hHead[cy * GN + cx]; c >= 0; c = hNext[c]) {
          const o = sn[c >> 10], k = c & 1023, dx = o.bx[k] - x, dy = o.by[k] - y;
          if (dx * dx + dy * dy < d2) return true;
        }
        return false;
      }
      const dead = [];
      function collide() {
        dead.length = 0;
        for (let i = 0; i < SLOTS; i++) {
          const s = sn[i];
          if (!s || !s.used || !s.alive) continue;
          const hx = s.hx, hy = s.hy;
          if (hx * hx + hy * hy > R * R) { dead.push(s, null); continue; }
          const cx = cellX(hx), cy = cellX(hy), hr = s.r * CFG.hitK;
          let hit = null;
          for (let yy = cy - 1; yy <= cy + 1 && !hit; yy++) {
            if (yy < 0 || yy >= GN) continue;
            for (let xx = cx - 1; xx <= cx + 1 && !hit; xx++) {
              if (xx < 0 || xx >= GN) continue;
              for (let c = hHead[yy * GN + xx]; c >= 0; c = hNext[c]) {
                const oi = c >> 10;
                if (oi === i) continue;
                const o = sn[oi], k = c & 1023, dx = o.bx[k] - hx, dy = o.by[k] - hy, tl = o.n - 1 - k, tp = Math.max(1, Math.min(o.n - 1, o.st * 6));
                const rr = (tl < tp ? o.r * (0.5 + 0.5 * tl / tp) : o.r) + hr;
                if (dx * dx + dy * dy < rr * rr) { hit = o; break; }
              }
            }
          }
          if (hit) dead.push(s, hit);
        }
        for (let j = 0; j < dead.length; j += 2) kill(dead[j], dead[j + 1]);
      }
      function kill(s, by) {
        if (!s.alive) return;
        s.alive = false; s.dying = CFG.dieT; s.boost = s.bst = false;
        const n = s.n, cnt = Math.max(6, Math.min(280, Math.round(s.m * 1.1 + 5))), v = s.m * 100 * CFG.deathKeep / cnt, step = (n - 1) / cnt;
        for (let j = 0; j < cnt; j++) {
          const k = Math.min(n - 1, Math.floor((j + Math.random()) * step)), a = Math.random() * TAU, rr = Math.random() * s.r * 0.9;
          addFood(s.bx[k] + Math.cos(a) * rr, s.by[k] + Math.sin(a) * rr, v * (0.75 + Math.random() * 0.5), beadCol(s, k), 1, gt + Math.random() * 0.15);
        }
        if (s.player) gameOver(by);
        else if (by && by.player && state === 'play') sKill();
      }
      function eat() {
        for (let i = 0; i < SLOTS; i++) {
          const s = sn[i];
          if (!s || !s.used || !s.alive) continue;
          const mx = s.hx + Math.cos(s.ang) * s.r * 0.5, my = s.hy + Math.sin(s.ang) * s.r * 0.5, eR = s.r * CFG.eatK + CFG.eatPad;
          const cx = cellX(mx), cy = cellX(my);
          let got = 0, big = false;
          for (let yy = cy - 1; yy <= cy + 1; yy++) for (let xx = cx - 1; xx <= cx + 1; xx++) {
            if (yy < 0 || yy >= GN || xx < 0 || xx >= GN) continue;
            const arr = fCell[yy * GN + xx];
            if (!arr || !arr.length) continue;
            for (let j = arr.length - 1; j >= 0; j--) {
              const id = arr[j], dx = fx[id] - mx, dy = fy[id] - my, rr = eR + fr[id];
              if (dx * dx + dy * dy < rr * rr) {
                got += fv[id];
                if (fv[id] > 30) big = true;
                if (eN < EMAX) { ex[eN] = fx[id]; ey[eN] = fy[id]; er[eN] = fr[id]; ec[eN] = fc[id]; es[eN] = i; et[eN] = 0; eN++; }
                removeFood(id);
              }
            }
          }
          if (got) { s.m += got / 100; derive(s); if (s.player) sEat(big); }
        }
      }

      function gather(s, D) {
        gN = 0;
        const x0 = cellX(s.hx - D), x1 = cellX(s.hx + D), y0 = cellX(s.hy - D), y1 = cellX(s.hy + D), D2 = (D + 80) * (D + 80), si = s.si;
        for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) for (let c = hHead[cy * GN + cx]; c >= 0; c = hNext[c]) {
          const oi = c >> 10;
          if (oi === si) continue;
          const o = sn[oi], k = c & 1023, x = o.bx[k], y = o.by[k], dx = x - s.hx, dy = y - s.hy;
          if (dx * dx + dy * dy > D2) continue;
          gx[gN] = x; gy[gN] = y; gr[gN] = o.r;
          if (++gN >= 4094) return;
          if (k === 0) for (let q = 1; q <= 2; q++) { gx[gN] = x + Math.cos(o.ang) * o.sp * 0.22 * q; gy[gN] = y + Math.sin(o.ang) * o.sp * 0.22 * q; gr[gN] = o.r; gN++; }
        }
      }
      function clearance(s, a, D) {
        const dx = Math.cos(a), dy = Math.sin(a), hx = s.hx, hy = s.hy, wl = R - 60;
        const b = hx * dx + hy * dy, c = hx * hx + hy * hy - wl * wl, disc = b * b - c;
        let best = Math.min(D, disc > 0 ? Math.max(0, -b + Math.sqrt(disc)) : 0);
        const pad = s.r + 8;
        for (let j = 0; j < gN; j++) {
          const rx = gx[j] - hx, ry = gy[j] - hy, t = rx * dx + ry * dy, rr = gr[j] + pad;
          if (t < -rr || t - rr > best) continue;
          const p2 = rx * rx + ry * ry - t * t;
          if (p2 < rr * rr) { const th = t - Math.sqrt(rr * rr - p2); if (th < best) best = th < 0 ? 0 : th; }
        }
        return best;
      }
      const coilR = (s, o) => Math.max(o.r * 2.5 + s.r * 2.5 + 30, 90);
      const bodyLen = s => CFG.baseLen + CFG.partLen * s.m;
      function pickMode(s) {
        s.mode = 0; s.tgt = null; s.modeT = 0.5 + Math.random();
        const roll = Math.random();
        if (roll > s.aggr + 0.3) return;
        const ca = Math.cos(s.ang), sa = Math.sin(s.ang);
        let best = null, bd = 1e12, kind = 0;
        for (let i = 0; i < SLOTS; i++) {
          const o = sn[i];
          if (!o || o === s || !o.used || !o.alive) continue;
          const dx = o.hx - s.hx, dy = o.hy - s.hy, d2 = dx * dx + dy * dy;
          if (d2 > 460 * 460 || roll > s.aggr + (o.player ? 0.3 : 0)) continue;
          if (s.m > 30 && o.m < s.m * 0.3 && d2 < 380 * 380 && bodyLen(s) > TAU * coilR(s, o) * 1.3) {
            if (kind < 2 || d2 < bd) { best = o; bd = d2; kind = 2; }
          } else if (kind < 2 && s.m > 5 && d2 < bd) {
            const d = Math.sqrt(d2) + 1, oc = Math.cos(o.ang), os = Math.sin(o.ang), side = -(dx * oc + dy * os) / d;
            if (dx * ca + dy * sa > 0 && side > -0.5 && side < 0.85 && ca * oc + sa * os > -0.4) { best = o; bd = d2; kind = 1; }
          }
        }
        if (!best) return;
        s.mode = kind; s.tgt = best;
        s.modeT = kind === 2 ? 4 + Math.random() * 5 : 1.2 + Math.random() * 1.8;
        s.side = (Math.cos(s.ang) * (best.hy - s.hy) - Math.sin(s.ang) * (best.hx - s.hx)) > 0 ? -1 : 1;
        s.coil = 1;
      }
      function think(s, idt) {
        const D = 200 + s.r * 5 + s.sp * 0.6;
        gather(s, D);
        s.modeT -= idt;
        if (s.modeT <= 0 || (s.tgt && !s.tgt.alive)) pickMode(s);
        let a = s.ang, boost = false;
        const ca = Math.cos(s.ang), sa = Math.sin(s.ang), canBoost = s.m > CFG.boostMin + 0.6;
        if (s.mode === 2) {
          const o = s.tgt, vx = s.hx - o.hx, vy = s.hy - o.hy, dist = Math.hypot(vx, vy), ring = coilR(s, o) * s.coil;
          const k = Math.max(-1, Math.min(1, (dist - ring) / ring));
          a = Math.atan2(vy, vx) + s.side * (Math.PI / 2 + k * 0.75);
          boost = canBoost && dist > ring * 1.6 && Math.random() < 0.5;
          s.coil = Math.max(0.6, s.coil - idt * 0.05);
          if (dist > 650 || bodyLen(s) < TAU * ring * 1.15) s.modeT = 0;
        } else if (s.mode === 1) {
          const o = s.tgt, dx = o.hx - s.hx, dy = o.hy - s.hy, d = Math.hypot(dx, dy), lead = Math.max(80, Math.min(400, d * 1.1)) + o.r * 3;
          const oc = Math.cos(o.ang), os = Math.sin(o.ang), sideSign = (oc * -dy - os * -dx) > 0 ? 1 : -1, lat = (o.r + s.r) * 1.5 * sideSign;
          a = Math.atan2(o.hy + os * lead + oc * lat - s.hy, o.hx + oc * lead - os * lat - s.hx);
          boost = canBoost && d < 500 && angAbs(a - s.ang) < 0.5 && Math.random() < s.aggr + 0.2;
          if (d > 700 || -(dx * oc + dy * os) / (d + 1) < -0.5) s.modeT = 0;
        } else {
          const cx = cellX(s.hx), cy = cellX(s.hy), lim = (R - 220) * (R - 220);
          let bc = -1, bs = 0, bv = 0, bdist = 0;
          for (let yy = cy - 3; yy <= cy + 3; yy++) for (let xx = cx - 3; xx <= cx + 3; xx++) {
            if (yy < 0 || yy >= GN || xx < 0 || xx >= GN) continue;
            const c = yy * GN + xx, v = cellVal[c];
            if (v <= 0) continue;
            const wx = G0 + (xx + 0.5) * CS, wy = G0 + (yy + 0.5) * CS;
            if (wx * wx + wy * wy > lim) continue;
            const dx = wx - s.hx, dy = wy - s.hy, d = Math.sqrt(dx * dx + dy * dy) + 1, sc = v / (d + 160) * (1.25 + (dx * ca + dy * sa) / d);
            if (sc > bs) { bs = sc; bc = c; bv = v; bdist = d; }
          }
          if (bc >= 0) {
            const arr = fCell[bc];
            let tx = G0 + ((bc % GN) + 0.5) * CS, ty = G0 + (((bc / GN) | 0) + 0.5) * CS, bp = -1;
            for (let j = 0; j < arr.length; j++) {
              const id = arr[j], d = Math.hypot(fx[id] - s.hx, fy[id] - s.hy), p = fv[id] / (d + 60);
              if (p > bp) { bp = p; tx = fx[id]; ty = fy[id]; }
            }
            a = Math.atan2(ty - s.hy, tx - s.hx);
            boost = canBoost && bv > 280 && bdist < 520 && Math.random() < s.greed;
          } else {
            a = s.ang + (Math.random() - 0.5) * 0.8;
            if (s.hx * s.hx + s.hy * s.hy > (R * 0.8) ** 2) a = Math.atan2(-s.hy, -s.hx) + (Math.random() - 0.5);
          }
        }
        const need = s.r * 2.4 + 40 + s.sp * 0.45 * s.skill;
        if (clearance(s, a, D) < need && Math.random() < 0.82 + s.skill * 0.18) {
          let best = a, bs = -1e9, bcl = 0;
          for (let i = 0; i < 16; i++) {
            const ai = s.ang + (i - 8) * (TAU / 16), ci = clearance(s, ai, D);
            const sc = Math.min(ci, need * 2) - angAbs(ai - a) * need * 0.2 - angAbs(ai - s.ang) * need * 0.12;
            if (sc > bs) { bs = sc; best = ai; bcl = ci; }
          }
          a = best;
          boost = canBoost && bcl < need * 0.55 && Math.random() < s.skill * 0.7;
        }
        s.wang = a; s.boost = boost;
      }

      function pickName() {
        for (let t = 0; t < 12; t++) {
          const nm = NAMES[(Math.random() * NAMES.length) | 0];
          if (!sn.some(s => s && s.used && s.name === nm)) return nm;
        }
        return NAMES[(Math.random() * NAMES.length) | 0];
      }
      function spawnBot(initial) {
        let x = 0, y = 0, ok = false;
        for (let t = 0; t < 30 && !ok; t++) {
          const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * R * 0.88;
          x = Math.cos(a) * d; y = Math.sin(a) * d;
          ok = !nearBody(x, y, 260) && !(player && player.alive && (x - player.hx) ** 2 + (y - player.hy) ** 2 < 1400 * 1400);
        }
        if (!ok) return;
        const s = alloc();
        if (!s) return;
        const u = Math.random();
        initSnake(s, x, y, Math.random() * TAU, initial ? 2 + 300 * u ** 4 : 2 + 40 * u ** 3, (Math.random() * SKINS.length) | 0, pickName(), false);
        s.aggr = Math.random() ** 1.4; s.skill = 0.45 + Math.random() * 0.55; s.greed = 0.3 + Math.random() * 0.7;
      }

      let AC = null, OUT = null, NB = null, boostSrc = null, boostGain = null, lastEat = 0;
      function au() {
        if (api.muted) return null;
        if (!AC) {
          try { AC = new (window.AudioContext || window.webkitAudioContext)(); OUT = AC.createGain(); OUT.gain.value = 0.6; OUT.connect(AC.destination); }
          catch (e) { AC = null; return null; }
        }
        if (AC.state === 'suspended') AC.resume();
        return AC;
      }
      function tone(f0, f1, d, v, type, delay) {
        const a = au();
        if (!a) return;
        const t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
        o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(OUT); o.start(t); o.stop(t + d + 0.03);
      }
      function noiseBuf(a) {
        if (NB) return NB;
        NB = a.createBuffer(1, a.sampleRate, a.sampleRate);
        const d = NB.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return NB;
      }
      function noise(d, v, f0, f1) {
        const a = au();
        if (!a) return;
        const t = a.currentTime, src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
        src.buffer = noiseBuf(a); bp.type = 'bandpass'; bp.Q.value = 0.9;
        bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + d);
        g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        src.connect(bp); bp.connect(g); g.connect(OUT); src.start(t); src.stop(t + d + 0.05);
      }
      function sEat(big) {
        if (gt - lastEat < 0.055) return;
        lastEat = gt;
        if (big) tone(420, 900, 0.09, 0.05, 'triangle'); else tone(760 + Math.random() * 220, 1500, 0.045, 0.022);
      }
      function sKill() { tone(520, 1040, 0.12, 0.05, 'triangle'); tone(780, 1560, 0.16, 0.04, 'sine', 0.07); }
      function sDie() { noise(0.55, 0.16, 1500, 160); tone(320, 55, 0.6, 0.07, 'triangle'); }
      function boostSound(on) {
        if (on && !api.muted) {
          const a = au();
          if (!a) return;
          if (!boostSrc) {
            boostSrc = a.createBufferSource(); boostSrc.buffer = noiseBuf(a); boostSrc.loop = true;
            const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.7;
            boostGain = a.createGain(); boostGain.gain.value = 0;
            boostSrc.connect(bp); bp.connect(boostGain); boostGain.connect(OUT); boostSrc.start();
          }
          boostGain.gain.setTargetAtTime(0.035, a.currentTime, 0.06);
        } else if (boostGain && AC) boostGain.gain.setTargetAtTime(0, AC.currentTime, 0.05);
      }

      function setSkin(i) { skinIdx = (i + SKINS.length) % SKINS.length; }
      function showMenu(html) {
        if (html != null) lastEl.innerHTML = html;
        menu.classList.remove('off');
        menuGuard = performance.now() + 450;
        state = 'menu'; spectate = null;
      }
      function startGame() {
        if (state !== 'menu' || performance.now() < menuGuard) return;
        const nick = nickEl.value.replace(/\s+/g, ' ').trim().slice(0, 16);
        api.save({ nick, skin: skinIdx });
        nickEl.blur();
        let x = 0, y = 0;
        for (let t = 0; t < 90; t++) {
          const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * R * 0.7, strict = t < 70;
          x = Math.cos(a) * d; y = Math.sin(a) * d;
          if (!nearBody(x, y, strict ? 900 : 450) && !sn.some(o => o && o.used && o.alive && (o.hx - x) ** 2 + (o.hy - y) ** 2 < (strict ? 1300 : 700) ** 2)) break;
        }
        const s = alloc();
        if (!s) return;
        player = s;
        initSnake(s, x, y, Math.atan2(-y, -x) + (Math.random() - 0.5), CFG.startParts, skinIdx, nick || 'You', true);
        state = 'play'; submitted = false; shownLen = -1; boardT = 0;
        menu.classList.add('off');
        camX = x; camY = y; zoom = gscOf(s.m);
        ptr.x = W / 2 + Math.cos(s.ang) * 120; ptr.y = H / 2 + Math.sin(s.ang) * 120;
        mouseBoost = keyBoost = turnL = turnR = kbMode = false; touches.clear();
        au();
      }
      function gameOver(by) {
        state = 'dead';
        const L = lengthOf(player.m);
        let best = false;
        if (!submitted) { submitted = true; best = api.submit(L); }
        api.score(L);
        sDie(); boostSound(false);
        const why = by ? (by.name ? 'Killed by ' + esc(by.name) : '') : 'You hit the wall';
        api.timeout(() => {
          if (state === 'dead') showMenu(`Your final length was <b>${L}</b><small>${best ? '<em>New best!</em>' + (why ? ' · ' : '') : ''}${why}</small>`);
        }, 1700);
      }

      api.on(menu, 'pointerdown', e => {
        const t = e.target, arr = t.closest && t.closest('.sl-arr');
        if (arr) { e.preventDefault(); setSkin(skinIdx + +arr.dataset.d); return; }
        if (t === nickEl) return;
        if (t === prevC) { setSkin(skinIdx + 1); return; }
        e.preventDefault();
        nickEl.blur();
        startGame();
      });
      api.on(window, 'keydown', e => {
        const tg = e.target;
        if (tg !== nickEl && tg && tg.closest && tg.closest('input,textarea,select,[contenteditable="true"]')) return;
        if (state === 'menu') {
          if (tg === nickEl) { if (e.key === 'Enter') { e.preventDefault(); startGame(); } return; }
          if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { setSkin(skinIdx + (e.code === 'ArrowLeft' ? -1 : 1)); return; }
          if (e.ctrlKey || e.metaKey || e.altKey || /^(Shift|Control|Alt|Meta|Tab|Escape|CapsLock|OS)/.test(e.key)) return;
          startGame();
          return;
        }
        if (state !== 'play') return;
        switch (e.code) {
          case 'Space': case 'ArrowUp': case 'KeyW': keyBoost = true; break;
          case 'ArrowLeft': case 'KeyA': turnL = true; kbMode = true; break;
          case 'ArrowRight': case 'KeyD': turnR = true; kbMode = true; break;
        }
      });
      api.on(window, 'keyup', e => {
        switch (e.code) {
          case 'Space': case 'ArrowUp': case 'KeyW': keyBoost = false; break;
          case 'ArrowLeft': case 'KeyA': turnL = false; break;
          case 'ArrowRight': case 'KeyD': turnR = false; break;
        }
      });
      api.on(window, 'blur', () => { mouseBoost = keyBoost = turnL = turnR = false; touches.clear(); });
      api.on(canvas, 'contextmenu', e => e.preventDefault());
      api.on(canvas, 'pointerdown', e => {
        if (state !== 'play') return;
        e.preventDefault();
        const p = toLocal(e);
        if (e.pointerType === 'mouse') { ptr.x = p.x; ptr.y = p.y; kbMode = false; mouseBoost = true; return; }
        touchMode = true;
        if ((p.x - BB.x) ** 2 + (p.y - BB.y) ** 2 < (BB.r + 12) ** 2) { touches.set(e.pointerId, 'boost'); return; }
        let steering = false;
        touches.forEach(v => { if (v !== 'boost') steering = true; });
        if (steering) { touches.set(e.pointerId, 'boost'); return; }
        touches.set(e.pointerId, performance.now() - lastTapEnd < 300 ? 'steerboost' : 'steer');
        ptr.x = p.x; ptr.y = p.y; kbMode = false;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      });
      api.on(window, 'pointermove', e => {
        if (e.pointerType === 'mouse') {
          const p = toLocal(e);
          if (Math.abs(p.x - ptr.x) + Math.abs(p.y - ptr.y) > 2) kbMode = false;
          ptr.x = p.x; ptr.y = p.y;
          return;
        }
        const role = touches.get(e.pointerId);
        if (role === 'steer' || role === 'steerboost') { const p = toLocal(e); ptr.x = p.x; ptr.y = p.y; }
      });
      const up = e => {
        if (e.pointerType === 'mouse') { mouseBoost = false; return; }
        const role = touches.get(e.pointerId);
        if (!role) return;
        touches.delete(e.pointerId);
        if (role !== 'boost') lastTapEnd = performance.now();
      };
      api.on(window, 'pointerup', up);
      api.on(window, 'pointercancel', up);

      function eyes(c, x, y, r, a, look) {
        const ca = Math.cos(a), sa = Math.sin(a), eR = r * 0.4, pR = r * 0.24, lx = Math.cos(look) * r * 0.16, ly = Math.sin(look) * r * 0.16;
        for (let side = -1; side <= 1; side += 2) {
          const exx = x + ca * r * 0.36 - sa * side * r * 0.5, eyy = y + sa * r * 0.36 + ca * side * r * 0.5;
          c.fillStyle = '#fff'; c.beginPath(); c.arc(exx, eyy, eR, 0, TAU); c.fill();
          c.fillStyle = '#121212'; c.beginPath(); c.arc(exx + lx, eyy + ly, pR, 0, TAU); c.fill();
        }
      }
      function boostPass(s, last, st, tp, size, a0, a1, ax0, ax1, ay0, ay1) {
        const n = s.n, bx = s.bx, by = s.by, sk = SKINS[s.skin], cols = sk.c, w = sk.w || 1, cl = cols.length;
        ctx.globalCompositeOperation = 'lighter';
        for (let k = last; k >= 0; k -= st) {
          const x = bx[k], y = by[k];
          if (x < ax0 || x > ax1 || y < ay0 || y > ay1) continue;
          const tl = n - 1 - k, rr = (tl < tp ? 0.5 + 0.5 * tl / tp : 1) * size;
          ctx.globalAlpha = a0 + a1 * Math.sin(gt * 16 - k / st * 0.45);
          ctx.drawImage(SPRG[cols[((k / st / w) | 0) % cl]], x - rr, y - rr, rr * 2, rr * 2);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      function drawSnake(s, vx0, vy0, vx1, vy1) {
        const pad = s.r * 3;
        if (s.x1 < vx0 - pad || s.x0 > vx1 + pad || s.y1 < vy0 - pad || s.y0 > vy1 + pad) return false;
        const n = s.n, st = s.st, bx = s.bx, by = s.by, sk = SKINS[s.skin], cols = sk.c, w = sk.w || 1, cl = cols.length;
        const fade = s.alive ? 1 : Math.max(0, s.dying / CFG.dieT), R0 = s.r * (s.alive ? 1 : 1 + (1 - fade) * 0.6);
        const last = (n - 1) - ((n - 1) % st), tp = Math.max(1, Math.min(n - 1, st * 6)), ax0 = vx0 - pad, ax1 = vx1 + pad, ay0 = vy0 - pad, ay1 = vy1 + pad;
        ctx.globalAlpha = 0.5 * fade;
        for (let k = last; k >= 0; k -= st * 2) {
          const x = bx[k], y = by[k];
          if (x < ax0 || x > ax1 || y < ay0 || y > ay1) continue;
          const tl = n - 1 - k, rr = (tl < tp ? 0.5 + 0.5 * tl / tp : 1) * R0 * 1.5;
          ctx.drawImage(SHADOW, x - rr, y - rr + R0 * 0.25, rr * 2, rr * 2);
        }
        const glow = s.bst && s.alive;
        if (glow) boostPass(s, last, st, tp, R0 * 2.4, 0.3, 0.2, ax0, ax1, ay0, ay1);
        ctx.globalAlpha = fade;
        for (let k = last; k >= 0; k -= st) {
          const x = bx[k], y = by[k];
          if (x < ax0 || x > ax1 || y < ay0 || y > ay1) continue;
          const tl = n - 1 - k, rr = (tl < tp ? 0.5 + 0.5 * tl / tp : 1) * R0;
          ctx.drawImage(SPRB[cols[((k / st / w) | 0) % cl]], x - rr, y - rr, rr * 2, rr * 2);
        }
        if (glow) boostPass(s, last, st, tp, R0 * 1.15, 0.12, 0.12, ax0, ax1, ay0, ay1);
        eyes(ctx, bx[0], by[0], R0, s.ang, s.wang);
        return true;
      }
      function render() {
        const sc = zoom * BASE, ox = W / 2 - camX * sc, oy = H / 2 - camY * sc;
        const vw = W / sc, vh = H / sc, vx0 = camX - vw / 2, vy0 = camY - vh / 2, vx1 = vx0 + vw, vy1 = vy0 + vh;
        ctx.setTransform(DPR * sc, 0, 0, DPR * sc, DPR * ox, DPR * oy);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        for (let y = Math.floor(vy0 / HX.th) * HX.th; y < vy1; y += HX.th)
          for (let x = Math.floor(vx0 / HX.tw) * HX.tw; x < vx1; x += HX.tw) ctx.drawImage(HX.c, x, y, HX.tw + 0.8, HX.th + 0.8);
        if (Math.hypot(Math.abs(camX) + vw / 2, Math.abs(camY) + vh / 2) > R - 80) {
          ctx.fillStyle = 'rgba(64,0,12,.55)';
          ctx.beginPath(); ctx.rect(vx0 - 60, vy0 - 60, vw + 120, vh + 120); ctx.arc(0, 0, R, 0, TAU); ctx.fill('evenodd');
          ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU);
          ctx.strokeStyle = 'rgba(255,40,60,.2)'; ctx.lineWidth = 50; ctx.stroke();
          ctx.strokeStyle = 'rgba(255,50,70,.92)'; ctx.lineWidth = 9; ctx.stroke();
        }
        ctx.globalCompositeOperation = 'lighter';
        const cx0 = cellX(vx0 - 60), cx1 = cellX(vx1 + 60), cy0 = cellX(vy0 - 60), cy1 = cellX(vy1 + 60);
        for (let yy = cy0; yy <= cy1; yy++) for (let xx = cx0; xx <= cx1; xx++) {
          const arr = fCell[yy * GN + xx];
          if (!arr) continue;
          for (let j = 0; j < arr.length; j++) {
            const id = arr[j], age = gt - fb[id];
            if (age < 0) continue;
            const ph = id * 1.37, S = fr[id] * 4.6 * (age < 0.4 ? age * 2.5 : 1);
            const x = fx[id] + Math.sin(gt * 1.6 + ph) * 2.2, y = fy[id] + Math.cos(gt * 1.3 + ph) * 2.2;
            ctx.globalAlpha = 0.7 + 0.3 * Math.sin(gt * 4 + ph);
            ctx.drawImage(SPRF[fc[id]], x - S, y - S, S * 2, S * 2);
          }
        }
        for (let j = 0; j < eN; j++) {
          const s = sn[es[j]], p = Math.min(1, et[j] / 0.16);
          let x = ex[j], y = ey[j];
          if (s && s.used) { const mx = s.bx[0] + Math.cos(s.ang) * s.r * 0.4, my = s.by[0] + Math.sin(s.ang) * s.r * 0.4; x += (mx - x) * p; y += (my - y) * p; }
          const S = er[j] * 4.6 * (1 - p * 0.75);
          ctx.globalAlpha = 1 - p * 0.6;
          ctx.drawImage(SPRF[ec[j]], x - S, y - S, S * 2, S * 2);
        }
        ctx.globalCompositeOperation = 'source-over';
        lblN = 0;
        for (let pass = 0; pass < 2; pass++) for (let i = 0; i < SLOTS; i++) {
          const s = sn[i];
          if (!s || !s.used || (!s.alive && s.dying <= 0) || (s === player) !== (pass === 1)) continue;
          if (drawSnake(s, vx0, vy0, vx1, vy1) && s.alive && s.name) { lblS[lblN] = s; lblX[lblN] = s.hx * sc + ox; lblY[lblN] = s.hy * sc + oy + s.r * sc + 13 * F; lblN++; }
        }
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.globalAlpha = 1;
        ctx.textBaseline = 'middle';
        if (lblN) {
          ctx.font = `bold ${Math.round(11.5 * F)}px Arial, Helvetica, sans-serif`;
          ctx.textAlign = 'center';
          for (let j = 0; j < lblN; j++) { ctx.fillStyle = lblS[j].player ? 'rgba(255,255,255,.8)' : 'rgba(205,212,222,.6)'; ctx.fillText(lblS[j].name, lblX[j], lblY[j]); }
        }
        if (state !== 'menu') hud();
      }
      function hud() {
        const lw = Math.round(200 * F), x0 = W - lw - Math.round(10 * F), top = Math.round(20 * F);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.round(17 * F)}px Arial, Helvetica, sans-serif`;
        ctx.fillText('Leaderboard', x0 + lw / 2 + 6, top);
        ctx.font = `bold ${Math.round(12.5 * F)}px Arial, Helvetica, sans-serif`;
        const rows = Math.min(10, board.length);
        for (let i = 0; i < rows; i++) {
          const s = board[i], y = top + Math.round((22 + i * 17) * F), me = s === player;
          ctx.globalAlpha = me ? 1 : 0.92 - i * 0.035;
          ctx.fillStyle = me ? '#ffffff' : mix(COL[SKINS[s.skin].c[0]], 0.3);
          ctx.textAlign = 'right'; ctx.fillText('#' + (i + 1), x0 + Math.round(28 * F), y);
          ctx.textAlign = 'left';
          const nm = s.name.length > 13 ? s.name.slice(0, 12) + '…' : s.name;
          ctx.fillText(nm, x0 + Math.round(34 * F), y);
          ctx.textAlign = 'right'; ctx.fillText(String(lengthOf(s.m)), x0 + lw, y);
        }
        ctx.globalAlpha = 1;
        if (board.length && !tall) {
          const b0 = board[0], qf = Math.round(12.5 * F), qx = Math.round(12 * F), qy = Math.round(18 * F);
          ctx.textAlign = 'left'; ctx.font = `bold ${qf}px Arial, Helvetica, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,.85)';
          ctx.fillText('"' + QUOTES[(b0.skin + b0.name.length) % QUOTES.length] + '"', qx, qy);
          ctx.font = `${Math.round(11 * F)}px Arial, Helvetica, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,.5)';
          ctx.fillText('- ' + b0.name + ", today's longest snake", qx + 6, qy + Math.round(17 * F));
          ctx.fillText('with a length of ' + lengthOf(b0.m), qx + 6, qy + Math.round(31 * F));
        }
        if (player) {
          const L = lengthOf(player.m), fs = Math.round(14 * F), y1 = H - Math.round(32 * F), y2 = H - Math.round(13 * F);
          ctx.textAlign = 'left';
          let x = Math.round(12 * F);
          const part = (txt, strong, y) => { ctx.font = `${strong ? 'bold ' : ''}${fs}px Arial, Helvetica, sans-serif`; ctx.fillStyle = strong ? '#fff' : 'rgba(255,255,255,.55)'; ctx.fillText(txt, x, y); x += ctx.measureText(txt).width; };
          part('Your length: ', false, y1); part(String(L), true, y1);
          x = Math.round(12 * F);
          if (rank) { part('Your rank: ', false, y2); part(String(rank), true, y2); part(' of ', false, y2); part(String(total), true, y2); }
          else { part('of ', false, y2); part(String(total), true, y2); part(' players', false, y2); }
        }
        const mr = Math.round(46 * F), mx = W - mr - Math.round(12 * F), my = H - mr - Math.round(12 * F), k = mr / R;
        ctx.fillStyle = 'rgba(8,12,18,.6)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(mx - mr, my); ctx.lineTo(mx + mr, my); ctx.moveTo(mx, my - mr); ctx.lineTo(mx, my + mr); ctx.stroke();
        ctx.fillStyle = 'rgba(190,200,220,.38)';
        for (let i = 0; i < SLOTS; i++) {
          const s = sn[i];
          if (!s || !s.used || !s.alive || s === player) continue;
          const stp = Math.max(6, (s.n / 10) | 0);
          for (let j = 0; j < s.n; j += stp) ctx.fillRect(mx + s.bx[j] * k - 1, my + s.by[j] * k - 1, 2, 2);
        }
        if (player && player.used) {
          ctx.fillStyle = 'rgba(255,255,255,.7)';
          const stp = Math.max(4, (player.n / 12) | 0);
          for (let j = stp; j < player.n; j += stp) ctx.fillRect(mx + player.bx[j] * k - 1, my + player.by[j] * k - 1, 2, 2);
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx + player.hx * k, my + player.hy * k, 2.6, 0, TAU); ctx.fill();
        }
        if (touchMode && state === 'play') {
          const on = isBoosting();
          ctx.fillStyle = on ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.12)';
          ctx.beginPath(); ctx.arc(BB.x, BB.y, BB.r, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          const q = BB.r * 0.3;
          ctx.beginPath();
          ctx.moveTo(BB.x - q, BB.y + q * 0.1); ctx.lineTo(BB.x, BB.y - q * 0.9); ctx.lineTo(BB.x + q, BB.y + q * 0.1);
          ctx.moveTo(BB.x - q, BB.y + q * 1.1); ctx.lineTo(BB.x, BB.y + q * 0.1); ctx.lineTo(BB.x + q, BB.y + q * 1.1);
          ctx.stroke();
        }
      }
      function drawPreview() {
        const c = pctx, h = 56, sk = SKINS[skinIdx], N = 15, r = 11, gap = 8.4;
        c.setTransform(DPR, 0, 0, DPR, 0, 0);
        c.clearRect(0, 0, 180, h);
        const yAt = i => h / 2 + Math.sin(gt * 3.2 - i * 0.55) * 7;
        for (let i = N - 1; i >= 0; i--) {
          const x = 156 - i * gap, y = yAt(i), rr = i > N - 5 ? r * (0.55 + 0.45 * (N - 1 - i) / 4) : r;
          c.drawImage(SPRB[sk.c[((i / (sk.w || 1)) | 0) % sk.c.length]], x - rr, y - rr, rr * 2, rr * 2);
        }
        const a = Math.atan2(yAt(0) - yAt(1), gap);
        eyes(c, 156, yAt(0), r, a, a);
      }
      const isBoosting = () => {
        if (mouseBoost || keyBoost) return true;
        let b = false;
        touches.forEach(v => { if (v !== 'steer') b = true; });
        return b;
      };

      for (let i = 0; i < natTarget; i++) spawnNat(-10);
      for (let i = 0; i < 30; i++) { spawnBot(true); build(); }

      api.loop(dt => {
        gt += dt;
        if (state === 'play' && player.alive) {
          if (kbMode) player.wang = turnL !== turnR ? player.ang + (turnR ? 0.7 : -0.7) : player.ang;
          else {
            const sc = zoom * BASE, dx = ptr.x - ((player.hx - camX) * sc + W / 2), dy = ptr.y - ((player.hy - camY) * sc + H / 2);
            if (dx * dx + dy * dy > 30) player.wang = Math.atan2(dy, dx);
          }
          player.boost = isBoosting();
        }
        acc += dt;
        let steps = 0;
        while (acc >= CFG.frame && steps < 8) {
          acc -= CFG.frame; steps++;
          for (let i = 0; i < SLOTS; i++) { const s = sn[i]; if (s && s.used && s.alive) move(s, CFG.frame); }
        }
        if (steps === 8) acc = 0;
        build();
        collide();
        eat();
        for (let i = 0; i < SLOTS; i++) {
          const s = sn[i];
          if (!s || !s.used) continue;
          if (!s.alive) { s.dying -= dt; if (s.dying <= 0 && s !== player) s.used = false; else if (s.dying <= -2) s.used = false; continue; }
          if (s.player) continue;
          s.think -= dt;
          if (s.think <= 0) { const it = 0.2 - 0.12 * s.skill; think(s, it); s.think = it * (0.8 + Math.random() * 0.4); }
        }
        for (let k = CFG.foodBatch; k > 0 && natCount < natTarget; k--) spawnNat(gt);
        let bots = 0;
        for (let i = 0; i < SLOTS; i++) { const s = sn[i]; if (s && s.used && s.alive && !s.player) bots++; }
        if ((botT -= dt) <= 0) { botT = 15 + Math.random() * 15; botTarget = Math.max(CFG.botsMin, Math.min(CFG.botsMax, botTarget + Math.round((Math.random() - 0.5) * 6))); }
        if (bots < botTarget && (respawnT -= dt) <= 0) { spawnBot(false); respawnT = 0.4 + Math.random(); }
        for (let j = 0; j < eN; j++) {
          et[j] += dt;
          if (et[j] > 0.16) { eN--; ex[j] = ex[eN]; ey[j] = ey[eN]; er[j] = er[eN]; ec[j] = ec[eN]; es[j] = es[eN]; et[j] = et[eN]; j--; }
        }
        if ((boardT -= dt) <= 0) {
          boardT = 0.25;
          board.length = 0;
          for (let i = 0; i < SLOTS; i++) { const s = sn[i]; if (s && s.used && s.alive) board.push(s); }
          board.sort((a, b) => b.m - a.m);
          total = board.length;
          rank = player && player.alive ? board.indexOf(player) + 1 : 0;
        }
        let tx = camX, ty = camY, tz = zoom, follow = 20;
        if (state === 'play' || (state === 'dead' && player)) { tx = player.hx; ty = player.hy; if (state === 'play') tz = gscOf(player.m); }
        else {
          if (!spectate || !spectate.alive) spectate = board[(Math.random() * Math.min(4, board.length)) | 0] || null;
          if (spectate) { tx = spectate.hx; ty = spectate.hy; }
          tz = 0.62; follow = 2.2;
        }
        const kk = 1 - Math.exp(-dt * follow);
        camX += (tx - camX) * kk; camY += (ty - camY) * kk;
        zoom += (tz - zoom) * (1 - Math.exp(-dt * 1.6));
        render();
        if (state === 'menu') drawPreview();
        if (state === 'play') {
          const L = lengthOf(player.m);
          if (L !== shownLen) { shownLen = L; api.score(L); }
          boostSound(player.bst);
        } else if (boostSrc) boostSound(false);
      });

      return {
        destroy() {
          try { if (boostSrc) boostSrc.stop(); } catch (e) {}
          try { if (AC) AC.close(); } catch (e) {}
          AC = null;
        }
      };
    }
  });
  Ameplay.covers['slither'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="slc-hex" width="63" height="36.37" patternUnits="userSpaceOnUse"><rect width="63" height="36.37" fill="#0b1015"/><path d="M10.5 18.19l10.5 -18.19h21l10.5 18.19l-10.5 18.19h-21zM-21 0l10.5 -18.19h21l10.5 18.19l-10.5 18.19h-21zM42 0l10.5 -18.19h21l10.5 18.19l-10.5 18.19h-21zM-21 36.37l10.5 -18.19h21l10.5 18.19l-10.5 18.19h-21zM42 36.37l10.5 -18.19h21l10.5 18.19l-10.5 18.19h-21z" fill="#1c2530" stroke="#0b1015" stroke-width="3"/></pattern><radialGradient id="slc-bg" cx=".45" cy=".5" r=".75"><stop offset="0" stop-color="#26323f" stop-opacity="0"/><stop offset="1" stop-color="#05080b" stop-opacity=".7"/></radialGradient><radialGradient id="slc-p" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#ead6ff"/><stop offset=".55" stop-color="#c080ff"/><stop offset="1" stop-color="#1a1030" stop-opacity=".9"/></radialGradient><radialGradient id="slc-w" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f4f4ff"/><stop offset="1" stop-color="#1a1030" stop-opacity=".9"/></radialGradient><radialGradient id="slc-g" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#e2ffe2"/><stop offset=".55" stop-color="#80ff80"/><stop offset="1" stop-color="#1a1030" stop-opacity=".9"/></radialGradient><radialGradient id="slc-y" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#ffffe0"/><stop offset=".55" stop-color="#eeee70"/><stop offset="1" stop-color="#1a1030" stop-opacity=".9"/></radialGradient><radialGradient id="slc-fa"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#ff5fa8"/><stop offset=".42" stop-color="#ff5fa8" stop-opacity=".45"/><stop offset="1" stop-color="#ff5fa8" stop-opacity="0"/></radialGradient><radialGradient id="slc-fb"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#80d0ff"/><stop offset=".42" stop-color="#80d0ff" stop-opacity=".45"/><stop offset="1" stop-color="#80d0ff" stop-opacity="0"/></radialGradient><radialGradient id="slc-fc"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#ffe030"/><stop offset=".42" stop-color="#ffe030" stop-opacity=".45"/><stop offset="1" stop-color="#ffe030" stop-opacity="0"/></radialGradient><radialGradient id="slc-fd"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#80ff80"/><stop offset=".42" stop-color="#80ff80" stop-opacity=".45"/><stop offset="1" stop-color="#80ff80" stop-opacity="0"/></radialGradient><radialGradient id="slc-fe"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#ffa060"/><stop offset=".42" stop-color="#ffa060" stop-opacity=".45"/><stop offset="1" stop-color="#ffa060" stop-opacity="0"/></radialGradient><radialGradient id="slc-ff"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#c080ff"/><stop offset=".42" stop-color="#c080ff" stop-opacity=".45"/><stop offset="1" stop-color="#c080ff" stop-opacity="0"/></radialGradient><radialGradient id="slc-fh"><stop offset="0" stop-color="#fff"/><stop offset=".2" stop-color="#ff4040"/><stop offset=".42" stop-color="#ff4040" stop-opacity=".45"/><stop offset="1" stop-color="#ff4040" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#slc-hex)"/><rect width="400" height="300" fill="url(#slc-bg)"/><path d="M300 0 A 520 520 0 0 1 400 70 V0Z" fill="#4a0612" opacity=".7"/><path d="M300 0 A 520 520 0 0 1 400 70" fill="none" stroke="#ff3550" stroke-width="5"/><g style="mix-blend-mode:screen"><circle cx="15" cy="263.6" r="12.3" fill="url(#slc-fa)"/><circle cx="92.9" cy="211.9" r="14.3" fill="url(#slc-fb)"/><circle cx="136.8" cy="218.1" r="16" fill="url(#slc-fc)"/><circle cx="215.9" cy="199.8" r="15.1" fill="url(#slc-fd)"/><circle cx="317.2" cy="80.3" r="13" fill="url(#slc-fe)"/><circle cx="268" cy="141.3" r="17.4" fill="url(#slc-fh)"/><circle cx="313.7" cy="48.2" r="14.1" fill="url(#slc-fa)"/><circle cx="356.6" cy="200.9" r="15.2" fill="url(#slc-fb)"/><circle cx="228.7" cy="261.2" r="17.3" fill="url(#slc-fc)"/><circle cx="36.7" cy="88.8" r="14.5" fill="url(#slc-fa)"/><circle cx="203.3" cy="128.8" r="11.5" fill="url(#slc-fb)"/><circle cx="351.3" cy="29.8" r="12.9" fill="url(#slc-fc)"/><circle cx="205.5" cy="59.7" r="13.2" fill="url(#slc-fe)"/><circle cx="119.9" cy="113.4" r="13.4" fill="url(#slc-ff)"/><circle cx="101.3" cy="259.8" r="13.7" fill="url(#slc-fa)"/><circle cx="334.3" cy="186.5" r="15.1" fill="url(#slc-fb)"/><circle cx="206" cy="151.3" r="15.5" fill="url(#slc-fc)"/><circle cx="362.6" cy="122.1" r="15.7" fill="url(#slc-fd)"/><circle cx="137.3" cy="120.7" r="16.4" fill="url(#slc-ff)"/><circle cx="339.7" cy="45" r="16.6" fill="url(#slc-fh)"/><circle cx="43.8" cy="124.8" r="11.2" fill="url(#slc-fa)"/><circle cx="43.8" cy="284" r="11.8" fill="url(#slc-fb)"/><circle cx="249" cy="53.9" r="13.7" fill="url(#slc-fc)"/><circle cx="234.4" cy="52.2" r="17.4" fill="url(#slc-fd)"/><circle cx="342.3" cy="255.5" r="17.1" fill="url(#slc-fe)"/><circle cx="350.9" cy="220.5" r="12.2" fill="url(#slc-ff)"/><circle cx="18.9" cy="82" r="10.6" fill="url(#slc-fh)"/><circle cx="103.1" cy="253.2" r="11.9" fill="url(#slc-fc)"/><circle cx="153.4" cy="256.5" r="10.9" fill="url(#slc-fd)"/><circle cx="196" cy="15.8" r="17.3" fill="url(#slc-fe)"/></g><g fill="#000" opacity=".35"><circle cx="314.7" cy="143.5" r="27.5"/><circle cx="298.6" cy="167.6" r="27.5"/><circle cx="282.9" cy="189.8" r="27.5"/><circle cx="267.5" cy="209" r="27.5"/><circle cx="252.3" cy="223.9" r="27.5"/><circle cx="237.5" cy="233.9" r="27.5"/><circle cx="222.9" cy="238.7" r="27.5"/><circle cx="208.6" cy="238.3" r="27.5"/><circle cx="194.3" cy="233.1" r="27.5"/><circle cx="180.1" cy="224" r="27.5"/><circle cx="165.9" cy="211.9" r="27.5"/><circle cx="151.7" cy="198.3" r="27.5"/><circle cx="137.3" cy="184.5" r="27.5"/><circle cx="122.6" cy="172" r="27.5"/><circle cx="107.8" cy="162.2" r="27.5"/><circle cx="92.6" cy="156.1" r="27.5"/><circle cx="77.1" cy="154.7" r="27.5"/><circle cx="61.3" cy="158.5" r="27.5"/><circle cx="45.2" cy="167.5" r="27.5"/><circle cx="28.8" cy="181.5" r="27.5"/><circle cx="12.2" cy="199.9" r="27.5"/><circle cx="-4.6" cy="221.6" r="27.5"/><circle cx="-21.5" cy="245.4" r="27.5"/><circle cx="172.4" cy="109.3" r="15"/><circle cx="162.9" cy="96.6" r="15"/><circle cx="153.8" cy="84.2" r="15"/><circle cx="145" cy="73.2" r="15"/><circle cx="136.1" cy="64.4" r="15"/><circle cx="126.8" cy="58.4" r="15"/><circle cx="116.7" cy="55.2" r="15"/><circle cx="105.8" cy="54.4" r="15"/><circle cx="93.9" cy="55.3" r="15"/><circle cx="81" cy="56.9" r="15"/><circle cx="67.2" cy="57.9" r="15"/><circle cx="52.6" cy="57.5" r="15"/><circle cx="37.6" cy="54.6" r="15"/></g><circle cx="30" cy="48" r="6.6" fill="url(#slc-g)"/><circle cx="37.6" cy="50.4" r="7.3" fill="url(#slc-g)"/><circle cx="45.1" cy="52.2" r="8" fill="url(#slc-y)"/><circle cx="52.6" cy="53.3" r="8.8" fill="url(#slc-y)"/><circle cx="60" cy="53.7" r="9.5" fill="url(#slc-y)"/><circle cx="67.2" cy="53.7" r="10.2" fill="url(#slc-g)"/><circle cx="74.2" cy="53.3" r="10.9" fill="url(#slc-g)"/><circle cx="81" cy="52.7" r="11.6" fill="url(#slc-g)"/><circle cx="87.6" cy="51.9" r="12" fill="url(#slc-y)"/><circle cx="93.9" cy="51.1" r="12" fill="url(#slc-y)"/><circle cx="100" cy="50.5" r="12" fill="url(#slc-y)"/><circle cx="105.8" cy="50.2" r="12" fill="url(#slc-g)"/><circle cx="111.4" cy="50.3" r="12" fill="url(#slc-g)"/><circle cx="116.7" cy="51" r="12" fill="url(#slc-g)"/><circle cx="121.8" cy="52.2" r="12" fill="url(#slc-y)"/><circle cx="126.8" cy="54.2" r="12" fill="url(#slc-y)"/><circle cx="131.5" cy="56.8" r="12" fill="url(#slc-y)"/><circle cx="136.1" cy="60.2" r="12" fill="url(#slc-g)"/><circle cx="140.6" cy="64.3" r="12" fill="url(#slc-g)"/><circle cx="145" cy="69" r="12" fill="url(#slc-g)"/><circle cx="149.4" cy="74.2" r="12" fill="url(#slc-y)"/><circle cx="153.8" cy="80" r="12" fill="url(#slc-y)"/><circle cx="158.3" cy="86.1" r="12" fill="url(#slc-y)"/><circle cx="162.9" cy="92.4" r="12" fill="url(#slc-g)"/><circle cx="167.6" cy="98.8" r="12" fill="url(#slc-g)"/><circle cx="172.4" cy="105.1" r="12" fill="url(#slc-g)"/><circle cx="179.8" cy="104.9" r="5" fill="#fff"/><circle cx="181.1" cy="106.5" r="2.9" fill="#141414"/><circle cx="170.3" cy="112.2" r="5" fill="#fff"/><circle cx="171.5" cy="113.8" r="2.9" fill="#141414"/><circle cx="-30" cy="250" r="12.7" fill="url(#slc-w)"/><circle cx="-21.5" cy="237.7" r="13.6" fill="url(#slc-w)"/><circle cx="-13.1" cy="225.6" r="14.5" fill="url(#slc-p)"/><circle cx="-4.6" cy="213.9" r="15.4" fill="url(#slc-p)"/><circle cx="3.8" cy="202.7" r="16.3" fill="url(#slc-p)"/><circle cx="12.2" cy="192.2" r="17.3" fill="url(#slc-p)"/><circle cx="20.5" cy="182.5" r="18.2" fill="url(#slc-w)"/><circle cx="28.8" cy="173.8" r="19.1" fill="url(#slc-w)"/><circle cx="37" cy="166.2" r="20" fill="url(#slc-w)"/><circle cx="45.2" cy="159.8" r="20.9" fill="url(#slc-w)"/><circle cx="53.3" cy="154.6" r="21.8" fill="url(#slc-p)"/><circle cx="61.3" cy="150.8" r="22.8" fill="url(#slc-p)"/><circle cx="69.2" cy="148.2" r="23" fill="url(#slc-p)"/><circle cx="77.1" cy="147" r="23" fill="url(#slc-p)"/><circle cx="84.9" cy="147.1" r="23" fill="url(#slc-w)"/><circle cx="92.6" cy="148.4" r="23" fill="url(#slc-w)"/><circle cx="100.2" cy="150.9" r="23" fill="url(#slc-w)"/><circle cx="107.8" cy="154.5" r="23" fill="url(#slc-w)"/><circle cx="115.2" cy="159" r="23" fill="url(#slc-p)"/><circle cx="122.6" cy="164.3" r="23" fill="url(#slc-p)"/><circle cx="130" cy="170.3" r="23" fill="url(#slc-p)"/><circle cx="137.3" cy="176.8" r="23" fill="url(#slc-p)"/><circle cx="144.5" cy="183.6" r="23" fill="url(#slc-w)"/><circle cx="151.7" cy="190.6" r="23" fill="url(#slc-w)"/><circle cx="158.8" cy="197.5" r="23" fill="url(#slc-w)"/><circle cx="165.9" cy="204.2" r="23" fill="url(#slc-w)"/><circle cx="173" cy="210.5" r="23" fill="url(#slc-p)"/><circle cx="180.1" cy="216.3" r="23" fill="url(#slc-p)"/><circle cx="187.2" cy="221.3" r="23" fill="url(#slc-p)"/><circle cx="194.3" cy="225.4" r="23" fill="url(#slc-p)"/><circle cx="201.4" cy="228.6" r="23" fill="url(#slc-w)"/><circle cx="208.6" cy="230.6" r="23" fill="url(#slc-w)"/><circle cx="215.7" cy="231.5" r="23" fill="url(#slc-w)"/><circle cx="222.9" cy="231" r="23" fill="url(#slc-w)"/><circle cx="230.2" cy="229.3" r="23" fill="url(#slc-p)"/><circle cx="237.5" cy="226.2" r="23" fill="url(#slc-p)"/><circle cx="244.9" cy="221.9" r="23" fill="url(#slc-p)"/><circle cx="252.3" cy="216.2" r="23" fill="url(#slc-p)"/><circle cx="259.9" cy="209.3" r="23" fill="url(#slc-w)"/><circle cx="267.5" cy="201.3" r="23" fill="url(#slc-w)"/><circle cx="275.1" cy="192.2" r="23" fill="url(#slc-w)"/><circle cx="282.9" cy="182.1" r="23" fill="url(#slc-w)"/><circle cx="290.7" cy="171.3" r="23" fill="url(#slc-p)"/><circle cx="298.6" cy="159.9" r="23" fill="url(#slc-p)"/><circle cx="306.6" cy="148" r="23" fill="url(#slc-p)"/><circle cx="314.7" cy="135.8" r="23" fill="url(#slc-p)"/><circle cx="309.7" cy="122.6" r="9.7" fill="#fff"/><circle cx="311.8" cy="119.3" r="5.5" fill="#141414"/><circle cx="328.9" cy="135.3" r="9.7" fill="#fff"/><circle cx="331" cy="132" r="5.5" fill="#141414"/></svg>`;
})();

