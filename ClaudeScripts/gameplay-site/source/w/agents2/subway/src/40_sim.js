
  const trainLen = n => n * CFG.CAR + (n - 1) * CFG.CGAP;
  const HW = { train: CFG.THW, ramp: 1.1, low: 1.05, high: 1.1 };
  const laneOf = x => clamp(Math.round(x / CFG.LANE) + 1, 0, 2);

  function newWorld() {
    return {
      obs: [], coins: [], items: [], tunnels: [], genS: 0, free: [-1e9, -1e9, -1e9], uid: 0,
      nextPU: rnd(180, 260), nextKey: rnd(1200, 2000), nextBox: rnd(600, 1000), nextTun: rnd(450, 700),
      clear: [], lastKind: '', puBag: []
    };
  }
  function newRun() {
    return {
      s: 0, x: 0, lane: 1, xFrom: 0, lt: 1, ldir: 0, y: 0, vy: 0, g: 1, grounded: true, coyote: 0, jumpBuf: 0,
      rollT: 0, rollD: 1, h: CFG.H_STAND, t: 0, speed: CFG.V0, score: 0, coins: 0, keys: 0, mult: 1,
      x2: 0, jet: 0, jetD: 1, sneak: 0, sneakD: 1, mag: 0, magD: 1, x2D: 1, board: 0, ghost: 0, stumbleT: 0, chase: CFG.START_CHASE,
      dead: '', deadT: 0, revives: 0, warm: true, landT: 0, jumpT: 0, ev: [], hitObs: null,
      st: { jump: 0, roll: 0, pu: 0, jet: 0, magCoins: 0, board: 0, bump: 0, dodge: 0, roof: 0, sneakJump: 0, mbox: 0, stumble: 0, coinsRun: 0 }
    };
  }

  function addObs(W, k, lane, s0, len, extra) {
    const o = Object.assign({ k, lane, s0, s1: s0 + len, ps0: s0, len, v: 0, act: false, id: ++W.uid, mesh: null, hit: false, done: false }, extra || {});
    W.obs.push(o);
    W.free[lane] = Math.max(W.free[lane], o.s1 + 2);
    return o;
  }
  const addTrain = (W, lane, s0, cars, liv) => addObs(W, 'train', lane, s0, trainLen(cars), { cars, liv: liv == null ? rint(0, 4) : liv });
  const addRamp = (W, lane, s0) => addObs(W, 'ramp', lane, s0, CFG.RAMP);
  const addBar = (W, k, lane, s) => addObs(W, k, lane, s - CFG.BAR_D, CFG.BAR_D * 2);
  const addCoin = (W, lane, s, y) => W.coins.push({ lane, x: LX(lane), s, y, got: false, pull: false, px: 0, py: 0, ps: 0 });
  const addItem = (W, k, lane, s, y) => W.items.push({ k, lane, x: LX(lane), s, y, got: false, mesh: null });

  function inTunnel(W, s) { for (const t of W.tunnels) if (s >= t.s0 && s < t.s1) return t; return null; }
  function blocked(W, s0, s1) { for (const c of W.clear) if (s1 > c[0] && s0 < c[1]) return true; return false; }

  function coinLine(W, lane, s, n, y, gap) { for (let i = 0; i < n; i++) addCoin(W, lane, s + i * (gap || 2.2), y == null ? 0.9 : y); }
  function coinArc(W, lane, s, v, base) {
    const T = CFG.JUMP_T * tscale(v), L = v * T, n = 6;
    for (let i = 0; i < n; i++) { const f = i / (n - 1); addCoin(W, lane, s - L / 2 + f * L, (base || 0) + 0.9 + CFG.JUMP_H * 4 * f * (1 - f)); }
  }
  function rampCoins(W, lane, s) { for (let i = 0; i < 4; i++) { const f = (i + 0.5) / 4; addCoin(W, lane, s + f * CFG.RAMP, 0.9 + CFG.ROOF * f); } }

  function placePending(W, s, lanes, y) {
    if (!lanes.length) return;
    const lane = pick(lanes);
    if (s > W.nextKey) { addItem(W, 'key', lane, s, (y || 0) + 1.1); W.nextKey = s + rnd(1800, 3000); return true; }
    if (s > W.nextBox) { addItem(W, 'mbox', lane, s, (y || 0) + 0.75); W.nextBox = s + rnd(900, 1600); return true; }
    if (s > W.nextPU) {
      if (!W.puBag.length) W.puBag = ['mag', 'mag', 'x2', 'sneak', 'jet', 'mag', 'x2', 'sneak', 'jet'].sort(() => Math.random() - 0.5);
      addItem(W, W.puBag.pop(), lane, s, (y || 0) + 1.2); W.nextPU = s + rnd(320, 560); return true;
    }
    return false;
  }

  function freeLanes(W, s, margin) { const r = []; for (let l = 0; l < 3; l++) if (W.free[l] < s - (margin || 0)) r.push(l); return r; }

  function section(W, R) {
    const v = Math.max(R.speed, CFG.V0) * 1.03;
    const d = clamp((v - CFG.V0) / (CFG.VMAX - CFG.V0) + R.s / 9000, 0, 1);
    let s = W.genS;
    if (s > W.nextTun && !blocked(W, s, s + 200)) {
      const t0 = Math.ceil((s + 30) / CFG.CHUNK) * CFG.CHUNK, n = rint(2, 4);
      W.tunnels.push({ s0: t0, s1: t0 + n * CFG.CHUNK });
      W.nextTun = t0 + n * CFG.CHUNK + rnd(800, 1400);
    }
    if (blocked(W, s, s + 40)) { W.genS = s + 20; return; }
    const r = Math.random();
    let kind;
    if (s < 60) kind = 'coins';
    else if (W.lastKind === 'coins') kind = r < 0.45 ? 'bars' : r < 0.8 ? 'side' : 'mixed';
    else {
      const wt = { bars: 1.2, side: 1.3, mixed: 1.0, roof: 0.35 + 0.8 * d, moving: 0.25 + 1.0 * d, coins: 0.55 - 0.3 * d };
      let tot = 0; for (const k in wt) tot += wt[k];
      let q = Math.random() * tot; kind = 'bars';
      for (const k in wt) { q -= wt[k]; if (q <= 0) { kind = k; break; } }
      if (kind === W.lastKind && kind !== 'side' && Math.random() < 0.6) kind = 'side';
    }
    let end = s;
    const SP = Math.max(13, v * (0.95 - 0.2 * d));
    if (kind === 'coins') {
      const lane = rint(0, 2), n = rint(8, 13);
      coinLine(W, lane, s + 4, n);
      end = s + 4 + n * 2.2;
      placePending(W, end + 6, [0, 1, 2].filter(l => l !== lane));
    } else if (kind === 'bars') {
      const rows = rint(2, 3 + Math.round(d * 2));
      const cl = rint(0, 2);
      for (let i = 0; i < rows; i++) {
        const sr = s + 8 + i * SP * rnd(1.0, 1.25);
        const k = Math.random() < 0.55 - 0.35 * d ? 1 : Math.random() < 0.75 ? 2 : 3;
        const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, k);
        const types = {};
        for (const l of lanes) { types[l] = Math.random() < 0.55 ? 'low' : 'high'; addBar(W, types[l], l, sr); }
        const tl = types[cl];
        if (tl === 'low') coinArc(W, cl, sr, v);
        else if (tl === 'high') coinLine(W, cl, sr - 2.2, 3, 0.55);
        else coinLine(W, cl, sr - 4, 4);
        end = sr + 2;
      }
      placePending(W, end + 8, [0, 1, 2]);
    } else if (kind === 'side' || kind === 'mixed') {
      const nT = kind === 'mixed' ? 1 : (Math.random() < 0.35 + 0.4 * d ? 2 : 1);
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
      if (nT === 2) s = Math.max(s, Math.max(...W.free) + v * 0.8);
      const tl = lanes.slice(0, nT), fl = lanes.slice(nT);
      let rampLane = -1, maxEnd = s;
      tl.forEach((l, i) => {
        const cars = rint(1, 3), st = s + 6 + rnd(0, 10) + (i ? rnd(0, 8) : 0);
        const ramp = (i === 0 && Math.random() < 0.55) || kind === 'mixed' && Math.random() < 0.6;
        if (ramp && rampLane < 0) { addRamp(W, l, st - CFG.RAMP); rampLane = l; }
        const o = addTrain(W, l, st, cars);
        maxEnd = Math.max(maxEnd, o.s1);
        if (l === rampLane) {
          rampCoins(W, l, st - CFG.RAMP);
          coinLine(W, l, st + 2, Math.max(3, Math.floor((o.len - 4) / 2.2)), CFG.ROOF + 0.9);
          if (s + 80 > W.nextPU || s > W.nextKey) placePending(W, o.s1 - 4, [l], CFG.ROOF);
        }
      });
      if (kind === 'mixed' && fl.length) {
        const bl = fl[0];
        for (let sb = s + 14; sb < maxEnd - 4; sb += SP * rnd(1.1, 1.5)) addBar(W, Math.random() < 0.5 ? 'low' : 'high', bl, sb);
        if (fl[1] != null) coinLine(W, fl[1], s + 8, Math.max(4, Math.floor((maxEnd - s - 12) / 2.2)));
      } else if (fl.length) {
        const bl = pick(fl);
        if (Math.random() < 0.5 + 0.3 * d) for (let sb = s + 24; sb < maxEnd - 8; sb += SP * rnd(1.4, 2.0)) { addBar(W, Math.random() < 0.5 ? 'low' : 'high', bl, sb); if (Math.random() < 0.4) coinArc(W, bl, sb, v); }
        else coinLine(W, bl, s + 10, Math.max(4, Math.floor((maxEnd - s - 16) / 2.2)));
      }
      end = maxEnd;
      placePending(W, end + 8, [0, 1, 2]);
    } else if (kind === 'roof') {
      s = Math.max(s, Math.max(...W.free) + v * 1.05);
      const rl = rint(0, 2), st = s + 6 + CFG.RAMP;
      addRamp(W, rl, st - CFG.RAMP); rampCoins(W, rl, st - CFG.RAMP);
      const carsR = rint(2, 4);
      const o = addTrain(W, rl, st, carsR);
      coinLine(W, rl, st + 2, Math.floor((o.len - 4) / 2.2), CFG.ROOF + 0.9);
      let maxEnd = o.s1;
      if (Math.random() < 0.45) {
        const gap = rnd(4, 6), o2 = addTrain(W, rl, o.s1 + gap, rint(1, 2));
        coinArc(W, rl, o.s1 + gap / 2, v, CFG.ROOF);
        maxEnd = o2.s1;
      }
      for (const l of [0, 1, 2]) if (l !== rl) {
        const off = rnd(0, 8), cars = rint(1, 3);
        const o3 = addTrain(W, l, st + off, cars);
        maxEnd = Math.max(maxEnd, o3.s1);
      }
      placePending(W, o.s1 - 6, [rl], CFG.ROOF);
      end = maxEnd;
      placePending(W, end + 8, [0, 1, 2]);
    } else if (kind === 'moving') {
      const vt = rnd(8, 11) * (0.85 + 0.35 * d);
      const sm = s + 30;
      const meet = sm - vt * CFG.ACT_D / (v + vt);
      const cand = [0, 1, 2].filter(l => W.free[l] < meet - 16).sort(() => Math.random() - 0.5);
      let ml = -1, esc = -1;
      for (const l of cand) { const e = [0, 1, 2].filter(x => Math.abs(x - l) === 1 && W.free[x] < meet - 26); if (e.length) { ml = l; esc = pick(e); break; } }
      if (ml < 0) { W.genS = s + 12; W.lastKind = 'x'; return; }
      const cars = rint(1, 3);
      const o = addTrain(W, ml, sm, cars, rint(0, 4));
      o.v = vt; o.moving = true;
      const third = 3 - ml - esc;
      let maxEnd = o.s1;
      if (W.free[third] < meet - 26) {
        if (Math.random() < 0.55) { const o2 = addTrain(W, third, meet - rnd(4, 14), rint(1, 2)); maxEnd = Math.max(maxEnd, o2.s1); }
        else for (let sb = meet - 18; sb < meet + 26; sb += SP * 1.3) addBar(W, Math.random() < 0.5 ? 'low' : 'high', third, sb);
      }
      coinLine(W, esc, meet - 24, 10);
      W.free[esc] = Math.max(W.free[esc], meet + 8);
      end = Math.max(maxEnd, sm + 4);
    }
    W.lastKind = kind;
    W.genS = end + v * rnd(0.55, 0.85) * (1.25 - 0.4 * d);
  }

  function gen(W, R) { let n = 0; while (W.genS < R.s + CFG.AHEAD && n++ < 12) section(W, R); }

  function jetCoins(W, s0, s1) {
    let lane = rint(0, 2), s = s0;
    while (s < s1) {
      const n = rint(10, 16);
      const y = (inTunnel(W, s) ? 5.4 : CFG.JET_Y) + 0.8;
      for (let i = 0; i < n && s < s1; i++, s += 2.4) addCoin(W, lane, s, y);
      lane = clamp(lane + (Math.random() < 0.5 ? -1 : 1), 0, 2);
      s += 3;
    }
  }

  function supportAt(W, lane, s) {
    let h = 0;
    for (const o of W.obs) {
      if (o.lane !== lane || o.done || s < o.s0 - 0.05 || s > o.s1 + 0.05) continue;
      if (o.k === 'train') { if (o.v && !o.act) {} h = Math.max(h, CFG.ROOF); }
      else if (o.k === 'ramp') h = Math.max(h, CFG.ROOF * clamp((s - o.s0) / o.len, 0, 1));
    }
    return h;
  }

  function startJump(R) {
    const H = R.sneak > 0 ? CFG.SNEAK_H : CFG.JUMP_H, T = (R.sneak > 0 ? CFG.SNEAK_T : CFG.JUMP_T) * tscale(R.speed);
    R.g = 8 * H / (T * T); R.vy = 4 * H / T; R.grounded = false; R.coyote = 0; R.jumpBuf = 0; R.rollT = 0; R.jumpT = T;
    R.st.jump++; if (R.sneak > 0) R.st.sneakJump++;
    R.ev.push('jump');
  }
  function act(W, R, a) {
    if (R.dead) return;
    if (a === 'left' || a === 'right') {
      const dir = a === 'left' ? -1 : 1, nl = R.lane + dir;
      if (nl < 0 || nl > 2) { if (R.jet <= 0) stumble(W, R, 'edge'); return; }
      R.xFrom = R.x; R.lane = nl; R.lt = 0; R.ldir = dir; R.ev.push('lane');
    } else if (a === 'up') {
      if (R.jet > 0) return;
      if (R.grounded || R.coyote > 0) startJump(R); else R.jumpBuf = CFG.BUFFER;
    } else if (a === 'down') {
      if (R.jet > 0) return;
      R.rollD = CFG.ROLL_T * tscale(R.speed); R.rollT = R.rollD; R.st.roll++; R.jumpBuf = 0;
      if (!R.grounded) { R.vy = Math.min(R.vy, -CFG.FALL_V); }
      R.ev.push('roll');
    }
  }

  function stumble(W, R, why) {
    if (R.ghost > 0 || R.dead || R.stumbleT > 0) return;
    if (R.board > 0 && why !== 'edge') { R.board = 0; R.ghost = CFG.GHOST_T; R.ev.push('board_break'); return; }
    R.st.stumble++;
    if (why === 'train') R.st.bump++;
    R.stumbleT = 0.45;
    R.ev.push('bump');
    if (R.chase > 0.15 && !R.warm) { die(W, R, 'caught'); return; }
    R.warm = false;
    R.chase = CFG.CHASE_T;
  }
  function die(W, R, why) {
    R.dead = why; R.deadT = 0; R.vy = Math.min(R.vy, 0); R.rollT = 0;
    R.ev.push(why === 'caught' ? 'caught' : 'crash');
  }
  function crash(W, R, o) {
    if (R.ghost > 0 || o.hit) return;
    if (R.board > 0) { R.board = 0; R.ghost = CFG.GHOST_T; o.hit = true; R.ev.push('board_break'); return; }
    R.hitObs = o;
    die(W, R, 'crash');
  }
  function bounce(R) {
    const back = laneOf(R.xFrom);
    if (back !== R.lane) { R.xFrom = R.x; R.lane = back; R.lt = 0; R.ldir = -R.ldir; }
  }

  function givePU(W, R, k, lvl) {
    const D = puDur(lvl || 0);
    R.st.pu++;
    if (k === 'jet') {
      R.jet = D; R.jetD = D; R.st.jet++; R.board = R.board > 0 ? R.board : 0; R.rollT = 0;
      const sEnd = R.s + D * R.speed * 1.05;
      jetCoins(W, R.s + 18, sEnd - 12);
      W.clear.push([sEnd - 30, sEnd + 70]);
      for (const o of W.obs) if (o.s1 > sEnd - 30 && o.s0 < sEnd + 70) o.done = true;
      W.genS = Math.max(W.genS, R.s + 10);
    } else if (k === 'sneak') { R.sneak = D; R.sneakD = D; }
    else if (k === 'mag') { R.mag = D; R.magD = D; }
    else if (k === 'x2') { R.x2 = D; R.x2D = D; }
    R.ev.push('pu_' + k);
  }

  function step(W, R, dt, ctx) {
    if (R.dead) { R.deadT += dt; R.speed = damp(R.speed, 0, 9, dt); return; }
    R.t += dt;
    R.speed = speedAt(R.t);
    const ps = R.s;
    R.s += R.speed * dt;
    if (R.lt < 1) { R.lt = Math.min(1, R.lt + dt / CFG.LANE_T); }
    R.x = lerp(R.xFrom, LX(R.lane), ease(R.lt));
    const px = R.x;
    if (R.rollT > 0) { if (R.grounded || R.vy < 0) R.rollT -= dt; if (R.rollT < 0) R.rollT = 0; }
    R.h = R.rollT > 0 ? CFG.H_ROLL : CFG.H_STAND;
    R.ghost = Math.max(0, R.ghost - dt); R.stumbleT = Math.max(0, R.stumbleT - dt);
    if (R.chase > 0) { R.chase = Math.max(0, R.chase - dt); if (R.chase === 0) R.warm = false; }
    for (const k of ['sneak', 'mag', 'x2']) if (R[k] > 0) R[k] = Math.max(0, R[k] - dt);
    if (R.board > 0) { R.board -= dt; if (R.board <= 0) { R.board = 0; R.ghost = Math.max(R.ghost, 0.6); R.ev.push('board_end'); } }
    if (R.jumpBuf > 0) R.jumpBuf -= dt;
    const lane = laneOf(R.x);
    const sup = supportAt(W, lane, R.s);
    if (R.jet > 0) {
      R.jet -= dt;
      const tun = inTunnel(W, R.s + 25) || inTunnel(W, R.s);
      const ty = tun ? 5.4 : CFG.JET_Y;
      R.y = damp(R.y, ty, 3.2, dt); R.vy = 0; R.grounded = false; R.chase = 0;
      if (R.jet <= 0) { R.jet = 0; R.g = 22; R.vy = 0; R.ghost = Math.max(R.ghost, 2.2); R.ev.push('jet_end'); }
    } else {
      if (R.grounded) {
        if (sup < R.y - 0.05) { R.grounded = false; R.coyote = CFG.COYOTE; R.vy = 0; R.g = 8 * CFG.JUMP_H / Math.pow(CFG.JUMP_T * tscale(R.speed), 2); }
        else if (sup - R.y < 1.35) R.y = sup;
      }
      if (!R.grounded) {
        if (R.coyote > 0) R.coyote -= dt;
        R.vy -= R.g * dt; R.y += R.vy * dt;
        if (R.y <= sup && R.vy <= 0) {
          R.y = sup; R.grounded = true; R.landT = 0.18;
          R.ev.push(R.vy < -14 ? 'land_hard' : 'land'); R.vy = 0;
          if (R.jumpBuf > 0) startJump(R);
        }
      }
    }
    if (R.landT > 0) R.landT -= dt;
    if (R.grounded && R.y > CFG.ROOF - 0.1) R.st.roof += R.speed * dt;

    for (const o of W.obs) {
      if (o.done) continue;
      if (o.moving) {
        o.ps0 = o.s0;
        if (!o.act && o.s0 - R.s < CFG.ACT_D) { o.act = true; R.ev.push('horn'); }
        if (o.act) { o.s0 -= o.v * dt; o.s1 = o.s0 + o.len; }
      } else o.ps0 = o.s0;
    }
    R.mult = ctx.mult * (R.x2 > 0 ? 2 : 1);
    R.score += R.speed * dt * CFG.SCORE_K * R.mult;
    if (R.jet > 0) return;
    for (const o of W.obs) {
      if (o.done || o.hit) continue;
      if (o.s0 > R.s + 3 || o.s1 < R.s - 3) {
        if ((o.k === 'low' || o.k === 'high') && !o.passed && o.s1 < R.s - 1) { o.passed = true; if (Math.abs(R.x - LX(o.lane)) < 1.3) R.st.dodge++; }
        continue;
      }
      const ox = LX(o.lane), hw = HW[o.k] + CFG.PHW, dx = Math.abs(R.x - ox);
      if (dx >= hw) continue;
      const sNow = R.s + CFG.PHD > o.s0 && R.s - CFG.PHD < o.s1;
      if (!sNow) continue;
      const sPrev = ps + CFG.PHD > o.ps0 && ps - CFG.PHD < o.s1 + (o.ps0 - o.s0);
      const xPrev = Math.abs(px - ox) < hw;
      let solid = false;
      if (o.k === 'train') solid = R.y < CFG.ROOF - 0.45;
      else if (o.k === 'ramp') { const ry = CFG.ROOF * clamp((R.s - o.s0) / o.len, 0, 1); solid = R.y < ry - 1.3; }
      else if (o.k === 'low') solid = R.y < CFG.LOW_H - 0.08;
      else if (o.k === 'high') solid = R.y + R.h > CFG.HIGH_B + 0.06 && R.y < CFG.HIGH_T;
      if (!solid) continue;
      const shallow = dx > hw - 0.55 && R.lt < 1;
      if (!sPrev && !shallow) {
        if (R.ghost > 0) continue;
        crash(W, R, o); if (R.dead) return; continue;
      }
      if (R.ghost > 0) continue;
      bounce(R);
      stumble(W, R, o.k === 'train' ? 'train' : 'bar');
      if (R.dead) return;
    }
  }

  function collect(W, R, dt, lvl, onItem) {
    const cy = R.y + (R.rollT > 0 ? 0.45 : 0.85);
    const magR = R.mag > 0 ? CFG.MAG_R : 0;
    for (const c of W.coins) {
      if (c.got) continue;
      const ds = c.s - R.s;
      if (ds > 40) break;
      if (ds < -4) { c.got = true; c.missed = true; continue; }
      if (magR && !c.pull && ds < magR + 6 && ds > -2 && Math.abs(c.y - cy) < 12) { c.pull = true; c.mag = true; }
      if (c.pull) {
        const k = 1 - Math.exp(-14 * dt);
        c.x += (R.x - c.x) * k; c.y += (cy - c.y) * k; c.s += (R.s + 0.4 - c.s) * k + R.speed * dt * 0.0;
      }
      if (Math.abs(c.s - R.s) < 0.9 && Math.abs(c.x - R.x) < 0.95 && Math.abs(c.y - cy) < 1.05) {
        c.got = true; R.coins++; R.st.coinsRun++; if (c.mag) R.st.magCoins++;
        R.ev.push('coin');
      }
    }
    for (const it of W.items) {
      if (it.got) continue;
      if (it.s < R.s - 4) { it.got = true; continue; }
      if (Math.abs(it.s - R.s) < 1.1 && Math.abs(it.x - R.x) < 1.1 && Math.abs(it.y - cy) < 1.4) { it.got = true; onItem(it); }
    }
  }

  function cull(W, R, onDrop) {
    const lim = R.s - CFG.BEHIND;
    if (W.obs.length) { const keep = []; for (const o of W.obs) { if (o.s1 < lim || o.done && !o.mesh) { onDrop(o); } else if (o.done) { onDrop(o); } else keep.push(o); } W.obs = keep; }
    let i = 0; while (i < W.coins.length && (W.coins[i].got || W.coins[i].s < lim)) i++;
    if (i > 0) W.coins.splice(0, i);
    if (W.coins.length > 1) {
      let sorted = true; for (let k = 1; k < Math.min(W.coins.length, 60); k++) if (W.coins[k].s < W.coins[k - 1].s - 0.01 && !W.coins[k].pull) { sorted = false; break; }
      if (!sorted) W.coins.sort((a, b) => a.s - b.s);
    }
    W.items = W.items.filter(it => { if (it.got || it.s < lim) { onDrop(it); return false; } return true; });
    W.tunnels = W.tunnels.filter(t => t.s1 > lim - 100);
    W.clear = W.clear.filter(c => c[1] > lim);
  }

  function revive(W, R) {
    R.dead = ''; R.deadT = 0; R.ghost = CFG.REVIVE_GHOST; R.chase = 0; R.stumbleT = 0; R.revives++;
    R.t = Math.max(0, R.t * 0.9); R.speed = speedAt(R.t);
    R.vy = 0; R.lt = 1; R.x = LX(R.lane); R.xFrom = R.x;
    for (const o of W.obs) {
      if (o.s1 > R.s - 3 && o.s0 < R.s + 45) o.done = true;
      if (o.moving && o.s0 < R.s + CFG.ACT_D + 40 && o.s1 > R.s - 3) o.done = true;
    }
    if (R.hitObs) R.hitObs.done = true; R.hitObs = null;
    R.y = supportAt(W, R.lane, R.s); R.grounded = true;
    W.clear.push([R.s, R.s + 45]);
  }
