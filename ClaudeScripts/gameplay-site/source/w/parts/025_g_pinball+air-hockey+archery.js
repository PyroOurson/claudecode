
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const font = (w, px, it) => `${it ? 'italic ' : ''}${w} ${px}px Nunito, system-ui, sans-serif`;
  const num = v => Math.round(v).toLocaleString('en-US');
  const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const arcPts = (cx, cy, r, a0, a1, n) => {
    const p = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return p;
  };
  const strokePts = (x, pts) => {
    x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
    x.stroke();
  };

  const seg = (ax, ay, bx, by, o) => {
    const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1e-6;
    return Object.assign({ ax, ay, bx, by, dx, dy, l2: l * l, nx: -dy / l, ny: dx / l, r: 0, e: .5 }, o);
  };
  const HIT = { nx: 0, ny: 0, vn: 0, t: 0 };
  function hitSeg(b, R, s) {
    if (s.one && (b.x - s.ax) * s.nx + (b.y - s.ay) * s.ny < R * .5) return false;
    let t = ((b.x - s.ax) * s.dx + (b.y - s.ay) * s.dy) / s.l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = s.ax + s.dx * t, py = s.ay + s.dy * t, rr = R + s.r;
    let nx = b.x - px, ny = b.y - py;
    const d2 = nx * nx + ny * ny;
    if (d2 >= rr * rr) return false;
    const d = Math.sqrt(d2);
    if (d > 1e-6) { nx /= d; ny /= d; } else { nx = s.nx; ny = s.ny; }
    b.x = px + nx * rr; b.y = py + ny * rr;
    const vn = b.vx * nx + b.vy * ny;
    HIT.nx = nx; HIT.ny = ny; HIT.vn = vn; HIT.t = t;
    if (vn < 0) { const k = (1 + (vn > -45 ? 0 : s.e)) * vn; b.vx -= k * nx; b.vy -= k * ny; }
    return true;
  }

  const layer = (w, h, dpr, fn) => {
    const c = document.createElement('canvas');
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    fn(x);
    return c;
  };

  const sparks = () => {
    const P = [];
    return {
      burst(x, y, n, color, spd, life, grav = 0, size = 2.5) {
        for (let i = 0; i < n; i++) {
          if (P.length > 280) P.shift();
          const a = Math.random() * TAU, s = spd * (.25 + Math.random() * .75);
          P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life * (.55 + Math.random() * .45), t: 0, color, g: grav, r: size * (.5 + Math.random() * .7) });
        }
      },
      update(dt) {
        for (let i = P.length - 1; i >= 0; i--) {
          const p = P[i];
          p.t += dt;
          if (p.t >= p.life) { P.splice(i, 1); continue; }
          const k = 1 - 2.2 * dt;
          p.vx *= k; p.vy = p.vy * k + p.g * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
        }
      },
      draw(ctx, add) {
        if (!P.length) return;
        if (add) ctx.globalCompositeOperation = 'lighter';
        for (const p of P) {
          const k = 1 - p.t / p.life;
          ctx.globalAlpha = k; ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.4 + .6 * k), 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      },
      clear() { P.length = 0; }
    };
  };

  const banner = (ctx, m, x, y, size) => {
    if (!m || m.t > m.life) return;
    const k = m.t, a = Math.min(1, (m.life - k) / .35), s = 1 + .35 * Math.max(0, 1 - k * 7);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = font(900, size, 1); ctx.lineJoin = 'round';
    ctx.lineWidth = size * .22; ctx.strokeStyle = 'rgba(26,12,60,.85)'; ctx.strokeText(m.a, 0, 0);
    const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
    g.addColorStop(0, '#fffbe0'); g.addColorStop(.5, m.c || '#ffd23f'); g.addColorStop(1, m.c2 || '#ff8a2a');
    ctx.fillStyle = g; ctx.fillText(m.a, 0, 0);
    if (m.b) {
      ctx.font = font(900, Math.round(size * .4)); ctx.lineWidth = size * .12;
      ctx.strokeText(m.b, 0, size * .78); ctx.fillStyle = '#fff'; ctx.fillText(m.b, 0, size * .78);
    }
    ctx.restore();
  };

  Ameplay.register({
    id: 'pinball',
    title: 'Pinball',
    category: 'Arcade',
    blurb: 'Flippers, pop bumpers, a ramp and a jackpot. Keep the ball alive.',
    help: '<kbd>Z</kbd> / <kbd>←</kbd> left flipper · <kbd>M</kbd> / <kbd>→</kbd> right flipper · hold <kbd>Space</kbd> / <kbd>↓</kbd> to pull the plunger, release to launch · touch: tap left / right half, hold to plunge',
    better: 'high',
    format: num,
    width: 600,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 42l17 8" stroke-width="6"/><path d="M54 42l-17 8" stroke-width="6"/><circle cx="36" cy="18" r="7"/><circle cx="34" cy="16" r="2" fill="currentColor"/><circle cx="17" cy="22" r="5" opacity=".3"/><circle cx="48" cy="30" r="4" opacity=".3"/></svg>',
    mount(root, api) {
      const W = 520, H = 820, R = 10, G = 1050, HS = 1 / 600, VMAX = 2400, LANE = 474, PLX = 489, PL0 = 772, HW = 16;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      const dpr = canvas.width / W, fx = sparks();

      const segs = [], rails = [], chromes = [], rubbers = [];
      const poly = (pts, o, list) => {
        for (let i = 0; i < pts.length - 1; i++) segs.push(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], o));
        if (list) list.push({ pts, r: o.r });
      };
      poly([[20, 840], ...arcPts(262, 262, 242, Math.PI, TAU, 56), [504, 840]], { r: 2, e: .4 }, rails);
      poly([[LANE, 840], [LANE, 330]], { r: 2, e: .4 }, rails);
      segs.push(seg(504, 300, LANE, 330, { r: 1.5, e: .2, one: true }));
      const guideL = [[56, 560], [56, 668], [146, 707]];
      poly(guideL, { r: 3, e: .3 }, chromes);
      poly(guideL.map(([x, y]) => [494 - x, y]), { r: 3, e: .3 }, chromes);
      poly([[20, 395], [52, 434]], { r: 4, e: .7 }, rubbers);
      poly([[LANE, 395], [442, 434]], { r: 4, e: .7 }, rubbers);
      for (const x of [150, 200, 250, 300]) poly([[x, 84], [x, 126]], { r: 5, e: .5 }, rubbers);
      poly([[327, 476], [327, 448]], { r: 3, e: .4 }, chromes);
      poly([[363, 476], [363, 448]], { r: 3, e: .4 }, chromes);
      const slings = [[[92, 585], [92, 645], [128, 667]], [[402, 585], [402, 645], [366, 667]]].map(p => {
        const sl = { p, flash: 0, cool: 0 };
        poly(p, { r: 4, e: .3 });
        segs.push(seg(p[2][0], p[2][1], p[0][0], p[0][1], { r: 4, e: .5, k: 1, sl }));
        return sl;
      });
      const TU = [.853, -.522], TN = [.522, .853];
      const targets = [-1.5, -.5, .5, 1.5].map(k => {
        const cx = 150 + TU[0] * 31 * k, cy = 447 + TU[1] * 31 * k;
        return { cx, cy, up: true, flash: 0, s: seg(cx - TU[0] * 12, cy - TU[1] * 12, cx + TU[0] * 12, cy + TU[1] * 12, { r: 4, e: .35 }) };
      });
      const BCOL = [['#ff3d71', '#ffd1dc'], ['#ffb02e', '#fff0c2'], ['#2ec7ff', '#d2f4ff']];
      const bumpers = [[168, 228], [292, 210], [232, 304]].map(([x, y], i) => ({ x, y, r: 24, flash: 0, cool: 0, c: BCOL[i] }));
      const mkF = (px, rest, up) => ({ px, py: 722, len: 72, r1: 11, r2: 6, rest, up, a: rest, w: 0, keys: new Set(), ptr: 0 });
      const flips = [mkF(157, .52, -.47), mkF(337, Math.PI - .52, Math.PI + .47)];
      const rampPts = [[345, 476], [345, 252], ...arcPts(382, 252, 37, Math.PI, TAU, 14).slice(1, -1), [419, 252], [419, 575]];
      const rseg = [];
      let RTOT = 0;
      for (let i = 0; i < rampPts.length - 1; i++) {
        const s = seg(rampPts[i][0], rampPts[i][1], rampPts[i + 1][0], rampPts[i + 1][1]);
        s.len = Math.sqrt(s.l2); s.ux = s.dx / s.len; s.uy = s.dy / s.len; s.s0 = RTOT; RTOT += s.len;
        rseg.push(s);
      }
      const lanes = [175, 225, 275].map(x => ({ x, y: 106, lit: false, in: false }));
      const sens = [[74, 612, 1000, 0], [420, 612, 1000, 0], [38, 640, 2500, 1], [456, 640, 2500, 1]].map(([x, y, pts, out]) => ({ x, y, pts, out, in: false, flash: 0 }));

      const mkIns = (x, y, r, col) => {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8);
        glow.addColorStop(0, col + 'aa'); glow.addColorStop(.4, col + '44'); glow.addColorStop(1, col + '00');
        const core = ctx.createRadialGradient(x - r * .3, y - r * .35, 0, x, y, r);
        core.addColorStop(0, '#ffffff'); core.addColorStop(.45, col); core.addColorStop(1, col + 'cc');
        return { x, y, r, col, glow, core };
      };
      const laneIns = lanes.map(l => mkIns(l.x, 152, 6, '#ffe45c'));
      const multIns = [0, 1, 2, 3, 4].map(k => mkIns(187 + k * 30, 618 + (k - 2) * (k - 2) * 4, 10, '#ff9d2e'));
      const tgtIns = targets.map(t => mkIns(t.cx + TN[0] * 21, t.cy + TN[1] * 21, 5, '#4ad7ff'));
      const senIns = sens.map(s => mkIns(s.x, s.y + 30, 5, '#7dff6a'));
      const jackIns = mkIns(345, 540, 9, '#ffd23f');
      const saveIns = mkIns(247, 742, 7, '#ff4d6d');
      const insLit = (i, on) => {
        if (!on) return;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = i.glow; ctx.fillRect(i.x - i.r * 2.8, i.y - i.r * 2.8, i.r * 5.6, i.r * 5.6);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = i.core; ctx.beginPath(); ctx.arc(i.x, i.y, i.r, 0, TAU); ctx.fill();
      };
      const insDim = (x, i) => {
        x.fillStyle = i.col + '38'; x.beginPath(); x.arc(i.x, i.y, i.r, 0, TAU); x.fill();
        x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1.5; x.stroke();
        x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(i.x - i.r * .3, i.y - i.r * .35, i.r * .35, 0, TAU); x.fill();
      };

      const playPath = x => { x.beginPath(); x.moveTo(20, 840); x.lineTo(20, 262); x.arc(262, 262, 242, Math.PI, TAU); x.lineTo(504, 840); x.closePath(); };
      const chevron = (x, cx, cy, s, a, col) => {
        x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = col;
        x.beginPath(); x.moveTo(-s, -s * .5); x.lineTo(0, s * .5); x.lineTo(s, -s * .5); x.lineTo(s, s * .05); x.lineTo(0, s * 1.05); x.lineTo(-s, s * .05); x.closePath(); x.fill();
        x.restore();
      };
      const metal = (x, list, w) => {
        x.lineCap = x.lineJoin = 'round';
        for (const [lw, col, o] of [[w + 1.5, '#262536', 0], [w * .55, '#c9cedb', 0], [1.1, 'rgba(255,255,255,.9)', -.8]]) {
          x.lineWidth = lw; x.strokeStyle = col; x.save(); x.translate(o, o);
          for (const p of list) strokePts(x, p.pts || p);
          x.restore();
        }
      };
      const bg = layer(W, H, dpr, x => {
        let g = x.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, '#0c0920'); g.addColorStop(.5, '#251b4a'); g.addColorStop(1, '#0c0920');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.save(); playPath(x); x.clip();
        g = x.createLinearGradient(0, 0, 0, H);
        [[0, '#191451'], [.3, '#3a1a7d'], [.6, '#8b1f79'], [.85, '#d63f60'], [1, '#ff8a48']].forEach(s => g.addColorStop(s[0], s[1]));
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.save(); x.translate(232, 280);
        for (let i = 0; i < 28; i++) {
          x.rotate(TAU / 28);
          x.fillStyle = i % 2 ? 'rgba(255,255,255,.045)' : 'rgba(255,214,140,.03)';
          x.beginPath(); x.moveTo(0, 0); x.lineTo(820, -46); x.lineTo(820, 46); x.fill();
        }
        x.restore();
        const glow = (cx, cy, r, c) => { const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r); gg.addColorStop(0, c); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); };
        glow(232, 258, 200, 'rgba(255,186,90,.4)'); glow(247, 655, 240, 'rgba(255,90,170,.28)');
        glow(110, 470, 130, 'rgba(70,200,255,.2)'); glow(400, 110, 150, 'rgba(120,120,255,.28)');
        const rnd = seeded(7);
        for (let i = 0; i < 120; i++) {
          const sx = 24 + rnd() * 450, sy = 26 + rnd() * 540, r = .5 + rnd() * 1.4;
          x.fillStyle = `rgba(255,255,255,${(.2 + rnd() * .6).toFixed(2)})`;
          x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.fill();
        }
        x.strokeStyle = 'rgba(255,255,255,.09)'; x.lineWidth = 14; x.beginPath(); x.arc(230, 250, 104, 0, TAU); x.stroke();
        x.setLineDash([3, 9]); x.strokeStyle = 'rgba(255,230,160,.4)'; x.lineWidth = 3; x.beginPath(); x.arc(230, 250, 126, 0, TAU); x.stroke(); x.setLineDash([]);
        for (const ln of lanes) {
          x.fillStyle = 'rgba(8,4,36,.38)'; x.beginPath(); x.roundRect(ln.x - 21, 72, 42, 96, 16); x.fill();
          chevron(x, ln.x, 124, 6, 0, 'rgba(255,228,92,.35)');
        }
        for (const s of sens) { x.fillStyle = 'rgba(8,4,36,.3)'; x.beginPath(); x.roundRect(s.x - 15, s.y - 30, 30, 76, 12); x.fill(); chevron(x, s.x, s.y - 8, 5, 0, s.out ? 'rgba(255,120,120,.4)' : 'rgba(125,255,106,.4)'); }
        for (let k = 0; k < 3; k++) chevron(x, 345, 586 - k * 16, 8, Math.PI, `rgba(255,210,63,${.18 + k * .08})`);
        g = x.createLinearGradient(LANE, 0, 504, 0); g.addColorStop(0, '#0e0a26'); g.addColorStop(.5, '#2a2152'); g.addColorStop(1, '#0e0a26');
        x.fillStyle = g; x.fillRect(LANE, 262, 30, 600);
        x.save(); x.translate(212, 372); x.rotate(-.13);
        x.font = font(900, 38, 1); x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
        x.lineWidth = 8; x.strokeStyle = '#170d3a'; x.strokeText('PINBALL', 0, 0);
        g = x.createLinearGradient(0, -18, 0, 18); g.addColorStop(0, '#fff6c0'); g.addColorStop(.5, '#ffc93c'); g.addColorStop(1, '#ff6f3c');
        x.fillStyle = g; x.fillText('PINBALL', 0, 0);
        x.restore();
        x.strokeStyle = 'rgba(8,4,36,.45)'; x.lineWidth = 12; x.lineCap = 'round';
        x.beginPath(); x.moveTo(150 - TU[0] * 62, 447 - TU[1] * 62); x.lineTo(150 + TU[0] * 62, 447 + TU[1] * 62); x.stroke();
        [...laneIns, ...multIns, ...tgtIns, ...senIns, jackIns, saveIns].forEach(i => insDim(x, i));
        x.fillStyle = 'rgba(255,255,255,.75)'; x.font = font(900, 9); x.textAlign = 'center'; x.textBaseline = 'middle';
        multIns.forEach((i, k) => x.fillText((k + 2) + 'X', i.x, i.y + 1));
        x.font = font(900, 8); x.fillText('JACKPOT', 345, 557); x.fillText('SHOOT AGAIN', 247, 727);
        x.save(); x.translate(345, 506); x.fillStyle = 'rgba(255,210,63,.22)'; x.beginPath(); x.moveTo(0, -16); x.lineTo(13, 6); x.lineTo(-13, 6); x.closePath(); x.fill(); x.restore();
        x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = HW * 2 + 8; x.lineJoin = 'round'; x.lineCap = 'butt';
        x.save(); x.translate(9, 12); strokePts(x, rampPts); x.restore();
        x.restore();
        x.save(); x.translate(3, 4); x.strokeStyle = 'rgba(0,0,0,.38)'; x.lineCap = x.lineJoin = 'round';
        x.lineWidth = 8; [...rails, ...chromes].forEach(p => strokePts(x, p.pts));
        rubbers.forEach(p => { x.lineWidth = p.r * 2 + 2; strokePts(x, p.pts); });
        x.fillStyle = 'rgba(0,0,0,.38)'; slings.forEach(s => { x.beginPath(); s.p.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.closePath(); x.fill(); x.lineWidth = 9; x.stroke(); });
        x.restore();
        metal(x, rails, 6); metal(x, chromes, 5);
        x.lineCap = x.lineJoin = 'round';
        for (const p of rubbers) {
          x.lineWidth = p.r * 2; x.strokeStyle = '#17131f'; strokePts(x, p.pts);
          x.lineWidth = 1.6; x.strokeStyle = 'rgba(255,255,255,.32)'; x.save(); x.translate(-1, -1.4); strokePts(x, p.pts); x.restore();
          if (p.r === 5) for (const q of p.pts) { x.fillStyle = '#d7dbe6'; x.beginPath(); x.arc(q[0], q[1], 2.2, 0, TAU); x.fill(); }
        }
        for (const s of slings) {
          const [a, b, c] = s.p, cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
          g = x.createLinearGradient(a[0], a[1], c[0], c[1]); g.addColorStop(0, '#ff5d8f'); g.addColorStop(1, '#ffb347');
          x.fillStyle = g; x.beginPath(); s.p.forEach((q, i) => { const qx = lerp(q[0], cx, .12), qy = lerp(q[1], cy, .12); i ? x.lineTo(qx, qy) : x.moveTo(qx, qy); }); x.closePath(); x.fill();
          x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.5; x.stroke();
          x.lineWidth = 8; x.strokeStyle = '#f4f4f8'; x.beginPath(); s.p.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.closePath(); x.stroke();
          x.lineWidth = 2; x.strokeStyle = 'rgba(0,0,0,.18)'; x.stroke();
          for (const q of s.p) { x.fillStyle = '#9aa0b0'; x.beginPath(); x.arc(q[0], q[1], 2.4, 0, TAU); x.fill(); }
        }
        x.lineWidth = 3; x.strokeStyle = '#e9ecf3'; x.beginPath(); x.moveTo(504, 300); x.lineTo(LANE, 330); x.stroke();
      });
      const fg = layer(W, H, dpr, x => {
        x.lineJoin = 'round'; x.lineCap = 'butt';
        x.strokeStyle = 'rgba(165,228,255,.2)'; x.lineWidth = HW * 2 + 6; strokePts(x, rampPts);
        x.strokeStyle = 'rgba(255,255,255,.09)'; x.lineWidth = 7; x.save(); x.translate(-5, -2); strokePts(x, rampPts); x.restore();
        const off = d => rampPts.map((p, i) => {
          const a = rampPts[Math.max(0, i - 1)], b = rampPts[Math.min(rampPts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
          return [p[0] - dy / l * d, p[1] + dx / l * d];
        });
        const sides = [off(-HW - 2), off(HW + 2)];
        x.lineCap = 'round';
        x.save(); x.translate(3, 4); x.strokeStyle = 'rgba(0,0,0,.3)'; x.lineWidth = 5; sides.forEach(p => strokePts(x, p)); x.restore();
        metal(x, sides, 3);
        let g = x.createLinearGradient(0, 470, 0, 480); g.addColorStop(0, '#e6e9f2'); g.addColorStop(1, '#7c8295');
        x.fillStyle = g; x.beginPath(); x.roundRect(325, 470, 40, 9, 3); x.fill();
        x.save(); x.translate(431, 420); x.rotate(Math.PI / 2); x.font = font(900, 11); x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillStyle = 'rgba(255,255,255,.55)'; x.fillText('R A M P', 0, 0); x.restore();
        g = x.createLinearGradient(0, 778, 0, 820); g.addColorStop(0, '#3d355e'); g.addColorStop(1, '#141024');
        x.fillStyle = g; x.beginPath(); x.moveTo(20, 820); x.lineTo(20, 788); x.quadraticCurveTo(20, 779, 30, 779); x.lineTo(464, 779); x.quadraticCurveTo(LANE, 779, LANE, 788); x.lineTo(LANE, 820); x.fill();
        x.strokeStyle = '#d2d6e2'; x.lineWidth = 2; x.beginPath(); x.moveTo(22, 780); x.lineTo(472, 780); x.stroke();
        x.fillStyle = '#07040e'; x.beginPath(); x.roundRect(170, 786, 154, 29, 7); x.fill();
        x.fillStyle = 'rgba(255,140,40,.09)';
        for (let yy = 789; yy < 813; yy += 3) for (let xx = 173; xx < 322; xx += 3) x.fillRect(xx, yy, 1.4, 1.4);
        for (const cx of [32, 334]) {
          g = x.createLinearGradient(0, 786, 0, 815); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#e8dcc8');
          x.fillStyle = g; x.beginPath(); x.roundRect(cx, 786, 128, 29, 5); x.fill();
        }
      });

      const b = { x: PLX, y: PL0 - R, vx: 0, vy: 0, layer: 0, live: false, idle: 0 };
      let state = 'idle', score = 0, ballNo = 1, mult = 1, ramps = 0, saveT = 0, saveUsed = false, launched = false;
      let gen = 0, acc = 0, pull = 0, pulling = false, plSnap = 0, msg = null, shake = 0, time = 0;
      const plY = () => PL0 + pull * 40;
      const say = (a, sub, life = 1.6, c, c2) => { msg = { a, b: sub, t: 0, life, c, c2 }; };
      const add = pts => { score += pts * mult; api.score(score); };
      const bumpMult = () => { if (mult < 6) { mult++; say(mult + 'X', 'Multiplier', 1.6, '#7dff6a', '#1fbf6a'); } };

      const resetBall = () => { b.x = PLX; b.y = PL0 - R; b.vx = b.vy = 0; b.layer = 0; b.live = true; b.idle = 0; launched = false; };
      const newBall = () => { resetBall(); mult = 1; saveUsed = false; saveT = 0; targets.forEach(t => { t.up = true; }); };

      const kick = s => {
        const sl = s.sl;
        if (HIT.t < .12 || HIT.t > .88 || HIT.vn > -30) return;
        const vn = b.vx * HIT.nx + b.vy * HIT.ny, tg = 880;
        if (vn < tg) { b.vx += (tg - vn) * HIT.nx; b.vy += (tg - vn) * HIT.ny; }
        if (sl.cool <= 0) { sl.cool = .1; sl.flash = 1; add(50); api.sfx('hit'); fx.burst(b.x - HIT.nx * R, b.y - HIT.ny * R, 10, '#fff2b0', 260, .35); }
      };
      const dropTarget = t => {
        if (HIT.vn > -60) return;
        t.up = false; t.flash = 1; add(750); api.sfx('tick');
        fx.burst(t.cx, t.cy, 12, '#7fe3ff', 220, .4);
        if (targets.every(q => !q.up)) {
          add(5000); bumpMult();
          const g0 = gen;
          api.timeout(() => { if (g0 === gen) targets.forEach(q => { q.up = true; }); }, 1600);
        }
      };
      const bumper = bm => {
        const dx = b.x - bm.x, dy = b.y - bm.y, rr = bm.r + R, d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr) return;
        const d = Math.sqrt(d2) || 1, nx = dx / d, ny = dy / d;
        b.x = bm.x + nx * rr; b.y = bm.y + ny * rr;
        const vn = b.vx * nx + b.vy * ny, tg = 760 + Math.max(0, -vn) * .3;
        if (vn < tg) { b.vx += (tg - vn) * nx; b.vy += (tg - vn) * ny; }
        if (bm.cool <= 0) { bm.cool = .08; bm.flash = 1; add(100); api.sfx('pop'); fx.burst(bm.x + nx * bm.r, bm.y + ny * bm.r, 9, bm.c[1], 240, .35); }
      };
      const flipHit = f => {
        const c = Math.cos(f.a), s = Math.sin(f.a), ex = c * f.len, ey = s * f.len;
        let t = ((b.x - f.px) * ex + (b.y - f.py) * ey) / (f.len * f.len);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = f.px + ex * t, qy = f.py + ey * t, rad = f.r1 + (f.r2 - f.r1) * t, rr = R + rad;
        let nx = b.x - qx, ny = b.y - qy;
        const d2 = nx * nx + ny * ny;
        if (d2 >= rr * rr) return;
        const d = Math.sqrt(d2);
        if (d > 1e-6) { nx /= d; ny /= d; } else { nx = -s; ny = c; }
        b.x = qx + nx * rr; b.y = qy + ny * rr;
        const cx = qx + nx * rad - f.px, cy = qy + ny * rad - f.py, svx = -f.w * cy, svy = f.w * cx;
        const rvn = (b.vx - svx) * nx + (b.vy - svy) * ny;
        if (rvn < 0) {
          const k = (1 + (rvn > -60 ? 0 : .3)) * rvn;
          b.vx -= k * nx; b.vy -= k * ny;
        }
      };
      const rampStep = () => {
        let bd = 1e18, bi = 0, bt = 0, braw = 0;
        for (let i = 0; i < rseg.length; i++) {
          const s = rseg[i];
          const raw = ((b.x - s.ax) * s.dx + (b.y - s.ay) * s.dy) / s.l2, t = raw < 0 ? 0 : raw > 1 ? 1 : raw;
          const qx = s.ax + s.dx * t - b.x, qy = s.ay + s.dy * t - b.y, d2 = qx * qx + qy * qy;
          if (d2 < bd) { bd = d2; bi = i; bt = t; braw = raw; }
        }
        const s = rseg[bi];
        if (bi === rseg.length - 1 && braw > 1) { b.layer = 0; rampDone(); return; }
        if (bi === 0 && braw < 0 && b.vx * s.ux + b.vy * s.uy < 0) { b.layer = 0; return; }
        const px = s.ax + s.dx * bt, py = s.ay + s.dy * bt, d = Math.sqrt(bd), lim = HW - R;
        if (d > lim) {
          const nx = (b.x - px) / d, ny = (b.y - py) / d;
          b.x = px + nx * lim; b.y = py + ny * lim;
          const vn = b.vx * nx + b.vy * ny;
          if (vn > 0) { b.vx -= 1.3 * vn * nx; b.vy -= 1.3 * vn * ny; }
        }
      };
      const rampDone = () => {
        ramps++;
        if (ramps % 3 === 0) { add(25000); say('JACKPOT', num(25000 * mult), 2.2, '#ffe45c', '#ff5d2a'); api.sfx('win'); shake = .35; fx.burst(419, 560, 40, '#ffd23f', 420, .8); }
        else { add(3000); say('RAMP', (3 - ramps % 3) + ' more for jackpot', 1.4, '#7fe3ff', '#2e8bff'); api.sfx('good'); fx.burst(419, 560, 14, '#7fe3ff', 260, .5); }
      };
      const laneHit = ln => {
        if (ln.lit) { add(100); return; }
        ln.lit = true; add(500); api.sfx('tick');
        if (lanes.every(l => l.lit)) {
          add(2000); bumpMult();
          const g0 = gen;
          api.timeout(() => { if (g0 === gen) lanes.forEach(l => { l.lit = false; }); }, 900);
        }
      };
      const drain = () => {
        b.live = false;
        if (saveT > 0) {
          saveT = 0; saveUsed = true; say('BALL SAVED', 'Shoot again', 1.6, '#ff8fa8', '#ff2d6b'); api.sfx('good');
          const g0 = gen;
          api.timeout(() => { if (g0 === gen) resetBall(); }, 700);
          return;
        }
        api.sfx('bad');
        const g0 = gen;
        if (ballNo >= 3) { say('GAME OVER', null, 2); api.timeout(() => { if (g0 === gen) over(); }, 1100); }
        else { say('BALL ' + (ballNo + 1), null, 1.4); api.timeout(() => { if (g0 === gen) { ballNo++; newBall(); } }, 1300); }
      };
      const near = (o, r) => { const dx = b.x - o.x, dy = b.y - o.y; return dx * dx + dy * dy < r * r; };
      const step = h => {
        for (const f of flips) {
          const on = f.keys.size > 0 || f.ptr > 0, tg = on ? f.up : f.rest, d = tg - f.a, sp = (on ? 32 : 22) * h;
          if (Math.abs(d) <= sp) { f.w = d / h; f.a = tg; } else { const sg = d > 0 ? 1 : -1; f.w = sg * sp / h; f.a += sg * sp; }
        }
        if (!b.live) return;
        b.vy += (b.layer ? G * 1.3 : G) * h;
        const dmp = 1 - .05 * h; b.vx *= dmp; b.vy *= dmp;
        const sp2 = b.vx * b.vx + b.vy * b.vy;
        if (sp2 > VMAX * VMAX) { const k = VMAX / Math.sqrt(sp2); b.vx *= k; b.vy *= k; }
        b.x += b.vx * h; b.y += b.vy * h;
        if (b.layer) { rampStep(); return; }
        for (let i = 0; i < segs.length; i++) { const s = segs[i]; if (hitSeg(b, R, s) && s.k) kick(s); }
        for (const t of targets) if (t.up && hitSeg(b, R, t.s)) dropTarget(t);
        for (const bm of bumpers) bumper(bm);
        for (const f of flips) flipHit(f);
        if (b.x > LANE) {
          const py = plY();
          if (b.y + R > py) { b.y = py - R; if (b.vy > 0) b.vy = b.vy > 150 ? -b.vy * .2 : 0; }
        } else if (!launched) { launched = true; if (!saveUsed) saveT = 10; }
        if (b.vy < -40 && Math.abs(b.x - 345) < 10 && b.y > 448 && b.y < 470) b.layer = 1;
        for (const ln of lanes) { const n = near(ln, 18); if (n && !ln.in) laneHit(ln); ln.in = n; }
        for (const s of sens) {
          const n = near(s, 16);
          if (n && !s.in) { s.flash = 1; add(s.pts); api.sfx(s.out ? 'bad' : 'tick'); if (s.out) say('OUTLANE', null, 1); }
          s.in = n;
        }
        if (b.y > 806) drain();
      };

      const start = () => {
        gen++; state = 'play'; score = 0; ballNo = 1; ramps = 0; msg = null; acc = 0; pull = 0; pulling = false;
        lanes.forEach(l => { l.lit = false; l.in = false; });
        flips.forEach(f => { f.keys.clear(); f.ptr = 0; });
        fx.clear(); newBall(); api.score(0);
        say('BALL 1', matchMedia('(pointer: coarse)').matches ? 'Hold the table to plunge' : 'Hold Space to plunge', 1.8);
      };
      const over = () => {
        state = 'over'; b.live = false;
        const nb = api.submit(score);
        api.overlay({
          kicker: nb ? 'New best!' : 'Game over', title: num(score) + ' pts',
          stats: [['Score', num(score)], ['Ramps', ramps], ['Best', api.best != null ? num(api.best) : '—']],
          button: 'Play again', onAction: start
        });
      };

      const KL = ['KeyZ', 'ArrowLeft', 'ShiftLeft', 'KeyA'], KR = ['KeyM', 'ArrowRight', 'ShiftRight', 'Slash', 'KeyL'], KP = ['Space', 'ArrowDown', 'KeyS'];
      const inLane = () => b.live && b.x > LANE && b.y > 600;
      const flipOn = (i, was) => {
        if (was || state !== 'play') return;
        api.sfx('tick');
        const l = lanes.map(q => q.lit);
        lanes.forEach((q, k) => { q.lit = i ? l[(k + 2) % 3] : l[(k + 1) % 3]; });
      };
      const release = () => {
        if (!pulling) return;
        pulling = false;
        if (pull > .04 && inLane() && b.y + R >= plY() - 4) { b.vy = -(780 + 1350 * pull); api.sfx('hit'); }
        plSnap = pull; pull = 0;
      };
      api.on(window, 'keydown', e => {
        if (state !== 'play' || e.repeat) return;
        const i = KL.includes(e.code) ? 0 : KR.includes(e.code) ? 1 : -1;
        if (i >= 0) { const f = flips[i], was = f.keys.size > 0 || f.ptr > 0; f.keys.add(e.code); flipOn(i, was); }
        else if (KP.includes(e.code) && inLane()) pulling = true;
      });
      api.on(window, 'keyup', e => {
        flips.forEach(f => f.keys.delete(e.code));
        if (KP.includes(e.code)) release();
      });
      api.on(window, 'blur', () => { flips.forEach(f => { f.keys.clear(); f.ptr = 0; }); release(); });
      const ptrs = new Map();
      api.on(canvas, 'pointerdown', e => {
        if (state !== 'play') return;
        e.preventDefault();
        const p = toLocal(e);
        if (inLane()) { ptrs.set(e.pointerId, { m: 'P', y0: p.y }); pulling = true; return; }
        const i = p.x < W / 2 ? 0 : 1, f = flips[i], was = f.keys.size > 0 || f.ptr > 0;
        f.ptr++; ptrs.set(e.pointerId, { m: i }); flipOn(i, was);
      });
      api.on(canvas, 'pointermove', e => {
        const q = ptrs.get(e.pointerId);
        if (q && q.m === 'P' && pulling) pull = Math.max(pull, clamp((toLocal(e).y - q.y0) / 110, 0, 1));
      });
      const up = e => {
        const q = ptrs.get(e.pointerId);
        if (!q) return;
        ptrs.delete(e.pointerId);
        if (q.m === 'P') release(); else flips[q.m].ptr = Math.max(0, flips[q.m].ptr - 1);
      };
      api.on(window, 'pointerup', up);
      api.on(window, 'pointercancel', up);
      canvas.addEventListener('contextmenu', e => e.preventDefault());

      const ballG = ctx.createRadialGradient(-3.6, -4.2, .5, 0, 0, R);
      [[0, '#ffffff'], [.22, '#eef1f6'], [.55, '#a3aab7'], [.82, '#5b6271'], [1, '#2a2f3a']].forEach(s => ballG.addColorStop(s[0], s[1]));
      const flipG = ctx.createLinearGradient(0, -11, 0, 11);
      flipG.addColorStop(0, '#ffffff'); flipG.addColorStop(.55, '#e9e6f3'); flipG.addColorStop(1, '#a9a4bd');
      const flipPath = (() => {
        const f = flips[0], ph = Math.asin((f.r1 - f.r2) / f.len), p = new Path2D();
        p.arc(f.len, 0, f.r2, ph - Math.PI / 2, Math.PI / 2 - ph);
        p.arc(0, 0, f.r1, Math.PI / 2 - ph, Math.PI * 1.5 + ph);
        p.closePath();
        return p;
      })();
      const bumpG = bumpers.map(bm => {
        const ring = ctx.createRadialGradient(-6, -8, 2, 0, 0, 27); ring.addColorStop(0, '#ffffff'); ring.addColorStop(.7, '#b9bfcc'); ring.addColorStop(1, '#5d6372');
        const cap = ctx.createRadialGradient(-5, -6, 1, 0, 0, 18); cap.addColorStop(0, '#ffffff'); cap.addColorStop(.6, bm.c[1]); cap.addColorStop(1, bm.c[0]);
        const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 46); glow.addColorStop(0, bm.c[0] + 'cc'); glow.addColorStop(1, bm.c[0] + '00');
        return { ring, cap, glow };
      });
      const tgtG = ctx.createLinearGradient(0, -5, 0, 5);
      tgtG.addColorStop(0, '#fff7a8'); tgtG.addColorStop(.5, '#ffd23f'); tgtG.addColorStop(1, '#e08a00');

      const drawBall = () => {
        const lift = b.layer ? 2.2 : 1;
        ctx.fillStyle = 'rgba(12,4,30,.42)';
        ctx.beginPath(); ctx.ellipse(b.x + 3.5 * lift, b.y + 5 * lift, R * 1.02, R * .92, 0, 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(b.x, b.y);
        ctx.fillStyle = ballG; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,150,120,.28)'; ctx.beginPath(); ctx.ellipse(0, R * .5, R * .7, R * .32, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(-3.4, -4.2, 2.3, 0, TAU); ctx.fill();
        ctx.restore();
      };
      const drawFlipper = f => {
        ctx.save(); ctx.translate(f.px + 4, f.py + 6); ctx.rotate(f.a); ctx.fillStyle = 'rgba(12,4,30,.4)'; ctx.fill(flipPath); ctx.restore();
        ctx.save(); ctx.translate(f.px, f.py); ctx.rotate(f.a); if (f.rest > 1) ctx.scale(1, -1);
        ctx.fillStyle = flipG; ctx.fill(flipPath);
        ctx.lineWidth = 3.2; ctx.strokeStyle = '#ff2f5b'; ctx.stroke(flipPath);
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(f.len - 6, -3); ctx.stroke();
        ctx.fillStyle = '#c3c8d4'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-1, -1, 1.5, 0, TAU); ctx.fill();
        ctx.restore();
      };
      const drawBumper = (bm, gg) => {
        ctx.save(); ctx.translate(bm.x, bm.y);
        ctx.fillStyle = 'rgba(12,4,30,.42)'; ctx.beginPath(); ctx.arc(5, 7, 27, 0, TAU); ctx.fill();
        if (bm.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = bm.flash; ctx.fillStyle = gg.glow; ctx.fillRect(-46, -46, 92, 92); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
        ctx.fillStyle = gg.ring; ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fill();
        ctx.fillStyle = bm.c[0]; ctx.beginPath(); ctx.arc(0, 0, 22.5, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(1.5, 2, 18, 0, TAU); ctx.fill();
        const s = 1 - bm.flash * .1;
        ctx.scale(s, s);
        ctx.fillStyle = gg.cap; ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.stroke();
        ctx.fillStyle = bm.flash > .2 ? '#ffffff' : bm.c[0]; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
        ctx.restore();
      };
      const drawTargets = () => {
        const a = Math.atan2(TU[1], TU[0]);
        for (const t of targets) {
          ctx.save(); ctx.translate(t.cx, t.cy); ctx.rotate(a);
          if (t.up) {
            ctx.fillStyle = 'rgba(12,4,30,.45)'; ctx.fillRect(-11, 1, 26, 10);
            ctx.fillStyle = tgtG; ctx.beginPath(); ctx.roundRect(-12, -4.5, 24, 9, 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-10, -3.5, 20, 1.6);
            ctx.strokeStyle = '#8a4a00'; ctx.lineWidth = 1; ctx.strokeRect(-12, -4.5, 24, 9);
          } else {
            ctx.fillStyle = '#05030c'; ctx.beginPath(); ctx.roundRect(-12, -2.5, 24, 5, 2); ctx.fill();
          }
          ctx.restore();
        }
      };
      const drawPlunger = () => {
        const y = plY() + (plSnap > 0 ? -Math.sin(Math.min(1, plSnap) * 9) * plSnap * 6 : 0);
        ctx.strokeStyle = '#3a3d4c'; ctx.lineWidth = 2;
        ctx.beginPath();
        const top = y + 8, n = 8;
        for (let i = 0; i <= n * 2; i++) { const yy = top + (816 - top) * i / (n * 2); ctx.lineTo(i % 2 ? 498 : 480, yy); }
        ctx.stroke();
        ctx.fillStyle = '#9aa1b2'; ctx.fillRect(486, top, 6, 820 - top);
        const g = ctx.createLinearGradient(478, 0, 500, 0); g.addColorStop(0, '#7d8396'); g.addColorStop(.4, '#ffffff'); g.addColorStop(1, '#6a7083');
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(478, y, 22, 9, 3); ctx.fill();
      };

      const draw = t => {
        ctx.save();
        if (shake > 0) ctx.translate((Math.random() - .5) * 6 * shake, (Math.random() - .5) * 6 * shake);
        ctx.drawImage(bg, 0, 0, W, H);
        const blink = (t / 250 | 0) % 2 === 0;
        lanes.forEach((l, i) => insLit(laneIns[i], l.lit));
        multIns.forEach((ins, k) => insLit(ins, mult >= k + 2));
        targets.forEach((tg, i) => insLit(tgtIns[i], !tg.up));
        sens.forEach((s, i) => insLit(senIns[i], s.flash > 0 && blink));
        insLit(jackIns, ramps % 3 === 2 && (t / 160 | 0) % 2 === 0);
        insLit(saveIns, saveT > 0 && (saveT > 3 || blink));
        if ((t / 400 | 0) % 2 === 0) {
          ctx.save(); ctx.translate(345, 506); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,210,63,.65)';
          ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(13, 6); ctx.lineTo(-13, 6); ctx.closePath(); ctx.fill(); ctx.restore();
        }
        drawTargets();
        for (const sl of slings) {
          if (sl.flash <= 0) continue;
          ctx.globalAlpha = sl.flash; ctx.strokeStyle = '#fff6b0'; ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(sl.p[2][0], sl.p[2][1]); ctx.lineTo(sl.p[0][0], sl.p[0][1]); ctx.stroke(); ctx.globalAlpha = 1;
        }
        bumpers.forEach((bm, i) => drawBumper(bm, bumpG[i]));
        drawPlunger();
        flips.forEach(drawFlipper);
        if (b.live && !b.layer) drawBall();
        ctx.drawImage(fg, 0, 0, W, H);
        if (b.live && b.layer) drawBall();
        fx.draw(ctx, true);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.save(); ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = 8; ctx.fillStyle = '#ffa040'; ctx.font = font(900, 19);
        ctx.fillText(num(score), 247, 801); ctx.restore();
        ctx.fillStyle = '#3a2a55'; ctx.font = font(900, 13);
        ctx.fillText('BALL ' + Math.min(ballNo, 3) + ' / 3', 96, 801);
        ctx.fillText(mult + 'X  ·  RAMPS ' + ramps, 398, 801);
        if (pulling && pull > 0) {
          ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.roundRect(476, 590, 26, 120, 8); ctx.fill();
          const g = ctx.createLinearGradient(0, 706, 0, 594); g.addColorStop(0, '#2ee59d'); g.addColorStop(.6, '#ffd23f'); g.addColorStop(1, '#ff4d6d');
          ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(480, 706 - 112 * pull, 18, 112 * pull, 6); ctx.fill();
        }
        banner(ctx, msg, 247, 520, 40);
        ctx.restore();
      };

      api.loop((dt, t) => {
        time += dt;
        if (state === 'play') {
          if (pulling) pull = Math.min(1, pull + dt * 1.1);
          acc = Math.min(acc + dt, .05);
          while (acc >= HS) { step(HS); acc -= HS; }
          if (saveT > 0) saveT = Math.max(0, saveT - dt);
          if (b.live && !b.layer && b.x < LANE) {
            if (b.vx * b.vx + b.vy * b.vy < 225) b.idle += dt; else b.idle = 0;
            if (b.idle > 2.5 && b.y < 680) { b.idle = 0; b.vy = -520; b.vx = (Math.random() - .5) * 500; say('NUDGE', null, .8); }
          }
        }
        for (const bm of bumpers) { bm.flash = Math.max(0, bm.flash - dt * 5); bm.cool -= dt; }
        for (const sl of slings) { sl.flash = Math.max(0, sl.flash - dt * 6); sl.cool -= dt; }
        for (const s of sens) s.flash = Math.max(0, s.flash - dt * .9);
        plSnap = Math.max(0, plSnap - dt * 3);
        shake = Math.max(0, shake - dt);
        if (msg) { msg.t += dt; if (msg.t > msg.life) msg = null; }
        fx.update(dt);
        draw(t);
      });

      b.live = true;
      api.overlay({
        kicker: 'Arcade', title: 'Pinball',
        text: 'Hold <kbd>Space</kbd> (or press and hold the table) to pull the plunger, then release. Flip with <kbd>Z</kbd> / <kbd>M</kbd> or the arrow keys; on touch, tap the left or right half. Light the three top lanes or drop all four targets to raise the multiplier, and hit the ramp three times for the Jackpot. 3 balls, 10 s ball save.',
        button: 'Play', onAction: start
      });
    }
  });

  const segCss = id => `
.gm-${id} .seg{display:inline-flex;padding:4px;border-radius:999px;background:var(--sunk);gap:2px}
.gm-${id} .seg[hidden]{display:none}
.gm-${id} .seg button{height:32px;padding:0 16px;border:0;border-radius:999px;background:none;font:800 13.5px/1 var(--sans);color:var(--muted);cursor:pointer}
.gm-${id} .seg button:hover{color:var(--ink)}
.gm-${id} .seg button[aria-pressed="true"]{background:#fff;color:var(--accent);box-shadow:0 2px 8px rgba(31,29,43,.12)}`;

  Ameplay.register({
    id: 'air-hockey',
    title: 'Air Hockey',
    category: 'Sports',
    blurb: 'Smash the puck past the computer or a friend online. First to seven wins.',
    help: 'Move the mouse or drag a finger to steer your mallet · or <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> / <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> · stay out of the goal crease',
    better: 'high',
    format: num,
    width: 940,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="40" r="14"/><circle cx="22" cy="40" r="6"/><circle cx="46" cy="20" r="8" fill="currentColor"/><path d="M33 29l5-5M30 22l4-2M40 34l2-4" opacity=".3"/></svg>',
    css: segCss('air-hockey') + `
.gm-air-hockey{gap:14px}
.gm-air-hockey .bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
@media (max-width:520px){.gm-air-hockey .seg button{padding:0 11px;font-size:12.5px}}
@media (pointer:coarse){.gm-air-hockey .seg button{height:40px}}`,
    mount(root, api) {
      const W = 900, H = 500, L = 40, RR = 860, T = 40, B = 460, CR = 70, MID = 450, CY = 250, GT = 158, GB = 342, PR = 22, MR = 36, HS = 1 / 480, PMAX = 1900, GOALS = 7, DELAY = 90;
      const DIFF = [
        { name: 'Easy', speed: 520, acc: 3000, err: 70, aim: 80, react: .2, mul: 1 },
        { name: 'Normal', speed: 860, acc: 5600, err: 34, aim: 34, react: .1, mul: 2 },
        { name: 'Hard', speed: 1250, acc: 9500, err: 12, aim: 20, react: .045, mul: 3 }
      ];
      const MODES = [['cpu', 'vs CPU'], ['net', 'Online']], CRZ = 88, CRL = 110;
      const net = api.net, invited = !!net.invite, coarse = matchMedia('(pointer: coarse)').matches;
      const saved = api.load() || {};
      let diff = clamp(saved.diff ?? 1, 0, 2) | 0, mode = invited ? 'net' : MODES.some(m => m[0] === saved.mode) ? saved.mode : 'cpu';
      root.innerHTML = `<div class="bar"><div class="seg" role="group" aria-label="Mode">${MODES.map(([k, t]) => `<button data-m="${k}" aria-pressed="${k === mode}">${t}</button>`).join('')}</div><div class="seg" role="group" aria-label="Difficulty">${DIFF.map((d, i) => `<button data-d="${i}" aria-pressed="${i === diff}">${d.name}</button>`).join('')}</div></div>`;
      const segBtns = [...root.querySelectorAll('[data-d]')], modeBtns = [...root.querySelectorAll('[data-m]')], barEl = root.firstChild, diffSeg = segBtns[0].parentNode;

      const PORT = matchMedia('(orientation: portrait) and (max-width: 1100px)').matches, VW = PORT ? H : W, VH = PORT ? W + 80 : H;
      const { canvas, ctx, toLocal: tl } = api.canvas(VW, VH);
      const fit = () => { if (PORT) canvas.style.width = `min(100%, ${VW}px, calc((100dvh - var(--goff, 250px) - ${barEl.offsetHeight + 14}px) * ${(VW / VH).toFixed(4)}))`; };

      const XF = PORT ? [[0, -1, 1, 0, 0, W + 40], [0, 1, -1, 0, H, 40]] : [[1, 0, 0, 1, 0, 0], [-1, 0, 0, -1, W, H]];
      let flip = 0;
      const toLocal = e => { const q = tl(e), [a, b, c, d, ex, f] = XF[flip], X = q.x - ex, Y = q.y - f, det = a * d - b * c; return { x: (d * X - c * Y) / det, y: (a * Y - b * X) / det }; };
      const dpr = canvas.width / VW, fx = sparks(), keys = api.keys;

      const segs = [];
      const poly = pts => { for (let i = 0; i < pts.length - 1; i++) segs.push(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { e: .9 })); };
      poly([[L, GT], [L, T + CR], ...arcPts(L + CR, T + CR, CR, Math.PI, Math.PI * 1.5, 10), [RR - CR, T], ...arcPts(RR - CR, T + CR, CR, Math.PI * 1.5, TAU, 10), [RR, GT]]);
      poly([[RR, GB], ...arcPts(RR - CR, B - CR, CR, 0, Math.PI / 2, 10), [L + CR, B], ...arcPts(L + CR, B - CR, CR, Math.PI / 2, Math.PI, 10), [L, GB]]);

      const puck = { x: MID - 150, y: CY, vx: 0, vy: 0 };
      const me = { x: L + 90, y: CY, vx: 0, vy: 0, tx: L + 90, ty: CY };
      const ai = { x: RR - 90, y: CY, vx: 0, vy: 0, tx: RR - 90, ty: CY, ux: -1, uy: 0, sx: 0, sy: 0, svx: 0, svy: 0, seen: 0, age: 0, err: 0, aimOff: 0, bank: 0, strike: 0, stuck: 0, side: 0 };
      let state = 'ready', sMe = 0, sAi = 0, glow = 0, glowSide = 0, msg = null, gen = 0, hitCd = 0, wallCd = 0, shake = 0, cd = 0, cdN = 0, clock = 0, overAt = 0;
      let online = null, wired = false, lobbying = false, acc = 0, simT = 0, stepN = 0, epoch = 0, off = 0, meRe = false, peerRe = false, sentX = -1, sentY = -1;
      const trail = new Float32Array(16); let trailI = 0;
      const buf = [], evq = [], cdM = { a: '', t: 0, life: 1.3, c: '#ffffff', c2: '#b9a8ff' };
      const own = () => (online === 'guest' ? ai : me);
      const scoreText = () => (online === 'guest' ? sAi + ' : ' + sMe : sMe + ' : ' + sAi);
      const r1 = v => Math.round(v * 10) / 10;
      const ev = o => { o.t = 'e'; o.T = Math.round(simT); net.send(o); };

      const clampM = (m, right) => {
        const x0 = right ? MID + MR : L + MR, x1 = right ? RR - MR : MID - MR;
        m.x = clamp(m.x, x0, x1); m.y = clamp(m.y, T + MR, B - MR);
        const cx = m.x < L + CR ? L + CR : m.x > RR - CR ? RR - CR : 0, cy = m.y < T + CR ? T + CR : m.y > B - CR ? B - CR : 0;
        if (cx && cy) {
          const dx = m.x - cx, dy = m.y - cy, d = Math.hypot(dx, dy), lim = CR - MR;
          if (d > lim) { m.x = cx + dx / d * lim; m.y = cy + dy / d * lim; }
        }
        const gx = right ? RR : L, ex = m.x - gx, ey = m.y - CY, ed = Math.hypot(ex, ey);
        if (ed < CRL) {
          const k = ed > 1e-3 ? 1 : 0, ux = k ? ex / ed : (right ? -1 : 1), uy = k ? ey / ed : 0;
          m.x = gx + ux * CRL; m.y = CY + uy * CRL;
          if (m.y < T + MR || m.y > B - MR) { m.y = clamp(m.y, T + MR, B - MR); m.x = gx + (right ? -1 : 1) * Math.sqrt(Math.max(0, CRL * CRL - (m.y - CY) * (m.y - CY))); }
        }
      };
      const hitMallet = (m, who) => {
        let nx = puck.x - m.x, ny = puck.y - m.y;
        const rr = PR + MR, d2 = nx * nx + ny * ny;
        if (d2 >= rr * rr) return;
        const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d;
        puck.x = m.x + nx * rr; puck.y = m.y + ny * rr;
        const rvn = (puck.vx - m.vx) * nx + (puck.vy - m.vy) * ny;
        if (rvn < 0) {
          puck.vx -= 1.88 * rvn * nx; puck.vy -= 1.88 * rvn * ny;
          const sp = Math.hypot(puck.vx, puck.vy);
          if (sp > PMAX) { puck.vx *= PMAX / sp; puck.vy *= PMAX / sp; }
          if (rvn < -260 && hitCd <= 0) {
            hitCd = .07;
            hitFx(m.x + nx * MR, m.y + ny * MR, who, rvn);
            if (online === 'host') ev({ e: 'hit', x: Math.round(m.x + nx * MR), y: Math.round(m.y + ny * MR), w: who, r: Math.round(rvn) });
          }
        }
      };
      const hitFx = (x, y, who, rvn) => {
        api.sfx('hit');
        fx.burst(x, y, Math.min(16, 4 - rvn / 120 | 0), who ? '#8fc2ff' : '#ff9aa8', 120 - rvn * .2, .35);
        if (rvn < -1100) shake = .15;
      };
      const separate = (m, right) => {
        const dx = m.x - puck.x, dy = m.y - puck.y, rr = PR + MR, d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr) return;
        const d = Math.sqrt(d2) || 1e-6;
        m.x = puck.x + dx / d * rr; m.y = puck.y + dy / d * rr;
        clampM(m, right);
      };
      const fold = (y, a, b) => { const sp = b - a; let k = (y - a) % (2 * sp); if (k < 0) k += 2 * sp; return a + (k > sp ? 2 * sp - k : k); };

      const aiThink = dt => {
        const P = DIFF[diff];
        ai.seen += dt; ai.age += dt;
        if (ai.seen >= P.react) { ai.seen = 0; ai.age = 0; ai.sx = puck.x; ai.sy = puck.y; ai.svx = puck.vx; ai.svy = puck.vy; }
        const px = ai.sx + ai.svx * ai.age, py = ai.sy + ai.svy * ai.age, pvx = ai.svx, pvy = ai.svy;
        const side = px > MID ? 1 : 0;
        if (side !== ai.side) {
          ai.side = side; ai.strike = 0; ai.stuck = 0;
          ai.err = (Math.random() - .5) * 2 * P.err; ai.aimOff = (Math.random() - .5) * 2 * P.aim; ai.bank = Math.random() < .3 ? (Math.random() < .5 ? -1 : 1) : 0;
        }
        let tx, ty, fast = false;
        if (state !== 'play') {
          tx = RR - 80; ty = CY;
        } else if (pvx > 150 && px < ai.x - 8) {
          const lineX = Math.min(ai.x, RR - CRL - 4), tt = (lineX - px) / pvx, yy = fold(py + pvy * tt, T + PR, B - PR);
          tx = lineX; ty = lerp(CY, yy, .85) + ai.err;
          if (diff === 2 && tt < .35) { tx = lineX - 30; fast = true; }
        } else if (!side) {
          tx = RR - (diff ? 175 : 125); ty = CY + (py - CY) * .5;
        } else {
          const sp = Math.hypot(puck.vx, puck.vy);
          ai.stuck = sp < 60 ? ai.stuck + dt : 0;
          let gy = (diff ? CY + (me.y < CY ? 58 : -58) : CY) + ai.aimOff;
          if (ai.bank) gy = ai.bank < 0 ? 2 * (T + PR) - gy : 2 * (B - PR) - gy;
          let dx = px - (L - 10), dy = py - gy;
          const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
          const bx = px + dx * (PR + MR + 34), by = py + dy * (PR + MR + 34);
          if (ai.stuck > 1.1) {
            let ux = px - ai.x, uy = py - ai.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
            tx = px + ux * 70; ty = py + uy * 70; fast = true;
            if (ai.stuck > 1.8) ai.stuck = 0;
          } else if (ai.strike > 0 || Math.hypot(ai.x - bx, ai.y - by) < 8) {
            if (ai.strike <= 0) { ai.strike = .4; const ul = Math.hypot(px - ai.x, py - ai.y) || 1; ai.ux = (px - ai.x) / ul; ai.uy = (py - ai.y) / ul; }
            ai.strike -= dt;
            if (Math.hypot(puck.x - ai.x, puck.y - ai.y) > PR + MR + 60 && ai.strike < .3) ai.strike = 0;
            tx = px + ai.ux * 80; ty = py + ai.uy * 80; fast = true;
          } else if (ai.x < px + 6 && Math.abs(ai.y - py) < PR + MR + 8) {
            tx = px + 46; ty = py + (py < CY ? 1 : -1) * (PR + MR + 20);
          } else { tx = bx; ty = by; }
        }
        ai.tx = tx; ai.ty = ty; ai.fast = fast;
      };
      const moveAi = h => {
        const P = DIFF[diff], vmax = P.speed * (ai.fast ? 1.25 : 1);
        let dvx = (ai.tx - ai.x) * 14, dvy = (ai.ty - ai.y) * 14;
        const dm = Math.hypot(dvx, dvy);
        if (dm > vmax) { dvx *= vmax / dm; dvy *= vmax / dm; }
        let ax = dvx - ai.vx, ay = dvy - ai.vy;
        const am = Math.hypot(ax, ay), lim = P.acc * h;
        if (am > lim) { ax *= lim / am; ay *= lim / am; }
        ai.vx += ax; ai.vy += ay;
        const ox = ai.x, oy = ai.y;
        ai.x += ai.vx * h; ai.y += ai.vy * h; clampM(ai, true);
        ai.vx = (ai.x - ox) / h; ai.vy = (ai.y - oy) / h;
      };

      const moveM = (m, right, h) => {
        const ox = m.x, oy = m.y, dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy), mx = 4200 * h;
        if (d > mx) { m.x += dx / d * mx; m.y += dy / d * mx; } else { m.x = m.tx; m.y = m.ty; }
        clampM(m, right);
        m.vx = (m.x - ox) / h; m.vy = (m.y - oy) / h;
      };
      const goalMsg = (view, p1, a, b) => {
        const mine = view === p1, good = mine;
        const txt = mode === 'cpu' ? (p1 ? 'GOAL!' : 'CPU SCORES') : mine ? 'GOAL!' : 'FRIEND SCORES';
        return { a: txt, b: view ? a + ' : ' + b : b + ' : ' + a, t: 0, life: 1.3, c: good ? '#ffd23f' : '#ff8fa8', c2: good ? '#ff8a2a' : '#ff2d6b' };
      };
      const goalFx = (p1, y, a, b) => {
        const view = online !== 'guest';
        glow = 1; glowSide = p1 ? 1 : 0; shake = .25;
        api.sfx(p1 === view ? 'good' : 'bad');
        fx.burst(p1 ? RR : L, y, 36, p1 ? '#ffd23f' : mode === 'cpu' ? '#ff6b81' : '#8ec5ff', 420, .9);
        msg = goalMsg(view, p1, a, b);
      };
      const goal = mine => {
        state = 'goal';
        if (mine) sMe++; else sAi++;
        api.score(scoreText());
        goalFx(mine, puck.y, sMe, sAi);
        if (online === 'host') ev({ e: 'goal', s: mine ? 0 : 1, y: Math.round(puck.y), a: sMe, b: sAi });
        const g0 = gen;
        if (sMe >= GOALS || sAi >= GOALS) { api.timeout(() => { if (g0 === gen && state === 'goal') over(); }, 1300); return; }
        api.timeout(() => {
          if (g0 !== gen || state !== 'goal') return;
          puck.x = mine ? MID + 150 : MID - 150; puck.y = CY; puck.vx = puck.vy = 0; epoch++;
          separate(me, false); separate(ai, true);
          state = 'play';
        }, 1200);
      };
      const step = h => {
        moveM(me, false, h);
        if (mode === 'cpu') moveAi(h); else moveM(ai, true, h);
        if (state === 'count') { separate(me, false); separate(ai, true); if ((cd -= h) <= 0) state = 'play'; return; }
        if (state !== 'play') return;
        puck.x += puck.vx * h; puck.y += puck.vy * h;
        const f = Math.exp(-.28 * h); puck.vx *= f; puck.vy *= f;
        for (const gx of [L, RR]) {
          const ex = puck.x - gx, ey = puck.y - CY;
          if (ex * ex + ey * ey < (CRL + 6) * (CRL + 6) && Math.hypot(puck.vx, puck.vy) < 220) { puck.vx += (gx === L ? 1 : -1) * 420 * h; puck.vy += Math.sign(ey) * 80 * h; }
        }
        hitMallet(me, 0); hitMallet(ai, 1);
        for (let i = 0; i < segs.length; i++) if (hitSeg(puck, PR, segs[i]) && HIT.vn < -320 && wallCd <= 0) { wallCd = .06; api.sfx('tick'); if (online === 'host') ev({ e: 'wall' }); }
        separate(me, false); separate(ai, true);
        if (puck.x < L - PR * .6) goal(false);
        else if (puck.x > RR + PR * .6) goal(true);
        else if (puck.y < 0 || puck.y > H) { puck.x = MID; puck.y = CY; puck.vx = puck.vy = 0; epoch++; }
      };

      const reset = () => {
        gen++; sMe = sAi = 0; glow = 0; msg = null; fx.clear();
        puck.x = MID - 150; puck.y = CY; puck.vx = puck.vy = 0; epoch++;
        ai.x = ai.tx = RR - 90; ai.y = ai.ty = CY; ai.vx = ai.vy = 0; ai.side = -1;
        api.score('0 : 0');
      };
      const begin = () => {
        if (mode === 'net') { if (!online) goOnline(); return; }
        reset();
        state = 'play';
      };
      const ready = () => {
        if (online) { online = null; net.close(); }
        flip = 0; api.hideOverlay(); reset(); state = 'ready';
      };
      const intro = () => {
        ready();
        api.overlay({
          kicker: 'Sports', title: 'Air Hockey',
          text: mode === 'net' ? `Play a friend on another device: create a room and send the code or invite link, or join with their code. First to ${GOALS} goals wins.`
            : `First to ${GOALS} goals wins. Your red mallet follows the mouse or your finger and must stay on your half and out of the shaded goal crease; hit the puck while moving to put pace on it. <b>Points:</b> 100 per goal you score, +500 for winning, multiplied ×1 / ×2 / ×3 on Easy / Normal / Hard. Now playing: <b>${DIFF[diff].name}</b>.`,
          button: 'Play', onAction: begin, secondary: 'Change mode', onSecondary: ready
        });
      };
      const over = () => {
        state = 'over'; overAt = clock;
        if (online) { if (online === 'host') ev({ e: 'over', a: sMe, b: sAi }); return netOver(); }
        const won = sMe > sAi, pts = (sMe * 100 + (won ? 500 : 0)) * DIFF[diff].mul;
        const nb = api.submit(pts);
        api.overlay({
          kicker: nb ? 'New best!' : won ? 'You win' : 'CPU wins', title: sMe + ' : ' + sAi,
          stats: [['Points', num(pts)], ['Level', DIFF[diff].name], ['Best', api.best != null ? num(api.best) : '—']],
          button: 'Play again', onAction: begin, secondary: 'Change mode', onSecondary: ready
        });
      };

      const snap = () => net.send({ t: 's', T: Math.round(simT), k: epoch, x: r1(puck.x), y: r1(puck.y), vx: Math.round(puck.vx), vy: Math.round(puck.vy), mx: r1(me.x), my: r1(me.y), st: state, c: r1(cd), a: sMe, b: sAi }, true);
      const sendM = () => { sentX = ai.tx; sentY = ai.ty; net.send({ t: 'm', x: r1(ai.tx), y: r1(ai.ty) }, true); };
      api.interval(() => { if (online === 'guest') sendM(); }, 50);
      const netOver = () => {
        const a = online === 'guest' ? sAi : sMe, b = online === 'guest' ? sMe : sAi;
        api.sfx(a > b ? 'win' : 'lose');
        api.overlay({ kicker: 'Online', title: a > b ? 'You win!' : 'Your friend wins', text: `Final score ${a} : ${b}.`, stats: [['You', a], ['Friend', b]], button: 'Rematch', onAction: rematch, secondary: 'Leave', onSecondary: intro });
      };
      const rematch = () => {
        if (!online) return intro();
        meRe = true; net.send({ t: 're' });
        if (online === 'host' && peerRe) return hostStart();
        api.overlay({ kicker: 'Online', title: 'Rematch', text: 'Waiting for your friend to tap Rematch…', button: null, secondary: 'Leave', onSecondary: intro });
      };
      const fresh = () => { reset(); state = 'count'; cd = 3; buf.length = evq.length = 0; meRe = peerRe = false; api.hideOverlay(); };
      const hostStart = () => { if (online !== 'host') return; fresh(); net.send({ t: 'start' }); };
      const onMsg = m => {
        if (!online || !m) return;
        if (m.t === 're') { peerRe = true; if (online === 'host' && meRe) hostStart(); else if (!meRe) api.toast('Your friend wants a rematch'); return; }
        if (online === 'host') {
          if (m.t === 'm') { ai.tx = clamp(+m.x || RR - 90, MID, RR); ai.ty = clamp(+m.y || CY, T, B); }
          return;
        }
        if (m.t === 's' && typeof m.T === 'number') {
          if (buf.length && m.T <= buf[buf.length - 1].T) return;
          const o = m.T - performance.now();
          off = !buf.length || o > off || o < off - 400 ? o : off + (o - off) * .02;
          buf.push(m); if (buf.length > 40) buf.shift();
        } else if (m.t === 'e') evq.push(m);
        else if (m.t === 'start') fresh();
      };
      const guestFrame = dt => {
        keyMove(dt);
        moveM(ai, true, Math.max(dt, 1e-3));
        if (ai.tx !== sentX || ai.ty !== sentY) sendM();
        if (!buf.length) return;
        const rt = performance.now() + off - DELAY;
        let i = buf.length - 1;
        while (i > 0 && buf[i].T > rt) i--;
        const a = buf[i], b = buf[i + 1];
        let x = a.x, y = a.y, mx = a.mx, my = a.my;
        if (b && b.k === a.k && rt >= a.T) {
          const u = clamp((rt - a.T) / (b.T - a.T || 1), 0, 1);
          x = lerp(a.x, b.x, u); y = lerp(a.y, b.y, u); mx = lerp(a.mx, b.mx, u); my = lerp(a.my, b.my, u);
        } else if (!b && a.st === 'play') {
          const e = clamp(rt - a.T, 0, 100) / 1000;
          x = clamp(x + a.vx * e, L - PR, RR + PR); y = clamp(y + a.vy * e, T + PR, B - PR);
        }
        puck.x = +x || MID; puck.y = +y || CY; puck.vx = +a.vx || 0; puck.vy = +a.vy || 0; me.x = +mx || me.x; me.y = +my || me.y;
        state = a.st; cd = +a.c || 0;
        if (a.a !== sMe || a.b !== sAi) { sMe = a.a | 0; sAi = a.b | 0; api.score(scoreText()); }
        while (evq.length && evq[0].T <= rt) {
          const m = evq.shift();
          if (m.e === 'hit') hitFx(+m.x || 0, +m.y || 0, m.w ? 1 : 0, +m.r || -300);
          else if (m.e === 'wall') api.sfx('tick');
          else if (m.e === 'goal') goalFx(m.s === 0, +m.y || CY, m.a | 0, m.b | 0);
          else if (m.e === 'over') { sMe = m.a | 0; sAi = m.b | 0; api.score(scoreText()); state = 'over'; overAt = clock; netOver(); }
        }
        if (state === 'play' || state === 'goal') { trail[trailI * 2] = puck.x; trail[trailI * 2 + 1] = puck.y; trailI = (trailI + 1) % 8; }
      };
      const wire = () => {
        if (wired) return;
        wired = true;
        net.on('open', role => {
          online = role; flip = role === 'guest' ? 1 : 0; off = 0;
          fresh();
          if (role === 'host') api.timeout(hostStart, 400);
        });
        net.on('data', onMsg);
        net.on('close', () => {
          if (!online) return;
          online = null; gen++; state = 'left'; api.sfx('bad');
          api.overlay({ kicker: 'Online', title: 'Your friend left', text: 'The connection to your friend was lost.', button: 'Back to menu', onAction: intro });
        });
      };
      const goOnline = async () => {
        if (lobbying || online) return;
        wire(); lobbying = true;
        const role = await net.lobby({ title: 'Air Hockey online', text: `Create a room and send the code or invite link to a friend on another device, or type their code to join. First to ${GOALS} goals wins.` });
        lobbying = false;
        if (!role && api.alive && !online) intro();
      };

      const sync = () => {
        segBtns.forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.d === diff)));
        modeBtns.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.m === mode)));
        diffSeg.hidden = mode !== 'cpu'; fit();
      };
      segBtns.forEach(bt => bt.addEventListener('click', () => {
        diff = +bt.dataset.d; api.save({ diff, mode });
        sync(); bt.blur(); intro();
      }));
      modeBtns.forEach(bt => bt.addEventListener('click', () => {
        mode = bt.dataset.m; api.save({ diff, mode });
        sync(); bt.blur(); intro();
      }));
      const keyMove = dt => {
        const k = (a, b) => (keys.has(a) ? 1 : 0) - (keys.has(b) ? 1 : 0);
        const ax = k('KeyD', 'KeyA'), ay = k('KeyS', 'KeyW'), bx = k('ArrowRight', 'ArrowLeft'), by = k('ArrowDown', 'ArrowUp');
        kMove(own(), clamp(ax + bx, -1, 1), clamp(ay + by, -1, 1), dt);
      };
      const kMove = (m, sx, sy, dt) => {
        if (!sx && !sy) return;
        const [a, b, c, d] = XF[flip], det = a * d - b * c, right = m === ai;
        m.tx = clamp(m.x + (d * sx - c * sy) / det * 950 * dt, right ? MID : L, right ? RR : MID);
        m.ty = clamp(m.y + (a * sy - b * sx) / det * 950 * dt, T, B);
      };
      const aimAt = e => {
        if (state === 'over' || state === 'left') return;
        const p = toLocal(e);
        const m = own(); m.tx = p.x; m.ty = p.y;
        if (online === 'guest') sendM();
      };
      const restartable = () => state === 'ready';
      api.on(canvas, 'pointermove', aimAt);
      api.on(canvas, 'pointerdown', e => {
        e.preventDefault();
        if (restartable()) begin();
        aimAt(e);
      });
      api.on(window, 'keydown', e => { if (restartable() && !e.repeat && (e.code === 'Space' || e.code === 'Enter')) begin(); });
      api.on(window, 'hashchange', () => {
        if (!net.invite || online || lobbying) return;
        mode = 'net'; api.save({ diff, mode }); sync(); ready(); goOnline();
      });

      const rinkPath = x => { x.beginPath(); x.roundRect(L, T, RR - L, B - T, CR); };
      const bg = layer(W, H, dpr, x => {
        let g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#2f86ff'); g.addColorStop(.5, '#1257c9'); g.addColorStop(1, '#0a3a8c');
        x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, W, H, 44); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2; x.beginPath(); x.roundRect(5, 5, W - 10, H - 10, 40); x.stroke();
        for (const gx of [L, RR]) {
          g = x.createLinearGradient(gx - 30, 0, gx + 30, 0);
          g.addColorStop(0, '#050a1c'); g.addColorStop(.5, '#16233f'); g.addColorStop(1, '#050a1c');
          x.fillStyle = g; x.beginPath(); x.roundRect(gx - 24, GT - 4, 48, GB - GT + 8, 12); x.fill();
        }
        x.save(); x.shadowColor = 'rgba(0,20,60,.6)'; x.shadowBlur = 16; x.shadowOffsetY = 4;
        x.fillStyle = '#fff'; rinkPath(x); x.fill(); x.restore();
        x.save(); rinkPath(x); x.clip();
        g = x.createRadialGradient(MID, CY, 40, MID, CY, 520);
        g.addColorStop(0, '#ffffff'); g.addColorStop(.6, '#eef6ff'); g.addColorStop(1, '#cfe2f7');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = 'rgba(30,70,140,.16)';
        for (let yy = T + 11; yy < B; yy += 22) for (let xx = L + 11 + ((yy / 22 | 0) % 2) * 11; xx < RR; xx += 22) { x.beginPath(); x.arc(xx, yy, 1.3, 0, TAU); x.fill(); }
        x.lineCap = 'round';
        x.strokeStyle = 'rgba(47,123,245,.55)'; x.lineWidth = 5;
        for (const lx of [250, 650]) { x.beginPath(); x.moveTo(lx, T); x.lineTo(lx, B); x.stroke(); }
        x.lineWidth = 4;
        x.fillStyle = 'rgba(255,59,92,.08)';
        x.beginPath(); x.arc(L, CY, CRZ, -Math.PI / 2, Math.PI / 2); x.fill(); x.stroke();
        x.beginPath(); x.arc(RR, CY, CRZ, Math.PI / 2, Math.PI * 1.5); x.fill(); x.stroke();
        x.strokeStyle = 'rgba(255,59,92,.8)'; x.lineWidth = 6; x.beginPath(); x.moveTo(MID, T); x.lineTo(MID, B); x.stroke();
        x.lineWidth = 4; x.beginPath(); x.arc(MID, CY, 64, 0, TAU); x.stroke();
        x.fillStyle = 'rgba(255,59,92,.85)'; x.beginPath(); x.arc(MID, CY, 7, 0, TAU); x.fill();
        for (const [fx0, fy] of [[250, 140], [250, 360], [650, 140], [650, 360]]) { x.beginPath(); x.arc(fx0, fy, 5, 0, TAU); x.fill(); }
        g = x.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.38, 'rgba(255,255,255,0)'); g.addColorStop(.47, 'rgba(255,255,255,.55)'); g.addColorStop(.56, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.strokeStyle = 'rgba(10,40,100,.22)'; x.lineWidth = 14; rinkPath(x); x.stroke();
        x.restore();
        x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 2; rinkPath(x); x.stroke();
        x.fillStyle = '#081530';
        for (const gx of [L, RR]) { x.beginPath(); x.roundRect(gx - 6, GT, 12, GB - GT, 6); x.fill(); }
      });
      const shadowG = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      shadowG.addColorStop(0, 'rgba(10,30,80,.36)'); shadowG.addColorStop(.7, 'rgba(10,30,80,.22)'); shadowG.addColorStop(1, 'rgba(10,30,80,0)');
      const malletG = cols => {
        const base = ctx.createRadialGradient(-10, -12, 4, 0, 0, MR);
        base.addColorStop(0, cols[0]); base.addColorStop(.6, cols[1]); base.addColorStop(1, cols[2]);
        const knob = ctx.createRadialGradient(-5, -6, 1, 0, 0, 16);
        knob.addColorStop(0, '#ffffff'); knob.addColorStop(.35, cols[0]); knob.addColorStop(1, cols[2]);
        return { base, knob, rim: cols[2] };
      };
      const MG = [malletG(['#ff8a9a', '#ef2f4c', '#8e0f25']), malletG(['#8ec5ff', '#2f7bf5', '#0d3b8e'])];
      const puckG = ctx.createRadialGradient(-7, -8, 2, 0, 0, PR);
      puckG.addColorStop(0, '#fff6c4'); puckG.addColorStop(.45, '#ffd43b'); puckG.addColorStop(1, '#d68f00');
      const shadow = (x, y, r) => { ctx.save(); ctx.translate(x + 6, y + 8); ctx.scale(r * 1.15, r * 1.15); ctx.fillStyle = shadowG; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore(); };
      const drawMallet = (m, g) => {
        shadow(m.x, m.y, MR);
        ctx.save(); ctx.translate(m.x, m.y);
        ctx.fillStyle = g.base; ctx.beginPath(); ctx.arc(0, 0, MR, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, MR - 3, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(2, 3, 22, 0, TAU); ctx.fill();
        ctx.strokeStyle = g.rim; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke();
        ctx.fillStyle = g.knob; ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.ellipse(-5, -7, 5, 3, -.6, 0, TAU); ctx.fill();
        ctx.restore();
      };
      const pill = (x, y, r, l, lc, rt, rc, s) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(r);
        ctx.fillStyle = 'rgba(5,16,46,.82)'; ctx.beginPath(); ctx.roundRect(-104, -15, 208, 30, 15); ctx.fill();
        ctx.textBaseline = 'middle'; ctx.font = font(900, 13);
        ctx.textAlign = 'left'; ctx.fillStyle = lc; ctx.fillText(l, -90, .5);
        ctx.textAlign = 'right'; ctx.fillStyle = rc; ctx.fillText(rt, 90, .5);
        ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = font(900, 19); ctx.fillText(s, 0, 1);
        ctx.restore();
      };
      const tag = (x, y, r, t1, t2) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(r);
        ctx.shadowColor = 'rgba(0,20,60,.35)'; ctx.shadowBlur = 14; ctx.fillStyle = 'rgba(255,255,255,.96)';
        ctx.beginPath(); ctx.roundRect(-150, -32, 300, 64, 32); ctx.fill(); ctx.shadowBlur = 0;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = C.accent; ctx.font = font(900, 19); ctx.fillText(t1, 0, -10);
        ctx.fillStyle = C.muted; ctx.font = font(800, 14); ctx.fillText(t2, 0, 13);
        ctx.restore();
      };
      const bs = m => (PORT && m.a.length > 10 ? 44 : 56);
      const draw = t => {
        ctx.save();
        if (shake > 0) ctx.translate((Math.random() - .5) * 10 * shake, (Math.random() - .5) * 10 * shake);
        ctx.clearRect(-20, -20, VW + 40, VH + 40);
        ctx.save();
        const X = XF[flip]; ctx.transform(X[0], X[1], X[2], X[3], X[4], X[5]);
        ctx.drawImage(bg, 0, 0, W, H);
        if (!PORT) {
          ctx.save(); ctx.translate(MID, flip ? CY - 112 : CY + 112); if (flip) ctx.rotate(Math.PI);
          ctx.font = font(900, 40, 1); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(47,123,245,.09)'; ctx.fillText('AIR HOCKEY', 0, 0);
          ctx.restore();
        }
        if (glow > 0) {
          const gx = glowSide ? RR : L, col = glowSide ? '255,210,63' : '255,77,109';
          const g = ctx.createRadialGradient(gx, CY, 10, gx, CY, 210);
          g.addColorStop(0, `rgba(${col},${(.85 * glow).toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`);
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(gx - 210, CY - 210, 420, 420);
          ctx.fillStyle = `rgba(${col},${glow.toFixed(3)})`; ctx.beginPath(); ctx.roundRect(gx - 6, GT, 12, GB - GT, 6); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        if (state === 'play' || state === 'ready' || state === 'count') {
          const sp = Math.hypot(puck.vx, puck.vy);
          if (sp > 500 && state === 'play') {
            for (let i = 1; i <= 7; i++) {
              const k = (trailI - i + 8) % 8, a = (1 - i / 8) * Math.min(1, (sp - 500) / 900) * .3;
              ctx.fillStyle = `rgba(255,170,0,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(trail[k * 2], trail[k * 2 + 1], PR * (1 - i * .07), 0, TAU); ctx.fill();
            }
          }
          shadow(puck.x, puck.y, PR);
          ctx.save(); ctx.translate(puck.x, puck.y);
          ctx.fillStyle = '#b36f00'; ctx.beginPath(); ctx.arc(0, 2, PR, 0, TAU); ctx.fill();
          ctx.fillStyle = puckG; ctx.beginPath(); ctx.arc(0, 0, PR, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(160,90,0,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, PR * .62, 0, TAU); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(-7, -9, 6, 3, -.5, 0, TAU); ctx.fill();
          ctx.restore();
        }
        if (online === 'guest') { drawMallet(me, MG[0]); drawMallet(ai, MG[1]); } else { drawMallet(ai, MG[1]); drawMallet(me, MG[0]); }
        fx.draw(ctx, true);
        ctx.restore();
        const cx = VW / 2, cy = PORT ? W + 40 - MID : CY, R1 = '#ff8a9a', B1 = '#8ec5ff';
        if (online === 'guest') pill(cx, 20, 0, 'YOU', B1, 'FRIEND', R1, sAi + '  :  ' + sMe);
        else pill(cx, 20, 0, 'YOU', R1, mode === 'cpu' ? 'CPU' : 'FRIEND', B1, sMe + '  :  ' + sAi);
        if (online) {
          const ms = net.rtt, px = PORT ? VW - 52 : VW - 92;
          ctx.fillStyle = 'rgba(5,16,46,.7)'; ctx.beginPath(); ctx.roundRect(px - 34, 10, 72, 20, 10); ctx.fill();
          ctx.fillStyle = ms < 90 ? '#22b07d' : ms < 180 ? '#ffd23f' : '#ef4f4f'; ctx.beginPath(); ctx.arc(px - 22, 20, 4, 0, TAU); ctx.fill();
          ctx.font = font(800, 11); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText(net.connected ? ms + ' ms' : '…', px - 13, 20.5);
        }
        if (msg) banner(ctx, msg, cx, cy - 20, bs(msg));
        if (state === 'count' && cd > 0) {
          cdM.a = String(Math.ceil(cd)); cdM.t = Math.ceil(cd) - cd;
          banner(ctx, cdM, cx, cy, 80);
        }
        if (state === 'ready') {
          const t1 = mode === 'cpu' ? 'vs CPU · ' + DIFF[diff].name : 'Online · first to ' + GOALS;
          const t2 = mode === 'net' ? (coarse ? 'Tap to play a friend' : 'Click or press Space to play a friend') : coarse ? 'Tap to start' : 'Click or press Space to start';
          tag(cx, cy, 0, t1, t2);
        }
        ctx.restore();
      };

      api.loop((dt, t) => {
        clock += dt;
        if (online === 'guest') guestFrame(dt);
        else if (online || state === 'play' || state === 'goal' || state === 'count') {
          keyMove(dt);
          if (mode === 'cpu') aiThink(dt);
          hitCd -= dt; wallCd -= dt;
          if (online) {
            acc = Math.min(acc + dt, .1);
            while (acc >= HS) { acc -= HS; step(HS); simT += HS * 1000; if (++stepN % 16 === 0) snap(); }
          } else {
            const n = Math.ceil(dt / HS), h = dt / n;
            for (let i = 0; i < n; i++) step(h);
          }
          if (state === 'play' || state === 'goal') { trail[trailI * 2] = puck.x; trail[trailI * 2 + 1] = puck.y; trailI = (trailI + 1) % 8; }
        }
        const n = state === 'count' ? Math.ceil(cd) : 0;
        if (n !== cdN) { cdN = n; if (n) api.sfx('tick'); }
        glow = Math.max(0, glow - dt * .8); shake = Math.max(0, shake - dt);
        if (msg) { msg.t += dt; if (msg.t > msg.life) msg = null; }
        fx.update(dt);
        draw(t);
      });
      sync(); api.timeout(fit, 60);
      if (invited) { api.save({ diff, mode }); ready(); goOnline(); } else intro();
    }
  });

  const RING = ['#f4f5f7', '#f4f5f7', '#2b2a33', '#2b2a33', '#2f9bff', '#2f9bff', '#ef3b3b', '#ef3b3b', '#ffd23f', '#ffd23f'];

  Ameplay.register({
    id: 'archery',
    title: 'Archery',
    category: 'Sports',
    blurb: 'Draw, read the wind and loose ten arrows at the target.',
    help: 'Drag back anywhere and release to shoot · or aim with <kbd>↑</kbd> <kbd>↓</kbd>, hold <kbd>Space</kbd> to draw and release to loose',
    better: 'high',
    format: v => v + ' pts',
    width: 940,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="26" r="18"/><circle cx="40" cy="26" r="10"/><circle cx="40" cy="26" r="3" fill="currentColor"/><path d="M8 58l31-31"/><path d="M8 58l2-9M8 58l9-2" opacity=".3"/></svg>',
    css: `.gm-archery{gap:12px}
@media (max-width:640px){.gm-archery .g-hud{gap:4px 16px}.gm-archery .g-stat{min-width:0}}`,
    mount(root, api) {
      const W = 900, H = 500, GY = 432, SX = 132, SY = 336, G = 520, TR = 56, AL = 64, SHOTS = 10;
      root.innerHTML = `<div class="g-hud">${['Arrow', 'Score', 'Last', 'Best'].map(k => `<div class="g-stat"><span class="k">${k}</span><span class="v">–</span></div>`).join('')}</div>`;
      const hv = [...root.querySelectorAll('.g-stat .v')];
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      const dpr = canvas.width / W, fx = sparks(), keys = api.keys;

      let state = 'idle', n = 0, total = 0, bulls = 0, last = null, scores = [], time = 0, wait = 0, gen = 0;
      const tg = { x: 560, y: GY - 104, by: GY - 104, amp: 0, w: 0, ph: 0, x0: 560, x1: 560, mt: 1, arrows: [] };
      let wind = 0, windVis = 0, dist = 0;
      const aim = { ang: -.08, pow: 0, drag: false, ax: 0, ay: 0, kb: false };
      const fl = { x: 0, y: 0, vx: 0, vy: 0, t: 0 };
      const REC = new Float32Array(4 * 1600);
      let recN = 0, ground = [], pops = [], rp = null, msg = null;
      const cam = { x: W / 2, y: H / 2, z: 1 };

      const hud = () => {
        const v = [Math.min(n + 1, SHOTS) + ' / ' + SHOTS, total, last == null ? '–' : last ? last : 'Miss', api.best != null ? api.best : '–'];
        hv.forEach((el, i) => { if (el.textContent !== String(v[i])) el.textContent = v[i]; });
      };
      const setup = first => {
        const k = n;
        const x = 470 + k * 36 + Math.random() * 26;
        tg.x0 = first ? x : tg.x; tg.x1 = x; tg.mt = first ? 1 : 0;
        if (first) tg.x = x;
        tg.by = GY - 96 - Math.random() * 30;
        tg.amp = k >= 6 ? 34 + (k - 6) * 14 : 0; tg.w = 1.5 + Math.max(0, k - 6) * .45; tg.ph = Math.random() * TAU;
        const mx = 40 + k * 18;
        wind = (Math.random() < .5 ? -1 : 1) * mx * (.25 + Math.random() * .75);
        dist = Math.round((x - SX) / 10);
        ground = []; aim.pow = 0; aim.drag = false; aim.kb = false;
        state = first ? 'aim' : 'move';
        hud();
      };
      const begin = () => {
        gen++; n = 0; total = 0; bulls = 0; last = null; scores = []; tg.arrows = []; pops = []; rp = null; msg = null;
        cam.x = W / 2; cam.y = H / 2; cam.z = 1; fx.clear();
        api.score(0); setup(true);
      };
      const shoot = () => {
        if (state !== 'aim') return;
        const p = aim.pow;
        aim.drag = false; aim.kb = false;
        if (p < .06) { aim.pow = 0; return; }
        const c = Math.cos(aim.ang), s = Math.sin(aim.ang), v = 560 + 760 * p, tip = 34 - 12 * p - 44 * p + AL;
        fl.x = SX + c * tip; fl.y = SY + s * tip; fl.vx = c * v; fl.vy = s * v; fl.t = 0;
        recN = 0; aim.pow = 0; state = 'fly'; api.sfx('tap');
      };
      const rec = () => {
        if (recN >= 1600) return;
        const o = recN * 4; REC[o] = fl.t; REC[o + 1] = fl.x; REC[o + 2] = fl.y; REC[o + 3] = Math.atan2(fl.vy, fl.vx); recN++;
      };
      const ringOf = dy => { const a = Math.abs(dy); return a > TR ? 0 : Math.min(10, 10 - Math.floor(a / (TR / 10))); };
      const score = (pts, x, y) => {
        scores.push(pts); total += pts; last = pts; api.score(total);
        pops.push({ x, y, t: 0, a: pts ? '+' + pts : 'MISS', c: pts ? RING[pts - 1] : '#ffffff' });
        if (pts >= 9) api.sfx('good'); else if (pts) api.sfx('tick'); else api.sfx('bad');
        hud();
      };
      const hitTarget = (yc, ang) => {
        const dy = yc - tg.y, pts = ringOf(dy);
        const ar = { dy, ang, t0: time, hidden: pts === 10 };
        tg.arrows.push(ar);
        fx.burst(tg.x - 4, yc, 12, '#e8c46a', 200, .5, 300, 2);
        score(pts, tg.x - 30, yc - 30);
        if (pts === 10) {
          bulls++;
          rp = { t: 0, ar, end: fl.t, from: Math.max(0, fl.t - .5) };
          state = 'replay';
          msg = { a: 'BULLSEYE!', b: 'replay', t: 0, life: 99, c: '#ffe45c', c2: '#ff8a2a' };
        } else { state = 'wait'; wait = 1.2; }
      };
      const miss = inGround => {
        if (inGround) { ground.push({ x: fl.x, y: GY + 3, ang: Math.atan2(fl.vy, fl.vx) }); fx.burst(fl.x, GY, 10, '#a77b4f', 160, .5, 400, 2); }
        score(0, clamp(fl.x, 60, W - 60), inGround ? GY - 40 : 80);
        state = 'wait'; wait = 1.1;
      };
      const next = () => {
        n++;
        if (n >= SHOTS) { finish(); return; }
        setup(false);
      };
      const finish = () => {
        state = 'over'; hud();
        const nb = api.submit(total);
        hud();
        api.overlay({
          kicker: nb ? 'New best!' : 'Round complete', title: total + ' pts',
          stats: [['Score', total], ['Bullseyes', bulls], ['Average', (total / SHOTS).toFixed(1)], ['Best', api.best ?? '—']],
          button: 'Play again', onAction: begin
        });
      };
      const flyStep = dt => {
        const k = Math.ceil(dt * 360), h = dt / k;
        for (let i = 0; i < k; i++) {
          const px = fl.x, py = fl.y;
          fl.vx += wind * h; fl.vy += G * h;
          fl.x += fl.vx * h; fl.y += fl.vy * h; fl.t += h;
          const fx0 = tg.x - 8;
          if (px < fx0 && fl.x >= fx0) {
            const f = (fx0 - px) / (fl.x - px), yc = py + (fl.y - py) * f;
            if (Math.abs(yc - tg.y) <= TR) { fl.x = fx0; fl.y = yc; rec(); hitTarget(yc, Math.atan2(fl.vy, fl.vx)); return; }
          }
          if (fl.y >= GY + 2) { fl.y = GY + 2; rec(); miss(true); return; }
          if (fl.x > W + 120 || fl.x < -200 || fl.t > 7) { miss(false); return; }
        }
        rec();
      };
      const sample = t => {
        let i = 0;
        while (i < recN - 1 && REC[(i + 1) * 4] < t) i++;
        const o = i * 4, o2 = Math.min(recN - 1, i + 1) * 4, t0 = REC[o], t1 = REC[o2], f = t1 > t0 ? clamp((t - t0) / (t1 - t0), 0, 1) : 0;
        return [lerp(REC[o + 1], REC[o2 + 1], f), lerp(REC[o + 2], REC[o2 + 2], f), lerp(REC[o + 3], REC[o2 + 3], f)];
      };

      const setAim = p => {
        let dx = aim.ax - p.x, dy = aim.ay - p.y;
        const d = Math.hypot(dx, dy);
        if (d > 8) {
          if (dx < 4) dx = 4;
          aim.ang = clamp(Math.atan2(dy, dx), -1.3, .35);
        }
        aim.pow = clamp((d - 8) / 170, 0, 1);
      };
      api.on(canvas, 'pointerdown', e => {
        e.preventDefault();
        if (state === 'replay') { rp.t = 99; return; }
        if (state !== 'aim' || aim.kb) return;
        const p = toLocal(e);
        aim.drag = true; aim.ax = p.x; aim.ay = p.y; aim.pow = 0;
      });
      api.on(canvas, 'pointermove', e => { if (aim.drag && state === 'aim') setAim(toLocal(e)); });
      api.on(window, 'pointerup', () => { if (aim.drag) shoot(); });
      api.on(window, 'pointercancel', () => { aim.drag = false; aim.pow = 0; });
      api.on(window, 'keydown', e => {
        if (e.code === 'Space' && !e.repeat && state === 'aim' && !aim.drag) { aim.kb = true; aim.pow = 0; }
      });
      api.on(window, 'keyup', e => { if (e.code === 'Space' && aim.kb) shoot(); });

      const bg = layer(W, H, dpr, x => {
        let g = x.createLinearGradient(0, 0, 0, GY);
        g.addColorStop(0, '#3fa7ff'); g.addColorStop(.55, '#9fd8ff'); g.addColorStop(1, '#fff1cf');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        g = x.createRadialGradient(720, 90, 10, 720, 90, 200);
        g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(.12, 'rgba(255,240,180,.95)'); g.addColorStop(.3, 'rgba(255,220,140,.35)'); g.addColorStop(1, 'rgba(255,220,140,0)');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        const ridge = (base, amp, f, ph, c0, c1) => {
          const gg = x.createLinearGradient(0, base - amp, 0, GY); gg.addColorStop(0, c0); gg.addColorStop(1, c1);
          x.fillStyle = gg; x.beginPath(); x.moveTo(0, GY);
          for (let xx = 0; xx <= W; xx += 10) x.lineTo(xx, base - amp * (.55 * Math.sin(xx * f + ph) + .3 * Math.sin(xx * f * 2.7 + ph * 2) + .15 * Math.sin(xx * f * 6.1)));
          x.lineTo(W, GY); x.closePath(); x.fill();
        };
        ridge(300, 70, .006, 1, '#a6a9e8', '#cfd6f5');
        ridge(340, 45, .009, 3, '#7fb3a8', '#b7dccb');
        ridge(378, 28, .013, 5, '#5fae5a', '#8fcf72');
        const rnd = seeded(11);
        for (let i = 0; i < 46; i++) {
          const tx = rnd() * W, th = 22 + rnd() * 26, ty = 392 + rnd() * 10;
          x.fillStyle = `rgb(${40 + rnd() * 20 | 0},${105 + rnd() * 30 | 0},${55 + rnd() * 20 | 0})`;
          x.beginPath(); x.moveTo(tx, ty - th); x.lineTo(tx + th * .32, ty); x.lineTo(tx - th * .32, ty); x.closePath(); x.fill();
        }
        g = x.createLinearGradient(0, 396, 0, H);
        g.addColorStop(0, '#8fd85c'); g.addColorStop(.4, '#66bf45'); g.addColorStop(1, '#3d8f33');
        x.fillStyle = g; x.beginPath(); x.moveTo(0, 404); x.quadraticCurveTo(W / 2, 392, W, 404); x.lineTo(W, H); x.lineTo(0, H); x.fill();
        for (let i = 0; i < 9; i++) {
          x.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,60,0,.05)';
          x.beginPath(); x.moveTo(i * 110 - 40, H); x.lineTo(i * 110 + 70, H); x.lineTo(i * 100 + 120, 404); x.lineTo(i * 100 + 20, 404); x.fill();
        }
        for (let i = 0; i < 260; i++) {
          const gx = rnd() * W, gy = 410 + rnd() * 90;
          x.strokeStyle = `rgba(${rnd() < .5 ? '40,110,30' : '170,230,120'},.5)`; x.lineWidth = 1;
          x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + (rnd() - .5) * 4, gy - 3 - rnd() * 5); x.stroke();
        }
        x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(SX + 30, GY - 1, 3, 30);
        x.font = font(800, 11); x.textAlign = 'center'; x.textBaseline = 'middle';
        for (let m = 20; m <= 70; m += 10) {
          const mx = SX + m * 10;
          x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(mx - 1, GY + 8, 4, 16);
          x.fillStyle = '#ffffff'; x.fillRect(mx - 2, GY + 6, 4, 16);
          x.fillStyle = 'rgba(255,255,255,.85)'; x.fillText(m + 'm', mx, GY + 32);
        }
      });
      const clouds = [[120, 70, 1, .6], [420, 50, 1.3, .9], [640, 130, .8, .5], [880, 95, 1.1, .75]].map(([x, y, s, d]) => ({ x, y, s, d }));
      const motes = Array.from({ length: 16 }, () => ({ x: Math.random() * W, y: 120 + Math.random() * 300, p: Math.random() * TAU }));
      const cloudG = ctx.createRadialGradient(0, -6, 2, 0, 0, 34);
      cloudG.addColorStop(0, 'rgba(255,255,255,.98)'); cloudG.addColorStop(.7, 'rgba(255,255,255,.85)'); cloudG.addColorStop(1, 'rgba(255,255,255,0)');
      const drawCloud = c => {
        ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.s, c.s * .8); ctx.fillStyle = cloudG;
        for (const [ox, oy, r] of [[-34, 6, .8], [-10, -6, 1.05], [18, -2, .95], [42, 8, .7], [5, 10, .9]]) { ctx.save(); ctx.translate(ox, oy); ctx.scale(r, r); ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill(); ctx.restore(); }
        ctx.restore();
      };
      const drawSock = t => {
        const px = 56, top = GY - 132;
        ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(px + 4, GY + 2, 12, 3, 0, 0, TAU); ctx.fill();
        const pg = ctx.createLinearGradient(px - 3, 0, px + 3, 0); pg.addColorStop(0, '#8a8f9c'); pg.addColorStop(.5, '#f2f4f8'); pg.addColorStop(1, '#6f7482');
        ctx.fillStyle = pg; ctx.fillRect(px - 2.5, top, 5, GY - top);
        const s = clamp(Math.abs(windVis) / 200, 0, 1), dir = windVis < 0 ? -1 : 1, droop = (1 - s) * 1.2;
        ctx.save(); ctx.translate(px, top + 4);
        const L0 = 50;
        for (let i = 0; i < 4; i++) {
          const a0 = i / 4, a1 = (i + 1) / 4, wob = Math.sin(t * .012 + i) * 2 * (0.3 + s);
          const p = u => [dir * Math.cos(droop * u) * L0 * u, Math.sin(droop * u) * L0 * u + wob * u];
          const [x0, y0] = p(a0), [x1, y1] = p(a1), r0 = 9 - a0 * 4, r1 = 9 - a1 * 4;
          ctx.fillStyle = i % 2 ? '#ffffff' : '#ff4d3d';
          ctx.beginPath(); ctx.moveTo(x0, y0 - r0); ctx.lineTo(x1, y1 - r1); ctx.lineTo(x1, y1 + r1); ctx.lineTo(x0, y0 + r0); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      };
      const drawArrow = (tx, ty, a, len, inside) => {
        const c = Math.cos(a), s = Math.sin(a), bx = tx - c * len, by = ty - s * len;
        const ex = inside ? tx - c * inside : tx, ey = inside ? ty - s * inside : ty;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,230,190,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, by - .6); ctx.lineTo(ex, ey - .6); ctx.stroke();
        if (!inside) {
          ctx.fillStyle = '#b8bfcc'; ctx.beginPath(); ctx.moveTo(tx + c * 6, ty + s * 6); ctx.lineTo(tx - s * 3.2, ty + c * 3.2); ctx.lineTo(tx + s * 3.2, ty - c * 3.2); ctx.closePath(); ctx.fill();
        }
        for (const [sg, col] of [[1, '#ff4d6d'], [-1, '#ffd23f']]) {
          ctx.fillStyle = col; ctx.beginPath();
          ctx.moveTo(bx + c * 2, by + s * 2); ctx.lineTo(bx + c * 16, by + s * 16); ctx.lineTo(bx + c * 4 - s * 7 * sg, by + s * 4 + c * 7 * sg); ctx.lineTo(bx - c * 2 - s * 6 * sg, by - s * 2 + c * 6 * sg); ctx.closePath(); ctx.fill();
        }
      };
      const bossG = ctx.createLinearGradient(0, -TR, 0, TR);
      bossG.addColorStop(0, '#f3d38a'); bossG.addColorStop(.5, '#d9a94e'); bossG.addColorStop(1, '#a8772c');
      const drawTarget = () => {
        const x = tg.x, y = tg.y;
        ctx.fillStyle = 'rgba(20,60,10,.25)'; ctx.beginPath(); ctx.ellipse(x + 10, GY + 3, 46, 7, 0, 0, TAU); ctx.fill();
        ctx.lineCap = 'round';
        if (tg.amp) {
          ctx.strokeStyle = '#6d7480'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 26, GY); ctx.lineTo(x + 26, tg.by - tg.amp - TR - 14); ctx.stroke();
          ctx.strokeStyle = '#c3c9d4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 25, GY); ctx.lineTo(x + 25, tg.by - tg.amp - TR - 14); ctx.stroke();
          ctx.fillStyle = '#4b505c'; ctx.fillRect(x + 14, y - 10, 22, 20);
        } else {
          ctx.strokeStyle = '#7a4a24'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(x + 8, y + 10); ctx.lineTo(x - 22, GY); ctx.moveTo(x + 12, y + 10); ctx.lineTo(x + 40, GY); ctx.moveTo(x + 14, y); ctx.lineTo(x + 30, GY); ctx.stroke();
          ctx.strokeStyle = '#a8703c'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x + 8, y + 10); ctx.lineTo(x - 22, GY); ctx.moveTo(x + 12, y + 10); ctx.lineTo(x + 40, GY); ctx.stroke();
        }
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = bossG; ctx.beginPath(); ctx.ellipse(10, 0, 14, TR + 5, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#c99640'; ctx.fillRect(0, -TR - 5, 10, TR * 2 + 10);
        ctx.fillStyle = '#f0d9a0'; ctx.beginPath(); ctx.ellipse(0, 0, 15.5, TR + 5, 0, 0, TAU); ctx.fill();
        for (let i = 0; i < 10; i++) {
          const r = TR * (10 - i) / 10;
          ctx.fillStyle = RING[i]; ctx.beginPath(); ctx.ellipse(0, 0, r * .26, r, 0, 0, TAU); ctx.fill();
          ctx.strokeStyle = i === 2 || i === 3 ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.28)'; ctx.lineWidth = .8; ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(0, 0, TR * .013, TR * .05, 0, 0, TAU); ctx.stroke();
        const hl = ctx.createLinearGradient(-15, 0, 15, 0); hl.addColorStop(0, 'rgba(255,255,255,.35)'); hl.addColorStop(.5, 'rgba(255,255,255,0)'); hl.addColorStop(1, 'rgba(0,0,0,.12)');
        ctx.fillStyle = hl; ctx.beginPath(); ctx.ellipse(0, 0, TR * .26, TR, 0, 0, TAU); ctx.fill();
        ctx.restore();
        for (const ar of tg.arrows) {
          if (ar.hidden) continue;
          const age = time - ar.t0, wob = .16 * Math.exp(-5 * age) * Math.sin(age * 42);
          drawArrow(x + 6, y + ar.dy, ar.ang + wob, AL, 14);
        }
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.roundRect(x - 22, GY + 40, 52, 20, 10); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = font(900, 12); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.round((x - SX) / 10) + ' m', x + 4, GY + 50.5);
      };
      const drawArcher = () => {
        const p = state === 'aim' ? aim.pow : 0, a = aim.ang, X = SX, Y = SY;
        ctx.fillStyle = 'rgba(20,60,10,.28)'; ctx.beginPath(); ctx.ellipse(X - 2, GY + 2, 34, 6, 0, 0, TAU); ctx.fill();
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = '#2f2a4a'; ctx.lineWidth = 11;
        ctx.beginPath(); ctx.moveTo(X - 6, Y + 40); ctx.lineTo(X - 20, GY - 4); ctx.moveTo(X - 2, Y + 40); ctx.lineTo(X + 16, GY - 4); ctx.stroke();
        ctx.fillStyle = '#5a3a22';
        ctx.beginPath(); ctx.roundRect(X - 30, GY - 9, 20, 10, 4); ctx.fill(); ctx.beginPath(); ctx.roundRect(X + 10, GY - 9, 20, 10, 4); ctx.fill();
        ctx.save(); ctx.translate(X - 18, Y + 6); ctx.rotate(-.35);
        ctx.fillStyle = '#7a4a24'; ctx.beginPath(); ctx.roundRect(-7, -6, 14, 46, 5); ctx.fill();
        for (let i = 0; i < Math.max(0, SHOTS - n - (state === 'aim' || state === 'idle' ? 1 : 0)) && i < 9; i++) {
          ctx.fillStyle = i % 2 ? '#ffd23f' : '#ff4d6d'; ctx.fillRect(-6 + (i % 5) * 2.6, -14 - (i % 3) * 2, 2.4, 10);
        }
        ctx.restore();
        const tg0 = ctx.createLinearGradient(X - 16, 0, X + 16, 0); tg0.addColorStop(0, '#1f7a3a'); tg0.addColorStop(.5, '#34b45a'); tg0.addColorStop(1, '#1b6a32');
        ctx.fillStyle = tg0; ctx.beginPath(); ctx.moveTo(X - 14, Y - 6); ctx.lineTo(X + 14, Y - 6); ctx.lineTo(X + 12, Y + 44); ctx.lineTo(X - 14, Y + 44); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6b4423'; ctx.fillRect(X - 14, Y + 30, 26, 5);
        ctx.fillStyle = '#f2c29b'; ctx.fillRect(X - 3, Y - 14, 7, 10);
        ctx.fillStyle = '#f2c29b'; ctx.beginPath(); ctx.arc(X + 2, Y - 24, 12, 0, TAU); ctx.fill();
        ctx.fillStyle = '#5b3a1e'; ctx.beginPath(); ctx.arc(X - 1, Y - 27, 12, Math.PI * .85, Math.PI * 1.9); ctx.fill();
        ctx.fillStyle = '#e03131'; ctx.fillRect(X - 11, Y - 31, 24, 4);
        ctx.fillStyle = '#2b2a33'; ctx.beginPath(); ctx.arc(X + 8, Y - 25, 1.6, 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(X, Y); ctx.rotate(a);
        const tipX = 34 - 12 * p, nock = tipX - 44 * p;
        ctx.strokeStyle = '#2a8f48'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(42, 0); ctx.stroke();
        ctx.fillStyle = '#f2c29b'; ctx.beginPath(); ctx.arc(44, 0, 5, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(tipX, -50); ctx.lineTo(nock, 0); ctx.lineTo(tipX, 50); ctx.stroke();
        const bw = ctx.createLinearGradient(30, -50, 60, 50); bw.addColorStop(0, '#9c5a26'); bw.addColorStop(.5, '#e2a15a'); bw.addColorStop(1, '#7a4219');
        ctx.strokeStyle = bw; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(tipX, -50); ctx.quadraticCurveTo(62 - 6 * p, -30, 46, 0); ctx.quadraticCurveTo(62 - 6 * p, 30, tipX, 50); ctx.stroke();
        ctx.fillStyle = '#3b2412'; ctx.fillRect(42, -6, 8, 12);
        if (state === 'aim' || state === 'idle') drawArrow(nock + AL, 0, 0, AL);
        ctx.strokeStyle = '#2a8f48'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(nock * .45 - 14, -9); ctx.lineTo(nock, 0); ctx.stroke();
        ctx.fillStyle = '#f2c29b'; ctx.beginPath(); ctx.arc(nock, 0, 4.5, 0, TAU); ctx.fill();
        ctx.restore();
      };
      const drawHint = () => {
        if (n !== 0 || state !== 'aim' || aim.pow < .06) return;
        const c = Math.cos(aim.ang), s = Math.sin(aim.ang), v = 560 + 760 * aim.pow, tip = 34 - 56 * aim.pow + AL;
        let x = SX + c * tip, y = SY + s * tip, vx = c * v, vy = s * v;
        const lim = SX + (tg.x - SX) * .62;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 60 && x < lim && y < GY; i++) {
          for (let j = 0; j < 4; j++) { vx += wind * .005; vy += G * .005; x += vx * .005; y += vy * .005; }
          ctx.globalAlpha = .85 * (1 - (x - SX) / (lim - SX + 1));
          ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      };
      const drawHud = () => {
        ctx.fillStyle = 'rgba(16,30,60,.55)'; ctx.beginPath(); ctx.roundRect(14, 14, 172, 52, 14); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = font(900, 10); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('WIND', 28, 30);
        ctx.fillStyle = '#ffffff'; ctx.font = font(900, 18); ctx.fillText((Math.abs(wind) / 25).toFixed(1) + ' m/s', 28, 50);
        const s = clamp(Math.abs(wind) / 200, 0, 1), dir = wind < 0 ? -1 : 1, cx = 148, len = 10 + 24 * s;
        ctx.strokeStyle = wind < 0 ? '#ff9a8a' : '#8fffb0'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - dir * len / 2, 40); ctx.lineTo(cx + dir * len / 2, 40);
        ctx.moveTo(cx + dir * len / 2 - dir * 7, 33); ctx.lineTo(cx + dir * len / 2, 40); ctx.lineTo(cx + dir * len / 2 - dir * 7, 47); ctx.stroke();
        ctx.font = font(800, 9); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.textAlign = 'center';
        ctx.fillText(Math.abs(wind) < 8 ? 'CALM' : wind < 0 ? 'HEADWIND' : 'TAILWIND', cx, 58);
        for (let i = 0; i < SHOTS; i++) {
          const x = W - 24 - (SHOTS - 1 - i) * 27, y = 30, v = scores[i];
          ctx.fillStyle = v == null ? 'rgba(16,30,60,.35)' : v ? RING[v - 1] : 'rgba(16,30,60,.6)';
          ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
          if (i === n && state !== 'over' && state !== 'idle') { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke(); }
          if (v != null) {
            ctx.fillStyle = v === 0 ? '#ffffff' : v <= 2 || v >= 9 ? '#2b2a33' : '#ffffff'; ctx.font = font(900, v === 10 ? 10 : 11);
            ctx.fillText(v ? v : 'M', x, y + .5);
          }
        }
        if (state === 'aim' && (aim.drag || aim.kb)) {
          const x = SX - 70, y = SY - 90, h = 80;
          ctx.fillStyle = 'rgba(16,30,60,.5)'; ctx.beginPath(); ctx.roundRect(x, y, 14, h, 7); ctx.fill();
          const g = ctx.createLinearGradient(0, y + h, 0, y); g.addColorStop(0, '#2ee59d'); g.addColorStop(.6, '#ffd23f'); g.addColorStop(1, '#ff4d6d');
          ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x + 3, y + h - 3 - (h - 6) * aim.pow, 8, (h - 6) * aim.pow, 4); ctx.fill();
        }
      };
      const draw = t => {
        ctx.save();
        ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
        ctx.drawImage(bg, 0, 0, W, H);
        clouds.forEach(drawCloud);
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        for (const m of motes) { ctx.beginPath(); ctx.arc(m.x, m.y + Math.sin(m.p) * 6, 1.4, 0, TAU); ctx.fill(); }
        drawSock(t);
        for (const gArr of ground) drawArrow(gArr.x, gArr.y, gArr.ang, AL, 10);
        drawTarget();
        drawArcher();
        drawHint();
        if (state === 'fly' && recN) drawArrow(fl.x, fl.y, Math.atan2(fl.vy, fl.vx), AL);
        if (state === 'replay' && rp) {
          const tt = rp.from + clamp(rp.t - .5, 0, 99) * .3;
          if (tt < rp.end) { const [x, y, a] = sample(tt); drawArrow(x, y, a, AL); }
        }
        fx.draw(ctx, false);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const p of pops) {
          const k = p.t / 1.2;
          ctx.globalAlpha = clamp(1.6 - k * 1.6, 0, 1); ctx.font = font(900, 28, 1);
          ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(20,20,40,.8)'; ctx.strokeText(p.a, p.x, p.y - k * 30);
          ctx.fillStyle = p.c; ctx.fillText(p.a, p.x, p.y - k * 30);
        }
        ctx.globalAlpha = 1;
        if (state === 'fly' && fl.y < -6) {
          ctx.fillStyle = 'rgba(16,30,60,.6)'; ctx.beginPath(); ctx.moveTo(fl.x, 6); ctx.lineTo(fl.x - 7, 18); ctx.lineTo(fl.x + 7, 18); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        drawHud();
        if (state === 'replay') {
          ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, W, 34 * smooth(rp.t * 3)); ctx.fillRect(0, H - 34 * smooth(rp.t * 3), W, 34);
          ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(W / 2 - 46, H - 17, 5, 0, TAU); if ((t / 400 | 0) % 2) ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = font(900, 13); ctx.textAlign = 'left'; ctx.fillText('REPLAY · tap to skip', W / 2 - 34, H - 16);
        }
        banner(ctx, msg, W / 2, 112, 54);
      };

      api.loop((dt, t) => {
        time += dt;
        windVis = lerp(windVis, wind, Math.min(1, dt * 3));
        for (const c of clouds) { c.x += (6 + wind * .12) * c.d * dt; if (c.x > W + 90) c.x = -90; if (c.x < -90) c.x = W + 90; }
        for (const m of motes) { m.x += (wind * .45 + 4) * dt; m.p += dt * 2; if (m.x > W + 10) m.x = -10; if (m.x < -10) m.x = W + 10; }
        if (tg.amp) tg.y = tg.by + tg.amp * Math.sin(time * tg.w + tg.ph); else tg.y = lerp(tg.y, tg.by, Math.min(1, dt * 6));
        if (state === 'aim') {
          const u = (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0);
          if (u && !aim.drag) aim.ang = clamp(aim.ang - u * dt * .55, -1.3, .35);
          if (aim.kb) aim.pow = Math.min(1, aim.pow + dt * .85);
        } else if (state === 'move') {
          tg.mt = Math.min(1, tg.mt + dt / .8); tg.x = lerp(tg.x0, tg.x1, smooth(tg.mt));
          if (tg.mt >= 1) state = 'aim';
        } else if (state === 'fly') flyStep(dt);
        else if (state === 'wait') { wait -= dt; if (wait <= 0) next(); }
        else if (state === 'replay') {
          rp.t += dt;
          const slow = .5 + (rp.end - rp.from) / .3, zIn = smooth(rp.t / .5), zOut = smooth((rp.t - slow - 1) / .5), z = zIn * (1 - zOut);
          cam.z = 1 + 1.6 * z; cam.x = lerp(W / 2, tg.x - 40, z); cam.y = lerp(H / 2, tg.y, z);
          if (rp.ar.hidden && rp.t >= slow) { rp.ar.hidden = false; rp.ar.t0 = time; fx.burst(tg.x - 4, tg.y + rp.ar.dy, 16, '#ffe45c', 220, .6, 200, 2); api.sfx('win'); }
          if (rp.t > 20) { rp.ar.hidden = false; rp.t = slow + 1.5; }
          if (rp.t >= slow + 1.5) { cam.z = 1; cam.x = W / 2; cam.y = H / 2; rp = null; msg = null; state = 'wait'; wait = .25; }
        }
        for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > 1.2) pops.splice(i, 1); }
        if (msg) msg.t += dt;
        fx.update(dt);
        draw(t);
      });

      hud();
      api.overlay({
        kicker: 'Sports', title: 'Archery',
        text: 'Drag back anywhere and release: direction aims, length sets power. Read the wind. Ten arrows score 1 to 10; targets move after arrow six.',
        button: 'Play', onAction: begin
      });
    }
  });
})();

