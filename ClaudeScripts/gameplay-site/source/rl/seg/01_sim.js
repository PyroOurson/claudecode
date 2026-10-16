
(() => {
  'use strict';
  const ID = 'rocket-soccer';

  const CFG = {
    hz: 120, g: 650,
    X: 4096, Y: 5120, H: 2044, corner: 8064, ramp: 256,
    goalW: 892.755, goalH: 642.775, goalD: 880, postK: 24, goalR: 100, goalLine: 5124.25,
    ballR: 91.25, ballRest: 93.15, ballVis: 92.75, ballMax: 6000, ballDrag: 0.03, ballCR: 0.6, ballMu: 0.35, ballMaxW: 6, ballMass: 30, ballRestV: 15,
    carMass: 180, carRest: 17, carRespawnZ: 36,
    carMax: 2300, boostGround: 2975 / 3, boostAir: 3175 / 3, airThrottle: 200 / 3,
    boostUse: 100 / 3, boostMin: 0.1, superStart: 2200, superKeep: 2100, superKeepT: 1,
    facets: 8, rampBack: 160, rampBlend: 400, thrWheel: 400, brakeWheel: 875, rollK: 113.73963 * 60, fricK: 60, stopV: 25, coastBrake: 0.15,
    jumpImp: 875 / 3, jumpAcc: 4375 / 3, jumpMin: 0.025, jumpMax: 0.2, jumpPad: 1 / 40, jumpPre: 0.62, dodgeWindow: 1.25, dodgeDead: 0.5,
    flipImp: 500, flipTime: 0.65, flipZDamp: 0.35, flipZStart: 0.15, flipZEnd: 0.21, flipSide: 1.9, flipBack: 2.5, flipBackX: 16 / 15, flipTX: 260, flipTY: 224, flipLock: 0.3,
    airT: [130, 95, 400], airD: [30, 20, 50], torqueK: Math.PI * 2 / 65536 * 1000, maxW: 5.5,
    afImp: 200, afTorque: 50, afTime: 0.4, afNormZ: Math.SQRT1_2, afRoll: 2.8, arForce: 100, arTorque: 80,
    susK: 500, susC: 25, susR: 40, susTravel: 12, susSub: 2.5, susScale: [36 - 1 / 4, 54 + 1 / 4 + 1.5 / 100],
    sticky: 0.5, slideRise: 5, slideFall: 2, hbLat: 0.1, worldMu: 0.3, worldCR: 0.3, carCarMu: 0.09, carCarCR: 0.1, carBallMu: 2,
    padBig: [100, 10, 208], padSmall: [12, 4, 144], padH: 95, padZ: [73, 70],
    kickBoost: 100 / 3, demoTime: 3, bumpCD: 0.25, bumpFwd: 64.5,
    steer: [[0, .53356], [500, .3193], [1000, .18203], [1500, .1057], [1750, .08507], [3000, .03454]],
    slideSteer: [[0, .39235], [2500, .1261]],
    drive: [[0, 1], [1400, .1], [1410, 0]],
    latF: [[0, 1], [1, .2]], hbLong: [[0, .5], [1, .9]], noStick: [[0, .1], [.7075, .5], [1, 1]],
    hit: [[0, .65], [500, .65], [2300, .55], [4600, .3]],
    bumpG: [[0, 5 / 6], [1400, 1100], [2200, 1530]], bumpA: [[0, 5 / 6], [1400, 1390], [2200, 1945]], bumpUp: [[0, 2 / 6], [1400, 278], [2200, 417]],
    spawns: [[-2048, -2560, .25], [2048, -2560, .75], [-256, -3840, .5], [256, -3840, .5], [0, -4608, .5]],
    respawns: [[-2304, -4608], [-2688, -4608], [2304, -4608], [2688, -4608]],
    big: [[-3584, 0], [3584, 0], [-3072, 4096], [3072, 4096], [-3072, -4096], [3072, -4096]],
    small: [[0, -4240], [-1792, -4184], [1792, -4184], [-940, -3308], [940, -3308], [0, -2816], [-3584, -2484], [3584, -2484], [-1788, -2300], [1788, -2300], [-2048, -1036], [0, -1024], [2048, -1036], [-1024, 0], [1024, 0], [-2048, 1036], [0, 1024], [2048, 1036], [-1788, 2300], [1788, 2300], [-3584, 2484], [3584, 2484], [0, 2816], [-940, 3310], [940, 3308], [-1792, 4184], [1792, 4184], [0, 4240]],
    cam: { fov: 110, dist: 270, height: 100, angle: -3, stiff: 0.45, swivel: 4.7, trans: 1.2 },
    pts: { goal: 100, assist: 50, save: 50, epicSave: 75, shot: 20, clear: 20, center: 10, aerial: 25, demo: 10, first: 10 }
  };

  const BODIES = {
    octane: { name: 'Octane', hitbox: 'Octane', hb: [60.2535, 43.3497, 19.32955], off: [13.8757, 0, 20.755], cz: 20.755, wf: [51.25, 25.9, 12.5], wb: [-33.75, 29.5, 15], sr: [38.755, 37.055] },
    fennec: { name: 'Fennec', hitbox: 'Octane', hb: [60.2535, 43.3497, 19.32955], off: [13.8757, 0, 20.755], cz: 20.755, wf: [51.25, 25.9, 12.5], wb: [-33.75, 29.5, 15], sr: [38.755, 37.055] },
    dominus: { name: 'Dominus', hitbox: 'Dominus', hb: [65.2135, 42.88995, 16.9], off: [9, 0, 15.75], cz: 15.75, wf: [50.3, 31.1, 12], wb: [-34.75, 33, 13.5], sr: [33.95, 33.85] },
  };
  const BODY_IDS = Object.keys(BODIES);
  const TAU = Math.PI * 2, BR = CFG.ballR, BRW = CFG.ballRest;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const curve = (c, x) => {
    if (x <= c[0][0]) return c[0][1];
    for (let i = 1; i < c.length; i++) if (x <= c[i][0]) { const a = c[i - 1], b = c[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
    return c[c.length - 1][1];
  };
  const v3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
  const vset = (o, x, y, z) => { o.x = x; o.y = y; o.z = z; return o; };
  const vcopy = (o, a) => vset(o, a.x, a.y, a.z);
  const vdot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const vlen = a => Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
  const vadd = (o, a, s) => { o.x += a.x * s; o.y += a.y * s; o.z += a.z * s; return o; };
  const vscale = (o, s) => { o.x *= s; o.y *= s; o.z *= s; return o; };
  const vcross = (o, a, b) => vset(o, a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  const vnorm = o => { const l = vlen(o); return l > 1e-9 ? vscale(o, 1 / l) : o; };
  function vrot(o, ax, ang) {
    const c = Math.cos(ang), s = Math.sin(ang), d = vdot(ax, o) * (1 - c);
    return vset(o, o.x * c + (ax.y * o.z - ax.z * o.y) * s + ax.x * d, o.y * c + (ax.z * o.x - ax.x * o.z) * s + ax.y * d, o.z * c + (ax.x * o.y - ax.y * o.x) * s + ax.z * d);
  }


  const RR = CFG.ramp, AX = CFG.X - RR, AY = CFG.Y - RR, AC = CFG.corner - RR * Math.SQRT2;
  const GW = CFG.goalW, GH = CFG.goalH, GB = CFG.Y + CFG.goalD, PK = CFG.postK, HT = CFG.H, V1 = AC - AX, V2 = AC - AY, GR = CFG.goalR;
  function segD(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = px - ax - dx * t, ey = py - ay - dy * t;
    return Math.sqrt(ex * ex + ey * ey);
  }
  function oct(x, y) {
    const s = Math.max(x - AX, y - AY, (x + y - AC) * Math.SQRT1_2);
    if (s <= 0) return s;
    return Math.min(segD(x, y, AX, -V1, AX, V1), segD(x, y, AX, V1, V2, AY), segD(x, y, V2, AY, -V2, AY));
  }
  const FN = CFG.facets, FT = [], FC = [], FS = [];
  for (let k = 0; k < FN; k++) { const a = Math.PI / 2 * (k + 0.5) / FN; FC.push(Math.cos(a)); FS.push(Math.sin(a)); if (k) FT.push(Math.tan(Math.PI / 2 * k / FN)); }
  const FK = Math.cos(Math.PI / 4 / FN), RBK = CFG.rampBack, RBL = 1 / CFG.rampBlend;
  function fil(h, v, r) {
    const p = r - h, q = r - v;
    if (p <= 0 || q <= 0) return h < v ? h : v;
    let k = 0;
    while (k < FN - 1 && q > p * FT[k]) k++;
    return r * FK - p * FC[k] - q * FS[k];
  }
  function sdf(x, y, z) {
    const ax = x < 0 ? -x : x, ay = y < 0 ? -y : y;
    const h = RR - oct(ax, ay), sb = ay - AY - Math.max(ax - AX, (ax + ay - AC) * Math.SQRT1_2);
    const wb = sb * RBL + 0.5, rf = wb <= 0 ? RR : wb >= 1 ? RBK : RR + (RBK - RR) * wb;
    const df = fil(h, z, rf), dc = fil(h, HT - z, RR);
    let d = df < dc ? df : dc;
    const qa = GR - GW + ax, qb = GR - GB + ay, qc = GR - GH + z, qd = GR - z;
    let dg;
    if (qa <= 0 && qb <= 0 && qc <= 0 && qd <= 0) dg = Math.min(GW - ax, GH - z, GB - ay);
    else { const a = qa > 0 ? qa : 0, b = qb > 0 ? qb : 0, e = qc > 0 ? qc : 0, f = qd > 0 ? qd : 0; dg = GR - Math.sqrt(a * a + b * b + e * e + f * f); }
    const hk = PK - Math.abs(d - dg);
    d = (d > dg ? d : dg) + (hk > 0 ? hk * hk / (4 * PK) : 0);
    return d < z ? d : z;
  }
  function sdfN(x, y, z, o) {
    o.x = sdf(x + 1, y, z) - sdf(x - 1, y, z); o.y = sdf(x, y + 1, z) - sdf(x, y - 1, z); o.z = sdf(x, y, z + 1) - sdf(x, y, z - 1);
    const l = Math.sqrt(o.x * o.x + o.y * o.y + o.z * o.z) || 1;
    o.x /= l; o.y /= l; o.z /= l;
    return o;
  }


  const makeBall = () => ({ p: v3(0, 0, CFG.ballRest), v: v3(), w: v3(), n: v3(0, 0, 1), floor: false, hidden: false });
  function bounce(b, n, vn) {
    const v = b.v, w = b.w, e = -vn < CFG.ballRestV ? 0 : CFG.ballCR;
    const sx = v.x - n.x * vn + BR * (n.y * w.z - n.z * w.y), sy = v.y - n.y * vn + BR * (n.z * w.x - n.x * w.z), sz = v.z - n.z * vn + BR * (n.x * w.y - n.y * w.x);
    v.x -= (1 + e) * n.x * vn; v.y -= (1 + e) * n.y * vn; v.z -= (1 + e) * n.z * vn;
    const sl = Math.sqrt(sx * sx + sy * sy + sz * sz);
    if (sl > 1e-3) {
      const k = Math.min(sl / 3.5, CFG.ballMu * (1 + e) * -vn) / sl, fx = -sx * k, fy = -sy * k, fz = -sz * k, A = 2.5 / BR;
      v.x += fx; v.y += fy; v.z += fz;
      w.x += A * (fy * n.z - fz * n.y); w.y += A * (fz * n.x - fx * n.z); w.z += A * (fx * n.y - fy * n.x);
    }
  }
  function ballStep(b, dt) {
    const p = b.p, v = b.v, w = b.w;
    v.z -= CFG.g * dt;
    vscale(v, Math.pow(1 - CFG.ballDrag, dt));
    const sp = vlen(v);
    if (sp > CFG.ballMax) vscale(v, CFG.ballMax / sp);
    vadd(p, v, dt);
    b.floor = false;
    let imp = 0;
    const d = sdf(p.x, p.y, p.z);
    if (d < BRW) {
      const n = sdfN(p.x, p.y, p.z, b.n);
      vadd(p, n, BRW - d);
      const vn = vdot(v, n);
      if (vn < 0) { imp = -vn; bounce(b, n, vn); }
      if (n.z > 0.7 && p.z < BRW + 30) b.floor = true;
    }
    const wl = vlen(w);
    if (wl > CFG.ballMaxW) vscale(w, CFG.ballMaxW / wl);
    return imp;
  }


  const CC = {};
  function carCfg(id) {
    if (CC[id]) return CC[id];
    const b = BODIES[id], h = b.hb, o = b.off, m3 = CFG.carMass / 3;
    const I = [m3 * (h[1] * h[1] + h[2] * h[2]), m3 * (h[0] * h[0] + h[2] * h[2]), m3 * (h[0] * h[0] + h[1] * h[1])];
    const wh = [];
    for (let i = 0; i < 4; i++) {
      const fr = i < 2, q = fr ? b.wf : b.wb, rest = b.sr[fr ? 0 : 1] - CFG.susTravel;
      wh.push({ x: q[0], y: i % 2 ? -q[1] : q[1], z: b.cz, r: q[2], rest, len: rest + CFG.susTravel + q[2] - CFG.susSub, push: rest + q[2] - CFG.susSub, k: CFG.susScale[fr ? 0 : 1], fr });
    }
    const pts = [];
    let rad = 0;
    for (let sx = -1; sx <= 1; sx++) for (let sy = -1; sy <= 1; sy++) for (let sz = -1; sz <= 1; sz++) {
      if (!sx && !sy && !sz) continue;
      const q = [o[0] + sx * h[0], sy * h[1], o[2] + sz * h[2]];
      pts.push(q); rad = Math.max(rad, Math.hypot(q[0], q[1], q[2]));
    }
    return (CC[id] = { b, h, o, I, wh, pts, rad: rad + 2, front: o[0] + h[0] });
  }
  let carSeq = 0;
  const NOCTL = { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, boost: false, jump: false, slide: false };
  const newSt = () => ({ score: 0, goals: 0, assists: 0, saves: 0, shots: 0, demos: 0 });
  const newAi = () => ({ mode: 'idle', role: 0, tx: 0, ty: 0, arrive: 0, want: 2300, think: 0, seq: null, stuck: 0, unst: 0, rest: 0, park: false, kind: '', dx: 0, dy: 1, D: null, pad: null, press: true, clear: false, shadow: false, retreat: false, boostOK: false, tgt: null, until: 0, kf: false, k0: 0, hfT: 0, save: false, opT: 9 });
  function makeCar(team, name, bot, body) {
    body = BODIES[body] ? body : 'octane';
    return {
      id: carSeq++, team, name, bot, slot: 0, body, cfg: carCfg(body),
      p: v3(), v: v3(), w: v3(), f: v3(1, 0, 0), l: v3(0, 1, 0), u: v3(0, 0, 1), n: v3(0, 0, 1),
      F: v3(), T: v3(), vc: v3(), wcn: v3(0, 0, 1),
      wh: [0, 1, 2, 3].map(() => ({ hit: 0, t: 0, sl: 0, rv: 0, inv: 1, push: 0, cx: 0, cy: 0, cz: 0, nx: 0, ny: 0, nz: 1, hx: 0, hy: 0, hz: 0, jx: 0, jy: 0, jz: 0 })),
      wz: [0, 0, 0, 0],
      boost: 0, boosting: false, boostT: 0, boostK: 0, onGround: true, nw: 4, nwW: 4, jumped: false, jumping: false, jumpT: 0, djumped: false, flipped: false, flipping: false, flipT: 0, fdx: 0, fdy: 0,
      airT: 0, ajT: 0, autoF: false, afT: 0, afS: 0, wc: false, steerA: 0,
      dodgeT: -1, sup: false, supT: 0, slide: 0, prevJump: false, demoT: 0, touch: false, touchT: -9, fs: 0, bumpId: -1, bumpCD: 0, resetT: -9, airHitT: -9, shotT: -9, landT: 0, rc: 0,
      ctl: { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, boost: false, jump: false, slide: false },
      st: newSt(),
      ai: bot ? newAi() : null
    };
  }
  function placeCar(c, x, y, yaw, z) {
    vset(c.p, x, y, z == null ? CFG.carRest : z); vset(c.v, 0, 0, 0); vset(c.w, 0, 0, 0); vset(c.vc, 0, 0, 0);
    vset(c.f, Math.cos(yaw), Math.sin(yaw), 0); vset(c.l, -Math.sin(yaw), Math.cos(yaw), 0); vset(c.u, 0, 0, 1); vset(c.n, 0, 0, 1);
    c.onGround = true; c.nw = c.nwW = 4; c.jumped = c.jumping = c.djumped = c.flipped = c.flipping = c.autoF = false;
    c.jumpT = c.flipT = c.airT = c.ajT = c.afT = 0; c.dodgeT = -1; c.wc = false; c.prevJump = true;
    c.sup = false; c.supT = 0; c.slide = 0; c.boosting = false; c.boostT = 0; c.boostK = 0; c.touch = false; c.demoT = 0; c.fs = 0; c.steerA = 0;
    c.boost = CFG.kickBoost;
    if (c.ai) { c.ai.seq = null; c.ai.stuck = 0; c.ai.rest = 0; c.ai.mode = 'idle'; c.ai.think = 0; c.ai.pad = null; c.ai.kf = false; }
  }
  function ortho(c) { vnorm(c.f); vnorm(vcross(c.l, c.u, c.f)); vcross(c.u, c.f, c.l); }
  function rotCar(c, ax, ang) { vrot(c.f, ax, ang); vrot(c.u, ax, ang); ortho(c); }
  const T1 = v3(), T2 = v3(), T3 = v3(), IW = v3();

  function iwm(c, x, y, z) {
    const I = c.cfg.I, f = c.f, l = c.l, u = c.u;
    const a = (x * f.x + y * f.y + z * f.z) / I[0], b = (x * l.x + y * l.y + z * l.z) / I[1], d = (x * u.x + y * u.y + z * u.z) / I[2];
    return vset(IW, f.x * a + l.x * b + u.x * d, f.y * a + l.y * b + u.y * d, f.z * a + l.z * b + u.z * d);
  }
  function cImp(c, jx, jy, jz, rx, ry, rz) {
    const m = CFG.carMass;
    c.v.x += jx / m; c.v.y += jy / m; c.v.z += jz / m;
    const q = iwm(c, ry * jz - rz * jy, rz * jx - rx * jz, rx * jy - ry * jx);
    c.w.x += q.x; c.w.y += q.y; c.w.z += q.z;
  }
  function cDen(c, rx, ry, rz, nx, ny, nz) {
    const ax = ry * nz - rz * ny, ay = rz * nx - rx * nz, az = rx * ny - ry * nx, q = iwm(c, ax, ay, az);
    return 1 / CFG.carMass + ax * q.x + ay * q.y + az * q.z;
  }

  function wheelRay(W, c, wd, s, dt) {
    const p = c.p, f = c.f, l = c.l, u = c.u, v = c.v, w = c.w;
    const hx = p.x + f.x * wd.x + l.x * wd.y + u.x * wd.z, hy = p.y + f.y * wd.x + l.y * wd.y + u.y * wd.z, hz = p.z + f.z * wd.x + l.z * wd.y + u.z * wd.z;
    s.hx = hx; s.hy = hy; s.hz = hz;
    const L = wd.len;
    let t = -1, hit = 0, d = sdf(hx, hy, hz);
    if (d <= 0) t = 0;
    else if (d < L + 1) {
      let tt = 0;
      for (let i = 0; i < 12; i++) {
        tt += d;
        if (tt > L) break;
        d = sdf(hx - u.x * tt, hy - u.y * tt, hz - u.z * tt);
        if (d < 0.15) { t = tt; break; }
      }
    }
    if (t >= 0) hit = 1;
    const B = W.ball;
    if (!B.hidden) {
      const mx = hx - B.p.x, my = hy - B.p.y, mz = hz - B.p.z, bb = mx * u.x + my * u.y + mz * u.z, cc = mx * mx + my * my + mz * mz - BR * BR;
      if (cc <= 0) { t = 0; hit = 2; }
      else if (bb > 0) {
        const disc = bb * bb - cc;
        if (disc >= 0) { const tb = bb - Math.sqrt(disc); if (tb <= L && (!hit || tb < t)) { t = tb; hit = 2; } }
      }
    }
    if (!hit) { s.hit = 0; s.sl = wd.rest + CFG.susTravel; s.rv = 0; s.inv = 1; s.push = 0; return 0; }
    const cx = hx - u.x * t, cy = hy - u.y * t, cz = hz - u.z * t;
    s.cx = cx; s.cy = cy; s.cz = cz; s.t = t; s.hit = hit;
    if (hit === 1) { sdfN(cx, cy, cz, T3); s.nx = T3.x; s.ny = T3.y; s.nz = T3.z; }
    else { s.nx = (cx - B.p.x) / BR; s.ny = (cy - B.p.y) / BR; s.nz = (cz - B.p.z) / BR; }
    const nx = s.nx, ny = s.ny, nz = s.nz;
    s.sl = clamp(t - wd.r, wd.rest - CFG.susTravel, wd.rest + CFG.susTravel);
    const rx = cx - p.x, ry = cy - p.y, rz = cz - p.z;
    const pv = nx * (v.x + w.y * rz - w.z * ry) + ny * (v.y + w.z * rx - w.x * rz) + nz * (v.z + w.x * ry - w.y * rx), den = nx * u.x + ny * u.y + nz * u.z;
    if (den > 0.1) { s.inv = 1 / den; s.rv = pv / den; } else { s.inv = 10; s.rv = 0; }
    s.push = 0;
    if (hit === 1 && t < wd.push) {
      const im = (0.2 * (wd.push - t) / dt - pv) / cDen(c, rx, ry, rz, nx, ny, nz);
      if (im > 0) s.push = im / 4;
    }
    return hit;
  }

  function carPre(W, c, dt) {
    const k = W.state === 'countdown' ? NOCTL : c.ctl, cf = c.cfg, p = c.p, v = c.v, w = c.w, f = c.f, l = c.l, u = c.u, m = CFG.carMass, B = W.ball;
    const jp = k.jump && !c.prevJump;
    vset(c.F, 0, 0, -CFG.g); vset(c.T, 0, 0, 0);
    let nc = 0, nW = 0, sx = 0, sy = 0, sz = 0;
    for (let i = 0; i < 4; i++) {
      const s = c.wh[i], wd = cf.wh[i], h = wheelRay(W, c, wd, s, dt);
      if (h) { nc++; if (h === 1) nW++; sx += s.nx; sy += s.ny; sz += s.nz; }
      c.wz[i] = wd.z - s.sl;
    }
    const wasG = c.onGround, wasW = c.nwW;
    c.onGround = nc >= 3; c.nw = nc; c.nwW = nW;
    if (nc) { const q = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1; sx /= q; sy /= q; sz /= q; vset(c.n, sx, sy, sz); }
    if (nW >= 3 && wasW < 3 && c.airT > 0.25) { c.landT = W.time; W.events.push({ type: 'land', car: c }); }
    if (c.onGround && !wasG && nW === 0 && (c.jumped || c.djumped || c.flipped) && W.time - c.resetT > 0.4) { c.resetT = W.time; W.events.push({ type: 'flipreset', car: c }); }
    const fwd = vdot(v, f), af = Math.abs(fwd);
    c.slide = clamp(c.slide + (k.slide ? CFG.slideRise : -CFG.slideFall) * dt, 0, 1);
    let thr = k.throttle, brk = 0;
    if (k.boost && c.boost > 0) thr = 1;
    let eng = thr;
    if (!k.slide) {
      if (Math.abs(thr) >= 0.001) { if (af > CFG.stopV && Math.sign(thr) !== Math.sign(fwd)) { brk = 1; eng = 0; } }
      else { eng = 0; brk = af < CFG.stopV ? 1 : CFG.coastBrake; }
    }
    let ds = curve(CFG.drive, af);
    if (nc < 3) ds /= 4;
    eng *= ds;
    let sa = curve(CFG.steer, af);
    if (c.slide > 0) sa += (curve(CFG.slideSteer, af) - sa) * c.slide;
    c.steerA = sa * k.steer;
    const sticky = thr !== 0, cs = Math.cos(c.steerA), sn = Math.sin(c.steerA), hb = c.slide;
    for (let i = 0; i < 4; i++) {
      const s = c.wh[i], wd = cf.wh[i];
      s.jx = s.jy = s.jz = 0;
      if (!s.hit) continue;
      let ax = l.x, ay = l.y, az = l.z;
      if (wd.fr) { ax = l.x * cs + f.x * sn; ay = l.y * cs + f.y * sn; az = l.z * cs + f.z * sn; }
      const nx = s.nx, ny = s.ny, nz = s.nz;
      const hrx = s.hx - p.x, hry = s.hy - p.y, hrz = s.hz - p.z;
      const hvx = v.x + w.y * hrz - w.z * hry, hvy = v.y + w.z * hrx - w.x * hrz, hvz = v.z + w.x * hry - w.y * hrx;
      const latV = Math.abs(hvx * ax + hvy * ay + hvz * az);
      const lonV = Math.abs(hvx * (ay * nz - az * ny) + hvy * (az * nx - ax * nz) + hvz * (ax * ny - ay * nx));
      const fci = latV > 5 ? latV / (lonV + latV) : 0;
      let latF = curve(CFG.latF, fci), lonF = 1;
      if (hb > 0) { latF *= (CFG.hbLat - 1) * hb + 1; lonF *= (curve(CFG.hbLong, fci) - 1) * hb + 1; }
      if (!sticky) { const q = curve(CFG.noStick, nz); latF *= q; lonF *= q; }
      const pa = ax * nx + ay * ny + az * nz;
      let ex = ax - nx * pa, ey = ay - ny * pa, ez = az - nz * pa;
      const el = Math.sqrt(ex * ex + ey * ey + ez * ez);
      if (el < 1e-6) continue;
      ex /= el; ey /= el; ez /= el;
      const gx = ey * nz - ez * ny, gy = ez * nx - ex * nz, gz = ex * ny - ey * nx;
      const rx = s.cx - p.x, ry = s.cy - p.y, rz = s.cz - p.z;
      let vx = v.x + w.y * rz - w.z * ry, vy = v.y + w.z * rx - w.x * rz, vz = v.z + w.x * ry - w.y * rx;
      if (s.hit === 2) {
        const bx = s.cx - B.p.x, by = s.cy - B.p.y, bz = s.cz - B.p.z, bw = B.w;
        vx -= B.v.x + bw.y * bz - bw.z * by; vy -= B.v.y + bw.z * bx - bw.x * bz; vz -= B.v.z + bw.x * by - bw.y * bx;
      }
      const side = -0.2 * (vx * ex + vy * ey + vz * ez) / cDen(c, rx, ry, rz, ex, ey, ez);
      let roll = 0;
      if (eng === 0) { if (brk) { const lim = m * CFG.brakeWheel * brk; roll = clamp(-(vx * gx + vy * gy + vz * gz) * CFG.rollK, -lim, lim); } }
      else roll = eng * m * CFG.thrWheel;
      const a1 = roll * lonF * dt, a2 = side * latF * CFG.fricK * dt;
      s.jx = gx * a1 + ex * a2; s.jy = gy * a1 + ey * a2; s.jz = gz * a1 + ez * a2;
    }
    if (nW > 0) {
      const sc = CFG.sticky + (thr !== 0 || af > CFG.stopV ? 1 - Math.abs(sz) : 0);
      c.F.x -= sx * sc * CFG.g; c.F.y -= sy * sc * CFG.g; c.F.z -= sz * sc * CFG.g;
    }
    if (nc < 3) airTorque(c, k, nc === 0); else c.flipping = false;
    jumpUpd(W, c, k, jp, dt);
    autoFlip(c, jp, dt);
    dodgeUpd(W, c, k, jp, fwd, dt);
    if (k.throttle && ((nc > 0 && nc < 4) || c.wc)) autoRoll(c, nc);
    c.wc = false;
    for (let i = 0; i < 4; i++) {
      const s = c.wh[i], wd = cf.wh[i];
      if (!s.hit) continue;
      const fz = ((wd.rest - s.sl) * CFG.susK * s.inv - (s.rv < 0 ? CFG.susC : CFG.susR) * s.rv) * wd.k;
      if (fz > 0) { const j = fz * dt + s.push; cImp(c, s.nx * j, s.ny * j, s.nz * j, s.cx - p.x, s.cy - p.y, s.cz - p.z); }
    }
    for (let i = 0; i < 4; i++) {
      const s = c.wh[i];
      if (!s.hit || !(s.jx || s.jy || s.jz)) continue;
      let rx = s.cx - p.x, ry = s.cy - p.y, rz = s.cz - p.z;
      const d = rx * u.x + ry * u.y + rz * u.z;
      rx -= u.x * d; ry -= u.y * d; rz -= u.z * d;
      cImp(c, s.jx, s.jy, s.jz, rx, ry, rz);
    }
    if (c.boost > 0) c.boosting = c.boosting ? (k.boost || c.boostT < CFG.boostMin) : k.boost; else c.boosting = false;
    if (c.boosting) { c.boostT += dt; c.boost = Math.max(0, c.boost - CFG.boostUse * dt); vadd(c.F, f, c.onGround ? CFG.boostGround : CFG.boostAir); } else c.boostT = 0;
    c.boostK = clamp(c.boostK + (c.boosting ? dt * 10 : -dt * 6.5), 0, 1);
  }

  function airTorque(c, k, ctl) {
    const f = c.f, l = c.l, u = c.u, w = c.w, T = c.T;
    let air = false;
    if (c.flipping) c.flipping = c.flipped && c.flipT < CFG.flipTime;
    if (c.flipping) {
      if (c.fdx || c.fdy) {
        let ps = 1;
        if (c.fdx !== 0 && k.pitch !== 0 && Math.sign(c.fdx) === Math.sign(k.pitch)) { ps = 1 - Math.min(Math.abs(k.pitch), 1); air = true; }
        vadd(T, l, c.fdx * ps * CFG.flipTY); vadd(T, f, c.fdy * CFG.flipTX);
      } else air = true;
    } else air = true;
    if (air && ctl && !c.autoF) {
      let ps = 1;
      if (k.pitch || k.yaw || k.roll) { if (c.flipping) ps = 0; else if (c.flipped && c.flipT < CFG.flipTime + CFG.flipLock) ps = 0; }
      const wp = -vdot(w, l), wy = -vdot(w, u), wr = vdot(w, f), K = CFG.torqueK, AT = CFG.airT, AD = CFG.airD;
      const ap = (k.pitch * ps * AT[0] - wp * AD[0] * (1 - Math.abs(k.pitch * ps))) * K;
      const ay = (k.yaw * AT[1] - wy * AD[1] * (1 - Math.abs(k.yaw))) * K;
      const ar = (k.roll * AT[2] - wr * AD[2]) * K;
      vadd(T, l, -ap); vadd(T, u, -ay); vadd(T, f, ar);
    }
    if (k.throttle) vadd(c.F, f, k.throttle * CFG.airThrottle);
  }

  function jumpUpd(W, c, k, jp, dt) {
    if (c.onGround && !c.jumping && !(c.jumped && c.jumpT < CFG.jumpMin + CFG.jumpPad)) { c.jumped = false; c.jumpT = 0; }
    if (c.jumping) c.jumping = c.jumpT < CFG.jumpMin || (k.jump && c.jumpT < CFG.jumpMax - 1e-6);
    else if (c.onGround && jp) { c.jumping = true; c.jumpT = 0; vadd(c.v, c.u, CFG.jumpImp); W.events.push({ type: 'jump', car: c }); }
    if (c.jumping) { c.jumped = true; vadd(c.F, c.u, CFG.jumpAcc * (c.jumpT < CFG.jumpMin ? CFG.jumpPre : 1)); }
    if (c.jumping || c.jumped) c.jumpT += dt;
  }

  function autoFlip(c, jp, dt) {
    if (jp && c.wc && c.wcn.z > CFG.afNormZ) {
      const r = Math.atan2(c.l.z, c.u.z);
      if (Math.abs(r) > CFG.afRoll) { c.afT = CFG.afTime * Math.abs(r) / Math.PI; c.afS = r > 0 ? 1 : -1; c.autoF = true; vadd(c.v, c.u, -CFG.afImp); }
    }
    if (c.autoF) {
      if (c.afT <= 0) { c.autoF = false; c.afT = 0; }
      else { vadd(c.w, c.f, -c.afS * CFG.afTorque * dt); c.afT -= dt; }
    }
  }

  function dodgeUpd(W, c, k, jp, fwd, dt) {
    if (c.onGround) { c.djumped = false; c.flipped = false; c.airT = 0; c.ajT = 0; c.flipT = 0; }
    else {
      c.airT += dt;
      if (c.jumped && !c.jumping) c.ajT += dt; else c.ajT = 0;
      if (jp && c.ajT < CFG.dodgeWindow && !c.djumped && !c.flipped && !c.autoF) {
        if (Math.abs(k.yaw) + Math.abs(k.pitch) + Math.abs(k.roll) >= CFG.dodgeDead) {
          c.flipT = 0; c.flipped = true; c.flipping = true;
          let dx = -k.pitch, dy = k.yaw + k.roll;
          if (Math.abs(dy) < 0.1 && Math.abs(dx) < 0.1) dx = dy = 0;
          else { const q = Math.hypot(dx, dy); dx /= q; dy /= q; }
          c.fdx = dx; c.fdy = dy;
          if (Math.abs(dx) < 0.1) dx = 0;
          if (Math.abs(dy) < 0.1) dy = 0;
          if (dx || dy) {
            const ratio = Math.abs(fwd) / CFG.carMax, back = Math.abs(fwd) < 100 ? dx < 0 : (dx >= 0) !== (fwd >= 0);
            let ix = dx * CFG.flipImp * (((back ? CFG.flipBack : 1) - 1) * ratio + 1);
            const iy = dy * CFG.flipImp * ((CFG.flipSide - 1) * ratio + 1);
            if (back) ix *= CFG.flipBackX;
            const hl = Math.hypot(c.f.x, c.f.y);
            if (hl > 1e-6) { const fx = c.f.x / hl, fy = c.f.y / hl; c.v.x += fx * ix + fy * iy; c.v.y += fy * ix - fx * iy; }
          }
          W.events.push({ type: 'dodge', car: c });
        } else { vadd(c.v, c.u, CFG.jumpImp); c.djumped = true; W.events.push({ type: 'djump', car: c }); }
      }
    }
    if (c.flipping) {
      c.flipT += dt;
      if (c.flipT <= CFG.flipTime + 1e-6 && c.flipT >= CFG.flipZStart && (c.v.z < 0 || c.flipT < CFG.flipZEnd)) c.v.z *= Math.pow(1 - CFG.flipZDamp, dt * 120);
    } else if (c.flipped) c.flipT += dt;
    c.dodgeT = c.flipped ? c.flipT : -1;
  }

  function autoRoll(c, nc) {
    const g = nc > 0 ? c.n : c.wcn, f = c.f, l = c.l;
    const clx = g.y * f.z - g.z * f.y, cly = g.z * f.x - g.x * f.z, clz = g.x * f.y - g.y * f.x;
    const cfx = cly * g.z - clz * g.y, cfy = clz * g.x - clx * g.z, cfz = clx * g.y - cly * g.x;
    const lf = 1 - clamp(l.x * clx + l.y * cly + l.z * clz, 0, 1), ff = 1 - clamp(f.x * cfx + f.y * cfy + f.z * cfz, 0, 1);
    const rs = vdot(l, g) >= 0 ? -1 : 1, ps = vdot(f, g) >= 0 ? 1 : -1;
    vadd(c.T, f, rs * lf * CFG.arTorque); vadd(c.T, l, ps * ff * CFG.arTorque);
    vadd(c.F, g, -CFG.arForce);
  }

  function carMove(c, dt) {
    vadd(c.v, c.F, dt); vadd(c.w, c.T, dt);
    const wl = vlen(c.w);
    vadd(c.p, c.v, dt);
    if (wl > 1e-7) { vset(T2, c.w.x / wl, c.w.y / wl, c.w.z / wl); rotCar(c, T2, wl * dt); }
  }

  const CP = [];
  for (let i = 0; i < 26; i++) CP.push({ rx: 0, ry: 0, rz: 0, nx: 0, ny: 0, nz: 0, d: 0, tg: 0, dn: 0, j: 0 });
  function carWorld(W, c) {
    const cf = c.cfg, p = c.p, f = c.f, l = c.l, u = c.u, v = c.v, w = c.w;
    if (sdf(p.x, p.y, p.z) > cf.rad) return;
    let n = 0, deep = null;
    for (const o of cf.pts) {
      const rx = f.x * o[0] + l.x * o[1] + u.x * o[2], ry = f.y * o[0] + l.y * o[1] + u.y * o[2], rz = f.z * o[0] + l.z * o[1] + u.z * o[2];
      const d = sdf(p.x + rx, p.y + ry, p.z + rz);
      if (d >= 0) continue;
      const q = CP[n++];
      sdfN(p.x + rx, p.y + ry, p.z + rz, T1);
      q.rx = rx; q.ry = ry; q.rz = rz; q.nx = T1.x; q.ny = T1.y; q.nz = T1.z; q.d = -d; q.j = 0;
      if (!deep || q.d > deep.d) deep = q;
    }
    if (!n) return;
    c.wc = true; vset(c.wcn, deep.nx, deep.ny, deep.nz);
    for (let i = 0; i < n; i++) {
      const q = CP[i], vn = q.nx * (v.x + w.y * q.rz - w.z * q.ry) + q.ny * (v.y + w.z * q.rx - w.x * q.rz) + q.nz * (v.z + w.x * q.ry - w.y * q.rx);
      q.tg = vn < -10 ? -CFG.worldCR * vn : 0; q.dn = cDen(c, q.rx, q.ry, q.rz, q.nx, q.ny, q.nz);
    }
    for (let it = 0; it < 4; it++) for (let i = 0; i < n; i++) {
      const q = CP[i], vn = q.nx * (v.x + w.y * q.rz - w.z * q.ry) + q.ny * (v.y + w.z * q.rx - w.x * q.rz) + q.nz * (v.z + w.x * q.ry - w.y * q.rx);
      const nj = Math.max(0, q.j + (q.tg - vn) / q.dn), dj = nj - q.j;
      q.j = nj;
      if (dj) cImp(c, q.nx * dj, q.ny * dj, q.nz * dj, q.rx, q.ry, q.rz);
    }
    for (let i = 0; i < n; i++) {
      const q = CP[i];
      if (q.j <= 0) continue;
      let tx = v.x + w.y * q.rz - w.z * q.ry, ty = v.y + w.z * q.rx - w.x * q.rz, tz = v.z + w.x * q.ry - w.y * q.rx;
      const vn = tx * q.nx + ty * q.ny + tz * q.nz;
      tx -= q.nx * vn; ty -= q.ny * vn; tz -= q.nz * vn;
      const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
      if (tl < 1e-3) continue;
      tx /= tl; ty /= tl; tz /= tl;
      const jt = Math.min(tl / cDen(c, q.rx, q.ry, q.rz, tx, ty, tz), CFG.worldMu * q.j);
      cImp(c, -tx * jt, -ty * jt, -tz * jt, q.rx, q.ry, q.rz);
    }
    let mx = 0, my = 0, mz = 0;
    for (let i = 0; i < n; i++) {
      const q = CP[i], rem = q.d * 0.8 - (mx * q.nx + my * q.ny + mz * q.nz);
      if (rem > 0) { mx += q.nx * rem; my += q.ny * rem; mz += q.nz * rem; }
    }
    p.x += mx; p.y += my; p.z += mz;
  }

  function carPost(W, c, dt) {
    vadd(c.v, c.vc, 1); vset(c.vc, 0, 0, 0);
    const s2 = vdot(c.v, c.v);
    if (s2 > CFG.carMax * CFG.carMax) vscale(c.v, CFG.carMax / Math.sqrt(s2));
    const wl = vlen(c.w);
    if (wl > CFG.maxW) vscale(c.w, CFG.maxW / wl);
    if (c.sup && c.supT < CFG.superKeepT) c.sup = s2 >= CFG.superKeep * CFG.superKeep; else c.sup = s2 >= CFG.superStart * CFG.superStart;
    c.supT = c.sup ? c.supT + dt : 0;
    if (c.bumpCD > 0) c.bumpCD -= dt;
    c.prevJump = c.ctl.jump;
    c.fs = vdot(c.v, c.f);
  }

  function respawn(W, c) {
    const r = CFG.respawns[Math.floor(W.rng() * 4)], s = c.team ? -1 : 1;
    placeCar(c, r[0] * s, r[1] * s, c.team ? -Math.PI / 2 : Math.PI / 2, CFG.carRespawnZ);
    c.prevJump = false;
    W.events.push({ type: 'respawn', car: c });
  }
  function demolish(W, vic, att) {
    if (W.pr) { vic.demoT = CFG.demoTime; vic.boosting = false; vic.sup = false; return; }
    vic.demoT = CFG.demoTime; vic.boosting = false; vic.sup = false;
    att.st.demos++; att.st.score += CFG.pts.demo;
    W.events.push({ type: 'demo', a: att, b: vic, p: v3(vic.p.x, vic.p.y, vic.p.z) });
  }
  function bumpTry(W, a, b, cx, cy, cz) {
    if (a.bumpId === b.id && a.bumpCD > 0) return;
    const dx = b.p.x - a.p.x, dy = b.p.y - a.p.y, dz = b.p.z - a.p.z, dl = Math.sqrt(dx * dx + dy * dy + dz * dz), sp = vlen(a.v);
    if (dl < 1e-3 || sp < 1e-3 || a.v.x * dx + a.v.y * dy + a.v.z * dz <= 0) return;
    const vx = a.v.x / sp, vy = a.v.y / sp, vz = a.v.z / sp, toward = (a.v.x * dx + a.v.y * dy + a.v.z * dz) / dl, away = b.v.x * vx + b.v.y * vy + b.v.z * vz;
    if (toward <= away) return;
    if ((cx - a.p.x) * a.f.x + (cy - a.p.y) * a.f.y + (cz - a.p.z) * a.f.z <= CFG.bumpFwd) return;
    if (a.sup && a.team !== b.team && W.state !== 'end') demolish(W, b, a);
    else {
      const base = curve(b.onGround ? CFG.bumpG : CFG.bumpA, toward), up = curve(CFG.bumpUp, toward), hu = b.onGround ? b.u : null;
      b.vc.x += vx * base + (hu ? hu.x : 0) * up; b.vc.y += vy * base + (hu ? hu.y : 0) * up; b.vc.z += vz * base + (hu ? hu.z : 1) * up;
      W.events.push({ type: 'bump', a, b, v: toward });
    }
    a.bumpId = b.id; a.bumpCD = CFG.bumpCD;
  }
  const OA = { c: v3(), a: [v3(), v3(), v3()], h: null }, OB = { c: v3(), a: [v3(), v3(), v3()], h: null }, SN = v3(), SP = v3();
  function obbOf(c, o) {
    const O = c.cfg.o;
    vset(o.c, c.p.x + c.f.x * O[0] + c.u.x * O[2], c.p.y + c.f.y * O[0] + c.u.y * O[2], c.p.z + c.f.z * O[0] + c.u.z * O[2]);
    vcopy(o.a[0], c.f); vcopy(o.a[1], c.l); vcopy(o.a[2], c.u); o.h = c.cfg.h;
  }
  function support(o, nx, ny, nz, sgn, out) {
    vcopy(out, o.c);
    for (let i = 0; i < 3; i++) {
      const a = o.a[i], d = (a.x * nx + a.y * ny + a.z * nz) * sgn;
      if (d > 0.12) vadd(out, a, o.h[i]); else if (d < -0.12) vadd(out, a, -o.h[i]);
    }
    return out;
  }
  function sat(A, B) {
    const tx = B.c.x - A.c.x, ty = B.c.y - A.c.y, tz = B.c.z - A.c.z;
    let best = Infinity, bx = 0, by = 0, bz = 0, kind = 0;
    const test = (lx, ly, lz, k) => {
      let ra = 0, rb = 0;
      for (let i = 0; i < 3; i++) { ra += A.h[i] * Math.abs(A.a[i].x * lx + A.a[i].y * ly + A.a[i].z * lz); rb += B.h[i] * Math.abs(B.a[i].x * lx + B.a[i].y * ly + B.a[i].z * lz); }
      const d = tx * lx + ty * ly + tz * lz, ov = ra + rb - Math.abs(d);
      if (ov < 0) return false;
      const sc = k === 2 ? ov * 1.05 + 1 : ov;
      if (sc < best) { best = sc; const s = d < 0 ? -1 : 1; bx = lx * s; by = ly * s; bz = lz * s; kind = k; SN.d = ov; }
      return true;
    };
    for (let i = 0; i < 3; i++) if (!test(A.a[i].x, A.a[i].y, A.a[i].z, 0)) return 0;
    for (let i = 0; i < 3; i++) if (!test(B.a[i].x, B.a[i].y, B.a[i].z, 1)) return 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const a = A.a[i], b = B.a[j];
      let lx = a.y * b.z - a.z * b.y, ly = a.z * b.x - a.x * b.z, lz = a.x * b.y - a.y * b.x;
      const ll = Math.sqrt(lx * lx + ly * ly + lz * lz);
      if (ll < 1e-3) continue;
      if (!test(lx / ll, ly / ll, lz / ll, 2)) return 0;
    }
    vset(SN, bx, by, bz);
    const ov = SN.d;
    if (kind === 0) { support(B, bx, by, bz, -1, SP); vadd(SP, SN, ov / 2); }
    else if (kind === 1) { support(A, bx, by, bz, 1, SP); vadd(SP, SN, -ov / 2); }
    else { support(A, bx, by, bz, 1, SP); support(B, bx, by, bz, -1, T1); vset(SP, (SP.x + T1.x) / 2, (SP.y + T1.y) / 2, (SP.z + T1.z) / 2); }
    return ov;
  }
  function obbExt(o, tx, ty, tz) {
    let e = 0;
    for (let i = 0; i < 3; i++) e += o.h[i] * Math.abs(o.a[i].x * tx + o.a[i].y * ty + o.a[i].z * tz);
    return e;
  }
  const CL = { ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0 };
  function ccLever(a, b, nx, ny, nz) {
    let t1x = ny, t1y = -nx, t1z = 0, tl = Math.hypot(t1x, t1y);
    if (tl < 0.3) { t1x = 0; t1y = nz; t1z = -ny; tl = Math.hypot(t1y, t1z); }
    t1x /= tl; t1y /= tl; t1z /= tl;
    const t2x = ny * t1z - nz * t1y, t2y = nz * t1x - nx * t1z, t2z = nx * t1y - ny * t1x;
    vset(T1, SP.x, SP.y, SP.z); vset(T2, SP.x, SP.y, SP.z);
    for (let k = 0; k < 2; k++) {
      const tx = k ? t2x : t1x, ty = k ? t2y : t1y, tz = k ? t2z : t1z;
      const ca = OA.c.x * tx + OA.c.y * ty + OA.c.z * tz, ea = obbExt(OA, tx, ty, tz), cb = OB.c.x * tx + OB.c.y * ty + OB.c.z * tz, eb = obbExt(OB, tx, ty, tz);
      let lo = Math.max(ca - ea, cb - eb), hi = Math.min(ca + ea, cb + eb);
      if (lo > hi) lo = hi = (lo + hi) / 2;
      const sp = SP.x * tx + SP.y * ty + SP.z * tz;
      vadd(T1, { x: tx, y: ty, z: tz }, clamp(a.p.x * tx + a.p.y * ty + a.p.z * tz, lo, hi) - sp);
      vadd(T2, { x: tx, y: ty, z: tz }, clamp(b.p.x * tx + b.p.y * ty + b.p.z * tz, lo, hi) - sp);
    }
    CL.ax = T1.x - a.p.x; CL.ay = T1.y - a.p.y; CL.az = T1.z - a.p.z; CL.bx = T2.x - b.p.x; CL.by = T2.y - b.p.y; CL.bz = T2.z - b.p.z;
  }
  function carCar(W) {
    const cs = W.cars;
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const a = cs[i], b = cs[j];
      if (a.demoT > 0 || b.demoT > 0) continue;
      const qx = b.p.x - a.p.x, qy = b.p.y - a.p.y, qz = b.p.z - a.p.z;
      if (qx * qx + qy * qy + qz * qz > 260 * 260) continue;
      obbOf(a, OA); obbOf(b, OB);
      const pen = sat(OA, OB);
      if (pen <= 0) continue;
      const nx = SN.x, ny = SN.y, nz = SN.z, cx = SP.x, cy = SP.y, cz = SP.z;
      bumpTry(W, a, b, cx, cy, cz);
      if (b.demoT <= 0 && a.demoT <= 0) bumpTry(W, b, a, cx, cy, cz);
      if (a.demoT > 0 || b.demoT > 0) continue;
      ccLever(a, b, nx, ny, nz);
      const rax = CL.ax, ray = CL.ay, raz = CL.az, rbx = CL.bx, rby = CL.by, rbz = CL.bz;
      let rvx = b.v.x + b.w.y * rbz - b.w.z * rby - (a.v.x + a.w.y * raz - a.w.z * ray);
      let rvy = b.v.y + b.w.z * rbx - b.w.x * rbz - (a.v.y + a.w.z * rax - a.w.x * raz);
      let rvz = b.v.z + b.w.x * rby - b.w.y * rbx - (a.v.z + a.w.x * ray - a.w.y * rax);
      const vn = rvx * nx + rvy * ny + rvz * nz;
      if (vn < 0) {
        const jn = -(1 + (vn < -10 ? CFG.carCarCR : 0)) * vn / (cDen(a, rax, ray, raz, nx, ny, nz) + cDen(b, rbx, rby, rbz, nx, ny, nz));
        cImp(a, -nx * jn, -ny * jn, -nz * jn, rax, ray, raz); cImp(b, nx * jn, ny * jn, nz * jn, rbx, rby, rbz);
        rvx -= nx * vn; rvy -= ny * vn; rvz -= nz * vn;
        const tl = Math.sqrt(rvx * rvx + rvy * rvy + rvz * rvz);
        if (tl > 1e-3) {
          const tx = rvx / tl, ty = rvy / tl, tz = rvz / tl, jt = Math.min(tl / (cDen(a, rax, ray, raz, tx, ty, tz) + cDen(b, rbx, rby, rbz, tx, ty, tz)), CFG.carCarMu * jn);
          cImp(a, tx * jt, ty * jt, tz * jt, rax, ray, raz); cImp(b, -tx * jt, -ty * jt, -tz * jt, rbx, rby, rbz);
        }
      }
      const pc = pen * 0.4;
      a.p.x -= nx * pc; a.p.y -= ny * pc; a.p.z -= nz * pc; b.p.x += nx * pc; b.p.y += ny * pc; b.p.z += nz * pc;
    }
  }

  function carBall(W, c) {
    const B = W.ball, cf = c.cfg, H = cf.h, O = cf.o, p = c.p, f = c.f, l = c.l, u = c.u;
    const hx = p.x + f.x * O[0] + u.x * O[2], hy = p.y + f.y * O[0] + u.y * O[2], hz = p.z + f.z * O[0] + u.z * O[2];
    const rx = B.p.x - hx, ry = B.p.y - hy, rz = B.p.z - hz;
    if (rx * rx + ry * ry + rz * rz > 250 * 250) { c.touch = false; return; }
    const lx = rx * f.x + ry * f.y + rz * f.z, ly = rx * l.x + ry * l.y + rz * l.z, lz = rx * u.x + ry * u.y + rz * u.z;
    const qx = clamp(lx, -H[0], H[0]), qy = clamp(ly, -H[1], H[1]), qz = clamp(lz, -H[2], H[2]);
    let cx = hx + f.x * qx + l.x * qy + u.x * qz, cy = hy + f.y * qx + l.y * qy + u.y * qz, cz = hz + f.z * qx + l.z * qy + u.z * qz;
    let nx = B.p.x - cx, ny = B.p.y - cy, nz = B.p.z - cz, pen;
    const dist = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (dist >= BR) { c.touch = false; return; }
    if (dist < 1e-4) {
      const ex = H[0] - Math.abs(lx), ey = H[1] - Math.abs(ly), ez = H[2] - Math.abs(lz), A = ex < ey && ex < ez ? f : ey < ez ? l : u, s = (A === f ? lx : A === l ? ly : lz) < 0 ? -1 : 1;
      nx = A.x * s; ny = A.y * s; nz = A.z * s; pen = BR + Math.min(ex, ey, ez);
    } else { nx /= dist; ny /= dist; nz /= dist; pen = BR - dist; }
    const rvx = B.v.x - c.v.x, rvy = B.v.y - c.v.y, rvz = B.v.z - c.v.z, rs = Math.min(Math.sqrt(rvx * rvx + rvy * rvy + rvz * rvz), 4600);
    const fresh = !c.touch;
    let ex = 0, ey = 0, ez = 0;
    if (fresh && rs > 0) {
      let dx = B.p.x - p.x, dy = B.p.y - p.y, dz = (B.p.z - p.z) * 0.35;
      let dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      dx /= dl; dy /= dl; dz /= dl;
      const fd = (dx * f.x + dy * f.y + dz * f.z) * 0.35;
      dx -= f.x * fd; dy -= f.y * fd; dz -= f.z * fd;
      dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const k = rs * curve(CFG.hit, rs) / dl;
      ex = dx * k; ey = dy * k; ez = dz * k;
    }
    const rcx = cx - p.x, rcy = cy - p.y, rcz = cz - p.z, w = c.w, bw = B.w, mb = CFG.ballMass;
    let vx = B.v.x + BR * (ny * bw.z - nz * bw.y) - (c.v.x + w.y * rcz - w.z * rcy);
    let vy = B.v.y + BR * (nz * bw.x - nx * bw.z) - (c.v.y + w.z * rcx - w.x * rcz);
    let vz = B.v.z + BR * (nx * bw.y - ny * bw.x) - (c.v.z + w.x * rcy - w.y * rcx);
    const vn = vx * nx + vy * ny + vz * nz;
    if (vn < 0) {
      const jn = -vn / (1 / mb + cDen(c, rcx, rcy, rcz, nx, ny, nz));
      vadd(B.v, { x: nx, y: ny, z: nz }, jn / mb);
      cImp(c, -nx * jn, -ny * jn, -nz * jn, rcx, rcy, rcz);
      vx = B.v.x + BR * (ny * bw.z - nz * bw.y) - (c.v.x + w.y * rcz - w.z * rcy);
      vy = B.v.y + BR * (nz * bw.x - nx * bw.z) - (c.v.y + w.z * rcx - w.x * rcz);
      vz = B.v.z + BR * (nx * bw.y - ny * bw.x) - (c.v.z + w.x * rcy - w.y * rcx);
      const vn2 = vx * nx + vy * ny + vz * nz;
      vx -= nx * vn2; vy -= ny * vn2; vz -= nz * vn2;
      const tl = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (tl > 1e-3) {
        const tx = vx / tl, ty = vy / tl, tz = vz / tl, jt = Math.min(tl / (3.5 / mb + cDen(c, rcx, rcy, rcz, tx, ty, tz)), CFG.carBallMu * jn), s = 2.5 * jt / (mb * BR);
        B.v.x -= tx * jt / mb; B.v.y -= ty * jt / mb; B.v.z -= tz * jt / mb;
        bw.x += (ny * tz - nz * ty) * s; bw.y += (nz * tx - nx * tz) * s; bw.z += (nx * ty - ny * tx) * s;
        cImp(c, tx * jt, ty * jt, tz * jt, rcx, rcy, rcz);
      }
    }
    B.p.x += nx * pen * 6 / 7; B.p.y += ny * pen * 6 / 7; B.p.z += nz * pen * 6 / 7;
    p.x -= nx * pen / 7; p.y -= ny * pen / 7; p.z -= nz * pen / 7;
    c.touch = true;
    if (fresh) {
      B.v.x += ex; B.v.y += ey; B.v.z += ez;
      const sp = vlen(B.v);
      if (sp > CFG.ballMax) vscale(B.v, CFG.ballMax / sp);
      onTouch(W, c, rs);
    }
  }


  const PDT = 1 / 30, PN = 120;
  const DIFF = {
    rookie: { kd: 260, kk: 0.24, ko: 0, ky: 0, think: 0.3, react: 0.3, aim: 0.3, err: 300, thr: 0.92, boost: 0.25, flip: 0, kick: 0, jump: 1, aerial: 0, wall: 0, demo: 0, dribble: 0, rot: 0.25, chal: 0.1, hold: 0.06 },
    semipro: { gs: 1000, kd: 260, kk: 0.24, ko: 0, ky: 0, think: 0.25, react: 0.35, aim: 0.6, err: 260, thr: 1, boost: 1, flip: 1, kick: 1, jump: 1, aerial: 0, wall: 0, demo: 0, dribble: 0, rot: 0.5, chal: 0.35, hold: 0.1 },
    pro: { gs: 1200, kd: 260, kk: 0.24, ko: 0, ky: 0, think: 0.12, react: 0.12, aim: 0.8, err: 90, thr: 1, boost: 1, flip: 1, kick: 1, jump: 1, aerial: 760, wall: 1, demo: 0, dribble: 0.3, rot: 0.85, chal: 0.35, hold: 0.12 },
    veteran: { gs: 1200, half: 1, kd: 260, kk: 0.24, ko: 0, ky: 0, think: 0.09, react: 0.07, aim: 0.8, err: 60, thr: 1, boost: 1, flip: 1, kick: 1, jump: 1, aerial: 1000, wall: 1, demo: 0.1, dribble: 0.4, rot: 0.9, chal: 0.3, hold: 0.14 },
    allstar: { gs: 1200, half: 1, kd: 260, kk: 0.24, ko: 0, ky: 0, think: 0.05, react: 0.02, aim: 0.8, err: 0, thr: 1, boost: 1, flip: 1, kick: 1, jump: 1, aerial: 1300, wall: 1, demo: 0.3, dribble: 0.6, rot: 0.95, chal: 0.25, hold: 0.16, save: 1 }
  };
  const DIFF_IDS = ['rookie', 'semipro', 'pro', 'veteran', 'allstar'], DIFF_NAMES = { rookie: 'Rookie', semipro: 'Semi-Pro', pro: 'Pro', veteran: 'Veteran', allstar: 'All-Star' };
  const BOTNAMES = ['Armstrong', 'Bandit', 'Beast', 'Boomer', 'Buzz', 'Casper', 'Caveman', 'C-Block', 'Centice', 'Chipper', 'Cougar', 'Dude', 'Foamer', 'Fury', 'Gerwin', 'Goose', 'Heater', 'Hollywood', 'Hound', 'Iceman', 'Imp', 'Jester', 'Junker', 'Khan', 'Marley', 'Maverick', 'Merlin', 'Middy', 'Mountain', 'Myrtle', 'Outlaw', 'Poncho', 'Rainmaker', 'Raja', 'Rex', 'Roundhouse', 'Sabretooth', 'Saltie', 'Samara', 'Scout', 'Shepard', 'Slider', 'Squall', 'Sticks', 'Stinger', 'Storm', 'Sultan', 'Sundown', 'Swabbie', 'Tex', 'Tusk', 'Viper', 'Wolfman', 'Yuri'];
  function rngOf(seed) {
    if (seed == null) return Math.random;
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function makeWorld(o = {}) {
    const W = {
      size: clamp(o.size || 1, 1, 3), diff: DIFF[o.diff] ? o.diff : 'pro', len: o.len || 300, cars: [], ball: makeBall(), pads: [], events: [], score: [0, 0],
      clock: o.len || 300, state: 'menu', stateT: 0, time: 0, tick: 0, ot: false, otT: 0, clockOn: false, timeUp: false, kickoff: false, kicker: [null, null],
      touchHist: [], lastTouch: null, pred: new Float32Array(PN * 6), predAt: 0, predT: 0, threat: [Infinity, Infinity], cd: 3, rng: rngOf(o.seed),
      roles: [[], []], roleT: [-1, -1], first: [null, null], pend: null, flip: false, mode: o.mode === 'training' ? 'training' : 'match', train: null
    };
    const ts = W.size, human = o.human !== false, bodies = o.bodies || [], pool = BOTNAMES.slice();
    if (W.mode === 'training') {
      W.cars.push(makeCar(0, o.names ? String(o.names[0] || 'You') : 'You', false, bodies[0]));
      W.size = 1; W.diff = 'pro';
      W.train = { unlimited: !!o.unlimited, shots: !!o.shots, spawn: TRAIN_SPAWNS.includes(o.spawn) ? o.spawn : 'center', goals: 0, saves: 0, shotsTaken: 0, conceded: 0, resetT: -1, shotT: -1, shot: false, idleT: 0, was: !!o.shots };
    }
    else if (Array.isArray(o.roster)) for (const r of o.roster) {
      const c = makeCar(r.team ? 1 : 0, String(r.name || 'Player'), !!r.bot, r.body);
      c.slot = clamp(r.slot | 0, 0, 2);
      W.cars.push(c);
    }
    else for (let t = 0; t < 2; t++) for (let i = 0; i < ts; i++) {
      const isMe = human && t === 0 && i === 0, isP2 = !!o.p2 && t === 1 && i === 0, bot = !(isMe || isP2);
      let name, body;
      if (bot) { name = pool.splice(Math.floor(W.rng() * pool.length), 1)[0]; body = BODY_IDS[Math.floor(W.rng() * BODY_IDS.length)]; if (!human && i === 0 && BODIES[bodies[t]]) body = bodies[t]; }
      else { name = isMe ? (o.names ? o.names[0] : 'You') : (o.names ? o.names[1] : 'P2'); body = isMe ? bodies[0] : bodies[1]; }
      const c = makeCar(t, name, bot, body);
      c.slot = i;
      if (c.ai && o.diffs && o.diffs[t]) { const q = o.diffs[t]; c.ai.D = typeof q === 'object' ? Object.assign({}, DIFF[q.base] || DIFF[W.diff], q) : DIFF[q] || null; }
      W.cars.push(c);
    }
    for (const [x, y] of CFG.big) W.pads.push({ x, y, z: CFG.padZ[0], big: true, amt: CFG.padBig[0], cd: CFG.padBig[1], r: CFG.padBig[2], t: 0 });
    for (const [x, y] of CFG.small) W.pads.push({ x, y, z: CFG.padZ[1], big: false, amt: CFG.padSmall[0], cd: CFG.padSmall[1], r: CFG.padSmall[2], t: 0 });
    kickoffPlace(W);
    if (W.train) trainReset(W, 'all');
    return W;
  }
  function kickoffPlace(W) {
    const idx = [0, 1, 2, 3, 4];
    for (let i = 4; i > 0; i--) { const j = Math.floor(W.rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    for (const c of W.cars) {
      const sp = CFG.spawns[idx[c.slot]], s = c.team ? -1 : 1;
      placeCar(c, sp[0] * s, sp[1] * s, sp[2] * Math.PI + (c.team ? Math.PI : 0));
    }
    const B = W.ball;
    vset(B.p, 0, 0, CFG.ballRest); vset(B.v, 0, 0, 0); vset(B.w, 0, 0, 0); B.hidden = false;
    for (const pd of W.pads) pd.t = 0;
    for (let t = 0; t < 2; t++) {
      const s = t ? -1 : 1;
      let best = null, bd = 1e9;
      for (const c of W.cars) if (c.team === t) {
        const d = Math.hypot(c.p.x, c.p.y) + c.p.x * s * 0.001;
        if (d < bd - 1) { bd = d; best = c; }
      }
      W.kicker[t] = best;
    }
  }
  function startMatch(W) {
    if (W.mode === 'training') { trainStart(W); return; }
    W.score = [0, 0]; W.clock = W.len; W.ot = false; W.otT = 0; W.timeUp = false;
    for (const c of W.cars) c.st = newSt();
    kickoff(W);
  }
  function kickoff(W) {
    kickoffPlace(W);
    W.state = 'countdown'; W.stateT = 0; W.kickoff = true; W.clockOn = false; W.cd = 3; W.touchHist = []; W.lastTouch = null; W.pend = null;
    W.threat[0] = W.threat[1] = Infinity; W.first[0] = W.first[1] = null;
    W.events.push({ type: 'countdown', n: 3 });
  }
  function worldStep(W, dt) {
    W.time += dt; W.stateT += dt; W.tick++;
    if (W.state === 'menu') return;
    const cd = W.state === 'countdown';
    if (cd) {
      const n = 3 - Math.floor(W.stateT);
      if (n !== W.cd && n > 0) { W.cd = n; W.events.push({ type: 'countdown', n }); }
      if (W.stateT >= 3) { W.state = 'play'; W.stateT = 0; W.events.push({ type: 'go' }); if (!W.pr) predict(W); }
    } else {
      if (!W.pr) {
        W.predT -= dt;
        if (W.predT <= 0) predict(W);
        for (let i = 0, n = W.cars.length; i < n; i++) { const c = W.cars[W.tick % 2 ? n - 1 - i : i]; if (c.bot) aiStep(W, c, dt); }
      }
    }
    for (const c of W.cars) {
      if (c.demoT > 0) { c.demoT -= dt; if (c.demoT <= 0) { if (W.pr) c.demoT = 1e-3; else respawn(W, c); } continue; }
      carPre(W, c, dt);
    }
    for (const c of W.cars) if (c.demoT <= 0) { carMove(c, dt); carWorld(W, c); }
    const B = W.ball;
    if (!B.hidden) {
      if (!cd) { const imp = ballStep(B, dt); if (imp > 180) W.events.push({ type: 'bounce', v: imp }); }
      W.flip = !W.flip;
      for (let i = 0, n = W.cars.length; i < n; i++) { const c = W.cars[W.flip ? n - 1 - i : i]; if (c.demoT <= 0) carBall(W, c); }
    }
    carCar(W);
    for (const c of W.cars) if (c.demoT <= 0) carPost(W, c, dt);
    if (!cd) for (const pd of W.pads) {
      if (pd.t > 0) { pd.t -= dt; continue; }
      for (const c of W.cars) {
        if (c.demoT > 0 || c.boost >= 100) continue;
        const dx = c.p.x - pd.x, dy = c.p.y - pd.y;
        if (dx * dx + dy * dy < pd.r * pd.r && Math.abs(c.p.z - pd.z) < CFG.padH) {
          c.boost = Math.min(100, c.boost + pd.amt); pd.t = pd.cd;
          W.events.push({ type: 'pad', car: c, pad: pd });
          break;
        }
      }
    }
    if (W.pr) return;
    if (W.state === 'play') playRules(W, dt);
    else if (W.state === 'goal' && W.stateT > 3) { if (W.ot || W.timeUp || W.clock <= 0) endMatch(W); else kickoff(W); }
  }
  function playRules(W, dt) {
    if (W.mode === 'training') { trainRules(W, dt); return; }
    const B = W.ball;
    if (W.clockOn) {
      if (W.ot) W.otT += dt;
      else if (W.clock > 0) { W.clock -= dt; if (W.clock <= 0) { W.clock = 0; W.timeUp = true; W.events.push({ type: 'timeup' }); } }
    }
    if (Math.abs(B.p.y) > CFG.goalLine + BR) { scoreGoal(W, B.p.y > 0 ? 0 : 1); return; }
    const pd = W.pend;
    if (pd) {
      const c = pd.c, sg = c.team ? -1 : 1, y = B.p.y * sg;
      if (W.time - pd.t > 3.5) W.pend = null;
      else if (pd.k === 'clear' && y > -CFG.Y / 3 + 200) { award(W, c, 'clear'); W.pend = null; }
      else if (pd.k === 'center' && Math.abs(B.p.x) < 900 && y > CFG.Y * 0.55) { award(W, c, 'center'); W.pend = null; }
    }
    if (W.timeUp && B.floor) {
      if (W.score[0] !== W.score[1]) endMatch(W);
      else { W.ot = true; W.otT = 0; W.timeUp = false; W.events.push({ type: 'overtime' }); kickoff(W); }
    }
  }
  function award(W, c, k) {
    c.st.score += CFG.pts[k];
    W.events.push({ type: k, car: c });
  }
  function scoreGoal(W, team) {
    const B = W.ball;
    W.score[team]++;
    let scorer = null, si = -1;
    for (let i = W.touchHist.length - 1; i >= 0; i--) if (W.touchHist[i].c.team === team) { scorer = W.touchHist[i].c; si = i; break; }
    if (scorer && si < W.touchHist.length - 1 && W.time - W.touchHist[si].t > 8) scorer = null;
    let assist = null, scorerShot = false;
    if (scorer) {
      scorerShot = W.touchHist[si].shot;
      for (let i = si - 1; i >= 0; i--) {
        const h = W.touchHist[i];
        if (W.touchHist[si].t - h.t > 5) break;
        if (h.c === scorer) continue;
        if (h.c.team === team) assist = h.c;
        break;
      }
    }
    if (scorer) {
      scorer.st.goals++; scorer.st.score += CFG.pts.goal;
      if (!scorerShot) { scorer.st.shots++; scorer.st.score += CFG.pts.shot; }
    }
    if (assist) { assist.st.assists++; assist.st.score += CFG.pts.assist; }
    for (const c of W.cars) {
      if (c.demoT > 0) continue;
      const dx = c.p.x - B.p.x, dy = c.p.y - B.p.y, dz = c.p.z - B.p.z, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < 1600) { const s = (1 - d / 1600) * 2400 / (d || 1); c.vc.x += dx * s; c.vc.y += dy * s; c.vc.z += (1 - d / 1600) * 700; }
    }
    W.events.push({ type: 'goal', team, scorer, assist, speed: vlen(B.v), p: v3(B.p.x, B.p.y, B.p.z) });
    W.state = 'goal'; W.stateT = 0; B.hidden = true; vset(B.v, 0, 0, 0); W.pend = null;
  }
  function endMatch(W) {
    W.state = 'end'; W.stateT = 0; W.ball.hidden = true;
    W.events.push({ type: 'end', winner: W.score[0] > W.score[1] ? 0 : 1 });
  }

  const TRAIN_SPAWNS = ['center', 'random', 'roll', 'air', 'wall'];
  function trainStart(W) {
    W.score = [0, 0]; W.clock = W.len; W.ot = false; W.otT = 0; W.timeUp = false; W.clockOn = false; W.kickoff = false;
    W.state = 'play'; W.stateT = 0; W.touchHist = []; W.lastTouch = null; W.pend = null;
    for (const c of W.cars) c.st = newSt();
    for (const pd of W.pads) pd.t = 0;
    trainReset(W, 'all');
  }
  function trainBall(W, x, y, z, vx, vy, vz) {
    const B = W.ball;
    vset(B.p, x, y, z); vset(B.v, vx, vy, vz); vset(B.w, 0, 0, 0); B.hidden = false;
    W.train.resetT = -1; W.train.shot = false; W.train.idleT = 0; W.lastTouch = null;
    W.events.push({ type: 'tball' });
    if (!W.pr) predict(W);
  }
  function trainShot(W) {
    const T = W.train, c = W.cars[0], r = W.rng;
    if (!T || !c) return;
    const sx = (r() - 0.5) * 5000, sy = 400 + r() * 2400, sz = 100 + r() * 500;
    const gx = (r() - 0.5) * 1300, gy = -CFG.Y - 60, gz = 110 + r() * 420, t = 1.7 + r() * 1.1;
    let vx = (gx - sx) / t, vy = (gy - sy) / t, vz = (gz - sz) / t + CFG.g * t / 2;
    const sp = Math.hypot(vx, vy, vz);
    if (sp > 3600) { vx *= 3600 / sp; vy *= 3600 / sp; vz *= 3600 / sp; }
    trainBall(W, sx, sy, sz, vx, vy, vz);
    T.shot = true; T.shotT = W.time; T.shotsTaken++;
    W.events.push({ type: 'tshot', n: T.shotsTaken });
  }
  function trainReset(W, what) {
    const T = W.train, c = W.cars[0];
    if (!T) return;
    if ((what === 'car' || what === 'all') && c) { placeCar(c, 0, -4608, Math.PI / 2); c.boost = 100; c.prevJump = false; W.events.push({ type: 'treset', car: c }); }
    if (what !== 'ball' && what !== 'all') return;
    if (T.shots) { trainShot(W); return; }
    const r = W.rng, k = T.spawn, p = c ? c.p : v3(0, -4608, 17), f = c ? c.f : v3(0, 1, 0), hl = Math.hypot(f.x, f.y) || 1, fx = f.x / hl, fy = f.y / hl;
    const cl = (x, m) => clamp(x, -m, m);
    if (k === 'random') trainBall(W, (r() - 0.5) * 6000, (r() - 0.5) * 7000, CFG.ballRest, 0, 0, 0);
    else if (k === 'roll') { const d = 2200 + r() * 800, x = cl(p.x + fx * d, 3400), y = cl(p.y + fy * d, 4300), s = 700 + r() * 700, a = (r() - 0.5) * 0.5, dx = p.x - x, dy = p.y - y, dl = Math.hypot(dx, dy) || 1, ca = Math.cos(a), sa = Math.sin(a); trainBall(W, x, y, CFG.ballRest, (dx * ca - dy * sa) / dl * s, (dx * sa + dy * ca) / dl * s, 0); }
    else if (k === 'air') { const d = 1300 + r() * 900; trainBall(W, cl(p.x + fx * d, 3300), cl(p.y + fy * d, 4200), 650 + r() * 700, (r() - 0.5) * 200, (r() - 0.5) * 200, 250 + r() * 250); }
    else if (k === 'wall') { const sd = r() < 0.5 ? -1 : 1, y = (r() - 0.5) * 5000; trainBall(W, sd * 2600, y, CFG.ballRest, sd * (1500 + r() * 600), (r() - 0.5) * 500, 0); }
    else trainBall(W, 0, 0, CFG.ballRest, 0, 0, 0);
  }
  function trainTouch(W, c, rs) {
    const T = W.train;
    if (W.state !== 'play') return;
    W.lastTouch = c; c.touchT = W.time;
    W.events.push({ type: 'touch', car: c, v: rs });
    if (T.shot && W.threat[0] < 3) { const t0 = W.threat[0]; predict(W); if (W.threat[0] === Infinity) { T.shot = false; T.saves++; c.st.saves++; W.events.push({ type: 'tsave', car: c, epic: t0 < 0.45 }); } }
  }
  function trainRules(W, dt) {
    const T = W.train, B = W.ball, c = W.cars[0];
    if (T.unlimited) for (const m of W.cars) if (!m.bot) m.boost = 100;
    if (T.resetT >= 0) { if (W.time >= T.resetT) trainReset(W, 'ball'); return; }
    if (B.hidden) return;
    if (Math.abs(B.p.y) > CFG.goalLine + BR) {
      const team = B.p.y > 0 ? 0 : 1;
      if (team === 0) { T.goals++; if (c) c.st.goals++; } else T.conceded++;
      W.events.push({ type: 'tgoal', team, p: v3(B.p.x, B.p.y, B.p.z), speed: vlen(B.v), car: W.lastTouch, shot: T.shot });
      B.hidden = true; vset(B.v, 0, 0, 0); T.shot = false; T.resetT = W.time + 1.6;
      return;
    }
    if (T.shots && !T.was) { T.was = true; trainShot(W); return; }
    T.was = T.shots;
    if (T.shots) {
      const sp = vlen(B.v);
      T.idleT = sp < 250 && B.floor ? T.idleT + dt : 0;
      if (W.time - T.shotT > 9 || T.idleT > 1.2 || (!T.shot && W.time - T.shotT > 3 && W.threat[0] === Infinity && (B.v.y > 600 || B.p.y > 1500))) trainShot(W);
    }
  }
  function diffOf(W, c) {
    const D = c && c.ai && c.ai.D;
    if (D) for (const k of DIFF_IDS) if (DIFF[k] === D) return k;
    return W ? W.diff : 'pro';
  }
  function onTouch(W, c, rs) {
    if (W.mode === 'training' && !W.pr) { trainTouch(W, c, rs); return; }
    if (W.pr) { if (W.state === 'play') W.events.push({ type: 'touch', car: c, v: rs }); return; }
    if (W.state !== 'play') return;
    const B = W.ball, sg = c.team ? -1 : 1, first = W.kickoff;
    W.clockOn = true; W.kickoff = false;
    const h = { c, t: W.time, shot: false };
    W.lastTouch = c; W.touchHist.push(h);
    if (W.touchHist.length > 12) W.touchHist.shift();
    W.events.push({ type: 'touch', car: c, v: rs });
    if (first) c.st.score += CFG.pts.first;
    c.touchT = W.time;
    if (W.pend && W.pend.c.team !== c.team) W.pend = null;
    const own = W.threat[c.team], opp = W.threat[1 - c.team];
    predict(W);
    if (own < 2.5 && W.threat[c.team] === Infinity) {
      c.st.saves++;
      if (own < 0.45) { c.st.score += CFG.pts.epicSave; W.events.push({ type: 'epicsave', car: c }); }
      else { c.st.score += CFG.pts.save; W.events.push({ type: 'save', car: c }); }
    }
    if (W.threat[1 - c.team] < 4 && (opp >= 4 || W.time - c.shotT > 3)) { h.shot = true; c.shotT = W.time; c.st.shots++; c.st.score += CFG.pts.shot; W.events.push({ type: 'shot', car: c }); }
    if (c.nwW === 0 && !c.onGround && B.p.z > 500 && c.p.z > 380 && W.time - c.airHitT > 2) { c.airHitT = W.time; award(W, c, 'aerial'); }
    const y = B.p.y * sg;
    if (y < -CFG.Y / 3 && B.v.y * sg > 300) W.pend = { k: 'clear', c, t: W.time };
    else if (y > CFG.Y / 3 && Math.abs(B.p.x) > 1300 && B.v.x * B.p.x < 0 && !h.shot) W.pend = { k: 'center', c, t: W.time };
  }
  const PB = makeBall();
  function predict(W) {
    const B = W.ball, pr = W.pred;
    vcopy(PB.p, B.p); vcopy(PB.v, B.v); vcopy(PB.w, B.w);
    W.predAt = W.time; W.predT = 0.05; W.threat[0] = W.threat[1] = Infinity;
    let done = B.hidden;
    for (let i = 0; i < PN; i++) {
      if (i > 0 && !done) { ballStep(PB, PDT / 2); ballStep(PB, PDT / 2); }
      const o = i * 6;
      pr[o] = PB.p.x; pr[o + 1] = PB.p.y; pr[o + 2] = PB.p.z; pr[o + 3] = PB.v.x; pr[o + 4] = PB.v.y; pr[o + 5] = PB.v.z;
      if (!done && Math.abs(PB.p.y) > CFG.goalLine + BR) { W.threat[PB.p.y > 0 ? 1 : 0] = i * PDT; done = true; }
    }
  }

  function angleTo(c, x, y, z = c.p.z) {
    const dx = x - c.p.x, dy = y - c.p.y, dz = z - c.p.z;
    return Math.atan2(dx * c.l.x + dy * c.l.y + dz * c.l.z, dx * c.f.x + dy * c.f.y + dz * c.f.z);
  }
  const RT = new Float32Array(PN + 2);
  function reach(c, D) {
    let s = Math.max(0, vdot(c.v, c.f)), b = D.boost >= 0.5 ? c.boost : 0, d = 0;
    const h = PDT / 3, ta = CFG.thrWheel * 4 * D.thr;
    RT[0] = 0;
    for (let i = 1; i <= PN + 1; i++) {
      for (let k = 0; k < 3; k++) {
        let a = ta * curve(CFG.drive, s);
        if (b > 0 && s < CFG.carMax - 5) { a += CFG.boostGround; b -= CFG.boostUse * h; }
        s = Math.min(CFG.carMax, s + a * h); d += s * h;
      }
      RT[i] = d;
    }
  }
  function rAt(t) {
    if (t <= 0) return 0;
    const x = t / PDT, i = x | 0;
    return i >= PN ? RT[PN] : RT[i] + (RT[i + 1] - RT[i]) * (x - i);
  }
  const SD = { x: 0, y: 1 };
  function cone(nx, ny, cx, cy, half, out) {
    const cl = Math.hypot(cx, cy) || 1;
    cx /= cl; cy /= cl;
    const dev = Math.atan2(cx * ny - cy * nx, cx * nx + cy * ny), d = clamp(dev, -half, half), cs = Math.cos(d), sn = Math.sin(d);
    out.x = cx * cs - cy * sn; out.y = cx * sn + cy * cs;
    return Math.abs(dev) - half;
  }
  function shotDir(c, D, bx, by, sg, clear) {
    let nx = bx - c.p.x, ny = by - c.p.y;
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl; ny /= nl;
    const cv = c.ai && !c.ai.press ? 2.2 : clamp(nl / 1600, 0.25, 1.1);
    if (clear) {
      const gx = bx, gy = by + sg * (CFG.Y + 900), gl = Math.hypot(gx, gy) || 1;
      if (cone(nx, ny, gx / gl, gy / gl, 1.05, SD) <= cv) return SD;
      cone(nx, ny, Math.sign(bx || nx || 1), sg * 0.6, 0.8, SD);
      return SD;
    }
    const m = 160 + (1 - D.aim) * 420, gy = sg * (CFG.Y + 150) - by, lx = -(GW - m) - bx, rx = GW - m - bx;
    const ll = Math.hypot(lx, gy), rl = Math.hypot(rx, gy), cx = lx / ll + rx / rl, cy = gy / ll + gy / rl;
    const half = Math.acos(clamp((lx * rx + gy * gy) / (ll * rl), -1, 1)) / 2;
    if (by * sg > 3600 && Math.abs(bx) > 1900) { if (cone(nx, ny, -bx, sg * 3200 - by, 0.6, SD) <= cv) return SD; }
    if (cone(nx, ny, cx, cy, half, SD) <= cv) return SD;
    const ex = SD.x, ey = SD.y;
    if (cone(nx, ny, 0, sg, 1.2, SD) <= 0.05) return SD;
    SD.x = ex; SD.y = ey;
    return SD;
  }
  function jumpTime(h, dj) {
    if (h <= 0) return 0.03;
    if (h <= 74) return (-291 + Math.sqrt(291 * 291 + 1616 * h)) / 808;
    const v = dj ? 744 : 452, q = v * v - 1300 * (h - 74);
    if (q < 0) return -1;
    return 0.2 + (v - Math.sqrt(q)) / 650;
  }
  function aerialOK(c, D, x, y, z, t) {
    if (!c.onGround || c.nwW < 3 || c.u.z < 0.85 || t < 0.3 || t > 3.3) return false;
    const dj = z > 420, T = t - 0.2, vz = c.v.z + (dj ? 740 : 450);
    const px = c.p.x + c.v.x * 0.2, py = c.p.y + c.v.y * 0.2, pz = c.p.z + 75;
    const dx = x - px - c.v.x * T, dy = y - py - c.v.y * T, dz = z - pz - vz * T + 325 * T * T;
    const L = Math.hypot(dx, dy, dz), need = 2 * L / (T * T);
    if (need > (D.an || 880)) return false;
    const hl = Math.hypot(dx, dy);
    if (hl > 150 && (dx * c.f.x + dy * c.f.y) / hl < 0.75) return false;
    return c.boost >= T * CFG.boostUse * clamp(need / CFG.boostAir + 0.15, 0.3, 1) + 6;
  }
  const HIT = { ok: false, t: 0, x: 0, y: 0, z: 0, dx: 0, dy: 1, tx: 0, ty: 0, kind: '', i: 0 }, HIT2 = Object.assign({}, HIT);
  function findHit(W, c, D, clear, out) {
    const pr = W.pred, base = Math.max(0, Math.round((W.time - W.predAt) / PDT)), sg = c.team ? -1 : 1, bk = BR + c.cfg.front - 12;
    reach(c, D);
    let hfx = c.f.x, hfy = c.f.y;
    const hl = Math.hypot(hfx, hfy);
    if (hl < 0.3) { hfx = c.u.x; hfy = c.u.y; }
    const hn = Math.hypot(hfx, hfy) || 1;
    hfx /= hn; hfy /= hn;
    out.ok = false;
    for (let i = base; i < PN; i++) {
      const o = i * 6, x = pr[o], y = pr[o + 1], z = pr[o + 2], t = (i - base) * PDT;
      let kind = z < 165 ? 'g' : z < 310 && D.jump ? 'j' : z < D.aerial ? 'a' : '';
      if (D.wall && z > 200 && z < 1500 && Math.abs(x) > CFG.X - 300 && Math.abs(y) < CFG.Y - 900) kind = 'w';
      const last = i === PN - 1;
      if (!kind && !last) continue;
      const sd = shotDir(c, D, x, y, sg, clear);
      let tx = clamp(x - sd.x * bk, 60 - CFG.X, CFG.X - 60), ty = clamp(y - sd.y * bk, 60 - CFG.Y, CFG.Y - 60), tz = 17;
      if (kind === 'w') { tx = Math.sign(x) * (CFG.X - 20); ty = y - (sd.y >= 0 ? 1 : -1) * bk * 0.7; tz = Math.max(17, z - bk * 0.7); }
      const ex = tx - c.p.x, ey = ty - c.p.y;
      let dist = Math.hypot(ex, ey) + (kind === 'w' ? tz * 1.15 : 0);
      if (kind === 'a' && !last && (!aerialOK(c, D, x - sd.x * (BR + 40), y - sd.y * (BR + 40), z - 30, t) || (D.ag && c.ai && t > c.ai.opT - D.ag && !clear))) { if (z < 470 && D.flip && D.dj) kind = 'd'; else continue; }
      if (kind !== 'a' && !last) {
        const ang = Math.acos(clamp((ex * hfx + ey * hfy) / (dist || 1), -1, 1)), along = -(ex * sd.x + ey * sd.y);
        if (along > -60) dist += along * 1.6 + 350;
        if (rAt(t - D.react - ang * 0.3 - (ang > 1.9 ? 0.3 : 0) - (kind === 'w' ? 0.3 : 0)) < dist + (kind === 'j' || kind === 'd' ? 40 : 0)) continue;
      }
      out.ok = !last || !!kind; out.t = t; out.x = x; out.y = y; out.z = z; out.dx = sd.x; out.dy = sd.y; out.tx = tx; out.ty = ty; out.tz = tz; out.kind = kind || 'g'; out.i = i;
      return out;
    }
    return out;
  }
  function roleCost(W, m, sg) {
    const B = W.ball, D = m.ai ? m.ai.D || DIFF[W.diff] : DIFF.pro, pr = m.ai ? m.ai.press : 0;
    if (m.ai) m.ai.press = true;
    const h = findHit(W, m, D, W.threat[m.team] < 3 || B.p.y * sg < -CFG.Y * 0.4, HIT2);
    if (m.ai) m.ai.press = pr;
    let t = h.t + (h.ok ? 0 : 1.5);
    const ahead = (m.p.y - B.p.y) * sg;
    if (ahead > 0) t += 0.3 + ahead / 2500;
    const s = m.ai && m.ai.seq;
    if (s && (s.type === 'aerial' || s.type === 'jump' || (s.type === 'flip' && s.hit))) t -= 1.5;
    if (!m.bot) t -= 0.25;
    if (m.boost < 12) t += 0.15;
    if (!m.onGround) t += 0.2;
    return t;
  }
  function teamRoles(W, team) {
    const list = W.roles[team];
    if (W.roleT[team] === W.tick) return list;
    W.roleT[team] = W.tick;
    const sg = team ? -1 : 1, prev = W.first[team];
    list.length = 0;
    for (const m of W.cars) if (m.team === team && m.demoT <= 0) { m.rc = roleCost(W, m, sg); list.push(m); }
    list.sort((a, b) => a.rc - b.rc);
    const pi = list.indexOf(prev);
    if (pi > 0 && prev.rc < list[0].rc + 0.3) { list.splice(pi, 1); list.unshift(prev); }
    if (list.length === 3 && (list[2].p.y - list[1].p.y) * sg > 0) { const x = list[1]; list[1] = list[2]; list[2] = x; }
    W.first[team] = list[0] || null;
    return list;
  }
  function pickPad(W, c, tx, ty, big, maxDet) {
    let best = null, bd = maxDet;
    const dd = Math.hypot(tx - c.p.x, ty - c.p.y);
    for (const pd of W.pads) {
      if (pd.t > 0.3 || (big && !pd.big)) continue;
      const det = Math.hypot(pd.x - c.p.x, pd.y - c.p.y) + Math.hypot(tx - pd.x, ty - pd.y) - dd;
      if (det < bd) { bd = det; best = pd; }
    }
    return best;
  }
  function aiStep(W, c, dt) {
    const A = c.ai;
    A.think -= dt;
    if (A.think <= 0) { A.think = (A.D || DIFF[W.diff]).think; aiPlan(W, c); }
    aiControl(W, c, dt);
  }
  function setPos(A, x, y, want, park) { A.mode = 'pos'; A.tx = clamp(x, -CFG.X + 300, CFG.X - 300); A.ty = clamp(y, -CFG.Y + 250, CFG.Y - 250); A.want = want; A.park = park; }
  function aiPlan(W, c) {
    const A = c.ai, D = A.D || DIFF[W.diff], B = W.ball, sg = c.team ? -1 : 1;
    if (A.seq) return;
    A.park = false; A.arrive = 0; A.want = 2300; A.kind = ''; A.pad = null; A.save = false; A.boostOK = D.boost >= 0.5;
    if (W.state !== 'play' || B.hidden) { A.mode = 'idle'; return; }
    if (W.kickoff) { kickPlan(W, c, A, D, sg); return; }
    const R = teamRoles(W, c.team), O = teamRoles(W, 1 - c.team), role = R.indexOf(c), n = R.length;
    const opp = O[0], opT = opp ? opp.rc : 9, myT = c.rc, threat = W.threat[c.team];
    A.opT = opT;
    const by = B.p.y * sg, ownY = -sg * CFG.Y, goalSide = (c.p.y - B.p.y) * sg < 120;
    const danger = threat < 3.2, clear = danger || by < -CFG.Y * 0.45;
    A.role = role;
    if (role === 0 && D.dribble && onRoof(c, B)) { A.mode = 'carry'; return; }
    if (role === 0) {
      A.press = opT < myT + 0.7 || by < -CFG.Y * 0.3;
      const h = findHit(W, c, D, clear, HIT), gd = Math.hypot(B.p.x, B.p.y - ownY), adv = myT - opT, was = A.mode === 'pos' && (A.shadow || A.retreat);
      A.shadow = A.retreat = false;
      if (D.save && danger && (!h.ok || h.t > threat - 0.2) && goalLine(W, c, A, D, sg, threat)) return;
      if (!danger && !goalSide && adv > -0.25 + (was ? -0.3 : 0) && gd < 7000 && D.rot > 0.3) { retreat(W, c, A, D, sg); padDetour(W, c, A, D); return; }
      if (!danger && adv > D.chal + (n > 1 ? 0.5 : 0) + (was ? -0.25 : 0.1) && gd > 2600 && D.rot > 0.3) { shadow(W, c, A, D, sg); padDetour(W, c, A, D); return; }
      if (c.boost < 15 && !danger && myT > 1.6 && opT > 1.4 && gd > 4000 && D.boost >= 0.5) {
        const pd = pickPad(W, c, h.tx, h.ty, true, 1400);
        if (pd) { setPos(A, pd.x, pd.y, 2300, false); A.pad = pd; return; }
      }
      A.mode = 'hit'; A.kind = h.kind; A.dx = h.dx; A.dy = h.dy;
      const err = D.err ? (W.rng() - 0.5) * D.err : 0;
      A.tx = h.tx + err * h.dy; A.ty = h.ty - err * h.dx; A.arrive = W.time + h.t; A.clear = clear;
      return;
    }
    if (!goalSide && D.rot > 0.5 && (role === n - 1 || by < 0)) { retreat(W, c, A, D, sg); return; }
    if (danger && role === n - 1) { setPos(A, clamp(B.p.x * 0.3, -500, 500), ownY + sg * 350, 2300, true); return; }
    if (D.demo && role === 1 && n > 1 && c.boost > 40 && by > 0) {
      for (const o of W.cars) if (o.team !== c.team && o.demoT <= 0 && o.onGround) {
        const d = Math.hypot(o.p.x - c.p.x, o.p.y - c.p.y);
        if (d < 1800 && d > 300 && Math.abs(angleTo(c, o.p.x, o.p.y)) < 0.45 && W.rng() < D.demo * 0.25) {
          A.mode = 'demo'; A.tgt = o; A.until = W.time + 2; return;
        }
      }
    }
    let tx, ty;
    if (role === n - 1 && n > 1 && (n === 3 || by < 0)) {
      const far = clamp((by + CFG.Y) / (2 * CFG.Y), 0, 1);
      tx = clamp(B.p.x * 0.25, -600, 600); ty = ownY + sg * (350 + far * 2400);
    } else {
      const back = n === 3 ? 1500 : 1900;
      tx = B.p.x * 0.45; ty = B.p.y - sg * back;
      if (ty * sg < -CFG.Y + 800) ty = ownY + sg * 800;
      if (n === 3 && W.first[c.team]) tx -= Math.sign(W.first[c.team].p.x - B.p.x || 1) * 500;
    }
    setPos(A, tx, ty, 2300, true);
    if (c.boost < 55 && threat > 4 && D.boost >= 0.5) {
      const pd = pickPad(W, c, A.tx, A.ty, c.boost < 25, c.boost < 25 ? 1600 : 500);
      if (pd) { A.tx = pd.x; A.ty = pd.y; A.park = false; A.pad = pd; }
    }
  }
  function padDetour(W, c, A, D) {
    if (!D.bm || c.boost >= D.bm) return;
    const pd = pickPad(W, c, A.tx, A.ty, false, c.boost < D.bm * 0.4 ? 1100 : 500);
    if (pd) { A.tx = pd.x; A.ty = pd.y; A.park = false; A.pad = pd; }
  }
  function goalLine(W, c, A, D, sg, threat) {
    const pr = W.pred, base = Math.max(0, Math.round((W.time - W.predAt) / PDT));
    let gx = W.ball.p.x;
    for (let i = base; i < PN; i++) if (pr[i * 6 + 1] * sg < -(CFG.Y - 120)) { gx = pr[i * 6]; break; }
    const tx = clamp(gx * 0.85, -GW + 140, GW - 140), ty = -sg * (CFG.Y - 260), d = Math.hypot(tx - c.p.x, ty - c.p.y);
    if ((c.p.y - W.ball.p.y) * sg > -200 && d < 400) return false;
    if (rAt(threat - 0.15) < d) return false;
    setPos(A, tx, ty, 2300, true); A.save = true; A.boostOK = true;
    return true;
  }
  function retreat(W, c, A, D, sg) {
    const B = W.ball, side = -Math.sign(B.p.x || c.p.x || 1);
    const ty = Math.min((B.p.y * sg - 1400), (c.p.y * sg - 600)) * sg;
    setPos(A, side * Math.max(900, Math.min(2600, Math.abs(c.p.x))), Math.max(ty * sg, -CFG.Y + 700) * sg, 2300, false);
    A.retreat = true;
    if ((A.ty - c.p.y) * sg > -400) setPos(A, side * 700, -sg * (CFG.Y - 500), 2300, true);
  }
  function shadow(W, c, A, D, sg) {
    const B = W.ball, dx = -B.p.x, dy = -sg * CFG.Y - B.p.y, d = Math.hypot(dx, dy) || 1;
    const k = clamp(d * 0.45, 900, 2000);
    setPos(A, B.p.x + dx / d * k, B.p.y + dy / d * k, 2300, true);
    A.shadow = true;
  }
  function kickPlan(W, c, A, D, sg) {
    if (W.kicker[c.team] === c) { A.mode = 'kick'; return; }
    let rank = 0;
    for (const m of W.cars) if (m.team === c.team && m !== W.kicker[c.team] && m !== c && Math.hypot(m.p.x, m.p.y) < Math.hypot(c.p.x, c.p.y) - 1) rank++;
    if (rank === 0) { setPos(A, c.p.x * 0.25, -sg * 1700, 1600, true); return; }
    const sx = Math.sign(c.p.x || 1), pd = W.pads.find(p => p.big && p.x * sx > 0 && p.y * sg < -CFG.Y / 2);
    if (pd && pd.t <= 0 && c.boost < 90) { setPos(A, pd.x, pd.y, 2300, false); A.pad = pd; }
    else setPos(A, 0, -sg * (CFG.Y - 600), 2300, true);
  }
  const AQ = v3();
  function aimAir(c, k, fx, fy, fz, ux, uy, uz) {
    const f = c.f, l = c.l, u = c.u, w = c.w;
    let ax = f.y * fz - f.z * fy, ay = f.z * fx - f.x * fz, az = f.x * fy - f.y * fx;
    const s = Math.sqrt(ax * ax + ay * ay + az * az), th = Math.atan2(s, f.x * fx + f.y * fy + f.z * fz);
    if (s > 1e-6) { ax *= th / s; ay *= th / s; az *= th / s; } else if (th > 1) { ax = -l.x * th; ay = -l.y * th; az = -l.z * th; }
    const ep = -(ax * l.x + ay * l.y + az * l.z), ey = -(ax * u.x + ay * u.y + az * u.z), er = -Math.atan2(ux * l.x + uy * l.y + uz * l.z, ux * u.x + uy * u.y + uz * u.z);
    const rate = (e, a) => Math.sign(e) * Math.min(5.5, Math.sqrt(1.1 * a * Math.abs(e)), 9 * Math.abs(e));
    const wp = -vdot(w, l), wy = -vdot(w, u), wr = vdot(w, f);
    k.pitch = clamp((rate(ep, 12.4) - wp) * 0.9, -1, 1);
    k.yaw = clamp((rate(ey, 9.1) - wy) * 1.2, -1, 1);
    k.roll = clamp((rate(er * (Math.abs(th) < 1.2 ? 1 : 0.3), 38) - wr) * 0.35, -1, 1);
    return th;
  }
  function recover(W, c, A, k, D, dt) {
    const v = c.v;
    k.throttle = 1;
    if (c.wc || (c.nw > 0 && c.nw < 3)) {
      A.rest += dt;
      if (A.rest > 0.15 && vlen(v) < 500) {
        if (c.u.z < -0.2 || A.rest > 1.6) k.jump = !c.prevJump;
        return;
      }
    } else A.rest = 0;
    const t = 0.35, qx = c.p.x + v.x * t, qy = c.p.y + v.y * t, qz = c.p.z + v.z * t - 40;
    let nx = 0, ny = 0, nz = 1;
    if (sdf(qx, qy, qz) < 400 && !(c.p.z < 500 && v.z < 0 && Math.abs(c.p.x) < 3500 && Math.abs(c.p.y) < 4600)) { sdfN(qx, qy, qz, AQ); nx = AQ.x; ny = AQ.y; nz = AQ.z; }
    const vn = v.x * nx + v.y * ny + v.z * nz;
    let fx = v.x - nx * vn, fy = v.y - ny * vn, fz = v.z - nz * vn;
    if (Math.hypot(fx, fy, fz) < 200) { const d = c.f.x * nx + c.f.y * ny + c.f.z * nz; fx = c.f.x - nx * d; fy = c.f.y - ny * d; fz = c.f.z - nz * d; }
    if (A.mode === 'hit' || A.mode === 'pos') {
      const tx = A.tx - c.p.x, ty = A.ty - c.p.y, tn = tx * nx + ty * ny;
      const gx = tx - nx * tn, gy = ty - ny * tn, gz = -nz * tn, gl = Math.hypot(gx, gy, gz), fl = Math.hypot(fx, fy, fz) || 1;
      if (gl > 1 && c.p.z < 300) { fx = fx / fl + gx / gl * 0.6; fy = fy / fl + gy / gl * 0.6; fz = fz / fl + gz / gl * 0.6; }
    }
    const fl = Math.hypot(fx, fy, fz) || 1;
    aimAir(c, k, fx / fl, fy / fl, fz / fl, nx, ny, nz);
  }
  function drive(c, k, tx, ty, tz, want, D, boostOK) {
    const dx = tx - c.p.x, dy = ty - c.p.y, dz = tz - c.p.z;
    const lf = dx * c.f.x + dy * c.f.y + dz * c.f.z, ll = dx * c.l.x + dy * c.l.y + dz * c.l.z;
    const ang = Math.atan2(ll, lf), dist = Math.hypot(lf, ll), fs = vdot(c.v, c.f), wz = vdot(c.w, c.u);
    if (Math.abs(ang) > 2.3 && dist < 700 && fs < 300) {
      k.throttle = -1; k.steer = clamp(-Math.atan2(-ll, -lf) * 3 - wz * 0.3, -1, 1);
      return ang;
    }
    k.steer = clamp(-ang * 3.2 + wz * 0.32, -1, 1);
    if (fs < want - 60) k.throttle = D.thr; else if (fs > want + 150) k.throttle = fs > want + 450 ? -1 : 0; else k.throttle = 0.03;
    k.slide = Math.abs(ang) > 1.3 && fs > 650 && c.u.z > 0.6;
    k.boost = boostOK && c.boost > 0 && Math.abs(ang) < 0.32 && want > fs + 120 && fs < 2280 && c.nwW >= 3;
    return ang;
  }
  function predAt(W, t, o) {
    const pr = W.pred, x = clamp((t - W.predAt) / PDT, 0, PN - 1.001), i = x | 0, a = x - i, j = i * 6;
    for (let q = 0; q < 6; q++) o[q] = pr[j + q] + (pr[j + 6 + q] - pr[j + q]) * a;
    return o;
  }
  const PQ = new Float32Array(6);
  function aiControl(W, c, dt) {
    const A = c.ai, k = c.ctl, D = A.D || DIFF[W.diff], B = W.ball, sg = c.team ? -1 : 1;
    k.throttle = k.steer = k.pitch = k.yaw = k.roll = 0; k.boost = k.jump = k.slide = false;
    if (c.demoT > 0) { A.seq = null; return; }
    if (A.seq) { if (runSeq(W, c, A, A.seq, k, D, dt)) return; A.seq = null; k.throttle = k.steer = k.pitch = k.yaw = k.roll = 0; k.boost = k.jump = k.slide = false; }
    if (!c.onGround && c.nwW < 3) { recover(W, c, A, k, D, dt); return; }
    A.rest = 0;
    const fs = vdot(c.v, c.f);
    if (A.mode === 'idle') { k.throttle = Math.abs(fs) > 50 ? -Math.sign(fs) : 0; return; }
    if (c.u.z < 0.5 && c.p.z < 1400 && A.mode !== 'hit') { drive(c, k, c.p.x * 0.9, c.p.y * 0.9, 17, 1600, D, false); k.boost = false; return; }
    if (D.half && (A.mode === 'hit' || A.mode === 'pos') && c.p.z < 40 && c.u.z > 0.95 && Math.abs(fs) < 350 && W.time - A.hfT > 3) {
      const ta = angleTo(c, A.tx, A.ty), td = Math.hypot(A.tx - c.p.x, A.ty - c.p.y);
      if (Math.abs(ta) > 2.7 && td > 1600) { A.hfT = W.time; A.seq = { type: 'half', t: 0 }; runSeq(W, c, A, A.seq, k, D, dt); return; }
    }
    if (A.mode === 'kick') kickControl(W, c, A, k, D, sg);
    else if (A.mode === 'hit') hitControl(W, c, A, k, D, sg, dt);
    else if (A.mode === 'carry') carryControl(W, c, A, k, D, sg);
    else if (A.mode === 'demo') {
      const o = A.tgt;
      if (!o || o.demoT > 0 || W.time > A.until) { A.mode = 'idle'; A.think = 0; }
      else { const t = Math.hypot(o.p.x - c.p.x, o.p.y - c.p.y) / Math.max(1200, fs); drive(c, k, o.p.x + o.v.x * t, o.p.y + o.v.y * t, o.p.z, 2300, D, true); }
    } else {
      const dist = Math.hypot(A.tx - c.p.x, A.ty - c.p.y);
      if (A.park && dist < 260) {
        const ab = angleTo(c, B.p.x, B.p.y);
        if (Math.abs(ab) > 0.5) { k.throttle = fs < 350 ? 0.6 : 0; k.steer = clamp(-ab * 2, -1, 1); }
        else k.throttle = Math.abs(fs) > 40 ? clamp(-fs / 250, -1, 1) : 0;
      } else {
        let want = A.park ? Math.min(A.want, dist * 1.6 + 300) : A.want;
        drive(c, k, A.tx, A.ty, 17, want, D, A.boostOK && (A.save || (dist > 1500 && c.boost > (A.pad ? 0 : D.res || 35))));
      }
    }
    if (c.p.y * sg < -CFG.Y - 60 && A.mode !== 'hit') drive(c, k, 0, -sg * 4400, 17, 1400, D, false);
    if (Math.abs(fs) < 90 && Math.abs(k.throttle) > 0.5 && !k.slide) {
      A.stuck += dt;
      if (A.stuck > 1.1) { A.stuck = 0; A.unst++; A.seq = A.unst % 2 === 0 || c.u.z < 0.6 ? { type: 'flip', t: 0, dx: 0, dy: 0, hold: 0.2, boost: false, j: true } : { type: 'rev', t: 0, s: k.steer > 0 ? -1 : 1, th: -Math.sign(k.throttle) }; }
    } else { A.stuck = Math.max(0, A.stuck - dt * 0.5); if (Math.abs(fs) > 500) A.unst = 0; }
  }
  function onRoof(c, B) {
    if (!c.onGround || c.u.z < 0.85 || B.hidden) return false;
    const dx = B.p.x - c.p.x, dy = B.p.y - c.p.y, dz = B.p.z - c.p.z;
    const lx = dx * c.f.x + dy * c.f.y + dz * c.f.z, ly = dx * c.l.x + dy * c.l.y + dz * c.l.z, lz = dx * c.u.x + dy * c.u.y + dz * c.u.z;
    return lz > 80 && lz < 210 && lx > -50 && lx < 130 && Math.abs(ly) < 75 && Math.hypot(B.v.x - c.v.x, B.v.y - c.v.y) < 500;
  }
  function carryControl(W, c, A, k, D, sg) {
    const B = W.ball, fs = vdot(c.v, c.f);
    if (!onRoof(c, B)) { A.mode = 'idle'; A.think = 0; k.throttle = 1; return; }
    const dx = B.p.x - c.p.x, dy = B.p.y - c.p.y, dz = B.p.z - c.p.z;
    const lx = dx * c.f.x + dy * c.f.y + dz * c.f.z, ly = dx * c.l.x + dy * c.l.y + dz * c.l.z, bf = vdot(B.v, c.f);
    const ga = angleTo(c, clamp(-B.p.x * 0.3, -600, 600), sg * CFG.Y);
    k.steer = clamp(-ga * 0.6 - ly * 0.025, -0.7, 0.7);
    const th = (lx - 25) * 0.04 + (bf - fs) * 0.006;
    k.throttle = clamp(th, -1, 1);
    k.boost = th > 1.2 && fs < 1800 && c.boost > 10;
    let opp = 1e9;
    for (const o of W.cars) if (o.team !== c.team && o.demoT <= 0) opp = Math.min(opp, Math.hypot(o.p.x - c.p.x, o.p.y - c.p.y));
    if (opp < 900 || (B.p.y * sg > 3300 && Math.abs(B.p.x) < 1600) || (fs > 1300 && opp < 1500)) A.seq = { type: 'flip', t: 0, dx: 1, dy: clamp(-ga, -0.5, 0.5), hold: 0.1, boost: false, hit: true };
  }
  function kickControl(W, c, A, k, D, sg) {
    const B = W.ball, d = Math.hypot(B.p.x - c.p.x, B.p.y - c.p.y), fs = vdot(c.v, c.f), sx = Math.sign(c.p.x) || (c.team ? -1 : 1);
    const ang = drive(c, k, B.p.x + sx * D.ko, B.p.y - sg * 6, 17, 2300, D, D.kick > 0);
    if (D.kick === 0) { k.boost = false; k.throttle = 1; return; }
    k.boost = c.boost > 0 && Math.abs(ang) < 0.5;
    if (W.stateT < 0.05) A.k0 = d;
    if (D.kf && !A.kf && A.k0 > 3600 && A.k0 < 4300 && c.boost < D.kb && fs > 1150 && d > D.kf && Math.abs(ang) < 0.08) { A.kf = true; A.seq = { type: 'flip', t: 0, dx: 1, dy: 0, hold: 0.04, boost: true }; return; }
    if (d < D.kd + fs * D.kk && fs > 900) A.seq = { type: 'flip', t: 0, dx: 1, dy: clamp(-ang * 3 - sx * sg * D.ky, -1, 1), hold: 0.05, boost: true, hit: true };
  }
  function ownRisk(c, B, sg) {
    const hx = B.p.x - c.p.x, hy = B.p.y - c.p.y, hl = Math.hypot(hx, hy);
    if (hl > 1100 || hl < 1) return false;
    const ux = hx / hl, uy = hy / hl;
    if (uy * sg > -0.15) return false;
    const tt = (-sg * CFG.Y - B.p.y) / uy;
    return tt > -200 && tt < 4000 && Math.abs(B.p.x + ux * tt) < GW + 350;
  }
  function hitControl(W, c, A, k, D, sg, dt) {
    const B = W.ball, front = c.cfg.front, T = A.arrive - W.time, q = predAt(W, A.arrive, PQ);
    const bx = q[0], by = q[1], bz = q[2], bk = BR + front - 12;
    if (A.kind === 'w') {
      const wx = Math.sign(bx) * (CFG.X - 20), wy = by - (A.dy >= 0 ? 1 : -1) * bk * 0.7, wz = Math.max(17, bz - bk * 0.7);
      const wd = Math.hypot(wx - c.p.x, wy - c.p.y) + Math.max(0, wz - c.p.z) * 1.1;
      drive(c, k, wx, wy, wz, T > 0.1 ? clamp(wd / T + 120, 500, 2300) : 2300, D, A.boostOK && c.nwW >= 3);
      if (T < -0.3) A.think = 0;
      return;
    }
    const tx = clamp(bx - A.dx * bk, 60 - CFG.X, CFG.X - 60), ty = clamp(by - A.dy * bk, 60 - CFG.Y, CFG.Y - 60), d = Math.hypot(tx - c.p.x, ty - c.p.y), fs = vdot(c.v, c.f);
    const bd = Math.hypot(B.p.x - c.p.x, B.p.y - c.p.y, B.p.z - c.p.z), ab = angleTo(c, B.p.x, B.p.y, B.p.z);
    let ax = tx, ay = ty, det = false;
    const rx = c.p.x - bx, ry = c.p.y - by, al = rx * A.dx + ry * A.dy, lat = ry * A.dx - rx * A.dy, side = lat >= 0 ? 1 : -1;
    if (al > -bk * 0.55 && !A.press) {
      ax = bx - A.dx * 420 - A.dy * side * 340; ay = by - A.dy * 420 + A.dx * side * 340; det = true;
    } else if (d > 300) {
      const off = clamp(d * 0.4, 0, 900) * clamp(Math.abs(lat) / (Math.abs(al) + 1), 0.15, 1.2);
      ax = tx - A.dx * off; ay = ty - A.dy * off;
    }
    if (!det) {
      const sx = ax - c.p.x, sy = ay - c.p.y, s2 = sx * sx + sy * sy || 1, u = clamp(((B.p.x - c.p.x) * sx + (B.p.y - c.p.y) * sy) / s2, 0, 1);
      const qx = c.p.x + sx * u - B.p.x, qy = c.p.y + sy * u - B.p.y, ql = Math.hypot(qx, qy);
      if (u > 0.05 && u < 0.85 && ql < BR + 140 && Math.hypot(B.p.x - c.p.x, B.p.y - c.p.y) > 260) {
        const sd = qx * -sy + qy * sx >= 0 ? 1 : -1, sl = Math.sqrt(s2);
        ax = B.p.x - sy / sl * sd * (BR + 260); ay = B.p.y + sx / sl * sd * (BR + 260);
      }
    }
    const risky = ownRisk(c, B, sg);
    if (risky) {
      const gx = -B.p.x, gy = -sg * CFG.Y - B.p.y, gl = Math.hypot(gx, gy) || 1, px = -gy / gl, py = gx / gl, sd = (c.p.x - B.p.x) * px + (c.p.y - B.p.y) * py >= 0 ? 1 : -1;
      ax = B.p.x + px * sd * (BR + 260) + gx / gl * 260; ay = B.p.y + py * sd * (BR + 260) + gy / gl * 260;
    }
    ax = clamp(ax, -CFG.X + 120, CFG.X - 120); ay = clamp(ay, -CFG.Y + 120, CFG.Y - 120);
    let want = T > 0.05 ? d / T + 150 : 2300;
    if (A.clear || (A.kind === 'g' && T < 0.6)) want = Math.max(want, A.clear ? 2300 : 1300);
    if (A.kind === 'g' && !det) want = Math.max(want, D.gs || 0);
    const soft = D.soft && !A.press && !A.clear && A.kind === 'g' && B.p.y * sg < 2600 && vlen(B.v) < 700 && B.p.z < 130 && (A.dx * c.f.x + A.dy * c.f.y) > 0.8;
    if (soft) want = Math.min(want, Math.hypot(B.v.x, B.v.y) + 450);
    want = clamp(want, 400, 2300);
    drive(c, k, ax, ay, 17, want, D, A.boostOK);
    if (T < -0.25 || W.time - A.arrive > 0.25) { A.think = 0; }
    if (c.u.z < 0.75) return;
    if (A.kind === 'a') {
      if (T < 3.3 && aerialOK(c, D, bx - A.dx * (BR + 40), by - A.dy * (BR + 40), bz - 30, T)) A.seq = { type: 'aerial', t: 0, tHit: A.arrive, dj: bz > 420, dx: A.dx, dy: A.dy };
      return;
    }
    if (A.kind === 'j' || A.kind === 'd') {
      const dj = A.kind === 'd', jt = jumpTime(bz - 60 - c.p.z, dj);
      if (jt > 0 && T <= jt + 0.02 && d < 260 + Math.abs(fs) * T) A.seq = { type: 'jump', t: 0, hold: 0.2, dj, dodge: D.flip > 0 && !dj, tHit: A.arrive };
      return;
    }
    if (risky || soft) return;
    if (D.flip && B.p.z < 175 && bd < BR + front + 40 + Math.max(0, fs) * 0.16 && Math.abs(ab) < 0.5 && fs > 550 && W.time - c.landT > 0.15) {
      const sdot = A.dx * c.f.x + A.dy * c.f.y;
      if (sdot > 0.3 || A.clear) A.seq = { type: 'flip', t: 0, dx: 1, dy: clamp(-ab * 2.5, -1, 1), hold: 0.05, boost: false, hit: true };
    } else if (!D.flip && B.p.z > 140 && B.p.z < 260 && bd < 260 && Math.abs(ab) < 0.4) A.seq = { type: 'jump', t: 0, hold: D.hold, dj: false, dodge: false, tHit: W.time + 0.3 };
  }
  function runSeq(W, c, A, s, k, D, dt) {
    s.t += dt;
    const B = W.ball;
    if (s.type === 'half') {
      const q = s.t - 0.22;
      k.throttle = -1;
      if (q < 0) return true;
      if (q < 0.05) k.jump = true;
      else if (q < 0.07) k.jump = false;
      else if (q < 0.09) { k.jump = true; k.pitch = 1; }
      else if (q < 0.45) k.pitch = 1;
      else {
        k.throttle = 1; k.pitch = -1;
        if (c.u.z < 0.9) k.roll = Math.atan2(c.l.z, c.u.z) > 0 ? -1 : 1;
      }
      return !(c.onGround && q > 0.5) && s.t < 2;
    }
    if (s.type === 'rev') {
      k.throttle = s.th; k.steer = s.s;
      return s.t < 0.7;
    }
    if (s.type === 'flip') {
      k.throttle = 1; k.boost = s.boost && c.boost > 0;
      if (s.t < s.hold) k.jump = true;
      else if (s.t < s.hold + 0.02) k.jump = false;
      else if (!s.done) { if (!s.j) { k.jump = true; k.pitch = -s.dx; k.yaw = s.dy; } s.done = true; }
      else if (s.t > 0.75 && !c.onGround) { recover(W, c, A, k, D, dt); k.boost = false; }
      if (s.t > 0.2 && c.u.z < 0.3 && s.t > 0.75) k.boost = false;
      return !((c.onGround && s.t > 0.3) || s.t > 1.8);
    }
    if (s.type === 'jump') {
      k.throttle = 1;
      if (s.t < s.hold) k.jump = true;
      else if (s.dj && !s.djd) { if (s.t > s.hold + 0.02) { k.jump = true; s.djd = true; } }
      const bd = Math.hypot(B.p.x - c.p.x, B.p.y - c.p.y, B.p.z - c.p.z);
      if (!s.done && s.t > s.hold + 0.02 && s.dodge && !c.flipped && bd < BR + c.cfg.front + 70) {
        const ab = angleTo(c, B.p.x, B.p.y, B.p.z);
        k.jump = true; k.pitch = -1; k.yaw = clamp(-ab * 2.5, -1, 1); s.done = true;
      } else if (!c.onGround && !s.done) {
        const dx = B.p.x - c.p.x, dy = B.p.y - c.p.y, dz = B.p.z - c.p.z, dl = Math.hypot(dx, dy, dz) || 1;
        const kk = { pitch: 0, yaw: 0, roll: 0 };
        aimAir(c, kk, dx / dl, dy / dl, dz / dl, 0, 0, 1);
        if (!c.flipping) { k.pitch = kk.pitch; k.yaw = kk.yaw; k.roll = kk.roll; }
      }
      if (s.t > 0.9 && !c.onGround) recover(W, c, A, k, D, dt);
      return !((c.onGround && s.t > 0.3) || s.t > 2.2);
    }
    if (s.type === 'aerial') {
      const T = s.tHit - W.time, q = predAt(W, s.tHit, PQ), bk = BR + c.cfg.front - 20;
      if (s.t < 0.2) k.jump = true;
      else if (s.dj && !s.djd && s.t > 0.23) { k.jump = true; s.djd = true; }
      const Tc = Math.max(T, 0.04), px = q[0] - s.dx * bk, py = q[1] - s.dy * bk, pz = q[2] - 20;
      const dx = px - c.p.x - c.v.x * Tc, dy = py - c.p.y - c.v.y * Tc, dz = pz - c.p.z - c.v.z * Tc + 325 * Tc * Tc;
      const L = Math.hypot(dx, dy, dz), need = 2 * L / (Tc * Tc);
      const ex = B.p.x - c.p.x, ey = B.p.y - c.p.y, ez = B.p.z - c.p.z, el = Math.hypot(ex, ey, ez) || 1;
      const fin = T < 0.35, cor = !fin && (need > 420 || (s.t < 0.6 && need > 150));
      let fx, fy, fz;
      if (cor) { fx = dx / L; fy = dy / L; fz = dz / L; } else { fx = ex / el; fy = ey / el; fz = ez / el; }
      const kk = { pitch: 0, yaw: 0, roll: 0 }, th = aimAir(c, kk, fx, fy, fz, 0, 0, 1);
      if (s.t >= 0.04) { k.pitch = kk.pitch; k.yaw = kk.yaw; k.roll = kk.roll; }
      if (s.dj && s.t > 0.2 && s.t < 0.26) { k.pitch = k.yaw = k.roll = 0; }
      k.boost = c.boost > 0 && (cor ? th < 0.4 : fin && th < 0.25 && T > 0.04);
      k.throttle = 1;
      if (D.kick >= 2 && !c.flipped && !c.djumped && T < 0.1 && el < BR + c.cfg.front + 60 && s.t > 0.35) { k.jump = true; k.pitch = -1; k.yaw = 0; k.roll = 0; s.end = true; }
      if (s.end && s.t > 0.3) return W.time - s.tHit < 0.4 && !c.onGround;
      return !(T < -0.35 || s.t > 4.5 || (c.onGround && s.t > 0.5) || (need > 1600 && T > 0.45 && s.t > 0.5) || (c.touch && T < 0.3));
    }
    return false;
  }


  const NET_CW = 39, NET_BW = 9, NET_PW = 17, NET_IQ = 50, NET_STEP = 1 / CFG.hz;
  const netB64e = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 4096) s += String.fromCharCode.apply(null, u8.subarray(i, i + 4096)); return btoa(s); };
  const netB64d = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const netPq = pd => pd && pd.t > 0 ? Math.min(255, Math.ceil(pd.t / 0.05)) : 0;
  function netEnc(W) {
    const cs = W.cars, B = W.ball, dv = new DataView(new ArrayBuffer((NET_BW + NET_PW + cs.length * NET_CW) * 2));
    let o = 0;
    const q = (x, s) => { const v = Math.round(x * s) || 0; dv.setInt16(o, v > 32767 ? 32767 : v < -32767 ? -32767 : v, true); o += 2; };
    const u = x => { dv.setUint16(o, x & 0xffff, true); o += 2; };
    const t = x => q(x < 32 ? x : 32, 1000);
    q(B.p.x, 5); q(B.p.y, 5); q(B.p.z, 5); q(B.v.x, 5); q(B.v.y, 5); q(B.v.z, 5); q(B.w.x, 5000); q(B.w.y, 5000); q(B.w.z, 5000);
    for (let i = 0; i < NET_PW; i++) u(netPq(W.pads[i * 2]) | netPq(W.pads[i * 2 + 1]) << 8);
    for (const c of cs) {
      const k = c.ctl;
      q(c.p.x, 5); q(c.p.y, 5); q(c.p.z, 5); q(c.v.x, 10); q(c.v.y, 10); q(c.v.z, 10); q(c.w.x, 5000); q(c.w.y, 5000); q(c.w.z, 5000);
      q(c.f.x, 32000); q(c.f.y, 32000); q(c.f.z, 32000); q(c.u.x, 32000); q(c.u.y, 32000); q(c.u.z, 32000);
      q(c.boost, 300);
      u((c.onGround ? 1 : 0) | (c.boosting ? 2 : 0) | (c.sup ? 4 : 0) | (c.jumped ? 8 : 0) | (c.jumping ? 16 : 0) | (c.djumped ? 32 : 0) | (c.flipped ? 64 : 0) | (c.flipping ? 128 : 0) | (c.autoF ? 256 : 0) | (c.wc ? 512 : 0) | (c.prevJump ? 1024 : 0) | (c.touch ? 2048 : 0) | (c.afS > 0 ? 4096 : 0) | (k.boost ? 8192 : 0) | (k.jump ? 16384 : 0) | (k.slide ? 32768 : 0));
      u(c.nw | c.nwW << 3 | (c.bot ? 64 : 0));
      t(c.jumpT); t(c.flipT); t(c.airT); t(c.ajT); t(c.afT); t(c.boostT); t(c.supT); t(c.demoT); t(c.bumpCD);
      q(c.fdx, 32000); q(c.fdy, 32000); q(c.wcn.x, 32000); q(c.wcn.y, 32000); q(c.wcn.z, 32000); q(c.slide, 30000);
      let bi = -1;
      for (let j = 0; j < cs.length; j++) if (cs[j].id === c.bumpId) bi = j;
      q(bi, 1);
      q(k.throttle, 30000); q(k.steer, 30000); q(k.pitch, 30000); q(k.yaw, 30000); q(k.roll, 30000);
    }
    return netB64e(new Uint8Array(dv.buffer));
  }
  function netDec(W, str) {
    let u8;
    try { u8 = netB64d(str); } catch (e) { return false; }
    const cs = W.cars, B = W.ball;
    if (u8.length !== (NET_BW + NET_PW + cs.length * NET_CW) * 2) return false;
    const dv = new DataView(u8.buffer);
    let o = 0;
    const r = s => { const v = dv.getInt16(o, true); o += 2; return v / s; }, ru = () => { const v = dv.getUint16(o, true); o += 2; return v; };
    vset(B.p, r(5), r(5), r(5)); vset(B.v, r(5), r(5), r(5)); vset(B.w, r(5000), r(5000), r(5000));
    for (let i = 0; i < NET_PW; i++) { const x = ru(), a = W.pads[i * 2], b = W.pads[i * 2 + 1]; if (a) a.t = (x & 255) * 0.05; if (b) b.t = (x >> 8) * 0.05; }
    for (const c of cs) {
      const k = c.ctl;
      vset(c.p, r(5), r(5), r(5)); vset(c.v, r(10), r(10), r(10)); vset(c.w, r(5000), r(5000), r(5000));
      vset(c.f, r(32000), r(32000), r(32000)); vset(c.u, r(32000), r(32000), r(32000)); ortho(c);
      c.boost = r(300);
      const fl = ru(), nw = ru();
      c.onGround = !!(fl & 1); c.boosting = !!(fl & 2); c.sup = !!(fl & 4); c.jumped = !!(fl & 8); c.jumping = !!(fl & 16); c.djumped = !!(fl & 32); c.flipped = !!(fl & 64); c.flipping = !!(fl & 128); c.autoF = !!(fl & 256); c.wc = !!(fl & 512); c.prevJump = !!(fl & 1024); c.touch = !!(fl & 2048); c.afS = fl & 4096 ? 1 : -1;
      k.boost = !!(fl & 8192); k.jump = !!(fl & 16384); k.slide = !!(fl & 32768);
      c.nw = nw & 7; c.nwW = nw >> 3 & 7; c.bot = !!(nw & 64);
      c.jumpT = r(1000); c.flipT = r(1000); c.airT = r(1000); c.ajT = r(1000); c.afT = r(1000); c.boostT = r(1000); c.supT = r(1000); c.demoT = r(1000); c.bumpCD = r(1000);
      c.fdx = r(32000); c.fdy = r(32000); vset(c.wcn, r(32000), r(32000), r(32000)); c.slide = r(30000);
      const bi = r(1);
      c.bumpId = bi >= 0 && cs[bi] ? cs[bi].id : -1;
      k.throttle = r(30000); k.steer = r(30000); k.pitch = r(30000); k.yaw = r(30000); k.roll = r(30000);
      c.dodgeT = c.flipped ? c.flipT : -1; c.fs = vdot(c.v, c.f); vset(c.vc, 0, 0, 0);
    }
    return true;
  }
  function netInEnc(k) {
    const a = x => Math.round(clamp(+x || 0, -1, 1) * NET_IQ) + NET_IQ;
    return ((((a(k.throttle) * 101 + a(k.steer)) * 101 + a(k.pitch)) * 101 + a(k.yaw)) * 101 + a(k.roll)) * 8 + (k.boost ? 1 : 0) + (k.jump ? 2 : 0) + (k.slide ? 4 : 0);
  }
  const NET_N0 = netInEnc(NOCTL);
  function netInDec(x, k) {
    x = Math.floor(+x);
    if (!(x >= 0 && x < 8.5e10)) x = NET_N0;
    const b = x % 8;
    x = (x - b) / 8;
    const g = () => { const r = x % 101; x = (x - r) / 101; return (r - NET_IQ) / NET_IQ; };
    k.roll = g(); k.yaw = g(); k.pitch = g(); k.steer = g(); k.throttle = g();
    k.boost = !!(b & 1); k.jump = !!(b & 2); k.slide = !!(b & 4);
    return k;
  }
  function netHost(W) {
    const r4 = x => Math.round(x * 1e4) / 1e4;
    const H = {
      W, g: new Map(), every: 2,
      seat(id, car) { H.g.set(id, { car, q: new Map(), next: -1, hi: -1, last: NET_N0, ack: -1, dmin: 1e9, wt: 0, bud: 0, rep: 0, skp: 0, sv: false }); },
      unseat(id) { H.g.delete(id); },
      input(id, m) {
        const g = H.g.get(id);
        if (!g || !m || !Array.isArray(m.i)) return;
        let s = Math.floor(+m.s) || 0;
        for (let j = 0; j + 1 < m.i.length && j < 96; j += 2) {
          const n = clamp(m.i[j] | 0, 0, 240), code = Math.floor(+m.i[j + 1]);
          if (!(code >= 0 && code < 8.5e10)) { s += n; continue; }
          for (let r = 0; r < n; r++, s++) if (s >= g.next && s > g.ack) { g.q.set(s, code); if (s > g.hi) g.hi = s; }
        }
        if (g.q.size > 400) { const ks = [...g.q.keys()].sort((a, b) => a - b); for (let i = 0; i < ks.length - 200; i++) g.q.delete(ks[i]); }
      },
      pre() {
        for (const g of H.g.values()) {
          const c = g.car;
          if (!g.q.has(g.next)) {
            let m = Infinity;
            for (const s of g.q.keys()) { if (s < g.next) g.q.delete(s); else if (s < m) m = s; }
            if (m === Infinity) { if (g.ack >= 0) { g.rep++; g.sv = true; } g.dmin = 0; netInDec(g.last, c.ctl); continue; }
            g.next = m;
          }
          const d = g.hi - g.next + 1;
          if (d < g.dmin) g.dmin = d;
          if (++g.wt >= 120) { g.bud = g.sv || g.dmin < 3 ? 0 : g.dmin >= 10 ? 3 : 1; g.wt = 0; g.dmin = 1e9; g.sv = false; }
          if (d > 90) { const to = g.hi - 6; for (let s = g.next; s < to; s++) g.q.delete(s); g.next = to; if (!g.q.has(g.next)) continue; }
          let code = g.q.get(g.next);
          g.q.delete(g.next); g.next++;
          if (g.bud > 0 && g.q.has(g.next) && g.hi - g.next >= 2) {
            const c2 = g.q.get(g.next);
            if (!((code & 2) && !(c2 & 2))) { code = c2; g.q.delete(g.next); g.next++; g.bud--; g.skp++; }
          }
          g.last = code; g.ack = g.next - 1;
          netInDec(code, c.ctl);
        }
      },
      snap() {
        const a = W.cars.map(() => -1);
        for (const g of H.g.values()) { const i = W.cars.indexOf(g.car); if (i >= 0) a[i] = g.ack; }
        return { t: 's', k: W.tick, tm: r4(W.time), st: W.state, sT: r4(W.stateT), cl: r4(W.clock), ot: W.ot ? 1 : 0, oT: r4(W.otT), sc: W.score.slice(), tu: W.timeUp ? 1 : 0, fl: W.flip ? 1 : 0, bh: W.ball.hidden ? 1 : 0, a, d: netEnc(W) };
      }
    };
    return H;
  }
  function netGuest(W, me) {
    W.pr = true;
    const cs = W.cars, B = W.ball, n = cs.length, mi = cs.indexOf(me);
    const E = cs.map(() => ({ p: v3(), f: v3(), u: v3(), op: v3(), of: v3(), ou: v3(), bp: v3(), bf: v3(), bu: v3(), bl: v3(), dead: false }));
    const EB = { p: v3(), op: v3(), bp: v3(), hid: false };
    const zero = e => { vset(e.op, 0, 0, 0); if (e.of) { vset(e.of, 0, 0, 0); vset(e.ou, 0, 0, 0); } };
    const G = {
      W, me, seq: 0, ack: -1, acc: 0, pend: null, hist: new Float64Array(256).fill(NET_N0), rtt: 0.1, swapped: false, lastN: 0, corr: 0, nsnap: 0, k: -1,
      rate: [12, 9, 11], cost: 0, hold: 0
    };
    const rebase = m => {
      for (let i = 0; i < n; i++) { const c = cs[i], e = E[i]; vcopy(e.p, c.p); vcopy(e.f, c.f); vcopy(e.u, c.u); e.dead = c.demoT > 0; }
      vcopy(EB.p, B.p); EB.hid = B.hidden;
      if (!netDec(W, m.d)) return false;
      W.state = String(m.st || 'play'); W.stateT = +m.sT || 0; W.clock = +m.cl || 0; W.ot = !!m.ot; W.otT = +m.oT || 0; W.timeUp = !!m.tu; W.flip = !!m.fl; W.time = +m.tm || 0; W.tick = m.k | 0;
      if (Array.isArray(m.sc)) W.score = [m.sc[0] | 0, m.sc[1] | 0];
      B.hidden = !!m.bh;
      const a = Array.isArray(m.a) ? Math.floor(+m.a[mi]) : -1;
      if (a >= 0 && a <= G.seq) G.ack = a;
      let from = a >= 0 && a <= G.seq ? a + 1 : G.seq - clamp(Math.round(G.rtt * CFG.hz) + 4, 4, 72) + 1;
      if (from < 1) from = 1;
      if (G.seq - from + 1 > 90) from = G.seq - 89;
      const e0 = W.events.length;
      for (let s = from; s <= G.seq; s++) { netInDec(G.hist[s & 255], me.ctl); worldStep(W, NET_STEP); }
      W.events.length = e0;
      G.lastN = Math.max(0, G.seq - from + 1); G.nsnap++; G.k = W.tick;
      for (let i = 0; i < n; i++) {
        const c = cs[i], e = E[i];
        if (e.dead || c.demoT > 0) { zero(e); continue; }
        const dx = e.p.x - c.p.x, dy = e.p.y - c.p.y, dz = e.p.z - c.p.z, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (i === mi && d > G.corr) G.corr = d;
        if (d > 420 || vdot(e.f, c.f) < 0.3 || vdot(e.u, c.u) < 0.3) { zero(e); continue; }
        e.op.x += dx; e.op.y += dy; e.op.z += dz;
        e.of.x += e.f.x - c.f.x; e.of.y += e.f.y - c.f.y; e.of.z += e.f.z - c.f.z;
        e.ou.x += e.u.x - c.u.x; e.ou.y += e.u.y - c.u.y; e.ou.z += e.u.z - c.u.z;
      }
      if (EB.hid || B.hidden) zero(EB);
      else {
        const dx = EB.p.x - B.p.x, dy = EB.p.y - B.p.y, dz = EB.p.z - B.p.z;
        if (dx * dx + dy * dy + dz * dz > 700 * 700) zero(EB); else { EB.op.x += dx; EB.op.y += dy; EB.op.z += dz; }
      }
      return true;
    };
    G.snap = m => { if (m && typeof m.d === 'string' && (!G.pend || (m.k | 0) >= (G.pend.k | 0))) G.pend = m; };
    G.restore = () => {
      if (!G.swapped) return;
      for (let i = 0; i < n; i++) { const c = cs[i], e = E[i]; vcopy(c.p, e.bp); vcopy(c.f, e.bf); vcopy(c.u, e.bu); vcopy(c.l, e.bl); }
      vcopy(B.p, EB.bp);
      G.swapped = false;
    };
    G.frame = (dt, sample, keep) => {
      G.restore();
      if (G.pend && (G.cost < 3 || G.hold >= 1)) {
        const m = G.pend, t0 = typeof performance !== 'undefined' ? performance.now() : 0;
        G.pend = null; rebase(m); G.hold = 0;
        if (t0) G.cost = G.cost * 0.8 + (performance.now() - t0) * 0.2;
      } else if (G.pend) G.hold++;
      G.acc += dt;
      let k = 0;
      while (G.acc >= NET_STEP && k < 8) {
        G.acc -= NET_STEP; k++; G.seq++;
        const code = sample();
        G.hist[G.seq & 255] = code; netInDec(code, me.ctl);
        const e0 = W.events.length;
        worldStep(W, NET_STEP);
        let j = e0;
        for (let i = e0; i < W.events.length; i++) if (keep(W.events[i])) W.events[j++] = W.events[i];
        W.events.length = j;
      }
      if (k >= 8) G.acc = 0;
      const r = G.rate, kc = Math.exp(-dt * r[0]), ko = Math.exp(-dt * r[1]), kb = Math.exp(-dt * r[2]);
      for (let i = 0; i < n; i++) { const e = E[i], kk = i === mi ? kc : ko; vscale(e.op, kk); vscale(e.of, kk); vscale(e.ou, kk); }
      vscale(EB.op, kb);
      for (let i = 0; i < n; i++) {
        const c = cs[i], e = E[i];
        vcopy(e.bp, c.p); vcopy(e.bf, c.f); vcopy(e.bu, c.u); vcopy(e.bl, c.l);
        if (c.demoT > 0) continue;
        vadd(c.p, e.op, 1); vadd(c.f, e.of, 1); vadd(c.u, e.ou, 1); ortho(c);
      }
      vcopy(EB.bp, B.p); vadd(B.p, EB.op, 1);
      G.swapped = true;
      return k;
    };
    G.inputs = mid => {
      const a = Math.max(G.ack + 1, G.seq - 23, 1);
      if (a > G.seq) return null;
      const runs = [];
      let cur = G.hist[a & 255], cnt = 0;
      for (let s = a; s <= G.seq; s++) { const x = G.hist[s & 255]; if (x === cur) cnt++; else { runs.push(cnt, cur); cur = x; cnt = 1; } }
      runs.push(cnt, cur);
      return { t: 'i', m: mid, s: a, i: runs };
    };
    return G;
  }
  function netBot(c, on) {
    c.bot = !!on;
    c.ai = on ? c.ai || newAi() : null;
    if (on) c.ctl.jump = false;
  }

