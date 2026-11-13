import { O, CS } from './adapters.mjs';
function theirs(sp, angle, boost) {
  CS.setup([[0, 0], [1, 0]]); CS.step(1);
  const n = CS.net(); const c0 = 21, c1 = 21 + 81;
  const set = (o, p, yaw, v) => { n.set(p, o); n.set([Math.cos(yaw), Math.sin(yaw), 0], o + 3); n.set([-Math.sin(yaw), Math.cos(yaw), 0], o + 6); n.set([0, 0, 1], o + 9); n.set(v, o + 12); n.set([0, 0, 0], o + 15); n[o + 35] = 100; };
  set(c0, [0, -600, 17.05], Math.PI / 2, [0, sp, 0]); set(c1, [0, 0, 17.05], angle, [0, 0, 0]);
  n.set([-3500, 4500, 93.65], 3); n.set([0, 0, 0], 15); n[2] = 0;
  CS.restore(n); CS.ctl(0, {}); CS.ctl(1, {}); CS.step(1); CS.restore(n);
  const out = [];
  for (let i = 0; i < 90; i++) { CS.ctl(0, { throttle: 1, boost }); CS.ctl(1, {}); CS.step(1); const a = CS.car(0), b = CS.car(1); if (i % 6 === 0 || i < 0) out.push(`${i} A v=${a.v.map(x => x.toFixed(0))} B v=${b.v.map(x => x.toFixed(0))} Bw=${b.w.map(x => x.toFixed(1))} demo=${CS.st[22 + 51 + 21]}`); }
  return out;
}
function ours(sp, angle, boost) {
  const W = O.makeWorld({ roster: [{ team: 0, name: 'A', bot: false, body: 'octane' }, { team: 1, name: 'B', bot: false, body: 'octane' }] }); W.pr = true; W.state = 'play';
  Object.assign(W.ball.p, { x: -3500, y: 4500 });
  const [A, B] = W.cars; O.placeCar(A, 0, -600, Math.PI / 2, 17.05); O.placeCar(B, 0, 0, angle, 17.05); A.v.y = sp; A.boost = B.boost = 100; A.pk.brk = 0.15; A.prevJump = B.prevJump = false;
  const out = [];
  for (let i = 0; i < 90; i++) { Object.assign(A.ctl, { throttle: 1, boost }); O.worldStep(W, 1 / 120); if (i % 6 === 0) out.push(`${i} A v=${[A.v.x, A.v.y, A.v.z].map(x => x.toFixed(0))} B v=${[B.v.x, B.v.y, B.v.z].map(x => x.toFixed(0))} Bw=${[B.w.x, B.w.y, B.w.z].map(x => x.toFixed(1))} demo=${B.demoT > 0 ? 1 : 0}`); }
  return out;
}
const sp = +(process.argv[2] || 1000), ang = +(process.argv[3] || 0), boost = process.argv[4] === 'b';
const t = theirs(sp, ang, boost), o = ours(sp, ang, boost);
for (let i = 0; i < t.length; i++) console.log('T ' + t[i] + '\nO ' + o[i]);
