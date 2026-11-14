        const makeCSCam = K => {
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
        };
        let AC = null, master = null, fxRv = null, noiseB = null, bstG = null, bstF = null, fxBst2 = null, fxBst3 = null, windG = null, crowdG = null, crowdF = null, fxCr2 = null, fxTyG = null, fxSqG = null, fxSqF = null;
        const fxEngV = [], fxEngO = [], FX_CROWD = 0.032;
        function audio() {
          if (AC || dead) return;
          try {
            AC = new (window.AudioContext || window.webkitAudioContext)();
            const sr = AC.sampleRate, comp = AC.createDynamicsCompressor();
            comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.24; comp.connect(AC.destination);
            master = AC.createGain(); master.gain.value = 0; master.connect(comp);
            noiseB = AC.createBuffer(1, sr * 2, sr);
            const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            const ir = AC.createBuffer(2, Math.floor(sr * 2.4), sr);
            for (let c = 0; c < 2; c++) { const q = ir.getChannelData(c), n = q.length, a = sr * 0.01; for (let i = 0; i < n; i++) q[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.6) * (i < a ? i / a : 1); }
            const cv = AC.createConvolver(), rg = AC.createGain(); cv.buffer = ir; rg.gain.value = 0.4; cv.connect(rg).connect(master);
            fxRv = AC.createGain(); fxRv.connect(cv);
            const loop = (type, f, q, g0) => { const s = AC.createBufferSource(); s.buffer = noiseB; s.loop = true; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = AC.createGain(); g.gain.value = g0; s.connect(fl).connect(g).connect(master); s.start(0, Math.random() * 1.8); return [g, fl]; };
            for (let i = 0; i < 1; i++) {
              const o1 = AC.createOscillator(), o2 = AC.createOscillator(), o3 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(), g2 = AC.createGain(), g3 = AC.createGain();
              o1.type = 'sawtooth'; o2.type = 'square'; o3.type = 'triangle'; o1.frequency.value = 44; o2.frequency.value = 22; o3.frequency.value = 176;
              f.type = 'lowpass'; f.Q.value = 2.4; f.frequency.value = 300; g.gain.value = 0; g2.gain.value = 0.3; g3.gain.value = 0;
              o1.connect(f); o2.connect(g2).connect(f); f.connect(g).connect(master); o3.connect(g3).connect(master);
              o1.start(); o2.start(); o3.start();
              fxEngV.push({ o1, o2, o3, f, g, g3, boost: false, sup: false });
            }
            for (let i = 0; i < 4; i++) {
              const o1 = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(), pn = AC.createStereoPanner ? AC.createStereoPanner() : null;
              o1.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.Q.value = 2; f.frequency.value = 260; g.gain.value = 0;
              o1.connect(f); const g2 = AC.createGain(); g2.gain.value = 0.3; o2.connect(g2).connect(f); f.connect(g); if (pn) g.connect(pn).connect(master); else g.connect(master);
              o1.start(); o2.start();
              fxEngO.push({ o1, o2, f, g, pn });
            }
            [bstG, bstF] = loop('bandpass', 700, 0.75, 0); [fxBst2] = loop('lowpass', 260, 0.9, 0); [fxBst3] = loop('highpass', 4200, 0.5, 0); [windG] = loop('highpass', 2300, 0.6, 0);
            [crowdG, crowdF] = loop('bandpass', 500, 0.5, FX_CROWD); [fxCr2] = loop('bandpass', 1300, 0.8, 0); [fxTyG] = loop('lowpass', 420, 0.8, 0); [fxSqG, fxSqF] = loop('bandpass', 1900, 9, 0);
          } catch (e) { try { if (AC) AC.close(); } catch (er) { } AC = null; fxEngV.length = 0; fxEngO.length = 0; }
        }
        const fxRoute = (g, rv, pan) => {
          if (pan && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p).connect(master); } else g.connect(master);
          if (rv > 0 && fxRv) { const s = AC.createGain(); s.gain.value = rv; g.connect(s).connect(fxRv); }
        };
        const tone = (f, d, type, vol, f2, delay = 0, rv = 0.12, pan = 0) => {
          if (!AC || api.muted || !(vol > 0.0002)) return;
          const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
          o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
          o.connect(g); fxRoute(g, rv, pan); o.start(t); o.stop(t + d + 0.05);
        };
        const noise = (d, f, vol, type = 'lowpass', q = 1, f2 = 0, delay = 0, rv = 0.12, pan = 0, atk = 0) => {
          if (!AC || api.muted || !(vol > 0.0002)) return;
          const t = AC.currentTime + delay, s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain();
          s.buffer = noiseB; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); fl.Q.value = q;
          if (atk) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + atk); } else g.gain.setValueAtTime(vol, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + d);
          s.connect(fl).connect(g); fxRoute(g, rv, pan); s.start(t, Math.random() * 1.5); s.stop(t + d + 0.05);
        };
        const fxHorn = (notes, d, vol, delay = 0) => {
          if (!AC || api.muted) return;
          const t = AC.currentTime + delay, f = AC.createBiquadFilter(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain();
          f.type = 'lowpass'; f.Q.value = 1.3; f.frequency.setValueAtTime(420, t); f.frequency.linearRampToValueAtTime(2300, t + 0.14); f.frequency.linearRampToValueAtTime(1500, t + d);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.07); g.gain.setValueAtTime(vol, t + d - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
          lfo.frequency.value = 5.2; lg.gain.value = 2.2; lfo.connect(lg);
          for (const n of notes) for (const dn of [-6, 6]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = n; o.detune.value = dn; lg.connect(o.frequency); o.connect(f); o.start(t); o.stop(t + d + 0.05); }
          f.connect(g); fxRoute(g, 0.4, 0); lfo.start(t); lfo.stop(t + d + 0.05);
        };
        const fxBoom = (vol, len, br, pan) => {
          noise(len, 1800 * br + 500, vol * 0.7, 'lowpass', 0.7, 60, 0, 0.5, pan);
          noise(len * 0.45, 2600, vol * 0.2 * br, 'highpass', 0.6, 0, 0.01, 0.35, pan);
          tone(88, len * 0.75, 'sine', vol * 0.6, 27, 0, 0.2, pan);
          tone(52, len, 'sine', vol * 0.4, 22, 0.03, 0.1, pan);
        };
        const fxBallSnd = (v, a, pan) => {
          const s = clamp(v / 3000, 0.05, 1), m = 0.92 + Math.random() * 0.16;
          tone(140 + 80 * s, 0.16 + 0.18 * s, 'sine', (0.12 + 0.34 * s) * a, 46, 0, 0.18, pan);
          noise(0.05 + 0.05 * s, 1900 + 1800 * s, (0.07 + 0.3 * s) * a, 'bandpass', 0.9, 0, 0, 0.1, pan);
          tone(322 * m, 0.22 + 0.32 * s, 'sine', (0.012 + 0.05 * s) * a, 0, 0, 0.3, pan);
          tone(547 * m, 0.18 + 0.26 * s, 'sine', (0.006 + 0.032 * s) * a, 0, 0, 0.3, pan);
          tone(869 * m, 0.12 + 0.2 * s, 'triangle', 0.02 * s * a, 0, 0, 0.3, pan);
          if (s > 0.55) noise(0.45 + 0.45 * s, 900, (s - 0.45) * 0.55 * a, 'lowpass', 0.8, 70, 0, 0.45, pan);
        };
        const fxBounceSnd = (v, a, pan) => { const s = clamp(v / 3500, 0.03, 1); tone(118 + 40 * s, 0.13 + 0.1 * s, 'sine', 0.24 * s * a, 50, 0, 0.2, pan); noise(0.07, 500 + 900 * s, 0.16 * s * a, 'lowpass', 1, 0, 0, 0.15, pan); tone(250 * (0.95 + Math.random() * 0.1), 0.18, 'sine', 0.022 * s * a, 0, 0, 0.3, pan); };
        const fxBeep = go => {
          if (go) { tone(1318.5, 0.62, 'triangle', 0.1, 0, 0, 0.25); tone(1975.5, 0.5, 'sine', 0.04, 0, 0, 0.25); tone(659.3, 0.55, 'square', 0.016, 0, 0, 0.25); }
          else { tone(659.3, 0.2, 'triangle', 0.09, 0, 0, 0.2); tone(1318.5, 0.12, 'sine', 0.025, 0, 0, 0.2); }
        };
        const fxPadSnd = (big, a) => {
          if (big) { noise(0.34, 380, 0.11 * a, 'bandpass', 1.2, 2400); tone(523.3, 0.32, 'triangle', 0.05 * a, 1046.5); tone(784, 0.3, 'sine', 0.035 * a, 1568, 0.04); tone(1046.5, 0.36, 'sine', 0.025 * a, 2093, 0.08); }
          else { tone(1046.5, 0.07, 'sine', 0.05 * a, 1568); tone(1568, 0.09, 'triangle', 0.03 * a, 2093, 0.045); }
        };
        const fxOoh = () => { noise(1.7, 430, 0.075, 'bandpass', 1.4, 330, 0, 0.3, 0, 0.35); noise(1.5, 860, 0.04, 'bandpass', 1.6, 640, 0.05, 0.3, 0, 0.35); crowdSwell(0.12, 2, 0.4); };
        const att = p => { const c = views[0].camera.position; return clamp(1 - Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z) / 9000, 0.1, 1); };
        const crowdSwell = (v, dur, br = 0.4) => {
          if (!AC) return;
          const t = AC.currentTime;
          for (const [g, lv, base] of [[crowdG, v, FX_CROWD], [fxCr2, v * br, 0]]) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(Math.max(lv, g.gain.value), t + 0.3); g.gain.linearRampToValueAtTime(Math.max(base, lv * 0.65), t + dur * 0.55); g.gain.linearRampToValueAtTime(base, t + dur); }
        };
        const fxPan = p => { const c = views[0].camera, e = c.matrixWorld.elements, dx = p.x - c.position.x, dy = p.y - c.position.y, dz = p.z - c.position.z, l = Math.hypot(dx, dy, dz) || 1; return clamp((dx * e[0] + dy * e[1] + dz * e[2]) / l * 0.7, -0.7, 0.7); };


        const fxCS = views.map(() => ({ car: null, kc: null, kin: null, snap: true, rs: -1, rp: new THREE.Vector3(), rsm: 0, rft: 0, rpf: null, fov0: 0 }));
        const fxW = new THREE.Vector3(0, 0, 1), cU = new THREE.Vector3(), cT = new THREE.Vector3(), cA = new THREE.Vector3(), cP = new THREE.Vector3(), cL = new THREE.Vector3(), cR = new THREE.Vector3(), cn = v3(), fxPp = v3();
        const fxGoal = { on: false, p: new THREE.Vector3() };
        let fxNow = 0;
        const fxPush = (p, m) => { const d = sdf(p.x, p.y, p.z); if (d < m) { sdfN(p.x, p.y, p.z, cn); p.x += cn.x * (m - d); p.y += cn.y * (m - d); p.z += cn.z * (m - d); } };
        const fxApply = (v, S, P, L, U) => {
          const cmr = v.camera, sk = !saved.shake ? 0 : Math.min(1.5, shake + fxQuakeAt(P));
          cmr.position.copy(P); cT.copy(L);
          if (sk > 0.003) {
            const tt = fxNow, n1 = Math.sin(tt * 41 + 1.3) * 0.6 + Math.sin(tt * 73 + 0.4) * 0.4, n2 = Math.sin(tt * 37 + 2.1) * 0.6 + Math.sin(tt * 67 + 4.2) * 0.4, n3 = Math.sin(tt * 53 + 0.7) * 0.7 + Math.sin(tt * 29 + 2.9) * 0.3;
            cR.crossVectors(L, U); if (cR.lengthSq() < 1e-6) cR.set(1, 0, 0); cR.normalize();
            cmr.position.addScaledVector(U, n1 * sk * 24).addScaledVector(cR, n2 * sk * 24);
            cT.addScaledVector(U, n3 * sk * 0.016).addScaledVector(cR, n1 * sk * 0.012).normalize();
          }
          cmr.up.copy(U);
          cT.multiplyScalar(1000).add(cmr.position); cmr.lookAt(cT);
        };
        const fxSC = { p: new THREE.Vector3(), l: new THREE.Vector3(), f: 50, k: '', t: 0 };
        const fxPV = new THREE.Vector3();
        const fxPodium = (v, S, dt) => {
          const cmr = v.camera, win = uiEnd.win, L = W.cars.filter(c => c.team === win), mv = uiEnd.mvp && uiEnd.mvp.team === win ? uiEnd.mvp : L[0], O = mv ? [mv, ...L.filter(c => c !== mv)] : L, X = [0, -250, 250], Y = [0, 110, 110], A = [0, 0.4, -0.4];
          O.forEach((c, i) => { placeCar(c, X[i] || 0, Y[i] || 0, -Math.PI / 2 + (A[i] || 0)); c.boost = 0; });
          for (const c of W.cars) if (c.team !== win) { placeCar(c, 0, 4200 + c.slot * 300, 0); c.demoT = 1e9; }
          fxSC.t += dt;
          if (!S.pf) S.pf = cmr.fov;
          if (cmr.fov !== 46) { cmr.fov = 46; cmr.updateProjectionMatrix(); }
          const pd0 = [300, 300, 440, 580][O.length] || 580; cmr.position.set(Math.sin(fxSC.t * 0.25) * 30, -pd0, 70 + pd0 * 0.12); cmr.up.set(0, 0, 1); cmr.lookAt(0, 70, 40);
          v.cam.p.copy(cmr.position); S.snap = true;
          const pd = endEl.querySelector('.pdn'); if (!pd) return;
          if (pd.childElementCount !== O.length) pd.innerHTML = O.map(c => `<div class="p${c.team}">${c === uiEnd.mvp ? '<i class="pmv">MVP</i>' : ''}<b>${esc(label(c))}</b></div>`).join('');
          cmr.updateMatrixWorld();
          O.forEach((c, i) => { const d = pd.children[i]; if (!d) return; fxPV.set(c.p.x, c.p.y, c.p.z + 62).project(cmr); d.style.left = ((fxPV.x + 1) * 50).toFixed(2) + '%'; d.style.top = ((1 - fxPV.y) * 50).toFixed(2) + '%'; });
        };
        const fxShowCam = (v, dt) => {
          const cmr = v.camera, kind = ui === 'title' ? 'title' : ui === 'menu' && uiFar() ? 'team' : ui === 'load' ? 'load' : ui === 'menu' && uiScr === 'garage' ? 'garage' : 'main', o = uiCamSpot(kind);
          fxSC.t += dt;
          const sway = kind === 'load' || kind === 'team' ? 0 : Math.sin(fxSC.t * 0.23) * (kind === 'title' ? 60 : 22);
          cP.set(o[0] + sway, o[1] + sway * 0.4, o[2]); cL.set(o[3], o[4], o[5]);
          const snap = uiCamSnap || !fxSC.k || (fxSC.k !== kind && (kind === 'title' || kind === 'load' || fxSC.k === 'title' || fxSC.k === 'load'));
          uiCamSnap = false; fxSC.k = kind;
          if (snap) { fxSC.p.copy(cP); fxSC.l.copy(cL); fxSC.f = o[6]; }
          else if (kind === 'load') { cT.copy(fxSC.l).sub(fxSC.p).normalize(); fxSC.p.addScaledVector(cT, dt * 38); }
          else { const k = 1 - Math.exp(-3.2 * dt); fxSC.p.lerp(cP, k); fxSC.l.lerp(cL, k); fxSC.f += (o[6] - fxSC.f) * k; }
          cmr.position.copy(fxSC.p); cmr.up.set(0, 0, 1); cmr.lookAt(fxSC.l);
          if (Math.abs(cmr.fov - fxSC.f) > 0.01) { cmr.fov = fxSC.f; cmr.updateProjectionMatrix(); }
          v.cam.p.copy(cmr.position);
        };
        const cameraUpdate = (v, dt) => {
          const cam = v.cam, cmr = v.camera, me = v.car, S = fxCS[v.i];
          if (fxRp.on && fxRp.show) { fxRpCam(v, S, dt); return; }
          if (ui === 'menu' || ui === 'title' || ui === 'load' || ui === 'lobby' || ui === 'wait') { fxShowCam(v, dt); S.snap = true; return; }
          if (ui === 'end' && uiEnd.on && uiEnd.pod > 0) { fxPodium(v, S, dt); return; }
          if (S.pf) { cmr.fov = S.pf; S.pf = 0; cmr.updateProjectionMatrix(); }
          if (!me || (W.state === 'end' && W.stateT > 3)) {
            cam.orbit += dt * 0.05;
            const a = cam.orbit + v.i * Math.PI;
            cmr.position.set(Math.sin(a) * 3300, -Math.cos(a) * 4300, 1150);
            cmr.up.set(0, 0, 1); cmr.lookAt(0, 0, 120);
            cam.p.copy(cmr.position); S.snap = true;
            return;
          }
          const B = W.ball, P = me.p, l = me.l;
          if (!S.kc) S.kc = makeCSCam(Object.assign({ fov: CFG.cam.fov, dist: CFG.cam.dist, height: CFG.cam.height, angle: CFG.cam.angle, stiff: CFG.cam.stiff, trans: CFG.cam.trans }, CFG.camK));
          if (S.car !== me || S.snap) { S.car = me; S.snap = false; S.kc.reset(); }
          const I = S.kin || (S.kin = { set: {}, car: [0, 0, 0], F: [0, 0, 0], U: [0, 0, 0], R: [0, 0, 0], ball: [0, 0, 0], normal: [0, 0, 0], vel: [0, 0, 0] });
          const k3 = (o, x, y, z) => { o[0] = x; o[1] = z; o[2] = -y; return o; };
          k3(I.car, P.x, P.y, P.z); k3(I.F, me.f.x, me.f.y, me.f.z); k3(I.U, me.u.x, me.u.y, me.u.z); k3(I.R, -l.x, -l.y, -l.z);
          k3(I.ball, B.p.x, B.p.y, B.p.z); k3(I.normal, me.n.x, me.n.y, me.n.z); k3(I.vel, me.v.x, me.v.y, me.v.z);
          Object.assign(I.set, { fov: fxCam.fov, dist: fxCam.dist, height: fxCam.height, angle: fxCam.angle, stiff: fxCam.stiff, trans: fxCam.trans, swivel: fxCam.swivel, invert: CFG.cam.invert });
          I.dt = dt; I.ballCam = !!v.camBall && !B.hidden; I.onGround = me.onGround; I.sup = me.sup; I.aspect = cmr.aspect; I.lookX = v.lookX || 0; I.lookY = v.lookY || 0; I.rear = !!v.rear;
          const o = S.kc.step(I);
          cP.set(o.p[0], -o.p[2], o.p[1]); cL.set(o.dir[0], -o.dir[2], o.dir[1]); cU.set(o.up[0], -o.up[2], o.up[1]);
          cam.p.copy(cP); cam.look.copy(cL); cam.up.copy(cU); cam.dir.set(cL.x, cL.y, 0); if (cam.dir.lengthSq() < 1e-8) cam.dir.set(me.f.x, me.f.y, 0); cam.dir.normalize();
          if (Math.abs(cmr.fov - o.fov) > 0.001) { cmr.fov = o.fov; cmr.updateProjectionMatrix(); }
          fxApply(v, S, cP, cL, cU);
        };


        const fxSpawnFx = c => {
          if (!c || c.demoT > 0) return;
          for (let i = 0; i < 50; i++) { const a = Math.random() * TAU, sp = 300 + Math.random() * 800, k = Math.random(); fxSpark.emit(c.p.x + Math.cos(a) * 30, c.p.y + Math.sin(a) * 30, c.p.z - 12, Math.cos(a) * sp, Math.sin(a) * sp, 60 + Math.random() * 220, 0.3 + Math.random() * 0.35, 1, 0.66 + k * 0.2, 0.22 + k * 0.15, 2 + Math.random() * 2, 0.07, 700, 2.5); }
        };
        const FX_RPE = new Set(['touch', 'bounce', 'demo', 'bump', 'goal', 'pad', 'jump', 'djump', 'dodge', 'land', 'respawn']);
        const fxEvent = (e, rp) => {
          switch (e.type) {
            case 'touch': {
              const B = W.ball.p, a = att(B), c = e.car, v = e.v;
              fxBallSnd(v, a, fxPan(B));
              if (c) fxHit(B.x, B.y, B.z, c.p.x, c.p.y, c.p.z, v);
              if (!rp && v > 1400 && isLocal(c)) shake = Math.max(shake, 0.1 + Math.min(0.3, v / 10000));
              if (v > 2700) crowdSwell(0.085, 1.6, 0.35);
              break;
            }
            case 'bounce': {
              const B = W.ball.p, a = att(B); fxBounceSnd(e.v, a, fxPan(B));
              if (e.v > 1700) { sdfN(B.x, B.y, B.z, cn); fxDust(B.x - cn.x * BR, B.y - cn.y * BR, B.z - cn.z * BR, Math.min(9, 2 + (e.v / 700 | 0)), 0.7 + e.v / 5000, cn.x, cn.y, cn.z); }
              break;
            }
            case 'goal': {
              fxGoalBlast(e.p, e.team, e.scorer && e.scorer.cos ? e.scorer.cos.gx : 'classic'); fxGoal.on = true; fxGoal.p.set(e.p.x, e.p.y, e.p.z);
              if (typeof arGoalFlash === 'function') arGoalFlash(e.team);
              fxBoom(Math.max(0.6, att(e.p)), 2.1, 1, fxPan(e.p));
              if (rp) { crowdSwell(0.36, 3, 0.7); break; }
              fxHorn([155.56, 196, 233.08], 2.1, 0.07, 0.16); crowdSwell(0.5, 5.2, 0.85);
              shake = Math.max(shake, 0.25);
              fxRp.goal = e; fxRp.goalT = W.time; fxRp.slowD = W.cars.some(c => c.team !== e.team && c.demoT <= 0 && Math.hypot(c.p.x - e.p.x, c.p.y - e.p.y, c.p.z - e.p.z) < CFG.rules.slowDef);
              const kmh = Math.round(e.speed * 0.036);
              banner('GOAL!', (e.scorer ? label(e.scorer) + (e.assist ? ' · assist ' + label(e.assist) : '') : 'Own goal') + ' · ' + kmh + ' km/h', TEAMCSS[e.team], 2.9);
              feedMsg(e.scorer ? `${nm(e.scorer)} scored!` : `<i class="p${e.team}">${esc(TEAMN[e.team])}</i> scored!`);
              popMsg(e.scorer, 'GOAL +100'); popMsg(e.assist, 'ASSIST +50');
              break;
            }
            case 'tgoal': {
              fxGoalBlast(e.p, e.team, e.car && e.car.cos ? e.car.cos.gx : 'classic');
              if (typeof arGoalFlash === 'function') arGoalFlash(e.team);
              fxBoom(Math.max(0.6, att(e.p)), 2.1, 1, fxPan(e.p)); crowdSwell(0.4, 4, 0.8); shake = Math.max(shake, 0.2);
              banner(e.team === 0 ? 'GOAL!' : e.shot ? 'SCORED ON' : 'GOAL!', Math.round(e.speed * 0.036) + ' km/h', TEAMCSS[e.team], 1.6);
              break;
            }
            case 'tsave': fxOoh(); banner(e.epic ? 'EPIC SAVE!' : 'SAVE!', '', '#7cc8ff', 1.2); if (e.car) popMsg(e.car, e.epic ? 'EPIC SAVE' : 'SAVE'); break;
            case 'tshot': { const B = W.ball.p; fxFlash(B.x, B.y, B.z, 0xffe0a0, 120, 700, 0.3, 0.8); noise(0.35, 700, 0.08, 'bandpass', 0.9, 2600, 0, 0.3, fxPan(B)); tone(220, 0.25, 'sine', 0.05, 440); break; }
            case 'tball': { const B = W.ball.p; fxFlash(B.x, B.y, B.z, 0xdff0ff, 120, 520, 0.35, 0.8); for (let i = 0; i < 30; i++) { const d = fxDir(0, 0, 0, false); fire.emit(B.x + d.x * 100, B.y + d.y * 100, B.z + d.z * 100, -d.x * 220, -d.y * 220, -d.z * 220, 0.45, 0.7, 0.9, 1, 40, 6, 0, 1); } break; }
            case 'treset': { const c = e.car; if (c) fxFlash(c.p.x, c.p.y, c.p.z + 30, TEAMC[c.team], 120, 520, 0.45, 0.8); break; }
            case 'save': if (!rp && e.car) { feedMsg(`${nm(e.car)} saved it`); popMsg(e.car, 'SAVE +50'); } fxOoh(); break;
            case 'shot': if (!rp) popMsg(e.car, 'SHOT ON GOAL +20'); crowdSwell(0.09, 1.5, 0.35); break;
            case 'epicsave': fxOoh(); crowdSwell(0.24, 2.6, 0.6); break;
            case 'flipreset': if (isLocal(e.car)) { const c = e.car, x = c.p.x - c.u.x * 22, y = c.p.y - c.u.y * 22, z = c.p.z - c.u.z * 22; tone(1318.5, 0.12, 'sine', 0.04, 1975.5); tone(1975.5, 0.16, 'triangle', 0.025, 0, 0.06); fxFlash(x, y, z, 0xe8ff60, 40, 260, 0.2, 0.7); for (let i = 0; i < 46; i++) { const d = fxDir(-c.u.x * 0.6, -c.u.y * 0.6, -c.u.z * 0.6, false), sp = 500 + Math.random() * 900; fxSpark.emit(x, y, z, d.x * sp + c.v.x, d.y * sp + c.v.y, d.z * sp + c.v.z, 0.18 + Math.random() * 0.22, 0.8, 1, 0.15, 2 + Math.random() * 2.5, 0.06, 0, 4); } } break;
            case 'demo': {
              const a = att(e.p), pn = fxPan(e.p);
              fxDemoBlast(e.p, e.b ? e.b.team : 0);
              fxBoom(0.75 * a, 1.2, 0.85, pn); tone(380, 0.32, 'square', 0.028 * a, 150, 0, 0.2, pn); noise(0.28, 1700, 0.24 * a, 'bandpass', 0.7, 450, 0, 0.2, pn);
              if (rp) break;
              if (e.a && e.b) feedMsg(`${nm(e.a)} demolished ${nm(e.b)}`);
              popMsg(e.a, 'DEMOLITION +10');
              if (isLocal(e.b)) shake = Math.max(shake, 0.9); else if (isLocal(e.a)) shake = Math.max(shake, 0.3);
              break;
            }
            case 'bump': {
              if (!e.b) break;
              const a = att(e.b.p), pn = fxPan(e.b.p), s = clamp((e.v || 1000) / 2300, 0.2, 1);
              noise(0.16, 1300, 0.3 * a * s, 'bandpass', 0.8, 0, 0, 0.15, pn); tone(78, 0.18, 'sine', 0.24 * a * s, 40, 0, 0.1, pn); tone(430, 0.22, 'triangle', 0.045 * a * s, 290, 0, 0.25, pn);
              if (e.a) { const x = (e.a.p.x + e.b.p.x) / 2, y = (e.a.p.y + e.b.p.y) / 2, z = (e.a.p.z + e.b.p.z) / 2 + 20; for (let i = 0; i < 10; i++) { const d = fxDir(0, 0, 0.3, false), sp = 500 + Math.random() * 1200; fxSpark.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, 0.18 + Math.random() * 0.2, 1, 0.8, 0.45, 4, 0.035, 600, 2); } }
              if (!rp && (isLocal(e.a) || isLocal(e.b))) shake = Math.max(shake, 0.22 * s + 0.08);
              break;
            }
            case 'pad': {
              if (!e.pad) break;
              fxPadFx(e.pad.x, e.pad.y, e.pad.big);
              if (isLocal(e.car)) fxPadSnd(e.pad.big, 1); else { fxPp.x = e.pad.x; fxPp.y = e.pad.y; fxPp.z = 40; const a = att(fxPp); if (a > 0.6) fxPadSnd(e.pad.big, (a - 0.5) * 0.5); }
              break;
            }
            case 'jump': case 'djump': {
              const c = e.car; if (!c) break;
              if (e.type === 'jump' && c.p.z < 120) fxDust(c.p.x - c.u.x * 16, c.p.y - c.u.y * 16, c.p.z - c.u.z * 16, 5, 0.75, c.u.x, c.u.y, c.u.z);
              if (isLocal(c)) { const hi = e.type === 'djump' ? 1.3 : 1; noise(0.13, 900 * hi, 0.1, 'bandpass', 1.2, 380 * hi); tone(175 * hi, 0.12, 'sine', 0.08, 88 * hi); }
              break;
            }
            case 'dodge': {
              const c = e.car; if (!c) break;
              const a = isLocal(c) ? 1 : att(c.p) * 0.45, pn = fxPan(c.p), hl = Math.hypot(c.f.x, c.f.y) || 1, dx = c.fdx || 0, dy = c.fdy || 0, mv = dx || dy, wx = mv ? (c.f.x * dx + c.f.y * dy) / hl : 0, wy = mv ? (c.f.y * dx - c.f.x * dy) / hl : 0;
              noise(0.32, 1900, 0.12 * a, 'bandpass', 0.9, 420, 0, 0.2, pn); tone(260, 0.18, 'sine', 0.03 * a, 120, 0, 0.2, pn);
              fxFlash(c.p.x, c.p.y, c.p.z, 0xdff0ff, 60, 320, 0.16, 0.45); fxShock(c.p.x, c.p.y, c.p.z, 0xcfe6ff, 40, 280, 0.22, 0.22, false);
              for (let i = 0; i < 14; i++) {
                const r = Math.random() * TAU, sp = 500 + Math.random() * 500, vx = mv ? -wx * sp + Math.cos(r) * 160 : Math.cos(r) * sp, vy = mv ? -wy * sp + Math.sin(r) * 160 : Math.sin(r) * sp;
                fxSpark.emit(c.p.x + R() * 30, c.p.y + R() * 30, c.p.z + R() * 14, vx, vy, R() * 120, 0.14 + Math.random() * 0.14, 0.8, 0.9, 1, 3, 0.08, 0, 3);
              }
              break;
            }
            case 'land': {
              const c = e.car; if (!c) break;
              fxDust(c.p.x - c.u.x * 16, c.p.y - c.u.y * 16, c.p.z - c.u.z * 16, 8, 1, c.u.x, c.u.y, c.u.z);
              const a = isLocal(c) ? 1 : att(c.p) * 0.45; tone(96, 0.14, 'sine', 0.12 * a, 48); noise(0.1, 380, 0.08 * a);
              break;
            }
            case 'respawn': {
              const c = e.car; if (!c) break;
              fxTc.set(TEAMC[c.team]);
              for (let i = 0; i < 36; i++) { const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 60; fire.emit(c.p.x + Math.cos(a) * r, c.p.y + Math.sin(a) * r, c.p.z + Math.random() * 60, Math.cos(a) * 60, Math.sin(a) * 60, 200 + Math.random() * 300, 0.5 + Math.random() * 0.4, fxTc.r * 0.7 + 0.3, fxTc.g * 0.7 + 0.3, fxTc.b * 0.7 + 0.3, 50, 6, 0, 1.5); }
              fxFlash(c.p.x, c.p.y, c.p.z + 30, TEAMC[c.team], 120, 520, 0.45, 0.8); fxSpawnFx(c);
              if (isLocal(c)) { noise(0.45, 500, 0.06, 'bandpass', 1, 2600); tone(420, 0.35, 'sine', 0.03, 1000); }
              break;
            }
            case 'countdown':
              fxGoal.on = false;
              if (e.n === CFG.rules.countdown) { for (const S of fxCS) S.snap = true; for (const c of W.cars) fxSpawnFx(c); }
              banner(String(e.n), W.ot ? 'Overtime' : '', 'rgba(255,140,30,.85)', 1.05); fxBeep(false);
              break;
            case 'go': banner('GO!', '', 'rgba(255,170,60,.9)', 0.8); fxBeep(true); crowdSwell(0.12, 1.6, 0.35); fxRec.goT = W.time; break;
            case 'timeup': feedMsg('Time! Ball must hit the ground'); tone(880, 0.14, 'square', 0.03); break;
            case 'overtime': banner('OVERTIME', 'Next goal wins', '#ffd65a', 2.4); fxHorn([130.81, 164.81, 196], 1.5, 0.06); crowdSwell(0.3, 3, 0.6); break;
            case 'end': {
              const win = e.winner, mine = views[0].car;
              if (e.st) applyStats(e.st);
              uiWinner(win);
              fxHorn([116.54, 146.83, 174.61], 2.6, 0.07); crowdSwell(0.42, 5, 0.75);
              tone(!mine || mine.team === win ? 523 : 330, 0.5, 'triangle', 0.08, !mine || mine.team === win ? 1046 : 160, 0.5);
              let nb = false;
              if (!submitted && mode === 'cpu' && mine) { submitted = true; if (mine.st.score > 0) nb = api.submit(mine.st.score); }
              const w0 = W;
              api.timeout(() => { if (ui === 'play' && W === w0 && W.state === 'end') showEnd(nb); }, 3600);
              break;
            }
          }
        };
        const handleEvents = () => {
          for (const e of W.events) {
            uiEvent(e);
            fxEvent(e, false);
            if (!online && FX_RPE.has(e.type)) fxRecEv(e);
          }
          W.events.length = 0;
        };


        const crM4 = new THREE.Matrix4(), crV1 = new THREE.Vector3(), crV2 = new THREE.Vector3(), crV3 = new THREE.Vector3();
        const crTC = [[0.3, 0.56, 1], [1, 0.56, 0.22]], crTH = [0, 0, 0];
        let crClock = 0;
        const crSteerMax = (s, c) => {
          if (!c || !c.length) return 0.4;
          if (s <= c[0][0]) return c[0][1];
          for (let i = 1; i < c.length; i++) if (s <= c[i][0]) return c[i - 1][1] + (c[i][1] - c[i - 1][1]) * (s - c[i - 1][0]) / (c[i][0] - c[i - 1][0]);
          return c[c.length - 1][1];
        };
        const carVisuals = (dt, t) => {
          const d = Math.min(Math.max(dt || 0, 0), 0.05);
          crClock += d;
          for (const cv of carVis) {
            const c = cv.car;
            if (!c) continue;
            if (cv.body !== c.body) crSetBody(cv, c.body);
            crSync(cv);
            const S = cv.s, alive = c.demoT <= 0;
            cv.g.visible = alive;
            cv.sh.visible = alive && !sun.castShadow && !!c.onGround;
            cv.tag.visible = alive && ui === 'play';
            if (!alive) { for (const f of cv.fl) f.g.visible = false; for (const tr of cv.trails) { tr.n = 0; tr.m.visible = false; } S.reset = true; S.bt = 0; continue; }
            const fx = c.f.x, fy = c.f.y, fz = c.f.z, lx = c.l.x, ly = c.l.y, lz = c.l.z, ux = c.u.x, uy = c.u.y, uz = c.u.z, vx = c.v.x, vy = c.v.y, vz = c.v.z;
            crV1.set(fx, fy, fz); crV2.set(lx, ly, lz); crV3.set(ux, uy, uz);
            crM4.makeBasis(crV1, crV2, crV3); crM4.setPosition(c.p.x, c.p.y, c.p.z);
            cv.g.matrix.copy(crM4); cv.g.matrixWorldNeedsUpdate = true;
            const tp = Math.hypot(c.p.x - S.px, c.p.y - S.py, c.p.z - S.pz) > Math.hypot(vx, vy, vz) * d * 1.5 + 120;
            if (S.reset || tp || d <= 0) {
              S.vx = vx; S.vy = vy; S.vz = vz; S.gr = c.onGround; S.vu = vx * ux + vy * uy + vz * uz;
              if (S.reset || tp) { S.z = S.zv = S.pi = S.pv = S.ro = S.rv = S.ap = S.apv = S.ar = S.arv = 0; S.sw.fill(0); for (const tr of cv.trails) tr.n = 0; }
              S.reset = false;
            }
            const id = d > 0 ? 1 / d : 0, ax = (vx - S.vx) * id, ay = (vy - S.vy) * id, az = (vz - S.vz) * id;
            S.vx = vx; S.vy = vy; S.vz = vz; S.px = c.p.x; S.py = c.p.y; S.pz = c.p.z;
            const gnd = c.onGround, aF = Math.max(-4000, Math.min(4000, ax * fx + ay * fy + az * fz)), aL = Math.max(-4000, Math.min(4000, ax * lx + ay * ly + az * lz));
            const yr = c.w ? c.w.x * ux + c.w.y * uy + c.w.z * uz : 0;
            const tP = gnd ? Math.max(-0.05, Math.min(0.06, -aF * 1.7e-5)) : 0, tR = gnd ? Math.max(-0.065, Math.min(0.065, aL * 1.3e-5 + (c.slide || 0) * Math.sign(yr) * 0.035)) : 0;
            S.pv += ((tP - S.pi) * 130 - S.pv * 13) * d; S.pi += S.pv * d;
            S.rv += ((tR - S.ro) * 130 - S.rv * 13) * d; S.ro += S.rv * d;
            const vu = vx * ux + vy * uy + vz * uz;
            if (gnd && !S.gr) S.zv -= Math.min(150, Math.max(0, -S.vu) * 0.1);
            if (!gnd && S.gr) S.zv += 22;
            S.gr = gnd; S.vu = vu;
            S.zv += (-S.z * 260 - S.zv * 15) * d; S.z = Math.max(-5, Math.min(3.5, S.z + S.zv * d));
            cv.bg.position.z = S.z; cv.bg.rotation.set(S.ro, S.pi, 0);
            if (cv.ant) {
              const tA = Math.max(-0.3, Math.min(0.3, -aF * 5e-5)) - Math.min(0.22, Math.hypot(vx, vy, vz) * 9e-5), tB = Math.max(-0.3, Math.min(0.3, aL * 5e-5));
              S.apv = (S.apv || 0) + ((tA - (S.ap || 0)) * 110 - (S.apv || 0) * 5) * d; S.ap = Math.max(-0.5, Math.min(0.5, (S.ap || 0) + S.apv * d));
              S.arv = (S.arv || 0) + ((tB - (S.ar || 0)) * 110 - (S.arv || 0) * 5) * d; S.ar = Math.max(-0.5, Math.min(0.5, (S.ar || 0) + S.arv * d));
              cv.ant.rotation.set(S.ar, S.ap, 0);
            }
            const th = c.ctl ? c.ctl.throttle || 0 : 0;
            if (gnd) S.ws = c.fs || 0; else S.ws += (th * 2300 - S.ws) * Math.min(1, d * (th ? 2.5 : 0.5));
            S.af = (S.af + S.ws * d / cv.rf) % TAU; S.ab = (S.ab + S.ws * d / cv.rb) % TAU;
            const as = Math.abs(c.fs || 0), sm = crSteerMax(as, CFG.steer), sl = c.slide || 0;
            S.sa += (-(c.ctl ? c.ctl.steer || 0 : 0) * (sm + (CFG.slideSteer ? crSteerMax(as, CFG.slideSteer) - sm : 0) * sl) - S.sa) * Math.min(1, d * 14);
            S.wd += ((gnd ? 0 : 3.2) - S.wd) * Math.min(1, d * (gnd ? 25 : 6));
            const sus = c.cfg && c.wz && c.wz.length === 4;
            for (let i = 0; i < cv.wheels.length; i++) {
              const wh = cv.wheels[i];
              wh.spin.rotation.y = wh.front ? S.af : S.ab; if (wh.front) wh.piv.rotation.z = S.sa;
              if (sus && i < 4) { const wd = c.cfg.wh[i], tg = Math.max(-6, Math.min(6, (wd.rest - wd.z + c.wz[i]) * 0.5)); S.sw[i] += (tg - S.sw[i]) * Math.min(1, d * (tg > S.sw[i] ? 34 : 13)); wh.piv.position.z = wh.z + S.sw[i]; }
              else wh.piv.position.z = wh.z - S.wd;
            }
            S.bt += ((c.boosting ? 1 : 0) - S.bt) * Math.min(1, d * (c.boosting ? 18 : 10));
            for (const f of cv.fl) {
              f.g.visible = true; f.o.visible = f.c.visible = S.bt > 0.04;
              const k = Math.max(S.bt, 0.09), r = f.r, q = 0.88 + Math.random() * 0.24, w = 0.55 + 0.45 * Math.min(1, k * 3);
              f.o.scale.set(r * k * (10.5 + Math.random() * 2.5), r * 1.7 * q * w, r * 1.7 * q * w);
              f.c.scale.set(r * k * (5.2 + Math.random() * 1.4), r * 0.62 * q * w, r * 0.62 * q * w);
              f.s.scale.setScalar(r * (0.8 + k * (6.5 + Math.random() * 2)));
            }
            if (c.boosting) {
              const BC = crBoostCol(c), fc = [BC.a, BC.b], bs = cv.bs || {};
              S.ea += d * 200; S.es += d * (bs.dense ? 110 : 95);
              while (S.ea >= 1) {
                S.ea -= 1;
                for (const f of cv.fl) {
                  const b = Math.random() * d, ex = c.p.x + fx * f.x + lx * f.y + ux * (f.z + S.z) - vx * b, ey = c.p.y + fy * f.x + ly * f.y + uy * (f.z + S.z) - vy * b, ez = c.p.z + fz * f.x + lz * f.y + uz * (f.z + S.z) - vz * b;
                  const cc = Math.random() < 0.35 ? fc[1] : fc[0], sp = 380 + Math.random() * 300;
                  fire.emit(ex + R() * 2.5, ey + R() * 2.5, ez + R() * 2.5, vx * 0.25 - fx * sp + R() * 70, vy * 0.25 - fy * sp + R() * 70, vz * 0.25 - fz * sp + R() * 70, 0.07 + Math.random() * 0.07, cc[0] * 0.6, cc[1] * 0.6, cc[2] * 0.6, f.r * 4.2, f.r * 1.6, 0, 3);
                  if (bs.sp && Math.random() < 0.18 * bs.sp) fire.emit(ex, ey, ez, vx * 0.4 - fx * 260 + R() * 160, vy * 0.4 - fy * 260 + R() * 160, vz * 0.4 - fz * 260 + R() * 160 + 60, 0.5 + Math.random() * 0.5, fc[1][0], fc[1][1], fc[1][2], f.r * 1.3, f.r * 0.2, -120, 1.2);
                }
              }
              while (S.es >= 1) {
                S.es -= 1;
                const sm = BC.smoke;
                if (!sm) continue;
                for (const f of cv.fl) {
                  const b = Math.random() * d, ex = c.p.x + fx * (f.x - 14) + lx * f.y + ux * f.z - vx * b, ey = c.p.y + fy * (f.x - 14) + ly * f.y + uy * f.z - vy * b, ez = c.p.z + fz * (f.x - 14) + lz * f.y + uz * f.z - vz * b;
                  smoke.emit(ex + R() * 3, ey + R() * 3, ez + R() * 3, vx * 0.02 - fx * 30 + R() * 10, vy * 0.02 - fy * 30 + R() * 10, vz * 0.02 - fz * 30 + R() * 10, 0.5 + Math.random() * 0.2, sm[0], sm[1], sm[2], f.r * (bs.dense ? 4.6 : 3.8), f.r * 2.6, -6, 3);
                }
              }
            } else S.ea = S.es = 0;
            const TS = cv.ts || crCat.trail[0], tc = TS.c || (TS.glow ? cv.pcol || crTC[cv.team] : crTC[cv.team]), [tx, ty, tz] = cv.tr, pv = !!c.prevTrail, tw = 4.5 * (TS.w || 1), tj = TS.j || 0;
            for (let k = 0; k < 2; k++) {
              const tr = cv.trails[k], sy = k ? -ty : ty, N = tr.N;
              tr.head = (tr.head + 1) % N;
              const h = tr.head, jx = tj ? R() * tj * 9 : 0, jz = tj ? R() * tj * 9 : 0;
              tr.hx[h] = c.p.x + fx * tx + lx * (sy + jx) + ux * (tz + jz); tr.hy[h] = c.p.y + fy * tx + ly * (sy + jx) + uy * (tz + jz); tr.hz[h] = c.p.z + fz * tx + lz * (sy + jx) + uz * (tz + jz); tr.ht[h] = crClock; tr.hs[h] = c.sup || pv ? 1 : 0;
              if (tr.n < N) tr.n++;
              let any = false;
              for (let i = 0; i < N; i++) {
                const j = (h - Math.min(i, tr.n - 1) + N) % N, a = pv ? Math.pow(1 - i / N, 1.5) * 0.6 : tr.hs[j] * Math.pow(Math.max(0, 1 - (crClock - tr.ht[j]) / 0.11), 1.5) * 0.9, w = tw * (1 - 0.6 * i / N), o = i * 12;
                const X = pv ? tr.hx[h] - fx * i * 14 + (tj ? R() * tj * 6 : 0) : tr.hx[j], Y = pv ? tr.hy[h] - fy * i * 14 + (tj ? R() * tj * 6 : 0) : tr.hy[j], Z = pv ? tr.hz[h] - fz * i * 14 : tr.hz[j];
                if (a > 0.01) any = true;
                tr.pos[o] = X + lx * w * 0.55 + ux * 2.4; tr.pos[o + 1] = Y + ly * w * 0.55 + uy * 2.4; tr.pos[o + 2] = Z + lz * w * 0.55 + uz * 2.4;
                tr.pos[o + 3] = X - lx * w * 0.55 + ux * 2.4; tr.pos[o + 4] = Y - ly * w * 0.55 + uy * 2.4; tr.pos[o + 5] = Z - lz * w * 0.55 + uz * 2.4;
                tr.pos[o + 6] = X + lx * w; tr.pos[o + 7] = Y + ly * w; tr.pos[o + 8] = Z + lz * w;
                tr.pos[o + 9] = X - lx * w; tr.pos[o + 10] = Y - ly * w; tr.pos[o + 11] = Z - lz * w;
                const cc = TS.rb ? crHue((i / N + crClock * 0.5) % 1, crTH) : tc;
                for (let q = 0; q < 12; q += 3) { const wk = q < 6 ? 0.4 : 0; tr.col[o + q] = a * (cc[0] + (1 - cc[0]) * wk); tr.col[o + q + 1] = a * (cc[1] + (1 - cc[1]) * wk); tr.col[o + q + 2] = a * (cc[2] + (1 - cc[2]) * wk); }
              }
              tr.m.visible = any;
              if (any) { tr.g.attributes.position.needsUpdate = true; tr.g.attributes.color.needsUpdate = true; }
            }
            cv.tag.position.set(c.p.x, c.p.y, c.p.z + cv.tz);
          }
        };

        let arLW = null, arL0 = 0, arL1 = 0;
        const arSunV = new THREE.Vector3(), arSunP = new THREE.Vector3(), arSunQ = new THREE.Vector3();
        const worldVisuals = (dt, t) => {
          arBallTick(dt, t);
          if (W !== arLW) { arLW = W; arL0 = W.score[0]; arL1 = W.score[1]; }
          else {
            if (W.score[0] > arL0) arGoalFlash(0);
            if (W.score[1] > arL1) arGoalFlash(1);
            arL0 = W.score[0]; arL1 = W.score[1];
          }
          arPadTick(dt, t);
          arFlashTick(dt);
          arCrowdTick(dt, t);
          arScrTick();
          if (views[0] && views[0].camera) { views[0].camera.getWorldDirection(arSunV); const k = clamp((arSunV.dot(arSunD) - 0.2) / 0.8, 0, 1); arSunH.material.opacity = 0.18 + 0.6 * k * k; arRays.material.opacity = 0.03 + 0.12 * k;
            const cam = views[0].camera; arSunP.copy(arSunD).multiplyScalar(50000).project(cam);
            const on = k > 0 && arSunP.z < 1 && Math.abs(arSunP.x) < 1.2 && Math.abs(arSunP.y) < 1.2 && !(typeof fxQ === 'object' && fxQ.lv >= 3), e = on ? Math.max(0.4, 1 - Math.hypot(arSunP.x, arSunP.y) * 0.45) : 0;
            for (const fl of arFlare) { fl.sp.visible = on; if (!on) continue; arSunQ.set(arSunP.x * (1 - fl.f), arSunP.y * (1 - fl.f), 0.5).unproject(cam).sub(cam.position).normalize().multiplyScalar(1000).add(cam.position); fl.sp.position.copy(arSunQ); fl.sp.scale.set(fl.sz, fl.sz, 1); fl.sp.material.opacity = fl.o * e * k; }
          }
        };

        const fxVisuals = (dt, t) => {
          fxDebUpdate(dt); fxSk.update(dt); fire.update(dt); smoke.update(dt); fxSpark.update(dt); fxShkUpdate(dt); fxFlUpdate(dt);
          if (fxLt.t >= 0) { fxLt.t += dt; const k = fxLt.t / fxLt.d; if (k >= 1) { fxLt.t = -1; fxLight.intensity = 0; } else fxLight.intensity = fxLt.i * (1 - k) * (1 - k); }
          for (let i = fxQk.length - 1; i >= 0; i--) { fxQk[i].t += dt; if (fxQk[i].t >= fxQk[i].d) fxQk.splice(i, 1); }
          fxBoostFx(dt); fxWheelFx(dt);
        };
        const fxWheelFx = dt => {
          if (ui !== 'play' || W.state === 'menu' || dt <= 0 || fxQ.lv >= 3) return;
          for (let ci = 0; ci < W.cars.length; ci++) {
            const c = W.cars[ci];
            if (c.demoT > 0 || !c.onGround || !c.cfg || (fxRp.on && fxRp.show)) { fxSk.end(ci * 2); fxSk.end(ci * 2 + 1); continue; }
            const sp = vlen(c.v), slip = Math.abs(c.v.x * c.l.x + c.v.y * c.l.y + c.v.z * c.l.z), sl = c.slide || 0;
            const k = Math.max(sl > 0.2 ? clamp((slip - 150) / 600, 0, 1) * sl : 0, clamp((slip - 500) / 700, 0, 1), sp > 1250 ? 0.12 * clamp((sp - 1250) / 900, 0, 1) : 0);
            const mk = c.nw >= 3 && c.n.z > 0.97 && c.p.z < 40 ? Math.max(sl > 0.3 && sp > 350 ? 0.55 + 0.4 * sl : 0, clamp((slip - 800) / 800, 0, 1) * 0.7) : 0;
            for (let i = 2; i < 4; i++) {
              const kq = ci * 2 + i - 2;
              if (mk > 0) { const q = c.cfg.wh[i]; fxSk.add(kq, c.p.x + c.f.x * q.x + c.l.x * q.y, c.p.y + c.f.y * q.x + c.l.y * q.y, 1.4, mk * 0.6); } else fxSk.end(kq);
            }
            if (k <= 0) continue;
            for (let i = 2; i < 4; i++) {
              if (Math.random() > k * 34 * dt) continue;
              const q = c.cfg.wh[i], x = c.p.x + c.f.x * q.x + c.l.x * q.y - c.u.x * 14, y = c.p.y + c.f.y * q.x + c.l.y * q.y - c.u.y * 14, z = c.p.z + c.f.z * q.x + c.l.z * q.y - c.u.z * 14, g = 0.55 + Math.random() * 0.12;
              smoke.emit(x, y, z, c.v.x * 0.18 + R() * 40 + c.u.x * 60, c.v.y * 0.18 + R() * 40 + c.u.y * 60, c.v.z * 0.18 + R() * 40 + c.u.z * 60, 0.45 + Math.random() * 0.4, g, g, g * 0.92, 16 + 10 * k, 60 + 50 * k, -25, 2.6);
            }
          }
        };
        let fxWA = 0;
        const fxBoostFx = dt => {
          const c = views[0] && views[0].car;
          if (!c || c.demoT > 0 || ui !== 'play' || (fxRp.on && fxRp.show) || W.state === 'menu') return;
          const sp = vlen(c.v);
          if (!c.sup && sp < 1900) { fxWA = 0; return; }
          fxWA += dt * (c.sup ? 90 : 30) * clamp((sp - 1700) / 600, 0, 1);
          const cm = views[0].camera.position, ix = c.v.x / (sp || 1), iy = c.v.y / (sp || 1), iz = c.v.z / (sp || 1);
          while (fxWA >= 1) {
            fxWA -= 1;
            const d = fxDir(0, 0, 0, false), r = 140 + Math.random() * 260, ax = cm.x + ix * (260 + Math.random() * 500) + d.x * r, ay = cm.y + iy * (260 + Math.random() * 500) + d.y * r, az = cm.z + iz * 300 + d.z * r * 0.7;
            fxSpark.emit(ax, ay, az, c.v.x * 0.15 - ix * 1400, c.v.y * 0.15 - iy * 1400, c.v.z * 0.15 - iz * 1400, 0.16 + Math.random() * 0.08, 0.55, 0.62, 0.7, 1.4, 0.07, 0, 0);
          }
        };
        const visuals = (dt, t) => { carVisuals(dt, t); worldVisuals(dt, t); fxVisuals(dt, t); };


        const FX_SKIP = new Set(['id', 'team', 'slot', 'name', 'bot', 'body', 'st', 'bumpT', 'ai']);
        const fxSch = o => {
          const s = [];
          for (const k in o) {
            if (FX_SKIP.has(k)) continue;
            const x = o[k];
            if (typeof x === 'number') s.push([k, '', 0]);
            else if (typeof x === 'boolean') s.push([k, '', 1]);
            else if (k === 'wz' && Array.isArray(x)) for (let j = 0; j < x.length; j++) s.push([k, String(j), 0]);
            else if (x && typeof x === 'object' && !Array.isArray(x) && !ArrayBuffer.isView(x)) {
              if (typeof x.x === 'number' && typeof x.y === 'number' && typeof x.z === 'number') s.push([k, '', 2]);
              else if (k === 'ctl') for (const j in x) { if (typeof x[j] === 'number') s.push([k, j, 0]); else if (typeof x[j] === 'boolean') s.push([k, j, 1]); }
            }
          }
          return s;
        };
        const fxSz = s => { let n = 0; for (const e of s) n += e[2] === 2 ? 3 : 1; return n; };
        const fxPut = (o, s, a, off) => {
          for (let i = 0; i < s.length; i++) {
            const e = s[i], tg = e[1] ? o[e[0]] : o, x = tg ? tg[e[1] || e[0]] : undefined;
            if (e[2] === 2) { if (x) { a[off] = x.x; a[off + 1] = x.y; a[off + 2] = x.z; } else a[off] = a[off + 1] = a[off + 2] = 0; off += 3; }
            else a[off++] = e[2] === 1 ? (x ? 1 : 0) : +x || 0;
          }
          return off;
        };
        const fxL = (a, b, k) => a === b ? a : isFinite(a) && isFinite(b) ? a + (b - a) * k : k < 0.5 ? a : b;
        const fxSet = (o, s, a, oa, ob, k) => {
          for (let i = 0; i < s.length; i++) {
            const e = s[i], tg = e[1] ? o[e[0]] : o, key = e[1] || e[0];
            if (e[2] === 2) { const x = tg && tg[key]; if (x) { x.x = fxL(a[oa], a[ob], k); x.y = fxL(a[oa + 1], a[ob + 1], k); x.z = fxL(a[oa + 2], a[ob + 2], k); } oa += 3; ob += 3; }
            else { if (tg) tg[key] = e[2] === 1 ? (k < 0.5 ? a[oa] : a[ob]) > 0.5 : fxL(a[oa], a[ob], k); oa++; ob++; }
          }
        };
        const fxOrtho = c => {
          const f = c.f, u = c.u, l = c.l; if (!f || !u || !l) return;
          let n = Math.hypot(f.x, f.y, f.z) || 1; f.x /= n; f.y /= n; f.z /= n;
          l.x = u.y * f.z - u.z * f.y; l.y = u.z * f.x - u.x * f.z; l.z = u.x * f.y - u.y * f.x; n = Math.hypot(l.x, l.y, l.z) || 1; l.x /= n; l.y /= n; l.z /= n;
          u.x = f.y * l.z - f.z * l.y; u.y = f.z * l.x - f.x * l.z; u.z = f.x * l.y - f.y * l.x;
        };
        const fxRec = { W: null, cs: [], bs: [], cw: 0, bw: 0, nc: 0, np: 0, st: 0, cap: 1100, t: new Float64Array(1100), d: null, head: 0, n: 0, last: -1, goT: -1e9, ev: [], pi: -1 };
        const fxRecInit = () => {
          const R2 = fxRec;
          R2.W = W; R2.cs = W.cars.length ? fxSch(W.cars[0]) : []; R2.bs = fxSch(W.ball); R2.cw = fxSz(R2.cs); R2.bw = fxSz(R2.bs); R2.nc = W.cars.length; R2.np = W.pads.length;
          R2.st = R2.nc * R2.cw + R2.bw + 4 + R2.np;
          if (!R2.d || R2.d.length < R2.cap * R2.st) R2.d = new Float32Array(R2.cap * R2.st);
          R2.head = 0; R2.n = 0; R2.last = -1; R2.goT = -1e9; R2.ev.length = 0; R2.pi = -1;
          let o = 0; for (const e of R2.cs) { if (e[0] === 'p' && !e[1]) R2.pi = o; o += e[2] === 2 ? 3 : 1; }
          fxRp.goal = null; fxRp.goalT = -1; fxRp.done = -1;
        };
        const fxRecord = () => {
          if (online || ui !== 'play') return;
          const R2 = fxRec;
          if (R2.W !== W || R2.nc !== W.cars.length || R2.np !== W.pads.length || W.time < R2.last) fxRecInit();
          if (W.state === 'menu' || W.time - R2.last < 1 / 75) return;
          R2.last = W.time;
          const i = R2.head, d = R2.d; let o = i * R2.st;
          R2.t[i] = W.time;
          for (const c of W.cars) o = fxPut(c, R2.cs, d, o);
          o = fxPut(W.ball, R2.bs, d, o);
          const q = ballM.quaternion; d[o] = q.x; d[o + 1] = q.y; d[o + 2] = q.z; d[o + 3] = q.w; o += 4;
          for (const p of W.pads) d[o++] = p.t;
          R2.head = (i + 1) % R2.cap; if (R2.n < R2.cap) R2.n++;
        };
        const fxRecEv = e => {
          const ev = fxRec.ev; ev.push({ t: W.time, e });
          while (ev.length > 360 || (ev.length && W.time - ev[0].t > 12)) ev.shift();
        };
        const fxRq = new THREE.Quaternion(), fxRq2 = new THREE.Quaternion();
        const fxRp = { on: false, show: false, W: null, ph: 0, pt: 0, t: 0, t0: 0, t1: 0, ei: 0, cur: 0, goal: null, goalT: -1, done: -1, live: null, skip: false, scorer: null };
        const fxBin = (() => { const r = rngOf(7), o = []; for (let i = 0; i < 4; i++) { let s = ''; for (let j = 0; j < 22; j++) s += r() < 0.3 ? ' ' : r() < 0.5 ? '0' : '1'; o.push(s); } return o.join('\n'); })();
        const fxRpEls = views.map(v => { const d = el('div', 'fxrp', v.el, `<div class="fxl"><i></i>Replay</div><div class="fxc"><small>Scored by</small><div class="fxcd"><span class="fxav"></span><b></b><i class="fxbin">${fxBin}</i></div><div class="fxs"><span>${uiIC.clock}<b class="fxt"></b></span><span>${uiIC.ballk}<b class="fxv"></b><small>MPH</small></span></div></div><div class="fxk"><div>${coarse ? 'Tap to skip' : 'Press <kbd>' + (v.i ? 'Enter' : 'Space') + '</kbd> to skip'}</div><div class="fxn"></div></div><div class="fxw"><i></i><i></i><i></i>${uiShield}</div>`); return { d, w: d.querySelector('.fxw'), av: d.querySelector('.fxav'), nm: d.querySelector('.fxcd b'), t: d.querySelector('.fxt'), sp: d.querySelector('.fxv'), n: d.querySelector('.fxn'), lb: d.querySelector('.fxc>small') }; });
        const fxWipe = () => { for (const x of fxRpEls) { x.w.classList.remove('fxgo'); void x.w.offsetWidth; x.w.classList.add('fxgo'); } };
        const fxSnap = buf => {
          const R2 = fxRec; let o = 0;
          for (const c of W.cars) o = fxPut(c, R2.cs, buf, o);
          o = fxPut(W.ball, R2.bs, buf, o);
          const q = ballM.quaternion; buf[o] = q.x; buf[o + 1] = q.y; buf[o + 2] = q.z; buf[o + 3] = q.w; o += 4;
          for (const p of W.pads) buf[o++] = p.t;
        };
        const fxUnsnap = buf => {
          const R2 = fxRec; let o = 0;
          for (const c of W.cars) { fxSet(c, R2.cs, buf, o, o, 0); o += R2.cw; }
          fxSet(W.ball, R2.bs, buf, o, o, 0); o += R2.bw;
          ballM.quaternion.set(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]); o += 4;
          for (const p of W.pads) p.t = buf[o++];
        };
        const fxRpApply = rt => {
          const R2 = fxRec, n = R2.n, cap = R2.cap, base = R2.head - n + cap, d = R2.d;
          let j = fxRp.cur;
          while (j < n - 2 && R2.t[(base + j + 1) % cap] <= rt) j++;
          while (j > 0 && R2.t[(base + j) % cap] > rt) j--;
          fxRp.cur = j;
          const ia = (base + j) % cap, ib = (base + Math.min(j + 1, n - 1)) % cap, ta = R2.t[ia], tb = R2.t[ib];
          const k = tb > ta ? clamp((rt - ta) / (tb - ta), 0, 1) : 0;
          let oa = ia * R2.st, ob = ib * R2.st;
          for (const c of W.cars) {
            let kk = k;
            if (R2.pi >= 0) { const pa = oa + R2.pi, pb = ob + R2.pi; if (Math.abs(d[pa] - d[pb]) + Math.abs(d[pa + 1] - d[pb + 1]) + Math.abs(d[pa + 2] - d[pb + 2]) > 400) kk = k < 0.5 ? 0 : 1; }
            fxSet(c, R2.cs, d, oa, ob, kk); fxOrtho(c);
            oa += R2.cw; ob += R2.cw;
          }
          fxSet(W.ball, R2.bs, d, oa, ob, k); oa += R2.bw; ob += R2.bw;
          fxRq.set(d[oa], d[oa + 1], d[oa + 2], d[oa + 3]); fxRq2.set(d[ob], d[ob + 1], d[ob + 2], d[ob + 3]); fxRq.slerp(fxRq2, k); oa += 4; ob += 4;
          for (let i = 0; i < W.pads.length; i++) W.pads[i].t = d[ob + i];
        };
        const fxRpEvents = (a, b) => { const ev = fxRec.ev; while (fxRp.ei < ev.length && ev[fxRp.ei].t <= b) { const x = ev[fxRp.ei++]; if (x.t > a) fxEvent(x.e, true); } };
        const fxRpShow = on => {
          const Rp = fxRp;
          if (on) { if (!Rp.live || Rp.live.length !== fxRec.st) Rp.live = new Float64Array(fxRec.st); fxSnap(Rp.live); }
          else if (Rp.W === W) fxUnsnap(Rp.live);
          Rp.show = on;
          fxClear(); bindCars();
          wrap.classList.toggle('fxrep', on);
          for (const x of fxRpEls) x.d.classList.toggle('fxon', on);
          for (const v of views) {
            const S = fxCS[v.i];
            if (on) { S.fov0 = v.camera.fov; S.rs = -1; }
            else { if (S.fov0) { v.camera.fov = S.fov0; v.camera.updateProjectionMatrix(); } S.fov0 = 0; S.snap = true; v.latch = false; }
          }
        };
        const fxRpBegin = () => {
          const R2 = fxRec, g = fxRp.goal, Rp = fxRp;
          Rp.done = Rp.goalT;
          if (R2.n < 20 || R2.W !== W) return;
          const cap = R2.cap, first = R2.t[(R2.head - R2.n + cap) % cap], last = R2.t[(R2.head - 1 + cap) % cap];
          const R = CFG.rules; let tt = -Infinity;
          for (const h of W.touchHist) if (h.c.team === g.team && h.t <= Rp.goalT && h.t > tt) tt = h.t;
          const t0 = Math.max(Rp.goalT - R.replayMax, first, R2.goT, Math.min(tt, Rp.goalT - R.replayPre) - R.replayLead), t1 = Math.min(Rp.goalT + R.aftermath, last);
          if (t1 - t0 < 1.2) return;
          Rp.slowT = tt;
          Rp.on = true; Rp.show = false; Rp.W = W; Rp.ph = 0; Rp.pt = 0; Rp.t = t0; Rp.t0 = t0; Rp.t1 = t1; Rp.cur = 0; Rp.skip = false; Rp.scorer = g.scorer || W.lastTouch || null;
          Rp.ei = 0; while (Rp.ei < R2.ev.length && R2.ev[Rp.ei].t <= t0) Rp.ei++;
          const sc = g.scorer, who = sc ? sc.name : TEAMN[g.team];
          const tc = g.team ? ['#ff8a2a', '#9a3a08'] : ['#3f8cff', '#123a8c'];
          for (const x of fxRpEls) {
            x.av.innerHTML = sc && sc.bot ? '<i class="fxai">AI</i>' : uiAv(sc, g.team); x.nm.textContent = who; x.t.textContent = g.clk || ''; x.sp.textContent = Math.round(g.speed * 0.02237); x.lb.textContent = sc ? 'Scored by' : 'Own goal';
            x.n.innerHTML = (g.assist ? `<i class="p${g.assist.team}">${esc(g.assist.name)}</i>, ` : '') + esc(who);
            x.d.classList.toggle('t1', g.team === 1); x.d.style.setProperty('--tc', tc[0]); x.d.style.setProperty('--td', tc[1]);
          }
          fxWipe(); noise(0.5, 300, 0.07, 'bandpass', 0.8, 2600, 0, 0.2); tone(150, 0.5, 'sine', 0.06, 640, 0, 0.2);
        };
        const fxRpWant = () => !!fxRp.goal && fxRp.done !== fxRp.goalT && W.state === 'goal' && W.stateT >= CFG.rules.goalT - 1e-6;
        const fxRpCheck = () => {
          if (!fxRpWant()) return;
          if (online || mode === 'online' || ui !== 'play' || fxRec.W !== W) { fxRp.done = fxRp.goalT; return; }
          fxRpBegin();
        };
        const fxRpRate = t => { const R = CFG.rules, s = fxRp.slowT, g = fxRp.goalT; return (t > s - R.slowPre && t < s + R.slowPost) || (fxRp.slowD && t > g - R.slowPre && t < g) ? R.slowRate : 1; };
        const fxRpTick = dt => {
          const Rp = fxRp;
          Rp.pt += dt;
          if (Rp.ph === 0) { if (Rp.pt >= 0.3) { fxRpShow(true); Rp.ph = 1; Rp.pt = 0; fxRpApply(Rp.t); } return; }
          if (Rp.ph === 1) {
            const a = Rp.t; Rp.t = Math.min(Rp.t1, Rp.t + dt * fxRpRate(Rp.t));
            fxRpApply(Rp.t); fxRpEvents(a, Rp.t);
            if (Rp.t >= Rp.t1 || Rp.skip) { Rp.ph = 2; Rp.pt = 0; fxWipe(); noise(0.45, 2400, 0.06, 'bandpass', 0.8, 300, 0, 0.2); tone(640, 0.45, 'sine', 0.05, 140, 0, 0.2); }
            return;
          }
          if (Rp.show) {
            if (!Rp.skip) { const a = Rp.t; Rp.t = Math.min(Rp.t1, Rp.t + dt); fxRpApply(Rp.t); fxRpEvents(a, Rp.t); }
            if (Rp.pt >= 0.3) fxRpShow(false);
          } else if (Rp.pt >= 0.65) Rp.on = false;
        };
        const fxRpPost = () => { if (fxRp.show) ballM.quaternion.copy(fxRq); };
        const fxRpAbort = () => {
          if (fxRp.show) fxRpShow(false);
          fxRp.on = false; fxRp.show = false;
          for (const x of fxRpEls) { x.d.classList.remove('fxon'); x.w.classList.remove('fxgo'); }
          wrap.classList.remove('fxrep');
        };
        const fxSkip = () => { if (fxRp.on && fxRp.ph === 1 && fxRp.show && fxRp.t - fxRp.t0 > 0.2) fxRp.skip = true; };
        api.on(window, 'keydown', e => { if (fxRp.on && !paused && !e.repeat && /^(Space|Enter|NumpadEnter|KeyO)$/.test(e.code)) { fxSkip(); for (const v of views) v.latch = false; } });
        api.on(wrap, 'pointerdown', e => { if (fxRp.on && !paused && !(e.target && e.target.closest && e.target.closest('.pb,.cb'))) { fxSkip(); for (const v of views) v.latch = false; } });
        const fxRpCam = (v, S, dt) => {
          const cmr = v.camera, Rp = fxRp, B = W.ball, F = S.rp, u = Rp.goal && Rp.goal.p.y > 0 ? 1 : -1, am = Rp.t > Rp.goalT, d = Rp.ph === 1 && !am && fxRpRate(Rp.t) < 1 ? 0.25 : 1, rs = S.rs < 0;
          if (rs) { S.rs = 0; S.rsm = S.rft = 0; S.rpf = null; }
          S.rsm = clamp(S.rsm + (d < 1 ? dt : -dt), 0, 1);
          let fc = null;
          for (const h of W.touchHist) if (h.t >= Rp.t && h.t <= Rp.slowT) { fc = h.c; break; }
          if (fc && fc !== S.rpf) S.rft = 0;
          S.rpf = fc; S.rft += dt * d;
          cP.set(B.p.x + B.v.x * 0.3 * d, B.p.y + B.v.y * 0.3 * d, B.p.z + B.v.z * 0.1 * d);
          if (fc) {
            cL.set(fc.p.x + fc.v.x * 0.3 * d, fc.p.y + fc.v.y * 0.3 * d, fc.p.z + fc.v.z * 0.1 * d);
            const z = cL.z + (cP.z - cL.z) * 0.35;
            cL.lerp(cP, (1 - clamp(cL.distanceTo(cP) / 1800, 0, 1)) * 0.5); cL.z = z;
          } else cL.copy(cP);
          if (rs) F.copy(cL);
          if (am) F.lerp(cT.set(0, 0, 500), Math.min(dt, 1));
          else F.lerp(cL, Math.min((0.1 + 3.9 * Math.min(S.rft, 1)) * dt, 1));
          const gy = u * 5120, m = clamp((gy - F.y) * u / 9000, 0, 1);
          cP.set(4000 * m * m, gy - u * 9000, 1000);
          const r = Math.min(1800 + 1000 * S.rsm, cP.distanceTo(F));
          cA.copy(F).sub(cP).normalize(); cP.copy(F).addScaledVector(cA, -r);
          const fov = Math.min(120, 2 * Math.atan(Math.tan((75 - 50 * S.rsm) * Math.PI / 360) / cmr.aspect) * 180 / Math.PI);
          if (cmr.fov !== fov) { cmr.fov = fov; cmr.updateProjectionMatrix(); }
          fxApply(v, S, cP, cA, fxW);
        };


        const uiTrHud = v => {
          const T = W.train, L = uiTrSpawns();
          if (!T) return;
          const key = [T.goals | 0, T.saves | 0, T.shotsTaken | 0, T.unlimited, T.shots, T.spawn, coarse].join('|');
          if (key === v.trKey) return;
          v.trKey = key;
          const tg = on => `<i class="${on ? 'on' : ''}">${on ? 'On' : 'Off'}</i>`;
          v.trn.innerHTML = `<div class="trp"><b>Free Play</b><span>Goals<em>${T.goals | 0}</em></span><span>Saves<em>${T.saves | 0}</em></span><span>Shots<em>${T.shotsTaken | 0}</em></span></div>${coarse ? '' : `<div class="trk"><div>${uiK('R')}Reset Ball</div><div>${uiK('T')}Reset Car</div><div>${uiK('G')}Shoot Ball At Me</div><div>${uiK('B')}Unlimited Boost ${tg(T.unlimited)}</div><div>${uiK('P')}Shot Practice ${tg(T.shots)}</div><div>${uiK('1 – ' + L.length)}Ball Spawn <i class="on">${esc(uiTrSN(T.spawn))}</i></div><div>${uiK('Esc', 'kb')}Free Play Menu</div></div>`}`;
        };
        const hudUpdate = dt => {
          uiPadTick(dt);
          for (const v of views) {
            if (v.banDur && !v.ban.hidden) { v.banT += dt; if (v.banT > v.banDur) v.ban.hidden = true; }
            if (v.qcCat >= 0) { v.qcT += dt; if (v.qcT > (v.qcCat === 4 ? 6 : 4) || ui !== 'play') uiQcClose(v); }
          }
          if (ui === 'menu' && uiScr === 'garage') {
            const k = Math.min(1, dt * 5), tz = uiGc === 'gx' ? 2.1 : 1, ta = uiGarAT + (uiGc === 'boost' || uiGc === 'trail' || (uiPv && (uiPv.k === 'boost' || uiPv.k === 'trail')) ? 2.5 : 0);
            uiGarA += (ta - uiGarA) * k; uiGarZ += (tz - uiGarZ) * k;
          } else if (ui !== 'menu') { uiGarA = uiGarAT = 0; uiGarZ = 1; }
          if (ui === 'end') uiEndTick(dt);
          if (ui === 'load') { uiLoadT += Math.min(dt, 0.1); if (uiLoadT > (mode === 'train' ? 1.1 : 1.6)) beginPlay(); }
          if (ui === 'play' && !paused) uiPT += Math.min(dt, 0.1);
          if (ui === 'play' && mode !== 'train' && W.state === 'play' && !W.ot && W.clock > 0 && W.clock <= 10) { const n = Math.ceil(W.clock); if (n !== uiCdN) { uiCdN = n; banner(String(n), '', null, 0.95); } } else if (uiCdN && (W.clock > 10 || W.state !== 'play')) uiCdN = 0;
          if (ui !== 'play' && ui !== 'end' && ui !== 'left') return;
          const tr = mode === 'train';
          const clk = W.ot ? '+' + mmss(W.otT) : mmss(Math.ceil(W.clock));
          const gm = ui === 'play' && !tr && W.state === 'countdown' && W.clock >= W.len - 0.01 && !W.ot;
          const B = W.ball, aw = saved.ifx.arw && ui === 'play' && !paused && !B.hidden && (W.state === 'play' || W.state === 'countdown') && !(fxRp.on && fxRp.show);
          for (const v of active()) {
            if (v.gmc && v.gmc.hidden === gm) v.gmc.hidden = !gm;
            if (v.barw) {
              let sh = false;
              if (aw) {
                const cm = v.camera; cm.updateMatrixWorld(); uiBV.set(B.p.x, B.p.y, B.p.z).project(cm);
                let x = uiBV.x, y = uiBV.y; const bh = uiBV.z > 1;
                if (bh) { x = -x; y = -Math.abs(y) - 1; }
                if (bh || Math.abs(x) > 0.98 || Math.abs(y) > 0.98) {
                  const m = Math.max(Math.abs(x), Math.abs(y)) || 1, k = 0.9 / m;
                  v.barw.style.left = ((x * k + 1) * 50).toFixed(2) + '%'; v.barw.style.top = ((1 - y * k) * 50).toFixed(2) + '%';
                  v.barw.style.transform = 'translate(-50%,-50%) rotate(' + (-Math.atan2(y, x)).toFixed(3) + 'rad)'; sh = true;
                }
              }
              if (v.barw.hidden === sh) v.barw.hidden = !sh;
            }
            const me = v.car, L = me ? me.team : 0, bo = me ? clamp(Math.floor(me.boost), 0, 100) : 0;
            if (tr) { if (!v.sb.hidden) v.sb.hidden = true; if (ui === 'play') uiTrHud(v); }
            else {
              const key = W.score[0] + '|' + W.score[1] + '|' + clk + '|' + L + '|' + W.ot + '|' + saved.ifx.tbm;
              if (key !== v.key) {
                v.key = key;
                v.sbL.className = 'sq c' + L; v.sbR.className = 'sq r c' + (1 - L); v.bd.classList.toggle('b', saved.ifx.tbm && L === 0); v.bd.classList.toggle('n', !saved.ifx.tbm);
                uiDig(v.sbLd, W.score[L]); uiDig(v.sbRd, W.score[1 - L]); uiDig(v.sbCd, clk);
                v.sbC.classList.toggle('ot', W.ot); v.sbC.classList.toggle('otn', W.ot && W.otT < 3);
              }
            }
            if (tr && v.key !== 'tr') { v.key = 'tr'; v.bd.classList.remove('b'); v.bd.classList.add('n'); }
            if (bo !== v.bkey) { if (bo - (v.bkey || 0) >= 8 && v.bkey !== undefined) { v.bd.classList.remove('pk'); void v.bd.offsetWidth; v.bd.classList.add('pk'); } v.bkey = bo; uiDig(v.bdNum, bo); uiBT(v, bo); v.bd.classList.toggle('full', bo >= 100); }
            if (me && !!me.boosting !== v.bbo) { v.bbo = !!me.boosting; v.bd.classList.toggle('on', v.bbo); }
            if (me) {
              const dm = me.demoT > 0 && me.demoT < 100 ? Math.ceil(me.demoT) : 0, sk = dm ? 'd' + dm : '';
              if (sk !== v.ssKey) {
                v.ssKey = sk; v.ss.className = 'ss' + (sk === 'tu' ? ' tu' : '');
                v.ss.innerHTML = dm ? `<b>Demolished</b><small>Respawn in ${dm}</small>` : sk ? '<small>0:00 · Ball must hit the ground</small>' : '';
              }
            }
          }
          if (uiTabOn) { uiTabT -= dt; if (uiTabT <= 0) { uiTabT = 0.25; uiTabRender(); } }
          const me = views[0].car;
          if (me && !tr) { const pts = me.st.score; if (pts !== lastPts) { lastPts = pts; api.score(pts); } }
          if (online && !online.left) { const pt = 'PING ' + (api.net.rtt || 0) + ' MS'; if (views[0].ping.textContent !== pt) views[0].ping.textContent = pt; }
        };
        let fxMissT = 0, fxSputT = 0;
        const soundUpdate = () => {
          if (!AC || !fxEngV.length) return;
          const t = AC.currentTime, on = (ui === 'play' || ui === 'end') && !paused && !api.muted, vs = views;
          master.gain.setTargetAtTime(api.muted || saved.mute ? 0 : (paused ? 0.3 : 0.85) * saved.vol / 85, t, 0.05);
          let bst = 0, sup = 0, wsp = 0, tyr = 0, sqq = 0, sqf = 0;
          for (let i = 0; i < 1; i++) {
            const E = fxEngV[i], v = vs[i], c = v && v.car;
            const live = !!(on && c && c.demoT <= 0 && W.state !== 'menu' && W.state !== 'end' && (!fxRp.on || fxRp.show));
            const sp = live ? vlen(c.v) : 0, th = live ? Math.abs(c.ctl.throttle || 0) : 0, b = live && c.boosting, ss = live && c.sup, gr = live && !c.onGround ? 0.82 : 1;
            E.o1.frequency.setTargetAtTime((44 + sp * 0.043 + th * 7 + (b ? 9 : 0)) * gr, t, 0.07);
            E.o2.frequency.setTargetAtTime((22 + sp * 0.0215 + th * 3.5) * gr, t, 0.07);
            E.o3.frequency.setTargetAtTime(176 + sp * 0.2 + th * 30, t, 0.09);
            E.f.frequency.setTargetAtTime(240 + sp * 0.42 + th * 260, t, 0.08);
            E.g.gain.setTargetAtTime(live ? 0.032 + sp / 2300 * 0.03 + th * 0.016 : 0, t, 0.09);
            E.g3.gain.setTargetAtTime(live ? sp / 2300 * 0.008 : 0, t, 0.12);
            if (b && !E.boost) { noise(0.3, 260, 0.16, 'lowpass', 0.9, 1900, 0, 0.12); noise(0.18, 2600, 0.05, 'bandpass', 0.8, 900, 0, 0.1); tone(70, 0.28, 'sine', 0.1, 140); }
            if (!b && E.boost) noise(0.35, 900, 0.05, 'bandpass', 0.7, 240, 0, 0.2);
            if (live && c.ctl.boost && c.boost <= 0 && t > fxSputT) { fxSputT = t + 0.16 + Math.random() * 0.1; noise(0.06, 1400, 0.05, 'bandpass', 1.4, 500); tone(95, 0.07, 'square', 0.02, 60); }
            if (ss && !E.sup) { noise(0.65, 500, 0.1, 'bandpass', 0.7, 3200, 0, 0.25); tone(320, 0.5, 'sine', 0.02, 960, 0, 0.2); }
            if (live && c.onGround) { tyr = clamp(sp / 2300, 0, 1); const lat = Math.abs(c.v.x * c.l.x + c.v.y * c.l.y + c.v.z * c.l.z); sqq = Math.max(c.slide > 0.3 && sp > 400 ? 0.5 + 0.5 * c.slide : 0, clamp((lat - 600) / 700, 0, 1)); sqf = sp; }
            E.boost = b; E.sup = ss;
            if (b) bst = live ? 0.55 + 0.45 * c.boostK : 1; if (ss) sup = 1; wsp = Math.max(wsp, sp);
          }
          const oth = [];
          if (on && W.state !== 'menu' && !fxRp.on) for (const c of W.cars) if (c !== (vs[0] && vs[0].car) && c.demoT <= 0) oth.push([Math.hypot(c.p.x - vs[0].camera.position.x, c.p.y - vs[0].camera.position.y, c.p.z - vs[0].camera.position.z), c]);
          oth.sort((a, b) => a[0] - b[0]);
          for (let i = 0; i < fxEngO.length; i++) {
            const E = fxEngO[i], q = oth[i], c = q && q[1], sp = c ? vlen(c.v) : 0, th = c ? Math.abs(c.ctl.throttle || 0) : 0, gr = c && !c.onGround ? 0.82 : 1;
            E.o1.frequency.setTargetAtTime((44 + sp * 0.043 + th * 7 + (c && c.boosting ? 9 : 0)) * gr * (1 + i * 0.015), t, 0.08);
            E.o2.frequency.setTargetAtTime((22 + sp * 0.0215 + th * 3.5) * gr * (1 + i * 0.015), t, 0.08);
            E.f.frequency.setTargetAtTime(200 + sp * 0.3 + th * 160, t, 0.1);
            E.g.gain.setTargetAtTime(c ? (0.012 + sp / 2300 * 0.016 + th * 0.006) * clamp(1.15 - q[0] / 5200, 0, 1) : 0, t, 0.1);
            if (E.pn && c) E.pn.pan.setTargetAtTime(fxPan(c.p), t, 0.08);
          }
          bstG.gain.setTargetAtTime(bst * 0.13, t, 0.035); fxBst2.gain.setTargetAtTime(bst * 0.17, t, 0.05); fxBst3.gain.setTargetAtTime(bst * 0.05, t, 0.04);
          bstF.frequency.setTargetAtTime(560 + wsp * 0.28, t, 0.1);
          fxTyG.gain.setTargetAtTime(tyr * 0.006, t, 0.08); fxSqG.gain.setTargetAtTime(sqq * 0.0045, t, 0.05); fxSqF.frequency.setTargetAtTime(1500 + sqf * 0.25, t, 0.1);
          windG.gain.setTargetAtTime(sup ? 0.05 : clamp((wsp - 1500) / 800, 0, 1) * 0.016, t, 0.12);
          crowdF.frequency.setTargetAtTime(470 + Math.sin(t * 0.37) * 55 + Math.sin(t * 1.13) * 25, t, 0.3);
          if (on && W.state === 'play' && !fxRp.on) {
            const B = W.ball, now = performance.now();
            if (Math.abs(B.p.y) > 4300 && Math.abs(B.p.x) < 1500 && B.p.z < 1000 && B.v.y * B.p.y > 0 && Math.abs(B.v.y) > 900 && now > fxMissT) { fxMissT = now + 4000; crowdSwell(0.13, 2.2, 0.5); }
          }
        };
        const fxBl = { on: !coarse && !!renderer.capabilities.isWebGL2, w: 0, h: 0, rt: [], sz: new THREE.Vector2() };
        if (fxBl.on) {
          const VS = 'varying vec2 vU;\nvoid main() { vU = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
          const SM = (fs, u) => own(new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: fs, depthTest: false, depthWrite: false }));
          fxBl.hi = SM('uniform sampler2D T;\nuniform vec2 px;\nvarying vec2 vU;\nvoid main() {\n  vec3 c = (texture2D(T, vU + px * vec2(-1.0, -1.0)).rgb + texture2D(T, vU + px * vec2(1.0, -1.0)).rgb + texture2D(T, vU + px * vec2(-1.0, 1.0)).rgb + texture2D(T, vU + px * vec2(1.0, 1.0)).rgb) * 0.25;\n  float l = max(c.r, max(c.g, c.b));\n  gl_FragColor = vec4(c * smoothstep(0.74, 1.0, l), 1.0);\n}', { T: { value: null }, px: { value: new THREE.Vector2() } });
          fxBl.bl = SM('uniform sampler2D T;\nuniform vec2 d;\nvarying vec2 vU;\nvoid main() {\n  vec3 c = texture2D(T, vU).rgb * 0.2270;\n  c += (texture2D(T, vU + d).rgb + texture2D(T, vU - d).rgb) * 0.1945;\n  c += (texture2D(T, vU + d * 2.0).rgb + texture2D(T, vU - d * 2.0).rgb) * 0.1216;\n  c += (texture2D(T, vU + d * 3.0).rgb + texture2D(T, vU - d * 3.0).rgb) * 0.0540;\n  c += (texture2D(T, vU + d * 4.0).rgb + texture2D(T, vU - d * 4.0).rgb) * 0.0162;\n  gl_FragColor = vec4(c, 1.0);\n}', { T: { value: null }, d: { value: new THREE.Vector2() } });
          fxBl.mix = SM('uniform sampler2D A;\nuniform sampler2D B;\nuniform sampler2D C;\nuniform float k;\nvarying vec2 vU;\nvoid main() {\n  vec3 c = texture2D(A, vU).rgb + (texture2D(B, vU).rgb * 0.55 + texture2D(C, vU).rgb * 0.75) * k;\n  float l = dot(c, vec3(0.299, 0.587, 0.114));\n  c = mix(vec3(l), c, 0.9);\n  gl_FragColor = vec4(c, 1.0);\n}', { A: { value: null }, B: { value: null }, C: { value: null }, k: { value: 0.5 } });
          fxBl.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); fxBl.sc = new THREE.Scene();
          fxBl.q = new THREE.Mesh(own(new THREE.PlaneGeometry(2, 2)), fxBl.mix); fxBl.q.frustumCulled = false; fxBl.sc.add(fxBl.q);
        }
        const fxBlSize = (W2, H2) => {
          for (const r of fxBl.rt) r.dispose();
          const o = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: false };
          const A = own(new THREE.WebGLMultisampleRenderTarget(W2, H2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat }));
          A.samples = 4; A.texture.encoding = THREE.sRGBEncoding;
          const q = d => own(new THREE.WebGLRenderTarget(Math.max(1, Math.round(W2 / d)), Math.max(1, Math.round(H2 / d)), o));
          fxBl.rt = [A, q(4), q(4), q(8), q(8)]; fxBl.w = W2; fxBl.h = H2;
        };
        const fxQ = { on0: fxBl.on, lv: 0, s: 0, n: 0, v: new THREE.Vector2() };
        const fxQSet = lv => {
          fxQ.lv = lv; fxBl.on = fxQ.on0 && lv < 1;
          if (lv >= 2 && sun.castShadow) { sun.castShadow = false; scene.traverse(o => { if (o.isPointLight) o.visible = false; if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.needsUpdate = true; }); }
          if (lv >= 3) { renderer.getSize(fxQ.v); renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 0.6)); renderer.setSize(fxQ.v.x, fxQ.v.y, false); for (const m of arHeavy) m.visible = false; }
        };
        try { const g = renderer.getContext(), e = g.getExtension('WEBGL_debug_renderer_info'), r = e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : ''; if (/swiftshader|llvmpipe|software|basic render/i.test(r)) fxQSet(3); } catch (e) {   }
        wrap.fxDbg = { scene, renderer, fxQ, fxQSet, fxBl, views };
        const fxQTick = dt => {
          if (fxQ.lv >= 3 || dt <= 0 || dt > 0.25 || ui !== 'play' || paused) return;
          fxQ.s += dt; fxQ.n++;
          if (fxQ.s < 2.5) return;
          const av = fxQ.s / fxQ.n; fxQ.s = 0; fxQ.n = 0;
          if (av > 1 / 42) fxQSet(fxQ.lv + 1);
        };
        const fxPass = (m, dst) => { fxBl.q.material = m; renderer.setRenderTarget(dst); renderer.render(fxBl.sc, fxBl.cam); };
        const renderViews = () => {
          const v = views[0], pr = renderer.getPixelRatio();
          fire.mat.uniforms.scale.value = smoke.mat.uniforms.scale.value = h * pr * 0.5 / Math.tan(v.camera.fov * Math.PI / 360);
          if (!fxBl.on) { renderer.render(scene, v.camera); return; }
          renderer.getDrawingBufferSize(fxBl.sz);
          if (fxBl.sz.x !== fxBl.w || fxBl.sz.y !== fxBl.h) fxBlSize(fxBl.sz.x, fxBl.sz.y);
          const [A, B1, T1, B2, T2] = fxBl.rt, hi = fxBl.hi.uniforms, bl = fxBl.bl.uniforms, mx = fxBl.mix.uniforms;
          renderer.setRenderTarget(A); renderer.render(scene, v.camera);
          hi.T.value = A.texture; hi.px.value.set(1 / A.width, 1 / A.height); fxPass(fxBl.hi, B1);
          bl.T.value = B1.texture; bl.d.value.set(1 / B1.width, 0); fxPass(fxBl.bl, T1);
          bl.T.value = T1.texture; bl.d.value.set(0, 1 / B1.height); fxPass(fxBl.bl, B1);
          bl.T.value = B1.texture; bl.d.value.set(2 / B1.width, 0); fxPass(fxBl.bl, T2);
          bl.T.value = T2.texture; bl.d.value.set(0, 1 / B2.height); fxPass(fxBl.bl, B2);
          mx.A.value = A.texture; mx.B.value = B1.texture; mx.C.value = B2.texture; fxPass(fxBl.mix, null);
        };
        const STEP = 1 / CFG.hz;
        let acc = 0;
        const fxPace = { s: 1 / 60, b: 0, o: 0 };
        const fxPaceDt = dt => {
          const P = fxPace;
          if (!(dt > 0)) return dt;
          if (Math.abs(dt - P.s) > P.s * 0.35) { if (++P.o > 6) { P.s = dt; P.o = 0; P.b = 0; } P.b = 0; return dt; }
          P.o = 0; P.s += (dt - P.s) * 0.1;
          const o = P.s + clamp(P.b * 0.2, -0.002, 0.002);
          P.b = clamp(P.b + dt - o, -0.03, 0.03);
          return o;
        };
        const fxIp = { W: null, n: 0, pv: [], cu: [], bp: new Float64Array(3), bc: new Float64Array(3), on: false };
        const fxIpSnap = () => {
          if (fxIp.W !== W || fxIp.n !== W.cars.length) { fxIp.W = W; fxIp.n = W.cars.length; fxIp.pv.length = fxIp.cu.length = 0; for (let i = 0; i < fxIp.n; i++) { fxIp.pv.push(new Float64Array(12)); fxIp.cu.push(new Float64Array(12)); } fxIp.on = false; }
          for (let i = 0; i < fxIp.n; i++) { const c = W.cars[i], q = fxIp.pv[i]; q[0] = c.p.x; q[1] = c.p.y; q[2] = c.p.z; q[3] = c.f.x; q[4] = c.f.y; q[5] = c.f.z; q[6] = c.u.x; q[7] = c.u.y; q[8] = c.u.z; q[9] = c.l.x; q[10] = c.l.y; q[11] = c.l.z; }
          const B = W.ball; fxIp.bp[0] = B.p.x; fxIp.bp[1] = B.p.y; fxIp.bp[2] = B.p.z; fxIp.ok = true;
        };
        const fxIpApply = a => {
          if (!fxIp.ok || fxIp.W !== W || fxIp.n !== W.cars.length || fxIp.on || fxRp.on || online || ui !== 'play' || !(a > 0.001)) return;
          a = Math.min(a, 1); fxIp.on = true;
          for (let i = 0; i < fxIp.n; i++) {
            const c = W.cars[i], q = fxIp.pv[i], o = fxIp.cu[i];
            o[0] = c.p.x; o[1] = c.p.y; o[2] = c.p.z; o[3] = c.f.x; o[4] = c.f.y; o[5] = c.f.z; o[6] = c.u.x; o[7] = c.u.y; o[8] = c.u.z; o[9] = c.l.x; o[10] = c.l.y; o[11] = c.l.z;
            if (c.demoT > 0 || Math.hypot(o[0] - q[0], o[1] - q[1], o[2] - q[2]) > 240) continue;
            const k = 1 - a;
            c.p.x = q[0] * k + o[0] * a; c.p.y = q[1] * k + o[1] * a; c.p.z = q[2] * k + o[2] * a;
            c.f.x = q[3] * k + o[3] * a; c.f.y = q[4] * k + o[4] * a; c.f.z = q[5] * k + o[5] * a;
            c.u.x = q[6] * k + o[6] * a; c.u.y = q[7] * k + o[7] * a; c.u.z = q[8] * k + o[8] * a;
            fxOrtho(c);
          }
          const B = W.ball, b = fxIp.bp, k = 1 - a; fxIp.bc[0] = B.p.x; fxIp.bc[1] = B.p.y; fxIp.bc[2] = B.p.z;
          fxIp.bj = Math.hypot(B.p.x - b[0], B.p.y - b[1], B.p.z - b[2]) < 240;
          if (fxIp.bj) { B.p.x = b[0] * k + B.p.x * a; B.p.y = b[1] * k + B.p.y * a; B.p.z = b[2] * k + B.p.z * a; }
        };
        const fxIpRestore = () => {
          if (!fxIp.on) return;
          fxIp.on = false;
          for (let i = 0; i < fxIp.n; i++) { const c = W.cars[i], o = fxIp.cu[i]; c.p.x = o[0]; c.p.y = o[1]; c.p.z = o[2]; c.f.x = o[3]; c.f.y = o[4]; c.f.z = o[5]; c.u.x = o[6]; c.u.y = o[7]; c.u.z = o[8]; c.l.x = o[9]; c.l.y = o[10]; c.l.z = o[11]; }
          const B = W.ball, b = fxIp.bc; B.p.x = b[0]; B.p.y = b[1]; B.p.z = b[2];
        };
        api.loop((dt, t) => {
          if (dead) return;
          fxQTick(dt);
          dt = fxPaceDt(dt) * uiDbgK;
          if (fxRp.on && (fxRp.W !== W || ui !== 'play')) fxRpAbort();
          if (!paused) {
            fxNow += dt;
            if (fxRp.on) fxRpTick(dt);
            else if (ui !== 'load') {
              if (online && online.role === 'guest' && online.G) guestFrame(dt);
              else {
                acc += dt;
                let n = 0;
                const host = online && online.role === 'host' && online.H && online.H.W === W && ui !== 'lobby';
                while (acc >= STEP && n < 8 && !fxRpWant()) {
                  if (ui === 'play') { const v = views[0]; if (v.car) { if (online && !(pz.hidden && uiOptEl.hidden)) uiNeutral(v.car.ctl); else readInput(v, v.car.ctl); } }
                  if (host) online.H.pre();
                  fxIpSnap(); worldStep(W, STEP); acc -= STEP; n++;
                }
                if (n >= 8) acc = 0;
                if (host) hostSend();
              }
              handleEvents();
            }
            fxIpApply(acc / STEP); visuals(dt, t / 1000); fxIpRestore();
            if (fxRp.on) fxRpPost(); else { fxRecord(); fxRpCheck(); }
          }
          fxIpApply(acc / STEP);
          cameraUpdate(views[0], paused ? 0 : dt);
          if (uiDbgCam) { const c = views[0].camera; c.position.set(uiDbgCam[0], uiDbgCam[1], uiDbgCam[2]); c.up.set(0, 0, 1); c.lookAt(uiDbgCam[3], uiDbgCam[4], uiDbgCam[5]); }
          if (shake > 0) shake = Math.max(0, shake - dt * 1.6);
          hudUpdate(dt);
          soundUpdate();
          renderViews();
          fxIpRestore();
        });

        let uiDbgCam = null, uiDbgK = 1;
        wrap.__rs = { cam: a => { uiDbgCam = a || null; }, slow: k => { uiDbgK = k > 0 ? k : 1; }, vcam: () => { const c = views[0].camera, d = c.getWorldDirection(new THREE.Vector3()); return [c.position.x, c.position.y, c.position.z, d.x, d.y, d.z, c.fov]; }, world: () => W, ui: () => ui, gar: () => ({ scr: uiScr, gc: uiGc, gf: uiGf, gi: uiGi, tier: uiTier(), pxp: saved.pxp, ld: saved.ld[saved.car], car: saved.car, rv: uiRvQ.length + (uiRvEl.hidden ? 0 : 1) }), thumb: (b, t, cos, v) => crThumb(b, t, Object.assign(crCosOf(null, t), cos || {}), v), icon: (k, id, t) => crIcon(k, id, t), fin: () => { if (ui === 'load') beginPlay(); if (ui === 'play') { W.state = 'end'; showEnd(false); } }, pass: (x, q) => { uiPassAdd(x); if (q) uiRvQ.length = 0; if (ui === 'menu') { renderMenu(); if (uiRvEl.hidden) uiRvShow(); } }, mode: () => mode, end: () => uiEnd, start: m => { if (ui === 'title' || ui === 'menu') startGame(m || 'cpu'); }, online: () => online && { role: online.role, id: online.id, mid: online.mid, ids: online.ids, left: online.left, votes: [...online.votes], seq: online.G ? online.G.seq : 0, ack: online.G ? online.G.ack : 0, n: online.G ? online.G.lastN : 0, corr: online.G ? online.G.corr : 0, nsnap: online.G ? online.G.nsnap : 0, L: online.L, pl: online.pl } };
        if (api.net && api.net.invite) { saved.play = 'online'; showMenu(); startOnline(); } else showTitle();
        return () => {
          uiRlLog(true);
          dead = true;
          try { if (AC) AC.close(); } catch (e) {   }
          AC = null;
          scene.traverse(o => { if (o.isMesh || o.isSprite || o.isPoints) {   } });
          for (const o of bin) { try { o.dispose(); } catch (e) {   } }
          bin.length = 0;
        };
      }
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rsc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a6fe0"/><stop offset="1" stop-color="#8cc4ff"/></linearGradient><linearGradient id="rsc-pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9a3c"/><stop offset="1" stop-color="#2f7d2e"/></linearGradient><linearGradient id="rsc-crowd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22305a"/><stop offset="1" stop-color="#2f4378"/></linearGradient><radialGradient id="rsc-ball" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#c9d1dc"/><stop offset="1" stop-color="#7d8898"/></radialGradient><radialGradient id="rsc-gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient><linearGradient id="rsc-fl" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#7fc4ff"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></linearGradient><linearGradient id="rsc-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f95ff"/><stop offset="1" stop-color="#1f5fd6"/></linearGradient><pattern id="rsc-hex" width="36" height="20.8" patternUnits="userSpaceOnUse"><path d="M0 10.4L6 0h12l6 10.4-6 10.4H6zM24 10.4h12" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/></pattern><pattern id="rsc-net" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 5L5 0 10 5 5 10z" fill="none" stroke="#ffd2a0" stroke-width="1"/></pattern></defs>
<rect width="400" height="300" fill="url(#rsc-sky)"/>
<rect width="400" height="122" fill="url(#rsc-hex)"/>
<path d="M0 64Q200 20 400 64" fill="none" stroke="#fff" stroke-width="2" opacity=".45"/>
<circle cx="56" cy="34" r="20" fill="#fff" opacity=".3"/><circle cx="56" cy="34" r="9" fill="#fff" opacity=".85"/><circle cx="344" cy="34" r="20" fill="#fff" opacity=".3"/><circle cx="344" cy="34" r="9" fill="#fff" opacity=".85"/>
<rect x="0" y="80" width="400" height="34" fill="url(#rsc-crowd)"/>
<g fill="#ff9a3c" opacity=".8"><circle cx="12" cy="88" r="2"/><circle cx="40" cy="96" r="2"/><circle cx="70" cy="86" r="2"/><circle cx="98" cy="102" r="2"/><circle cx="128" cy="90" r="2"/><circle cx="262" cy="94" r="2"/><circle cx="294" cy="86" r="2"/><circle cx="322" cy="100" r="2"/><circle cx="352" cy="90" r="2"/><circle cx="384" cy="98" r="2"/></g>
<g fill="#8fb8ff" opacity=".8"><circle cx="26" cy="100" r="2"/><circle cx="56" cy="92" r="2"/><circle cx="84" cy="94" r="2"/><circle cx="114" cy="98" r="2"/><circle cx="142" cy="86" r="2"/><circle cx="250" cy="86" r="2"/><circle cx="278" cy="100" r="2"/><circle cx="308" cy="92" r="2"/><circle cx="338" cy="96" r="2"/><circle cx="368" cy="88" r="2"/></g>
<rect x="0" y="112" width="200" height="12" fill="#13306e"/><rect x="200" y="112" width="200" height="12" fill="#5a2a10"/>
<g fill="none" stroke-width="2.4" stroke-linejoin="round"><path d="M18 114l5 4-5 4M30 114l5 4-5 4M42 114l5 4-5 4" stroke="#7fb2ff"/><path d="M382 114l-5 4 5 4M370 114l-5 4 5 4M358 114l-5 4 5 4" stroke="#ffb15c"/></g>
<rect x="0" y="123" width="200" height="3" fill="#3f8cff"/><rect x="200" y="123" width="200" height="3" fill="#ff8a2a"/>
<polygon points="0,126 400,126 400,300 0,300" fill="url(#rsc-pitch)"/>
<polygon points="0,140 400,140 400,156 0,156" fill="#55b04e" opacity=".55"/><polygon points="0,176 400,176 400,200 0,200" fill="#55b04e" opacity=".55"/><polygon points="0,232 400,232 400,270 0,270" fill="#55b04e" opacity=".55"/>
<ellipse cx="200" cy="112" rx="74" ry="32" fill="url(#rsc-gl)"/>
<rect x="160" y="92" width="80" height="34" fill="#ff7a1a" opacity=".35"/><rect x="160" y="92" width="80" height="34" fill="url(#rsc-net)" opacity=".8"/><path d="M160 126V92h80v34" fill="none" stroke="#ffb35c" stroke-width="5" stroke-linejoin="round"/>
<path d="M0 136Q200 128 400 136" fill="none" stroke="#ffb15c" stroke-width="2.5" opacity=".8"/>
<ellipse cx="200" cy="250" rx="152" ry="40" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/><path d="M0 250H400" stroke="#fff" stroke-width="4" opacity=".7"/>
<g transform="translate(308 152) rotate(-6) scale(.34)"><path d="M-86-6L-90-34Q-92-46-80-50L-66-50-44-68 2-70 32-42 62-34Q86-28 88-14L86-4 30-6z" fill="#ff7a1a"/><path d="M-38-62L0-64 24-42-34-42z" fill="#1b2638"/><circle cx="-55" cy="0" r="26" fill="#1b1c22"/><circle cx="52" cy="3" r="22" fill="#1b1c22"/></g>
<ellipse cx="272" cy="226" rx="44" ry="9" fill="#123a12" opacity=".35"/>
<g transform="translate(266 132)"><circle r="44" fill="url(#rsc-ball)"/><path d="M-10-30l15-3 9 13-9 13-15-2-6-11z" fill="#4a5363"/><path d="M-40-4l13-7 9 11-7 13-13-2z" fill="#4a5363"/><path d="M17 15l15-4 7 13-11 11-13-4z" fill="#4a5363"/><path d="M-16 6l13-2 7 12-8 10-12-2-5-9z" fill="#4a5363"/><path d="M22-26l12 4 3 13-9 6-10-7z" fill="#4a5363"/><circle r="44" fill="none" stroke="#e9f6ff" stroke-width="3" opacity=".9"/><path d="M-30 30A44 44 0 0 0 38 22" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/><circle cx="-14" cy="-20" r="9" fill="#fff" opacity=".55"/></g>
<path d="M120 252L86 262 -6 306-6 270 96 236z" fill="url(#rsc-fl)" opacity=".95"/>
<circle cx="70" cy="262" r="6" fill="#bfe2ff" opacity=".9"/><circle cx="44" cy="276" r="5" fill="#7fc4ff" opacity=".8"/><circle cx="92" cy="272" r="4" fill="#fff"/><circle cx="24" cy="290" r="4" fill="#4f95ff" opacity=".7"/>
<path d="M160 156h-44M168 176h-62M176 138h-34" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".65"/>
<g transform="translate(176 232) rotate(-14)"><ellipse cx="0" cy="34" rx="98" ry="12" fill="#0d2a0c" opacity=".28"/><path d="M-86-6L-90-34Q-92-46-80-50L-66-50-44-68 2-70 32-42 62-34Q86-28 88-14L86-4 30-6z" fill="url(#rsc-body)"/><path d="M-70-50l-8-12 34-6 2 8z" fill="#14254a"/><path d="M-38-62L0-64 24-42-34-42z" fill="#16233a"/><path d="M-36-42h62l-2 4h-58z" fill="#0d1626"/><path d="M-90-26h118l34 8 24 2-2 6-56-6H-88z" fill="#fff" opacity=".9"/><path d="M-92-30h8v14h-8z" fill="#1b2638"/><path d="M80-24l8 4-2 6-8-3z" fill="#eaf4ff"/><path d="M-90-36h6v6h-6z" fill="#ff3d4a"/><path d="M-82-4a28 28 0 0 1 54 0z" fill="#0e1830"/><path d="M26-4a26 26 0 0 1 52 0z" fill="#0e1830"/><path d="M22-8Q30-40 54-36 78-32 86-8z" fill="url(#rsc-body)"/><path d="M28-10Q36-34 54-32 72-30 80-10" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><circle cx="-55" cy="0" r="26" fill="#1b1c22"/><circle cx="-55" cy="0" r="14" fill="#d6dbe4"/><path d="M-55-14v28M-69 0h28M-65-10l20 20M-65 10l20-20" stroke="#8d96a6" stroke-width="3"/><circle cx="-55" cy="0" r="4" fill="#4a5363"/><circle cx="52" cy="3" r="22" fill="#1b1c22"/><circle cx="52" cy="3" r="12" fill="#d6dbe4"/><path d="M52-9v24M40 3h24M44-5l16 16M44 11l16-16" stroke="#8d96a6" stroke-width="3"/><circle cx="52" cy="3" r="3.5" fill="#4a5363"/></g>
</svg>`;
})();

