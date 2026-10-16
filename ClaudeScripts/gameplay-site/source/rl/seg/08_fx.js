        const fxCam = Object.assign({ fov: 110, dist: 270, height: 100, angle: -3, stiff: 0.45, swivel: 4.7, trans: 1.2 }, CFG.cam || {});
        const camera = new THREE.PerspectiveCamera(portrait ? 78 : 2 * Math.atan(Math.tan(fxCam.fov * Math.PI / 360) / (w / h)) * 180 / Math.PI, w / h, 10, 90000);
        camera.up.set(0, 0, 1);
        const particles = (n, additive) => {
          const geo = own(new THREE.BufferGeometry());
          const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), alp = new Float32Array(n), siz = new Float32Array(n), sd = new Float32Array(n);
          const vel = new Float32Array(n * 3), life = new Float32Array(n), max = new Float32Array(n), s0 = new Float32Array(n), s1 = new Float32Array(n), grav = new Float32Array(n), drag = new Float32Array(n);
          for (let i = 0; i < n; i++) sd[i] = Math.random();
          const attr = (a, k) => new THREE.BufferAttribute(a, k).setUsage(THREE.DynamicDrawUsage);
          geo.setAttribute('position', attr(pos, 3)); geo.setAttribute('pcolor', attr(col, 3)); geo.setAttribute('alpha', attr(alp, 1)); geo.setAttribute('size', attr(siz, 1)); geo.setAttribute('seed', new THREE.BufferAttribute(sd, 1));
          const mat = own(new THREE.ShaderMaterial({ uniforms: { scale: { value: 400 }, kind: { value: additive ? 0 : 1 } }, vertexShader: PVS, fragmentShader: PFS, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
          const obj = new THREE.Points(geo, mat); obj.frustumCulled = false; obj.renderOrder = additive ? 8 : 7; scene.add(obj);
          const keys = ['position', 'pcolor', 'alpha', 'size'], dims = [3, 3, 1, 1];
          let head = 0, live = false, top = 0;
          return {
            mat,
            emit(x, y, z, vx, vy, vz, l, r, g, b, sa, sb, gr, dr) {
              const i = head, i3 = i * 3; head = (head + 1) % n; if (i >= top) top = i + 1;
              pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z; vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
              col[i3] = r; col[i3 + 1] = g; col[i3 + 2] = b; life[i] = max[i] = l; s0[i] = sa; s1[i] = sb; grav[i] = gr || 0; drag[i] = dr || 0; live = true;
            },
            clear() { life.fill(0); live = true; },
            update(dt) {
              if (!live) return;
              let any = false;
              for (let i = 0; i < top; i++) {
                if (life[i] <= 0) { alp[i] = 0; continue; }
                life[i] -= dt; any = true;
                const t = Math.max(0, life[i] / max[i]), i3 = i * 3, dd = Math.exp(-drag[i] * dt);
                vel[i3] *= dd; vel[i3 + 1] *= dd; vel[i3 + 2] = vel[i3 + 2] * dd - grav[i] * dt;
                pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt;
                const fo = t < 0.6 ? t / 0.6 : 1;
                alp[i] = additive ? fo : Math.min(fo, (1 - t) * 9); siz[i] = s1[i] + (s0[i] - s1[i]) * t;
              }
              live = any;
              for (let k = 0; k < 4; k++) { const a = geo.attributes[keys[k]]; a.updateRange.offset = 0; a.updateRange.count = top * dims[k]; a.needsUpdate = true; }
            }
          };
        };
        const fire = particles(2600, true), smoke = particles(1800, false);
        const FXK = [0, -1, 0, 1, 1, -1, 1, 1];
        const fxStreaks = n => {
          const geo = own(new THREE.BufferGeometry());
          const P = new Float32Array(n * 12), T = new Float32Array(n * 12), C = new Float32Array(n * 12), A = new Float32Array(n * 4), D = new Float32Array(n * 4), K = new Float32Array(n * 8), I = new Uint16Array(n * 6);
          for (let i = 0; i < n; i++) { K.set(FXK, i * 8); const b = i * 4, o = i * 6; I[o] = b; I[o + 1] = b + 2; I[o + 2] = b + 1; I[o + 3] = b + 1; I[o + 4] = b + 2; I[o + 5] = b + 3; }
          const attr = (a, k) => new THREE.BufferAttribute(a, k).setUsage(THREE.DynamicDrawUsage);
          geo.setAttribute('position', attr(P, 3)); geo.setAttribute('tail', attr(T, 3)); geo.setAttribute('scol', attr(C, 3)); geo.setAttribute('salpha', attr(A, 1)); geo.setAttribute('swid', attr(D, 1)); geo.setAttribute('corner', new THREE.BufferAttribute(K, 2)); geo.setIndex(new THREE.BufferAttribute(I, 1));
          const mat = own(new THREE.ShaderMaterial({ vertexShader: FXSVS, fragmentShader: FXSFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
          const obj = new THREE.Mesh(geo, mat); obj.frustumCulled = false; obj.renderOrder = 8; obj.visible = false; scene.add(obj);
          const pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), col = new Float32Array(n * 3), life = new Float32Array(n), max = new Float32Array(n), wid = new Float32Array(n), len = new Float32Array(n), grav = new Float32Array(n), drag = new Float32Array(n);
          const keys = ['position', 'tail', 'scol', 'salpha', 'swid'];
          let head = 0, live = false, top = 0;
          return {
            emit(x, y, z, vx, vy, vz, l, r, g, b, wd, ln, gr, dr) {
              const i = head, i3 = i * 3; head = (head + 1) % n; if (i >= top) top = i + 1;
              pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z; vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
              col[i3] = r; col[i3 + 1] = g; col[i3 + 2] = b; life[i] = max[i] = l; wid[i] = wd; len[i] = ln; grav[i] = gr || 0; drag[i] = dr || 0; live = true;
            },
            clear() { life.fill(0); live = true; },
            update(dt) {
              if (!live) return;
              let any = false;
              for (let i = 0; i < top; i++) {
                const i4 = i * 4;
                if (life[i] <= 0) { if (A[i4]) A[i4] = A[i4 + 1] = A[i4 + 2] = A[i4 + 3] = 0; continue; }
                life[i] -= dt; any = true;
                const t = Math.max(0, life[i] / max[i]), i3 = i * 3, dd = Math.exp(-drag[i] * dt);
                vel[i3] *= dd; vel[i3 + 1] *= dd; vel[i3 + 2] = vel[i3 + 2] * dd - grav[i] * dt;
                const x = pos[i3] += vel[i3] * dt, y = pos[i3 + 1] += vel[i3 + 1] * dt, z = pos[i3 + 2] += vel[i3 + 2] * dt;
                const sp = Math.hypot(vel[i3], vel[i3 + 1], vel[i3 + 2]) || 1, tl = Math.min(sp * len[i], 1100) / sp;
                const tx = x - vel[i3] * tl, ty = y - vel[i3 + 1] * tl, tz = z - vel[i3 + 2] * tl, a = t < 0.5 ? t / 0.5 : 1, o = i * 12;
                for (let k = 0; k < 4; k++) {
                  const j = o + k * 3;
                  P[j] = x; P[j + 1] = y; P[j + 2] = z; T[j] = tx; T[j + 1] = ty; T[j + 2] = tz;
                  C[j] = col[i3]; C[j + 1] = col[i3 + 1]; C[j + 2] = col[i3 + 2]; A[i4 + k] = a; D[i4 + k] = wid[i];
                }
              }
              live = any; obj.visible = any;
              const cnt = [top * 12, top * 12, top * 12, top * 4, top * 4];
              for (let k = 0; k < 5; k++) { const at = geo.attributes[keys[k]]; at.updateRange.offset = 0; at.updateRange.count = cnt[k]; at.needsUpdate = true; }
            }
          };
        };
        const fxSpark = fxStreaks(420);
        const fxDebN = 44, fxDebM = own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.55 }));
        const fxDeb = new THREE.InstancedMesh(own(new THREE.TetrahedronGeometry(1, 0)), fxDebM, fxDebN); fxDeb.frustumCulled = false; fxDeb.visible = false; scene.add(fxDeb); own(fxDeb);
        const fxDb = { p: new Float32Array(fxDebN * 3), v: new Float32Array(fxDebN * 3), ax: new Float32Array(fxDebN * 3), w: new Float32Array(fxDebN), s: new Float32Array(fxDebN), l: new Float32Array(fxDebN), hot: new Float32Array(fxDebN), q: [], head: 0, live: false };
        const fxTc = new THREE.Color(), fxTc2 = new THREE.Color(), fxQ2 = new THREE.Quaternion(), fxM4 = new THREE.Matrix4(), fxVa = new THREE.Vector3(), fxVb = new THREE.Vector3(), fxZero = new THREE.Matrix4().makeScale(0, 0, 0);
        for (let i = 0; i < fxDebN; i++) { fxDb.q.push(new THREE.Quaternion()); fxDeb.setMatrixAt(i, fxZero); fxDeb.setColorAt(i, fxTc.set(0x444444)); }
        const fxDebris = (x, y, z, n, sp, color, hot, up) => {
          for (let k = 0; k < n; k++) {
            const i = fxDb.head, i3 = i * 3; fxDb.head = (fxDb.head + 1) % fxDebN;
            let dx = R(), dy = R(), dz = Math.random() * 0.8 + (up || 0.3); const l = Math.hypot(dx, dy, dz) || 1, s = sp * (0.45 + Math.random() * 0.75);
            fxDb.p[i3] = x + R() * 30; fxDb.p[i3 + 1] = y + R() * 30; fxDb.p[i3 + 2] = z + R() * 20;
            fxDb.v[i3] = dx / l * s; fxDb.v[i3 + 1] = dy / l * s; fxDb.v[i3 + 2] = dz / l * s;
            fxVa.set(R(), R(), R()).normalize(); fxDb.ax[i3] = fxVa.x; fxDb.ax[i3 + 1] = fxVa.y; fxDb.ax[i3 + 2] = fxVa.z;
            fxDb.w[i] = 6 + Math.random() * 14; fxDb.s[i] = 7 + Math.random() * 15; fxDb.l[i] = 2.2 + Math.random() * 1.4; fxDb.hot[i] = hot && k % 2 === 0 ? 1.3 : 0;
            fxDb.q[i].set(R(), R(), R(), 1).normalize();
            fxTc.set(Math.random() < 0.55 ? color : 0x2a2d33); fxDeb.setColorAt(i, fxTc);
          }
          fxDb.live = true; fxDeb.visible = true; fxDeb.instanceColor.needsUpdate = true;
        };
        const fxDebUpdate = dt => {
          if (!fxDb.live) return;
          let any = false;
          for (let i = 0; i < fxDebN; i++) {
            if (fxDb.l[i] <= 0) continue;
            const i3 = i * 3, p = fxDb.p, v = fxDb.v;
            fxDb.l[i] -= dt;
            if (fxDb.l[i] <= 0) { fxDeb.setMatrixAt(i, fxZero); continue; }
            any = true;
            const dd = Math.exp(-0.6 * dt);
            v[i3] *= dd; v[i3 + 1] *= dd; v[i3 + 2] = v[i3 + 2] * dd - 980 * dt;
            p[i3] += v[i3] * dt; p[i3 + 1] += v[i3 + 1] * dt; p[i3 + 2] += v[i3 + 2] * dt;
            const s = fxDb.s[i];
            if (p[i3 + 2] < s * 0.6) { p[i3 + 2] = s * 0.6; if (v[i3 + 2] < 0) { v[i3 + 2] *= -0.32; v[i3] *= 0.6; v[i3 + 1] *= 0.6; fxDb.w[i] *= 0.55; } }
            if (Math.abs(p[i3]) > 4060) { p[i3] = Math.sign(p[i3]) * 4060; v[i3] *= -0.4; }
            if (Math.abs(p[i3 + 1]) > 5980) { p[i3 + 1] = Math.sign(p[i3 + 1]) * 5980; v[i3 + 1] *= -0.4; }
            fxQ2.setFromAxisAngle(fxVa.set(fxDb.ax[i3], fxDb.ax[i3 + 1], fxDb.ax[i3 + 2]), fxDb.w[i] * dt); fxDb.q[i].multiply(fxQ2);
            const sc = s * Math.min(1, fxDb.l[i] / 0.5);
            fxM4.compose(fxVb.set(p[i3], p[i3 + 1], p[i3 + 2]), fxDb.q[i], fxVa.set(sc, sc * 0.7, sc * 0.45)); fxDeb.setMatrixAt(i, fxM4);
            if (fxDb.hot[i] > 0) {
              fxDb.hot[i] -= dt;
              if (Math.random() < 0.16) smoke.emit(p[i3], p[i3 + 1], p[i3 + 2], R() * 20, R() * 20, 30, 0.7 + Math.random() * 0.4, 0.13, 0.12, 0.12, 30, 120, -40, 1.5);
              if (Math.random() < 0.3) fire.emit(p[i3], p[i3 + 1], p[i3 + 2], R() * 40, R() * 40, R() * 40, 0.22, 1, 0.5, 0.15, 34, 6, 0, 2);
            }
          }
          fxDeb.instanceMatrix.needsUpdate = true;
          if (!any) { fxDb.live = false; fxDeb.visible = false; }
        };
        const fxShk = [], fxSphG = own(new THREE.SphereGeometry(1, 28, 18)), fxRingG = own(new THREE.RingGeometry(0.55, 1, 64, 1));
        for (let i = 0; i < 7; i++) {
          const ring = i >= 4, m = own(new THREE.ShaderMaterial({ uniforms: { color: { value: new THREE.Color() }, op: { value: 0 }, ring: { value: ring ? 1 : 0 } }, vertexShader: FXHV, fragmentShader: FXHF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: ring ? THREE.DoubleSide : THREE.FrontSide }));
          const o = new THREE.Mesh(ring ? fxRingG : fxSphG, m); o.visible = false; o.renderOrder = 9; o.frustumCulled = false; scene.add(o);
          fxShk.push({ o, m, ring, t: -1, d: 1, r0: 0, r1: 1, a: 1 });
        }
        const fxZ = new THREE.Vector3(0, 0, 1);
        const fxShock = (x, y, z, color, r0, r1, d, a, ring, nx, ny, nz) => {
          let s = null;
          for (const e of fxShk) { if (e.ring !== !!ring) continue; if (e.t < 0) { s = e; break; } if (!s || e.t > s.t) s = e; }
          s.o.position.set(x, y, z); s.m.uniforms.color.value.set(color); s.t = 0; s.d = d; s.r0 = r0; s.r1 = r1; s.a = a; s.o.visible = true; s.o.scale.setScalar(r0); s.m.uniforms.op.value = a;
          if (ring) s.o.quaternion.setFromUnitVectors(fxZ, fxVa.set(nx || 0, ny || 0, nz == null ? 1 : nz).normalize());
        };
        const fxShkUpdate = dt => {
          for (const s of fxShk) {
            if (s.t < 0) continue;
            s.t += dt; const k = s.t / s.d;
            if (k >= 1) { s.t = -1; s.o.visible = false; continue; }
            const e = 1 - Math.pow(1 - k, 3); s.o.scale.setScalar(s.r0 + (s.r1 - s.r0) * e); s.m.uniforms.op.value = s.a * (1 - k) * (1 - k * 0.4);
          }
        };
        const fxGlowT = tex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.16, 'rgba(255,255,255,.9)'); gr.addColorStop(0.42, 'rgba(255,255,255,.3)'); gr.addColorStop(0.7, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
        const fxFl = [];
        for (let i = 0; i < 6; i++) { const m = own(new THREE.SpriteMaterial({ map: fxGlowT, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false })), s = new THREE.Sprite(m); s.visible = false; s.renderOrder = 10; scene.add(s); fxFl.push({ s, m, t: -1, d: 1, s0: 1, s1: 1, a: 1 }); }
        let fxFlI = 0;
        const fxFlash = (x, y, z, color, s0, s1, d, a) => { const f = fxFl[fxFlI]; fxFlI = (fxFlI + 1) % fxFl.length; f.s.position.set(x, y, z); f.m.color.set(color); f.t = 0; f.d = d; f.s0 = s0; f.s1 = s1; f.a = a; f.s.scale.set(s0, s0, 1); f.m.opacity = a; f.s.visible = true; };
        const fxFlUpdate = dt => {
          for (const f of fxFl) {
            if (f.t < 0) continue;
            f.t += dt; const k = f.t / f.d;
            if (k >= 1) { f.t = -1; f.s.visible = false; continue; }
            const s = f.s0 + (f.s1 - f.s0) * (1 - Math.pow(1 - k, 2.5)); f.s.scale.set(s, s, 1); f.m.opacity = f.a * Math.pow(1 - k, 1.6);
          }
        };
        const fxLight = new THREE.PointLight(0xffffff, 0, 5600, 2); fxLight.position.set(0, 0, -9000); scene.add(fxLight);
        const fxLt = { t: -1, d: 1, i: 0 };
        const fxLightAt = (x, y, z, color, i, d) => { if (fxLt.t >= 0 && fxLight.intensity > i) return; fxLight.position.set(x, y, z); fxLight.color.set(color); fxLt.t = 0; fxLt.d = d; fxLt.i = i; fxLight.intensity = i; };
        const fxQk = [];
        const fxQuake = (x, y, z, a, d, r) => { if (fxQk.length > 7) fxQk.shift(); fxQk.push({ x, y, z, a, d, r, t: 0 }); };
        const fxQuakeAt = p => { let s = 0; for (const q of fxQk) { const k = 1 - q.t / q.d; if (k <= 0) continue; s += q.a * k * k * Math.max(0, 1 - Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) / q.r); } return s; };
        let shake = 0;
        const R = () => Math.random() * 2 - 1;
        const fxDir = (bx, by, bz, up) => { let x = R(), y = R(), z = R(); const l = Math.hypot(x, y, z) || 1; x = x / l + bx; y = y / l + by; z = (up ? Math.abs(z / l) : z / l) + bz; const m = Math.hypot(x, y, z) || 1; fxVa.set(x / m, y / m, z / m); return fxVa; };
        const fxClear = () => { fire.clear(); smoke.clear(); fxSpark.clear(); for (const s of fxShk) { s.t = -1; s.o.visible = false; } for (const f of fxFl) { f.t = -1; f.s.visible = false; } fxDb.l.fill(0); fxDb.live = true; fxLt.t = -1; fxLight.intensity = 0; fxQk.length = 0; };
        const burst = (p, color, big) => {
          fxTc.set(color);
          const n = big ? 220 : 80;
          for (let i = 0; i < n; i++) {
            const sp = (big ? 900 : 500) + Math.random() * (big ? 2400 : 1100), d = fxDir(0, 0, 0, true), wt = Math.random() < 0.3;
            fire.emit(p.x, p.y, p.z, d.x * sp, d.y * sp, d.z * sp, 0.6 + Math.random() * (big ? 1.1 : 0.6), wt ? 1 : fxTc.r, wt ? 1 : fxTc.g, wt ? 1 : fxTc.b, big ? 140 : 110, 10, 500, 2.2);
          }
          for (let i = 0; i < (big ? 30 : 14); i++) { const d = fxDir(0, 0, 0, true), sp = 1400 + Math.random() * 2600; fxSpark.emit(p.x, p.y, p.z, d.x * sp, d.y * sp, d.z * sp, 0.3 + Math.random() * 0.4, fxTc.r * 0.6 + 0.4, fxTc.g * 0.6 + 0.4, fxTc.b * 0.6 + 0.4, 7, 0.05, 400, 2.5); }
          for (let i = 0; i < (big ? 50 : 26); i++) smoke.emit(p.x + R() * 80, p.y + R() * 80, p.z + R() * 40, R() * 400, R() * 400, Math.random() * 500, 1 + Math.random() * 1.2, 0.18, 0.2, 0.25, 120, 380, -60, 1.6);
          fxShock(p.x, p.y, p.z, color, 60, big ? 1700 : 600, big ? 0.8 : 0.5, 0.6, false);
          fxFlash(p.x, p.y, p.z, color, 150, big ? 1800 : 800, big ? 0.6 : 0.35, 0.9);
        };
        const fxGoalClassic = (p, team) => {
          const c = TEAMC[team], x = p.x, y = p.y, z = p.z, sy = y > 0 ? -1 : 1;
          fxTc.set(c); fxTc2.setRGB(fxTc.r + (1 - fxTc.r) * 0.55, fxTc.g + (1 - fxTc.g) * 0.55, fxTc.b + (1 - fxTc.b) * 0.55);
          fxFlash(x, y, z, 0xffe2b0, 300, 2600, 0.3, 0.75);
          fxFlash(x, y, z, 0xff7a1a, 700, 5200, 1.1, 0.6);
          fxFlash(x, y + sy * 250, z + 100, c, 1200, 7000, 1.6, 0.3);
          fxLightAt(x, y + sy * 500, Math.max(z, 250), 0xffa040, 9, 1.9);
          fxShock(x, y, z, 0xffc880, 60, 1300, 0.32, 0.5, false);
          fxShock(x, y, z, 0xff7a1a, 140, 2900, 0.95, 0.55, false);
          fxShock(x, y, 28, c, 150, 3600, 1.3, 0.75, true, 0, 0, 1);
          for (let i = 0; i < 90; i++) { const d = fxDir(0, sy * 0.45, 0.15, false), sp = 2600 + Math.random() * 5200, wt = Math.random() < 0.2; fxSpark.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, 0.45 + Math.random() * 0.7, 1, wt ? 0.9 : 0.55, wt ? 0.6 : 0.15, 16 + Math.random() * 22, 0.11, 200, 2.4); }
          for (let i = 0; i < 170; i++) { const d = fxDir(0, sy * 0.3, 0.2, false), sp = 500 + Math.random() * 3400, k = Math.random(), big = i < 50, q = big ? 0.42 : 0.75; fire.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, 0.5 + Math.random() * 1, q, (0.3 + k * 0.5) * q, (0.04 + k * k * 0.25) * q, big ? 300 + Math.random() * 180 : 150 + Math.random() * 90, 20, 300, 1.9); }
          for (let i = 0; i < 130; i++) { const d = fxDir(0, sy * 0.55, 0.5, false), sp = 500 + Math.random() * 1900, k = Math.random(); smoke.emit(x + d.x * 120, y + d.y * 120, z + d.z * 80, d.x * sp, d.y * sp, d.z * sp + 150, 1.4 + Math.random() * 1, 1, 0.4 + k * 0.38, 0.07 + k * 0.16, 360 + Math.random() * 220, 1150 + Math.random() * 600, -90, 1.5); }
          for (let i = 0; i < 95; i++) { const d = fxDir(0, sy * 0.6, 0.45, false), sp = 300 + Math.random() * 1300, dk = 0.11 + Math.random() * 0.09; smoke.emit(x + d.x * 160, y + d.y * 160, z + d.z * 100, d.x * sp, d.y * sp, d.z * sp + 120, 3.2 + Math.random() * 1.8, dk * 1.9, dk * 1.25, dk * 0.85, 380 + Math.random() * 180, 1300 + Math.random() * 600, -70, 1.25); }
          fxDebris(x, y, z, 22, 2400, 0x2a2622, true, 0.4);
          fxQuake(x, y, z, 1.4, 1.7, 8000);
        };
        const fxGX = [['classic', 'Classic'], ['fireworks', 'Fireworks'], ['ring', 'Shockwave'], ['vortex', 'Black Hole'], ['bolt', 'Thunderstruck'], ['confetti', 'Confetti Party']];
        const fxLater = (ms, f) => api.timeout(() => { if (!dead) f(); }, ms);
        const fxSph = (x, y, z, n, sp, c, sz, life, g, dr) => { for (let i = 0; i < n; i++) { const d = fxDir(0, 0, 0, false), v = sp * (0.8 + Math.random() * 0.2); fire.emit(x, y, z, d.x * v, d.y * v, d.z * v, life * (0.7 + Math.random() * 0.6), c[0], c[1], c[2], sz, sz * 0.15, g, dr); } };
        const fxSnd = (k, d) => { if (typeof noise === 'function') { if (k === 'pop') { noise(0.5, 3200, 0.16, 'bandpass', 0.8, 700, d / 1000, 0.5); tone(160, 0.4, 'sine', 0.14, 50, d / 1000, 0.4); } else if (k === 'zap') { noise(0.9, 5000, 0.2, 'highpass', 0.7, 1200, d / 1000, 0.6); tone(70, 1.2, 'sawtooth', 0.05, 30, d / 1000, 0.5); } else if (k === 'suck') { noise(1.1, 300, 0.12, 'bandpass', 1.2, 2400, d / 1000, 0.4, 0, 0.8); } } };
        const fxGoalBlast = (p, team, kind) => {
          kind = fxGX.some(k => k[0] === kind) ? kind : 'classic';
          if (kind === 'classic') { fxGoalClassic(p, team); return; }
          const c = TEAMC[team ? 1 : 0], x = p.x, y = p.y, z = Math.max(140, p.z), sy = y > 0 ? -1 : 1;
          fxTc.set(c); const T = [fxTc.r, fxTc.g, fxTc.b], W2 = [1, 1, 1];
          fxShock(x, y, 28, c, 150, 3200, 1.2, 0.7, true, 0, 0, 1);
          fxQuake(x, y, z, 1.1, 1.4, 8000);
          if (kind === 'fireworks') {
            const C = [[1, 0.25, 0.3], [0.35, 1, 0.45], [1, 0.85, 0.25], [0.45, 0.65, 1], [1, 0.45, 1], T, [1, 1, 1]];
            fxFlash(x, y, z, 0xffffff, 300, 2600, 0.4, 0.9);
            for (let k = 0; k < 7; k++) fxLater(k * 230, () => {
              const q = C[k], cx = x + R() * 1500, cy = y + sy * (350 + Math.random() * 1100), cz = 420 + Math.random() * 600;
              for (let i = 0; i < 10; i++) fxSpark.emit(x + R() * 200, y, z, (cx - x) * 1.6 + R() * 80, (cy - y) * 1.6, (cz - z) * 1.6, 0.35, 1, 0.85, 0.5, 6, 0.05, 0, 0.5);
              fxLater(380, () => {
                for (let i = 0; i < 70; i++) { const d = fxDir(0, 0, 0, false), v = 900 + Math.random() * 700; fxSpark.emit(cx, cy, cz, d.x * v, d.y * v, d.z * v, 0.7 + Math.random() * 0.6, q[0], q[1], q[2], 9, 0.08, 260, 1.8); }
                fxSph(cx, cy, cz, 60, 700, q, 70, 1.2, 200, 1.6);
                fxFlash(cx, cy, cz, new THREE.Color(q[0], q[1], q[2]).getHex(), 200, 1500, 0.5, 0.8);
                fxSnd('pop', 0);
              });
            });
          } else if (kind === 'ring') {
            fxFlash(x, y, z, 0xffffff, 400, 4200, 0.35, 1); fxLightAt(x, y + sy * 300, z, c, 8, 1.4);
            for (let w = 0; w < 4; w++) fxLater(w * 160, () => {
              fxShock(x, y, z, w % 2 ? c : 0xffffff, 80, 2600 + w * 900, 0.9, 0.8, false);
              fxShock(x, y, z, c, 100, 3600 + w * 600, 1, 0.8, true, 0, sy, 0.25);
              for (let i = 0; i < 160; i++) { const a = i / 160 * TAU, v = 2600 + w * 800, cc = w % 2 ? T : W2; fire.emit(x, y, z, Math.cos(a) * v, Math.sin(a) * v * 0.6, Math.sin(a) * v * 0.7, 0.8, cc[0], cc[1], cc[2], 110, 30, 0, 1.4); }
              fxSnd('pop', 0);
            });
          } else if (kind === 'vortex') {
            fxSnd('suck', 0);
            for (let i = 0; i < 320; i++) {
              const d = fxDir(0, 0, 0, false), r = 1000 + Math.random() * 700, tx = -d.y, ty = d.x, l = 1.1;
              fire.emit(x + d.x * r, y + d.y * r, z + d.z * r * 0.7, (-d.x * r + tx * r * 0.8) / l, (-d.y * r + ty * r * 0.8) / l, -d.z * r * 0.7 / l, l, i % 3 ? 0.55 : T[0], i % 3 ? 0.3 : T[1], i % 3 ? 1 : T[2], 60, 16, 0, 0);
            }
            for (let i = 0; i < 40; i++) smoke.emit(x + R() * 60, y + R() * 60, z + R() * 60, R() * 30, R() * 30, R() * 30, 1.3, 0.02, 0.01, 0.04, 40, 520, 0, 1);
            fxLater(1000, () => {
              fxFlash(x, y, z, 0xd8c8ff, 200, 4800, 0.5, 1); fxFlash(x, y, z, c, 600, 6400, 1.1, 0.6); fxLightAt(x, y, z, 0xb090ff, 9, 1.5);
              fxShock(x, y, z, 0xb89cff, 80, 3000, 0.8, 0.9, false);
              fxSph(x, y, z, 260, 3200, [0.75, 0.55, 1], 150, 0.9, 0, 1.6); fxSph(x, y, z, 120, 2000, T, 200, 1, 0, 1.4);
              for (let i = 0; i < 90; i++) { const d = fxDir(0, 0, 0, false), v = 3000 + Math.random() * 3000; fxSpark.emit(x, y, z, d.x * v, d.y * v, d.z * v, 0.5 + Math.random() * 0.5, 0.85, 0.75, 1, 12, 0.09, 0, 2); }
              fxQuake(x, y, z, 1.4, 1.2, 9000); fxBoom(0.8, 1.8, 1, 0);
            });
          } else if (kind === 'bolt') {
            for (let k = 0; k < 5; k++) fxLater(k * 120, () => {
              let bx = x + R() * 900, by = y + sy * Math.random() * 500, bz = 2000;
              while (bz > 30) {
                const nx = bx + R() * 240, ny = by + R() * 240, nz = bz - 110 - Math.random() * 90;
                fxSpark.emit(nx, ny, nz, (nx - bx) * 0.1, (ny - by) * 0.1, (nz - bz) * 0.1, 0.32, 0.75, 0.88, 1, 22, 10, 0, 0);
                if (Math.random() < 0.25) { const fx2 = nx + R() * 300, fy2 = ny + R() * 300; fxSpark.emit(fx2, fy2, nz - 120, (fx2 - nx) * 0.1, (fy2 - ny) * 0.1, -12, 0.22, 0.6, 0.75, 1, 10, 10, 0, 0); }
                bx = nx; by = ny; bz = nz;
              }
              fxFlash(bx, by, 60, 0xcfe6ff, 300, 2600, 0.25, 1); fxLightAt(bx, by, 900, 0xa8d0ff, 10, 0.5);
              fxSph(bx, by, 60, 50, 1300, [0.7, 0.85, 1], 70, 0.5, 400, 2);
              fxSnd('zap', 0);
            });
            fxLater(650, () => { fxGoalClassic(p, team); });
          } else if (kind === 'confetti') {
            const C = [[1, 0.2, 0.3], [0.2, 0.95, 0.4], [1, 0.9, 0.2], [0.3, 0.6, 1], [1, 0.4, 1], [1, 1, 1], T];
            fxFlash(x, y, z, 0xffffff, 300, 3000, 0.4, 0.9); fxSnd('pop', 0); fxSnd('pop', 120);
            for (let i = 0; i < 460; i++) { const q = C[i % C.length], d = fxDir(0, sy * 0.5, 0.5, false), v = 500 + Math.random() * 1500; fire.emit(x + R() * 60, y + R() * 60, z, d.x * v, d.y * v, d.z * v, 2.2 + Math.random() * 1.6, q[0] * 0.85, q[1] * 0.85, q[2] * 0.85, 34 + Math.random() * 14, 26, 220, 1.4); }
            for (let i = 0; i < 80; i++) { const q = C[i % C.length], d = fxDir(0, sy * 0.3, 0.6, false), v = 1500 + Math.random() * 2500; fxSpark.emit(x, y, z, d.x * v, d.y * v, d.z * v, 0.5, q[0], q[1], q[2], 8, 0.06, 300, 2); }
          }
        };
        const fxDemoBlast = (p, team) => {
          const x = p.x, y = p.y, z = p.z + 10;
          fxFlash(x, y, z, 0xfff1c8, 140, 1100, 0.22, 0.75);
          fxFlash(x, y, z, 0xff7a1a, 260, 1700, 0.6, 0.6);
          fxLightAt(x, y, z + 120, 0xff8a33, 4.5, 1);
          fxShock(x, y, z, 0xff8a2a, 50, 620, 0.4, 0.55, false);
          if (z < 160) fxShock(x, y, 22, 0xffa040, 80, 1000, 0.6, 0.55, true, 0, 0, 1);
          for (let i = 0; i < 70; i++) { const d = fxDir(0, 0, 0.25, false), sp = 120 + Math.random() * 900, k = Math.random(); fire.emit(x + d.x * 30, y + d.y * 30, z + d.z * 20, d.x * sp, d.y * sp, d.z * sp, 0.3 + Math.random() * 0.45, 1, 0.35 + k * 0.4, 0.05 + k * 0.15, 110 + Math.random() * 80, 20, -160, 2.6); }
          for (let i = 0; i < 34; i++) { const d = fxDir(0, 0, 0.35, false), sp = 150 + Math.random() * 650, k = Math.random(); smoke.emit(x + d.x * 40, y + d.y * 40, z + d.z * 30, d.x * sp, d.y * sp, d.z * sp + 80, 0.5 + Math.random() * 0.45, 1, 0.38 + k * 0.42, 0.06 + k * 0.16, 120 + Math.random() * 90, 360 + Math.random() * 160, -60, 2.2); }
          for (let i = 0; i < 40; i++) { const d = fxDir(0, 0, 0.3, false), sp = 1400 + Math.random() * 2600; fxSpark.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, 0.3 + Math.random() * 0.45, 1, 0.6, 0.2, 6 + Math.random() * 6, 0.045, 650, 1.6); }
          for (let i = 0; i < 34; i++) { const d = fxDir(0, 0, 0.6, false), sp = 140 + Math.random() * 520, dk = 0.08 + Math.random() * 0.06; smoke.emit(x + d.x * 60, y + d.y * 60, z + d.z * 40, d.x * sp, d.y * sp, d.z * sp + 90, 1.4 + Math.random() * 1.2, dk, dk * 0.95, dk * 0.92, 130 + Math.random() * 80, 400 + Math.random() * 220, -110, 1.5); }
          fxDebris(x, y, z, 16, 1500, TEAMC[team == null ? 0 : team], true, 0.6);
          fxQuake(x, y, z, 0.8, 1, 3600);
        };
        const fxHit = (bx, by, bz, cx, cy, cz, v) => {
          const s = Math.max(0, Math.min(1, (v - 250) / 3200));
          let nx = cx - bx, ny = cy - by, nz = cz - bz; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
          const x = bx + nx * BR, y = by + ny * BR, z = bz + nz * BR;
          fxFlash(x, y, z, 0xeaf6ff, 60 + 140 * s, 220 + 900 * s, 0.14 + 0.16 * s, 0.5 + 0.5 * s);
          const n = 4 + Math.round(26 * s);
          for (let i = 0; i < n; i++) { const d = fxDir(nx * 0.8, ny * 0.8, nz * 0.8, false), sp = 500 + Math.random() * (900 + 2600 * s); fxSpark.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, 0.14 + Math.random() * 0.24, 1, 0.85, 0.55, 4 + 7 * s, 0.045, 300, 4); }
          if (s > 0.45) { fxShock(bx, by, bz, 0xcfe8ff, BR, BR + 420 * s, 0.3, 0.45 * s, false); for (let i = 0; i < 14; i++) { const d = fxDir(0, 0, 0, false), sp = 300 + Math.random() * 700; fire.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, 0.3, 1, 0.95, 0.85, 60, 6, 0, 3); } }
          if (s > 0.7) fxQuake(bx, by, bz, 0.35 * s, 0.45, 2600);
        };
        const fxPadFx = (x, y, big) => {
          const n = big ? 46 : 14;
          for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, r = (big ? 120 : 60) * Math.random(), up = (big ? 500 : 260) + Math.random() * (big ? 900 : 400); fire.emit(x + Math.cos(a) * r, y + Math.sin(a) * r, 20 + Math.random() * 30, Math.cos(a) * 140, Math.sin(a) * 140, up, 0.35 + Math.random() * 0.4, 1, 0.75 + Math.random() * 0.2, 0.25, big ? 70 : 42, 6, 300, 2); }
          if (big) { fxFlash(x, y, 90, 0xffc860, 140, 700, 0.35, 0.8); fxShock(x, y, 18, 0xffb040, 60, 420, 0.45, 0.8, true, 0, 0, 1); }
          else fxFlash(x, y, 40, 0xffd27a, 60, 260, 0.22, 0.6);
        };
        const fxDust = (x, y, z, n, s, ux, uy, uz) => {
          for (let i = 0; i < n; i++) {
            let dx = R(), dy = R(), dz = R(); const dn = dx * ux + dy * uy + dz * uz; dx -= ux * dn; dy -= uy * dn; dz -= uz * dn; const l = Math.hypot(dx, dy, dz) || 1, sp = (100 + Math.random() * 180) * s, g = 0.4 + Math.random() * 0.1;
            smoke.emit(x + dx / l * 30, y + dy / l * 30, z + dz / l * 30, dx / l * sp + ux * 50, dy / l * sp + uy * 50, dz / l * sp + uz * 50, 0.35 + Math.random() * 0.35, g, g + 0.05, g * 0.85, 26 * s, 95 * s, -20, 3.4);
          }
        };

