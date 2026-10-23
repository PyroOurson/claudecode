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


