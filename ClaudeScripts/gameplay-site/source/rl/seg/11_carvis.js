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
          const rbm = crFlMs.rainbow;
          if (rbm) { crHue(crClock * 0.6 % 1, crTH); rbm.o.color.setRGB(crTH[0], crTH[1], crTH[2]); rbm.g.color.setRGB(crTH[0] * 0.6 + 0.4, crTH[1] * 0.6 + 0.4, crTH[2] * 0.6 + 0.4); }
          for (const cv of carVis) {
            const c = cv.car;
            if (!c) continue;
            if (cv.body !== c.body) crSetBody(cv, c.body);
            crSync(cv);
            const S = cv.s, alive = c.demoT <= 0;
            cv.g.visible = alive;
            cv.tag.visible = alive && ui === 'play';
            if (!alive) { for (const f of cv.fl) f.g.visible = false; for (const tr of cv.trails) { tr.n = 0; tr.m.visible = false; } S.reset = true; S.bt = 0; continue; }
            const fx = c.f.x, fy = c.f.y, fz = c.f.z, lx = c.l.x, ly = c.l.y, lz = c.l.z, ux = c.u.x, uy = c.u.y, uz = c.u.z, vx = c.v.x, vy = c.v.y, vz = c.v.z;
            crV1.set(fx, fy, fz); crV2.set(lx, ly, lz); crV3.set(ux, uy, uz);
            crM4.makeBasis(crV1, crV2, crV3); crM4.setPosition(c.p.x, c.p.y, c.p.z);
            cv.g.matrix.copy(crM4); cv.g.matrixWorldNeedsUpdate = true;
            const tp = Math.hypot(c.p.x - S.px, c.p.y - S.py, c.p.z - S.pz) > Math.hypot(vx, vy, vz) * d * 1.5 + 120;
            if (S.reset || tp || d <= 0) {
              S.vx = vx; S.vy = vy; S.vz = vz; S.gr = c.onGround; S.vu = vx * ux + vy * uy + vz * uz;
              if (S.reset || tp) { S.z = S.zv = S.pi = S.pv = S.ro = S.rv = 0; for (const tr of cv.trails) tr.n = 0; }
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
            const th = c.ctl ? c.ctl.throttle || 0 : 0;
            if (gnd) S.ws = c.fs || 0; else S.ws += (th * 2300 - S.ws) * Math.min(1, d * (th ? 2.5 : 0.5));
            S.af = (S.af + S.ws * d / cv.rf) % TAU; S.ab = (S.ab + S.ws * d / cv.rb) % TAU;
            const as = Math.abs(c.fs || 0), sm = crSteerMax(as, CFG.steer), sl = c.slide || 0;
            S.sa += (-(c.ctl ? c.ctl.steer || 0 : 0) * (sm + (CFG.slideSteer ? crSteerMax(as, CFG.slideSteer) - sm : 0) * sl) - S.sa) * Math.min(1, d * 14);
            S.wd += ((gnd ? 0 : 3.2) - S.wd) * Math.min(1, d * (gnd ? 25 : 6));
            for (const wh of cv.wheels) { wh.spin.rotation.y = wh.front ? S.af : S.ab; if (wh.front) wh.piv.rotation.z = S.sa; wh.piv.position.z = wh.z - S.wd; }
            S.bt += ((c.boosting ? 1 : 0) - S.bt) * Math.min(1, d * (c.boosting ? 18 : 10));
            const on = S.bt > 0.04;
            for (const f of cv.fl) {
              f.g.visible = on;
              if (!on) continue;
              const k = S.bt, r = f.r, q = 0.88 + Math.random() * 0.24;
              f.o.scale.set(r * k * (7.5 + Math.random() * 3.5), r * q, r * q);
              f.c.scale.set(r * k * (3.6 + Math.random() * 1.6), r * 0.58 * q, r * 0.58 * q);
              f.s.scale.setScalar(r * k * (4.5 + Math.random() * 2));
            }
            if (c.boosting) {
              const BC = crBoostCol(c), fc = [BC.a, BC.b], bs = cv.bs || {};
              S.ea += d * 240; S.es += d * (bs.dense ? 60 : 40);
              while (S.ea >= 1) {
                S.ea -= 1;
                for (const f of cv.fl) {
                  const b = Math.random() * d, ex = c.p.x + fx * f.x + lx * f.y + ux * (f.z + S.z) - vx * b, ey = c.p.y + fy * f.x + ly * f.y + uy * (f.z + S.z) - vy * b, ez = c.p.z + fz * f.x + lz * f.y + uz * (f.z + S.z) - vz * b;
                  const cc = Math.random() < 0.35 ? fc[1] : fc[0], sp = 380 + Math.random() * 300;
                  fire.emit(ex + R() * 2.5, ey + R() * 2.5, ez + R() * 2.5, vx * 0.25 - fx * sp + R() * 70, vy * 0.25 - fy * sp + R() * 70, vz * 0.25 - fz * sp + R() * 70, 0.14 + Math.random() * 0.14, cc[0] * 0.55, cc[1] * 0.55, cc[2] * 0.55, f.r * 4.6, f.r * 1.2, 0, 3);
                  if (bs.sp && Math.random() < 0.18 * bs.sp) fire.emit(ex, ey, ez, vx * 0.4 - fx * 260 + R() * 160, vy * 0.4 - fy * 260 + R() * 160, vz * 0.4 - fz * 260 + R() * 160 + 60, 0.5 + Math.random() * 0.5, fc[1][0], fc[1][1], fc[1][2], f.r * 1.3, f.r * 0.2, -120, 1.2);
                }
              }
              while (S.es >= 1) {
                S.es -= 1;
                const sm = BC.smoke;
                if (!sm) continue;
                for (const f of cv.fl) {
                  const ex = c.p.x + fx * (f.x - 14) + lx * f.y + ux * f.z, ey = c.p.y + fy * (f.x - 14) + ly * f.y + uy * f.z, ez = c.p.z + fz * (f.x - 14) + lz * f.y + uz * f.z;
                  smoke.emit(ex + R() * 4, ey + R() * 4, ez + R() * 4, vx * 0.12 - fx * 160 + R() * 40, vy * 0.12 - fy * 160 + R() * 40, vz * 0.12 - fz * 160 + R() * 40, 0.45 + Math.random() * 0.35, sm[0], sm[1], sm[2], f.r * 2.4, f.r * (bs.dense ? 12 : 7.5), -50, 2.2);
                }
              }
            } else S.ea = S.es = 0;
            const TS = cv.ts || crCat.trail[0], tc = TS.c || (TS.glow ? cv.pcol || crTC[cv.team] : crTC[cv.team]), [tx, ty, tz] = cv.tr, pv = !!c.prevTrail, tw = 7 * (TS.w || 1), tj = TS.j || 0;
            for (let k = 0; k < 2; k++) {
              const tr = cv.trails[k], sy = k ? -ty : ty, N = tr.N;
              tr.head = (tr.head + 1) % N;
              const h = tr.head, jx = tj ? R() * tj * 9 : 0, jz = tj ? R() * tj * 9 : 0;
              tr.hx[h] = c.p.x + fx * tx + lx * (sy + jx) + ux * (tz + jz); tr.hy[h] = c.p.y + fy * tx + ly * (sy + jx) + uy * (tz + jz); tr.hz[h] = c.p.z + fz * tx + lz * (sy + jx) + uz * (tz + jz); tr.ht[h] = crClock; tr.hs[h] = c.sup || pv ? 1 : 0;
              if (tr.n < N) tr.n++;
              let any = false;
              for (let i = 0; i < N; i++) {
                const j = (h - Math.min(i, tr.n - 1) + N) % N, a = pv ? Math.pow(1 - i / N, 1.5) * 0.6 : tr.hs[j] * Math.pow(Math.max(0, 1 - (crClock - tr.ht[j]) / 0.17), 1.5) * 0.42, w = tw * (1 - 0.6 * i / N), o = i * 12;
                const X = pv ? tr.hx[h] - fx * i * 14 + (tj ? R() * tj * 6 : 0) : tr.hx[j], Y = pv ? tr.hy[h] - fy * i * 14 + (tj ? R() * tj * 6 : 0) : tr.hy[j], Z = pv ? tr.hz[h] - fz * i * 14 : tr.hz[j];
                if (a > 0.01) any = true;
                tr.pos[o] = X + ux * w; tr.pos[o + 1] = Y + uy * w; tr.pos[o + 2] = Z + uz * w;
                tr.pos[o + 3] = X - ux * w; tr.pos[o + 4] = Y - uy * w; tr.pos[o + 5] = Z - uz * w;
                tr.pos[o + 6] = X + lx * w; tr.pos[o + 7] = Y + ly * w; tr.pos[o + 8] = Z + lz * w;
                tr.pos[o + 9] = X - lx * w; tr.pos[o + 10] = Y - ly * w; tr.pos[o + 11] = Z - lz * w;
                const cc = TS.rb ? crHue((i / N + crClock * 0.5) % 1, crTH) : tc;
                for (let q = 0; q < 12; q += 3) { tr.col[o + q] = a * cc[0]; tr.col[o + q + 1] = a * cc[1]; tr.col[o + q + 2] = a * cc[2]; }
              }
              tr.m.visible = any;
              if (any) { tr.g.attributes.position.needsUpdate = true; tr.g.attributes.color.needsUpdate = true; }
            }
            cv.tag.position.set(c.p.x, c.p.y, c.p.z + cv.tz);
          }
        };

