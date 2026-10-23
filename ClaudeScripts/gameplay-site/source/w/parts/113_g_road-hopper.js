
(() => {
  'use strict';
  const ID = 'road-hopper';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const pick = a => a[(Math.random() * a.length) | 0];
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const angTo = (a, b, k) => a + ((((b - a + Math.PI) % TAU) + TAU) % TAU - Math.PI) * k;
  const COARSE = matchMedia('(pointer: coarse)').matches;

  const CFG = {
    cols: 4, half: 15, loop: 36, step: 1 / 120,
    hopTime: 0.12, hopArc: 0.42, swipe: 20,
    eagleIdle: 4.6, backLimit: 3, camCreep: 0.36, camAhead: 1.9,
    rampRows: 220,
    car: [1.7, 3.4, 3.4], truck: [1.3, 2.2, 1.8], log: [0.9, 1.8, 1.1], fastLane: 1.7,
    trainSpeed: 36, trainWarn: 1.5, trainGap: [2.5, 7.5],
    coinChance: 0.15, prizeCost: 100, giftEvery: 300, gift: [20, 45]
  };

  const FONT = {
    A: '01110,10001,11111,10001,10001', B: '11110,10001,11110,10001,11110', C: '01111,10000,10000,10000,01111',
    D: '11110,10001,10001,10001,11110', E: '11111,10000,11110,10000,11111', F: '11111,10000,11110,10000,10000',
    G: '01111,10000,10011,10001,01111', H: '10001,10001,11111,10001,10001', I: '111,010,010,010,111',
    J: '00111,00010,00010,10010,01100', K: '10010,10100,11000,10100,10010', L: '10000,10000,10000,10000,11111',
    M: '10001,11011,10101,10001,10001', N: '10001,11001,10101,10011,10001', O: '01110,10001,10001,10001,01110',
    P: '11110,10001,11110,10000,10000', Q: '01110,10001,10101,10010,01101', R: '11110,10001,11110,10010,10001',
    S: '01111,10000,01110,00001,11110', T: '11111,00100,00100,00100,00100', U: '10001,10001,10001,10001,01110',
    V: '10001,10001,10001,01010,00100', W: '10001,10001,10101,11011,10001', X: '10001,01010,00100,01010,10001',
    Y: '10001,01010,00100,00100,00100', Z: '11111,00010,00100,01000,11111',
    0: '0110,1001,1001,1001,0110', 1: '0110,1110,0110,0110,1111', 2: '11110,00001,01110,10000,11111',
    3: '11110,00001,00110,00001,11110', 4: '10010,10010,11111,00010,00010', 5: '11111,10000,11110,00001,11110',
    6: '01110,10000,11110,10001,01110', 7: '11111,00001,00010,00100,00100', 8: '01110,10001,01110,10001,01110',
    9: '01110,10001,01111,00001,01110', ' ': '00,00,00,00,00', '!': '1,1,1,0,1', '?': '1110,0001,0110,0000,0100',
    ':': '0,1,0,1,0', '.': '0,0,0,0,1', '-': '000,000,111,000,000', "'": '1,1,0,0,0', '/': '00001,00010,00100,01000,10000'
  };
  function pix(cv, text, o = {}) {
    text = String(text).toUpperCase();
    const key = text + (o.fill || '');
    if (cv._t === key) return;
    cv._t = key;
    const s = 6, ol = 2, dp = o.dp == null ? 3 : o.dp;
    const gl = [...text].map(ch => (FONT[ch] || FONT[' ']).split(','));
    let W = -1;
    for (const g of gl) W += g[0].length + 1;
    W = Math.max(W, 1);
    cv.width = W * s + ol * 2; cv.height = 5 * s + ol * 2 + dp;
    const c = cv.getContext('2d');
    const each = fn => { let x0 = 0; for (const g of gl) { for (let r = 0; r < 5; r++) for (let q = 0; q < g[r].length; q++) if (g[r][q] === '1') fn(ol + (x0 + q) * s, ol + r * s); x0 += g[0].length + 1; } };
    c.fillStyle = o.edge || DK; each((x, y) => c.fillRect(x - ol, y - ol, s + ol * 2, s + ol * 2 + dp));
    if (dp) { c.fillStyle = o.side || DK; each((x, y) => c.fillRect(x, y, s, s + dp)); }
    c.fillStyle = o.fill || '#fff'; each((x, y) => c.fillRect(x, y, s, s));
  }
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.min(255, Math.round(v * k)); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };

  const DK = '#1d1b26', GLASS = '#34466a', OR = '#ff9f1c', W = '#ffffff', PI4 = Math.PI / 4;
  const CHARS = [
    ['HOPPER', (B, S) => {
      const bl = '#eef0f6', cr = '#ff3b4e';
      S(.07, .14, .07, .1, 0, .02, OR); S(.09, .03, .09, .1, .1, .02, '#e8860f');
      S(.13, .03, .17, .1, 0, -.04, OR); S(.035, .03, .06, .06, 0, -.15, '#e8860f'); S(.035, .03, .06, .14, 0, -.15, '#e8860f');
      B(.52, .46, .56, 0, .14, .04, W); B(.54, .07, .58, 0, .14, .04, '#e3e6ee'); B(.38, .24, .05, 0, .2, -.26, '#f4f6fb');
      S(.06, .24, .32, .28, .24, .06, '#e3e6ee'); S(.07, .1, .2, .285, .24, .14, '#cdd3e0'); S(.065, .08, .28, .285, .4, .06, '#f2f4f9');
      B(.32, .2, .12, 0, .42, .36, '#eceef4'); B(.28, .06, .1, 0, .42, .38, '#d7dce8'); B(.1, .26, .1, 0, .5, .4, W); S(.09, .18, .08, .12, .5, .38, '#dfe3ec');
      B(.42, .38, .38, 0, .6, -.06, W); B(.36, .02, .32, 0, .98, -.06, '#fbfcff');
      S(.03, .07, .09, .215, .68, -.16, '#ffc2cc');
      S(.04, .08, .08, .215, .84, -.14, DK); S(.02, .03, .03, .232, .89, -.155, W);
      B(.12, .03, .26, 0, .98, -.1, '#d62839'); B(.1, .1, .08, 0, 1.01, -.19, cr); B(.1, .16, .08, 0, 1.01, -.1, cr); B(.1, .1, .08, 0, 1.01, -.01, cr);
      B(.15, .045, .14, 0, .805, -.3, '#ffb53a'); B(.12, .045, .11, 0, .76, -.285, '#e8860f');
      B(.07, .1, .05, 0, .65, -.27, cr);
      B(.46, .08, .42, 0, .58, -.05, bl); B(.465, .02, .425, 0, .61, -.05, W);
      B(.1, .18, .04, .15, .42, -.285, bl); B(.1, .02, .045, .15, .5, -.285, W); B(.1, .03, .04, .15, .4, -.285, '#dfe3ec');
    }],
    ['DUCKLING', (B, S) => {
      const y = '#ffd23f', d = '#ffbf1a';
      S(.07, .12, .07, .1, 0, .02, OR); S(.14, .03, .18, .1, 0, -.04, OR); S(.035, .03, .06, .06, 0, -.15, '#e8860f'); S(.035, .03, .06, .14, 0, -.15, '#e8860f');
      B(.5, .4, .56, 0, .12, .04, y); B(.52, .06, .58, 0, .12, .04, d); B(.36, .22, .05, 0, .18, -.26, '#ffeb99');
      B(.38, .34, .36, 0, .5, -.1, y); B(.32, .03, .3, 0, .84, -.1, '#ffe680');
      B(.26, .04, .18, 0, .615, -.36, '#ffa030'); B(.22, .035, .14, 0, .58, -.345, '#e87a12'); S(.025, .015, .03, .06, .655, -.42, '#b85d10');
      S(.04, .08, .08, .195, .7, -.18, DK); S(.02, .03, .03, .212, .76, -.195, W); S(.03, .06, .07, .195, .6, -.2, '#ffa9a0');
      B(.18, .1, .12, 0, .4, .36, d); B(.12, .08, .1, 0, .5, .4, d); B(.06, .06, .06, 0, .58, .42, y);
      B(.04, .1, .04, 0, .87, -.1, d); B(.04, .07, .04, .05, .87, -.06, d); B(.04, .07, .04, -.05, .87, -.14, d);
      S(.05, .18, .28, .27, .2, .06, d); S(.055, .08, .2, .272, .2, .1, '#f0a800'); S(.04, .04, .24, .275, .38, .06, '#ffd966');
    }],
    ['CROAKY', (B, S) => {
      const g = '#4cd964', d = '#2fb24c', l = '#7fe08a';
      S(.16, .12, .3, .3, 0, .14, d); S(.1, .08, .2, .3, .12, .2, '#3cc457'); S(.14, .03, .08, .3, 0, -.02, l); S(.1, .12, .1, .2, 0, -.18, d); S(.12, .03, .07, .2, 0, -.26, l);
      B(.56, .28, .56, 0, .06, 0, g); B(.58, .06, .58, 0, .06, 0, d); B(.4, .12, .04, 0, .08, -.29, '#c8f7a8'); B(.3, .08, .04, 0, .2, -.285, '#e8fcc0');
      B(.5, .1, .32, 0, .34, -.08, g); B(.46, .02, .28, 0, .44, -.08, '#6bea84');
      B(.12, .02, .12, -.12, .4, .12, d); B(.1, .02, .1, .14, .4, .2, d); B(.08, .02, .08, .02, .4, .3, d);
      S(.17, .17, .17, .16, .32, -.15, g); S(.19, .06, .19, .16, .32, -.15, d);
      S(.13, .11, .03, .16, .38, -.24, W); S(.06, .08, .03, .16, .39, -.255, DK); S(.025, .03, .03, .175, .43, -.27, W);
      S(.03, .02, .03, .06, .44, -.2, '#1f8a3a'); S(.04, .07, .04, .26, .2, -.22, '#ff9fb0');
      B(.38, .03, .02, 0, .2, -.285, '#d94f70'); B(.38, .015, .015, 0, .185, -.285, '#a8334f');
    }],
    ['WADDLES', (B, S) => {
      const k = '#2b2d42', kl = '#3d4160';
      S(.14, .04, .18, .1, 0, -.04, OR); S(.04, .03, .06, .05, 0, -.15, '#e8860f'); S(.04, .03, .06, .14, 0, -.15, '#e8860f'); S(.14, .02, .04, .1, .04, -.1, '#e8860f');
      B(.46, .5, .46, 0, .04, 0, k); B(.48, .08, .48, 0, .04, 0, '#1d1b26');
      B(.34, .42, .04, 0, .08, -.24, W); B(.3, .3, .02, 0, .1, -.265, '#f4f6fb');
      B(.4, .22, .42, 0, .54, 0, k); B(.36, .03, .38, 0, .76, 0, kl);
      B(.3, .16, .04, 0, .52, -.215, W); S(.11, .12, .03, .08, .55, -.215, W);
      B(.34, .05, .045, 0, .49, -.245, '#ffd23f');
      B(.12, .05, .12, 0, .53, -.3, '#ffb53a'); B(.1, .04, .1, 0, .49, -.285, '#e8860f');
      S(.05, .06, .03, .08, .58, -.235, DK); S(.02, .02, .03, .09, .62, -.245, W); S(.04, .04, .03, .17, .5, -.2, '#ff9fb0');
      S(.05, .3, .2, .255, .2, 0, k); S(.055, .1, .2, .257, .14, 0, kl); S(.052, .06, .18, .256, .12, 0, '#8d91ad');
      B(.14, .08, .12, 0, .08, .26, k);
    }],
    ['TRUFFLE', (B, S) => {
      const p = '#ffa8b8', q = '#ff8aa1', h = '#c4607a';
      S(.12, .14, .12, .17, 0, .24, q); S(.125, .04, .125, .17, 0, .24, h); S(.12, .14, .12, .17, 0, -.12, q); S(.125, .04, .125, .17, 0, -.12, h);
      B(.54, .4, .66, 0, .12, .06, p); B(.56, .07, .68, 0, .12, .06, q); B(.4, .02, .2, -.04, .52, .2, '#ffc1cd'); B(.16, .02, .16, .12, .52, -.02, '#ff94a8');
      B(.44, .4, .3, 0, .26, -.36, p); B(.36, .02, .22, 0, .66, -.36, '#ffc1cd');
      B(.22, .14, .06, 0, .34, -.54, q); B(.2, .02, .07, 0, .48, -.54, '#ffc1cd'); S(.04, .05, .02, .05, .38, -.575, '#b84a62');
      S(.1, .1, .06, .14, .66, -.36, q); S(.05, .06, .02, .14, .67, -.395, '#ffd0da');
      S(.09, .09, .02, .13, .49, -.515, W); S(.05, .06, .02, .12, .5, -.525, DK); S(.02, .02, .02, .13, .53, -.535, W);
      S(.04, .06, .04, .225, .4, -.4, '#ff7090');
      B(.06, .06, .06, 0, .42, .4, q); B(.06, .06, .06, .05, .46, .44, q); B(.06, .06, .06, 0, .5, .46, q);
    }],
    ['CLOVER', (B, S) => {
      const w = '#f5f2ee', pk = '#ffb3c6';
      S(.12, .06, .22, .12, 0, -.02, '#d9d2c9'); S(.04, .04, .06, .08, 0, -.12, '#c8c0b6');
      B(.44, .38, .48, 0, .06, .04, w); B(.46, .06, .5, 0, .06, .04, '#e5e0d8'); S(.1, .22, .3, .24, .08, .12, '#ebe7e0'); S(.08, .2, .06, .12, .08, -.2, '#e9e4dc');
      B(.38, .34, .34, 0, .44, -.1, w); B(.32, .02, .28, 0, .78, -.1, '#ffffff');
      S(.09, .4, .07, .09, .78, -.06, w); S(.05, .3, .02, .09, .82, -.105, pk); S(.09, .06, .07, .09, 1.12, -.06, '#d9d2c9');
      S(.04, .07, .07, .195, .6, -.17, DK); S(.02, .03, .03, .212, .65, -.185, W);
      B(.07, .05, .02, 0, .54, -.28, pk); B(.1, .05, .02, 0, .48, -.275, W); B(.02, .05, .025, 0, .48, -.285, '#d9d2c9');
      S(.04, .06, .04, .2, .5, -.2, '#ffd0da'); S(.12, .01, .01, .26, .52, -.26, '#d9d2c9'); S(.12, .01, .01, .26, .5, -.26, '#d9d2c9');
      B(.18, .18, .14, 0, .14, .32, W); B(.1, .1, .02, 0, .18, .4, '#ffffff');
      B(.08, .07, .03, 0, .4, -.23, pk); S(.06, .06, .03, .06, .4, -.23, pk);
    }],
    ['MITTENS', (B, S) => {
      const o = '#ff9f43', s = '#e57c1f', cm = '#fff3e0';
      S(.1, .14, .1, .13, 0, .26, o); S(.11, .05, .11, .13, 0, .26, W); S(.1, .14, .1, .13, 0, -.12, o); S(.11, .05, .11, .13, 0, -.12, W);
      B(.42, .34, .62, 0, .12, .06, o); B(.44, .36, .07, 0, .11, .02, s); B(.44, .36, .07, 0, .11, .22, s); B(.44, .36, .07, 0, .11, .38, s); B(.2, .22, .03, 0, .14, -.255, cm);
      B(.42, .36, .34, 0, .36, -.3, o); B(.2, .1, .04, 0, .38, -.485, cm); B(.34, .02, .26, 0, .72, -.3, '#ffb870');
      B(.04, .1, .02, 0, .62, -.475, s); B(.04, .08, .02, -.09, .62, -.475, s); B(.04, .08, .02, .09, .62, -.475, s);
      S(.1, .12, .08, .13, .72, -.3, o); S(.05, .08, .02, .13, .73, -.345, '#ffb3c6'); S(.1, .03, .08, .13, .81, -.3, s);
      S(.07, .07, .02, .1, .55, -.485, '#27ae60'); S(.025, .06, .02, .1, .555, -.495, DK); S(.02, .02, .02, .115, .6, -.5, W);
      B(.06, .04, .02, 0, .48, -.49, '#ff6b81'); S(.1, .01, .01, .22, .46, -.48, W); S(.1, .01, .01, .22, .44, -.48, W);
      S(.04, .06, .04, .22, .4, -.32, '#ffb870');
      B(.08, .42, .08, 0, .3, .4, o); B(.09, .06, .09, 0, .4, .4, s); B(.09, .06, .09, 0, .5, .4, s); B(.09, .1, .09, 0, .72, .4, s);
    }],
    ['BAMBOO', (B, S) => {
      const k = '#2b2d42', gr = '#7bd05a', gd = '#4ea63a';
      S(.16, .2, .16, .13, 0, 0, k); S(.17, .04, .18, .13, 0, -.01, '#3d4160');
      B(.5, .42, .48, 0, .14, .02, W); B(.52, .07, .5, 0, .14, .02, '#e3e6ee'); B(.54, .16, .26, 0, .38, -.02, k); B(.2, .1, .1, 0, .16, .28, W);
      S(.1, .3, .14, .3, .2, -.04, k); S(.11, .04, .15, .3, .2, -.04, '#3d4160');
      B(.46, .38, .4, 0, .56, -.06, W); B(.4, .02, .34, 0, .94, -.06, '#ffffff');
      S(.12, .12, .08, .17, .94, -.04, k); S(.06, .06, .02, .17, .97, -.085, '#8d91ad');
      S(.13, .13, .02, .11, .67, -.27, k); S(.045, .05, .02, .11, .72, -.285, W); S(.02, .03, .02, .115, .735, -.295, DK);
      B(.18, .1, .02, 0, .58, -.265, '#f2f2f2'); B(.08, .05, .02, 0, .62, -.28, k); B(.1, .015, .02, 0, .57, -.28, k);
      S(.05, .05, .02, .2, .6, -.25, '#ffb3c6');
      B(.05, .28, .05, .33, .12, -.18, gr); B(.06, .03, .06, .33, .2, -.18, gd); B(.06, .03, .06, .33, .3, -.18, gd); B(.12, .04, .05, .38, .36, -.18, gr);
    }],
    ['BOLT', (B, S) => {
      const m = '#c3cad8', n = '#8e99ad', dkm = '#5a6378';
      S(.12, .18, .14, .12, 0, 0, n); S(.14, .05, .18, .12, 0, -.02, dkm); S(.14, .03, .16, .12, .17, 0, '#a7b0c2');
      B(.48, .42, .42, 0, .18, 0, m); B(.5, .05, .44, 0, .18, 0, dkm); B(.5, .02, .44, 0, .4, 0, '#dfe5ee');
      B(.24, .14, .02, 0, .32, -.22, '#2f80ed'); B(.26, .16, .015, 0, .31, -.218, DK);
      S(.04, .04, .02, .06, .44, -.235, '#ff4757'); B(.05, .04, .02, 0, .44, -.235, '#4cd137'); B(.16, .03, .02, 0, .26, -.225, dkm); B(.16, .03, .02, 0, .22, -.225, dkm);
      B(.3, .22, .08, 0, .3, .24, '#2f80ed'); B(.26, .04, .082, 0, .36, .24, '#5ef2ff');
      S(.08, .3, .12, .29, .24, 0, n); S(.12, .1, .14, .29, .44, 0, dkm); S(.1, .08, .14, .29, .2, 0, '#a7b0c2');
      B(.2, .06, .2, 0, .58, -.02, dkm);
      B(.4, .3, .36, 0, .62, -.02, '#dfe5ee'); B(.42, .04, .38, 0, .62, -.02, dkm); B(.34, .02, .3, 0, .92, -.02, '#f1f4f9');
      B(.32, .1, .02, 0, .72, -.21, DK); S(.07, .05, .02, .08, .745, -.225, '#5ef2ff'); S(.035, .03, .02, .08, .755, -.232, '#ffffff');
      B(.18, .02, .02, 0, .66, -.205, dkm); B(.18, .02, .02, 0, .68, -.205, dkm);
      S(.06, .14, .12, .23, .7, -.02, n); S(.04, .06, .06, .27, .74, -.02, '#ff4757');
      B(.04, .16, .04, 0, .92, -.02, n); B(.045, .03, .045, 0, .98, -.02, dkm); B(.09, .09, .09, 0, 1.06, -.02, '#ff4757'); B(.04, .04, .04, -.015, 1.09, -.05, '#ff9aa4');
    }],
    ['EMBER', (B, S) => {
      const o = '#ff7b29', k = '#2b2d42', cr = '#fff3e0';
      S(.1, .14, .1, .13, 0, .24, k); S(.1, .14, .1, .13, 0, -.12, k); S(.11, .03, .12, .13, 0, -.12, '#3d4160');
      B(.42, .34, .56, 0, .12, .04, o); B(.44, .06, .58, 0, .12, .04, '#e5601a'); B(.26, .22, .03, 0, .18, -.255, W); B(.2, .1, .035, 0, .36, -.255, cr);
      B(.4, .02, .5, 0, .46, .04, '#ff9a52'); B(.1, .02, .1, .1, .47, .12, '#e5601a');
      B(.4, .34, .32, 0, .38, -.26, o); B(.4, .02, .26, 0, .72, -.26, '#ff9a52'); B(.2, .14, .16, 0, .4, -.5, W); B(.14, .06, .1, 0, .54, -.5, W);
      B(.07, .06, .04, 0, .48, -.6, k);
      S(.11, .14, .08, .13, .72, -.24, o); S(.11, .05, .08, .13, .86, -.24, k); S(.05, .08, .02, .13, .73, -.285, cr);
      S(.06, .06, .02, .11, .6, -.43, k); S(.03, .04, .02, .11, .615, -.44, '#ffcc33'); S(.015, .02, .02, .115, .64, -.45, W);
      S(.06, .1, .12, .21, .38, -.4, W); S(.04, .02, .02, .1, .55, -.43, k);
      B(.18, .18, .4, 0, .26, .5, o); B(.2, .06, .3, 0, .4, .5, '#e5601a'); B(.19, .19, .1, 0, .255, .74, W); B(.1, .1, .1, 0, .5, .56, '#ff9a52');
    }]
  ];

  const critter = o => (B, S) => {
    const c = o.c, d = o.d, l = o.l, hd = o.hd || c, nose = o.nose || '#3a2c2c';
    S(.1, .14, .1, .13, 0, .24, d); S(.1, .14, .1, .13, 0, -.12, d);
    if (o.wool) { B(.6, .46, .64, 0, .1, .04, c); B(.62, .06, .66, 0, .1, .04, shade(c, .82)); B(.5, .03, .5, 0, .56, .04, '#ffffff'); }
    else { B(.5, .4, .56, 0, .12, .04, c); B(.52, .06, .58, 0, .12, .04, shade(c, .8)); B(.34, .02, .4, 0, .52, .04, shade(c, 1.1)); }
    if (o.spots) { B(.22, .03, .24, .1, .53, .1, d); B(.18, .03, .2, -.12, .53, -.08, d); B(.04, .2, .24, .27, .3, .02, d); }
    B(.46, .4, .4, 0, .46, -.22, hd); B(.4, .02, .34, 0, .86, -.22, shade(hd, 1.1));
    B(.26, .16, .06, 0, .46, -.44, l); B(.12, .06, .05, 0, .56, -.47, nose);
    if (o.patch) S(.12, .14, .03, .12, .6, -.425, d);
    S(.05, .08, .03, .11, .64, -.43, o.patch ? W : DK); S(.02, .03, .03, .115, .68, -.445, o.patch ? DK : W);
    if (o.ear === 'long') { S(.08, .36, .07, .1, .84, -.18, hd); S(.04, .26, .02, .1, .86, -.22, '#ffb3c6'); }
    else if (o.ear === 'horn') { S(.06, .16, .06, .15, .86, -.26, '#f4ead0'); S(.14, .07, .08, .27, .72, -.2, hd); }
    else if (o.ear === 'big') { S(.2, .2, .08, .26, .78, -.2, hd); S(.11, .11, .02, .26, .8, -.245, '#e9ecf2'); }
    else { S(.12, .12, .08, .18, .84, -.2, o.d); S(.07, .07, .02, .18, .86, -.245, l); }
    if (o.tail) B(.16, .16, .16, 0, .34, .36, l); else B(.1, .1, .08, 0, .38, .34, c);
  };
  CHARS.push(
    ['PANDA', critter({ c: '#f4f6fa', d: '#23242e', l: '#ffffff', patch: 1 })],
    ['BUNNY', critter({ c: '#cfc7bf', d: '#b2a89e', l: '#fffaf4', ear: 'long', tail: 1, nose: '#ff8fa3' })],
    ['BEARY', critter({ c: '#8a5a3a', d: '#6a4229', l: '#d9b48c', nose: '#2b2d42' })],
    ['COWBELL', critter({ c: '#f7f7f9', d: '#2b2d42', l: '#ffb3c6', ear: 'horn', spots: 1, nose: '#e68aa0' })],
    ['LAMBCHOP', critter({ c: '#f6f1e4', d: '#3a3340', l: '#5a5066', wool: 1, hd: '#3a3340', nose: '#1d1b26' })],
    ['KOALA', critter({ c: '#9fa5b3', d: '#7d8392', l: '#e9ecf2', ear: 'big', nose: '#2b2d42' })]
  );

  const wheels = (B, xs, aw, ah) => {
    for (const x of xs) {
      B(.4, ah || .16, aw || .875, x, .2, 0, '#1d1f2a');
      for (const z of [-.42, .42]) {
        const o = z < 0 ? -1 : 1;
        B(.3, .22, .12, x, 0, z, DK); B(.22, .3, .118, x, 0, z, DK);
        B(.14, .14, .03, x, .08, z + o * .07, '#d5dae4'); B(.06, .06, .04, x, .12, z + o * .072, '#8e99ad');
      }
    }
  };
  const lights = (B, f, r, y) => {
    for (const z of [-.27, .27]) {
      B(.05, .12, .2, f, y - .01, z, '#aeb6c6'); B(.05, .08, .16, f + .008, y + .01, z, '#fffbd0');
      B(.05, .12, .2, r, y - .01, z, '#8f1d28'); B(.05, .08, .16, r - .008, y + .01, z, '#ff5a5a');
      B(.7, .004, .24, f + .35, .002, z, '#747886');
      B(.34, .004, .2, r - .17, .002, z, '#69525d');
    }
  };
  const mirrors = (B, x, y, c) => { for (const z of [-.46, .46]) { B(.08, .07, .07, x, y, z, c); B(.05, .05, .04, x, y + .01, z * 1.08, DK); } };
  const VEH = {
    car: { len: 1.5, cols: ['#ff4d4d', '#ffcf2e', '#3d8bff', '#33cc66', '#ff8a1f', '#a55eea', '#ff6fb1', '#f2f3f7'], make: (B, c, ci) => {
      const dk = shade(c, .72), lt = shade(c, 1.16), rf = shade(c, 1.12);
      B(1.46, .12, .78, 0, .1, 0, '#2b2d42'); B(1.5, .32, .86, 0, .2, 0, c); B(1.52, .07, .88, 0, .2, 0, dk); B(1.51, .03, .87, 0, .49, 0, lt);
      B(.84, .34, .8, -.1, .52, 0, c); B(.88, .2, .84, -.1, .58, 0, GLASS);
      B(.1, .2, .86, .3, .58, 0, c); B(.07, .2, .86, -.1, .58, 0, c); B(.12, .2, .86, -.5, .58, 0, c);
      B(.05, .14, .862, -.28, .61, 0, '#6d86b8'); B(.025, .14, .862, -.2, .61, 0, '#6d86b8'); B(.05, .14, .862, .12, .61, 0, '#6d86b8');
      B(.8, .06, .76, -.1, .86, 0, rf);
      B(.4, .04, .82, .55, .52, 0, lt); B(.26, .04, .82, -.64, .52, 0, lt);
      B(.02, .3, .875, .2, .22, 0, dk); B(.02, .3, .875, -.4, .22, 0, dk); B(.09, .03, .88, .1, .42, 0, lt); B(.09, .03, .88, -.5, .42, 0, lt);
      B(.06, .12, .88, .77, .18, 0, '#3a3e50'); B(.02, .08, .24, .8, .2, 0, W);
      B(.06, .12, .88, -.77, .18, 0, '#3a3e50'); B(.02, .08, .24, -.8, .2, 0, W);
      B(.02, .1, .3, .755, .34, 0, DK); B(.02, .02, .3, .76, .38, 0, '#c9ced8');
      mirrors(B, .24, .58, dk);
      B(.1, .05, .08, -.8, .12, .24, '#8e99ad');
      wheels(B, [-.45, .45], .875, .16); lights(B, .76, -.76, .34);
      if (ci === 1) {
        B(.2, .08, .3, -.1, .92, 0, W); B(.2, .02, .3, -.1, .96, 0, DK);
        for (let i = 0; i < 8; i++) B(.1, .04, .875, -.7 + .2 * i, .36, 0, DK);
      } else if (ci === 7) {
        B(.14, .03, .6, -.1, .92, 0, DK); B(.1, .08, .26, -.1, .95, -.14, '#ff3b4e'); B(.1, .08, .26, -.1, .95, .14, '#3d8bff');
        B(1.52, .06, .88, 0, .3, 0, '#3d8bff'); B(.5, .08, .875, .1, .22, 0, '#e3e6ee');
      } else if (ci % 3 === 0) {
        B(.5, .03, .04, -.1, .92, .24, DK); B(.5, .03, .04, -.1, .92, -.24, DK); B(.04, .03, .5, -.3, .92, 0, DK); B(.04, .03, .5, .1, .92, 0, DK);
      } else B(1.52, .035, .875, 0, .36, 0, lt);
    } },
    van: { len: 1.9, cols: ['#f2f3f7', '#3d8bff', '#ffcf2e', '#33cc66', '#ff8a1f'], make: (B, c, ci) => {
      const dk = shade(c, .78), lt = shade(c, 1.12);
      B(1.86, .12, .78, 0, .1, 0, '#2b2d42'); B(1.9, .64, .88, 0, .2, 0, c); B(1.2, .22, .9, -.22, .54, 0, GLASS);
      B(.04, .26, .74, .96, .5, 0, GLASS); B(.04, .04, .78, .965, .76, 0, c); B(.05, .26, .04, .965, .5, 0, c);
      B(1.84, .06, .84, 0, .84, 0, lt); B(1.92, .08, .9, 0, .3, 0, dk); B(1.2, .03, .895, -.22, .73, 0, '#5f78a8');
      B(.1, .22, .92, -.1, .54, 0, c); B(.1, .22, .92, -.55, .54, 0, c); B(.1, .22, .92, .3, .54, 0, c); B(.03, .22, .7, -.955, .54, 0, GLASS);
      B(.02, .3, .905, .38, .22, 0, dk); B(.02, .3, .905, -.78, .22, 0, dk); B(.02, .4, .905, -.32, .38, 0, dk); B(.08, .03, .91, .18, .46, 0, lt);
      B(1.2, .03, .04, -.2, .9, .3, DK); B(1.2, .03, .04, -.2, .9, -.3, DK);
      for (const x of [-.7, -.2, .3]) B(.04, .04, .7, x, .9, 0, DK);
      B(.05, .12, .92, .96, .16, 0, '#3a3e50'); B(.05, .12, .92, -.96, .16, 0, '#3a3e50'); B(.02, .08, .26, .99, .18, 0, W); B(.02, .08, .26, -.99, .18, 0, W);
      B(.02, .12, .5, .955, .3, 0, DK); B(.02, .02, .5, .96, .36, 0, '#c9ced8');
      B(.6, .12, .905, -.3, .5, 0, dk); B(.4, .02, .906, -.3, .54, 0, W);
      mirrors(B, .34, .62, dk);
      wheels(B, [-.6, .6], .905, .16); lights(B, .96, -.96, .34);
    } },
    truck: { len: 2.7, cols: ['#3d8bff', '#ff4d4d', '#33cc66', '#ff8a1f', '#a55eea'], make: (B, c, ci) => {
      const dk = shade(c, .74), lt = shade(c, 1.14);
      B(2.66, .14, .8, 0, .08, 0, '#2b2d42'); B(.78, .66, .86, .95, .18, 0, c); B(.82, .06, .88, .95, .84, 0, lt); B(.8, .08, .88, .95, .18, 0, dk);
      B(.04, .26, .72, 1.35, .5, 0, GLASS); B(.05, .26, .04, 1.355, .5, 0, c);
      B(.5, .22, .9, 1.02, .52, 0, GLASS); B(.08, .22, .92, .78, .52, 0, c); B(.5, .03, .895, 1.02, .71, 0, '#5f78a8');
      B(.02, .46, .875, .76, .2, 0, dk); B(.08, .03, .88, .9, .4, 0, lt);
      B(.34, .2, .8, .72, .9, 0, c); B(.35, .03, .81, .72, 1.07, 0, lt);
      B(1.8, .96, .92, -.4, .2, 0, '#f4f4f7'); B(1.82, .14, .94, -.4, .32, 0, c);
      for (let i = 0; i < 5; i++) B(.04, .96, .935, -1.2 + .4 * i, .2, 0, '#d5d9e3');
      B(.7, .34, .94, -.4, .6, 0, c); B(.5, .06, .945, -.4, .74, 0, W); B(.3, .06, .945, -.4, .64, 0, lt);
      B(1.7, .04, .82, -.4, 1.16, 0, '#dfe2ea'); B(1.84, .03, .94, -.4, 1.14, 0, '#c9ced8');
      B(.03, .86, .8, -1.3, .26, 0, '#d5d9e3'); B(.02, .86, .02, -1.3, .26, 0, '#9aa3b5');
      B(.03, .3, .6, 1.345, .22, 0, DK); B(.03, .02, .6, 1.35, .3, 0, '#c9ced8'); B(.03, .02, .6, 1.35, .26, 0, '#c9ced8');
      B(.1, .12, .9, 1.38, .12, 0, '#8e99ad'); B(.08, .1, .9, -1.34, .12, 0, '#8e99ad'); B(.02, .08, .24, 1.435, .14, 0, W);
      B(.07, .6, .07, .53, .4, .5, '#c9ced8'); B(.09, .04, .09, .53, 1.0, .5, DK);
      B(.04, .06, .12, 1.36, .88, -.28, '#ffd23f'); B(.04, .06, .12, 1.36, .88, .28, '#ffd23f');
      for (const z of [-.5, .5]) { B(.04, .04, .1, 1.2, .66, z * .93, DK); B(.06, .2, .05, 1.2, .46, z * 1.08, DK); }
      wheels(B, [-1, -.55, .95], .94, .18); lights(B, 1.35, -1.31, .32);
      B(.3, .12, .02, -.9, .1, .45, DK); B(.3, .12, .02, -.9, .1, -.45, DK);
    } }
  };
  const TRAINS = [['#e8413c', '#f4f5fa'], ['#2f80ed', '#f4f5fa'], ['#20b46a', '#fff3d6']];
  const TRAIN_CARS = 4, CAR_L = 3.3, TRAIN_LEN = TRAIN_CARS * CAR_L + (TRAIN_CARS - 1) * 0.2;
  function trainParts(B, c, wag) {
    let x = TRAIN_LEN / 2;
    for (let i = 0; i < TRAIN_CARS; i++) {
      const cx = x - CAR_L / 2, c0 = i ? wag : c, dk = shade(c0, .8), lt = shade(c0, 1.08);
      B(CAR_L - .1, .14, .8, cx, .06, 0, '#2b2d42'); B(CAR_L, .84, .9, cx, .2, 0, c0); B(CAR_L, .1, .91, cx, .2, 0, shade(c0, .66));
      B(CAR_L, .1, .92, cx, .34, 0, i ? c : '#ffd23f'); B(CAR_L, .03, .925, cx, .46, 0, W);
      for (const q of [-.95, .95]) {
        B(.55, .66, .92, cx + q, .24, 0, dk); B(.38, .3, .935, cx + q, .58, 0, GLASS); B(.26, .03, .94, cx + q - .02, .83, 0, '#6d86b8');
        B(.02, .76, .93, cx + q - .28, .2, 0, shade(c0, .5)); B(.02, .76, .93, cx + q + .28, .2, 0, shade(c0, .5)); B(.04, .12, .94, cx + q + .18, .42, 0, lt);
      }
      for (const q of [-.3, .3]) { B(.44, .26, .93, cx + q, .62, 0, GLASS); B(.3, .03, .94, cx + q - .04, .85, 0, '#6d86b8'); }
      for (const q of [-1.45, 1.45]) B(.26, .26, .93, cx + q, .62, 0, GLASS);
      B(CAR_L - .2, .08, .82, cx, 1.04, 0, '#d9dce6'); B(CAR_L - .1, .03, .9, cx, 1.04, 0, c0);
      for (const q of [-.9, 0, .9]) { B(.7, .1, .5, cx + q, 1.12, 0, '#c3c8d4'); B(.34, .02, .34, cx + q, 1.22, 0, '#8e99ad'); B(.12, .02, .12, cx + q, 1.23, 0, DK); }
      B(1.1, .06, .05, cx, 1.12, .36, '#a7b0c2');
      for (const q of [-1.1, -.7, .7, 1.1]) for (const z of [-.43, .43]) {
        const o = z < 0 ? -1 : 1;
        B(.28, .2, .06, cx + q, 0, z, DK); B(.2, .28, .058, cx + q, -.01, z, DK); B(.12, .12, .02, cx + q, .07, z + o * .035, '#d5dae4');
      }
      for (const q of [-.9, .9]) B(.9, .08, .82, cx + q, .02, 0, '#1d1f2a');
      if (i < TRAIN_CARS - 1) {
        const gx = x - CAR_L - .1;
        B(.2, .82, .72, gx, .2, 0, '#2b2d42'); B(.22, .06, .74, gx, 1.02, 0, '#4a4e5a'); B(.3, .06, .1, gx, .28, 0, '#8e99ad');
      }
      if (!i) {
        B(.045, .4, .8, x + .02, .5, 0, GLASS); B(.05, .4, .05, x + .025, .5, 0, c0); B(.05, .03, .3, x + .03, .6, -.2, DK);
        B(.04, .12, .5, x + .025, .92, 0, '#1d1f2a'); B(.045, .04, .38, x + .03, .96, 0, '#ff9f1c');
        for (const z of [-.3, .3]) { B(.05, .14, .2, x + .025, .32, z, '#aeb6c6'); B(.05, .1, .16, x + .033, .34, z, '#fffbd0'); B(.04, .06, .1, x + .025, 1.0, z * 1.2, '#ff4d4d'); }
        B(.1, .16, .92, x + .05, .1, 0, '#4a4e5a'); B(.22, .06, .14, x + .1, .28, 0, '#8e99ad'); B(.04, .1, .2, x + .025, .2, 0, W);
        B(.9, .004, .3, x + .5, .002, -.3, '#a39a8e'); B(.9, .004, .3, x + .5, .002, .3, '#a39a8e');
      }
      if (i === TRAIN_CARS - 1) for (const z of [-.3, .3]) { B(.05, .12, .16, x - CAR_L - .02, .34, z, '#8f1d28'); }
      x -= CAR_L + .2;
    }
  }
  function logParts(B, L) {
    const bark = '#9a6538', dk = '#7f4f2a', top = '#b9824f';
    B(L, .14, .7, 0, -.28, 0, dk); B(L, .16, .7, 0, -.14, 0, bark);
    B(L - .3, .02, .1, 0, .02, -.17, top); B(L - .7, .02, .1, 0, .02, .15, top); B(L - .5, .02, .12, 0, .02, -.02, '#ad7845');
    for (let x = -L / 2 + .45; x < L / 2 - .2; x += .55) B(.035, .3, .71, x, -.28, 0, '#6f4524');
    for (const s of [-1, 1]) {
      B(.04, .26, .62, s * L / 2, -.26, 0, '#e9c08c'); B(.045, .18, .46, s * L / 2, -.22, 0, '#d6a96c'); B(.05, .08, .2, s * L / 2, -.17, 0, '#b57e43');
    }
    B(.12, .03, .12, -L / 4, .02, .05, '#7a4a24'); B(.3, .03, .2, L / 5, .02, -.1, '#6fbf5a'); B(.14, .03, .12, L / 5 + .3, .02, .12, '#58a845');
    if (L > 2) { B(.12, .12, .1, -L / 4, -.2, .38, dk); B(.08, .08, .02, -L / 4, -.18, .44, '#e9c08c'); B(.12, .1, .1, L / 3, -.18, -.38, dk); B(.08, .07, .02, L / 3, -.165, -.44, '#e9c08c'); }
  }

  const ICON = {
    chars: '<svg viewBox="0 0 24 24"><rect x="5" y="8" width="12" height="13" fill="#fff"/><rect x="9" y="4" width="4" height="4" fill="#ff3b4e"/><rect x="17" y="12" width="4" height="3" fill="#ff9f1c"/><rect x="12" y="10" width="2" height="3" fill="#1d1b26"/><rect x="5" y="15" width="12" height="2" fill="#2f80ed"/></svg>',
    prize: '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="12" rx="2" fill="#dff6ff"/><rect x="7" y="6" width="4" height="4" fill="#ffd23f"/><rect x="12" y="8" width="4" height="4" fill="#4cd137"/><rect x="8" y="10" width="3" height="3" fill="#3d8bff"/><rect x="4" y="14" width="16" height="8" rx="1" fill="#fff"/><rect x="10" y="17" width="4" height="3" fill="#1d1b26"/></svg>',
    gift: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" fill="#fff"/><rect x="3" y="7" width="18" height="4" fill="#fff"/><rect x="11" y="7" width="2" height="14" fill="#ff3b4e"/><path d="M12 7c-2-4-6-4-6-1s4 1 6 1zm0 0c2-4 6-4 6-1s-4 1-6 1z" fill="#ff3b4e"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 4.5v15l11.5-7.5z" fill="#fff"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 4l8 8-8 8" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M20 12H6m6-7-7 7 7 7" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>'
  };

  const G = '.gm-' + ID;
  const CSS = `${G} [hidden]{display:none!important}
${G} .rh-stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#2d5e33;box-shadow:0 22px 44px -30px rgba(31,29,43,.6);font-family:var(--sans);-webkit-user-select:none;user-select:none}
${G} .rh-stage>canvas{display:block;border-radius:0}
${G} .rh-px{display:block;width:auto;image-rendering:pixelated}
${G} .rh-hud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:clamp(10px,2.6cqw,24px) clamp(12px,3cqw,28px);pointer-events:none}
${G} .rh-l{display:flex;flex-direction:column;align-items:flex-start;gap:clamp(4px,1cqw,10px)}
${G} .rh-score{height:clamp(30px,6.6cqw,54px)}
${G} .rh-top{height:clamp(14px,3.2cqw,27px)}
${G} .rh-r{margin-left:auto;display:flex;align-items:center;gap:clamp(5px,1.2cqw,10px)}
${G} .rh-coins{height:clamp(20px,4.6cqw,38px)}
${G} .rh-coin{display:block;flex:none;width:clamp(20px,4.6cqw,38px);aspect-ratio:1;border-radius:22%;background:linear-gradient(135deg,#fff3a0 0 18%,#ffd52e 19% 62%,#f0a500 63%);box-shadow:inset 0 0 0 clamp(2px,.5cqw,4px) #c27a00,0 clamp(2px,.45cqw,4px) 0 #1d1b26}
${G} .rh-coin.pop{animation:rh-pop .3s ease-out}
@keyframes rh-pop{40%{transform:scale(1.4) rotate(12deg)}}
${G} .rh-scr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2cqw,18px);pointer-events:none;padding:clamp(64px,14cqw,120px) 12px clamp(86px,20cqw,150px)}
${G} .rh-title{justify-content:space-between;padding-top:clamp(80px,15cqw,124px)}
${G} .rh-logo{display:flex;flex-direction:column;align-items:center;gap:clamp(2px,.6cqw,6px);animation:rh-drop .8s cubic-bezier(.3,1.5,.5,1) both}
${G} .rh-logo canvas{height:clamp(46px,11cqw,96px);transform:rotate(-4deg)}
${G} .rh-logo .l2{height:clamp(40px,9.5cqw,84px);margin-left:8%}
@keyframes rh-drop{from{transform:translateY(-70%) scale(.5);opacity:0}}
${G} .rh-blink{height:clamp(18px,4.2cqw,34px);animation:rh-blink 1.1s infinite}
@keyframes rh-blink{0%,78%{opacity:1}79%,100%{opacity:.15}}
${G} .rh-over{justify-content:flex-end}
${G} .rh-nb{height:clamp(20px,4.6cqw,38px);animation:rh-wob .6s ease-in-out infinite alternate}
@keyframes rh-wob{to{transform:scale(1.08) rotate(-3deg)}}
${G} .rh-menu{justify-content:space-between;padding-top:clamp(62px,13cqw,110px);padding-bottom:clamp(16px,4cqw,34px)}
${G} .rh-menu .ttl{height:clamp(22px,5cqw,42px)}
${G} .rh-menu .nm{height:clamp(24px,5.6cqw,46px)}
${G} .rh-gap{flex:1}
${G} .rh-note{min-height:1.2em;font:900 clamp(13px,2.6cqw,20px)/1.2 var(--sans);color:#fff;text-shadow:0 2px 0 #1d1b26;text-align:center;letter-spacing:.04em}
${G} .rh-row{display:flex;gap:clamp(8px,2cqw,16px);align-items:center;justify-content:center;flex-wrap:wrap}
${G} .rh-bar{position:absolute;left:0;right:0;bottom:clamp(14px,3.4cqw,28px);display:flex;justify-content:center;align-items:flex-end;gap:clamp(8px,2.2cqw,18px);pointer-events:none}
${G} .rh-btn{--c:#3d8bff;--d:#1f5fc4;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.35em;min-width:clamp(50px,11cqw,78px);height:clamp(50px,11cqw,78px);padding:0 .7em;border:0;border-radius:clamp(10px,2.2cqw,16px);background:var(--c);color:#fff;font:900 clamp(13px,2.6cqw,20px)/1 var(--sans);letter-spacing:.04em;box-shadow:inset 0 -.32em 0 var(--d),0 .28em 0 #1d1b26;cursor:pointer;pointer-events:auto;touch-action:manipulation;text-shadow:0 2px 0 rgba(0,0,0,.3);-webkit-tap-highlight-color:transparent}
${G} .rh-btn:active{transform:translateY(.18em);box-shadow:inset 0 -.14em 0 var(--d),0 .1em 0 #1d1b26}
${G} .rh-btn svg{width:clamp(26px,6cqw,42px);height:clamp(26px,6cqw,42px)}
${G} .rh-btn.go{--c:#4cd137;--d:#2e9a20}
${G} .rh-btn.big{min-width:clamp(64px,14cqw,100px);height:clamp(64px,14cqw,100px)}
${G} .rh-btn.big svg{width:60%;height:60%}
${G} .rh-btn.gold{--c:#ffb300;--d:#c97800}
${G} .rh-btn.pink{--c:#ff5e8a;--d:#c93a63}
${G} .rh-btn.wide{min-width:clamp(118px,27cqw,200px)}
${G} .rh-btn.off{filter:grayscale(.8) brightness(.85)}
${G} .rh-btn.hot{animation:rh-hot .9s ease-in-out infinite}
@keyframes rh-hot{0%,100%{transform:rotate(0)}20%{transform:rotate(-8deg) scale(1.08)}40%{transform:rotate(8deg) scale(1.08)}60%{transform:rotate(0)}}
${G} .rh-btn .rh-coin{width:1.1em}
${G} .rh-back{position:absolute;left:clamp(10px,2.6cqw,24px);top:clamp(10px,2.6cqw,24px)}`;


  Ameplay.register({
    id: ID,
    title: 'Road Hopper',
    category: '3D',
    tint: '#5fcf4f',
    better: 'high',
    width: 960,
    blurb: 'Hop across busy roads, rivers and rails without getting squished.',
    help: '<kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> hop · tap or click = hop forward · swipe to turn or step back',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 30h20a8 8 0 0 1 8 8v4a12 12 0 0 1-12 12H30a12 12 0 0 1-12-12V18a6 6 0 0 1 12 0v12"/><path d="M18 21h-7l7 5M24 12V7M30 54v6M38 54v6"/><circle cx="24" cy="18" r="1.6" fill="currentColor"/></svg>',
    css: CSS,
    async mount(root, api) {
      const PH = root.clientWidth && root.clientWidth < 560;
      const v = await api.gl(PH ? 600 : 960, PH ? 800 : 600);
      if (!v) return;
      const { THREE, renderer, w, h } = v;
      renderer.toneMapping = THREE.NoToneMapping;
      const wrap = document.createElement('div');
      wrap.className = 'rh-stage';
      wrap.style.width = v.canvas.style.width;
      wrap.style.aspectRatio = v.canvas.style.aspectRatio;
      v.canvas.style.width = '100%';
      root.append(wrap); wrap.append(v.canvas);
      if (COARSE) {
        const fit = () => { const cw = v.canvas.clientWidth; if (cw && !document.fullscreenElement) renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / w); };
        fit(); api.on(window, 'resize', fit);
      }
      const ui = document.createElement('div');
      ui.innerHTML = `
<div class="rh-hud"><div class="rh-l"><canvas class="rh-px rh-score"></canvas><canvas class="rh-px rh-top"></canvas></div><div class="rh-r"><canvas class="rh-px rh-coins"></canvas><i class="rh-coin rh-ci"></i></div></div>
<div class="rh-scr rh-title"><div class="rh-logo"><canvas class="rh-px l1"></canvas><canvas class="rh-px l2"></canvas></div><canvas class="rh-px rh-blink rh-tap"></canvas></div>
<div class="rh-scr rh-over" hidden><canvas class="rh-px rh-nb"></canvas><canvas class="rh-px rh-blink rh-again"></canvas></div>
<div class="rh-scr rh-menu rh-chars" hidden><canvas class="rh-px ttl"></canvas><div class="rh-gap"></div><canvas class="rh-px nm"></canvas><div class="rh-note"></div><div class="rh-row"><button class="rh-btn" data-a="prev" aria-label="Previous">${ICON.prev}</button><button class="rh-btn go wide rh-pick" data-a="pick">SELECT</button><button class="rh-btn" data-a="next" aria-label="Next">${ICON.next}</button></div></div>
<div class="rh-scr rh-menu rh-prize" hidden><canvas class="rh-px ttl"></canvas><div class="rh-gap"></div><canvas class="rh-px nm"></canvas><div class="rh-note"></div><div class="rh-row"><button class="rh-btn gold wide rh-spin" data-a="spin"><i class="rh-coin"></i>${CFG.prizeCost}</button><button class="rh-btn go wide rh-use" data-a="use">PLAY</button></div></div>
<div class="rh-bar"><button class="rh-btn" data-a="chars" aria-label="Characters">${ICON.chars}</button><button class="rh-btn go big rh-play" data-a="play" aria-label="Play">${ICON.play}</button><button class="rh-btn pink rh-pz" data-a="prize" aria-label="Prize machine">${ICON.prize}</button><button class="rh-btn gold rh-gift" data-a="gift" aria-label="Free gift">${ICON.gift}</button></div>
<button class="rh-btn rh-back" data-a="back" aria-label="Back" hidden>${ICON.back}</button>`;
      while (ui.firstChild) wrap.append(ui.firstChild);
      const $ = s => wrap.querySelector(s);
      const el = {
        score: $('.rh-score'), top: $('.rh-top'), coins: $('.rh-coins'), ci: $('.rh-ci'), hudL: $('.rh-l'),
        title: $('.rh-title'), logo: $('.rh-logo'), over: $('.rh-over'), nb: $('.rh-nb'), chars: $('.rh-chars'), prize: $('.rh-prize'),
        bar: $('.rh-bar'), play: $('.rh-play'), pz: $('.rh-pz'), gift: $('.rh-gift'), back: $('.rh-back'),
        cName: $('.rh-chars .nm'), cNote: $('.rh-chars .rh-note'), pick: $('.rh-pick'),
        pName: $('.rh-prize .nm'), pNote: $('.rh-prize .rh-note'), spin: $('.rh-spin'), use: $('.rh-use')
      };
      pix($('.l1'), 'CROSSY', { fill: '#ffffff', side: '#2f80ed', dp: 7 });
      pix($('.l2'), 'ROAD', { fill: '#ffd23f', side: '#e8590c', dp: 7 });
      pix($('.rh-tap'), COARSE ? 'TAP TO PLAY' : 'PRESS UP TO PLAY', {});
      pix($('.rh-again'), 'TAP TO PLAY AGAIN', {});
      pix(el.nb, 'NEW TOP SCORE!', { fill: '#ffd23f' });
      pix($('.rh-chars .ttl'), 'CHARACTERS', {});
      pix($('.rh-prize .ttl'), 'PRIZE MACHINE', {});

      const saved = api.load() || {};
      let coins = Math.max(0, saved.coins | 0);
      const owned = Array.isArray(saved.owned) ? saved.owned.filter(i => Number.isInteger(i) && i >= 0 && i < CHARS.length) : [];
      if (!owned.includes(0)) owned.unshift(0);
      let sel = owned.includes(saved.sel) ? saved.sel : 0;
      let top = Math.max(saved.top | 0, api.best | 0);
      let giftAt = +saved.gift || 0;
      const persist = () => api.save({ coins, owned, sel, top, gift: giftAt });

      const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#2d5e33');
      const portrait = w < h, HW = portrait ? 5.0 : 8.4, HH = HW * h / w;
      const cam = new THREE.OrthographicCamera(-HW, HW, HH, -HH, 1, 100);
      const OFFN = new THREE.Vector3(2.3, 9.2, 6.4).normalize(), OFF = OFFN.clone().multiplyScalar(40);
      const YAW = Math.atan2(OFF.x, OFF.z);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xaab4cc, 0.64));
      const sun = new THREE.DirectionalLight(0xffffff, 0.6);
      sun.castShadow = true;
      sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
      Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
      sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
      scene.add(sun, sun.target);
      const SUN = new THREE.Vector3(-5, 12, 4);

      function merge(parts) {
        const list = parts.map(([g, c]) => [g.index ? g.toNonIndexed() : g, c, g]);
        let n = 0;
        for (const p of list) n += p[0].attributes.position.count;
        const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), tc = new THREE.Color();
        let o = 0;
        for (const [g, c, src] of list) {
          const cnt = g.attributes.position.count, pa = g.attributes.position.array, na = g.attributes.normal.array;
          pos.set(pa, o * 3); nor.set(na, o * 3);
          tc.set(c).convertSRGBToLinear();
          let y0 = 1e9, y1 = -1e9;
          for (let i = 0; i < cnt; i++) { const yy = pa[i * 3 + 1]; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
          const ih = 1 / Math.max(1e-4, y1 - y0);
          for (let i = 0; i < cnt; i++) {
            const k = (o + i) * 3, ny = na[i * 3 + 1];
            const f = ny > 0.5 ? 1.04 : ny < -0.5 ? 0.6 : 0.82 + 0.18 * Math.min(1, (pa[i * 3 + 1] - y0) * ih);
            col[k] = tc.r * f; col[k + 1] = tc.g * f; col[k + 2] = tc.b * f;
          }
          o += cnt; g.dispose(); if (src !== g) src.dispose();
        }
        const out = new THREE.BufferGeometry();
        out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
        out.setAttribute('color', new THREE.BufferAttribute(col, 3));
        out.computeBoundingSphere();
        return out;
      }
      const box = (bw, bh, bd, x, y, z, c, rz, ry) => {
        const g = new THREE.BoxGeometry(bw, bh, bd);
        if (ry) g.rotateY(ry);
        if (rz) g.rotateZ(rz);
        return [g.translate(x, y + bh / 2, z), c];
      };
      const build = fn => {
        const p = [];
        const B = (...a) => p.push(box(...a));
        const S = (bw, bh, bd, x, y, z, c, rz, ry) => { B(bw, bh, bd, x, y, z, c, rz, ry); B(bw, bh, bd, -x, y, z, c, rz && -rz, ry && -ry); };
        fn(B, S, p);
        return merge(p);
      };

      const vlam = new THREE.MeshLambertMaterial({ vertexColors: true });
      vlam.onBeforeCompile = sh => {
        sh.vertexShader = 'varying float vWX;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvWX = (modelMatrix * vec4(transformed, 1.0)).x;');
        sh.fragmentShader = 'varying float vWX;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', 'gl_FragColor.rgb *= mix(1.0, 0.5, smoothstep(4.46, 4.56, abs(vWX)));\n#include <dithering_fragment>');
      };
      const plain = new THREE.MeshLambertMaterial({ vertexColors: true });
      const silMat = new THREE.MeshBasicMaterial({ color: lin('#141726') });
      const coinMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: lin('#4a3200') });
      const lampOn = new THREE.MeshBasicMaterial({ color: lin('#ff2a2a') }), lampOff = new THREE.MeshLambertMaterial({ color: lin('#5b2630') });
      const lampGeo = new THREE.BoxGeometry(.24, .24, .08);
      const sigGeo = build((B, S) => {
        B(.34, .12, .3, 0, 0, 0, '#5a5f70');
        for (let i = 0; i < 5; i++) B(.1, .24, .1, 0, .1 + .24 * i, 0, i & 1 ? '#f4f5fa' : '#e8413c');
        B(.72, .36, .14, 0, 1.04, 0, '#2b2d42'); B(.76, .04, .16, 0, 1.4, 0, '#1d1b26'); B(.8, .09, .06, 0, .86, .03, '#ffffff'); B(.24, .16, .14, 0, .62, .08, '#4a4e5a'); B(.16, .04, .02, 0, .7, .155, '#ffd23f');
        S(.3, .05, .14, .17, 1.34, .12, '#141726');
        B(.86, .08, .04, 0, 1.78, .05, '#ffffff', Math.PI / 4); B(.86, .08, .04, 0, 1.78, .05, '#ffffff', -Math.PI / 4); B(.1, .1, .05, 0, 1.78, .06, '#e8413c'); B(.86, .02, .042, 0, 1.8, .05, '#e8413c', Math.PI / 4); B(.86, .02, .042, 0, 1.8, .05, '#e8413c', -Math.PI / 4);
      });
      const coinGeo = merge([[new THREE.CylinderGeometry(.27, .27, .1, 18).rotateX(Math.PI / 2), '#e39a00'], [new THREE.CylinderGeometry(.225, .225, .115, 18).rotateX(Math.PI / 2), '#ffc41f'], [new THREE.CylinderGeometry(.15, .15, .125, 14).rotateX(Math.PI / 2), '#ffe25a'], [new THREE.BoxGeometry(.07, .2, .135), '#f0a500'], [new THREE.BoxGeometry(.2, .06, .135), '#f0a500'], [new THREE.BoxGeometry(.05, .1, .14).translate(-.18, .1, 0), '#fff6c4']]);
      const cgeo = [];
      const charGeo = i => cgeo[i] || (cgeo[i] = build((B, S) => CHARS[i][1](B, S)));

      const geoC = new Map(), pools = new Map();
      const geo = (key, make) => { let g = geoC.get(key); if (!g) { g = make(); geoC.set(key, g); } return g; };
      function take(key, make, mat) {
        const p = pools.get(key);
        let m = p && p.pop();
        if (!m) { m = new THREE.Mesh(geo(key, make), mat || vlam); m.castShadow = true; m.receiveShadow = true; m.userData.key = key; scene.add(m); }
        m.visible = true; m.rotation.set(0, 0, 0); m.scale.setScalar(1);
        return m;
      }
      function give(m) {
        m.visible = false;
        let p = pools.get(m.userData.key);
        if (!p) pools.set(m.userData.key, p = []);
        p.push(m);
      }

      const chick = new THREE.Mesh(charGeo(sel), vlam);
      chick.castShadow = true;
      scene.add(chick);
      const eagle = new THREE.Group();
      const eBody = new THREE.Mesh(build((B, S) => { B(.52, .36, 1.0, 0, 0, 0, '#7a4a2a'); B(.42, .4, .42, 0, .1, -.66, '#ffffff'); B(.16, .12, .22, 0, .16, -.96, '#ffc93c'); B(.16, .08, .08, 0, .08, -1.06, '#ffc93c'); S(.045, .08, .1, .215, .31, -.74, '#ffd23f'); S(.05, .05, .05, .217, .325, -.76, DK); S(.05, .04, .12, .215, .4, -.76, '#3a2414'); B(.38, .03, .4, 0, .5, -.66, '#fbfcff'); B(.5, .04, .7, 0, .36, .1, '#8a5a34'); B(.3, .03, .4, 0, .4, .15, '#9a6a40'); B(.4, .2, .04, 0, .06, -.51, '#c99a6a'); B(.44, .1, .46, 0, .14, .7, '#5a341c'); B(.4, .08, .26, 0, .14, 1.05, '#f4f1ea'); S(.1, .22, .1, .15, -.22, -.05, '#ffc93c'); S(.04, .04, .12, .15, -.24, -.14, '#e8a800'); S(.04, .04, .12, .11, -.24, -.14, '#e8a800'); }), plain);
      const wingGeo = s => build(B => { B(1.3, .08, .62, s * .65, 0, 0, '#8a5a34'); B(.5, .06, .46, s * 1.5, .01, .08, '#5a341c'); B(1.1, .02, .2, s * .6, .08, -.1, '#a77a4b'); B(.16, .06, .3, s * 1.2, 0, .4, '#6a4026'); B(.14, .06, .26, s * 1.45, 0, .45, '#4a2a16'); B(.12, .06, .22, s * 1.7, .01, .3, '#3a2010'); });
      const wL = new THREE.Mesh(wingGeo(-1), plain), wR = new THREE.Mesh(wingGeo(1), plain);
      wL.position.set(-.26, .22, 0); wR.position.set(.26, .22, 0);
      eagle.add(eBody, wL, wR); eagle.rotation.y = Math.PI; eagle.visible = false; eagle.scale.setScalar(1.3);
      for (const m of [eBody, wL, wR]) m.castShadow = true;
      scene.add(eagle);

      const PN = 180, pm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), PN);
      pm.frustumCulled = false;
      const PP = new Float32Array(PN * 3), PV = new Float32Array(PN * 3), PL = new Float32Array(PN), PM = new Float32Array(PN), PS = new Float32Array(PN), PG = new Float32Array(PN);
      const dum = new THREE.Object3D(), tc = new THREE.Color();
      let pIdx = 0;
      function partsClear() { PL.fill(0); dum.position.set(0, -50, 0); dum.scale.setScalar(0); dum.updateMatrix(); for (let i = 0; i < PN; i++) pm.setMatrixAt(i, dum.matrix); pm.instanceMatrix.needsUpdate = true; }
      for (let i = 0; i < PN; i++) pm.setColorAt(i, tc.set(0xffffff));
      partsClear();
      scene.add(pm);
      function emit(x, y, z, vx, vy, vz, life, size, hex, grav) {
        const i = pIdx, k = i * 3;
        pIdx = (pIdx + 1) % PN;
        PP[k] = x; PP[k + 1] = y; PP[k + 2] = z; PV[k] = vx; PV[k + 1] = vy; PV[k + 2] = vz;
        PL[i] = PM[i] = life; PS[i] = size; PG[i] = grav;
        pm.setColorAt(i, tc.set(hex).convertSRGBToLinear()); pm.instanceColor.needsUpdate = true;
      }
      function burst(n, x, y, z, sp, up, life, size, cols, grav = 14) {
        for (let q = 0; q < n; q++) {
          const a = Math.random() * TAU, s = sp * (.35 + Math.random() * .65);
          emit(x, y, z, Math.cos(a) * s, up * (.5 + Math.random() * .7), Math.sin(a) * s, life * (.6 + Math.random() * .6), size * (.7 + Math.random() * .6), cols[q % cols.length], grav);
        }
      }
      function stepParts(dt) {
        let any = false;
        for (let i = 0; i < PN; i++) {
          if (PL[i] <= 0) continue;
          any = true; PL[i] -= dt;
          const k = i * 3;
          PV[k + 1] -= PG[i] * dt; PP[k] += PV[k] * dt; PP[k + 1] += PV[k + 1] * dt; PP[k + 2] += PV[k + 2] * dt;
          const u = Math.max(0, PL[i] / PM[i]);
          dum.position.set(PP[k], PP[k + 1], PP[k + 2]); dum.rotation.set(PL[i] * 6, PL[i] * 4, 0); dum.scale.setScalar(PS[i] * Math.min(1, u * 2.5));
          dum.updateMatrix(); pm.setMatrixAt(i, dum.matrix);
        }
        if (any) pm.instanceMatrix.needsUpdate = true;
      }

      let ac = null, out = null, nbuf = null;
      function unlock() {
        if (!ac) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          try { ac = new AC(); } catch (e) { ac = null; return; }
          out = ac.createGain(); out.gain.value = 0.55; out.connect(ac.destination);
          nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nbuf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); }
      }
      const canPlay = () => ac && !api.muted && ac.state === 'running';
      function tone(type, f0, f1, dur, vol, at = 0) {
        if (!canPlay()) return;
        const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.03);
      }
      function hiss(dur, vol, f0, f1, q, type = 'bandpass', at = 0) {
        if (!canPlay()) return;
        const t = ac.currentTime + at, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = nbuf; s.loop = true; f.type = type; f.Q.value = q;
        f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
      }
      const SFX = {
        hop: () => tone('triangle', 500 + rnd(-30, 30), 960, 0.07, 0.1),
        bump: () => tone('square', 170, 110, 0.07, 0.05),
        coin: () => { tone('square', 1175, 0, 0.07, 0.045); tone('square', 1568, 0, 0.18, 0.045, 0.065); },
        horn: () => { for (const f of [392, 494]) { tone('square', f, f * 0.97, 0.16, 0.022); tone('square', f, f * 0.97, 0.24, 0.022, 0.2); } },
        bell: () => { tone('sine', 1760, 0, 0.3, 0.07); tone('triangle', 2637, 0, 0.16, 0.025); },
        train: () => { hiss(1.2, 0.22, 700, 160, 0.7, 'lowpass'); for (const f of [233, 294, 349]) tone('sawtooth', f, f * 0.98, 0.75, 0.018); },
        splash: () => { hiss(0.5, 0.45, 2400, 300, 0.8); tone('sine', 300, 900, 0.12, 0.05, 0.06); tone('sine', 420, 1200, 0.1, 0.04, 0.17); },
        squash: () => { tone('sine', 190, 45, 0.22, 0.32); hiss(0.08, 0.3, 3000, 800, 1, 'highpass'); },
        eagle: () => { tone('sawtooth', 2100, 1300, 0.55, 0.03); tone('sawtooth', 2180, 1240, 0.55, 0.026, 0.03); tone('sawtooth', 1900, 1200, 0.4, 0.02, 0.35); },
        grab: () => { hiss(0.16, 0.3, 1500, 500, 1); tone('square', 300, 120, 0.2, 0.06); },
        ui: () => tone('sine', 660, 990, 0.06, 0.07),
        click: () => tone('square', 900, 600, 0.03, 0.04),
        drop: () => { tone('triangle', 520, 240, 0.16, 0.1); tone('triangle', 400, 200, 0.1, 0.06, 0.2); },
        reveal: () => [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, 0, 0.28, 0.08, i * 0.08)),
        gift: () => [784, 988, 1175, 1568].forEach((f, i) => tone('square', f, 0, 0.12, 0.04, i * 0.07))
      };

      const TOP = { grass: 0, road: -0.03, rail: 0.04, river: -0.11, pads: -0.27 };
      const WATER = '#55c9f5', FOAM = '#d8f4ff';
      const rows = new Map();
      const GEN = { chunk: 'grass', left: 0, path: 0, rdir: 1 };
      let genR = 0;
      const diff = r => clamp(r / CFG.rampRows, 0, 1);
      function nextType(r) {
        if (r <= 3) return 'grass';
        if (GEN.left <= 0) {
          const d = diff(r);
          if (GEN.chunk !== 'grass' && Math.random() < 0.72 - d * 0.32) { GEN.chunk = 'grass'; GEN.left = rint(1, d > 0.5 ? 2 : 3); }
          else {
            GEN.chunk = pick(['road', 'road', 'road', 'river', 'river', 'rail'].filter(t => t !== GEN.chunk));
            GEN.left = GEN.chunk === 'rail' ? rint(1, d > 0.25 ? 2 : 1) : rint(1, Math.min(4, 2 + Math.round(d * 3)));
            GEN.rdir = Math.random() < 0.5 ? 1 : -1;
          }
        }
        GEN.left--;
        return GEN.chunk;
      }
      function deco(p, x, kind) {
        kind = kind || (Math.random() < 0.66 ? 'tree' : Math.random() < 0.6 ? 'rock' : 'stump');
        if (kind === 'tree') {
          const hh = pick([1, 1, 2, 2, 3]), c = pick(['#a5cf3a', '#9cc834', '#acd443']), H = .5 + .35 * hh;
          p.push(box(.32, .36, .32, x, 0, 0, '#6b4630'), box(.36, .05, .36, x, 0, 0, '#523422'));
          p.push(box(.8, H, .8, x, .36, 0, c), box(.82, .06, .82, x, .36, 0, shade(c, .78)));
          for (let i = 1; i < hh; i++) p.push(box(.81, .025, .81, x, .36 + i * H / hh, 0, shade(c, .92)));
        } else if (kind === 'rock') {
          p.push(box(.76, .14, .66, x, 0, 0, '#7f889c'), box(.68, .28, .58, x, .14, 0, '#9aa3b5'), box(.5, .14, .44, x - .04, .42, -.02, '#b9c0ce'), box(.2, .04, .18, x - .1, .56, -.04, '#d3d8e3'));
          p.push(box(.22, .14, .18, x + .3, 0, .22, '#8c95a8'), box(.12, .02, .12, x + .3, .14, .22, '#a9b1c2'), box(.22, .03, .2, x + .15, .42, .1, '#6fbf5a'), box(.04, .26, .02, x - .2, .14, .3, '#8a93a7'));
        } else {
          p.push(box(.5, .28, .5, x, 0, 0, '#8b5a3c'), box(.56, .08, .56, x, 0, 0, '#6e4630'), box(.38, .02, .38, x, .28, 0, '#dcae74'), box(.26, .025, .26, x, .28, 0, '#c9965a'), box(.1, .03, .1, x, .28, 0, '#a8723c'));
          p.push(box(.04, .26, .52, x + .1, .02, 0, '#a06a46'), box(.1, .08, .1, x + .26, 0, .12, '#d23b3b'), box(.06, .08, .06, x + .26, .0, .12, '#f4efe6'), box(.12, .03, .12, x + .26, .08, .12, '#d23b3b'));
        }
      }
      function fill(row, gmin, gmax, mk) {
        const L = CFG.loop, items = [];
        let q = 0;
        for (;;) {
          const it = mk();
          if (q + it.len + gmin > L) { give(it.mesh); break; }
          items.push([q + it.len / 2, it]);
          q += it.len + rnd(gmin, gmax);
        }
        const ph = rnd(0, L);
        for (const [c, it] of items) { it.x = ((c + ph) % L) - L / 2; row.movers.push(it); }
      }
      const isWet = t => t === 'river' || t === 'pads';
      function buildRow(r) {
        const prev = rows.get(r - 1), d = diff(r);
        let type = nextType(r);
        if (type === 'river' && prev && prev.type === 'river' && Math.random() < 0.3) type = 'pads';
        const row = { r, type, top: TOP[type], movers: [], blocked: new Set(), pads: new Set(), coin: null, dir: 1, speed: 0, rail: null, mesh: null };
        const p = [], WD = CFG.half * 2 + 1, ground = (c, top, side) => { p.push(box(WD, .86, 1, 0, top - 1, 0, side || c), box(WD, .14, 1, 0, top - .14, 0, c)); };
        if (prev && isWet(type) && !isWet(prev.type)) p.push(box(CFG.half * 2 + 1, .02, .1, 0, -.3, .44, FOAM));
        if (prev && !isWet(type) && isWet(prev.type)) p.push(box(CFG.half * 2 + 1, .02, .1, 0, -.3, .56, FOAM));
        if (type === 'grass') {
          const gc = r & 1 ? '#a2e05f' : '#99da58';
          ground(gc, 0, '#8a6a46');
          if (r <= -4) for (let x = -CFG.cols; x <= CFG.cols; x++) row.blocked.add(x);
          else if (r < 0) for (let i = rint(2, 4); i > 0; i--) row.blocked.add(rint(-CFG.cols, CFG.cols));
          else if (r <= 3) { for (const x of [-4, -3, 3, 4]) if (Math.random() < 0.3) row.blocked.add(x); }
          else {
            const prevPath = GEN.path, fromGrass = prev && prev.type === 'grass';
            if (fromGrass) GEN.path = clamp(GEN.path + rint(-1, 1), -3, 3);
            else if (!prev || prev.type !== 'pads') GEN.path = rint(-3, 3);
            for (let i = rint(1, 2 + Math.round(d * 3)); i > 0; i--) {
              const x = rint(-CFG.cols, CFG.cols);
              if (x !== GEN.path && !(fromGrass && x === prevPath)) row.blocked.add(x);
            }
          }
          for (const x of row.blocked) deco(p, x);
          for (let x = CFG.cols + 1; x <= CFG.half; x++) for (const sx of [-x, x]) if (Math.random() < (x <= CFG.cols + 2 ? 0.8 : 0.42)) deco(p, sx, Math.random() < 0.9 ? 'tree' : 'rock');
          for (let i = 0; i < 4; i++) { const x = rnd(-CFG.half, CFG.half), z = rnd(-.4, .4); if (!row.blocked.has(Math.round(x))) p.push(box(.05, .12, .05, x, 0, z, '#6fb83e'), box(.05, .09, .05, x + .06, 0, z + .02, '#86cf4b'), box(.05, .08, .05, x - .05, 0, z + .03, '#5fa636')); }
          for (let i = 0; i < 3; i++) { const x = rnd(-CFG.half, CFG.half), z = rnd(-.4, .4); if (!row.blocked.has(Math.round(x))) p.push(box(.03, .1, .03, x, 0, z, '#4f9a35'), box(.1, .05, .1, x, .1, z, pick(['#ffffff', '#ffe066', '#ff8fb1', '#b9a3ff'])), box(.04, .03, .04, x, .15, z, '#ffd23f')); }
          for (let i = 0; i < 3; i++) { const x = rnd(-CFG.half, CFG.half), z = rnd(-.4, .4); if (!row.blocked.has(Math.round(x))) p.push(box(.08, .04, .07, x, 0, z, pick(['#b8ec7a', '#86c94b', '#cfd6e4']))); }
        } else if (type === 'road') {
          ground('#555a67', TOP.road, '#3c404c');
          for (let i = 0; i < 12; i++) p.push(box(rnd(.2, .9), .01, rnd(.08, .26), rnd(-CFG.half, CFG.half), TOP.road, rnd(-.38, .38), pick(['#5d6270', '#4d525f', '#626776'])));
          if (!prev || prev.type !== 'road') p.push(box(WD, .012, .07, 0, TOP.road, .45, '#d0d4dc'));
          if (Math.random() < 0.18) { const mx = rint(-CFG.cols, CFG.cols); p.push(box(.4, .014, .4, mx, TOP.road, 0, '#444855'), box(.3, .016, .3, mx, TOP.road, 0, '#4d5260')); }
          if (prev && prev.type === 'road') for (let x = -CFG.half; x <= CFG.half; x += 1.5) p.push(box(.72, .012, .08, x, TOP.road, .5, '#eef1f5'));
          row.dir = Math.random() < 0.5 ? 1 : -1;
          const trucks = Math.random() < 0.28, fast = !trucks && Math.random() < 0.12 + d * 0.2, sp = trucks ? CFG.truck : CFG.car;
          row.speed = (rnd(sp[0], sp[1]) + d * sp[2]) * (fast ? CFG.fastLane : 1);
          const gmin = fast ? 4.5 : 2.6;
          fill(row, gmin, gmin + 6.5 - d * 3, () => {
            const k = trucks ? (Math.random() < 0.75 ? 'truck' : 'van') : (Math.random() < 0.8 ? 'car' : 'van'), V = VEH[k], ci = rint(0, V.cols.length - 1);
            const m = take(k + ci, () => build(B => V.make(B, V.cols[ci], ci)));
            m.rotation.y = row.dir > 0 ? 0 : Math.PI;
            return { len: V.len, mesh: m };
          });
        } else if (type === 'river') {
          ground(WATER, -0.3, '#3aa7d4');
          for (let x = -CFG.half; x <= CFG.half; x++) if ((x + r) & 1) p.push(box(1, .01, 1, x, -.3, 0, '#4fc2f0'));
          for (let i = 0; i < 9; i++) { const rx = rnd(-CFG.half, CFG.half), rz = rnd(-.4, .4), rl = rnd(.3, .8); p.push(box(rl, .012, .05, rx, -.3, rz, '#a8ecff'), box(rl * .5, .012, .04, rx + rl * .3, -.3, rz + .1, '#8fe0fa')); }
          GEN.rdir = -GEN.rdir; row.dir = GEN.rdir;
          row.speed = rnd(CFG.log[0], CFG.log[1]) + d * CFG.log[2];
          fill(row, 1.6 + d * 0.6, 3.4 + d * 1.4, () => { const L = rint(2, d > 0.55 ? 3 : 4); return { len: L, mesh: take('log' + L, () => build(B => logParts(B, L))) }; });
        } else if (type === 'pads') {
          ground(WATER, -0.3);
          row.pads.add(GEN.path);
          for (let i = rint(1, 3); i > 0; i--) row.pads.add(rint(-CFG.cols, CFG.cols));
          for (const x of row.pads) {
            p.push(box(.88, .012, .88, x, -.3, 0, '#3aa8d4'), box(.8, .05, .5, x, -.32, 0, '#3cae4c'), box(.5, .05, .8, x, -.32, 0, '#3cae4c'), box(.56, .05, .56, x, -.32, 0, '#3cae4c', 0, Math.PI / 4));
            p.push(box(.6, .056, .34, x + .05, -.32, .06, '#5ccd62'), box(.34, .056, .6, x + .05, -.32, .06, '#5ccd62'), box(.04, .058, .7, x, -.32, 0, '#2d8e3c'), box(.7, .058, .04, x, -.32, 0, '#2d8e3c'), box(.1, .07, .2, x, -.322, .32, WATER));
            if (Math.random() < 0.3) p.push(box(.14, .1, .14, x - .18, -.27, -.16, '#ff8fb1'), box(.09, .06, .09, x - .27, -.27, -.16, '#ffb3c8'), box(.09, .06, .09, x - .09, -.27, -.16, '#ffb3c8'), box(.09, .06, .09, x - .18, -.27, -.25, '#ffb3c8'), box(.06, .06, .06, x - .18, -.2, -.16, '#ffd23f'));
          }
        } else {
          ground('#a39383', 0, '#7f7164');
          for (let i = 0; i < 16; i++) p.push(box(rnd(.1, .3), .03, rnd(.06, .14), rnd(-CFG.half, CFG.half), 0, rnd(-.45, .45), pick(['#b8a999', '#8d7f70', '#c9bcab'])));
          for (let x = -CFG.half; x <= CFG.half; x += 0.7) p.push(box(.24, .05, .84, x, 0, 0, pick(['#7a5236', '#6e4a30', '#835a3c'])), box(.05, .02, .84, x - .04, .05, 0, '#8f6444'));
          for (const z of [-.26, .26]) p.push(box(WD, .07, .08, 0, .03, z, '#a7aebb'), box(WD, .02, .05, 0, .1, z, '#f1f4f8'), box(WD, .02, .02, 0, .0, z + (z < 0 ? -.07 : .07), '#6b6055'));
          row.dir = Math.random() < 0.5 ? 1 : -1;
          const px = CFG.cols + 0.95, pz = -r + 0.36;
          const post = new THREE.Mesh(sigGeo, plain); post.position.set(px, 0, pz); post.castShadow = true;
          const l1 = new THREE.Mesh(lampGeo, lampOff), l2 = new THREE.Mesh(lampGeo, lampOff);
          l1.position.set(px - .17, 1.22, pz + .09); l2.position.set(px + .17, 1.22, pz + .09);
          scene.add(post, l1, l2);
          row.rail = { timer: rnd(1.5, 6), train: null, bell: 0, warn: false, own: [post, l1, l2], lamps: [l1, l2] };
        }
        if (r > 3 && (type === 'grass' || type === 'road' || type === 'rail') && Math.random() < CFG.coinChance) {
          const free = [];
          for (let x = -CFG.cols; x <= CFG.cols; x++) if (!row.blocked.has(x)) free.push(x);
          if (free.length) { const x = pick(free), m = take('coin', () => coinGeo, coinMat); m.position.set(x, row.top + .42, -r); row.coin = { x, mesh: m }; }
        }
        row.mesh = new THREE.Mesh(merge(p), vlam);
        row.mesh.position.z = -r; row.mesh.castShadow = true; row.mesh.receiveShadow = true;
        scene.add(row.mesh);
        for (const m of row.movers) m.mesh.position.set(m.x, type === 'river' ? -0.15 : row.top, -r);
        rows.set(r, row);
      }
      function dropRow(row) {
        scene.remove(row.mesh); row.mesh.geometry.dispose();
        for (const m of row.movers) give(m.mesh);
        if (row.coin) give(row.coin.mesh);
        if (row.rail) { for (const o of row.rail.own) scene.remove(o); if (row.rail.train) give(row.rail.train.mesh); }
        rows.delete(row.r);
      }

      const CS = 1.15;
      const DIRS = { up: [0, 1, 0], down: [0, -1, Math.PI], left: [-1, 0, Math.PI / 2], right: [1, 0, -Math.PI / 2] };
      const P = { x: 0, r: 0, rf: 0, y: 0, face: 0, faceT: 0, hop: null, log: null, logV: 0, off: 0, queued: null, sq: 0, bump: 0, snap: 0, crouch: false, vx: 0, vy: 0, vz: 0 };
      const E = { t: 0, x: 0, z: 0, grabbed: false };
      let state = 'title', mini = false, score = 0, maxR = 0, idle = 0, started = false, submitted = false;
      let camRow = 0, camTarget = 0, camX = 0, shake = 0, deathKind = '', deathT = 0, overAt = 0, hornCD = 2, clock = 0, acc = 0;
      let cIdx = sel, PZ = null, show = null;

      const hudScore = () => { pix(el.score, score, { dp: 4 }); api.score(score); };
      const hudTop = () => pix(el.top, 'TOP ' + top, { dp: 2 });
      const hudCoins = () => pix(el.coins, coins, { dp: 3, fill: '#ffd23f' });
      const bumpCoin = () => { el.ci.classList.remove('pop'); void el.ci.offsetWidth; el.ci.classList.add('pop'); };

      function resetWorld() {
        for (const row of [...rows.values()]) dropRow(row);
        Object.assign(GEN, { chunk: 'grass', left: 0, path: 0, rdir: 1 });
        genR = -12;
        while (genR <= 24) buildRow(genR++);
        Object.assign(P, { x: 0, r: 0, rf: 0, y: 0, face: 0, faceT: 0, hop: null, log: null, logV: 0, off: 0, queued: null, sq: 0, bump: 0, snap: 0, crouch: false });
        score = 0; maxR = 0; idle = 0; started = false; submitted = false;
        camRow = 0; camTarget = 0; camX = 0; shake = 0; deathKind = '';
        chick.geometry = charGeo(sel); chick.visible = true; chick.position.set(0, 0, 0); chick.rotation.set(0, 0, 0); chick.scale.set(1, 1, 1);
        eagle.visible = false; partsClear();
        hudScore(); hudTop(); hudCoins();
      }
      function ensureRows() {
        const f = Math.round(camRow);
        while (genR <= f + (portrait ? 24 : 21)) buildRow(genR++);
        for (const row of rows.values()) if (row.r < f - 12 && row.r < P.r - 4) dropRow(row);
      }

      function hop(dir) {
        if (state !== 'run') return;
        if (P.hop) { P.queued = dir; return; }
        const [dx, dr, face] = DIRS[dir];
        P.faceT = face;
        const tr = P.r + dr, row = rows.get(tr);
        if (!row) return;
        const wet = isWet(row.type), tx = wet ? P.x + dx : Math.round(P.x + dx);
        if (Math.abs(tx) > CFG.cols + (wet ? 0.45 : 0.01) || row.blocked.has(tx)) { P.bump = 0.14; SFX.bump(); return; }
        P.hop = { t: 0, fx: P.x, fr: P.rf, fy: P.y, tx, tr, ty: row.top, drift: P.log && wet ? P.logV : 0 };
        P.log = null; P.r = tr; P.sq = 0; P.bump = 0;
        SFX.hop();
        if (tr > maxR) { maxR = tr; score = tr; idle = 0; hudScore(); }
      }
      function collect(row) {
        const c = row.coin;
        burst(10, c.x, row.top + .45, -row.r, 2.2, 3.5, .5, .1, ['#ffe066', '#fff6c4', '#ffb31f'], 9);
        give(c.mesh); row.coin = null;
        coins++; persist(); hudCoins(); bumpCoin(); SFX.coin();
      }
      function land() {
        const hp = P.hop;
        P.hop = null; P.x = hp.tx; P.rf = hp.tr; P.y = hp.ty; P.sq = 0.1;
        const row = rows.get(P.r);
        if (row.type === 'river') {
          let m = null;
          for (const o of row.movers) if (Math.abs(P.x - o.x) <= o.len / 2 + 0.12) m = o;
          if (!m) return die('water');
          const half = (m.len - 1) / 2, k = clamp(Math.round(P.x - m.x + half), 0, m.len - 1);
          P.log = m; P.logV = row.dir * row.speed; P.off = k - half;
          const nx = m.x + P.off;
          P.snap += P.x - nx; P.x = nx;
          burst(4, P.x, -0.1, -P.rf, 1.4, 1.6, .35, .08, [FOAM, '#ffffff'], 8);
        } else if (row.type === 'pads') {
          const c = Math.round(P.x);
          if (!row.pads.has(c)) return die('water');
          P.snap += P.x - c; P.x = c;
          burst(4, P.x, -0.25, -P.rf, 1.4, 1.6, .35, .08, [FOAM, '#ffffff'], 8);
        } else {
          burst(3, P.x, P.y + .03, -P.rf, 1.1, .9, .25, .07, row.type === 'grass' ? ['#e8f8d0', '#ffffff'] : ['#d8d4cc', '#ffffff'], 6);
          if (row.coin && row.coin.x === P.x) collect(row);
        }
        if (P.r <= maxR - CFG.backLimit) return die('eagle');
        if (P.queued) { const q = P.queued; P.queued = null; hop(q); }
      }
      function die(kind, row) {
        if (state !== 'run') return;
        state = 'dying'; deathKind = kind; deathT = 0; P.queued = null; P.crouch = false;
        const cx = P.x, cz = -P.rf, feathers = ['#ffffff', '#f1f2f6', '#e3e6ee'];
        if (kind === 'car') { P.hop = null; P.y = row.top + 0.01; chick.position.set(P.x, P.y, cz); chick.scale.set(1.6, 0.1, 1.6); shake = 0.35; SFX.squash(); SFX.horn(); burst(12, cx, .3, cz, 2.6, 3.4, .8, .09, feathers, 12); }
        else if (kind === 'side') { P.hop = null; P.y = row.top; chick.position.set(P.x, P.y, cz); chick.scale.set(1.45, 1.35, 0.14); shake = 0.35; SFX.squash(); SFX.horn(); burst(12, cx, .5, cz, 2.6, 3.4, .8, .09, feathers, 12); }
        else if (kind === 'train') { P.hop = null; P.vx = row.dir * 26; P.vy = 7; P.vz = rnd(-2, 2); shake = 0.55; SFX.squash(); burst(16, cx, .5, cz, 4, 4, .9, .1, feathers, 12); }
        else if (kind === 'water' || kind === 'drift') { P.log = null; P.hop = null; shake = 0.12; SFX.splash(); burst(22, cx, -0.25, cz, 1.6, 5.5, .8, .13, ['#ffffff', '#bdeeff', '#7fd8f7'], 14); }
        else { E.t = 0; E.x = cx; E.z = cz; E.grabbed = false; eagle.visible = true; eagle.position.set(cx, 8, cz - 14); SFX.eagle(); }
        api.timeout(gameOver, { car: 1000, side: 1000, train: 1200, water: 1100, drift: 1100, eagle: 1600 }[kind]);
      }
      function gameOver() {
        if (state !== 'dying') return;
        state = 'over';
        let nb = false;
        if (!submitted) { submitted = true; if (score > 0) nb = api.submit(score) && score > top; }
        if (score > top) top = score;
        persist(); hudTop();
        el.nb.hidden = !nb;
        overAt = performance.now();
        syncUI();
      }
      function startRun() {
        if (state !== 'title') return;
        state = 'run'; started = true; idle = 0;
        syncUI();
      }
      function newRun() { resetWorld(); state = 'title'; mini = true; syncUI(); }
      const giftReady = () => Date.now() - giftAt >= CFG.giftEvery * 1000;

      function syncUI() {
        const menu = state === 'chars' || state === 'prize';
        el.title.hidden = state !== 'title';
        el.logo.hidden = mini;
        el.over.hidden = state !== 'over';
        el.chars.hidden = state !== 'chars';
        el.prize.hidden = state !== 'prize';
        el.bar.hidden = !(state === 'title' || state === 'over');
        el.play.hidden = state !== 'over';
        el.back.hidden = !menu;
        el.hudL.hidden = menu;
        el.gift.hidden = !giftReady();
        el.pz.classList.toggle('hot', coins >= CFG.prizeCost && owned.length < CHARS.length);
        if (show) show.g.visible = menu;
        if (state === 'chars') updChars();
        if (state === 'prize') updPrize();
      }
      function updChars() {
        const own = owned.includes(cIdx);
        pix(el.cName, own ? CHARS[cIdx][0] : '???', {});
        el.cNote.textContent = `${owned.length} / ${CHARS.length} UNLOCKED`;
        el.pick.textContent = !own ? 'LOCKED' : cIdx === sel ? 'SELECTED' : 'SELECT';
        el.pick.classList.toggle('off', !own);
      }
      function updPrize() {
        const all = owned.length >= CHARS.length, running = PZ && !PZ.done;
        el.pName.hidden = !(PZ && PZ.done);
        if (PZ && PZ.done) pix(el.pName, CHARS[PZ.c][0], { fill: '#ffd23f' });
        el.pNote.textContent = PZ && PZ.done ? 'NEW CHARACTER!' : running ? '' : all ? 'YOU HAVE EVERY CHARACTER!' : coins >= CFG.prizeCost ? `${CFG.prizeCost} COINS PER PRIZE` : `COLLECT ${CFG.prizeCost} COINS TO PLAY`;
        el.spin.hidden = running || all;
        el.spin.classList.toggle('off', coins < CFG.prizeCost);
        el.use.hidden = !(PZ && PZ.done);
      }
      function getShow() {
        if (show) return show;
        const g = new THREE.Group(), yaw = new THREE.Group();
        g.add(yaw); yaw.rotation.y = YAW;
        const dim = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ color: lin('#0b1020'), transparent: true, opacity: 0.62, depthWrite: false }));
        dim.rotation.x = -Math.PI / 2; dim.position.y = -0.3; g.add(dim);
        const plat = new THREE.Mesh(build(B => { B(40, .24, 2.2, 0, -.24, 0, '#cfe6ff'); B(1.9, .02, 1.9, 0, 0, 0, '#ffffff'); }), plain);
        plat.receiveShadow = true; yaw.add(plat);
        const car = new THREE.Group(); yaw.add(car);
        const ms = CHARS.map((c, i) => { const m = new THREE.Mesh(charGeo(i), plain); m.position.x = i * 2; m.castShadow = true; car.add(m); return m; });
        const mach = new THREE.Group(); mach.scale.setScalar(1.7); yaw.add(mach);
        const body = new THREE.Mesh(build(B => {
          B(1.3, .72, 1.1, 0, 0, 0, '#ff4757'); B(1.36, .1, 1.16, 0, .72, 0, '#ffd23f');
          B(1.2, .18, 1.04, 0, 1.82, 0, '#ff4757'); B(.32, .16, .32, 0, 2.0, 0, '#ffd23f');
          B(.44, .3, .04, 0, .12, .56, DK); B(.5, .06, .08, 0, .08, .58, '#ffd23f');
          B(.3, .22, .04, .4, .38, .56, '#c9ced8'); B(.16, .06, .02, .4, .46, .585, DK);
          for (let i = 0; i < 16; i++) B(.22, .22, .22, rnd(-.4, .4), .84 + rnd(0, .6), rnd(-.32, .32), pick(['#ff5e8a', '#4cd137', '#3d8bff', '#ffd23f', '#a55eea', '#ff8a1f']));
        }), plain);
        body.castShadow = true; mach.add(body);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.0, .96), new THREE.MeshLambertMaterial({ color: lin('#dff6ff'), transparent: true, opacity: 0.32, depthWrite: false }));
        glass.position.y = 1.32; mach.add(glass);
        const crank = new THREE.Mesh(build(B => { B(.42, .42, .08, 0, -.21, 0, '#ffd23f'); B(.08, .26, .08, 0, 0, .06, '#ffffff'); B(.12, .12, .16, 0, .24, .1, '#ff4757'); }), plain);
        crank.position.set(-.36, .42, .6); mach.add(crank);
        const cap = new THREE.Group();
        const capT = new THREE.Mesh(build(B => B(.42, .21, .42, 0, 0, 0, '#ff5e8a')), plain), capB = new THREE.Mesh(build(B => B(.42, .21, .42, 0, -.21, 0, '#ffffff')), plain);
        cap.add(capT, capB); cap.visible = false; yaw.add(cap);
        const rev = new THREE.Mesh(charGeo(0), plain); rev.castShadow = true; rev.visible = false; yaw.add(rev);
        scene.add(g); g.visible = false;
        return (show = { g, car, ms, mach, crank, cap, capT, capB, rev });
      }
      function openMenu(kind) {
        if (state === 'over') newRun();
        if (state !== 'title') return;
        const S = getShow();
        state = kind; P.crouch = false;
        S.car.visible = kind === 'chars'; S.mach.visible = kind === 'prize';
        S.cap.visible = false; S.rev.visible = false; PZ = null;
        if (kind === 'chars') { cIdx = sel; S.car.position.x = -cIdx * 2; }
        SFX.ui(); syncUI();
      }
      function closeMenu() {
        if (state !== 'chars' && state !== 'prize') return;
        if (PZ && !PZ.done) return;
        state = 'title'; PZ = null; SFX.ui(); syncUI();
      }
      function browse(k) { cIdx = (cIdx + k + CHARS.length) % CHARS.length; SFX.ui(); updChars(); }
      function pickChar(i) { sel = i; persist(); chick.geometry = charGeo(sel); }
      function spin() {
        if (state !== 'prize' || (PZ && !PZ.done)) return;
        const locked = CHARS.map((c, i) => i).filter(i => !owned.includes(i));
        if (!locked.length || coins < CFG.prizeCost) { SFX.bump(); return; }
        coins -= CFG.prizeCost;
        const c = pick(locked);
        owned.push(c); persist(); hudCoins();
        const S = getShow();
        S.mach.visible = true; S.rev.visible = false; S.cap.visible = false;
        S.capT.material = plain; S.capT.position.set(0, 0, 0); S.capB.position.set(0, 0, 0); S.capT.rotation.set(0, 0, 0);
        PZ = { t: 0, c, click: 0, out: false, pop: false, done: false };
        syncUI();
      }
      function act(a) {
        unlock();
        if (a === 'play') { if (state === 'over') { SFX.ui(); newRun(); } }
        else if (a === 'chars' || a === 'prize') openMenu(a);
        else if (a === 'back') closeMenu();
        else if (a === 'prev') browse(-1);
        else if (a === 'next') browse(1);
        else if (a === 'pick') { if (owned.includes(cIdx)) { pickChar(cIdx); closeMenu(); } else SFX.bump(); }
        else if (a === 'spin') spin();
        else if (a === 'use') { if (PZ && PZ.done) { pickChar(PZ.c); closeMenu(); } }
        else if (a === 'gift') {
          if (!giftReady()) return;
          const n = rint(CFG.gift[0], CFG.gift[1]);
          coins += n; giftAt = Date.now(); persist(); hudCoins(); bumpCoin(); SFX.gift();
          api.toast('Free gift: +' + n + ' coins');
          syncUI();
        }
      }

      function tapAction(d, swipe) {
        if (state === 'run') hop(d);
        else if (state === 'title') { startRun(); hop(d); }
        else if (state === 'over') { if (performance.now() - overAt > 450) newRun(); }
        else if (state === 'chars' && swipe && (d === 'left' || d === 'right')) browse(d === 'left' ? 1 : -1);
      }
      const KEYS = { ArrowUp: 'up', KeyW: 'up', Space: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        const d = KEYS[e.code], c = e.code;
        if (!d && c !== 'Enter' && c !== 'Backspace') return;
        unlock();
        if (state === 'chars') { if (d === 'left' || d === 'right') browse(d === 'left' ? -1 : 1); else if (c === 'Enter') act('pick'); else if (c === 'Backspace') act('back'); return; }
        if (state === 'prize') { if (c === 'Enter' || c === 'Space') act(PZ && PZ.done ? 'use' : 'spin'); else if (c === 'Backspace') act('back'); return; }
        if (state === 'over') { if ((d || c === 'Enter') && performance.now() - overAt > 450) newRun(); return; }
        if (state === 'title') { if (c === 'Enter') startRun(); else if (d) { startRun(); hop(d); } return; }
        if (state === 'run' && d) hop(d);
      });
      const tps = new Map();
      api.on(wrap, 'pointerdown', e => {
        if (e.target.closest && e.target.closest('button')) return;
        unlock();
        if (e.pointerType === 'mouse') { if (e.button === 0) tapAction('up'); return; }
        tps.set(e.pointerId, { x: e.clientX, y: e.clientY, f: false });
        if (state === 'run' || state === 'title') P.crouch = true;
      });
      api.on(wrap, 'pointermove', e => {
        const t = tps.get(e.pointerId);
        if (!t || t.f) return;
        const dx = e.clientX - t.x, dy = e.clientY - t.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < CFG.swipe) return;
        t.f = true; P.crouch = false;
        tapAction(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), true);
      });
      const pUp = e => {
        const t = tps.get(e.pointerId);
        if (!t) return;
        tps.delete(e.pointerId);
        if (!tps.size) P.crouch = false;
        if (!t.f && e.type === 'pointerup') tapAction('up');
      };
      api.on(wrap, 'pointerup', pUp);
      api.on(wrap, 'pointercancel', pUp);
      api.on(wrap, 'click', e => { const b = e.target.closest && e.target.closest('[data-a]'); if (b) act(b.dataset.a); });
      api.on(wrap, 'contextmenu', e => e.preventDefault());
      api.interval(() => { if (state === 'title' || state === 'over') el.gift.hidden = !giftReady(); }, 1000);

      function moveRows(hh) {
        const L = CFG.loop, H2 = L / 2;
        for (const row of rows.values()) {
          if (row.movers.length) {
            const dx = row.dir * row.speed * hh;
            for (const m of row.movers) {
              m.x += dx;
              if (dx > 0 && m.x - m.len / 2 > H2) m.x -= L;
              else if (dx < 0 && m.x + m.len / 2 < -H2) m.x += L;
              m.mesh.position.x = m.x;
            }
          }
          const R = row.rail;
          if (!R) continue;
          if (R.train) {
            const t = R.train;
            t.x += row.dir * CFG.trainSpeed * hh; t.mesh.position.x = t.x;
            if (t.x * row.dir > CFG.half + 2 + t.len / 2) { give(t.mesh); R.train = null; R.timer = rnd(CFG.trainGap[0], CFG.trainGap[1]) - diff(row.r) * 1.5; }
          } else {
            R.timer -= hh;
            if (R.timer <= 0) {
              const ci = rint(0, TRAINS.length - 1), m = take('train' + ci, () => build(B => trainParts(B, TRAINS[ci][0], TRAINS[ci][1])));
              m.rotation.y = row.dir > 0 ? 0 : Math.PI;
              R.train = { x: -row.dir * (CFG.half + 2 + TRAIN_LEN / 2), len: TRAIN_LEN, mesh: m };
              m.position.set(R.train.x, 0, -row.r);
              if ((state === 'run' || state === 'title') && Math.abs(row.r - P.r) <= 5) SFX.train();
            }
          }
          R.warn = (!R.train && R.timer < CFG.trainWarn) || (!!R.train && Math.abs(R.train.x) < CFG.half + R.train.len / 2 + 2);
          if (R.warn && !R.train && (state === 'run' || state === 'title') && Math.abs(row.r - P.r) <= 5) { R.bell -= hh; if (R.bell <= 0) { R.bell = 0.34; SFX.bell(); } }
          else R.bell = 0;
        }
      }
      function collide() {
        const rr = Math.round(P.rf);
        if (Math.abs(P.rf - rr) > 0.36) return;
        const row = rows.get(rr);
        if (!row) return;
        if (row.type === 'road') { for (const m of row.movers) if (Math.abs(P.x - m.x) < m.len / 2 + 0.22) return die(P.hop ? 'side' : 'car', row); }
        else if (row.type === 'rail' && row.rail.train) { const t = row.rail.train; if (Math.abs(P.x - t.x) < t.len / 2 + 0.3) die('train', row); }
      }
      function honk(hh) {
        hornCD -= hh;
        if (hornCD > 0 || P.hop) return;
        for (const dr of [0, 1]) {
          const row = rows.get(P.r + dr);
          if (!row || row.type !== 'road') continue;
          for (const m of row.movers) {
            const gap = (P.x - m.x) * row.dir;
            if (gap > 0 && gap < m.len / 2 + 2 + row.speed * 0.3) { SFX.horn(); hornCD = rnd(3, 6); return; }
          }
        }
      }
      function tick(hh) {
        clock += hh;
        moveRows(hh);
        if (state !== 'run') return;
        if (P.hop) {
          const hp = P.hop;
          hp.t += hh / CFG.hopTime;
          if (hp.drift) { hp.fx += hp.drift * hh; hp.tx += hp.drift * hh; }
          const e = Math.min(1, hp.t);
          P.x = hp.fx + (hp.tx - hp.fx) * e; P.rf = hp.fr + (hp.tr - hp.fr) * e; P.y = hp.fy + (hp.ty - hp.fy) * e;
          if (hp.t >= 1) land();
        } else if (P.log) {
          P.x = P.log.x + P.off;
          if (Math.abs(P.x) > CFG.cols + 0.6) return die('drift');
        }
        if (state !== 'run') return;
        collide();
        if (state !== 'run') return;
        honk(hh);
        if (started) { idle += hh; if (idle > CFG.eagleIdle && !P.hop) die('eagle'); }
      }

      function drawPlayer(dt) {
        let sy = 1, sxz = 1, arc = 0;
        if (P.hop) { const s = Math.sin(Math.PI * Math.min(1, P.hop.t)); arc = CFG.hopArc * s; sy = 1 + 0.2 * s; sxz = 1 - 0.08 * s; }
        else if (P.sq > 0) { P.sq = Math.max(0, P.sq - dt); const k = P.sq / 0.1; sy = 1 - 0.26 * k; sxz = 1 + 0.14 * k; }
        else if (P.crouch) { sy = 0.74; sxz = 1.14; }
        else if (P.bump > 0) { P.bump = Math.max(0, P.bump - dt); arc = 0.14 * Math.sin(Math.PI * (1 - P.bump / 0.14)); }
        else sy = 1 + Math.sin(clock * 4.5) * 0.015;
        P.face = angTo(P.face, P.faceT, 1 - Math.exp(-40 * dt));
        P.snap = damp(P.snap, 0, 30, dt);
        chick.position.set(P.x + P.snap, P.y + arc, -P.rf);
        chick.rotation.set(0, P.face, 0);
        chick.scale.set(sxz * CS, sy * CS, sxz * CS);
      }
      function drawDying(dt) {
        deathT += dt;
        if (deathKind === 'train') {
          P.vy -= 24 * dt; P.x += P.vx * dt; P.y = Math.max(-0.4, P.y + P.vy * dt); P.rf += P.vz * dt;
          chick.position.set(P.x, P.y, -P.rf); chick.rotation.z += 14 * dt; chick.rotation.x += 8 * dt;
        } else if (deathKind === 'water' || deathKind === 'drift') {
          P.y -= (deathT < 0.08 ? 0 : 2.6) * dt; chick.position.y = P.y;
          if (P.y < -1.1) chick.visible = false;
          if (deathT < 0.35 && Math.random() < 0.5) emit(P.x + rnd(-.3, .3), -0.28, -P.rf + rnd(-.3, .3), 0, rnd(1.5, 2.5), 0, .35, .08, FOAM, 6);
        } else if (deathKind === 'eagle') {
          E.t += dt;
          const T1 = 0.55;
          let y, z;
          if (E.t < T1) { const u = 1 - E.t / T1; z = E.z - 14 * u; y = 1.0 + 7 * u * u; }
          else { const u = E.t - T1; z = E.z + u * 16; y = 1.0 + u * u * 7; }
          eagle.position.set(E.x, y, z);
          const fl = Math.sin(E.t * 24) * 0.7;
          wL.rotation.z = fl; wR.rotation.z = -fl;
          if (!E.grabbed && E.t >= T1) { E.grabbed = true; shake = 0.4; SFX.grab(); burst(12, E.x, .6, E.z, 2.6, 3, .8, .09, ['#ffffff', '#f1f2f6', '#8a5a34'], 10); }
          if (E.grabbed) { chick.position.set(E.x, y - 0.95, z + 0.1); chick.rotation.set(-0.5, Math.PI, 0); chick.scale.setScalar(CS); }
          else drawPlayer(dt);
        }
      }
      const tmpV = new THREE.Vector3();
      function drawShow(dt, tx, tz) {
        const S = show;
        if (!S || !S.g.visible) return;
        const s = 3.2 / OFFN.y;
        S.g.position.set(tx + OFFN.x * s, 3.2, tz + OFFN.z * s);
        if (S.car.visible) {
          S.car.position.x = damp(S.car.position.x, -cIdx * 2, 12, dt);
          S.ms.forEach((m, i) => {
            const on = i === cIdx, k = damp(m.scale.x, on ? 2.7 : 1.6, 12, dt);
            m.scale.setScalar(k);
            m.material = owned.includes(i) ? plain : silMat;
            m.rotation.y = on ? Math.PI + Math.sin(clock * 1.6) * 0.7 : Math.PI;
            m.position.y = on ? Math.abs(Math.sin(clock * 5)) * 0.12 : 0;
          });
        }
        if (PZ) {
          PZ.t += dt;
          const t = PZ.t;
          if (t < 0.9) { S.crank.rotation.z = -t * 11; S.mach.rotation.z = Math.sin(t * 40) * 0.025; if (t > PZ.click) { PZ.click += 0.15; SFX.click(); } }
          else S.mach.rotation.z = 0;
          if (t >= 0.9 && !PZ.out) { PZ.out = true; S.cap.visible = true; SFX.drop(); }
          if (t >= 0.9 && !PZ.pop) { const u = Math.min(1, (t - 0.9) / 0.8); S.cap.position.set(0, 0.36 + Math.abs(Math.sin(u * Math.PI * 2.5)) * 0.8 * (1 - u), 1.0 + u * 0.6); S.cap.rotation.y = u * 5; S.cap.scale.setScalar(1.9); }
          if (t >= 1.75 && !PZ.pop) {
            PZ.pop = true; S.cap.visible = false; S.mach.visible = false;
            S.rev.geometry = charGeo(PZ.c); S.rev.visible = true; S.rev.position.set(0, 0, 0.5);
            S.g.updateMatrixWorld(); S.rev.getWorldPosition(tmpV);
            burst(36, tmpV.x, tmpV.y + 0.6, tmpV.z, 4, 6, 1, .12, ['#ffffff', '#ffd23f', '#ff5e8a', '#4cd137', '#3d8bff'], 9);
            shake = 0.2; SFX.reveal();
          }
          if (PZ.pop) { const u = Math.min(1, (t - 1.75) / 0.45); S.rev.scale.setScalar(2.8 * u * (1 + Math.sin(u * Math.PI) * 0.35)); S.rev.rotation.y = Math.PI + Math.sin(clock * 1.6) * 0.7; }
          if (t >= 2.3 && !PZ.done) { PZ.done = true; updPrize(); }
        }
      }

      api.loop(dt => {
        acc += dt;
        let n = 0;
        while (acc >= CFG.step && n < 8) { tick(CFG.step); acc -= CFG.step; n++; }
        if (n >= 8) acc = 0;
        if (state === 'run' || state === 'title') drawPlayer(dt);
        else if (state === 'dying') drawDying(dt);
        if (state === 'run' && started) camTarget += CFG.camCreep * (1 + diff(maxR)) * dt;
        camTarget = Math.max(camTarget, P.rf);
        camRow = damp(camRow, camTarget, 5, dt);
        camX = damp(camX, clamp(P.x * 0.5, -2, 2), 3, dt);
        shake = damp(shake, 0, 7, dt);
        const tx = camX, tz = -(camRow + CFG.camAhead + (portrait ? 0.7 : 0));
        cam.position.set(tx + OFF.x + (Math.random() - 0.5) * shake, OFF.y + (Math.random() - 0.5) * shake, tz + OFF.z);
        cam.lookAt(tx, 0, tz);
        cam.updateMatrixWorld();
        sun.position.set(tx + SUN.x, SUN.y, tz + SUN.z); sun.target.position.set(tx, 0, tz);
        if (state === 'run' && started && !P.hop) { tmpV.set(P.x, P.y, -P.rf).project(cam); if (tmpV.y < -1.04) die('eagle'); }
        for (const row of rows.values()) {
          if (row.coin) { const m = row.coin.mesh; m.rotation.y = clock * 3; m.position.y = row.top + 0.42 + Math.sin(clock * 3 + row.r) * 0.05; }
          if (row.rail) { const R = row.rail, on = R.warn && Math.floor(clock * 6) % 2 === 0; R.lamps[0].material = on ? lampOn : lampOff; R.lamps[1].material = R.warn && !on ? lampOn : lampOff; }
        }
        drawShow(dt, tx, tz);
        stepParts(dt);
        ensureRows();
        renderer.render(scene, cam);
      });

      resetWorld();
      syncUI();
      return {
        destroy() {
          const bin = new Set();
          scene.traverse(o => { if (o.geometry) bin.add(o.geometry); const m = o.material; if (m) for (const x of Array.isArray(m) ? m : [m]) bin.add(x); });
          for (const g of geoC.values()) bin.add(g);
          for (const g of cgeo) if (g) bin.add(g);
          for (const x of [vlam, plain, silMat, coinMat, lampOn, lampOff, lampGeo, sigGeo, coinGeo]) bin.add(x);
          bin.forEach(x => x && x.dispose && x.dispose());
          if (ac) { try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {} ac = null; }
        }
      };
    }
  });
  const COVER = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#8fe05a"/><g transform="skewY(14)"><rect x="-10" y="-140" width="420" height="80" fill="#9ade5c"/><rect x="-10" y="-60" width="420" height="50" fill="#a39383"/><path d="M-10 -35H410" stroke="#7a5236" stroke-width="40" stroke-dasharray="8 10"/><path d="M-10 -46H410M-10 -24H410" stroke="#d4d9e2" stroke-width="5"/><rect x="-10" y="-10" width="420" height="40" fill="#a2e05f"/><rect x="-10" y="30" width="420" height="100" fill="#555a67"/><path d="M-10 80H410" stroke="#eef1f5" stroke-width="5" stroke-dasharray="26 20"/><rect x="-10" y="130" width="420" height="55" fill="#99da58"/><rect x="-10" y="185" width="420" height="140" fill="#55c9f5"/><rect x="-10" y="185" width="420" height="6" fill="#d8f4ff"/><path d="M60 205h40M250 214h50M120 300h44" stroke="#8fe0fa" stroke-width="4"/><rect x="10" y="222" width="150" height="14" fill="#b9824f"/><rect x="10" y="236" width="150" height="14" fill="#9a6538"/><rect x="156" y="236" width="6" height="14" fill="#e9c08c"/><rect x="236" y="262" width="180" height="14" fill="#b9824f"/><rect x="236" y="276" width="180" height="14" fill="#9a6538"/><rect x="232" y="276" width="6" height="14" fill="#e9c08c"/><rect x="44" y="78" width="96" height="9" fill="#000" opacity=".2"/><rect x="58" y="34" width="52" height="10" fill="#ff8a8a"/><rect x="58" y="44" width="52" height="12" fill="#34466a"/><rect x="40" y="56" width="94" height="11" fill="#ff8a8a"/><rect x="40" y="66" width="94" height="15" fill="#ff4d4d"/><rect x="130" y="68" width="5" height="6" fill="#fff3b0"/><rect x="48" y="78" width="17" height="11" fill="#1d1b26"/><rect x="108" y="78" width="17" height="11" fill="#1d1b26"/><rect x="246" y="124" width="156" height="9" fill="#000" opacity=".2"/><rect x="240" y="82" width="118" height="16" fill="#ffffff"/><rect x="240" y="98" width="118" height="26" fill="#e3e6ee"/><rect x="240" y="112" width="118" height="6" fill="#3d8bff"/><rect x="362" y="94" width="38" height="10" fill="#7cb2ff"/><rect x="362" y="104" width="38" height="21" fill="#3d8bff"/><rect x="384" y="106" width="13" height="8" fill="#34466a"/><rect x="250" y="122" width="17" height="11" fill="#1d1b26"/><rect x="296" y="122" width="17" height="11" fill="#1d1b26"/><rect x="372" y="122" width="17" height="11" fill="#1d1b26"/><rect x="318" y="-22" width="36" height="12" fill="#5cc65a"/><rect x="318" y="-10" width="36" height="28" fill="#3fae49"/><rect x="331" y="18" width="10" height="10" fill="#8b5a3c"/><rect x="336" y="120" width="38" height="12" fill="#55c25a"/><rect x="336" y="132" width="38" height="34" fill="#38a043"/><rect x="350" y="166" width="10" height="12" fill="#8b5a3c"/><rect x="-6" y="124" width="36" height="12" fill="#5cc65a"/><rect x="-6" y="136" width="36" height="32" fill="#3fae49"/><rect x="7" y="168" width="10" height="10" fill="#8b5a3c"/><rect x="60" y="156" width="40" height="8" fill="#b9c0ce"/><rect x="60" y="164" width="40" height="14" fill="#9aa3b5"/><rect x="-10" y="-140" width="36" height="470" fill="#0b1a10" opacity=".22"/><rect x="374" y="-140" width="36" height="470" fill="#0b1a10" opacity=".22"/></g><g fill="#ffd23f" stroke="#c27a00" stroke-width="4"><rect x="292" y="104" width="24" height="24" rx="5"/><rect x="150" y="66" width="22" height="22" rx="5"/></g><ellipse cx="198" cy="232" rx="27" ry="7" fill="#000" opacity=".2"/><path d="M128 176h22M122 192h26M132 208h16" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/><g transform="translate(172 140)"><rect x="12" y="62" width="6" height="12" fill="#ff9f1c"/><rect x="30" y="62" width="6" height="12" fill="#ff9f1c"/><path d="M44 26l10-6v40l-10 6z" fill="#dfe3ea"/><rect x="0" y="26" width="44" height="40" fill="#ffffff"/><path d="M0 26l10-6h44l-10 6z" fill="#f4f5f9"/><rect x="-5" y="34" width="5" height="18" fill="#e3e6ee"/><path d="M38 -4l8-5v30l-8 5z" fill="#dfe3ea"/><rect x="6" y="-4" width="32" height="30" fill="#ffffff"/><path d="M6 -4l8-5h32l-8 5z" fill="#f4f5f9"/><rect x="17" y="-18" width="10" height="13" fill="#ff3b4e"/><rect x="12" y="4" width="4" height="7" fill="#1d1b26"/><rect x="28" y="4" width="4" height="7" fill="#1d1b26"/><rect x="16" y="11" width="12" height="8" fill="#ff9f1c"/><rect x="19" y="19" width="6" height="6" fill="#ff3b4e"/><rect x="0" y="26" width="44" height="7" fill="#2f80ed"/><path d="M44 26l10-6v7l-10 6z" fill="#1f63c4"/></g></svg>`;
  Ameplay.covers[ID] = COVER;
  try { Object.defineProperty(Ameplay.covers, ID, { get: () => COVER, set() {}, enumerable: true, configurable: true }); } catch (e) {}
})();

