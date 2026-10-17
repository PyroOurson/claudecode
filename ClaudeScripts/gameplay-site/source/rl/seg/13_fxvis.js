        const fxVisuals = (dt, t) => {
          fxDebUpdate(dt); fire.update(dt); smoke.update(dt); fxSpark.update(dt); fxShkUpdate(dt); fxFlUpdate(dt);
          if (fxLt.t >= 0) { fxLt.t += dt; const k = fxLt.t / fxLt.d; if (k >= 1) { fxLt.t = -1; fxLight.intensity = 0; } else fxLight.intensity = fxLt.i * (1 - k) * (1 - k); }
          for (let i = fxQk.length - 1; i >= 0; i--) { fxQk[i].t += dt; if (fxQk[i].t >= fxQk[i].d) fxQk.splice(i, 1); }
          fxBoostFx(dt); fxWheelFx(dt);
        };
        const fxWheelFx = dt => {
          if (ui !== 'play' || W.state === 'menu' || dt <= 0 || fxQ.lv >= 3) return;
          for (const c of W.cars) {
            if (c.demoT > 0 || !c.onGround || !c.cfg) continue;
            const sp = vlen(c.v), slip = Math.abs(c.v.x * c.l.x + c.v.y * c.l.y + c.v.z * c.l.z), sl = c.slide || 0;
            const k = Math.max(sl > 0.2 ? clamp((slip - 150) / 600, 0, 1) * sl : 0, clamp((slip - 500) / 700, 0, 1), sp > 1250 ? 0.12 * clamp((sp - 1250) / 900, 0, 1) : 0);
            if (k <= 0) continue;
            for (let i = 2; i < 4; i++) {
              if (Math.random() > k * 34 * dt) continue;
              const q = c.cfg.wh[i], x = c.p.x + c.f.x * q.x + c.l.x * q.y - c.u.x * 14, y = c.p.y + c.f.y * q.x + c.l.y * q.y - c.u.y * 14, z = c.p.z + c.f.z * q.x + c.l.z * q.y - c.u.z * 14, g = 0.55 + Math.random() * 0.12;
              smoke.emit(x, y, z, c.v.x * 0.18 + R() * 40 + c.u.x * 60, c.v.y * 0.18 + R() * 40 + c.u.y * 60, c.v.z * 0.18 + R() * 40 + c.u.z * 60, 0.45 + Math.random() * 0.4, g, g, g * 0.92, 16 + 10 * k, 60 + 50 * k, -25, 2.6);
            }
          }
        };
        let fxWA = 0;
        const fxBoostFx = dt => {
          const c = views[0] && views[0].car;
          if (!c || c.demoT > 0 || ui !== 'play' || (fxRp.on && fxRp.show) || W.state === 'menu') return;
          if (c.boosting && saved.shake !== false) shake = Math.max(shake, 0.035 * c.boostK + (c.sup ? 0.02 : 0));
          const sp = vlen(c.v);
          if (!c.sup && sp < 1900) { fxWA = 0; return; }
          fxWA += dt * (c.sup ? 90 : 30) * clamp((sp - 1700) / 600, 0, 1);
          const cm = views[0].camera.position, ix = c.v.x / (sp || 1), iy = c.v.y / (sp || 1), iz = c.v.z / (sp || 1);
          while (fxWA >= 1) {
            fxWA -= 1;
            const d = fxDir(0, 0, 0, false), r = 140 + Math.random() * 260, ax = cm.x + ix * (260 + Math.random() * 500) + d.x * r, ay = cm.y + iy * (260 + Math.random() * 500) + d.y * r, az = cm.z + iz * 300 + d.z * r * 0.7;
            fxSpark.emit(ax, ay, az, c.v.x * 0.15 - ix * 1400, c.v.y * 0.15 - iy * 1400, c.v.z * 0.15 - iz * 1400, 0.16 + Math.random() * 0.08, 0.55, 0.62, 0.7, 1.4, 0.07, 0, 0);
          }
        };
        const visuals = (dt, t) => { carVisuals(dt, t); worldVisuals(dt, t); fxVisuals(dt, t); };


        const FX_SKIP = new Set(['id', 'team', 'slot', 'name', 'bot', 'body', 'st', 'bumpT', 'ai']), FX_RPAT = 2.6;
        const fxSch = o => {
          const s = [];
          for (const k in o) {
            if (FX_SKIP.has(k)) continue;
            const x = o[k];
            if (typeof x === 'number') s.push([k, '', 0]);
            else if (typeof x === 'boolean') s.push([k, '', 1]);
            else if (x && typeof x === 'object' && !Array.isArray(x) && !ArrayBuffer.isView(x)) {
              if (typeof x.x === 'number' && typeof x.y === 'number' && typeof x.z === 'number') s.push([k, '', 2]);
              else if (k === 'ctl') for (const j in x) { if (typeof x[j] === 'number') s.push([k, j, 0]); else if (typeof x[j] === 'boolean') s.push([k, j, 1]); }
            }
          }
          return s;
        };
        const fxSz = s => { let n = 0; for (const e of s) n += e[2] === 2 ? 3 : 1; return n; };
        const fxPut = (o, s, a, off) => {
          for (let i = 0; i < s.length; i++) {
            const e = s[i], tg = e[1] ? o[e[0]] : o, x = tg ? tg[e[1] || e[0]] : undefined;
            if (e[2] === 2) { if (x) { a[off] = x.x; a[off + 1] = x.y; a[off + 2] = x.z; } else a[off] = a[off + 1] = a[off + 2] = 0; off += 3; }
            else a[off++] = e[2] === 1 ? (x ? 1 : 0) : +x || 0;
          }
          return off;
        };
        const fxL = (a, b, k) => a === b ? a : isFinite(a) && isFinite(b) ? a + (b - a) * k : k < 0.5 ? a : b;
        const fxSet = (o, s, a, oa, ob, k) => {
          for (let i = 0; i < s.length; i++) {
            const e = s[i], tg = e[1] ? o[e[0]] : o, key = e[1] || e[0];
            if (e[2] === 2) { const x = tg && tg[key]; if (x) { x.x = fxL(a[oa], a[ob], k); x.y = fxL(a[oa + 1], a[ob + 1], k); x.z = fxL(a[oa + 2], a[ob + 2], k); } oa += 3; ob += 3; }
            else { if (tg) tg[key] = e[2] === 1 ? (k < 0.5 ? a[oa] : a[ob]) > 0.5 : fxL(a[oa], a[ob], k); oa++; ob++; }
          }
        };
        const fxOrtho = c => {
          const f = c.f, u = c.u, l = c.l; if (!f || !u || !l) return;
          let n = Math.hypot(f.x, f.y, f.z) || 1; f.x /= n; f.y /= n; f.z /= n;
          l.x = u.y * f.z - u.z * f.y; l.y = u.z * f.x - u.x * f.z; l.z = u.x * f.y - u.y * f.x; n = Math.hypot(l.x, l.y, l.z) || 1; l.x /= n; l.y /= n; l.z /= n;
          u.x = f.y * l.z - f.z * l.y; u.y = f.z * l.x - f.x * l.z; u.z = f.x * l.y - f.y * l.x;
        };
        const fxRec = { W: null, cs: [], bs: [], cw: 0, bw: 0, nc: 0, np: 0, st: 0, cap: 600, t: new Float64Array(600), d: null, head: 0, n: 0, last: -1, goT: -1e9, ev: [], pi: -1 };
        const fxRecInit = () => {
          const R2 = fxRec;
          R2.W = W; R2.cs = W.cars.length ? fxSch(W.cars[0]) : []; R2.bs = fxSch(W.ball); R2.cw = fxSz(R2.cs); R2.bw = fxSz(R2.bs); R2.nc = W.cars.length; R2.np = W.pads.length;
          R2.st = R2.nc * R2.cw + R2.bw + 4 + R2.np;
          if (!R2.d || R2.d.length < R2.cap * R2.st) R2.d = new Float32Array(R2.cap * R2.st);
          R2.head = 0; R2.n = 0; R2.last = -1; R2.goT = -1e9; R2.ev.length = 0; R2.pi = -1;
          let o = 0; for (const e of R2.cs) { if (e[0] === 'p' && !e[1]) R2.pi = o; o += e[2] === 2 ? 3 : 1; }
          fxRp.goal = null; fxRp.goalT = -1; fxRp.done = -1;
        };
        const fxRecord = () => {
          if (online || ui !== 'play') return;
          const R2 = fxRec;
          if (R2.W !== W || R2.nc !== W.cars.length || R2.np !== W.pads.length || W.time < R2.last) fxRecInit();
          if (W.state === 'menu' || W.time - R2.last < 1 / 75) return;
          R2.last = W.time;
          const i = R2.head, d = R2.d; let o = i * R2.st;
          R2.t[i] = W.time;
          for (const c of W.cars) o = fxPut(c, R2.cs, d, o);
          o = fxPut(W.ball, R2.bs, d, o);
          const q = ballM.quaternion; d[o] = q.x; d[o + 1] = q.y; d[o + 2] = q.z; d[o + 3] = q.w; o += 4;
          for (const p of W.pads) d[o++] = p.t;
          R2.head = (i + 1) % R2.cap; if (R2.n < R2.cap) R2.n++;
        };
        const fxRecEv = e => {
          const ev = fxRec.ev; ev.push({ t: W.time, e });
          while (ev.length > 360 || (ev.length && W.time - ev[0].t > 12)) ev.shift();
        };
        const fxRq = new THREE.Quaternion(), fxRq2 = new THREE.Quaternion();
        const fxRp = { on: false, show: false, W: null, ph: 0, pt: 0, t: 0, t0: 0, t1: 0, ei: 0, cur: 0, goal: null, goalT: -1, done: -1, live: null, skip: false, scorer: null };
        const fxBin = (() => { const r = rngOf(7), o = []; for (let i = 0; i < 4; i++) { let s = ''; for (let j = 0; j < 22; j++) s += r() < 0.3 ? ' ' : r() < 0.5 ? '0' : '1'; o.push(s); } return o.join('\n'); })();
        const fxRpEls = views.map(v => { const d = el('div', 'fxrp', v.el, `<div class="fxl"><i></i>Replay</div><div class="fxc"><small>Scored by</small><div class="fxcd"><span class="fxav"></span><b></b><i class="fxbin">${fxBin}</i></div><div class="fxs"><span>${uiIC.clock}<b class="fxt"></b></span><span>${uiIC.ballk}<b class="fxv"></b><small>MPH</small></span></div></div><div class="fxk"><div>${coarse ? 'Tap to skip' : 'Press <kbd>' + (v.i ? 'Enter' : 'Space') + '</kbd> to skip'}</div><div class="fxn"></div></div><div class="fxw"><i></i><i></i><i></i>${uiShield}</div>`); return { d, w: d.querySelector('.fxw'), av: d.querySelector('.fxav'), nm: d.querySelector('.fxcd b'), t: d.querySelector('.fxt'), sp: d.querySelector('.fxv'), n: d.querySelector('.fxn'), lb: d.querySelector('.fxc>small') }; });
        const fxWipe = () => { for (const x of fxRpEls) { x.w.classList.remove('fxgo'); void x.w.offsetWidth; x.w.classList.add('fxgo'); } };
        const fxSnap = buf => {
          const R2 = fxRec; let o = 0;
          for (const c of W.cars) o = fxPut(c, R2.cs, buf, o);
          o = fxPut(W.ball, R2.bs, buf, o);
          const q = ballM.quaternion; buf[o] = q.x; buf[o + 1] = q.y; buf[o + 2] = q.z; buf[o + 3] = q.w; o += 4;
          for (const p of W.pads) buf[o++] = p.t;
        };
        const fxUnsnap = buf => {
          const R2 = fxRec; let o = 0;
          for (const c of W.cars) { fxSet(c, R2.cs, buf, o, o, 0); o += R2.cw; }
          fxSet(W.ball, R2.bs, buf, o, o, 0); o += R2.bw;
          ballM.quaternion.set(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]); o += 4;
          for (const p of W.pads) p.t = buf[o++];
        };
        const fxRpApply = rt => {
          const R2 = fxRec, n = R2.n, cap = R2.cap, base = R2.head - n + cap, d = R2.d;
          let j = fxRp.cur;
          while (j < n - 2 && R2.t[(base + j + 1) % cap] <= rt) j++;
          while (j > 0 && R2.t[(base + j) % cap] > rt) j--;
          fxRp.cur = j;
          const ia = (base + j) % cap, ib = (base + Math.min(j + 1, n - 1)) % cap, ta = R2.t[ia], tb = R2.t[ib];
          const k = tb > ta ? clamp((rt - ta) / (tb - ta), 0, 1) : 0;
          let oa = ia * R2.st, ob = ib * R2.st;
          for (const c of W.cars) {
            let kk = k;
            if (R2.pi >= 0) { const pa = oa + R2.pi, pb = ob + R2.pi; if (Math.abs(d[pa] - d[pb]) + Math.abs(d[pa + 1] - d[pb + 1]) + Math.abs(d[pa + 2] - d[pb + 2]) > 400) kk = k < 0.5 ? 0 : 1; }
            fxSet(c, R2.cs, d, oa, ob, kk); fxOrtho(c);
            oa += R2.cw; ob += R2.cw;
          }
          fxSet(W.ball, R2.bs, d, oa, ob, k); oa += R2.bw; ob += R2.bw;
          fxRq.set(d[oa], d[oa + 1], d[oa + 2], d[oa + 3]); fxRq2.set(d[ob], d[ob + 1], d[ob + 2], d[ob + 3]); fxRq.slerp(fxRq2, k); oa += 4; ob += 4;
          for (let i = 0; i < W.pads.length; i++) W.pads[i].t = d[ob + i];
        };
        const fxRpEvents = (a, b) => { const ev = fxRec.ev; while (fxRp.ei < ev.length && ev[fxRp.ei].t <= b) { const x = ev[fxRp.ei++]; if (x.t > a) fxEvent(x.e, true); } };
        const fxRpShow = on => {
          const Rp = fxRp;
          if (on) { if (!Rp.live || Rp.live.length !== fxRec.st) Rp.live = new Float64Array(fxRec.st); fxSnap(Rp.live); }
          else if (Rp.W === W) fxUnsnap(Rp.live);
          Rp.show = on;
          fxClear(); bindCars();
          wrap.classList.toggle('fxrep', on);
          for (const x of fxRpEls) x.d.classList.toggle('fxon', on);
          for (const v of views) {
            const S = fxCS[v.i];
            if (on) { S.fov0 = v.camera.fov; S.rs = -1; }
            else { if (S.fov0) { v.camera.fov = S.fov0; v.camera.updateProjectionMatrix(); } S.fov0 = 0; S.snap = true; v.latch = false; }
          }
        };
        const fxRpBegin = () => {
          const R2 = fxRec, g = fxRp.goal, Rp = fxRp;
          Rp.done = Rp.goalT;
          if (R2.n < 20 || R2.W !== W) return;
          const cap = R2.cap, first = R2.t[(R2.head - R2.n + cap) % cap], last = R2.t[(R2.head - 1 + cap) % cap];
          const t0 = Math.max(Rp.goalT - 5, first, R2.goT - 0.3), t1 = Math.min(Rp.goalT + 0.7, last);
          if (t1 - t0 < 1.2) return;
          Rp.on = true; Rp.show = false; Rp.W = W; Rp.ph = 0; Rp.pt = 0; Rp.t = t0; Rp.t0 = t0; Rp.t1 = t1; Rp.cur = 0; Rp.skip = false; Rp.scorer = g.scorer || W.lastTouch || null;
          Rp.ei = 0; while (Rp.ei < R2.ev.length && R2.ev[Rp.ei].t <= t0) Rp.ei++;
          const sc = g.scorer, who = sc ? sc.name : TEAMN[g.team];
          const tc = g.team ? ['#ff8a2a', '#9a3a08'] : ['#3f8cff', '#123a8c'];
          for (const x of fxRpEls) {
            x.av.innerHTML = sc && sc.bot ? '<i class="fxai">AI</i>' : uiAv(sc, g.team); x.nm.textContent = who; x.t.textContent = g.clk || ''; x.sp.textContent = Math.round(g.speed * 0.02237); x.lb.textContent = sc ? 'Scored by' : 'Own goal';
            x.n.innerHTML = (g.assist ? `<i class="p${g.assist.team}">${esc(g.assist.name)}</i>, ` : '') + esc(who);
            x.d.classList.toggle('t1', g.team === 1); x.d.style.setProperty('--tc', tc[0]); x.d.style.setProperty('--td', tc[1]);
          }
          fxWipe(); noise(0.5, 300, 0.07, 'bandpass', 0.8, 2600, 0, 0.2);
        };
        const fxRpCheck = () => {
          const g = fxRp.goal;
          if (!g || fxRp.done === fxRp.goalT || W.state !== 'goal' || W.stateT < FX_RPAT) return;
          if (online || mode === 'online' || ui !== 'play' || W.ot || W.timeUp || W.clock <= 0 || fxRec.W !== W) { fxRp.done = fxRp.goalT; return; }
          fxRpBegin();
        };
        const fxRpTick = dt => {
          const Rp = fxRp;
          Rp.pt += dt;
          if (Rp.ph === 0) { if (Rp.pt >= 0.3) { fxRpShow(true); Rp.ph = 1; Rp.pt = 0; fxRpApply(Rp.t); } return; }
          if (Rp.ph === 1) {
            const a = Rp.t; Rp.t = Math.min(Rp.t1, Rp.t + dt);
            fxRpApply(Rp.t); fxRpEvents(a, Rp.t);
            if (Rp.t >= Rp.t1 || Rp.skip) { Rp.ph = 2; Rp.pt = 0; fxWipe(); noise(0.45, 2400, 0.06, 'bandpass', 0.8, 300, 0, 0.2); }
            return;
          }
          if (Rp.show) {
            if (!Rp.skip) { const a = Rp.t; Rp.t = Math.min(Rp.t1, Rp.t + dt); fxRpApply(Rp.t); fxRpEvents(a, Rp.t); }
            if (Rp.pt >= 0.3) fxRpShow(false);
          } else if (Rp.pt >= 0.65) Rp.on = false;
        };
        const fxRpPost = () => { if (fxRp.show) ballM.quaternion.copy(fxRq); };
        const fxRpAbort = () => {
          if (fxRp.show) fxRpShow(false);
          fxRp.on = false; fxRp.show = false;
          for (const x of fxRpEls) { x.d.classList.remove('fxon'); x.w.classList.remove('fxgo'); }
          wrap.classList.remove('fxrep');
        };
        const fxSkip = () => { if (fxRp.on && fxRp.ph === 1 && fxRp.show && fxRp.t - fxRp.t0 > 0.2) fxRp.skip = true; };
        api.on(window, 'keydown', e => { if (fxRp.on && !paused && !e.repeat && /^(Space|Enter|NumpadEnter|KeyO)$/.test(e.code)) { fxSkip(); for (const v of views) v.latch = false; } });
        api.on(wrap, 'pointerdown', e => { if (fxRp.on && !paused && !(e.target && e.target.closest && e.target.closest('.pb,.cb'))) { fxSkip(); for (const v of views) v.latch = false; } });
        const fxRpCam = (v, S, dt) => {
          const cmr = v.camera, Rp = fxRp, B = W.ball, g = Rp.goal, gs = g && g.p.y > 0 ? 1 : -1, pre = Rp.goalT - Rp.t;
          const bp = B.hidden ? fxGoal.p : B.p;
          const sh = Rp.t1 - Rp.t0 > 3.2 && pre > 2.1 ? 0 : pre > 0.8 ? 1 : 2;
          let snap = false;
          if (sh !== S.rs) {
            S.rs = sh; snap = true;
            cmr.fov = (S.fov0 || cmr.fov) * (sh === 0 ? 0.9 : sh === 1 ? 0.85 : 0.74); cmr.updateProjectionMatrix();
            S.rgx = bp.x > 0 ? -1 : 1;
          }
          if (sh === 0) {
            const c = Rp.scorer && Rp.scorer.demoT <= 0 ? Rp.scorer : null;
            if (c) {
              cT.set(bp.x - c.p.x, bp.y - c.p.y, 0); if (cT.lengthSq() < 1) cT.set(c.f.x, c.f.y, 0); cT.normalize();
              cP.set(c.p.x - cT.x * 420, c.p.y - cT.y * 420, c.p.z + 165);
              cL.set(bp.x * 0.62 + c.p.x * 0.38, bp.y * 0.62 + c.p.y * 0.38, bp.z * 0.62 + c.p.z * 0.38 + 40);
            } else {
              cT.set(B.v.x, B.v.y, 0); if (cT.lengthSq() < 1e4) cT.set(0, gs, 0); cT.normalize();
              cP.set(bp.x - cT.x * 950, bp.y - cT.y * 950, bp.z + 380); cL.copy(bp);
            }
          } else if (sh === 1) {
            cT.set(-bp.x, gs * 5120 - bp.y, 0); if (cT.lengthSq() < 1e4) cT.set(0, gs, 0); cT.normalize();
            cP.set(bp.x - cT.x * 680, bp.y - cT.y * 680, Math.max(170, bp.z * 0.5 + 150)); cL.set(bp.x + cT.x * 260, bp.y + cT.y * 260, bp.z);
          } else {
            const k = clamp((Rp.t - (Rp.goalT - 0.8)) / 1.6, 0, 1);
            cP.set(S.rgx * (620 - 100 * k), gs * (5120 - 1350 + 150 * k), 150 + Math.max(0, bp.z - 400) * 0.25); cL.set(bp.x * 0.35, bp.y * 0.35 + gs * 5120 * 0.65, bp.z * 0.35 + 190);
          }
          fxPush(cP, 70);
          if (snap) { S.rp.copy(cP); S.rl.copy(cL); }
          else { S.rp.lerp(cP, 1 - Math.exp(-(sh === 0 ? 4 : sh === 1 ? 2.6 : 5) * dt)); S.rl.lerp(cL, 1 - Math.exp(-(sh === 0 ? 6 : 10) * dt)); }
          cA.copy(S.rl).sub(S.rp); if (cA.lengthSq() < 1) cA.set(0, gs, 0); cA.normalize();
          fxApply(v, S, S.rp, cA, fxW);
        };


