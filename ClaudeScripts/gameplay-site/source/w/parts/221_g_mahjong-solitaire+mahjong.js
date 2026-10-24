
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const FCJK = '"Noto Serif CJK TC","Noto Serif TC","Songti TC","PMingLiU","MingLiU","Yu Mincho","Hiragino Mincho ProN","SimSun","Microsoft JhengHei","Microsoft YaHei",serif';
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NUMS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const KNAME = ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'East', 'South', 'West', 'North', 'White', 'Green', 'Red', 'Plum', 'Orchid', 'Chrysanthemum', 'Bamboo', 'Spring', 'Summer', 'Autumn', 'Winter'];
  const KLONG = k => k < 9 ? (k + 1) + ' of Characters' : k < 18 ? (k - 8) + ' of Circles' : k < 27 ? (k - 17) + ' of Bamboo' : k < 31 ? KNAME[k] + ' Wind' : k < 34 ? KNAME[k] + ' Dragon' : KNAME[k];

  let cjkOK = null;
  function hasCJK() {
    if (cjkOK !== null) return cjkOK;
    cjkOK = true;
    try {
      const c = document.createElement('canvas'); c.width = 44; c.height = 44;
      const x = c.getContext('2d', { willReadFrequently: true });
      const sig = ch => {
        x.clearRect(0, 0, 44, 44); x.font = '32px ' + FCJK; x.fillStyle = '#000'; x.textBaseline = 'alphabetic'; x.fillText(ch, 4, 34);
        const d = x.getImageData(0, 0, 44, 44).data; let a = 0, b = 0;
        for (let i = 3; i < d.length; i += 4) { a += d[i]; b += d[i] * (i % 997); }
        return a + ':' + b;
      };
      cjkOK = sig('萬') !== sig('龘') && sig('發') !== sig('龘') && sig('東') !== sig('龘');
    } catch (e) { cjkOK = true; }
    return cjkOK;
  }
  function rrp(x, px, py, w, h, r) {
    x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
  }
  function glyph(x, ch, fb, size, col, cx, cy, wgt, emboss) {
    x.font = (wgt || 800) + ' ' + size + 'px ' + (hasCJK() ? FCJK : FONT);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const s = hasCJK() ? ch : fb;
    if (emboss) { x.fillStyle = 'rgba(255,255,255,.95)'; x.fillText(s, cx + emboss, cy + emboss); }
    x.fillStyle = col; x.fillText(s, cx, cy);
  }

  const PINC = { G: ['#0b6d38', '#1fae5c'], R: ['#b9121a', '#ee3d45'], B: ['#10357f', '#3375d6'] };
  function disc(x, cx, cy, r, c) {
    const [d, l] = PINC[c];
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fillStyle = d; x.fill();
    x.beginPath(); x.arc(cx, cy, r * .8, 0, TAU); x.fillStyle = '#fcfbf3'; x.fill();
    x.beginPath(); x.arc(cx, cy, r * .66, 0, TAU); x.fillStyle = l; x.fill();
    if (r > 5) {
      x.fillStyle = '#fcfbf3';
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8; x.beginPath(); x.arc(cx + Math.cos(a) * r * .42, cy + Math.sin(a) * r * .42, r * .11, 0, TAU); x.fill(); }
    }
    x.beginPath(); x.arc(cx, cy, r * .27, 0, TAU); x.fillStyle = d; x.fill();
    x.beginPath(); x.arc(cx, cy, r * .11, 0, TAU); x.fillStyle = '#fcfbf3'; x.fill();
  }
  function bigDisc(x, cx, cy, r) {
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fillStyle = PINC.B[0]; x.fill();
    x.beginPath(); x.arc(cx, cy, r * .92, 0, TAU); x.fillStyle = '#fcfbf3'; x.fill();
    x.beginPath(); x.arc(cx, cy, r * .86, 0, TAU); x.fillStyle = PINC.G[0]; x.fill();
    x.beginPath(); x.arc(cx, cy, r * .7, 0, TAU); x.fillStyle = '#fcfbf3'; x.fill();
    for (let i = 0; i < 12; i++) {
      const a = i * TAU / 12; x.beginPath(); x.arc(cx + Math.cos(a) * r * .78, cy + Math.sin(a) * r * .78, r * .045, 0, TAU); x.fillStyle = PINC.G[1]; x.fill();
    }
    for (let i = 0; i < 8; i++) {
      x.save(); x.translate(cx, cy); x.rotate(i * TAU / 8);
      x.beginPath(); x.ellipse(0, -r * .39, r * .13, r * .24, 0, 0, TAU); x.fillStyle = i % 2 ? PINC.R[1] : PINC.R[0]; x.fill();
      x.restore();
    }
    x.beginPath(); x.arc(cx, cy, r * .2, 0, TAU); x.fillStyle = '#f2b81c'; x.fill();
    x.beginPath(); x.arc(cx, cy, r * .08, 0, TAU); x.fillStyle = PINC.R[0]; x.fill();
  }
  const SC = { G: ['#0a6a33', '#34c46f'], R: ['#a3101a', '#f0525a'], B: ['#0e3a86', '#4684e6'] };
  function stick(x, cx, cy, len, sw, c, tilt) {
    x.save(); x.translate(cx, cy); x.rotate(tilt || 0);
    const [d, l] = SC[c], g = x.createLinearGradient(-sw / 2, 0, sw / 2, 0);
    g.addColorStop(0, d); g.addColorStop(.4, l); g.addColorStop(1, d);
    rrp(x, -sw / 2, -len / 2, sw, len, sw * .42); x.fillStyle = g; x.fill();
    x.lineWidth = Math.max(.5, sw * .08); x.strokeStyle = 'rgba(0,0,0,.45)'; x.stroke();
    x.fillStyle = d;
    x.fillRect(-sw / 2, -sw * .14, sw, sw * .28);
    x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(-sw * .32, -sw * .14, sw * .64, Math.max(.5, sw * .06));
    x.fillStyle = d;
    x.fillRect(-sw / 2, -len / 2 + len * .17, sw, sw * .18); x.fillRect(-sw / 2, len / 2 - len * .17 - sw * .18, sw, sw * .18);
    x.restore();
  }
  function bird(x, w, h) {
    x.save(); x.translate(w / 2, h / 2); x.scale(w / 100, h / 130);
    const fan = [[-64, '#0e3a86'], [-44, '#0a6a33'], [-24, '#d4a017'], [-4, '#a3101a'], [16, '#0a6a33']];
    for (const [a, c] of fan) {
      x.save(); x.translate(-8, 14); x.rotate((a - 20) * Math.PI / 180);
      x.beginPath(); x.ellipse(0, 28, 9, 30, 0, 0, TAU); x.fillStyle = c; x.fill();
      x.beginPath(); x.ellipse(0, 46, 4.5, 6, 0, 0, TAU); x.fillStyle = '#fcfbf3'; x.fill();
      x.beginPath(); x.arc(0, 46, 2.2, 0, TAU); x.fillStyle = '#0e3a86'; x.fill();
      x.restore();
    }
    x.beginPath(); x.ellipse(0, 6, 24, 16, -.35, 0, TAU); x.fillStyle = '#0a8a45'; x.fill();
    x.beginPath(); x.ellipse(-4, 8, 14, 8, -.5, 0, TAU); x.fillStyle = '#a3101a'; x.fill();
    x.beginPath(); x.ellipse(2, 7, 9, 4, -.5, 0, TAU); x.fillStyle = '#f0525a'; x.fill();
    x.beginPath(); x.moveTo(12, -2); x.quadraticCurveTo(26, -14, 24, -34); x.lineTo(34, -34); x.quadraticCurveTo(36, -10, 20, 8); x.closePath(); x.fillStyle = '#0a8a45'; x.fill();
    x.beginPath(); x.arc(30, -38, 10, 0, TAU); x.fillStyle = '#0a8a45'; x.fill();
    x.beginPath(); x.moveTo(39, -40); x.lineTo(52, -35); x.lineTo(39, -33); x.closePath(); x.fillStyle = '#f2a516'; x.fill();
    x.beginPath(); x.arc(32, -40, 2.6, 0, TAU); x.fillStyle = '#fff'; x.fill();
    x.beginPath(); x.arc(32.6, -40, 1.3, 0, TAU); x.fillStyle = '#111'; x.fill();
    x.strokeStyle = '#a3101a'; x.lineWidth = 2.4; x.lineCap = 'round';
    for (const a of [-10, 0, 10]) { x.beginPath(); x.moveTo(28, -48); x.lineTo(28 + a * .5, -58); x.stroke(); }
    x.strokeStyle = '#b8860b'; x.lineWidth = 2.4;
    x.beginPath(); x.moveTo(4, 20); x.lineTo(2, 34); x.moveTo(10, 20); x.lineTo(12, 34); x.stroke();
    x.strokeStyle = '#0a6a33'; x.lineWidth = 5; x.beginPath(); x.moveTo(-26, 36); x.lineTo(30, 36); x.stroke();
    x.fillStyle = '#0a6a33'; x.fillRect(-4, 33.5, 3, 5);
    x.restore();
  }
  const SOU = {
    2: [[.5, .27, 'G'], [.5, .73, 'B']],
    3: [[.5, .27, 'G'], [.3, .73, 'G'], [.7, .73, 'G']],
    4: [[.3, .27, 'G'], [.7, .27, 'B'], [.3, .73, 'B'], [.7, .73, 'G']],
    5: [[.3, .26, 'G'], [.7, .26, 'G'], [.5, .5, 'R'], [.3, .74, 'G'], [.7, .74, 'G']],
    6: [[.2, .27, 'G'], [.5, .27, 'B'], [.8, .27, 'G'], [.2, .73, 'G'], [.5, .73, 'B'], [.8, .73, 'G']],
    7: [[.5, .18, 'R'], [.2, .5, 'G'], [.5, .5, 'B'], [.8, .5, 'G'], [.2, .83, 'G'], [.5, .83, 'B'], [.8, .83, 'G']],
    8: [[.17, .27, 'G', .38], [.39, .27, 'G', -.38], [.61, .27, 'G', .38], [.83, .27, 'G', -.38], [.17, .73, 'G', -.38], [.39, .73, 'G', .38], [.61, .73, 'G', -.38], [.83, .73, 'G', .38]],
    9: [[.2, .17, 'G'], [.5, .17, 'G'], [.8, .17, 'G'], [.2, .5, 'R'], [.5, .5, 'R'], [.8, .5, 'R'], [.2, .83, 'B'], [.5, .83, 'B'], [.8, .83, 'B']]
  };
  const PIN = {
    2: [[.5, .27, 'G'], [.5, .73, 'R']],
    3: [[.27, .2, 'B'], [.5, .5, 'R'], [.73, .8, 'G']],
    4: [[.3, .27, 'G'], [.7, .27, 'B'], [.3, .73, 'B'], [.7, .73, 'G']],
    5: [[.3, .25, 'G'], [.7, .25, 'B'], [.5, .5, 'R'], [.3, .75, 'B'], [.7, .75, 'G']],
    6: [[.3, .2, 'G'], [.7, .2, 'G'], [.3, .58, 'R'], [.7, .58, 'R'], [.3, .84, 'R'], [.7, .84, 'R']],
    7: [[.25, .15, 'G'], [.5, .26, 'G'], [.75, .37, 'G'], [.3, .65, 'R'], [.7, .65, 'R'], [.3, .87, 'R'], [.7, .87, 'R']],
    8: [[.3, .14, 'B'], [.7, .14, 'B'], [.3, .38, 'B'], [.7, .38, 'B'], [.3, .62, 'B'], [.7, .62, 'B'], [.3, .86, 'B'], [.7, .86, 'B']],
    9: [[.2, .17, 'G'], [.5, .17, 'G'], [.8, .17, 'G'], [.2, .5, 'R'], [.5, .5, 'R'], [.8, .5, 'R'], [.2, .83, 'B'], [.5, .83, 'B'], [.8, .83, 'B']]
  };
  function petals(x, n, r0, rl, rw, col, rot) {
    for (let i = 0; i < n; i++) {
      x.save(); x.rotate(rot + i * TAU / n);
      x.beginPath(); x.ellipse(0, -r0 - rl / 2, rw, rl / 2, 0, 0, TAU); x.fillStyle = col; x.fill();
      x.restore();
    }
  }
  function flowerArt(x, k, w, h) {
    const cx = w / 2, cy = h * .4, u = w / 64;
    x.save(); x.translate(cx, cy); x.scale(u, u);
    if (k === 34) {
      x.strokeStyle = '#6b3a1f'; x.lineWidth = 2.6; x.lineCap = 'round';
      x.beginPath(); x.moveTo(-22, 26); x.quadraticCurveTo(-4, 10, 14, 14); x.quadraticCurveTo(24, 16, 24, 2); x.stroke();
      for (const [px, py, s] of [[0, -2, 1], [-18, 14, .7], [22, 0, .75], [10, -16, .55]]) {
        x.save(); x.translate(px, py); x.scale(s, s);
        petals(x, 5, 3, 10, 6.2, '#ee6a98', 0);
        x.beginPath(); x.arc(0, 0, 3.2, 0, TAU); x.fillStyle = '#f7d54b'; x.fill();
        x.restore();
      }
    } else if (k === 35) {
      x.strokeStyle = '#1a8a45'; x.lineWidth = 3.4; x.lineCap = 'round';
      for (const a of [-1, 0, 1]) { x.beginPath(); x.moveTo(a * 4, 28); x.quadraticCurveTo(a * 20, 4, a * 26 + (a ? 0 : 0), -16 + (a ? 6 : 0)); x.stroke(); }
      x.save(); x.translate(0, -8);
      for (const a of [-1, 1]) { x.save(); x.rotate(a * .9); x.beginPath(); x.ellipse(0, -9, 5, 11, 0, 0, TAU); x.fillStyle = '#a45bd6'; x.fill(); x.restore(); }
      x.beginPath(); x.ellipse(0, -10, 5.5, 12, 0, 0, TAU); x.fillStyle = '#c387ee'; x.fill();
      x.beginPath(); x.ellipse(0, 4, 7, 5, 0, 0, TAU); x.fillStyle = '#7b3fb0'; x.fill();
      x.beginPath(); x.arc(0, 3, 2, 0, TAU); x.fillStyle = '#f7d54b'; x.fill();
      x.restore();
    } else if (k === 36) {
      petals(x, 18, 2, 19, 2.6, '#f2a516', 0);
      petals(x, 14, 2, 14, 2.9, '#f7c948', .2);
      petals(x, 10, 1, 8, 2.8, '#ffe27a', .1);
      x.beginPath(); x.arc(0, 0, 3.2, 0, TAU); x.fillStyle = '#b9651a'; x.fill();
    } else {
      x.strokeStyle = '#0f8a47'; x.lineWidth = 5.4; x.lineCap = 'round';
      for (const sx of [-9, 9]) { x.beginPath(); x.moveTo(sx, 28); x.lineTo(sx + (sx < 0 ? -2 : 2), -26); x.stroke(); }
      x.strokeStyle = '#0a5f2e'; x.lineWidth = 2;
      for (const sx of [-9, 9]) for (const yy of [-12, 2, 16]) { x.beginPath(); x.moveTo(sx - 4, yy); x.lineTo(sx + 4, yy); x.stroke(); }
      x.fillStyle = '#25b565';
      for (const [px, py, a] of [[-12, -18, -.9], [14, -8, .9], [-14, 6, -1.2], [16, 12, 1.2]]) { x.save(); x.translate(px, py); x.rotate(a); x.beginPath(); x.ellipse(0, -8, 3.6, 10, 0, 0, TAU); x.fill(); x.restore(); }
    }
    x.restore();
  }
  function seasonArt(x, k, w, h) {
    const cx = w / 2, cy = h * .4, u = w / 64;
    x.save(); x.translate(cx, cy); x.scale(u, u);
    if (k === 38) {
      petals(x, 5, 3, 12, 6.5, '#f58aa8', .3);
      petals(x, 5, 2, 8, 4, '#ffd0dc', .6);
      x.beginPath(); x.arc(0, 0, 3.4, 0, TAU); x.fillStyle = '#f7d54b'; x.fill();
    } else if (k === 39) {
      x.fillStyle = '#f7a21b';
      for (let i = 0; i < 12; i++) { x.save(); x.rotate(i * TAU / 12); x.beginPath(); x.moveTo(-3, -13); x.lineTo(0, -24); x.lineTo(3, -13); x.closePath(); x.fill(); x.restore(); }
      x.beginPath(); x.arc(0, 0, 12.5, 0, TAU); x.fillStyle = '#ffcf3a'; x.fill();
      x.beginPath(); x.arc(0, 0, 8, 0, TAU); x.fillStyle = '#ff9a1a'; x.fill();
    } else if (k === 40) {
      x.beginPath(); x.moveTo(0, -24); x.lineTo(6, -14); x.lineTo(16, -18); x.lineTo(12, -6); x.lineTo(24, -4); x.lineTo(14, 6); x.lineTo(20, 14); x.lineTo(6, 14); x.lineTo(4, 26); x.lineTo(0, 16); x.lineTo(-4, 26); x.lineTo(-6, 14); x.lineTo(-20, 14); x.lineTo(-14, 6); x.lineTo(-24, -4); x.lineTo(-12, -6); x.lineTo(-16, -18); x.lineTo(-6, -14); x.closePath();
      x.fillStyle = '#e0561b'; x.fill(); x.lineWidth = 1.4; x.strokeStyle = '#8c2b0a'; x.stroke();
      x.beginPath(); x.moveTo(0, -18); x.lineTo(0, 24); x.stroke();
    } else {
      x.strokeStyle = '#3d86d6'; x.lineWidth = 3; x.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        x.save(); x.rotate(i * Math.PI / 3);
        x.beginPath(); x.moveTo(0, -24); x.lineTo(0, 24); x.stroke();
        for (const s of [-1, 1]) for (const yy of [-14, 14]) { x.beginPath(); x.moveTo(0, yy); x.lineTo(7, yy + s * 7); x.moveTo(0, yy); x.lineTo(-7, yy + s * 7); x.stroke(); }
        x.restore();
      }
    }
    x.restore();
  }

  function faceArt(x, kind, w, h, red) {
    const cx = w / 2, cy = h / 2, em = w >= 30 ? Math.max(.4, w * .012) : 0;
    if (kind < 9) {
      glyph(x, NUMS[kind], String(kind + 1), w * .56, red ? '#d1101a' : '#15151a', cx, h * .31, 800, em);
      glyph(x, '萬', 'M', w * .54, '#c4161c', cx, h * .72, 800, em);
      if (red) { x.beginPath(); x.arc(w * .2, h * .16, w * .06, 0, TAU); x.fillStyle = '#d1101a'; x.fill(); }
    } else if (kind < 18) {
      const n = kind - 8;
      const x0 = w * .12, x1 = w * .88, y0 = h * .11, y1 = h * .89, bw = x1 - x0, bh = y1 - y0;
      if (n === 1) { bigDisc(x, cx, cy, w * .37); if (red) { x.beginPath(); x.arc(cx, cy, w * .1, 0, TAU); x.fillStyle = '#d1101a'; x.fill(); } }
      else {
        const r = n <= 3 ? w * .21 : n <= 5 ? w * .175 : n === 6 ? w * .15 : n === 7 ? w * .135 : n === 8 ? w * .125 : w * .135;
        for (const [u, v, c] of PIN[n]) { disc(x, x0 + u * bw, y0 + v * bh, r, c); }
        if (red && n === 5) { disc(x, x0 + .5 * bw, y0 + .5 * bh, r * 1.12, 'R'); x.beginPath(); x.arc(x0 + .5 * bw, y0 + .5 * bh, r * .5, 0, TAU); x.fillStyle = '#d1101a'; x.fill(); x.beginPath(); x.arc(x0 + .5 * bw, y0 + .5 * bh, r * .2, 0, TAU); x.fillStyle = '#fcfbf3'; x.fill(); }
      }
    } else if (kind < 27) {
      const n = kind - 17;
      if (n === 1) { bird(x, w, h); return; }
      const x0 = w * .14, x1 = w * .86, y0 = h * .08, y1 = h * .92, bw = x1 - x0, bh = y1 - y0;
      const rows = n <= 2 ? 2 : n <= 3 ? 2 : n <= 6 ? 2 : n === 7 ? 3 : n === 8 ? 2 : 3;
      const len = n <= 6 || n === 8 ? bh * .45 : bh * .3, sw = w * (n === 9 || n === 7 || n === 6 || n === 8 ? .12 : .145);
      for (const [u, v, c, t] of SOU[n]) {
        let cc = c;
        if (red && n === 5 && c === 'R') cc = 'R';
        stick(x, x0 + u * bw, y0 + v * bh, n === 7 && v < .3 ? bh * .28 : len, sw, cc, t || 0);
      }
      if (red && n === 5) { x.beginPath(); x.arc(w * .2, h * .16, w * .06, 0, TAU); x.fillStyle = '#d1101a'; x.fill(); }
      void rows;
    } else if (kind < 31) {
      glyph(x, ['東', '南', '西', '北'][kind - 27], ['E', 'S', 'W', 'N'][kind - 27], w * .8, '#15151a', cx, cy + h * .01, 800, em);
    } else if (kind === 31) {
      x.lineJoin = 'round';
      rrp(x, w * .17, h * .13, w * .66, h * .74, w * .06); x.lineWidth = w * .07; x.strokeStyle = '#1b4fa8'; x.stroke();
      rrp(x, w * .27, h * .22, w * .46, h * .56, w * .03); x.lineWidth = w * .028; x.strokeStyle = '#4f86dc'; x.stroke();
    } else if (kind === 32) {
      glyph(x, '發', 'F', w * .8, '#0b8a3e', cx, cy + h * .01, 800, em);
    } else if (kind === 33) {
      glyph(x, '中', 'C', w * .82, '#d1101a', cx, cy + h * .01, 800, em);
    } else if (kind < 38) {
      const col = ['#d9366f', '#8f4fc9', '#d98a0c', '#168a47'][kind - 34];
      rrp(x, w * .08, h * .07, w * .84, h * .86, w * .08); x.lineWidth = Math.max(.8, w * .028); x.strokeStyle = col; x.globalAlpha = .55; x.stroke(); x.globalAlpha = 1;
      flowerArt(x, kind, w, h);
      glyph(x, ['梅', '蘭', '菊', '竹'][kind - 34], ['1', '2', '3', '4'][kind - 34], w * .3, col, cx, h * .78, 800, 0);
      x.font = '800 ' + (w * .17) + 'px ' + FONT; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillStyle = col; x.fillText(String(kind - 33), w * .13, h * .1);
    } else {
      const col = ['#d9366f', '#e07a0c', '#c8441c', '#2f78c8'][kind - 38];
      rrp(x, w * .08, h * .07, w * .84, h * .86, w * .08); x.lineWidth = Math.max(.8, w * .028); x.strokeStyle = col; x.globalAlpha = .55; x.stroke(); x.globalAlpha = 1;
      seasonArt(x, kind, w, h);
      glyph(x, ['春', '夏', '秋', '冬'][kind - 38], ['1', '2', '3', '4'][kind - 38], w * .3, col, cx, h * .78, 800, 0);
      x.font = '800 ' + (w * .17) + 'px ' + FONT; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillStyle = col; x.fillText(String(kind - 37), w * .13, h * .1);
    }
  }

  const SPR = new Map();
  const dprNow = () => Math.min(window.devicePixelRatio || 1, 2);
  function sprite(kind, w, o) {
    o = o || {};
    const dpr = dprNow(), key = kind + '|' + w + '|' + (o.red ? 1 : 0) + '|' + (o.shade || 0) + '|' + (o.thin ? 1 : 0) + '|' + dpr;
    let s = SPR.get(key);
    if (s) return s;
    if (SPR.size > 900) SPR.clear();
    const h = Math.round(w * 1.3), d = o.thin ? Math.max(1, Math.round(w * .07)) : Math.max(2, Math.round(w * .13)), cw = w + d, ch = h + d;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(cw * dpr); cv.height = Math.ceil(ch * dpr);
    const x = cv.getContext('2d');
    x.scale(dpr, dpr);
    const r = Math.max(2, w * .13);
    rrp(x, d, d, w, h, r);
    let g = x.createLinearGradient(d, d, d + w, d + h); g.addColorStop(0, '#1d8a58'); g.addColorStop(1, '#0a4f31');
    x.fillStyle = g; x.fill();
    rrp(x, d * .5, d * .5, w, h, r); g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e7dfc0'); g.addColorStop(1, '#bcb28b'); x.fillStyle = g; x.fill();
    x.lineWidth = 1; x.strokeStyle = 'rgba(0,0,0,.42)'; rrp(x, d, d, w, h, r); x.stroke();
    rrp(x, 0, 0, w, h, r);
    if (kind < 0) {
      g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2fa86c'); g.addColorStop(1, '#14744a');
      x.fillStyle = g; x.fill();
      x.save(); rrp(x, 0, 0, w, h, r); x.clip();
      x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = Math.max(.6, w * .02);
      for (let i = -h; i < w + h; i += Math.max(3, w * .17)) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i + h, 0); x.lineTo(i, h); x.stroke(); }
      x.restore();
      rrp(x, w * .1, w * .1, w * .8, h - w * .2, r * .6); x.lineWidth = Math.max(.7, w * .03); x.strokeStyle = 'rgba(255,255,255,.35)'; x.stroke();
    } else {
      g = x.createLinearGradient(0, 0, w * .6, h); g.addColorStop(0, '#fffef8'); g.addColorStop(1, '#f1e9cd');
      x.fillStyle = g; x.fill();
      x.save(); rrp(x, 0, 0, w, h, r); x.clip();
      x.lineWidth = Math.max(1, w * .05); x.strokeStyle = 'rgba(255,255,255,.95)'; rrp(x, w * .02, w * .02, w - w * .04, h - w * .04, r); x.stroke();
      x.lineWidth = Math.max(1, w * .035); x.strokeStyle = 'rgba(150,130,80,.35)'; rrp(x, -w * .01, -w * .01, w + w * .02, h + w * .02, r); x.stroke();
      x.restore();
      x.save(); x.translate(w * .06, h * .05); faceArt(x, kind, w * .88, h * .9, o.red); x.restore();
    }
    x.lineWidth = 1; x.strokeStyle = 'rgba(60,45,20,.5)'; rrp(x, 0, 0, w, h, r); x.stroke();
    if (o.shade) { rrp(x, 0, 0, w, h, r); x.fillStyle = 'rgba(30,50,80,' + o.shade + ')'; x.fill(); }
    s = { cv, w, h, d, cw, ch };
    SPR.set(key, s);
    return s;
  }
  function blit(x, s, px, py, alpha) {
    if (alpha != null && alpha !== 1) { x.save(); x.globalAlpha = alpha; x.drawImage(s.cv, px, py, s.cw, s.ch); x.restore(); }
    else x.drawImage(s.cv, px, py, s.cw, s.ch);
  }
  function tileAt(x, kind, px, py, w, o) {
    o = o || {};
    const s = sprite(kind, w, o);
    if (o.rot) {
      x.save(); x.translate(px + s.w / 2, py + s.h / 2); x.rotate(o.rot); x.translate(-s.w / 2, -s.h / 2);
      blit(x, s, 0, 0, o.alpha); x.restore();
    } else blit(x, s, px, py, o.alpha);
    return s;
  }

  function mkAudio(api) {
    let ac = null, master = null, noise = null;
    function A() {
      if (api.muted) return null;
      if (!ac) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        try { ac = new C(); } catch (e) { return null; }
        master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
        noise = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    }
    function nz(t, dur, f, q, vol, f2) {
      const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur); bp.Q.value = q;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
    }
    function tn(t, dur, type, f0, f1, vol) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
    }
    function play(k) {
      if (!A()) return;
      const t = ac.currentTime + .005;
      try {
        if (k === 'clack') { nz(t, .045, 2100, 1.6, .55); nz(t, .07, 520, 1.2, .35); tn(t, .07, 'sine', 210, 95, .22); }
        else if (k === 'soft') { nz(t, .05, 1500, 1.2, .3); tn(t, .06, 'sine', 160, 90, .12); }
        else if (k === 'select') { tn(t, .06, 'sine', 720, 900, .05); nz(t, .025, 3000, 1, .12); }
        else if (k === 'match') { nz(t, .05, 2200, 1.4, .4); [784, 1047].forEach((f, i) => tn(t + .03 + i * .08, .22, 'sine', f, f, .07)); }
        else if (k === 'bad') { tn(t, .16, 'triangle', 220, 140, .08); }
        else if (k === 'deal') { for (let i = 0; i < 6; i++) nz(t + i * .045, .035, 2400 + Math.random() * 900, 1.3, .24); }
        else if (k === 'shuffle') { for (let i = 0; i < 26; i++) nz(t + i * .03, .04, 1500 + Math.random() * 2000, 1.2, .18); }
        else if (k === 'call') { tn(t, .22, 'sawtooth', 330, 520, .06); tn(t + .1, .26, 'square', 440, 660, .045); nz(t, .05, 2000, 1, .3); }
        else if (k === 'riichi') { tn(t, .3, 'triangle', 880, 880, .07); tn(t + .12, .4, 'triangle', 1318, 1318, .06); nz(t, .06, 1800, 1, .3); }
        else if (k === 'win') [523, 659, 784, 1047, 1318].forEach((f, i) => tn(t + i * .09, .4, 'sine', f, f, .08));
        else if (k === 'lose') { tn(t, .5, 'sine', 330, 150, .07); tn(t + .25, .5, 'sine', 247, 110, .06); }
        else if (k === 'tick') tn(t, .03, 'square', 1500, 1500, .015);
        else if (k === 'hint') { tn(t, .12, 'sine', 988, 988, .05); tn(t + .1, .16, 'sine', 1319, 1319, .05); }
        else if (k === 'turn') { tn(t, .09, 'sine', 660, 660, .045); }
      } catch (e) {}
    }
    return play;
  }

  const H = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };


  const MJ_LAYOUTS = (() => {
    const out = [];
    const mk = (id, name, blurb, f) => {
      const t = [];
      const add = (c, r, z) => t.push([Math.round(c * 2), Math.round(r * 2), z]);
      const asc = (z, r0, c0, rows, dc, dr) => rows.forEach((s, r) => { for (let c = 0; c < s.length; c++) if (s[c] === 'X') add(c0 + c + (dc || 0), r0 + r + (dr || 0), z); });
      const box = (z, c0, r0, cw, rh, dc, dr) => { for (let r = 0; r < rh; r++) for (let c = 0; c < cw; c++) add(c0 + c + (dc || 0), r0 + r + (dr || 0), z); };
      f({ add, asc, box });
      const seen = new Set(), slots = [];
      for (const [x, y, z] of t) { const k = x + ',' + y + ',' + z; if (!seen.has(k)) { seen.add(k); slots.push({ x, y, z }); } }
      if (slots.length % 2) slots.pop();
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, zm = 0;
      for (const s of slots) { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y); zm = Math.max(zm, s.z); }
      slots.forEach(s => { s.x -= x0; s.y -= y0; });
      const n = slots.length;
      const above = slots.map(() => []), left = slots.map(() => []), right = slots.map(() => []);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const a = slots[i], b = slots[j], dx = b.x - a.x, dy = b.y - a.y;
        if (b.z > a.z && Math.abs(dx) < 2 && Math.abs(dy) < 2) above[i].push(j);
        if (b.z === a.z && Math.abs(dy) < 2) { if (dx === -2) left[i].push(j); else if (dx === 2) right[i].push(j); }
      }
      const order = slots.map((s, i) => i).sort((a, b) => slots[a].z - slots[b].z || slots[a].y - slots[b].y || slots[a].x - slots[b].x);
      out.push({ id, name, blurb, slots, n, above, left, right, order, w: x1 - x0 + 2, h: y1 - y0 + 2, zmax: zm });
    };
    mk('turtle', 'Turtle', 'The classic Shanghai layout', ({ add, asc, box }) => {
      asc(0, 0, 0, [' XXXXXXXXXXXX  ', '   XXXXXXXX    ', '  XXXXXXXXXX   ', ' XXXXXXXXXXXX  ', ' XXXXXXXXXXXX  ', '  XXXXXXXXXX   ', '   XXXXXXXX    ', ' XXXXXXXXXXXX  ']);
      add(0, 3.5, 0); add(13, 3.5, 0); add(14, 3.5, 0);
      box(1, 4, 1, 6, 6); box(2, 5, 2, 4, 4); box(3, 6, 3, 2, 2); add(6.5, 3.5, 4);
    });
    mk('pyramid', 'Pyramid', 'Climb the stepped pyramid', ({ add, box }) => {
      box(0, 0, 0, 12, 6); box(1, 1, 1, 10, 4); box(2, 2, 2, 8, 2);
      for (let c = 3; c <= 8; c++) add(c, 2.5, 3);
      for (let c = 4; c <= 7; c++) add(c, 2.5, 4);
      add(5, 2.5, 5); add(6, 2.5, 5);
    });
    mk('fortress', 'Fortress', 'Walls, towers and a hidden keep', ({ add, asc, box }) => {
      asc(0, 0, 0, ['XXXXXXXXXXXXXX', 'XX          XX', 'X  XXXXXXXX  X', 'X  X      X  X', 'X  X      X  X', 'X  XXXXXXXX  X', 'XX          XX', 'XXXXXXXXXXXXXX']);
      box(0, 5, 3, 4, 2);
      for (const [c, r] of [[0, 0], [12, 0], [0, 6], [12, 6]]) { box(1, c, r, 2, 2); box(2, c, r, 2, 2); add(c + .5, r + .5, 3); }
      box(1, 4, 2, 6, 1); box(1, 4, 5, 6, 1); box(1, 6, 3, 2, 2);
      add(6, 3.5, 2); add(7, 3.5, 2);
    });
    mk('cross', 'Cross', 'Four arms meeting in the middle', ({ add, box }) => {
      box(0, 4, 0, 4, 2); box(0, 0, 2, 12, 4); box(0, 4, 6, 4, 2);
      box(1, 2, 2, 8, 4); box(2, 4, 2, 4, 4); box(3, 4, 3, 4, 2); box(4, 5, 3, 2, 2);
      add(5, 3.5, 5); add(6, 3.5, 5);
    });
    mk('hourglass', 'Hourglass', 'Two funnels, tightly stacked', ({ asc }) => {
      asc(0, 0, 0, ['XXXXXXXXXXXXXX', ' XXXXXXXXXXXX ', '  XXXXXXXXXX  ', '   XXXXXXXX   ', '   XXXXXXXX   ', '  XXXXXXXXXX  ', ' XXXXXXXXXXXX ', 'XXXXXXXXXXXXXX']);
      asc(1, 0, 2, ['XXXXXXXXXX', ' XXXXXXXX ', '  XXXXXX  ', '   XXXX   ', '   XXXX   ', '  XXXXXX  ', ' XXXXXXXX ', 'XXXXXXXXXX']);
    });
    mk('peaks', 'Twin Peaks', 'Two mountains joined by a pass', ({ add, box }) => {
      for (const dc of [0, 8]) { box(0, 0, 0, 7, 6, dc); box(1, 1, 1, 5, 4, dc); box(2, 2, 2, 3, 2, dc); }
      box(0, 7, 1, 1, 4);
      add(3, 2.5, 3); add(11, 2.5, 3);
    });
    mk('starter', 'Starter', 'A small, friendly warm-up', ({ box }) => {
      box(0, 0, 0, 12, 4); box(1, 2, 1, 8, 2);
    });
    return out;
  })();

  function mjShuffle(a, R) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  const mjGroup = k => k < 34 ? k : k < 38 ? 100 : 101;
  const mjMatch = (a, b) => mjGroup(a) === mjGroup(b);
  function mjPairTypes(count, R) {
    const all = [];
    for (let k = 0; k < 34; k++) all.push([k, k], [k, k]);
    const fl = mjShuffle([34, 35, 36, 37], R), se = mjShuffle([38, 39, 40, 41], R);
    all.push([fl[0], fl[1]], [fl[2], fl[3]], [se[0], se[1]], [se[2], se[3]]);
    return mjShuffle(all, R).slice(0, count);
  }
  function mjFreeAt(L, alive, i) {
    if (!alive[i]) return false;
    for (const j of L.above[i]) if (alive[j]) return false;
    let l = false, r = false;
    for (const j of L.left[i]) if (alive[j]) { l = true; break; }
    if (!l) return true;
    for (const j of L.right[i]) if (alive[j]) { r = true; break; }
    return !r;
  }
  function mjDeal(L, R, types, slotsAlive) {
    const n = L.n;
    for (let attempt = 0; attempt < 60; attempt++) {
      const alive = new Uint8Array(n);
      const idx = [];
      for (let i = 0; i < n; i++) if (!slotsAlive || slotsAlive[i]) { alive[i] = 1; idx.push(i); }
      const pairs = [];
      let ok = true, left = idx.length;
      while (left > 0) {
        const free = [];
        for (const i of idx) if (alive[i] && mjFreeAt(L, alive, i)) free.push(i);
        if (free.length < 2) { ok = false; break; }
        let a = -1, b = -1;
        for (let tries = 0; tries < 14; tries++) {
          const p = free[Math.floor(R() * free.length)];
          let q = free[Math.floor(R() * free.length)];
          if (p === q) q = free[(free.indexOf(p) + 1) % free.length];
          alive[p] = 0; alive[q] = 0;
          let cnt = 0;
          if (left > 2) for (const i of idx) { if (alive[i] && mjFreeAt(L, alive, i)) { cnt++; if (cnt >= 2) break; } }
          if (left <= 2 || cnt >= 2) { a = p; b = q; break; }
          alive[p] = 1; alive[q] = 1;
        }
        if (a < 0) {
          a = free[0]; b = free[1]; alive[a] = 0; alive[b] = 0;
        }
        pairs.push([a, b]); left -= 2;
      }
      if (!ok) continue;
      const tp = types ? types.slice() : mjPairTypes(pairs.length, R);
      mjShuffle(tp, R);
      const kinds = new Int16Array(n).fill(-1);
      pairs.forEach(([a, b], k) => {
        const t = tp[k];
        if (R() < .5) { kinds[a] = t[0]; kinds[b] = t[1]; } else { kinds[a] = t[1]; kinds[b] = t[0]; }
      });
      return { kinds, solution: pairs };
    }
    return null;
  }
  function mjGame(L, seed, opt) {
    opt = opt || {};
    const R = mulberry(seed);
    const types = mjPairTypes(L.n / 2, R);
    let deal = null;
    for (let t = 0; t < 8 && !deal; t++) deal = mjDeal(L, R, types);
    const G = { L, seed, kinds: deal.kinds, solution: deal.solution, alive: new Uint8Array(L.n).fill(1), left: L.n, hist: [], R };
    G.free = i => mjFreeAt(L, G.alive, i);
    G.freeList = () => { const o = []; for (let i = 0; i < L.n; i++) if (G.alive[i] && mjFreeAt(L, G.alive, i)) o.push(i); return o; };
    G.can = (i, j) => i !== j && G.alive[i] && G.alive[j] && mjMatch(G.kinds[i], G.kinds[j]) && mjFreeAt(L, G.alive, i) && mjFreeAt(L, G.alive, j);
    G.pairs = () => {
      const f = G.freeList(), o = [];
      for (let a = 0; a < f.length; a++) for (let b = a + 1; b < f.length; b++) if (mjMatch(G.kinds[f[a]], G.kinds[f[b]])) o.push([f[a], f[b]]);
      return o;
    };
    G.remove = (i, j) => {
      if (!G.can(i, j)) return false;
      G.alive[i] = 0; G.alive[j] = 0; G.left -= 2; G.hist.push([i, j]);
      return true;
    };
    G.undo = () => {
      const p = G.hist.pop();
      if (!p) return null;
      G.alive[p[0]] = 1; G.alive[p[1]] = 1; G.left += 2;
      return p;
    };
    G.hint = () => {
      const ps = G.pairs();
      if (!ps.length) return null;
      let best = null, bs = -1;
      for (const [a, b] of ps) {
        G.alive[a] = 0; G.alive[b] = 0;
        let c = 0;
        for (let i = 0; i < L.n; i++) if (G.alive[i] && mjFreeAt(L, G.alive, i)) c++;
        G.alive[a] = 1; G.alive[b] = 1;
        const s = c + Math.random() * .9;
        if (s > bs) { bs = s; best = [a, b]; }
      }
      return best;
    };
    G.reshuffle = () => {
      const idx = [], ks = [];
      for (let i = 0; i < L.n; i++) if (G.alive[i]) { idx.push(i); ks.push(G.kinds[i]); }
      const byG = new Map();
      for (const k of ks) { const g = mjGroup(k); if (!byG.has(g)) byG.set(g, []); byG.get(g).push(k); }
      const types2 = [];
      for (const arr of byG.values()) { mjShuffle(arr, G.R); for (let i = 0; i + 1 < arr.length; i += 2) types2.push([arr[i], arr[i + 1]]); }
      let d = null;
      for (let t = 0; t < 12 && !d; t++) d = mjDeal(L, G.R, types2, G.alive);
      if (!d) return false;
      G.kinds = d.kinds;
      G.hist = [];
      return true;
    };
    return G;
  }

  const MS_RULES = `<h3>How to play</h3><div class="ms-rules">
<p><b>Goal:</b> clear the board by removing matching pairs of tiles.</p>
<p><b>Free tiles.</b> A tile can be picked when nothing lies on top of it <i>and</i> it can slide out to the left or to the right (at least one of its sides is open). Blocked tiles are shaded.</p>
<p><b>Matching.</b> Two free tiles match when they are identical. All four <b>Flowers</b> (plum, orchid, chrysanthemum, bamboo) match each other, and all four <b>Seasons</b> match each other, even though no two of them look the same.</p>
<p><b>Every deal can be solved.</b> Boards are built backwards from a finished game, so a winning order always exists from the start. If you get stuck, use <b>Undo</b> or <b>Shuffle</b>, which re-deals the remaining tiles and keeps the board solvable.</p>
<p><b>Time.</b> Your clock runs while you play. A Hint costs 15 s and a Shuffle costs 30 s. Undo is free.</p>
<p><b>Keys:</b> <kbd>H</kbd> hint, <kbd>U</kbd> undo, <kbd>S</kbd> shuffle, <kbd>N</kbd> new deal, <kbd>M</kbd> menu, arrow keys move the cursor, <kbd>Enter</kbd> picks a tile.</p></div>`;

  const MS_CSS = `
.gm-mahjong-solitaire{gap:0}
.gm-mahjong-solitaire [hidden]{display:none!important}
.gm-mahjong-solitaire .ms-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(8,40,25,.32);background:#0f5a37;display:flex;flex-direction:column;font-family:var(--sans);color:#fff}
.gm-mahjong-solitaire .ms-bar{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;padding:8px 10px;background:linear-gradient(#173d2b,#10301f);border-bottom:2px solid rgba(0,0,0,.35)}
.gm-mahjong-solitaire .ms-stat{display:flex;flex-direction:column;align-items:center;min-width:54px;line-height:1.1}
.gm-mahjong-solitaire .ms-stat span{font:900 9.5px var(--sans);letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.55)}
.gm-mahjong-solitaire .ms-stat b{font:900 19px var(--sans);font-variant-numeric:tabular-nums}
.gm-mahjong-solitaire .ms-stat small{font:800 10px var(--sans);color:#ffd36b;min-height:11px}
.gm-mahjong-solitaire .ms-sp{flex:1}
.gm-mahjong-solitaire .ms-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;padding:0 13px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.09);color:#fff;font:800 13px var(--sans);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;white-space:nowrap}
.gm-mahjong-solitaire .ms-b:hover{background:rgba(255,255,255,.18)}
.gm-mahjong-solitaire .ms-b:disabled{opacity:.4;cursor:default}
.gm-mahjong-solitaire .ms-b svg{width:17px;height:17px;flex:none}
.gm-mahjong-solitaire .ms-b.pri{background:#f1b92a;border-color:#fff3c9;color:#2b1d00}
.gm-mahjong-solitaire .ms-narrow .ms-b span{display:none}
.gm-mahjong-solitaire .ms-narrow .ms-b{padding:0 10px;min-width:40px}
.gm-mahjong-solitaire canvas{display:block;width:100%;height:auto;touch-action:none;cursor:pointer}
.gm-mahjong-solitaire .ms-pane{position:absolute;inset:0;z-index:5;display:flex;align-items:flex-start;justify-content:center;padding:12px;background:rgba(4,22,14,.72);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto}
.gm-mahjong-solitaire .ms-pane.clear{background:rgba(4,22,14,.28);-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-mahjong-solitaire .ms-box{width:100%;max-width:640px;margin:auto;background:linear-gradient(#245a40,#143826);border:3px solid rgba(255,255,255,.16);border-radius:20px;padding:16px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.5);animation:ms-in .25s ease-out}
@keyframes ms-in{from{transform:scale(.94);opacity:0}to{transform:none;opacity:1}}
.gm-mahjong-solitaire .ms-box h2{margin:0 0 4px;font:900 28px var(--sans);letter-spacing:-.02em}
.gm-mahjong-solitaire .ms-box h3{margin:2px 0 8px;font:900 22px var(--sans)}
.gm-mahjong-solitaire .ms-box p{margin:6px 0;font:700 14px/1.45 var(--sans);color:rgba(255,255,255,.86)}
.gm-mahjong-solitaire .ms-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:#ffd36b!important;margin:0 0 2px!important}
.gm-mahjong-solitaire .ms-lays{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:8px;margin:12px 0}
.gm-mahjong-solitaire .ms-lay{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 6px 8px;border-radius:14px;border:2px solid rgba(255,255,255,.16);background:rgba(0,0,0,.2);color:#fff;font:800 13px var(--sans);cursor:pointer}
.gm-mahjong-solitaire .ms-lay canvas{width:100%;height:auto;border-radius:8px;background:#0f4a2d;cursor:pointer}
.gm-mahjong-solitaire .ms-lay small{font:700 10.5px var(--sans);color:rgba(255,255,255,.65)}
.gm-mahjong-solitaire .ms-lay.on{border-color:#ffd36b;background:rgba(255,211,107,.16)}
.gm-mahjong-solitaire .ms-lay:hover{border-color:rgba(255,255,255,.5)}
.gm-mahjong-solitaire .ms-row{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:8px 0}
.gm-mahjong-solitaire .ms-big{display:block;width:100%;min-height:50px;margin:8px 0;border:0;border-radius:15px;color:#fff;font:900 18px/1.05 var(--sans);cursor:pointer;box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);touch-action:manipulation}
.gm-mahjong-solitaire .ms-big.gold{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00}
.gm-mahjong-solitaire .ms-big.green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-mahjong-solitaire .ms-big.red{background:linear-gradient(#ff6a5a,#cf2a1c)}
.gm-mahjong-solitaire .ms-sm{min-height:42px;padding:0 16px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);cursor:pointer}
.gm-mahjong-solitaire .ms-opt{display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0;font:800 14px var(--sans)}
.gm-mahjong-solitaire .ms-tg{position:relative;width:46px;height:26px;border-radius:13px;border:0;background:rgba(255,255,255,.22);cursor:pointer;padding:0}
.gm-mahjong-solitaire .ms-tg::after{content:'';position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .18s}
.gm-mahjong-solitaire .ms-tg[aria-checked=true]{background:#2fb35a}
.gm-mahjong-solitaire .ms-tg[aria-checked=true]::after{transform:translateX(20px)}
.gm-mahjong-solitaire .ms-stats{display:flex;margin:10px 0;border-radius:14px;background:rgba(0,0,0,.25);overflow:hidden}
.gm-mahjong-solitaire .ms-stats div{flex:1;padding:9px 4px;border-right:1px solid rgba(255,255,255,.1)}
.gm-mahjong-solitaire .ms-stats div:last-child{border:0}
.gm-mahjong-solitaire .ms-stats span{display:block;font:900 10px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.55)}
.gm-mahjong-solitaire .ms-stats b{font:900 19px var(--sans);font-variant-numeric:tabular-nums}
.gm-mahjong-solitaire .ms-rules{text-align:left}
.gm-mahjong-solitaire .ms-rules p{font:700 13px/1.45 var(--sans)!important}
.gm-mahjong-solitaire .ms-rules kbd{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
@media (pointer:coarse){.gm-mahjong-solitaire .ms-b{height:44px}}
`;

  function msIcon(n) {
    const p = {
      hint: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 3z"/>',
      undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
      shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      neu: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'
    }[n];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  const msFmt = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  function mountSolitaire(root, api) {
    const sv = Object.assign({ layout: 'turtle', hl: true, best: {}, played: 0 }, api.load() || {});
    if (!MJ_LAYOUTS.some(l => l.id === sv.layout)) sv.layout = 'turtle';
    const save = () => api.save(sv);
    const snd = mkAudio(api);

    const wrap = H('div', 'ms-wrap');
    const bar = H('div', 'ms-bar');
    bar.innerHTML = `<button class="ms-b" data-a="menu" aria-label="Menu and layouts">${msIcon('menu')}<span data-u="lay">Turtle</span></button>
<div class="ms-stat"><span>Tiles</span><b data-u="left">144</b><small>&nbsp;</small></div>
<div class="ms-stat"><span>Moves</span><b data-u="moves">0</b><small>&nbsp;</small></div>
<div class="ms-stat"><span>Time</span><b data-u="time">0:00</b><small data-u="pen">&nbsp;</small></div>
<i class="ms-sp"></i>
<button class="ms-b" data-a="hint" aria-label="Hint (H)">${msIcon('hint')}<span>Hint</span></button>
<button class="ms-b" data-a="undo" aria-label="Undo (U)">${msIcon('undo')}<span>Undo</span></button>
<button class="ms-b" data-a="shuffle" aria-label="Shuffle (S)">${msIcon('shuffle')}<span>Shuffle</span></button>
<button class="ms-b" data-a="new" aria-label="New deal (N)">${msIcon('neu')}<span>New</span></button>`;
    const cv = H('canvas');
    const pane = H('div', 'ms-pane'); pane.hidden = true;
    wrap.append(bar, cv, pane); root.append(wrap);
    const ctx = cv.getContext('2d');
    const $ = s => bar.querySelector(s);
    const uLay = $('[data-u=lay]'), uLeft = $('[data-u=left]'), uMoves = $('[data-u=moves]'), uTime = $('[data-u=time]'), uPen = $('[data-u=pen]');
    const bHint = $('[data-a=hint]'), bUndo = $('[data-a=undo]'), bShuf = $('[data-a=shuffle]');

    const S = { scene: 'title', G: null, L: null, sel: -1, hover: -1, cur: -1, hint: null, hintT: 0, time: 0, pen: 0, nmoves: 0, nhints: 0, nshuf: 0, nundo: 0, fade: [], parts: [], pop: new Map(), shake: null, dirty: true, paused: true, shown: '', winAt: 0, conf: [], stuckT: 0, best: false };
    let W = 960, Hh = 640, U = 50, OX = 0, OY = 0, bg = null, DPR = 1, PORT = null, freeC = [];

    function metrics() {
      const L = S.L, d = Math.max(2, Math.round(U * .13));
      return { w: Math.round(U), h: Math.round(U * 1.3), d, hx: U / 2, hy: U * .65, L };
    }
    function fit(force) {
      const L = S.L || MJ_LAYOUTS[0];
      const port = (root.clientWidth || 900) < 640;
      if (!force && port === PORT && S.L && cv.dataset.l === L.id) return;
      PORT = port; cv.dataset.l = L.id;
      W = port ? 420 : 960;
      const pad = port ? 8 : 22, tw = L.w / 2, th = L.h / 2, lift = L.zmax * .13;
      const uw = (W - pad * 2) / (tw + lift + .16);
      let hh = port ? Math.round((th * 1.3 + lift + .2) * uw + pad * 2 + 6) : 640;
      hh = clamp(hh, port ? 250 : 400, 700);
      const uh = (hh - pad * 2) / (th * 1.3 + lift + .2);
      U = Math.floor(Math.min(uw, uh));
      Hh = hh;
      DPR = dprNow();
      cv.width = Math.round(W * DPR); cv.height = Math.round(Hh * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const m = metrics();
      const bw = tw * U + lift * U, bh = th * U * 1.3 + lift * U;
      OX = Math.round((W - bw) / 2 + lift * U); OY = Math.round((Hh - bh) / 2 + lift * U + (port ? 0 : 2));
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px) - 56px) * ${(W / (Hh + 56)).toFixed(4)}))`;
      wrap.classList.toggle('ms-narrow', port);
      bg = null; S.dirty = true; void m;
    }
    function drawBg() {
      const c = H('canvas'); c.width = Math.round(W * DPR); c.height = Math.round(Hh * DPR);
      const x = c.getContext('2d'); x.scale(DPR, DPR);
      const g = x.createRadialGradient(W / 2, Hh * .45, 40, W / 2, Hh / 2, Math.max(W, Hh) * .75);
      g.addColorStop(0, '#2a9a63'); g.addColorStop(.6, '#157345'); g.addColorStop(1, '#0a3e26');
      x.fillStyle = g; x.fillRect(0, 0, W, Hh);
      x.globalAlpha = .06; x.strokeStyle = '#fff'; x.lineWidth = 1;
      for (let i = -Hh; i < W + Hh; i += 6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + Hh, Hh); x.stroke(); }
      x.globalAlpha = .05; x.strokeStyle = '#000';
      for (let i = -Hh; i < W + Hh; i += 6) { x.beginPath(); x.moveTo(i + Hh, 0); x.lineTo(i, Hh); x.stroke(); }
      x.globalAlpha = 1;
      const v = x.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * .35, W / 2, Hh / 2, Math.max(W, Hh) * .78);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)');
      x.fillStyle = v; x.fillRect(0, 0, W, Hh);
      bg = c;
    }
    function pos(i, m) {
      const s = S.L.slots[i];
      return { x: OX + s.x * m.hx - s.z * m.d, y: OY + s.y * m.hy - s.z * m.d };
    }
    function drawTile(i, m, now) {
      const G = S.G, L = S.L, kind = G.kinds[i];
      let { x, y } = pos(i, m);
      const free = freeC[i], dim = sv.hl && !free;
      const sp = sprite(kind, m.w, { shade: dim ? .26 : 0 });
      let scale = 1, alpha = 1;
      if (S.shake && S.shake.i === i) { const t = (now - S.shake.t0) / 320; if (t < 1) x += Math.sin(t * 26) * (1 - t) * 4; else S.shake = null; S.dirty = true; }
      const pp = S.pop.get(i);
      if (pp != null) { const t = (now - pp) / 260; if (t < 1) { const tt = Math.max(0, t); scale = .7 + .3 * easeOut(tt); alpha = tt; S.dirty = true; } else S.pop.delete(i); }
      const sel = S.sel === i, hov = S.hover === i && free;
      if (sel) y -= m.d * .6;
      const r = Math.max(2, m.w * .13);
      ctx.fillStyle = 'rgba(0,0,0,.2)'; rrp(ctx, x + m.d * 1.5, y + m.d * 1.7, m.w, m.h, r); ctx.fill();
      if (scale !== 1 || alpha !== 1) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x + m.w / 2, y + m.h / 2); ctx.scale(scale, scale); ctx.translate(-m.w / 2, -m.h / 2);
        ctx.drawImage(sp.cv, 0, 0, sp.cw, sp.ch); ctx.restore();
      } else ctx.drawImage(sp.cv, x, y, sp.cw, sp.ch);
      if (hov && !sel) { rrp(ctx, x, y, m.w, m.h, r); ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.fill(); }
      void L;
      return { x, y, r };
    }
    function outline(i, m, col, w, glow) {
      const { x, y } = pos(i, m), r = Math.max(2, m.w * .13), yy = y - (S.sel === i ? m.d * .6 : 0);
      ctx.save();
      if (glow) { ctx.shadowColor = col; ctx.shadowBlur = glow; }
      rrp(ctx, x - 1, yy - 1, m.w + 2, m.h + 2, r + 1); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
      ctx.restore();
    }
    function recomputeFree() {
      const G = S.G;
      freeC = new Array(G.L.n);
      for (let i = 0; i < G.L.n; i++) freeC[i] = G.alive[i] ? mjFreeAt(G.L, G.alive, i) : false;
    }
    function render(now) {
      if (!bg) drawBg();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.drawImage(bg, 0, 0, W, Hh);
      if (!S.G) return;
      const m = metrics(), G = S.G, L = S.L;
      for (const i of L.order) if (G.alive[i]) drawTile(i, m, now);
      if (S.sel >= 0) {
        for (let i = 0; i < L.n; i++) if (freeC[i] && i !== S.sel && mjMatch(G.kinds[i], G.kinds[S.sel])) outline(i, m, 'rgba(255,225,120,.75)', 2, 0);
        outline(S.sel, m, '#ffd84a', 3, 14);
      }
      if (S.cur >= 0 && G.alive[S.cur]) { ctx.save(); ctx.setLineDash([5, 4]); outline(S.cur, m, '#fff', 2, 0); ctx.restore(); }
      if (S.hint) {
        const t = (now - S.hintT) / 1000;
        if (t < 3.2) { const k = .55 + .45 * Math.sin(t * 9); for (const i of S.hint) if (G.alive[i]) outline(i, m, `rgba(90,230,255,${k})`, 4, 18); S.dirty = true; } else S.hint = null;
      }
      for (let k = S.fade.length - 1; k >= 0; k--) {
        const f = S.fade[k], t = (now - f.t0) / 360;
        if (t >= 1) { S.fade.splice(k, 1); continue; }
        for (const i of [f.a, f.b]) {
          const s = L.slots[i], x = OX + s.x * m.hx - s.z * m.d, y = OY + s.y * m.hy - s.z * m.d;
          const sp = sprite(G.kinds[i], m.w, {}), sc = 1 + .22 * easeOut(t);
          ctx.save(); ctx.globalAlpha = 1 - t * t; ctx.translate(x + m.w / 2, y + m.h / 2 - t * 10); ctx.scale(sc, sc); ctx.translate(-m.w / 2, -m.h / 2);
          ctx.drawImage(sp.cv, 0, 0, sp.cw, sp.ch); ctx.restore();
        }
        S.dirty = true;
      }
      for (let k = S.parts.length - 1; k >= 0; k--) {
        const p = S.parts[k], dt = 1 / 60;
        p.life -= dt; if (p.life <= 0) { S.parts.splice(k, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.rot += p.vr * dt;
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2.2); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col;
        const s = p.s; ctx.beginPath();
        for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4, r = q % 2 ? s * .35 : s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.restore();
        S.dirty = true;
      }
      for (let k = S.conf.length - 1; k >= 0; k--) {
        const p = S.conf[k], dt = 1 / 60;
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; p.rot += p.vr * dt;
        if (p.y > Hh + 80) { S.conf.splice(k, 1); continue; }
        const sp = sprite(p.k, p.w, {});
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(sp.cv, -sp.w / 2, -sp.h / 2, sp.cw, sp.ch); ctx.restore();
        S.dirty = true;
      }
    }

    function sparkle(i, m) {
      const { x, y } = pos(i, m), cols = ['#fff6c2', '#ffd84a', '#7cf0ff', '#ffb3d1'];
      for (let k = 0; k < 9; k++) {
        const a = Math.random() * TAU, v = 60 + Math.random() * 150;
        S.parts.push({ x: x + m.w / 2, y: y + m.h / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: .55 + Math.random() * .35, rot: Math.random() * 3, vr: (Math.random() - .5) * 8, s: 3 + Math.random() * 4, col: cols[k % 4] });
      }
    }

    function hud() {
      const G = S.G;
      uLay.textContent = S.L ? S.L.name : '';
      if (!G) return;
      const nm = G.pairs().length;
      uLeft.textContent = G.left; uMoves.textContent = nm;
      uMoves.style.color = nm === 0 && G.left > 0 ? '#ff8a7a' : '';
      const t = Math.floor(S.time + S.pen);
      const s = msFmt(t);
      if (uTime.textContent !== s) { uTime.textContent = s; api.score(s); }
      uPen.innerHTML = S.pen ? '+' + S.pen + 's' : '&nbsp;';
      bUndo.disabled = !G.hist.length || S.scene !== 'play';
      bHint.disabled = S.scene !== 'play' || !nm;
      bShuf.disabled = S.scene !== 'play';
    }

    function showPane(k, html, fn, cls) {
      pane.dataset.k = k; pane.className = 'ms-pane' + (cls ? ' ' + cls : '');
      pane.innerHTML = '<div class="ms-box">' + html + '</div>';
      pane.hidden = false; pane.scrollTop = 0; S.paused = true;
      pane.onclick = e => {
        const b = e.target.closest('[data-a]');
        if (b) { snd('soft'); fn(b.dataset.a, b); }
      };
    }
    function hidePane() { pane.hidden = true; pane.dataset.k = ''; S.paused = false; S.dirty = true; }

    function newGame(seedIn, layoutId) {
      const L = MJ_LAYOUTS.find(l => l.id === (layoutId || sv.layout)) || MJ_LAYOUTS[0];
      const seed = seedIn != null ? seedIn : Math.floor(Math.random() * 1e9) + 1;
      S.L = L; S.G = mjGame(L, seed);
      S.seed = seed;
      Object.assign(S, { scene: 'play', sel: -1, hover: -1, cur: -1, hint: null, time: 0, pen: 0, nmoves: 0, nhints: 0, nshuf: 0, nundo: 0, fade: [], parts: [], conf: [], shake: null, best: false, paused: false });
      S.pop = new Map();
      fit(true); recomputeFree(); hud(); hidePane();
      L.order.forEach((i, k) => S.pop.set(i, performance.now() + k * 4));
      snd('shuffle');
      S.dirty = true;
    }
    function removePair(a, b) {
      const G = S.G, m = metrics();
      if (!G.remove(a, b)) return;
      S.nmoves++;
      S.fade.push({ a, b, t0: performance.now() });
      sparkle(a, m); sparkle(b, m);
      snd('match');
      S.sel = -1; S.hint = null; S.cur = -1;
      recomputeFree(); hud(); S.dirty = true;
      if (G.left === 0) return win();
      if (!G.pairs().length) { S.stuckT = performance.now() + 700; }
    }
    function win() {
      S.scene = 'won'; S.winAt = performance.now();
      const m = metrics();
      for (let k = 0; k < 60; k++) S.conf.push({ x: Math.random() * W, y: -40 - Math.random() * 300, vx: (Math.random() - .5) * 120, vy: Math.random() * 80, rot: Math.random() * 6, vr: (Math.random() - .5) * 7, k: Math.floor(Math.random() * 42), w: Math.max(22, Math.round(m.w * .55)) });
      snd('win'); hud();
      const total = Math.max(1, Math.round(S.time + S.pen));
      const prev = sv.best[S.L.id];
      S.best = prev == null || total < prev;
      if (S.best) sv.best[S.L.id] = total;
      sv.played++; save();
      api.submit(total);
      setTimeout(() => { if (api.alive && S.scene === 'won') showWin(total, prev); }, 2200);
    }
    function showWin(total, prev) {
      showPane('win', `<p class="ms-kick">${S.best ? 'New best time' : 'Board cleared'}</p><h2>You cleared the ${S.L.name}!</h2>
<div class="ms-stats"><div><span>Time</span><b>${msFmt(S.time)}</b></div><div><span>Penalty</span><b>+${S.pen}s</b></div><div><span>Total</span><b>${msFmt(total)}</b></div></div>
<p>${S.nmoves} moves · ${S.nhints} hint${S.nhints === 1 ? '' : 's'} · ${S.nshuf} shuffle${S.nshuf === 1 ? '' : 's'} · ${S.nundo} undo${S.nundo === 1 ? '' : 's'}${prev != null && !S.best ? ' · best ' + msFmt(prev) : ''}</p>
<button class="ms-big gold" data-a="new">New deal</button>
<div class="ms-row"><button class="ms-sm" data-a="again">Replay this deal</button><button class="ms-sm" data-a="menu">Layouts</button></div>`, a => {
        if (a === 'new') newGame(); else if (a === 'again') newGame(S.seed); else if (a === 'menu') menu();
      }, 'clear');
    }
    function showStuck() {
      S.scene = 'stuck';
      showPane('stuck', `<p class="ms-kick">No matches left</p><h3>You are out of moves</h3><p>${S.G.left} tiles remain. Undo your last moves, or shuffle the remaining tiles into a new solvable arrangement (+30 s).</p>
<button class="ms-big gold" data-a="shuffle">Shuffle tiles</button>
<div class="ms-row"><button class="ms-sm" data-a="undo">Undo</button><button class="ms-sm" data-a="again">Restart deal</button><button class="ms-sm" data-a="new">New deal</button></div>`, a => {
        S.scene = 'play';
        if (a === 'shuffle') { hidePane(); doShuffle(); }
        else if (a === 'undo') { hidePane(); doUndo(); }
        else if (a === 'again') newGame(S.seed);
        else if (a === 'new') newGame();
      }, 'clear');
    }
    function doHint() {
      if (S.scene !== 'play' || S.paused) return;
      const h = S.G.hint();
      if (!h) { api.toast('No moves available'); return; }
      S.hint = h; S.hintT = performance.now(); S.sel = -1; S.nhints++; S.pen += 15; snd('hint'); hud(); S.dirty = true;
    }
    function doUndo() {
      if (S.scene !== 'play' || S.paused) return;
      const p = S.G.undo();
      if (!p) return;
      S.nundo++; S.sel = -1; S.hint = null; S.nmoves = Math.max(0, S.nmoves - 1);
      const now = performance.now(); S.pop.set(p[0], now); S.pop.set(p[1], now);
      snd('soft'); recomputeFree(); hud(); S.dirty = true;
    }
    function doShuffle() {
      if (S.scene !== 'play' || S.paused) return;
      if (!S.G.reshuffle()) { api.toast('Could not shuffle'); return; }
      S.nshuf++; S.pen += 30; S.sel = -1; S.hint = null; S.cur = -1;
      const now = performance.now();
      S.L.order.forEach((i, k) => { if (S.G.alive[i]) S.pop.set(i, now + k * 3); });
      snd('shuffle'); recomputeFree(); hud(); S.dirty = true;
      if (!S.G.pairs().length) S.stuckT = performance.now() + 900;
    }
    function menu() {
      S.paused = true;
      const cells = MJ_LAYOUTS.map(l => `<button class="ms-lay${l.id === sv.layout ? ' on' : ''}" data-a="L:${l.id}"><canvas width="150" height="100" data-p="${l.id}"></canvas><span>${l.name}</span><small>${l.n} tiles${sv.best[l.id] ? ' · best ' + msFmt(sv.best[l.id]) : ''}</small></button>`).join('');
      showPane('menu', `<p class="ms-kick">Mahjong Solitaire</p><h2>Choose a layout</h2><p>Match free pairs to clear the board. Every deal is solvable.</p>
<div class="ms-lays">${cells}</div>
<div class="ms-opt"><span>Shade blocked tiles</span><button class="ms-tg" data-a="hl" role="switch" aria-checked="${sv.hl}" aria-label="Shade blocked tiles"></button></div>
<button class="ms-big gold" data-a="play">${S.G && S.scene === 'play' ? 'New deal on ' + MJ_LAYOUTS.find(l => l.id === sv.layout).name : 'Play'}</button>
<div class="ms-row">${S.G && (S.scene === 'play' || S.scene === 'stuck') ? '<button class="ms-sm" data-a="resume">Resume game</button>' : ''}<button class="ms-sm" data-a="rules">How to play</button></div>`, (a, b) => {
        if (a.startsWith('L:')) {
          sv.layout = a.slice(2); save();
          pane.querySelectorAll('.ms-lay').forEach(e => e.classList.toggle('on', e.dataset.a === a));
          const pb = pane.querySelector('[data-a=play]'); pb.textContent = 'New deal on ' + MJ_LAYOUTS.find(l => l.id === sv.layout).name;
        } else if (a === 'hl') { sv.hl = !sv.hl; b.setAttribute('aria-checked', String(sv.hl)); save(); S.dirty = true; }
        else if (a === 'play') newGame();
        else if (a === 'resume') { hidePane(); if (S.scene === 'stuck') S.scene = 'play'; }
        else if (a === 'rules') showPane('rules', MS_RULES + '<button class="ms-big gold" data-a="back">Got it</button>', () => menu());
      });
      pane.querySelectorAll('canvas[data-p]').forEach(c => {
        const l = MJ_LAYOUTS.find(q => q.id === c.dataset.p), x = c.getContext('2d');
        const k = Math.min(140 / (l.w + l.zmax), 92 / (l.h * 1.25 + l.zmax)) ;
        const ox = (150 - l.w * k) / 2, oy = (100 - l.h * k * 1.25) / 2;
        x.fillStyle = '#0f4a2d'; x.fillRect(0, 0, 150, 100);
        for (const i of l.order) {
          const s = l.slots[i], px = ox + s.x * k - s.z * k * .22, py = oy + s.y * k * 1.25 - s.z * k * .22;
          x.fillStyle = '#0a4f31'; x.fillRect(px + k * .25, py + k * .25, k * 2 - .5, k * 2.5 - .5);
          x.fillStyle = ['#fbf6e0', '#f4ecc6', '#ecdfa8', '#e2d089', '#d8c16c', '#cdb255'][s.z]; x.fillRect(px, py, k * 2 - .5, k * 2.5 - .5);
        }
      });
    }

    function hit(mx, my) {
      const m = metrics(), G = S.G, L = S.L;
      for (let k = L.order.length - 1; k >= 0; k--) {
        const i = L.order[k];
        if (!G.alive[i]) continue;
        const { x, y } = pos(i, m);
        if (mx >= x && mx <= x + m.w + m.d * .6 && my >= y && my <= y + m.h + m.d * .6) return i;
      }
      return -1;
    }
    function click(i) {
      const G = S.G;
      if (S.scene !== 'play' || S.paused) return;
      S.hint = null;
      if (i < 0) { S.sel = -1; S.dirty = true; return; }
      if (S.sel === i) { S.sel = -1; snd('soft'); S.dirty = true; return; }
      if (!freeC[i]) { S.shake = { i, t0: performance.now() }; snd('bad'); S.dirty = true; return; }
      if (S.sel < 0) { S.sel = i; snd('select'); S.dirty = true; return; }
      if (G.can(S.sel, i)) removePair(S.sel, i);
      else { S.sel = i; snd('select'); S.dirty = true; }
    }
    const loc = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * Hh / r.height }; };
    api.on(cv, 'pointerdown', e => {
      if (S.scene !== 'play' || !S.G) return;
      const p = loc(e);
      S.cur = -1;
      click(hit(p.x, p.y));
    });
    api.on(cv, 'pointermove', e => {
      if (S.scene !== 'play' || !S.G || e.pointerType === 'touch') return;
      const p = loc(e), i = hit(p.x, p.y);
      if (i !== S.hover) { S.hover = i; S.dirty = true; cv.style.cursor = i >= 0 && freeC[i] ? 'pointer' : 'default'; }
    });
    api.on(cv, 'pointerleave', () => { if (S.hover >= 0) { S.hover = -1; S.dirty = true; } });
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || b.disabled) return;
      snd('soft');
      const a = b.dataset.a;
      if (a === 'menu') menu();
      else if (a === 'hint') doHint();
      else if (a === 'undo') doUndo();
      else if (a === 'shuffle') doShuffle();
      else if (a === 'new') { if (S.scene === 'play' && S.G.left < S.L.n - 2) showPane('conf', `<h3>Start a new deal?</h3><p>Your current game will be lost.</p><button class="ms-big gold" data-a="yes">New deal</button><div class="ms-row"><button class="ms-sm" data-a="again">Restart this deal</button><button class="ms-sm" data-a="no">Keep playing</button></div>`, a2 => { if (a2 === 'yes') newGame(); else if (a2 === 'again') newGame(S.seed); else hidePane(); }); else newGame(); }
    });
    function moveCursor(dx, dy) {
      const free = S.G.freeList();
      if (!free.length) return;
      const m = metrics();
      if (S.cur < 0 || !S.G.alive[S.cur]) { S.cur = free.sort((a, b) => S.L.slots[a].y - S.L.slots[b].y || S.L.slots[b].z - S.L.slots[a].z || S.L.slots[a].x - S.L.slots[b].x)[0]; S.dirty = true; return; }
      const c = pos(S.cur, m);
      let best = -1, bv = 1e9;
      for (const i of free) {
        if (i === S.cur) continue;
        const p = pos(i, m), ddx = p.x - c.x, ddy = p.y - c.y;
        const along = dx ? ddx * dx : ddy * dy, across = dx ? Math.abs(ddy) : Math.abs(ddx);
        if (along <= 1) continue;
        const v = along + across * 2.2;
        if (v < bv) { bv = v; best = i; }
      }
      if (best >= 0) { S.cur = best; snd('tick'); S.dirty = true; }
    }
    api.on(window, 'keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (!pane.hidden) {
        if ((k === 'enter' || k === ' ') && pane.dataset.k === 'menu') { e.preventDefault(); newGame(); }
        return;
      }
      if (!S.G || S.scene !== 'play') return;
      if (k === 'h') doHint();
      else if (k === 'u') doUndo();
      else if (k === 's') doShuffle();
      else if (k === 'n') newGame();
      else if (k === 'm') menu();
      else if (k === 'arrowleft') { e.preventDefault(); moveCursor(-1, 0); }
      else if (k === 'arrowright') { e.preventDefault(); moveCursor(1, 0); }
      else if (k === 'arrowup') { e.preventDefault(); moveCursor(0, -1); }
      else if (k === 'arrowdown') { e.preventDefault(); moveCursor(0, 1); }
      else if (k === 'enter' || k === ' ') { e.preventDefault(); if (S.cur < 0) moveCursor(1, 0); else click(S.cur); }
    });
    api.on(window, 'resize', () => fit(false));
    api.on(document, 'visibilitychange', () => { S.dirty = true; });

    let last = performance.now(), lastSec = -1;
    api.loop((dt, now) => {
      if (S.scene === 'play' && !S.paused && !document.hidden) { S.time += dt; const s = Math.floor(S.time + S.pen); if (s !== lastSec) { lastSec = s; hud(); } }
      if (S.stuckT && now > S.stuckT) { S.stuckT = 0; if (S.scene === 'play' && !S.paused && S.G && S.G.left > 0 && !S.G.pairs().length) showStuck(); }
      if (S.dirty || S.fade.length || S.parts.length || S.conf.length || S.hint || S.shake) { S.dirty = false; render(now); }
      last = now;
    });
    void last;

    fit(true);
    S.L = MJ_LAYOUTS.find(l => l.id === sv.layout);
    S.G = mjGame(S.L, 20260101 + sv.played);
    S.seed = 20260101 + sv.played;
    S.scene = 'title';
    fit(true); recomputeFree(); hud();
    S.L.order.forEach(i => S.pop.set(i, performance.now()));
    menu();
    root._ms = { S, get G() { return S.G; }, newGame, hit, pos: i => pos(i, metrics()), click, doHint, doShuffle, doUndo, free: () => freeC, scene: () => S.scene, pane: () => pane.hidden ? '' : pane.dataset.k, fit, size: () => [W, Hh, U], menu };
  }

  Ameplay.register({
    id: 'mahjong-solitaire',
    title: 'Mahjong Solitaire',
    category: 'Board',
    tint: '#1f8a57',
    blurb: 'Clear the board of ivory tiles by matching free pairs. Seven stacked layouts, hints, undo and always-solvable deals.',
    help: 'Click or tap two matching free tiles · <kbd>H</kbd> hint · <kbd>U</kbd> undo · <kbd>S</kbd> shuffle · <kbd>N</kbd> new deal · arrows + <kbd>Enter</kbd> to play by keyboard',
    width: 960,
    better: 'low',
    format: v => msFmt(v),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="14" width="26" height="36" rx="5"/><rect x="14" y="8" width="26" height="36" rx="5" fill="currentColor" fill-opacity=".14"/><path d="M27 18v18M20 27h14"/><rect x="30" y="20" width="26" height="36" rx="5" fill="currentColor" fill-opacity=".1"/><circle cx="43" cy="38" r="7"/><circle cx="43" cy="38" r="2.5"/></svg>',
    _t: { MJ_LAYOUTS, mjGame, mjDeal, mjFreeAt, mjMatch },
    css: MS_CSS,
    mount: mountSolitaire
  });

  const isHonor = k => k >= 27;
  const isTerm = k => k < 27 && (k % 9 === 0 || k % 9 === 8);
  const isYao = k => k >= 27 || k % 9 === 0 || k % 9 === 8;
  const YAOCHUU = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
  const GREEN = new Set([19, 20, 21, 23, 25, 32]);
  const WINDN = ['East', 'South', 'West', 'North'];
  const rkind = id => id >> 2;
  const countOf = ids => { const c = new Int8Array(34); for (const id of ids) c[id >> 2]++; return c; };
  const rTileName = k => KNAME[k];

  const SUIT_CACHE = new Map();
  function suitTable(c, off, honor) {
    let key = honor ? 1 : 2;
    const n = honor ? 7 : 9;
    for (let i = 0; i < n; i++) key = key * 5 + c[off + i];
    let r = SUIT_CACHE.get(key);
    if (r) return r;
    r = [[-1, -1, -1, -1, -1], [-1, -1, -1, -1, -1]];
    const a = new Int8Array(9);
    for (let i = 0; i < n; i++) a[i] = c[off + i];
    let m = 0, t = 0, p = 0;
    const go = i => {
      while (i < n && !a[i]) i++;
      if (i >= n) { if (t > r[p][m]) r[p][m] = t; return; }
      if (a[i] >= 3) { a[i] -= 3; m++; go(i); m--; a[i] += 3; }
      if (!honor && i < 7 && a[i + 1] && a[i + 2]) { a[i]--; a[i + 1]--; a[i + 2]--; m++; go(i); m--; a[i]++; a[i + 1]++; a[i + 2]++; }
      if (a[i] >= 2) {
        if (!p) { a[i] -= 2; p = 1; go(i); p = 0; a[i] += 2; }
        a[i] -= 2; t++; go(i); t--; a[i] += 2;
      }
      if (!honor) {
        if (i < 8 && a[i + 1]) { a[i]--; a[i + 1]--; t++; go(i); t--; a[i]++; a[i + 1]++; }
        if (i < 7 && a[i + 2]) { a[i]--; a[i + 2]--; t++; go(i); t--; a[i]++; a[i + 2]++; }
      }
      a[i]--; go(i); a[i]++;
    };
    go(0);
    if (SUIT_CACHE.size > 60000) SUIT_CACHE.clear();
    SUIT_CACHE.set(key, r);
    return r;
  }
  function shantenNormal(c, nm) {
    let dp = [[-9, -9, -9, -9, -9], [-9, -9, -9, -9, -9]];
    dp[0][0] = 0;
    for (let s = 0; s < 4; s++) {
      const tb = suitTable(c, s * 9, s === 3), nd = [[-9, -9, -9, -9, -9], [-9, -9, -9, -9, -9]];
      for (let p = 0; p < 2; p++) for (let m = 0; m < 5; m++) {
        const cur = dp[p][m];
        if (cur < 0) continue;
        for (let p2 = 0; p2 + p < 2; p2++) for (let m2 = 0; m + m2 < 5; m2++) {
          const t = tb[p2][m2];
          if (t < 0) continue;
          if (cur + t > nd[p + p2][m + m2]) nd[p + p2][m + m2] = cur + t;
        }
      }
      dp = nd;
    }
    let best = 8;
    for (let p = 0; p < 2; p++) for (let m = 0; m < 5; m++) {
      const t = dp[p][m];
      if (t < 0) continue;
      const mm = m + nm;
      if (mm > 4) continue;
      const v = 8 - 2 * mm - Math.min(t, 4 - mm) - p;
      if (v < best) best = v;
    }
    return best;
  }
  function shantenChiitoi(c) {
    let pairs = 0, kinds = 0;
    for (let i = 0; i < 34; i++) { if (c[i] >= 2) pairs++; if (c[i] >= 1) kinds++; }
    return 6 - pairs + (kinds < 7 ? 7 - kinds : 0);
  }
  function shantenKokushi(c) {
    let kinds = 0, pair = 0;
    for (const k of YAOCHUU) { if (c[k] >= 1) kinds++; if (c[k] >= 2) pair = 1; }
    return 13 - kinds - pair;
  }
  function shanten(c, nm) {
    let s = shantenNormal(c, nm || 0);
    if (!nm) { s = Math.min(s, shantenChiitoi(c), shantenKokushi(c)); }
    return s;
  }
  function decompose(c, need) {
    const res = [], g = [];
    const go = (i, sets, pair) => {
      while (i < 34 && !c[i]) i++;
      if (i >= 34) { if (sets === need && pair) res.push(g.slice()); return; }
      if (c[i] >= 3 && sets < need) { c[i] -= 3; g.push({ t: 't', k: i }); go(i, sets + 1, pair); g.pop(); c[i] += 3; }
      if (i < 27 && i % 9 < 7 && c[i + 1] && c[i + 2] && sets < need) { c[i]--; c[i + 1]--; c[i + 2]--; g.push({ t: 's', k: i }); go(i, sets + 1, pair); g.pop(); c[i]++; c[i + 1]++; c[i + 2]++; }
      if (c[i] >= 2 && !pair) { c[i] -= 2; g.push({ t: 'p', k: i }); go(i, sets, true); g.pop(); c[i] += 2; }
    };
    go(0, 0, false);
    return res;
  }
  function isChiitoi(c) { let p = 0; for (let i = 0; i < 34; i++) { if (c[i] === 2) p++; else if (c[i]) return false; } return p === 7; }
  function isKokushi(c) {
    let pair = 0;
    for (let i = 0; i < 34; i++) {
      if (YAOCHUU.indexOf(i) < 0) { if (c[i]) return false; }
    }
    for (const k of YAOCHUU) { if (c[k] === 0 || c[k] > 2) return false; if (c[k] === 2) pair++; }
    return pair === 1;
  }
  function canWin(c, nm) {
    if (!nm) { if (isChiitoi(c) || isKokushi(c)) return true; }
    const need = 4 - nm;
    let found = false;
    const go = (i, sets, pair) => {
      if (found) return;
      while (i < 34 && !c[i]) i++;
      if (i >= 34) { if (sets === need && pair) found = true; return; }
      if (c[i] >= 3 && sets < need) { c[i] -= 3; go(i, sets + 1, pair); c[i] += 3; }
      if (i < 27 && i % 9 < 7 && c[i + 1] && c[i + 2] && sets < need) { c[i]--; c[i + 1]--; c[i + 2]--; go(i, sets + 1, pair); c[i]++; c[i + 1]++; c[i + 2]++; }
      if (c[i] >= 2 && !pair) { c[i] -= 2; go(i, sets, true); c[i] += 2; }
    };
    go(0, 0, false);
    return found;
  }
  function waitsOf(c, nm) {
    const o = [];
    for (let k = 0; k < 34; k++) {
      if (c[k] >= 4) continue;
      c[k]++;
      if (canWin(c, nm)) o.push(k);
      c[k]--;
    }
    return o;
  }

  const LIMIT_NAMES = ['', 'Mangan', 'Haneman', 'Baiman', 'Sanbaiman', 'Kazoe Yakuman', 'Yakuman'];
  function basePoints(han, fu, ym) {
    if (ym) return 8000 * ym;
    if (han >= 13) return 8000;
    if (han >= 11) return 6000;
    if (han >= 8) return 4000;
    if (han >= 6) return 3000;
    if (han >= 5) return 2000;
    return Math.min(2000, fu * Math.pow(2, han + 2));
  }
  function limitName(han, fu, ym) {
    if (ym) return ym > 1 ? (ym === 2 ? 'Double Yakuman' : ym === 3 ? 'Triple Yakuman' : ym + 'x Yakuman') : 'Yakuman';
    if (han >= 13) return 'Kazoe Yakuman';
    if (han >= 11) return 'Sanbaiman';
    if (han >= 8) return 'Baiman';
    if (han >= 6) return 'Haneman';
    if (han >= 5 || fu * Math.pow(2, han + 2) >= 2000) return 'Mangan';
    return '';
  }
  const up100 = v => Math.ceil(v / 100) * 100;
  function payments(base, dealer, tsumo, honba) {
    if (tsumo) {
      if (dealer) return { each: up100(base * 2) + honba * 100, total: (up100(base * 2) + honba * 100) * 3 };
      const d = up100(base * 2) + honba * 100, o = up100(base) + honba * 100;
      return { dealer: d, other: o, total: d + o * 2 };
    }
    const v = up100(base * (dealer ? 6 : 4)) + honba * 300;
    return { ron: v, total: v };
  }

  function evalHand(h) {
    const c = h.c, melds = h.melds || [], nm = melds.length;
    const menzen = !melds.some(m => m.open);
    const w = h.win, tsumo = !!h.tsumo;
    const rw = h.rw, sw = h.sw;
    const pres = new Uint8Array(34);
    for (let i = 0; i < 34; i++) if (c[i]) pres[i] = 1;
    for (const m of melds) { if (m.t === 's') { pres[m.k] = 1; pres[m.k + 1] = 1; pres[m.k + 2] = 1; } else pres[m.k] = 1; }
    const kindsAll = []; for (let i = 0; i < 34; i++) if (pres[i]) kindsAll.push(i);
    const suits = new Set(); let honors = false, allSimple = true, allYao = true, allTerm = true, allGreen = true, allHonor = true;
    for (const k of kindsAll) {
      if (k >= 27) honors = true; else suits.add(k / 9 | 0);
      if (isYao(k)) allSimple = false; else allYao = false;
      if (!isTerm(k)) allTerm = false;
      if (!GREEN.has(k)) allGreen = false;
      if (k < 27) allHonor = false;
    }
    const cands = [];
    const finish = (yk, yy, fu, extra) => {
      let han = 0, ym = 0;
      for (const y of yk) ym += y[1];
      if (ym) { cands.push({ ym, yaku: yk, han: 13 * ym, fu: fu || 0, doraN: 0, uraN: 0, akaN: 0, base: 8000 * ym }); return; }
      for (const y of yy) han += y[1];
      if (!han) return;
      const items = yy.slice();
      if (h.dora) { items.push(['Dora', h.dora]); han += h.dora; }
      if (h.ura) { items.push(['Ura Dora', h.ura]); han += h.ura; }
      if (h.aka) { items.push(['Red Five', h.aka]); han += h.aka; }
      cands.push({ ym: 0, yaku: items, han, fu, doraN: h.dora || 0, uraN: h.ura || 0, akaN: h.aka || 0, base: basePoints(han, fu, 0), chi: extra });
    };
    const flags = () => {
      const o = [], ym = [];
      if (h.tenhou) ym.push(['Tenhou', 1]);
      if (h.chiihou) ym.push(['Chiihou', 1]);
      if (h.riichi === 1) o.push(['Riichi', 1]);
      if (h.riichi === 2) o.push(['Double Riichi', 2]);
      if (h.ippatsu) o.push(['Ippatsu', 1]);
      if (menzen && tsumo) o.push(['Menzen Tsumo', 1]);
      if (h.rinshan) o.push(['Rinshan Kaihou', 1]);
      if (h.chankan) o.push(['Chankan', 1]);
      if (h.haitei && tsumo && !h.rinshan) o.push(['Haitei Raoyue', 1]);
      if (h.haitei && !tsumo) o.push(['Houtei Raoyui', 1]);
      return { o, ym };
    };
    const fl = flags();
    const flushY = (yy, ymy) => {
      if (suits.size === 1) {
        if (!honors) { if (menzen) yy.push(['Chinitsu', 6]); else yy.push(['Chinitsu', 5]); }
        else yy.push(['Honitsu', menzen ? 3 : 2]);
      }
      void ymy;
    };
    if (!nm && isKokushi(c)) {
      const thirteen = c[w] === 2;
      const ymv = thirteen ? 2 : 1;
      const y = [[thirteen ? 'Kokushi Musou (13-sided wait)' : 'Kokushi Musou', ymv]].concat(fl.ym);
      finish(y, [], 0);
    }
    if (!nm && isChiitoi(c)) {
      const ym = [], yy = fl.o.slice();
      ym.push(...fl.ym);
      if (allHonor) ym.push(['Tsuuiisou', 1]);
      yy.push(['Chiitoitsu', 2]);
      if (allSimple) yy.push(['Tanyao', 1]);
      if (allYao && !allHonor) yy.push(['Honroutou', 2]);
      flushY(yy);
      finish(ym, yy, 25);
    }
    const need = 4 - nm;
    const decs = decompose(c, need);
    for (const d of decs) {
      const seen = new Set();
      for (let gi = 0; gi < d.length; gi++) {
        const g = d[gi];
        let waits = [];
        if (g.t === 'p' && g.k === w) waits.push('tanki');
        else if (g.t === 't' && g.k === w) waits.push('shanpon');
        else if (g.t === 's' && w >= g.k && w <= g.k + 2) {
          const pos = w - g.k;
          if (pos === 1) waits.push('kanchan');
          else if (pos === 0) waits.push(g.k % 9 === 6 ? 'penchan' : 'ryanmen');
          else waits.push(g.k % 9 === 0 ? 'penchan' : 'ryanmen');
        }
        for (const wt of waits) {
          const key = g.t + g.k + wt;
          if (seen.has(key)) continue;
          seen.add(key);
          evalDecomp(d, gi, wt);
        }
      }
    }
    function evalDecomp(d, gi, wt) {
      const sets = [];
      let pairK = -1;
      d.forEach((g, i) => {
        if (g.t === 'p') pairK = g.k;
        else if (g.t === 's') sets.push({ t: 's', k: g.k, conc: true, kan: false });
        else sets.push({ t: 't', k: g.k, conc: !(wt === 'shanpon' && i === gi && !tsumo), kan: false });
      });
      for (const m of melds) sets.push({ t: m.t, k: m.k, conc: !m.open, kan: !!m.kan });
      const yy = fl.o.slice(), ym = fl.ym.slice();
      const trips = sets.filter(s => s.t === 't'), seqs = sets.filter(s => s.t === 's');
      const concTrips = trips.filter(s => s.conc).length;
      const kans = trips.filter(s => s.kan).length;
      const dragonT = trips.filter(s => s.k >= 31).length, windT = trips.filter(s => s.k >= 27 && s.k < 31).length;
      if (concTrips === 4 && menzen) ym.push([wt === 'tanki' ? 'Suuankou Tanki' : 'Suuankou', wt === 'tanki' ? 2 : 1]);
      if (dragonT === 3) ym.push(['Daisangen', 1]);
      if (windT === 4) ym.push(['Daisuushii', 2]);
      else if (windT === 3 && pairK >= 27 && pairK < 31) ym.push(['Shousuushii', 1]);
      if (allHonor) ym.push(['Tsuuiisou', 1]);
      if (allTerm) ym.push(['Chinroutou', 1]);
      if (allGreen) ym.push(['Ryuuiisou', 1]);
      if (kans === 4) ym.push(['Suukantsu', 1]);
      if (menzen && !nm && suits.size === 1 && !honors) {
        const s0 = (kindsAll[0] / 9 | 0) * 9;
        let ok = c[s0] >= 3 && c[s0 + 8] >= 3;
        for (let i = 1; i < 8 && ok; i++) if (c[s0 + i] < 1) ok = false;
        if (ok) {
          const before = c.slice(); before[w]--;
          let pure = before[s0] === 3 && before[s0 + 8] === 3;
          for (let i = 1; i < 8; i++) if (before[s0 + i] !== 1) pure = false;
          ym.push([pure ? 'Junsei Chuuren Poutou' : 'Chuuren Poutou', pure ? 2 : 1]);
        }
      }
      if (ym.length) { finish(ym, [], 0); return; }
      const yakuhai = [];
      for (const s of trips) {
        if (s.k >= 31) yakuhai.push([['Haku', 'Hatsu', 'Chun'][s.k - 31], 1]);
        else if (s.k >= 27) {
          if (s.k === rw) yakuhai.push(['Round Wind ' + WINDN[rw - 27], 1]);
          if (s.k === sw) yakuhai.push(['Seat Wind ' + WINDN[sw - 27], 1]);
        }
      }
      const pairY = pairK >= 31 || pairK === rw || pairK === sw;
      const pinfu = menzen && seqs.length === 4 && !pairY && wt === 'ryanmen';
      if (pinfu) yy.push(['Pinfu', 1]);
      if (allSimple) yy.push(['Tanyao', 1]);
      if (menzen) {
        let pe = 0;
        const sk = seqs.map(s => s.k).sort((a, b) => a - b);
        for (let i = 0; i + 1 < sk.length; i++) if (sk[i] === sk[i + 1]) { pe++; i++; }
        if (pe === 2) yy.push(['Ryanpeikou', 3]); else if (pe === 1) yy.push(['Iipeikou', 1]);
      }
      for (const y of yakuhai) yy.push(y);
      if (trips.length === 4) yy.push(['Toitoi', 2]);
      if (concTrips === 3) yy.push(['Sanankou', 2]);
      if (kans === 3) yy.push(['Sankantsu', 2]);
      if (dragonT === 2 && pairK >= 31) yy.push(['Shousangen', 2]);
      for (let x = 0; x < 9; x++) {
        if (trips.some(s => s.k === x) && trips.some(s => s.k === 9 + x) && trips.some(s => s.k === 18 + x)) { yy.push(['Sanshoku Doukou', 2]); break; }
      }
      for (let x = 0; x < 7; x++) {
        if (seqs.some(s => s.k === x) && seqs.some(s => s.k === 9 + x) && seqs.some(s => s.k === 18 + x)) { yy.push(['Sanshoku Doujun', menzen ? 2 : 1]); break; }
      }
      for (let s0 = 0; s0 < 3; s0++) {
        if (seqs.some(s => s.k === s0 * 9) && seqs.some(s => s.k === s0 * 9 + 3) && seqs.some(s => s.k === s0 * 9 + 6)) { yy.push(['Ittsu', menzen ? 2 : 1]); break; }
      }
      const yaoSet = s => s.t === 's' ? (s.k % 9 === 0 || s.k % 9 === 6) : isYao(s.k);
      if (sets.every(yaoSet) && isYao(pairK)) {
        if (!seqs.length) yy.push(['Honroutou', 2]);
        else if (!honors) yy.push(['Junchan', menzen ? 3 : 2]);
        else yy.push(['Chanta', menzen ? 2 : 1]);
      }
      flushY(yy);
      let fu = 20;
      if (pinfu && tsumo) fu = 20;
      else if (pinfu) fu = 30;
      else {
        if (menzen && !tsumo) fu += 10;
        if (tsumo) fu += 2;
        for (const s of trips) { let f = isYao(s.k) ? 4 : 2; if (s.conc) f *= 2; if (s.kan) f *= 4; fu += f; }
        if (pairK >= 31) fu += 2;
        if (pairK === rw) fu += 2;
        if (pairK === sw) fu += 2;
        if (wt === 'kanchan' || wt === 'penchan' || wt === 'tanki') fu += 2;
        if (fu === 20 && !menzen) fu = 30;
        fu = Math.ceil(fu / 10) * 10;
      }
      finish(ym, yy, fu);
    }
    if (!cands.length) return null;
    cands.sort((a, b) => b.base - a.base || b.han - a.han || b.fu - a.fu);
    const r = cands[0];
    r.limit = limitName(r.han, r.fu, r.ym);
    return r;
  }

  const doraNext = k => k < 27 ? (k % 9 === 8 ? k - 8 : k + 1) : k < 31 ? (k === 30 ? 27 : k + 1) : (k === 33 ? 31 : k + 1);
  const sortH = a => a.sort((x, y) => (x >> 2) - (y >> 2) || x - y);
  const isRedId = id => id === 16 || id === 52 || id === 88;

  function rGame(o) {
    const opt = Object.assign({ aka: true, len: 2, seed: (Math.random() * 4e9) >>> 0 }, o);
    const R = mulberry(opt.seed);
    const S = { rules: { aka: !!opt.aka, len: opt.len }, pts: [25000, 25000, 25000, 25000], rnd: 0, honba: 0, sticks: 0, start: Math.floor(R() * 4), phase: 'idle', tid: 0, ev: [], over: false, nh: 0, final: null, res: null };
    const G = { s: S, opt };
    const em = e => S.ev.push(e);
    const rem = () => S.lend - S.wp;
    const nextP = p => (p + 1) & 3;
    const swOf = p => 27 + ((p - S.dealer + 4) & 3);
    const rwOf = () => 27 + ((S.rnd >> 2) & 3);
    const red = id => S.rules.aka && isRedId(id);
    const menzen = p => !S.m[p].some(m => m.open);

    function deal() {
      S.dealer = (S.start + S.rnd) % 4;
      const ids = []; for (let i = 0; i < 136; i++) ids.push(i);
      mjShuffle(ids, R);
      S.wall = ids; S.lend = 122; S.wp = 52; S.dead = ids.slice(122); S.rin = 0; S.dN = 1; S.pendDora = 0;
      S.h = [0, 1, 2, 3].map(p => sortH(ids.slice(p * 13, p * 13 + 13)));
      S.m = [[], [], [], []]; S.d = [[], [], [], []];
      S.ri = [0, 0, 0, 0]; S.riAt = [-1, -1, -1, -1]; S.riLens = [null, null, null, null]; S.ipp = [false, false, false, false]; S.tf = [false, false, false, false]; S.pf = [false, false, false, false]; S.first = [true, true, true, true];
      S.noCall = true; S.kans = 0; S.kanBy = -1; S.forbid = null; S.rpend = -1; S.last = null; S.reacts = null; S.resp = {}; S.res = null; S.drawn = -1; S.drawRin = false; S.kk = null;
      S.wv = [0, 0, 0, 0]; S.wc = [null, null, null, null]; S.dcount = 0; S.nh++;
      em({ k: 'deal' });
      startTurn(S.dealer, false);
    }
    function startTurn(p, rin) {
      const id = rin ? S.dead[S.rin++] : S.wall[S.wp++];
      S.h[p].push(id); S.wv[p]++;
      S.drawn = id; S.drawRin = !!rin; S.turn = p; S.phase = 'turn'; S.tid++; S.forbid = null; S.reacts = null; S.resp = {};
      em({ k: 'draw', p, id, rin: !!rin });
    }
    const cnt13 = p => countOf(S.h[p]);
    function waits(p) {
      if (S.wc[p] && S.wc[p].v === S.wv[p] && S.wc[p].m === S.m[p].length) return S.wc[p].w;
      const w = waitsOf(cnt13(p), S.m[p].length);
      S.wc[p] = { v: S.wv[p], m: S.m[p].length, w };
      return w;
    }
    function furi(p) {
      if (S.tf[p] || S.pf[p]) return true;
      const w = waits(p);
      for (const k of w) for (const d of S.d[p]) if ((d.id >> 2) === k) return true;
      return false;
    }
    function indicators() { const r = []; for (let i = 0; i < S.dN; i++) r.push(S.dead[4 + 2 * i]); return r; }
    function uras() { const r = []; for (let i = 0; i < S.dN; i++) r.push(S.dead[5 + 2 * i]); return r; }
    function evalFor(p, wid, tsumo, ex) {
      const hand = S.h[p].slice();
      if (!tsumo) hand.push(wid);
      const c = countOf(hand), ms = S.m[p];
      const all = hand.slice(); for (const m of ms) all.push(...m.ids);
      let dora = 0, ura = 0, aka = 0;
      const dk = indicators().map(i => doraNext(i >> 2));
      for (const id of all) { const k = id >> 2; for (const d of dk) if (d === k) dora++; if (red(id)) aka++; }
      const hi = { c, win: wid >> 2, tsumo, melds: ms.map(m => ({ t: m.t, k: m.k, open: m.open, kan: m.kan })), rw: rwOf(), sw: swOf(p), dora, ura: 0, aka };
      if (S.ri[p]) {
        hi.riichi = S.ri[p]; hi.ippatsu = S.ipp[p];
        const uk = uras().map(i => doraNext(i >> 2));
        for (const id of all) { const k = id >> 2; for (const d of uk) if (d === k) ura++; }
        hi.ura = ura;
      }
      if (tsumo && S.first[p] && S.noCall) { if (p === S.dealer) hi.tenhou = true; else hi.chiihou = true; }
      if (tsumo && S.drawRin) hi.rinshan = true;
      if (ex && ex.chankan) hi.chankan = true;
      if (rem() === 0 && !(ex && ex.chankan) && !(tsumo && S.drawRin)) hi.haitei = true;
      const r = evalHand(hi);
      if (r) { r.hi = hi; r.doraN = dora; r.uraN = ura; r.akaN = aka; }
      return r;
    }
    function tOpts(p) {
      const h = S.h[p], o = { tsumo: false, riichi: [], ankan: [], kakan: [], kyuushu: false, disc: [] }, nm = S.m[p].length, after = S.drawn < 0, ri = S.ri[p] > 0;
      if (!after && canWin(countOf(h), nm) && evalFor(p, S.drawn, true)) o.tsumo = true;
      o.disc = ri ? [S.drawn] : h.filter(id => !S.forbid || S.forbid.indexOf(id >> 2) < 0);
      if (!o.disc.length) o.disc = h.slice();
      if (after) return o;
      const c = countOf(h);
      if (!ri && menzen(p) && S.pts[p] >= 1000 && rem() >= 4) {
        const seen = new Set();
        for (const id of h) {
          const k = id >> 2;
          if (seen.has(k)) continue;
          seen.add(k);
          c[k]--;
          const w = waitsOf(c, nm);
          c[k]++;
          if (w.length) for (const x of h) if ((x >> 2) === k) o.riichi.push(x);
        }
      }
      if (S.kans < 4 && rem() > 0) {
        for (let k = 0; k < 34; k++) if (c[k] === 4) {
          if (ri) {
            if (k !== (S.drawn >> 2)) continue;
            const before = c.slice(); before[k]--;
            const w1 = waitsOf(before, nm);
            const after4 = c.slice(); after4[k] -= 4;
            const w2 = waitsOf(after4, nm + 1);
            if (w1.length !== w2.length || w1.some((x, i) => x !== w2[i])) continue;
          }
          o.ankan.push(k);
        }
        if (!ri) for (const m of S.m[p]) if (m.t === 't' && m.open && !m.kan) { const id = h.find(x => (x >> 2) === m.k); if (id != null) o.kakan.push(id); }
      }
      if (S.first[p] && S.noCall && S.d[p].length === 0) {
        let n = 0; for (const k of YAOCHUU) if (c[k]) n++;
        if (n >= 9) o.kyuushu = true;
      }
      return o;
    }
    function chiOpts(q, kind) {
      const h = S.h[q], r = [], lo = kind % 9;
      const pick = k => { const a = h.filter(id => (id >> 2) === k); if (!a.length) return -1; return a.find(id => !isRedId(id)) != null ? a.find(id => !isRedId(id)) : a[0]; };
      const add = (a, b) => { const A = pick(a), B = pick(b); if (A >= 0 && B >= 0) r.push([A, B]); };
      if (lo >= 2) add(kind - 2, kind - 1);
      if (lo >= 1 && lo <= 7) add(kind - 1, kind + 1);
      if (lo <= 6) add(kind + 1, kind + 2);
      return r;
    }
    function rOpts(q, kind, id, from, chan) {
      const o = {};
      if (waits(q).indexOf(kind) >= 0 && !furi(q) && evalFor(q, id, false, chan ? { chankan: true } : null)) o.ron = true;
      if (!chan && rem() > 0 && S.ri[q] === 0) {
        const n = S.h[q].filter(x => (x >> 2) === kind).length;
        if (n >= 2) o.pon = true;
        if (n >= 3 && S.kans < 4) o.kan = true;
        if (nextP(from) === q && kind < 27) { const c = chiOpts(q, kind); if (c.length) o.chi = c; }
      }
      return Object.keys(o).length ? o : null;
    }

    function turnAct(p, a) {
      const o = tOpts(p);
      if (a.t === 'discard') {
        const id = a.id;
        if (o.disc.indexOf(id) < 0) return false;
        if (a.riichi) { if (o.riichi.indexOf(id) < 0) return false; }
        doDiscard(p, id, !!a.riichi);
        return true;
      }
      if (a.t === 'tsumo') { if (!o.tsumo) return false; resolveWin([p], -1, true, null); return true; }
      if (a.t === 'ankan') {
        if (o.ankan.indexOf(a.k) < 0) return false;
        const ids = S.h[p].filter(x => (x >> 2) === a.k);
        S.h[p] = S.h[p].filter(x => (x >> 2) !== a.k); sortH(S.h[p]); S.wv[p]++;
        S.m[p].push({ t: 't', k: a.k, open: false, kan: true, ids, src: p, cid: -1 });
        noteKan(p); S.dN++; S.noCall = false; S.ipp.fill(false); S.first.fill(false);
        em({ k: 'call', p, t: 'ankan', ids, from: p });
        em({ k: 'dora', id: S.dead[4 + 2 * (S.dN - 1)] });
        S.lend--; startTurn(p, true);
        return true;
      }
      if (a.t === 'kakan') {
        if (o.kakan.indexOf(a.id) < 0) return false;
        const mi = S.m[p].findIndex(m => m.t === 't' && m.open && !m.kan && m.k === (a.id >> 2));
        S.kk = { p, id: a.id, mi };
        S.first.fill(false); S.noCall = false;
        em({ k: 'call', p, t: 'kakan', ids: [a.id], from: p });
        const reacts = {};
        for (let i = 1; i < 4; i++) { const q = (p + i) & 3; const r = rOpts(q, a.id >> 2, a.id, p, true); if (r && r.ron) reacts[q] = { ron: true }; }
        if (Object.keys(reacts).length) { S.reacts = reacts; S.resp = {}; S.phase = 'chankan'; S.tid++; return true; }
        finishKakan();
        return true;
      }
      if (a.t === 'kyuushu') {
        if (!o.kyuushu) return false;
        endAbort('Nine different terminals and honors', p);
        return true;
      }
      return false;
    }
    function noteKan(p) { S.kans++; S.kanBy = S.kanBy === -1 ? p : S.kanBy === p ? p : -2; }
    function finishKakan() {
      const { p, id, mi } = S.kk;
      S.h[p] = S.h[p].filter(x => x !== id); sortH(S.h[p]); S.wv[p]++;
      const m = S.m[p][mi]; m.kan = true; m.ids.push(id); m.add = id;
      noteKan(p); S.pendDora++; S.ipp.fill(false); S.kk = null;
      S.lend--; startTurn(p, true);
    }
    function doDiscard(p, id, decl) {
      const tg = id === S.drawn;
      S.h[p] = S.h[p].filter(x => x !== id); sortH(S.h[p]); S.wv[p]++;
      const rec = { id, riichi: decl, tg, called: false };
      S.d[p].push(rec); S.dcount++;
      S.last = { p, id, rec };
      S.tf[p] = false; S.ipp[p] = false; S.first[p] = false; S.drawn = -1; S.forbid = null;
      if (decl) S.rpend = p;
      em({ k: 'disc', p, id, riichi: decl, tg });
      const reacts = {};
      const kind = id >> 2;
      for (let i = 1; i < 4; i++) { const q = (p + i) & 3; const r = rOpts(q, kind, id, p, false); if (r) reacts[q] = r; }
      if (Object.keys(reacts).length) { S.reacts = reacts; S.resp = {}; S.phase = 'react'; S.tid++; return; }
      afterDiscard();
    }
    function establishRiichi() {
      const p = S.rpend;
      if (p < 0) return;
      S.rpend = -1;
      const dbl = S.d[p].length === 1 && S.noCall;
      S.ri[p] = dbl ? 2 : 1; S.riAt[p] = S.d[p].length - 1; S.ipp[p] = true; S.riLens[p] = S.d.map(d => d.length);
      S.pts[p] -= 1000; S.sticks++;
      em({ k: 'riichi', p, dbl });
    }
    function afterDiscard() {
      const p = S.last.p;
      establishRiichi();
      while (S.pendDora > 0) { S.pendDora--; S.dN++; em({ k: 'dora', id: S.dead[4 + 2 * (S.dN - 1)] }); }
      S.reacts = null; S.resp = {};
      if (S.kans === 4 && S.kanBy === -2) return endAbort('Four kans', p);
      if (S.ri.every(v => v > 0)) return endAbort('Four riichi', p);
      if (S.noCall && S.dcount === 4 && S.d.every(d => d.length === 1)) {
        const k = S.d[0][0].id >> 2;
        if (k >= 27 && k < 31 && S.d.every(d => (d[0].id >> 2) === k)) return endAbort('Four winds', p);
      }
      if (rem() === 0) return endDraw();
      startTurn(nextP(p), false);
    }
    function reactAct(p, a) {
      const r = S.reacts[p];
      if (S.phase === 'chankan') {
        if (a.t === 'ron' && r.ron) S.resp[p] = { t: 'ron' };
        else if (a.t === 'pass') S.resp[p] = { t: 'pass' };
        else return false;
      } else if (a.t === 'ron') { if (!r.ron) return false; S.resp[p] = { t: 'ron' }; }
      else if (a.t === 'pon') { if (!r.pon) return false; S.resp[p] = { t: 'pon' }; }
      else if (a.t === 'kan') { if (!r.kan) return false; S.resp[p] = { t: 'kan' }; }
      else if (a.t === 'chi') {
        if (!r.chi) return false;
        const ids = a.ids;
        const ok = Array.isArray(ids) && r.chi.find(c => (c[0] === ids[0] && c[1] === ids[1]) || (c[0] === ids[1] && c[1] === ids[0]));
        if (!ok) return false;
        S.resp[p] = { t: 'chi', ids: ok };
      } else if (a.t === 'pass') S.resp[p] = { t: 'pass' };
      else return false;
      if (Object.keys(S.reacts).every(q => S.resp[q])) resolveReact();
      return true;
    }
    function markPassed(rs) {
      for (const q of Object.keys(rs)) {
        const qi = +q;
        if (rs[q].ron && (!S.resp[q] || S.resp[q].t !== 'ron')) { if (S.ri[qi]) S.pf[qi] = true; else S.tf[qi] = true; }
      }
    }
    function resolveReact() {
      const rs = S.reacts, qs = Object.keys(rs).map(Number), resp = S.resp;
      const rons = qs.filter(q => resp[q].t === 'ron');
      if (S.phase === 'chankan') {
        if (rons.length) {
          const from = S.kk.p, id = S.kk.id;
          S.last = { p: from, id, rec: null };
          markPassed(rs);
          const order = [1, 2, 3].map(i => (from + i) & 3).filter(q => rons.indexOf(q) >= 0);
          return resolveWin(order, from, false, { chankan: true });
        }
        markPassed(rs);
        S.reacts = null; S.resp = {};
        return finishKakan();
      }
      if (rons.length) {
        markPassed(rs);
        if (rons.length >= 3) return endAbort('Triple ron', S.last.p);
        const from = S.last.p;
        const order = [1, 2, 3].map(i => (from + i) & 3).filter(q => rons.indexOf(q) >= 0);
        S.rpend = -1;
        return resolveWin(order, from, false, null);
      }
      const kn = qs.find(q => resp[q].t === 'kan'), pn = qs.find(q => resp[q].t === 'pon'), ch = qs.find(q => resp[q].t === 'chi');
      markPassed(rs);
      if (kn != null) return doCall(kn, 'kan', null);
      if (pn != null) return doCall(pn, 'pon', null);
      if (ch != null) return doCall(ch, 'chi', resp[ch].ids);
      afterDiscard();
    }
    function doCall(q, type, pair) {
      const L = S.last, kind = L.id >> 2, from = L.p;
      establishRiichi();
      L.rec.called = true;
      let own;
      if (type === 'chi') own = pair.slice();
      else {
        const same = S.h[q].filter(x => (x >> 2) === kind);
        own = type === 'kan' ? same.slice(0, 3) : same.slice().sort((a, b) => isRedId(b) - isRedId(a)).slice(0, 2);
      }
      S.h[q] = S.h[q].filter(x => own.indexOf(x) < 0); sortH(S.h[q]); S.wv[q]++;
      const ids = own.concat([L.id]);
      let k = kind;
      if (type === 'chi') { k = Math.min(...ids.map(x => x >> 2)); ids.sort((a, b) => (a >> 2) - (b >> 2)); }
      const m = { t: type === 'chi' ? 's' : 't', k, open: true, kan: type === 'kan', ids, src: from, cid: L.id };
      S.m[q].push(m);
      S.noCall = false; S.ipp.fill(false); S.first.fill(false);
      em({ k: 'call', p: q, t: type, ids, from });
      S.reacts = null; S.resp = {};
      if (type === 'kan') { noteKan(q); S.pendDora++; S.lend--; startTurn(q, true); return; }
      S.turn = q; S.phase = 'turn'; S.tid++; S.drawn = -1; S.drawRin = false;
      if (type === 'pon') S.forbid = [kind];
      else { S.forbid = [kind]; const ks = ids.map(x => x >> 2).sort((a, b) => a - b); if (kind === ks[0] && kind % 9 <= 5) S.forbid.push(kind + 3); if (kind === ks[2] && kind % 9 >= 3) S.forbid.push(kind - 3); }
    }

    function resolveWin(ws, from, tsumo, ex) {
      const wins = [], deltas = [0, 0, 0, 0];
      ws.forEach((p, i) => {
        const wid = tsumo ? S.drawn : S.last.id;
        const r = evalFor(p, wid, tsumo, ex);
        const dl = p === S.dealer, hon = i === 0 ? S.honba : 0;
        const pay = payments(r.base, dl, tsumo, hon);
        if (tsumo) {
          for (let q = 0; q < 4; q++) if (q !== p) { const v = dl ? pay.each : q === S.dealer ? pay.dealer : pay.other; deltas[q] -= v; deltas[p] += v; }
        } else { deltas[from] -= pay.ron; deltas[p] += pay.ron; }
        if (i === 0) deltas[p] += S.sticks * 1000;
        const hand = S.h[p].slice(); if (!tsumo) hand.push(wid);
        wins.push({ p, from, tsumo, han: r.han, fu: r.fu, ym: r.ym, yaku: r.yaku, limit: r.limit, base: r.base, pay, win: wid, hand: sortH(hand), melds: S.m[p].map(m => ({ t: m.t, k: m.k, open: m.open, kan: m.kan, ids: m.ids.slice(), src: m.src, cid: m.cid, add: m.add })), riichi: S.ri[p], honba: hon, sticks: i === 0 ? S.sticks : 0, gain: deltas[p] });
      });
      for (let q = 0; q < 4; q++) S.pts[q] += deltas[q];
      const ind = indicators(), ura = wins.some(w => w.riichi) ? uras() : [];
      S.sticks = 0;
      const renchan = ws.indexOf(S.dealer) >= 0;
      conclude({ kind: 'win', wins, deltas, ind, ura, renchan, hands: {}, from }, renchan);
    }
    function tenpaiList() { return [0, 1, 2, 3].map(p => waits(p).length > 0); }
    function endDraw() {
      const tp = tenpaiList();
      const nT = tp.filter(Boolean).length, deltas = [0, 0, 0, 0];
      const nagashi = [];
      for (let p = 0; p < 4; p++) if (S.d[p].length && S.d[p].every(d => !d.called && isYao(d.id >> 2))) nagashi.push(p);
      if (nagashi.length) {
        for (const p of nagashi) {
          const dl = p === S.dealer, pay = payments(2000, dl, true, 0);
          for (let q = 0; q < 4; q++) if (q !== p) { const v = dl ? pay.each : q === S.dealer ? pay.dealer : pay.other; deltas[q] -= v; deltas[p] += v; }
        }
      } else if (nT > 0 && nT < 4) {
        for (let p = 0; p < 4; p++) deltas[p] += tp[p] ? 3000 / nT : -3000 / (4 - nT);
      }
      for (let q = 0; q < 4; q++) S.pts[q] += deltas[q];
      const hands = {}; tp.forEach((t, p) => { if (t) hands[p] = { hand: S.h[p].slice(), melds: S.m[p].map(m => ({ t: m.t, k: m.k, open: m.open, kan: m.kan, ids: m.ids.slice(), src: m.src, cid: m.cid, add: m.add })), waits: waits(p) }; });
      const renchan = tp[S.dealer];
      conclude({ kind: 'draw', reason: nagashi.length ? 'Nagashi mangan' : 'Exhaustive draw', nagashi, tenpai: tp, hands, deltas, ind: indicators(), ura: [], renchan }, renchan);
    }
    function endAbort(reason, p) {
      const hands = {};
      conclude({ kind: 'abort', reason, who: p, tenpai: [false, false, false, false], hands, deltas: [0, 0, 0, 0], ind: indicators(), ura: [], renchan: true }, true);
    }
    function conclude(res, renchan) {
      const L = 4 * S.rules.len;
      let over = false;
      const top = Math.max(...S.pts), dl = S.dealer;
      if (S.pts.some(v => v < 0)) over = true;
      else if (renchan) { if (S.rnd >= L - 1 && S.pts[dl] >= 30000 && S.pts[dl] === top && (res.kind === 'win' || res.tenpai && res.tenpai[dl])) over = true; }
      else { const nr = S.rnd + 1; if (nr >= L && (top >= 30000 || nr >= L + 4)) over = true; }
      res.over = over;
      res.pts = S.pts.slice();
      res.sticks = S.sticks;
      S.res = res; S.phase = 'result'; S.tid++; S.reacts = null; S.resp = {};
      S.nextRenchan = renchan; S.nextHonba = res.kind === 'win' ? (renchan ? S.honba + 1 : 0) : S.honba + 1;
      em({ k: 'result', res });
    }
    function nextHand() {
      const res = S.res;
      if (res.over) {
        const pts = S.pts.slice();
        const order = [0, 1, 2, 3].sort((a, b) => pts[b] - pts[a] || ((a - S.start + 4) & 3) - ((b - S.start + 4) & 3));
        if (S.sticks) { pts[order[0]] += S.sticks * 1000; S.sticks = 0; }
        S.pts = pts;
        S.final = order.map((p, i) => ({ p, pts: pts[p], rank: i + 1 }));
        S.phase = 'over'; S.over = true; S.tid++;
        em({ k: 'over', final: S.final });
        return true;
      }
      if (!S.nextRenchan) S.rnd++;
      S.honba = S.nextHonba;
      deal();
      return true;
    }

    G.act = (p, a) => {
      if (!a || typeof a.t !== 'string' || !(p >= 0 && p < 4)) return false;
      const ph = S.phase;
      if (ph === 'turn') return p === S.turn ? turnAct(p, a) : false;
      if ((ph === 'react' || ph === 'chankan') && S.reacts && S.reacts[p] && !S.resp[p]) return reactAct(p, a);
      if (ph === 'result' && a.t === 'next') return nextHand();
      return false;
    };
    G.need = () => {
      const ph = S.phase;
      if (ph === 'turn') return { ps: [S.turn], kind: 'turn' };
      if (ph === 'react' || ph === 'chankan') return { ps: Object.keys(S.reacts).filter(q => !S.resp[q]).map(Number), kind: 'react' };
      return { ps: [], kind: ph };
    };
    G.take = () => { const e = S.ev; S.ev = []; return e; };
    G.start = () => { S.rnd = 0; S.honba = 0; S.sticks = 0; deal(); };
    G.opts = tOpts;
    G.rOpts = p => S.reacts && S.reacts[p] && !S.resp[p] ? S.reacts[p] : null;
    G.waits = waits;
    G.furi = furi;
    G.evalFor = evalFor;
    G.indicators = indicators;
    G.view = q => {
      const v = {
        q, rnd: S.rnd, wind: rwOf(), dealer: S.dealer, honba: S.honba, sticks: S.sticks, pts: S.pts.slice(), phase: S.phase, turn: S.turn, tid: S.tid, nh: S.nh,
        rules: S.rules, start: S.start, left: S.phase === 'idle' ? 70 : rem(), ind: S.phase === 'idle' ? [] : indicators(), kans: S.kans,
        hand: S.h ? sortH(S.h[q].filter(id => id !== S.drawn || S.turn !== q || S.phase !== 'turn')) : [], drawn: S.phase === 'turn' && S.turn === q ? S.drawn : -1,
        cnt: S.h ? S.h.map((h, p) => h.length) : [0, 0, 0, 0], melds: S.m ? S.m.map(ms => ms.map(m => ({ t: m.t, k: m.k, open: m.open, kan: m.kan, ids: m.ids.slice(), src: m.src, cid: m.cid, add: m.add }))) : [[], [], [], []],
        disc: S.d ? S.d.map(ds => ds.map(d => ({ id: d.id, riichi: d.riichi, tg: d.tg, called: d.called }))) : [[], [], [], []],
        ri: S.ri ? S.ri.slice() : [0, 0, 0, 0], rl: S.riLens ? S.riLens.map(x => x && x.slice()) : [null, null, null, null], riAt: S.riAt ? S.riAt.slice() : [-1, -1, -1, -1], last: S.last ? { p: S.last.p, id: S.last.id } : null,
        dr: S.phase === 'turn' && S.turn !== q ? 1 : 0, over: S.over, final: S.final, res: S.phase === 'result' || S.phase === 'over' ? S.res : null
      };
      if (S.h && S.phase === 'turn' && S.turn === q) { v.to = tOpts(q); v.forbid = S.forbid; }
      if (S.h && (S.phase === 'react' || S.phase === 'chankan') && S.reacts && S.reacts[q] && !S.resp[q]) v.rx = Object.assign({ id: S.phase === 'chankan' ? S.kk.id : S.last.id, from: S.phase === 'chankan' ? S.kk.p : S.last.p }, S.reacts[q]);
      if (S.h && S.phase !== 'idle') { v.fur = furi(q); v.pass = !!(S.resp && S.resp[q]); }
      if (S.h && S.phase === 'react' && S.reacts) v.rwait = Object.keys(S.reacts).filter(x => !S.resp[x]).map(Number);
      return v;
    };
    return G;
  }

  const RAI = {
    Easy: { def: 0, noise: .38, call: .4, dama: 0, lookNoise: 1 },
    Normal: { def: 1, noise: .08, call: 1, dama: 0, lookNoise: 0 },
    Hard: { def: 2, noise: 0, call: 1, dama: 1, lookNoise: 0 }
  };
  function rvCount(v) {
    const vis = new Int8Array(34);
    for (const id of v.hand) vis[id >> 2]++;
    if (v.drawn >= 0) vis[v.drawn >> 2]++;
    for (let p = 0; p < 4; p++) {
      for (const d of v.disc[p]) if (!d.called) vis[d.id >> 2]++;
      for (const m of v.melds[p]) for (const id of m.ids) vis[id >> 2]++;
    }
    for (const id of v.ind) vis[id >> 2]++;
    return vis;
  }
  function rvEval(v, q, ids, melds, wid, tsumo, flags) {
    const c = countOf(ids), all = ids.slice();
    for (const m of melds) all.push(...m.ids);
    let dora = 0, aka = 0;
    const dk = v.ind.map(i => doraNext(i >> 2));
    for (const id of all) { const k = id >> 2; for (const d of dk) if (d === k) dora++; if (v.rules.aka && isRedId(id)) aka++; }
    const hi = { c, win: wid >> 2, tsumo, melds: melds.map(m => ({ t: m.t, k: m.k, open: m.open, kan: m.kan })), rw: v.wind, sw: 27 + ((q - v.dealer + 4) & 3), dora, ura: 0, aka };
    if (v.ri[q]) hi.riichi = v.ri[q];
    else if (flags && flags.riichi) hi.riichi = 1;
    return evalHand(hi);
  }
  function rvDanger(v, q) {
    const threats = [];
    for (let p = 0; p < 4; p++) if (p !== q && v.ri[p] > 0) {
      const safe = new Set();
      for (const d of v.disc[p]) safe.add(d.id >> 2);
      const rl = v.rl && v.rl[p];
      for (let x = 0; x < 4; x++) if (x !== p) v.disc[x].forEach((d, i) => { if (rl && i >= rl[x]) safe.add(d.id >> 2); });
      const my = new Set(); for (const d of v.disc[p]) my.add(d.id >> 2);
      threats.push({ p, safe, my, dl: p === v.dealer ? 1.35 : 1 });
    }
    const vis = rvCount(v);
    const risk = k => {
      let tot = 0;
      for (const t of threats) {
        if (t.safe.has(k)) continue;
        let b;
        if (k >= 27) { const n = vis[k]; b = n >= 3 ? 0.004 : n === 2 ? .016 : n === 1 ? .032 : .055; }
        else {
          const n = k % 9, base = k - n;
          b = n === 0 || n === 8 ? .05 : n === 1 || n === 7 ? .065 : n === 2 || n === 6 ? .08 : .095;
          const lo = n >= 3 && t.my.has(base + n - 3), hi = n <= 5 && t.my.has(base + n + 3);
          if (n >= 3 && n <= 5) { if (lo && hi) b *= .22; else if (lo || hi) b *= .5; }
          else if (n < 3) { if (hi) b *= .5; }
          else if (lo) b *= .5;
          if (vis[k] >= 3) b *= .6;
        }
        tot += b * t.dl;
      }
      return tot;
    };
    return { threats, risk };
  }
  function rvYakuPotential(v, q, c, ms, calledKind) {
    const rw = v.wind, sw = 27 + ((q - v.dealer + 4) & 3);
    for (const m of ms) if (m.t === 't' && (m.k >= 31 || m.k === rw || m.k === sw)) return true;
    for (const k of [31, 32, 33, rw, sw]) if (c[k] >= 3) return true;
    let simple = true, suit = -1, mixed = false;
    const kinds = [];
    for (let k = 0; k < 34; k++) if (c[k]) kinds.push(k);
    for (const m of ms) { if (m.t === 's') { kinds.push(m.k, m.k + 2); } else kinds.push(m.k); }
    for (const k of kinds) {
      if (isYao(k)) simple = false;
      if (k < 27) { const s = k / 9 | 0; if (suit < 0) suit = s; else if (suit !== s) mixed = true; }
    }
    if (simple) return true;
    if (!mixed && suit >= 0) return true;
    if (ms.length && ms.every(m => m.t === 't')) { let pr = 0; for (let k = 0; k < 34; k++) if (c[k] >= 2) pr++; if (pr >= 3) return true; }
    void calledKind;
    return false;
  }
  function rAiTurn(v, lvl, rnd) {
    const P = RAI[lvl] || RAI.Normal, q = v.q, to = v.to;
    rnd = rnd || Math.random;
    if (to.tsumo) return { t: 'tsumo' };
    const nm = v.melds[q].length, h = v.hand.slice();
    if (v.drawn >= 0) h.push(v.drawn);
    const c = countOf(h);
    if (v.ri[q]) {
      if (to.ankan.length && P.def >= 1) return { t: 'ankan', k: to.ankan[0] };
      return { t: 'discard', id: v.drawn };
    }
    if (to.kyuushu) {
      let n = 0; for (const k of YAOCHUU) if (c[k]) n++;
      if (n <= 10 || (P.def < 1 && n <= 11)) return { t: 'kyuushu' };
    }
    const vis = rvCount(v), dg = rvDanger(v, q);
    const base = shanten(c, nm);
    const rep = new Map();
    for (const id of to.disc) {
      const k = id >> 2, cur = rep.get(k);
      if (cur == null || (isRedId(cur) && !isRedId(id))) rep.set(k, id);
    }
    const cands = [];
    const dkinds = v.ind.map(i => doraNext(i >> 2));
    for (const [k, id] of rep) {
      c[k]--;
      const sh = shanten(c, nm);
      let uk = 0;
      for (let t = 0; t < 34; t++) {
        if (c[t] >= 4) continue;
        const left = 4 - vis[t];
        if (left <= 0) continue;
        c[t]++;
        const s2 = shanten(c, nm);
        c[t]--;
        if (s2 < sh) uk += left;
      }
      c[k]++;
      let val = 0;
      if (dkinds.indexOf(k) >= 0) val += 38;
      if (v.rules.aka && isRedId(id)) val += 45;
      if (k >= 31 || k === v.wind || k === 27 + ((q - v.dealer + 4) & 3)) { val += c[k] >= 2 ? 26 : 2; }
      else if (k >= 27) val -= 1;
      const num = k < 27 ? k % 9 : -1;
      if (num >= 0) { if (num >= 2 && num <= 6) val += 3 + (num === 4 ? 2 : 0); else if (num === 0 || num === 8) val -= 3; }
      cands.push({ id, k, sh, uk, val, score: -sh * 10000 + uk * 12 - val + (P.noise ? (rnd() - .5) * 160 * P.noise : 0), danger: dg.risk(k) });
    }
    const bestSh = Math.min(...cands.map(x => x.sh));
    let pick;
    const threat = dg.threats.length > 0;
    if (threat && P.def > 0) {
      let fold = false;
      if (bestSh >= 2) fold = true;
      else if (bestSh === 1) {
        const ukMax = Math.max(...cands.filter(x => x.sh === 1).map(x => x.uk));
        const val = P.def >= 2 ? rvQuick(v, q, h, nm) : 0;
        fold = ukMax < 12 && val < 5200;
        if (P.def < 2) fold = ukMax < 10;
      }
      if (fold) pick = cands.slice().sort((a, b) => a.danger - b.danger || b.score - a.score)[0];
      else {
        const W = bestSh === 0 ? 450 : 900;
        pick = cands.slice().sort((a, b) => (b.score - b.danger * W) - (a.score - a.danger * W))[0];
        if (pick.sh > bestSh && bestSh === 0) pick = cands.filter(x => x.sh === 0).sort((a, b) => (b.score - b.danger * W) - (a.score - a.danger * W))[0];
      }
    } else pick = cands.slice().sort((a, b) => b.score - a.score)[0];
    if (to.ankan.length && P.def >= 1 && !threat) {
      for (const k of to.ankan) { c[k] -= 4; const s2 = shanten(c, nm + 1); c[k] += 4; if (s2 <= base && (k >= 27 || k % 9 === 0 || k % 9 === 8 || s2 < base || P.def >= 2)) return { t: 'ankan', k }; }
    }
    if (to.kakan.length && !threat && P.def >= 1) {
      for (const id of to.kakan) { const k = id >> 2; c[k]--; const s2 = shanten(c, nm); c[k]++; if (s2 <= base) return { t: 'kakan', id }; }
    }
    if (to.riichi.indexOf(pick.id) >= 0 || (pick.sh === 0 && to.riichi.length)) {
      const rid = to.riichi.indexOf(pick.id) >= 0 ? pick.id : null;
      if (rid != null && wantRiichi(v, q, h, rid, vis, P, threat)) return { t: 'discard', id: rid, riichi: true };
    }
    return { t: 'discard', id: pick.id };
  }
  function rvQuick(v, q, h, nm) {
    void nm;
    let dora = 0;
    const dk = v.ind.map(i => doraNext(i >> 2));
    for (const id of h) { if (dk.indexOf(id >> 2) >= 0) dora++; if (v.rules.aka && isRedId(id)) dora++; }
    for (const m of v.melds[q]) for (const id of m.ids) { if (dk.indexOf(id >> 2) >= 0) dora++; if (v.rules.aka && isRedId(id)) dora++; }
    return 1000 + dora * 1800 + (v.melds[q].length ? 0 : 1600);
  }
  function wantRiichi(v, q, h, rid, vis, P, threat) {
    const rest = h.filter(x => x !== rid), c = countOf(rest);
    const w = waitsOf(c, v.melds[q].length);
    if (!w.length) return false;
    let left = 0; for (const k of w) left += Math.max(0, 4 - vis[k]);
    if (P.def === 0) return true;
    const dama = w.map(k => rvEval(v, q, rest.concat([k * 4]), v.melds[q], k * 4, false)).filter(Boolean);
    const best = dama.length ? Math.max(...dama.map(r => r.base)) : 0;
    if (left <= 0) return false;
    if (P.def >= 2) {
      if (best >= 2000 && dama.length === w.length) return false;
      if (left <= 1 && threat) return false;
      if (v.pts[q] < 3000) return false;
    } else if (left <= 1) return false;
    if (v.left < 6) return false;
    return true;
  }
  function rAiReact(v, lvl, rnd) {
    const P = RAI[lvl] || RAI.Normal, q = v.q, rx = v.rx;
    rnd = rnd || Math.random;
    if (rx.ron) return { t: 'ron' };
    if (v.ri[q]) return { t: 'pass' };
    const nm = v.melds[q].length, kind = rx.id >> 2;
    const c0 = countOf(v.hand);
    const s0 = shanten(c0, nm);
    const menz = !v.melds[q].some(m => m.open);
    if (menz && s0 === 0) return { t: 'pass' };
    const dg = rvDanger(v, q);
    const tryCall = (type, own, meldK, meldT) => {
      const c = c0.slice();
      for (const id of own) c[id >> 2]--;
      const ms = v.melds[q].concat([{ t: meldT, k: meldK, open: true, kan: false, ids: own.concat([rx.id]) }]);
      let best = 9;
      for (let k = 0; k < 34; k++) {
        if (!c[k]) continue;
        if (k === kind && type === 'pon') continue;
        c[k]--;
        const s = shanten(c, nm + 1);
        c[k]++;
        if (s < best) best = s;
      }
      if (best >= s0 && !(best === 0 && s0 === 0)) return null;
      if (dg.threats.length && P.def > 0 && best >= 1) return null;
      if (!rvYakuPotential(v, q, c, ms, kind)) return null;
      if (P.def >= 1 && menz && s0 <= 1 && best >= s0 - 0 && type === 'chi') return null;
      if (P.def >= 2 && type === 'chi' && menz && s0 <= 2 && rvQuick(v, q, v.hand, nm) >= 3000) return null;
      return best;
    };
    if (rx.pon) {
      const own = v.hand.filter(id => (id >> 2) === kind).slice(0, 2);
      const yk = kind >= 31 || kind === v.wind || kind === 27 + ((q - v.dealer + 4) & 3);
      const b = tryCall('pon', own, kind, 't');
      if (b != null && rnd() < P.call) return { t: 'pon' };
      if (yk && b == null && s0 >= 2 && !dg.threats.length && rnd() < P.call) return { t: 'pon' };
    }
    if (rx.chi && P.call >= 1 || (rx.chi && rnd() < P.call * .5)) {
      let bestO = null, bs = 99;
      for (const pr of rx.chi) {
        const ids = pr.concat([rx.id]), k0 = Math.min(...ids.map(x => x >> 2));
        const b = tryCall('chi', pr, k0, 's');
        if (b != null && b < bs) { bs = b; bestO = pr; }
      }
      if (bestO) return { t: 'chi', ids: bestO };
    }
    return { t: 'pass' };
  }
  function rAiAny(v, lvl) {
    if (v.to) return rAiTurn(v, lvl);
    if (v.rx) return rAiReact(v, lvl);
    return null;
  }

  const RM_CSS = `
.gm-mahjong{gap:0}
.gm-mahjong [hidden]{display:none!important}
.gm-mahjong .rm-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(6,30,20,.4);background:#0c4a2e;display:flex;flex-direction:column;font-family:var(--sans);color:#fff;user-select:none;-webkit-user-select:none}
.gm-mahjong .rm-bar{display:flex;align-items:center;gap:6px 8px;padding:7px 10px;background:linear-gradient(#173d2b,#10301f);border-bottom:2px solid rgba(0,0,0,.35)}
.gm-mahjong .rm-info{display:flex;flex-direction:column;line-height:1.1;min-width:0}
.gm-mahjong .rm-info b{font:900 16px var(--sans);white-space:nowrap}
.gm-mahjong .rm-info span{font:800 10.5px var(--sans);color:rgba(255,255,255,.62);white-space:nowrap}
.gm-mahjong .rm-sp{flex:1}
.gm-mahjong .rm-net{font:800 11px var(--sans);color:#8ef0b0;display:flex;align-items:center;gap:5px;white-space:nowrap}
.gm-mahjong .rm-net i{width:8px;height:8px;border-radius:50%;background:#46d37a;display:inline-block}
.gm-mahjong .rm-net.bad{color:#ff9d90}
.gm-mahjong .rm-net.bad i{background:#ff5b4b}
.gm-mahjong .rm-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 12px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.09);color:#fff;font:800 13px var(--sans);cursor:pointer;touch-action:manipulation}
.gm-mahjong .rm-b:hover{background:rgba(255,255,255,.18)}
.gm-mahjong .rm-b[aria-pressed=true]{background:#f1b92a;border-color:#fff3c9;color:#2b1d00}
.gm-mahjong .rm-b svg{width:16px;height:16px;flex:none}
.gm-mahjong .rm-narrow .rm-b span{display:none}
.gm-mahjong .rm-narrow .rm-b{padding:0 10px;min-width:38px}
.gm-mahjong .rm-stage{position:relative;line-height:0}
.gm-mahjong canvas{display:block;width:100%;height:auto;touch-action:none}
.gm-mahjong .rm-acts{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:flex-end;flex-wrap:wrap;gap:8px;padding:0 8px;pointer-events:none;z-index:3;line-height:1}
.gm-mahjong .rm-acts button{pointer-events:auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:44px;padding:0 20px;border-radius:14px;border:0;color:#fff;font:900 17px var(--sans);cursor:pointer;touch-action:manipulation;box-shadow:inset 0 -4px 0 rgba(0,0,0,.24),0 5px 12px rgba(0,0,0,.4);animation:rm-pulse 1.1s ease-in-out infinite}
.gm-mahjong .rm-acts button img{display:block;height:30px;width:auto}
.gm-mahjong .rm-acts button.win{background:linear-gradient(#ff7a5e,#d3301b);font-size:20px;padding:0 26px}
.gm-mahjong .rm-acts button.call{background:linear-gradient(#45c463,#1f8a3a)}
.gm-mahjong .rm-acts button.rii{background:linear-gradient(#4fa2ff,#1f62c9)}
.gm-mahjong .rm-acts button.rii[aria-pressed=true]{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00}
.gm-mahjong .rm-acts button.pass{background:linear-gradient(#78808a,#4d545c);animation:none}
.gm-mahjong .rm-acts button.abort{background:linear-gradient(#b985ff,#7b3fd6)}
.gm-mahjong .rm-acts button small{font:800 11px var(--sans);opacity:.85;margin-left:2px}
@keyframes rm-pulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.gm-mahjong .rm-pane{position:absolute;inset:0;z-index:5;display:flex;align-items:flex-start;justify-content:center;padding:10px;background:rgba(4,22,14,.74);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;line-height:1.2}
.gm-mahjong .rm-pane.clear{background:rgba(4,22,14,.5)}
.gm-mahjong .rm-box{width:100%;max-width:700px;margin:auto;background:linear-gradient(#245a40,#143826);border:3px solid rgba(255,255,255,.16);border-radius:20px;padding:16px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.5);animation:rm-in .25s}
@keyframes rm-in{from{transform:scale(.95);opacity:0}to{transform:none;opacity:1}}
.gm-mahjong .rm-box h2{margin:0 0 4px;font:900 28px var(--sans);letter-spacing:-.02em}
.gm-mahjong .rm-box h3{margin:2px 0 8px;font:900 21px var(--sans)}
.gm-mahjong .rm-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.86)}
.gm-mahjong .rm-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:#ffd36b!important;margin:0 0 2px!important}
.gm-mahjong .rm-big{display:block;width:100%;min-height:50px;margin:8px 0;border:0;border-radius:15px;color:#fff;font:900 18px/1.05 var(--sans);cursor:pointer;box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);touch-action:manipulation}
.gm-mahjong .rm-big:disabled{opacity:.55;cursor:default}
.gm-mahjong .rm-big.gold{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00}
.gm-mahjong .rm-big.green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-mahjong .rm-big.blue{background:linear-gradient(#4fa2ff,#1f62c9)}
.gm-mahjong .rm-big.red{background:linear-gradient(#ff6a5a,#cf2a1c)}
.gm-mahjong .rm-sm{min-height:42px;padding:0 16px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);cursor:pointer;touch-action:manipulation}
.gm-mahjong .rm-sm:disabled{opacity:.5;cursor:default}
.gm-mahjong .rm-row{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:8px 0}
.gm-mahjong .rm-seg{display:inline-flex;border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,.25)}
.gm-mahjong .rm-seg button{min-height:38px;padding:0 14px;border:0;background:rgba(255,255,255,.07);color:#fff;font:800 13px var(--sans);cursor:pointer}
.gm-mahjong .rm-seg button+button{border-left:2px solid rgba(255,255,255,.18)}
.gm-mahjong .rm-seg button.on{background:#f1b92a;color:#2a1e00}
.gm-mahjong .rm-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:9px 0;font:800 14px var(--sans);text-align:left}
.gm-mahjong .rm-opt>span{flex:1}
.gm-mahjong .rm-tg{position:relative;width:46px;height:26px;border-radius:13px;border:0;background:rgba(255,255,255,.22);cursor:pointer;padding:0;flex:none}
.gm-mahjong .rm-tg::after{content:'';position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .18s}
.gm-mahjong .rm-tg[aria-checked=true]{background:#2fb35a}
.gm-mahjong .rm-tg[aria-checked=true]::after{transform:translateX(20px)}
.gm-mahjong .rm-tiles{display:flex;justify-content:center;align-items:flex-end;flex-wrap:wrap;gap:0;margin:6px 0;line-height:0}
.gm-mahjong .rm-tiles img{display:block}
.gm-mahjong .rm-tiles .gap{width:10px}
.gm-mahjong .rm-tiles .win{filter:drop-shadow(0 0 5px #ffd84a)}
.gm-mahjong .rm-tiles .meld{display:flex;align-items:flex-end;margin-left:8px}
.gm-mahjong .rm-tiles .meld img.side{transform-origin:center;}
.gm-mahjong .rm-lab{font:900 10.5px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.55);margin:8px 0 2px}
.gm-mahjong .rm-yk{width:100%;max-width:340px;margin:6px auto;border-collapse:collapse;font:800 14px var(--sans)}
.gm-mahjong .rm-yk td{padding:3px 6px;text-align:left;border-bottom:1px solid rgba(255,255,255,.1)}
.gm-mahjong .rm-yk td:last-child{text-align:right;color:#ffd36b;width:70px}
.gm-mahjong .rm-yk tr.sum td{border:0;font-size:16px;color:#fff;padding-top:7px}
.gm-mahjong .rm-yk tr.sum td:last-child{color:#fff}
.gm-mahjong .rm-pt .rk+td{text-align:left}
.gm-mahjong .rm-narrow .rm-box{padding:10px}
.gm-mahjong .rm-narrow .rm-box h2{font-size:22px}
.gm-mahjong .rm-narrow .rm-box p{margin:3px 0}
.gm-mahjong .rm-narrow .rm-yk td{padding:1px 6px;font-size:12.5px}
.gm-mahjong .rm-pane [data-a=next],.gm-mahjong .rm-pane [data-a=final]{position:sticky;bottom:0}
.gm-mahjong .rm-lim{font:900 22px var(--sans);color:#ffd36b;margin:2px 0}
.gm-mahjong .rm-win{padding:8px 4px 6px;margin:8px 0;border-radius:14px;background:rgba(0,0,0,.2)}
.gm-mahjong .rm-pt{width:100%;margin:8px 0;border-collapse:separate;border-spacing:0 4px;font:800 14px var(--sans)}
.gm-mahjong .rm-pt td{padding:6px 8px;background:rgba(0,0,0,.24)}
.gm-mahjong .rm-pt td:first-child{border-radius:10px 0 0 10px;text-align:left}
.gm-mahjong .rm-pt td:last-child{border-radius:0 10px 10px 0;text-align:right;font-variant-numeric:tabular-nums}
.gm-mahjong .rm-pt tr.me td{background:rgba(255,211,107,.2)}
.gm-mahjong .rm-pt .up{color:#8ef0b0}
.gm-mahjong .rm-pt .dn{color:#ff9d90}
.gm-mahjong .rm-pt td.rk{width:34px;text-align:center;font-weight:900;color:#ffd36b}
.gm-mahjong .rm-rules{text-align:left}
.gm-mahjong .rm-rules h4{margin:14px 0 4px;font:900 15px var(--sans);color:#ffd36b}
.gm-mahjong .rm-rules p,.gm-mahjong .rm-rules li{font:700 13px/1.45 var(--sans)!important}
.gm-mahjong .rm-rules ul{margin:4px 0;padding-left:18px}
.gm-mahjong .rm-rules table{width:100%;border-collapse:collapse;font:700 12px var(--sans);margin:6px 0}
.gm-mahjong .rm-rules th,.gm-mahjong .rm-rules td{padding:3px 5px;border:1px solid rgba(255,255,255,.14);text-align:center}
.gm-mahjong .rm-rules th{background:rgba(0,0,0,.28);color:#ffd36b}
.gm-mahjong .rm-rules td.l{text-align:left}
.gm-mahjong .rm-rules kbd{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.gm-mahjong .rm-sc{overflow-x:auto}
.gm-mahjong .rm-wait{font:800 13px var(--sans);color:rgba(255,255,255,.7);margin-top:6px}
@media (pointer:coarse){.gm-mahjong .rm-b{height:42px}}
`;

  const RM_YAKU = [
    ['1 han', [['Riichi', 'Closed hand, tenpai, 1,000 stick'], ['Ippatsu', 'Win within one go-round of riichi'], ['Menzen Tsumo', 'Closed hand self-draw'], ['Tanyao', 'Only 2-8 tiles'], ['Pinfu', 'Four runs, valueless pair, two-sided wait'], ['Iipeikou', 'Two identical runs, closed'], ['Yakuhai', 'Triplet of dragons, seat wind or round wind'], ['Haitei / Houtei', 'Last tile from the wall / last discard'], ['Rinshan Kaihou', 'Win on the replacement tile after a kan'], ['Chankan', 'Rob a tile added to a kan']]],
    ['2 han', [['Double Riichi', 'Riichi on your first discard'], ['Chiitoitsu', 'Seven pairs (25 fu)'], ['Sanshoku Doujun', 'Same run in all three suits (1 open)'], ['Ittsu', '123, 456, 789 in one suit (1 open)'], ['Toitoi', 'Four triplets'], ['Sanankou', 'Three concealed triplets'], ['Sanshoku Doukou', 'Same triplet in all three suits'], ['Sankantsu', 'Three kans'], ['Chanta', 'Every set has a terminal or honor (1 open)'], ['Honroutou', 'Only terminals and honors'], ['Shousangen', 'Two dragon triplets and a dragon pair']]],
    ['3 han +', [['Honitsu', 'One suit plus honors (3 closed, 2 open)'], ['Junchan', 'Every set has a terminal (3 closed, 2 open)'], ['Ryanpeikou', 'Two sets of identical runs, closed (3)'], ['Chinitsu', 'One suit only (6 closed, 5 open)']]],
    ['Yakuman', [['Kokushi Musou', 'Thirteen orphans'], ['Suuankou', 'Four concealed triplets'], ['Daisangen', 'Three dragon triplets'], ['Shousuushii / Daisuushii', 'Little / big four winds'], ['Tsuuiisou', 'All honors'], ['Chinroutou', 'All terminals'], ['Ryuuiisou', 'All green'], ['Chuuren Poutou', 'Nine gates'], ['Suukantsu', 'Four kans'], ['Tenhou / Chiihou', 'Win on your first draw as dealer / non-dealer']]]
  ];

  function rmScoreTable() {
    const fus = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
    const cell = (han, fu, dealer) => {
      if (han === 1 && fu === 20 || han === 1 && fu === 25) return '-';
      const b = basePoints(han, fu, 0);
      const t = payments(b, dealer, true, 0), r = payments(b, dealer, false, 0);
      return (r.ron).toLocaleString('en') + '<br><small>' + (dealer ? t.each.toLocaleString('en') + ' all' : t.dealer.toLocaleString('en') + '/' + t.other.toLocaleString('en')) + '</small>';
    };
    const tbl = dealer => {
      let h = '<table><tr><th>Han \\ Fu</th>' + fus.map(f => '<th>' + f + '</th>').join('') + '</tr>';
      for (let han = 1; han <= 4; han++) h += '<tr><th>' + han + '</th>' + fus.map(f => '<td>' + ((han === 1 && f === 20) || (f === 25 && han < 2) ? '-' : cell(han, f, dealer)) + '</td>').join('') + '</tr>';
      for (const [lab, han] of [['Mangan (5)', 5], ['Haneman (6-7)', 6], ['Baiman (8-10)', 8], ['Sanbaiman (11-12)', 11], ['Yakuman (13+)', 13]]) h += '<tr><th colspan="2">' + lab + '</th><td colspan="9">' + cell(han, 30, dealer) + '</td></tr>';
      return h + '</table>';
    };
    return '<div class="rm-sc"><h4>Non-dealer: ron, then tsumo (dealer pays / others pay)</h4>' + tbl(false) + '<h4>Dealer: ron, then tsumo (each pays)</h4>' + tbl(true) + '</div>';
  }
  function rmRules() {
    const yk = RM_YAKU.map(([h, l]) => '<h4>' + h + '</h4><table>' + l.map(([n, d]) => '<tr><td class="l"><b>' + n + '</b></td><td class="l">' + d + '</td></tr>').join('') + '</table>').join('');
    return `<h3>How to play Riichi Mahjong</h3><div class="rm-rules">
<h4>The goal</h4><p>Four players, 136 tiles (red fives optional). Build a hand of <b>four sets and a pair</b> (a set is a run like 3-4-5 in one suit, or three identical tiles), or seven pairs, or the thirteen orphans. You start with 13 tiles; on your turn draw one and discard one. Win by drawing the missing tile (<b>tsumo</b>) or by claiming another player's discard (<b>ron</b>). Every winning hand needs at least one <b>yaku</b> (scoring pattern).</p>
<h4>Round structure</h4><p>Everyone starts with 25,000 points. A game is the East round (4 hands) and, in a full game, the South round (4 more). The dealer (East) rotates after each hand unless the dealer wins or is tenpai at an exhausted wall (<b>renchan</b>, the dealer stays and the <b>honba</b> counter grows: +300 on a ron, +100 each on a tsumo). If nobody has 30,000+ after South 4, play continues into West. The game ends early if anyone drops below zero.</p>
<h4>Calls</h4><ul><li><b>Chi</b>: take the discard of the player on your left to complete a run.</li><li><b>Pon</b>: take any discard to complete a triplet.</li><li><b>Kan</b>: four of a kind (closed, from a discard, or added to a pon). Draw a replacement tile and reveal a new dora.</li><li><b>Ron</b>: win on a discard. Ron beats pon/kan, which beat chi. Two players may ron on the same discard; three rons is an abortive draw.</li></ul><p>After chi or pon you cannot discard the same tile (or the other end of that run) right away. Open hands lose some han and cannot declare riichi.</p>
<h4>Riichi</h4><p>With a closed hand one tile from winning (<b>tenpai</b>) and at least 1,000 points, declare <b>riichi</b>: discard sideways and put down a 1,000 stick. Your hand is then locked (you can only discard the tile you draw, or declare a kan that does not change your waits). You win extra dora from the <b>ura dora</b> under the dora indicators.</p>
<h4>Furiten</h4><p>You cannot ron if any of your own discards is one of your winning tiles, or if you passed a winning tile since your last discard (or since riichi). You can still tsumo.</p>
<h4>Dora</h4><p>The tile after each dora indicator is a dora worth 1 han each (9 wraps to 1, North to East, Red to White). Red fives are 1 han each. Dora only count if the hand already has a yaku.</p>
<h4>Draws</h4><p>Exhausted wall: tenpai players share 3,000 from the others. Abortive draws: nine different terminals/honors in your first hand (your option), four identical winds discarded in the first round, four riichi declarations, four kans by different players, triple ron. Nagashi mangan (every discard a terminal/honor and none claimed) pays as a mangan.</p>
<h4>Keys</h4><p><kbd>Left</kbd>/<kbd>Right</kbd> choose a tile, <kbd>Enter</kbd> or <kbd>Space</kbd> discards, <kbd>R</kbd> riichi, <kbd>T</kbd> or <kbd>W</kbd> tsumo/ron, <kbd>P</kbd> pon, <kbd>C</kbd> chi, <kbd>K</kbd> kan, <kbd>X</kbd> pass, <kbd>H</kbd> toggle hints. On a touch screen tap a tile to lift it, tap it again to discard.</p>
<h4>Yaku</h4>${yk}
<h4>Scoring</h4><p>Score = fu x 2^(han+2), rounded up to 100, then times 4 (non-dealer ron), 6 (dealer ron), or split among the payers (tsumo). From 5 han it is a fixed limit hand: <b>Mangan</b> 2,000 base (8,000 / 12,000), Haneman 3,000, Baiman 4,000, Sanbaiman 6,000, Yakuman 8,000 (32,000 / 48,000).</p>${rmScoreTable()}</div>`;
  }

  const RM_NAMES = ['Haru', 'Akira', 'Mei', 'Ren', 'Sora', 'Yuki', 'Kai', 'Hana', 'Daichi', 'Noa'];
  const RM_WIND = ['East', 'South', 'West', 'North'];
  const RM_WL = ['E', 'S', 'W', 'N'];
  const rmFmt = n => Math.round(n).toLocaleString('en');
  const rmSign = n => (n > 0 ? '+' : n < 0 ? '-' : '') + rmFmt(Math.abs(n));

  const TIMG = new Map();
  function tileImg(id, w) {
    const k = id >> 2, red = isRedId(id), key = k + '|' + w + '|' + (red ? 1 : 0);
    let u = TIMG.get(key);
    if (!u) {
      const s = sprite(k, w, { red });
      u = { src: s.cv.toDataURL(), w: s.cw, h: s.ch };
      TIMG.set(key, u);
    }
    return u;
  }
  const kindImg = (k, w, extra) => { const u = tileImg(k * 4 + 1, w); return `<img src="${u.src}" width="${u.w}" height="${u.h}" alt="${KNAME[k]}"${extra || ''}>`; };
  const idImg = (id, w, extra) => { const u = tileImg(id, w); return `<img src="${u.src}" width="${u.w}" height="${u.h}" alt="${KNAME[id >> 2]}"${extra || ''}>`; };
  function meldImgs(m, owner, w) {
    const rel = m.src == null ? 0 : (m.src - owner + 4) & 3;
    const n = m.ids.length;
    if (!m.open && m.kan) {
      const bk = '<img src="' + tileImg(-4, w).src + '" width="' + tileImg(-4, w).w + '" height="' + tileImg(-4, w).h + '" alt="">';
      return '<span class="meld">' + bk + idImg(m.ids[1], w) + idImg(m.ids[2], w) + bk + '</span>';
    }
    const ids = m.ids.slice();
    if (m.add != null) ids.splice(ids.indexOf(m.add), 1);
    const ci = ids.indexOf(m.cid);
    const rest = ids.filter((x, i) => i !== ci);
    const slot = rel === 3 ? 0 : rel === 2 ? 1 : n === 4 ? 3 : 2;
    const out = [];
    let r = 0;
    for (let i = 0; i < (m.add != null ? 3 : n); i++) {
      if (i === slot) out.push(idImg(m.cid, w, ' style="transform:translateY(' + Math.round(w * .15) + 'px) rotate(90deg);margin:0 ' + Math.round(w * .15) + 'px"'));
      else out.push(idImg(rest[r++], w));
    }
    return '<span class="meld">' + out.join('') + '</span>';
  }

  function rmIcon(n) {
    const p = {
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      hint: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 3z"/>',
      help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 1 1 3.6 2.4c-.7.4-1.1 1-1.1 1.8M12 17h.01"/>'
    }[n];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  const RM_ROT = [0, -Math.PI / 2, Math.PI, Math.PI / 2];

  function mountRiichi(root, api) {
    const sv = Object.assign({ diff: 'Normal', len: 2, aka: true, hints: true }, api.load() || {});
    sv.st = Object.assign({ games: 0, firsts: 0, hands: 0, wins: 0, best: 0 }, sv.st);
    const save = () => api.save(sv);
    const snd = mkAudio(api);

    const wrap = H('div', 'rm-wrap'), bar = H('div', 'rm-bar'), stage = H('div', 'rm-stage'), cv = H('canvas'), acts = H('div', 'rm-acts'), pane = H('div', 'rm-pane');
    pane.hidden = true;
    bar.innerHTML = `<button class="rm-b" data-a="menu" aria-label="Menu">${rmIcon('menu')}<span>Menu</span></button>
<div class="rm-info"><b data-u="round">Riichi Mahjong</b><span data-u="sub">&nbsp;</span></div>
<i class="rm-sp"></i>
<span class="rm-net" data-u="net" hidden><i></i><em>Online</em></span>
<button class="rm-b" data-a="hints" aria-pressed="${sv.hints}" aria-label="Hand hints (H)">${rmIcon('hint')}<span>Hints</span></button>
<button class="rm-b" data-a="rules" aria-label="How to play">${rmIcon('help')}<span>Rules</span></button>`;
    stage.append(cv, acts, pane); wrap.append(bar, stage); root.append(wrap);
    const ctx = cv.getContext('2d');
    const uRound = bar.querySelector('[data-u=round]'), uSub = bar.querySelector('[data-u=sub]'), uNet = bar.querySelector('[data-u=net]'), bHints = bar.querySelector('[data-a=hints]');

    const M = { mode: 'none', role: 'local', eng: null, seat: 0, human: [true, false, false, false], names: ['You', 'Bot', 'Bot', 'Bot'], pids: [], tok: 0, V: null, clock: 0, sched: {}, ready: new Set(), rdy: [], dl: null, resAt: 0, wait: 0, players: [], size: 4, bots: false, submitted: false, opts: { aka: true, len: 2, diff: 'Normal' }, pending: null };
    const D = { rm: false, cur: -1, sel: -1, hover: -1, fx: [], rc: [0, 0, 0, 0], ra: {}, dealT: -1e9, drawT: -1e9, dirty: true, hl: null, hk: '', hv: null, ak: '', last: null, shake: null, flash: 0 };
    let W = 960, Hh = 640, PORT = null, DPR = 1, G = null, bg = null;

    const rel = p => (p - M.seat + 4) & 3;
    const isBot = p => !M.human[p];
    const aka = () => !!(M.V && M.V.rules && M.V.rules.aka);

    function geom(port) {
      const g = port ? { W: 420, H: 640, cx: 210, cy: 290, half: 88, hw: 28, rw: 17, ow: 11, mw: 19, dw: 13, gap: 7, port: true } : { W: 960, H: 640, cx: 480, cy: 288, half: 100, hw: 46, rw: 24, ow: 22, mw: 30, dw: 20, gap: 8, port: false };
      g.th = Math.round(g.hw * 1.3); g.dd = Math.max(2, Math.round(g.hw * .13));
      g.hy = g.H - g.th - g.dd - 12;
      g.mh = Math.round(g.mw * 1.3);
      if (port) { g.melY = g.hy - g.mh - 8; g.hintBot = g.melY - 4; g.hintH = 46; }
      else { g.melY = g.hy + g.th - g.mh; g.hintBot = g.hy - 8; g.hintH = 52; }
      g.hintTop = g.hintBot - g.hintH;
      return g;
    }
    function fit(force) {
      const port = (root.clientWidth || 900) < 640;
      if (!force && port === PORT) return;
      PORT = port; G = geom(port); W = G.W; Hh = G.H; DPR = dprNow();
      cv.width = Math.round(W * DPR); cv.height = Math.round(Hh * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px) - 52px) * ${(W / (Hh + 52)).toFixed(4)}))`;
      wrap.classList.toggle('rm-narrow', port);
      acts.style.bottom = ((Hh - G.hintTop + 4) / Hh * 100).toFixed(2) + '%';
      bg = null; D.dirty = true;
    }
    function drawBg() {
      const c = H('canvas'); c.width = Math.round(W * DPR); c.height = Math.round(Hh * DPR);
      const x = c.getContext('2d'); x.scale(DPR, DPR);
      const g = x.createRadialGradient(W / 2, Hh * .42, 40, W / 2, Hh / 2, Math.max(W, Hh) * .75);
      g.addColorStop(0, '#1f8b58'); g.addColorStop(.55, '#127046'); g.addColorStop(1, '#093c27');
      x.fillStyle = g; x.fillRect(0, 0, W, Hh);
      x.globalAlpha = .05; x.strokeStyle = '#fff'; x.lineWidth = 1;
      for (let i = -Hh; i < W + Hh; i += 5) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + Hh, Hh); x.stroke(); }
      x.strokeStyle = '#000';
      for (let i = -Hh; i < W + Hh; i += 5) { x.beginPath(); x.moveTo(i + Hh, 0); x.lineTo(i, Hh); x.stroke(); }
      x.globalAlpha = 1;
      const v = x.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * .3, W / 2, Hh / 2, Math.max(W, Hh) * .78);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
      x.fillStyle = v; x.fillRect(0, 0, W, Hh);
      bg = c;
    }

    const kindOf = id => id < 0 ? -1 : id >> 2;
    const redOf = id => id >= 0 && aka() && isRedId(id);
    function tile(id, x, y, w, o) {
      o = o || {};
      if (id >= 0 && redOf(id)) o.red = true;
      return tileAt(ctx, kindOf(id), x, y, w, o);
    }

    function drawMeld(m, owner, x, y, w) {
      const h = Math.round(w * 1.3);
      if (!m.open) {
        tile(-1, x, y, w); tile(m.ids[1], x + w, y, w); tile(m.ids[2], x + 2 * w, y, w); tile(-1, x + 3 * w, y, w);
        return 4 * w;
      }
      const r = (m.src - owner + 4) & 3, n = m.add != null ? 3 : m.ids.length;
      const slot = r === 3 ? 0 : r === 2 ? 1 : n === 4 ? 3 : 2;
      const rest = m.ids.filter(i => i !== m.cid && i !== m.add);
      let cx0 = x, k = 0;
      for (let i = 0; i < n; i++) {
        if (i === slot) {
          tile(m.cid, cx0 + h / 2 - w / 2, y + h / 2 - w / 2, w, { rot: Math.PI / 2 });
          if (m.add != null) tile(m.add, cx0 + h / 2 - w / 2, y + h / 2 - w / 2 - w, w, { rot: Math.PI / 2 });
          cx0 += h;
        } else { tile(rest[k++], cx0, y, w); cx0 += w; }
      }
      return cx0 - x;
    }
    const meldW = (m, w) => { const h = Math.round(w * 1.3); if (!m.open) return 4 * w; const n = m.add != null ? 3 : m.ids.length; return (n - 1) * w + h; };

    const edgeOf = r => r === 0 ? Hh - G.cy : r === 1 ? W - G.cx : r === 2 ? G.cy : G.cx;

    function syncAnim(now) {
      const V = M.V;
      if (!V) return;
      for (let p = 0; p < 4; p++) {
        const n = V.disc[p].length;
        if (n < D.rc[p]) D.rc[p] = 0;
        for (let i = D.rc[p]; i < n; i++) D.ra[p + ':' + i] = now;
        D.rc[p] = n;
      }
    }
    function drawRiver(p, now) {
      const V = M.V, list = V.disc[p];
      if (!list.length) return;
      const r = rel(p), rw = G.rw, rh = Math.round(rw * 1.3);
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.rotate(RM_ROT[r]);
      const x0 = -3 * rw, y0 = G.half + G.gap + 2;
      const over = Math.max(0, list.length - 18), step4 = over > 6 ? 6 * rw / over : rw;
      let row = 0, x = 0, cnt = 0;
      for (let i = 0; i < list.length; i++) {
        const d = list[i];
        if (row < 3 && cnt === 6) { row++; x = 0; cnt = 0; }
        const rot = d.riichi, cw = rot ? rh : (row === 3 ? step4 : rw);
        let px = x0 + x, py = y0 + row * (rh + 1), al = d.called ? .3 : 1;
        const an = D.ra[p + ':' + i];
        let dy = 0;
        if (an != null) { const t = (now - an) / 240; if (t < 1) { const e = easeOut(Math.max(0, t)); dy = (1 - e) * 26; al *= .35 + .65 * e; D.dirty = true; } }
        if (rot) tileAt(ctx, kindOf(d.id), px + rh / 2 - rw / 2, py + rh / 2 - rw / 2 + dy, rw, { rot: Math.PI / 2, alpha: al, red: redOf(d.id) });
        else tileAt(ctx, kindOf(d.id), px, py + dy, rw, { alpha: al, red: redOf(d.id) });
        if (V.last && V.last.p === p && i === list.length - 1 && !d.called && V.phase !== 'result') {
          const k = .55 + .45 * Math.sin(now / 160);
          ctx.strokeStyle = `rgba(255,216,74,${k})`; ctx.lineWidth = 2;
          if (rot) rrp(ctx, px - 1, py + (rh - rw) - 1, rh + 2, rw + 2, 3); else rrp(ctx, px - 1, py - 1, rw + 2, rh + 2, 3);
          ctx.stroke(); D.dirty = true;
        }
        x += cw; cnt++;
      }
      ctx.restore();
    }
    function drawOpp(p, now) {
      const V = M.V, r = rel(p);
      if (r === 0) return;
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.rotate(RM_ROT[r]);
      const ow = G.ow, oh = Math.round(ow * 1.3), dd = Math.max(2, Math.round(ow * .13)), yy = edgeOf(r) - oh - dd - 6;
      const n = V.cnt[p], gapped = V.phase === 'turn' && V.turn === p && n % 3 === 2;
      const ms = V.melds[p], mw = G.rw;
      let mtot = 0; for (const m of ms) mtot += meldW(m, mw) + 5;
      const htot = n * ow + (gapped ? ow * .6 : 0);
      let x = -(htot + mtot) / 2;
      const t0 = D.dealT;
      for (let i = 0; i < n; i++) {
        const dx = i === n - 1 && gapped ? ow * .6 : 0;
        const tt = (now - t0 - i * 24 - r * 40) / 220;
        let al = 1, dy = 0;
        if (tt < 1) { al = Math.max(0, tt); dy = (1 - Math.max(0, tt)) * -16; D.dirty = true; }
        tileAt(ctx, -1, x + dx, yy + dy, ow, { thin: true, alpha: al });
        x += ow;
      }
      x += (gapped ? ow * .6 : 0) + 5;
      const mh = Math.round(mw * 1.3);
      for (let i = ms.length - 1; i >= 0; i--) { x += drawMeld(ms[i], p, x, yy + oh - mh, mw) + 5; }
      ctx.restore();
    }
    function panelText(p, now) {
      const V = M.V, r = rel(p), half = G.half;
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.rotate(RM_ROT[r]);
      const wi = (p - V.dealer + 4) & 3, isTurn = V.turn === p && (V.phase === 'turn' || V.phase === 'react');
      const fs = G.port ? 11 : 13;
      const y = half - (G.port ? 22 : 26);
      if (isTurn) {
        const k = .6 + .4 * Math.sin(now / 220);
        const gw = G.port ? 104 : 124; ctx.fillStyle = `rgba(255,205,70,${.18 + .12 * k})`; rrp(ctx, -gw / 2, half - (G.port ? 37 : 40), gw, G.port ? 33 : 36, 8); ctx.fill();
        ctx.strokeStyle = `rgba(255,205,70,${.55 + .35 * k})`; ctx.lineWidth = 2; ctx.stroke(); D.dirty = true;
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const bw = fs + 7;
      const nm = G.port ? (M.names[p] || '').replace(/ \(Bot\)$/, '') : M.names[p] || '', name = nm.length > (G.port ? 9 : 12) ? nm.slice(0, G.port ? 8 : 11) + '…' : nm;
      ctx.font = `800 ${fs}px ${FONT}`;
      const pts = rmFmt(V.pts[p]), tw = ctx.measureText(name).width;
      const total = bw + 5 + tw;
      ctx.fillStyle = wi === 0 ? '#e0452d' : '#2d3f55'; rrp(ctx, -total / 2, y - bw / 2 - 4, bw, bw, 4); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `900 ${fs - 2}px ${FONT}`; ctx.fillText(RM_WL[wi], -total / 2 + bw / 2, y - 4);
      ctx.textAlign = 'left'; ctx.font = `800 ${fs}px ${FONT}`; ctx.fillStyle = p === M.seat ? '#ffe28a' : '#e9fff1';
      ctx.fillText(name, -total / 2 + bw + 5, y - 4);
      ctx.textAlign = 'center'; ctx.font = `900 ${fs + 2}px ${FONT}`; ctx.fillStyle = V.pts[p] < 0 ? '#ff8a7a' : '#fff';
      ctx.fillText(pts, 0, y + fs - 1);
      if (V.ri[p]) {
        const sw = G.port ? 44 : 62;
        ctx.fillStyle = '#f5f1e1'; rrp(ctx, -sw / 2, half + 1, sw, 6, 3); ctx.fill();
        ctx.fillStyle = '#d3281c'; ctx.beginPath(); ctx.arc(0, half + 4, 1.9, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    function drawCenter(now) {
      const V = M.V, half = G.half;
      ctx.save(); ctx.translate(G.cx, G.cy);
      const g = ctx.createLinearGradient(-half, -half, half, half);
      g.addColorStop(0, '#1b2b3a'); g.addColorStop(1, '#0d1823');
      rrp(ctx, -half, -half, half * 2, half * 2, 12); ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#4a6a58'; ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.12)'; rrp(ctx, -half + 4, -half + 4, half * 2 - 8, half * 2 - 8, 9); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const wl = RM_WIND[V.wind - 27] + ' ' + ((V.rnd & 3) + 1);
      ctx.fillStyle = '#ffe9a8'; ctx.font = `900 ${G.port ? 17 : 24}px ${FONT}`; ctx.fillText(wl, 0, G.port ? -32 : -44);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = `800 ${G.port ? 10 : 12}px ${FONT}`;
      ctx.fillText('Honba ' + V.honba + '  ·  Riichi ' + V.sticks, 0, G.port ? -16 : -26);
      const dw = G.dw, n = 5, tw = dw + 2, x0 = -(n * tw) / 2 + 1, dy = G.port ? -8 : -14;
      for (let i = 0; i < n; i++) {
        if (i < V.ind.length) tile(V.ind[i], x0 + i * tw, dy, dw, { thin: true });
        else tileAt(ctx, -1, x0 + i * tw, dy, dw, { thin: true, alpha: .55 });
      }
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = `800 ${G.port ? 10 : 12}px ${FONT}`;
      ctx.fillText('Wall ' + V.left, 0, dy + Math.round(dw * 1.3) + (G.port ? 12 : 14));
      if (M.dl && M.mode === 'online') {
        const s = Math.max(0, Math.ceil((M.dl.t0 + M.dl.ms - M.clock) / 1000));
        ctx.fillStyle = s <= 5 ? '#ff8a7a' : '#ffe9a8'; ctx.font = `900 ${G.port ? 12 : 15}px ${FONT}`;
        const sp = M.dl.p, who = sp === M.seat ? 'Your move' : (M.names[sp] || '').split(' ')[0];
        ctx.fillText(who + ' · ' + s + 's', 0, G.port ? 38 : 44);
      }
      ctx.restore();
      for (let p = 0; p < 4; p++) panelText(p, now);
    }
    function handLayout() {
      const V = M.V, q = M.seat, hw = G.hw, th = G.th;
      const hand = V.hand.slice(), tiles = [];
      const ms = V.melds[q], mw = G.mw;
      let mtot = 0; for (const m of ms) mtot += meldW(m, mw) + 6;
      const gap = V.drawn >= 0 ? Math.round(hw * .35) : 0;
      const htot = (hand.length + (V.drawn >= 0 ? 1 : 0)) * hw + gap;
      let x0;
      if (G.port) x0 = Math.round((W - htot) / 2);
      else x0 = Math.max(10, Math.round((W - htot - mtot) / 2));
      hand.forEach((id, i) => tiles.push({ id, x: x0 + i * hw, y: G.hy, w: hw, h: th }));
      if (V.drawn >= 0) tiles.push({ id: V.drawn, x: x0 + hand.length * hw + gap, y: G.hy, w: hw, h: th, drawn: true });
      return { tiles, ms, mtot, x0, htot };
    }
    function drawHand(now) {
      const V = M.V, q = M.seat, L = handLayout();
      D.hl = L;
      const myTurn = V.phase === 'turn' && V.turn === q && V.to;
      const an = hintInfo();
      L.tiles.forEach((t, i) => {
        let y = t.y, shade = 0;
        const allowed = !myTurn || V.to.disc.indexOf(t.id) >= 0;
        const rm = D.rm && myTurn;
        const okR = rm ? V.to.riichi.indexOf(t.id) >= 0 : true;
        if (myTurn && (!allowed || (rm && !okR))) shade = .42;
        const act = i === D.sel || i === D.hover || i === D.cur;
        if (act && myTurn) y -= i === D.sel ? Math.round(G.hw * .3) : Math.round(G.hw * .18);
        const tt = (now - D.dealT - i * 30) / 220;
        let al = 1;
        if (tt < 1) { al = Math.max(0, tt); y += (1 - al) * 22; D.dirty = true; }
        if (t.drawn) { const dt = (now - D.drawT) / 200; if (dt < 1) { y -= (1 - easeOut(Math.max(0, dt))) * 20; D.dirty = true; } }
        ctx.fillStyle = 'rgba(0,0,0,.22)'; rrp(ctx, t.x + G.dd * 1.4, t.y + G.dd * 1.6, t.w - 1, t.h, Math.max(2, t.w * .12)); ctx.fill();
        tile(t.id, t.x, y, t.w - 1, { shade, alpha: al });
        t.ry = y;
        if (myTurn && V.to.disc.indexOf(t.id) >= 0 && sv.hints && an && an.keep && an.keep.has(t.id >> 2) && !D.rm) {
          ctx.fillStyle = '#7dffa6'; ctx.beginPath(); ctx.moveTo(t.x + t.w / 2 - 5, y - 9); ctx.lineTo(t.x + t.w / 2 + 5, y - 9); ctx.lineTo(t.x + t.w / 2, y - 3); ctx.closePath(); ctx.fill();
        }
        if (rm && okR) { ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 2; rrp(ctx, t.x, y, t.w - 1, t.h, Math.max(2, t.w * .12)); ctx.stroke(); }
        if (i === D.cur && myTurn) { ctx.strokeStyle = '#fff'; ctx.setLineDash([4, 3]); ctx.lineWidth = 2; rrp(ctx, t.x - 1, y - 1, t.w + 1, t.h + 2, 4); ctx.stroke(); ctx.setLineDash([]); }
      });
      let mx = G.port ? W - 8 : W - 10;
      if (!G.port) mx = Math.max(L.x0 + L.htot + 14 + L.mtot, 0) > W - 10 ? W - 10 : Math.max(L.x0 + L.htot + 14 + L.mtot, W - 10 - 0);
      mx = W - 10;
      const my = G.melY;
      for (let i = 0; i < L.ms.length; i++) { const m = L.ms[i], w = meldW(m, G.mw); mx -= w; drawMeld(m, q, mx, my, G.mw); mx -= 6; }
      if (myTurn) {
        const k = .5 + .5 * Math.sin(now / 260);
        ctx.fillStyle = `rgba(255,214,90,${.35 + .3 * k})`; rrp(ctx, L.x0 - 4, G.hy + G.th + G.dd + 3, L.htot + 8, 3, 2); ctx.fill(); D.dirty = true;
      }
    }

    function hintInfo() {
      const V = M.V;
      if (!V || !sv.hints || V.phase === 'idle' || V.phase === 'result' || V.phase === 'over') return null;
      const q = M.seat, nm = V.melds[q].length;
      const myTurn = V.phase === 'turn' && V.turn === q && V.to;
      let hoverId = -1;
      if (myTurn && D.hl) { const i = D.sel >= 0 ? D.sel : D.hover >= 0 ? D.hover : D.cur; if (i >= 0 && D.hl.tiles[i]) hoverId = D.hl.tiles[i].id; }
      const key = V.nh + ':' + V.tid + ':' + V.hand.join(',') + ':' + V.drawn + ':' + V.ind.join(',') + ':' + V.disc.map(d => d.length).join('') + ':' + hoverId + ':' + V.ri[q] + ':' + V.melds[q].length;
      if (D.hk === key) return D.hv;
      const vis = rvCount(V), out = { lines: [], waits: [], keep: null, title: '' };
      const ids = V.hand.slice(); if (V.drawn >= 0) ids.push(V.drawn);
      const c = countOf(ids);
      const valTxt = r => r ? (r.ym ? (r.limit || 'Yakuman') : r.han + ' han ' + r.fu + ' fu' + (r.limit ? ' ' + r.limit : '')) : 'no yaku';
      const waitsOut = (c13, melds, ownIds, fl) => {
        const ws = waitsOf(c13, melds.length), o = [];
        for (const k of ws) {
          const left = Math.max(0, 4 - vis[k] + (ownIds ? 0 : 0));
          const r = rvEval(V, q, ownIds.concat([k * 4 + 1]), melds, k * 4 + 1, false, fl);
          o.push({ k, left, r });
        }
        return o;
      };
      if (myTurn) {
        out.keep = new Set();
        if (!V.ri[q]) {
          const seen = new Set();
          for (const id of V.to.disc) { const k = id >> 2; if (seen.has(k)) continue; seen.add(k); c[k]--; if (waitsOf(c, nm).length) out.keep.add(k); c[k]++; }
        }
        if (V.to.tsumo) {
          const r = rvEval(V, q, ids, V.melds[q], V.drawn, true);
          out.title = 'Tsumo available'; out.lines.push(valTxt(r));
        } else if (hoverId >= 0) {
          const k = hoverId >> 2; c[k]--;
          const sh = shanten(c, nm);
          if (sh === 0) {
            const rest = ids.filter(x => x !== hoverId);
            const canR = V.to.riichi.indexOf(hoverId) >= 0 && !V.ri[q];
            out.waits = waitsOut(c, V.melds[q], rest, canR && D.rm ? { riichi: 1 } : null);
            out.title = (D.rm ? 'Riichi, discard ' : 'Discard ') + KNAME[k] + ': tenpai';
            if (canR && !D.rm && !out.waits.some(w => w.r)) { out.waits = waitsOut(c, V.melds[q], rest, { riichi: 1 }); out.title = 'Discard ' + KNAME[k] + ': riichi makes it winnable'; }
          } else {
            let uk = 0;
            for (let t = 0; t < 34; t++) { if (c[t] >= 4) continue; const left = 4 - vis[t]; if (left <= 0) continue; c[t]++; const s2 = shanten(c, nm); c[t]--; if (s2 < sh) uk += left; }
            out.title = 'Discard ' + KNAME[k] + ': ' + sh + '-shanten'; out.lines.push(uk + ' tiles improve');
          }
          c[k]++;
        } else {
          const sh = shanten(c, nm);
          out.title = sh < 0 ? 'Complete hand' : sh === 0 ? 'Tenpai after discard' : sh + '-shanten';
        }
      } else if (V.phase !== 'idle' && (V.hand.length + nm * 3) === 13) {
        const sh = shanten(c, nm);
        if (sh === 0) { out.waits = waitsOut(c, V.melds[q], ids); out.title = V.ri[q] ? 'Riichi · waiting on' : 'Tenpai · waiting on'; }
        else out.title = sh + '-shanten';
      }
      if (out.waits.length) {
        const best = out.waits.filter(w => w.r).sort((a, b) => b.r.base - a.r.base)[0];
        const anyYaku = out.waits.some(w => w.r);
        if (!anyYaku) out.lines.push('No yaku yet: you cannot win by ron');
        else if (best) {
          const dl = q === V.dealer, pr = payments(best.r.base, dl, false, 0).ron;
          out.lines.push('Best: ' + valTxt(best.r) + ' · ron ' + rmFmt(pr));
        }
      }
      D.hk = key; D.hv = out;
      return out;
    }
    function drawHint(now) {
      const V = M.V, an = hintInfo();
      if (!an || !an.title) return;
      const q = M.seat;
      const h = an.waits.length ? G.hintH : an.lines.length ? 40 : 26, x = 10, y = G.hintBot - h, w = G.port ? W - 20 : Math.min(420, W - 20);
      ctx.fillStyle = 'rgba(8,24,18,.72)'; rrp(ctx, x, y, w, h, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; rrp(ctx, x, y, w, h, 10); ctx.stroke();
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      const fs = G.port ? 11 : 12.5;
      ctx.font = `800 ${fs}px ${FONT}`; ctx.fillStyle = '#ffe28a';
      let tx = x + 10, ty = y + 12;
      ctx.fillText(an.title, tx, ty);
      let tw = ctx.measureText(an.title).width;
      if (V.fur) { ctx.fillStyle = '#ff6a5a'; const fl = 'FURITEN'; const px = tx + tw + 12; rrp(ctx, px, ty - 8, ctx.measureText(fl).width + 10, 16, 5); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `900 ${fs - 2}px ${FONT}`; ctx.fillText(fl, px + 5, ty + .5); ctx.font = `800 ${fs}px ${FONT}`; }
      if (an.waits.length) {
        const w2 = G.port ? 15 : 17;
        let px = tx, py = y + 22;
        for (const wt of an.waits.slice(0, 9)) {
          tile(wt.k * 4 + 1, px, py, w2, { thin: true, shade: wt.left ? 0 : .5 });
          ctx.fillStyle = wt.r ? '#fff' : '#ff9d90'; ctx.font = `900 ${fs - 2}px ${FONT}`; ctx.textAlign = 'left';
          ctx.fillText('×' + wt.left, px + w2 + 3, py + Math.round(w2 * 1.3) / 2);
          px += w2 + 3 + ctx.measureText('×' + wt.left).width + 7;
        }
        ctx.font = `800 ${fs}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.88)';
        const lx = Math.max(px + 4, x + 10);
        if (an.lines.length) { ctx.textAlign = 'left'; const t = an.lines[0]; if (lx + ctx.measureText(t).width < x + w - 8) ctx.fillText(t, lx, py + Math.round(w2 * 1.3) / 2); else ctx.fillText(t, x + 10, y + h - 7); }
      } else if (an.lines.length) {
        ctx.font = `800 ${fs}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillText(an.lines[0], tx, y + 29);
      }
    }
    function drawFx(now) {
      for (let i = D.fx.length - 1; i >= 0; i--) {
        const f = D.fx[i], t = (now - f.t0) / f.dur;
        if (t >= 1) { D.fx.splice(i, 1); continue; }
        const r = f.p == null ? -1 : rel(f.p), e = easeOut(Math.min(1, t * 3)), a = t < .7 ? 1 : 1 - (t - .7) / .3;
        ctx.save(); ctx.translate(G.cx, G.cy);
        if (r >= 0) ctx.rotate(RM_ROT[r]);
        const y = r < 0 ? -(G.half + 30) : G.half + (G.port ? 36 : 44);
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const fs = (f.big ? (G.port ? 40 : 56) : (G.port ? 26 : 34)) * (.6 + .4 * e);
        ctx.font = `900 ${fs}px ${FONT}`; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineJoin = 'round';
        ctx.strokeText(f.text, 0, y); ctx.fillStyle = f.col || '#fff'; ctx.fillText(f.text, 0, y);
        if (f.sub) { ctx.font = `800 ${G.port ? 12 : 15}px ${FONT}`; ctx.lineWidth = 4; ctx.strokeText(f.sub, 0, y + fs * .75); ctx.fillStyle = '#fff'; ctx.fillText(f.sub, 0, y + fs * .75); }
        ctx.restore(); D.dirty = true;
      }
    }
    function render(now) {
      if (!bg) drawBg();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.drawImage(bg, 0, 0, W, Hh);
      const V = M.V;
      if (!V) return;
      syncAnim(now);
      drawCenter(now);
      for (let p = 0; p < 4; p++) drawRiver(p, now);
      for (let p = 0; p < 4; p++) drawOpp(p, now);
      drawHand(now);
      drawHint(now);
      drawFx(now);
    }

    function hud() {
      const V = M.V;
      if (!V || V.phase === 'idle') { uRound.textContent = 'Riichi Mahjong'; uSub.innerHTML = '&nbsp;'; return; }
      uRound.textContent = RM_WIND[V.wind - 27] + ' ' + ((V.rnd & 3) + 1);
      uSub.textContent = 'Honba ' + V.honba + ' · Riichi ' + V.sticks + ' · Wall ' + V.left;
      api.score(rmFmt(V.pts[M.seat]));
      uNet.hidden = M.mode !== 'online';
    }

    function showPane(k, html, fn, cls) {
      pane.dataset.k = k; pane.className = 'rm-pane' + (cls ? ' ' + cls : '');
      pane.innerHTML = '<div class="rm-box">' + html + '</div>';
      pane.hidden = false; pane.scrollTop = 0;
      pane.onclick = e => {
        const b = e.target.closest('[data-a]');
        if (b && !b.disabled) { snd('soft'); fn(b.dataset.a, b); }
      };
    }
    function hidePane() { pane.hidden = true; pane.dataset.k = ''; D.dirty = true; }

    function actsSig() {
      const V = M.V;
      if (!V || !pane.hidden) return '';
      if (V.phase === 'turn' && V.turn === M.seat && V.to) { const t = V.to; return 'T' + V.tid + (t.tsumo ? 't' : '') + t.riichi.length + ':' + t.ankan.join('.') + ':' + t.kakan.join('.') + (t.kyuushu ? 'k' : '') + (D.rm ? 'R' : ''); }
      if (V.rx && !V.pass) { const r = V.rx; return 'R' + V.tid + (r.ron ? 'r' : '') + (r.pon ? 'p' : '') + (r.kan ? 'k' : '') + (r.chi ? 'c' + r.chi.map(c => c.join('-')).join('_') : ''); }
      return '';
    }
    function renderActs() {
      const sig = actsSig();
      if (sig === D.ak) return;
      D.ak = sig;
      const V = M.V;
      if (!sig) { acts.innerHTML = ''; return; }
      const b = [];
      const ih = G.port ? 22 : 30;
      if (V.phase === 'turn') {
        const t = V.to;
        if (t.tsumo) b.push(`<button class="win" data-a="tsumo">Tsumo</button>`);
        for (const k of t.ankan) b.push(`<button class="call" data-a="ankan:${k}">Kan ${kindImg(k, ih)}</button>`);
        for (const id of t.kakan) b.push(`<button class="call" data-a="kakan:${id}">Add Kan ${kindImg(id >> 2, ih)}</button>`);
        if (t.riichi.length) b.push(`<button class="rii" data-a="riichi" aria-pressed="${D.rm}">Riichi${D.rm ? ' <small>pick a tile</small>' : ''}</button>`);
        if (t.kyuushu) b.push(`<button class="abort" data-a="kyuushu">Abort hand</button>`);
      } else {
        const r = V.rx;
        if (r.ron) b.push(`<button class="win" data-a="ron">Ron</button>`);
        if (r.pon) b.push(`<button class="call" data-a="pon">Pon</button>`);
        if (r.kan) b.push(`<button class="call" data-a="kan">Kan</button>`);
        if (r.chi) for (const c of r.chi) b.push(`<button class="call" data-a="chi:${c[0]},${c[1]}">Chi ${idImg(c[0], ih)}${idImg(V.rx.id, ih)}${idImg(c[1], ih)}</button>`.replace(/(<img[^>]*>)(<img[^>]*>)(<img[^>]*>)/, (m0, a, c1, d) => [c[0], V.rx.id, c[1]].sort((x, y) => (x >> 2) - (y >> 2)).map(i => idImg(i, ih)).join('')));
        b.push(`<button class="pass" data-a="pass">Pass</button>`);
      }
      acts.innerHTML = b.join('');
    }

    function uiRefresh() { hud(); renderActs(); D.dirty = true; }

    function filtEv(e, q) { return e.k === 'draw' && e.p !== q ? { k: 'draw', p: e.p, id: -1, rin: e.rin } : e; }
    function fx(text, p, col, o) { D.fx.push(Object.assign({ text, p, col, t0: performance.now(), dur: 1100 }, o || {})); D.dirty = true; }
    function onEv(e) {
      const V = M.V;
      if (e.k === 'deal') {
        D.dealT = performance.now(); D.ra = {}; D.rc = [0, 0, 0, 0]; D.rm = false; D.sel = -1; D.cur = -1; D.hover = -1; D.ak = ''; M.resAt = 0; M.ready = new Set(); M.rdy = []; M.sched = {};
        hidePane(); snd('deal');
        if (V) fx(RM_WIND[V.wind - 27] + ' ' + ((V.rnd & 3) + 1), null, '#ffe9a8', { big: true, dur: 1600, sub: V.honba ? V.honba + ' honba' : 'Dealer: ' + (M.names[V.dealer] || '') });
      } else if (e.k === 'draw') {
        if (e.p === M.seat) { D.drawT = performance.now(); D.cur = -1; D.sel = -1; snd('turn'); }
      } else if (e.k === 'disc') { snd('clack'); }
      else if (e.k === 'call') {
        const lab = { chi: 'Chi', pon: 'Pon', kan: 'Kan', ankan: 'Kan', kakan: 'Kan' }[e.t];
        fx(lab + '!', e.p, '#7dffa6'); snd('call');
      } else if (e.k === 'riichi') { fx(e.dbl ? 'Double Riichi!' : 'Riichi!', e.p, '#7cc4ff'); snd('riichi'); }
      else if (e.k === 'dora') { snd('tick'); D.flash = performance.now(); }
      else if (e.k === 'result') {
        const r = e.res;
        if (r.kind === 'win') {
          for (const w of r.wins) fx(w.tsumo ? 'Tsumo!' : 'Ron!', w.p, '#ffb347', { dur: 1500 });
          const mine = r.wins.some(w => w.p === M.seat);
          snd(mine ? 'win' : 'lose');
        } else { fx(r.kind === 'draw' ? 'Draw' : 'Abortive draw', null, '#ffe9a8', { big: true, dur: 1500 }); snd('soft'); }
        M.resAt = M.clock + (r.kind === 'win' ? 1700 : 1300);
      } else if (e.k === 'over') { M.resAt = 0; }
    }

    function seatsFor() {
      const nm = RM_NAMES.slice().sort(() => Math.random() - .5);
      let b = 0;
      for (let p = 0; p < 4; p++) {
        if (!M.human[p]) M.names[p] = nm[b++] + ' (Bot)';
      }
    }
    function resetTable() {
      D.rm = false; D.sel = -1; D.cur = -1; D.hover = -1; D.fx.length = 0; D.ra = {}; D.rc = [0, 0, 0, 0]; D.ak = ''; D.hk = '';
      M.sched = {}; M.resAt = 0; M.ready = new Set(); M.rdy = []; M.dl = null; M.wait = 0; M.submitted = false;
    }
    function newSolo() {
      M.tok++; M.mode = 'solo'; M.role = 'local'; M.seat = 0; M.opts = { aka: sv.aka, len: sv.len, diff: sv.diff };
      M.human = [true, false, false, false]; M.names = ['You', '', '', '']; M.pids = []; M.eng = null; M.V = null;
      seatsFor();
      beginMatch();
    }
    function beginMatch() {
      resetTable();
      M.eng = rGame({ aka: M.opts.aka, len: M.opts.len });
      hidePane();
      if (M.role === 'host') sendSetups();
      api.score('25,000');
      M.eng.start();
      flush();
    }
    function flush() {
      const eng = M.eng;
      if (!eng) return;
      const es = eng.take();
      M.V = eng.view(M.seat);
      for (const e of es) onEv(e);
      if (M.role === 'host') M.pids.forEach((id, q) => { if (id && q !== M.seat && M.human[q]) api.net.sendTo(id, { t: 'ev', es: es.map(e => filtEv(e, q)), v: eng.view(q) }); });
      const S = eng.s;
      if (S.phase === 'over' && !M.submitted) finishGame();
      uiRefresh();
    }
    function finishGame() {
      M.submitted = true;
      const f = M.eng.s.final, me = f.find(x => x.p === M.seat);
      sv.st.games++; if (me.rank === 1) sv.st.firsts++; sv.st.hands += M.eng.s.nh; sv.st.best = Math.max(sv.st.best, me.pts); save();
      if (me.pts > 0) api.submit(me.pts);
      M.resAt = M.clock + 600;
    }

    function setDl(p, ms) {
      M.dl = { p, t0: M.clock, ms, tid: M.eng ? M.eng.s.tid : 0 };
      if (M.role === 'host') api.net.send({ t: 'tm', p, ms });
    }
    function botLevel() { return M.opts.diff; }
    function act(p, a) {
      if (!M.eng || !M.eng.act(p, a)) return false;
      flush();
      return true;
    }
    function pump(dt) {
      M.clock += dt * 1000;
      if (M.resAt && M.clock >= M.resAt) { M.resAt = 0; if (M.V && M.V.phase === 'result') showResult(); else if (M.V && M.V.phase === 'over') showFinal(); }
      if (!M.eng || M.role === 'guest') return;
      const S = M.eng.s;
      if (M.role === 'host' && M.rtDue && M.clock >= M.rtDue && S.phase === 'result') { M.rtDue = 0; nextHand(); return; }
      if (S.phase === 'result' || S.phase === 'over' || S.phase === 'idle') { M.dl = null; return; }
      const nd = M.eng.need();
      let acted = false;
      for (const p of nd.ps) {
        const key = S.tid + ':' + p;
        if (M.human[p]) {
          const v = M.eng.view(p);
          if (v.to && v.turn === p && S.ri[p] && !v.to.tsumo && !v.to.ankan.length) {
            if (M.sched[key] == null) M.sched[key] = M.clock + 650;
            if (M.clock >= M.sched[key]) { acted = act(p, { t: 'discard', id: v.drawn }); break; }
            continue;
          }
          if (M.mode === 'online') {
            if (!M.dl || M.dl.tid !== S.tid || (M.dl.p !== p && nd.kind === 'turn')) setDl(p, nd.kind === 'turn' ? 30000 : 12000);
            if (M.clock >= M.dl.t0 + M.dl.ms) {
              M.dl = null;
              if (nd.kind === 'turn') acted = act(p, { t: 'discard', id: v.drawn >= 0 ? v.drawn : v.to.disc[v.to.disc.length - 1] });
              else acted = act(p, { t: 'pass' });
              break;
            }
          }
          continue;
        }
        if (M.sched[key] == null) {
          const lv = botLevel(), slow = lv === 'Easy' ? 1.2 : 1;
          const t = nd.kind === 'turn' ? (S.ri[p] ? 520 : 650 + Math.random() * 650) * slow : (360 + Math.random() * 380) * slow;
          M.sched[key] = M.clock + t;
        }
        if (M.clock >= M.sched[key]) {
          if (D.fx.length > 2 && D.fx.some(f => f.big)) continue;
          const v = M.eng.view(p), a = rAiAny(v, botLevel());
          acted = a ? act(p, a) : false;
          if (!acted) { acted = act(p, v.rx ? { t: 'pass' } : { t: 'discard', id: v.drawn }); }
          break;
        }
      }
      if (!M.human.slice().some((h, p) => h && nd.ps.indexOf(p) >= 0)) { if (M.dl && M.mode === 'online') M.dl = null; }
    }

    function sendAct(a) {
      if (M.role === 'guest') {
        if (M.wait > M.clock) return;
        M.wait = M.clock + 400;
        api.net.send({ t: 'act', a });
      } else act(M.seat, a);
    }
    function doAct(a) {
      D.rm = false; D.sel = -1; D.ak = '';
      sendAct(a);
    }
    function discardAt(i) {
      const V = M.V;
      if (!V || !pane.hidden || V.phase !== 'turn' || V.turn !== M.seat || !V.to || !D.hl) return;
      const t = D.hl.tiles[i];
      if (!t) return;
      if (V.to.disc.indexOf(t.id) < 0) { snd('bad'); api.toast(V.ri[M.seat] ? 'Riichi: discard the drawn tile' : 'You cannot discard that tile now'); return; }
      if (D.rm) { if (V.to.riichi.indexOf(t.id) < 0) { snd('bad'); api.toast('That discard does not leave you tenpai'); return; } doAct({ t: 'discard', id: t.id, riichi: true }); }
      else doAct({ t: 'discard', id: t.id });
    }
    function toggleRiichi() {
      const V = M.V;
      if (!V || V.phase !== 'turn' || V.turn !== M.seat || !V.to || !V.to.riichi.length) return;
      D.rm = !D.rm; D.ak = ''; D.hk = ''; renderActs(); D.dirty = true;
      if (D.rm) { snd('select'); if (D.cur < 0 || !D.hl.tiles[D.cur] || V.to.riichi.indexOf(D.hl.tiles[D.cur].id) < 0) { const j = D.hl.tiles.findIndex(t => V.to.riichi.indexOf(t.id) >= 0); D.cur = j; } }
    }
    function onActClick(a) {
      const V = M.V;
      if (!V) return;
      if (a === 'tsumo') doAct({ t: 'tsumo' });
      else if (a === 'ron') doAct({ t: 'ron' });
      else if (a === 'pon') doAct({ t: 'pon' });
      else if (a === 'kan') doAct({ t: 'kan' });
      else if (a === 'pass') doAct({ t: 'pass' });
      else if (a === 'riichi') toggleRiichi();
      else if (a === 'kyuushu') doAct({ t: 'kyuushu' });
      else if (a.startsWith('ankan:')) doAct({ t: 'ankan', k: +a.slice(6) });
      else if (a.startsWith('kakan:')) doAct({ t: 'kakan', id: +a.slice(6) });
      else if (a.startsWith('chi:')) doAct({ t: 'chi', ids: a.slice(4).split(',').map(Number) });
    }
    api.on(acts, 'click', e => { const b = e.target.closest('[data-a]'); if (b) { snd('soft'); onActClick(b.dataset.a); } });

    const loc = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * Hh / r.height }; };
    function hitHand(x, y) {
      if (!D.hl) return -1;
      const T = D.hl.tiles;
      for (let i = T.length - 1; i >= 0; i--) { const t = T[i], ty = t.ry != null ? Math.min(t.ry, t.y) : t.y; if (x >= t.x && x <= t.x + t.w && y >= ty && y <= t.y + t.h + 4) return i; }
      return -1;
    }
    api.on(cv, 'pointerdown', e => {
      const V = M.V;
      if (!V || !pane.hidden) return;
      const p = loc(e), i = hitHand(p.x, p.y);
      D.cur = -1;
      if (i < 0) { D.sel = -1; D.dirty = true; return; }
      const mine = V.phase === 'turn' && V.turn === M.seat && V.to;
      if (!mine) return;
      if (e.pointerType !== 'mouse' && D.sel !== i) { D.sel = i; snd('select'); D.dirty = true; return; }
      discardAt(i);
    });
    api.on(cv, 'pointermove', e => {
      if (e.pointerType !== 'mouse' || !M.V) return;
      const p = loc(e), i = hitHand(p.x, p.y);
      if (i !== D.hover) { D.hover = i; D.dirty = true; cv.style.cursor = i >= 0 && M.V.phase === 'turn' && M.V.turn === M.seat ? 'pointer' : 'default'; }
    });
    api.on(cv, 'pointerleave', () => { if (D.hover >= 0) { D.hover = -1; D.dirty = true; } });

    function moveCur(d) {
      const V = M.V;
      if (!V || !D.hl || V.phase !== 'turn' || V.turn !== M.seat) return;
      const n = D.hl.tiles.length;
      if (D.cur < 0) D.cur = n - 1; else D.cur = (D.cur + d + n) % n;
      if (D.rm && V.to) { let g = 0; while (g++ < n && V.to.riichi.indexOf(D.hl.tiles[D.cur].id) < 0) D.cur = (D.cur + d + n) % n; }
      D.sel = -1; D.hover = -1; snd('tick'); D.dirty = true;
    }
    api.on(window, 'keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key.toLowerCase(), V = M.V;
      if (!pane.hidden) {
        if (k === 'enter' || k === ' ') { const b = pane.querySelector('.rm-big'); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
        return;
      }
      if (k === 'h') { sv.hints = !sv.hints; bHints.setAttribute('aria-pressed', String(sv.hints)); save(); D.hk = ''; D.dirty = true; return; }
      if (!V) return;
      const mine = V.phase === 'turn' && V.turn === M.seat && V.to;
      if (k === 'arrowleft') { e.preventDefault(); moveCur(-1); }
      else if (k === 'arrowright') { e.preventDefault(); moveCur(1); }
      else if ((k === 'enter' || k === ' ' || k === 'arrowdown') && mine) { e.preventDefault(); if (D.cur < 0) D.cur = D.hl.tiles.length - 1; discardAt(D.cur); }
      else if (k === 'r' && mine) toggleRiichi();
      else if (k === 't' || k === 'w') { if (mine && V.to.tsumo) onActClick('tsumo'); else if (V.rx && V.rx.ron) onActClick('ron'); }
      else if (k === 'p' && V.rx && V.rx.pon) onActClick('pon');
      else if (k === 'k') { if (V.rx && V.rx.kan) onActClick('kan'); else if (mine && V.to.ankan.length) onActClick('ankan:' + V.to.ankan[0]); else if (mine && V.to.kakan.length) onActClick('kakan:' + V.to.kakan[0]); }
      else if (k === 'c' && V.rx && V.rx.chi) { const c = V.rx.chi[0]; onActClick('chi:' + c[0] + ',' + c[1]); }
      else if ((k === 'x' || k === 'backspace') && V.rx) onActClick('pass');
    });
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      snd('soft');
      const a = b.dataset.a;
      if (a === 'menu') showMenu();
      else if (a === 'hints') { sv.hints = !sv.hints; b.setAttribute('aria-pressed', String(sv.hints)); save(); D.hk = ''; D.dirty = true; }
      else if (a === 'rules') showRules();
    });
    api.on(window, 'resize', () => fit(false));

    function showRules() {
      const back = pane.dataset.k;
      showPane('rules', rmRules() + '<button class="rm-big gold" data-a="back">Got it</button>', () => { if (back === 'menu' || !M.V || M.V.phase === 'idle') showMenu(); else if (M.V && (M.V.phase === 'result' || M.V.phase === 'over')) showResult(); else hidePane(); });
    }
    function seg(name, opts, cur) { return `<span class="rm-seg" data-g="${name}">${opts.map(([v, l]) => `<button data-a="${name}:${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</span>`; }
    function showMenu() {
      const live = M.eng && M.V && M.V.phase !== 'idle' && M.V.phase !== 'over';
      const st = sv.st;
      showPane('menu', `<p class="rm-kick">Riichi Mahjong</p><h2>Japanese Mahjong</h2><p>Four players, 136 tiles, riichi, calls, dora and full yaku scoring.</p>
<div class="rm-opt"><span>Bot strength</span>${seg('diff', [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']], sv.diff)}</div>
<div class="rm-opt"><span>Game length</span>${seg('len', [[1, 'East (4 hands)'], [2, 'East + South']], sv.len)}</div>
<div class="rm-opt"><span>Red fives (aka dora)</span><button class="rm-tg" data-a="aka" role="switch" aria-checked="${sv.aka}" aria-label="Red fives"></button></div>
<div class="rm-opt"><span>Hand hints: waits, shanten, value</span><button class="rm-tg" data-a="hint" role="switch" aria-checked="${sv.hints}" aria-label="Hand hints"></button></div>
<button class="rm-big gold" data-a="solo">${live && M.mode === 'solo' ? 'New game vs 3 bots' : 'Play vs 3 bots'}</button>
<button class="rm-big blue" data-a="online">Play online (up to 4 players, bots fill empty seats)</button>
<div class="rm-row">${live ? '<button class="rm-sm" data-a="resume">Resume game</button>' : ''}<button class="rm-sm" data-a="rules">How to play</button></div>
<p style="font-size:12px;opacity:.7">${st.games ? `Games ${st.games} · 1st places ${st.firsts} · best ${rmFmt(st.best)} pts` : 'Your results are saved on this device.'}</p>`, (a, b) => {
        if (a.startsWith('diff:')) { sv.diff = a.slice(5); save(); pane.querySelectorAll('[data-g=diff] button').forEach(x => x.classList.toggle('on', x.dataset.a === a)); }
        else if (a.startsWith('len:')) { sv.len = +a.slice(4); save(); pane.querySelectorAll('[data-g=len] button').forEach(x => x.classList.toggle('on', x.dataset.a === a)); }
        else if (a === 'aka') { sv.aka = !sv.aka; b.setAttribute('aria-checked', String(sv.aka)); save(); }
        else if (a === 'hint') { sv.hints = !sv.hints; b.setAttribute('aria-checked', String(sv.hints)); bHints.setAttribute('aria-pressed', String(sv.hints)); save(); D.hk = ''; }
        else if (a === 'solo') { if (M.mode === 'online') leaveOnline(true); newSolo(); }
        else if (a === 'online') startOnline();
        else if (a === 'resume') hidePane();
        else if (a === 'rules') showRules();
      });
    }

    function tilesRow(ids, w, winId) {
      return ids.map(id => idImg(id, w)).join('') + (winId != null ? '<span class="gap"></span>' + idImg(winId, w, ' class="win"') : '');
    }
    function showResult() {
      const V = M.V;
      if (!V || !V.res) return;
      const r = V.res, tw = G.port ? 20 : 30;
      let html = '';
      const pts0 = V.pts.map((p, i) => p - r.deltas[i]);
      if (r.kind === 'win') {
        const w0 = r.wins[0];
        html += `<p class="rm-kick">${r.wins.length > 1 ? 'Double ron' : w0.tsumo ? 'Tsumo' : 'Ron'}</p><h2>${w0.p === M.seat ? 'You win' : esc(M.names[w0.p] || '') + ' wins'}${r.wins.length > 1 ? ' (with ' + esc(M.names[r.wins[1].p] || '') + ')' : ''}</h2>`;
        for (const w of r.wins) {
          const hand = w.hand.filter(id => id !== w.win);
          html += `<div class="rm-win">${r.wins.length > 1 ? '<div class="rm-lab">' + esc(M.names[w.p] || '') + '</div>' : ''}<div class="rm-tiles">${tilesRow(hand, tw, w.win)}${w.melds.map(m => meldImgs(m, w.p, tw)).join('')}</div>`;
          html += `<div class="rm-tiles"><span class="rm-lab" style="margin:0 8px">Dora</span>${r.ind.map(id => idImg(id, Math.round(tw * .7))).join('')}${w.riichi ? '<span class="rm-lab" style="margin:0 8px">Ura</span>' + r.ura.map(id => idImg(id, Math.round(tw * .7))).join('') : ''}</div>`;
          html += `<table class="rm-yk">${w.yaku.map(y => `<tr><td>${y[0]}</td><td>${w.ym ? '' : y[1] + ' han'}</td></tr>`).join('')}`;
          const pay = w.pay;
          const how = w.tsumo ? (w.p === V.dealer ? rmFmt(pay.each) + ' all' : rmFmt(pay.dealer) + ' / ' + rmFmt(pay.other)) : rmFmt(pay.ron);
          html += `<tr class="sum"><td>${w.ym ? 'Yakuman' : w.han + ' han · ' + w.fu + ' fu'}</td><td>${how}</td></tr></table>`;
          if (w.limit) html += `<div class="rm-lim">${w.limit}</div>`;
          if (w.honba || w.sticks) html += `<p style="font-size:12px;opacity:.75;margin:0">${w.honba ? w.honba + ' honba' : ''}${w.honba && w.sticks ? ' · ' : ''}${w.sticks ? w.sticks + ' riichi stick' + (w.sticks > 1 ? 's' : '') : ''} included</p>`;
          html += '</div>';
        }
      } else {
        html += `<p class="rm-kick">${r.kind === 'draw' ? 'Exhaustive draw' : 'Abortive draw'}</p><h2>${r.kind === 'draw' ? (r.nagashi.length ? 'Nagashi mangan!' : 'No one wins') : esc(r.reason)}</h2>`;
        if (r.kind === 'draw') {
          for (const p of Object.keys(r.hands)) {
            const h = r.hands[p];
            html += `<div class="rm-win"><div class="rm-lab">${esc(M.names[p] || '')} · tenpai</div><div class="rm-tiles">${tilesRow(h.hand, tw)}${h.melds.map(m => meldImgs(m, +p, tw)).join('')}</div><div class="rm-wait">waits ${h.waits.map(k => KNAME[k]).join(', ')}</div></div>`;
          }
          html += `<p>${r.nagashi.length ? esc(r.nagashi.map(p => M.names[p]).join(', ')) + ' discarded only terminals and honors.' : Object.keys(r.hands).length ? 'Tenpai players share 3,000 points.' : 'Nobody was tenpai.'}</p>`;
        } else html += '<p>The hand is replayed with the same dealer.</p>';
      }
      html += '<table class="rm-pt">' + [0, 1, 2, 3].map(p => `<tr class="${p === M.seat ? 'me' : ''}"><td>${esc(M.names[p] || '')}</td><td>${rmFmt(pts0[p])} → <b>${rmFmt(V.pts[p])}</b> <span class="${r.deltas[p] > 0 ? 'up' : r.deltas[p] < 0 ? 'dn' : ''}">${r.deltas[p] ? rmSign(r.deltas[p]) : ''}</span></td></tr>`).join('') + '</table>';
      if (r.over) html += `<button class="rm-big gold" data-a="final" ${M.role === 'guest' && M.rdy.indexOf(M.seat) >= 0 ? 'disabled' : ''}>See final result</button>`;
      else if (M.mode === 'online') {
        const humans = M.human.filter(Boolean).length, mine = M.role === 'host' ? M.ready.has(M.seat) : M.rdy.indexOf(M.seat) >= 0;
        const n = M.role === 'host' ? M.ready.size : M.rdy.length;
        html += `<button class="rm-big gold" data-a="next" ${mine ? 'disabled' : ''}>${mine ? 'Waiting for others (' + n + '/' + humans + ')' : 'Next hand'}</button>`;
      } else html += `<button class="rm-big gold" data-a="next">Next hand</button>`;
      showPane('result', html, a => {
        if (a === 'next') readyNext();
        else if (a === 'final') { if (M.role === 'guest') { api.net.send({ t: 'act', a: { t: 'ready' } }); M.rdy = M.rdy.concat([M.seat]); showResult(); } else nextHand(); }
      }, 'clear');
    }
    function readyNext() {
      if (M.role === 'guest') { api.net.send({ t: 'act', a: { t: 'ready' } }); M.rdy = M.rdy.concat([M.seat]); showResult(); return; }
      if (M.mode === 'online') { M.ready.add(M.seat); checkReady(); if (M.V && M.V.phase === 'result' && !pane.hidden) showResult(); sendRdy(); return; }
      nextHand();
    }
    function checkReady() {
      const hum = []; for (let p = 0; p < 4; p++) if (M.human[p]) hum.push(p);
      if (hum.every(p => M.ready.has(p))) nextHand();
    }
    function sendRdy() { if (M.role === 'host') api.net.send({ t: 'rdy', r: Array.from(M.ready) }); }
    function nextHand() {
      if (!M.eng) return;
      M.rtDue = 0;
      M.ready = new Set();
      act(M.seat, { t: 'next' });
    }
    function showFinal() {
      const V = M.V, f = V.final || (M.eng && M.eng.s.final);
      if (!f) return;
      const me = f.find(x => x.p === M.seat);
      const first = f[0];
      const rows = f.map(x => `<tr class="${x.p === M.seat ? 'me' : ''}"><td class="rk">${x.rank}</td><td>${esc(M.names[x.p] || '')}</td><td>${rmFmt(x.pts)}</td></tr>`).join('');
      const online = M.mode === 'online';
      let btns;
      if (!online) btns = `<button class="rm-big gold" data-a="again">Play again</button><div class="rm-row"><button class="rm-sm" data-a="menu">Menu</button></div>`;
      else if (M.role === 'host') btns = `<button class="rm-big gold" data-a="rematch">Rematch</button><div class="rm-row"><button class="rm-sm" data-a="lobby">Back to lobby</button><button class="rm-sm" data-a="leave">Leave</button></div>`;
      else btns = `<p>Waiting for the host…</p><div class="rm-row"><button class="rm-sm" data-a="leave">Leave</button></div>`;
      showPane('final', `<p class="rm-kick">Game over</p><h2>${me.rank === 1 ? 'You win!' : me.rank === 2 ? 'Second place' : me.rank === 3 ? 'Third place' : 'Fourth place'}</h2><p>${esc(M.names[first.p] || '')} finishes first with ${rmFmt(first.pts)} points.</p>
<table class="rm-pt">${rows}</table>${btns}`, a => {
        if (a === 'again') newSolo();
        else if (a === 'menu') showMenu();
        else if (a === 'rematch') rematch();
        else if (a === 'lobby') startOnline();
        else if (a === 'leave') { leaveOnline(true); showMenu(); }
      }, 'clear');
    }

    function sendSetups() { M.pids.forEach((id, q) => { if (id && q !== M.seat && M.human[q]) sendSetup(id, q); }); }
    function setupMsg(q) { return { t: 'setup', seat: q, human: M.human, names: M.names, opts: M.opts }; }
    function sendSetup(id, q) { api.net.sendTo(id, setupMsg(q)); }
    function sendSync(id) {
      if (M.role !== 'host' || !M.eng) return;
      const q = M.pids.indexOf(id);
      if (q < 0 || !M.human[q]) return;
      sendSetup(id, q);
      api.net.sendTo(id, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 });
      if (M.dl) api.net.sendTo(id, { t: 'tm', p: M.dl.p, ms: Math.max(0, M.dl.t0 + M.dl.ms - M.clock) });
      api.net.sendTo(id, { t: 'rdy', r: Array.from(M.ready) });
    }
    function seatToBot(id) {
      const q = M.pids.indexOf(id);
      if (q < 0 || M.role !== 'host' || !M.eng) return;
      const who = M.names[q];
      M.pids[q] = null; M.human[q] = false; M.names[q] = who.replace(/ \(Bot\)$/, '') + ' (Bot)';
      api.net.send({ t: 'seats', human: M.human, names: M.names });
      api.toast(who + ' left. A bot takes the seat.');
      M.sched = {}; M.ready.delete(q); M.dl = null;
      if (M.eng.s.phase === 'result' && !M.eng.s.res.over) checkReady();
      uiRefresh();
    }
    function leaveOnline(close) {
      M.tok++; M.mode = 'solo'; M.role = 'local'; M.eng = null; M.V = null; M.pids = []; M.players = []; M.human = [true, false, false, false]; M.dl = null;
      if (close) { try { api.net.close(); } catch (e) {} }
      uNet.hidden = true; D.dirty = true;
    }
    let hooked = false;
    function hookNet() {
      if (hooked) return;
      hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); });
      api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
      api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (M.mode !== 'online' || M.role !== 'guest') return;
        M.tok++; M.role = 'local'; M.eng = null;
        snd('lose');
        const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
        showPane('left', `<p class="rm-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="rm-big blue" data-a="room">Online lobby</button><button class="rm-big gold" data-a="solo">Play vs bots</button>`, a => {
          if (a === 'room') startOnline(); else { leaveOnline(true); newSolo(); }
        });
      });
      api.interval(() => {
        if (M.mode !== 'online') return;
        const on = api.net.connected;
        uNet.classList.toggle('bad', !on);
        uNet.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + M.human.filter(Boolean).length + ' player' + (M.human.filter(Boolean).length > 1 ? 's' : '') : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
      }, 1000);
    }
    async function startOnline() {
      M.tok++; const tok = M.tok;
      hookNet();
      hidePane(); M.mode = 'online'; M.role = null; M.eng = null; M.V = null; D.fx.length = 0; resetTable(); D.dirty = true; hud();
      const r = await api.net.room({ title: 'Riichi Mahjong', sizes: [4], defaultSize: 4, min: 4, max: 4, bots: true });
      if (!api.alive || tok !== M.tok) return;
      if (!r) { leaveOnline(false); return showMenu(); }
      M.role = r.role; M.players = r.players.slice(0, 4); M.bots = !!r.bots;
      uNet.hidden = false;
      if (r.role === 'host') { M.seat = 0; newOnlineMatch(); }
      else showPane('wait', `<p class="rm-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal…</p><div class="rm-row"><button class="rm-sm" data-a="leave">Leave</button></div>`, a => { if (a === 'leave') { leaveOnline(true); showMenu(); } });
    }
    function newOnlineMatch() {
      M.tok++;
      const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away)).slice(0, 4);
      M.players = live;
      M.opts = { aka: sv.aka, len: sv.len, diff: sv.diff };
      M.human = [false, false, false, false]; M.pids = [null, null, null, null]; M.names = ['', '', '', ''];
      live.forEach((x, i) => { M.human[i] = true; M.pids[i] = i === 0 ? null : x.id; M.names[i] = x.name || 'Player'; });
      seatsFor();
      M.seat = 0;
      beginMatch();
    }
    function rematch() {
      if (M.role !== 'host') return;
      newOnlineMatch();
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || M.mode !== 'online') return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(from);
        if (q < 0 || !M.human[q]) return;
        if (d.t === 'act' && d.a && typeof d.a === 'object') {
          if (d.a.t === 'ready') { if (M.eng.s.phase === 'result' && M.eng.s.res.over) nextHand(); else if (M.eng.s.phase === 'result') { M.ready.add(q); sendRdy(); checkReady(); if (!pane.hidden && pane.dataset.k === 'result') showResult(); } return; }
          if (d.a.t === 'next') return;
          if (!M.eng.act(q, d.a)) api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 });
          else flush();
        }
      } else {
        if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; M.seat = d.seat; M.human = d.human; M.names = d.names; M.opts = d.opts || M.opts;
          resetTable(); M.V = null; M.eng = null; hidePane(); uNet.hidden = false; D.dealT = performance.now(); api.score('25,000');
        } else if (M.role !== 'guest') return;
        else if (d.t === 'ev') {
          M.V = d.v; M.wait = 0;
          if (d.sync) { D.rc = d.v.disc.map(x => x.length); D.dealT = -1e9; D.ak = ''; if (d.v.phase === 'result' || d.v.phase === 'over') { M.resAt = M.clock + 50; } else if (!pane.hidden && pane.dataset.k !== 'left') hidePane(); }
          for (const e of d.es) onEv(e);
          if (d.v.phase === 'over' && !M.submitted) { M.submitted = true; const f = d.v.final, me = f && f.find(x => x.p === M.seat); if (me) { sv.st.games++; if (me.rank === 1) sv.st.firsts++; sv.st.best = Math.max(sv.st.best, me.pts); save(); if (me.pts > 0) api.submit(me.pts); } M.resAt = M.clock + 600; }
          uiRefresh();
        } else if (d.t === 'seats') { M.human = d.human; M.names = d.names; D.dirty = true; }
        else if (d.t === 'tm') { M.dl = { p: d.p, t0: M.clock, ms: +d.ms || 0, tid: 0 }; D.dirty = true; }
        else if (d.t === 'rdy') { M.rdy = d.r || []; if (!pane.hidden && pane.dataset.k === 'result') showResult(); }
      }
    }

    let lastSec = -1;
    api.loop((dt, now) => {
      pump(dt);
      if (M.dl && M.mode === 'online') { const s = Math.ceil((M.dl.t0 + M.dl.ms - M.clock) / 1000); if (s !== lastSec) { lastSec = s; D.dirty = true; } }
      if (M.mode === 'online' && M.role === 'host' && M.eng && M.eng.s.phase === 'result' && !M.rtDue && !M.eng.s.res.over) M.rtDue = M.clock + 40000;
      if (D.dirty || D.fx.length) { D.dirty = false; render(now); }
    });

    fit(true);
    M.V = null;
    if (api.net.invite) startOnline(); else showMenu();
    root._rm = { sync: sendSync, sv, ai: rAiAny, M, D, G: () => G, act, flush, newSolo, startOnline, V: () => M.V, show: showMenu, rules: showRules, pane: () => pane.hidden ? '' : pane.dataset.k, hl: () => D.hl, eng: () => M.eng, size: () => [W, Hh] };
  }

  Ameplay.register({
    id: 'mahjong',
    title: 'Riichi Mahjong',
    category: 'Board',
    tint: '#1d8a5a',
    blurb: 'Japanese riichi mahjong for four: chi, pon, kan, riichi, dora, furiten and full yaku scoring. Play bots or friends online.',
    help: 'Click a tile to discard (tap twice on touch) · <kbd>R</kbd> riichi · <kbd>T</kbd> tsumo/ron · <kbd>P</kbd> pon · <kbd>C</kbd> chi · <kbd>K</kbd> kan · <kbd>X</kbd> pass · <kbd>H</kbd> hints · arrows + <kbd>Enter</kbd> to play by keyboard',
    width: 960,
    better: 'high',
    format: v => Math.round(v).toLocaleString('en') + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="12" width="20" height="28" rx="4"/><rect x="34" y="12" width="20" height="28" rx="4" fill="currentColor" fill-opacity=".14"/><path d="M19 20v12M14 26h10M44 19v14M39 26h10"/><rect x="22" y="40" width="20" height="14" rx="3"/></svg>',
    _t: { evalHand, shanten, waitsOf, canWin, rGame, rAiAny, payments, basePoints, countOf },
    css: RM_CSS,
    mount: mountRiichi
  });
})();
