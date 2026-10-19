import { csAdapter } from './adapters.mjs';
const a = csAdapter(false);
for (const vz of [-2, -5, -8, -9, -9.5, -10, -10.5, -11, -12, -15, -20]) {
  a.reset({ ball: { p: [0, 0, 92.5], v: [0, 0, vz] }, car: { p: [3000, -4000, null] } });
  a.step(1); const b = a.ball(); console.log('vz0', vz, '-> vz', b.v[2].toFixed(4), 'z', b.p[2].toFixed(4));
}
