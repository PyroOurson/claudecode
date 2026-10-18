import og from './csmod.mjs';
import fs from 'fs';
import path from 'path';
const DIR = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '../cs/collision');
export async function makeCS() {
  const M = await og();
  const man = JSON.parse(fs.readFileSync(DIR + '/../manifest.json', 'utf8'));
  const bufs = man.map(f => new Uint8Array(fs.readFileSync(DIR + '/' + f)));
  const tot = bufs.reduce((a, b) => a + b.length, 0), r = M._malloc(tot), s = M._malloc(bufs.length * 4);
  let n = 0;
  bufs.forEach((b, i) => { M.HEAPU8.set(b, r + n); M.HEAP32[s / 4 + i] = b.length; n += b.length; });
  if (M._physics_init(r, s, bufs.length) !== 1) throw new Error('init');
  const api = {
    M,
    setup(cars = [[0, 0]]) { M._physics_createArena(); for (const [team, flat] of cars) M._physics_addCar(team, flat); M._physics_resetKickoff(-1); },
    get st() { return new Float32Array(M.HEAPF32.buffer, M._physics_getStatePtr(), M._physics_getStateSize()); },
    car(i) { const s = api.st, o = 22 + i * 51; return { p: [...s.subarray(o, o + 3)], f: [...s.subarray(o + 3, o + 6)], r: [...s.subarray(o + 6, o + 9)], u: [...s.subarray(o + 9, o + 12)], v: [...s.subarray(o + 12, o + 15)], w: [...s.subarray(o + 15, o + 18)], boost: s[o + 18], ground: s[o + 19], sup: s[o + 20] }; },
    ball() { const s = api.st, o = 4; return { p: [...s.subarray(o, o + 3)], raw: [...s.subarray(o, o + 18)] }; },
    ctl(i, c) { const v = new Float32Array(M.HEAPF32.buffer, M._physics_getControlsPtr(), 64), o = i * 8; v[o] = c.throttle || 0; v[o + 1] = c.steer || 0; v[o + 2] = c.pitch || 0; v[o + 3] = c.yaw || 0; v[o + 4] = c.roll || 0; v[o + 5] = c.jump ? 1 : 0; v[o + 6] = c.boost ? 1 : 0; v[o + 7] = c.handbrake ? 1 : 0; },
    step(n = 1) { for (let i = 0; i < n; i++) M._physics_step(1); },
    net() { const n = M._physics_captureNetwork(); return new Float32Array(M.HEAPF32.buffer, M._physics_getNetworkPtr(), n).slice(); },
    restore(a) { M.HEAPF32.set(a, M._physics_getNetworkPtr() / 4); return M._physics_restoreNetwork(a.length); },
  };
  return api;
}
