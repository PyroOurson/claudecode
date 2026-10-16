
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const font = (s, w = 800) => `${w} ${s}px Nunito, system-ui, sans-serif`;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const easeOut = t => 1 - (1 - t) * (1 - t) * (1 - t);
  const easeBack = t => { const u = t - 1; return 1 + 2.70158 * u * u * u + 1.70158 * u * u; };
  const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const tint = (h, k) => { const t = k > 0 ? 255 : 0, a = Math.abs(k); return `rgb(${rgb(h).map(v => Math.round(v + (t - v) * a)).join(',')})`; };
  const rgba = (h, a) => `rgba(${rgb(h).join(',')},${a})`;
  const fmtN = v => v == null ? '—' : Number(v).toLocaleString('en-US');

  function sprite(w, h, dpr, draw) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    const x = c.getContext('2d'); x.scale(dpr, dpr); draw(x, w, h);
    return c;
  }
  function sparkle(x, cx, cy, r, a = 1) {
    x.save(); x.globalAlpha *= a; x.fillStyle = '#fff'; x.beginPath();
    x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r);
    x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); x.restore();
  }
  function blobs(x, W, H, list) {
    for (const [bx, by, br, bc, a] of list) {
      const g = x.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, rgba(bc, a)); g.addColorStop(1, rgba(bc, 0));
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
  }

  function makeFx() {
    const parts = [], rings = [], texts = [], beams = [], zaps = [];
    let shake = 0;
    return {
      burst(x, y, color, n, sp = 240, size = 4, grav = 700, life = .7) {
        for (let i = 0; i < n && parts.length < 900; i++) {
          const a = Math.random() * TAU, v = sp * (.25 + Math.random() * .75);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .3, s: size * (.6 + Math.random() * .8), c: color, t: 0, l: life * (.6 + Math.random() * .7), g: grav, st: Math.random() < .2 });
        }
      },
      ring(x, y, c, r = 40, l = .45, w = 6) { rings.push({ x, y, c, r, t: 0, l, w }); },
      beam(x, y, w, h, c, l = .4) { beams.push({ x, y, w, h, c, t: 0, l }); },
      zap(x1, y1, x2, y2, c, l = .35) { zaps.push({ x1, y1, x2, y2, c, t: 0, l }); },
      text(x, y, s, c, z = 28, l = 1.1) { texts.push({ x, y, s, c, z, t: 0, l }); },
      kick(v) { shake = Math.max(shake, v); },
      fade() { for (const t of texts) t.t = Math.max(t.t, t.l * .8); },
      shake(ctx, dt) { shake = Math.max(0, shake - dt * 28); if (shake > .1) ctx.translate((Math.random() * 2 - 1) * shake, (Math.random() * 2 - 1) * shake); },
      clear() { parts.length = rings.length = texts.length = beams.length = zaps.length = 0; shake = 0; },
      update(dt) {
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          if ((p.t += dt) >= p.l) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          p.vy += p.g * dt; p.vx *= 1 - 1.2 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        for (const L of [rings, texts, beams, zaps]) for (let i = L.length - 1; i >= 0; i--) if ((L[i].t += dt) >= L[i].l) L.splice(i, 1);
      },
      draw(ctx) {
        for (const b of beams) {
          const k = b.t / b.l, a = 1 - k;
          ctx.globalAlpha = a * .85; ctx.fillStyle = b.c;
          if (b.w >= b.h) {
            const h = b.h * (1 - k * .6);
            ctx.fillRect(b.x, b.y + (b.h - h) / 2, b.w, h); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.fillRect(b.x, b.y + b.h / 2 - h * .2, b.w, h * .4);
          } else {
            const w = b.w * (1 - k * .6);
            ctx.fillRect(b.x + (b.w - w) / 2, b.y, w, b.h); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.fillRect(b.x + b.w / 2 - w * .2, b.y, w * .4, b.h);
          }
        }
        ctx.lineCap = 'round';
        for (const z of zaps) {
          const k = z.t / z.l;
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = z.c; ctx.lineWidth = 3.5 * (1 - k) + 1; ctx.beginPath(); ctx.moveTo(z.x1, z.y1);
          for (let i = 1; i < 6; i++) { const f = i / 6; ctx.lineTo(lerp(z.x1, z.x2, f) + rand(-7, 7), lerp(z.y1, z.y2, f) + rand(-7, 7)); }
          ctx.lineTo(z.x2, z.y2); ctx.stroke();
        }
        for (const r of rings) {
          const k = r.t / r.l;
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = r.c; ctx.lineWidth = r.w * (1 - k) + .5;
          ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (.25 + .75 * easeOut(k)), 0, TAU); ctx.stroke();
        }
        for (const p of parts) {
          const a = 1 - p.t / p.l;
          ctx.globalAlpha = a;
          if (p.st) sparkle(ctx, p.x, p.y, p.s * 1.6);
          else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (.5 + .5 * a), 0, TAU); ctx.fill(); }
        }
        ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        for (const t of texts) {
          const k = t.t / t.l, sc = easeBack(Math.min(1, t.t / .2));
          ctx.globalAlpha = k > .65 ? (1 - k) / .35 : 1;
          ctx.save(); ctx.translate(t.x, t.y - 36 * easeOut(k)); ctx.scale(sc, sc);
          ctx.font = font(t.z, 900); ctx.lineWidth = t.z * .22; ctx.strokeStyle = 'rgba(35,18,70,.6)';
          ctx.strokeText(t.s, 0, 0); ctx.fillStyle = t.c; ctx.fillText(t.s, 0, 0); ctx.restore();
        }
        ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
      }
    };
  }

  const T_COLS = 10, T_ROWS = 22, T_HID = 2;
  const T_COL = { I: '#2ccfff', O: '#ffd23f', T: '#b45cff', S: '#3ddc84', Z: '#ff4d6d', J: '#3d7bff', L: '#ff9a2e' };
  const T_SHAPE = { I: ['....', 'XXXX', '....', '....'], J: ['X..', 'XXX', '...'], L: ['..X', 'XXX', '...'], O: ['XX', 'XX'], S: ['.XX', 'XX.', '...'], T: ['.X.', 'XXX', '...'], Z: ['XX.', '.XX', '...'] };
  const TP = {};
  for (const k in T_SHAPE) {
    let m = T_SHAPE[k].map(r => [...r].map(ch => ch === 'X'));
    TP[k] = [];
    for (let s = 0; s < 4; s++) {
      const cells = [];
      m.forEach((row, y) => row.forEach((v, x) => v && cells.push([x, y])));
      TP[k].push(cells);
      m = m.map((row, r) => row.map((_, c) => m[m.length - 1 - c][r]));
    }
  }

  const KJ = { '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]], '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]] };
  const KI = { '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]], '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]] };
  const tNewBoard = () => Array.from({ length: T_ROWS }, () => Array(T_COLS).fill(0));
  function tCollide(b, type, rot, x, y) {
    for (const [cx, cy] of TP[type][rot]) {
      const bx = x + cx, by = y + cy;
      if (bx < 0 || bx >= T_COLS || by >= T_ROWS || (by >= 0 && b[by][bx])) return true;
    }
    return false;
  }
  function tRotate(b, p, dir) {
    if (p.type === 'O') return -1;
    const to = (p.rot + dir + 4) % 4, tbl = (p.type === 'I' ? KI : KJ)[p.rot + '>' + to];
    for (let i = 0; i < tbl.length; i++) {
      const nx = p.x + tbl[i][0], ny = p.y - tbl[i][1];
      if (!tCollide(b, p.type, to, nx, ny)) { p.x = nx; p.y = ny; p.rot = to; return i; }
    }
    return -1;
  }
  function tSpin(b, p, kick) {
    if (p.type !== 'T' || kick < 0) return 0;
    const occ = (x, y) => x < 0 || x >= T_COLS || y >= T_ROWS || (y >= 0 && !!b[y][x]);
    const cx = p.x + 1, cy = p.y + 1, c = [occ(cx - 1, cy - 1), occ(cx + 1, cy - 1), occ(cx + 1, cy + 1), occ(cx - 1, cy + 1)];
    if (c.filter(Boolean).length < 3) return 0;
    const f = [[0, 1], [1, 2], [2, 3], [3, 0]][p.rot];
    return (c[f[0]] && c[f[1]]) || kick === 4 ? 2 : 1;
  }
  const tFullRows = b => b.reduce((a, row, y) => (row.every(Boolean) && a.push(y), a), []);
  function tClear(b, rows) { for (const y of rows) { b.splice(y, 1); b.unshift(Array(T_COLS).fill(0)); } }
  function tScore(st, lines, ts, pc) {
    let pts, label, hard;
    if (ts === 2) { pts = [400, 800, 1200, 1600][lines]; label = ['T-SPIN', 'T-SPIN SINGLE', 'T-SPIN DOUBLE', 'T-SPIN TRIPLE'][lines]; hard = lines > 0; }
    else if (ts === 1) { pts = [100, 200, 400, 400][lines]; label = ['MINI T-SPIN', 'MINI T-SPIN SINGLE', 'MINI T-SPIN DOUBLE', 'MINI T-SPIN'][lines]; hard = lines > 0; }
    else { pts = [0, 100, 300, 500, 800][lines]; label = ['', '', 'DOUBLE', 'TRIPLE', 'TETRA!'][lines]; hard = lines === 4; }
    pts *= st.level;
    let b2b = false;
    if (lines) {
      if (hard && st.b2b) { pts = Math.round(pts * 1.5); b2b = true; }
      st.b2b = hard; st.combo++;
      if (st.combo > 0) pts += 50 * st.combo * st.level;
      if (pc) pts += [0, 800, 1200, 1800, 2000][lines] * st.level;
    } else st.combo = -1;
    return { pts, label, b2b };
  }
  function drawBlock(x, s, col) {
    const r = s * .22;
    let g = x.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, tint(col, .32)); g.addColorStop(.55, col); g.addColorStop(1, tint(col, -.3));
    x.fillStyle = g; x.beginPath(); x.roundRect(1, 1, s - 2, s - 2, r); x.fill();
    x.strokeStyle = tint(col, -.45); x.lineWidth = 1; x.stroke();
    g = x.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(.5, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
    x.strokeStyle = g; x.lineWidth = s * .08; x.beginPath(); x.roundRect(s * .1, s * .1, s * .8, s * .8, r * .7); x.stroke();
    g = x.createLinearGradient(0, s * .1, 0, s * .5);
    g.addColorStop(0, 'rgba(255,255,255,.62)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.roundRect(s * .18, s * .14, s * .64, s * .32, s * .14); x.fill();
    sparkle(x, s * .3, s * .28, s * .11, .95);
  }

  const PAD_SVG = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  function tBag() { const a = [...'IJLOSTZ']; for (let i = 6; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  Ameplay.register({
    id: 'tetra',
    title: 'Tetra Blocks',
    category: 'Puzzle',
    blurb: 'Stack falling blocks, clear lines and chase T-spins.',
    help: '<kbd>←</kbd> <kbd>→</kbd> move · <kbd>↓</kbd> soft drop · <kbd>Space</kbd> hard drop · <kbd>↑</kbd> <kbd>X</kbd> rotate · <kbd>Z</kbd> rotate left · <kbd>C</kbd> hold · <kbd>P</kbd> pause · touch: tap to rotate, drag to move, flick down to drop, or use the button pad; tap PAUSE on the board',
    better: 'high',
    format: v => fmtN(v),
    width: 720,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="38" width="14" height="14" rx="3"/><rect x="25" y="38" width="14" height="14" rx="3"/><rect x="41" y="38" width="14" height="14" rx="3"/><rect x="25" y="22" width="14" height="14" rx="3"/><rect x="41" y="8" width="14" height="14" rx="3" fill="currentColor" opacity=".3"/></svg>',
    css: `.gm-tetra .tpad{display:none;gap:6px;width:100%;max-width:560px}
.gm-tetra .tpad button{flex:1;min-width:0;height:54px;border:0;border-radius:14px;padding:0;display:grid;place-items:center;color:#fff;font:900 12px/1 var(--sans);letter-spacing:.06em;background:linear-gradient(#8b7cff,#5b48dc);box-shadow:0 4px 0 #3e2fa6,0 8px 16px rgba(70,50,170,.28);touch-action:none;-webkit-tap-highlight-color:transparent;cursor:pointer}
.gm-tetra .tpad button.on{transform:translateY(3px);box-shadow:0 1px 0 #3e2fa6}
.gm-tetra .tpad svg{width:24px;height:24px}
@media (hover:none),(pointer:coarse),(max-width:640px){.gm-tetra .tpad{display:flex}}
`,
    mount(root, api) {
      const W = 560, H = 640, CS = 30, WX = 130, WY = 24, WW = CS * T_COLS, WH = CS * (T_ROWS - T_HID);
      const DAS = 150, ARR = 30, LOCK = .5, MAXRESET = 15, CLEAR_T = .2, DROP_T = .14, PB = [440, 540, 104, 76];
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      canvas.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px) - 60px) * ${(W / H).toFixed(4)}))`;
      const dpr = canvas.width / W, fx = makeFx();
      const spr = {};
      for (const k in T_COL) spr[k] = sprite(CS, CS, dpr, x => drawBlock(x, CS, T_COL[k]));
      const grey = sprite(CS, CS, dpr, x => drawBlock(x, CS, '#8c88a8'));
      const bg = sprite(W, H, dpr, x => {
        let g = x.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#3a2f8f'); g.addColorStop(.55, '#5a35a6'); g.addColorStop(1, '#8a3f9e');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        blobs(x, W, H, [[60, 560, 200, '#ff7ac8', .35], [520, 110, 210, '#4fd2ff', .3], [280, 320, 280, '#7f6bff', .25]]);
        const panel = (px, py, pw, ph, label) => {
          x.fillStyle = 'rgba(15,10,45,.35)'; x.beginPath(); x.roundRect(px, py, pw, ph, 16); x.fill();
          x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 1.5; x.stroke();
          if (label) { x.font = font(12, 900); x.letterSpacing = '2px'; x.fillStyle = 'rgba(255,255,255,.7)'; x.textAlign = 'center'; x.fillText(label, px + pw / 2, py + 20); x.letterSpacing = '0px'; }
        };
        panel(16, WY, 104, 96, 'HOLD');
        panel(16, 136, 104, 206, '');
        panel(440, WY, 104, 330, 'NEXT');
        panel(PB[0], PB[1], PB[2], PB[3], '');
        x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.roundRect(PB[0] + 38, PB[1] + 16, 8, 26, 3); x.roundRect(PB[0] + 50, PB[1] + 16, 8, 26, 3); x.fill();
        x.font = font(11, 900); x.letterSpacing = '2px'; x.fillStyle = 'rgba(255,255,255,.6)'; x.textAlign = 'center'; x.fillText('PAUSE', PB[0] + PB[2] / 2, PB[1] + 62); x.letterSpacing = '0px';
        x.font = font(11, 900); x.letterSpacing = '2px'; x.fillStyle = 'rgba(255,255,255,.6)'; x.textAlign = 'center';
        [['SCORE', 160], ['LEVEL', 226], ['LINES', 292]].forEach(([t, y]) => x.fillText(t, 68, y));
        x.letterSpacing = '0px';
        x.save(); x.shadowColor = 'rgba(10,5,40,.6)'; x.shadowBlur = 24; x.shadowOffsetY = 8;
        x.fillStyle = '#16123a'; x.beginPath(); x.roundRect(WX - 6, WY - 6, WW + 12, WH + 12, 14); x.fill(); x.restore();
        g = x.createLinearGradient(0, WY, 0, WY + WH); g.addColorStop(0, '#1e1953'); g.addColorStop(1, '#110e2e');
        x.fillStyle = g; x.fillRect(WX, WY, WW, WH);
        x.strokeStyle = 'rgba(255,255,255,.055)'; x.lineWidth = 1; x.beginPath();
        for (let i = 1; i < T_COLS; i++) { x.moveTo(WX + i * CS + .5, WY); x.lineTo(WX + i * CS + .5, WY + WH); }
        for (let j = 1; j < 20; j++) { x.moveTo(WX, WY + j * CS + .5); x.lineTo(WX + WW, WY + j * CS + .5); }
        x.stroke();
        x.strokeStyle = 'rgba(170,150,255,.5)'; x.lineWidth = 2; x.beginPath(); x.roundRect(WX - 6, WY - 6, WW + 12, WH + 12, 14); x.stroke();
      });

      let board = tNewBoard(), cur = null, hold = null, holdUsed = false, queue = [], st = { level: 1, b2b: false, combo: -1 };
      let score = 0, lines = 0, startLevel = 1, state = 'ready', acc = 0, lockT = 0, resets = 0, lowest = 0, lastRot = -1;
      let clearRows = [], clearT = 0, drop = null, dropT = 0, overT = 0, softAcc = 0, dasDir = 0, dasT = 0;
      const held = { L: false, R: false, D: false }, flash = [], trails = [];

      const grav = () => Math.pow(Math.max(.05, .8 - (st.level - 1) * .007), Math.min(st.level, 20) - 1);
      const hits = (dx, dy, rot = cur.rot) => tCollide(board, cur.type, rot, cur.x + dx, cur.y + dy);
      const grounded = () => hits(0, 1);
      function nextType() { while (queue.length < 7) queue.push(...tBag()); return queue.shift(); }
      function spawn(type) {
        type = type || nextType();
        cur = { type, rot: 0, x: type === 'O' ? 4 : 3, y: 0 };
        if (hits(0, 0)) { gameOver(); return; }
        if (!hits(0, 1)) cur.y++;
        lowest = cur.y; lockT = 0; resets = 0; acc = 0; lastRot = -1;
      }
      function resetLock() { if (resets < MAXRESET) { if (lockT > 0 || grounded()) resets++; lockT = 0; } }
      function shift(dx) {
        if (!cur || hits(dx, 0)) return false;
        cur.x += dx; lastRot = -1; resetLock(); return true;
      }
      function fall() {
        if (hits(0, 1)) return false;
        cur.y++; lastRot = -1;
        if (cur.y > lowest) { lowest = cur.y; lockT = 0; resets = 0; }
        return true;
      }
      function softStep() { if (!fall()) return false; score++; api.score(score); return true; }
      function rot(dir) {
        const k = tRotate(board, cur, dir);
        if (k < 0) return;
        lastRot = k; resetLock(); api.sfx('tick');
      }
      function ghostY() { let d = 0; while (!hits(0, d + 1)) d++; return cur.y + d; }
      function hardDrop() {
        const d = ghostY() - cur.y;
        if (d > 0) {
          for (const [cx, cy] of TP[cur.type][cur.rot]) trails.push({ x: WX + (cur.x + cx) * CS, y0: WY + (cur.y + cy - T_HID) * CS, y1: WY + (cur.y + cy + d - T_HID) * CS, c: T_COL[cur.type], t: 0 });
          cur.y += d; lastRot = -1; score += 2 * d; api.score(score);
        }
        fx.kick(3); api.sfx('hit'); lock();
      }
      function doHold() {
        if (holdUsed) return;
        const t = cur.type;
        holdUsed = true; api.sfx('tap');
        if (hold) { const h = hold; hold = t; spawn(h); } else { hold = t; spawn(); }
      }
      function lock() {
        const ts = tSpin(board, cur, lastRot), cells = TP[cur.type][cur.rot];
        let out = true;
        for (const [cx, cy] of cells) {
          const x = cur.x + cx, y = cur.y + cy;
          if (y >= 0) board[y][x] = cur.type;
          if (y >= T_HID) out = false;
          flash.push({ x, y, t: 0 });
        }
        const rows = tFullRows(board), n = rows.length;
        const pc = n > 0 && board.every((row, y) => rows.includes(y) || row.every(v => !v));
        const lv = st.level, r = tScore(st, n, ts, pc);
        score += r.pts; api.score(score);
        const cx = WX + WW / 2;
        if (r.label || n) fx.fade();
        if (r.label) fx.text(cx, WY + 230, r.label, ts ? '#e9b6ff' : n === 4 ? '#7ff0ff' : '#ffffff', r.label.length > 12 ? 22 : 30, 1.3);
        if (r.b2b) fx.text(cx, WY + 196, 'BACK-TO-BACK', '#ffd23f', 18, 1.3);
        if (n && st.combo > 0) fx.text(cx, WY + 266, 'COMBO ' + st.combo, '#ffd23f', 22, 1.1);
        if (pc) fx.text(cx, WY + 300, 'PERFECT CLEAR', '#7dffb0', 26, 1.6);
        if (n) fx.text(cx, WY + 160, '+' + fmtN(r.pts), '#fff', 18, .9);
        cur = null; holdUsed = false;
        if (n) {
          lines += n;
          const nl = Math.max(startLevel, 1 + Math.floor(lines / 10));
          if (nl > lv) { st.level = nl; fx.text(cx, WY + 340, 'LEVEL ' + nl, '#7ff0ff', 28, 1.4); }
          state = 'clear'; clearT = 0; clearRows = rows;
          for (const y of rows) {
            fx.beam(WX, WY + (y - T_HID) * CS, WW, CS, n === 4 || ts ? '#c9a6ff' : '#ffffff', .45);
            for (let x = 0; x < T_COLS; x++) fx.burst(WX + x * CS + CS / 2, WY + (y - T_HID) * CS + CS / 2, T_COL[board[y][x]], n >= 3 ? 3 : 2, 300, 4, 600, .8);
          }
          fx.kick(n === 4 || ts ? 7 : 2 + n);
          api.sfx(n === 4 || ts || pc ? 'win' : 'good');
        } else if (out) gameOver();
        else { if (ts) api.sfx('good'); spawn(); }
      }
      function finishClear() {
        const rows = clearRows;
        tClear(board, rows); clearRows = [];
        drop = new Array(T_ROWS).fill(0);
        for (let yo = 0; yo < T_ROWS; yo++) {
          if (rows.includes(yo)) continue;
          let n = 0; for (const r of rows) if (r > yo) n++;
          drop[yo + n] = n;
        }
        dropT = DROP_T; state = 'play'; spawn();
      }
      function gameOver() {
        if (state === 'over') return;
        state = 'over'; overT = 0; cur = null; api.sfx('lose'); fx.kick(8);
        const nb = api.submit(score);
        api.timeout(() => api.overlay({ kicker: nb ? 'New best!' : 'Game over', title: 'Topped out', stats: [['Score', fmtN(score)], ['Lines', lines], ['Level', st.level], ['Best', fmtN(api.best)]], button: 'Play again', onAction: () => start(startLevel) }), 1000);
      }
      function start(L) {
        startLevel = L; board = tNewBoard(); queue = []; hold = null; holdUsed = false; score = 0; lines = 0;
        st = { level: L, b2b: false, combo: -1 }; fx.clear(); trails.length = 0; flash.length = 0; clearRows = []; drop = null; dropT = 0; softAcc = 0;
        api.score(0); state = 'play'; spawn();
      }
      function togglePause() {
        if (state === 'play') { state = 'pause'; api.overlay({ kicker: 'Paused', title: 'Tetris', text: 'Take a breather.', button: 'Resume', onAction: () => { if (state === 'pause') state = 'play'; } }); }
        else if (state === 'pause') { api.hideOverlay(); state = 'play'; }
      }

      const live = () => state === 'play' && cur;
      function down(a) {
        if (a === 'P') { togglePause(); return; }
        if (a === 'L' || a === 'R') { held[a] = true; dasDir = a === 'L' ? -1 : 1; dasT = 0; if (live()) shift(dasDir); return; }
        if (a === 'D') { held.D = true; softAcc = 0; if (live()) softStep(); return; }
        if (!live()) return;
        if (a === 'H') hardDrop(); else if (a === 'CW') rot(1); else if (a === 'CCW') rot(-1); else if (a === 'HOLD') doHold();
      }
      function up(a) {
        if (a === 'L' || a === 'R') {
          held[a] = false;
          const o = a === 'L' ? 'R' : 'L';
          if (dasDir === (a === 'L' ? -1 : 1)) { if (held[o]) { dasDir = -dasDir; dasT = 0; } else dasDir = 0; }
        } else if (a === 'D') held.D = false;
      }
      const KM = { ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R', ArrowDown: 'D', KeyS: 'D', Space: 'H', ArrowUp: 'CW', KeyX: 'CW', KeyW: 'CW', KeyZ: 'CCW', ControlLeft: 'CCW', ControlRight: 'CCW', KeyC: 'HOLD', ShiftLeft: 'HOLD', ShiftRight: 'HOLD', KeyP: 'P' };
      api.on(window, 'keydown', e => {
        const a = KM[e.code];
        if (!a || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
        if ((e.ctrlKey || e.metaKey || e.altKey) && e.code.startsWith('Key')) return;
        e.preventDefault();
        if (!e.repeat) down(a);
      });
      api.on(window, 'keyup', e => { const a = KM[e.code]; if (a) up(a); });
      api.on(window, 'blur', () => { up('L'); up('R'); up('D'); });
      api.on(document, 'visibilitychange', () => { if (document.hidden && state === 'play') togglePause(); });

      let tp = null;
      canvas.addEventListener('pointerdown', e => {
        e.preventDefault();
        const p = toLocal(e);
        if (e.pointerType === 'touch') pad.style.display = 'flex';
        if (p.x >= PB[0] && p.y >= PB[1] && p.y <= PB[1] + PB[3]) { down('P'); return; }
        if (p.x < 124 && p.y < 124) { down('HOLD'); return; }
        tp = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ax: e.clientX, ay: e.clientY, t0: e.timeStamp, lt: e.timeStamp, ly: e.clientY, vy: 0, axis: '', moved: false };
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {   }
      });
      canvas.addEventListener('pointermove', e => {
        if (!tp || e.pointerId !== tp.id) return;
        const step = Math.max(14, canvas.getBoundingClientRect().width / W * CS * .9);
        const dt = Math.max(1, e.timeStamp - tp.lt);
        tp.vy = tp.vy * .4 + (e.clientY - tp.ly) / dt * .6; tp.lt = e.timeStamp; tp.ly = e.clientY;
        const tx = e.clientX - tp.x0, ty = e.clientY - tp.y0;
        if (!tp.axis && Math.max(Math.abs(tx), Math.abs(ty)) > 10) tp.axis = Math.abs(tx) > Math.abs(ty) ? 'x' : 'y';
        if (!live()) return;
        if (tp.axis === 'x') {
          while (e.clientX - tp.ax >= step) { shift(1); tp.ax += step; tp.moved = true; }
          while (e.clientX - tp.ax <= -step) { shift(-1); tp.ax -= step; tp.moved = true; }
        } else if (tp.axis === 'y' && tp.vy < 1.1) {
          while (e.clientY - tp.ay >= step) { softStep(); tp.ay += step; tp.moved = true; }
        }
      });
      const endTouch = e => {
        if (!tp || e.pointerId !== tp.id) return;
        const t = tp; tp = null;
        if (e.type !== 'pointerup' || !live()) return;
        const dx = e.clientX - t.x0, dy = e.clientY - t.y0, dur = e.timeStamp - t.t0;
        if (t.axis === 'y' && dy > 40 && (t.vy > .9 || dy / Math.max(1, dur) > .9)) hardDrop();
        else if (t.axis === 'y' && dy < -40) doHold();
        else if (!t.moved && Math.hypot(dx, dy) < 12 && dur < 350) rot(1);
      };
      canvas.addEventListener('pointerup', endTouch);
      canvas.addEventListener('pointercancel', endTouch);

      const pad = document.createElement('div');
      pad.className = 'tpad';
      [['HOLD', 'HOLD'], ['L', PAD_SVG('<path d="M15 5l-7 7 7 7"/>')], ['CCW', PAD_SVG('<path d="M4.5 13a7.5 7.5 0 1 0 2.4-6.2"/><path d="M5 3.5v4.2h4.2"/>')], ['CW', PAD_SVG('<path d="M19.5 13a7.5 7.5 0 1 1-2.4-6.2"/><path d="M19 3.5v4.2h-4.2"/>')], ['R', PAD_SVG('<path d="M9 5l7 7-7 7"/>')], ['D', PAD_SVG('<path d="M5 9l7 7 7-7"/>')], ['H', PAD_SVG('<path d="M6 4l6 6 6-6M6 11l6 6 6-6M5 21h14"/>')]].forEach(([a, html]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.innerHTML = html; b.setAttribute('aria-label', { HOLD: 'Hold', L: 'Left', CCW: 'Rotate left', CW: 'Rotate right', R: 'Right', D: 'Soft drop', H: 'Hard drop' }[a]);
        b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (err) {   } b.classList.add('on'); down(a); });
        const rel = () => { b.classList.remove('on'); up(a); };
        b.addEventListener('pointerup', rel); b.addEventListener('pointercancel', rel); b.addEventListener('lostpointercapture', rel);
        pad.append(b);
      });
      root.append(pad);

      function update(dt) {
        fx.update(dt);
        const ms = dt * 1000;
        if (dropT > 0) dropT = Math.max(0, dropT - dt);
        for (let i = flash.length - 1; i >= 0; i--) if ((flash[i].t += dt) > .18) flash.splice(i, 1);
        for (let i = trails.length - 1; i >= 0; i--) if ((trails[i].t += dt) > .28) trails.splice(i, 1);
        if (state === 'clear' && (clearT += dt) >= CLEAR_T) finishClear();
        if (state === 'over') overT += dt;
        if (dasDir && (state === 'play' || state === 'clear')) {
          const prev = dasT; dasT += ms;
          if (live() && dasT >= DAS) {
            let n = prev < DAS ? 1 + Math.floor((dasT - DAS) / ARR) : Math.floor((dasT - DAS) / ARR) - Math.floor((prev - DAS) / ARR);
            while (n-- > 0 && shift(dasDir));
          }
        }
        if (!live()) return;
        if (held.D) {
          softAcc += dt;
          const si = Math.min(grav() / 20, .05);
          while (softAcc >= si && cur) { softAcc -= si; if (!softStep()) { softAcc = 0; break; } }
        }
        if (grounded()) { if ((lockT += dt) >= LOCK) lock(); }
        else { acc += dt; const gi = grav(); while (acc >= gi && cur) { acc -= gi; if (!fall()) { acc = 0; break; } } }
      }

      function mini(type, cx, cy, cs, a = 1) {
        const cells = TP[type][0];
        let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
        for (const [x, y] of cells) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        const ox = cx - (x1 - x0 + 1) * cs / 2, oy = cy - (y1 - y0 + 1) * cs / 2;
        ctx.globalAlpha = a;
        for (const [x, y] of cells) ctx.drawImage(spr[type], ox + (x - x0) * cs, oy + (y - y0) * cs, cs, cs);
        ctx.globalAlpha = 1;
      }
      function pill(text, x, y, bgc, fg) {
        ctx.font = font(12, 900); const w = ctx.measureText(text).width + 18;
        ctx.fillStyle = bgc; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 11, w, 22, 11); ctx.fill();
        ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1); ctx.textBaseline = 'alphabetic';
      }
      function draw(dt) {
        ctx.save(); fx.shake(ctx, dt);
        ctx.drawImage(bg, 0, 0, W, H);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.font = font(score > 999999 ? 17 : 22, 900); ctx.fillText(fmtN(score), 68, 188);
        ctx.font = font(24, 900); ctx.fillText(st.level, 68, 254); ctx.fillText(lines, 68, 320);
        if (st.b2b) pill('B2B', 68, 372, '#ffd23f', '#3a2470');
        if (st.combo > 0) pill('COMBO ' + st.combo, 68, 404, '#ff7ac8', '#fff');
        if (hold) mini(hold, 68, 76, 22, holdUsed ? .35 : 1);
        if (queue.length >= 5) { mini(queue[0], 492, 74, 22); for (let i = 1; i < 5; i++) mini(queue[i], 492, 96 + i * 54, 16, .9); }

        ctx.save(); ctx.beginPath(); ctx.rect(WX, 0, WW, WY + WH); ctx.clip();
        const dk = dropT > 0 ? 1 - Math.pow(1 - dropT / DROP_T, 2) : 0;
        const greyFrom = state === 'over' ? T_ROWS - overT * 34 : 99;
        for (let y = 0; y < T_ROWS; y++) {
          const row = board[y];
          if (state === 'clear' && clearRows.includes(y)) continue;
          const py = WY + (y - T_HID) * CS - (dk && drop ? drop[y] * CS * dk : 0);
          for (let x = 0; x < T_COLS; x++) if (row[x]) ctx.drawImage(y >= greyFrom ? grey : spr[row[x]], WX + x * CS, py, CS, CS);
        }
        if (state === 'clear') {
          const k = clearT / CLEAR_T, s = CS * (1 - .7 * easeOut(k));
          for (const y of clearRows) {
            const py = WY + (y - T_HID) * CS;
            ctx.globalAlpha = 1 - k * .8;
            for (let x = 0; x < T_COLS; x++) if (board[y][x]) ctx.drawImage(spr[board[y][x]], WX + x * CS + (CS - s) / 2, py + (CS - s) / 2, s, s);
            ctx.globalAlpha = .75 * (1 - k); ctx.fillStyle = '#fff'; ctx.fillRect(WX, py + 2, WW, CS - 4);
          }
          ctx.globalAlpha = 1;
        }
        for (const t of trails) {
          const k = t.t / .28, g = ctx.createLinearGradient(0, t.y0, 0, t.y1 + CS);
          g.addColorStop(0, rgba(t.c, 0)); g.addColorStop(1, rgba(t.c, .55 * (1 - k)));
          ctx.fillStyle = g; ctx.fillRect(t.x + 3, t.y0, CS - 6, t.y1 - t.y0 + CS);
        }
        if (cur && state === 'play') {
          const gy = ghostY(), col = T_COL[cur.type], cells = TP[cur.type][cur.rot];
          ctx.lineWidth = 2; ctx.strokeStyle = rgba(col, .75); ctx.fillStyle = rgba(col, .16);
          for (const [cx, cy] of cells) { ctx.beginPath(); ctx.roundRect(WX + (cur.x + cx) * CS + 2, WY + (gy + cy - T_HID) * CS + 2, CS - 4, CS - 4, 6); ctx.fill(); ctx.stroke(); }
          const lk = grounded() ? lockT / LOCK : 0;
          for (const [cx, cy] of cells) {
            const x = WX + (cur.x + cx) * CS, y = WY + (cur.y + cy - T_HID) * CS;
            ctx.drawImage(spr[cur.type], x, y, CS, CS);
            if (lk) { ctx.fillStyle = `rgba(255,255,255,${.3 * lk})`; ctx.beginPath(); ctx.roundRect(x + 1, y + 1, CS - 2, CS - 2, 6); ctx.fill(); }
          }
        }
        for (const f of flash) { ctx.fillStyle = `rgba(255,255,255,${.8 * (1 - f.t / .18)})`; ctx.beginPath(); ctx.roundRect(WX + f.x * CS + 1, WY + (f.y - T_HID) * CS + 1, CS - 2, CS - 2, 6); ctx.fill(); }
        ctx.restore();
        fx.draw(ctx);
        ctx.restore();
      }
      function intro() {
        api.overlay({
          kicker: 'Puzzle', title: 'Tetris',
          text: 'Move and rotate the falling blocks to fill rows. Full rows vanish; four at once is a Tetra. It speeds up every 10 lines.',
          button: 'Play', onAction: () => start(1),
          secondary: 'Start at level 5', onSecondary: () => start(5)
        });
      }
      api.loop(dt => { update(dt); draw(dt); });
      intro();
    }
  });

  const B_COL = ['#ff4d6d', '#ff9f2e', '#ffd23f', '#2fcf78', '#3d96ff', '#b25cff'];
  const BR = 20, BD = 40, BRH = BR * Math.sqrt(3), BNC = 12, BMAXR = 16, BOMB = 6, RAIN = 7;
  const bLen = r => r & 1 ? BNC - 1 : BNC;
  const bOff = r => r & 1 ? BR : 0;
  function bNbrs(r, c) {
    const cand = r & 1
      ? [[r, c - 1], [r, c + 1], [r - 1, c], [r - 1, c + 1], [r + 1, c], [r + 1, c + 1]]
      : [[r, c - 1], [r, c + 1], [r - 1, c - 1], [r - 1, c], [r + 1, c - 1], [r + 1, c]];
    return cand.filter(([a, b]) => a >= 0 && a < BMAXR && b >= 0 && b < bLen(a));
  }
  function bCluster(grid, r, c, t) {
    const seen = new Set([r * 16 + c]), out = [[r, c]], st = [[r, c]];
    while (st.length) {
      const [a, b] = st.pop();
      for (const [p, q] of bNbrs(a, b)) if (grid[p][q] === t && !seen.has(p * 16 + q)) { seen.add(p * 16 + q); out.push([p, q]); st.push([p, q]); }
    }
    return out;
  }
  function bFloating(grid) {
    const seen = new Set(), st = [];
    for (let c = 0; c < bLen(0); c++) if (grid[0][c] >= 0) { seen.add(c); st.push([0, c]); }
    while (st.length) {
      const [a, b] = st.pop();
      for (const [p, q] of bNbrs(a, b)) if (grid[p][q] >= 0 && !seen.has(p * 16 + q)) { seen.add(p * 16 + q); st.push([p, q]); }
    }
    const out = [];
    for (let r = 0; r < BMAXR; r++) for (let c = 0; c < bLen(r); c++) if (grid[r][c] >= 0 && !seen.has(r * 16 + c)) out.push([r, c]);
    return out;
  }
  function drawBubble(x, s, col) {
    const c = s / 2, r = BR;
    x.save(); x.shadowColor = 'rgba(40,20,90,.3)'; x.shadowBlur = 4; x.shadowOffsetY = 2;
    const g = x.createRadialGradient(c - r * .35, c - r * .4, r * .1, c, c, r);
    g.addColorStop(0, tint(col, .55)); g.addColorStop(.5, col); g.addColorStop(1, tint(col, -.38));
    x.fillStyle = g; x.beginPath(); x.arc(c, c, r, 0, TAU); x.fill(); x.restore();
    x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = r * .09; x.lineCap = 'round';
    x.beginPath(); x.arc(c, c, r * .78, .2 * Math.PI, .7 * Math.PI); x.stroke();
    const gg = x.createLinearGradient(0, c - r * .85, 0, c - r * .05);
    gg.addColorStop(0, 'rgba(255,255,255,.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gg; x.beginPath(); x.ellipse(c - r * .18, c - r * .44, r * .56, r * .34, -.4, 0, TAU); x.fill();
    sparkle(x, c - r * .46, c - r * .5, r * .17);
  }
  function drawBombBubble(x, s) {
    const c = s / 2, r = BR;
    drawBubble(x, s, '#3b3556');
    x.strokeStyle = '#c9a26b'; x.lineWidth = 3; x.lineCap = 'round';
    x.beginPath(); x.moveTo(c + r * .35, c - r * .7); x.quadraticCurveTo(c + r * .7, c - r * 1.15, c + r * .95, c - r * .85); x.stroke();
    x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(c + r * .95, c - r * .85, 3.6, 0, TAU); x.fill();
    x.fillStyle = '#ff7a2e'; x.beginPath(); x.arc(c + r * .95, c - r * .85, 2, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.6;
    x.beginPath(); x.moveTo(c - 6, c + 2); x.lineTo(c + 6, c + 2); x.moveTo(c, c - 4); x.lineTo(c, c + 8); x.stroke();
  }
  function drawRainbowBubble(x, s) {
    const c = s / 2, r = BR;
    x.save(); x.shadowColor = 'rgba(40,20,90,.3)'; x.shadowBlur = 4; x.shadowOffsetY = 2;
    let g;
    if (x.createConicGradient) { g = x.createConicGradient(0, c, c); B_COL.concat(B_COL[0]).forEach((col, i) => g.addColorStop(i / 6, col)); }
    else { g = x.createLinearGradient(c - r, c - r, c + r, c + r); B_COL.forEach((col, i) => g.addColorStop(i / 5, col)); }
    x.fillStyle = g; x.beginPath(); x.arc(c, c, r, 0, TAU); x.fill(); x.restore();
    const rg = x.createRadialGradient(c, c, 0, c, c, r);
    rg.addColorStop(0, 'rgba(255,255,255,.75)'); rg.addColorStop(.45, 'rgba(255,255,255,.1)'); rg.addColorStop(1, 'rgba(60,20,90,.35)');
    x.fillStyle = rg; x.beginPath(); x.arc(c, c, r, 0, TAU); x.fill();
    const gg = x.createLinearGradient(0, c - r * .85, 0, c - r * .05);
    gg.addColorStop(0, 'rgba(255,255,255,.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gg; x.beginPath(); x.ellipse(c - r * .18, c - r * .44, r * .56, r * .34, -.4, 0, TAU); x.fill();
    sparkle(x, c, c + 2, r * .4);
  }

  Ameplay.register({
    id: 'bubble-pop',
    title: 'Bubble Pop',
    category: 'Puzzle',
    blurb: 'Aim, bounce and pop three of a colour before the ceiling drops.',
    help: 'Aim with the mouse and click to shoot · <kbd>←</kbd> <kbd>→</kbd> aim · <kbd>↑</kbd> or <kbd>Space</kbd> shoot · <kbd>X</kbd> swap · touch: drag to aim, release to shoot, tap the next bubble to swap',
    better: 'high',
    format: v => fmtN(v),
    width: 600,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="14" r="7"/><circle cx="32" cy="14" r="7" fill="currentColor" opacity=".3"/><circle cx="46" cy="14" r="7"/><circle cx="25" cy="26" r="7"/><circle cx="39" cy="26" r="7"/><path d="M32 42l9-10" stroke-dasharray="1 5"/><circle cx="32" cy="50" r="7" fill="currentColor"/></svg>',
    mount(root, api) {
      const W = 480, H = 640, SX = 240, SY = 596, NX = 152, NY = 600, DANGER = 548, CEIL0 = 6, SPEED = 1350, HIT2 = (BD * .8) ** 2, SS = BD + 10, LO = .17;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      const dpr = canvas.width / W, fx = makeFx(), keys = api.keys;
      const spr = B_COL.map(c => sprite(SS, SS, dpr, x => drawBubble(x, SS, c)));
      spr[BOMB] = sprite(SS, SS, dpr, x => drawBombBubble(x, SS));
      spr[RAIN] = sprite(SS, SS, dpr, x => drawRainbowBubble(x, SS));
      const greyS = sprite(SS, SS, dpr, x => drawBubble(x, SS, '#9c99b4'));
      const bg = sprite(W, H, dpr, x => {
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#c4ecff'); g.addColorStop(.55, '#e2d9ff'); g.addColorStop(1, '#ffd6ea');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        blobs(x, W, H, [[80, 200, 160, '#ffffff', .55], [420, 380, 190, '#ffffff', .45], [240, 520, 200, '#ffb3dc', .35]]);
        x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.roundRect(8, 558, W - 16, 76, 24); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 2; x.stroke();
        const lg = x.createRadialGradient(SX - 8, SY - 10, 4, SX, SY, 34);
        lg.addColorStop(0, '#ffffff'); lg.addColorStop(1, '#cfc6ff');
        x.save(); x.shadowColor = 'rgba(80,60,170,.35)'; x.shadowBlur = 10; x.shadowOffsetY = 4;
        x.fillStyle = lg; x.beginPath(); x.arc(SX, SY, 31, 0, TAU); x.fill(); x.restore();
        x.strokeStyle = '#8f80ef'; x.lineWidth = 3; x.beginPath(); x.arc(SX, SY, 31, 0, TAU); x.stroke();
        x.font = font(10, 900); x.letterSpacing = '1.5px'; x.textAlign = 'center'; x.fillStyle = '#7a6fb0';
        x.fillText('NEXT', NX, NY + 30); x.fillText('CEILING', 392, 618); x.letterSpacing = '0px';
      });

      const grid = Array.from({ length: BMAXR }, (_, r) => new Array(bLen(r)).fill(-1));
      let state = 'ready', level = 1, score = 0, ceil = CEIL0, dceil = CEIL0, perDrop = 8, shots = 8, nColors = 3;
      let cur = 0, next = 1, aim = Math.PI / 2, shot = null, ver = 0, guide = null, gAim = -1, gVer = -1, time = 0, aimId = null, overT = 0, curBorn = 0;
      const pops = [], falls = [];
      const bx = (r, c) => BR + bOff(r) + c * BD, by = r => ceil + BR + r * BRH;

      function hit(x, y) {
        const r0 = Math.round((y - ceil - BR) / BRH);
        for (let r = Math.max(0, r0 - 1); r <= Math.min(BMAXR - 1, r0 + 1); r++) {
          const c0 = Math.round((x - BR - bOff(r)) / BD);
          for (let c = Math.max(0, c0 - 1); c <= Math.min(bLen(r) - 1, c0 + 1); c++) {
            if (grid[r][c] < 0) continue;
            const dx = bx(r, c) - x, dy = by(r) - y;
            if (dx * dx + dy * dy < HIT2) return true;
          }
        }
        return false;
      }
      function snap(x, y, loose) {
        let best = null, bd = 1e9;
        const r0 = Math.round((y - ceil - BR) / BRH);
        for (let r = Math.max(0, r0 - 1); r <= Math.min(BMAXR - 1, r0 + 1); r++) for (let c = 0; c < bLen(r); c++) {
          if (grid[r][c] >= 0) continue;
          if (!loose && r > 0 && !bNbrs(r, c).some(([a, b]) => grid[a][b] >= 0)) continue;
          const d = (bx(r, c) - x) ** 2 + (by(r) - y) ** 2;
          if (d < bd) { bd = d; best = [r, c]; }
        }
        return best;
      }
      function trace(ang) {
        let x = SX, y = SY, dx = Math.cos(ang), dy = -Math.sin(ang);
        const pts = [x, y];
        for (let i = 0; i < 2000; i++) {
          x += dx * 3; y += dy * 3;
          if (x < BR) { x = 2 * BR - x; dx = -dx; pts.push(BR, y); }
          else if (x > W - BR) { x = 2 * (W - BR) - x; dx = -dx; pts.push(W - BR, y); }
          if (y <= ceil + BR || hit(x, y)) {
            const cell = snap(x, y) || snap(x, y, true);
            if (!cell) return null;
            pts.push(x, y, bx(cell[0], cell[1]), by(cell[0]));
            let len = 0;
            for (let j = 2; j < pts.length; j += 2) len += Math.hypot(pts[j] - pts[j - 2], pts[j + 1] - pts[j - 1]);
            return { pts, cell, len };
          }
        }
        return null;
      }
      function along(p, s) {
        for (let i = 2; i < p.length; i += 2) {
          const l = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
          if (s <= l) { const k = l ? s / l : 1; return [p[i - 2] + (p[i] - p[i - 2]) * k, p[i - 1] + (p[i + 1] - p[i - 1]) * k]; }
          s -= l;
        }
        return [p[p.length - 2], p[p.length - 1]];
      }
      function present() {
        const has = new Set();
        for (let r = 0; r < BMAXR; r++) for (const v of grid[r]) if (v >= 0 && v < 6) has.add(v);
        return [...has];
      }
      function pick() {
        if (level >= 2 && Math.random() < .07) return Math.random() < .5 ? BOMB : RAIN;
        const p = present();
        return p.length ? p[Math.random() * p.length | 0] : Math.random() * nColors | 0;
      }
      function refresh() {
        const p = present();
        if (!p.length) return;
        if (cur < 6 && !p.includes(cur)) cur = p[Math.random() * p.length | 0];
        if (next < 6 && !p.includes(next)) next = p[Math.random() * p.length | 0];
      }
      const occupied = () => grid.some(row => row.some(v => v >= 0));
      function lowest() { for (let r = BMAXR - 1; r >= 0; r--) if (grid[r].some(v => v >= 0)) return by(r) + BR; return 0; }

      function setupLevel() {
        for (const row of grid) row.fill(-1);
        ceil = dceil = CEIL0; nColors = [3, 4, 4, 5, 5, 6][Math.min(level - 1, 5)];
        perDrop = shots = Math.max(5, 9 - (level >> 1));
        const rows = Math.min(4 + level, 9), pat = (level - 1) % 4;
        const keep = (r, c) => pat === 1 ? Math.abs(c - (bLen(r) - 1) / 2) <= 1.5 + (rows - r) * .85
          : pat === 2 ? r < 2 || (c + r) % 4 !== 0
            : pat === 3 ? r < 2 || c < 4 || c > bLen(r) - 5 : true;
        for (let r = 0; r < rows; r++) for (let c = 0; c < bLen(r); c++) {
          if (!keep(r, c)) continue;
          let v = Math.random() * nColors | 0;
          if (c > 0 && grid[r][c - 1] >= 0 && Math.random() < .32) v = grid[r][c - 1];
          else if (r > 0 && Math.random() < .22) { const up = bNbrs(r, c).find(([a, b]) => a === r - 1 && grid[a][b] >= 0); if (up) v = grid[up[0]][up[1]]; }
          grid[r][c] = v;
        }
        for (const [r, c] of bFloating(grid)) grid[r][c] = -1;
        ver++; shot = null; pops.length = falls.length = 0; cur = pick(); next = pick(); curBorn = 1;
      }
      function newGame() { level = 1; score = 0; api.score(0); fx.clear(); setupLevel(); state = 'play'; }

      function fire() {
        if (state !== 'play' || shot || dceil < ceil - 1) return;
        const tr = trace(aim);
        if (!tr) return;
        shot = { k: cur, pts: tr.pts, cell: tr.cell, len: tr.len, s: 0, x: SX, y: SY };
        cur = next; next = pick(); curBorn = 1; api.sfx('tap');
      }
      function swap() {
        if (state !== 'play') return;
        [cur, next] = [next, cur]; curBorn = 1; api.sfx('tick');
      }
      function land() {
        const [r, c] = shot.cell, k = shot.k;
        shot = null;
        if (grid[r][c] >= 0) return;
        grid[r][c] = k; ver++;
        const x0 = bx(r, c), y0 = by(r);
        let popped = [];
        if (k === BOMB) {
          for (let a = 0; a < BMAXR; a++) for (let b = 0; b < bLen(a); b++) if (grid[a][b] >= 0 && (bx(a, b) - x0) ** 2 + (by(a) - y0) ** 2 <= (BD * 2.1) ** 2) popped.push([a, b]);
          fx.ring(x0, y0, '#ff9f2e', 120, .5, 16); fx.ring(x0, y0, '#fff', 80, .35, 8); fx.kick(9); api.sfx('hit');
        } else if (k === RAIN) {
          const seen = new Set();
          for (const [a, b] of bNbrs(r, c)) {
            const t = grid[a][b];
            if (t < 0 || t > 5 || seen.has(t)) continue;
            seen.add(t);
            const cl = bCluster(grid, a, b, t);
            if (cl.length >= 2) popped.push(...cl);
          }
          if (popped.length) popped.push([r, c]);
          else { const s = [...seen]; grid[r][c] = s.length ? s[0] : Math.random() * nColors | 0; }
        } else {
          const cl = bCluster(grid, r, c, k);
          if (cl.length >= 3) popped = cl;
        }
        for (const [a, b] of popped) {
          pops.push({ x: bx(a, b), y: by(a), k: grid[a][b], t: -Math.hypot(bx(a, b) - x0, by(a) - y0) / 900, b: false });
          grid[a][b] = -1;
        }
        const fl = popped.length ? bFloating(grid) : [];
        let fx0 = 0, fy0 = 0;
        for (const [a, b] of fl) {
          falls.push({ x: bx(a, b), y: by(a), k: grid[a][b], vx: rand(-110, 110), vy: rand(-260, -60) });
          fx0 += bx(a, b); fy0 += by(a); grid[a][b] = -1;
        }
        if (popped.length) {
          const p = popped.length * 10 * (popped.length > 5 ? 2 : 1);
          score += p; api.sfx('pop'); fx.text(x0, y0, '+' + p, '#fff', 22, .9);
        } else api.sfx('tick');
        if (fl.length) {
          const p = fl.length * 20 * (1 + (fl.length >> 2));
          score += p; fx.text(fx0 / fl.length, fy0 / fl.length, '+' + fmtN(p), '#ffd23f', 30, 1.2);
          if (fl.length >= 8) { next = BOMB; fx.text(SX, SY - 80, 'BOMB EARNED', '#ff7a2e', 22, 1.4); api.sfx('good'); }
        }
        api.score(score);
        if (!occupied()) { levelClear(); return; }
        if (--shots <= 0) { ceil += BRH; shots = perDrop; ver++; api.sfx('hit'); fx.kick(6); }
        if (lowest() > DANGER) { gameOver(); return; }
        refresh();
      }
      function levelClear() {
        state = 'clear';
        const bonus = 500 + 250 * level;
        score += bonus; api.score(score); api.sfx('win');
        fx.text(W / 2, 250, 'BOARD CLEAR!', '#fff', 40, 1.4);
        for (let i = 0; i < 6; i++) fx.burst(rand(60, W - 60), rand(120, 360), B_COL[i], 14, 320, 5, 500, 1.1);
        api.timeout(() => api.overlay({ kicker: 'Level ' + level + ' cleared', title: 'Board clear!', text: 'Next up: more rows' + (level < 5 ? ', more colours' : '') + ' and a faster ceiling.', stats: [['Score', fmtN(score)], ['Clear bonus', '+' + fmtN(bonus)]], button: 'Next level', onAction: () => { level++; setupLevel(); state = 'play'; } }), 1100);
      }
      function gameOver() {
        state = 'over'; overT = 0; api.sfx('lose'); fx.kick(10);
        const nb = api.submit(score);
        api.timeout(() => api.overlay({ kicker: nb ? 'New best!' : 'Game over', title: 'The ceiling got you', stats: [['Score', fmtN(score)], ['Level', level], ['Best', fmtN(api.best)]], button: 'Play again', onAction: newGame }), 1100);
      }

      const setAim = p => { aim = clamp(Math.atan2(Math.max(10, SY - p.y), p.x - SX), LO, Math.PI - LO); };
      canvas.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (state !== 'play') return;
        const p = toLocal(e);
        if (Math.hypot(p.x - NX, p.y - NY) < 28) { swap(); return; }
        setAim(p);
        if (e.pointerType === 'mouse') fire();
        else { aimId = e.pointerId; try { canvas.setPointerCapture(e.pointerId); } catch (err) {   } }
      });
      canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' ? state === 'play' : e.pointerId === aimId) setAim(toLocal(e)); });
      canvas.addEventListener('pointerup', e => {
        if (e.pointerId !== aimId) return;
        aimId = null;
        if (toLocal(e).y < SY - 30) fire();
      });
      canvas.addEventListener('pointercancel', () => { aimId = null; });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
        const c = e.code;
        if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') { e.preventDefault(); if (!e.repeat) fire(); }
        else if (c === 'KeyX' || c === 'KeyC' || c === 'ArrowDown' || c === 'KeyS' || c === 'ShiftLeft' || c === 'ShiftRight') { e.preventDefault(); if (!e.repeat) swap(); }
      });

      function update(dt) {
        time += dt; fx.update(dt);
        if (curBorn > 0) curBorn = Math.max(0, curBorn - dt * 5);
        if (state === 'play') {
          const l = keys.has('ArrowLeft') || keys.has('KeyA'), r = keys.has('ArrowRight') || keys.has('KeyD');
          if (l !== r) aim = clamp(aim + (l ? 1 : -1) * 1.5 * dt, LO, Math.PI - LO);
        }
        if (dceil < ceil) dceil = Math.min(ceil, dceil + BRH * dt * 4);
        if (shot) {
          shot.s += SPEED * dt;
          if (shot.s >= shot.len) land();
          else { const [x, y] = along(shot.pts, shot.s); shot.x = x; shot.y = y; }
        }
        for (let i = pops.length - 1; i >= 0; i--) {
          const p = pops[i];
          p.t += dt;
          if (p.t >= 0 && !p.b) { p.b = true; fx.burst(p.x, p.y, p.k < 6 ? B_COL[p.k] : '#fff', 7, 260, 4.5, 500, .6); }
          if (p.t >= .18) pops.splice(i, 1);
        }
        for (let i = falls.length - 1; i >= 0; i--) {
          const f = falls[i];
          f.vy += 1500 * dt; f.x += f.vx * dt; f.y += f.vy * dt;
          if (f.x < BR || f.x > W - BR) { f.vx = -f.vx; f.x = clamp(f.x, BR, W - BR); }
          if (f.y > H + BR) falls.splice(i, 1);
        }
        if (state === 'over') overT += dt;
      }

      function drawGuide() {
        if (aim !== gAim || ver !== gVer) { guide = trace(aim); gAim = aim; gVer = ver; }
        if (!guide) return;
        const p = guide.pts, end = guide.len - BR, col = cur < 6 ? B_COL[cur] : '#6c5ce7';
        let acc = 0, d = 36 + (time * 60) % 18;
        ctx.fillStyle = col;
        for (let i = 2; i < p.length && d < end; i += 2) {
          const x0 = p[i - 2], y0 = p[i - 1], l = Math.hypot(p[i] - x0, p[i + 1] - y0);
          while (d <= acc + l && d < end) {
            const k = (d - acc) / l;
            ctx.globalAlpha = .9 - .55 * d / guide.len;
            ctx.beginPath(); ctx.arc(x0 + (p[i] - x0) * k, y0 + (p[i + 1] - y0) * k, 3.6, 0, TAU); ctx.fill();
            d += 18;
          }
          acc += l;
        }
        ctx.globalAlpha = .7; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(p[p.length - 2], p[p.length - 1], BR - 2, 0, TAU); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      function draw(dt) {
        ctx.save(); fx.shake(ctx, dt);
        ctx.drawImage(bg, 0, 0, W, H);
        const oy = dceil - ceil, low = lowest() + oy;

        const pg = ctx.createLinearGradient(0, 0, 0, dceil);
        pg.addColorStop(0, '#4a3aa6'); pg.addColorStop(1, '#6d5bd6');
        ctx.fillStyle = pg; ctx.fillRect(0, 0, W, dceil);
        ctx.fillStyle = '#9d8cff'; ctx.fillRect(0, dceil - 4, W, 4);
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        for (let x = 20; x < W; x += 60) if (dceil > 18) { ctx.beginPath(); ctx.arc(x, dceil - 12, 3, 0, TAU); ctx.fill(); }

        const warn = state === 'play' && low > DANGER - BRH * 1.5;
        ctx.strokeStyle = warn ? `rgba(239,79,79,${.55 + .4 * Math.sin(time * 10)})` : 'rgba(239,79,79,.35)';
        ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(8, DANGER); ctx.lineTo(W - 8, DANGER); ctx.stroke(); ctx.setLineDash([]);

        let rmax = 0;
        for (let r = 0; r < BMAXR; r++) if (grid[r].some(v => v >= 0)) rmax = r;
        for (let r = 0; r < BMAXR; r++) {
          const y = by(r) + oy, gr = state === 'over' && rmax - r < overT * 14;
          for (let c = 0; c < bLen(r); c++) { const v = grid[r][c]; if (v >= 0) ctx.drawImage(gr ? greyS : spr[v], bx(r, c) - SS / 2, y - SS / 2, SS, SS); }
        }
        for (const p of pops) {
          if (p.t < 0) { ctx.drawImage(spr[p.k], p.x - SS / 2, p.y - SS / 2 + oy, SS, SS); continue; }
          const k = p.t / .18, s = SS * (1 + .45 * k);
          ctx.globalAlpha = 1 - k; ctx.drawImage(spr[p.k], p.x - s / 2, p.y - s / 2 + oy, s, s); ctx.globalAlpha = 1;
        }
        if (state === 'play' && !shot) drawGuide();
        for (const f of falls) ctx.drawImage(spr[f.k], f.x - SS / 2, f.y - SS / 2 + oy, SS, SS);
        if (shot) ctx.drawImage(spr[shot.k], shot.x - SS / 2, shot.y - SS / 2, SS, SS);

        ctx.save(); ctx.translate(SX, SY); ctx.rotate(-aim);
        ctx.fillStyle = '#6c5ce7'; ctx.beginPath(); ctx.moveTo(56, 0); ctx.lineTo(38, -10); ctx.lineTo(38, 10); ctx.closePath(); ctx.fill();
        ctx.restore();
        const cs = SS * (curBorn ? easeBack(1 - curBorn) : 1);
        if (cs > 0) ctx.drawImage(spr[cur], SX - cs / 2, SY - cs / 2, cs, cs);
        const ns = SS * .8;
        ctx.drawImage(spr[next], NX - ns / 2, NY - ns / 2, ns, ns);

        ctx.textAlign = 'center'; ctx.fillStyle = '#4b3a9e'; ctx.font = font(20, 900); ctx.fillText('LEVEL ' + level, 392, 594);
        for (let i = 0; i < perDrop; i++) {
          const x = 392 + (i - (perDrop - 1) / 2) * 12;
          ctx.fillStyle = i < shots ? (shots <= 2 ? '#ef4f4f' : '#7d6cf0') : 'rgba(110,100,170,.25)';
          ctx.beginPath(); ctx.arc(x, 604, 4, 0, TAU); ctx.fill();
        }
        fx.draw(ctx);
        ctx.restore();
      }
      api.loop(dt => { update(dt); draw(dt); });
      setupLevel();
      api.overlay({ kicker: 'Puzzle', title: 'Bubble Shooter', text: 'Shoot bubbles to make groups of three or more of one colour. Cut off whole clusters for big points. Each shot counts down until the ceiling drops - clear the board before it reaches the red line.', button: 'Play', onAction: newGame });
    }
  });

  const GN = 8;
  const GEM_COL = ['#ff3d5a', '#ff9a1f', '#ffd23a', '#2fd17a', '#3d8bff', '#b154ff'];
  const poly = (n, r, a0) => Array.from({ length: n }, (_, i) => [Math.cos(a0 + i * TAU / n) * r, Math.sin(a0 + i * TAU / n) * r]);
  const GEM_POLY = [
    [[-.68, -.86], [.68, -.86], [.86, -.68], [.86, .68], [.68, .86], [-.68, .86], [-.86, .68], [-.86, -.68]],
    poly(6, .96, -Math.PI / 2),
    [[0, -1], [.8, 0], [0, 1], [-.8, 0]],
    [[-.42, -.96], [.42, -.96], [.72, -.66], [.72, .66], [.42, .96], [-.42, .96], [-.72, .66], [-.72, -.66]],
    poly(12, .9, 0),
    [[0, -.95], [.96, .76], [-.96, .76]]
  ];
  const gemMk = (t, s = '') => ({ t, s, x: 0, y: 0, vy: 0, tw: 0, td: 1, fx: 0, fy: 0, die: -1, born: 0, sq: 0 });
  const gcol = m => m && m.s !== 'c' ? m.t : -1;
  function gemGroups(g) {
    const runs = [];
    for (let r = 0; r < GN; r++) for (let c = 0; c < GN;) {
      const t = gcol(g[r][c]); let e = c + 1;
      if (t >= 0) while (e < GN && gcol(g[r][e]) === t) e++;
      if (t >= 0 && e - c >= 3) { const cells = []; for (let k = c; k < e; k++) cells.push(r * GN + k); runs.push({ d: 'h', t, cells }); }
      c = e;
    }
    for (let c = 0; c < GN; c++) for (let r = 0; r < GN;) {
      const t = gcol(g[r][c]); let e = r + 1;
      if (t >= 0) while (e < GN && gcol(g[e][c]) === t) e++;
      if (t >= 0 && e - r >= 3) { const cells = []; for (let k = r; k < e; k++) cells.push(k * GN + c); runs.push({ d: 'v', t, cells }); }
      r = e;
    }
    const groups = [];
    for (const run of runs) {
      const hit = groups.filter(G => run.cells.some(k => G.set.has(k)));
      let G = hit[0];
      if (!G) { G = { t: run.t, set: new Set(), runs: [] }; groups.push(G); }
      for (const H of hit.slice(1)) { H.set.forEach(k => G.set.add(k)); G.runs.push(...H.runs); groups.splice(groups.indexOf(H), 1); }
      run.cells.forEach(k => G.set.add(k)); G.runs.push(run);
    }
    for (const G of groups) {
      const max = Math.max(...G.runs.map(r => r.cells.length)), hs = G.runs.filter(r => r.d === 'h'), vs = G.runs.filter(r => r.d === 'v');
      G.at = null;
      if (hs.length && vs.length) for (const h of hs) for (const k of h.cells) if (vs.some(v => v.cells.includes(k))) G.at = k;
      G.sp = max >= 5 ? 'c' : G.at != null ? 'b' : max === 4 ? G.runs.find(r => r.cells.length === 4).d : '';
    }
    return groups;
  }
  function gemSpot(G, prefer) {
    if (prefer) for (const k of prefer) if (G.set.has(k)) return k;
    if (G.at != null) return G.at;
    const run = G.runs.reduce((a, b) => b.cells.length > a.cells.length ? b : a);
    return run.cells[run.cells.length >> 1];
  }
  function gemCommon(g) {
    const n = Array(6).fill(0);
    for (const row of g) for (const m of row) if (gcol(m) >= 0) n[m.t]++;
    return n.indexOf(Math.max(...n));
  }
  function gemExpand(g, set, done = new Set()) {
    const acts = [], queue = [...set];
    while (queue.length) {
      const k = queue.pop(), r = k / GN | 0, c = k % GN, m = g[r][c];
      if (!m || !m.s || done.has(k)) continue;
      done.add(k);
      const add = [];
      if (m.s === 'h') for (let i = 0; i < GN; i++) add.push(r * GN + i);
      else if (m.s === 'v') for (let i = 0; i < GN; i++) add.push(i * GN + c);
      else if (m.s === 'b') { for (let a = r - 1; a <= r + 1; a++) for (let b = c - 1; b <= c + 1; b++) if (a >= 0 && a < GN && b >= 0 && b < GN) add.push(a * GN + b); }
      else { const t = gemCommon(g); for (let a = 0; a < GN; a++) for (let b = 0; b < GN; b++) if (gcol(g[a][b]) === t) add.push(a * GN + b); }
      acts.push({ k, s: m.s, t: m.t, cells: add });
      for (const a of add) if (!set.has(a)) { set.add(a); queue.push(a); }
    }
    return acts;
  }
  function gemCombo(g, a, b, rng = Math.random) {
    const A = g[a.r][a.c], B = g[b.r][b.c], ka = a.r * GN + a.c, kb = b.r * GN + b.c, set = new Set([ka, kb]), done = new Set([ka, kb]);
    const add = (r, c) => { if (r >= 0 && r < GN && c >= 0 && c < GN) set.add(r * GN + c); };
    if (A.s === 'c' && B.s === 'c') { for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) add(r, c); }
    else if (A.s === 'c' || B.s === 'c') {
      const o = A.s === 'c' ? B : A, ko = o === A ? ka : kb;
      for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) {
        const m = g[r][c];
        if (!m || m.s === 'c' || m.t !== o.t) continue;
        if (o.s && m !== o) m.s = o.s === 'b' ? 'b' : rng() < .5 ? 'h' : 'v';
        add(r, c);
      }
      if (o.s) done.delete(ko);
    } else {
      const s1 = A.s, s2 = B.s, { r, c } = a;
      if (s1 === 'b' && s2 === 'b') { for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) add(r + i, c + j); }
      else if (s1 === 'b' || s2 === 'b') { for (let d = -1; d <= 1; d++) for (let i = 0; i < GN; i++) { add(r + d, i); add(i, c + d); } }
      else for (let i = 0; i < GN; i++) { add(r, i); add(i, c); }
    }
    return { set, done };
  }
  function gemClear(g, set, creates) {
    for (const k of set) g[k / GN | 0][k % GN] = null;
    for (const cr of creates) { const m = gemMk(cr.t, cr.s); m.x = cr.k % GN; m.y = cr.k / GN | 0; m.born = 1; g[m.y][m.x] = m; }
  }
  function gemCollapse(g, nc, rng = Math.random) {
    for (let c = 0; c < GN; c++) {
      let w = GN - 1;
      for (let r = GN - 1; r >= 0; r--) if (g[r][c]) { if (w !== r) { g[w][c] = g[r][c]; g[r][c] = null; } w--; }
      const n = w + 1;
      for (let r = w; r >= 0; r--) { const m = gemMk(rng() * nc | 0); m.x = c; m.y = r - n - .2; g[r][c] = m; }
    }
  }
  function gemLineAt(g, r, c) {
    const t = gcol(g[r][c]);
    if (t < 0) return false;
    let n = 1;
    for (let i = c - 1; i >= 0 && gcol(g[r][i]) === t; i--) n++;
    for (let i = c + 1; i < GN && gcol(g[r][i]) === t; i++) n++;
    if (n >= 3) return true;
    n = 1;
    for (let i = r - 1; i >= 0 && gcol(g[i][c]) === t; i--) n++;
    for (let i = r + 1; i < GN && gcol(g[i][c]) === t; i++) n++;
    return n >= 3;
  }
  function gemFindMove(g) {
    for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const r2 = r + dr, c2 = c + dc;
      if (r2 >= GN || c2 >= GN) continue;
      const a = g[r][c], b = g[r2][c2];
      if (!a || !b) continue;
      if (a.s === 'c' || b.s === 'c' || (a.s && b.s)) return [r, c, r2, c2];
      g[r][c] = b; g[r2][c2] = a;
      const ok = gemLineAt(g, r, c) || gemLineAt(g, r2, c2);
      g[r][c] = a; g[r2][c2] = b;
      if (ok) return [r, c, r2, c2];
    }
    return null;
  }
  function gemNewBoard(nc, rng = Math.random) {
    let g;
    for (let tries = 0; tries < 200; tries++) {
      g = Array.from({ length: GN }, () => Array(GN).fill(null));
      for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) {
        let t;
        do t = rng() * nc | 0;
        while ((c >= 2 && g[r][c - 1].t === t && g[r][c - 2].t === t) || (r >= 2 && g[r - 1][c].t === t && g[r - 2][c].t === t));
        g[r][c] = gemMk(t); g[r][c].x = c; g[r][c].y = r;
      }
      if (gemFindMove(g)) break;
    }
    return g;
  }
  function gemShuffle(g, rng = Math.random) {
    const all = [];
    for (const row of g) for (const m of row) all.push(m);
    for (let tries = 0; tries < 300; tries++) {
      for (let i = all.length - 1; i > 0; i--) { const j = rng() * (i + 1) | 0; [all[i], all[j]] = [all[j], all[i]]; }
      for (let i = 0; i < all.length; i++) g[i / GN | 0][i % GN] = all[i];
      if (!gemGroups(g).length && gemFindMove(g)) return true;
    }
    return false;
  }
  const gemLevel = L => ({ moves: L < 8 ? 20 : 18, target: L < 3 ? 500 + 1000 * L : 2800 + 400 * (L - 3), nc: L < 3 ? 5 : 6 });
  const GEM_PTS = 20, SPECIAL_PTS = { h: 60, v: 60, b: 100, c: 200 };

  function drawGem(x, s, t, k = 1) {
    const col = GEM_COL[t], P = GEM_POLY[t], cx = s / 2, cy = s / 2, rad = s * .4 * k, ik = .52, ioy = -rad * .06;
    const pt = (p, f = 1, oy = 0) => [cx + p[0] * rad * f, cy + p[1] * rad * f + oy];
    const path = (f, oy) => { x.beginPath(); P.forEach((p, i) => { const [a, b] = pt(p, f, oy); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.closePath(); };
    x.save(); x.shadowColor = 'rgba(30,10,60,.45)'; x.shadowBlur = s * .08; x.shadowOffsetY = s * .05;
    path(1, 0); x.fillStyle = tint(col, -.3); x.fill(); x.restore();
    for (let i = 0; i < P.length; i++) {
      const [ax, ay] = pt(P[i]), [bx, by] = pt(P[(i + 1) % P.length]), [qx, qy] = pt(P[(i + 1) % P.length], ik, ioy), [px, py] = pt(P[i], ik, ioy);
      let nx = by - ay, ny = ax - bx;
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      if (nx * ((ax + bx) / 2 - cx) + ny * ((ay + by) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
      const light = -.55 * nx - .83 * ny;
      x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.lineTo(qx, qy); x.lineTo(px, py); x.closePath();
      x.fillStyle = tint(col, light > 0 ? light * .55 : light * .5); x.fill();
    }
    path(ik, ioy);
    const g = x.createLinearGradient(0, cy - rad * ik, 0, cy + rad * ik);
    g.addColorStop(0, tint(col, .5)); g.addColorStop(1, tint(col, .06));
    x.fillStyle = g; x.fill();
    x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 1; x.stroke();
    x.beginPath(); for (const p of P) { const [a, b] = pt(p), [c2, d] = pt(p, ik, ioy); x.moveTo(a, b); x.lineTo(c2, d); } x.stroke();
    path(1, 0); x.strokeStyle = tint(col, -.5); x.lineWidth = s * .025; x.lineJoin = 'round'; x.stroke();
    x.save(); path(1, 0); x.clip();
    const gg = x.createLinearGradient(0, cy - rad, 0, cy);
    gg.addColorStop(0, 'rgba(255,255,255,.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gg; x.beginPath(); x.ellipse(cx - rad * .2, cy - rad * .5, rad * .75, rad * .38, -.35, 0, TAU); x.fill(); x.restore();
    sparkle(x, cx - rad * .42, cy - rad * .4, s * .075);
  }
  function drawGemSpecial(x, s, t, sp) {
    if (sp === 'b') {
      const c = s / 2, rg = x.createRadialGradient(c, c, s * .2, c, c, s * .5);
      rg.addColorStop(0, rgba('#ffffff', .9)); rg.addColorStop(.55, rgba(GEM_COL[t], .55)); rg.addColorStop(1, rgba(GEM_COL[t], 0));
      x.fillStyle = rg; x.fillRect(0, 0, s, s);
      drawGem(x, s, t, .84);
      x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = s * .05; x.setLineDash([s * .09, s * .06]);
      x.beginPath(); x.arc(c, c, s * .43, 0, TAU); x.stroke(); x.setLineDash([]);
      return;
    }
    drawGem(x, s, t);
    const P = GEM_POLY[t], rad = s * .4;
    x.save(); x.beginPath(); P.forEach((p, i) => { const a = s / 2 + p[0] * rad, b = s / 2 + p[1] * rad; i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.closePath(); x.clip();
    x.fillStyle = 'rgba(255,255,255,.72)';
    for (let i = -1; i <= 1; i++) {
      const o = s / 2 + i * s * .16 - s * .035;
      if (sp === 'h') x.fillRect(0, o, s, s * .07); else x.fillRect(o, 0, s * .07, s);
    }
    x.restore();
    x.fillStyle = '#fff';
    const arrow = (ax, ay, dx, dy) => { x.beginPath(); x.moveTo(ax + dx * 6, ay + dy * 6); x.lineTo(ax - dy * 5, ay + dx * 5); x.lineTo(ax + dy * 5, ay - dx * 5); x.closePath(); x.fill(); };
    if (sp === 'h') { arrow(s * .06, s / 2, -1, 0); arrow(s * .94, s / 2, 1, 0); } else { arrow(s / 2, s * .06, 0, -1); arrow(s / 2, s * .94, 0, 1); }
  }
  function drawColorBomb(x, s) {
    const c = s / 2, r = s * .38;
    x.save(); x.shadowColor = 'rgba(30,10,60,.5)'; x.shadowBlur = s * .08; x.shadowOffsetY = s * .05;
    const g = x.createRadialGradient(c - r * .3, c - r * .35, r * .1, c, c, r);
    g.addColorStop(0, '#9a6a48'); g.addColorStop(.6, '#4f2c18'); g.addColorStop(1, '#2a140a');
    x.fillStyle = g; x.beginPath(); x.arc(c, c, r, 0, TAU); x.fill(); x.restore();
    for (let i = 0; i < 20; i++) {
      const a = i * 2.39996, d = r * (.15 + .7 * ((i * 7) % 20) / 20);
      x.save(); x.translate(c + Math.cos(a) * d, c + Math.sin(a) * d); x.rotate(a * 1.7);
      x.fillStyle = GEM_COL[i % 6]; x.beginPath(); x.roundRect(-s * .04, -s * .014, s * .08, s * .028, s * .014); x.fill(); x.restore();
    }
    const gg = x.createLinearGradient(0, c - r, 0, c);
    gg.addColorStop(0, 'rgba(255,255,255,.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gg; x.beginPath(); x.ellipse(c - r * .15, c - r * .5, r * .65, r * .32, -.3, 0, TAU); x.fill();
    sparkle(x, c - r * .45, c - r * .45, s * .08);
  }

  const CHAIN_WORDS = ['', '', 'Nice!', 'Great!', 'Super!', 'Amazing!', 'Incredible!'];
  Ameplay.register({
    id: 'gem-swap',
    title: 'Gem Swap',
    category: 'Puzzle',
    blurb: 'Swap gems to match three, build specials and beat each goal.',
    help: 'Drag a gem or click two neighbours to swap · <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> move the cursor · <kbd>Space</kbd> pick a gem, then an arrow to swap',
    better: 'high',
    format: v => fmtN(v),
    width: 640,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10h24l12 15-24 30L8 25z"/><path d="M8 25h48M24 10l-5 15 13 30 13-30-5-15" opacity=".45"/></svg>',
    mount(root, api) {
      const W = 560, H = 640, CS = 64, BX = 24, BY = 108, BW = CS * GN, POP_T = .22;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      const dpr = canvas.width / W, fx = makeFx();
      const spr = GEM_COL.map((_, t) => ({ '': sprite(CS, CS, dpr, x => drawGem(x, CS, t)), h: sprite(CS, CS, dpr, x => drawGemSpecial(x, CS, t, 'h')), v: sprite(CS, CS, dpr, x => drawGemSpecial(x, CS, t, 'v')), b: sprite(CS, CS, dpr, x => drawGemSpecial(x, CS, t, 'b')) }));
      const cbS = sprite(CS, CS, dpr, x => drawColorBomb(x, CS));
      const bg = sprite(W, H, dpr, x => {
        const g = x.createLinearGradient(0, 0, W * .5, H);
        g.addColorStop(0, '#ff7eb3'); g.addColorStop(.5, '#9b5cff'); g.addColorStop(1, '#4433c4');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        blobs(x, W, H, [[90, 90, 220, '#ffffff', .22], [500, 560, 260, '#62d6ff', .25], [480, 160, 160, '#ffd23a', .18]]);
        x.fillStyle = 'rgba(255,255,255,.16)'; x.beginPath(); x.roundRect(BX, 8, BW, 84, 20); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 1.5; x.stroke();
        x.save(); x.shadowColor = 'rgba(30,10,80,.45)'; x.shadowBlur = 24; x.shadowOffsetY = 8;
        x.fillStyle = 'rgba(40,16,90,.55)'; x.beginPath(); x.roundRect(BX - 8, BY - 8, BW + 16, BW + 16, 22); x.fill(); x.restore();
        for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) {
          x.fillStyle = (r + c) & 1 ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.13)';
          x.beginPath(); x.roundRect(BX + c * CS + 2, BY + r * CS + 2, CS - 4, CS - 4, 10); x.fill();
        }
        x.font = font(11, 900); x.letterSpacing = '2px'; x.fillStyle = 'rgba(255,255,255,.75)';
        x.textAlign = 'left'; x.fillText('LEVEL', 44, 34); x.textAlign = 'right'; x.fillText('GOAL', BX + BW - 20, 34); x.letterSpacing = '0px';
      });

      let B = gemNewBoard(5), state = 'ready', level = 1, total = 0, lvl = 0, cfg = gemLevel(1), moves = cfg.moves, chain = 0;
      let sel = null, cur = { r: 3, c: 3 }, kb = false, idleT = 0, hint = null, pend = null, popT = 0, popSet = null, creates = [], bar = 0, time = 0, drag = null;
      const cx = c => BX + c * CS + CS / 2, cy = r => BY + r * CS + CS / 2;
      const inb = p => p.r >= 0 && p.r < GN && p.c >= 0 && p.c < GN;

      function swapCells(p, q, dur) {
        const a = B[p.r][p.c], b = B[q.r][q.c];
        B[p.r][p.c] = b; B[q.r][q.c] = a;
        for (const m of [a, b]) { m.fx = m.x; m.fy = m.y; m.tw = m.td = dur; }
      }
      function trySwap(p, q) {
        if (state !== 'idle' || !inb(p) || !inb(q) || Math.abs(p.r - q.r) + Math.abs(p.c - q.c) !== 1 || !B[p.r][p.c] || !B[q.r][q.c]) return false;
        pend = { p, q }; swapCells(p, q, .17); state = 'swap'; hint = null; idleT = 0; sel = null; api.sfx('tick');
        return true;
      }
      function afterSwap() {
        const { p, q } = pend, A = B[q.r][q.c], Bb = B[p.r][p.c];
        pend = null;
        if (A.s === 'c' || Bb.s === 'c' || (A.s && Bb.s)) {
          moves--; chain = 1; creates = [];
          const { set, done } = gemCombo(B, q, p);
          fx.text(W / 2, BY + BW / 2, 'Combo!', '#ffe066', 44, 1.2); fx.kick(8);
          startPop(set, done, A.s === 'c' ? q : Bb.s === 'c' ? p : null);
          return;
        }
        const gr = gemGroups(B);
        if (!gr.length) { swapCells(p, q, .18); state = 'back'; api.sfx('bad'); return; }
        moves--; chain = 1; clearGroups(gr, [q.r * GN + q.c, p.r * GN + p.c]);
      }
      function clearGroups(gr, prefer) {
        const set = new Set();
        creates = [];
        for (const G of gr) { G.set.forEach(k => set.add(k)); if (G.sp) creates.push({ k: gemSpot(G, prefer), t: G.t, s: G.sp }); }
        if (creates.length) api.sfx('good');
        startPop(set, new Set(), null);
      }
      function startPop(set, done, bombAt) {
        const acts = gemExpand(B, set, done);
        if (bombAt) for (const k of set) if (k !== bombAt.r * GN + bombAt.c) fx.zap(cx(bombAt.c), cy(bombAt.r), cx(k % GN), cy(k / GN | 0), '#fff');
        for (const a of acts) {
          const r = a.k / GN | 0, c = a.k % GN, col = a.s === 'c' ? '#ffffff' : GEM_COL[a.t];
          if (a.s === 'h') fx.beam(BX, cy(r) - CS * .32, BW, CS * .64, col);
          else if (a.s === 'v') fx.beam(cx(c) - CS * .32, BY, CS * .64, BW, col);
          else if (a.s === 'b') { fx.ring(cx(c), cy(r), '#fff', CS * 2, .5, 12); fx.ring(cx(c), cy(r), col, CS * 1.4, .4, 8); fx.kick(6); }
          else { for (const k of a.cells) fx.zap(cx(c), cy(r), cx(k % GN), cy(k / GN | 0), '#fff'); fx.kick(8); }
        }
        let n = 0, sx = 0, sy = 0;
        for (const k of set) {
          const r = k / GN | 0, c = k % GN, m = B[r][c];
          if (!m) continue;
          m.die = 0; n++; sx += cx(c); sy += cy(r);
          fx.burst(cx(c), cy(r), m.s === 'c' ? '#ffffff' : GEM_COL[m.t], 5, 280, 4.5, 700, .6);
        }
        const pts = n * GEM_PTS * Math.max(1, chain) + creates.reduce((s, cr) => s + SPECIAL_PTS[cr.s], 0);
        lvl += pts; total += pts; api.score(total);
        if (n) fx.text(sx / n, sy / n, '+' + pts, '#fff', Math.min(36, 22 + chain * 3), .9);
        if (chain >= 2) fx.text(W / 2, BY + BW / 2 - 40, CHAIN_WORDS[Math.min(chain, 6)], '#ffe066', 40, 1.1);
        api.sfx(acts.length ? 'hit' : 'pop');
        popSet = set; popT = POP_T; state = 'pop';
      }
      function finishPop() {
        const dead = new Set();
        for (const k of popSet) { const m = B[k / GN | 0][k % GN]; if (m && m.die >= 0) dead.add(k); }
        gemClear(B, dead, creates);
        for (const cr of creates) fx.ring(cx(cr.k % GN), cy(cr.k / GN | 0), '#fff', CS * .9, .4, 6);
        creates = []; popSet = null;
        gemCollapse(B, cfg.nc);
        state = 'fall';
      }
      function cascade() {
        const gr = gemGroups(B);
        if (gr.length) { chain++; clearGroups(gr, null); } else endTurn();
      }
      function endTurn() {
        chain = 0;
        if (lvl >= cfg.target) return levelDone();
        if (moves <= 0) return gameOver();
        if (!gemFindMove(B)) return reshuffle();
        state = 'idle'; idleT = 0; hint = null;
      }
      function reshuffle() {
        const old = new Map();
        for (const row of B) for (const m of row) old.set(m, [m.x, m.y]);
        if (!gemShuffle(B)) B = gemNewBoard(cfg.nc);
        for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) { const m = B[r][c], o = old.get(m) || [c, r - GN]; m.fx = o[0]; m.fy = o[1]; m.tw = m.td = .5; }
        fx.text(W / 2, BY + BW / 2, 'Shuffle!', '#fff', 40, 1.2); api.sfx('tick');
        state = 'back';
      }
      function levelDone() {
        state = 'done';
        const bonus = moves * 50 * level;
        total += bonus; api.score(total); api.sfx('win');
        fx.text(W / 2, BY + BW / 2, 'Goal reached!', '#ffe066', 44, 1.4);
        for (let i = 0; i < 6; i++) fx.burst(rand(80, W - 80), rand(BY + 60, BY + BW - 60), GEM_COL[i], 14, 340, 5, 500, 1.1);
        api.timeout(() => api.overlay({ kicker: 'Level ' + level + ' complete', title: 'Sweet!', stats: [['Level score', fmtN(lvl)], ['Moves left', moves + ' × ' + 50 * level], ['Total', fmtN(total)]], button: 'Next level', onAction: () => startLevel(level + 1) }), 900);
      }
      function gameOver() {
        state = 'over'; api.sfx('lose');
        const nb = api.submit(total);
        api.timeout(() => api.overlay({ kicker: nb ? 'New best!' : 'Out of moves', title: 'Game over', text: `You needed ${fmtN(cfg.target - lvl)} more points on level ${level}.`, stats: [['Score', fmtN(total)], ['Level', level], ['Best', fmtN(api.best)]], button: 'Play again', onAction: () => { total = 0; api.score(0); startLevel(1); } }), 700);
      }
      function startLevel(L) {
        level = L; cfg = gemLevel(L); moves = cfg.moves; lvl = 0; bar = 0; chain = 0; sel = null; hint = null; creates = []; popSet = null; fx.clear();
        B = gemNewBoard(cfg.nc);
        for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) { const m = B[r][c]; m.y = r - GN - 1 - c * .35; m.vy = 0; }
        state = 'fall';
      }

      canvas.addEventListener('pointerdown', e => {
        e.preventDefault();
        kb = false;
        const p = toLocal(e), q = { r: Math.floor((p.y - BY) / CS), c: Math.floor((p.x - BX) / CS) };
        if (!inb(q)) { sel = null; return; }
        if (sel && Math.abs(sel.r - q.r) + Math.abs(sel.c - q.c) === 1) { if (!trySwap(sel, q)) sel = q; return; }
        const was = !!sel && sel.r === q.r && sel.c === q.c;
        sel = q; drag = { ...q, x: p.x, y: p.y, was, id: e.pointerId };
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {   }
        api.sfx('tap');
      });
      canvas.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const p = toLocal(e), dx = p.x - drag.x, dy = p.y - drag.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < CS * .3) return;
        const from = { r: drag.r, c: drag.c }, to = Math.abs(dx) > Math.abs(dy) ? { r: from.r, c: from.c + Math.sign(dx) } : { r: from.r + Math.sign(dy), c: from.c };
        drag = null;
        trySwap(from, to);
      });
      const endDrag = e => { if (drag && e.pointerId === drag.id) { if (drag.was) sel = null; drag = null; } };
      canvas.addEventListener('pointerup', endDrag);
      canvas.addEventListener('pointercancel', endDrag);
      const DIRS = { ArrowUp: [-1, 0], KeyW: [-1, 0], ArrowDown: [1, 0], KeyS: [1, 0], ArrowLeft: [0, -1], KeyA: [0, -1], ArrowRight: [0, 1], KeyD: [0, 1] };
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
        const d = DIRS[e.code];
        if (d) {
          e.preventDefault(); kb = true;
          if (sel) { const q = { r: sel.r + d[0], c: sel.c + d[1] }, from = sel; if (inb(q)) { cur = q; if (!trySwap(from, q)) sel = null; } }
          else cur = { r: clamp(cur.r + d[0], 0, GN - 1), c: clamp(cur.c + d[1], 0, GN - 1) };
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault(); kb = true;
          sel = sel ? null : { ...cur };
        }
      });

      function update(dt) {
        time += dt; fx.update(dt);
        bar += (Math.min(1, lvl / cfg.target) - bar) * Math.min(1, dt * 6);
        let moving = false;
        for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) {
          const m = B[r][c];
          if (!m) continue;
          if (m.tw > 0) {
            m.tw = Math.max(0, m.tw - dt);
            const k = easeOut(1 - m.tw / m.td);
            m.x = lerp(m.fx, c, k); m.y = lerp(m.fy, r, k); moving = true;
          } else if (m.y < r) {
            m.x = c; m.vy += 70 * dt; m.y += m.vy * dt;
            if (m.y >= r) { m.y = r; m.sq = Math.min(.16, m.vy * .01); m.vy = 0; }
            moving = true;
          } else { m.x = c; m.y = r; }
          if (m.sq > 0) m.sq = Math.max(0, m.sq - dt * 1.4);
          if (m.born > 0) m.born = Math.max(0, m.born - dt * 3.5);
          if (m.die >= 0) m.die += dt;
        }
        if (state === 'swap' && !moving) afterSwap();
        else if (state === 'back' && !moving) { state = 'idle'; idleT = 0; }
        else if (state === 'pop' && (popT -= dt) <= 0) finishPop();
        else if (state === 'fall' && !moving) cascade();
        else if (state === 'idle' && (idleT += dt) > 5 && !hint) hint = gemFindMove(B);
      }
      function hud() {
        ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = font(30, 900); ctx.fillText(level, 44, 70);
        ctx.textAlign = 'right'; ctx.font = font(20, 900); ctx.fillText(fmtN(lvl) + ' / ' + fmtN(cfg.target), BX + BW - 20, 68);
        const mx = W / 2, my = 44;
        const g = ctx.createLinearGradient(0, my - 28, 0, my + 28); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e6dcff');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 29, 0, TAU); ctx.fill();
        ctx.strokeStyle = moves <= 3 && state === 'idle' ? `rgba(239,79,79,${.6 + .4 * Math.sin(time * 8)})` : '#8f6cff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.textAlign = 'center'; ctx.fillStyle = '#8a7bb8'; ctx.font = font(9, 900); ctx.fillText('MOVES', mx, my - 9);
        ctx.fillStyle = moves <= 3 ? C.bad : C.ink; ctx.font = font(24, 900); ctx.fillText(moves, mx, my + 16);
        ctx.fillStyle = 'rgba(30,10,70,.3)'; ctx.beginPath(); ctx.roundRect(44, 78, BW - 40, 8, 4); ctx.fill();
        if (bar > .005) {
          const bg2 = ctx.createLinearGradient(44, 0, 44 + BW - 40, 0); bg2.addColorStop(0, '#ffe066'); bg2.addColorStop(1, '#ff6fae');
          ctx.fillStyle = bg2; ctx.beginPath(); ctx.roundRect(44, 78, Math.max(8, (BW - 40) * bar), 8, 4); ctx.fill();
        }
      }
      function draw(dt) {
        ctx.save(); fx.shake(ctx, dt);
        ctx.drawImage(bg, 0, 0, W, H);
        hud();
        ctx.save(); ctx.beginPath(); ctx.rect(BX - 12, BY - 4, BW + 24, BW + 16); ctx.clip();
        if (hint && state === 'idle') {
          ctx.globalAlpha = .3 + .25 * Math.sin(time * 6); ctx.fillStyle = '#fff';
          for (const [r, c] of [[hint[0], hint[1]], [hint[2], hint[3]]]) { ctx.beginPath(); ctx.roundRect(BX + c * CS + 3, BY + r * CS + 3, CS - 6, CS - 6, 12); ctx.fill(); }
          ctx.globalAlpha = 1;
        }
        if (sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(BX + sel.c * CS + 3, BY + sel.r * CS + 3, CS - 6, CS - 6, 12); ctx.stroke(); }
        if (kb && !sel) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.roundRect(BX + cur.c * CS + 3, BY + cur.r * CS + 3, CS - 6, CS - 6, 12); ctx.stroke(); ctx.setLineDash([]); }
        for (let r = 0; r < GN; r++) for (let c = 0; c < GN; c++) {
          const m = B[r][c];
          if (!m) continue;
          let sc = 1;
          if (m.die >= 0) { const k = Math.min(1, m.die / POP_T); sc = k < .3 ? 1 + k * .8 : 1.24 * (1 - (k - .3) / .7); }
          if (m.born > 0) sc *= easeBack(1 - m.born * .6);
          if (sel && sel.r === r && sel.c === c) sc *= 1.08 + .03 * Math.sin(time * 9);
          if (hint && state === 'idle' && ((hint[0] === r && hint[1] === c) || (hint[2] === r && hint[3] === c))) sc *= 1 + .06 * Math.sin(time * 10);
          if (m.s === 'b' || m.s === 'c') sc *= 1 + .04 * Math.sin(time * 6 + r + c);
          if (sc <= 0) continue;
          const w = CS * sc * (1 + m.sq), h = CS * sc * (1 - m.sq), x = BX + m.x * CS + CS / 2, y = BY + m.y * CS + CS / 2;
          const img = m.s === 'c' ? cbS : spr[m.t][m.s];
          ctx.drawImage(img, x - w / 2, y - h / 2 + CS * m.sq * .5, w, h);
          if (m.die >= 0) {
            ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, m.die / POP_T * 2);
            ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
          }
        }
        ctx.restore();
        fx.draw(ctx);
        ctx.restore();
      }
      api.loop(dt => { update(dt); draw(dt); });
      api.overlay({ kicker: 'Puzzle', title: 'Bejeweled', text: 'Swap neighbouring gems to line up three or more. Match 4 for a line blast, an L or T for a bomb, 5 for a colour bomb. Reach the goal before you run out of moves.', button: 'Play', onAction: () => { total = 0; api.score(0); startLevel(1); } });
    }
  });
})();

