function makeCSCam(K) {
  const fr = Math.fround, U = 32768 / Math.PI, Uf = fr(U), DEG = Math.PI / 180;
  const sat = x => x !== x ? 0 : x >= 2147483647 ? 2147483647 : x <= -2147483648 ? -2147483648 : Math.trunc(x);
  const ext = n => (n << 16) >> 16;
  const rnd = x => x < 0 ? -Math.round(-x) : Math.round(x);
  const iu = x => sat(rnd(x * U));
  const q16 = x => ext(sat(fr(fr(x) * Uf))) / U;
  const yawOf = (x, z) => (Math.hypot(x, z) > 0 ? ext(16384 - sat(fr(fr(Math.atan2(z, x)) * Uf))) : 16384) / U;
  const wrap = x => Math.atan2(Math.sin(x), Math.cos(x));
  const lerpRot = (k, toU, fromU) => ext(sat(fr(k * ext(toU - fromU))) + fromU) / U;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const isFin = Number.isFinite;
  const view = () => new Float64Array(11);
  const smoother = rate => ({ rate, max: 0, init: false, p: [0, 0, 0] });
  let S;
  function reset() {
    S = {
      set: [K.fov, K.dist, K.height, K.angle, K.stiff, K.trans], floor: true, ball: true, ballPrev: true,
      A: smoother(K.rateA), B: smoother(K.rateB), C: smoother(K.rateC),
      snap: true, gPrev: true, g: true, blend: 1, N: [0, 1, 0],
      v: view(), o: view(), d: new Float64Array(11), tt: 0, td: 0.5, lookY: 0, lookX: 0,
      prev: [0, 0, 0], hasPrev: false, vel: [0, 0, 0], nT: [0, 1, 0], sup: false, ready: false,
      F: [1, 0, 0], R: [0, 0, 1], Uv: [0, 1, 0]
    };
    for (const w of [S.v, S.o]) { w[6] = K.dist; w[7] = K.fov; }
  }
  reset();
  function smooth(s, t, dt) {
    if (!s.init) { s.init = true; s.p[0] = t[0]; s.p[1] = t[1]; s.p[2] = t[2]; return; }
    const k = 1 - Math.exp(-dt * s.rate), p = s.p;
    p[0] += (t[0] - p[0]) * k; p[1] = (t[1] - p[1]) * k + p[1]; p[2] = (t[2] - p[2]) * k + p[2];
    let lx = t[0] - p[0], ly = t[1] - p[1], lz = t[2] - p[2];
    const m = s.max;
    if (m > 0) { const q = lz * lz + lx * lx + ly * ly; if (q > m * m) { const n = q === 0 ? 1 : 1 / Math.sqrt(q); lz = m * lz * n; ly = m * ly * n; lx = m * lx * n; p[0] = t[0] - lx; p[1] = t[1] - ly; p[2] = t[2] - lz; } }
    p[0] = fr(p[0]); p[1] = fr(p[1]); p[2] = fr(p[2]);
  }
  function camLoc(v) {
    const sp = fr(Math.sin(v[3])), cp = fr(Math.cos(v[3])), dz = fr(cp * fr(Math.cos(v[4]))), dx = fr(cp * fr(Math.sin(v[4]))), dd = fr(v[6]);
    v[8] = fr(v[0] - fr(dx * dd)); v[10] = fr(v[2] - fr(dz * dd));
    const y = v[1] - fr(dd * sp), fy = fr(y);
    v[9] = S.floor ? (y < 10 ? 10 : fy) : fy;
    return [dx, sp, dz];
  }
  function grounded(dt, v) {
    const F = S.F, N = S.N, nT = S.nT;
    let d = 1 - Math.exp(dt * K.nRate);
    let e = (nT[2] - N[2]) * d + N[2], f = (nT[0] - N[0]) * d + N[0], i = N[1] + (nT[1] - N[1]) * d;
    let q = e * e + f * f + i * i; q = q === 0 ? 1 : 1 / Math.sqrt(q);
    N[2] = e *= q; N[1] = i *= q; N[0] = f *= q;
    const az = f * F[1] - i * F[0], ay = e * F[0] - f * F[2], ax = i * F[2] - e * F[1];
    const bz = ax * i - ay * f, by = az * f - ax * e, bx = ay * e - az * i;
    const el = Math.atan2(by, Math.hypot(bx, bz)), k = Math.min(Math.abs(el * U) / 48000, 1);
    let nx = f, ny = i, nz = e;
    if (el > 0) { nx = -f; ny = -i; nz = -e; }
    const lz = (nz - bz) * k + bz, ly = (ny - by) * k + by, lx = (nx - bx) * k + bx;
    const yawT = yawOf(lx, lz), pl = q16(Math.atan2(ly, Math.hypot(lx, lz))), ang = q16(S.set[3] * DEG);
    const pitT = q16(pl + (ang > Math.PI / 2 - pl ? Math.PI / 2 - pl : ang));
    if (S.snap) { v[3] = pitT; v[4] = yawT; v[5] = 0; return; }
    const st = S.set[4], sk = st * K.stiffK + 1, yU = iu(yawT), pU = iu(pitT);
    let fy, fp, fl;
    if (st < 1) {
      const o = fr(1 - Math.exp(dt * sk * K.fastRate));
      fy = lerpRot(o, yU, iu(v[4])); fp = lerpRot(o, pU, iu(v[3])); fl = lerpRot(o, 0, iu(v[5]));
    } else { fy = yawT; fp = pitT; fl = 0; }
    const o2 = fr(1 - Math.exp(dt * sk * K.slowRate));
    const sy = lerpRot(o2, yU, iu(v[4])), sp = lerpRot(o2, pU, iu(v[3])), sl = lerpRot(o2, 0, iu(v[5]));
    const w = fr(1 - Math.abs(N[1]));
    v[4] = lerpRot(w, iu(sy), iu(fy)); v[3] = lerpRot(w, iu(sp), iu(fp)); v[5] = lerpRot(w, iu(sl), iu(fl));
  }
  function airborne(v) {
    const F = S.F, V = S.vel;
    if (S.snap) {
      const yF = yawOf(F[0], F[2]), pF = q16(Math.atan2(F[1], Math.hypot(F[0], F[2])));
      let yV = yF, pV = pF, rV = 0, h = Math.hypot(V[0], V[2]);
      if (V[2] * V[2] + V[0] * V[0] + V[1] * V[1] > 0) { yV = yawOf(V[0], V[2]); pV = q16(Math.atan2(V[1], h)); rV = 0; }
      const k = Math.min(h / 500, 1);
      v[4] = wrap(wrap(yV - yF) * k + yF); v[5] = 0; v[3] = q16(S.set[3] * DEG);
      return;
    }
    const cx = v[0] - v[8], cy = v[1] - v[9], cz = v[2] - v[10];
    const vx = fr(V[0]), vy = fr(V[1]), vz = fr(V[2]), m = fr(vx * vx), n = fr(vz * vz);
    const sp = fr(fr(Math.sqrt(fr(fr(m + fr(vy * vy)) + n))) / 2300);
    const j = fr(fr(Math.min(sp, 1) * -25) + 35);
    const yT = yawOf(cx, cz), pT = q16(Math.atan2(cy, Math.hypot(cx, cz))), l = fr(Math.min(j / 60, 1));
    const yaw = v[4] = lerpRot(l, iu(yT), iu(v[4]));
    const pit = v[3] = lerpRot(l, iu(pT), iu(v[3]));
    v[5] = lerpRot(l, 0, iu(v[5]));
    const sn = fr(Math.sin(pit)), cp = fr(Math.cos(pit)), dz = fr(cp * fr(Math.cos(yaw))), dx = fr(cp * fr(Math.sin(yaw)));
    if (V[2] * dz + V[0] * dx + V[1] * sn < 0) v[3] = ext(sat(fr(fr(1 - Math.min(fr(fr(Math.sqrt(fr(m + n))) / 2300), 1)) * iu(pit)))) / U;
  }
  function solve(ballCam, car, ball, dt, v) {
    const want = S.g;
    let rate = want ? 2 : -4;
    if (want !== S.gPrev) { S.gPrev = want; rate = want ? 2 : -4; if (want) { S.N[0] = S.nT[0]; S.N[1] = S.nT[1]; S.N[2] = S.nT[2]; } }
    S.blend = clamp(fr(fr(S.blend) + fr(rate * fr(dt))), 0, 1);
    let off;
    if (ballCam) { S.B.init = true; S.B.p[0] = 0; S.B.p[1] = S.set[2]; S.B.p[2] = 0; off = S.B.p; S.A.max = 0.001; }
    else {
      const h = S.set[2], Uv = S.Uv;
      smooth(S.B, S.blend >= 1 ? [Uv[0] * h, Uv[1] * h, Uv[2] * h] : [0, h, 0], dt);
      off = S.B.p; S.A.max = 100;
    }
    const tgt = [car[0] + off[0], car[1] + off[1], car[2] + off[2]];
    smooth(S.A, tgt, dt);
    { const sp = fr(Math.sin(v[3])), cp = fr(Math.cos(v[3])), dz = fr(cp * fr(Math.cos(v[4]))), dx = fr(cp * fr(Math.sin(v[4]))), P = S.A.p;
      const r0 = fr(P[2] - v[10]), s0 = fr(P[1] - v[9]), t0 = fr(P[0] - v[8]);
      const r1 = fr(fr(fr(sp * s0) + fr(dx * t0)) + fr(dz * r0));
      const u = fr(r0 - fr(dz * r1)), s1 = fr(s0 - fr(r1 * sp)), t1 = fr(t0 - fr(dx * r1));
      const tx = fr(tgt[0] - v[8]), ty = fr(tgt[1] - v[9]), tz = fr(tgt[2] - v[10]);
      const q2 = fr(fr(fr(sp * ty) + fr(dx * tx)) + fr(dz * tz));
      const gz = fr(u + fr(dz * q2)), gy = fr(s1 + fr(q2 * sp)), gx = fr(t1 + fr(dx * q2));
      const qz = fr(v[10] + gz), qy = fr(v[9] + gy), qx = fr(v[8] + gx), o = fr(S.set[4]);
      v[2] = fr(fr(o * fr(tgt[2] - qz)) + qz); v[1] = fr(fr(fr(tgt[1] - qy) * o) + qy); v[0] = fr(fr(fr(tgt[0] - qx) * o) + qx);
    }
    if (ballCam) {
      let bx = ball[0] - v[0], by = ball[1] - v[1], bz = ball[2] - v[2];
      v[1] = Math.abs(ext(sat(fr(fr(Math.atan2(by, Math.hypot(bx, bz))) * Uf))) / U * U) * K.ballLift + v[1];
      bx = ball[0] - v[0]; by = ball[1] - v[1]; bz = ball[2] - v[2];
      const yT = yawOf(bx, bz), el = q16(Math.atan2(by, Math.hypot(bx, bz))), ang = q16(S.set[3] * DEG);
      const pT = q16((el - ang) * K.ballPitch * clamp((Math.abs(el * U) - 4000) / 4000, 0, 1) + ang);
      if (S.snap) { v[3] = pT; v[4] = yT; v[5] = 0; }
      else {
        const k = 1 - Math.exp(dt * K.ballRate);
        v[5] = wrap(v[5] + wrap(0 - v[5]) * k); v[4] = wrap(v[4] + wrap(yT - v[4]) * k); v[3] = wrap(v[3] + wrap(pT - v[3]) * k);
      }
    } else if (S.blend >= 1) grounded(dt, v);
    else if (S.blend <= 0) airborne(v);
    else {
      const a = Float64Array.from(v), b = Float64Array.from(v);
      grounded(dt, a); airborne(b);
      const g = S.blend, o = fr(g);
      for (let i = 0; i < 3; i++) v[i] = (a[i] - b[i]) * g + b[i];
      v[3] = lerpRot(o, iu(a[3]), iu(b[3])); v[4] = lerpRot(o, iu(a[4]), iu(b[4])); v[5] = lerpRot(o, iu(a[5]), iu(b[5]));
      v[6] = g * (a[6] - b[6]) + b[6]; v[7] = g * (a[7] - b[7]) + b[7];
      camLoc(v);
    }
    const [dx, dy, dz] = [fr(fr(Math.cos(v[3])) * fr(Math.sin(v[4]))), fr(Math.sin(v[3])), fr(fr(Math.cos(v[3])) * fr(Math.cos(v[4])))];
    const lag = (1 - S.set[4]) * (S.vel[2] * dz + S.vel[0] * dx + S.vel[1] * dy) * K.distLag;
    smooth(S.C, [S.set[1] + (lag < K.distLagMin ? K.distLagMin : lag), 0, 0], dt);
    v[6] = fr(S.C.p[0]);
    const fT = S.sup ? S.set[0] + K.fovSup : Math.hypot(S.vel[2], S.vel[0], S.vel[1]) / 2300 * K.fovSpeed + S.set[0], fR = (S.sup ? K.fovRateSup : K.fovRate) * dt;
    v[7] = S.snap ? fT : Math.abs(fT - v[7]) <= fR ? fT : v[7] + (fT - v[7] < 0 ? -fR : fR);
    if (!ballCam && S.blend > 0) v[5] = ext(sat(fr(fr(S.blend * Math.atan2(S.R[1], Math.hypot(S.R[0], S.R[2])) * K.roll) * Uf))) / U;
    camLoc(v);
    S.snap = false;
  }
  function step(I) {
    const st = I.set, [qx, qy, qz, qw] = I.quat || [0, 0, 0, 1], car = I.car;
    S.floor = I.floor !== false;
    S.set[0] = st.fov; S.set[1] = st.dist; S.set[2] = st.height; S.set[3] = st.angle; S.set[4] = st.stiff; S.set[5] = st.trans;
    const nrm = (x, y, z) => { let q = x * x + y * y + z * z; q = q === 0 ? 1 : 1 / Math.sqrt(q); return [x * q, y * q, z * q]; };
    if (I.F) { S.F = I.F; S.Uv = I.U; S.R = I.R; }
    else {
      S.Uv = nrm(2 * (qx * qy - qw * qz), qw * qw + qy * qy - qx * qx - qz * qz, 2 * (qw * qx + qy * qz));
      S.R = nrm(2 * (qx * qz + qw * qy), 2 * (qy * qz - qw * qx), qw * qw - qx * qx - qy * qy + qz * qz);
      S.F = nrm(qw * qw + qx * qx - qy * qy - qz * qz, 2 * (qx * qy + qw * qz), 2 * (qx * qz - qw * qy));
    }
    const dt = I.dt < 0.05 ? I.dt : 0.05, j = dt > 0 ? dt : 0;
    let tele = false;
    if (S.hasPrev) tele = Math.hypot(S.prev[2] - car[2], S.prev[0] - car[0], S.prev[1] - car[1]) > 1000;
    S.vel = I.vel.slice();
    S.hasPrev = true; S.prev = car.slice();
    S.g = I.onGround;
    S.nT = nrm(I.normal[0], I.normal[1], I.normal[2]);
    S.sup = !!I.sup;
    const bc = !!I.ballCam, was = S.ball;
    S.ball = bc;
    if (tele && S.ready) S.A.init = false;
    if (!S.ready) {
      const v = S.v, F = S.F, Uv = S.Uv, h = S.set[2];
      v[6] = S.set[1]; v[5] = 0; v[4] = yawOf(F[0], F[2]); v[7] = S.set[0];
      v[0] = Uv[0] * h + car[0]; v[1] = Uv[1] * h + car[1]; v[2] = Uv[2] * h + car[2];
      v[3] = q16(q16(S.set[3] * DEG) + q16(Math.atan2(F[1], Math.hypot(F[0], F[2]))));
      camLoc(v);
      S.o.set(S.v); S.N = S.nT.slice(); S.blend = S.g ? 1 : 0; S.gPrev = S.g; S.ballPrev = bc;
      S.snap = true; S.A.init = S.B.init = S.C.init = false;
      solve(bc, car, I.ball, j, S.v);
      S.o.set(S.v); S.ready = true; S.tt = 0;
    } else if (was !== bc) {
      const old = Float64Array.from(S.v);
      solve(S.ballPrev, car, I.ball, j, old);
      S.snap = true; S.A.init = S.B.init = S.C.init = false;
      S.ballPrev = bc; S.gPrev = S.g; S.N = S.nT.slice(); S.blend = S.g ? 1 : 0;
      const nw = Float64Array.from(S.v);
      solve(bc, car, I.ball, j, nw);
      S.v.set(nw);
      const d = S.d;
      for (let i = 0; i < 3; i++) d[i] = old[i] - nw[i];
      for (let i = 3; i < 6; i++) d[i] = wrap(old[i] - nw[i]);
      d[6] = old[6] - nw[6]; d[7] = old[7] - nw[7];
      S.td = S.tt = 0.5 / clamp(S.set[5], 0.1, 10);
      S.o.set(nw);
      const e = S.tt / S.td, g = clamp(e, 0, 1) ** 2;
      for (let i = 0; i < 3; i++) S.o[i] += d[i] * g;
      for (let i = 3; i < 6; i++) S.o[i] = wrap(S.o[i] + d[i] * g);
      S.o[6] += d[6] * g; S.o[7] += d[7] * g;
    } else {
      solve(S.ballPrev, car, I.ball, j, S.v);
      S.o.set(S.v);
      const e = S.tt;
      if (!(e <= 0)) {
        const g = clamp(e / S.td, 0, 1) ** 2, d = S.d;
        for (let i = 0; i < 3; i++) S.o[i] += d[i] * g;
        for (let i = 3; i < 6; i++) S.o[i] = wrap(S.o[i] + d[i] * g);
        S.o[6] += d[6] * g; S.o[7] += d[7] * g;
      }
      S.tt = Math.max(e - j, 0);
    }
    let ky = S.lookY, kx = S.lookX;
    if (j > 0) {
      const sw = isFin(st.swivel) ? clamp(st.swivel, 1, 10) : 4, fast = sw * K.swivelBack, wa = fr(j);
      const ly = isFin(I.lookY) ? clamp(I.lookY, -1, 1) : 0, tY = sat(fr(fr(st.invert ? ly : -ly) * K.lookPitch) * Uf), cY = iu(S.lookY);
      const rY = Math.abs(tY) < Math.abs(cY) ? fast : sw;
      ky = sat(fr(cY + fr(Math.min(fr(wa * fr(rY)), 1) * (tY - cY)))) / U;
      const lx = isFin(I.lookX) ? clamp(I.lookX, -1, 1) * K.lookYaw : -0, tX = sat(fr(fr(lx) * Uf)), cX = iu(S.lookX);
      const rX = Math.abs(tX) < Math.abs(cX) ? fast : sw;
      kx = sat(fr(cX + fr(Math.min(fr(wa * fr(rX)), 1) * (tX - cX)))) / U;
    }
    S.lookY = ky; S.lookX = kx;
    const o = S.o;
    if (!(kx === 0 && ky === 0)) { o[4] = wrap(kx + o[4]); o[3] = clamp(ky + o[3], -K.pitchMax, K.pitchMax); }
    let piv = [o[0], o[1], o[2]], pit = o[3], yaw = o[4], roll = o[5];
    if (I.rear) {
      const F = S.F;
      yaw = wrap((Math.hypot(F[0], F[2]) > 1e-6 ? Math.atan2(F[0], F[2]) : S.v[4]) + Math.PI);
      pit = q16(S.set[3] * DEG); roll = 0;
      piv = [car[0], car[1] + S.set[2], car[2]];
      o[0] = piv[0]; o[1] = piv[1]; o[2] = piv[2]; o[3] = pit; o[4] = yaw; o[5] = 0;
    }
    const sp = fr(Math.sin(pit)), cp = fr(Math.cos(pit)), dz = fr(cp * fr(Math.cos(yaw))), dx = fr(cp * fr(Math.sin(yaw))), dd = fr(o[6]);
    const px = fr(piv[0] - fr(dx * dd)), pz = fr(piv[2] - fr(dz * dd)), y = piv[1] - fr(dd * sp), py = S.floor ? (y < 10 ? 10 : fr(y)) : fr(y);
    let up = [0, 1, 0];
    if (Math.abs(roll) > 0) { const c = Math.cos(roll), s = Math.sin(roll), h = (1 - c) * sp; up = [dx * h - s * dz, sp * h + c, dz * h + s * dx]; }
    const vf = 2 * Math.atan(Math.tan(o[7] * DEG * 0.5) / (I.aspect < 1 ? 1.7777777777777777 : I.aspect)) * 180 / Math.PI;
    return { p: [px, py, pz], dir: [dx, sp, dz], up, fov: vf };
  }
  return { step, reset, S: () => S };
}
if (typeof module !== 'undefined') module.exports = { makeCSCam };
