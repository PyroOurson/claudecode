
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0, q = a[i]; a[i] = a[j]; a[j] = q; } return a; };
  const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; if (parent) parent.append(e); return e; };
  const hexRGB = hx => [((hx >> 16) & 255) / 255, ((hx >> 8) & 255) / 255, (hx & 255) / 255];
  const NO_GL = { kicker: '3D', title: '3D unavailable', text: 'Your browser could not start WebGL. Try another browser or turn on hardware acceleration.', button: null };

  function grain(g, w, h, a, n) {
    for (let i = 0; i < n; i++) {
      const v = Math.random() < .5 ? 0 : 255;
      g.fillStyle = `rgba(${v},${v},${v},${(Math.random() * a).toFixed(3)})`;
      g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  }
  function cracks(g, s, n, a) {
    g.strokeStyle = `rgba(0,0,0,${a})`; g.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      let x = Math.random() * s, y = Math.random() * s;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += rnd(-12, 12); y += rnd(-12, 12); g.lineTo(x, y); }
      g.stroke();
    }
  }
  const stonePainter = (light, sat) => (g, s) => {
    const u = s / 256;
    g.fillStyle = `hsl(260,12%,${light - 24}%)`; g.fillRect(0, 0, s, s);
    grain(g, s, s, .22, s * s / 5);
    const rows = 4, bh = s / rows, bw = s / 2;
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? bw / 2 : 0, y = r * bh;
      for (let c = 0; c < 2; c++) {
        const x = c * bw + off, l = light + rnd(-9, 9), hu = rnd(18, 40), sa = rnd(sat - 5, sat + 5), soot = Math.random() < .2, moss = Math.random() < .2, crack = Math.random() < .14, chip = Math.random() < .25;
        for (const xx of x + bw > s ? [x, x - s] : [x]) {
          const gr = g.createLinearGradient(0, y, 0, y + bh);
          gr.addColorStop(0, `hsl(${hu},${sa}%,${l + 8}%)`); gr.addColorStop(1, `hsl(${hu},${sa}%,${l - 8}%)`);
          g.save();
          g.fillStyle = gr; g.beginPath(); g.roundRect(xx + 3 * u, y + 3 * u, bw - 6 * u, bh - 6 * u, 7 * u); g.fill(); g.clip();
          for (let i = 0; i < 70; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,240,220,.1)' : 'rgba(0,0,0,.12)'; g.fillRect(xx + Math.random() * bw, y + Math.random() * bh, 1 + Math.random() * 2 * u, 1 + Math.random() * 2 * u); }
          if (soot) { const sg = g.createLinearGradient(0, y, 0, y + bh); sg.addColorStop(0, 'rgba(10,8,12,.34)'); sg.addColorStop(.7, 'rgba(10,8,12,0)'); g.fillStyle = sg; g.fillRect(xx, y, bw, bh); }
          if (moss) { const mx = xx + rnd(.2, .8) * bw, mg = g.createRadialGradient(mx, y + bh, 0, mx, y + bh, bh * .8); mg.addColorStop(0, 'rgba(84,134,60,.5)'); mg.addColorStop(1, 'rgba(84,134,60,0)'); g.fillStyle = mg; g.fillRect(xx, y, bw, bh); }
          if (crack) { g.strokeStyle = 'rgba(20,14,16,.55)'; g.lineWidth = 1.2 * u; g.beginPath(); let cx = xx + rnd(.2, .8) * bw, cy = y + 4 * u; g.moveTo(cx, cy); for (let k = 0; k < 5; k++) { cx += rnd(-10, 10) * u; cy += bh / 6; g.lineTo(cx, cy); } g.stroke(); }
          if (chip) { const cx = Math.random() < .5 ? xx + 4 * u : xx + bw - 4 * u, cy = y + (Math.random() < .5 ? 4 * u : bh - 4 * u); g.fillStyle = 'rgba(30,22,24,.5)'; g.beginPath(); g.arc(cx, cy, rnd(5, 9) * u, 0, TAU); g.fill(); }
          g.restore();
          g.fillStyle = 'rgba(255,240,220,.17)'; g.fillRect(xx + 8 * u, y + 5 * u, bw - 16 * u, 3 * u);
          g.fillStyle = 'rgba(255,240,220,.08)'; g.fillRect(xx + 4 * u, y + 8 * u, 2 * u, bh - 16 * u);
          g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(xx + 8 * u, y + bh - 8 * u, bw - 16 * u, 3 * u);
          g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(xx + bw - 7 * u, y + 8 * u, 2 * u, bh - 16 * u);
        }
      }
    }
    grain(g, s, s, .1, s * s / 9);
    cracks(g, s, 4, .24);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(90,${(120 + Math.random() * 50) | 0},70,${rnd(.15, .4).toFixed(2)})`; g.fillRect(Math.random() * s, ((Math.random() * rows) | 0) * bh - 2 + Math.random() * 4, 2, 2); }
  };
  function paintFlags(g, s) {
    g.fillStyle = '#14111b'; g.fillRect(0, 0, s, s);
    grain(g, s, s, .2, s * s / 6);
    const b = s / 2, u = s / 256;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const l = rnd(26, 38), x = i * b, y = j * b, hu = rnd(22, 40);
      const gr = g.createRadialGradient(x + b / 2, y + b / 2, 4, x + b / 2, y + b / 2, b * .78);
      gr.addColorStop(0, `hsl(${hu},12%,${l + 7}%)`); gr.addColorStop(1, `hsl(${hu},10%,${l - 6}%)`);
      g.save();
      g.fillStyle = gr; g.beginPath(); g.roundRect(x + 4 * u, y + 4 * u, b - 8 * u, b - 8 * u, 9 * u); g.fill(); g.clip();
      for (let k = 0; k < 90; k++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,235,210,.08)' : 'rgba(0,0,0,.14)'; g.fillRect(x + Math.random() * b, y + Math.random() * b, 1 + Math.random() * 2 * u, 1 + Math.random() * 2 * u); }
      const wg = g.createRadialGradient(x + b * rnd(.3, .7), y + b * rnd(.3, .7), 0, x + b / 2, y + b / 2, b * .6);
      wg.addColorStop(0, 'rgba(255,225,190,.1)'); wg.addColorStop(1, 'rgba(255,225,190,0)'); g.fillStyle = wg; g.fillRect(x, y, b, b);
      if (Math.random() < .35) { g.strokeStyle = 'rgba(8,6,10,.6)'; g.lineWidth = 1.3 * u; g.beginPath(); let cx = x + rnd(.2, .8) * b, cy = y + 6 * u; g.moveTo(cx, cy); for (let k = 0; k < 6; k++) { cx += rnd(-12, 12) * u; cy += b / 7; g.lineTo(cx, cy); } g.stroke(); }
      g.restore();
      g.strokeStyle = 'rgba(255,235,210,.16)'; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(x + 8 * u, y + 5.5 * u); g.lineTo(x + b - 8 * u, y + 5.5 * u); g.moveTo(x + 5.5 * u, y + 8 * u); g.lineTo(x + 5.5 * u, y + b - 8 * u); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.moveTo(x + 8 * u, y + b - 5.5 * u); g.lineTo(x + b - 8 * u, y + b - 5.5 * u); g.moveTo(x + b - 5.5 * u, y + 8 * u); g.lineTo(x + b - 5.5 * u, y + b - 8 * u); g.stroke();
    }
    grain(g, s, s, .12, s * s / 8);
    cracks(g, s, 3, .3);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(80,${(120 + Math.random() * 60) | 0},60,${rnd(.2, .5).toFixed(2)})`; const t = Math.random() < .5; g.fillRect(t ? Math.random() * s : b * ((Math.random() * 2) | 0) - 2 + Math.random() * 4, t ? b * ((Math.random() * 2) | 0) - 2 + Math.random() * 4 : Math.random() * s, 2, 2 + Math.random() * 2); }
  }
  function paintSand(g, s) {
    g.fillStyle = '#a98a5a'; g.fillRect(0, 0, s, s);
    grain(g, s, s, .12, 3000);
    const b = s / 2, u = s / 256;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x = i * b, y = j * b, h = rnd(34, 42), sa = rnd(38, 50), l = rnd(66, 76);
      g.save();
      g.fillStyle = `hsl(${h},${sa}%,${l}%)`; g.beginPath(); g.roundRect(x + 2 * u, y + 2 * u, b - 4 * u, b - 4 * u, 5 * u); g.fill(); g.clip();
      const gr = g.createLinearGradient(x, y, x + b, y + b); gr.addColorStop(0, 'rgba(255,255,255,.2)'); gr.addColorStop(1, 'rgba(0,0,0,.1)');
      g.fillStyle = gr; g.fillRect(x, y, b, b);
      for (let k = 0; k < 4; k++) { const wx = x + Math.random() * b, wy = y + Math.random() * b, wr = rnd(14, 34) * u, wg = g.createRadialGradient(wx, wy, 0, wx, wy, wr); wg.addColorStop(0, Math.random() < .5 ? 'rgba(120,90,50,.16)' : 'rgba(255,245,215,.14)'); wg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = wg; g.fillRect(wx - wr, wy - wr, wr * 2, wr * 2); }
      for (let k = 0; k < 140; k++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,245,220,.18)' : 'rgba(90,65,35,.16)'; g.fillRect(x + Math.random() * b, y + Math.random() * b, 1 + Math.random() * 1.6, 1 + Math.random() * 1.6); }
      if (Math.random() < .4) { g.strokeStyle = 'rgba(80,58,30,.35)'; g.lineWidth = 1 * u; g.beginPath(); let cx = x + rnd(.25, .75) * b, cy = y + 4 * u; g.moveTo(cx, cy); for (let k = 0; k < 5; k++) { cx += rnd(-9, 9) * u; cy += b / 6; g.lineTo(cx, cy); } g.stroke(); }
      g.restore();
      g.strokeStyle = 'rgba(255,250,230,.3)'; g.lineWidth = 1.6 * u; g.beginPath(); g.moveTo(x + 6 * u, y + 3.5 * u); g.lineTo(x + b - 6 * u, y + 3.5 * u); g.moveTo(x + 3.5 * u, y + 6 * u); g.lineTo(x + 3.5 * u, y + b - 6 * u); g.stroke();
      g.strokeStyle = 'rgba(70,48,24,.3)'; g.beginPath(); g.moveTo(x + 6 * u, y + b - 3.5 * u); g.lineTo(x + b - 6 * u, y + b - 3.5 * u); g.moveTo(x + b - 3.5 * u, y + 6 * u); g.lineTo(x + b - 3.5 * u, y + b - 6 * u); g.stroke();
    }
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(110,85,50,${rnd(.15, .4).toFixed(2)})`; g.beginPath(); g.arc(Math.random() * s, Math.random() * s, rnd(.8, 2.2), 0, TAU); g.fill(); }
    cracks(g, s, 3, .1);
  }
  function paintGrass(g, s) {
    g.fillStyle = '#58a445'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * s, y = Math.random() * s, r = rnd(12, 40), gr = g.createRadialGradient(x, y, 0, x, y, r);
      const c = Math.random() < .5 ? '40,110,40' : '140,200,90';
      gr.addColorStop(0, `rgba(${c},.22)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.lineWidth = 1.2;
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * s, y = Math.random() * s;
      g.strokeStyle = `hsl(${rnd(88, 118)},${rnd(40, 60)}%,${rnd(30, 56)}%)`;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 7)); g.stroke();
    }
  }
  function paintMetal(g, s) {
    const gr = g.createLinearGradient(0, 0, s, s); gr.addColorStop(0, '#f4f6f9'); gr.addColorStop(1, '#c9ced7');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(40,45,60,.4)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, s - 3, s - 3);
    g.beginPath(); g.moveTo(s / 2, 0); g.lineTo(s / 2, s); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.strokeRect(4.5, 4.5, s - 9, s - 9);
    for (const x of [9, s / 2 - 8, s / 2 + 8, s - 9]) for (const y of [9, s - 9]) {
      g.fillStyle = 'rgba(40,45,60,.45)'; g.beginPath(); g.arc(x, y, 3.2, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(x - .8, y - .8, 1.3, 0, TAU); g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,.3)';
    for (let i = 0; i < 18; i++) { const x = Math.random() * s, y = Math.random() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-14, 14), y + rnd(-5, 5)); g.stroke(); }
    grain(g, s, s, .06, 2500);
  }
  function paintCrate(g, s, hurt) {
    for (let i = 0; i < 4; i++) {
      const y = i * s / 4;
      g.fillStyle = `hsl(${rnd(25, 32)},${rnd(50, 60)}%,${rnd(48, 58)}%)`; g.fillRect(0, y, s, s / 4);
      const pg = g.createLinearGradient(0, y, 0, y + s / 4); pg.addColorStop(0, 'rgba(255,230,190,.16)'); pg.addColorStop(.5, 'rgba(255,230,190,0)'); pg.addColorStop(1, 'rgba(40,20,5,.2)');
      g.fillStyle = pg; g.fillRect(0, y, s, s / 4);
      g.fillStyle = 'rgba(70,40,15,.65)'; g.fillRect(0, y, s, 2);
    }
    g.strokeStyle = 'rgba(95,55,22,.24)'; g.lineWidth = 1;
    for (let i = 0; i < 140; i++) {
      const y = Math.random() * s; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= s; x += 16) g.lineTo(x, y + Math.sin(x * .05 + i) * 1.5);
      g.stroke();
    }
    for (let i = 0; i < 4; i++) { const kx = rnd(.15, .85) * s, ky = rnd(.15, .85) * s, kr = rnd(3, 6) * s / 256; g.fillStyle = 'rgba(70,38,14,.5)'; g.beginPath(); g.ellipse(kx, ky, kr * 1.4, kr, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(40,20,6,.4)'; g.beginPath(); g.ellipse(kx, ky, kr * 2.2, kr * 1.5, 0, 0, TAU); g.stroke(); }
    const f = s * .12;
    g.save(); g.beginPath(); g.rect(f, f, s - 2 * f, s - 2 * f); g.clip();
    g.translate(s / 2, s / 2); g.rotate(-Math.PI / 4);
    g.fillStyle = '#a86c3a'; g.fillRect(-s * .7, -f / 2, s * 1.4, f);
    g.fillStyle = 'rgba(255,230,190,.28)'; g.fillRect(-s * .7, -f / 2, s * 1.4, 2);
    g.fillStyle = 'rgba(0,0,0,.34)'; g.fillRect(-s * .7, f / 2 - 2, s * 1.4, 2);
    g.restore();
    g.fillStyle = '#9a6233';
    g.fillRect(0, 0, s, f); g.fillRect(0, s - f, s, f); g.fillRect(0, 0, f, s); g.fillRect(s - f, 0, f, s);
    g.fillStyle = 'rgba(255,225,180,.14)'; g.fillRect(0, 0, s, 3); g.fillRect(0, 0, 3, s);
    g.strokeStyle = 'rgba(255,225,180,.3)'; g.lineWidth = 2; g.strokeRect(2, 2, s - 4, s - 4);
    g.strokeStyle = 'rgba(40,20,5,.55)'; g.strokeRect(f, f, s - 2 * f, s - 2 * f);
    for (const x of [f / 2, s - f / 2]) for (const y of [f / 2, s - f / 2]) { g.fillStyle = '#3b2a1c'; g.beginPath(); g.arc(x, y, 3.5, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(x - 1, y - 1, 1.2, 0, TAU); g.fill(); }
    grain(g, s, s, .08, 4000);
    if (hurt) {
      g.fillStyle = 'rgba(30,26,24,.28)'; g.fillRect(0, 0, s, s);
      g.strokeStyle = 'rgba(18,10,4,.85)'; g.lineWidth = 3;
      for (let k = 0; k < 3; k++) { g.beginPath(); let x = rnd(.1, .9) * s, y = 0; g.moveTo(x, y); while (y < s) { x += rnd(-16, 16); y += rnd(14, 26); g.lineTo(x, y); } g.stroke(); }
      for (let k = 0; k < 10; k++) { g.fillStyle = k % 2 ? 'rgba(235,200,150,.7)' : 'rgba(20,12,6,.7)'; g.beginPath(); const x = Math.random() * s, y = Math.random() * s; g.moveTo(x, y); g.lineTo(x + rnd(6, 16), y + rnd(-5, 5)); g.lineTo(x + rnd(-4, 8), y + rnd(5, 12)); g.closePath(); g.fill(); }
      const sg = g.createRadialGradient(s * rnd(.3, .7), s * rnd(.3, .7), 0, s * .5, s * .5, s * .5); sg.addColorStop(0, 'rgba(10,8,6,.5)'); sg.addColorStop(1, 'rgba(10,8,6,0)'); g.fillStyle = sg; g.fillRect(0, 0, s, s);
    }
  }
  function paintTread(g, s) {
    g.fillStyle = '#1c1c21'; g.fillRect(0, 0, s, s);
    const n = 4, ph = s / n, e = s * .09;
    for (let k = 0; k < n; k++) {
      const y = k * ph;
      const gr = g.createLinearGradient(0, y, 0, y + ph); gr.addColorStop(0, '#6b6b79'); gr.addColorStop(.18, '#50505c'); gr.addColorStop(1, '#34343d');
      g.fillStyle = gr; g.fillRect(e, y + 2, s - 2 * e, ph - 4);
      g.fillStyle = '#8b8b99'; g.fillRect(e, y + 2, s - 2 * e, 2);
      g.fillStyle = '#17171b'; g.fillRect(e, y + ph * .5 - 1, s - 2 * e, 3);
      g.fillStyle = '#9a9aa8'; g.fillRect(e, y + ph * .5 + 2, s - 2 * e, 1);
      g.fillStyle = '#24242b'; g.fillRect(s * .42, y + 4, s * .16, ph - 8);
      g.fillStyle = '#7a7a88'; g.fillRect(s * .42, y + 4, s * .16, 2);
      for (const x of [e + s * .06, s - e - s * .06]) { g.fillStyle = '#17171b'; g.beginPath(); g.arc(x, y + ph * .27, s * .028, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y + ph * .77, s * .028, 0, TAU); g.fill(); g.fillStyle = '#a3a3b2'; g.beginPath(); g.arc(x - 1, y + ph * .27 - 1, s * .012, 0, TAU); g.fill(); g.beginPath(); g.arc(x - 1, y + ph * .77 - 1, s * .012, 0, TAU); g.fill(); }
    }
    grain(g, s, s, .16, 900);
  }
  function paintFlame(g, s) {
    for (let i = 0; i < 9; i++) {
      const k = 1 - i * .095, cx = s / 2, a = i < 4 ? .13 : .2;
      g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath();
      g.moveTo(cx, s * (.03 + i * .02));
      g.bezierCurveTo(cx + s * .34 * k, s * .42, cx + s * .36 * k, s * .78, cx, s * (.96 - i * .018));
      g.bezierCurveTo(cx - s * .36 * k, s * .78, cx - s * .34 * k, s * .42, cx, s * (.03 + i * .02));
      g.fill();
    }
  }
  function paintMarks(g, w, h, spawns, ps) {
    const X = x => (x + 22) / 44 * w, Z = z => (z + 15) / 30 * h, px = w / 44;
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,255,255,.34)'; g.lineWidth = px * .09; g.setLineDash([px * .7, px * .5]);
    g.strokeRect(X(-20.8), Z(-13.8), px * 41.6, px * 27.6);
    g.setLineDash([]);
    g.strokeStyle = 'rgba(255,214,102,.3)'; g.lineWidth = px * .12;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.beginPath(); g.moveTo(X(sx * 20.8), Z(sz * 13.8 - sz * 2.4)); g.lineTo(X(sx * 20.8), Z(sz * 13.8)); g.lineTo(X(sx * 20.8 - sx * 2.4), Z(sz * 13.8)); g.stroke(); }
    for (const [sx, sz] of spawns) {
      const cx = X(sx), cz = Z(sz), r = px * 1.7;
      g.save(); g.beginPath(); g.arc(cx, cz, r, 0, TAU); g.clip();
      g.fillStyle = 'rgba(255,170,60,.1)'; g.fillRect(cx - r, cz - r, r * 2, r * 2);
      g.strokeStyle = 'rgba(255,150,40,.38)'; g.lineWidth = px * .3;
      for (let k = -8; k < 9; k++) { g.beginPath(); g.moveTo(cx + k * px * .6 - r, cz + r); g.lineTo(cx + k * px * .6 + r, cz - r); g.stroke(); }
      g.restore();
      g.strokeStyle = 'rgba(255,150,40,.55)'; g.lineWidth = px * .14; g.beginPath(); g.arc(cx, cz, r, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = px * .06; g.beginPath(); g.arc(cx, cz, r * .55, 0, TAU); g.stroke();
    }
    const cx = X(ps.x), cz = Z(ps.z), r = px * 2.1;
    const gr = g.createRadialGradient(cx, cz, 0, cx, cz, r); gr.addColorStop(0, 'rgba(70,230,150,.28)'); gr.addColorStop(1, 'rgba(70,230,150,.06)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cz, r, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(80,235,160,.65)'; g.lineWidth = px * .16; g.beginPath(); g.arc(cx, cz, r, 0, TAU); g.stroke();
    g.lineWidth = px * .08; g.beginPath(); g.arc(cx, cz, r * .7, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(80,235,160,.7)'; g.beginPath(); g.moveTo(cx, cz - r * .5); g.lineTo(cx + r * .3, cz + r * .2); g.lineTo(cx, cz); g.lineTo(cx - r * .3, cz + r * .2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = px * .05;
    g.beginPath(); g.moveTo(X(0), Z(-14)); g.lineTo(X(0), Z(14)); g.moveTo(X(-21), Z(0)); g.lineTo(X(21), Z(0)); g.stroke();
    g.beginPath(); g.arc(X(0), Z(0), px * 4.2, 0, TAU); g.stroke();
  }
  function paintGlow(g, s) {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.22, 'rgba(255,255,255,.6)'); r.addColorStop(.55, 'rgba(255,255,255,.14)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  }
  function paintMoon(g, s) {
    const c = s / 2, r = g.createRadialGradient(c - s * .08, c - s * .08, 0, c, c, s * .44);
    r.addColorStop(0, '#ffffff'); r.addColorStop(1, '#d9d6f2');
    g.fillStyle = r; g.beginPath(); g.arc(c, c, s * .44, 0, TAU); g.fill();
    g.fillStyle = 'rgba(150,145,190,.35)';
    for (const [x, y, rr] of [[.4, .4, .08], [.6, .55, .11], [.45, .66, .06], [.62, .33, .05]]) { g.beginPath(); g.arc(s * x, s * y, s * rr, 0, TAU); g.fill(); }
  }
  function paintSwirl(g, s) {
    const c = s / 2, r = g.createRadialGradient(c, c, 0, c, c, c);
    r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(.35, 'rgba(255,255,255,.35)'); r.addColorStop(.92, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.beginPath(); g.arc(c, c, c, 0, TAU); g.fill();
    g.lineCap = 'round';
    for (let a = 0; a < 6; a++) for (let t = 0; t < 1; t += .02) {
      const a1 = a * TAU / 6 + t * 4.4, a2 = a * TAU / 6 + (t + .02) * 4.4, r1 = t * c * .94, r2 = (t + .02) * c * .94;
      g.strokeStyle = `rgba(255,255,255,${(.75 * (1 - t)).toFixed(3)})`; g.lineWidth = 2 + 9 * t;
      g.beginPath(); g.moveTo(c + Math.cos(a1) * r1, c + Math.sin(a1) * r1); g.lineTo(c + Math.cos(a2) * r2, c + Math.sin(a2) * r2); g.stroke();
    }
  }
  function paintScorch(g, s) {
    const c = s / 2, r = g.createRadialGradient(c, c, 0, c, c, c);
    r.addColorStop(0, 'rgba(25,18,12,.8)'); r.addColorStop(.5, 'rgba(30,22,14,.5)'); r.addColorStop(1, 'rgba(30,22,14,0)');
    g.fillStyle = r; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 220; i++) { const a = Math.random() * TAU, d = Math.random() ** .7 * c * .9; g.fillStyle = `rgba(15,10,6,${rnd(.1, .45).toFixed(2)})`; g.fillRect(c + Math.cos(a) * d, c + Math.sin(a) * d, 2, 2); }
  }
  const PICK = { repair: ['#34d68f', '#139a5c'], rapid: ['#ffc23d', '#e8790c'], shield: ['#62b0ff', '#2f63e0'] };
  const iconPainter = kind => (g, s) => {
    const [a, b] = PICK[kind], gr = g.createLinearGradient(0, 0, 0, s);
    gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = s * .05; g.strokeRect(s * .06, s * .06, s * .88, s * .88);
    g.fillStyle = '#fff'; g.beginPath();
    const P = pts => pts.forEach(([x, y], i) => (i ? g.lineTo(x * s, y * s) : g.moveTo(x * s, y * s)));
    if (kind === 'repair') P([[.4, .2], [.6, .2], [.6, .4], [.8, .4], [.8, .6], [.6, .6], [.6, .8], [.4, .8], [.4, .6], [.2, .6], [.2, .4], [.4, .4]]);
    else if (kind === 'rapid') P([[.58, .13], [.28, .56], [.47, .56], [.4, .87], [.73, .42], [.53, .42], [.63, .13]]);
    else { g.moveTo(s * .5, s * .16); g.quadraticCurveTo(s * .66, s * .27, s * .8, s * .27); g.lineTo(s * .78, s * .52); g.quadraticCurveTo(s * .72, s * .76, s * .5, s * .86); g.quadraticCurveTo(s * .28, s * .76, s * .22, s * .52); g.lineTo(s * .2, s * .27); g.quadraticCurveTo(s * .34, s * .27, s * .5, s * .16); }
    g.closePath(); g.fill();
  };

  function geoKit(THREE) {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), up2 = new THREE.Vector3(1, 0, 0), pa = new THREE.Vector3(), pb = new THREE.Vector3();
    const BOX = new THREE.BoxGeometry(1, 1, 1), white = new THREE.Color(1, 1, 1);
    function acc() {
      const pos = [], nor = [], col = [];
      const A = {
        add(geo, x, y, z, rx, ry, rz, sx, sy, sz, c) {
          const g = geo.index ? geo.toNonIndexed() : geo.clone();
          eu.set(rx || 0, ry || 0, rz || 0); q.setFromEuler(eu);
          m4.compose(v3.set(x || 0, y || 0, z || 0), q, s3.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz));
          g.applyMatrix4(m4);
          const p = g.attributes.position, n = g.attributes.normal, ca = g.attributes.color, k = c || white;
          for (let i = 0; i < p.count; i++) {
            pos.push(p.getX(i), p.getY(i), p.getZ(i));
            nor.push(n.getX(i), n.getY(i), n.getZ(i));
            if (ca && !c) col.push(ca.getX(i), ca.getY(i), ca.getZ(i)); else col.push(k.r, k.g, k.b);
          }
          g.dispose();
          return A;
        },
        box(sx, sy, sz, x, y, z, c, rx, ry, rz) { return A.add(BOX, x, y, z, rx, ry, rz, sx, sy, sz, c); },
        beam(x1, y1, z1, x2, y2, z2, w, h, c) {
          pa.set(x1, y1, z1); pb.set(x2, y2, z2);
          const len = pa.distanceTo(pb);
          m4.lookAt(pb, pa, Math.abs(pb.y - pa.y) > len * .98 ? up2 : up);
          q.setFromRotationMatrix(m4);
          eu.setFromQuaternion(q);
          return A.add(BOX, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2, eu.x, eu.y, eu.z, w, h, len, c);
        },
        build(uvs) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
          g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
          if (uvs) {
            const uv = new Float32Array(pos.length / 3 * 2);
            for (let i = 0; i < pos.length / 3; i++) {
              const ax = Math.abs(nor[i * 3]), ay = Math.abs(nor[i * 3 + 1]), az = Math.abs(nor[i * 3 + 2]);
              if (ax >= ay && ax >= az) { uv[i * 2] = pos[i * 3 + 2] * uvs; uv[i * 2 + 1] = pos[i * 3 + 1] * uvs; }
              else if (ay >= az) { uv[i * 2] = pos[i * 3] * uvs; uv[i * 2 + 1] = pos[i * 3 + 2] * uvs; }
              else { uv[i * 2] = pos[i * 3] * uvs; uv[i * 2 + 1] = pos[i * 3 + 1] * uvs; }
            }
            g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          }
          g.computeBoundingSphere();
          return g;
        }
      };
      return A;
    }
    function smooth(g0, deg) {
      const g = g0.index ? g0.toNonIndexed() : g0;
      const p = g.attributes.position, n = g.attributes.normal, cnt = p.count, map = new Map(), out = new Float32Array(cnt * 3), lim = Math.cos(deg * Math.PI / 180);
      for (let i = 0; i < cnt; i++) {
        const k = Math.round(p.getX(i) * 500) + ',' + Math.round(p.getY(i) * 500) + ',' + Math.round(p.getZ(i) * 500);
        const l = map.get(k);
        if (l) l.push(i); else map.set(k, [i]);
      }
      for (const list of map.values()) for (const i of list) {
        let x = 0, y = 0, z = 0;
        const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i);
        for (const j of list) {
          const mx = n.getX(j), my = n.getY(j), mz = n.getZ(j);
          if (nx * mx + ny * my + nz * mz >= lim) { x += mx; y += my; z += mz; }
        }
        const l = Math.hypot(x, y, z);
        if (l < 1e-6) { out[i * 3] = nx; out[i * 3 + 1] = ny || 1; out[i * 3 + 2] = nz; } else { out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l; }
      }
      g.setAttribute('normal', new THREE.BufferAttribute(out, 3));
      return g;
    }
    function rpoly(pts, r) {
      const sh = new THREE.Shape(), n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], rr = Array.isArray(r) ? r[i] : r;
        const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), a = Math.min(rr, d1 / 2.2, d2 / 2.2);
        const sx = p1[0] + (p0[0] - p1[0]) * a / d1, sy = p1[1] + (p0[1] - p1[1]) * a / d1, ex = p1[0] + (p2[0] - p1[0]) * a / d2, ey = p1[1] + (p2[1] - p1[1]) * a / d2;
        if (i === 0) sh.moveTo(sx, sy); else sh.lineTo(sx, sy);
        if (a > 0) sh.quadraticCurveTo(p1[0], p1[1], ex, ey);
      }
      sh.closePath();
      return sh;
    }
    function side(pts, width, r, bev, seg) {
      const b = bev || 0;
      const g = new THREE.ExtrudeGeometry(rpoly(pts, r), { depth: Math.max(.001, width - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2, curveSegments: seg || 3 });
      g.translate(0, 0, -(width - 2 * b) / 2);
      g.rotateY(-Math.PI / 2);
      return smooth(g, 50);
    }
    function top(pts, height, r, bev, seg) {
      const b = bev || 0;
      const g = new THREE.ExtrudeGeometry(rpoly(pts.map(p => [p[0], -p[1]]), r), { depth: Math.max(.001, height - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2, curveSegments: seg || 3 });
      g.translate(0, 0, b);
      g.rotateX(-Math.PI / 2);
      return smooth(g, 50);
    }
    function rbox(sx, sy, sz, r, seg) {
      const g = new THREE.BoxGeometry(sx, sy, sz, seg, seg, seg), p = g.attributes.position, n = g.attributes.normal, hx = sx / 2 - r, hy = sy / 2 - r, hz = sz / 2 - r, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        v.set(x - Math.max(-hx, Math.min(hx, x)), y - Math.max(-hy, Math.min(hy, y)), z - Math.max(-hz, Math.min(hz, z)));
        const l = v.length();
        if (l > 1e-6) {
          v.multiplyScalar(1 / l);
          p.setXYZ(i, Math.max(-hx, Math.min(hx, x)) + v.x * r, Math.max(-hy, Math.min(hy, y)) + v.y * r, Math.max(-hz, Math.min(hz, z)) + v.z * r);
          n.setXYZ(i, v.x, v.y, v.z);
        }
      }
      return g;
    }
    function tint(g, fn) {
      const p = g.attributes.position, c = new Float32Array(p.count * 3), t = new THREE.Color();
      for (let i = 0; i < p.count; i++) { fn(t, p.getX(i), p.getY(i), p.getZ(i), i); c[i * 3] = t.r; c[i * 3 + 1] = t.g; c[i * 3 + 2] = t.b; }
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      return g;
    }
    return { acc, smooth, rpoly, side, top, rbox, tint, BOX };
  }

  function kit(THREE, renderer, wrap, canvas) {
    const bin = [], own = o => (bin.push(o), o), aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const tex = (s, paint) => {
      const c = document.createElement('canvas'); c.width = c.height = s; paint(c.getContext('2d'), s);
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso;
      return own(t);
    };
    wrap.style.width = canvas.style.width; canvas.style.width = '100%'; wrap.prepend(canvas);
    return { own, tex, dispose() { for (const o of bin) { try { o.dispose(); } catch (e) {   } } bin.length = 0; } };
  }
  const PVS = `attribute vec3 pcolor; attribute float alpha; attribute float size; uniform float scale; varying vec3 vC; varying float vA;
void main() { vC = pcolor; vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = alpha > 0.0 ? size * scale / -mv.z : 0.0; gl_Position = projectionMatrix * mv; }`;
  const PFS = `uniform sampler2D map; varying vec3 vC; varying float vA;
void main() { vec4 t = texture2D(map, gl_PointCoord); float a = t.a * vA; if (a < 0.01) discard; gl_FragColor = vec4(vC * t.rgb, a); }`;
  function particles(THREE, own, n, map, additive) {
    const geo = own(new THREE.BufferGeometry());
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), alp = new Float32Array(n), siz = new Float32Array(n);
    const vel = new Float32Array(n * 3), life = new Float32Array(n), max = new Float32Array(n), s0 = new Float32Array(n), s1 = new Float32Array(n), a0 = new Float32Array(n), grav = new Float32Array(n), drag = new Float32Array(n);
    const attr = (a, k) => new THREE.BufferAttribute(a, k).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', attr(pos, 3)); geo.setAttribute('pcolor', attr(col, 3)); geo.setAttribute('alpha', attr(alp, 1)); geo.setAttribute('size', attr(siz, 1));
    const mat = own(new THREE.ShaderMaterial({ uniforms: { map: { value: map }, scale: { value: 400 } }, vertexShader: PVS, fragmentShader: PFS, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
    const obj = new THREE.Points(geo, mat); obj.frustumCulled = false; obj.renderOrder = additive ? 6 : 5;
    let head = 0, live = 0;
    return {
      obj, mat,
      emit(x, y, z, vx, vy, vz, l, r, g, b, sa, sb, al, gr, dr) {
        const i = head, i3 = i * 3; head = (head + 1) % n;
        pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z; vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
        col[i3] = r; col[i3 + 1] = g; col[i3 + 2] = b;
        life[i] = max[i] = l; s0[i] = sa; s1[i] = sb; a0[i] = al == null ? 1 : al; grav[i] = gr || 0; drag[i] = dr || 0;
        live = 1;
      },
      update(dt) {
        if (!live) return;
        let any = 0;
        for (let i = 0; i < n; i++) {
          if (life[i] <= 0) { alp[i] = 0; continue; }
          life[i] -= dt;
          if (life[i] <= 0) { alp[i] = 0; continue; }
          any = 1;
          const i3 = i * 3, k = drag[i] ? Math.exp(-drag[i] * dt) : 1;
          vel[i3] *= k; vel[i3 + 1] = vel[i3 + 1] * k - grav[i] * dt; vel[i3 + 2] *= k;
          pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt;
          const t = life[i] / max[i];
          alp[i] = a0[i] * (t < .4 ? t / .4 : 1); siz[i] = s1[i] + (s0[i] - s1[i]) * t;
        }
        live = any;
        const a = geo.attributes;
        a.position.needsUpdate = a.pcolor.needsUpdate = a.alpha.needsUpdate = a.size.needsUpdate = true;
      },
      clear() { life.fill(0); alp.fill(0); live = 1; }
    };
  }

  const MZ = { S: 4, T: .6, H: 3.4, R: .42 };
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const mzX0 = i => (i >> 1) * (MZ.S + MZ.T) + (i & 1 ? MZ.T : 0);
  const mzSz = i => (i & 1 ? MZ.S : MZ.T);
  const mzIdx = (v, W) => { const P = MZ.S + MZ.T, k = Math.floor(v / P), i = 2 * k + (v - k * P < MZ.T ? 0 : 1); return i < 0 ? 0 : i >= W ? W - 1 : i; };
  function genMaze(n, rand) {
    const W = 2 * n + 1, g = new Uint8Array(W * W).fill(1), seen = new Uint8Array(n * n), stack = [0], opts = [];
    seen[0] = 1; g[W + 1] = 0;
    while (stack.length) {
      const c = stack[stack.length - 1], cx = c % n, cy = (c / n) | 0;
      opts.length = 0;
      for (const [dx, dy] of D4) { const x = cx + dx, y = cy + dy; if (x >= 0 && y >= 0 && x < n && y < n && !seen[y * n + x]) opts.push(dx, dy); }
      if (!opts.length) { stack.pop(); continue; }
      const k = ((rand() * opts.length / 2) | 0) * 2, dx = opts[k], dy = opts[k + 1], nc = (cy + dy) * n + cx + dx;
      seen[nc] = 1;
      g[(2 * cy + 1 + dy) * W + 2 * cx + 1 + dx] = 0;
      g[(2 * (cy + dy) + 1) * W + 2 * (cx + dx) + 1] = 0;
      stack.push(nc);
    }
    return { n, W, g };
  }
  function mazeLayout(n, rand) {
    const m = genMaze(n, rand), { W, g } = m;
    const open = (cx, cy, dx, dy) => g[(2 * cy + 1 + dy) * W + 2 * cx + 1 + dx] === 0;
    const dist = new Int32Array(n * n).fill(-1), q = [0];
    dist[0] = 0;
    for (let h = 0; h < q.length; h++) {
      const c = q[h], cx = c % n, cy = (c / n) | 0;
      for (const [dx, dy] of D4) if (open(cx, cy, dx, dy)) { const nc = c + dy * n + dx; if (dist[nc] < 0) { dist[nc] = dist[c] + 1; q.push(nc); } }
    }
    let exit = 0;
    for (let c = 0; c < n * n; c++) if (dist[c] > dist[exit]) exit = c;
    const deg = c => D4.reduce((s, [dx, dy]) => s + (open(c % n, (c / n) | 0, dx, dy) ? 1 : 0), 0);
    const cand = [];
    for (let c = 1; c < n * n; c++) if (c !== exit && deg(c) === 1) cand.push(c);
    for (let c = 1; cand.length < 3 && c < n * n; c++) if (c !== exit && !cand.includes(c)) cand.push(c);
    const md = (a, b) => Math.abs(a % n - b % n) + Math.abs(((a / n) | 0) - ((b / n) | 0));
    const keys = [];
    while (keys.length < 3) {
      let best = -1, bs = -1e9;
      for (const c of cand) {
        if (keys.includes(c)) continue;
        let s = Math.min(md(c, 0), md(c, exit));
        for (const k of keys) s = Math.min(s, md(c, k));
        s += dist[c] * .2 + rand() * 1.5;
        if (s > bs) { bs = s; best = c; }
      }
      keys.push(best);
    }
    return { n, W, g, dist, exit, keys, open };
  }
  function mazeCollide(m, p) {
    const { W, g } = m, R = MZ.R;
    for (let pass = 0; pass < 2; pass++) {
      const i0 = mzIdx(p.x - R, W), i1 = mzIdx(p.x + R, W), j0 = mzIdx(p.z - R, W), j1 = mzIdx(p.z + R, W);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        if (!g[j * W + i]) continue;
        const a = mzX0(i), b = a + mzSz(i), c = mzX0(j), d = c + mzSz(j);
        const qx = p.x < a ? a : p.x > b ? b : p.x, qz = p.z < c ? c : p.z > d ? d : p.z;
        const dx = p.x - qx, dz = p.z - qz, d2 = dx * dx + dz * dz;
        if (d2 >= R * R) continue;
        if (d2 > 1e-9) { const dd = Math.sqrt(d2), k = (R - dd) / dd; p.x += dx * k; p.z += dz * k; }
        else {
          const l = p.x - a, r = b - p.x, u = p.z - c, w = d - p.z, mn = Math.min(l, r, u, w);
          if (mn === l) p.x = a - R; else if (mn === r) p.x = b + R; else if (mn === u) p.z = c - R; else p.z = d + R;
        }
      }
    }
    return p;
  }

  function wallGeometry(THREE, m) {
    const { W, g } = m, H = MZ.H, pos = [], nor = [], uv = [], col = [], idx = [];
    const quad = (P, n, U, C) => {
      const e1 = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]], e2 = [P[3][0] - P[0][0], P[3][1] - P[0][1], P[3][2] - P[0][2]];
      const cx = e1[1] * e2[2] - e1[2] * e2[1], cy = e1[2] * e2[0] - e1[0] * e2[2], cz = e1[0] * e2[1] - e1[1] * e2[0];
      const o = cx * n[0] + cy * n[1] + cz * n[2] < 0 ? [0, 3, 2, 1] : [0, 1, 2, 3], v = pos.length / 3;
      for (const k of o) { pos.push(P[k][0], P[k][1], P[k][2]); nor.push(n[0], n[1], n[2]); uv.push(U[k][0], U[k][1]); col.push(C[k][0], C[k][1], C[k][2]); }
      idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
    };
    const YS = [0, .7, H - .55, H], SH = [.66, 1.12, 1.12, .96];
    const face = (ax, az, bx, bz, nx, nz) => {
      const len = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / len, tz = (bz - az) / len, ua = (nx ? az : ax) / 2, ub = (nx ? bz : bx) / 2;
      const uo = Math.random() * 4, vo = Math.floor(Math.random() * 4) * .25, tn = .98 + Math.random() * .16, moss = Math.random() < .24, dark = Math.random() < .12 ? .86 : 1;
      const cl = (k, s) => { const w = k < 1 && moss ? .84 : 1, b = tn * dark * s; return [b * (w < 1 ? w * .94 : 1), b, b * (w < 1 ? w * .9 : 1)]; };
      for (let k = 0; k < 3; k++) {
        const y0 = YS[k], y1 = YS[k + 1];
        quad([[ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]], [nx, 0, nz], [[ua + uo, y0 / 2 + vo], [ub + uo, y0 / 2 + vo], [ub + uo, y1 / 2 + vo], [ua + uo, y1 / 2 + vo]], [cl(k, SH[k]), cl(k, SH[k]), cl(k + 1, SH[k + 1]), cl(k + 1, SH[k + 1])]);
      }
      const e = .05, a0x = ax - tx * e, a0z = az - tz * e, b0x = bx + tx * e, b0z = bz + tz * e, uA = ua - e / 2 + uo, uB = ub + e / 2 + uo;
      const d1 = .06, h1 = .32, c1 = [.78, .78, .78], c2 = [.96, .96, .96];
      quad([[a0x + nx * d1, 0, a0z + nz * d1], [b0x + nx * d1, 0, b0z + nz * d1], [b0x + nx * d1, h1, b0z + nz * d1], [a0x + nx * d1, h1, a0z + nz * d1]], [nx, 0, nz], [[uA, 0], [uB, 0], [uB, h1 / 2], [uA, h1 / 2]], [c1, c1, c2, c2]);
      quad([[a0x, h1, a0z], [b0x, h1, b0z], [b0x + nx * d1, h1, b0z + nz * d1], [a0x + nx * d1, h1, a0z + nz * d1]], [0, 1, 0], [[uA, 0], [uB, 0], [uB, d1], [uA, d1]], [c2, c2, c2, c2]);
      const d2 = .09, h2 = H - .3, c3 = [1.14, 1.14, 1.14], c4 = [.8, .8, .8];
      quad([[a0x + nx * d2, h2, a0z + nz * d2], [b0x + nx * d2, h2, b0z + nz * d2], [b0x + nx * d2, H, b0z + nz * d2], [a0x + nx * d2, H, a0z + nz * d2]], [nx, 0, nz], [[uA, h2 / 2], [uB, h2 / 2], [uB, H / 2], [uA, H / 2]], [c3, c3, c3, c3]);
      quad([[a0x, h2, a0z], [b0x, h2, b0z], [b0x + nx * d2, h2, b0z + nz * d2], [a0x + nx * d2, h2, a0z + nz * d2]], [0, -1, 0], [[uA, 0], [uB, 0], [uB, d2], [uA, d2]], [c4, c4, c4, c4]);
    };
    const openAt = (i, j) => i >= 0 && j >= 0 && i < W && j < W && g[j * W + i] === 0;
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      if (!g[j * W + i]) continue;
      const a = mzX0(i), b = a + mzSz(i), c = mzX0(j), d = c + mzSz(j);
      if (openAt(i + 1, j)) face(b, d, b, c, 1, 0);
      if (openAt(i - 1, j)) face(a, c, a, d, -1, 0);
      if (openAt(i, j + 1)) face(a, d, b, d, 0, 1);
      if (openAt(i, j - 1)) face(b, c, a, c, 0, -1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    return geo;
  }

  const KEY_SVG = '<svg class="key" viewBox="0 0 24 24"><circle cx="7" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2.6"/><path fill="currentColor" d="M10.5 10.7H22v2.6h-1.8v3.2h-2.6v-3.2h-1.5v2.2h-2.6v-2.2h-3z"/></svg>';
  const ARW = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const fmtS = v => v.toFixed(1) + ' s';

  Ameplay.register({
    id: 'maze-3d',
    title: 'Maze Escape 3D',
    category: '3D',
    blurb: 'Grab three keys and escape torch-lit stone mazes as fast as you can.',
    help: '<kbd>W</kbd> <kbd>S</kbd> move · <kbd>A</kbd> <kbd>D</kbd> or <kbd>←</kbd> <kbd>→</kbd> turn · click to mouse-look · <kbd>M</kbd> map · d-pad on touch',
    better: 'low',
    format: v => v + ' s',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="48" height="48" rx="4"/><path d="M8 22h26M46 8v24M20 34v22M32 34h14M32 34v10M46 46h10"/><circle cx="40" cy="22" r="3"/></svg>',
    css: `
.gm-maze-3d [hidden]{display:none!important}
.gm-maze-3d .wrap{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:#1d1836;box-shadow:0 22px 50px -28px rgba(29,24,54,.85)}
.gm-maze-3d .wrap>.g-canvas{display:block;width:100%;border-radius:0;cursor:pointer;background:#1d1836}
.gm-maze-3d .hud{position:absolute;left:12px;top:12px;display:flex;gap:8px;flex-wrap:wrap;pointer-events:none}
.gm-maze-3d .pill{display:flex;align-items:center;gap:7px;height:36px;padding:0 14px;border-radius:999px;background:rgba(18,14,40,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);color:#fff;font:800 14px/1 var(--sans);font-variant-numeric:tabular-nums}
.gm-maze-3d .pill span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.gm-maze-3d .key{width:20px;height:20px;color:#ffd166;opacity:.28}
.gm-maze-3d .key.on{opacity:1;filter:drop-shadow(0 0 6px rgba(255,190,60,.95))}
.gm-maze-3d .map{position:absolute;right:12px;top:12px;width:170px;height:170px;border-radius:16px;background:rgba(18,14,40,.62);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);pointer-events:none}
.gm-maze-3d .mapbtn{position:absolute;right:12px;bottom:12px;height:34px;padding:0 14px;border:0;border-radius:999px;background:rgba(18,14,40,.55);color:#fff;font:800 13px/1 var(--sans);cursor:pointer;box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.gm-maze-3d .msg{position:absolute;left:0;right:0;top:24%;text-align:center;color:#fff;font:900 30px/1.1 var(--sans);letter-spacing:-.02em;text-shadow:0 4px 22px rgba(0,0,0,.55);opacity:0;pointer-events:none}
.gm-maze-3d .msg.show{animation:gm-maze-3d-msg 2.4s var(--ease) both}
@keyframes gm-maze-3d-msg{0%{opacity:0;transform:translateY(12px) scale(.9)}12%{opacity:1;transform:none}75%{opacity:1}100%{opacity:0}}
.gm-maze-3d .hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);padding:9px 15px;border-radius:999px;background:rgba(18,14,40,.55);color:#fff;font:700 13px/1 var(--sans);white-space:nowrap;pointer-events:none}
.gm-maze-3d .dot{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px;border-radius:50%;background:rgba(255,255,255,.65);box-shadow:0 0 0 2px rgba(0,0,0,.2);pointer-events:none}
.gm-maze-3d .flash{position:absolute;inset:0;background:#d9f7ff;opacity:0;pointer-events:none}
.gm-maze-3d .flash.on{animation:gm-maze-3d-flash .9s ease-out}
@keyframes gm-maze-3d-flash{0%{opacity:.95}100%{opacity:0}}
.gm-maze-3d .pad{position:absolute;left:14px;bottom:14px;display:none;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(2,56px);gap:6px}
.gm-maze-3d .wrap.touch .pad{display:grid}
.gm-maze-3d .pad button{display:grid;place-items:center;padding:0;border:0;border-radius:16px;background:rgba(255,255,255,.2);color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.38);touch-action:none;cursor:pointer}
.gm-maze-3d .pad button.on{background:rgba(255,255,255,.5)}
.gm-maze-3d .pad svg{width:24px;height:24px}
.gm-maze-3d .pad [data-d=f]{grid-column:2;grid-row:1}
.gm-maze-3d .pad [data-d=l]{grid-column:1;grid-row:2}
.gm-maze-3d .pad [data-d=b]{grid-column:2;grid-row:2}
.gm-maze-3d .pad [data-d=r]{grid-column:3;grid-row:2}
@media (max-width:640px){
.gm-maze-3d .hud{left:8px;top:8px;gap:5px}
.gm-maze-3d .pill{height:26px;padding:0 9px;font-size:12px;gap:4px}
.gm-maze-3d .pill span{display:none}
.gm-maze-3d .key{width:14px;height:14px}
.gm-maze-3d .map{width:92px;height:92px;right:8px;top:8px;border-radius:12px}
.gm-maze-3d .mapbtn{right:8px;bottom:8px;height:28px;padding:0 10px;font-size:12px}
.gm-maze-3d .pad{left:8px;bottom:8px;grid-template-columns:repeat(3,42px);grid-template-rows:repeat(2,42px);gap:4px}
.gm-maze-3d .msg{font-size:19px}
.gm-maze-3d .hint{font-size:11px;bottom:auto;top:40px}
}
.gm-maze-3d .wrap.touch .mapbtn{height:40px;padding:0 14px}`,
    mount(root, api) {
      const keys = api.keys;
      const wrap = el('div', 'wrap', root);
      let cleanup = null;
      api.gl(960, 600).then(v => { if (v && api.alive) cleanup = run(v); }, () => { if (api.alive) api.overlay(NO_GL); });
      return { destroy() { if (cleanup) cleanup(); } };

      function run({ THREE, renderer, canvas, w, h }) {
        const K = kit(THREE, renderer, wrap, canvas), own = K.own, tex = K.tex;
        const { S, T } = MZ, P = S + T, SIZES = [7, 11, 15], EYE = 1.62;

        const scene = new THREE.Scene(), FOG = 0x1d1836;
        scene.background = new THREE.Color(FOG);
        scene.fog = new THREE.Fog(FOG, 3, 23);
        const cam = new THREE.PerspectiveCamera(72, w / h, .05, 220);
        cam.rotation.order = 'YXZ';
        scene.add(new THREE.HemisphereLight(0x8f86e6, 0x3a2a1c, .42));
        const moonL = new THREE.DirectionalLight(0xb4c2ff, .36); moonL.position.set(-5, 12, 4); scene.add(moonL);
        const lantern = new THREE.PointLight(0xd6dcff, .5, 7, 1.5); scene.add(lantern);
        const lights = [];
        for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xff9440, 0, 10, 1.6); l.userData.t = null; scene.add(l); lights.push(l); }
        const pLight = new THREE.PointLight(0x7b5cff, 1, 11, 1.5); scene.add(pLight);

        const stoneT = tex(512, stonePainter(40, 10)), flagT = tex(512, paintFlags), glowT = tex(64, paintGlow), swirlT = tex(256, paintSwirl), moonT = tex(128, paintMoon), flameT = tex(64, paintFlame);
        const wallM = own(new THREE.MeshStandardMaterial({ map: stoneT, bumpMap: stoneT, bumpScale: .045, roughness: .95, vertexColors: true })), stoneP = own(new THREE.MeshStandardMaterial({ map: stoneT, bumpMap: stoneT, bumpScale: .045, roughness: .95 }));
        const floorM = own(new THREE.MeshStandardMaterial({ map: flagT, bumpMap: flagT, bumpScale: .03, roughness: .9 }));
        const ironM = own(new THREE.MeshStandardMaterial({ color: 0x2c2a33, roughness: .55, metalness: .5 }));
        const goldM = own(new THREE.MeshStandardMaterial({ color: 0xffc23d, roughness: .3, metalness: .5, emissive: 0x8a5500, emissiveIntensity: .6 }));
        const flameM = own(new THREE.SpriteMaterial({ map: glowT, color: 0xff8a2a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        const coreM = own(new THREE.SpriteMaterial({ map: glowT, color: 0xfff0b0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        const flameMidM = own(new THREE.SpriteMaterial({ map: flameT, color: 0xff9a30, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        const flameCoreM = own(new THREE.SpriteMaterial({ map: flameT, color: 0xfff0b0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        const torchM = own(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6, metalness: .45 }));
        const gemM = own(new THREE.MeshStandardMaterial({ color: 0x38d6ff, emissive: 0x2a9ad0, emissiveIntensity: 1.2, roughness: .2, metalness: .1 }));
        const keyGlowM = own(new THREE.SpriteMaterial({ map: glowT, color: 0xffa820, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        const GK = geoKit(THREE), acc = GK.acc, cc = hex => new THREE.Color(hex);
        const G = (() => {
          const iron = cc('#2c2a33'), wood = cc('#7a5230'), cloth = cc('#c9b48a'), bowl = cc('#3a3640'), coal = cc('#ff7a2a');
          const T = acc();
          T.box(.2, .46, .05, 0, 0, .02, iron);
          for (const sx of [-1, 1]) for (const sy of [-1, 1]) T.box(.035, .035, .03, sx * .07, sy * .18, .05, cc('#6d6a78'));
          T.beam(0, -.1, .04, 0, -.06, .24, .06, .06, iron);
          T.add(new THREE.CylinderGeometry(.04, .045, .62, 8), 0, .1, .26, .4, 0, 0, 1, 1, 1, wood);
          T.add(new THREE.TorusGeometry(.085, .022, 6, 14), 0, .02, .27, -1.171, 0, 0, 1, 1, 1, iron);
          T.add(new THREE.CylinderGeometry(.062, .062, .12, 8), 0, .26, .34, .4, 0, 0, 1, 1, 1, cloth);
          T.add(new THREE.CylinderGeometry(.105, .06, .15, 10), 0, .39, .37, .4, 0, 0, 1, 1, 1, bowl);
          T.add(new THREE.CylinderGeometry(.085, .085, .02, 10), 0, .46, .39, .4, 0, 0, 1, 1, 1, coal);
          const K = acc();
          K.add(new THREE.TorusGeometry(.14, .036, 8, 18), 0, .32, 0);
          for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + i * Math.PI * 2 / 3; K.add(new THREE.TorusGeometry(.055, .028, 6, 12), Math.cos(a) * .2, .32 + Math.sin(a) * .2, 0); }
          K.add(new THREE.CylinderGeometry(.034, .034, .56, 8), 0, -.1, 0);
          K.add(new THREE.TorusGeometry(.046, .018, 6, 10), 0, .14, 0, Math.PI / 2, 0, 0).add(new THREE.TorusGeometry(.046, .018, 6, 10), 0, .06, 0, Math.PI / 2, 0, 0).add(new THREE.TorusGeometry(.046, .018, 6, 10), 0, -.3, 0, Math.PI / 2, 0, 0);
          K.box(.11, .05, .045, .08, -.38, 0).box(.14, .05, .045, .09, -.29, 0).box(.1, .05, .045, .07, -.2, 0);
          K.add(new THREE.SphereGeometry(.04, 8, 6), 0, -.39, 0);
          return {
            torch: own(T.build()), key: own(K.build()), gem: own(new THREE.SphereGeometry(.058, 12, 10).translate(0, .32, 0))
          };
        })();

        const sky = new THREE.Group(); scene.add(sky);
        {
          const sp = [];
          for (let i = 0; i < 650; i++) { const a = Math.random() * TAU, e = Math.asin(rnd(.12, 1)), r = 150; sp.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); }
          const sg = own(new THREE.BufferGeometry()); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
          sky.add(new THREE.Points(sg, own(new THREE.PointsMaterial({ color: 0xe6e0ff, size: 1.7, sizeAttenuation: false, fog: false, transparent: true, opacity: .9 }))));
          const halo = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: glowT, color: 0x8f96ff, opacity: .5, fog: false, blending: THREE.AdditiveBlending, depthWrite: false })));
          halo.position.set(-60, 92, -72); halo.scale.setScalar(60); sky.add(halo);
          const moon = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: moonT, fog: false, depthWrite: false })));
          moon.position.set(-60, 92, -72); moon.scale.setScalar(16); sky.add(moon);
        }

        const fx = particles(THREE, own, 520, glowT, true); scene.add(fx.obj);

        const portal = new THREE.Group(); scene.add(portal);
        const ringM = own(new THREE.MeshStandardMaterial({ color: 0x2b2250, emissive: 0x6a4cff, emissiveIntensity: .5, roughness: .4, metalness: .3 }));
        const discM = own(new THREE.MeshBasicMaterial({ map: swirlT, color: 0x6a4cff, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
        const pRing = new THREE.Mesh(own(new THREE.TorusGeometry(1.2, .13, 10, 40)), ringM); pRing.position.y = 1.55; portal.add(pRing);
        const disc = new THREE.Mesh(own(new THREE.CircleGeometry(1.1, 40)), discM); disc.position.y = 1.55; portal.add(disc);
        const bxu = (sx, sy, sz) => {
          const g = new THREE.BoxGeometry(sx, sy, sz), p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
          for (let i = 0; i < p.count; i++) {
            const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
            uv.setXY(i, (ax > .5 ? p.getZ(i) : p.getX(i)) * .5, (ay > .5 ? p.getZ(i) : p.getY(i)) * .5);
          }
          return own(g);
        };
        const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; portal.add(m); return m; };
        for (const sx of [-1, 1]) {
          part(bxu(.72, .32, .72), stoneP, sx * 1.55, .16, 0); part(bxu(.46, 2.5, .46), stoneP, sx * 1.55, 1.57, 0); part(bxu(.68, .28, .68), stoneP, sx * 1.55, 3.0, 0);
        }
        part(bxu(3.7, .45, .62), stoneP, 0, 3.15, 0); part(bxu(4.1, .14, .82), stoneP, 0, 3.46, 0); part(bxu(.5, .6, .68), stoneP, 0, 3.17, .0);
        for (const x of [-1.6, -.8, 0, .8, 1.6]) part(bxu(.52, .24, .52), stoneP, x, 3.66, 0);
        part(own(new THREE.CylinderGeometry(1.7, 1.9, .14, 28)), stoneP, 0, .07, .35);
        const floorRing = part(own(new THREE.RingGeometry(1.3, 1.46, 40)), ringM, 0, .16, .35); floorRing.rotation.x = -Math.PI / 2; floorRing.castShadow = false;
        part(own(new THREE.TorusGeometry(1.46, .08, 8, 40)), stoneP, 0, 1.55, -.02);
        const runes = new THREE.Group(); runes.position.y = 1.55; portal.add(runes);
        { const rg = own(new THREE.BoxGeometry(.07, .15, .05)); for (let i = 0; i < 12; i++) { const r = new THREE.Mesh(rg, ringM), a = i / 12 * TAU; r.position.set(Math.cos(a) * 1.6, Math.sin(a) * 1.6, .04); r.rotation.z = a + Math.PI / 2; runes.add(r); } }
        const sockG = own(new THREE.CylinderGeometry(.16, .16, .06, 14).rotateX(Math.PI / 2));
        for (const x of [-.5, 0, .5]) part(sockG, ironM, x, 3.15, .31);
        const orbG = own(new THREE.SphereGeometry(.11, 12, 10));
        const orbOffM = own(new THREE.MeshStandardMaterial({ color: 0x3a3550, roughness: .4 }));
        const orbOnM = own(new THREE.MeshStandardMaterial({ color: 0xffc23d, emissive: 0xffa000, emissiveIntensity: 1.2 }));
        const orbs = [-.5, 0, .5].map(x => { const o = new THREE.Mesh(orbG, orbOffM); o.position.set(x, 3.15, .32); portal.add(o); return o; });

        const hud = el('div', 'hud', wrap, `<div class="pill"><span>Maze</span><b class="lv">1/3</b></div><div class="pill">${KEY_SVG.repeat(3)}</div><div class="pill"><span>Time</span><b class="tm">0.0 s</b></div>`);
        const lvEl = hud.querySelector('.lv'), tmEl = hud.querySelector('.tm'), keyEls = hud.querySelectorAll('.key');
        const MS = 170, dpr = Math.min(2, window.devicePixelRatio || 1), mapC = el('canvas', 'map', wrap), mctx = mapC.getContext('2d');
        mapC.width = mapC.height = MS * dpr;
        const mapBtn = el('button', 'mapbtn', wrap, 'Map');
        const msg = el('div', 'msg', wrap), hint = el('div', 'hint', wrap, 'Click the view for mouse-look');
        el('div', 'dot', wrap);
        const flashEl = el('div', 'flash', wrap);
        const pad = el('div', 'pad', wrap, `<button data-d="f" aria-label="Forward">${ARW('M6 15l6-6 6 6')}</button><button data-d="l" aria-label="Turn left">${ARW('M15 6l-6 6 6 6')}</button><button data-d="b" aria-label="Back">${ARW('M6 9l6 6 6-6')}</button><button data-d="r" aria-label="Turn right">${ARW('M9 6l6 6-6 6')}</button>`);
        const padS = { f: 0, b: 0, l: 0, r: 0 };

        let lv = null, level = 0, state = 'ready', times = [0, 0, 0], levelT = 0, keysGot = 0, mapOn = true, locked = false, touch = false;
        let time = 0, lightT = 0, lastSec = -1, lastTm = '', yaw = 0, pitch = 0, turnV = 0, vx = 0, vz = 0, bob = 0, bobAmp = 0, drag = null;
        const pos = { x: 0, z: 0 };

        function cellAt(x, z) { const n = lv.n; return clamp(Math.floor(z / P), 0, n - 1) * n + clamp(Math.floor(x / P), 0, n - 1); }
        function buildLevel(i) {
          if (lv) { scene.remove(lv.group); lv.geos.forEach(g => g.dispose()); }
          level = i; levelT = 0; keysGot = 0; fx.clear();
          const n = SIZES[i], m = mazeLayout(n, Math.random), group = new THREE.Group(), geos = [];
          const cx = c => (c % n) * P + T + S / 2, cz = c => ((c / n) | 0) * P + T + S / 2;
          const wg = wallGeometry(THREE, m); geos.push(wg);
          group.add(new THREE.Mesh(wg, wallM));
          const L = n * P + T, fg = new THREE.PlaneGeometry(L + 2, L + 2); geos.push(fg);
          flagT.repeat.set((L + 2) / 2, (L + 2) / 2);
          const floor = new THREE.Mesh(fg, floorM); floor.rotation.x = -Math.PI / 2; floor.position.set(L / 2, 0, L / 2); group.add(floor);

          const torches = [], want = Math.round(n * n * .24), used = new Set();
          for (const c of [0, ...shuffle([...Array(n * n).keys()])]) {
            if (torches.length >= want) break;
            if (used.has(c) || c === m.exit) continue;
            const x = c % n, y = (c / n) | 0, sides = D4.filter(([dx, dy]) => !m.open(x, y, dx, dy));
            if (!sides.length) continue;
            used.add(c);
            const [dx, dy] = sides[(Math.random() * sides.length) | 0];
            const tx = cx(c) + dx * (S / 2 - .05), tz = cz(c) + dy * (S / 2 - .05);
            const t = new THREE.Group(); t.position.set(tx, 2.15, tz); t.rotation.y = Math.atan2(-dx, -dy);
            t.add(new THREE.Mesh(G.torch, torchM));
            const fl = new THREE.Sprite(flameM); fl.position.set(0, .56, .4); t.add(fl);
            const mid = new THREE.Sprite(flameMidM); mid.position.set(0, .45, .39); mid.center.set(.5, .1); t.add(mid);
            const core = new THREE.Sprite(flameCoreM); core.position.set(0, .45, .39); core.center.set(.5, .1); t.add(core);
            group.add(t);
            torches.push({ c, fl, mid, core, x: tx - dx * .55, z: tz - dy * .55, fx: tx - dx * .25, fz: tz - dy * .25, ph: Math.random() * 20, s: 0 });
          }
          const keyObjs = m.keys.map(c => {
            const k = new THREE.Group(); k.position.set(cx(c), 1.1, cz(c));
            const kb = new THREE.Mesh(G.key, goldM), gem = new THREE.Mesh(G.gem, gemM); kb.rotation.z = gem.rotation.z = .45; k.add(kb, gem);
            const gl = new THREE.Sprite(keyGlowM); gl.scale.setScalar(1.5); k.add(gl);
            group.add(k);
            return { c, obj: k, got: false, x: cx(c), z: cz(c), ph: Math.random() * TAU };
          });
          const e = m.exit, [ox, oy] = D4.find(([dx, dy]) => m.open(e % n, (e / n) | 0, dx, dy));
          portal.position.set(cx(e) - ox * (S / 2 - .55), 0, cz(e) - oy * (S / 2 - .55));
          portal.rotation.y = Math.atan2(ox, oy);
          pLight.position.set(cx(e) - ox * .6, 1.8, cz(e) - oy * .6);
          ringM.emissive.setHex(0x6a4cff); ringM.emissiveIntensity = .5; discM.color.setHex(0x6a4cff); discM.opacity = .22; pLight.color.setHex(0x7b5cff); pLight.intensity = .9;
          orbs.forEach(o => { o.material = orbOffM; });
          const [sx, sy] = D4.find(([dx, dy]) => m.open(0, 0, dx, dy));
          pos.x = cx(0); pos.z = cz(0); yaw = Math.atan2(-sx, -sy); pitch = 0; vx = vz = 0; turnV = 0;
          scene.add(group);
          lv = { n, m, group, geos, torches, keyObjs, L, explored: new Uint8Array(n * n), dist: new Int16Array(n * n), lastCell: -1, ex: cx(e), ez: cz(e) };
          lv.explored[0] = 1;
          lvEl.textContent = `${i + 1}/3`;
          keyEls.forEach(k => k.classList.remove('on'));
          assignLights();
        }
        function bfsFrom(c) {
          const n = lv.n, d = lv.dist, m = lv.m, q = [c];
          d.fill(999); d[c] = 0;
          for (let i = 0; i < q.length; i++) {
            const u = q[i], x = u % n, y = (u / n) | 0;
            for (const [dx, dy] of D4) if (m.open(x, y, dx, dy)) { const v = u + dy * n + dx; if (d[v] === 999) { d[v] = d[u] + 1; q.push(v); } }
          }
        }
        function assignLights() {
          const c = cellAt(pos.x, pos.z);
          if (c !== lv.lastCell) { lv.lastCell = c; bfsFrom(c); }
          for (const t of lv.torches) t.s = lv.dist[t.c] * 5 + Math.hypot(t.x - pos.x, t.z - pos.z);
          const best = lv.torches.slice().sort((a, b) => a.s - b.s);
          lights.forEach((l, i) => { const t = best[i] && best[i].s < 32 ? best[i] : null; l.userData.t = t; if (t) l.position.set(t.x, 2.6, t.z); else l.intensity = 0; });
        }
        const flick = (ph, t) => .82 + .1 * Math.sin(t * 11 + ph) + .08 * Math.sin(t * 23.7 + ph * 3.1);
        function burst(x, y, z, hex, n, sp) {
          const [r, g, b] = hexRGB(hex);
          for (let i = 0; i < n; i++) { const a = Math.random() * TAU, u = rnd(-1, 1), v = rnd(.5, 1) * sp, q = Math.sqrt(1 - u * u); fx.emit(x, y, z, Math.cos(a) * q * v, u * v + 1, Math.sin(a) * q * v, rnd(.5, 1.1), r, g, b, rnd(.12, .22), .02, 1, 2.5, 2); }
        }
        function say(t) { msg.textContent = t; msg.classList.remove('show'); void msg.offsetWidth; msg.classList.add('show'); }
        const total = () => times.slice(0, level).reduce((a, b) => a + b, 0) + levelT;
        function unlock() { if (locked && document.exitPointerLock) document.exitPointerLock(); }
        function collect(k) {
          k.got = true; lv.group.remove(k.obj); keysGot++;
          api.sfx('good'); burst(k.x, 1.1, k.z, 0xffc23d, 46, 3);
          keyEls[keysGot - 1].classList.add('on'); orbs[keysGot - 1].material = orbOnM;
          if (keysGot === 3) {
            ringM.emissive.setHex(0x3fe0ff); ringM.emissiveIntensity = 1.5; discM.color.setHex(0x52e6ff); discM.opacity = .95; pLight.color.setHex(0x52e6ff); pLight.intensity = 2.2;
            api.sfx('pop'); say('Portal unlocked! Find the exit');
          } else say(`Key ${keysGot} of 3`);
        }
        function levelDone() {
          state = 'between'; times[level] = levelT; unlock(); api.sfx('win');
          flashEl.classList.remove('on'); void flashEl.offsetWidth; flashEl.classList.add('on');
          if (level < 2) {
            api.overlay({
              kicker: `Maze ${level + 1} of 3 cleared`, title: 'Escaped!',
              text: `Next up: a bigger ${SIZES[level + 1]} × ${SIZES[level + 1]} maze. Keys hide in dead ends.`,
              stats: [['This maze', fmtS(levelT)], ['Total', fmtS(total())]],
              button: 'Next maze', onAction: () => { buildLevel(level + 1); state = 'play'; say('Find 3 keys'); }
            });
          } else {
            const sc = Math.max(1, Math.round(total())), isBest = api.submit(sc);
            api.score(sc);
            api.overlay({
              kicker: isBest ? 'New best!' : 'You escaped', title: 'Maze master', text: 'All three mazes cleared. Can you find the keys faster?',
              stats: [['Total', sc + ' s'], ['Maze 1', fmtS(times[0])], ['Maze 2', fmtS(times[1])], ['Maze 3', fmtS(times[2])]],
              button: 'Play again', onAction: () => { times = [0, 0, 0]; lastSec = -1; buildLevel(0); state = 'play'; say('Find 3 keys'); }
            });
          }
        }

        function setTouch() { if (touch) return; touch = true; wrap.classList.add('touch'); hint.textContent = 'Drag the view to look around'; }
        if (window.matchMedia && matchMedia('(pointer: coarse)').matches) setTouch();
        function look(dx, dy) { if (state !== 'play') return; yaw -= dx * .0023; pitch = clamp(pitch - dy * .0023, -1.1, 1.1); }
        function toggleMap() { mapOn = !mapOn; mapC.hidden = !mapOn; mapBtn.textContent = mapOn ? 'Map' : 'Map off'; api.sfx('tick'); }
        pad.querySelectorAll('button').forEach(b => {
          const d = b.dataset.d, off = () => { padS[d] = 0; b.classList.remove('on'); };
          api.on(b, 'pointerdown', e => { e.preventDefault(); setTouch(); padS[d] = 1; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (er) {   } });
          api.on(b, 'pointerup', off); api.on(b, 'pointercancel', off); api.on(b, 'lostpointercapture', off);
        });
        api.on(mapBtn, 'pointerdown', e => { e.preventDefault(); toggleMap(); });
        api.on(window, 'keydown', e => { if (e.code === 'KeyM' && !e.repeat) toggleMap(); });
        api.on(canvas, 'pointerdown', e => {
          if (e.pointerType === 'touch') setTouch();
          else if (state === 'play' && !locked && canvas.requestPointerLock) {
            try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (er) {   }
          }
          drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
        });
        api.on(window, 'pointermove', e => {
          if (locked) { look(e.movementX || 0, e.movementY || 0); return; }
          if (drag && e.pointerId === drag.id) { const k = e.pointerType === 'touch' ? 1.5 : 1; look((e.clientX - drag.x) * k, (e.clientY - drag.y) * k); drag.x = e.clientX; drag.y = e.clientY; }
        });
        const endDrag = e => { if (drag && e.pointerId === drag.id) drag = null; };
        api.on(window, 'pointerup', endDrag); api.on(window, 'pointercancel', endDrag);
        api.on(document, 'pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
        api.on(document, 'pointerlockerror', () => { hint.textContent = 'Drag the view to look around'; });

        function move(dt) {
          const k = c => keys.has(c);
          const fwd = (k('KeyW') || k('ArrowUp') || padS.f ? 1 : 0) - (k('KeyS') || k('ArrowDown') || padS.b ? 1 : 0);
          let turn = (k('ArrowRight') || padS.r ? 1 : 0) - (k('ArrowLeft') || padS.l ? 1 : 0), strafe = (k('KeyE') ? 1 : 0) - (k('KeyQ') ? 1 : 0);
          const ad = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0);
          if (locked) strafe += ad; else turn += ad;
          turnV = damp(turnV, clamp(turn, -1, 1) * 2.5, 16, dt); yaw -= turnV * dt;
          strafe = clamp(strafe, -1, 1);
          const sx = -Math.sin(yaw), sz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
          let mx = sx * fwd + rx * strafe, mz = sz * fwd + rz * strafe;
          const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
          vx = damp(vx, mx * 4.6, 13, dt); vz = damp(vz, mz * 4.6, 13, dt);
          const ox = pos.x, oz = pos.z;
          pos.x += vx * dt; pos.z += vz * dt; mazeCollide(lv.m, pos);
          const moved = Math.hypot(pos.x - ox, pos.z - oz);
          bob += moved * 1.5; bobAmp = damp(bobAmp, dt > 0 && moved / dt > .6 ? 1 : 0, 8, dt);
          lv.explored[cellAt(pos.x, pos.z)] = 1;
          for (const kk of lv.keyObjs) if (!kk.got && Math.hypot(kk.x - pos.x, kk.z - pos.z) < 1.05) collect(kk);
          if (keysGot === 3 && Math.hypot(portal.position.x - pos.x, portal.position.z - pos.z) < 1.6) levelDone();
        }

        function drawMap() {
          const g = mctx, n = lv.n, m = lv.m, ex = lv.explored, pd = 9, sc = (MS - pd * 2) / lv.L, X = v => pd + v * sc;
          g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, MS, MS);
          g.fillStyle = 'rgba(255,205,140,.3)';
          for (let c = 0; c < n * n; c++) {
            if (!ex[c]) continue;
            const x = c % n, y = (c / n) | 0, x0 = x * P + T, z0 = y * P + T;
            g.fillRect(X(x0), X(z0), S * sc, S * sc);
            if (m.open(x, y, 1, 0)) g.fillRect(X(x0 + S), X(z0), T * sc, S * sc);
            if (m.open(x, y, 0, 1)) g.fillRect(X(x0), X(z0 + S), S * sc, T * sc);
            if (m.open(x, y, -1, 0) && !ex[c - 1]) g.fillRect(X(x0 - T), X(z0), T * sc, S * sc);
            if (m.open(x, y, 0, -1) && !ex[c - n]) g.fillRect(X(x0), X(z0 - T), S * sc, T * sc);
          }
          g.strokeStyle = 'rgba(255,255,255,.88)'; g.lineWidth = n > 11 ? 1.6 : 2; g.lineCap = 'round'; g.beginPath();
          for (let c = 0; c < n * n; c++) {
            if (!ex[c]) continue;
            const x = c % n, y = (c / n) | 0, x0 = x * P + T / 2, z0 = y * P + T / 2, x1 = x0 + P, z1 = z0 + P;
            if (!m.open(x, y, 1, 0)) { g.moveTo(X(x1), X(z0)); g.lineTo(X(x1), X(z1)); }
            if (!m.open(x, y, -1, 0)) { g.moveTo(X(x0), X(z0)); g.lineTo(X(x0), X(z1)); }
            if (!m.open(x, y, 0, 1)) { g.moveTo(X(x0), X(z1)); g.lineTo(X(x1), X(z1)); }
            if (!m.open(x, y, 0, -1)) { g.moveTo(X(x0), X(z0)); g.lineTo(X(x1), X(z0)); }
          }
          g.stroke();
          for (const k of lv.keyObjs) if (!k.got && ex[k.c]) { g.fillStyle = '#ffc23d'; g.beginPath(); g.arc(X(k.x), X(k.z), 3.6, 0, TAU); g.fill(); }
          if (ex[m.exit]) { g.strokeStyle = keysGot === 3 ? '#52e6ff' : '#8f7bff'; g.lineWidth = 2.5; g.beginPath(); g.arc(X(lv.ex), X(lv.ez), 4.5, 0, TAU); g.stroke(); }
          g.save(); g.translate(X(pos.x), X(pos.z)); g.rotate(-yaw);
          const fov = g.createRadialGradient(0, 0, 0, 0, 0, 22); fov.addColorStop(0, 'rgba(255,255,255,.35)'); fov.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = fov; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 22, -Math.PI / 2 - .6, -Math.PI / 2 + .6); g.closePath(); g.fill();
          g.fillStyle = '#fff'; g.strokeStyle = '#6c5ce7'; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(0, -6); g.lineTo(4.5, 4.5); g.lineTo(0, 2.5); g.lineTo(-4.5, 4.5); g.closePath(); g.fill(); g.stroke();
          g.restore();
        }

        function animate(dt) {
          lightT -= dt;
          if (lightT <= 0) { lightT = .15; assignLights(); }
          for (const t of lv.torches) {
            const f = flick(t.ph, time), w = Math.sin(time * 9 + t.ph * 2);
            t.fl.scale.set(1.9 * f, 2.2 * f, 1);
            t.mid.scale.set(.5 * (.92 + .1 * Math.sin(time * 17 + t.ph)), .98 * f + .08 * w, 1); t.mid.position.x = Math.sin(time * 7 + t.ph) * .014;
            t.core.scale.set(.27 * f, .62 * f + .05 * w, 1);
          }
          for (const l of lights) {
            const t = l.userData.t;
            if (!t) continue;
            l.intensity = 2.8 * flick(t.ph, time);
            if (Math.random() < dt * 6) fx.emit(t.fx + rnd(-.05, .05), 2.62, t.fz + rnd(-.05, .05), rnd(-.25, .25), rnd(.5, 1.1), rnd(-.25, .25), rnd(.7, 1.4), 1, rnd(.45, .7), .15, .08, .02, 1, -.15, .4);
          }
          for (const k of lv.keyObjs) {
            if (k.got) continue;
            k.obj.rotation.y += dt * 1.8; k.obj.position.y = 1.1 + Math.sin(time * 2.2 + k.ph) * .12;
            if (Math.random() < dt * 5) fx.emit(k.x + rnd(-.3, .3), .7 + Math.random() * .9, k.z + rnd(-.3, .3), 0, rnd(.2, .5), 0, rnd(.6, 1.1), 1, .8, .3, .1, .02, 1);
          }
          const open = keysGot === 3;
          disc.rotation.z -= dt * (open ? 2.4 : .5); runes.rotation.z += dt * (open ? .9 : .15);
          ringM.emissiveIntensity = (open ? 1.4 : .45) + Math.sin(time * 3) * (open ? .35 : .12);
          pLight.intensity = (open ? 2.2 : .8) + Math.sin(time * 3) * .25;
          if (Math.random() < dt * (open ? 40 : 5)) {
            const a = Math.random() * TAU, ry = portal.rotation.y, lx = Math.cos(a) * 1.2, ly = 1.55 + Math.sin(a) * 1.2;
            const [r, g, b] = open ? [.35, .9, 1] : [.5, .4, 1];
            fx.emit(portal.position.x + lx * Math.cos(ry), ly, portal.position.z - lx * Math.sin(ry), -Math.cos(a) * Math.cos(ry) * .9, -Math.sin(a) * .9, Math.cos(a) * Math.sin(ry) * .9, rnd(.8, 1.3), r, g, b, .14, .02, 1);
          }
          fx.mat.uniforms.scale.value = h * renderer.getPixelRatio() / (2 * Math.tan(cam.fov * Math.PI / 360));
          fx.update(dt);
        }

        buildLevel(0);
        api.score(0);
        api.overlay({
          kicker: '3D', title: 'Maze Escape 3D',
          text: 'Find the 3 golden keys hidden in dead ends, then step through the glowing portal. Three mazes, each bigger than the last. Lowest total time wins.',
          button: 'Play', onAction: () => { state = 'play'; say('Find 3 keys'); }
        });

        api.loop(dt => {
          time += dt;
          if (state === 'play') { levelT += dt; move(dt); }
          else { vx = vz = 0; bobAmp = damp(bobAmp, 0, 8, dt); }
          animate(dt);
          cam.position.set(pos.x, EYE - Math.abs(Math.sin(bob)) * .07 * bobAmp + .035 * bobAmp, pos.z);
          cam.rotation.set(pitch, yaw, Math.sin(bob) * .008 * bobAmp);
          lantern.position.copy(cam.position); sky.position.copy(cam.position);
          const tt = fmtS(total());
          if (tt !== lastTm) { lastTm = tt; tmEl.textContent = tt; }
          const sec = Math.floor(total());
          if (state === 'play' && sec !== lastSec) { lastSec = sec; api.score(sec); }
          const hv = locked || touch || state !== 'play';
          if (hint.hidden !== hv) hint.hidden = hv;
          if (mapOn) drawMap();
          renderer.render(scene, cam);
        });

        return () => {
          if (document.pointerLockElement === canvas && document.exitPointerLock) document.exitPointerLock();
          if (lv) lv.geos.forEach(g => g.dispose());
          K.dispose();
        };
      }
    }
  });

  const DX8 = [1, -1, 0, 0, 1, 1, -1, -1], DZ8 = [0, 0, 1, -1, 1, -1, 1, -1];
  function segHit(ax, az, bx, bz, o, pad) {
    let t0 = 0, t1 = 1;
    const dx = bx - ax, dz = bz - az;
    if (Math.abs(dx) < 1e-9) { if (ax < o.x0 - pad || ax > o.x1 + pad) return false; }
    else { let a = (o.x0 - pad - ax) / dx, b = (o.x1 + pad - ax) / dx; if (a > b) { const q = a; a = b; b = q; } if (a > t0) t0 = a; if (b < t1) t1 = b; if (t0 > t1) return false; }
    if (Math.abs(dz) < 1e-9) { if (az < o.z0 - pad || az > o.z1 + pad) return false; }
    else { let a = (o.z0 - pad - az) / dz, b = (o.z1 + pad - az) / dz; if (a > b) { const q = a; a = b; b = q; } if (a > t0) t0 = a; if (b < t1) t1 = b; if (t0 > t1) return false; }
    return true;
  }
  function makeGrid(AX, AZ, R) {
    const GW = AX * 2, GD = AZ * 2, N = GW * GD, blocked = new Uint8Array(N), prev = new Int32Array(N), queue = new Int32Array(N);
    const cellOf = (x, z) => Math.min(GD - 1, Math.max(0, Math.floor(z + AZ))) * GW + Math.min(GW - 1, Math.max(0, Math.floor(x + AX)));
    return {
      blocked, cellOf,
      rebuild(obs) {
        for (let j = 0; j < GD; j++) for (let i = 0; i < GW; i++) {
          const x = -AX + i + .5, z = -AZ + j + .5;
          let b = 0;
          for (const o of obs) { const qx = clamp(x, o.x0, o.x1), qz = clamp(z, o.z0, o.z1); if ((x - qx) ** 2 + (z - qz) ** 2 < R * R) { b = 1; break; } }
          blocked[j * GW + i] = b;
        }
      },
      free(x, z) { return x > -AX && x < AX && z > -AZ && z < AZ && !blocked[cellOf(x, z)]; },
      line(ax, az, bx, bz) {
        const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / .5);
        for (let i = 1; i <= n; i++) { const t = i / n; if (t * d < .6) continue; if (blocked[cellOf(ax + (bx - ax) * t, az + (bz - az) * t)]) return false; }
        return true;
      },
      path(fx, fz, tx, tz) {
        const s = cellOf(fx, fz);
        let t = cellOf(tx, tz), qh = 0, qt = 0, found = false, bestC = s, bestD = 1e9;
        const tgx = t % GW, tgz = (t / GW) | 0;
        const esc = blocked[s] === 1;
        prev.fill(-1); prev[s] = s; queue[qt++] = s;
        while (qh < qt) {
          const c = queue[qh++];
          if (c === t) { found = true; break; }
          const cx = c % GW, cz = (c / GW) | 0, dd = (cx - tgx) ** 2 + (cz - tgz) ** 2;
          if (dd < bestD) { bestD = dd; bestC = c; }
          for (let k = 0; k < 8; k++) {
            const dx = DX8[k], dz = DZ8[k], nx = cx + dx, nz = cz + dz;
            if (nx < 0 || nz < 0 || nx >= GW || nz >= GD) continue;
            const nc = nz * GW + nx;
            if (prev[nc] !== -1 || (blocked[nc] && nc !== t && !(esc && c === s))) continue;
            if (dx && dz && !(esc && c === s) && (blocked[cz * GW + nx] || blocked[nz * GW + cx])) continue;
            prev[nc] = c; queue[qt++] = nc;
          }
        }
        if (!found) t = bestC;
        const out = [];
        for (let c = t; c !== s; c = prev[c]) out.push({ x: -AX + (c % GW) + .5, z: -AZ + ((c / GW) | 0) + .5 });
        return out.reverse();
      }
    };
  }

  const TK = {
    player: { speed: 6.4, turn: 2.8, r: 1.0, hp: 100, shell: 22, dmg: 1, scale: 1, color: 0x2fbf71, dark: 0x1d3b2a },
    scout: { speed: 6.8, turn: 3.4, r: .85, hp: 2, cd: 1.15, shell: 16, dmg: 10, lead: .55, aimRate: 4.5, cover: .12, scale: .82, pts: 100, range: 13, color: 0xffa726, dark: 0x5a3a12 },
    grunt: { speed: 4.4, turn: 2.4, r: 1.0, hp: 3, cd: 1.7, shell: 15, dmg: 15, lead: .85, aimRate: 2.8, cover: .3, scale: 1, pts: 150, range: 15, color: 0xef5350, dark: 0x4a1414 },
    heavy: { speed: 2.9, turn: 1.6, r: 1.25, hp: 7, cd: 2.4, shell: 13, dmg: 26, lead: 1, aimRate: 1.9, cover: .05, scale: 1.25, pts: 300, range: 17, color: 0x8e6ad8, dark: 0x2a1a4a }
  };
  const LAYOUT = [
    [0, 0, 2.4, 2.4, 'steel'],
    [-9, -5, 6, 1.2, 'stone'], [9, 5, 6, 1.2, 'stone'],
    [-9, 5, 1.2, 1.2, 'steel'], [9, -5, 1.2, 1.2, 'steel'],
    [-15, 0, 1.2, 6, 'stone'], [15, 0, 1.2, 6, 'stone'],
    [-4, -10, 1.2, 4, 'stone'], [4, 10, 1.2, 4, 'stone'],
    [4, -9, 2.4, 1.2, 'steel'], [-4, 9, 2.4, 1.2, 'steel'],
    [-17, -10, 2.4, 2.4, 'steel'], [17, 10, 2.4, 2.4, 'steel']
  ];
  const SPAWNS = [[-19.5, -12.5], [19.5, -12.5], [0, -12.5], [-19.5, 0], [19.5, 0], [-19.5, 12.5], [19.5, 12.5], [-10, -12.5], [10, -12.5]];

  Ameplay.register({
    id: 'tanks-3d',
    title: 'Tank Arena',
    category: '3D',
    blurb: 'Drive, aim and blast enemy tanks in a walled arena, wave after wave.',
    help: '<kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> drive · mouse aims · click or <kbd>Space</kbd> fires · touch: left stick drives, tap to shoot',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="38" width="48" height="14" rx="7"/><circle cx="17" cy="45" r="2.5"/><circle cx="32" cy="45" r="2.5"/><circle cx="47" cy="45" r="2.5"/><path d="M14 38l4-8h26l4 8"/><path d="M24 30v-6h14v6"/><path d="M38 26h20"/></svg>',
    css: `
.gm-tanks-3d [hidden]{display:none!important}
.gm-tanks-3d .wrap{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:#bfe3ff;box-shadow:0 22px 50px -30px rgba(31,29,43,.7)}
.gm-tanks-3d .wrap>.g-canvas{display:block;width:100%;border-radius:0;cursor:crosshair;background:#bfe3ff}
.gm-tanks-3d .hud{position:absolute;left:12px;top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;pointer-events:none}
.gm-tanks-3d .pill{display:flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:999px;background:rgba(24,28,40,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);color:#fff;font:800 14px/1 var(--sans);font-variant-numeric:tabular-nums}
.gm-tanks-3d .pill span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.75}
.gm-tanks-3d .hp{width:130px;height:12px;border-radius:99px;background:rgba(0,0,0,.35);overflow:hidden}
.gm-tanks-3d .hp i{display:block;height:100%;width:100%;border-radius:inherit;background:linear-gradient(90deg,#22b07d,#7be0a6);transform-origin:left;transition:transform .25s}
.gm-tanks-3d .hp.low i{background:linear-gradient(90deg,#ef4f4f,#ff9a7a)}
.gm-tanks-3d .pups{position:absolute;right:12px;top:12px;display:flex;gap:6px;pointer-events:none}
.gm-tanks-3d .chip{display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;color:#fff;font:900 13px/1 var(--sans);box-shadow:0 6px 16px -8px rgba(0,0,0,.5)}
.gm-tanks-3d .chip.rapid{background:linear-gradient(#ffc23d,#e8790c)}
.gm-tanks-3d .chip.shield{background:linear-gradient(#62b0ff,#2f63e0)}
.gm-tanks-3d .banner{position:absolute;left:0;right:0;top:30%;text-align:center;color:#fff;font:900 46px/1.05 var(--sans);letter-spacing:-.03em;text-shadow:0 4px 0 rgba(0,0,0,.12),0 6px 26px rgba(0,0,0,.35);opacity:0;pointer-events:none}
.gm-tanks-3d .banner small{display:block;font-size:20px;letter-spacing:0;margin-top:6px;color:#ffe08a}
.gm-tanks-3d .banner.show{animation:gm-tanks-3d-ban 2.3s var(--ease) both}
@keyframes gm-tanks-3d-ban{0%{opacity:0;transform:scale(.7)}14%{opacity:1;transform:scale(1.06)}24%{transform:none}78%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
.gm-tanks-3d .hurt{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 90px 14px rgba(239,79,79,.85);opacity:0}
.gm-tanks-3d .hurt.on{animation:gm-tanks-3d-hurt .5s ease-out}
@keyframes gm-tanks-3d-hurt{0%{opacity:1}100%{opacity:0}}
.gm-tanks-3d .joy{position:absolute;width:112px;height:112px;margin:-56px 0 0 -56px;border-radius:50%;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 2px rgba(255,255,255,.55);pointer-events:none}
.gm-tanks-3d .joy i{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px;border-radius:50%;background:rgba(255,255,255,.9);box-shadow:0 4px 12px rgba(0,0,0,.25)}
.gm-tanks-3d .tip{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);padding:9px 15px;border-radius:999px;background:rgba(24,28,40,.5);color:#fff;font:700 13px/1 var(--sans);white-space:nowrap;pointer-events:none}
.gm-tanks-3d .float{position:absolute;transform:translate(-50%,-50%);color:#fff;font:900 20px/1 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.45),0 0 3px rgba(0,0,0,.7),0 0 14px rgba(0,0,0,.35);pointer-events:none;animation:gm-tanks-3d-float .9s ease-out both}
@keyframes gm-tanks-3d-float{0%{opacity:0;margin-top:6px}15%{opacity:1}100%{opacity:0;margin-top:-40px}}
@media (max-width:640px){
.gm-tanks-3d .hud{left:8px;top:8px;gap:5px}
.gm-tanks-3d .pill{height:26px;padding:0 9px;font-size:12px;gap:5px}
.gm-tanks-3d .pill span{display:none}
.gm-tanks-3d .hp{width:60px;height:9px}
.gm-tanks-3d .pups{right:8px;top:8px}
.gm-tanks-3d .chip{height:24px;padding:0 8px;font-size:11px}
.gm-tanks-3d .banner{font-size:26px}
.gm-tanks-3d .banner small{font-size:13px}
.gm-tanks-3d .tip{display:none}
.gm-tanks-3d .joy{width:84px;height:84px;margin:-42px 0 0 -42px}
.gm-tanks-3d .joy i{width:36px;height:36px;margin:-18px}
}`,
    mount(root, api) {
      const keys = api.keys;
      const wrap = el('div', 'wrap', root);
      let cleanup = null;
      api.gl(960, 600).then(v => { if (v && api.alive) cleanup = run(v); }, () => { if (api.alive) api.overlay(NO_GL); });
      return { destroy() { if (cleanup) cleanup(); } };

      function run({ THREE, renderer, canvas, w, h, toLocal }) {
        const K = kit(THREE, renderer, wrap, canvas), own = K.own, tex = K.tex;
        const AX = 22, AZ = 15, PSPAWN = { x: 0, z: 12 };

        const scene = new THREE.Scene(), SKY = 0xbfe3ff;
        scene.background = new THREE.Color(SKY);
        scene.fog = new THREE.Fog(SKY, 55, 120);
        const cam = new THREE.PerspectiveCamera(46, w / h, .5, 240);
        scene.add(new THREE.HemisphereLight(0xe2f1ff, 0x7a6440, .62));
        const sun = new THREE.DirectionalLight(0xfff0d6, 1.15);
        sun.position.set(-14, 30, 12); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
        Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 26, bottom: -26, near: 1, far: 90 });
        sun.shadow.camera.updateProjectionMatrix();
        sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
        scene.add(sun, sun.target);
        const flash = new THREE.PointLight(0xffa040, 0, 20, 2); scene.add(flash);

        const sandT = tex(256, paintSand), grassT = tex(256, paintGrass), stoneT = tex(256, stonePainter(58, 22)), metalT = tex(128, paintMetal), crateT = tex(256, paintCrate), crateDmgT = tex(256, (g, q) => paintCrate(g, q, true));
        const treadT = tex(128, paintTread), glowT = tex(64, paintGlow), scorchT = tex(128, paintScorch), flameT = tex(64, paintFlame);
        sandT.repeat.set(AX / 2, AZ / 2); grassT.repeat.set(36, 36); treadT.repeat.set(1, 1);

        const grass = new THREE.Mesh(own(new THREE.PlaneGeometry(170, 170)), own(new THREE.MeshStandardMaterial({ map: grassT, roughness: 1 })));
        grass.rotation.x = -Math.PI / 2; grass.position.y = -.02; grass.receiveShadow = true; scene.add(grass);
        const floor = new THREE.Mesh(own(new THREE.PlaneGeometry(AX * 2, AZ * 2)), own(new THREE.MeshStandardMaterial({ map: sandT, roughness: .95 })));
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
        {
          const mc = document.createElement('canvas'); mc.width = 1408; mc.height = 960;
          paintMarks(mc.getContext('2d'), mc.width, mc.height, SPAWNS, PSPAWN);
          const mt = own(new THREE.CanvasTexture(mc)); mt.encoding = THREE.sRGBEncoding; mt.anisotropy = 4;
          const marks = new THREE.Mesh(own(new THREE.PlaneGeometry(AX * 2, AZ * 2)), own(new THREE.MeshStandardMaterial({ map: mt, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
          marks.rotation.x = -Math.PI / 2; marks.position.y = .012; marks.receiveShadow = true; scene.add(marks);
        }
        {
          const NT = 54, trunkM = own(new THREE.MeshStandardMaterial({ color: 0x7a5232, roughness: .9, flatShading: true })), crownM = own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8, flatShading: true }));
          const trunks = new THREE.InstancedMesh(own(new THREE.CylinderGeometry(.25, .35, 1.6, 6)), trunkM, NT), crowns = new THREE.InstancedMesh(own(new THREE.ConeGeometry(1.6, 3.2, 7)), crownM, NT * 2);
          const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
          for (let i = 0; i < NT; i++) {
            let x, z;
            do { x = rnd(-50, 50); z = rnd(-40, 34); } while (Math.abs(x) < AX + 3.5 && Math.abs(z) < AZ + 3.5);
            const s = rnd(.8, 1.45);
            q.setFromAxisAngle(up, rnd(0, TAU));
            trunks.setMatrixAt(i, mt.compose(pv.set(x, .8 * s, z), q, sv.set(s, s, s)));
            crowns.setMatrixAt(i * 2, mt.compose(pv.set(x, 2.9 * s, z), q, sv.set(s, s, s)));
            crowns.setMatrixAt(i * 2 + 1, mt.compose(pv.set(x, 4.1 * s, z), q, sv.set(s * .72, s * .72, s * .72)));
            if (crowns.setColorAt) { col.setHSL(rnd(.26, .36), rnd(.45, .6), rnd(.32, .42)); crowns.setColorAt(i * 2, col); crowns.setColorAt(i * 2 + 1, col.offsetHSL(0, 0, .06)); }
          }
          trunks.castShadow = crowns.castShadow = true;
          scene.add(trunks, crowns);
        }

        const GK = geoKit(THREE), { acc, side, top, rbox, tint } = GK;
        const cc = hex => new THREE.Color(hex);
        const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
        const cylX = (A, r, len, x, y, z, c) => A.add(CYL, x, y, z, 0, 0, Math.PI / 2, r, len, r, c);
        const cylZ = (A, r, len, x, y, z, c) => A.add(CYL, x, y, z, Math.PI / 2, 0, 0, r, len, r, c);
        const cylY = (A, r, len, x, y, z, c) => A.add(CYL, x, y, z, 0, 0, 0, r, len, r, c);
        const ST = { dk: cc('#2c2c34'), md: cc('#5a5a66'), lt: cc('#9a9aa8'), hi: cc('#d6d6e2'), gd: cc('#caa24a') };
        const sg = (v) => cc(0xffffff).multiplyScalar(v);
        const gunM = own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .45, metalness: .55, vertexColors: true }));
        function trimGeo(kind, sx, hh, sz) {
          const A = acc(), t = hh / 2;
          if (kind === 'stone') {
            A.box(sx + .1, .14, sz + .1, 0, t + .07, 0).box(sx + .13, .3, sz + .13, 0, -t + .15, 0);
            const alongX = sx >= sz, L = alongX ? sx : sz, wd = (alongX ? sz : sx) * .8, n = Math.max(1, Math.floor(L / 1.3));
            for (let i = 0; i < n; i++) {
              const p = -L / 2 + (i + .5) * L / n;
              if (alongX) A.box(L / n * .56, .34, wd, p, t + .31, 0); else A.box(wd, .34, L / n * .56, 0, t + .31, p);
            }
            return A.build(.5);
          }
          for (const sy of [-1, 1]) for (const sz2 of [-1, 1]) A.box(sx + .1, .1, .1, 0, sy * (t - .05), sz2 * sz / 2, ST.dk);
          for (const sy of [-1, 1]) for (const sx2 of [-1, 1]) A.box(.1, .1, sz + .1, sx2 * sx / 2, sy * (t - .05), 0, ST.dk);
          for (const sx2 of [-1, 1]) for (const sz2 of [-1, 1]) {
            A.box(.12, hh, .12, sx2 * sx / 2, 0, sz2 * sz / 2, ST.dk);
            A.box(.14, .34, .14, sx2 * sx / 2, -t + .4, sz2 * sz / 2, cc('#e2b43a'));
            for (const sy of [-1, 1]) A.box(.07, .07, .07, sx2 * (sx / 2 - .2), sy * (t - .02), sz2 * (sz / 2 + .04), ST.hi);
          }
          return A.build();
        }
        const stoneM = own(new THREE.MeshStandardMaterial({ map: stoneT, bumpMap: stoneT, bumpScale: .04, roughness: .9 }));
        const steelM = own(new THREE.MeshStandardMaterial({ map: metalT, color: 0x9aa8bd, roughness: .45, metalness: .35 }));
        const crateG = own(rbox(1.6, 1.6, 1.6, .09, 3)), crateM = own(new THREE.MeshStandardMaterial({ map: crateT, bumpMap: crateT, bumpScale: .5, roughness: .85 })), crateHurtM = own(new THREE.MeshStandardMaterial({ map: crateDmgT, bumpMap: crateDmgT, bumpScale: .6, roughness: .95 }));
        const crateFrameG = own((() => {
          const A = acc(), h = .8, wc = cc('#80502a'), mc = cc('#565b69');
          for (const sy of [-1, 1]) for (const sz of [-1, 1]) A.box(1.6, .1, .1, 0, sy * h, sz * h, wc);
          for (const sy of [-1, 1]) for (const sx of [-1, 1]) A.box(.1, .1, 1.6, sx * h, sy * h, 0, wc);
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) A.box(.1, 1.6, .1, sx * h, 0, sz * h, wc);
          for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) A.box(.2, .2, .2, sx * h, sy * h, sz * h, mc);
          return A.build();
        })());
        function boxUV(sx, sy, sz) {
          const g = new THREE.BoxGeometry(sx, sy, sz), p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
          for (let i = 0; i < p.count; i++) {
            const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
            uv.setXY(i, (nx > .5 ? p.getZ(i) : p.getX(i)) * .5, (ny > .5 ? p.getZ(i) : p.getY(i)) * .5);
          }
          return own(g);
        }
        const obstacles = [], grid = makeGrid(AX, AZ, 1.1);
        let gridDirty = true;
        function addBlock(cx, cz, sx, sz, kind) {
          const hh = kind === 'steel' ? 1.5 : 1.8, m = new THREE.Mesh(boxUV(sx, hh, sz), kind === 'steel' ? steelM : stoneM);
          m.position.set(cx, hh / 2, cz); m.castShadow = m.receiveShadow = true; scene.add(m);
          const tm = new THREE.Mesh(own(trimGeo(kind, sx, hh, sz)), kind === 'steel' ? gunM : stoneM); tm.castShadow = tm.receiveShadow = true; m.add(tm);
          obstacles.push({ x0: cx - sx / 2, x1: cx + sx / 2, z0: cz - sz / 2, z1: cz + sz / 2, kind, mesh: m });
        }
        addBlock(0, -AZ - .6, AX * 2 + 2.4, 1.2, 'stone'); addBlock(0, AZ + .6, AX * 2 + 2.4, 1.2, 'stone');
        addBlock(-AX - .6, 0, 1.2, AZ * 2, 'stone'); addBlock(AX + .6, 0, 1.2, AZ * 2, 'stone');
        LAYOUT.forEach(b => addBlock(...b));
        function addCrate(x, z) {
          const m = new THREE.Mesh(crateG, crateM); m.position.set(x, .8, z); m.castShadow = m.receiveShadow = true; scene.add(m);
          const fm = new THREE.Mesh(crateFrameG, gunM); fm.castShadow = true; m.add(fm);
          obstacles.push({ x0: x - .8, x1: x + .8, z0: z - .8, z1: z + .8, kind: 'crate', hp: 2, mesh: m });
          gridDirty = true;
        }
        function removeObstacle(o) { scene.remove(o.mesh); obstacles.splice(obstacles.indexOf(o), 1); gridDirty = true; }
        function placeCrates(n) {
          for (let tries = 0; n > 0 && tries < 500; tries++) {
            const x = Math.round(rnd(-AX + 2, AX - 2) / 2) * 2, z = Math.round(rnd(-AZ + 2, AZ - 2) / 2) * 2;
            if (Math.hypot(x - PSPAWN.x, z - PSPAWN.z) < 4 || SPAWNS.some(s => Math.hypot(x - s[0], z - s[1]) < 3.5)) continue;
            if (allTanks().some(t => Math.hypot(x - t.x, z - t.z) < 2.8)) continue;
            if (obstacles.some(o => x + 1.6 > o.x0 && x - 1.6 < o.x1 && z + 1.6 > o.z0 && z - 1.6 < o.z1)) continue;
            addCrate(x, z); n--;
          }
        }
        const crateCount = () => obstacles.reduce((s, o) => s + (o.kind === 'crate' ? 1 : 0), 0);
        const syncGrid = () => { if (gridDirty) { grid.rebuild(obstacles); gridDirty = false; } };
        const losClear = (ax, az, bx, bz) => { for (const o of obstacles) if (segHit(ax, az, bx, bz, o, .15)) return false; return true; };
        const insideObs = (x, z) => obstacles.find(o => x > o.x0 && x < o.x1 && z > o.z0 && z < o.z1);

        const treadLen = (() => { const R = .28, zc = 1.25 - R; return 4 * zc + 2 * Math.PI * R; })();
        const treadTiles = Math.round(treadLen / .8);
        const treadGeo = (() => {
          const len = 2.5, h = .56, w = .42, R = h / 2, zc = len / 2 - R, yc = .3, P = [];
          for (let i = 0; i < 7; i++) P.push([-zc + 2 * zc * i / 7, yc + R, 0, 1]);
          for (let i = 0; i < 10; i++) { const a = Math.PI / 2 - Math.PI * i / 10; P.push([zc + R * Math.cos(a), yc + R * Math.sin(a), Math.cos(a), Math.sin(a)]); }
          for (let i = 0; i < 7; i++) P.push([zc - 2 * zc * i / 7, yc - R, 0, -1]);
          for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 - Math.PI * i / 10; P.push([-zc + R * Math.cos(a), yc + R * Math.sin(a), Math.cos(a), Math.sin(a)]); }
          P.push(P[0]);
          const pos = [], nor = [], uv = [], idx = [];
          let sAcc = 0;
          const total = treadLen;
          for (let k = 0; k < P.length; k++) {
            if (k) sAcc += Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]);
            const v = k === P.length - 1 ? treadTiles : sAcc / total * treadTiles;
            for (const sx of [-1, 1]) { pos.push(sx * w / 2, P[k][1], P[k][0]); nor.push(0, P[k][3], P[k][2]); uv.push(sx < 0 ? .03 : .97, v); }
          }
          const n = P.length - 1;
          for (let k = 0; k < n; k++) { const a = 2 * k, b = a + 1, c = a + 2, d = a + 3; idx.push(a, c, b, b, c, d); }
          const cb = pos.length / 3;
          for (const sx of [-1, 1]) {
            pos.push(sx * w / 2, yc, 0); nor.push(sx, 0, 0); uv.push(.03, 0);
          }
          const capV = [];
          for (let k = 0; k < n; k++) for (const sx of [-1, 1]) { capV.push(pos.length / 3); pos.push(sx * w / 2, P[k][1], P[k][0]); nor.push(sx, 0, 0); uv.push(.03, 0); }
          for (let k = 0; k < n; k++) {
            const k2 = (k + 1) % n, l0 = capV[k * 2], r0 = capV[k * 2 + 1], l1 = capV[k2 * 2], r1 = capV[k2 * 2 + 1];
            idx.push(cb + 1, r0, r1, cb, l1, l0);
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
          return own(g);
        })();
        const shellG = (() => {
          const g = new THREE.LatheGeometry([[0, -.26], [.075, -.26], [.095, -.22], [.095, .04], [.08, .13], [.05, .22], [0, .3]].map(p => new THREE.Vector2(p[0], p[1])), 10);
          g.rotateX(Math.PI / 2);
          return tint(g, (c, x, y, z) => { if (z < -.2) c.setRGB(.55, .4, .2); else if (z < -.08) c.setRGB(.8, .7, .5); else if (z > .17) c.setRGB(1, 1, 1); else c.setRGB(1, .86, .62); });
        })();
        const wheelAcc = A => {
          for (const sx of [-1, 1]) for (const [z, r] of [[-.97, .27], [-.5, .21], [0, .21], [.5, .21], [.97, .27]]) {
            const x = sx * 1.17;
            cylX(A, r, .1, x, .3, z, ST.dk);
            cylX(A, r * .72, .115, x, .3, z, ST.md);
            cylX(A, r * .34, .14, x, .3, z, ST.lt);
            for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .4; cylX(A, .02, .15, x, .3 + Math.cos(a) * r * .55, z + Math.sin(a) * r * .55, ST.hi); }
          }
        };
        const tankParts = {};
        function partsFor(type) {
          if (tankParts[type]) return tankParts[type];
          const B = acc(), D = acc(), S = acc(), L = acc(), TB = acc(), TD = acc(), TS = acc(), BR = acc();
          const heavy = type === 'heavy', scout = type === 'scout', player = type === 'player';
          B.add(side([[-1.24, .2], [1.02, .2], [1.32, .46], [1.2, .62], [.82, .77], [-1.0, .77], [-1.24, .6]], 1.48, .07, .035), 0, 0, 0);
          B.box(.9, .05, .3, 0, .46, 1.32, null, -.62, 0, 0);
          wheelAcc(S);
          for (const sx of [-1, 1]) {
            D.box(.5, .06, .62, sx * .92, .62, .96);
            D.box(.5, .05, .36, sx * .92, .66, 1.42, null, -.5, 0, 0);
            D.box(.5, .06, .55, sx * .92, .62, -.98);
            D.box(.5, .05, .3, sx * .92, .64, -1.4, null, .4, 0, 0);
            D.box(.07, .06, 2.6, sx * .76, .61, 0);
            D.box(.05, .14, 2.6, sx * 1.15, .6, 0);
            D.box(.22, .15, .09, sx * .5, .54, 1.28);
            L.box(.16, .1, .06, sx * .5, .54, 1.33);
            cylZ(S, .05, .2, sx * .46, .55, -1.34, ST.md);
            cylZ(S, .035, .06, sx * .46, .55, -1.46, ST.dk);
            S.box(.05, .05, .1, sx * .62, .5, -1.3, ST.lt); S.box(.05, .05, .1, sx * .62, .5, 1.3, ST.lt);
          }
          D.box(1.0, .025, .56, 0, .785, -.72);
          for (let i = 0; i < 5; i++) S.box(.9, .012, .03, 0, .8, -.9 + i * .1, ST.lt);
          cylY(D, .13, .05, -.34, .79, .5); cylY(S, .08, .055, -.34, .8, .5, ST.md);
          S.box(.12, .04, .05, -.34, .83, .6, ST.lt); S.box(.12, .04, .05, -.34, .83, .4, ST.lt);
          cylY(D, .1, .04, .34, .79, .48);
          cylZ(S, .03, .26, .3, .66, 1.3, ST.md);
          B.box(.5, .05, .22, 0, .775, 0.05);
          if (heavy) { B.box(.06, .36, 1.3, -1.26, .44, .5); B.box(.06, .36, 1.3, 1.26, .44, .5); B.box(.9, .1, .12, 0, .72, 1.12, null, -.4, 0, 0); }
          cylY(S, .03, .06, .5, .8, -.9, ST.dk);
          S.add(CYL, .52, 1.4, -1.02, -.1, 0, 0, .012, scout ? 1.5 : 1.25, .012, ST.hi);
          if (player) B.box(.24, .13, .015, .64, 1.82, -1.1);
          const hullG = tint(B.build(.9), (c, x, y) => c.setScalar(.58 + .5 * clamp((y - .15) / .7, 0, 1)));
          TB.add(top([[-.5, -.55], [.5, -.55], [.62, -.1], [.52, .42], [.26, .62], [-.26, .62], [-.52, .42], [-.62, -.1]], .36, .1, .05), 0, 0, 0);
          TB.add(rbox(.76, .26, .34, .07, 2), 0, .17, -.62);
          cylY(TB, .17, .13, -.2, .42, -.14);
          TD.box(.5, .24, .14, 0, .2, .6);
          cylX(TD, .17, .5, 0, .2, .64);
          cylY(TD, .14, .04, -.2, .5, -.14);
          cylY(TD, .15, .03, .22, .385, -.3);
          TS.box(.1, .025, .035, -.2, .53, -.14, ST.lt); TS.box(.1, .025, .035, .22, .41, -.3, ST.lt);
          cylZ(TS, .018, .3, -.2, .64, -.04, ST.md);
          TS.box(.04, .12, .04, -.2, .58, -.14, ST.md);
          for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) TS.add(CYL, sx * .62, .3, .08 + k * .1, 0, 0, -sx * .5, .03, .15, .03, ST.dk);
          TS.box(.13, .1, .13, .3, .39, .12, ST.md);
          if (!scout) TS.box(.1, .16, .4, .64, .18, -.4, ST.md);
          if (heavy) { TB.add(rbox(.5, .2, .3, .05, 2), 0, .1, .7); cylY(TB, .13, .1, .24, .41, -.32); TS.box(.12, .22, .3, -.66, .16, -.2, ST.md); }
          BR.add(new THREE.CylinderGeometry(.078, .092, 1.3, 10), 0, 0, .85, Math.PI / 2, 0, 0, 1, 1, 1, sg(.9));
          cylZ(BR, .115, .3, 0, 0, .72, sg(.78)); cylZ(BR, .105, .06, 0, 0, .27, sg(.65));
          cylZ(BR, .128, .22, 0, 0, 1.5, sg(.6));
          for (const sx of [-1, 1]) BR.box(.026, .12, .07, sx * .125, 0, 1.5, sg(.3));
          cylZ(BR, .1, .03, 0, 0, 1.63, sg(.4));
          const out = {
            hull: hullG, hullD: D.build(), hullS: S.build(), lamp: L.build(),
            turB: tint(TB.build(.9), (c, x, y) => c.setScalar(.66 + .46 * clamp(y / .45, 0, 1))), turD: TD.build(), turS: TS.build(), barrel: BR.build()
          };
          for (const k in out) own(out[k]);
          tankParts[type] = out;
          return out;
        }
        const G = {
          bar: own(new THREE.PlaneGeometry(1.6, .2)),
          shell: own(shellG),
          pick: own(rbox(.9, .9, .9, .15, 3)),
          pickFrame: own((() => { const A = acc(); for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) A.box(.2, .2, .2, sx * .39, sy * .39, sz * .39, ST.lt); return A.build(); })()),
          pring: own(new THREE.RingGeometry(.85, 1.05, 32)),
          cross: own(new THREE.RingGeometry(.42, .58, 32)),
          crossDot: own(new THREE.CircleGeometry(.12, 16)),
          shield: own(new THREE.SphereGeometry(1.75, 24, 16)),
          scorch: own(new THREE.PlaneGeometry(1, 1))
        };
        const mats = {};
        for (const k in TK) mats[k] = {
          body: own(new THREE.MeshStandardMaterial({ map: metalT, color: TK[k].color, roughness: .5, metalness: .2, vertexColors: true })),
          dark: own(new THREE.MeshStandardMaterial({ color: TK[k].dark, roughness: .55, metalness: .35, vertexColors: true }))
        };
        const lampM = own(new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
        const basic = (color, extra) => own(new THREE.MeshBasicMaterial(Object.assign({ color, toneMapped: false }, extra)));
        const barBgM = basic(0x1a1a22, { transparent: true, opacity: .55, depthTest: false }), barPM = basic(0x3ee08f, { depthTest: false }), barEM = basic(0xff5a5a, { depthTest: false });
        const shellPM = basic(0xfff1a8, { vertexColors: true }), shellEM = basic(0xff7a4a, { vertexColors: true });
        const pickM = {}, pringM = {}, pglowM = {};
        for (const k in PICK) { pickM[k] = own(new THREE.MeshStandardMaterial({ map: tex(128, iconPainter(k)), roughness: .4, emissive: 0xffffff, emissiveIntensity: .12 })); pringM[k] = basic(new THREE.Color(PICK[k][0]).getHex(), { transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false }); pglowM[k] = own(new THREE.SpriteMaterial({ map: glowT, color: new THREE.Color(PICK[k][0]), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false })); }
        const crossM = basic(0xffffff, { transparent: true, opacity: .9, depthTest: false }), crossDotM = basic(0xffffff, { transparent: true, opacity: .9, depthTest: false });
        const shieldM = basic(0x6fb6ff, { transparent: true, opacity: .3, depthWrite: false });
        const scorchM = own(new THREE.MeshBasicMaterial({ map: scorchT, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));

        const fire = particles(THREE, own, 900, glowT, true), smoke = particles(THREE, own, 420, glowT, false);
        scene.add(fire.obj, smoke.obj);
        const cross = new THREE.Group(), crossRing = new THREE.Mesh(G.cross, crossM), crossDot = new THREE.Mesh(G.crossDot, crossDotM);
        crossRing.rotation.x = crossDot.rotation.x = -Math.PI / 2; crossRing.renderOrder = crossDot.renderOrder = 15;
        cross.add(crossRing, crossDot); scene.add(cross);
        const scorches = [];
        for (let i = 0; i < 20; i++) { const s = new THREE.Mesh(G.scorch, scorchM); s.rotation.x = -Math.PI / 2; s.position.y = .02; s.visible = false; scene.add(s); scorches.push(s); }
        let scorchI = 0;

        function makeTank(type) {
          const T = TK[type], M = mats[type], g = new THREE.Group(), PT = partsFor(type);
          const ta = treadT.clone(), tb = treadT.clone(); ta.needsUpdate = tb.needsUpdate = true;
          const ma = new THREE.MeshStandardMaterial({ map: ta, bumpMap: ta, bumpScale: 1.4, roughness: .85, metalness: .25 }), mb = new THREE.MeshStandardMaterial({ map: tb, bumpMap: tb, bumpScale: 1.4, roughness: .85, metalness: .25 });
          const add = (geo, mat, x, y, z, parent, shadow) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow !== false; (parent || g).add(m); return m; };
          add(PT.hull, M.body, 0, 0, 0).receiveShadow = true;
          add(PT.hullD, M.dark, 0, 0, 0, g, false); add(PT.hullS, gunM, 0, 0, 0, g, false); add(PT.lamp, lampM, 0, 0, 0, g, false);
          add(treadGeo, ma, -.92, 0, 0); add(treadGeo, mb, .92, 0, 0);
          const tur = new THREE.Group(); tur.position.y = .74; g.add(tur);
          add(PT.turB, M.body, 0, 0, 0, tur); add(PT.turD, M.dark, 0, 0, 0, tur, false); add(PT.turS, gunM, 0, 0, 0, tur, false);
          const bar = new THREE.Group(); bar.position.y = .2; tur.add(bar);
          add(PT.barrel, M.dark, 0, 0, 0, bar);
          if (type === 'heavy') bar.scale.set(1.45, 1.45, 1.05);
          if (type === 'scout') bar.scale.set(.8, .8, .9);
          g.scale.setScalar(T.scale); scene.add(g);
          const hb = new THREE.Group(), bg = new THREE.Mesh(G.bar, barBgM), fill = new THREE.Mesh(G.bar, type === 'player' ? barPM : barEM);
          bg.renderOrder = 20; fill.renderOrder = 21; bg.scale.set(1.04, 1.3, 1); hb.add(bg, fill); scene.add(hb);
          return { type, T, team: type === 'player' ? 'p' : 'e', g, tur, bar, hb, fill, texs: [ta, tb], tmats: [ma, mb], x: 0, z: 0, yaw: 0, tyaw: 0, ly: 0, v: 0, vx: 0, vz: 0, yr: 0, r: T.r, hp: T.hp, max: T.hp, cd: 0, recoil: 0, drop: 0, alive: true };
        }
        function dropTank(t) { scene.remove(t.g, t.hb); t.texs.forEach(x => x.dispose()); t.tmats.forEach(x => x.dispose()); }

        const hudEl = el('div', 'hud', wrap, '<div class="pill"><span>HP</span><div class="hp"><i></i></div><b class="hpv">100</b></div><div class="pill"><span>Wave</span><b class="wv">1</b></div><div class="pill"><span>Enemies</span><b class="en">0</b></div>');
        const hpBar = hudEl.querySelector('.hp'), hpFill = hpBar.firstChild, hpV = hudEl.querySelector('.hpv'), wvEl = hudEl.querySelector('.wv'), enEl = hudEl.querySelector('.en');
        const pups = el('div', 'pups', wrap, '<div class="chip rapid" hidden>RAPID <b></b></div><div class="chip shield" hidden>SHIELD <b></b></div>');
        const rapidChip = pups.querySelector('.rapid'), shieldChip = pups.querySelector('.shield');
        const banner = el('div', 'banner', wrap), hurtEl = el('div', 'hurt', wrap), floats = el('div', '', wrap);
        const tip = el('div', 'tip', wrap, 'Shells bounce once off walls');
        const joyEl = el('div', 'joy', wrap, '<i></i>'), knob = joyEl.firstChild; joyEl.hidden = true;

        const P = makeTank('player');
        const enemies = [], shells = [], pickups = [];
        let state = 'ready', score = 0, kills = 0, wave = 0, queue = [], spawnT = 0, clearing = 0, rapidT = 0, shieldT = 0, shake = 0, flashI = 0, time = 0, tipT = 6, lastChip = '';
        const allTanks = () => (P.alive ? [P, ...enemies] : enemies);
        const shieldMesh = new THREE.Mesh(G.shield, shieldM); shieldMesh.visible = false; scene.add(shieldMesh);
        const camT = new THREE.Vector3(PSPAWN.x, 0, PSPAWN.z), aimPt = new THREE.Vector3(0, 0, 0), tmpV = new THREE.Vector3();
        const ray = new THREE.Raycaster(), aimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.95), ndc = new THREE.Vector2();
        let aimSet = false, firing = false, aimId = null, touch = false;
        const joy = { id: null, ox: 0, oy: 0, dx: 0, dy: 0, m: 0 };

        function hud() {
          const f = clamp(P.hp / 100, 0, 1);
          hpFill.style.transform = `scaleX(${f})`; hpBar.classList.toggle('low', f < .35); hpV.textContent = Math.ceil(P.hp);
          wvEl.textContent = Math.max(1, wave); enEl.textContent = enemies.length + queue.length;
        }
        function showBanner(t, sub) { banner.innerHTML = t + (sub ? `<small>${sub}</small>` : ''); banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show'); }
        function floatText(x, z, text, color) {
          tmpV.set(x, 2.2, z).project(cam);
          const f = el('div', 'float', floats, text); f.style.left = ((tmpV.x + 1) * 50) + '%'; f.style.top = ((1 - tmpV.y) * 50) + '%'; if (color) f.style.color = color;
          api.timeout(() => f.remove(), 950);
        }
        function addScore(n) { score += n; api.score(score); }

        function boom(x, y, z, s) {
          const n = Math.round(10 + 30 * s);
          for (let i = 0; i < n; i++) { const a = Math.random() * TAU, sp = rnd(1.5, 6.5) * s; fire.emit(x, y, z, Math.cos(a) * sp, rnd(1, 5) * s, Math.sin(a) * sp, rnd(.25, .6), 1, rnd(.45, .85), rnd(.1, .3), rnd(.8, 1.6) * (s + .35), .2, 1, -1, 3); }
          for (let i = 0; i < n * .6; i++) smoke.emit(x + rnd(-.6, .6) * s, y, z + rnd(-.6, .6) * s, rnd(-1.5, 1.5) * s, rnd(1, 3) * s, rnd(-1.5, 1.5) * s, rnd(.9, 1.8), .24, .22, .22, rnd(.7, 1.3) * (s + .3), rnd(2, 3.4) * (s + .3), .55, -.6, 1.2);
          for (let i = 0; i < n * .5; i++) fire.emit(x, y, z, rnd(-9, 9) * s, rnd(3, 10) * s, rnd(-9, 9) * s, rnd(.3, .7), 1, .85, .45, .22, .05, 1, 14, .5);
          flash.position.set(x, y + 1.2, z); flashI = Math.max(flashI, 1 + 3.5 * s);
          shake = Math.min(1.3, shake + .5 * s);
          const sc = scorches[scorchI++ % scorches.length]; sc.visible = true; sc.position.set(x, .02 + (scorchI % 7) * .002, z); sc.rotation.z = Math.random() * TAU; sc.scale.setScalar(1.2 + 2 * s);
        }
        function sparks(x, y, z, n, rgb) {
          for (let i = 0; i < n; i++) fire.emit(x, y, z, rnd(-5, 5), rnd(1, 6), rnd(-5, 5), rnd(.2, .45), rgb[0], rgb[1], rgb[2], .25, .04, 1, 12, 1);
        }
        function dust(x, z, n, s) {
          for (let i = 0; i < n; i++) { const a = Math.random() * TAU; smoke.emit(x + Math.cos(a) * s, .2, z + Math.sin(a) * s, Math.cos(a) * rnd(1, 3), rnd(.3, 1.2), Math.sin(a) * rnd(1, 3), rnd(.6, 1.1), .86, .76, .58, .6, 1.8, .5, -.2, 2); }
        }

        function collideTank(t) {
          for (const o of obstacles) {
            const qx = clamp(t.x, o.x0, o.x1), qz = clamp(t.z, o.z0, o.z1), dx = t.x - qx, dz = t.z - qz, d2 = dx * dx + dz * dz;
            if (d2 >= t.r * t.r) continue;
            if (d2 > 1e-9) { const d = Math.sqrt(d2), k = (t.r - d) / d; t.x += dx * k; t.z += dz * k; }
            else {
              const l = t.x - o.x0, r = o.x1 - t.x, u = t.z - o.z0, ww = o.z1 - t.z, mn = Math.min(l, r, u, ww);
              if (mn === l) t.x = o.x0 - t.r; else if (mn === r) t.x = o.x1 + t.r; else if (mn === u) t.z = o.z0 - t.r; else t.z = o.z1 + t.r;
            }
          }
        }
        function stepTank(t, dt) {
          const ox = t.x, oz = t.z;
          t.x += Math.sin(t.yaw) * t.v * dt; t.z += Math.cos(t.yaw) * t.v * dt;
          collideTank(t);
          if (dt > 0) { t.vx = (t.x - ox) / dt; t.vz = (t.z - oz) / dt; }
          if (Math.abs(t.v) > 2 && Math.random() < dt * 10) { const bx = t.x - Math.sin(t.yaw) * 1.2 * t.T.scale, bz = t.z - Math.cos(t.yaw) * 1.2 * t.T.scale; smoke.emit(bx + rnd(-.6, .6), .15, bz + rnd(-.6, .6), rnd(-.3, .3), rnd(.2, .6), rnd(-.3, .3), rnd(.5, .9), .86, .76, .58, .4, 1.3, .35, -.2, 2); }
        }
        function separate() {
          const ts = allTanks();
          for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
            const a = ts[i], b = ts[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), m = a.r + b.r;
            if (d < m && d > 1e-6) { const k = (m - d) / d / 2; a.x -= dx * k; a.z -= dz * k; b.x += dx * k; b.z += dz * k; collideTank(a); collideTank(b); }
          }
        }
        function syncTank(t, dt) {
          t.yr = dt > 0 ? angDiff(t.ly, t.yaw) / dt : 0; t.ly = t.yaw;
          t.g.position.set(t.x, t.drop, t.z); t.g.rotation.y = t.yaw; t.tur.rotation.y = t.tyaw - t.yaw;
          t.recoil = damp(t.recoil, 0, 9, dt); t.bar.position.z = -t.recoil * .32;
          const tk = dt / (.8 * t.T.scale); t.texs[0].offset.y -= (t.v + t.yr * .9) * tk; t.texs[1].offset.y -= (t.v - t.yr * .9) * tk;
          const f = Math.max(0, t.hp / t.max); t.fill.scale.x = Math.max(.001, f); t.fill.position.x = -(1 - f) * .8;
          t.hb.position.set(t.x, 1.9 * t.T.scale + .35 + t.drop, t.z); t.hb.quaternion.copy(cam.quaternion);
        }

        function shoot(t) {
          const dx = Math.sin(t.tyaw), dz = Math.cos(t.tyaw), L = 1.7 * t.T.scale, x = t.x + dx * L, z = t.z + dz * L, y = .74 * t.T.scale + .2 * t.T.scale;
          t.recoil = 1;
          for (let i = 0; i < 8; i++) fire.emit(x, y, z, dx * rnd(2, 6) + rnd(-1, 1), rnd(0, 1.5), dz * rnd(2, 6) + rnd(-1, 1), rnd(.1, .22), 1, rnd(.6, .9), .3, rnd(.5, .9), .1, 1, 0, 6);
          for (let i = 0; i < 3; i++) smoke.emit(x, y, z, dx * rnd(.5, 1.5), rnd(.3, .8), dz * rnd(.5, 1.5), rnd(.5, .9), .8, .8, .8, .4, 1.1, .35, -.3, 2);
          if (insideObs(x, z)) { sparks(x, y, z, 8, [1, .8, .4]); return; }
          const m = new THREE.Mesh(G.shell, t.team === 'p' ? shellPM : shellEM); m.position.set(x, y, z); m.rotation.y = Math.atan2(dx, dz); if (t.type === 'heavy') m.scale.setScalar(1.4); scene.add(m);
          shells.push({ x, z, y, vx: dx * t.T.shell, vz: dz * t.T.shell, team: t.team, dmg: t.T.dmg, bounces: 0, life: 3.2, m, big: t.type === 'heavy' });
          api.sfx(t.team === 'p' ? 'pop' : 'tick');
        }
        function killShell(s, explode) { s.dead = true; if (explode) boom(s.x, s.y, s.z, s.big ? .45 : .3); }
        function updateShells(dt) {
          for (const s of shells) {
            if (s.dead) continue;
            s.life -= dt;
            let hit = false;
            for (let k = 0; k < 2 && !hit; k++) {
              const ox = s.x, oz = s.z;
              s.x += s.vx * dt / 2; s.z += s.vz * dt / 2;
              const o = insideObs(s.x, s.z);
              if (o) {
                if (o.kind === 'crate') { hitCrate(o); hit = true; break; }
                if (s.bounces < 1) {
                  if (ox <= o.x0 || ox >= o.x1) s.vx = -s.vx; else s.vz = -s.vz;
                  s.x = ox; s.z = oz; s.bounces++; sparks(s.x, s.y, s.z, 6, [1, .9, .6]); api.sfx('tick');
                } else hit = true;
                break;
              }
              if (s.team === 'p') {
                for (const e of enemies) if (e.drop < .5 && (e.x - s.x) ** 2 + (e.z - s.z) ** 2 < e.r * e.r) { hurtEnemy(e, s.dmg); hit = true; break; }
              } else if (P.alive && (P.x - s.x) ** 2 + (P.z - s.z) ** 2 < P.r * P.r) { hurtPlayer(s.dmg); hit = true; }
            }
            if (hit || s.life <= 0) { killShell(s, true); continue; }
            if (s.team === 'p') {
              const o = shells.find(q => !q.dead && q.team === 'e' && (q.x - s.x) ** 2 + (q.z - s.z) ** 2 < .3);
              if (o) { killShell(o, false); killShell(s, false); boom((o.x + s.x) / 2, s.y, (o.z + s.z) / 2, .3); addScore(5); floatText(s.x, s.z, '+5'); continue; }
            }
            s.m.position.set(s.x, s.y, s.z); s.m.rotation.y = Math.atan2(s.vx, s.vz);
            const pl = s.team === 'p';
            fire.emit(s.x, s.y, s.z, 0, 0, 0, .22, 1, pl ? .9 : .55, pl ? .5 : .3, s.big ? .6 : .42, .05, .9);
            smoke.emit(s.x, s.y, s.z, rnd(-.2, .2), rnd(.1, .4), rnd(-.2, .2), rnd(.35, .6), .85, .85, .85, .18, .55, .22, -.2, 1);
          }
          for (let i = shells.length - 1; i >= 0; i--) if (shells[i].dead) { scene.remove(shells[i].m); shells.splice(i, 1); }
        }
        function hitCrate(o) {
          o.hp--;
          const cx = (o.x0 + o.x1) / 2, cz = (o.z0 + o.z1) / 2;
          for (let i = 0; i < 10; i++) smoke.emit(cx + rnd(-.6, .6), rnd(.4, 1.4), cz + rnd(-.6, .6), rnd(-3, 3), rnd(1, 4), rnd(-3, 3), rnd(.4, .8), .62, .42, .22, .22, .12, 1, 9, 1);
          if (o.hp > 0) { o.mesh.material = crateHurtM; o.mesh.rotation.y = rnd(-.12, .12); api.sfx('hit'); return; }
          removeObstacle(o); boom(cx, .8, cz, .45); dust(cx, cz, 10, .8);
          for (let i = 0; i < 18; i++) smoke.emit(cx + rnd(-.5, .5), rnd(.3, 1.5), cz + rnd(-.5, .5), rnd(-5, 5), rnd(2, 7), rnd(-5, 5), rnd(.6, 1.1), .66, .44, .22, .3, .18, 1, 14, .6);
          addScore(10); api.sfx('hit');
          maybeDrop(cx, cz, .32);
        }
        function maybeDrop(x, z, chance) {
          if (Math.random() > chance || pickups.length >= 4) return;
          const r = Math.random(), kind = r < .4 ? 'repair' : r < .7 ? 'rapid' : 'shield';
          const g = new THREE.Group(), box = new THREE.Mesh(G.pick, pickM[kind]), ring = new THREE.Mesh(G.pring, pringM[kind]);
          box.castShadow = true; ring.rotation.x = -Math.PI / 2; box.add(new THREE.Mesh(G.pickFrame, gunM)); const gl = new THREE.Sprite(pglowM[kind]); gl.scale.setScalar(2.6); g.add(box, ring, gl); g.position.set(x, 1, z); scene.add(g);
          pickups.push({ kind, g, box, ring, x, z, t: 15, ph: Math.random() * TAU });
        }
        function hurtPlayer(d) {
          if (!P.alive) return;
          if (shieldT > 0) { sparks(P.x, 1, P.z, 12, [.5, .8, 1]); api.sfx('tick'); return; }
          P.hp -= d; api.sfx('bad'); shake = Math.min(1.3, shake + .35);
          hurtEl.classList.remove('on'); void hurtEl.offsetWidth; hurtEl.classList.add('on');
          sparks(P.x, 1, P.z, 10, [1, .7, .3]);
          if (P.hp <= 0) {
            P.hp = 0; P.alive = false; P.g.visible = P.hb.visible = false; shieldMesh.visible = false;
            boom(P.x, .8, P.z, 1.3); api.sfx('lose'); state = 'over'; firing = false;
            api.timeout(() => {
              const isBest = api.submit(score);
              api.overlay({ kicker: isBest ? 'New best!' : 'Game over', title: 'Tank destroyed', text: `You held the arena until wave ${wave}.`, stats: [['Score', score], ['Wave', wave], ['Kills', kills]], button: 'Play again', onAction: () => reset(true) });
            }, 1700);
          }
          hud();
        }
        function hurtEnemy(e, d) {
          e.hp -= d; e.alert = 99;
          if (e.state === 'patrol') setState(e, 'chase');
          sparks(e.x, 1, e.z, 10, [1, .85, .5]);
          if (e.hp > 0) { api.sfx('hit'); return; }
          enemies.splice(enemies.indexOf(e), 1); dropTank(e);
          boom(e.x, .8, e.z, e.type === 'heavy' ? 1.3 : 1); api.sfx('hit');
          kills++; addScore(e.T.pts); floatText(e.x, e.z, '+' + e.T.pts, e.type === 'heavy' ? '#e2d4ff' : '#fff2b0');
          maybeDrop(e.x, e.z, e.type === 'heavy' ? .6 : .22);
          hud();
        }

        function setState(e, s) {
          e.state = s; e.stateT = 0; e.path = null;
          if (s !== 'cover') return;
          let best = null, bd = 1e9;
          for (let k = 0; k < 30; k++) {
            const x = e.x + rnd(-9, 9), z = e.z + rnd(-9, 9);
            if (!grid.free(x, z) || losClear(x, z, P.x, P.z)) continue;
            const d = Math.hypot(x - e.x, z - e.z) + Math.max(0, 7 - Math.hypot(x - P.x, z - P.z)) * 2;
            if (d < bd) { bd = d; best = { x, z }; }
          }
          if (!best) { e.state = 'chase'; return; }
          e.path = grid.path(e.x, e.z, best.x, best.z); e.pi = 0; e.coverFor = e.path.length / e.T.speed + rnd(1.2, 2.4);
        }
        function spawnEnemy(type) {
          const pts = SPAWNS.slice().sort((a, b) => Math.hypot(b[0] - P.x, b[1] - P.z) - Math.hypot(a[0] - P.x, a[1] - P.z));
          const pt = pts.find(p => !allTanks().some(t => Math.hypot(t.x - p[0], t.z - p[1]) < 3)) || pts[0];
          const e = makeTank(type);
          Object.assign(e, { x: pt[0], z: pt[1], yaw: Math.atan2(-pt[0], -pt[1]), state: 'patrol', stateT: 0, think: 0, cd: rnd(1.2, 2.2), act: -.9, alert: 0, path: null, pi: 0, coverFor: 0, strafe: 1, strafeT: 0, stuck: 0, rev: 0, los: false, tookCover: false, pathT: 0, ex: rnd(-.6, .6), ez: rnd(-.6, .6) });
          e.tyaw = e.ly = e.yaw; e.drop = 6;
          enemies.push(e);
        }
        function aiUpdate(e, dt) {
          e.act += dt; e.stateT += dt; e.cd -= dt; e.think -= dt; e.alert += dt;
          if (e.act < 0) { e.drop = 8 * e.act * e.act; return; }
          if (e.drop > 0) { e.drop = 0; dust(e.x, e.z, 14, 1.2); shake = Math.min(1.3, shake + .12); api.sfx('hit'); }
          const dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz) || 1;
          if (e.think <= 0) {
            e.think = .3 + Math.random() * .25;
            e.los = P.alive && losClear(e.x, e.z, P.x, P.z);
            if (e.state === 'patrol' && ((e.los && dist < e.T.range + 5) || e.alert > 3 + Math.random() * 3)) setState(e, 'chase');
            if (e.state === 'cover' && e.stateT > e.coverFor) setState(e, 'chase');
            if (e.state === 'chase' && P.alive) {
              if (e.los && dist < e.T.range) e.path = null;
              else if (!e.path || e.stateT - e.pathT > 1.2 || e.pi >= e.path.length) { e.path = grid.path(e.x, e.z, P.x, P.z); e.pi = 0; e.pathT = e.stateT; }
            }
            if ((e.state === 'patrol' || !P.alive) && (!e.path || e.pi >= e.path.length)) {
              for (let k = 0; k < 20; k++) { const x = rnd(-AX + 2, AX - 2), z = rnd(-AZ + 2, AZ - 2); if (grid.free(x, z)) { e.path = grid.path(e.x, e.z, x, z); e.pi = 0; break; } }
            }
          }
          let tx = null, tz = null, thr = 1;
          if (e.rev > 0) { e.rev -= dt; e.v = damp(e.v, -e.T.speed * .6, 8, dt); e.yaw += e.T.turn * dt * e.strafe; }
          else {
            if (e.path) {
              while (e.pi < e.path.length && Math.hypot(e.path[e.pi].x - e.x, e.path[e.pi].z - e.z) < 1) e.pi++;
              if (e.pi < e.path.length) {
                let k = Math.min(e.path.length - 1, e.pi + 4);
                while (k > e.pi && !grid.line(e.x, e.z, e.path[k].x, e.path[k].z)) k--;
                tx = e.path[k].x; tz = e.path[k].z;
              }
            } else if (e.state === 'chase' && e.los) {
              e.strafeT -= dt;
              if (e.strafeT <= 0) { e.strafe = -e.strafe; e.strafeT = rnd(1.4, 3); }
              const kk = dist < e.T.range * .5 ? -.8 : dist > e.T.range * .85 ? .8 : 0;
              tx = e.x + (-dz / dist * e.strafe + dx / dist * kk) * 3; tz = e.z + (dx / dist * e.strafe + dz / dist * kk) * 3; thr = .6;
              if (!grid.free(tx, tz)) { e.strafe = -e.strafe; e.strafeT = 1.5; tx = null; }
            }
            if (tx !== null) {
              const want = Math.atan2(tx - e.x, tz - e.z), d = angDiff(e.yaw, want);
              e.yaw += clamp(d, -e.T.turn * dt, e.T.turn * dt);
              const a = Math.abs(d);
              e.v = damp(e.v, (a < .5 ? 1 : a < 1.2 ? .45 : 0) * e.T.speed * thr, 6, dt);
            } else e.v = damp(e.v, 0, 6, dt);
          }
          if (e.v > 1 && Math.hypot(e.vx, e.vz) < e.v * .25) { e.stuck += dt; if (e.stuck > .7) { e.stuck = 0; e.rev = .55; e.path = null; e.strafe = Math.random() < .5 ? 1 : -1; } }
          else e.stuck = Math.max(0, e.stuck - dt);

          const tf = dist / e.T.shell, ax = P.x + P.vx * tf * e.T.lead + e.ex, az = P.z + P.vz * tf * e.T.lead + e.ez;
          const want = e.los ? Math.atan2(ax - e.x, az - e.z) : e.yaw;
          e.tyaw += clamp(angDiff(e.tyaw, want), -e.T.aimRate * dt, e.T.aimRate * dt);
          if (e.los && P.alive && state === 'play' && e.cd <= 0 && dist < e.T.range + 7 && Math.abs(angDiff(e.tyaw, want)) < .08) {
            shoot(e);
            e.cd = e.T.cd * rnd(.85, 1.2) * Math.max(.55, 1 - .05 * (wave - 1));
            e.ex = rnd(-.8, .8); e.ez = rnd(-.8, .8);
            if (Math.random() < e.T.cover) setState(e, 'cover');
          }
          if (!e.tookCover && e.hp <= e.max * .5 && e.state !== 'cover') { e.tookCover = true; setState(e, 'cover'); }
        }

        function nextWave() {
          wave++;
          const n = Math.min(2 + wave, 10), heavy = Math.min(3, (wave - 1) >> 1), scout = Math.min(4, wave >> 1);
          queue = [];
          for (let i = 0; i < n; i++) queue.push(i < heavy ? 'heavy' : i < heavy + scout ? 'scout' : 'grunt');
          shuffle(queue); spawnT = .9;
          showBanner(`Wave ${wave}`, wave === 1 ? 'Destroy every enemy tank' : `${n} tanks incoming`);
          api.sfx('tick');
          if (wave > 1) placeCrates(Math.max(0, 16 - crateCount()));
          hud();
        }
        function reset(start) {
          enemies.forEach(dropTank); enemies.length = 0;
          shells.forEach(s => scene.remove(s.m)); shells.length = 0;
          pickups.forEach(p => scene.remove(p.g)); pickups.length = 0;
          obstacles.filter(o => o.kind === 'crate').forEach(removeObstacle);
          Object.assign(P, { x: PSPAWN.x, z: PSPAWN.z, yaw: Math.PI, tyaw: Math.PI, ly: Math.PI, v: 0, vx: 0, vz: 0, hp: 100, alive: true, cd: 0 });
          P.g.visible = P.hb.visible = true;
          placeCrates(16);
          scorches.forEach(s => { s.visible = false; });
          fire.clear(); smoke.clear();
          score = 0; kills = 0; wave = 0; queue = []; clearing = 0; rapidT = shieldT = 0; firing = false; tipT = 6;
          api.score(0);
          if (start === false) { state = 'ready'; hud(); return; }
          state = 'play'; nextWave();
        }

        function setTouch() { if (touch) return; touch = true; tip.textContent = 'Left side: drive stick · tap right side to shoot'; tipT = 6; }
        function updateAim() {
          if (!aimSet) { aimPt.set(P.x + Math.sin(P.tyaw) * 8, 0, P.z + Math.cos(P.tyaw) * 8); return; }
          ray.setFromCamera(ndc, cam);
          if (ray.ray.intersectPlane(aimPlane, tmpV)) aimPt.set(clamp(tmpV.x, -AX - 4, AX + 4), 0, clamp(tmpV.z, -AZ - 4, AZ + 4));
        }
        function playerFire() {
          if (!P.alive || state !== 'play') return;
          updateAim();
          P.tyaw = Math.atan2(aimPt.x - P.x, aimPt.z - P.z);
          shoot(P); P.cd = rapidT > 0 ? .15 : .42;
        }
        api.on(canvas, 'pointerdown', e => {
          if (e.pointerType === 'touch') setTouch();
          if (state !== 'play') return;
          const L = toLocal(e);
          if (e.pointerType === 'touch' && L.x < w * .42 && joy.id === null) {
            joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.m = 0;
            joyEl.style.left = (L.x / w * 100) + '%'; joyEl.style.top = (L.y / h * 100) + '%'; knob.style.transform = ''; joyEl.hidden = false;
          } else {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            aimId = e.pointerId; ndc.set(L.nx, L.ny); aimSet = true; firing = true;
            if (P.cd <= 0) playerFire();
          }
          try { canvas.setPointerCapture(e.pointerId); } catch (er) {   }
        });
        api.on(canvas, 'pointermove', e => {
          if (e.pointerId === joy.id) {
            const dx = e.clientX - joy.ox, dy = e.clientY - joy.oy, m = Math.hypot(dx, dy), R = joyEl.offsetWidth / 2 || 55;
            joy.m = Math.min(1, m / R); joy.dx = dx / (m || 1); joy.dy = dy / (m || 1);
            knob.style.transform = `translate(${joy.dx * joy.m * R}px,${joy.dy * joy.m * R}px)`;
            return;
          }
          if (e.pointerType === 'mouse' || e.pointerId === aimId) { const L = toLocal(e); ndc.set(L.nx, L.ny); aimSet = true; }
        });
        const release = e => {
          if (e.pointerId === joy.id) { joy.id = null; joy.m = 0; joyEl.hidden = true; }
          if (e.pointerId === aimId) { aimId = null; firing = false; }
        };
        api.on(canvas, 'pointerup', release); api.on(canvas, 'pointercancel', release); api.on(canvas, 'lostpointercapture', release);
        api.on(window, 'keydown', e => { if (e.code === 'Space' && !e.repeat && P.cd <= 0) playerFire(); });

        function playerUpdate(dt) {
          const k = c => keys.has(c);
          let thr = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0);
          let turn = (k('KeyA') || k('ArrowLeft') ? 1 : 0) - (k('KeyD') || k('ArrowRight') ? 1 : 0);
          if (joy.id !== null && joy.m > .15) {
            const d = angDiff(P.yaw, Math.atan2(joy.dx, joy.dy));
            turn = clamp(d * 3, -1, 1); thr = joy.m * (Math.abs(d) < 1 ? 1 : .2);
          }
          P.yaw += turn * P.T.turn * dt;
          P.v = damp(P.v, thr * P.T.speed * (thr < 0 ? .65 : 1), 7, dt);
          updateAim();
          P.tyaw += clamp(angDiff(P.tyaw, Math.atan2(aimPt.x - P.x, aimPt.z - P.z)), -10 * dt, 10 * dt);
          P.cd -= dt;
          if ((firing || k('Space')) && P.cd <= 0) playerFire();
        }
        function updatePickups(dt) {
          for (let i = pickups.length - 1; i >= 0; i--) {
            const p = pickups[i];
            p.t -= dt; p.ph += dt;
            p.g.position.y = 1 + Math.sin(p.ph * 2.5) * .18; p.box.rotation.y += dt * 1.6; p.box.rotation.x = Math.sin(p.ph) * .25;
            p.ring.position.y = .06 - p.g.position.y; p.ring.scale.setScalar(1 + Math.sin(p.ph * 4) * .06);
            p.g.visible = p.t > 3 || ((p.t * 8) | 0) % 2 === 0;
            if (P.alive && Math.hypot(P.x - p.x, P.z - p.z) < 1.7) {
              if (p.kind === 'repair') { P.hp = Math.min(100, P.hp + 35); floatText(p.x, p.z, '+35 HP', '#b6ffd9'); }
              else if (p.kind === 'rapid') { rapidT = 8; floatText(p.x, p.z, 'Rapid fire', '#ffe08a'); }
              else { shieldT = 8; floatText(p.x, p.z, 'Shield', '#cfe4ff'); }
              const [r, g, b] = hexRGB(new THREE.Color(PICK[p.kind][0]).getHex());
              for (let j = 0; j < 26; j++) { const a = j / 26 * TAU; fire.emit(p.x, .6, p.z, Math.cos(a) * 4, rnd(1, 3), Math.sin(a) * 4, rnd(.4, .7), r, g, b, .4, .05, 1, 2, 2); }
              api.sfx('good'); scene.remove(p.g); pickups.splice(i, 1); hud();
            } else if (p.t <= 0) { scene.remove(p.g); pickups.splice(i, 1); }
          }
        }

        reset(false);
        api.overlay({
          kicker: '3D', title: 'Tank Arena',
          text: (window.matchMedia && matchMedia('(pointer: coarse)').matches ? 'Drag on the left side to drive, tap or hold on the right to aim and fire.' : 'Drive with WASD, aim with the mouse and click to fire.') + ' Shells bounce once off walls, crates break. Survive the waves and grab repair, rapid-fire and shield drops.',
          button: 'Play', onAction: () => reset(true)
        });

        api.loop(dt => {
          time += dt;
          if (state === 'play' && P.alive) playerUpdate(dt);
          else P.v = damp(P.v, 0, 6, dt);
          if (P.alive) stepTank(P, dt);
          if (state !== 'ready') {
            for (let i = enemies.length - 1; i >= 0; i--) { const e = enemies[i]; syncGrid(); aiUpdate(e, dt); if (e.act >= 0) stepTank(e, dt); }
            separate();
            updateShells(dt);
            updatePickups(dt);
          }
          allTanks().forEach(t => syncTank(t, dt));
          if (state === 'play') {
            if (queue.length) { spawnT -= dt; if (spawnT <= 0) { spawnEnemy(queue.pop()); spawnT = .75; hud(); } }
            else if (!enemies.length && P.alive) {
              if (!clearing) { clearing = 2.8; const b = 100 * wave; addScore(b); P.hp = Math.min(100, P.hp + 15); showBanner(`Wave ${wave} cleared`, `+${b} bonus · +15 HP`); api.sfx('win'); hud(); }
              else if ((clearing -= dt) <= 0) { clearing = 0; nextWave(); }
            }
            rapidT = Math.max(0, rapidT - dt); shieldT = Math.max(0, shieldT - dt);
          }
          if (state === 'over' && Math.random() < dt * 20) { smoke.emit(P.x + rnd(-.5, .5), .5, P.z + rnd(-.5, .5), rnd(-.3, .3), rnd(1.5, 2.5), rnd(-.3, .3), rnd(1.2, 2), .18, .17, .17, .8, 2.6, .5, -.3, .5); fire.emit(P.x + rnd(-.5, .5), .4, P.z + rnd(-.5, .5), 0, rnd(1, 2), 0, rnd(.3, .5), 1, .55, .15, .7, .2, 1); }
          shieldMesh.visible = P.alive && shieldT > 0 && (shieldT > 2 || ((shieldT * 8) | 0) % 2 === 0);
          if (shieldMesh.visible) { shieldMesh.position.set(P.x, .7, P.z); shieldMesh.scale.setScalar(1 + Math.sin(time * 6) * .03); }
          const on = state === 'play' && P.alive, chip = `${on}|${Math.ceil(rapidT)}|${Math.ceil(shieldT)}`;
          if (chip !== lastChip) { lastChip = chip; rapidChip.hidden = !(on && rapidT > 0); shieldChip.hidden = !(on && shieldT > 0); rapidChip.lastChild.textContent = Math.ceil(rapidT) + 's'; shieldChip.lastChild.textContent = Math.ceil(shieldT) + 's'; }
          if (state === 'play' && tipT > 0) tipT -= dt;
          const th = tipT <= 0 || state !== 'play';
          if (tip.hidden !== th) tip.hidden = th;

          cross.visible = P.alive && state === 'play';
          if (cross.visible) {
            const ready = P.cd <= 0;
            cross.position.set(aimPt.x, .06, aimPt.z); crossRing.rotation.z += dt * 1.5;
            crossRing.scale.setScalar(ready ? 1 : 1 + clamp(P.cd / .42, 0, 1) * .6); crossM.opacity = ready ? .95 : .45;
            crossM.color.setHex(rapidT > 0 ? 0xffd166 : 0xffffff);
          }

          const tx = clamp(P.x + (aimPt.x - P.x) * .15, -6, 6), tz = clamp(P.z + (aimPt.z - P.z) * .15, -1, 4.5);
          camT.x = damp(camT.x, tx, 4, dt); camT.z = damp(camT.z, tz, 4, dt);
          shake = damp(shake, 0, 5, dt);
          const sx = (Math.random() - .5) * shake * .9, sz = (Math.random() - .5) * shake * .9;
          cam.position.set(camT.x + sx, 23, camT.z + 14.5 + sz); cam.lookAt(camT.x + sx * .5, 0, camT.z + sz * .5);
          flashI = damp(flashI, 0, 7, dt); flash.intensity = flashI;
          const sc = h * renderer.getPixelRatio() / (2 * Math.tan(cam.fov * Math.PI / 360));
          fire.mat.uniforms.scale.value = smoke.mat.uniforms.scale.value = sc;
          fire.update(dt); smoke.update(dt);
          renderer.render(scene, cam);
        });

        return () => {
          enemies.forEach(dropTank); dropTank(P);
          K.dispose();
        };
      }
    }
  });
})();

