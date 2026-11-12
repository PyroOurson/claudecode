
  let HXS = null;
  function hxShadow() {
    if (HXS) return HXS;
    const c = makeCar(0, '', false, 'octane'), p = makeCar(0, '', false, 'octane');
    const W = { size: 1, diff: 'pro', cars: [c], ball: makeBall(), pads: [], events: [], score: [0, 0], state: 'play', stateT: 9, time: 0, tick: 0, pr: true, flip: false, mode: 'match', kickoff: false, train: null };
    return (HXS = { W, c, p, S: hxShape(), S0: hxShape(), r: Object.assign({}, HXR) });
  }
  function hxCopyCar(d, s) {
    vcopy(d.p, s.p); vcopy(d.v, s.v); vcopy(d.w, s.w); vcopy(d.f, s.f); vcopy(d.l, s.l); vcopy(d.u, s.u); vcopy(d.n, s.n); vcopy(d.vc, s.vc); vcopy(d.wcn, s.wcn);
    for (let i = 0; i < 4; i++) d.wh[i].pf = s.wh[i].pf;
    d.body = s.body; d.cfg = s.cfg; d.team = s.team;
    d.boost = s.boost; d.boosting = s.boosting; d.boostT = s.boostT; d.boostK = s.boostK; d.onGround = s.onGround; d.nw = s.nw; d.nwW = s.nwW;
    d.jumped = s.jumped; d.jumping = s.jumping; d.jumpT = s.jumpT; d.djumped = s.djumped; d.flipped = s.flipped; d.flipping = s.flipping; d.flipT = s.flipT; d.fdx = s.fdx; d.fdy = s.fdy;
    d.airT = s.airT; d.ajT = s.ajT; d.autoF = s.autoF; d.afT = s.afT; d.afS = s.afS; d.wc = s.wc; d.steerA = s.steerA;
    d.dodgeT = s.dodgeT; d.xiT = s.xiT; d.sup = s.sup; d.supT = s.supT; d.slide = s.slide; d.prevJump = s.prevJump; d.demoT = 0; d.touch = s.touch; d.touchT = s.touchT; d.fs = s.fs;
    d.bumpId = -1; d.bumpCD = 0; d.resetT = s.resetT; d.airHitT = s.airHitT; d.shotT = s.shotT; d.landT = s.landT;
    const a = d.pk, b = s.pk; a.thr = b.thr; a.eng = b.eng; a.brk = b.brk; a.steerA = b.steerA; a.hb = b.hb;
    const k = d.ctl, q = s.ctl; k.throttle = q.throttle; k.steer = q.steer; k.pitch = q.pitch; k.yaw = q.yaw; k.roll = q.roll; k.boost = q.boost; k.jump = q.jump; k.slide = q.slide;
  }
  const HXO = { hit: false, tick: 0, n: 0, bp: v3(), bv: v3(), bw: v3(), cp: v3(), cv: v3(), score: 0, goal: 0, goalT: 9, sp: 0, dmin: 0, kc: -1 };
  function hxRoll(W, H, src, S, s, ticks, tick0) {
    const Q = hxShadow(), sw = Q.W, sc = Q.c, r = Q.r, dt = H.dt, B = sw.ball, near = BR + src.cfg.front + 8;
    hxCopyCar(sc, src); hxShapeCopy(Q.S, S);
    hxGetBall(H.P, hxAt(H, tick0), B);
    B.hidden = false; sw.time = W.time + (tick0 - W.tick - 1) * dt; sw.tick = tick0 - 1; sw.state = 'play'; sw.flip = W.flip; sw.events.length = 0;
    HXO.hit = false; HXO.n = 0; HXO.dmin = 1e9; HXO.kc = -1;
    let end = ticks;
    for (let i = 0; i < end; i++) {
      r.throttle = r.steer = r.pitch = r.roll = 0; r.boost = r.jump = r.slide = false;
      hxSeq(sw.tick + 1, sc, s, r);
      hxOut(Q.S, r, sc.ctl);
      worldStep(sw, dt);
      if (!HXO.hit) {
        for (let e = 0; e < sw.events.length; e++) if (sw.events[e].type === 'touch') { HXO.hit = true; HXO.tick = sw.tick; end = Math.min(end, i + 4); }
        const ex = B.p.x - sc.p.x, ey = B.p.y - sc.p.y, ez = B.p.z - sc.p.z, d = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (d < HXO.dmin) HXO.dmin = d;
        if (HXO.kc < 0 && ex * ex + ey * ey < near * near) HXO.kc = sw.tick;
      }
      sw.events.length = 0;
      HXO.n++;
    }
    vcopy(HXO.bp, B.p); vcopy(HXO.bv, B.v); vcopy(HXO.bw, B.w); vcopy(HXO.cp, sc.p); vcopy(HXO.cv, sc.v);
    H.busy++;
    return HXO;
  }
  function hxSeq(tick, c, s, r) {
    if (s.type === 'strike') {
      const pre = tick < s.tj, dg = s.td >= 0 && tick >= s.td - 4;
      r.throttle = s.thr; r.boost = s.bo;
      if (pre) { const tx = s.qx + s.mx * s.lat - c.p.x, ty = s.qy + s.my * s.lat - c.p.y; r.steer = clamp(-Math.atan2(tx * c.l.x + ty * c.l.y, tx * c.f.x + ty * c.f.y) * 3.4 + vdot(c.w, c.u) * 0.3, -1, 1); }
      else r.steer = dg ? s.dx : s.ax;
      r.pitch = pre ? 0 : dg ? s.dp : s.ap;
      if (s.t2 >= 0 && tick >= s.t2 - 3 && tick <= s.t2) { r.steer = 0; r.pitch = 0; }
      r.jump = (tick >= s.tj && tick < s.tj + s.hold) || (s.td >= 0 && tick >= s.td && tick < s.td + 4) || (s.t2 >= 0 && tick >= s.t2 && tick < s.t2 + 4);
      return tick < s.end;
    }
    if (s.type === 'rev') { r.throttle = s.th; r.steer = s.s; return tick < s.t0 + 80; }
    if (s.type === 'half') {
      const q = tick - s.t0;
      r.throttle = q < 76 ? -1 : 1;
      r.jump = (q >= 26 && q < 32) || (q >= 36 && q < 40);
      r.pitch = q < 28 ? 0 : q < 76 ? 1 : -1;
      if (q >= 76 && c.u.z < 0.9) r.roll = Math.atan2(c.l.z, c.u.z) > 0 ? -1 : 1;
      return !(c.onGround && q > 90) && q < 250;
    }
    return false;
  }

  const HXCURV = [[0, 0.0069], [500, 0.00398], [1000, 0.00235], [1500, 0.001375], [1750, 0.0011], [2300, 0.00088]];
  const HXRT = new Float32Array(200), HXRL = new Float32Array(200), HXRO = new Float32Array(200);
  function hxReach(T, s0, b) {
    let s = clamp(s0, 0, CFG.carMax), d = 0;
    const h = 1 / 60;
    T[0] = 0;
    for (let i = 1; i < 200; i++) {
      for (let q = 0; q < 2; q++) {
        let a = 1600 * curve(CFG.drive, s);
        if (b > 0 && s < CFG.carMax - 2) { a += CFG.boostGround; b -= CFG.boostUse * h; }
        s = Math.min(CFG.carMax, s + a * h); d += s * h;
      }
      T[i] = d;
    }
  }
  function hxTime(T, d) {
    if (d <= 0) return 0;
    if (d >= T[199]) return 199 / 30 + (d - T[199]) / CFG.carMax;
    let lo = 0, hi = 199;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] < d) lo = m; else hi = m; }
    return (lo + (d - T[lo]) / (T[hi] - T[lo] || 1)) / 30;
  }
  const hxArcV = r => r >= 1136 ? 2300 : r >= 909 ? 1750 + 550 * (r - 909) / 227 : r >= 727 ? 1500 + 250 * (r - 727) / 182 : r >= 425 ? 1000 + 500 * (r - 425) / 302 : r >= 251 ? 500 + 500 * (r - 251) / 174 : 400;
  const HXP = { len: 0, arc: 0, str: 0, rr: 0 };
  function hxPath(px, py, hx, hy, tx, ty, r) {
    const dx = tx - px, dy = ty - py, lx = dx * hx + dy * hy, ly = Math.abs(dy * hx - dx * hy), ey = ly - r, dc = Math.hypot(lx, ey);
    HXP.rr = 0;
    if (dc <= r) {
      const d2 = lx * lx + ly * ly;
      HXP.rr = d2 / (2 * ly + 1e-6); HXP.arc = 2 * Math.atan2(ly, lx); HXP.str = 0; HXP.len = HXP.arc * HXP.rr;
      return HXP;
    }
    let a = Math.atan2(ey, lx) - Math.acos(r / dc) + Math.PI / 2;
    if (a < -1e-6) a += TAU;
    HXP.arc = Math.max(0, a); HXP.str = Math.sqrt(dc * dc - r * r); HXP.len = HXP.arc * r + HXP.str;
    return HXP;
  }
  function hxEta(T, TL, px, py, hx, hy, s0, tx, ty) {
    let v = clamp(s0, 400, CFG.carMax), r = 1 / curve(HXCURV, v), P = hxPath(px, py, hx, hy, tx, ty, r), pen = 0, tb = T;
    if (!P.rr && P.arc > 0.8 && v > 1000) { pen = (v - 1000) / 3500 * 0.5; v = 1000; r = 1 / curve(HXCURV, v); P = hxPath(px, py, hx, hy, tx, ty, r); tb = TL; }
    if (P.rr) { const vn = hxArcV(P.rr * 0.95); return P.len / Math.max(vn, 300) + Math.max(0, s0 - vn) / 3500 + pen; }
    return P.arc * r / v + hxTime(tb, P.str) + pen + (s0 < -100 ? -s0 / 2500 : 0);
  }
  const hxUp = cz => cz <= 89 ? (-300 + Math.sqrt(90000 + 1200 * Math.max(0, cz - 17))) / 600 : cz >= 232 ? 0.87 : 0.2 + (434 - Math.sqrt(188356 - 1300 * (cz - 89))) / 650;
  const hxUp2 = cz => cz <= 117 ? hxUp(cz) : cz >= 482 ? 1.3 : 0.25 + (693 - Math.sqrt(480249 - 1300 * (cz - 117))) / 650;
  const hxKind = bz => bz < 130 ? 0 : bz < 290 ? 1 : 2;
  const hxUpT = bz => bz < 130 ? 0.2 : bz < 290 ? hxUp(bz - 45) : hxUp2(bz - 20);

  function hxDrive(c, r, tx, ty, want, bo, free, tz) {
    const dx = tx - c.p.x, dy = ty - c.p.y, dz = tz === undefined ? 0 : tz - c.p.z, lf = dx * c.f.x + dy * c.f.y + dz * c.f.z, ll = dx * c.l.x + dy * c.l.y + dz * c.l.z;
    const ang = Math.atan2(ll, lf), dist = Math.hypot(lf, ll), fs = vdot(c.v, c.f), wz = vdot(c.w, c.u), aa = Math.abs(ang);
    if (aa > 2.2 && dist < 600 && fs < 400) {
      r.throttle = -1; r.steer = clamp(-Math.atan2(-ll, -lf) * 3 - wz * 0.3, -1, 1);
      return ang;
    }
    r.steer = clamp(-ang * 3.4 + wz * 0.3, -1, 1);
    if (!free && aa > 0.25 && dist < 1500) want = Math.min(want, Math.max(350, hxArcV(dist / (2 * Math.sin(Math.min(aa, 1.57))))));
    r.slide = aa > 1.5 && fs > 500 && c.u.z > 0.7;
    if (fs < want - 40) r.throttle = 1; else if (fs > want + 350) r.throttle = -1; else if (fs > want + 60) r.throttle = 0; else r.throttle = 0.05;
    r.boost = bo && c.boost > 0 && aa < 0.3 && fs < want - 120 && fs < 2295 && c.nwW >= 3;
    return ang;
  }
  const HXQ = { pitch: 0, yaw: 0, roll: 0 }, HXV = v3();
  function hxAir(c, r, fx, fy, fz, ux, uy, uz) {
    aimAir(c, HXQ, fx, fy, fz, ux, uy, uz);
    r.pitch = HXQ.pitch; r.steer = HXQ.yaw; r.roll = HXQ.roll;
  }
  function hxRecover(W, c, X, r) {
    const v = c.v, pl = X.plan;
    r.throttle = 1;
    if (c.wc || (c.nw > 0 && c.nw < 3)) {
      X.rest++;
      if (X.rest > 18 && vlen(v) < 500) { if (c.u.z < -0.2 || X.rest > 190) r.jump = X.rest % 12 < 5; return; }
    } else X.rest = 0;
    const t = 0.35, qx = c.p.x + v.x * t, qy = c.p.y + v.y * t, qz = c.p.z + v.z * t - 40;
    let nx = 0, ny = 0, nz = 1;
    if (sdf(qx, qy, qz) < 400 && !(c.p.z < 500 && v.z < 0 && Math.abs(c.p.x) < 3500 && Math.abs(c.p.y) < 4600)) { sdfN(qx, qy, qz, HXV); nx = HXV.x; ny = HXV.y; nz = HXV.z; }
    const vn = v.x * nx + v.y * ny + v.z * nz;
    let fx = v.x - nx * vn, fy = v.y - ny * vn, fz = v.z - nz * vn;
    if (Math.hypot(fx, fy, fz) < 200) { const d = c.f.x * nx + c.f.y * ny + c.f.z * nz; fx = c.f.x - nx * d; fy = c.f.y - ny * d; fz = c.f.z - nz * d; }
    if (pl && pl.tx !== undefined && c.p.z < 300) {
      const tx = pl.tx - c.p.x, ty = pl.ty - c.p.y, tn = tx * nx + ty * ny, gx = tx - nx * tn, gy = ty - ny * tn, gz = -nz * tn, gl = Math.hypot(gx, gy, gz), fl = Math.hypot(fx, fy, fz) || 1;
      if (gl > 1) { fx = fx / fl + gx / gl * 0.6; fy = fy / fl + gy / gl * 0.6; fz = fz / fl + gz / gl * 0.6; }
    }
    const fl = Math.hypot(fx, fy, fz) || 1;
    hxAir(c, r, fx / fl, fy / fl, fz / fl, nx, ny, nz);
  }

  const HXB2 = makeBall();
  function hxScore(team, mode) {
    const b = HXB2, sg = team ? -1 : 1, gy = sg * (CFG.Y + 100);
    vcopy(b.p, HXO.bp); vcopy(b.v, HXO.bv); vcopy(b.w, HXO.bw);
    HXO.goal = 0; HXO.goalT = 9; HXO.sp = vlen(b.v);
    let dmin = 1e9, own = 1e9;
    for (let i = 0; i < 150; i++) {
      const y = b.p.y * sg;
      if (y > HXGL) { HXO.goal = 1; HXO.goalT = i / 60; return 20000 - 2500 * HXO.goalT; }
      if (y < -HXGL) { HXO.goal = -1; HXO.goalT = i / 60; return -100000 + 1000 * HXO.goalT; }
      const d = Math.hypot(b.p.x, b.p.y - gy, b.p.z - 300), d2 = Math.hypot(b.p.x, b.p.y + gy);
      if (d < dmin) dmin = d;
      if (d2 < own) own = d2;
      ballStep(b, 1 / 60);
    }
    if (mode === 'clear') return 3000 + b.p.y * sg + Math.abs(b.p.x) * 0.25 + Math.min(own, 5000) * 0.6;
    return 9000 - dmin + Math.min(own, 4000) * 0.2 + b.p.y * sg * 0.15;
  }
  function hxAim(mode, sg, bx, by, bvx, bvy, px, py, lim, out, ftx) {
    let ax = bx - px, ay = by - py;
    const al = Math.hypot(ax, ay) || 1;
    ax /= al; ay /= al;
    let dx, dy;
    if (mode === 'clear') {
      const ox = bx, oy = by + sg * (CFG.Y + 600), ol = Math.hypot(ox, oy) || 1;
      dx = ox / ol + ax * 0.6; dy = oy / ol + ay * 0.6 + sg * 0.5;
      if (ay * sg < -0.2) { dx = Math.sign(bx || ax || 1) * 0.9; dy = sg * 0.45; }
      out.tx = bx + dx * 3000; out.ty = by + dy * 3000;
    } else if (mode === 'kick') { dx = ax; dy = ay; out.tx = bx + dx * 3000; out.ty = by + dy * 3000; }
    else {
      const gy = sg * (CFG.Y + 80), m = GW - 300, tx = ftx !== undefined ? ftx : ay * sg > 0.08 ? clamp(bx + ax * (gy - by) / ay, -m, m) : clamp(bx * 0.4, -m, m);
      dx = tx - bx; dy = gy - by;
      out.tx = tx; out.ty = gy;
    }
    const dl = Math.hypot(dx, dy) || 1;
    dx /= dl; dy /= dl;
    const d0 = Math.atan2(ax * dy - ay * dx, ax * dx + ay * dy), dev = clamp(d0, -lim, lim), cs = Math.cos(dev), sn = Math.sin(dev);
    out.dev0 = d0; out.gx = out.tx;
    if (dev !== d0) { dx = ax * cs - ay * sn; dy = ax * sn + ay * cs; out.tx = bx + dx * 3000; out.ty = by + dy * 3000; }
    out.dx = dx; out.dy = dy;
    const nx = dx * 2800 - bvx, ny = dy * 2800 - bvy, nl = Math.hypot(nx, ny) || 1;
    out.nx = nx / nl; out.ny = ny / nl;
    return out;
  }
  const HXH = { ok: false, i: 0, t: 0, up: 0, bx: 0, by: 0, bz: 0, dx: 0, dy: 1, nx: 0, ny: 1, tx: 0, ty: 0, dev0: 0, eta: 0, gx: 0 };
  function hxFindHit(W, H, c, mode, out, ftx) {
    const P = H.P, sg = c.team ? -1 : 1, fs = vdot(c.v, c.f), j0 = W.tick - H.t0, dC = BR + c.cfg.front - 6, dt = H.dt, lim = mode === 'kick' ? 0 : 0.75, px = c.p.x + c.v.x * 0.25, py = c.p.y + c.v.y * 0.25;
    let hx = c.f.x, hy = c.f.y;
    const hl = Math.hypot(hx, hy) || 1;
    hx /= hl; hy /= hl;
    out.ok = false;
    if (!H.ok) return out;
    for (let i = 8; j0 + i < HXN; i += i < 150 ? 2 : 4) {
      const o = (j0 + i) * 9, bx = P[o], by = P[o + 1], bz = P[o + 2], t = i * dt;
      if (Math.abs(by) > HXGL) break;
      if (bz > 500) continue;
      const up = hxUpT(bz);
      if (t < up + 0.04) continue;
      hxAim(mode, sg, bx, by, P[o + 3], P[o + 4], px, py, lim, out, ftx);
      const qx = bx - out.nx * dC, qy = by - out.ny * dC;
      if (Math.abs(qx) > CFG.X - 70 || Math.abs(qy) > CFG.Y - 70) continue;
      const eta = hxEta(HXRT, HXRL, c.p.x, c.p.y, hx, hy, fs, qx, qy) + Math.min(Math.abs(out.dev0), lim) * 0.22;
      if (eta > t - 0.02 - t * 0.03) continue;
      out.ok = true; out.i = i; out.t = t; out.up = up; out.bx = bx; out.by = by; out.bz = bz; out.eta = eta;
      return out;
    }
    return out;
  }

  const hxNew = id => ({ S: hxShape(), think: id % 6, plan: null, seq: null, rest: 0, stuck: 0, hfT: -999, ban: 0, first: false, tMe: 9, tOpp: 9 });
  const HXIDLE = { type: 'idle' };
  const hxScript = () => ({ type: 'strike', tj: 0, hold: 4, td: -1, dp: -1, dx: 0, t2: -1, qx: 0, qy: 0, mx: 0, my: 0, lat: 0, thr: 1, bo: false, ax: 0, ap: 0, end: 0, score: -1e9, gen: -1, mode: 'shot', kc: 0, rc: 0 });
  const HXC = hxScript();
  function hxTry(W, H, src, S, s, tick0) {
    const o = hxRoll(W, H, src, S, s, clamp(Math.max(s.kc, s.td, s.t2) - tick0 + 16, 8, 170), tick0);
    s.score = o.hit ? hxScore(src.team, s.mode) : -1e6 - o.dmin * 100;
    return s.score;
  }
  function hxBase(W, H, src, S, s, mode, tick0, span, qx, qy) {
    const ax = qx - src.p.x, ay = qy - src.p.y, al = Math.hypot(ax, ay) || 1;
    s.qx = qx + ax / al * 200; s.qy = qy + ay / al * 200; s.mx = ay / al; s.my = -ax / al; s.lat = 0;
    s.mode = mode; s.thr = 1; s.bo = src.boost > 3; s.ax = 0; s.ap = 0; s.dp = -1; s.dx = 0; s.gen = H.gen; s.rc = 0;
    s.tj = 1e9; s.hold = 4; s.td = -1; s.t2 = -1; s.end = 1e9; s.kc = 0;
    const o = hxRoll(W, H, src, S, s, span, tick0);
    if (o.kc < 0) return -99;
    const kc = o.kc - tick0, bz = H.P[hxAt(H, o.kc) + 2], kind = hxKind(bz), up = Math.round(hxUpT(bz) * 120);
    s.kc = o.kc;
    if (kind === 0) { s.td = o.kc - 1; s.hold = clamp(kc - 6, 4, 20); s.tj = Math.max(tick0, s.td - s.hold - 4); }
    else if (kind === 1) { s.tj = Math.max(tick0, o.kc - up); s.td = Math.max(o.kc - 3, s.tj + 8); s.hold = clamp(s.td - s.tj - 4, 4, 24); }
    else { s.tj = Math.max(tick0, o.kc - up); s.hold = 24; s.t2 = s.tj + 28; }
    if (s.td >= 0 && s.td < s.tj + s.hold + 4) s.td = s.tj + s.hold + 4;
    s.end = Math.max(s.td, s.t2, s.kc) + 14;
    return kc - up;
  }
  function hxCommit(W, H, c, X, pl) {
    if (H.busy > 6) return false;
    const s = HXC, dC = BR + c.cfg.front - 6, o = hxAt(H, pl.T), lead = hxBase(W, H, c, X.S, s, pl.mode, W.tick, pl.up + 62, H.P[o] - pl.nx * dC + pl.ny * pl.lat, H.P[o + 1] - pl.ny * dC - pl.nx * pl.lat);
    if (lead < -90 || lead > 44) return false;
    hxTry(W, H, c, X.S, s, W.tick);
    X.seq = Object.assign(hxScript(), s);
    return true;
  }
  function hxProbe(W, H, c, pl) {
    const Q = hxShadow(), p = Q.p, s = HXC, dC = BR + c.cfg.front - 6, o = hxAt(H, pl.T), P = H.P;
    const qx = P[o] - pl.nx * dC + pl.ny * pl.lat, qy = P[o + 1] - pl.ny * dC - pl.nx * pl.lat;
    let ax = qx - c.p.x, ay = qy - c.p.y;
    const al = Math.hypot(ax, ay), n0 = Math.min(pl.up + 30, pl.T - W.tick - 1), fs = vdot(c.v, c.f);
    if (al < 200 || n0 < pl.up + 12) return false;
    ax /= al; ay /= al;
    const tl = (pl.T - W.tick) * H.dt, v = clamp(Math.max(fs, al / tl), 600, 2300), back = v * n0 * H.dt;
    placeCar(p, qx - ax * back, qy - ay * back, Math.atan2(ay, ax));
    p.body = c.body; p.cfg = c.cfg; p.team = c.team; p.boost = c.boost; p.prevJump = false; p.v.x = ax * v; p.v.y = ay * v; p.fs = v;
    const t0 = pl.T - n0;
    if (hxBase(W, H, p, Q.S0, s, pl.mode, t0, n0 + 30, qx, qy) < -90) return false;
    s.bo = c.boost > 12;
    const o2 = hxRoll(W, H, p, Q.S0, s, clamp(Math.max(s.kc, s.td, s.t2) - t0 + 16, 8, 170), t0);
    if (!o2.hit) return false;
    let e = Math.atan2(o2.bv.x, o2.bv.y) - Math.atan2(pl.tx - o2.bp.x, pl.ty - o2.bp.y);
    if (e > Math.PI) e -= TAU; else if (e < -Math.PI) e += TAU;
    pl.q = hxScore(c.team, pl.mode);
    const l0 = pl.lat, sl = pl.probes === 0 || Math.abs(pl.lat - pl.l0) < 2 ? -0.0059 : clamp((e - pl.e0) / (pl.lat - pl.l0), -0.012, -0.003);
    pl.probes++;
    if (Math.abs(e) < 0.012) { pl.probes = 9; return true; }
    pl.lat = clamp(pl.lat - e / sl, -110, 110); pl.l0 = l0; pl.e0 = e;
    return true;
  }
  function hxRefine(W, H, c, X, s) {
    const k = W.tick, t = HXC;
    if (s.gen !== H.gen) { s.gen = H.gen; hxTry(W, H, c, X.S, s, k); }
    for (let n = k < s.tj - 20 ? 2 : 0; n < 3 && H.busy < 10; n++) {
      const m = s.rc++ % 10, sg = m & 1 ? 1 : -1;
      Object.assign(t, s);
      if (m < 2) { if (k >= s.tj - 2) continue; t.lat = s.lat + sg * (10 + Math.min(40, s.tj - k)); }
      else if (m < 4) { if (k >= s.tj - 1) continue; t.tj = s.tj + sg; if (t.tj <= k) continue; if (t.t2 >= 0) t.t2 = t.tj + t.hold + 4; }
      else if (m < 6) { t.hold = s.hold + sg * 4; if (t.hold < 4 || t.hold > 24 || k >= s.tj + Math.min(s.hold, t.hold) - 1) continue; if (t.t2 >= 0) t.t2 = t.tj + t.hold + 4; }
      else if (m < 8) { if (s.td < 0 || k >= s.td - 5) continue; t.td = s.td + sg; }
      else { if (s.td < 0 || k >= s.td - 5) continue; const th = clamp(Math.atan2(s.dx, -s.dp) + sg * 0.25, -1.4, 1.4); t.dp = -Math.cos(th); t.dx = Math.sin(th); }
      if (t.td >= 0 && t.td < t.tj + t.hold + 4) continue;
      t.end = Math.max(t.td, t.t2, t.kc) + 14;
      if (hxTry(W, H, c, X.S, t, k) > s.score) { const rc = s.rc; Object.assign(s, t); s.rc = rc; }
    }
  }
  function hxSeqRun(W, H, c, X, r) {
    const s = X.seq;
    if (s.type === 'strike') {
      if (W.tick < s.tj && s.gen !== H.gen) return false;
      hxRefine(W, H, c, X, s);
      if (W.tick === s.tj - 1 && s.score < -5e4) { X.ban = W.tick + 70; return false; }
      if (!hxSeq(W.tick, c, s, r)) return false;
      return !(W.tick > s.tj + 30 && c.onGround);
    }
    return hxSeq(W.tick, c, s, r);
  }
  function hxStrikeAct(W, H, c, X, r) {
    const pl = X.plan, i = pl.T - W.tick, dC = BR + c.cfg.front - 6, P = H.P;
    if (H.gen !== pl.gen || !H.ok) { X.plan = null; X.think = 0; return false; }
    const o = hxAt(H, pl.T), qx = P[o] - pl.nx * dC + pl.ny * pl.lat, qy = P[o + 1] - pl.ny * dC - pl.nx * pl.lat;
    const ex = qx - c.p.x, ey = qy - c.p.y, d = Math.hypot(ex, ey) || 1, tl = i * H.dt;
    const al = ex * pl.nx + ey * pl.ny, off = al - clamp(0.8 / curve(HXCURV, Math.max(0, vdot(c.v, c.f))), 250, 1100);
    hxDrive(c, r, qx - pl.nx * off, qy - pl.ny * off, pl.slack < 0.12 || tl < 0.03 ? 2500 : clamp(d / tl, 300, 2300) + 30, true, true);
    const n = hxAt(H, W.tick), bx = P[n] - c.p.x, by = P[n + 1] - c.p.y, bd = Math.hypot(bx, by) || 1, cl = ((c.v.x - P[n + 3]) * bx + (c.v.y - P[n + 4]) * by) / bd;
    if (cl > 100 && (bd - dC) / cl * 120 <= pl.up + 50 && c.onGround && c.u.z > 0.9 && c.nwW >= 3 && (ex * c.f.x + ey * c.f.y) / d > 0.8) hxCommit(W, H, c, X, pl);
    return true;
  }
  function hxEtas(W, H) {
    if (W.tick - H.etaT < 6 && W.tick >= H.etaT) return;
    H.etaT = W.tick;
    const P = H.P, j0 = W.tick - H.t0, dt = H.dt;
    for (let i = 0; i < H.n; i++) {
      const ob = H.obs[i];
      ob.eta = 9;
      if (ob.demo || !H.ok) continue;
      let hx = ob.f.x, hy = ob.f.y;
      const hl = Math.hypot(hx, hy) || 1;
      hx /= hl; hy /= hl;
      const fs = ob.v.x * hx + ob.v.y * hy, land = ob.air ? (ob.v.z + Math.sqrt(Math.max(0, ob.v.z * ob.v.z + 2 * CFG.g * (ob.p.z - CFG.carRest)))) / CFG.g : 0;
      hxReach(HXRO, fs, ob.boost);
      for (let k = 6; j0 + k < HXN; k += 6) {
        const o = (j0 + k) * 9, bx = P[o], by = P[o + 1], bz = P[o + 2], t = k * dt;
        if (Math.abs(by) > HXGL) break;
        if (ob.air) {
          const ex = bx - ob.p.x - ob.v.x * t, ey = by - ob.p.y - ob.v.y * t, ez = bz - Math.max(CFG.carRest, ob.p.z + ob.v.z * t - 0.5 * CFG.g * t * t);
          if (ex * ex + ey * ey + ez * ez < 260 * 260) { ob.eta = t; break; }
          if (t < land) continue;
        }
        const up = bz < 500 ? hxUpT(bz) * 0.7 : ob.boost > 12 ? 0.35 + (bz - 150) / 750 : 9;
        if (t < up + land) continue;
        if (hxEta(HXRO, HXRO, ob.p.x, ob.p.y, hx, hy, fs, bx, by) - 150 / Math.max(fs, 1200) + land <= t) { ob.eta = t; break; }
      }
    }
  }
  function hxPad(W, c, tx, ty, maxDet, big) {
    let best = null, bd = maxDet;
    const dd = Math.hypot(tx - c.p.x, ty - c.p.y);
    for (const pd of W.pads) {
      if (big && !pd.big) continue;
      const d1 = Math.hypot(pd.x - c.p.x, pd.y - c.p.y);
      if (pd.t > d1 / 1800) continue;
      const det = d1 + Math.hypot(tx - pd.x, ty - pd.y) - dd - (pd.big ? 300 : 0);
      if (det < bd) { bd = det; best = pd; }
    }
    return best;
  }
  function hxGo(W, c, X, x, y, want, park, why, safe) {
    const pl = { type: 'goto', tx: clamp(x, -CFG.X + 200, CFG.X - 200), ty: clamp(y, -CFG.Y + 150, CFG.Y - 150), want, park, why, pad: null, bo: true };
    if (c.boost < 99 && why !== 'line') {
      const low = c.boost < 40, pd = hxPad(W, c, pl.tx, pl.ty, safe ? (low ? 2200 : c.boost < 75 ? 700 : 150) : low ? 350 : 100, safe && low);
      const p2 = pd || (safe && low ? hxPad(W, c, pl.tx, pl.ty, 500, false) : null);
      if (p2) { pl.pad = p2; pl.px = pl.tx; pl.py = pl.ty; pl.tx = p2.x; pl.ty = p2.y; pl.park = false; pl.want = 2300; }
    }
    X.plan = pl;
  }
  function hxPlan(W, H, c, X) {
    const sg = c.team ? -1 : 1, old = X.plan, P = H.P, me = W.cars.indexOf(c);
    if (W.state !== 'play' || !H.ok) { X.plan = HXIDLE; return; }
    const o = hxAt(H, W.tick), bx = P[o], by = P[o + 1], fs = vdot(c.v, c.f), ownY = -sg * CFG.Y;
    hxEtas(W, H);
    let tOpp = 9, tMate = 9, iMate = -1, last = true;
    for (let i = 0; i < H.n; i++) {
      if (i === me) continue;
      const e = H.obs[i].eta;
      if (W.cars[i].team !== c.team) { if (e < tOpp) tOpp = e; }
      else { if (e < tMate) { tMate = e; iMate = i; } if (!H.obs[i].demo && (H.obs[i].p.y - c.p.y) * sg < 0) last = false; }
    }
    const threat = H.goalK >= 0 && H.goalTeam === c.team ? (H.goalK - W.tick) * H.dt : 99;
    const mode = W.kickoff ? 'kick' : threat < 5 || by * sg < -CFG.Y * 0.35 ? 'clear' : 'shot';
    hxReach(HXRT, fs, c.boost); hxReach(HXRL, Math.min(fs, 1000), c.boost);
    const was = old && old.type === 'strike', keep = was && old.gen === H.gen && old.mode === mode, h = hxFindHit(W, H, c, mode, HXH, keep && mode === 'shot' ? old.gx : undefined);
    const tMe = h.ok ? h.t : 9, side = (c.p.y - by) * sg, goalSide = side < -100, bd = Math.hypot(bx - c.p.x, by - c.p.y);
    const gx = -bx, gy = ownY - by, gl = Math.hypot(gx, gy) || 1, danger = by * sg < -CFG.Y * 0.45;
    X.tMe = tMe; X.tOpp = tOpp;
    let go = false, why = '';
    if (W.kickoff) { go = W.kicker[c.team] === c; why = 'kick'; }
    else if (tMate < tMe - (X.first ? 0.3 : 0) && !(threat < 4 && tMe < threat)) why = 'mate';
    else if (!h.ok) why = 'none';
    else if (threat < 6) { go = tMe < threat + 0.1; why = 'save'; }
    else if (h.dy * sg < 0.15 || W.tick < X.ban) why = 'wrong';
    else { go = tMe < tOpp + (last ? 0.1 : 0.7) + (was ? 0.2 : 0) || (danger && goalSide && tMe < tOpp + 0.6); why = go ? 'first' : 'late'; }
    X.first = go || why === 'late' || why === 'wrong' || why === 'none' || why === 'save';
    if (go) {
      const T = W.tick + h.i;
      if (keep && Math.abs(old.T - T) <= 4) {
        old.slack = h.t - h.eta;
        if (old.nx * h.nx + old.ny * h.ny < 0.9986) { old.nx = h.nx; old.ny = h.ny; old.tx = h.tx; old.ty = h.ty; old.probes = Math.min(old.probes, 1); }
      } else X.plan = { type: 'strike', mode, why, T, up: Math.round(h.up * 120), gen: H.gen, nx: h.nx, ny: h.ny, tx: h.tx, ty: h.ty, gx: h.gx, lat: keep ? old.lat : 0, probes: keep ? Math.min(old.probes, 1) : 0, e0: keep ? old.e0 : 0, l0: keep ? old.l0 : 0, q: 0, slack: h.t - h.eta };
      const pl = X.plan;
      if (pl.probes < 3 && mode !== 'kick' && pl.T - W.tick < 170 && H.busy < 5) hxProbe(W, H, c, pl);
      return;
    }
    const safe = tOpp > 1.6 && threat > 6 && !danger;
    if (W.kickoff) {
      const pd = W.pads.find(q => q.big && q.x * (c.p.x || 1) > 0 && q.y * sg < -CFG.Y / 2 && q.t <= 0);
      if (pd && Math.abs(c.p.x) > 100) { X.plan = { type: 'goto', tx: pd.x, ty: pd.y, want: 2300, park: false, why: 'kpad', pad: pd, bo: true }; return; }
      hxGo(W, c, X, c.p.x * 0.3, ownY + sg * 2600, 1800, true, 'kback', false);
      return;
    }
    if (why === 'mate') {
      const m = W.cars[iMate];
      let back = 2300, tx = bx * 0.5 - Math.sign(m.p.x - bx || 1) * 700, ty;
      for (let i = 0; i < H.n; i++) if (i !== me && i !== iMate && W.cars[i].team === c.team && !H.obs[i].demo && (W.cars[i].p.y - c.p.y) * sg > 0) back = 4200;
      ty = by - sg * back;
      if (ty * sg < -CFG.Y + 700 || back > 3000) { ty = Math.min(ty * sg, -CFG.Y * 0.55) * sg; tx = clamp(bx * 0.25, -700, 700); }
      hxGo(W, c, X, tx, ty, 2000, true, 'support', threat > 6);
      return;
    }
    if (threat < 6) { hxGo(W, c, X, clamp(P[hxAt(H, H.goalK) + 0] * 0.9, -GW + 120, GW - 120), ownY + sg * 120, 2300, true, 'line', false); return; }
    if (goalSide && why !== 'wrong') {
      const D = clamp(1100 + bd * 0.25, 1300, 2600), k = Math.min(D, gl - 300);
      hxGo(W, c, X, bx + gx / gl * k, by + gy / gl * k, 2300, true, 'shadow', safe);
      return;
    }
    const D = Math.min(2200, gl - 250), rx = bx + gx / gl * D, ry = by + gy / gl * D, ex = rx - c.p.x, ey = ry - c.p.y, e2 = ex * ex + ey * ey || 1, u = clamp(((bx - c.p.x) * ex + (by - c.p.y) * ey) / e2, 0, 1), qx = c.p.x + ex * u - bx, qy = c.p.y + ey * u - by, ql = Math.hypot(qx, qy);
    if (ql < 420 && u > 0.02 && u < 0.98) { const s = qx * -ey + qy * ex >= 0 ? 1 : -1, el = Math.sqrt(e2); hxGo(W, c, X, bx - ey / el * s * 520, by + ex / el * s * 520, 2300, false, 'around', false); }
    else hxGo(W, c, X, rx, ry, 2300, false, 'retreat', false);
  }
  function hxAct(W, H, c, X, r) {
    const pl = X.plan, fs = vdot(c.v, c.f);
    if (!c.onGround && c.nwW < 3) { hxRecover(W, c, X, r); return; }
    X.rest = 0;
    if (!pl || pl.type === 'idle') { r.throttle = Math.abs(fs) > 50 ? -Math.sign(fs) : 0; return; }
    if (c.u.z < 0.5) { hxDrive(c, r, c.p.x * 0.85, c.p.y * 0.85, 1800, false, false, 0); return; }
    if (pl.type === 'strike') { if (!hxStrikeAct(W, H, c, X, r)) r.throttle = 1; }
    else if (pl.type === 'goto') {
      const d = Math.hypot(pl.tx - c.p.x, pl.ty - c.p.y);
      if (pl.park && d < 260) {
        const o = hxAt(H, W.tick), ab = angleTo(c, H.P[o], H.P[o + 1]);
        if (Math.abs(ab) > 0.5) { r.throttle = fs < 350 ? 0.6 : 0; r.steer = clamp(-ab * 2, -1, 1); } else r.throttle = Math.abs(fs) > 40 ? clamp(-fs / 250, -1, 1) : 0;
      } else {
        const ang = hxDrive(c, r, pl.tx, pl.ty, pl.park ? Math.min(pl.want, d * 1.6 + 300) : pl.want, pl.why === 'shadow' || pl.why === 'support' || pl.why === 'kback' ? d > 1800 && c.boost > 50 : pl.pad ? c.boost < 20 || pl.why !== 'shadow' : true);
        if (Math.abs(ang) > 2.5 && d > 1100 && Math.abs(fs) < 500 && c.u.z > 0.95 && W.tick > X.hfT + 220) { X.hfT = W.tick; X.seq = { type: 'half', t0: W.tick }; }
      }
    }
    const ly = c.p.y + c.v.y * 0.4;
    if (Math.abs(ly) > CFG.Y - 30 && Math.abs(c.p.y) < CFG.Y + 40 && Math.abs(c.p.x + c.v.x * 0.4) < GW + 120 && c.v.y * ly > 250 * Math.abs(ly) && !X.seq) { r.throttle = fs > 0 ? -1 : 1; r.boost = false; }
    if (Math.abs(fs) < 90 && Math.abs(r.throttle) > 0.5 && !r.slide) {
      if (++X.stuck > 130) { X.stuck = 0; X.seq = { type: 'rev', t0: W.tick, s: r.steer > 0 ? -1 : 1, th: -Math.sign(r.throttle) }; }
    } else X.stuck = Math.max(0, X.stuck - 1);
  }
  function hxStep(W, c, dt) {
    const H = W.hx && W.hx.tick === W.tick ? W.hx : hxSense(W, dt), A = c.ai, r = HXR;
    let X = A.X;
    if (!X || A.mode !== 'hx') { X = A.X = hxNew(c.id); A.mode = 'hx'; }
    r.throttle = r.steer = r.pitch = r.roll = 0; r.boost = r.jump = r.slide = false;
    if (c.demoT > 0 || (W.kickoff && W.stateT < HXD * dt && W.state === 'play')) { X.seq = null; X.plan = null; hxOut(X.S, r, c.ctl); return; }
    if (X.seq && !hxSeqRun(W, H, c, X, r)) { X.seq = null; X.think = 0; r.throttle = r.steer = r.pitch = r.roll = 0; r.boost = r.jump = r.slide = false; }
    if (!X.seq) {
      if (--X.think <= 0 || !X.plan) { X.think = 6; hxPlan(W, H, c, X); }
      hxAct(W, H, c, X, r);
      if (X.seq) { r.throttle = r.steer = r.pitch = r.roll = 0; r.boost = r.jump = r.slide = false; hxSeq(W.tick, c, X.seq, r); }
    }
    hxOut(X.S, r, c.ctl);
  }
