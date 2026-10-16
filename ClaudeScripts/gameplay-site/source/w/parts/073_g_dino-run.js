
(() => {
  'use strict';

  const CFG = {
    W: 600, H: 150, FPS: 60, BOTTOM_PAD: 10,
    SPEED: 6, MAX_SPEED: 13, ACCELERATION: 0.001, MOBILE_SPEED_COEFFICIENT: 1.2,
    GAP_COEFFICIENT: 0.6, MAX_GAP_COEFFICIENT: 1.5, MAX_OBSTACLE_LENGTH: 3, MAX_OBSTACLE_DUPLICATION: 2,
    CLEAR_TIME: 3000, GAMEOVER_CLEAR_TIME: 750, INTRO_MS: 400,
    INVERT_DISTANCE: 700, INVERT_FADE_DURATION: 12000,
    TREX: {
      WIDTH: 44, HEIGHT: 47, WIDTH_DUCK: 59, HEIGHT_DUCK: 25, GRAVITY: 0.6, INITIAL_JUMP_VELOCITY: -10,
      DROP_VELOCITY: -5, MIN_JUMP_HEIGHT: 30, MAX_JUMP_HEIGHT: 30, SPEED_DROP_COEFFICIENT: 3,
      START_X_POS: 50, INTRO_DURATION: 1500, BLINK_TIMING: 7000, MAX_BLINK_COUNT: 3
    },
    ANIM: { W: 1000 / 3, R: 1000 / 12, D: 1000 / 8, J: 1000 / 60, C: 1000 / 60 },
    CLOUD: { WIDTH: 46, HEIGHT: 14, MIN_GAP: 100, MAX_GAP: 400, MAX_SKY: 30, MIN_SKY: 71, SPEED: 0.2, FREQUENCY: 0.5, MAX: 6 },
    HORIZON: { WIDTH: 600, YPOS: 127, LINE: 9, BUMPY: 0.5 },
    NIGHT: { FADE_SPEED: 0.035, MOON_SPEED: 0.25, STAR_SPEED: 0.3, STAR_MAX_Y: 70, NUM_STARS: 2, MOON_Y: 30, WIDTH: 20 },
    METER: { WIDTH: 10, DEST_WIDTH: 11, UNITS: 5, ACHIEVEMENT: 100, COEFFICIENT: 0.025, FLASH_MS: 250, FLASH_ITER: 3, Y: 10 },
    OBSTACLES: [
      { type: 'CACTUS_SMALL', width: 17, height: 35, yPos: 105, multipleSpeed: 4, minGap: 120, minSpeed: 0,
        boxes: [[0, 7, 5, 27], [4, 0, 6, 34], [10, 4, 7, 14]] },
      { type: 'CACTUS_LARGE', width: 25, height: 50, yPos: 90, multipleSpeed: 7, minGap: 120, minSpeed: 0,
        boxes: [[0, 12, 7, 38], [8, 0, 7, 49], [13, 10, 10, 38]] },
      { type: 'PTERODACTYL', width: 46, height: 40, yPos: [100, 75, 50], yPosMobile: [100, 50], multipleSpeed: 999,
        minSpeed: 8.5, minGap: 150, numFrames: 2, frameRate: 1000 / 6, speedOffset: 0.8,
        boxes: [[15, 15, 16, 5], [18, 21, 24, 6], [2, 14, 4, 3], [6, 10, 4, 7], [10, 8, 6, 9]] }
    ],
    TREX_BOXES: {
      DUCKING: [[1, 18, 55, 25]],
      RUNNING: [[22, 0, 17, 16], [1, 18, 30, 9], [10, 35, 14, 8], [1, 24, 29, 5], [5, 30, 21, 4], [9, 34, 15, 4]]
    }
  };
  const INK = '#535353';

  const HEAD = [[24, 0, 18, 1], [23, 1, 20, 1], [22, 2, 22, 8], [22, 10, 9, 1], [22, 11, 15, 2], [22, 13, 8, 1]];
  const HEAD_DEAD = [[24, 0, 18, 1], [23, 1, 20, 1], [22, 2, 22, 8], [22, 10, 9, 1], [22, 11, 8, 1], [22, 12, 16, 2]];
  const BODY = [[21, 14, 9, 1], [20, 15, 10, 1], [0, 16, 1, 2], [19, 16, 11, 1], [17, 17, 13, 1], [0, 18, 2, 1], [15, 18, 15, 1],
    [30, 19, 4, 2], [32, 21, 2, 2], [0, 19, 3, 1], [13, 19, 17, 1], [0, 20, 4, 1], [11, 20, 19, 1], [0, 21, 6, 1], [9, 21, 21, 1],
    [0, 22, 30, 3], [1, 25, 28, 1], [2, 26, 27, 1], [3, 27, 25, 1], [4, 28, 23, 1], [5, 29, 22, 1], [6, 30, 20, 1], [7, 31, 19, 1],
    [8, 32, 17, 1], [9, 33, 15, 1], [10, 34, 14, 1], [10, 35, 13, 1]];
  const legDown = x => [[x, 36, 4, 9], [x, 45, 6, 2]];
  const legUp = x => [[x, 36, 4, 4], [x, 40, 6, 2]];
  const TREX = {
    stand: HEAD.concat(BODY, legDown(10), legDown(19)),
    runA: HEAD.concat(BODY, legUp(10), legDown(19)),
    runB: HEAD.concat(BODY, legDown(10), legUp(19)),
    dead: HEAD_DEAD.concat(BODY, legDown(10), legDown(19))
  };
  const EYE = [[26, 3, 2, 2]], EYE_DEAD = [[25, 2, 4, 1], [25, 5, 4, 1], [25, 3, 1, 2], [28, 3, 1, 2]];
  const DUCK_BODY = [[42, 18, 16, 1], [41, 19, 18, 7], [41, 26, 10, 1], [41, 27, 15, 2], [41, 29, 8, 1],
    [0, 20, 4, 1], [16, 20, 25, 1], [0, 21, 7, 1], [12, 21, 29, 1], [0, 22, 41, 6], [1, 28, 40, 1], [2, 29, 39, 1],
    [4, 30, 36, 1], [41, 30, 4, 1], [43, 31, 2, 2], [6, 31, 32, 1], [8, 32, 28, 1], [10, 33, 24, 1], [12, 34, 20, 1]];
  const dLegDown = x => [[x, 35, 4, 10], [x, 45, 6, 2]];
  const dLegUp = x => [[x, 35, 4, 6], [x, 41, 6, 2]];
  const DUCK = { a: DUCK_BODY.concat(dLegUp(13), dLegDown(26)), b: DUCK_BODY.concat(dLegDown(13), dLegUp(26)) };
  const DUCK_EYE = [[45, 20, 2, 2]];
  const PTERO_BODY = [[9, 9, 4, 1], [7, 10, 7, 1], [5, 11, 10, 1], [2, 12, 19, 1], [1, 13, 15, 1], [0, 14, 16, 1], [4, 15, 27, 1],
    [11, 16, 23, 1], [13, 17, 29, 1], [14, 18, 31, 1], [15, 19, 26, 1], [16, 20, 20, 1], [18, 21, 15, 1]];
  const PTERO = [PTERO_BODY.slice(), PTERO_BODY.slice()];
  for (let y = 2; y <= 14; y++) PTERO[0].push([16, y, y - 1, 1]);
  for (let y = 22; y <= 37; y++) PTERO[1].push([18, y, Math.max(1, 16 - (y - 22)), 1]);
  const PTERO_EYE = [[8, 11, 1, 1]];

  function cactus(W, H, tx, tw, l, r) {
    const out = [[tx, 1, tw, H - 1], [tx + 1, 0, tw - 2, 1]];
    const [lx, lw, lt, lb] = l, [rx, rw, rt, rb] = r;
    out.push([lx, lt, lw, lb - lt + 1], [lx + 1, lt - 1, lw - 2, 1], [lx, lb - 2, tx - lx + 1, 3]);
    out.push([rx, rt, rw, rb - rt + 1], [rx + 1, rt - 1, rw - 2, 1], [tx + tw - 1, rb - 2, rx + rw - tx - tw + 1, 3]);
    return out;
  }
  const SMALL = [[8, 20, 5, 15], [12, 22, 4, 12], [6, 17, 9, 19]].map(([a, b, c, d]) => cactus(17, 35, 5, 6, [1, 3, a, b], [12, 3, c, d]));
  const LARGE = [[12, 30, 10, 26], [16, 33, 8, 22], [10, 26, 14, 30]].map(([a, b, c, d]) => cactus(25, 50, 9, 7, [1, 4, a, b], [19, 4, c, d]));
  const SPINES_S = [[7, 6, 1, 1], [8, 14, 1, 1], [6, 22, 1, 1], [8, 28, 1, 1]];
  const SPINES_L = [[11, 6, 1, 1], [13, 15, 1, 1], [10, 24, 1, 1], [13, 33, 1, 1], [11, 41, 1, 1]];

  const FONT = {
    0: '..#####../.##...##./##.....##/##.....##/##.....##/##.....##/##.....##/##.....##/##.....##/.##...##./..#####..',
    1: '...##..../..###..../.####..../...##..../...##..../...##..../...##..../...##..../...##..../...##..../.######..',
    2: '..#####../.##...##./##.....##/.......##/......##./....###../..###..../.##....../##......./##......./#########',
    3: '#########/......##./.....##../....##.../...####../.......##/.......##/.......##/##.....##/.##...##./..#####..',
    4: '.....###./....####./...##.##./..##..##./.##...##./##....##./#########/......##./......##./......##./......##.',
    5: '########./##......./##......./#######../......##./.......##/.......##/.......##/##.....##/.##...##./..#####..',
    6: '...####../..##...../.##....../##......./##.####../###...##./##.....##/##.....##/##.....##/.##...##./..#####..',
    7: '#########/.......##/......##./.....##../....##.../...##..../...##..../..##...../..##...../..##...../..##.....',
    8: '..#####../.##...##./##.....##/.##...##./..#####../.##...##./##.....##/##.....##/##.....##/.##...##./..#####..',
    9: '..#####../.##...##./##.....##/##.....##/##.....##/.##...###/..####.##/.......##/......##./.....##../..####...',
    H: '##.....##/##.....##/##.....##/##.....##/##.....##/#########/##.....##/##.....##/##.....##/##.....##/##.....##',
    I: '.######../...##..../...##..../...##..../...##..../...##..../...##..../...##..../...##..../...##..../.######..',
    G: '..######./.##....##/##......./##......./##......./##..#####/##.....##/##.....##/##.....##/.##...###/..####.##',
    A: '...###.../..##.##../.##...##./##.....##/##.....##/##.....##/#########/##.....##/##.....##/##.....##/##.....##',
    M: '##.....##/###...###/####.####/##.###.##/##..#..##/##.....##/##.....##/##.....##/##.....##/##.....##/##.....##',
    E: '#########/##......./##......./##......./##......./########./##......./##......./##......./##......./#########',
    V: '##.....##/##.....##/##.....##/##.....##/##.....##/##.....##/.##...##./.##...##./..##.##../...###.../....#....',
    R: '########./##.....##/##.....##/##.....##/##....##./#######../##..##.../##...##../##....##./##.....##/##.....##',
    P: '########./##.....##/##.....##/##.....##/########./##......./##......./##......./##......./##......./##.......'
  };
  FONT.O = FONT[0];

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  function spr(w, h, rects, holes, col = INK) {
    const [c, x] = mk(w, h);
    x.fillStyle = col;
    for (const r of rects) x.fillRect(r[0], r[1], r[2], r[3]);
    if (holes) for (const r of holes) x.clearRect(r[0], r[1], r[2], r[3]);
    return c;
  }
  function maskSpr(w, h, test) {
    const [c, x] = mk(w, h);
    for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const v = test(i + 0.5, y + 0.5); if (v) { x.fillStyle = v; x.fillRect(i, y, 1, 1); } }
    return c;
  }
  const disc = (px, py, cx, cy, r) => (px - cx) ** 2 + (py - cy) ** 2 <= r * r;

  function buildSprites() {
    const S = {};
    S.stand = spr(44, 47, TREX.stand, EYE);
    S.blink = spr(44, 47, TREX.stand);
    S.runA = spr(44, 47, TREX.runA, EYE);
    S.runB = spr(44, 47, TREX.runB, EYE);
    S.dead = spr(44, 47, TREX.dead.concat([[26, 3, 2, 2]]), EYE_DEAD);
    S.duckA = spr(59, 47, DUCK.a, DUCK_EYE);
    S.duckB = spr(59, 47, DUCK.b, DUCK_EYE);
    S.ptero = PTERO.map(r => spr(46, 40, r, PTERO_EYE));
    S.small = SMALL.map(r => spr(17, 35, r, SPINES_S));
    S.large = LARGE.map(r => spr(25, 50, r, SPINES_L));
    S.cloud = maskSpr(46, 14, (x, y) => {
      const inside = (a, b) => disc(a, b, 14, 9, 5) || disc(a, b, 24, 7, 7) || disc(a, b, 33, 9, 5) || (a > 6 && a < 40 && b > 8 && b < 13.5);
      if (!inside(x, y)) return null;
      return inside(x - 1, y) && inside(x + 1, y) && inside(x, y - 1) && inside(x, y + 1) ? '#ffffff' : '#c9c9c9';
    });
    S.moon = [];
    for (let i = 0; i < 7; i++) {
      if (i === 3) {
        S.moon.push(maskSpr(40, 40, (x, y) => disc(x, y, 20, 20, 19.5) ? (disc(x, y, 13, 14, 3) || disc(x, y, 26, 26, 4) || disc(x, y, 25, 11, 2) ? '#6d6d6d' : INK) : null));
        continue;
      }
      const d = [5, 9, 14, 0, 14, 9, 5][i], right = i < 3;
      S.moon.push(maskSpr(20, 40, (x, y) => {
        const X = right ? 40 - (x + 20) : x;
        return disc(X, y, 20, 20, 19.5) && !disc(X, y, 20 + d, 20, 19.5) ? INK : null;
      }));
    }
    S.star = [spr(9, 9, [[4, 0, 1, 9], [0, 4, 9, 1], [3, 3, 3, 3]]), spr(9, 9, [[4, 1, 1, 7], [1, 4, 7, 1], [1, 1, 1, 1], [7, 1, 1, 1], [1, 7, 1, 1], [7, 7, 1, 1]])];
    S.restart = maskSpr(36, 32, (x, y) => {
      const rx = Math.min(x, 36 - x), ry = Math.min(y, 32 - y);
      if (rx < 3 && ry < 3 && (3 - rx) ** 2 + (3 - ry) ** 2 > 9) return null;
      const dx = x - 18, dy = y - 16, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      const ring = r >= 6 && r <= 9 && !(a > -1.25 && a < 0.1);
      const tri = x >= 20 && x <= 28 && Math.abs(y - 9) <= (28 - x) * 0.75;
      return ring || tri ? '#ffffff' : INK;
    });
    const glyph = (k, col = INK) => {
      const rows = FONT[k].split('/');
      return spr(rows[0].length, rows.length, rows.flatMap((row, y) => [...row].map((ch, x) => ch === '#' ? [x, y, 1, 1] : null).filter(Boolean)), null, col);
    };
    S.font = {};
    for (const k of Object.keys(FONT)) S.font[k] = glyph(k);
    S.ground = [0, 1].map(bumpy => {
      let seed = bumpy ? 977 : 31;
      const r = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296;
      const [c, x] = mk(600, 16);
      x.fillStyle = INK;
      const L = CFG.HORIZON.LINE, BUMP = [0, 1, 1, 2, 2, 3, 3, 3, 3, 3, 2, 2, 1, 1, 0];
      const off = new Int8Array(600);
      if (bumpy) for (let bx = 40; bx < 560; bx += 90 + (r() * 120 | 0)) for (let k = 0; k < BUMP.length; k++) off[bx + k] = BUMP[k];
      else for (let bx = 60; bx < 560; bx += 150 + (r() * 160 | 0)) { off[bx] = 1; off[bx + 1] = 1; }
      for (let i = 0; i < 600; i++) {
        x.fillRect(i, L - off[i], 1, 1);
        if (off[i] !== off[i - 1] && i > 0) { const a = Math.min(off[i], off[i - 1]), b = Math.max(off[i], off[i - 1]); x.fillRect(i, L - b, 1, b - a + 1); }
      }
      for (let i = 0; i < 600; i += 7 + (r() * 22 | 0)) {
        const y = L + 2 + (r() * 5 | 0), w = r() < 0.3 ? 2 + (r() * 3 | 0) : 1;
        x.fillRect(i, y, w, 1);
      }
      return c;
    });
    return S;
  }

  function svgRects(rects, ox, oy, s, fill) {
    return `<path fill="${fill}" d="${rects.map(r => `M${ox + r[0] * s} ${oy + r[1] * s}h${r[2] * s}v${r[3] * s}h${-r[2] * s}z`).join('')}"/>`;
  }
  function cover() {
    const s = 2.9, gy = 236, dy = gy - 47 * s - 86;
    const night = '<path d="M300 0H400V300H252z" fill="#202124"/>';
    const stars = [[330, 120], [376, 104], [318, 40]].map(([x, y]) => `<path fill="#bdbdbd" d="M${x - 2} ${y - 10}h4v20h-4zM${x - 10} ${y - 2}h20v4h-20z"/>`).join('');
    const moon = '<circle cx="360" cy="48" r="26" fill="#d8d8d8"/><circle cx="374" cy="40" r="24" fill="#202124"/>';
    const cl = (x, y) => `<path d="M${x} ${y + 30}h120a16 16 0 0 0-26-22a24 24 0 0 0-44-8a18 18 0 0 0-32 10a14 14 0 0 0-18 20z" fill="#fff" stroke="#cfcfcf" stroke-width="5"/>`;
    const ground = `<path d="M0 ${gy}h258" stroke="${INK}" stroke-width="4"/><path d="M258 ${gy}h50l14-10l14 10H400" fill="none" stroke="#9a9a9a" stroke-width="4"/>`;
    const pebbles = `<path fill="#9a9a9a" d="M30 ${gy + 14}h12v4H30zM120 ${gy + 22}h6v4h-6zM200 ${gy + 12}h14v4h-14zM330 ${gy + 24}h8v4h-8zM80 ${gy + 30}h4v4h-4z"/>`;
    const dino = svgRects(TREX.runB, 34, dy, s, INK) + svgRects(EYE, 34, dy, s, '#fff');
    const cs = 3.1, cac = svgRects(SMALL[1], 150, gy - 35 * cs + 6, cs, INK) + svgRects(SMALL[2], 150 + 17 * cs, gy - 35 * cs + 6, cs, INK);
    const ptero = svgRects(PTERO[0], 282, 150, 2.3, '#c4c4c4') + svgRects(PTERO_EYE, 282, 150, 2.3, '#202124');
    const speed = `<path d="M10 70h22M2 92h30M14 114h18" stroke="#c4c4c4" stroke-width="6" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f7f7f7"/>${night}${stars}${moon}${cl(150, 30)}${ground}${pebbles}${speed}${cac}${ptero}${dino}</svg>`;
  }

  Ameplay.register({
    id: 'dino-run',
    title: 'Dino Run',
    category: 'Arcade',
    tint: '#535353',
    blurb: 'The famous offline runner: jump cacti, duck pterodactyls, survive the night.',
    help: '<kbd>Space</kbd> / <kbd>↑</kbd> or tap to jump (hold = higher) · <kbd>↓</kbd> or swipe down to duck · <kbd>Enter</kbd> restarts',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M28 50V40a12 12 0 0 1 4-9V18a8 8 0 0 1 8-8h10a6 6 0 0 1 6 6v6a4 4 0 0 1-4 4H42v5l6 4"/><path d="M30 31c-9 0-15 5-21 13 7-1 12 0 19 3"/><path d="M30 50v6M40 46v10M6 58h52"/><circle cx="45" cy="17" r="1.5" fill="currentColor"/></svg>',
    css: `.gm-dino-run .g-canvas{background:#fff;border-radius:6px;image-rendering:auto;transition:filter 1.5s cubic-bezier(.65,.05,.36,1)}
.gm-dino-run .g-canvas.inv{filter:invert(1)}
.gm-dino-run .dr-hint{margin:0;font:800 13.5px var(--sans);color:#8a8a8a;text-align:center}
.gm-dino-run .dr-pads{display:flex;gap:12px;width:100%;max-width:520px}
.gm-dino-run .dr-pad{flex:1;height:92px;border:2px solid #dcdcdc;border-radius:16px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-user-select:none;user-select:none}
.gm-dino-run .dr-pad.on{background:#ececec;border-color:#bdbdbd}
.gm-dino-run .dr-pad svg{width:40px;height:40px}
.gm-dino-run .dr-pad{position:relative}`,
    mount(root, api) {
      const T = CFG.TREX, STEP = 1000 / CFG.FPS;
      const coarse = matchMedia('(pointer: coarse)').matches;
      const rootW = root.clientWidth || 880;
      const WL = Math.max(300, Math.min(CFG.W, Math.round(rootW / 1.25))), HL = CFG.H;
      const S = buildSprites();
      const view = api.canvas(Math.round(WL * 1.6), Math.round(HL * 1.6));
      const canvas = view.canvas, vctx = view.ctx;
      const [buf, b] = mk(WL, HL);
      const hint = document.createElement('p');
      hint.className = 'dr-hint';
      hint.textContent = coarse ? 'Tap to start' : 'Press Space or ↑ to start';
      root.append(hint);

      let N = 0;
      function fit() {
        const r = canvas.getBoundingClientRect();
        const n = Math.max(1, Math.min(8, Math.ceil((r.width || WL) * (window.devicePixelRatio || 1) / WL)));
        if (n !== N) { N = n; canvas.width = WL * n; canvas.height = HL * n; }
      }
      fit();
      function shape() {
        const h = HL;
        canvas.style.width = `min(100%, ${Math.round(WL * 1.6)}px, calc((100dvh - var(--goff, 250px)) * ${(WL / h).toFixed(4)}))`;
        canvas.style.aspectRatio = `${WL} / ${h}`;
        buf.height = h; N = 0; fit();
      }

      let ac = null;
      function audio() {
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function tone(t, d, f0, f1, vol, type = 'square') {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.linearRampToValueAtTime(f1, t + d);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.003);
        g.gain.setValueAtTime(vol, t + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02);
      }
      function sound(n) {
        if (api.muted || !audio()) return;
        const t = ac.currentTime + 0.004;
        if (n === 'press') tone(t, 0.055, 587, 587, 0.05);
        else if (n === 'score') { tone(t, 0.07, 1046.5, 1046.5, 0.045); tone(t + 0.085, 0.16, 1568, 1568, 0.045); }
        else if (n === 'hit') { tone(t, 0.06, 196, 196, 0.07); tone(t + 0.065, 0.2, 131, 98, 0.07); }
      }

      const groundY = HL - T.HEIGHT - CFG.BOTTOM_PAD, minJumpY = groundY - T.MIN_JUMP_HEIGHT;
      const fresh = () => ({ x: 0, y: groundY, vy: 0, jumping: false, ducking: false, speedDrop: false, reachedMin: false, status: 'W', frame: 0, timer: 0, jumpCount: 0, blinkDelay: 0, blinkStart: 0, blinkCount: 0, closed: false, intro: false, dead: false, dist: 0, score: 0, digits: '00000' });
      const t = fresh();
      let clock = 0, playing = false, activated = false, playingIntro = false, introT = 0, crashed = false, crashAt = 0;
      let runningTime = 0, distanceRan = 0, speed = 0, shown = -1, best = api.best || 0, submitted = false, acc = 0;
      let inverted = false, invertTimer = 0, invertTrigger = false;
      const hx = [0, CFG.HORIZON.WIDTH], htype = [0, 0];
      let clouds = [], obstacles = [], history = [];
      const night = { opacity: 0, phase: 0, x: WL - 50, stars: [], drawStars: false };
      const meter = { digits: '00000', achievement: false, flashTimer: 0, flashIter: 0, paint: true };

      function setSpeed(s) {
        if (WL < CFG.W) { const m = s * WL / CFG.W * CFG.MOBILE_SPEED_COEFFICIENT; speed = m > s ? s : m; }
        else speed = s;
      }
      setSpeed(CFG.SPEED);
      const actual = d => d ? Math.round(d * CFG.METER.COEFFICIENT) : 0;
      const setBlink = () => { t.blinkDelay = Math.ceil(Math.random() * T.BLINK_TIMING); };

      function tUpdate(dt, status) {
        t.timer += dt;
        if (status) {
          t.status = status; t.frame = 0;
          if (status === 'W') { t.blinkStart = clock; setBlink(); }
        }
        if (t.intro && t.x < T.START_X_POS) t.x += Math.round(T.START_X_POS / T.INTRO_DURATION * dt);
        if (t.status === 'W') {
          t.closed = false;
          if (t.blinkCount < T.MAX_BLINK_COUNT && clock - t.blinkStart >= t.blinkDelay) {
            t.closed = t.frame === 0;
            if (t.frame === 1) { setBlink(); t.blinkStart = clock; t.blinkCount++; }
          }
        }
        if (t.timer >= CFG.ANIM[t.status]) { t.frame = t.frame ? 0 : 1; t.timer = 0; }
        if (t.speedDrop && t.y === groundY) { t.speedDrop = false; setDuck(true); }
      }
      function startJump() {
        if (t.jumping) return;
        tUpdate(0, 'J');
        t.vy = T.INITIAL_JUMP_VELOCITY - speed / 10;
        t.jumping = true; t.reachedMin = false; t.speedDrop = false;
      }
      function endJump() { if (t.reachedMin && t.vy < T.DROP_VELOCITY) t.vy = T.DROP_VELOCITY; }
      function updateJump(dt) {
        const fe = dt / CFG.ANIM[t.status];
        t.y += Math.round(t.vy * (t.speedDrop ? T.SPEED_DROP_COEFFICIENT : 1) * fe);
        t.vy += T.GRAVITY * fe;
        if (t.y < minJumpY || t.speedDrop) t.reachedMin = true;
        if (t.y < T.MAX_JUMP_HEIGHT || t.speedDrop) endJump();
        if (t.y > groundY) { tReset(); t.jumpCount++; }
        tUpdate(dt);
      }
      function setSpeedDrop() { t.speedDrop = true; t.vy = 1; }
      function setDuck(d) {
        if (d && t.status !== 'D') { tUpdate(0, 'D'); t.ducking = true; }
        else if (!d && t.status === 'D') { tUpdate(0, 'R'); t.ducking = false; }
      }
      function tReset() {
        t.y = groundY; t.vy = 0; t.jumping = false; t.ducking = false;
        tUpdate(0, 'R');
        t.speedDrop = false; t.jumpCount = 0;
      }

      function placeStars() {
        const seg = Math.round(WL / CFG.NIGHT.NUM_STARS);
        night.stars = [];
        for (let i = 0; i < CFG.NIGHT.NUM_STARS; i++) night.stars.push({ x: rnd(seg * i, seg * (i + 1)), y: rnd(0, CFG.NIGHT.STAR_MAX_Y), k: i });
      }
      placeStars();
      const nightX = (p, s) => p < -CFG.NIGHT.WIDTH ? WL : p - s;
      function nightUpdate(on) {
        const N2 = CFG.NIGHT;
        if (on && night.opacity === 0) { night.phase++; if (night.phase >= 7) night.phase = 0; }
        if (on && (night.opacity < 1 || night.opacity === 0)) night.opacity += N2.FADE_SPEED;
        else if (night.opacity > 0) night.opacity -= N2.FADE_SPEED;
        if (night.opacity > 0) {
          night.x = nightX(night.x, N2.MOON_SPEED);
          if (night.drawStars) for (const s of night.stars) s.x = nightX(s.x, N2.STAR_SPEED);
        } else { night.opacity = 0; placeStars(); }
        night.drawStars = true;
      }
      const addCloud = () => clouds.push({ x: WL, y: rnd(CFG.CLOUD.MAX_SKY, CFG.CLOUD.MIN_SKY), gap: rnd(CFG.CLOUD.MIN_GAP, CFG.CLOUD.MAX_GAP) });
      addCloud();
      function updateClouds(dt) {
        const cs = CFG.CLOUD.SPEED / 1000 * dt * speed;
        if (clouds.length) {
          for (const c of clouds) c.x -= Math.ceil(cs);
          const last = clouds[clouds.length - 1];
          if (clouds.length < CFG.CLOUD.MAX && WL - last.x > last.gap && CFG.CLOUD.FREQUENCY > Math.random()) addCloud();
          clouds = clouds.filter(c => c.x + CFG.CLOUD.WIDTH > 0);
        } else addCloud();
      }
      function updateGround(dt) {
        const inc = Math.floor(speed * (CFG.FPS / 1000) * dt), Wd = CFG.HORIZON.WIDTH;
        const l1 = hx[0] <= 0 ? 0 : 1, l2 = l1 ? 0 : 1;
        hx[l1] -= inc; hx[l2] = hx[l1] + Wd;
        if (hx[l1] <= -Wd) { hx[l1] += Wd * 2; hx[l2] = hx[l1] - Wd; htype[l1] = Math.random() > CFG.HORIZON.BUMPY ? 1 : 0; }
      }
      function dupCheck(type) {
        let n = 0;
        for (const h of history) n = h === type ? n + 1 : 0;
        return n >= CFG.MAX_OBSTACLE_DUPLICATION;
      }
      function addObstacle() {
        let tc;
        for (let guard = 0; guard < 50; guard++) {
          tc = CFG.OBSTACLES[rnd(0, CFG.OBSTACLES.length - 1)];
          if (!(dupCheck(tc.type) || speed < tc.minSpeed)) break;
          tc = null;
        }
        if (!tc) tc = CFG.OBSTACLES[0];
        let size = rnd(1, CFG.MAX_OBSTACLE_LENGTH);
        if (size > 1 && tc.multipleSpeed > speed) size = 1;
        const width = tc.width * size;
        const ys = Array.isArray(tc.yPos) ? (coarse ? tc.yPosMobile : tc.yPos) : null;
        const boxes = tc.boxes.map(r => r.slice());
        if (size > 1) { boxes[1][2] = width - boxes[0][2] - boxes[2][2]; boxes[2][0] = width - boxes[2][2]; }
        const minGap = Math.round(width * speed + tc.minGap * CFG.GAP_COEFFICIENT), maxGap = Math.round(minGap * CFG.MAX_GAP_COEFFICIENT);
        const art = tc.type === 'PTERODACTYL' ? null : Array.from({ length: size }, (_, i) => (tc.type === 'CACTUS_SMALL' ? S.small : S.large)[(size === 1 ? rnd(0, 2) : (i + size)) % 3]);
        obstacles.push({
          tc, size, width, x: WL + tc.width, y: ys ? ys[rnd(0, ys.length - 1)] : tc.yPos, boxes, art,
          gap: rnd(minGap, maxGap), offset: tc.speedOffset ? (Math.random() > 0.5 ? tc.speedOffset : -tc.speedOffset) : 0,
          frame: 0, timer: 0, followed: false
        });
        history.unshift(tc.type);
        if (history.length > 1) history.splice(CFG.MAX_OBSTACLE_DUPLICATION);
      }
      function updateObstacles(dt) {
        for (const o of obstacles) {
          o.x -= Math.floor((speed + o.offset) * CFG.FPS / 1000 * dt);
          if (o.tc.numFrames) { o.timer += dt; if (o.timer >= o.tc.frameRate) { o.frame = o.frame === o.tc.numFrames - 1 ? 0 : o.frame + 1; o.timer = 0; } }
        }
        obstacles = obstacles.filter(o => o.x + o.width > 0);
        if (obstacles.length) {
          const last = obstacles[obstacles.length - 1];
          if (!last.followed && last.x + last.width + last.gap < WL) { addObstacle(); last.followed = true; }
        } else addObstacle();
      }
      function horizonUpdate(dt, hasObs, nightOn) {
        updateGround(dt);
        nightUpdate(nightOn);
        updateClouds(dt);
        if (hasObs) updateObstacles(dt);
      }
      const hit = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[3] + a[1] > b[1];
      function collide(o) {
        const tb = [t.x + 1, t.y + 1, T.WIDTH - 2, T.HEIGHT - 2], ob = [o.x + 1, o.y + 1, o.tc.width * o.size - 2, o.tc.height - 2];
        if (!hit(tb, ob)) return false;
        for (const q of t.ducking ? CFG.TREX_BOXES.DUCKING : CFG.TREX_BOXES.RUNNING) {
          const a = [q[0] + tb[0], q[1] + tb[1], q[2], q[3]];
          for (const r of o.boxes) if (hit(a, [r[0] + ob[0], r[1] + ob[1], r[2], r[3]])) return true;
        }
        return false;
      }
      function meterUpdate(dt, dist) {
        const M = CFG.METER;
        let play = false;
        meter.paint = true;
        if (!meter.achievement) {
          const d = actual(dist);
          if (d > 0) {
            if (d % M.ACHIEVEMENT === 0) { meter.achievement = true; meter.flashTimer = 0; play = true; }
            meter.digits = String(d).padStart(M.UNITS, '0');
          } else meter.digits = '0'.repeat(M.UNITS);
        } else if (meter.flashIter <= M.FLASH_ITER) {
          meter.flashTimer += dt;
          if (meter.flashTimer < M.FLASH_MS) meter.paint = false;
          else if (meter.flashTimer > M.FLASH_MS * 2) { meter.flashTimer = 0; meter.flashIter++; }
        } else { meter.achievement = false; meter.flashIter = 0; meter.flashTimer = 0; }
        return play;
      }
      function setInverted(v) {
        inverted = v;
        canvas.classList.toggle('inv', v);
      }
      function score() { return actual(Math.ceil(distanceRan)); }

      function gameOver() {
        sound('hit');
        if (coarse) try { navigator.vibrate && navigator.vibrate(200); } catch (e) {}
        playing = false; crashed = true; crashAt = performance.now();
        if (t.ducking) t.x++;
        tUpdate(100, 'C');
        const s = score();
        if (!submitted) { submitted = true; api.submit(s); }
        if (s > best) best = s;
        api.score(s);
      }
      function restart() {
        if (!crashed) return;
        runningTime = 0; playing = true; crashed = false; distanceRan = 0; submitted = false;
        setSpeed(CFG.SPEED);
        Object.assign(meter, { digits: '00000', achievement: false, flashTimer: 0, flashIter: 0, paint: true });
        obstacles = []; hx[0] = 0; hx[1] = CFG.HORIZON.WIDTH;
        night.phase = 0; night.opacity = 0; nightUpdate(false);
        tReset();
        sound('press');
        invertTimer = 0; invertTrigger = false; setInverted(false);
        shown = -1; api.score(0);
      }
      function invertUpdate(dt) {
        if (invertTimer > CFG.INVERT_FADE_DURATION) { invertTimer = 0; invertTrigger = false; setInverted(false); }
        else if (invertTimer) invertTimer += dt;
        else {
          const a = score();
          if (a > 0) {
            invertTrigger = !(a % CFG.INVERT_DISTANCE);
            if (invertTrigger && invertTimer === 0) { invertTimer += dt; setInverted(true); }
          }
        }
      }
      function buildPads() {
        if (!pads) return;
        const arrow = up => `<svg viewBox="0 0 10 10" shape-rendering="crispEdges"><path fill="${INK}" d="${up ? 'M4 1h2v1h1v1h1v1h1v2H6v3H4V6H1V4h1V3h1V2h1z' : 'M4 9h2V8h1V7h1V6h1V4H6V1H4v3H1v2h1v1h1v1h1z'}"/></svg>`;
        pads.innerHTML = `<div class="dr-pad" data-p="d" aria-label="Duck">${arrow(false)}</div><div class="dr-pad" data-p="j" aria-label="Jump">${arrow(true)}</div>`;
      }
      function step(dt) {
        clock += dt;
        if (playing) {
          if (t.jumping) updateJump(dt);
          runningTime += dt;
          const hasObs = runningTime > CFG.CLEAR_TIME;
          if (t.jumpCount === 1 && !playingIntro && !activated && !crashed) {
            playingIntro = true; t.intro = true; introT = 0; activated = true;
            hint.hidden = true;
          }
          if (playingIntro) {
            horizonUpdate(0, hasObs, false);
            introT += dt;
          } else horizonUpdate(activated ? dt : 0, hasObs, inverted);
          const collision = hasObs && obstacles.length && collide(obstacles[0]);
          if (!collision) {
            distanceRan += speed * (activated ? dt : 0) / STEP;
            if (speed < CFG.MAX_SPEED) speed += CFG.ACCELERATION;
          } else gameOver();
          if (!crashed) {
            if (meterUpdate(dt, Math.ceil(distanceRan))) sound('score');
            invertUpdate(dt);
            const s = score();
            if (s !== shown) { shown = s; api.score(s); }
          }
          if (playingIntro && introT >= CFG.INTRO_MS) { runningTime = 0; playingIntro = false; t.intro = false; }
        }
        if (playing || (!activated && t.blinkCount < T.MAX_BLINK_COUNT)) tUpdate(dt);
      }

      function text(str, x, y, gap) {
        for (const ch of str) {
          if (ch !== ' ' && S.font[ch]) b.drawImage(S.font[ch], x, y);
          x += gap;
        }
      }
      function drawLane(d) {
        b.fillStyle = '#fff'; b.fillRect(0, 0, WL, HL);
        b.drawImage(S.ground[htype[0]], hx[0], CFG.HORIZON.YPOS);
        b.drawImage(S.ground[htype[1]], hx[1], CFG.HORIZON.YPOS);
        if (night.opacity > 0) {
          b.globalAlpha = Math.min(1, night.opacity);
          if (night.drawStars) for (const s of night.stars) b.drawImage(S.star[s.k], Math.round(s.x), s.y);
          b.drawImage(S.moon[night.phase], Math.round(night.x), CFG.NIGHT.MOON_Y);
          b.globalAlpha = 1;
        }
        for (const c of clouds) b.drawImage(S.cloud, c.x, c.y);
        for (const o of obstacles) {
          if (o.art) for (let i = 0; i < o.art.length; i++) b.drawImage(o.art[i], o.x + i * o.tc.width, o.y);
          else b.drawImage(S.ptero[o.frame], o.x, o.y);
        }
        if (playing || crashed) {
          const M = CFG.METER, digits = meter.digits, units = Math.max(M.UNITS, digits.length), x0 = WL - M.DEST_WIDTH * (units + 1);
          if (meter.paint) text(digits, x0, M.Y + 1, M.DEST_WIDTH);
          if (best > 0) {
            b.globalAlpha = 0.8;
            text('HI ' + String(best).padStart(units, '0'), x0 - units * 2 * M.WIDTH, M.Y + 1, M.DEST_WIDTH);
            b.globalAlpha = 1;
          }
        }
        let img;
        if (d.status === 'C') img = S.dead;
        else if (d.status === 'D') img = d.frame ? S.duckB : S.duckA;
        else if (d.status === 'R') img = d.frame ? S.runB : S.runA;
        else if (d.status === 'W') img = d.closed ? S.blink : S.stand;
        else img = S.stand;
        b.drawImage(img, d.x, d.y);
      }
      function draw() {
        drawLane(t);
        if (crashed) {
          const gx = Math.round(WL / 2 - 169 / 2);
          text('GAME', gx, Math.round((HL - 25) / 3), 20);
          text('OVER', gx + 100, Math.round((HL - 25) / 3), 20);
          b.drawImage(S.restart, WL / 2 - 18, HL / 2);
        }
        let clip = WL;
        if (!activated) clip = T.WIDTH;
        else if (playingIntro) { const k = Math.min(1, introT / CFG.INTRO_MS); clip = Math.round(T.WIDTH + (WL - T.WIDTH) * (1 - (1 - k) * (1 - k) * (1 - k))); }
        if (clip < WL) { b.fillStyle = '#fff'; b.fillRect(clip, 0, WL - clip, HL); }
        vctx.setTransform(1, 0, 0, 1, 0, 0);
        vctx.imageSmoothingEnabled = false;
        vctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
      }

      function jumpDown() {
        audio();
        if (crashed) { if (performance.now() - crashAt >= CFG.GAMEOVER_CLEAR_TIME) restart(); return; }
        if (!playing) playing = true;
        if (!t.jumping && !t.ducking) { sound('press'); startJump(); }
      }
      function jumpUp() { if (playing) endJump(); }
      function duckDown() {
        if (!playing || crashed) return;
        if (t.jumping) setSpeedDrop();
        else if (!t.ducking) setDuck(true);
      }
      function duckUp() { t.speedDrop = false; setDuck(false); }

      const JUMP = new Set(['Space', 'ArrowUp', 'KeyW']), DUCK = new Set(['ArrowDown', 'KeyS']);
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tg = e.target;
        if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return;
        if (JUMP.has(e.code)) { e.preventDefault(); jumpDown(); }
        else if (DUCK.has(e.code)) { e.preventDefault(); audio(); duckDown(); }
        else if ((e.code === 'Enter' || e.code === 'NumpadEnter') && crashed) { e.preventDefault(); restart(); }
      });
      api.on(window, 'keyup', e => {
        if (JUMP.has(e.code)) jumpUp();
        else if (DUCK.has(e.code)) duckUp();
      });
      api.on(window, 'blur', () => {
        jumpUp(); duckUp();
      });

      let ptr = null;
      api.on(canvas, 'pointerdown', e => {
        e.preventDefault();
        audio();
        if (crashed) {
          const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * WL / r.width, y = (e.clientY - r.top) * HL / r.height;
          if (x > WL / 2 - 26 && x < WL / 2 + 26 && y > HL / 2 - 8 && y < HL / 2 + 40) restart();
          else jumpDown();
          return;
        }
        ptr = { id: e.pointerId, y: e.clientY, duck: false };
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        jumpDown();
      });
      api.on(canvas, 'pointermove', e => {
        if (!ptr || ptr.id !== e.pointerId || ptr.duck) return;
        if (e.clientY - ptr.y > 24) { ptr.duck = true; duckDown(); }
      });
      const ptrUp = e => {
        if (!ptr || ptr.id !== e.pointerId) return;
        if (ptr.duck) duckUp();
        ptr = null; jumpUp();
      };
      api.on(window, 'pointerup', ptrUp);
      api.on(window, 'pointercancel', ptrUp);

      let pads = null;
      function addPads() {
        if (pads) return;
        pads = document.createElement('div');
        pads.className = 'dr-pads';
        root.append(pads);
        buildPads();
        const held = new Map();
        api.on(pads, 'pointerdown', e => {
          const el = e.target.closest('.dr-pad');
          if (!el) return;
          const isJ = el.dataset.p === 'j';
          e.preventDefault(); held.set(e.pointerId, el); el.classList.add('on');
          try { el.setPointerCapture(e.pointerId); } catch (err) {}
          audio();
          if (isJ) jumpDown();
          else if (crashed) jumpDown();
          else duckDown();
        });
        const up = e => {
          const el = held.get(e.pointerId);
          if (!el) return;
          held.delete(e.pointerId); el.classList.remove('on');
          if (el.dataset.p === 'j') jumpUp(); else duckUp();
        };
        api.on(pads, 'pointerup', up); api.on(pads, 'pointercancel', up);
      }
      if (coarse) addPads();
      api.on(root, 'touchstart', () => addPads(), { passive: true });
      api.on(window, 'resize', () => { N = 0; });
      api.on(document, 'fullscreenchange', () => { N = 0; });

      let fitTick = 0;
      api.score(0);
      api.loop(dt => {
        if (!N || ++fitTick > 30) { fitTick = 0; fit(); }
        acc = Math.min(acc + dt * 1000, 250);
        while (acc >= STEP - 1) { step(STEP); acc -= STEP; }
        draw();
      });

      root.__dino = {
        snap: () => ({ playing, activated, crashed, playingIntro, speed, distanceRan, score: score(), status: t.status, x: t.x, y: t.y, ducking: t.ducking, jumping: t.jumping, inverted, night: night.opacity, phase: night.phase, obstacles: obstacles.map(o => [o.tc.type, o.x, o.y, o.size]), clouds: clouds.length, best, WL, digits: meter.digits }),
        setDistance: d => { distanceRan = d; },
        setSpeed: s => { speed = s; },
        clearObstacles: () => { obstacles = []; }
      };
      return {
        destroy() {
          delete root.__dino;
          if (ac) { try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {} ac = null; }
        }
      };
    }
  });

  function cover() {
    const s = 2.9, gy = 236, dy = gy - 47 * s - 86;
    const night = '<path d="M300 0H400V300H252z" fill="#202124"/>';
    const stars = [[330, 120], [376, 104], [318, 40]].map(([x, y]) => `<path fill="#bdbdbd" d="M${x - 2} ${y - 10}h4v20h-4zM${x - 10} ${y - 2}h20v4h-20z"/>`).join('');
    const moon = '<circle cx="360" cy="48" r="26" fill="#d8d8d8"/><circle cx="374" cy="40" r="24" fill="#202124"/>';
    const cl = (x, y) => `<path d="M${x} ${y + 30}h120a16 16 0 0 0-26-22a24 24 0 0 0-44-8a18 18 0 0 0-32 10a14 14 0 0 0-18 20z" fill="#fff" stroke="#cfcfcf" stroke-width="5"/>`;
    const ground = `<path d="M0 ${gy}h258" stroke="${INK}" stroke-width="4"/><path d="M258 ${gy}h50l14-10l14 10H400" fill="none" stroke="#9a9a9a" stroke-width="4"/>`;
    const pebbles = `<path fill="#9a9a9a" d="M30 ${gy + 14}h12v4H30zM120 ${gy + 22}h6v4h-6zM200 ${gy + 12}h14v4h-14zM330 ${gy + 24}h8v4h-8zM80 ${gy + 30}h4v4h-4z"/>`;
    const dino = svgRects(TREX.runB, 34, dy, s, INK) + svgRects(EYE, 34, dy, s, '#fff');
    const cs = 3.1, cac = svgRects(SMALL[1], 150, gy - 35 * cs + 6, cs, INK) + svgRects(SMALL[2], 150 + 17 * cs, gy - 35 * cs + 6, cs, INK);
    const ptero = svgRects(PTERO[0], 282, 150, 2.3, '#c4c4c4') + svgRects(PTERO_EYE, 282, 150, 2.3, '#202124');
    const speed = `<path d="M10 70h22M2 92h30M14 114h18" stroke="#c4c4c4" stroke-width="6" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f7f7f7"/>${night}${stars}${moon}${cl(150, 30)}${ground}${pebbles}${speed}${cac}${ptero}${dino}</svg>`;
  }
  Ameplay.covers['dino-run'] = cover();
})();

