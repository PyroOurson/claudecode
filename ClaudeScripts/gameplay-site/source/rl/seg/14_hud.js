        const uiTrHud = v => {
          const T = W.train, L = uiTrSpawns();
          if (!T) return;
          const key = [T.goals | 0, T.saves | 0, T.shotsTaken | 0, T.unlimited, T.shots, T.spawn, coarse].join('|');
          if (key === v.trKey) return;
          v.trKey = key;
          const tg = on => `<i class="${on ? 'on' : ''}">${on ? 'On' : 'Off'}</i>`;
          v.trn.innerHTML = `<div class="trp"><b>Free Play</b><span>Goals<em>${T.goals | 0}</em></span><span>Saves<em>${T.saves | 0}</em></span><span>Shots<em>${T.shotsTaken | 0}</em></span></div>${coarse ? '' : `<div class="trk"><div>${uiK('R')}Reset ball</div><div>${uiK('T')}Reset car</div><div>${uiK('G')}Shoot a ball at me</div><div>${uiK('B')}Unlimited boost ${tg(T.unlimited)}</div><div>${uiK('P')}Shot practice ${tg(T.shots)}</div><div>${uiK('1')}–${uiK(String(L.length))}Ball spawn <i class="on">${esc(uiTrSN(T.spawn))}</i></div><div>${uiK('Esc', 'kb')}Free Play menu</div></div>`}`;
        };
        const hudUpdate = dt => {
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
          if (ui !== 'play' && ui !== 'end' && ui !== 'left') return;
          const tr = mode === 'train';
          const clk = W.ot ? '+' + mmss(W.otT) : mmss(Math.ceil(W.clock));
          for (const v of active()) {
            const me = v.car, L = me ? me.team : 0, bo = me ? clamp(Math.floor(me.boost), 0, 100) : 0;
            if (tr) { if (!v.sb.hidden) v.sb.hidden = true; if (ui === 'play') uiTrHud(v); }
            else {
              const key = W.score[0] + '|' + W.score[1] + '|' + clk + '|' + L + '|' + W.ot;
              if (key !== v.key) {
                v.key = key;
                v.sbL.className = 'sq c' + L; v.sbR.className = 'sq r c' + (1 - L); v.bd.classList.toggle('b', L === 0);
                uiDig(v.sbLd, W.score[L]); uiDig(v.sbRd, W.score[1 - L]); uiDig(v.sbCd, clk);
                v.sbC.classList.toggle('ot', W.ot);
              }
            }
            if (tr && v.key !== 'tr') { v.key = 'tr'; v.bd.classList.toggle('b', L === 0); }
            if (bo !== v.bkey) { v.bkey = bo; uiDig(v.bdNum, bo); v.bdSec.setAttribute('d', uiSec(bo / 100)); }
            if (me) {
              const dm = me.demoT > 0 ? Math.ceil(me.demoT) : 0, sk = dm ? 'd' + dm : W.state === 'play' && W.timeUp && !tr ? 'tu' : '';
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
