const LS_LOGK = 520;
const LS_VIS = [
  { b: 'Earth', au: 1, r: 26, dy: 70, c0: '#7fd0ff', c1: '#1f5fb8', c2: '#0a1f4a', land: '#3fae6a' },
  { b: 'Mars', au: 1.52, r: 15, dy: -95, c0: '#ffb08a', c1: '#c4502c', c2: '#4a1608' },
  { b: 'Jupiter', au: 5.2, r: 58, dy: -120, c0: '#f6dcb6', c1: '#c98d5a', c2: '#3a2414', bands: ['#e9c79c', '#b9784a', '#f3e3c6', '#a8663c', '#e2b98c'] },
  { b: 'Saturn', au: 9.58, r: 44, dy: 85, c0: '#fbe9bd', c1: '#d6b06c', c2: '#3c2c12', bands: ['#f1d9a2', '#c9a25c', '#f6e6bf'], ring: true },
  { b: 'Uranus', au: 19.2, r: 32, dy: -110, c0: '#d6fbff', c1: '#6fd2df', c2: '#0f3c48' },
  { b: 'Neptune', au: 30.07, r: 31, dy: 95, c0: '#9fc4ff', c1: '#2f5fe0', c2: '#08174d' },
  { b: 'Pluto', au: 39.5, r: 11, dy: -80, c0: '#f3dcc4', c1: '#b88b6a', c2: '#3a2618', heart: true },
  { b: 'Eris', au: 67.9, r: 10, dy: 70, c0: '#ffffff', c1: '#b7bcc8', c2: '#3c4050' }
];
function lsSprite(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  draw(c.getContext('2d'), c.width, c.height);
  return c;
}
function lsPlanetSprite(v, k) {
  const r = v.r * k, pad = v.ring ? r * 1.25 : r * .35, w = (r + pad) * 2, h = v.ring ? r * 2.6 : w;
  return lsSprite(w, h, (g, W, H) => {
    const cx = W / 2, cy = H / 2;
    if (v.ring) {
      g.save(); g.translate(cx, cy); g.rotate(-.32); g.scale(1, .32);
      g.lineWidth = r * .22; g.strokeStyle = 'rgba(236,214,166,.55)'; g.beginPath(); g.arc(0, 0, r * 1.95, Math.PI, Math.PI * 2); g.stroke();
      g.lineWidth = r * .1; g.strokeStyle = 'rgba(255,240,205,.7)'; g.beginPath(); g.arc(0, 0, r * 1.62, Math.PI, Math.PI * 2); g.stroke();
      g.restore();
    }
    const glow = g.createRadialGradient(cx, cy, r * .9, cx, cy, r * 1.35);
    glow.addColorStop(0, 'rgba(160,200,255,.25)'); glow.addColorStop(1, 'rgba(160,200,255,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, r * 1.35, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
    const body = g.createRadialGradient(cx - r * .45, cy - r * .5, r * .1, cx, cy, r * 1.05);
    body.addColorStop(0, v.c0); body.addColorStop(.55, v.c1); body.addColorStop(1, v.c2);
    g.fillStyle = body; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    if (v.bands) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        g.globalAlpha = .38; g.fillStyle = v.bands[i % v.bands.length];
        const y = cy - r + (i + .3) * (2 * r / n);
        g.beginPath(); g.ellipse(cx, y, r * 1.1, r / n * (.55 + .35 * Math.sin(i * 2.1)), 0, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
      if (v.b === 'Jupiter') { g.fillStyle = 'rgba(190,90,60,.75)'; g.beginPath(); g.ellipse(cx + r * .32, cy + r * .28, r * .2, r * .11, 0, 0, Math.PI * 2); g.fill(); }
    }
    if (v.land) {
      g.fillStyle = v.land; g.globalAlpha = .85;
      [[-.35, -.15, .32, .22], [.2, .25, .28, .2], [.1, -.45, .2, .12], [-.1, .5, .18, .1]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(cx + x * r, cy + y * r, a * r, b * r, .4, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = '#ffffff'; g.globalAlpha = .55;
      [[-.05, -.3, .5, .06], [.15, .05, .55, .05], [-.25, .35, .4, .05]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(cx + x * r, cy + y * r, a * r, b * r, -.2, 0, Math.PI * 2); g.fill(); });
      g.globalAlpha = 1;
    }
    if (v.heart) { g.fillStyle = 'rgba(255,240,225,.8)'; g.beginPath(); g.ellipse(cx + r * .15, cy + r * .2, r * .38, r * .3, .3, 0, Math.PI * 2); g.fill(); }
    const shade = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(.55, 'rgba(0,0,0,.05)'); shade.addColorStop(1, 'rgba(0,0,10,.55)');
    g.fillStyle = shade; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    g.restore();
    if (v.ring) {
      g.save(); g.translate(cx, cy); g.rotate(-.32); g.scale(1, .32);
      g.lineWidth = r * .22; g.strokeStyle = 'rgba(236,214,166,.75)'; g.beginPath(); g.arc(0, 0, r * 1.95, 0, Math.PI); g.stroke();
      g.lineWidth = r * .1; g.strokeStyle = 'rgba(255,240,205,.9)'; g.beginPath(); g.arc(0, 0, r * 1.62, 0, Math.PI); g.stroke();
      g.restore();
    }
  });
}
function lsProbeSprite(k) {
  return lsSprite(120 * k, 80 * k, (g) => {
    g.scale(k, k);
    g.translate(60, 40);
    g.fillStyle = '#26305a'; g.fillRect(-38, -3, 76, 6);
    const panel = (x) => {
      g.fillStyle = '#1c3c8c'; g.fillRect(x - 13, -34, 26, 22); g.fillRect(x - 13, 12, 26, 22);
      g.strokeStyle = '#7fb4ff'; g.lineWidth = 1;
      for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * 8.5, -34); g.lineTo(x + i * 8.5, -12); g.moveTo(x + i * 8.5, 12); g.lineTo(x + i * 8.5, 34); g.stroke(); }
      g.beginPath(); g.moveTo(x - 13, -23); g.lineTo(x + 13, -23); g.moveTo(x - 13, 23); g.lineTo(x + 13, 23); g.stroke();
      g.strokeStyle = '#c4d8ff'; g.lineWidth = 1.5; g.strokeRect(x - 13, -34, 26, 22); g.strokeRect(x - 13, 12, 26, 22);
      g.fillStyle = '#8a93b8'; g.fillRect(x - 1.5, -12, 3, 24);
    };
    panel(-4);
    const foil = g.createLinearGradient(0, -14, 0, 14);
    foil.addColorStop(0, '#ffe7a3'); foil.addColorStop(.45, '#e9b54a'); foil.addColorStop(1, '#8a5a1a');
    g.fillStyle = foil;
    g.beginPath(); g.moveTo(-14, -12); g.lineTo(12, -12); g.lineTo(18, -6); g.lineTo(18, 6); g.lineTo(12, 12); g.lineTo(-14, 12); g.lineTo(-18, 6); g.lineTo(-18, -6); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(80,46,10,.7)'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = 'rgba(255,245,210,.55)'; g.beginPath(); g.moveTo(-10, -8); g.lineTo(8, -8); g.moveTo(-12, 0); g.lineTo(14, 0); g.stroke();
    g.fillStyle = '#3a4466'; g.fillRect(-24, -5, 7, 10);
    g.fillStyle = '#5c6890'; g.beginPath(); g.moveTo(-24, -6); g.lineTo(-31, -9); g.lineTo(-31, 9); g.lineTo(-24, 6); g.closePath(); g.fill();
    g.save(); g.translate(10, -14); g.rotate(-.55);
    const dish = g.createLinearGradient(-14, 0, 14, 0);
    dish.addColorStop(0, '#f4f7ff'); dish.addColorStop(1, '#9aa5c6');
    g.fillStyle = dish; g.beginPath(); g.ellipse(0, -8, 15, 6, 0, Math.PI, Math.PI * 2); g.lineTo(15, -8); g.fill();
    g.strokeStyle = '#d9e1f7'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -8); g.lineTo(0, -17); g.stroke();
    g.fillStyle = '#ff6b5a'; g.beginPath(); g.arc(0, -18, 2, 0, Math.PI * 2); g.fill();
    g.restore();
    g.strokeStyle = '#aab4d4'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(18, 2); g.lineTo(44, 10); g.stroke();
    g.fillStyle = '#d6dcf0'; g.beginPath(); g.arc(44, 10, 2.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7ad7ff'; g.beginPath(); g.arc(4, 5, 2, 0, Math.PI * 2); g.fill();
  });
}
function lsFlameSprite(k) {
  return lsSprite(110 * k, 40 * k, (g, W, H) => {
    const cy = H / 2;
    const grd = g.createLinearGradient(W, 0, 0, 0);
    grd.addColorStop(0, 'rgba(255,255,240,1)'); grd.addColorStop(.18, 'rgba(255,224,120,.95)'); grd.addColorStop(.5, 'rgba(255,128,40,.7)'); grd.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = grd;
    g.beginPath(); g.moveTo(W, cy - H * .28); g.quadraticCurveTo(W * .45, cy - H * .5, 0, cy); g.quadraticCurveTo(W * .45, cy + H * .5, W, cy + H * .28); g.closePath(); g.fill();
    const core = g.createLinearGradient(W, 0, W * .4, 0);
    core.addColorStop(0, 'rgba(255,255,255,1)'); core.addColorStop(1, 'rgba(160,220,255,0)');
    g.fillStyle = core; g.beginPath(); g.moveTo(W, cy - H * .13); g.quadraticCurveTo(W * .7, cy, W * .4, cy); g.quadraticCurveTo(W * .7, cy, W, cy + H * .13); g.closePath(); g.fill();
  });
}
function lsGlowSprite(k, col, r) {
  return lsSprite(r * 2 * k, r * 2 * k, (g, W) => {
    const R = W / 2, grd = g.createRadialGradient(R, R, 0, R, R, R);
    grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, W, W);
  });
}
function lsNebula(W, H, seed) {
  const R = lsRng(seed);
  return lsSprite(W, H, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#060a1c'); bg.addColorStop(.6, '#0b1130'); bg.addColorStop(1, '#120f2e');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const cols = ['rgba(120,70,220,', 'rgba(40,120,220,', 'rgba(220,80,160,', 'rgba(40,180,200,'];
    for (let i = 0; i < 7; i++) {
      const x = R() * W, y = R() * H, r = (.25 + R() * .4) * Math.max(W, H), c = cols[i % cols.length];
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, c + (.1 + R() * .08) + ')'); grd.addColorStop(1, c + '0)');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(255,255,255,' + (.08 + R() * .25) + ')'; g.fillRect(R() * W, R() * H, 1, 1); }
  });
}
function lsScene(cv) {
  const S = { cv, ctx: cv.getContext('2d'), W: 960, H: 600, k: 1, port: false, lnau: 0, lnT: 0, speed: 0, burn: 0, burnC: '#ffb347', flash: 0, ring: 0, ringC: '#fff', t: 0, acc: 0, shake: 0, best: 0, labels: null, lang: '', spr: null, neb: null, pmax: 130, quiet: false, idle: 0, dirty: true };
  const NS = 240, sx = new Float32Array(NS), sy = new Float32Array(NS), sl = new Uint8Array(NS), sz = new Float32Array(NS), sa = new Float32Array(NS);
  const R0 = lsRng(97);
  for (let i = 0; i < NS; i++) { sx[i] = R0(); sy[i] = R0(); sl[i] = i % 3; sz[i] = sl[i] === 2 ? 1.8 : sl[i] === 1 ? 1.25 : .8; sa[i] = .35 + R0() * .6; }
  const NB = 70, bx = new Float32Array(NB), by = new Float32Array(NB), br = new Float32Array(NB);
  for (let i = 0; i < NB; i++) { bx[i] = Math.log(2.1) + R0() * (Math.log(3.3) - Math.log(2.1)); by[i] = (R0() - .5) * 2; br[i] = 1 + R0() * 2.6; }
  const NK = 90, kx = new Float32Array(NK), ky = new Float32Array(NK), kr = new Float32Array(NK);
  for (let i = 0; i < NK; i++) { kx[i] = Math.log(30) + R0() * (Math.log(55) - Math.log(30)); ky[i] = (R0() - .5) * 2; kr[i] = .8 + R0() * 1.8; }
  const LAYER = [.12, .35, .8];
  function sprites() {
    const k = S.k;
    S.spr = { planets: LS_VIS.map(v => ({ v, c: lsPlanetSprite(v, k) })), probe: lsProbeSprite(k), flame: lsFlameSprite(k), sun: lsGlowSprite(k, 'rgba(255,220,140,.9)', 160), flash: lsGlowSprite(k, 'rgba(255,255,255,.95)', 90), rock: lsGlowSprite(k, 'rgba(200,190,170,1)', 4), ice: lsGlowSprite(k, 'rgba(190,230,255,1)', 4) };
    S.neb = lsNebula(Math.round(S.W * k), Math.round(S.H * k), 7);
  }
  S.resize = (W, H, k, port) => {
    const ch = W !== S.W || H !== S.H || Math.abs(k - S.k) > .01 || !S.spr;
    S.W = W; S.H = H; S.k = k; S.port = port;
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if (ch) sprites();
    S.dirty = true;
  };
  S.px = () => S.W * (S.port ? .36 : .3);
  S.py = () => S.port ? 300 + (S.H - 300) * .4 : S.H * .7;
  S.set = (pts, now) => { S.lnT = Math.log(lsAuOf(pts)); if (now) { S.lnau = S.lnT; S.speed = 0; } S.dirty = true; };
  S.boost = tier => {
    const tt = LS_TIERS[Math.max(0, Math.min(5, tier))];
    S.burn = Math.min(1.6, .55 + tier * .2); S.burnC = tt.c; S.ring = tier >= 4 ? 1 : 0; S.ringC = tt.c; S.flash = tier >= 5 ? 1 : 0; S.shake = tier >= 4 ? .6 : .2;
  };
  S.step = dt => {
    S.t += dt;
    const prev = S.lnau;
    S.lnau += (S.lnT - S.lnau) * (1 - Math.exp(-dt * 1.9));
    if (Math.abs(S.lnT - S.lnau) < 1e-5) S.lnau = S.lnT;
    const v = (S.lnau - prev) / Math.max(1e-4, dt);
    S.speed += (v - S.speed) * Math.min(1, dt * 8);
    S.burn = Math.max(0, S.burn - dt * .9);
    S.flash = Math.max(0, S.flash - dt * 1.6);
    S.ring = Math.max(0, S.ring - dt * .9);
    S.shake = Math.max(0, S.shake - dt * 1.5);
    const drift = 6 + S.speed * LS_LOGK;
    for (let i = 0; i < NS; i++) { sx[i] -= drift * LAYER[sl[i]] * dt / S.W; if (sx[i] < 0) sx[i] += 1; }
  };
  function label(txt, x, y, col) {
    const g = S.ctx;
    g.font = '700 12px system-ui, "Segoe UI", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillStyle = 'rgba(5,8,25,.55)'; const w = g.measureText(txt).width + 12; g.fillRect(x - w / 2, y - 2, w, 17);
    g.fillStyle = col || 'rgba(225,232,255,.92)'; g.fillText(txt, x, y);
  }
  function curtain(au, col, txt, la, K, px, lb) {
    const g = S.ctx, H = S.H, x = px + (Math.log(au) - la) * K;
    if (x < -60 || x > S.W + 60) return;
    g.strokeStyle = col; g.lineWidth = 2; g.globalAlpha = .55; g.beginPath();
    for (let y = 0; y <= H; y += 12) { const xx = x + Math.sin(y * .04 + S.t * 1.4) * 10; if (y === 0) g.moveTo(xx, y); else g.lineTo(xx, y); }
    g.stroke(); g.globalAlpha = .12; g.lineWidth = 26; g.stroke(); g.globalAlpha = 1;
    if (lb) label(lb[txt] || txt, x, S.port ? 64 : 92, col);
  }
  S.draw = () => {
    const g = S.ctx, W = S.W, H = S.H, k = S.k, px = S.px(), py = S.py();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(S.neb, 0, 0);
    g.setTransform(k, 0, 0, k, 0, 0);
    const sh = S.shake > 0 ? S.shake * 3 : 0, ox = sh ? Math.sin(S.t * 71) * sh : 0, oy = sh ? Math.cos(S.t * 53) * sh : 0;
    g.translate(ox, oy);
    const streak = Math.min(90, S.speed * LS_LOGK * .06);
    g.fillStyle = '#ffffff';
    for (let L = 0; L < 3; L++) {
      g.globalAlpha = L === 0 ? .45 : L === 1 ? .7 : .95;
      if (streak > 2) {
        g.strokeStyle = '#dfe8ff'; g.lineWidth = L === 2 ? 1.5 : 1; g.beginPath();
        for (let i = 0; i < NS; i++) { if (sl[i] !== L) continue; const x = sx[i] * W, y = sy[i] * H; g.moveTo(x, y); g.lineTo(x + streak * LAYER[L] * 1.6, y); }
        g.stroke();
      } else {
        for (let i = 0; i < NS; i++) { if (sl[i] !== L) continue; const tw = .75 + .25 * Math.sin(S.t * (1.3 + i % 7) + i); g.globalAlpha = sa[i] * tw * (L === 0 ? .6 : 1); g.fillRect(sx[i] * W, sy[i] * H, sz[i], sz[i]); }
      }
    }
    g.globalAlpha = 1;
    const la = S.lnau, sp = S.spr, K = LS_LOGK * (S.port ? .75 : 1);
    const sunX = px + (Math.log(.32) - la) * K;
    if (sunX > -200) { g.globalAlpha = Math.max(0, Math.min(1, (sunX + 200) / 300)); g.drawImage(sp.sun, sunX - 160, py - 160 - 40, 320, 320); g.globalAlpha = 1; }
    const yS = S.port ? .8 : 1;
    for (let i = 0; i < NB; i++) { const x = px + (bx[i] - la) * K; if (x < -10 || x > W + 10) continue; g.drawImage(sp.rock, x - br[i], py + by[i] * 120 * yS - br[i], br[i] * 2, br[i] * 2); }
    for (let i = 0; i < NK; i++) { const x = px + (kx[i] - la) * K; if (x < -10 || x > W + 10) continue; g.drawImage(sp.ice, x - kr[i], py + ky[i] * 150 * yS - kr[i], kr[i] * 2, kr[i] * 2); }
    const lb = S.labels;
    for (let i = 0; i < sp.planets.length; i++) {
      const P = sp.planets[i], v = P.v, x = px + (Math.log(v.au) - la) * K, w = P.c.width / k, h = P.c.height / k;
      if (x + w / 2 < 0 || x - w / 2 > W) continue;
      const y = py + v.dy * yS;
      g.drawImage(P.c, x - w / 2, y - h / 2, w, h);
      if (lb) label(lb[v.b] || v.b, x, y + v.r + (v.ring ? 18 : 8));
    }
    curtain(94, '#7ad7ff', 'Termination shock', la, K, px, lb);
    curtain(121, '#c79bff', 'Heliopause', la, K, px, lb);
    const vx = px + (Math.log(167) - la) * K;
    if (vx > -40 && vx < W + 40) { g.save(); g.translate(vx, py - 70); g.scale(.4, .4); g.drawImage(sp.probe, -60, -40, 120, 80); g.restore(); if (lb) label(lb['Voyager 1'] || 'Voyager 1', vx, py - 50); }
    const fl = .75 + .25 * Math.sin(S.t * 38) + .1 * Math.sin(S.t * 23);
    const bob = Math.sin(S.t * 1.7) * 3, ang = Math.sin(S.t * .9) * .03;
    g.save(); g.translate(px, py + bob); g.rotate(ang);
    const bl = S.burn + Math.min(.5, S.speed * 3);
    if (bl > .02) {
      const L = (24 + 90 * Math.min(1.3, bl)) * fl, Hh = 18 + 10 * Math.min(1, bl);
      g.globalAlpha = Math.min(1, bl * 1.4);
      g.drawImage(sp.flame, -31 - L, -Hh / 2, L, Hh);
      g.globalAlpha = 1;
    } else {
      g.globalAlpha = .55 + .2 * Math.sin(S.t * 6); g.drawImage(sp.flame, -40, -4, 10, 8); g.globalAlpha = 1;
    }
    g.drawImage(sp.probe, -60, -40, 120, 80);
    g.restore();
    if (S.ring > 0) {
      const r = (1 - S.ring) * 180 + 20;
      g.strokeStyle = S.ringC; g.globalAlpha = S.ring * .8; g.lineWidth = 3 + S.ring * 6; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
    if (S.flash > 0) { g.globalAlpha = S.flash; g.drawImage(sp.flash, px - 140, py - 140, 280, 280); g.globalAlpha = 1; }
    g.setTransform(k, 0, 0, k, 0, 0);
    if (!S.quiet) track();
    S.dirty = false;
  };
  function track() {
    const g = S.ctx, W = S.W, H = S.H, x0 = 22, x1 = W - 22, y = H - 20;
    const au = Math.exp(S.lnau), mx = au > 100 || S.pmax > 130 ? 2500 : 130, l0 = Math.log(.8), l1 = Math.log(mx);
    const X = a => x0 + (Math.log(Math.max(.8, Math.min(mx, a))) - l0) / (l1 - l0) * (x1 - x0);
    g.fillStyle = 'rgba(6,10,30,.55)'; g.fillRect(x0 - 10, y - 13, x1 - x0 + 20, 26);
    g.strokeStyle = 'rgba(160,180,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    const xa = X(au);
    g.strokeStyle = '#ffb45a'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(1), y); g.lineTo(xa, y); g.stroke();
    const lb = S.labels;
    let next = null;
    for (const b of LS_BODIES) {
      if (b.au < 1 || b.au > mx) continue;
      const x = X(b.au), passed = b.au <= au;
      g.fillStyle = passed ? '#ffd28a' : 'rgba(200,210,255,.55)';
      g.beginPath(); g.arc(x, y, b.n === 'Earth' ? 3.5 : 2.5, 0, Math.PI * 2); g.fill();
      if (!passed && !next) next = b;
    }
    if (S.best > 0) { const xb = X(lsAuOf(S.best)); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(xb, y - 8); g.lineTo(xb, y + 8); g.stroke(); }
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(xa + 7, y); g.lineTo(xa - 4, y - 5); g.lineTo(xa - 4, y + 5); g.closePath(); g.fill();
    if (next && lb) {
      if (S.nextKey !== next.n + S.lang) { S.nextKey = next.n + S.lang; S.nextTxt = (lb.next || 'Next: {name}').replace('{name}', lb[next.n] || next.n); }
      g.font = '700 11px system-ui, "Segoe UI", sans-serif'; g.textBaseline = 'middle';
      const xn = X(next.au), tw = g.measureText(S.nextTxt).width;
      const al = xn + tw / 2 > x1 ? 'right' : xn - tw / 2 < x0 ? 'left' : 'center';
      g.textAlign = al; g.fillStyle = 'rgba(220,228,255,.9)';
      g.fillText(S.nextTxt, al === 'right' ? x1 : al === 'left' ? x0 : xn, y - 22);
    }
  }
  return S;
}
function lsCardCanvas(o) {
  const W = 1080, H = 1350, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), F = 'system-ui, "Segoe UI", Roboto, sans-serif';
  g.drawImage(lsNebula(W, H, 31 + (o.day || 0)), 0, 0);
  const R = lsRng(5);
  for (let i = 0; i < 180; i++) { g.fillStyle = 'rgba(255,255,255,' + (.3 + R() * .6) + ')'; const s = R() < .1 ? 3 : 1.6; g.fillRect(R() * W, R() * H, s, s); }
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#ffd28a'; g.font = '900 40px ' + F; g.fillText(o.kicker, W / 2, 120);
  g.fillStyle = '#ffffff'; g.font = '900 110px ' + F; g.fillText('LONG SHOT', W / 2, 235);
  g.fillStyle = 'rgba(220,228,255,.85)'; g.font = '700 38px ' + F; g.fillText(o.sub, W / 2, 300);
  const v = LS_VIS.slice().reverse().find(x => x.au <= lsAuOf(o.pts)) || LS_VIS[0];
  const pl = lsPlanetSprite(Object.assign({}, v, { r: 150 }), 1);
  g.drawImage(pl, W / 2 + 120 - pl.width / 2, 560 - pl.height / 2);
  g.save(); g.translate(W / 2 - 150, 600); g.scale(2.6, 2.6);
  g.drawImage(lsFlameSprite(1), -31 - 90, -12, 90, 24); g.drawImage(lsProbeSprite(1), -60, -40); g.restore();
  g.fillStyle = '#ffffff'; g.font = '900 96px ' + F; g.fillText(o.dist, W / 2, 860);
  g.fillStyle = '#ffd28a'; g.font = '800 44px ' + F; g.fillText(o.zone, W / 2, 925);
  const n = o.tiers.length, gap = 128, x0 = W / 2 - (n - 1) * gap / 2;
  o.tiers.forEach((t, i) => {
    const x = x0 + i * gap, y = 1050, tt = t >= 0 ? LS_TIERS[t] : LS_MISS;
    g.fillStyle = tt.c; g.globalAlpha = t >= 0 ? 1 : .55; g.beginPath(); g.arc(x, y, 46, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#0b1130'; g.font = '900 34px ' + F; g.fillText(t >= 0 ? String(tt.p) : '0', x, y + 12);
  });
  g.fillStyle = '#ffffff'; g.font = '900 64px ' + F; g.fillText(o.score, W / 2, 1185);
  g.fillStyle = 'rgba(220,228,255,.7)'; g.font = '700 32px ' + F; g.fillText('gameplaygames.web.app', W / 2, 1290);
  return c;
}
