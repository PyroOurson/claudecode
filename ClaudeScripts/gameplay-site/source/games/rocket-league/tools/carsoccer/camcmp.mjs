import { makeCS } from './cs.mjs';
import { createRequire } from 'module';
const { makeCSCam } = createRequire(import.meta.url)('./cscam.js');
const K = { fov: 110, dist: 270, height: 100, angle: -3, stiff: 0.35, trans: 1, rateA: 6.32, rateB: 2.03, rateC: 4.14, nRate: -10.46, stiffK: 2.427, fastRate: -13.39, slowRate: -2.03,
  ballLift: 0.005, ballPitch: 0.8, ballRate: -8.59, distLag: 0.05, distLagMin: -50, fovSup: 10, fovRateSup: 40, fovSpeed: 5, fovRate: 25, roll: -0.1,
  swivelBack: 3, lookPitch: 1.0471975511965976, lookYaw: -2.2689280275926285, pitchMax: 1.4835298641951802 };
const CS = await makeCS();
const M = CS.M;
CS.setup([[0, 0]]);
M._v2();
const ptr = M._v0();
const ours = makeCSCam(K);
const seed = +(process.argv[2] || 1), T = +(process.argv[3] || 40), verbose = process.argv[4] === 'v';
let rs = seed; const rnd = () => (rs = (rs * 1103515245 + 12345) % 2147483648) / 2147483648;
const set = { fov: 110, dist: 270, height: 100, angle: -3, stiff: 0.35, trans: 1, swivel: 4, invert: true };
const q3 = (F, Uu, R) => { // rotation matrix columns F,U,R -> quaternion (three.js setFromRotationMatrix)
  const m11 = F[0], m12 = Uu[0], m13 = R[0], m21 = F[1], m22 = Uu[1], m23 = R[1], m31 = F[2], m32 = Uu[2], m33 = R[2], tr = m11 + m22 + m33;
  let x, y, z, w;
  if (tr > 0) { const s = 0.5 / Math.sqrt(tr + 1); w = 0.25 / s; x = (m32 - m23) * s; y = (m13 - m31) * s; z = (m21 - m12) * s; }
  else if (m11 > m22 && m11 > m33) { const s = 2 * Math.sqrt(1 + m11 - m22 - m33); w = (m32 - m23) / s; x = 0.25 * s; y = (m12 + m21) / s; z = (m13 + m31) / s; }
  else if (m22 > m33) { const s = 2 * Math.sqrt(1 + m22 - m11 - m33); w = (m13 - m31) / s; x = (m12 + m21) / s; y = 0.25 * s; z = (m23 + m32) / s; }
  else { const s = 2 * Math.sqrt(1 + m33 - m11 - m22); w = (m21 - m12) / s; x = (m13 + m31) / s; y = (m23 + m32) / s; z = 0.25 * s; }
  return [x, y, z, w];
};
const sw = v => [v[0], v[2], v[1]];
let t = 0, acc = 0, ballCam = true, worst = { p: 0, d: 0, f: 0 }, worstAt = null, frames = 0, ctl = {}, look = [0, 0], rear = false;
while (t < T) {
  const dt = rnd() < 0.15 ? 1 / 144 : rnd() < 0.1 ? 1 / 30 : 1 / 60;
  t += dt; acc += dt;
  if (rnd() < 0.02) ctl = { throttle: rnd() < 0.8 ? 1 : -1, steer: rnd() * 2 - 1, boost: rnd() < 0.4, jump: rnd() < 0.25, pitch: rnd() * 2 - 1, yaw: rnd() * 2 - 1, roll: rnd() < 0.3 ? rnd() * 2 - 1 : 0, handbrake: rnd() < 0.1 };
  if (rnd() < 0.006) ballCam = !ballCam;
  if (rnd() < 0.01) look = rnd() < 0.5 ? [0, 0] : [rnd() * 2 - 1, rnd() * 2 - 1];
  if (rnd() < 0.005) rear = !rear;
  while (acc >= 1 / 120) { CS.ctl(0, ctl); CS.step(1); acc -= 1 / 120; }
  const s = CS.st, o = 22;
  const car = sw([s[o], s[o + 1], s[o + 2]]), F = sw([s[o + 3], s[o + 4], s[o + 5]]), R = sw([s[o + 6], s[o + 7], s[o + 8]]), Uu = sw([s[o + 9], s[o + 10], s[o + 11]]);
  const vel = sw([s[o + 12], s[o + 13], s[o + 14]]), gn = sw([s[o + 38], s[o + 39], s[o + 40]]), ball = sw([s[4], s[5], s[6]]);
  const quat = q3(F, Uu, R), onG = s[o + 19] === 1, sup = s[o + 20] === 1;
  const inp = new Float64Array(M.HEAPF64.buffer, ptr, 42);
  inp.fill(0);
  inp.set([dt, ballCam ? 1 : 0, ...car, ...quat, ...ball, 1 | 2 | 4 | 8 | (rear ? 32 : 0), onG ? 1 : 0, ...gn, ...vel, sup ? 1 : 0, set.fov, set.dist, set.height, set.angle, set.stiff, set.trans, 16 / 9, look[0], look[1], set.swivel, set.invert ? 1 : 0]);
  M._v1();
  const out = new Float64Array(M.HEAPF64.buffer, ptr, 42);
  const th = { p: [out[32], out[33], out[34]], d: [out[35], out[36], out[37]], u: [out[38], out[39], out[40]], f: out[41] };
  const me = ours.step({ dt, ballCam, car, quat, ball, onGround: onG, normal: gn, vel, sup, set, aspect: 16 / 9, lookX: look[0], lookY: look[1], rear });
  const dp = Math.hypot(th.p[0] - me.p[0], th.p[1] - me.p[1], th.p[2] - me.p[2]), dd = Math.hypot(th.d[0] - me.dir[0], th.d[1] - me.dir[1], th.d[2] - me.dir[2]), df = Math.abs(th.f - me.fov);
  frames++;
  if (dp > worst.p) { worst.p = dp; worstAt = { t, dp, th, me, ballCam, onG, rear }; }
  worst.d = Math.max(worst.d, dd); worst.f = Math.max(worst.f, df);
  if (verbose && (frames % 30 === 0 || dp > 1)) console.log(t.toFixed(3), 'bc', ballCam, 'g', onG, 'r', rear, 'dp', dp.toFixed(4), 'dd', dd.toExponential(2), 'df', df.toFixed(4), 'T', th.p.map(x => x.toFixed(1)).join(','), 'O', me.p.map(x => x.toFixed(1)).join(','));
}
console.log('frames', frames, 'worst pos', worst.p.toExponential(3), 'dir', worst.d.toExponential(3), 'fov', worst.f.toExponential(3));
if (worstAt) console.log('worst at', worstAt.t.toFixed(3), JSON.stringify({ T: worstAt.th.p, O: worstAt.me.p, bc: worstAt.ballCam, g: worstAt.onG, rear: worstAt.rear }));
