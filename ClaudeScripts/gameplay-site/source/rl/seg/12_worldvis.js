        let arLW = null, arL0 = 0, arL1 = 0;
        const arSunV = new THREE.Vector3();
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
          if (views[0] && views[0].camera) { views[0].camera.getWorldDirection(arSunV); const k = clamp((arSunV.dot(arSunD) - 0.2) / 0.8, 0, 1); arSunH.material.opacity = 0.18 + 0.6 * k * k; arRays.material.opacity = 0.03 + 0.12 * k; }
        };

