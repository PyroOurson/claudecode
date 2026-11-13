import { csAdapter, ourAdapter } from './adapters.mjs';
const cases = {
  flatDrop: { p: [0, 0, 300], v: [0, 0, -800], w: [0, 0, 0] },
  noseDown: { p: [0, 0, 200], v: [0, 500, -500], w: [-5, 0, 0] },
  sideRoll: { p: [0, 0, 200], v: [300, 0, -600], w: [0, 4, 0] },
  spinAll: { p: [0, 0, 200], v: [200, 300, -700], w: [-3, 2, 3] },
};
const flat = process.argv[2] === 'flat';
for (const [n, cs] of Object.entries(cases)) {
  const r = [csAdapter(flat), ourAdapter(flat)].map(a => {
    a.reset({ car: { p: cs.p.slice(), v: cs.v, w: cs.w } });
    a.ctl({}); const o = [];
    for (let i = 0; i < 90; i++) { a.step(); if (i % 15 === 14) { const c = a.car(); o.push(`z=${c.p[2].toFixed(0)} v=${c.v.map(x => x.toFixed(0))} w=${c.w.map(x => x.toFixed(2))}`); } }
    return o;
  });
  console.log('==', n); for (let i = 0; i < r[0].length; i++) console.log(' T ' + r[0][i] + '\n O ' + r[1][i]);
}
