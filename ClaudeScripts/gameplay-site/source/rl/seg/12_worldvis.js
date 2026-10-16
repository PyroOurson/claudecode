        let arLW = null, arL0 = 0, arL1 = 0;
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
        };

