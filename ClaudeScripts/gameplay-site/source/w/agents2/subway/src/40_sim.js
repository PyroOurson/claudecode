
  const trainLen = n => n * CFG.CAR + (n - 1) * CFG.CGAP;
  const HW = { train: CFG.THW, ramp: 1.1, low: 1.05, high: 1.1 };
  const laneOf = x => clamp(Math.round(x / CFG.LANE) + 1, 0, 2);
  const TIMED = ['sneak', 'mag', 'x2'];

  function newWorld() {
    return {
      obs: [], coins: [], items: [], tunnels: [], genS: 0, free: [-1e9, -1e9, -1e9], uid: 0,
      nextPU: rnd(180, 260), nextKey: rnd(1200, 2000), nextBox: rnd(600, 1000), nextTun: rnd(450, 700),
      clear: [], lastKind: '', puBag: [], kinds: {}
    };
  }
  function newRun() {
    return {
      s: 0, x: 0, lane: 1, xFrom: 0, lt: 1, ldir: 0, y: 0, vy: 0, g: 1, grounded: true, coyote: 0, jumpBuf: 0,
      ps: 0, px: 0, py: 0, ign: null, edgeT: 0, edgeDir: 0, nearN: 0, nearT: 0, nearPts: 0,
      rollT: 0, rollD: 1, h: CFG.H_STAND, t: 0, vk: 1, vs: 1, t0: 0, mb: 0, speed: CFG.V0, score: 0, coins: 0, keys: 0, mult: 1,
      x2: 0, jet: 0, jetD: 1, sneak: 0, sneakD: 1, mag: 0, magD: 1, x2D: 1, board: 0, ghost: 0, stumbleT: 0, chase: CFG.START_CHASE,
      dead: '', deadT: 0, revives: 0, warm: true, landT: 0, jumpT: 0, ev: [], hitObs: null,
      st: { jump: 0, roll: 0, pu: 0, jet: 0, magCoins: 0, board: 0, bump: 0, dodge: 0, roof: 0, sneakJump: 0, mbox: 0, stumble: 0, coinsRun: 0, near: 0, lanes: 0, air: 0, topV: 0 }
    };
  }

  function addObs(W, k, lane, s0, len, extra) {
    const o = Object.assign({ k, lane, s0, s1: s0 + len, ps0: s0, len, v: 0, act: false, id: ++W.uid, mesh: null, hit: false, done: false, nm: false, passed: false, moving: false, cars: 0, liv: 0 }, extra || {});
    W.obs.push(o);
    W.free[lane] = Math.max(W.free[lane], o.s1 + 2);
    return o;
  }
  const addTrain = (W, lane, s0, cars, liv) => addObs(W, 'train', lane, s0, trainLen(cars), { cars, liv: liv == null ? rint(0, NLIV - 1) : liv });
  const addWagon = (W, lane, s0) => addTrain(W, lane, s0, 1, rint(NLIV - FREIGHT.length, NLIV - 1));
  const addRamp = (W, lane, s0) => addObs(W, 'ramp', lane, s0, CFG.RAMP);
  const addBar = (W, k, lane, s) => addObs(W, k, lane, s - CFG.BAR_D, CFG.BAR_D * 2);
  const addCoin = (W, lane, s, y) => W.coins.push({ lane, x: LX(lane), s, y, got: false, pull: false, mag: false, missed: false });
  const addItem = (W, k, lane, s, y) => W.items.push({ k, lane, x: LX(lane), s, y, got: false, mesh: null });

  function inTunnel(W, s) { const T = W.tunnels; for (let i = 0; i < T.length; i++) if (s >= T[i].s0 && s < T[i].s1) return T[i]; return null; }
  function blocked(W, s0, s1) { for (const c of W.clear) if (s1 > c[0] && s0 < c[1]) return true; return false; }

  function coinLine(W, lane, s, n, y, gap) { for (let i = 0; i < n; i++) addCoin(W, lane, s + i * (gap || 2.2), y == null ? 0.9 : y); }
  function coinArc(W, lane, s, v, base) {
    const T = CFG.JUMP_T * tscale(v), L = v * T, n = 6;
    for (let i = 0; i < n; i++) { const f = i / (n - 1); addCoin(W, lane, s - L / 2 + f * L, (base || 0) + 0.9 + CFG.JUMP_H * 4 * f * (1 - f)); }
  }
  function rampCoins(W, lane, s) { for (let i = 0; i < 4; i++) { const f = (i + 0.5) / 4; addCoin(W, lane, s + f * CFG.RAMP, 0.9 + CFG.ROOF * f); } }
  function barCoins(W, k, lane, s, v) { if (k === 'low') coinArc(W, lane, s, v); else coinLine(W, lane, s - 2.2, 3, 0.55); }

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

  const maxFree = W => Math.max(W.free[0], W.free[1], W.free[2]);
  const shuffled = () => [0, 1, 2].sort(() => Math.random() - 0.5);

  const PAT = {
    coins(W, s, v, d) {
      const lane = rint(0, 2), n = rint(8, 13);
      coinLine(W, lane, s + 4, n);
      const end = s + 4 + n * 2.2;
      placePending(W, end + 6, [0, 1, 2].filter(l => l !== lane));
      return end;
    },
    bars(W, s, v, d, SP) {
      const rows = rint(2, 3 + Math.round(d * 2)), cl = rint(0, 2), SPb = Math.max(12, v * (0.86 - 0.3 * d));
      let end = s, sr = s + 8;
      for (let i = 0; i < rows; i++) {
        if (i) sr += SPb * rnd(1.0, 1.3);
        const k = Math.random() < 0.55 - 0.35 * d ? 1 : Math.random() < 0.75 ? 2 : 3;
        const lanes = shuffled().slice(0, k), types = {};
        const wag = k === 3 && d > 0.15 && chance(0.4) ? lanes[2] : -1;
        for (const l of lanes) {
          if (l === wag) { addWagon(W, l, sr - 1); continue; }
          types[l] = Math.random() < 0.55 ? 'low' : 'high'; addBar(W, types[l], l, sr);
        }
        const tl = types[cl];
        if (tl) barCoins(W, tl, cl, sr, v);
        else if (cl !== wag) coinLine(W, cl, sr - 4, 4);
        end = wag >= 0 ? sr - 1 + CFG.CAR : sr + 2;
        if (wag >= 0) sr = end;
      }
      placePending(W, end + 8, [0, 1, 2]);
      return end;
    },
    side(W, s, v, d, SP, mixed) {
      const nT = mixed ? 1 : (Math.random() < 0.35 + 0.4 * d ? 2 : 1);
      const lanes = shuffled();
      if (nT === 2) s = Math.max(s, maxFree(W) + v * 0.8);
      const tl = lanes.slice(0, nT), fl = lanes.slice(nT);
      let rampLane = -1, maxEnd = s;
      tl.forEach((l, i) => {
        const cars = rint(1, 3), st = s + 6 + rnd(0, 10) + (i ? rnd(0, 8) : 0);
        const ramp = (i === 0 && Math.random() < 0.55) || mixed && Math.random() < 0.6;
        if (ramp && rampLane < 0) { addRamp(W, l, st - CFG.RAMP); rampLane = l; }
        const o = addTrain(W, l, st, cars);
        maxEnd = Math.max(maxEnd, o.s1);
        if (l === rampLane) {
          rampCoins(W, l, st - CFG.RAMP);
          coinLine(W, l, st + 2, Math.max(3, Math.floor((o.len - 4) / 2.2)), CFG.ROOF + 0.9);
          if (s + 80 > W.nextPU || s > W.nextKey) placePending(W, o.s1 - 4, [l], CFG.ROOF);
        }
      });
      if (mixed && fl.length) {
        const bl = fl[0];
        for (let sb = s + 14; sb < maxEnd - 4; sb += SP * rnd(1.1, 1.5)) addBar(W, Math.random() < 0.5 ? 'low' : 'high', bl, sb);
        if (fl[1] != null) coinLine(W, fl[1], s + 8, Math.max(4, Math.floor((maxEnd - s - 12) / 2.2)));
      } else if (fl.length) {
        const bl = pick(fl);
        if (Math.random() < 0.5 + 0.3 * d) for (let sb = s + 24; sb < maxEnd - 8; sb += SP * rnd(1.4, 2.0)) { const k = Math.random() < 0.5 ? 'low' : 'high'; addBar(W, k, bl, sb); if (Math.random() < 0.4) barCoins(W, k, bl, sb, v); }
        else coinLine(W, bl, s + 10, Math.max(4, Math.floor((maxEnd - s - 16) / 2.2)));
      }
      placePending(W, maxEnd + 8, [0, 1, 2]);
      return maxEnd;
    },
    mixed(W, s, v, d, SP) { return PAT.side(W, s, v, d, SP, true); },
    roof(W, s, v, d) {
      s = Math.max(s, maxFree(W) + v * 1.05);
      const rl = rint(0, 2), st = s + 6 + CFG.RAMP;
      addRamp(W, rl, st - CFG.RAMP); rampCoins(W, rl, st - CFG.RAMP);
      const o = addTrain(W, rl, st, rint(2, 4));
      coinLine(W, rl, st + 2, Math.floor((o.len - 4) / 2.2), CFG.ROOF + 0.9);
      let maxEnd = o.s1;
      if (Math.random() < 0.45) {
        const gap = rnd(4, 6), o2 = addTrain(W, rl, o.s1 + gap, rint(1, 2));
        coinArc(W, rl, o.s1 + gap / 2, v, CFG.ROOF);
        maxEnd = o2.s1;
      }
      for (let l = 0; l < 3; l++) if (l !== rl) maxEnd = Math.max(maxEnd, addTrain(W, l, st + rnd(0, 8), rint(1, 3)).s1);
      placePending(W, o.s1 - 6, [rl], CFG.ROOF);
      placePending(W, maxEnd + 8, [0, 1, 2]);
      return maxEnd;
    },
    moving(W, s, v, d, SP) {
      const vt = rnd(8, 11) * (0.85 + 0.35 * d), sm = s + 30;
      const meet = sm - vt * CFG.ACT_D / (v + vt);
      const cand = [0, 1, 2].filter(l => W.free[l] < meet - 16).sort(() => Math.random() - 0.5);
      let ml = -1, esc = -1;
      for (const l of cand) { const e = [0, 1, 2].filter(x => Math.abs(x - l) === 1 && W.free[x] < meet - 26); if (e.length) { ml = l; esc = pick(e); break; } }
      if (ml < 0) return -1;
      const o = addTrain(W, ml, sm, rint(1, 3), rint(0, NLIV - FREIGHT.length - 1));
      o.v = vt; o.moving = true;
      const third = 3 - ml - esc;
      let maxEnd = o.s1;
      if (W.free[third] < meet - 26) {
        if (Math.random() < 0.55) maxEnd = Math.max(maxEnd, addTrain(W, third, meet - rnd(4, 14), rint(1, 2)).s1);
        else for (let sb = meet - 18; sb < meet + 26; sb += SP * 1.3) addBar(W, Math.random() < 0.5 ? 'low' : 'high', third, sb);
      }
      coinLine(W, esc, meet - 24, 10);
      W.free[esc] = Math.max(W.free[esc], meet + 8);
      return Math.max(maxEnd, sm + 4);
    },
    weave(W, s, v, d) {
      s = Math.max(s, maxFree(W) + v * 0.7);
      const n = rint(3, 4 + Math.round(d * 2)), D = CFG.CAR + v * (0.66 - 0.2 * d);
      let f = rint(0, 2), st = s + 8, end = st;
      for (let i = 0; i < n; i++) {
        for (let l = 0; l < 3; l++) if (l !== f) addWagon(W, l, st);
        coinLine(W, f, st + 1.5, 4, 0.9, 2.8);
        end = st + CFG.CAR;
        st += D;
        f = f === 1 ? (chance(0.5) ? 0 : 2) : 1;
      }
      placePending(W, end + 8, [0, 1, 2]);
      return end;
    },
    canyon(W, s, v, d) {
      s = Math.max(s, maxFree(W) + v * 0.7);
      const c = rint(0, 2), cars = rint(2, 3 + Math.round(d)), st = s + 8, L = trainLen(cars);
      for (let l = 0; l < 3; l++) if (l !== c) addTrain(W, l, st, cars);
      const SPc = v * (0.84 - 0.24 * d);
      let any = false;
      for (let sb = st + Math.max(7, v * 0.4); sb < st + L - 4; sb += SPc * rnd(1.0, 1.35)) {
        const k = chance(0.5) ? 'low' : 'high';
        addBar(W, k, c, sb); barCoins(W, k, c, sb, v); any = true;
      }
      if (!any) coinLine(W, c, st + 2, Math.floor((L - 4) / 2.2));
      placePending(W, st + L + 8, [0, 1, 2]);
      return st + L;
    },
    stairs(W, s, v, d) {
      s = Math.max(s, maxFree(W) + v * 0.9);
      const a = pick([0, 2]), c = 2 - a, st = s + 6 + CFG.RAMP, ov = 11;
      addRamp(W, a, st - CFG.RAMP); rampCoins(W, a, st - CFG.RAMP);
      const A = addTrain(W, a, st, 2);
      coinLine(W, a, st + 2, 5, CFG.ROOF + 0.9, 2.6);
      const B = addTrain(W, 1, A.s1 - ov, rint(2, 3));
      coinLine(W, 1, B.s0 + 3, Math.floor((B.len - ov - 4) / 2.6), CFG.ROOF + 0.9, 2.6);
      let last = B, maxEnd = B.s1;
      if (chance(0.55 + 0.25 * d)) {
        last = addTrain(W, a, B.s1 - ov, rint(1, 2));
        coinLine(W, a, last.s0 + 3, Math.floor((last.len - 5) / 2.6), CFG.ROOF + 0.9, 2.6);
        maxEnd = last.s1;
      }
      const SPg = v * (0.95 - 0.2 * d);
      if (chance(0.6)) for (let sb = st + 10; sb < maxEnd - 6; sb += SPg * rnd(1.3, 1.9)) addBar(W, chance(0.5) ? 'low' : 'high', c, sb);
      placePending(W, last.s1 - 5, [last.lane], CFG.ROOF);
      placePending(W, maxEnd + 8, [0, 1, 2]);
      return maxEnd;
    },
    pincer(W, s, v, d) {
      const p = pick([0, 2]), m1 = chance(0.5) ? 1 : 2 - p, m2 = 3 - p - m1;
      const vt = rnd(8, 10.5) * (0.85 + 0.3 * d), k = vt * CFG.ACT_D / (v + vt);
      const meet1 = Math.max(s, maxFree(W) + v * 0.5) + 14, S1 = meet1 + k;
      const o1 = addTrain(W, m1, S1, rint(1, 2), rint(0, NLIV - FREIGHT.length - 1));
      o1.v = vt; o1.moving = true;
      const S2 = S1 + v * (o1.len / (v + vt) + 1.25 - 0.3 * d), meet2 = S2 - k;
      const o2 = addTrain(W, m2, S2, rint(1, 2), rint(0, NLIV - FREIGHT.length - 1));
      o2.v = vt; o2.moving = true;
      const pc = Math.max(1, Math.min(4, Math.ceil((meet2 - meet1 + 16 + CFG.CGAP) / (CFG.CAR + CFG.CGAP))));
      const po = addTrain(W, p, meet1 - 6, pc);
      coinLine(W, m2, meet1 - 22, 8);
      coinLine(W, m1, meet2 - 14, 6);
      return Math.max(po.s1, S2 + 4);
    }
  };

  function section(W, R) {
    const v = Math.max(R.speed, CFG.V0) * 1.03;
    const d = clamp((v - CFG.V0) / (CFG.VMAX - CFG.V0) + R.s / 9000, 0, 1);
    const s = W.genS;
    if (s > W.nextTun && !blocked(W, s, s + 200)) {
      const t0 = Math.ceil((s + 30) / CFG.CHUNK) * CFG.CHUNK, n = rint(2, 4);
      W.tunnels.push({ s0: t0, s1: t0 + n * CFG.CHUNK });
      W.nextTun = t0 + n * CFG.CHUNK + rnd(800, 1400);
    }
    if (blocked(W, s, s + 40)) { W.genS = s + 20; return; }
    const r = Math.random();
    let kind;
    if (s < 60) kind = 'coins';
    else if (W.lastKind === 'coins') kind = r < 0.4 ? 'bars' : r < 0.7 ? 'side' : r < 0.85 ? 'mixed' : 'canyon';
    else {
      const wt = {
        bars: 1.2, side: 1.2, mixed: 0.95, roof: 0.35 + 0.7 * d, moving: 0.25 + 0.9 * d, coins: 0.55 - 0.3 * d,
        weave: s > 350 ? 0.45 + 0.35 * d : 0, canyon: s > 220 ? 0.5 + 0.3 * d : 0, stairs: s > 450 ? 0.5 : 0, pincer: d > 0.3 ? 0.75 * (d - 0.15) : 0
      };
      let tot = 0; for (const k in wt) tot += wt[k];
      let q = Math.random() * tot; kind = 'bars';
      for (const k in wt) { q -= wt[k]; if (q <= 0) { kind = k; break; } }
      if (kind === W.lastKind && kind !== 'side' && Math.random() < 0.65) kind = 'side';
    }
    const SP = Math.max(13, v * (0.95 - 0.2 * d));
    const end = PAT[kind](W, s, v, d, SP);
    if (end < 0) { W.genS = s + 12; W.lastKind = 'x'; return; }
    W.kinds[kind] = (W.kinds[kind] || 0) + 1;
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
    const O = W.obs;
    for (let i = 0; i < O.length; i++) {
      const o = O[i];
      if (o.lane !== lane || o.done || o.hit || s < o.s0 - 0.05 || s > o.s1 + 0.05) continue;
      if (o.k === 'train') h = CFG.ROOF;
      else if (o.k === 'ramp') h = Math.max(h, CFG.ROOF * clamp((s - o.s0) / o.len, 0, 1));
    }
    return h;
  }
  function vsolid(o, R) {
    if (o.k === 'train') return R.y < CFG.ROOF - 0.45;
    if (o.k === 'ramp') return R.y < CFG.ROOF * clamp((R.s - o.s0) / o.len, 0, 1) - 1.3;
    if (o.k === 'low') return R.y < CFG.LOW_H - 0.08;
    return R.y + R.h > CFG.HIGH_B + 0.06 && R.y < CFG.HIGH_T;
  }
  function laneBlocked(W, R, lane) {
    const O = W.obs;
    for (let i = 0; i < O.length; i++) {
      const o = O[i];
      if (o.lane !== lane || o.done || o.hit) continue;
      if (R.s + CFG.PHD > o.s0 && R.s - CFG.PHD < o.s1 && vsolid(o, R)) return true;
    }
    return false;
  }

  function startJump(R) {
    const H = R.sneak > 0 ? CFG.SNEAK_H : CFG.JUMP_H, T = (R.sneak > 0 ? CFG.SNEAK_T : CFG.JUMP_T) * tscale(R.speed);
    R.g = 8 * H / (T * T); R.vy = 4 * H / T; R.grounded = false; R.coyote = 0; R.jumpBuf = 0; R.rollT = 0; R.jumpT = T;
    R.st.jump++; if (R.sneak > 0) R.st.sneakJump++;
    R.ev.push('jump');
  }
  function act(W, R, a) {
    if (R.dead) return false;
    if (a === 'left' || a === 'right') {
      const dir = a === 'left' ? -1 : 1, nl = R.lane + dir;
      if (nl < 0 || nl > 2) { if (R.edgeT <= 0) { R.edgeT = 0.24; R.edgeDir = dir; R.ev.push('edge'); } return false; }
      R.xFrom = R.x; R.lane = nl; R.lt = 0; R.ldir = dir; R.st.lanes++; R.ev.push('lane');
      return true;
    }
    if (R.jet > 0) return false;
    if (a === 'up') {
      if (R.grounded || R.coyote > 0) startJump(R); else R.jumpBuf = CFG.BUFFER;
      return true;
    }
    if (a === 'down') {
      R.rollD = CFG.ROLL_T * tscale(R.speed); R.rollT = R.rollD; R.st.roll++; R.jumpBuf = 0;
      if (!R.grounded) R.vy = Math.min(R.vy, -CFG.FALL_V);
      R.ev.push('roll');
      return true;
    }
    return false;
  }

  function stumble(W, R, why) {
    if (R.ghost > 0 || R.dead || R.stumbleT > 0) return;
    if (R.board > 0) { R.board = 0; R.ghost = CFG.GHOST_T; R.ev.push('board_break'); return; }
    R.st.stumble++;
    if (why === 'train') R.st.bump++;
    R.stumbleT = 0.45; R.nearN = 0; R.nearT = 0;
    R.ev.push('bump');
    if (R.chase > 0.15 && !R.warm) { die(W, R, 'caught'); return; }
    R.warm = false;
    R.chase = CFG.CHASE_T;
  }
  function die(W, R, why) {
    R.dead = why; R.deadT = 0; R.vy = Math.min(R.vy, 0); R.rollT = 0; R.ps = R.s; R.px = R.x; R.py = R.y;
    R.ev.push(why === 'caught' ? 'caught' : 'crash');
  }
  function crash(W, R, o) {
    if (R.board > 0) { R.board = 0; R.ghost = CFG.GHOST_T; o.hit = true; R.ev.push('board_break'); return; }
    R.hitObs = o;
    die(W, R, 'crash');
  }
  function sideBounce(W, R, o) {
    const ox = LX(o.lane);
    let back = -1;
    if (Math.abs(R.x - ox) < 0.05) { for (let l = o.lane - 1; l <= o.lane + 1; l += 2) if (back < 0 && l >= 0 && l <= 2 && !laneBlocked(W, R, l)) back = l; }
    else { back = o.lane + (R.x < ox ? -1 : 1); if (back < 0 || back > 2 || laneBlocked(W, R, back)) back = -1; }
    if (back < 0) return false;
    R.xFrom = R.x; R.lane = back; R.lt = 0; R.ldir = back > o.lane ? 1 : -1; R.ign = o;
    stumble(W, R, o.k === 'train' ? 'train' : 'bar');
    return true;
  }
  function nearMiss(R, o) {
    o.nm = true;
    R.nearN = R.nearT > 0 ? Math.min(5, R.nearN + 1) : 1; R.nearT = 6;
    R.st.near++;
    R.nearPts = 20 * R.nearN * R.mult; R.score += R.nearPts;
    R.ev.push('near');
  }

  function givePU(W, R, k, lvl) {
    const D = puDur(lvl || 0);
    R.st.pu++;
    if (k === 'jet') {
      R.jet = D; R.jetD = D; R.st.jet++; R.rollT = 0; R.ign = null;
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

  function land(R, y) {
    R.y = y; R.grounded = true; R.landT = 0.18;
    R.ev.push(R.vy < -14 ? 'land_hard' : 'land'); R.vy = 0;
    if (R.jumpBuf > 0) startJump(R);
  }

  function step(W, R, dt, ctx) {
    if (R.dead) { R.deadT += dt; R.speed = damp(R.speed, 0, 9, dt); R.ps = R.s; R.px = R.x; R.py = R.y; return; }
    R.ps = R.s; R.px = R.x; R.py = R.y;
    R.t += dt;
    R.speed = speedAt(R.t * R.vk + R.t0) * R.vs;
    if (R.speed > R.st.topV) R.st.topV = R.speed;
    const ps = R.s;
    R.s += R.speed * dt;
    if (R.lt < 1) R.lt = Math.min(1, R.lt + dt / CFG.LANE_T);
    R.x = lerp(R.xFrom, LX(R.lane), ease(R.lt));
    if (R.rollT > 0 && R.grounded) { R.rollT -= dt; if (R.rollT < 0) R.rollT = 0; }
    R.h = R.rollT > 0 ? CFG.H_ROLL : CFG.H_STAND;
    R.ghost = Math.max(0, R.ghost - dt); R.stumbleT = Math.max(0, R.stumbleT - dt);
    if (R.edgeT > 0) R.edgeT -= dt;
    if (R.nearT > 0) { R.nearT -= dt; if (R.nearT <= 0) R.nearN = 0; }
    if (R.chase > 0) { R.chase = Math.max(0, R.chase - dt); if (R.chase === 0) R.warm = false; }
    for (let i = 0; i < 3; i++) { const k = TIMED[i]; if (R[k] > 0) R[k] = Math.max(0, R[k] - dt); }
    if (R.board > 0) { R.board -= dt; if (R.board <= 0) { R.board = 0; R.ghost = Math.max(R.ghost, 0.6); R.ev.push('board_end'); } }
    if (R.jumpBuf > 0) R.jumpBuf -= dt;
    const sup = supportAt(W, laneOf(R.x), R.s);
    if (R.jet > 0) {
      R.jet -= dt;
      const tun = inTunnel(W, R.s + 25) || inTunnel(W, R.s);
      R.y = damp(R.y, tun ? 5.4 : CFG.JET_Y, 3.2, dt); R.vy = 0; R.grounded = false; R.chase = 0;
      if (R.jet <= 0) { R.jet = 0; R.g = 22; R.vy = 0; R.ghost = Math.max(R.ghost, 2.2); R.ev.push('jet_end'); }
    } else {
      if (R.grounded) {
        if (sup < R.y - 0.05) { R.grounded = false; R.coyote = CFG.COYOTE; R.vy = 0; R.g = 8 * CFG.JUMP_H / Math.pow(CFG.JUMP_T * tscale(R.speed), 2); }
        else if (sup - R.y < 1.35) R.y = sup;
      }
      if (!R.grounded) {
        if (R.coyote > 0) R.coyote -= dt;
        R.st.air += dt;
        R.vy -= R.g * dt; R.y += R.vy * dt;
        if (R.vy <= 0) {
          if (R.y <= sup && R.py >= sup - 0.6) land(R, sup);
          else if (R.y <= 0) land(R, 0);
        }
      }
    }
    if (R.landT > 0) R.landT -= dt;
    if (R.grounded && R.y > CFG.ROOF - 0.1) R.st.roof += R.speed * dt;

    const O = W.obs;
    for (let i = 0; i < O.length; i++) {
      const o = O[i];
      o.ps0 = o.s0;
      if (o.done || !o.moving) continue;
      if (!o.act && o.s0 - R.s < CFG.ACT_D) { o.act = true; R.ev.push('horn'); }
      if (o.act) { o.s0 -= o.v * dt; o.s1 = o.s0 + o.len; }
    }
    R.mult = (ctx.mult + R.mb) * (R.x2 > 0 ? 2 : 1);
    R.score += R.speed * dt * CFG.SCORE_K * R.mult;
    if (R.jet > 0) return;
    for (let i = 0; i < O.length; i++) {
      const o = O[i];
      if (o.done || o.hit) continue;
      if (o.s0 > R.s + 12 || o.s1 < R.s - 3) {
        if (o === R.ign) R.ign = null;
        if (!o.passed && o.s1 < R.s - 1 && (o.k === 'low' || o.k === 'high')) { o.passed = true; if (Math.abs(R.x - LX(o.lane)) < 1.3) R.st.dodge++; }
        continue;
      }
      const ox = LX(o.lane), hw = HW[o.k] + CFG.PHW, dx = Math.abs(R.x - ox);
      const sNow = R.s + CFG.PHD > o.s0 && R.s - CFG.PHD < o.s1;
      if (dx >= hw || !sNow) {
        if (o === R.ign) R.ign = null;
        if (o.k === 'train' && !o.nm && dx >= hw && Math.abs(R.px - ox) < hw && R.lane !== o.lane && R.ghost <= 0 && R.stumbleT <= 0 && R.y < CFG.ROOF - 0.45) {
          const gap = o.s0 - R.s - CFG.PHD;
          if (gap > -1.2 && gap < (R.speed + (o.act ? o.v : 0)) * CFG.NEAR_T) nearMiss(R, o);
        }
        continue;
      }
      if (!vsolid(o, R)) continue;
      if (R.ghost > 0) { o.hit = true; continue; }
      if (o === R.ign) continue;
      const sPrev = ps + CFG.PHD > o.ps0 && ps - CFG.PHD < o.ps0 + o.len;
      const moving = R.lt < 1, bar = o.k === 'low' || o.k === 'high';
      if (!sPrev) {
        if (moving && hw - dx <= CFG.GRAZE) {
          if (R.lane !== o.lane) { R.ign = o; stumble(W, R, bar ? 'bar' : 'train'); }
          else if (!sideBounce(W, R, o)) crash(W, R, o);
        } else if (o.k === 'low' && R.y > CFG.LOW_H - CFG.TRIP) { R.ign = o; stumble(W, R, 'bar'); }
        else crash(W, R, o);
      } else if (bar && !moving && R.lane === o.lane) { R.ign = o; stumble(W, R, 'bar'); }
      else if (!sideBounce(W, R, o)) crash(W, R, o);
      if (R.dead) return;
    }
  }

  function collect(W, R, dt, onItem) {
    const cy = R.y + (R.rollT > 0 ? 0.45 : 0.85);
    const magR = R.mag > 0 ? CFG.MAG_R : 0;
    const C = W.coins, k = magR ? 1 - Math.exp(-14 * dt) : 0;
    for (let i = 0; i < C.length; i++) {
      const c = C[i];
      if (c.got) continue;
      const ds = c.s - R.s;
      if (ds > 40) break;
      if (ds < -4) { c.got = true; c.missed = true; continue; }
      if (magR && !c.pull && ds < magR + 6 && ds > -2 && Math.abs(c.y - cy) < 12) { c.pull = true; c.mag = true; }
      if (c.pull) { c.x += (R.x - c.x) * k; c.y += (cy - c.y) * k; c.s += (R.s + 0.4 - c.s) * k; }
      if (Math.abs(c.s - R.s) < 0.9 && Math.abs(c.x - R.x) < 0.95 && Math.abs(c.y - cy) < 1.05) {
        c.got = true; R.coins++; R.st.coinsRun++; if (c.mag) R.st.magCoins++;
        R.ev.push('coin');
      }
    }
    const I = W.items;
    for (let i = 0; i < I.length; i++) {
      const it = I[i];
      if (it.got) continue;
      if (it.s < R.s - 4) { it.got = true; continue; }
      if (Math.abs(it.s - R.s) < 1.1 && Math.abs(it.x - R.x) < 1.1 && Math.abs(it.y - cy) < 1.4) { it.got = true; onItem(it); }
    }
  }

  function cull(W, R, onDrop) {
    const lim = R.s - CFG.BEHIND;
    let n = 0;
    for (let i = 0; i < W.obs.length; i++) { const o = W.obs[i]; if (o.done || o.s1 < lim) { if (o === R.ign) R.ign = null; onDrop(o); } else W.obs[n++] = o; }
    W.obs.length = n;
    n = 0;
    let sorted = true, last = -1e9;
    for (let i = 0; i < W.coins.length; i++) { const c = W.coins[i]; if (c.got || c.s < lim) continue; if (c.s < last - 0.01 && !c.pull) sorted = false; if (!c.pull) last = c.s; W.coins[n++] = c; }
    W.coins.length = n;
    if (!sorted) W.coins.sort((a, b) => a.s - b.s);
    n = 0;
    for (let i = 0; i < W.items.length; i++) { const it = W.items[i]; if (it.got || it.s < lim) onDrop(it); else W.items[n++] = it; }
    W.items.length = n;
    n = 0;
    for (let i = 0; i < W.tunnels.length; i++) if (W.tunnels[i].s1 > lim - 100) W.tunnels[n++] = W.tunnels[i];
    W.tunnels.length = n;
    n = 0;
    for (let i = 0; i < W.clear.length; i++) if (W.clear[i][1] > lim) W.clear[n++] = W.clear[i];
    W.clear.length = n;
  }

  function revive(W, R) {
    R.dead = ''; R.deadT = 0; R.ghost = CFG.REVIVE_GHOST; R.chase = 0; R.stumbleT = 0; R.revives++; R.ign = null; R.jumpBuf = 0; R.rollT = 0;
    R.t = Math.max(0, R.t * 0.9); R.speed = speedAt(R.t * R.vk + R.t0) * R.vs;
    R.vy = 0; R.lt = 1; R.x = LX(R.lane); R.xFrom = R.x;
    for (const o of W.obs) {
      if (o.s1 > R.s - 3 && o.s0 < R.s + 45) o.done = true;
      if (o.moving && o.s0 < R.s + CFG.ACT_D + 40 && o.s1 > R.s - 3) o.done = true;
    }
    if (R.hitObs) R.hitObs.done = true; R.hitObs = null;
    R.y = supportAt(W, R.lane, R.s); R.grounded = true;
    R.ps = R.s; R.px = R.x; R.py = R.y;
    W.clear.push([R.s, R.s + 45]);
  }
