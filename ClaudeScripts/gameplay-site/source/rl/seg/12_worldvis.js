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
            const on = k > 0 && arSunP.z < 1 && Math.abs(arSunP.x) < 1.2 && Math.abs(arSunP.y) < 1.2 && !(typeof fxQ === 'object' && fxQ.lv >= 3), e = on ? Math.max(0, 1 - Math.hypot(arSunP.x, arSunP.y) * 0.6) : 0;
            for (const fl of arFlare) { fl.sp.visible = on; if (!on) continue; arSunQ.set(arSunP.x * (1 - fl.f), arSunP.y * (1 - fl.f), 0.5).unproject(cam).sub(cam.position).normalize().multiplyScalar(1000).add(cam.position); fl.sp.position.copy(arSunQ); fl.sp.scale.set(fl.sz, fl.sz, 1); fl.sp.material.opacity = fl.o * e * k; }
          }
        };

