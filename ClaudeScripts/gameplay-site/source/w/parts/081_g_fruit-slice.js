
(() => {
  'use strict';
  const ID = 'fruit-slice';
  const CFG = {
    HZ: 120,
    G: 1.3,
    APEX: [0.52, 0.88],
    SPIN: 2.6,
    HIT_MOUSE: 1.0, HIT_TOUCH: 1.2,
    COMBO_GAP: 0.28,
    CRIT: 0.035, CRIT_PTS: 10,
    LIVES: 3, LIFE_EVERY: 100,
    ARCADE_T: 60, ZEN_T: 90, BOMB_COST: 10,
    BANANA_T: 7, FREEZE_TS: 0.35, BANANA_EVERY: [7, 11],
    BLITZ_GAP: 2.2, BLITZ_MAX: 6, BLITZ_PTS: 5,
    POM_T: 3.6,
    TRAIL_T: 0.15, TRAIL_W: 15,
    STAIN_T: 5.5,
    SWOOSH_V: 1300
  };
  const TAU = Math.PI * 2;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const FONT = px => `900 ${px}px Nunito, "Arial Rounded MT Bold", system-ui, sans-serif`;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const seeded = n => () => ((n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296);
  function mk(w, h, d = DPR) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * d); c.height = Math.ceil(h * d);
    const s = c.getContext('2d'); s.setTransform(d, 0, 0, d, 0, 0);
    return [c, s];
  }
  const rad = (s, x, y, r0, x1, y1, r1, st) => { const g = s.createRadialGradient(x, y, r0, x1, y1, r1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
  const lin = (s, x0, y0, x1, y1, st) => { const g = s.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
  const circ = (s, x, y, r) => { s.beginPath(); s.arc(x, y, r, 0, TAU); };
  function fillShape(s, shape, r, k, style) { s.save(); s.scale(k, k); s.beginPath(); shape(s, r); s.fillStyle = style; s.fill(); s.restore(); }
  function innerShadow(s, shape, r, col, blur, ox = 0, oy = 0) {
    s.save();
    s.beginPath(); shape(s, r); s.clip();
    s.beginPath(); s.rect(-r * 5, -r * 5, r * 10, r * 10); shape(s, r);
    s.shadowColor = col; s.shadowBlur = blur * DPR; s.shadowOffsetX = ox * DPR; s.shadowOffsetY = oy * DPR;
    s.fillStyle = '#000'; s.fill('evenodd');
    s.restore();
  }
  function speckle(s, R, n, rx, ry, cols, r0, r1) {
    for (let i = 0; i < n; i++) {
      const a = R() * TAU, q = Math.sqrt(R());
      s.fillStyle = cols[i % cols.length];
      circ(s, Math.cos(a) * q * rx, Math.sin(a) * q * ry, r0 + R() * (r1 - r0)); s.fill();
    }
  }
  function segments(s, r, n, k, c0, c1, mem) {
    s.save(); s.scale(k, k);
    for (let i = 0; i < n; i++) {
      const a0 = i / n * TAU + .03, a1 = (i + 1) / n * TAU - .03;
      s.beginPath(); s.moveTo(Math.cos((a0 + a1) / 2) * r * .1, Math.sin((a0 + a1) / 2) * r * .1); s.arc(0, 0, r * .97, a0, a1); s.closePath();
      s.fillStyle = rad(s, 0, 0, r * .08, 0, 0, r, [[0, c0], [1, c1]]); s.fill();
    }
    s.strokeStyle = mem; s.lineWidth = r * .045;
    for (let i = 0; i < n; i++) { const a = i / n * TAU; s.beginPath(); s.moveTo(0, 0); s.lineTo(Math.cos(a) * r * .97, Math.sin(a) * r * .97); s.stroke(); }
    s.strokeStyle = 'rgba(255,255,255,.28)'; s.lineWidth = 1;
    for (let i = 0; i < n * 5; i++) { const a = (i + .5) / (n * 5) * TAU, q = .3 + (i % 3) * .2; s.beginPath(); s.moveTo(Math.cos(a) * r * q, Math.sin(a) * r * q); s.lineTo(Math.cos(a) * r * (q + .2), Math.sin(a) * r * (q + .2)); s.stroke(); }
    s.fillStyle = mem; circ(s, 0, 0, r * .1); s.fill();
    s.restore();
  }
  function leaf(s, x, y, len, w, a, c0, c1) {
    s.save(); s.translate(x, y); s.rotate(a);
    s.beginPath(); s.moveTo(0, 0); s.quadraticCurveTo(len * .45, -w, len, 0); s.quadraticCurveTo(len * .45, w, 0, 0);
    s.fillStyle = lin(s, 0, -w, 0, w, [[0, c0], [1, c1]]); s.fill();
    s.strokeStyle = 'rgba(255,255,255,.35)'; s.lineWidth = 1; s.beginPath(); s.moveTo(len * .08, 0); s.lineTo(len * .85, 0); s.stroke();
    s.restore();
  }

  const SH = {
    ell: (kx, ky) => (s, r) => { s.moveTo(r * kx, 0); s.ellipse(0, 0, r * kx, r * ky, 0, 0, TAU); },
    apple: (s, r) => {
      s.moveTo(0, -r * .66);
      s.bezierCurveTo(r * .55, -r * 1.06, r * 1.1, -r * .62, r * .98, r * .08);
      s.bezierCurveTo(r * .9, r * .74, r * .46, r * 1.0, 0, r * .88);
      s.bezierCurveTo(-r * .46, r * 1.0, -r * .9, r * .74, -r * .98, r * .08);
      s.bezierCurveTo(-r * 1.1, -r * .62, -r * .55, -r * 1.06, 0, -r * .66);
      s.closePath();
    },
    banana: (s, r) => {
      const o = -r * .3;
      s.moveTo(-r * 1.05, -r * .28 + o);
      s.quadraticCurveTo(0, r * 1.5 + o, r * 1.05, -r * .28 + o);
      s.quadraticCurveTo(r * 1.0, -r * .1 + o, r * .9, -r * .1 + o);
      s.quadraticCurveTo(0, r * .22 + o, -r * .9, -r * .1 + o);
      s.quadraticCurveTo(-r * 1.0, -r * .1 + o, -r * 1.05, -r * .28 + o);
      s.closePath();
    },
    pine: (s, r) => { s.moveTo(r * .7, r * .18); s.ellipse(0, r * .18, r * .7, r * .84, 0, 0, TAU); },
    straw: (s, r) => {
      s.moveTo(0, -r * .72);
      s.bezierCurveTo(r * .45, -r * .98, r * .98, -r * .86, r * .96, -r * .24);
      s.bezierCurveTo(r * .93, r * .32, r * .38, r * .86, 0, r * 1.0);
      s.bezierCurveTo(-r * .38, r * .86, -r * .93, r * .32, -r * .96, -r * .24);
      s.bezierCurveTo(-r * .98, -r * .86, -r * .45, -r * .98, 0, -r * .72);
      s.closePath();
    },
    mango: (s, r) => {
      s.moveTo(-r * .96, 0);
      s.bezierCurveTo(-r * .96, -r * .6, -r * .3, -r * .86, r * .25, -r * .8);
      s.bezierCurveTo(r * .86, -r * .72, r * 1.06, -r * .2, r * .96, r * .2);
      s.bezierCurveTo(r * .86, r * .66, r * .3, r * .86, -r * .2, r * .78);
      s.bezierCurveTo(-r * .7, r * .7, -r * .96, r * .45, -r * .96, 0);
      s.closePath();
    },
    lemon: (s, r) => {
      s.moveTo(-r * 1.08, 0);
      s.quadraticCurveTo(-r * 1.0, -r * .12, -r * .88, -r * .3);
      s.bezierCurveTo(-r * .6, -r * .86, r * .6, -r * .86, r * .88, -r * .3);
      s.quadraticCurveTo(r * 1.0, -r * .12, r * 1.08, 0);
      s.quadraticCurveTo(r * 1.0, r * .12, r * .88, r * .3);
      s.bezierCurveTo(r * .6, r * .86, -r * .6, r * .86, -r * .88, r * .3);
      s.quadraticCurveTo(-r * 1.0, r * .12, -r * 1.08, 0);
      s.closePath();
    },
    pear: (s, r) => {
      s.moveTo(0, -r * .98);
      s.bezierCurveTo(r * .3, -r * .98, r * .38, -r * .46, r * .5, -r * .14);
      s.bezierCurveTo(r * .98, r * .3, r * .8, r * .98, 0, r * .98);
      s.bezierCurveTo(-r * .8, r * .98, -r * .98, r * .3, -r * .5, -r * .14);
      s.bezierCurveTo(-r * .38, -r * .46, -r * .3, -r * .98, 0, -r * .98);
      s.closePath();
    },
    peach: (s, r) => {
      s.moveTo(0, -r * .8);
      s.bezierCurveTo(r * .3, -r * 1.0, r * .98, -r * .8, r * .98, -r * .05);
      s.bezierCurveTo(r * .98, r * .6, r * .5, r * .98, 0, r * .98);
      s.bezierCurveTo(-r * .5, r * .98, -r * .98, r * .6, -r * .98, -r * .05);
      s.bezierCurveTo(-r * .98, -r * .8, -r * .3, -r * 1.0, 0, -r * .8);
      s.closePath();
    }
  };

  const FR = [
    {
      id: 'watermelon', r: 50, ext: 52, hit: 50, juice: '#e8233a', flesh: '#ff5468', shape: SH.ell(1, .8), big: 1,
      paint(s, r, R, sh) {
        const rx = r, ry = r * .8;
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#a6e070'], [.6, '#74c048'], [1, '#3e8a26']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        for (let i = 0; i < 70; i++) { s.fillStyle = R() < .5 ? 'rgba(190,240,120,.16)' : 'rgba(20,60,10,.14)'; s.beginPath(); s.ellipse((R() * 2 - 1) * rx, (R() * 2 - 1) * ry, 2 + R() * 6, 1 + R() * 3, 0, 0, TAU); s.fill(); }
        for (let k = 0; k < 8; k++) {
          const kk = -1 + k * 2 / 7, top = [], bot = [];
          for (let j = 0; j <= 26; j++) {
            const x = -rx + 2 * rx * j / 26, q = Math.sqrt(Math.max(0, 1 - (x / rx) ** 2)), yc = kk * ry * q * .96, w = (r * .022 + r * .05 * q) * (1 + (R() - .5) * .7), jag = (j & 1 ? 1 : -1) * r * .022;
            top.push([x, yc - w + jag]); bot.push([x, yc + w - jag]);
          }
          s.beginPath(); top.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y));
          for (let i = bot.length - 1; i >= 0; i--) s.lineTo(bot[i][0], bot[i][1]);
          s.closePath(); s.fillStyle = 'rgba(18,58,12,.95)'; s.fill();
        }
        s.restore();
        s.fillStyle = '#c8b860'; s.beginPath(); s.ellipse(rx * .96, 0, 3, 4.5, 0, 0, TAU); s.fill();
        innerShadow(s, sh, r, 'rgba(0,30,0,.55)', 9);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#2c6a1c');
        fillShape(s, sh, r, .95, rad(s, 0, 0, 0, 0, 0, r, [[0, '#f6ffe0'], [1, '#c4e894']]));
        fillShape(s, sh, r, .86, rad(s, 0, 0, 0, 0, 0, r * .86, [[0, '#ff8494'], [.55, '#f73a52'], [1, '#df1f3a']]));
        for (let i = 0; i < 60; i++) { const a = R() * TAU, q = Math.sqrt(R()) * .78; s.fillStyle = 'rgba(255,190,200,.35)'; s.beginPath(); s.ellipse(Math.cos(a) * q * r, Math.sin(a) * q * r * .8, 1.2, 2.4, a, 0, TAU); s.fill(); }
        for (const [q, n] of [[.36, 7], [.6, 11]]) for (let i = 0; i < n; i++) {
          const a = i / n * TAU + q * 3, x = Math.cos(a) * q * r, y = Math.sin(a) * q * r * .8;
          s.save(); s.translate(x, y); s.rotate(a + Math.PI / 2);
          s.fillStyle = '#1a100c'; s.beginPath(); s.moveTo(0, -4.6); s.quadraticCurveTo(3, 0, 0, 4); s.quadraticCurveTo(-3, 0, 0, -4.6); s.fill();
          s.fillStyle = 'rgba(255,255,255,.5)'; circ(s, -.8, -1.4, .9); s.fill();
          s.restore();
        }
      }
    },
    {
      id: 'orange', r: 34, ext: 38, hit: 34, juice: '#ff9a12', flesh: '#ffb030', shape: SH.ell(1, 1),
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#ffc24a'], [.6, '#ff9810'], [1, '#d96200']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        speckle(s, R, 260, r, r, ['rgba(160,60,0,.3)', 'rgba(255,225,160,.3)'], .5, 1.3);
        s.restore();
        s.fillStyle = '#7b8a22'; s.beginPath();
        for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, q = i & 1 ? 1.6 : 4; s.lineTo(Math.cos(a) * q, -r * .9 + Math.sin(a) * q * .6); }
        s.fill();
        leaf(s, 2, -r * .92, r * .5, r * .16, -.5, '#5cbf4a', '#2f8a2c');
        innerShadow(s, sh, r, 'rgba(110,30,0,.6)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#f08a10');
        fillShape(s, sh, r, .93, '#fff2da');
        segments(s, r, 10, .86, '#ffd070', '#ff9a1a', '#fff4dc');
      }
    },
    {
      id: 'apple', r: 35, ext: 46, hit: 35, juice: '#f5e2a4', flesh: '#fff3c8', shape: SH.apple,
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, r * .1, 0, 0, r * .1, r * 1.05, [[0, '#ff6b5e'], [.55, '#e3232d'], [1, '#8a0a16']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        s.lineWidth = 1.4;
        for (let i = 0; i < 26; i++) { const x = (R() * 2 - 1) * r; s.strokeStyle = R() < .5 ? 'rgba(255,200,110,.16)' : 'rgba(110,0,10,.18)'; s.beginPath(); s.moveTo(x * .4, -r * .6); s.quadraticCurveTo(x * 1.1, 0, x * .55, r * .9); s.stroke(); }
        speckle(s, R, 50, r * .9, r * .85, ['rgba(255,230,170,.4)'], .5, 1);
        s.fillStyle = rad(s, 0, -r * .62, 0, 0, -r * .62, r * .4, [[0, 'rgba(90,0,10,.55)'], [1, 'rgba(90,0,10,0)']]); s.fillRect(-r, -r, r * 2, r);
        s.restore();
        s.strokeStyle = '#5a3415'; s.lineWidth = 3.2; s.lineCap = 'round';
        s.beginPath(); s.moveTo(0, -r * .62); s.quadraticCurveTo(r * .05, -r * .98, r * .2, -r * 1.16); s.stroke();
        leaf(s, r * .12, -r * .98, r * .62, r * .2, -.45, '#7fd45a', '#2f8a2c');
        innerShadow(s, sh, r, 'rgba(60,0,0,.7)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#c8121e');
        fillShape(s, sh, r, .93, rad(s, 0, 0, 0, 0, 0, r, [[0, '#fffbe6'], [1, '#f4e1a6']]));
        s.strokeStyle = 'rgba(200,170,90,.55)'; s.lineWidth = 1.5; s.fillStyle = 'rgba(235,210,140,.5)';
        s.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU - Math.PI / 2, q = i & 1 ? r * .12 : r * .3; s.lineTo(Math.cos(a) * q, Math.sin(a) * q + r * .08); } s.fill(); s.stroke();
        s.fillStyle = '#4e2a10';
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; s.beginPath(); s.ellipse(Math.cos(a) * r * .19, Math.sin(a) * r * .19 + r * .08, 1.8, 3.4, a + Math.PI / 2, 0, TAU); s.fill(); }
      }
    },
    {
      id: 'banana', r: 46, ext: 52, hit: 40, juice: '#f6eaa6', flesh: '#fff6cf', shape: SH.banana,
      paint(s, r, R, sh) { paintBanana(s, r, R, sh, ['#fff7a8', '#ffd92e', '#d9a000'], '#5a3a10'); },
      inner(s, r, R, sh) { innerBanana(s, r, sh, '#f2c418'); }
    },
    {
      id: 'pineapple', r: 42, ext: 72, hit: 42, juice: '#ffd21f', flesh: '#ffe048', shape: SH.pine,
      paint(s, r, R, sh) {
        crown(s, r, true);
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, r * .18, 0, 0, r * .18, r * .9, [[0, '#ffd45e'], [.6, '#e59a1c'], [1, '#93530a']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        const e1 = [r * .25, r * .19], e2 = [-r * .25, r * .19];
        for (let u = -6; u <= 6; u++) for (let v = -6; v <= 6; v++) {
          const cx = u * e1[0] + v * e2[0], cy = r * .18 + u * e1[1] + v * e2[1];
          if (Math.abs(cx) > r * .8 || Math.abs(cy - r * .18) > r * .95) continue;
          s.beginPath(); s.moveTo(cx + (e1[0] + e2[0]) / 2, cy + (e1[1] + e2[1]) / 2); s.lineTo(cx + (e1[0] - e2[0]) / 2, cy + (e1[1] - e2[1]) / 2); s.lineTo(cx - (e1[0] + e2[0]) / 2, cy - (e1[1] + e2[1]) / 2); s.lineTo(cx - (e1[0] - e2[0]) / 2, cy - (e1[1] - e2[1]) / 2); s.closePath();
          s.fillStyle = rad(s, cx, cy - 2, 0, cx, cy, r * .2, [[0, 'rgba(255,225,120,.55)'], [1, 'rgba(120,60,0,.35)']]); s.fill();
          s.strokeStyle = 'rgba(90,45,5,.7)'; s.lineWidth = 1.4; s.stroke();
          s.fillStyle = '#5a4a14'; s.beginPath(); s.moveTo(cx - 2.2, cy - 1); s.lineTo(cx, cy - 6); s.lineTo(cx + 2.2, cy - 1); s.fill();
          s.fillStyle = 'rgba(255,240,180,.55)'; circ(s, cx - 1, cy + 2, 1.2); s.fill();
        }
        s.restore();
        innerShadow(s, sh, r, 'rgba(70,30,0,.7)', 12);
        crown(s, r, false);
      },
      inner(s, r, R, sh) {
        crown(s, r, true);
        fillShape(s, sh, r, 1, '#a8650e');
        s.save(); s.beginPath(); sh(s, r); s.clip(); s.fillStyle = '#5a3a08';
        for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; circ(s, Math.cos(a) * r * .63, r * .18 + Math.sin(a) * r * .76, 2.2); s.fill(); }
        s.restore();
        s.save(); s.translate(0, r * .18); s.scale(.9, .9); s.translate(0, -r * .18);
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, r * .18, 0, 0, r * .18, r * .85, [[0, '#fff3a8'], [.35, '#ffe75e'], [1, '#ffc928']]); s.fill();
        s.strokeStyle = 'rgba(255,255,220,.45)'; s.lineWidth = 1;
        for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; s.beginPath(); s.moveTo(Math.cos(a) * r * .18, r * .18 + Math.sin(a) * r * .22); s.lineTo(Math.cos(a) * r * .66, r * .18 + Math.sin(a) * r * .8); s.stroke(); }
        s.fillStyle = '#fff6c4'; s.beginPath(); s.ellipse(0, r * .18, r * .16, r * .22, 0, 0, TAU); s.fill();
        s.restore();
        crown(s, r, false);
      }
    },
    {
      id: 'kiwi', r: 32, ext: 34, hit: 32, juice: '#8ccf35', flesh: '#9ad840', shape: SH.ell(1, .82),
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#b0844f'], [.6, '#8c6034'], [1, '#553617']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip(); s.lineWidth = 1;
        for (let i = 0; i < 520; i++) { const x = (R() * 2 - 1) * r, y = (R() * 2 - 1) * r * .82, a = R() * TAU; s.strokeStyle = R() < .55 ? 'rgba(60,35,12,.4)' : 'rgba(215,175,120,.3)'; s.beginPath(); s.moveTo(x, y); s.lineTo(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6); s.stroke(); }
        s.restore();
        s.fillStyle = '#3a220c'; s.beginPath(); s.ellipse(r * .96, 0, 2.4, 3.4, 0, 0, TAU); s.fill();
        innerShadow(s, sh, r, 'rgba(30,15,0,.75)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#6b4423');
        fillShape(s, sh, r, .95, rad(s, 0, 0, 0, 0, 0, r, [[0, '#f6ffd8'], [.22, '#d8f292'], [.5, '#92d63c'], [1, '#5aa81c']]));
        s.save(); s.scale(1, .82); s.strokeStyle = 'rgba(240,255,200,.45)'; s.lineWidth = 1;
        for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; s.beginPath(); s.moveTo(Math.cos(a) * r * .22, Math.sin(a) * r * .22); s.lineTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); s.stroke(); }
        s.fillStyle = '#16110a';
        for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, q = r * (i & 1 ? .3 : .37); s.beginPath(); s.ellipse(Math.cos(a) * q, Math.sin(a) * q, 2.4, 1.1, a, 0, TAU); s.fill(); }
        s.fillStyle = '#fbfff2'; s.beginPath(); s.ellipse(0, 0, r * .2, r * .15, 0, 0, TAU); s.fill();
        s.restore();
      }
    },
    {
      id: 'strawberry', r: 30, ext: 36, hit: 31, juice: '#e81c34', flesh: '#ff5c6c', shape: SH.straw,
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#ff6670'], [.6, '#ef1f2f'], [1, '#9e0a18']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) {
          const x = (col - 4 + (row & 1) * .5) * r * .24, y = -r * .62 + row * r * .2;
          s.fillStyle = 'rgba(110,0,10,.45)'; s.beginPath(); s.ellipse(x, y + .6, 2.4, 3, 0, 0, TAU); s.fill();
          s.fillStyle = '#ffe07a'; s.beginPath(); s.ellipse(x, y, 1.2, 2, 0, 0, TAU); s.fill();
        }
        s.restore();
        innerShadow(s, sh, r, 'rgba(70,0,0,.7)', 9);
        calyx(s, r);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#e3172a');
        fillShape(s, sh, r, .92, rad(s, 0, -r * .05, 0, 0, 0, r, [[0, '#fff2f2'], [.3, '#ffbcc4'], [.7, '#ff5466'], [1, '#e8243a']]));
        s.strokeStyle = 'rgba(255,240,240,.55)'; s.lineWidth = 1.2;
        for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; s.beginPath(); s.moveTo(0, -r * .05); s.lineTo(Math.cos(a) * r * .7, Math.sin(a) * r * .7 - r * .05); s.stroke(); }
        calyx(s, r);
      }
    },
    {
      id: 'coconut', r: 39, ext: 41, hit: 39, juice: '#f4f1e8', flesh: '#fffaf0', shape: SH.ell(1, .96), big: 1,
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#93623a'], [.6, '#6b4325'], [1, '#3a210e']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip(); s.lineWidth = 1.2; s.lineCap = 'round';
        const cols = ['rgba(60,34,14,.6)', 'rgba(170,120,70,.45)', 'rgba(95,58,28,.6)'];
        for (let i = 0; i < 700; i++) { const x = (R() * 2 - 1) * r, y = (R() * 2 - 1) * r, a = R() * TAU, l = 2 + R() * 5; s.strokeStyle = cols[i % 3]; s.beginPath(); s.moveTo(x, y); s.quadraticCurveTo(x + Math.cos(a + 1) * l * .5, y + Math.sin(a + 1) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); s.stroke(); }
        s.restore();
        for (const [x, y] of [[-r * .17, -r * .58], [r * .17, -r * .58], [0, -r * .38]]) { s.fillStyle = '#26150a'; s.beginPath(); s.ellipse(x, y, 3.4, 4, 0, 0, TAU); s.fill(); s.strokeStyle = 'rgba(190,140,90,.4)'; s.lineWidth = 1; s.stroke(); }
        innerShadow(s, sh, r, 'rgba(20,8,0,.8)', 12);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#3e240f');
        fillShape(s, sh, r, .9, rad(s, 0, 0, 0, 0, 0, r, [[0, '#fffdf6'], [1, '#efe6d2']]));
        fillShape(s, sh, r, .58, rad(s, 0, 0, 0, 0, 0, r * .58, [[0, '#f4f8fa'], [1, '#d5e0e6']]));
        s.fillStyle = 'rgba(255,255,255,.7)'; s.beginPath(); s.ellipse(-r * .15, -r * .18, r * .16, r * .07, -.5, 0, TAU); s.fill();
      }
    },
    {
      id: 'mango', r: 37, ext: 41, hit: 36, juice: '#ffa51a', flesh: '#ffb52e', shape: SH.mango,
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = lin(s, -r, r, r, -r, [[0, '#6fb83a'], [.3, '#c4cf38'], [.55, '#ffc23a'], [.8, '#ff7a2e'], [1, '#e2402c']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, 'rgba(255,255,220,.25)'], [.7, 'rgba(0,0,0,0)'], [1, 'rgba(60,10,0,.3)']]); s.fillRect(-r, -r, r * 2, r * 2);
        speckle(s, R, 80, r * .9, r * .75, ['rgba(255,255,200,.45)'], .5, 1);
        s.restore();
        s.fillStyle = '#5a3a14'; s.beginPath(); s.ellipse(r * .24, -r * .8, 2.6, 2, 0, 0, TAU); s.fill();
        innerShadow(s, sh, r, 'rgba(70,20,0,.6)', 11);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#e8742a');
        fillShape(s, sh, r, .94, rad(s, 0, 0, 0, 0, 0, r, [[0, '#ffd848'], [.6, '#ffa820'], [1, '#f08a10']]));
        s.save(); s.beginPath(); sh(s, r * .92); s.clip(); s.strokeStyle = 'rgba(255,230,140,.4)'; s.lineWidth = 1;
        for (let i = 0; i < 18; i++) { const y = -r * .7 + i * r * .08; s.beginPath(); s.moveTo(-r * .8, y + r * .2); s.quadraticCurveTo(0, y - r * .1, r * .8, y + r * .2); s.stroke(); }
        s.restore(); s.fillStyle = 'rgba(255,244,200,.75)'; s.beginPath(); s.ellipse(0, 0, r * .56, r * .22, -.12, 0, TAU); s.fill();
      }
    },
    {
      id: 'plum', r: 30, ext: 33, hit: 31, juice: '#a01f4e', flesh: '#ffcf5e', shape: SH.ell(1, .95),
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#9c3fa2'], [.6, '#6a1b6e'], [1, '#30063a']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        speckle(s, R, 160, r, r, ['rgba(225,195,245,.14)', 'rgba(200,170,230,.1)'], 1, 3.2);
        s.strokeStyle = 'rgba(30,0,40,.45)'; s.lineWidth = 2.2; s.beginPath(); s.moveTo(r * .1, -r * .92); s.quadraticCurveTo(r * .5, 0, r * .05, r * .94); s.stroke();
        s.strokeStyle = 'rgba(230,180,240,.22)'; s.lineWidth = 2; s.beginPath(); s.moveTo(r * .2, -r * .8); s.quadraticCurveTo(r * .6, 0, r * .16, r * .84); s.stroke();
        s.restore();
        s.strokeStyle = '#4a2a10'; s.lineWidth = 2.6; s.lineCap = 'round'; s.beginPath(); s.moveTo(r * .08, -r * .9); s.lineTo(r * .02, -r * 1.12); s.stroke();
        innerShadow(s, sh, r, 'rgba(20,0,30,.8)', 9);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#4a0f50');
        fillShape(s, sh, r, .94, rad(s, 0, 0, 0, 0, 0, r, [[0, '#ffe690'], [.55, '#ffc94d'], [.85, '#ec7a3a'], [1, '#b22a4a']]));
        s.fillStyle = '#8c4a26'; s.beginPath(); s.ellipse(0, 0, r * .3, r * .44, 0, 0, TAU); s.fill();
        s.strokeStyle = 'rgba(60,25,8,.55)'; s.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) { s.beginPath(); s.moveTo(-r * .18 + i * r * .12, -r * .32); s.quadraticCurveTo(-r * .1 + i * r * .08, 0, -r * .16 + i * r * .11, r * .34); s.stroke(); }
      }
    },
    {
      id: 'lemon', r: 33, ext: 37, hit: 33, juice: '#ffe83a', flesh: '#fff59a', shape: SH.lemon,
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r * 1.05, [[0, '#fff8a0'], [.6, '#ffe42e'], [.92, '#d8b400'], [1, '#a8a020']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        speckle(s, R, 240, r, r * .8, ['rgba(170,130,0,.28)', 'rgba(255,255,210,.35)'], .5, 1.2);
        s.restore();
        innerShadow(s, sh, r, 'rgba(110,80,0,.55)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#f2d000');
        fillShape(s, sh, r, .92, '#fffbe2');
        s.save(); s.scale(1, .78); segments(s, r, 9, .86, '#fffbc4', '#ffe86a', '#fffde8'); s.restore();
      }
    },
    {
      id: 'pear', r: 34, ext: 42, hit: 34, juice: '#e8f0a0', flesh: '#f8f8d4', shape: SH.pear,
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, -r * .2, r * .2, 0, 0, r * .1, r * 1.05, [[0, '#f0f27a'], [.5, '#b6d63c'], [1, '#6c9a1e']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        s.fillStyle = rad(s, r * .45, r * .3, 0, r * .45, r * .3, r * .75, [[0, 'rgba(255,120,60,.45)'], [1, 'rgba(255,120,60,0)']]); s.fillRect(-r, -r, r * 2, r * 2);
        speckle(s, R, 80, r * .9, r * .95, ['rgba(120,80,20,.35)', 'rgba(255,255,200,.3)'], .5, 1.2);
        s.restore();
        s.strokeStyle = '#5a3a18'; s.lineWidth = 3.2; s.lineCap = 'round';
        s.beginPath(); s.moveTo(0, -r * .95); s.quadraticCurveTo(r * .06, -r * 1.14, r * .22, -r * 1.22); s.stroke();
        leaf(s, r * .1, -r * 1.02, r * .6, r * .19, -.5, '#82d85c', '#2f8a2c');
        innerShadow(s, sh, r, 'rgba(50,70,0,.6)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#8fb030');
        fillShape(s, sh, r, .93, rad(s, 0, 0, 0, 0, 0, r, [[0, '#fffff0'], [.6, '#f4f6c8'], [1, '#e2e8a0']]));
        s.fillStyle = 'rgba(230,220,160,.7)'; s.beginPath(); s.ellipse(0, r * .1, r * .17, r * .38, 0, 0, TAU); s.fill();
        s.fillStyle = '#4e2a10';
        for (const dx of [-1, 1]) { s.beginPath(); s.ellipse(dx * r * .07, r * .08, 1.7, 3.4, dx * .15, 0, TAU); s.fill(); }
        s.fillStyle = 'rgba(190,170,90,.4)';
        for (let i = 0; i < 40; i++) { const a = R() * TAU, q = .25 + R() * .6; s.beginPath(); s.arc(Math.cos(a) * q * r * .8, Math.sin(a) * q * r * .9, .8, 0, TAU); s.fill(); }
      }
    },
    {
      id: 'dragonfruit', r: 36, ext: 52, hit: 36, juice: '#e8369e', flesh: '#fff0fa', shape: SH.ell(1, .86),
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, -r * .2, -r * .25, 0, 0, 0, r, [[0, '#ff7ac8'], [.6, '#e8268c'], [1, '#a00f62']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        for (let i = 0; i < 26; i++) {
          const a = i / 26 * TAU + (i % 2) * .12, q = i % 2 ? .62 : .84, x = Math.cos(a) * r * q, y = Math.sin(a) * r * .86 * q;
          leaf(s, x, y, r * .34, r * .1, a + (i % 2 ? .3 : -.2), '#7ee05a', '#2f9a30');
        }
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; leaf(s, Math.cos(a) * r * .3, Math.sin(a) * r * .26, r * .28, r * .09, a, '#9bf070', '#3aa43a'); }
        s.restore();
        innerShadow(s, sh, r, 'rgba(80,0,40,.6)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#d8248c');
        fillShape(s, sh, r, .92, '#ff6ab8');
        fillShape(s, sh, r, .84, rad(s, 0, 0, 0, 0, 0, r, [[0, '#ffffff'], [.7, '#fff2fb'], [1, '#ffd8ee']]));
        s.fillStyle = '#16121a';
        for (let i = 0; i < 70; i++) { const a = R() * TAU, q = Math.sqrt(R()) * .78; s.beginPath(); s.arc(Math.cos(a) * q * r, Math.sin(a) * q * r * .86, 1 + R() * .7, 0, TAU); s.fill(); }
      }
    },
    {
      id: 'lime', r: 31, ext: 35, hit: 31, juice: '#9ede2a', flesh: '#d8f58a', shape: SH.ell(1, .94),
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, -r * .25, -r * .3, 0, 0, 0, r, [[0, '#d2f56a'], [.55, '#6cc02a'], [1, '#2e7a14']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        speckle(s, R, 280, r, r, ['rgba(20,80,0,.3)', 'rgba(230,255,160,.32)'], .5, 1.2);
        s.restore();
        s.fillStyle = '#4a6a14'; s.beginPath(); s.arc(r * .86, 0, 2.6, 0, TAU); s.fill();
        leaf(s, -r * .05, -r * .9, r * .5, r * .16, -.7, '#7fd45a', '#2f8a2c');
        innerShadow(s, sh, r, 'rgba(10,60,0,.6)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#4a9a14');
        fillShape(s, sh, r, .93, '#f6ffd8');
        segments(s, r, 9, .86, '#e2fa94', '#a0dc3a', '#f4ffd0');
      }
    },
    {
      id: 'peach', r: 35, ext: 40, hit: 35, juice: '#ffb03a', flesh: '#ffc25a', shape: SH.peach,
      paint(s, r, R, sh) {
        s.beginPath(); sh(s, r); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#ffd690'], [.6, '#ffae60'], [1, '#e2702e']]); s.fill();
        s.save(); s.beginPath(); sh(s, r); s.clip();
        s.fillStyle = rad(s, r * .32, r * .12, 0, r * .32, r * .12, r * .9, [[0, 'rgba(255,70,80,.75)'], [1, 'rgba(255,70,80,0)']]); s.fillRect(-r, -r, r * 2, r * 2);
        speckle(s, R, 200, r, r, ['rgba(255,240,220,.25)'], .4, .9);
        s.strokeStyle = 'rgba(150,40,20,.4)'; s.lineWidth = 2.4; s.beginPath(); s.moveTo(0, -r * .8); s.bezierCurveTo(-r * .45, -r * .3, -r * .4, r * .4, -r * .1, r * .96); s.stroke();
        s.restore();
        leaf(s, 0, -r * .82, r * .55, r * .17, -2.6, '#7fd45a', '#2f8a2c');
        innerShadow(s, sh, r, 'rgba(90,20,0,.6)', 10);
      },
      inner(s, r, R, sh) {
        fillShape(s, sh, r, 1, '#f07a40');
        fillShape(s, sh, r, .94, rad(s, 0, 0, 0, 0, 0, r, [[0, '#d23a28'], [.36, '#ff9a3a'], [.6, '#ffc25a'], [1, '#ffb040']]));
        s.fillStyle = '#7e3218'; s.beginPath(); s.ellipse(0, 0, r * .28, r * .36, 0, 0, TAU); s.fill();
        s.strokeStyle = 'rgba(40,10,0,.5)'; s.lineWidth = 1.3;
        for (let i = 0; i < 6; i++) { s.beginPath(); s.moveTo(-r * .2 + i * r * .08, -r * .3); s.lineTo(-r * .16 + i * r * .065, r * .3); s.stroke(); }
      }
    }
  ];
  function paintBanana(s, r, R, sh, cols, tip) {
    const o = -r * .3;
    s.beginPath(); sh(s, r); s.fillStyle = lin(s, 0, -r * .12 + o, 0, r * .55 + o, [[0, cols[0]], [.45, cols[1]], [1, cols[2]]]); s.fill();
    s.save(); s.beginPath(); sh(s, r); s.clip();
    s.strokeStyle = 'rgba(140,90,0,.35)'; s.lineWidth = 1.6;
    for (const k of [.4, .72]) { s.beginPath(); s.moveTo(-r * .98, -r * .2 + o); s.quadraticCurveTo(0, lerp(r * .28, r * 1.35, k) + o, r * .98, -r * .2 + o); s.stroke(); }
    speckle(s, R, 14, r * .8, r * .15, ['rgba(110,60,0,.4)'], .6, 1.4);
    s.restore();
    s.fillStyle = tip; s.beginPath(); s.ellipse(r * 1.02, -r * .22 + o, 3.2, 4, .4, 0, TAU); s.fill();
    s.fillStyle = '#7a6a2a'; s.save(); s.translate(-r * 1.0, -r * .2 + o); s.rotate(-.6); s.fillRect(-r * .22, -3, r * .24, 6); s.fillStyle = '#4a3a12'; s.fillRect(-r * .25, -3.5, 3, 7); s.restore();
    innerShadow(s, sh, r, 'rgba(90,50,0,.55)', 8);
  }
  function innerBanana(s, r, sh, rind) {
    fillShape(s, sh, r, 1, rind);
    s.save(); s.translate(0, -r * .02); fillShape(s, sh, r, .93, lin(s, 0, -r * .4, 0, r * .3, [[0, '#fffde8'], [1, '#f6e9b0']])); s.restore();
    s.fillStyle = 'rgba(150,110,40,.5)';
    for (let i = 0; i < 9; i++) { const t = .15 + i * .7 / 8, x = lerp(-r * .9, r * .9, t), y = -r * .3 + (1 - (2 * t - 1) ** 2) * r * .42; circ(s, x, y, 1.2); s.fill(); }
  }
  function crown(s, r, back) {
    const base = -r * .55, L = [[-.9, .95], [-.55, 1.05], [-.25, 1.15], [0, 1.25], [.25, 1.15], [.55, 1.05], [.9, .95]];
    L.forEach(([a, l], i) => {
      if (back !== (i % 2 === 0)) return;
      const len = r * l, tx = Math.sin(a) * len, ty = base - Math.cos(a) * len * .95;
      s.beginPath(); s.moveTo(-r * .12 + a * r * .1, base + 4); s.quadraticCurveTo(tx * .35 - r * .08, base + (ty - base) * .5, tx, ty); s.quadraticCurveTo(tx * .35 + r * .08, base + (ty - base) * .5, r * .12 + a * r * .1, base + 4); s.closePath();
      s.fillStyle = lin(s, 0, base, tx, ty, back ? [[0, '#1f6a2a'], [1, '#3c9a40']] : [[0, '#2f8a36'], [1, '#6fcf5a']]); s.fill();
      s.strokeStyle = 'rgba(10,50,15,.5)'; s.lineWidth = 1; s.stroke();
    });
  }
  function calyx(s, r) {
    s.save(); s.translate(0, -r * .72);
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .45; leaf(s, 0, 0, r * (.42 + (i & 1) * .1), r * .12, a + Math.PI, '#66c84a', '#2a7a26'); }
    s.strokeStyle = '#3d7a22'; s.lineWidth = 3; s.lineCap = 'round'; s.beginPath(); s.moveTo(0, 0); s.lineTo(r * .06, -r * .28); s.stroke();
    s.restore();
  }
  const BOMB_DEF = { id: 'bomb', r: 34, ext: 62, hit: 30, shape: SH.ell(1, 1) };
  function paintBomb(s, r) {
    s.strokeStyle = '#3a2a18'; s.lineWidth = 5; s.lineCap = 'round';
    s.beginPath(); s.moveTo(0, -r * 1.05); s.bezierCurveTo(r * .1, -r * 1.45, r * .55, -r * 1.3, r * .55, -r * 1.62); s.stroke();
    s.strokeStyle = '#c9a46a'; s.lineWidth = 2.5; s.setLineDash([3, 3]);
    s.beginPath(); s.moveTo(0, -r * 1.05); s.bezierCurveTo(r * .1, -r * 1.45, r * .55, -r * 1.3, r * .55, -r * 1.62); s.stroke(); s.setLineDash([]);
    s.fillStyle = lin(s, -9, 0, 9, 0, [[0, '#9aa0aa'], [.4, '#e4e8ee'], [1, '#4a4e58']]);
    s.beginPath(); s.roundRect(-9, -r * 1.12, 18, r * .3, 3); s.fill();
    s.beginPath(); s.arc(0, 0, r, 0, TAU); s.fillStyle = rad(s, -r * .3, -r * .35, 0, 0, 0, r, [[0, '#55555f'], [.5, '#22222a'], [1, '#050507']]); s.fill();
    s.strokeStyle = 'rgba(255,60,60,.85)'; s.lineWidth = 3.5;
    s.beginPath(); s.arc(0, 0, r * .72, Math.PI * .2, Math.PI * .8); s.stroke();
    s.beginPath(); s.arc(0, 0, r * .72, Math.PI * 1.2, Math.PI * 1.8); s.stroke();
    s.fillStyle = 'rgba(255,255,255,.88)';
    s.beginPath(); s.arc(0, -r * .06, r * .26, Math.PI * .9, Math.PI * 2.1); s.lineTo(r * .16, r * .26); s.lineTo(-r * .16, r * .26); s.closePath(); s.fill();
    s.fillStyle = '#16161c'; s.beginPath(); s.ellipse(-r * .1, -r * .06, r * .07, r * .09, 0, 0, TAU); s.ellipse(r * .1, -r * .06, r * .07, r * .09, 0, 0, TAU); s.fill();
    s.beginPath(); s.moveTo(0, r * .04); s.lineTo(-r * .04, r * .12); s.lineTo(r * .04, r * .12); s.closePath(); s.fill();
    s.fillRect(-r * .1, r * .18, r * .02, r * .08); s.fillRect(-r * .01, r * .18, r * .02, r * .08); s.fillRect(r * .08, r * .18, r * .02, r * .08);
    s.save(); s.beginPath(); s.arc(0, 0, r, 0, TAU); s.clip();
    s.strokeStyle = 'rgba(255,255,255,.55)'; s.lineWidth = 3; s.lineCap = 'round'; s.beginPath(); s.arc(0, 0, r * .86, Math.PI * 1.08, Math.PI * 1.42); s.stroke();
    s.fillStyle = 'rgba(255,255,255,.75)'; s.beginPath(); s.ellipse(-r * .42, -r * .5, r * .13, r * .07, -.7, 0, TAU); s.fill();
    s.strokeStyle = 'rgba(120,150,255,.45)'; s.lineWidth = 3; s.beginPath(); s.arc(0, 0, r * .9, Math.PI * .1, Math.PI * .5); s.stroke();
    s.restore();
    innerShadow(s, BOMB_DEF.shape, r, 'rgba(0,0,0,.9)', 8);
  }
  const POM_DEF = { id: 'pom', r: 44, ext: 58, hit: 52, shape: SH.ell(1, 1) };
  function paintPom(s, r, R) {
    s.save(); s.translate(0, -r * .9);
    s.fillStyle = '#8a0c20'; s.beginPath(); s.moveTo(-r * .22, r * .1); s.lineTo(-r * .2, -r * .12); s.lineTo(r * .2, -r * .12); s.lineTo(r * .22, r * .1); s.fill();
    for (let i = 0; i < 6; i++) { const x = -r * .22 + i * r * .088; s.fillStyle = i & 1 ? '#a8142c' : '#7a0618'; s.beginPath(); s.moveTo(x - 4, -r * .1); s.lineTo(x + (i - 2.5) * 1.6, -r * .32); s.lineTo(x + 4, -r * .1); s.fill(); }
    s.restore();
    s.beginPath(); s.arc(0, 0, r, 0, TAU); s.fillStyle = rad(s, 0, 0, 0, 0, 0, r, [[0, '#ff4a50'], [.6, '#c8122e'], [1, '#6a0414']]); s.fill();
    s.save(); s.beginPath(); s.arc(0, 0, r, 0, TAU); s.clip();
    s.fillStyle = rad(s, -r * .4, r * .3, 0, -r * .4, r * .3, r * .7, [[0, 'rgba(255,190,90,.35)'], [1, 'rgba(255,190,90,0)']]); s.fillRect(-r, -r, r * 2, r * 2);
    speckle(s, R, 90, r, r, ['rgba(255,220,180,.25)', 'rgba(80,0,10,.25)'], .6, 1.6);
    s.restore();
    innerShadow(s, POM_DEF.shape, r, 'rgba(40,0,5,.8)', 12);
  }

  function sprite(ext, fn) {
    const S = Math.ceil(ext * 2.4), [c, s] = mk(S, S);
    s.translate(S / 2, S / 2); fn(s);
    return { S, c };
  }
  function buildLight() {
    const N = 128, [c, s] = mk(N, N, 2), h = N / 2;
    s.translate(h, h);
    s.fillStyle = lin(s, -h * .75, -h * .75, h * .75, h * .75, [[0, 'rgba(255,250,230,.42)'], [.36, 'rgba(255,255,255,.07)'], [.55, 'rgba(0,0,0,0)'], [1, 'rgba(25,8,30,.55)']]);
    s.fillRect(-h, -h, N, N);
    s.fillStyle = rad(s, -h * .36, -h * .4, 0, -h * .36, -h * .4, h * .44, [[0, 'rgba(255,255,255,.7)'], [.3, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);
    s.fillRect(-h, -h, N, N);
    return c;
  }
  function buildGlow(col) {
    const N = 128, [c, s] = mk(N, N, 1);
    s.fillStyle = rad(s, N / 2, N / 2, 0, N / 2, N / 2, N / 2, [[0, col], [.45, col.replace(/[\d.]+\)$/, '0.35)')], [1, col.replace(/[\d.]+\)$/, '0)')]]);
    s.fillRect(0, 0, N, N);
    return c;
  }
  function buildStain(col, seed) {
    const N = 240, [c, s] = mk(N, N, 1), R = seeded(seed);
    s.translate(N / 2, N / 2); s.fillStyle = col; s.globalAlpha = .82;
    s.beginPath();
    for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, q = 30 + R() * 16; s.lineTo(Math.cos(a) * q * 1.15, Math.sin(a) * q * .85); }
    s.fill();
    for (let i = 0; i < 16; i++) {
      const a = R() * TAU, len = (44 + R() * 56) * (1 + .7 * Math.abs(Math.cos(a))), w = 5 + R() * 8;
      s.save(); s.rotate(a); s.beginPath(); s.moveTo(20, -w); s.quadraticCurveTo(len * .6, -w * .4, len, 0); s.quadraticCurveTo(len * .6, w * .4, 20, w); s.fill();
      circ(s, len + 3 + R() * 6, 0, 2 + R() * 3.5); s.fill(); s.restore();
    }
    for (let i = 0; i < 34; i++) { const a = R() * TAU, q = 40 + R() * 72 * (1 + .5 * Math.abs(Math.cos(a))); circ(s, Math.cos(a) * q, Math.sin(a) * q * .9, 1.5 + R() * 5); s.fill(); }
    s.globalAlpha = .25; s.globalCompositeOperation = 'source-atop'; s.fillStyle = '#000';
    s.beginPath(); s.arc(0, 0, 200, 0, TAU); s.arc(0, 0, 26, 0, TAU, true); s.fill();
    return c;
  }
  function buildBg(W, H) {
    const [c, s] = mk(W, H), R = seeded(11), n = Math.max(5, Math.round(W / 104)), pw = W / n;
    const cols = ['#6e4224', '#5f381d', '#774828', '#653c20', '#704325'];
    for (let i = 0; i < n; i++) {
      const x0 = i * pw, b = cols[i % cols.length];
      s.fillStyle = b; s.fillRect(x0, 0, pw + 1, H);
      s.fillStyle = lin(s, x0, 0, x0 + pw, 0, [[0, 'rgba(0,0,0,.28)'], [.18, 'rgba(255,220,180,.06)'], [.6, 'rgba(255,220,180,.03)'], [1, 'rgba(0,0,0,.32)']]); s.fillRect(x0, 0, pw, H);
      s.lineWidth = 1.2;
      for (let k = 0; k < 16; k++) {
        const ox = x0 + 6 + R() * (pw - 12), amp = 1.5 + R() * 5, fr = .004 + R() * .012, ph = R() * 6;
        s.strokeStyle = R() < .65 ? `rgba(35,16,4,${.18 + R() * .2})` : `rgba(255,215,170,${.05 + R() * .06})`;
        s.beginPath(); for (let y = -10; y <= H + 10; y += 12) s.lineTo(ox + Math.sin(y * fr + ph) * amp, y); s.stroke();
      }
      for (let k = 0; k < 3; k++) { const y = R() * H; s.fillStyle = 'rgba(30,12,2,.18)'; s.fillRect(x0 + R() * pw * .7, y, 2 + R() * 3, 40 + R() * 120); }
      if (R() < .7) {
        const kx = x0 + pw * (.3 + R() * .4), ky = 40 + R() * (H - 80);
        s.fillStyle = 'rgba(40,18,4,.55)'; s.beginPath(); s.ellipse(kx, ky, 5, 8, 0, 0, TAU); s.fill();
        s.strokeStyle = 'rgba(40,18,4,.3)';
        for (let j = 1; j < 5; j++) { s.beginPath(); s.ellipse(kx, ky, 5 + j * 4, 8 + j * 8, 0, 0, TAU); s.stroke(); }
      }
      s.fillStyle = 'rgba(18,7,0,.75)'; s.fillRect(x0 - 2, 0, 4, H);
      s.fillStyle = 'rgba(255,220,180,.13)'; s.fillRect(x0 + 2, 0, 2, H);
      s.fillStyle = 'rgba(255,200,140,.05)'; s.fillRect(x0 + 5, 0, 8, H);
      s.fillStyle = lin(s, x0, 0, x0, H, [[0, 'rgba(255,200,130,.07)'], [.5, 'rgba(255,200,130,0)'], [1, 'rgba(0,0,0,.18)']]); s.fillRect(x0, 0, pw, H);
      for (const y of [H * .1, H * .9]) {
        s.fillStyle = 'rgba(0,0,0,.3)'; circ(s, x0 + pw / 2 + 1, y + 1.4, 4.6); s.fill();
        s.fillStyle = lin(s, 0, y - 4, 0, y + 4, [[0, '#8a8478'], [1, '#34302a']]); circ(s, x0 + pw / 2, y, 4); s.fill();
        s.strokeStyle = 'rgba(0,0,0,.55)'; s.lineWidth = 1; s.stroke();
        s.fillStyle = 'rgba(255,250,230,.55)'; circ(s, x0 + pw / 2 - 1.2, y - 1.3, 1.3); s.fill();
        s.strokeStyle = 'rgba(60,24,6,.35)'; s.lineWidth = 1; s.beginPath(); s.moveTo(x0 + pw / 2 - 5, y + 6); s.lineTo(x0 + pw / 2 - 3, y + 24); s.moveTo(x0 + pw / 2 + 4, y - 6); s.lineTo(x0 + pw / 2 + 5, y - 22); s.stroke();
      }
    }
    s.lineCap = 'round';
    for (let k = 0; k < 7; k++) {
      const x = R() * W, y = R() * H, a = -.5 - R() * .8, l = 40 + R() * 90;
      s.strokeStyle = 'rgba(20,8,0,.35)'; s.lineWidth = 2; s.beginPath(); s.moveTo(x, y); s.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); s.stroke();
      s.strokeStyle = 'rgba(255,220,180,.1)'; s.lineWidth = 1; s.beginPath(); s.moveTo(x + 1.5, y + 1.5); s.lineTo(x + Math.cos(a) * l + 1.5, y + Math.sin(a) * l + 1.5); s.stroke();
    }
    s.fillStyle = rad(s, W / 2, H * .45, Math.min(W, H) * .15, W / 2, H / 2, Math.max(W, H) * .72, [[0, 'rgba(255,190,120,.1)'], [.55, 'rgba(0,0,0,0)'], [1, 'rgba(8,3,0,.72)']]);
    s.fillRect(0, 0, W, H);
    return c;
  }
  function buildFrost(W, H) {
    const [c, s] = mk(W, H, 1), R = seeded(3);
    s.fillStyle = rad(s, W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .7, [[0, 'rgba(180,230,255,0)'], [1, 'rgba(190,235,255,.7)']]);
    s.fillRect(0, 0, W, H);
    s.strokeStyle = 'rgba(255,255,255,.5)'; s.lineWidth = 1.5;
    for (let i = 0; i < 60; i++) {
      const edge = R() * 4 | 0, t = R(), x = edge === 0 ? t * W : edge === 1 ? W - R() * 60 : edge === 2 ? t * W : R() * 60, y = edge === 0 ? R() * 60 : edge === 1 ? t * H : edge === 2 ? H - R() * 60 : t * H, z = 6 + R() * 14;
      for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3 + R(); s.beginPath(); s.moveTo(x - Math.cos(a) * z, y - Math.sin(a) * z); s.lineTo(x + Math.cos(a) * z, y + Math.sin(a) * z); s.stroke(); }
    }
    return c;
  }
  function buildRing(R0, band, edge, txt, label) {
    const N = R0 * 2 + 10, [c, s] = mk(N, N), rm = R0 - 15;
    s.translate(N / 2, N / 2);
    s.lineWidth = 30; s.strokeStyle = band; s.beginPath(); s.arc(0, 0, rm, 0, TAU); s.stroke();
    s.lineWidth = 3; s.strokeStyle = edge;
    s.beginPath(); s.arc(0, 0, rm + 15, 0, TAU); s.stroke(); s.beginPath(); s.arc(0, 0, rm - 15, 0, TAU); s.stroke();
    s.strokeStyle = 'rgba(0,0,0,.35)'; s.lineWidth = 2; s.beginPath(); s.arc(0, 0, rm - 17.5, 0, TAU); s.stroke();
    s.font = FONT(16); s.textAlign = 'center'; s.textBaseline = 'middle'; s.fillStyle = txt;
    const unit = label + '  •  ', uw = s.measureText(unit).width, circum = TAU * rm, reps = Math.max(1, Math.round(circum / uw)), sc = circum / (uw * reps);
    let a = 0;
    for (let k = 0; k < reps; k++) for (const ch of unit) {
      const w = s.measureText(ch).width * sc, am = a + w / 2 / rm;
      s.save(); s.rotate(am); s.translate(0, -rm); s.fillText(ch, 0, 1); s.restore();
      a += w / rm;
    }
    return { c, N };
  }

  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M40 22a16 16 0 1 0-20 24z"/><path d="M45 27a16 16 0 0 1-21 23z"/><path d="M6 58 58 6" opacity=".35"/><circle cx="22" cy="34" r="1.5" fill="currentColor"/><circle cx="28" cy="28" r="1.5" fill="currentColor"/><circle cx="31" cy="38" r="1.5" fill="currentColor"/></svg>';

  Ameplay.register({
    id: ID,
    title: 'Fruit Slice',
    category: 'Action',
    tint: '#e8323f',
    blurb: 'Swipe your blade through flying fruit, chain combos, never slice a bomb.',
    help: 'Hold the mouse button and swipe (or swipe a finger) · slice a ring fruit to pick a mode · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> modes · <kbd>P</kbd> pause',
    better: 'high',
    width: 960,
    icon: ICON,
    css: `.gm-${ID} canvas{cursor:crosshair;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;background:#3a2212}`,
    mount(root, api) {
      const small = root.clientWidth > 0 && root.clientWidth < 600;
      const W = small ? 600 : 960, H = small ? 860 : 600;
      const { canvas, ctx } = api.canvas(W, H);
      const STEP = 1 / CFG.HZ, G = CFG.G * H;

      const SPR = FR.map((d, i) => sprite(d.ext, s => d.paint(s, d.r, seeded(17 + i * 31), d.shape)));
      const INN = FR.map((d, i) => sprite(d.ext, s => d.inner(s, d.r, seeded(91 + i * 13), d.shape)));
      const FI = {}; FR.forEach((d, i) => FI[d.id] = i);
      const BAN = {};
      for (const [eff, cols, glow, rind] of [['freeze', ['#e4f8ff', '#8fd6ff', '#3a8ee0'], 'rgba(120,200,255,.9)', '#4aa8f0'], ['frenzy', ['#ffd2c0', '#ff6a4a', '#c41e1e'], 'rgba(255,90,60,.9)', '#e8402a'], ['double', ['#fffbd0', '#ffe14a', '#e8a800'], 'rgba(255,215,60,.95)', '#f2c418']]) {
        const d = { ...FR[FI.banana], id: 'banana-' + eff, juice: eff === 'freeze' ? '#bfe8ff' : eff === 'frenzy' ? '#ff8a6a' : '#fff0a0' };
        BAN[eff] = { def: d, spr: sprite(d.ext, s => paintBanana(s, d.r, seeded(5), d.shape, cols, '#3a2a10')), inn: sprite(d.ext, s => innerBanana(s, d.r, d.shape, rind)), glow: buildGlow(glow) };
      }
      const BOMB = sprite(BOMB_DEF.ext, s => paintBomb(s, BOMB_DEF.r));
      const POM = sprite(POM_DEF.ext, s => paintPom(s, POM_DEF.r, seeded(77)));
      const BGLOW = buildGlow('rgba(255,50,40,.85)'), SPARK = buildGlow('rgba(255,240,170,1)');
      const LIGHT = buildLight(), BG = buildBg(W, H), FROST = buildFrost(W, H);
      const STAINS = {};
      const stainFor = col => STAINS[col] || (STAINS[col] = [0, 1, 2].map(k => buildStain(col, col.length * 13 + k * 101 + parseInt(col.slice(1), 16) % 997)));
      const maxExt = 72 * 1.3, SCR = Math.ceil(maxExt * 2.5), [scr, sx] = mk(SCR, SCR);
      const RINGS = {
        classic: buildRing(98, '#2b1a0c', '#e8b44a', '#ffd36b', 'CLASSIC'),
        arcade: buildRing(98, '#5a120e', '#ffb84a', '#ffd36b', 'ARCADE'),
        zen: buildRing(98, '#0f3a36', '#7fe0c8', '#b6fff0', 'ZEN'),
        retry: buildRing(88, '#1c3a12', '#9ad85a', '#d8ff9a', 'RETRY'),
        menu: buildRing(88, '#2a2230', '#ff7a6a', '#ffb0a0', 'MENU')
      };
      const MODE_FRUIT = { classic: 'watermelon', arcade: 'banana', zen: 'peach' };

      const save = api.load() || {};
      const bests = { classic: 0, arcade: 0, zen: 0, ...(save.bests || {}) };
      const persist = () => api.save({ bests });

      const A = { c: null, m: null, nb: null, fuse: null };
      function au() {
        if (api.muted) return null;
        if (!A.c) {
          try {
            const AC = window.AudioContext || window.webkitAudioContext;
            A.c = new AC(); A.m = A.c.createGain(); A.m.gain.value = .6; A.m.connect(A.c.destination);
            const b = A.c.createBuffer(1, A.c.sampleRate, A.c.sampleRate), d = b.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            A.nb = b;
          } catch (e) { A.c = null; return null; }
        }
        if (A.c.state === 'suspended') A.c.resume().catch(() => {});
        return A.c;
      }
      function nz(t0, dur, type, f0, f1, q, vol, atk = .005) {
        const c = A.c, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        src.buffer = A.nb; src.loop = true;
        f.type = type; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur); f.Q.value = q;
        g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + atk); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
        src.connect(f).connect(g).connect(A.m); src.start(t0, Math.random() * .5); src.stop(t0 + dur + .05);
      }
      function tn(t0, f0, f1, dur, type, vol, atk = .004) {
        const c = A.c, o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
        g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + atk); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
        o.connect(g).connect(A.m); o.start(t0); o.stop(t0 + dur + .05);
      }
      const PENTA = [523, 587, 659, 784, 880, 1047, 1175, 1319];
      let lastThrow = 0;
      function sfx(name, k = 0) {
        const c = au(); if (!c) return;
        const t = c.currentTime;
        try {
          switch (name) {
            case 'swoosh': nz(t, .14 + .08 * k, 'bandpass', 500 + k * 700, 2400 + k * 2400, 1.3, .1 + .12 * k, .03); break;
            case 'splat': nz(t, .24, 'lowpass', 2800, 260, .8, .32); nz(t, .1, 'bandpass', 1100, 480, 3, .22); tn(t, k ? 120 : 175, 48, .17, 'sine', .32); tn(t + .025, 700 + Math.random() * 300, 200, .08, 'triangle', .06); break;
            case 'throw': if (t - lastThrow < .08) return; lastThrow = t; nz(t, .3, 'lowpass', 180, 900, .7, .07, .1); break;
            case 'boom': nz(t, 1.4, 'lowpass', 3200, 50, .6, .9); tn(t, 95, 28, .9, 'sine', .7); nz(t, .3, 'highpass', 2500, 1800, .5, .3); break;
            case 'fizz': nz(t, .5, 'highpass', 4000, 7000, .7, .12, .02); break;
            case 'combo': for (let i = 0; i < Math.min(k, 7); i++) tn(t + i * .055, PENTA[i], PENTA[i], .28, 'triangle', .12); break;
            case 'crit': tn(t, 2400, 2400, .55, 'sine', .12); tn(t, 3620, 3600, .45, 'sine', .07); nz(t, .14, 'highpass', 5000, 9000, .7, .14); break;
            case 'miss': tn(t, 230, 110, .3, 'triangle', .25); nz(t, .14, 'lowpass', 500, 180, 1, .22); break;
            case 'life': [784, 988, 1319].forEach((f, i) => tn(t + i * .07, f, f, .28, 'sine', .11)); break;
            case 'gong': [110, 167.3, 231, 303].forEach((f, i) => tn(t, f, f * .995, 2.4, 'sine', .2 / (i + 1), .01)); break;
            case 'tick': tn(t, 1500, 1500, .045, 'square', .04); break;
            case 'freeze': for (let i = 0; i < 7; i++) tn(t + i * .04, 1700 + i * 260, 1700 + i * 260, .45, 'sine', .05); nz(t, .7, 'highpass', 6000, 9500, .5, .08); break;
            case 'frenzy': nz(t, .7, 'bandpass', 250, 3200, 2, .3, .25); for (let i = 0; i < 4; i++) tn(t + i * .07, PENTA[i * 2], PENTA[i * 2], .2, 'square', .04); break;
            case 'double': tn(t, 880, 880, .12, 'square', .06); tn(t + .1, 1320, 1320, .32, 'square', .06); break;
            case 'pom': tn(t, 280 + k * 22, 220 + k * 18, .1, 'triangle', .18); nz(t, .08, 'bandpass', 1300, 700, 2, .16); break;
            case 'start': nz(t, .25, 'bandpass', 600, 3000, 1.5, .18, .05); [196, 294].forEach((f, i) => tn(t + .05, f, f, 1.2, 'sine', .14 / (i + 1), .01)); break;
          }
        } catch (e) {}
      }
      function setFuse(on) {
        if (on && !A.fuse && au()) {
          try {
            const c = A.c, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
            src.buffer = A.nb; src.loop = true; f.type = 'highpass'; f.frequency.value = 3800; g.gain.value = .035;
            lfo.type = 'square'; lfo.frequency.value = 19; lg.gain.value = .02; lfo.connect(lg).connect(g.gain);
            src.connect(f).connect(g).connect(A.m); src.start(); lfo.start();
            A.fuse = { stop() { try { src.stop(); lfo.stop(); g.disconnect(); } catch (e) {} } };
          } catch (e) {}
        } else if (!on && A.fuse) { A.fuse.stop(); A.fuse = null; }
      }

      let state = 'menu', mode = 'classic', paused = false, clock = 0, acc = 0;
      let objs = [], halves = [], stains = [], parts = [], texts = [], marks = [], flashes = [], queue = [], rings = [];
      let score = 0, lives = CFG.LIVES, sliced = 0, bestCombo = 0, crits = 0, combos = 0, hundreds = 0;
      let timeLeft = 0, waveN = 0, waveDelay = 0, spawnT = 0, bananaT = 0, frenzyT = 0, lastTick = 99;
      const eff = { freeze: 0, frenzy: 0, double: 0 }, blitz = { lv: 0, t: -9 };
      let pom = null, endT = 0, boomT = 0, boomObj = null, flash = 0, shake = 0, rays = 0, submitted = false, newBest = false, endWhy = '', ringT = 0, pendingAct = null, pendingT = 0, menuIn = 0;
      const swipes = new Map(), fading = [];
      const now = () => performance.now() / 1000;
      const mult = () => eff.double > 0 ? 2 : 1;

      function addText(lines, x, y, px, c1, c2, life = 1.1) { texts.push({ lines, x: clamp(x, 120, W - 120), y: clamp(y, 70, H - 60), px, c1, c2, t: 0, max: life }); }
      function part(x, y, vx, vy, life, size, col, kind = 0, g = 1) {
        if (parts.length > 900) return;
        parts.push({ x, y, vx, vy, life, max: life, size, col, kind, g, a: Math.random() * TAU });
      }
      function addScore(p) {
        score = Math.max(0, score + p);
        if (mode === 'classic') while (Math.floor(score / CFG.LIFE_EVERY) > hundreds) {
          hundreds++;
          if (lives < CFG.LIVES) { lives++; sfx('life'); addText(['EXTRA LIFE'], W - 110, 96, 22, '#bff4ff', '#4ab8ff', 1.2); }
        }
        if (score > bests[mode] && state !== 'menu') bests[mode] = score;
        api.score(score);
      }

      function launch(kind, o = {}) {
        let def, spr, inn = null, effk = null;
        if (kind === 'fruit') { const i = o.i != null ? o.i : (Math.random() * FR.length) | 0; def = FR[i]; spr = SPR[i]; inn = INN[i]; }
        else if (kind === 'bomb') { def = BOMB_DEF; spr = BOMB; }
        else { effk = o.eff; def = BAN[effk].def; spr = BAN[effk].spr; inn = BAN[effk].inn; }
        let x, y, vx, vy;
        if (o.side) {
          const L = o.side < 0;
          x = L ? -def.ext : W + def.ext; y = rnd(H * .45, H * .8);
          vy = -rnd(.55, .85) * Math.sqrt(G * H); vx = (L ? 1 : -1) * rnd(.45, .7) * W;
        } else {
          x = o.x != null ? o.x : rnd(W * .14, W * .86); y = H + def.ext + 4;
          const h = H * (o.apex != null ? o.apex : rnd(CFG.APEX[0], CFG.APEX[1])) + def.ext + 4;
          vy = -Math.sqrt(2 * G * h); const tu = -vy / G;
          const lo = Math.max(W * .12, (x + W * .05) / 2), hi = Math.min(W * .88, (x + W * .95) / 2);
          const xa = clamp(o.xa != null ? o.xa : rnd(W * .2, W * .8), lo, hi);
          vx = (xa - x) / tu;
        }
        objs.push({ kind, def, spr, inn, eff: effk, x, y, vx, vy, a: rnd(0, TAU), va: rnd(-1, 1) * CFG.SPIN * (kind === 'bomb' ? .45 : 1), dead: false });
        sfx('throw');
      }

      function nextWave() {
        waveN++;
        const d = Math.min(1, waveN / 40);
        let n = waveN <= 2 ? 1 : waveN <= 5 ? 1 + ((Math.random() * 2) | 0) : 1 + Math.floor(Math.random() * (2 + d * 4.2));
        n = Math.min(n, 7);
        let nb = 0;
        if (waveN >= 3) { if (Math.random() < .18 + .3 * d) nb = 1; if (d > .45 && Math.random() < .22) nb = 2; }
        if (waveN > 6 && Math.random() < .06) { n = 0; nb = 1 + (Math.random() < .5 ? 1 : 0); }
        const r = Math.random();
        if (n >= 3 && r < .35) {
          const L = Math.random() < .5, gap = rnd(.16, .3);
          for (let i = 0; i < n; i++) { const u = i / (n - 1); queue.push({ t: i * gap, kind: 'fruit', o: { x: W * (L ? lerp(.15, .85, u) : lerp(.85, .15, u)), xa: W * (L ? lerp(.3, .8, u) : lerp(.7, .2, u)), apex: rnd(.6, .85) } }); }
        } else if (n >= 2 && r < .6) {
          const x0 = W * rnd(.4, .6);
          for (let i = 0; i < n; i++) queue.push({ t: rnd(0, .08), kind: 'fruit', o: { x: x0 + rnd(-30, 30), xa: W * lerp(.18, .82, n > 1 ? i / (n - 1) : .5), apex: rnd(.6, .88) } });
        } else for (let i = 0; i < n; i++) queue.push({ t: rnd(0, .35), kind: 'fruit', o: {} });
        for (let i = 0; i < nb; i++) queue.push({ t: rnd(0, .4), kind: 'bomb', o: {} });
      }
      function scatter(n, bombs) {
        for (let i = 0; i < n; i++) queue.push({ t: rnd(0, .35), kind: 'fruit', o: {} });
        for (let i = 0; i < bombs; i++) queue.push({ t: rnd(0, .35), kind: 'bomb', o: {} });
      }

      function stain(x, y, ang, col, scale) {
        const set = stainFor(col);
        const drips = [];
        for (let i = 0, n = 2 + ((Math.random() * 3) | 0); i < n; i++) drips.push({ dx: rnd(-22, 22) * scale, dy: rnd(14, 24) * scale, len: 0, max: rnd(30, 90) * scale, sp: rnd(6, 16), w: rnd(2, 3.6) * scale });
        stains.push({ img: set[(Math.random() * 3) | 0], x, y, ang, k: scale * rnd(.85, 1.1), life: CFG.STAIN_T, col, drips });
        if (stains.length > 40) stains.shift();
      }
      function juice(x, y, ang, def, n = 26) {
        const col = def.juice, fl = def.flesh || col;
        for (let i = 0; i < n; i++) {
          const a = ang + (Math.random() < .5 ? 0 : Math.PI) + rnd(-.9, .9), v = rnd(80, 460);
          part(x, y, Math.cos(a) * v, Math.sin(a) * v - 120, rnd(.4, .9), rnd(2, 5.5), col, 0, 1);
        }
        for (let i = 0; i < 6; i++) { const a = rnd(0, TAU), v = rnd(60, 220); part(x, y, Math.cos(a) * v, Math.sin(a) * v - 100, rnd(.5, 1), rnd(3.5, 6.5), fl, 1, 1); }
        part(x, y, 0, 0, .18, def.r * 1.5, col, 6, 0);
      }
      function makeHalves(o, ang, spr, inn) {
        const sx2 = Math.sin(ang), cx2 = Math.cos(ang);
        for (const side of [-1, 1]) {
          const sp = rnd(110, 170);
          halves.push({
            def: o.def, spr, inn, x: o.x, y: o.y,
            vx: o.vx * .55 - side * sx2 * sp, vy: Math.min(o.vy, 0) * .45 + side * cx2 * sp - 60,
            rot: ang, vr: side * rnd(1.4, 3.4), skin: o.a - ang, side, th: .35, vth: rnd(2, 4.2) * (Math.random() < .7 ? 1 : -1), sc: o.sc || 1
          });
        }
      }

      function cutFruit(o, ang, sw) {
        o.dead = true;
        makeHalves(o, ang, o.spr, o.inn);
        juice(o.x, o.y, ang, o.def);
        stain(o.x, o.y, ang, o.def.juice, o.def.r / 40);
        flashes.push({ x: o.x, y: o.y, a: ang, r: o.def.ext * 1.5, l: .16 });
        sfx('splat', o.def.big ? 1 : 0);
        sliced++;
        addScore(mult());
        if (sw) {
          const cb = sw.combo;
          cb.n++; cb.t = now(); cb.x = o.x; cb.y = o.y;
          if (cb.n === 1 && Math.random() < CFG.CRIT) {
            crits++; addScore(CFG.CRIT_PTS * mult());
            addText(['CRITICAL!', '+' + CFG.CRIT_PTS * mult()], o.x, o.y - 40, 30, '#fff1a0', '#ff4a2a', 1.2);
            for (let i = 0; i < 14; i++) { const a = rnd(0, TAU), v = rnd(150, 420); part(o.x, o.y, Math.cos(a) * v, Math.sin(a) * v, .45, rnd(2, 4), '#fff3b0', 2, 0); }
            sfx('crit'); shake = Math.max(shake, 4);
          }
        }
      }
      function cutBanana(o, ang, sw) {
        cutFruit(o, ang, sw);
        const e = o.eff;
        eff[e] = CFG.BANANA_T;
        if (e === 'freeze') { addText(['FREEZE!'], o.x, o.y - 50, 34, '#ffffff', '#5ab8ff', 1.3); sfx('freeze'); }
        else if (e === 'frenzy') { addText(['FRENZY!'], o.x, o.y - 50, 34, '#fff0c0', '#ff4a2a', 1.3); sfx('frenzy'); frenzyT = 0; }
        else { addText(['DOUBLE SCORE!'], o.x, o.y - 50, 32, '#fffbd0', '#ffb400', 1.3); sfx('double'); }
      }
      function cutBomb(o) {
        o.dead = true;
        if (mode === 'arcade') {
          sfx('boom'); flash = .7; shake = 16;
          for (let i = 0; i < 30; i++) { const a = rnd(0, TAU), v = rnd(120, 520); part(o.x, o.y, Math.cos(a) * v, Math.sin(a) * v, rnd(.3, .7), rnd(2, 5), i & 1 ? '#fff3c4' : '#ff9a3a', 2, 0); }
          for (let i = 0; i < 10; i++) part(o.x + rnd(-20, 20), o.y + rnd(-20, 20), rnd(-40, 40), rnd(-80, -20), rnd(.8, 1.4), rnd(18, 30), 'rgba(70,64,80,.5)', 3, 0);
          const lost = Math.min(score, CFG.BOMB_COST);
          addScore(-CFG.BOMB_COST);
          addText(['-' + (lost || CFG.BOMB_COST)], o.x, o.y - 40, 40, '#ffd0c8', '#ff2a2a', 1.2);
          for (const f of objs) if (!f.dead && f.kind !== 'bomb') { f.dead = true; juice(f.x, f.y, rnd(0, TAU), f.def, 14); stain(f.x, f.y, rnd(0, TAU), f.def.juice, f.def.r / 50); }
          eff.freeze = eff.frenzy = eff.double = 0; blitz.lv = 0;
        } else {
          state = 'boom'; boomT = 0; boomObj = o; o.dead = false; o.boom = true; rays = 0;
          for (const sw of swipes.values()) sw.combo.n = 0;
          setFuse(false); sfx('fizz');
        }
      }
      function finishCombo(sw) {
        const cb = sw.combo;
        if (cb.n >= 3) {
          const b = cb.n * mult();
          addScore(b); combos++;
          addText([cb.n + ' FRUIT COMBO', '+' + b], cb.x, cb.y - 50, 26, '#fff3a0', '#ff8a10', 1.3);
          sfx('combo', cb.n);
          if (mode === 'arcade') {
            const t = now();
            if (t - blitz.t < CFG.BLITZ_GAP) {
              blitz.lv = Math.min(CFG.BLITZ_MAX, blitz.lv + 1);
              const p = CFG.BLITZ_PTS * blitz.lv * mult(); addScore(p);
              addText(['BLITZ x' + blitz.lv, '+' + p], W / 2, H * .3, 30, '#f4dcff', '#b04aff', 1.2);
            } else blitz.lv = 0;
            blitz.t = t;
          }
        }
        bestCombo = Math.max(bestCombo, cb.n);
        cb.n = 0;
      }
      function hitPom(sw) {
        if (sw.pomCd > 0) return;
        sw.pomCd = .06;
        pom.hits++; pom.wob = 1; pom.t0 = pom.t0 || clock;
        addScore(1);
        sfx('pom', Math.min(pom.hits, 30));
        for (let i = 0; i < 6; i++) { const a = rnd(0, TAU), v = rnd(120, 320); part(pom.x + Math.cos(a) * 30, pom.y + Math.sin(a) * 30, Math.cos(a) * v, Math.sin(a) * v - 80, rnd(.5, .9), rnd(2.5, 4.5), i % 3 ? '#e8102e' : '#ff5a6a', i & 1 ? 5 : 0, 1); }
        if (pom.hits % 4 === 0) stain(pom.x + rnd(-40, 40), pom.y + rnd(-40, 40), rnd(0, TAU), '#c40c2a', .7);
        texts.push({ lines: ['+1'], x: pom.x + rnd(-50, 50), y: pom.y - 60 + rnd(-20, 10), px: 22, c1: '#fff', c2: '#ffb0b8', t: 0, max: .6 });
      }

      function slash(sw, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
        if (L2 < 4) return;
        const ang = Math.atan2(dy, dx), hk = sw.mouse ? CFG.HIT_MOUSE : CFG.HIT_TOUCH;
        const hit = (cx, cy, r) => {
          let t = ((cx - x1) * dx + (cy - y1) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const px = x1 + dx * t - cx, py = y1 + dy * t - cy;
          return px * px + py * py < r * r;
        };
        if (state === 'menu' || state === 'over') {
          for (const rg of rings) if (!rg.gone && hit(rg.x, rg.y, rg.hit * hk)) ringCut(rg, ang);
          return;
        }
        if (state !== 'play' && state !== 'pom' && state !== 'ending') return;
        for (const o of objs) {
          if (o.dead || o.boom) continue;
          if (!hit(o.x, o.y, o.def.hit * hk)) continue;
          if (o.kind === 'bomb') { cutBomb(o); if (state === 'boom') return; }
          else if (o.kind === 'banana') cutBanana(o, ang, sw);
          else cutFruit(o, ang, sw);
        }
        if (pom && pom.phase !== 'done' && hit(pom.x, pom.y, POM_DEF.hit * pom.sc * hk)) hitPom(sw);
      }

      function ringFruit(id) { const i = FI[id]; return { def: FR[i], spr: SPR[i], inn: INN[i] }; }
      function buildMenu() {
        state = 'menu'; rings = []; menuIn = 0;
        const R0 = 98, pos = small ? [[W * .26, H * .42], [W * .74, H * .42], [W * .5, H * .75]] : [[W * .2, H * .62], [W * .5, H * .62], [W * .8, H * .62]];
        ['classic', 'arcade', 'zen'].forEach((m, i) => {
          const f = ringFruit(MODE_FRUIT[m]);
          rings.push({ id: m, x: pos[i][0], y: pos[i][1], R: R0, ring: RINGS[m], ...f, hit: Math.max(54, f.def.hit * 1.25), sc: 1.25, rot: i * 1.3, dir: i & 1 ? -1 : 1, a: rnd(0, TAU), gone: false, ft: 0, act: () => startRun(m) });
        });
      }
      function buildOver() {
        state = 'over'; rings = []; ringT = 0;
        const R0 = 88, y = small ? H * .76 : H * .72, xs = small ? [W * .27, W * .73] : [W * .33, W * .67];
        const f = ringFruit(MODE_FRUIT[mode]);
        rings.push({ id: 'retry', x: xs[0], y, R: R0, ring: RINGS.retry, ...f, hit: Math.max(50, f.def.hit * 1.2), sc: 1.15, rot: 0, dir: 1, a: rnd(0, TAU), gone: false, ft: 0, act: () => startRun(mode) });
        rings.push({ id: 'menu', x: xs[1], y, R: R0, ring: RINGS.menu, def: BOMB_DEF, spr: BOMB, bomb: true, hit: 46, sc: 1.05, rot: 1, dir: -1, a: 0, gone: false, ft: 0, act: () => { clearField(); buildMenu(); } });
      }
      function ringCut(rg, ang) {
        if (pendingAct) return;
        rg.gone = true; rg.ft = 0;
        const o = { def: rg.def, x: rg.x, y: rg.y + Math.sin(clock * 2) * 4, vx: 0, vy: -100, a: rg.a, sc: rg.sc };
        if (rg.bomb) {
          sfx('boom'); flash = .55; shake = 10;
          for (let i = 0; i < 26; i++) { const a = rnd(0, TAU), v = rnd(120, 480); part(rg.x, rg.y, Math.cos(a) * v, Math.sin(a) * v, rnd(.3, .7), rnd(2, 5), i & 1 ? '#fff3c4' : '#ff9a3a', 2, 0); }
        } else {
          makeHalves(o, ang, rg.spr, rg.inn);
          juice(o.x, o.y, ang, o.def);
          stain(o.x, o.y, ang, o.def.juice, o.def.r / 36);
          flashes.push({ x: o.x, y: o.y, a: ang, r: o.def.ext * 1.8, l: .18 });
          sfx('splat', 1);
        }
        pendingAct = rg.act; pendingT = .6;
      }
      function clearField() {
        objs = []; queue = []; parts = []; texts = []; marks = []; flashes = []; pom = null; boomObj = null;
        setFuse(false);
      }
      function startRun(m) {
        mode = m; clearField(); halves = halves.filter(h => h.y < H + 200);
        state = 'play'; paused = false; rings = [];
        score = 0; lives = CFG.LIVES; sliced = 0; bestCombo = 0; crits = 0; combos = 0; hundreds = 0;
        timeLeft = m === 'arcade' ? CFG.ARCADE_T : m === 'zen' ? CFG.ZEN_T : 0;
        waveN = 0; waveDelay = .9; spawnT = .8; bananaT = rnd(CFG.BANANA_EVERY[0] - 3, CFG.BANANA_EVERY[1] - 3); frenzyT = 0; lastTick = 99;
        eff.freeze = eff.frenzy = eff.double = 0; blitz.lv = 0; blitz.t = -9;
        submitted = false; newBest = false; endWhy = ''; flash = 0; shake = 0; rays = 0;
        api.score(0);
        sfx('start');
        addText([m === 'classic' ? 'CLASSIC' : m === 'arcade' ? 'ARCADE' : 'ZEN'], W / 2, H * .4, 48, '#fff6c0', '#ffa21a', 1.1);
      }
      function endRun(why) {
        if (submitted) return;
        submitted = true; endWhy = why;
        for (const sw of swipes.values()) finishCombo(sw);
        for (const sw of fading) finishCombo(sw);
        bests[mode] = Math.max(bests[mode], score);
        persist();
        newBest = api.submit(score);
        api.score(score);
        setFuse(false);
      }

      function step(dt) {
        clock += dt;
        if (pendingAct && (pendingT -= dt) <= 0) { const f = pendingAct; pendingAct = null; f(); }
        menuIn = Math.min(1, menuIn + dt * 2.5);
        for (const rg of rings) { rg.rot += dt * .35 * rg.dir; rg.a += dt * .5; if (rg.gone) rg.ft += dt; }
        ringT += dt;
        flash = Math.max(0, flash - dt * 1.6); shake = Math.max(0, shake - dt * 40);
        for (const k in eff) if (eff[k] > 0) eff[k] = Math.max(0, eff[k] - dt);
        const ts = eff.freeze > 0 ? CFG.FREEZE_TS : 1, dts = dt * ts;

        if (state === 'boom') {
          boomT += dt; rays = Math.min(1, boomT / .9);
          if (boomT >= .9 && boomObj) {
            sfx('boom'); flash = 1.4; shake = 22;
            const o = boomObj; boomObj = null;
            for (let i = 0; i < 50; i++) { const a = rnd(0, TAU), v = rnd(150, 700); part(o.x, o.y, Math.cos(a) * v, Math.sin(a) * v, rnd(.4, .9), rnd(2, 6), i & 1 ? '#fff3c4' : '#ff9a3a', 2, 0); }
            objs = []; queue = []; halves = [];
            endRun('bomb');
          }
          if (boomT >= 1.9) { sfx('gong'); buildOver(); }
        }

        const playing = state === 'play';
        if (playing) {
          if (mode === 'classic') {
            if (!queue.length && objs.every(o => o.dead || o.vy > 0)) { if ((waveDelay -= dts) <= 0) { nextWave(); waveDelay = lerp(1.0, .35, Math.min(1, waveN / 40)); } }
          } else {
            const prog = 1 - timeLeft / (mode === 'arcade' ? CFG.ARCADE_T : CFG.ZEN_T);
            if ((spawnT -= dts) <= 0) {
              if (mode === 'arcade') { scatter(1 + Math.floor(Math.random() * (2.5 + prog * 2.5)), eff.frenzy > 0 ? 0 : Math.random() < .2 + prog * .1 ? 1 : 0); spawnT = lerp(1.25, .75, prog); }
              else { scatter(1 + Math.floor(Math.random() * (3 + prog * 2)), 0); spawnT = lerp(1.35, .85, prog); }
            }
            if (mode === 'arcade') {
              if ((bananaT -= dts) <= 0 && timeLeft > 5) {
                const opts = ['freeze', 'frenzy', 'double'].filter(k => eff[k] <= 0);
                if (opts.length) launch('banana', { eff: opts[(Math.random() * opts.length) | 0], apex: rnd(.6, .85) });
                bananaT = rnd(CFG.BANANA_EVERY[0], CFG.BANANA_EVERY[1]);
              }
              if (eff.frenzy > 0 && (frenzyT -= dts) <= 0) { launch('fruit', { side: Math.random() < .5 ? -1 : 1 }); frenzyT = .13; }
            }
            if (eff.freeze <= 0) timeLeft -= dt;
            const sec = Math.ceil(timeLeft);
            if (sec <= 5 && sec >= 1 && sec !== lastTick) { lastTick = sec; sfx('tick'); }
            if (timeLeft <= 0) {
              timeLeft = 0; queue = [];
              if (mode === 'arcade') {
                state = 'pom'; eff.freeze = eff.frenzy = eff.double = 0;
                pom = { x: W / 2, y: H + 70, vy: -Math.sqrt(2 * G * (H * .58 + 70)), phase: 'rise', t: 0, hits: 0, wob: 0, sc: 1, a: 0 };
                addText(["TIME'S UP"], W / 2, H * .22, 44, '#fff6c0', '#ffa21a', 1.4);
                sfx('throw');
              } else { state = 'ending'; endT = 0; addText(["TIME'S UP"], W / 2, H * .3, 48, '#fff6c0', '#ffa21a', 1.6); }
            }
          }
        }
        if (state === 'ending') { endT += dt; if ((objs.every(o => o.dead) && endT > 1) || endT > 3.2) { endRun('time'); sfx('gong'); buildOver(); } }
        if (pom) {
          pom.t += dt; pom.wob = Math.max(0, pom.wob - dt * 5);
          if (pom.phase === 'rise') { pom.vy += G * dt; pom.y += pom.vy * dt; if (pom.vy >= 0) { pom.phase = 'hover'; pom.ht = 0; } }
          else if (pom.phase === 'hover') {
            pom.ht += dt; pom.y += (H * .44 - pom.y) * Math.min(1, dt * 3);
            pom.sc = 1 + Math.min(.4, pom.hits * .012);
            if (pom.ht > CFG.POM_T) {
              pom.phase = 'done'; pom.t = 0;
              sfx('splat', 1); sfx('boom'); flash = .5; shake = 12;
              for (let i = 0; i < 70; i++) { const a = rnd(0, TAU), v = rnd(100, 600); part(pom.x, pom.y, Math.cos(a) * v, Math.sin(a) * v - 100, rnd(.6, 1.2), rnd(2.5, 5), i % 3 ? '#d40c2a' : '#ff6a7a', 5, 1); }
              stain(pom.x, pom.y, rnd(0, TAU), '#c40c2a', 1.6);
              addText([pom.hits + ' HITS', '+' + pom.hits], W / 2, pom.y - 70, 40, '#ffe0e4', '#ff2a4a', 1.6);
            }
          } else if (pom.t > 1.3) { pom = null; endRun('time'); sfx('gong'); buildOver(); }
        }

        for (let i = queue.length; i--;) if ((queue[i].t -= dts) <= 0) { const q = queue[i]; queue.splice(i, 1); launch(q.kind, q.o); }
        let bombs = 0;
        if (state !== 'boom') for (let i = objs.length; i--;) {
          const o = objs[i];
          if (o.dead) { objs.splice(i, 1); continue; }
          o.vy += G * dts; o.x += o.vx * dts; o.y += o.vy * dts; o.a += o.va * dts;
          if (o.kind === 'bomb') {
            bombs++;
            if (Math.random() < .8) { const c = Math.cos(o.a), s = Math.sin(o.a), lx = BOMB_DEF.r * .55, ly = -BOMB_DEF.r * 1.62; part(o.x + lx * c - ly * s, o.y + lx * s + ly * c, rnd(-70, 70), rnd(-110, -10), rnd(.15, .35), rnd(1.5, 3), Math.random() < .5 ? '#ffe27a' : '#fff6d0', 2, .6); }
          }
          const out = (o.vy > 0 && o.y > H + o.def.ext + 10) || o.x < -260 || o.x > W + 260;
          if (out) {
            objs.splice(i, 1);
            if (o.kind === 'fruit' && mode === 'classic' && state === 'play') {
              lives--; marks.push({ x: clamp(o.x, 30, W - 30), l: 1.4 }); shake = Math.max(shake, 5); sfx('miss');
              if (lives <= 0) { lives = 0; endRun('lives'); state = 'ending2'; endT = 0; }
            }
          }
        }
        if (state === 'ending2') { endT += dt; if (endT > 1.3) { sfx('gong'); buildOver(); } }
        if (state !== 'boom') setFuse(bombs > 0 && !paused);
        if (api.muted && A.fuse) setFuse(false);

        for (let i = halves.length; i--;) {
          const h = halves[i];
          h.vy += G * dts; h.x += h.vx * dts; h.y += h.vy * dts; h.rot += h.vr * dts; h.th += h.vth * dts;
          if (h.y > H + 140) halves.splice(i, 1);
        }
        for (let i = parts.length; i--;) {
          const p = parts[i];
          if ((p.life -= dts) <= 0) { parts.splice(i, 1); continue; }
          p.vy += G * p.g * dts; p.x += p.vx * dts; p.y += p.vy * dts; p.a += dts * 6;
          if (p.kind === 2 || p.kind === 3) { p.vx *= 1 - dts * 2; p.vy *= 1 - dts * 2; }
        }
        for (let i = stains.length; i--;) {
          const s = stains[i];
          if ((s.life -= dt) <= 0) { stains.splice(i, 1); continue; }
          for (const d of s.drips) if (d.len < d.max) d.len += d.sp * dt;
        }
        for (let i = texts.length; i--;) if ((texts[i].t += dt) >= texts[i].max) texts.splice(i, 1);
        for (let i = marks.length; i--;) if ((marks[i].l -= dt) <= 0) marks.splice(i, 1);
        for (let i = flashes.length; i--;) if ((flashes[i].l -= dt) <= 0) flashes.splice(i, 1);
        const t = now();
        for (const sw of swipes.values()) { sw.pomCd -= dt; if (sw.combo.n && t - sw.combo.t > CFG.COMBO_GAP) finishCombo(sw); }
        for (let i = fading.length; i--;) { const sw = fading[i]; if (sw.combo.n) finishCombo(sw); if (!sw.trail.length || t - sw.trail[sw.trail.length - 1].t > CFG.TRAIL_T) fading.splice(i, 1); }
      }

      function drawLit(x, y, ext, fn, light = true) {
        sx.setTransform(DPR, 0, 0, DPR, 0, 0);
        sx.globalCompositeOperation = 'source-over';
        sx.clearRect(0, 0, SCR, SCR);
        sx.translate(SCR / 2, SCR / 2);
        fn(sx);
        if (light) {
          sx.setTransform(DPR, 0, 0, DPR, SCR / 2 * DPR, SCR / 2 * DPR);
          sx.globalCompositeOperation = 'source-atop';
          const L = ext * 1.05; sx.drawImage(LIGHT, -L, -L, L * 2, L * 2);
          sx.globalCompositeOperation = 'source-over';
        }
        ctx.drawImage(scr, x - SCR / 2, y - SCR / 2, SCR, SCR);
      }
      function drawWhole(def, spr, x, y, a, sc = 1) {
        const S = spr.S;
        drawLit(x, y, def.ext * sc, s => { s.rotate(a); if (sc !== 1) s.scale(sc, sc); s.drawImage(spr.c, -S / 2, -S / 2, S, S); });
      }
      function drawHalf(h) {
        const S = h.spr.S, f = Math.sin(h.th), af = Math.abs(f);
        drawLit(h.x, h.y, h.def.ext * h.sc, s => {
          s.rotate(h.rot); if (h.sc !== 1) s.scale(h.sc, h.sc);
          s.save(); s.beginPath(); s.rect(-S, h.side < 0 ? -S : 0, S * 2, S); s.clip(); s.rotate(h.skin); s.drawImage(h.spr.c, -S / 2, -S / 2, S, S); s.restore();
          if (af > .03) {
            if (f > 0) { s.save(); s.scale(1, af); s.rotate(h.skin); s.drawImage(h.inn.c, -S / 2, -S / 2, S, S); s.restore(); }
            else {
              s.save(); s.scale(1, af); s.rotate(h.skin); s.beginPath(); h.def.shape(s, h.def.r); s.restore();
              s.save(); s.clip(); s.rotate(h.skin); s.drawImage(h.spr.c, -S / 2, -S / 2, S, S); s.restore();
            }
          }
        });
      }
      function T(str, x, y, px, c1, c2, align = 'center', sw = Math.max(4, px * .2), sc = '#2a1200') {
        ctx.font = FONT(px); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        if (sw) { ctx.lineWidth = sw; ctx.strokeStyle = sc; ctx.strokeText(str, x, y); }
        ctx.fillStyle = c2 ? lin(ctx, 0, y - px * .45, 0, y + px * .4, [[0, c1], [1, c2]]) : c1;
        ctx.fillText(str, x, y);
      }
      function drawX(x, y, s, on) {
        ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round';
        const p = () => { ctx.beginPath(); ctx.moveTo(-s, -s); ctx.lineTo(s, s); ctx.moveTo(s, -s); ctx.lineTo(-s, s); };
        p(); ctx.strokeStyle = on ? '#3a0000' : 'rgba(10,30,60,.7)'; ctx.lineWidth = s * .7 + 6; ctx.stroke();
        p(); ctx.strokeStyle = on ? lin(ctx, 0, -s, 0, s, [[0, '#ff7a6a'], [1, '#d4101a']]) : lin(ctx, 0, -s, 0, s, [[0, '#a8dcff'], [1, '#3a7ad8']]); ctx.lineWidth = s * .7; ctx.stroke();
        if (!on) { p(); ctx.strokeStyle = 'rgba(15,35,80,.85)'; ctx.lineWidth = s * .28; ctx.stroke(); }
        ctx.restore();
      }
      function drawTrail(sw, t) {
        const P = sw.trail;
        while (P.length && t - P[0].t > CFG.TRAIL_T) P.shift();
        const n = P.length;
        if (n < 2) return;
        const Q = [];
        for (let i = 0; i < n - 1; i++) {
          const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
          for (let k = 0; k < 3; k++) {
            const u = k / 3, u2 = u * u, u3 = u2 * u;
            Q.push([.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
              .5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
              lerp(p1.t, p2.t, u)]);
          }
        }
        Q.push([P[n - 1].x, P[n - 1].y, P[n - 1].t]);
        const m = Q.length, head = Q[m - 1];
        let len = 0; for (let i = 1; i < m; i++) len += Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]);
        if (len < 3) return;
        const life = clamp(1 - (t - head[2]) / CFG.TRAIL_T, 0, 1);
        const Wm = CFG.TRAIL_W * Math.min(1, len / 90) * (.35 + .65 * life);
        const Lp = [], Rp = [];
        for (let i = 0; i < m; i++) {
          const a = Q[Math.max(0, i - 1)], b = Q[Math.min(m - 1, i + 1)];
          let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const d = Math.hypot(nx, ny) || 1; nx /= d; ny /= d;
          const u = i / (m - 1), w = Wm * Math.pow(u, .85) * .5;
          Lp.push([Q[i][0] + nx * w, Q[i][1] + ny * w]); Rp.push([Q[i][0] - nx * w, Q[i][1] - ny * w]);
        }
        const poly = sc => {
          ctx.beginPath(); ctx.moveTo(Q[0][0], Q[0][1]);
          for (let i = 1; i < m; i++) ctx.lineTo(Q[i][0] + (Lp[i][0] - Q[i][0]) * sc, Q[i][1] + (Lp[i][1] - Q[i][1]) * sc);
          ctx.arc(head[0], head[1], Wm * .5 * sc, Math.atan2(Lp[m - 1][1] - head[1], Lp[m - 1][0] - head[0]), Math.atan2(Rp[m - 1][1] - head[1], Rp[m - 1][0] - head[0]));
          for (let i = m - 1; i >= 1; i--) ctx.lineTo(Q[i][0] + (Rp[i][0] - Q[i][0]) * sc, Q[i][1] + (Rp[i][1] - Q[i][1]) * sc);
          ctx.closePath();
        };
        ctx.save();
        poly(2.2); ctx.fillStyle = 'rgba(150,205,255,.22)'; ctx.fill();
        poly(1.5); ctx.fillStyle = 'rgba(120,200,255,.5)'; ctx.fill();
        ctx.shadowColor = 'rgba(170,215,255,.95)'; ctx.shadowBlur = 12 * DPR;
        poly(1); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.shadowBlur = 0;
        poly(.45); ctx.fillStyle = 'rgba(200,235,255,.9)'; ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        const hg = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], Wm * 1.3); hg.addColorStop(0, 'rgba(255,255,255,.9)'); hg.addColorStop(1, 'rgba(120,190,255,0)');
        ctx.fillStyle = hg; ctx.fillRect(head[0] - Wm * 1.3, head[1] - Wm * 1.3, Wm * 2.6, Wm * 2.6);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }
      function drawParts() {
        for (const p of parts) {
          const k = p.life / p.max;
          if (p.kind === 0) {
            const sp = Math.hypot(p.vx, p.vy);
            ctx.globalAlpha = Math.min(1, k * 2); ctx.fillStyle = p.col;
            ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * (1 + sp * .0018), p.size, Math.atan2(p.vy, p.vx), 0, TAU); ctx.fill();
          } else if (p.kind === 1) {
            ctx.globalAlpha = Math.min(1, k * 2); ctx.fillStyle = p.col;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.beginPath(); ctx.roundRect(-p.size, -p.size * .7, p.size * 2, p.size * 1.4, p.size * .4); ctx.fill(); ctx.restore();
          } else if (p.kind === 2) {
            ctx.globalAlpha = k; const z = p.size * 4;
            ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(SPARK, p.x - z, p.y - z, z * 2, z * 2); ctx.globalCompositeOperation = 'source-over';
          } else if (p.kind === 3) {
            ctx.globalAlpha = k * .8; ctx.fillStyle = p.col; circ(ctx, p.x, p.y, p.size * (1.6 - k * .6)); ctx.fill();
          } else if (p.kind === 5) {
            ctx.globalAlpha = Math.min(1, k * 2); ctx.fillStyle = p.col;
            ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 1.3, p.a, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.6)'; circ(ctx, p.x - p.size * .3, p.y - p.size * .4, p.size * .3); ctx.fill();
          } else if (p.kind === 6) {
            ctx.globalAlpha = k * .55; ctx.fillStyle = p.col; circ(ctx, p.x, p.y, p.size * (1.4 - k * .7)); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
      function drawRing(rg) {
        const fade = rg.gone ? Math.max(0, 1 - rg.ft * 2.2) : 1, grow = rg.gone ? 1 + rg.ft * .8 : (state === 'menu' ? .6 + .4 * Math.min(1, menuIn * 1.4) : Math.min(1, .5 + ringT * 1.6));
        if (fade <= 0) return;
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(rg.x, rg.y); ctx.scale(grow, grow); ctx.rotate(rg.rot);
        const N = rg.ring.N, k = rg.R / (N / 2 - 5);
        ctx.drawImage(rg.ring.c, -N / 2 * k, -N / 2 * k, N * k, N * k);
        ctx.restore();
        if (!rg.gone) {
          const by = rg.y + Math.sin(clock * 2 + rg.x) * 4;
          if (rg.bomb) {
            ctx.globalAlpha = .45 + .25 * Math.sin(clock * 10); ctx.drawImage(BGLOW, rg.x - 70, by - 70, 140, 140); ctx.globalAlpha = 1;
            drawWhole(rg.def, rg.spr, rg.x, by, Math.sin(clock) * .3, rg.sc);
            if (Math.random() < .6) { const c = Math.cos(Math.sin(clock) * .3), s = Math.sin(Math.sin(clock) * .3), lx = BOMB_DEF.r * .55 * rg.sc, ly = -BOMB_DEF.r * 1.62 * rg.sc; part(rg.x + lx * c - ly * s, by + lx * s + ly * c, rnd(-60, 60), rnd(-90, -10), .3, rnd(1.5, 3), '#ffe27a', 2, .5); }
          } else drawWhole(rg.def, rg.spr, rg.x, by, rg.a, rg.sc);
        }
      }
      function drawHUD() {
        const f = SPR[FI.watermelon];
        ctx.save(); ctx.translate(36, 42); ctx.rotate(-.35); ctx.scale(.5, .5); ctx.drawImage(f.c, -f.S / 2, -f.S / 2, f.S, f.S); ctx.restore();
        T(String(score), 70, 42, 46, '#fff9b0', '#ffa000', 'left', 8);
        T('BEST: ' + Math.max(bests[mode], score), 22, 86, 18, '#ffd36a', null, 'left', 5);
        if (mode === 'classic') {
          const xs = [W - 128, W - 82, W - 32], ss = [11, 14, 17];
          for (let i = 0; i < 3; i++) drawX(xs[i], 40, ss[i], i < CFG.LIVES - lives);
        } else {
          const tl = Math.ceil(timeLeft), warn = tl <= 10 && state === 'play';
          const str = Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0');
          T(str, W - 22, 42, warn ? 46 + 4 * Math.max(0, Math.sin(clock * 10)) : 44, warn ? '#ffd0c8' : '#fff9b0', warn ? '#ff3a2a' : '#ffa000', 'right', 8);
          let y = 88;
          for (const [k, lab, c1, c2] of [['freeze', 'FREEZE', '#e8f8ff', '#3aa0ff'], ['frenzy', 'FRENZY', '#fff0d0', '#ff4a2a'], ['double', 'x2', '#fffbd0', '#ffb400']]) {
            if (eff[k] <= 0) continue;
            T(lab, W - 22, y, 20, c1, c2, 'right', 5);
            ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(W - 112, y + 13, 90, 5);
            ctx.fillStyle = c2; ctx.fillRect(W - 112, y + 13, 90 * eff[k] / CFG.BANANA_T, 5);
            y += 34;
          }
        }
        ctx.save(); ctx.translate(40, H - 40);
        ctx.fillStyle = 'rgba(20,10,0,.55)'; circ(ctx, 0, 0, 24); ctx.fill();
        ctx.strokeStyle = 'rgba(255,214,120,.8)'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#ffe6a8'; ctx.fillRect(-8, -9, 5.5, 18); ctx.fillRect(2.5, -9, 5.5, 18);
        ctx.restore();
      }
      function drawTitle() {
        const k = small ? 1 : 1.1, y = small ? H * .17 : H * .2, e = 1 - Math.pow(1 - Math.min(1, menuIn * 1.3), 3);
        ctx.save(); ctx.translate(W / 2, y - (1 - e) * 60); ctx.globalAlpha = e;
        ctx.rotate(-.04);
        T('FRUIT', -12 * k, -26 * k, 78 * k, '#ffe16a', '#ff5a1a', 'right', 14 * k, '#2a0f00');
        T('NINJA', 6 * k, 22 * k, 78 * k, '#fff7c0', '#ffb81a', 'left', 14 * k, '#2a0f00');
        ctx.globalAlpha = e * .9; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(170,215,255,.9)'; ctx.shadowBlur = 10 * DPR;
        ctx.beginPath(); ctx.moveTo(-230 * k, 40 * k); ctx.quadraticCurveTo(0, -10 * k, 230 * k, -40 * k); ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();
      }
      function draw() {
        const t = now();
        ctx.save();
        if (shake > 0) ctx.translate(rnd(-shake, shake) * .5, rnd(-shake, shake) * .5);
        ctx.drawImage(BG, -12, -12, W + 24, H + 24);
        for (const s of stains) {
          const a = Math.min(1, s.life / 2.5) * .9;
          ctx.globalAlpha = a;
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.ang); ctx.drawImage(s.img, -120 * s.k * .5, -120 * s.k * .5, 240 * s.k * .5, 240 * s.k * .5); ctx.restore();
          ctx.fillStyle = s.col; ctx.strokeStyle = s.col; ctx.lineCap = 'round';
          for (const d of s.drips) { ctx.lineWidth = d.w; ctx.beginPath(); ctx.moveTo(s.x + d.dx, s.y + d.dy); ctx.lineTo(s.x + d.dx, s.y + d.dy + d.len); ctx.stroke(); circ(ctx, s.x + d.dx, s.y + d.dy + d.len, d.w * .75); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
        if (state === 'menu') drawTitle();
        for (const rg of rings) drawRing(rg);
        if (state === 'menu' && menuIn > .5) {
          ctx.globalAlpha = Math.min(1, (menuIn - .5) * 2);
          for (const rg of rings) {
            const sub = rg.id === 'classic' ? 'Miss 3 fruit or hit a bomb' : rg.id === 'arcade' ? '60 sec  ·  bonus bananas' : '90 sec  ·  no bombs';
            T(sub, rg.x, rg.y + rg.R + 22, 16, '#ffe6b0', null, 'center', 4);
            T('BEST ' + bests[rg.id], rg.x, rg.y + rg.R + 46, 18, '#ffd36a', '#ff9a1a', 'center', 5);
          }
          T('Swipe through a fruit to start', W / 2, H - (small ? 22 : 30), 18, 'rgba(255,240,210,.85)', null, 'center', 4);
          ctx.globalAlpha = 1;
        }
        for (const h of halves) drawHalf(h);
        for (const o of objs) {
          if (o.dead) continue;
          if (o.kind === 'bomb') { ctx.globalAlpha = .45 + .3 * Math.sin(clock * 12); ctx.drawImage(BGLOW, o.x - 72, o.y - 72, 144, 144); ctx.globalAlpha = 1; }
          else if (o.kind === 'banana') { ctx.globalAlpha = .7 + .25 * Math.sin(clock * 8); ctx.globalCompositeOperation = 'lighter'; const g = BAN[o.eff].glow; ctx.drawImage(g, o.x - 80, o.y - 80, 160, 160); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
          drawWhole(o.def, o.spr, o.x + (o.boom ? rnd(-3, 3) : 0), o.y + (o.boom ? rnd(-3, 3) : 0), o.a);
        }
        if (pom && pom.phase !== 'done') {
          const w = 1 + Math.sin(clock * 40) * .05 * pom.wob;
          ctx.globalAlpha = .5; ctx.drawImage(BGLOW, pom.x - 90 * pom.sc, pom.y - 90 * pom.sc, 180 * pom.sc, 180 * pom.sc); ctx.globalAlpha = 1;
          drawWhole(POM_DEF, POM, pom.x + rnd(-1, 1) * pom.wob * 4, pom.y, Math.sin(clock * 3) * .15, pom.sc * w);
          if (pom.phase === 'hover' && !pom.hits) T('SLICE IT!', pom.x, pom.y + 90, 26, '#fff', '#ffb0b8', 'center', 6);
        }
        drawParts();
        ctx.lineCap = 'round';
        for (const f of flashes) {
          const k = f.l / .16, c = Math.cos(f.a) * f.r, s = Math.sin(f.a) * f.r;
          ctx.globalAlpha = Math.min(1, k); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * k;
          ctx.beginPath(); ctx.moveTo(f.x - c, f.y - s); ctx.lineTo(f.x + c, f.y + s); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (const m of marks) { ctx.globalAlpha = Math.min(1, m.l); drawX(m.x, H - 30, 14, true); }
        ctx.globalAlpha = 1;
        for (const sw of swipes.values()) drawTrail(sw, t);
        for (const sw of fading) drawTrail(sw, t);
        for (const x of texts) {
          const u = x.t / x.max, pop = x.t < .12 ? .4 + x.t / .12 * .7 : x.t < .2 ? 1.1 - (x.t - .12) / .08 * .1 : 1;
          ctx.save(); ctx.globalAlpha = u > .75 ? (1 - u) / .25 : 1; ctx.translate(x.x, x.y - x.t * 22); ctx.scale(pop, pop);
          if (x.lines.length > 1 && x.t < .55) {
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.rotate(x.t * 2.4);
            const ga = (1 - x.t / .55) * .4, gl = x.px * (1.6 + x.t * 3);
            for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, w = .09; ctx.fillStyle = `rgba(255,${i & 1 ? 230 : 180},110,${ga})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an - w) * gl, Math.sin(an - w) * gl); ctx.lineTo(Math.cos(an + w) * gl, Math.sin(an + w) * gl); ctx.fill(); }
            ctx.restore();
          }
          x.lines.forEach((l, i) => T(l, 0, i * x.px * 1.1, i ? x.px * 1.15 : x.px, x.c1, x.c2, 'center', Math.max(5, x.px * .22)));
          ctx.restore();
        }
        ctx.restore();
        if (eff.freeze > 0) { ctx.globalAlpha = Math.min(1, eff.freeze * 2, (CFG.BANANA_T - eff.freeze) * 4); ctx.drawImage(FROST, 0, 0, W, H); ctx.globalAlpha = 1; }
        if (eff.frenzy > 0) { ctx.globalAlpha = Math.min(.5, eff.frenzy) * (.7 + .3 * Math.sin(clock * 8)); ctx.fillStyle = rad(ctx, W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .7, [[0, 'rgba(255,60,30,0)'], [1, 'rgba(255,60,30,.5)']]); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
        if (state === 'boom' && boomObj) {
          const o = boomObj;
          ctx.save(); ctx.globalAlpha = rays * .55; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
          ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(clock * .8); ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 12; i++) {
            const a = i / 12 * TAU, L = (200 + 900 * rays) * (i & 1 ? .7 : 1), w = .07 + rays * .06;
            ctx.fillStyle = `rgba(255,250,230,${.25 + rays * .5})`;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * L, Math.sin(a - w) * L); ctx.lineTo(Math.cos(a + w) * L, Math.sin(a + w) * L); ctx.fill();
          }
          ctx.restore();
          drawWhole(o.def, o.spr, o.x + rnd(-4, 4) * rays, o.y + rnd(-4, 4) * rays, o.a);
          ctx.globalAlpha = .6 + .4 * Math.sin(clock * 30); ctx.drawImage(SPARK, o.x - 60, o.y - 60, 120, 120); ctx.globalAlpha = 1;
        }
        if (state !== 'menu' && state !== 'over') drawHUD();
        if (state === 'over') drawOver();
        if (flash > 0) { ctx.globalAlpha = Math.min(1, flash); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
        if (paused) drawPause();
      }
      function drawOver() {
        const e = 1 - Math.pow(1 - Math.min(1, ringT * 1.8), 3);
        ctx.save(); ctx.globalAlpha = e;
        const y0 = small ? H * .16 : H * .15;
        T(endWhy === 'time' ? "TIME'S UP" : 'GAME OVER', W / 2, y0 - (1 - e) * 40, small ? 66 : 72, '#ffd7c0', '#ff3a1a', 'center', 13, '#2a0600');
        T('SCORE', W / 2, y0 + 62, 20, '#ffe6b0', null, 'center', 5);
        T(String(score), W / 2, y0 + 112, 74, '#fff9b0', '#ffa000', 'center', 12);
        T('BEST ' + bests[mode], W / 2, y0 + 168, 22, '#ffd36a', null, 'center', 5);
        if (newBest) { ctx.save(); ctx.translate(W / 2 + (small ? 150 : 170), y0 + 100); ctx.rotate(.18 + Math.sin(clock * 4) * .04); T('NEW BEST!', 0, 0, 24, '#fffbd0', '#ff4a8a', 'center', 6); ctx.restore(); }
        const st = 'Fruit ' + sliced + '   ·   Best combo ' + bestCombo + '   ·   Criticals ' + crits;
        T(st, W / 2, y0 + 204, small ? 17 : 19, '#fff2d8', null, 'center', 5);
        ctx.restore();
        T(small ? 'Slice a fruit to choose' : 'Slice a fruit  ·  Enter = retry  ·  M = menu', W / 2, H - 22, 15, 'rgba(255,240,210,.8)', null, 'center', 4);
      }
      function drawPause() {
        ctx.fillStyle = 'rgba(15,6,0,.68)'; ctx.fillRect(0, 0, W, H);
        T('PAUSED', W / 2, H * .38, 70, '#fff9b0', '#ffa000', 'center', 12);
        T('Tap anywhere or press P to resume', W / 2, H * .38 + 64, 20, '#ffe6b0', null, 'center', 5);
        const b = quitBtn();
        ctx.fillStyle = 'rgba(90,20,14,.9)'; ctx.beginPath(); ctx.roundRect(b[0], b[1], b[2], b[3], 26); ctx.fill();
        ctx.strokeStyle = '#ffb84a'; ctx.lineWidth = 3; ctx.stroke();
        T('QUIT TO MENU', W / 2, b[1] + b[3] / 2, 20, '#fff', null, 'center', 0);
      }
      const quitBtn = () => [W / 2 - 110, H * .62, 220, 52];

      let rect = null;
      const loc = (e, r) => ({ x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height });
      function setPause(p) {
        if (p === paused) return;
        if (p && !(state === 'play' || state === 'pom' || state === 'ending')) return;
        paused = p;
        if (p) setFuse(false);
        for (const sw of swipes.values()) fading.push(sw);
        swipes.clear();
      }
      api.on(canvas, 'pointerdown', e => {
        e.preventDefault();
        au();
        rect = canvas.getBoundingClientRect();
        const p = loc(e, rect);
        if (paused) {
          const b = quitBtn();
          if (p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3]) { paused = false; clearField(); halves = []; buildMenu(); }
          else paused = false;
          return;
        }
        if ((state === 'play' || state === 'pom' || state === 'ending') && Math.hypot(p.x - 40, p.y - (H - 40)) < 36) { setPause(true); return; }
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
        const t = e.timeStamp > 0 ? e.timeStamp / 1000 : now();
        swipes.set(e.pointerId, { id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: 0, mouse: e.pointerType === 'mouse', trail: [{ x: p.x, y: p.y, t }], combo: { n: 0, t: 0, x: 0, y: 0 }, pomCd: 0, lastSw: 0, lt: t });
      });
      function moveTo(sw, ev, r) {
        const p = loc(ev, r), t = ev.timeStamp > 0 ? ev.timeStamp / 1000 : now();
        const d = Math.hypot(p.x - sw.x, p.y - sw.y);
        if (d < .5) return;
        slash(sw, sw.x, sw.y, p.x, p.y);
        const v = d / Math.max(.004, t - sw.lt);
        if (v > CFG.SWOOSH_V && t - sw.lastSw > .22) { sw.lastSw = t; sfx('swoosh', clamp((v - CFG.SWOOSH_V) / 3000, 0, 1)); }
        sw.moved += d; sw.x = p.x; sw.y = p.y; sw.lt = t;
        sw.trail.push({ x: p.x, y: p.y, t });
        if (sw.trail.length > 80) sw.trail.shift();
      }
      api.on(canvas, 'pointermove', e => {
        const sw = swipes.get(e.pointerId);
        if (!sw) return;
        const r = rect || canvas.getBoundingClientRect();
        const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
        if (evs && evs.length) for (const ce of evs) moveTo(sw, ce, r); else moveTo(sw, e, r);
      });
      const up = e => {
        const sw = swipes.get(e.pointerId);
        if (!sw) return;
        swipes.delete(e.pointerId);
        if (sw.moved < 12 && (state === 'menu' || state === 'over')) {
          for (const rg of rings) if (!rg.gone && Math.hypot(sw.sx - rg.x, sw.sy - rg.y) < rg.R * .8) { ringCut(rg, -.5); break; }
        }
        finishCombo(sw);
        fading.push(sw);
      };
      api.on(canvas, 'pointerup', up);
      api.on(canvas, 'pointercancel', up);
      api.on(canvas, 'contextmenu', e => e.preventDefault());
      api.on(window, 'keydown', e => {
        au();
        const k = e.code;
        if (paused) { if (k === 'KeyP' || k === 'Enter' || k === 'Space') { paused = false; e.preventDefault(); } return; }
        if (k === 'KeyP') { setPause(true); return; }
        if (state === 'menu' && !pendingAct) {
          const m = k === 'Digit1' || k === 'Numpad1' || k === 'Enter' || k === 'Space' || k === 'KeyC' ? 'classic' : k === 'Digit2' || k === 'Numpad2' || k === 'KeyA' ? 'arcade' : k === 'Digit3' || k === 'Numpad3' || k === 'KeyZ' ? 'zen' : null;
          const rg = m && rings.find(r => r.id === m);
          if (rg) { e.preventDefault(); ringCut(rg, -.4); }
        } else if (state === 'over' && !pendingAct && ringT > .4) {
          const rg = (k === 'Enter' || k === 'Space' || k === 'KeyR') ? rings[0] : k === 'KeyM' ? rings[1] : null;
          if (rg) { e.preventDefault(); ringCut(rg, -.4); }
        }
      });
      api.on(document, 'visibilitychange', () => { if (document.hidden) setPause(true); });
      api.on(window, 'blur', () => { if (!api.paused) setPause(true); });

      root.__fs = { get state() { return state; }, get score() { return score; }, get lives() { return lives; }, get mode() { return mode; }, get timeLeft() { return timeLeft; }, set timeLeft(v) { timeLeft = v; }, get objs() { return objs; }, get rings() { return rings; }, get pom() { return pom; }, get paused() { return paused; }, get halves() { return halves; }, eff, launch, W, H, startRun, SPR, INN, BAN, BOMB, POM };

      buildMenu();
      api.score(0);
      api.loop(dt => {
        if (!paused) { acc += dt; while (acc >= STEP) { step(STEP); acc -= STEP; } }
        draw();
      });
      return {
        destroy() {
          setFuse(false);
          if (A.c) { try { A.c.close(); } catch (e) {} A.c = null; }
          delete root.__fs;
        }
      };
    }
  });

  const COVER = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="fsx-bg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#7a4a28"/><stop offset="1" stop-color="#2e1608"/></radialGradient><radialGradient id="fsx-wm" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ff8494"/><stop offset=".6" stop-color="#f43a52"/><stop offset="1" stop-color="#d81f38"/></radialGradient><radialGradient id="fsx-or" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#ffd070"/><stop offset="1" stop-color="#ff8c10"/></radialGradient><radialGradient id="fsx-bm" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#5a5a66"/><stop offset="1" stop-color="#08080c"/></radialGradient><radialGradient id="fsx-gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff3a2a" stop-opacity=".7"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient><linearGradient id="fsx-bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7a8"/><stop offset=".5" stop-color="#ffd92e"/><stop offset="1" stop-color="#d9a000"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#fsx-bg)"/>
<g stroke="#1e0c02" stroke-width="5" opacity=".6"><path d="M66 0v300M133 0v300M200 0v300M267 0v300M334 0v300"/></g>
<g stroke="#ffd8b0" stroke-width="2" opacity=".08"><path d="M70 0v300M137 0v300M204 0v300M271 0v300M338 0v300"/></g>
<g fill="#e8233a" opacity=".85"><path d="M60 196c18-22 50-18 66-4 20-6 34 12 22 26 10 18-16 30-34 20-14 14-42 8-44-10-20 0-26-20-10-32z"/><circle cx="40" cy="176" r="6"/><circle cx="160" cy="236" r="7"/><circle cx="30" cy="232" r="4"/></g>
<g fill="#ff9a12" opacity=".8"><path d="M296 86c14-14 40-10 46 6 18 2 20 22 4 28-2 16-28 18-36 6-18 6-30-12-20-24-8-8-2-18 6-16z"/><circle cx="360" cy="70" r="5"/><circle cx="282" cy="132" r="6"/></g>
<g transform="translate(120 128) rotate(-28)"><path d="M-62 4a62 50 0 0 0 124 0z" fill="#2c6a1c"/><path d="M-57 4a57 44 0 0 0 114 0z" fill="#e8f8c8"/><path d="M-50 4a50 38 0 0 0 100 0z" fill="url(#fsx-wm)"/><path d="M-62 4h124" stroke="#2c6a1c" stroke-width="3"/><g fill="#1a100c"><ellipse cx="-24" cy="18" rx="3" ry="5"/><ellipse cx="0" cy="26" rx="3" ry="5"/><ellipse cx="24" cy="18" rx="3" ry="5"/><ellipse cx="-12" cy="12" rx="2.5" ry="4"/><ellipse cx="12" cy="12" rx="2.5" ry="4"/></g></g>
<g transform="translate(150 96) rotate(-28)"><path d="M-62-4a62 50 0 0 1 124 0z" fill="#4e9a2e"/><path d="M-50-4c8-30 30-42 50-44M-14-4c4-26 16-40 30-46M22-4c4-20 14-32 24-36" stroke="#1e5a12" stroke-width="9" fill="none"/></g>
<g transform="translate(286 196) rotate(20)"><circle r="40" fill="#e86c00"/><circle r="36" fill="#fff2da"/><circle r="31" fill="url(#fsx-or)"/><g stroke="#fff4dc" stroke-width="2.5"><path d="M-31 0h62M0-31v62M-22-22l44 44M22-22l-44 44"/></g><circle r="5" fill="#fff4dc"/></g>
<path d="M232 248c-6-30 6-54 30-70 6 26-4 54-30 70z" fill="url(#fsx-bn)" stroke="#a87800" stroke-width="2"/>
<circle cx="330" cy="236" r="56" fill="url(#fsx-gl)"/>
<g transform="translate(330 240)"><path d="M0-30c4-14 16-16 18-28" stroke="#3a2a18" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="-8" y="-34" width="16" height="10" rx="3" fill="#a0a6b0"/><circle r="27" fill="url(#fsx-bm)"/><circle r="19" stroke="#ff4a4a" stroke-width="3" fill="none" stroke-dasharray="18 12"/><ellipse cx="-9" cy="-10" rx="8" ry="5" fill="#fff" opacity=".35"/><circle cx="18" cy="-58" r="7" fill="#ffe27a"/><circle cx="18" cy="-58" r="3" fill="#fff"/></g>
<path d="M18 262C120 190 230 120 386 30" stroke="#a8d8ff" stroke-width="16" fill="none" stroke-linecap="round" opacity=".35"/>
<path d="M30 254C130 186 236 118 384 32" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<g fill="#e8233a"><circle cx="196" cy="168" r="5"/><circle cx="214" cy="150" r="3.5"/><circle cx="90" cy="70" r="4"/><circle cx="72" cy="100" r="3"/></g>
</svg>`;
  Ameplay.covers[ID] = COVER;
  try { Object.defineProperty(Ameplay.covers, ID, { get: () => COVER, set() {}, enumerable: true, configurable: true }); } catch (e) {}
})();

