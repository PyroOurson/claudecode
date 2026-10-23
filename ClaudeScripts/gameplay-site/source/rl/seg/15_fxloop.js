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

