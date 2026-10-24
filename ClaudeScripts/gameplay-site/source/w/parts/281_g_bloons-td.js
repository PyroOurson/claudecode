(() => {
  'use strict';
const RD = [
'0:20',
'0:35',
'0:25 1:5',
'0:35 1:18',
'0:5 1:27',
'0:15 1:15 2:4',
'0:20 1:20 2:5',
'0:10 1:20 2:14',
'2:30',
'1:102',
'0:10 1:10 2:12 3:3',
'1:15 2:10 3:5',
'1:50 2:23',
'0:49 1:15 2:10 3:9',
'0:20 1:15 2:12 3:10 4:5',
'2:40 3:8',
'3.g:12',
'2.u:80',
'2:10 3:4 3.g:5 4:15',
'5:6',
'3:40 4:14',
'6:16',
'6:7 5:7',
'1:20 2.c:1',
'3.g:25 7:10',
'4:23 9:4',
'0:100 1:60 2:45 3:45',
'8:6',
'3:50 3.g:15',
'8:9',
'6:8 5:8 9:8 9.g:2',
'7:10 6:20 5:15',
'0.c:20 3.c:13',
'3:160 9:6',
'4:35 6:25 5:30 10:5',
'2.cg:20 4.u:140',
'6:25 6.cu:7 5:25 8:15 9:10',
'4:42 6:17 8:14 9:10 11:2',
'6:10 5:10 9:20 10:18 10.g:2',
'12:1',
'5:60 9:60',
'10.c:5 10.g:6',
'10:10 11:7',
'9.u:50',
'4:180 7.cu:10 8.f:4 10:25',
'11.f:6',
'4.c:70 11:12',
'4.g:40 7.cg:30 10:40 11.f:3',
'2:343 9:20 10:20 10.g:10 11:18',
'0.u:20 8.f:8 11:20 12:2',
'10.g:10 11.c:15',
'10:25 11:10 12:2',
'4.c:80 12:3',
'11:35 12:2',
'11.u:45 12:1',
'10.c:40 12:1',
'10:40 12:4',
'11:15 11.f:10 12:5',
'8.c:50 11:20 11.g:10',
'13:1',
'9:150 12:5',
'7:250 10.cg:15 12:5 12.f:2',
'8:75 11.u:122',
'12:6 12.f:3',
'9:100 10:70 11:50 12:3 13:2',
'12:8 12.f:3',
'11.cgf:13 12:8',
'12:4 13:1',
'5.g:40 8.f:40 11:50',
'6.cg:120 10:200 12:4',
'11:30 12:10',
'11.g:38 13:2',
'12:8 13:2',
'11:50 11.f:60 11.cgf:25 13:1',
'8:14 8.f:14 12.f:3 13:7',
'11.g:60',
'12:11 13:5',
'7:80 10:150 11.u:75 11.cu:72 13:1',
'10.g:500 13:4 13.f:2',
'14:1',
'13:17',
'13:10 13.f:5',
'11:40 11.g:40 11.f:40 12:30',
'12:50 13:10',
'14:2',
'13.f:5',
'14:4',
'12:18 13:8 14:2',
'12.f:20 13.f:8',
'8.cgf:50 15:3',
'11.f:100 13:20',
'12.f:50 14:1',
'13.f:10 15:6',
'13:25 14:6',
'7.cg:500 8.cgf:250 12.f:50 15:30',
'12.f:40 13:30 14:6',
'14.f:2',
'13.f:30 14:8',
'12:60 15.f:9',
'16:1',
'7:450 11.f:50 12.f:10',
'13:3 13.f:3 14:1 14.f:3 15:18 15.f:12',
'7.u:198 12:100 12.f:50 14.f:10',
'7:200 8.f:200 11:200 12:25 12.f:150 13:25 13.f:14',
'8.f:25 11:100 11.f:300 13:30',
'15.u:66 15.f:27',
'7.c:444 11.f:100 14.f:10',
'14:9 14.f:10',
'7:15 12.f:30 13:15 13.f:15 14:15',
'13:25 15:18 15.f:12',
'14:22 14.f:9',
'13.f:27 15.f:21',
'11.cu:42 11.fu:42 12.f:75 13.f:15',
'12:24 12.f:36 13:12 13.f:8 14:5 14.f:3 15:9 15.f:6',
'12:24 12.f:36 13:12 13.f:8 14:5 14.f:3 15:9 15.f:6',
'7:400 13.f:18 14.f:8',
'8:250 15:27 15.f:18',
'14:12 15.f:30',
'16:3',
'12.f:12 14:12',
'12.f:28 13.f:14 14.f:6',
'8.f:225 13:40 13.f:20',
'12:200 14.f:8',
'13.f:75',
'12:63 13:42 14:21',
'8.cgf:1 15:99',
'12:48 13:24',
'11.cf:200 13:30 15.f:39',
'7.cu:77 8.cfu:77 11.cu:77 14:7 14.f:7 15.u:18',
'12.u:84 12.f:66 15:48 15.f:6',
'14.f:18',
'7.cu:200 14.u:18 14.fu:6',
'12.u:27 12.fu:12 13.u:27 13.fu:12 14.u:9 14.fu:4',
'13:28 13.f:12',
'14.f:14 15.f:21',
'12.f:96 13:24',
'12.u:48 13.u:24 14.u:18',
'15:45 15.f:81',
'12:181 12.f:72',
'16:1 16.f:1'
];
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const MW = 740, MH = 600;
  const SH = 1, NO = 2, EX = 4, CO = 8, MA = 16, FI = 32, PL = 64, AC = 128;
  const BASE_SPEED = 55;

  const BT = [
    { id: 'red', n: 'Red', c: '#e83a30', sp: 1, hp: 1, k: [], im: 0, r: 10, cash: 1 },
    { id: 'blue', n: 'Blue', c: '#2f8ef0', sp: 1.4, hp: 1, k: [0], im: 0, r: 10.5, cash: 1 },
    { id: 'green', n: 'Green', c: '#45c23e', sp: 1.8, hp: 1, k: [1], im: 0, r: 11, cash: 1 },
    { id: 'yellow', n: 'Yellow', c: '#ffd934', sp: 3.2, hp: 1, k: [2], im: 0, r: 11.5, cash: 1 },
    { id: 'pink', n: 'Pink', c: '#ff7fb8', sp: 3.5, hp: 1, k: [3], im: 0, r: 12, cash: 1 },
    { id: 'black', n: 'Black', c: '#34343c', sp: 1.8, hp: 1, k: [4, 4], im: EX, r: 11.5, cash: 1 },
    { id: 'white', n: 'White', c: '#f6f6f2', sp: 2, hp: 1, k: [4, 4], im: CO, r: 11.5, cash: 1 },
    { id: 'purple', n: 'Purple', c: '#9446c4', sp: 3, hp: 1, k: [4, 4], im: MA | FI | PL, r: 11.5, cash: 1 },
    { id: 'lead', n: 'Lead', c: '#98a2ae', sp: 1, hp: 1, k: [5, 5], im: SH, r: 12, cash: 1 },
    { id: 'zebra', n: 'Zebra', c: '#f2f2f2', sp: 1.8, hp: 1, k: [5, 6], im: EX | CO, r: 12, cash: 1 },
    { id: 'rainbow', n: 'Rainbow', c: '#ffa722', sp: 2.2, hp: 1, k: [9, 9], im: 0, r: 12.5, cash: 1 },
    { id: 'ceramic', n: 'Ceramic', c: '#b9783f', sp: 2.5, hp: 10, k: [10, 10], im: 0, r: 13, cash: 1 },
    { id: 'moab', n: 'MOAB', c: '#2f6fe0', sp: 1, hp: 200, k: [11, 11, 11, 11], im: 0, r: 25, cash: 24, big: 1 },
    { id: 'bfb', n: 'BFB', c: '#d8342f', sp: 0.25, hp: 700, k: [12, 12, 12, 12], im: 0, r: 33, cash: 60, big: 1 },
    { id: 'zomg', n: 'ZOMG', c: '#3a9c3a', sp: 0.18, hp: 4000, k: [13, 13, 13, 13], im: 0, r: 43, cash: 140, big: 1 },
    { id: 'ddt', n: 'DDT', c: '#3f4a40', sp: 2.75, hp: 400, k: [11, 11, 11, 11], im: SH, r: 21, cash: 50, big: 1 },
    { id: 'bad', n: 'BAD', c: '#7a2fa8', sp: 0.18, hp: 20000, k: [14, 14, 15, 15, 15], im: 0, r: 52, cash: 500, big: 1 }
  ];
  const T_LEAD = 8, T_CER = 11, T_MOAB = 12, T_DDT = 15, T_BAD = 16;
  const RBE = [];
  BT.forEach((b, i) => { RBE[i] = b.hp + b.k.reduce((s, k) => s + RBE[k], 0); });
  const hpOf = (t, fort) => {
    const b = BT[t];
    if (!fort) return b.hp;
    return t === T_LEAD ? 4 : b.hp > 1 ? b.hp * 2 : 2;
  };
  const cashMul = r => r <= 50 ? 1 : r <= 60 ? .5 : r <= 85 ? .2 : r <= 100 ? .1 : r <= 120 ? .05 : .02;
  const blimpHp = r => r <= 100 ? 1 : 1 + (r - 100) * 0.06;
  const blimpSp = r => r <= 100 ? 1 : 1 + (r - 100) * 0.01;
  const GAPS = [.5, .45, .4, .35, .35, .45, .45, .35, .55, .4, .35, .5, 1.2, 4, 8, 1, 12];
  const RDX = RD.map(s => s.split(' ').map(g => { const [a, n] = g.split(':'), [t, f = ''] = a.split('.'); return { t: +t, n: +n, c: f.includes('c'), g: f.includes('g'), f: f.includes('f'), u: f.includes('u') }; }));

  function freeGroups(r) {
    const R = mulberry(r * 7919 + 13);
    let bud = 111520 * Math.pow(1.04, r - 140);
    const out = [];
    const pool = [[T_BAD, 55760, r >= 150 ? 3 : 0], [14, 16656, 4], [13, 3164, 5], [12, 616, 4], [T_DDT, 816, 4], [T_CER, 104, 3], [10, 47, 1]];
    let guard = 0;
    while (bud > 0 && guard++ < 40) {
      const tot = pool.reduce((s, p) => s + p[2], 0);
      let x = R() * tot, p = pool[0];
      for (const q of pool) { x -= q[2]; if (x <= 0) { p = q; break; } }
      const share = bud * (.18 + R() * .3);
      let n = Math.max(1, Math.min(p[0] <= 11 ? 120 : 200, Math.round(share / p[1])));
      if (p[0] === T_BAD) n = Math.min(n, 1 + Math.floor((r - 140) / 25));
      out.push({ t: p[0], n, c: R() < .3, g: R() < .2, f: R() < .75, u: R() < .15 });
      bud -= n * p[1];
    }
    return out;
  }
  const roundCache = new Map();
  function roundPlan(r) {
    if (roundCache.has(r)) return roundCache.get(r);
    const groups = r <= RDX.length ? RDX[r - 1] : freeGroups(r);
    const ev = [];
    let start = 0;
    groups.forEach(gp => {
      const rush = gp.u;
      const maxDur = rush ? 11 : 26;
      let gap = Math.min(GAPS[gp.t] * (rush ? .5 : 1), maxDur / Math.max(1, gp.n));
      if (gp.t >= 12) gap = Math.max(gap, GAPS[gp.t] * .4);
      const fl = (gp.c ? 1 : 0) | (gp.g ? 2 : 0) | (gp.f ? 4 : 0);
      for (let i = 0; i < gp.n; i++) ev.push([start + i * gap, gp.t, fl]);
      start += gp.n * gap * .55 + .3;
    });
    ev.sort((a, b) => a[0] - b[0]);
    const plan = { ev, rbe: groups.reduce((s, g) => s + g.n * RBE[g.t], 0) };
    roundCache.set(r, plan);
    return plan;
  }

  const MODES = {
    easy: { n: 'Easy', cost: .85, lives: 200, from: 1, to: 40, cash: 650, d: 'Costs -15%, 200 lives, rounds 1-40' },
    medium: { n: 'Medium', cost: 1, lives: 150, from: 1, to: 60, cash: 650, d: 'Standard costs, 150 lives, rounds 1-60' },
    hard: { n: 'Hard', cost: 1.08, lives: 100, from: 3, to: 80, cash: 650, d: 'Costs +8%, 100 lives, rounds 3-80' },
    impoppable: { n: 'Impoppable', cost: 1.2, lives: 1, from: 6, to: 80, cash: 650, d: 'Costs +20%, 1 life, rounds 6-80' }
  };
  const MODE_IDS = ['easy', 'medium', 'hard', 'impoppable'];

  function chaikin(p, n, closed) {
    for (let k = 0; k < n; k++) {
      const q = closed ? [] : [p[0]], m = closed ? p.length : p.length - 1;
      for (let i = 0; i < m; i++) {
        const a = p[i], b = p[(i + 1) % p.length];
        q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]);
      }
      if (!closed) q.push(p[p.length - 1]);
      p = q;
    }
    return p;
  }
  const DS = 2;
  function roundPoly(wp, R) {
    const q = [wp[0]];
    for (let i = 1; i < wp.length - 1; i++) {
      const a = wp[i - 1], p = wp[i], b = wp[i + 1];
      const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const t = Math.min(R, l1 / 2.05, l2 / 2.05);
      const A = [p[0] - (p[0] - a[0]) / l1 * t, p[1] - (p[1] - a[1]) / l1 * t], B = [p[0] + (b[0] - p[0]) / l2 * t, p[1] + (b[1] - p[1]) / l2 * t];
      for (let k = 0; k <= 10; k++) {
        const u = k / 10, w = 1 - u;
        q.push([w * w * A[0] + 2 * w * u * p[0] + u * u * B[0], w * w * A[1] + 2 * w * u * p[1] + u * u * B[1]]);
      }
    }
    q.push(wp[wp.length - 1]);
    return q;
  }
  function buildPath(wp, R) {
    const poly = R < 0 ? chaikin(wp, 2) : roundPoly(wp, R);
    const xs = [], ys = [];
    let acc = 0, next = 0;
    for (let i = 0; i < poly.length - 1; i++) {
      const a = poly[i], b = poly[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (next <= acc + l) {
        const t = l ? (next - acc) / l : 0;
        xs.push(a[0] + (b[0] - a[0]) * t); ys.push(a[1] + (b[1] - a[1]) * t);
        next += DS;
      }
      acc += l;
    }
    const n = xs.length, px = new Float32Array(n), py = new Float32Array(n), pa = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = xs[i]; py[i] = ys[i];
      const j = Math.min(n - 1, i + 2), h = Math.max(0, i - 2);
      pa[i] = Math.atan2(ys[j] - ys[h], xs[j] - xs[h]);
    }
    return { px, py, pa, n, len: (n - 1) * DS };
  }
  function pathAt(p, d, out) {
    const f = clamp(d / DS, 0, p.n - 1.001), i = f | 0, t = f - i;
    out.x = p.px[i] + (p.px[i + 1] - p.px[i]) * t;
    out.y = p.py[i] + (p.py[i + 1] - p.py[i]) * t;
    out.a = p.pa[i];
    return out;
  }
  function pathDist(p, x, y) {
    let best = 1e9;
    for (let i = 0; i < p.n; i += 3) {
      const dx = p.px[i] - x, dy = p.py[i] - y, d = dx * dx + dy * dy;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }
  function inPoly(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  const blob = (cx, cy, rx, ry, n, seed, jit) => {
    const R = mulberry(seed), p = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + (R() - .5) * (jit || .3); p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return chaikin(p, 3, true);
  };
  const spiral = (cx, cy, rx, ry, a0, turns, r0, r1, n) => {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n, a = a0 + f * turns * TAU, k = r0 + (r1 - r0) * f;
      p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return p;
  };

  const PATH_HALF = 19;
  const MAPS = [
    { id: 'meadow', n: 'Monkey Meadow', diff: 0, th: 'grass', blurb: 'Gentle curves and a little pond. The perfect first map.',
      paths: [[[-30, 110], [620, 110], [620, 300], [120, 300], [120, 490], [770, 490]]],
      water: [blob(370, 205, 110, 38, 10, 5, .2)],
      obs: [['tree', 16, 17, 25], ['bush', 10, 9, 13], ['rock', 5, 11, 16]] },
    { id: 'stump', n: 'Tree Stump', diff: 0, th: 'grass', blurb: 'A long spiral road winding into the heart of the old stump.',
      paths: [[[-30, 90], [650, 90], [650, 510], [90, 510], [90, 210], [520, 210], [520, 400], [220, 400], [220, 310]]],
      water: [],
      obs: [['tree', 12, 16, 24], ['bush', 12, 9, 13], ['rock', 5, 11, 15]] },
    { id: 'town', n: 'Town Center', diff: 0, th: 'town', blurb: 'Busy streets with plenty of rooftops to keep your monkeys on.',
      paths: [[[-30, 310], [130, 310], [130, 110], [330, 110], [330, 500], [560, 500], [560, 110], [770, 110]]],
      water: [],
      obs: [['house', 9, 50, 70], ['tree', 10, 14, 19]] },
    { id: 'lagoon', n: 'Lazy Lagoon', diff: 0, th: 'beach', cr: 28, blurb: 'A sunny beach around a big lagoon. Boats and subs welcome.',
      paths: [[[-30, 545], [90, 545], [90, 330], [190, 330], [190, 110], [290, 70], [380, 150], [470, 70], [560, 110], [560, 330], [650, 330], [650, 545], [770, 545]]],
      water: [blob(375, 385, 135, 105, 12, 9, .22)],
      obs: [['palm', 11, 16, 20], ['rock', 6, 10, 15], ['bush', 6, 9, 12]] },
    { id: 'frozen', n: 'Frozen Lake', diff: 1, th: 'snow', blurb: 'A winding trail across ice. Two frozen lakes hold water towers.',
      paths: [[[-30, 70], [260, 70], [260, 230], [110, 230], [110, 390], [300, 390], [300, 540], [630, 540], [630, 380], [480, 380], [480, 230], [660, 230], [660, 60], [770, 60]]],
      water: [blob(380, 245, 80, 62, 9, 21, .2), blob(560, 460, 70, 52, 9, 22, .2)],
      obs: [['pine', 14, 16, 22], ['icechunk', 6, 11, 16]] },
    { id: 'dunes', n: 'Dune Sea', diff: 1, th: 'desert', cr: 60, blurb: 'A scorching switchback through the sands, with two oases.',
      paths: [[[-30, 540], [210, 540], [260, 410], [90, 330], [170, 200], [400, 270], [470, 120], [700, 90], [770, 90]]],
      water: [blob(560, 400, 78, 54, 9, 31, .22), blob(300, 90, 62, 34, 9, 32, .2)],
      obs: [['cactus', 11, 12, 17], ['rock', 8, 12, 18]] },
    { id: 'streams', n: 'Twin Streams', diff: 1, th: 'grass', blurb: 'Two lanes merge at the crossroads. A river cuts the map in half.',
      paths: [[[-30, 90], [300, 90], [410, 200], [410, 300], [770, 300]], [[-30, 510], [300, 510], [410, 400], [410, 300], [770, 300]]],
      water: [[[560, -20], [610, -20], [640, 120], [600, 200], [650, 300], [610, 400], [650, 500], [600, 620], [545, 620], [575, 500], [535, 400], [585, 300], [540, 200], [580, 120]]],
      obs: [['tree', 14, 16, 22], ['bush', 8, 9, 13], ['rock', 5, 11, 16]] },
    { id: 'cubes', n: 'Cube Maze', diff: 1, th: 'tech', cr: 16, blurb: 'Hard right angles and tight corridors. Plan your corners.',
      paths: [[[-30, 60], [110, 60], [110, 270], [250, 270], [250, 60], [390, 60], [390, 410], [530, 410], [530, 170], [670, 170], [670, 540], [270, 540], [270, 440]]],
      water: [],
      obs: [['cube', 10, 24, 34], ['rock', 4, 10, 14]] },
    { id: 'volcano', n: 'Volcano Rim', diff: 2, th: 'lava', blurb: 'A scorched spiral around the crater. Lava burns away your space.',
      cr: -1, paths: [[[-30, 70], [90, 70], ...spiral(370, 300, 320, 245, -2.6, 2.05, 1, .12, 70)]],
      water: [], lava: [blob(370, 300, 34, 28, 10, 41, .15)],
      obs: [['lavarock', 12, 13, 19], ['rock', 8, 10, 15]] },
    { id: 'hedge', n: 'Hedge Maze', diff: 2, th: 'garden', blurb: 'A cramped garden labyrinth where every tile counts.',
      cr: 22, paths: [[[-30, 60], [640, 60], [640, 200], [100, 200], [100, 340], [640, 340], [640, 480], [-30, 480]]],
      water: [],
      obs: [['hedge', 6, 20, 36], ['bush', 12, 9, 13], ['tree', 4, 15, 19]] }
  ];

  const sc = (m, kind, n, r0, r1, R, taken) => {
    const out = [];
    let tries = 0;
    const rect = kind === 'house' || kind === 'cube' || kind === 'hedge';
    while (out.length < n && tries++ < n * 80) {
      let w = r0 + R() * (r1 - r0), h = w, x = 30 + R() * (MW - 60), y = 30 + R() * (MH - 60), rad = w;
      if (rect) { w = r0 + R() * (r1 - r0); h = kind === 'hedge' ? 14 + R() * 8 : r0 + R() * (r1 - r0); if (kind === 'hedge' && R() < .5) { const t = w; w = h; h = t; } rad = Math.hypot(w, h) / 2; }
      const clear = rad + PATH_HALF + 12;
      if (m.pathObjs.some(p => pathDist(p, x, y) < clear)) continue;
      if (m.water.some(poly => inPoly(poly, x, y) || [[rad, 0], [-rad, 0], [0, rad], [0, -rad]].some(o => inPoly(poly, x + o[0], y + o[1])))) continue;
      if ((m.lava || []).some(poly => inPoly(poly, x, y))) continue;
      if (taken.some(o => Math.hypot(o.x - x, o.y - y) < o.rad + rad + 4)) continue;
      out.push({ k: kind, x, y, w, h, r: rect ? 0 : w, rad, v: R() });
    }
    return out;
  };
  MAPS.forEach((m, mi) => {
    m.idx = mi;
    m.pathObjs = m.paths.map(p => buildPath(p, m.cr || 36));
    m.water = (m.water || []).map(p => p.length > 30 ? p : chaikin(p, 3, true));
    m.lava = m.lava || [];
    const R = mulberry(mi * 977 + 11), taken = [];
    m.blocks = [];
    m.obs.forEach(([k, n, a, b]) => { const o = sc(m, k, n, a, b, R, taken); o.forEach(x => taken.push(x)); m.blocks.push(...o); });
    m.len = Math.max(...m.pathObjs.map(p => p.len));
  });
  const DIFFN = ['Beginner', 'Intermediate', 'Advanced'];
  const U = (n, c, p, t) => ({ n, c, p, t });
  const TW = [
    { id: 'dart', n: 'Dart Monkey', key: 'Q', cost: 200, d: 'Throws sharp darts. Cheap and reliable.',
      b: { k: 'p', cd: .95, rng: 135, dmg: 1, pr: 2, sp: 540, dt: SH, n: 1, spr: .2, shape: 'dart' },
      pn: ['Sharpness', 'Speed', 'Range'],
      u: [[U('Sharp Shots', 140, { '+pr': 2 }, 'Darts pop 2 more bloons'), U('Razor Sharp Shots', 220, { '+pr': 4 }, 'Darts pop 4 more bloons'), U('Spike-o-pult', 500, { dmg: 2, pr: 18, '*cd': 1.4, sp: 330, '+rng': 10, shape: 'spike' }, 'Heavy spiked balls, pierce 18'), U('Juggernaut', 1800, { dmg: 4, pr: 26, lead: 1, sp: 340, '+rng': 5 }, 'Giant ball, pops lead and ice'), U('Ultra-Juggernaut', 15000, { dmg: 9, pr: 60, lead: 1, '*cd': .75, ric: 6, dM: 12 }, 'Bounces between bloons')],
        [U('Quick Shots', 100, { '*cd': .8 }, 'Throws 25% faster'), U('Very Quick Shots', 190, { '*cd': .8 }, 'Throws 25% faster again'), U('Triple Shot', 400, { n: 3, spr: .2 }, 'Three darts per throw'), U('Super Monkey Fan Club', 8000, { ab: 'fan' }, 'Ability: nearby darts go super fast'), U('Plasma Monkey Fan Club', 30000, { ab: 'fan2', '*cd': .85 }, 'Ability: plasma fan club, longer')],
        [U('Long Range Darts', 90, { '+rng': 28 }, 'Range +28'), U('Enhanced Eyesight', 120, { '+rng': 26, camo: 1 }, 'Spots camo bloons'), U('Crossbow', 780, { dmg: 2, '+pr': 3, '+rng': 22, '*cd': .8, sp: 700, shape: 'bolt' }, 'Crossbow bolts, damage 2'), U('Sharp Shooter', 1500, { dmg: 5, '+pr': 3, lead: 1, '+rng': 15, '*cd': .85 }, 'Powerful bolts pop lead'), U('Crossbow Master', 23000, { dmg: 5, '*cd': .13, '+pr': 4, lead: 1, '+rng': 20 }, 'Machine-gun crossbow')]] },
    { id: 'tack', n: 'Tack Shooter', key: 'R', cost: 280, d: 'Fires tacks in every direction.',
      b: { k: 't', cd: 1.45, rng: 72, dmg: 1, pr: 1, sp: 320, dt: SH, n: 8, shape: 'tack' },
      pn: ['Fire', 'Reach', 'Volume'],
      u: [[U('Faster Shooting', 150, { '*cd': .75 }, 'Shoots 33% faster'), U('Even Faster Shooting', 250, { '*cd': .7 }, 'Shoots 40% faster'), U('Hot Shots', 500, { bl: 24, bd: 1, bt: EX }, 'Tacks explode on impact'), U('Ring of Fire', 3500, { au: 1, aut: .55, aur: 70, aud: FI }, 'Ring of fire burns nearby bloons'), U('Inferno Ring', 15000, { au: 3, aut: .35, aur: 85, aud: FI, '+dM': 2 }, 'Blazing ring, hits all around')],
        [U('Long Range Tacks', 100, { '+rng': 16 }, 'Range +16'), U('Super Range Tacks', 225, { '+rng': 18 }, 'Range +18'), U('Blade Shooter', 680, { dmg: 2, '+pr': 3, sp: 430, '*cd': .85, shape: 'blade', lead: 1 }, 'Blades pierce and pop lead'), U('Blade Maelstrom', 2800, { ab: 'swirl' }, 'Ability: whirling blade storm'), U('Super Maelstrom', 15000, { ab: 'swirl2', '*cd': .8 }, 'Ability: huge blade storm')],
        [U('More Tacks', 150, { n: 10 }, '10 tacks per volley'), U('Even More Tacks', 280, { n: 12 }, '12 tacks per volley'), U('Tack Sprayer', 600, { n: 16, '*cd': .55 }, '16 tacks, much faster'), U('Overdrive', 3800, { ab: 'rate', '*cd': .85 }, 'Ability: massive burst of speed'), U('The Tack Zone', 18000, { n: 24, '*cd': .4, '+rng': 18 }, 'A hurricane of tacks')]] },
    { id: 'bomb', n: 'Bomb Shooter', key: 'E', cost: 525, d: 'Lobs bombs that explode into a blast.',
      b: { k: 'p', cd: 1.6, rng: 140, dmg: 1, pr: 1, sp: 380, dt: EX, bl: 46, bd: 1, bpr: 20, shape: 'bomb' },
      pn: ['Blast', 'Missiles', 'Cluster'],
      u: [[U('Bigger Bombs', 400, { '+bl': 14, '+bpr': 8 }, 'Bigger explosions'), U('Heavy Bombs', 400, { '+bd': 1 }, 'Blast damage +1'), U('Really Big Bombs', 900, { '+bl': 18, '+bpr': 12, '+bd': 1 }, 'Huge blast, damage +1'), U('Bloon Impact', 3200, { stun: 1.4, '+bd': 1, '+dM': 20 }, 'Stuns bloons in the blast'), U('Bloon Crush', 16000, { stun: 2.5, '+bd': 4, '+dM': 90 }, 'Crushing blast, stuns MOABs')],
        [U('Faster Reload', 250, { '*cd': .8 }, 'Reloads 25% faster'), U('Missile Launcher', 400, { sp: 900, '+rng': 25, '*cd': .85 }, 'Fast missiles, more range'), U('MOAB Mauler', 900, { '+dM': 22 }, '+22 damage to MOAB-class'), U('MOAB Assassin', 2800, { '+dM': 90, '*cd': .8 }, '+90 damage to MOAB-class'), U('MOAB Eliminator', 20000, { '+dM': 450, '*cd': .6, '+bd': 2 }, 'Annihilates blimps')],
        [U('Extra Range', 300, { '+rng': 22 }, 'Range +22'), U('Frag Bombs', 400, { fr: 8 }, 'Explode into 8 sharp frags'), U('Cluster Bombs', 700, { cl: 5 }, 'Explode into 5 mini bombs'), U('Recursive Cluster', 3200, { cl: 9, fr: 10, '+bl': 8 }, 'Clusters of clusters'), U('Bomb Blitz', 25000, { ab: 'blitz', '*cd': .85 }, 'Ability: bombs rain on everything')]] },
    { id: 'ice', n: 'Ice Monkey', key: 'T', cost: 500, d: 'Freezes nearby bloons solid.',
      b: { k: 'i', cd: 2.2, rng: 82, dmg: 1, dt: CO, frz: 1.3, mf: .2, shape: 'ice' },
      pn: ['Freeze', 'Brittle', 'Cold'],
      u: [[U('Enhanced Freeze', 225, { '+frz': .5 }, 'Freezes for longer'), U('Deep Freeze', 400, { '+frz': .6, mf: .6 }, 'Freezes MOAB-class longer'), U('Arctic Wind', 3500, { '+rng': 22, pf: .6, pft: 2.5 }, 'Bloons stay slowed after thaw'), U('Snowstorm', 4500, { ab: 'chill' }, 'Ability: slows every bloon'), U('Absolute Zero', 18000, { ab: 'freeze', '+frz': 1 }, 'Ability: freezes everything')],
        [U('Permafrost', 150, { pf: .75, pft: 3 }, 'Bloons stay slow after thaw'), U('Cold Snap', 250, { camo: 1, '+rng': 10 }, 'Spots camo, more range'), U('Ice Shards', 1500, { fr: 8 }, 'Pulses shed ice shards'), U('Embrittlement', 2500, { vul: 1, vult: 3 }, 'Frozen bloons take +1 damage'), U('Super Brittle', 18000, { vul: 3, vult: 4, '+dmg': 1 }, 'Frozen bloons take +3 damage')],
        [U('Larger Radius', 100, { '+rng': 18 }, 'Range +18'), U('Re-Freeze', 250, { '*cd': .75 }, 'Pulses 33% faster'), U('Cryo Cannon', 1900, { '^x': { cd: 1.3, rng: 160, dmg: 1, pr: 4, sp: 460, dt: CO, frz: .8, shape: 'ice', bl: 0 } }, 'Adds a cryo ice cannon'), U('Icicles', 3500, { '^x': { cd: .7, rng: 120, dmg: 2, pr: 6, sp: 380, dt: CO, frz: .6, n: 3, spr: .5, shape: 'icicle' } }, 'Icicle spray hits many bloons'), U('Icicle Impale', 18000, { '^x': { cd: .5, rng: 150, dmg: 4, pr: 10, sp: 600, dt: CO, frz: 1.5, n: 2, spr: .3, shape: 'icicle', dM: 40, lead: 1 } }, 'Giant impaling icicles')]] },
    { id: 'glue', n: 'Glue Gunner', key: 'Y', cost: 275, d: 'Slows bloons with sticky glue.',
      b: { k: 'p', cd: 1.35, rng: 135, dmg: 0, pr: 1, sp: 420, dt: AC, gl: .5, gt: 3.2, shape: 'glue' },
      pn: ['Corrosion', 'Splatter', 'Stickiness'],
      u: [[U('Glue Soak', 250, { gk: 1, '+gt': 1.5 }, 'Glue soaks into popped layers'), U('Corrosive Glue', 300, { gdot: 1.4 }, 'Glue eats bloons slowly'), U('Bloon Dissolver', 3000, { gdot: 6 }, 'Dissolves bloons quickly'), U('Bloon Liquefier', 3500, { gdot: 14, gk: 1, '+gt': 2 }, 'Liquefies bloons'), U('The Bloon Solver', 20000, { gdot: 34, '+gt': 3, '+dM': 4 }, 'Solves all bloon problems')],
        [U('Bigger Globs', 100, { pr: 3 }, 'Glue sticks to 3 bloons'), U('Glue Splatter', 1000, { gs: 42, pr: 4 }, 'Glue splashes nearby bloons'), U('Glue Hose', 1200, { '*cd': .35, gs: 38 }, 'Sprays glue constantly'), U('Glue Strike', 2900, { ab: 'glueAll' }, 'Ability: glues every bloon'), U('Glue Storm', 3300, { ab: 'glueAll2', '*cd': .8 }, 'Ability: powerful glue storm')],
        [U('Stickier Glue', 100, { '+gt': 3 }, 'Glue lasts longer'), U('Stronger Glue', 200, { gl: .3 }, 'Slows bloons much more'), U('MOAB Glue', 2000, { mg: 1, '+rng': 15 }, 'Glue works on MOAB-class'), U('Relentless Glue', 3000, { gl: .22, '+gt': 8, '*cd': .8, mg: 1 }, 'Long lasting sticky glue'), U('Super Glue', 20000, { gl: .08, '+gt': 30, '+rng': 25, mg: 1, '*cd': .6 }, 'Nearly freezes bloons in place')]] },
    { id: 'sniper', n: 'Sniper Monkey', key: 'Z', cost: 350, d: 'Hits any bloon on the map.',
      b: { k: 'p', sn: 1, cd: 1.7, rng: 9999, dmg: 2, pr: 1, dt: NO, shape: 'snipe' },
      pn: ['Power', 'Rate', 'Tactics'],
      u: [[U('Full Metal Jacket', 350, { '+dmg': 2 }, 'Damage +2'), U('Large Calibre', 600, { '+dmg': 3, '+dC': 3 }, 'Damage +3, hits ceramics harder'), U('Deadly Precision', 1600, { '+dmg': 12, '+dM': 12 }, 'Damage +12'), U('Maim MOAB', 2500, { '+dM': 50, mm: 1 }, 'Slows MOAB-class on hit'), U('Cripple MOAB', 10000, { '+dM': 400, mm: 1, '*cd': .8 }, 'Cripples MOAB-class')],
        [U('Fast Firing', 300, { '*cd': .7 }, 'Shoots 43% faster'), U('Even Faster Firing', 400, { '*cd': .7 }, 'Shoots 43% faster'), U('Semi-Automatic', 3500, { '*cd': .45 }, 'Semi-automatic rifle'), U('Full Auto Rifle', 5500, { '*cd': .35, '+dmg': 1 }, 'Fires a stream of bullets'), U('Elite Sniper', 16000, { '*cd': .35, '+dmg': 10, '+dM': 20 }, 'The ultimate sniper')],
        [U('Night Vision Goggles', 250, { camo: 1 }, 'Spots camo bloons'), U('Shrapnel Shot', 500, { bl: 32, bd: 1, bt: NO, bpr: 12 }, 'Shots burst into shrapnel'), U('Bouncing Bullet', 2800, { ric: 3 }, 'Bullets bounce to 3 more bloons'), U('Supply Drop', 5000, { inc: 380 }, 'Drops $380 each round'), U('Elite Defender', 14000, { inc: 900, '*cd': .6, ric: 5, '+dmg': 8 }, 'Defends the base, big supply drops')]] },
    { id: 'boom', n: 'Boomerang Monkey', key: 'W', cost: 325, d: 'Curved throws that come back.',
      b: { k: 'p', bm: 1, cd: 1.25, rng: 125, dmg: 1, pr: 5, sp: 430, dt: SH, shape: 'boom' },
      pn: ['Glaives', 'Tempo', 'Reach'],
      u: [[U('Improved Rangs', 200, { '+pr': 3, sp: 480 }, 'Pierce +3, flies faster'), U('Glaives', 280, { dmg: 2, '+pr': 6, shape: 'glaive' }, 'Spinning glaives, damage 2'), U('Glaive Ricochet', 1100, { bm: 0, ric: 7, pr: 30, sp: 650, '+rng': 10, shape: 'glaive' }, 'Glaives bounce from bloon to bloon'), U('M.O.A.R. Glaives', 3200, { dmg: 3, '+dM': 8, '*cd': .9 }, 'Hits blimps harder'), U('Glaive Lord', 22000, { dmg: 5, au: 3, aut: .22, aur: 62, aud: SH, '+dM': 20, '*cd': .75 }, 'Orbiting glaives shred everything')],
        [U('Faster Throwing', 200, { '*cd': .8 }, 'Throws 25% faster'), U('Faster Rangs', 280, { '*cd': .8, sp: 520 }, 'Throws 25% faster again'), U('Bionic Boomerang', 1800, { '*cd': .3, '+dmg': 1, '+pr': 3 }, 'Rapid-fire bionic rang'), U('Turbo Charge', 4000, { ab: 'rate', '*cd': .85 }, 'Ability: ultra fast throwing'), U('Perma Charge', 40000, { '*cd': .4, '+dmg': 2, au: 2, aut: .3, aur: 60, aud: SH }, 'Permanently overcharged')],
        [U('Long Range Rangs', 100, { '+rng': 28 }, 'Range +28'), U('Red Hot Rangs', 300, { dmg: 2, lead: 1 }, 'Red hot, pops lead'), U('Kylie Boomerang', 1500, { '*cd': .6, '+pr': 4 }, 'Faster, pierces more'), U('MOAB Press', 2800, { '+dmg': 2, '+dM': 28 }, 'Presses blimps hard'), U('MOAB Domination', 20000, { '+dmg': 4, '+dM': 120, '*cd': .8, '+pr': 6 }, 'Dominates blimps')]] },
    { id: 'ninja', n: 'Ninja Monkey', key: 'D', cost: 500, d: 'Fast shurikens. Sees camo.',
      b: { k: 'p', cd: .72, rng: 150, dmg: 1, pr: 2, sp: 640, dt: SH, camo: 1, shape: 'shuriken' },
      pn: ['Discipline', 'Subterfuge', 'Bombs'],
      u: [[U('Ninja Discipline', 300, { '*cd': .85, '+rng': 14 }, 'Faster, more range'), U('Sharp Shurikens', 350, { '+pr': 3 }, 'Shurikens pierce 3 more'), U('Double Shot', 850, { n: 2, spr: .12 }, 'Throws two shurikens'), U('Bloonjitsu', 3100, { n: 5, spr: .14 }, 'Throws five shurikens'), U('Grandmaster Ninja', 33000, { n: 10, spr: .12, '*cd': .6, '+dmg': 1, '+pr': 3 }, 'Ten shurikens, blazing fast')],
        [U('Distraction', 250, { kb: 36, kbp: .15 }, 'Bloons sometimes get pushed back'), U('Counter-Espionage', 350, { dc: 1 }, 'Hit bloons lose camo'), U('Shinobi Tactics', 1500, { bfn: { r: 200, cd: .85 }, '*cd': .85 }, 'Nearby ninjas attack faster'), U('Bloon Sabotage', 4000, { ab: 'slowAll' }, 'Ability: slows every bloon'), U('Grand Saboteur', 35000, { ab: 'slowAll2', bfn: { r: 240, cd: .7 } }, 'Ability: cripples every bloon')],
        [U('Seeking Shuriken', 350, { hom: 1 }, 'Shurikens seek their targets'), U('Caltrops', 400, { '^x': { cd: 2.4, rng: 110, tp: 1, pr: 8, dmg: 1, dt: SH, life: 11, shape: 'caltrop' } }, 'Drops spikes on the track'), U('Flash Bomb', 1100, { '^x': { cd: 2.3, rng: 150, dmg: 1, pr: 1, sp: 460, dt: NO, bl: 46, bd: 1, stun: .9, bpr: 20, shape: 'flash' } }, 'Throws stunning flash bombs'), U('Sticky Bomb', 3000, { '^x': { cd: 1.7, rng: 170, dmg: 1, pr: 1, sp: 480, dt: EX, bl: 56, bd: 3, dM: 25, stun: 2, bpr: 25, shape: 'bomb' } }, 'Sticky bombs hammer blimps'), U('Master Bomber', 25000, { '^x': { cd: .9, rng: 190, dmg: 1, pr: 1, sp: 560, dt: EX, bl: 70, bd: 6, dM: 90, stun: 2.5, bpr: 40, shape: 'bomb' }, '*cd': .8 }, 'Rapid sticky bombs')]] },
    { id: 'wizard', n: 'Wizard Monkey', key: 'A', cost: 400, d: 'Casts magic bolts. Purples are immune.',
      b: { k: 'p', cd: 1.1, rng: 140, dmg: 1, pr: 3, sp: 470, dt: MA, shape: 'magic' },
      pn: ['Arcane', 'Fire', 'Necromancy'],
      u: [[U('Guided Magic', 150, { hom: 1 }, 'Bolts seek their targets'), U('Arcane Blast', 400, { '+dmg': 1, '*cd': .85 }, 'Damage +1, faster'), U('Arcane Mastery', 1200, { '+dmg': 3, '*cd': .65, '+rng': 15, '+pr': 3 }, 'Powerful arcane bolts'), U('Arcane Spike', 7000, { '+dmg': 6, '*cd': .6, '+pr': 5, '+dM': 6 }, 'Giant spikes of arcane power'), U('Archmage', 14000, { '+dmg': 8, '*cd': .4, '+rng': 25, n: 2, spr: .1, '+dM': 12 }, 'Casts a barrage of bolts')],
        [U('Fireball', 250, { bl: 34, bd: 1, dt: FI, bt: FI, shape: 'fire' }, 'Bolts burst into fire'), U('Wall of Fire', 650, { '^x': { cd: 3.2, rng: 120, tp: 1, pr: 14, dmg: 1, dt: FI, life: 7, shape: 'flame' } }, 'Lays walls of fire on the track'), U('Dragon’s Breath', 1500, { '^x': { cd: .12, rng: 85, dmg: 1, pr: 8, sp: 380, dt: FI, life: .4, n: 2, spr: .4, shape: 'flame' } }, 'Breathes a cone of fire'), U('Summon Phoenix', 7000, { ab: 'phoenix' }, 'Ability: a phoenix scorches all'), U('Tempest Tornado', 25000, { ab: 'tornado', '*cd': .8 }, 'Ability: a mighty tornado')],
        [U('Intense Magic', 200, { '+rng': 24 }, 'Range +24'), U('Monkey Sense', 300, { camo: 1, '+rng': 10 }, 'Spots camo bloons'), U('Shimmer', 1100, { dc: 1, '+dmg': 1 }, 'Hit bloons lose camo'), U('Unpopped Army', 2300, { '^x': { cd: .9, rng: 190, dmg: 2, pr: 8, sp: 340, dt: MA, hom: 1, n: 2, spr: .5, shape: 'skull' } }, 'Raises homing skulls'), U('Prince of Darkness', 7000, { '^x': { cd: .5, rng: 220, dmg: 5, pr: 14, sp: 380, dt: MA, hom: 1, n: 3, spr: .6, shape: 'skull', dM: 12 } }, 'A horde of dark skulls')]] },
    { id: 'super', n: 'Super Monkey', key: 'S', cost: 2500, d: 'Shoots a blur of darts. Costly.',
      b: { k: 'p', cd: .1, rng: 170, dmg: 1, pr: 1, sp: 740, dt: SH, shape: 'dart' },
      pn: ['Sun', 'Night', 'Tech'],
      u: [[U('Laser Blasts', 1500, { dmg: 1, '+pr': 1, dt: MA, shape: 'laser' }, 'Lasers pierce, pop lead'), U('Plasma Vision', 3000, { camo: 1, dmg: 2, dt: PL, '+pr': 2, shape: 'plasma' }, 'Plasma, spots camo'), U('Sun Avatar', 13000, { dmg: 3, '+pr': 3, '*cd': .8, au: 1, aut: .25, aur: 60, aud: PL }, 'Burning sun beams'), U('Sun Temple', 60000, { dmg: 6, '+pr': 6, '*cd': .6, au: 3, aut: .2, aur: 90, aud: PL, '+dM': 6 }, 'A temple of sun power'), U('True Sun God', 140000, { dmg: 15, '+pr': 12, '*cd': .5, au: 8, aut: .15, aur: 120, aud: PL, '+dM': 20, n: 2, spr: .15 }, 'Burns the whole screen')],
        [U('Knockback', 800, { kb: 28, kbp: .3 }, 'Darts knock bloons back'), U('Ultravision', 1100, { camo: 1, '+rng': 25 }, 'Spots camo, more range'), U('Dark Knight', 11000, { '+dmg': 2, '+pr': 3, '*cd': .8, lead: 1 }, 'Dark darts, pops lead'), U('Dark Champion', 25000, { '+dmg': 4, '+pr': 6, '*cd': .6, '+dM': 4 }, 'The dark champion'), U('Legend of the Night', 60000, { '+dmg': 8, '+pr': 10, '*cd': .5, '+dM': 20, au: 3, aut: .25, aur: 100, aud: SH, lead: 1 }, 'A legend is born')],
        [U('Super Range', 1000, { '+rng': 45 }, 'Range +45'), U('Epic Range', 1200, { '+rng': 55, '+pr': 2 }, 'Range +55, pierce +2'), U('Robo Monkey', 6000, { n: 2, spr: .12, dt: NO }, 'Fires two streams'), U('Tech Terror', 12000, { n: 3, spr: .16, ab: 'nuke', '*cd': .8 }, 'Ability: obliterates bloons'), U('The Anti-Bloon', 60000, { n: 4, spr: .14, dmg: 4, '+pr': 6, '*cd': .5, '+dM': 12, lead: 1 }, 'The ultimate anti-bloon weapon')]] },
    { id: 'farm', n: 'Banana Farm', key: 'H', cost: 1000, d: 'Pays you at the end of each round.',
      b: { k: 'f', rng: 0, inc: 80, shape: 'farm' },
      pn: ['Production', 'Banking', 'Trade'],
      u: [[U('Increased Production', 500, { '+inc': 40 }, '+$40 per round'), U('Greater Production', 800, { '+inc': 70 }, '+$70 per round'), U('Banana Plantation', 3500, { '+inc': 250 }, '+$250 per round'), U('Banana Research Facility', 10000, { '+inc': 900 }, '+$900 per round'), U('Banana Central', 30000, { '+inc': 3200 }, '+$3200 per round')],
        [U('Long Life Bananas', 200, { '+inc': 25 }, '+$25 per round'), U('Valuable Bananas', 300, { '+inc': 45 }, '+$45 per round'), U('Monkey Bank', 3500, { bank: 1, '+inc': 110, bcap: 9000 }, 'Stores cash. Collect any time'), U('IMF Loan', 8500, { '+inc': 300, bcap: 22000 }, 'Bigger bank, more income'), U('Monkey-Nomics', 32000, { '+inc': 900, bcap: 60000, ab: 'cash' }, 'Ability: instant bank payout')],
        [U('EZ Collect', 200, { '+inc': 15 }, '+$15 per round'), U('Banana Salvage', 600, { '+inc': 35, sellb: .1 }, '+$35, sells for more'), U('Marketplace', 1800, { '+inc': 130 }, '+$130 per round'), U('Central Market', 6000, { '+inc': 480 }, '+$480 per round'), U('Monkey Wall Street', 36000, { '+inc': 2600 }, '+$2600 per round')]] },
    { id: 'village', n: 'Monkey Village', key: 'L', cost: 1200, d: 'Boosts the range of nearby monkeys.',
      b: { k: 'v', rng: 120, vr: 1.1, shape: 'village' },
      pn: ['Training', 'Support', 'Commerce'],
      u: [[U('Bigger Radius', 400, { '+rng': 30 }, 'Larger area of effect'), U('Jungle Drums', 1500, { vcd: .85 }, 'Nearby monkeys attack 18% faster'), U('Primary Training', 2500, { vpr: 1, vd: 0 }, 'Nearby monkeys pierce +1'), U('Primary Mentoring', 3600, { vcd: .75, vr: 1.2 }, 'Even faster and more range'), U('Primary Expertise', 50000, { vcd: .6, vd: 1, vpr: 2 }, 'Experts: faster, stronger')],
        [U('Grow Blocker', 400, { vgb: 1 }, 'Bloons in range lose regrow'), U('Radar Scanner', 800, { vcamo: 1 }, 'Nearby monkeys spot camo'), U('Monkey Intelligence Bureau', 4000, { vcamo: 1, '+rng': 25, vr: 1.15 }, 'More range and camo detection'), U('Call to Arms', 9000, { ab: 'cta' }, 'Ability: all monkeys speed up'), U('Homeland Defense', 25000, { ab: 'hd' }, 'Ability: massive global boost')],
        [U('Monkey Business', 500, { vdisc: .1 }, 'Upgrades 10% cheaper nearby'), U('Monkey Commerce', 1000, { vdisc: .2 }, 'Upgrades 20% cheaper nearby'), U('Monkey Town', 2500, { inc: 300 }, '+$300 per round'), U('Monkey City', 8000, { inc: 900, vdisc: .25 }, '+$900 per round'), U('Monkey Metropolis', 25000, { inc: 2800, vdisc: .3 }, '+$2800 per round')]] },
    { id: 'sub', n: 'Monkey Sub', key: 'X', cost: 325, water: 1, d: 'Water only. Fires darts from below.',
      b: { k: 'p', cd: .85, rng: 150, dmg: 1, pr: 2, sp: 560, dt: SH, shape: 'dart' },
      pn: ['Support', 'Missiles', 'Guns'],
      u: [[U('Longer Range', 130, { '+rng': 30 }, 'Range +30'), U('Advanced Intel', 500, { camo: 1 }, 'Spots camo bloons'), U('Submerge and Support', 800, { '+rng': 25, bfn: { r: 220, cd: .88 } }, 'Boosts nearby water monkeys'), U('Bloontonium Reactor', 14000, { au: 3, aut: .3, aur: 90, aud: MA, '+rng': 15 }, 'Radioactive aura'), U('Energizer', 40000, { au: 9, aut: .2, aur: 130, aud: MA, bfn: { r: 260, cd: .65 } }, 'Energizes nearby towers')],
        [U('Barbed Darts', 150, { '+pr': 3, '*cd': .9 }, 'Pierce +3'), U('Heat-tipped Darts', 400, { dmg: 2, lead: 1 }, 'Pops lead'), U('Ballistic Missile', 700, { '^x': { cd: 3.4, rng: 9999, dmg: 1, pr: 1, sp: 520, dt: EX, bl: 54, bd: 3, bpr: 25, glob: 1, shape: 'missile' } }, 'Launches missiles anywhere'), U('First Strike Capability', 4200, { ab: 'strike' }, 'Ability: missiles hit everything'), U('Pre-Emptive Strike', 25000, { ab: 'strike2', '*cd': .8 }, 'Ability: devastating strike')],
        [U('Twin Guns', 400, { n: 2, spr: .12 }, 'Two darts per shot'), U('Airburst Darts', 500, { bl: 26, bd: 1, bt: SH, '+pr': 1 }, 'Darts burst on impact'), U('Triple Guns', 1800, { n: 3, spr: .16, '*cd': .85 }, 'Three darts per shot'), U('Armor Piercing Darts', 3200, { '+dmg': 2, lead: 1, '+dC': 3, '+dM': 6 }, 'Pierce armor, hit ceramics'), U('Sub Commander', 12000, { '*cd': .45, n: 4, spr: .2, bfn: { r: 260, cd: .8 } }, 'Commands the fleet')]] },
    { id: 'boat', n: 'Monkey Buccaneer', key: 'C', cost: 500, water: 1, d: 'Water only. A ship with a cannon.',
      b: { k: 'p', cd: 1, rng: 155, dmg: 1, pr: 3, sp: 580, dt: SH, shape: 'dart' },
      pn: ['Cannons', 'Trade', 'Grape'],
      u: [[U('Faster Shooting', 350, { '*cd': .75 }, 'Shoots 33% faster'), U('Double Shot', 550, { n: 2, spr: .1 }, 'Fires two shots'), U('Destroyer', 2800, { n: 4, spr: .12, '*cd': .55 }, 'Fires four shots, fast'), U('Aircraft Carrier', 14000, { '^x': { cd: .35, rng: 9999, dmg: 2, pr: 4, sp: 520, dt: SH, hom: 1, glob: 1, shape: 'plane' } }, 'Launches homing planes'), U('Carrier Flagship', 50000, { '^x': { cd: .2, rng: 9999, dmg: 5, pr: 8, sp: 560, dt: SH, hom: 1, glob: 1, n: 2, spr: .3, shape: 'plane', dM: 12, lead: 1 } }, 'A fleet of planes')],
        [U('Long Range', 200, { '+rng': 30 }, 'Range +30'), U('Crow’s Nest', 500, { camo: 1, '+rng': 22 }, 'Spots camo bloons'), U('Merchantman', 2400, { inc: 190 }, '+$190 per round'), U('Favored Trades', 12000, { inc: 750 }, '+$750 per round'), U('Trade Empire', 30000, { inc: 3000, bfn: { r: 240, cd: .85 } }, '+$3000 per round')],
        [U('Grape Shot', 450, { n: 5, spr: .26, pr: 2 }, 'Fires five grapes'), U('Hot Shot', 700, { bl: 30, bd: 1, bt: EX }, 'Explosive shots'), U('Cannon Ship', 2400, { '^x': { cd: 1.5, rng: 190, dmg: 1, pr: 1, sp: 440, dt: EX, bl: 54, bd: 3, bpr: 25, shape: 'bomb' } }, 'Adds a bomb cannon'), U('Monkey Pirates', 5500, { '^x': { cd: .7, rng: 200, dmg: 2, pr: 8, sp: 480, dt: SH, hom: 1, n: 2, spr: .4, shape: 'dart' } }, 'Pirates fire homing darts'), U('Pirate Lord', 20000, { '^x': { cd: .4, rng: 230, dmg: 6, pr: 14, sp: 520, dt: SH, hom: 1, n: 3, spr: .5, lead: 1, dM: 16, shape: 'dart' }, '*cd': .6 }, 'Rules the seas')]] }
  ];
  const TWI = {};
  TW.forEach((t, i) => { t.i = i; TWI[t.id] = t; });

  const ABIL = {
    fan: { n: 'Fan Club', cd: 45, t: 12, ar: 260, m: .13, add: 1 },
    fan2: { n: 'Plasma Fans', cd: 40, t: 18, ar: 300, m: .08, add: 3 },
    rate: { n: 'Overdrive', cd: 28, t: 8, m: .4 },
    swirl: { n: 'Blade Maelstrom', cd: 35, t: 8, au: 2, aut: .12, aur: 100, aud: SH },
    swirl2: { n: 'Super Maelstrom', cd: 30, t: 10, au: 5, aut: .1, aur: 130, aud: SH },
    blitz: { n: 'Bomb Blitz', cd: 50, ad: 8, adM: 160, dt: EX },
    chill: { n: 'Snowstorm', cd: 40, t: 10, m: .55 },
    freeze: { n: 'Absolute Zero', cd: 55, t: 6, all: 1 },
    glueAll: { n: 'Glue Strike', cd: 50, t: 12, m: .45 },
    glueAll2: { n: 'Glue Storm', cd: 40, t: 18, m: .25, dot: 3 },
    slowAll: { n: 'Bloon Sabotage', cd: 50, t: 14, m: .55 },
    slowAll2: { n: 'Grand Saboteur', cd: 45, t: 18, m: .3 },
    phoenix: { n: 'Summon Phoenix', cd: 55, t: 18, au: 4, aut: .25, aur: 170, aud: FI },
    tornado: { n: 'Tempest Tornado', cd: 55, t: 12, au: 3, aut: .2, aur: 200, aud: NO, auk: 22 },
    strike: { n: 'First Strike', cd: 50, ad: 5, adM: 220, dt: EX },
    strike2: { n: 'Pre-Emptive Strike', cd: 45, ad: 10, adM: 700, dt: EX },
    nuke: { n: 'Obliterate', cd: 60, ad: 10, adM: 320, dt: PL },
    cash: { n: 'Payout', cd: 80, cash: 1 },
    cta: { n: 'Call to Arms', cd: 55, t: 10, gm: .78 },
    hd: { n: 'Homeland Defense', cd: 70, t: 15, gm: .6 }
  };

  const MAXP = 5;
  const tiersOk = (tr, path) => {
    if (tr[path] >= MAXP) return false;
    const t = tr.slice(); t[path]++;
    const used = t.filter(v => v > 0).length, hi = t.filter(v => v > 2).length;
    return used <= 2 && hi <= 1;
  };
  const blocked = (tr, path) => {
    if (tr[path] >= MAXP) return 'Maxed';
    const t = tr.slice(); t[path]++;
    if (t.filter(v => v > 0).length > 2) return 'Locked';
    if (t.filter(v => v > 2).length > 1) return 'Locked';
    return '';
  };
  const resolve = (def, tr) => {
    const st = Object.assign({}, def.b);
    st.x = [];
    for (let p = 0; p < 3; p++) for (let i = 0; i < tr[p]; i++) {
      const pt = def.u[p][i].p;
      for (const k in pt) {
        const c = k[0], key = k.slice(1);
        if (c === '+') st[key] = (st[key] || 0) + pt[k];
        else if (c === '*') st[key] = (st[key] === undefined ? 1 : st[key]) * pt[k];
        else if (c === '^') st[key].push(Object.assign({}, pt[k]));
        else st[k] = pt[k];
      }
    }
    return st;
  };
  const CS = 40, GX = Math.ceil(MW / CS) + 1, GY = Math.ceil(MH / CS) + 1, DT = 1 / 60;
  const TGN = ['First', 'Last', 'Close', 'Strong'];
  const SHAPE_R = { dart: 4.5, tack: 3.5, bolt: 5, spike: 9, bomb: 6, boom: 11, glaive: 11, shuriken: 6, magic: 7, fire: 8, laser: 4, plasma: 6, glue: 7, ice: 8, icicle: 5, blade: 6, snipe: 2, flash: 6, skull: 7, flame: 9, missile: 6, plane: 7, caltrop: 12 };

  function newBloon() { return { id: 0, t: 0, hp: 1, d: 0, x: 0, y: 0, a: 0, p: 0, camo: false, reg: false, fort: false, mx: -1, rg: 0, fz: 0, sl: 1, slt: 0, gl: 0, gw: 1, gd: 0, gacc: 0, vul: 0, vm: 0, stn: 0, dead: false, big: false, mhp: 0 }; }
  function newProj() { return { on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, pr: 0, A: null, T: null, hl: [], hlt: [], sh: 'dart', hr: 5, bm: false, tp: false, ang: 0, ric: 0, tgt: null, dmgAdd: 0, t0: 0, dur: 0, ox: 0, oy: 0, ax: 0, ay: 0, bx: 0, by: 0, spin: 0, camoOk: false }; }

  function makeGame(o) {
    const map = MAPS[o.map], mode = MODES[o.mode];
    const g = {
      mi: o.map, mid: o.mode, map, mode, cash: mode.cash, lives: mode.lives, round: mode.from - 1, running: false, tr: 0, plan: null, ei: 0,
      bl: [], free: [], hb: [], head: new Int32Array(GX * GY).fill(-1), nxt: new Int32Array(4096), bigs: [], nid: 1,
      towers: [], pj: [], pjFree: [], parts: [], texts: [], rings: [], bolts: [],
      won: false, lost: false, free2: false, pops: 0, earned: 0, leaked: 0, shake: 0, time: 0,
      chT: 0, chM: 1, slT: 0, slM: 1, gmT: 0, gm: 1, bs: 1, spawnT: 0, flash: 0, lastPop: 0, sfx: o.sfx || (() => {}),
      q1: [], q2: [], q3: [], q4: [], tmp: { x: 0, y: 0, a: 0 }, tuid: 1
    };
    return g;
  }

  const roundTo5 = v => Math.max(5, Math.round(v / 5) * 5);
  const towerCost = (g, tw) => roundTo5(tw.cost * g.mode.cost);
  const upgCost = (g, T, p) => roundTo5(TW[T.id].u[p][T.tr[p]].c * g.mode.cost * (1 - (T.vb.disc || 0)));
  const sellVal = T => Math.floor(T.paid * (.7 + (T.st.sellb || 0)) + (T.bank || 0));

  function spawnBloon(g, t, fl, d, pi, src) {
    const b = g.free.length ? g.free.pop() : newBloon();
    b.id = g.nid++; b.t = t; b.fort = !!(fl & 4) || (src ? src.fort : false);
    b.camo = !!(fl & 1) || t === T_DDT || (src ? src.camo : false);
    b.reg = !!(fl & 2) || (src ? src.reg : false);
    b.big = !!BT[t].big;
    b.hp = hpOf(t, b.fort) * (b.big ? blimpHp(g.round) : 1); b.mhp = b.hp;
    b.d = d < 0 ? 0 : d; b.p = pi; b.dead = false;
    b.mx = b.reg && t <= 4 ? t : -1; b.rg = 3;
    b.fz = 0; b.sl = 1; b.slt = 0; b.gl = 0; b.gw = 1; b.gd = 0; b.gacc = 0; b.vul = 0; b.vm = 0; b.stn = 0;
    pathAt(g.map.pathObjs[pi], b.d, g.tmp);
    b.x = g.tmp.x; b.y = g.tmp.y; b.a = g.tmp.a;
    g.bl.push(b);
    return b;
  }

  function addPart(g, x, y, c, n, sp, life, sz) {
    for (let i = 0; i < n; i++) {
      if (g.parts.length >= 420) return;
      const a = Math.random() * TAU, s = sp * (.4 + Math.random() * .8);
      g.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: life * (.6 + Math.random() * .4), ml: life, c, s: sz * (.6 + Math.random() * .6) });
    }
  }
  function addText(g, x, y, s, c) { if (g.texts.length < 60) g.texts.push({ x, y, l: 1.1, s, c }); }
  function addRing(g, x, y, r, c, life) { if (g.rings.length < 40) g.rings.push({ x, y, r, c, l: life, ml: life }); }

  function near(g, x, y, r, out, rad) {
    out.length = 0;
    const rr = rad ? r + 14 : r;
    const x0 = Math.max(0, ((x - rr) / CS) | 0), x1 = Math.min(GX - 1, ((x + rr) / CS) | 0), y0 = Math.max(0, ((y - rr) / CS) | 0), y1 = Math.min(GY - 1, ((y + rr) / CS) | 0);
    const hb = g.hb, nxt = g.nxt, head = g.head;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      for (let i = head[cy * GX + cx]; i >= 0; i = nxt[i]) {
        const b = hb[i];
        if (b.dead) continue;
        const dx = b.x - x, dy = b.y - y, q = rad ? r + BT[b.t].r : r;
        if (dx * dx + dy * dy <= q * q) out.push(b);
      }
    }
    const bg = g.bigs;
    for (let i = 0; i < bg.length; i++) {
      const b = bg[i];
      if (b.dead) continue;
      const dx = b.x - x, dy = b.y - y, q = rad ? r + BT[b.t].r : r;
      if (dx * dx + dy * dy <= q * q) out.push(b);
    }
    return out;
  }

  function rebuildHash(g) {
    const bl = g.bl;
    let j = 0;
    for (let i = 0; i < bl.length; i++) { const b = bl[i]; if (b.dead) g.free.push(b); else bl[j++] = b; }
    bl.length = j;
    g.head.fill(-1);
    g.hb.length = 0; g.bigs.length = 0;
    if (g.nxt.length < j + 8) g.nxt = new Int32Array(j * 2 + 64);
    const head = g.head, nxt = g.nxt, hb = g.hb;
    for (let i = 0; i < j; i++) {
      const b = bl[i];
      if (b.big) { g.bigs.push(b); continue; }
      const cx = clamp((b.x / CS) | 0, 0, GX - 1), cy = clamp((b.y / CS) | 0, 0, GY - 1), c = cy * GX + cx, k = hb.length;
      hb.push(b); nxt[k] = head[c]; head[c] = k;
    }
  }

  const speedOf = (g, b) => {
    if (b.fz > 0 || b.stn > 0) return 0;
    let v = BT[b.t].sp * BASE_SPEED * (b.big ? g.bs : 1);
    if (b.slt > 0) v *= b.sl;
    if (b.gl > 0) v *= b.gw;
    if (g.chT > 0) v *= g.chM;
    if (g.slT > 0) v *= g.slM;
    return v;
  };

  const strength = b => RBE[b.t] - BT[b.t].hp + b.hp;
  function hurt(g, b, dmg, dt, A, T) {
    if (b.dead) return 0;
    const bt = BT[b.t], lead = A && A.lead;
    if ((dt & bt.im) && !(dt === SH && lead)) return 0;
    if (dt === SH && b.fz > 0 && !lead) return 0;
    if (A) { if (b.big) dmg += A.dM || 0; else if (b.t === T_CER) dmg += A.dC || 0; }
    if (b.vul > 0 && dmg > 0) dmg += b.vm;
    if (dmg <= 0) return 0;
    let pops = 0, left = dmg;
    const cm = cashMul(g.round);
    while (left > 0 && !b.dead) {
      if (b.hp > left) { b.hp -= left; if (b.big) { g.flash = 0; } break; }
      left -= b.hp; pops++;
      g.cash += BT[b.t].cash * cm; g.earned += BT[b.t].cash * cm;
      addPart(g, b.x, b.y, BT[b.t].c, b.big ? 10 : 3, b.big ? 140 : 90, .35, b.big ? 5 : 3);
      const kids = BT[b.t].k;
      if (!kids.length) { b.dead = true; break; }
      if (kids.length === 1) {
        b.t = kids[0]; b.hp = hpOf(b.t, b.fort); b.rg = 3;
        if (b.reg && b.mx < 0) b.mx = -1;
        continue;
      }
      b.dead = true;
      const n = kids.length, big = b.big, hh = left;
      for (let i = 0; i < n; i++) {
        const c = spawnBloon(g, kids[i], 0, b.d + (i - (n - 1) / 2) * (big ? 14 : 8), b.p, b);
        if (big) { c.sl = b.sl; c.slt = b.slt; c.fz = b.fz * .5; }
        if (A && A.gk && b.gl > 0) { c.gl = b.gl; c.gw = b.gw; c.gd = b.gd; }
        if (!big && hh > 0) pops += hurt(g, c, hh, dt, A, T);
      }
      break;
    }
    g.pops += pops;
    if (T) T.pops += pops;
    g.lastPopX = b.x; g.lastPopY = b.y;
    return pops;
  }

  function freezeB(b, t, A) {
    const bt = BT[b.t];
    if (bt.im & CO) return;
    const e = b.big ? t * (A.mf || .2) : t;
    if (e > b.fz) b.fz = e;
    if (A.pf) { const s = b.big ? 1 - (1 - A.pf) * .5 : A.pf; if (s <= b.sl || b.slt <= 0) { b.sl = s; b.slt = A.pft || 3; } }
    if (A.vul) { b.vul = A.vult || 3; b.vm = A.vul; }
  }
  function glueB(g, b, A) {
    if (b.big && !A.mg) return;
    const w = b.big ? 1 - (1 - A.gl) * .5 : A.gl;
    if (b.gl <= 0 || w < b.gw) b.gw = w;
    if (A.gt > b.gl) b.gl = A.gt;
    if (A.gdot && A.gdot > b.gd) b.gd = A.gdot;
  }

  const FRAG = { dmg: 1, pr: 2, dt: SH, shape: 'tack' };
  function addProj(g, T, A, x, y, ang, sp, life) {
    const p = g.pjFree.length ? g.pjFree.pop() : newProj();
    p.on = true; p.x = x; p.y = y; p.A = A; p.T = T;
    p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp; p.ang = ang;
    p.life = life; p.hl.length = 0; p.hlt.length = 0; p.sh = A.shape || 'dart'; p.hr = SHAPE_R[p.sh] || 5;
    p.bm = false; p.tp = false; p.tgt = null; p.ric = A.ric || 0; p.spin = Math.random() * TAU;
    p.pr = (A.pr || 1) + (T && T !== null ? T.padd : 0);
    p.dmgAdd = 0;
    g.pj.push(p);
    return p;
  }

  function predict(g, b, t, out) {
    const sp = speedOf(g, b), d = b.d + sp * t, path = g.map.pathObjs[b.p];
    pathAt(path, Math.min(d, path.len), out);
    return out;
  }

  function explode(g, x, y, A, T, extra) {
    const rad = A.bl * (extra || 1), cap = A.bpr || 20, out = g.q3;
    near(g, x, y, rad, out, true);
    const bt = A.bt || EX, bd = A.bd === undefined ? 1 : A.bd;
    let n = 0;
    for (let i = 0; i < out.length && n < cap; i++) {
      const b = out[i];
      if (b.dead) continue;
      n++;
      hurt(g, b, bd, bt, A, T);
      if (A.stun && !b.dead) b.stn = Math.max(b.stn, b.big ? A.stun * .5 : A.stun);
      if (A.frz && !b.dead) freezeB(b, A.frz, A);
    }
    addRing(g, x, y, rad, A.shape === 'fire' ? '#ff8a1c' : A.shape === 'flash' ? '#fff6b0' : '#ffd24d', .28);
    addPart(g, x, y, '#ff9a2e', 7, 160, .3, 4);
    g.sfx('boom', rad);
    if (A.cl) {
      for (let i = 0; i < A.cl; i++) {
        const a = Math.random() * TAU, r = rad * (.6 + Math.random() * 1.1), cx = x + Math.cos(a) * r, cy = y + Math.sin(a) * r;
        near(g, cx, cy, rad * .55, g.q2, true);
        for (let k = 0; k < g.q2.length && k < 10; k++) hurt(g, g.q2[k], 1, bt, A, T);
        addRing(g, cx, cy, rad * .55, '#ffbb55', .22);
      }
    }
    if (A.fr) {
      const o = Math.random() * TAU;
      for (let i = 0; i < A.fr; i++) { const a = o + i / A.fr * TAU; addProj(g, T, FRAG, x, y, a, 340, .32); }
    }
  }

  function detOf(T) { return !!(T.st.camo || T.vb.camo); }

  function pickTarget(g, T, A, rng, det) {
    const tg = T.tg, out = g.q1;
    if (rng > 5000) { out.length = 0; for (let i = 0; i < g.bl.length; i++) { const b = g.bl[i]; if (!b.dead) out.push(b); } }
    else near(g, T.x, T.y, rng, out, false);
    let best = null, bv = -1e9;
    for (let i = 0; i < out.length; i++) {
      const b = out[i];
      if (b.dead || (b.camo && !det)) continue;
      if (b.d < 0) continue;
      let v;
      if (tg === 0) v = b.d; else if (tg === 1) v = -b.d; else if (tg === 2) { const dx = b.x - T.x, dy = b.y - T.y; v = -(dx * dx + dy * dy); } else v = strength(b) * 1e4 + b.d;
      if (v > bv) { bv = v; best = b; }
    }
    return best;
  }

  function fireAttack(g, T, A, b, rng, isMain) {
    const det = detOf(T);
    const n = A.n || 1, sp = A.sp || 500;
    if (A.sn) {
      const dmg = (A.dmg || 1) + T.vb.d;
      hurtShot(g, T, A, b, dmg);
      T.aim = Math.atan2(b.y - T.y, b.x - T.x);
      g.bolts.push({ x1: T.x, y1: T.y, x2: b.x, y2: b.y, l: .12, c: '#fff6a8' });
      if (A.bl) explode(g, b.x, b.y, A, T);
      if (A.ric) ricochetShot(g, T, A, b, dmg);
      T.recoil = 1;
      g.sfx('snipe');
      return;
    }
    const dx = b.x - T.x, dy = b.y - T.y, dist = Math.hypot(dx, dy);
    let ang;
    if (A.tp) {
      const path = g.map.pathObjs[b.p];
      const p = addProj(g, T, A, b.x, b.y, 0, 0, A.life || 8);
      p.tp = true; p.x = b.x + (Math.random() - .5) * 18; p.y = b.y + (Math.random() - .5) * 18;
      return;
    }
    if (A.bm) {
      const p = addProj(g, T, A, T.x, T.y, 0, 0, 0);
      p.bm = true;
      const ex = T.rngMain || rng, ar = Math.atan2(dy, dx);
      p.ax = Math.cos(ar) * ex * .92; p.ay = Math.sin(ar) * ex * .92;
      p.bx = -Math.sin(ar) * ex * .38; p.by = Math.cos(ar) * ex * .38;
      p.ox = T.x; p.oy = T.y; p.t0 = 0; p.dur = (ex * 2.6) / sp + .3; p.life = p.dur;
      p.hr = SHAPE_R[p.sh] || 11;
      T.aim = ar; T.recoil = 1;
      g.sfx('throw');
      return;
    }
    if (A.glob || A.hom || sp > 0) {
      const t = dist / sp;
      predict(g, b, t, g.tmp);
      ang = Math.atan2(g.tmp.y - T.y, g.tmp.x - T.x);
      const t2 = Math.hypot(g.tmp.x - T.x, g.tmp.y - T.y) / sp;
      predict(g, b, t2, g.tmp);
      ang = Math.atan2(g.tmp.y - T.y, g.tmp.x - T.x);
    } else ang = Math.atan2(dy, dx);
    T.aim = ang; T.recoil = 1;
    const life = A.life || Math.min(6, (rng * 1.35 + 20) / sp);
    for (let i = 0; i < n; i++) {
      const a = ang + (n > 1 ? (i - (n - 1) / 2) * (A.spr || .2) : 0);
      const p = addProj(g, T, A, T.x + Math.cos(a) * 14, T.y + Math.sin(a) * 14, a, sp, life);
      if (A.hom) p.tgt = b;
      if (A.dmgBonus) p.dmgAdd = A.dmgBonus;
    }
    g.sfx(isMain ? 'shoot' : 'shoot2');
  }

  function hurtShot(g, T, A, b, dmg) {
    const pops = hurt(g, b, dmg, A.dt, A, T);
    if (A.mm && !b.dead) { b.sl = .5; b.slt = 4; }
    return pops;
  }
  function ricochetShot(g, T, A, from, dmg) {
    let cur = from, n = A.ric;
    const seen = [from.id];
    while (n-- > 0) {
      near(g, cur.x, cur.y, 120, g.q2, false);
      let best = null, bd = 1e9;
      for (const b of g.q2) { if (b.dead || seen.includes(b.id) || (b.camo && !detOf(T))) continue; const d = (b.x - cur.x) ** 2 + (b.y - cur.y) ** 2; if (d < bd) { bd = d; best = b; } }
      if (!best) break;
      seen.push(best.id);
      hurtShot(g, T, A, best, dmg);
      g.bolts.push({ x1: cur.x, y1: cur.y, x2: best.x, y2: best.y, l: .1, c: '#fff6a8' });
      cur = best;
    }
  }

  function pulse(g, T, A, rng) {
    const out = g.q2;
    near(g, T.x, T.y, rng, out, true);
    const det = detOf(T);
    let any = false;
    for (let i = 0; i < out.length; i++) {
      const b = out[i];
      if (b.dead || (b.camo && !det)) continue;
      any = true;
      if (!(BT[b.t].im & CO)) {
        hurt(g, b, A.dmg + (T.vb.d || 0), A.dt, A, T);
        if (!b.dead) freezeB(b, A.frz, A);
      } else if (A.vul) { b.vul = A.vult || 3; b.vm = A.vul; }
    }
    addRing(g, T.x, T.y, rng, '#9fe3ff', .35);
    if (A.fr) { const o = Math.random() * TAU; for (let i = 0; i < A.fr; i++) addProj(g, T, { dmg: 1, pr: 4, dt: CO, shape: 'icicle', frz: .4 }, T.x, T.y, o + i / A.fr * TAU, 300, .6); }
    T.recoil = 1;
    g.sfx('ice');
    return any;
  }

  function hasTarget(g, T, rng) {
    const det = detOf(T);
    near(g, T.x, T.y, rng, g.q1, false);
    for (let i = 0; i < g.q1.length; i++) { const b = g.q1[i]; if (!b.dead && (!b.camo || det)) return true; }
    return false;
  }

  function effRng(T, A) { return A.rng >= 9000 ? A.rng : A.rng * T.vb.rng; }
  function effCd(g, T, A) {
    let c = A.cd * T.vb.cd * (T.bfCd || 1);
    if (T.rb > 0) c *= T.rbm;
    if (T.fb > 0) c *= T.fbm;
    if (g.gmT > 0) c *= g.gm;
    return Math.max(.025, c);
  }

  function stepTower(g, T, dt) {
    const st = T.st;
    T.recoil = Math.max(0, T.recoil - dt * 5);
    if (T.abCd > 0) T.abCd -= dt;
    if (T.rb > 0) T.rb -= dt;
    if (T.fb > 0) T.fb -= dt;
    if (T.aaT > 0) T.aaT -= dt;
    const k = st.k;
    if (k === 'f' || k === 'v') return;
    T.padd = T.vb.pr + (T.fb > 0 ? T.fba : 0);
    const au = T.aaT > 0 ? T.aa : st.au ? st : null;
    if (au) {
      T.aut -= dt;
      if (T.aut <= 0) {
        T.aut = au.aut || .3;
        const r = (au.aur || 80) * T.vb.rng;
        near(g, T.x, T.y, r, g.q2, true);
        for (let i = 0; i < g.q2.length; i++) {
          const b = g.q2[i];
          hurt(g, b, au.au, au.aud, st, T);
          if (au.auk && !b.dead && !b.big) b.d = Math.max(0, b.d - au.auk);
        }
        addRing(g, T.x, T.y, r, au.aud === FI ? 'rgba(255,120,30,.8)' : au.aud === PL ? 'rgba(255,230,120,.8)' : au.aud === MA ? 'rgba(160,255,120,.7)' : 'rgba(210,230,255,.8)', .3);
      }
    }
    T.cdl -= dt;
    let guard = 0;
    while (T.cdl <= 0 && guard++ < 4) {
      const rng = effRng(T, st);
      T.rngMain = rng;
      if (k === 'i') {
        if (hasTarget(g, T, rng)) { pulse(g, T, st, rng); T.cdl += effCd(g, T, st); } else { T.cdl = 0; break; }
      } else if (k === 't') {
        if (hasTarget(g, T, rng)) {
          const n = st.n, o = Math.random() * TAU, sp = st.sp, life = (rng + 14) / sp;
          for (let i = 0; i < n; i++) addProj(g, T, st, T.x, T.y, o + i / n * TAU, sp, life);
          T.recoil = 1; g.sfx('shoot2');
          T.cdl += effCd(g, T, st);
        } else { T.cdl = 0; break; }
      } else {
        const b = pickTarget(g, T, st, rng, detOf(T));
        if (b) { fireAttack(g, T, st, b, rng, true); T.cdl += effCd(g, T, st); } else { T.cdl = 0; break; }
      }
    }
    for (let i = 0; i < st.x.length; i++) {
      const A = st.x[i];
      T.xt[i] = (T.xt[i] === undefined ? 0 : T.xt[i]) - dt;
      let gg = 0;
      while (T.xt[i] <= 0 && gg++ < 3) {
        const rng = effRng(T, A);
        const b = pickTarget(g, T, A, rng, detOf(T) || A.camo);
        if (b) { fireAttack(g, T, A, b, rng, false); T.xt[i] += effCd(g, T, A); } else { T.xt[i] = 0; break; }
      }
    }
  }

  function hitProj(g, p, b) {
    const A = p.A, T = p.T;
    p.hl.push(b.id); p.hlt.push(g.time);
    if (A.bl) { explode(g, b.x, b.y, A, T); p.pr = 0; return; }
    if (A.gl) {
      glueB(g, b, A);
      if (A.gs) { near(g, b.x, b.y, A.gs, g.q2, true); for (const o of g.q2) if (o !== b) glueB(g, o, A); }
      addPart(g, b.x, b.y, '#8be04e', 3, 60, .3, 3);
      p.pr--; return;
    }
    const dmg = (A.dmg || 0) + (T ? T.vb.d : 0) + p.dmgAdd;
    const dtp = A.dt;
    if (dmg > 0) hurt(g, b, dmg, dtp, A, T);
    if (!b.dead) {
      if (A.frz) freezeB(b, A.frz, A);
      if (A.stun) b.stn = Math.max(b.stn, A.stun);
      if (A.kb && !b.big && Math.random() < A.kbp) b.d = Math.max(0, b.d - A.kb);
      if (A.dc) b.camo = false;
      if (A.mm && b.big) { b.sl = .5; b.slt = 4; }
    }
    p.pr--;
    if (p.ric > 0 && p.pr > 0) {
      near(g, b.x, b.y, 150, g.q2, false);
      let best = null, bd = 1e9;
      for (const o of g.q2) { if (o.dead || p.hl.includes(o.id)) continue; const d = (o.x - b.x) ** 2 + (o.y - b.y) ** 2; if (d < bd) { bd = d; best = o; } }
      if (best) {
        const sp = Math.hypot(p.vx, p.vy), a = Math.atan2(best.y - p.y, best.x - p.x);
        p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; p.ric--; p.life = Math.max(p.life, .6);
      }
    }
  }

  function stepProj(g, dt) {
    const pj = g.pj;
    let j = 0;
    const now = g.time;
    for (let i = 0; i < pj.length; i++) {
      const p = pj[i];
      if (!p.on) { g.pjFree.push(p); continue; }
      p.life -= dt;
      if (p.bm) {
        const s = clamp(1 - p.life / p.dur, 0, 1), c = Math.cos(s * TAU), sn = Math.sin(s * TAU), u = (1 - c) / 2;
        const T = p.T, ox = T ? T.x : p.ox, oy = T ? T.y : p.oy;
        p.x = ox + p.ax * u + p.bx * sn; p.y = oy + p.ay * u + p.by * sn;
        p.spin += dt * 18;
      } else if (!p.tp) {
        if (p.A.hom) {
          let t = p.tgt;
          if (!t || t.dead) {
            near(g, p.x, p.y, 170, g.q2, false);
            let bd = 1e9; t = null;
            for (const b of g.q2) { if (b.dead || p.hl.includes(b.id)) continue; const d = (b.x - p.x) ** 2 + (b.y - p.y) ** 2; if (d < bd) { bd = d; t = b; } }
            p.tgt = t;
          }
          if (t) {
            const sp = Math.hypot(p.vx, p.vy), ca = Math.atan2(p.vy, p.vx);
            let da = Math.atan2(t.y - p.y, t.x - p.x) - ca;
            while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
            const turn = clamp(da, -9 * dt, 9 * dt) + ca;
            p.vx = Math.cos(turn) * sp; p.vy = Math.sin(turn) * sp;
          }
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.ang = Math.atan2(p.vy, p.vx);
        p.spin += dt * 14;
      }
      if (p.life <= 0 || p.pr <= 0 || p.x < -60 || p.x > MW + 60 || p.y < -60 || p.y > MH + 60) { p.on = false; g.pjFree.push(p); continue; }
      near(g, p.x, p.y, p.hr, g.q4, true);
      const out = g.q4, hl = p.hl;
      for (let k = 0; k < out.length && p.pr > 0; k++) {
        const b = out[k];
        if (b.dead) continue;
        let seen = false;
        for (let m = 0; m < hl.length; m++) if (hl[m] === b.id) { if (p.bm && now - p.hlt[m] > .45) { hl[m] = -1; p.hlt[m] = 0; } else seen = true; break; }
        if (seen) continue;
        hitProj(g, p, b);
      }
      if (p.pr <= 0) { p.on = false; g.pjFree.push(p); continue; }
      pj[j++] = p;
    }
    pj.length = j;
  }

  function refreshBuffs(g) {
    const ts = g.towers;
    for (const T of ts) { T.vb = { rng: 1, cd: 1, pr: 0, camo: false, gb: false, disc: 0, d: 0 }; T.bfCd = 1; }
    for (const V of ts) {
      const s = V.st;
      if (s.k === 'v') {
        const r = V.st.rng;
        for (const T of ts) {
          if (T === V || Math.hypot(T.x - V.x, T.y - V.y) > r) continue;
          const b = T.vb;
          b.rng = Math.max(b.rng, s.vr || 1); b.cd = Math.min(b.cd, s.vcd || 1); b.pr = Math.max(b.pr, s.vpr || 0);
          b.camo = b.camo || !!s.vcamo; b.gb = b.gb || !!s.vgb; b.disc = Math.max(b.disc, s.vdisc || 0); b.d = Math.max(b.d, s.vd || 0);
        }
      }
      if (s.bfn) {
        for (const T of ts) {
          if (T === V || T.id !== V.id && !(TW[T.id].water && TW[V.id].water)) continue;
          if (Math.hypot(T.x - V.x, T.y - V.y) > s.bfn.r) continue;
          T.bfCd = Math.min(T.bfCd, s.bfn.cd);
        }
      }
    }
  }

  function addTower(g, id, x, y, paid) {
    const def = TW[id];
    const T = { id, uid: g.tuid++, x, y, tr: [0, 0, 0], st: null, cdl: .3, xt: [], tg: 0, paid, aim: -Math.PI / 2, recoil: 0, vb: { rng: 1, cd: 1, pr: 0, camo: false, gb: false, disc: 0, d: 0 }, bfCd: 1, pops: 0, bank: 0, abId: null, abCd: 0, abT: 0, rb: 0, rbm: 1, fb: 0, fbm: 1, fba: 0, aaT: 0, aa: null, aut: 0, padd: 0, rngMain: 0 };
    T.st = resolve(def, T.tr);
    g.towers.push(T);
    refreshBuffs(g);
    return T;
  }

  function placeError(g, id, x, y) {
    const def = TW[id];
    if (x < 16 || x > MW - 16 || y < 16 || y > MH - 16) return 'Outside the map';
    const m = g.map;
    for (const p of m.pathObjs) if (pathDist(p, x, y) < PATH_HALF + 12) return 'Too close to the track';
    for (const b of m.blocks) {
      if (b.k === 'house' || b.k === 'cube' || b.k === 'hedge') { if (Math.abs(x - b.x) < b.w / 2 + 12 && Math.abs(y - b.y) < b.h / 2 + 12) return 'Something is in the way'; }
      else if (Math.hypot(x - b.x, y - b.y) < b.r + 12) return 'Something is in the way';
    }
    for (const poly of m.lava) if (inPoly(poly, x, y) || [[10, 0], [-10, 0], [0, 10], [0, -10]].some(o => inPoly(poly, x + o[0], y + o[1]))) return 'Lava!';
    const pts = [[0, 0], [10, 0], [-10, 0], [0, 10], [0, -10]];
    let wet = 0;
    for (const o of pts) if (m.water.some(poly => inPoly(poly, x + o[0], y + o[1]))) wet++;
    if (def.water) { if (wet < 5) return 'Water towers need open water'; }
    else if (wet > 0) return 'Land towers cannot go on water';
    for (const T of g.towers) if (Math.hypot(T.x - x, T.y - y) < 28) return 'Too close to another monkey';
    return '';
  }

  function doAbility(g, T) {
    const id = T.st.ab;
    if (!id || T.abCd > 0) return false;
    const a = ABIL[id];
    T.abCd = a.cd; T.abMax = a.cd;
    if (id === 'fan' || id === 'fan2') {
      for (const o of g.towers) if (o.id === 0 && Math.hypot(o.x - T.x, o.y - T.y) <= a.ar) { o.fb = a.t; o.fbm = a.m; o.fba = a.add; }
      addRing(g, T.x, T.y, a.ar, '#ffd84d', .5);
    } else if (id === 'rate') { T.rb = a.t; T.rbm = a.m; addRing(g, T.x, T.y, 60, '#ff7b3d', .5); }
    else if (id === 'swirl' || id === 'swirl2' || id === 'phoenix' || id === 'tornado') { T.aaT = a.t; T.aa = { au: a.au, aut: a.aut, aur: a.aur, aud: a.aud, auk: a.auk }; addRing(g, T.x, T.y, a.aur, '#fff', .6); }
    else if (id === 'chill') { g.chT = a.t; g.chM = a.m; g.flash = .5; g.flashC = '#bfe9ff'; }
    else if (id === 'freeze') { for (const b of g.bl) if (!b.dead) b.fz = Math.max(b.fz, b.big ? a.t * .45 : a.t); g.flash = .6; g.flashC = '#cfeeff'; }
    else if (id === 'glueAll' || id === 'glueAll2') {
      for (const b of g.bl) if (!b.dead && !b.big) { b.gl = a.t; b.gw = a.m; if (a.dot) b.gd = a.dot; }
      g.flash = .4; g.flashC = '#b5ff7d';
    } else if (id === 'slowAll' || id === 'slowAll2') { g.slT = a.t; g.slM = a.m; g.flash = .3; g.flashC = '#cfc0ff'; }
    else if (id === 'blitz' || id === 'strike' || id === 'strike2' || id === 'nuke') {
      const A = { dM: a.adM, lead: 1 };
      for (const b of g.bl) if (!b.dead) { hurt(g, b, a.ad, a.dt, A, T); addPart(g, b.x, b.y, '#ffb24d', 2, 80, .3, 3); }
      g.flash = .5; g.flashC = '#ffe2a0'; g.shake = .4; g.sfx('boom', 80);
    } else if (id === 'cash') { let v = 0; for (const o of g.towers) if (o.bank > 0) { v += o.bank; o.bank = 0; } g.cash += v; g.earned += v; addText(g, T.x, T.y - 18, '+$' + Math.round(v), '#ffe14d'); }
    else if (id === 'cta' || id === 'hd') { g.gmT = a.t; g.gm = a.gm; addRing(g, T.x, T.y, 200, '#ffe14d', .6); }
    g.sfx('ability');
    return true;
  }

  function roundIncome(g) {
    let tot = 0;
    for (const T of g.towers) {
      const inc = T.st.inc;
      if (!inc) continue;
      if (T.st.bank) { const room = Math.max(0, (T.st.bcap || 9000) - T.bank); const add = Math.min(room, inc); T.bank += add; if (add > 0) addText(g, T.x, T.y - 18, '+$' + Math.round(add), '#ffe14d'); }
      else { tot += inc; addText(g, T.x, T.y - 18, '+$' + inc, '#ffe14d'); }
    }
    return tot;
  }

  function startRound(g) {
    if (g.running || g.lost) return false;
    g.round++;
    g.plan = roundPlan(g.round);
    g.bs = blimpSp(g.round);
    g.running = true; g.tr = 0; g.ei = 0;
    g.sfx('round');
    return true;
  }

  function endRound(g) {
    g.running = false;
    const bonus = 100 + g.round;
    const inc = roundIncome(g);
    g.cash += bonus + inc; g.earned += bonus + inc;
    g.lastBonus = bonus + inc;
    for (const T of g.towers) if (T.abCd > 0) T.abCd = Math.max(0, T.abCd - 4);
    if (!g.free2 && g.round >= g.mode.to) g.won = true;
    g.sfx('end');
  }

  function stepGame(g, dt) {
    g.time += dt;
    if (g.shake > 0) g.shake -= dt;
    if (g.flash > 0) g.flash -= dt;
    if (g.chT > 0) g.chT -= dt;
    if (g.slT > 0) g.slT -= dt;
    if (g.gmT > 0) g.gmT -= dt;
    if (g.running) {
      g.tr += dt;
      const ev = g.plan.ev, np = g.map.pathObjs.length;
      while (g.ei < ev.length && ev[g.ei][0] <= g.tr) {
        const e = ev[g.ei];
        spawnBloon(g, e[1], e[2], 0, g.ei % np, null);
        g.ei++;
      }
    }
    const bl = g.bl, maps = g.map.pathObjs;
    for (let i = 0; i < bl.length; i++) {
      const b = bl[i];
      if (b.dead) continue;
      if (b.fz > 0) b.fz -= dt;
      if (b.stn > 0) b.stn -= dt;
      if (b.slt > 0) b.slt -= dt;
      if (b.vul > 0) b.vul -= dt;
      if (b.gl > 0) {
        b.gl -= dt;
        if (b.gd > 0) { b.gacc += b.gd * dt; if (b.gacc >= 1) { const n = Math.floor(b.gacc); b.gacc -= n; hurt(g, b, n, AC, { lead: 1 }, null); if (b.dead) continue; } }
      }
      if (b.reg && b.mx >= 0 && b.t < b.mx) { b.rg -= dt; if (b.rg <= 0) { b.t++; b.hp = hpOf(b.t, b.fort); b.rg = 3; } }
      const v = speedOf(g, b);
      if (v > 0) {
        b.d += v * dt;
        const path = maps[b.p];
        if (b.d >= path.len) {
          b.dead = true;
          const loss = Math.ceil(RBE[b.t] - BT[b.t].hp + b.hp);
          g.lives = Math.max(0, g.lives - loss); g.leaked += loss; g.shake = .25; g.hurtT = .4;
          g.sfx('leak');
          if (g.lives <= 0) g.lost = true;
          continue;
        }
        const f = b.d / DS, k = f | 0, t = f - k;
        b.x = path.px[k] + (path.px[k + 1] - path.px[k]) * t; b.y = path.py[k] + (path.py[k + 1] - path.py[k]) * t; b.a = path.pa[k];
      }
    }
    rebuildHash(g);
    for (let i = 0; i < g.towers.length; i++) {
      const T = g.towers[i];
      stepTower(g, T, dt);
    }
    for (const V of g.towers) if (V.st.vgb) { near(g, V.x, V.y, V.st.rng, g.q2, true); for (const b of g.q2) { b.reg = false; b.mx = -1; } }
    stepProj(g, dt);
    for (let i = g.bolts.length - 1; i >= 0; i--) { g.bolts[i].l -= dt; if (g.bolts[i].l <= 0) g.bolts.splice(i, 1); }
    let j = 0;
    for (let i = 0; i < g.parts.length; i++) {
      const p = g.parts[i];
      p.l -= dt; if (p.l <= 0) continue;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .93; p.vy *= .93;
      g.parts[j++] = p;
    }
    g.parts.length = j;
    for (let i = g.texts.length - 1; i >= 0; i--) { const t = g.texts[i]; t.l -= dt; t.y -= 24 * dt; if (t.l <= 0) g.texts.splice(i, 1); }
    for (let i = g.rings.length - 1; i >= 0; i--) { g.rings[i].l -= dt; if (g.rings[i].l <= 0) g.rings.splice(i, 1); }
    if (g.hurtT > 0) g.hurtT -= dt;
    if (g.running && g.ei >= g.plan.ev.length) {
      let alive = 0;
      for (let i = 0; i < bl.length; i++) if (!bl[i].dead) { alive = 1; break; }
      if (!alive) endRound(g);
    }
  }

  function collectBank(g, T) {
    const v = Math.floor(T.bank);
    if (v <= 0) return 0;
    g.cash += v; g.earned += v; T.bank = 0;
    addText(g, T.x, T.y - 18, '+$' + v, '#ffe14d');
    g.sfx('sell');
    return v;
  }
  function upgradeTower(g, T, p) {
    if (blocked(T.tr, p)) return false;
    const c = upgCost(g, T, p);
    if (g.cash < c) return false;
    g.cash -= c; T.paid += c;
    T.tr[p]++;
    const had = T.st.ab;
    T.st = resolve(TW[T.id], T.tr);
    if (T.st.ab && T.st.ab !== had) { T.abCd = Math.min(15, ABIL[T.st.ab].cd * .4); T.abMax = ABIL[T.st.ab].cd; }
    refreshBuffs(g);
    g.sfx('upgrade');
    return true;
  }
  function sellTower(g, T) {
    const v = sellVal(T);
    g.cash += v;
    g.towers.splice(g.towers.indexOf(T), 1);
    refreshBuffs(g);
    g.sfx('sell');
    return v;
  }
  function placeTower(g, id, x, y) {
    const cost = towerCost(g, TW[id]);
    if (g.cash < cost || placeError(g, id, x, y)) return null;
    g.cash -= cost;
    const T = addTower(g, id, x, y, cost);
    g.sfx('place');
    return T;
  }

  function snapshot(g) {
    return {
      v: 1, map: g.mi, mode: g.mid, round: g.round, cash: Math.round(g.cash * 100) / 100, lives: g.lives, running: g.running, tr: g.tr, ei: g.ei, free2: g.free2, won: g.won, pops: g.pops, earned: Math.round(g.earned),
      towers: g.towers.map(T => ({ id: T.id, x: Math.round(T.x), y: Math.round(T.y), tr: T.tr, tg: T.tg, paid: T.paid, bank: Math.round(T.bank), abCd: Math.round(T.abCd), pops: T.pops })),
      bloons: g.bl.filter(b => !b.dead).map(b => [b.t, Math.round(b.hp * 100) / 100, Math.round(b.d), b.p, (b.camo ? 1 : 0) | (b.reg ? 2 : 0) | (b.fort ? 4 : 0), b.mx])
    };
  }
  function restore(o, sfx) {
    const g = makeGame({ map: o.map, mode: o.mode, sfx });
    g.round = o.round; g.cash = o.cash; g.lives = o.lives; g.free2 = !!o.free2; g.won = !!o.won; g.pops = o.pops || 0; g.earned = o.earned || 0;
    g.bs = blimpSp(g.round);
    for (const t of o.towers) {
      const T = addTower(g, t.id, t.x, t.y, t.paid);
      T.tr = t.tr.slice(); T.tg = t.tg; T.bank = t.bank || 0; T.pops = t.pops || 0;
      T.st = resolve(TW[T.id], T.tr);
      if (T.st.ab) { T.abCd = t.abCd || 0; T.abMax = ABIL[T.st.ab].cd; }
    }
    refreshBuffs(g);
    if (o.running) {
      g.plan = roundPlan(g.round); g.running = true; g.tr = o.tr; g.ei = o.ei;
      for (const [t, hp, d, p, fl, mx] of o.bloons) { const b = spawnBloon(g, t, fl, d, p, null); b.hp = hp; b.mx = mx; }
    }
    rebuildHash(g);
    return g;
  }
  const hx = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mix = (a, b, t) => { const x = hx(a), y = hx(b); return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',') + ')'; };
  const mk = (w, h, fn, sc) => {
    sc = sc || 2;
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w * sc)); c.height = Math.max(1, Math.ceil(h * sc));
    const g = c.getContext('2d');
    g.scale(sc, sc);
    fn(g);
    c.lw = w; c.lh = h;
    return c;
  };
  const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); };
  const polyPath = (g, poly) => { g.beginPath(); poly.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };

  const bsCache = new Map();
  function camoBlotches(g, w, h, seed) {
    const R = mulberry(seed);
    g.save();
    for (let i = 0; i < 9; i++) {
      g.fillStyle = i % 3 === 0 ? 'rgba(52,84,36,.8)' : i % 3 === 1 ? 'rgba(98,120,52,.78)' : 'rgba(40,52,30,.8)';
      g.beginPath();
      const cx = (R() - .5) * w, cy = (R() - .5) * h, r = 3 + R() * 5;
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, rr = r * (.6 + R() * .7); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      g.closePath(); g.fill();
    }
    g.restore();
  }
  function eggPath(g, rx, ry) {
    g.beginPath();
    g.moveTo(0, ry);
    g.bezierCurveTo(rx * 1.02, ry * .5, rx * 1.12, -ry * 1.02, 0, -ry);
    g.bezierCurveTo(-rx * 1.12, -ry * 1.02, -rx * 1.02, ry * .5, 0, ry);
    g.closePath();
  }
  function blimpArt(t, camo, fort) {
    const bt = BT[t], r = bt.r, L = t === T_DDT ? r * 3 : r * 2.75, W = t === T_DDT ? r * 1.25 : r * 1.72, pw = L + r * .9 + 16, ph = W + r * .8 + 14;
    return mk(pw, ph, g => {
      g.translate(pw / 2 + r * .05, ph / 2);
      const c = bt.c, hl = L / 2, hw = W / 2;
      g.lineJoin = 'round';
      const fin = (sy) => {
        g.beginPath(); g.moveTo(-hl * .62, sy * hw * .55); g.lineTo(-hl * 1.12, sy * hw * 1.25); g.lineTo(-hl * .98, sy * hw * .2); g.closePath();
        g.fillStyle = mix(c, '#000000', .28); g.fill(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(0,0,0,.55)'; g.stroke();
      };
      fin(-1); fin(1);
      const gr = g.createLinearGradient(0, -hw, 0, hw);
      gr.addColorStop(0, mix(c, '#ffffff', .55)); gr.addColorStop(.35, c); gr.addColorStop(1, mix(c, '#000000', .38));
      g.beginPath(); g.ellipse(0, 0, hl, hw, 0, 0, TAU);
      g.fillStyle = gr; g.fill();
      g.save(); g.clip();
      if (t === 12) {
        g.fillStyle = 'rgba(255,255,255,.9)';
        g.fillRect(-hl * .62, -hw, hl * .12, W); g.fillRect(hl * .34, -hw, hl * .12, W);
        g.fillStyle = '#ffffff'; circ(g, hl * .05, 0, hw * .56); g.fill();
        g.fillStyle = c; g.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU, rr = i % 2 ? hw * .22 : hw * .46; g.lineTo(hl * .05 + Math.cos(a) * rr, Math.sin(a) * rr); }
        g.closePath(); g.fill();
      } else if (t === 13) {
        g.fillStyle = '#ffd934';
        for (const k of [-.5, 0, .5]) { g.fillRect(hl * k - hl * .05, -hw, hl * .1, W); }
        g.fillStyle = 'rgba(0,0,0,.35)'; circ(g, hl * .62, 0, hw * .34); g.fill();
        g.fillStyle = '#fff4c2'; circ(g, hl * .62, 0, hw * .22); g.fill();
        g.fillStyle = '#7a1e1a'; circ(g, hl * .66, 0, hw * .1); g.fill();
      } else if (t === 14) {
        g.fillStyle = 'rgba(20,50,20,.55)';
        for (const k of [-.62, -.2, .22]) g.fillRect(hl * k, -hw, hl * .24, W);
        g.fillStyle = '#c8f06a'; for (const k of [-.5, -.08, .34]) { circ(g, hl * k, -hw * .55, 3.2); g.fill(); circ(g, hl * k, hw * .55, 3.2); g.fill(); }
        g.fillStyle = '#12301a'; g.beginPath(); g.ellipse(hl * .72, 0, hl * .26, hw * .78, 0, 0, TAU); g.fill();
        g.fillStyle = '#ffe14a'; circ(g, hl * .7, -hw * .3, hw * .17); g.fill(); circ(g, hl * .7, hw * .3, hw * .17); g.fill();
        g.fillStyle = '#e8ffd0'; for (let i = -2; i <= 2; i++) g.fillRect(hl * .86, i * hw * .14 - 1.4, hl * .1, 2.8);
      } else if (t === T_DDT) {
        g.fillStyle = '#ff4630'; g.fillRect(hl * .45, -hw * .22, hl * .4, hw * .12); g.fillRect(hl * .45, hw * .1, hl * .4, hw * .12);
        g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(-hl * .4, -hw, hl * .1, W); g.fillRect(0, -hw, hl * .1, W);
      } else {
        g.fillStyle = 'rgba(30,10,50,.5)';
        for (const k of [-.65, -.3, .05, .4]) g.fillRect(hl * k, -hw, hl * .17, W);
        g.fillStyle = '#f2e9ff'; circ(g, hl * .1, 0, hw * .5); g.fill();
        g.fillStyle = '#2a1040'; circ(g, hl * .02, -hw * .15, hw * .14); g.fill(); circ(g, hl * .2, -hw * .15, hw * .14); g.fill();
        g.fillRect(hl * .02, hw * .12, hl * .2, hw * .16);
        g.fillStyle = '#f2e9ff'; for (let i = 0; i < 4; i++) g.fillRect(hl * (.04 + i * .05), hw * .12, 2, hw * .16);
        g.fillStyle = '#ffd934'; for (const k of [-.85, .55]) { circ(g, hl * k, 0, 4); g.fill(); }
      }
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-hl * .08, -hw * .6, hl * .62, hw * .2, 0, 0, TAU); g.fill();
      if (camo || t === T_DDT) { g.translate(0, 0); camoBlotches(g, L, W, t * 13 + 5); }
      g.restore();
      g.beginPath(); g.ellipse(0, 0, hl, hw, 0, 0, TAU);
      g.lineWidth = fort ? 5 : 2.2; g.strokeStyle = fort ? '#5b6370' : 'rgba(0,0,0,.6)'; g.stroke();
      if (fort) {
        g.lineWidth = 1.6; g.strokeStyle = '#c9d0da'; g.beginPath(); g.ellipse(0, 0, hl - 2.6, hw - 2.6, 0, 0, TAU); g.stroke();
        g.fillStyle = '#e8edf3'; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; circ(g, Math.cos(a) * (hl - 1.2), Math.sin(a) * (hw - 1.2), 1.5); g.fill(); }
      }
      g.beginPath(); g.ellipse(hl * .93, 0, hl * .07, hw * .35, 0, 0, TAU); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill();
    }, 2);
  }
  function bloonSprite(t, camo, reg, fort) {
    const key = t * 8 + (camo ? 1 : 0) + (reg ? 2 : 0) + (fort ? 4 : 0);
    let s = bsCache.get(key);
    if (s) return s;
    const bt = BT[t];
    if (bt.big) { s = blimpArt(t, camo, fort); s.big = 1; s.ox = s.lw / 2 + bt.r * .05; s.oy = s.lh / 2; bsCache.set(key, s); return s; }
    const r = bt.r, rx = r * .9, ry = r * 1.12, w = r * 2 + 18, h = r * 2.5 + 20, cy = ry + 8;
    s = mk(w, h, g => {
      g.translate(w / 2, cy);
      g.lineJoin = 'round';
      g.beginPath(); g.moveTo(0, ry + 2); g.quadraticCurveTo(-3, ry + 12, 2, ry + 16); g.quadraticCurveTo(5, ry + 10, 0, ry + 2);
      g.lineWidth = 1.1; g.strokeStyle = 'rgba(30,30,30,.55)'; g.stroke();
      if (t === 7) { g.shadowColor = '#d38bff'; g.shadowBlur = 9; }
      const gr = g.createRadialGradient(-rx * .38, -ry * .42, 1.5, 0, 0, ry * 1.25);
      gr.addColorStop(0, mix(bt.c, '#ffffff', t === 6 ? 0 : .6)); gr.addColorStop(.45, bt.c); gr.addColorStop(1, mix(bt.c, '#000000', t === 3 ? .28 : .4));
      eggPath(g, rx, ry);
      g.fillStyle = gr; g.fill();
      g.shadowBlur = 0;
      g.save(); eggPath(g, rx, ry); g.clip();
      if (t === 9) {
        g.fillStyle = '#16161a';
        for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * rx * .5 - rx * .28 - ry * .1, -ry); g.lineTo(i * rx * .5 + rx * .1 - ry * .1, -ry); g.lineTo(i * rx * .5 + rx * .1 + ry * .1, ry); g.lineTo(i * rx * .5 - rx * .28 + ry * .1, ry); g.fill(); }
      } else if (t === 10) {
        const cols = ['#ff3b30', '#ff9f1a', '#ffe033', '#3ccf4e', '#2f9bff', '#8a4dff'];
        cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(-rx * 1.2, -ry + i * (ry * 2 / 6) + 0, rx * 2.4, ry * 2 / 6 + .6); });
      } else if (t === 8) {
        g.strokeStyle = 'rgba(40,46,56,.55)'; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(0, -ry); g.lineTo(0, ry); g.moveTo(-rx, -ry * .1); g.quadraticCurveTo(0, ry * .12, rx, -ry * .1); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.55)'; for (const p of [[-rx * .55, -ry * .5], [rx * .55, -ry * .5], [-rx * .55, ry * .25], [rx * .55, ry * .25]]) { circ(g, p[0], p[1], 1.5); g.fill(); }
      } else if (t === 11) {
        g.fillStyle = 'rgba(255,230,190,.28)'; g.fillRect(-rx, -ry * .55, rx * 2, ry * .22); g.fillRect(-rx, ry * .1, rx * 2, ry * .22);
        g.strokeStyle = 'rgba(70,35,10,.8)'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(-rx * .3, -ry * .9); g.lineTo(-rx * .05, -ry * .4); g.lineTo(-rx * .45, -ry * .1); g.lineTo(-rx * .1, ry * .35);
        g.moveTo(rx * .35, -ry * .2); g.lineTo(rx * .6, ry * .2); g.lineTo(rx * .3, ry * .5); g.stroke();
      }
      if (camo) camoBlotches(g, rx * 2, ry * 2, t * 7 + 3);
      g.restore();
      eggPath(g, rx, ry);
      g.lineWidth = fort ? 4.4 : 1.7; g.strokeStyle = fort ? '#59616e' : 'rgba(20,20,26,.6)'; g.stroke();
      if (fort) {
        eggPath(g, rx - 2.4, ry - 2.4); g.lineWidth = 1.3; g.strokeStyle = '#d3d9e2'; g.stroke();
        g.fillStyle = '#eef2f7'; for (const p of [[0, -ry + 1], [-rx + 1, 0], [rx - 1, 0], [-rx * .6, ry * .6], [rx * .6, ry * .6]]) { circ(g, p[0], p[1], 1.3); g.fill(); }
      }
      g.fillStyle = 'rgba(255,255,255,' + (t === 6 ? .85 : .6) + ')';
      g.beginPath(); g.ellipse(-rx * .42, -ry * .52, rx * .2, ry * .3, -.5, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(-3, ry - .5); g.lineTo(3, ry - .5); g.lineTo(0, ry + 5); g.closePath(); g.fillStyle = mix(bt.c, '#000000', .35); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(20,20,26,.6)'; g.stroke();
      if (reg) {
        g.strokeStyle = '#2f9a38'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(rx * .55, -ry * .62); g.quadraticCurveTo(rx * .9, -ry * 1.05, rx * 1.18, -ry * .95); g.stroke();
        g.fillStyle = '#58d85a'; g.beginPath(); g.ellipse(rx * 1.04, -ry * .98, 4.6, 2.5, -.5, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(rx * .78, -ry * .86, 4.2, 2.3, .9, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(255,170,210,.7)'; g.lineWidth = 1.4; g.setLineDash([2, 3]); eggPath(g, rx + 3, ry + 3); g.stroke(); g.setLineDash([]);
      }
    }, 2);
    s.ox = w / 2; s.oy = cy;
    bsCache.set(key, s);
    return s;
  }

  const THEMES = {
    grass: { a: '#7ccf55', b: '#62b840', pb: '#8a6a34', pm: '#d8b673', sh: '#e8d9a0', wa: '#3a98e8', wb: '#1d70c6' },
    town: { a: '#bdb8ab', b: '#aaa596', pb: '#2f343b', pm: '#5d6672', sh: '#d8d3c4', wa: '#3a98e8', wb: '#1d70c6' },
    beach: { a: '#f4e3ab', b: '#ecd391', pb: '#95703a', pm: '#dcb46e', sh: '#fbf1cf', wa: '#35c2e0', wb: '#1b86c4' },
    snow: { a: '#eef6fc', b: '#d3e5f2', pb: '#867560', pm: '#cdb999', sh: '#ffffff', wa: '#8fd3f5', wb: '#4fa6dc' },
    desert: { a: '#ecc977', b: '#dfb35e', pb: '#8c5a30', pm: '#c48a55', sh: '#f6e3a9', wa: '#2fb6c8', wb: '#16849c' },
    tech: { a: '#344a72', b: '#243759', pb: '#52698f', pm: '#93a8c8', sh: '#5d78a8', wa: '#3a98e8', wb: '#1d70c6' },
    lava: { a: '#4d2c23', b: '#332019', pb: '#2c1710', pm: '#7e5c48', sh: '#ffb04d', wa: '#3a98e8', wb: '#1d70c6' },
    garden: { a: '#74c64f', b: '#68b747', pb: '#a39870', pm: '#e8dfc4', sh: '#d2e8a8', wa: '#3a98e8', wb: '#1d70c6' }
  };

  function drawObs(g, b, th) {
    const x = b.x, y = b.y, r = b.r, v = b.v;
    g.save(); g.translate(x, y);
    g.lineJoin = 'round';
    switch (b.k) {
      case 'tree': {
        const gr = g.createRadialGradient(-r * .3, -r * .35, 2, 0, 0, r * 1.2);
        gr.addColorStop(0, '#5fbb48'); gr.addColorStop(.6, '#348a2e'); gr.addColorStop(1, '#216a24');
        g.fillStyle = '#6b4423'; g.fillRect(-2.5, 0, 5, r * .8);
        for (const [dx, dy, k] of [[-r * .42, r * .1, .62], [r * .44, r * .08, .62], [0, -r * .4, .66], [0, r * .12, .72]]) { circ(g, dx, dy, r * k); g.fillStyle = gr; g.fill(); g.lineWidth = 1.2; g.strokeStyle = 'rgba(15,60,20,.55)'; g.stroke(); }
        g.fillStyle = 'rgba(180,240,120,.4)'; circ(g, -r * .28, -r * .42, r * .28); g.fill();
        if (v > .6) { g.fillStyle = '#ff5a4a'; for (const p of [[.3, .2], [-.4, .3], [.1, -.35]]) { circ(g, p[0] * r, p[1] * r, 2.2); g.fill(); } }
        break;
      }
      case 'bush': {
        for (const [dx, dy] of [[-r * .6, 0], [r * .6, 0], [0, -r * .5], [0, r * .3]]) { circ(g, dx, dy, r * .85); g.fillStyle = '#3f9a3a'; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(15,60,20,.5)'; g.stroke(); }
        g.fillStyle = 'rgba(190,245,140,.45)'; circ(g, -r * .4, -r * .6, r * .4); g.fill();
        g.fillStyle = v > .5 ? '#e8434a' : '#ffd24a'; for (const p of [[.5, .1], [-.3, .5], [0, -.3]]) { circ(g, p[0] * r, p[1] * r, 1.8); g.fill(); }
        break;
      }
      case 'rock': case 'icechunk': case 'lavarock': {
        const ice = b.k === 'icechunk', lv = b.k === 'lavarock';
        g.beginPath();
        const R = mulberry((x * 7 + y * 3) | 0), n = 8;
        for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (.78 + R() * .36); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .85); }
        g.closePath();
        const gr = g.createLinearGradient(-r, -r, r, r);
        if (ice) { gr.addColorStop(0, '#f2fbff'); gr.addColorStop(1, '#8cc7ea'); } else if (lv) { gr.addColorStop(0, '#5a4038'); gr.addColorStop(1, '#241512'); } else { gr.addColorStop(0, '#c9ccd2'); gr.addColorStop(1, '#7d828c'); }
        g.fillStyle = gr; g.fill(); g.lineWidth = 1.4; g.strokeStyle = ice ? 'rgba(40,110,160,.6)' : 'rgba(30,25,30,.65)'; g.stroke();
        if (lv) { g.strokeStyle = '#ff7a2a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-r * .5, -r * .2); g.lineTo(-r * .1, r * .1); g.lineTo(r * .2, -r * .2); g.lineTo(r * .5, r * .3); g.stroke(); }
        g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-r * .3, -r * .3, r * .3, r * .16, -.5, 0, TAU); g.fill();
        break;
      }
      case 'house': {
        const w = b.w, h = b.h, cols = [['#c0503c', '#8e3326'], ['#4f78b8', '#355691'], ['#d29a3c', '#a2721f'], ['#5aa05a', '#3a7a3d'], ['#9b6bb8', '#744a90']], c = cols[(v * 5) | 0];
        g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-w / 2 + 5, -h / 2 + 6, w, h);
        g.fillStyle = c[1]; g.fillRect(-w / 2, -h / 2, w, h);
        g.fillStyle = c[0]; g.fillRect(-w / 2, -h / 2, w / 2, h);
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-w / 2, -h / 2, w / 2, 4);
        g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.6; g.strokeRect(-w / 2, -h / 2, w, h);
        g.beginPath(); g.moveTo(0, -h / 2); g.lineTo(0, h / 2); g.stroke();
        g.fillStyle = '#6a4a38'; g.fillRect(w * .14, -h * .3, 7, 11); g.fillStyle = '#3a3a3a'; g.fillRect(w * .16, -h * .28, 3, 7);
        break;
      }
      case 'palm': {
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(4, 5, r * 1.1, r * .7, 0, 0, TAU); g.fill();
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * TAU + v * 2;
          g.save(); g.rotate(a);
          g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(r * .6, -r * .38, r * 1.15, r * .06); g.quadraticCurveTo(r * .6, r * .1, 0, 0);
          g.fillStyle = i % 2 ? '#2f9a46' : '#3fb85a'; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(10,70,30,.6)'; g.stroke();
          g.restore();
        }
        g.fillStyle = '#7a4a22'; circ(g, 0, 0, 3.8); g.fill(); g.fillStyle = '#5a3418'; circ(g, -1.6, 1.2, 2); g.fill(); circ(g, 1.6, 1.4, 2); g.fill();
        break;
      }
      case 'pine': {
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(4, 5, r * .9, r * .7, 0, 0, TAU); g.fill();
        for (let k = 0; k < 3; k++) {
          const rr = r * (1 - k * .27);
          g.beginPath();
          for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, q = i % 2 ? rr * .72 : rr; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
          g.closePath(); g.fillStyle = k === 0 ? '#2d6a47' : k === 1 ? '#388257' : '#47a06b'; g.fill();
          g.lineWidth = 1; g.strokeStyle = 'rgba(10,50,30,.6)'; g.stroke();
          g.fillStyle = 'rgba(255,255,255,.75)'; circ(g, -rr * .25, -rr * .25, rr * .34); g.fill();
        }
        break;
      }
      case 'cactus': {
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(3, 4, r, r * .7, 0, 0, TAU); g.fill();
        for (const [dx, dy, k] of [[-r * .9, -r * .1, .55], [r * .9, r * .2, .55], [0, 0, 1]]) { circ(g, dx, dy, r * k); g.fillStyle = k === 1 ? '#3f9b4d' : '#52b061'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = 'rgba(15,70,30,.7)'; g.stroke(); }
        g.strokeStyle = 'rgba(15,70,30,.5)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * r * .2, Math.sin(a) * r * .2); g.lineTo(Math.cos(a) * r * .95, Math.sin(a) * r * .95); g.stroke(); }
        g.fillStyle = '#ff7aa8'; circ(g, 0, 0, 3); g.fill();
        break;
      }
      case 'cube': {
        const w = b.w, h = b.h, d = 9, c = ['#4ac6d6', '#e8a13c', '#9b7be0', '#58d88f'][(v * 4) | 0];
        g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-w / 2 + d + 3, -h / 2 + d + 3, w, h);
        g.fillStyle = mix(c, '#000000', .45); g.beginPath(); g.moveTo(-w / 2, h / 2); g.lineTo(-w / 2 + d, h / 2 + d); g.lineTo(w / 2 + d, h / 2 + d); g.lineTo(w / 2, h / 2); g.closePath(); g.fill();
        g.fillStyle = mix(c, '#000000', .3); g.beginPath(); g.moveTo(w / 2, -h / 2); g.lineTo(w / 2 + d, -h / 2 + d); g.lineTo(w / 2 + d, h / 2 + d); g.lineTo(w / 2, h / 2); g.closePath(); g.fill();
        const gr = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); gr.addColorStop(0, mix(c, '#ffffff', .4)); gr.addColorStop(1, c);
        g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = 1.6; g.strokeStyle = 'rgba(10,20,40,.7)'; g.strokeRect(-w / 2, -h / 2, w, h);
        g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
        break;
      }
      case 'hedge': {
        const w = b.w, h = b.h;
        g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.roundRect(-w / 2 + 3, -h / 2 + 5, w, h, 7); g.fill();
        g.fillStyle = '#2f7d34'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 7); g.fill();
        g.strokeStyle = '#1d5a25'; g.lineWidth = 1.5; g.stroke();
        const R = mulberry((x * 13 + y) | 0);
        g.fillStyle = '#4fae4a'; for (let i = 0; i < w * h / 26; i++) { circ(g, (R() - .5) * (w - 6), (R() - .5) * (h - 6), 2.6 + R() * 1.4); g.fill(); }
        g.fillStyle = 'rgba(190,240,140,.35)'; for (let i = 0; i < w * h / 70; i++) { circ(g, (R() - .5) * (w - 6), (R() - .5) * (h - 8), 1.6); g.fill(); }
        break;
      }
    }
    g.restore();
  }

  function texture(g, m, th) {
    const R = mulberry(m.idx * 31 + 7), id = m.th;
    if (id === 'grass' || id === 'garden') {
      if (id === 'garden') { g.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 0; x < MW; x += 74) g.fillRect(x, 0, 37, MH); }
      g.lineCap = 'round';
      for (let i = 0; i < 420; i++) {
        const x = R() * MW, y = R() * MH;
        g.strokeStyle = R() < .5 ? 'rgba(40,120,30,.34)' : 'rgba(170,240,120,.3)'; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 5); g.moveTo(x, y); g.lineTo(x + 2, y - 5); g.stroke();
      }
      const fc = ['#fff6a8', '#ffffff', '#ffb3d1', '#ffd36b'];
      for (let i = 0; i < 70; i++) { const x = R() * MW, y = R() * MH; g.fillStyle = fc[(R() * 4) | 0]; circ(g, x, y, 1.8); g.fill(); g.fillStyle = '#f2b02a'; circ(g, x, y, .7); g.fill(); }
    } else if (id === 'town') {
      g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1;
      for (let x = 0; x <= MW; x += 37) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, MH); g.stroke(); }
      for (let y = 0; y <= MH; y += 37) { g.beginPath(); g.moveTo(0, y); g.lineTo(MW, y); g.stroke(); }
      for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(((R() * MW / 37) | 0) * 37, ((R() * MH / 37) | 0) * 37, 37, 37); }
    } else if (id === 'beach') {
      g.strokeStyle = 'rgba(170,130,60,.22)'; g.lineWidth = 1.5;
      for (let i = 0; i < 90; i++) { const x = R() * MW, y = R() * MH; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 22, y); g.stroke(); }
      const sh = ['#ffffff', '#ffc2cf', '#fff0b0'];
      for (let i = 0; i < 26; i++) { g.fillStyle = sh[(R() * 3) | 0]; circ(g, R() * MW, R() * MH, 2); g.fill(); }
    } else if (id === 'snow') {
      for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(255,255,255,.9)'; circ(g, R() * MW, R() * MH, .9 + R() * 1.4); g.fill(); }
      g.strokeStyle = 'rgba(120,170,205,.22)'; g.lineWidth = 1.6;
      for (let i = 0; i < 40; i++) { const x = R() * MW, y = R() * MH; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 12, y - 5, x + 26, y); g.stroke(); }
    } else if (id === 'desert') {
      g.strokeStyle = 'rgba(160,110,40,.26)'; g.lineWidth = 1.6;
      for (let i = 0; i < 120; i++) { const x = R() * MW, y = R() * MH; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 5, x + 30, y); g.stroke(); }
    } else if (id === 'tech') {
      g.strokeStyle = 'rgba(100,180,255,.16)'; g.lineWidth = 1;
      for (let x = 0; x <= MW; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, MH); g.stroke(); }
      for (let y = 0; y <= MH; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(MW, y); g.stroke(); }
      g.fillStyle = 'rgba(120,220,255,.35)'; for (let i = 0; i < 40; i++) { circ(g, ((R() * MW / 32) | 0) * 32, ((R() * MH / 32) | 0) * 32, 2); g.fill(); }
    } else if (id === 'lava') {
      g.strokeStyle = 'rgba(255,110,30,.35)'; g.lineWidth = 2;
      for (let i = 0; i < 26; i++) { let x = R() * MW, y = R() * MH; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (R() - .5) * 34; y += (R() - .5) * 34; g.lineTo(x, y); } g.stroke(); }
      for (let i = 0; i < 100; i++) { g.fillStyle = 'rgba(0,0,0,.18)'; circ(g, R() * MW, R() * MH, 1 + R() * 2); g.fill(); }
    }
  }

  function drawWater(g, poly, th) {
    g.save();
    polyPath(g, poly);
    g.lineWidth = 16; g.strokeStyle = th.sh; g.lineJoin = 'round'; g.stroke();
    g.lineWidth = 7; g.strokeStyle = mix(th.sh, th.wa, .35); g.stroke();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    poly.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, th.wa); gr.addColorStop(1, th.wb);
    polyPath(g, poly); g.fillStyle = gr; g.fill();
    g.clip();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2.4;
    for (let k = 1; k <= 3; k++) { polyPath(g, poly.map(p => [(p[0] - (x0 + x1) / 2) * (1 - k * .13) + (x0 + x1) / 2, (p[1] - (y0 + y1) / 2) * (1 - k * .13) + (y0 + y1) / 2])); g.stroke(); }
    const R = mulberry((x0 * 3 + y0) | 0);
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1.8; g.lineCap = 'round';
    for (let i = 0; i < 34; i++) { const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 5, y - 3, x + 10, y); g.stroke(); }
    g.restore();
  }
  function drawLava(g, poly) {
    g.save();
    g.shadowColor = '#ff7a1a'; g.shadowBlur = 30; polyPath(g, poly); g.fillStyle = '#ff9a2a'; g.fill(); g.shadowBlur = 0;
    g.lineWidth = 8; g.strokeStyle = '#2a1510'; g.lineJoin = 'round'; g.stroke();
    let cx = 0, cy = 0; poly.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= poly.length; cy /= poly.length;
    const gr = g.createRadialGradient(cx, cy, 2, cx, cy, 40); gr.addColorStop(0, '#fff2a0'); gr.addColorStop(.5, '#ff9a2a'); gr.addColorStop(1, '#e8481a');
    polyPath(g, poly); g.fillStyle = gr; g.fill();
    g.restore();
  }

  function paintMap(m, sc) {
    const th = THEMES[m.th];
    return mk(MW, MH, g => {
      const gr = g.createLinearGradient(0, 0, MW, MH); gr.addColorStop(0, th.a); gr.addColorStop(1, th.b);
      g.fillStyle = gr; g.fillRect(0, 0, MW, MH);
      texture(g, m, th);
      for (const w of m.water) drawWater(g, w, th);
      for (const l of m.lava) drawLava(g, l);
      g.lineCap = 'round'; g.lineJoin = 'round';
      const stroke = (w, c, dx, dy, dash) => {
        g.lineWidth = w; g.strokeStyle = c;
        if (dash) g.setLineDash(dash);
        for (const p of m.pathObjs) {
          g.beginPath();
          for (let i = 0; i < p.n; i += 2) i ? g.lineTo(p.px[i] + dx, p.py[i] + dy) : g.moveTo(p.px[i] + dx, p.py[i] + dy);
          g.lineTo(p.px[p.n - 1] + dx, p.py[p.n - 1] + dy);
          g.stroke();
        }
        if (dash) g.setLineDash([]);
      };
      stroke(PATH_HALF * 2 + 8, 'rgba(0,0,0,.2)', 2, 3);
      stroke(PATH_HALF * 2 + 6, th.pb, 0, 0);
      stroke(PATH_HALF * 2 - 1, th.pm, 0, 0);
      stroke(PATH_HALF * 2 - 9, mix(th.pm, '#ffffff', .14), 0, 0);
      if (m.th === 'town') stroke(2.4, '#e8d36a', 0, 0, [14, 12]);
      if (m.th === 'tech') stroke(2, 'rgba(120,230,255,.7)', 0, 0, [4, 8]);
      if (m.th === 'lava') stroke(PATH_HALF * 2 - 20, 'rgba(255,120,40,.18)', 0, 0);
      const ends = [];
      for (const p of m.pathObjs) {
        const ex = p.px[p.n - 1], ey = p.py[p.n - 1];
        if (ex > 8 && ex < MW - 8 && ey > 8 && ey < MH - 8) ends.push([ex, ey]);
        const sx = p.px[Math.min(p.n - 1, 38)], sy = p.py[Math.min(p.n - 1, 38)], sa = p.pa[Math.min(p.n - 1, 38)];
        g.save(); g.translate(sx, sy); g.rotate(sa); g.fillStyle = 'rgba(255,255,255,.55)';
        for (const o of [0, 11]) { g.beginPath(); g.moveTo(o - 4, -8); g.lineTo(o + 5, 0); g.lineTo(o - 4, 8); g.lineTo(o - 1, 0); g.closePath(); g.fill(); }
        g.restore();
      }
      for (const [ex, ey] of ends) {
        g.save(); g.translate(ex, ey);
        if (m.id === 'stump') {
          g.fillStyle = 'rgba(0,0,0,.25)'; circ(g, 4, 5, 40); g.fill();
          g.fillStyle = '#6b4423'; circ(g, 0, 0, 38); g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#3d2410'; g.stroke();
          g.fillStyle = '#c99a5e'; circ(g, 0, 0, 31); g.fill();
          g.strokeStyle = 'rgba(110,70,30,.6)'; g.lineWidth = 1.6; for (const k of [24, 17, 10]) { circ(g, 0, 0, k); g.stroke(); }
          g.fillStyle = '#2a1608'; circ(g, 0, 0, 6); g.fill();
        } else {
          g.fillStyle = m.th === 'tech' ? '#8be8ff' : '#1a1210'; circ(g, 0, 0, 24); g.fill();
          g.lineWidth = 4; g.strokeStyle = m.th === 'tech' ? '#2a8bb0' : '#5a3a22'; g.stroke();
          g.fillStyle = m.th === 'tech' ? '#ffffff' : '#000000'; circ(g, 0, 0, 14); g.fill();
        }
        g.restore();
      }
      const obs = m.blocks.slice().sort((a, b) => a.y - b.y);
      for (const b of obs) drawObs(g, b, th);
      const vg = g.createRadialGradient(MW / 2, MH / 2, MH * .45, MW / 2, MH / 2, MW * .72);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.2)');
      g.fillStyle = vg; g.fillRect(0, 0, MW, MH);
    }, sc);
  }

  const PC = ['#ff8a1c', '#35b6f2', '#a463f2'];
  const topPath = tr => { let b = 0; for (let i = 1; i < 3; i++) if (tr[i] > tr[b]) b = i; return b; };
  const shadowE = (g, rx, ry) => { g.fillStyle = 'rgba(0,0,0,.24)'; g.beginPath(); g.ellipse(2, 4, rx, ry, 0, 0, TAU); g.fill(); };
  const FUR = '#8c5a2b', FURD = '#5e3a18';
  function arm(g, x1, y1, x2, y2, fur) {
    g.lineCap = 'round'; g.strokeStyle = FURD; g.lineWidth = 5.2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.strokeStyle = fur || FUR; g.lineWidth = 3.6; g.stroke();
    g.fillStyle = '#e6bd8a'; circ(g, x2, y2, 2.9); g.fill();
  }
  function monk(g, shirt, hat, fur) {
    fur = fur || FUR;
    g.strokeStyle = FURD; g.lineWidth = 4.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(-22, 10, -16, -9); g.stroke();
    g.strokeStyle = fur; g.lineWidth = 3; g.stroke();
    g.fillStyle = shirt; g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(-1, 0, 9.5, 13.5, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(-3, -5, 4, 5.5, 0, 0, TAU); g.fill();
    for (const s of [-1, 1]) { g.fillStyle = fur; circ(g, 0, s * 11.5, 4.6); g.fill(); g.lineWidth = 1.2; g.strokeStyle = FURD; g.stroke(); g.fillStyle = '#e6bd8a'; circ(g, .3, s * 11.8, 2.4); g.fill(); }
    g.fillStyle = fur; circ(g, 2, 0, 10.4); g.fill(); g.lineWidth = 1.5; g.strokeStyle = FURD; g.stroke();
    g.fillStyle = '#ecc795'; g.beginPath(); g.ellipse(6, 0, 6.4, 7.6, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; circ(g, 8.6, -3.5, 2.5); g.fill(); circ(g, 8.6, 3.5, 2.5); g.fill();
    g.fillStyle = '#1a1a1a'; circ(g, 9.4, -3.4, 1.3); g.fill(); circ(g, 9.4, 3.4, 1.3); g.fill();
    g.fillStyle = '#d7a56d'; g.beginPath(); g.ellipse(12, 0, 3, 3.8, 0, 0, TAU); g.fill();
    g.fillStyle = '#4a2c12'; circ(g, 13, -1, .8); g.fill(); circ(g, 13, 1, .8); g.fill();
    if (hat) hat(g);
  }
  const ring = (g, r, c, w) => { circ(g, 0, 0, r); g.lineWidth = w; g.strokeStyle = c; g.stroke(); };

  const TD = {
    dart(g, tr, st, rc) {
      const cb = tr[2] >= 3, sp = tr[0] >= 3;
      arm(g, 2, -10, 15 - rc * 3, -3); arm(g, 2, 10, 13 - rc * 3, 4);
      monk(g, tr[1] >= 3 ? '#2f7fd8' : '#e0602c', tr[2] >= 2 ? h => { g.fillStyle = '#2a2f3a'; g.fillRect(6, -6.5, 4, 13); g.fillStyle = '#7fd7ff'; g.fillRect(7, -5.5, 2, 4.4); g.fillRect(7, 1.1, 2, 4.4); } : null);
      g.save(); g.translate(-rc * 3, 0);
      if (cb) {
        g.strokeStyle = '#6a4423'; g.lineWidth = 3; g.beginPath(); g.arc(14, 0, 11, -1.15, 1.15); g.stroke();
        g.strokeStyle = '#e8e8e8'; g.lineWidth = 1; g.beginPath(); g.moveTo(14 + Math.cos(-1.15) * 11, Math.sin(-1.15) * 11); g.lineTo(11, 0); g.lineTo(14 + Math.cos(1.15) * 11, Math.sin(1.15) * 11); g.stroke();
        g.fillStyle = tr[2] >= 5 ? '#ffd934' : '#c0c8d2'; g.fillRect(12, -1.2, 14, 2.4);
      } else if (sp) {
        g.fillStyle = '#9aa0aa'; circ(g, 18, 0, 6); g.fill(); g.strokeStyle = '#3c4048'; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = '#3c4048'; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(18 + Math.cos(a - .2) * 5.6, Math.sin(a - .2) * 5.6); g.lineTo(18 + Math.cos(a) * 9.4, Math.sin(a) * 9.4); g.lineTo(18 + Math.cos(a + .2) * 5.6, Math.sin(a + .2) * 5.6); g.fill(); }
      } else {
        g.fillStyle = '#c33'; g.fillRect(12, -1, 8, 2); g.fillStyle = tr[0] >= 1 ? '#ffd934' : '#d9dde3'; g.beginPath(); g.moveTo(20, -2.4); g.lineTo(26, 0); g.lineTo(20, 2.4); g.fill();
      }
      g.restore();
    },
    tack(g, tr, st, rc) {
      const n = Math.min(st.n || 8, 16), hot = tr[0] >= 3, bl = tr[1] >= 3;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU; g.save(); g.rotate(a);
        g.fillStyle = bl ? '#d0d6de' : '#5a5f6a'; g.fillRect(9, -2.4, 7 + rc * 2.5, 4.8);
        g.fillStyle = hot ? '#ff6a2a' : '#b9bec7'; g.beginPath(); g.moveTo(16 + rc * 2.5, -2.6); g.lineTo(21 + rc * 2.5, 0); g.lineTo(16 + rc * 2.5, 2.6); g.fill();
        g.restore();
      }
      const gr = g.createRadialGradient(-4, -4, 2, 0, 0, 14); gr.addColorStop(0, '#ff9ec1'); gr.addColorStop(.6, hot ? '#d8433a' : '#e0457d'); gr.addColorStop(1, '#8e1f4c');
      circ(g, 0, 0, 11.5); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = '#4c1030'; g.stroke();
      g.fillStyle = '#fff'; circ(g, -3.4, -2, 2.6); g.fill(); circ(g, 3.4, -2, 2.6); g.fill(); g.fillStyle = '#111'; circ(g, -3, -1.8, 1.2); g.fill(); circ(g, 3.8, -1.8, 1.2); g.fill();
      g.strokeStyle = '#4c1030'; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 2, 4, .2, Math.PI - .2); g.stroke();
      if (tr[0] >= 4) { g.save(); g.globalAlpha = .55; ring(g, 24, '#ff7a2a', 4); g.restore(); }
    },
    bomb(g, tr, st, rc) {
      const c = tr[1] >= 2 ? '#3b4a62' : tr[0] >= 3 ? '#6a2a2a' : '#2f3238';
      g.fillStyle = '#5a4a3a'; circ(g, 0, 0, 13); g.fill(); g.lineWidth = 2; g.strokeStyle = '#2c241b'; g.stroke();
      g.fillStyle = '#8a7358'; circ(g, 0, 0, 9.5); g.fill();
      g.save(); g.translate(-rc * 4, 0);
      const gr = g.createLinearGradient(0, -7, 0, 7); gr.addColorStop(0, mix(c, '#ffffff', .35)); gr.addColorStop(.5, c); gr.addColorStop(1, mix(c, '#000000', .4));
      g.fillStyle = gr; g.beginPath(); g.roundRect(-4, -7, 22, 14, 3); g.fill(); g.lineWidth = 1.8; g.strokeStyle = '#111'; g.stroke();
      g.fillStyle = '#16181c'; g.beginPath(); g.roundRect(15, -8.6, 7, 17.2, 2); g.fill();
      g.fillStyle = tr[2] >= 2 ? '#ffd934' : '#c8ccd2'; g.fillRect(6, -7, 2.4, 14);
      g.restore();
      g.fillStyle = '#d33'; circ(g, -4, 0, 3); g.fill();
    },
    ice(g, tr, st, rc) {
      const aura = tr[0] >= 3 || tr[2] >= 3;
      g.save(); g.globalAlpha = .9;
      const gr = g.createRadialGradient(-5, -5, 3, 0, 0, 20); gr.addColorStop(0, '#f6fdff'); gr.addColorStop(.7, '#a9dcf5'); gr.addColorStop(1, '#5aaee0');
      circ(g, 0, 0, 20 + rc * 1.5); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = '#2f7db3'; g.stroke(); g.restore();
      g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.save(); g.rotate(a); g.beginPath(); g.moveTo(14, 0); g.lineTo(21 + (aura ? 5 : 0), -2.6); g.lineTo(21 + (aura ? 5 : 0), 2.6); g.closePath(); g.fillStyle = '#e3f6ff'; g.fill(); g.lineWidth = 1; g.strokeStyle = '#4a9bd0'; g.stroke(); g.restore(); }
      g.save(); g.scale(.82, .82); monk(g, '#4d8fd8', h => { g.fillStyle = '#fff'; circ(g, -2, 0, 9); g.fill(); g.fillStyle = '#7fc2ee'; circ(g, -3, 0, 7); g.fill(); g.fillStyle = '#ecc795'; g.beginPath(); g.ellipse(6, 0, 5.8, 6.6, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; circ(g, 8.6, -3.2, 2.2); g.fill(); circ(g, 8.6, 3.2, 2.2); g.fill(); g.fillStyle = '#1a1a1a'; circ(g, 9.3, -3.1, 1.1); g.fill(); circ(g, 9.3, 3.1, 1.1); g.fill(); }); g.restore();
    },
    glue(g, tr, st, rc) {
      arm(g, 2, -10, 15 - rc * 2, -3); arm(g, 2, 10, 12, 5);
      g.fillStyle = '#3a8f2a'; g.beginPath(); g.roundRect(-14, -8, 9, 16, 3); g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#1d5214'; g.stroke();
      g.fillStyle = '#9eea5f'; g.fillRect(-12.5, -5, 6, 4);
      monk(g, '#f0c030', null);
      g.save(); g.translate(-rc * 2, 0);
      g.fillStyle = '#6a7380'; g.beginPath(); g.roundRect(10, -3.6, 15, 7.2, 2); g.fill(); g.lineWidth = 1.4; g.strokeStyle = '#2a2f36'; g.stroke();
      g.fillStyle = tr[1] >= 3 ? '#c9ff7a' : '#8be04e'; circ(g, 25, 0, 3.4); g.fill();
      if (tr[1] >= 3) { g.strokeStyle = '#3a8f2a'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-9, 6); g.quadraticCurveTo(0, 18, 14, 4); g.stroke(); }
      g.restore();
    },
    sniper(g, tr, st, rc) {
      arm(g, 2, -10, 16 - rc * 5, -2); arm(g, 2, 10, 12 - rc * 5, 3);
      monk(g, '#5a7a3c', h => { g.fillStyle = '#4a6a30'; circ(g, 0, 0, 10.6); g.fill(); g.strokeStyle = '#2a4018'; g.lineWidth = 1.4; g.stroke(); g.fillStyle = '#3a5424'; g.fillRect(3, -9.4, 5, 18.8); g.fillStyle = '#1a1a1a'; g.fillRect(8, -5.5, 2, 11); g.fillStyle = 'rgba(30,50,20,.8)'; circ(g, -4, -4, 3); g.fill(); circ(g, -2, 4, 2.6); g.fill(); });
      g.save(); g.translate(-rc * 5, 0);
      g.fillStyle = '#3b3f46'; g.fillRect(8, -2, 30, 4); g.fillStyle = '#16181c'; g.fillRect(34, -2.8, 6, 5.6); g.fillStyle = '#5b3c22'; g.fillRect(2, -2.8, 8, 5.6);
      g.fillStyle = '#25282e'; g.fillRect(16, -5.2, 9, 3.2); g.fillStyle = '#7fd7ff'; circ(g, 25, -3.6, 1.2); g.fill();
      g.restore();
    },
    boom(g, tr, st, rc) {
      arm(g, 2, -10, 14, -8 - rc * 2); arm(g, 2, 10, 10, 6);
      monk(g, '#e8a02a', h => { g.fillStyle = '#d33'; g.fillRect(-2, -10, 3.4, 20); });
      g.save(); g.translate(14 - rc * 2, -9); g.rotate(-.5);
      const gl = tr[0] >= 2;
      g.fillStyle = gl ? '#c9d0da' : '#f09a2a'; g.strokeStyle = gl ? '#555d6a' : '#8a4a10'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(10, -5, 18, 5); g.lineTo(14, 8); g.quadraticCurveTo(8, 0, 0, 3); g.closePath(); g.fill(); g.stroke();
      g.restore();
    },
    ninja(g, tr, st, rc, tm) {
      arm(g, 2, -10, 14 - rc * 3, -4, '#26262e'); arm(g, 2, 10, 12 - rc * 3, 4, '#26262e');
      g.strokeStyle = '#d62d3a'; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-4, 0); g.quadraticCurveTo(-18, 8 + Math.sin(rc * 6) * 2, -24, 2); g.stroke();
      monk(g, '#22222a', h => { g.fillStyle = '#22222a'; circ(g, 1, 0, 10.8); g.fill(); g.fillStyle = '#d62d3a'; g.fillRect(-3, -10.6, 4, 21.2); g.fillStyle = '#ecc795'; g.fillRect(5, -4.6, 6, 9.2); g.fillStyle = '#fff'; circ(g, 8.6, -2.6, 2.1); g.fill(); circ(g, 8.6, 2.6, 2.1); g.fill(); g.fillStyle = '#111'; circ(g, 9.2, -2.5, 1.1); g.fill(); circ(g, 9.2, 2.5, 1.1); g.fill(); }, '#22222a');
      g.save(); g.translate(16 - rc * 3, -4); g.rotate(tr[0] >= 3 ? tm * 8 : 0);
      g.fillStyle = tr[0] >= 4 ? '#ffd934' : '#c8ced6'; g.strokeStyle = '#2a2f36'; g.lineWidth = 1;
      g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 2.4 : 6.4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
      g.restore();
    },
    wizard(g, tr, st, rc, tm) {
      const col = tr[1] >= tr[0] && tr[1] >= tr[2] && tr[1] > 0 ? '#e8602a' : tr[2] >= tr[0] && tr[2] > 0 ? '#3ad08a' : '#a65df2';
      arm(g, 2, -10, 15 - rc * 3, -6); arm(g, 2, 10, 10, 6);
      monk(g, '#6a3fb0', h => { g.fillStyle = '#4a2a88'; circ(g, 0, 0, 10); g.fill(); g.strokeStyle = '#2a1458'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#5a35a0'; circ(g, 0, 0, 6.4); g.fill(); g.fillStyle = '#ffd934'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = i % 2 ? 1.2 : 3; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); });
      g.save(); g.translate(-rc * 3, 0);
      g.strokeStyle = '#7a4a22'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(8, -12); g.lineTo(22, -7); g.stroke();
      const gl = g.createRadialGradient(23, -6.5, 0, 23, -6.5, 8); gl.addColorStop(0, '#fff'); gl.addColorStop(.4, col); gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl; circ(g, 23, -6.5, 8 + Math.sin(tm * 5) * 1); g.fill();
      g.restore();
    },
    super(g, tr, st, rc, tm) {
      const night = tr[1] > tr[0] && tr[1] >= tr[2], tech = tr[2] > tr[0] && tr[2] > tr[1];
      const cc = night ? '#3a2a6a' : tech ? '#2a2a34' : '#d8302a';
      g.fillStyle = cc; g.beginPath(); g.moveTo(-6, -9); g.quadraticCurveTo(-26 - Math.sin(tm * 6) * 2, -2, -22, 3 + Math.sin(tm * 5)); g.quadraticCurveTo(-26, 12, -6, 9); g.closePath(); g.fill(); g.lineWidth = 1.4; g.strokeStyle = 'rgba(0,0,0,.5)'; g.stroke();
      arm(g, 2, -10, 17 - rc * 3, -3); arm(g, 2, 10, 17 - rc * 3, 3);
      monk(g, night ? '#4a3a8a' : tech ? '#44485a' : '#2f7fe8', h => { g.fillStyle = '#12141a'; g.fillRect(7, -7.5, 4.4, 15); g.fillStyle = '#7fd7ff'; g.fillRect(8, -6.5, 2, 5); g.fillRect(8, 1.5, 2, 5); g.fillStyle = cc; g.fillRect(-4, -10.6, 3.4, 21.2); if (tr[0] > 2 || tr[1] > 2 || tr[2] > 2) { g.fillStyle = '#ffd934'; g.beginPath(); g.moveTo(-6, 0); g.lineTo(-2, -5); g.lineTo(-2, 5); g.fill(); } });
      g.fillStyle = '#e82a2a'; g.beginPath(); g.moveTo(-1, -2); g.lineTo(4, 0); g.lineTo(-1, 2); g.fill();
      g.save(); g.globalAlpha = .45 + .15 * Math.sin(tm * 6); g.strokeStyle = night ? '#9b7bff' : tech ? '#4fe8ff' : '#ffd934'; g.lineWidth = 2; circ(g, 0, 0, 19); g.stroke(); g.restore();
    },
    farm(g, tr, st, rc, tm) {
      const hi = Math.max(tr[0], tr[1], tr[2]);
      g.fillStyle = '#6d4426'; g.beginPath(); g.ellipse(0, 0, 25, 21, 0, 0, TAU); g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#3d2410'; g.stroke();
      g.strokeStyle = '#8a5a34'; g.lineWidth = 1.6; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 8 - 3, -17); g.lineTo(i * 8 + 3, 17); g.stroke(); }
      const trees = [[-10, -7], [9, -8], [-1, 8], [-13, 9], [13, 8], [0, -1]].slice(0, 3 + Math.min(3, hi));
      for (const [x, y] of trees) {
        g.save(); g.translate(x, y);
        g.fillStyle = '#5b3a1a'; circ(g, 0, 0, 2.6); g.fill();
        for (let i = 0; i < 6; i++) { g.save(); g.rotate(i / 6 * TAU + .3); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(4, -3, 9, 0); g.quadraticCurveTo(4, 2, 0, 0); g.fillStyle = i % 2 ? '#3aa04a' : '#52c05e'; g.fill(); g.restore(); }
        g.fillStyle = '#ffe14a'; circ(g, 1.6, 1.4, 2.4); g.fill(); circ(g, -1.6, 1.6, 2.2); g.fill();
        g.restore();
      }
      if (hi >= 3) { g.fillStyle = '#b83a2a'; g.fillRect(14, -22, 14, 11); g.fillStyle = '#e8c35a'; g.fillRect(14, -22, 14, 3); g.strokeStyle = '#4a1a10'; g.lineWidth = 1.2; g.strokeRect(14, -22, 14, 11); }
      if (hi >= 4) { g.fillStyle = '#ffd934'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.fillText('$', 21, -13); }
    },
    village(g, tr, st, rc, tm) {
      const hi = Math.max(tr[0], tr[1], tr[2]), pc = PC[topPath(tr)];
      g.fillStyle = '#7a5230'; circ(g, 0, 0, 21); g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#3d2410'; g.stroke();
      g.strokeStyle = '#a07044'; g.lineWidth = 1.4; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); g.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); g.stroke(); }
      const gr = g.createRadialGradient(-3, -3, 2, 0, 0, 16); gr.addColorStop(0, '#f2d27c'); gr.addColorStop(1, '#c9972f');
      circ(g, 0, 0, 15.5); g.fillStyle = gr; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#7a561a'; g.stroke();
      g.strokeStyle = 'rgba(122,86,26,.6)'; g.lineWidth = 1.1; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 3, Math.sin(a) * 3); g.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); g.stroke(); }
      g.fillStyle = '#5a3a1a'; g.fillRect(-1.2, -2, 2.4, 3); g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -15); g.stroke();
      g.fillStyle = hi ? pc : '#d33'; g.beginPath(); g.moveTo(0, -15); g.lineTo(11 + Math.sin(tm * 4) * 1.6, -12); g.lineTo(0, -9); g.fill();
      for (let i = 0; i < Math.min(hi, 5); i++) { const a = i / 5 * TAU + .6; g.fillStyle = pc; circ(g, Math.cos(a) * 24, Math.sin(a) * 24, 2.6); g.fill(); }
    },
    sub(g, tr, st, rc) {
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(0, 0, 25, 13, 0, 0, TAU); g.fill();
      const gr = g.createLinearGradient(0, -9, 0, 9); gr.addColorStop(0, '#ffe46a'); gr.addColorStop(.5, '#e0b020'); gr.addColorStop(1, '#8a6a10');
      g.fillStyle = gr; g.beginPath(); g.roundRect(-20, -8.5, 40, 17, 8.5); g.fill(); g.lineWidth = 2; g.strokeStyle = '#5a4208'; g.stroke();
      g.fillStyle = '#a07a14'; g.beginPath(); g.moveTo(-20, -4); g.lineTo(-26, -9); g.lineTo(-26, 9); g.lineTo(-20, 4); g.fill();
      g.fillStyle = '#c8ccd2'; circ(g, 2, 0, 5.4); g.fill(); g.strokeStyle = '#444'; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = '#7fd7ff'; circ(g, 2, 0, 2.6); g.fill();
      g.save(); g.translate(-rc * 3, 0); g.fillStyle = '#3a3f46'; g.fillRect(8, -2, 16, 4); g.restore();
      if (tr[1] >= 3) { g.fillStyle = '#d33'; g.beginPath(); g.moveTo(-8, -7); g.lineTo(-2, -12); g.lineTo(4, -7); g.fill(); }
    },
    boat(g, tr, st, rc, tm) {
      g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(0, 0, 29, 15, 0, 0, TAU); g.fill();
      g.fillStyle = '#7a4a22'; g.beginPath(); g.moveTo(-24, -10); g.quadraticCurveTo(0, -17, 26, 0); g.quadraticCurveTo(0, 17, -24, 10); g.closePath(); g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#3d2410'; g.stroke();
      g.fillStyle = '#b98a54'; g.beginPath(); g.moveTo(-20, -7); g.quadraticCurveTo(0, -12, 20, 0); g.quadraticCurveTo(0, 12, -20, 7); g.closePath(); g.fill();
      g.strokeStyle = '#d6aa72'; g.lineWidth = 1; for (let i = -14; i < 18; i += 6) { g.beginPath(); g.moveTo(i, -8); g.lineTo(i, 8); g.stroke(); }
      g.fillStyle = '#4a2c12'; circ(g, -2, 0, 2.6); g.fill();
      g.fillStyle = '#f4f4f0'; g.beginPath(); g.moveTo(-2, -2); g.quadraticCurveTo(-8 + Math.sin(tm * 2) * 1.4, -12, -2, -14); g.lineTo(-2, -2); g.fill();
      g.fillStyle = '#2a2f36'; g.save(); g.translate(-rc * 3, 0); g.fillRect(8, -2.2, 12, 4.4); g.fillStyle = '#16181c'; g.fillRect(18, -3, 3, 6); g.restore();
      if (tr[2] >= 2 || tr[0] >= 3) { g.fillStyle = '#2a2f36'; g.fillRect(-10, -9, 6, 3); g.fillRect(-10, 6, 6, 3); }
      g.fillStyle = tr[1] >= 3 ? '#ffd934' : '#d33'; g.beginPath(); g.moveTo(-2, -14); g.lineTo(5, -12); g.lineTo(-2, -10); g.fill();
    }
  };
  const NOROT = { farm: 1, village: 1 };
  function drawTower(g, id, tr, st, aim, rc, tm) {
    const def = TW[id], hi = Math.max(tr[0], tr[1], tr[2]), pth = topPath(tr);
    g.save();
    if (hi >= 3) {
      const gr = g.createRadialGradient(0, 0, 8, 0, 0, 30);
      gr.addColorStop(0, PC[pth] + '88'); gr.addColorStop(1, PC[pth] + '00');
      g.globalAlpha = .55 + .25 * Math.sin(tm * 3 + id);
      g.fillStyle = gr; circ(g, 0, 0, 30); g.fill(); g.globalAlpha = 1;
    }
    shadowE(g, def.id === 'farm' ? 26 : 17, def.id === 'farm' ? 22 : 15);
    if (!NOROT[def.id]) g.rotate(aim);
    TD[def.id](g, tr, st, rc, tm);
    g.restore();
    if (hi >= 4) {
      g.save(); g.fillStyle = hi >= 5 ? '#ffd934' : '#e8ecf2'; g.strokeStyle = '#3a3320'; g.lineWidth = 1.2;
      g.translate(0, -27); g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU, r = i % 2 ? 2.7 : 6.2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore();
    }
  }
  const iconCache = new Map();
  function towerIcon(id, sz) {
    const k = id + ':' + sz;
    let c = iconCache.get(k);
    if (!c) {
      c = mk(sz, sz, g => { g.translate(sz / 2, sz / 2); const s = sz / 58; g.scale(s, s); drawTower(g, id, [0, 0, 0], resolve(TW[id], [0, 0, 0]), -Math.PI / 2, 0, 0); }, 2);
      iconCache.set(k, c);
    }
    return c;
  }

  function drawProj(g, p, tm) {
    const a = p.bm ? p.spin : p.ang;
    g.save(); g.translate(p.x, p.y);
    switch (p.sh) {
      case 'dart': g.rotate(a); g.fillStyle = '#c33'; g.fillRect(-7, -1, 7, 2); g.fillStyle = '#e4e8ee'; g.beginPath(); g.moveTo(0, -2.4); g.lineTo(6.5, 0); g.lineTo(0, 2.4); g.fill(); break;
      case 'tack': g.rotate(a); g.fillStyle = '#e8ebf0'; g.fillRect(-3, -.8, 5, 1.6); g.fillStyle = '#9aa0aa'; g.beginPath(); g.moveTo(2, -1.8); g.lineTo(5.4, 0); g.lineTo(2, 1.8); g.fill(); break;
      case 'bolt': g.rotate(a); g.fillStyle = '#7a4a22'; g.fillRect(-9, -1, 10, 2); g.fillStyle = '#ffd934'; g.beginPath(); g.moveTo(1, -3); g.lineTo(9, 0); g.lineTo(1, 3); g.fill(); break;
      case 'spike': g.rotate(a * 2); g.fillStyle = '#7a8088'; circ(g, 0, 0, 6.5); g.fill(); g.fillStyle = '#c8ccd2'; for (let i = 0; i < 8; i++) { g.save(); g.rotate(i / 8 * TAU); g.beginPath(); g.moveTo(5, -2); g.lineTo(11, 0); g.lineTo(5, 2); g.fill(); g.restore(); } break;
      case 'bomb': g.fillStyle = '#23262c'; circ(g, 0, 0, 6.4); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; circ(g, -2, -2, 1.8); g.fill(); g.fillStyle = '#ffb02a'; circ(g, 5 * Math.cos(a + 2.6), 5 * Math.sin(a + 2.6), 1.7); g.fill(); break;
      case 'boom': g.rotate(a); g.fillStyle = '#f09a2a'; g.strokeStyle = '#8a4a10'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-10, 6); g.quadraticCurveTo(-12, -6, 0, -8); g.quadraticCurveTo(10, -6, 12, 4); g.lineTo(8, 6); g.quadraticCurveTo(6, -1, -1, -2); g.quadraticCurveTo(-6, -2, -6, 6); g.closePath(); g.fill(); g.stroke(); break;
      case 'glaive': g.rotate(a); g.fillStyle = '#c9d0da'; g.strokeStyle = '#4a5260'; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.save(); g.rotate(i / 3 * TAU); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(10, -9, 12, 2); g.quadraticCurveTo(6, -1, 0, 3); g.closePath(); g.fill(); g.stroke(); g.restore(); } break;
      case 'shuriken': g.rotate(a * 2); g.fillStyle = '#c8ced6'; g.strokeStyle = '#2a2f36'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 8; i++) { const q = i / 8 * TAU, r = i % 2 ? 2 : 6.6; g.lineTo(Math.cos(q) * r, Math.sin(q) * r); } g.closePath(); g.fill(); g.stroke(); break;
      case 'magic': { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 9); gr.addColorStop(0, '#fff'); gr.addColorStop(.35, '#c58bff'); gr.addColorStop(1, 'rgba(160,80,255,0)'); g.fillStyle = gr; circ(g, 0, 0, 9); g.fill(); break; }
      case 'fire': { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 11); gr.addColorStop(0, '#fff6a0'); gr.addColorStop(.4, '#ff9a2a'); gr.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = gr; circ(g, 0, 0, 11); g.fill(); break; }
      case 'laser': g.rotate(a); g.fillStyle = '#ff4d6a'; g.fillRect(-12, -1.6, 20, 3.2); g.fillStyle = '#fff'; g.fillRect(-10, -.7, 16, 1.4); break;
      case 'plasma': { g.rotate(a); const gr = g.createLinearGradient(-14, 0, 8, 0); gr.addColorStop(0, 'rgba(255,120,255,0)'); gr.addColorStop(1, '#ffd0ff'); g.fillStyle = gr; g.fillRect(-14, -3.4, 22, 6.8); g.fillStyle = '#fff'; circ(g, 6, 0, 3.4); g.fill(); break; }
      case 'glue': g.fillStyle = '#8be04e'; g.strokeStyle = '#3a8f2a'; g.lineWidth = 1.4; circ(g, 0, 0, 5.6); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.55)'; circ(g, -1.6, -1.6, 1.6); g.fill(); break;
      case 'ice': g.fillStyle = '#d6f2ff'; g.strokeStyle = '#4a9bd0'; g.lineWidth = 1.2; circ(g, 0, 0, 6.4); g.fill(); g.stroke(); g.fillStyle = '#fff'; circ(g, -1.8, -1.8, 1.8); g.fill(); break;
      case 'icicle': g.rotate(a); g.fillStyle = '#d6f6ff'; g.strokeStyle = '#4a9bd0'; g.lineWidth = 1; g.beginPath(); g.moveTo(-8, -2.4); g.lineTo(11, 0); g.lineTo(-8, 2.4); g.closePath(); g.fill(); g.stroke(); break;
      case 'blade': g.rotate(a * 2); g.fillStyle = '#dfe4ea'; g.strokeStyle = '#3a404a'; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, 3); g.quadraticCurveTo(-3, -8, 7, -2); g.quadraticCurveTo(0, -3, -6, 3); g.fill(); g.stroke(); break;
      case 'flash': { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 9); gr.addColorStop(0, '#fff'); gr.addColorStop(.5, '#fff2a0'); gr.addColorStop(1, 'rgba(255,240,120,0)'); g.fillStyle = gr; circ(g, 0, 0, 9); g.fill(); break; }
      case 'skull': g.rotate(a + Math.PI / 2); g.fillStyle = '#f2f2ee'; g.strokeStyle = '#4a4a50'; g.lineWidth = 1; circ(g, 0, -1, 5.6); g.fill(); g.stroke(); g.fillRect(-3, 3, 6, 3.4); g.fillStyle = '#2a1040'; circ(g, -2, -1.4, 1.5); g.fill(); circ(g, 2, -1.4, 1.5); g.fill(); g.globalAlpha = .3; g.fillStyle = '#9b6bff'; circ(g, 0, 0, 10); g.fill(); break;
      case 'flame': { const k = p.life > 3 ? 1 : .8 + .4 * Math.sin(tm * 14 + p.x); const gr = g.createRadialGradient(0, -2, 0, 0, 0, 12 * k); gr.addColorStop(0, '#fff6a0'); gr.addColorStop(.4, '#ff9a2a'); gr.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = gr; circ(g, 0, -2, 12 * k); g.fill(); break; }
      case 'missile': g.rotate(a); g.fillStyle = '#d0d4da'; g.beginPath(); g.moveTo(8, 0); g.lineTo(2, -3); g.lineTo(-8, -3); g.lineTo(-8, 3); g.lineTo(2, 3); g.closePath(); g.fill(); g.strokeStyle = '#4a4f58'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#e63b2e'; g.beginPath(); g.moveTo(8, 0); g.lineTo(3, -2.6); g.lineTo(3, 2.6); g.fill(); g.fillStyle = '#ffb02a'; g.beginPath(); g.moveTo(-8, -2); g.lineTo(-15 - Math.random() * 3, 0); g.lineTo(-8, 2); g.fill(); break;
      case 'plane': g.rotate(a); g.fillStyle = '#d6dae0'; g.strokeStyle = '#4a4f58'; g.lineWidth = 1; g.beginPath(); g.moveTo(8, 0); g.lineTo(-4, -8); g.lineTo(-2, 0); g.lineTo(-4, 8); g.closePath(); g.fill(); g.stroke(); break;
      case 'caltrop': g.fillStyle = '#9aa0aa'; g.strokeStyle = '#3a404a'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.save(); g.rotate(i / 4 * TAU + .4); g.beginPath(); g.moveTo(0, -1.6); g.lineTo(9, 0); g.lineTo(0, 1.6); g.fill(); g.stroke(); g.restore(); } break;
      default: g.fillStyle = '#fff'; circ(g, 0, 0, 3); g.fill();
    }
    g.restore();
  }
  const SN = ['Dart', 'Tack', 'Bomb', 'Ice', 'Glue', 'Sniper', 'Boomer', 'Ninja', 'Wizard', 'Super', 'Farm', 'Village', 'Sub', 'Boat'];
  const DIFC = ['#3fae3a', '#e0902a', '#d8402e'];
  const MEDC = ['#c98a4a', '#c4ccd6', '#ffd34d', '#c58bff'];
  const cashS = n => '$' + Math.floor(n).toLocaleString('en-US');

  function mount(root, api) {
    const mqV = matchMedia('(orientation: portrait) and (max-width: 900px)');
    let V = false, CW = 960, CH = 600, K = 1, cv = null, ctx = null, toLocal = null, PL = null;
    const saved = api.load() || {};
    const prof = { wins: saved.wins || {}, auto: !!saved.auto, last: saved.last || { map: 0, mode: 'medium' } };
    let gameSave = saved.game || null;
    let scr = 'menu', G = null, sel = null, place = null, spd = 1, accT = 0, clock = 0, hits = [], msg = null, ban = null, over = false, autoT = 0, wasRun = false, lastPops = 0, saveT = 0, helpOpen = false;
    const ptr = { x: -99, y: -99, down: false, type: 'mouse' };
    const menuSel = { map: clamp(prof.last.map | 0, 0, MAPS.length - 1), mode: MODES[prof.last.mode] ? prof.last.mode : 'medium' };
    let bg = null;
    const thumbs = [];
    const planGroups = new Map();
    const fl = Array.from({ length: 16 }, (_, i) => ({ x: Math.random() * 960, y: Math.random() * 600, t: [0, 1, 2, 3, 4, 5, 10, 11][i % 8], sp: 14 + Math.random() * 22, ph: Math.random() * 6 }));

    let AC = null, NB = null;
    const lastS = {};
    const GAPMS = { pop: 38, shoot: 60, shoot2: 70, boom: 70, throw: 90, snipe: 110, ice: 120, leak: 80 };
    function tone(f1, f2, d, type, vol, dl) {
      const t = AC.currentTime + (dl || 0), o = AC.createOscillator(), gn = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t);
      if (f2 && f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(vol, t + .008); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + d + .03);
    }
    function noise(d, vol, f, q, type, dl) {
      if (!NB) { NB = AC.createBuffer(1, AC.sampleRate * .5, AC.sampleRate); const a = NB.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
      const t = AC.currentTime + (dl || 0), s = AC.createBufferSource(), fi = AC.createBiquadFilter(), gn = AC.createGain();
      s.buffer = NB; fi.type = type; fi.frequency.value = f; fi.Q.value = q;
      gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(fi).connect(gn).connect(AC.destination); s.start(t); s.stop(t + d + .02);
    }
    function snd(n, v) {
      if (api.muted) return;
      const now = performance.now(), gp = GAPMS[n];
      if (gp) { if (now - (lastS[n] || 0) < gp) return; lastS[n] = now; }
      try {
        AC = AC || new (window.AudioContext || window.webkitAudioContext)();
        if (AC.state === 'suspended') AC.resume();
        switch (n) {
          case 'pop': noise(.07, .16, 1300 + Math.random() * 1400, 1.4, 'bandpass'); tone(700 + Math.random() * 300, 220, .05, 'sine', .06); break;
          case 'shoot': tone(560, 300, .05, 'triangle', .04); break;
          case 'shoot2': tone(820, 520, .04, 'triangle', .03); break;
          case 'boom': noise(.28, .24, 520, .7, 'lowpass'); tone(130, 40, .26, 'sine', .2); break;
          case 'throw': tone(300, 520, .09, 'sine', .035); break;
          case 'snipe': noise(.09, .2, 2400, .8, 'highpass'); tone(900, 110, .12, 'sawtooth', .07); break;
          case 'ice': tone(1500, 900, .16, 'sine', .04); noise(.12, .05, 4000, .8, 'highpass'); break;
          case 'place': tone(330, 330, .08, 'triangle', .09); tone(495, 495, .1, 'triangle', .09, .07); break;
          case 'upgrade': [392, 494, 587, 784].forEach((f, i) => tone(f, f, .1, 'square', .045, i * .065)); break;
          case 'sell': tone(1200, 1500, .08, 'sine', .08); tone(1800, 1800, .12, 'sine', .08, .07); break;
          case 'round': tone(220, 330, .22, 'sawtooth', .05); tone(330, 440, .26, 'sawtooth', .05, .18); break;
          case 'end': [523, 659, 784].forEach((f, i) => tone(f, f, .14, 'triangle', .07, i * .09)); break;
          case 'leak': tone(190, 80, .28, 'sawtooth', .1); break;
          case 'ability': tone(300, 900, .38, 'square', .06); noise(.3, .08, 800, .6, 'lowpass'); break;
          case 'err': tone(170, 150, .13, 'square', .05); break;
          case 'tap': tone(620, 620, .04, 'sine', .05); break;
          case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, .18, 'triangle', .08, i * .11)); break;
          case 'lose': [440, 392, 330, 262].forEach((f, i) => tone(f, f * .96, .22, 'sawtooth', .06, i * .16)); break;
        }
      } catch (e) {}
    }

    const F = (n, w) => (w || 'bold') + ' ' + Math.round(n * K) + 'px "Trebuchet MS","Segoe UI",system-ui,sans-serif';
    function T(s, x, y, n, col, al, w) { ctx.font = F(n, w); ctx.fillStyle = col; ctx.textAlign = al || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
    function TO(s, x, y, n, col, al, ol) { ctx.font = F(n); ctx.textAlign = al || 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2.5, n * K * .2); ctx.strokeStyle = ol || 'rgba(30,18,6,.85)'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); }
    function fitT(s, x, y, maxW, n, col, al, w) {
      let k = n;
      ctx.font = F(k, w);
      while (k > 9 && ctx.measureText(s).width > maxW) { k -= .5; ctx.font = F(k, w); }
      ctx.fillStyle = col; ctx.textAlign = al || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
    }
    function wrap(s, maxW, n, w) {
      ctx.font = F(n, w || 'normal');
      const words = s.split(' '), out = [];
      let line = '';
      for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = wd; } else line = t; }
      if (line) out.push(line);
      return out;
    }
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    const inR = (x, y, w, h) => ptr.x >= x && ptr.x <= x + w && ptr.y >= y && ptr.y <= y + h;
    const addHit = (x, y, w, h, fn) => hits.push({ x, y, w, h, fn });

    function wood(x, y, w, h, r) {
      const gr = ctx.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, '#8d6137'); gr.addColorStop(1, '#5f3d20');
      rr(x, y, w, h, r || 0); ctx.fillStyle = gr; ctx.fill();
      ctx.save(); rr(x, y, w, h, r || 0); ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 1;
      for (let i = 12; i < (V ? h : w); i += 22) { ctx.beginPath(); if (V) { ctx.moveTo(x, y + i); ctx.lineTo(x + w, y + i); } else { ctx.moveTo(x + i, y); ctx.lineTo(x + i, y + h); } ctx.stroke(); }
      ctx.restore();
      rr(x + .5, y + .5, w - 1, h - 1, r || 0); ctx.lineWidth = 2; ctx.strokeStyle = '#34200f'; ctx.stroke();
    }
    function card(x, y, w, h, r, col) {
      const gr = ctx.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, col ? mix(col, '#ffffff', .25) : '#f8e9c4'); gr.addColorStop(1, col || '#e6cd96');
      rr(x, y, w, h, r); ctx.fillStyle = gr; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#7a5a2c'; ctx.stroke();
    }
    const KIND = { green: ['#7ae05a', '#3ea02a', '#1f6a14'], red: ['#ff7a5a', '#d9402a', '#7a1a0e'], gold: ['#ffe27a', '#f0b020', '#8a5a08'], wood: ['#a97a4a', '#7a5230', '#34200f'], blue: ['#7fc8ff', '#3a8ee0', '#164a8a'], gray: ['#b8bcc4', '#8a909a', '#40454e'] };
    function button(x, y, w, h, label, o) {
      o = o || {};
      const k = KIND[o.kind || 'wood'], hot = !o.dis && inR(x, y, w, h), dn = hot && ptr.down;
      const yy = y + (dn ? 2 : 0);
      ctx.save();
      if (o.dis) ctx.globalAlpha = .5;
      rr(x, yy + 3, w, h, 9); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fill();
      const gr = ctx.createLinearGradient(x, yy, x, yy + h); gr.addColorStop(0, hot ? mix(k[0], '#ffffff', .25) : k[0]); gr.addColorStop(1, hot ? mix(k[1], '#ffffff', .15) : k[1]);
      rr(x, yy, w, h, 9); ctx.fillStyle = gr; ctx.fill();
      ctx.lineWidth = o.active ? 3.5 : 2; ctx.strokeStyle = o.active ? '#fff7a8' : k[2]; ctx.stroke();
      rr(x + 2, yy + 2, w - 4, h * .42, 7); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
      if (label) TO(label, x + w / 2, yy + h / 2 - (o.sub ? h * .12 : 0), o.size || 15, '#fff', 'center');
      if (o.sub) T(o.sub, x + w / 2, yy + h / 2 + h * .26, (o.size || 15) * .7, '#fff', 'center');
      ctx.restore();
      if (!o.dis && o.fn) addHit(x, y, w, h, o.fn);
      return hot;
    }
    function heart(x, y, s, col) {
      ctx.beginPath(); ctx.moveTo(x, y + s * .9); ctx.bezierCurveTo(x - s * 1.3, y + s * .1, x - s * .7, y - s * .9, x, y - s * .3); ctx.bezierCurveTo(x + s * .7, y - s * .9, x + s * 1.3, y + s * .1, x, y + s * .9);
      ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#6a0f0f'; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(x - s * .45, y - s * .25, s * .18, s * .28, -.6, 0, TAU); ctx.fill();
    }
    function coin(x, y, s) {
      const gr = ctx.createRadialGradient(x - s * .3, y - s * .3, 1, x, y, s); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(1, '#e0a010');
      circ(ctx, x, y, s); ctx.fillStyle = gr; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#7a5008'; ctx.stroke();
      TO('$', x, y + 1, s * 1.2 / K, '#fff6c0', 'center', '#7a5008');
    }

    function layout() {
      V = mqV.matches; K = V ? 1.3 : 1; CW = V ? 740 : 960; CH = V ? 900 : 600;
      PL = V ? { x: 0, y: 600, w: 740, h: 300 } : { x: 740, y: 0, w: 220, h: 600 };
    }
    function build() {
      if (cv) cv.remove();
      layout();
      const c = api.canvas(CW, CH);
      cv = c.canvas; ctx = c.ctx; toLocal = c.toLocal;
      cv.addEventListener('contextmenu', e => e.preventDefault());
      cv.addEventListener('pointerdown', onDown);
      cv.addEventListener('pointermove', onMove);
      cv.addEventListener('pointerup', onUp);
      cv.addEventListener('pointercancel', onUp);
      cv.addEventListener('pointerleave', () => { if (!ptr.down) { ptr.x = -99; ptr.y = -99; } });
    }

    function bgImg() {
      if (!bg || bg.mi !== G.mi) bg = { mi: G.mi, c: paintMap(G.map, 2) };
      return bg.c;
    }
    function thumb(i) { return thumbs[i] || (thumbs[i] = paintMap(MAPS[i], .26)); }

    function note(text, col) { msg = { text, col: col || '#ffd0c0', t: 2.4 }; }
    function planOf(r) {
      let o = planGroups.get(r);
      if (o) return o;
      const plan = roundPlan(r), m = new Map();
      for (const e of plan.ev) { const k = e[1] * 8 + e[2]; m.set(k, (m.get(k) || 0) + 1); }
      o = [...m].map(([k, n]) => ({ t: k >> 3, fl: k & 7, n }));
      planGroups.set(r, o);
      return o;
    }
    function bloonIcon(t, fl, x, y, h) {
      const s = bloonSprite(t, !!(fl & 1), !!(fl & 2), !!(fl & 4)), k = h / (s.big ? s.lw * .62 : s.lh);
      ctx.drawImage(s, x - s.ox * k, y - s.oy * k, s.lw * k, s.lh * k);
    }

    const saveAll = () => api.save({ wins: prof.wins, auto: prof.auto, last: prof.last, game: gameSave });
    function saveGame() {
      if (!G || G.lost || G.free2 === undefined) return;
      try { gameSave = snapshot(G); saveAll(); } catch (e) {}
    }
    function startGame(mi, mid) {
      G = makeGame({ map: mi, mode: mid, sfx: snd });
      scr = 'play'; sel = null; place = null; spd = 1; accT = 0; over = false; wasRun = false; lastPops = 0; autoT = 0; ban = null; msg = null;
      prof.last = { map: mi, mode: mid }; saveAll();
      api.score(G.round + 1);
      api.hideOverlay();
    }
    function resumeGame() {
      try { G = restore(gameSave, snd); } catch (e) { G = null; gameSave = null; saveAll(); return; }
      scr = 'play'; sel = null; place = null; spd = 1; accT = 0; over = false; wasRun = G.running; lastPops = G.pops; autoT = 0; ban = null; msg = null;
      api.score(G.round);
    }
    function toMenu() {
      if (G && !G.lost) saveGame();
      scr = 'menu'; G = null; sel = null; place = null; over = false; helpOpen = false;
      api.hideOverlay();
    }
    function winKey() { return G.mi + ':' + G.mid; }
    function stats() { return [['Round', G.round], ['Pops', G.pops.toLocaleString('en-US')], ['Cash earned', cashS(G.earned)], ['Lives', G.lives]]; }
    function defeat() {
      over = true; snd('lose');
      api.submit(G.round);
      gameSave = null; saveAll();
      api.overlay({ kicker: 'Defeat', title: 'The bloons got through', text: G.map.n + ' on ' + G.mode.n + '. You reached round ' + G.round + '.', stats: stats(), button: 'Try again', secondary: 'Main menu', onAction: () => startGame(G.mi, G.mid), onSecondary: toMenu });
    }
    function victory() {
      over = true; snd('win');
      prof.wins[winKey()] = 1;
      api.submit(G.round);
      gameSave = null; saveAll();
      api.overlay({ kicker: 'Victory', title: 'You beat ' + G.map.n + '!', text: G.mode.n + ' cleared at round ' + G.round + '. Keep going in freeplay, where the bloons never stop.', stats: stats(), button: 'Freeplay', secondary: 'Main menu', onAction: () => { over = false; G.free2 = true; G.won = false; saveGame(); }, onSecondary: toMenu });
    }
    function startRoundUI() {
      if (!G || G.running || G.lost || over) return;
      if (startRound(G)) { ban = { text: 'Round ' + G.round, t: 1.6 }; api.score(G.round); wasRun = true; autoT = 0; }
    }
    function cycleSpeed() { spd = spd >= 3 ? 1 : spd + 1; snd('tap'); }
    const priceOf = i => towerCost(G, TW[i]);
    function chooseShop(i) {
      snd('tap');
      if (place && place.id === i) { place = null; return; }
      sel = null;
      if (G.cash < priceOf(i)) { note('Not enough cash for the ' + TW[i].n, '#ffb0a0'); snd('err'); }
      place = { id: i, x: MW / 2, y: MH / 2, ok: false, err: '', set: ptr.type === 'mouse', touch: ptr.type !== 'mouse' };
      if (place.set) { place.x = clamp(ptr.x, 0, MW); place.y = clamp(ptr.y, 0, MH); }
      checkPlace();
    }
    function checkPlace() {
      if (!place) return;
      place.err = placeError(G, place.id, place.x, place.y);
      place.ok = !place.err;
    }
    let shiftHeld = false;
    function commitPlace() {
      if (!place) return;
      checkPlace();
      if (!place.ok) { note(place.err, '#ffb0a0'); snd('err'); return; }
      const id = place.id;
      if (G.cash < priceOf(id)) { note('Not enough cash', '#ffb0a0'); snd('err'); return; }
      const T0 = placeTower(G, id, place.x, place.y);
      if (!T0) return;
      if (shiftHeld && G.cash >= priceOf(id)) { sel = null; checkPlace(); } else { place = null; sel = T0; }
    }
    function upgrade(p) {
      if (!sel) return;
      const b = blocked(sel.tr, p);
      if (b) { note(b === 'Maxed' ? 'This path is maxed' : 'Only one path can go past tier 2, and only two paths can be used', '#ffb0a0'); snd('err'); return; }
      if (G.cash < upgCost(G, sel, p)) { note('Not enough cash', '#ffb0a0'); snd('err'); return; }
      upgradeTower(G, sel, p);
    }
    function sellSel() { if (sel) { sellTower(G, sel); sel = null; } }
    function useAbility(T) { if (T && T.st.ab) { if (T.abCd > 0) { note(ABIL[T.st.ab].n + ' is recharging', '#ffe0a0'); snd('err'); } else doAbility(G, T); } }
    function cycleTarget(T, d) { if (T && T.st.k === 'p' && !T.st.sn) T.tg = (T.tg + d + 4) % 4; else if (T && T.st.sn) T.tg = (T.tg + d + 4) % 4; snd('tap'); }
    const abilTowers = () => G.towers.filter(t => t.st.ab).slice(0, 8);

    function shopCells() {
      const cs = [];
      if (!V) { for (let i = 0; i < 14; i++) cs.push({ id: i, x: PL.x + 6 + (i % 2) * 107, y: PL.y + 32 + ((i / 2) | 0) * 56, w: 101, h: 50 }); }
      else { const cw = (740 - 12 - 24) / 7; for (let i = 0; i < 14; i++) cs.push({ id: i, x: 6 + (i % 7) * (cw + 4), y: PL.y + 8 + ((i / 7) | 0) * 88, w: cw, h: 84 }); }
      return cs;
    }
    let hoverShop = -1;
    function drawShop() {
      if (!V) T('MONKEYS', PL.x + PL.w / 2, PL.y + 17, 14, '#ffe9b8', 'center');
      hoverShop = -1;
      for (const c of shopCells()) {
        const def = TW[c.id], cost = priceOf(c.id), can = G.cash >= cost, hot = inR(c.x, c.y, c.w, c.h), on = place && place.id === c.id;
        card(c.x, c.y, c.w, c.h, 8, on ? '#ffe9a0' : hot ? '#fff3d0' : null);
        if (on) { rr(c.x, c.y, c.w, c.h, 8); ctx.lineWidth = 3.5; ctx.strokeStyle = '#e8a010'; ctx.stroke(); }
        if (hot) hoverShop = c.id;
        if (!V) {
          ctx.drawImage(towerIcon(c.id, 40), c.x + 3, c.y + 5, 40, 40);
          fitT(SN[c.id], c.x + 46, c.y + 17, c.w - 50, 12, '#3a2410');
          T(cashS(cost), c.x + 46, c.y + 35, 12.5, can ? '#2c7a1a' : '#c8321e');
          T(def.key, c.x + c.w - 6, c.y + 9, 8.5, 'rgba(60,36,16,.55)', 'right');
        } else {
          ctx.drawImage(towerIcon(c.id, 46), c.x + c.w / 2 - 23, c.y + 3, 46, 46);
          fitT(SN[c.id], c.x + c.w / 2, c.y + 58, c.w - 6, 12, '#3a2410', 'center');
          T(cashS(cost), c.x + c.w / 2, c.y + 74, 12, can ? '#2c7a1a' : '#c8321e', 'center');
        }
        if (def.water) { ctx.fillStyle = '#3a98e8'; circ(ctx, c.x + c.w - 9, c.y + c.h - 9, 4.5); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke(); }
        if (!can) { rr(c.x, c.y, c.w, c.h, 8); ctx.fillStyle = 'rgba(60,40,20,.28)'; ctx.fill(); }
        addHit(c.x, c.y, c.w, c.h, () => chooseShop(c.id));
      }
    }
    function drawInfo() {
      const x = V ? 6 : PL.x + 6, y = V ? PL.y + 188 : PL.y + 428, w = V ? 728 : 208, h = V ? 104 : 164;
      card(x, y, w, h, 9);
      const id = place ? place.id : hoverShop;
      if (id >= 0) {
        const def = TW[id], cost = priceOf(id);
        fitT(def.n, x + 10, y + 16 * K, w - 90, 15, '#3a2410');
        T(cashS(cost), x + w - 10, y + 16 * K, 15, G.cash >= cost ? '#2c7a1a' : '#c8321e', 'right');
        const fs = V ? 10.5 : 11;
        wrap(def.d + (def.water ? ' Water only.' : ' Land only.'), w - 20, fs).slice(0, V ? 2 : 3).forEach((l, i) => T(l, x + 10, y + 38 * K + i * 15 * K, fs, '#4a3418', 'left', 'normal'));
        def.pn.forEach((pn, i) => {
          const px = V ? x + 14 + i * 220 : x + 14, py = V ? y + h - 16 : y + h - 56 + i * 17;
          ctx.fillStyle = PC[i]; circ(ctx, px, py, 4.5); ctx.fill();
          T(pn, px + 10, py, 11, '#3a2410');
        });
        if (place && place.touch && !V) T('Tap the map, then OK', x + w - 10, y + h - 10, 10, '#7a5a2c', 'right');
      } else {
        const nr = G.round + (G.running ? 0 : 1);
        T('Round ' + nr + (G.running ? ' in progress' : ' preview'), x + 10, y + 16 * K, 14, '#3a2410');
        const gs = planOf(nr), per = V ? 8 : 4;
        gs.slice(0, per * (V ? 1 : 3)).forEach((q, i) => {
          const cx = x + 24 + (i % per) * (V ? 90 : 48), cy = V ? y + 62 : y + 52 + ((i / per) | 0) * 40;
          bloonIcon(q.t, q.fl, cx, cy, V ? 36 : 26);
          T('x' + q.n, cx + (V ? 16 : 9), cy + (V ? 24 : 18), 10.5, '#3a2410', 'center');
        });
        if (G.free2) T('Freeplay', x + w - 10, y + 16 * K, 11, '#a0581a', 'right');
      }
    }

    function tiers(T0) { return T0.tr.join('-'); }
    function drawUpg() {
      const T0 = sel, def = TW[T0.id];
      let nm, cards = [], tg, ab, sl, cl;
      if (!V) {
        nm = { x: PL.x + 6, y: PL.y + 6, w: 208, h: 52 };
        for (let i = 0; i < 3; i++) cards.push({ x: PL.x + 6, y: PL.y + 62 + i * 103, w: 208, h: 98 });
        tg = { x: PL.x + 6, y: PL.y + 373, w: 208, h: 30 };
        ab = { x: PL.x + 6, y: PL.y + 409, w: 208, h: 36 };
        sl = { x: PL.x + 6, y: PL.y + 451, w: 208, h: 40 };
        cl = { x: PL.x + 188, y: PL.y + 12, w: 26, h: 26 };
      } else {
        nm = { x: 6, y: PL.y + 4, w: 728, h: 28 };
        for (let i = 0; i < 3; i++) cards.push({ x: 6 + i * 246, y: PL.y + 34, w: 236, h: 148 });
        tg = { x: 6, y: PL.y + 192, w: 300, h: 84 };
        ab = { x: 312, y: PL.y + 192, w: 176, h: 84 };
        sl = { x: 494, y: PL.y + 192, w: 160, h: 84 };
        cl = { x: 660, y: PL.y + 192, w: 74, h: 84 };
      }
      card(nm.x, nm.y, nm.w, nm.h, 9);
      if (!V) {
        ctx.drawImage(towerIcon(T0.id, 44), nm.x + 3, nm.y + 4, 44, 44);
        fitT(def.n, nm.x + 52, nm.y + 16, 130, 13.5, '#3a2410');
        T(tiers(T0) + '   Pops ' + T0.pops.toLocaleString('en-US'), nm.x + 52, nm.y + 38, 10.5, '#6a4a22');
      } else {
        T(def.n + '   ' + tiers(T0), nm.x + 12, nm.y + nm.h / 2, 14, '#3a2410');
        T('Pops ' + T0.pops.toLocaleString('en-US'), nm.x + nm.w - 12, nm.y + nm.h / 2, 13, '#6a4a22', 'right');
      }
      if (!V) button(cl.x, cl.y, cl.w, cl.h, 'x', { kind: 'red', size: 13, fn: () => { sel = null; snd('tap'); } });
      for (let p = 0; p < 3; p++) {
        const c = cards[p], tr = T0.tr[p], bl = blocked(T0.tr, p), nx = tr < 5 ? def.u[p][tr] : null;
        const cost = nx ? upgCost(G, T0, p) : 0, can = nx && !bl && G.cash >= cost, hot = nx && !bl && inR(c.x, c.y, c.w, c.h);
        card(c.x, c.y, c.w, c.h, 9, hot ? '#fff3d0' : null);
        rr(c.x + 2, c.y + 2, c.w - 4, 20 * K, 7); ctx.fillStyle = PC[p]; ctx.fill();
        T(def.pn[p], c.x + 10, c.y + 12 * K + 1, 11, '#fff');
        for (let i = 0; i < 5; i++) { circ(ctx, c.x + c.w - 14 - (4 - i) * 12 * (V ? 1.2 : 1), c.y + 12 * K + 1, 4 * (V ? 1.1 : 1)); ctx.fillStyle = i < tr ? '#fff' : 'rgba(0,0,0,.25)'; ctx.fill(); }
        if (!nx) {
          T('MAXED', c.x + c.w / 2, c.y + c.h * .52, 15, '#a0581a', 'center');
          fitT(def.u[p][4].n, c.x + c.w / 2, c.y + c.h * .78, c.w - 16, 11.5, '#6a4a22', 'center');
        } else {
          fitT(nx.n, c.x + 8, c.y + 33 * K, c.w - 14, 12.5, '#3a2410');
          wrap(nx.t, c.w - 16, V ? 10.5 : 10).slice(0, V ? 3 : 2).forEach((l, i) => T(l, c.x + 8, c.y + (V ? 54 : 50) + i * (V ? 17 : 12.5), V ? 10.5 : 10, '#4a3418', 'left', 'normal'));
          if (bl) {
            rr(c.x + 2, c.y + 2, c.w - 4, c.h - 4, 8); ctx.fillStyle = 'rgba(40,28,16,.62)'; ctx.fill();
            T('LOCKED', c.x + c.w / 2, c.y + c.h * .5, 14, '#ffe9b8', 'center');
            T(tr >= 2 ? 'Another path is past tier 2' : 'Two paths already used', c.x + c.w / 2, c.y + c.h * .5 + 18 * K, 9.5, '#e8d0a0', 'center', 'normal');
          } else {
            const bx = c.x + 8, bw = c.w - 16, bh = V ? 38 : 24, by = c.y + c.h - bh - 6;
            rr(bx, by, bw, bh, 7); ctx.fillStyle = can ? '#5ccf3a' : '#c96a56'; ctx.fill(); ctx.lineWidth = 1.8; ctx.strokeStyle = can ? '#2a7a1a' : '#7a2a1c'; ctx.stroke();
            TO(cashS(cost), bx + bw / 2, by + bh / 2 + 1, 13.5, '#fff', 'center');
          }
        }
        if (!bl && nx) addHit(c.x, c.y, c.w, c.h, () => upgrade(p));
        else if (bl) addHit(c.x, c.y, c.w, c.h, () => upgrade(p));
      }
      if (T0.st.k === 'p') {
        card(tg.x, tg.y, tg.w, tg.h, 8);
        const bw = V ? 60 : 30;
        button(tg.x + 3, tg.y + 3, bw, tg.h - 6, '<', { kind: 'wood', size: 15, fn: () => cycleTarget(T0, -1) });
        button(tg.x + tg.w - bw - 3, tg.y + 3, bw, tg.h - 6, '>', { kind: 'wood', size: 15, fn: () => cycleTarget(T0, 1) });
        T(TGN[T0.tg], tg.x + tg.w / 2, tg.y + tg.h / 2 - (V ? 12 : 5), 14, '#3a2410', 'center');
        T('Targeting', tg.x + tg.w / 2, tg.y + tg.h / 2 + (V ? 16 : 9), 8.5, '#7a5a2c', 'center');
      } else {
        card(tg.x, tg.y, tg.w, tg.h, 8);
        T(T0.st.k === 'f' ? 'Banana farm' : T0.st.k === 'v' ? 'Village aura' : 'Pulse tower', tg.x + tg.w / 2, tg.y + tg.h / 2, 12, '#6a4a22', 'center');
      }
      if (T0.st.bank) {
        const v = Math.floor(T0.bank);
        button(ab.x, ab.y, ab.w, ab.h, v > 0 ? 'Collect ' + cashS(v) : 'Bank empty', { kind: 'gold', size: 13, dis: v <= 0, fn: () => collectBank(G, T0) });
      } else if (T0.st.ab) {
        const a = ABIL[T0.st.ab], rd = T0.abCd <= 0;
        button(ab.x, ab.y, ab.w, ab.h, a.n, { kind: rd ? 'blue' : 'gray', size: 12.5, sub: rd ? 'Ready' : Math.ceil(T0.abCd) + 's', fn: () => useAbility(T0) });
      } else if (T0.st.inc) {
        card(ab.x, ab.y, ab.w, ab.h, 8);
        T('Income ' + cashS(T0.st.inc) + '/round', ab.x + ab.w / 2, ab.y + ab.h / 2, 12, '#2c7a1a', 'center');
      }
      button(sl.x, sl.y, sl.w, sl.h, 'Sell ' + cashS(sellVal(T0)), { kind: 'red', size: 13.5, fn: sellSel });
      if (V) button(cl.x, cl.y, cl.w, cl.h, 'Close', { kind: 'wood', size: 14, fn: () => { sel = null; snd('tap'); } });
    }

    function hudLayout() {
      return V
        ? { pillH: 44, pillY: 8, lx: 8, cx: 190, rx: CW - 8, btnY: 62, btnW: 92, btnH: 40, playW: 220, playH: 78, abS: 62, abY: 124 }
        : { pillH: 32, pillY: 8, lx: 8, cx: 128, rx: CW - 220 - 8, btnY: 46, btnW: 66, btnH: 28, playW: 156, playH: 54, abS: 48, abY: 90 };
    }
    function drawHUD() {
      const H = hudLayout();
      const lw = (V ? 118 : 90), cw = V ? 190 : 126;
      rr(H.lx, H.pillY, lw, H.pillH, H.pillH / 2); ctx.fillStyle = 'rgba(40,24,10,.78)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = G.hurtT > 0 ? '#ff6a5a' : '#e8c070'; ctx.stroke();
      heart(H.lx + H.pillH / 2, H.pillY + H.pillH / 2, H.pillH * .3, '#ff4a4a');
      T(String(G.lives), H.lx + H.pillH + 4, H.pillY + H.pillH / 2 + 1, 17, '#fff');
      const cx = H.lx + lw + 8;
      rr(cx, H.pillY, cw, H.pillH, H.pillH / 2); ctx.fillStyle = 'rgba(40,24,10,.78)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#e8c070'; ctx.stroke();
      coin(cx + H.pillH / 2, H.pillY + H.pillH / 2, H.pillH * .34);
      T(cashS(G.cash), cx + H.pillH + 2, H.pillY + H.pillH / 2 + 1, 17, '#ffe27a');
      const last = G.mode.to, rw = V ? 220 : 160;
      rr(H.rx - rw, H.pillY, rw, H.pillH, H.pillH / 2); ctx.fillStyle = 'rgba(40,24,10,.78)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#e8c070'; ctx.stroke();
      T('Round ' + Math.max(G.round, G.mode.from) + (G.free2 ? '' : ' / ' + last), H.rx - rw / 2, H.pillY + H.pillH / 2 - (G.running ? 3 : 0), V ? 14 : 14, '#fff', 'center');
      if (G.running) {
        const tot = G.plan.ev.length || 1, pr = clamp(G.ei / tot, 0, 1);
        rr(H.rx - rw + 18, H.pillY + H.pillH - 9 * K, rw - 36, 4 * K, 3); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fill();
        rr(H.rx - rw + 18, H.pillY + H.pillH - 9 * K, (rw - 36) * pr, 4 * K, 3); ctx.fillStyle = '#7ae05a'; ctx.fill();
      }
      button(H.rx - H.btnW * 2 - 6, H.btnY, H.btnW, H.btnH, prof.auto ? 'Auto on' : 'Auto off', { kind: prof.auto ? 'green' : 'wood', size: 11.5, fn: () => { prof.auto = !prof.auto; saveAll(); snd('tap'); } });
      button(H.rx - H.btnW, H.btnY, H.btnW, H.btnH, 'Menu', { kind: 'wood', size: 11.5, fn: () => { toMenu(); snd('tap'); } });
      const px = MW - H.playW - 12, py = MH - H.playH - 12;
      if (!G.running) button(px, py, H.playW, H.playH, 'START', { kind: 'green', size: 20, sub: 'Round ' + (G.round + 1), fn: startRoundUI });
      else button(px, py, H.playW, H.playH, spd === 1 ? 'x1 speed' : spd === 2 ? 'x2 fast' : 'x3 faster', { kind: spd === 1 ? 'gold' : spd === 2 ? 'blue' : 'red', size: 16, sub: 'tap to change', fn: cycleSpeed });
      const at = abilTowers();
      at.forEach((t, i) => {
        const s = H.abS, ax = 10, ay = H.abY + i * (s + 8), a = ABIL[t.st.ab], rd = t.abCd <= 0, hot = inR(ax, ay, s, s);
        rr(ax, ay, s, s, 10); ctx.fillStyle = rd ? (hot ? '#5fb8ff' : '#3a8ee0') : '#5a6068'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = rd ? '#fff' : '#2a2f36'; ctx.stroke();
        ctx.drawImage(towerIcon(t.id, 40), ax + s / 2 - 17, ay + 4, 34, 34);
        if (!rd) { const f = clamp(t.abCd / (t.abMax || a.cd), 0, 1); ctx.save(); rr(ax, ay, s, s, 10); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(ax, ay + s * (1 - f), s, s * f); ctx.restore(); TO(String(Math.ceil(t.abCd)), ax + s / 2, ay + s / 2, 15, '#fff', 'center'); }
        T(String(i + 1), ax + 6, ay + s - 8, 10, '#fff');
        fitT(a.n, ax + s / 2, ay + s - 6 * K, s - 4, 8.5, '#fff', 'center');
        addHit(ax, ay, s, s, () => useAbility(t));
      });
      if (msg) {
        const a = clamp(msg.t * 2, 0, 1);
        ctx.save(); ctx.globalAlpha = a;
        ctx.font = F(14); const w = ctx.measureText(msg.text).width + 34;
        rr(MW / 2 - w / 2, H.pillY + H.pillH + 10 * K, w, 30 * K, 15 * K); ctx.fillStyle = 'rgba(30,18,8,.86)'; ctx.fill();
        T(msg.text, MW / 2, H.pillY + H.pillH + 25 * K, 14, msg.col, 'center');
        ctx.restore();
      }
      if (ban) {
        const a = clamp(Math.min(ban.t * 2, (1.6 - ban.t) * 5), 0, 1);
        ctx.save(); ctx.globalAlpha = a; TO(ban.text, MW / 2, MH * .36 - (1.6 - ban.t) * 14, 56 * (V ? .8 : 1), '#fff6c0', 'center'); ctx.restore();
      }
    }

    function drawBar(b) {
      const r = BT[b.t].r, w = r * 1.5, x = b.x - w / 2, y = b.y - r * (b.t === T_DDT ? 1.2 : .95) - 12, f = clamp(b.hp / (b.mhp || 1), 0, 1);
      rr(x - 1.5, y - 1.5, w + 3, 8, 4); ctx.fillStyle = 'rgba(10,8,6,.85)'; ctx.fill();
      rr(x, y, Math.max(2, w * f), 5, 3); ctx.fillStyle = f > .5 ? '#5ccf3a' : f > .25 ? '#ffd02a' : '#ff4a3a'; ctx.fill();
    }
    function drawScene() {
      const g = G;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, MW, MH); ctx.clip();
      if (g.shake > 0) ctx.translate((Math.random() - .5) * 12 * g.shake, (Math.random() - .5) * 12 * g.shake);
      ctx.drawImage(bgImg(), 0, 0, MW, MH);
      if (place && place.set && TW[place.id].water) {
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
        for (const w of g.map.water) { polyPath(ctx, w); ctx.stroke(); }
        ctx.setLineDash([]);
      }
      for (const p of g.pj) if (p.tp) drawProj(ctx, p, clock);
      if (sel) {
        const r = sel.st.rng >= 9000 ? 0 : effRng(sel, sel.st);
        if (r) { circ(ctx, sel.x, sel.y, r); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke(); }
        circ(ctx, sel.x, sel.y, 23); ctx.lineWidth = 3; ctx.strokeStyle = '#ffe27a'; ctx.stroke();
      }
      const tw = g.towers.slice().sort((a, b) => a.y - b.y);
      for (const t of tw) {
        ctx.save(); ctx.translate(t.x, t.y);
        drawTower(ctx, t.id, t.tr, t.st, t.aim, t.recoil, clock);
        ctx.restore();
        if (t.st.bank && t.bank > 0) { coin(t.x + 16, t.y - 20, 6); }
      }
      const bl = g.bl;
      for (let i = 0; i < bl.length; i++) {
        const b = bl[i];
        if (b.dead || BT[b.t].big) continue;
        const s = bloonSprite(b.t, b.camo, b.reg, b.fort);
        ctx.drawImage(s, b.x - s.ox, b.y - s.oy, s.lw, s.lh);
        if (b.fz > 0) { ctx.fillStyle = 'rgba(190,238,255,.78)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, BT[b.t].r * .95, BT[b.t].r * 1.12, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke(); }
        else if (b.gl > 0) { ctx.fillStyle = 'rgba(130,230,70,.55)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 1, BT[b.t].r * .95, BT[b.t].r * 1.1, 0, 0, TAU); ctx.fill(); }
        if (b.stn > 0) { ctx.strokeStyle = '#ffe14a'; ctx.lineWidth = 2; circ(ctx, b.x, b.y, BT[b.t].r + 3 + Math.sin(clock * 20) * 1.5); ctx.stroke(); }
      }
      for (let i = 0; i < bl.length; i++) {
        const b = bl[i];
        if (b.dead || !BT[b.t].big) continue;
        const s = bloonSprite(b.t, b.camo, false, b.fort);
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
        ctx.drawImage(s, -s.ox, -s.oy, s.lw, s.lh);
        if (b.fz > 0) { ctx.fillStyle = 'rgba(190,238,255,.55)'; ctx.beginPath(); ctx.ellipse(0, 0, BT[b.t].r * 1.3, BT[b.t].r * .85, 0, 0, TAU); ctx.fill(); }
        ctx.restore();
        drawBar(b);
      }
      for (const p of g.pj) if (!p.tp) drawProj(ctx, p, clock);
      for (const r of g.rings) { const k = 1 - r.l / r.ml; ctx.globalAlpha = clamp(r.l / r.ml * 1.4, 0, 1); circ(ctx, r.x, r.y, r.r * (.35 + .65 * k)); ctx.lineWidth = 3.5 * (1 - k * .6); ctx.strokeStyle = r.c; ctx.stroke(); ctx.globalAlpha = 1; }
      for (const b of g.bolts) { ctx.globalAlpha = clamp(b.l * 8, 0, 1); ctx.strokeStyle = b.c; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); ctx.globalAlpha = 1; }
      for (const p of g.parts) { ctx.globalAlpha = clamp(p.l / p.ml * 1.5, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
      ctx.globalAlpha = 1;
      for (const t of g.texts) { ctx.globalAlpha = clamp(t.l * 2, 0, 1); TO(t.s, t.x, t.y, 13, t.c, 'center'); }
      ctx.globalAlpha = 1;
      if (place && place.set) {
        const def = TW[place.id], st = resolve(def, [0, 0, 0]), r = st.rng >= 9000 ? 0 : st.rng;
        if (r) { circ(ctx, place.x, place.y, r); ctx.fillStyle = place.ok ? 'rgba(255,255,255,.2)' : 'rgba(255,50,30,.26)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = place.ok ? 'rgba(255,255,255,.8)' : 'rgba(255,90,70,.9)'; ctx.stroke(); }
        ctx.save(); ctx.translate(place.x, place.y); ctx.globalAlpha = place.ok ? .92 : .6;
        drawTower(ctx, place.id, [0, 0, 0], st, -Math.PI / 2, 0, clock);
        ctx.restore();
        if (!place.ok) { circ(ctx, place.x, place.y, 20); ctx.fillStyle = 'rgba(255,40,30,.35)'; ctx.fill(); ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(place.x - 9, place.y - 9); ctx.lineTo(place.x + 9, place.y + 9); ctx.moveTo(place.x + 9, place.y - 9); ctx.lineTo(place.x - 9, place.y + 9); ctx.stroke(); TO(place.err, place.x, place.y + 36, 12, '#ffd0c0', 'center'); }
      }
      if (g.hurtT > 0) { const gr = ctx.createRadialGradient(MW / 2, MH / 2, MH * .3, MW / 2, MH / 2, MW * .7); gr.addColorStop(0, 'rgba(255,0,0,0)'); gr.addColorStop(1, 'rgba(255,30,20,' + (g.hurtT * 1.1) + ')'); ctx.fillStyle = gr; ctx.fillRect(0, 0, MW, MH); }
      if (g.flash > 0) { ctx.globalAlpha = clamp(g.flash, 0, .5); ctx.fillStyle = g.flashC || '#fff'; ctx.fillRect(0, 0, MW, MH); ctx.globalAlpha = 1; }
      ctx.restore();
    }
    function drawGhostUI() {
      if (!place || !place.touch || !place.set) return;
      const s = V ? 34 : 24, up = place.y > 110, by = up ? place.y - 64 : place.y + 64;
      const ok = place.ok && G.cash >= priceOf(place.id);
      for (const [dx, col, lab, fn] of [[-s * 1.35, ok ? '#5ccf3a' : '#8a8f98', 'OK', commitPlace], [s * 1.35, '#e8503a', 'X', () => { place = null; snd('tap'); }]]) {
        const bx = clamp(place.x + dx, s + 4, MW - s - 4), hot = inR(bx - s, by - s, s * 2, s * 2);
        circ(ctx, bx, by, s); ctx.fillStyle = hot ? mix(col, '#ffffff', .25) : col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
        TO(lab, bx, by + 1, V ? 14 : 12, '#fff', 'center');
        addHit(bx - s, by - s, s * 2, s * 2, fn);
      }
    }

    function drawGame() {
      ctx.fillStyle = '#34200f'; ctx.fillRect(0, 0, CW, CH);
      drawScene();
      wood(PL.x, PL.y, PL.w, PL.h, 0);
      if (sel) drawUpg(); else { drawShop(); drawInfo(); }
      drawHUD();
      drawGhostUI();
    }

    function mapCard(i, x, y, w, h, comp) {
      const m = MAPS[i], on = menuSel.map === i, hot = inR(x, y, w, h);
      card(x, y, w, h, 11, on ? '#fff0b8' : hot ? '#fff5d8' : null);
      if (on) { rr(x, y, w, h, 11); ctx.lineWidth = 4; ctx.strokeStyle = '#f0a010'; ctx.stroke(); }
      const th = thumb(i);
      let tx, ty, tw, tH;
      if (comp) { tw = 124; tH = Math.round(tw * MH / MW); tx = x + 7; ty = y + (h - tH) / 2; } else { tw = w - 20; tH = Math.round(tw * MH / MW); tx = x + 10; ty = y + 8; }
      ctx.save(); rr(tx, ty, tw, tH, 7); ctx.clip(); ctx.drawImage(th, tx, ty, tw, tH); ctx.restore();
      rr(tx, ty, tw, tH, 7); ctx.lineWidth = 2; ctx.strokeStyle = '#5a3d1c'; ctx.stroke();
      const nx = comp ? tx + tw + 10 : x + 10, ny = comp ? y + 22 : y + tH + 22;
      fitT(m.n, nx, ny, comp ? w - tw - 24 : w - 20, 14.5, '#3a2410');
      const dw = 74 * (comp ? 1.15 : 1);
      rr(nx, ny + 10, dw, 17 * (comp ? 1.1 : 1), 9); ctx.fillStyle = DIFC[m.diff]; ctx.fill();
      T(DIFFN[m.diff], nx + dw / 2, ny + 19 + (comp ? 1 : 0), 10.5, '#fff', 'center');
      for (let k = 0; k < 4; k++) {
        const won = prof.wins[i + ':' + MODE_IDS[k]], cx = nx + dw + 16 + k * 15 * (comp ? 1.15 : 1), cy = ny + 19 + (comp ? 1 : 0);
        circ(ctx, cx, cy, 5.2); ctx.fillStyle = won ? MEDC[k] : 'rgba(80,60,30,.18)'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = won ? '#6a4a10' : 'rgba(80,60,30,.35)'; ctx.stroke();
      }
      if (comp) wrap(m.blurb, w - tw - 24, 10.5).slice(0, 3).forEach((l, k) => T(l, nx, ny + 44 + k * 14.5, 10.5, '#5a4020', 'left', 'normal'));
      addHit(x, y, w, h, () => { menuSel.map = i; snd('tap'); });
    }
    function drawMenu(dt) {
      const sk = ctx.createLinearGradient(0, 0, 0, CH); sk.addColorStop(0, '#6ec6ff'); sk.addColorStop(1, '#d8f2ff');
      ctx.fillStyle = sk; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      for (let i = 0; i < 6; i++) { const cx = ((i * 211 + clock * (6 + i * 2)) % (CW + 260)) - 130, cy = 30 + (i * 97) % (CH - 100); ctx.beginPath(); ctx.ellipse(cx, cy, 70, 20, 0, 0, TAU); ctx.ellipse(cx + 35, cy - 10, 44, 20, 0, 0, TAU); ctx.ellipse(cx - 35, cy - 4, 40, 17, 0, 0, TAU); ctx.fill(); }
      for (const b of fl) {
        b.y -= b.sp * dt; if (b.y < -60) { b.y = CH + 60; b.x = Math.random() * CW; }
        const s = bloonSprite(b.t, false, false, false), x = b.x + Math.sin(clock * .8 + b.ph) * 14, k = 1.5;
        if (s.big) continue;
        ctx.globalAlpha = .75; ctx.drawImage(s, x - s.ox * k, b.y - s.oy * k, s.lw * k, s.lh * k); ctx.globalAlpha = 1;
      }
      const ty = V ? 44 : 38, tsz = V ? 54 : 50;
      TO('BLOONS TD', CW / 2, ty, tsz / K, '#ffe14a', 'center', '#7a2a0a');
      T('Pop every bloon before it reaches the end', CW / 2, ty + (V ? 42 : 38), V ? 12 : 13, '#2a5a8a', 'center');
      if (!V) {
        const cw = 172, ch = 168, gx = 10, x0 = (CW - (5 * cw + 4 * gx)) / 2, y0 = 92;
        for (let i = 0; i < MAPS.length; i++) mapCard(i, x0 + (i % 5) * (cw + gx), y0 + ((i / 5) | 0) * (ch + gx), cw, ch, false);
      } else {
        const cw = 360, ch = 112, gx = 8;
        for (let i = 0; i < MAPS.length; i++) mapCard(i, 6 + (i % 2) * (cw + gx), 108 + ((i / 2) | 0) * (ch + gx), cw, ch, true);
      }
      const my = V ? 724 : 450, mh = V ? 56 : 40, mw = V ? 176 : 200, gp = V ? 8 : 12, mx0 = (CW - (4 * mw + 3 * gp)) / 2;
      MODE_IDS.forEach((id, i) => button(mx0 + i * (mw + gp), my, mw, mh, MODES[id].n, { kind: menuSel.mode === id ? 'gold' : 'wood', active: menuSel.mode === id, size: V ? 14 : 15, fn: () => { menuSel.mode = id; snd('tap'); } }));
      T(MODES[menuSel.mode].d, CW / 2, my + mh + (V ? 22 : 14), V ? 12 : 12.5, '#2a4a6a', 'center');
      const py = V ? 818 : 518, ph = V ? 70 : 56;
      const rs = gameSave && gameSave.map !== undefined ? gameSave : null;
      if (rs) {
        const w = V ? 300 : 280;
        button(CW / 2 - w - 8, py, w, ph, 'Resume', { kind: 'blue', size: 18, sub: MAPS[rs.map] ? MAPS[rs.map].n + ' - Round ' + rs.round : '', fn: () => { snd('tap'); resumeGame(); } });
        button(CW / 2 + 8, py, w, ph, 'New game', { kind: 'green', size: 18, sub: MAPS[menuSel.map].n, fn: () => { snd('tap'); startGame(menuSel.map, menuSel.mode); } });
      } else button(CW / 2 - 160, py, 320, ph, 'PLAY', { kind: 'green', size: 24, sub: MAPS[menuSel.map].n + ' - ' + MODES[menuSel.mode].n, fn: () => { snd('tap'); startGame(menuSel.map, menuSel.mode); } });
      button(CW - (V ? 56 : 46) - 8, 8, V ? 56 : 46, V ? 56 : 46, '?', { kind: 'wood', size: 22, fn: () => { helpOpen = true; snd('tap'); } });
    }
    function drawHelp() {
      ctx.fillStyle = '#6ec6ff'; ctx.fillRect(0, 0, CW, CH);
      const x = 24, y = 20, w = CW - 48, h = CH - 40;
      wood(x, y, w, h, 14);
      TO('How to play', CW / 2, y + 34, 28 / K, '#ffe14a', 'center');
      const rows = [
        ['Goal', 'Place monkeys beside the track and pop every bloon before it reaches the end. Each leak costs lives.'],
        ['Place', 'Pick a monkey, click the map. Touch: tap the monkey, tap the map, then OK. Right click or X cancels. Water monkeys need water.'],
        ['Upgrade', 'Click a monkey. Each has 3 paths of 5 upgrades. One path can reach tier 5, a second only tier 2, the third stays at 0.'],
        ['Bloons', 'Black: immune to blasts. White: immune to freezing. Purple: immune to magic and fire. Lead: needs strong or explosive hits. Camo: needs detection.'],
        ['Blimps', 'MOAB, BFB, ZOMG, DDT and BAD burst into smaller bloons. Their health bar sits above them.'],
        ['Speed', 'Space or the button starts the round, then cycles x1, x2, x3. Auto starts the next round for you.'],
        ['Keys', 'Q W E R T Y Z A S D H L X C pick a monkey. , . / buy upgrades. Tab changes targeting. Backspace sells. 1-8 use abilities.'],
        ['Modes', 'Easy is cheaper with 200 lives. Hard and Impoppable start later and cost more. Impoppable gives only 1 life. Beating the last round unlocks freeplay.']
      ];
      let yy = y + 70;
      for (const [a, b] of rows) {
        T(a, x + 24, yy, 15, '#ffe9b8');
        const ls = wrap(b, w - 150, 13);
        ls.forEach((l, i) => T(l, x + 120, yy + i * 17 * K - (ls.length > 1 ? 6 : 0), 13, '#fff7e6', 'left', 'normal'));
        yy += Math.max(1, ls.length) * 17 * K + 12 * K + 6;
      }
      button(CW / 2 - 90, y + h - 66, 180, 48, 'Back', { kind: 'green', size: 18, fn: () => { helpOpen = false; snd('tap'); } });
    }

    function render(dt) {
      hits = [];
      if (scr === 'menu') { if (helpOpen) drawHelp(); else drawMenu(dt); }
      else if (G) drawGame();
      cv.style.cursor = hits.some(h => ptr.x >= h.x && ptr.x <= h.x + h.w && ptr.y >= h.y && ptr.y <= h.y + h.h) ? 'pointer' : 'default';
    }
    function onRoundEnd() {
      note('Round ' + G.round + ' cleared  +' + cashS(G.lastBonus), '#d8ffc0');
      saveGame();
      if (G.won && !G.free2) victory();
    }
    function update(dt) {
      if (msg) { msg.t -= dt; if (msg.t <= 0) msg = null; }
      if (ban) { ban.t -= dt; if (ban.t <= 0) ban = null; }
      accT += dt * spd;
      let n = 0;
      while (accT >= DT && n < 14 && !G.lost) { stepGame(G, DT); accT -= DT; n++; }
      if (accT > DT * 2) accT = 0;
      if (G.pops > lastPops) { snd('pop'); lastPops = G.pops; }
      if (wasRun && !G.running) { wasRun = false; onRoundEnd(); }
      if (G.lost && !over) defeat();
      if (prof.auto && !G.running && !over && !G.lost) { autoT += dt; if (autoT > .9) startRoundUI(); } else autoT = 0;
      saveT += dt;
      if (saveT > 12) { saveT = 0; if (!over) saveGame(); }
      if (sel && !G.towers.includes(sel)) sel = null;
    }

    function setPtr(e) { const p = toLocal(e); ptr.x = p.x; ptr.y = p.y; ptr.type = e.pointerType || 'mouse'; return p; }
    function mapDown(p) {
      if (p.x > MW || p.y > MH) return;
      if (place) {
        place.x = p.x; place.y = p.y; place.set = true;
        if (ptr.type === 'mouse') commitPlace(); else checkPlace();
        return;
      }
      let best = null, bd = 26 * 26;
      for (const t of G.towers) { const d = (t.x - p.x) ** 2 + (t.y - p.y) ** 2; if (d < bd) { bd = d; best = t; } }
      if (best !== sel) snd('tap');
      sel = best;
    }
    function onDown(e) {
      const p = setPtr(e);
      ptr.down = true;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      if (e.button === 2) { if (place) place = null; else sel = null; return; }
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i];
        if (p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h) { h.fn(e); return; }
      }
      if (scr === 'play' && G && !over) mapDown(p);
    }
    function onMove(e) {
      const p = setPtr(e);
      if (scr === 'play' && place && (ptr.type === 'mouse' || ptr.down) && p.x <= MW && p.y <= MH) { place.x = clamp(p.x, 0, MW); place.y = clamp(p.y, 0, MH); place.set = true; checkPlace(); }
    }
    function onUp() { ptr.down = false; }
    function onKey(e) {
      shiftHeld = e.shiftKey;
      if (e.ctrlKey || e.metaKey || e.altKey || api.paused) return;
      const tg = e.target;
      if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
      const c = e.code;
      if (scr === 'menu') {
        if (helpOpen) { if (c === 'Enter' || c === 'Space' || c === 'Escape') { helpOpen = false; e.preventDefault(); } return; }
        if (c === 'Enter' || c === 'Space') { e.preventDefault(); startGame(menuSel.map, menuSel.mode); }
        else if (c === 'ArrowLeft') menuSel.map = (menuSel.map + MAPS.length - 1) % MAPS.length;
        else if (c === 'ArrowRight') menuSel.map = (menuSel.map + 1) % MAPS.length;
        return;
      }
      if (!G || over) return;
      if (c === 'Space' || c === 'Enter') { e.preventDefault(); if (e.repeat) return; if (G.running) cycleSpeed(); else startRoundUI(); return; }
      if (c === 'Escape') { place = null; sel = null; return; }
      if (c === 'Comma') { upgrade(0); return; }
      if (c === 'Period') { upgrade(1); return; }
      if (c === 'Slash') { e.preventDefault(); upgrade(2); return; }
      if (c === 'Backspace' || c === 'Delete') { e.preventDefault(); sellSel(); return; }
      if (c === 'Tab') { if (sel) { e.preventDefault(); cycleTarget(sel, e.shiftKey ? -1 : 1); } return; }
      const dm = /^Digit([1-8])$/.exec(c);
      if (dm) { useAbility(abilTowers()[+dm[1] - 1]); return; }
      const ti = TW.findIndex(t => 'Key' + t.key === c);
      if (ti >= 0) { e.preventDefault(); if (!e.repeat) { ptr.type = 'mouse'; chooseShop(ti); } }
    }

    build();
    api.on(mqV, 'change', build);
    api.on(window, 'keydown', onKey);
    api.on(window, 'keyup', e => { shiftHeld = e.shiftKey; });
    api.on(window, 'pagehide', () => { if (scr === 'play' && G && !over) saveGame(); });
    api.on(window, 'blur', () => { ptr.down = false; });
    api.loop(dt => {
      clock += dt;
      if (scr === 'play' && G && !over) update(dt);
      render(dt);
    });
    root.__btd = { get g() { return G; }, get scr() { return scr; }, get sel() { return sel; }, get place() { return place; }, startGame, snd, snapshot: () => G && snapshot(G), set spd(v) { spd = v; }, get ptr() { return ptr; }, get V() { return V; }, sim: { addTower, spawnBloon, upgradeTower, startRound, stepGame, doAbility, TW, MAPS, BT, roundPlan, refreshBuffs, RBE, hurt, makeGame, restore, snapshot, placeError, towerCost, sellTower, resolve, blocked, ABIL, near, MODES, effRng } };
  }

  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6c-9 0-15 7-15 15 0 9 8 17 15 21 7-4 15-12 15-21 0-8-6-15-15-15z"/><path d="M29 42l3 5 3-5"/><path d="M32 47c-3 4 3 7 0 11"/><path d="M24 14c-3 2-5 5-5 8" opacity=".5"/></svg>';
  const CSS = '.gm-bloons-td{gap:0}.gm-bloons-td .g-canvas{touch-action:none;-webkit-user-select:none;user-select:none;border-radius:var(--r);box-shadow:0 14px 34px -18px rgba(30,20,10,.7)}';

  Ameplay.register({
    id: 'bloons-td',
    title: 'Bloons TD',
    category: 'Strategy',
    tint: '#5cb83c',
    blurb: 'Place monkeys, upgrade three paths and pop every bloon on ten maps and four modes.',
    help: 'Pick a monkey and click the map (touch: tap, then OK) · click a monkey to upgrade or sell · <kbd>Space</kbd> start and fast forward x3 · <kbd>Q</kbd><kbd>W</kbd><kbd>E</kbd><kbd>R</kbd><kbd>T</kbd><kbd>Y</kbd><kbd>Z</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>H</kbd><kbd>L</kbd><kbd>X</kbd><kbd>C</kbd> pick a monkey · <kbd>,</kbd><kbd>.</kbd><kbd>/</kbd> upgrades · <kbd>Tab</kbd> targeting · <kbd>Backspace</kbd> sell · <kbd>1</kbd>-<kbd>8</kbd> abilities',
    better: 'high',
    format: v => 'R' + v,
    width: 960,
    icon: ICON,
    css: CSS,
    mount
  });
})();
