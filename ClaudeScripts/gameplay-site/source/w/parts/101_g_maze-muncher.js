
(() => {
  'use strict';

  const CFG = {
    W: 224, H: 288, HZ: 60, TOP: 24,
    PX100: 75.75757625 / 60,
    DOT: 10, ENERGIZER: 50, GHOST_PTS: [200, 400, 800, 1600], EXTRA_LIFE: 10000, LIVES: 3,
    FRUIT_AT: [70, 170], FRUIT_MIN: 560, FRUIT_MAX: 600, FRUIT_SHOW: 120, FRUIT_PTS: [100, 300, 500, 700, 1000, 2000, 3000, 5000],
    STALL_DOT: 1, STALL_ENERGIZER: 3, FLASH_HALF: 14, EYES_SPEED: 1.6, HOUSE_SPEED: .5,
    EAT_FREEZE: 60, DIE_FREEZE: 60, DIE_ANIM: 96, DIE_WAIT: 40, CLEAR_FREEZE: 60, CLEAR_FLASH: 8, CLEAR_HALF: 12,
    INTRO: 252, READY: 120, OVER: 240,
    ELROY: [20, 30, 40, 40, 40, 50, 50, 50, 60, 60, 60, 80, 80, 80, 100, 100, 100, 100, 120],
    FRIGHT: [6, 5, 4, 3, 2, 5, 2, 2, 1, 5, 2, 1, 1, 3, 1, 1, 0, 1, 0],
    FLASHES: [5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 3, 3, 5, 3, 3, 0, 3, 0],
    FRUIT_OF: [0, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7],
    MODES: [[7, 20, 7, 20, 5, 20, 5], [7, 20, 7, 20, 5, 1033, 1 / 60], [5, 20, 5, 20, 5, 1037, 1 / 60]],
    GLOBAL_REL: [0, 7, 17, 32],
    SCATTER: [[25, -3], [2, -3], [27, 32], [0, 32]],
    NO_UP: [[12, 11], [15, 11], [12, 23], [15, 23]],
    HOUSE: { door: 112, out: 92, mid: 116, homes: [112, 112, 96, 128] },
    PAC_START: [112, 188], FRUIT_POS: [112, 140]
  };
  const SPEEDS = n => n === 1 ? { pac: .8, pacF: .9, gh: .75, ghF: .5, tun: .4, e1: .8, e2: .85 }
    : n <= 4 ? { pac: .9, pacF: .95, gh: .85, ghF: .55, tun: .45, e1: .9, e2: .95 }
      : n <= 20 ? { pac: 1, pacF: 1, gh: .95, ghF: .6, tun: .5, e1: 1, e2: 1.05 }
        : { pac: .9, pacF: .9, gh: .95, ghF: .6, tun: .5, e1: 1, e2: 1.05 };
  const LV = (tab, n) => tab[Math.min(n, tab.length) - 1];

  const MAZES = [
    { name: 'A', wall: '#2121de', half: ['##############', '#............#', '#.####.#####.#', '#o####.#####.#', '#.####.#####.#', '#.............', '#.####.##.####', '#.####.##.####', '#......##....#', '######.##### #', '######.##### #', '######.##     ', '######.## ###-', '######.## #   ', 'TTTTTT.   #   ', '######.## #   ', '######.## ####', '######.##     ', '######.## ####', '######.## ####', '#............#', '#.####.#####.#', '#.####.#####.#', '#o..##....... ', '###.##.##.####', '###.##.##.####', '#......##....#', '#.##########.#', '#.##########.#', '#.............', '##############'] }
  ];
  const mazeOf = () => 0;
  const MAZE_COLS = 28, MAZE_ROWS = 31;

  const FONT = {
    '0': 'ehjlphe', '1': '4c4444e', '2': 'eh1248v', '3': 'v2421he', '4': '26aiv22', '5': 'vgu11he', '6': '68guhhe', '7': 'v124888', '8': 'ehhehhe', '9': 'ehhf12c',
    A: 'ehhvhhh', B: 'uhhuhhu', C: 'ehggghe', D: 'uhhhhhu', E: 'vgguggv', F: 'vgguggg', G: 'ehgnhhf', H: 'hhhvhhh', I: 'e44444e', J: '72222ic', K: 'hikokih',
    L: 'ggggggv', M: 'hrllhhh', N: 'hhpljhh', O: 'ehhhhhe', P: 'uhhuggg', Q: 'ehhhlid', R: 'uhhukih', S: 'fgge11u', T: 'v444444', U: 'hhhhhhe', V: 'hhhhha4',
    W: 'hhhllrh', X: 'hha4ahh', Y: 'hha4444', Z: 'v1248gv', '!': '4444404', '-': '000v000', '"': 'aa00000', '.': '00000cc', '<': '248g842', '>': '8421248',
    '=': '00v0v00', '?': 'eh12404', '/': '11248gg', ':': '0cc0cc0', ' ': '0000000', "'": '4400000', '*': '0level0'
  };
  const B32 = '0123456789abcdefghijklmnopqrstuv';
  const glyphRow = (s, i) => B32.indexOf(s[i]);

  const DX = [0, -1, 0, 1], DY = [-1, 0, 1, 0];
  const KEYDIR = { ArrowUp: 0, KeyW: 0, ArrowLeft: 1, KeyA: 1, ArrowDown: 2, KeyS: 2, ArrowRight: 3, KeyD: 3 };

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
  function ascii(x, rows, map, ox = 0, oy = 0) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const col = map[rows[j][i]];
      if (col) { x.fillStyle = col; x.fillRect(ox + i, oy + j, 1, 1); }
    }
  }
  function crisp(c, x) {
    const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
    for (let i = 3; i < a.length; i += 4) a[i] = a[i] > 110 ? 255 : 0;
    x.putImageData(d, 0, 0);
  }

  function buildFont() {
    const cache = new Map();
    return (color, bold) => {
      const key = color + (bold ? 'b' : '');
      if (cache.has(key)) return cache.get(key);
      const chars = Object.keys(FONT), [c, x] = mk(chars.length * 8, 8), idx = {};
      x.fillStyle = color;
      chars.forEach((ch, k) => {
        idx[ch] = k;
        const s = FONT[ch];
        for (let r = 0; r < 7; r++) {
          const bits = glyphRow(s, r);
          for (let b = 0; b < 5; b++) if (bits & (16 >> b)) { x.fillRect(k * 8 + b, r, bold ? 2 : 1, 1); }
        }
      });
      const f = { c, idx };
      cache.set(key, f);
      return f;
    };
  }

  function muncherSprite(color, dir, half) {
    const [c, x] = mk(16, 16);
    x.fillStyle = color;
    const ax = DX[dir], ay = DY[dir];
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      const dx = i + .5 - 8, dy = j + .5 - 8, r2 = dx * dx + dy * dy;
      if (r2 > 6.6 * 6.6) continue;
      if (half > 0 && r2 > .3) {
        const a = Math.acos(Math.max(-1, Math.min(1, (dx * ax + dy * ay) / Math.sqrt(r2))));
        if (a < half) continue;
      }
      x.fillRect(i, j, 1, 1);
    }
    return c;
  }

  const GHOST_BODY = ['.....####.....', '...########...', '..##########..', '.############.', '.############.', '.############.', '##############', '##############', '##############', '##############', '##############', '##############'];
  const SKIRT = [['##.###..###.##', '#...##..##...#'], ['#.###.##.###.#', '...##....##...']];
  const EYE = ['.##.', '####', '####', '####', '.##.'];
  function ghostSprite(body, frame, dir, mode) {
    const [c, x] = mk(16, 16);
    const rows = GHOST_BODY.concat(SKIRT[frame]);
    if (mode !== 'eyes') ascii(x, rows, { '#': body }, 1, 1);
    if (mode === 'fright') {
      const face = body === '#2121ff' ? '#ffb8ae' : '#ff2020';
      ascii(x, ['.....##..##.....', '.....##..##.....', '', '', '', '....#..##..#....', '...#.##..##.#...'], { '#': face }, -1, 5);
      return c;
    }
    const wx = DX[dir], wy = DY[dir];
    ascii(x, EYE, { '#': '#ffffff' }, 3 + wx, 4 + wy);
    ascii(x, EYE, { '#': '#ffffff' }, 9 + wx, 4 + wy);
    const px = [1, 0, 1, 2][dir], py = [0, 2, 3, 2][dir];
    x.fillStyle = '#2121ff';
    x.fillRect(3 + wx + px, 4 + wy + py, 2, 2);
    x.fillRect(9 + wx + px, 4 + wy + py, 2, 2);
    return c;
  }

  function fruitSprite(k) {
    const [c, x] = mk(16, 16);
    const circ = (cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
    const line = (pts, col, w = 1.3) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); };
    if (k === 0) {
      line([[5, 11], [8, 6], [12, 3]], '#de9751'); line([[11, 10], [11, 6], [12, 3]], '#de9751');
      circ(5, 11.5, 3.2, '#ff0000'); circ(11, 10.5, 3.2, '#ff0000');
      x.fillStyle = '#fff'; x.fillRect(3, 10, 1, 1); x.fillRect(9, 9, 1, 1);
    } else if (k === 1) {
      x.fillStyle = '#ff0000'; x.beginPath(); x.moveTo(2, 6); x.quadraticCurveTo(8, 3, 14, 6); x.quadraticCurveTo(13, 12, 8, 15); x.quadraticCurveTo(3, 12, 2, 6); x.fill();
      x.fillStyle = '#00de00'; x.fillRect(4, 3, 8, 2); x.fillRect(7, 1, 2, 3);
      x.fillStyle = '#fff'; for (const [a, b] of [[5, 7], [9, 7], [7, 9], [11, 9], [5, 11], [9, 11], [7, 13]]) x.fillRect(a, b, 1, 1);
    } else if (k === 2) {
      circ(8, 9.5, 5.6, '#ffa020'); x.fillStyle = '#00b800'; x.fillRect(8, 2, 4, 2); x.fillStyle = '#de9751'; x.fillRect(7, 2, 1, 3);
      x.fillStyle = '#ffd890'; x.fillRect(5, 7, 1, 2);
    } else if (k === 3) {
      circ(5.5, 9.5, 4.6, '#ff2020'); circ(10.5, 9.5, 4.6, '#ff2020'); x.fillStyle = '#de9751'; x.fillRect(8, 2, 1, 4);
      x.fillStyle = '#00de00'; x.fillRect(9, 3, 3, 2); x.fillStyle = '#fff'; x.fillRect(4, 7, 1, 2);
    } else if (k === 4) {
      circ(8, 9, 6, '#20c040'); x.fillStyle = '#90ff90';
      for (const [a, b] of [[4, 6], [7, 5], [10, 7], [5, 10], [9, 10], [7, 13], [11, 11]]) x.fillRect(a, b, 1, 1);
      x.fillStyle = '#de9751'; x.fillRect(7, 1, 2, 3);
    } else if (k === 5) {
      x.fillStyle = '#ffde00'; x.fillRect(7, 2, 2, 11);
      x.fillStyle = '#2b6bff'; x.beginPath(); x.moveTo(1, 12); x.lineTo(8, 5); x.lineTo(15, 12); x.lineTo(12, 13); x.lineTo(8, 10); x.lineTo(4, 13); x.fill();
      x.fillStyle = '#ff2020'; x.fillRect(7, 1, 2, 2); x.fillRect(2, 11, 2, 2); x.fillRect(12, 11, 2, 2); x.fillRect(7, 13, 2, 2);
    } else if (k === 6) {
      x.fillStyle = '#ffde00'; x.beginPath(); x.moveTo(8, 2); x.quadraticCurveTo(13, 3, 13, 9); x.lineTo(15, 13); x.lineTo(1, 13); x.lineTo(3, 9); x.quadraticCurveTo(3, 3, 8, 2); x.fill();
      x.fillStyle = '#7fd8ff'; x.fillRect(6, 13, 4, 2); x.fillStyle = '#fff'; x.fillRect(5, 5, 1, 4);
    } else {
      x.fillStyle = '#7fd8ff'; x.fillRect(5, 1, 6, 5); x.fillStyle = '#000'; x.fillRect(7, 2, 2, 2);
      x.fillStyle = '#e8e8ff'; x.fillRect(7, 6, 2, 9); x.fillRect(9, 10, 2, 1); x.fillRect(9, 13, 2, 1);
    }
    crisp(c, x);
    return c;
  }

  function buildWalls(grid, tunnelRow, color) {
    const W = 224, H = 248, isWallTile = (c, r) => {
      if (r >= 12 && r <= 16 && c >= 10 && c <= 17) return false;
      if (r < 0 || r >= MAZE_ROWS) return true;
      if (c < 0 || c >= MAZE_COLS) return !tunnelRow[r];
      return grid[r][c] === '#';
    };
    const border = new Uint8Array(MAZE_COLS * MAZE_ROWS), q = [];
    for (let r = 0; r < MAZE_ROWS; r++) for (let c = 0; c < MAZE_COLS; c++) if ((r === 0 || r === MAZE_ROWS - 1 || c === 0 || c === MAZE_COLS - 1) && isWallTile(c, r)) { border[r * MAZE_COLS + c] = 1; q.push(r * MAZE_COLS + c); }
    while (q.length) {
      const k = q.pop(), c = k % MAZE_COLS, r = (k / MAZE_COLS) | 0;
      for (let d = 0; d < 4; d++) {
        const nc = c + DX[d], nr = r + DY[d];
        if (nc < 0 || nr < 0 || nc >= MAZE_COLS || nr >= MAZE_ROWS) continue;
        const nk = nr * MAZE_COLS + nc;
        if (!border[nk] && isWallTile(nc, nr)) { border[nk] = 1; q.push(nk); }
      }
    }
    const P = 8, PW = W + P * 2, PH = H + P * 2, dist = new Float32Array(PW * PH), bord = new Uint8Array(PW * PH);
    for (let y = 0; y < PH; y++) for (let xx = 0; xx < PW; xx++) {
      const px = xx - P + .5, py = y - P + .5, tc = Math.floor(px / 8), tr = Math.floor(py / 8), i = y * PW + xx;
      bord[i] = tc < 0 || tr < 0 || tc >= MAZE_COLS || tr >= MAZE_ROWS ? 1 : border[tr * MAZE_COLS + tc];
      if (!isWallTile(tc, tr)) continue;
      let best = 99;
      for (let r = tr - 2; r <= tr + 2; r++) for (let c = tc - 2; c <= tc + 2; c++) {
        if (isWallTile(c, r)) continue;
        const ddx = Math.max(c * 8 - px, 0, px - (c * 8 + 8)), ddy = Math.max(r * 8 - py, 0, py - (r * 8 + 8));
        const dd = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dd < best) best = dd;
      }
      dist[i] = best;
    }
    const open = (thr, rr, only) => {
      const e1 = new Uint8Array(PW * PH), e = new Uint8Array(PW * PH);
      for (let i = 0; i < PW * PH; i++) e1[i] = dist[i] >= thr + rr && (!only || bord[i]) ? 1 : 0;
      for (let y = rr; y < PH - rr; y++) for (let xx = rr; xx < PW - rr; xx++) {
        let hit = 0;
        for (let j = -rr; j <= rr && !hit; j++) for (let i = -rr; i <= rr; i++) {
          if (i * i + j * j <= rr * rr + .5 && e1[(y + j) * PW + xx + i]) { hit = 1; break; }
        }
        e[y * PW + xx] = hit;
      }
      return e;
    };
    const [c, x] = mk(W, H);
    x.fillStyle = color;
    const outline = e => {
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
        const i = (y + P) * PW + xx + P;
        if (e[i] && !(e[i - 1] & e[i + 1] & e[i - PW] & e[i + PW])) x.fillRect(xx, y, 1, 1);
      }
    };
    outline(open(4, 2, false));
    outline(open(7, 2, true));
    x.fillRect(83, 99, 21, 1); x.fillRect(120, 99, 21, 1);
    x.fillRect(86, 102, 18, 1); x.fillRect(120, 102, 18, 1);
    x.fillRect(83, 99, 1, 34); x.fillRect(140, 99, 1, 34); x.fillRect(86, 102, 1, 28); x.fillRect(137, 102, 1, 28);
    x.fillRect(83, 132, 58, 1); x.fillRect(86, 129, 52, 1);
    x.fillRect(103, 99, 1, 4); x.fillRect(120, 99, 1, 4);
    return c;
  }

  Ameplay.register({
    id: 'maze-muncher',
    title: 'Maze Muncher',
    category: 'Arcade',
    tint: '#2121de',
    better: 'high',
    width: 520,
    blurb: 'Gobble every dot, dodge four crafty ghosts, then turn the tables.',
    help: '<kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> or <kbd>WASD</kbd> steer (turns are buffered) · <kbd>P</kbd> pause · swipe or D-pad on touch',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M35 21A15 15 0 1 0 35 43L22 32z"/><circle cx="45" cy="32" r="2.5"/><circle cx="55" cy="32" r="2.5"/></svg>',
    css: `.gm-maze-muncher .mm-pad{display:none;gap:10px;justify-content:center;touch-action:none}
.gm-maze-muncher.touch .mm-pad{display:flex}
@media (pointer:coarse){.gm-maze-muncher .mm-pad{display:flex}}
.gm-maze-muncher{gap:10px}
.gm-maze-muncher .g-canvas{background:#000;image-rendering:pixelated}
.gm-maze-muncher .mm-pad button{width:60px;height:52px;padding:0;border:0;border-radius:16px;background:linear-gradient(#2c2c8a,#1a1a5e);box-shadow:0 4px 0 #0e0e3a;color:#ffd600;display:grid;place-items:center;touch-action:none;-webkit-tap-highlight-color:transparent}
.gm-maze-muncher .mm-pad button.on{transform:translateY(3px);box-shadow:0 1px 0 #0e0e3a;background:#3a3ab8}
.gm-maze-muncher .mm-pad svg{width:26px;height:26px}`,
    mount(root, api) {
      const { W, H, TOP } = CFG, STEP = 1 / CFG.HZ;
      const view = api.canvas(W * 2, H * 2);
      const canvas = view.canvas, vctx = view.ctx;
      const [low, g] = mk(W, H);
      const [mid, mctx] = mk(1, 1);
      const font = buildFont();

      const PAC_COL = '#ffd800';
      const GHOST_COL = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
      const NAMES = [['SHADOW', 'BLINKY'], ['SPEEDY', 'PINKY'], ['BASHFUL', 'INKY'], ['POKEY', 'CLYDE']];
      const SPR = { pac: [], ghost: [], fright: [[], []], eyes: [], fruit: [], death: [] };
      for (let d = 0; d < 4; d++) SPR.pac.push([0, .42, .85].map(h => muncherSprite(PAC_COL, d, h)));
      for (let k = 0; k < 4; k++) SPR.ghost.push([0, 1].map(f => [0, 1, 2, 3].map(d => ghostSprite(GHOST_COL[k], f, d, 'n'))));
      for (let f = 0; f < 2; f++) { SPR.fright[0].push(ghostSprite('#2121ff', f, 0, 'fright')); SPR.fright[1].push(ghostSprite('#dedeff', f, 0, 'fright')); }
      for (let d = 0; d < 4; d++) SPR.eyes.push(ghostSprite('', 0, d, 'eyes'));
      for (let k = 0; k < 8; k++) SPR.fruit.push(fruitSprite(k));
      for (let i = 0; i < 11; i++) SPR.death.push(muncherSprite(PAC_COL, 0, .7 + i * (Math.PI - .7) / 10.5));
      const lifeSpr = muncherSprite(PAC_COL, 1, .42);
      const wallCache = {};
      const wallsFor = (m, white) => {
        const k = m + (white ? 'w' : '');
        if (wallCache[k]) return wallCache[k];
        if (!white) return (wallCache[k] = buildWalls(MAZES[m].grid, MAZES[m].tunnelRow, MAZES[m].wall));
        const [c, x] = mk(W, H - 40); x.drawImage(wallsFor(m, false), 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#dedeff'; x.fillRect(0, 0, W, H);
        return (wallCache[k] = c);
      };
      for (const m of MAZES) {
        if (m.grid) continue;
        m.grid = m.half.map(r => (r + [...r].reverse().join('')).split(''));
        for (let r = 13; r <= 15; r++) for (let c = 11; c <= 16; c++) m.grid[r][c] = 'H';
        m.tunnelRow = m.grid.map(r => r[0] === 'T');
      }

      let ac = null, master = null, bgO = null, bgG = null;
      function audio() {
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = .32; master.connect(ac.destination);
          bgO = ac.createOscillator(); bgG = ac.createGain(); bgG.gain.value = 0;
          bgO.type = 'triangle'; bgO.frequency.value = 400; bgO.connect(bgG); bgG.connect(master); bgO.start();
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function tone(t, dur, type, f0, f1, vol, f2) {
        const o = ac.createOscillator(), gn = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f2) { o.frequency.linearRampToValueAtTime(f1, t + dur / 2); o.frequency.linearRampToValueAtTime(f2, t + dur); }
        else if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        gn.gain.setValueAtTime(vol, t); gn.gain.setValueAtTime(vol, t + dur * .85); gn.gain.linearRampToValueAtTime(.0001, t + dur);
        o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + .02);
      }
      let wakkaFlip = 0;
      function sfx(name) {
        if (api.muted || !ac) return;
        const t = ac.currentTime + .005;
        if (name === 'wakka') { wakkaFlip ^= 1; if (wakkaFlip) tone(t, .09, 'triangle', 520, 190, .5); else tone(t, .09, 'triangle', 190, 520, .5); }
        else if (name === 'ghost') tone(t, .5, 'square', 110, 1800, .09);
        else if (name === 'fruit') { tone(t, .08, 'triangle', 300, 1200, .5); tone(t + .09, .12, 'triangle', 1200, 380, .5); }
        else if (name === 'life') { for (let i = 0; i < 10; i++) tone(t + i * .14, .07, 'square', 1046, 1046, .06); }
        else if (name === 'death') {
          for (let i = 0; i < 9; i++) { const f = 900 - i * 70; tone(t + i * .15, .15, 'triangle', f, f * .55, .45, f * 1.15); }
          tone(t + 1.42, .12, 'square', 900, 120, .08); tone(t + 1.6, .12, 'square', 900, 120, .08);
        } else if (name === 'intro') {
          const N = (m) => 440 * Math.pow(2, (m - 69) / 12), q = .13;
          const lead = [72, 79, 76, 79, 84, 79, 76, 72, 74, 81, 77, 81, 86, 81, 77, 74, 76, 83, 79, 83, 88, 83, 79, 76, 77, 81, 84, 86, 88, 0, 84, 0];
          const bass = [48, 55, 48, 55, 50, 57, 50, 57, 52, 59, 52, 59, 53, 55, 53, 48];
          lead.forEach((m, i) => { if (m) tone(t + i * q, q * .85, 'square', N(m), N(m), .07); });
          bass.forEach((m, i) => tone(t + i * q * 2, q * 1.8, 'triangle', N(m), N(m), .4));
        }
      }
      let bgMode = 'off', bgT = 0;
      function updateBg() {
        if (!ac || !bgO) return;
        const now = ac.currentTime;
        bgT += STEP;
        let f = 0, v = 0;
        if (!api.muted && bgMode !== 'off' && !paused) {
          if (bgMode === 'eyes') { const p = (bgT / .085) % 1; f = 1500 - 1100 * p; v = .1; bgO.type = 'square'; }
          else if (bgMode === 'fright') { const p = (bgT / .14) % 1; f = 160 + 700 * p * p; v = .22; bgO.type = 'triangle'; }
          else {
            const s = +bgMode.slice(1), per = .42 - s * .04, p = (bgT / per) % 1, tri = p < .5 ? p * 2 : 2 - p * 2;
            f = (360 + s * 50) + (250 + s * 40) * tri; v = .16; bgO.type = 'triangle';
          }
        }
        bgO.frequency.setTargetAtTime(f || 200, now, .006);
        bgG.gain.setTargetAtTime(v, now, .015);
      }

      const saved = api.load() || {};
      let startLevel = Math.max(1, Math.min(21, saved.lvl | 0 || 1));
      let hi = api.best || 0;
      let state = 'title', stT = 0, frame = 0, paused = false, submitted = false;
      let score = 0, lives = 0, level = 1, extraGiven = false, mz = null, mzi = 0;
      let dots = null, dotsLeft = 0, dotsEaten = 0, speeds = null;
      let modeIdx = 0, modeT = 0, frightT = 0, frightTotal = 0, ghostCombo = 0;
      let globalOn = false, globalCnt = 0, sinceDot = 0, elroyOff = false;
      let fruitT = 0, fruitShowT = 0, fruitPts = 0, fruitsSpawned = 0;
      let freezeT = 0, freezeGhost = null, freezePts = 0, rng = 0x1234;
      const pac = { x: 0, y: 0, dir: 1, want: 1, acc: 0, stall: 0, anim: 0, moving: false };
      const ghosts = [0, 1, 2, 3].map(id => ({ id, x: 0, y: 0, dir: 1, next: 1, state: 'house', fright: false, rev: false, acc: 0, cnt: 0, anim: 0 }));
      const [blinky, pinky, inky, clyde] = ghosts;

      const tileAt = (c, r) => (r < 0 || r >= MAZE_ROWS) ? '#' : (c < 0 || c >= MAZE_COLS) ? (mz.tunnelRow[r] ? 'T' : '#') : mz.grid[r][c];
      const open = (c, r) => { const ch = tileAt(c, r); return ch !== '#' && ch !== '-' && ch !== 'H'; };
      const tunnelSlow = (c, r) => mz.tunnelRow[r] && (c < 0 || c >= MAZE_COLS || mz.grid[r][c] === 'T');
      const tx = e => Math.floor(e.x / 8), ty = e => Math.floor(e.y / 8);
      const mod8 = v => ((v % 8) + 8) % 8;
      const rand = () => { rng = (rng * 1103515245 + 12345) >>> 0; return rng >>> 16; };
      const isNoUp = (c, r) => CFG.NO_UP.some(p => p[0] === c && p[1] === r);

      function setScore(add) {
        score += add;
        if (!extraGiven && score >= CFG.EXTRA_LIFE) { extraGiven = true; lives++; sfx('life'); }
        if (score > hi) hi = score;
        api.score(score);
      }

      function loadLevel() {
        mzi = mazeOf(level); mz = MAZES[mzi];
        dots = new Uint8Array(MAZE_COLS * MAZE_ROWS); dotsLeft = 0; dotsEaten = 0;
        for (let r = 0; r < MAZE_ROWS; r++) for (let c = 0; c < MAZE_COLS; c++) {
          const ch = mz.grid[r][c];
          if (ch === '.' || ch === 'o') { dots[r * MAZE_COLS + c] = ch === '.' ? 1 : 2; dotsLeft++; }
        }
        speeds = SPEEDS(level);
        for (const gh of ghosts) gh.cnt = 0;
        globalOn = false; globalCnt = 0; fruitsSpawned = 0;
      }
      function resetActors() {
        pac.x = CFG.PAC_START[0]; pac.y = CFG.PAC_START[1]; pac.dir = 1; pac.want = 1; pac.acc = 0; pac.stall = 0; pac.anim = 0;
        const Hs = CFG.HOUSE;
        blinky.x = Hs.door; blinky.y = Hs.out; blinky.state = 'out'; blinky.dir = 1;
        blinky.next = chooseDir(blinky, 13, 11, 1);
        pinky.x = Hs.homes[1]; pinky.y = Hs.mid; pinky.state = 'house'; pinky.dir = 2;
        inky.x = Hs.homes[2]; inky.y = Hs.mid; inky.state = 'house'; inky.dir = 0;
        clyde.x = Hs.homes[3]; clyde.y = Hs.mid; clyde.state = 'house'; clyde.dir = 0;
        for (const gh of ghosts) { gh.fright = false; gh.rev = false; gh.acc = 0; }
        const tab = CFG.MODES[level === 1 ? 0 : level <= 4 ? 1 : 2];
        modeIdx = 0; modeT = Math.round(tab[0] * 60);
        frightT = 0; ghostCombo = 0; sinceDot = 0; fruitT = 0; fruitShowT = 0; freezeGhost = null;
      }
      function newGame() {
        score = 0; lives = CFG.LIVES; level = startLevel; extraGiven = false; submitted = false;
        api.score(0);
        loadLevel(); resetActors();
        state = 'intro'; stT = CFG.INTRO; elroyOff = false;
        audio(); sfx('intro');
        api.save({ lvl: startLevel });
      }

      function targetOf(gh) {
        const pc = tx(pac), pr = ty(pac);
        if (gh.state === 'eyes') return [13, 11];
        const scatter = modeIdx % 2 === 0 && modeIdx < 7;
        if (gh.id === 0 && elroy() > 0) return [pc, pr];
        if (scatter) return CFG.SCATTER[gh.id];
        if (gh.id === 0) return [pc, pr];
        if (gh.id === 1) return [pc + DX[pac.dir] * 4 - (pac.dir === 0 ? 4 : 0), pr + DY[pac.dir] * 4];
        if (gh.id === 2) {
          const ax = pc + DX[pac.dir] * 2 - (pac.dir === 0 ? 2 : 0), ay = pr + DY[pac.dir] * 2;
          return [ax * 2 - tx(blinky), ay * 2 - ty(blinky)];
        }
        const dx = tx(clyde) - pc, dy = ty(clyde) - pr;
        return dx * dx + dy * dy >= 64 ? [pc, pr] : CFG.SCATTER[3];
      }
      function chooseDir(gh, nc, nr, dir) {
        const back = (dir + 2) % 4;
        if (gh.fright && gh.state === 'out') {
          let d = rand() & 3;
          for (let k = 0; k < 4; k++, d = (d + 1) % 4) {
            if (d === back || !open(nc + DX[d], nr + DY[d])) continue;
            return d;
          }
          return back;
        }
        const [tc, tr] = targetOf(gh);
        let best = -1, bd = Infinity;
        for (let d = 0; d < 4; d++) {
          if (d === back) continue;
          if (d === 0 && gh.state === 'out' && isNoUp(nc, nr)) continue;
          const c = nc + DX[d], r = nr + DY[d];
          if (!open(c, r)) continue;
          const dd = (c - tc) * (c - tc) + (r - tr) * (r - tr);
          if (dd < bd) { bd = dd; best = d; }
        }
        return best < 0 ? back : best;
      }
      function elroy() {
        if (elroyOff || blinky.state !== 'out') return 0;
        const e1 = LV(CFG.ELROY, level);
        return dotsLeft <= e1 / 2 ? 2 : dotsLeft <= e1 ? 1 : 0;
      }
      function ghostSpeed(gh) {
        if (gh.state === 'eyes' || gh.state === 'entering') return CFG.EYES_SPEED;
        if (gh.state === 'house' || gh.state === 'leaving') return CFG.HOUSE_SPEED;
        if (tunnelSlow(tx(gh), ty(gh))) return speeds.tun;
        if (gh.fright) return speeds.ghF;
        if (gh.id === 0) { const e = elroy(); if (e) return e === 2 ? speeds.e2 : speeds.e1; }
        return speeds.gh;
      }
      function stepGhost(gh) {
        const Hs = CFG.HOUSE;
        if (gh.state === 'house') {
          gh.y += gh.dir === 0 ? -1 : 1;
          if (gh.y <= Hs.mid - 4) gh.dir = 2; else if (gh.y >= Hs.mid + 4) gh.dir = 0;
          return;
        }
        if (gh.state === 'leaving') {
          if (gh.x !== Hs.door) { gh.dir = gh.x < Hs.door ? 3 : 1; gh.x += gh.x < Hs.door ? 1 : -1; return; }
          if (gh.y > Hs.out) { gh.dir = 0; gh.y--; return; }
          gh.state = 'out'; gh.dir = gh.rev ? 3 : 1; gh.rev = false;
          gh.next = chooseDir(gh, gh.dir === 1 ? 13 : 14, 11, gh.dir);
          if (gh === clyde) elroyOff = false;
          return;
        }
        if (gh.state === 'entering') {
          if (gh.x !== Hs.door && gh.y === Hs.out) { gh.x += gh.x < Hs.door ? 1 : -1; return; }
          const home = Hs.homes[gh.id];
          if (gh.y < Hs.mid) { gh.dir = 2; gh.y++; return; }
          if (gh.x !== home) { gh.dir = gh.x < home ? 3 : 1; gh.x += gh.x < home ? 1 : -1; return; }
          gh.state = 'leaving'; gh.fright = false; gh.rev = false;
          return;
        }
        gh.x += DX[gh.dir]; gh.y += DY[gh.dir];
        if (gh.x < -8) gh.x += 240; else if (gh.x >= 232) gh.x -= 240;
        if (mod8(gh.x) === 4 && mod8(gh.y) === 4) {
          const c = tx(gh), r = ty(gh);
          if (gh.state === 'eyes' && r === 11 && (c === 13 || c === 14)) { gh.state = 'entering'; return; }
          if (gh.rev) { gh.rev = false; gh.dir = (gh.dir + 2) % 4; }
          else gh.dir = gh.next;
          gh.next = chooseDir(gh, c + DX[gh.dir], r + DY[gh.dir], gh.dir);
        }
      }
      function moveGhost(gh, onlyEyes) {
        if (onlyEyes && gh.state !== 'eyes' && gh.state !== 'entering') return;
        gh.acc += ghostSpeed(gh) * CFG.PX100;
        while (gh.acc >= 1) { gh.acc -= 1; stepGhost(gh); }
        gh.anim++;
      }

      function stepPac() {
        const c = tx(pac), r = ty(pac);
        if (pac.want !== pac.dir) {
          if (pac.want === (pac.dir + 2) % 4) pac.dir = pac.want;
          else if (open(c + DX[pac.want], r + DY[pac.want]) && !(c < 0 || c >= MAZE_COLS)) pac.dir = pac.want;
        }
        const cx = c * 8 + 4, cy = r * 8 + 4, d = pac.dir;
        const atOrPast = DX[d] ? (DX[d] > 0 ? pac.x >= cx : pac.x <= cx) : (DY[d] > 0 ? pac.y >= cy : pac.y <= cy);
        if (atOrPast && !open(c + DX[d], r + DY[d])) {
          if (DX[d]) pac.x = cx; else pac.y = cy;
          pac.moving = false;
          return false;
        }
        pac.x += DX[d]; pac.y += DY[d];
        if (DX[d] && pac.y !== cy) pac.y += Math.sign(cy - pac.y);
        if (DY[d] && pac.x !== cx) pac.x += Math.sign(cx - pac.x);
        if (pac.x < -8) pac.x += 240; else if (pac.x >= 232) pac.x -= 240;
        pac.moving = true; pac.anim++;
        return true;
      }
      function eatAt() {
        const c = tx(pac), r = ty(pac);
        if (c < 0 || c >= MAZE_COLS) return;
        const k = r * MAZE_COLS + c, v = dots[k];
        if (!v) return;
        dots[k] = 0; dotsLeft--; dotsEaten++; sinceDot = 0;
        sfx('wakka');
        if (v === 1) { setScore(CFG.DOT); pac.stall = CFG.STALL_DOT; }
        else { setScore(CFG.ENERGIZER); pac.stall = CFG.STALL_ENERGIZER; energize(); }
        if (globalOn) {
          globalCnt++;
          if (globalCnt === CFG.GLOBAL_REL[1] && pinky.state === 'house') release(pinky);
          else if (globalCnt === CFG.GLOBAL_REL[2] && inky.state === 'house') release(inky);
          else if (globalCnt === CFG.GLOBAL_REL[3] && clyde.state === 'house') { globalOn = false; globalCnt = 0; }
        } else { const p = preferred(); if (p) p.cnt++; }
        if (CFG.FRUIT_AT.includes(dotsEaten) && fruitsSpawned < 2) {
          fruitsSpawned++;
          fruitT = CFG.FRUIT_MIN + (rand() % (CFG.FRUIT_MAX - CFG.FRUIT_MIN));
        }
        if (dotsLeft === 0) { state = 'clear'; stT = CFG.CLEAR_FREEZE; bgMode = 'off'; }
      }
      function energize() {
        const secs = level >= 19 ? 0 : LV(CFG.FRIGHT, level);
        ghostCombo = 0;
        for (const gh of ghosts) {
          if (gh.state === 'out') gh.rev = true;
          if (secs && gh.state !== 'eyes' && gh.state !== 'entering') gh.fright = true;
        }
        frightT = frightTotal = secs * 60;
      }
      function preferred() { return [pinky, inky, clyde].find(gh => gh.state === 'house'); }
      function release(gh) { if (gh.state === 'house') gh.state = 'leaving'; }
      function houseLimit(gh) { return gh.id === 1 ? 0 : gh.id === 2 ? (level === 1 ? 30 : 0) : (level === 1 ? 60 : level === 2 ? 50 : 0); }

      function collide() {
        const c = tx(pac), r = ty(pac);
        for (const gh of ghosts) {
          if (gh.state !== 'out' || tx(gh) !== c || ty(gh) !== r) continue;
          if (gh.fright) {
            const pts = CFG.GHOST_PTS[Math.min(ghostCombo, 3)]; ghostCombo++;
            setScore(pts);
            gh.state = 'eyes'; gh.fright = false;
            freezeGhost = gh; freezePts = pts; state = 'eat'; stT = CFG.EAT_FREEZE;
            sfx('ghost');
            return true;
          }
          state = 'die'; stT = CFG.DIE_FREEZE; bgMode = 'off'; fruitT = 0;
          return true;
        }
        if (fruitT > 0 && r === 17 && (c === 13 || c === 14)) {
          fruitPts = CFG.FRUIT_PTS[LV(CFG.FRUIT_OF, level)];
          setScore(fruitPts); fruitT = 0; fruitShowT = CFG.FRUIT_SHOW; sfx('fruit');
        }
        return false;
      }

      function playTick() {
        if (frightT > 0) { frightT--; if (!frightT) for (const gh of ghosts) gh.fright = false; }
        else if (modeIdx < 7) {
          if (--modeT <= 0) {
            modeIdx++;
            const tab = CFG.MODES[level === 1 ? 0 : level <= 4 ? 1 : 2];
            modeT = modeIdx < 7 ? Math.max(1, Math.round(tab[modeIdx] * 60)) : 0;
            for (const gh of ghosts) if (gh.state === 'out') gh.rev = true;
          }
        }
        sinceDot++;
        if (sinceDot >= (level < 5 ? 240 : 180)) { sinceDot = 0; const p = preferred(); if (p) release(p); }
        if (!globalOn) { const p = preferred(); if (p && p.cnt >= houseLimit(p)) release(p); }
        if (fruitT > 0) fruitT--;
        if (fruitShowT > 0) fruitShowT--;

        if (pac.stall > 0) pac.stall--;
        else {
          pac.acc += (frightT > 0 ? speeds.pacF : speeds.pac) * CFG.PX100;
          while (pac.acc >= 1 && state === 'play') {
            pac.acc -= 1;
            if (!stepPac()) { pac.acc = 0; break; }
            eatAt();
            if (pac.stall) { pac.acc = 0; break; }
          }
        }
        if (state !== 'play') return;
        if (collide()) return;
        for (const gh of ghosts) moveGhost(gh, false);
        collide();
        const anyEyes = ghosts.some(gh => gh.state === 'eyes' || gh.state === 'entering');
        bgMode = anyEyes ? 'eyes' : frightT > 0 && ghosts.some(gh => gh.fright) ? 'fright' : 's' + Math.min(4, Math.floor((244 - dotsLeft) / 50));
      }

      function tick() {
        frame++;
        if (paused) { updateBg(); return; }
        if (state === 'title') { stT++; bgMode = 'off'; }
        else if (state === 'intro' || state === 'ready') {
          if (--stT <= 0) state = 'play';
        } else if (state === 'play') playTick();
        else if (state === 'eat') {
          for (const gh of ghosts) if (gh !== freezeGhost) moveGhost(gh, true);
          if (--stT <= 0) { state = 'play'; freezeGhost = null; }
        } else if (state === 'die') {
          if (--stT <= 0) { state = 'dying'; stT = CFG.DIE_ANIM; sfx('death'); }
        } else if (state === 'dying') {
          if (--stT <= -CFG.DIE_WAIT) {
            lives--;
            if (lives <= 0) gameOver();
            else { resetActors(); globalOn = true; globalCnt = 0; elroyOff = true; state = 'ready'; stT = CFG.READY; }
          }
        } else if (state === 'clear') {
          if (--stT <= -(CFG.CLEAR_FLASH * CFG.CLEAR_HALF)) {
            level++; loadLevel(); resetActors(); elroyOff = false; state = 'ready'; stT = CFG.READY;
          }
        } else if (state === 'over') {
          if (--stT <= 0) { state = 'title'; stT = 0; }
        }
        updateBg();
      }
      function gameOver() {
        state = 'over'; stT = CFG.OVER; bgMode = 'off';
        if (!submitted) { submitted = true; api.submit(score); }
      }

      function text(s, x, y, color, bold = true) {
        const f = font(color, bold);
        s = String(s);
        for (let i = 0; i < s.length; i++) {
          const k = f.idx[s[i]];
          if (k !== undefined && s[i] !== ' ') g.drawImage(f.c, k * 8, 0, 8, 8, x + i * 8, y, 8, 8);
        }
      }
      const textC = (s, row, color) => text(s, Math.round((W - String(s).length * 8) / 2), row * 8, color);
      const textR = (s, col, row, color) => text(s, (col + 1 - String(s).length) * 8, row * 8, color);
      const scoreStr = v => v ? String(v) : '00';

      function drawHeader() {
        if (state === 'title' || paused || state === 'over' || ((frame >> 4) & 1) || state === 'intro') text('1UP', 24, 0, '#dedeff');
        text('HIGH SCORE', 72, 0, '#dedeff');
        textR(scoreStr(score), 6, 1, '#dedeff');
        if (hi) textR(String(hi), 16, 1, '#dedeff');
      }
      function drawFooter() {
        const show = state === 'intro' ? lives : lives - 1;
        for (let i = 0; i < Math.min(show, 5); i++) g.drawImage(lifeSpr, 16 + i * 16, 272);
        const f0 = Math.max(1, level - 6);
        for (let l = level, i = 0; l >= f0; l--, i++) g.drawImage(SPR.fruit[LV(CFG.FRUIT_OF, l)], 196 - i * 16, 272);
      }
      function drawMaze(flashWhite) {
        g.drawImage(wallsFor(mzi, flashWhite), 0, TOP);
        if (!flashWhite) { g.fillStyle = '#ffb8ff'; g.fillRect(104, TOP + 100, 16, 2); }
      }
      function drawDots() {
        g.fillStyle = '#ffb8ae';
        const blink = state === 'play' || state === 'eat' ? (frame >> 3) & 1 : 0;
        for (let r = 0; r < MAZE_ROWS; r++) for (let c = 0; c < MAZE_COLS; c++) {
          const v = dots[r * MAZE_COLS + c];
          if (v === 1) g.fillRect(c * 8 + 3, TOP + r * 8 + 3, 2, 2);
          else if (v === 2 && !blink) { g.fillRect(c * 8 + 1, TOP + r * 8 + 2, 6, 4); g.fillRect(c * 8 + 2, TOP + r * 8 + 1, 4, 6); }
        }
      }
      function drawGhost(gh) {
        const x = gh.x - 8, y = gh.y - 8 + TOP, f = (gh.anim >> 3) & 1;
        if (gh.state === 'eyes' || gh.state === 'entering') { g.drawImage(SPR.eyes[gh.dir], x, y); return; }
        if (gh.fright) {
          const flashes = LV(CFG.FLASHES, level), flashing = frightT < flashes * CFG.FLASH_HALF * 2 && ((frightT / CFG.FLASH_HALF) | 0) % 2 === 1;
          g.drawImage(SPR.fright[flashing ? 1 : 0][f], x, y); return;
        }
        g.drawImage(SPR.ghost[gh.id][f][gh.dir], x, y);
      }
      function drawPac() {
        const seq = [0, 1, 2, 1], fr = pac.moving ? seq[(pac.anim >> 1) & 3] : 1;
        g.drawImage(SPR.pac[pac.dir][state === 'intro' || state === 'ready' ? 0 : fr], pac.x - 8, pac.y - 8 + TOP);
      }
      function drawTitle() {
        textC('CHARACTER / NICKNAME', 5, '#dedeff');
        const t = stT;
        for (let k = 0; k < 4; k++) {
          const at = 30 + k * 50;
          if (t < at) break;
          const row = 7 + k * 3;
          g.drawImage(SPR.ghost[k][0][3], 24, row * 8 - 4);
          if (t > at + 15) text('-' + NAMES[k][0], 56, row * 8, GHOST_COL[k]);
          if (t > at + 30) text('"' + NAMES[k][1] + '"', 144, row * 8, GHOST_COL[k]);
        }
        if (t > 240) {
          g.fillStyle = '#ffb8ae'; g.fillRect(83, 23 * 8 + 3, 2, 2);
          if ((frame >> 3) & 1) { g.fillRect(81, 25 * 8 + 2, 6, 4); g.fillRect(82, 25 * 8 + 1, 4, 6); }
          text('10', 96, 23 * 8, '#dedeff'); text('PTS', 120, 23 * 8, '#dedeff');
          text('50', 96, 25 * 8, '#dedeff'); text('PTS', 120, 25 * 8, '#dedeff');
        }
        textC('< LEVEL ' + startLevel + ' >', 27, '#ffb852');
        g.drawImage(SPR.fruit[LV(CFG.FRUIT_OF, startLevel)], 104, 29 * 8 - 4);
        if ((frame >> 5) & 1) textC(touchUI ? 'TAP TO START' : 'PUSH ENTER', 32, '#ffb8ae');
        text('FREE PLAY', 16, 35 * 8, '#dedeff');
      }
      function draw() {
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
        drawHeader();
        if (state === 'title') { drawTitle(); return; }
        const clearing = state === 'clear' && stT <= 0;
        drawMaze(clearing && (((-stT) / CFG.CLEAR_HALF) | 0) % 2 === 1);
        if (!clearing) drawDots();
        if (fruitT > 0) g.drawImage(SPR.fruit[LV(CFG.FRUIT_OF, level)], CFG.FRUIT_POS[0] - 8, CFG.FRUIT_POS[1] - 8 + TOP);
        if (fruitShowT > 0) { const s = String(fruitPts); text(s, CFG.FRUIT_POS[0] - s.length * 4, CFG.FRUIT_POS[1] - 4 + TOP, '#ffb8ff', false); }
        const showGhosts = state === 'play' || state === 'eat' || state === 'die' || state === 'ready' || (state === 'intro' && stT < 130) || (state === 'clear' && stT > 0);
        if (showGhosts) for (const gh of ghosts) if (gh !== freezeGhost) drawGhost(gh);
        if (state === 'eat') { const s = String(freezePts); text(s, freezeGhost.x - s.length * 4, freezeGhost.y - 4 + TOP, '#00ffff', false); }
        else if (state === 'dying') {
          const k = CFG.DIE_ANIM - stT;
          if (k < 11 * 8) g.drawImage(SPR.death[Math.min(10, k >> 3)], pac.x - 8, pac.y - 8 + TOP);
          else if (k < 11 * 8 + 14) {
            g.fillStyle = PAC_COL;
            for (let a = 0; a < 8; a++) { const ca = Math.cos(a * Math.PI / 4), sa = Math.sin(a * Math.PI / 4); for (let r = 3; r < 7; r++) g.fillRect(Math.round(pac.x + ca * r), Math.round(pac.y + TOP + sa * r), 1, 1); }
          }
        } else if (state !== 'over' && !(state === 'intro' && stT >= 130)) drawPac();
        if (state === 'intro' && stT >= 130) textC('PLAYER ONE', 14, '#00ffff');
        if (state === 'intro' || state === 'ready') textC('READY!', 20, '#ffff00');
        if (state === 'over') textC('GAME  OVER', 20, '#ff0000');
        if (paused) { g.fillStyle = '#000'; g.fillRect(80, 20 * 8 - 1, 64, 10); textC('PAUSED', 20, '#ffff00'); }
        drawFooter();
      }

      function present() {
        const r = canvas.getBoundingClientRect();
        if (!r.width) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const tw = Math.max(1, Math.round(r.width * dpr)), th = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== tw || canvas.height !== th) { canvas.width = tw; canvas.height = th; }
        vctx.setTransform(1, 0, 0, 1, 0, 0);
        const k = Math.ceil(tw / W);
        if (tw % W === 0 || tw >= W * 4) { vctx.imageSmoothingEnabled = false; vctx.drawImage(low, 0, 0, tw, th); return; }
        if (mid.width !== W * k) { mid.width = W * k; mid.height = H * k; }
        mctx.imageSmoothingEnabled = false;
        mctx.drawImage(low, 0, 0, W * k, H * k);
        vctx.imageSmoothingEnabled = true; vctx.imageSmoothingQuality = 'high';
        vctx.drawImage(mid, 0, 0, tw, th);
      }

      let touchUI = matchMedia('(pointer: coarse)').matches;
      const pad = document.createElement('div');
      pad.className = 'mm-pad';
      const ARROW = ['M5 15l7-7 7 7', 'M15 5l-7 7 7 7', 'M5 9l7 7 7-7', 'M9 5l7 7-7 7'];
      for (const d of [1, 0, 2, 3]) {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', ['up', 'left', 'down', 'right'][d]);
        b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${ARROW[d]}"/></svg>`;
        const up = () => b.classList.remove('on');
        b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); audio(); input(d); });
        b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
        b.addEventListener('contextmenu', e => e.preventDefault());
        pad.append(b);
      }
      root.append(pad);

      function input(d) {
        if (state === 'title') {
          if (d === 1 || d === 3) { startLevel = Math.max(1, Math.min(21, startLevel + (d === 1 ? -1 : 1))); stT = Math.max(stT, 250); }
          return;
        }
        pac.want = d;
      }
      function startOrAdvance() {
        if (state === 'title') newGame();
        else if (state === 'over' && stT < CFG.OVER - 40) { state = 'title'; stT = 250; }
      }
      api.on(window, 'keydown', e => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        audio();
        const d = KEYDIR[e.code];
        if (d !== undefined) { e.preventDefault(); input(d); return; }
        if (e.code === 'KeyP' && !e.repeat && state !== 'title' && state !== 'over') { paused = !paused; return; }
        if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') && !e.repeat) { e.preventDefault(); startOrAdvance(); }
      });
      const local = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
      let sw = null;
      api.on(canvas, 'pointerdown', e => {
        if (e.pointerType === 'touch' && !touchUI) { touchUI = true; root.classList.add('touch'); }
        audio();
        const p = local(e);
        sw = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, p };
        if (state !== 'title' && state !== 'over' && p.y < 24) { paused = !paused; sw = null; }
      });
      api.on(canvas, 'pointermove', e => {
        if (!sw || sw.id !== e.pointerId) return;
        const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
        if (dx * dx + dy * dy < 196) return;
        input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 2 : 0));
        sw.x = e.clientX; sw.y = e.clientY; sw.moved = true;
      });
      const swEnd = e => {
        if (!sw || sw.id !== e.pointerId) return;
        const s = sw; sw = null;
        if (s.moved) return;
        if (state === 'title' && s.p.y > 25 * 8 && s.p.y < 31 * 8 && (s.p.x < 72 || s.p.x > 152)) { input(s.p.x < 72 ? 1 : 3); return; }
        if (state === 'title' || state === 'over') startOrAdvance();
      };
      api.on(canvas, 'pointerup', swEnd);
      api.on(canvas, 'pointercancel', () => { sw = null; });
      if (touchUI) root.classList.add('touch');

      let acc = 0;
      api.score(0);
      api.loop(dt => {
        acc += dt;
        while (acc >= STEP - .0005) { tick(); acc -= STEP; }
        draw();
        present();
      });

      root.__mm = {
        get: () => ({ state, stT, score, lives, level, dotsLeft, dotsEaten, modeIdx, frightT, pac: { ...pac }, ghosts: ghosts.map(gh => ({ id: gh.id, x: gh.x, y: gh.y, state: gh.state, fright: gh.fright, dir: gh.dir })), paused, mz: mzi }),
        eatAll: n => { let k = 0; for (let i = 0; i < dots.length && k < n; i++) if (dots[i]) { dots[i] = 0; dotsLeft--; dotsEaten++; k++; } if (!dotsLeft) { state = 'clear'; stT = CFG.CLEAR_FREEZE; } },
        target: id => targetOf(ghosts[id]),
        set: o => { Object.assign(pac, o.pac || {}); if (o.level) { level = o.level; loadLevel(); resetActors(); } if (o.lives) lives = o.lives; if (o.modeIdx !== undefined) modeIdx = o.modeIdx; if (o.blinky) Object.assign(blinky, o.blinky); if (o.clyde) Object.assign(clyde, o.clyde); if (o.state) { state = o.state; stT = o.stT || 0; } },
        open: (c, r) => open(c, r),
        dot: (c, r) => c >= 0 && c < MAZE_COLS && r >= 0 && r < MAZE_ROWS && dots[r * MAZE_COLS + c] > 0
      };

      return {
        destroy() {
          delete root.__mm;
          if (ac) { try { bgO.stop(); } catch (e) {} try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {} ac = null; }
        }
      };
    }
  });

  Ameplay.covers['maze-muncher'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="mmc-bg" cx=".45" cy=".55" r=".8"><stop offset="0" stop-color="#1d1a7a"/><stop offset="1" stop-color="#08072e"/></radialGradient>
<radialGradient id="mmc-pac" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff3a0"/><stop offset=".45" stop-color="#ffd800"/><stop offset="1" stop-color="#f0a400"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#mmc-bg)"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<g stroke="#4a4dff" stroke-width="14" opacity=".25"><path d="M-10 112H120Q132 112 132 100V58Q132 46 144 46H256Q268 46 268 58V100Q268 112 280 112H410"/><path d="M-10 236H90Q102 236 102 248V310M410 236H310Q298 236 298 248V310"/><rect x="150" y="238" width="100" height="34" rx="12"/><rect x="34" y="20" width="64" height="52" rx="12"/><rect x="302" y="20" width="64" height="52" rx="12"/></g>
<g stroke="#3a3dff" stroke-width="6"><path d="M-10 112H120Q132 112 132 100V58Q132 46 144 46H256Q268 46 268 58V100Q268 112 280 112H410"/><path d="M-10 236H90Q102 236 102 248V310M410 236H310Q298 236 298 248V310"/><rect x="150" y="238" width="100" height="34" rx="12"/><rect x="34" y="20" width="64" height="52" rx="12"/><rect x="302" y="20" width="64" height="52" rx="12"/></g>
<g stroke="#9ea6ff" stroke-width="2" opacity=".7"><path d="M-10 108H120Q128 108 128 100V58Q128 42 144 42H256Q272 42 272 58V100Q272 108 280 108H410"/></g></g>
<g fill="#ffc2b4"><circle cx="238" cy="174" r="6"/><circle cx="272" cy="174" r="6"/><circle cx="306" cy="174" r="6"/><circle cx="60" cy="80" r="5"/><circle cx="200" cy="80" r="5"/><circle cx="340" cy="80" r="5"/></g>
<circle cx="200" cy="200" r="0"/>
<circle cx="366" cy="174" r="15" fill="#ffc2b4"/><circle cx="366" cy="174" r="24" fill="#ffc2b4" opacity=".22"/>
<g stroke="#ffe36b" stroke-width="6" stroke-linecap="round" opacity=".55"><path d="M66 150H96M54 174H92M66 198H96"/></g>
<ellipse cx="160" cy="232" rx="52" ry="8" fill="#000" opacity=".3"/>
<path d="M160 174L206 146A54 54 0 1 0 206 202Z" fill="url(#mmc-pac)"/>
<path d="M126 148A40 40 0 0 1 160 126" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".6"/>
<g transform="translate(52 214) scale(0.95)"><ellipse cx="0" cy="40" rx="30" ry="6" fill="#000" opacity=".3"/><path d="M-30 32V0A30 30 0 0 1 30 0V32L20 22 10 32 0 22-10 32-20 22Z" fill="#ff3b3b"/><path d="M-22-14A26 26 0 0 1-6-26" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45"/><ellipse cx="-11" cy="-2" rx="8" ry="10" fill="#fff"/><ellipse cx="11" cy="-2" rx="8" ry="10" fill="#fff"/><circle cx="-7" cy="-2" r="4.5" fill="#2a2aff"/><circle cx="15" cy="-2" r="4.5" fill="#2a2aff"/></g>
<g transform="translate(338 250) scale(0.8)"><ellipse cx="0" cy="40" rx="30" ry="6" fill="#000" opacity=".3"/><path d="M-30 32V0A30 30 0 0 1 30 0V32L20 22 10 32 0 22-10 32-20 22Z" fill="#ffb8ff"/><path d="M-22-14A26 26 0 0 1-6-26" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45"/><ellipse cx="-11" cy="-2" rx="8" ry="10" fill="#fff"/><ellipse cx="11" cy="-2" rx="8" ry="10" fill="#fff"/><circle cx="-14" cy="-5" r="4.5" fill="#2a2aff"/><circle cx="8" cy="-5" r="4.5" fill="#2a2aff"/></g>
<g transform="translate(316 140) scale(.8)"><ellipse cx="0" cy="40" rx="30" ry="6" fill="#000" opacity=".3"/><path d="M-30 32V0A30 30 0 0 1 30 0V32L20 22 10 32 0 22-10 32-20 22Z" fill="#2b2bff"/><rect x="-14" y="-8" width="8" height="8" rx="2" fill="#ffc2b4"/><rect x="6" y="-8" width="8" height="8" rx="2" fill="#ffc2b4"/><path d="M-20 14l5-5 5 5 5-5 5 5 5-5 5 5 5-5" stroke="#ffc2b4" stroke-width="3.5" fill="none" stroke-linejoin="round"/></g>
<g transform="translate(60 150) scale(0)"><ellipse cx="0" cy="40" rx="30" ry="6" fill="#000" opacity=".3"/><path d="M-30 32V0A30 30 0 0 1 30 0V32L20 22 10 32 0 22-10 32-20 22Z" fill="#00e5ff"/><path d="M-22-14A26 26 0 0 1-6-26" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45"/><ellipse cx="-11" cy="-2" rx="8" ry="10" fill="#fff"/><ellipse cx="11" cy="-2" rx="8" ry="10" fill="#fff"/><circle cx="-11" cy="-2" r="4.5" fill="#2a2aff"/><circle cx="11" cy="-2" r="4.5" fill="#2a2aff"/></g>
</svg>`;
})();

