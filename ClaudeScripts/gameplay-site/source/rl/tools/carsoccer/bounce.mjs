import { csAdapter, ourAdapter } from './adapters.mjs';
const vz0 = +(process.argv[2] || -0.01), z0 = +(process.argv[3] || 1000), w0 = JSON.parse(process.argv[4] || '[0,0,0]'), v0 = JSON.parse(process.argv[5] || '[0,0]');
const r = [csAdapter(false), ourAdapter(false)].map(a => { a.reset({ ball: { p: [0, 0, z0], v: [v0[0], v0[1], vz0], w: w0 }, car: { p: [3000, -4000, null] } }); const o = []; let lz = 0; for (let i = 0; i < 400; i++) { a.step(); const b = a.ball(); o.push(`${i} z=${b.p[2].toFixed(2)} vz=${b.v[2].toFixed(2)} vx=${b.v[0].toFixed(2)} vy=${b.v[1].toFixed(2)}`); } return o; });
const s = +(process.argv[6] || 0), e = +(process.argv[7] || 160);
for (let i = s; i < e; i++) console.log('T ' + r[0][i].padEnd(42) + ' O ' + r[1][i]);
