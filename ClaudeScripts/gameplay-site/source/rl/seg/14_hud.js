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
            if (bo !== v.bkey) { v.bkey = bo; uiDig(v.bdNum, bo); uiBT(v, bo); v.bd.classList.toggle('full', bo >= 100); }
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
