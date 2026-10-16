
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
  const font = (w, s) => `${w} ${s}px Nunito, system-ui, sans-serif`;
  const isMuted = () => { const b = document.querySelector('[data-sound]'); return !!b && b.getAttribute('aria-pressed') === 'false'; };
  const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

  function makeAudio() {
    let ac = null;
    return {
      get() {
        if (isMuted()) return null;
        try {
          if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
          if (ac.state === 'suspended') { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); }
          return ac;
        } catch (e) { return null; }
      },
      close() {
        if (!ac) return;
        try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
        ac = null;
      }
    };
  }
  function tone(ac, type, f0, f1, dur, vol) {
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  }


  const BR = 11, PW = 880, PH = 500, X0 = 60, Y0 = 60, X1 = 820, Y1 = 440, MX = 440, MY = 250, TL = X1 - X0;
  const VMAX = 1500, FK1 = 95, FK2 = 0.2, HSTEP = 1 / 120, E_BALL = 0.95, E_RAIL = 0.8, CM = 27, SM = 18;
  const HEADX = X0 + TL / 4, FOOTX = X0 + TL * 0.75;
  const POCK = [[X0 - 5, Y0 - 5], [MX, Y0 - 12], [X1 + 5, Y0 - 5], [X0 - 5, Y1 + 5], [MX, Y1 + 12], [X1 + 5, Y1 + 5]];
  const PAIM = [
    [[X0 - 3, Y0 - 3], [X0 - 2, Y0 + 8], [X0 + 8, Y0 - 2]],
    [[MX, Y0 - 8], [MX - 5, Y0 - 8], [MX + 5, Y0 - 8]],
    [[X1 + 3, Y0 - 3], [X1 + 2, Y0 + 8], [X1 - 8, Y0 - 2]],
    [[X0 - 3, Y1 + 3], [X0 - 2, Y1 - 8], [X0 + 8, Y1 + 2]],
    [[MX, Y1 + 8], [MX - 5, Y1 + 8], [MX + 5, Y1 + 8]],
    [[X1 + 3, Y1 + 3], [X1 + 2, Y1 - 8], [X1 - 8, Y1 + 2]]
  ];
  const SEGS = [];
  for (const [y, s] of [[Y0, -1], [Y1, 1]]) SEGS.push(
    [X0 + CM, y, MX - SM, y], [MX + SM, y, X1 - CM, y],
    [X0 + CM, y, X0 + CM - 18, y + s * 18], [X1 - CM, y, X1 - CM + 18, y + s * 18],
    [MX - SM, y, MX - SM + 4, y + s * 20], [MX + SM, y, MX + SM - 4, y + s * 20]);
  for (const [x, s] of [[X0, -1], [X1, 1]]) SEGS.push(
    [x, Y0 + CM, x, Y1 - CM], [x, Y0 + CM, x + s * 18, Y0 + CM - 18], [x, Y1 - CM, x + s * 18, Y1 - CM + 18]);

  const grp = n => (n === 0 ? 0 : n < 8 ? 1 : n === 8 ? 8 : 2);
  const GNAME = ['Open table', 'Solids', 'Stripes'];
  const newEv = () => ({ first: null, rail: false, pocketed: [], pk8: -1, hit: null });
  const moving = B => B.some(b => b.on && (b.vx || b.vy || b.fx || b.fy));
  const left = (B, g) => B.reduce((c, b) => c + (b.on && grp(b.n) === g ? 1 : 0), 0);
  const mkBall = n => ({ n, x: 0, y: 0, vx: 0, vy: 0, on: true, fx: 0, fy: 0, sF: 0, sS: 0, rx: 0, ry: 0, fall: 0 });

  function rack() {
    const B = [];
    for (let n = 0; n < 16; n++) B.push(mkBall(n));
    const rest = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15].sort(() => Math.random() - 0.5);
    const so = rest.splice(rest.findIndex(n => n < 8), 1)[0], st = rest.splice(rest.findIndex(n => n > 8), 1)[0];
    const slot = Array(15);
    slot[4] = 8;
    [slot[10], slot[14]] = Math.random() < 0.5 ? [so, st] : [st, so];
    for (let i = 0; i < 15; i++) if (slot[i] == null) slot[i] = rest.pop();
    const d = 2 * BR + 0.15;
    for (let k = 0, i = 0; k < 5; k++) for (let j = 0; j <= k; j++, i++) {
      const b = B[slot[i]];
      b.x = FOOTX + k * d * Math.sqrt(3) / 2; b.y = MY + (j - k / 2) * d;
    }
    B[0].x = HEADX - 40; B[0].y = MY;
    return B;
  }

  function pStep(B, ev) {
    let mv = 0;
    for (const b of B) if (b.on) { const s = b.vx * b.vx + b.vy * b.vy; if (s > mv) mv = s; }
    const n = Math.min(32, Math.max(1, Math.ceil(Math.sqrt(mv) * HSTEP / (BR * 0.3)))), dt = HSTEP / n;
    for (let k = 0; k < n; k++) {
      for (const b of B) {
        if (!b.on) continue;
        if (b.fx || b.fy) {
          const q = Math.min(1, dt * 7);
          b.vx += b.fx * q; b.vy += b.fy * q; b.fx -= b.fx * q; b.fy -= b.fy * q;
          if (Math.abs(b.fx) + Math.abs(b.fy) < 1) b.fx = b.fy = 0;
        }
        if (!b.vx && !b.vy) continue;
        const mx = b.vx * dt, my = b.vy * dt;
        b.x += mx; b.y += my; b.rx += mx; b.ry += my;
        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), ns = sp - (FK1 + FK2 * sp) * dt;
        if (ns <= 2) b.vx = b.vy = 0;
        else { const f = ns / sp; b.vx *= f; b.vy *= f; }
        if (b.sF) b.sF *= 1 - dt * 0.4;
      }
      for (let i = 0; i < B.length; i++) {
        const a = B[i];
        if (!a.on) continue;
        for (let j = i + 1; j < B.length; j++) {
          const c = B[j];
          if (!c.on) continue;
          const dx = a.x - c.x, dy = a.y - c.y, d2 = dx * dx + dy * dy;
          if (d2 >= 4 * BR * BR || d2 < 1e-9) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, o = BR - d / 2;
          a.x += nx * o; a.y += ny * o; c.x -= nx * o; c.y -= ny * o;
          const vr = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny;
          if (vr >= 0) continue;
          const cue = a.n === 0 ? a : c.n === 0 ? c : null, first = ev && ev.first == null && cue;
          const cvx = first ? cue.vx : 0, cvy = first ? cue.vy : 0;
          const J = -(1 + E_BALL) / 2 * vr;
          a.vx += J * nx; a.vy += J * ny; c.vx -= J * nx; c.vy -= J * ny;
          if (!ev) continue;
          if (first) {
            ev.first = (cue === a ? c : a).n;
            const sp = Math.hypot(cvx, cvy);
            if (cue.sF && sp > 0) {
              const ux = cvx / sp, uy = cvy / sp, m = cue.sF * sp * (0.15 + 0.6 * Math.abs(ux * nx + uy * ny));
              cue.fx = ux * m; cue.fy = uy * m;
            }
            cue.sF = 0;
          }
          if (ev.hit) ev.hit(0, -vr);
        }
      }
      for (const b of B) {
        if (!b.on || (b.x > X0 + BR + 0.5 && b.x < X1 - BR - 0.5 && b.y > Y0 + BR + 0.5 && b.y < Y1 - BR - 0.5)) continue;
        for (const s of SEGS) {
          const ax = s[0], ay = s[1], ex = s[2] - ax, ey = s[3] - ay;
          let t = ((b.x - ax) * ex + (b.y - ay) * ey) / (ex * ex + ey * ey);
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const dx = b.x - ax - ex * t, dy = b.y - ay - ey * t, d2 = dx * dx + dy * dy;
          if (d2 >= BR * BR || d2 < 1e-9) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
          b.x += nx * (BR - d); b.y += ny * (BR - d);
          const vn = b.vx * nx + b.vy * ny;
          if (vn >= 0) continue;
          b.vx -= (1 + E_RAIL) * vn * nx; b.vy -= (1 + E_RAIL) * vn * ny;
          const vt = -b.vx * ny + b.vy * nx;
          b.vx += ny * vt * 0.08; b.vy -= nx * vt * 0.08;
          if (b.sS) { const kk = b.sS * -vn * 0.4; b.vx += ny * kk; b.vy -= nx * kk; b.sS *= 0.5; }
          if (ev) { if (ev.first != null) ev.rail = true; if (ev.hit) ev.hit(1, -vn); }
        }
        if (b.x < X0 - 2 || b.x > X1 + 2 || b.y < Y0 - 2 || b.y > Y1 + 2) {
          let bi = 0, bd = 1e9;
          for (let i = 0; i < 6; i++) { const q = (POCK[i][0] - b.x) ** 2 + (POCK[i][1] - b.y) ** 2; if (q < bd) { bd = q; bi = i; } }
          b.on = false; b.pk = bi; b.fall = 0.001; b.ox = b.x; b.oy = b.y; b.vx = b.vy = b.fx = b.fy = 0;
          if (ev) { ev.pocketed.push(b.n); if (b.n === 8) ev.pk8 = bi; if (ev.hit) ev.hit(2, 1); }
        }
      }
    }
  }


  function judge(st, B, ev) {
    const g = st.groups[st.turn], pot = ev.pocketed, obj = pot.filter(n => n && n !== 8);
    let foul = '';
    if (pot.includes(0)) foul = 'Scratch';
    else if (ev.first == null) foul = 'No ball hit';
    else if (g ? (st.onEight ? ev.first !== 8 : grp(ev.first) !== g) : ev.first === 8 && !st.brk) foul = 'Wrong ball first';
    else if (!pot.length && !ev.rail) foul = 'No rail after contact';
    const r = { foul, cont: false, win: false, lose: false, assign: 0, respot8: false, why: '' };
    if (pot.includes(8)) {
      if (st.brk) r.respot8 = true;
      else {
        r.why = !st.onEight ? 'early' : foul ? 'foul' : st.call >= 0 && ev.pk8 !== st.call ? 'pocket' : '';
        r[r.why ? 'lose' : 'win'] = true;
        return r;
      }
    }
    if (!g && !st.brk && !foul && obj.length) r.assign = grp(obj[0]);
    const mine = g || r.assign;
    r.cont = !foul && (st.brk ? obj.length > 0 : obj.some(n => grp(n) === mine));
    return r;
  }

  const nearPocket = b => { let bi = 0, bd = 1e9; for (let i = 0; i < 6; i++) { const q = (POCK[i][0] - b.x) ** 2 + (POCK[i][1] - b.y) ** 2; if (q < bd) { bd = q; bi = i; } } return bi; };
  function strike(c, s) { c.vx = Math.cos(s.a) * s.p * VMAX; c.vy = Math.sin(s.a) * s.p * VMAX; c.sF = s.sF || 0; c.sS = s.sS || 0; c.fx = c.fy = 0; }
  function simulate(B, shot) {
    const S = B.map(b => ({ n: b.n, x: b.x, y: b.y, vx: 0, vy: 0, on: b.on, fx: 0, fy: 0, sF: 0, sS: 0, rx: 0, ry: 0, fall: 0 }));
    strike(S[0], shot);
    const ev = newEv();
    for (let i = 0; i < 1800 && moving(S); i++) pStep(S, ev);
    return { S, ev };
  }
  function targets(B, g, onE) {
    const o = [];
    for (let n = 1; n < 16; n++) { const b = B[n]; if (b.on && (onE ? n === 8 : g ? grp(n) === g : n !== 8)) o.push(b); }
    return o;
  }
  function clearPath(B, ax, ay, bx, by, s1, s2) {
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, R2 = (2 * BR - 0.5) ** 2;
    for (const o of B) {
      if (!o.on || o.n === s1 || o.n === s2) continue;
      const t = clamp(((o.x - ax) * dx + (o.y - ay) * dy) / L2, 0, 1), qx = ax + dx * t - o.x, qy = ay + dy * t - o.y;
      if (qx * qx + qy * qy < R2) return false;
    }
    return true;
  }
  function potLines(B, cx, cy, g, onE, aims) {
    const res = [];
    for (const t of targets(B, g, onE)) for (let p = 0; p < 6; p++) for (let k = 0; k < aims; k++) {
      const [px, py] = PAIM[p][k];
      let ux = px - t.x, uy = py - t.y;
      const dp = Math.hypot(ux, uy); ux /= dp; uy /= dp;
      if ((p === 1 || p === 4) && Math.abs(uy) < 0.35) continue;
      const gx = t.x - ux * 2 * BR, gy = t.y - uy * 2 * BR, vx = gx - cx, vy = gy - cy, dc = Math.hypot(vx, vy);
      if (dc < 1) continue;
      const cos = (vx * ux + vy * uy) / dc;
      if (cos < 0.25) continue;
      const clear = clearPath(B, cx, cy, gx, gy, 0, t.n) && clearPath(B, t.x, t.y, px, py, t.n, 0);
      res.push({ a: Math.atan2(vy, vx), h: cos * 2 - (dc + dp) / 700 - (clear ? 0 : 3), dc, dp, cos, clear });
    }
    return res.sort((a, b) => b.h - a.h);
  }
  const easyShots = (B, g, onE) => potLines(B, B[0].x, B[0].y, g, onE, 1).filter(l => l.clear && l.cos > 0.5).length;
  const AIL = [
    { k: 3, aims: 1, powers: [0.55], spins: [0], noise: 0.03, pn: 0.12 },
    { k: 6, aims: 2, powers: [0.42, 0.68], spins: [0], noise: 0.011, pn: 0.05 },
    { k: 10, aims: 3, powers: [0.38, 0.6, 0.85], spins: [0, 0.6, -0.6], noise: 0.0035, pn: 0.03 }
  ];
  function aiShots(B, st, lv) {
    const c = B[0], g = st.groups[st.turn], out = [];
    for (const l of potLines(B, c.x, c.y, g, st.onEight, lv.aims).slice(0, lv.k))
      for (const p of lv.powers) for (const s of lv.spins)
        out.push({ a: l.a, p: clamp(p * (0.55 + (l.dc + l.dp * 1.5) / 900), 0.12, 1), sF: s, sS: 0 });
    for (const t of targets(B, g, st.onEight)) out.push({ a: Math.atan2(t.y - c.y, t.x - c.x), p: 0.5, sF: 0, sS: 0 });
    return out;
  }
  function aiValue(B, st, shot) {
    const { S, ev } = simulate(B, shot), r = judge(st, S, ev);
    if (r.lose) return -1e5;
    if (r.win) return 1e5;
    if (r.foul) return -2000;
    const g = r.assign || st.groups[st.turn];
    if (r.cont) return 1000 + 40 * ev.pocketed.length + 60 * Math.min(4, easyShots(S, g, !!g && left(S, g) === 0));
    const og = r.assign ? 3 - r.assign : st.groups[1 - st.turn];
    return -50 * Math.min(4, easyShots(S, og, !!og && left(S, og) === 0));
  }
  function validSpot(B, x, y, kitchen, skip) {
    if (x < X0 + BR + 1 || x > (kitchen ? HEADX : X1 - BR - 1) || y < Y0 + BR + 1 || y > Y1 - BR - 1) return false;
    for (const b of B) if (b.n !== skip && b.on && (b.x - x) ** 2 + (b.y - y) ** 2 < (2 * BR + 1) ** 2) return false;
    return true;
  }
  function freeSpot(B, x, y, kitchen, skip) {
    for (let r = 0; r < 500; r += 5) {
      const n = r ? Math.max(8, Math.round(r / 3)) : 1;
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        if (validSpot(B, px, py, kitchen, skip)) return { x: px, y: py };
      }
    }
    return { x, y };
  }
  function aiPlace(B, st, diff, kitchen) {
    const g = st.groups[st.turn], onE = !!g && left(B, g) === 0;
    let best = null, bh = -1e9;
    if (diff > 0) for (const t of targets(B, g, onE)) for (let p = 0; p < 6; p++) {
      const [px, py] = PAIM[p][0];
      let ux = px - t.x, uy = py - t.y;
      const dp = Math.hypot(ux, uy); ux /= dp; uy /= dp;
      if (((p === 1 || p === 4) && Math.abs(uy) < 0.35) || !clearPath(B, t.x, t.y, px, py, t.n, 0)) continue;
      const gx = t.x - ux * 2 * BR, gy = t.y - uy * 2 * BR, a0 = Math.atan2(uy, ux);
      for (const D of [80, 140]) for (const da of [0, 0.3, -0.3]) {
        const x = gx - Math.cos(a0 + da) * D, y = gy - Math.sin(a0 + da) * D;
        if (!validSpot(B, x, y, kitchen, 0) || !clearPath(B, x, y, gx, gy, 0, t.n)) continue;
        const h = -dp / 300 - Math.abs(da) * 0.5 - D / 1000;
        if (h > bh) { bh = h; best = { x, y }; }
      }
    }
    for (let i = 0; i < 80 && !best; i++) {
      const x = rand(X0 + 20, kitchen ? HEADX : X1 - 20), y = rand(Y0 + 20, Y1 - 20);
      if (validSpot(B, x, y, kitchen, 0)) best = { x, y };
    }
    return best || freeSpot(B, HEADX - 20, MY, kitchen, 0);
  }


  const BHEX = ['#f6f4ec', '#f5c518', '#1f4fc8', '#d42a2a', '#5b2b8a', '#f07a1a', '#178a4c', '#7a1f22', '#18181c'];
  const bhex = n => BHEX[n > 8 ? n - 8 : n];
  const BCOL = Array.from({ length: 16 }, (_, n) => hexRgb(bhex(n)));

  function buildTable(dpr) {
    const cv = document.createElement('canvas');
    cv.width = PW * dpr; cv.height = PH * dpr;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const RW = 36, OX = X0 - RW, OY = Y0 - RW, OW = TL + 2 * RW, OH = Y1 - Y0 + 2 * RW;
    let gr = g.createRadialGradient(PW / 2, PH / 2, 60, PW / 2, PH / 2, Math.hypot(PW, PH) / 2);
    gr.addColorStop(0, '#1d3354'); gr.addColorStop(1, '#12213a');
    g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
    g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
    rrect(g, OX, OY, OW, OH, 22); g.fillStyle = '#4a0d0d'; g.fill(); g.restore();

    g.save(); rrect(g, OX, OY, OW, OH, 22); g.clip();
    gr = g.createLinearGradient(0, OY, 0, OY + OH);
    gr.addColorStop(0, '#9a2a26'); gr.addColorStop(0.5, '#6e1515'); gr.addColorStop(1, '#841f1c');
    g.fillStyle = gr; g.fillRect(OX, OY, OW, OH);
    const quads = [
      [OX, OY, OX + OW, OY, X1 + 12, Y0 - 12, X0 - 12, Y0 - 12, 0, 0, OY, 0, Y0 - 12],
      [OX, OY + OH, OX + OW, OY + OH, X1 + 12, Y1 + 12, X0 - 12, Y1 + 12, 0, 0, OY + OH, 0, Y1 + 12],
      [OX, OY, X0 - 12, Y0 - 12, X0 - 12, Y1 + 12, OX, OY + OH, 1, OX, 0, X0 - 12, 0],
      [OX + OW, OY, X1 + 12, Y0 - 12, X1 + 12, Y1 + 12, OX + OW, OY + OH, 1, OX + OW, 0, X1 + 12, 0]
    ];
    for (const q of quads) {
      g.save(); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); g.lineTo(q[4], q[5]); g.lineTo(q[6], q[7]); g.closePath(); g.clip();
      const vert = q[8], xs = [q[0], q[2], q[4], q[6]], ys = [q[1], q[3], q[5], q[7]];
      const lo = vert ? Math.min(...xs) : Math.min(...ys), hi = vert ? Math.max(...xs) : Math.max(...ys);
      for (let i = 0; i < 34; i++) {
        const o = rand(lo, hi), f = rand(0.004, 0.02), ph = rand(0, TAU), amp = rand(0.4, 2.2);
        g.strokeStyle = Math.random() < 0.72 ? `rgba(40,4,4,${rand(0.07, 0.22).toFixed(3)})` : `rgba(255,170,150,${rand(0.04, 0.1).toFixed(3)})`;
        g.lineWidth = rand(0.5, 1.8);
        g.beginPath();
        const len = vert ? OH : OW;
        for (let k = -12; k <= len + 12; k += 12) {
          const w = Math.sin(k * f + ph) * amp;
          if (vert) k < 0 ? g.moveTo(o + w, OY + k) : g.lineTo(o + w, OY + k);
          else k < 0 ? g.moveTo(OX + k, o + w) : g.lineTo(OX + k, o + w);
        }
        g.stroke();
      }
      gr = g.createLinearGradient(q[9], q[10], q[11], q[12]);
      gr.addColorStop(0, 'rgba(255,225,190,0)'); gr.addColorStop(0.14, 'rgba(255,225,190,.3)'); gr.addColorStop(0.4, 'rgba(255,225,190,.04)');
      gr.addColorStop(0.85, 'rgba(0,0,0,.1)'); gr.addColorStop(1, 'rgba(0,0,0,.36)');
      g.fillStyle = gr; g.fillRect(OX, OY, OW, OH);
      g.restore();
    }
    g.restore();
    rrect(g, OX + 0.75, OY + 0.75, OW - 1.5, OH - 1.5, 21.5); g.strokeStyle = 'rgba(30,14,4,.55)'; g.lineWidth = 1.5; g.stroke();

    const bx = X0 - 12, by = Y0 - 12, bw = TL + 24, bh = Y1 - Y0 + 24;
    gr = g.createRadialGradient(MX, MY, 30, MX, MY, 480);
    gr.addColorStop(0, '#45a9de'); gr.addColorStop(0.6, '#2b87c2'); gr.addColorStop(1, '#1b5f94');
    g.fillStyle = gr; g.fillRect(bx, by, bw, bh);
    const nz = document.createElement('canvas');
    nz.width = nz.height = 128;
    const ng = nz.getContext('2d'), id = ng.createImageData(128, 128);
    for (let i = 0; i < id.data.length; i += 4) {
      const w = Math.random() > 0.5 ? 255 : 0;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = w; id.data[i + 3] = Math.random() * 26;
    }
    ng.putImageData(id, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = g.createPattern(nz, 'repeat'); g.fillRect(bx * dpr, by * dpr, bw * dpr, bh * dpr); g.restore();

    g.strokeStyle = 'rgba(200,235,255,.28)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(HEADX, Y0); g.lineTo(HEADX, Y1); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.4)';
    for (const x of [HEADX, FOOTX]) { g.beginPath(); g.arc(x, MY, 2.2, 0, TAU); g.fill(); }

    const cu = [];
    for (const [y, s] of [[Y0, -1], [Y1, 1]]) {
      const b = y + s * 12;
      cu.push([[X0 + CM, y], [MX - SM, y], [MX - SM + 2.4, b], [X0 + CM - 12, b], 0, -s]);
      cu.push([[MX + SM, y], [X1 - CM, y], [X1 - CM + 12, b], [MX + SM - 2.4, b], 0, -s]);
    }
    for (const [x, s] of [[X0, -1], [X1, 1]]) {
      const b = x + s * 12;
      cu.push([[x, Y0 + CM], [x, Y1 - CM], [b, Y1 - CM + 12], [b, Y0 + CM - 12], -s, 0]);
    }
    for (const c of cu) {
      const [a, b, p2, p3, nx, ny] = c;
      gr = g.createLinearGradient(a[0] - nx * 12, a[1] - ny * 12, a[0], a[1]);
      gr.addColorStop(0, '#11466f'); gr.addColorStop(0.7, '#1e6ea6'); gr.addColorStop(1, '#2a86c2');
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(p2[0], p2[1]); g.lineTo(p3[0], p3[1]); g.closePath();
      g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(190,230,255,.35)'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(a[0] - nx * 1.6, a[1] - ny * 1.6); g.lineTo(b[0] - nx * 1.6, b[1] - ny * 1.6); g.stroke();
      gr = g.createLinearGradient(a[0], a[1], a[0] + nx * 10, a[1] + ny * 10);
      gr.addColorStop(0, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(Math.min(a[0], b[0], a[0] + nx * 10), Math.min(a[1], b[1], a[1] + ny * 10), Math.abs(b[0] - a[0]) + Math.abs(nx * 10), Math.abs(b[1] - a[1]) + Math.abs(ny * 10));
    }
    gr = g.createRadialGradient(MX, MY - 20, 40, MX, MY, 520);
    gr.addColorStop(0, 'rgba(255,255,220,.1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.28)');
    g.fillStyle = gr; g.fillRect(bx, by, bw, bh);
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.strokeRect(bx, by, bw, bh);

    g.save(); g.beginPath(); rrect(g, OX, OY, OW, OH, 22); g.rect(bx, by, bw, bh); g.clip('evenodd');
    for (let i = 0; i < 6; i++) {
      const [px, py] = POCK[i], r = i === 1 || i === 4 ? 17 : 21;
      gr = g.createRadialGradient(px, py, r, px, py, r + 7);
      gr.addColorStop(0, '#15171c'); gr.addColorStop(0.55, '#5d6470'); gr.addColorStop(0.8, '#a9b0bb'); gr.addColorStop(1, 'rgba(120,128,140,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(px, py, r + 7, 0, TAU); g.fill();
    }
    g.restore();
    for (let i = 0; i < 6; i++) {
      const [px, py] = POCK[i], r = i === 1 || i === 4 ? 17 : 21;
      gr = g.createRadialGradient(px, py + (i < 3 ? 4 : -4), 1, px, py, r);
      gr.addColorStop(0, '#000'); gr.addColorStop(0.7, '#080808'); gr.addColorStop(1, '#2a2a2a');
      g.fillStyle = gr; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    const dia = (x, y) => {
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(x, y + 0.8, 2.9, 0, TAU); g.fill();
      const dg = g.createRadialGradient(x - 0.8, y - 0.8, 0.2, x, y, 2.8); dg.addColorStop(0, '#ffffff'); dg.addColorStop(1, '#c9c6e6');
      g.fillStyle = dg; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill();
    };
    for (const k of [1, 2, 3, 5, 6, 7]) { dia(X0 + TL * k / 8, Y0 - 24); dia(X0 + TL * k / 8, Y1 + 24); }
    for (const k of [1, 2, 3]) { dia(X0 - 24, Y0 + (Y1 - Y0) * k / 4); dia(X1 + 24, Y0 + (Y1 - Y0) * k / 4); }
    return cv;
  }
  const CUEL = 420, CUEH = 16;
  function buildCue(dpr, shadow) {
    const pad = shadow ? 8 : 0, cv = document.createElement('canvas');
    cv.width = (CUEL + pad * 2) * dpr; cv.height = (CUEH + pad * 2) * dpr;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr); g.translate(pad, pad);
    const m = CUEH / 2;
    const shape = () => { g.beginPath(); g.moveTo(3, m - 6.2); g.lineTo(CUEL, m - 2.7); g.lineTo(CUEL, m + 2.7); g.lineTo(3, m + 6.2); g.quadraticCurveTo(-1, m, 3, m - 6.2); g.closePath(); };
    if (shadow) {
      if ('filter' in g) g.filter = 'blur(3px)';
      shape(); g.fillStyle = 'rgba(0,0,0,.42)'; g.fill();
      return cv;
    }
    shape(); g.clip();
    const band = (a, b, c) => { g.fillStyle = c; g.fillRect(a, 0, b - a, CUEH); };
    band(0, 16, '#141414');
    band(16, 122, '#28282e');
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
    for (let x = 16; x < 122; x += 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 5, CUEH); g.stroke(); }
    band(122, 128, '#d4d8dd');
    let gr = g.createLinearGradient(128, 0, 252, 0);
    gr.addColorStop(0, '#3a1a0b'); gr.addColorStop(1, '#5e2c13');
    band(128, 252, gr);
    g.fillStyle = '#e9cd93';
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(166, m + s * 7); g.lineTo(166, m + s * 1.2); g.lineTo(250, m + s * 2.8); g.closePath(); g.fill(); }
    band(252, 258, '#eceff2');
    gr = g.createLinearGradient(258, 0, 402, 0);
    gr.addColorStop(0, '#e2c58e'); gr.addColorStop(1, '#f2e1b8');
    band(258, 402, gr);
    band(402, 411, '#f8f4ea');
    band(411, CUEL, '#3f74c9');
    gr = g.createLinearGradient(0, 0, 0, CUEH);
    gr.addColorStop(0, 'rgba(0,0,0,.4)'); gr.addColorStop(0.3, 'rgba(255,255,255,.4)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.5)');
    g.fillStyle = gr; g.fillRect(0, 0, CUEL, CUEH);
    return cv;
  }

  Ameplay.register({
    id: 'pool',
    title: '8-Ball Pool',
    category: 'Sports',
    blurb: 'Sink your solids or stripes, then the 8. Play the CPU or a friend online.',
    help: 'Aim with the mouse or drag on the table · pull the power cue beside the table down and release to shoot (or click and pull back on the table) · drag the roller or hold the rotate buttons to fine-tune · set spin on the cue-ball dial · on the 8, tap a pocket to call it · ball in hand: drag the cue ball · <kbd>←</kbd> <kbd>→</kbd> aim (<kbd>Shift</kbd> fine), <kbd>↑</kbd> <kbd>↓</kbd> power, <kbd>Space</kbd> shoot, <kbd>1</kbd>–<kbd>6</kbd> call a pocket',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="25" cy="39" r="16"/><circle cx="25" cy="39" r="7"/><circle cx="25" cy="36.6" r="2" /><circle cx="25" cy="41.4" r="2.4"/><path d="M42 24 58 8"/><circle cx="50" cy="48" r="5"/></svg>',
    css: `
.gm-pool{gap:10px;padding:12px;border-radius:18px;background:#12213a;color:#fff}
.gm-pool .pl-top{width:100%;max-width:960px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px}
.gm-pool .pl-pl{display:flex;align-items:center;gap:10px;min-width:0;padding:5px 12px 5px 5px;border-radius:14px;background:#08101e;border:2px solid #1f3150;transition:border-color .25s,background .25s,box-shadow .25s}
.gm-pool .pl-pl.r{flex-direction:row-reverse;text-align:right;padding:5px 5px 5px 12px}
.gm-pool .pl-pl.r .pl-balls{justify-content:flex-end}
.gm-pool .pl-pl>div{min-width:0;flex:1}
.gm-pool .pl-pl.on{border-color:#3fd16b;background:#0c1a2f;box-shadow:0 0 0 3px rgba(63,209,107,.18)}
.gm-pool .pl-ring{--t:0;--rc:#22b07d;width:46px;height:46px;flex:none;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--rc) calc(var(--t) * 1turn),rgba(255,255,255,.08) 0)}
.gm-pool .pl-av{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:12px;color:#fff;background:linear-gradient(135deg,#8a7cf5,#5a49d6);box-shadow:inset 0 -3px 0 rgba(0,0,0,.15),0 0 0 2px #fff}
.gm-pool .pl-pl.r .pl-av{background:linear-gradient(135deg,#ff9a6b,#e5533d)}
.gm-pool .pl-nm{font-weight:900;font-size:14px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-pool .pl-nm small{margin-left:6px;font-size:10.5px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#8fa6c8}
.gm-pool .pl-balls{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;min-height:17px}
.gm-pool .pl-balls i{width:17px;height:17px;border-radius:50%;background:var(--c);box-shadow:inset -2px -2px 3px rgba(0,0,0,.28),inset 1px 1px 2px rgba(255,255,255,.45)}
.gm-pool .pl-balls i.s{background:linear-gradient(#f6f4ec 28%,var(--c) 28% 72%,#f6f4ec 72%)}
.gm-pool .pl-balls i.off,.gm-pool .pl-balls i.e{background:#03070f;box-shadow:inset 0 2px 4px rgba(0,0,0,.9),0 0 0 1px #22344f}
.gm-pool .pl-balls em{font-style:normal;font-size:11.5px;font-weight:800;color:#8fa6c8;line-height:17px}
.gm-pool .pl-msg{max-width:260px;padding:9px 16px;border-radius:999px;background:#050b16;border:1px solid #22344f;color:#fff;font-weight:900;font-size:13.5px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-pool .pl-mid{width:100%;max-width:960px;display:flex;align-items:stretch;justify-content:center;gap:10px}
.gm-pool .pl-tab{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center}
.gm-pool .pl-canvas{cursor:crosshair;touch-action:none;background:#12213a;border-radius:0}
.gm-pool .pl-pow{position:relative;width:52px;flex:none;border-radius:18px;background:linear-gradient(90deg,#2a2838,#403d56 50%,#2a2838);box-shadow:inset 0 3px 8px rgba(0,0,0,.45);overflow:hidden;cursor:ns-resize;touch-action:none}
.gm-pool .pl-pow b{position:absolute;inset:0;transform-origin:center top;transform:scaleY(var(--p,0));background:linear-gradient(180deg,#22b07d,#ffc86e 55%,#ef4f4f);opacity:.92}
.gm-pool .pl-pow i{position:absolute;left:50%;top:38px;height:130%;width:12px;margin-left:-6px;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,#3f74c9 0 7px,#f8f4ea 7px 12px,#f2e1b8 12px 34%,#5e2c13 34% 56%,#141414 56%);box-shadow:0 3px 8px rgba(0,0,0,.45);transform:translateY(calc(var(--p,0) * 26%))}
.gm-pool .pl-pow span{position:absolute;left:0;right:0;top:7px;text-align:center;font-weight:900;font-size:10px;line-height:1.15;letter-spacing:.06em;text-transform:uppercase;color:#fff;pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.gm-pool .pl-ctl{width:100%;max-width:960px;display:flex;align-items:center;gap:12px}
.gm-pool .pl-spin{position:relative;width:52px;height:52px;flex:none;border-radius:50%;background:radial-gradient(circle at 34% 28%,#fff,#ece9e0 55%,#b9b4a6);box-shadow:0 6px 14px -6px rgba(0,0,0,.45);cursor:crosshair;touch-action:none}
.gm-pool .pl-spin::after{content:"";position:absolute;inset:50% auto auto 50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:rgba(0,0,0,.18)}
.gm-pool .pl-spin i{position:absolute;z-index:1;width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border-radius:50%;background:#e53935;box-shadow:0 0 0 2px #fff,0 2px 4px rgba(0,0,0,.3);left:calc(50% + var(--x,0) * 50%);top:calc(50% + var(--y,0) * 50%)}
.gm-pool .pl-tip{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#8fa6c8;text-align:center;line-height:1.2}
.gm-pool .pl-roll{position:relative;flex:1;min-width:0;height:46px;border-radius:14px;border:1px solid #22344f;background:repeating-linear-gradient(90deg,#0d1626 0 2px,#2a3a57 2px 10px);background-position:var(--o,0px) 0;box-shadow:inset 0 12px 10px -8px rgba(255,255,255,.18),inset 0 -12px 12px -8px rgba(0,0,0,.6);cursor:ew-resize;touch-action:none;overflow:hidden}
.gm-pool .pl-roll span{position:absolute;inset:0;display:grid;place-items:center;font-weight:900;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#d6e4ff;pointer-events:none;text-shadow:0 1px 2px #000}
.gm-pool .pl-fine{width:46px;height:46px;flex:none;border-radius:50%;border:2px solid #2a3e62;background:#12203a;color:#fff;font:900 22px/1 var(--sans);cursor:pointer;touch-action:none;display:grid;place-items:center;padding:0}
.gm-pool .pl-fine:active{background:#1d3a66;border-color:#3fd16b}
@media (max-width:640px){
.gm-pool{gap:8px}
.gm-pool .pl-ctl,.gm-pool .pl-mid{gap:8px}
.gm-pool .pl-pow{width:46px;border-radius:14px}
.gm-pool .pl-top{grid-template-columns:1fr 1fr;gap:8px}
.gm-pool .pl-msg{grid-column:1/-1;order:-1;justify-self:center;max-width:100%;padding:7px 14px;font-size:12.5px}
.gm-pool .pl-ring{width:36px;height:36px}
.gm-pool .pl-av{width:30px;height:30px;font-size:10px}
.gm-pool .pl-balls{gap:2px}.gm-pool .pl-balls i{width:11px;height:11px}
.gm-pool .pl-nm small{display:block;margin:1px 0 0;font-size:9.5px}
.gm-pool .pl-pl{padding:4px 8px 4px 4px;gap:6px}
.gm-pool .pl-pl.r{padding:4px 4px 4px 8px}
.gm-pool .pl-tip{display:none}
.gm-pool .pl-roll span{font-size:10.5px}
}
.gm-pool~.g-overlay .pl-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}
.gm-pool~.g-overlay .pl-mode{min-height:48px;padding:6px 10px;border-radius:16px;border:2px solid var(--line-2);background:#fff;font:900 14.5px var(--sans);color:var(--ink);cursor:pointer}
.gm-pool~.g-overlay .pl-mode.on{border-color:var(--accent);background:var(--accent);color:#fff;box-shadow:0 8px 18px -10px rgba(108,92,231,.9)}
.gm-pool~.g-overlay .pl-opts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px}
.gm-pool~.g-overlay .pl-diff{height:44px;padding:0 15px;border-radius:999px;border:2px solid var(--line-2);background:#fff;font:800 13.5px var(--sans);color:var(--ink);cursor:pointer}
.gm-pool~.g-overlay .pl-diff.on{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
.gm-pool~.g-overlay .pl-mdesc{display:block;min-height:2.9em}`,
    mount(root, api) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const net = api.net, invited = !!net.invite;
      const MODES = [['ai', 'vs CPU'], ['net', 'Online'], ['practice', 'Practice']];
      const data = api.load() || {};
      let diff = [0, 1, 2].includes(data.diff) ? data.diff : 1, streak = data.streak | 0, inGame = false;
      let pick = invited ? 'net' : MODES.some(m => m[0] === data.mode) ? data.mode : 'ai', timerOn = data.tm !== false;
      if (data.inGame) streak = 0;
      const persist = () => api.save({ diff, streak, inGame, mode: pick, tm: timerOn });
      persist();

      const VERT = matchMedia('(max-width: 700px) and (orientation: portrait)').matches, CW = VERT ? PH : PW, CH = VERT ? PW : PH;

      const plBar = r => `<div class="pl-pl${r ? ' r' : ''}"><span class="pl-ring"><span class="pl-av"></span></span><div><div class="pl-nm"></div><div class="pl-balls"></div></div></div>`;
      root.innerHTML = `<div class="pl-top">${plBar(0)}<div class="pl-msg">8-Ball</div>${plBar(1)}</div><div class="pl-mid"><div class="pl-pow" title="Power: pull down, release to shoot"><b></b><i></i><span>Pull<br>&#9660;</span></div><div class="pl-tab"></div></div><div class="pl-ctl"><div class="pl-spin" title="Cue ball spin: drag the red dot"><i></i></div><div class="pl-tip">Spin</div><div class="pl-roll" title="Fine-tune the aim: drag left or right"><span>&#8249; Fine tune &#8250;</span></div><button type="button" class="pl-fine" data-f="-1" title="Fine aim: rotate left (hold)">&#8634;</button><button type="button" class="pl-fine" data-f="1" title="Fine aim: rotate right (hold)">&#8635;</button></div>`;
      const { canvas: cv, ctx, toLocal } = api.canvas(CW, CH, root.querySelector('.pl-tab'));
      cv.classList.add('pl-canvas');
      cv.style.width = `min(100%, ${CW}px, calc((100dvh - var(--goff, 250px) - ${VERT ? 175 : 150}px) * ${(CW / CH).toFixed(4)}))`;
      const toW = e => { const p = toLocal(e); return VERT ? { x: p.y, y: PH - p.x } : p; };
      const pEls = [...root.querySelectorAll('.pl-pl')], msgEl = root.querySelector('.pl-msg'), ctl = root.querySelector('.pl-ctl');
      const spinEl = ctl.querySelector('.pl-spin'), dotEl = spinEl.firstChild, powEl = root.querySelector('.pl-pow'), rollEl = ctl.querySelector('.pl-roll');
      const au = makeAudio();

      const tableCv = buildTable(dpr), cueCv = buildCue(dpr, false), cueSh = buildCue(dpr, true);
      const shCv = document.createElement('canvas'), SS = Math.ceil(BR * 3 * dpr);
      shCv.width = shCv.height = SS;
      { const sg = shCv.getContext('2d'), rg = sg.createRadialGradient(SS / 2, SS / 2, 0, SS / 2, SS / 2, SS / 2);
        rg.addColorStop(0, 'rgba(0,0,0,.55)'); rg.addColorStop(0.42, 'rgba(0,0,0,.32)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        sg.fillStyle = rg; sg.fillRect(0, 0, SS, SS); }

      const G = 32, glyphs = [];
      const buildGlyphs = () => {
        for (let n = 1; n < 16; n++) {
          const c = document.createElement('canvas');
          c.width = c.height = G;
          const g = c.getContext('2d');
          g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.font = font(900, n > 9 ? 19 : 23);
          g.fillText(String(n), G / 2, G / 2 + 1.5);
          const d = g.getImageData(0, 0, G, G).data, a = new Float32Array(G * G);
          for (let i = 0; i < G * G; i++) a[i] = d[i * 4 + 3] / 255;
          glyphs[n] = a;
        }
      };
      buildGlyphs();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!api.alive) return; buildGlyphs(); balls.forEach(b => { b.dirty = true; }); });

      const SPX = Math.ceil((2 * BR + 2) * dpr), SRAD = BR * dpr, SC = SPX / 2;
      const LX = -0.42, LY = -0.58, LZ = 0.7, hl = Math.hypot(LX, LY, LZ + 1), HX = LX / hl, HY = LY / hl, HZ = (LZ + 1) / hl;
      function paint(b) {
        b.dirty = false;
        const d = b.img.data, m = b.m, col = BCOL[b.n], stripe = b.n > 8, gl = glyphs[b.n];
        for (let py = 0, i = 0; py < SPX; py++) {
          const qy = (py + 0.5 - SC) / SRAD;
          for (let px = 0; px < SPX; px++, i += 4) {
            const qx = (px + 0.5 - SC) / SRAD, r2 = qx * qx + qy * qy, al = SRAD * (1 - Math.sqrt(r2)) + 0.5;
            if (al <= 0) { d[i + 3] = 0; continue; }
            let nx = qx, ny = qy, nz = 0;
            if (r2 < 1) nz = Math.sqrt(1 - r2); else { const k = 1 / Math.sqrt(r2); nx *= k; ny *= k; }
            const bx = m[0] * nx + m[3] * ny + m[6] * nz, by = m[1] * nx + m[4] * ny + m[7] * nz, bz = m[2] * nx + m[5] * ny + m[8] * nz;
            let r = col[0], g = col[1], bl = col[2];
            if (b.n === 0) {
              const w = clamp((Math.max(Math.abs(bx), Math.abs(by), Math.abs(bz)) - 0.982) * 140, 0, 1);
              r -= w * 30; g -= w * 205; bl -= w * 200;
            } else {
              if (stripe) { const w = clamp((Math.abs(bz) - 0.6) * 25, 0, 1); r += (246 - r) * w; g += (244 - g) * w; bl += (236 - bl) * w; }
              const ax = Math.abs(bx);
              if (ax > 0.86) {
                const w = clamp((ax - 0.8776) * 60, 0, 1);
                let ink = 0;
                if (w > 0 && gl) {
                  const fx = clamp((by / bx * 0.9158 + 0.5) * G - 0.5, 0, G - 1.001), fy = clamp((bz / ax * 0.9158 + 0.5) * G - 0.5, 0, G - 1.001);
                  const x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0, o = y0 * G + x0;
                  ink = (gl[o] * (1 - tx) + gl[o + 1] * tx) * (1 - ty) + (gl[o + G] * (1 - tx) + gl[o + G + 1] * tx) * ty;
                }
                r += (248 - r) * w; g += (246 - g) * w; bl += (240 - bl) * w;
                const k = ink * w; r += (28 - r) * k; g += (26 - g) * k; bl += (34 - bl) * k;
              }
            }
            const dif = nx * LX + ny * LY + nz * LZ, sh = 0.34 + 0.76 * (dif > 0 ? dif : 0);
            let s = nx * HX + ny * HY + nz * HZ;
            s = s > 0 ? s : 0; s *= s; s *= s; s *= s;
            const soft = s;
            s *= s; s *= s; s *= s;
            const rim = (1 - nz) * (1 - nz);
            d[i] = r * sh + s * 235 + soft * 24;
            d[i + 1] = g * sh + s * 235 + soft * 24 + rim * 20;
            d[i + 2] = bl * sh + s * 228 + soft * 24 + rim * 6;
            d[i + 3] = (al > 1 ? 1 : al) * 255;
          }
        }
        b.cx.putImageData(b.img, 0, 0);
      }
      function roll(b) {
        const dx = b.rx, dy = b.ry;
        b.rx = b.ry = 0;
        const d = Math.hypot(dx, dy);
        if (d < 1e-6) return;
        const ax = -dy / d, ay = dx / d, th = d / BR, c = Math.cos(th), s = Math.sin(th), t = 1 - c;
        const r00 = c + t * ax * ax, r01 = t * ax * ay, r02 = s * ay, r11 = c + t * ay * ay, r12 = -s * ax, r20 = -s * ay, r21 = s * ax;
        const m = b.m;
        for (let j = 0; j < 3; j++) {
          const m0 = m[j], m1 = m[3 + j], m2 = m[6 + j];
          m[j] = r00 * m0 + r01 * m1 + r02 * m2;
          m[3 + j] = r01 * m0 + r11 * m1 + r12 * m2;
          m[6 + j] = r20 * m0 + r21 * m1 + c * m2;
        }
        let l = Math.hypot(m[0], m[3], m[6]); m[0] /= l; m[3] /= l; m[6] /= l;
        const dt = m[0] * m[1] + m[3] * m[4] + m[6] * m[7];
        m[1] -= dt * m[0]; m[4] -= dt * m[3]; m[7] -= dt * m[6];
        l = Math.hypot(m[1], m[4], m[7]); m[1] /= l; m[4] /= l; m[7] /= l;
        m[2] = m[3] * m[7] - m[6] * m[4]; m[5] = m[6] * m[1] - m[0] * m[7]; m[8] = m[0] * m[4] - m[3] * m[1];
        b.dirty = true;
      }
      function initBall(b) {
        const a = rand(0, TAU), c = Math.cos(a), s = Math.sin(a);
        b.m = new Float64Array([0, c, -s, 0, s, c, 1, 0, 0]);
        b.cv = document.createElement('canvas'); b.cv.width = b.cv.height = SPX;
        b.cx = b.cv.getContext('2d'); b.img = b.cx.createImageData(SPX, SPX);
        b.rx = rand(-5, 5); b.ry = rand(-5, 5); roll(b);
        if (b.n === 0) { b.rx = rand(-20, 20); b.ry = rand(-20, 20); roll(b); }
        b.dirty = true;
      }


      let balls = [], state = 'menu', mode = 'ai', turn = 0, groups = [0, 0], inHand = false, kitchen = false, brk = false;
      let aimA = 0, ev = null, stState = null, acc = 0, shots = [0, 0], rackNo = 0, T = 0, pots = 0;
      let drag = null, barId = null, barP = 0, barY = 0, kbOn = false, kbP = 0.5, lastBar = -1, ai = null, aiPow = 0, bn = null, strikeFx = null, shake = 0, lastSnd = 0;
      let me = 0, online = null, wired = false, lobbying = false, meRe = false, peerRe = false, sn = 0, nextBrk = 0;
      let call = -1, tt = 0, ringV = -1, rem = null, fb = [], fpi = 0, fbase = 0, fin = null, rollT = 0, sendT = 0, aimT = 0, aimSent = '', aimAge = 0;
      const hq = [], TLIM = 30, DELAY = 120;
      const spin = { x: 0, y: 0 };
      const keys = api.keys;
      const DIFFS = ['Easy', 'Normal', 'Hard'];

      const say = t => { if (msgEl.textContent !== t) msgEl.textContent = t; };
      const banner = (t1, t2, col) => { bn = { t1, t2, col: col || C.accent, t: 0 }; };
      const setBar = p => powEl.style.setProperty('--p', p.toFixed(3));
      const setSpin = (x, y) => {
        const d = Math.hypot(x, y);
        if (d > 0.72) { x *= 0.72 / d; y *= 0.72 / d; }
        spin.x = x; spin.y = y;
        dotEl.style.setProperty('--x', x.toFixed(3)); dotEl.style.setProperty('--y', y.toFixed(3));
      };
      const nameOf = s => mode === 'ai' ? (s ? 'CPU' : 'You') : mode === 'net' ? (s === me ? 'You' : 'Your friend') : 'You';
      const you = s => nameOf(s) === 'You';
      const myTurn = () => state === 'aim';
      const onEightFor = s => !!groups[s] && left(balls, groups[s]) === 0;
      const needCall = () => mode !== 'practice' && !brk && onEightFor(turn);
      const aimShown = () => state === 'aim' || state === 'ai' || state === 'wait';
      const legal = n => {
        if (mode === 'practice' || brk) return true;
        const g = groups[turn];
        if (!g) return n !== 8;
        return left(balls, g) === 0 ? n === 8 : grp(n) === g;
      };

      function updHud() {
        const l = mode === 'net' ? me : 0;
        pEls.forEach((el, i) => {
          const p = i ? 1 - l : l, nm = el.querySelector('.pl-nm'), bl = el.querySelector('.pl-balls'), av = el.querySelector('.pl-av'), g = groups[p];
          el.classList.toggle('on', state !== 'menu' && (mode === 'practice' ? i === 0 : turn === p));
          if (mode === 'practice') {
            av.textContent = i ? 'SOLO' : 'YOU';
            nm.innerHTML = i ? 'Practice<small>solo</small>' : 'You<small>all balls</small>';
            bl.innerHTML = i ? `<em>${shots[0]} shots · ${pots} potted</em>` : balls.slice(1).map(b => `<i class="${b.n > 8 ? 's' : ''}${b.on ? '' : ' off'}" style="--c:${bhex(b.n)}"></i>`).join('');
            return;
          }
          av.textContent = mode === 'ai' ? (p ? 'CPU' : 'YOU') : mode === 'net' && p === me ? 'YOU' : 'P' + (p + 1);
          const who = mode === 'ai' ? (p ? 'CPU' : 'You') : p === me ? 'You' : 'Friend';
          const sub = (mode === 'ai' && p ? DIFFS[diff] + ' · ' : '') + GNAME[g] + (mode === 'net' && p !== me && online && net.rtt ? ' · ' + net.rtt + ' ms' : '');
          nm.innerHTML = who + `<small>${sub}</small>`;
          if (!g) { bl.innerHTML = '<i class="e"></i>'.repeat(7); return; }
          const ns = g === 1 ? [1, 2, 3, 4, 5, 6, 7] : [9, 10, 11, 12, 13, 14, 15], cleared = left(balls, g) === 0;
          bl.innerHTML = ns.map(n => `<i class="${n > 8 ? 's' : ''}${balls[n].on ? '' : ' off'}" style="--c:${bhex(n)}"></i>`).join('') + `<i class="${cleared ? '' : 'off'}" style="--c:${BHEX[8]}"></i>`;
        });
        ringV = -1;
      }
      function ring() {
        const v = timerOn && mode !== 'practice' && (state === 'aim' || state === 'wait') ? Math.max(0, 1 - tt / TLIM) : 0;
        if (Math.abs(v - ringV) < 0.002 && (v > 0) === (ringV > 0)) return;
        ringV = v;
        const l = mode === 'net' ? me : 0;
        pEls.forEach((el, i) => {
          const r = el.firstChild, on = (i ? 1 - l : l) === turn;
          r.style.setProperty('--t', on ? v.toFixed(3) : '0');
          r.style.setProperty('--rc', v > 0.34 ? '#22b07d' : v > 0.17 ? '#ffb02e' : '#ef4f4f');
        });
      }

      function onHit(type, s) {
        if (state === 'roll' && online && hq.length < 24) hq.push(type, Math.round(s));
        if (type === 0 && s > 900) shake = Math.max(shake, Math.min(1, s / 2600));
        const ac = au.get();
        if (!ac) return;
        const now = performance.now();
        if (type === 2) { tone(ac, 'sine', 230, 70, 0.22, 0.3); tone(ac, 'triangle', 540, 200, 0.06, 0.12); return; }
        if (now - lastSnd < 16 || s < 25) return;
        lastSnd = now;
        const v = clamp(s / 1400, 0.03, 0.7);
        if (type === 0) { tone(ac, 'sine', 2500 + rand(-300, 300), 1700, 0.045, v * 0.32); tone(ac, 'triangle', 950, 600, 0.03, v * 0.16); }
        else tone(ac, 'triangle', 150, 80, 0.09, v * 0.45);
      }
      const cueSound = p => { const ac = au.get(); if (ac) { tone(ac, 'triangle', 700, 280, 0.04, 0.1 + p * 0.25); tone(ac, 'sine', 1900, 1200, 0.025, 0.06 + p * 0.08); } };


      const packX = () => balls.map(b => (b.on ? [b.x, b.y] : null));
      const packF = () => { const p = []; for (const b of balls) { if (b.on) p.push(Math.round(b.x * 10), Math.round(b.y * 10)); else p.push(-1 - (b.pk | 0), 0); } return p; };
      const num = (v, a, b, d) => (typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : d);
      function setPos(arr) {
        if (!Array.isArray(arr) || arr.length !== 16) return;
        balls.forEach((b, n) => {
          const q = arr[n];
          b.vx = b.vy = b.fx = b.fy = 0; b.sF = b.sS = 0;
          if (Array.isArray(q)) {
            const x = num(q[0], X0 + BR, X1 - BR, b.x), y = num(q[1], Y0 + BR, Y1 - BR, b.y);
            if (b.on) { b.rx += x - b.x; b.ry += y - b.y; } else { b.on = true; b.fall = 0; }
            b.x = x; b.y = y;
          } else if (b.on) { b.on = false; b.pk = nearPocket(b); b.ox = b.x; b.oy = b.y; b.fall = 1; }
        });
      }
      function setCue(x, y) { const c = balls[0]; c.x = num(x, X0 + BR, X1 - BR, c.x); c.y = num(y, Y0 + BR, Y1 - BR, c.y); c.on = true; c.fall = 0; }

      function newRack(m, setup) {
        mode = m; groups = [0, 0]; shots = [0, 0]; pots = 0; brk = true; kitchen = true; inHand = true; sn = 0;
        balls = rack(); balls.forEach(initBall);
        if (setup) setPos(setup.b);
        turn = setup ? (setup.turn === 1 ? 1 : 0) : m === 'ai' ? rackNo % 2 : m === 'practice' ? 0 : nextBrk;
        if (m === 'net') nextBrk = 1 - turn;
        rackNo++;
        inGame = m === 'ai'; persist();
        api.score(m === 'ai' ? streak : m === 'practice' ? '0 potted' : 'Online');
        aimA = 0; bn = null; strikeFx = null; setSpin(0, 0); fb = []; fin = null; rem = null;
        state = 'aim';
        if (m === 'net') banner(turn === me ? 'You break' : 'Your friend breaks', '');
        startTurn();
      }
      function startTurn() {
        drag = null; barId = null; barP = 0; kbOn = false; call = -1; tt = 0; rem = null; fine = null;
        const c = balls[0];
        if (!c.on) {
          const p = freeSpot(balls, kitchen ? HEADX - 40 : HEADX, MY, kitchen, 0);
          Object.assign(c, { on: true, fall: 0, x: p.x, y: p.y, vx: 0, vy: 0, fx: 0, fy: 0 });
        }
        if (brk) {
          const ap = balls.filter(b => b.n && b.on).reduce((a, b) => (b.x < a.x ? b : a));
          aimA = Math.atan2(ap.y - c.y, ap.x - c.x);
        }
        if (mode === 'ai' && turn === 1) { updHud(); return aiStart(); }
        if (mode === 'net' && turn !== me) {
          state = 'wait'; updHud();
          return say(inHand ? (kitchen ? 'Your friend is placing the cue ball' : 'Your friend has ball in hand') : brk ? 'Your friend is breaking' : 'Your friend is aiming');
        }
        state = 'aim'; updHud();
        sayAim();
      }
      function sayAim() {
        const t = inHand ? (kitchen ? 'Place the cue ball, then break' : 'Ball in hand: drag the cue ball') : brk ? 'Your break' : needCall() ? (call < 0 ? 'Tap a pocket to call the 8' : 'Pocket called: sink the 8') : mode === 'practice' ? `Practice · shot ${shots[0] + 1}` : 'Your shot';
        say(t);
      }
      function shoot(a, p, sF, sS) {
        if (state !== 'aim' && state !== 'ai') return;
        if (needCall() && call < 0) { drag = null; barId = null; barP = 0; kbOn = false; say('Tap a pocket to call the 8 first'); api.sfx('bad'); return; }
        const c = balls[0];
        aimA = a;
        stState = { turn, groups: groups.slice(), brk, onEight: onEightFor(turn), call: needCall() ? call : -1 };
        sn++;
        if (online) net.send({ t: 'shot', n: sn, a, p, x: c.x, y: c.y, k: stState.call });
        strike(c, { a, p, sF, sS });
        ev = newEv(); ev.hit = onHit; acc = 0; rollT = 0; sendT = 0; hq.length = 0;
        strikeFx = { a, x: c.x, y: c.y, pull: BR + 3 + p * 70, t: 0 };
        state = 'roll'; inHand = false; drag = null; barId = null; barP = 0; kbOn = false; aiPow = 0;
        setSpin(0, 0);
        shots[turn]++;
        cueSound(p);
        say(mode === 'ai' && turn === 1 ? 'CPU shoots' : 'Rolling…');
      }
      const sendFrame = () => net.send({ t: 'f', n: sn, T: Math.round(rollT * 1000), p: packF(), h: hq.length ? hq.splice(0) : undefined });
      function resolve() {
        if (online) sendFrame();
        const pot = ev.pocketed;
        if (mode === 'practice') {
          const n = pot.filter(x => x).length;
          pots += n;
          if (n) api.score(pots + ' potted');
          if (pot.includes(0)) { inHand = true; banner('Scratch', 'Ball in hand', C.bad); }
          if (balls.every(b => !b.n || !b.on)) return practiceDone();
          brk = false; kitchen = false;
          return startTurn();
        }
        if (online === 'guest') {
          state = 'sync';
          net.send({ t: 'res', n: sn, b: packX(), ev: { first: ev.first, rail: ev.rail, pocketed: pot, pk8: ev.pk8 } });
          return;
        }
        settle(outcome());
      }

      function outcome() {
        const r = judge(stState, balls, ev);
        if (r.respot8) { const b = balls[8], p = freeSpot(balls, FOOTX, MY, false, 8); Object.assign(b, { on: true, fall: 0, x: p.x, y: p.y }); }
        return { s: stState.turn, foul: r.foul, cont: r.cont, assign: r.assign, respot8: r.respot8, win: r.win, lose: r.lose, why: r.why, pot: ev.pocketed.slice() };
      }
      function settle(o) {
        apply(o);
        if (online === 'host') net.send({ t: 'st', n: sn, o, b: packX(), turn, groups, ih: inHand });
      }
      function apply(o, ov) {
        const s = o.s === 1 ? 1 : 0, prev = turn;
        if (o.win || o.lose) return gameEnd(o);
        if (o.assign === 1 || o.assign === 2) { groups[s] = o.assign; groups[1 - s] = 3 - o.assign; }
        brk = false; kitchen = false;
        if (o.foul) { turn = 1 - s; inHand = true; } else { inHand = false; if (!o.cont) turn = 1 - s; }
        if (ov) { turn = ov.turn === 1 ? 1 : 0; if (Array.isArray(ov.groups)) groups = [ov.groups[0] | 0, ov.groups[1] | 0]; inHand = !!ov.ih; }
        if (o.foul) {
          banner('Foul: ' + String(o.foul).toLowerCase(), `${nameOf(turn)} ${you(turn) ? 'have' : 'has'} ball in hand`, C.bad);
          api.sfx('bad');
        } else if (o.assign) banner(`${nameOf(s)} ${you(s) ? 'are' : 'is'} ${GNAME[groups[s]].toLowerCase()}`, `${nameOf(1 - s)} ${you(1 - s) ? 'take' : 'takes'} ${GNAME[groups[1 - s]].toLowerCase()}`);
        else if (o.respot8) banner('8 ball respotted', 'Potted on the break');
        else if (turn !== prev && mode === 'net') banner(turn === me ? 'Your turn' : "Your friend's turn", '');
        if (!o.foul && o.cont && Array.isArray(o.pot) && o.pot.length && you(s)) api.sfx('good');
        startTurn();
      }
      function timeUp() {
        drag = null; barId = null; barP = 0; kbOn = false; fine = null;
        if (online === 'guest') { state = 'sync'; say('Time is up'); return; }
        stState = { turn };
        settle({ s: turn, foul: 'Time out', cont: false, assign: 0, respot8: false, win: false, lose: false, why: '', pot: [] });
      }
      function gameEnd(o) {
        state = 'over'; inGame = false; drag = null; barId = null; rem = null;
        const s = o.s === 1 ? 1 : 0, w = o.win ? s : 1 - s;
        const why = nameOf(s) + (o.win ? ' sank the 8 ball.' : o.why === 'pocket' ? ' sank the 8 in an uncalled pocket.' : o.why === 'foul' ? ' fouled on the 8 ball.' : ' sank the 8 ball too early.');
        updHud();
        if (mode === 'ai') {
          const won = w === 0;
          streak = won ? streak + 1 : 0;
          persist();
          const nb = won ? api.submit(streak) : false;
          api.score(streak);
          api.sfx(won ? 'win' : 'lose');
          banner(won ? 'You win!' : 'CPU wins', '', won ? C.good : C.bad);
          say(won ? 'You win!' : 'CPU wins');
          api.timeout(() => api.overlay({
            kicker: nb ? 'New best!' : won ? 'Winner' : 'Game over',
            title: won ? 'You win!' : 'CPU wins',
            text: why + (won ? ' Your win streak keeps growing.' : ' Your win streak resets.'),
            stats: [['Streak', streak], ['Your shots', shots[0]], ['Best', api.best ?? 0]],
            button: won ? 'Next rack' : 'Play again', onAction: () => newRack('ai'),
            secondary: 'Menu', onSecondary: menu
          }), 1300);
          return;
        }
        const won = w === me, t = won ? 'You win!' : 'Your friend wins';
        api.sfx(won ? 'win' : 'lose'); banner(t, '', won ? C.good : C.bad); say(t);
        api.timeout(() => { if (state === 'over' && online) netOver(t, why); }, 1300);
      }
      const netOver = (t, why) => api.overlay({
        kicker: 'Online', title: t, text: why,
        stats: [['Your shots', shots[me]], ['Friend’s shots', shots[1 - me]]],
        button: 'Rematch', onAction: rematch, secondary: 'Leave', onSecondary: menu
      });
      function practiceDone() {
        state = 'over';
        api.sfx('win');
        say('Table cleared');
        api.timeout(() => api.overlay({
          kicker: 'Practice', title: 'Table cleared', text: `All fifteen balls down in ${shots[0]} shots.`,
          stats: [['Shots', shots[0]], ['Potted', pots]],
          button: 'Rack again', onAction: () => newRack('practice'), secondary: 'Menu', onSecondary: menu
        }), 900);
      }


      const DESC = {
        ai: () => `Pot your solids or stripes, then call a pocket and sink the 8. Win streak: <b>${streak}</b>`,
        net: () => 'Play a friend on another device: create a room and send the invite link, or join with their code.',
        practice: () => 'Clear all fifteen balls on your own. No rules, no timer.'
      };
      const optHtml = () => `<span class="pl-opts pl-diffs"${pick === 'ai' ? '' : ' hidden'}>${DIFFS.map((d, i) => `<button type="button" class="pl-diff${i === diff ? ' on' : ''}" data-d="${i}">${d}</button>`).join('')}</span><span class="pl-opts"${pick === 'practice' ? ' hidden' : ''}><button type="button" class="pl-diff pl-tm${timerOn ? ' on' : ''}">Shot timer: ${timerOn ? TLIM + ' s' : 'off'}</button></span>`;
      function menu() {
        if (online || net.role) { online = null; net.close(); }
        state = 'menu'; inGame = false; mode = pick === 'net' ? 'ai' : pick; me = 0; persist();
        updHud(); ring(); say('8-Ball');
        api.overlay({
          kicker: 'Sports', title: '8 Ball Pool',
          text: `<span class="pl-mdesc">${DESC[pick]()}</span><span class="pl-modes">${MODES.map(([k, t]) => `<button type="button" class="pl-mode${k === pick ? ' on' : ''}" data-m="${k}">${t}</button>`).join('')}</span><span class="pl-optbox">${optHtml()}</span>`,
          button: 'Play', onAction: () => start(pick)
        });
      }
      const start = m => { if (m === 'net') return goOnline(); newRack(m); };
      api.on(document, 'click', e => {
        const t = e.target.closest && e.target.closest('.pl-diff,.pl-mode');
        if (!t || state !== 'menu') return;
        const ov = t.closest('.g-overlay');
        if (!ov) return;
        if (t.dataset.m) pick = t.dataset.m;
        else if (t.dataset.d) diff = +t.dataset.d;
        else timerOn = !timerOn;
        persist();
        ov.querySelectorAll('.pl-mode').forEach(x => x.classList.toggle('on', x.dataset.m === pick));
        const d = ov.querySelector('.pl-mdesc'), o = ov.querySelector('.pl-optbox');
        if (d) d.innerHTML = DESC[pick]();
        if (o) o.innerHTML = optHtml();
        if (t.dataset.m) { mode = pick === 'net' ? 'ai' : pick; updHud(); }
      });


      const rematch = () => {
        if (!online) return menu();
        meRe = true; net.send({ t: 're' });
        if (online === 'host' && peerRe) return hostStart();
        api.overlay({ kicker: 'Online', title: 'Rematch', text: 'Waiting for your friend to tap Rematch…', button: null, secondary: 'Leave', onSecondary: menu });
      };
      const hostStart = () => {
        if (online !== 'host') return;
        meRe = peerRe = false; api.hideOverlay();
        newRack('net');
        net.send({ t: 'setup', b: packX(), turn, tm: timerOn });
      };
      function finishWatch() {
        const m = fin;
        fin = null; fb = [];
        for (const b of balls) if (b.fall > 0 && b.fall < 1) b.fall = 1;
        if (online === 'host') {
          setPos(m.b);
          const e = m.ev || {}, pk = Array.isArray(e.pocketed) ? e.pocketed : [];
          ev = { first: Number.isInteger(e.first) && e.first > 0 && e.first < 16 ? e.first : null, rail: !!e.rail, pocketed: pk.filter((n, i) => Number.isInteger(n) && n >= 0 && n < 16 && !balls[n].on && pk.indexOf(n) === i), pk8: Number.isInteger(e.pk8) ? e.pk8 : -1, hit: null };
          settle(outcome());
        } else applySt(m);
      }
      function applySt(m) {
        if (!m.o || typeof m.o !== 'object') return;
        fin = null; fb = [];
        setPos(m.b);
        apply(m.o, m);
      }
      function watch(falling) {
        if (!fb.length) return;
        const t = performance.now() - fbase - DELAY;
        let i = 0;
        while (i + 1 < fb.length && fb[i + 1].T <= t) i++;
        while (fpi <= i) {
          const f = fb[fpi++];
          for (let n = 0; n < 16; n++) {
            const b = balls[n], x = f.p[2 * n];
            if (x < 0 && b.on) { b.on = false; b.pk = clamp(-1 - x, 0, 5) | 0; b.ox = b.x; b.oy = b.y; b.fall = 0.001; b.vx = b.vy = 0; onHit(2, 1); falling = true; }
          }
          if (Array.isArray(f.h)) for (let k = 0; k + 1 < f.h.length && k < 24; k += 2) onHit(f.h[k] | 0, +f.h[k + 1] || 0);
        }
        const a = fb[i], b = fb[i + 1], u = b && t > a.T ? clamp((t - a.T) / (b.T - a.T || 1), 0, 1) : 0;
        for (let n = 0; n < 16; n++) {
          const bl = balls[n], ax = a.p[2 * n];
          if (!bl.on || ax < 0) continue;
          let x = ax / 10, y = a.p[2 * n + 1] / 10;
          if (b && b.p[2 * n] >= 0) { x += (b.p[2 * n] / 10 - x) * u; y += (b.p[2 * n + 1] / 10 - y) * u; }
          bl.rx += x - bl.x; bl.ry += y - bl.y; bl.x = x; bl.y = y;
        }
        if (fin && i === fb.length - 1 && t >= a.T && !falling) finishWatch();
      }
      function onMsg(m) {
        if (!online || !m || typeof m !== 'object') return;
        const host = online === 'host', theirs = turn !== me;
        if (m.t === 're') { peerRe = true; if (host && meRe) hostStart(); else if (!meRe) api.toast('Your friend wants a rematch'); return; }
        if (m.t === 'setup') { if (!host) { meRe = peerRe = false; api.hideOverlay(); timerOn = m.tm !== false; newRack('net', m); } return; }
        if (m.t === 'aim') {
          if (state !== 'wait' || !theirs) return;
          const c = balls[0];
          rem = { a: num(m.a, -10, 10, aimA), p: num(m.p, 0, 1, 0), x: num(m.x, X0 + BR, X1 - BR, c.x), y: num(m.y, Y0 + BR, Y1 - BR, c.y) };
          call = Number.isInteger(m.k) && m.k >= 0 && m.k < 6 ? m.k : -1;
          return;
        }
        if (m.t === 'shot') {
          if (state === 'watch' && fin) finishWatch();
          if (state !== 'wait' || !theirs) return;
          sn = m.n | 0;
          const a = num(m.a, -10, 10, aimA), p = num(m.p, 0, 1, 0.5);
          if (inHand) setCue(m.x, m.y);
          call = Number.isInteger(m.k) && m.k >= 0 && m.k < 6 ? m.k : -1;
          stState = { turn, groups: groups.slice(), brk, onEight: onEightFor(turn), call: needCall() ? call : -1 };
          aimA = a; rem = null; fb = []; fpi = 0; fin = null; inHand = false;
          strikeFx = { a, x: balls[0].x, y: balls[0].y, pull: BR + 3 + p * 70, t: 0 };
          shots[turn]++;
          state = 'watch'; cueSound(p); say('Your friend shoots');
          return;
        }
        if (m.t === 'f') {
          if (state !== 'watch' || m.n !== sn || !Array.isArray(m.p) || m.p.length !== 32 || typeof m.T !== 'number') return;
          const now = performance.now();
          if (!fb.length || now - m.T < fbase) fbase = now - m.T;
          fb.push({ T: m.T, p: m.p.map(v => +v || 0), h: m.h });
          return;
        }
        if (m.t === 'res') { if (host && state === 'watch' && m.n === sn) fin = m; return; }
        if (m.t === 'st' && !host) {
          if (state === 'menu' || state === 'over' || state === 'left') return;
          if (state === 'watch') fin = m; else applySt(m);
        }
      }
      function wire() {
        if (wired) return;
        wired = true;
        net.on('open', role => {
          online = role; me = role === 'host' ? 0 : 1; meRe = peerRe = false; mode = 'net'; state = 'menu';
          updHud(); say(role === 'host' ? 'Friend joined' : 'Connected: racking up…');
          if (role === 'host') { nextBrk = Math.random() < 0.5 ? 0 : 1; api.timeout(hostStart, 300); }
        });
        net.on('data', onMsg);
        net.on('close', () => {
          if (!online) return;
          online = null; state = 'left'; drag = null; barId = null; rem = null; bn = null; api.sfx('bad');
          say('Your friend left'); updHud(); ring();
          api.overlay({ kicker: 'Online', title: 'Your friend left', text: 'The connection to your friend was lost.', button: 'Back to menu', onAction: menu });
        });
      }
      async function goOnline() {
        if (lobbying || online) return;
        wire(); lobbying = true; state = 'menu'; api.hideOverlay();
        const role = await net.lobby({ title: '8 Ball Pool online', text: 'Create a room and send the code or invite link to a friend on another device, or type their code to join. Each of you shoots on your own screen.' });
        lobbying = false;
        if (!role && api.alive && !online) menu();
      }


      function aiStart() {
        state = 'ai'; say('CPU is thinking…');
        const c = balls[0], lv = AIL[diff];
        ai = { t: 0, phase: 'think', q: [], i: 0, best: null, bs: -Infinity, from: aimA, shot: null, st: null };
        if (brk) {
          const p = freeSpot(balls, HEADX - 30, MY + rand(-60, 60), true, 0);
          c.x = p.x; c.y = p.y;
          const ap = balls.filter(b => b.n && b.on).reduce((a, b) => (b.x < a.x ? b : a));
          ai.best = { a: Math.atan2(ap.y - c.y, ap.x - c.x) + gauss() * 0.006, p: diff ? 1 : 0.85, sF: 0, sS: 0 };
          return;
        }
        if (inHand) { const p = aiPlace(balls, { turn, groups }, diff, kitchen); c.x = p.x; c.y = p.y; }
        const g = groups[turn];
        ai.st = { turn, groups: groups.slice(), brk: false, onEight: !!g && left(balls, g) === 0 };
        ai.q = aiShots(balls, ai.st, lv);
      }
      function aiUpdate(dt) {
        ai.t += dt;
        if (ai.phase === 'think') {
          const t0 = performance.now();
          while (ai.i < ai.q.length && performance.now() - t0 < 7) {
            const s = ai.q[ai.i++], v = aiValue(balls, ai.st, s) + Math.random() * (diff ? 1 : 500);
            if (v > ai.bs) { ai.bs = v; ai.best = s; }
          }
          if (ai.i >= ai.q.length && ai.t > 0.7) {
            const lv = AIL[diff], s = ai.best || { a: aimA, p: 0.5, sF: 0, sS: 0 };
            if (needCall()) { const e = simulate(balls, s).ev; call = e.pk8 >= 0 ? e.pk8 : nearPocket(balls[8]); }
            ai.shot = { a: s.a + (brk ? 0 : gauss() * lv.noise), p: clamp(s.p * (1 + gauss() * lv.pn), 0.1, 1), sF: s.sF, sS: s.sS };
            ai.phase = 'aim'; ai.t = 0; ai.from = aimA;
          }
        } else if (ai.phase === 'aim') {
          const k = Math.min(1, ai.t / 0.7), e = k * k * (3 - 2 * k);
          let d = ai.shot.a - ai.from;
          d = Math.atan2(Math.sin(d), Math.cos(d));
          aimA = ai.from + d * e;
          if (k >= 1) { ai.phase = 'pull'; ai.t = 0; }
        } else {
          aiPow = Math.min(1, ai.t / 0.45) * ai.shot.p;
          if (ai.t > 0.62) shoot(ai.shot.a, ai.shot.p, ai.shot.sF, ai.shot.sS);
        }
      }


      const scl = () => cv.getBoundingClientRect().width / CW || 1;
      const nearCue = p => Math.hypot(p.x - balls[0].x, p.y - balls[0].y) < Math.max(BR * 2.4, 22 / scl());
      const aimTo = p => { const c = balls[0]; if (Math.hypot(p.x - c.x, p.y - c.y) > 3) aimA = Math.atan2(p.y - c.y, p.x - c.x); };
      function moveCue(x, y) {
        const c = balls[0];
        x = clamp(x, X0 + BR + 1, kitchen ? HEADX : X1 - BR - 1); y = clamp(y, Y0 + BR + 1, Y1 - BR - 1);
        if (!validSpot(balls, x, y, kitchen, 0)) {
          for (const b of balls) {
            if (!b.n || !b.on) continue;
            const dx = x - b.x, dy = y - b.y, d = Math.hypot(dx, dy);
            if (d < 2 * BR + 1) { const k = (2 * BR + 1.5) / (d || 1); x = b.x + dx * k; y = b.y + dy * k; }
          }
          if (!validSpot(balls, x, y, kitchen, 0)) return;
        }
        c.x = x; c.y = y;
      }
      const pickPocket = p => { const r = Math.max(30, 24 / scl()); for (let i = 0; i < 6; i++) if (Math.hypot(p.x - POCK[i][0], p.y - POCK[i][1]) < r) return i; return -1; };
      cv.addEventListener('pointerdown', e => {
        if (!myTurn() || drag || barId != null) return;
        e.preventDefault();
        const p = toW(e);
        if (needCall()) { const k = pickPocket(p); if (k >= 0) { call = k; api.sfx('tap'); sayAim(); return; } }
        const near = nearCue(p);
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
        kbOn = false;
        if (inHand && near) { const c = balls[0]; drag = { id: e.pointerId, kind: 'move', ox: c.x - p.x, oy: c.y - p.y }; cv.style.cursor = 'grabbing'; }
        else if (near) drag = { id: e.pointerId, kind: 'sling', p: 0 };
        else if (e.pointerType === 'mouse') { aimTo(p); drag = { id: e.pointerId, kind: 'pull', x: p.x, y: p.y, p: 0 }; }
        else { aimTo(p); drag = { id: e.pointerId, kind: 'aim' }; }
      });
      cv.addEventListener('pointermove', e => {
        const p = toW(e);
        if (!drag) {
          if (e.pointerType === 'mouse' && myTurn() && barId == null) { aimTo(p); cv.style.cursor = inHand && nearCue(p) ? 'grab' : ''; }
          return;
        }
        if (e.pointerId !== drag.id) return;
        const c = balls[0];
        if (drag.kind === 'move') moveCue(p.x + drag.ox, p.y + drag.oy);
        else if (drag.kind === 'aim') aimTo(p);
        else if (drag.kind === 'sling') {
          const dx = c.x - p.x, dy = c.y - p.y, d = Math.hypot(dx, dy);
          if (d > 6) aimA = Math.atan2(dy, dx);
          drag.p = clamp((d - BR) / 200, 0, 1);
        } else drag.p = clamp(((drag.x - p.x) * Math.cos(aimA) + (drag.y - p.y) * Math.sin(aimA)) / 200, 0, 1);
      });
      const cvUp = e => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null; cv.style.cursor = '';
        if (e.type === 'pointerup' && d.p >= 0.03 && myTurn()) shoot(aimA, d.p, -spin.y, spin.x);
      };
      cv.addEventListener('pointerup', cvUp);
      cv.addEventListener('pointercancel', cvUp);


      powEl.addEventListener('pointerdown', e => {
        if (!myTurn() || drag) return;
        e.preventDefault();
        barId = e.pointerId; barY = e.clientY; barP = 0; kbOn = false;
        try { powEl.setPointerCapture(e.pointerId); } catch (_) {}
      });
      powEl.addEventListener('pointermove', e => {
        if (e.pointerId !== barId) return;
        const r = powEl.getBoundingClientRect();
        barP = clamp((e.clientY - barY) / ((r.height || 400) * 0.72), 0, 1);
      });
      const barUp = e => {
        if (e.pointerId !== barId) return;
        barId = null;
        const p = barP;
        barP = 0;
        if (e.type === 'pointerup' && p >= 0.03 && myTurn()) shoot(aimA, p, -spin.y, spin.x);
      };
      powEl.addEventListener('pointerup', barUp);
      powEl.addEventListener('pointercancel', barUp);

      let spinId = null;
      const spinAt = e => { const r = spinEl.getBoundingClientRect(); let x = ((e.clientX - r.left) / r.width) * 2 - 1, y = ((e.clientY - r.top) / r.height) * 2 - 1; if (Math.hypot(x, y) < 0.12) x = y = 0; setSpin(x, y); };
      spinEl.addEventListener('pointerdown', e => { e.preventDefault(); spinId = e.pointerId; try { spinEl.setPointerCapture(e.pointerId); } catch (_) {} spinAt(e); });
      spinEl.addEventListener('pointermove', e => { if (e.pointerId === spinId) spinAt(e); });
      spinEl.addEventListener('pointerup', () => { spinId = null; });
      spinEl.addEventListener('pointercancel', () => { spinId = null; });

      let rollId = null, rollX = 0, rollO = 0;
      rollEl.addEventListener('pointerdown', e => { e.preventDefault(); if (!myTurn()) return; rollId = e.pointerId; rollX = e.clientX; try { rollEl.setPointerCapture(e.pointerId); } catch (_) {} });
      rollEl.addEventListener('pointermove', e => {
        if (e.pointerId !== rollId || !myTurn()) return;
        const d = e.clientX - rollX;
        rollX = e.clientX; aimA += d * 0.001; rollO += d;
        rollEl.style.setProperty('--o', rollO.toFixed(1) + 'px');
      });
      const rollUp = e => { if (e.pointerId === rollId) rollId = null; };
      rollEl.addEventListener('pointerup', rollUp);
      rollEl.addEventListener('pointercancel', rollUp);

      let fine = null;
      ctl.querySelectorAll('.pl-fine').forEach(b => {
        b.addEventListener('pointerdown', e => {
          e.preventDefault();
          if (!myTurn()) return;
          try { b.setPointerCapture(e.pointerId); } catch (_) {}
          fine = { d: +b.dataset.f, t: 0, id: e.pointerId };
          aimA += fine.d * 0.002;
        });
        const off = e => { if (fine && fine.id === e.pointerId) fine = null; };
        b.addEventListener('pointerup', off);
        b.addEventListener('pointercancel', off);
      });

      api.on(window, 'keydown', e => {
        if (!myTurn()) return;
        if (e.code === 'Space') {
          if (e.repeat) return;
          if (kbOn) shoot(aimA, kbP, -spin.y, spin.x); else kbOn = true;
        } else if (/^Arrow/.test(e.code)) kbOn = true;
        else if (/^Digit[1-6]$/.test(e.code) && needCall()) { call = +e.code[5] - 1; sayAim(); }
      });
      const keyboard = dt => {
        const L = keys.has('ArrowLeft'), R = keys.has('ArrowRight'), U = keys.has('ArrowUp'), D = keys.has('ArrowDown');
        if (!(L || R || U || D)) return;
        const fn = keys.has('ShiftLeft') || keys.has('ShiftRight');
        aimA += ((R ? 1 : 0) - (L ? 1 : 0)) * (fn ? 0.05 : 0.7) * dt;
        kbP = clamp(kbP + ((U ? 1 : 0) - (D ? 1 : 0)) * 0.6 * dt, 0.05, 1);
      };
      const curPow = () => state === 'ai' ? aiPow : state === 'wait' ? (rem ? rem.p : 0) : state !== 'aim' ? 0 : drag && drag.p != null ? drag.p : barId != null ? barP : kbOn ? kbP : 0;
      function sendAim(dt) {
        aimAge += dt;
        if ((aimT += dt) < 1 / 15) return;
        aimT = 0;
        const c = balls[0], a = +aimA.toFixed(4), p = +curPow().toFixed(3), x = +c.x.toFixed(1), y = +c.y.toFixed(1), k = `${a},${p},${x},${y},${call}`;
        if (k === aimSent && aimAge < 0.5) return;
        aimSent = k; aimAge = 0;
        net.send({ t: 'aim', a, p, x: c.x, y: c.y, k: call }, true);
      }
      function remoteAim(dt) {
        if (!rem) return;
        const f = Math.min(1, dt * 14), c = balls[0];
        let d = rem.a - aimA;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        aimA += d * f;
        if (inHand) { if (Math.hypot(rem.x - c.x, rem.y - c.y) < 0.5) { c.x = rem.x; c.y = rem.y; } else { c.x += (rem.x - c.x) * f; c.y += (rem.y - c.y) * f; } }
      }
      function clock(dt) {
        if (!timerOn || mode === 'practice' || (state !== 'aim' && state !== 'wait')) return;
        const prev = tt;
        tt += dt;
        if (state === 'aim') {
          if (tt > TLIM - 5.5 && tt < TLIM && Math.floor(tt) !== Math.floor(prev)) api.sfx('tick');
          if (tt >= TLIM) timeUp();
        } else if (online === 'host' && tt >= TLIM + 2) timeUp();
      }


      const line = (ax, ay, bx, by) => { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); };
      function drawGuide() {
        const c = balls[0], dx = Math.cos(aimA), dy = Math.sin(aimA);
        let tb = 1e9, hb = null;
        for (const b of balls) {
          if (!b.n || !b.on) continue;
          const ox = b.x - c.x, oy = b.y - c.y, tp = ox * dx + oy * dy;
          if (tp <= 0) continue;
          const pd = ox * ox + oy * oy - tp * tp, R2 = 4 * BR * BR;
          if (pd >= R2) continue;
          const t = tp - Math.sqrt(R2 - pd);
          if (t < tb) { tb = t; hb = b; }
        }
        const tx = dx > 1e-9 ? (X1 - BR - c.x) / dx : dx < -1e-9 ? (X0 + BR - c.x) / dx : 1e9;
        const ty = dy > 1e-9 ? (Y1 - BR - c.y) / dy : dy < -1e-9 ? (Y0 + BR - c.y) / dy : 1e9;
        const tw = Math.max(0, Math.min(tx, ty));
        ctx.save();
        ctx.lineCap = 'round'; ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
        if (!hb || tw < tb) {
          const ex = c.x + dx * tw, ey = c.y + dy * tw;
          line(c.x + dx * BR, c.y + dy * BR, ex, ey);
          ctx.beginPath(); ctx.arc(ex, ey, BR, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
          const rx = tx < ty ? -dx : dx, ry = tx < ty ? dy : -dy;
          ctx.globalAlpha = 0.7; line(ex, ey, ex + rx * 70, ey + ry * 70);
        } else {
          const gx = c.x + dx * tb, gy = c.y + dy * tb, nx = (hb.x - gx) / (2 * BR), ny = (hb.y - gy) / (2 * BR), full = dx * nx + dy * ny, ok = legal(hb.n);
          line(c.x + dx * BR, c.y + dy * BR, gx - dx * BR, gy - dy * BR);
          ctx.beginPath(); ctx.arc(gx, gy, BR, 0, TAU);
          if (!ok) { ctx.fillStyle = 'rgba(239,79,79,.25)'; ctx.fill(); }
          ctx.lineWidth = 2; ctx.strokeStyle = ok ? '#fff' : '#ff6b6b'; ctx.stroke();
          if (!ok) { const q = BR * 0.5; line(gx - q, gy - q, gx + q, gy + q); line(gx + q, gy - q, gx - q, gy + q); }
          else {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            line(hb.x + nx * BR, hb.y + ny * BR, hb.x + nx * (BR + 24 + 150 * full), hb.y + ny * (BR + 24 + 150 * full));
            let ux = dx - nx * full, uy = dy - ny * full;
            const ul = Math.hypot(ux, uy);
            if (ul > 0.03) {
              ux /= ul; uy /= ul;
              ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.9)';
              line(gx + ux * BR, gy + uy * BR, gx + ux * (BR + 18 + 80 * (1 - full)), gy + uy * (BR + 18 + 80 * (1 - full)));
            }
          }
        }
        ctx.restore();
      }
      function drawCall() {
        ctx.save();
        for (let i = 0; i < 6; i++) {
          const [px, py] = POCK[i];
          if (i === call) {
            ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(px, py, 25, 0, TAU); ctx.stroke();
            const ox = px + (MX - px) * 0.06, oy = py + (MY - py) * 0.16, b8 = balls[8];
            if (b8.cv) { ctx.globalAlpha = 0.9; ctx.drawImage(b8.cv, ox - BR - 1, oy - BR - 1, 2 * BR + 2, 2 * BR + 2); }
          } else if (call < 0 && state === 'aim') {
            const k = 0.5 + 0.5 * Math.sin(T * 6);
            ctx.globalAlpha = 0.35 + 0.55 * k; ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.setLineDash([5, 5]);
            ctx.beginPath(); ctx.arc(px, py, 22 + 3 * k, 0, TAU); ctx.stroke();
          }
        }
        ctx.restore();
      }
      function drawCue(x, y, a, off, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.translate(x + 6, y + 9); ctx.rotate(a);
        ctx.drawImage(cueSh, -off - CUEL - 8, -CUEH / 2 - 8, CUEL + 16, CUEH + 16);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y); ctx.rotate(a);
        ctx.drawImage(cueCv, -off - CUEL, -CUEH / 2, CUEL, CUEH);
        ctx.restore();
      }
      function drawBanner(dt) {
        if (!bn) return;
        bn.t += dt;
        if (bn.t > 2.2) { bn = null; return; }
        const a = Math.min(1, bn.t / 0.15, (2.2 - bn.t) / 0.4), cx = CW / 2, cy = CH / 2;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = font(900, 26);
        const w1 = ctx.measureText(bn.t1).width;
        ctx.font = font(800, 14);
        const w2 = bn.t2 ? ctx.measureText(bn.t2).width : 0, w = Math.min(CW - 24, Math.max(w1, w2) + 64), h = bn.t2 ? 78 : 56, x = cx - w / 2, y = cy - h / 2 - (1 - a) * 10;
        ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
        rrect(ctx, x, y, w, h, 20); ctx.fillStyle = 'rgba(24,22,36,.86)'; ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = bn.col; rrect(ctx, x + 14, y + h / 2 - 12, 6, 24, 3); ctx.fill();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
        ctx.font = font(900, 26); ctx.fillText(bn.t1, cx + 4, y + (bn.t2 ? 28 : h / 2 + 1), w - 40);
        if (bn.t2) { ctx.font = font(800, 14); ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.fillText(bn.t2, cx + 4, y + 56, w - 40); }
        ctx.restore();
      }
      function draw(dt) {
        ctx.save();
        if (shake > 0.01) { ctx.translate((Math.random() - 0.5) * 6 * shake, (Math.random() - 0.5) * 6 * shake); shake *= Math.pow(0.002, dt); } else shake = 0;
        if (VERT) { ctx.translate(PH, 0); ctx.rotate(Math.PI / 2); }
        ctx.drawImage(tableCv, 0, 0, PW, PH);
        const showAim = state === 'aim' || state === 'wait';
        if (inHand && kitchen && showAim) {
          ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(X0 + 17, Y0, HEADX - X0 - 17, Y1 - Y0);
          ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.setLineDash([6, 6]); line(HEADX, Y0, HEADX, Y1); ctx.setLineDash([]);
        }
        for (const b of balls) {
          if (!b.on && !(b.fall > 0 && b.fall < 1)) continue;
          let x = b.x, y = b.y, s = 1;
          if (!b.on) { const f = b.fall, e = f * f; x = b.ox + (POCK[b.pk][0] - b.ox) * e; y = b.oy + (POCK[b.pk][1] - b.oy) * e; s = 1 - 0.45 * f; ctx.globalAlpha = 1 - f; }
          ctx.drawImage(shCv, x - 1.5 * BR * s + 3.5 * s, y - 1.5 * BR * s + 5 * s, 3 * BR * s, 3 * BR * s);
          ctx.globalAlpha = 1;
        }
        for (const b of balls) {
          if (!b.on && !(b.fall > 0 && b.fall < 1)) continue;
          if (b.rx || b.ry) roll(b);
          if (b.dirty) paint(b);
          let x = b.x, y = b.y, s = 1;
          if (!b.on) { const f = b.fall, e = f * f; x = b.ox + (POCK[b.pk][0] - b.ox) * e; y = b.oy + (POCK[b.pk][1] - b.oy) * e; s = 1 - 0.45 * f; }
          const r = (BR + 1) * s;
          ctx.drawImage(b.cv, x - r, y - r, 2 * r, 2 * r);
          if (!b.on) { ctx.fillStyle = `rgba(0,0,0,${(b.fall * 0.8).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, BR * s, 0, TAU); ctx.fill(); }
        }
        const c = balls[0];
        if (aimShown() && needCall()) drawCall();
        if (showAim && c.on) {
          drawGuide();
          if (inHand) {
            ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.lineDashOffset = -T * 24;
            ctx.beginPath(); ctx.arc(c.x, c.y, BR + 7, 0, TAU); ctx.stroke(); ctx.restore();
          }
        }
        if (aimShown() && c.on) drawCue(c.x, c.y, aimA, BR + 3 + curPow() * 70, 1);
        if (strikeFx) {
          strikeFx.t += dt;
          const t = strikeFx.t, k = Math.min(1, t / 0.05);
          drawCue(strikeFx.x, strikeFx.y, strikeFx.a, strikeFx.pull + (BR + 1 - strikeFx.pull) * k, clamp(1 - (t - 0.08) / 0.3, 0, 1));
          if (t > 0.4) strikeFx = null;
        }
        ctx.restore();
        drawBanner(dt);
      }

      api.loop(dt => {
        T += dt;
        if (state === 'roll') {
          acc += dt; rollT += dt;
          let k = 0;
          while (acc >= HSTEP && k++ < 8) { pStep(balls, ev); acc -= HSTEP; }
          if (k >= 8) acc = 0;
          if (online && (sendT += dt) >= 1 / 30) { sendT = 0; sendFrame(); }
        }
        let falling = false;
        for (const b of balls) if (b.fall > 0 && b.fall < 1) { b.fall = Math.min(1, b.fall + dt * 4.5); falling = true; }
        if (state === 'roll') { if (!falling && !moving(balls)) resolve(); }
        else if (state === 'ai') aiUpdate(dt);
        else if (state === 'watch') watch(falling);
        else if (state === 'wait') remoteAim(dt);
        else if (myTurn()) {
          keyboard(dt);
          if (fine && (fine.t += dt) > 0.3) aimA += fine.d * Math.min(0.6, 0.05 + (fine.t - 0.3) * 0.3) * dt;
          if (online) sendAim(dt);
        }
        clock(dt);
        const p = curPow();
        if (Math.abs(p - lastBar) > 0.002) { lastBar = p; setBar(p); }
        ring();
        draw(dt);
      });

      cv._pool = () => ({ state, mode, turn, me, groups, inHand, call, sn, shots, aimA, brk, balls: packX(), vert: VERT });
      balls = rack(); balls.forEach(initBall);
      if (invited) { mode = 'net'; updHud(); goOnline(); } else menu();
      return { destroy() { au.close(); } };
    }
  });


  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const SONGS = [
    ['Ode to Joy', 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4_ E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4_ D4 D4 E4 C4 D4 E4 F4 E4 C4 D4 E4 F4 E4 D4 C4 D4 G3_ E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4_'],
    ['Twinkle Twinkle', 'C4 C4 G4 G4 A4 A4 G4_ F4 F4 E4 E4 D4 D4 C4_ G4 G4 F4 F4 E4 E4 D4_ G4 G4 F4 F4 E4 E4 D4_ C4 C4 G4 G4 A4 A4 G4_ F4 F4 E4 E4 D4 D4 C4_'],
    ['Für Elise', 'E5 D#5 E5 D#5 E5 B4 D5 C5 A4_ C4 E4 A4 B4_ E4 G#4 B4 C5_ E4 E5 D#5 E5 D#5 E5 B4 D5 C5 A4_ C4 E4 A4 B4_ E4 C5 B4 A4__'],
    ['Minuet in G', 'D5 G4 A4 B4 C5 D5 G4 G4 E5 C5 D5 E5 F#5 G5 G4 G4 C5 D5 C5 B4 A4 B4 C5 B4 A4 G4 F#4 G4 A4 B4 G4 B4 A4__'],
    ['Jingle Bells', 'E4 E4 E4_ E4 E4 E4_ E4 G4 C4 D4 E4__ F4 F4 F4 F4 F4 E4 E4 E4 E4 D4 D4 E4 D4_ G4_ E4 E4 E4_ E4 E4 E4_ E4 G4 C4 D4 E4__ F4 F4 F4 F4 F4 E4 E4 E4 G4 G4 F4 D4 C4__']
  ].map(([name, s]) => ({
    name,
    notes: s.split(/\s+/).map(t => {
      const m = /^([A-G])([#b]?)(\d)(_*)$/.exec(t);
      return { m: 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0), l: 1 + m[4].length };
    })
  }));

  Ameplay.register({
    id: 'piano-tiles',
    title: 'Piano Tiles',
    category: 'Timing',
    blurb: 'Tap the black tiles in order and play the tune. Never hit white.',
    help: 'Tap or click the black tiles from the bottom up · or press <kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd> for the four columns · hold long tiles',
    better: 'high',
    format: v => v + (v === 1 ? ' tile' : ' tiles'),
    width: 560,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="8" width="44" height="48" rx="6"/><path d="M21 8v48M32 8v48M43 8v48"/><rect x="21" y="13" width="11" height="15" rx="2" fill="currentColor"/><rect x="43" y="34" width="11" height="15" rx="2" fill="currentColor"/><rect x="10" y="26" width="11" height="13" rx="2" fill="currentColor"/></svg>',
    css: `
.gm-piano-tiles{gap:12px}
.gm-piano-tiles .pt-hud{gap:6px 28px}
.gm-piano-tiles .pt-hud .g-stat:nth-child(3) .v{font-size:16px;line-height:28px;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-piano-tiles .g-canvas{background:#fff;box-shadow:0 0 0 1px var(--line),0 18px 40px -26px rgba(31,29,43,.6);cursor:pointer}
@media (max-width:520px){.gm-piano-tiles .pt-hud{gap:4px 14px}.gm-piano-tiles .g-stat{min-width:0}}`,
    mount(root, api) {
      const W = 400, H = 600, CW = W / 4, RH = H / 4, V0 = 2.6, VCAP = 9, KEYS = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
      root.innerHTML = `<div class="g-hud pt-hud">${['Tiles', 'Speed', 'Song', 'Best'].map(k => `<div class="g-stat"><span class="k">${k}</span><span class="v">—</span></div>`).join('')}</div>`;
      const hv = [...root.querySelectorAll('.pt-hud .v')];
      const { canvas: cv, ctx, toLocal } = api.canvas(W, H);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const au = makeAudio();
      let master = null, wave = null, ctxRef = null;
      const data = api.load() || {};
      let classicBest = +data.classic || 0;

      const sprite = (h, start) => {
        const c = document.createElement('canvas'), hh = h * RH;
        c.width = CW * dpr; c.height = hh * dpr;
        const g = c.getContext('2d');
        g.scale(dpr, dpr);
        rrect(g, 2, 2, CW - 4, hh - 4, 10);
        const gr = g.createLinearGradient(0, 0, 0, hh);
        if (start) { gr.addColorStop(0, '#9a88ff'); gr.addColorStop(1, '#5a49d6'); }
        else { gr.addColorStop(0, '#3a3852'); gr.addColorStop(1, '#13121b'); }
        g.fillStyle = gr; g.fill();
        g.save(); g.clip();
        const gl = g.createLinearGradient(0, 0, CW, 0);
        gl.addColorStop(0, 'rgba(255,255,255,.12)'); gl.addColorStop(0.5, 'rgba(255,255,255,0)');
        g.fillStyle = gl; g.fillRect(0, 0, CW * 0.55, hh);
        g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(0, 2, CW, 2);
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, hh - 6, CW, 4);
        g.restore();
        if (h > 1) {
          g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 3; g.lineCap = 'round';
          g.beginPath(); g.moveTo(CW / 2, 34); g.lineTo(CW / 2, hh - 22); g.stroke();
          g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(CW / 2, 22, 7, 0, TAU); g.fill();
        }
        if (start) { g.fillStyle = '#fff'; g.font = font(900, 19); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('START', CW / 2, hh / 2); }
        return c;
      };
      const SPR = { 1: sprite(1), 2: sprite(2), 3: sprite(3), s: sprite(1, true) };
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#fbfbfe'); bg.addColorStop(1, '#f0f1f7');

      let mode = 'arcade', tiles = [], made = 0, next = 0, s = 0, sTarget = 0, v = 0, vMax = 0, score = 0, state = 'menu';
      let songN = Math.floor(Math.random() * SONGS.length), song = SONGS[songN], si = 0, t0 = 0, elapsed = 0, hold = null, fx = [], flash = null, shake = 0, pop = 0, lastCol = -1, why = '';

      function ensureAudio() {
        const ac = au.get();
        if (!ac) return null;
        if (ctxRef !== ac) {
          ctxRef = ac;
          master = ac.createGain(); master.gain.value = 0.55;
          const comp = ac.createDynamicsCompressor();
          master.connect(comp).connect(ac.destination);
          const amps = [0, 1, 0.62, 0.34, 0.22, 0.13, 0.08, 0.05, 0.03, 0.02], re = new Float32Array(amps.length), im = new Float32Array(amps);
          wave = ac.createPeriodicWave(re, im);
        }
        return ac;
      }
      function playNote(m, sustain) {
        const ac = ensureAudio();
        if (!ac) return null;
        try {
          const t = ac.currentTime, f = 440 * Math.pow(2, (m - 69) / 12), g = ac.createGain(), lp = ac.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(Math.min(14000, f * 9), t); lp.frequency.setTargetAtTime(f * 2.2, t, sustain ? 0.8 : 0.3);
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.42, t + 0.005);
          g.gain.setTargetAtTime(sustain ? 0.16 : 0.09, t + 0.006, sustain ? 0.6 : 0.25);
          if (!sustain) g.gain.setTargetAtTime(0.0001, t + 0.6, 0.35);
          lp.connect(g); g.connect(master);
          const os = [0, 5].map(det => { const o = ac.createOscillator(); o.setPeriodicWave(wave); o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + (sustain ? 20 : 2.4)); return o; });
          return sustain ? {
            stop() {
              try {
                const n = ac.currentTime;
                g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), n); g.gain.setTargetAtTime(0.0001, n, 0.12);
                os.forEach(o => o.stop(n + 0.8));
              } catch (e) {}
            }
          } : null;
        } catch (e) { return null; }
      }

      function hud() {
        const vals = [String(score), mode === 'arcade' ? (state === 'ready' ? V0 : v).toFixed(1) + '/s' : elapsed > 0 ? (score / (elapsed / 1000)).toFixed(1) + '/s' : '—', (tiles[Math.max(0, next - 1)] || tiles[0] || { sn: song.name }).sn, mode === 'arcade' ? (api.best == null ? '—' : String(api.best)) : classicBest ? (classicBest / 1000).toFixed(2) + ' s' : '—'];
        hv.forEach((el, i) => { if (el.textContent !== vals[i]) el.textContent = vals[i]; });
      }
      function addTile() {
        if (mode === 'classic' && made >= 50) return false;
        made++;
        const prev = tiles[tiles.length - 1], y = prev ? prev.y + prev.h : 1, nt = song.notes[si], sn = song.name;
        si++;
        if (si >= song.notes.length) { songN++; song = SONGS[songN % SONGS.length]; si = 0; }
        let col;
        do col = Math.floor(Math.random() * 4); while (col === lastCol);
        lastCol = col;
        tiles.push({ y, h: mode === 'arcade' && nt.l > 1 && tiles.length > 5 ? Math.min(3, nt.l) : 1, col, m: nt.m, sn, st: 0, p: 0, t: 0, hs: 0 });
        return true;
      }
      function setup(m) {
        mode = m; tiles = []; made = 0; next = 0; s = 0; sTarget = 0; score = 0; v = 0; vMax = 0; elapsed = 0; fx = []; flash = null; shake = 0; pop = 0; lastCol = -1;
        if (hold) { if (hold.voice) hold.voice.stop(); hold = null; }
        songN++; song = SONGS[songN % SONGS.length]; si = 0;
        while (tiles.length < 9 && addTile());
        state = 'ready';
        api.score(mode === 'arcade' ? 0 : '0.00 s');
        hud();
      }
      function burst(x, y, n, hue) {
        for (let i = 0; i < n; i++) { const a = rand(0, TAU), sp = rand(80, 320); fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: rand(0.35, 0.6), t: 0, r: rand(2, 4.5), c: hue || C.hues[i % 6] }); }
        fx.push({ ring: 1, x, y, t: 0, life: 0.4 });
      }
      function hit(tl, id, t, px, py) {
        if (state === 'ready') { state = 'play'; t0 = t; if (mode === 'arcade') v = V0; }
        next++;
        score++;
        pop = 1;
        const voice = playNote(tl.m, tl.h > 1);
        if (tl.h > 1) { tl.st = 1; tl.hs = s; hold = { tl, id, voice }; }
        else tl.st = 2;
        burst(px == null ? tl.col * CW + CW / 2 : px, py == null ? H - (tl.y - s) * RH - RH / 2 : py, 7);
        if (mode === 'arcade') { v = Math.min(VCAP, V0 + score * 0.045); vMax = v; }
        else {
          sTarget = tiles[next] ? tiles[next].y - 1 : tl.y;
          if (score >= 50) { elapsed = t - t0; return classicWin(); }
        }
        api.score(mode === 'arcade' ? score : (Math.max(0, t - t0) / 1000).toFixed(2) + ' s');
        hud();
      }
      function endHold(full) {
        const { tl, voice } = hold;
        hold = null;
        if (voice) voice.stop();
        const bonus = full ? tl.h : Math.floor(tl.p * tl.h);
        tl.st = 2; tl.t = 0;
        if (bonus) {
          score += bonus; pop = 1;
          const bot = H - (tl.y - s) * RH;
          fx.push({ txt: '+' + bonus, x: tl.col * CW + CW / 2, y: Math.max(40, bot - tl.h * RH * tl.p), t: 0, life: 0.8 });
          api.score(score); hud();
        }
      }
      function press(col, y, id, t, px) {
        if (state !== 'ready' && state !== 'play') return;
        ensureAudio();
        const tl = tiles[next];
        if (!tl) return;
        const bot = H - (tl.y - s) * RH, top = bot - tl.h * RH;
        if (col === tl.col && (y == null || (y >= top - RH * 0.5 && y <= bot + RH * 0.5))) return hit(tl, id, t, px, y);
        if (state === 'ready') return;
        if (y != null) for (const o of tiles) {
          if (o.col !== col) continue;
          const b = H - (o.y - s) * RH;
          if (y <= b && y >= b - o.h * RH) return;
        }
        fail(col, y == null ? tl.y : Math.floor(s + (H - y) / RH), 1, 'You tapped a white key.');
      }
      function release(id) { if (hold && hold.id === id) endHold(false); }
      function fail(col, row, h, msg, miss) {
        state = 'fail'; why = msg;
        if (hold) { if (hold.voice) hold.voice.stop(); hold = null; }
        flash = { col, row, h, t: 0, miss, sBack: row - 0.6 };
        shake = 1;
        const ac = ensureAudio();
        if (ac) [45, 46, 52].forEach(m => playNote(m, false));
        api.sfx('bad');
        api.timeout(gameOver, 1100);
      }
      function gameOver() {
        state = 'over';
        if (mode === 'arcade') {
          const nb = api.submit(score);
          hud();
          api.overlay({
            kicker: nb ? 'New best!' : 'Game over', title: score + (score === 1 ? ' tile' : ' tiles'), text: why,
            stats: [['Tiles', score], ['Top speed', (vMax || V0).toFixed(1) + '/s'], ['Best', api.best ?? '—']],
            button: 'Play again', onAction: () => setup('arcade'), secondary: 'Classic 50', onSecondary: () => setup('classic')
          });
        } else {
          api.overlay({
            kicker: 'Classic', title: 'Missed', text: why + ' Classic runs only count when all 50 tiles are tapped.',
            stats: [['Tiles', score + '/50'], ['Time', (elapsed / 1000).toFixed(2) + ' s'], ['Best', classicBest ? (classicBest / 1000).toFixed(2) + ' s' : '—']],
            button: 'Play again', onAction: () => setup('classic'), secondary: 'Arcade', onSecondary: () => setup('arcade')
          });
        }
      }
      function classicWin() {
        state = 'done';
        const nb = !classicBest || elapsed < classicBest;
        if (nb) { classicBest = Math.round(elapsed); data.classic = classicBest; api.save(data); }
        api.score((elapsed / 1000).toFixed(2) + ' s');
        hud();
        api.sfx('win');
        burst(W / 2, H / 2, 24);
        api.timeout(() => {
          state = 'over';
          api.overlay({
            kicker: nb ? 'New best!' : 'Classic', title: (elapsed / 1000).toFixed(2) + ' s', text: 'All 50 tiles, cleanly played. Shave off a little more time?',
            stats: [['Time', (elapsed / 1000).toFixed(2) + ' s'], ['Tiles/s', (50 / (elapsed / 1000)).toFixed(1)], ['Best', (classicBest / 1000).toFixed(2) + ' s']],
            button: 'Play again', onAction: () => setup('classic'), secondary: 'Arcade', onSecondary: () => setup('arcade')
          });
        }, 900);
      }

      cv.addEventListener('pointerdown', e => {
        e.preventDefault();
        const p = toLocal(e);
        press(clamp(Math.floor(p.x / CW), 0, 3), p.y, 'p' + e.pointerId, e.timeStamp || performance.now(), p.x);
      });
      cv.addEventListener('contextmenu', e => e.preventDefault());
      api.on(window, 'pointerup', e => release('p' + e.pointerId));
      api.on(window, 'pointercancel', e => release('p' + e.pointerId));
      api.on(window, 'keydown', e => {
        const col = KEYS.indexOf(e.code);
        if (col < 0 || e.repeat) return;
        e.preventDefault();
        press(col, null, e.code, e.timeStamp || performance.now());
      });
      api.on(window, 'keyup', e => release(e.code));

      api.loop((dt, now) => {
        if (state === 'play') {
          if (mode === 'arcade') {
            s += v * dt;
            if (hold) {
              const tl = hold.tl;
              tl.p = clamp((s - tl.hs) / Math.max(0.2, tl.y + tl.h - 1 - tl.hs), 0, 1);
              if (tl.p >= 1) endHold(true);
            }
            const tl = tiles[next];
            if (tl && s > tl.y + 0.35) fail(tl.col, tl.y, tl.h, 'A tile slipped past.', true);
          } else {
            s += (sTarget - s) * Math.min(1, dt * 24);
            elapsed = now - t0;
          }
          while (tiles[tiles.length - 1].y < s + 6 && addTile());
          while (tiles.length > 12 && next > 2 && tiles[0].y + tiles[0].h < s - 1) { tiles.shift(); next--; }
        } else if (state === 'fail' && flash) {
          flash.t += dt;
          if (flash.miss) s += (flash.sBack - s) * Math.min(1, dt * 9);
        } else if (state === 'done') s += (sTarget - s) * Math.min(1, dt * 24);
        for (const tl of tiles) if (tl.st === 2) tl.t += dt;
        pop = Math.max(0, pop - dt * 5);
        shake = Math.max(0, shake - dt * 3);
        draw(dt);
      });

      function draw(dt) {
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
        ctx.save();
        if (shake) ctx.translate((Math.random() - 0.5) * 10 * shake, 0);
        const r0 = Math.floor(s) - 1;
        ctx.fillStyle = 'rgba(31,29,43,.045)';
        for (let r = r0; r < r0 + 7; r++) { const y = H - (r - s) * RH; ctx.fillRect(0, y - 0.5, W, 1); }
        ctx.fillStyle = '#e4e6ee';
        for (let c = 1; c < 4; c++) ctx.fillRect(c * CW - 0.5, 0, 1, H);
        if (s < 1.2) {
          const bot = H + s * RH, top = bot - RH, gr = ctx.createLinearGradient(0, top, 0, bot);
          gr.addColorStop(0, 'rgba(108,92,231,.06)'); gr.addColorStop(1, 'rgba(108,92,231,.2)');
          ctx.fillStyle = gr; ctx.fillRect(0, top, W, RH);
          ctx.fillStyle = 'rgba(108,92,231,.75)'; ctx.font = font(900, 15); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(state === 'ready' ? 'Tap START to begin' : '', W / 2, top + RH / 2);
        }
        if (mode === 'classic') {
          const bot = H - (51 - s) * RH;
          if (bot > -40 && bot < H + 40) {
            for (let i = 0; i < 20; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? '#1f1d2b' : '#fff'; ctx.fillRect(i * 20, bot - 20 - j * 10, 20, 10); }
            ctx.fillStyle = C.good; ctx.font = font(900, 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FINISH', W / 2, bot - 60);
          }
        }
        for (let i = 0; i < tiles.length; i++) {
          const tl = tiles[i], bot = H - (tl.y - s) * RH, hh = tl.h * RH, top = bot - hh;
          if (top > H || bot < 0) continue;
          const x = tl.col * CW;
          if (tl.st === 2) {
            rrect(ctx, x + 2, top + 2, CW - 4, hh - 4, 10); ctx.fillStyle = 'rgba(31,29,43,.08)'; ctx.fill();
            const k = Math.min(1, tl.t / 0.16);
            if (k < 1) { ctx.globalAlpha = 1 - k; ctx.drawImage(SPR[tl.h], x, top, CW, hh); ctx.globalAlpha = 1; }
          } else {
            ctx.drawImage(i === next && state === 'ready' ? SPR.s : SPR[tl.h], x, top, CW, hh);
            if (tl.st === 1) {
              const fh = (hh - 4) * tl.p, gr = ctx.createLinearGradient(0, bot, 0, bot - fh);
              gr.addColorStop(0, '#6c5ce7'); gr.addColorStop(1, '#c084fc');
              ctx.save(); ctx.shadowColor = 'rgba(168,85,247,.8)'; ctx.shadowBlur = 16;
              rrect(ctx, x + 6, bot - 2 - fh, CW - 12, Math.max(10, fh), 8); ctx.fillStyle = gr; ctx.fill(); ctx.restore();
            }
          }
        }
        if (flash && Math.floor(flash.t * 8) % 2 === 0) {
          const bot = H - (flash.row - s) * RH;
          ctx.save(); ctx.shadowColor = 'rgba(239,79,79,.7)'; ctx.shadowBlur = 20;
          rrect(ctx, flash.col * CW + 2, bot - flash.h * RH + 2, CW - 4, flash.h * RH - 4, 10); ctx.fillStyle = '#ef4f4f'; ctx.fill(); ctx.restore();
        }
        for (let i = fx.length - 1; i >= 0; i--) {
          const f = fx[i];
          f.t += dt;
          if (f.t >= f.life) { fx.splice(i, 1); continue; }
          const k = f.t / f.life;
          if (f.ring) { ctx.strokeStyle = `rgba(108,92,231,${(1 - k) * 0.7})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, 10 + k * 60, 0, TAU); ctx.stroke(); }
          else if (f.txt) { ctx.globalAlpha = 1 - k; ctx.fillStyle = '#a855f7'; ctx.font = font(900, 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.txt, f.x, f.y - k * 40); ctx.globalAlpha = 1; }
          else {
            f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 700 * dt;
            ctx.globalAlpha = 1 - k; ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k * 0.5), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
          }
        }
        ctx.font = font(900, 15); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(31,29,43,.2)';
        for (let c = 0; c < 4; c++) ctx.fillText('DFJK'[c], c * CW + CW / 2, H - 16);
        ctx.restore();
        const txt = mode === 'classic' ? (state === 'ready' ? '0.00' : (elapsed / 1000).toFixed(2)) : String(score);
        ctx.save();
        ctx.translate(W / 2, 54); ctx.scale(1 + pop * 0.18, 1 + pop * 0.18);
        ctx.font = font(900, 52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.strokeText(txt, 0, 0);
        ctx.fillStyle = '#ef4f4f'; ctx.fillText(txt, 0, 0);
        if (mode === 'classic') { ctx.font = font(900, 14); ctx.lineWidth = 5; ctx.strokeText(`${score} / 50`, 0, 36); ctx.fillStyle = C.ink2; ctx.fillText(`${score} / 50`, 0, 36); }
        ctx.restore();
      }

      setup('arcade');
      state = 'menu';
      api.overlay({
        kicker: 'Timing', title: 'Piano Tiles',
        text: 'Tap only the black tiles, bottom to top. Each tile plays the next note of the song; hold the long ones. Touch white or let a tile slip by and it is over. <b>Play</b> is endless Arcade; <b>Classic</b> is 50 tiles against the clock.',
        button: 'Play', onAction: () => setup('arcade'), secondary: 'Classic 50', onSecondary: () => setup('classic')
      });
      return { destroy() { if (hold && hold.voice) hold.voice.stop(); au.close(); } };
    }
  });


  const RANKS = [[0, 'Turtle', 'Slow and steady. Loosen up and try again.'], [4, 'Rabbit', 'Quick hands. Keep the rhythm going.'], [6, 'Fox', 'Faster than most people who try this.'], [8, 'Horse', 'Seriously fast clicking.'], [10, 'Cheetah', 'Elite speed. Top of the food chain.']];
  const rankOf = v => RANKS.reduce((r, x) => (v >= x[0] ? x : r), RANKS[0]);

  Ameplay.register({
    id: 'cps-test',
    title: 'CPS Test',
    category: 'Reflex',
    blurb: 'How many clicks per second can you manage? Pick a timer and go.',
    help: 'Click or tap the pad as fast as you can · or mash <kbd>Space</kbd>, <kbd>Z</kbd>, <kbd>X</kbd> · <kbd>1</kbd>–<kbd>4</kbd> pick the timer',
    better: 'high',
    format: v => v.toFixed(1) + ' CPS',
    width: 760,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M27 25l25 10-10 4-4 10z" fill="currentColor" fill-opacity=".25"/><path d="M27 25l25 10-10 4-4 10z"/><path d="M42 39l10 10"/><path d="M22 8v8M8 22h8M12 12l5.5 5.5M32 12l-5.5 5.5M12 32l5.5-5.5"/></svg>',
    css: `
.gm-cps-test{gap:14px}
.gm-cps-test .cp-modes{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gm-cps-test .cp-mode{display:flex;flex-direction:column;align-items:center;gap:1px;min-width:80px;padding:8px 14px;border-radius:14px;border:2px solid var(--line-2);background:#fff;font:inherit;color:var(--ink);cursor:pointer;transition:border-color .2s,background .2s,transform .3s var(--spring)}
.gm-cps-test .cp-mode:hover{transform:translateY(-2px)}
.gm-cps-test .cp-mode b{font-size:16px;font-weight:900}
.gm-cps-test .cp-mode span{font-size:11px;font-weight:800;color:var(--muted)}
.gm-cps-test .cp-mode.on{border-color:var(--accent);background:var(--accent);color:#fff}
.gm-cps-test .cp-mode.on span{color:rgba(255,255,255,.82)}
.gm-cps-test .cp-mode:disabled{opacity:.45;cursor:default;transform:none}
.gm-cps-test .cp-hud{gap:6px 30px}
.gm-cps-test .cp-pad{position:relative;width:100%;height:clamp(220px,40vh,320px);display:grid;place-items:center;overflow:hidden;border-radius:26px;color:#fff;text-align:center;cursor:pointer;touch-action:none;background:radial-gradient(120% 130% at 18% 0%,#ff9a62 0%,#ff595e 46%,#c9184a 100%);box-shadow:0 22px 44px -26px rgba(201,24,74,.95),inset 0 -7px 0 rgba(0,0,0,.12),inset 0 2px 0 rgba(255,255,255,.25)}
.gm-cps-test .cp-pad.run{background:radial-gradient(120% 130% at 18% 0%,#ffc15e 0%,#ff6a3d 46%,#e01e5a 100%)}
.gm-cps-test .cp-pad.done{background:radial-gradient(120% 130% at 18% 0%,#a594ff 0%,#6c5ce7 50%,#4433b8 100%);box-shadow:0 22px 44px -26px rgba(76,59,196,.95),inset 0 -7px 0 rgba(0,0,0,.12),inset 0 2px 0 rgba(255,255,255,.25)}
.gm-cps-test .cp-pad::before{content:"";position:absolute;inset:0;background:repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.06) 0 2px,transparent 2px 26px);pointer-events:none}
.gm-cps-test .cp-in{position:relative;z-index:1;pointer-events:none}
.gm-cps-test .cp-big{font-size:clamp(46px,9vw,88px);font-weight:900;line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums;text-shadow:0 4px 0 rgba(0,0,0,.14)}
.gm-cps-test .cp-sub{margin-top:12px;font-size:15px;font-weight:800;opacity:.9}
.gm-cps-test .cp-rip{position:absolute;width:190px;height:190px;margin:-95px 0 0 -95px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.6) 0,rgba(255,255,255,.18) 45%,rgba(255,255,255,0) 70%);pointer-events:none}
.gm-cps-test .cp-bar{position:absolute;left:0;bottom:0;width:100%;height:7px;background:rgba(255,255,255,.85);transform-origin:left center;transform:scaleX(var(--k,0))}
.gm-cps-test .g-canvas.cp-graph{background:transparent}
.gm-cps-test .cp-n{font-size:clamp(46px,10vw,92px);font-weight:900;line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums;text-shadow:0 4px 0 rgba(0,0,0,.14);transform-origin:50% 60%}
.gm-cps-test .cp-keys{font-size:13px;font-weight:800;opacity:.88}
@media (max-width:520px){.gm-cps-test .cp-mode{min-width:66px;padding:7px 10px}.gm-cps-test .cp-keys{font-size:11.5px}.gm-cps-test .cp-hud{gap:4px 14px}.gm-cps-test .g-stat{min-width:0}}`,
    mount(root, api) {
      const MODES = [1, 5, 10, 30];
      const data = api.load() || {};
      const bests = data.bests && typeof data.bests === 'object' ? data.bests : {};
      let mode = MODES.includes(data.mode) ? data.mode : 5;
      root.innerHTML = `<div class="cp-modes">${MODES.map(m => `<button type="button" class="cp-mode" data-m="${m}"><b>${m} s</b><span></span></button>`).join('')}</div>
<div class="g-hud cp-hud">${['Clicks', 'Time', 'CPS', 'Rank'].map(k => `<div class="g-stat"><span class="k">${k}</span><span class="v">—</span></div>`).join('')}</div>
<div class="cp-pad"><div class="cp-in"><div class="cp-big">Click!</div><div class="cp-sub"></div></div><i class="cp-bar"></i></div>`;
      const modeEls = [...root.querySelectorAll('.cp-mode')], hv = [...root.querySelectorAll('.cp-hud .v')];
      const pad = root.querySelector('.cp-pad'), inner = root.querySelector('.cp-in'), big = root.querySelector('.cp-big'), sub = root.querySelector('.cp-sub'), bar = root.querySelector('.cp-bar');
      const gr = api.canvas(720, 130);
      gr.canvas.classList.add('cp-graph');
      const g = gr.ctx, GW = gr.w, GH = gr.h;
      let state = 'idle', t0 = 0, clicks = 0, times = [], samples = [], lastSample = -1, lastSub = '', final = 0, peak = 0;

      const save = () => api.save({ mode, bests });
      const setHud = (vals) => vals.forEach((v, i) => { if (hv[i].textContent !== v) hv[i].textContent = v; });
      const paintModes = () => modeEls.forEach(el => {
        const m = +el.dataset.m;
        el.classList.toggle('on', m === mode);
        el.disabled = state === 'run' || state === 'done';
        el.lastChild.textContent = bests[m] ? 'best ' + bests[m].toFixed(1) : 'no best';
      });
      const padCls = extra => 'cp-pad' + (extra ? ' ' + extra : '');
      const winCps = el => {
        const w = Math.min(1000, Math.max(el, 250));
        let n = 0;
        for (let i = times.length - 1; i >= 0 && times[i] > el - w; i--) if (times[i] <= el) n++;
        return n / (w / 1000);
      };
      function drawGraph() {
        g.clearRect(0, 0, GW, GH);
        rrect(g, 0.5, 0.5, GW - 1, GH - 1, 16); g.fillStyle = '#f7f7fb'; g.fill(); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
        const x0 = 40, x1 = GW - 16, y0 = 14, y1 = GH - 26, top = Math.max(10, Math.ceil(Math.max(peak, final) / 5) * 5);
        g.font = font(800, 11); g.fillStyle = C.soft; g.textAlign = 'right'; g.textBaseline = 'middle';
        for (const v of [0, top / 2, top]) {
          const y = y1 - (v / top) * (y1 - y0);
          g.fillRect(x0, Math.round(y) - 0.5, x1 - x0, 1);
          g.fillStyle = C.muted; g.fillText(String(v), x0 - 8, y); g.fillStyle = 'rgba(163,161,179,.35)';
        }
        g.textAlign = 'left'; g.fillStyle = C.muted; g.fillText('0 s', x0, GH - 12);
        g.textAlign = 'right'; g.fillText(mode + ' s', x1, GH - 12);
        g.textAlign = 'center'; g.fillText('clicks per second', (x0 + x1) / 2, GH - 12);
        if (samples.length < 2) return;
        const X = t => x0 + (t / (mode * 1000)) * (x1 - x0), Y = v => y1 - Math.min(1, v / top) * (y1 - y0);
        g.beginPath(); g.moveTo(X(samples[0][0]), y1);
        for (const [t, v] of samples) g.lineTo(X(t), Y(v));
        g.lineTo(X(samples[samples.length - 1][0]), y1); g.closePath();
        const fill = g.createLinearGradient(0, y0, 0, y1);
        fill.addColorStop(0, 'rgba(255,89,94,.35)'); fill.addColorStop(1, 'rgba(255,89,94,0)');
        g.fillStyle = fill; g.fill();
        g.beginPath();
        samples.forEach(([t, v], i) => (i ? g.lineTo(X(t), Y(v)) : g.moveTo(X(t), Y(v))));
        g.strokeStyle = '#ff595e'; g.lineWidth = 2.5; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
        const [lt, lv] = samples[samples.length - 1];
        g.beginPath(); g.arc(X(lt), Y(lv), 4.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#ff595e'; g.lineWidth = 2.5; g.stroke();
        if (state === 'done') {
          const y = Y(final);
          g.setLineDash([5, 5]); g.strokeStyle = C.accent; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.setLineDash([]);
          g.font = font(900, 11); g.fillStyle = C.accent; g.textAlign = 'left'; g.textBaseline = 'bottom';
          g.fillText('avg ' + final.toFixed(1), x0 + 6, y - 3);
        }
      }
      function arm() {
        state = 'ready'; clicks = 0; times = []; samples = []; lastSample = -1; final = 0; peak = 0;
        pad.className = padCls();
        big.textContent = 'Click to start';
        sub.textContent = `${mode}-second test · the clock starts on your first click`;
        bar.style.setProperty('--k', '0');
        setHud(['0', mode.toFixed(1) + ' s', '—', '—']);
        paintModes(); api.score('—'); drawGraph();
      }
      function ripple(x, y) {
        const el = document.createElement('span');
        el.className = 'cp-rip'; el.style.left = x + 'px'; el.style.top = y + 'px';
        pad.append(el);
        if (pad.children.length > 27) pad.querySelector('.cp-rip').remove();
        if (el.animate) {
          const a = el.animate([{ transform: 'scale(.15)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' });
          a.onfinish = () => el.remove();
        } else api.timeout(() => el.remove(), 520);
        if (inner.animate) inner.animate([{ transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 140, easing: 'ease-out' });
      }
      function tap(t, x, y) {
        if (state === 'ready') {
          state = 'run'; t0 = t;
          pad.classList.add('run'); paintModes();
          api.timeout(finish, Math.max(0, mode * 1000 - (performance.now() - t)));
        } else if (state !== 'run') return;
        if (t - t0 > mode * 1000) return;
        clicks++; times.push(t - t0);
        big.textContent = clicks;
        hv[0].textContent = clicks;
        ripple(x, y);
        api.sfx('tick');
      }
      function finish() {
        if (state !== 'run') return;
        state = 'done';
        final = clicks / mode;
        peak = final;
        for (let el = 1000; el <= mode * 1000; el += 25) peak = Math.max(peak, winCps(el));
        samples.push([mode * 1000, winCps(mode * 1000)]);
        const prev = bests[mode] || 0, rk = rankOf(final);
        if (final > prev) bests[mode] = final;
        save();
        const nb = api.submit(Math.round(final * 10) / 10);
        api.score(final);
        api.sfx(nb ? 'win' : 'good');
        pad.className = padCls('done');
        big.textContent = final.toFixed(1);
        sub.textContent = 'CPS · ' + rk[1];
        bar.style.setProperty('--k', '1');
        setHud([String(clicks), mode.toFixed(1) + ' s', final.toFixed(1), rk[1]]);
        paintModes(); drawGraph();
        const m = mode, mb = bests[m], n = clicks;
        api.timeout(() => api.overlay({
          kicker: nb ? 'New best!' : final > prev ? 'New ' + m + ' s best' : 'Result',
          title: final.toFixed(1) + ' CPS',
          text: `${n} clicks in ${m} second${m === 1 ? '' : 's'}. Rank: <b>${rk[1]}</b>. ${rk[2]}`,
          stats: [['Clicks', n], ['Peak', peak.toFixed(1)], [m + ' s best', mb.toFixed(1)]],
          button: 'Try again', onAction: arm,
          secondary: 'Next timer', onSecondary: () => { mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length]; save(); arm(); }
        }), 750);
      }

      pad.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        const r = pad.getBoundingClientRect();
        tap(e.timeStamp || performance.now(), e.clientX - r.left, e.clientY - r.top);
      });
      pad.addEventListener('contextmenu', e => e.preventDefault());
      api.on(window, 'keydown', e => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        const d = /^Digit([1-4])$/.exec(e.code);
        if (d && (state === 'ready' || state === 'idle')) { mode = MODES[+d[1] - 1]; save(); arm(); return; }
        if (e.code !== 'Space' && !/^Key[A-Z]$/.test(e.code)) return;
        if (state !== 'ready' && state !== 'run') return;
        e.preventDefault();
        const r = pad.getBoundingClientRect();
        tap(e.timeStamp || performance.now(), r.width / 2 + rand(-r.width * 0.3, r.width * 0.3), r.height / 2 + rand(-r.height * 0.25, r.height * 0.25));
      });
      modeEls.forEach(el => el.addEventListener('click', () => { if (state === 'run' || state === 'done') return; mode = +el.dataset.m; save(); arm(); }));

      api.loop(() => {
        if (state !== 'run') return;
        const el = Math.min(mode * 1000, performance.now() - t0);
        if (el - lastSample >= 50) {
          lastSample = el;
          const c = winCps(el);
          samples.push([el, c]);
          peak = Math.max(peak, c);
          const txt = `${c.toFixed(1)} CPS · ${((mode * 1000 - el) / 1000).toFixed(1)} s left`;
          if (txt !== lastSub) { lastSub = txt; sub.textContent = txt; }
          setHud([String(clicks), ((mode * 1000 - el) / 1000).toFixed(1) + ' s', (clicks / Math.max(el, 250) * 1000).toFixed(1), rankOf(c)[1]]);
          drawGraph();
        }
        bar.style.setProperty('--k', (el / (mode * 1000)).toFixed(4));
      });

      arm();
      state = 'idle';
      paintModes();
      api.overlay({
        kicker: 'Reflex', title: 'CPS Test',
        text: 'Click the pad as fast as you can until the timer runs out. Pick 1, 5, 10 or 30 seconds; the clock starts on your first click. Ranks run from Turtle to Cheetah.',
        button: 'Play', onAction: arm
      });
    }
  });
})();

