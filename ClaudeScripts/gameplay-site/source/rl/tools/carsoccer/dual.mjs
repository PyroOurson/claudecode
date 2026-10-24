import { makeCS } from './cs.mjs';
import fs from 'fs';
import vm from 'vm';

const SIM = process.env.SIM || 'C:/Users/gabri/Desktop/gameplaygames/site/source_snapshot/source/rl/seg/01_sim.js';
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;

function loadOurs(file) {
  const src = fs.readFileSync(file, 'utf8') + '\nglobalThis.__SIM = { CFG, BODIES, makeWorld, worldStep, placeCar, sdf };\n})();\n';
  const ctx = { Math, console, Float32Array, Float64Array, Uint8Array, Int16Array, DataView, ArrayBuffer, Array, Object, JSON, Number, String, Infinity, NaN, isFinite, btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary') };
  ctx.globalThis = ctx;
  vm.runInNewContext(src, ctx);
  return ctx.__SIM;
}
const O = loadOurs(SIM);
const CS = await makeCS();
const DT = 1 / 120;
function csAdapter(flat) {
  return {
    name: 'theirs',
    reset({ car = {}, ball = {} } = {}) {
      CS.setup([[0, flat ? 1 : 0]]);
      CS.step(1);
      const n = CS.net();
      const yaw = car.yaw ?? Math.PI / 2, f = [Math.cos(yaw), Math.sin(yaw), 0], r = [-Math.sin(yaw), Math.cos(yaw), 0], u = [0, 0, 1];
      const c = 21, p = car.p || [0, -3000, null];
      if (p[2] == null) p[2] = n[c + 2];
      n.set(p, c); n.set(f, c + 3); n.set(r, c + 6); n.set(u, c + 9); n.set(car.v || [0, 0, 0], c + 12); n.set(car.w || [0, 0, 0], c + 15);
      if (car.boost != null) n[c + 35] = car.boost;
      n.set(ball.p || [-3500, 4500, 93.65], 3); n.set(ball.v || [0, 0, 0], 15); n.set(ball.w || [0, 0, 0], 18);
      n[2] = 0; if (CS.restore(n) !== 1) throw new Error("restore"); CS.ctl(0, {}); CS.step(1); CS.restore(n);
    },
    ctl(k) { CS.ctl(0, { throttle: k.throttle, steer: k.steer, pitch: k.pitch, yaw: k.yaw, roll: k.roll, jump: k.jump, boost: k.boost, handbrake: k.slide }); },
    step(n = 1) { CS.step(n); },
    car() { const c = CS.car(0); return { p: c.p, v: c.v, w: c.w, f: c.f, u: c.u, boost: c.boost, ground: c.ground > 0 }; },
    ball() { const s = CS.st; return { p: [s[4], s[5], s[6]], v: [s[16], s[17], s[18]] }; },
  };
}
function ourAdapter(flat) {
  let W, c;
  return {
    name: 'ours',
    reset({ car = {}, ball = {} } = {}) {
      W = O.makeWorld({ roster: [{ team: 0, name: 'T', bot: false, body: flat ? 'dominus' : 'octane' }] });
      W.pr = true; W.state = 'play'; c = W.cars[0];
      const p = car.p || [0, -3000, null];
      O.placeCar(c, p[0], p[1], car.yaw ?? Math.PI / 2, p[2] == null ? undefined : p[2]);
      c.prevJump = false;
      if (car.v) Object.assign(c.v, { x: car.v[0], y: car.v[1], z: car.v[2] });
      if (car.v && Math.hypot(car.v[0], car.v[1]) > O.CFG.stopV) c.pk.brk = O.CFG.coastBrake;
      if (car.w) Object.assign(c.w, { x: car.w[0], y: car.w[1], z: car.w[2] });
      c.boost = car.boost ?? 33.333;
      const B = W.ball, bp = ball.p || [-3500, 4500, O.CFG.ballRest], bv = ball.v || [0, 0, 0], bw = ball.w || [0, 0, 0];
      Object.assign(B.p, { x: bp[0], y: bp[1], z: bp[2] }); Object.assign(B.v, { x: bv[0], y: bv[1], z: bv[2] }); Object.assign(B.w, { x: bw[0], y: bw[1], z: bw[2] });
    },
    ctl(k) { Object.assign(c.ctl, { throttle: k.throttle || 0, steer: -(k.steer || 0), pitch: k.pitch || 0, yaw: -(k.yaw || 0), roll: -(k.roll || 0), jump: !!k.jump, boost: !!k.boost, slide: !!k.slide }); },
    step(n = 1) { for (let i = 0; i < n; i++) O.worldStep(W, DT); },
    car() { return { p: [c.p.x, c.p.y, c.p.z], v: [c.v.x, c.v.y, c.v.z], w: [c.w.x, c.w.y, c.w.z], f: [c.f.x, c.f.y, c.f.z], u: [c.u.x, c.u.y, c.u.z], boost: c.boost, ground: c.onGround }; },
    ball() { const B = W.ball; return { p: [B.p.x, B.p.y, B.p.z], v: [B.v.x, B.v.y, B.v.z] }; },
  };
}
const len = v => Math.hypot(...v), hz = v => Math.hypot(v[0], v[1]);
const r1 = x => Math.round(x * 10) / 10, r3 = x => Math.round(x * 1000) / 1000;
function timeTo(A, k, pred, max = 10) { A.ctl(k); for (let i = 1; i <= max * 120; i++) { A.step(); if (pred(A)) return i / 120; } return NaN; }
function hold(A, k, sec) { A.ctl(k); A.step(Math.round(sec * 120)); }
const SC = {
  throttle(A) { A.reset(); const t1000 = timeTo(A, { throttle: 1 }, a => hz(a.car().v) >= 1000); hold(A, { throttle: 1 }, 4); return { t1000: r3(t1000), vmax: r1(hz(A.car().v)) }; },
  boost(A) {
    A.reset({ car: { boost: 100 } });
    const t1400 = timeTo(A, { throttle: 1, boost: true }, a => hz(a.car().v) >= 1400);
    A.reset({ car: { boost: 100 } }); const t2200 = timeTo(A, { throttle: 1, boost: true }, a => hz(a.car().v) >= 2200);
    hold(A, { throttle: 1, boost: true }, 1); const v = hz(A.car().v), b = A.car().boost;
    A.reset({ car: { boost: 100 } }); hold(A, { throttle: 1, boost: true }, 1);
    return { t1400: r3(t1400), t2200: r3(t2200), vmax: r1(v), boostUsed1s: r1(100 - A.car().boost) };
  },
  coast(A) { A.reset({ car: { v: [0, 1400, 0] } }); const t = timeTo(A, {}, a => hz(a.car().v) < 10); return { coast1400: r3(t) }; },
  brake(A) { A.reset({ car: { v: [0, 1400, 0] } }); const y0 = A.car().p[1]; const t = timeTo(A, { throttle: -1 }, a => a.car().v[1] < 1); return { brake1400: r3(t), dist: r1(A.car().p[1] - y0) }; },
  turn(A) {
    const out = {};
    for (const [sp, k] of [[500, { throttle: 0.37 }], [1000, { throttle: 1 }], [1400, { throttle: 1 }], [2300, { throttle: 1, boost: true }]]) {
      A.reset({ car: { v: [0, sp, 0], boost: 100, p: [0, 0, null] } });
      A.ctl({ ...k, steer: 1 }); A.step(60);
      let yaw = 0, n = 0, spd = 0;
      for (let i = 0; i < 60; i++) { A.step(); yaw += A.car().w[2]; spd += hz(A.car().v); n++; }
      out['r' + sp] = r1((spd / n) / Math.abs(yaw / n)); out['v' + sp] = r1(spd / n);
    }
    A.reset({ car: { v: [0, 1000, 0], p: [0, 0, null] } }); A.ctl({ throttle: 1, steer: 1, slide: true }); A.step(30);
    let yaw = 0, spd = 0; for (let i = 0; i < 30; i++) { A.step(); yaw += A.car().w[2]; spd += hz(A.car().v); }
    out.slideYawRate = r3(Math.abs(yaw / 30)); out.slideV = r1(spd / 30);
    return out;
  },
  jump(A) {
    const peak = (seq) => { A.reset(); const z0 = A.car().p[2]; let zm = z0; for (const [k, n] of seq) { A.ctl(k); for (let i = 0; i < n; i++) { A.step(); zm = Math.max(zm, A.car().p[2]); } } return r1(zm - z0); };
    return {
      tap: peak([[{ jump: true }, 1], [{}, 200]]),
      hold02: peak([[{ jump: true }, 24], [{}, 200]]),
      holdFull: peak([[{ jump: true }, 200]]),
      double: peak([[{ jump: true }, 24], [{}, 2], [{ jump: true }, 2], [{}, 200]]),
    };
  },
  flip(A) {
    const out = {};
    for (const sp of [0, 1000]) {
      A.reset({ car: { v: [0, sp, 0] } }); hold(A, { jump: true, throttle: 1 }, 2 / 120); hold(A, { throttle: 1 }, 0.1);
      A.ctl({ jump: true, pitch: -1, throttle: 1 }); A.step(1);
      let vmax = 0, pitch25 = null;
      for (let i = 1; i < 150; i++) { A.ctl({ jump: i < 3, pitch: -1, throttle: 1 }); A.step(); vmax = Math.max(vmax, hz(A.car().v)); if (i === 30) { const f = A.car().f; pitch25 = r1(Math.atan2(f[2], hz(f)) * 180 / Math.PI); } }
      out['front' + sp] = r1(vmax); out['pitch@0.25s_' + sp] = pitch25;
    }
    A.reset({ car: { v: [0, 1000, 0] } }); hold(A, { jump: true }, 2 / 120); hold(A, {}, 0.1);
    A.ctl({ jump: true, steer: 1, yaw: 1 }); A.step(1); let vm = 0, vlat = 0;
    for (let i = 1; i < 60; i++) { A.ctl({ jump: i < 3 }); A.step(); vm = Math.max(vm, hz(A.car().v)); vlat = Math.max(vlat, Math.abs(A.car().v[0])); }
    out.side1000 = r1(vm); out.sideLat = r1(vlat);
    A.reset({ car: { v: [0, 1000, 0] } }); hold(A, { jump: true }, 2 / 120); hold(A, {}, 0.1);
    A.ctl({ jump: true, pitch: 1 }); A.step(1); let vmin = 1e9;
    for (let i = 1; i < 60; i++) { A.ctl({ jump: i < 3, pitch: 1 }); A.step(); vmin = Math.min(vmin, A.car().v[1]); }
    out.back1000_minVy = r1(vmin);
    return out;
  },
  air(A) {
    const out = {};
    for (const ax of ['pitch', 'yaw', 'roll']) {
      A.reset({ car: { p: [0, 0, 1000] } });
      const k = { [ax]: 1, steer: ax === 'yaw' ? 1 : 0 };
      A.ctl(k); A.step(6); out[ax + '_w@0.05'] = r3(len(A.car().w));
      A.step(114); out[ax + '_wmax'] = r3(len(A.car().w));
      A.ctl({}); A.step(24); out[ax + '_w_after0.2release'] = r3(len(A.car().w));
    }
    A.reset({ car: { p: [0, 0, 1000] } }); A.ctl({ pitch: 1, yaw: 1, roll: 1, steer: 1 }); A.step(240); out.all_wmax = r3(len(A.car().w));
    A.reset({ car: { p: [0, 0, 300], boost: 100 } }); A.ctl({ boost: true }); A.step(60); out.airBoostDv1s_proxy = r1(len(A.car().v));
    A.reset({ car: { p: [0, 0, 1000] } }); A.ctl({ throttle: 1 }); A.step(120); out.airThrottleV1s = r1(len(A.car().v));
    return out;
  },
  balldrop(A) {
    A.reset({ ball: { p: [0, 0, 1000], v: [0, 0, -0.01] }, car: { p: [3000, -4000, null] } });
    const peaks = []; let lz = 1000, up = false;
    for (let i = 0; i < 1200 && peaks.length < 4; i++) { A.step(); const z = A.ball().p[2]; if (z > lz) up = true; else if (up && z < lz) { peaks.push(r1(lz)); up = false; } lz = z; }
    return { peaks: peaks.join('/') };
  },
  ballroll(A) {
    A.reset({ ball: { p: [0, -2000, 93.65], v: [0, 1000, 0] }, car: { p: [3000, -4000, null] } });
    const s = []; for (const t of [1, 2, 5]) { A.step(Math.round(t * 120) - (s.length ? Math.round([1, 2, 5][s.length - 1] * 120) : 0)); s.push(r1(hz(A.ball().v))); }
    return { rollSpeed125: s.join('/') };
  },
  ballhit(A) {
    const out = {};
    for (const sp of [500, 1000, 1400, 2300]) {
      A.reset({ car: { v: [0, sp, 0], p: [0, -1500, null], boost: 100 }, ball: { p: [0, 0, 93.65] } });
      let mx = 0; A.ctl({ throttle: 1, boost: sp > 1410 });
      for (let i = 0; i < 180; i++) { A.step(); mx = Math.max(mx, len(A.ball().v)); }
      out['hit' + sp] = r1(mx);
    }
    return out;
  },
  wall(A) {
    A.reset({ car: { v: [1400, 0, 0], p: [3000, 0, null], yaw: 0 } });
    A.ctl({ throttle: 1 }); let vAt = null, t = 0;
    for (let i = 0; i < 360; i++) { A.step(); if (A.car().u[2] < 0.05 && vAt == null) { vAt = len(A.car().v); t = i / 120; } }
    return { speedWhenVertical: vAt == null ? null : r1(vAt), t: r3(t), zAfter3s: r1(A.car().p[2]) };
  },
  ceilingMaxZ(A) { A.reset({ ball: { p: [0, 0, 1500], v: [0, 0, 3000] }, car: { p: [3000, -4000, null] } }); let zm = 0; for (let i = 0; i < 240; i++) { A.step(); zm = Math.max(zm, A.ball().p[2]); } return { ballMaxZ: r1(zm) }; },
  wallsX(A) { A.reset({ ball: { p: [0, 0, 600], v: [5000, 0, 0] }, car: { p: [3000, -4000, null] } }); let xm = 0; for (let i = 0; i < 240; i++) { A.step(); xm = Math.max(xm, A.ball().p[0]); } return { ballMaxX: r1(xm) }; },
  wallsY(A) { A.reset({ ball: { p: [2000, 0, 900], v: [0, 5000, 0] }, car: { p: [3000, -4000, null] } }); let m = 0; for (let i = 0; i < 240; i++) { A.step(); m = Math.max(m, A.ball().p[1]); } return { ballMaxY: r1(m) }; },
};

for (const flat of [false, true]) {
  console.log(`\n=== ${flat ? 'flat (Dominus hitbox)' : 'default (Octane hitbox)'} ===`);
  const A = [csAdapter(flat), ourAdapter(flat)];
  for (const [name, fn] of Object.entries(SC)) {
    if (ONLY && !ONLY.includes(name)) continue;
    if (flat && ['balldrop', 'ballroll', 'ceilingMaxZ', 'wallsX', 'wallsY'].includes(name)) continue;
    const res = A.map(a => fn(a));
    for (const k of Object.keys(res[0])) {
      const a = res[0][k], b = res[1][k], d = typeof a === 'number' && typeof b === 'number' && a ? ((b - a) / Math.abs(a) * 100).toFixed(1) + '%' : '';
      console.log(`${name}.${k}`.padEnd(32), String(a).padEnd(22), String(b).padEnd(22), d);
    }
  }
}
