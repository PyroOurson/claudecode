import { makeCS } from './cs.mjs';
import fs from 'fs';
import vm from 'vm';

const SIM = process.env.SIM || 'C:/Users/gabri/Desktop/gameplaygames/site/source_snapshot/source/rl/seg/01_sim.js';


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
    ball() { const s = CS.st; return { p: [s[4], s[5], s[6]], v: [s[16], s[17], s[18]], w: [s[19], s[20], s[21]] }; },
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
    ball() { const B = W.ball; return { p: [B.p.x, B.p.y, B.p.z], v: [B.v.x, B.v.y, B.v.z], w: [B.w.x, B.w.y, B.w.z] }; },
  };
}
const len = v => Math.hypot(...v), hz = v => Math.hypot(v[0], v[1]);
const r1 = x => Math.round(x * 10) / 10, r3 = x => Math.round(x * 1000) / 1000;
function timeTo(A, k, pred, max = 10) { A.ctl(k); for (let i = 1; i <= max * 120; i++) { A.step(); if (pred(A)) return i / 120; } return NaN; }
function hold(A, k, sec) { A.ctl(k); A.step(Math.round(sec * 120)); }


export { csAdapter, ourAdapter, O, CS };
