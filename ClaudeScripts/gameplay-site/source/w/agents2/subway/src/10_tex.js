
  const FONT = '"Lilita One", "Nunito", "Arial Black", Impact, sans-serif';
  const GWORDS = ['SUBWAY', 'SURF', 'ZAP', 'YO!', 'KRU', 'WOW', 'FLY', 'BOOM', 'JAKE', 'RUSH', 'HEY', 'COOL', 'SPRAY', 'TAG', 'GO!'];
  const GCOLS = [['#ffd23f', '#ff7a1a'], ['#ff4fa3', '#a83cff'], ['#3ad1ff', '#2f6fd9'], ['#7cf03a', '#1fa84a'], ['#ff5a3a', '#ffd23f'], ['#ffffff', '#3ad1ff'], ['#c16bff', '#ff4fa3']];

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function noise(g, x, y, w, h, n, a, cols) {
    for (let i = 0; i < n; i++) { g.globalAlpha = a * Math.random(); g.fillStyle = cols ? pick(cols) : (Math.random() < 0.5 ? '#000' : '#fff'); const s = 1 + Math.random() * 3; g.fillRect(x + Math.random() * w, y + Math.random() * h, s, s); }
    g.globalAlpha = 1;
  }
  function graffiti(g, word, cx, cy, size, cols, rot) {
    g.save(); g.translate(cx, cy); g.rotate(rot || 0);
    g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillText(word, size * 0.08, size * 0.1);
    g.lineWidth = size * 0.22; g.strokeStyle = '#1b1530'; g.strokeText(word, 0, 0);
    g.lineWidth = size * 0.1; g.strokeStyle = '#ffffff'; g.strokeText(word, 0, 0);
    const gr = g.createLinearGradient(0, -size / 2, 0, size / 2); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]);
    g.fillStyle = gr; g.fillText(word, 0, 0);
    g.globalAlpha = 0.5; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-size * 0.6, -size * 0.2, size * 0.12, size * 0.05, -0.4, 0, TAU); g.fill(); g.globalAlpha = 1;
    g.restore();
  }
  function splat(g, x, y, r, c) {
    g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    for (let i = 0; i < 7; i++) { const a = Math.random() * TAU, d = r * rnd(1.1, 1.9); g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * rnd(0.12, 0.3), 0, TAU); g.fill(); }
    g.fillRect(x - r * 0.08, y, r * 0.16, r * rnd(1.2, 2.4));
  }
  function stripes(g, x, y, w, h, c1, c2, sw) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = c1; g.fillRect(x, y, w, h); g.fillStyle = c2;
    for (let i = -h; i < w + h; i += sw * 2) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + h, y); g.lineTo(x + i + h + sw, y); g.lineTo(x + i + sw, y + h); g.closePath(); g.fill(); }
    g.restore();
  }

  function mkTex(THREE, renderer) {
    const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const canvasTex = (c, rep) => {
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso;
      if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    };
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

    function atlas(city) {
      const S = 2048, c = cv(S, S), g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
      let sx = 0, sy = 0, sh = 0;
      const R = {};
      const alloc = (w, h) => { if (sx + w > S) { sx = 0; sy += sh + 2; sh = 0; } const r = [sx, sy, w, h]; sx += w + 2; sh = Math.max(sh, h); return r; };
      R.liv = []; R.front = []; R.frontLit = []; R.ends = [];
      city.trains.forEach((lv, i) => {
        const r = alloc(1020, 200); R.liv.push(r); paintLivery(g, r, lv, i);
      });
      city.trains.forEach((lv, i) => {
        const r = alloc(168, 200); R.front.push(r); paintFront(g, r, lv, false, i);
        const r2 = alloc(168, 200); R.frontLit.push(r2); paintFront(g, r2, lv, true, i);
        const r3 = alloc(168, 200); R.ends.push(r3); paintEnd(g, r3, lv);
      });
      R.graf = [];
      for (let i = 0; i < 4; i++) { const r = alloc(1020, 176); R.graf.push(r); paintWall(g, r, city, i); }
      R.fac = [];
      city.bld.forEach((b, i) => { const r = alloc(200, 400); R.fac.push(r); paintFacade(g, r, city, b, i); });
      R.white = alloc(16, 16);
      R.roofs = alloc(128, 128); g.fillStyle = shade(city.wallTop, -0.1); g.fillRect(...R.roofs); noise(g, ...R.roofs, 300, 0.12);
      R.low = alloc(256, 64); stripes(g, ...R.low, '#e8323a', '#ffffff', 22); g.strokeStyle = '#7a1018'; g.lineWidth = 6; g.strokeRect(R.low[0] + 3, R.low[1] + 3, 250, 58);
      R.high = alloc(256, 96); stripes(g, ...R.high, '#ffcf1f', '#26222e', 24); g.strokeStyle = '#26222e'; g.lineWidth = 8; g.strokeRect(R.high[0] + 4, R.high[1] + 4, 248, 88);
      R.ramp = alloc(128, 256); paintRamp(g, R.ramp);
      R.rampSide = alloc(128, 64); stripes(g, ...R.rampSide, '#ffcf1f', '#26222e', 14);
      R.mbox = alloc(128, 128); paintMbox(g, R.mbox);
      R.tunnel = alloc(256, 256); paintTunnel(g, R.tunnel, city);
      R.portal = alloc(512, 256); paintPortal(g, R.portal, city);
      R.platform = alloc(256, 64); paintPlatform(g, R.platform);
      R.arch = alloc(1020, 330); paintArch(g, R.arch, city);
      R.chev = alloc(256, 96); paintChev(g, R.chev);
      R.sig = alloc(64, 128); stripes(g, ...R.sig, '#ffffff', '#e8323a', 14);
      R.sign = alloc(256, 96); paintSign(g, R.sign, city);
      R.neon = alloc(128, 256); paintNeon(g, R.neon, city);
      const tex = canvasTex(c);
      const uv = (r, u0 = 0, v0 = 0, u1 = 1, v1 = 1) => [(r[0] + 1 + u0 * (r[2] - 2)) / S, 1 - (r[1] + 1 + v1 * (r[3] - 2)) / S, (r[0] + 1 + u1 * (r[2] - 2)) / S, 1 - (r[1] + 1 + v0 * (r[3] - 2)) / S];
      return { tex, R, uv, canvas: c };
    }

    function paintLivery(g, r, lv, i) {
      const [x, y, w, h] = r, base = lv[0], band = lv[1];
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(base, 0.18)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(base, -0.25));
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      if (lv[2] === 'low') { const lg = g.createLinearGradient(0, y + h * 0.6, 0, y + h); lg.addColorStop(0, shade(band, 0.12)); lg.addColorStop(1, shade(band, -0.22)); g.fillStyle = lg; g.fillRect(x, y + h * 0.6, w, h * 0.4); g.fillStyle = shade(base, -0.3); g.fillRect(x, y + h * 0.6, w, 4); }
      else { g.fillStyle = band; g.fillRect(x, y + h * 0.6, w, h * 0.09); g.fillStyle = shade(band, -0.2); g.fillRect(x, y + h * 0.69, w, h * 0.02); }
      const doors = [0.2, 0.5, 0.8];
      for (const d of doors) {
        const dx = x + w * d - 34;
        g.fillStyle = shade(base, -0.12); g.fillRect(dx - 4, y + 10, 76, h - 22);
        g.fillStyle = '#2b3550'; rr(g, dx + 4, y + 30, 26, 66, 6); g.fill(); rr(g, dx + 38, y + 30, 26, 66, 6); g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(dx + 8, y + 34, 6, 50); g.fillRect(dx + 42, y + 34, 6, 50);
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(dx + 33, y + 12, 2, h - 26);
      }
      for (let k = 0; k < 4; k++) {
        const wx = x + w * (0.035 + k * 0.3) + (k ? 0 : 0), ww = w * 0.12;
        if (k === 3) break;
        for (let j = 0; j < 2; j++) {
          const xx = wx + j * (ww + 10) + 30;
          g.fillStyle = shade(base, -0.4); rr(g, xx - 4, y + 22, ww + 8, 80, 12); g.fill();
          const gg = g.createLinearGradient(xx, y + 26, xx + ww, y + 98); gg.addColorStop(0, '#9fd8ff'); gg.addColorStop(0.5, '#3d5f8f'); gg.addColorStop(1, '#22304f');
          g.fillStyle = gg; rr(g, xx, y + 26, ww, 72, 9); g.fill();
          g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(xx + 8, y + 90); g.lineTo(xx + 26, y + 30); g.lineTo(xx + 38, y + 30); g.lineTo(xx + 20, y + 90); g.fill();
        }
      }
      if (i % 2 === 0 || Math.random() < 0.7) {
        const n = rint(1, 2);
        for (let k = 0; k < n; k++) graffiti(g, pick(GWORDS), x + w * (0.25 + k * 0.5) + rnd(-60, 60), y + h * rnd(0.62, 0.74), rnd(54, 74), pick(GCOLS), rnd(-0.12, 0.08));
        for (let k = 0; k < 3; k++) splat(g, x + rnd(20, w - 20), y + h * rnd(0.75, 0.9), rnd(5, 10), pick(GCOLS)[0]);
      }
      const dg = g.createLinearGradient(0, y + h * 0.8, 0, y + h); dg.addColorStop(0, 'rgba(40,30,20,0)'); dg.addColorStop(1, 'rgba(40,30,20,.55)');
      g.fillStyle = dg; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y, w, 6); g.fillRect(x, y + h - 8, w, 8);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y + 6, w, 3);
      noise(g, x, y, w, h, 600, 0.05);
    }
    function paintFront(g, r, lv, lit, i) {
      const [x, y, w, h] = r, base = lv[0], band = lv[1], cx = x + w / 2;
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(base, 0.2)); gr.addColorStop(1, shade(base, -0.25));
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = shade(base, -0.45); rr(g, x + 10, y + 18, w - 20, 86, 14); g.fill();
      const gg = g.createLinearGradient(x, y + 20, x + w, y + 100); gg.addColorStop(0, '#bfe6ff'); gg.addColorStop(0.45, '#4a6f9f'); gg.addColorStop(1, '#1f2a45');
      g.fillStyle = gg; rr(g, x + 15, y + 23, w - 30, 76, 10); g.fill();
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(x + 26, y + 92); g.lineTo(x + 56, y + 27); g.lineTo(x + 74, y + 27); g.lineTo(x + 44, y + 92); g.fill();
      g.fillStyle = '#1a1a22'; g.fillRect(cx - 2, y + 23, 4, 76);
      g.fillStyle = '#111'; rr(g, cx - 40, y + 3, 80, 13, 4); g.fill();
      g.fillStyle = lit ? '#ffb31a' : '#7a5a1a'; g.font = `900 11px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['EXPRESS', 'DOWNTOWN', 'UPTOWN', 'YARD', 'CENTRAL'][i % 5], cx, y + 10);
      g.fillStyle = band; g.fillRect(x, y + 110, w, 14);
      for (const s of [-1, 1]) {
        const lx = cx + s * 54, ly = y + 146;
        g.fillStyle = '#2a2a33'; g.beginPath(); g.arc(lx, ly, 16, 0, TAU); g.fill();
        if (lit) {
          const hg = g.createRadialGradient(lx, ly, 2, lx, ly, 14); hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, '#fff6b0'); hg.addColorStop(1, '#ffc21a');
          g.fillStyle = hg;
        } else g.fillStyle = '#d9dde6';
        g.beginPath(); g.arc(lx, ly, 12, 0, TAU); g.fill();
        g.fillStyle = lit ? '#ff6a3a' : '#8a3a3a'; g.beginPath(); g.arc(lx - s * 26, ly, 6, 0, TAU); g.fill();
      }
      g.fillStyle = '#fff'; g.font = `900 26px ${FONT}`; g.fillText(String(10 + i * 7), cx, y + 147);
      g.fillStyle = '#2a2a33'; g.fillRect(x + 8, y + h - 24, w - 16, 20);
      g.fillStyle = '#ffcf1f'; for (let k = 0; k < 6; k++) g.fillRect(x + 12 + k * 26, y + h - 20, 12, 12);
      noise(g, x, y, w, h, 200, 0.05);
    }
    function paintEnd(g, r, lv) {
      const [x, y, w, h] = r;
      g.fillStyle = shade(lv[0], -0.1); g.fillRect(x, y, w, h);
      g.fillStyle = shade(lv[0], -0.35); rr(g, x + w / 2 - 36, y + 20, 72, h - 40, 8); g.fill();
      g.fillStyle = '#2b3550'; rr(g, x + w / 2 - 24, y + 34, 48, 56, 6); g.fill();
      g.fillStyle = lv[1]; g.fillRect(x, y + 128, w, 18);
      noise(g, x, y, w, h, 200, 0.05);
    }
    function paintWall(g, r, city, i) {
      const [x, y, w, h] = r;
      g.fillStyle = city.wall; g.fillRect(x, y, w, h);
      for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + k * w / 8, y, 3, h); }
      g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, y + h * 0.5, w, 2);
      noise(g, x, y, w, h, 2500, 0.08);
      const n = 2 + (i % 2);
      for (let k = 0; k < n; k++) {
        const cx = x + w * (k + 0.5) / n + rnd(-30, 30), cy = y + h * rnd(0.45, 0.6);
        if (Math.random() < 0.5) splat(g, cx + rnd(-120, 120), cy + rnd(-40, 30), rnd(14, 26), pick(GCOLS)[1]);
        graffiti(g, pick(GWORDS), cx, cy, rnd(80, 110), pick(GCOLS), rnd(-0.1, 0.1));
      }
      for (let k = 0; k < 4; k++) { g.save(); g.translate(x + rnd(30, w - 30), y + rnd(20, h - 20)); g.rotate(rnd(-0.3, 0.3)); g.font = `900 22px ${FONT}`; g.fillStyle = pick(['#1b1530', '#c42a7a', '#2f6fd9']); g.fillText(pick(['jk', 'zip', 'srf', 'yo', 'xo', 'ss']), 0, 0); g.restore(); }
      const dg = g.createLinearGradient(0, y + h * 0.7, 0, y + h); dg.addColorStop(0, 'rgba(60,45,30,0)'); dg.addColorStop(1, 'rgba(60,45,30,.45)');
      g.fillStyle = dg; g.fillRect(x, y, w, h);
      g.fillStyle = city.wallTop; g.fillRect(x, y, w, 10);
    }
    function paintFacade(g, r, city, cols, i) {
      const [x, y, w, h] = r, st = city.style;
      const base = cols[0];
      g.fillStyle = base; g.fillRect(x, y, w, h);
      if (st === 'brick') {
        g.fillStyle = shade(base, -0.12);
        for (let yy = 0; yy < h; yy += 8) for (let xx = (yy / 8) % 2 ? 0 : 10; xx < w; xx += 20) g.fillRect(x + xx, y + yy, 18, 1.5), g.fillRect(x + xx, y + yy, 1.5, 8);
      } else noise(g, x, y, w, h, 1500, 0.06);
      const floors = st === 'modern' ? 9 : st === 'favela' ? 5 : 6, fh = h / floors;
      const cols2 = st === 'modern' ? 5 : st === 'haussmann' ? 3 : st === 'favela' ? 2 : 3;
      for (let f = 0; f < floors; f++) {
        const fy = y + f * fh;
        if (st === 'haussmann' || st === 'balcony') { g.fillStyle = shade(base, -0.18); g.fillRect(x, fy + fh - 6, w, 6); }
        if (f === floors - 1 && st !== 'modern') {
          g.fillStyle = shade(base, -0.3); g.fillRect(x, fy + fh * 0.2, w, fh * 0.8);
          if (st === 'brick' || st === 'arch') for (let k = 0; k < 2; k++) { g.fillStyle = city.winF; g.fillRect(x + 30 + k * 120, fy + fh * 0.3, 80, fh * 0.6); g.fillStyle = shade(city.win, -0.3); g.fillRect(x + 36 + k * 120, fy + fh * 0.36, 68, fh * 0.54); }
          continue;
        }
        for (let k = 0; k < cols2; k++) {
          const cw = w / cols2, wx = x + k * cw + cw * 0.2, ww = cw * 0.6, wy = fy + fh * 0.2, wh = fh * (st === 'haussmann' ? 0.62 : 0.55);
          const lit = city.win === '#ffd36b' ? Math.random() < 0.7 : Math.random() < 0.08;
          if (st === 'modern') { g.fillStyle = city.winF; g.fillRect(x + k * cw, wy - 2, cw, wh + 4); }
          g.fillStyle = st === 'modern' ? city.winF : city.winF; g.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
          const gg = g.createLinearGradient(wx, wy, wx + ww, wy + wh); gg.addColorStop(0, lit ? '#fff0b0' : shade(city.win, 0.35)); gg.addColorStop(1, lit ? '#ffb84a' : shade(city.win, -0.25));
          g.fillStyle = gg;
          if (st === 'arch') { g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx, wy + ww / 2); g.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.fill(); }
          else g.fillRect(wx, wy, ww, wh);
          g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(wx + 3, wy + 3, ww * 0.25, wh - 6);
          g.fillStyle = city.winF; g.fillRect(wx + ww / 2 - 1.5, wy, 3, wh);
          if (st === 'shutter') { g.fillStyle = city.win; g.fillRect(wx - 16, wy - 2, 12, wh + 4); g.fillRect(wx + ww + 4, wy - 2, 12, wh + 4); }
          if (st === 'haussmann' || st === 'balcony') {
            g.strokeStyle = '#2b2730'; g.lineWidth = 2; g.strokeRect(wx - 6, wy + wh * 0.65, ww + 12, wh * 0.35);
            for (let b = 0; b < 6; b++) g.fillStyle = '#2b2730', g.fillRect(wx - 6 + b * (ww + 12) / 5, wy + wh * 0.65, 2, wh * 0.35);
          }
          if (st === 'favela' && Math.random() < 0.5) { g.fillStyle = pick(['#ff5a7a', '#3ad1ff', '#ffd23f', '#7cf03a']); g.fillRect(wx - 6, wy + wh + 4, ww + 12, 8); }
        }
        if (st === 'brick' && f > 0 && f < floors - 1 && i % 2 === 0) {
          g.strokeStyle = '#2f2b33'; g.lineWidth = 3; g.strokeRect(x + w * 0.1, fy + fh * 0.78, w * 0.5, 2);
          for (let b = 0; b < 8; b++) g.fillStyle = '#2f2b33', g.fillRect(x + w * 0.1 + b * w * 0.07, fy + fh * 0.62, 2, fh * 0.16);
        }
      }
      if (st === 'modern' && i % 2 === 1) { g.fillStyle = pick(['#ff4fa3', '#3ad1ff', '#ffd23f']); rr(g, x + 20, y + h * 0.35, 60, 150, 8); g.fill(); g.fillStyle = '#fff'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.fillText('寿', x + 50, y + h * 0.35 + 50); g.fillText('司', x + 50, y + h * 0.35 + 110); }
      const dg = g.createLinearGradient(0, y, 0, y + h); dg.addColorStop(0, 'rgba(255,255,255,.08)'); dg.addColorStop(1, 'rgba(0,0,0,.18)');
      g.fillStyle = dg; g.fillRect(x, y, w, h);
    }
    function paintRamp(g, r) {
      const [x, y, w, h] = r;
      g.fillStyle = '#e7b91f'; g.fillRect(x, y, w, h);
      for (let k = 0; k < h; k += 16) { g.fillStyle = '#b8901a'; g.fillRect(x, y + k, w, 5); g.fillStyle = '#f7d64a'; g.fillRect(x, y + k + 5, w, 2); }
      stripes(g, x, y, 14, h, '#ffcf1f', '#26222e', 10); stripes(g, x + w - 14, y, 14, h, '#ffcf1f', '#26222e', 10);
      noise(g, x, y, w, h, 300, 0.1);
    }
    function paintMbox(g, r) {
      const [x, y, w, h] = r;
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#b45cff'); gr.addColorStop(1, '#6a1fc9');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.strokeStyle = '#ffd23f'; g.lineWidth = 10; g.strokeRect(x + 5, y + 5, w - 10, h - 10);
      g.font = `900 92px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#3a0f7a'; g.strokeText('?', x + w / 2, y + h / 2 + 6);
      g.fillStyle = '#ffd23f'; g.fillText('?', x + w / 2, y + h / 2 + 6);
    }
    function paintTunnel(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = shade(city.wall, -0.45); g.fillRect(x, y, w, h);
      for (let yy = 0; yy < h; yy += 16) for (let xx = (yy / 16) % 2 ? 0 : 16; xx < w; xx += 32) { g.fillStyle = shade(city.wall, -0.55); g.fillRect(x + xx, y + yy, 30, 1.5); g.fillRect(x + xx, y + yy, 1.5, 16); }
      noise(g, x, y, w, h, 800, 0.1);
      g.fillStyle = '#fff3c4'; g.fillRect(x, y + 6, w, 10);
    }
    function paintPortal(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = shade(city.wall, -0.15); g.fillRect(x, y, w, h);
      for (let yy = 0; yy < h; yy += 32) for (let xx = (yy / 32) % 2 ? 0 : 32; xx < w; xx += 64) { g.fillStyle = shade(city.wall, -0.3); g.fillRect(x + xx, y + yy, 62, 2); g.fillRect(x + xx, y + yy, 2, 32); }
      noise(g, x, y, w, h, 1500, 0.08);
      graffiti(g, pick(GWORDS), x + w * 0.22, y + h * 0.5, 54, pick(GCOLS), -0.1);
      graffiti(g, pick(GWORDS), x + w * 0.78, y + h * 0.55, 54, pick(GCOLS), 0.08);
    }
    function paintArch(g, r, city) {
      const [x, y, w, h] = r, a = city.arch || city.wall, n = 3, aw = w / n;
      g.fillStyle = a; g.fillRect(x, y, w, h);
      for (let yy = 0; yy < h; yy += 14) for (let xx = (yy / 14) % 2 ? 0 : 18; xx < w; xx += 36) { g.fillStyle = shade(a, -0.1); g.fillRect(x + xx, y + yy, 34, 1.5); g.fillRect(x + xx, y + yy, 1.5, 14); }
      noise(g, x, y, w, h, 2200, 0.07);
      for (let k = 0; k < n; k++) {
        const cx = x + aw * (k + 0.5), ow = aw * 0.62, top = y + h * 0.16, bot = y + h, rx = ow / 2;
        g.fillStyle = shade(a, -0.22); g.beginPath(); g.moveTo(cx - rx - 16, bot); g.lineTo(cx - rx - 16, top + rx); g.arc(cx, top + rx, rx + 16, Math.PI, 0); g.lineTo(cx + rx + 16, bot); g.closePath(); g.fill();
        const ig = g.createLinearGradient(0, top, 0, bot); ig.addColorStop(0, shade(a, -0.48)); ig.addColorStop(1, shade(a, -0.28));
        g.fillStyle = ig; g.beginPath(); g.moveTo(cx - rx, bot); g.lineTo(cx - rx, top + rx); g.arc(cx, top + rx, rx, Math.PI, 0); g.lineTo(cx + rx, bot); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(cx, top + rx, rx + 16, Math.PI * 1.02, Math.PI * 1.45); g.arc(cx, top + rx, rx + 6, Math.PI * 1.45, Math.PI * 1.02, true); g.fill();
        for (let q = 0; q < 4; q++) { g.fillStyle = q % 2 ? city.leaf[0] : city.leaf[1]; g.beginPath(); g.ellipse(cx - rx * 0.6 + q * rx * 0.42, bot - 8, rx * 0.34, h * 0.13, 0, Math.PI, 0); g.fill(); }
        g.fillStyle = shade(a, 0.12); g.fillRect(x + aw * k, y, 10, h);
      }
      g.fillStyle = shade(a, -0.12); g.fillRect(x, y, w, 16);
      g.fillStyle = shade(a, 0.15); g.fillRect(x, y + 16, w, 5);
      if (city.id === 'subway' || city.id === 'london') { graffiti(g, pick(GWORDS), x + aw * 1.0 + rnd(-40, 40), y + h * 0.82, 52, pick(GCOLS), rnd(-0.1, 0.1)); }
    }
    function paintChev(g, r) {
      const [x, y, w, h] = r;
      g.fillStyle = '#ffffff'; g.fillRect(x, y, w, h);
      g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
      g.fillStyle = '#e8323a';
      for (let k = -1; k < 3; k++) { const yy = y + h * 0.15 + k * h * 0.42; g.beginPath(); g.moveTo(x + 10, yy + h * 0.5); g.lineTo(x + w / 2, yy); g.lineTo(x + w - 10, yy + h * 0.5); g.lineTo(x + w - 10, yy + h * 0.72); g.lineTo(x + w / 2, yy + h * 0.22); g.lineTo(x + 10, yy + h * 0.72); g.closePath(); g.fill(); }
      g.restore();
      g.strokeStyle = '#b81f22'; g.lineWidth = 6; g.strokeRect(x + 3, y + 3, w - 6, h - 6);
    }
    function patch() {
      const c = cv(128, 128), g = c.getContext('2d');
      g.fillStyle = '#2f6fd9'; g.beginPath(); for (let k = 0; k < 14; k++) { const a = k * TAU / 14, rr2 = k % 2 ? 50 : 60; g.lineTo(64 + Math.cos(a) * rr2, 64 + Math.sin(a) * rr2 * 0.8); } g.closePath(); g.fill();
      g.strokeStyle = '#12224a'; g.lineWidth = 4; g.stroke();
      graffiti(g, 'SS', 64, 66, 64, ['#fff36a', '#ff9a1a'], -0.08);
      return canvasTex(c);
    }
    function paintPlatform(g, r) {
      const [x, y, w, h] = r;
      g.fillStyle = '#d6d2c8'; g.fillRect(x, y, w, h);
      g.fillStyle = '#ffcf1f'; g.fillRect(x, y + h - 16, w, 10);
      for (let k = 0; k < w; k += 8) { g.fillStyle = '#c9a91a'; g.fillRect(x + k, y + h - 16, 2, 10); }
    }
    function paintSign(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = '#1f3f8f'; rr(g, x, y, w, h, 12); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; rr(g, x + 5, y + 5, w - 10, h - 10, 9); g.stroke();
      g.fillStyle = '#fff'; g.font = `900 ${city.name.length > 10 ? 30 : 38}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(city.name.toUpperCase(), x + w / 2, y + h / 2 + 2);
    }
    function paintNeon(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = '#2a2236'; g.fillRect(x, y, w, h);
      const c = city.id === 'tokyo' ? ['#ff4fa3', '#3ad1ff'] : city.id === 'neworleans' ? ['#ff9a2a', '#b45cff'] : ['#ffd23f', '#ff5a3a'];
      g.shadowColor = c[0]; g.shadowBlur = 14; g.fillStyle = c[0]; g.font = `900 52px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const t = city.id === 'tokyo' ? ['ラ', 'ー', 'メ'] : city.id === 'neworleans' ? ['J', 'A', 'Z'] : ['B', 'A', 'R'];
      t.forEach((s, k) => g.fillText(s, x + w / 2, y + 48 + k * 78));
      g.shadowBlur = 0; g.strokeStyle = c[1]; g.lineWidth = 6; g.strokeRect(x + 6, y + 6, w - 12, h - 12);
    }

    function track(city) {
      const W = 512, H = 512, c = cv(W, H), g = c.getContext('2d');
      g.fillStyle = city.gravel[0]; g.fillRect(0, 0, W, H);
      noise(g, 0, 0, W, H, 9000, 0.35, [city.gravel[1], shade(city.gravel[0], 0.25), shade(city.gravel[1], -0.3)]);
      const lw = W / 3.6;
      for (let l = 0; l < 3; l++) {
        const cx = W * (l + 0.5) / 3;
        g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(cx - lw * 0.5, 0, lw, H);
        for (let k = 0; k < 5; k++) {
          const yy = k * H / 5 + 8;
          g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(cx - lw * 0.62, yy + 6, lw * 1.24, 40);
          g.fillStyle = city.sleeper; g.fillRect(cx - lw * 0.62, yy, lw * 1.24, 38);
          g.fillStyle = shade(city.sleeper, 0.18); g.fillRect(cx - lw * 0.62, yy, lw * 1.24, 8);
          g.fillStyle = shade(city.sleeper, -0.25); for (let q = 0; q < 4; q++) g.fillRect(cx - lw * 0.55 + q * lw * 0.3, yy + 14 + q % 2 * 8, lw * 0.18, 2);
        }
      }
      const t = canvasTex(c, true);
      t.wrapS = THREE.ClampToEdgeWrapping;
      return t;
    }
    function fence() {
      const c = cv(128, 128), g = c.getContext('2d');
      g.strokeStyle = 'rgba(200,205,212,.95)'; g.lineWidth = 3;
      for (let i = -128; i < 256; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); }
      g.fillStyle = '#8f949c'; g.fillRect(0, 0, 128, 6); g.fillRect(0, 122, 128, 6);
      const t = canvasTex(c, true); return t;
    }
    function sky(city) {
      const c = cv(4, 256), g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, city.sky[0]); gr.addColorStop(0.55, city.sky[1]); gr.addColorStop(1, city.sky[2]);
      g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
      return canvasTex(c);
    }
    function skyline(city) {
      const W = 2048, H = 512, c = cv(W, H), g = c.getContext('2d');
      const far = shade(city.fog, -0.12), mid = shade(city.fog, -0.22);
      for (let k = 0; k < 7; k++) {
        const cx = rnd(0, W), cy = rnd(40, 200), s = rnd(40, 90);
        g.fillStyle = 'rgba(255,255,255,.75)';
        for (let q = 0; q < 5; q++) { g.beginPath(); g.arc(cx + (q - 2) * s * 0.55, cy + Math.abs(q - 2) * s * 0.12, s * (q === 2 ? 0.6 : 0.42), 0, TAU); g.fill(); }
      }
      g.fillStyle = far;
      for (let x = 0; x < W;) { const bw = rnd(40, 110), bh = rnd(60, 190); g.fillRect(x, H - bh, bw, bh); x += bw + rnd(0, 10); }
      const L = city.id;
      g.fillStyle = mid;
      const cx = W / 2;
      if (L === 'paris') { g.beginPath(); g.moveTo(cx - 110, H); g.quadraticCurveTo(cx - 30, H - 160, cx - 8, H - 400); g.lineTo(cx + 8, H - 400); g.quadraticCurveTo(cx + 30, H - 160, cx + 110, H); g.closePath(); g.fill(); g.fillStyle = city.fog; g.beginPath(); g.ellipse(cx, H, 60, 70, 0, Math.PI, 0); g.fill(); g.fillStyle = mid; g.fillRect(cx - 70, H - 150, 140, 10); g.fillRect(cx - 40, H - 270, 80, 8); g.fillRect(cx - 2, H - 440, 4, 44); }
      else if (L === 'rio') { g.beginPath(); g.moveTo(cx - 600, H); g.quadraticCurveTo(cx - 300, H - 380, cx, H - 300); g.quadraticCurveTo(cx + 250, H - 200, cx + 500, H); g.fill(); g.fillRect(cx - 6, H - 372, 12, 74); g.fillRect(cx - 46, H - 352, 92, 10); g.beginPath(); g.arc(cx, H - 380, 9, 0, TAU); g.fill(); g.beginPath(); g.moveTo(cx + 560, H); g.quadraticCurveTo(cx + 640, H - 330, cx + 720, H); g.fill(); }
      else if (L === 'rome') { g.fillRect(cx - 230, H - 200, 460, 200); g.fillStyle = city.fog; for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { g.beginPath(); g.ellipse(cx - 200 + k * 50, H - 160 + r * 60, 15, 22, 0, 0, TAU); g.fill(); } g.fillStyle = mid; g.beginPath(); g.moveTo(cx + 230, H - 200); g.lineTo(cx + 230, H - 120); g.lineTo(cx + 170, H - 230); g.fill(); g.beginPath(); g.arc(cx + 520, H - 140, 90, Math.PI, 0); g.fill(); g.fillRect(cx + 430, H - 140, 180, 140); }
      else if (L === 'london') { g.fillRect(cx - 34, H - 380, 68, 380); g.beginPath(); g.moveTo(cx - 40, H - 380); g.lineTo(cx, H - 470); g.lineTo(cx + 40, H - 380); g.fill(); g.fillStyle = city.fog; g.beginPath(); g.arc(cx, H - 330, 24, 0, TAU); g.fill(); g.fillStyle = mid; g.fillRect(cx - 2, H - 346, 4, 18); g.fillRect(cx - 500, H - 180, 380, 180); g.lineWidth = 10; g.strokeStyle = mid; g.beginPath(); g.arc(cx + 420, H - 190, 160, 0, TAU); g.stroke(); for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(cx + 420, H - 190); g.lineTo(cx + 420 + Math.cos(k * TAU / 12) * 160, H - 190 + Math.sin(k * TAU / 12) * 160); g.lineWidth = 3; g.stroke(); } }
      else if (L === 'tokyo') { g.fillStyle = shade(city.fog, -0.05); g.beginPath(); g.moveTo(cx - 700, H); g.lineTo(cx - 350, H - 300); g.lineTo(cx - 300, H - 310); g.lineTo(cx, H); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - 410, H - 240); g.lineTo(cx - 350, H - 300); g.lineTo(cx - 300, H - 310); g.lineTo(cx - 250, H - 250); g.lineTo(cx - 330, H - 270); g.fill(); g.fillStyle = '#e8606a'; g.beginPath(); g.moveTo(cx + 200, H); g.lineTo(cx + 250, H - 420); g.lineTo(cx + 300, H); g.fill(); g.fillStyle = '#fff'; g.fillRect(cx + 228, H - 260, 44, 10); g.fillRect(cx + 238, H - 360, 24, 8); }
      else if (L === 'cairo') { for (const [px, ph] of [[cx - 380, 300], [cx - 60, 380], [cx + 260, 260]]) { g.fillStyle = mid; g.beginPath(); g.moveTo(px - ph, H); g.lineTo(px, H - ph); g.lineTo(px + ph, H); g.fill(); g.fillStyle = shade(city.fog, -0.3); g.beginPath(); g.moveTo(px, H - ph); g.lineTo(px + ph, H); g.lineTo(px + ph * 0.3, H); g.fill(); } }
      else if (L === 'neworleans') { g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(cx + 300, 150, 80, 0, TAU); g.fill(); g.fillStyle = mid; for (let k = 0; k < 5; k++) { const bx = cx - 600 + k * 260; g.fillRect(bx, H - 220, 160, 220); g.beginPath(); g.moveTo(bx - 10, H - 220); g.lineTo(bx + 80, H - 290); g.lineTo(bx + 170, H - 220); g.fill(); } g.fillRect(cx - 40, H - 330, 80, 330); g.beginPath(); g.moveTo(cx - 40, H - 330); g.lineTo(cx, H - 430); g.lineTo(cx + 40, H - 330); g.fill(); }
      else { for (let k = 0; k < 9; k++) { const bx = cx - 520 + k * 120, bh = 220 + hash(k) * 200; g.fillRect(bx, H - bh, 90, bh); if (k === 4) { g.fillRect(bx + 35, H - bh - 80, 20, 80); g.beginPath(); g.moveTo(bx + 30, H - bh - 80); g.lineTo(bx + 45, H - bh - 150); g.lineTo(bx + 60, H - bh - 80); g.fill(); } } g.fillStyle = shade(city.fog, -0.18); g.fillRect(0, H - 60, W, 60); }
      g.fillStyle = shade(city.fog, -0.16);
      for (let x = 0; x < W;) { const bw = rnd(50, 130), bh = rnd(30, 110); g.fillRect(x, H - bh, bw, bh); x += bw + rnd(0, 20); }
      const t = canvasTex(c);
      return t;
    }
    function coin() {
      const c = cv(128, 128), g = c.getContext('2d');
      const gr = g.createRadialGradient(50, 44, 6, 64, 64, 64); gr.addColorStop(0, '#fff6b0'); gr.addColorStop(0.6, '#ffcc1a'); gr.addColorStop(1, '#d48a00');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = '#b87400'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 44, 0, TAU); g.stroke();
      g.strokeStyle = '#fff2a0'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 50, 0, TAU); g.stroke();
      g.fillStyle = '#e09a00'; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? 13 : 30; g.lineTo(64 + Math.cos(a) * rr2, 64 + Math.sin(a) * rr2); }
      g.closePath(); g.fill();
      g.fillStyle = '#fff3a8'; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? 10 : 25; g.lineTo(62 + Math.cos(a) * rr2, 62 + Math.sin(a) * rr2); }
      g.closePath(); g.fill();
      return canvasTex(c);
    }
    function blob() {
      const c = cv(64, 64), g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return canvasTex(c);
    }
    function glow(col) {
      const c = cv(64, 64), g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return canvasTex(c);
    }
    function label(text, fg, bg, w = 128, h = 64, size = 44) {
      const c = cv(w, h), g = c.getContext('2d');
      if (bg) { g.fillStyle = bg; rr(g, 2, 2, w - 4, h - 4, 14); g.fill(); }
      g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.lineWidth = 8; g.strokeStyle = '#3a2a00'; g.strokeText(text, w / 2, h / 2 + 2); g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 2);
      return canvasTex(c);
    }
    function toon() {
      const c = cv(4, 1), g = c.getContext('2d');
      ['#7a7a7a', '#b4b4b4', '#e6e6e6', '#ffffff'].forEach((v, i) => { g.fillStyle = v; g.fillRect(i, 0, 1, 1); });
      const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;
      return t;
    }
    return { atlas, track, fence, sky, skyline, coin, blob, glow, label, toon, patch };
  }
