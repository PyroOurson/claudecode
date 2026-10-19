
(() => {
  'use strict';

  const CFG = {
    W: 288, H: 512, HZ: 60,
    FLAP_V: -5, GRAVITY: 0.3, MAX_FALL: 8,
    ROT_FLAP: -10, ROT_ACC: 0.4, ROT_MIN: -20, ROT_MAX: 90,
    BIRD_X: 80, BIRD_Y: 246, MENU_X: 134, MENU_Y: 218, BOX: 20, FLOOR: 380,
    BOB_DEG: 8, BOB_AMP: 4,
    PIPE_W: 52, PIPE_H: 320, GAP: 96, SPACING: 157, SPEED: 2, GAP_MIN: 180, GAP_MAX: 360,
    PIPE_START: [79, 236, 393], LAND_Y: 400, LAND_LOOP: 24,
    WING: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1], FLAP_FPS: 30, IDLE_FPS: 10,
    DIE_DELAY: 500, OVER_DELAY: 1000, EVENT_STEP: 30,
    MEDAL_AT: [10, 20, 30, 40], DAY_CHANCE: 0.6
  };

  const O = '#543847';
  const SIN = new Float32Array(360);
  for (let d = 0; d < 360; d++) SIN[d] = Math.fround(Math.sin(d * 3.1415925 / 180));

  const canvasOf = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return [c, x];
  };
  const seeded = s => () => (s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296;

  function rast(g, test, fill, edge) {
    const { w, h } = g, m = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (test(x + .5, y + .5)) m[y * w + x] = 1;
    const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue;
      const e = edge && !(at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1));
      const col = e ? edge : typeof fill === 'function' ? fill(x, y) : fill;
      if (col) g.d[y * w + x] = col;
    }
  }
  const grid = (w, h) => ({ w, h, d: new Array(w * h).fill(null) });
  function paint(x, g, ox = 0, oy = 0) {
    for (let i = 0; i < g.d.length; i++) if (g.d[i]) { x.fillStyle = g.d[i]; x.fillRect(ox + i % g.w, oy + (i / g.w | 0), 1, 1); }
  }
  const toCanvas = g => { const [c, x] = canvasOf(g.w, g.h); paint(x, g); return c; };
  const ell = (cx, cy, rx, ry, a = 0) => {
    const ca = Math.cos(a), sa = Math.sin(a);
    return (x, y) => { const dx = x - cx, dy = y - cy, u = dx * ca + dy * sa, v = dy * ca - dx * sa; return u * u / (rx * rx) + v * v / (ry * ry) <= 1; };
  };
  const box = (x0, y0, x1, y1) => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1;
  const poly = pts => (x, y) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  function disc(x, cx, cy, r, col) {
    x.fillStyle = col;
    for (let dy = -r; dy <= r; dy++) { const hw = Math.floor(Math.sqrt(r * r - dy * dy)); x.fillRect(cx - hw, cy + dy, hw * 2 + 1, 1); }
  }

  const FONT = {
    ' ': ['..', '..', '..', '..', '..', '..', '..'],
    '!': ['#', '#', '#', '#', '#', '.', '#'],
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    1: ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
    2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
    a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
    d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
    e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
    i: ['#', '.', '#', '#', '#', '#', '#'],
    l: ['#', '#', '#', '#', '#', '#', '#'],
    m: ['.....', '.....', '####.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
    p: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
    r: ['....', '....', '#.##', '##..', '#...', '#...', '#...'],
    t: ['.#..', '.#..', '####', '.#..', '.#..', '.#..', '..##'],
    v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    y: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.']
  };
  const DIG = [
    ['.###.', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.'],
    ['.##', '###', '.##', '.##', '.##', '.##', '.##', '.##', '.##', '.##'],
    ['.###.', '##.##', '...##', '...##', '..##.', '.##..', '##...', '##...', '##...', '#####'],
    ['.###.', '##.##', '...##', '...##', '.###.', '...##', '...##', '...##', '##.##', '.###.'],
    ['...##', '..###', '.####', '##.##', '##.##', '#####', '...##', '...##', '...##', '...##'],
    ['#####', '##...', '##...', '####.', '...##', '...##', '...##', '...##', '##.##', '.###.'],
    ['.###.', '##.##', '##...', '####.', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.'],
    ['#####', '...##', '...##', '..##.', '..##.', '.##..', '.##..', '.##..', '.##..', '.##..'],
    ['.###.', '##.##', '##.##', '##.##', '.###.', '##.##', '##.##', '##.##', '##.##', '.###.'],
    ['.###.', '##.##', '##.##', '##.##', '##.##', '.####', '...##', '...##', '##.##', '.###.']
  ];

  function maskOf(glyphs, cw, ch) {
    const rows = Math.max(...glyphs.map(g => g.length));
    const cols = glyphs.reduce((s, g) => s + g[0].length, 0) + glyphs.length - 1;
    const w = cols * cw, h = rows * ch, m = new Uint8Array(w * h);
    let cx = 0;
    for (const g of glyphs) {
      const gw = g[0].length;
      for (let r = 0; r < g.length; r++) for (let k = 0; k < gw; k++) if (g[r][k] === '#')
        for (let yy = 0; yy < ch; yy++) for (let xx = 0; xx < cw; xx++) m[(r * ch + yy) * w + (cx + k) * cw + xx] = 1;
      cx += gw + 1;
    }
    return { w, h, m };
  }
  function styled(mk, fill, rings) {
    const R = rings.reduce((s, r) => s + r[1], 0), W = mk.w + 2 * R, H = mk.h + 2 * R;
    let cur = new Uint8Array(W * H);
    const g = grid(W, H);
    for (let y = 0; y < mk.h; y++) for (let x = 0; x < mk.w; x++) if (mk.m[y * mk.w + x]) {
      cur[(y + R) * W + x + R] = 1;
      g.d[(y + R) * W + x + R] = typeof fill === 'function' ? fill(x, y, mk.h) : fill;
    }
    let step = 0;
    for (const [col, n] of rings) for (let k = 0; k < n; k++) {
      const diag = step++ % 2 === 1, nx = cur.slice();
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (cur[i]) continue;
        let hit = (x > 0 && cur[i - 1]) || (x < W - 1 && cur[i + 1]) || (y > 0 && cur[i - W]) || (y < H - 1 && cur[i + W]);
        if (!hit && diag) hit = (x > 0 && y > 0 && cur[i - W - 1]) || (x < W - 1 && y > 0 && cur[i - W + 1]) || (x > 0 && y < H - 1 && cur[i + W - 1]) || (x < W - 1 && y < H - 1 && cur[i + W + 1]);
        if (hit) { nx[i] = 1; g.d[i] = col; }
      }
      cur = nx;
    }
    return toCanvas(g);
  }
  const text = (s, cw, ch, fill, rings) => styled(maskOf([...s].map(k => FONT[k]), cw, ch), fill, rings);
  const bands = (top, bot, cut = .5) => (x, y, h) => y < h * cut ? top : bot;

  const BIRD_PAL = [
    { main: '#f8c22e', shade: '#e88a2c', light: '#fde27a', belly: '#fff3c4', wing: '#fffdf0', wingS: '#f2dca0', beak: '#ff9a2a', beak2: '#ef6a1e', cheek: '#ff9c8a', lip: '#f8501c' },
    { main: '#4fb6e8', shade: '#2a78bd', light: '#9ddcf8', belly: '#dff5ff', wing: '#f6fcff', wingS: '#b9def0', beak: '#ffb02e', beak2: '#f07c1e', cheek: '#ff9fb0', lip: '#f8501c' },
    { main: '#f05a3a', shade: '#b63327', light: '#ff9070', belly: '#ffd9c7', wing: '#fff4ee', wingS: '#f4c2b0', beak: '#ffc23a', beak2: '#f39121', cheek: '#ffb0a0', lip: '#fbb12e' }
  ];
  const GHOST = { main: '#d9d9d9', shade: '#a9a9a9', light: '#f1f1f1', belly: '#f5f5f5', wing: '#ffffff', wingS: '#d0d0d0', beak: '#cfcfcf', beak2: '#b5b5b5', cheek: '#e3e3e3', lip: '#c4c4c4' };

  function birdSprite(p, frame) {
    const g = grid(18, 13);
    const body = ell(7.6, 6.6, 7.4, 5.9);
    rast(g, body, (x, y) => y >= 9 && x < 10 ? p.shade : (y < 3 && x < 7) || (y < 5 && x < 3) ? p.light : p.main, O);
    rast(g, ell(11.2, 3.6, 3.6, 3.4), (x, y) => x < 10 && y > 3 ? '#e6eedc' : '#ffffff', O);
    rast(g, box(12, 2, 13, 5), O);
    rast(g, box(9, 6, 17, 8.6), p.lip, O);
    rast(g, box(9, 8, 16, 10.6), p.lip, O);
    const wy = [4.6, 6.6, 8.4][frame];
    rast(g, ell(3.8, wy, 3.8, 2.3), (x, y) => y > wy + .2 && (x < 1.5 || x > 4.5) ? p.wingS : p.wing, O);
    const [c, x] = canvasOf(48, 48);
    for (let i = 0; i < g.d.length; i++) if (g.d[i]) { x.fillStyle = g.d[i]; x.fillRect(6 + (i % g.w) * 2, 11 + (i / g.w | 0) * 2, 2, 2); }
    return c;
  }

  function makeBg(night) {
    const P = night
      ? { sky: '#0e8996', cloud: '#2ba5ae', cloudE: '#239aa4', bld: '#0d6f7b', bldE: '#095a64', win: '#f2e17a', dark: '#0b6470', bush: '#1f9a4c', bushE: '#177e3d' }
      : { sky: '#4ec0ca', cloud: '#e9fcd9', cloudE: '#cdeed7', bld: '#c4eac2', bldE: '#a1d9b0', win: '#e2f7da', dark: '#b4e2bc', bush: '#64e268', bushE: '#4fc75a' };
    const [c, x] = canvasOf(288, 512);
    x.fillStyle = P.sky; x.fillRect(0, 0, 288, 512);
    const R = seeded(1337);
    const puffs = [];
    for (let cx = -6; cx < 300;) { const r = 13 + (R() * 11 | 0); puffs.push([cx, 350 + (R() * 9 | 0), r]); cx += r + 3 + (R() * 9 | 0); }
    puffs.forEach(([cx, cy, r]) => disc(x, cx, cy, r + 1, P.cloudE));
    puffs.forEach(([cx, cy, r]) => disc(x, cx, cy, r, P.cloud));
    x.fillStyle = P.cloud; x.fillRect(0, 358, 288, 42);
    for (let bx = -4; bx < 292;) {
      const w = 10 + (R() * 13 | 0), top = 352 + (R() * 24 | 0);
      x.fillStyle = P.bldE; x.fillRect(bx, top, w, 400 - top);
      x.fillStyle = P.bld; x.fillRect(bx + 1, top + 1, w - 2, 400 - top);
      for (let wy = top + 3; wy < 392; wy += 4) for (let wx = bx + 2; wx < bx + w - 3; wx += 3) {
        x.fillStyle = night && R() < .45 ? P.dark : P.win; x.fillRect(wx, wy, 2, 2);
      }
      bx += w - 1 + (R() * 3 | 0);
    }
    const bush = [];
    for (let cx = -4; cx < 296;) { const r = 7 + (R() * 6 | 0); bush.push([cx, 387 + (R() * 5 | 0), r]); cx += r + (R() * 6 | 0); }
    bush.forEach(([cx, cy, r]) => disc(x, cx, cy, r + 1, P.bushE));
    bush.forEach(([cx, cy, r]) => disc(x, cx, cy, r, P.bush));
    x.fillStyle = P.bush; x.fillRect(0, 392, 288, 120);
    return c;
  }

  function makeLand() {
    const [c, x] = canvasOf(336, 112);
    x.fillStyle = '#ded895'; x.fillRect(0, 0, 336, 112);
    x.fillStyle = O; x.fillRect(0, 0, 336, 1);
    x.fillStyle = '#e4fd8b'; x.fillRect(0, 1, 336, 1);
    for (let y = 2; y < 11; y++) for (let k = 0; k < 336; k++) {
      x.fillStyle = (((k - y) % 12) + 12) % 12 < 6 ? '#9ce659' : '#73bf2e'; x.fillRect(k, y, 1, 1);
    }
    x.fillStyle = '#558022'; x.fillRect(0, 11, 336, 1);
    x.fillStyle = '#c9b965'; x.fillRect(0, 12, 336, 2);
    x.fillStyle = '#d3cb86'; x.fillRect(0, 14, 336, 1);
    return c;
  }

  function makePipes() {
    const PROF = ['#9ce659', '#e4fd8b', '#e4fd8b', '#e4fd8b', '#9ce659', '#9ce659', '#9ce659', '#9ce659', '#9ce659', '#9ce659'];
    const col = (i, n) => { const k = Math.round(i * 45 / (n - 1)); return k < 10 ? PROF[k] : k < 32 ? '#73bf2e' : k < 34 ? '#558022' : k < 36 ? '#73bf2e' : '#558022'; };
    const [c, x] = canvasOf(52, 320);
    for (let k = 2; k < 50; k++) { x.fillStyle = k === 2 || k === 49 ? O : col(k - 3, 46); x.fillRect(k, 24, 1, 296); }
    x.fillStyle = '#558022'; x.fillRect(3, 24, 46, 2);
    for (let k = 0; k < 52; k++) { x.fillStyle = k === 0 || k === 51 ? O : col(k - 1, 50); x.fillRect(k, 0, 1, 24); }
    x.fillStyle = O; x.fillRect(0, 0, 52, 1); x.fillRect(0, 23, 52, 1);
    x.fillStyle = '#558022'; x.fillRect(1, 21, 50, 2);
    const [d, y] = canvasOf(52, 320);
    y.translate(0, 320); y.scale(1, -1); y.drawImage(c, 0, 0);
    return [c, d];
  }

  function makeButton(kind) {
    const g = grid(116, 70);
    const rr = (x0, y0, x1, y1, r) => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1 && !((x < x0 + r || x >= x1 - r) && (y < y0 + r || y >= y1 - r));
    rast(g, rr(4, 7, 116, 70, 2), 'rgba(84,56,71,.35)');
    rast(g, rr(1, 1, 114, 66, 2), (x, y) => y >= 56 ? '#e86101' : y >= 52 ? '#fca048' : y < 6 ? '#ffffff' : y < 30 ? '#fbfbf5' : '#f2efe4', O);
    rast(g, box(3, 3, 112, 4), '#ffffff');
    if (kind === 'play') {
      const tri = poly([[47, 14], [47, 48], [74, 31]]);
      rast(g, tri, (x, y) => y < 24 ? '#7fdb52' : '#53b43a', O);
      rast(g, box(49, 19, 51, 31), '#c8f5a8');
    } else {
      const bar = (x0, top, a, b) => { rast(g, box(x0, top, x0 + 12, 50), (x, y) => y < top + 4 ? a : b, O); };
      bar(39, 28, '#7fd0f4', '#4fb6e8');
      bar(65, 24, '#ff9070', '#f05a3a');
      bar(52, 14, '#fde27a', '#f8c22e');
      rast(g, box(36, 49, 80, 51), O);
    }
    return toCanvas(g);
  }

  function makeMedal(k) {
    const P = [
      ['#a35a26', '#c97b40', '#e8a467', '#f6c58e'],
      ['#8a8a98', '#acacba', '#d9d9e2', '#ffffff'],
      ['#b07410', '#d99a1e', '#f6d45a', '#fff2a8'],
      ['#6f9fae', '#9ccbd8', '#e4f5f9', '#ffffff']
    ][k];
    const [c, x] = canvasOf(44, 44);
    disc(x, 22, 22, 21, P[0]);
    disc(x, 22, 22, 20, P[1]);
    disc(x, 22, 22, 16, P[0]);
    disc(x, 22, 22, 15, P[2]);
    const g = grid(44, 44), pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4.6 : 11; pts.push([22 + Math.cos(a) * r, 22.5 + Math.sin(a) * r]); }
    rast(g, poly(pts), (xx, yy) => yy < 21 ? P[3] : P[1], P[0]);
    paint(x, g);
    x.fillStyle = P[3];
    [[12, 9, 4, 1], [10, 10, 2, 1], [9, 11, 1, 3], [8, 13, 1, 3]].forEach(r => x.fillRect(...r));
    return c;
  }

  function makePanel() {
    const [c, x] = canvasOf(238, 126);
    const rr = (i, col) => { x.fillStyle = col; x.fillRect(i + 2, i, 238 - 2 * i - 4, 126 - 2 * i); x.fillRect(i, i + 2, 238 - 2 * i, 126 - 2 * i - 4); x.fillRect(i + 1, i + 1, 238 - 2 * i - 2, 126 - 2 * i - 2); };
    rr(0, O); rr(2, '#fcf8c8'); rr(5, '#cfc67e'); rr(6, '#ded895');
    disc(x, 54, 66, 22, '#c9c07a');
    disc(x, 54, 67, 21, '#e4dea2');
    const lab = (s, rx, y) => { const t = text(s, 1, 1, '#e2622c', []); x.drawImage(t, rx - t.width, y); };
    const m = text('MEDAL', 1, 1, '#e2622c', []);
    x.drawImage(m, 54 - (m.width >> 1), 26);
    lab('SCORE', 210, 22);
    lab('BEST', 210, 66);
    return c;
  }

  function makeTutorial(ghost) {
    const [c, x] = canvasOf(114, 98);
    x.drawImage(ghost, 33, -10);
    const g = grid(114, 98);
    rast(g, poly([[57, 27], [48, 37], [53.5, 37], [53.5, 45], [60.5, 45], [60.5, 37], [66, 37]]), '#ffffff', O);
    const hand = (xx, yy) => (xx >= 52 && xx < 62 && yy >= 52 && yy < 72 && !(yy < 54 && (xx < 53 || xx >= 61))) || ell(58, 79, 13, 11)(xx, yy) || ell(46, 72, 4, 5, -0.5)(xx, yy);
    rast(g, hand, (xx, yy) => yy > 86 ? '#e0e0e0' : '#ffffff', O);
    rast(g, box(56, 66, 57, 71), '#cfcfcf');
    rast(g, box(51, 72, 66, 73), '#e2e2e2');
    paint(x, g);
    const tap = text('TAP', 2, 2, '#fa6a4a', [['#ffffff', 1], [O, 1]]);
    x.drawImage(tap, 4, 62);
    x.drawImage(tap, 110 - tap.width, 62);
    return c;
  }

  function makeSpark(k) {
    const [c, x] = canvasOf(10, 10);
    x.fillStyle = '#ffffff';
    if (k === 0) x.fillRect(4, 4, 2, 2);
    else if (k === 1) { x.fillRect(4, 2, 2, 6); x.fillRect(2, 4, 6, 2); }
    else { x.fillRect(4, 0, 2, 10); x.fillRect(0, 4, 10, 2); x.fillRect(2, 2, 1, 1); x.fillRect(7, 2, 1, 1); x.fillRect(2, 7, 1, 1); x.fillRect(7, 7, 1, 1); }
    return c;
  }

  function makePause(resume) {
    const g = grid(26, 28);
    rast(g, box(0, 0, 26, 28), (x, y) => x < 2 || y < 2 || x > 23 || y > 25 ? '#ffffff' : y < 13 ? '#fca048' : '#e86101', O);
    if (resume) rast(g, poly([[9, 7], [9, 21], [19, 14]]), '#ffffff', O);
    else { rast(g, box(7, 7, 12, 21), '#ffffff', O); rast(g, box(14, 7, 19, 21), '#ffffff', O); }
    return toCanvas(g);
  }

  let SPR = null;
  function sprites() {
    if (SPR) return SPR;
    const ghost = birdSprite(GHOST, 1);
    const [pipeUp, pipeDown] = makePipes();
    const newTag = (() => {
      const [c, x] = canvasOf(32, 14);
      x.fillStyle = O; x.fillRect(1, 0, 30, 14); x.fillRect(0, 1, 32, 12);
      x.fillStyle = '#f04b3a'; x.fillRect(2, 1, 28, 12); x.fillRect(1, 2, 30, 10);
      x.fillStyle = '#ff7a5e'; x.fillRect(2, 2, 28, 1);
      const t = text('NEW', 1, 1, '#ffffff', []);
      x.drawImage(t, 16 - (t.width >> 1), 4);
      return c;
    })();
    SPR = {
      bg: [makeBg(false), makeBg(true)],
      land: makeLand(), pipeUp, pipeDown,
      bird: BIRD_PAL.map(p => [0, 1, 2].map(f => birdSprite(p, f))),
      big: DIG.map(d => styled(maskOf([d], 4, 4), '#ffffff', [['#000000', 2]])),
      small: DIG.map(d => styled(maskOf([d], 2, 2), '#ffffff', [['#000000', 1]])),
      title: text('Flappy Bird', 4, 4, (x, y, h) => y < 4 ? '#fff3a6' : y < h * .5 ? '#ffe14d' : '#f9b72a', [['#ffffff', 2], [O, 2]]),
      ready: text('Get Ready!', 3, 4, (x, y, h) => y < 4 ? '#c9f78e' : y < h * .45 ? '#7bdc4f' : '#3fae3c', [['#ffffff', 2], [O, 2]]),
      over: text('Game Over', 4, 5, (x, y, h) => y < h * .45 ? '#fca048' : '#e86101', [['#ffffff', 2], [O, 2]]),
      tutorial: makeTutorial(ghost),
      play: makeButton('play'), board: makeButton('board'), pause: [makePause(false), makePause(true)],
      panel: makePanel(), newTag,
      medals: [0, 1, 2, 3].map(makeMedal),
      spark: [0, 1, 2].map(makeSpark)
    };
    return SPR;
  }

  const EASE = { 5: t => (t - 1) ** 3 + 1, 11: t => (t - 1) ** 5 + 1 };
  const tween = () => ({ done: true, value: 0, from: 0, to: 0, ease: 0, total: 1, count: 0 });
  function twStart(t, from, to, ease, secs) {
    t.from = from; t.to = to; t.ease = ease; t.total = Math.trunc(60 * secs); t.count = 0; t.done = false; t.value = from;
  }
  function twTick(t) {
    if (t.done) return;
    t.count++;
    let p = t.count / t.total;
    if (t.ease) p = EASE[t.ease](Math.trunc(p * 100) / 100);
    t.value = t.from + p * (t.to - t.from);
    if (t.count === t.total) { t.done = true; t.value = t.to; }
  }
  const anim = (frames, fps, loop) => ({ frames, delay: Math.trunc(1000 / fps), loop, el: 0, i: 0, done: false });
  const animReset = a => { a.el = 0; a.i = 0; a.done = false; };
  function animTick(a) {
    if (a.done) return;
    a.el += 15;
    if (a.el < a.delay) return;
    a.el = 0;
    if (++a.i >= a.frames.length) { if (!a.loop) a.done = true; a.i = 0; }
  }
  const hits = (ax, ay, aw, ah, bx, by, bw, bh) => ax + aw >= bx && ax <= bx + bw && ay + ah >= by && ay <= by + bh;

  Ameplay.register({
    id: 'flap-bird',
    title: 'Flap Bird',
    category: 'Arcade',
    tint: '#4ec0ca',
    blurb: 'Tap to flap through the gaps between the pipes. Harder than it looks.',
    help: '<kbd>Space</kbd> / <kbd>↑</kbd> / click / tap to flap',
    better: 'high',
    width: 600,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="30" cy="34" rx="18" ry="14"/><circle cx="38" cy="27" r="6"/><circle cx="40" cy="27" r="1.6" fill="currentColor"/><path d="M45 35l11 2-11 4z"/><path d="M14 34c5-6 12-6 14 0-3 5-10 6-14 0z"/><path d="M27 20c-1-4 2-6 4-6"/></svg>',
    css: '',
    mount(root, api) {
      const { W, H } = CFG, STEP = 1 / CFG.HZ, F = Math.fround;
      const S = sprites();
      const view = api.canvas(W * 2, H * 2);
      const canvas = view.canvas, vctx = view.ctx;
      const [low, c] = canvasOf(W, H);
      const [mid, mctx] = canvasOf(1, 1);

      let ac = null, master = null, noiseBuf = null;
      function audio() {
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
          noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = noiseBuf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function env(g, t, vol, att, dur) {
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + att);
        g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      }
      function tone(t, dur, type, f0, f1, vol, att = .004) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        env(g, t, vol, att, dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
      }
      function hiss(t, dur, type, f0, f1, q, vol, att = .006) {
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noiseBuf; f.type = type; f.Q.value = q;
        f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
        env(g, t, vol, att, dur);
        s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
      }
      function sfx(name) {
        if (api.muted || !audio()) return;
        const t = ac.currentTime + .005;
        if (name === 'wing') { hiss(t, .1, 'bandpass', 2600, 650, 1.3, .55, .008); tone(t, .07, 'sine', 380, 160, .1); }
        else if (name === 'point') {
          tone(t, .08, 'square', 987.8, 987.8, .045); tone(t, .08, 'sine', 987.8, 987.8, .16);
          tone(t + .075, .38, 'square', 1318.5, 1318.5, .04); tone(t + .075, .42, 'sine', 1318.5, 1318.5, .17);
        } else if (name === 'hit') {
          hiss(t, .14, 'lowpass', 4200, 500, .7, .7, .002); tone(t, .16, 'triangle', 240, 55, .45, .002); tone(t, .035, 'square', 1400, 300, .12, .001);
        } else if (name === 'die') {
          tone(t, .55, 'triangle', 820, 130, .26, .01); tone(t, .55, 'sine', 410, 70, .14, .01); hiss(t, .5, 'bandpass', 1800, 260, 1.2, .18, .02);
        } else if (name === 'swoosh') {
          hiss(t, .34, 'bandpass', 420, 3200, .9, .32, .17); hiss(t + .1, .3, 'highpass', 5000, 1500, .6, .08, .1);
        }
      }

      const pipes = CFG.PIPE_START.map(x => ({ x, y: 274 }));
      const mkBird = () => ({ x: 0, y: 0, v: 0, g: 1, rot: 0, rs: 0, ra: CFG.ROT_ACC, dead: false, idle: true, phase: 0, bob: 0, color: 0, anim: null, fa: anim(CFG.WING, CFG.FLAP_FPS, false), ia: anim(CFG.WING, CFG.IDLE_FPS, true), out: false, pts: 0, at: 0 });
      const bird = mkBird();
      const fade = tween(), flash = tween();
      const ready = { on: false, stage: 0, tw: tween() };
      const over = { on: false, stage: 0, tw: tween(), y: 0, v: 0, a: 0 };
      const panel = { on: false, stage: 0, tw: tween(), target: 0, best: 0, score: 0, rec: false, x: 25, y: 504, medal: -1, blink: 30 };
      const sparks = Array.from({ length: 10 }, () => ({ on: false, x: 0, y: 0, a: anim([0, 1, 2, 1, 0], 10, false) }));
      const play = { x: 20, y: 340, w: 116, h: 70 }, board = { x: 152, y: 340, w: 116, h: 70 };
      const evq = [];
      let menu = true, score = 0, speed = 0, hidden = 1, land = 0, night = false, fadeEvent = 0, buttons = false;
      let best = api.best || 0, sparkIdx = 0, pressed = null, submitted = false, acc = 0, paused = false;
      const pbtn = { x: 14, y: 14, w: 26, h: 28 };
      const canPause = () => !menu && !bird.idle && !bird.dead && speed > 0;

      const rnd = (a, b) => a + Math.floor(Math.random() * (b - a));
      const queue = (id, d) => evq.push({ id, d });

      function birdReset() {
        Object.assign(bird, { x: CFG.BIRD_X, y: CFG.BIRD_Y, rot: 0, v: 0, g: 1, ra: CFG.ROT_ACC, dead: false, idle: true, phase: 0, anim: bird.ia });
        animReset(bird.ia);
        bird.color = rnd(0, 3);
      }
      function flap() {
        bird.idle = false;
        if (bird.y < 0 || bird.dead) return;
        bird.anim = bird.fa; animReset(bird.fa);
        bird.v = CFG.FLAP_V; bird.g = CFG.GRAVITY; bird.rs = CFG.ROT_FLAP; bird.ra = CFG.ROT_ACC;
        sfx('wing');
      }
      function birdTick() {
        animTick(bird.anim);
        if (bird.idle) {
          bird.phase += CFG.BOB_DEG;
          if (bird.phase === 360) bird.phase = 0;
          bird.bob = F(SIN[bird.phase] * CFG.BOB_AMP);
          return;
        }
        bird.bob = 0;
        bird.v = F(bird.v + bird.g);
        if (bird.v > CFG.MAX_FALL) bird.v = CFG.MAX_FALL;
        bird.y = Math.trunc(F(bird.y + bird.v));
        if (bird.y > CFG.FLOOR) { bird.y = CFG.FLOOR; bird.g = 0; bird.v = 0; }
        bird.rot = F(bird.rot + bird.rs);
        bird.rs = F(bird.rs + bird.ra);
        if (bird.rot < CFG.ROT_MIN) bird.rot = CFG.ROT_MIN;
        if (bird.rot > CFG.ROT_MAX) bird.rot = CFG.ROT_MAX;
      }

      function transition(toBlack, ev, secs) {
        if (!fade.done) return;
        twStart(fade, toBlack ? 0 : 1, toBlack ? 1 : 0, 5, secs);
        twTick(fade);
        fadeEvent = ev;
      }
      function menuReset() {
        night = Math.random() >= CFG.DAY_CHANCE;
        buttons = true; menu = true;
        ready.on = over.on = panel.on = false;
        sparks.forEach(s => { s.on = false; });
        sparkIdx = 0; land = 0; speed = CFG.SPEED; hidden = 1; score = 0;
        birdReset();
      }
      function fire(id) {
        if (id === 2) {
          if (!submitted) { submitted = true; api.submit(score); }
          over.on = true; twStart(over.tw, 0, 1, 11, 1);
          over.y = -1; over.v = -2; over.a = .25; over.stage = 0;
          sfx('swoosh');
        } else if (id === 3) sfx('die');
        else if (id === 5) {
          menuReset();
          buttons = false; menu = false;
          transition(false, 0, .5);
          ready.on = true; ready.stage = 0; twStart(ready.tw, 0, 1, 0, .5);
          submitted = false;
          api.score(0);
        }
      }
      function startPlay() {
        if (!fade.done) return;
        transition(true, 5, .5);
        sfx('swoosh');
      }
      function hit(pipe, markDead) {
        if (flash.done) { twStart(flash, 1, 0, 11, 1); twTick(flash); }
        if (markDead) bird.dead = true;
        speed = 0;
        sfx('hit');
        if (pipe) queue(3, CFG.DIE_DELAY);
        queue(2, CFG.OVER_DELAY);
      }
      function flapInput() {
        if (menu) return;
        if (!bird.idle) { if (speed > 0) flap(); }
        else if (ready.on && ready.stage === 1) {
          ready.stage = 2; twStart(ready.tw, 1, 0, 0, .5);
          flap();
        }
      }

      function movePipes() {
        for (const p of pipes) p.x -= speed;
        const f = pipes[0];
        if (speed > 0 && hidden <= 0 && (f.x === bird.x || f.x === bird.x - 1)) {
          score++; api.score(score); sfx('point');
        }
        if (f.x < -CFG.PIPE_W) {
          const p = pipes.shift();
          p.x = pipes[1].x + CFG.SPACING; p.y = rnd(CFG.GAP_MIN, CFG.GAP_MAX);
          pipes.push(p);
          if (hidden > 0 && --hidden === 0) pipes[0].x = pipes[1].x = -CFG.PIPE_W;
        }
      }
      function collisions() {
        const B = CFG.BOX, top = CFG.GAP + CFG.PIPE_H;
        if (bird.y >= CFG.FLOOR && speed > 0) hit(false, false);
        if (bird.dead || hidden > 0 || speed <= 0) return;
        const [a, b] = pipes;
        if (hits(bird.x, bird.y, B, B, a.x, a.y - top, CFG.PIPE_W, CFG.PIPE_H)) hit(true, false);
        else if (hits(bird.x, bird.y, B, B, a.x, a.y, CFG.PIPE_W, CFG.PIPE_H)) hit(true, true);
        if (hits(bird.x, bird.y, B, B, b.x, b.y - top, CFG.PIPE_W, CFG.PIPE_H) || hits(bird.x, bird.y, B, B, b.x, b.y, CFG.PIPE_W, CFG.PIPE_H)) hit(true, true);
      }
      function medalFor(s) { let m = -1; CFG.MEDAL_AT.forEach((v, i) => { if (s >= v) m = i; }); return m; }
      function panelTick() {
        if (!panel.on) return;
        if (!panel.tw.done) twTick(panel.tw);
        if (panel.stage === 0) {
          panel.y = Math.trunc(panel.tw.value);
          if (panel.tw.done) {
            if (panel.target <= 0) panel.stage = 2;
            else { panel.stage = 1; twStart(panel.tw, 0, panel.target, 0, .5); }
          }
        } else if (panel.stage === 1) {
          panel.score = Math.trunc(panel.tw.value);
          if (panel.tw.done) {
            panel.stage = 2;
            if (panel.score > best) best = panel.score;
            if (panel.score > panel.best) { panel.best = panel.score; panel.rec = true; }
            panel.medal = medalFor(panel.score);
          }
        } else if (panel.medal >= 0 && --panel.blink <= 0) {
          panel.blink = 30;
          const s = sparks[sparkIdx];
          s.on = true; s.x = panel.x + 29 + rnd(0, 50); s.y = panel.y + 41 + rnd(0, 50); animReset(s.a);
          sparkIdx = (sparkIdx + 1) % sparks.length;
        }
      }

      function tick() {
        for (let i = 0; i < evq.length; i++) {
          const e = evq[i];
          e.d -= CFG.EVENT_STEP;
          if (e.d <= 0) { evq.splice(i--, 1); fire(e.id); }
        }
        land -= speed;
        if (land <= -CFG.LAND_LOOP) land = 0;
        if (!bird.idle) movePipes();
        birdTick();
        if (menu) { bird.x = CFG.MENU_X; bird.y = CFG.MENU_Y; }
        else collisions();
        if (panel.on && panel.stage === 2 && !buttons) buttons = true;
        if (over.on) {
          twTick(over.tw);
          if (over.y < 0) { over.y = Math.trunc(over.y + over.v); over.v += over.a; } else over.y = 0;
          if (over.stage === 0 && over.tw.done) {
            over.stage = 1;
            Object.assign(panel, { on: true, target: score, best, score: 0, rec: false, x: 25, y: 504, stage: 0, medal: -1, blink: 30 });
            twStart(panel.tw, 504, 193, 11, .5);
            sfx('swoosh');
          }
        }
        if (ready.on) { twTick(ready.tw); if (ready.stage === 0 && ready.tw.done) ready.stage = 1; }
        panelTick();
        for (const s of sparks) if (s.on) { animTick(s.a); if (s.a.done) s.on = false; }
        if (!fade.done) { twTick(fade); if (fade.done) fire(fadeEvent); }
        if (!flash.done) twTick(flash);
      }

      function blitIn(img, rx, ry, rw, rh, a = 1) {
        if (a <= 0) return;
        c.globalAlpha = Math.min(1, a);
        c.drawImage(img, rx + ((rw - img.width) >> 1), ry + ((rh - img.height) >> 1));
        c.globalAlpha = 1;
      }
      function drawBird() {
        const img = S.bird[bird.color][bird.anim.done ? 1 : bird.anim.frames[bird.anim.i]];
        const bx = bird.x - 14, by = bird.y - 14 + Math.trunc(bird.bob), r = Math.trunc(bird.rot);
        if (!r) { c.drawImage(img, bx, by); return; }
        c.save(); c.translate(bx + 24, by + 24); c.rotate(r * Math.PI / 180); c.drawImage(img, -24, -24); c.restore();
      }
      function bigNumber(v, cx = 144) {
        const ds = String(v);
        let w = 2;
        for (const d of ds) w += S.big[d].width - 2;
        let x = cx - (w >> 1);
        for (const d of ds) { c.drawImage(S.big[d], x, 78); x += S.big[d].width - 2; }
      }
      function smallNumber(v, right, y) {
        const ds = String(v);
        let x = right;
        for (let i = ds.length - 1; i >= 0; i--) { const img = S.small[ds[i]]; x -= img.width; c.drawImage(img, x, y); x -= 1; }
      }
      function draw() {
        c.drawImage(S.bg[night ? 1 : 0], 0, 0);
        if (menu) {
          blitIn(S.title, 0, 150, W, 48);
          drawBird();
        } else {
          if (hidden <= 0) for (const p of pipes) if (p.x > -CFG.PIPE_W && p.x < W) {
            c.drawImage(S.pipeUp, p.x, p.y);
            c.drawImage(S.pipeDown, p.x, p.y - CFG.GAP - CFG.PIPE_H);
          }
          if (over.on) blitIn(S.over, 0, 130 + over.y, W, 54, over.tw.value);
          else bigNumber(score);
          drawBird();
          if (canPause()) c.drawImage(S.pause[paused ? 1 : 0], pbtn.x, pbtn.y);
        }
        c.drawImage(S.land, land, CFG.LAND_Y);
        if (ready.on && ready.tw.value > 0) {
          blitIn(S.ready, 0, 146, W, 62, ready.tw.value);
          blitIn(S.tutorial, 87, 220, 114, 98, ready.tw.value);
        }
        if (buttons) {
          c.drawImage(S.play, play.x, play.y + (pressed === 'play' ? 2 : 0));
          c.drawImage(S.board, board.x, board.y + (pressed === 'board' ? 2 : 0));
        }
        if (panel.on) {
          c.drawImage(S.panel, panel.x, panel.y);
          smallNumber(panel.score, panel.x + 210, panel.y + 34);
          smallNumber(panel.best, panel.x + 210, panel.y + 77);
          if (panel.rec) c.drawImage(S.newTag, panel.x + 142, panel.y + 62);
          if (panel.medal >= 0) c.drawImage(S.medals[panel.medal], panel.x + 32, panel.y + 44);
        }
        for (const s of sparks) if (s.on) c.drawImage(S.spark[s.a.frames[s.a.i]], s.x - 4, s.y - 4);
        if (fade.value > 0) { c.globalAlpha = fade.value; c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
        if (flash.value > 0) { c.globalAlpha = flash.value; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
      }
      function present() {
        const r = canvas.getBoundingClientRect();
        if (!r.width) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const tw = Math.max(1, Math.round(r.width * dpr)), th = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== tw || canvas.height !== th) { canvas.width = tw; canvas.height = th; }
        vctx.setTransform(1, 0, 0, 1, 0, 0);
        const k = Math.ceil(tw / W);
        if (tw % W === 0 || tw >= W * 3) {
          vctx.imageSmoothingEnabled = false;
          vctx.drawImage(low, 0, 0, tw, th);
          return;
        }
        if (mid.width !== W * k) { mid.width = W * k; mid.height = H * k; }
        mctx.imageSmoothingEnabled = false;
        mctx.drawImage(low, 0, 0, W * k, H * k);
        vctx.imageSmoothingEnabled = true;
        vctx.imageSmoothingQuality = 'high';
        vctx.drawImage(mid, 0, 0, tw, th);
      }

      const local = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
      const inside = (b, p) => p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h;
      api.on(canvas, 'pointerdown', e => {
        if (e.button > 0) return;
        e.preventDefault();
        audio();
        if (buttons) { pressed = inside(board, local(e)) ? 'board' : 'play'; return; }
        const lp = local(e);
        if (canPause() && lp.x > pbtn.x - 6 && lp.x < pbtn.x + pbtn.w + 6 && lp.y > pbtn.y - 6 && lp.y < pbtn.y + pbtn.h + 6) { paused = !paused; acc = 0; return; }
        if (paused) return;
        flapInput();
      });
      api.on(window, 'pointerup', e => {
        if (!pressed) return;
        const what = pressed, p = local(e);
        pressed = null;
        if (!buttons) return;
        if (what === 'board') { if (inside(board, p)) { sfx('swoosh'); api.toast('Best score: ' + best); } }
        else if (!inside(board, p)) startPlay();
      });
      api.on(window, 'pointercancel', () => { pressed = null; });
      const KEYS = new Set(['Space', 'ArrowUp', 'KeyW', 'Enter', 'NumpadEnter']);
      api.on(window, 'keydown', e => {
        if (!KEYS.has(e.code) || e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        e.preventDefault();
        if (e.repeat) return;
        audio();
        if (paused) { paused = false; acc = 0; return; }
        if (buttons) startPlay(); else flapInput();
      });
      menuReset();
      transition(false, 0, .5);
      api.score(0);
      api.loop(dt => {
        if (!paused) acc += dt;
        while (acc >= STEP - .001) { tick(); acc -= STEP; }
        draw();
        present();
      });

      root.__fb = {
        snap: () => ({ menu, score, speed, hidden, buttons, night, best, bird: { ...bird, anim: undefined }, pipes: pipes.map(p => ({ ...p })), ready: ready.stage, over: over.on, panel: { on: panel.on, stage: panel.stage, y: panel.y, score: panel.score, medal: panel.medal, rec: panel.rec }, fade: fade.value, flash: flash.value }),
        setScore: v => { score = v; api.score(v); },
        S
      };

      return {
        destroy() {
          delete root.__fb;
          if (ac) { try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {} ac = null; }
        }
      };
    }
  });

  Ameplay.covers['flap-bird'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern id="fpb-st" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="skewX(-45)"><rect width="16" height="16" fill="#9ce659"/><rect width="8" height="16" fill="#73bf2e"/></pattern>
<linearGradient id="fpb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46b8c4"/><stop offset="1" stop-color="#5cc8d0"/></linearGradient>
<g id="fpb-pipe"><rect x="4" y="0" width="62" height="400" fill="#73bf2e" stroke="#543847" stroke-width="3"/><rect x="9" width="5" height="400" fill="#e4fd8b"/><rect x="15" width="10" height="400" fill="#9ce659"/><rect x="48" width="16" height="400" fill="#558022"/><rect x="52" width="4" height="400" fill="#73bf2e"/></g>
<g id="fpb-cap"><rect x="-2" y="0" width="74" height="28" fill="#73bf2e" stroke="#543847" stroke-width="3"/><rect x="3" y="2" width="6" height="22" fill="#e4fd8b"/><rect x="10" y="2" width="12" height="22" fill="#9ce659"/><rect x="52" y="2" width="18" height="22" fill="#558022"/><rect x="0" y="21" width="70" height="5" fill="#558022"/></g>
</defs>
<rect width="400" height="300" fill="url(#fpb-sky)"/>
<path d="M0 214a20 20 0 0 1 34-12a24 24 0 0 1 44-6a20 20 0 0 1 38 4a26 26 0 0 1 48-4a20 20 0 0 1 36 2a24 24 0 0 1 44-2a22 22 0 0 1 40 0a26 26 0 0 1 48 2a20 20 0 0 1 36 4a18 18 0 0 1 32 6V260H0z" fill="#e9fcd9"/>
<g fill="#c4eac2" stroke="#a1d9b0" stroke-width="2"><rect x="8" y="214" width="26" height="40"/><rect x="40" y="224" width="20" height="30"/><rect x="128" y="208" width="24" height="46"/><rect x="156" y="222" width="30" height="32"/><rect x="232" y="212" width="22" height="42"/><rect x="258" y="226" width="26" height="28"/><rect x="368" y="216" width="24" height="38"/></g>
<g fill="#e2f7da"><rect x="13" y="220" width="5" height="5"/><rect x="23" y="220" width="5" height="5"/><rect x="13" y="231" width="5" height="5"/><rect x="133" y="214" width="5" height="5"/><rect x="142" y="214" width="5" height="5"/><rect x="133" y="225" width="5" height="5"/><rect x="237" y="218" width="5" height="5"/><rect x="246" y="229" width="5" height="5"/><rect x="373" y="222" width="5" height="5"/><rect x="382" y="233" width="5" height="5"/></g>
<path d="M-4 252a16 16 0 0 1 28-10a18 18 0 0 1 32-2a15 15 0 0 1 28 0a18 18 0 0 1 32 2a16 16 0 0 1 30-2a18 18 0 0 1 32 0a15 15 0 0 1 28 2a18 18 0 0 1 32-2a16 16 0 0 1 30 0a18 18 0 0 1 32 2a15 15 0 0 1 28-2a18 18 0 0 1 34 4V262H-4z" fill="#64e268" stroke="#4fc75a" stroke-width="3"/>
<use href="#fpb-pipe" x="34" y="-320"/><use href="#fpb-cap" x="34" y="66"/>
<use href="#fpb-pipe" x="34" y="196"/><use href="#fpb-cap" x="34" y="182"/>
<use href="#fpb-pipe" x="292" y="-370"/><use href="#fpb-cap" x="292" y="16"/>
<use href="#fpb-pipe" x="292" y="148"/><use href="#fpb-cap" x="292" y="134"/>
<rect y="252" width="400" height="48" fill="#ded895"/>
<rect y="252" width="400" height="20" fill="url(#fpb-st)"/>
<rect y="250" width="400" height="4" fill="#543847"/><rect y="254" width="400" height="3" fill="#e4fd8b"/>
<rect y="272" width="400" height="4" fill="#558022"/><rect y="276" width="400" height="4" fill="#c9b965"/>
<g stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".75"><path d="M118 118h34"/><path d="M106 140h40"/><path d="M122 162h26"/></g>
<g transform="rotate(-16 210 140)">
<path d="M190 98q4-14 16-12q-8 4-6 12z" fill="#f8c22e" stroke="#543847" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="206" cy="142" rx="50" ry="38" fill="#f8c22e" stroke="#543847" stroke-width="5"/>
<path d="M164 160a50 38 0 0 0 84 0q-42 22-84 0z" fill="#e0861c"/>
<ellipse cx="222" cy="160" rx="30" ry="15" fill="#fff3c4"/>
<path d="M170 122q18-22 40-18q-10-8-24-6q-12 6-16 24z" fill="#fde27a"/>
<ellipse cx="166" cy="134" rx="26" ry="15" transform="rotate(-24 166 134)" fill="#fffdf0" stroke="#543847" stroke-width="4.5"/>
<path d="M148 142q16 6 34-4" fill="none" stroke="#f2dca0" stroke-width="5" stroke-linecap="round"/>
<circle cx="234" cy="120" r="20" fill="#ffffff" stroke="#543847" stroke-width="4.5"/>
<rect x="238" y="110" width="7" height="16" rx="2" fill="#543847"/>
<ellipse cx="218" cy="146" rx="7" ry="4" fill="#ff9c8a"/>
<path d="M236 136l40 9l-40 15z" fill="#ff9a2a" stroke="#543847" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M238 146l26 2" stroke="#543847" stroke-width="3.5" stroke-linecap="round"/>
<path d="M240 149l26-2l-28 11z" fill="#ef6a1e"/>
</g>
<g fill="#ffffff"><path d="M330 92l4 10l10 4l-10 4l-4 10l-4-10l-10-4l10-4z"/><path d="M110 66l3 7l7 3l-7 3l-3 7l-3-7l-7-3l7-3z" opacity=".85"/></g>
</svg>`;
})();

