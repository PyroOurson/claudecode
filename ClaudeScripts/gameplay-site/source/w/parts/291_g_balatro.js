(() => {
  'use strict';

  const SN = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];
  const SG = ['♠', '♥', '♣', '♦'];
  const SCOL = ['#38466a', '#e0453a', '#2f8a6a', '#e98a2e'];
  const RL = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const RNAME = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];
  const rlab = r => RL[r - 2];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const cn = c => c.e === 'stone' ? 'Stone Card' : RNAME[c.r - 2] + ' of ' + SN[c.s];
  const chipVal = c => c.e === 'stone' ? 0 : c.r === 14 ? 11 : c.r >= 11 ? 10 : c.r;

  let RS = 1;
  const rnd = () => {
    RS = (RS + 0x6D2B79F5) | 0;
    let t = Math.imul(RS ^ RS >>> 15, 1 | RS);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const rint = n => Math.floor(rnd() * n);
  const pick = a => a[rint(a.length)];
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const mulb = a => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  const HAND = {
    flush5: { n: 'Flush Five', c: 160, m: 16, lc: 50, lm: 3, pl: 'Eris', sec: 1 },
    flushh: { n: 'Flush House', c: 140, m: 14, lc: 40, lm: 4, pl: 'Ceres', sec: 1 },
    five: { n: 'Five of a Kind', c: 120, m: 12, lc: 35, lm: 3, pl: 'Planet X', sec: 1 },
    sflush: { n: 'Straight Flush', c: 100, m: 8, lc: 40, lm: 4, pl: 'Neptune' },
    four: { n: 'Four of a Kind', c: 60, m: 7, lc: 30, lm: 3, pl: 'Mars' },
    fh: { n: 'Full House', c: 40, m: 4, lc: 25, lm: 2, pl: 'Earth' },
    flush: { n: 'Flush', c: 35, m: 4, lc: 15, lm: 2, pl: 'Jupiter' },
    straight: { n: 'Straight', c: 30, m: 4, lc: 30, lm: 3, pl: 'Saturn' },
    three: { n: 'Three of a Kind', c: 30, m: 3, lc: 20, lm: 2, pl: 'Venus' },
    two: { n: 'Two Pair', c: 20, m: 2, lc: 20, lm: 1, pl: 'Uranus' },
    pair: { n: 'Pair', c: 10, m: 2, lc: 15, lm: 1, pl: 'Mercury' },
    high: { n: 'High Card', c: 5, m: 1, lc: 10, lm: 1, pl: 'Pluto' }
  };
  const HORD = ['flush5', 'flushh', 'five', 'sflush', 'four', 'fh', 'flush', 'straight', 'three', 'two', 'pair', 'high'];

  const suitMatch = (c, s, fl) => c.e === 'wild' ? true : fl.smear ? c.s % 2 === s % 2 : c.s === s;
  function flushOf(cs, fl) {
    const need = fl.four ? 4 : 5;
    if (cs.length < need) return null;
    for (let s = 0; s < 4; s++) {
      const t = cs.filter(c => c.e !== 'stone' && suitMatch(c, s, fl));
      if (t.length >= need) return t;
    }
    return null;
  }
  function straightOf(cs, fl) {
    const need = fl.four ? 4 : 5, gap = fl.short ? 2 : 1, by = new Map();
    cs.forEach(c => {
      if (c.e === 'stone') return;
      (c.r === 14 ? [14, 1] : [c.r]).forEach(r => { if (!by.has(r)) by.set(r, c); });
    });
    const rs = [...by.keys()].sort((a, b) => a - b);
    let best = null, cur = [];
    for (const r of rs) {
      if (cur.length && r - cur[cur.length - 1] <= gap) cur.push(r); else cur = [r];
      if (cur.length >= need && (!best || cur.length > best.length)) best = cur.slice();
    }
    if (!best) return null;
    const set = new Set();
    best.forEach(r => set.add(by.get(r)));
    return [...set];
  }
  function evalHand(cs, fl) {
    fl = fl || {};
    const ranked = cs.filter(c => c.e !== 'stone'), by = {};
    ranked.forEach(c => (by[c.r] = by[c.r] || []).push(c));
    const groups = Object.values(by).sort((a, b) => b.length - a.length || b[0].r - a[0].r);
    const n1 = groups.length ? groups[0].length : 0;
    const pairs = groups.filter(g => g.length >= 2).length;
    const fh = n1 >= 3 && groups.length >= 2 && groups[1].length >= 2;
    const f = flushOf(cs, fl), s = straightOf(cs, fl);
    let id, sc;
    if (n1 >= 5 && f) { id = 'flush5'; sc = groups[0].slice(0, 5); }
    else if (fh && f) { id = 'flushh'; sc = groups[0].slice(0, 3).concat(groups[1].slice(0, 2)); }
    else if (n1 >= 5) { id = 'five'; sc = groups[0].slice(0, 5); }
    else if (s && f) { id = 'sflush'; sc = s; }
    else if (n1 >= 4) { id = 'four'; sc = groups[0].slice(0, 4); }
    else if (fh) { id = 'fh'; sc = groups[0].slice(0, 3).concat(groups[1].slice(0, 2)); }
    else if (f) { id = 'flush'; sc = f; }
    else if (s) { id = 'straight'; sc = s; }
    else if (n1 >= 3) { id = 'three'; sc = groups[0].slice(0, 3); }
    else if (pairs >= 2) { id = 'two'; sc = groups.filter(g => g.length >= 2).slice(0, 2).reduce((a, g) => a.concat(g.slice(0, 2)), []); }
    else if (pairs === 1) { id = 'pair'; sc = groups[0].slice(0, 2); }
    else {
      id = 'high';
      let b = null;
      ranked.forEach(c => { if (!b || c.r > b.r) b = c; });
      sc = b ? [b] : [];
    }
    cs.forEach(c => { if (c.e === 'stone' && sc.indexOf(c) < 0) sc.push(c); });
    if (fl.splash) sc = cs.slice();
    sc = cs.filter(c => sc.indexOf(c) >= 0);
    return {
      id, sc,
      has: { pair: n1 >= 2, two: pairs >= 2, three: n1 >= 3, four: n1 >= 4, five: n1 >= 5, fh, flush: !!f, straight: !!s, sflush: !!(s && f) }
    };
  }

  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
  const px = (x, a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const hex2 = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const toHex = a => '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  const sh = (h, k) => toHex(hex2(h).map(v => v * k));
  const mix = (a, b, t) => { const p = hex2(a), q = hex2(b); return toHex(p.map((v, i) => v + (q[i] - v) * t)); };
  function spr(x, S, a, b, col, k = 1, flip = false) {
    const n = S.length;
    for (let j = 0; j < n; j++) {
      const row = S[flip ? n - 1 - j : j];
      for (let i = 0; i < row.length; i++) if (row[i] === '1') px(x, a + i * k, b + j * k, k, k, col);
    }
  }
  function disc(x, cx, cy, r, col) {
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.floor(Math.sqrt(r * r - dy * dy + r * .6));
      px(x, cx - w, cy + dy, w * 2 + 1, 1, col);
    }
  }
  function ell(x, cx, cy, rx, ry, col) {
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - dy * dy / (ry * ry + .5))) + .5);
      px(x, cx - w, cy + dy, w * 2 + 1, 1, col);
    }
  }
  function line(x, x0, y0, x1, y1, col, t = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (let n = 0; n < 400; n++) {
      px(x, x0, y0, t, t, col);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }
  function rrect(x, a, b, w, h, col, r = 2) {
    px(x, a + r, b, w - 2 * r, h, col);
    px(x, a, b + r, w, h - 2 * r, col);
    if (r > 1) { px(x, a + 1, b + 1, w - 2, h - 2, col); }
  }

  const FONT = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    A: ['00100', '01010', '10001', '10001', '11111', '10001', '10001'],
    J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001']
  };
  const SUIT9 = [
    ['000010000', '000111000', '001111100', '011111110', '111111111', '111111111', '011101110', '000010000', '001111100'],
    ['011000110', '111101111', '111111111', '111111111', '111111111', '011111110', '001111100', '000111000', '000010000'],
    ['001111100', '011111110', '011111110', '001111100', '110111011', '111111111', '110111011', '000111000', '001111100'],
    ['000010000', '000111000', '001111100', '011111110', '111111111', '011111110', '001111100', '000111000', '000010000']
  ];
  const SYM = {
    coin: ['001111100', '011000110', '110011011', '110111011', '110111011', '110011011', '011000110', '001111100', '000000000'],
    star: ['000010000', '000010000', '000111000', '111111111', '011111110', '001111100', '011101110', '010000010', '000000000'],
    dice: ['111111111', '100000001', '101000101', '100000001', '100010001', '100000001', '101000101', '100000001', '111111111'],
    ex: ['110000011', '111000111', '011101110', '001111100', '000111000', '001111100', '011101110', '111000111', '110000011'],
    plus: ['000111000', '000111000', '000111000', '111111111', '111111111', '111111111', '000111000', '000111000', '000111000'],
    clock: ['001111100', '010010010', '100010001', '100010001', '100011111', '100000001', '010000010', '001111100', '000000000'],
    skull: ['001111100', '011111110', '110111011', '110111011', '011111110', '001111100', '001010100', '001111100', '000000000'],
    gem: ['001111100', '011111110', '111111111', '011111110', '001111100', '000111000', '000010000', '000000000', '000000000']
  };
  const SYMK = Object.keys(SYM);

  function drawGlyph(x, ch, a, b, k, col) {
    spr(x, FONT[ch], a, b, col, k);
  }
  function drawRank(x, r, a, b, k, col) {
    const s = rlab(r);
    let ax = a;
    for (const ch of s) { drawGlyph(x, ch, ax, b, k, col); ax += 6 * k - (s.length > 1 ? 1 : 0); }
  }

  const PIPS = {
    2: [[0, 0], [0, 1]], 3: [[0, 0], [0, .5], [0, 1]],
    4: [[-1, 0], [1, 0], [-1, 1], [1, 1]],
    5: [[-1, 0], [1, 0], [-1, 1], [1, 1], [0, .5]],
    6: [[-1, 0], [1, 0], [-1, .5], [1, .5], [-1, 1], [1, 1]],
    7: [[-1, 0], [1, 0], [-1, .5], [1, .5], [-1, 1], [1, 1], [0, .25]],
    8: [[-1, 0], [1, 0], [-1, .5], [1, .5], [-1, 1], [1, 1], [0, .25], [0, .75]],
    9: [[-1, 0], [1, 0], [-1, 1 / 3], [1, 1 / 3], [-1, 2 / 3], [1, 2 / 3], [-1, 1], [1, 1], [0, .5]],
    10: [[-1, 0], [1, 0], [-1, 1 / 3], [1, 1 / 3], [-1, 2 / 3], [1, 2 / 3], [-1, 1], [1, 1], [0, 1 / 6], [0, 5 / 6]]
  };

  const ENH = {
    bonus: ['#cfe3fb', '#94b8ea'], mult: ['#f8cccc', '#e99494'], wild: ['#f8cccc', '#c9eab0'],
    glass: ['#dcf4ff', '#ffffff'], steel: ['#bcc5d2', '#8d98a8'], stone: ['#8d8d95', '#6f6f78'],
    gold: ['#f4d66e', '#e0b23c'], lucky: ['#c1e9b6', '#8fcf86']
  };
  const SEALC = { gold: '#f6c445', red: '#e5483d', blue: '#3d8be0', purple: '#9a4bd6' };

  function drawFigure(x, r, s) {
    const col = SCOL[s], lt = mix(col, '#ffffff', .55), skin = '#f1c79b', gold = '#f2c744', dk = '#2a2f38';
    px(x, 17, 21, 37, 53, dk);
    px(x, 18, 22, 35, 51, mix(col, '#f6f1e4', .78));
    const cx = 35;
    if (r === 11) {
      px(x, cx - 9, 50, 18, 22, col); px(x, cx - 9, 50, 18, 2, dk);
      line(x, cx - 9, 52, cx + 8, 70, lt, 3);
      px(x, cx - 7, 37, 14, 14, skin); px(x, cx - 7, 43, 14, 8, skin);
      px(x, cx - 4, 42, 2, 2, dk); px(x, cx + 3, 42, 2, 2, dk); px(x, cx - 2, 47, 5, 1, '#b45a4a');
      px(x, cx - 10, 33, 20, 6, col); px(x, cx - 10, 38, 22, 2, dk);
      px(x, cx + 4, 25, 3, 9, '#f6f1e4'); px(x, cx + 6, 22, 3, 7, gold);
      px(x, cx - 15, 56, 7, 6, skin);
    } else if (r === 12) {
      px(x, cx - 12, 30, 24, 28, '#8a4f26'); px(x, cx - 7, 37, 14, 14, skin);
      px(x, cx - 4, 42, 2, 2, dk); px(x, cx + 3, 42, 2, 2, dk); px(x, cx - 2, 47, 5, 1, '#c24a4a');
      px(x, cx - 9, 28, 18, 3, gold); px(x, cx - 9, 24, 3, 5, gold); px(x, cx - 1, 22, 3, 7, gold); px(x, cx + 6, 24, 3, 5, gold);
      px(x, cx - 11, 52, 22, 21, col); px(x, cx - 7, 52, 14, 4, skin);
      disc(x, cx, 66, 3, lt);
    } else {
      px(x, cx - 11, 52, 22, 21, col); px(x, cx - 11, 52, 22, 4, '#f6f1e4'); px(x, cx - 7, 51, 14, 3, '#f6f1e4');
      px(x, cx - 8, 36, 16, 17, skin);
      px(x, cx - 9, 44, 18, 10, '#d8d2c4'); px(x, cx - 5, 41, 10, 3, skin);
      px(x, cx - 5, 40, 2, 2, dk); px(x, cx + 3, 40, 2, 2, dk);
      px(x, cx - 10, 30, 20, 5, gold); px(x, cx - 10, 24, 4, 7, gold); px(x, cx - 2, 22, 4, 9, gold); px(x, cx + 6, 24, 4, 7, gold);
      px(x, cx - 10, 34, 20, 1, dk);
      line(x, cx + 14, 56, cx + 14, 70, gold, 2); disc(x, cx + 14, 54, 3, SCOL[s]);
    }
    spr(x, SUIT9[s], cx - 4, 62, '#ffffff', 1); spr(x, SUIT9[s], cx - 4, 62, SCOL[s], 1);
  }

  const cardCache = new Map();
  function cardFrame(x, bg, bd) {
    px(x, 0, 0, 71, 95, 'rgba(0,0,0,0)');
    px(x, 2, 0, 67, 95, bd); px(x, 0, 2, 71, 91, bd); px(x, 1, 1, 69, 93, bd);
    px(x, 2, 1, 67, 93, bg); px(x, 1, 2, 69, 91, bg);
  }
  function backArt(key) {
    const k = 'b' + key;
    if (cardCache.has(k)) return cardCache.get(k);
    const [c, x] = mkc(71, 95), p = BACKS[key] || BACKS.red;
    cardFrame(x, p[0], '#20242c');
    px(x, 4, 4, 63, 87, p[1]);
    for (let yy = 0; yy < 29; yy++) for (let xx = 0; xx < 21; xx++) {
      if ((xx + yy) % 2 === 0) px(x, 5 + xx * 3, 5 + yy * 3 - 0, 3, 3, p[2]);
    }
    px(x, 9, 9, 53, 77, p[1]); px(x, 11, 11, 49, 73, p[0]);
    px(x, 13, 13, 45, 69, p[1]);
    disc(x, 35, 47, 14, p[0]); disc(x, 35, 47, 10, p[2]); disc(x, 35, 47, 6, p[0]);
    px(x, 33, 45, 5, 5, p[1]);
    cardCache.set(k, c);
    return c;
  }
  const BACKS = {
    red: ['#e7d7c6', '#c3402f', '#e86a54'], blue: ['#dbe6f0', '#2f6fc4', '#5d96e6'], yellow: ['#f2e6c2', '#d6a722', '#f2cc55'],
    green: ['#d6e8d2', '#2f9a52', '#5cc67e'], black: ['#cfcfd8', '#2e2e3a', '#5a5a6e'], magic: ['#e6d4ee', '#7a3fa8', '#a96fd6'],
    nebula: ['#d0dcee', '#2a3f8e', '#5c78d0'], ghost: ['#e4e4ee', '#6b6f8a', '#a2a6c4'], abandoned: ['#e4d9c6', '#7a5e3a', '#a9885c'],
    checkered: ['#eddede', '#8a2c3c', '#2c3c8a'], zodiac: ['#f0e0c6', '#a2562c', '#d68a4c'], painted: ['#f0d8e0', '#c23a7a', '#3a9ac2'],
    anaglyph: ['#e0e0e0', '#c23a3a', '#3ac2c2'], plasma: ['#e4d6f0', '#c23ac2', '#3a9ac2'], erratic: ['#e0e8d8', '#6a8a2c', '#c26a2c']
  };

  function playArt(c) {
    const k = 'p' + c.r + '_' + c.s + '_' + (c.e || '') + '_' + (c.z || '');
    if (cardCache.has(k)) return cardCache.get(k);
    const [cv, x] = mkc(71, 95), en = ENH[c.e] || ['#f4f0e6', '#e2dccb'];
    cardFrame(x, en[0], '#20242c');
    px(x, 2, 80, 67, 13, en[1]);
    px(x, 2, 2, 67, 1, mix(en[0], '#ffffff', .6));
    if (c.e === 'bonus') { for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) px(x, 6 + i * 10, 6 + j * 11, 2, 2, en[1]); }
    else if (c.e === 'mult') { for (let i = -8; i < 14; i++) line(x, 3 + i * 6, 3, 3 + i * 6 + 90, 93, 'rgba(226,120,120,.45)', 1); }
    else if (c.e === 'wild') { ['#f8cccc', '#fbe3b5', '#c9eab0', '#b5dcf5', '#d8c4f2'].forEach((cl, i) => px(x, 2 + i * 14, 2, i === 4 ? 13 : 14, 91, cl)); }
    else if (c.e === 'glass') { for (let i = 0; i < 5; i++) line(x, 4 + i * 16, 4, 4 + i * 16 - 18, 40, 'rgba(255,255,255,.85)', 2); px(x, 2, 2, 67, 91, 'rgba(120,200,240,.18)'); }
    else if (c.e === 'steel') { for (let i = 0; i < 12; i++) px(x, 2, 4 + i * 8, 67, 2, 'rgba(255,255,255,.35)'); [[5, 5], [63, 5], [5, 87], [63, 87]].forEach(p => disc(x, p[0], p[1], 1, '#6a7482')); }
    else if (c.e === 'stone') { const r = mulb(7 + c.id % 5); for (let i = 0; i < 90; i++) px(x, 3 + Math.floor(r() * 63), 3 + Math.floor(r() * 88), 2 + Math.floor(r() * 3), 2, r() > .5 ? '#a6a6ae' : '#5e5e66'); }
    else if (c.e === 'gold') { for (let i = 0; i < 9; i++) spr(x, ['010', '111', '010'], 6 + (i % 3) * 25 + (i * 7) % 9, 8 + Math.floor(i / 3) * 29 + (i * 5) % 7, '#fff0a0', 1); }
    else if (c.e === 'lucky') { for (let i = 0; i < 12; i++) disc(x, 8 + (i % 4) * 18, 10 + Math.floor(i / 4) * 30, 2, '#6fb86a'); }
    if (c.e !== 'stone') {
      const col = SCOL[c.s];
      if (c.r >= 11 && c.r <= 13) drawFigure(x, c.r, c.s);
      else if (c.r === 14) { for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) if (SUIT9[c.s][j][i] === '1') px(x, 22 + i * 3, 33 + j * 3, 3, 3, col); }
      else {
        PIPS[c.r].forEach(p => {
          const sx = 35 - 4 + p[0] * 14, sy = 27 + p[1] * 40;
          spr(x, SUIT9[c.s], sx, sy, col, 1, p[1] > .5);
        });
      }
      drawRank(x, c.r, 5, 5, 2, col);
      spr(x, SUIT9[c.s], 7, 21, col, 1);
    } else {
      px(x, 14, 30, 43, 35, 'rgba(40,40,48,.35)');
      line(x, 16, 32, 54, 62, 'rgba(255,255,255,.25)', 2);
    }
    if (c.z) { const sc = SEALC[c.z]; disc(x, 58, 84, 5, '#20242c'); disc(x, 58, 84, 4, sc); px(x, 57, 82, 2, 2, '#ffffff'); }
    cardCache.set(k, cv);
    return cv;
  }

  const JBG = [['#2d3a8c', '#6a4fd6'], ['#8c2d4a', '#e2573d'], ['#1f6b5e', '#4cc79a'], ['#7a5a1f', '#e8b83d'], ['#3b2d6e', '#c05bd0'], ['#1f5f8c', '#58b8e8'], ['#5e2d2d', '#d87a4a'], ['#2d6e3b', '#a8d84a'], ['#4a2d6e', '#e870a8'], ['#23485e', '#7ad8c8']];
  const JBODY = ['#f2c14e', '#e8574a', '#58b8e8', '#8fd66b', '#c985e6', '#f29a4e', '#ecebf2', '#f08fb0', '#7be0c4', '#b0a0f0'];
  const RARC = ['', '#8fb2e8', '#6fcf86', '#f06a5a', '#c58aff'];

  function jokerArt(def) {
    const k = 'j' + def.k;
    if (cardCache.has(k)) return cardCache.get(k);
    const [cv, x] = mkc(71, 95), h = hashStr(def.k), R = mulb(h);
    const pal = JBG[R() * JBG.length | 0], body = JBODY[R() * JBODY.length | 0], dk = '#1c1f2a';
    cardFrame(x, '#f2ecdc', '#20242c');
    px(x, 3, 3, 65, 89, RARC[def.r] || '#8fb2e8');
    px(x, 4, 4, 63, 87, pal[0]);
    for (let yy = 0; yy < 87; yy++) {
      const t = yy / 86, q = Math.round(t * 5) / 5;
      px(x, 4, 4 + yy, 63, 1, mix(pal[0], pal[1], q));
    }
    for (let yy = 0; yy < 87; yy += 2) for (let xx = (yy / 2) % 2; xx < 63; xx += 2) px(x, 4 + xx, 4 + yy, 1, 1, 'rgba(255,255,255,.08)');
    for (let i = 0; i < 10; i++) px(x, 6 + (R() * 58 | 0), 6 + (R() * 50 | 0), 1, 1, 'rgba(255,255,255,.6)');
    const shape = R() * 6 | 0, eyes = R() * 6 | 0, mouth = R() * 6 | 0, hat = R() * 9 | 0;
    const shd = sh(body, .72), lt = mix(body, '#ffffff', .4), cx = 35, cy = 52;
    if (shape === 0) { disc(x, cx, cy + 2, 19, dk); disc(x, cx, cy + 2, 18, body); disc(x, cx - 6, cy - 6, 6, lt); ell(x, cx, cy + 16, 14, 3, shd); }
    else if (shape === 1) { px(x, cx - 17, cy - 17, 34, 36, dk); px(x, cx - 16, cy - 16, 32, 34, body); px(x, cx - 16, cy + 12, 32, 6, shd); px(x, cx - 14, cy - 14, 10, 4, lt); }
    else if (shape === 2) { ell(x, cx, cy, 14, 24, dk); ell(x, cx, cy, 13, 23, body); ell(x, cx - 4, cy - 12, 4, 7, lt); px(x, cx - 13, cy + 14, 26, 6, shd); }
    else if (shape === 3) { for (let j = 0; j < 36; j++) { const w = Math.floor(4 + j * .48); px(x, cx - w - 1, cy - 20 + j, w * 2 + 3, 1, dk); px(x, cx - w, cy - 20 + j, w * 2 + 1, 1, j > 28 ? shd : body); } px(x, cx - 4, cy - 14, 4, 6, lt); }
    else if (shape === 4) { disc(x, cx, cy - 4, 17, dk); disc(x, cx, cy - 4, 16, body); px(x, cx - 17, cy - 4, 35, 22, dk); px(x, cx - 16, cy - 4, 33, 21, body); for (let i = 0; i < 4; i++) px(x, cx - 16 + i * 9, cy + 17, 6, 5, pal[0]); px(x, cx - 9, cy - 12, 6, 4, lt); }
    else { ell(x, cx, cy, 21, 16, dk); ell(x, cx, cy, 20, 15, body); ell(x, cx - 8, cy - 7, 6, 3, lt); px(x, cx - 20, cy + 8, 41, 3, shd); }
    const ey = cy - 5, ec = '#ffffff';
    if (eyes === 0) { px(x, cx - 9, ey, 4, 5, dk); px(x, cx + 5, ey, 4, 5, dk); }
    else if (eyes === 1) { disc(x, cx - 8, ey + 2, 4, ec); disc(x, cx + 8, ey + 2, 4, ec); px(x, cx - 8, ey + 2, 3, 3, dk); px(x, cx + 7, ey + 2, 3, 3, dk); }
    else if (eyes === 2) { line(x, cx - 12, ey - 2, cx - 5, ey + 1, dk, 2); line(x, cx + 12, ey - 2, cx + 5, ey + 1, dk, 2); px(x, cx - 9, ey + 2, 4, 3, dk); px(x, cx + 5, ey + 2, 4, 3, dk); }
    else if (eyes === 3) { px(x, cx - 11, ey + 3, 7, 1, dk); px(x, cx + 4, ey + 3, 7, 1, dk); px(x, cx - 10, ey + 4, 5, 1, dk); px(x, cx + 5, ey + 4, 5, 1, dk); }
    else if (eyes === 4) { spr(x, ['00100', '01110', '11111', '01110', '00100'], cx - 13, ey - 1, '#ffe45a', 1); spr(x, ['00100', '01110', '11111', '01110', '00100'], cx + 8, ey - 1, '#ffe45a', 1); }
    else { disc(x, cx, ey + 2, 6, ec); disc(x, cx, ey + 2, 3, dk); px(x, cx - 1, ey + 1, 2, 2, ec); }
    const my = cy + 8;
    if (mouth === 0) { px(x, cx - 7, my, 14, 2, dk); px(x, cx - 8, my - 2, 2, 2, dk); px(x, cx + 7, my - 2, 2, 2, dk); }
    else if (mouth === 1) { px(x, cx - 8, my - 1, 16, 7, dk); px(x, cx - 7, my - 1, 14, 2, ec); }
    else if (mouth === 2) { px(x, cx - 6, my + 1, 12, 2, dk); }
    else if (mouth === 3) { px(x, cx - 7, my, 14, 2, dk); px(x, cx - 6, my + 2, 2, 3, ec); px(x, cx + 4, my + 2, 2, 3, ec); }
    else if (mouth === 4) { px(x, cx - 7, my, 14, 2, dk); px(x, cx + 1, my + 2, 5, 4, '#e8607a'); }
    else { disc(x, cx, my + 2, 3, dk); }
    const hc = JBODY[(h >>> 9) % JBODY.length], hy = cy - 20;
    if (hat === 1) { line(x, cx - 8, hy + 4, cx - 18, hy - 8, hc, 3); line(x, cx + 8, hy + 4, cx + 18, hy - 8, hc, 3); disc(x, cx - 18, hy - 9, 2, '#fff0a0'); disc(x, cx + 18, hy - 9, 2, '#fff0a0'); px(x, cx - 9, hy + 2, 18, 4, hc); }
    else if (hat === 2) { px(x, cx - 8, hy - 10, 16, 12, dk); px(x, cx - 13, hy + 1, 26, 3, dk); px(x, cx - 8, hy - 2, 16, 2, hc); }
    else if (hat === 3) { px(x, cx - 10, hy, 20, 5, '#f2c744'); [-10, -3, 4].forEach(o => px(x, cx + o, hy - 5, 6, 5, '#f2c744')); disc(x, cx, hy - 5, 1, '#e8574a'); }
    else if (hat === 4) { px(x, cx - 14, hy + 2, 5, 5, hc); px(x, cx + 9, hy + 2, 5, 5, hc); px(x, cx - 16, hy - 2, 3, 5, hc); px(x, cx + 13, hy - 2, 3, 5, hc); }
    else if (hat === 5) { line(x, cx, hy + 3, cx, hy - 10, dk, 2); disc(x, cx, hy - 11, 3, hc); }
    else if (hat === 6) { px(x, cx - 1, hy - 8, 2, 10, '#3a8a3a'); ell(x, cx - 5, hy - 6, 5, 3, '#5cc66a'); ell(x, cx + 5, hy - 8, 5, 3, '#5cc66a'); }
    else if (hat === 7) { for (let j = 0; j < 16; j++) { const w = Math.floor(j * .6) + 1; px(x, cx - w - 3 - 0, hy - 14 + j, w * 2 + 7, 1, j % 5 === 0 ? '#ffe45a' : hc); } px(x, cx - 12, hy + 2, 24, 3, hc); }
    else if (hat === 8) { ell(x, cx, hy - 3, 11, 3, '#ffe45a'); ell(x, cx, hy - 3, 7, 1, pal[0]); }
    const th = def.th || SYMK[(h >>> 13) % SYMK.length];
    const sp = th.length === 2 && th[0] === 's' ? SUIT9[+th[1]] : SYM[th] || SYM.star;
    const tc = th.length === 2 && th[0] === 's' ? (+th[1] === 1 || +th[1] === 3 ? '#ff7060' : '#e8f0ff') : '#ffe45a';
    spr(x, sp, 6, 6, dk, 1); spr(x, sp, 5, 5, tc, 1);
    spr(x, sp, 57, 80, dk, 1); spr(x, sp, 56, 79, tc, 1);
    cardCache.set(k, cv);
    return cv;
  }

  const PLC = { Mercury: ['#b9b2a8', '#7a7468'], Venus: ['#e8c88a', '#b08a4a'], Earth: ['#4a8ae0', '#2a8a4a'], Mars: ['#d8603a', '#8a3a22'], Jupiter: ['#d8b890', '#a8704a'], Saturn: ['#e8d8a0', '#b8a060'], Uranus: ['#8ae0e8', '#4aa8b8'], Neptune: ['#4a6ae8', '#2a3aa8'], Pluto: ['#c8b8a8', '#8a7868'], 'Planet X': ['#e870e8', '#8a38a8'], Ceres: ['#a8a8a8', '#686868'], Eris: ['#f0f0f8', '#8a8aa8'] };
  function planetArt(name) {
    const k = 'pl' + name;
    if (cardCache.has(k)) return cardCache.get(k);
    const [cv, x] = mkc(71, 95), R = mulb(hashStr(name)), pc = PLC[name] || PLC.Pluto;
    cardFrame(x, '#10162e', '#20242c');
    px(x, 3, 3, 65, 89, '#0c1028');
    for (let i = 0; i < 40; i++) px(x, 4 + (R() * 62 | 0), 4 + (R() * 86 | 0), 1, 1, R() > .5 ? '#ffffff' : '#8aa8ff');
    const cx = 35, cy = 46, r = 19;
    if (name === 'Saturn' || name === 'Uranus' || name === 'Eris') ell(x, cx, cy, 31, 7, mix(pc[0], '#000000', .5));
    disc(x, cx, cy, r, sh(pc[1], .6)); disc(x, cx, cy, r - 1, pc[1]);
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.floor(Math.sqrt(r * r - dy * dy));
      const band = (Math.floor((dy + r) / 4) + (R() > .93 ? 1 : 0)) % 2 === 0;
      if (band || name === 'Earth') px(x, cx - w + 1, cy + dy, w * 2 - 1, 2, pc[0]);
    }
    if (name === 'Earth') { disc(x, cx - 6, cy - 4, 6, '#3aa04a'); disc(x, cx + 7, cy + 7, 5, '#3aa04a'); }
    disc(x, cx - 7, cy - 7, 5, 'rgba(255,255,255,.25)');
    for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); px(x, cx + Math.floor(w * .35), cy + dy, Math.ceil(w * .65), 1, 'rgba(0,0,20,.4)'); }
    if (name === 'Saturn' || name === 'Uranus' || name === 'Eris') { ell(x, cx, cy + 1, 31, 7, 'rgba(0,0,0,0)'); for (let i = -30; i <= 30; i++) { const yy = Math.round(Math.sqrt(Math.max(0, 1 - i * i / 961)) * 7); if (yy > 0) { px(x, cx + i, cy + yy - 1, 1, 2, pc[0]); } } }
    spr(x, SYM.star, 6, 80, '#ffe45a', 1); spr(x, SYM.star, 56, 6, '#ffe45a', 1);
    cardCache.set(k, cv);
    return cv;
  }

  const ARC_SYM = {
    sun: x => { disc(x, 35, 46, 10, '#ffe45a'); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(x, 35 + Math.cos(a) * 14, 46 + Math.sin(a) * 14, 35 + Math.cos(a) * 21, 46 + Math.sin(a) * 21, '#ffb83a', 2); } },
    moon: x => { disc(x, 35, 46, 17, '#e8e8f8'); disc(x, 43, 42, 15, 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'destination-out'; disc(x, 43, 42, 14, '#000'); x.globalCompositeOperation = 'source-over'; },
    star: x => { spr(x, SYM.star, 17, 28, '#ffe45a', 4); },
    tower: x => { px(x, 27, 30, 16, 40, '#8a8aa0'); [27, 32, 37].forEach(a => px(x, a, 24, 5, 7, '#8a8aa0')); px(x, 33, 40, 4, 8, '#2a2f38'); line(x, 50, 26, 44, 40, '#ffe45a', 2); line(x, 44, 40, 52, 44, '#ffe45a', 2); },
    wheel: x => { disc(x, 35, 46, 19, '#e8c040'); disc(x, 35, 46, 15, '#4a2a6a'); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; line(x, 35 + Math.cos(a) * 17, 46 + Math.sin(a) * 17, 35 - Math.cos(a) * 17, 46 - Math.sin(a) * 17, '#e8c040', 2); } disc(x, 35, 46, 4, '#e8c040'); },
    skull: x => { spr(x, SYM.skull, 17, 28, '#e8e8f0', 4); },
    heart: x => { spr(x, SUIT9[1], 17, 28, '#e8506a', 4); },
    gem: x => { spr(x, SYM.gem, 17, 28, '#58e0f0', 4); },
    cup: x => { px(x, 22, 28, 26, 4, '#e8c040'); px(x, 24, 32, 22, 16, '#e8c040'); px(x, 32, 48, 6, 14, '#e8c040'); px(x, 24, 62, 22, 4, '#e8c040'); },
    eye: x => { ell(x, 35, 46, 22, 12, '#f0f0f8'); disc(x, 35, 46, 9, '#6a3ab8'); disc(x, 35, 46, 4, '#10102a'); },
    pillars: x => { px(x, 18, 26, 8, 44, '#e8e0d0'); px(x, 45, 26, 8, 44, '#2a2a3a'); px(x, 26, 40, 19, 14, '#3a5ab8'); },
    infinity: x => { ell(x, 26, 46, 10, 9, '#e8c040'); ell(x, 44, 46, 10, 9, '#e8c040'); ell(x, 26, 46, 6, 5, '#4a2a6a'); ell(x, 44, 46, 6, 5, '#4a2a6a'); },
    crown: x => { px(x, 20, 40, 31, 12, '#e8c040'); [20, 32, 44].forEach(a => px(x, a, 30, 7, 11, '#e8c040')); },
    cross: x => { px(x, 32, 26, 7, 46, '#e8c040'); px(x, 22, 36, 27, 6, '#e8c040'); px(x, 24, 50, 23, 6, '#e8c040'); },
    scales: x => { px(x, 33, 26, 5, 40, '#e8c040'); px(x, 18, 34, 35, 3, '#e8c040'); px(x, 16, 40, 12, 3, '#e8c040'); px(x, 43, 40, 12, 3, '#e8c040'); px(x, 28, 66, 15, 4, '#e8c040'); },
    flame: x => { disc(x, 35, 54, 13, '#ff7a2a'); disc(x, 35, 50, 8, '#ffe45a'); for (let j = 0; j < 20; j++) px(x, 35 - Math.floor((20 - j) * .4), 26 + j, Math.floor((20 - j) * .8) + 1, 1, '#ff7a2a'); },
    ankh: x => { ring(x, 35, 34, 9, '#e8c040'); px(x, 33, 42, 5, 28, '#e8c040'); px(x, 24, 50, 23, 5, '#e8c040'); },
    hand: x => { px(x, 24, 40, 24, 24, '#e8c8a0'); [24, 30, 36, 42].forEach((a, i) => px(x, a, 26 + (i % 2 ? 2 : 0), 5, 16, '#e8c8a0')); px(x, 20, 48, 6, 10, '#e8c8a0'); },
    cards: x => { px(x, 18, 32, 24, 34, '#f4f0e6'); px(x, 28, 28, 24, 34, '#e8e0d0'); spr(x, SUIT9[1], 34, 38, '#e0453a', 1); },
    hole: x => { disc(x, 35, 46, 19, '#e8e8f8'); disc(x, 35, 46, 14, '#8a4ad8'); disc(x, 35, 46, 8, '#201040'); disc(x, 35, 46, 3, '#000'); },
    cart: x => { px(x, 20, 40, 32, 14, '#c88a4a'); disc(x, 26, 58, 5, '#3a2a1a'); disc(x, 46, 58, 5, '#3a2a1a'); px(x, 48, 30, 3, 12, '#e8c040'); },
    leaf: x => { ell(x, 35, 46, 12, 20, '#4cc66a'); line(x, 35, 28, 35, 66, '#2a7a3a', 2); }
  };
  function ring(x, cx, cy, r, col) { disc(x, cx, cy, r, col); disc(x, cx, cy, r - 3, 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'destination-out'; disc(x, cx, cy, r - 3, '#000'); x.globalCompositeOperation = 'source-over'; }

  function emblemArt(key, kind, symKey, colors) {
    const k = kind + key;
    if (cardCache.has(k)) return cardCache.get(k);
    const [cv, x] = mkc(71, 95), R = mulb(hashStr(key));
    const bd = '#20242c';
    cardFrame(x, colors[0], bd);
    px(x, 3, 3, 65, 89, colors[1]);
    for (let yy = 0; yy < 89; yy++) px(x, 3, 3 + yy, 65, 1, mix(colors[1], colors[2], yy / 88));
    for (let i = 0; i < 26; i++) px(x, 5 + (R() * 60 | 0), 5 + (R() * 84 | 0), 1, 1, 'rgba(255,255,255,.55)');
    x.save();
    const f = ARC_SYM[symKey] || ARC_SYM.star;
    f(x);
    x.restore();
    if (kind === 'v') { px(x, 4, 4, 63, 2, '#ffe45a'); px(x, 4, 89, 63, 2, '#ffe45a'); px(x, 4, 4, 2, 87, '#ffe45a'); px(x, 65, 4, 2, 87, '#ffe45a'); }
    cardCache.set(k, cv);
    return cv;
  }
  function packArt(key, colors, symKey) {
    const k = 'pk' + key;
    if (cardCache.has(k)) return cardCache.get(k);
    const [cv, x] = mkc(71, 95), R = mulb(hashStr(key));
    px(x, 0, 0, 71, 95, 'rgba(0,0,0,0)');
    for (let yy = 0; yy < 95; yy++) {
      const zz = (yy % 6 < 3) ? 1 : 0;
      px(x, 3 - zz, yy, 65 + zz * 2, 1, '#20242c');
    }
    for (let yy = 1; yy < 94; yy++) { const zz = (yy % 6 < 3) ? 1 : 0; px(x, 4 - zz, yy, 63 + zz * 2, 1, mix(colors[0], colors[1], yy / 94)); }
    px(x, 4, 14, 63, 3, 'rgba(255,255,255,.4)'); px(x, 4, 79, 63, 3, 'rgba(0,0,0,.25)');
    for (let i = 0; i < 16; i++) px(x, 7 + (R() * 56 | 0), 20 + (R() * 56 | 0), 2, 2, 'rgba(255,255,255,.5)');
    x.save(); ARC_SYM[symKey](x); x.restore();
    cardCache.set(k, cv);
    return cv;
  }
  function tokenArt(key, c1, c2, ring2) {
    const k = 'tk' + key;
    if (cardCache.has(k)) return cardCache.get(k);
    const [cv, x] = mkc(34, 34);
    disc(x, 17, 17, 16, '#20242c'); disc(x, 17, 17, 15, c1); disc(x, 17, 17, 11, c2); disc(x, 17, 17, 8, c1);
    px(x, 14, 12, 3, 3, '#20242c'); px(x, 20, 12, 3, 3, '#20242c'); px(x, 13, 20, 11, 2, '#20242c');
    if (ring2) { disc(x, 17, 17, 3, ring2); }
    cardCache.set(k, cv);
    return cv;
  }

  let R = null, SINK = null;
  const JK = {}, JL = [], TK = {}, TL = [], SK = {}, SL = [], VK = {}, VL = [], BK = {}, BL = [], TGK = {}, TGL = [], PK = {};
  const PLK = {};

  const nid = () => R.uid++;
  const note = (id, text) => { (SINK || R.q).push({ id, t: 'msg', text }); };
  const jOff = j => (j.per && j.pl <= 0) || R.hdis === j.id;
  const jdef = j => JK[j.k];
  const flag = k => R.jokers.some(j => !jOff(j) && JK[j.k].f === k);
  const luck = (n, d) => rnd() < n * (flag('luck2') ? 2 : 1) / d;
  const vo = k => !!R.vo[k];
  const bossOn = k => !!(R.cur && R.cur.boss && !R.bossOff && (!k || R.cur.k === k));

  function deb(c) {
    const b = bossOn() && R.cur.k;
    if (!b) return false;
    if (c.e === 'stone') return b === 'leaf' ? !R.leafOk : b === 'pillar' ? c.pa === R.ante : false;
    if (b === 'club') return c.s === 2;
    if (b === 'head') return c.s === 1;
    if (b === 'goad') return c.s === 0;
    if (b === 'window') return c.s === 3;
    if (b === 'plant') return isFace(c);
    if (b === 'pillar') return c.pa === R.ante;
    if (b === 'leaf') return !R.leafOk;
    return false;
  }
  const isFace = c => c.e !== 'stone' && ((c.r >= 11 && c.r <= 13) || flag('pareid'));
  const suitIs = (c, s) => {
    if (c.e === 'stone') return false;
    if (c.e === 'wild' && !deb(c)) return true;
    if (flag('smear')) return c.s % 2 === s % 2;
    return c.s === s;
  };
  const isOdd = c => c.e !== 'stone' && [14, 9, 7, 5, 3].indexOf(c.r) >= 0;
  const isEven = c => c.e !== 'stone' && [10, 8, 6, 4, 2].indexOf(c.r) >= 0;

  function pv(j, k) {
    const p = JK[j.k].p;
    if (!p) return 0;
    const o = typeof p === 'function' ? p(j) : p;
    return o[k] || 0;
  }
  const pass = k => R.jokers.reduce((a, j) => a + (jOff(j) ? 0 : pv(j, k)), 0);
  const negJ = () => R.jokers.filter(j => j.ed === 'neg').length;
  const negC = () => R.cons.filter(j => j.ed === 'neg').length;
  const dk = () => R.dk;
  const bossHs = () => bossOn('manacle') ? 1 : 0;
  const hsz = () => 8 + R.m.hs + R.m.hst + pass('hs') + (vo('paint') ? 1 : 0) + (vo('palette') ? 1 : 0) + (dk() === 'painted' ? 2 : 0) - bossHs();
  const hmax = () => 4 + R.m.h + pass('h') + (vo('grab') ? 1 : 0) + (vo('tongs') ? 1 : 0) + (dk() === 'blue' ? 1 : 0) + (dk() === 'black' ? -1 : 0);
  const dmax = () => Math.max(0, 3 + R.m.d + pass('d') + (vo('waste') ? 1 : 0) + (vo('recycle') ? 1 : 0) + (dk() === 'red' ? 1 : 0) - (R.st >= 5 ? 1 : 0));
  const jslots = () => 5 + R.m.js + (vo('void') ? 1 : 0) + (dk() === 'black' ? 1 : 0) - (dk() === 'painted' ? 1 : 0) + negJ();
  const cslots = () => 2 + R.m.cs + (vo('pocket') ? 1 : 0) - (dk() === 'nebula' ? 1 : 0) + negC();
  const jfree = (neg) => jslots() + (neg ? 1 : 0) - R.jokers.length;
  const cfree = (neg) => cslots() + (neg ? 1 : 0) - R.cons.length;
  const debtLim = () => pass('debt');
  const ilevel = () => 1 + pass('int');
  const icap = () => vo('tree') ? 100 : vo('seed') ? 50 : 25;

  const sellBase = j => {
    const d = JK[j.k], cost = d.$ + (j.ed === 'foil' ? 2 : j.ed === 'holo' ? 3 : j.ed === 'poly' ? 5 : j.ed === 'neg' ? 5 : 0);
    return Math.max(1, Math.floor(cost / 2));
  };
  const sellVal = j => j.type ? Math.max(1, Math.floor(((TK[j.k] || SK[j.k] || PLK[j.k] || { $: 3 }).$ || 3) / 2)) + j.a : sellBase(j) + j.a;

  const ANTE_AMT = [[100, 300, 800, 2000, 5000, 11000, 20000, 35000, 50000], [100, 300, 900, 2600, 8000, 20000, 36000, 60000, 100000], [100, 300, 1000, 3200, 9000, 25000, 60000, 110000, 200000]];
  function anteBase(a) {
    const tb = ANTE_AMT[R.st >= 6 ? 2 : R.st >= 3 ? 1 : 0];
    if (a < 1) return 100;
    if (a <= 8) return tb[a];
    const c = a - 8, v = Math.floor(tb[8] * Math.pow(1.6 + Math.pow(.75 * c, 1 + .2 * c), c));
    return v - v % Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 1));
  }
  const blindTarget = b => {
    let m = b.k === 'small' ? 1 : b.k === 'big' ? 1.5 : (BK[b.boss].mult || 2);
    if (R.dk === 'plasma') m *= 2;
    return Math.floor(anteBase(R.ante) * m);
  };
  const blindName = b => b.k === 'small' ? 'Small Blind' : b.k === 'big' ? 'Big Blind' : BK[b.boss].n;
  const blindRew = b => b.k === 'small' ? (R.st >= 2 ? 0 : 3) : b.k === 'big' ? 4 : 5;

  function newCard(r, s, o) { return Object.assign({ id: nid(), r, s, e: null, ed: null, z: null, x: 0 }, o); }
  function stdDeck(k) {
    const out = [];
    for (let s = 0; s < 4; s++) for (let r = 2; r <= 14; r++) {
      if (k === 'abandoned' && r >= 11 && r <= 13) continue;
      let ss = s;
      if (k === 'checkered') ss = s % 2 === 0 ? 0 : 1;
      out.push(newCard(r, ss));
    }
    if (k === 'erratic') out.forEach(c => { c.r = 2 + rint(13); c.s = rint(4); });
    return out;
  }

  function newRun(deck, stake, seed) {
    seed = seed || Array.from({ length: 7 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    RS = hashStr(seed);
    R = {
      v: 1, seed, dk: deck, st: stake, uid: 1, ante: 1, round: 0, bi: 0, ph: 'blinds', money: 4,
      hands: 0, discards: 0, score: 0, cards: [], draw: [], hand: [], disc: [], play: [], jokers: [], cons: [],
      hl: {}, vo: {}, tags: [], q: [], skips: 0, m: { hs: 0, hst: 0, h: 0, d: 0, js: 0, cs: 0 },
      shop: null, pack: null, cur: null, bl: [], boss: null, bossUsed: [], hpr: 0, dUsed: 0, hsr: {}, last: null,
      planetsUsed: {}, ext: {}, tot: { h: 0, d: 0, bd: 0 }, lastCons: null, won: false, endless: false, cash: null,
      bossOff: false, leafOk: false, hdis: null, bt: 0, back: null, vch: null, vAnte: 0, fs: true, sel: [], best: 0, bossBeat: 0,
      mostRound: 0, stats: { hands: 0, bestHand: 0, rerolls: 0, bought: 0, planets: 0, tarots: 0, spectrals: 0 }
    };
    HORD.forEach(k => { R.hl[k] = { lvl: 1, played: 0, pr: 0 }; });
    R.cards = stdDeck(deck);
    if (deck === 'yellow') R.money += 10;
    if (deck === 'magic') { R.vo.pocket = 1; addCons('tarot', 'fool'); addCons('tarot', 'fool'); }
    if (deck === 'nebula') R.vo.scope = 1;
    if (deck === 'ghost') addCons('spectral', 'hex2');
    if (deck === 'zodiac') { R.vo.tmerch = 1; R.vo.pmerch = 1; R.vo.over = 1; }
    R.q = [];
    genBlinds();
    return R;
  }

  function pickBoss() {
    const fin = R.ante % 8 === 0;
    let pool = BL.filter(b => fin ? b.fin : !b.fin && b.min <= R.ante);
    let fresh = pool.filter(b => R.bossUsed.indexOf(b.k) < 0);
    if (!fresh.length) { R.bossUsed = R.bossUsed.filter(k => !pool.some(b => b.k === k)); fresh = pool; }
    return pick(fresh).k;
  }
  function rollTag() { return pick(TGL.filter(t => !t.min || t.min <= R.ante)).k; }
  function genBlinds() {
    R.boss = pickBoss();
    R.bl = [{ k: 'small', s: 'sel', tag: rollTag() }, { k: 'big', s: 'up', tag: rollTag() }, { k: 'boss', s: 'up', boss: R.boss }];
    R.bi = 0;
  }

  function hv(id) {
    const h = HAND[id], l = R.hl[id].lvl - 1;
    return { c: h.c + h.lc * l, m: h.m + h.lm * l };
  }
  function levelHand(id, n) {
    const l = R.hl[id];
    l.lvl = Math.max(1, l.lvl + n);
    if (n > 0) l.seen = 1;
  }
  const knownHand = id => !HAND[id].sec || R.hl[id].played > 0 || R.hl[id].seen;

  function mkJoker(k, ed) {
    const j = { id: nid(), k, ed: ed || null, a: 0 };
    if (JK[k].init) Object.assign(j, JK[k].init());
    return j;
  }
  function addJoker(k, ed, o) {
    o = o || {};
    if (!o.force && jfree(ed === 'neg') <= 0) return null;
    const j = mkJoker(k, ed);
    if (o.st) Object.assign(j, o.st);
    R.jokers.push(j);
    R.q.push({ id: j.id, t: 'spawn', from: o.from });
    return j;
  }
  function killJoker(j, how) {
    const i = R.jokers.indexOf(j);
    if (i < 0) return;
    R.jokers.splice(i, 1);
    R.q.push({ id: j.id, t: 'gone', how: how || 'destroy' });
  }
  function newCons(type, k, ed) { return { id: nid(), type, k, a: 0, ed: ed || null }; }
  function addCons(type, k, ed, o) {
    if (!(o && o.force) && cfree(ed === 'neg') <= 0) return null;
    const c = newCons(type, k, ed);
    R.cons.push(c);
    R.q.push({ id: c.id, t: 'spawn', from: o && o.from });
    return c;
  }
  function killCons(c, how) {
    const i = R.cons.indexOf(c);
    if (i >= 0) { R.cons.splice(i, 1); R.q.push({ id: c.id, t: 'gone', how: how || 'use' }); }
  }

  function fire(hook, c) {
    c = c || {};
    c.R = R;
    R.jokers.slice().forEach(j => {
      if (jOff(j) || !R.jokers.includes(j)) return;
      const e = call(j, hook, c);
      if (e) plain(j.id, e);
    });
  }
  function plain(id, e) {
    if (e.$) { R.money += e.$; R.q.push({ id, t: '$', v: e.$ }); }
    if (e.msg) note(id, e.msg);
  }
  function copyTarget(j) {
    const d = JK[j.k], i = R.jokers.indexOf(j);
    const t = d.copy === 'right' ? R.jokers[i + 1] : R.jokers[0];
    if (!t || t === j || jOff(t) || JK[t.k].copy) return null;
    return t;
  }
  function call(j, hook, c) {
    if (jOff(j)) return;
    const d = JK[j.k];
    let tj = j, td = d;
    if (d.copy) {
      const t = copyTarget(j);
      if (!t) return;
      tj = t; td = JK[t.k];
      if (td.nb || !td[hook]) return;
      c.copy = true;
    } else { c.copy = false; if (!td[hook]) return; }
    c.j = tj; c.src = j;
    return td[hook](c, tj);
  }

  function destroyCards(list, how) {
    list = list.filter(c => R.cards.indexOf(c) >= 0);
    if (!list.length) return;
    list.forEach(c => {
      ['cards', 'draw', 'hand', 'disc', 'play'].forEach(k => { const i = R[k].indexOf(c); if (i >= 0) R[k].splice(i, 1); });
      R.q.push({ id: c.id, t: 'gone', how: how || 'destroy' });
    });
    fire('destroyed', { cards: list });
  }
  function addToDeck(card, to) {
    R.cards.push(card);
    if (R.ph === 'round') {
      if (to === 'hand') R.hand.push(card);
      else R.draw.splice(rint(R.draw.length + 1), 0, card);
    }
    R.q.push({ id: card.id, t: 'spawn', from: to === 'hand' ? 'deck' : 'mid' });
    fire('add', { card });
  }
  function randCard(o) {
    const c = newCard(2 + rint(13), rint(4));
    if (o && o.face) c.r = 11 + rint(3);
    if (o && o.ace) c.r = 14;
    if (o && o.num) c.r = 2 + rint(9);
    if (o && o.enh) c.e = pick(['bonus', 'mult', 'wild', 'glass', 'steel', 'gold', 'lucky']);
    return c;
  }
  const rollEd = (mod, nopoly) => {
    const p = rnd();
    if (p > 1 - .003 * mod) return 'neg';
    if (p > 1 - .006 * mod) return 'poly';
    if (p > 1 - .02 * mod) return 'holo';
    if (p > 1 - .04 * mod) return 'foil';
    return null;
  };
  const edMod = () => vo('lustre') ? 4 : vo('polish') ? 2 : 1;

  function drawCards(n) {
    const out = [];
    for (let i = 0; i < n && R.draw.length; i++) {
      const c = R.draw.pop();
      c.fd = false;
      if (bossOn('house') && R.hpr === 0 && R.dUsed === 0) c.fd = true;
      else if (bossOn('wheel') && rnd() < 1 / 7) c.fd = true;
      else if (bossOn('mark') && isFace(c)) c.fd = true;
      else if (bossOn('fish') && R.hpr > 0) c.fd = true;
      R.hand.push(c); out.push(c);
    }
    return out;
  }
  function drawToFull() {
    const n = bossOn('serpent') && R.hpr > 0 || bossOn('serpent') && R.dUsed > 0 ? 3 : hsz() - R.hand.length;
    return drawCards(Math.max(0, n));
  }

  function beginRound(bi) {
    const b = R.bl[bi];
    R.bi = bi; b.s = 'cur';
    R.cur = { k: b.k === 'boss' ? b.boss : b.k, boss: b.k === 'boss', bi, target: blindTarget(b), rew: blindRew(b), n: blindName(b), tag: b.tag };
    if (b.k === 'boss' && BK[b.boss].mult) R.cur.big = true;
    R.round++;
    R.ph = 'round';
    R.score = 0; R.hpr = 0; R.dUsed = 0; R.hsr = {}; R.bt = 0; R.hdis = null; R.leafOk = false;
    R.bossOff = false; R.mm = null;
    R.bossOff = flag('nobosseff') && b.k === 'boss';
    HORD.forEach(k => { R.hl[k].pr = 0; });
    R.hands = hmax(); R.discards = dmax();
    if (bossOn('water')) R.discards = 0;
    if (bossOn('needle')) R.hands = 1;
    R.draw = shuffle(R.cards.slice()); R.hand = []; R.disc = []; R.play = []; R.sel = [];
    R.pcount = {};
    if (b.k === 'boss' && R.cur.k === 'acorn' && !R.bossOff) { shuffle(R.jokers); R.q.push({ t: 'shuf' }); }
    if (b.k !== 'boss') fire('bsel', { blind: R.cur });
    drawToFull();
    if (bossOn('bell') && R.hand.length) R.forced = R.hand[rint(R.hand.length)].id; else R.forced = null;
    fire('bstart', { blind: R.cur });
    if (R.cur.boss && R.cur.k === 'hook') R.bt = 0;
    return R.cur;
  }

  function mostPlayed() {
    let b = null, n = -1;
    HORD.forEach(k => { const p = R.hl[k].played; if (p > n) { n = p; b = k; } });
    return b;
  }

  function canPlay(cards) {
    if (!cards.length || cards.length > 5) return false;
    if (R.hands <= 0) return false;
    return true;
  }

  function appl(S, id, e) {
    if (!e) return;
    if (e.c) { S.chips += e.c; S.ev.push({ id, t: 'c', v: e.c, ch: S.chips, mu: S.mult }); }
    if (e.m) { S.mult += e.m; S.ev.push({ id, t: 'm', v: e.m, ch: S.chips, mu: S.mult }); }
    if (e.x && e.x !== 1) { S.mult *= e.x; S.ev.push({ id, t: 'x', v: e.x, ch: S.chips, mu: S.mult }); }
    if (e.$) { R.money += e.$; S.ev.push({ id, t: '$', v: e.$, ch: S.chips, mu: S.mult }); }
    if (e.msg) S.ev.push({ id, t: 'msg', text: e.msg, ch: S.chips, mu: S.mult });
  }

  function cardScore(S, cx, card, rep) {
    cx.card = card;
    if (deb(card)) { S.ev.push({ id: card.id, t: 'msg', text: 'Debuffed', ch: S.chips, mu: S.mult }); R.bt = 1; return; }
    appl(S, card.id, { c: (card.e === 'stone' ? 50 : chipVal(card)) + (card.x || 0) + (card.e === 'bonus' ? 30 : 0) });
    if (card.e === 'mult') appl(S, card.id, { m: 4 });
    if (card.e === 'glass') appl(S, card.id, { x: 2 });
    if (card.e === 'lucky') {
      if (luck(1, 5)) { appl(S, card.id, { m: 20 }); S.lucky++; fire('lucky', {}); }
      if (luck(1, 15)) { appl(S, card.id, { $: 20 }); S.lucky++; fire('lucky', {}); }
    }
    if (card.z === 'gold') appl(S, card.id, { $: 3 });
    if (card.ed === 'foil') appl(S, card.id, { c: 50 });
    if (card.ed === 'holo') appl(S, card.id, { m: 10 });
    if (card.ed === 'poly') appl(S, card.id, { x: 1.5 });
    R.jokers.forEach(j => { if (!jOff(j)) appl(S, j.id, call(j, 'card', cx)); });
  }
  function repsOf(cx, card, zone) {
    cx.card = card; cx.zone = zone;
    const list = [];
    if (card.z === 'red') list.push(card.id);
    R.jokers.forEach(j => {
      if (jOff(j)) return;
      const n = call(j, 'rep', cx);
      for (let i = 0; i < (n || 0); i++) list.push(j.id);
    });
    return list;
  }
  function heldScore(S, cx, card) {
    cx.card = card;
    if (deb(card)) return;
    if (card.e === 'steel') appl(S, card.id, { x: 1.5 });
    R.jokers.forEach(j => { if (!jOff(j)) appl(S, j.id, call(j, 'held', cx)); });
  }

  function scoreHand(played, held) {
    const fl = { four: flag('four'), short: flag('short'), smear: flag('smear'), splash: flag('splash') };
    const h = evalHand(played, fl);
    const S = { chips: 0, mult: 0, ev: [], dest: [], lucky: 0, tot: 0, hid: h.id, h, dis: false };
    SINK = S.ev;
    const cx = { R, S, h, played, sc: h.sc, held, has: h.has, card: null, zone: 'play' };
    cx.firstFace = h.sc.find(c => isFace(c) && !deb(c)) || null;
    if (bossOn('psychic') && played.length < 5) S.dis = true;
    if (bossOn('mouth') && R.last && R.last !== h.id) S.dis = true;
    if (bossOn('eye') && R.hsr[h.id]) S.dis = true;
    if (S.dis) { R.bt = 1; S.ev.push({ id: 0, t: 'msg', text: 'Not Allowed!', ch: 0, mu: 0 }); S.hid = h.id; SINK = null; return S; }
    fire('before', cx);
    if (bossOn('arm')) { levelHand(h.id, -1); R.bt = 1; }
    const b = hv(h.id);
    S.chips = b.c; S.mult = b.m;
    if (bossOn('flint')) { S.chips = Math.max(1, Math.floor(S.chips / 2 + .5)); S.mult = Math.max(1, Math.floor(S.mult / 2 + .5)); R.bt = 1; }
    S.ev.push({ id: 0, t: 'base', ch: S.chips, mu: S.mult });
    h.sc.forEach((card, i) => {
      cx.i = i; cx.zone = 'play';
      const reps = repsOf(cx, card, 'play');
      cardScore(S, cx, card);
      reps.forEach(rid => { S.ev.push({ id: rid, t: 'msg', text: 'Again!', ch: S.chips, mu: S.mult }); cardScore(S, cx, card, true); });
    });
    cx.zone = 'held';
    held.forEach(card => {
      const reps = repsOf(cx, card, 'held');
      heldScore(S, cx, card);
      reps.forEach(rid => { S.ev.push({ id: rid, t: 'msg', text: 'Again!', ch: S.chips, mu: S.mult }); heldScore(S, cx, card); });
    });
    cx.zone = 'play'; cx.card = null;
    R.jokers.slice().forEach(j => {
      if (jOff(j)) return;
      if (j.ed === 'foil') appl(S, j.id, { c: 50 });
      if (j.ed === 'holo') appl(S, j.id, { m: 10 });
      appl(S, j.id, call(j, 'main', cx));
      R.jokers.forEach(k => { if (k !== j && !jOff(k)) { cx.o = j; appl(S, k.id, call(k, 'other', cx)); } });
      if (j.ed === 'poly') appl(S, j.id, { x: 1.5 });
    });
    if (vo('obs')) R.cons.forEach(c => { if (c.k === 'pl_' + h.id) appl(S, c.id, { x: 1.5 }); });
    if (R.dk === 'plasma') {
      const v = (S.chips + S.mult) / 2;
      S.chips = v; S.mult = v;
      S.ev.push({ id: 0, t: 'bal', ch: v, mu: v });
    }
    S.tot = Math.floor(S.chips * S.mult + 1e-6);
    fire('after', cx);
    h.sc.forEach(c => { if (c.e === 'glass' && !deb(c) && luck(1, 4)) S.dest.push(c); });
    SINK = null;
    return S;
  }

  function playHand(ids) {
    const cards = ids.map(id => R.hand.find(c => c.id === id)).filter(Boolean);
    if (!canPlay(cards)) return null;
    R.hands--; R.hpr++; R.tot.h++; R.stats.hands++;
    R.hand = R.hand.filter(c => cards.indexOf(c) < 0);
    R.play = cards;
    cards.forEach(c => { c.fd = false; c.pa = R.ante; });
    if (bossOn('tooth')) { R.money -= cards.length; R.bt = 1; }
    const pre = evalHand(cards, { four: flag('four'), short: flag('short'), smear: flag('smear'), splash: flag('splash') });
    if (bossOn('ox') && pre.id === mostPlayed()) { R.money = 0; R.bt = 1; }
    if (bossOn('heart')) { const c = R.jokers.filter(j => !jOff(j)); R.hdis = c.length ? pick(c).id : null; if (R.hdis) R.q.push({ id: R.hdis, t: 'msg', text: 'Disabled' }); }
    const hl = R.hl[pre.id];
    hl.played++; hl.pr++;
    const S = scoreHand(cards, R.hand.slice());
    R.last = pre.id; R.hsr[pre.id] = true;
    if (bossOn('hook')) {
      const dis = shuffle(R.hand.slice()).slice(0, 2);
      dis.forEach(c => { R.hand.splice(R.hand.indexOf(c), 1); R.disc.push(c); });
      S.hooked = dis; R.bt = 1;
    }
    S.cards = cards;
    S.finish = () => finishPlay(S);
    return S;
  }
  function finishPlay(S) {
    R.score += S.tot;
    if (S.tot > R.stats.bestHand) R.stats.bestHand = S.tot;
    if (S.tot > R.mostRound) R.mostRound = S.tot;
    if (S.dest.length) {
      S.dest.forEach(c => { const i = R.play.indexOf(c); if (i >= 0) R.play.splice(i, 1); });
      destroyCards(S.dest, 'shatter');
    }
    R.play.forEach(c => R.disc.push(c));
    R.play = [];
    const won = R.score >= R.cur.target;
    let drawn = [];
    if (!won) drawn = drawToFull();
    if (!won && R.hands <= 0) {
      const bones = R.jokers.find(j => !jOff(j) && JK[j.k].f === 'bones');
      if (bones && R.score >= R.cur.target * .25) { killJoker(bones, 'melt'); R.q.push({ id: 0, t: 'saved' }); R.cur.saved = true; return { drawn, won: true, saved: true }; }
      return { drawn, lost: true };
    }
    return { drawn, won };
  }

  function discardCards(ids) {
    const cards = ids.map(id => R.hand.find(c => c.id === id)).filter(Boolean);
    if (!cards.length || R.discards <= 0 || cards.length > 5) return null;
    R.discards--; R.dUsed++; R.tot.d++;
    R.hand = R.hand.filter(c => cards.indexOf(c) < 0);
    cards.forEach(c => { c.fd = false; R.disc.push(c); });
    if (bossOn('goad2')) { }
    fire('disc', { cards, first: R.dUsed === 1, h: evalHand(cards, { four: flag('four'), short: flag('short'), smear: flag('smear') }) });
    cards.forEach(c => { if (c.z === 'purple') { const t = addCons('tarot', rollCons('tarot').k); if (t) R.q.push({ id: c.id, t: 'msg', text: 'Tarot!' }); } });
    const drawn = drawToFull();
    return { cards, drawn };
  }

  function sortHand(mode) {
    if (mode === 'rank') R.hand.sort((a, b) => (b.e === 'stone' ? 0 : b.r) - (a.e === 'stone' ? 0 : a.r) || a.s - b.s);
    else R.hand.sort((a, b) => a.s - b.s || (b.e === 'stone' ? 0 : b.r) - (a.e === 'stone' ? 0 : a.r));
    R.sortMode = mode;
  }

  function roundEnd() {
    const L = [], b = R.cur;
    R.ph = 'cash';
    const sv = R.score;
    L.push({ l: b.n, v: b.rew, k: 'blind' });
    if (R.dk === 'green') {
      if (R.hands > 0) L.push({ l: R.hands + ' remaining hand' + (R.hands > 1 ? 's' : '') + ' ($2 each)', v: R.hands * 2 });
      if (R.discards > 0) L.push({ l: R.discards + ' unused discard' + (R.discards > 1 ? 's' : '') + ' ($1 each)', v: R.discards });
    } else {
      if (R.hands > 0) L.push({ l: R.hands + ' remaining hand' + (R.hands > 1 ? 's' : ''), v: R.hands });
      const i = Math.min(Math.floor(Math.min(Math.max(R.money, 0), icap()) / 5), icap() / 5) * ilevel();
      if (i > 0) L.push({ l: 'Interest ($1 per $5)', v: i });
    }
    const gold = R.hand.filter(c => c.e === 'gold' && !deb(c)).length;
    if (gold) L.push({ l: gold + ' gold card' + (gold > 1 ? 's' : '') + ' held', v: gold * 3 });
    const bl = R.hand.filter(c => c.z === 'blue' && R.last);
    bl.forEach(c => { const t = addCons('planet', 'pl_' + R.last); if (t) R.q.push({ id: c.id, t: 'msg', text: 'Planet!' }); });
    const ctx = { boss: b.boss, L };
    R.jokers.slice().forEach(j => {
      if (jOff(j)) { if (j.per && j.pl > 0) j.pl--; return; }
      const e = call(j, 'rend', ctx);
      if (e && e.$) L.push({ l: JK[j.k].n, v: e.$, id: j.id });
      if (e && e.msg) note(j.id, e.msg);
    });
    R.jokers.forEach(j => { if (j.per && j.pl > 0) { j.pl--; if (j.pl === 0) note(j.id, 'Debuffed'); } });
    R.jokers.filter(j => j.rn).forEach(j => L.push({ l: 'Rental: ' + JK[j.k].n, v: -3, id: j.id }));
    if (b.boss) {
      R.bossBeat++;
      const tg = R.tags.filter(t => t === 'invest');
      tg.forEach(() => L.push({ l: 'Investment Tag', v: 25 }));
      R.tags = R.tags.filter(t => t !== 'invest');
      if (R.dk === 'anaglyph') giveTag('double');
    }
    R.cash = { lines: L, total: L.reduce((a, x) => a + x.v, 0), score: sv };
    R.m.hst = 0;
    R.bl[R.bi].s = 'done';
    if (R.bi < 2) R.bl[R.bi + 1].s = 'sel';
    R.cons.forEach(c => { if (c.dec) c.dec = 0; });
    return R.cash;
  }
  function cashOut() {
    if (!R.cash) return;
    R.money += R.cash.total;
    R.cash = null;
    R.hand = []; R.disc = []; R.draw = []; R.play = [];
    const wasBoss = R.cur.boss;
    if (wasBoss && R.ante >= 8 && !R.won && !R.endless) { R.won = true; R.ph = 'win'; return 'win'; }
    enterShop();
    return 'shop';
  }

  function giveTag(k) {
    if (k === 'double') {
      const last = R.tags.filter(t => t !== 'double').pop() || R.lastTag;
      if (last && last !== 'double') { R.tags.push(last); R.tags.push(last); R.lastTag = last; }
      else R.tags.push('double');
      return;
    }
    R.tags.push(k); R.lastTag = k;
    if (k === 'orbital') { const ks = HORD.filter(knownHand); R.orbHand = pick(ks); }
    if (k === 'boss') { R.tags.pop(); R.boss = pickBoss(); R.bl[2].boss = R.boss; R.bossUsed.push(R.boss); }
    if (k === 'orbital') { R.tags.pop(); levelHand(pick(HORD.filter(knownHand)), 3); }
    if (k === 'juggle') { R.tags.pop(); R.m.hst += 3; }
  }

  const rollRar = () => { const p = rnd(); return p < .7 ? 1 : p < .95 ? 2 : 3; };
  function rollJoker(rar, ex) {
    rar = rar || rollRar();
    const have = new Set(R.jokers.map(j => j.k));
    if (R.shop) R.shop.items.forEach(i => { if (i.kind === 'joker') have.add(i.obj.k); });
    (ex || []).forEach(k => have.add(k));
    const sh = flag('showman');
    let pool = JL.filter(d => d.r === rar && (!d.need || d.need()) && (sh || !have.has(d.k)));
    if (!pool.length) pool = JL.filter(d => d.r === rar && !d.need);
    return pick(pool);
  }
  const PLANETS = HORD.map(k => 'pl_' + k);
  function rollCons(type, ex) {
    const have = new Set((ex || []).concat(R.cons.map(c => c.k)));
    if (type === 'tarot') {
      let pool = TL.filter(t => flag('showman') || !have.has(t.k));
      if (!pool.length) pool = TL;
      return pick(pool);
    }
    if (type === 'planet') {
      let pool = HORD.filter(knownHand).map(k => PLK['pl_' + k]).filter(t => flag('showman') || !have.has(t.k));
      if (!pool.length) pool = HORD.filter(knownHand).map(k => PLK['pl_' + k]);
      return pick(pool);
    }
    if (rnd() < .01 && !have.has('soul')) return SK.soul;
    if (rnd() < .01 && !have.has('hole')) return SK.hole;
    let pool = SL.filter(t => t.k !== 'soul' && t.k !== 'hole' && (flag('showman') || !have.has(t.k)));
    if (!pool.length) pool = SL.filter(t => t.k !== 'soul' && t.k !== 'hole');
    return pick(pool);
  }
  const discF = () => vo('fire') ? .5 : vo('mark') ? .75 : 1;
  const priceOf = base => Math.max(1, Math.floor(base * discF()));
  function jokerCost(j) {
    const d = JK[j.k];
    if (j.rn) return 1;
    return d.$ + (j.ed === 'foil' ? 2 : j.ed === 'holo' ? 3 : j.ed === 'poly' ? 5 : j.ed === 'neg' ? 5 : 0);
  }
  function stickers(j) {
    if (R.st >= 4 && rnd() < .3) j.et = 1;
    else if (R.st >= 7 && rnd() < .3) { j.per = 1; j.pl = 5; }
    if (R.st >= 8 && rnd() < .3) j.rn = 1;
    return j;
  }
  function shopItem(free) {
    const w = { joker: 20, tarot: 4 * (vo('ttycoon') ? 8 : vo('tmerch') ? 2.4 : 1), planet: 4 * (vo('ptycoon') ? 8 : vo('pmerch') ? 2.4 : 1), spectral: R.dk === 'ghost' ? 2 : 0, card: vo('illusion') || vo('trick') ? 4 : 0 };
    let t = Object.values(w).reduce((a, b) => a + b, 0) * rnd(), kind = 'joker';
    for (const k in w) { t -= w[k]; if (t < 0) { kind = k; break; } }
    let obj, base;
    if (kind === 'joker') {
      const d = rollJoker();
      obj = stickers(mkJoker(d.k, rollEd(edMod())));
      base = jokerCost(obj);
    } else if (kind === 'card') {
      obj = randCard();
      if (vo('illusion')) { if (rnd() < .4) obj.e = pick(['bonus', 'mult', 'wild', 'glass', 'steel', 'gold', 'lucky']); obj.ed = rnd() < .2 ? pick(['foil', 'holo', 'poly']) : null; if (rnd() < .2) obj.z = pick(['gold', 'red', 'blue', 'purple']); }
      base = 1;
    } else {
      const d = rollCons(kind);
      obj = newCons(kind, d.k, null);
      if (kind === 'planet' && vo('planetarium')) obj.free = 1;
      base = d.$;
    }
    if (kind === 'planet' && flag('freeplanet')) base = 0;
    return { kind, obj, price: free ? 0 : base === 0 ? 0 : kind === 'joker' && obj.rn ? 1 : priceOf(base) };
  }
  const PACKS = [
    ['arcana', 'normal', 4, 3, 1], ['arcana', 'jumbo', 2, 5, 1], ['arcana', 'mega', .5, 5, 2],
    ['cosmos', 'normal', 4, 3, 1], ['cosmos', 'jumbo', 2, 5, 1], ['cosmos', 'mega', .5, 5, 2],
    ['standard', 'normal', 4, 3, 1], ['standard', 'jumbo', 2, 5, 1], ['standard', 'mega', .5, 5, 2],
    ['jester', 'normal', 1.2, 2, 1], ['jester', 'jumbo', .6, 4, 1], ['jester', 'mega', .15, 4, 2],
    ['specter', 'normal', .6, 2, 1], ['specter', 'jumbo', .3, 4, 1], ['specter', 'mega', .07, 4, 2]
  ];
  const packCost = sz => sz === 'normal' ? 4 : sz === 'jumbo' ? 6 : 8;
  function rollPack(kind, size) {
    let p;
    if (kind) p = PACKS.find(x => x[0] === kind && x[1] === size);
    else {
      let t = PACKS.reduce((a, x) => a + (x[0] === 'specter' && R.dk !== 'ghost' && false ? 0 : x[2]), 0) * rnd();
      for (const x of PACKS) { t -= x[2]; if (t < 0) { p = x; break; } }
      p = p || PACKS[0];
    }
    return { id: nid(), kind: p[0], size: p[1], n: p[3], pick: p[4], price: priceOf(packCost(p[1])) };
  }
  function pickVoucher() {
    const have = Object.keys(R.vo);
    const pool = VL.filter(v => !R.vo[v.k] && (!v.req || R.vo[v.req]));
    return pool.length ? pick(pool).k : null;
  }
  function enterShop() {
    R.ph = 'shop';
    const items = [];
    R.shop = { items, packs: [], vouchers: [], rr: 0, rc: Math.max(0, 5 - (vo('rr1') ? 2 : 0) - (vo('rr2') ? 2 : 0)), free: false };
    const n = 2 + (vo('over') ? 1 : 0) + (vo('over2') ? 1 : 0);
    const coupon = R.tags.indexOf('coupon') >= 0;
    for (let i = 0; i < n; i++) items.push(shopItem(coupon));
    const packs = [];
    for (let i = 0; i < 2; i++) packs.push(rollPack());
    if (R.fs) { packs[0] = rollPack('jester', 'normal'); R.fs = false; }
    if (coupon) packs.forEach(p => { p.price = 0; });
    R.shop.packs = packs;
    if (R.vAnte !== R.ante || !R.vch) { R.vch = pickVoucher(); R.vAnte = R.ante; R.vBought = false; }
    if (R.vch && !R.vBought) R.shop.vouchers.push({ k: R.vch, price: coupon ? 0 : priceOf(10) });
    R.q.push({ t: 'shopin' });
    const tg = R.tags.slice();
    R.tags = [];
    tg.forEach(t => TGK[t].shop && TGK[t].shop());
    if (R.tags.indexOf('d6') >= 0) { }
    if (tg.indexOf('d6') >= 0) R.shop.rc = 0;
    R.tags = R.tags.concat(tg.filter(t => TGK[t].keep));
    fire('shopin', {});
    return R.shop;
  }
  function reroll() {
    const s = R.shop;
    if (!s || R.money - s.rc < -debtLim()) return false;
    R.money -= s.rc;
    s.rc++; s.rr++; R.stats.rerolls++;
    const old = s.items.slice();
    old.forEach(i => R.q.push({ id: i.obj.id, t: 'gone', how: 'fade' }));
    s.items = [];
    for (let i = 0; i < old.length; i++) s.items.push(shopItem(false));
    fire('reroll', {});
    return true;
  }
  function canAfford(p) { return R.money - p >= -debtLim(); }
  function buyItem(idx, use) {
    const s = R.shop, it = s.items[idx];
    if (!it || !canAfford(it.price)) return false;
    if (it.kind === 'joker') { if (jfree(it.obj.ed === 'neg') <= 0) return false; }
    else if (it.kind !== 'card' && !use) { if (cfree(it.obj.ed === 'neg') <= 0) return false; }
    R.money -= it.price;
    s.items.splice(idx, 1);
    R.stats.bought++;
    if (it.kind === 'joker') { R.jokers.push(it.obj); R.q.push({ id: it.obj.id, t: 'spawn', from: 'shop' }); }
    else if (it.kind === 'card') { addToDeck(it.obj); R.q.push({ id: 0, t: 'msg', text: 'Added to deck' }); }
    else { R.cons.push(it.obj); R.q.push({ id: it.obj.id, t: 'spawn', from: 'shop' }); }
    return it.obj;
  }
  function buyPack(idx) {
    const p = R.shop.packs[idx];
    if (!p || !canAfford(p.price)) return false;
    R.money -= p.price;
    R.shop.packs.splice(idx, 1);
    return openPack(p, 'shop');
  }
  function buyVoucher(idx) {
    const v = R.shop.vouchers[idx];
    if (!v || !canAfford(v.price)) return false;
    R.money -= v.price;
    R.shop.vouchers.splice(idx, 1);
    redeem(v.k);
    R.vBought = true;
    return true;
  }
  function redeem(k) {
    R.vo[k] = 1;
    VK[k].on && VK[k].on();
    R.q.push({ t: 'voucher', k });
  }
  function openPack(p, back) {
    R.back = back;
    R.ph = 'pack';
    const items = [], kind = p.kind;
    const ex = [];
    let tmp = [];
    for (let i = 0; i < p.n; i++) {
      let it;
      if (kind === 'arcana') {
        if (vo('omen') && rnd() < .2) { const d = rollCons('spectral', ex); it = { type: 'spectral', k: d.k }; }
        else if (vo('scope') && false) { }
        else { const d = rollCons('tarot', ex); it = { type: 'tarot', k: d.k }; }
      } else if (kind === 'cosmos') {
        let d;
        if (i === 0 && vo('scope') && R.hl[mostPlayed()].played > 0) d = PLK['pl_' + mostPlayed()];
        else d = rollCons('planet', ex);
        it = { type: 'planet', k: d.k };
      } else if (kind === 'specter') { const d = rollCons('spectral', ex); it = { type: 'spectral', k: d.k }; }
      else if (kind === 'jester') { const d = rollJoker(null, ex); it = { type: 'joker', k: d.k, ed: rollEd(edMod()) }; }
      else {
        const c = randCard();
        if (rnd() < .4) c.e = pick(['bonus', 'mult', 'wild', 'glass', 'steel', 'stone', 'gold', 'lucky']);
        const q = rnd();
        c.ed = q > .988 ? 'poly' : q > .96 ? 'holo' : q > .92 ? 'foil' : null;
        if (rnd() < .2) c.z = pick(['gold', 'red', 'blue', 'purple']);
        if (c.e === 'stone') { c.r = 2; }
        it = { type: 'card', card: c };
      }
      if (it.k) ex.push(it.k);
      if (it.type === 'joker') it.obj = mkJoker(it.k, it.ed);
      else if (it.type === 'card') it.obj = it.card;
      else it.obj = newCons(it.type, it.k, null);
      items.push(it);
    }
    R.pack = { p, items, left: p.pick, kind, hand: [] };
    if (kind === 'arcana' || kind === 'specter') {
      R.hand = shuffle(R.cards.slice()).slice(0, hsz());
      R.pack.hand = R.hand;
    }
    fire('pack', { kind });
    return R.pack;
  }
  function closePack() {
    const back = R.back;
    R.pack = null; R.hand = [];
    R.ph = back === 'blinds' ? 'blinds' : 'shop';
    return R.ph;
  }
  function packPick(idx, sel) {
    const pk = R.pack, it = pk.items[idx];
    if (!it) return false;
    if (it.type === 'joker') {
      if (jfree(it.obj.ed === 'neg') <= 0) return false;
      R.jokers.push(it.obj); R.q.push({ id: it.obj.id, t: 'spawn', from: 'pack' });
    } else if (it.type === 'card') { addToDeck(it.obj); }
    else {
      const d = CONSDEF(it.obj);
      if (!canUse(it.obj, sel, true)) return false;
      useConsumable(it.obj, sel, true);
    }
    pk.items.splice(idx, 1);
    pk.left--;
    if (pk.left <= 0 || !pk.items.length) return 'done';
    return true;
  }
  function skipPack() {
    fire('skippk', {});
    return closePack();
  }
  const CONSDEF = c => c.type === 'tarot' ? TK[c.k] : c.type === 'planet' ? PLK[c.k] : SK[c.k];
  function canUse(c, sel, inPack) {
    const d = CONSDEF(c);
    sel = sel || [];
    const inHand = R.ph === 'round' || (R.ph === 'pack' && R.pack && R.pack.hand.length);
    if (d.t) {
      if (!inHand) return false;
      if (sel.length < d.t[0] || sel.length > d.t[1]) return false;
    }
    if (d.ok && !d.ok(sel, c)) return false;
    if (d.nohand && !inHand && false) return false;
    return true;
  }
  function useConsumable(c, sel, inPack) {
    const d = CONSDEF(c);
    sel = (sel || []).slice();
    if (!inPack) killCons(c, 'use');
    const meta = { id: c.id };
    d.use(sel, c);
    if (c.type === 'tarot') R.stats.tarots++; else if (c.type === 'planet') R.stats.planets++; else R.stats.spectrals++;
    if ((c.type === 'tarot' || c.type === 'planet') && c.k !== 'fool') R.lastCons = { type: c.type, k: c.k };
    if (c.type === 'planet') R.planetsUsed[c.k] = 1;
    fire('use', { cons: c });
    return true;
  }
  function sellItem(o) {
    if (o.et) return false;
    const v = sellVal(o);
    R.money += v;
    if (o.type) { killCons(o, 'sell'); }
    else {
      const d = JK[o.k];
      if (d.sell) d.sell({ R, j: o }, o);
      killJoker(o, 'sell');
      if (bossOn('leaf')) R.leafOk = true;
    }
    fire('sold', { item: o });
    return v;
  }
  function setBlindAction(bi, act) {
    const b = R.bl[bi];
    if (act === 'skip') {
      if (b.k === 'boss') return false;
      b.s = 'skip'; R.bl[bi + 1].s = 'sel'; R.skips++;
      const tg = b.tag;
      giveTag(tg);
      fire('skipb', {});
      return tg;
    }
    return beginRound(bi);
  }
  function rerollBoss() {
    const cost = vo('retcon') ? 0 : 10;
    if (!vo('dcut') && !vo('retcon')) return false;
    if (R.bl[2].s !== 'up' && R.bl[2].s !== 'sel') return false;
    if (R.money - cost < -debtLim()) return false;
    if (!vo('retcon') && R.bossRerolled === R.ante) return false;
    R.money -= cost; R.bossRerolled = R.ante;
    R.bossUsed.push(R.boss);
    R.boss = pickBoss(); R.bl[2].boss = R.boss;
    return true;
  }
  function nextBlind() {
    R.cur = null;
    if (R.bl.every(b => b.s === 'done' || b.s === 'skip')) {
      R.ante++; R.bossUsed.push(R.boss);
      genBlinds();
      R.bossRerolled = 0;
      R.endless = R.endless || R.ante > 8;
    }
    R.ph = 'blinds';
    fire('shopout', {});
    R.shop = null;
    R.m.hst = R.m.hst;
  }
  function gameOver() { R.ph = 'over'; }

  function ser() {
    const o = JSON.parse(JSON.stringify(R, (k, v) => (k === 'draw' || k === 'hand' || k === 'disc' || k === 'play' || k === 'q' || k === 'back_') ? undefined : v));
    ['draw', 'hand', 'disc', 'play'].forEach(k => { o[k] = R[k].map(c => c.id); });
    o.rs = RS;
    o.q = [];
    if (o.pack) o.pack.hand = R.pack.hand.map(c => c.id);
    return o;
  }
  function deser(o) {
    R = o;
    RS = o.rs;
    const by = new Map(R.cards.map(c => [c.id, c]));
    ['draw', 'hand', 'disc', 'play'].forEach(k => { R[k] = (o[k] || []).map(id => by.get(id)).filter(Boolean); });
    if (R.pack) R.pack.hand = (R.pack.hand || []).map(id => by.get(id)).filter(Boolean);
    R.q = [];
    return R;
  }

  const J = (k, n, r, $, d, o, th) => { const x = Object.assign({ k, n, r, $, d, th }, o || {}); JK[k] = x; JL.push(x); return x; };
  const T = (k, n, d, t, use, ok) => { const x = { k, n, d, t, use, ok, type: 'tarot', $: 3 }; TK[k] = x; TL.push(x); };
  const SP = (k, n, d, t, use, ok) => { const x = { k, n, d, t, use, ok, type: 'spectral', $: 4 }; SK[k] = x; SL.push(x); };
  const V = (k, n, d, req, on) => { const x = { k, n, d, req, on }; VK[k] = x; VL.push(x); };
  const B = (k, n, d, min, col, o) => { const x = Object.assign({ k, n, d, min, col }, o || {}); BK[k] = x; BL.push(x); };
  const TG = (k, n, d, col, shop, o) => { const x = Object.assign({ k, n, d, col, shop }, o || {}); TGK[k] = x; TGL.push(x); };
  const jq = id => R.q.push({ id, t: 'juice' });
  const setE = (sel, e) => sel.forEach(c => { c.e = e; jq(c.id); });
  const lowest = h => { let b = null; h.forEach(c => { if (c.e !== 'stone' && (!b || chipVal(c) <= chipVal(b))) b = c; }); return b; };

  const CONSN = n => n;
  T('fool', 'The Fool', 'Creates the last Tarot or Planet card used during this run (The Fool excluded)', null, () => { if (R.lastCons) addCons(R.lastCons.type, R.lastCons.k); }, () => !!R.lastCons);
  T('magician', 'The Magician', 'Enhances up to 2 selected cards to Lucky Cards', [1, 2], s => setE(s, 'lucky'));
  T('priestess', 'The High Priestess', 'Creates up to 2 random Planet cards (must have room)', null, () => { for (let i = 0; i < 2; i++) if (cfree() > 0) addCons('planet', rollCons('planet').k); });
  T('empress', 'The Empress', 'Enhances up to 2 selected cards to Mult Cards', [1, 2], s => setE(s, 'mult'));
  T('emperor', 'The Emperor', 'Creates up to 2 random Tarot cards (must have room)', null, () => { for (let i = 0; i < 2; i++) if (cfree() > 0) addCons('tarot', rollCons('tarot').k); });
  T('hierophant', 'The Hierophant', 'Enhances up to 2 selected cards to Bonus Cards', [1, 2], s => setE(s, 'bonus'));
  T('lovers', 'The Lovers', 'Enhances 1 selected card into a Wild Card', [1, 1], s => setE(s, 'wild'));
  T('chariot', 'The Chariot', 'Enhances 1 selected card into a Steel Card', [1, 1], s => setE(s, 'steel'));
  T('justice', 'Justice', 'Enhances 1 selected card into a Glass Card', [1, 1], s => setE(s, 'glass'));
  T('hermit', 'The Hermit', 'Doubles your money (max +$20)', null, () => { R.money += Math.min(20, Math.max(0, R.money)); R.q.push({ t: 'cash' }); });
  T('wheel', 'Wheel of Fortune', '1 in 4 chance to add Foil, Holographic or Polychrome edition to a random Joker', null, () => {
    const p = R.jokers.filter(j => !j.ed);
    if (luck(1, 4) && p.length) { const j = pick(p), r = rnd(); j.ed = r < .5 ? 'foil' : r < .85 ? 'holo' : 'poly'; jq(j.id); }
    else R.q.push({ id: 0, t: 'msg', text: 'Nope!' });
  });
  T('strength', 'Strength', 'Increases rank of up to 2 selected cards by 1', [1, 2], s => s.forEach(c => { c.r = c.r === 14 ? 2 : c.r + 1; jq(c.id); }));
  T('hanged', 'The Hanged Man', 'Destroys up to 2 selected cards', [1, 2], s => destroyCards(s, 'destroy'));
  T('death', 'Death', 'Select 2 cards, convert the left card into the right card', [2, 2], s => {
    const o = s.slice().sort((a, b) => R.hand.indexOf(a) - R.hand.indexOf(b));
    const a = o[0], b = o[1];
    ['r', 's', 'e', 'ed', 'z', 'x'].forEach(k => { a[k] = b[k]; }); jq(a.id);
  });
  T('temperance', 'Temperance', 'Gives the total sell value of all current Jokers (max $50)', null, () => { R.money += Math.min(50, R.jokers.reduce((a, j) => a + sellVal(j), 0)); R.q.push({ t: 'cash' }); });
  T('devil', 'The Devil', 'Enhances 1 selected card into a Gold Card', [1, 1], s => setE(s, 'gold'));
  T('tower', 'The Tower', 'Enhances 1 selected card into a Stone Card', [1, 1], s => setE(s, 'stone'));
  T('star', 'The Star', 'Converts up to 3 selected cards to Diamonds', [1, 3], s => s.forEach(c => { c.s = 3; jq(c.id); }));
  T('moon', 'The Moon', 'Converts up to 3 selected cards to Clubs', [1, 3], s => s.forEach(c => { c.s = 2; jq(c.id); }));
  T('sun', 'The Sun', 'Converts up to 3 selected cards to Hearts', [1, 3], s => s.forEach(c => { c.s = 1; jq(c.id); }));
  T('judgement', 'Judgement', 'Creates a random Joker card (must have room)', null, () => { const d = rollJoker(); addJoker(d.k, rollEd(edMod())); }, () => jfree() > 0);
  T('world', 'The World', 'Converts up to 3 selected cards to Spades', [1, 3], s => s.forEach(c => { c.s = 0; jq(c.id); }));

  HORD.forEach(id => {
    const h = HAND[id];
    PLK['pl_' + id] = {
      k: 'pl_' + id, n: h.pl, type: 'planet', $: 3, hid: id,
      d: () => 'Level up ' + h.n + ': +' + h.lc + ' Chips and +' + h.lm + ' Mult',
      use: () => { levelHand(id, 1); R.q.push({ t: 'lvl', hid: id }); }
    };
  });

  const clone = (j) => {
    const st = JSON.parse(JSON.stringify(j));
    delete st.id; delete st.k; delete st.ed; delete st.et; delete st.per; delete st.rn;
    return addJoker(j.k, j.ed, { st, force: true });
  };
  const killOthers = keep => R.jokers.slice().forEach(j => { if (j !== keep && !j.et) killJoker(j, 'destroy'); });
  const addEnh = (n, o) => { for (let i = 0; i < n; i++) { const c = randCard(Object.assign({ enh: true }, o)); addToDeck(c, 'hand'); } };
  const hasHand = () => R.hand.length > 0;
  SP('ghoul', 'Ghoul Court', 'Destroy 1 random card in your hand, add 3 random enhanced face cards to your hand', null, () => { destroyCards([pick(R.hand)]); addEnh(3, { face: true }); }, hasHand);
  SP('reaper', "Reaper's Due", 'Destroy 1 random card in your hand, add 2 random enhanced Aces to your hand', null, () => { destroyCards([pick(R.hand)]); addEnh(2, { ace: true }); }, hasHand);
  SP('whisper', 'Whisper Rite', 'Destroy 1 random card in your hand, add 4 random enhanced numbered cards to your hand', null, () => { destroyCards([pick(R.hand)]); addEnh(4, { num: true }); }, hasHand);
  SP('charm', 'Gilded Charm', 'Add a Gold Seal to 1 selected card', [1, 1], s => { s[0].z = 'gold'; jq(s[0].id); });
  SP('stamp', 'Echo Stamp', 'Add a Red Seal to 1 selected card', [1, 1], s => { s[0].z = 'red'; jq(s[0].id); });
  SP('blue', 'Azure Stamp', 'Add a Blue Seal to 1 selected card', [1, 1], s => { s[0].z = 'blue'; jq(s[0].id); });
  SP('violet', 'Violet Stamp', 'Add a Purple Seal to 1 selected card', [1, 1], s => { s[0].z = 'purple'; jq(s[0].id); });
  SP('halo', 'Halo Veil', 'Add a random Foil, Holographic or Polychrome edition to 1 selected card', [1, 1], s => { s[0].ed = pick(['foil', 'holo', 'poly']); jq(s[0].id); });
  SP('thief', 'Pale Thief', 'Creates a random Rare Joker (must have room), sets money to $0', null, () => { addJoker(rollJoker(3).k, null); R.money = 0; }, () => jfree() > 0);
  SP('sigil', 'Suit Sigil', 'Converts all cards in hand to a single random suit', null, () => { const s = rint(4); R.hand.forEach(c => { c.s = s; jq(c.id); }); }, hasHand);
  SP('board', 'Rank Board', 'Converts all cards in hand to a single random rank, -1 hand size', null, () => { const r = 2 + rint(13); R.hand.forEach(c => { c.r = r; jq(c.id); }); R.m.hs--; }, hasHand);
  SP('light', 'Ghost Light', 'Add Negative to a random Joker, -1 hand size', null, () => { const p = R.jokers.filter(j => !j.ed); const j = pick(p); j.ed = 'neg'; jq(j.id); R.m.hs--; }, () => R.jokers.some(j => !j.ed));
  SP('pyre', 'Pyre', 'Destroys 5 random cards in your hand, gain $20', null, () => { destroyCards(shuffle(R.hand.slice()).slice(0, 5)); R.money += 20; R.q.push({ t: 'cash' }); }, hasHand);
  SP('idol', 'Mirror Idol', 'Create a copy of a random Joker, destroy all other Jokers', null, () => { const j = pick(R.jokers); killOthers(j); clone(j); }, () => R.jokers.length > 0);
  SP('hex2', 'Curse of Colors', 'Add Polychrome to a random Joker, destroy all other Jokers', null, () => { const p = R.jokers.filter(j => !j.ed), j = pick(p.length ? p : R.jokers); j.ed = 'poly'; jq(j.id); killOthers(j); }, () => R.jokers.length > 0);
  SP('clone', 'Clone Rite', 'Create 2 copies of 1 selected card in your hand', [1, 1], s => { for (let i = 0; i < 2; i++) addToDeck(Object.assign({}, s[0], { id: nid() }), 'hand'); });
  SP('soul', 'Lost Spirit', 'Creates a Legendary Joker (must have room)', null, () => { addJoker(pick(['kingsfool', 'canio', 'memento', 'bosswhisper', 'hoarder'])); }, () => jfree() > 0);
  SP('hole', 'Void Core', 'Upgrade every poker hand by 1 level', null, () => { HORD.forEach(k => levelHand(k, 1)); R.q.push({ t: 'lvl' }); });

  V('over', 'Wide Shelves', '+1 card slot available in the shop', null, () => { if (R.shop) R.shop.items.push(shopItem(false)); });
  V('over2', 'Endless Shelves', '+1 more card slot available in the shop', 'over', () => { if (R.shop) R.shop.items.push(shopItem(false)); });
  V('mark', 'Markdown', 'All cards and packs in the shop are 25% off', null, () => { if (R.shop) repriceShop(); });
  V('fire', 'Fire Sale', 'All cards and packs in the shop are 50% off', 'mark', () => { if (R.shop) repriceShop(); });
  V('polish', 'Polish', 'Foil, Holographic and Polychrome cards appear 2X more often', null);
  V('lustre', 'Lustre', 'Foil, Holographic and Polychrome cards appear 4X more often', 'polish');
  V('rr1', 'Reroll Coupon', 'Rerolls cost $2 less', null, () => { if (R.shop) R.shop.rc = Math.max(0, R.shop.rc - 2); });
  V('rr2', 'Reroll Pass', 'Rerolls cost $2 less', 'rr1', () => { if (R.shop) R.shop.rc = Math.max(0, R.shop.rc - 2); });
  V('pocket', 'Spare Pocket', '+1 consumable slot', null);
  V('omen', 'Omen Pocket', 'Oracle Packs can contain Specter cards', 'pocket');
  V('scope', 'Spyglass', 'Cosmos Packs always contain the Planet for your most played hand', null);
  V('obs', 'Star Chart', 'Planet cards in your consumables give X1.5 Mult for their hand type', 'scope');
  V('grab', 'Extra Grip', '+1 hand each round', null);
  V('tongs', 'Long Tongs', '+1 hand each round', 'grab');
  V('waste', 'Spendthrift', '+1 discard each round', null);
  V('recycle', 'Recycler', '+1 discard each round', 'waste');
  V('tmerch', 'Tarot Stand', 'Tarot cards appear 2X more frequently in the shop', null);
  V('ttycoon', 'Tarot Empire', 'Tarot cards appear 4X more frequently in the shop', 'tmerch');
  V('pmerch', 'Planet Stand', 'Planet cards appear 2X more frequently in the shop', null);
  V('ptycoon', 'Planet Empire', 'Planet cards appear 4X more frequently in the shop', 'pmerch');
  V('seed', 'Piggy Bank', 'Raise the interest cap to $50 (max $10 interest)', null);
  V('tree', 'Money Orchard', 'Raise the interest cap to $100 (max $20 interest)', 'seed');
  V('blank', 'Blank Slip', 'Does nothing?', null);
  V('void', 'Void Slot', '+1 Joker slot', 'blank');
  V('trick', 'Card Trick', 'Playing cards can appear in the shop', null);
  V('illusion', 'Grand Illusion', 'Playing cards in the shop may have enhancements, editions and seals', 'trick');
  V('warp', 'Time Warp', 'Permanently -1 Hand each round, -1 Ante', null, () => { R.m.h--; R.ante = Math.max(1, R.ante - 1); });
  V('rewind', 'Rewind', 'Permanently -1 Discard each round, -1 Ante', 'warp', () => { R.m.d--; R.ante = Math.max(1, R.ante - 1); });
  V('dcut', 'Boss Reroll', 'Reroll the Boss Blind once per Ante for $10', null);
  V('retcon', 'Retcon', 'Reroll the Boss Blind as many times as you like for free', 'dcut');
  V('paint', 'Wider Hand', '+1 hand size', null);
  V('palette', 'Widest Hand', '+1 hand size', 'paint');
  function repriceShop() {
    R.shop.items.forEach(i => { if (i.price > 0) { const b = i.kind === 'joker' ? jokerCost(i.obj) : i.kind === 'card' ? 1 : (CONSDEF(i.obj).$); i.price = priceOf(b); } });
    R.shop.packs.forEach(p => { if (p.price > 0) p.price = priceOf(packCost(p.size)); });
    R.shop.vouchers.forEach(v => { if (v.price > 0) v.price = priceOf(10); });
  }

  B('hook', 'Pickpocket', 'Discards 2 random cards from your hand after each hand played', 1, '#c43c3c');
  B('ox', 'Bull', 'Playing your most played hand sets money to $0', 2, '#d9742a');
  B('house', 'Closed Door', 'First hand is drawn face down', 2, '#6a5acd');
  B('wall', 'Brick Wall', 'Extra large blind (4X)', 2, '#8a5a8a', { mult: 4 });
  B('wheel', 'Roulette', '1 in 7 cards are drawn face down', 2, '#3aa86a');
  B('arm', 'Weight', 'Decreases the level of the played poker hand by 1', 2, '#6a7acd');
  B('club', 'Frost', 'All Clubs are debuffed', 1, '#2f8a6a');
  B('head', 'Heartbreak', 'All Hearts are debuffed', 1, '#e0453a');
  B('goad', 'Barbed', 'All Spades are debuffed', 1, '#4a5a8a');
  B('window', 'Stained Glass', 'All Diamonds are debuffed', 1, '#e98a2e');
  B('psychic', 'Mind Reader', 'Must play 5 cards', 1, '#d8b83a');
  B('fish', 'Drifter', 'Cards are drawn face down after each hand played', 2, '#3a8ac8');
  B('mouth', 'Mute', 'Only one hand type can be played this round', 2, '#a85a8a');
  B('eye', 'Watcher', 'No repeat hand types this round', 3, '#4a8ae8');
  B('plant', 'Overgrowth', 'All face cards are debuffed', 4, '#5a9a3a');
  B('needle', 'Pinprick', 'Play only 1 hand', 2, '#6a8a2a');
  B('water', 'Drought', 'Start with 0 discards', 2, '#4ab8d8');
  B('manacle', 'Shackle', '-1 hand size', 1, '#8a8a8a');
  B('flint', 'Cold Snap', 'Base Chips and Mult are halved', 2, '#d86a2a');
  B('mark', 'Faceless', 'All face cards are drawn face down', 2, '#7a3a5a');
  B('tooth', 'Toll', 'Lose $1 per card played', 3, '#c83a3a');
  B('serpent', 'Hydra', 'After play or discard, always draw 3 cards', 5, '#3a6a3a');
  B('pillar', 'Column', 'Cards played previously this ante are debuffed', 1, '#7a5a3a');
  B('acorn', 'Shuffle Shell', 'Flips and shuffles all Jokers', 8, '#e8902a', { fin: 1, mult: 2 });
  B('leaf', 'Wilted Leaf', 'All cards are debuffed until 1 Joker is sold', 8, '#4aa84a', { fin: 1, mult: 2 });
  B('vessel', 'Royal Vessel', 'Extra extra large blind (6X)', 8, '#8a3ad8', { fin: 1, mult: 6 });
  B('heart', 'Crimson Core', 'A random Joker is disabled every hand', 8, '#c8283a', { fin: 1, mult: 2 });
  B('bell', 'Cerulean Toll', 'Forces 1 card to always be selected', 8, '#3a78d8', { fin: 1, mult: 2 });

  const shopPush = (kind, obj, price) => R.shop.items.unshift({ kind, obj, price });
  const edJ = ed => () => { const d = rollJoker(); shopPush('joker', mkJoker(d.k, ed), 0); };
  const freePack = (k, s) => () => { const p = rollPack(k, s); p.price = 0; R.shop.packs.unshift(p); };
  TG('uncommon', 'Uncommon Tag', 'Shop has a free Uncommon Joker', '#6fcf86', () => { shopPush('joker', mkJoker(rollJoker(2).k), 0); });
  TG('rare', 'Rare Tag', 'Shop has a free Rare Joker', '#f06a5a', () => { shopPush('joker', mkJoker(rollJoker(3).k), 0); }, { min: 2 });
  TG('neg', 'Negative Tag', 'Shop has a free Negative Joker', '#222a3a', () => { const d = rollJoker(); shopPush('joker', mkJoker(d.k, 'neg'), 0); }, { min: 2 });
  TG('foil', 'Foil Tag', 'Shop has a free Foil Joker', '#8fb2e8', edJ('foil'));
  TG('holo', 'Holo Tag', 'Shop has a free Holographic Joker', '#e870c8', edJ('holo'));
  TG('poly', 'Poly Tag', 'Shop has a free Polychrome Joker', '#c58aff', edJ('poly'));
  TG('invest', 'Investment Tag', 'Gain $25 after defeating the next Boss Blind', '#3aa86a', null, { keep: 1 });
  TG('voucher', 'Voucher Tag', 'Adds a Voucher to the next shop', '#e8c040', () => { const have = R.shop.vouchers.map(v => v.k), pool = VL.filter(v => !R.vo[v.k] && have.indexOf(v.k) < 0 && (!v.req || R.vo[v.req])); if (pool.length) R.shop.vouchers.push({ k: pick(pool).k, price: priceOf(10) }); });
  TG('boss', 'Boss Tag', 'Rerolls the Boss Blind', '#8a5a8a', null);
  TG('standard', 'Playing Tag', 'Free Mega Playing Pack in the next shop', '#c8402a', freePack('standard', 'mega'));
  TG('charm', 'Charm Tag', 'Free Mega Oracle Pack in the next shop', '#a85ac8', freePack('arcana', 'mega'));
  TG('meteor', 'Meteor Tag', 'Free Mega Cosmos Pack in the next shop', '#3a78d8', freePack('cosmos', 'mega'));
  TG('buffoon', 'Jester Tag', 'Free Jumbo Jester Pack in the next shop', '#e8902a', freePack('jester', 'jumbo'));
  TG('ethereal', 'Ethereal Tag', 'Free Specter Pack in the next shop', '#6a8ae8', freePack('specter', 'normal'));
  TG('handy', 'Handy Tag', 'Gain $1 per hand played this run', '#e8a02a', () => { R.money += R.tot.h; }, { min: 2 });
  TG('garbage', 'Garbage Tag', 'Gain $1 per unused discard this run', '#7a9a3a', () => { R.money += R.tot.ud || 0; }, { min: 2 });
  TG('coupon', 'Coupon Tag', 'Initial shop items and packs are free', '#e85a5a', null, {});
  TG('double', 'Double Tag', 'Gives a copy of the next Tag selected', '#3a9ac8', null, { keep: 1 });
  TG('juggle', 'Juggle Tag', '+3 hand size next round', '#4ab8a8', null);
  TG('d6', 'D6 Tag', 'Rerolls start at $0 in the next shop', '#6a8a9a', null);
  TG('top', 'Top-up Tag', 'Create up to 2 Common Jokers', '#8a9ae8', () => { for (let i = 0; i < 2; i++) if (jfree() > 0) addJoker(rollJoker(1).k); });
  TG('speed', 'Speed Tag', 'Gain $5 per blind skipped this run', '#e8d03a', () => { R.money += 5 * R.skips; });
  TG('orbital', 'Orbital Tag', 'Upgrades a random poker hand by 3 levels', '#6a4ac8', null, { min: 2 });
  TG('economy', 'Economy Tag', 'Doubles your money (max +$40)', '#e8c040', () => { R.money += Math.min(40, Math.max(0, R.money)); });

  const DECKS = {
    red: ['Ruby Deck', '+1 discard every round'],
    blue: ['Sapphire Deck', '+1 hand every round'],
    yellow: ['Amber Deck', 'Start with extra $10'],
    green: ['Emerald Deck', 'At end of round: $2 per remaining hand, $1 per remaining discard. Earn no interest'],
    black: ['Onyx Deck', '+1 Joker slot, -1 hand every round'],
    magic: ['Mystic Deck', 'Start with the Spare Pocket voucher and 2 copies of The Fool'],
    nebula: ['Nebula Deck', 'Start with the Spyglass voucher, -1 consumable slot'],
    ghost: ['Phantom Deck', 'Specter cards may appear in the shop. Start with a Curse of Colors card'],
    abandoned: ['Hollow Deck', 'Start with no face cards in your deck'],
    checkered: ['Checker Deck', 'Start with 26 Spades and 26 Hearts in deck'],
    zodiac: ['Zodiac Deck', 'Start with Tarot Stand, Planet Stand and Wide Shelves'],
    painted: ['Palette Deck', '+2 hand size, -1 Joker slot'],
    anaglyph: ['Twin-Lens Deck', 'After defeating each Boss Blind, gain a Double Tag'],
    plasma: ['Fusion Deck', 'Balances Chips and Mult when calculating score for played hand. X2 base Blind size'],
    erratic: ['Chaos Deck', 'All ranks and suits in your starting deck are randomized']
  };
  const DK = Object.keys(DECKS);
  const STAKES = [
    ['Paper Stake', 'Base difficulty'],
    ['Copper Stake', 'Small Blind gives no reward money'],
    ['Jade Stake', 'Required score scales faster for each Ante'],
    ['Obsidian Stake', 'Shop can have Eternal Jokers (cannot be sold or destroyed)'],
    ['Sapphire Stake', '-1 discard every round'],
    ['Amethyst Stake', 'Required score scales even faster for each Ante'],
    ['Amber Stake', 'Shop can have Perishable Jokers (debuffed after 5 rounds)'],
    ['Gilt Stake', 'Shop can have Rental Jokers (cost $3 per round)']
  ];
  const STCOL = ['#e8e8f0', '#e0453a', '#4cc66a', '#3a3a4a', '#3a78d8', '#9a4bd6', '#e98a2e', '#f2c744'];

  const cnt = (k, f) => R.cards.filter(f).length;
  const nameR = r => RNAME[r - 2] + 's';
  const mostPlayedCnt = () => Math.max.apply(null, HORD.map(k => R.hl[k].played));
  const faceCt = c => c.sc.filter(k => isFace(k)).length;

  J('imp', 'Cheerful Imp', 1, 2, '+4 Mult', { main: () => ({ m: 4 }) }, 'plus');
  J('sunbather', 'Sunbather', 1, 5, 'Played cards with Diamond suit give +3 Mult when scored', { card: c => suitIs(c.card, 3) && { m: 3 } }, 's3');
  J('valentine', 'Valentine', 1, 5, 'Played cards with Heart suit give +3 Mult when scored', { card: c => suitIs(c.card, 1) && { m: 3 } }, 's1');
  J('gravedigger', 'Gravedigger', 1, 5, 'Played cards with Spade suit give +3 Mult when scored', { card: c => suitIs(c.card, 0) && { m: 3 } }, 's0');
  J('cloverkid', 'Clover Kid', 1, 5, 'Played cards with Club suit give +3 Mult when scored', { card: c => suitIs(c.card, 2) && { m: 3 } }, 's2');
  J('pairwise', 'Pairwise', 1, 4, '+8 Mult if played hand contains a Pair', { main: c => c.has.pair && { m: 8 } }, 'plus');
  J('twotimer', 'Two-Timer', 1, 4, '+10 Mult if played hand contains Two Pair', { main: c => c.has.two && { m: 10 } }, 'plus');
  J('triplethreat', 'Triple Threat', 1, 4, '+12 Mult if played hand contains a Three of a Kind', { main: c => c.has.three && { m: 12 } }, 'plus');
  J('longhaul', 'Long Haul', 1, 4, '+12 Mult if played hand contains a Straight', { main: c => c.has.straight && { m: 12 } }, 'plus');
  J('tidepool', 'Tidepool', 1, 4, '+10 Mult if played hand contains a Flush', { main: c => c.has.flush && { m: 10 } }, 'plus');
  J('pennypair', 'Penny Pair', 1, 3, '+50 Chips if played hand contains a Pair', { main: c => c.has.pair && { c: 50 } }, 'coin');
  J('doubledime', 'Double Dime', 1, 4, '+80 Chips if played hand contains Two Pair', { main: c => c.has.two && { c: 80 } }, 'coin');
  J('triplecrown', 'Triple Crown', 1, 5, '+100 Chips if played hand contains a Three of a Kind', { main: c => c.has.three && { c: 100 } }, 'coin');
  J('highway', 'Highway Toll', 1, 4, '+100 Chips if played hand contains a Straight', { main: c => c.has.straight && { c: 100 } }, 'coin');
  J('splashzone', 'Splash Zone', 1, 4, '+80 Chips if played hand contains a Flush', { main: c => c.has.flush && { c: 80 } }, 'coin');
  J('goose', 'Gilded Goose', 1, 6, 'Earn $4 at end of round', { rend: () => ({ $: 4 }) }, 'coin');
  J('nestegg', 'Nest Egg', 1, 4, 'Sell value of this card increases by $3 at end of round', { rend: (c, j) => { j.a += 3; return { msg: '+$3 value' }; } }, 'gem');
  J('gigglebox', 'Giggle Box', 1, 4, 'Played face cards give +5 Mult when scored', { card: c => isFace(c.card) && { m: 5 } }, 'star');
  J('gargoyle', 'Gargoyle', 1, 4, 'Played face cards give +30 Chips when scored', { card: c => isFace(c.card) && { c: 30 } }, 'skull');
  J('radio', 'Radio Ten-Four', 1, 4, 'Played 10s or 4s give +10 Chips and +4 Mult when scored', { card: c => (c.card.r === 10 || c.card.r === 4) && c.card.e !== 'stone' && { c: 10, m: 4 } }, 'plus');
  J('spiral', 'Spiral Shell', 1, 4, 'Played Aces, 2s, 3s, 5s and 8s give +8 Mult when scored', { card: c => [14, 2, 3, 5, 8].indexOf(c.card.r) >= 0 && c.card.e !== 'stone' && { m: 8 } }, 'star');
  J('leftovers', 'Leftovers', 1, 5, '+30 Chips for each remaining discard', { main: () => R.discards > 0 && { c: 30 * R.discards } }, 'coin');
  J('laststand', 'Last Stand', 1, 5, '+15 Mult when 0 discards remain', { main: () => R.discards === 0 && { m: 15 } }, 'plus');
  J('halfmeasure', 'Half-Measure', 1, 5, '+20 Mult if played hand contains 3 or fewer cards', { main: c => c.played.length <= 3 && { m: 20 } }, 'plus');
  J('glitch', 'Glitch', 1, 4, '+0 to +23 Mult at random', { main: () => ({ m: rint(24) }) }, 'dice');
  J('lowball', 'Lowball', 1, 5, 'Adds double the rank of the lowest ranked card held in hand to Mult', { held: c => c.card === lowest(c.held) && { m: 2 * chipVal(c.card) } }, 'ex');
  J('overdraft', 'Overdraft', 1, 1, 'Go up to -$20 in debt', { p: { debt: 20 } }, 'coin');
  J('patience', 'Patience', 1, 4, 'Earn $2 per remaining discard at end of round if no discards were used', { rend: () => R.dUsed === 0 && R.discards > 0 && { $: 2 * R.discards } }, 'clock');
  J('bribe', 'Bribe Envelope', 1, 4, 'Played face cards have a 1 in 2 chance to give $2 when scored', { card: c => isFace(c.card) && luck(1, 2) && { $: 2 } }, 'coin');
  J('banana', 'Banana Split', 1, 6, '+15 Mult. 1 in 6 chance this card is destroyed at end of round', { main: () => ({ m: 15 }), rend: (c, j) => { if (luck(1, 6)) { killJoker(j, 'melt'); R.ext.banana = 1; return { msg: 'Extinct!' }; } } }, 'star');
  J('melting', 'Melting Pop', 1, 5, '+100 Chips. -5 Chips for every hand played', { init: () => ({ c: 100 }), nb: 1, d: j => '+' + j.c + ' Chips. -5 Chips for every hand played', main: (c, j) => ({ c: j.c }), after: (c, j) => { if (c.copy) return; j.c -= 5; if (j.c <= 0) { killJoker(j, 'melt'); return { msg: 'Melted!' }; } } }, 'clock');
  J('clouds', 'Head in Clouds', 1, 5, 'Earn $1 for each 9 in your full deck at end of round', { rend: () => { const n = cnt('', k => k.r === 9 && k.e !== 'stone'); return n > 0 && { $: n }; } }, 'star');
  J('valet', 'Valet', 1, 6, 'Face cards held in hand have a 1 in 2 chance to give $1', { held: c => isFace(c.card) && luck(1, 2) && { $: 1 } }, 'coin');
  J('returnslip', 'Return Slip', 1, 6, j => 'Earn $5 for each discarded ' + nameR(j.rk) + ' (rank changes every round)', { init: () => ({ rk: 2 + rint(13) }), disc: (c, j) => { const n = c.cards.filter(k => k.r === j.rk && k.e !== 'stone').length; return n > 0 && { $: 5 * n }; }, rend: (c, j) => { const k = R.cards.filter(x => x.e !== 'stone'); if (k.length) j.rk = pick(k).r; } }, 'ex');
  J('chorechart', 'Chore Chart', 1, 4, j => 'Earn $4 if played hand is a ' + HAND[j.hid].n + ' (changes every round)', { init: () => ({ hid: pick(['pair', 'two', 'three', 'straight', 'flush', 'fh', 'four']) }), main: (c, j) => c.h.id === j.hid && { $: 4 }, rend: (c, j) => { j.hid = pick(HORD.filter(k => knownHand(k) && k !== j.hid)); } }, 'clock');
  J('daydream', 'Daydream', 1, 4, '1 in 2 chance to create a Tarot card when any Booster Pack is opened', { pack: () => { if (luck(1, 2) && cfree() > 0) { addCons('tarot', rollCons('tarot').k); return { msg: 'Tarot!' }; } } }, 'star');
  J('palmreader', 'Palm Reader', 1, 6, j => 'Gains +1 Mult when a Tarot card is used (Currently +' + j.m + ')', { init: () => ({ m: 0 }), nb: 1, main: (c, j) => j.m > 0 && { m: j.m }, use: (c, j) => { if (c.cons.type === 'tarot') j.m += 1; } }, 'star');
  J('performer', 'Street Performer', 1, 4, '+1 hand size', { p: { hs: 1 } }, 'plus');
  J('tipsy', 'Tipsy', 1, 4, '+1 discard each round', { p: { d: 1 } }, 'plus');
  J('peapod', 'Pea Pod', 1, 5, j => 'Gains +1 Mult every hand played, -1 Mult for every discard (Currently +' + j.m + ')', { init: () => ({ m: 0 }), nb: 1, before: (c, j) => { if (!c.copy) j.m += 1; }, disc: (c, j) => { j.m = Math.max(0, j.m - 1); }, main: (c, j) => j.m > 0 && { m: j.m } }, 'plus');
  J('echochamber', 'Echo Chamber', 1, 5, '+Mult equal to the number of times the played poker hand has been played this run', { main: c => ({ m: R.hl[c.h.id].played }) }, 'plus');
  J('sprinter', 'Sprinter', 1, 5, j => 'Gains +15 Chips if played hand contains a Straight (Currently +' + j.c + ')', { init: () => ({ c: 0 }), nb: 1, before: (c, j) => { if (c.has.straight) j.c += 15; }, main: (c, j) => j.c > 0 && { c: j.c } }, 'ex');
  J('foursquare', 'Four Square', 1, 4, j => 'Gains +4 Chips if played hand contains exactly 4 cards (Currently +' + j.c + ')', { init: () => ({ c: 0 }), nb: 1, before: (c, j) => { if (c.played.length === 4) j.c += 4; }, main: (c, j) => j.c > 0 && { c: j.c } }, 'dice');
  J('commuter', 'Commuter', 1, 6, j => 'Gains +1 Mult per consecutive hand played without a scoring face card (Currently +' + j.m + ')', { init: () => ({ m: 0 }), nb: 1, before: (c, j) => { if (c.sc.some(k => isFace(k))) j.m = 0; else j.m += 1; }, main: (c, j) => j.m > 0 && { m: j.m } }, 'clock');
  J('azurepile', 'Azure Pile', 1, 5, '+2 Chips for each remaining card in deck', { main: () => R.draw.length > 0 && { c: 2 * R.draw.length } }, 'gem');
  J('blankstare', 'Blank Stare', 1, 4, 'Earn $5 if 3 or more face cards are discarded at once', { disc: c => c.cards.filter(k => isFace(k)).length >= 3 && { $: 5 } }, 'skull');
  J('kettle', 'Kettle Corn', 1, 5, j => '+' + j.m + ' Mult. -4 Mult at end of every round', { init: () => ({ m: 20 }), main: (c, j) => ({ m: j.m }), rend: (c, j) => { j.m -= 4; if (j.m <= 0) { killJoker(j, 'melt'); return { msg: 'Eaten!' }; } } }, 'plus');
  J('widesplash', 'Wide Splash', 1, 3, 'Every played card counts in scoring', { f: 'splash' }, 'star');
  J('trailblazer', 'Trailblazer', 2, 5, 'Every played card permanently gains +5 Chips when scored', { card: c => { c.card.x = (c.card.x || 0) + 5; return { msg: 'Upgrade!' }; } }, 'plus');
  J('tinytitan', 'Tiny Titan', 3, 8, j => 'Gains +8 Chips when each played 2 is scored (Currently +' + j.c + ')', { init: () => ({ c: 0 }), nb: 1, card: (c, j) => { if (c.card.r === 2 && c.card.e !== 'stone') { j.c += 8; return { msg: 'Upgrade!' }; } }, main: (c, j) => j.c > 0 && { c: j.c } }, 'plus');
  J('nimble', 'Nimble Hands', 2, 7, 'Flushes and Straights can be made with 4 cards', { f: 'four' }, 'star');
  J('backalley', 'Back Alley', 2, 7, 'Straights can be made with gaps of 1 rank', { f: 'short' }, 'ex');
  J('blurred', 'Blurred Lines', 2, 7, 'Hearts count as Diamonds and Spades count as Clubs', { f: 'smear' }, 's1');
  J('seeingfaces', 'Seeing Faces', 2, 5, 'All cards are considered face cards', { f: 'pareid' }, 'skull');
  J('rerun', 'Rerun', 2, 6, 'Retrigger each played 2, 3, 4 or 5', { rep: c => c.zone === 'play' && [2, 3, 4, 5].indexOf(c.card.r) >= 0 && c.card.e !== 'stone' ? 1 : 0 }, 'clock');
  J('maskduo', 'Mask Duo', 2, 6, 'Retrigger each played face card', { rep: c => c.zone === 'play' && isFace(c.card) ? 1 : 0 }, 'skull');
  J('dangling', 'Dangling Thread', 2, 6, 'Retrigger the first played card 2 additional times', { rep: c => c.zone === 'play' && c.i === 0 ? 2 : 0 }, 'clock');
  J('lastlight', 'Last Light', 2, 6, 'Retrigger all played cards on the final hand of the round', { rep: c => c.zone === 'play' && R.hands === 0 ? 1 : 0 }, 'clock');
  J('fizzy', 'Fizzy', 2, 6, j => 'Retrigger all played cards (' + j.n + ' hands left)', { init: () => ({ n: 10 }), nb: 1, rep: c => c.zone === 'play' ? 1 : 0, after: (c, j) => { if (c.copy) return; j.n--; if (j.n <= 0) { killJoker(j, 'melt'); return { msg: 'Flat!' }; } } }, 'dice');
  J('pantomime', 'Pantomime', 2, 6, 'Retrigger all card abilities held in hand', { rep: c => c.zone === 'held' ? 1 : 0 }, 'ex');
  J('ironclad', 'Ironclad', 2, 7, j => 'Gives X0.2 Mult for each Steel Card in your full deck (Currently X' + (1 + .2 * cnt('', k => k.e === 'steel')).toFixed(1) + ')', { main: () => { const n = cnt('', k => k.e === 'steel'); return n > 0 && { x: 1 + .2 * n }; } }, 'gem');
  J('pebble', 'Pebble', 2, 6, j => 'Gives +25 Chips for each Stone Card in your full deck (Currently +' + 25 * cnt('', k => k.e === 'stone') + ')', { main: () => { const n = cnt('', k => k.e === 'stone'); return n > 0 && { c: 25 * n }; } }, 'gem');
  J('fourleafcat', 'Four-Leaf Cat', 2, 6, j => 'Gains X0.25 Mult every time a Lucky Card triggers (Currently X' + j.x.toFixed(2) + ')', { init: () => ({ x: 1 }), nb: 1, lucky: (c, j) => { j.x += .25; }, main: (c, j) => j.x > 1 && { x: j.x } }, 'star');
  J('shatterpoint', 'Shatterpoint', 2, 6, j => 'Gains X0.75 Mult for every Glass Card destroyed (Currently X' + j.x.toFixed(2) + ')', { init: () => ({ x: 1 }), nb: 1, destroyed: (c, j) => { const n = c.cards.filter(k => k.e === 'glass').length; if (n) { j.x += .75 * n; return { msg: 'Upgrade!' }; } }, main: (c, j) => j.x > 1 && { x: j.x } }, 'gem');
  J('nightfeeder', 'Night Feeder', 2, 7, j => 'Gains X0.1 Mult per scoring card with an Enhancement, removing it (Currently X' + j.x.toFixed(1) + ')', { init: () => ({ x: 1 }), nb: 1, before: (c, j) => { c.sc.forEach(k => { if (k.e && !deb(k)) { k.e = null; j.x += .1; jq(k.id); } }); }, main: (c, j) => j.x > 1 && { x: j.x } }, 'skull');
  J('mirrorimage', 'Mirror Image', 2, 7, j => 'Gains X0.25 Mult for each playing card added to your deck (Currently X' + j.x.toFixed(2) + ')', { init: () => ({ x: 1 }), nb: 1, add: (c, j) => { j.x += .25; }, main: (c, j) => j.x > 1 && { x: j.x } }, 'gem');
  J('starmap', 'Starmap', 2, 6, j => 'Gains X0.1 Mult every time a Planet card is used (Currently X' + j.x.toFixed(1) + ')', { init: () => ({ x: 1 }), nb: 1, use: (c, j) => { if (c.cons.type === 'planet') j.x += .1; }, main: (c, j) => j.x > 1 && { x: j.x } }, 'star');
  J('bonfire', 'Bonfire', 2, 7, j => 'Gains X0.25 Mult for each card sold, resets when Boss Blind is defeated (Currently X' + j.x.toFixed(2) + ')', { init: () => ({ x: 1 }), nb: 1, sold: (c, j) => { if (c.item !== j) j.x += .25; }, rend: (c, j) => { if (c.boss) j.x = 1; }, main: (c, j) => j.x > 1 && { x: j.x } }, 'star');
  J('monolith', 'Monolith', 3, 8, j => 'Gains X0.2 Mult per consecutive hand played that is not your most played hand (Currently X' + j.x.toFixed(1) + ')', { init: () => ({ x: 1 }), nb: 1, before: (c, j) => { if (R.hl[c.h.id].played >= mostPlayedCnt()) j.x = 1; else j.x += .2; }, main: (c, j) => j.x > 1 && { x: j.x } }, 'skull');
  J('duke', 'Duke', 3, 8, 'Each King held in hand gives X1.5 Mult', { held: c => c.card.r === 13 && c.card.e !== 'stone' && { x: 1.5 } }, 'star');
  J('chalkboard', 'Chalkboard', 2, 6, 'X3 Mult if all cards held in hand are Spades or Clubs', { main: c => c.held.every(k => suitIs(k, 0) || suitIs(k, 2)) && { x: 3 } }, 's0');
  J('handshark', 'Hand Shark', 2, 6, 'X3 Mult if poker hand has already been played this round', { main: c => R.hl[c.h.id].pr > 1 && { x: 3 } }, 'ex');
  J('pairbond', 'Pair Bond', 3, 8, 'X2 Mult if played hand contains a Pair', { main: c => c.has.pair && { x: 2 } }, 'ex');
  J('triad', 'Triad', 3, 8, 'X3 Mult if played hand contains a Three of a Kind', { main: c => c.has.three && { x: 3 } }, 'ex');
  J('quartet', 'Quartet', 3, 8, 'X4 Mult if played hand contains a Four of a Kind', { main: c => c.has.four && { x: 4 } }, 'ex');
  J('staircase', 'Staircase', 3, 8, 'X3 Mult if played hand contains a Straight', { main: c => c.has.straight && { x: 3 } }, 'ex');
  J('palette', 'Palette', 3, 8, 'X2 Mult if played hand contains a Flush', { main: c => c.has.flush && { x: 2 } }, 'ex');
  J('lastgasp', 'Last Gasp', 2, 6, 'X3 Mult on the final hand of the round', { main: () => R.hands === 0 && { x: 3 } }, 'clock');
  J('punch', 'Punch Card', 2, 5, j => 'X4 Mult every 6th hand played (' + (j.n % 6) + '/6)', { init: () => ({ n: 0 }), nb: 1, before: (c, j) => { j.n++; }, main: (c, j) => j.n % 6 === 0 && { x: 4 } }, 'clock');
  J('noodle', 'Noodle Bowl', 1, 6, j => 'X' + j.x.toFixed(2) + ' Mult. Loses X0.01 Mult per card discarded', { init: () => ({ x: 2 }), nb: 1, disc: (c, j) => { j.x -= .01 * c.cards.length; if (j.x <= 1) { killJoker(j, 'melt'); return { msg: 'Eaten!' }; } }, main: (c, j) => ({ x: j.x }) }, 'star');
  J('mirrorsuit', 'Mirror Suit', 2, 6, 'X2 Mult if played hand has a scoring Club and a scoring card of any other suit', { main: c => { const s = c.sc.filter(k => !deb(k) && k.e !== 'stone'); return s.some(k => suitIs(k, 2)) && s.some(k => k.s !== 2) && { x: 2 }; } }, 's2');
  J('garden', 'Garden', 2, 6, 'X3 Mult if scoring hand contains a Diamond, Club, Heart and Spade', { main: c => { const h = [0, 0, 0, 0]; let w = 0; c.sc.forEach(k => { if (deb(k) || k.e === 'stone') return; if (k.e === 'wild') w++; else h[k.s] = 1; }); return h.filter(v => !v).length <= w && { x: 3 }; } }, 'star');
  J('selfie', 'Selfie', 2, 5, 'First played face card gives X2 Mult when scored', { card: c => c.card === c.firstFace && { x: 2 } }, 'star');
  J('rubystone', 'Rubystone', 2, 7, 'Played Heart cards have a 1 in 2 chance to give X1.5 Mult when scored', { card: c => suitIs(c.card, 1) && luck(1, 2) && { x: 1.5 } }, 's1');
  J('flintpoint', 'Flint Point', 2, 7, 'Played Spade cards give +50 Chips when scored', { card: c => suitIs(c.card, 0) && { c: 50 } }, 's0');
  J('blackpearl', 'Black Pearl', 2, 7, 'Played Club cards give +7 Mult when scored', { card: c => suitIs(c.card, 2) && { m: 7 } }, 's2');
  J('rawdiamond', 'Raw Diamond', 2, 7, 'Played Diamond cards earn $1 when scored', { card: c => suitIs(c.card, 3) && { $: 1 } }, 's3');
  J('wanderer', 'Wandering Suit', 3, 8, j => 'Each played card with ' + SN[j.s] + ' suit gives X1.5 Mult when scored (suit changes every round)', { init: () => ({ s: rint(4) }), card: (c, j) => suitIs(c.card, j.s) && { x: 1.5 }, rend: (c, j) => { j.s = (j.s + 1 + rint(3)) % 4; } }, 's0');
  J('collector', 'Collector\'s Pick', 2, 6, j => 'Each played ' + RNAME[j.rk - 2] + ' of ' + SN[j.st] + ' gives X2 Mult when scored (card changes every round)', { init: () => ({ rk: 2 + rint(13), st: rint(4) }), card: (c, j) => c.card.r === j.rk && suitIs(c.card, j.st) && { x: 2 }, rend: (c, j) => { const k = R.cards.filter(x => x.e !== 'stone'); if (k.length) { const p = pick(k); j.rk = p.r; j.st = p.s; } } }, 'star');
  J('kingsfool', "King's Fool", 4, 20, 'Played Kings and Queens each give X2 Mult when scored', { card: c => (c.card.r === 12 || c.card.r === 13) && c.card.e !== 'stone' && { x: 2 } }, 'star');
  J('goldtouch', 'Gold Touch', 2, 7, 'Played face cards become Gold cards when scored', { before: c => { let n = 0; c.sc.forEach(k => { if (isFace(k)) { k.e = 'gold'; jq(k.id); n++; } }); return n > 0 && { msg: 'Gilded' }; } }, 'coin');
  J('marblebust', 'Marble Bust', 2, 6, 'Adds one Stone card to your deck when Blind is selected', { bstart: () => { addToDeck(newCard(2 + rint(13), rint(4), { e: 'stone' })); return { msg: 'Stone!' }; } }, 'gem');
  J('waxseal', 'Wax Seal', 2, 6, 'Adds a random seal card to your hand when a round begins', { bstart: () => { const k = randCard(); k.z = pick(['gold', 'red', 'blue', 'purple']); addToDeck(k, 'hand'); } }, 'gem');
  J('genesplice', 'Gene Splice', 3, 8, 'If the first hand of the round has only 1 card, add a permanent copy to your deck and hand', { before: c => { if (R.hpr === 1 && c.played.length === 1) { addToDeck(Object.assign({}, c.played[0], { id: nid() }), 'hand'); return { msg: 'Copied!' }; } } }, 'skull');
  J('rocketfuel', 'Rocket Fuel', 2, 5, '1 in 4 chance to upgrade the level of the played poker hand', { before: c => { if (luck(1, 4)) { levelHand(c.h.id, 1); return { msg: 'Level Up!' }; } } }, 'star');
  J('scorched', 'Scorched', 3, 8, 'Upgrade the level of the first discarded poker hand each round', { disc: c => { if (c.first) { levelHand(c.h.id, 1); R.q.push({ t: 'lvl', hid: c.h.id }); return { msg: 'Level Up!' }; } } }, 'star');
  J('sixtheye', 'Sixth Eye', 2, 6, 'If the first hand of round is a single 6, destroy it and create a Specter card', { before: c => { if (R.hpr === 1 && c.played.length === 1 && c.played[0].r === 6 && c.played[0].e !== 'stone') { destroyCards([c.played[0]]); addCons('spectral', rollCons('spectral').k); return { msg: 'Specter!' }; } } }, 'skull');
  J('poolshark', 'Pool Shark', 1, 3, 'Played 8s have a 1 in 4 chance to create a Tarot card when scored (must have room)', { card: c => { if (c.card.r === 8 && c.card.e !== 'stone' && luck(1, 4) && cfree() > 0) { addCons('tarot', rollCons('tarot').k); return { msg: 'Tarot!' }; } } }, 'dice');
  J('overlap', 'Overlap', 1, 4, 'Create a Tarot card if played hand contains an Ace and a Straight', { main: c => { if (c.has.straight && c.sc.some(k => k.r === 14) && cfree() > 0) { addCons('tarot', rollCons('tarot').k); return { msg: 'Tarot!' }; } } }, 'star');
  J('hobo', 'Hobo', 2, 6, 'Create a Tarot card if played hand is played with $4 or less', { main: () => { if (R.money <= 4 && cfree() > 0) { addCons('tarot', rollCons('tarot').k); return { msg: 'Tarot!' }; } } }, 'coin');
  J('cardreader', 'Card Reader', 2, 6, 'Creates a Tarot card when Blind is selected (must have room)', { bstart: () => { if (cfree() > 0) { addCons('tarot', rollCons('tarot').k); return { msg: 'Tarot!' }; } } }, 'star');
  J('planetarium', 'Planetarium Guide', 2, 8, 'Planet cards in the shop are free', { f: 'freeplanet' }, 'star');
  J('noisemaker', 'Noise Maker', 1, 6, 'Create 2 Common Jokers when Blind is selected (must have room)', { bstart: () => { let n = 0; for (let i = 0; i < 2; i++) if (jfree() > 0) { addJoker(rollJoker(1).k); n++; } return n > 0 && { msg: 'Jokers!' }; } }, 'dice');
  J('catburglar', 'Cat Burglar', 2, 6, 'When Blind is selected, gain +3 Hands and lose all discards', { bstart: () => { R.hands += 3; R.discards = 0; return { msg: '+3 Hands' }; } }, 'skull');
  J('mayhem', 'Merry Mayhem', 2, 7, '+3 discards each round, -1 hand size', { p: { d: 3, hs: -1 } }, 'plus');
  J('minstrel', 'Minstrel', 2, 6, '+2 hand size, -1 hand each round', { p: { hs: 2, h: -1 } }, 'plus');
  J('slowroller', 'Slow Roller', 2, 6, j => '+' + j.n + ' hand size, reduces by 1 every round', { init: () => ({ n: 5 }), p: j => ({ hs: j.n }), rend: (c, j) => { j.n--; if (j.n <= 0) { killJoker(j, 'melt'); return { msg: 'Gone!' }; } } }, 'clock');
  J('strongman', 'Strongman', 2, 7, '+250 Chips, -2 hand size', { main: () => ({ c: 250 }), p: { hs: -2 } }, 'plus');
  J('closecall', 'Close Call', 2, 5, 'Prevents Death if chips scored are at least 25% of required chips. Self destructs', { f: 'bones' }, 'skull');
  J('bosswhisper', 'Boss Whisperer', 4, 20, 'Disables the effect of every Boss Blind', { f: 'nobosseff' }, 'skull');
  J('wrestler', 'Masked Wrestler', 2, 5, 'Sell this card to disable the current Boss Blind', { sell: () => { if (R.cur && R.cur.boss) R.bossOff = true; } }, 'skull');
  J('photocopy', 'Photocopy', 3, 10, 'Copies the ability of the Joker to the right', { copy: 'right' }, 'star');
  J('echo', 'Echo', 3, 10, 'Copies the ability of the leftmost Joker', { copy: 'left' }, 'star');
  J('ghostwriter', 'Ghost Writer', 3, 8, j => 'After 2 rounds, sell this card to duplicate a random Joker (' + Math.min(2, j.n) + '/2)', { init: () => ({ n: 0 }), rend: (c, j) => { j.n++; return j.n === 2 && { msg: 'Ready!' }; }, sell: (c, j) => { if (j.n >= 2) { const p = R.jokers.filter(k => k !== j); if (p.length) clone(pick(p)); } } }, 'skull');
  J('fizzpop', 'Fizz Pop', 2, 6, 'Sell this card to create a free Double Tag', { sell: () => { giveTag('double'); } }, 'dice');
  J('orbiter', 'Orbiter', 2, 6, 'Earn $1 per unique Planet card used this run at end of round', { rend: () => { const n = Object.keys(R.planetsUsed).length; return n > 0 && { $: n }; } }, 'star');
  J('gildedstub', 'Gilded Stub', 2, 5, 'Played Gold cards earn $4 when scored', { card: c => c.card.e === 'gold' && { $: 4 } }, 'coin');
  J('rocketfund', 'Rocket Fund', 2, 6, j => 'Earn $' + j.n + ' at end of round. Payout increases by $2 when a Boss Blind is defeated', { init: () => ({ n: 1 }), rend: (c, j) => { const v = j.n; if (c.boss) j.n += 2; return { $: v }; } }, 'star');
  J('retrofit', 'Retrofit', 2, 6, 'X0.25 Mult for each Blind skipped this run', { main: () => R.skips > 0 && { x: 1 + .25 * R.skips } }, 'clock');
  J('memento', 'Memento', 4, 20, j => 'Gains X1 Mult every 23 cards discarded (Currently X' + j.x + ')', { init: () => ({ x: 1, n: 0 }), nb: 1, disc: (c, j) => { j.n += c.cards.length; while (j.n >= 23) { j.n -= 23; j.x += 1; } }, main: (c, j) => j.x > 1 && { x: j.x } }, 'skull');
  J('hitchhiker', 'Hitchhiker', 2, 6, j => 'Gains X0.5 Mult for every Jack discarded this round (Currently X' + j.x.toFixed(1) + ')', { init: () => ({ x: 1 }), nb: 1, disc: (c, j) => { const n = c.cards.filter(k => k.r === 11 && k.e !== 'stone').length; j.x += .5 * n; }, rend: (c, j) => { j.x = 1; }, main: (c, j) => j.x > 1 && { x: j.x } }, 'ex');
  J('canio', 'Canio', 4, 20, j => 'Gains X1 Mult when a face card is destroyed (Currently X' + j.x + ')', { init: () => ({ x: 1 }), nb: 1, destroyed: (c, j) => { const n = c.cards.filter(k => isFace(k)).length; if (n) { j.x += n; return { msg: 'Upgrade!' }; } }, main: (c, j) => j.x > 1 && { x: j.x } }, 'skull');
  J('smooth', 'Smooth Operator', 1, 4, 'X3 Mult. 1 in 1000 chance this card is destroyed at end of round', { need: () => R && R.ext.banana, main: () => ({ x: 3 }), rend: (c, j) => { if (luck(1, 1000)) { killJoker(j, 'melt'); return { msg: 'Extinct!' }; } } }, 'star');
  J('hoarder', 'Hoarder', 4, 20, 'Creates a Negative copy of a random consumable card when leaving the shop', { shopout: () => { if (R.cons.length) { const t = pick(R.cons), n = newCons(t.type, t.k, 'neg'); R.cons.push(n); R.q.push({ id: n.id, t: 'spawn' }); return { msg: 'Copied!' }; } } }, 'gem');
  J('encore', 'Encore', 2, 5, 'Joker, Tarot, Planet and Specter cards may appear multiple times', { f: 'showman' }, 'star');
  J('luckystreak', 'Lucky Streak', 2, 4, 'All listed probabilities are doubled', { f: 'luck2' }, 'dice');
  J('weartear', 'Wear and Tear', 2, 6, 'Gives +4 Mult for each card below the starting deck size in your full deck', { main: () => { const n = Math.max(0, (R.dk === 'abandoned' ? 40 : 52) - R.cards.length); return n > 0 && { m: 4 * n }; } }, 'skull');
  J('piggy', 'Piggy Bank', 1, 6, 'Gives +2 Chips for each $1 you have', { main: () => R.money > 0 && { c: 2 * R.money } }, 'coin');
  J('pullup', 'Pull Yourself Up', 2, 7, 'Gives +2 Mult for every $5 you have', { main: () => R.money >= 5 && { m: 2 * Math.floor(R.money / 5) } }, 'coin');
  J('lunar', 'Lunar Loan', 1, 5, 'Earn an extra $1 of interest for every $5 you have at end of round', { p: { int: 1 } }, 'coin');
  J('flashcam', 'Camera Flash', 1, 5, j => 'Gains +2 Mult per reroll in the shop (Currently +' + j.m + ')', { init: () => ({ m: 0 }), nb: 1, reroll: (c, j) => { j.m += 2; return { msg: '+2 Mult' }; }, main: (c, j) => j.m > 0 && { m: j.m } }, 'star');
  J('skipstone', 'Skip Stone', 1, 5, j => 'Gains +3 Mult when any Booster Pack is skipped (Currently +' + j.m + ')', { init: () => ({ m: 0 }), nb: 1, skippk: (c, j) => { j.m += 3; return { msg: '+3 Mult' }; }, main: (c, j) => j.m > 0 && { m: j.m } }, 'ex');
  J('fever', 'Fever Dream', 3, 8, j => 'Gains X0.5 Mult when a Small or Big Blind is selected, destroying a random Joker (Currently X' + j.x.toFixed(1) + ')', { init: () => ({ x: 1 }), nb: 1, bsel: (c, j) => { j.x += .5; const v = R.jokers.filter(k => k !== j && !k.et); if (v.length) killJoker(pick(v), 'destroy'); return { msg: '+X0.5' }; }, main: (c, j) => j.x > 1 && { x: j.x } }, 'skull');
  J('wrapped', 'Wrapped Present', 1, 6, 'Adds $1 of sell value to every Joker and consumable at end of round', { rend: () => { R.jokers.concat(R.cons).forEach(k => { k.a += 1; }); return { msg: '+$1 value' }; } }, 'gem');
  J('bullfighter', 'Bullfighter', 1, 4, 'Earn $8 if the played hand triggers the Boss Blind ability', { main: () => R.bt && { $: 8 } }, 'coin');
  J('mediumrare', 'Medium Rare', 2, 6, 'Create a Specter card if played hand is a Straight Flush (must have room)', { main: c => { if (c.h.id === 'sflush' && cfree() > 0) { addCons('spectral', rollCons('spectral').k); return { msg: 'Specter!' }; } } }, 'skull');
  J('swapmeet', 'Swap Meet', 2, 6, 'If first discard of round has only 1 card, destroy it and earn $3', { disc: c => { if (c.first && c.cards.length === 1) { destroyCards([c.cards[0]]); return { $: 3 }; } } }, 'coin');
  J('stencil', 'Empty Seats', 2, 8, 'X1 Mult for each empty Joker slot. Empty Seats included', { main: () => { const x = jfree() + R.jokers.filter(k => k.k === 'stencil').length; return x > 1 && { x }; } }, 'ex');
  J('collage', 'Collage', 1, 4, 'Gives +3 Mult for each Joker card', { main: () => ({ m: 3 * R.jokers.length }) }, 'plus');
  J('pirate', "Pirate's Share", 2, 4, 'Adds the sell value of all other owned Jokers to Mult', { main: (c, j) => { const v = R.jokers.reduce((a, k) => a + (k === j ? 0 : sellVal(k)), 0); return v > 0 && { m: v }; } }, 'coin');
  J('patchwork', 'Patchwork', 1, 5, j => 'Gains +2 Mult if played hand contains Two Pair (Currently +' + j.m + ')', { init: () => ({ m: 0 }), nb: 1, before: (c, j) => { if (c.has.two) j.m += 2; }, main: (c, j) => j.m > 0 && { m: j.m } }, 'plus');
  J('bloodletter', 'Bloodletter', 2, 6, j => 'When Blind is selected, destroy the Joker to the right and permanently add double its sell value to this Mult (Currently +' + j.m + ')', { init: () => ({ m: 0 }), nb: 1, bstart: (c, j) => { const t = R.jokers[R.jokers.indexOf(j) + 1]; if (t && !t.et) { j.m += 2 * sellVal(t); killJoker(t, 'destroy'); return { msg: 'Sacrificed' }; } }, main: (c, j) => j.m > 0 && { m: j.m } }, 'skull');
  J('acehunter', 'Ace Hunter', 1, 4, 'Played Aces give +20 Chips and +4 Mult when scored', { card: c => c.card.r === 14 && c.card.e !== 'stone' && { c: 20, m: 4 } }, 'star');
  J('evenkeel', 'Even Keel', 1, 4, 'Played cards with even rank give +4 Mult when scored (10, 8, 6, 4, 2)', { card: c => isEven(c.card) && { m: 4 } }, 'plus');
  J('oddduck', 'Odd Duck', 1, 4, 'Played cards with odd rank give +31 Chips when scored (A, 9, 7, 5, 3)', { card: c => isOdd(c.card) && { c: 31 } }, 'coin');
  J('vaulter', 'Vaulter', 2, 6, 'Played cards that score give +1 Mult for every $10 you have', { card: () => R.money >= 10 && { m: Math.floor(R.money / 10) } }, 'coin');
  J('grandslam', 'Grand Slam', 3, 9, 'X1.5 Mult for every scoring face card in a hand of 5 cards that has a Full House', { main: c => c.h.id === 'fh' || c.h.id === 'flushh' ? { x: 1 + .5 * faceCt(c) || 1 } : false }, 'ex');
  J('stonecold', 'Stone Cold', 2, 6, 'Stone Cards in your hand held at end of round give $2', { rend: () => { const n = R.hand.filter(k => k.e === 'stone').length; return n > 0 && { $: 2 * n }; } }, 'gem');
  J('curtaincall', 'Curtain Call', 3, 9, 'Retrigger all played cards when played hand is a Flush', { rep: c => c.zone === 'play' && c.has.flush ? 1 : 0 }, 'clock');
  J('twinstar', 'Twin Star', 3, 8, 'Retrigger every scoring Ace and King', { rep: c => c.zone === 'play' && (c.card.r === 14 || c.card.r === 13) && c.card.e !== 'stone' ? 1 : 0 }, 'star');

  const TAGS_ED = { foil: 'Foil', holo: 'Holographic', poly: 'Polychrome', neg: 'Negative' };
  const ED_D = { foil: '+50 Chips', holo: '+10 Mult', poly: 'X1.5 Mult', neg: '+1 slot' };
  const ENH_D = {
    bonus: ['Bonus Card', '+30 extra chips'], mult: ['Mult Card', '+4 Mult'], wild: ['Wild Card', 'Counts as every suit'],
    glass: ['Glass Card', 'X2 Mult, 1 in 4 chance to shatter when scored'], steel: ['Steel Card', 'X1.5 Mult while held in hand'],
    stone: ['Stone Card', '+50 chips, no rank or suit'], gold: ['Gold Card', '$3 if held in hand at end of round'],
    lucky: ['Lucky Card', '1 in 5 chance for +20 Mult, 1 in 15 chance for $20']
  };
  const SEAL_D = {
    gold: ['Gold Seal', 'Earn $3 when this card is played and scores'], red: ['Red Seal', 'Retrigger this card 1 time'],
    blue: ['Blue Seal', 'Creates the Planet card of the last played hand if held in hand at end of round'],
    purple: ['Purple Seal', 'Creates a Tarot card when discarded']
  };
  const RAR_N = ['', 'Common', 'Uncommon', 'Rare', 'Legendary'];
  const PKN = { arcana: 'Oracle', cosmos: 'Cosmos', standard: 'Playing', jester: 'Jester', specter: 'Specter' };
  const PKS = { normal: '', jumbo: 'Jumbo ', mega: 'Mega ' };
  const PKD = {
    arcana: n => 'Choose %p of up to ' + n + ' Tarot cards to use immediately',
    cosmos: n => 'Choose %p of up to ' + n + ' Planet cards to use immediately',
    standard: n => 'Choose %p of up to ' + n + ' playing cards to add to your deck',
    jester: n => 'Choose %p of up to ' + n + ' Joker cards',
    specter: n => 'Choose %p of up to ' + n + ' Specter cards to use immediately'
  };
  const PKC = { arcana: ['#7a3fc8', '#2a1a5e', 'eye'], cosmos: ['#3a78d8', '#101c4e', 'hole'], standard: ['#e0453a', '#5e1a1a', 'cards'], jester: ['#f2a23a', '#5e3a1a', 'crown'], specter: ['#4ac8b8', '#103a4e', 'skull'] };
  const EMBS = { fool: 'cart', magician: 'infinity', priestess: 'eye', empress: 'heart', emperor: 'crown', hierophant: 'cross', lovers: 'hand', chariot: 'pillars', justice: 'scales', hermit: 'cup', wheel: 'wheel', strength: 'flame', hanged: 'ankh', death: 'skull', temperance: 'cup', devil: 'flame', tower: 'tower', star: 'star', moon: 'moon', sun: 'sun', judgement: 'eye', world: 'gem' };
  const SPS = ['skull', 'hand', 'eye', 'flame', 'gem', 'hole', 'crown', 'ankh', 'infinity', 'star'];
  const VSYM = ['cart', 'cup', 'gem', 'star', 'scales', 'leaf', 'ankh', 'crown', 'wheel', 'pillars'];
  const TPAL = [['#6a2d9c', '#e070b0'], ['#1f4a8c', '#58c0e8'], ['#8c2d2d', '#f0a050'], ['#1f6b4a', '#7ae0a0'], ['#5a2d6e', '#a080f0'], ['#8c5a1f', '#f0d060']];
  const TG_ICON = { uncommon: 'gem', rare: 'star', neg: 'skull', foil: 'gem', holo: 'star', poly: 'star' };
  const blit = src => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; };
  const esc = s => String(s).replace(/[&<>]/g, c => c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;');
  const fmtN = n => {
    n = Math.floor(n + 1e-9);
    if (!isFinite(n)) return 'naneinf';
    if (n < 1e11) return n.toLocaleString('en-US');
    const e = Math.floor(Math.log10(n));
    return (n / Math.pow(10, e)).toFixed(3) + 'e' + e;
  };
  const fmtS = n => n >= 1e6 ? (n >= 1e11 ? fmtN(n) : n.toLocaleString('en-US')) : n.toLocaleString('en-US');
  const fmtM = x => { if (!isFinite(x)) return 'naneinf'; return x >= 1e6 ? fmtN(x) : (Math.abs(x - Math.round(x)) < 1e-6 ? String(Math.round(x)) : x.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')); };
  const hnode = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const jdesc = (j, def) => { const d = def.d; return typeof d === 'function' ? d(j) : d; };

  function consArt(c) {
    const d = CONSDEF(c);
    if (c.type === 'planet') return planetArt(d.n);
    const hsh = hashStr(c.k);
    if (c.type === 'tarot') { const p = TPAL[hsh % TPAL.length]; return emblemArt(c.k, 't', EMBS[c.k] || 'star', ['#f1e6c8', p[0], p[1]]); }
    const hu = [['#1a2a5e', '#8a4ad8'], ['#0e3a4e', '#4ad8c8'], ['#3a1a5e', '#e84a8a'], ['#1a3a5e', '#58a0f0'], ['#2a1a3e', '#c060e8']][hsh % 5];
    return emblemArt(c.k, 's', SPS[hsh % SPS.length], ['#dfe6f2', hu[0], hu[1]]);
  }
  function voucherArt(k) {
    const hsh = hashStr(k), p = TPAL[(hsh >>> 3) % TPAL.length];
    return emblemArt(k, 'v', VSYM[hsh % VSYM.length], ['#f6ecc8', sh(p[0], .8), p[1]]);
  }
  function packArtOf(p) {
    const c = PKC[p.kind], big = p.size === 'mega' ? 1 : p.size === 'jumbo' ? .5 : 0;
    return packArt(p.kind + p.size, [mix(c[0], '#ffffff', big * .35), mix(c[1], c[0], big * .4)], c[2]);
  }

  function consDesc(c) {
    const d = CONSDEF(c);
    return typeof d.d === 'function' ? d.d() : d.d;
  }
  function cardTipHtml(c) {
    if (c.fd) return '<b>Face-down card</b><i>Its identity is hidden until played</i>';
    const nm = c.e === 'stone' ? 'Stone Card' : cn(c);
    let s = '<b>' + nm + '</b>';
    if (c.e !== 'stone') s += '<i>+' + chipVal(c) + ' chips' + (c.x ? ' (+' + c.x + ' permanent)' : '') + '</i>';
    else if (c.x) s += '<i>+' + c.x + ' permanent chips</i>';
    if (c.e) { const d = ENH_D[c.e]; s += '<u>' + d[0] + '</u><i>' + d[1] + '</i>'; }
    if (c.ed) s += '<u class="ed-' + c.ed + '">' + TAGS_ED[c.ed] + '</u><i>' + ED_D[c.ed] + '</i>';
    if (c.z) { const d = SEAL_D[c.z]; s += '<u class="sl-' + c.z + '">' + d[0] + '</u><i>' + d[1] + '</i>'; }
    if (R && deb(c) && R.ph === 'round') s += '<u class="dbf">Debuffed</u><i>Does nothing this round</i>';
    return s;
  }
  function jokerTipHtml(j, shopMode) {
    const d = JK[j.k];
    let s = '<b>' + d.n + '</b><em class="rar r' + d.r + '">' + RAR_N[d.r] + '</em><i>' + esc(jdesc(j, d)) + '</i>';
    if (d.copy && !shopMode && R) { const t = copyTarget(j); s += '<u>' + (t ? 'Copying ' + JK[t.k].n : 'Incompatible') + '</u>'; }
    if (j.ed) s += '<u class="ed-' + j.ed + '">' + TAGS_ED[j.ed] + '</u><i>' + ED_D[j.ed] + '</i>';
    if (j.et) s += '<u class="stk-e">Eternal</u><i>Cannot be sold or destroyed</i>';
    if (j.per) s += '<u class="stk-p">Perishable</u><i>' + (j.pl > 0 ? 'Debuffed after ' + j.pl + ' more round' + (j.pl > 1 ? 's' : '') : 'Debuffed') + '</i>';
    if (j.rn) s += '<u class="stk-r">Rental</u><i>Costs $3 at end of round</i>';
    if (R && jOff(j) && !j.per) s += '<u class="dbf">Disabled</u>';
    if (!shopMode) s += '<s>Sell value $' + sellVal(j) + '</s>';
    return s;
  }
  function consTipHtml(c, shopMode) {
    const d = CONSDEF(c), tn = c.type === 'tarot' ? 'Tarot' : c.type === 'planet' ? 'Planet' : 'Specter';
    let s = '<b>' + d.n + '</b><em class="rar t-' + c.type + '">' + tn + '</em><i>' + esc(consDesc(c)) + '</i>';
    if (c.type === 'planet' && R) { const h = HAND[d.hid], l = R.hl[d.hid]; s += '<u>' + h.n + ' lvl.' + l.lvl + '</u><i>Currently ' + hv(d.hid).c + ' chips x ' + hv(d.hid).m + ' mult</i>'; }
    if (c.ed) s += '<u class="ed-' + c.ed + '">' + TAGS_ED[c.ed] + '</u><i>' + ED_D[c.ed] + '</i>';
    if (!shopMode && R) s += '<s>Sell value $' + sellVal(c) + '</s>';
    return s;
  }
  function voucherTipHtml(k) {
    const v = VK[k];
    return '<b>' + v.n + '</b><em class="rar vch">Voucher</em><i>' + esc(v.d) + '</i>' + (v.req ? '<u>Requires ' + VK[v.req].n + '</u>' : '');
  }
  function packTipHtml(p) {
    return '<b>' + PKS[p.size] + PKN[p.kind] + ' Pack</b><em class="rar pk">Booster</em><i>' + PKD[p.kind](p.n).replace('%p', p.pick) + '</i>';
  }
  function tagTipHtml(k) { const t = TGK[k]; return '<b>' + t.n + '</b><em class="rar tg">Tag</em><i>' + esc(t.d) + '</i>'; }
  function bossTipHtml(k) { const b = BK[k]; return '<b>' + b.n + '</b><em class="rar bs">' + (b.fin ? 'Final Boss' : 'Boss Blind') + '</em><i>' + esc(b.d) + '</i>'; }

  function mkGeo(port) {
    if (!port) return {
      port: false, W: 1000, H: 620,
      jok: { cx: 450, cy: 96, w: 480, s: 1 }, cons: { cx: 858, cy: 96, w: 250, s: 1 },
      play: { cx: 595, cy: 262, w: 580, s: 1.12 }, hand: { cx: 540, cy: 514, w: 660, s: 1.22 },
      deck: { x: 940, y: 514 }, btn: { cx: 595, cy: 372 },
      shop: { cx: 480, cy: 258, w: 520, s: 1.08 }, vouch: { cx: 800, cy: 258, s: 1.08 }, packs: { cx: 560, cy: 494, w: 620, s: 1.04 },
      pk: { cx: 595, cy: 280, w: 780, s: 1.3 }, pkhand: { cx: 540, cy: 520, w: 660, s: 1.1 },
      main: { x: 205, y: 172, w: 785, h: 440 }, jlab: [208, 4], clab: [738, 4],
      hud: {
        blind: [8, 8, 184, 112], rscore: [8, 126, 184, 50], mult: [8, 182, 184, 90], hands: [8, 278, 88, 50], disc: [100, 278, 92, 50],
        money: [8, 334, 184, 54], ante: [8, 394, 88, 46], round: [100, 394, 92, 46], tags: [8, 446, 184, 34],
        info: [8, 486, 184, 38], opt: [8, 530, 184, 38], undo: [8, 574, 184, 36]
      }
    };
    return {
      port: true, W: 400, H: 680,
      jok: { cx: 148, cy: 222, w: 290, s: .85 }, cons: { cx: 346, cy: 222, w: 104, s: .85 },
      play: { cx: 200, cy: 332, w: 384, s: .96 }, hand: { cx: 200, cy: 506, w: 396, s: 1.02 },
      deck: { x: 370, y: 626 }, btn: { cx: 200, cy: 410 },
      shop: { cx: 160, cy: 330, w: 300, s: .92 }, vouch: { cx: 340, cy: 330, s: .92 }, packs: { cx: 200, cy: 500, w: 380, s: .9 },
      pk: { cx: 200, cy: 330, w: 392, s: 1.0 }, pkhand: { cx: 200, cy: 520, w: 396, s: .95 },
      main: { x: 4, y: 270, w: 392, h: 400 }, jlab: [6, 172], clab: [300, 172],
      hud: {
        blind: [4, 4, 200, 62], rscore: [208, 4, 188, 62], mult: [4, 70, 392, 62], hands: [4, 136, 94, 32], disc: [102, 136, 94, 32],
        money: [200, 136, 94, 32], ante: [298, 136, 98, 32], round: [0, 0, 0, 0], tags: [4, 596, 120, 24],
        info: [4, 632, 96, 40], opt: [104, 632, 96, 40], undo: [0, 0, 0, 0]
      }
    };
  }
  const spread = (n, cx, w, cw, gap0) => {
    if (n <= 0) return [];
    const step = n === 1 ? 0 : Math.min(cw + gap0, (w - cw) / (n - 1)), x0 = cx - step * (n - 1) / 2;
    return Array.from({ length: n }, (_, i) => x0 + step * i);
  };

  function mountGame(root, api) {
    const on = api.on;
    const SV = Object.assign({ opt: {}, stats: {}, run: null }, api.load() || {});
    const OPT = Object.assign({ speed: 1, shake: true, crt: true, sfx: true, music: true, flash: true, sort: 'rank', hints: true }, SV.opt || {});
    const ST = Object.assign({ runs: 0, wins: 0, bestAnte: 0, bestHand: 0, endless: 0, jokersSeen: {}, bestMoney: 0 }, SV.stats || {});
    const persist = () => {
      SV.opt = OPT; SV.stats = ST;
      SV.run = R && (R.ph === 'blinds' || R.ph === 'round' || R.ph === 'shop' || R.ph === 'cash' || R.ph === 'pack') && !busy ? ser() : (R && (R.ph === 'win' || R.ph === 'over') ? null : SV.run);
      api.save(SV);
    };

    const wrap = hnode('div', 'bl-wrap');
    const shk = hnode('div', 'bl-shk');
    const stage = hnode('div', 'bl-stage');
    wrap.append(shk); shk.append(stage);
    const bg = document.createElement('canvas'); bg.className = 'bl-bg'; bg.width = 160; bg.height = 100;
    stage.append(bg);
    const hud = hnode('div', 'bl-hud');
    hud.innerHTML = `
<div class="hb hb-blind" data-h="blind"><div class="hb-top"><canvas width="34" height="34"></canvas><b></b></div><div class="hb-sub">Score at least</div><div class="hb-tgt"></div><div class="hb-rew"></div></div>
<div class="hb hb-rscore" data-h="rscore"><span>Round score</span><b></b></div>
<div class="hb hb-mult" data-h="mult"><div class="hm-name"></div><div class="hm-row"><div class="hm-c"><b>0</b></div><i>X</i><div class="hm-m"><b>0</b></div></div></div>
<div class="hb hb-hands" data-h="hands"><span>Hands</span><b></b></div>
<div class="hb hb-disc" data-h="disc"><span>Discards</span><b></b></div>
<div class="hb hb-money" data-h="money"><span>Money</span><b></b></div>
<div class="hb hb-ante" data-h="ante"><span>Ante</span><b></b></div>
<div class="hb hb-round" data-h="round"><span>Round</span><b></b></div>
<div class="hb-tags" data-h="tags"></div>
<button class="hbtn" data-h="info">Run Info</button><button class="hbtn" data-h="opt">Options</button><button class="hbtn" data-h="undo" hidden>Menu</button>`;
    const zl = hnode('div', 'bl-zlab'); zl.innerHTML = '<i class="jb"></i><i class="cb"></i><span class="jl"></span><span class="cl"></span>';
    const deckEl = hnode('div', 'bl-deck'); deckEl.innerHTML = '<canvas width="71" height="95"></canvas><canvas width="71" height="95"></canvas><canvas width="71" height="95"></canvas><b></b>';
    const cardsLayer = hnode('div', 'bl-cards');
    const btnRow = hnode('div', 'bl-btns');
    btnRow.innerHTML = '<button class="bbtn play" data-b="play"><b>Play Hand</b><kbd>Enter</kbd></button><button class="bbtn sm" data-b="sr">Rank</button><button class="bbtn sm" data-b="ss">Suit</button><button class="bbtn disc" data-b="disc"><b>Discard</b><kbd>D</kbd></button>';
    const shopBtns = hnode('div', 'bl-btns bl-shopb');
    shopBtns.innerHTML = '<button class="bbtn next" data-b="next"><b>Next Round</b><kbd>N</kbd></button><button class="bbtn rr" data-b="rr"><b>Reroll</b><span></span><kbd>G</kbd></button>';
    const packBtns = hnode('div', 'bl-btns bl-packb');
    packBtns.innerHTML = '<button class="bbtn disc" data-b="skip"><b>Skip</b><kbd>Esc</kbd></button>';
    const note = hnode('div', 'bl-note');
    const sel2 = hnode('div', 'bl-act');
    const tipEl = hnode('div', 'bl-tip');
    const pops = hnode('div', 'bl-pops');
    const bslot = hnode('div', 'bl-blinds');
    const ovl = hnode('div', 'bl-ov');
    const shopLab = hnode('div', 'bl-slab');
    shopLab.innerHTML = '<span class="sl-i">Shop</span><span class="sl-p">Booster Packs</span><span class="sl-v">Voucher</span>';
    stage.append(hud, zl, shopLab, bslot, deckEl, cardsLayer, btnRow, shopBtns, packBtns, note, sel2, pops, tipEl, ovl);
    const crt = hnode('div', 'bl-crt'); wrap.append(crt);
    root.append(wrap);
    const q = s => stage.querySelector(s);
    const hel = {}; hud.querySelectorAll('[data-h]').forEach(e => { hel[e.dataset.h] = e; });

    let G = null, PORT = null, KS = 1, busy = false, uiPhase = 'menu', spdMul = 1;
    const E = new Map(), SPAWN = new Map(), SEL = new Set();
    let selEn = null, curKey = null, disp = { money: null, chips: null, mult: null, hname: null, score: null };
    let modal = null, shakeAmp = 0, tipFor = null, hoverEn = null, cursor = { zone: 'hand', i: 0 };
    let blindSel = 0, introT = 0;

    function fit(force) {
      const port = (root.clientWidth || 800) < 640;
      if (!force && PORT === port && G) return;
      PORT = port; G = mkGeo(port);
      wrap.style.width = 'min(100%, ' + G.W + 'px, calc((100dvh - var(--goff, 250px)) * ' + (G.W / G.H).toFixed(4) + '))';
      wrap.style.aspectRatio = G.W + ' / ' + G.H;
      wrap.classList.toggle('bl-port', port);
      stage.style.width = G.W + 'px'; stage.style.height = G.H + 'px';
      Object.keys(G.hud).forEach(k => {
        const e = hel[k], r = G.hud[k];
        if (!e) return;
        if (!r[2]) { e.style.display = 'none'; return; }
        e.style.display = ''; e.style.left = r[0] + 'px'; e.style.top = r[1] + 'px'; e.style.width = r[2] + 'px'; e.style.height = r[3] + 'px';
      });
      hel.undo.hidden = port;
      zl.style.cssText = '';
      [['jb', G.jok], ['cb', G.cons]].forEach(([c, r]) => { const h = Math.round(95 * r.s + 14); zl.querySelector('.' + c).style.cssText = 'left:' + Math.round(r.cx - r.w / 2 - 8) + 'px;top:' + Math.round(r.cy - h / 2) + 'px;width:' + Math.round(r.w + 16) + 'px;height:' + h + 'px'; });
      zl.querySelector('.jl').style.cssText = 'left:' + G.jlab[0] + 'px;top:' + G.jlab[1] + 'px';
      zl.querySelector('.cl').style.cssText = 'left:' + G.clab[0] + 'px;top:' + G.clab[1] + 'px';
      deckEl.style.left = (G.deck.x - 35) + 'px'; deckEl.style.top = (G.deck.y - 47) + 'px';
      const bw = port ? 392 : 520;
      [btnRow, shopBtns, packBtns].forEach(b => { b.style.left = (G.btn.cx - bw / 2) + 'px'; b.style.top = (G.btn.cy - 22) + 'px'; b.style.width = bw + 'px'; });
      packBtns.style.top = (port ? G.btn.cy - 22 : G.pk.cy + 100) + 'px';
      shopLab.style.setProperty('--sx', (G.shop.cx - G.shop.w / 2) + 'px');
      rescale();
      layoutBlinds(); layout(true); hudUpdate();
    }
    function rescale() {
      const w = wrap.clientWidth;
      if (!w) return;
      KS = w / G.W;
      stage.style.setProperty('--k', KS.toFixed(4));
      stage.style.transform = 'scale(' + KS.toFixed(4) + ')';
    }

    const waiters = [];
    let tclock = 0;
    const sleep = ms => new Promise(r => waiters.push({ t: ms, r }));
    const spd = () => OPT.speed;
    api.loop(dt => {
      tclock += dt;
      const adv = dt * 1000 * spd();
      for (let i = waiters.length - 1; i >= 0; i--) { const w = waiters[i]; w.t -= adv; if (w.t <= 0) { waiters.splice(i, 1); w.r(); } }
      stepFx(dt);
    });

    const AC = { ctx: null, master: null, mus: null };
    function ac() {
      if (AC.ctx) return AC.ctx;
      try {
        AC.ctx = new (window.AudioContext || window.webkitAudioContext)();
        AC.master = AC.ctx.createGain(); AC.master.gain.value = .55; AC.master.connect(AC.ctx.destination);
        AC.mus = AC.ctx.createGain(); AC.mus.gain.value = .28; AC.mus.connect(AC.master);
        const len = AC.ctx.sampleRate * 1; AC.nb = AC.ctx.createBuffer(1, len, AC.ctx.sampleRate);
        const d = AC.nb.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { AC.ctx = null; }
      return AC.ctx;
    }
    const sOn = () => !api.muted && OPT.sfx;
    function tone(f, d, type, vol, f2, delay, dest) {
      const c = ac(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      const t0 = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol || .1, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      o.connect(g); g.connect(dest || AC.master); o.start(t0); o.stop(t0 + d + .03);
    }
    function noise(d, vol, f0, f1, delay, q) {
      const c = ac(); if (!c || !AC.nb) return;
      if (c.state === 'suspended') c.resume();
      const t0 = c.currentTime + (delay || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      s.buffer = AC.nb; fl.type = 'bandpass'; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f0, t0); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t0 + d);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      s.connect(fl); fl.connect(g); g.connect(AC.master); s.start(t0); s.stop(t0 + d + .05);
    }
    const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    const hz = st => 261.63 * Math.pow(2, st / 12);
    const SFX = {
      tick: () => tone(1500, .03, 'square', .035),
      sel: n => tone(hz(4 + (n || 0) * 2), .07, 'triangle', .1),
      desel: () => tone(hz(-3), .06, 'triangle', .08),
      bad: () => { tone(150, .18, 'sawtooth', .1, 90); tone(120, .2, 'square', .06, 70, .05); },
      play: () => { noise(.18, .16, 900, 3000); tone(180, .12, 'triangle', .14, 90); },
      disc: () => { noise(.22, .14, 3000, 600); },
      chip: i => { tone(hz(SCALE[Math.min(i, 10)] + 12), .16, 'triangle', .13); tone(hz(SCALE[Math.min(i, 10)] + 24), .1, 'sine', .05); },
      mult: i => { tone(hz(SCALE[Math.min(i, 10)] + 7), .2, 'square', .06); tone(hz(SCALE[Math.min(i, 10)] + 19), .12, 'triangle', .1); },
      xmult: i => { tone(hz(SCALE[Math.min(i, 10)] - 5), .38, 'sawtooth', .1); tone(hz(SCALE[Math.min(i, 10)] + 7), .3, 'square', .07); tone(hz(SCALE[Math.min(i, 10)] + 14), .3, 'triangle', .09, null, .04); noise(.15, .08, 400, 80); },
      cardhit: i => tone(hz(SCALE[Math.min(i, 10)] + 12), .13, 'sine', .12),
      coin: () => { tone(1320, .08, 'square', .06); tone(1760, .16, 'square', .06, null, .07); },
      buy: () => { tone(880, .07, 'square', .06); tone(1320, .12, 'square', .07, null, .06); noise(.1, .07, 5000, 2000, .02); },
      sell: () => { tone(740, .09, 'square', .06); tone(520, .16, 'square', .06, null, .08); },
      reroll: () => { noise(.3, .13, 700, 3500); tone(300, .25, 'triangle', .06, 700); },
      level: () => [0, 4, 7, 12, 16].forEach((s, i) => tone(hz(s + 12), .18, 'triangle', .1, null, i * .06)),
      thump: a => { tone(70 + a * 10, .35, 'sine', .3, 30); noise(.3, .1 + a * .03, 200, 60); },
      shatter: () => { noise(.35, .2, 6000, 1500, 0, 2); tone(2200, .2, 'triangle', .05, 600); },
      pack: () => { noise(.35, .14, 400, 4000); [0, 7, 12].forEach((s, i) => tone(hz(s + 12), .22, 'triangle', .08, null, .12 + i * .07)); },
      won: () => [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(hz(s + 12), .3, 'triangle', .1, null, i * .09)),
      lost: () => [7, 3, 0, -5].forEach((s, i) => tone(hz(s), .4, 'sawtooth', .08, hz(s - 2), i * .22)),
      boss: () => { tone(90, .6, 'sawtooth', .16, 55); tone(135, .6, 'square', .08, 80, .02); },
      skip: () => { noise(.2, .12, 2500, 500); tone(400, .15, 'triangle', .08, 800); },
      spawn: () => tone(hz(SCALE[3] + 12), .08, 'sine', .06, hz(SCALE[5] + 12)),
      use: () => { [0, 7, 12].forEach((s, i) => tone(hz(s + 7), .14, 'sine', .08, null, i * .05)); },
      voucher: () => [0, 4, 7, 11, 14].forEach((s, i) => tone(hz(s + 12), .2, 'sine', .09, null, i * .08))
    };
    const snd = (n, a) => { if (sOn()) try { SFX[n](a); } catch (e) { } };

    const MUS = { step: 0, next: 0 };
    const CH = [[-12, -8, -5], [-16, -12, -9], [-9, -5, -2], [-14, -10, -7]];
    const ARP = [0, 4, 7, 12, 7, 4];
    function musicTick() {
      if (!OPT.music || api.muted || api.paused || !AC.ctx || AC.ctx.state !== 'running') { MUS.next = 0; return; }
      const c = AC.ctx;
      if (!MUS.next || MUS.next < c.currentTime - .5) MUS.next = c.currentTime + .05;
      const sp = R && R.ph === 'shop' ? .26 : R && R.ph === 'round' ? .21 : .3;
      while (MUS.next < c.currentTime + .6) {
        const i = MUS.step++, bar = Math.floor(i / 12) % 4, ch = CH[bar], t = MUS.next - c.currentTime;
        const shopm = R && R.ph === 'shop';
        if (i % 12 === 0) { ch.forEach((s, k) => tone(hz(s - 12 + (shopm ? 2 : 0)), sp * 11, 'sine', .07, null, t + k * .01, AC.mus)); tone(hz(ch[0] - 12), sp * 5, 'triangle', .1, null, t, AC.mus); }
        if (i % 12 === 6) tone(hz(ch[0] - 12), sp * 5, 'triangle', .08, null, t, AC.mus);
        const arpStep = ARP[i % 6] + ch[0] + 12 + (shopm && i % 24 > 11 ? 5 : 0);
        if (i % 2 === 0 || (R && R.ph === 'round')) tone(hz(arpStep), sp * 1.6, 'triangle', .055, null, t, AC.mus);
        if (!shopm && i % 12 === 3) tone(hz(ch[2] + 24), sp * 2.6, 'sine', .04, null, t, AC.mus);
        MUS.next += sp;
      }
    }
    api.interval(musicTick, 200);

    function shake(a) { if (OPT.shake) shakeAmp = Math.max(shakeAmp, a); }

    const BGP = {
      menu: ['#1b2a5e', '#c23a3a', '#2a1a3e'], blinds: ['#2a1a4e', '#c8403a', '#14234a'], round: ['#1f4a3a', '#2a6a8a', '#0e2230'],
      boss: ['#3a0e1a', '#8a1a2a', '#14060a'], shop: ['#0f3a2a', '#c8903a', '#0a2018'], pack: ['#2a1a5a', '#6a3ad8', '#0e0a2a'], over: ['#1a1a1a', '#5a1a1a', '#080808'], win: ['#4a3a0e', '#e8b83a', '#1a1204']
    };
    let bgCur = BGP.menu.map(hex2), bgTgt = bgCur, bgAcc = 0, bgT = 0;
    const bgx = bg.getContext('2d'), bgI = bgx.createImageData(160, 100);
    function bgKey() {
      if (!R || uiPhase === 'menu') return 'menu';
      if (R.ph === 'shop') return 'shop';
      if (R.ph === 'pack') return 'pack';
      if (R.ph === 'over') return 'over';
      if (R.ph === 'win') return 'win';
      if (R.ph === 'round' && R.cur && R.cur.boss) return 'boss';
      if (R.ph === 'round') return 'round';
      return 'blinds';
    }
    function drawBg(dt) {
      bgT += dt; bgAcc += dt;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) bgCur[i][j] += (bgTgt[i][j] - bgCur[i][j]) * Math.min(1, dt * 2.2);
      if (bgAcc < .045) return;
      bgAcc = 0;
      const d = bgI.data, t = bgT * .35, c0 = bgCur[0], c1 = bgCur[1], c2 = bgCur[2];
      for (let y = 0; y < 100; y++) for (let x = 0; x < 160; x++) {
        const u = x / 160 * 3.2 - 1.6, v = y / 100 * 2 - 1;
        let a = u, b = v;
        for (let k = 1; k < 4; k++) { a += Math.sin(b * (1.3 + k * .4) + t * k) * .45 / k; b += Math.cos(a * (1.1 + k * .5) - t * (k + .5)) * .45 / k; }
        const s = Math.sin(a * 2.2 + b * 1.7 + t) * .5 + .5, qv = Math.round(s * 4) / 4;
        const m = qv < .5 ? qv * 2 : (qv - .5) * 2, A = qv < .5 ? c2 : c0, B = qv < .5 ? c0 : c1;
        const i = (y * 160 + x) * 4;
        d[i] = A[0] + (B[0] - A[0]) * m; d[i + 1] = A[1] + (B[1] - A[1]) * m; d[i + 2] = A[2] + (B[2] - A[2]) * m; d[i + 3] = 255;
      }
      bgx.putImageData(bgI, 0, 0);
    }
    function stepFx(dt) {
      const k = bgKey();
      if (curBg !== k) { curBg = k; bgTgt = BGP[k].map(hex2); }
      drawBg(dt);
      if (shakeAmp > .1) {
        shakeAmp *= Math.pow(.02, dt);
        const a = shakeAmp;
        shk.style.transform = 'translate(' + ((Math.random() - .5) * a * 2).toFixed(1) + 'px,' + ((Math.random() - .5) * a * 2).toFixed(1) + 'px) rotate(' + ((Math.random() - .5) * a * .06).toFixed(2) + 'deg)';
      } else if (shakeAmp !== 0) { shakeAmp = 0; shk.style.transform = ''; }
      wrap.classList.toggle('bl-nocrt', !OPT.crt);
    }
    let curBg = '';

    function wanted() {
      const L = [];
      if (!R) return L;
      const add = (zone, arr, kf, kyf, pf) => arr.forEach((o, i) => L.push({ zone, obj: o, i, n: arr.length, kind: kf(o), key: kyf(o), price: pf ? pf(o) : null }));
      add('jok', R.jokers, () => 'joker', o => o.id);
      add('cons', R.cons, () => 'cons', o => o.id);
      const ph = R.ph;
      if (ph === 'round' || ph === 'cash') { add('hand', R.hand, () => 'card', o => o.id); add('play', R.play, () => 'card', o => o.id); }
      if (ph === 'shop' && R.shop) {
        R.shop.items.forEach((it, i) => L.push({ zone: 'shop', obj: it.obj, i, n: R.shop.items.length, kind: it.kind === 'joker' ? 'joker' : it.kind === 'card' ? 'card' : 'cons', key: it.obj.id, price: it.price, idx: i }));
        R.shop.packs.forEach((p, i) => L.push({ zone: 'packs', obj: p, i, n: R.shop.packs.length, kind: 'pack', key: 'p' + p.id, price: p.price, idx: i }));
        R.shop.vouchers.forEach((v, i) => L.push({ zone: 'vouch', obj: v, i, n: R.shop.vouchers.length, kind: 'voucher', key: 'v' + v.k, price: v.price, idx: i }));
      }
      if (ph === 'pack' && R.pack) {
        R.pack.items.forEach((it, i) => L.push({ zone: 'pk', obj: it.obj, i, n: R.pack.items.length, kind: it.type === 'joker' ? 'joker' : it.type === 'card' ? 'card' : 'cons', key: it.obj.id, price: null, idx: i }));
        if (R.pack.hand && R.pack.hand.length) add('pkhand', R.hand, () => 'card', o => o.id);
      }
      return L;
    }
    function selected(zone) { return zone === 'hand' || zone === 'pkhand'; }
    function positions(z, n) {
      const out = [];
      const cw = s => 71 * s;
      if (z === 'jok' || z === 'cons') {
        const g = G[z], xs = spread(n, g.cx, g.w, cw(g.s), 8);
        xs.forEach(x => out.push({ x, y: g.cy, r: 0, s: g.s }));
      } else if (z === 'hand' || z === 'pkhand') {
        const g = G[z], xs = spread(n, g.cx, g.w, cw(g.s), 6), mid = (n - 1) / 2;
        xs.forEach((x, i) => { const o = i - mid; out.push({ x, y: g.cy + o * o * (n > 6 ? .75 : 1.3) * g.s, r: o * (n > 6 ? 1.3 : 2.2), s: g.s }); });
      } else if (z === 'play') {
        const g = G.play, xs = spread(n, g.cx, g.w, cw(g.s), 10);
        xs.forEach(x => out.push({ x, y: g.cy, r: 0, s: g.s }));
      } else if (z === 'shop' || z === 'packs' || z === 'pk') {
        const g = G[z], xs = spread(n, g.cx, g.w, cw(g.s), 16);
        xs.forEach(x => out.push({ x, y: g.cy, r: 0, s: g.s }));
      } else if (z === 'vouch') {
        const g = G.vouch, xs = spread(n, g.cx, 120, cw(g.s), 10);
        xs.forEach(x => out.push({ x, y: g.cy, r: 0, s: g.s }));
      }
      return out;
    }
    function origin(w) {
      const z = w.zone, W = G.W;
      if (z === 'hand') return { x: G.deck.x, y: G.deck.y, s: .7, r: 12 };
      if (z === 'pkhand') return { x: G.pk.cx, y: G.pk.cy, s: .6, r: 0 };
      if (z === 'play') return { x: G.hand.cx, y: G.hand.cy, s: 1, r: 0 };
      if (z === 'shop' || z === 'packs' || z === 'vouch') return { x: w.i % 2 ? W + 60 : -60, y: G.shop.cy - 160, s: .8, r: w.i % 2 ? 14 : -14 };
      if (z === 'pk') return { x: G.pk.cx, y: G.H + 80, s: .8, r: 0 };
      return { x: G.jok.cx, y: -90, s: .8, r: 0 };
    }
    function applyT(en, instant) {
      const el = en.el;
      if (instant) el.style.transition = 'none';
      el.style.transform = 'translate(' + (en.x - 35.5).toFixed(1) + 'px,' + (en.y - 47.5 + (en.dy || 0)).toFixed(1) + 'px) rotate(' + en.r.toFixed(2) + 'deg) scale(' + en.s.toFixed(3) + ')';
      el.style.zIndex = en.z;
      if (instant) { void el.offsetWidth; el.style.transition = ''; }
    }
    function artOf(en) {
      const o = en.obj;
      if (en.kind === 'card') return o.fd ? backArt(R.dk) : playArt(o);
      if (en.kind === 'joker') return jokerArt(JK[o.k]);
      if (en.kind === 'cons') return consArt(o);
      if (en.kind === 'voucher') return voucherArt(o.k);
      return packArtOf(o);
    }
    function paint(en) {
      const o = en.obj, src = artOf(en);
      if (src !== en.src) { en.cx.clearRect(0, 0, 71, 95); en.cx.drawImage(src, 0, 0); en.src = src; }
      let cls = 'bc-i';
      if (en.kind !== 'pack' && en.kind !== 'voucher' && o.ed && !(en.kind === 'card' && o.fd)) cls += ' ed-' + o.ed;
      if (en.kind === 'card' && R && R.ph === 'round' && !o.fd && deb(o)) cls += ' dbf';
      if (en.kind === 'joker' && R && R.jokers.indexOf(o) >= 0 && jOff(o) && (o.per || R.hdis === o.id)) cls += ' dbf';
      if (en.kind === 'card' && o.fd) cls += ' fd';
      if (en.cls !== cls) { en.cls = cls; en.inner.className = cls + (en.idle || ''); }
      let st = '';
      if (en.kind === 'joker') { if (o.et) st += '<i class="s-e">ETERNAL</i>'; if (o.per) st += '<i class="s-p">' + Math.max(0, o.pl) + '</i>'; if (o.rn) st += '<i class="s-r">$3</i>'; }
      if (st !== en.stH) { en.stk.innerHTML = st; en.stH = st; }
      const pr = en.price != null && (en.zone === 'shop' || en.zone === 'packs' || en.zone === 'vouch');
      const ptxt = pr ? (en.price === 0 ? 'FREE' : '$' + en.price) : '';
      if (ptxt !== en.prT) { en.pr.textContent = ptxt; en.pr.style.display = pr ? '' : 'none'; en.prT = ptxt; }
      en.pr.classList.toggle('poor', pr && en.price > 0 && !canAfford(en.price));
    }
    function mkEntry(w) {
      const el = hnode('div', 'bc k-' + w.kind);
      const shd = hnode('i', 'bc-sh'), inner = hnode('div', 'bc-i'), cv = document.createElement('canvas');
      cv.width = 71; cv.height = 95;
      const ov = hnode('b', 'bc-ov'), stk = hnode('div', 'bc-stk'), pr = hnode('div', 'bc-pr');
      inner.append(cv, ov, stk); el.append(shd, inner, pr);
      cardsLayer.append(el);
      const idle = ' idle' + (hashStr(String(w.key)) % 4);
      const en = { key: w.key, kind: w.kind, zone: w.zone, obj: w.obj, el, inner, cv, cx: cv.getContext('2d'), stk, pr, ov, src: null, x: 0, y: 0, r: 0, s: 1, z: 1, dy: 0, price: w.price, idx: w.idx, idle };
      inner.className = 'bc-i' + idle;
      el.addEventListener('pointerdown', e => onDown(e, en));
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hoverEn = en; showTip(en); } });
      el.addEventListener('pointerleave', () => { if (hoverEn === en) { hoverEn = null; if (!selEn || selEn !== en) hideTip(); else showTip(en); } });
      el.addEventListener('pointermove', e => tilt(e, en));
      E.set(w.key, en);
      return en;
    }
    function tilt(e, en) {
      if (e.pointerType !== 'mouse' || en.drag) return;
      const r = en.el.getBoundingClientRect(), px_ = (e.clientX - r.left) / r.width - .5, py_ = (e.clientY - r.top) / r.height - .5;
      en.inner.style.setProperty('--rx', (-py_ * 16).toFixed(1) + 'deg'); en.inner.style.setProperty('--ry', (px_ * 18).toFixed(1) + 'deg');
    }
    let zc = 10;
    function layout(instant) {
      if (!G) return;
      const L = wanted(), seen = new Set(), by = {};
      L.forEach(w => { (by[w.zone] = by[w.zone] || []).push(w); });
      Object.keys(by).forEach(z => {
        const arr = by[z], ps = positions(z, arr.length);
        arr.forEach((w, i) => {
          let en = E.get(w.key), fresh = false;
          if (!en) {
            fresh = true; en = mkEntry(w);
            const sp = SPAWN.get(w.key), o = origin(w);
            if (sp === 'deck') { o.x = G.deck.x; o.y = G.deck.y; o.s = .7; }
            else if (sp === 'shop') { o.x = G.shop.cx; o.y = G.shop.cy; o.s = .5; }
            else if (sp === 'pack') { o.x = G.pk.cx; o.y = G.pk.cy; o.s = .5; }
            else if (sp === 'mid') { o.x = G.main.x + G.main.w / 2; o.y = G.main.y + G.main.h / 2; o.s = .3; }
            en.x = o.x; en.y = o.y; en.r = o.r; en.s = o.s;
            if (!instant && w.zone === 'hand' && (!sp || sp === 'deck')) en.el.style.transitionDelay = (i * 70 / spd()) + 'ms';
            else if (!instant && w.zone === 'pkhand') en.el.style.transitionDelay = (i * 40 / spd()) + 'ms';
            en.el.style.opacity = '0';
            applyT(en, true);
            en.el.style.opacity = '';
            if (instant) { en.fresh0 = 1; }
            setTimeout(() => { en.el.style.transitionDelay = ''; }, 900 / spd());
            SPAWN.delete(w.key);
          }
          if (w.kind === 'joker' && w.obj && w.obj.k) ST.jokersSeen[w.obj.k] = 1;
          en.obj = w.obj; en.zone = w.zone; en.kind = w.kind; en.price = w.price; en.idx = w.idx; en.i = w.i;
          seen.add(w.key);
          if (en.drag) return;
          const p = ps[i];
          let y = p.y;
          if ((selected(z) && SEL.has(w.key)) || (selEn === en)) y -= z === 'hand' || z === 'pkhand' ? 26 * p.s / 1.2 : 12;
          en.x = p.x; en.y = y; en.r = p.r; en.s = p.s; en.z = z === 'play' ? 40 + i : z === 'hand' || z === 'pkhand' ? 20 + i : 10 + i;
          if (selected(z) && SEL.has(w.key)) en.z += 30;
          en.el.classList.toggle('sel', (selected(z) && SEL.has(w.key)) || selEn === en);
          en.el.classList.toggle('tgt', R && R.ph === 'round' && R.forced === w.key && z === 'hand');
          paint(en);
          applyT(en, !!(instant && en.fresh0));
          en.fresh0 = 0;
        });
      });
      E.forEach((en, k) => { if (!seen.has(k) && !en.dying) ghost(en, en.kind === 'card' && (en.zone === 'hand' || en.zone === 'play') ? 'discard' : 'fade'); });
      deckEl.querySelector('b').textContent = R && (R.ph === 'round' || R.ph === 'cash') ? R.draw.length + '/' + R.cards.length : (R ? R.cards.length : '');
      const dc = deckEl.querySelectorAll('canvas');
      if (R && dc[0].dataset.k !== R.dk) { dc.forEach(c => { c.dataset.k = R.dk; const x = c.getContext('2d'); x.clearRect(0, 0, 71, 95); x.drawImage(backArt(R.dk), 0, 0); }); }
      deckEl.style.display = R && (R.ph === 'round' || R.ph === 'cash') ? '' : 'none';
      zl.style.display = R ? '' : 'none';
      if (R) {
        zl.querySelector('.jl').innerHTML = 'Jokers <b>' + R.jokers.filter(j => j.ed !== 'neg').length + '/' + (jslots() - negJ()) + '</b>';
        zl.querySelector('.cl').innerHTML = 'Consumables <b>' + R.cons.filter(j => j.ed !== 'neg').length + '/' + (cslots() - negC()) + '</b>';
      }
      const rp = R ? R.ph : '';
      btnRow.style.display = rp === 'round' && !modal ? '' : 'none';
      shopBtns.style.display = rp === 'shop' && !modal ? '' : 'none';
      packBtns.style.display = rp === 'pack' && !modal ? '' : 'none';
      shopLab.style.display = rp === 'shop' ? '' : 'none';
      if (rp === 'shop') {
        const sl = shopLab;
        sl.querySelector('.sl-i').style.cssText = 'left:' + (G.shop.cx - 50) + 'px;top:' + (G.shop.cy - 47.5 * G.shop.s - 28) + 'px';
        sl.querySelector('.sl-p').style.cssText = 'left:' + (G.packs.cx - 50) + 'px;top:' + (G.packs.cy - 47.5 * G.packs.s - 26) + 'px';
        sl.querySelector('.sl-v').style.cssText = 'left:' + (G.vouch.cx - 40) + 'px;top:' + (G.vouch.cy - 47.5 * G.vouch.s - 28) + 'px';
      }
      updateBtns();
    }

    function ghost(en, how) {
      E.delete(en.key); en.dying = true;
      const el = en.el;
      if (selEn === en) { selEn = null; hideAct(); }
      if (tipFor === en) hideTip();
      const T = 520 / spd();
      const done = () => setTimeout(() => el.remove(), T + 80);
      if (how === 'discard') {
        el.style.transition = 'transform ' + T + 'ms cubic-bezier(.5,0,.8,.4),opacity ' + T + 'ms'; en.x = G.W + 100; en.y = G.deck.y + 10; en.r = 24; en.s *= .8; en.z = 1; applyT(en); el.style.opacity = '0';
      } else if (how === 'sell') {
        const r = G.hud.money; el.style.transition = 'transform ' + T + 'ms cubic-bezier(.4,0,.2,1),opacity ' + T + 'ms'; en.x = r[0] + r[2] / 2; en.y = r[1] + r[3] / 2; en.s = .2; en.r = 0; applyT(en); el.style.opacity = '0';
      } else if (how === 'shatter') {
        shards(en); el.remove(); return;
      } else if (how === 'destroy' || how === 'melt') {
        el.classList.add(how === 'melt' ? 'melt' : 'dissolve'); el.style.transition = 'none';
      } else if (how === 'use') {
        el.style.transition = 'transform ' + T * .7 + 'ms ease-out,opacity ' + T * .7 + 'ms'; en.s *= 1.4; en.dy = -40; applyT(en); el.style.opacity = '0';
      } else {
        el.style.transition = 'transform ' + T + 'ms,opacity ' + T + 'ms'; en.s *= .6; applyT(en); el.style.opacity = '0';
      }
      done();
    }
    function shards(en) {
      const src = en.src; if (!src) return;
      const pts = [[0, 0, 50, 0, 30, 45], [50, 0, 100, 0, 70, 40], [100, 0, 100, 50, 70, 40], [0, 0, 30, 45, 0, 55], [30, 45, 70, 40, 55, 100], [0, 55, 30, 45, 40, 100], [70, 40, 100, 50, 100, 100], [30, 45, 55, 100, 40, 100]];
      pts.forEach(p => {
        const d = hnode('div', 'bc-sd'), c = blit(src);
        c.style.clipPath = 'polygon(' + p[0] + '% ' + p[1] + '%,' + p[2] + '% ' + p[3] + '%,' + p[4] + '% ' + p[5] + '%)';
        d.append(c); cardsLayer.append(d);
        d.style.transform = 'translate(' + (en.x - 35.5) + 'px,' + (en.y - 47.5) + 'px) rotate(' + en.r + 'deg) scale(' + en.s + ')';
        void d.offsetWidth;
        const dx = (p[0] + p[2] + p[4]) / 3 - 50, dy = (p[1] + p[3] + p[5]) / 3 - 50;
        d.style.transition = 'transform 700ms cubic-bezier(.2,.6,.4,1),opacity 700ms';
        d.style.transform = 'translate(' + (en.x - 35.5 + dx * 3 + (Math.random() - .5) * 40) + 'px,' + (en.y - 47.5 + dy * 2 + 160 + Math.random() * 80) + 'px) rotate(' + (en.r + (Math.random() - .5) * 240) + 'deg) scale(' + en.s * .8 + ')';
        d.style.opacity = '0';
        setTimeout(() => d.remove(), 800);
      });
    }

    function bumpEn(key, big) {
      const en = E.get(key); if (!en) return;
      en.dy = big ? -26 : -16; applyT(en);
      setTimeout(() => { en.dy = 0; if (!en.dying) applyT(en); }, 150 / spd());
      en.inner.classList.remove('juice'); void en.inner.offsetWidth; en.inner.classList.add('juice'); setTimeout(() => en.inner.classList.remove('juice'), 450);
    }
    function pop(key, text, cls, off) {
      const en = E.get(key);
      let x = G.main.x + G.main.w / 2, y = G.main.y + 40;
      if (en) { x = en.x; y = en.y - 47.5 * en.s - 6 + (off || 0); if (en.zone === 'jok' || en.zone === 'cons') y = en.y + 47.5 * en.s + 14 + (off || 0); }
      else if (key === 'money') { const r = G.hud.money; x = r[0] + r[2] / 2; y = r[1] + r[3] + 4; }
      const e = hnode('div', 'bl-pop ' + (cls || ''), esc(text));
      e.style.left = x + 'px'; e.style.top = y + 'px';
      pops.append(e);
      setTimeout(() => e.remove(), 1100 / spd() + 200);
    }
    function say(t, ms) {
      note.textContent = t; note.classList.add('on');
      clearTimeout(say.t); say.t = setTimeout(() => note.classList.remove('on'), ms || 2200);
    }
    function banner(title, sub, col) {
      const b = hnode('div', 'bl-bnr', '<b>' + esc(title) + '</b>' + (sub ? '<i>' + esc(sub) + '</i>' : ''));
      if (col) b.style.setProperty('--bc', col);
      stage.append(b);
      setTimeout(() => b.classList.add('out'), 1400 / spd());
      setTimeout(() => b.remove(), 1900 / spd());
    }
    function flash(col, a) {
      if (!OPT.flash) return;
      const f = hnode('div', 'bl-fl'); f.style.background = col || '#fff'; f.style.opacity = a || .35;
      stage.append(f); void f.offsetWidth; f.style.opacity = 0;
      setTimeout(() => f.remove(), 500);
    }

    function handleEv(ev) {
      if (ev.t === 'spawn') { if (ev.from) SPAWN.set(ev.id, ev.from); else SPAWN.set(ev.id, 'mid'); }
    }
    function flush() {
      if (!R) return;
      const q = R.q.splice(0);
      q.forEach(ev => { if (ev.t === 'spawn') handleEv(ev); else if (ev.t === 'gone') { const en = E.get(ev.id); if (en) { const how = ev.how === 'sell' || ev.how === 'use' || ev.how === 'shatter' || ev.how === 'destroy' || ev.how === 'melt' ? ev.how : 'fade'; ghostSoon(en, how); } } });
      layout();
      q.forEach(ev => {
        if (ev.t === 'juice') bumpEn(ev.id);
        else if (ev.t === 'msg') { if (ev.id) bumpEn(ev.id); pop(ev.id || 0, ev.text, 'msg'); }
        else if (ev.t === '$') { if (ev.id) bumpEn(ev.id); pop(ev.id || 'money', '$' + ev.v, 'cash'); snd('coin'); }
        else if (ev.t === 'lvl') { snd('level'); if (ev.hid) say(HAND[ev.hid].n + ' leveled up to lvl.' + R.hl[ev.hid].lvl, 1600); }
        else if (ev.t === 'voucher') { snd('voucher'); banner('Voucher redeemed', VK[ev.k].n, '#e8c040'); }
        else if (ev.t === 'shuf') say('Jokers shuffled!', 1500);
        else if (ev.t === 'saved') { say('Saved by Close Call!', 2200); banner('Saved!', 'Close Call kept you alive', '#6fcf86'); }
        else if (ev.t === 'spawn') snd('spawn');
        else if (ev.t === 'gone') { if (ev.how === 'shatter') { snd('shatter'); shake(8); } else if (ev.how === 'sell') snd('sell'); else if (ev.how === 'destroy' || ev.how === 'melt') snd('thump', 0); }
      });
      hudUpdate();
    }
    function ghostSoon(en, how) { ghost(en, how); }

    function previewHand() {
      if (!R || R.ph !== 'round' || busy) return null;
      const cs = [...SEL].map(id => R.hand.find(c => c.id === id)).filter(Boolean);
      if (!cs.length) return null;
      const h = evalHand(cs, { four: flag('four'), short: flag('short'), smear: flag('smear'), splash: flag('splash') });
      return { id: h.id, n: HAND[h.id].n, l: R.hl[h.id].lvl, c: hv(h.id).c, m: hv(h.id).m };
    }
    const BLC = { small: ['#3a78d8', '#9ac0f8'], big: ['#e8902a', '#f8d08a'] };
    function blindCol(b) { return b.boss ? (BK[b.k] ? BK[b.k].col : '#8a3ad8') : b.k === 'big' ? BLC.big[0] : BLC.small[0]; }
    function hudUpdate() {
      if (!G) return;
      const on = !!R && uiPhase !== 'menu';
      hud.style.display = on ? '' : 'none';
      if (!on) return;
      const b = hel.blind, c = R.cur;
      let nm = 'Choose your next Blind', tgt = '', rew = '', col = '#6a6a7a';
      if (c && (R.ph === 'round' || R.ph === 'cash')) { nm = c.n; tgt = fmtS(c.target); rew = '$'.repeat(Math.min(c.rew, 8)) + (c.rew === 0 ? 'No reward' : ''); col = blindCol(c); }
      else if (R.ph === 'shop') { nm = 'Shop'; col = '#3aa86a'; }
      else if (R.ph === 'pack') { nm = 'Booster Pack'; col = '#7a3fc8'; }
      else if (R.ph === 'blinds') { const bl = R.bl[R.bl.findIndex(x => x.s === 'sel')] || R.bl[0]; col = '#6a6a7a'; }
      b.style.setProperty('--bc', col);
      b.querySelector('b').textContent = nm;
      b.querySelector('.hb-sub').style.visibility = tgt ? '' : 'hidden';
      b.querySelector('.hb-tgt').textContent = tgt;
      b.querySelector('.hb-rew').textContent = rew;
      const cvb = b.querySelector('canvas'), bx = cvb.getContext('2d');
      bx.clearRect(0, 0, 34, 34); bx.drawImage(tokenArt('bl' + col, col, mix(col, '#ffffff', .5), '#ffffff'), 0, 0);
      hel.rscore.querySelector('b').textContent = fmtS(disp.score != null ? disp.score : (R.ph === 'round' || R.ph === 'cash' ? R.score : 0));
      const pv = previewHand();
      const nameEl = hel.mult.querySelector('.hm-name'), ce = hel.mult.querySelector('.hm-c b'), me = hel.mult.querySelector('.hm-m b');
      if (disp.hname != null) { nameEl.textContent = disp.hname; ce.textContent = fmtM(disp.chips); me.textContent = fmtM(disp.mult); }
      else if (pv) { nameEl.innerHTML = pv.n + ' <small>lvl.' + pv.l + '</small>'; ce.textContent = pv.c; me.textContent = pv.m; }
      else { nameEl.textContent = ''; ce.textContent = '0'; me.textContent = '0'; }
      const rnd_ = R.ph === 'round';
      hel.hands.querySelector('b').textContent = rnd_ ? R.hands : hmax();
      hel.disc.querySelector('b').textContent = rnd_ ? R.discards : dmax();
      const mon = disp.money != null ? disp.money : R.money;
      hel.money.querySelector('b').textContent = (mon < 0 ? '-$' : '$') + Math.abs(mon);
      hel.money.classList.toggle('neg', mon < 0);
      hel.ante.querySelector('b').innerHTML = R.ante + '<small>/8</small>';
      hel.round.querySelector('b').textContent = R.round;
      const tg = hel.tags, ks = R.tags.join(',');
      if (tg.dataset.k !== ks) {
        tg.dataset.k = ks; tg.innerHTML = '';
        R.tags.forEach(k => { const t = TGK[k], i = hnode('div', 'tg'); const cv = blit(tokenArt('tg' + k, t.col, mix(t.col, '#ffffff', .45), '#20242c')); i.append(cv); i.addEventListener('pointerenter', ev => { showTipHtml(tagTipHtml(k), ev.clientX, ev.clientY); }); i.addEventListener('pointerleave', hideTip); i.addEventListener('click', ev => showTipHtml(tagTipHtml(k), ev.clientX, ev.clientY)); tg.append(i); });
      }
    }

    function tipPos(x, y) {
      const r = stage.getBoundingClientRect();
      return { x: (x - r.left) / KS, y: (y - r.top) / KS };
    }
    function placeTip(html, cx, top, bottom) {
      tipEl.innerHTML = html; tipEl.style.display = 'block';
      const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
      let x = cx - w / 2, y = top - h - 8;
      if (y < 4) y = bottom + 8;
      if (y + h > G.H - 4) y = Math.max(4, top - h - 8);
      x = Math.max(4, Math.min(G.W - w - 4, x));
      tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
    }
    function showTipHtml(html, cx, cy) {
      const p = tipPos(cx, cy);
      tipFor = null;
      placeTip(html, p.x, p.y - 8, p.y + 8);
    }
    function tipHtml(en) {
      const o = en.obj;
      if (en.kind === 'card') return cardTipHtml(o);
      if (en.kind === 'joker') return jokerTipHtml(o, en.zone === 'shop' || en.zone === 'pk');
      if (en.kind === 'cons') return consTipHtml(o, en.zone === 'shop' || en.zone === 'pk');
      if (en.kind === 'voucher') return voucherTipHtml(o.k);
      return packTipHtml(o);
    }
    function showTip(en) {
      if (modal || drag || busy) return;
      tipFor = en;
      placeTip(tipHtml(en), en.x, en.y - 47.5 * en.s + (en.dy || 0) - (SEL.has(en.key) ? 0 : 0), en.y + 47.5 * en.s);
    }
    function hideTip() { tipEl.style.display = 'none'; tipFor = null; }

    function usableNow(c) {
      if (!R) return false;
      const sc = [...SEL].map(id => R.hand.find(x => x.id === id)).filter(Boolean);
      return canUse(c, sc, R.ph === 'pack');
    }
    function actList(en) {
      const o = en.obj, b = [];
      if (en.zone === 'jok') { if (!o.et) b.push(['sell', 'Sell $' + sellVal(o), 1]); }
      else if (en.zone === 'cons') {
        b.push(['use', 'Use', usableNow(o)]);
        b.push(['sell', 'Sell $' + sellVal(o), 1]);
      } else if (en.zone === 'shop') {
        const slotOk = en.kind === 'joker' ? jfree(o.ed === 'neg') > 0 : en.kind === 'card' ? true : cfree(o.ed === 'neg') > 0;
        const okp = canAfford(en.price);
        b.push(['buy', (en.price ? 'Buy $' + en.price : 'Take'), okp && slotOk]);
        if (en.kind === 'cons' && !CONSDEF(o).t && (!CONSDEF(o).ok || CONSDEF(o).ok([], o)) && (R.ph === 'shop')) b.push(['buyuse', 'Buy & Use', okp && canUse(o, [], false)]);
      } else if (en.zone === 'vouch') b.push(['redeem', (en.price ? 'Redeem $' + en.price : 'Redeem'), canAfford(en.price)]);
      else if (en.zone === 'packs') b.push(['open', (en.price ? 'Open $' + en.price : 'Open'), canAfford(en.price)]);
      else if (en.zone === 'pk') {
        if (en.kind === 'cons') b.push(['take', 'Use', usableNow(o)]);
        else if (en.kind === 'joker') b.push(['take', 'Take', jfree(o.ed === 'neg') > 0]);
        else b.push(['take', 'Add to deck', true]);
      }
      return b;
    }
    function showAct(en) {
      if (!en) { hideAct(); return; }
      const b = actList(en);
      if (!b.length) { hideAct(); return; }
      sel2.innerHTML = b.map(x => '<button data-a="' + x[0] + '"' + (x[2] ? '' : ' disabled') + '>' + x[1] + '</button>').join('');
      sel2.style.display = 'flex';
      const h2 = 36, below = en.zone === 'jok' || en.zone === 'cons' || en.zone === 'shop' || en.zone === 'vouch' || en.zone === 'pk';
      const w = sel2.offsetWidth;
      let x = en.x - w / 2, y = below ? en.y + 47.5 * en.s + 6 : en.y - 47.5 * en.s - h2 - 8;
      if (en.zone === 'packs' || en.zone === 'pkhand') y = en.y - 47.5 * en.s - h2 - 6;
      if (en.zone === 'shop' || en.zone === 'vouch') y = en.y + 47.5 * en.s + 22;
      if (en.zone === 'jok' || en.zone === 'cons') y = en.y + 47.5 * en.s + 10;
      x = Math.max(4, Math.min(G.W - w - 4, x));
      sel2.style.left = x + 'px'; sel2.style.top = Math.max(4, Math.min(G.H - 44, y)) + 'px';
    }
    function hideAct() { sel2.style.display = 'none'; }
    function refreshAct() { if (selEn && E.get(selEn.key) === selEn) showAct(selEn); else { selEn = null; hideAct(); } }
    function selectEn(en) {
      if (selEn === en) { selEn = null; hideAct(); hideTip(); layout(); return; }
      selEn = en; layout(); showAct(en); showTip(en); snd('sel', 1);
    }
    function clearSel() { selEn = null; hideAct(); }

    function updateBtns() {
      if (!R) return;
      const r = R.ph === 'round', n = SEL.size;
      const bp = btnRow.querySelector('[data-b=play]'), bd = btnRow.querySelector('[data-b=disc]');
      bp.disabled = busy || !r || n < 1 || R.hands <= 0;
      bd.disabled = busy || !r || n < 1 || R.discards <= 0;
      btnRow.querySelectorAll('.sm').forEach(b => { b.disabled = busy || !r; b.classList.toggle('on', (b.dataset.b === 'sr' ? 'rank' : 'suit') === R.sortMode); });
      if (R.shop) {
        const rr = shopBtns.querySelector('[data-b=rr]');
        rr.querySelector('span').textContent = '$' + R.shop.rc;
        rr.disabled = busy || !canAfford(R.shop.rc);
        shopBtns.querySelector('[data-b=next]').disabled = busy;
      }
    }
    function bumpHud(k) {
      const e = hel.mult.querySelector(k); if (!e) return;
      e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump');
    }
    const lg = v => Math.log10(Math.max(1, v));

    async function scoreSeq(S) {
      const cnt = {};
      disp.hname = HAND[S.hid].n + ' <small>lvl.' + R.hl[S.hid].lvl + '</small>'; disp.chips = 0; disp.mult = 0;
      let ci = 0;
      hudUpdate();
      hel.mult.querySelector('.hm-name').innerHTML = disp.hname;
      const scIds = new Set(S.h.sc.map(c => c.id));
      for (const ev of S.ev) {
        if (!api.alive) return;
        if (ev.t === 'base') { disp.chips = ev.ch; disp.mult = ev.mu; hudUpdate(); hel.mult.querySelector('.hm-name').innerHTML = disp.hname; bumpHud('.hm-c'); bumpHud('.hm-m'); snd('tick'); await sleep(420); continue; }
        const off = (cnt[ev.id] = (cnt[ev.id] || 0) + 1) - 1;
        const stack = -off * 24;
        if (ev.t === 'c') { bumpEn(ev.id); pop(ev.id, '+' + fmtM(ev.v), 'chip', stack); disp.chips = ev.ch; disp.mult = ev.mu; snd('chip', ci++); bumpHud('.hm-c'); }
        else if (ev.t === 'm') { bumpEn(ev.id); pop(ev.id, '+' + fmtM(ev.v) + ' Mult', 'mult', stack); disp.chips = ev.ch; disp.mult = ev.mu; snd('mult', ci++); bumpHud('.hm-m'); }
        else if (ev.t === 'x') { bumpEn(ev.id, true); pop(ev.id, 'X' + fmtM(ev.v), 'xmult', stack); disp.chips = ev.ch; disp.mult = ev.mu; snd('xmult', ci++); bumpHud('.hm-m'); shake(5); flash('#ff4a3a', .12); }
        else if (ev.t === '$') { bumpEn(ev.id); pop(ev.id, '$' + ev.v, 'cash', stack); disp.money = (disp.money || 0) + ev.v; snd('coin'); }
        else if (ev.t === 'msg') { bumpEn(ev.id); pop(ev.id, ev.text, 'msg', stack); snd('cardhit', ci++); }
        else if (ev.t === 'bal') { disp.chips = ev.ch; disp.mult = ev.mu; pop(0, 'Balanced!', 'xmult'); snd('xmult', ci++); bumpHud('.hm-c'); bumpHud('.hm-m'); }
        hudUpdate(); hel.mult.querySelector('.hm-name').innerHTML = disp.hname;
        const isCard = scIds.has(ev.id);
        await sleep(ev.t === 'x' || ev.t === 'bal' ? 470 : isCard ? 250 : 330);
      }
      await sleep(260);
      const tot = S.tot, from = R.score;
      if (tot > 0) {
        const steps = 22;
        for (let i = 1; i <= steps; i++) {
          disp.score = from + tot * (i / steps) * (i / steps * .4 + .6 * (i / steps));
          if (i === steps) disp.score = from + tot;
          hudUpdate(); hel.mult.querySelector('.hm-name').innerHTML = disp.hname;
          if (i % 3 === 0) snd('tick');
          await sleep(30);
        }
        const mag = lg(tot);
        shake(Math.min(30, 5 + mag * 3.2)); snd('thump', Math.min(6, mag));
        if (mag > 3) flash('#ffffff', Math.min(.5, .1 + mag * .05));
        pop(0, '+' + fmtS(tot), 'tot');
      } else { disp.score = from; hudUpdate(); }
      await sleep(520);
    }

    function ensureForced() {
      if (!R || !R.cur || !bossOn('bell')) { return; }
      if (!R.hand.find(c => c.id === R.forced)) R.forced = R.hand.length ? R.hand[rint(R.hand.length)].id : null;
      if (R.forced) SEL.add(R.forced);
    }
    function afterDraw() {
      if (R.sortMode && R.ph === 'round') sortHand(R.sortMode);
      ensureForced();
    }

    async function startBlind(bi) {
      if (busy || !R || R.ph !== 'blinds') return;
      busy = true; clearSel(); hideTip(); SEL.clear();
      const b = R.bl[bi];
      setBlindAction(bi, 'play');
      if (R.sortMode) sortHand(R.sortMode);
      ensureForced();
      renderBlinds();
      if (R.cur.boss) { snd('boss'); shake(12); banner(R.cur.n, BK[R.cur.k].d, BK[R.cur.k].col); }
      else { snd('skip'); banner(R.cur.n, 'Score at least ' + fmtS(R.cur.target), blindCol(R.cur)); }
      flush();
      await sleep(700);
      busy = false; hudUpdate(); layout(); persist();
    }
    function skipBlind(bi) {
      if (busy || !R || R.ph !== 'blinds') return;
      const t = setBlindAction(bi, 'skip');
      if (!t) { snd('bad'); return; }
      snd('skip'); banner('Blind skipped', 'Tag: ' + TGK[t].n, TGK[t].col);
      flush(); renderBlinds(); hudUpdate(); persist();
    }
    function rerollBossUI() {
      if (busy || !R || R.ph !== 'blinds') return;
      if (!rerollBoss()) { snd('bad'); return; }
      snd('reroll'); flush(); renderBlinds(); persist();
    }

    async function playSel() {
      if (busy || !R || R.ph !== 'round') return;
      const ids = R.hand.filter(c => SEL.has(c.id)).map(c => c.id);
      if (!ids.length || R.hands <= 0) { snd('bad'); return; }
      busy = true; clearSel(); hideTip(); hideAct();
      const S = playHand(ids);
      if (!S) { busy = false; return; }
      SEL.clear();
      snd('play');
      const sm = S.ev.reduce((a, e) => a + (e.t === '$' ? e.v : 0), 0);
      disp.money = R.money - sm;
      disp.score = R.score;
      if (S.hooked && S.hooked.length) say('Pickpocket discards 2 cards', 1600);
      flush();
      await sleep(520);
      await scoreSeq(S);
      if (!api.alive) return;
      const res = S.finish();
      disp = { money: null, chips: null, mult: null, hname: null, score: null };
      if (S.tot > ST.bestHand) ST.bestHand = S.tot;
      api.score(R.stats.bestHand);
      afterDraw();
      flush();
      hudUpdate();
      await sleep(420);
      if (res.won) await roundWon(res);
      else if (res.lost) await loseRun();
      else { busy = false; layout(); hudUpdate(); persist(); }
    }
    async function discardSel() {
      if (busy || !R || R.ph !== 'round') return;
      const ids = R.hand.filter(c => SEL.has(c.id)).map(c => c.id);
      if (!ids.length || R.discards <= 0) { snd('bad'); return; }
      busy = true; clearSel(); hideTip(); hideAct();
      const r = discardCards(ids);
      if (!r) { busy = false; return; }
      SEL.clear(); snd('disc');
      afterDraw();
      flush();
      await sleep(450);
      busy = false; layout(); hudUpdate(); persist();
    }
    function sortUI(mode) {
      if (busy || !R || R.ph !== 'round') return;
      sortHand(mode); snd('sel', 0); layout(); updateBtns(); persist();
    }

    async function roundWon() {
      snd('won'); flash('#ffe45a', .3); shake(6);
      banner('Blind defeated!', R.cur.n, '#6fcf86');
      await sleep(900);
      const c = roundEnd();
      flush(); hudUpdate();
      await sleep(250);
      busy = false;
      showCash(c);
    }
    function showCash(c) {
      uiPhase = 'cash';
      const box = hnode('div', 'bl-cash');
      box.innerHTML = '<h3>Round won</h3><div class="cl-lines"></div><div class="cl-tot"><span>Cash Out</span><b>$' + c.total + '</b></div><button class="bbtn next" data-c="out"><b>Cash Out</b><kbd>Enter</kbd></button>';
      ovl.innerHTML = ''; ovl.className = 'bl-ov show cashov'; ovl.append(box);
      const lines = box.querySelector('.cl-lines'); let n = 0;
      const rows = c.lines.map(l => { const r = hnode('div', 'cl-r', '<span>' + esc(l.l) + '</span><b class="' + (l.v < 0 ? 'neg' : '') + '">' + (l.v < 0 ? '-$' + (-l.v) : '$' + l.v) + '</b>'); r.style.opacity = 0; lines.append(r); return r; });
      (async () => { for (const r of rows) { await sleep(280); if (!api.alive || !box.isConnected) return; r.style.opacity = 1; snd('coin'); n++; } })();
    }
    function hideOv() { ovl.className = 'bl-ov'; ovl.innerHTML = ''; }
    function cashOutUI() {
      if (!R || !R.cash || R.ph !== 'cash') return;
      const total = R.cash.total;
      const r = cashOut();
      snd('buy'); hideOv();
      if (r === 'win') { flush(); hudUpdate(); winRun(); return; }
      uiPhase = 'game';
      flush(); hudUpdate(); layout(); persist();
      if (total) pop('money', (total < 0 ? '-$' + -total : '+$' + total), 'cash');
    }
    function nextBlindUI() {
      if (busy || !R || R.ph !== 'shop') return;
      clearSel(); hideTip();
      nextBlind(); snd('skip');
      flush(); renderBlinds(); hudUpdate(); layout(); persist();
    }

    function doBuy(en, use) {
      if (busy || !R || R.ph !== 'shop') return;
      const idx = R.shop.items.findIndex(i => i.obj === en.obj);
      if (idx < 0) return;
      const price = en.price;
      if (use && (en.kind !== 'cons' || !canUse(en.obj, [], false))) use = false;
      const r = buyItem(idx, use);
      if (!r) { snd('bad'); say(!canAfford(price) ? 'Not enough money' : 'No room', 1400); return; }
      snd('buy'); clearSel(); hideTip();
      if (use) { const c = R.cons.find(x => x === en.obj); if (c) useConsumable(c, [], false); }
      flush(); hudUpdate(); layout(); persist();
    }
    function doSell(en) {
      if (busy || !R) return;
      const o = en.obj;
      if (R.ph === 'pack' || o.et) { snd('bad'); return; }
      const v = sellItem(o);
      if (!v && v !== 0) { snd('bad'); return; }
      snd('sell'); clearSel(); hideTip();
      flush(); hudUpdate(); layout(); persist();
    }
    function selCards() { return R ? R.hand.filter(c => SEL.has(c.id)) : []; }
    function doUse(en) {
      if (busy || !R) return;
      const o = en.obj;
      if (!usableNow(o)) { snd('bad'); const d = CONSDEF(o); say(d.t ? 'Select ' + (d.t[0] === d.t[1] ? d.t[0] : d.t[0] + '-' + d.t[1]) + ' card' + (d.t[1] > 1 ? 's' : '') + ' first' : 'Cannot use now', 1600); return; }
      const sc = selCards();
      clearSel(); hideTip();
      useConsumable(o, sc, false);
      snd('use');
      if (R.ph === 'round') { SEL.clear(); ensureForced(); }
      flush(); hudUpdate(); layout(); persist();
    }
    function doReroll() {
      if (busy || !R || R.ph !== 'shop') return;
      if (!reroll()) { snd('bad'); return; }
      snd('reroll'); clearSel(); hideTip(); flush(); hudUpdate(); layout(); persist();
    }
    function doRedeem(en) {
      if (busy || !R || R.ph !== 'shop') return;
      const idx = R.shop.vouchers.findIndex(v => v.k === en.obj.k);
      if (idx < 0 || !buyVoucher(idx)) { snd('bad'); return; }
      clearSel(); hideTip(); flush(); hudUpdate(); layout(); persist();
    }
    function doOpen(en) {
      if (busy || !R || R.ph !== 'shop') return;
      const idx = R.shop.packs.findIndex(p => p === en.obj);
      if (idx < 0) return;
      const price = en.price;
      if (!canAfford(price)) { snd('bad'); return; }
      const pk = buyPack(idx);
      if (!pk) { snd('bad'); return; }
      snd('pack'); clearSel(); hideTip(); SEL.clear();
      banner(PKS[pk.p.size] + PKN[pk.kind] + ' Pack', PKD[pk.kind](pk.p.n).replace('%p', pk.p.pick), PKC[pk.kind][0]);
      flush(); hudUpdate(); layout(); persist();
    }
    function doTake(en) {
      if (busy || !R || R.ph !== 'pack') return;
      const idx = R.pack.items.findIndex(i => i.obj === en.obj);
      if (idx < 0) return;
      const sc = selCards();
      const r = packPick(idx, sc);
      if (!r) { snd('bad'); const o = en.obj; if (en.kind === 'joker') say('No room for another Joker', 1500); else if (en.kind === 'cons') { const d = CONSDEF(o); say(d.t ? 'Select ' + (d.t[0] === d.t[1] ? d.t[0] : d.t[0] + '-' + d.t[1]) + ' card' + (d.t[1] > 1 ? 's' : '') + ' first' : 'Cannot use now', 1600); } return; }
      snd('use'); clearSel(); hideTip(); SEL.clear();
      flush(); hudUpdate();
      if (r === 'done') closePackUI(); else layout();
      persist();
    }
    function closePackUI() {
      closePack(); flush(); hudUpdate(); layout(); persist();
    }
    function skipPackUI() {
      if (busy || !R || R.ph !== 'pack') return;
      snd('skip'); clearSel(); hideTip(); SEL.clear();
      skipPack(); flush(); hudUpdate(); layout(); persist();
    }
    function actClick(a) {
      const en = selEn; if (!en) return;
      if (a === 'sell') doSell(en);
      else if (a === 'use') doUse(en);
      else if (a === 'buy') doBuy(en, false);
      else if (a === 'buyuse') doBuy(en, true);
      else if (a === 'redeem') doRedeem(en);
      else if (a === 'open') doOpen(en);
      else if (a === 'take') doTake(en);
    }

    function finishStats() {
      ST.runs++;
      if (R.ante > ST.bestAnte) ST.bestAnte = R.ante;
      if (R.stats.bestHand > ST.bestHand) ST.bestHand = R.stats.bestHand;
      if (R.endless && R.ante > ST.endless) ST.endless = R.ante;
      api.score(R.stats.bestHand);
      if (R.stats.bestHand > 0) api.submit(Math.floor(R.stats.bestHand));
    }
    function statRows() {
      const mp = mostPlayed();
      return [
        ['Best hand', fmtN(R.stats.bestHand)], ['Ante', R.ante], ['Rounds', R.round], ['Hands played', R.stats.hands],
        ['Most played', R.hl[mp].played ? HAND[mp].n + ' (' + R.hl[mp].played + ')' : '-'], ['Rerolls', R.stats.rerolls], ['Items bought', R.stats.bought],
        ['Cards used', R.stats.tarots + R.stats.planets + R.stats.spectrals], ['Deck', DECKS[R.dk][0]], ['Stake', STAKES[R.st - 1][0]], ['Seed', R.seed]
      ];
    }
    function statsHtml(rows) { return '<div class="ov-st">' + rows.map(r => '<div><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>').join('') + '</div>'; }
    async function loseRun() {
      snd('lost'); shake(14); flash('#ff3030', .35);
      gameOver(); finishStats(); persist();
      flush();
      await sleep(900);
      busy = false;
      uiPhase = 'over';
      const sc = R.cur ? fmtS(R.score) + ' / ' + fmtS(R.cur.target) : '';
      ovl.className = 'bl-ov show overov';
      ovl.innerHTML = '<div class="ov-card lose"><h2>Game Over</h2><p>You fell short against <b>' + esc(R.cur ? R.cur.n : '') + '</b><br><small>' + sc + '</small></p>' + statsHtml(statRows()) + '<div class="ov-b"><button class="bbtn next" data-m="new"><b>New Run</b></button><button class="bbtn rr" data-m="menu"><b>Main Menu</b></button></div></div>';
    }
    function winRun() {
      snd('won'); flash('#ffe45a', .5); shake(10);
      ST.wins++; finishStats(); persist();
      uiPhase = 'win';
      ovl.className = 'bl-ov show overov';
      ovl.innerHTML = '<div class="ov-card win"><h2>You Win!</h2><p>You cleared Ante 8 on ' + esc(STAKES[R.st - 1][0]) + '.<br><small>Keep going in Endless Mode for a bigger score.</small></p>' + statsHtml(statRows()) + '<div class="ov-b"><button class="bbtn next" data-m="endless"><b>Endless Mode</b></button><button class="bbtn rr" data-m="new"><b>New Run</b></button><button class="bbtn disc" data-m="menu"><b>Main Menu</b></button></div></div>';
    }

    function renderBlinds() {
      const on = R && R.ph === 'blinds' && uiPhase !== 'menu' && !modal;
      bslot.style.display = on ? 'flex' : 'none';
      if (!on) return;
      bslot.innerHTML = '';
      const si = R.bl.findIndex(b => b.s === 'sel');
      R.bl.forEach((b, i) => {
        const boss = b.k === 'boss', col = boss ? BK[b.boss].col : b.k === 'big' ? BLC.big[0] : BLC.small[0];
        const nm = boss ? BK[b.boss].n : b.k === 'big' ? 'Big Blind' : 'Small Blind';
        const tgt = blindTarget(b), rew = blindRew(b);
        const el = hnode('div', 'bp s-' + b.s + ' t-' + b.k);
        el.style.setProperty('--bc', col);
        let h = '<div class="bp-h"><b>' + esc(nm) + '</b></div><div class="bp-b"><canvas class="bp-tok" width="34" height="34"></canvas><div class="bp-t"><span>Score at least</span><b>' + fmtS(tgt) + '</b></div>';
        h += '<div class="bp-r">Reward <b>' + (rew ? '$'.repeat(rew) : 'none') + '</b></div>';
        if (boss) h += '<div class="bp-d" data-boss="' + b.boss + '">' + esc(BK[b.boss].d) + '</div>';
        else h += '<div class="bp-tag" data-tag="' + b.tag + '"><canvas width="34" height="34"></canvas><span>' + esc(TGK[b.tag].n) + '</span></div>';
        h += '</div><div class="bp-f">';
        if (b.s === 'sel') {
          h += '<button class="bbtn next" data-bp="play" data-i="' + i + '"><b>Select</b><kbd>Enter</kbd></button>';
          if (!boss) h += '<button class="bbtn rr" data-bp="skip" data-i="' + i + '"><b>Skip Blind</b><kbd>S</kbd></button>';
          else if (vo('dcut') || vo('retcon')) h += '<button class="bbtn disc" data-bp="rboss"><b>Reroll Boss</b><span>' + (vo('retcon') ? 'free' : '$10') + '</span></button>';
        } else if (b.s === 'done') h += '<div class="bp-st ok">Defeated</div>';
        else if (b.s === 'skip') h += '<div class="bp-st">Skipped</div>';
        else if (b.s === 'up') h += '<div class="bp-st dim">Upcoming</div>';
        h += '</div>';
        el.innerHTML = h;
        bslot.append(el);
        const tk = el.querySelector('.bp-tok').getContext('2d'); tk.drawImage(tokenArt('bl' + col, col, mix(col, '#ffffff', .5), '#ffffff'), 0, 0);
        const tg = el.querySelector('.bp-tag canvas'); if (tg) { const T = TGK[b.tag]; tg.getContext('2d').drawImage(tokenArt('tg' + b.tag, T.col, mix(T.col, '#ffffff', .45), '#20242c'), 0, 0); }
      });
      blindSel = si < 0 ? 0 : si;
      layoutBlinds();
    }
    function layoutBlinds() {
      if (!G) return;
      bslot.style.left = G.main.x + 'px'; bslot.style.top = G.main.y + 'px'; bslot.style.width = G.main.w + 'px'; bslot.style.height = G.main.h + 'px';
      bslot.classList.toggle('port', G.port);
    }

    let drag = null, kbd = false;
    const dragArr = z => z === 'hand' || z === 'pkhand' ? R.hand : z === 'jok' ? R.jokers : R.cons;
    function onDown(e, en) {
      if (e.button != null && e.button > 0) return;
      if (modal || uiPhase === 'menu') return;
      kbd = false;
      const can = !busy && (en.zone === 'hand' || en.zone === 'jok' || en.zone === 'cons');
      drag = { en, sx: e.clientX, sy: e.clientY, ox: en.x, oy: en.y, moved: false, pid: e.pointerId, can, t: e.pointerType, lp: false };
      if (e.pointerType !== 'mouse') {
        drag.timer = setTimeout(() => { if (drag && !drag.moved) { drag.lp = true; showTip(en); } }, 420);
      }
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      const d = drag, en = d.en, dx = (e.clientX - d.sx) / KS, dy = (e.clientY - d.sy) / KS;
      if (!d.moved) {
        if (!d.can || Math.hypot(dx, dy) < 8) return;
        d.moved = true; en.drag = true; clearTimeout(d.timer); hideTip(); hideAct();
        en.el.classList.add('drag'); en.z = 90; en.el.style.transition = 'none';
      }
      en.x = d.ox + dx; en.y = d.oy + dy; en.r = Math.max(-14, Math.min(14, dx * .12)); en.s = en.s0 || (en.s0 = en.s);
      applyT(en);
      const ps = positions(en.zone, dragArr(en.zone).length);
      let best = 0, bd = 1e9;
      ps.forEach((p, i) => { const q = Math.abs(p.x - en.x); if (q < bd) { bd = q; best = i; } });
      const arr = dragArr(en.zone), from = arr.indexOf(en.obj);
      if (from >= 0 && best !== from) {
        arr.splice(from, 1); arr.splice(best, 0, en.obj);
        if (en.zone === 'hand') R.sortMode = null;
        snd('tick');
        layout();
      }
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      const d = drag; drag = null; clearTimeout(d.timer);
      const en = d.en;
      if (d.moved) {
        en.drag = false; en.s0 = null; en.el.classList.remove('drag'); en.el.style.transition = '';
        layout(); persist();
        return;
      }
      if (d.lp) return;
      if (!E.has(en.key)) return;
      clickEn(en);
    }
    function clickEn(en) {
      if (busy || modal) return;
      if (en.zone === 'hand' || en.zone === 'pkhand') toggleCard(en);
      else selectEn(en);
    }
    function toggleCard(en) {
      const id = en.key;
      if (en.obj.fd && R.ph !== 'round') return;
      if (SEL.has(id)) {
        if (R.ph === 'round' && R.forced === id && bossOn('bell')) { snd('bad'); say('This card must always be selected', 1500); return; }
        SEL.delete(id); snd('desel');
      } else {
        if (SEL.size >= 5) { snd('bad'); say('You can select at most 5 cards', 1400); return; }
        SEL.add(id); snd('sel', SEL.size);
      }
      layout(); hudUpdate(); refreshAct(); markCursor();
    }

    function zonesFor() {
      if (!R) return [];
      if (R.ph === 'round') return ['hand', 'jok', 'cons'];
      if (R.ph === 'shop') return ['shop', 'vouch', 'packs', 'jok', 'cons'];
      if (R.ph === 'pack') return ['pk', 'pkhand', 'jok', 'cons'];
      return ['jok', 'cons'];
    }
    function zoneEntries(z) { return [...E.values()].filter(e => e.zone === z && !e.dying).sort((a, b) => a.i - b.i); }
    function curEn() {
      const zs = zonesFor();
      if (zs.indexOf(cursor.zone) < 0) cursor.zone = zs[0];
      let a = zoneEntries(cursor.zone);
      if (!a.length) { for (const z of zs) { a = zoneEntries(z); if (a.length) { cursor.zone = z; break; } } }
      cursor.i = Math.max(0, Math.min(a.length - 1, cursor.i));
      return a[cursor.i] || null;
    }
    function markCursor() {
      const c = kbd ? curEn() : null;
      E.forEach(en => en.el.classList.toggle('cur', en === c));
      if (c && !busy) showTip(c); else if (!hoverEn && !(selEn && tipFor === selEn)) { }
    }
    function moveCursor(dx, dy) {
      const zs = zonesFor();
      curEn();
      if (dy) {
        let zi = zs.indexOf(cursor.zone), tries = 0;
        do { zi = (zi + dy + zs.length) % zs.length; tries++; } while (!zoneEntries(zs[zi]).length && tries < zs.length);
        const prev = cursor.zone; cursor.zone = zs[zi];
        if (cursor.zone !== prev) cursor.i = Math.min(cursor.i, Math.max(0, zoneEntries(cursor.zone).length - 1));
      }
      if (dx) {
        const a = zoneEntries(cursor.zone);
        cursor.i = Math.max(0, Math.min(a.length - 1, cursor.i + dx));
      }
      kbd = true; markCursor(); snd('tick');
    }

    function primaryAct(en) {
      const b = actList(en).find(x => x[2]);
      if (!b) { snd('bad'); return; }
      actClick(b[0]);
    }
    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || !api.alive || api.paused) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key, lk = k.length === 1 ? k.toLowerCase() : k;
      const stop = () => { e.preventDefault(); e.stopPropagation(); };
      if (modal) { if (k === 'Enter' && modal.dataset.enter) { stop(); const b = modal.querySelector(modal.dataset.enter); if (b) b.click(); } return; }
      if (uiPhase === 'menu') {
        if (k === 'Enter' && ovl.querySelector('[data-m=cont]')) { stop(); menuAct('cont'); }
        else if (k === 'Enter' && ovl.querySelector('[data-n=go]')) { stop(); newRunGo(); }
        else if (k === 'Enter' && ovl.querySelector('[data-m=new]')) { stop(); menuAct('new'); }
        else if (ovl.querySelector('[data-n=dp]') && (k === 'ArrowLeft' || k === 'ArrowRight')) { stop(); nrDeck(k === 'ArrowLeft' ? -1 : 1); }
        else if (ovl.querySelector('[data-n=dp]') && (k === 'ArrowUp' || k === 'ArrowDown')) { stop(); nrStake(k === 'ArrowUp' ? -1 : 1); }
        return;
      }
      if (!R) return;
      if (uiPhase === 'over' || uiPhase === 'win') {
        if (k === 'Enter') { stop(); menuAct(uiPhase === 'win' ? 'endless' : 'new'); }
        return;
      }
      if (busy) return;
      if (R.ph === 'cash') { if (k === 'Enter' || k === ' ') { stop(); cashOutUI(); } return; }
      if (lk === 'i') { stop(); openInfo(); return; }
      if (lk === 'v') { stop(); openDeck(); return; }
      if (R.ph === 'blinds') {
        if (k === 'Enter' || k === ' ') { stop(); const i = R.bl.findIndex(b => b.s === 'sel'); if (i >= 0) startBlind(i); }
        else if (lk === 's') { stop(); const i = R.bl.findIndex(b => b.s === 'sel'); if (i >= 0) skipBlind(i); }
        else if (lk === 'r') { stop(); rerollBossUI(); }
        else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') { stop(); moveCursor(k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0, k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0); }
        else if (k === 'Enter') { }
        return;
      }
      if (k === 'ArrowLeft' || k === 'ArrowRight') { stop(); moveCursor(k === 'ArrowRight' ? 1 : -1, 0); return; }
      if (k === 'ArrowUp' || k === 'ArrowDown') { stop(); moveCursor(0, k === 'ArrowDown' ? 1 : -1); return; }
      if (k === 'Backspace') { stop(); SEL.clear(); clearSel(); hideTip(); ensureForced(); layout(); hudUpdate(); return; }
      const ce = curEn();
      if (R.ph === 'round') {
        if (k === ' ' && ce) { stop(); kbd = true; clickEn(ce); }
        else if (k === 'Enter') { stop(); if (SEL.size) playSel(); else if (ce) { kbd = true; clickEn(ce); } }
        else if (lk === 'p') { stop(); playSel(); }
        else if (lk === 'd' || lk === 'x') { stop(); discardSel(); }
        else if (lk === 'r') { stop(); sortUI('rank'); }
        else if (lk === 't') { stop(); sortUI('suit'); }
        else if (/^[0-9]$/.test(k)) { stop(); const n = k === '0' ? 10 : +k, en = zoneEntries('hand')[n - 1]; if (en) toggleCard(en); }
        else if (lk === 'u') { stop(); const en = selEn && selEn.zone === 'cons' ? selEn : ce && ce.zone === 'cons' ? ce : null; if (en) doUse(en); }
        else if (lk === 's' || k === 'Delete') { stop(); if (selEn && (selEn.zone === 'jok' || selEn.zone === 'cons')) doSell(selEn); else if (ce && (ce.zone === 'jok' || ce.zone === 'cons')) { kbd = true; selectEn(ce); } }
        return;
      }
      if (R.ph === 'shop') {
        if (k === ' ' && ce) { stop(); kbd = true; selectEn(ce); }
        else if (k === 'Enter') { stop(); if (selEn && selEn === ce) primaryAct(ce); else if (ce) { kbd = true; selectEn(ce); } }
        else if (lk === 'n') { stop(); nextBlindUI(); }
        else if (lk === 'g') { stop(); doReroll(); }
        else if (lk === 'b') { stop(); if (selEn && selEn.zone === 'shop') doBuy(selEn, true); }
        else if (lk === 's' || k === 'Delete') { stop(); if (selEn && (selEn.zone === 'jok' || selEn.zone === 'cons')) doSell(selEn); else if (ce && (ce.zone === 'jok' || ce.zone === 'cons')) { kbd = true; selectEn(ce); } }
        else if (lk === 'u') { stop(); const en = selEn && selEn.zone === 'cons' ? selEn : null; if (en) doUse(en); }
        return;
      }
      if (R.ph === 'pack') {
        if (k === ' ' && ce) { stop(); kbd = true; if (ce.zone === 'pkhand') toggleCard(ce); else selectEn(ce); }
        else if (k === 'Enter') { stop(); if (ce && ce.zone === 'pkhand') toggleCard(ce); else if (selEn && selEn === ce) primaryAct(ce); else if (ce) { kbd = true; selectEn(ce); } }
        else if (lk === 's') { stop(); skipPackUI(); }
        return;
      }
    }

    let modalOnClose = null;
    function openModal(title, body, o) {
      closeModal(true);
      hideTip(); hideAct();
      const m = hnode('div', 'bl-modal' + (o && o.cls ? ' ' + o.cls : ''));
      m.innerHTML = '<div class="md-c"><div class="md-h"><h3>' + title + '</h3><button class="md-x" data-x="1" aria-label="Close">X</button></div><div class="md-b">' + body + '</div></div>';
      if (o && o.enter) m.dataset.enter = o.enter;
      stage.append(m); modal = m;
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) { closeModal(); snd('tick'); } });
      layout(); bslot.style.display = 'none';
      return m;
    }
    function closeModal(silent) {
      if (!modal) return;
      modal.remove(); modal = null; hideTip();
      if (!silent) { layout(); renderBlinds(); const f = modalOnClose; modalOnClose = null; if (f) f(); }
    }
    function mkCanvasIn(src, w, h, cls) { const c = blit(src); if (w) { c.style.width = w + 'px'; c.style.height = h + 'px'; } if (cls) c.className = cls; return c; }
    function tipOn(el, html) {
      el.addEventListener('pointerenter', e => showTipHtml(typeof html === 'function' ? html() : html, e.clientX, e.clientY));
      el.addEventListener('pointerleave', hideTip);
      el.addEventListener('click', e => { showTipHtml(typeof html === 'function' ? html() : html, e.clientX, e.clientY); });
    }

    function openInfo() {
      if (!R) return;
      const tabs = ['Hands', 'Blinds', 'Vouchers', 'Tags'];
      let tab = 0;
      const m = openModal('Run Info', '<div class="md-t"></div><div class="md-p"></div>', {});
      const tb = m.querySelector('.md-t'), pn = m.querySelector('.md-p');
      function draw() {
        tb.innerHTML = tabs.map((t, i) => '<button class="' + (i === tab ? 'on' : '') + '" data-t="' + i + '">' + t + '</button>').join('');
        pn.innerHTML = '';
        if (tab === 0) {
          const t = hnode('table', 'md-tab');
          t.innerHTML = '<tr><th>Hand</th><th>Lvl</th><th>Chips</th><th></th><th>Mult</th><th>Played</th></tr>' + HORD.filter(knownHand).map(k => { const v = hv(k), l = R.hl[k]; return '<tr><td>' + HAND[k].n + '</td><td>' + l.lvl + '</td><td class="c">' + v.c + '</td><td>X</td><td class="m">' + v.m + '</td><td>' + l.played + '</td></tr>'; }).join('');
          pn.append(t);
        } else if (tab === 1) {
          R.bl.forEach(b => { const boss = b.k === 'boss', nm = boss ? BK[b.boss].n : b.k === 'big' ? 'Big Blind' : 'Small Blind'; const r = hnode('div', 'md-r', '<b>' + esc(nm) + '</b><span>' + fmtS(blindTarget(b)) + '</span><i>' + (boss ? esc(BK[b.boss].d) : 'Skip tag: ' + esc(TGK[b.tag].n)) + '</i><em>' + (b.s === 'done' ? 'Defeated' : b.s === 'skip' ? 'Skipped' : b.s === 'cur' ? 'Current' : b.s === 'sel' ? 'Next' : 'Upcoming') + '</em>'); pn.append(r); });
          pn.append(hnode('p', 'md-note', 'Ante ' + R.ante + ' base score ' + fmtS(anteBase(R.ante)) + (R.endless ? ' (endless)' : '') + '. Stake: ' + STAKES[R.st - 1][0] + '. Seed: ' + esc(R.seed)));
        } else if (tab === 2) {
          const ks = Object.keys(R.vo);
          if (!ks.length) pn.append(hnode('p', 'md-note', 'No vouchers redeemed yet.'));
          ks.forEach(k => { const r = hnode('div', 'md-r', '<b>' + esc(VK[k].n) + '</b><i>' + esc(VK[k].d) + '</i>'); pn.append(r); });
        } else {
          if (!R.tags.length) pn.append(hnode('p', 'md-note', 'No tags held. Skip a Small or Big Blind to get one.'));
          R.tags.forEach(k => { const r = hnode('div', 'md-r', '<b>' + esc(TGK[k].n) + '</b><i>' + esc(TGK[k].d) + '</i>'); pn.append(r); });
        }
      }
      tb.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { tab = +b.dataset.t; draw(); snd('tick'); } });
      draw();
    }
    function openDeck() {
      if (!R || !R.cards.length) return;
      const inDraw = new Set(R.draw.map(c => c.id));
      const inRound = R.ph === 'round' || R.ph === 'cash';
      const m = openModal('Deck: ' + esc(DECKS[R.dk][0]) + ' <small>(' + R.cards.length + ' cards)</small>', '<div class="md-dk"></div>', {});
      const g = m.querySelector('.md-dk');
      const cs = R.cards.slice().sort((a, b) => a.s - b.s || (b.e === 'stone' ? 0 : b.r) - (a.e === 'stone' ? 0 : a.r));
      cs.forEach(c => { const w = hnode('div', 'dk-c' + (inRound && !inDraw.has(c.id) ? ' used' : '')); w.append(mkCanvasIn(playArt(c))); tipOn(w, () => cardTipHtml(c)); g.append(w); });
      const sumEl = hnode('div', 'md-note');
      const bySuit = [0, 1, 2, 3].map(s => R.cards.filter(c => c.s === s && c.e !== 'stone').length);
      sumEl.innerHTML = SN.map((n, i) => '<span style="color:' + SCOL[i] + '">' + SG[i] + ' ' + bySuit[i] + '</span>').join('  ') + (inRound ? '  |  Draw pile: ' + R.draw.length : '');
      m.querySelector('.md-b').append(sumEl);
    }
    function openOptions() {
      const rows = [
        ['speed', 'Game speed', ['1x', '2x', '4x'], [1, 2, 4]],
        ['shake', 'Screen shake', ['On', 'Off'], [true, false]],
        ['crt', 'CRT filter', ['On', 'Off'], [true, false]],
        ['flash', 'Flashes', ['On', 'Off'], [true, false]],
        ['sfx', 'Sound effects', ['On', 'Off'], [true, false]],
        ['music', 'Music', ['On', 'Off'], [true, false]],
        ['sort', 'Default hand sort', ['Rank', 'Suit'], ['rank', 'suit']]
      ];
      const m = openModal('Options', '<div class="md-o"></div><div class="md-ob"></div>', {});
      const g = m.querySelector('.md-o');
      const draw = () => {
        g.innerHTML = rows.map(r => '<div class="op"><span>' + r[1] + '</span><div>' + r[2].map((l, i) => '<button data-o="' + r[0] + '" data-v="' + i + '" class="' + (OPT[r[0]] === r[3][i] ? 'on' : '') + '">' + l + '</button>').join('') + '</div></div>').join('');
      };
      draw();
      g.addEventListener('click', e => {
        const b = e.target.closest('[data-o]'); if (!b) return;
        const r = rows.find(x => x[0] === b.dataset.o); OPT[r[0]] = r[3][+b.dataset.v];
        draw(); snd('tick'); persist();
        if (R && r[0] === 'sort' && R.ph === 'round') { R.sortMode = OPT.sort; }
      });
      const bb = m.querySelector('.md-ob');
      bb.innerHTML = '<button class="bbtn next" data-x="1"><b>Resume</b></button>' + (uiPhase !== 'menu' ? '<button class="bbtn rr" data-q="menu"><b>Main Menu</b></button>' : '');
      bb.addEventListener('click', e => { if (e.target.closest('[data-q=menu]')) { closeModal(true); persist(); showMenu(); } });
    }
    function openHelp() {
      openModal('How to Play', '<div class="md-h2"><p><b>Goal.</b> Beat the score of every Blind in 8 Antes. Each Ante has a Small Blind, a Big Blind and a Boss Blind with a special rule. You can skip Small and Big Blinds for a Tag.</p><p><b>Each round.</b> Select up to 5 cards and Play Hand to score them as a poker hand: <b class="c">Chips</b> times <b class="m">Mult</b>. Discard to swap cards. Only scoring cards add their chips. Unused hands pay out $1 each and every $5 you hold earns $1 interest.</p><p><b>Shop.</b> Buy Jokers (up to 5), Planet cards to level up hands, Tarot and Specter cards to alter your deck, Booster Packs and one Voucher per Ante. Jokers score from left to right, so drag to reorder them.</p><p><b>Controls.</b> Click or tap cards to select, drag to reorder. Keyboard: arrows move, Space selects, Enter plays, D discards, R and T sort, 1-9 pick cards, U uses a consumable, S sells, N next round, G reroll, I run info, V deck.</p></div>', {});
    }

    function openCollection(tab0) {
      const tabs = [['Jokers', 'j'], ['Tarot', 't'], ['Planets', 'p'], ['Specters', 's'], ['Vouchers', 'v'], ['Bosses', 'b'], ['Tags', 'g'], ['Decks', 'd']];
      let tab = tab0 || 0;
      const m = openModal('Collection', '<div class="md-t"></div><div class="md-p cg"></div>', {});
      const tb = m.querySelector('.md-t'), pn = m.querySelector('.md-p');
      const add = (cv, label, html, dim) => { const w = hnode('div', 'cg-i' + (dim ? ' dim' : '')); w.append(cv); w.append(hnode('span', '', esc(label))); tipOn(w, html); pn.append(w); };
      function draw() {
        tb.innerHTML = tabs.map((t, i) => '<button class="' + (i === tab ? 'on' : '') + '" data-t="' + i + '">' + t[0] + '</button>').join('');
        pn.innerHTML = '';
        const k = tabs[tab][1];
        if (k === 'j') {
          const seen = ST.jokersSeen || {};
          JL.forEach(d => { const ok = seen[d.k]; const fake = Object.assign({ k: d.k, a: 0, ed: null }, d.init ? d.init() : {}); add(ok ? mkCanvasIn(jokerArt(d)) : mkCanvasIn(backArt('black')), ok ? d.n : '???', ok ? jokerTipHtml(fake, true) : '<b>Undiscovered</b><i>Find this Joker in a shop or pack</i>', !ok); });
          pn.prepend(hnode('p', 'md-note cg-h', 'Discovered ' + Object.keys(seen).filter(x => JK[x]).length + ' / ' + JL.length));
        } else if (k === 't') TL.forEach(d => { const c = { type: 'tarot', k: d.k }; add(mkCanvasIn(consArt(c)), d.n, consTipHtml(c, true)); });
        else if (k === 'p') HORD.forEach(h => { const c = { type: 'planet', k: 'pl_' + h }; add(mkCanvasIn(consArt(c)), HAND[h].pl, '<b>' + HAND[h].pl + '</b><em class="rar t-planet">Planet</em><i>Levels up ' + HAND[h].n + ': +' + HAND[h].lc + ' Chips and +' + HAND[h].lm + ' Mult</i>'); });
        else if (k === 's') SL.forEach(d => { const c = { type: 'spectral', k: d.k }; add(mkCanvasIn(consArt(c)), d.n, consTipHtml(c, true)); });
        else if (k === 'v') VL.forEach(v => add(mkCanvasIn(voucherArt(v.k)), v.n, voucherTipHtml(v.k)));
        else if (k === 'b') BL.forEach(b => add(mkCanvasIn(tokenArt('bl' + b.col, b.col, mix(b.col, '#ffffff', .5), '#ffffff'), 68, 68), b.n, bossTipHtml(b.k)));
        else if (k === 'g') TGL.forEach(t => add(mkCanvasIn(tokenArt('tg' + t.k, t.col, mix(t.col, '#ffffff', .45), '#20242c'), 68, 68), t.n, tagTipHtml(t.k)));
        else DK.forEach(d => add(mkCanvasIn(backArt(d)), DECKS[d][0], '<b>' + DECKS[d][0] + '</b><em class="rar bs">Deck</em><i>' + esc(DECKS[d][1]) + '</i>'));
      }
      tb.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { tab = +b.dataset.t; draw(); snd('tick'); } });
      draw();
    }

    let nr = { deck: Math.max(0, DK.indexOf(OPT.deckSel || 'red')), stake: Math.max(1, Math.min(8, OPT.stakeSel || 1)), seed: '' };
    function showMenu() {
      uiPhase = 'menu'; stage.classList.add('in-menu'); hideTip(); hideAct(); clearSel(); bslot.style.display = 'none';
      const has = SV.run && SV.run.ante && SV.run.cards;
      ovl.className = 'bl-ov show menuov';
      const sum = has ? 'Ante ' + SV.run.ante + ' - Round ' + SV.run.round + ' - $' + SV.run.money + ' - ' + esc(DECKS[SV.run.dk] ? DECKS[SV.run.dk][0] : '') : '';
      ovl.innerHTML = '<div class="m-menu"><div class="m-deco"></div><div class="m-logo"><span>BALATRO</span><small>a poker roguelike</small></div><div class="m-btns">' +
        (has ? '<button class="mb big" data-m="cont"><b>Continue</b><small>' + sum + '</small></button>' : '') +
        '<button class="mb' + (has ? '' : ' big') + '" data-m="new"><b>New Run</b></button><button class="mb" data-m="col"><b>Collection</b></button><button class="mb" data-m="opt"><b>Options</b></button><button class="mb" data-m="help"><b>How to Play</b></button></div>' +
        '<div class="m-st">Runs ' + ST.runs + '  |  Wins ' + ST.wins + '  |  Best ante ' + ST.bestAnte + '  |  Best hand ' + fmtN(ST.bestHand) + '</div></div>';
      const dc = ovl.querySelector('.m-deco');
      ['imp', 'photocopy', 'kingsfool', 'gigglebox', 'catburglar'].forEach((k, i) => { const w = hnode('div', 'md-j'); w.style.setProperty('--i', i); w.append(blit(jokerArt(JK[k]))); dc.append(w); });
      layout(); hudUpdate();
    }
    function nrStake(d) { nr.stake = Math.max(1, Math.min(8, nr.stake + d)); drawNR(); snd('tick'); }
    function nrDeck(d) { nr.deck = (nr.deck + d + DK.length) % DK.length; drawNR(); snd('sel', 0); }
    function drawNR() {
      const dk = DK[nr.deck];
      ovl.className = 'bl-ov show menuov';
      ovl.innerHTML = '<div class="nr"><h2>New Run</h2><div class="nr-deck"><button class="mb sm" data-n="dp" aria-label="Previous deck">&lt;</button><div class="nr-card"></div><button class="mb sm" data-n="dn" aria-label="Next deck">&gt;</button></div><div class="nr-dt"><b>' + esc(DECKS[dk][0]) + '</b><span>' + esc(DECKS[dk][1]) + '</span></div>' +
        '<div class="nr-stk">' + STAKES.map((s, i) => '<button class="' + (i + 1 === nr.stake ? 'on' : '') + (i + 1 < nr.stake ? ' inc' : '') + '" data-n="s' + (i + 1) + '" style="--sc:' + STCOL[i] + '"><i></i><span>' + (i + 1) + '</span></button>').join('') + '</div>' +
        '<p class="nr-sd"><b>' + esc(STAKES[nr.stake - 1][0]) + '</b> ' + esc(STAKES[nr.stake - 1][1]) + (nr.stake > 1 ? '<small>Includes all lower stake effects</small>' : '') + '</p>' +
        '<label class="nr-seed">Seed <input type="text" maxlength="12" placeholder="random" value="' + esc(nr.seed) + '"></label><div class="nr-b"><button class="bbtn rr" data-m="menu"><b>Back</b></button><button class="bbtn next" data-n="go"><b>Play</b><kbd>Enter</kbd></button></div></div>';
      const cd = ovl.querySelector('.nr-card'), c = blit(backArt(dk)); c.className = 'nr-cv'; cd.append(c);
      const inp = ovl.querySelector('input'); inp.addEventListener('input', () => { nr.seed = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') newRunGo(); });
    }
    function newRunGo() {
      OPT.deckSel = DK[nr.deck]; OPT.stakeSel = nr.stake;
      newGame(DK[nr.deck], nr.stake, nr.seed || null);
    }
    function clearEntries() { E.forEach(en => en.el.remove()); E.clear(); SEL.clear(); selEn = null; hideAct(); hideTip(); pops.innerHTML = ''; SPAWN.clear(); }
    function newGame(deck, stake, seed) {
      clearEntries();
      newRun(deck, stake, seed);
      R.sortMode = OPT.sort;
      busy = false; disp = { money: null, chips: null, mult: null, hname: null, score: null };
      uiPhase = 'game'; stage.classList.remove('in-menu'); hideOv();
      SV.run = null;
      api.label('Best hand'); api.score(0);
      renderBlinds(); fit(true); layout(true); hudUpdate(); persist();
      say(DECKS[deck][0] + ' - ' + STAKES[stake - 1][0], 2000);
      if (deck === 'magic' || deck === 'nebula' || deck === 'zodiac') flush();
    }
    function resumeRun() {
      let ok = false;
      try { clearEntries(); deser(JSON.parse(JSON.stringify(SV.run))); ok = !!(R && R.cards && R.bl); } catch (e) { ok = false; }
      if (!ok) { R = null; SV.run = null; persist(); showMenu(); return; }
      busy = false; disp = { money: null, chips: null, mult: null, hname: null, score: null };
      uiPhase = 'game'; stage.classList.remove('in-menu'); hideOv();
      if (R.ph === 'round' && R.forced && bossOn('bell')) SEL.add(R.forced);
      api.label('Best hand'); api.score(R.stats.bestHand || 0);
      renderBlinds(); fit(true); layout(true); hudUpdate();
      if (R.ph === 'cash' && R.cash) showCash(R.cash);
      else if (R.ph === 'win' || R.ph === 'over') { R = null; showMenu(); }
    }
    function menuAct(a) {
      snd('sel', 0);
      if (a === 'new') drawNR();
      else if (a === 'cont') resumeRun();
      else if (a === 'col') openCollection(0);
      else if (a === 'opt') openOptions();
      else if (a === 'help') openHelp();
      else if (a === 'menu') { hideOv(); if (R && R.ph !== 'over' && R.ph !== 'win') { } if (R && (R.ph === 'over' || R.ph === 'win')) { clearEntries(); R = null; } showMenu(); }
      else if (a === 'endless') { hideOv(); R.ph = 'shop'; uiPhase = 'game'; R.won = true; R.endless = true; enterShop(); flush(); renderBlinds(); layout(); hudUpdate(); persist(); banner('Endless Mode', 'Antes keep scaling. Good luck!', '#e8b83a'); }
    }

    on(ovl, 'click', e => {
      const m = e.target.closest('[data-m]'), n = e.target.closest('[data-n]'), c = e.target.closest('[data-c]');
      if (m) { menuAct(m.dataset.m); return; }
      if (c) { cashOutUI(); return; }
      if (n) {
        const v = n.dataset.n;
        if (v === 'dp') nrDeck(-1); else if (v === 'dn') nrDeck(1); else if (v === 'go') newRunGo();
        else if (v[0] === 's') { nr.stake = +v.slice(1); drawNR(); snd('tick'); }
      }
    });
    on(bslot, 'click', e => {
      const b = e.target.closest('[data-bp]');
      if (b) { const a = b.dataset.bp, i = +b.dataset.i; if (a === 'play') startBlind(i); else if (a === 'skip') skipBlind(i); else if (a === 'rboss') rerollBossUI(); return; }
      const t = e.target.closest('[data-tag]'); if (t) showTipHtml(tagTipHtml(t.dataset.tag), e.clientX, e.clientY);
      const bo = e.target.closest('[data-boss]'); if (bo) showTipHtml(bossTipHtml(bo.dataset.boss), e.clientX, e.clientY);
    });
    on(bslot, 'pointerover', e => { const t = e.target.closest('[data-tag]'); if (t && e.pointerType === 'mouse') showTipHtml(tagTipHtml(t.dataset.tag), e.clientX, e.clientY); });
    on(bslot, 'pointerout', e => { if (e.target.closest('[data-tag]')) hideTip(); });
    on(btnRow, 'click', e => { const b = e.target.closest('[data-b]'); if (!b || b.disabled) return; const a = b.dataset.b; if (a === 'play') playSel(); else if (a === 'disc') discardSel(); else if (a === 'sr') sortUI('rank'); else if (a === 'ss') sortUI('suit'); });
    on(shopBtns, 'click', e => { const b = e.target.closest('[data-b]'); if (!b || b.disabled) return; if (b.dataset.b === 'next') nextBlindUI(); else doReroll(); });
    on(packBtns, 'click', e => { const b = e.target.closest('[data-b]'); if (b && !b.disabled) skipPackUI(); });
    on(sel2, 'click', e => { const b = e.target.closest('[data-a]'); if (b && !b.disabled) actClick(b.dataset.a); });
    on(hud, 'click', e => {
      const b = e.target.closest('[data-h]'); if (!b) return;
      const h = b.dataset.h;
      if (h === 'info') openInfo(); else if (h === 'opt') openOptions(); else if (h === 'undo') showMenu();
    });
    on(deckEl, 'click', () => { if (R && (R.ph === 'round' || R.ph === 'cash')) openDeck(); });
    on(window, 'pointermove', e => { onMove(e); if (e.pointerType === 'mouse' && kbd && Math.abs(e.movementX) + Math.abs(e.movementY) > 2) { kbd = false; markCursor(); } });
    on(window, 'pointerup', onUp);
    on(window, 'pointercancel', onUp);
    on(window, 'keydown', onKey, true);
    on(stage, 'pointerdown', e => { if (!e.target.closest('.bc, .bl-act, .bl-modal, button')) { if (selEn) { selEn = null; hideAct(); hideTip(); layout(); } } });
    on(stage, 'contextmenu', e => e.preventDefault());

    const ro = window.ResizeObserver ? new ResizeObserver(() => { fit(false); rescale(); }) : null;
    if (ro) ro.observe(root);
    api.interval(() => { rescale(); }, 600);
    fit(true);
    showMenu();

    return {
      destroy() { try { if (R && !busy) persist(); } catch (e) { } try { if (ro) ro.disconnect(); } catch (e) { } try { if (AC.ctx) AC.ctx.close(); } catch (e) { } },
      T: { get R() { return R; }, E, SEL, newGame, startBlind, playSel, discardSel, cashOutUI, nextBlindUI, doBuy, doSell, doUse, doReroll, doOpen, doTake, doRedeem, skipBlind, skipPackUI, closePackUI, layout, flush, set busy(v) { busy = v; }, get busy() { return busy; }, resumeRun, showMenu, openCollection, openInfo, openDeck, openOptions, OPT, ST, nr, fit, evalHand, hv, HORD, CONSDEF, ser, deser }
    };
  }

  const CSS = `
.gm-balatro{gap:0;--bf:ui-monospace,"Cascadia Mono","SF Mono",Consolas,"Liberation Mono",monospace;--pa:#26343b;--pb:#33464f;--pk:#0d1316}
.gm-balatro [hidden]{display:none!important}
.gm-balatro button{font-family:var(--bf);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;color:inherit}
.gm-balatro button:disabled{cursor:default}
.gm-balatro .bl-wrap{position:relative;max-width:100%;margin:0 auto;overflow:hidden;border-radius:14px;background:#0b0f18;box-shadow:0 10px 30px rgba(0,0,0,.45);-webkit-user-select:none;user-select:none;touch-action:manipulation;font-family:var(--bf);color:#fff}
.gm-balatro .bl-shk{position:absolute;inset:0}
.gm-balatro .bl-stage{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;font-family:var(--bf)}
.gm-balatro .bl-bg{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;display:block}
.gm-balatro .bl-crt{position:absolute;inset:0;pointer-events:none;border-radius:14px;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px),radial-gradient(ellipse at center,transparent 58%,rgba(0,0,8,.6) 100%);z-index:50}
.gm-balatro .bl-nocrt .bl-crt{display:none}
.gm-balatro .bl-stage.in-menu .bl-cards,.gm-balatro .bl-stage.in-menu .bl-hud,.gm-balatro .bl-stage.in-menu .bl-zlab,.gm-balatro .bl-stage.in-menu .bl-deck,.gm-balatro .bl-stage.in-menu .bl-btns,.gm-balatro .bl-stage.in-menu .bl-slab{display:none!important}
.gm-balatro .hb{position:absolute;box-sizing:border-box;background:var(--pa);border:3px solid var(--pk);border-radius:9px;box-shadow:inset 0 0 0 2px var(--pb),0 4px 0 rgba(0,0,0,.45);text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;font-weight:900;overflow:hidden}
.gm-balatro .hb span{font-size:12px;color:#9fb3bd;letter-spacing:.03em}
.gm-balatro .hb b{font-size:24px;line-height:1.05;text-shadow:0 2px 0 rgba(0,0,0,.5)}
.gm-balatro .hb small{font-size:.55em;opacity:.7}
.gm-balatro .hb-blind{align-items:stretch;justify-content:flex-start;padding:0;border-color:var(--bc,#445)}
.gm-balatro .hb-top{display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bc,#445);color:#fff;border-bottom:3px solid var(--pk)}
.gm-balatro .hb-top canvas{width:34px;height:34px;image-rendering:pixelated;flex:none;animation:sway 3s ease-in-out infinite}
.gm-balatro .hb-top b{font-size:16px;text-align:left;text-shadow:0 2px 0 rgba(0,0,0,.55);line-height:1.1}
.gm-balatro .hb-sub{font-size:11px;color:#9fb3bd;margin-top:6px}
.gm-balatro .hb-tgt{font-size:25px;color:#ff6b5e;font-weight:900;text-shadow:0 2px 0 rgba(0,0,0,.55)}
.gm-balatro .hb-rew{font-size:15px;color:#f5b244;letter-spacing:.06em;padding-bottom:4px}
.gm-balatro .hb-rscore b{font-size:26px}
.gm-balatro .hb-mult{padding:4px 6px;gap:3px;justify-content:center}
.gm-balatro .hm-name{height:18px;font-size:14px;color:#fff;font-weight:900;line-height:18px;white-space:nowrap}
.gm-balatro .hm-name small{color:#9fb3bd;font-size:11px}
.gm-balatro .hm-row{display:flex;align-items:center;gap:5px;width:100%;justify-content:center}
.gm-balatro .hm-row i{font-style:normal;font-size:20px;color:#ff6b5e;font-weight:900}
.gm-balatro .hm-c,.gm-balatro .hm-m{flex:1;min-width:0;border-radius:7px;padding:6px 2px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.28)}
.gm-balatro .hm-c{background:#0089e8;text-align:right;padding-right:7px}
.gm-balatro .hm-m{background:#f0463a;text-align:left;padding-left:7px}
.gm-balatro .hm-c b,.gm-balatro .hm-m b{font-size:26px;display:block;transition:none}
.gm-balatro .hm-c.bump b,.gm-balatro .hm-m.bump b{animation:bump .3s ease-out}
.gm-balatro .hb-hands b{color:#4fb4ff}
.gm-balatro .hb-disc b{color:#ff6b5e}
.gm-balatro .hb-money b{color:#f5b244;font-size:30px}
.gm-balatro .hb-money.neg b{color:#ff6b5e}
.gm-balatro .hb-ante b,.gm-balatro .hb-round b{color:#ff9d3a;font-size:20px}
.gm-balatro .hb-tags{position:absolute;display:flex;gap:3px;flex-wrap:wrap;align-content:flex-start}
.gm-balatro .hb-tags .tg{width:28px;height:28px;cursor:help}
.gm-balatro .hb-tags .tg canvas{width:28px;height:28px;image-rendering:pixelated;animation:sway 2.8s ease-in-out infinite}
.gm-balatro .hbtn{position:absolute;box-sizing:border-box;border:3px solid var(--pk);border-radius:9px;background:#ff9d3a;color:#2a1700;font-weight:900;font-size:15px;box-shadow:0 4px 0 #a6560f,0 6px 0 rgba(0,0,0,.4);transition:transform .08s}
.gm-balatro .hbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #a6560f}
.gm-balatro .hbtn[data-h=opt]{background:#ff6b5e;box-shadow:0 4px 0 #a02a20,0 6px 0 rgba(0,0,0,.4);color:#fff}
.gm-balatro .hbtn[data-h=undo]{background:#4a5a68;box-shadow:0 4px 0 #26323a,0 6px 0 rgba(0,0,0,.4);color:#fff}
.gm-balatro .bl-port .hb{border-radius:7px;border-width:2px}
.gm-balatro .bl-port .hb b{font-size:19px}
.gm-balatro .bl-port .hb-blind{flex-direction:row;flex-wrap:wrap}
.gm-balatro .bl-port .hb-top{width:100%;padding:3px 6px;border-bottom-width:2px;box-sizing:border-box}
.gm-balatro .bl-port .hb-top canvas{width:24px;height:24px}
.gm-balatro .bl-port .hb-top b{font-size:13px}
.gm-balatro .bl-port .hb-sub{display:none}
.gm-balatro .bl-port .hb-tgt{font-size:20px;margin:3px auto 0}
.gm-balatro .bl-port .hb-rew{display:none}
.gm-balatro .bl-port .hb-rscore{flex-direction:row;gap:8px}
.gm-balatro .bl-port .hb-rscore span{font-size:10px;width:48px;text-align:left;line-height:1.1}
.gm-balatro .bl-port .hb-rscore b{font-size:22px}
.gm-balatro .bl-port .hb-mult{flex-direction:row;gap:6px;padding:3px 6px}
.gm-balatro .bl-port .hm-name{width:96px;white-space:normal;line-height:1.05;height:auto;font-size:12px;text-align:left}
.gm-balatro .bl-port .hm-row{flex:1}
.gm-balatro .bl-port .hm-c,.gm-balatro .bl-port .hm-m{padding:3px 2px}
.gm-balatro .bl-port .hm-c b,.gm-balatro .bl-port .hm-m b{font-size:21px}
.gm-balatro .bl-port .hb-hands,.gm-balatro .bl-port .hb-disc,.gm-balatro .bl-port .hb-money,.gm-balatro .bl-port .hb-ante{flex-direction:row;gap:5px}
.gm-balatro .bl-port .hb span{font-size:10px}
.gm-balatro .bl-port .hb-money b{font-size:19px}
.gm-balatro .bl-port .hbtn{font-size:13px;border-width:2px}
.gm-balatro .bl-zlab span{position:absolute;font-size:12px;font-weight:900;color:#c8d6dc;text-shadow:0 2px 0 rgba(0,0,0,.7);white-space:nowrap}
.gm-balatro .bl-zlab b{color:#fff}
.gm-balatro .bl-zlab i{position:absolute;box-sizing:border-box;border:2px dashed rgba(255,255,255,.16);background:rgba(0,0,0,.2);border-radius:12px;box-shadow:inset 0 0 20px rgba(0,0,0,.3)}
.gm-balatro .bl-slab span{position:absolute;width:100px;text-align:center;font-size:12px;font-weight:900;color:#f5d36a;text-shadow:0 2px 0 rgba(0,0,0,.7);letter-spacing:.06em;text-transform:uppercase}
.gm-balatro .bl-deck{position:absolute;width:71px;height:95px;cursor:pointer}
.gm-balatro .bl-deck canvas{position:absolute;left:0;top:0;width:71px;height:95px;image-rendering:pixelated}
.gm-balatro .bl-deck canvas:nth-child(1){transform:translate(-4px,4px);filter:brightness(.7)}
.gm-balatro .bl-deck canvas:nth-child(2){transform:translate(-2px,2px);filter:brightness(.85)}
.gm-balatro .bl-deck b{position:absolute;left:0;right:0;bottom:-20px;text-align:center;font-size:13px;color:#fff;text-shadow:0 2px 0 #000}
.gm-balatro .bl-cards{position:absolute;inset:0;pointer-events:none}
.gm-balatro .bc{position:absolute;left:0;top:0;width:71px;height:95px;transform-origin:50% 50%;transition:transform calc(.4s / var(--sp,1)) cubic-bezier(.3,1.45,.5,1),opacity .3s;pointer-events:auto;cursor:pointer;touch-action:none;will-change:transform}
.gm-balatro .bc.drag{cursor:grabbing}
.gm-balatro .bc-i{position:relative;width:71px;height:95px;transform:perspective(320px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .12s,scale .12s}
.gm-balatro .bc-i canvas{width:71px;height:95px;image-rendering:pixelated;display:block;position:relative}
.gm-balatro .bc:hover .bc-i{scale:1.06}
.gm-balatro .bc-sh{position:absolute;left:2px;top:5px;width:68px;height:92px;border-radius:6px;background:rgba(0,0,0,.38);transition:background .15s,box-shadow .15s}
.gm-balatro .bc.sel .bc-sh{background:rgba(255,224,110,.5);box-shadow:0 0 16px 5px rgba(255,214,90,.65)}
.gm-balatro .bc.cur .bc-sh{box-shadow:0 0 0 3px #7ad8ff,0 0 14px 4px rgba(122,216,255,.6)}
.gm-balatro .bc.tgt .bc-sh{box-shadow:0 0 0 2px #ff5a4a}
.gm-balatro .bc.drag .bc-sh{opacity:.55;transform:translate(8px,12px)}
.gm-balatro .bc-ov{position:absolute;left:0;top:0;width:71px;height:95px;pointer-events:none;border-radius:6px;overflow:hidden}
.gm-balatro .idle0{animation:sway 3.6s ease-in-out infinite}
.gm-balatro .idle1{animation:sway 4.3s ease-in-out -1.1s infinite}
.gm-balatro .idle2{animation:sway 3.1s ease-in-out -2.2s infinite}
.gm-balatro .idle3{animation:sway 4.8s ease-in-out -.6s infinite}
.gm-balatro .k-card .bc-i{animation-duration:6s!important}
.gm-balatro .bc-i.juice{animation:juice .42s ease-out}
@keyframes sway{0%,100%{rotate:-1.1deg;translate:0 0}50%{rotate:1.1deg;translate:0 -2px}}
@keyframes juice{0%{scale:1;rotate:0deg}25%{scale:1.2;rotate:-6deg}55%{scale:1.1;rotate:5deg}100%{scale:1;rotate:0deg}}
@keyframes bump{0%{transform:scale(1)}35%{transform:scale(1.28)}100%{transform:scale(1)}}
@keyframes shine{0%{background-position:150% 0}100%{background-position:-50% 0}}
@keyframes rainbow{0%{background-position:0 0}100%{background-position:200% 0}}
.gm-balatro .ed-foil canvas{filter:saturate(1.2) brightness(1.06) contrast(1.05)}
.gm-balatro .ed-foil .bc-ov{background:linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(130,205,255,.62) 46%,rgba(255,255,255,0) 62%),linear-gradient(0deg,rgba(100,170,255,.18),rgba(100,170,255,.18));background-size:260% 100%,100% 100%;animation:shine 2.8s linear infinite;mix-blend-mode:screen}
.gm-balatro .ed-holo canvas{filter:saturate(1.25)}
.gm-balatro .ed-holo .bc-ov{background:linear-gradient(115deg,rgba(255,255,255,0) 28%,rgba(255,80,190,.6) 46%,rgba(255,255,255,0) 66%),linear-gradient(0deg,rgba(255,60,170,.16),rgba(255,60,170,.16));background-size:260% 100%,100% 100%;animation:shine 3.2s linear infinite;mix-blend-mode:screen}
.gm-balatro .ed-poly canvas{filter:saturate(1.25) brightness(1.04)}
.gm-balatro .ed-poly .bc-ov{background:linear-gradient(105deg,#ff6b6b,#ffd36b,#6bff95,#6bd0ff,#b06bff,#ff6b6b,#ffd36b);background-size:300% 100%;opacity:.42;animation:rainbow 3.4s linear infinite;mix-blend-mode:color-dodge}
.gm-balatro .ed-neg canvas{filter:invert(1) hue-rotate(180deg) saturate(1.3) brightness(.92)}
.gm-balatro .ed-neg .bc-ov{background:radial-gradient(circle at 50% 40%,rgba(150,190,255,.25),rgba(40,40,120,.2));mix-blend-mode:screen}
.gm-balatro .dbf canvas{filter:grayscale(1) brightness(.5)}
.gm-balatro .dbf .bc-ov{background:repeating-linear-gradient(135deg,transparent 0 7px,rgba(255,60,60,.32) 7px 10px)}
.gm-balatro .bc-stk{position:absolute;left:2px;bottom:2px;display:flex;flex-direction:column;gap:1px;pointer-events:none}
.gm-balatro .bc-stk i{font-style:normal;font-size:8px;font-weight:900;padding:1px 3px;border-radius:3px;border:1px solid #111}
.gm-balatro .s-e{background:#ff9d3a;color:#2a1700}.gm-balatro .s-p{background:#8a8a99;color:#fff}.gm-balatro .s-r{background:#b44ad6;color:#fff}
.gm-balatro .bc-pr{position:absolute;left:50%;top:100%;margin-top:3px;transform:translateX(-50%);background:#232a31;border:2px solid #f5b244;color:#f5d36a;border-radius:9px;padding:0 9px;font-size:15px;line-height:20px;font-weight:900;white-space:nowrap;box-shadow:0 3px 0 rgba(0,0,0,.5)}
.gm-balatro .bc-pr.poor{color:#ff8a7a;border-color:#8a4a42}
.gm-balatro .bc.melt{animation:melt .7s ease-in forwards}
.gm-balatro .bc.dissolve{animation:dissolve .7s ease-out forwards}
@keyframes melt{0%{filter:none}100%{filter:hue-rotate(60deg) brightness(1.4);opacity:0;margin-top:50px;clip-path:inset(0 0 100% 0)}}
@keyframes dissolve{0%{filter:none;opacity:1}30%{filter:brightness(2.4) saturate(0)}100%{filter:brightness(3);opacity:0;scale:1.3;translate:0 -30px}}
.gm-balatro .bc-sd{position:absolute;left:0;top:0;width:71px;height:95px;pointer-events:none}
.gm-balatro .bc-sd canvas{width:71px;height:95px;image-rendering:pixelated}
.gm-balatro .bl-pops{position:absolute;inset:0;pointer-events:none;z-index:60}
.gm-balatro .bl-pop{position:absolute;transform:translate(-50%,-100%);font-weight:900;font-size:20px;padding:1px 9px;border-radius:7px;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.55);animation:popup calc(1s / var(--sp,1)) ease-out forwards;white-space:nowrap;border:2px solid rgba(0,0,0,.65);box-shadow:0 3px 0 rgba(0,0,0,.4)}
.gm-balatro .bl-pop.chip{background:#0089e8}.gm-balatro .bl-pop.mult{background:#f0463a}
.gm-balatro .bl-pop.xmult{background:#f0463a;font-size:26px;border-color:#fff3;box-shadow:0 0 14px #ff4a3a,0 3px 0 rgba(0,0,0,.4)}
.gm-balatro .bl-pop.cash{background:#f5b244;color:#2a1700;text-shadow:none}
.gm-balatro .bl-pop.msg{background:#4a5a68;font-size:16px}
.gm-balatro .bl-pop.tot{background:#ffe45a;color:#2a1700;font-size:34px;text-shadow:none;animation-duration:1.4s}
@keyframes popup{0%{opacity:0;margin-top:14px;scale:.6}12%{opacity:1;margin-top:0;scale:1.18}22%{scale:1}75%{opacity:1}100%{opacity:0;margin-top:-34px}}
.gm-balatro .bl-tip{position:absolute;display:none;width:210px;z-index:80;background:#1c262b;border:3px solid #0d1316;border-radius:10px;box-shadow:inset 0 0 0 2px #3f5560,0 6px 0 rgba(0,0,0,.45);padding:8px 10px;pointer-events:none;text-align:left}
.gm-balatro .bl-tip b{display:block;font-size:16px;font-weight:900;color:#fff;margin-bottom:3px}
.gm-balatro .bl-tip i{display:block;font-style:normal;font-size:12.5px;line-height:1.3;color:#d3e0e5;margin-bottom:3px}
.gm-balatro .bl-tip u{display:block;text-decoration:none;font-size:12px;font-weight:900;color:#ffd36b;margin-top:4px}
.gm-balatro .bl-tip s{display:block;text-decoration:none;font-size:12px;color:#f5b244;font-weight:900;margin-top:4px}
.gm-balatro .bl-tip em.rar{display:inline-block;font-style:normal;font-size:10px;font-weight:900;border-radius:5px;padding:1px 7px;margin-bottom:5px;background:#556;color:#fff;text-transform:uppercase}
.gm-balatro .rar.r1{background:#4a78c8}.gm-balatro .rar.r2{background:#2e9c56}.gm-balatro .rar.r3{background:#d8483a}.gm-balatro .rar.r4{background:#a050e0}
.gm-balatro .rar.t-tarot{background:#8a4ad0}.gm-balatro .rar.t-planet{background:#2e78d8}.gm-balatro .rar.t-spectral{background:#3a9ab8}.gm-balatro .rar.vch{background:#c8a030;color:#2a1c00}.gm-balatro .rar.pk{background:#c8603a}.gm-balatro .rar.tg{background:#4a9a9a}.gm-balatro .rar.bs{background:#8a2a4a}
.gm-balatro u.ed-foil{color:#8fd0ff}.gm-balatro u.ed-holo{color:#ff7ad0}.gm-balatro u.ed-poly{color:#c9a0ff}.gm-balatro u.ed-neg{color:#b0b0ff}.gm-balatro u.dbf{color:#ff7a6a}.gm-balatro u.stk-e{color:#ff9d3a}.gm-balatro u.stk-p{color:#b0b0c0}.gm-balatro u.stk-r{color:#d890f0}
.gm-balatro u.sl-gold{color:#f6c445}.gm-balatro u.sl-red{color:#ff6a5a}.gm-balatro u.sl-blue{color:#5aa0ff}.gm-balatro u.sl-purple{color:#c070f0}
.gm-balatro .bl-btns{position:absolute;display:flex;gap:10px;justify-content:center;align-items:stretch;height:44px;z-index:30}
.gm-balatro .bbtn{position:relative;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:0;min-width:64px;height:44px;padding:0 14px;border:3px solid var(--pk);border-radius:10px;font-weight:900;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.45);background:#4a5a68;box-shadow:0 5px 0 #26323a,0 7px 0 rgba(0,0,0,.4);transition:transform .08s,box-shadow .08s,filter .15s}
.gm-balatro .bbtn b{font-size:17px;line-height:1.1}
.gm-balatro .bbtn span{font-size:12px;opacity:.9}
.gm-balatro .bbtn kbd{position:absolute;right:5px;top:-2px;font:900 9px var(--bf);opacity:.7;background:none;border:0;padding:0;color:#fff}
.gm-balatro .bbtn:hover:not(:disabled){filter:brightness(1.12)}
.gm-balatro .bbtn:active:not(:disabled){transform:translateY(4px);box-shadow:0 1px 0 #26323a}
.gm-balatro .bbtn:disabled{filter:grayscale(.85) brightness(.6);box-shadow:0 2px 0 #1a2228;transform:translateY(3px)}
.gm-balatro .bbtn.play,.gm-balatro .bbtn.next{background:#0f94e8;box-shadow:0 5px 0 #0a5a96,0 7px 0 rgba(0,0,0,.4);flex:1.3}
.gm-balatro .bbtn.disc,.gm-balatro .bbtn.rr{background:#f0463a;box-shadow:0 5px 0 #9a261c,0 7px 0 rgba(0,0,0,.4);flex:1.3}
.gm-balatro .bbtn.rr{background:#3aa86a;box-shadow:0 5px 0 #1e6a40,0 7px 0 rgba(0,0,0,.4)}
.gm-balatro .bbtn.sm{flex:.6;min-width:54px;font-size:14px;background:#ff9d3a;color:#2a1700;text-shadow:none;box-shadow:0 5px 0 #a6560f,0 7px 0 rgba(0,0,0,.4);padding:0 8px}
.gm-balatro .bbtn.sm.on{background:#ffd36b}
.gm-balatro .bl-shopb .bbtn.next{background:#f0a02a;box-shadow:0 5px 0 #a0640f,0 7px 0 rgba(0,0,0,.4)}
.gm-balatro .bl-note{position:absolute;left:50%;bottom:6px;transform:translateX(-50%) translateY(10px);background:rgba(10,14,18,.88);border:2px solid #3f5560;border-radius:8px;padding:5px 14px;font-weight:900;font-size:13px;opacity:0;transition:.25s;pointer-events:none;z-index:70;white-space:nowrap;max-width:96%;overflow:hidden;text-overflow:ellipsis}
.gm-balatro .bl-note.on{opacity:1;transform:translateX(-50%)}
.gm-balatro .bl-act{position:absolute;display:none;gap:6px;z-index:75}
.gm-balatro .bl-act button{height:34px;padding:0 12px;border:3px solid var(--pk);border-radius:9px;background:#ff9d3a;color:#2a1700;font-weight:900;font-size:14px;box-shadow:0 4px 0 #a6560f,0 6px 0 rgba(0,0,0,.4);white-space:nowrap}
.gm-balatro .bl-act button[data-a=sell]{background:#f5b244}
.gm-balatro .bl-act button[data-a=use],.gm-balatro .bl-act button[data-a=take]{background:#0f94e8;color:#fff;box-shadow:0 4px 0 #0a5a96,0 6px 0 rgba(0,0,0,.4)}
.gm-balatro .bl-act button[data-a=buy],.gm-balatro .bl-act button[data-a=redeem],.gm-balatro .bl-act button[data-a=open],.gm-balatro .bl-act button[data-a=buyuse]{background:#3aa86a;color:#fff;box-shadow:0 4px 0 #1e6a40,0 6px 0 rgba(0,0,0,.4)}
.gm-balatro .bl-act button:disabled{filter:grayscale(1) brightness(.55)}
.gm-balatro .bl-fl{position:absolute;inset:0;pointer-events:none;transition:opacity .45s;z-index:55}
.gm-balatro .bl-bnr{position:absolute;left:0;right:0;top:36%;text-align:center;z-index:65;pointer-events:none;background:linear-gradient(90deg,transparent,var(--bc,#445) 18%,var(--bc,#445) 82%,transparent);padding:10px 0;animation:bnr .35s cubic-bezier(.3,1.5,.5,1)}
.gm-balatro .bl-bnr.out{opacity:0;transition:opacity .45s}
.gm-balatro .bl-bnr b{display:block;font-size:30px;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.6)}
.gm-balatro .bl-bnr i{display:block;font-style:normal;font-size:14px;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.6);padding:0 16px}
@keyframes bnr{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
.gm-balatro .bl-blinds{position:absolute;display:none;gap:16px;justify-content:center;align-items:flex-start;padding:10px 6px 0;box-sizing:border-box;z-index:25}
.gm-balatro .bp{flex:1;max-width:244px;display:flex;flex-direction:column;background:var(--pa);border:3px solid var(--pk);border-radius:12px;box-shadow:inset 0 0 0 2px var(--pb),0 6px 0 rgba(0,0,0,.45);transition:transform .35s cubic-bezier(.3,1.5,.5,1),opacity .3s,filter .3s;overflow:hidden;min-height:0}
.gm-balatro .bp.s-sel{transform:translateY(-10px);border-color:var(--bc);box-shadow:inset 0 0 0 2px var(--pb),0 0 20px var(--bc),0 6px 0 rgba(0,0,0,.45)}
.gm-balatro .bp.s-up{opacity:.82}
.gm-balatro .bp.s-done,.gm-balatro .bp.s-skip{filter:grayscale(.7) brightness(.65)}
.gm-balatro .bp-h{background:var(--bc);padding:7px 10px;text-align:center;border-bottom:3px solid var(--pk)}
.gm-balatro .bp-h b{font-size:18px;text-shadow:0 2px 0 rgba(0,0,0,.55)}
.gm-balatro .bp-b{flex:1;padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}
.gm-balatro .bp-tok{width:60px;height:60px;image-rendering:pixelated;animation:sway 3s ease-in-out infinite}
.gm-balatro .bp-t span{display:block;font-size:11px;color:#9fb3bd}
.gm-balatro .bp-t b{font-size:26px;color:#ff6b5e;text-shadow:0 2px 0 rgba(0,0,0,.55)}
.gm-balatro .bp-r{font-size:12px;color:#9fb3bd}
.gm-balatro .bp-r b{color:#f5b244;font-size:15px;letter-spacing:.08em}
.gm-balatro .bp-d{font-size:12px;line-height:1.3;color:#fff;background:#10181c;border:2px solid var(--bc);border-radius:7px;padding:5px 7px;cursor:help}
.gm-balatro .bp-tag{display:flex;align-items:center;gap:6px;font-size:11px;color:#d3e0e5;background:#10181c;border-radius:7px;padding:4px 7px;cursor:help;font-weight:900}
.gm-balatro .bp-tag canvas{width:26px;height:26px;image-rendering:pixelated}
.gm-balatro .bp-f{padding:6px 10px 12px;display:flex;flex-direction:column;gap:9px}
.gm-balatro .bp-f .bbtn{width:100%;flex:none}
.gm-balatro .bp-st{text-align:center;font-weight:900;font-size:15px;padding:8px 0;color:#9fb3bd}
.gm-balatro .bp-st.ok{color:#6fcf86}.gm-balatro .bp-st.dim{opacity:.6}
.gm-balatro .bl-blinds.port{flex-direction:column;gap:6px;padding:4px 2px 0;align-items:stretch}
.gm-balatro .bl-blinds.port .bp{flex:none;max-width:none;flex-direction:row;height:112px;transform:none}
.gm-balatro .bl-blinds.port .bp.s-sel{transform:translateX(-6px)}
.gm-balatro .bl-blinds.port .bp-h{width:84px;display:flex;align-items:center;justify-content:center;border-bottom:0;border-right:3px solid var(--pk);padding:4px}
.gm-balatro .bl-blinds.port .bp-h b{font-size:13px}
.gm-balatro .bl-blinds.port .bp-b{flex-direction:row;flex-wrap:wrap;align-content:center;justify-content:flex-start;gap:3px 8px;padding:4px 8px;text-align:left}
.gm-balatro .bl-blinds.port .bp-tok{width:34px;height:34px}
.gm-balatro .bl-blinds.port .bp-t b{font-size:18px}
.gm-balatro .bl-blinds.port .bp-d{font-size:10px;padding:2px 5px;flex-basis:100%}
.gm-balatro .bl-blinds.port .bp-tag{padding:2px 5px;font-size:10px}
.gm-balatro .bl-blinds.port .bp-r{font-size:10px}
.gm-balatro .bl-blinds.port .bp-f{width:112px;justify-content:center;padding:4px 6px;gap:6px}
.gm-balatro .bl-blinds.port .bp-f .bbtn{height:34px;min-width:0;padding:0 4px}
.gm-balatro .bl-blinds.port .bp-f .bbtn b{font-size:13px}
.gm-balatro .bl-blinds.port .bp-f .bbtn kbd{display:none}
.gm-balatro .bl-ov{position:absolute;inset:0;display:none;z-index:45}
.gm-balatro .bl-ov.show{display:flex;align-items:center;justify-content:center}
.gm-balatro .bl-ov.cashov{background:rgba(5,8,12,.55)}
.gm-balatro .bl-ov.overov{background:rgba(5,8,12,.72)}
.gm-balatro .bl-ov.menuov{background:radial-gradient(ellipse at center,rgba(8,10,28,.35),rgba(4,5,16,.78))}
.gm-balatro .bl-cash{width:min(330px,88%);background:var(--pa);border:3px solid var(--pk);border-radius:14px;box-shadow:inset 0 0 0 2px var(--pb),0 8px 0 rgba(0,0,0,.5);padding:14px 18px 16px;animation:bnr .3s cubic-bezier(.3,1.5,.5,1)}
.gm-balatro .bl-cash h3{margin:0 0 8px;text-align:center;font-size:22px;color:#6fcf86;text-shadow:0 2px 0 rgba(0,0,0,.5)}
.gm-balatro .cl-r{display:flex;justify-content:space-between;gap:10px;font-size:14px;font-weight:900;padding:5px 0;border-bottom:2px dashed #3f5560;transition:opacity .2s}
.gm-balatro .cl-r b{color:#f5b244}.gm-balatro .cl-r b.neg{color:#ff6b5e}
.gm-balatro .cl-tot{display:flex;justify-content:space-between;align-items:center;margin:10px 0 12px;font-size:16px;font-weight:900}
.gm-balatro .cl-tot b{font-size:30px;color:#f5b244}
.gm-balatro .bl-cash .bbtn{width:100%}
.gm-balatro .m-menu{display:flex;flex-direction:column;align-items:center;gap:12px;width:min(420px,92%);max-height:100%}
.gm-balatro .m-deco{display:flex;gap:6px;margin-bottom:-4px}
.gm-balatro .md-j{width:50px;height:67px;animation:sway 3s ease-in-out calc(var(--i)*-.6s) infinite}
.gm-balatro .md-j canvas{width:50px;height:67px;image-rendering:pixelated;display:block}
.gm-balatro .m-logo{text-align:center;line-height:1}
.gm-balatro .m-logo span{display:block;font-size:64px;font-weight:900;letter-spacing:.06em;color:#ff5a4a;text-shadow:0 4px 0 #8a1a10,0 8px 0 #1a0604,0 0 24px rgba(255,90,70,.6);animation:logo 3.2s ease-in-out infinite}
.gm-balatro .m-logo small{display:block;margin-top:6px;font-size:13px;color:#cfe0ff;letter-spacing:.25em;text-transform:uppercase}
@keyframes logo{0%,100%{transform:rotate(-1.2deg) scale(1)}50%{transform:rotate(1.2deg) scale(1.03)}}
.gm-balatro .m-btns{display:flex;flex-direction:column;gap:9px;width:min(280px,100%)}
.gm-balatro .mb{display:flex;flex-direction:column;align-items:center;justify-content:center;height:46px;border:3px solid var(--pk);border-radius:10px;background:#4a5a68;color:#fff;font-size:17px;font-weight:900;text-shadow:0 2px 0 rgba(0,0,0,.45);box-shadow:0 5px 0 #26323a,0 7px 0 rgba(0,0,0,.4);transition:transform .08s,filter .15s}
.gm-balatro .mb small{font-size:11px;font-weight:700;opacity:.85}
.gm-balatro .mb.big{background:#0f94e8;box-shadow:0 5px 0 #0a5a96,0 7px 0 rgba(0,0,0,.4);height:54px}
.gm-balatro .mb:hover{filter:brightness(1.12)}
.gm-balatro .mb:active{transform:translateY(4px);box-shadow:0 1px 0 #26323a}
.gm-balatro .mb.sm{width:44px;height:64px;font-size:22px;flex:none}
.gm-balatro .m-st{font-size:12px;color:#c0d0e0;text-shadow:0 2px 0 rgba(0,0,0,.6);text-align:center}
.gm-balatro .nr{display:flex;flex-direction:column;align-items:center;gap:8px;width:min(470px,94%)}
.gm-balatro .nr h2{margin:0;font-size:26px;text-shadow:0 3px 0 rgba(0,0,0,.6)}
.gm-balatro .nr-deck{display:flex;align-items:center;gap:14px}
.gm-balatro .nr-cv{width:106px;height:142px;image-rendering:pixelated;display:block;animation:sway 3.4s ease-in-out infinite;filter:drop-shadow(0 6px 0 rgba(0,0,0,.45))}
.gm-balatro .nr-dt{text-align:center;max-width:100%}
.gm-balatro .nr-dt b{display:block;font-size:19px;color:#ffd36b}
.gm-balatro .nr-dt span{display:block;font-size:13px;color:#e0ecf0;line-height:1.3;min-height:34px;text-shadow:0 2px 0 rgba(0,0,0,.6)}
.gm-balatro .nr-stk{display:flex;gap:6px}
.gm-balatro .nr-stk button{width:40px;height:44px;border:3px solid var(--pk);border-radius:9px;background:#26343b;font-weight:900;font-size:15px;color:#9fb3bd;position:relative;box-shadow:0 4px 0 rgba(0,0,0,.5)}
.gm-balatro .nr-stk button i{position:absolute;left:50%;top:5px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--sc);border:2px solid #0d1316}
.gm-balatro .nr-stk button span{position:absolute;left:0;right:0;bottom:3px}
.gm-balatro .nr-stk button.inc{background:#33464f;color:#d0e0e6}
.gm-balatro .nr-stk button.on{background:var(--sc);color:#111;border-color:#fff;transform:translateY(-3px)}
.gm-balatro .nr-stk button.on span{color:#111}
.gm-balatro .nr-sd{margin:0;text-align:center;font-size:13px;line-height:1.35;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.6)}
.gm-balatro .nr-sd small{display:block;color:#9fb3bd;font-size:11px}
.gm-balatro .nr-seed{font-size:13px;font-weight:900;display:flex;align-items:center;gap:8px}
.gm-balatro .nr-seed input{width:130px;height:30px;background:#10181c;border:2px solid #3f5560;border-radius:7px;color:#fff;font:900 14px var(--bf);padding:0 8px;text-transform:uppercase}
.gm-balatro .nr-b{display:flex;gap:12px;width:min(340px,100%)}
.gm-balatro .nr-b .bbtn{flex:1}
.gm-balatro .ov-card{width:min(400px,92%);background:var(--pa);border:3px solid var(--pk);border-radius:14px;box-shadow:inset 0 0 0 2px var(--pb),0 8px 0 rgba(0,0,0,.5);padding:16px 18px;text-align:center;animation:bnr .35s cubic-bezier(.3,1.5,.5,1);max-height:96%;overflow:auto}
.gm-balatro .ov-card h2{margin:0 0 4px;font-size:34px;text-shadow:0 3px 0 rgba(0,0,0,.55)}
.gm-balatro .ov-card.lose h2{color:#ff5a4a}.gm-balatro .ov-card.win h2{color:#ffd36b}
.gm-balatro .ov-card p{margin:0 0 10px;font-size:14px;color:#d3e0e5}
.gm-balatro .ov-card p small{color:#9fb3bd}
.gm-balatro .ov-st{display:grid;grid-template-columns:1fr 1fr;gap:5px 10px;margin-bottom:12px;text-align:left}
.gm-balatro .ov-st div{display:flex;justify-content:space-between;gap:6px;font-size:12px;background:#10181c;border-radius:6px;padding:4px 8px}
.gm-balatro .ov-st span{color:#9fb3bd}.gm-balatro .ov-st b{color:#fff;text-align:right;overflow:hidden;text-overflow:ellipsis}
.gm-balatro .ov-b{display:flex;gap:10px;flex-wrap:wrap}
.gm-balatro .ov-b .bbtn{flex:1;min-width:110px}
.gm-balatro .bl-modal{position:absolute;inset:0;background:rgba(4,6,10,.7);z-index:85;display:flex;align-items:center;justify-content:center}
.gm-balatro .md-c{width:min(640px,94%);max-height:92%;display:flex;flex-direction:column;background:var(--pa);border:3px solid var(--pk);border-radius:14px;box-shadow:inset 0 0 0 2px var(--pb),0 8px 0 rgba(0,0,0,.5);overflow:hidden}
.gm-balatro .md-h{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#10181c;border-bottom:3px solid var(--pk)}
.gm-balatro .md-h h3{margin:0;font-size:19px;color:#ffd36b}
.gm-balatro .md-h h3 small{color:#9fb3bd;font-size:12px}
.gm-balatro .md-x{width:34px;height:34px;border:3px solid var(--pk);border-radius:9px;background:#f0463a;color:#fff;font-weight:900;font-size:15px;box-shadow:0 3px 0 #9a261c}
.gm-balatro .md-b{padding:10px 12px;overflow:auto;display:flex;flex-direction:column;gap:8px}
.gm-balatro .md-t{display:flex;gap:5px;flex-wrap:wrap}
.gm-balatro .md-t button{height:30px;padding:0 11px;border:2px solid #0d1316;border-radius:8px;background:#33464f;color:#c8d6dc;font-weight:900;font-size:12px}
.gm-balatro .md-t button.on{background:#ff9d3a;color:#2a1700}
.gm-balatro .md-tab{width:100%;border-collapse:collapse;font-size:13px}
.gm-balatro .md-tab th{color:#9fb3bd;text-align:left;font-size:11px;padding:3px 6px}
.gm-balatro .md-tab td{padding:5px 6px;border-top:2px solid #33464f;font-weight:900}
.gm-balatro .md-tab td.c{color:#4fb4ff}.gm-balatro .md-tab td.m{color:#ff6b5e}
.gm-balatro .md-r{display:grid;grid-template-columns:1fr auto;gap:2px 10px;background:#10181c;border-radius:8px;padding:7px 10px;font-size:12px}
.gm-balatro .md-r b{color:#fff;font-size:14px}.gm-balatro .md-r span{color:#ff6b5e;font-weight:900;text-align:right}
.gm-balatro .md-r i{font-style:normal;color:#c8d6dc;grid-column:1/-1}.gm-balatro .md-r em{font-style:normal;color:#9fb3bd;grid-column:1/-1}
.gm-balatro .md-note{margin:0;font-size:12px;color:#c0d0d8;line-height:1.4}
.gm-balatro .md-h2 p{font-size:13px;line-height:1.5;color:#d8e4e8;margin:0 0 10px}
.gm-balatro .md-h2 .c{color:#4fb4ff}.gm-balatro .md-h2 .m{color:#ff6b5e}
.gm-balatro .md-dk{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px}
.gm-balatro .dk-c canvas{width:100%;height:auto;aspect-ratio:71/95;image-rendering:pixelated;display:block;cursor:help}
.gm-balatro .dk-c.used canvas{opacity:.28}
.gm-balatro .cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:10px 8px}
.gm-balatro .cg-h{grid-column:1/-1}
.gm-balatro .cg-i{text-align:center;cursor:help}
.gm-balatro .cg-i canvas{width:71px;height:95px;image-rendering:pixelated;display:block;margin:0 auto}
.gm-balatro .cg-i span{display:block;font-size:10px;font-weight:900;color:#c8d6dc;margin-top:3px;line-height:1.15}
.gm-balatro .cg-i.dim canvas{filter:grayscale(1) brightness(.5)}
.gm-balatro .op{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:2px solid #33464f;font-size:14px;font-weight:900}
.gm-balatro .op div{display:flex;gap:5px}
.gm-balatro .op button{height:32px;min-width:52px;padding:0 10px;border:2px solid #0d1316;border-radius:8px;background:#33464f;color:#c8d6dc;font-weight:900;font-size:13px}
.gm-balatro .op button.on{background:#3aa86a;color:#fff}
.gm-balatro .md-ob{display:flex;gap:10px;padding:0 12px 12px}
.gm-balatro .md-ob .bbtn{flex:1}
@media (prefers-reduced-motion:reduce){.gm-balatro .bc-i,.gm-balatro .m-logo span,.gm-balatro .hb-top canvas,.gm-balatro .bp-tok,.gm-balatro .md-j,.gm-balatro .nr-cv{animation:none!important}}
`;

  const HELP = '<kbd>Click</kbd> / tap cards to select, drag to reorder · <kbd>Space</kbd> select · <kbd>Enter</kbd> play hand · <kbd>D</kbd> discard · <kbd>R</kbd>/<kbd>T</kbd> sort · <kbd>1</kbd>-<kbd>9</kbd> pick cards · <kbd>U</kbd> use · <kbd>S</kbd> sell · <kbd>N</kbd> next round · <kbd>G</kbd> reroll · <kbd>I</kbd> run info · <kbd>V</kbd> deck';

  Ameplay.register({
    id: 'balatro',
    title: 'Balatro',
    category: 'Strategy',
    tint: '#c23a3a',
    blurb: 'A poker roguelike: play hands for chips and mult, build a joker engine, beat eight antes of blinds and bosses, then keep going in endless mode.',
    help: HELP,
    better: 'high',
    width: 1000,
    format: v => v >= 1e11 ? fmtN(v) : Math.round(v).toLocaleString('en-US'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="14" width="24" height="34" rx="4" transform="rotate(-12 21 31)"/><rect x="26" y="10" width="24" height="34" rx="4" transform="rotate(9 38 27)"/><circle cx="38" cy="22" r="5"/><path d="M33 17l3 2M43 17l-3 2M34 33q4 3 8 0"/><path d="M14 54h36" /></svg>',
    css: CSS,
    _t: { get R() { return R; }, newRun, deser, ser, playHand, discardCards, roundEnd, cashOut, enterShop, nextBlind, buyItem, buyPack, buyVoucher, openPack, packPick, closePack, skipPack, reroll, useConsumable, canUse, sellItem, setBlindAction, rerollBoss, beginRound, evalHand, scoreHand, hv, JK, JL, TK, TL, SK, SL, VK, VL, BK, BL, TGK, TGL, PLK, HAND, HORD, DECKS, DK, STAKES, mkJoker, addJoker, addCons, killJoker, newCard, addToDeck, destroyCards, giveTag, levelHand, CONSDEF, rollJoker, rollCons, sortHand, genBlinds, blindTarget, hmax, dmax, hsz, jslots, cslots, jfree, cfree, sellVal, rnd, rint, redeem, drawToFull, bossOn, deb, fire, call, gameOver, anteBase, pickBoss, shopItem, rollPack, canAfford },
    mount(root, api) { return mountGame(root, api); }
  });

  Ameplay.covers.balatro = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bac-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2a5e"/><stop offset=".55" stop-color="#8a2a4a"/><stop offset="1" stop-color="#2a1030"/></linearGradient><radialGradient id="bac-r" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#ff6a50" stop-opacity=".55"/><stop offset="1" stop-color="#ff6a50" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#bac-g)"/><rect width="400" height="300" fill="url(#bac-r)"/><g opacity=".18" fill="#fff"><circle cx="40" cy="50" r="2"/><circle cx="350" cy="70" r="2"/><circle cx="320" cy="250" r="2"/><circle cx="70" cy="240" r="2"/><circle cx="200" cy="30" r="2"/></g><g transform="translate(110 150) rotate(-18)"><rect x="-38" y="-52" width="76" height="104" rx="7" fill="#f4f0e6" stroke="#20242c" stroke-width="4"/><text x="-28" y="-26" font-family="monospace" font-weight="900" font-size="24" fill="#e0453a">A</text><path d="M0-4c-8-14-26-4-14 10l14 14 14-14c12-14-6-24-14-10z" fill="#e0453a" transform="translate(0 4) scale(1.1)"/></g><g transform="translate(290 150) rotate(16)"><rect x="-38" y="-52" width="76" height="104" rx="7" fill="#f4f0e6" stroke="#20242c" stroke-width="4"/><text x="-28" y="-26" font-family="monospace" font-weight="900" font-size="24" fill="#38466a">K</text><path d="M0-20l9 18-9 6-9-6zM-12 6h24v18h-24z" fill="#38466a"/></g><g transform="translate(200 135)"><rect x="-42" y="-58" width="84" height="116" rx="8" fill="#3b2d6e" stroke="#20242c" stroke-width="4"/><rect x="-37" y="-53" width="74" height="106" rx="5" fill="#6a4fd6"/><circle cx="0" cy="6" r="21" fill="#f2c14e" stroke="#1c1f2a" stroke-width="4"/><rect x="-11" y="-2" width="6" height="8" fill="#1c1f2a"/><rect x="5" y="-2" width="6" height="8" fill="#1c1f2a"/><path d="M-10 14q10 8 20 0" stroke="#1c1f2a" stroke-width="3" fill="none"/><path d="M-24-22l8 12 8-14 8 14 8-12 8 14v8h-40z" fill="#e8574a" stroke="#1c1f2a" stroke-width="3"/><circle cx="-24" cy="-24" r="4" fill="#ffe45a"/><circle cx="24" cy="-24" r="4" fill="#ffe45a"/></g><g font-family="monospace" font-weight="900"><rect x="96" y="238" width="86" height="36" rx="7" fill="#0089e8" stroke="#0d1316" stroke-width="3"/><text x="139" y="264" font-size="22" fill="#fff" text-anchor="middle">210</text><text x="200" y="264" font-size="24" fill="#ff6b5e" text-anchor="middle">X</text><rect x="218" y="238" width="86" height="36" rx="7" fill="#f0463a" stroke="#0d1316" stroke-width="3"/><text x="261" y="264" font-size="22" fill="#fff" text-anchor="middle">36</text></g></svg>`;
})();
