import fs from 'fs'; import vm from 'vm';
const file = process.env.SIM || 'C:/Users/gabri/Desktop/gameplaygames/site/source_snapshot/source/rl/seg/01_sim.js';
const src = fs.readFileSync(file, 'utf8') + '\nglobalThis.__SIM = { CFG, makeWorld, worldStep, startMatch };\n})();\n';
const ctx = { Math, console, Float32Array, Float64Array, Uint8Array, Int16Array, DataView, ArrayBuffer, Array, Object, JSON, Number, String, Infinity, NaN, isFinite, btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary') };
ctx.globalThis = ctx; vm.runInNewContext(src, ctx); const O = ctx.__SIM;
for (const [size, seed, diffs] of [[1, 1, ['pro', 'pro']], [2, 2, ['allstar', 'rookie']], [3, 3, ['veteran', 'pro']]]) {
  const W = O.makeWorld({ size, human: false, seed, diffs }); O.startMatch(W);
  let t = 0, goals = 0, nan = false, maxStill = 0; const still = W.cars.map(() => 0);
  const t0 = Date.now();
  while (W.state !== 'end' && t < 900) {
    O.worldStep(W, 1 / 120); t += 1 / 120;
    for (const e of W.events) if (e.type === 'goal') goals++;
    W.events.length = 0;
    W.cars.forEach((c, i) => { if (![c.p.x, c.p.y, c.p.z, c.v.x].every(Number.isFinite)) nan = true; still[i] = W.state === "play" && Math.hypot(c.v.x, c.v.y) < 30 && c.demoT <= 0 ? still[i] + 1 / 120 : 0; if (still[i] > 2.5 && Math.abs(still[i] - 2.5) < 0.005) console.log("  still", c.name, c.team, "p", c.p.x.toFixed(0), c.p.y.toFixed(0), c.p.z.toFixed(0), "uz", c.u.z.toFixed(2), "mode", c.ai && c.ai.mode, c.ai && c.ai.park, "ball", W.ball.p.x.toFixed(0), W.ball.p.y.toFixed(0)); if (Math.abs(still[i] - 2.5) < 0.004) console.log('  still', c.name, c.team, 'p', c.p.x.toFixed(0), c.p.y.toFixed(0), c.p.z.toFixed(0), 'uz', c.u.z.toFixed(2), 'mode', c.ai && c.ai.mode, 'park', c.ai && c.ai.park, 'ball', W.ball.p.x.toFixed(0), W.ball.p.y.toFixed(0)); maxStill = Math.max(maxStill, still[i]); });
    if (!Number.isFinite(W.ball.p.x)) nan = true;
  }
  console.log(`${size}v${size} ${diffs}: state=${W.state} score=${W.score} goals=${goals} simT=${t.toFixed(0)}s nan=${nan} maxStill=${maxStill.toFixed(1)}s ot=${W.ot} wall=${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
