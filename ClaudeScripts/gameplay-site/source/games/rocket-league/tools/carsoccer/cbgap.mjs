import { csAdapter } from './adapters.mjs';
const a = csAdapter(false);
const vel = +(process.argv[2] || 50);
for (const s of JSON.parse(process.argv[3] || '[0.5,1,1.3,1.5,1.6,1.7,1.8,1.9,2.0,2.5]')) {
  const cz = 17.05, hz = cz + 20.82545;
  a.reset({ car: { p: [0, 0, cz], v: [0, vel, 0] }, ball: { p: [0, 13.9 + 60.5 + 91.75 + s, hz], v: [0, 0, -0.01] } });
  a.step(1); const b = a.ball();
  console.log('gap', s, 'ball vy after 1 tick', b.v[1].toFixed(3));
}
