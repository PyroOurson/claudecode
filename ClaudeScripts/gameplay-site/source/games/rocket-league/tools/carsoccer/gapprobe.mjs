import { csAdapter } from './adapters.mjs';
const a = csAdapter(false);
for (const g of (process.argv[2] ? JSON.parse(process.argv[2]) : [1.5])) {
  for (const vz of [-50, -300]) {
    a.reset({ ball: { p: [0, 0, 91.75 + g], v: [0, 0, vz] }, car: { p: [3000, -4000, null] } });
    a.step(1); const b = a.ball(); console.log('gap', g, 'vz0', vz, '-> z', b.p[2].toFixed(4), 'vz', b.v[2].toFixed(3));
  }
}
