(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rint = (R, k) => Math.floor(R() * k);
  const shuffle = (R, a) => { for (let i = a.length - 1; i > 0; i--) { const j = rint(R, i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const clone = o => JSON.parse(JSON.stringify(o));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex2rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const shade = (h, k) => {
    const [r, g, b] = hex2rgb(h);
    const f = k < 0 ? v => Math.round(v * (1 + k)) : v => Math.round(v + (255 - v) * k);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };
  const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function text(ctx, s, x, y, size, fill, align, stroke, weight) {
    ctx.font = `${weight || 900} ${size}px ${FONT}`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, size * .22); ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
  }
  const CPU_NAMES = ['Rosa', 'Theo', 'Kai', 'Mila', 'Otto', 'Jade', 'Leo', 'Nora', 'Ivy', 'Finn', 'Zoe'];

  function makeSnd(api) {
    let ac = null, nb = null;
    const ctx = () => {
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === 'suspended') ac.resume();
        return ac;
      } catch (e) { return null; }
    };
    const tone = (f, d, type, vol, f2, delay) => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        const now = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
        o.type = type || 'sine'; o.frequency.setValueAtTime(f, now);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d);
        g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(vol || .06, now + .012); g.gain.exponentialRampToValueAtTime(.0001, now + d);
        o.connect(g).connect(c.destination); o.start(now); o.stop(now + d + .03);
      } catch (e) {}
    };
    const noise = (d, vol, f, q, delay, f2) => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        if (!nb) { nb = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
        const now = c.currentTime + (delay || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
        s.buffer = nb; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f, now); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, now + d); fl.Q.value = q || 1;
        g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + .008); g.gain.exponentialRampToValueAtTime(.0001, now + d);
        s.connect(fl).connect(g).connect(c.destination); s.start(now, Math.random() * .5); s.stop(now + d + .03);
      } catch (e) {}
    };
    const S = {
      unlock: ctx,
      tap: () => tone(520, .05, 'sine', .05),
      rattle: () => { for (let i = 0; i < 9; i++) noise(.05, .1, 1800 + Math.random() * 1500, 3, i * .075); },
      land: () => { noise(.09, .16, 700, 1.5); tone(150, .12, 'triangle', .1, 70); },
      hop: () => tone(430 + Math.random() * 60, .07, 'sine', .05, 620),
      step: () => tone(300, .05, 'triangle', .045, 380),
      cap: () => { tone(420, .3, 'sawtooth', .06, 90); noise(.2, .12, 900, 1, 0, 200); },
      bump: () => { tone(260, .16, 'square', .05, 110); },
      home: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .22, 'sine', .07, 0, i * .08)),
      win: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, .3, 'triangle', .07, 0, i * .11)),
      lose: () => tone(330, .5, 'sine', .07, 140),
      good: () => tone(660, .12, 'sine', .07, 990),
      bad: () => tone(200, .2, 'triangle', .08, 110),
      hiss: () => { noise(.7, .13, 6000, .8, 0, 2500); tone(500, .6, 'sawtooth', .02, 120); },
      climb: () => { for (let i = 0; i < 6; i++) tone(400 + i * 60, .08, 'square', .03, 0, i * .11); },
      card: () => { noise(.07, .12, 3200, 1.2); tone(220, .05, 'triangle', .04); },
      slide: () => { noise(.55, .12, 500, 1.2, 0, 3500); },
      swap: () => { tone(500, .1, 'sine', .06, 800); tone(800, .1, 'sine', .06, 500, .11); },
      six: () => [660, 880, 1100].forEach((f, i) => tone(f, .12, 'sine', .06, 0, i * .07)),
      tick: () => tone(1200, .025, 'square', .015),
      close: () => { try { if (ac) ac.close(); } catch (e) {} }
    };
    return S;
  }

  function makeFx() {
    const list = [];
    return {
      list,
      burst(x, y, cols, n, sp, life) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * TAU, v = (.35 + Math.random() * .65) * (sp || 160);
          list.push({ k: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (sp || 160) * .3, g: 380, life: 0, max: (life || .8) * (.6 + Math.random() * .6), c: cols[i % cols.length], s: 3 + Math.random() * 4, rot: Math.random() * TAU, vr: (Math.random() - .5) * 12, sq: Math.random() < .5 });
        }
      },
      confetti(w, cols, n) {
        for (let i = 0; i < n; i++) list.push({ k: 'p', x: Math.random() * w, y: -10 - Math.random() * 60, vx: (Math.random() - .5) * 90, vy: 60 + Math.random() * 120, g: 60, life: -Math.random() * .9, max: 3.2 + Math.random(), c: cols[i % cols.length], s: 4 + Math.random() * 4, rot: Math.random() * TAU, vr: (Math.random() - .5) * 10, sq: true });
      },
      ring(x, y, col, r, life) { list.push({ k: 'r', x, y, c: col, r: r || 40, life: 0, max: life || .55 }); },
      text(x, y, s, col, size, life) { list.push({ k: 't', x, y, s, c: col, size: size || 22, life: 0, max: life || 1.1 }); },
      clear() { list.length = 0; },
      draw(ctx, dt) {
        for (let i = list.length - 1; i >= 0; i--) {
          const f = list[i]; f.life += dt;
          if (f.life >= f.max) { list.splice(i, 1); continue; }
          if (f.life < 0) continue;
          const u = f.life / f.max;
          ctx.save();
          if (f.k === 'p') {
            f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
            ctx.globalAlpha = u > .7 ? (1 - u) / .3 : 1; ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.c;
            if (f.sq) ctx.fillRect(-f.s / 2, -f.s / 4, f.s, f.s / 2); else { ctx.beginPath(); ctx.arc(0, 0, f.s / 2, 0, TAU); ctx.fill(); }
          } else if (f.k === 'r') {
            ctx.globalAlpha = 1 - u; ctx.strokeStyle = f.c; ctx.lineWidth = 5 * (1 - u) + 1; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (.3 + easeOut(u) * .9), 0, TAU); ctx.stroke();
          } else {
            const sc = u < .15 ? .6 + u / .15 * .5 : u < .25 ? 1.1 - (u - .15) / .1 * .1 : 1;
            ctx.globalAlpha = u > .7 ? (1 - u) / .3 : 1; ctx.translate(f.x, f.y - u * 26); ctx.scale(sc, sc);
            text(ctx, f.s, 0, 0, f.size, f.c, 'center', 'rgba(10,14,30,.85)');
          }
          ctx.restore();
        }
      }
    };
  }

  const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  const qaxis = (x, y, z, a) => { const l = Math.hypot(x, y, z) || 1, s = Math.sin(a / 2) / l; return [x * s, y * s, z * s, Math.cos(a / 2)]; };
  const qnorm = q => { const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; };
  const qrot = (q, v) => {
    const [x, y, z, w] = q, [vx, vy, vz] = v;
    const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
    return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
  };
  const qslerp = (a, b, t) => {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    if (d < 0) { b = [-b[0], -b[1], -b[2], -b[3]]; d = -d; }
    if (d > .9995) return qnorm([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)]);
    const th = Math.acos(d), s = Math.sin(th), k1 = Math.sin((1 - t) * th) / s, k2 = Math.sin(t * th) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2, a[3] * k1 + b[3] * k2];
  };
  const DFACE = [
    null,
    { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
    { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
    { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
    { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
    { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
    { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }
  ];
  const DPIPS = [null, [[0, 0]], [[-.5, .5], [.5, -.5]], [[-.5, .5], [0, 0], [.5, -.5]], [[-.5, .5], [.5, .5], [-.5, -.5], [.5, -.5]], [[-.5, .5], [.5, .5], [0, 0], [-.5, -.5], [.5, -.5]], [[-.5, .55], [.5, .55], [-.5, 0], [.5, 0], [-.5, -.55], [.5, -.55]]];
  const DCAM = qmul(qaxis(1, 0, 0, .5), qaxis(0, 1, 0, -.45));
  const DTARGET = [null, qaxis(0, 0, 1, 0), qaxis(0, 1, 0, -Math.PI / 2), qaxis(1, 0, 0, Math.PI / 2), qaxis(1, 0, 0, -Math.PI / 2), qaxis(0, 1, 0, Math.PI / 2), qaxis(0, 1, 0, Math.PI)];

  function makeDie(R) {
    const d = { v: 1, rolling: false, t: 0, dur: 1, hop: 0, q: DTARGET[1], qf: DTARGET[1], ax: [0, 1, 0], sp: 0, q0: DTARGET[1], mid: DTARGET[1], bx: 0, settled: 0 };
    d.set = v => { d.v = v; d.rolling = false; d.q = qmul(qaxis(0, 0, 1, .15), DTARGET[v]); d.settled = 1; };
    d.roll = (v, ms) => {
      d.v = v; d.rolling = true; d.t = 0; d.dur = (ms || 950) / 1000; d.settled = 0;
      d.q0 = d.q; d.ax = [R() - .5, R() - .5, R() - .5]; d.sp = 16 + R() * 8; d.hop = 18 + R() * 8; d.bx = (R() - .5) * 40;
      d.qf = qmul(qaxis(0, 0, 1, (rint(R, 4)) * Math.PI / 2 + (R() - .5) * .35), DTARGET[v]);
      d.mid = d.q0;
    };
    d.update = dt => {
      if (!d.rolling) return false;
      d.t += dt / d.dur;
      if (d.t >= 1) { d.t = 1; d.rolling = false; d.q = d.qf; d.settled = 1; return false; }
      const sp = d.t < .72 ? d.t : .72;
      const ang = d.sp * (1 - Math.pow(1 - sp / .72, 2)) * .72;
      const spun = qmul(qaxis(d.ax[0], d.ax[1], d.ax[2], ang), d.q0);
      d.q = d.t < .6 ? spun : qslerp(spun, d.qf, easeOut((d.t - .6) / .4));
      return true;
    };
    d.offset = () => {
      if (!d.rolling && d.t >= 1) return { x: 0, y: 0, s: 1 };
      if (!d.rolling) return { x: 0, y: 0, s: 1 };
      const u = d.t, b = Math.abs(Math.sin(u * Math.PI * 3.1)) * (1 - u);
      return { x: d.bx * (1 - easeOut(u)), y: -b * d.hop * 3.2, s: 1 + b * .22 };
    };
    d.draw = (ctx, x, y, size, o) => {
      o = o || {};
      const off = d.offset(), S = size * off.s * .5, cx = x + off.x, cy = y + off.y;
      ctx.save();
      ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * .35;
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x + off.x * .6, y + size * .56, size * .42 * (1 - off.y / 300), size * .13, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      const q = qmul(DCAM, d.q);
      const faces = [];
      for (let f = 1; f <= 6; f++) {
        const F = DFACE[f], n = qrot(q, F.n);
        if (n[2] <= .02) continue;
        faces.push({ f, n, z: n[2], F });
      }
      const proj = p => { const k = 5 / (5 - p[2] * .55); return [cx + p[0] * S * k, cy - p[1] * S * k]; };
      faces.sort((a, b) => a.z - b.z);
      const body = o.body || '#fbfaf5', pip = o.pip || '#1d1f2a';
      const L = [-.35, .55, .75];
      for (const fc of faces) {
        const F = fc.F, c3 = qrot(q, F.n), u3 = qrot(q, F.u), v3 = qrot(q, F.v);
        const corner = (a, b) => [c3[0] + u3[0] * a + v3[0] * b, c3[1] + u3[1] * a + v3[1] * b, c3[2] + u3[2] * a + v3[2] * b];
        const ins = .82;
        const P = [corner(-ins, ins), corner(ins, ins), corner(ins, -ins), corner(-ins, -ins)].map(proj);
        const lit = clamp(fc.n[0] * L[0] + fc.n[1] * L[1] + fc.n[2] * L[2], 0, 1);
        const col = shade(body, -.32 + lit * .34);
        const edge = shade(body, -.5 + lit * .25);
        ctx.lineJoin = 'round';
        ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
        ctx.lineWidth = S * .36 + 2; ctx.strokeStyle = edge; ctx.stroke();
        ctx.lineWidth = S * .3; ctx.strokeStyle = col; ctx.stroke(); ctx.fillStyle = col; ctx.fill();
        const o0 = proj(c3), ux = proj([c3[0] + u3[0], c3[1] + u3[1], c3[2] + u3[2]]), vx = proj([c3[0] + v3[0], c3[1] + v3[1], c3[2] + v3[2]]);
        ctx.save();
        ctx.transform(ux[0] - o0[0], ux[1] - o0[1], vx[0] - o0[0], vx[1] - o0[1], o0[0], o0[1]);
        const six = fc.f === 1 && o.red1 !== false;
        for (const [a, b] of DPIPS[fc.f]) {
          const pc = six ? '#d9262d' : pip, pr = fc.f === 1 ? .27 : .17;
          ctx.fillStyle = pc; ctx.beginPath(); ctx.arc(a * 1.0, -b * 1.0, pr, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.arc(a - pr * .25, -b * 1.0 - pr * .3, pr * .38, 0, TAU); ctx.fill();
        }
        ctx.restore();
        if (lit > .55) {
          const g = ctx.createRadialGradient(o0[0] - S * .2, o0[1] - S * .25, 0, o0[0] - S * .2, o0[1] - S * .25, S * 1.1);
          g.addColorStop(0, `rgba(255,255,255,${(lit - .5) * .5})`); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
        }
      }
      if (o.glow) {
        ctx.globalAlpha = .55 + .45 * Math.sin(o.glow * 6); ctx.strokeStyle = o.glowCol || '#ffe14a'; ctx.lineWidth = 3; ctx.shadowColor = o.glowCol || '#ffe14a'; ctx.shadowBlur = 14;
        rr(ctx, cx - S * 1.2, cy - S * 1.2, S * 2.4, S * 2.4, S * .5); ctx.stroke();
      }
      ctx.restore();
    };
    return d;
  }

  function drawPawn(ctx, x, y, r, col, o) {
    o = o || {};
    const lift = o.lift || 0, sx = o.sx || 1, sy = o.sy || 1, a = o.alpha == null ? 1 : o.alpha;
    ctx.save();
    ctx.globalAlpha = a;
    if (!o.noShadow) {
      ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath();
      ctx.ellipse(x + lift * .15, y + r * .12, r * .92 * (1 - Math.min(.4, lift / (r * 6))), r * .34 * (1 - Math.min(.4, lift / (r * 6))), 0, 0, TAU); ctx.fill();
    }
    if (o.glow) {
      ctx.globalAlpha = a * (.5 + .5 * Math.sin(o.glow * 7)); ctx.shadowColor = o.glowCol || '#fff'; ctx.shadowBlur = r * 1.1;
      ctx.fillStyle = o.glowCol || '#fff'; ctx.beginPath(); ctx.ellipse(x, y - lift, r * 1.08, r * .46, 0, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = a;
    }
    ctx.translate(x, y - lift); if (o.rot) ctx.rotate(o.rot); ctx.scale(sx, sy);
    const dk = shade(col, -.42), md = col, lt = shade(col, .45);
    const bw = r * .98, h = r * 1.5;
    const g = ctx.createLinearGradient(-bw, 0, bw, 0);
    g.addColorStop(0, dk); g.addColorStop(.35, lt); g.addColorStop(.6, md); g.addColorStop(1, dk);
    ctx.fillStyle = g; ctx.strokeStyle = shade(col, -.6); ctx.lineWidth = Math.max(1, r * .1); ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-bw, r * .02);
    ctx.bezierCurveTo(-bw, -r * .26, -r * .3, -r * .3, -r * .3, -h * .82);
    ctx.lineTo(r * .3, -h * .82);
    ctx.bezierCurveTo(r * .3, -r * .3, bw, -r * .26, bw, r * .02);
    ctx.bezierCurveTo(bw, r * .3, -bw, r * .3, -bw, r * .02); ctx.closePath(); ctx.fill(); ctx.stroke();
    const hy = -h * .94, hr = r * .56;
    const hg = ctx.createRadialGradient(-hr * .35, hy - hr * .4, hr * .1, 0, hy, hr * 1.15);
    hg.addColorStop(0, '#fff'); hg.addColorStop(.25, lt); hg.addColorStop(.7, md); hg.addColorStop(1, dk);
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, hy, hr, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-hr * .34, hy - hr * .38, hr * .26, hr * .16, -.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = r * .09; ctx.beginPath(); ctx.moveTo(-bw * .62, -r * .05); ctx.quadraticCurveTo(-r * .45, -h * .35, -r * .2, -h * .7); ctx.stroke();
    if (o.label != null) text(ctx, o.label, 0, -r * .3, r * .62, '#fff', 'center', shade(col, -.55));
    ctx.restore();
  }

  function pathAt(P, ms) {
    let t = ms, i = 0;
    for (; i < P.segs.length; i++) { if (t < P.segs[i].dur) break; t -= P.segs[i].dur; }
    if (i >= P.segs.length) { const s = P.segs[P.segs.length - 1]; return { x: s.x1, y: s.y1, z: 0, sx: 1, sy: 1, done: true, i: P.segs.length - 1, u: 1 }; }
    const s = P.segs[i], u = s.dur ? clamp(t / s.dur, 0, 1) : 1;
    let x, y, z = 0, sx = 1, sy = 1;
    if (s.fn) { const r = s.fn(u); x = r.x; y = r.y; z = r.z || 0; sx = r.sx || 1; sy = r.sy || 1; }
    else {
      const e = s.ease ? s.ease(u) : u;
      x = lerp(s.x0, s.x1, e); y = lerp(s.y0, s.y1, e);
      if (s.h) {
        z = Math.sin(u * Math.PI) * s.h;
        const sq = u < .12 ? 1 - (.12 - u) / .12 * .12 : u > .88 ? 1 - (u - .88) / .12 * .16 : 1;
        sy = sq; sx = 2 - sq;
        if (u < .1) { sy = .84 + u / .1 * .16; sx = 1.1 - u / .1 * .1; }
        if (u > .9) { sy = 1 - (u - .9) / .1 * .2; sx = 1 + (u - .9) / .1 * .12; }
      }
    }
    return { x, y, z, sx, sy, done: false, i, u };
  }
  const pathLen = P => P.segs.reduce((a, s) => a + s.dur, 0);
  function hopPath(pts, dur, h, ease) {
    const segs = [];
    for (let i = 1; i < pts.length; i++) segs.push({ x0: pts[i - 1].x, y0: pts[i - 1].y, x1: pts[i].x, y1: pts[i].y, dur, h, ease, ev: pts[i].ev });
    return { segs };
  }

  function drawAvatar(ctx, x, y, r, seed, col, ring) {
    const SK = ['#f6d3b3', '#e8b48a', '#c98f65', '#8d5a3b', '#f2c9a0'], HR = ['#2b1d14', '#6b3b1c', '#d9a441', '#1a1a1f', '#a2381f', '#e8e0d0'], SH = ['#4f86e8', '#e8664f', '#52b788', '#b57bd8', '#f1a73a', '#3fb8c9'];
    const s = Math.abs(seed | 0), sk = SK[s % 5], hr = HR[(s >> 1) % 6], sh = SH[(s >> 2) % 6], hs = s % 4;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col || '#4a5578'; ctx.fill(); ctx.clip();
    ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(x, y + r * 1.02, r * .78, r * .52, 0, 0, TAU); ctx.fill();
    if (hs === 1 || hs === 2) { ctx.fillStyle = hr; ctx.beginPath(); ctx.ellipse(x, y + r * .12, r * .55, r * .62, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = sk; ctx.beginPath(); ctx.arc(x, y + r * .02, r * .42, 0, TAU); ctx.fill();
    ctx.fillStyle = hr; ctx.beginPath();
    if (hs === 0) ctx.arc(x, y - r * .06, r * .45, Math.PI * 1.02, Math.PI * 1.98);
    else if (hs === 1) ctx.arc(x, y - r * .1, r * .44, Math.PI * 1.08, Math.PI * 1.92);
    else if (hs === 2) { ctx.arc(x, y - r * .05, r * .46, Math.PI, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x + r * .3, y - r * .42, r * .16, 0, TAU); }
    else { for (let k = -2; k <= 2; k++) { ctx.moveTo(x + k * r * .17 + r * .15, y - r * .36); ctx.arc(x + k * r * .17, y - r * .36, r * .15, 0, TAU); } }
    ctx.fill();
    ctx.fillStyle = '#1b1b1f'; ctx.beginPath(); ctx.arc(x - r * .15, y + r * .02, r * .055, 0, TAU); ctx.arc(x + r * .15, y + r * .02, r * .055, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,110,110,.45)'; ctx.beginPath(); ctx.arc(x - r * .26, y + r * .14, r * .07, 0, TAU); ctx.arc(x + r * .26, y + r * .14, r * .07, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + r * .1, r * .15, .2 * Math.PI, .8 * Math.PI); ctx.lineWidth = r * .065; ctx.lineCap = 'round'; ctx.strokeStyle = '#1b1b1f'; ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = Math.max(2, r * .12); ctx.strokeStyle = ring || '#fff'; ctx.stroke();
  }

  const baseCss = (id, th) => `
.gm-${id}{gap:0}
.gm-${id} [hidden]{display:none!important}
.gm-${id} .gp-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px ${th.shadow};touch-action:none;background:${th.bg};user-select:none;-webkit-user-select:none}
.gm-${id} .gp-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-${id} .gp-ui{position:absolute;inset:0;pointer-events:none;font-family:var(--sans);color:#fff}
.gm-${id} .gp-ui button{pointer-events:auto;font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-${id} .gp-ico{position:absolute;left:8px;top:8px;width:42px;height:42px;border-radius:14px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.34);color:#fff;display:grid;place-items:center;padding:0}
.gm-${id} .gp-net{position:absolute;right:8px;top:8px;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.38);font:800 11px var(--sans)}
.gm-${id} .gp-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-${id} .gp-net.bad i{background:#ff5b4b}
.gm-${id} .gp-pane{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:10px;pointer-events:auto;background:rgba(5,10,24,.58);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
.gm-${id} .gp-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-${id} .gp-box{width:100%;max-width:400px;margin:auto;background:${th.box};border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:16px 16px 14px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:gp-in .22s ease-out}
.gm-${id} .gp-box.wide{max-width:540px}
@keyframes gp-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-${id} .gp-box h3{margin:2px 0 8px;font:900 22px var(--sans);letter-spacing:.2px}
.gm-${id} .gp-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.86)}
.gm-${id} .gp-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:${th.accent}!important;margin:0 0 2px!important}
.gm-${id} .gp-big{display:block;width:100%;min-height:52px;margin:8px 0;border:0;border-radius:16px;color:#fff;font:900 19px/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px}
.gm-${id} .gp-big:active{transform:translateY(2px)}
.gm-${id} .gp-big small{display:block;font:800 12px var(--sans);opacity:.88;text-shadow:none;margin-top:2px}
.gm-${id} .green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-${id} .blue{background:linear-gradient(#3d8cf0,#1659b5)}
.gm-${id} .red{background:linear-gradient(#ff5d4d,#cf2117)}
.gm-${id} .gold{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
.gm-${id} .gp-sm{min-height:42px;padding:0 14px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px}
.gm-${id} .gp-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-${id} .gp-opt{display:flex;align-items:center;gap:10px;margin:7px 0;text-align:left}
.gm-${id} .gp-opt>span{flex:0 0 38%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.88)}
.gm-${id} .gp-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.55);margin-top:2px}
.gm-${id} .gp-seg{flex:1;display:flex;gap:5px}
.gm-${id} .gp-seg button{flex:1;min-height:40px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans);padding:0 4px}
.gm-${id} .gp-seg button.on{background:${th.accent};border-color:#fff;color:#1b1b1f}
.gm-${id} .gp-sec{margin:12px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:${th.accent}!important}
.gm-${id} .gp-logo{font:900 54px/1 var(--sans);font-style:italic;letter-spacing:-1px;color:${th.accent};-webkit-text-stroke:3px ${th.stroke};paint-order:stroke fill;text-shadow:3px 4px 0 ${th.stroke};margin:2px 0 6px}
.gm-${id} .gp-tag{font:800 13px var(--sans);color:rgba(255,255,255,.85);margin:4px 0 8px;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.gm-${id} .gp-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans)}
.gm-${id} .gp-tbl td{padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.gm-${id} .gp-tbl td:first-child{text-align:left}
.gm-${id} .gp-tbl tr.win td{color:${th.accent}}
.gm-${id} .gp-tbl i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:2px solid #fff}
.gm-${id} .gp-rules{text-align:left;max-height:none}
.gm-${id} .gp-rules p{font:700 13px/1.45 var(--sans)!important}
.gm-${id} .gp-rules kbd{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.gm-${id} .gp-who{width:62px;height:62px;border-radius:50%;margin:0 auto 6px;border:4px solid #fff}
`;

  function makeApp(root, api, G) {
    const opt = Object.assign({ mode: 'cpu', n: G.defN, diff: 'Normal', timer: 0, wins: 0, rot: true, v: 2 }, G.rulesDef, api.load() || {});
    if (opt.mode !== 'cpu' && opt.mode !== 'online') opt.mode = 'cpu';
    if (G.diffs && !G.diffs.includes(opt.diff)) opt.diff = G.diffs[1] || G.diffs[0];
    if (!(opt.n >= G.minN && opt.n <= G.maxN)) opt.n = G.defN;
    const saveOpt = () => api.save(opt);
    const snd = makeSnd(api);
    const wrap = document.createElement('div'); wrap.className = 'gp-wrap';
    const cv = document.createElement('canvas');
    const ui = document.createElement('div'); ui.className = 'gp-ui';
    ui.innerHTML = `<button class="gp-ico" data-u="menu" aria-label="Menu" hidden><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg></button><div class="gp-net" hidden><i></i><span>Online</span></div><div class="gp-pane" hidden></div>`;
    wrap.append(cv, ui); root.append(wrap);
    const ctx = cv.getContext('2d');
    const bMenu = ui.querySelector('[data-u=menu]'), pane = ui.querySelector('.gp-pane'), netEl = ui.querySelector('.gp-net');
    const M = { mode: 'cpu', role: 'local', eng: null, tok: 0, cpu: [], human: [], names: [], pids: [], players: [], bots: false, size: 0, lastV: null, awaiting: false, dl: 0, dlTid: -1, cpuTid: -1, ended: false, hooked: false, diff: opt.diff };
    let W = 900, H = 600, PORT = null, DPR = 1, scene = 'title', viewer = 0, clk = 0, busyUntil = 0, paused = false, idleDone = true, paneH = null, lastPaneK = '', R = null, ac = 0;
    const Q = [], sched = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const view = () => M.role === 'guest' ? M.lastV : M.eng ? M.eng.view() : null;
    const isCpu = p => !!M.cpu[p];
    const after = (ms, fn) => { sched.push({ at: clk + ms, fn, tok: M.tok }); };

    const app = {
      api, opt, M, snd, rnd: Math.random,
      get viewer() { return viewer; },
      get W() { return W; }, get H() { return H; }, get port() { return PORT; },
      get clock() { return clk; },
      get names() { return M.names; },
      get cpu() { return M.cpu; },
      get online() { return M.mode === 'online'; },
      after, view,
      idleNow: () => isIdleNow(),
      act(a) { return send(a); },
      toast: m => api.toast(m)
    };
    R = G.renderer(app);

    function showPane(kind, html, handler, cls) {
      pane.className = 'gp-pane' + (cls ? ' ' + cls : '');
      pane.dataset.k = kind; pane.innerHTML = html; pane.hidden = false; paneH = handler; pane.scrollTop = 0;
    }
    function hidePane() { pane.hidden = true; pane.innerHTML = ''; paneH = null; }
    api.on(pane, 'click', e => {
      const sb = e.target.closest('.gp-seg button');
      if (sb) {
        const k = sb.parentNode.dataset.k, v = JSON.parse(sb.dataset.v);
        opt[k] = v; saveOpt(); snd.tap();
        [...sb.parentNode.children].forEach(b => b.classList.toggle('on', b === sb));
        if (G.onOpt) G.onOpt(opt, k);
        const sub = pane.querySelector('[data-sub]');
        if (sub && k === 'n') sub.textContent = `You and ${opt.n - 1} bot${opt.n > 2 ? 's' : ''}`;
        return;
      }
      const b = e.target.closest('[data-a]');
      if (b && paneH) { snd.unlock(); snd.tap(); paneH(b.dataset.a, b); }
    });
    const seg = (k, vals, cur) => `<div class="gp-seg" data-k="${k}">${vals.map(([v, l]) => `<button data-v='${JSON.stringify(v)}' class="${same(v, cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const optRow = (k, label, hint, vals, cur) => `<div class="gp-opt"><span>${label}${hint ? `<small>${hint}</small>` : ''}</span>${seg(k, vals, cur)}</div>`;
    const ONOFF = [[false, 'Off'], [true, 'On']];

    function showTitle() {
      M.tok++; scene = 'title'; paused = false; M.mode = 'cpu'; M.role = 'local'; M.eng = null; M.lastV = null; Q.length = 0; sched.length = 0;
      bMenu.hidden = true; netEl.hidden = true; R.reset(null); api.score(opt.wins || 0);
      const nn = []; for (let i = G.minN; i <= G.maxN; i++) nn.push([i, String(i)]);
      showPane('title', `<div class="gp-box"><div class="gp-logo">${G.title}</div><p class="gp-tag">${G.tag}</p>
${optRow('n', 'Players', '', nn, opt.n)}${G.diffs ? optRow('diff', 'Bots', '', G.diffs.map(d => [d, d]), opt.diff) : ''}
<button class="gp-big green" data-a="play">Play vs bots<small data-sub>You and ${opt.n - 1} bot${opt.n > 2 ? 's' : ''}</small></button>
<button class="gp-big blue" data-a="online">Play online<small>Party up to ${G.maxN}, bots can fill empty seats</small></button>
<div class="gp-row"><button class="gp-sm" data-a="rules">Rules</button><button class="gp-sm" data-a="how">How to play</button></div>${opt.wins ? `<p class="gp-tag">Wins: ${opt.wins}</p>` : ''}</div>`, a => {
        if (a === 'play') { opt.mode = 'cpu'; saveOpt(); M.mode = 'cpu'; newMatch(); }
        else if (a === 'online') startOnline();
        else if (a === 'rules') showRules('title');
        else if (a === 'how') showHow('title');
      });
    }
    function showRules(back) {
      let h = `<div class="gp-box wide"><p class="gp-kick">Settings</p><h3>House rules</h3>`;
      h += `<p class="gp-sec">Rules</p>` + G.optSchema.map(o => optRow(o.k, o.label, o.hint, o.vals, opt[o.k])).join('');
      h += `<p class="gp-sec">Game</p>` + optRow('timer', 'Turn timer', 'Auto-play when time runs out', [[0, 'Off'], [15, '15s'], [30, '30s'], [60, '60s']], opt.timer);
      if (G.rotates) h += optRow('rot', 'Turn the board', 'Your colour at the bottom', ONOFF, opt.rot);
      h += `<p class="gp-tag">Rules apply to the next game. Online, the host's rules are used.</p><button class="gp-big green" data-a="done">Done</button></div>`;
      showPane('rules', h, () => { saveOpt(); back === 'menu' ? showMenu() : showTitle(); });
    }
    function showHow(back) {
      showPane('how', `<div class="gp-box wide"><h3>How to play</h3><div class="gp-rules">${G.help}</div><button class="gp-big green" data-a="done">Got it</button></div>`, () => back === 'menu' ? showMenu() : showTitle());
    }
    function showMenu() {
      if (scene !== 'game') return;
      if (M.mode !== 'online') paused = true;
      const canRestart = M.role !== 'guest';
      showPane('menu', `<div class="gp-box"><p class="gp-kick">${G.title}</p><h3>Menu</h3><button class="gp-big green" data-a="resume">Resume</button>${canRestart ? `<button class="gp-big gold" data-a="restart">Restart game</button>` : ''}<div class="gp-row"><button class="gp-sm" data-a="how">How to play</button><button class="gp-sm" data-a="rules">Rules</button></div><button class="gp-big red" data-a="quit">${M.mode === 'online' ? 'Leave game' : 'Quit to menu'}</button></div>`, a => {
        if (a === 'resume') { hidePane(); paused = false; idleDone = false; }
        else if (a === 'restart') { hidePane(); paused = false; newMatch(); }
        else if (a === 'how') showHow('menu');
        else if (a === 'rules') showHow('menu');
        else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
      });
    }
    bMenu.addEventListener('click', () => { snd.unlock(); if (!pane.hidden && pane.dataset.k === 'menu') { hidePane(); paused = false; idleDone = false; } else if (pane.hidden) showMenu(); });

    function seats(n, humans) {
      M.cpu = Array(n).fill(false); M.human = Array(n).fill(false); M.names = [];
      const pool = CPU_NAMES.slice().sort(() => Math.random() - .5);
      for (let p = 0; p < n; p++) {
        M.human[p] = humans.includes(p); M.cpu[p] = !M.human[p];
        const pl = M.mode === 'online' ? M.players.find(x => x.id === M.pids[p]) : null;
        M.names[p] = M.human[p] ? (M.mode === 'online' ? (pl ? pl.name : 'Player') : 'You') : pool.pop();
      }
    }
    function newMatch() {
      M.tok++; M.ended = false; M.awaiting = false; M.cpuTid = -1; M.diff = opt.diff; Q.length = 0; sched.length = 0; busyUntil = clk;
      const online = M.mode === 'online' && M.role === 'host';
      if (!online) { M.mode = 'cpu'; M.role = 'local'; }
      let n, humans;
      if (online) {
        const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
        M.players = live;
        const k = Math.max(1, Math.min(G.maxN, live.length));
        n = Math.max(G.minN, Math.min(G.maxN, M.bots ? Math.max(k, M.size || k) : k));
        humans = live.slice(0, k).map((x, i) => Math.round(i * n / k));
        M.pids = Array(n).fill(null); humans.forEach((q, i) => { M.pids[q] = live[i].id; });
      } else { n = opt.n; humans = [0]; }
      seats(n, humans);
      const rules = {};
      for (const k of Object.keys(G.rulesDef)) rules[k] = opt[k];
      M.eng = G.Engine({ n, rules, rnd: Math.random });
      viewer = 0;
      if (online) sendSetups();
      scene = 'game'; hidePane(); paused = false; M.lastV = null;
      bMenu.hidden = false; netEl.hidden = !online;
      R.reset(M.eng.view());
      api.score(opt.wins || 0);
      M.eng.start();
      flush();
    }
    function flush() {
      if (!M.eng) return;
      const es = M.eng.take();
      if (!es.length) return;
      for (const e of es) Q.push(e);
      idleDone = false;
      if (M.role === 'host') {
        const v = M.eng.view();
        M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'ev', es, v }); });
      }
    }
    function send(a) {
      if (!isIdleNow() || M.awaiting || scene !== 'game' || !pane.hidden) return false;
      const V = view(); if (!V) return false;
      const nd = G.need(V);
      if (!nd || nd.p !== viewer) return false;
      if (M.role === 'guest') { M.awaiting = true; api.net.send({ t: 'act', a }); return true; }
      if (!M.eng) return false;
      const ok = M.eng.act(viewer, a);
      if (ok) flush();
      return ok;
    }
    const isIdleNow = () => !paused && !Q.length && clk >= busyUntil;

    function pump() {
      while (!paused && Q.length && clk >= busyUntil) {
        const e = Q.shift();
        const ms = R.event(e) || 0;
        busyUntil = clk + ms;
        if (!Q.length) idleDone = false;
      }
    }
    function runSched() {
      if (paused) return;
      for (let i = 0; i < sched.length; i++) {
        const s = sched[i];
        if (clk >= s.at) { sched.splice(i--, 1); if (s.tok === M.tok) s.fn(); }
      }
    }
    function armTimer(nd, V) {
      if (!opt.timer && !(V && V.rules && V.rules.timer)) { M.dl = 0; return; }
      const tid = V.tid;
      if (M.dlTid === tid) return;
      M.dlTid = tid;
      const ms = (opt.timer || V.rules.timer) * 1000;
      M.dl = clk + ms;
      if (M.role === 'host') api.net.send({ t: 'tm', tid, ms });
      const tok = M.tok;
      after(ms + 60, () => {
        if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
        const nd2 = G.need(M.eng.s);
        if (!nd2 || nd2.p < 0) return;
        const a = G.auto(M.eng.s, nd2, Math.random);
        if (a && M.eng.act(nd2.p, a)) { if (nd2.p === viewer) api.toast('Time is up'); M.dl = 0; flush(); }
      });
    }
    function onIdle() {
      const V = view();
      if (!V || scene !== 'game') return;
      R.settle(V);
      if (V.phase === 'over') { if (!M.ended) showEnd(V); return; }
      if (M.role === 'guest' || !M.eng) return;
      const nd = G.need(M.eng.s);
      if (!nd || nd.p < 0) return;
      if (isCpu(nd.p)) { scheduleCpu(nd); return; }
      armTimer(nd, M.eng.s);
      if (nd.auto && M.cpuTid !== M.eng.s.tid) {
        M.cpuTid = M.eng.s.tid; const tok = M.tok, tid = M.eng.s.tid, p = nd.p;
        after(rnd(380, 560), () => {
          if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
          if (M.eng.act(p, nd.moves[0])) flush();
        });
      }
    }
    function scheduleCpu(nd) {
      const s = M.eng.s, tid = s.tid;
      if (M.cpuTid === tid) return;
      M.cpuTid = tid;
      const tok = M.tok, tm = G.think(nd, M.diff);
      after(rnd(tm[0], tm[1]), () => {
        if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
        const nd2 = G.need(M.eng.s);
        if (!nd2 || nd2.p !== nd.p) return;
        let a = G.ai(M.eng.s, nd2, M.diff, Math.random);
        if (!a || !M.eng.act(nd2.p, a)) a = nd2.moves[Math.floor(Math.random() * nd2.moves.length)];
        if (a) M.eng.act(nd2.p, a);
        flush();
      });
    }
    function showEnd(V) {
      M.ended = true;
      const won = V.order[0] === viewer;
      if (won) { opt.wins = (opt.wins || 0) + 1; saveOpt(); api.score(opt.wins); api.submit(opt.wins); snd.win(); } else snd.lose();
      const rows = V.order.map((p, i) => `<tr class="${i === 0 ? 'win' : ''}"><td><i style="background:${G.colors[V.cols[p]].main}"></i>${esc(M.names[p] || 'Player')}${p === viewer ? ' (you)' : ''}</td><td>${i + 1}${['st', 'nd', 'rd'][i] || 'th'}</td><td>${G.endStat(V, p)}</td></tr>`).join('');
      const online = M.mode === 'online', host = M.role !== 'guest';
      const who = V.order[0];
      const hd = won ? 'You win!' : `${esc(M.names[who] || 'Player')} wins`;
      showPane('end', `<div class="gp-box"><p class="gp-kick">${G.title}</p><div class="gp-who" style="background:${G.colors[V.cols[who]].main}"></div><h3>${hd}</h3><table class="gp-tbl">${rows}</table><p class="gp-tag">Wins: ${opt.wins || 0}</p>${host ? `<button class="gp-big green" data-a="again">${online ? 'Rematch' : 'Play again'}</button>` : `<p>Waiting for the host…</p>`}${online && M.role === 'host' ? `<button class="gp-big blue" data-a="lobby">Back to lobby</button>` : ''}<button class="gp-big red" data-a="quit">${online ? 'Leave' : 'Menu'}</button></div>`, a => {
        if (a === 'again') newMatch();
        else if (a === 'lobby') startOnline();
        else if (a === 'quit') { if (online) leaveOnline(); else showTitle(); }
      }, 'clear');
      if (won) R.win && R.win(V);
    }

    function sendSetups() {
      const v = M.eng.view();
      M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'setup', seat: q, cpu: M.cpu, human: M.human, names: M.names, v }); });
    }
    function sendSync(id) {
      if (M.role !== 'host' || !M.eng) return;
      const q = M.pids.indexOf(id);
      if (q < 0 || !M.human[q]) return;
      api.net.sendTo(id, { t: 'setup', seat: q, cpu: M.cpu, human: M.human, names: M.names, v: M.eng.view() });
    }
    function seatToCpu(id) {
      const q = M.pids.indexOf(id);
      if (q < 0 || M.role !== 'host' || !M.eng) return;
      const who = M.names[q];
      M.pids[q] = null; M.human[q] = false; M.cpu[q] = true; M.names[q] = who + ' (bot)';
      api.net.send({ t: 'seats', cpu: M.cpu, human: M.human, names: M.names });
      api.toast(who + ' left. A bot takes their seat.');
      idleDone = false; M.cpuTid = -1;
    }
    function leaveOnline() {
      M.tok++; M.mode = 'cpu'; M.role = 'local'; M.eng = null; M.lastV = null; M.pids = []; M.players = [];
      api.net.close(); showTitle();
    }
    function hookNet() {
      if (M.hooked) return;
      M.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToCpu(p.id); });
      api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
      api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (M.mode !== 'online' || !M.role || M.role === 'local') return;
        M.tok++; M.role = 'local'; M.eng = null; M.lastV = null; paused = true; Q.length = 0;
        snd.lose();
        const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
        bMenu.hidden = true;
        showPane('left', `<div class="gp-box"><p class="gp-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="gp-big green" data-a="room">Online lobby</button><button class="gp-big red" data-a="cpu">Play vs bots</button></div>`, a => {
          paused = false;
          if (a === 'room') startOnline(); else { api.net.close(); M.mode = 'cpu'; showTitle(); }
        });
      });
      api.interval(() => {
        if (M.mode !== 'online' || scene !== 'game') return;
        const on = api.net.connected, hn = M.pids.filter((id, q) => id && q !== viewer && M.human[q]).length;
        netEl.classList.toggle('bad', !on);
        netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
      }, 1000);
    }
    async function startOnline() {
      M.tok++; const tok = M.tok;
      hookNet();
      hidePane(); scene = 'title'; paused = false; bMenu.hidden = true; netEl.hidden = true;
      Q.length = 0; sched.length = 0; R.reset(null);
      M.mode = 'online'; M.role = null; M.eng = null; M.lastV = null; opt.mode = 'online'; saveOpt();
      const r = await api.net.room({ title: G.title, sizes: G.sizes, defaultSize: G.defN, min: 2, max: G.maxN, bots: true });
      if (!api.alive || tok !== M.tok) return;
      if (!r) { M.mode = 'cpu'; return showTitle(); }
      M.role = r.role; M.players = r.players.slice(0, G.maxN); M.bots = !!r.bots; M.size = +r.size || r.players.length;
      if (r.role === 'host') { viewer = 0; newMatch(); }
      else showPane('wait', `<div class="gp-box"><p class="gp-kick">Online</p><h3>Connected</h3><p>Waiting for the host to start…</p><div class="gp-row"><button class="gp-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); });
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || M.mode !== 'online') return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(from);
        if (q < 0 || q === viewer || !M.human[q]) return;
        if (d.t === 'act' && d.a && typeof d.a === 'object') {
          if (M.eng.act(q, d.a)) flush(); else api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(), sync: 1 });
        }
      } else {
        if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat; M.ended = false;
          M.cpu = d.cpu; M.human = d.human; M.names = d.names; M.lastV = d.v; M.awaiting = false;
          scene = 'game'; paused = false; Q.length = 0; sched.length = 0; busyUntil = clk; hidePane(); bMenu.hidden = false; netEl.hidden = false;
          R.reset(d.v); idleDone = false; api.score(opt.wins || 0);
        } else if (M.role !== 'guest') return;
        else if (d.t === 'ev') {
          M.lastV = d.v; M.awaiting = false; idleDone = false;
          if (d.sync && !Q.length) R.reset(d.v);
          for (const e of d.es) Q.push(e);
        } else if (d.t === 'seats') { M.cpu = d.cpu; M.human = d.human; M.names = d.names; }
        else if (d.t === 'tm') { M.dl = clk + (+d.ms || 0); M.dlTid = d.tid; }
      }
    }

    function fit(force) {
      const port = (root.clientWidth || 900) < 640;
      if (!force && port === PORT) return;
      PORT = port;
      const d = R.dims(port); W = d[0]; H = d[1];
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
      wrap.style.aspectRatio = `${W} / ${H}`;
      wrap.classList.toggle('gp-port', port);
      R.resize(W, H, port, DPR);
    }
    api.on(window, 'resize', () => fit(false));
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => fit(false)); ro.observe(root); api.on(window, 'pagehide', () => ro.disconnect()); }
    const loc = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    api.on(cv, 'pointerdown', e => {
      snd.unlock();
      if (!pane.hidden || paused) return;
      const p = loc(e);
      if (R.pointer(p.x, p.y, 'down', e)) e.preventDefault();
    });
    api.on(cv, 'pointermove', e => {
      if (e.pointerType !== 'mouse' || !pane.hidden) return;
      const p = loc(e);
      cv.style.cursor = R.cursor(p.x, p.y) ? 'pointer' : '';
      R.pointer(p.x, p.y, 'move', e);
    });
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Escape' && scene === 'game' && M.mode === 'online') { e.preventDefault(); if (pane.hidden) showMenu(); else if (pane.dataset.k === 'menu') { hidePane(); paused = false; idleDone = false; } return; }
      if (scene !== 'game' || !pane.hidden || paused || e.ctrlKey || e.metaKey || e.altKey) return;
      if (R.key(e.code, e)) { e.preventDefault(); }
    });

    api.loop((dt, t) => {
      const d = paused ? 0 : dt;
      clk += d * 1000;
      runSched(); pump();
      if (!idleDone && isIdleNow() && scene === 'game') { idleDone = true; onIdle(); }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const V = scene === 'game' ? view() : null, idle = isIdleNow();
      const nd = V && idle && V.phase !== 'over' ? G.need(V) : null;
      const myTurn = !!(nd && nd.p === viewer && !M.awaiting && pane.hidden && !paused && !nd.auto);
      R.draw(ctx, t, d, { scene, V, nd, idle, myTurn, viewer, dl: M.dl && M.dl > clk ? M.dl - clk : 0, paused, tid: V ? V.tid : -1, names: M.names, cpu: M.cpu, online: M.mode === 'online', paneOpen: !pane.hidden });
    });
    fit(true);
    root._gp = { M, Q, view, opt, app, get viewer() { return viewer; }, idle: isIdleNow, pane: () => pane.hidden ? '' : pane.dataset.k, clock: () => clk, R };
    if (api.net.invite) startOnline(); else showTitle();
    return { destroy() { M.tok++; snd.close(); } };
  }

  function mountGame(G) { return (root, api) => makeApp(root, api, G); }

  const LUDO_COLS = [
    { name: 'Red', main: '#e5322d', dark: '#8f1511', light: '#ff8f86', soft: '#ffd9d5' },
    { name: 'Green', main: '#1fa646', dark: '#0d6a26', light: '#7ee08f', soft: '#d3f4da' },
    { name: 'Yellow', main: '#f6bf10', dark: '#a87a00', light: '#ffe46b', soft: '#fff3bd' },
    { name: 'Blue', main: '#1f6fe0', dark: '#0f3f94', light: '#79b0ff', soft: '#d3e4ff' }
  ];
  const LUDO_RULES = { leave: '6', tri: true, capB: true, homeB: true, exact: true, safe: true, blocks: false, full: false, auto: true, timer: 0 };
  const LR = [];
  for (let c = 0; c <= 5; c++) LR.push([6, c]);
  for (let r = 5; r >= 0; r--) LR.push([r, 6]);
  LR.push([0, 7], [0, 8]);
  for (let r = 1; r <= 5; r++) LR.push([r, 8]);
  for (let c = 9; c <= 14; c++) LR.push([6, c]);
  LR.push([7, 14], [8, 14]);
  for (let c = 13; c >= 9; c--) LR.push([8, c]);
  for (let r = 9; r <= 14; r++) LR.push([r, 8]);
  LR.push([14, 7], [14, 6]);
  for (let r = 13; r >= 9; r--) LR.push([r, 6]);
  for (let c = 5; c >= 0; c--) LR.push([8, c]);
  LR.push([7, 0]);
  const LHOME = [[1, 2, 3, 4, 5].map(c => [7, c]), [1, 2, 3, 4, 5].map(r => [r, 7]), [13, 12, 11, 10, 9].map(c => [7, c]), [13, 12, 11, 10, 9].map(r => [r, 7])];
  const LBASE = [[0, 0], [0, 9], [9, 9], [9, 0]];
  const LSPOT = [[1.95, 1.95], [1.95, 4.05], [4.05, 1.95], [4.05, 4.05]];
  const LSAFE = new Set(); for (let c = 0; c < 4; c++) { LSAFE.add(1 + 13 * c); LSAFE.add(9 + 13 * c); }
  const lIdx = (c, pos) => (1 + 13 * c + pos) % 52;
  const LCOLS_N = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };

  function ludoEngine(o) {
    const R = o.rnd || Math.random, n = o.n;
    const s = { n, cols: LCOLS_N[n].slice(), rules: Object.assign({}, LUDO_RULES, o.rules), pos: Array.from({ length: n }, () => [-1, -1, -1, -1]), turn: 0, phase: 'roll', die: 0, sixes: 0, legal: [], order: [], tid: 0, rolls: 0 };
    let ev = [];
    const E = e => ev.push(e);
    const eng = {
      s, take() { const e = ev; ev = []; return e; },
      view() { return clone(s); },
      start() { s.turn = 0; s.phase = 'roll'; s.tid++; E({ k: 'turn', p: 0, first: true }); },
      act(p, a) { return ludoAct(s, p, a, R, E); }
    };
    return eng;
  }
  function ludoBlock(s, idx, except) {
    const cnt = {};
    for (let q = 0; q < s.n; q++) {
      if (q === except) continue;
      for (const pos of s.pos[q]) if (pos >= 0 && pos <= 50 && lIdx(s.cols[q], pos) === idx) cnt[q] = (cnt[q] || 0) + 1;
    }
    return Object.values(cnt).some(v => v >= 2);
  }
  function ludoTarget(s, p, k, roll) {
    const pos = s.pos[p][k], r = s.rules, c = s.cols[p];
    if (pos === 56) return null;
    if (pos < 0) {
      const ok = r.leave === 'any' || (r.leave === '16' ? roll === 1 || roll === 6 : roll === 6);
      if (!ok) return null;
      if (r.blocks && ludoBlock(s, lIdx(c, 0), p)) return null;
      return 0;
    }
    let np = pos + roll;
    if (np > 56) { if (r.exact) return null; np = 56; }
    if (r.blocks) for (let q = pos + 1; q <= Math.min(np, 50); q++) if (ludoBlock(s, lIdx(c, q), p)) return null;
    return np;
  }
  function ludoLegal(s, p, roll) {
    const out = [], seen = new Set();
    for (let k = 0; k < 4; k++) {
      if (ludoTarget(s, p, k, roll) == null) continue;
      const key = s.pos[p][k];
      if (seen.has(key)) continue;
      seen.add(key); out.push(k);
    }
    return out;
  }
  function ludoMove(s, p, k, roll, E) {
    const from = s.pos[p][k], to = ludoTarget(s, p, k, roll), r = s.rules, c = s.cols[p];
    s.pos[p][k] = to;
    E({ k: 'move', p, pawn: k, from, to, roll });
    let capped = false;
    if (to >= 0 && to <= 50) {
      const idx = lIdx(c, to);
      if (!(r.safe && LSAFE.has(idx))) {
        for (let q = 0; q < s.n; q++) {
          if (q === p) continue;
          for (let j = 0; j < 4; j++) {
            const pj = s.pos[q][j];
            if (pj >= 0 && pj <= 50 && lIdx(s.cols[q], pj) === idx) { s.pos[q][j] = -1; E({ k: 'cap', p: q, pawn: j, by: p, from: pj, at: idx }); capped = true; }
          }
        }
      }
    }
    const home = to === 56;
    if (home) E({ k: 'home', p, pawn: k });
    return { capped, home };
  }
  function ludoNext(s, E, extra) {
    s.tid++;
    if (extra) { s.phase = 'roll'; E({ k: 'turn', p: s.turn, extra: true }); return; }
    s.sixes = 0;
    let q = s.turn;
    do { q = (q + 1) % s.n; } while (s.order.includes(q));
    s.turn = q; s.phase = 'roll'; E({ k: 'turn', p: q });
  }
  function ludoProg(s, p) { return s.pos[p].reduce((a, v) => a + (v < 0 ? 0 : v + 1), 0); }
  function ludoAct(s, p, a, R, E) {
    if (s.phase === 'over' || p !== s.turn || !a) return false;
    const r = s.rules;
    if (s.phase === 'roll') {
      if (a.t !== 'roll') return false;
      const v = 1 + rint(R, 6);
      s.die = v; s.rolls++;
      s.sixes = v === 6 ? s.sixes + 1 : 0;
      E({ k: 'roll', p, v });
      if (s.sixes >= 3 && r.tri) { E({ k: 'tri', p }); s.sixes = 0; ludoNext(s, E, false); return true; }
      const lg = ludoLegal(s, p, v);
      if (!lg.length) { E({ k: 'nomove', p, v }); ludoNext(s, E, v === 6); return true; }
      s.legal = lg; s.phase = 'move'; s.tid++;
      return true;
    }
    if (a.t !== 'move' || !s.legal.includes(a.k)) return false;
    const roll = s.die, res = ludoMove(s, p, a.k, roll, E);
    s.legal = [];
    if (s.pos[p].every(v => v === 56)) {
      s.order.push(p);
      const left = [...Array(s.n).keys()].filter(q => !s.order.includes(q));
      if (!r.full || left.length <= 1) {
        left.sort((x, y) => ludoProg(s, y) - ludoProg(s, x));
        s.order.push(...left);
        s.phase = 'over'; s.tid++;
        E({ k: 'end', order: s.order.slice() });
        return true;
      }
      E({ k: 'place', p, place: s.order.length });
      ludoNext(s, E, false);
      return true;
    }
    const extra = roll === 6 || (res.capped && r.capB) || (res.home && r.homeB);
    ludoNext(s, E, extra);
    return true;
  }
  function ludoNeed(s) {
    if (s.phase === 'over') return { p: -1 };
    if (s.phase === 'roll') return { p: s.turn, kind: 'roll', moves: [{ t: 'roll' }] };
    const moves = s.legal.map(k => ({ t: 'move', k }));
    return { p: s.turn, kind: 'move', moves, auto: !!s.rules.auto && moves.length === 1 };
  }
  function ludoRisk(s, p, idx) {
    if (LSAFE.has(idx) && s.rules.safe) return 0;
    const hit = new Set();
    for (let q = 0; q < s.n; q++) {
      if (q === p) continue;
      for (const pos of s.pos[q]) {
        if (pos < 0 || pos > 50) continue;
        const d = (idx - lIdx(s.cols[q], pos) + 52) % 52;
        if (d >= 1 && d <= 6 && pos + d <= 50) hit.add(d);
      }
    }
    return hit.size / 6;
  }
  function ludoEval(s, p) {
    let v = 0;
    for (const pos of s.pos[p]) {
      if (pos < 0) continue;
      v += pos + 1 + 6;
      if (pos === 56) { v += 24; continue; }
      if (pos > 50) continue;
      const idx = lIdx(s.cols[p], pos), rk = ludoRisk(s, p, idx);
      v -= rk * (pos + 14);
      if (s.rules.safe && LSAFE.has(idx)) v += 3;
      for (let q = 0; q < s.n; q++) {
        if (q === p) continue;
        for (const po of s.pos[q]) {
          if (po < 0 || po > 50) continue;
          const d = (lIdx(s.cols[q], po) - idx + 52) % 52;
          if (d >= 1 && d <= 6 && !(s.rules.safe && LSAFE.has(lIdx(s.cols[q], po)))) v += (po + 8) * .1;
        }
      }
    }
    let opp = 0;
    for (let q = 0; q < s.n; q++) if (q !== p) opp += ludoProg(s, q);
    return v - opp * .42 / Math.max(1, s.n - 1) * 1.0;
  }
  function ludoAi(s, nd, diff, R) {
    if (nd.kind === 'roll') return nd.moves[0];
    const p = nd.p, mv = nd.moves;
    if (mv.length === 1) return mv[0];
    if (diff === 'Easy') {
      const t = mv.map(m => { const c = clone(s), ev = []; ludoMove(c, p, m.k, s.die, e => ev.push(e)); return { m, cap: ev.some(e => e.k === 'cap'), home: ev.some(e => e.k === 'home') }; });
      const good = t.filter(x => x.cap || x.home);
      if (good.length && R() < .5) return good[rint(R, good.length)].m;
      return mv[rint(R, mv.length)];
    }
    let best = null, bs = -1e9;
    for (const m of mv) {
      const c = clone(s), ev = [];
      ludoMove(c, p, m.k, s.die, e => ev.push(e));
      let sc = ludoEval(c, p);
      const caps = ev.filter(e => e.k === 'cap');
      if (caps.length) sc += 10 + caps.reduce((a, e) => a + e.from, 0) * .5;
      if (ev.some(e => e.k === 'home')) sc += 8;
      if (s.pos[p][m.k] < 0) sc += diff === 'Hard' ? 6 : 10;
      if (diff === 'Normal') sc += R() * 4;
      else {
        const nb = ludoEval(c, p) - ludoEval(s, p);
        sc += nb * .2;
        if (s.die === 6 || caps.length) sc += 2;
      }
      if (sc > bs) { bs = sc; best = m; }
    }
    return best || mv[0];
  }

  function ludoRenderer(app) {
    const snd = app.snd, fx = makeFx(), R = Math.random;
    let W = 900, H = 600, PORT = false, DPR = 1, bs = 584, bx = 10, by = 8, cs = 38.9, rotK = 0, bg = null, T = 0;
    const D = { pos: [], dice: [], movers: [], sel: 0, turn: 0, last: [], n: 0, cols: [], later: [], tri: [], names: [], hot: 0, over: false, place: [] };
    const later = (ms, fn) => D.later.push({ at: T + ms / 1000, fn });
    const clamp01 = v => clamp(v, 0, 1);

    function rot(x, y) {
      for (let i = 0; i < rotK; i++) { const t = x; x = 15 - y; y = t; }
      return [x, y];
    }
    const P = (x, y) => { const r = rot(x, y); return [bx + r[0] * cs, by + r[1] * cs]; };
    const cellC = (r, c) => P(c + .5, r + .5);
    function ringXY(c, pos) { const [r, cc] = LR[lIdx(c, pos)]; return [cc + .5, r + .5]; }
    function posXY(p, k, pos) {
      const c = D.cols[p];
      if (pos < 0) { const b = LBASE[c], sp = LSPOT[k]; return [b[1] + sp[1], b[0] + sp[0]]; }
      if (pos <= 50) return ringXY(c, pos);
      if (pos <= 55) { const h = LHOME[c][pos - 51]; return [h[1] + .5, h[0] + .5]; }
      const cen = [[6.62, 7.5, 0, 1], [7.5, 6.62, 1, 0], [8.38, 7.5, 0, 1], [7.5, 8.38, 1, 0]][c];
      return [cen[0] + cen[2] * ((k - 1.5) * .26), cen[1] + cen[3] * ((k - 1.5) * .26)];
    }
    function dims(port) { return port ? [360, 590] : [900, 600]; }
    function layout() {
      if (PORT) { bs = 344; bx = 8; by = 110; } else { bs = 584; bx = 10; by = 8; }
      cs = bs / 15;
    }
    function cardRect(p) {
      const i = p, c = D.cols[p];
      if (!PORT) return { x: 620, y: 30 + i * 116, w: 272, h: 108 };
      const corner = (c + rotK) % 4;
      const top = corner < 2;
      return { x: corner === 0 || corner === 3 ? 8 : 182, y: top ? 46 : by + bs + 4, w: 170, h: 60 };
    }
    function dieSpot(p) {
      const r = cardRect(p);
      return PORT ? [r.x + r.w - 30, r.y + r.h / 2, 40] : [r.x + r.w - 46, r.y + r.h / 2 + 2, 56];
    }

    function star(c, x, y, r, fill) {
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
      c.closePath(); c.fillStyle = fill; c.fill();
    }
    function drawBoard() {
      const S = bs, pad = 6;
      bg = document.createElement('canvas'); bg.width = Math.round((S + pad * 2) * DPR); bg.height = Math.round((S + pad * 2) * DPR);
      const c = bg.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
      c.translate(pad, pad);
      c.save(); c.translate(S / 2, S / 2); c.rotate(rotK * Math.PI / 2); c.translate(-S / 2, -S / 2);
      c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 14; c.shadowOffsetY = 4;
      const fg = c.createLinearGradient(0, 0, S, S); fg.addColorStop(0, '#7a4a28'); fg.addColorStop(1, '#4b2a14');
      rr(c, -pad, -pad, S + pad * 2, S + pad * 2, 16); c.fillStyle = fg; c.fill(); c.shadowColor = 'transparent';
      rr(c, 0, 0, S, S, 10); c.fillStyle = '#fbf6e9'; c.fill();
      const U = S / 15;
      for (let k = 0; k < 4; k++) {
        const col = LUDO_COLS[k], b = LBASE[k], g = c.createLinearGradient(b[1] * U, b[0] * U, (b[1] + 6) * U, (b[0] + 6) * U);
        g.addColorStop(0, col.light); g.addColorStop(.35, col.main); g.addColorStop(1, col.dark);
        c.fillStyle = g;
        c.beginPath(); c.rect(b[1] * U, b[0] * U, 6 * U, 6 * U); c.fill();
        c.fillStyle = 'rgba(255,255,255,.96)'; rr(c, (b[1] + .9) * U, (b[0] + .9) * U, 4.2 * U, 4.2 * U, U * .7); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 2; c.stroke();
        for (const sp of LSPOT) {
          const x = (b[1] + sp[1]) * U, y = (b[0] + sp[0]) * U;
          const sg = c.createRadialGradient(x - U * .15, y - U * .15, U * .05, x, y, U * .62);
          sg.addColorStop(0, col.soft); sg.addColorStop(1, col.light);
          c.fillStyle = sg; c.beginPath(); c.arc(x, y, U * .6, 0, TAU); c.fill();
          c.strokeStyle = col.dark; c.globalAlpha = .55; c.lineWidth = 2; c.stroke(); c.globalAlpha = 1;
        }
      }
      c.strokeStyle = '#b9b3a2'; c.lineWidth = 1;
      const cell = (r, cc, fill) => { c.fillStyle = fill; c.fillRect(cc * U, r * U, U, U); c.strokeRect(cc * U, r * U, U, U); };
      for (const [r, cc] of LR) cell(r, cc, '#fffefa');
      for (let k = 0; k < 4; k++) {
        for (const [r, cc] of LHOME[k]) cell(r, cc, LUDO_COLS[k].main);
        const [r, cc] = LR[lIdx(k, 0)]; cell(r, cc, LUDO_COLS[k].main);
      }
      for (let i = 0; i < 52; i++) {
        const [r, cc] = LR[i];
        if (LSAFE.has(i) && i % 13 === 9) star(c, (cc + .5) * U, (r + .5) * U, U * .36, '#9aa0ad');
        else if (LSAFE.has(i)) star(c, (cc + .5) * U, (r + .5) * U, U * .34, 'rgba(255,255,255,.92)');
      }
      for (let k = 0; k < 4; k++) {
        const [r, cc] = LR[lIdx(k, 50)], h = LHOME[k][0];
        const dx = Math.sign(h[1] - cc), dy = Math.sign(h[0] - r), x = (cc + .5) * U, y = (r + .5) * U;
        c.save(); c.translate(x, y); c.rotate(Math.atan2(dy, dx));
        c.fillStyle = LUDO_COLS[k].main; c.beginPath(); c.moveTo(U * .3, 0); c.lineTo(-U * .22, -U * .3); c.lineTo(-U * .22, U * .3); c.closePath(); c.fill();
        c.restore();
      }
      const tri = [[[6, 6], [6, 9], [7.5, 7.5]], [[6, 6], [9, 6], [7.5, 7.5]], [[9, 6], [9, 9], [7.5, 7.5]], [[6, 9], [9, 9], [7.5, 7.5]]];
      const order = [0, 1, 2, 3];
      for (const k of order) {
        const t = tri[k], col = LUDO_COLS[k];
        const g = c.createLinearGradient(t[0][0] * U, t[0][1] * U, 7.5 * U, 7.5 * U);
        g.addColorStop(0, col.dark); g.addColorStop(1, col.main);
        c.beginPath(); c.moveTo(t[0][0] * U, t[0][1] * U); c.lineTo(t[1][0] * U, t[1][1] * U); c.lineTo(t[2][0] * U, t[2][1] * U); c.closePath();
        c.fillStyle = g; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      }
      c.beginPath(); c.arc(7.5 * U, 7.5 * U, U * .32, 0, TAU); c.fillStyle = '#fff'; c.fill();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.strokeRect(6 * U, 6 * U, 3 * U, 3 * U);
      c.restore();
    }

    function reset(V) {
      D.movers.length = 0; D.later.length = 0; fx.clear(); D.over = false; D.place = [];
      if (!V) { D.n = 4; D.cols = [0, 1, 2, 3]; D.pos = [0, 1, 2, 3].map(() => [-1, -1, -1, -1]); D.dice = [0, 1, 2, 3].map(() => makeDie(R)); D.last = [0, 0, 0, 0]; D.names = []; rotK = 0; if (bg) drawBoard(); return; }
      D.n = V.n; D.cols = V.cols.slice(); D.pos = V.pos.map(a => a.slice());
      D.dice = V.pos.map(() => makeDie(R)); D.last = V.pos.map(() => 0);
      D.dice.forEach(d => d.set(1));
      D.turn = V.turn; D.sel = 0;
      const vc = V.cols[Math.min(app.viewer, V.n - 1)] || 0;
      rotK = app.opt.rot ? (3 - vc + 4) % 4 : 0;
      if (bg) drawBoard();
    }
    function settle(V) {
      if (!V || D.movers.length) return;
      for (let p = 0; p < V.n; p++) for (let k = 0; k < 4; k++) D.pos[p][k] = V.pos[p][k];
      D.turn = V.turn;
    }
    function hopTo(p, k, from, to) {
      const pts = [];
      if (from < 0) { const a = posXY(p, k, -1), b = posXY(p, k, 0); pts.push({ x: a[0], y: a[1] }, { x: b[0], y: b[1] }); }
      else for (let q = from; q <= to; q++) { const a = posXY(p, k, q); pts.push({ x: a[0], y: a[1] }); }
      const steps = pts.length - 1, dur = from < 0 ? 330 : steps > 8 ? 105 : steps > 4 ? 135 : 165;
      const path = hopPath(pts, dur, from < 0 ? 1.2 : .62, from < 0 ? easeInOut : null);
      return { path, total: pathLen(path) };
    }
    function event(e) {
      if (e.k === 'turn') { D.turn = e.p; D.sel = 0; return 120; }
      if (e.k === 'roll') {
        D.turn = e.p; const d = D.dice[e.p]; d.roll(e.v, 900); D.last[e.p] = e.v;
        snd.rattle(); later(780, () => snd.land());
        if (e.v === 6) later(930, () => { snd.six(); const sp = dieSpot(e.p); fx.text(sp[0], sp[1] - 36, 'SIX!', '#ffe14a', 24); });
        return 960;
      }
      if (e.k === 'move') {
        const h = hopTo(e.p, e.pawn, e.from, e.to);
        D.movers.push({ p: e.p, k: e.pawn, path: h.path, t0: T, total: h.total, to: e.to, seg: -1 });
        return h.total + 70;
      }
      if (e.k === 'cap') {
        const a = posXY(e.p, e.pawn, e.from), b = posXY(e.p, e.pawn, -1), q = P(a[0], a[1]);
        fx.burst(q[0], q[1] - cs * .5, [LUDO_COLS[D.cols[e.by]].main, '#fff', '#ffe14a'], 18, 190); fx.ring(q[0], q[1] - 6, '#fff', cs * 1.2);
        snd.cap();
        const path = { segs: [{ fn: u => ({ x: lerp(a[0], b[0], easeInOut(u)), y: lerp(a[1], b[1], easeInOut(u)), z: Math.sin(u * Math.PI) * 3.2, sx: 1, sy: 1 }), dur: 620, x1: b[0], y1: b[1] }] };
        D.movers.push({ p: e.p, k: e.pawn, path, t0: T, total: 620, to: -1, seg: 0, spin: true });
        return 700;
      }
      if (e.k === 'home') {
        const a = posXY(e.p, e.pawn, 56), q = P(a[0], a[1]);
        later(10, () => { fx.burst(q[0], q[1], [LUDO_COLS[D.cols[e.p]].main, LUDO_COLS[D.cols[e.p]].light, '#fff', '#ffe14a'], 26, 220, 1); fx.ring(q[0], q[1], '#ffe14a', cs * 1.6); snd.home(); });
        return 520;
      }
      if (e.k === 'nomove') { const sp = dieSpot(e.p); fx.text(sp[0], sp[1] - 38, 'No move', '#fff', 17); snd.bad(); return 700; }
      if (e.k === 'tri') { const sp = dieSpot(e.p); fx.text(sp[0], sp[1] - 38, 'Three sixes!', '#ff8a7a', 18, 1.5); snd.bad(); return 1100; }
      if (e.k === 'place') { D.place[e.p] = e.place; snd.good(); return 400; }
      if (e.k === 'end') { D.over = true; e.order.forEach((p, i) => { D.place[p] = i + 1; }); return 300; }
      return 0;
    }

    function moverFor(p, k) { return D.movers.find(m => m.p === p && m.k === k); }
    function drawPawns(st) {
      const items = [], groups = {};
      for (let p = 0; p < D.n; p++) for (let k = 0; k < 4; k++) {
        const mv = moverFor(p, k);
        if (mv) continue;
        const pos = D.pos[p][k], xy = posXY(p, k, pos);
        if (pos >= 0 && pos < 56) { const key = xy[0].toFixed(2) + ',' + xy[1].toFixed(2); (groups[key] = groups[key] || []).push({ p, k, pos, xy }); }
        else items.push({ p, k, pos, xy, off: [0, 0], sc: pos === 56 ? .62 : .9, z: 0 });
      }
      for (const key in groups) {
        const g = groups[key], m = g.length;
        g.forEach((it, i) => {
          let off = [0, 0], sc = 1;
          if (m === 2) { off = [(i - .5) * .46, 0]; sc = .8; }
          else if (m === 3) { off = [[-.4, .12], [.4, .12], [0, -.28]][i]; sc = .72; }
          else if (m >= 4) { off = [[-.4, -.2], [.4, -.2], [-.4, .3], [.4, .3]][i % 4]; sc = .66; }
          items.push({ p: it.p, k: it.k, pos: it.pos, xy: it.xy, off, sc, z: 0 });
        });
      }
      for (const mv of D.movers) {
        const r = pathAt(mv.path, (T - mv.t0) * 1000);
        items.push({ p: mv.p, k: mv.k, pos: mv.to, xy: [r.x, r.y], off: [0, 0], sc: 1, z: r.z * cs, sx: r.sx, sy: r.sy, mv: true, spin: mv.spin ? (r.u || 0) * TAU * 1.5 : 0 });
      }
      const legal = st.myTurn && st.nd && st.nd.kind === 'move' ? st.nd.moves.map(m => m.k) : [];
      const legalPos = new Set(legal.map(k => D.pos[st.viewer][k]));
      const selK = legal.length ? legal[D.sel % legal.length] : -1;
      for (const it of items) it.ys = P(it.xy[0] + it.off[0], it.xy[1] + it.off[1])[1];
      items.sort((a, b) => (a.mv ? 1 : 0) - (b.mv ? 1 : 0) || a.ys - b.ys);
      for (const it of items) {
        const q = P(it.xy[0] + it.off[0], it.xy[1] + it.off[1]);
        const mine = it.p === st.viewer && !it.mv && legalPos.has(D.pos[it.p][it.k]) && st.myTurn;
        const isSel = mine && selK >= 0 && D.pos[it.p][it.k] === D.pos[st.viewer][selK];
        const r = cs * .4 * it.sc;
        drawPawn(ctx2, q[0], q[1] + cs * .1, r, LUDO_COLS[D.cols[it.p]].main, { lift: it.z || 0, sx: it.sx, sy: it.sy, glow: mine ? T : 0, glowCol: '#fff', rot: it.spin, noShadow: false });
        if (isSel) { ctx2.save(); ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 2.5; ctx2.setLineDash([5, 4]); ctx2.lineDashOffset = -T * 20; ctx2.beginPath(); ctx2.ellipse(q[0], q[1] + cs * .1, r * 1.35, r * .62, 0, 0, TAU); ctx2.stroke(); ctx2.restore(); }
        it.q = q; it.r = r; it.mine = mine;
      }
      D.items = items;
      if (legal.length) {
        for (const k of legal) {
          const pos = D.pos[st.viewer][k], roll = st.V.die;
          const tg = pos < 0 ? 0 : Math.min(56, pos + roll), xy = posXY(st.viewer, k, tg), q = P(xy[0], xy[1]);
          const pu = (Math.sin(T * 6) + 1) / 2;
          ctx2.save(); ctx2.globalAlpha = .55 + pu * .4; ctx2.strokeStyle = k === selK ? '#fff' : LUDO_COLS[D.cols[st.viewer]].light; ctx2.lineWidth = 3;
          ctx2.beginPath(); ctx2.arc(q[0], q[1], cs * (.32 + pu * .08), 0, TAU); ctx2.stroke(); ctx2.restore();
        }
      }
    }
    let ctx2 = null;
    function drawCards(st) {
      for (let p = 0; p < D.n; p++) {
        const r = cardRect(p), col = LUDO_COLS[D.cols[p]], active = st.scene === 'game' && st.V && st.V.phase !== 'over' && D.turn === p;
        const pu = active ? (Math.sin(T * 5) + 1) / 2 : 0;
        ctx2.save();
        ctx2.shadowColor = 'rgba(0,0,0,.4)'; ctx2.shadowBlur = 8; ctx2.shadowOffsetY = 2;
        const g = ctx2.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
        g.addColorStop(0, active ? col.main : '#2b3558'); g.addColorStop(1, active ? col.dark : '#1b2342');
        rr(ctx2, r.x, r.y, r.w, r.h, 16); ctx2.fillStyle = g; ctx2.fill(); ctx2.shadowColor = 'transparent';
        ctx2.lineWidth = active ? 3 + pu * 2 : 2; ctx2.strokeStyle = active ? '#fff' : rgba(col.main, .85); ctx2.stroke();
        const ar = PORT ? 18 : 28, ax = r.x + (PORT ? 26 : 40), ay = r.y + (PORT ? r.h / 2 : 40);
        drawAvatar(ctx2, ax, ay, ar, p * 3 + D.cols[p] * 7 + 1, col.main, '#fff');
        const nm = st.names[p] || ('Player ' + (p + 1)), lim = PORT ? 8 : 12;
        text(ctx2, nm.length > lim ? nm.slice(0, lim - 1) + '…' : nm, ax + ar + 10, PORT ? r.y + 20 : r.y + 28, PORT ? 13 : 19, '#fff', 'left', 'rgba(0,0,0,.35)');
        const home = D.pos[p].filter(v => v === 56).length;
        const dots = PORT ? [r.x + 52, r.y + 44] : [r.x + 14, r.y + 82];
        for (let k = 0; k < 4; k++) {
          const v = D.pos[p][k];
          ctx2.beginPath(); ctx2.arc(dots[0] + k * (PORT ? 15 : 22) + (PORT ? 0 : 0), dots[1], PORT ? 5 : 7, 0, TAU);
          ctx2.fillStyle = v === 56 ? '#ffe14a' : v < 0 ? 'rgba(255,255,255,.16)' : col.light; ctx2.fill();
          ctx2.strokeStyle = 'rgba(255,255,255,.55)'; ctx2.lineWidth = 1.5; ctx2.stroke();
        }
        if (!PORT) text(ctx2, `${home}/4 home`, r.x + 98, r.y + 82, 14, 'rgba(255,255,255,.88)', 'left');
        if (D.place[p]) text(ctx2, D.place[p] + (['st', 'nd', 'rd'][D.place[p] - 1] || 'th'), r.x + r.w - (PORT ? 30 : 54), r.y + 18, 14, '#ffe14a', 'center', 'rgba(0,0,0,.4)');
        ctx2.restore();
        const sp = dieSpot(p), d = D.dice[p];
        const hot = st.myTurn && p === st.viewer && st.nd && st.nd.kind === 'roll';
        d.draw(ctx2, sp[0], sp[1], sp[2] * (d.rolling ? 1.28 : 1), { glow: hot ? T : 0, glowCol: '#fff', alpha: active || D.last[p] ? 1 : .35 });
        if (hot) text(ctx2, 'ROLL', sp[0], sp[1] + sp[2] * .88 + Math.sin(T * 8) * 1.5, PORT ? 10 : 13, '#fff', 'center', 'rgba(0,0,0,.5)');
        if (st.dl && p === D.turn) {
          const f = clamp01(st.dl / ((st.V.rules.timer || 1) * 1000));
          ctx2.strokeStyle = f < .25 ? '#ff5b4b' : '#fff'; ctx2.lineWidth = 4; ctx2.beginPath(); ctx2.arc(ax, ay, ar + 5, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx2.stroke();
        }
      }
    }
    function drawStatus(st) {
      const V = st.V; if (!V) return;
      const bar = PORT ? { x: 8, y: 526, w: 344, h: 58 } : { x: 620, y: 502, w: 272, h: 90 };
      ctx2.save();
      rr(ctx2, bar.x, bar.y, bar.w, bar.h, 14); ctx2.fillStyle = 'rgba(8,12,30,.55)'; ctx2.fill();
      let a = '', b = '';
      if (V.phase === 'over') { a = 'Game over'; }
      else if (st.nd && st.nd.p === st.viewer) {
        a = st.nd.kind === 'roll' ? (V.sixes ? 'Roll again!' : 'Your turn') : 'Pick a pawn';
        b = st.nd.kind === 'roll' ? 'Tap the dice or press Space' : 'Tap a glowing pawn · Tab · Enter';
      } else {
        const who = i => i === st.viewer ? 'You' : (st.names[i] || 'Player'), you = D.turn === st.viewer, rolling = D.dice[D.turn] && D.dice[D.turn].rolling;
        a = st.idle ? `${who(V.turn)} ${V.turn === st.viewer ? 'are' : 'is'} playing` : who(D.turn) + (rolling ? (you ? ' roll…' : ' rolls…') : '');
        b = st.online && st.nd && st.nd.p >= 0 && !st.cpu[st.nd.p] ? 'Waiting for their move' : '';
      }
      const c = LUDO_COLS[D.cols[D.turn]] || LUDO_COLS[0];
      ctx2.beginPath(); ctx2.arc(bar.x + 20, bar.y + bar.h / 2, 8, 0, TAU); ctx2.fillStyle = c.main; ctx2.fill(); ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 2; ctx2.stroke();
      text(ctx2, a, bar.x + 38, bar.y + (b ? bar.h * .36 : bar.h / 2), PORT ? 16 : 20, '#fff', 'left');
      if (b) text(ctx2, b, bar.x + 38, bar.y + bar.h * .72, PORT ? 11 : 13, 'rgba(255,255,255,.7)', 'left', null, 700);
      ctx2.restore();
    }
    function drawBack() {
      const g = ctx2.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#26306a'); g.addColorStop(.5, '#1b2352'); g.addColorStop(1, '#2b1f55');
      ctx2.fillStyle = g; ctx2.fillRect(0, 0, W, H);
      ctx2.globalAlpha = .06; ctx2.fillStyle = '#fff';
      for (let i = 0; i < 34; i++) { const x = (i * 97.3) % W, y = (i * 61.7) % H; ctx2.beginPath(); ctx2.arc(x, y, 14 + (i % 5) * 5, 0, TAU); ctx2.fill(); }
      ctx2.globalAlpha = 1;
    }
    function draw(ctx, t, dt, st) {
      ctx2 = ctx; T += dt;
      for (let i = D.later.length - 1; i >= 0; i--) if (T >= D.later[i].at) { const f = D.later[i].fn; D.later.splice(i, 1); f(); }
      D.dice.forEach(d => d.update(dt));
      for (let i = D.movers.length - 1; i >= 0; i--) {
        const m = D.movers[i], ms = (T - m.t0) * 1000, r = pathAt(m.path, ms);
        if (!m.spin && r.i !== m.seg) { m.seg = r.i; if (r.i > 0 || ms > 0) snd.hop(); }
        if (ms >= m.total) {
          D.pos[m.p][m.k] = m.to; D.movers.splice(i, 1);
          if (!m.spin && m.to >= 0 && m.to <= 50) snd.land();
        }
      }
      drawBack();
      if (!bg) drawBoard();
      ctx.drawImage(bg, bx - 6, by - 6, bs + 12, bs + 12);
      if (st.scene !== 'game') {
        for (let p = 0; p < 4; p++) for (let k = 0; k < 4; k++) { const xy = posXY(p, k, -1), q = P(xy[0], xy[1]); drawPawn(ctx, q[0], q[1] + cs * .1, cs * .4, LUDO_COLS[p].main); }
        fx.draw(ctx, dt);
        return;
      }
      drawPawns(st);
      fx.draw(ctx, dt);
      drawCards(st);
      drawStatus(st);
    }
    return {
      dims,
      resize(w, h, port, dpr) { W = w; H = h; PORT = port; DPR = dpr; layout(); drawBoard(); },
      reset, settle, event, draw,
      win() { fx.confetti(W, ['#e5322d', '#1fa646', '#f6bf10', '#1f6fe0', '#fff'], 120); },
      cursor(x, y) { return hit(x, y) != null; },
      pt(m) { if (m.t === 'roll') { const sp = dieSpot(app.viewer); return [sp[0], sp[1]]; } const it = (D.items || []).find(i => i.p === app.viewer && i.k === m.k && !i.mv); return it && it.q ? [it.q[0], it.q[1] - it.r * 1.1] : null; },
      pointer(x, y, type) {
        if (type !== 'down') return false;
        const h = hit(x, y);
        if (!h) return false;
        return app.act(h);
      },
      key(code) {
        const V = app.view(), nd = V && V.phase !== 'over' ? G_LUDO.need(V) : null;
        if (!nd || nd.p !== app.viewer || !app.idleNow()) return false;
        if (nd.kind === 'roll') { if (code === 'Space' || code === 'Enter') return app.act({ t: 'roll' }); return false; }
        if (nd.auto) return false;
        const m = nd.moves;
        if (code === 'Space' || code === 'Enter') return app.act(m[D.sel % m.length]);
        if (code === 'Tab' || code === 'ArrowRight' || code === 'ArrowDown') { D.sel = (D.sel + 1) % m.length; snd.tick(); return true; }
        if (code === 'ArrowLeft' || code === 'ArrowUp') { D.sel = (D.sel + m.length - 1) % m.length; snd.tick(); return true; }
        if (/^Digit[1-4]$/.test(code)) { const k = +code.slice(5) - 1; const mm = m.find(x => x.k === k); if (mm) return app.act(mm); const same = m.find(x => V.pos[nd.p][x.k] === V.pos[nd.p][k]); if (same) return app.act(same); }
        return false;
      },
    };
    function hit(x, y) {
      const V = app.view();
      if (!V || V.phase === 'over') return null;
      const nd = G_LUDO.need(V);
      if (!nd || nd.p !== app.viewer || !app.idleNow()) return null;
      if (nd.kind === 'roll') {
        const r = cardRect(app.viewer);
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return nd.moves[0];
        const sp = dieSpot(app.viewer);
        if (Math.hypot(x - sp[0], y - sp[1]) < sp[2]) return nd.moves[0];
        return null;
      }
      if (nd.auto) return null;
      let best = null, bd = 1e9;
      for (const it of D.items || []) {
        if (!it.mine || !it.q) continue;
        const d = Math.hypot(x - it.q[0], y - (it.q[1] - it.r * 1.1));
        if (d < it.r * 1.9 && d < bd) { bd = d; best = it; }
      }
      if (!best) return null;
      const pos = V.pos[nd.p][best.k];
      return nd.moves.find(m => V.pos[nd.p][m.k] === pos) || null;
    }
  }

  const LUDO_HELP = `<p><b>Goal:</b> bring all four of your pawns around the board and into the centre home triangle before anyone else.</p>
<p><b>Rolling:</b> roll the dice on your turn. You need a <b>6</b> (or the rule you picked) to bring a pawn out of your base onto your coloured start square. A 6 also gives you another roll. Three sixes in a row cancel your turn.</p>
<p><b>Moving:</b> pawns travel clockwise round the outer track, then turn up your coloured home column. Choose which pawn moves by the number rolled. If you cannot move, the turn passes.</p>
<p><b>Capturing:</b> land exactly on an opponent's pawn to send it back to its base, and roll again. Pawns on a <b>star</b> or on any coloured start square are safe.</p>
<p><b>Home:</b> you need the exact number to land on the final home triangle (changeable in the rules). Reaching home gives another roll.</p>
<p><b>Keys:</b> <kbd>Space</kbd> roll or move, <kbd>Tab</kbd> or arrows choose a pawn, <kbd>1</kbd>-<kbd>4</kbd> pick a pawn.</p>`;
  const G_LUDO = {
    id: 'ludo', title: 'Ludo', tag: 'The classic race home. Roll a 6, capture, and get all four pawns to the centre.',
    minN: 2, maxN: 4, defN: 4, sizes: [2, 3, 4], diffs: ['Easy', 'Normal', 'Hard'], rotates: true,
    colors: LUDO_COLS, rulesDef: LUDO_RULES, help: LUDO_HELP,
    optSchema: [
      { k: 'leave', label: 'Leave base on', hint: 'Roll needed for a pawn to come out', vals: [['6', '6'], ['16', '1 or 6'], ['any', 'Any']] },
      { k: 'tri', label: 'Three sixes', hint: 'Third six in a row loses the turn', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'capB', label: 'Roll after capture', hint: '', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'homeB', label: 'Roll after home', hint: '', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'exact', label: 'Exact roll to finish', hint: 'Overshooting home is not allowed', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'safe', label: 'Safe stars', hint: 'Stars and start squares', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'blocks', label: 'Blocks', hint: 'Two same-colour pawns block the way', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'full', label: 'Play for places', hint: 'Keep playing after the first winner', vals: [[false, 'First'], [true, 'All']] },
      { k: 'auto', label: 'Auto-move', hint: 'Skip the choice when only one move', vals: [[false, 'Off'], [true, 'On']] }
    ],
    Engine: ludoEngine, need: ludoNeed, ai: ludoAi,
    auto: (s, nd, R) => nd.kind === 'roll' ? nd.moves[0] : ludoAi(s, nd, 'Normal', R),
    think: nd => nd.kind === 'roll' ? [350, 600] : [450, 800],
    endStat: (V, p) => V.pos[p].filter(v => v === 56).length + '/4 home',
    renderer: ludoRenderer
  };

  const mkCol = (name, main) => ({ name, main, dark: shade(main, -.45), light: shade(main, .45), soft: shade(main, .78) });
  const SNL_COLS = [mkCol('Red', '#e5322d'), mkCol('Blue', '#2a74e6'), mkCol('Green', '#25a64a'), mkCol('Yellow', '#f2b705'), mkCol('Purple', '#8e44ad'), mkCol('Orange', '#f0802a')];
  const SNL_RULES = { finish: 'exact', bonus: true, dice: 1, board: 'classic', timer: 0 };
  const SNL_BOARDS = {
    classic: { l: [[1, 38], [4, 14], [9, 31], [21, 42], [28, 84], [36, 44], [51, 67], [71, 91], [80, 100]], s: [[16, 6], [47, 26], [49, 11], [56, 53], [62, 19], [64, 60], [87, 24], [93, 73], [95, 75], [98, 78]] },
    easy: { l: [[1, 38], [4, 14], [9, 31], [17, 59], [21, 42], [28, 84], [36, 44], [40, 72], [51, 67], [71, 91], [80, 100]], s: [[47, 26], [62, 19], [87, 24], [95, 75], [98, 78]] },
    hard: { l: [[4, 14], [9, 31], [28, 84], [51, 67], [71, 91]], s: [[16, 6], [34, 12], [47, 26], [49, 11], [56, 53], [62, 19], [64, 60], [68, 45], [76, 41], [87, 24], [93, 73], [95, 75], [98, 78], [99, 5]] }
  };
  function snlRandomBoard(R) {
    const used = new Set([1, 100]), l = [], s = [];
    const pick = (lo, hi) => { for (let i = 0; i < 200; i++) { const v = lo + rint(R, hi - lo + 1); if (!used.has(v)) return v; } return -1; };
    const nl = 8 + rint(R, 3), ns = 8 + rint(R, 4);
    for (let i = 0; i < nl; i++) {
      const a = pick(2, 80); if (a < 0) continue;
      let b = -1;
      for (let t = 0; t < 40 && b < 0; t++) { const v = Math.min(99, a + 10 + rint(R, 50)); if (!used.has(v) && Math.floor((v - 1) / 10) > Math.floor((a - 1) / 10)) b = v; }
      if (b < 0) continue;
      used.add(a); used.add(b); l.push([a, b]);
    }
    for (let i = 0; i < ns; i++) {
      const a = pick(12, 99); if (a < 0) continue;
      let b = -1;
      for (let t = 0; t < 40 && b < 0; t++) { const v = Math.max(2, a - 10 - rint(R, 50)); if (!used.has(v) && Math.floor((v - 1) / 10) < Math.floor((a - 1) / 10)) b = v; }
      if (b < 0) continue;
      used.add(a); used.add(b); s.push([a, b]);
    }
    const top = rint(R, 2) ? pick(60, 90) : -1; if (top > 0) l.push([top, 100]);
    return { l: l.filter((x, i) => l.findIndex(y => y[0] === x[0]) === i && !s.some(z => z[0] === x[0] || z[1] === x[0] || z[0] === x[1])), s };
  }
  function snlEngine(o) {
    const R = o.rnd || Math.random, n = o.n, rules = Object.assign({}, SNL_RULES, o.rules);
    const bd = rules.board === 'random' ? snlRandomBoard(R) : SNL_BOARDS[rules.board] || SNL_BOARDS.classic;
    const s = { n, cols: [...Array(n).keys()], rules, ladders: bd.l.map(x => x.slice()), snakes: bd.s.map(x => x.slice()), pos: Array(n).fill(0), turn: 0, phase: 'roll', last: [0, 0], order: [], tid: 0, rolls: 0, streak: 0 };
    let ev = [];
    const E = e => ev.push(e);
    return {
      s, take() { const e = ev; ev = []; return e; },
      view() { return clone(s); },
      start() { s.tid++; E({ k: 'turn', p: 0, first: true }); },
      act(p, a) { return snlAct(s, p, a, R, E); }
    };
  }
  function snlJump(s, sq) {
    const l = s.ladders.find(x => x[0] === sq);
    if (l) return { k: 'climb', to: l[1] };
    const sn = s.snakes.find(x => x[0] === sq);
    if (sn) return { k: 'slide', to: sn[1] };
    return null;
  }
  function snlAct(s, p, a, R, E) {
    if (s.phase !== 'roll' || p !== s.turn || !a || a.t !== 'roll') return false;
    const r = s.rules, vals = [1 + rint(R, 6)];
    if (r.dice === 2) vals.push(1 + rint(R, 6));
    const tot = vals[0] + (vals[1] || 0), from = s.pos[p];
    s.last = vals.length === 2 ? vals : [vals[0], 0]; s.rolls++;
    E({ k: 'roll', p, v: vals });
    const bonus = r.bonus && (vals.length === 2 ? vals[0] === vals[1] : vals[0] === 6);
    s.streak = bonus ? s.streak + 1 : 0;
    let dest = from + tot, bounce = false;
    if (dest > 100) {
      if (r.finish === 'exact') dest = from;
      else if (r.finish === 'bounce') { dest = 200 - dest; bounce = true; }
      else dest = 100;
    }
    if (dest === from) E({ k: 'nomove', p, v: tot });
    else { s.pos[p] = dest; E({ k: 'move', p, from, to: dest, bounce }); }
    let guard = 0;
    for (;;) {
      const j = dest === from && guard === 0 ? null : snlJump(s, s.pos[p]);
      if (!j || guard++ > 4) break;
      const f = s.pos[p]; s.pos[p] = j.to; E({ k: j.k, p, from: f, to: j.to });
    }
    s.tid++;
    if (s.pos[p] === 100) {
      s.order.push(p);
      const rest = [...Array(s.n).keys()].filter(q => q !== p).sort((x, y) => s.pos[y] - s.pos[x]);
      s.order.push(...rest); s.phase = 'over';
      E({ k: 'end', order: s.order.slice() });
      return true;
    }
    if (bonus && s.streak < 3) { E({ k: 'bonus', p }); E({ k: 'turn', p, extra: true }); }
    else { if (bonus) E({ k: 'tri', p }); s.streak = 0; s.turn = (p + 1) % s.n; E({ k: 'turn', p: s.turn }); }
    return true;
  }
  function snlNeed(s) {
    if (s.phase === 'over') return { p: -1 };
    return { p: s.turn, kind: 'roll', moves: [{ t: 'roll' }] };
  }
  const snlSq = n => { const r0 = Math.floor((n - 1) / 10); let c = (n - 1) % 10; if (r0 % 2) c = 9 - c; return { c, r: 9 - r0 }; };
  const SNAKE_COLS = ['#2e9d3a', '#d6451f', '#7b3fa0', '#e0a010', '#1f8aa8', '#b02e6e', '#5b8c1f', '#c0392b', '#3d4fa8', '#8a5a2b', '#2a9d8f', '#a03030', '#6a994e', '#c44569'];

  function snlRenderer(app) {
    const snd = app.snd, fx = makeFx(), RN = Math.random;
    let W = 900, H = 600, PORT = false, DPR = 1, bs = 560, bx = 44, by = 20, cs = 56, bg = null, T = 0, ctx2 = null;
    const D = { pos: [], cols: [], n: 0, dice: [makeDie(RN), makeDie(RN)], movers: [], later: [], snk: [], lad: [], turn: 0, nd: 2, names: [], last: [0, 0], rolling: false };
    const later = (ms, fn) => D.later.push({ at: T + ms / 1000, fn });
    const SLOT = [[-.27, -.12], [0, -.12], [.27, -.12], [-.27, .2], [0, .2], [.27, .2]];

    function dims(port) { return port ? [360, 600] : [900, 600]; }
    function layout() {
      if (PORT) { bs = 312; bx = 36; by = 50; } else { bs = 560; bx = 54; by = 20; }
      cs = bs / 10;
    }
    const sqXY = n => { const q = snlSq(n); return [bx + (q.c + .5) * cs, by + (q.r + .5) * cs]; };
    const startXY = slot => [bx / 2, by + bs - cs * .5 - slot * cs * .34 + cs * .15];
    function posXY(p, pos, moving) {
      if (pos <= 0) return startXY(p);
      const c = sqXY(pos), sl = SLOT[p % 6];
      const alone = !moving && D.pos.filter(v => v === pos).length === 1;
      return alone ? [c[0], c[1] + cs * .12] : [c[0] + sl[0] * cs, c[1] + sl[1] * cs + cs * .1];
    }
    function snakeLine(a, b, seed) {
      const N = 46, pts = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const waves = Math.max(2, Math.round(L / (cs * 1.7))), A = Math.min(cs * .85, L * .17), ph = (seed % 3) * .9;
      for (let i = 0; i <= N; i++) {
        const t = i / N, env = Math.pow(Math.sin(Math.PI * t), .55), o = Math.sin(t * waves * Math.PI + ph) * A * env * (seed % 2 ? 1 : -1);
        pts.push([a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]);
      }
      return pts;
    }
    function drawLadder(c, l) {
      const a = sqXY(l[0]), b = sqXY(l[1]), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, hw = cs * .17;
      c.save(); c.lineCap = 'round';
      const rail = (sx, o) => { c.beginPath(); c.moveTo(a[0] + nx * hw * sx + o, a[1] + ny * hw * sx + o); c.lineTo(b[0] + nx * hw * sx + o, b[1] + ny * hw * sx + o); c.stroke(); };
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = cs * .1; rail(1, 3); rail(-1, 3);
      const rungs = Math.max(3, Math.floor(L / (cs * .4)));
      c.lineWidth = cs * .075; c.strokeStyle = '#7a4a1e';
      for (let i = 1; i < rungs; i++) { const t = i / rungs; c.beginPath(); c.moveTo(a[0] + dx * t - nx * hw, a[1] + dy * t - ny * hw); c.lineTo(a[0] + dx * t + nx * hw, a[1] + dy * t + ny * hw); c.stroke(); }
      c.lineWidth = cs * .1; c.strokeStyle = '#8b5a2b'; rail(1, 0); rail(-1, 0);
      c.lineWidth = cs * .035; c.strokeStyle = '#d6a064'; rail(1, -cs * .018); rail(-1, -cs * .018);
      c.lineWidth = cs * .045; c.strokeStyle = '#c4894a';
      for (let i = 1; i < rungs; i++) { const t = i / rungs; c.beginPath(); c.moveTo(a[0] + dx * t - nx * hw, a[1] + dy * t - ny * hw - 1); c.lineTo(a[0] + dx * t + nx * hw, a[1] + dy * t + ny * hw - 1); c.stroke(); }
      c.restore();
    }
    function drawSnake(c, sn, idx) {
      const pts = sn.pts, col = SNAKE_COLS[idx % SNAKE_COLS.length], N = pts.length - 1;
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      const wAt = t => cs * (.3 * (1 - Math.pow(t, 1.3) * .82) + (t < .12 ? .06 * (1 - t / .12) : 0));
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < N; i++) {
          const t = i / N, w = wAt(t);
          c.beginPath(); c.moveTo(pts[i][0] + (pass === 0 ? 2.5 : 0), pts[i][1] + (pass === 0 ? 3 : 0)); c.lineTo(pts[i + 1][0] + (pass === 0 ? 2.5 : 0), pts[i + 1][1] + (pass === 0 ? 3 : 0));
          if (pass === 0) { c.strokeStyle = 'rgba(0,0,0,.26)'; c.lineWidth = w + 3; }
          else if (pass === 1) { c.strokeStyle = shade(col, -.55); c.lineWidth = w + 3; }
          else { c.strokeStyle = (Math.floor(i / 3) % 2) ? col : shade(col, .22); c.lineWidth = w; }
          c.stroke();
        }
      }
      c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = cs * .05;
      c.beginPath(); for (let i = 0; i <= N; i++) { const t = i / N; if (i === 0) c.moveTo(pts[i][0] - 2, pts[i][1] - 3); else c.lineTo(pts[i][0] - 2 * (1 - t), pts[i][1] - 3 * (1 - t)); } c.stroke();
      c.fillStyle = shade(col, -.35);
      for (let i = 3; i < N - 3; i += 6) { const w = wAt(i / N) * .34; c.beginPath(); c.arc(pts[i][0], pts[i][1], w, 0, TAU); c.fill(); }
      const h = pts[0], h2 = pts[3], ang = Math.atan2(h[1] - h2[1], h[0] - h2[0]), hr = cs * .27;
      c.translate(h[0], h[1]); c.rotate(ang);
      c.strokeStyle = '#d6203a'; c.lineWidth = cs * .03; c.beginPath(); c.moveTo(hr * .95, 0); c.lineTo(hr * 1.6, 0); c.moveTo(hr * 1.6, 0); c.lineTo(hr * 1.9, -hr * .3); c.moveTo(hr * 1.6, 0); c.lineTo(hr * 1.9, hr * .3); c.stroke();
      const hg = c.createRadialGradient(-hr * .2, -hr * .3, hr * .1, 0, 0, hr * 1.3);
      hg.addColorStop(0, shade(col, .3)); hg.addColorStop(1, shade(col, -.2));
      c.fillStyle = hg; c.strokeStyle = shade(col, -.6); c.lineWidth = 2.5;
      c.beginPath(); c.ellipse(0, 0, hr * 1.05, hr * .82, 0, 0, TAU); c.fill(); c.stroke();
      for (const sy of [-1, 1]) {
        c.fillStyle = '#fff'; c.beginPath(); c.arc(hr * .32, sy * hr * .42, hr * .26, 0, TAU); c.fill(); c.strokeStyle = shade(col, -.6); c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#10131c'; c.beginPath(); c.ellipse(hr * .4, sy * hr * .42, hr * .13, hr * .17, 0, 0, TAU); c.fill();
      }
      c.fillStyle = shade(col, -.55); c.beginPath(); c.arc(hr * .85, -hr * .18, hr * .06, 0, TAU); c.arc(hr * .85, hr * .18, hr * .06, 0, TAU); c.fill();
      c.restore();
    }
    function drawBoard() {
      layoutSnakes();
      bg = document.createElement('canvas'); bg.width = Math.round(W * DPR); bg.height = Math.round(H * DPR);
      const c = bg.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
      const g0 = c.createLinearGradient(0, 0, W, H); g0.addColorStop(0, '#2c3d63'); g0.addColorStop(1, '#1b2442');
      c.fillStyle = g0; c.fillRect(0, 0, W, H);
      c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 14; c.shadowOffsetY = 4;
      const fg = c.createLinearGradient(bx, by, bx + bs, by + bs); fg.addColorStop(0, '#7a4a28'); fg.addColorStop(1, '#4b2a14');
      rr(c, bx - 8, by - 8, bs + 16, bs + 16, 14); c.fillStyle = fg; c.fill(); c.shadowColor = 'transparent';
      const PAL = ['#ffd9a8', '#c9ecc0', '#ffc2c2', '#bfe0ff', '#fff0a8'];
      for (let n = 1; n <= 100; n++) {
        const q = snlSq(n), x = bx + q.c * cs, y = by + q.r * cs;
        const gg = c.createLinearGradient(x, y, x + cs, y + cs);
        const base = PAL[(q.c + q.r * 2 + (q.r % 2 ? 1 : 0)) % 5];
        gg.addColorStop(0, shade(base, .25)); gg.addColorStop(1, base);
        c.fillStyle = gg; c.fillRect(x, y, cs, cs);
        c.strokeStyle = 'rgba(70,45,20,.35)'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, cs - 1, cs - 1);
        text(c, String(n), x + cs * .08, y + cs * .17, cs * .27, 'rgba(60,40,25,.78)', 'left', null, 800);
      }
      const hs = sqXY(100);
      c.fillStyle = 'rgba(255,215,0,.35)'; c.fillRect(hs[0] - cs / 2, hs[1] - cs / 2, cs, cs);
      star5(c, hs[0], hs[1] + cs * .05, cs * .3, '#f6b800');
      text(c, 'HOME', hs[0], hs[1] + cs * .34, cs * .17, '#7a4a00', 'center', null, 900);
      const s1 = sqXY(1); text(c, 'START', s1[0], s1[1] + cs * .34, cs * .16, '#7a4a00', 'center', null, 900);
      D.lad.forEach(l => drawLadder(c, l));
      D.snk.forEach((sn, i) => drawSnake(c, sn, i));
      c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, 4, by + bs - cs * 2.1, bx - 8, cs * 2.1, 8); c.fill();
      text(c, 'START', bx / 2, by + bs - cs * 2.35, PORT ? 7 : 10, 'rgba(255,255,255,.7)', 'center', null, 900);
    }
    function star5(c, x, y, r, fill) {
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
      c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5; c.stroke();
    }
    function layoutSnakes() {
      const V = D.V;
      D.snk = []; D.lad = [];
      if (!V) return;
      D.lad = V.ladders.map(l => l.slice());
      D.snk = V.snakes.map((sn, i) => ({ from: sn[0], to: sn[1], pts: snakeLine(sqXY(sn[0]), sqXY(sn[1]), sn[0] + i) }));
    }

    function cardRect(i, n) {
      if (!PORT) return { x: 624, y: 32 + i * 60, w: 268, h: 54 };
      const col = i % 2, row = Math.floor(i / 2);
      return { x: 8 + col * 176, y: 470 + row * 36, w: 168, h: 31 };
    }
    const dieBox = () => PORT ? { x: 8, y: 374, w: 344, h: 88 } : { x: 624, y: 396, w: 268, h: 124 };
    const btnBox = () => PORT ? { x: 140, y: 390, w: 202, h: 56 } : { x: 640, y: 526, w: 236, h: 56 };
    function diePos(i) {
      const b = dieBox();
      if (PORT) return [b.x + 44 + i * 58, b.y + b.h / 2 + 4, 56];
      return D.nd === 1 ? [b.x + b.w / 2, b.y + b.h / 2 + 4, 92] : [b.x + b.w / 2 - 54 + i * 108, b.y + b.h / 2 + 4, 82];
    }

    function reset(V) {
      D.movers.length = 0; D.later.length = 0; fx.clear(); D.V = V;
      if (!V) { D.n = 0; D.pos = []; D.cols = []; D.nd = 1; D.dice.forEach(d => d.set(1)); D.V = clone({ ladders: SNL_BOARDS.classic.l, snakes: SNL_BOARDS.classic.s }); layoutSnakes(); if (bg) drawBoard(); D.V = null; return; }
      D.n = V.n; D.cols = V.cols.slice(); D.pos = V.pos.slice(); D.turn = V.turn; D.nd = V.rules.dice;
      D.dice.forEach((d, i) => d.set(V.last[i] || 1));
      if (bg) drawBoard(); else layoutSnakes();
    }
    function settle(V) {
      if (!V || D.movers.length) return;
      for (let p = 0; p < V.n; p++) D.pos[p] = V.pos[p];
      D.turn = V.turn;
    }
    function walk(p, from, to, bounce) {
      const sq = [];
      if (bounce) { for (let q = from + 1; q <= 100; q++) sq.push(q); for (let q = 99; q >= to; q--) sq.push(q); }
      else for (let q = from + 1; q <= to; q++) sq.push(q);
      const pts = [], a = posXY(p, from, true); pts.push({ x: a[0], y: a[1] });
      sq.forEach(q => { const c = sqXY(q), sl = SLOT[p % 6]; pts.push({ x: c[0] + (D.n > 1 ? sl[0] * cs * .5 : 0), y: c[1] + cs * .1 + (D.n > 1 ? sl[1] * cs * .4 : 0) }); });
      return hopPath(pts, sq.length > 8 ? 110 : 150, .55);
    }
    function addMover(p, path, to, extra) {
      const total = pathLen(path);
      D.movers.push(Object.assign({ p, path, t0: T, total, to, seg: -1 }, extra || {}));
      return total;
    }
    function polyFn(pts, from, to, extra) {
      const seg = [];
      let L = 0; for (let i = 1; i < pts.length; i++) { seg.push(L); L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); }
      return u => {
        const d = u * L; let i = 1; while (i < seg.length && seg[i] < d) i++;
        i = Math.min(i, pts.length - 1);
        const s0 = seg[i - 1], l = (i < seg.length ? seg[i] : L) - s0 || 1, f = clamp((d - s0) / l, 0, 1);
        const x = lerp(pts[i - 1][0], pts[i][0], f), y = lerp(pts[i - 1][1], pts[i][1], f);
        return extra ? extra(u, x, y) : { x, y, z: 0, sx: 1, sy: 1 };
      };
    }
    function event(e) {
      if (e.k === 'turn') { D.turn = e.p; return 100; }
      if (e.k === 'roll') {
        D.nd = e.v.length; D.turn = e.p;
        e.v.forEach((v, i) => D.dice[i].roll(v, 950 + i * 90));
        D.last = e.v.slice();
        snd.rattle(); later(820, () => snd.land());
        D.rolling = true; later(1000, () => { D.rolling = false; });
        const tot = e.v.reduce((a, b) => a + b, 0);
        later(1020, () => { const b = dieBox(); fx.text(b.x + b.w / 2, b.y + 6, '+' + tot, '#fff', 24); });
        return 1060;
      }
      if (e.k === 'move') { const path = walk(e.p, e.from, e.to, e.bounce); return addMover(e.p, path, e.to) + 90; }
      if (e.k === 'climb' || e.k === 'slide') {
        const a = sqXY(e.from), b = sqXY(e.to);
        let fn, dur;
        if (e.k === 'climb') {
          const L = Math.hypot(b[0] - a[0], b[1] - a[1]); dur = clamp(L * 3.4, 800, 1700);
          fn = polyFn([a, b], e.from, e.to, (u, x, y) => ({ x, y: y + cs * .1, z: Math.abs(Math.sin(u * L / (cs * .4) * Math.PI)) * cs * .12, sx: 1, sy: 1 }));
          snd.climb();
        } else {
          const sn = D.snk.find(s => s.from === e.from) || { pts: [a, b] }; dur = clamp(sn.pts.length * 34, 1100, 1900);
          fn = polyFn(sn.pts, e.from, e.to, (u, x, y) => ({ x, y: y + cs * .05, z: 0, sx: 1 + Math.sin(u * 50) * .1, sy: 1 - Math.sin(u * 50) * .1 }));
          snd.hiss();
          fx.burst(a[0], a[1], ['#8bd36b', '#fff'], 8, 90, .5);
        }
        const path = { segs: [{ fn, dur, x1: b[0], y1: b[1] }] };
        const t = addMover(e.p, path, e.to, { kind: e.k });
        later(t - 40, () => { fx.ring(b[0], b[1], e.k === 'climb' ? '#7ee08f' : '#ff7a6a', cs); if (e.k === 'slide') snd.bad(); else snd.good(); });
        return t + 120;
      }
      if (e.k === 'nomove') { const b = dieBox(); fx.text(b.x + b.w / 2, b.y + 10, 'Need exact roll', '#fff', 17); snd.bad(); return 700; }
      if (e.k === 'bonus') { const b = dieBox(); fx.text(b.x + b.w / 2, b.y + 8, 'Roll again!', '#ffe14a', 22); snd.six(); return 600; }
      if (e.k === 'tri') { snd.bad(); return 300; }
      if (e.k === 'end') { const c = sqXY(100); fx.burst(c[0], c[1], ['#ffe14a', '#fff', '#ff7a6a', '#7ee08f'], 40, 260, 1.2); snd.home(); return 600; }
      return 0;
    }

    function drawBack(c, st) {
      c.drawImage(bg, 0, 0, W, H);
    }
    function drawTokens(st) {
      const items = [];
      for (let p = 0; p < D.n; p++) {
        const mv = D.movers.find(m => m.p === p);
        if (mv) {
          const r = pathAt(mv.path, (T - mv.t0) * 1000);
          items.push({ p, xy: [r.x, r.y], z: r.z, sx: r.sx, sy: r.sy, mv: true });
        } else items.push({ p, xy: posXY(p, D.pos[p]), z: 0 });
      }
      items.sort((a, b) => a.xy[1] - b.xy[1]);
      for (const it of items) {
        const col = SNL_COLS[D.cols[it.p]], act = D.turn === it.p && st.V && st.V.phase !== 'over';
        drawPawn(ctx2, it.xy[0], it.xy[1], cs * .27, col.main, { lift: it.z, sx: it.sx, sy: it.sy, glow: act && !it.mv ? T * .7 : 0, glowCol: '#fff' });
      }
    }
    function drawPanel(st) {
      const V = st.V;
      for (let p = 0; p < D.n; p++) {
        const r = cardRect(p, D.n), col = SNL_COLS[D.cols[p]], act = V && V.phase !== 'over' && D.turn === p;
        ctx2.save();
        const g = ctx2.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
        g.addColorStop(0, act ? col.main : '#2b3558'); g.addColorStop(1, act ? col.dark : '#1b2342');
        rr(ctx2, r.x, r.y, r.w, r.h, 12); ctx2.fillStyle = g; ctx2.fill();
        ctx2.lineWidth = act ? 3 : 2; ctx2.strokeStyle = act ? '#fff' : rgba(col.main, .9); ctx2.stroke();
        const ar = PORT ? 11 : 19, ax = r.x + (PORT ? 18 : 30), ay = r.y + r.h / 2;
        drawAvatar(ctx2, ax, ay, ar, p * 5 + 2, col.main, '#fff');
        const nm = st.names[p] || 'Player ' + (p + 1), lim = PORT ? 8 : 13;
        text(ctx2, nm.length > lim ? nm.slice(0, lim - 1) + '…' : nm, ax + ar + 8, ay, PORT ? 12 : 17, '#fff', 'left', 'rgba(0,0,0,.35)');
        const pos = D.pos[p];
        text(ctx2, pos <= 0 ? 'Start' : '#' + pos, r.x + r.w - 10, ay, PORT ? 12 : 17, act ? '#fff' : 'rgba(255,255,255,.8)', 'right');
        if (st.dl && act) {
          const f = clamp(st.dl / ((V.rules.timer || 1) * 1000), 0, 1);
          ctx2.strokeStyle = f < .25 ? '#ff5b4b' : '#fff'; ctx2.lineWidth = 3; ctx2.beginPath(); ctx2.arc(ax, ay, ar + 4, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx2.stroke();
        }
        ctx2.restore();
      }
      const b = dieBox();
      ctx2.save(); rr(ctx2, b.x, b.y, b.w, b.h, 16); ctx2.fillStyle = 'rgba(10,16,40,.55)'; ctx2.fill();
      const col = SNL_COLS[D.cols[D.turn]] || SNL_COLS[0];
      const hot = st.myTurn && st.nd && st.nd.kind === 'roll';
      for (let i = 0; i < D.nd; i++) {
        const dp = diePos(i), d = D.dice[i];
        d.draw(ctx2, dp[0], dp[1], dp[2] * (d.rolling ? 1.25 : 1), { glow: hot ? T : 0, glowCol: '#fff', body: '#fffaf0', pip: '#1d1f2a', red1: true });
      }
      ctx2.restore();
      const bt = btnBox();
      ctx2.save();
      const mine = D.turn === st.viewer;
      if (V && V.phase !== 'over') {
        const gg = ctx2.createLinearGradient(0, bt.y, 0, bt.y + bt.h);
        if (hot) { gg.addColorStop(0, '#5bd37a'); gg.addColorStop(1, '#1f8a3a'); } else { gg.addColorStop(0, rgba(col.main, .8)); gg.addColorStop(1, rgba(col.dark, .8)); }
        const pu = hot ? Math.sin(T * 7) * 2 : 0;
        rr(ctx2, bt.x - pu, bt.y - pu / 2, bt.w + pu * 2, bt.h + pu, 16); ctx2.fillStyle = gg; ctx2.fill();
        ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 2.5; ctx2.stroke();
        const nm = st.names[D.turn] || 'Player';
        const lbl = hot ? (V.streak ? 'ROLL AGAIN' : 'ROLL') : D.rolling ? 'Rolling…' : mine && !st.nd ? '…' : `${nm.length > 10 ? nm.slice(0, 9) + '…' : nm} plays`;
        text(ctx2, lbl, bt.x + bt.w / 2, bt.y + bt.h / 2, PORT ? 20 : 24, '#fff', 'center', 'rgba(0,0,0,.35)');
      }
      ctx2.restore();
    }
    function draw(ctx, t, dt, st) {
      ctx2 = ctx; T += dt;
      for (let i = D.later.length - 1; i >= 0; i--) if (T >= D.later[i].at) { const f = D.later[i].fn; D.later.splice(i, 1); f(); }
      D.dice.forEach(d => d.update(dt));
      for (let i = D.movers.length - 1; i >= 0; i--) {
        const m = D.movers[i], ms = (T - m.t0) * 1000, r = pathAt(m.path, ms);
        if (!m.kind && r.i !== m.seg) { m.seg = r.i; snd.step(); }
        if (ms >= m.total) { D.pos[m.p] = m.to; D.movers.splice(i, 1); }
      }
      if (!bg) drawBoard();
      drawBack(ctx, st);
      if (st.scene !== 'game') { fx.draw(ctx, dt); return; }
      drawTokens(st);
      drawPanel(st);
      fx.draw(ctx, dt);
    }
    function hit(x, y) {
      const V = app.view();
      if (!V || V.phase === 'over') return null;
      const nd = snlNeed(V);
      if (nd.p !== app.viewer || !app.idleNow()) return null;
      const b = dieBox(), bt = btnBox();
      if ((x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) || (x >= bt.x && x <= bt.x + bt.w && y >= bt.y && y <= bt.y + bt.h)) return nd.moves[0];
      return null;
    }
    return {
      dims,
      resize(w, h, port, dpr) { W = w; H = h; PORT = port; DPR = dpr; layout(); drawBoard(); },
      reset, settle, event, draw,
      win() { fx.confetti(W, ['#e5322d', '#2a74e6', '#25a64a', '#f2b705', '#fff'], 120); },
      cursor(x, y) { return hit(x, y) != null; },
      pt() { const b = btnBox(); return [b.x + b.w / 2, b.y + b.h / 2]; },
      pointer(x, y, type) { if (type !== 'down') return false; const h = hit(x, y); return h ? app.act(h) : false; },
      key(code) { if (code === 'Space' || code === 'Enter') { const V = app.view(); if (V && V.phase !== 'over' && V.turn === app.viewer && app.idleNow()) return app.act({ t: 'roll' }); } return false; }
    };
  }

  const SNL_HELP = `<p><b>Goal:</b> be first to reach square <b>100</b>.</p>
<p><b>Turn:</b> roll the die and move that many squares along the board, zig-zagging up from square 1.</p>
<p><b>Ladders</b> carry you up to a higher square. <b>Snakes</b> slide you down to their tails. Landing on the foot of a ladder or the head of a snake is all that counts.</p>
<p><b>Finishing:</b> by default you need the <b>exact</b> number to land on 100. Other options: <b>bounce back</b> (extra pips are counted back from 100) or <b>any roll</b> wins.</p>
<p><b>Bonus roll:</b> a 6 (doubles with two dice) gives you another roll. Three bonus rolls in a row lose the last move.</p>
<p><b>Keys:</b> <kbd>Space</kbd> or <kbd>Enter</kbd> rolls the die.</p>`;
  const G_SNL = {
    id: 'snakes-ladders', title: 'Snakes and Ladders', tag: 'Climb the ladders, dodge the snakes, and race to 100.',
    minN: 2, maxN: 6, defN: 4, sizes: [2, 3, 4, 5, 6], diffs: null, rotates: false,
    colors: SNL_COLS, rulesDef: SNL_RULES, help: SNL_HELP,
    optSchema: [
      { k: 'board', label: 'Board', hint: 'Snake and ladder layout', vals: [['classic', 'Classic'], ['easy', 'Easy'], ['hard', 'Hard'], ['random', 'Random']] },
      { k: 'finish', label: 'Finish', hint: 'How to land on 100', vals: [['exact', 'Exact'], ['bounce', 'Bounce'], ['any', 'Any']] },
      { k: 'bonus', label: 'Bonus roll', hint: 'On a 6 (doubles with two dice)', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'dice', label: 'Dice', hint: '', vals: [[1, 'One'], [2, 'Two']] }
    ],
    Engine: snlEngine, need: snlNeed, ai: (s, nd) => nd.moves[0], auto: (s, nd) => nd.moves[0],
    think: () => [500, 800],
    endStat: (V, p) => V.pos[p] >= 100 ? 'Home!' : 'Square ' + V.pos[p],
    renderer: snlRenderer
  };

  const SORRY_COLS = [
    { name: 'Red', main: '#e0392f', dark: '#8c1912', light: '#ff8a7e', soft: '#ffd8d2' },
    { name: 'Blue', main: '#2870d8', dark: '#133f8a', light: '#7fb2ff', soft: '#d2e4ff' },
    { name: 'Yellow', main: '#f3c010', dark: '#a37800', light: '#ffe56e', soft: '#fff2b8' },
    { name: 'Green', main: '#27a24a', dark: '#106a2a', light: '#80de96', soft: '#d3f3dc' }
  ];
  const SORRY_RULES = { extra2: true, slides: true, split7: true, start1: false, auto: true, timer: 0 };
  const SCOLS_N = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };
  const S_DECK = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 7, 7, 7, 7, 8, 8, 8, 8, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 0, 0, 0, 0];
  const S_FREQ = { 1: 5, 2: 4, 3: 4, 4: 4, 5: 4, 7: 4, 8: 4, 10: 4, 11: 4, 12: 4, 0: 4 };
  const S_TEXT = {
    1: 'Move a pawn from Start, or move a pawn 1 space forward',
    2: 'Move a pawn from Start, or 2 spaces forward. Then draw again',
    3: 'Move a pawn 3 spaces forward',
    4: 'Move a pawn 4 spaces backward',
    5: 'Move a pawn 5 spaces forward',
    7: 'Move one pawn 7 spaces forward, or split the 7 between two pawns',
    8: 'Move a pawn 8 spaces forward',
    10: 'Move a pawn 10 spaces forward, or 1 space backward',
    11: 'Move 11 spaces forward, or swap places with an opponent',
    12: 'Move a pawn 12 spaces forward',
    0: 'Take a pawn from Start and bump an opponent'
  };
  const sEntry = c => 15 * c + 2, sExit = c => 15 * c + 4;
  function sFwd(c, pos, n) {
    if (pos < 0 || pos === 200) return null;
    if (pos >= 100) { const j = pos - 100 + n; return j <= 5 ? 100 + j : j === 6 ? 200 : null; }
    const d = (sEntry(c) - pos + 60) % 60;
    if (n <= d) return (pos + n) % 60;
    const m = n - d;
    return m <= 5 ? 100 + m : m === 6 ? 200 : null;
  }
  function sBack(c, pos, n) {
    if (pos < 0 || pos === 200) return null;
    if (pos >= 100) { const j = pos - 100 - n; return j >= 1 ? 100 + j : (sEntry(c) + j + 60) % 60; }
    return (pos - n + 60) % 60;
  }
  function sSlideAt(pos) {
    for (let c = 0; c < 4; c++) { const b = 15 * c; if (pos === b + 1) return { c, end: b + 4 }; if (pos === b + 9) return { c, end: b + 13 }; }
    return null;
  }
  function sProg(c, pos) {
    if (pos < 0) return -6;
    if (pos === 200) return 70;
    if (pos >= 100) return 58 + pos - 100;
    return 64 - ((sEntry(c) - pos + 60) % 60 + 6);
  }
  function sFwOk(s, p, k, n) {
    const c = s.cols[p], from = s.pos[p][k];
    const to = sFwd(c, from, n);
    if (to == null) return null;
    if (to !== 200 && s.pos[p].includes(to)) return null;
    return to;
  }
  function sMoves(s) {
    if (s.phase === 'draw' || s.phase === 'over') return [];
    const p = s.turn, c = s.cols[p], pos = s.pos[p], card = s.card, out = [];
    const fw = n => { for (let k = 0; k < 4; k++) { const to = sFwOk(s, p, k, n); if (to != null) out.push({ t: 'fwd', k, n, to }); } };
    const bk = n => {
      for (let k = 0; k < 4; k++) {
        const to = sBack(c, pos[k], n);
        if (to == null || pos.includes(to)) continue;
        out.push({ t: 'back', k, n, to });
      }
    };
    if (s.phase === 'split') {
      for (let k = 0; k < 4; k++) { if (k === s.splitK) continue; const to = sFwOk(s, p, k, s.rem); if (to != null) out.push({ t: 'fwd', k, n: s.rem, to }); }
      return out;
    }
    const sk = pos.indexOf(-1);
    if (card === 1 || card === 2) {
      if (sk >= 0 && !pos.includes(sExit(c))) out.push({ t: 'out', k: sk, to: sExit(c) });
      fw(card);
    } else if (card === 3 || card === 5 || card === 8 || card === 12) fw(card);
    else if (card === 4) bk(4);
    else if (card === 10) { fw(10); bk(1); }
    else if (card === 7) {
      fw(7);
      if (s.rules.split7) {
        for (let k = 0; k < 4; k++) for (let n = 1; n <= 6; n++) {
          const to = sFwOk(s, p, k, n);
          if (to == null) continue;
          const c2 = clone(s); c2.phase = 'split'; c2.rem = 7 - n; c2.splitK = k;
          sApply(c2, p, { t: 'fwd', k, n, to }, () => {});
          let ok = false;
          for (let k2 = 0; k2 < 4 && !ok; k2++) if (k2 !== k && sFwOk(c2, p, k2, 7 - n) != null) ok = true;
          if (ok) out.push({ t: 'fwd', k, n, to });
        }
      }
    } else if (card === 11) {
      fw(11);
      const hasF = out.length > 0;
      for (let k = 0; k < 4; k++) {
        if (pos[k] < 0 || pos[k] >= 60) continue;
        for (let q = 0; q < s.n; q++) { if (q === p) continue; for (let j = 0; j < 4; j++) { const y = s.pos[q][j]; if (y >= 0 && y < 60) out.push({ t: 'swap', k, q, j, to: y }); } }
      }
      if (!hasF && out.length) out.push({ t: 'pass' });
    } else if (card === 0) {
      if (sk >= 0) for (let q = 0; q < s.n; q++) { if (q === p) continue; for (let j = 0; j < 4; j++) { const y = s.pos[q][j]; if (y >= 0 && y < 60) out.push({ t: 'sorry', k: sk, q, j, to: y }); } }
    }
    return out;
  }
  function sApply(s, p, a, E) {
    const c = s.cols[p];
    if (a.t === 'pass') { E({ k: 'pass', p }); return; }
    const k = a.k, from = s.pos[p][k];
    const bump = (q, j, x) => { s.pos[q][j] = -1; E({ k: 'bump', p: q, pawn: j, from: x, by: p }); };
    if (a.t === 'out') { s.pos[p][k] = a.to; E({ k: 'out', p, pawn: k, to: a.to }); }
    else if (a.t === 'fwd' || a.t === 'back') { s.pos[p][k] = a.to; E({ k: 'move', p, pawn: k, from, to: a.to, n: a.n, dir: a.t === 'fwd' ? 1 : -1 }); }
    else if (a.t === 'swap') { const b = s.pos[a.q][a.j]; s.pos[a.q][a.j] = from; s.pos[p][k] = b; E({ k: 'swap', p, pawn: k, q: a.q, j: a.j, a: from, b }); }
    else if (a.t === 'sorry') { const b = s.pos[a.q][a.j]; s.pos[p][k] = b; E({ k: 'sorry', p, pawn: k, q: a.q, j: a.j, to: b, from: -1 }); s.pos[a.q][a.j] = -1; E({ k: 'bump', p: a.q, pawn: a.j, from: b, by: p, quiet: true }); }
    const slide = (q0, j0) => {
      const x = s.pos[q0][j0], sl = x >= 0 && x < 60 && s.rules.slides ? sSlideAt(x) : null;
      if (!sl || sl.c === s.cols[q0]) return;
      const hits = [];
      for (let i = 1; i <= (sl.end - x + 60) % 60; i++) {
        const y = (x + i) % 60;
        for (let q = 0; q < s.n; q++) for (let j = 0; j < 4; j++) if (!(q === q0 && j === j0) && s.pos[q][j] === y) { s.pos[q][j] = -1; hits.push({ q, j, at: y, i }); }
      }
      s.pos[q0][j0] = sl.end;
      E({ k: 'slide', p: q0, pawn: j0, from: x, to: sl.end, hits, col: sl.c });
    };
    const x = s.pos[p][k];
    if (x >= 0 && x < 60 && a.t !== 'sorry' && a.t !== 'swap') for (let q = 0; q < s.n; q++) for (let j = 0; j < 4; j++) if (!(q === p && j === k) && s.pos[q][j] === x) bump(q, j, x);
    slide(p, k);
    if (a.t === 'swap') slide(a.q, a.j);
    if (s.pos[p][k] === 200) E({ k: 'home', p, pawn: k });
  }
  function sorryEngine(o) {
    const R = o.rnd || Math.random, n = o.n, rules = Object.assign({}, SORRY_RULES, o.rules);
    const s = { n, cols: SCOLS_N[n].slice(), rules, pos: Array.from({ length: n }, () => [-1, -1, -1, -1]), turn: 0, phase: 'draw', card: -1, top: -1, rem: 0, splitK: -1, deck: shuffle(R, S_DECK.slice()), disc: [], deckN: 45, order: [], tid: 0, draws: 0 };
    if (rules.start1) for (let p = 0; p < n; p++) s.pos[p][0] = sExit(s.cols[p]);
    let ev = [];
    const E = e => ev.push(e);
    const next = (p, extra) => {
      s.tid++;
      if (extra) { s.phase = 'draw'; E({ k: 'again', p }); E({ k: 'turn', p, extra: true }); }
      else { s.turn = (p + 1) % n; s.phase = 'draw'; E({ k: 'turn', p: s.turn }); }
    };
    const finish = p => {
      if (s.pos[p].every(v => v === 200)) {
        s.order.push(p);
        const rest = [...Array(n).keys()].filter(q => q !== p).sort((a, b) => s.pos[b].reduce((x, v) => x + sProg(s.cols[b], v), 0) - s.pos[a].reduce((x, v) => x + sProg(s.cols[a], v), 0));
        s.order.push(...rest); s.phase = 'over'; s.tid++;
        E({ k: 'end', order: s.order.slice() });
        return;
      }
      next(p, s.card === 2 && rules.extra2);
    };
    const draw = p => {
      if (!s.deck.length) { s.deck = shuffle(R, s.disc.slice(0, -1)); s.disc = s.disc.slice(-1); E({ k: 'shuffle' }); if (!s.deck.length) s.deck = shuffle(R, S_DECK.slice()); }
      const card = s.deck.pop();
      s.disc.push(card); s.card = card; s.top = card; s.deckN = s.deck.length; s.draws++;
      E({ k: 'card', p, card, deckN: s.deckN });
      s.phase = 'play';
      if (!sMoves(s).length) { E({ k: 'nomove', p, card }); finish(p); }
      else s.tid++;
    };
    return {
      s, take() { const e = ev; ev = []; return e; },
      view() { const v = clone(Object.assign({}, s, { deck: [], disc: [] })); return v; },
      start() { s.tid++; E({ k: 'turn', p: 0, first: true }); },
      act(p, a) {
        if (s.phase === 'over' || p !== s.turn || !a) return false;
        if (s.phase === 'draw') { if (a.t !== 'draw') return false; draw(p); return true; }
        const m = sMoves(s).find(x => same(x, a));
        if (!m) return false;
        const wasSplit = s.phase === 'split';
        sApply(s, p, m, E);
        if (!wasSplit && s.card === 7 && m.t === 'fwd' && m.n < 7) { s.phase = 'split'; s.rem = 7 - m.n; s.splitK = m.k; s.tid++; return true; }
        s.phase = 'play'; s.rem = 0; s.splitK = -1;
        finish(p);
        return true;
      }
    };
  }
  let sNeedKey = '', sNeedVal = null;
  function sorryNeed(s) {
    if (s.phase === 'over') return { p: -1 };
    if (s.phase === 'draw') return { p: s.turn, kind: 'draw', moves: [{ t: 'draw' }] };
    const key = s.tid + '|' + s.phase + '|' + s.turn + '|' + s.card + '|' + s.rem + '|' + s.splitK + '|' + s.rules.auto + s.rules.split7 + s.rules.slides + '|' + JSON.stringify(s.pos);
    if (key === sNeedKey) return sNeedVal;
    const moves = sMoves(s);
    sNeedKey = key; sNeedVal = { p: s.turn, kind: s.phase === 'split' ? 'split' : 'move', moves, auto: !!s.rules.auto && moves.length === 1 };
    return sNeedVal;
  }
  function sorryEval(s, p, hard) {
    let v = 0;
    const cnt = x => Object.keys(S_FREQ).reduce((a, k) => a + (+k === x ? S_FREQ[k] : 0), 0);
    for (let q = 0; q < s.n; q++) {
      const w = q === p ? 1 : -.78 / Math.max(1, s.n - 1) * (s.n > 2 ? 1.6 : 1);
      for (const pos of s.pos[q]) {
        let g = sProg(s.cols[q], pos);
        if (pos >= 100 && pos < 200) g += 3;
        v += g * w;
        if (q === p && hard && pos >= 0 && pos < 60) {
          let risk = 0;
          for (let o = 0; o < s.n; o++) {
            if (o === p) continue;
            for (const y of s.pos[o]) {
              if (y < 0 || y >= 60) continue;
              const d = (pos - y + 60) % 60;
              if (d > 0 && d <= 12) risk += cnt(d) / 45;
              const e = (y - pos + 60) % 60;
              if (e === 4) risk += 4 / 45; if (e === 1) risk += 4 / 45 * .5;
              risk += 4 / 45 * .35;
            }
            if (s.pos[o].includes(-1)) risk += 4 / 45;
          }
          v -= Math.min(1, risk) * (g + 8) * .6;
        }
      }
    }
    return v;
  }
  function sorryAi(s, nd, diff, R) {
    if (nd.kind === 'draw') return nd.moves[0];
    const mv = nd.moves, p = nd.p;
    if (mv.length === 1) return mv[0];
    if (diff === 'Easy' && R() < .55) return mv[rint(R, mv.length)];
    let best = null, bs = -1e9;
    for (const m of mv) {
      const c = clone(s), ev = [];
      sApply(c, p, m, e => ev.push(e));
      let sc = sorryEval(c, p, diff === 'Hard');
      if (m.t === 'pass') sc -= .1;
      if (s.card === 7 && m.n < 7) sc += .2;
      if (diff === 'Normal') sc += R() * 3;
      else if (diff === 'Easy') sc += R() * 12;
      if (sc > bs) { bs = sc; best = m; }
    }
    return best || mv[0];
  }

  const SCARD_COL = { 1: '#e0392f', 2: '#e8742a', 3: '#c99700', 4: '#2fa24c', 5: '#13969b', 7: '#2870d8', 8: '#5a49d1', 10: '#9a3fc4', 11: '#d63f8b', 12: '#6a4a2a', 0: '#222637' };
  const SDIR = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const SIN = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  const SORG = [[0, 0], [15, 0], [15, 15], [0, 15]];
  const sRing = pos => { const c = Math.floor(pos / 15), j = pos % 15; return [SORG[c][0] + SDIR[c][0] * j, SORG[c][1] + SDIR[c][1] * j]; };
  const sSafe = (c, i) => { const b = sRing(15 * c + 2); return [b[0] + SIN[c][0] * i, b[1] + SIN[c][1] * i]; };
  const sStartC = c => { const b = sRing(15 * c + 4); return [b[0] + .5 + SIN[c][0] * 2, b[1] + .5 + SIN[c][1] * 2]; };
  const sHomeC = c => { const h = sSafe(c, 6); return [h[0] + .5, h[1] + .5]; };
  const SSLOT = [[-.42, -.42], [.42, -.42], [-.42, .42], [.42, .42]];
  const SHSLOT = [[-.34, -.3], [.34, -.3], [-.34, .34], [.34, .34]];
  const sCardName = v => v === 0 ? 'Sorry!' : String(v);

  function sorryRenderer(app) {
    const snd = app.snd, fx = makeFx();
    let W = 900, H = 600, PORT = false, DPR = 1, bs = 584, bx = 10, by = 8, cs = 36.5, rotK = 0, bg = null, T = 0, ctx2 = null;
    const D = { pos: [], movers: [], later: [], n: 0, cols: [], top: -1, deckN: 45, flip: null, last: [], turn: 0, sel: -1, mi: 0, kb: false, items: [], over: false, place: [], tx: [], pass: null };
    const later = (ms, fn) => D.later.push({ at: T + ms / 1000, fn });
    const clamp01 = v => clamp(v, 0, 1);
    const colOf = p => SORRY_COLS[D.cols[p]];

    function rot(x, y) {
      for (let i = 0; i < rotK; i++) { const t = x; x = 16 - y; y = t; }
      return [x, y];
    }
    const P = (x, y) => { const r = rot(x, y); return [bx + r[0] * cs, by + r[1] * cs]; };
    function posXY(p, k, pos) {
      const c = D.cols[p];
      if (pos < 0) { const s = sStartC(c), o = SSLOT[k]; return [s[0] + o[0], s[1] + o[1]]; }
      if (pos < 60) { const r = sRing(pos); return [r[0] + .5, r[1] + .5]; }
      if (pos >= 100 && pos < 200) { const r = sSafe(c, pos - 100); return [r[0] + .5, r[1] + .5]; }
      const h = sHomeC(c), o = SHSLOT[k];
      return [h[0] + o[0], h[1] + o[1]];
    }
    function dims(port) { return port ? [360, 590] : [900, 600]; }
    function layout() {
      if (PORT) { bs = 344; bx = 8; by = 110; } else { bs = 560; bx = 48; by = 20; }
      cs = bs / 16;
    }
    function cardRect(p) {
      if (!PORT) return { x: 620, y: 30 + p * 116, w: 272, h: 108 };
      const s = (D.cols[p] + rotK) % 4, top = s < 2;
      return { x: s === 0 || s === 3 ? 8 : 182, y: top ? 46 : by + bs + 4, w: 170, h: 60 };
    }
    const deckC = () => [bx + 6.75 * cs, by + 8.7 * cs], discC = () => [bx + 9.45 * cs, by + 8.7 * cs];
    const cardWH = () => [cs * 2.5, cs * 3.5];

    function drawBoard() {
      const S = bs, pad = 6, U = S / 16;
      bg = document.createElement('canvas'); bg.width = Math.round((S + pad * 2) * DPR); bg.height = Math.round((S + pad * 2) * DPR);
      const c = bg.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
      c.translate(pad, pad);
      c.save(); c.translate(S / 2, S / 2); c.rotate(rotK * Math.PI / 2); c.translate(-S / 2, -S / 2);
      c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 14; c.shadowOffsetY = 4;
      const fg = c.createLinearGradient(0, 0, S, S); fg.addColorStop(0, '#2d3a63'); fg.addColorStop(1, '#161c38');
      rr(c, -pad, -pad, S + pad * 2, S + pad * 2, 16); c.fillStyle = fg; c.fill(); c.shadowColor = 'transparent';
      const sg = c.createLinearGradient(0, 0, S, S); sg.addColorStop(0, '#f7f3e6'); sg.addColorStop(1, '#e6e9ee');
      rr(c, 0, 0, S, S, 10); c.fillStyle = sg; c.fill();
      c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 1;
      for (let i = 1; i < 16; i++) { c.beginPath(); c.moveTo(i * U, U); c.lineTo(i * U, S - U); c.moveTo(U, i * U); c.lineTo(S - U, i * U); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(U * 1.5, U * 1.5, S - U * 3, S - U * 3);
      c.strokeStyle = '#a9a28d'; c.lineWidth = 1.2;
      for (let pos = 0; pos < 60; pos++) {
        const [x, y] = sRing(pos);
        c.fillStyle = '#fffdf6'; c.fillRect(x * U, y * U, U, U); c.strokeRect(x * U, y * U, U, U);
      }
      for (let k = 0; k < 4; k++) {
        const col = SORRY_COLS[k], d = SDIR[k];
        for (const [a, b] of [[1, 4], [9, 13]]) {
          for (let j = a; j <= b; j++) {
            const [x, y] = sRing(15 * k + j);
            c.fillStyle = rgba(col.main, .22); c.fillRect(x * U, y * U, U, U); c.strokeRect(x * U, y * U, U, U);
          }
          const p0 = sRing(15 * k + a), p1 = sRing(15 * k + b);
          const x0 = (p0[0] + .5) * U, y0 = (p0[1] + .5) * U, x1 = (p1[0] + .5) * U, y1 = (p1[1] + .5) * U;
          c.strokeStyle = col.main; c.lineWidth = U * .22; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x0 + d[0] * U * .2, y0 + d[1] * U * .2); c.lineTo(x1, y1); c.stroke();
          c.save(); c.translate(x0, y0); c.rotate(Math.atan2(d[1], d[0]));
          c.fillStyle = col.main; c.beginPath(); c.moveTo(U * .36, 0); c.lineTo(-U * .26, -U * .36); c.lineTo(-U * .26, U * .36); c.closePath(); c.fill();
          c.restore();
          c.fillStyle = col.main; c.beginPath(); c.arc(x1, y1, U * .26, 0, TAU); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(x1, y1, U * .1, 0, TAU); c.fill();
          c.strokeStyle = '#a9a28d'; c.lineWidth = 1.2;
        }
      }
      for (let k = 0; k < 4; k++) {
        const col = SORRY_COLS[k];
        for (let i = 1; i <= 5; i++) {
          const [x, y] = sSafe(k, i);
          const g = c.createLinearGradient(x * U, y * U, (x + 1) * U, (y + 1) * U); g.addColorStop(0, col.light); g.addColorStop(1, col.main);
          c.fillStyle = g; c.fillRect(x * U, y * U, U, U); c.strokeStyle = col.dark; c.lineWidth = 1.5; c.strokeRect(x * U, y * U, U, U);
        }
        const hc = sHomeC(k), sc = sStartC(k);
        const hg = c.createRadialGradient(hc[0] * U - U * .2, hc[1] * U - U * .2, U * .1, hc[0] * U, hc[1] * U, U * 1.05);
        hg.addColorStop(0, col.light); hg.addColorStop(1, col.dark);
        c.fillStyle = hg; c.beginPath(); c.arc(hc[0] * U, hc[1] * U, U * .98, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke();
        c.fillStyle = col.soft; c.beginPath(); c.arc(hc[0] * U, hc[1] * U, U * .72, 0, TAU); c.fill();
        const sg2 = c.createRadialGradient(sc[0] * U - U * .3, sc[1] * U - U * .3, U * .1, sc[0] * U, sc[1] * U, U * 1.2);
        sg2.addColorStop(0, '#fff'); sg2.addColorStop(1, col.soft);
        c.fillStyle = sg2; c.beginPath(); c.arc(sc[0] * U, sc[1] * U, U * 1.12, 0, TAU); c.fill();
        c.strokeStyle = col.main; c.lineWidth = 4; c.stroke();
      }
      c.restore();
    }

    function reset(V) {
      D.movers.length = 0; D.later.length = 0; fx.clear(); D.over = false; D.place = []; D.flip = null; D.sel = -1; D.mi = 0; D.kb = false;
      if (!V) { D.n = 4; D.cols = [0, 1, 2, 3]; D.pos = [0, 1, 2, 3].map(() => [-1, -1, -1, -1]); D.top = -1; D.deckN = 45; D.last = [-1, -1, -1, -1]; rotK = 0; if (bg) drawBoard(); return; }
      D.n = V.n; D.cols = V.cols.slice(); D.pos = V.pos.map(a => a.slice());
      D.top = V.top; D.deckN = V.deckN; D.last = V.pos.map(() => -1); D.turn = V.turn;
      if (V.top >= 0) D.last[V.turn] = V.top;
      const vc = V.cols[Math.min(app.viewer, V.n - 1)] || 0;
      rotK = app.opt.rot ? (2 - vc + 4) % 4 : 0;
      if (bg) drawBoard();
    }
    function settle(V) {
      if (!V || D.movers.length || D.later.length || D.flip) return;
      for (let p = 0; p < V.n; p++) for (let k = 0; k < 4; k++) D.pos[p][k] = V.pos[p][k];
      D.turn = V.turn; D.top = V.top; D.deckN = V.deckN;
    }
    function stepPath(c, from, to, dir) {
      const out = [from]; let p = from, g = 0;
      while (p !== to && g++ < 80) { p = dir > 0 ? sFwd(c, p, 1) : sBack(c, p, 1); if (p == null) break; out.push(p); }
      return out;
    }
    function addMover(p, k, path, to, extra) {
      const m = Object.assign({ p, k, path, t0: T, total: pathLen(path), to, seg: -1 }, extra || {});
      D.movers.push(m); return m;
    }
    function arc(a, b, dur, h, spin) {
      return { segs: [{ fn: u => { const e = easeInOut(u); return { x: lerp(a[0], b[0], e), y: lerp(a[1], b[1], e), z: Math.sin(u * Math.PI) * h, sx: 1, sy: 1 }; }, dur, x1: b[0], y1: b[1] }] };
    }
    function bumpMover(q, j, from, by, quiet) {
      const a = posXY(q, j, from), b = posXY(q, j, -1), pt = P(a[0], a[1]);
      fx.burst(pt[0], pt[1] - cs * .4, [colOf(by).main, '#fff', '#ffe14a'], 16, 180); fx.ring(pt[0], pt[1] - 4, '#fff', cs * 1.1);
      snd.bump();
      return addMover(q, j, arc(a, b, 640, 3.2), -1, { spin: true });
    }
    function event(e) {
      if (e.k === 'turn') { D.turn = e.p; D.sel = -1; D.mi = 0; return 120; }
      if (e.k === 'card') {
        D.flip = { v: e.card, t0: T, ms: 620 }; D.deckN = e.deckN; D.last[e.p] = e.card; D.turn = e.p;
        snd.card(); later(520, () => snd.card());
        return 700;
      }
      if (e.k === 'shuffle') { snd.card(); later(120, () => snd.card()); later(240, () => snd.card()); const d = deckC(); fx.text(d[0], d[1] + cs * 1.9, 'Shuffling', '#fff', 16); return 520; }
      if (e.k === 'nomove') { const d = discC(); fx.text(d[0], d[1] + cs * 1.9, 'No move', '#fff', 18); snd.bad(); return 950; }
      if (e.k === 'again') { const d = discC(); fx.text(d[0], d[1] + cs * 1.9, 'Draw again!', '#ffe14a', 18); snd.good(); return 600; }
      if (e.k === 'pass') { const d = discC(); fx.text(d[0], d[1] + cs * 1.9, 'Pass', '#fff', 17); return 400; }
      if (e.k === 'out') {
        const a = posXY(e.p, e.pawn, -1), b = posXY(e.p, e.pawn, e.to);
        addMover(e.p, e.pawn, hopPath([{ x: a[0], y: a[1] }, { x: b[0], y: b[1] }], 380, 1.3, easeInOut), e.to);
        return 450;
      }
      if (e.k === 'move') {
        const c = D.cols[e.p], ps = stepPath(c, e.from, e.to, e.dir);
        const pts = ps.map(q => { const a = posXY(e.p, e.pawn, q); return { x: a[0], y: a[1] }; });
        const steps = pts.length - 1, dur = steps > 8 ? 95 : steps > 4 ? 125 : 160;
        const path = hopPath(pts, dur, .55);
        addMover(e.p, e.pawn, path, e.to);
        return pathLen(path) + 60;
      }
      if (e.k === 'sorry') {
        const a = posXY(e.p, e.pawn, -1), b = posXY(e.p, e.pawn, e.to);
        fx.text(P(a[0], a[1])[0], P(a[0], a[1])[1] - cs * 1.4, 'Sorry!', '#ff5b4b', 22);
        addMover(e.p, e.pawn, arc(a, b, 780, 2.2), e.to);
        return 860;
      }
      if (e.k === 'swap') {
        const a = posXY(e.p, e.pawn, e.a), b = posXY(e.p, e.pawn, e.b);
        addMover(e.p, e.pawn, arc(a, b, 760, 1.6), e.b);
        addMover(e.q, e.j, arc(b, a, 760, 1.0), e.a);
        snd.swap(); later(700, () => { const q = P(a[0], a[1]), r = P(b[0], b[1]); fx.ring(q[0], q[1], '#fff', cs); fx.ring(r[0], r[1], '#fff', cs); });
        return 840;
      }
      if (e.k === 'bump') {
        if (e.quiet) { later(700, () => bumpMover(e.p, e.pawn, e.from, e.by)); return 1320; }
        bumpMover(e.p, e.pawn, e.from, e.by);
        return 700;
      }
      if (e.k === 'slide') {
        const c = D.cols[e.p], pts = [];
        for (let q = e.from, g = 0; g < 20; g++) { const a = posXY(e.p, e.pawn, q); pts.push([a[0], a[1]]); if (q === e.to) break; q = (q + 1) % 60; }
        const steps = pts.length - 1, per = 80, dur = Math.max(260, steps * per);
        const path = { segs: [{ fn: u => { const f = u * steps, i = Math.min(steps - 1, Math.floor(f)), t = f - i; return { x: lerp(pts[i][0], pts[i + 1][0], t), y: lerp(pts[i][1], pts[i + 1][1], t), z: Math.sin(u * Math.PI) * .45, sx: 1, sy: 1 }; }, dur, x1: pts[steps][0], y1: pts[steps][1] }] };
        addMover(e.p, e.pawn, path, e.to);
        snd.slide();
        for (const h of e.hits) later(h.i * per - 10, () => bumpMover(h.q, h.j, h.at, e.p));
        return dur + (e.hits.length ? 720 : 120);
      }
      if (e.k === 'home') {
        const a = posXY(e.p, e.pawn, 200), q = P(a[0], a[1]), c = colOf(e.p);
        later(10, () => { fx.burst(q[0], q[1], [c.main, c.light, '#fff', '#ffe14a'], 26, 220, 1); fx.ring(q[0], q[1], '#ffe14a', cs * 1.6); snd.home(); });
        return 520;
      }
      if (e.k === 'end') { D.over = true; e.order.forEach((p, i) => { D.place[p] = i + 1; }); return 300; }
      return 0;
    }

    function moverFor(p, k) { return D.movers.find(m => m.p === p && m.k === k); }
    function moveKey(V, nd) {
      const set = new Set();
      if (!nd || nd.p !== app.viewer) return set;
      for (const m of nd.moves) if (m.k != null) set.add(m.k);
      return set;
    }
    function movePt(nd, m) {
      if (m.to == null) return null;
      const who = m.t === 'swap' || m.t === 'sorry' ? m.q : nd.p, k = m.t === 'swap' || m.t === 'sorry' ? m.j : m.k;
      const xy = posXY(who, k, m.to);
      return P(xy[0], xy[1]);
    }
    function drawPawns(st) {
      const items = [], V = st.V, nd = st.nd, me = st.viewer;
      for (let p = 0; p < D.n; p++) for (let k = 0; k < 4; k++) {
        if (moverFor(p, k)) continue;
        const pos = D.pos[p][k], xy = posXY(p, k, pos);
        items.push({ p, k, pos, xy, sc: pos === 200 ? .6 : pos < 0 ? .86 : 1, z: 0 });
      }
      for (const mv of D.movers) {
        const r = pathAt(mv.path, (T - mv.t0) * 1000);
        items.push({ p: mv.p, k: mv.k, pos: mv.to, xy: [r.x, r.y], sc: 1, z: r.z * cs, sx: r.sx, sy: r.sy, mv: true, spin: mv.spin ? (r.u || 0) * TAU * 1.5 : 0 });
      }
      const mk = st.myTurn && nd && nd.p === me ? nd.moves : [];
      const startK = D.pos[me] ? D.pos[me].indexOf(-1) : -1;
      const legal = new Set(mk.filter(m => m.k != null).map(m => m.k));
      const cur = mk.length && D.kb ? mk[D.mi % mk.length] : null;
      for (const it of items) it.ys = P(it.xy[0], it.xy[1])[1];
      items.sort((a, b) => (a.mv ? 1 : 0) - (b.mv ? 1 : 0) || a.ys - b.ys);
      for (const it of items) {
        const q = P(it.xy[0], it.xy[1]);
        const mine = it.p === me && !it.mv && st.myTurn && (legal.has(it.k) || (it.pos < 0 && legal.has(startK)));
        const isSel = mine && (D.sel === it.k || (cur && (cur.k === it.k || (it.pos < 0 && cur.k === startK))));
        const r = cs * (PORT ? .42 : .4) * it.sc;
        drawPawn(ctx2, q[0], q[1] + cs * .1, r, colOf(it.p).main, { lift: it.z || 0, sx: it.sx, sy: it.sy, glow: mine ? T : 0, glowCol: '#fff', rot: it.spin });
        if (isSel) { ctx2.save(); ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 2.5; ctx2.setLineDash([5, 4]); ctx2.lineDashOffset = -T * 20; ctx2.beginPath(); ctx2.ellipse(q[0], q[1] + cs * .1, r * 1.35, r * .62, 0, 0, TAU); ctx2.stroke(); ctx2.restore(); }
        it.q = q; it.r = r; it.mine = mine;
      }
      D.items = items;
    }
    function drawTargets(st) {
      const nd = st.nd;
      D.tx = [];
      if (!st.myTurn || !nd || nd.p !== st.viewer) return;
      const mk = nd.moves, V = st.V, cur = D.kb && mk.length ? mk[D.mi % mk.length] : null, pu = (Math.sin(T * 6) + 1) / 2;
      mk.forEach((m, i) => {
        const pt = movePt(nd, m);
        if (!pt) return;
        D.tx.push({ m, pt });
        const dim = D.sel >= 0 && m.k !== D.sel;
        const hot = m === cur;
        let col = colOf(nd.p).light, dash = false;
        if (m.t === 'swap') { col = '#ffd84a'; dash = true; }
        else if (m.t === 'sorry') { col = '#ff6b5b'; dash = true; }
        else if (m.to < 60 && m.to >= 0) { for (let q = 0; q < V.n; q++) if (q !== nd.p && V.pos[q].includes(m.to)) col = '#ff7a4a'; }
        ctx2.save(); ctx2.globalAlpha = dim ? .3 : .6 + pu * .4;
        ctx2.strokeStyle = hot ? '#fff' : col; ctx2.lineWidth = hot ? 4 : 3;
        if (dash) { ctx2.setLineDash([6, 4]); ctx2.lineDashOffset = -T * 22; }
        ctx2.beginPath(); ctx2.arc(pt[0], pt[1], cs * (.42 + pu * .06), 0, TAU); ctx2.stroke();
        if (!dim && (D.sel === m.k || hot)) { ctx2.fillStyle = rgba('#ffffff', .18); ctx2.fill(); }
        ctx2.restore();
        if (hot || D.sel === m.k) {
          const a = posXY(nd.p, m.k, D.pos[nd.p][m.k]), pa = P(a[0], a[1]);
          ctx2.save(); ctx2.globalAlpha = .55; ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 2; ctx2.setLineDash([3, 5]); ctx2.beginPath(); ctx2.moveTo(pa[0], pa[1]); ctx2.lineTo(pt[0], pt[1]); ctx2.stroke(); ctx2.restore();
        }
      });
    }
    function drawCard(c, cx, cy, w, h, v, back, o) {
      o = o || {};
      c.save(); c.translate(cx, cy); c.rotate(o.rot || 0); c.scale(o.sx == null ? 1 : o.sx, o.sy == null ? 1 : o.sy);
      if (o.glow) { c.shadowColor = '#fff'; c.shadowBlur = 16; }
      else { c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 8; c.shadowOffsetY = 3; }
      rr(c, -w / 2, -h / 2, w, h, w * .1);
      if (back) {
        const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#2a62c9'); g.addColorStop(1, '#173a82');
        c.fillStyle = g; c.fill(); c.shadowColor = 'transparent';
        c.strokeStyle = '#fff'; c.lineWidth = Math.max(2, w * .05); c.stroke();
        rr(c, -w * .38, -h * .4, w * .76, h * .8, w * .06); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.5; c.stroke();
        c.save(); c.rotate(-.5); text(c, 'SORRY!', 0, 0, w * .27, '#ffe14a', 'center', '#7a1410'); c.restore();
      } else {
        c.fillStyle = '#fffdf6'; c.fill(); c.shadowColor = 'transparent';
        const col = SCARD_COL[v] || '#333';
        c.strokeStyle = col; c.lineWidth = Math.max(2, w * .05); c.stroke();
        const nm = sCardName(v), small = w < 60, big = v === 0 ? w * (small ? .2 : .3) : w * .62;
        text(c, nm, 0, h * .02, big, col, 'center', 'rgba(255,255,255,.9)');
        if (!small) { text(c, nm, -w * .32, -h * .39, w * .2, col, 'center'); c.save(); c.rotate(Math.PI); text(c, nm, -w * .32, -h * .39, w * .2, col, 'center'); c.restore(); }
        const cap = { 4: 'back', 0: 'bump!', 7: 'split', 11: 'swap', 2: '+ draw' }[v];
        if (cap && !small) text(c, cap, 0, h * .34, w * .17, col, 'center', null, 800);
      }
      c.restore();
    }
    function drawLabels() {
      for (let k = 0; k < 4; k++) {
        const h = P(...sHomeC(k)), s = P(...sStartC(k)), c = SORRY_COLS[k];
        text(ctx2, 'HOME', h[0], h[1], cs * .3, c.dark, 'center');
        text(ctx2, 'START', s[0], s[1], cs * .27, rgba(c.dark, .55), 'center');
      }
    }
    function drawCenter(st) {
      const [dw, dh] = cardWH(), dc = deckC(), cc = discC();
      text(ctx2, 'Sorry!', bx + 8 * cs, by + 5.7 * cs, cs * 1.3, '#d6301f', 'center', '#fff', 900);
      for (let i = 3; i >= 0; i--) if (D.deckN > i * 8) drawCard(ctx2, dc[0] - i * 1.4, dc[1] - i * 1.6, dw, dh, 0, true, {});
      const hot = st.myTurn && st.nd && st.nd.kind === 'draw';
      if (hot) {
        ctx2.save(); ctx2.globalAlpha = .6 + .4 * Math.sin(T * 7); ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 3; ctx2.shadowColor = '#fff'; ctx2.shadowBlur = 12;
        rr(ctx2, dc[0] - dw / 2 - 5, dc[1] - dh / 2 - 5, dw + 10, dh + 10, dw * .12); ctx2.stroke(); ctx2.restore();
        text(ctx2, 'DRAW', dc[0], dc[1] + dh * .5 + cs * .62 + Math.sin(T * 8) * 1.5, PORT ? 10 : 14, '#fff', 'center', 'rgba(0,0,0,.55)');
      }
      text(ctx2, String(D.deckN), dc[0], dc[1] + dh * .5 + (hot ? cs * 1.4 : cs * .55), PORT ? 9 : 12, 'rgba(0,0,0,.45)', 'center', null, 800);
      if (D.top >= 0 || D.flip) {
        if (D.flip) {
          const u = (T - D.flip.t0) * 1000 / D.flip.ms;
          if (u >= 1) { D.top = D.flip.v; D.flip = null; }
        }
        if (D.top >= 0) drawCard(ctx2, cc[0], cc[1], dw, dh, D.top, false, {});
      }
      if (D.flip) {
        const u = clamp01((T - D.flip.t0) * 1000 / D.flip.ms), e = easeInOut(u);
        const x = lerp(dc[0], cc[0], e), y = lerp(dc[1], cc[1], e) - Math.sin(u * Math.PI) * cs * 1.1, sc = 1 + Math.sin(u * Math.PI) * .22;
        const ang = u * Math.PI, sx = Math.abs(Math.cos(ang));
        drawCard(ctx2, x, y, dw * sc, dh * sc, D.flip.v, u < .5, { sx: Math.max(.04, sx) });
      }
    }
    function wrap(s, w, size) {
      ctx2.font = `800 ${size}px ${FONT}`;
      const words = s.split(' '), lines = []; let cur = '';
      for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (ctx2.measureText(t).width > w && cur) { lines.push(cur); cur = wd; } else cur = t; }
      if (cur) lines.push(cur);
      return lines;
    }
    function drawCards(st) {
      for (let p = 0; p < D.n; p++) {
        const r = cardRect(p), col = colOf(p), active = st.scene === 'game' && st.V && st.V.phase !== 'over' && D.turn === p;
        const pu = active ? (Math.sin(T * 5) + 1) / 2 : 0;
        ctx2.save();
        ctx2.shadowColor = 'rgba(0,0,0,.4)'; ctx2.shadowBlur = 8; ctx2.shadowOffsetY = 2;
        const g = ctx2.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
        g.addColorStop(0, active ? col.main : '#2b3558'); g.addColorStop(1, active ? col.dark : '#1b2342');
        rr(ctx2, r.x, r.y, r.w, r.h, 16); ctx2.fillStyle = g; ctx2.fill(); ctx2.shadowColor = 'transparent';
        ctx2.lineWidth = active ? 3 + pu * 2 : 2; ctx2.strokeStyle = active ? '#fff' : rgba(col.main, .85); ctx2.stroke();
        const ar = PORT ? 18 : 28, ax = r.x + (PORT ? 26 : 40), ay = r.y + (PORT ? r.h / 2 : 40);
        drawAvatar(ctx2, ax, ay, ar, p * 3 + D.cols[p] * 7 + 1, col.main, '#fff');
        const nm = st.names[p] || ('Player ' + (p + 1)), lim = PORT ? 8 : 12;
        text(ctx2, nm.length > lim ? nm.slice(0, lim - 1) + '…' : nm, ax + ar + 10, PORT ? r.y + 20 : r.y + 28, PORT ? 13 : 19, '#fff', 'left', 'rgba(0,0,0,.35)');
        const home = D.pos[p].filter(v => v === 200).length;
        const dots = PORT ? [r.x + 52, r.y + 44] : [r.x + 14, r.y + 82];
        for (let k = 0; k < 4; k++) {
          const v = D.pos[p][k];
          ctx2.beginPath(); ctx2.arc(dots[0] + k * (PORT ? 15 : 22), dots[1], PORT ? 5 : 7, 0, TAU);
          ctx2.fillStyle = v === 200 ? '#ffe14a' : v < 0 ? 'rgba(255,255,255,.16)' : v >= 100 ? '#fff' : col.light; ctx2.fill();
          ctx2.strokeStyle = 'rgba(255,255,255,.55)'; ctx2.lineWidth = 1.5; ctx2.stroke();
        }
        if (!PORT) text(ctx2, `${home}/4 home`, r.x + 110, r.y + 82, 14, 'rgba(255,255,255,.88)', 'left');
        if (D.place[p]) text(ctx2, D.place[p] + (['st', 'nd', 'rd'][D.place[p] - 1] || 'th'), r.x + r.w - (PORT ? 30 : 36), r.y + 18, 14, '#ffe14a', 'center', 'rgba(0,0,0,.4)');
        const lv = D.last[p];
        if (lv >= 0) {
          const mw = PORT ? 26 : 44, mh = PORT ? 36 : 62;
          drawCard(ctx2, r.x + r.w - mw / 2 - (PORT ? 8 : 12), r.y + r.h / 2 + (PORT ? 0 : 4), mw, mh, lv, false, { sx: 1, rot: .06 });
        }
        ctx2.restore();
        if (st.dl && p === D.turn) {
          const f = clamp01(st.dl / ((st.V.rules.timer || app.opt.timer || 1) * 1000));
          ctx2.strokeStyle = f < .25 ? '#ff5b4b' : '#fff'; ctx2.lineWidth = 4; ctx2.beginPath(); ctx2.arc(ax, ay, ar + 5, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx2.stroke();
        }
      }
    }
    function drawStatus(st) {
      const V = st.V; if (!V) return;
      const bar = PORT ? { x: 8, y: 526, w: 344, h: 58 } : { x: 620, y: 502, w: 272, h: 90 };
      ctx2.save();
      rr(ctx2, bar.x, bar.y, bar.w, bar.h, 14); ctx2.fillStyle = 'rgba(8,12,30,.55)'; ctx2.fill();
      let a = '', b = '';
      const mine = st.nd && st.nd.p === st.viewer;
      if (V.phase === 'over') a = 'Game over';
      else if (mine && st.nd.kind === 'draw') { a = 'Your turn'; b = 'Tap the deck or press Space to draw a card'; }
      else if (mine && st.nd.kind === 'split') { a = `Split: ${V.rem} more`; b = `Move another pawn ${V.rem} forward`; }
      else if (mine) { a = `You drew ${V.card === 0 ? 'Sorry!' : V.card}`; b = S_TEXT[V.card] || ''; }
      else {
        const you = V.turn === st.viewer, nm = you ? 'You' : (st.names[V.turn] || 'Player');
        a = V.phase === 'draw' ? `${nm} ${you ? 'are' : 'is'} drawing` : `${nm} drew ${V.card === 0 ? 'Sorry!' : V.card}`;
        b = V.phase === 'draw' ? '' : (S_TEXT[V.card] || '');
        if (st.online && st.nd && st.nd.p >= 0 && !st.cpu[st.nd.p] && V.phase !== 'draw') b = 'Waiting for their move';
      }
      const c = colOf(D.turn) || SORRY_COLS[0], hasPass = mine && st.nd.moves.some(m => m.t === 'pass');
      ctx2.beginPath(); ctx2.arc(bar.x + 18, bar.y + 18, 8, 0, TAU); ctx2.fillStyle = c.main; ctx2.fill(); ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 2; ctx2.stroke();
      text(ctx2, a, bar.x + 34, bar.y + 18, PORT ? 15 : 18, '#fff', 'left');
      const sz = PORT ? 11 : 12.5, lines = b ? wrap(b, bar.w - 24 - (hasPass ? 72 : 0), sz) : [];
      lines.slice(0, PORT ? 2 : 3).forEach((ln, i) => text(ctx2, ln, bar.x + 14, bar.y + 38 + i * (sz + 3), sz, 'rgba(255,255,255,.78)', 'left', null, 700));
      D.pass = null;
      if (hasPass) {
        const pr = { x: bar.x + bar.w - 70, y: bar.y + bar.h - 36, w: 60, h: 28 };
        rr(ctx2, pr.x, pr.y, pr.w, pr.h, 10); ctx2.fillStyle = 'rgba(255,255,255,.16)'; ctx2.fill(); ctx2.strokeStyle = '#fff'; ctx2.lineWidth = 2; ctx2.stroke();
        text(ctx2, 'Pass', pr.x + pr.w / 2, pr.y + pr.h / 2, 14, '#fff', 'center');
        D.pass = pr;
      }
      ctx2.restore();
    }
    function drawBack() {
      const g = ctx2.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#26306a'); g.addColorStop(.5, '#1b2352'); g.addColorStop(1, '#2b1f55');
      ctx2.fillStyle = g; ctx2.fillRect(0, 0, W, H);
      ctx2.globalAlpha = .06; ctx2.fillStyle = '#fff';
      for (let i = 0; i < 34; i++) { const x = (i * 97.3) % W, y = (i * 61.7) % H; ctx2.beginPath(); ctx2.arc(x, y, 14 + (i % 5) * 5, 0, TAU); ctx2.fill(); }
      ctx2.globalAlpha = 1;
    }
    function draw(ctx, t, dt, st) {
      ctx2 = ctx; T += dt;
      for (let i = D.later.length - 1; i >= 0; i--) if (T >= D.later[i].at) { const f = D.later[i].fn; D.later.splice(i, 1); f(); }
      for (let i = D.movers.length - 1; i >= 0; i--) {
        const m = D.movers[i], ms = (T - m.t0) * 1000, r = pathAt(m.path, ms);
        if (!m.spin && r.i !== m.seg) { m.seg = r.i; if (m.path.segs.length > 1 && (r.i > 0 || ms > 0)) snd.hop(); }
        if (ms >= m.total) {
          D.pos[m.p][m.k] = m.to; D.movers.splice(i, 1);
          if (!m.spin && m.to !== -1) snd.land();
        }
      }
      drawBack();
      if (!bg) drawBoard();
      ctx.drawImage(bg, bx - 6, by - 6, bs + 12, bs + 12);
      drawLabels();
      if (st.scene !== 'game') {
        for (let p = 0; p < 4; p++) for (let k = 0; k < 4; k++) { const xy = posXY(p, k, -1), q = P(xy[0], xy[1]); drawPawn(ctx, q[0], q[1] + cs * .1, cs * .36, SORRY_COLS[p].main); }
        fx.draw(ctx, dt);
        return;
      }
      drawCenter(st);
      drawTargets(st);
      drawPawns(st);
      fx.draw(ctx, dt);
      drawCards(st);
      drawStatus(st);
    }
    function pick(x, y) {
      const V = app.view();
      if (!V || V.phase === 'over' || !app.idleNow()) return null;
      const nd = G_SORRY.need(V);
      if (!nd || nd.p !== app.viewer) return null;
      if (nd.kind === 'draw') {
        const [dw, dh] = cardWH();
        for (const c of [deckC(), discC()]) if (Math.abs(x - c[0]) < dw * .75 && Math.abs(y - c[1]) < dh * .65) return { m: nd.moves[0] };
        const r = cardRect(app.viewer);
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return { m: nd.moves[0] };
        return null;
      }
      if (D.pass && x >= D.pass.x && x <= D.pass.x + D.pass.w && y >= D.pass.y && y <= D.pass.y + D.pass.h) return { m: nd.moves.find(m => m.t === 'pass') };
      const tg = D.tx.filter(o => Math.hypot(x - o.pt[0], y - o.pt[1]) < cs * .62).sort((a, b) => Math.hypot(x - a.pt[0], y - a.pt[1]) - Math.hypot(x - b.pt[0], y - b.pt[1]));
      let near = null, bd = 1e9;
      for (const it of D.items || []) {
        if (!it.mine || !it.q) continue;
        const d = Math.hypot(x - it.q[0], y - (it.q[1] - it.r * 1.1));
        if (d < Math.max(it.r * 1.9, cs * .6) && d < bd) { bd = d; near = it; }
      }
      if (near && (!tg.length || near.mine)) {
        const startK = V.pos[nd.p].indexOf(-1), k = near.pos < 0 ? startK : near.k;
        const mv = nd.moves.filter(m => m.k === k);
        if (mv.length === 1) return { m: mv[0] };
        if (mv.length > 1) return { sel: k };
      }
      if (tg.length) {
        let c = tg.filter(o => D.sel < 0 || o.m.k === D.sel);
        if (!c.length) c = tg;
        const first = c[0].m;
        const same = c.filter(o => o.m.to === first.to && o.m.t === first.t && o.m.q === first.q && o.m.j === first.j);
        if (same.length === 1) return { m: first };
        return { amb: true };
      }
      return null;
    }
    return {
      dims,
      resize(w, h, port, dpr) { W = w; H = h; PORT = port; DPR = dpr; layout(); drawBoard(); },
      reset, settle, event, draw,
      win() { fx.confetti(W, ['#e0392f', '#2870d8', '#f3c010', '#27a24a', '#fff'], 120); },
      cursor(x, y) { return pick(x, y) != null; },
      pt(m, mode) {
        if (m.t === 'draw') { const c = deckC(); return [c[0], c[1]]; }
        if (m.t === 'pass') return D.pass ? [D.pass.x + D.pass.w / 2, D.pass.y + D.pass.h / 2] : null;
        if (mode === 'pawn') { const V = app.view(), k = V.pos[V.turn][m.k] < 0 ? V.pos[V.turn].indexOf(-1) : m.k; const it = (D.items || []).find(i => i.p === V.turn && i.k === k && !i.mv); return it && it.q ? [it.q[0], it.q[1] - it.r * 1.1] : null; }
        const o = D.tx.find(o => same(o.m, m));
        return o ? [o.pt[0], o.pt[1]] : null;
      },
      pointer(x, y, type) {
        if (type !== 'down') return false;
        D.kb = false;
        const h = pick(x, y);
        if (!h) { if (D.sel >= 0) { D.sel = -1; return true; } return false; }
        if (h.sel != null) { D.sel = D.sel === h.sel ? -1 : h.sel; snd.tick(); return true; }
        if (h.amb) { app.toast('Tap the pawn you want to move first'); snd.bad(); return true; }
        D.sel = -1;
        return app.act(h.m);
      },
      key(code) {
        const V = app.view(), nd = V && V.phase !== 'over' ? G_SORRY.need(V) : null;
        if (!nd || nd.p !== app.viewer || !app.idleNow()) return false;
        if (nd.kind === 'draw') { if (code === 'Space' || code === 'Enter') return app.act(nd.moves[0]); return false; }
        if (nd.auto) return false;
        const m = nd.moves;
        if (code === 'Space' || code === 'Enter') { const mv = m[D.mi % m.length]; D.kb = false; return app.act(mv); }
        if (code === 'Tab' || code === 'ArrowRight' || code === 'ArrowDown') { D.kb = true; D.sel = -1; D.mi = (D.mi + 1) % m.length; snd.tick(); return true; }
        if (code === 'ArrowLeft' || code === 'ArrowUp') { D.kb = true; D.sel = -1; D.mi = (D.mi + m.length - 1) % m.length; snd.tick(); return true; }
        if (code === 'KeyP') { const mv = m.find(x => x.t === 'pass'); if (mv) return app.act(mv); }
        return false;
      }
    };
  }

  const SORRY_HELP = `<p><b>Goal:</b> get all four of your pawns from Start, around the board and into Home before anyone else.</p>
<p><b>Your turn:</b> draw a card and move as it says. A <b>2</b> lets you draw again. You must move if you can, otherwise the turn passes.</p>
<p><b>Cards:</b> <b>1</b> or <b>2</b> take a pawn out of Start, or move forward. <b>3, 5, 8, 12</b> move forward. <b>4</b> moves backward. <b>7</b> moves one pawn 7 forward, or splits the 7 between two pawns (never to leave Start). <b>10</b> is forward 10 or back 1. <b>11</b> is forward 11, or swap places with an opponent's pawn (you may stay put if you cannot move 11). <b>Sorry!</b> takes a pawn from Start to an opponent's square and sends their pawn back to Start.</p>
<p><b>Bumping:</b> landing on an opponent's pawn sends it back to Start. You can never land on your own pawn.</p>
<p><b>Slides:</b> land on the start of a slide of another colour and you shoot to its end, bumping every pawn along it, even your own.</p>
<p><b>Safety zone:</b> the five coloured squares in front of Home are safe. You need the exact count to reach Home. You cannot go backward into the safety zone.</p>
<p><b>Controls:</b> tap the deck to draw, tap a glowing pawn and then a ringed square. <kbd>Space</kbd> draw or play, <kbd>Tab</kbd> or arrows cycle the moves, <kbd>P</kbd> pass.</p>`;
  const G_SORRY = {
    id: 'sorry', title: 'Sorry!', tag: 'Draw a card, race your pawns home and bump everyone else back to Start.',
    minN: 2, maxN: 4, defN: 4, sizes: [2, 3, 4], diffs: ['Easy', 'Normal', 'Hard'], rotates: true,
    colors: SORRY_COLS, rulesDef: SORRY_RULES, help: SORRY_HELP,
    optSchema: [
      { k: 'extra2', label: 'Draw again on 2', hint: '', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'slides', label: 'Slides', hint: 'Shoot along other colours\' slides', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'split7', label: 'Split the 7', hint: '', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'start1', label: 'Pawn out at start', hint: 'Everyone begins with one pawn out', vals: [[false, 'Off'], [true, 'On']] },
      { k: 'auto', label: 'Auto-move', hint: 'Skip the choice when only one move', vals: [[false, 'Off'], [true, 'On']] }
    ],
    Engine: sorryEngine, need: sorryNeed, ai: sorryAi,
    auto: (s, nd, R) => nd.kind === 'draw' ? nd.moves[0] : sorryAi(s, nd, 'Normal', R),
    think: nd => nd.kind === 'draw' ? [350, 600] : [550, 950],
    endStat: (V, p) => V.pos[p].filter(v => v === 200).length + '/4 home',
    renderer: sorryRenderer
  };

  const TH_LUDO = { shadow: 'rgba(20,20,70,.35)', bg: '#1b2352', box: 'linear-gradient(#35407a,#222a5c)', accent: '#ffd84a', stroke: '#b6231a' };
  const TH_SNL = { shadow: 'rgba(20,50,30,.35)', bg: '#1f4a36', box: 'linear-gradient(#2e6a4c,#1c4733)', accent: '#ffe14a', stroke: '#1e6b3a' };
  const TH_SORRY = { shadow: 'rgba(60,20,20,.35)', bg: '#1b2352', box: 'linear-gradient(#35407a,#222a5c)', accent: '#ff7a5a', stroke: '#6b100a' };
  const fmtWins = v => v + (v === 1 ? ' win' : ' wins');
  const ICON_LUDO = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="5"/><path d="M26 10v44M38 10v44M10 26h44M10 38h44"/><circle cx="32" cy="32" r="4"/></svg>';
  const ICON_SNL = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 56V12M30 56V12M16 22h14M16 34h14M16 46h14"/><path d="M42 54c12-4 12-14 0-16s-12-10 0-14 10-8 4-12"/></svg>';
  const ICON_SORRY = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="8" width="30" height="42" rx="4" transform="rotate(-10 29 29)"/><path d="M32 56h24"/><circle cx="46" cy="44" r="6"/><path d="M46 30v8"/></svg>';

  Ameplay.register({
    id: 'ludo', title: 'Ludo', category: 'Board', tint: '#e5322d',
    blurb: 'Roll a 6, race four pawns round the cross-shaped board and capture your rivals. 2 to 4 players.',
    help: 'Tap the dice to roll · tap a glowing pawn to move · <kbd>Space</kbd> roll or move · <kbd>Tab</kbd> next pawn',
    width: 900, format: fmtWins, icon: ICON_LUDO,
    _t: { ludoEngine, ludoNeed, ludoAi, ludoLegal, LUDO_RULES, LR, G_LUDO },
    css: baseCss('ludo', TH_LUDO),
    mount: mountGame(G_LUDO)
  });
  Ameplay.register({
    id: 'snakes-ladders', title: 'Snakes and Ladders', category: 'Board', tint: '#25a64a',
    blurb: 'Climb ladders, dodge snakes and race to square 100. 2 to 6 players with exact finish and bounce options.',
    help: 'Tap the dice or <kbd>Space</kbd> to roll · rules in the menu',
    width: 900, format: fmtWins, icon: ICON_SNL,
    _t: { snlEngine, snlNeed, SNL_BOARDS, snlRandomBoard, G_SNL },
    css: baseCss('snakes-ladders', TH_SNL),
    mount: mountGame(G_SNL)
  });
  Ameplay.register({
    id: 'sorry', title: 'Sorry!', category: 'Board', tint: '#e0392f',
    blurb: 'Draw a card, race your pawns home, slide and bump everyone else back to Start. 2 to 4 players.',
    help: 'Tap the deck to draw · tap a glowing pawn then a ringed square · <kbd>Space</kbd> draw or play · <kbd>Tab</kbd> next move · <kbd>P</kbd> pass',
    width: 900, format: fmtWins, icon: ICON_SORRY,
    _t: { sorryEngine, sorryNeed, sorryAi, sMoves, sApply, sFwd, sBack, sProg, S_DECK, SORRY_RULES, G_SORRY },
    css: baseCss('sorry', TH_SORRY),
    mount: mountGame(G_SORRY)
  });

  const CF = 'Nunito, Arial Rounded MT Bold, Arial, sans-serif';
  const coverPawn = (x, y, c, d) => `<g transform="translate(${x} ${y})"><ellipse cy="9" rx="9" ry="3" fill="#000" opacity=".3"/><path d="M-8 8C-8 2-3 2-3-8h6C3 2 8 2 8 8Z" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle cy="-12" r="6.5" fill="${c}" stroke="${d}" stroke-width="1.5"/></g>`;
  const coverDie = (x, y, r, sz, pips) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="${sz * .2}" fill="#000" opacity=".3" transform="translate(4 6)"/><rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="${sz * .2}" fill="#fbfaf5" stroke="#c9c6b8" stroke-width="2"/><g fill="#1d1f2a">${pips.map(q => `<circle cx="${q[0] * sz * .27}" cy="${q[1] * sz * .27}" r="${sz * .09}"/>`).join('')}</g></g>`;
  const P5 = [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]];
  Ameplay.covers['ludo'] = (() => {
    const col = ['#e5322d', '#1fa646', '#f6bf10', '#1f6fe0'], bx = 88, by = 8, u = 19.2;
    let s = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ldc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d3a7d"/><stop offset="1" stop-color="#171d44"/></linearGradient></defs><rect width="400" height="300" fill="url(#ldc-g)"/>`;
    s += `<rect x="${bx - 5}" y="${by - 5}" width="${u * 15 + 10}" height="${u * 15 + 10}" rx="10" fill="#5a3418"/><rect x="${bx}" y="${by}" width="${u * 15}" height="${u * 15}" rx="5" fill="#fbf6e9"/>`;
    [[0, 0], [9, 0], [9, 9], [0, 9]].forEach((b, i) => {
      s += `<rect x="${bx + b[0] * u}" y="${by + b[1] * u}" width="${6 * u}" height="${6 * u}" fill="${col[i]}"/><rect x="${bx + (b[0] + .9) * u}" y="${by + (b[1] + .9) * u}" width="${4.2 * u}" height="${4.2 * u}" rx="6" fill="#fff"/>`;
      [[1.95, 1.95], [1.95, 4.05], [4.05, 1.95], [4.05, 4.05]].forEach(q => { s += `<circle cx="${bx + (b[0] + q[0]) * u}" cy="${by + (b[1] + q[1]) * u}" r="${u * .55}" fill="${col[i]}" opacity=".85"/>`; });
    });
    s += `<g fill="#fffefa" stroke="#b9b3a2" stroke-width=".8">`;
    for (let i = 0; i < 6; i++) for (const [x, y] of [[6, i], [7, i], [8, i], [6, 9 + i], [7, 9 + i], [8, 9 + i], [i, 6], [i, 7], [i, 8], [9 + i, 6], [9 + i, 7], [9 + i, 8]]) s += `<rect x="${bx + x * u}" y="${by + y * u}" width="${u}" height="${u}"/>`;
    s += `</g>`;
    for (let i = 1; i <= 5; i++) s += `<rect x="${bx + i * u}" y="${by + 7 * u}" width="${u}" height="${u}" fill="${col[0]}"/><rect x="${bx + 7 * u}" y="${by + i * u}" width="${u}" height="${u}" fill="${col[1]}"/><rect x="${bx + (14 - i) * u}" y="${by + 7 * u}" width="${u}" height="${u}" fill="${col[2]}"/><rect x="${bx + 7 * u}" y="${by + (14 - i) * u}" width="${u}" height="${u}" fill="${col[3]}"/>`;
    const tri = (a, b, c, f) => `<path d="M${bx + a[0] * u} ${by + a[1] * u}L${bx + b[0] * u} ${by + b[1] * u}L${bx + c[0] * u} ${by + c[1] * u}Z" fill="${f}"/>`;
    const m = [7.5, 7.5];
    s += tri([6, 6], [6, 9], m, col[0]) + tri([6, 6], [9, 6], m, col[1]) + tri([9, 6], [9, 9], m, col[2]) + tri([6, 9], [9, 9], m, col[3]);
    s += coverPawn(bx + 3.5 * u, by + 6.7 * u, col[0], '#7a0f0a') + coverPawn(bx + 9.4 * u, by + 11.2 * u, col[3], '#0b2f73');
    s += coverDie(335, 220, -12, 68, P5);
    s += `<text x="44" y="262" font-family="${CF}" font-weight="900" font-size="44" fill="#ffd84a" stroke="#7a1a10" stroke-width="7" paint-order="stroke" text-anchor="middle" transform="rotate(-8 44 262)">Ludo</text></svg>`;
    return s;
  })();
  Ameplay.covers['snakes-ladders'] = (() => {
    const bx = 70, by = 14, u = 26, pal = ['#ffe9a8', '#bfe8c7', '#bcd8f5', '#f8c9c9'];
    let s = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="slc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d7a52"/><stop offset="1" stop-color="#17432f"/></linearGradient></defs><rect width="400" height="300" fill="url(#slc-g)"/>`;
    s += `<rect x="${bx - 6}" y="${by - 6}" width="${u * 10 + 12}" height="${u * 10 + 12}" rx="10" fill="#6b4020"/>`;
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) s += `<rect x="${bx + c * u}" y="${by + r * u}" width="${u}" height="${u}" fill="${pal[(r + c) % 4]}"/>`;
    const sq = n => { const r = Math.floor((n - 1) / 10), c = (n - 1) % 10; return [bx + (r % 2 ? 9 - c : c) * u + u / 2, by + (9 - r) * u + u / 2]; };
    const lad = (a, b) => {
      const p = sq(a), q = sq(b), dx = q[1] - p[1], dy = p[0] - q[0], l = Math.hypot(dx, dy) || 1, nx = dx / l * 5, ny = dy / l * 5;
      let g = `<g stroke="#8a4b17" stroke-width="3" stroke-linecap="round"><line x1="${p[0] - nx}" y1="${p[1] - ny}" x2="${q[0] - nx}" y2="${q[1] - ny}"/><line x1="${p[0] + nx}" y1="${p[1] + ny}" x2="${q[0] + nx}" y2="${q[1] + ny}"/>`;
      for (let i = 1; i < 6; i++) { const t = i / 6; g += `<line x1="${lerp(p[0], q[0], t) - nx}" y1="${lerp(p[1], q[1], t) - ny}" x2="${lerp(p[0], q[0], t) + nx}" y2="${lerp(p[1], q[1], t) + ny}" stroke-width="2.4"/>`; }
      return g + `</g>`;
    };
    s += lad(4, 36) + lad(28, 84) + lad(51, 91);
    const snk = (a, b, col) => {
      const p = sq(a), q = sq(b), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, d = `M${p[0]} ${p[1]}C${mx + 40} ${my - 30} ${mx - 40} ${my + 10} ${q[0]} ${q[1]}`;
      return `<path d="${d}" fill="none" stroke="#1d1f2a" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 5"/><circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${col}" stroke="#1d1f2a" stroke-width="2.5"/><circle cx="${p[0] - 2.5}" cy="${p[1] - 2}" r="1.8" fill="#fff"/><circle cx="${p[0] + 2.5}" cy="${p[1] - 2}" r="1.8" fill="#fff"/>`;
    };
    s += snk(97, 61, '#e0443a') + snk(74, 33, '#9b4fc9') + snk(47, 12, '#1fa0a0');
    s += coverPawn(sq(22)[0], sq(22)[1], '#e5322d', '#6e0f0a') + coverPawn(sq(58)[0], sq(58)[1], '#2a74e6', '#0b2f73');
    s += coverDie(352, 84, 10, 60, P5);
    s += `<text x="352" y="190" font-family="${CF}" font-weight="900" font-size="30" fill="#ffe14a" stroke="#1b4a2c" stroke-width="6" paint-order="stroke" text-anchor="middle">100</text></svg>`;
    return s;
  })();
  Ameplay.covers['sorry'] = (() => {
    const bx = 100, by = 10, u = 17.4, col = ['#e0392f', '#2870d8', '#f3c010', '#27a24a'], dir = [[0, 1], [-1, 0], [0, -1], [1, 0]];
    let s = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="soc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d3a7d"/><stop offset="1" stop-color="#171d44"/></linearGradient></defs><rect width="400" height="300" fill="url(#soc-g)"/>`;
    s += `<rect x="${bx - 5}" y="${by - 5}" width="${u * 16 + 10}" height="${u * 16 + 10}" rx="10" fill="#101530"/><rect x="${bx}" y="${by}" width="${u * 16}" height="${u * 16}" rx="5" fill="#f4f0e2"/>`;
    for (let i = 0; i < 60; i++) {
      const q = sRing(i), side = Math.floor(i / 15), j = i % 15, sl = (j >= 1 && j <= 4) || (j >= 9 && j <= 13);
      s += `<rect x="${bx + q[0] * u}" y="${by + q[1] * u}" width="${u}" height="${u}" fill="${sl ? col[side] : '#fffdf6'}" fill-opacity="${sl ? .4 : 1}" stroke="#a9a28d" stroke-width=".6"/>`;
    }
    for (let k = 0; k < 4; k++) {
      for (let i = 1; i <= 5; i++) { const q = sSafe(k, i); s += `<rect x="${bx + q[0] * u}" y="${by + q[1] * u}" width="${u}" height="${u}" fill="${col[k]}" stroke="#fff" stroke-width=".6"/>`; }
      const h = sHomeC(k), st = sStartC(k);
      s += `<circle cx="${bx + h[0] * u}" cy="${by + h[1] * u}" r="${u * .9}" fill="${col[k]}" stroke="#fff" stroke-width="1.5"/><circle cx="${bx + st[0] * u}" cy="${by + st[1] * u}" r="${u * 1.05}" fill="#fff" stroke="${col[k]}" stroke-width="2.5"/>`;
    }
    const at = (c, pos) => { const q = sRing(pos); return [bx + (q[0] + .5) * u, by + (q[1] + .5) * u]; };
    const pp = [[at(0, 6), 0, '#6e0f0a'], [at(1, 25), 1, '#0b2f73'], [at(2, 41), 2, '#7a5a00'], [at(3, 51), 3, '#0c4a1a']];
    pp.forEach(a => { s += coverPawn(a[0][0], a[0][1] - 2, col[a[1]], a[2]); });
    s += `<g transform="translate(305 172) rotate(12)"><rect x="-38" y="-54" width="76" height="108" rx="9" fill="#000" opacity=".3" transform="translate(4 6)"/><rect x="-38" y="-54" width="76" height="108" rx="9" fill="#fffdf6" stroke="#222637" stroke-width="3"/><text y="10" font-family="${CF}" font-weight="900" font-size="24" fill="#222637" text-anchor="middle">Sorry!</text></g>`;
    s += `<g transform="translate(78 196) rotate(-14)"><rect x="-32" y="-46" width="64" height="92" rx="8" fill="#000" opacity=".3" transform="translate(4 6)"/><rect x="-32" y="-46" width="64" height="92" rx="8" fill="#fffdf6" stroke="#2870d8" stroke-width="3"/><text y="22" font-family="${CF}" font-weight="900" font-size="64" fill="#2870d8" text-anchor="middle">7</text></g>`;
    s += `<text x="200" y="172" font-family="${CF}" font-weight="900" font-size="36" fill="#e0392f" stroke="#fff" stroke-width="6" paint-order="stroke" text-anchor="middle">Sorry!</text></svg>`;
    return s;
  })();
})();
