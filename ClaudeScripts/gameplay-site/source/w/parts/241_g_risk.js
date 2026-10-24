(() => {
  'use strict';

  const NAMES = ['Alaska', 'Northwest Territory', 'Greenland', 'Alberta', 'Ontario', 'Quebec', 'Western United States', 'Eastern United States', 'Central America',
    'Venezuela', 'Peru', 'Brazil', 'Argentina',
    'Iceland', 'Great Britain', 'Scandinavia', 'Northern Europe', 'Western Europe', 'Southern Europe', 'Ukraine',
    'North Africa', 'Egypt', 'East Africa', 'Congo', 'South Africa', 'Madagascar',
    'Ural', 'Siberia', 'Yakutsk', 'Kamchatka', 'Irkutsk', 'Mongolia', 'Japan', 'Afghanistan', 'China', 'Middle East', 'India', 'Siam',
    'Indonesia', 'New Guinea', 'Western Australia', 'Eastern Australia'];
  const SHORT = ['Alaska', 'N.W. Territory', 'Greenland', 'Alberta', 'Ontario', 'Quebec', 'W. United States', 'E. United States', 'Central America',
    'Venezuela', 'Peru', 'Brazil', 'Argentina',
    'Iceland', 'Great Britain', 'Scandinavia', 'N. Europe', 'W. Europe', 'S. Europe', 'Ukraine',
    'N. Africa', 'Egypt', 'East Africa', 'Congo', 'South Africa', 'Madagascar',
    'Ural', 'Siberia', 'Yakutsk', 'Kamchatka', 'Irkutsk', 'Mongolia', 'Japan', 'Afghanistan', 'China', 'Middle East', 'India', 'Siam',
    'Indonesia', 'New Guinea', 'W. Aus.', 'E. Aus.'];
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const CONT = [
    { n: 'North America', s: 'NA', b: 5, c: '#d99a3c', t: range(0, 8) },
    { n: 'South America', s: 'SA', b: 2, c: '#c8604f', t: range(9, 12) },
    { n: 'Europe', s: 'EU', b: 5, c: '#5b83cc', t: range(13, 19) },
    { n: 'Africa', s: 'AF', b: 3, c: '#a47a45', t: range(20, 25) },
    { n: 'Asia', s: 'AS', b: 7, c: '#4fa56e', t: range(26, 37) },
    { n: 'Australia', s: 'AU', b: 2, c: '#a066c6', t: range(38, 41) }
  ];
  const CI = [];
  CONT.forEach((c, i) => c.t.forEach(t => { CI[t] = i; }));
  const ADJ = [
    [1, 3, 29], [0, 3, 4, 2], [1, 4, 5, 13], [0, 1, 4, 6], [1, 2, 3, 5, 6, 7], [2, 4, 7], [3, 4, 7, 8], [4, 5, 6, 8], [6, 7, 9],
    [8, 10, 11], [9, 11, 12], [9, 10, 12, 20], [10, 11],
    [2, 14, 15], [13, 15, 16, 17], [13, 14, 16, 19], [14, 15, 17, 18, 19], [14, 16, 18, 20], [16, 17, 19, 20, 21, 35], [15, 16, 18, 26, 33, 35],
    [11, 17, 18, 21, 22, 23], [18, 20, 22, 35], [20, 21, 23, 24, 25, 35], [20, 22, 24], [22, 23, 25], [22, 24],
    [19, 27, 33, 34], [26, 28, 30, 31, 34], [27, 29, 30], [0, 28, 30, 31, 32], [27, 28, 29, 31], [27, 29, 30, 32, 34], [29, 31], [19, 26, 34, 35, 36], [26, 27, 31, 33, 36, 37], [18, 19, 21, 22, 33, 36], [33, 34, 35, 37], [34, 36, 38],
    [37, 39, 40], [38, 40, 41], [38, 39, 41], [39, 40]
  ];

  const RINGS = [
    [[28, 88, 44, 66, 72, 52, 104, 48, 134, 54, 140, 118, 148, 152, 130, 142, 112, 128, 96, 118, 78, 116, 60, 108, 46, 112, 30, 104], [40, 124, 52, 120, 54, 127, 42, 131], [64, 132, 76, 130, 76, 137, 64, 139]],
    [[134, 54, 168, 38, 214, 30, 262, 34, 304, 46, 334, 66, 328, 98, 332, 134, 284, 138, 232, 134, 184, 126, 140, 118], [300, 20, 330, 14, 352, 26, 346, 46, 322, 42], [190, 12, 226, 6, 250, 14, 230, 24]],
    [[402, 38, 438, 22, 486, 18, 522, 30, 530, 62, 512, 92, 486, 116, 462, 124, 444, 100, 424, 76, 406, 60]],
    [[140, 118, 184, 126, 232, 134, 236, 172, 236, 214, 192, 212, 152, 210, 150, 182, 148, 152]],
    [[232, 134, 284, 138, 332, 134, 334, 170, 330, 214, 262, 218, 236, 214, 236, 172]],
    [[332, 134, 364, 120, 396, 130, 414, 158, 404, 186, 392, 206, 372, 218, 330, 214, 334, 170], [420, 196, 436, 192, 438, 204, 424, 208]],
    [[152, 210, 192, 212, 236, 214, 262, 218, 266, 258, 268, 294, 220, 296, 186, 290, 160, 268, 150, 240]],
    [[262, 218, 330, 214, 372, 218, 380, 240, 366, 266, 350, 290, 336, 318, 322, 298, 300, 298, 268, 294, 266, 258]],
    [[186, 290, 220, 296, 268, 294, 300, 298, 322, 298, 310, 316, 296, 332, 304, 350, 320, 364, 326, 378, 296, 388, 280, 372, 250, 346, 222, 322, 204, 308]],
    [[296, 388, 326, 378, 362, 382, 396, 394, 410, 410, 388, 424, 350, 426, 318, 432, 296, 420]],
    [[296, 420, 318, 432, 332, 470, 352, 490, 332, 500, 322, 530, 302, 512, 290, 480, 278, 448]],
    [[388, 424, 410, 410, 440, 430, 450, 462, 436, 500, 410, 528, 386, 540, 368, 520, 352, 490, 332, 470, 318, 432, 350, 426]],
    [[352, 490, 368, 520, 386, 540, 372, 566, 350, 596, 336, 602, 326, 570, 322, 530, 332, 500]],
    [[468, 142, 492, 134, 518, 140, 524, 158, 502, 168, 474, 164]],
    [[482, 176, 502, 180, 510, 200, 500, 214, 510, 226, 488, 232, 472, 226, 474, 206, 470, 190], [442, 196, 456, 192, 458, 210, 444, 214]],
    [[548, 152, 540, 122, 558, 86, 588, 64, 622, 68, 630, 86, 632, 128, 630, 150, 630, 172, 596, 178, 580, 166, 566, 160]],
    [[506, 240, 528, 246, 580, 252, 634, 248, 636, 206, 630, 172, 596, 178, 560, 186, 530, 200, 522, 222]],
    [[480, 244, 506, 240, 528, 246, 532, 276, 530, 298, 504, 306, 480, 300, 462, 284, 464, 262]],
    [[528, 246, 580, 252, 634, 248, 646, 270, 634, 292, 610, 306, 600, 290, 584, 302, 572, 320, 560, 302, 546, 300, 530, 298, 532, 276]],
    [[630, 86, 668, 68, 704, 62, 708, 120, 706, 170, 700, 214, 690, 250, 646, 270, 634, 248, 636, 206, 630, 172, 630, 150, 632, 128]],
    [[460, 352, 476, 334, 506, 328, 540, 334, 570, 336, 574, 372, 586, 404, 548, 410, 520, 420, 490, 408, 470, 384]],
    [[570, 336, 600, 326, 636, 332, 646, 352, 636, 370, 628, 376, 600, 374, 574, 372]],
    [[574, 372, 600, 374, 628, 376, 636, 370, 656, 378, 690, 382, 682, 404, 670, 424, 654, 448, 640, 466, 628, 496, 612, 476, 600, 450, 592, 430, 586, 404]],
    [[520, 420, 548, 410, 586, 404, 592, 430, 600, 450, 612, 476, 590, 486, 560, 480, 536, 470, 524, 446]],
    [[536, 470, 560, 480, 590, 486, 612, 476, 628, 496, 620, 528, 598, 552, 574, 560, 556, 540, 548, 510, 538, 490]],
    [[676, 486, 688, 476, 694, 498, 686, 530, 672, 540, 668, 510]],
    [[704, 62, 740, 50, 776, 50, 784, 96, 780, 140, 776, 176, 742, 184, 706, 170, 708, 120]],
    [[776, 50, 812, 40, 852, 46, 866, 76, 866, 110, 862, 140, 850, 172, 826, 180, 800, 182, 776, 176, 780, 140, 784, 96]],
    [[852, 46, 900, 38, 950, 42, 930, 106, 866, 110, 866, 76]],
    [[950, 42, 986, 48, 998, 76, 992, 118, 978, 152, 966, 184, 950, 200, 940, 172, 938, 140, 930, 106]],
    [[866, 110, 930, 106, 938, 140, 940, 172, 900, 176, 850, 172, 862, 140]],
    [[826, 180, 850, 172, 900, 176, 940, 172, 950, 200, 938, 222, 906, 236, 866, 236, 836, 228, 822, 206]],
    [[964, 206, 978, 196, 990, 210, 988, 240, 976, 266, 962, 274, 958, 252, 964, 228]],
    [[706, 170, 742, 184, 748, 216, 756, 250, 740, 262, 712, 266, 690, 250, 700, 214]],
    [[742, 184, 776, 176, 800, 182, 826, 180, 822, 206, 836, 228, 866, 236, 906, 236, 938, 222, 936, 262, 912, 288, 884, 296, 862, 300, 842, 296, 826, 272, 792, 262, 756, 250, 748, 216]],
    [[646, 270, 690, 250, 712, 266, 740, 262, 744, 290, 738, 318, 720, 340, 704, 364, 684, 356, 666, 344, 646, 352, 636, 332, 642, 312, 634, 292]],
    [[740, 262, 756, 250, 792, 262, 798, 296, 784, 336, 772, 372, 758, 346, 750, 318, 744, 290]],
    [[792, 262, 826, 272, 842, 296, 862, 300, 864, 322, 850, 352, 836, 346, 824, 326, 812, 336, 800, 326, 798, 296]],
    [[806, 384, 828, 392, 838, 410, 826, 414, 810, 400], [850, 380, 874, 376, 886, 392, 868, 404, 850, 398], [836, 422, 872, 420, 892, 426, 866, 434, 838, 430]],
    [[920, 396, 950, 388, 984, 396, 990, 410, 960, 416, 930, 414]],
    [[866, 452, 896, 444, 920, 448, 924, 480, 920, 520, 896, 528, 872, 516, 862, 486]],
    [[920, 448, 950, 444, 978, 456, 986, 490, 970, 520, 946, 532, 920, 520, 924, 480]]
  ];
  const DECOR = [
    [300, 322, 316, 318, 330, 326, 316, 330], [338, 330, 350, 326, 356, 334, 342, 336], [770, 384, 782, 382, 784, 394, 774, 396],
    [996, 560, 1008, 552, 1012, 570, 1002, 580], [974, 540, 986, 534, 988, 548], [926, 300, 934, 292, 938, 308, 930, 312],
    [880, 324, 892, 320, 894, 336, 884, 338], [604, 292, 614, 288, 616, 296, 606, 298], [540, 38, 572, 28, 590, 36, 574, 48, 548, 48]
  ];
  const SEA = [
    [1, 2, 336, 64, 404, 52], [2, 4, 426, 78, 336, 138], [2, 5, 446, 102, 402, 134], [2, 13, 490, 118, 492, 136],
    [13, 14, 498, 168, 498, 180], [13, 15, 524, 152, 548, 142], [14, 15, 504, 182, 548, 154], [14, 16, 511, 206, 528, 206],
    [14, 17, 488, 234, 484, 243], [11, 20, 442, 434, 462, 352], [17, 20, 486, 332, 486, 306], [18, 20, 556, 336, 566, 324],
    [18, 21, 606, 328, 610, 308], [22, 35, 690, 384, 694, 366], [22, 25, 662, 440, 678, 484], [24, 25, 628, 500, 668, 512],
    [37, 38, 850, 354, 858, 378], [38, 39, 888, 392, 920, 398], [38, 40, 868, 434, 884, 448],
    [39, 40, 926, 416, 914, 446], [39, 41, 958, 418, 950, 444], [29, 32, 970, 198, 964, 186], [31, 32, 960, 214, 944, 214]
  ];
  const WRAP = [[0, 29]];

  const edgeKey = (a, b, c, d) => (a < c || (a === c && b < d)) ? a + ',' + b + '|' + c + ',' + d : c + ',' + d + '|' + a + ',' + b;
  const EDGES = RINGS.map(rs => {
    const m = new Set();
    rs.forEach(r => { for (let i = 0; i < r.length; i += 2) { const j = (i + 2) % r.length; m.add(edgeKey(r[i], r[i + 1], r[j], r[j + 1])); } });
    return m;
  });
  const LAND = new Set();
  for (let a = 0; a < 42; a++) for (let b = a + 1; b < 42; b++) { for (const k of EDGES[a]) if (EDGES[b].has(k)) { LAND.add(a * 64 + b); break; } }
  const isLand = (a, b) => LAND.has(a < b ? a * 64 + b : b * 64 + a);
  const ringD = r => { let d = ''; for (let i = 0; i < r.length; i += 2) d += (i ? 'L' : 'M') + r[i] + ' ' + r[i + 1]; return d + 'Z'; };
  const PATHS = RINGS.map(rs => rs.map(ringD).join(''));
  const ANCH = RINGS.map(rs => {
    let best = null, ba = 0;
    rs.forEach(r => {
      let a = 0, cx = 0, cy = 0;
      for (let i = 0; i < r.length; i += 2) {
        const j = (i + 2) % r.length, f = r[i] * r[j + 1] - r[j] * r[i + 1];
        a += f; cx += (r[i] + r[j]) * f; cy += (r[i + 1] + r[j + 1]) * f;
      }
      a /= 2;
      if (Math.abs(a) > ba) { ba = Math.abs(a); best = [cx / (6 * a), cy / (6 * a)]; }
    });
    return best;
  });
  const ANCH_FIX = { 0: [92, 88], 1: [236, 88], 2: [466, 72], 15: [592, 126], 25: [682, 508], 38: [866, 390], 5: [372, 170], 29: [962, 114], 9: [356, 408], 11: [396, 478], 27: [826, 112], 14: [490, 208], 34: [842, 252], 33: [722, 226], 35: [696, 306], 8: [262, 330], 26: [742, 112] };
  Object.keys(ANCH_FIX).forEach(k => { ANCH[k] = ANCH_FIX[k]; });

  const START = { 2: 40, 3: 35, 4: 30, 5: 25, 6: 20 };
  const TRADE = [4, 6, 8, 10, 12, 15];
  const tradeVal = k => k < 6 ? TRADE[k] : 15 + 5 * (k - 5);
  const sym = id => id >= 42 ? 3 : id % 3;
  const SYMN = ['Infantry', 'Cavalry', 'Artillery', 'Wild'];
  const validSet = ids => {
    if (!Array.isArray(ids) || ids.length !== 3 || new Set(ids).size !== 3) return false;
    if (ids.some(i => !Number.isInteger(i) || i < 0 || i > 43)) return false;
    if (ids.some(i => i >= 42)) return true;
    const k = new Set(ids.map(sym)).size;
    return k === 1 || k === 3;
  };
  const setsOf = hand => {
    const out = [];
    for (let i = 0; i < hand.length; i++) for (let j = i + 1; j < hand.length; j++) for (let k = j + 1; k < hand.length; k++) { const c = [hand[i], hand[j], hand[k]]; if (validSet(c)) out.push(c); }
    return out;
  };

  const OUT = {};
  for (let a = 1; a <= 3; a++) for (let d = 1; d <= 2; d++) {
    const tot = Math.pow(6, a + d), m = {}, k = Math.min(a, d);
    for (let i = 0; i < tot; i++) {
      let x = i; const A = [], B = [];
      for (let j = 0; j < a; j++) { A.push(x % 6); x = (x / 6) | 0; }
      for (let j = 0; j < d; j++) { B.push(x % 6); x = (x / 6) | 0; }
      A.sort((p, q) => q - p); B.sort((p, q) => q - p);
      let ld = 0;
      for (let j = 0; j < k; j++) if (A[j] > B[j]) ld++;
      m[ld] = (m[ld] || 0) + 1;
    }
    OUT[a * 3 + d] = Object.keys(m).map(ld => [k - ld, +ld, m[ld] / tot]);
  }
  const PM = new Map();
  function pConq(A, D) {
    if (D <= 0) return 1;
    if (A < 2) return 0;
    if (A > 150) A = 150;
    if (D > 150) D = 150;
    const key = A * 256 + D, c = PM.get(key);
    if (c !== undefined) return c;
    const a = Math.min(3, A - 1), d = Math.min(2, D);
    let r = 0;
    for (const [la, ld, p] of OUT[a * 3 + d]) r += p * pConq(A - la, D - ld);
    PM.set(key, r);
    return r;
  }

  function reachOf(owner, p, from) {
    const seen = new Set([from]), q = [from];
    while (q.length) { const t = q.pop(); for (const x of ADJ[t]) if (!seen.has(x) && owner[x] === p) { seen.add(x); q.push(x); } }
    seen.delete(from);
    return seen;
  }

  function Engine(o) {
    const R = o.rnd || Math.random, n = o.n, capMode = o.mode === 'cap', draft = o.claim === 'draft', NB = n === 2 ? 2 : -9;
    const rint = k => Math.floor(R() * k);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const chunk = n === 2 ? 2 : 3;
    const s = {
      n, mode: capMode ? 'cap' : 'dom', draft, neutral: NB, owner: Array(42).fill(-1), armies: Array(42).fill(0), phase: 'init', turn: 0, first: 0, pool: 0,
      rem: Array(n).fill(0), hands: Array.from({ length: n }, () => []), deck: [], disc: [], tradeN: 0, conq: false, back: null, occ: null,
      caps: Array(n).fill(-1), elim: Array(n).fill(false), winner: -1, turnNo: 0, uid: 0,
      st: Array.from({ length: n }, () => ({ conq: 0, kills: 0, lost: 0, turns: 0 }))
    };
    let ev = [];
    const E = e => { ev.push(e); };
    const count = p => { let c = 0; for (let t = 0; t < 42; t++) if (s.owner[t] === p) c++; return c; };
    const armiesOf = p => { let c = 0; for (let t = 0; t < 42; t++) if (s.owner[t] === p) c += s.armies[t]; return c; };
    const nextAlive = p => { for (let i = 1; i <= n; i++) { const q = (p + i) % n; if (!s.elim[q]) return q; } return p; };
    const must = p => s.phase === 'reinforce' && s.turn === p && s.hands[p].length >= (s.back ? 6 : 5);
    const reinf = p => {
      const terr = count(p);
      let base = Math.max(3, (terr / 3) | 0);
      const conts = [];
      CONT.forEach((c, i) => { if (c.t.every(t => s.owner[t] === p)) { base += c.b; conts.push(i); } });
      return { n: base, terr, conts };
    };
    const validT = t => Number.isInteger(t) && t >= 0 && t < 42;

    function neutralPlace() {
      let best = [], m = 1e9;
      for (let t = 0; t < 42; t++) if (s.owner[t] === NB) { if (s.armies[t] < m) { m = s.armies[t]; best = [t]; } else if (s.armies[t] === m) best.push(t); }
      if (!best.length) return;
      const t = best[rint(best.length)];
      s.armies[t]++;
      E({ k: 'place', p: NB, t, n: 1, a: s.armies[t], setup: 1 });
    }
    function begin() {
      s.first = rint(n); s.turn = s.first;
      s.deck = shuffle([...Array(44).keys()]);
      E({ k: 'first', p: s.first });
      if (draft) { s.phase = 'claim'; E({ k: 'phase', ph: 'claim' }); return; }
      const order = shuffle([...Array(42).keys()]);
      order.forEach((t, i) => { s.owner[t] = n === 2 ? i % 3 : (s.first + i) % n; s.armies[t] = 1; });
      E({ k: 'deal' });
      setupBegin();
    }
    function setupBegin() {
      for (let p = 0; p < n; p++) s.rem[p] = START[n] - count(p);
      s.phase = 'setup'; s.turn = s.first; s.pool = Math.min(chunk, s.rem[s.turn]);
      E({ k: 'phase', ph: 'setup' });
      E({ k: 'turn', p: s.turn, setup: 1, n: s.pool });
    }
    function setupNext(p) {
      if (n === 2) neutralPlace();
      for (let i = 1; i <= n; i++) {
        const q = (p + i) % n;
        if (s.rem[q] > 0) { s.turn = q; s.pool = Math.min(chunk, s.rem[q]); E({ k: 'turn', p: q, setup: 1, n: s.pool }); return; }
      }
      if (capMode) { s.phase = 'cappick'; s.turn = s.first; s.pool = 0; E({ k: 'phase', ph: 'cappick' }); E({ k: 'turn', p: s.turn, cap: 1 }); }
      else startTurn(s.first);
    }
    function startTurn(p) {
      s.turn = p; s.conq = false; s.back = null; s.occ = null; s.turnNo++;
      const r = reinf(p);
      s.pool = r.n; s.phase = 'reinforce'; s.st[p].turns++;
      E({ k: 'turn', p, n: r.n, terr: r.terr, conts: r.conts, no: s.turnNo });
    }
    function endTurn(p) { startTurn(nextAlive(p)); }

    function claim(p, t) {
      if (s.phase !== 'claim' || !validT(t) || s.owner[t] !== -1) return false;
      s.owner[t] = p; s.armies[t] = 1;
      E({ k: 'claim', p, t });
      let rest = s.owner.indexOf(-1);
      if (n === 2 && p !== s.first && rest >= 0) {
        const free = []; s.owner.forEach((o, i) => { if (o === -1) free.push(i); });
        const u = free[rint(free.length)];
        s.owner[u] = NB; s.armies[u] = 1;
        E({ k: 'claim', p: NB, t: u });
        rest = s.owner.indexOf(-1);
      }
      if (rest < 0) { E({ k: 'deal' }); setupBegin(); return true; }
      s.turn = nextAlive(p);
      E({ k: 'turn', p: s.turn, claim: 1 });
      return true;
    }
    function place(p, t, k) {
      if (!validT(t) || !Number.isInteger(k) || k < 1 || s.owner[t] !== p) return false;
      if (s.phase === 'setup') {
        if (k > s.pool) return false;
        s.armies[t] += k; s.pool -= k; s.rem[p] -= k;
        E({ k: 'place', p, t, n: k, a: s.armies[t], setup: 1 });
        if (s.pool === 0) setupNext(p);
        return true;
      }
      if (s.phase !== 'reinforce' || must(p) || k > s.pool) return false;
      s.armies[t] += k; s.pool -= k;
      E({ k: 'place', p, t, n: k, a: s.armies[t] });
      if (s.pool === 0) { s.phase = s.back || 'attack'; s.back = null; E({ k: 'phase', ph: s.phase }); }
      return true;
    }
    function draw() {
      if (!s.deck.length && s.disc.length) { s.deck = shuffle(s.disc); s.disc = []; }
      return s.deck.length ? s.deck.pop() : -1;
    }
    function trade(p, c, bt) {
      if (s.phase !== 'reinforce' || !validSet(c)) return false;
      const h = s.hands[p];
      if (!c.every(i => h.includes(i))) return false;
      const val = tradeVal(s.tradeN++);
      c.forEach(i => { h.splice(h.indexOf(i), 1); s.disc.push(i); });
      let bonus = -1;
      const cand = c.filter(i => i < 42 && s.owner[i] === p);
      if (cand.length) { bonus = cand.includes(bt) ? bt : cand[0]; s.armies[bonus] += 2; }
      s.pool += val;
      E({ k: 'trade', p, c: c.slice(), v: val, bt: bonus, a: bonus >= 0 ? s.armies[bonus] : 0 });
      return true;
    }
    const winCheck = p => {
      if (capMode) {
        if (s.caps.some(c => c < 0)) return false;
        return s.caps.every(c => s.owner[c] === p);
      }
      return s.owner.every(o => o === p);
    };
    function over(p) { s.phase = 'over'; s.winner = p; s.occ = null; E({ k: 'win', p }); }
    function afterConq(p) {
      if (s.hands[p].length >= 6) { s.phase = 'reinforce'; s.back = 'attack'; s.pool = 0; E({ k: 'phase', ph: 'reinforce', force: 1 }); }
      else { s.phase = 'attack'; E({ k: 'phase', ph: 'attack' }); }
    }
    function conquer(p, from, to, nd) {
      const prev = s.owner[to];
      s.owner[to] = p; s.armies[to] = nd; s.armies[from] -= nd;
      s.conq = true; s.st[p].conq++;
      E({ k: 'conq', p, from, to, prev, n: nd, af: s.armies[from], at: s.armies[to] });
      if (prev !== NB && !s.owner.includes(prev)) {
        s.elim[prev] = true;
        const got = s.hands[prev].splice(0);
        s.hands[p].push(...got);
        E({ k: 'elim', p, q: prev, c: got.slice(), n: got.length });
      }
      const alive = s.elim.filter(x => !x).length;
      if (winCheck(p) || (alive === 1 && NB < 0)) return over(p);
      const extra = s.armies[from] - 1;
      if (extra > 0) { s.occ = { from, to, max: extra }; s.phase = 'occupy'; E({ k: 'phase', ph: 'occupy' }); }
      else afterConq(p);
    }
    function rollOnce(p, from, to, nd) {
      const A = s.armies[from], D = s.armies[to];
      nd = Math.min(nd, A - 1, 3);
      const dd = Math.min(2, D), ad = [], df = [];
      for (let i = 0; i < nd; i++) ad.push(1 + rint(6));
      for (let i = 0; i < dd; i++) df.push(1 + rint(6));
      ad.sort((a, b) => b - a); df.sort((a, b) => b - a);
      let la = 0, ld = 0;
      for (let i = 0; i < Math.min(nd, dd); i++) { if (ad[i] > df[i]) ld++; else la++; }
      s.armies[from] -= la; s.armies[to] -= ld;
      const q = s.owner[to];
      s.st[p].kills += ld; s.st[p].lost += la;
      if (q >= 0 && q < n) s.st[q].lost += ld;
      E({ k: 'roll', p, q, from, to, ad, dd: df, la, ld, af: s.armies[from], at: s.armies[to] });
      if (s.armies[to] === 0) conquer(p, from, to, nd);
    }
    const canAtk = (p, from, to) => s.phase === 'attack' && validT(from) && validT(to) && s.owner[from] === p && s.owner[to] !== p && s.owner[to] >= 0 && ADJ[from].includes(to) && s.armies[from] >= 2;
    function atk(p, from, to, d) {
      if (!canAtk(p, from, to) || !Number.isInteger(d) || d < 1 || d > 3 || d > s.armies[from] - 1) return false;
      rollOnce(p, from, to, d);
      return true;
    }
    function blitz(p, from, to, stop) {
      if (!canAtk(p, from, to)) return false;
      let guard = 0;
      do { rollOnce(p, from, to, 3); guard++; }
      while (s.phase === 'attack' && s.owner[to] !== p && s.armies[from] >= 2 && guard < 400 && !(stop && stop(s.armies[from], s.armies[to])));
      return true;
    }
    function occ(p, k) {
      if (s.phase !== 'occupy' || !s.occ || !Number.isInteger(k) || k < 0 || k > s.occ.max) return false;
      const { from, to } = s.occ;
      s.armies[from] -= k; s.armies[to] += k; s.occ = null;
      E({ k: 'occ', p, from, to, n: k, af: s.armies[from], at: s.armies[to] });
      afterConq(p);
      return true;
    }
    function endatk(p) {
      if (s.phase !== 'attack') return false;
      if (s.conq) {
        const id = draw();
        if (id >= 0) { s.hands[p].push(id); E({ k: 'draw', p, id }); }
      }
      s.phase = 'fortify';
      E({ k: 'phase', ph: 'fortify' });
      return true;
    }
    const reach = (p, from) => reachOf(s.owner, p, from);
    function fort(p, from, to, k) {
      if (s.phase !== 'fortify' || !validT(from) || !validT(to) || from === to || s.owner[from] !== p || s.owner[to] !== p) return false;
      if (!Number.isInteger(k) || k < 1 || k > s.armies[from] - 1 || !reach(p, from).has(to)) return false;
      s.armies[from] -= k; s.armies[to] += k;
      E({ k: 'fort', p, from, to, n: k, af: s.armies[from], at: s.armies[to] });
      endTurn(p);
      return true;
    }
    function end(p) {
      if (s.phase === 'attack') endatk(p);
      if (s.phase !== 'fortify') return false;
      E({ k: 'skip', p });
      endTurn(p);
      return true;
    }
    function pick(p, t) {
      if (s.phase !== 'cappick' || !validT(t) || s.owner[t] !== p) return false;
      s.caps[p] = t;
      E({ k: 'cap', p, t });
      const nx = (p + 1) % n;
      if (s.caps.every(c => c >= 0)) { E({ k: 'phase', ph: 'play' }); startTurn(s.first); }
      else { s.turn = nx; E({ k: 'turn', p: nx, cap: 1 }); }
      return true;
    }
    function act(p, a, stop) {
      if (!a || s.phase === 'over' || p !== s.turn || !(p >= 0 && p < n)) return false;
      switch (a.t) {
        case 'claim': return claim(p, a.to);
        case 'place': return place(p, a.to, a.k);
        case 'trade': return trade(p, a.c, a.bt);
        case 'atk': return atk(p, a.from, a.to, a.d);
        case 'blitz': return blitz(p, a.from, a.to, stop);
        case 'occ': return occ(p, a.k);
        case 'endatk': return endatk(p);
        case 'fort': return fort(p, a.from, a.to, a.k);
        case 'end': return end(p);
        case 'cap': return pick(p, a.to);
      }
      return false;
    }
    function view(q) {
      return {
        n, mode: s.mode, draft, neutral: NB, owner: s.owner.slice(), armies: s.armies.slice(), phase: s.phase, turn: s.turn, first: s.first, pool: s.pool,
        rem: s.rem.slice(), counts: s.hands.map(h => h.length), hand: q >= 0 && q < n ? s.hands[q].slice() : [], next: tradeVal(s.tradeN), tradeN: s.tradeN,
        must: q >= 0 && must(q), back: s.back, occ: s.occ ? Object.assign({}, s.occ) : null, caps: s.caps.slice(), elim: s.elim.slice(), winner: s.winner,
        conq: s.conq, turnNo: s.turnNo, deck: s.deck.length, st: s.st.map(x => Object.assign({}, x)), chunk
      };
    }
    const filt = (e, q) => {
      if (e.k === 'draw' && e.p !== q) { const x = Object.assign({}, e); delete x.id; return x; }
      if (e.k === 'elim' && e.p !== q) { const x = Object.assign({}, e); delete x.c; return x; }
      return e;
    };
    const drain = () => { const r = ev; ev = []; return r; };
    if (o.state) Object.assign(s, o.state); else begin();
    return { s, act, view, drain, filt, reach, reinf, count, armiesOf, rnd: R, rint, must, NB };
  }
  const BT = { def: [0, 0.6, 0.75], cap: [0, 0.72, 0.8], slope: 0.04, base: 0.8, low: 0.42, spread: 0 };
  function Bot(eng, lvl) {
    const s = eng.s, NB = s.neutral, R = eng.rnd;
    const isRival = (p, t) => { const o = s.owner[t]; return o >= 0 && o !== p && o !== NB; };
    const foes = (p, t) => ADJ[t].filter(x => s.owner[x] !== p);
    const rivals = (p, t) => ADJ[t].filter(x => isRival(p, x));
    const threat = (p, t) => rivals(p, t).reduce((a, x) => a + s.armies[x], 0);
    const cnt = p => eng.count(p);
    const handN = q => s.hands[q] ? s.hands[q].length : 0;

    function contInfo(p) {
      return CONT.map((c, i) => {
        let owned = 0, mine = 0, enemy = 0, borders = 0, owners = new Set();
        c.t.forEach(t => {
          if (s.owner[t] === p) { owned++; mine += s.armies[t]; } else { enemy += s.armies[t]; owners.add(s.owner[t]); }
          if (ADJ[t].some(x => CI[x] !== i)) borders++;
        });
        const solo = owners.size === 1 && !owners.has(NB) ? [...owners][0] : -1;
        return { i, owned, mine, enemy, borders, total: c.t.length, solo, need: c.t.length - owned };
      });
    }
    function focusOf(p, ci) {
      let best = -1, bs = -1e9;
      ci.forEach(c => {
        if (c.need === 0) return;
        const b = CONT[c.i].b;
        const sc = (b + 1.2) * (0.4 + c.owned / c.total) / (c.enemy * 0.1 + c.need * 0.5 + c.borders * 0.4 + 1) + (c.owned === 0 ? -0.4 : 0);
        if (sc > bs) { bs = sc; best = c.i; }
      });
      return best;
    }
    function tval(p, e, ci, focus) {
      const c = ci[CI[e]], b = CONT[c.i].b, o = s.owner[e];
      let v = 1;
      if (c.need === 1 && s.owner[e] !== p) v += b * 1.4 + 2;
      if (c.i === focus) v += 1.2 + (c.owned / c.total) * 2.5;
      if (c.solo === o && o >= 0 && c.owned === 0 && c.need === c.total) v += b * 0.5;
      const holdsAll = o >= 0 && o !== NB && CONT[c.i].t.every(t => s.owner[t] === o);
      if (holdsAll) v += b * 1.2 + 1.5;
      v += 0.9 / (s.armies[e] + 1);
      if (o >= 0 && o !== NB) {
        if (cnt(o) === 1) v += 2.2 + 0.9 * handN(o);
        else if (handN(o) >= 4) v += 0.6;
      }
      if (s.mode === 'cap') {
        if (s.caps.includes(e) && o !== p) v += s.caps.every((cc, q) => cc < 0 || s.owner[cc] === p || cc === e) ? 12 : 5;
      }
      if (o === NB) v *= 0.55;
      if (lvl === 0) v = 1 + R() * 2;
      return v;
    }

    function claimPick(p) {
      const ci = contInfo(p);
      let best = -1, bs = -1e9;
      for (let t = 0; t < 42; t++) {
        if (s.owner[t] !== -1) continue;
        const c = ci[CI[t]], b = CONT[c.i].b;
        let sc = R() * (lvl === 0 ? 6 : lvl === 1 ? 1.2 : 0.5);
        if (lvl > 0) {
          sc += 3 * c.owned / c.total + b / c.total * 3;
          const others = CONT[c.i].t.filter(x => s.owner[x] >= 0 && s.owner[x] !== p && s.owner[x] !== NB);
          if (!others.length) sc += 1.5;
          sc -= others.length * 0.9;
          if (c.owned > 0 && others.length === 0) sc += 2;
          sc += 0.5 * ADJ[t].filter(x => s.owner[x] === p).length;
          sc -= 0.25 * ADJ[t].filter(x => isRival(p, x)).length;
          if (c.borders <= 2) sc += 0.8;
        }
        if (sc > bs) { bs = sc; best = t; }
      }
      return { t: 'claim', to: best };
    }
    function capPick(p) {
      let best = -1, bs = -1e9;
      for (let t = 0; t < 42; t++) {
        if (s.owner[t] !== p) continue;
        let sc = ADJ[t].filter(x => s.owner[x] === p).length * 1.5 - rivals(p, t).length * 2.2 - ADJ[t].filter(x => s.owner[x] === NB).length * 0.4 + s.armies[t] * 0.25 + R() * 0.8;
        if (ADJ[t].length <= 2) sc += 1.5;
        if (CONT[CI[t]].t.every(x => s.owner[x] === p)) sc += 2;
        if (lvl === 0) sc = R();
        if (sc > bs) { bs = sc; best = t; }
      }
      return { t: 'cap', to: best };
    }

    function stageScore(p, t, ci, focus, extra) {
      let bs = 0;
      for (const e of foes(p, t)) {
        const A = s.armies[t] + extra, D = s.armies[e];
        const pc = pConq(A, D);
        const v = tval(p, e, ci, focus) * (0.25 + pc);
        if (v > bs) bs = v;
      }
      return bs;
    }
    function placeAct(p) {
      const mine = []; for (let t = 0; t < 42; t++) if (s.owner[t] === p) mine.push(t);
      const pool = s.pool;
      const border = mine.filter(t => foes(p, t).length);
      const cand = border.length ? border : mine;
      if (lvl === 0) {
        const t = cand[(R() * cand.length) | 0];
        return { t: 'place', to: t, k: Math.max(1, Math.min(pool, 1 + ((R() * pool) | 0))) };
      }
      const ci = contInfo(p), focus = focusOf(p, ci);
      const setup = s.phase === 'setup';
      let defend = null, dn = 0;
      cand.forEach(t => {
        const th = threat(p, t);
        if (!th) return;
        let w = 1;
        if (ci[CI[t]].need === 0) w += 1.2;
        if (s.mode === 'cap' && s.caps[p] === t) w += 2;
        const need = (th * BT.def[lvl] + 1 - s.armies[t]) * w;
        if (need > dn) { dn = need; defend = t; }
      });
      if (defend !== null && dn >= 1 && !setup) {
        return { t: 'place', to: defend, k: Math.max(1, Math.min(pool, Math.ceil(dn / (1 + (ci[CI[defend]].need === 0 ? 1.2 : 0))))) };
      }
      let best = cand[0], bs = -1e9;
      cand.forEach(t => {
        let sc = stageScore(p, t, ci, focus, setup ? pool : pool) + R() * 0.15;
        if (setup) {
          const th = threat(p, t);
          sc += (ci[CI[t]].i === focus ? 1.2 : 0) + th * 0.12 - s.armies[t] * 0.18;
          if (ci[CI[t]].need === 0) sc += 0.8;
          if (s.mode === 'cap' && s.caps[p] === t) sc += 1;
        }
        if (sc > bs) { bs = sc; best = t; }
      });
      let k = pool;
      if (setup) k = Math.min(pool, s.armies[best] > 6 ? 1 : pool);
      return { t: 'place', to: best, k };
    }

    function tradeAct(p) {
      const hand = s.hands[p];
      if (hand.length < 3) return null;
      const forced = eng.must(p);
      if (!forced && lvl === 0) return null;
      const sets = setsOf(hand);
      if (!sets.length) return null;
      let best = null, bs = -1e9;
      sets.forEach(c => {
        const wild = c.filter(i => i >= 42).length;
        const owned = c.filter(i => i < 42 && s.owner[i] === p).length;
        const sc = (owned ? 2 : 0) - wild * 3 + R() * 0.2;
        if (sc > bs) { bs = sc; best = c; }
      });
      const cand = best.filter(i => i < 42 && s.owner[i] === p);
      let bt = cand[0];
      if (cand.length > 1) { let m = -1e9; cand.forEach(t => { const v = threat(p, t) - s.armies[t] + R(); if (v > m) { m = v; bt = t; } }); }
      return { t: 'trade', c: best, bt };
    }

    function attackAct(p) {
      const ci = contInfo(p), focus = focusOf(p, ci);
      let best = null, bs = 0;
      for (let from = 0; from < 42; from++) {
        if (s.owner[from] !== p || s.armies[from] < 2) continue;
        const A = s.armies[from];
        for (const to of ADJ[from]) {
          const o = s.owner[to];
          if (o === p || o < 0) continue;
          const D = s.armies[to], pc = pConq(A, D), v = tval(p, to, ci, focus);
          let need;
          if (lvl === 0) need = 0.5;
          else need = Math.max(BT.low, Math.min(BT.cap[lvl], BT.base - BT.slope * v));
          if (!s.conq && v >= 1 && D <= 2) need -= 0.08;
          if (lvl === 2 && A <= 3 && D >= 2 && v < 5) need += 0.12;
          if (pc < need) continue;
          let sc = pc * v - 0.05 * D + 0.02 * A;
          if (lvl === 2) {
            const exposed = threat(p, from) - (A - 1) * 0.5;
            if (exposed > 0 && ci[CI[from]].need === 0) sc -= 0.4;
          }
          if (sc > bs) { bs = sc; best = { from, to, need, v }; }
        }
      }
      if (!best) return { t: 'endatk' };
      const floor = Math.max(0.22, best.need - 0.35);
      return { t: 'blitz', from: best.from, to: best.to, stop: (a, d) => a < 2 || pConq(a, d) < floor };
    }
    function occAct(p) {
      const { from, to, max } = s.occ;
      const wf = threat(p, from), wt = threat(p, to);
      const tgtFoe = foes(p, to).length, fromFoe = foes(p, from).length;
      let k;
      if (lvl === 0) k = Math.max(0, max - ((R() * max / 2) | 0));
      else if (!fromFoe) k = max;
      else if (!tgtFoe) k = 0;
      else if (lvl === 2 && BT.mom && foes(p, to).some(x => s.owner[x] !== p && pConq(s.armies[to] + max, s.armies[x]) > 0.75 && tval(p, x, contInfo(p), -1) > 2)) k = max;
      else if (wf + wt === 0) k = Math.ceil(max * 0.6);
      else k = Math.round(max * (wt + 0.5) / (wf + wt + 1));
      return { t: 'occ', k: Math.max(0, Math.min(max, k)) };
    }
    function fortAct(p) {
      if (lvl === 0 && R() < 0.5) return { t: 'end' };
      const ci = contInfo(p), focus = focusOf(p, ci);
      let best = null, bs = 0;
      for (let from = 0; from < 42; from++) {
        if (s.owner[from] !== p || s.armies[from] < 2) continue;
        const inner = foes(p, from).length === 0;
        const spare = inner ? s.armies[from] - 1 : s.armies[from] - 1 - Math.ceil(threat(p, from) * 0.7) - 1;
        if (spare < 1) continue;
        for (const to of eng.reach(p, from)) {
          if (!foes(p, to).length) continue;
          const th = threat(p, to);
          let sc = th * 0.8 + 1 - s.armies[to] * 0.5 + stageScore(p, to, ci, focus, spare) * 0.8;
          if (s.mode === 'cap' && s.caps[p] === to) sc += 2;
          if (!inner) sc -= 1.2;
          if (sc > bs) { bs = sc; best = { from, to, k: spare }; }
        }
      }
      if (!best || bs < 1.2) return { t: 'end' };
      return { t: 'fort', from: best.from, to: best.to, k: best.k };
    }

    function think(p) {
      switch (s.phase) {
        case 'claim': return claimPick(p);
        case 'cappick': return capPick(p);
        case 'setup': return placeAct(p);
        case 'reinforce': return tradeAct(p) || placeAct(p);
        case 'attack': return attackAct(p);
        case 'occupy': return occAct(p);
        case 'fortify': return fortAct(p);
      }
      return null;
    }
    return { think };
  }

  const BOT_NAMES = ['Napoleon', 'Cleopatra', 'Genghis', 'Joan', 'Hannibal', 'Boudica', 'Saladin', 'Ada'];
  const COLORS = ['#3b7ddd', '#e0443a', '#43b05c', '#f0c23b', '#9556cf', '#4b505c'];
  const NEUTRAL_COLOR = '#aab0b8';
  const CSS = `
.gm-risk{gap:0;padding:0}
.gm-risk [hidden]{display:none!important}
.gm-risk .rk-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;overflow:clip;box-shadow:0 12px 34px rgba(8,24,44,.35);background:#1b5276;touch-action:none;font-family:var(--sans);color:#eef3ff;user-select:none;-webkit-user-select:none}
.gm-risk .rk-svg{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}
.gm-risk .rk-svg.drag{cursor:grabbing}
.gm-risk .rk-svg .t{stroke-width:2.4;stroke-linejoin:round;transition:fill-opacity .2s}
.gm-risk .rk-svg.act .t{cursor:pointer}
.gm-risk .rk-svg .hl:not(.from):not(.tgt):not(.pick):not(.foc){display:none}
.gm-risk .rk-wrap::after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,rgba(0,12,30,.4) 100%);z-index:1}
.gm-risk .rk-svg .t.dim{fill-opacity:.42}
.gm-risk .rk-svg .sh{fill:rgba(4,20,40,.34);stroke:rgba(4,20,40,.34);stroke-width:5;stroke-linejoin:round;pointer-events:none}
.gm-risk .rk-svg .dc{fill:#cdbf98;stroke:#a39469;stroke-width:1.2;pointer-events:none}
.gm-risk .rk-svg .sea{fill:none;stroke:rgba(255,255,255,.7);stroke-width:1.8;stroke-dasharray:5 4;pointer-events:none}
.gm-risk .rk-svg .hl{fill:none;pointer-events:none;stroke-linejoin:round}
.gm-risk .rk-svg .hl.from{stroke:#fff;stroke-width:4;filter:drop-shadow(0 0 5px rgba(255,255,255,.9))}
.gm-risk .rk-svg .hl.tgt{stroke:#ffd23f;stroke-width:3.4;stroke-dasharray:7 5;animation:rk-dash .8s linear infinite}
.gm-risk .rk-svg .hl.pick{stroke:#7dffb0;stroke-width:3;stroke-dasharray:6 5;animation:rk-dash 1s linear infinite}
.gm-risk .rk-svg .hl.foc{stroke:#fff;stroke-width:3;stroke-opacity:.9}
@keyframes rk-dash{to{stroke-dashoffset:-24}}
.gm-risk .rk-svg .c{cursor:pointer}
.gm-risk .rk-svg .cs{transform-origin:0 0;transform:scale(var(--cs,1))}
.gm-risk .rk-svg .cb{transform-origin:0 0}
.gm-risk .rk-svg .cb.pop{animation:rk-pop .38s cubic-bezier(.2,1.6,.4,1)}
.gm-risk .rk-svg .cb.hit{animation:rk-hit .42s}
@keyframes rk-pop{0%{transform:scale(.5)}60%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes rk-hit{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px) scale(1.15)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
.gm-risk .rk-svg .cc{stroke:#fff;stroke-width:2.2}
.gm-risk .rk-svg .cn{fill:#fff;font:900 13px var(--sans);text-anchor:middle;pointer-events:none}
.gm-risk .rk-svg .cp{fill:#ffd23f;stroke:#7a5200;stroke-width:1;display:none;pointer-events:none}
.gm-risk .rk-svg .c.iscap .cp{display:block}
.gm-risk .rk-svg .c.iscap .cc{stroke:#ffd23f;stroke-width:3}
.gm-risk .rk-svg .lb{fill:#fff;stroke:rgba(5,20,40,.7);stroke-width:3;paint-order:stroke;font:800 9.5px var(--sans);text-anchor:middle;pointer-events:none;letter-spacing:.2px}
.gm-risk .rk-svg.nolbl .l{display:none}
.gm-risk .rk-svg .fl{font:900 15px var(--sans);text-anchor:middle;paint-order:stroke;stroke:rgba(0,0,0,.65);stroke-width:3.5;animation:rk-fl 1.1s ease-out forwards;pointer-events:none}
@keyframes rk-fl{0%{opacity:0;transform:translateY(0)}15%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}
.gm-risk .rk-svg .ar{fill:none;stroke-width:5;stroke-linecap:round;stroke-dasharray:10 8;animation:rk-dash .5s linear infinite;pointer-events:none;opacity:.95}
.gm-risk .rk-svg .flag{pointer-events:none;transform-origin:0 0;animation:rk-flag .9s ease-out forwards}
@keyframes rk-flag{0%{transform:scale(.2);opacity:1}60%{opacity:1}100%{transform:scale(3.2);opacity:0}}
.gm-risk .rk-glass{background:rgba(10,20,38,.82);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14);box-shadow:0 8px 22px rgba(0,0,0,.35)}
.gm-risk .rk-top{position:absolute;left:10px;top:10px;display:flex;gap:8px;align-items:center;pointer-events:none;z-index:3}
.gm-risk .rk-top>*{pointer-events:auto}
.gm-risk .rk-ico{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;padding:0;color:#fff;cursor:pointer;font:inherit;border:1px solid rgba(255,255,255,.18);background:rgba(10,20,38,.82)}
.gm-risk .rk-ico:hover{background:rgba(40,60,100,.9)}
.gm-risk .rk-steps{display:flex;border-radius:14px;overflow:hidden;height:44px}
.gm-risk .rk-steps span{display:flex;align-items:center;padding:0 14px;font:800 12px var(--sans);letter-spacing:.4px;color:rgba(255,255,255,.55);white-space:nowrap}
.gm-risk .rk-steps span.on{background:#ffd23f;color:#1b1a10}
.gm-risk .rk-steps span b{margin-right:6px;opacity:.8}
.gm-risk .rk-turn{font:800 12px var(--sans);padding:0 12px;height:44px;display:flex;align-items:center;border-radius:14px;white-space:nowrap}
.gm-risk .rk-conts{position:absolute;left:10px;bottom:84px;display:flex;flex-direction:column;gap:5px;z-index:3}
.gm-risk .rk-conts button{width:38px;height:30px;border-radius:9px;padding:0;font:900 11px var(--sans);color:#fff;border:2px solid;cursor:pointer;background:rgba(10,20,38,.82);touch-action:manipulation}
.gm-risk .rk-conts button.z{border-color:rgba(255,255,255,.3);font-size:16px}
.gm-risk .rk-conts button:hover{filter:brightness(1.35)}
.gm-risk .rk-conts button.nm.off{opacity:.5}
.gm-risk .rk-side{position:absolute;right:10px;top:10px;bottom:84px;width:212px;display:flex;flex-direction:column;gap:8px;z-index:4;pointer-events:none}
.gm-risk .rk-side>*{pointer-events:auto;border-radius:14px}
.gm-risk .rk-pl{padding:6px;display:flex;flex-direction:column;gap:3px;flex:0 0 auto}
.gm-risk .rk-p{display:flex;align-items:center;gap:8px;padding:5px 7px;border-radius:10px;border:2px solid transparent;cursor:pointer}
.gm-risk .rk-p.on{background:rgba(255,255,255,.12);border-color:var(--pc,#fff)}
.gm-risk .rk-p.out{opacity:.4}
.gm-risk .rk-p .av{width:28px;height:28px;border-radius:50%;flex:none;display:grid;place-items:center;font:900 13px var(--sans);color:#fff;border:2px solid #fff;font-style:normal}
.gm-risk .rk-p .nm{flex:1;min-width:0}
.gm-risk .rk-p .nm b{display:block;font:800 13px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-risk .rk-p .nm span{display:block;font:700 11px var(--sans);color:rgba(255,255,255,.7)}
.gm-risk .rk-p .cd{font:900 12px var(--sans);display:flex;align-items:center;gap:3px;padding:2px 6px;border-radius:8px;background:rgba(255,255,255,.12)}
.gm-risk .rk-log{flex:1;min-height:0;overflow-y:auto;padding:8px 10px;font:600 12px/1.38 var(--sans);color:rgba(255,255,255,.86);scrollbar-width:thin}
.gm-risk .rk-log p{margin:0 0 4px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.07)}
.gm-risk .rk-log p.turn{color:#ffd23f;font-weight:800;margin-top:6px}
.gm-risk .rk-log p b{font-weight:800}
.gm-risk .rk-chips{position:absolute;left:58px;right:8px;top:8px;display:none;gap:5px;overflow-x:auto;z-index:3;scrollbar-width:none;height:46px}
.gm-risk .rk-chip{flex:none;display:flex;align-items:center;gap:5px;padding:0 8px;border-radius:12px;border:2px solid transparent;font:800 11px var(--sans);height:42px}
.gm-risk .rk-chip.on{border-color:var(--pc,#fff);background:rgba(255,255,255,.14)}
.gm-risk .rk-chip.out{opacity:.4}
.gm-risk .rk-chip i{width:16px;height:16px;border-radius:50%;border:2px solid #fff;flex:none}
.gm-risk .rk-chip div{display:flex;flex-direction:column;line-height:1.15}
.gm-risk .rk-chip div b{font-size:11px;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-risk .rk-chip div span{font-size:10px;color:rgba(255,255,255,.72);font-weight:700}
.gm-risk .rk-dock{position:absolute;left:10px;bottom:10px;right:232px;display:flex;flex-direction:column;gap:6px;align-items:center;z-index:5;pointer-events:none}
.gm-risk .rk-dock>*{pointer-events:auto}
.gm-risk .rk-msg{padding:8px 14px;border-radius:14px;font:800 14px/1.3 var(--sans);text-align:center;max-width:100%}
.gm-risk .rk-msg small{display:block;font:700 11.5px var(--sans);color:rgba(255,255,255,.7);margin-top:2px}
.gm-risk .rk-msg i{display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid #fff;vertical-align:-1px;margin-right:6px}
.gm-risk .rk-act{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;align-items:center}
.gm-risk .rk-b{min-height:44px;min-width:44px;padding:0 16px;border-radius:14px;border:2px solid rgba(255,255,255,.22);background:rgba(28,44,80,.94);color:#fff;font:900 14px var(--sans);cursor:pointer;touch-action:manipulation;position:relative;white-space:nowrap}
.gm-risk .rk-b:hover:not(:disabled){background:rgba(52,78,130,.96)}
.gm-risk .rk-b:disabled{opacity:.4;cursor:default}
.gm-risk .rk-b.pri{background:linear-gradient(#ffd84a,#e8a800);color:#1d1600;border-color:#fff;box-shadow:0 3px 0 #8a6200}
.gm-risk .rk-b.pri:hover:not(:disabled){background:linear-gradient(#ffe277,#f2b414)}
.gm-risk .rk-b.red{background:linear-gradient(#ff6a5a,#c8281b);border-color:#fff;box-shadow:0 3px 0 #6e130b}
.gm-risk .rk-b.grn{background:linear-gradient(#52d27a,#238a47);border-color:#fff;box-shadow:0 3px 0 #0f4a24}
.gm-risk .rk-b .bd{position:absolute;right:-6px;top:-7px;min-width:20px;height:20px;border-radius:10px;background:#e0443a;color:#fff;font:900 11px/20px var(--sans);padding:0 5px;border:2px solid #fff;box-sizing:content-box}
.gm-risk .rk-b .bd.g{background:#43b05c}
.gm-risk .rk-seg{display:inline-flex;border-radius:14px;overflow:hidden;border:2px solid rgba(255,255,255,.22)}
.gm-risk .rk-seg button{min-height:40px;min-width:46px;padding:0 10px;border:0;background:rgba(28,44,80,.94);color:rgba(255,255,255,.75);font:900 13px var(--sans);cursor:pointer;touch-action:manipulation}
.gm-risk .rk-seg button.on{background:#ffd23f;color:#1b1a10}
.gm-risk .rk-seg.big button{min-height:44px;padding:0 14px}
.gm-risk .rk-sl{display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:14px;flex-wrap:wrap;justify-content:center}
.gm-risk .rk-sl input[type=range]{width:min(240px,48vw);accent-color:#ffd23f;height:28px}
.gm-risk .rk-sl .v{font:900 15px var(--sans);min-width:140px;text-align:center}
.gm-risk .rk-battle{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:6;display:flex;align-items:stretch;gap:10px;padding:8px 12px;border-radius:16px;pointer-events:none;transition:opacity .25s}
.gm-risk .rk-battle.top2{top:62px}
.gm-risk .rk-battle .col{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:96px}
.gm-risk .rk-battle .hd{font:800 12px var(--sans);display:flex;align-items:center;gap:5px;white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis}
.gm-risk .rk-battle .hd i{width:11px;height:11px;border-radius:50%;border:2px solid #fff;flex:none}
.gm-risk .rk-battle .hd u{text-decoration:none;color:#ffd23f}
.gm-risk .rk-battle .dice{display:flex;gap:6px;min-height:38px}
.gm-risk .rk-battle .vs{align-self:center;font:900 13px var(--sans);color:rgba(255,255,255,.6)}
.gm-risk .rk-battle .res{position:absolute;left:0;right:0;bottom:-24px;text-align:center;font:900 13px var(--sans);text-shadow:0 2px 4px rgba(0,0,0,.7);white-space:nowrap}
.gm-risk .rk-die{width:38px;height:38px;border-radius:9px;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.22),0 3px 6px rgba(0,0,0,.4);position:relative}
.gm-risk .rk-die.r{background:linear-gradient(#ff5b4b,#c42418);--pp:#fff}
.gm-risk .rk-die.w{background:linear-gradient(#fff,#d9dde6);--pp:#1b2030}
.gm-risk .rk-die b{width:7px;height:7px;border-radius:50%;background:var(--pp);align-self:center;justify-self:center;opacity:0}
.gm-risk .rk-die b.on{opacity:1}
.gm-risk .rk-die.roll{animation:rk-tumble .22s linear infinite}
.gm-risk .rk-die.win{outline:3px solid #5be27a;outline-offset:1px}
.gm-risk .rk-die.lose{opacity:.45;filter:grayscale(.6)}
.gm-risk .rk-die.settle{animation:rk-settle .35s cubic-bezier(.2,1.6,.4,1)}
@keyframes rk-tumble{0%{transform:rotate(-14deg) translateY(-3px)}50%{transform:rotate(12deg) translateY(2px) scale(1.06)}100%{transform:rotate(-14deg) translateY(-3px)}}
@keyframes rk-settle{0%{transform:scale(1.5) rotate(20deg)}100%{transform:none}}
.gm-risk .rk-banner{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);z-index:7;pointer-events:none;padding:12px 30px;border-radius:18px;font:900 26px var(--sans);color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.4);border:3px solid #fff;animation:rk-ban 1.4s ease-out forwards;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.gm-risk .rk-banner small{display:block;font:800 13px var(--sans);text-align:center;opacity:.9;margin-top:2px}
@keyframes rk-ban{0%{opacity:0;transform:translate(-50%,-30%) scale(.7)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}20%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%) scale(1)}}
.gm-risk .rk-pane{position:absolute;inset:0;z-index:9;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(5,14,30,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);overflow:auto;touch-action:pan-y}
.gm-risk .rk-pane.solid{background:radial-gradient(circle at 50% 30%,rgba(24,70,110,.94),rgba(8,22,44,.97))}
.gm-risk .rk-box{width:100%;max-width:440px;margin:auto;background:linear-gradient(#22345a,#121c36);border:2px solid rgba(255,255,255,.16);border-radius:20px;padding:16px;text-align:center;box-shadow:0 18px 44px rgba(0,0,0,.5);animation:rk-in .3s cubic-bezier(.2,1.4,.4,1)}
.gm-risk .rk-box.wide{max-width:620px}
@keyframes rk-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-risk .rk-box h3{margin:2px 0 8px;font:900 22px var(--sans)}
.gm-risk .rk-box p{margin:6px 0;font:700 13.5px/1.42 var(--sans);color:rgba(255,255,255,.85)}
.gm-risk .rk-kick{font:900 11px var(--sans)!important;letter-spacing:1.5px;text-transform:uppercase;color:#ffd23f!important;margin:0 0 2px!important}
.gm-risk .rk-logo{font:900 64px/1 var(--sans);font-style:italic;letter-spacing:2px;color:#ffe27a;text-shadow:0 3px 0 #a31d12,0 6px 0 #6c0f08,0 12px 20px rgba(0,0,0,.45);margin:4px 0 0}
.gm-risk .rk-tag{font:800 13px var(--sans);color:rgba(255,255,255,.8);margin:2px 0 12px}
.gm-risk .rk-opt{display:flex;align-items:center;gap:10px;margin:8px 0;text-align:left;justify-content:space-between}
.gm-risk .rk-opt>span{font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.88);flex:0 0 32%}
.gm-risk .rk-opt>span small{display:block;font:700 10.5px var(--sans);color:rgba(255,255,255,.5);margin-top:2px}
.gm-risk .rk-opt .rk-seg{flex:1}
.gm-risk .rk-opt .rk-seg button{flex:1}
.gm-risk .rk-big{display:block;width:100%;min-height:52px;margin:8px 0;border:0;border-radius:16px;color:#fff;font:900 19px var(--sans);cursor:pointer;touch-action:manipulation;box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);text-shadow:0 2px 0 rgba(0,0,0,.25)}
.gm-risk .rk-big.a{background:linear-gradient(#ff6a5a,#c8281b)}
.gm-risk .rk-big.b{background:linear-gradient(#3d8cf0,#1659b5)}
.gm-risk .rk-big.c{background:linear-gradient(#52d27a,#238a47)}
.gm-risk .rk-big.d{background:linear-gradient(#475472,#2b3550)}
.gm-risk .rk-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gm-risk .rk-rules{text-align:left}
.gm-risk .rk-rules p{margin:0 0 7px;font:600 13px/1.45 var(--sans)}
.gm-risk .rk-rules b{color:#ffd23f}
.gm-risk .rk-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 13px var(--sans)}
.gm-risk .rk-tbl td,.gm-risk .rk-tbl th{padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.gm-risk .rk-tbl th{font-size:10.5px;color:rgba(255,255,255,.55);text-transform:uppercase}
.gm-risk .rk-tbl td:first-child,.gm-risk .rk-tbl th:first-child{text-align:left}
.gm-risk .rk-tbl tr.win td{color:#ffd23f}
.gm-risk .rk-tbl i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:2px solid #fff}
.gm-risk .rk-hand{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:10px 0}
.gm-risk .rk-card{width:74px;height:106px;border-radius:9px;background:linear-gradient(#f6efd9,#e3d6b0);color:#2b2414;border:2px solid #5b4a22;display:flex;flex-direction:column;align-items:center;padding:3px;cursor:pointer;position:relative;box-sizing:border-box;touch-action:manipulation;transition:transform .15s}
.gm-risk .rk-card.sel{transform:translateY(-8px);border-color:#ffd23f;box-shadow:0 0 0 3px #ffd23f,0 8px 12px rgba(0,0,0,.4)}
.gm-risk .rk-card .band{height:7px;align-self:stretch;border-radius:3px;flex:none}
.gm-risk .rk-card svg{display:block}
.gm-risk .rk-card .sy{width:26px;height:26px;color:#2b2414}
.gm-risk .rk-card .nm{font:900 9.5px/1.1 var(--sans);text-align:center;margin-top:auto;height:22px;display:flex;align-items:center}
.gm-risk .rk-card .ow{position:absolute;right:2px;top:10px;font:900 9px var(--sans);background:#43b05c;color:#fff;border-radius:6px;padding:0 4px}
.gm-risk .rk-card.wild{background:linear-gradient(#2c2f4a,#13162b);color:#ffd23f;border-color:#ffd23f}
.gm-risk .rk-card.wild .sy{color:#ffd23f}
.gm-risk .rk-card.wild .nm{color:#ffd23f}
.gm-risk .rk-bt{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0}
.gm-risk .rk-bt button{min-height:36px;padding:0 10px;border-radius:10px;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font:800 12px var(--sans);cursor:pointer}
.gm-risk .rk-bt button.on{background:#43b05c;border-color:#fff}
.gm-risk .rk-net{position:absolute;right:230px;top:10px;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;font:800 11px var(--sans);z-index:3}
.gm-risk .rk-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-risk .rk-net.bad i{background:#ff5b4b}
.gm-risk .rk-wrap.port .rk-top{left:8px;top:8px}
.gm-risk .rk-wrap.port .rk-steps,.gm-risk .rk-wrap.port .rk-turn{display:none}
.gm-risk .rk-wrap.port .rk-chips{display:flex;left:154px}
.gm-risk .rk-wrap.port .rk-conts{flex-direction:row;left:8px;right:8px;top:54px;bottom:auto;overflow-x:auto;scrollbar-width:none}
.gm-risk .rk-wrap.port .rk-conts button{flex:none}
.gm-risk .rk-wrap.port .rk-side{top:56px;bottom:112px;right:6px;width:min(78%,300px);transform:translateX(110%);transition:transform .25s;z-index:8}
.gm-risk .rk-wrap.port .rk-side.open{transform:none}
.gm-risk .rk-wrap.port .rk-dock{left:6px;right:6px;bottom:6px}
.gm-risk .rk-wrap.port .rk-net{right:8px;top:auto;bottom:112px}
.gm-risk .rk-wrap.port .rk-battle{top:86px;gap:6px;padding:6px 8px}
.gm-risk .rk-wrap.port .rk-battle .col{min-width:76px}
.gm-risk .rk-wrap.port .rk-die{width:30px;height:30px;padding:4px}
.gm-risk .rk-wrap.port .rk-die b{width:5.5px;height:5.5px}
.gm-risk .rk-wrap.port .rk-msg{font-size:12.5px;padding:6px 10px}
.gm-risk .rk-wrap.port .rk-b{min-height:42px;padding:0 11px;font-size:13px}
.gm-risk .rk-wrap.port .rk-banner{font-size:20px;padding:9px 18px}
.gm-risk .rk-wrap.port .rk-logo{font-size:52px}
.gm-risk .rk-ico{position:relative}
.gm-risk .rk-ico svg{width:24px;height:24px}
.gm-risk .rk-ico .bd{position:absolute;right:-5px;top:-6px;min-width:18px;height:18px;border-radius:9px;background:#e0443a;color:#fff;font:900 11px/18px var(--sans);padding:0 4px;border:2px solid #fff;box-sizing:content-box;text-align:center}
.gm-risk .rk-ico.hot{animation:rk-hot .6s infinite alternate;border-color:#ffd23f}
@keyframes rk-hot{from{box-shadow:0 0 0 0 rgba(255,210,63,.8)}to{box-shadow:0 0 0 7px rgba(255,210,63,0)}}
.gm-risk .rk-b.hot{animation:rk-hot .6s infinite alternate}
.gm-risk .rk-svg.act .t:hover{filter:brightness(1.14)}
.gm-risk .rk-svg .co{fill:none;stroke-linecap:round;stroke-linejoin:round;pointer-events:none;opacity:.95}
.gm-risk .rk-svg .gr{stroke:rgba(255,255,255,.06);stroke-width:1;fill:none;pointer-events:none}
.gm-risk .rk-svg .bs{pointer-events:none}
.gm-risk .rk-svg .cn.lt{fill:#2a2208}
.gm-risk .rk-svg .cc{stroke-linejoin:round}
.gm-risk .rk-svg .c{transition:opacity .2s}
.gm-risk .rk-svg .c.off{opacity:.55}
.gm-risk .rk-svg .l{pointer-events:none}
.gm-risk .rk-tip{position:absolute;z-index:6;pointer-events:none;padding:6px 10px;border-radius:10px;font:800 12px/1.3 var(--sans);white-space:nowrap;transform:translate(12px,12px)}
.gm-risk .rk-tip small{display:block;font:700 11px var(--sans);color:rgba(255,255,255,.72)}
.gm-risk .rk-tip i{display:inline-block;width:10px;height:10px;border-radius:50%;border:2px solid #fff;margin-right:6px;vertical-align:-1px}
.gm-risk .rk-bn{text-align:center;color:#fff}
.gm-risk .rk-wrap.sm .rk-side{width:176px;bottom:70px}
.gm-risk .rk-wrap.sm .rk-log{display:none}
.gm-risk .rk-wrap.sm .rk-dock{right:196px;bottom:6px}
.gm-risk .rk-wrap.sm .rk-msg{font-size:12.5px;padding:5px 10px}
.gm-risk .rk-wrap.sm .rk-b{min-height:38px}
.gm-risk .rk-wrap.sm .rk-conts{bottom:62px}
.gm-risk .rk-wrap.sm .rk-net{right:196px}
.gm-risk .rk-wrap.sm .rk-steps span{padding:0 9px}
.gm-risk .rk-wrap.sm .rk-ico{width:38px;height:38px}
.gm-risk .rk-wrap.sm .rk-steps,.gm-risk .rk-wrap.sm .rk-turn{height:38px}
.gm-risk .rk-wrap.sm .rk-pl{padding:4px}
.gm-risk .rk-wrap.sm .rk-p{padding:3px 5px}
.gm-risk .rk-wrap.sm .rk-p .av{width:22px;height:22px;font-size:11px}
.gm-risk .rk-lbl{font:800 12px var(--sans);color:rgba(255,255,255,.7);padding:2px 4px}
.gm-risk .rk-fine{font:700 11px var(--sans);color:rgba(255,255,255,.5);margin-top:6px}
.gm-risk .rk-hint{display:flex;gap:6px;align-items:center;justify-content:center;font:700 12px var(--sans);color:rgba(255,255,255,.75)}
.gm-risk .rk-wrap.port .rk-top .rk-logbtn{display:grid}
.gm-risk .rk-logbtn{display:none}
.gm-risk .rk-wrap.port .rk-pl{max-height:55%;overflow:auto}
.gm-risk .rk-wrap.port .rk-p .nm span{font-size:10.5px}
.gm-risk .rk-wrap.port .rk-tip{display:none}
.gm-risk .rk-wrap.port .rk-box{padding:12px}
.gm-risk .rk-wrap.port .rk-big{font-size:17px;min-height:48px}
.gm-risk .rk-wrap.port .rk-hand{gap:6px}
.gm-risk .rk-wrap.port .rk-card{width:64px;height:92px}
.gm-risk .rk-wrap.port .rk-opt>span{flex:0 0 28%;font-size:12px}
`;
  const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => {
    const x = hexRgb(a), y = hexRgb(b);
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PARCH = '#e6dcc0';

  const SYM_SVG = [
    '<svg class="sy" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5.2" r="3.4"/><path d="M6.5 22v-7.5c0-3.2 2.4-5.2 5.5-5.2s5.5 2 5.5 5.2V22z"/><path d="M3.5 15.5 20 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>',
    '<svg class="sy" viewBox="0 0 24 24" fill="currentColor"><path d="M5 22h14v-2.4c0-2.2-1-3.6-2.4-4.8 2.2-1.2 3.4-3.4 3.4-5.8C20 5.4 16.6 2 12.4 2l-1-1.8-2 2.4C6.8 5 5.6 8 5.6 11.4l3.6 1.2c1-1.2 2.2-1.6 3.4-1.6-2.4 2.2-5 4.6-5.2 8.8z"/><circle cx="14.2" cy="6.8" r="1.1" fill="#f3ecd4"/></svg>',
    '<svg class="sy" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="17" r="5"/><circle cx="8" cy="17" r="1.6" fill="#f3ecd4"/><rect x="8.5" y="7" width="14" height="5" rx="1.6" transform="rotate(-24 8.5 12)"/><circle cx="21.5" cy="4.5" r="1.7"/></svg>',
    '<svg class="sy" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 8.7l7.1-.6z"/></svg>'
  ];
  const terrShape = (t, w, h) => {
    const rs = RINGS[t];
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    rs.forEach(r => { for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]); } });
    const k = Math.min(w / (x1 - x0), h / (y1 - y0));
    const ox = (w - (x1 - x0) * k) / 2 - x0 * k, oy = (h - (y1 - y0) * k) / 2 - y0 * k;
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${PATHS[t]}" transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)}) scale(${k.toFixed(3)})" fill="${CONT[CI[t]].c}" stroke="#2b2414" stroke-width="${(1.4 / k).toFixed(2)}" stroke-linejoin="round"/></svg>`;
  };
  const cardHtml = (id, own, sel, extra) => {
    if (id >= 42) return `<div class="rk-card wild${sel ? ' sel' : ''}" data-c="${id}"><div class="band" style="background:#ffd23f"></div>${SYM_SVG[3]}<div class="nm">WILD</div></div>`;
    return `<div class="rk-card${sel ? ' sel' : ''}" data-c="${id}"><div class="band" style="background:${CONT[CI[id]].c}"></div>${terrShape(id, 56, 38)}${SYM_SVG[sym(id)]}<div class="nm">${esc(SHORT[id])}</div>${own ? '<span class="ow">+2</span>' : ''}</div>`;
  };

  const ICO = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="11" height="15" rx="2" transform="rotate(-10 8 13)" opacity=".6"/><rect x="9" y="3.5" width="11" height="15" rx="2" transform="rotate(8 14 11)"/></svg>',
    log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12.5h5"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    die: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="4"/><g fill="#101a30"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="8" cy="16" r="1.7"/><circle cx="16" cy="16" r="1.7"/></g></svg>'
  };
  const PIPS = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
  const dieHtml = (v, cls) => `<div class="rk-die ${cls}">${Array.from({ length: 9 }, (_, i) => `<b${v && PIPS[v - 1].includes(i) ? ' class="on"' : ''}></b>`).join('')}</div>`;
  const setDie = (el, v) => { el.querySelectorAll('b').forEach((b, i) => b.classList.toggle('on', PIPS[v - 1].includes(i))); };
  const isLight = c => { const [r, g, b] = hexRgb(c); return r * .299 + g * .587 + b * .114 > 150; };
  const MAPB = { x: -10, y: -6, w: 1040, h: 640 };
  const MODES = { dom: 'World Domination', cap: 'Capitals' };
  const DIFFS = ['Easy', 'Normal', 'Hard'];
  const PHASE_LBL = { claim: 'claims territories', cappick: 'chooses a capital', setup: 'places armies', reinforce: 'reinforces', attack: 'attacks', occupy: 'attacks', fortify: 'fortifies' };

  Ameplay.register({
    id: 'risk',
    title: 'Risk',
    category: 'Board',
    tint: '#2f78b5',
    blurb: 'Raise armies, roll the dice and conquer the world. Classic map, cards, Capitals mode, smart bots and online play for up to 6.',
    help: 'Tap a territory to act · drag to pan · pinch or wheel to zoom · <kbd>R</kbd> roll · <kbd>B</kbd> blitz · <kbd>C</kbd> cards · <kbd>E</kbd> end phase · <kbd>F</kbd> fit map',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 1100,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="32" r="21"/><path d="M13 24c5 2 9-1 13 2s1 8 6 10 4 7 3 12M32 11c-1 5 3 7 7 6s7 3 9 7M18 40c3-1 5 1 6 4"/><rect x="40" y="40" width="19" height="19" rx="4.5" fill="var(--bg, #fff)"/><circle cx="46" cy="46" r="1.6" fill="currentColor"/><circle cx="53" cy="46" r="1.6" fill="currentColor"/><circle cx="49.5" cy="49.5" r="1.6" fill="currentColor"/><circle cx="46" cy="53" r="1.6" fill="currentColor"/><circle cx="53" cy="53" r="1.6" fill="currentColor"/></svg>',
    _t: { Engine, Bot, pConq, validSet, setsOf, tradeVal, ADJ, CONT, RINGS, NAMES, isLand, WRAP, SEA, START },
    css: CSS,
    mount(root, api) {
      const SV = api.load() || {};
      const opt = Object.assign({ n: 4, mode: 'dom', claim: 'rand', diff: 1, speed: 0, color: 0 }, SV.opt || {});
      let wins = +SV.wins || 0;
      const saveAll = () => api.save({ opt, wins });
      api.label('Wins'); api.score(wins);

      const M = { mode: 'solo', role: 'local', eng: null, me: 0, n: 0, names: [], cols: [], cpu: [], human: [], lvl: [], pids: [], bots: [], players: [], size: 0, withBots: false, hooked: false, tok: 0, V: null, over: false, fail: 0, botWait: 0, awaiting: false, ended: false, setup: null, neutralId: -9 };
      const D = { owner: Array(42).fill(-1), armies: Array(42).fill(0), phase: 'init', turn: -1, pool: 0, caps: [] };
      const UI = { from: -1, to: -1, qty: 1, dice: 3, occ: 0, mv: 1, side: false, sel: [], bt: -1, lastKey: '' };
      let Q = [], T = [], wait = 0, FF = false, scene = 'title', wasBusy = false, WW = 0, HH = 0, PORT = null, SM = false, battleT = 0, paneK = '', paneFn = null, lastLog = null, camAuto = true;
      const cam = { x: 0, y: 0, s: 1 }, camT = { x: 0, y: 0, s: 1 };

      root.innerHTML = `<div class="rk-wrap"><svg class="rk-svg" xmlns="http://www.w3.org/2000/svg"></svg>
<div class="rk-top"><button class="rk-ico" data-a="menu" aria-label="Menu" title="Menu">${ICO.menu}</button><button class="rk-ico" data-a="cards" aria-label="Cards" title="Cards (C)">${ICO.cards}<span class="bd" hidden>0</span></button><button class="rk-ico rk-logbtn" data-a="side" aria-label="Players and log" title="Players and log">${ICO.log}</button><div class="rk-steps rk-glass"><span data-s="reinforce"><b>1</b>Reinforce</span><span data-s="attack"><b>2</b>Attack</span><span data-s="fortify"><b>3</b>Fortify</span></div><div class="rk-turn rk-glass"></div></div>
<div class="rk-chips"></div><div class="rk-conts"></div>
<div class="rk-side"><div class="rk-pl rk-glass"></div><div class="rk-log rk-glass"></div></div>
<div class="rk-net rk-glass" hidden><i></i><span></span></div><div class="rk-tip rk-glass" hidden></div>
<div class="rk-battle rk-glass" hidden></div><div class="rk-banner" hidden></div><div class="rk-dock"></div><div class="rk-pane" hidden></div></div>`;
      const $ = s => root.querySelector(s);
      const wrap = $('.rk-wrap'), svg = $('.rk-svg'), elPl = $('.rk-pl'), elLog = $('.rk-log'), elChips = $('.rk-chips'), elConts = $('.rk-conts'), elSide = $('.rk-side'), elTurn = $('.rk-turn'), elSteps = $('.rk-steps'),
        elBadge = $('.rk-top .bd'), elCards = $('[data-a="cards"]'), elNet = $('.rk-net'), elTip = $('.rk-tip'), elBattle = $('.rk-battle'), elBan = $('.rk-banner'), elDock = $('.rk-dock'), pane = $('.rk-pane');

      const NS = 'http://www.w3.org/2000/svg';
      const sv = (tag, at, par) => { const e = document.createElementNS(NS, tag); if (at) for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
      const ownCol = o => o >= 0 && o < M.n ? M.cols[o] : o === M.neutralId && o >= 0 ? NEUTRAL_COLOR : '#d9cfae';
      const gradId = o => 'rk-g' + (o < 0 ? 'x' : o >= M.n ? 'n' : o);
      const nameOf = p => p >= 0 && p < M.n ? M.names[p] : p === M.neutralId && p >= 0 ? 'Neutral' : '';
      const txtCol = c => mix(c, '#ffffff', .38);
      const nameH = p => p >= 0 ? `<b style="color:${txtCol(ownCol(p))}">${esc(nameOf(p))}</b>` : '';
      const speedF = () => FF ? .22 : opt.speed ? .55 : 1;

      const defs = sv('defs', null, svg);
      const G = sv('g', null, svg);
      const gGrid = sv('g', null, G), gShadow = sv('g', { transform: 'translate(3 5)' }, G), gDecor = sv('g', null, G), gSea = sv('g', null, G), gBase = sv('g', null, G), gT = sv('g', null, G), gCo = sv('g', null, G), gHl = sv('g', null, G), gC = sv('g', null, G), gL = sv('g', null, G), gFx = sv('g', { class: 'bs' }, G);
      const PT = [], PH = [], PC = [], PN = [], PB = [], PCP = [], PL = [], PCB = [];

      for (let x = -400; x <= 1400; x += 130) sv('path', { class: 'gr', d: `M${x} -300V1000` }, gGrid);
      for (let y = -200; y <= 900; y += 110) sv('path', { class: 'gr', d: `M-500 ${y}H1500` }, gGrid);
      RINGS.forEach((_, t) => { sv('path', { class: 'sh', d: PATHS[t] }, gShadow); });
      DECOR.forEach(d => { let p = ''; for (let i = 0; i < d.length; i += 2) p += (i ? 'L' : 'M') + d[i] + ' ' + d[i + 1]; sv('path', { class: 'dc', d: p + 'Z' }, gDecor); });
      SEA.forEach(([a, b, x1, y1, x2, y2]) => { sv('path', { class: 'sea', d: `M${x1} ${y1}L${x2} ${y2}` }, gSea); });
      sv('path', { class: 'sea', d: 'M30 96L2 80M996 78L1018 68' }, gSea);
      sv('path', { class: 'sea', d: 'M10 74l-9 6 10 2M1010 70l9-3-8-5', style: 'stroke-dasharray:none' }, gSea);
      RINGS.forEach((_, t) => { sv('path', { d: PATHS[t], fill: PARCH, stroke: 'none' }, gBase); });
      RINGS.forEach((_, t) => {
        const p = sv('path', { class: 't', d: PATHS[t], 'data-t': t, stroke: 'rgba(22,15,4,.8)', 'stroke-linejoin': 'round' }, gT);
        PT[t] = p;
      });
      CONT.forEach((c, ci) => {
        let d = '';
        c.t.forEach(t => {
          RINGS[t].forEach(r => {
            for (let i = 0; i < r.length; i += 2) {
              const j = (i + 2) % r.length, k = edgeKey(r[i], r[i + 1], r[j], r[j + 1]);
              if (c.t.some(u => u !== t && EDGES[u].has(k))) continue;
              d += `M${r[i]} ${r[i + 1]}L${r[j]} ${r[j + 1]}`;
            }
          });
        });
        sv('path', { class: 'co', d, stroke: c.c, 'stroke-width': 3.4 }, gCo);
      });
      RINGS.forEach((_, t) => { PH[t] = sv('path', { class: 'hl', d: PATHS[t] }, gHl); });
      RINGS.forEach((_, t) => {
        const [ax, ay] = ANCH[t];
        const g = sv('g', { class: 'c', 'data-t': t, transform: `translate(${ax.toFixed(1)} ${ay.toFixed(1)})` }, gC);
        const cs = sv('g', { class: 'cs' }, g), cb = sv('g', { class: 'cb' }, cs);
        PC[t] = sv('circle', { class: 'cc', r: 11, 'data-t': t }, cb);
        PN[t] = sv('text', { class: 'cn', y: 4.6, 'data-t': t }, cb);
        PCP[t] = sv('path', { class: 'cp', d: 'M0-17l2.2 4.4 4.8.7-3.5 3.4.8 4.8L0-6l-4.3 2.3.8-4.8-3.5-3.4 4.8-.7z' }, cb);
        PB[t] = g; PCB[t] = cb;
        const l = sv('g', { class: 'l', transform: `translate(${ax.toFixed(1)} ${ay.toFixed(1)})` }, gL);
        const ls = sv('g', { class: 'cs' }, l);
        const tx = sv('text', { class: 'lb', y: 23 }, ls);
        tx.textContent = SHORT[t];
        PL[t] = l;
      });

      const setGrads = () => {
        defs.innerHTML = '';
        const mk = (id, c) => {
          const g = sv('linearGradient', { id, x1: 0, y1: 0, x2: 0.35, y2: 1 }, defs);
          sv('stop', { offset: 0, 'stop-color': mix(c, '#ffffff', .2) }, g);
          sv('stop', { offset: .55, 'stop-color': c }, g);
          sv('stop', { offset: 1, 'stop-color': mix(c, '#000000', .24) }, g);
        };
        for (let o = 0; o < M.n; o++) mk(gradId(o), M.cols[o]);
        mk(gradId(M.n), NEUTRAL_COLOR);
        mk(gradId(-1), '#e4dabb');
      };

      const clampCam = c => {
        const mnx = WW * .3 - (MAPB.x + MAPB.w) * c.s, mxx = WW * .7 - MAPB.x * c.s, mny = HH * .3 - (MAPB.y + MAPB.h) * c.s, mxy = HH * .7 - MAPB.y * c.s;
        c.x = clamp(c.x, Math.min(mnx, mxx), Math.max(mnx, mxx));
        c.y = clamp(c.y, Math.min(mny, mxy), Math.max(mny, mxy));
      };
      const safe = () => PORT ? { l: 4, t: 98, r: 4, b: 132 } : SM ? { l: 4, t: 52, r: 186, b: 62 } : { l: 6, t: 8, r: 226, b: 118 };
      const fitCam = () => {
        const sf = safe(), aw = WW - sf.l - sf.r, ah = HH - sf.t - sf.b, s = Math.min(aw / MAPB.w, ah / MAPB.h);
        return { s, x: sf.l + (aw - MAPB.w * s) / 2 - MAPB.x * s, y: sf.t + (ah - MAPB.h * s) / 2 - MAPB.y * s };
      };
      const minS = () => fitCam().s * .85;
      const maxS = () => PORT ? 3.6 : 3;
      let lastCs = -1;
      const applyCam = () => {
        G.setAttribute('transform', `translate(${cam.x.toFixed(2)} ${cam.y.toFixed(2)}) scale(${cam.s.toFixed(4)})`);
        const cs = clamp(.92 / cam.s, .55, 3.3);
        if (Math.abs(cs - lastCs) > .004) { svg.style.setProperty('--cs', cs.toFixed(3)); lastCs = cs; }
        svg.classList.toggle('nolbl', cam.s < (PORT ? .5 : .62));
      };
      const setCam = (c, snap) => {
        clampCam(c);
        Object.assign(camT, c);
        if (snap) { Object.assign(cam, c); applyCam(); }
      };
      const fitMap = snap => { camAuto = true; setCam(fitCam(), snap); };
      const zoomAt = (px, py, f) => {
        const s = clamp(camT.s * f, minS(), maxS()), k = s / camT.s;
        setCam({ s, x: px - (px - camT.x) * k, y: py - (py - camT.y) * k }, false);
        camAuto = false;
      };
      const viewRect = t => {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        t.forEach(i => RINGS[i].forEach(r => { for (let k = 0; k < r.length; k += 2) { x0 = Math.min(x0, r[k]); x1 = Math.max(x1, r[k]); y0 = Math.min(y0, r[k + 1]); y1 = Math.max(y1, r[k + 1]); } }));
        return { x0, y0, x1, y1 };
      };
      const zoomTo = (ts, pad = 24) => {
        const r = viewRect(ts), sf = safe(), aw = WW - sf.l - sf.r, ah = HH - sf.t - sf.b;
        const s = clamp(Math.min(aw / (r.x1 - r.x0 + pad * 2), ah / (r.y1 - r.y0 + pad * 2)), minS(), maxS());
        setCam({ s, x: sf.l + aw / 2 - (r.x0 + r.x1) / 2 * s, y: sf.t + ah / 2 - (r.y0 + r.y1) / 2 * s }, false);
        camAuto = false;
      };
      const seeT = ts => {
        if (camAuto) return;
        const sf = safe();
        for (const t of ts) {
          const px = camT.x + ANCH[t][0] * camT.s, py = camT.y + ANCH[t][1] * camT.s;
          if (px < sf.l + 20 || px > WW - sf.r - 20 || py < sf.t + 20 || py > HH - sf.b - 20) {
            const mx = ts.reduce((a, u) => a + ANCH[u][0], 0) / ts.length, my = ts.reduce((a, u) => a + ANCH[u][1], 0) / ts.length;
            setCam({ s: camT.s, x: sf.l + (WW - sf.l - sf.r) / 2 - mx * camT.s, y: sf.t + (HH - sf.t - sf.b) / 2 - my * camT.s }, false);
            return;
          }
        }
      };

      const layout = () => {
        const port = (root.clientWidth || 800) < 640;
        const W = port ? 360 : 1100, H = port ? 520 : 680;
        wrap.style.width = `min(100%, ${port ? 520 : 1500}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        const w = wrap.clientWidth || W, h = wrap.clientHeight || H;
        const sm = !port && h < 470;
        const chg = port !== PORT || sm !== SM || Math.abs(w - WW) > 1 || Math.abs(h - HH) > 1;
        PORT = port; SM = sm; WW = w; HH = h;
        wrap.classList.toggle('port', port); wrap.classList.toggle('sm', sm);
        if (chg) { if (camAuto) fitMap(true); else { setCam(Object.assign({}, camT), true); } }
      };

      const contBtns = () => {
        elConts.innerHTML = '<button class="z" data-z="fit" title="Fit map (F)">' + ICO.fit.replace('<svg', '<svg width="18" height="18"') + '</button>' + CONT.map((c, i) => `<button class="nm" data-z="${i}" title="${c.n} · +${c.b}" style="border-color:${c.c}">${c.s}</button>`).join('');
      };
      contBtns();

      const busy = () => Q.length > 0 || wait > .001;
      const elim = p => !!(M.V && M.V.elim[p]);
      const myTurnNow = () => !!M.V && scene === 'game' && !M.over && !busy() && M.V.turn === M.me && !M.awaiting && !elim(M.me) && M.V.phase !== 'over' && M.V.winner < 0 && !paneK;
      const later = (ms, f) => { T.push({ t: ms, f }); };
      const cntT = p => { let t = 0, a = 0; for (let i = 0; i < 42; i++) if (D.owner[i] === p) { t++; a += D.armies[i]; } return [t, a]; };

      const paintT = t => {
        const o = D.owner[t], c = ownCol(o);
        PT[t].setAttribute('fill', `url(#${gradId(o)})`);
        PC[t].setAttribute('fill', mix(c, '#000000', .3));
        PN[t].textContent = D.armies[t];
        PB[t].style.display = D.armies[t] > 0 ? '' : 'none';
        PB[t].classList.toggle('iscap', D.caps.includes(t));
      };
      const paint = () => { for (let t = 0; t < 42; t++) paintT(t); };

      const eligible = () => {
        const V = M.V, me = M.me, ph = V.phase, el = new Set(), pk = new Set(), tg = new Set();
        let from = -1;
        const mineT = f => { for (let t = 0; t < 42; t++) if (V.owner[t] === me && (!f || f(t))) el.add(t); };
        if (ph === 'claim') { for (let t = 0; t < 42; t++) if (V.owner[t] === -1) { el.add(t); pk.add(t); } }
        else if (ph === 'cappick') { mineT(); mineT(t => { pk.add(t); return true; }); }
        else if ((ph === 'setup' || ph === 'reinforce') && !V.must && V.pool > 0) mineT();
        else if (ph === 'attack') {
          if (UI.from >= 0 && V.owner[UI.from] === me) {
            from = UI.from; el.add(from);
            ADJ[from].forEach(x => { if (V.owner[x] !== me && V.owner[x] >= 0) { el.add(x); tg.add(x); } });
          } else mineT(t => V.armies[t] >= 2 && ADJ[t].some(x => V.owner[x] !== me && V.owner[x] >= 0));
        } else if (ph === 'occupy' && V.occ) { from = V.occ.from; el.add(from); el.add(V.occ.to); tg.add(V.occ.to); }
        else if (ph === 'fortify') {
          if (UI.from >= 0 && V.owner[UI.from] === me) {
            from = UI.from; el.add(from);
            reachOf(V.owner, me, from).forEach(x => { el.add(x); tg.add(x); });
          } else mineT(t => V.armies[t] >= 2 && reachOf(V.owner, me, t).size > 0);
        }
        return { el, pk, tg, from };
      };
      let focT = new Set();
      const marks = () => {
        const V = M.V, on = myTurnNow() && scene === 'game';
        const e = on ? eligible() : null;
        svg.classList.toggle('act', !!e && e.el.size > 0);
        for (let t = 0; t < 42; t++) {
          PT[t].classList.toggle('dim', !!e && !e.el.has(t));
          let c = 'hl';
          if (e) { if (t === e.from) c += ' from'; else if (e.tg.has(t)) c += ' tgt'; else if (e.pk.has(t)) c += ' pick'; }
          if (focT.has(t)) c += ' foc';
          PH[t].setAttribute('class', c);
        }
        if (!V) svg.classList.remove('act');
      };

      const turnLbl = () => {
        const p = D.turn;
        if (scene !== 'game' || p < 0) { elTurn.hidden = true; return; }
        elTurn.hidden = false;
        elTurn.innerHTML = `<i style="display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid #fff;margin-right:7px;background:${ownCol(p)}"></i>${p === M.me ? 'Your turn' : esc(nameOf(p))}${D.pool > 0 && p >= 0 ? ` · ${D.pool} to place` : ''}`;
      };
      const stepsUpd = () => {
        const ph = D.phase, s = ph === 'attack' || ph === 'occupy' ? 'attack' : ph === 'fortify' ? 'fortify' : 'reinforce';
        const show = scene === 'game' && ['reinforce', 'attack', 'occupy', 'fortify'].includes(ph);
        elSteps.style.display = show ? '' : 'none';
        elSteps.querySelectorAll('span').forEach(x => x.classList.toggle('on', x.dataset.s === s));
      };
      const hud = () => {
        const V = M.V;
        if (scene !== 'game' || !V) { elPl.innerHTML = ''; elChips.innerHTML = ''; elBadge.hidden = true; turnLbl(); stepsUpd(); return; }
        let h = '', c = '';
        const rows = [];
        for (let p = 0; p < M.n; p++) rows.push(p);
        if (M.neutralId >= 0) rows.push(M.neutralId);
        rows.forEach(p => {
          const [t, a] = cntT(p), neu = p === M.neutralId, out = !neu && V.elim[p], col = ownCol(p), nm = neu ? 'Neutral' : esc(M.names[p]) + (p === M.me && M.names[p] !== 'You' ? ' (you)' : '');
          const cd = neu ? '' : `<div class="cd" title="Cards">${ICO.cards.replace('<svg', '<svg width="13" height="13"')}${V.counts[p]}</div>`;
          h += `<div class="rk-p${p === D.turn ? ' on' : ''}${out ? ' out' : ''}" data-p="${p}" style="--pc:${col}"><i class="av" style="background:${col}">${neu ? 'N' : esc((M.names[p] || '?')[0].toUpperCase())}</i><div class="nm"><b>${nm}</b><span>${out ? 'Eliminated' : `${t} terr. · ${a} armies`}</span></div>${cd}</div>`;
          c += `<div class="rk-chip${p === D.turn ? ' on' : ''}${out ? ' out' : ''}" data-p="${p}" style="--pc:${col}"><i style="background:${col}"></i><div><b>${neu ? 'Neutral' : esc(M.names[p])}</b><span>${out ? 'out' : `${t} · ${a}${neu ? '' : ' · ' + V.counts[p] + 'c'}`}</span></div></div>`;
        });
        elPl.innerHTML = h; elChips.innerHTML = c;
        const hc = V.hand.length;
        elBadge.hidden = !hc; elBadge.textContent = hc;
        const can = V.phase === 'reinforce' && V.turn === M.me && setsOf(V.hand).length > 0 && !M.over;
        elCards.classList.toggle('hot', can && (V.must || myTurnNow()));
        turnLbl(); stepsUpd();
      };

      const dock = () => {
        const V = M.V;
        if (scene !== 'game' || !V) { elDock.innerHTML = ''; return; }
        const bt = (cls, a, label, ex) => `<button class="rk-b ${cls || ''}" data-a="${a}"${ex || ''}>${label}</button>`;
        const dot = p => `<i style="background:${ownCol(p)}"></i>`;
        let msg = '', sub = '', ctl = '', btns = '';
        const mine = myTurnNow(), me = M.me, ph = V.phase;
        if (M.over) { elDock.innerHTML = ''; return; }
        if (elim(me)) {
          msg = 'You were eliminated'; sub = 'You can keep watching the game';
          btns = bt(FF ? 'pri' : '', 'ff', FF ? 'Normal speed' : 'Skip ahead') + bt('', 'menu', 'Menu');
        } else if (!mine) {
          const p = D.turn;
          if (p >= 0 && D.phase !== 'init') {
            msg = dot(p) + esc(nameOf(p)) + ' ' + (PHASE_LBL[D.phase] || '');
            sub = (D.phase === 'reinforce' || D.phase === 'setup') && D.pool > 0 ? `${D.pool} armies to place` : '';
          }
        } else if (ph === 'claim') {
          msg = 'Claim a territory'; sub = `${V.owner.filter(o => o === -1).length} still unclaimed`;
        } else if (ph === 'cappick') {
          msg = 'Choose your capital'; sub = 'Tap one of your territories. Hold every capital to win.';
        } else if (ph === 'setup' || ph === 'reinforce') {
          const forced = V.must || (ph === 'reinforce' && V.pool === 0 && V.back);
          if (forced) { msg = 'Trade in your cards'; sub = V.must ? 'You hold too many cards: trade a set to continue' : 'Trade a set before you attack again'; btns = bt('pri hot', 'cards', ICO.cards.replace('<svg', '<svg width="18" height="18" style="vertical-align:-3px;margin-right:6px"') + 'Cards'); }
          else {
            msg = ph === 'setup' ? 'Place your armies' : 'Reinforce';
            sub = ph === 'setup' ? `${V.pool} to place now · ${V.rem[me]} left in total` : `${V.pool} armies to place · tap your territories`;
            const q = UI.qty;
            ctl = `<div class="rk-seg">${[[1, '×1'], [5, '×5'], [0, 'All']].map(([v, l]) => `<button data-q="${v}" class="${q === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
            if (ph === 'reinforce' && V.hand.length) btns = bt(setsOf(V.hand).length ? 'pri' : '', 'cards', 'Cards');
          }
        } else if (ph === 'attack') {
          const f = UI.from, t = UI.to;
          if (f >= 0 && t >= 0 && V.owner[f] === me && V.owner[t] !== me) {
            const A = V.armies[f], Dn = V.armies[t], md = Math.min(3, A - 1), dc = Math.min(UI.dice, md);
            msg = `${esc(SHORT[f])} <span style="opacity:.6">→</span> ${esc(SHORT[t])}`;
            sub = `${A} vs ${Dn} · ${Math.round(pConq(A, Dn) * 100)}% to conquer`;
            ctl = `<div class="rk-seg">${[1, 2, 3].map(d => `<button data-d="${d}" class="${dc === d ? 'on' : ''}"${d > md ? ' disabled' : ''}>${d} ${d === 1 ? 'die' : 'dice'}</button>`).join('')}</div>`;
            btns = bt('red', 'roll', 'Roll') + bt('pri', 'blitz', 'Blitz') + bt('', 'cancel', 'Cancel');
          } else if (f >= 0) {
            msg = `Attack from ${esc(SHORT[f])}`; sub = 'Tap a highlighted enemy territory'; btns = bt('', 'cancel', 'Cancel');
          } else {
            msg = 'Attack'; sub = V.conq ? 'Tap your territory, then an enemy next to it · a card awaits' : 'Tap your territory, then an enemy next to it';
            btns = bt('pri', 'endatk', 'End attack') + bt('', 'endturn', 'End turn');
          }
        } else if (ph === 'occupy' && V.occ) {
          const o = V.occ, mx = o.max;
          UI.occ = clamp(UI.occ, 0, mx);
          msg = `${esc(NAMES[o.to])} conquered`; sub = `Move extra armies in from ${esc(SHORT[o.from])}`;
          ctl = `<div class="rk-sl rk-glass"><input type="range" min="0" max="${mx}" value="${UI.occ}" data-r="occ" aria-label="Armies to move"><span class="v"></span></div>`;
          btns = bt('', 'occ0', 'None') + bt('', 'occh', 'Half') + bt('', 'occa', 'All') + bt('pri', 'occ', 'Move');
        } else if (ph === 'fortify') {
          const f = UI.from, t = UI.to;
          if (f >= 0 && t >= 0 && V.owner[f] === me && V.owner[t] === me) {
            const mx = V.armies[f] - 1;
            UI.mv = clamp(UI.mv, 1, mx);
            msg = `${esc(SHORT[f])} <span style="opacity:.6">→</span> ${esc(SHORT[t])}`; sub = 'Choose how many armies to move';
            ctl = `<div class="rk-sl rk-glass"><input type="range" min="1" max="${mx}" value="${UI.mv}" data-r="mv" aria-label="Armies to move"><span class="v"></span></div>`;
            btns = bt('pri', 'fort', 'Move & end turn') + bt('', 'cancel', 'Cancel');
          } else if (f >= 0) {
            msg = `Fortify from ${esc(SHORT[f])}`; sub = 'Tap a highlighted territory'; btns = bt('', 'cancel', 'Cancel');
          } else {
            msg = 'Fortify'; sub = 'Make one move between connected territories, or finish';
            btns = bt('pri', 'endturn', 'End turn');
          }
        }
        elDock.innerHTML = (msg ? `<div class="rk-msg rk-glass">${msg}${sub ? `<small>${sub}</small>` : ''}</div>` : '') + (ctl || btns ? `<div class="rk-act">${ctl}${btns}</div>` : '');
        const r = elDock.querySelector('input[data-r]');
        if (r) updSlider(r);
      };
      const updSlider = r => {
        const V = M.V, v = +r.value, sp = r.parentNode.querySelector('.v');
        if (r.dataset.r === 'occ' && V.occ) sp.textContent = v ? `Move ${v} more · ${V.armies[V.occ.to] + v} there, ${V.armies[V.occ.from] - v} stay` : `Keep ${V.armies[V.occ.to]} there, ${V.armies[V.occ.from]} stay`;
        else if (r.dataset.r === 'mv' && UI.from >= 0 && UI.to >= 0) sp.textContent = `Move ${v} · ${V.armies[UI.from] - v} stay, ${V.armies[UI.to] + v} there`;
      };
      const keyChk = () => {
        const key = M.V ? [M.V.phase, M.V.turn, M.V.turnNo].join() : '';
        if (key !== UI.lastKey) { UI.lastKey = key; UI.from = -1; UI.to = -1; UI.occ = -1; UI.mv = 1; }
      };
      const refreshUI = () => {
        keyChk();
        if (M.V && M.V.phase === 'occupy' && M.V.occ && UI.occ < 0) {
          const o = M.V.occ, hostile = ADJ[o.from].some(x => M.V.owner[x] !== M.me && M.V.owner[x] >= 0);
          UI.occ = hostile ? 0 : o.max;
        }
        if (UI.occ < 0) UI.occ = 0;
        if (M.V && M.V.phase === 'attack') {
          if (UI.from >= 0 && (M.V.owner[UI.from] !== M.me || M.V.armies[UI.from] < 2)) { UI.from = -1; UI.to = -1; }
          if (UI.to >= 0 && M.V.owner[UI.to] === M.me) UI.to = -1;
        }
        marks(); hud(); dock();
        if (paneK === 'cards') cardsPane();
      };

      const showPane = (k, html, fn, cls) => {
        paneK = k; paneFn = fn || null;
        pane.className = 'rk-pane' + (cls ? ' ' + cls : '');
        pane.innerHTML = html; pane.hidden = false; pane.scrollTop = 0;
      };
      const hidePane = () => { paneK = ''; paneFn = null; pane.hidden = true; pane.innerHTML = ''; };
      api.on(pane, 'click', e => {
        const b = e.target.closest('[data-a],[data-o],[data-c],[data-bt]');
        if (!b || !paneFn) return;
        audio();
        paneFn(b.dataset.a, b, e);
      });

      const seg = (key, items, val, cls) => `<div class="rk-seg ${cls || ''}">${items.map(([v, l]) => `<button data-o="${key}" data-v="${v}" class="${String(val) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
      const titleHtml = () => `<div class="rk-box"><p class="rk-kick">Conquer the world</p><div class="rk-logo">RISK</div><p class="rk-tag">The game of global domination</p>
<button class="rk-big a" data-a="play">Play vs bots</button><button class="rk-big b" data-a="online">Play online</button>
<div class="rk-row"><button class="rk-b" data-a="rules">How to play</button></div><p class="rk-fine">${wins ? `Wins so far: ${wins}` : 'Classic map · 42 territories · 6 continents'}</p></div>`;
      const setupHtml = online => {
        const colors = COLORS.map((c, i) => `<button data-o="color" data-v="${i}" aria-label="Colour ${i + 1}" style="width:34px;height:34px;border-radius:50%;border:3px solid ${opt.color === i ? '#fff' : 'rgba(255,255,255,.18)'};background:${c};cursor:pointer;margin:0 3px;box-shadow:${opt.color === i ? '0 0 0 3px #ffd23f' : 'none'}"></button>`).join('');
        return `<div class="rk-box"><p class="rk-kick">${online ? 'Online game' : 'New game'}</p><h3>${online ? 'Game settings' : 'Choose your battle'}</h3>
${online ? '' : `<div class="rk-opt"><span>Players</span>${seg('n', [2, 3, 4, 5, 6].map(v => [v, v]), opt.n, 'big')}</div>`}
<div class="rk-opt"><span>Mode<small>${opt.mode === 'cap' ? 'Hold every capital' : 'Take every territory'}</small></span>${seg('mode', [['dom', 'Domination'], ['cap', 'Capitals']], opt.mode)}</div>
<div class="rk-opt"><span>Territories<small>${opt.claim === 'draft' ? 'Take turns choosing' : 'Dealt at random'}</small></span>${seg('claim', [['rand', 'Random'], ['draft', 'Draft']], opt.claim)}</div>
<div class="rk-opt"><span>Bots</span>${seg('diff', DIFFS.map((d, i) => [i, d]), opt.diff)}</div>
<div class="rk-opt"><span>Speed</span>${seg('speed', [[0, 'Normal'], [1, 'Fast']], opt.speed)}</div>
${online ? '' : `<div class="rk-opt"><span>Colour</span><div style="flex:1;display:flex;justify-content:center;flex-wrap:wrap;gap:4px">${colors}</div></div>`}
<button class="rk-big c" data-a="start">${online ? 'Open lobby' : 'Start game'}</button><div class="rk-row"><button class="rk-b" data-a="back">Back</button></div></div>`;
      };
      const RULES = `<div class="rk-box wide rk-rules"><p class="rk-kick">How to play</p><h3>Rules of Risk</h3>
<p><b>Goal.</b> Conquer all 42 territories. In <b>Capitals</b> mode each player picks a capital and wins by holding every capital.</p>
<p><b>Setup.</b> Territories are dealt (or drafted one by one), then players take turns placing armies: 40 each with two players, 35 / 30 / 25 / 20 with three to six. With two players a neutral army holds a third of the map.</p>
<p><b>1 Reinforce.</b> Receive territories / 3 armies (at least 3), plus the bonus for each whole continent: North America 5, South America 2, Europe 5, Africa 3, Asia 7, Australia 2. Tap your territories to place them.</p>
<p><b>Cards.</b> Take at least one territory in a turn to draw a card. Trade three of a kind, one of each, or any two plus a wild for 4, 6, 8, 10, 12, 15 armies and then 5 more each time. Own a traded territory and it gets +2 armies. You must trade when you hold five or more cards.</p>
<p><b>2 Attack.</b> Tap your territory (2+ armies), then an enemy next to it (sea lines count). The attacker rolls up to 3 dice, the defender up to 2. Highest dice are compared in pairs and ties go to the defender. <b>Blitz</b> rolls until you win or run out. After a conquest move extra armies in. Eliminate a player to take their cards.</p>
<p><b>3 Fortify.</b> Move armies once from one territory to another connected through your own territories, then end your turn.</p>
<p><b>Map.</b> Drag to pan, scroll or pinch to zoom, use the continent buttons to jump. Keys: <b>R</b> roll, <b>B</b> blitz, <b>C</b> cards, <b>E</b> end phase, <b>F</b> fit map, <b>Space</b> confirm.</p>
<div class="rk-row"><button class="rk-b pri" data-a="back">Got it</button></div></div>`;

      const cardLabel = id => id >= 42 ? 'Wild card' : `${SHORT[id]} (${SYMN[sym(id)]})`;
      const canTrade = () => !!M.V && M.V.phase === 'reinforce' && M.V.turn === M.me && !busy() && !M.awaiting && !M.over;
      const bestSet = () => {
        const V = M.V, sets = setsOf(V.hand);
        let best = null, bs = -1e9;
        sets.forEach(c => {
          const sc = c.filter(i => i < 42 && V.owner[i] === M.me).length * 10 - c.filter(i => i >= 42).length * 4 + Math.random();
          if (sc > bs) { bs = sc; best = c; }
        });
        return best;
      };
      const cardsPane = () => {
        const V = M.V;
        if (!V) return;
        const can = canTrade(), hand = V.hand.slice().sort((a, b) => a - b);
        UI.sel = UI.sel.filter(i => hand.includes(i));
        const ok = UI.sel.length === 3 && validSet(UI.sel);
        const own = ok ? UI.sel.filter(i => i < 42 && V.owner[i] === M.me) : [];
        if (own.length && !own.includes(UI.bt)) UI.bt = own[0];
        let h = `<div class="rk-box wide"><p class="rk-kick">Your cards</p><h3>${hand.length ? hand.length + ' card' + (hand.length > 1 ? 's' : '') : 'No cards yet'}</h3>`;
        h += `<p>Next set is worth <b style="color:#ffd23f">${V.next}</b> armies.${V.must ? ' <b style="color:#ff8a7a">You must trade in a set now.</b>' : ''}</p>`;
        h += hand.length ? `<div class="rk-hand">${hand.map(id => cardHtml(id, id < 42 && V.owner[id] === M.me, UI.sel.includes(id))).join('')}</div>` : '<p>Take at least one territory during your attack to earn a card.</p>';
        if (own.length > 1) h += `<div class="rk-bt"><span class="rk-lbl">+2 armies on</span>${own.map(i => `<button data-bt="${i}" class="${UI.bt === i ? 'on' : ''}">${esc(SHORT[i])}</button>`).join('')}</div>`;
        else if (own.length === 1) h += `<p class="rk-fine" style="margin:0">+2 bonus armies on ${esc(SHORT[own[0]])}</p>`;
        if (!can && hand.length) h += `<p class="rk-fine">${V.turn === M.me ? 'Wait for the action to finish' : 'You can trade in at the start of your turn'}</p>`;
        h += `<div class="rk-row" style="margin-top:8px">${setsOf(hand).length && can ? '<button class="rk-b" data-a="auto">Auto-select</button>' : ''}<button class="rk-b grn" data-a="trade"${ok && can ? '' : ' disabled'}>${ok ? `Trade in +${V.next}` : 'Pick a set of 3'}</button><button class="rk-b" data-a="close">${V.must && can ? 'Later' : 'Close'}</button></div>`;
        h += '<p class="rk-fine">Sets: three of a kind, one of each, or two plus a wild</p></div>';
        showPane('cards', h + '', cardsFn);
      };
      const cardsFn = (a, b) => {
        const V = M.V;
        if (b.dataset.c !== undefined) {
          const id = +b.dataset.c, i = UI.sel.indexOf(id);
          if (i >= 0) UI.sel.splice(i, 1); else { if (UI.sel.length >= 3) UI.sel.shift(); UI.sel.push(id); }
          sfx('tap'); return cardsPane();
        }
        if (b.dataset.bt !== undefined) { UI.bt = +b.dataset.bt; return cardsPane(); }
        if (a === 'close') { UI.sel = []; hidePane(); refreshUI(); }
        else if (a === 'auto') { const s = bestSet(); if (s) UI.sel = s.slice(); sfx('tap'); cardsPane(); }
        else if (a === 'trade' && canTrade() && validSet(UI.sel)) {
          const c = UI.sel.slice(), bt = UI.bt;
          UI.sel = [];
          if (!doAct({ t: 'trade', c, bt })) cardsPane();
        }
      };
      const menuPane = () => {
        const online = M.mode === 'online';
        showPane('menu', `<div class="rk-box"><p class="rk-kick">Risk</p><h3>Menu</h3>
<button class="rk-big c" data-a="back">Resume</button>
<button class="rk-big d" data-a="rules">How to play</button>
${online ? '' : '<button class="rk-big d" data-a="restart">New game</button>'}
<button class="rk-big a" data-a="quit">${online ? 'Leave game' : 'Quit to title'}</button></div>`, menuFn);
      };
      const menuFn = a => {
        if (a === 'back') { hidePane(); refreshUI(); }
        else if (a === 'rules') showPane('rules', RULES, a2 => { menuPane(); });
        else if (a === 'restart') { setupPane(false); }
        else if (a === 'quit') quitToTitle();
      };
      const overPane = () => {
        const V = M.V, w = V.winner;
        const rows = [];
        for (let p = 0; p < M.n; p++) rows.push(p);
        rows.sort((a, b) => (b === w) - (a === w) || cntT(b)[0] - cntT(a)[0]);
        const st = p => V.st[p];
        const tbl = `<table class="rk-tbl"><tr><th>Player</th><th>Terr.</th><th>Conquests</th><th>Kills</th><th>Lost</th><th>Turns</th></tr>${rows.map(p => `<tr class="${p === w ? 'win' : ''}"><td><i style="background:${ownCol(p)}"></i>${esc(M.names[p])}</td><td>${V.owner.filter(o => o === p).length}</td><td>${st(p).conq}</td><td>${st(p).kills}</td><td>${st(p).lost}</td><td>${st(p).turns}</td></tr>`).join('')}</table>`;
        const online = M.mode === 'online', host = M.role === 'host';
        const btns = !online ? '<button class="rk-big c" data-a="again">Play again</button><button class="rk-big d" data-a="quit">Menu</button>'
          : host ? '<button class="rk-big c" data-a="again">Rematch</button><button class="rk-big b" data-a="lobby">Back to lobby</button><button class="rk-big d" data-a="quit">Leave</button>'
            : '<p>Waiting for the host to start a rematch…</p><button class="rk-big d" data-a="quit">Leave</button>';
        showPane('over', `<div class="rk-box wide"><p class="rk-kick">${V.mode === 'cap' ? 'Capitals' : 'World Domination'}</p><h3>${w === M.me ? 'Victory! You rule the world' : esc(M.names[w]) + ' conquers the world'}</h3>${tbl}<p class="rk-fine">${V.turnNo} turns played</p>${btns}</div>`, a => {
          if (a === 'again') { if (online) rematch(); else newSolo(); }
          else if (a === 'quit') quitToTitle();
          else if (a === 'lobby') startOnline();
        });
      };

      let ac = null, master = null, noise = null;
      const audio = () => {
        if (api.muted) return null;
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
          noise = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
          const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      };
      const nz = (t, dur, f, q, vol, f2) => {
        const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur); bp.Q.value = q;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
      };
      const tn = (t, dur, type, f0, f1, vol) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
      };
      let lastSfx = {};
      const sfx = k => {
        if (!audio()) return;
        const t = ac.currentTime + .005, n = performance.now();
        if (lastSfx[k] && n - lastSfx[k] < 40) return;
        lastSfx[k] = n;
        try {
          if (k === 'place') { tn(t, .09, 'triangle', 520, 330, .09); nz(t, .04, 1800, 1, .12); }
          else if (k === 'deal') nz(t, .05, 3200, 1.2, .16);
          else if (k === 'dice') for (let i = 0; i < 9; i++) { nz(t + i * .055 + Math.random() * .02, .035, 900 + Math.random() * 1800, 2, .28); tn(t + i * .055, .03, 'square', 160 + Math.random() * 90, 120, .018); }
          else if (k === 'hit') { tn(t, .16, 'sawtooth', 190, 70, .08); nz(t, .1, 500, .7, .22); }
          else if (k === 'conq') [392, 523, 659, 784].forEach((f, i) => tn(t + i * .07, .25, 'triangle', f, f * 1.01, .075));
          else if (k === 'elim') { tn(t, .4, 'sawtooth', 300, 70, .09); nz(t + .05, .3, 300, .6, .25); }
          else if (k === 'card') { nz(t, .08, 2600, .8, .35); nz(t, .05, 700, 1, .2); }
          else if (k === 'trade') [523, 659, 784, 1047].forEach((f, i) => tn(t + i * .06, .18, 'square', f, f, .05));
          else if (k === 'turn') { tn(t, .08, 'sine', 880, 880, .05); tn(t + .08, .12, 'sine', 1320, 1320, .045); }
          else if (k === 'cap') { tn(t, .3, 'triangle', 660, 990, .08); tn(t + .1, .3, 'triangle', 990, 1320, .06); }
          else if (k === 'fort') { tn(t, .22, 'triangle', 300, 600, .07); nz(t, .22, 500, .8, .12, 1800); }
          else if (k === 'bad') tn(t, .12, 'square', 170, 120, .04);
          else if (k === 'tap') tn(t, .05, 'sine', 600, 600, .04);
          else if (k === 'win') { [523, 659, 784, 1047, 1319].forEach((f, i) => tn(t + i * .09, .3, 'triangle', f, f, .08)); tn(t + .5, .7, 'sine', 1047, 1047, .05); }
          else if (k === 'lose') [392, 349, 311, 262].forEach((f, i) => tn(t + i * .14, .3, 'triangle', f, f * .98, .07));
        } catch (e) {}
      };

      const popT = t => { const cb = PCB[t]; cb.classList.remove('pop', 'hit'); cb.getBoundingClientRect(); cb.classList.add('pop'); };
      const hitT = t => { const cb = PCB[t]; cb.classList.remove('pop', 'hit'); cb.getBoundingClientRect(); cb.classList.add('hit'); };
      const floatT = (t, txt, col) => {
        const g = sv('g', { transform: `translate(${ANCH[t][0].toFixed(1)} ${(ANCH[t][1] - 8).toFixed(1)})` }, gFx), c = sv('g', { class: 'cs' }, g), x = sv('text', { class: 'fl', fill: col || '#fff' }, c);
        x.textContent = txt;
        later(1.15, () => g.remove());
      };
      const flagFx = (t, col) => {
        const g = sv('g', { transform: `translate(${ANCH[t][0].toFixed(1)} ${ANCH[t][1].toFixed(1)})` }, gFx), c = sv('g', { class: 'cs' }, g);
        sv('circle', { class: 'flag', r: 12, fill: 'none', stroke: col, 'stroke-width': 4 }, c);
        sv('circle', { class: 'flag', r: 8, fill: col, 'fill-opacity': .5, style: 'animation-delay:.08s' }, c);
        later(1, () => g.remove());
      };
      let arrowEl = null;
      const clearArrow = () => { if (arrowEl) { arrowEl.remove(); arrowEl = null; } };
      const arrowFx = (a, b, col) => {
        clearArrow();
        const g = sv('g', null, gFx);
        let [x1, y1] = ANCH[a], [x2, y2] = ANCH[b];
        const wr = WRAP.some(w => (w[0] === a && w[1] === b) || (w[0] === b && w[1] === a));
        if (wr) {
          const L = ANCH[a][0] < ANCH[b][0] ? a : b, R = L === a ? b : a;
          sv('path', { class: 'ar', d: `M${ANCH[L][0]} ${ANCH[L][1]}L-8 ${ANCH[L][1] - 10}M${ANCH[R][0]} ${ANCH[R][1]}L1028 ${ANCH[R][1] - 10}`, stroke: col }, g);
        } else {
          sv('path', { class: 'ar', d: `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`, stroke: col }, g);
          const an = Math.atan2(y2 - y1, x2 - x1), r = 15, hx = x2 - Math.cos(an) * r, hy = y2 - Math.sin(an) * r;
          sv('path', { d: `M${hx + Math.cos(an) * 9} ${hy + Math.sin(an) * 9}L${hx - Math.sin(an) * 7} ${hy + Math.cos(an) * 7}L${hx + Math.sin(an) * 7} ${hy - Math.cos(an) * 7}Z`, fill: col, stroke: '#fff', 'stroke-width': 1.5 }, g);
        }
        arrowEl = g;
      };

      let banTok = 0;
      const banner = (txt, sub, col, ms) => {
        const my = ++banTok, c = col || '#2f78b5';
        elBan.hidden = false;
        elBan.style.background = `linear-gradient(${mix(c, '#ffffff', .18)},${mix(c, '#000000', .3)})`;
        elBan.style.color = isLight(c) ? '#1d1600' : '#fff';
        elBan.innerHTML = txt + (sub ? `<small>${sub}</small>` : '');
        elBan.style.animation = 'none'; elBan.getBoundingClientRect(); elBan.style.animation = '';
        later(ms || 1.45, () => { if (my === banTok) elBan.hidden = true; });
      };

      const logLine = (html, cls) => {
        const p = document.createElement('p');
        if (cls) p.className = cls;
        p.innerHTML = html; elLog.appendChild(p);
        while (elLog.children.length > 240) elLog.firstChild.remove();
        elLog.scrollTop = elLog.scrollHeight;
        lastLog = null;
        return p;
      };
      const logPlace = (p, n) => {
        if (lastLog && lastLog.p === p) { lastLog.n += n; lastLog.el.innerHTML = `${nameH(p)} places ${lastLog.n} armies`; elLog.scrollTop = elLog.scrollHeight; return; }
        const el = logLine(`${nameH(p)} places ${n} ${n === 1 ? 'army' : 'armies'}`);
        lastLog = { p, n, el };
      };

      let bat = null;
      const batSettle = () => {
        if (!bat || bat.done) return;
        bat.done = true;
        const e = bat.e, ds = elBattle.querySelectorAll('.rk-die');
        const na = e.ad.length, nd = e.dd.length, k = Math.min(na, nd);
        ds.forEach((d, i) => {
          const isA = i < na, j = isA ? i : i - na, v = isA ? e.ad[j] : e.dd[j];
          setDie(d, v); d.classList.remove('roll'); d.classList.add('settle');
          if (j < k) { const aw = e.ad[j] > e.dd[j]; d.classList.add(isA === aw ? 'win' : 'lose'); } else d.classList.add('lose');
        });
        const res = elBattle.querySelector('.res');
        res.innerHTML = (e.la ? `<span style="color:#ff9a8a">${esc(nameOf(e.p))} −${e.la}</span>` : '') + (e.la && e.ld ? ' &nbsp;·&nbsp; ' : '') + (e.ld ? `<span style="color:#8dffb4">${esc(nameOf(e.q) || 'Neutral')} −${e.ld}</span>` : '');
        D.armies[e.from] = e.af; D.armies[e.to] = e.at;
        paintT(e.from); paintT(e.to);
        if (e.la) { hitT(e.from); floatT(e.from, '−' + e.la, '#ff8a7a'); }
        if (e.ld) { hitT(e.to); floatT(e.to, '−' + e.ld, '#ff8a7a'); }
        sfx('hit');
        battleT = bat.quick ? .5 : 1.1;
      };
      const batTick = dt => {
        if (bat && !bat.done) {
          bat.tum -= dt; bat.fl -= dt;
          if (bat.fl <= 0) { bat.fl = .075; elBattle.querySelectorAll('.rk-die.roll').forEach(d => setDie(d, 1 + ((Math.random() * 6) | 0))); }
          if (bat.tum <= 0) batSettle();
        }
        if (battleT > 0) {
          battleT -= dt;
          if (battleT <= 0) { elBattle.hidden = true; clearArrow(); battleT = 0; }
        }
      };
      const hideBattle = () => { if (bat) batSettle(); elBattle.hidden = true; clearArrow(); battleT = 0; bat = null; };

      const syncD = V => {
        D.owner = V.owner.slice(); D.armies = V.armies.slice(); D.phase = V.phase; D.turn = V.turn; D.pool = V.pool; D.caps = V.caps.filter(c => c >= 0);
        paint();
      };

      const present = (e, v) => {
        const f = speedF(), me = M.me;
        switch (e.k) {
          case 'first': logLine(`${nameH(e.p)} goes first`, 'turn'); return .25 * f;
          case 'deal': {
            if (v.draft) { sfx('turn'); return .2 * f; }
            const ord = [...Array(42).keys()].sort(() => Math.random() - .5);
            D.owner.fill(-1); D.armies.fill(0); paint();
            const step = .026 * f;
            ord.forEach((t, i) => later(i * step, () => { D.owner[t] = v.owner[t]; D.armies[t] = v.armies[t]; paintT(t); popT(t); if (i % 3 === 0) sfx('deal'); }));
            logLine('Territories are dealt');
            return 42 * step + .45 * f;
          }
          case 'claim': {
            D.owner[e.t] = e.p; D.armies[e.t] = 1; paintT(e.t); popT(e.t); sfx('place'); seeT([e.t]);
            if (e.p !== M.neutralId || e.p < 0) logLine(`${nameH(e.p)} claims <b>${esc(NAMES[e.t])}</b>`);
            return (e.p === M.neutralId && e.p >= 0 ? .1 : .24) * f;
          }
          case 'phase': D.phase = e.ph; stepsUpd(); turnLbl(); return 0;
          case 'turn': {
            D.turn = e.p;
            D.phase = e.cap ? 'cappick' : e.claim ? 'claim' : e.setup ? 'setup' : 'reinforce';
            D.pool = e.n || 0;
            hud(); dock();
            if (e.no) {
              const bonus = (e.conts || []).map(c => CONT[c].n).join(', ');
              logLine(`${nameH(e.p)}'s turn · ${e.n} armies${bonus ? ' (' + esc(bonus) + ')' : ''}`, 'turn');
              banner(e.p === me ? 'Your turn' : esc(nameOf(e.p)) + "'s turn", `+${e.n} armies${bonus ? ' · ' + esc(bonus) : ''}`, ownCol(e.p), 1.1);
              if (e.p === me) sfx('turn');
              return .75 * f;
            }
            return 0;
          }
          case 'place': {
            D.armies[e.t] = e.a; if (e.p === D.turn) D.pool = Math.max(0, D.pool - e.n);
            paintT(e.t); popT(e.t); floatT(e.t, '+' + e.n, '#fff'); sfx('place'); seeT([e.t]); logPlace(e.p, e.n); turnLbl(); hud();
            return (e.setup ? .1 : .15) * f;
          }
          case 'trade': {
            D.pool += e.v;
            if (e.bt >= 0) { D.armies[e.bt] = e.a; paintT(e.bt); popT(e.bt); floatT(e.bt, '+2', '#9dffbb'); }
            logLine(`${nameH(e.p)} trades in cards for <b>${e.v}</b> armies${e.bt >= 0 ? ` (+2 on ${esc(SHORT[e.bt])})` : ''}`);
            sfx('trade'); turnLbl();
            if (e.p === me) banner(`+${e.v} armies`, 'Cards traded in', '#2d8a4e', 1.1);
            return .75 * f;
          }
          case 'draw': {
            logLine(`${nameH(e.p)} earns a card` + (e.p === me && e.id !== undefined ? ` · ${esc(cardLabel(e.id))}` : ''));
            sfx('card'); hud();
            elCards.classList.remove('hot'); elCards.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3) rotate(-8deg)' }, { transform: 'scale(1)' }], { duration: 420 });
            return .3 * f;
          }
          case 'roll': {
            const ahead = Q.reduce((a, x) => a + (x.e.k === 'roll' ? 1 : 0), 0);
            const quick = ahead > 2 || (FF), vq = ahead > 14;
            if (!bat || bat.e.from !== e.from || bat.e.to !== e.to || elBattle.hidden) {
              elBattle.hidden = false;
              elBattle.innerHTML = `<div class="col"><div class="hd"><i style="background:${ownCol(e.p)}"></i>${esc(nameOf(e.p))} <u>${esc(SHORT[e.from])}</u></div><div class="dice"></div></div><div class="vs">VS</div><div class="col"><div class="hd"><i style="background:${ownCol(e.q)}"></i>${esc(nameOf(e.q) || 'Neutral')} <u>${esc(SHORT[e.to])}</u></div><div class="dice"></div></div><div class="res"></div>`;
              arrowFx(e.from, e.to, ownCol(e.p)); seeT([e.from, e.to]);
            }
            elBattle.style.opacity = 1;
            const dc = elBattle.querySelectorAll('.dice');
            dc[0].innerHTML = e.ad.map(() => dieHtml(1 + ((Math.random() * 6) | 0), 'r roll')).join('');
            dc[1].innerHTML = e.dd.map(() => dieHtml(1 + ((Math.random() * 6) | 0), 'w roll')).join('');
            elBattle.querySelector('.res').innerHTML = '&nbsp;';
            bat = { e, tum: (vq ? .05 : quick ? .13 : .6) * (FF ? .5 : f), fl: 0, done: false, quick };
            battleT = 9;
            if (!quick) sfx('dice');
            return (vq ? .14 : quick ? .34 : 1.3) * (FF ? .5 : f);
          }
          case 'conq': {
            if (bat && !bat.done) batSettle();
            D.owner[e.to] = e.p; D.armies[e.to] = e.at; D.armies[e.from] = e.af; paintT(e.to); paintT(e.from);
            flagFx(e.to, ownCol(e.p)); popT(e.to); sfx('conq'); hud();
            logLine(`${nameH(e.p)} conquers <b>${esc(NAMES[e.to])}</b>${e.prev >= 0 ? ' from ' + nameH(e.prev) : ''}`);
            battleT = Math.min(battleT, .6);
            return .5 * f;
          }
          case 'elim': {
            logLine(`${nameH(e.q)} is eliminated! ${nameH(e.p)} takes ${e.n} ${e.n === 1 ? 'card' : 'cards'}`, 'turn');
            banner(esc(nameOf(e.q)) + ' eliminated', `${esc(nameOf(e.p))} takes ${e.n} ${e.n === 1 ? 'card' : 'cards'}`, '#8a2b22', 1.6);
            sfx('elim'); hud();
            return 1.3 * f;
          }
          case 'occ': {
            D.armies[e.from] = e.af; D.armies[e.to] = e.at; paintT(e.from); paintT(e.to);
            if (e.n > 0) { floatT(e.to, '+' + e.n, '#fff'); popT(e.to); sfx('place'); logLine(`${nameH(e.p)} moves ${e.n} more into <b>${esc(SHORT[e.to])}</b>`); return .3 * f; }
            return 0;
          }
          case 'fort': {
            hideBattle();
            D.armies[e.from] = e.af; D.armies[e.to] = e.at; paintT(e.from); paintT(e.to);
            arrowFx(e.from, e.to, ownCol(e.p)); seeT([e.from, e.to]);
            later(.9 * f, clearArrow);
            floatT(e.to, '+' + e.n, '#9dffbb'); floatT(e.from, '−' + e.n, '#ffd0c8'); sfx('fort');
            logLine(`${nameH(e.p)} fortifies <b>${esc(SHORT[e.to])}</b> from <b>${esc(SHORT[e.from])}</b> (${e.n})`);
            return .75 * f;
          }
          case 'skip': return 0;
          case 'cap': {
            if (!D.caps.includes(e.t)) D.caps.push(e.t);
            paintT(e.t); popT(e.t); flagFx(e.t, '#ffd23f'); sfx('cap');
            logLine(`${nameH(e.p)} sets a capital in <b>${esc(NAMES[e.t])}</b>`);
            return .4 * f;
          }
          case 'win': {
            hideBattle();
            logLine(`${nameH(e.p)} wins the game!`, 'turn');
            banner(e.p === me ? 'Victory!' : esc(nameOf(e.p)) + ' wins', e.p === me ? 'You conquered the world' : '', ownCol(e.p), 2);
            sfx(e.p === me ? 'win' : 'lose');
            if (e.p === me) { wins++; saveAll(); api.score(wins); api.submit(wins); }
            M.over = true;
            return 2.1;
          }
        }
        return 0;
      };

      const tick = dt => {
        if (cam.x !== camT.x || cam.y !== camT.y || cam.s !== camT.s) {
          const k = Math.min(1, dt * 9 + .02);
          cam.x += (camT.x - cam.x) * k; cam.y += (camT.y - cam.y) * k; cam.s += (camT.s - cam.s) * k;
          if (Math.abs(camT.x - cam.x) + Math.abs(camT.y - cam.y) < .4 && Math.abs(camT.s - cam.s) < .001) Object.assign(cam, camT);
          applyCam();
        }
        if (M.awaiting && (M.awaitT -= dt) <= 0) { M.awaiting = false; refreshUI(); }
        if (T.length) {
          const due = [], keep = [];
          T.forEach(x => { x.t -= dt; (x.t <= 0 ? due : keep).push(x); });
          T = keep;
          due.forEach(x => x.f());
        }
        batTick(dt);
        if (wait > 0) wait -= dt;
        let g = 0;
        if (Q.length) wasBusy = true;
        while (wait <= 0 && Q.length && g++ < 80) { const it = Q.shift(); wait = present(it.e, it.v) || 0; if (wait > 0) break; }
        const b = busy();
        if (b) wasBusy = true;
        else {
          if (wasBusy) { wasBusy = false; onIdle(); }
          drive(dt);
        }
      };
      const onIdle = () => {
        if (!M.V || scene !== 'game') return;
        hideBattleSoft();
        syncD(M.V);
        if (M.V.winner >= 0 || M.V.phase === 'over') { if (!M.overShown) { M.overShown = true; M.over = true; hud(); dock(); marks(); overPane(); } return; }
        refreshUI();
      };
      const hideBattleSoft = () => { if (bat && !bat.done) batSettle(); };

      const botDelay = ph => ({ claim: .32, cappick: .5, setup: .14, reinforce: .22, attack: .5, occupy: .12, fortify: .55 }[ph] || .3);
      const fallbackAct = p => {
        const s = M.eng.s, ph = s.phase;
        if (ph === 'claim') return { t: 'claim', to: s.owner.indexOf(-1) };
        if (ph === 'cappick') return { t: 'cap', to: s.owner.indexOf(p) };
        if (ph === 'setup') return { t: 'place', to: s.owner.indexOf(p), k: s.pool };
        if (ph === 'reinforce') {
          if (M.eng.must(p)) { const c = setsOf(s.hands[p])[0]; if (c) return { t: 'trade', c }; }
          return s.pool > 0 ? { t: 'place', to: s.owner.indexOf(p), k: s.pool } : { t: 'end' };
        }
        if (ph === 'occupy') return { t: 'occ', k: 0 };
        return { t: 'end' };
      };
      const drive = dt => {
        if (!M.eng || M.role === 'guest' || scene !== 'game' || M.over) return;
        const s = M.eng.s;
        if (s.phase === 'over') return;
        const p = s.turn;
        if (!M.cpu[p]) return;
        M.botWait -= dt;
        if (M.botWait > 0) return;
        M.botWait = botDelay(s.phase) * speedF();
        let a = null, ok = false;
        try { a = M.bots[p].think(p); ok = !!a && M.eng.act(p, a, a.stop); } catch (e) { console.error(e); }
        if (!ok) {
          if (++M.fail > 3) { const fb = fallbackAct(p); M.eng.act(p, fb); if (M.fail > 12) M.eng.act(p, { t: 'end' }); }
        } else M.fail = 0;
        flush();
      };

      const pushBatch = (es, v) => {
        M.V = v; M.awaiting = false;
        if (!es.length) { if (!busy()) { syncD(v); } refreshUI(); return; }
        es.forEach(e => Q.push({ e, v }));
        marks(); dock();
      };
      const flush = () => {
        const eng = M.eng, es = eng.drain();
        if (!es.length) return;
        const online = M.mode === 'online' && M.role === 'host';
        if (online) M.pids.forEach((id, q) => { if (id && q !== M.me && M.human[q]) api.net.sendTo(id, { t: 'ev', es: es.map(e => eng.filt(e, q)), v: eng.view(q) }); });
        pushBatch(es.map(e => eng.filt(e, M.me)), eng.view(M.me));
        if (online) saveHost();
      };
      const doAct = a => {
        if (M.role === 'guest') { api.net.send({ t: 'act', a }); M.awaiting = true; M.awaitT = 4; return true; }
        if (!M.eng || !M.eng.act(M.me, a)) { sfx('bad'); return false; }
        flush();
        return true;
      };

      const hostile = (V, t) => ADJ[t].some(x => V.owner[x] !== M.me && V.owner[x] >= 0);
      const doRoll = () => {
        const V = M.V, f = UI.from, t = UI.to;
        if (f < 0 || t < 0) return;
        const d = Math.min(UI.dice, V.armies[f] - 1);
        if (d >= 1) doAct({ t: 'atk', from: f, to: t, d });
      };
      const doBlitz = () => { if (UI.from >= 0 && UI.to >= 0) doAct({ t: 'blitz', from: UI.from, to: UI.to }); };
      const onTerr = t => {
        if (!myTurnNow()) return;
        keyChk();
        const V = M.V, me = M.me, ph = V.phase, o = V.owner[t];
        if (ph === 'claim') { if (o === -1) doAct({ t: 'claim', to: t }); else sfx('bad'); }
        else if (ph === 'cappick') { if (o === me) doAct({ t: 'cap', to: t }); else sfx('bad'); }
        else if (ph === 'setup' || ph === 'reinforce') {
          if (V.must || V.pool <= 0 || o !== me) { sfx('bad'); if (V.must) cardsPane(); return; }
          doAct({ t: 'place', to: t, k: UI.qty === 0 ? V.pool : Math.min(UI.qty, V.pool) });
        } else if (ph === 'attack') {
          if (o === me) {
            if (UI.from === t) UI.from = -1;
            else if (V.armies[t] >= 2 && hostile(V, t)) UI.from = t;
            else { sfx('bad'); return; }
            UI.to = -1; sfx('tap'); refreshUI();
          } else if (UI.from >= 0 && o >= 0 && ADJ[UI.from].includes(t)) {
            if (UI.to === t) doRoll(); else { UI.to = t; sfx('tap'); refreshUI(); }
          } else sfx('bad');
        } else if (ph === 'fortify') {
          if (UI.from < 0) {
            if (o === me && V.armies[t] >= 2 && reachOf(V.owner, me, t).size) { UI.from = t; UI.to = -1; sfx('tap'); refreshUI(); } else sfx('bad');
          } else if (t === UI.from) { UI.from = -1; UI.to = -1; refreshUI(); }
          else if (o === me && reachOf(V.owner, me, UI.from).has(t)) { UI.to = t; UI.mv = Math.max(1, Math.min(UI.mv, V.armies[UI.from] - 1)); sfx('tap'); refreshUI(); }
          else if (o === me && V.armies[t] >= 2 && reachOf(V.owner, me, t).size) { UI.from = t; UI.to = -1; sfx('tap'); refreshUI(); }
          else sfx('bad');
        }
      };

      const dockAct = (a, b) => {
        const V = M.V;
        if (a === 'cards') return cardsPane();
        if (a === 'menu') return menuPane();
        if (a === 'ff') { FF = !FF; return refreshUI(); }
        if (!myTurnNow()) return;
        keyChk();
        if (a === 'cancel') { UI.from = -1; UI.to = -1; refreshUI(); }
        else if (a === 'roll') doRoll();
        else if (a === 'blitz') doBlitz();
        else if (a === 'endatk') doAct({ t: 'endatk' });
        else if (a === 'endturn') doAct({ t: 'end' });
        else if (a === 'occ0') { UI.occ = 0; dock(); }
        else if (a === 'occh') { UI.occ = Math.ceil(V.occ.max / 2); dock(); }
        else if (a === 'occa') { UI.occ = V.occ.max; dock(); }
        else if (a === 'occ') doAct({ t: 'occ', k: UI.occ });
        else if (a === 'fort') doAct({ t: 'fort', from: UI.from, to: UI.to, k: UI.mv });
      };
      api.on(elDock, 'click', e => {
        audio();
        const q = e.target.closest('[data-q]'), d = e.target.closest('[data-d]'), b = e.target.closest('[data-a]');
        if (q) { UI.qty = +q.dataset.q; sfx('tap'); dock(); }
        else if (d && !d.disabled) { UI.dice = +d.dataset.d; sfx('tap'); dock(); }
        else if (b && !b.disabled) dockAct(b.dataset.a, b);
      });
      api.on(elDock, 'input', e => {
        const r = e.target;
        if (!r.dataset || !r.dataset.r) return;
        if (r.dataset.r === 'occ') UI.occ = +r.value; else UI.mv = +r.value;
        updSlider(r);
      });
      api.on($('.rk-top'), 'click', e => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        audio();
        if (b.dataset.a === 'side') elSide.classList.toggle('open');
        else if (b.dataset.a === 'menu') menuPane();
        else if (b.dataset.a === 'cards') cardsPane();
      });
      api.on(elConts, 'click', e => {
        const b = e.target.closest('[data-z]');
        if (!b) return;
        if (b.dataset.z === 'fit') fitMap(false); else zoomTo(CONT[+b.dataset.z].t);
      });
      const focusPlayer = e => {
        const r = e.target.closest('[data-p]');
        if (!r || !M.V) return;
        const p = +r.dataset.p, ts = [];
        for (let t = 0; t < 42; t++) if (D.owner[t] === p) ts.push(t);
        if (!ts.length) return;
        focT = new Set(ts); marks();
        later(1.6, () => { focT = new Set(); marks(); });
        if (PORT) elSide.classList.remove('open');
      };
      api.on(elPl, 'click', focusPlayer);
      api.on(elChips, 'click', focusPlayer);

      const ptr = new Map();
      let drag = null, pinch = null, moved = false;
      const rel = e => { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      api.on(svg, 'pointerdown', e => {
        audio();
        elSide.classList.remove('open');
        const p = rel(e);
        ptr.set(e.pointerId, { x: p.x, y: p.y });
        try { svg.setPointerCapture(e.pointerId); } catch (er) {}
        if (ptr.size === 1) { drag = { x: p.x, y: p.y, cx: camT.x, cy: camT.y }; moved = false; }
        else if (ptr.size === 2) {
          const [a, b] = [...ptr.values()];
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: camT.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, cx: camT.x, cy: camT.y };
          moved = true; drag = null;
        }
      });
      api.on(svg, 'pointermove', e => {
        const p = rel(e);
        if (ptr.has(e.pointerId)) {
          ptr.set(e.pointerId, { x: p.x, y: p.y });
          if (pinch && ptr.size >= 2) {
            const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const s = clamp(pinch.s * d / pinch.d, minS(), maxS()), k = s / pinch.s;
            camAuto = false;
            setCam({ s, x: mx - (pinch.mx - pinch.cx) * k, y: my - (pinch.my - pinch.cy) * k }, true);
          } else if (drag) {
            const dx = p.x - drag.x, dy = p.y - drag.y;
            if (!moved && Math.hypot(dx, dy) > 6) { moved = true; svg.classList.add('drag'); }
            if (moved) { camAuto = false; setCam({ s: camT.s, x: drag.cx + dx, y: drag.cy + dy }, true); }
          }
          elTip.hidden = true;
        } else if (e.pointerType === 'mouse') tip(e);
      });
      const endPtr = e => {
        if (!ptr.has(e.pointerId)) return;
        const wasTap = !moved && ptr.size === 1 && e.type === 'pointerup';
        ptr.delete(e.pointerId);
        if (ptr.size < 2) pinch = null;
        if (ptr.size === 0) { drag = null; svg.classList.remove('drag'); }
        else if (ptr.size === 1) { const [q] = [...ptr.values()]; drag = { x: q.x, y: q.y, cx: camT.x, cy: camT.y }; moved = true; }
        if (wasTap) {
          const el = document.elementFromPoint(e.clientX, e.clientY), tt = el && el.closest ? el.closest('[data-t]') : null;
          if (tt) onTerr(+tt.dataset.t);
        }
      };
      api.on(svg, 'pointerup', endPtr);
      api.on(svg, 'pointercancel', endPtr);
      api.on(svg, 'wheel', e => {
        e.preventDefault();
        const p = rel(e);
        zoomAt(p.x, p.y, Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0016)));
      }, { passive: false });
      api.on(svg, 'pointerleave', () => { elTip.hidden = true; });
      const tip = e => {
        const el = e.target.closest ? e.target.closest('[data-t]') : null;
        if (!el || scene !== 'game') { elTip.hidden = true; return; }
        const t = +el.dataset.t, o = D.owner[t], r = wrap.getBoundingClientRect();
        elTip.hidden = false;
        elTip.innerHTML = `<i style="background:${ownCol(o)}"></i>${esc(NAMES[t])}<small>${CONT[CI[t]].n} · ${o >= 0 ? esc(nameOf(o)) + ' · ' + D.armies[t] + ' armies' : 'Unclaimed'}</small>`;
        elTip.style.left = Math.min(e.clientX - r.left, WW - 200) + 'px'; elTip.style.top = Math.min(e.clientY - r.top, HH - 70) + 'px';
      };

      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tg = e.target;
        if (tg && (tg.tagName === 'INPUT' && tg.type !== 'range' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
        const k = e.key.toLowerCase();
        if (paneK) {
          if (paneK === 'cards' && k === 'c') { UI.sel = []; hidePane(); refreshUI(); }
          return;
        }
        if (scene !== 'game') return;
        const V = M.V;
        const step = 60;
        if (k === 'f') fitMap(false);
        else if (k === '+' || k === '=') zoomAt(WW / 2, HH / 2, 1.3);
        else if (k === '-' || k === '_') zoomAt(WW / 2, HH / 2, 1 / 1.3);
        else if (k === 'arrowleft') { camAuto = false; setCam({ s: camT.s, x: camT.x + step, y: camT.y }, false); }
        else if (k === 'arrowright') { camAuto = false; setCam({ s: camT.s, x: camT.x - step, y: camT.y }, false); }
        else if (k === 'arrowup') { camAuto = false; setCam({ s: camT.s, x: camT.x, y: camT.y + step }, false); }
        else if (k === 'arrowdown') { camAuto = false; setCam({ s: camT.s, x: camT.x, y: camT.y - step }, false); }
        else if (k === 'c') { cardsPane(); }
        else if (!myTurnNow() || !V) return;
        else if (k === 'r') doRoll();
        else if (k === 'b') doBlitz();
        else if (k === 'e') { if (V.phase === 'attack' && UI.from < 0) doAct({ t: 'endatk' }); else if (V.phase === 'attack' || V.phase === 'fortify') doAct({ t: 'end' }); }
        else if (k === '1' || k === '2' || k === '3') { UI.dice = +k; dock(); }
        else if (k === ' ' || k === 'enter') { const p = elDock.querySelector('.rk-b.pri'); if (p) { p.click(); e.preventDefault(); } }
        else return;
        if (k === ' ' || k.startsWith('arrow')) e.preventDefault();
      });

      const resetView = () => {
        Q = []; T = []; wait = 0; FF = false; wasBusy = false; lastLog = null; bat = null; battleT = 0; focT = new Set();
        D.owner.fill(-1); D.armies.fill(0); D.phase = 'init'; D.turn = -1; D.pool = 0; D.caps = [];
        UI.from = -1; UI.to = -1; UI.qty = 1; UI.dice = 3; UI.occ = 0; UI.mv = 1; UI.sel = []; UI.lastKey = '';
        M.V = null; M.over = false; M.overShown = false; M.fail = 0; M.botWait = .5; M.awaiting = false;
        elLog.innerHTML = ''; gFx.innerHTML = ''; arrowEl = null; elBattle.hidden = true; elBan.hidden = true; elSide.classList.remove('open');
      };
      const demoMap = () => {
        resetView();
        M.n = 4; M.me = 0; M.cols = COLORS.slice(0, 4); M.names = ['A', 'B', 'C', 'D']; M.neutralId = -9;
        setGrads();
        for (let t = 0; t < 42; t++) { D.owner[t] = (t * 7 + (t >> 2)) % 4; D.armies[t] = 1 + ((t * 5) % 9); }
        paint(); hud(); dock(); marks();
      };
      const showTitle = () => {
        scene = 'title'; M.mode = 'solo'; M.role = 'local'; M.eng = null;
        demoMap();
        showPane('title', titleHtml(), titleFn);
      };
      const titleFn = a => {
        if (a === 'play') setupPane(false);
        else if (a === 'online') setupPane(true);
        else if (a === 'rules') showPane('rules', RULES, () => showTitle());
      };
      const setupPane = online => {
        const keep = pane.scrollTop;
        showPane('setup', setupHtml(online), (a, b) => {
          if (b.dataset.o) {
            const k = b.dataset.o, v = b.dataset.v;
            opt[k] = ['n', 'diff', 'speed', 'color'].includes(k) ? +v : v;
            saveAll(); sfx('tap'); setupPane(online);
            return;
          }
          if (a === 'start') { if (online) startOnline(); else newSolo(); }
          else if (a === 'back') { if (scene === 'game') menuPane(); else showTitle(); }
        });
        pane.scrollTop = keep;
      };

      const palette = () => [COLORS[opt.color]].concat(COLORS.filter((c, i) => i !== opt.color));
      const startGame = (cfg, state) => {
        M.tok++;
        resetView();
        Object.assign(M, { n: cfg.n, names: cfg.names, cols: cfg.cols, cpu: cfg.cpu, human: cfg.human, lvl: cfg.lvl, pids: cfg.pids || [], me: cfg.me || 0 });
        scene = 'game'; hidePane();
        M.eng = Engine({ n: cfg.n, mode: opt.mode, claim: opt.claim, state });
        M.neutralId = M.eng.NB;
        M.bots = cfg.cpu.map((c, p) => c ? Bot(M.eng, M.lvl[p]) : null);
        setGrads(); paint(); fitMap(true);
        elLog.innerHTML = '';
        logLine(`${MODES[opt.mode]} · ${cfg.n} players` + (opt.claim === 'draft' ? ' · draft' : ''), 'turn');
        if (state) { M.V = M.eng.view(M.me); syncD(M.V); refreshUI(); return; }
        if (M.mode === 'online' && M.role === 'host') sendSetups();
        flush();
        hud();
      };
      const newSolo = () => {
        const n = opt.n, cols = palette().slice(0, n), pool = BOT_NAMES.slice().sort(() => Math.random() - .5);
        M.mode = 'solo'; M.role = 'local';
        startGame({ n, names: ['You'].concat(Array.from({ length: n - 1 }, () => pool.pop())), cols, cpu: Array.from({ length: n }, (_, i) => i > 0), human: Array.from({ length: n }, (_, i) => i === 0), lvl: Array(n).fill(opt.diff) });
      };

      const saveHost = () => {
        try {
          if (!api.net.code || !M.eng) return;
          const pn = M.pids.map(id => { const p = id && api.net.players.find(x => x.id === id); return p ? p.name : null; });
          sessionStorage.setItem('gameplay:risk:' + api.net.code, JSON.stringify({ s: M.eng.s, n: M.n, names: M.names, cols: M.cols, cpu: M.cpu, human: M.human, lvl: M.lvl, pn, mode: opt.mode, claim: opt.claim }));
        } catch (e) {}
      };
      const loadHost = () => { try { return JSON.parse(sessionStorage.getItem('gameplay:risk:' + api.net.code)); } catch (e) { return null; } };
      const seatSetup = (q, id) => ({ t: 'setup', n: M.n, seat: q, names: M.names, cols: M.cols, cpu: M.cpu, human: M.human, mode: opt.mode, claim: opt.claim });
      const sendSetups = () => { M.pids.forEach((id, q) => { if (id && q !== M.me && M.human[q]) api.net.sendTo(id, seatSetup(q, id)); }); };
      const sendSync = id => {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(id);
        if (q < 0 || !M.human[q]) return;
        api.net.sendTo(id, seatSetup(q, id));
        api.net.sendTo(id, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 });
      };
      const seatToCpu = id => {
        const q = M.pids.indexOf(id);
        if (q < 0 || M.role !== 'host' || !M.eng) return;
        const who = M.names[q];
        M.pids[q] = null; M.human[q] = false; M.cpu[q] = true; M.names[q] = who + ' (bot)'; M.bots[q] = Bot(M.eng, opt.diff);
        api.net.send({ t: 'seats', cpu: M.cpu, human: M.human, names: M.names });
        api.toast(who + ' left. A bot takes the seat.');
        logLine(`${esc(who)} left the game. A bot takes over.`);
        hud();
      };
      const hostStart = saved => {
        const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
        M.players = live;
        const k = Math.min(6, live.length);
        const n = clamp(M.withBots ? Math.max(k, M.size || k) : k, 2, 6);
        const pool = BOT_NAMES.slice().sort(() => Math.random() - .5), cfg = { n, names: [], cpu: [], human: [], pids: [], lvl: [], cols: COLORS.slice(0, n), me: 0 };
        for (let q = 0; q < n; q++) {
          const pl = live[q];
          cfg.human[q] = !!pl; cfg.cpu[q] = !pl; cfg.pids[q] = pl ? pl.id : null; cfg.names[q] = pl ? pl.name : pool.pop(); cfg.lvl[q] = opt.diff;
        }
        M.mode = 'online'; M.role = 'host';
        if (saved) {
          opt.mode = saved.mode; opt.claim = saved.claim;
          for (let q = 0; q < saved.n; q++) {
            cfg.cols[q] = saved.cols[q]; cfg.names[q] = saved.names[q]; cfg.lvl[q] = saved.lvl[q];
            if (q === 0) { cfg.human[0] = true; cfg.cpu[0] = false; cfg.pids[0] = live[0].id; continue; }
            const pl = saved.human[q] && live.find((x, i) => i > 0 && x.name === saved.pn[q] && !cfg.pids.slice(0, q).includes(x.id));
            cfg.human[q] = !!pl; cfg.cpu[q] = !pl; cfg.pids[q] = pl ? pl.id : null;
            if (!pl && saved.human[q]) cfg.names[q] = saved.names[q] + ' (bot)';
          }
          cfg.n = saved.n; cfg.cols.length = cfg.names.length = cfg.cpu.length = cfg.human.length = cfg.pids.length = cfg.lvl.length = saved.n;
          startGame(cfg, saved.s);
          sendSetups();
          M.pids.forEach((id, q) => { if (id && q !== M.me) api.net.sendTo(id, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 }); });
          return;
        }
        startGame(cfg);
      };
      const rematch = () => { if (M.role === 'host') hostStart(); };
      const leaveOnline = () => { M.tok++; try { api.net.close(); } catch (e) {} M.mode = 'solo'; M.role = 'local'; M.eng = null; M.pids = []; M.players = []; };
      const quitToTitle = () => { if (M.mode === 'online') leaveOnline(); showTitle(); };

      const hookNet = () => {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToCpu(p.id); });
        api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || M.role !== 'guest') return;
          M.tok++; M.role = 'local'; M.eng = null; scene = 'left';
          sfx('lose');
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
          showPane('left', `<div class="rk-box"><p class="rk-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="rk-big c" data-a="room">Online lobby</button><button class="rk-big a" data-a="solo">Play vs bots</button></div>`, a => {
            if (a === 'room') startOnline(); else { try { api.net.close(); } catch (e) {} showTitle(); }
          });
        });
        api.interval(() => {
          const on = M.mode === 'online' && (scene === 'game' || scene === 'left') && M.role !== 'local';
          elNet.hidden = !on;
          if (!on) return;
          const ok = api.net.connected, hn = M.pids.filter((id, q) => id && q !== M.me && M.human[q]).length;
          elNet.classList.toggle('bad', !ok);
          elNet.lastChild.textContent = !ok ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      };
      const startOnline = async () => {
        M.tok++; const tok = M.tok;
        const inv = api.net.invite;
        hookNet();
        hidePane(); scene = 'title'; M.mode = 'online'; M.role = null; M.eng = null;
        if (!M.V) demoMap();
        const r = await api.net.room({ title: 'Risk', sizes: [2, 3, 4, 5, 6], defaultSize: 4, min: 2, max: 6, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'solo'; M.role = 'local'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, 6); M.withBots = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') {
          const sv = inv === 'NEW' ? loadHost() : null;
          if (sv && sv.s && sv.s.phase !== 'over') {
            showPane('resume', `<div class="rk-box"><p class="rk-kick">Online</p><h3>Resume game?</h3><p>Your last game in this party is still saved.</p><button class="rk-big c" data-a="resume">Resume game</button><button class="rk-big d" data-a="new">New game</button></div>`, a => { if (a === 'resume') hostStart(sv); else hostStart(); });
          } else hostStart();
        } else showPane('wait', '<div class="rk-box"><p class="rk-kick">Online</p><h3>Connected</h3><p>Waiting for the host to start the game…</p><button class="rk-big d" data-a="leave">Leave</button></div>', a => { if (a === 'leave') quitToTitle(); });
      };
      const onData = (d, from) => {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng) return;
          const q = M.pids.indexOf(from);
          if (q < 0 || q === M.me || !M.human[q]) return;
          if (d.t === 'act' && d.a && typeof d.a === 'object') {
            const a = { t: d.a.t, from: d.a.from, to: d.a.to, k: d.a.k, d: d.a.d, c: d.a.c, bt: d.a.bt };
            if (M.eng.act(q, a)) flush(); else api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(q) });
          }
          return;
        }
        if (d.t === 'setup') {
          M.tok++;
          resetView();
          M.mode = 'online'; M.role = 'guest'; M.me = d.seat; M.n = d.n; M.names = d.names; M.cols = d.cols; M.cpu = d.cpu; M.human = d.human;
          opt.mode = d.mode; opt.claim = d.claim;
          M.neutralId = d.n === 2 ? 2 : -9;
          scene = 'game'; hidePane(); setGrads(); paint(); fitMap(true); hud();
          logLine(`${MODES[d.mode]} · ${d.n} players`, 'turn');
        } else if (M.role !== 'guest') return;
        else if (d.t === 'ev') {
          if (d.sync) { M.V = d.v; Q = []; syncD(d.v); M.awaiting = false; refreshUI(); }
          else pushBatch(d.es, d.v);
        } else if (d.t === 'seats') { M.cpu = d.cpu; M.human = d.human; M.names = d.names; hud(); }
      };

      api.loop(dt => tick(dt));
      api.interval(() => { if (document.hidden) tick(.25); }, 250);
      const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => layout()) : null;
      if (ro) { ro.observe(root); ro.observe(wrap); }
      api.on(window, 'resize', layout);
      layout();
      root._rk = { M, D, UI, ADJ, get Q() { return Q; }, get V() { return M.V; }, doAct, onTerr, cam, camT, busy, myTurnNow, tick, opt, pane: () => paneK, get scene() { return scene; }, setFF(v) { FF = v; }, newSolo, startOnline, svg, PT, ownCol, startGame, autoThink: (p, l) => Bot(M.eng, l == null ? 1 : l).think(p) };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; if (ro) ro.disconnect(); try { if (ac) ac.close(); } catch (e) {} } };
    }
  });

  Ameplay.covers.risk = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="rkc-g" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#2d7cb0"/><stop offset="1" stop-color="#0c3050"/></radialGradient></defs><rect width="400" height="300" fill="url(#rkc-g)"/><g transform="translate(6 44) scale(.385)" stroke="#1a1204" stroke-width="3" stroke-linejoin="round">${PATHS.map((d, t) => `<path d="${d}" fill="${['#e0443a', '#3b7ddd', '#43b05c', '#f0c23b'][(t * 7 + (t >> 2)) % 4]}"/>`).join('')}</g><text x="200" y="36" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-style="italic" font-size="34" letter-spacing="4" fill="#ffe27a" stroke="#7a1a10" stroke-width="1.5">RISK</text></svg>`;

})();
