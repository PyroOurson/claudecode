
  const HXN = 600, HXD = 12, HXSLEW = 0.25, HXBTN = 4, HXRING = 32, HXGL = CFG.goalLine + BR;
  const HXB = makeBall(), HXR = { throttle: 0, steer: 0, pitch: 0, roll: 0, boost: false, jump: false, slide: false };
  function hxInit(W) {
    const n = W.cars.length;
    const H = { tick: -9, t0: 0, ok: false, hid: false, dt: 1 / CFG.hz, P: new Float64Array(HXN * 9), bh: new Float64Array(HXRING * 9), ch: new Float64Array(HXRING * n * 10), n, obs: [], pads: new Uint8Array(W.pads.length), goalK: -1, goalTeam: -1, gen: 0, was: new Uint8Array(n), busy: 0, etaT: -99 };
    for (let i = 0; i < n; i++) H.obs.push({ p: v3(), v: v3(), f: v3(1, 0, 0), air: false, demo: false, boost: CFG.kickBoost, eta: 9 });
    return (W.hx = H);
  }
  function hxPutBall(a, o, b) { a[o] = b.p.x; a[o + 1] = b.p.y; a[o + 2] = b.p.z; a[o + 3] = b.v.x; a[o + 4] = b.v.y; a[o + 5] = b.v.z; a[o + 6] = b.w.x; a[o + 7] = b.w.y; a[o + 8] = b.w.z; }
  function hxGetBall(a, o, b) { vset(b.p, a[o], a[o + 1], a[o + 2]); vset(b.v, a[o + 3], a[o + 4], a[o + 5]); vset(b.w, a[o + 6], a[o + 7], a[o + 8]); return b; }
  function hxPutCar(a, o, c) { a[o] = c.p.x; a[o + 1] = c.p.y; a[o + 2] = c.p.z; a[o + 3] = c.v.x; a[o + 4] = c.v.y; a[o + 5] = c.v.z; a[o + 6] = c.f.x; a[o + 7] = c.f.y; a[o + 8] = c.f.z; a[o + 9] = (c.onGround ? 0 : 1) + (c.demoT > 0 ? 2 : 0); }
  function hxRebuild(H, od, kd) {
    const P = H.P, b = hxGetBall(H.bh, od, HXB);
    H.t0 = kd; H.goalK = -1; H.goalTeam = -1; H.ok = true; H.gen++;
    for (let j = 0, o = 0; j < HXN; j++, o += 9) {
      if (j) ballStep(b, H.dt);
      hxPutBall(P, o, b);
      if (H.goalK < 0 && Math.abs(b.p.y) > HXGL) { H.goalK = kd + j; H.goalTeam = b.p.y > 0 ? 1 : 0; }
    }
  }
  function hxSense(W, dt) {
    const H = W.hx || hxInit(W), B = W.ball, k = W.tick, bh = H.bh, ch = H.ch, n = H.n, cs = W.cars, P = H.P;
    const gap = H.tick !== k - 1 || B.hidden !== H.hid || dt !== H.dt;
    H.tick = k; H.hid = B.hidden; H.dt = dt;
    if (gap) {
      for (let s = 0; s < HXRING; s++) { hxPutBall(bh, s * 9, B); for (let i = 0; i < n; i++) hxPutCar(ch, (s * n + i) * 10, cs[i]); }
      H.ok = false;
      for (let j = 0; j < W.pads.length; j++) H.pads[j] = W.pads[j].t <= 0 ? 1 : 0;
      if (W.kickoff) for (let i = 0; i < n; i++) H.obs[i].boost = CFG.kickBoost;
    } else {
      const s = k & (HXRING - 1);
      hxPutBall(bh, s * 9, B);
      for (let i = 0; i < n; i++) hxPutCar(ch, (s * n + i) * 10, cs[i]);
    }
    const kd = k - HXD, sd = kd & (HXRING - 1), od = sd * 9, tau = HXD * dt;
    if (B.hidden) H.ok = false;
    else if (!H.ok) hxRebuild(H, (k & (HXRING - 1)) * 9, k);
    else if (kd > H.t0) {
      let same = true;
      for (let q = 0; q < 6; q++) if (P[9 + q] !== bh[od + q]) { same = false; break; }
      if (!same) hxRebuild(H, od, kd);
      else {
        P.copyWithin(0, 9);
        const o = (HXN - 1) * 9, b = hxGetBall(P, o - 9, HXB);
        ballStep(b, dt); hxPutBall(P, o, b);
        H.t0 = kd;
        if (H.goalK < 0 && Math.abs(b.p.y) > HXGL) { H.goalK = kd + HXN - 1; H.goalTeam = b.p.y > 0 ? 1 : 0; }
      }
    }
    for (let i = 0; i < n; i++) {
      const c = cs[i], ob = H.obs[i], o = (sd * n + i) * 10, fl = ch[o + 9];
      ob.air = !!(fl & 1); ob.demo = fl >= 2;
      vset(ob.v, ch[o + 3], ch[o + 4], ch[o + 5]); vset(ob.f, ch[o + 6], ch[o + 7], ch[o + 8]);
      vset(ob.p, ch[o] + ob.v.x * tau, ch[o + 1] + ob.v.y * tau, ch[o + 2] + ob.v.z * tau);
      if (ob.air) { ob.p.z = Math.max(CFG.carRest, ob.p.z - 0.5 * CFG.g * tau * tau); ob.v.z -= CFG.g * tau; }
      if (c.boosting) ob.boost = Math.max(0, ob.boost - CFG.boostUse * dt);
      const dm = c.demoT > 0 ? 1 : 0;
      if (H.was[i] && !dm) ob.boost = CFG.kickBoost;
      H.was[i] = dm;
    }
    for (let j = 0; j < W.pads.length; j++) {
      const pd = W.pads[j], on = pd.t <= 0 ? 1 : 0;
      if (H.pads[j] && !on) {
        let bi = -1, bd = 1e9;
        for (let i = 0; i < n; i++) { const c = cs[i], d = Math.hypot(c.p.x - pd.x, c.p.y - pd.y); if (c.demoT <= 0 && d < bd) { bd = d; bi = i; } }
        if (bi >= 0) H.obs[bi].boost = Math.min(100, H.obs[bi].boost + pd.amt);
      }
      H.pads[j] = on;
    }
    H.busy = 0;
    return H;
  }
  const hxAt = (H, tick) => clamp(tick - H.t0, 0, HXN - 1) * 9;

  const hxShape = () => ({ th: 0, x: 0, pi: 0, ro: 0, rt: 9, j: false, jt: 9, b: false, bt: 9, s: false, st: 9 });
  function hxShapeCopy(d, s) { d.th = s.th; d.x = s.x; d.pi = s.pi; d.ro = s.ro; d.rt = s.rt; d.j = s.j; d.jt = s.jt; d.b = s.b; d.bt = s.bt; d.s = s.s; d.st = s.st; }
  function hxOut(S, r, k) {
    const sl = (a, b) => a + clamp(b - a, -HXSLEW, HXSLEW);
    S.th = sl(S.th, clamp(r.throttle, -1, 1)); S.x = sl(S.x, clamp(r.steer, -1, 1)); S.pi = sl(S.pi, clamp(r.pitch, -1, 1));
    const ro = r.roll > 0.4 ? 1 : r.roll < -0.4 ? -1 : 0;
    S.rt++; S.jt++; S.bt++; S.st++;
    if (ro !== S.ro && S.rt >= HXBTN) { S.ro = ro; S.rt = 0; }
    if (r.jump !== S.j && S.jt >= HXBTN) { S.j = r.jump; S.jt = 0; }
    if (r.boost !== S.b && S.bt >= HXBTN) { S.b = r.boost; S.bt = 0; }
    if (r.slide !== S.s && S.st >= HXBTN) { S.s = r.slide; S.st = 0; }
    k.throttle = S.th; k.steer = S.x; k.yaw = S.x; k.pitch = S.pi; k.roll = S.ro; k.jump = S.j; k.boost = S.b; k.slide = S.s;
  }
