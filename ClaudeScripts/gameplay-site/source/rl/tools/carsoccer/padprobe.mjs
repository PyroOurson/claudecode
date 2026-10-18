import { csAdapter, ourAdapter } from './adapters.mjs';
for (const a of [csAdapter(false), ourAdapter(false)]) {
  const res = [];
  for (const [x, y, big] of [[0, -1023.39, 0], [-3586.51, 0, 1]]) for (const z of [150, 160, 165, 168, 170, 175]) for (const dx of [0]) {
    a.reset({ car: { p: [x + dx, y, z], v: [0, 0, 0], boost: 0 } }); a.step(1); res.push(`${big ? 'B' : 's'}z${z}:${a.car().boost.toFixed(0)}`);
  }
  for (const r of [140, 143, 146, 150]) { a.reset({ car: { p: [r, -1023.39, 40], v: [0, 0, 0], boost: 0 } }); a.step(1); res.push(`s r${r}:${a.car().boost.toFixed(0)}`); }
  for (const r of [200, 206, 210, 214]) { a.reset({ car: { p: [-3586.51 + r, 0, 40], v: [0, 0, 0], boost: 0 } }); a.step(1); res.push(`B r${r}:${a.car().boost.toFixed(0)}`); }
  console.log(a.name, res.join(' '));
}
