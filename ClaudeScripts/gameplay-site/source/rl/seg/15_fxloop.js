        let fxMissT = 0, fxSputT = 0;
        const soundUpdate = () => {
          if (!AC || !fxEngV.length) return;
          const t = AC.currentTime, on = (ui === 'play' || ui === 'end') && !paused && !api.muted, vs = views;
          master.gain.setTargetAtTime(api.muted || saved.mute ? 0 : (paused ? 0.3 : 0.85) * saved.vol / 85, t, 0.05);
          let bst = 0, sup = 0, wsp = 0;
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
            E.boost = b; E.sup = ss;
            if (b) bst = live ? 0.55 + 0.45 * c.boostK : 1; if (ss) sup = 1; wsp = Math.max(wsp, sp);
          }
          bstG.gain.setTargetAtTime(bst * 0.13, t, 0.035); fxBst2.gain.setTargetAtTime(bst * 0.17, t, 0.05); fxBst3.gain.setTargetAtTime(bst * 0.05, t, 0.04);
          bstF.frequency.setTargetAtTime(560 + wsp * 0.28, t, 0.1);
          windG.gain.setTargetAtTime(sup ? 0.05 : clamp((wsp - 1500) / 800, 0, 1) * 0.016, t, 0.12);
          crowdF.frequency.setTargetAtTime(470 + Math.sin(t * 0.37) * 55 + Math.sin(t * 1.13) * 25, t, 0.3);
          if (on && W.state === 'play' && !fxRp.on) {
            const B = W.ball, now = performance.now();
            if (Math.abs(B.p.y) > 4300 && Math.abs(B.p.x) < 1500 && B.p.z < 1000 && B.v.y * B.p.y > 0 && Math.abs(B.v.y) > 900 && now > fxMissT) { fxMissT = now + 4000; crowdSwell(0.13, 2.2, 0.5); }
          }
        };
        const renderViews = () => {
          const v = views[0], pr = renderer.getPixelRatio();
          fire.mat.uniforms.scale.value = smoke.mat.uniforms.scale.value = h * pr * 0.5 / Math.tan(v.camera.fov * Math.PI / 360);
          renderer.render(scene, v.camera);
        };


        const STEP = 1 / CFG.hz;
        let acc = 0;
        api.loop((dt, t) => {
          if (dead) return;
          dt *= uiDbgK;
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
                while (acc >= STEP && n < 8) {
                  if (ui === 'play') { const v = views[0]; if (v.car) { if (online && !(pz.hidden && uiOptEl.hidden)) uiNeutral(v.car.ctl); else readInput(v, v.car.ctl); } }
                  if (host) online.H.pre();
                  worldStep(W, STEP); acc -= STEP; n++;
                }
                if (n >= 8) acc = 0;
                if (host) hostSend();
              }
              handleEvents();
            }
            visuals(dt, t / 1000);
            if (fxRp.on) fxRpPost(); else { fxRecord(); fxRpCheck(); }
          }
          cameraUpdate(views[0], paused ? 0 : dt);
          if (uiDbgCam) { const c = views[0].camera; c.position.set(uiDbgCam[0], uiDbgCam[1], uiDbgCam[2]); c.up.set(0, 0, 1); c.lookAt(uiDbgCam[3], uiDbgCam[4], uiDbgCam[5]); }
          if (shake > 0) shake = Math.max(0, shake - dt * 1.6);
          hudUpdate(dt);
          soundUpdate();
          renderViews();
        });

