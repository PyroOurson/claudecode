(() => {
'use strict';
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = t => t * t * (3 - 2 * t);
const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const ID = 'polytrack', G = '.gm-' + ID;
const mkRng = seed => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const mad3 = (a, b, s) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len3 = a => Math.hypot(a[0], a[1], a[2]);
const nrm3 = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const qrot = (q, v) => {
  const x = q[0], y = q[1], z = q[2], w = q[3];
  const tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
};
const qmul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
];
const qnrm = q => { const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; };
const qAxis = (ax, a) => { const s = Math.sin(a / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(a / 2)]; };
const qBasis = (r, u, b) => {
  const m00 = r[0], m10 = r[1], m20 = r[2], m01 = u[0], m11 = u[1], m21 = u[2], m02 = b[0], m12 = b[1], m22 = b[2];
  const tr = m00 + m11 + m22;
  let q;
  if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; q = [(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, s / 4]; }
  else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [s / 4, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]; }
  else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(m01 + m10) / s, s / 4, (m12 + m21) / s, (m02 - m20) / s]; }
  else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(m02 + m20) / s, (m12 + m21) / s, s / 4, (m10 - m01) / s]; }
  return qnrm(q);
};
const qSlerp = (a, b, t) => {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3], s = 1;
  if (d < 0) { d = -d; s = -1; }
  let k0, k1;
  if (d > 0.9995) { k0 = 1 - t; k1 = t; }
  else { const th = Math.acos(d), sn = Math.sin(th); k0 = Math.sin((1 - t) * th) / sn; k1 = Math.sin(t * th) / sn; }
  return [a[0] * k0 + b[0] * k1 * s, a[1] * k0 + b[1] * k1 * s, a[2] * k0 + b[2] * k1 * s, a[3] * k0 + b[3] * k1 * s];
};
const hex2lin = h => { const n = parseInt(h.slice(1), 16); return [Math.pow(((n >> 16) & 255) / 255, 2.2), Math.pow(((n >> 8) & 255) / 255, 2.2), Math.pow((n & 255) / 255, 2.2)]; };
const fmtT = ms => {
  if (ms == null || !isFinite(ms)) return '--:--.---';
  const neg = ms < 0; ms = Math.abs(Math.round(ms));
  const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, k = ms % 1000;
  return (neg ? '-' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(k).padStart(3, '0');
};
const fmtD = ms => (ms >= 0 ? '+' : '-') + fmtT(Math.abs(ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const b64e = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray ? bytes.subarray(i, i + 8192) : bytes.slice(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const b64d = str => { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };
const CELL = 20, HALF = 10, HU = 5, GY = -0.35, THK = 0.7;
const rotXZ = (x, z, r) => (r === 0 ? [x, z] : r === 1 ? [-z, x] : r === 2 ? [-x, -z] : [z, -x]);
const SEASONS = [
  { name: 'Summer', pal: ['#5b6177', '#d63a3a', '#f0f0f4', '#17171f', '#2c2f3d', '#2a2d3f', '#ffd23a', '#2f3243', '#6c7389', '#80879c', '#5c6378', '#14141c', '#f4f4f8', '#d83030', '#ffd23a', '#ffc82e', '#8a90a4'], ground: '#5aa05a', ground2: '#4a8f50', hill: ['#6fb066', '#4c9250', '#86c070'], sky: ['#2f7fe0', '#6fb4f2', '#cfe8ff'], fog: '#cfe8ff', sun: '#fff1d6', cloud: '#ffffff', gmu: 0.55, tint: '#5aa05a' },
  { name: 'Winter', pal: ['#6b7898', '#3a64d4', '#f4f8ff', '#202a40', '#3a4660', '#2f3b58', '#ffd23a', '#33405c', '#8795b4', '#a3b1cf', '#7f8dad', '#14141c', '#f4f4f8', '#d83030', '#ffd23a', '#ffc82e', '#aebad2'], ground: '#eef3fa', ground2: '#dfe8f4', hill: ['#f4f8ff', '#cfdff0', '#e4eef8'], sky: ['#7fa8dc', '#b4d0ee', '#eaf2fb'], fog: '#e6eff9', sun: '#f2f6ff', cloud: '#f4f8ff', gmu: 0.4, tint: '#9db8e0' },
  { name: 'Desert', pal: ['#bf9560', '#7a2e22', '#e6c690', '#3a1a22', '#6b4a34', '#4a2a2c', '#ffd23a', '#4a3226', '#c9a272', '#d6b27c', '#a98154', '#14141c', '#f4f4f8', '#d83030', '#ffd23a', '#ffc82e', '#b08a5a'], ground: '#d9b475', ground2: '#cfa465', hill: ['#e6c488', '#c99a5c', '#d8b078'], sky: ['#3f8be0', '#86bff0', '#f3e2bd'], fog: '#efd9ab', sun: '#fff0d0', cloud: '#fff6e6', gmu: 0.7, tint: '#e0b46a' }
];
SEASONS.forEach(s => { s.lp = s.pal.map(hex2lin); });
const PROFS = {
  road: { pts: [[-5.9, 0], [-5, 0], [5, 0], [5.9, 0]], seg: [{ c: 'k', kd: 1 }, { c: 0, kd: 1 }, { c: 'k', kd: 1 }], bot: [0, 3] },
  boost: { pts: [[-5.9, 0], [-5, 0], [5, 0], [5.9, 0]], seg: [{ c: 'k', kd: 1 }, { c: 7, kd: 3 }, { c: 'k', kd: 1 }], bot: [0, 3] },
  wallL: { pts: [[-13, 12], [-13, 8], [-12.39, 4.94], [-10.66, 2.34], [-8.06, 0.61], [-5, 0], [5, 0], [5.9, 0]], seg: [{ c: 3, kd: 2 }, { c: 3, kd: 2 }, { c: 3, kd: 2 }, { c: 3, kd: 2 }, { c: 3, kd: 2 }, { c: 0, kd: 1 }, { c: 'k', kd: 1 }], bot: [-1, 7] },
  tube: { pts: [[-5.6, 4], [-5.6, 0], [5.6, 0], [5.6, 4]], seg: [{ c: 3, kd: 2 }, { c: 5, kd: 1 }, { c: 3, kd: 2 }], bot: [1, 2] },
  wide: { pts: [[-10, 0], [10, 0]], seg: [{ c: 8, kd: 1 }], bot: [0, 1] }
};
PROFS.wallR = { pts: PROFS.wallL.pts.map(p => [-p[0], p[1]]).reverse(), seg: PROFS.wallL.seg.slice().reverse(), bot: [PROFS.wallL.pts.length - 1 - 7, -1] };
const PIECES = [], DEF = {};
function addDef(id, name, cat, o) {
  const d = Object.assign({ id, name, cat, idx: PIECES.length, prof: 'road', exit: [0, -1, 0, 0], cells: null }, o);
  PIECES.push(d); DEF[id] = d; return d;
}
const straightFn = nc => s => [0, 0, HALF - s * nc * CELL];
const curveFn = (k, dir) => { const R = (k + 0.5) * CELL; return s => { const a = s * PI / 2; return [dir * R * (1 - Math.cos(a)), 0, HALF - R * Math.sin(a)]; }; };
const slopeFn = (nc, n) => s => [0, n * HU * (s - Math.sin(TAU * s) / TAU), HALF - s * nc * CELL];
const kickFn = (nc, rise) => s => [0, rise * s * s, HALF - s * nc * CELL];
const LOOP_R = 16;
const loopFn = side => s => { const t = s * TAU; return [side * CELL * (t - Math.sin(t)) / TAU, LOOP_R * (1 - Math.cos(t)), HALF - LOOP_R * Math.sin(t)]; };
const loopUp = s => { const t = s * TAU; return [0, Math.cos(t), Math.sin(t)]; };
const sbendFn = side => s => [side * CELL * (s - Math.sin(TAU * s) / TAU), 0, HALF - s * 3 * CELL];
addDef('st', 'Straight', 'Road', { fn: straightFn(1) });
addDef('st2', 'Straight 2', 'Road', { fn: straightFn(2), exit: [0, -2, 0, 0] });
addDef('bo', 'Boost', 'Road', { fn: straightFn(1), prof: 'boost', chev: true });
addDef('sa', 'Start', 'Gates', { fn: straightFn(1), gate: 'start' });
addDef('ck', 'Checkpoint', 'Gates', { fn: straightFn(1), gate: 'cp' });
addDef('fi', 'Finish', 'Gates', { fn: straightFn(1), gate: 'fin' });
[1, 2, 3].forEach(k => {
  addDef('cl' + k, 'Curve L' + k, 'Curves', { fn: curveFn(k - 1, -1), exit: [-k, -(k - 1), 0, -1] });
  addDef('cr' + k, 'Curve R' + k, 'Curves', { fn: curveFn(k - 1, 1), exit: [k, -(k - 1), 0, 1] });
});
[2, 3].forEach(k => {
  addDef('bl' + k, 'Banked L' + k, 'Banked', { fn: curveFn(k - 1, -1), bank: s => -0.46 * Math.sin(PI * s), exit: [-k, -(k - 1), 0, -1] });
  addDef('br' + k, 'Banked R' + k, 'Banked', { fn: curveFn(k - 1, 1), bank: s => 0.46 * Math.sin(PI * s), exit: [k, -(k - 1), 0, 1] });
});
addDef('su1', 'Slope up', 'Slopes', { fn: slopeFn(1, 1), exit: [0, -1, 1, 0] });
addDef('sd1', 'Slope down', 'Slopes', { fn: slopeFn(1, -1), exit: [0, -1, -1, 0] });
addDef('sul', 'Long slope up', 'Slopes', { fn: slopeFn(2, 1), exit: [0, -2, 1, 0] });
addDef('sdl', 'Long slope down', 'Slopes', { fn: slopeFn(2, -1), exit: [0, -2, -1, 0] });
addDef('su2', 'Steep up', 'Slopes', { fn: slopeFn(2, 2), exit: [0, -2, 2, 0] });
addDef('sd2', 'Steep down', 'Slopes', { fn: slopeFn(2, -2), exit: [0, -2, -2, 0] });
addDef('rp', 'Kicker', 'Jumps', { fn: kickFn(1, 2.5), exit: [0, -1, 0, 0] });
addDef('rp2', 'Big kicker', 'Jumps', { fn: kickFn(2, 5), exit: [0, -2, 1, 0] });
addDef('lpl', 'Loop left', 'Loops', { fn: loopFn(-1), up: loopUp, prof: 'tube', exit: [-1, 0, 0, 0], ds: 2.5 });
addDef('lpr', 'Loop right', 'Loops', { fn: loopFn(1), up: loopUp, prof: 'tube', exit: [1, 0, 0, 0], ds: 2.5 });
addDef('wl', 'Wall left', 'Walls', { fn: straightFn(1), prof: 'wallL' });
addDef('wr', 'Wall right', 'Walls', { fn: straightFn(1), prof: 'wallR' });
addDef('wcl', 'Wall curve L', 'Walls', { fn: curveFn(2, -1), prof: 'wallR', bank: s => -0.24 * Math.sin(PI * s), exit: [-3, -2, 0, -1] });
addDef('wcr', 'Wall curve R', 'Walls', { fn: curveFn(2, 1), prof: 'wallL', bank: s => 0.24 * Math.sin(PI * s), exit: [3, -2, 0, 1] });
addDef('sl', 'S-bend L', 'Curves', { fn: sbendFn(-1), exit: [-1, -3, 0, 0] });
addDef('sr', 'S-bend R', 'Curves', { fn: sbendFn(1), exit: [1, -3, 0, 0] });
addDef('pl', 'Plane', 'Blocks', { fn: straightFn(1), prof: 'wide', N: 2, nopillar: false });
addDef('wd', 'Wedge', 'Blocks', { fn: s => [0, HU * s, HALF - s * CELL], prof: 'wide', N: 2, exit: [0, -1, 1, 0] });
addDef('blk', 'Block', 'Blocks', { custom: true, cells: [[0, 0, 0]] });
const CATS = ['Road', 'Curves', 'Banked', 'Slopes', 'Jumps', 'Loops', 'Walls', 'Gates', 'Blocks'];
const PIDX = { start: DEF.sa.idx, cp: DEF.ck.idx, fin: DEF.fi.idx };

function posAt(d, s) {
  const p = d.fn(s);
  if (d.bank) { const b = d.bank(s); return [p[0], p[1] + 5.9 * Math.sin(Math.abs(b)), p[2]]; }
  return p;
}
function frameAt(d, s) {
  const e = 1e-4, a = posAt(d, clamp(s - e, 0, 1)), b = posAt(d, clamp(s + e, 0, 1)), p = posAt(d, s);
  const f = nrm3(sub3(b, a));
  const r0 = nrm3(crs3(f, d.up ? d.up(s) : [0, 1, 0])), u0 = crs3(r0, f);
  const ro = d.bank ? d.bank(s) : 0;
  if (!ro) return { p, f, r: r0, u: u0 };
  const c = Math.cos(ro), sn = Math.sin(ro);
  return { p, f, r: sub3(mul3(r0, c), mul3(u0, sn)), u: add3(mul3(u0, c), mul3(r0, sn)) };
}
function lenOf(d) {
  let l = 0, q = posAt(d, 0);
  for (let i = 1; i <= 48; i++) { const p = posAt(d, i / 48); l += len3(sub3(p, q)); q = p; }
  return l;
}
function mq(m, a, b, c, dd, ci, kd) {
  const P = m.p;
  P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], a[0], a[1], a[2], c[0], c[1], c[2], dd[0], dd[1], dd[2]);
  m.ci.push(ci, ci); m.kd.push(kd, kd);
}
function mt(m, a, b, c, ci, kd) {
  m.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  m.ci.push(ci); m.kd.push(kd);
}
function obox(m, c, ax, ay, az, hx, hy, hz, ci, kd) {
  const pt = (sx, sy, sz) => [c[0] + ax[0] * hx * sx + ay[0] * hy * sy + az[0] * hz * sz, c[1] + ax[1] * hx * sx + ay[1] * hy * sy + az[1] * hz * sz, c[2] + ax[2] * hx * sx + ay[2] * hy * sy + az[2] * hz * sz];
  const v = [pt(-1, -1, -1), pt(1, -1, -1), pt(1, 1, -1), pt(-1, 1, -1), pt(-1, -1, 1), pt(1, -1, 1), pt(1, 1, 1), pt(-1, 1, 1)];
  [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]].forEach(q => mq(m, v[q[0]], v[q[1]], v[q[2]], v[q[3]], ci, kd));
}
function gateGeo(m, d, f) {
  const kind = d.gate, col = kind === 'cp' ? 15 : kind === 'start' ? 12 : 12;
  const at = (u, v, w) => add3(f.p, add3(mul3(f.r, u), add3(mul3(f.u, v), mul3(f.f, w))));
  obox(m, at(-6.6, 3.9, 0), f.r, f.u, f.f, 0.35, 3.9, 0.35, col, 255);
  obox(m, at(6.6, 3.9, 0), f.r, f.u, f.f, 0.35, 3.9, 0.35, col, 255);
  obox(m, at(0, 8, 0), f.r, f.u, f.f, 6.95, 0.35, 0.35, kind === 'cp' ? 15 : 12, 255);
  if (kind === 'start') {
    mq(m, at(-6.3, 6.2, 0), at(6.3, 6.2, 0), at(6.3, 7.65, 0), at(-6.3, 7.65, 0), 13, 255);
    mq(m, at(-6.3, 6.75, 0.02), at(6.3, 6.75, 0.02), at(6.3, 7.1, 0.02), at(-6.3, 7.1, 0.02), 12, 255);
  } else if (kind === 'fin') {
    for (let i = 0; i < 14; i++) for (let j = 0; j < 3; j++) {
      const u0 = -6.3 + i * 0.9, v0 = 6.2 + j * 0.48;
      mq(m, at(u0, v0, 0), at(u0 + 0.9, v0, 0), at(u0 + 0.9, v0 + 0.48, 0), at(u0, v0 + 0.48, 0), (i + j) & 1 ? 11 : 12, 255);
    }
  } else {
    obox(m, at(0, 5.6, 0), f.r, f.u, f.f, 6.3, 0.12, 0.12, 15, 255);
    obox(m, at(0, 3.2, 0), f.r, f.u, f.f, 6.3, 0.1, 0.1, 15, 255);
  }
  if (kind === 'cp') mq(m, at(-5, 0.03, -0.2), at(5, 0.03, -0.2), at(5, 0.03, 0.2), at(-5, 0.03, 0.2), 14, 255);
  else for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) {
    const u0 = -5 + i * 1.25, w0 = -1 + j;
    mq(m, at(u0, 0.03, w0), at(u0 + 1.25, 0.03, w0), at(u0 + 1.25, 0.03, w0 + 1), at(u0, 0.03, w0 + 1), (i + j) & 1 ? 11 : 12, 255);
  }
}
function chevGeo(m, d, N) {
  for (const s of [0.18, 0.39, 0.6, 0.81]) {
    const f = frameAt(d, s), at = (u, w) => add3(f.p, add3(mul3(f.r, u), add3(mul3(f.u, 0.05), mul3(f.f, w))));
    mq(m, at(-3.2, -1.2), at(0, 1.4), at(0, 0.2), at(-3.2, -2.4), 6, 3);
    mq(m, at(0, 1.4), at(3.2, -1.2), at(3.2, -2.4), at(0, 0.2), 6, 3);
  }
}
const LOCAL = {};
function buildLocal(d) {
  const m = { p: [], ci: [], kd: [], gates: [] };
  if (d.custom) {
    const h = HALF, y = HU, T = [-h, y, -h], A = [h, y, -h], B = [h, y, h], C = [-h, y, h];
    mq(m, T, A, B, C, 9, 1);
    mq(m, [-h, 0, h], [h, 0, h], [h, y, h], [-h, y, h], 10, 2);
    mq(m, [h, 0, -h], [-h, 0, -h], [-h, y, -h], [h, y, -h], 10, 2);
    mq(m, [-h, 0, -h], [-h, 0, h], [-h, y, h], [-h, y, -h], 10, 2);
    mq(m, [h, 0, h], [h, 0, -h], [h, y, -h], [h, y, h], 10, 2);
    return fin(m);
  }
  const P = PROFS[d.prof], N = d.N || Math.max(1, Math.ceil(lenOf(d) / (d.ds || 2.5)));
  const fr = [], rings = [];
  for (let i = 0; i <= N; i++) {
    const f = frameAt(d, i / N); fr.push(f);
    rings.push(P.pts.map(q => add3(f.p, add3(mul3(f.r, q[0]), mul3(f.u, q[1])))));
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < P.seg.length; j++) {
    const sg = P.seg[j], ci = sg.c === 'k' ? (i & 1 ? 1 : 2) : sg.c;
    mq(m, rings[i][j], rings[i][j + 1], rings[i + 1][j + 1], rings[i + 1][j], ci, sg.kd);
  }
  const a = P.bot[0], b = P.bot[1];
  for (let i = 0; i < N; i++) {
    const du = mul3(fr[i].u, -THK), dn = mul3(fr[i + 1].u, -THK);
    if (a >= 0) mq(m, rings[i][a], rings[i + 1][a], add3(rings[i + 1][a], dn), add3(rings[i][a], du), 4, 255);
    if (b >= 0) mq(m, rings[i][b], rings[i + 1][b], add3(rings[i + 1][b], dn), add3(rings[i][b], du), 4, 255);
    if (a >= 0 && b >= 0) mq(m, add3(rings[i][a], du), add3(rings[i][b], du), add3(rings[i + 1][b], dn), add3(rings[i + 1][a], dn), 4, 255);
  }
  if (d.gate) { const f = frameAt(d, 0.5); gateGeo(m, d, f); m.gates.push({ kind: d.gate, f }); }
  if (d.chev) chevGeo(m, d, N);
  return fin(m);
}
function fin(m) { return { p: Float32Array.from(m.p), ci: Uint8Array.from(m.ci), kd: Uint8Array.from(m.kd), gates: m.gates }; }
const localOf = d => LOCAL[d.idx] || (LOCAL[d.idx] = buildLocal(d));
const cellOf = (x, y, z) => [Math.floor((x + HALF) / CELL + 1e-6), Math.floor(y / HU + 1e-6), Math.floor((z + HALF) / CELL + 1e-6)];
function cellsLocal(d) {
  if (d.cells) return d.cells;
  const m = localOf(d), set = new Map();
  for (let i = 0; i < m.kd.length; i++) {
    if (m.kd[i] === 255) continue;
    const o = i * 9, c = [0, 0, 0];
    for (let k = 0; k < 3; k++) c[k] = (m.p[o + k] + m.p[o + 3 + k] + m.p[o + 6 + k]) / 3;
    for (let v = 0; v < 3; v++) {
      const q = [0, 0, 0];
      for (let k = 0; k < 3; k++) q[k] = m.p[o + v * 3 + k] * 0.9 + c[k] * 0.1;
      const cl = cellOf(q[0], q[1], q[2]);
      set.set(cl.join(','), cl);
    }
  }
  d.cells = [...set.values()];
  return d.cells;
}
function cellsOfPiece(pc) {
  const d = PIECES[pc[0]], out = [];
  for (const c of cellsLocal(d)) { const r = rotXZ(c[0], c[2], pc[4]); out.push([pc[1] + r[0], pc[3] + c[1], pc[2] + r[1]]); }
  return out;
}
const ckey = c => c[0] + ',' + c[1] + ',' + c[2];
function exitOf(pc) {
  const d = PIECES[pc[0]], r = rotXZ(d.exit[0], d.exit[1], pc[4]);
  return { cx: pc[1] + r[0], cz: pc[2] + r[1], lv: pc[3] + d.exit[2], dir: (pc[4] + d.exit[3] + 4) & 3 };
}
function walk(str) {
  let cx = 0, cz = 0, lv = 0, dir = 0;
  const out = [];
  for (let tok of str.trim().split(/\s+/)) {
    if (!tok) continue;
    let n = 1; const mm = /^(.+)\*(\d+)$/.exec(tok);
    if (mm) { tok = mm[1]; n = +mm[2]; }
    for (let k = 0; k < n; k++) {
      let g;
      if ((g = /^G(\d+)$/i.exec(tok))) { const r = rotXZ(0, -g[1], dir); cx += r[0]; cz += r[1]; }
      else if ((g = /^H([+-]\d+)$/i.exec(tok))) lv += +g[1];
      else if ((g = /^M([LR])(\d+)$/i.exec(tok))) { const r = rotXZ((g[1].toUpperCase() === 'R' ? 1 : -1) * g[2], 0, dir); cx += r[0]; cz += r[1]; }
      else if (/^T[LR]$/i.test(tok)) dir = (dir + (tok[1].toUpperCase() === 'R' ? 1 : 3)) & 3;
      else {
        const d = DEF[tok.toLowerCase()];
        if (!d) throw new Error('bad token ' + tok);
        const pc = [d.idx, cx, cz, lv, dir]; out.push(pc);
        const e = exitOf(pc); cx = e.cx; cz = e.cz; lv = e.lv; dir = e.dir;
      }
    }
  }
  return out;
}
const CODE_VER = 1;
function encodeTrack(t) {
  const nm = new TextEncoder().encode(String(t.name || '').slice(0, 40)), n = t.pieces.length;
  const b = new Uint8Array(6 + nm.length + n * 4 + 1);
  let o = 0;
  b[o++] = CODE_VER; b[o++] = t.season & 3; b[o++] = nm.length; b.set(nm, o); o += nm.length;
  b[o++] = n & 255; b[o++] = (n >> 8) & 255;
  for (const p of t.pieces) { b[o++] = p[0]; b[o++] = (p[1] + 128) & 255; b[o++] = (p[2] + 128) & 255; b[o++] = (p[3] & 63) | ((p[4] & 3) << 6); }
  let sum = 0; for (let i = 0; i < o; i++) sum = (sum * 31 + b[i]) & 255;
  b[o++] = sum;
  return 'PT' + b64e(b.subarray(0, o));
}
function decodeTrack(code) {
  try {
    code = String(code).trim();
    if (code.slice(0, 2) !== 'PT') return null;
    const b = b64d(code.slice(2));
    if (b[0] !== CODE_VER) return null;
    let sum = 0; for (let i = 0; i < b.length - 1; i++) sum = (sum * 31 + b[i]) & 255;
    if (sum !== b[b.length - 1]) return null;
    let o = 1; const season = b[o++] & 3, nl = b[o++], name = new TextDecoder().decode(b.subarray(o, o + nl)); o += nl;
    const n = b[o] | (b[o + 1] << 8); o += 2;
    if (o + n * 4 + 1 !== b.length) return null;
    const pieces = [];
    for (let i = 0; i < n; i++) {
      const t = b[o++], x = b[o++] - 128, z = b[o++] - 128, w = b[o++];
      if (t >= PIECES.length || season > 2) return null;
      pieces.push([t, x, z, w & 63, w >> 6]);
    }
    return { name, season: Math.min(season, 2), pieces };
  } catch (e) { return null; }
}
const splitCodes = txt => String(txt).split(/[\s,;]+/).filter(s => s.slice(0, 2) === 'PT').map(decodeTrack).filter(Boolean);
const worldPt = (pl, v) => { const r = rotXZ(v[0], v[2], pl.r); return [r[0] + pl.ox, v[1] + pl.oy, r[1] + pl.oz]; };
const worldVec = (pl, v) => { const r = rotXZ(v[0], v[2], pl.r); return [r[0], v[1], r[1]]; };
function Hash(P, K, cs) {
  const n = K.length, h = { P, K, cs, n, map: new Map(), nrm: new Float32Array(n * 3), stamp: new Int32Array(n), q: 0 };
  const key = (x, y, z) => ((x + 2048) * 4096 + (y + 2048)) * 4096 + (z + 2048);
  h.key = key;
  for (let i = 0; i < n; i++) {
    const o = i * 9, ax = P[o], ay = P[o + 1], az = P[o + 2], bx = P[o + 3], by = P[o + 4], bz = P[o + 5], cx = P[o + 6], cy = P[o + 7], cz = P[o + 8];
    const e1x = bx - ax, e1y = by - ay, e1z = bz - az, e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
    let nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    const l = Math.hypot(nx, ny, nz) || 1;
    h.nrm[i * 3] = nx / l; h.nrm[i * 3 + 1] = ny / l; h.nrm[i * 3 + 2] = nz / l;
    const x0 = Math.floor(Math.min(ax, bx, cx) / cs), x1 = Math.floor(Math.max(ax, bx, cx) / cs);
    const y0 = Math.floor(Math.min(ay, by, cy) / cs), y1 = Math.floor(Math.max(ay, by, cy) / cs);
    const z0 = Math.floor(Math.min(az, bz, cz) / cs), z1 = Math.floor(Math.max(az, bz, cz) / cs);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
      const k = key(x, y, z); let a = h.map.get(k);
      if (!a) { a = []; h.map.set(k, a); }
      a.push(i);
    }
  }
  return h;
}
const HIT = { t: 0, nx: 0, ny: 1, nz: 0, kd: 0, tri: -1 };
function castRay(h, ox, oy, oz, dx, dy, dz) {
  let best = 2, bk = 0, bn = -1, nx = 0, ny = 1, nz = 0;
  if (h) {
    const P = h.P, cs = h.cs, ex = ox + dx, ey = oy + dy, ez = oz + dz;
    const x0 = Math.floor((Math.min(ox, ex) - 0.02) / cs), x1 = Math.floor((Math.max(ox, ex) + 0.02) / cs);
    const y0 = Math.floor((Math.min(oy, ey) - 0.02) / cs), y1 = Math.floor((Math.max(oy, ey) + 0.02) / cs);
    const z0 = Math.floor((Math.min(oz, ez) - 0.02) / cs), z1 = Math.floor((Math.max(oz, ez) + 0.02) / cs);
    const q = ++h.q;
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
      const a = h.map.get(h.key(x, y, z));
      if (!a) continue;
      for (let ii = 0; ii < a.length; ii++) {
        const i = a[ii];
        if (h.stamp[i] === q) continue;
        h.stamp[i] = q;
        const o = i * 9, ax = P[o], ay = P[o + 1], az = P[o + 2];
        const e1x = P[o + 3] - ax, e1y = P[o + 4] - ay, e1z = P[o + 5] - az, e2x = P[o + 6] - ax, e2y = P[o + 7] - ay, e2z = P[o + 8] - az;
        const hx = dy * e2z - dz * e2y, hy = dz * e2x - dx * e2z, hz = dx * e2y - dy * e2x;
        const det = e1x * hx + e1y * hy + e1z * hz;
        if (det > -1e-9 && det < 1e-9) continue;
        const f = 1 / det, sx = ox - ax, sy = oy - ay, sz = oz - az;
        const u = f * (sx * hx + sy * hy + sz * hz);
        if (u < -1e-6 || u > 1 + 1e-6) continue;
        const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
        const v = f * (dx * qx + dy * qy + dz * qz);
        if (v < -1e-6 || u + v > 1 + 1e-6) continue;
        const t = f * (e2x * qx + e2y * qy + e2z * qz);
        if (t < 0 || t > 1 || t >= best) continue;
        best = t; bn = i;
      }
    }
    if (bn >= 0) {
      bk = h.K[bn]; nx = h.nrm[bn * 3]; ny = h.nrm[bn * 3 + 1]; nz = h.nrm[bn * 3 + 2];
      if (nx * dx + ny * dy + nz * dz > 0) { nx = -nx; ny = -ny; nz = -nz; }
    }
  }
  if (dy < -1e-9) {
    const tg = (GY - oy) / dy;
    if (tg >= 0 && tg <= 1 && tg < best) { best = tg; bk = 0; bn = -2; nx = 0; ny = 1; nz = 0; }
  } else if (dy > 1e-9) {
    const tg = (GY - oy) / dy;
    if (tg >= 0 && tg <= 1 && tg < best) { best = tg; bk = 0; bn = -2; nx = 0; ny = -1; nz = 0; }
  }
  if (bn === -1) return null;
  HIT.t = best; HIT.nx = nx; HIT.ny = ny; HIT.nz = nz; HIT.kd = bk; HIT.tri = bn;
  return HIT;
}
function compileTrack(tr, opt) {
  opt = opt || {};
  const S = SEASONS[tr.season || 0];
  const P = [], CI = [], KD = [], placed = [], gates = [], occ = new Map();
  let overlap = 0, minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
  for (let i = 0; i < tr.pieces.length; i++) {
    const pc = tr.pieces[i], d = PIECES[pc[0]];
    if (!d) continue;
    const m = localOf(d), r = pc[4] & 3;
    const pl = { i, d, pc, r, ox: pc[1] * CELL, oy: pc[3] * HU, oz: pc[2] * CELL, t0: KD.length };
    for (let j = 0; j < m.p.length; j += 3) {
      const q = rotXZ(m.p[j], m.p[j + 2], r), x = q[0] + pl.ox, y = m.p[j + 1] + pl.oy, z = q[1] + pl.oz;
      P.push(x, y, z);
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    for (let j = 0; j < m.ci.length; j++) { CI.push(m.ci[j]); KD.push(m.kd[j]); }
    for (const g of m.gates) {
      gates.push({ kind: g.kind, piece: i, p: worldPt(pl, g.f.p), n: worldVec(pl, g.f.f), r: worldVec(pl, g.f.r), u: worldVec(pl, g.f.u), hw: 7.5 });
    }
    if (d.fn && !opt.nopillars && d.cat !== 'Loops' && d.cat !== 'Walls') {
      const ss = lenOf(d) > 30 ? [0.25, 0.75] : [0.5];
      for (const s of ss) {
        const f = frameAt(d, s), wp = worldPt(pl, f.p), top = wp[1] - THK - 0.05, h = top - GY;
        if (h > 1.2 && d.cat !== 'Banked') {
          const hw = d.prof === 'wide' ? 1.6 : 0.8, E = [1, 0, 0], U = [0, 1, 0], F = [0, 0, 1];
          const m2 = { p: [], ci: [], kd: [] };
          obox(m2, [wp[0], GY + h / 2, wp[2]], E, U, F, hw, h / 2, hw, 16, 255);
          for (let j = 0; j < m2.p.length; j++) P.push(m2.p[j]);
          for (let j = 0; j < m2.ci.length; j++) { CI.push(m2.ci[j]); KD.push(m2.kd[j]); }
        }
      }
    }
    pl.t1 = KD.length;
    for (const c of cellsOfPiece(pc)) { const k = ckey(c); if (occ.has(k) && occ.get(k) !== i) overlap++; occ.set(k, i); }
    placed.push(pl);
  }
  const starts = gates.filter(g => g.kind === 'start'), fins = gates.filter(g => g.kind === 'fin'), cps = gates.filter(g => g.kind === 'cp');
  const T = { tr, S, placed, gates, starts, fins, cps, overlap, occ, minY, bounds: [minX, maxX, minZ, maxZ], ntri: KD.length, P: Float32Array.from(P), CI: Uint8Array.from(CI), KD: Uint8Array.from(KD) };
  T.ok = starts.length >= 1 && fins.length >= 1 && !overlap;
  T.err = !starts.length ? 'Needs a start gate.' : !fins.length ? 'Needs a finish gate.' : overlap ? 'Pieces overlap.' : '';
  if (starts.length) {
    const g = starts[0];
    T.start = { p: add3(g.p, mul3(g.u, 1.1)), q: qBasis(g.r, g.u, mul3(g.n, -1)), n: g.n };
  }
  if (opt.physics !== false) {
    let cnt = 0; for (let i = 0; i < KD.length; i++) if (KD[i] !== 255) cnt++;
    const Pc = new Float32Array(cnt * 9), Kc = new Uint8Array(cnt);
    let k = 0;
    for (let i = 0; i < KD.length; i++) if (KD[i] !== 255) { for (let j = 0; j < 9; j++) Pc[k * 9 + j] = T.P[i * 9 + j]; Kc[k++] = KD[i]; }
    T.hash = Hash(Pc, Kc, 12);
    T.mu = [S.gmu, 1, 0.9, 1];
  }
  if (opt.route !== false && T.ok) { T.route = buildRoute(T); orderGates(T); }
  return T;
}
function pieceEnds(pl) {
  const d = pl.d, a = frameAt(d, 0), b = frameAt(d, 1);
  return { a: worldPt(pl, a.p), af: worldVec(pl, a.f), b: worldPt(pl, b.p), bf: worldVec(pl, b.f) };
}
function buildRoute(T) {
  const items = T.placed.filter(pl => pl.d.fn && !pl.d.custom && pl.d.cat !== 'Blocks');
  const ends = new Map(); items.forEach(pl => ends.set(pl, pieceEnds(pl)));
  const startPl = T.placed[T.starts[0].piece];
  if (!ends.has(startPl)) return null;
  const used = new Set([startPl]), chain = [startPl];
  let cur = startPl;
  for (let guard = 0; guard < 600; guard++) {
    const e = ends.get(cur);
    let best = null, bd = 1e9, gap = false;
    for (const pl of items) {
      if (used.has(pl)) continue;
      const q = ends.get(pl), dv = sub3(q.a, e.b), dist = len3(dv);
      if (dist < 4 && dot3(q.af, e.bf) > 0.9 && dist < bd) { bd = dist; best = pl; gap = false; }
    }
    if (!best) {
      for (const pl of items) {
        if (used.has(pl)) continue;
        const q = ends.get(pl), dv = sub3(q.a, e.b), dist = len3(dv);
        const hv = [e.bf[0], 0, e.bf[2]], hn = nrm3(hv), fwd = dot3(dv, hn);
        const lat = Math.abs(dv[0] * hn[2] - dv[2] * hn[0]);
        if (fwd > 3 && fwd < 220 && lat < 22 && dot3(q.af, e.bf) > 0.6 && dist < bd) { bd = dist; best = pl; gap = true; }
      }
    }
    if (!best) break;
    chain.push(best); used.add(best); best.gapBefore = gap; cur = best;
    if (best.d.gate === 'fin') break;
  }
  const pts = [];
  for (let ci = 0; ci < chain.length; ci++) {
    const pl = chain[ci], d = pl.d, n = Math.max(2, Math.ceil(lenOf(d) / 3));
    if (pl.gapBefore && pts.length) {
      const last = pts[pts.length - 1], fr = frameAt(d, 0), p1 = worldPt(pl, fr.p), steps = Math.max(2, Math.ceil(len3(sub3(p1, last.p)) / 6));
      for (let k = 1; k < steps; k++) { const t = k / steps; pts.push({ p: [lerp(last.p[0], p1[0], t), lerp(last.p[1], p1[1], t) + Math.sin(t * PI) * 8, lerp(last.p[2], p1[2], t)], f: last.f, r: last.r, u: [0, 1, 0], air: 1, pc: ci, loop: 0 }); }
    }
    for (let k = 0; k <= n; k++) {
      if (k === 0 && pts.length && !pl.gapBefore) continue;
      const fr = frameAt(d, k / n);
      pts.push({ p: worldPt(pl, fr.p), f: worldVec(pl, fr.f), r: worldVec(pl, fr.r), u: worldVec(pl, fr.u), air: 0, pc: ci, loop: d.cat === 'Loops' ? 1 : 0, kick: d.cat === 'Jumps' ? 1 : 0, wall: d.cat === 'Walls' ? 1 : 0 });
    }
  }
  let acc = 0;
  for (let i = 0; i < pts.length; i++) { if (i) acc += len3(sub3(pts[i].p, pts[i - 1].p)); pts[i].s = acc; }
  return { pts, chain, total: acc, ok: chain.some(pl => pl.d.gate === 'fin') };
}
function orderGates(T) {
  const R = T.route;
  if (!R) return;
  const info = [];
  T.gates.forEach(g => {
    const ci = R.chain.indexOf(T.placed[g.piece]);
    g.order = ci;
    if (ci >= 0) { const q = R.pts.findIndex(p => p.pc === ci && !p.air); g.s = q >= 0 ? R.pts[q].s : 0; }
    else g.s = -1;
  });
  T.cps.sort((a, b) => (a.order < 0 ? 1e9 : a.order) - (b.order < 0 ? 1e9 : b.order));
  T.cps.forEach((g, i) => { g.idx = i; });
}
const CARP = {
  m: 900, g: 14, Ip: 1500, Iy: 1700, Ir: 1000, k: 26000, kq: 52000, cd: 3300, Lr: 1.0, wr: 0.42,
  A0: 13, Vt: 64, aRev: 8, Vrev: 12, aBrake: 26, mu: 2.3, lat: 0.55, aBoost: 30, boostMax: 95
};
const WHL = [[-0.95, 0.05, -1.35, 1], [0.95, 0.05, -1.35, 1], [-0.95, 0.05, 1.3, 0], [0.95, 0.05, 1.3, 0]];
const BODYP = [[-0.85, -0.5, -1.9], [0.85, -0.5, -1.9], [-0.85, -0.5, 1.8], [0.85, -0.5, 1.8], [-0.8, 0.5, -0.9], [0.8, 0.5, -0.9], [-0.8, 0.5, 1.1], [0.8, 0.5, 1.1], [0, 0.85, 0.1], [0, -0.3, -2.2], [0, -0.3, 2.1]];
const steerMax = v => 0.62 / (1 + Math.pow(v / 16, 1.7));
function Car(T) {
  const P = CARP, c = { T, p: [0, 0, 0], q: [0, 0, 0, 1], v: [0, 0, 0], w: [0, 0, 0], str: 0, steps: 0, events: [], air: 0, boost: 0, impact: 0, grounded: 0, kd: 1, wh: [], off: 0, spin: 0, lastKd: 1 };
  for (let i = 0; i < 4; i++) c.wh.push({ g: 0, ext: P.Lr - 0.12, skid: 0, spin: 0, steer: 0, p: [0, 0, 0], n: [0, 1, 0], kd: 1, N: 0, smoke: 0 });
  c.reset = (p, q, v) => { c.p = p.slice(); c.q = q.slice(); c.v = v ? v.slice() : [0, 0, 0]; c.w = [0, 0, 0]; c.str = 0; c.air = 0; c.boost = 0; c.events.length = 0; c.off = 0; c.impact = 0; c.stall = 0; };
  c.step = (inp, dt) => {
    const q = c.q, R = qrot(q, [1, 0, 0]), U = qrot(q, [0, 1, 0]), B = qrot(q, [0, 0, 1]), F = [-B[0], -B[1], -B[2]];
    const v = c.v, w = c.w, hash = c.T ? c.T.hash : null, mu = c.T && c.T.mu ? c.T.mu : [0.55, 1, 0.9, 1];
    const old = BODYP.map(b => add3(c.p, add3(mul3(R, b[0]), add3(mul3(U, b[1]), mul3(B, b[2])))));
    const p0 = c.p.slice();
    const invI = t => { const a = dot3(t, R) / P.Ip, b = dot3(t, U) / P.Iy, d = dot3(t, B) / P.Ir; return [R[0] * a + U[0] * b + B[0] * d, R[1] * a + U[1] * b + B[1] * d, R[2] * a + U[2] * b + B[2] * d]; };
    const imp = (r, J) => { const iv = 1 / P.m; v[0] += J[0] * iv; v[1] += J[1] * iv; v[2] += J[2] * iv; const dw = invI(crs3(r, J)); w[0] += dw[0]; w[1] += dw[1]; w[2] += dw[2]; };
    const meff = (r, d) => { const ia = invI(crs3(r, d)); return 1 / (1 / P.m + dot3(crs3(ia, r), d)); };
    const vAt = r => add3(v, crs3(w, r));
    const up = inp.up || 0, dn = inp.dn || 0, st = clamp(inp.st || 0, -1, 1);
    const spd = len3(v), vF = dot3(v, F);
    const rate = (st !== 0 && (st > 0) === (c.str > 0 || c.str === 0)) ? 6 : 9;
    if (inp.analog) c.str = st; else c.str += clamp(st - c.str, -rate * dt, rate * dt);
    const delta = c.str * steerMax(spd);
    v[1] -= P.g * dt;
    let grounded = 0, boostHit = 0, nsum = [0, 0, 0], kdTop = 1, offroad = 0;
    for (let i = 0; i < 4; i++) {
      const L = WHL[i], wh = c.wh[i];
      const mount = add3(p0, add3(mul3(R, L[0]), add3(mul3(U, L[1]), mul3(B, L[2]))));
      const hit = castRay(hash, mount[0], mount[1], mount[2], -U[0] * P.Lr, -U[1] * P.Lr, -U[2] * P.Lr);
      wh.steer = L[3] ? delta : 0;
      wh.skid = 0; wh.smoke = 0;
      if (!hit) { wh.g = 0; wh.ext = Math.min(P.Lr, wh.ext + 3 * dt); wh.spin += (vF / P.wr) * dt * 0.5; continue; }
      const dist = hit.t * P.Lr, n = [hit.nx, hit.ny, hit.nz], kd = hit.kd;
      const cp = add3(mount, mul3(U, -dist)), r = sub3(cp, c.p);
      wh.g = 1; wh.ext = dist; wh.p = cp; wh.n = n; wh.kd = kd;
      grounded++; nsum = add3(nsum, n);
      if (kd === 3) boostHit = 1;
      if (kd === 0) offroad++;
      const x = P.Lr - dist;
      let Fn = P.k * x + P.kq * x * x * x;
      const vn = dot3(vAt(r), n);
      Fn += -P.cd * vn * (vn < 0 ? 1 : 0.55);
      if (Fn < 0) Fn = 0;
      if (Fn > 160000) Fn = 160000;
      wh.N = Fn;
      imp(r, mul3(n, Fn * dt));
      const sd = L[3] ? add3(mul3(F, Math.cos(delta)), mul3(R, Math.sin(delta))) : F;
      const ff = nrm3(sub3(sd, mul3(n, dot3(sd, n)))), lat = nrm3(crs3(ff, n));
      const rA = sub3(r, mul3(U, dot3(r, U)));
      const vc = vAt(rA), vl = dot3(vc, ff), vs = dot3(vc, lat);
      const surf = mu[kd] === undefined ? 1 : mu[kd];
      const ratio = Math.abs(vs) / (Math.abs(vl) + 4), sf = 1 - 0.22 * sstep(clamp((ratio - 0.12) / 0.45, 0, 1));
      const me = P.mu * surf * (1 + 0.55 * Math.min(1, (spd / 50) * (spd / 50))) * sf * (inp.grip || 1) * (!L[3] && inp.hb ? 0.4 : 1);
      const Fmax = me * Math.max(Fn, 0.25 * P.m * P.g / 4);
      const Jxm = Fmax * dt;
      const mL = meff(rA, ff);
      let Fx = 0;
      if (inp.hb && !L[3] && vF > 1.5) Fx = -Math.sign(vl) * P.aBrake * 0.55 * P.m / 4;
      else if (dn > 0 && vF > 1.5) Fx = -Math.sign(vl) * dn * P.aBrake * P.m / 4;
      else if (dn > 0 && !up) Fx = vF > -P.Vrev ? -dn * P.aRev * P.m / 4 : 0;
      else if (up > 0) Fx = vF < 0 ? up * P.A0 * P.m / 4 * 1.4 : vF < P.Vt ? up * P.A0 * (1 - (vF / P.Vt) * (vF / P.Vt)) * P.m / 4 : 0;
      else Fx = -Math.sign(vl) * (0.8 + 0.0006 * vF * vF + (kd === 0 ? 3.5 : 0)) * P.m / 4;
      let Jx = clamp(Fx * dt, -Jxm, Jxm);
      if ((dn > 0 && vF > 1.5) || (!up && !dn) || (inp.hb && !L[3])) { const lim = Math.abs(vl) * mL; if (Math.abs(Jx) > lim) Jx = Math.sign(Jx) * lim; }
      const Jm = Math.sqrt(Math.max(0, Jxm * Jxm - Jx * Jx));
      const Jd = -vs * meff(rA, lat) * P.lat;
      const J = clamp(Jd, -Jm, Jm);
      imp(rA, add3(mul3(ff, Jx), mul3(lat, J)));
      wh.spin += (vl / P.wr) * dt;
      const sl = Math.abs(Jd) > Jm * 0.92 ? Math.abs(vs) : 0;
      wh.skid = (sl > 3.2 ? clamp(sl / 7, 0, 1) : 0) || (dn > 0 && vF > 8 && Math.abs(Jx) >= Jxm * 0.95 ? 0.7 : 0);
      wh.smoke = wh.skid || (up > 0 && kd === 0 && spd > 6 ? 0.5 : 0);
      if (kd === 0) wh.smoke = Math.max(wh.smoke, spd > 8 ? 0.4 : 0);
    }
    c.grounded = grounded; c.off = grounded && offroad >= grounded ? c.off + dt : 0;
    if (grounded) { c.air = 0; c.lastN = nrm3(nsum); } else c.air += dt;
    if (boostHit) { c.boost = 0.3; }
    if (c.boost > 0) {
      c.boost -= dt;
      if (grounded && dot3(v, F) < P.boostMax) { v[0] += F[0] * P.aBoost * dt; v[1] += F[1] * P.aBoost * dt; v[2] += F[2] * P.aBoost * dt; }
    }
    if (!grounded) {
      const pitch = (-up + dn) * 6, yaw = -st * 5.5;
      w[0] += (R[0] * pitch + U[0] * yaw) * dt; w[1] += (R[1] * pitch + U[1] * yaw) * dt; w[2] += (R[2] * pitch + U[2] * yaw) * dt;
      if (!up && !dn && spd > 8 && c.air > 0.12) {
        const vd = nrm3(v), des = Math.asin(clamp(vd[1], -1, 1)), cur = Math.asin(clamp(F[1], -1, 1)), e = clamp((des - cur) * 4, -2, 2);
        w[0] += R[0] * e * dt; w[1] += R[1] * e * dt; w[2] += R[2] * e * dt;
      }
      const k = Math.exp(-0.7 * dt); w[0] *= k; w[1] *= k; w[2] *= k;
    } else {
      const wy = dot3(w, U), k = Math.min(1, 1.6 * dt);
      w[0] -= U[0] * wy * k; w[1] -= U[1] * wy * k; w[2] -= U[2] * wy * k;
      const k2 = Math.exp(-0.9 * dt); w[0] *= k2; w[1] *= k2; w[2] *= k2;
    }
    c.p[0] += v[0] * dt; c.p[1] += v[1] * dt; c.p[2] += v[2] * dt;
    const dq = qmul([w[0] * dt * 0.5, w[1] * dt * 0.5, w[2] * dt * 0.5, 0], c.q);
    c.q = qnrm([c.q[0] + dq[0], c.q[1] + dq[1], c.q[2] + dq[2], c.q[3] + dq[3]]);
    const R2 = qrot(c.q, [1, 0, 0]), U2 = qrot(c.q, [0, 1, 0]), B2 = qrot(c.q, [0, 0, 1]);
    let imax = 0;
    for (let i = 0; i < BODYP.length; i++) {
      const b = BODYP[i], np = add3(c.p, add3(mul3(R2, b[0]), add3(mul3(U2, b[1]), mul3(B2, b[2]))));
      const d = sub3(np, old[i]);
      if (np[1] < GY) {
        const r = sub3(np, c.p), vp = vAt(r);
        if (vp[1] < 0) { imp(r, [0, -vp[1] * meff(r, [0, 1, 0]), 0]); }
        c.p[1] += GY - np[1];
        imax = Math.max(imax, -vp[1]);
        continue;
      }
      if (d[0] * d[0] + d[1] * d[1] + d[2] * d[2] < 1e-10) continue;
      const hit = castRay(hash, old[i][0], old[i][1], old[i][2], d[0], d[1], d[2]);
      if (!hit) continue;
      const n = [hit.nx, hit.ny, hit.nz], hp = add3(old[i], mul3(d, hit.t)), pen = Math.min(0.6, dot3(sub3(hp, np), n));
      const r = sub3(np, c.p), vp = vAt(r), vn = dot3(vp, n);
      if (vn < 0) {
        const j = -(1 + (vn < -4 ? 0.12 : 0)) * vn * meff(r, n);
        imp(r, mul3(n, j));
        const vt = sub3(vp, mul3(n, vn)), vtl = len3(vt);
        if (vtl > 1e-3) { const td = mul3(vt, 1 / vtl), jt = Math.min(0.45 * j, vtl * meff(r, td)); imp(r, mul3(td, -jt)); }
        if (-vn > imax) imax = -vn;
      }
      if (pen > 0) { c.p[0] += n[0] * pen * 0.8; c.p[1] += n[1] * pen * 0.8; c.p[2] += n[2] * pen * 0.8; }
    }
    c.impact = imax;
    c.steps++;
    if (c.T && c.T.gates) {
      for (const g of c.T.gates) {
        const d0 = dot3(sub3(p0, g.p), g.n), d1 = dot3(sub3(c.p, g.p), g.n);
        if (d0 < 0 && d1 >= 0) {
          const f = d0 / (d0 - d1), pt = [p0[0] + (c.p[0] - p0[0]) * f, p0[1] + (c.p[1] - p0[1]) * f, p0[2] + (c.p[2] - p0[2]) * f], rel = sub3(pt, g.p);
          if (Math.abs(dot3(rel, g.r)) <= g.hw && dot3(rel, g.u) > -4 && dot3(rel, g.u) < 14) c.events.push({ g, f });
        }
      }
    }
  };
  return c;
}
function prepRoute(R, skill) {
  const pts = R.pts, n = pts.length, lim = new Float32Array(n), aLat = 23 * (skill || 1);
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 2)], b = pts[Math.min(n - 1, i + 2)], ds = Math.max(1, b.s - a.s);
    const k = Math.abs(dot3(sub3(b.f, a.f), pts[i].r)) / ds;
    let l = k > 1e-4 ? Math.sqrt(aLat / k) : 80;
    const kc = -(b.f[1] - a.f[1]) / ds;
    if (kc > 1e-4) l = Math.min(l, Math.sqrt(11 / kc));
    if (pts[i].air || pts[i].kick) l = 80;
    if (pts[i].loop) l = Math.max(l, 34);
    lim[i] = clamp(l, 13, 80);
  }
  for (let i = n - 2; i >= 0; i--) { const ds = pts[i + 1].s - pts[i].s; lim[i] = Math.min(lim[i], Math.sqrt(lim[i + 1] * lim[i + 1] + 2 * 17 * ds)); }
  R.lim = lim; R.skill = skill || 1;
}
function Bot(T, car, skill) {
  const R = T.route, b = { idx: 0, stuck: 0, noProg: 0, done: false, lastS: 0, resets: 0 }, sk = skill || 1;
  R.limc = R.limc || {};
  if (!R.limc[sk]) { prepRoute(R, sk); R.limc[sk] = R.lim; }
  const lim = R.limc[sk];
  const pts = R.pts;
  b.input = (dt) => {
    const c = car;
    let bi = b.idx, bd = 1e12;
    for (let i = Math.max(0, b.idx - 3); i < Math.min(pts.length, b.idx + 30); i++) { const d = sub3(pts[i].p, c.p), l = d[0] * d[0] + d[1] * d[1] + d[2] * d[2]; if (l < bd) { bd = l; bi = i; } }
    b.idx = bi;
    b.dist = Math.sqrt(bd);
    const spd = len3(c.v);
    if (pts[bi].s > b.lastS + 0.5) { b.lastS = pts[bi].s; b.noProg = 0; } else b.noProg += dt;
    b.progress = pts[bi].s / R.total;
    if (b.noProg > 4 || b.dist > 60 || c.p[1] < T.minY - 40) b.stuck = 1;
    const Ld = pts[bi].loop || pts[Math.min(pts.length - 1, bi + 4)].loop ? 6 : 7 + 0.42 * spd;
    let ti = bi; while (ti < pts.length - 1 && pts[ti].s - pts[bi].s < Ld) ti++;
    const tp = pts[ti].p, tv = sub3(tp, c.p);
    const U = qrot(c.q, [0, 1, 0]), Fv = qrot(c.q, [0, 0, -1]), Rv = qrot(c.q, [1, 0, 0]);
    const lat = dot3(tv, Rv), fwd = dot3(tv, Fv), ang = Math.atan2(lat, Math.max(0.1, fwd));
    let st = 0, up = 1, dn = 0;
    if (c.grounded) {
      const dReq = 2.7 * 2 * Math.sin(ang) / Math.max(4, Math.hypot(lat, fwd));
      st = clamp(dReq / Math.max(0.02, steerMax(spd)) * 1.1, -1, 1);
      const lt = lim[Math.min(pts.length - 1, bi + 3)];
      up = clamp((lt - spd) / 3, 0, 1); dn = spd > lt + 2 ? clamp((spd - lt) / 5, 0, 1) : 0;
      if (spd < 2 && lt > 5) { up = 1; dn = 0; }
    }
    else { up = 0; dn = 0; }
    return { up, dn, st, analog: true };
  };
  return b;
}
const GH = 30;
function packGhost(arr, ms) {
  const n = arr.length / 8;
  if (!n) return null;
  const out = new Int16Array(n * 8), o0 = [arr[0], arr[1], arr[2]];
  let qx = Math.round(o0[0] * 100), qy = Math.round(o0[1] * 100), qz = Math.round(o0[2] * 100);
  for (let i = 0; i < n; i++) {
    const nx = Math.round(arr[i * 8] * 100), ny = Math.round(arr[i * 8 + 1] * 100), nz = Math.round(arr[i * 8 + 2] * 100);
    out[i * 8] = clamp(nx - qx, -32000, 32000); out[i * 8 + 1] = clamp(ny - qy, -32000, 32000); out[i * 8 + 2] = clamp(nz - qz, -32000, 32000);
    qx += out[i * 8]; qy += out[i * 8 + 1]; qz += out[i * 8 + 2];
    for (let k = 0; k < 4; k++) out[i * 8 + 3 + k] = Math.round(clamp(arr[i * 8 + 3 + k], -1, 1) * 32767);
    out[i * 8 + 7] = Math.round(clamp(arr[i * 8 + 7], -1, 1) * 32767);
  }
  return { t: ms, n, o: [Math.round(o0[0] * 100), Math.round(o0[1] * 100), Math.round(o0[2] * 100)], d: b64e(new Uint8Array(out.buffer)) };
}
function unpackGhost(g) {
  if (!g || !g.d) return null;
  try {
    const raw = b64d(g.d), i16 = new Int16Array(raw.buffer, raw.byteOffset, raw.length >> 1), n = g.n, out = new Float32Array(n * 8);
    let x = g.o[0], y = g.o[1], z = g.o[2];
    for (let i = 0; i < n; i++) {
      x += i16[i * 8]; y += i16[i * 8 + 1]; z += i16[i * 8 + 2];
      out[i * 8] = x / 100; out[i * 8 + 1] = y / 100; out[i * 8 + 2] = z / 100;
      for (let k = 0; k < 4; k++) out[i * 8 + 3 + k] = i16[i * 8 + 3 + k] / 32767;
      out[i * 8 + 7] = i16[i * 8 + 7] / 32767;
    }
    return { t: g.t, n, a: out };
  } catch (e) { return null; }
}
function ghostAt(G, ms, out) {
  const f = Math.max(0, ms) / 1000 * GH, i = Math.min(G.n - 1, Math.floor(f)), j = Math.min(G.n - 1, i + 1), t = Math.min(1, f - i), a = G.a;
  const o = out || { p: [0, 0, 0], q: [0, 0, 0, 1], s: 0, done: false };
  for (let k = 0; k < 3; k++) o.p[k] = lerp(a[i * 8 + k], a[j * 8 + k], t);
  o.q = qSlerp([a[i * 8 + 3], a[i * 8 + 4], a[i * 8 + 5], a[i * 8 + 6]], [a[j * 8 + 3], a[j * 8 + 4], a[j * 8 + 5], a[j * 8 + 6]], t);
  o.s = lerp(a[i * 8 + 7], a[j * 8 + 7], t); o.done = f >= G.n - 1;
  return o;
}
const OFFICIAL = [{"id":"s1","name":"Sunny Start","label":"Summer 1","season":0,"str":"sa st*3 cr3 st*2 cl3 st*3 ck st*2 cl2 st*2 cr2 st*3 bo st*2 cr3 st*2 cl1 cr1 st*3 fi","med":[44500,34600,28800],"bot":26140,"len":881,"pcs":33},
{"id":"s2","name":"Rolling Hills","label":"Summer 2","season":0,"str":"sa st*2 su1 st sd1 st*2 sr st*2 sl st*2 ck su1 su1 st sd1 sd1 st*2 cr2 st*2 bo st*2 cl2 sul st sdl st*2 fi","med":[53300,41400,34500],"bot":31310,"len":890,"pcs":35},
{"id":"s3","name":"Kicker Lane","label":"Summer 3","season":0,"str":"sa st*3 rp G2 st*2 cr2 st*2 ck bl2 st br2 st*2 rp2 G3 st*2 cl3 st bo st*2 rp G2 st*3 fi","med":[42000,32600,27200],"bot":24650,"len":891,"pcs":29},
{"id":"s4","name":"Loop Valley","label":"Summer 4","season":0,"str":"sa st*3 bo lpr st*2 cl3 st*2 ck wl*3 st*2 cr3 st*2 lpl st*2 wcr st*2 bo st*2 fi","med":[44100,34300,28600],"bot":25920,"len":942,"pcs":30},
{"id":"w1","name":"Frosty Run","label":"Winter 1","season":1,"str":"sa st*3 bo st*2 cr2 st cr2 st*3 ck cl1 cl1 st*3 bo st*3 cr3 st*2 cl3 st*2 ck bl2 st*2 br2 st*3 fi","med":[50500,39200,32700],"bot":29650,"len":978,"pcs":38},
{"id":"w2","name":"Snow Peaks","label":"Winter 2","season":1,"str":"sa st*2 sul st*2 sul st sdl st*2 cr2 su2 st sd2 st*2 ck cl2 su1 st*2 sd1 bo st*2 sdl st*3 fi","med":[47300,36700,30600],"bot":27780,"len":801,"pcs":31},
{"id":"w3","name":"Ice Spiral","label":"Winter 3","season":1,"str":"sa st*3 br3 st bl3 st*2 ck lpr st*2 bo st cl3 st lpl st*2 ck br2 st*2 bl2 st*2 sl st sr st*2 ck cr2 bl3 st*2 bo st*3 fi","med":[69900,54300,45300],"bot":41100,"len":1413,"pcs":42},
{"id":"w4","name":"Blizzard Gauntlet","label":"Winter 4","season":1,"str":"sa st*2 bo rp G2 st*3 cr2 sl st*2 sr ck st cl3 wl*2 st wcr st*2 ck bo lpl st*3 cr3 su1 su1 st*2 sd2 st*2 fi","med":[64400,50000,41700],"bot":37850,"len":1183,"pcs":37},
{"id":"d1","name":"Dune Sprint","label":"Desert 1","season":2,"str":"sa st*3 bo st*3 cl3 st*3 bo st*2 ck cr3 st*3 bo st*2 sl st sr st*3 ck cl2 st*2 bo st*3 cr3 sl st*2 sr st ck cl3 st*3 bo st*4 fi","med":[66900,52000,43300],"bot":39320,"len":1520,"pcs":54},
{"id":"d2","name":"Canyon Run","label":"Desert 2","season":2,"str":"sa st*3 bo rp2 G3 st*2 cr3 wr*3 ck st*2 wcl st*2 rp G2 st*3 ck cr2 bl3 st*2 wl*3 bo st*3 fi","med":[43500,33800,28200],"bot":25580,"len":1030,"pcs":35},
{"id":"d3","name":"Mirage Loops","label":"Desert 3","season":2,"str":"sa st*3 bo lpl st*2 cr3 st*2 ck lpr st*2 lpl st*2 bo rp2 G3 st*2 ck cl3 st*2 lpr st*3 fi","med":[54300,42200,35100],"bot":31900,"len":1153,"pcs":31},
{"id":"d4","name":"Sandstorm Grand Prix","label":"Desert 4","season":2,"str":"sa st*3 bo st*2 cr3 st*2 bl3 st*2 ck lpr st*2 wcl st bo rp G2 st*4 cl2 sl st*2 sr ck su2 st sd2 st*3 cr1 cr1 st*2 lpl st cl3 wr*2 st*2 ck bo rp2 G3 st*3 fi","med":[85300,66200,55200],"bot":50140,"len":1779,"pcs":55}];
OFFICIAL.forEach((t, i) => { t.idx = i; t.diff = Math.min(5, 1 + (i * 5 / OFFICIAL.length | 0)); t.tr = { name: t.name, season: t.season, pieces: walk(t.str) }; });
function makeView(THREE, renderer, canvas, w, h, narrow) {
  const bin = [], own = x => (bin.push(x), x);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(70, w / h, 0.25, 3200);
  scene.add(cam);
  const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.62);
  const sun = new THREE.DirectionalLight(0xffffff, 0.78);
  const SH = 70, SM = COARSE ? 1024 : 2048;
  sun.castShadow = true;
  sun.shadow.mapSize.set(SM, SM);
  Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 10, far: 400 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.12;
  scene.add(hemi, sun, sun.target);
  const SUNDIR = new THREE.Vector3(-0.42, 0.78, 0.34).normalize();
  const lamb = (o) => own(new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true, side: THREE.DoubleSide }, o || {})));
  const MAT = { track: lamb(), scen: lamb(), car: lamb({ side: THREE.FrontSide }), ghost: lamb({ side: THREE.FrontSide, transparent: true, opacity: 0.5, depthWrite: false }), prev: lamb({ transparent: true, opacity: 0.62, depthWrite: false }) };
  const bagGeo = (P, C) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('color', new THREE.BufferAttribute(C, 3));
    g.computeVertexNormals();
    return g;
  };
  function Bag() {
    const P = [], C = [], m4 = new THREE.Matrix4(), v = new THREE.Vector3();
    return {
      add(geo, mat, col) {
        const g = geo.index ? geo.toNonIndexed() : geo, p = g.attributes.position;
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mat); P.push(v.x, v.y, v.z); C.push(col[0], col[1], col[2]); }
      },
      box(c, s, col, ry) { m4.compose(new THREE.Vector3(c[0], c[1], c[2]), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry || 0), new THREE.Vector3(s[0], s[1], s[2])); this.add(UG.box, m4.clone(), col); },
      cone(c, r, hh, col, seg, ry) { m4.compose(new THREE.Vector3(c[0], c[1], c[2]), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry || 0), new THREE.Vector3(r, hh, r)); this.add(seg > 5 ? UG.cone7 : UG.cone5, m4.clone(), col); },
      cyl(c, r, hh, col, ry) { m4.compose(new THREE.Vector3(c[0], c[1], c[2]), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry || 0), new THREE.Vector3(r, hh, r)); this.add(UG.cyl6, m4.clone(), col); },
      ico(c, s, col, ry) { m4.compose(new THREE.Vector3(c[0], c[1], c[2]), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry || 0), new THREE.Vector3(s[0], s[1], s[2])); this.add(UG.ico, m4.clone(), col); },
      geo() { return bagGeo(Float32Array.from(P), Float32Array.from(C)); }
    };
  }
  const UG = { box: own(new THREE.BoxGeometry(1, 1, 1)), cone5: own(new THREE.ConeGeometry(1, 1, 5)), cone7: own(new THREE.ConeGeometry(1, 1, 7)), cyl6: own(new THREE.CylinderGeometry(1, 1, 1, 6)), ico: own(new THREE.IcosahedronGeometry(1, 0)) };
  const skyG = own(new THREE.SphereGeometry(2400, 16, 10)), skyM = own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  skyG.setAttribute('color', new THREE.BufferAttribute(new Float32Array(skyG.attributes.position.count * 3), 3));
  const sky = new THREE.Mesh(skyG, skyM); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  function setSky(S) {
    const p = skyG.attributes.position, c = skyG.attributes.color, top = hex2lin(S.sky[0]), mid = hex2lin(S.sky[1]), hor = hex2lin(S.sky[2]);
    for (let i = 0; i < p.count; i++) {
      const t = clamp(p.getY(i) / 2400, 0, 1), k = t < 0.25 ? t / 0.25 : (t - 0.25) / 0.75, A = t < 0.25 ? hor : mid, B = t < 0.25 ? mid : top;
      c.setXYZ(i, lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k));
    }
    c.needsUpdate = true;
  }
  let trackMesh = null, scenery = null, groundMesh = null, cloudMesh = null, hillMesh = null, curS = null;
  const groundM = own(new THREE.MeshLambertMaterial({ color: 0x5aa05a }));
  const groundG = own(new THREE.PlaneGeometry(9000, 9000)); groundG.rotateX(-PI / 2);
  groundMesh = new THREE.Mesh(groundG, groundM); groundMesh.position.y = GY - 0.02; groundMesh.receiveShadow = true; scene.add(groundMesh);
  function setSeason(S) {
    if (curS === S) return; curS = S;
    setSky(S);
    scene.fog = new THREE.Fog(new THREE.Color(S.fog).convertSRGBToLinear(), 260, 1700);
    scene.background = scene.fog.color.clone();
    groundM.color.set(S.ground).convertSRGBToLinear();
    hemi.color.set(S.sky[1]).convertSRGBToLinear(); hemi.groundColor.set(S.ground2).convertSRGBToLinear();
    sun.color.set(S.sun).convertSRGBToLinear();
  }
  function buildScenery(T, S) {
    if (scenery) { scene.remove(scenery); scenery.geometry.dispose(); scenery = null; }
    if (hillMesh) { scene.remove(hillMesh); hillMesh.geometry.dispose(); hillMesh = null; }
    if (cloudMesh) { scene.remove(cloudMesh); cloudMesh.geometry.dispose(); cloudMesh = null; }
    const rng = mkRng(T.tr.pieces.length * 7919 + (T.tr.season || 0) * 31 + (T.tr.pieces[3] ? T.tr.pieces[3][1] * 17 : 5));
    const B = new Bag(), H = new Bag(), K = new Bag();
    const [x0, x1, z0, z1] = T.bounds, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rad = Math.max(x1 - x0, z1 - z0) / 2 + 60;
    const cols = new Set();
    T.occ.forEach((v, k) => { const s = k.split(','); cols.add(s[0] + ',' + s[2]); });
    const near = (x, z, m) => { const ix = Math.floor((x + HALF) / CELL), iz = Math.floor((z + HALF) / CELL); for (let a = -m; a <= m; a++) for (let b = -m; b <= m; b++) if (cols.has((ix + a) + ',' + (iz + b))) return true; return false; };
    const lp = S.hill.map(hex2lin), season = S.name;
    const treeA = season === 'Winter' ? hex2lin('#2f6a6e') : hex2lin('#3f8c46'), treeB = season === 'Winter' ? hex2lin('#f2f7ff') : hex2lin('#58a853'), trunk = hex2lin('#6a4a32');
    const N = clamp(Math.round(rad * 0.9), 120, 520);
    for (let i = 0; i < N; i++) {
      const a = rng() * TAU, r = 30 + Math.pow(rng(), 0.7) * (rad + 380), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (near(x, z, 1)) continue;
      const s = 0.75 + rng() * 1.1, ry = rng() * 6;
      if (season === 'Desert') {
        const q = rng();
        if (q < 0.45) { const c = hex2lin('#4f8a4a'); B.cyl([x, GY + 3.2 * s, z], 0.8 * s, 3.2 * s, c); B.cyl([x + 1.6 * s, GY + 3.4 * s, z], 0.5 * s, 1.1 * s, c); B.box([x + 0.8 * s, GY + 2.5 * s, z], [1.6 * s, 0.7 * s, 0.7 * s], c); }
        else { const c = lp[(rng() * 3) | 0]; B.ico([x, GY + 0.6 * s, z], [2.4 * s, 1.6 * s, 2.0 * s], c, ry); }
      } else if (season === 'Winter') {
        B.cyl([x, GY + 0.8 * s, z], 0.35 * s, 0.9 * s, trunk);
        B.cone([x, GY + 4.2 * s, z], 2.5 * s, 6 * s, treeA, 7);
        B.cone([x, GY + 7 * s, z], 1.7 * s, 4.4 * s, treeB, 7);
      } else {
        B.cyl([x, GY + 0.9 * s, z], 0.4 * s, 1 * s, trunk);
        B.cone([x, GY + 3.6 * s, z], 2.3 * s, 4.4 * s, rng() < 0.5 ? treeA : treeB, 5, ry);
        B.cone([x, GY + 6 * s, z], 1.6 * s, 3.4 * s, treeB, 5, ry);
      }
    }
    const rk = season === 'Desert' ? hex2lin('#a88458') : hex2lin('#8a93a2');
    for (let i = 0; i < 70; i++) { const a = rng() * TAU, r = 25 + rng() * (rad + 300), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (near(x, z, 1)) continue; const s = 0.7 + rng() * 2.4; B.ico([x, GY + 0.5 * s, z], [1.6 * s, 1.0 * s, 1.3 * s], rk, rng() * 6); }
    scenery = new THREE.Mesh(B.geo(), MAT.scen); scenery.castShadow = true; scenery.receiveShadow = true; scene.add(scenery);
    const NH = 26;
    for (let i = 0; i < NH; i++) {
      const a = (i / NH) * TAU + rng() * 0.2, r = rad + 520 + rng() * 700, hh = 90 + rng() * 210, rr = hh * (1.3 + rng() * 0.9), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      const c = lp[(rng() * 3) | 0];
      H.cone([x, GY + hh * 0.5 - 4, z], rr, hh, c, 7, rng() * 6);
      if (season === 'Winter') H.cone([x, GY + hh * 0.5 - 4 + hh * 0.34, z], rr * 0.34, hh * 0.34, hex2lin('#ffffff'), 7, 0);
    }
    for (let i = 0; i < 18; i++) { const a = rng() * TAU, r = rad + 100 + rng() * 520, hh = 20 + rng() * 40, rr = hh * (2 + rng() * 2), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; H.ico([x, GY + hh * 0.18, z], [rr, hh, rr * 0.8], lp[(rng() * 3) | 0], rng() * 6); }
    hillMesh = new THREE.Mesh(H.geo(), MAT.scen); hillMesh.receiveShadow = false; scene.add(hillMesh);
    const cc = hex2lin(S.cloud);
    for (let i = 0; i < 16; i++) {
      const a = rng() * TAU, r = rng() * (rad + 900), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, y = 140 + rng() * 120, n = 4 + ((rng() * 3) | 0);
      for (let k = 0; k < n; k++) { const s = 14 + rng() * 14; K.ico([x + (k - n / 2) * 18 + rng() * 6, y + rng() * 8, z + rng() * 14], [s * 1.5, s * 0.7, s], cc, rng() * 6); }
    }
    cloudMesh = new THREE.Mesh(K.geo(), own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true })));
    scene.add(cloudMesh);
  }
  let scS = null;
  function setTrack(T, lite) {
    const S = T.S;
    setSeason(S);
    if (trackMesh) { scene.remove(trackMesh); trackMesh.geometry.dispose(); trackMesh = null; }
    const n = T.CI.length, C = new Float32Array(n * 9);
    for (let i = 0; i < n; i++) { const c = S.lp[T.CI[i]] || S.lp[0], sh = 1 + ((i * 2654435761 >>> 0) % 100) / 2200 - 0.02; for (let k = 0; k < 3; k++) { C[i * 9 + k * 3] = c[0] * sh; C[i * 9 + k * 3 + 1] = c[1] * sh; C[i * 9 + k * 3 + 2] = c[2] * sh; } }
    trackMesh = new THREE.Mesh(bagGeo(T.P, C), MAT.track); trackMesh.castShadow = true; trackMesh.receiveShadow = true; trackMesh.frustumCulled = false;
    scene.add(trackMesh);
    if ((!lite || !scenery || scS !== S) && T.placed.length) { buildScenery(T, S); scS = S; }
    if (scenery) scenery.visible = !lite;
  }
  const wheelG = (() => {
    const B = new Bag(), tire = hex2lin('#16161d'), rim = hex2lin('#dcdce6');
    const R = 0.46, Wd = 0.4, m = new THREE.Matrix4();
    const tg = new THREE.CylinderGeometry(R, R, Wd, 12); tg.rotateZ(PI / 2);
    B.add(tg, m, tire);
    const rg = new THREE.CylinderGeometry(R * 0.62, R * 0.62, Wd + 0.04, 6); rg.rotateZ(PI / 2);
    B.add(rg, m, rim);
    const hg = new THREE.BoxGeometry(Wd + 0.08, R * 0.2, R * 1.1); B.add(hg, m, hex2lin('#f2c230'));
    return own(B.geo());
  })();
  const bodyCache = {};
  function bodyGeo(c1, c2) {
    const key = c1 + c2;
    if (bodyCache[key]) return bodyCache[key];
    const B = new Bag(), a = hex2lin(c1), b = hex2lin(c2), dk = hex2lin('#1b1c26'), wh = hex2lin('#f4f4f8'), red = hex2lin('#d83030'), gl = hex2lin('#222a3a'), yl = hex2lin('#ffe9a0');
    B.box([0, -0.1, 0.1], [1.45, 0.42, 3.2], a);
    B.box([0, 0.12, -1.55], [0.95, 0.34, 1.3], a);
    B.box([0, -0.02, -2.2], [0.7, 0.24, 0.7], a);
    B.box([0, 0.38, 0.45], [1.0, 0.5, 1.5], a);
    B.box([0, 0.5, -0.35], [0.8, 0.28, 0.5], gl);
    B.box([0, 0.34, 1.1], [0.62, 0.62, 0.7], b);
    B.box([0, 0.63, -0.05], [0.12, 0.05, 2.2], wh);
    B.box([0.34, 0.24, -1.55], [0.1, 0.05, 1.3], wh);
    B.box([-0.34, 0.24, -1.55], [0.1, 0.05, 1.3], wh);
    B.box([0, -0.34, -2.55], [2.1, 0.08, 0.5], b);
    B.box([1.0, -0.2, -2.55], [0.1, 0.34, 0.54], red);
    B.box([-1.0, -0.2, -2.55], [0.1, 0.34, 0.54], red);
    B.box([0, 0.86, 1.62], [1.9, 0.08, 0.6], b);
    B.box([0.92, 0.66, 1.62], [0.08, 0.5, 0.64], red);
    B.box([-0.92, 0.66, 1.62], [0.08, 0.5, 0.64], red);
    B.box([0.4, 0.5, 1.45], [0.08, 0.5, 0.1], dk);
    B.box([-0.4, 0.5, 1.45], [0.08, 0.5, 0.1], dk);
    B.box([0.9, -0.28, -1.3], [0.3, 0.16, 0.2], dk);
    B.box([-0.9, -0.28, -1.3], [0.3, 0.16, 0.2], dk);
    B.box([0.9, -0.28, 1.3], [0.3, 0.16, 0.2], dk);
    B.box([-0.9, -0.28, 1.3], [0.3, 0.16, 0.2], dk);
    B.box([0, -0.42, 0.1], [1.2, 0.1, 3.2], dk);
    B.box([0.3, 0.06, -1.99], [0.16, 0.1, 0.06], yl);
    B.box([-0.3, 0.06, -1.99], [0.16, 0.1, 0.06], yl);
    B.box([0.35, 0.02, 1.7], [0.18, 0.1, 0.1], dk);
    return (bodyCache[key] = own(B.geo()));
  }
  function mkTag(txt, col) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const x = c.getContext('2d'); x.font = 'italic 700 34px "Trebuchet MS",Arial,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 7; x.strokeStyle = 'rgba(10,16,40,.85)'; x.strokeText(txt, 128, 34); x.fillStyle = col || '#fff'; x.fillText(txt, 128, 34);
    const t = own(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding;
    const s = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })));
    s.scale.set(4.6, 1.15, 1); s.renderOrder = 20;
    return s;
  }
  const _q = new THREE.Quaternion(), _p = new THREE.Vector3();
  function mkCar(c1, c2, ghost, label, tagCol) {
    const g = new THREE.Group(), body = new THREE.Mesh(bodyGeo(c1, c2), ghost ? MAT.ghost : MAT.car);
    body.castShadow = !ghost; g.add(body);
    const wh = [];
    for (let i = 0; i < 4; i++) {
      const sw = new THREE.Group(), m = new THREE.Mesh(wheelG, ghost ? MAT.ghost : MAT.car); m.castShadow = !ghost;
      sw.add(m); sw.position.set(WHL[i][0], -0.4, WHL[i][2]); if (WHL[i][0] < 0) m.scale.x = -1;
      g.add(sw); wh.push({ sw, m, spin: 0 });
    }
    const tag = label ? mkTag(label, tagCol) : null;
    if (tag) { tag.position.set(0, 2.3, 0); g.add(tag); }
    g.frustumCulled = false;
    scene.add(g);
    return { g, body, wh, tag, set(p, q, steer, spin, ext, sk) {
      g.position.set(p[0], p[1], p[2]); g.quaternion.set(q[0], q[1], q[2], q[3]);
      for (let i = 0; i < 4; i++) {
        const w = wh[i]; w.sw.position.y = 0.05 - (ext ? ext[i] : 0.88) + 0.44;
        w.sw.rotation.y = WHL[i][3] ? -steer * (i === 0 ? 1 : 1) : 0;
        w.m.rotation.x = spin ? spin[i] : w.m.rotation.x + 0.1;
      }
    }, dispose() { scene.remove(g); } };
  }
  const SPR = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return own(new THREE.CanvasTexture(c)); })();
  function Particles(n) {
    const g = own(new THREE.BufferGeometry()), pos = new Float32Array(n * 3), col = new Float32Array(n * 4), siz = new Float32Array(n);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aC', new THREE.BufferAttribute(col, 4)); g.setAttribute('aS', new THREE.BufferAttribute(siz, 1));
    const m = own(new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 400 }, uMap: { value: SPR } }, transparent: true, depthWrite: false,
      vertexShader: 'attribute vec4 aC; attribute float aS; uniform float uScale; varying vec4 vC; void main(){ vC=aC; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=aS*uScale/max(0.5,-mv.z); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform sampler2D uMap; varying vec4 vC; void main(){ vec4 t=texture2D(uMap,gl_PointCoord); gl_FragColor=vec4(vC.rgb,vC.a*t.a); if(gl_FragColor.a<0.01) discard; }'
    }));
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
    const vel = new Float32Array(n * 3), life = new Float32Array(n), ml = new Float32Array(n), s0 = new Float32Array(n), s1 = new Float32Array(n), c0 = new Float32Array(n * 4);
    let k = 0;
    return {
      pts, m,
      spawn(p, v, l, a, b, col4) { const i = k; k = (k + 1) % n; pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2]; vel[i * 3] = v[0]; vel[i * 3 + 1] = v[1]; vel[i * 3 + 2] = v[2]; life[i] = ml[i] = l; s0[i] = a; s1[i] = b; for (let j = 0; j < 4; j++) c0[i * 4 + j] = col4[j]; },
      update(dt, grav) {
        for (let i = 0; i < n; i++) {
          if (life[i] <= 0) { col[i * 4 + 3] = 0; siz[i] = 0; continue; }
          life[i] -= dt; const t = 1 - life[i] / ml[i];
          pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
          vel[i * 3 + 1] -= grav * dt; const dr = Math.exp(-1.6 * dt); vel[i * 3] *= dr; vel[i * 3 + 2] *= dr;
          siz[i] = lerp(s0[i], s1[i], t);
          col[i * 4] = c0[i * 4]; col[i * 4 + 1] = c0[i * 4 + 1]; col[i * 4 + 2] = c0[i * 4 + 2]; col[i * 4 + 3] = c0[i * 4 + 3] * (1 - t) * Math.min(1, t * 8);
        }
        g.attributes.position.needsUpdate = true; g.attributes.aC.needsUpdate = true; g.attributes.aS.needsUpdate = true;
      },
      clear() { life.fill(0); }
    };
  }
  const smoke = Particles(260), sparks = Particles(180);
  sparks.m.blending = THREE.AdditiveBlending;
  const SK = 900, skP = new Float32Array(SK * 18), skG = own(new THREE.BufferGeometry());
  skG.setAttribute('position', new THREE.BufferAttribute(skP, 3)); skG.setDrawRange(0, SK * 6);
  const skM = own(new THREE.MeshBasicMaterial({ color: 0x0b0b10, transparent: true, opacity: 0.78, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: THREE.DoubleSide, fog: true }));
  const skMesh = new THREE.Mesh(skG, skM); skMesh.frustumCulled = false; skMesh.renderOrder = 2; scene.add(skMesh);
  let skI = 0, skDirty = false;
  const skLast = [null, null, null, null];
  function skid(i, p, n, r, on) {
    if (!on) { skLast[i] = null; return; }
    const q = [p[0] + n[0] * 0.035, p[1] + n[1] * 0.035, p[2] + n[2] * 0.035], l = skLast[i], rr = [r[0] * 0.2, r[1] * 0.2, r[2] * 0.2];
    const a = [q[0] - rr[0], q[1] - rr[1], q[2] - rr[2]], b = [q[0] + rr[0], q[1] + rr[1], q[2] + rr[2]];
    if (l) {
      const dd = Math.abs(l.p[0] - q[0]) + Math.abs(l.p[1] - q[1]) + Math.abs(l.p[2] - q[2]);
      if (dd < 0.25) return;
      if (dd < 4) {
        const o = skI * 18, v = [l.a, l.b, b, l.a, b, a];
        for (let j = 0; j < 6; j++) { skP[o + j * 3] = v[j][0]; skP[o + j * 3 + 1] = v[j][1]; skP[o + j * 3 + 2] = v[j][2]; }
        skI = (skI + 1) % SK; skDirty = true;
      }
    }
    skLast[i] = { p: q, a, b };
  }
  function clearSkids() { skP.fill(0); skI = 0; skG.attributes.position.needsUpdate = true; skLast.fill(null); smoke.clear(); sparks.clear(); }
  const C = { p: [0, 5, 10], f: [0, 0, -1], u: [0, 1, 0], pos: [0, 5, 10], init: false, mode: 0, shake: 0, fov: 70 };
  const CAMS = [{ d: 7.4, h: 2.7, la: 6, fov: 68 }, { d: 11.5, h: 4.6, la: 8, fov: 66 }, { d: 0.2, h: 0.65, la: 30, fov: 82, fwd: 0.9 }];
  function camFollow(p, q, v, dt, grounded, snap, mode) {
    const Fc = qrot(q, [0, 0, -1]), Uc = qrot(q, [0, 1, 0]), spd = len3(v), M = CAMS[mode == null ? C.mode : mode];
    let tf = Fc;
    if (spd > 7) { const vd = nrm3(v), k = grounded ? 0.28 : 0.5; tf = nrm3(add3(mul3(Fc, 1 - k), mul3(vd, k))); }
    if (!C.init || snap) { C.f = tf.slice(); C.u = Uc.slice(); C.init = true; }
    const rf = 1 - Math.exp(-(grounded ? 7 : 3.2) * dt), ru = 1 - Math.exp(-3.4 * dt);
    C.f = nrm3(add3(mul3(C.f, 1 - rf), mul3(tf, rf)));
    C.u = nrm3(add3(mul3(C.u, 1 - ru), mul3(Uc, ru)));
    const side = nrm3(crs3(C.f, C.u)), up = crs3(side, C.f);
    let des;
    if (M.fwd) des = add3(add3(p, mul3(Fc, -M.fwd)), mul3(Uc, M.h));
    else des = add3(add3(p, mul3(C.f, -M.d)), mul3(up, M.h + spd * 0.006));
    if (!C.pinit || snap) { C.pos = des.slice(); C.pinit = true; }
    const rp = 1 - Math.exp(-(M.fwd ? 60 : 22) * dt);
    C.pos = [lerp(C.pos[0], des[0], rp), lerp(C.pos[1], des[1], rp), lerp(C.pos[2], des[2], rp)];
    let cp = C.pos.slice();
    if (cp[1] < GY + 0.7) cp[1] = GY + 0.7;
    if (C.shake > 0.001) { C.shake *= Math.exp(-6 * dt); cp = add3(cp, [(Math.random() - 0.5) * C.shake, (Math.random() - 0.5) * C.shake, (Math.random() - 0.5) * C.shake]); }
    cam.position.set(cp[0], cp[1], cp[2]);
    cam.up.set(up[0], up[1], up[2]);
    const la = add3(add3(p, mul3(M.fwd ? Fc : C.f, M.la)), mul3(up, M.fwd ? 0.3 : 0.9));
    cam.lookAt(la[0], la[1], la[2]);
    const tfov = M.fov + clamp(spd - 20, 0, 70) * 0.2 + (narrow ? 12 : 0);
    if (Math.abs(tfov - C.fov) > 0.05) { C.fov = lerp(C.fov, tfov, 1 - Math.exp(-4 * dt)); cam.fov = C.fov; cam.updateProjectionMatrix(); }
  }
  function followLight(p) {
    const st = (2 * SH) / SM, x = Math.round(p[0] / st) * st, y = Math.round(p[1] / st) * st, z = Math.round(p[2] / st) * st;
    sun.target.position.set(x, y, z); sun.position.set(x + SUNDIR.x * 160, y + SUNDIR.y * 160, z + SUNDIR.z * 160);
    sun.target.updateMatrixWorld(); sun.updateMatrixWorld();
    sky.position.copy(cam.position);
  }
  function resize(nw, nh) { cam.aspect = nw / nh; cam.updateProjectionMatrix(); }
  function render() {
    const sc = renderer.domElement.height / (2 * Math.tan(cam.fov * PI / 360));
    smoke.m.uniforms.uScale.value = sc; sparks.m.uniforms.uScale.value = sc;
    if (skDirty) { skG.attributes.position.needsUpdate = true; skDirty = false; }
    renderer.render(scene, cam);
  }
  function dispose() { bin.forEach(x => { try { x.dispose(); } catch (e) {} }); [trackMesh, scenery, hillMesh, cloudMesh].forEach(m => m && m.geometry.dispose()); }
  const clouds = () => cloudMesh && (cloudMesh.position.x = (performance.now() / 1000) * 1.5 % 400);
  return { THREE, scene, cam, renderer, MAT, mkCar, setTrack, setSeason, smoke, sparks, skid, clearSkids, camFollow, followLight, render, resize, dispose, C, CAMS, Bag, bagGeo, own, clouds, mkTag, get trackMesh() { return trackMesh; }, V3 };
}
function makeAudio(api, prefs) {
  let ctx = null, master = null, eng = null, nbuf = null, musicOn = false, nextT = 0, step = 0, mus = null;
  const N = {};
  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
    nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    mus = ctx.createGain(); mus.gain.value = 0; mus.connect(master);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o1.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); o1.start(); o2.start();
    eng = { o1, o2, f, g };
    const mk = (type, freq, q) => { const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true; const f2 = ctx.createBiquadFilter(); f2.type = type; f2.frequency.value = freq; if (q) f2.Q.value = q; const g2 = ctx.createGain(); g2.gain.value = 0; s.connect(f2); f2.connect(g2); g2.connect(master); s.start(); return { s, f: f2, g: g2 }; };
    N.skid = mk('bandpass', 1700, 3); N.wind = mk('lowpass', 500, 0.5); N.off = mk('lowpass', 900, 0.7);
    return ctx;
  }
  const vol = () => api.muted ? 0 : (prefs.sfx == null ? 1 : prefs.sfx);
  function tone(f0, f1, dur, type, v, when) {
    const c = ensure(); if (!c || !vol()) return;
    const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * vol(), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(freq, dur, v, type) {
    const c = ensure(); if (!c || !vol()) return;
    const t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = nbuf; f.type = type || 'lowpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.2), t + dur);
    g.gain.setValueAtTime(v * vol(), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  const SFX = {
    beep() { tone(520, 520, 0.16, 'square', 0.12); },
    go() { tone(1040, 1040, 0.4, 'square', 0.14); tone(520, 520, 0.4, 'triangle', 0.1); },
    cp() { tone(880, 880, 0.1, 'square', 0.1); tone(1320, 1320, 0.18, 'square', 0.1, 0.09); },
    fin() { [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.22, 'square', 0.1, i * 0.1)); },
    pb() { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, f, 0.2, 'triangle', 0.13, i * 0.08)); },
    medal() { tone(784, 784, 0.12, 'triangle', 0.12); tone(1175, 1175, 0.3, 'triangle', 0.12, 0.12); },
    hit(v) { burst(500 + v * 25, 0.22, clamp(v / 14, 0.1, 0.5)); tone(90, 40, 0.2, 'sine', clamp(v / 18, 0.1, 0.4)); },
    boost() { burst(2200, 0.5, 0.18, 'bandpass'); tone(300, 900, 0.4, 'sawtooth', 0.04); },
    reset() { tone(660, 330, 0.18, 'triangle', 0.1); },
    place() { tone(440, 440, 0.05, 'square', 0.06); },
    del() { tone(300, 160, 0.09, 'square', 0.06); },
    err() { tone(160, 120, 0.16, 'sawtooth', 0.07); },
    land(v) { burst(300 + v * 20, 0.18, clamp(v / 16, 0.08, 0.35)); },
    tap() { tone(700, 700, 0.04, 'square', 0.05); }
  };
  function drive(spd, thr, skid, off, air, on) {
    if (!ctx || !eng) return;
    const t = ctx.currentTime, v = on ? vol() : 0;
    const base = 52 + Math.min(spd, 95) * 2.1 + thr * 22;
    eng.o1.frequency.setTargetAtTime(base, t, 0.05); eng.o2.frequency.setTargetAtTime(base * 0.5, t, 0.05);
    eng.f.frequency.setTargetAtTime(380 + spd * 18 + thr * 260, t, 0.08);
    eng.g.gain.setTargetAtTime(v * (0.045 + thr * 0.03), t, 0.06);
    N.skid.g.gain.setTargetAtTime(v * skid * 0.12, t, 0.04); N.skid.f.frequency.setTargetAtTime(1300 + spd * 14, t, 0.1);
    N.wind.g.gain.setTargetAtTime(v * Math.pow(Math.min(spd, 100) / 100, 1.6) * 0.16, t, 0.1); N.wind.f.frequency.setTargetAtTime(300 + spd * 14, t, 0.1);
    N.off.g.gain.setTargetAtTime(v * off * Math.min(1, spd / 30) * 0.09, t, 0.08);
  }
  const CH = [[0, 3, 7, 10], [5, 8, 12, 15], [3, 7, 10, 14], [7, 10, 14, 17]];
  function sched() {
    if (!ctx || !musicOn || api.muted) return;
    const mv = prefs.music == null ? 0.6 : prefs.music;
    mus.gain.setTargetAtTime(mv * 0.5, ctx.currentTime, 0.2);
    while (nextT < ctx.currentTime + 0.4) {
      if (nextT < ctx.currentTime) nextT = ctx.currentTime;
      const bar = (step >> 3) & 3, k = step & 7, ch = CH[bar], root = 110 * Math.pow(2, -2 / 12);
      const fr = s => root * Math.pow(2, s / 12);
      const t = nextT, mk = (f, d, ty, v) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = ty; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(mus); o.start(t); o.stop(t + d + 0.05); };
      if (k === 0) mk(fr(ch[0] - 12), 0.9, 'triangle', 0.16);
      if (k === 4) mk(fr(ch[0] - 12), 0.4, 'triangle', 0.12);
      mk(fr(ch[k & 3] + 12), 0.28, 'square', 0.035);
      if (k % 2 === 0) mk(fr(ch[(k >> 1) % 4] + 24), 0.2, 'triangle', 0.03);
      nextT += 0.19; step++;
    }
  }
  api.interval(sched, 120);
  return {
    play(n, a) { if (api.muted) return; const c = ensure(); if (!c) return; if (c.state !== 'running') c.resume().catch(() => {}); try { SFX[n](a); } catch (e) {} },
    drive,
    music(on) { musicOn = on; const c = ensure(); if (c && on && c.state !== 'running') c.resume().catch(() => {}); if (mus && !on) mus.gain.setTargetAtTime(0, ctx.currentTime, 0.2); },
    wake() { const c = ensure(); if (c && c.state !== 'running') c.resume().catch(() => {}); },
    close() { musicOn = false; if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
  };
}
const CSS = `
${G}{--nv:#1b2656;--nv2:#131b44;--nv3:#26346f;--ln:#4a63c0;--tx:#eaf0ff;--tx2:#9db2ee;--yl:#ffd23a;--rd:#ea3b34;--gn:#35d684;--bl:#6fb1ff;position:relative;background:#101835;color:var(--tx);font-family:"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
${G} .stage{position:relative;width:100%;margin:0 auto;container-type:inline-size;background:#101835;overflow:hidden;touch-action:none}
${G} .stage canvas{display:block;width:100%;height:100%;outline:0}
${G} .pt-ui{position:absolute;inset:0;font-size:clamp(10px,1.6cqw,18px);pointer-events:none}
@container (max-width:620px){${G} .pt-ui{font-size:clamp(9px,2.5cqw,13px)}}
${G} .pt-ui>*{pointer-events:none}
${G} .pt-ui button,${G} .pt-ui input,${G} .pt-ui select,${G} .pt-ui textarea,${G} .pt-ui .clk{pointer-events:auto}
${G} .pt-ui [hidden]{display:none!important}
${G} .pt-b{font:inherit;font-style:italic;font-weight:800;letter-spacing:.03em;color:var(--tx);background:linear-gradient(180deg,var(--nv3),var(--nv));border:.15em solid #0c1230;border-radius:.35em;padding:.55em 1.1em;cursor:pointer;text-transform:uppercase;box-shadow:0 .25em 0 #0a0f2c,inset 0 .1em 0 rgba(255,255,255,.18);transition:transform .08s,filter .12s}
${G} .pt-b:hover{filter:brightness(1.25)}
${G} .pt-b:active{transform:translateY(.15em);box-shadow:0 .1em 0 #0a0f2c}
${G} .pt-b.pri{background:linear-gradient(180deg,#4f8bff,#2a56d8);color:#fff}
${G} .pt-b.go{background:linear-gradient(180deg,#ffd23a,#e9a400);color:#1a1c3a}
${G} .pt-b.red{background:linear-gradient(180deg,#f0564e,#c2231d)}
${G} .pt-b.sm{padding:.35em .8em;font-size:.82em}
${G} .pt-b[disabled]{opacity:.45;filter:grayscale(.6);cursor:default}
${G} .pt-b.on{background:linear-gradient(180deg,#35d684,#16a35c);color:#06241a}
${G} .scr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1em;pointer-events:none}
${G} .scr.blur{background:rgba(10,16,48,.46);backdrop-filter:blur(.35em);-webkit-backdrop-filter:blur(.35em);pointer-events:auto}
${G} .scr.mn{align-items:flex-start;padding-left:6%;box-sizing:border-box}
${G} .logo{width:min(30em,62%);filter:drop-shadow(0 .4em .5em rgba(5,10,40,.55))}
${G} .menu{display:flex;flex-direction:column;gap:.55em;width:min(15em,50%)}
${G} .scr.mn .sub{text-align:left}
${G} .menu .pt-b{font-size:1.25em;padding:.7em 1em}
${G} .sub{color:var(--tx2);font-size:.9em;text-align:center;max-width:36em;line-height:1.4}
${G} .panel{background:linear-gradient(180deg,rgba(28,40,92,.97),rgba(16,23,62,.97));border:.18em solid #0c1230;border-radius:.6em;box-shadow:0 .6em 1.6em rgba(3,6,24,.55);padding:1.1em 1.3em;max-width:94%;max-height:92%;overflow:auto;pointer-events:auto}
${G} .panel h2{margin:0 0 .5em;font-style:italic;font-weight:900;font-size:1.7em;letter-spacing:.03em;text-transform:uppercase}
${G} .panel h3{margin:.9em 0 .4em;font-style:italic;font-size:1.05em;color:var(--bl);text-transform:uppercase;letter-spacing:.06em}
${G} .row{display:flex;gap:.7em;align-items:center;flex-wrap:wrap}
${G} .row.sp{justify-content:space-between}
${G} .bar{position:absolute;left:0;right:0;top:0;display:flex;gap:.6em;align-items:center;padding:.6em .8em;background:linear-gradient(180deg,rgba(10,16,48,.88),rgba(10,16,48,0));pointer-events:none}
${G} .bar>*{pointer-events:auto}
${G} .tabs{display:flex;gap:.35em;flex-wrap:wrap}
${G} .tab{font:inherit;font-style:italic;font-weight:800;text-transform:uppercase;color:var(--tx2);background:rgba(10,16,48,.7);border:.14em solid #0c1230;border-radius:.3em;padding:.4em .9em;cursor:pointer}
${G} .tab.on{color:#fff;background:linear-gradient(180deg,#4f8bff,#2a56d8)}
${G} .sel{position:absolute;inset:3.4em .8em .8em;display:flex;gap:.8em;pointer-events:none;min-height:0}
${G} .grid{flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(11.5em,1fr));gap:.7em;align-content:start;padding:.2em;pointer-events:auto;min-width:0}
${G} .card{position:relative;background:linear-gradient(180deg,#2a3980,#18235a);border:.16em solid #0c1230;border-radius:.5em;padding:.5em;cursor:pointer;text-align:left;color:var(--tx);font:inherit;box-shadow:0 .25em 0 #0a0f2c}
${G} .card:hover{filter:brightness(1.18)}
${G} .card.on{outline:.18em solid var(--yl)}
${G} .card .th{display:block;width:100%;aspect-ratio:16/10;border-radius:.3em;background:#0e1538}
${G} .card b{display:block;margin-top:.35em;font-style:italic;font-size:1.05em}
${G} .card small{display:flex;justify-content:space-between;color:var(--tx2);font-size:.85em}
${G} .card .lk{position:absolute;inset:0;background:rgba(8,12,34,.62);display:flex;align-items:center;justify-content:center;border-radius:.4em;font-size:1.4em}
${G} .side{width:min(21em,44%);flex:none;display:flex;flex-direction:column;gap:.6em;overflow:auto;pointer-events:auto}
${G} .med{display:flex;gap:.5em;align-items:center}
${G} .med i{display:inline-block;width:1.1em;height:1.1em;border-radius:50%;border:.14em solid rgba(0,0,0,.45)}
${G} .med i.g{background:#ffcc33}${G} .med i.s{background:#cfd6e4}${G} .med i.b{background:#cd7f3a}${G} .med i.n{background:#3a4478;opacity:.55}
${G} table.lb{width:100%;border-collapse:collapse;font-size:.92em}
${G} table.lb td,${G} table.lb th{padding:.28em .4em;text-align:left;border-bottom:.08em solid rgba(255,255,255,.08)}
${G} table.lb tr.me td{color:var(--yl);font-weight:700}
${G} table.lb td.t{font-family:Consolas,"Courier New",monospace;text-align:right}
${G} .hud-top{position:absolute;left:50%;top:0;transform:translateX(-50%);display:flex;align-items:flex-start;justify-content:center;filter:drop-shadow(0 .2em .3em rgba(0,0,10,.35))}
${G} .hud-top .pl{background:linear-gradient(180deg,#232f6c,#18214e);border:.14em solid #0c1230;border-top:0;padding:.35em .8em .25em;text-align:center;position:relative}
${G} .hud-top .pl.c{padding:.35em 1.3em .3em;background:linear-gradient(180deg,#2a3a86,#1b2658);transform:scale(1.12);transform-origin:top;z-index:2;border-radius:0 0 .35em .35em}
${G} .hud-top .pl:first-child{border-radius:0 0 0 .6em;transform:skewX(8deg);margin-right:-.3em}
${G} .hud-top .pl:last-child{border-radius:0 0 .6em 0;transform:skewX(-8deg);margin-left:-.3em}
${G} .hud-top .pl:first-child canvas,${G} .hud-top .pl:last-child canvas{transform:skewX(-8deg)}
${G} .hud-top .pl:last-child canvas{transform:skewX(8deg)}
${G} .hud-top canvas{display:block;margin:0 auto}
${G} .hud-top .lb{font-size:.62em;color:var(--tx2);font-style:italic;font-weight:700;letter-spacing:.05em;margin-bottom:.1em}
${G} .hud-split{position:absolute;left:50%;top:5.6em;transform:translateX(-50%);font-style:italic;font-weight:800;font-size:1.4em;text-shadow:0 .1em .2em #000}
${G} .hud-tl,${G} .hud-tr{position:absolute;top:0;background:linear-gradient(180deg,#232f6c,#18214e);border:.14em solid #0c1230;border-top:0;padding:.35em .9em;font-style:italic;font-weight:800;font-size:1.7em;display:flex;align-items:baseline;gap:.35em}
${G} .hud-tl{left:0;border-radius:0 0 .6em 0}
${G} .hud-tr{right:0;border-radius:0 0 0 .6em}
${G} .hud-tr small{font-size:.5em;color:var(--tx2)}
${G} .hud-tl svg{width:.9em;height:.9em;align-self:center}
${G} .hud-btns{position:absolute;left:0;bottom:0;display:flex;gap:.2em}
${G} .hud-btns .pt-b{border-radius:0 .5em 0 0;font-size:.95em;box-shadow:none;border-bottom:0;border-left:0;padding:.5em .9em}
${G} .hud-rank{position:absolute;left:.5em;top:3.2em;display:flex;flex-direction:column;gap:.15em;font-size:.95em;font-style:italic;font-weight:700}
${G} .hud-rank div{background:rgba(16,24,70,.78);border-left:.3em solid var(--c,#fff);padding:.12em .7em .12em .5em;min-width:11em;display:flex;justify-content:space-between;gap:1em;border-radius:0 .3em .3em 0}
${G} .hud-rank div.me{background:rgba(70,92,200,.85)}
${G} .hud-rank div span:last-child{font-family:Consolas,"Courier New",monospace;font-weight:600;color:var(--tx2)}
${G} .hud-msg{position:absolute;left:0;right:0;top:32%;text-align:center;font-style:italic;font-weight:900;font-size:7em;color:#fff;text-shadow:0 .06em 0 #1b2656,0 0 .3em rgba(0,0,20,.5);letter-spacing:.04em;pointer-events:none}
${G} .hud-msg.sm{font-size:3em;top:30%}
${G} .hud-toast{position:absolute;left:50%;top:7.6em;transform:translateX(-50%);font-style:italic;font-weight:800;font-size:1.6em;background:rgba(14,22,66,.9);border:.12em solid #0c1230;border-radius:.4em;padding:.25em .9em;white-space:nowrap;opacity:0;transition:opacity .25s}
${G} .hud-toast.on{opacity:1}
${G} .fin{position:absolute;left:0;right:0;top:34%;background:linear-gradient(180deg,rgba(24,34,86,.96),rgba(14,20,56,.96));border-top:.18em solid #0c1230;border-bottom:.18em solid #0c1230;text-align:center;padding:.9em 0 1em;pointer-events:auto}
${G} .fin h2{margin:0;font-style:italic;font-size:2.2em;font-weight:900}
${G} .fin .tm{font-size:3.2em;font-style:italic;font-weight:900;font-family:"Trebuchet MS",sans-serif;letter-spacing:.06em;margin:.1em 0}
${G} .fin .pbn{display:inline-block;background:var(--rd);color:#fff;font-style:italic;font-weight:900;padding:.15em .8em;border-radius:.3em;letter-spacing:.08em;animation:ptp .6s ease-in-out infinite alternate}
@keyframes ptp{to{transform:scale(1.08)}}
${G} .fin .row{justify-content:center;margin-top:.7em}
${G} .tc{position:absolute;inset:0;pointer-events:none}
${G} .tb{position:absolute;width:6.2em;height:6.2em;background:rgba(40,52,110,.55);border:.15em solid rgba(10,16,48,.55);border-radius:.5em;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.88);font-size:1.4em;pointer-events:auto;touch-action:none}
${G} .tb.on{background:rgba(110,140,255,.7)}
${G} .tb svg{width:50%;height:50%;fill:currentColor}
${G} .edit-top{position:absolute;left:0;right:0;top:0;display:flex;gap:.35em;align-items:center;padding:.4em .5em;background:linear-gradient(180deg,rgba(14,20,60,.96),rgba(14,20,60,.86));border-bottom:.15em solid #0c1230;flex-wrap:wrap;pointer-events:auto}
${G} .edit-top input[type=text]{font:inherit;color:var(--tx);background:#0e1538;border:.12em solid #0c1230;border-radius:.3em;padding:.35em .6em;width:11em}
${G} .edit-pal{position:absolute;right:0;top:3.6em;bottom:2.4em;width:min(15em,38%);background:rgba(14,20,60,.93);border-left:.15em solid #0c1230;overflow:auto;padding:.4em;pointer-events:auto}
${G} .edit-pal h4{margin:.5em 0 .25em;font-size:.82em;color:var(--bl);text-transform:uppercase;letter-spacing:.07em;font-style:italic}
${G} .edit-pal .pg{display:grid;grid-template-columns:repeat(2,1fr);gap:.3em}
${G} .pcb{font:inherit;font-size:.9em;color:var(--tx);background:#222f6c;border:.12em solid #0c1230;border-radius:.3em;padding:.3em .2em;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:.15em;font-style:italic;font-weight:700}
${G} .pcb svg{width:100%;height:2.4em}
${G} .pcb.on{background:#4f8bff;color:#fff}
${G} .pcb:hover{filter:brightness(1.2)}
${G} .edit-bot{position:absolute;left:0;right:0;bottom:0;display:flex;gap:.6em;align-items:center;padding:.35em .7em;background:rgba(14,20,60,.92);border-top:.15em solid #0c1230;font-weight:700;font-style:italic;pointer-events:auto;flex-wrap:wrap}
${G} .edit-bot .ok{color:var(--gn)}${G} .edit-bot .bad{color:#ff7b74}
${G} textarea.code{width:100%;min-height:7em;font:12px Consolas,"Courier New",monospace;color:var(--tx);background:#0b1130;border:.12em solid #0c1230;border-radius:.3em;padding:.5em;box-sizing:border-box;resize:vertical;user-select:text;-webkit-user-select:text}
${G} input.in{font:inherit;color:var(--tx);background:#0e1538;border:.12em solid #0c1230;border-radius:.3em;padding:.4em .7em;box-sizing:border-box}
${G} .sw{width:2.1em;height:2.1em;border-radius:50%;border:.18em solid #0c1230;cursor:pointer;padding:0}
${G} .sw.on{outline:.18em solid var(--yl)}
${G} .kv{display:grid;grid-template-columns:auto 1fr;gap:.35em 1em;align-items:center}
${G} .kv>span:nth-child(odd){color:var(--tx2)}
${G} kbd{display:inline-block;background:#0e1538;border:.1em solid #3a4a98;border-radius:.25em;padding:.05em .45em;font-family:inherit;font-weight:700;margin:0 .1em}
${G} input[type=range]{accent-color:#6fb1ff;width:10em}
${G} .pl-row{display:flex;justify-content:space-between;gap:1em;padding:.25em .5em;border-bottom:.08em solid rgba(255,255,255,.08);align-items:center}
${G} .pl-row i{display:inline-block;width:.8em;height:.8em;border-radius:50%;margin-right:.5em}
${G} .tt{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(14,22,66,.92);border:.14em solid #0c1230;border-radius:.4em;padding:.5em 1em;font-weight:700;font-style:italic;pointer-events:none}
`;
const CAR_COLS = ['#f2c230', '#e5322d', '#2f7bff', '#35c46a', '#ff7a1a', '#9b5cf0', '#f4f4f8', '#2a2d3a'];
const ACC_COLS = ['#f4f4f8', '#16161d', '#ffd23a', '#e5322d', '#2f7bff', '#35c46a', '#ff7a1a', '#9b5cf0'];
const RIVALS = [['Nova', '#ff5fb0'], ['Kestrel', '#35d684'], ['Ember', '#ff9a2e'], ['Orbit', '#a56bff'], ['Glacier', '#5fd7ff'], ['Dune', '#e8c15a'], ['Mamba', '#c6ff4d']];
const NETCOL = ['#ffd23a', '#e5322d', '#2f7bff', '#35c46a', '#ff7a1a', '#9b5cf0', '#5fd7ff', '#ff5fb0'];
const MEDN = ['None', 'Bronze', 'Silver', 'Gold'];
const FLAG = '<svg viewBox="0 0 24 24"><path d="M5 2v20h2.4v-8H20l-3-5.5L20 3H7.4V2z" fill="#ffd23a"/></svg>';
const LOGO = `<svg class="logo" viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ptg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2fbff"/><stop offset=".45" stop-color="#9fd3ff"/><stop offset="1" stop-color="#4b8de8"/></linearGradient></defs><g transform="skewX(-12) translate(34 0)" font-family="'Trebuchet MS','Segoe UI',Arial,sans-serif" font-weight="900" font-size="96" text-anchor="middle"><text x="236" y="104" fill="#0d1540" stroke="#0d1540" stroke-width="16" stroke-linejoin="round" textLength="440" lengthAdjust="spacingAndGlyphs">POLYTRACK</text><text x="236" y="104" fill="url(#ptg)" stroke="#27418e" stroke-width="3" stroke-linejoin="round" textLength="440" lengthAdjust="spacingAndGlyphs">POLYTRACK</text></g><path d="M40 128h440" stroke="#ffd23a" stroke-width="6" stroke-dasharray="26 12" stroke-linecap="round" opacity=".9"/></svg>`;
function run(root, wrap, api, V) {
  const { THREE, renderer, canvas, w, h } = V;
  wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
  canvas.style.width = '100%'; canvas.style.height = '100%'; wrap.append(canvas);
  const narrow = h > w;
  if (COARSE) { const fit = () => { const cw = canvas.clientWidth; if (cw && !document.fullscreenElement) renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / w); }; fit(); api.on(window, 'resize', fit); }
  const view = makeView(THREE, renderer, canvas, w, h, narrow);
  const saved = api.load() || {};
  const P = { best: saved.best || {}, med: saved.med || {}, lb: saved.lb || {}, split: saved.split || {}, custom: saved.custom || [], played: saved.played || 0, set: saved.set || {} };
  const prof = (() => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile')); return (p && (p.username || p.displayName)) || ''; } catch (e) { return ''; } })();
  const prefs = Object.assign({ cam: 0, kmh: 1, sfx: 1, music: 0.5, shadow: 1, ghost: 1, c1: 0, c2: 0, name: prof || 'Player', touch: 'auto', rivals: 0, tags: 1 }, P.set);
  P.set = prefs;
  let saveT = 0;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => api.save(P), 250); };
  const audio = makeAudio(api, prefs);
  const ui = document.createElement('div'); ui.className = 'pt-ui'; wrap.append(ui);
  ui.innerHTML = `<div class="hud" hidden>
<div class="hud-top"><div class="pl"><div class="lb">Record</div><canvas data-c="rec"></canvas></div><div class="pl c"><div class="lb">Current</div><canvas data-c="cur"></canvas></div><div class="pl"><div class="lb">Difference</div><canvas data-c="dif"></canvas></div></div>
<div class="hud-tl">${FLAG}<span data-k="cp">0/0</span></div><div class="hud-tr"><span data-k="spd">0</span><small data-k="unit">km/h</small></div>
<div class="hud-split" data-k="split"></div><div class="hud-rank" data-k="rank"></div><div class="hud-msg" data-k="msg"></div><div class="hud-toast" data-k="toast"></div>
<div class="hud-btns"><button class="pt-b sm" data-a="exit">Exit</button><button class="pt-b sm" data-a="restart">Restart</button><button class="pt-b sm" data-a="cam">Camera</button><button class="pt-b sm" data-a="watch" hidden>Watch</button></div></div>
<div class="tc" hidden><button class="tb" data-t="cam" style="left:.6em;top:4.6em"><svg viewBox="0 0 24 24"><path d="M3 7h12a2 2 0 0 1 2 2v1.5l4-2.5v8l-4-2.5V15a2 2 0 0 1-2 2H3z"/></svg></button><button class="tb" data-t="rst" style="right:.6em;top:4.6em"><svg viewBox="0 0 24 24"><path d="M12 5a7 7 0 1 1-6.6 9.4l2-.7A5 5 0 1 0 12 7v3L7 6l5-4z"/></svg></button><button class="tb" data-t="up" style="left:.8em;bottom:8.8em"><svg viewBox="0 0 24 24"><path d="M12 4l9 15H3z"/></svg></button><button class="tb" data-t="dn" style="left:.8em;bottom:1.8em"><svg viewBox="0 0 24 24"><path d="M12 20L3 5h18z"/></svg></button><button class="tb" data-t="lf" style="right:7.6em;bottom:1.8em"><svg viewBox="0 0 24 24"><path d="M4 12l15-9v18z"/></svg></button><button class="tb" data-t="rt" style="right:.8em;bottom:1.8em"><svg viewBox="0 0 24 24"><path d="M20 12L5 3v18z"/></svg></button></div>
<div class="scr" data-k="scr"></div><div class="edt" data-k="edt" hidden></div><div class="fin" data-k="fin" hidden></div>`;
  const q = s => ui.querySelector(s), hud = q('.hud'), tcEl = q('.tc'), scr = q('[data-k=scr]'), edt = q('[data-k=edt]'), finEl = q('[data-k=fin]');
  const hk = {}; ui.querySelectorAll('.hud [data-k]').forEach(e => { hk[e.dataset.k] = e; });
  const cvs = {}; ui.querySelectorAll('.hud canvas').forEach(c => { cvs[c.dataset.c] = c; });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const seg7 = (c, text, col, hpx, key) => {
    if (c._t === text + col + hpx) return; c._t = text + col + hpx;
    const cw = hpx * 0.62, W = Math.ceil(cw * text.length + hpx * 0.3), H = hpx;
    if (c.width !== W * dpr) { c.width = W * dpr; c.height = H * dpr; c.style.width = W / 16 + 'em'; c.style.height = H / 16 + 'em'; c.style.fontSize = '1em'; }
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    x.transform(1, 0, -0.16, 1, hpx * 0.12, 0);
    const SG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', '+': 'g' };
    const dw = cw * 0.8, dh = H * 0.84, t = hpx * 0.1, ox = (cw - dw) / 2, oy = H * 0.08;
    const line = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
    x.lineCap = 'round'; x.lineWidth = t;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], X = ox + i * cw, segs = SG[ch];
      if (ch === ':') { x.fillStyle = col; x.fillRect(X + dw * 0.45, oy + dh * 0.3, t, t); x.fillRect(X + dw * 0.45, oy + dh * 0.64, t, t); continue; }
      if (ch === '.') { x.fillStyle = col; x.fillRect(X + dw * 0.4, oy + dh * 0.88, t * 1.1, t * 1.1); continue; }
      if (segs == null) continue;
      const p = { a: [X + t, oy, X + dw - t, oy], b: [X + dw, oy + t, X + dw, oy + dh / 2 - t], c: [X + dw, oy + dh / 2 + t, X + dw, oy + dh - t], d: [X + t, oy + dh, X + dw - t, oy + dh], e: [X, oy + dh / 2 + t, X, oy + dh - t], f: [X, oy + t, X, oy + dh / 2 - t], g: [X + t, oy + dh / 2, X + dw - t, oy + dh / 2] };
      for (const k in p) { x.strokeStyle = segs.includes(k) ? col : 'rgba(255,255,255,.07)'; line(...p[k]); }
      if (ch === '+') { x.strokeStyle = col; line(X + dw / 2, oy + dh * 0.28, X + dw / 2, oy + dh * 0.72); }
    }
  };
  const OFFI = OFFICIAL;
  const trackList = () => OFFI.concat(P.custom.map(c => customTrack(c)).filter(Boolean));
  function customTrack(c) {
    const d = decodeTrack(c.code); if (!d) return null;
    return { id: c.id, name: c.name || d.name || 'Custom', label: 'Custom', season: d.season, custom: true, tr: { name: c.name || d.name, season: d.season, pieces: d.pieces }, code: c.code, med: null };
  }
  const trackById = id => trackList().find(t => t.id === id) || OFFI[0];
  const cache = new Map();
  function compiled(track, full) {
    const k = track.id + (track.code || '') + (track.tr.pieces.length) + (full === false ? 'l' : 'f');
    let T = cache.get(k);
    if (!T) { T = compileTrack(track.tr, full === false ? { physics: false } : {}); cache.set(k, T); if (cache.size > 10) cache.delete(cache.keys().next().value); }
    return T;
  }
  const thumbs = new Map();
  function thumb(track) {
    const k = track.id + (track.code || '');
    if (thumbs.has(k)) return thumbs.get(k);
    const S = SEASONS[track.tr.season], T = compiled(track, false);
    let pts = [];
    if (T.route && T.route.pts.length) pts = T.route.pts.map(p => [p.p[0], p.p[2]]);
    else T.placed.filter(pl => pl.d.fn).forEach(pl => { const e = pieceEnds(pl); pts.push([e.a[0], e.a[2]], [e.b[0], e.b[2]]); });
    let svg = '';
    if (pts.length > 1) {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
      const sc = Math.min(140 / Math.max(10, x1 - x0), 84 / Math.max(10, z1 - z0)), ox = 80 - (x0 + x1) / 2 * sc, oz = 50 - (z0 + z1) / 2 * sc;
      const d = pts.filter((p, i) => i % 2 === 0 || i === pts.length - 1).map((p, i) => (i ? 'L' : 'M') + (p[0] * sc + ox).toFixed(1) + ' ' + (p[1] * sc + oz).toFixed(1)).join('');
      const a = pts[0], b = pts[pts.length - 1];
      svg = `<path d="${d}" fill="none" stroke="#0a1030" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#9fb4ff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${(a[0] * sc + ox).toFixed(1)}" cy="${(a[1] * sc + oz).toFixed(1)}" r="5" fill="#35d684"/><circle cx="${(b[0] * sc + ox).toFixed(1)}" cy="${(b[1] * sc + oz).toFixed(1)}" r="5" fill="#ffd23a"/>`;
    }
    const out = `<svg class="th" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g${track.season}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.sky[1]}"/><stop offset=".62" stop-color="${S.sky[2]}"/><stop offset=".62" stop-color="${S.ground}"/><stop offset="1" stop-color="${S.ground2}"/></linearGradient></defs><rect width="160" height="100" fill="url(#g${track.season})" opacity=".55"/>${svg}</svg>`;
    thumbs.set(k, out); return out;
  }
  const medOf = (track, ms) => !track.med || ms == null ? 0 : ms <= track.med[2] ? 3 : ms <= track.med[1] ? 2 : ms <= track.med[0] ? 1 : 0;
  const medHtml = (m) => `<span class="med">${[3, 2, 1].map(k => `<i class="${m >= k ? 'gsb'[3 - k] : 'n'}"></i>`).join('')}</span>`;
  const medScore = () => Object.values(P.med).reduce((a, b) => a + b, 0);
  const ghostKey = id => 'gameplay:polytrack:gh:' + id;
  const loadGhost = id => { try { return unpackGhost(JSON.parse(localStorage.getItem(ghostKey(id)))); } catch (e) { return null; } };
  const saveGhost = (id, g) => { try { localStorage.setItem(ghostKey(id), JSON.stringify(g)); } catch (e) {} };
  const ago = t => { const s = (Date.now() - t) / 1000; return s < 90 ? 'just now' : s < 5400 ? Math.round(s / 60) + ' min ago' : s < 129600 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; };
  function board(track) {
    const L = (P.lb[track.id] || []).map(e => ({ n: e.n, t: e.t, d: e.d, me: 1 }));
    if (track.med) {
      const g = track.med[2], s = track.med[1], b = track.med[0];
      [['Apex', g * 0.97], ['Nova', g * 1.03], ['Kestrel', (g + s) / 2], ['Ember', s * 1.02], ['Orbit', (s + b) / 2], ['Dune', b * 0.98], ['Glacier', b * 1.2]].forEach(r => L.push({ n: r[0], t: Math.round(r[1]), d: 0, bot: 1 }));
    }
    L.sort((a, b) => a.t - b.t);
    return L.slice(0, 10);
  }
  function addScore(track, ms) {
    const l = P.lb[track.id] || (P.lb[track.id] = []);
    l.push({ n: prefs.name, t: Math.round(ms), d: Date.now() });
    l.sort((a, b) => a.t - b.t); if (l.length > 10) l.length = 10;
    const rk = board(track).findIndex(e => e.me && e.t === Math.round(ms) && e.d);
    return rk;
  }
  const S = { screen: '', mode: 'menu', sel: OFFI[0].id, tab: 0, opt: { ghost: 1, rivals: 0 } };
  let R = null, net = null;
  const toastEl = hk.toast; let toastT = 0;
  function toast(t, ms, col) { toastEl.textContent = t; toastEl.style.color = col || ''; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), ms || 1600); }
  const setMsg = (t, sm) => { hk.msg.textContent = t || ''; hk.msg.className = 'hud-msg' + (sm ? ' sm' : ''); };
  const T_ = {
    menu() {
      return `${LOGO}<div class="menu"><button class="pt-b pri" data-a="play">Play</button><button class="pt-b" data-a="online">Online</button><button class="pt-b" data-a="editor">Editor</button><button class="pt-b" data-a="garage">Garage</button><button class="pt-b" data-a="settings">Settings</button><button class="pt-b" data-a="help">How to play</button></div><div class="sub">${medScore()} / ${OFFI.length * 3} medal points &middot; ${Object.keys(P.best).length} tracks driven</div>`;
    },
    select() {
      const list = trackList(), tabs = ['Summer', 'Winter', 'Desert', 'Custom'];
      const cur = list.filter(t => S.tab === 3 ? t.custom : (!t.custom && t.season === S.tab));
      if (!cur.find(t => t.id === S.sel)) S.sel = cur.length ? cur[0].id : S.sel;
      const sel = list.find(t => t.id === S.sel);
      const cards = cur.map((t, i) => { const m = P.med[t.id] || 0, b = P.best[t.id]; return `<button class="card${t.id === S.sel ? ' on' : ''}" data-a="pick" data-id="${t.id}">${thumb(t)}<b>${esc(t.label === 'Custom' ? t.name : t.label)}</b><small><span>${t.custom ? esc(t.name) : esc(t.name)}</span>${t.med ? medHtml(m) : ''}</small><small><span>${t.custom ? 'Custom' : '&#9733;'.repeat(t.diff)}</span><span>${b ? fmtT(b) : '--'}</span></small></button>`; }).join('') || `<div class="sub" style="grid-column:1/-1;padding:2em">No custom tracks yet. Build one in the Editor, or import a track code.<br><br><button class="pt-b pri" data-a="imp">Import code</button></div>`;
      let side = '';
      if (sel) {
        const bd = board(sel), b = P.best[sel.id], m = P.med[sel.id] || 0;
        side = `<div class="panel"><h2>${esc(sel.label === 'Custom' ? sel.name : sel.label + ' &middot; ' + sel.name)}</h2>${sel.med ? `<div class="kv"><span>Gold</span><b>${fmtT(sel.med[2])}</b><span>Silver</span><b>${fmtT(sel.med[1])}</b><span>Bronze</span><b>${fmtT(sel.med[0])}</b></div>` : ''}<div class="kv" style="margin-top:.5em"><span>Your best</span><b>${b ? fmtT(b) : 'No record'} ${sel.med ? medHtml(m) : ''}</b><span>Pieces</span><b>${sel.tr.pieces.length}</b></div>
<h3>Leaderboard</h3><table class="lb">${bd.length ? bd.map((e, i) => `<tr class="${e.me ? 'me' : ''}"><td>${i + 1}</td><td>${esc(e.n)}${e.bot ? ' <small style="opacity:.55">AI</small>' : ''}</td><td class="t">${fmtT(e.t)}</td></tr>`).join('') : '<tr><td>No times yet. Be the first.</td></tr>'}</table>
${S.mode === 'net' ? '' : `<h3>Options</h3><div class="row"><button class="pt-b sm ${S.opt.ghost ? 'on' : ''}" data-a="tg" data-k="ghost">Ghost ${S.opt.ghost ? 'on' : 'off'}</button><button class="pt-b sm" data-a="riv">Rivals: ${S.opt.rivals}</button></div>`}
<div class="row" style="margin-top:.8em"><button class="pt-b go" data-a="${S.mode === 'net' ? 'nstart' : 'race'}">${S.mode === 'net' ? 'Start race' : 'Race'}</button>${sel.custom ? `<button class="pt-b sm" data-a="exp" data-id="${sel.id}">Export</button><button class="pt-b sm" data-a="del" data-id="${sel.id}">Delete</button><button class="pt-b sm" data-a="ed" data-id="${sel.id}">Edit</button>` : ''}</div></div>`;
      }
      const net_ = S.mode === 'net';
      return `<div class="bar"><button class="pt-b sm" data-a="${net_ ? 'nlobby' : 'menu'}">${net_ ? 'Lobby' : 'Back'}</button><div class="tabs">${tabs.map((n, i) => `<button class="tab${S.tab === i ? ' on' : ''}" data-a="tab" data-i="${i}">${n}</button>`).join('')}</div></div><div class="sel"><div class="grid">${cards}</div><div class="side">${side}</div></div>`;
    },
    garage() {
      return `<div class="bar"><button class="pt-b sm" data-a="menu">Back</button></div><div class="panel" style="margin-left:auto;margin-right:3%"><h2>Garage</h2><h3>Body</h3><div class="row">${CAR_COLS.map((c, i) => `<button class="sw${prefs.c1 === i ? ' on' : ''}" data-a="c1" data-i="${i}" style="background:${c}"></button>`).join('')}</div><h3>Stripes &amp; wings</h3><div class="row">${ACC_COLS.map((c, i) => `<button class="sw${prefs.c2 === i ? ' on' : ''}" data-a="c2" data-i="${i}" style="background:${c}"></button>`).join('')}</div><h3>Driver name</h3><input class="in" data-k="name" maxlength="14" value="${esc(prefs.name)}"><div class="row" style="margin-top:.8em"><button class="pt-b sm" data-a="rnd">Random</button><button class="pt-b sm" data-a="dflt">Default</button></div></div>`;
    },
    settings() {
      const on = k => prefs[k] ? 'on' : '';
      return `<div class="panel" style="min-width:min(26em,90%)"><h2>Settings</h2><div class="kv"><span>Camera</span><span class="row"><button class="pt-b sm" data-a="s-cam">${['Chase', 'Far', 'Hood'][prefs.cam]}</button></span><span>Speed unit</span><span class="row"><button class="pt-b sm" data-a="s-unit">${prefs.kmh ? 'km/h' : 'mph'}</button></span><span>Effects volume</span><input type="range" min="0" max="1" step=".05" value="${prefs.sfx}" data-k="sfx"><span>Music</span><input type="range" min="0" max="1" step=".05" value="${prefs.music}" data-k="music"><span>Shadows</span><span class="row"><button class="pt-b sm ${on('shadow')}" data-a="s-shadow">${prefs.shadow ? 'On' : 'Off'}</button></span><span>Ghost car</span><span class="row"><button class="pt-b sm ${on('ghost')}" data-a="s-ghost">${prefs.ghost ? 'On' : 'Off'}</button></span><span>Name tags</span><span class="row"><button class="pt-b sm ${on('tags')}" data-a="s-tags">${prefs.tags ? 'On' : 'Off'}</button></span><span>Touch controls</span><span class="row"><button class="pt-b sm" data-a="s-touch">${prefs.touch === 'auto' ? 'Auto' : prefs.touch === 'on' ? 'Always' : 'Never'}</button></span></div><div class="row" style="margin-top:1em"><button class="pt-b" data-a="menu">Back</button><button class="pt-b sm red" data-a="wipe">Reset progress</button></div></div>`;
    },
    help() {
      return `<div class="panel" style="max-width:min(38em,92%)"><h2>How to play</h2><div class="kv"><span>Drive</span><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows</span><span>Handbrake</span><span><kbd>Space</kbd></span><span>Back to checkpoint</span><span><kbd>R</kbd></span><span>Restart run</span><span><kbd>Enter</kbd></span><span>Camera</span><span><kbd>C</kbd></span><span>Ghost</span><span><kbd>G</kbd></span><span>Editor</span><span>click place &middot; right-drag pan &middot; middle-drag orbit &middot; wheel zoom &middot; <kbd>R</kbd> rotate &middot; <kbd>Shift</kbd>+wheel height</span></div><div class="sub" style="text-align:left;margin-top:.8em">Drive through every checkpoint gate in order, then cross the finish. Boost pads (yellow chevrons) add speed. Loops need speed. Wall rides keep you stuck to the walls. Beat the medal times, race your own ghost, build tracks in the editor and share them as codes. Online, up to 8 racers drive the same track at once and see each other live (no collisions).</div><div class="row" style="margin-top:1em"><button class="pt-b" data-a="menu">Back</button></div></div>`;
    }
  };
  function show(name, arg) {
    S.screen = name; scr.className = 'scr' + (name === 'menu' ? ' mn' : ' blur');
    scr.innerHTML = name ? T_[name](arg) : '';
    const inp = scr.querySelector('input[data-k=name]'); if (inp) inp.addEventListener('keydown', e => e.stopPropagation());
  }
  const hideScr = () => { S.screen = ''; scr.innerHTML = ''; scr.className = 'scr'; };
  function panel(html) { S.screen = 'panel'; scr.className = 'scr blur'; scr.innerHTML = `<div class="panel">${html}</div>`; }
  const pressed = { up: 0, dn: 0, lf: 0, rt: 0 };
  const touchOn = () => prefs.touch === 'on' || (prefs.touch === 'auto' && COARSE);
  function syncTouch() { tcEl.hidden = !(touchOn() && (S.mode === 'race' || false) && !S.screen); }
  tcEl.querySelectorAll('.tb').forEach(b => {
    const t = b.dataset.t, key = { up: 'up', dn: 'dn', lf: 'lf', rt: 'rt' }[t];
    const dn = e => { e.preventDefault(); audio.wake(); b.setPointerCapture && b.setPointerCapture(e.pointerId); if (key) { pressed[key] = 1; b.classList.add('on'); } else if (t === 'cam') cycleCam(); else if (t === 'rst') resetCp(); };
    const upf = e => { if (key) { pressed[key] = 0; b.classList.remove('on'); } };
    b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', upf); b.addEventListener('pointercancel', upf); b.addEventListener('lostpointercapture', upf);
  });
  const KEYS = api.keys;
  const kd = c => KEYS.has(c);
  function readInput() {
    const up = kd('KeyW') || kd('ArrowUp') || pressed.up, dn = kd('KeyS') || kd('ArrowDown') || pressed.dn, l = kd('KeyA') || kd('ArrowLeft') || pressed.lf, r = kd('KeyD') || kd('ArrowRight') || pressed.rt;
    return { up: up ? 1 : 0, dn: dn ? 1 : 0, st: (r ? 1 : 0) - (l ? 1 : 0), hb: kd('Space') ? 1 : 0 };
  }
  function cycleCam() { prefs.cam = (prefs.cam + 1) % 3; view.C.mode = prefs.cam; toast(['Chase camera', 'Far camera', 'Hood camera'][prefs.cam], 900); save(); }
  function applyPrefs() {
    view.C.mode = prefs.cam;
    renderer.shadowMap.enabled = !!prefs.shadow;
    view.scene.traverse(o => { if (o.isMesh && o.material.isMeshLambertMaterial) o.material.needsUpdate = true; });
    audio.music(S.mode === 'menu' || S.mode === 'edit');
    syncTouch();
  }
  function handleClick(e) {
    const b = e.target.closest('[data-a]');
    if (!b || !ui.contains(b)) return;
    audio.wake();
    const a = b.dataset.a, id = b.dataset.id;
    audio.play('tap');
    switch (a) {
      case 'menu': goMenu(); break;
      case 'play': S.mode = 'menu'; show('select'); break;
      case 'online': goOnline(); break;
      case 'editor': openEditor(); break;
      case 'garage': show('garage'); break;
      case 'settings': show('settings'); break;
      case 'help': show('help'); break;
      case 'tab': S.tab = +b.dataset.i; show('select'); break;
      case 'pick': S.sel = id; show('select'); break;
      case 'tg': S.opt.ghost = S.opt.ghost ? 0 : 1; show('select'); break;
      case 'riv': S.opt.rivals = { 0: 1, 1: 3, 3: 5, 5: 0 }[S.opt.rivals]; show('select'); break;
      case 'race': startRace(trackById(S.sel), { kind: 'solo', ghost: S.opt.ghost, rivals: S.opt.rivals }); break;
      case 'c1': prefs.c1 = +b.dataset.i; save(); show('garage'); break;
      case 'c2': prefs.c2 = +b.dataset.i; save(); show('garage'); break;
      case 'rnd': prefs.c1 = (Math.random() * CAR_COLS.length) | 0; prefs.c2 = (Math.random() * ACC_COLS.length) | 0; save(); show('garage'); break;
      case 'dflt': prefs.c1 = 0; prefs.c2 = 0; save(); show('garage'); break;
      case 's-cam': prefs.cam = (prefs.cam + 1) % 3; view.C.mode = prefs.cam; save(); show('settings'); break;
      case 's-unit': prefs.kmh = prefs.kmh ? 0 : 1; save(); show('settings'); break;
      case 's-shadow': prefs.shadow = prefs.shadow ? 0 : 1; applyPrefs(); save(); show('settings'); break;
      case 's-ghost': prefs.ghost = prefs.ghost ? 0 : 1; save(); show('settings'); break;
      case 's-tags': prefs.tags = prefs.tags ? 0 : 1; save(); show('settings'); break;
      case 's-touch': prefs.touch = prefs.touch === 'auto' ? 'on' : prefs.touch === 'on' ? 'off' : 'auto'; save(); show('settings'); syncTouch(); break;
      case 'wipe': panel(`<h2>Reset progress?</h2><div class="sub">Deletes your times, medals, ghosts and custom tracks on this device.</div><div class="row" style="margin-top:1em"><button class="pt-b red" data-a="wipe2">Delete everything</button><button class="pt-b" data-a="settings">Cancel</button></div>`); break;
      case 'wipe2': { OFFI.concat(P.custom).forEach(t => { try { localStorage.removeItem(ghostKey(t.id)); } catch (e) {} }); P.best = {}; P.med = {}; P.lb = {}; P.split = {}; P.custom = []; api.save(P); show('menu'); break; }
      case 'exit': exitRace(); break;
      case 'restart': restartRace(); break;
      case 'cam': cycleCam(); break;
      case 'watch': watchRun(); break;
      case 'retry': restartRace(); break;
      case 'next': nextTrack(); break;
      case 'tracks': exitRace(); break;
      case 'lbfin': showLb(); break;
      case 'imp': importDialog(); break;
      case 'exp': exportDialog(trackById(id)); break;
      case 'del': { const t = trackById(id); panel(`<h2>Delete track?</h2><div class="sub">${esc(t.name)} will be removed from this device.</div><div class="row" style="margin-top:1em"><button class="pt-b red" data-a="del2" data-id="${id}">Delete</button><button class="pt-b" data-a="play">Cancel</button></div>`); break; }
      case 'del2': P.custom = P.custom.filter(c => c.id !== id); delete P.best[id]; delete P.lb[id]; try { localStorage.removeItem(ghostKey(id)); } catch (e) {} save(); S.tab = 3; show('select'); break;
      case 'ed': openEditor(id); break;
      case 'closep': hideScr(); syncTouch(); break;
      default: if (netClick(a, b)) break; edClick(a, b, e);
    }
  }
  ui.addEventListener('click', handleClick);
  ui.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k === 'name') { prefs.name = e.target.value.slice(0, 14) || 'Player'; save(); }
    else if (k === 'sfx') { prefs.sfx = +e.target.value; save(); audio.play('tap'); }
    else if (k === 'music') { prefs.music = +e.target.value; save(); }
  });
  api.on(window, 'keydown', e => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    audio.wake();
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) && (S.mode === 'race' || S.mode === 'edit')) e.preventDefault();
    if (e.repeat) { if (S.mode === 'edit') edKey(e); return; }
    if (S.mode === 'race' && R) {
      if (e.code === 'KeyR' && !R.watch) resetCp();
      else if (e.code === 'Enter' || e.code === 'Backspace') { if (!S.screen) restartRace(); }
      else if (e.code === 'KeyC') cycleCam();
      else if (e.code === 'KeyG') { prefs.ghost = prefs.ghost ? 0 : 1; if (R.gm) R.gm.g.visible = !!prefs.ghost; toast('Ghost ' + (prefs.ghost ? 'on' : 'off'), 800); }
      else if (R.watch) { if (e.code === 'Space') R.watch.pause = !R.watch.pause; else if (e.code === 'ArrowLeft') R.watch.t = Math.max(0, R.watch.t - 2000); else if (e.code === 'ArrowRight') R.watch.t += 2000; }
    } else if (S.mode === 'edit') edKey(e);
  });
  const DT = 1 / 120, IDLE = { up: 0, dn: 0, st: 0, hb: 0 };
  const SKILL = [0.97, 0.93, 0.89, 0.85, 0.81, 0.77, 0.73];
  function endRace() {
    const r = R; if (!r) return;
    r.carM.dispose(); if (r.gm) r.gm.dispose();
    r.riv.forEach(v => v.m.dispose());
    if (r.peers) r.peers.forEach(p => p.m && p.m.dispose());
    view.clearSkids(); view.C.shake = 0;
    R = null; hud.hidden = true; finEl.hidden = true; finEl.innerHTML = ''; setMsg('');
    hk.rank.innerHTML = ''; hk.split.textContent = '';
    audio.drive(0, 0, 0, 0, 0, false);
    syncTouch();
  }
  function startRace(track, o) {
    o = o || {};
    endRace();
    let T;
    try { T = compiled(track); } catch (e) { toast('Track error', 2500, '#ff7b74'); return false; }
    if (!T.ok || !T.start) { toast(T.err || 'Invalid track', 2500, '#ff7b74'); return false; }
    const demo = o.kind === 'demo';
    S.mode = demo ? (S.mode === 'net' ? 'net' : 'menu') : 'race';
    if (!demo) hideScr();
    view.setTrack(T);
    view.clearSkids();
    const c1 = CAR_COLS[prefs.c1], c2 = ACC_COLS[prefs.c2], car = Car(T);
    car.reset(T.start.p, T.start.q);
    const r = R = {
      track, T, kind: o.kind || 'solo', opts: o, car, carM: view.mkCar(c1, c2, false), st: 'count', cdT: demo ? 0.01 : (o.cd || 3.2), cdN: 9, acc: 0, nextCp: 0, cpT: [], last: null, rec: [], pi: 0, prog: 0,
      ghost: null, gm: null, gs: 0, riv: [], pp: car.p.slice(), pq: car.q.slice(), snap: 1, sp: [0, 0, 0, 0], ex: [0, 0, 0, 0], im: 0, fin: null, dif: null, thr: 0, wasAir: 0, boostOn: 0, hitT: 0, rkT: 0, dd: 0, hint: 0, bot: null, resets: 0, hold: 0
    };
    if (demo) r.bot = Bot(T, car, 1);
    if (r.kind === 'solo') {
      const g = o.ghost ? loadGhost(track.id) : null;
      if (g) { r.ghost = g; r.gm = view.mkCar(c1, c2, true, 'Ghost', '#ffd23a'); r.gm.g.visible = !!prefs.ghost; }
      if (o.rivals && T.route && T.route.ok) {
        for (let i = 0; i < o.rivals; i++) addRival(r, RIVALS[i][0], RIVALS[i][1], SKILL[i]);
      }
    }
    hud.hidden = demo;
    hk.unit.textContent = prefs.kmh ? 'km/h' : 'mph';
    hk.cp.textContent = '0/' + T.cps.length;
    hk.rank.hidden = !r.riv.length && r.kind !== 'online';
    view.C.mode = prefs.cam;
    view.smoke.clear(); view.sparks.clear();
    audio.music(false);
    syncTouch();
    stepRace(0);
    return true;
  }
  function addRival(r, name, col, skill) {
    const car = Car(r.T);
    car.reset(r.T.start.p, r.T.start.q);
    const v = { name, col, car, bot: Bot(r.T, car, skill), m: view.mkCar(col, '#f4f4f8', true, name, col), fin: null, sp: [0, 0, 0, 0], ex: [0, 0, 0, 0], id: name };
    r.riv.push(v);
    return v;
  }
  function botRespawn(T, car, b) {
    const pts = T.route.pts, pt = pts[Math.max(0, Math.min(pts.length - 1, b.idx))], f = pt.f, u = pt.u;
    car.reset(add3(pt.p, mul3(u, 1.2)), qBasis(pt.r, u, mul3(f, -1)), mul3(f, 12));
    b.stuck = 0; b.noProg = 0; b.lastS = pt.s; b.resets++;
  }
  function restartRace() {
    const r = R; if (!r) return;
    if (r.watch) { endWatch(); return; }
    if (r.kind === 'online') { toast('Restart is not available online', 1400); return; }
    if (r.kind === 'demo') return;
    startRace(r.track, Object.assign({}, r.opts, { cd: 2.2 }));
  }
  function nextTrack() {
    const r = R; if (!r) return;
    const l = trackList(), i = l.findIndex(t => t.id === r.track.id), n = l[(i + 1) % l.length];
    S.sel = n.id; startRace(n, r.opts);
  }
  function exitRace() {
    const r = R;
    if (r && r.kind === 'test') { endRace(); openEditor(); return; }
    if (r && r.kind === 'online') { leaveNet(); goMenu(); return; }
    endRace(); S.mode = 'menu'; show('select'); startDemo();
  }
  function goMenu() {
    if (net) leaveNet();
    if (S.mode === 'edit') edLeave();
    S.mode = 'menu';
    if (!R || R.kind !== 'demo') { endRace(); startDemo(); }
    show('menu'); applyPrefs();
  }
  function startDemo() {
    if (S.mode !== 'menu' && S.mode !== 'net') return;
    startRace(OFFI[(Math.random() * OFFI.length) | 0], { kind: 'demo' });
    audio.music(true);
  }
  function resetCp(auto) {
    const r = R; if (!r || r.st !== 'run' || r.watch) return;
    const c = r.car;
    if (r.last) c.reset(r.last.p, r.last.q);
    else if (r.kind === 'online' || r.kind === 'test') c.reset(r.T.start.p, r.T.start.q);
    else { restartRace(); return; }
    r.pp = c.p.slice(); r.pq = c.q.slice(); r.snap = 1; r.resets++; view.clearSkids();
    audio.play('reset'); if (!auto) toast('Reset to checkpoint', 800);
  }
  function onGate(ev) {
    const r = R, g = ev.g;
    if (r.st !== 'run') return;
    const ms = (r.car.steps - 1 + ev.f) * DT * 1000;
    if (g.kind === 'cp') {
      if (g.idx !== r.nextCp) return;
      r.nextCp++; r.cpT.push(ms);
      r.last = { p: add3(g.p, mul3(g.u, 1.2)), q: qBasis(g.r, g.u, mul3(g.n, -1)) };
      hk.cp.textContent = r.nextCp + '/' + r.T.cps.length;
      const best = P.split[r.track.id], bt = r.kind === 'solo' && best ? best[g.idx] : null;
      audio.play('cp');
      if (bt != null) { r.dif = ms - bt; splitMsg(r.dif); }
      else toast('Checkpoint ' + fmtT(ms), 1300);
    } else if (g.kind === 'fin') {
      if (r.nextCp >= r.T.cps.length) finish(ms);
      else toast('Missed checkpoint ' + (r.nextCp + 1), 1600, '#ff7b74');
    }
  }
  let splitTm = 0;
  function splitMsg(d) {
    hk.split.textContent = fmtD(d); hk.split.style.color = d <= 0 ? '#35d684' : '#ff7b74';
    clearTimeout(splitTm); splitTm = setTimeout(() => { hk.split.textContent = ''; }, 2500);
  }
  function finish(ms) {
    const r = R, tr = r.track;
    r.st = 'fin'; r.fin = ms; r.recFin = Float32Array.from(r.rec);
    audio.play('fin'); setMsg('');
    const info = { title: 'Finish', pb: false, med: 0, sub: '' };
    if (r.kind === 'solo') {
      const prev = P.best[tr.id], pb = prev == null || ms < prev, med = medOf(tr, ms), pm = P.med[tr.id] || 0;
      P.played++;
      info.pb = pb; info.med = med;
      if (pb) { P.best[tr.id] = Math.round(ms); P.split[tr.id] = r.cpT.map(Math.round); saveGhost(tr.id, packGhost(r.rec, Math.round(ms))); }
      if (med > pm) P.med[tr.id] = med;
      const rk = addScore(tr, ms);
      const sc = medScore(); if (sc > 0) api.submit(sc);
      const dif = prev != null ? ms - prev : null;
      info.sub = (rk >= 0 ? `<b>Rank ${rk + 1}</b>` : '') + (dif != null ? ` <b style="color:${dif <= 0 ? '#35d684' : '#ff7b74'}">${fmtD(dif)}</b>` : '');
      if (r.riv.length) { const pos = 1 + r.riv.filter(v => v.fin != null && v.fin < ms).length; info.sub += ` <b>Position ${pos}/${r.riv.length + 1}</b>`; }
      if (med > pm && med) { info.sub += ` <b style="color:#ffd23a">${MEDN[med]} medal!</b>`; setTimeout(() => audio.play('medal'), 500); }
      if (pb && prev != null) setTimeout(() => audio.play('pb'), 300);
      save();
    } else if (r.kind === 'online') onlineFinished(ms, info);
    showFin(r, info);
  }
  function showFin(r, info) {
    const solo = r.kind === 'solo', on = r.kind === 'online';
    finEl.hidden = false;
    finEl.innerHTML = `<h2>${info.title}</h2><div class="tm">${fmtT(r.fin)}</div>${info.pb ? '<div class="pbn">NEW RECORD</div>' : ''}<div class="row">${r.track.med && solo ? medHtml(info.med) : ''}<span>${info.sub}</span></div><div class="row">${on ? '<button class="pt-b" data-a="exit">Leave</button>' : `<button class="pt-b go" data-a="retry">Retry</button>${solo ? '<button class="pt-b pri" data-a="next">Next track</button><button class="pt-b" data-a="watch">Watch</button><button class="pt-b" data-a="lbfin">Leaderboard</button>' : ''}<button class="pt-b" data-a="tracks">${r.kind === 'test' ? 'Editor' : 'Tracks'}</button>`}</div>`;
  }
  function showLb() {
    const tr = R ? R.track : trackById(S.sel), bd = board(tr);
    panel(`<h2>${esc(tr.name)}</h2><table class="lb">${bd.map((e, i) => `<tr class="${e.me ? 'me' : ''}"><td>${i + 1}</td><td>${esc(e.n)}${e.bot ? ' <small style="opacity:.55">AI</small>' : ''}</td><td class="t">${fmtT(e.t)}</td><td>${e.d ? ago(e.d) : ''}</td></tr>`).join('') || '<tr><td>No times yet</td></tr>'}</table><div class="row" style="margin-top:1em"><button class="pt-b" data-a="closep">Close</button></div>`);
  }
  function watchRun() {
    const r = R; if (!r || !r.recFin || !r.recFin.length) return;
    r.watch = { G: { n: r.recFin.length / 8, a: r.recFin }, t: 0, pause: false, tmp: { p: [0, 0, 0], q: [0, 0, 0, 1], s: 0 }, last: [r.recFin[0], r.recFin[1], r.recFin[2]], v: [0, 0, 0], sp: 0 };
    finEl.hidden = true; r.snap = 1; setMsg('Replay: Space pause, arrows seek, Enter exit', 1);
    if (r.gm) r.gm.g.visible = false;
  }
  function endWatch() {
    const r = R; if (!r || !r.watch) return;
    r.watch = null; setMsg(''); finEl.hidden = false; if (r.gm) r.gm.g.visible = !!prefs.ghost;
    r.snap = 1;
  }
  function stepWatch(dt) {
    const r = R, w = r.watch;
    if (!w.pause) w.t += dt * 1000;
    const dur = (w.G.n - 1) / GH * 1000;
    if (w.t > dur + 600) { endWatch(); return; }
    w.t = Math.max(0, w.t);
    ghostAt(w.G, Math.min(w.t, dur), w.tmp);
    const p = w.tmp.p, k = dt > 0.0005 && !w.pause ? 1 / dt : 0;
    w.v = [(p[0] - w.last[0]) * k, (p[1] - w.last[1]) * k, (p[2] - w.last[2]) * k];
    w.last = p.slice();
    w.sp += w.tmp.s * 100 / 0.45 * dt;
    r.sp.fill(w.sp);
    r.carM.set(p, w.tmp.q, 0, r.sp, null);
    view.camFollow(p, w.tmp.q, w.v, dt, 1, r.snap, prefs.cam); r.snap = 0;
    view.followLight(p);
  }
  function stepRivals(r) {
    for (const v of r.riv) {
      if (v.fin != null) continue;
      const inp = v.bot.input(DT);
      v.car.step(inp, DT); v.car.events.length = 0;
      if (v.bot.stuck) botRespawn(r.T, v.car, v.bot);
      if (v.bot.idx >= r.T.route.pts.length - 3) { v.fin = v.car.steps * DT * 1000; if (r.net && r.net.botFin) r.net.botFin(v); }
    }
  }
  function updProg(r) {
    const pts = r.T.route && r.T.route.pts; if (!pts) return;
    const c = r.car.p; let bi = r.pi, bd = 1e12;
    for (let i = Math.max(0, r.pi - 4); i < Math.min(pts.length, r.pi + 40); i++) { const d = sub3(pts[i].p, c), l = d[0] * d[0] + d[1] * d[1] + d[2] * d[2]; if (l < bd) { bd = l; bi = i; } }
    r.pi = bi; r.prog = r.fin != null ? 1 : pts[bi].s / r.T.route.total;
  }
  function stepRace(dt) {
    const r = R;
    if (!r || r.hold) return;
    if (r.watch) { stepWatch(dt); return; }
    const c = r.car;
    if (r.st === 'count') {
      r.cdT -= dt;
      const n = Math.ceil(r.cdT - 0.2);
      if (r.kind !== 'demo' && n !== r.cdN) {
        r.cdN = n;
        if (n >= 1 && n <= 3) { setMsg(String(n)); audio.play('beep'); }
        else if (n <= 0) { setMsg('GO!'); audio.play('go'); setTimeout(() => { if (R === r && r.st !== 'count' && !r.hint) setMsg(''); }, 900); }
      }
      if (n <= 0) { r.st = 'run'; r.acc = 0; if (r.net && r.net.go) r.net.go(); }
      return;
    }
    r.acc = Math.min(r.acc + dt, DT * 8);
    const run = r.st === 'run';
    let inp = r.kind === 'demo' ? null : run ? readInput() : IDLE;
    r.thr = inp ? inp.up : 1;
    while (r.acc >= DT) {
      r.acc -= DT;
      r.pp = c.p.slice(); r.pq = c.q;
      if (r.kind === 'demo') inp = r.bot.input(DT);
      c.step(inp, DT);
      if (c.events.length) { if (r.st === 'run') for (const ev of c.events) onGate(ev); c.events.length = 0; }
      if (r.st === 'run' && !(c.steps & 3)) r.rec.push(c.p[0], c.p[1], c.p[2], c.q[0], c.q[1], c.q[2], c.q[3], Math.min(1, len3(c.v) / 100));
      if (c.impact > r.im) r.im = c.impact;
      if (r.riv.length && r.st !== 'count') stepRivals(r);
      if (r.kind === 'demo' && (r.bot.stuck || r.bot.idx >= r.T.route.pts.length - 3)) r.dd += DT;
    }
    if (r.T.route) updProg(r);
    if (c.p[1] < r.T.minY - 45 && r.st === 'run') resetCp(true);
  }
  function wheelData(car, sp, ex) { for (let i = 0; i < 4; i++) { sp[i] = car.wh[i].spin; ex[i] = car.wh[i].ext; } }
  const _gs = { p: [0, 0, 0], q: [0, 0, 0, 1], s: 0, done: false };
  function drawRace(dt) {
    const r = R; if (!r) return;
    const c = r.car, spd = len3(c.v);
    if (!r.watch) {
      const a = r.st === 'count' ? 1 : clamp(r.acc / DT, 0, 1);
      const p = [lerp(r.pp[0], c.p[0], a), lerp(r.pp[1], c.p[1], a), lerp(r.pp[2], c.p[2], a)], q = a < 0.999 ? qSlerp(r.pq, c.q, a) : c.q;
      wheelData(c, r.sp, r.ex);
      r.carM.set(p, q, c.wh[0].steer, r.sp, r.ex);
      view.camFollow(p, q, c.v, dt, c.grounded, r.snap, prefs.cam); r.snap = 0;
      view.followLight(p);
      effects(r, c, dt, spd);
    }
    const ms = r.st === 'run' ? c.steps * DT * 1000 : r.st === 'fin' ? r.fin : 0;
    if (r.gm) {
      const G = r.ghost;
      if (r.st === 'count' && prefs.ghost) { ghostAt(G, 0, _gs); r.gm.set(_gs.p, _gs.q, 0, null, null); r.gm.g.visible = true; }
      else if (prefs.ghost && !r.watch && ms <= G.t + 400) {
        ghostAt(G, ms, _gs); r.gs += _gs.s * 100 / 0.45 * dt; r.gm.g.visible = true;
        r.gsp = r.gsp || [0, 0, 0, 0]; r.gsp.fill(r.gs);
        r.gm.set(_gs.p, _gs.q, 0, r.gsp, null);
      } else r.gm.g.visible = false;
    }
    for (const v of r.riv) { wheelData(v.car, v.sp, v.ex); v.m.set(v.car.p, v.car.q, v.car.wh[0].steer, v.sp, v.ex); }
    view.smoke.update(dt, -1.2); view.sparks.update(dt, 14);
    if (r.kind === 'demo') { if (r.dd > 1.2) startDemo(); return; }
    if (r.peers) drawPeers(r, dt);
    hudUpdate(r, c, ms, spd, dt);
    let sk = 0; for (let i = 0; i < 4; i++) if (c.wh[i].g) sk = Math.max(sk, c.wh[i].skid);
    audio.drive(spd, r.thr, sk, c.off > 0 ? 1 : 0, c.grounded ? 0 : 1, !r.watch);
  }
  function effects(r, c, dt, spd) {
    const Rt = qrot(c.q, [1, 0, 0]), B = qrot(c.q, [0, 0, 1]), now = performance.now();
    for (let i = 0; i < 4; i++) {
      const w = c.wh[i];
      view.skid(i, w.p, w.n, Rt, !!(w.g && w.skid > 0.3));
      if (w.g && w.smoke > 0 && Math.random() < w.smoke * dt * 45) {
        const dirt = w.kd === 0;
        view.smoke.spawn(w.p, [(Math.random() - 0.5) * 2, 0.8 + Math.random(), (Math.random() - 0.5) * 2], 0.7 + Math.random() * 0.5, 0.6, 2.8, dirt ? [0.72, 0.6, 0.4, 0.45] : [0.88, 0.88, 0.92, 0.4]);
      }
    }
    if (r.im > 3.2 && now - r.hitT > 120) {
      r.hitT = now;
      const n = Math.min(10, 3 + (r.im | 0));
      for (let i = 0; i < n; i++) view.sparks.spawn(c.p, [(Math.random() - 0.5) * 12, Math.random() * 7, (Math.random() - 0.5) * 12], 0.35 + Math.random() * 0.3, 0.4, 0.08, [1, 0.8, 0.3, 1]);
      if (r.wasAir > 0.25 && r.im > 5) audio.play('land', r.im); else audio.play('hit', r.im);
      view.C.shake = Math.min(0.55, view.C.shake + r.im * 0.025);
    }
    r.im = 0;
    r.wasAir = c.grounded ? 0 : r.wasAir + dt;
    if (c.boost > 0.01) {
      if (!r.boostOn) audio.play('boost');
      r.boostOn = 1;
      const rear = add3(c.p, mul3(B, 2.3));
      for (let k = 0; k < 2; k++) view.sparks.spawn(rear, add3(mul3(B, 14 + Math.random() * 6), [(Math.random() - 0.5) * 3, (Math.random() - 0.3) * 3, (Math.random() - 0.5) * 3]), 0.3, 0.55, 0.05, [1, 0.62, 0.15, 0.95]);
    } else r.boostOn = 0;
    if (c.off > 2.5 && r.st === 'run') { if (!r.hint) { r.hint = 1; setMsg('Press R to get back', 1); } } else if (r.hint) { r.hint = 0; if (r.st === 'run') setMsg(''); }
  }
  function hudUpdate(r, c, ms, spd, dt) {
    const best = P.best[r.track.id];
    seg7(cvs.cur, fmtT(ms), r.st === 'fin' ? '#ffd23a' : '#eaf0ff', 30);
    seg7(cvs.rec, r.kind === 'solo' && best ? fmtT(best) : '--:--.---', '#9db2ee', 22);
    seg7(cvs.dif, r.dif != null ? fmtD(r.dif) : '--:--.---', r.dif == null ? '#9db2ee' : r.dif <= 0 ? '#35d684' : '#ff7b74', 22);
    const s = Math.round(spd * 3.6 * (prefs.kmh ? 1 : 0.621));
    if (r.sv !== s) { r.sv = s; hk.spd.textContent = s; }
    r.rkT -= dt;
    if (r.rkT <= 0 && !hk.rank.hidden) { r.rkT = 0.25; rankHud(r); }
  }
  function rankEntries(r) {
    const out = [{ n: r.net ? prefs.name : 'You', c: '#ffffff', me: 1, pr: r.prog, fin: r.fin }];
    r.riv.forEach(v => out.push({ n: v.name, c: v.col, pr: v.bot.progress || 0, fin: v.fin }));
    if (r.peers) r.peers.forEach(p => out.push({ n: p.name, c: p.col, pr: p.pr || 0, fin: p.fin }));
    out.sort((a, b) => a.fin != null && b.fin != null ? a.fin - b.fin : a.fin != null ? -1 : b.fin != null ? 1 : b.pr - a.pr);
    return out;
  }
  function rankHud(r) {
    const h = rankEntries(r).map((e, i) => `<div class="${e.me ? 'me' : ''}" style="--c:${e.c}"><span>${i + 1}. ${esc(e.n)}</span><span>${e.fin != null ? fmtT(e.fin) : Math.round(e.pr * 100) + '%'}</span></div>`).join('');
    if (r.rh !== h) { r.rh = h; hk.rank.innerHTML = h; }
  }
  let EG = null, edGeos = {}, draftTm = 0;
  const CATCOL = { Road: '#9fb4ff', Curves: '#7ee0a8', Banked: '#5fd7ff', Slopes: '#ffb15f', Jumps: '#ff7b74', Loops: '#d28bff', Walls: '#ffe066', Gates: '#ffffff', Blocks: '#b0b8d0' };
  const edFrom = (id, name, season, pieces) => ({ id, name, season, pieces: pieces.map(p => p.slice()), undo: [], redo: [], sel: DEF.st.idx, erase: false, T: null, dirty: true, testing: false, mouse: null, mouseIn: false, occ: new Set(), cam: { t: [0, 0, 0], yaw: 0.7, pitch: 0.85, dist: 120 }, ready: false, hov: null, del: -1, cur: null });
  const edNew = () => edFrom(null, 'My Track', 0, [[DEF.sa.idx, 0, 0, 0, 0]]);
  function edCur() {
    const l = E.pieces[E.pieces.length - 1];
    if (!l) return { cx: 0, cz: 0, lv: 0, r: 0 };
    const e = exitOf(l);
    return { cx: e.cx, cz: e.cz, lv: Math.max(0, e.lv), r: e.dir };
  }
  let E = null;
  function pieceIcon(d) {
    const col = CATCOL[d.cat] || '#fff';
    if (d.custom) return `<svg viewBox="0 0 40 24"><path d="M8 9l12-5 12 5v9l-12 5-12-5z" fill="${col}" opacity=".85"/><path d="M8 9l12 5 12-5M20 14v9" stroke="#0c1230" fill="none" stroke-width="1.4"/></svg>`;
    const pts = [];
    for (let i = 0; i <= 16; i++) { const p = d.fn(i / 16); pts.push([p[0], p[2], p[1]]); }
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
    const w = Math.max(12, x1 - x0), h = Math.max(12, z1 - z0), sc = Math.min(32 / w, 18 / h), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const path = pts.map((p, i) => (i ? 'L' : 'M') + (20 + (p[0] - cx) * sc).toFixed(1) + ' ' + (12 + (p[1] - cz) * sc).toFixed(1)).join('');
    const up = pts[16][2] - pts[0][2];
    const arrow = Math.abs(up) > 1 ? `<path d="M34 ${up > 0 ? 8 : 16}l3 ${up > 0 ? -4 : 4}l3 ${up > 0 ? 4 : -4}z" fill="${col}"/>` : '';
    const mark = d.gate ? `<circle cx="20" cy="12" r="3" fill="${col}"/>` : '';
    return `<svg viewBox="0 0 40 24"><path d="${path}" fill="none" stroke="#0c1230" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${mark}${arrow}</svg>`;
  }
  function edBuildUi() {
    const pal = CATS.map(c => `<h4>${c}</h4><div class="pg">${PIECES.filter(d => d.cat === c).map(d => `<button class="pcb" data-a="e-pick" data-i="${d.idx}" title="${d.name}">${pieceIcon(d)}<span>${d.name}</span></button>`).join('')}</div>`).join('');
    edt.innerHTML = `<div class="edit-top"><button class="pt-b sm" data-a="e-menu">Menu</button><input type="text" data-k="ename" maxlength="30" aria-label="Track name"><button class="pt-b sm" data-a="e-season"></button><button class="pt-b sm" data-a="e-undo">Undo</button><button class="pt-b sm" data-a="e-redo">Redo</button><button class="pt-b sm" data-a="e-erase">Erase</button><button class="pt-b sm" data-a="e-rot">Rotate</button><button class="pt-b sm" data-a="e-lvm">Lv -</button><button class="pt-b sm" data-a="e-lvp">Lv +</button><button class="pt-b sm go" data-a="e-test">Test drive</button><button class="pt-b sm pri" data-a="e-save">Save</button><button class="pt-b sm" data-a="e-share">Share</button><button class="pt-b sm" data-a="imp">Import</button><button class="pt-b sm red" data-a="e-new">New</button></div><div class="edit-pal">${pal}</div><div class="edit-bot"><span data-k="estat"></span><span data-k="ehint" style="margin-left:auto;opacity:.7;font-weight:600"></span></div>`;
    const nm = edt.querySelector('input[data-k=ename]');
    nm.addEventListener('keydown', e => e.stopPropagation());
    nm.addEventListener('input', () => { E.name = nm.value.slice(0, 30); edDraft(); });
  }
  function edInit() {
    const TH = V.THREE;
    if (!edt.dataset.ready) { edBuildUi(); edt.dataset.ready = 1; }
    if (!EG) {
      const g = {};
      const N = 26, gp = [];
      for (let i = -N; i <= N + 1; i++) { const o = (i - 0.5) * CELL; gp.push(o, 0, -N * CELL - HALF, o, 0, (N + 1) * CELL - HALF, -N * CELL - HALF, 0, o, (N + 1) * CELL - HALF, 0, o); }
      const gg = view.own(new TH.BufferGeometry()); gg.setAttribute('position', new TH.Float32BufferAttribute(gp, 3));
      g.grid = new TH.LineSegments(gg, view.own(new TH.LineBasicMaterial({ color: 0x0b1030, transparent: true, opacity: 0.22, depthWrite: false })));
      const bx = view.own(new TH.EdgesGeometry(new TH.BoxGeometry(CELL, HU, CELL))); bx.translate(0, HU / 2, 0);
      g.box = new TH.LineSegments(bx, view.own(new TH.LineBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true })));
      g.box2 = new TH.LineSegments(bx, view.own(new TH.LineBasicMaterial({ color: 0x5fd7ff, depthTest: false, transparent: true, opacity: 0.8 })));
      const st = view.own(new TH.BufferGeometry()); st.setAttribute('position', new TH.Float32BufferAttribute([0, 0, 0, 0, -1, 0], 3));
      g.stem = new TH.LineSegments(st, view.own(new TH.LineBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.6 })));
      g.pm = new TH.Mesh(edGeo(0), view.own(new TH.MeshLambertMaterial({ color: 0x66ff99, emissive: 0x143a22, transparent: true, opacity: 0.62, depthWrite: false, side: TH.DoubleSide })));
      g.dm = new TH.Mesh(edGeo(0), view.own(new TH.MeshLambertMaterial({ color: 0xff4040, emissive: 0x501010, transparent: true, opacity: 0.7, depthWrite: false, side: TH.DoubleSide })));
      g.pm.renderOrder = 5; g.dm.renderOrder = 5; g.box.renderOrder = 6; g.box2.renderOrder = 6;
      g.rc = new TH.Raycaster(); g.v2 = new TH.Vector2();
      g.all = [g.grid, g.box, g.box2, g.stem, g.pm, g.dm];
      g.all.forEach(o => { o.frustumCulled = false; view.scene.add(o); });
      EG = g;
      edBind();
    }
  }
  function edGeo(i) {
    if (edGeos[i]) return edGeos[i];
    const m = localOf(PIECES[i]), g = view.own(new V.THREE.BufferGeometry());
    g.setAttribute('position', new V.THREE.BufferAttribute(m.p, 3)); g.computeVertexNormals();
    return (edGeos[i] = g);
  }
  const edHide = () => { if (EG) EG.all.forEach(o => { o.visible = false; }); };
  const edShow = () => { if (EG) { EG.grid.visible = true; } };
  function edLeave() { edt.hidden = true; edHide(); if (E) E.mouseIn = false; scenerySync(); }
  function scenerySync() { view.cam.up.set(0, 1, 0); }
  function openEditor(id) {
    if (S.mode !== 'edit') endRace();
    if (net) leaveNet();
    hideScr(); hud.hidden = true; finEl.hidden = true; setMsg('');
    S.mode = 'edit';
    if (id) { const c = P.custom.find(x => x.id === id), d = c && decodeTrack(c.code); if (d) E = edFrom(c.id, c.name || d.name, d.season, d.pieces); }
    if (!E) E = P.draft && P.draft.pieces ? edFrom(P.draft.id, P.draft.name, P.draft.season, P.draft.pieces) : edNew();
    edInit();
    E.testing = false; E.cur = edCur(); E.dirty = true; E.mouseIn = false;
    edt.hidden = false; edShow();
    edt.querySelector('input[data-k=ename]').value = E.name;
    view.cam.fov = 55; view.C.fov = 55; view.cam.updateProjectionMatrix(); view.C.init = false; view.C.pinit = false;
    view.clearSkids();
    audio.music(true); audio.drive(0, 0, 0, 0, 0, false);
    syncTouch();
  }
  function edDraft() { clearTimeout(draftTm); draftTm = setTimeout(() => { if (E) { P.draft = { id: E.id, name: E.name, season: E.season, pieces: E.pieces }; save(); } }, 400); }
  function edRebuild() {
    E.dirty = false;
    const tr = { name: E.name, season: E.season, pieces: E.pieces };
    E.T = compileTrack(tr, { physics: false });
    view.setTrack(E.T, true);
    E.occ = new Set(); E.pieces.forEach(pc => cellsOfPiece(pc).forEach(c => E.occ.add(ckey(c))));
    edDraft();
    const T = E.T, st = edt.querySelector('[data-k=estat]');
    const ok = T.ok && T.route && T.route.ok;
    st.innerHTML = `${E.pieces.length} pieces &middot; level ${E.cur.lv} &middot; ${ok ? `<span class="ok">Valid &middot; ${Math.round(T.route.total)} m &middot; ${T.cps.length} checkpoints</span>` : `<span class="bad">${esc(T.err || (T.route && !T.route.ok ? 'Start and finish are not connected' : 'Add a start and a finish'))}</span>`}`;
    edt.querySelector('[data-a=e-season]').textContent = SEASONS[E.season].name;
    edt.querySelector('[data-a=e-erase]').classList.toggle('on', E.erase);
    edt.querySelectorAll('.pcb').forEach(b => b.classList.toggle('on', +b.dataset.i === E.sel));
    edt.querySelector('[data-k=ehint]').textContent = COARSE ? 'Tap to place &middot; drag to orbit &middot; pinch to zoom'.replace(/&middot;/g, '|') : 'Click place | R rotate | Q/E level | X erase | drag orbit | right-drag pan | wheel zoom';
  }
  function edValid(pc) {
    const d = PIECES[pc[0]];
    if (pc[3] < 0 || pc[3] > 40 || pc[1] < -120 || pc[1] > 120 || pc[2] < -120 || pc[2] > 120) return 'Out of range';
    const e = exitOf(pc); if (e.lv < 0) return 'Too low';
    if (E.pieces.length >= 400) return 'Track too big';
    if (d.gate === 'start' && E.pieces.some(p => PIECES[p[0]].gate === 'start')) return 'Only one start';
    if (d.gate === 'fin' && E.pieces.some(p => PIECES[p[0]].gate === 'fin')) return 'Only one finish';
    for (const c of cellsOfPiece(pc)) if (E.occ.has(ckey(c))) return 'Space is taken';
    return '';
  }
  function edPush() { E.undo.push(E.pieces.map(p => p.slice())); if (E.undo.length > 120) E.undo.shift(); E.redo.length = 0; }
  function edPlace(cx, cz, lv, r) {
    const pc = [E.sel, cx, cz, lv, r & 3], bad = edValid(pc);
    if (bad) { audio.play('err'); toast(bad, 900, '#ff7b74'); return false; }
    edPush(); E.pieces.push(pc);
    const e = exitOf(pc); E.cur = { cx: e.cx, cz: e.cz, lv: e.lv, r: e.dir };
    E.dirty = true; audio.play('place');
    return true;
  }
  function edUndo() { if (!E.undo.length) return; E.redo.push(E.pieces); E.pieces = E.undo.pop(); E.cur = edCur(); E.dirty = true; audio.play('del'); }
  function edRedo() { if (!E.redo.length) return; E.undo.push(E.pieces); E.pieces = E.redo.pop(); E.cur = edCur(); E.dirty = true; audio.play('place'); }
  function edDelete(i) {
    if (i < 0 || i >= E.pieces.length) return;
    edPush(); E.pieces.splice(i, 1); E.cur = edCur(); E.dirty = true; audio.play('del');
  }
  function edTest() {
    const tr = { name: E.name, season: E.season, pieces: E.pieces.map(p => p.slice()) };
    const track = { id: '__test', name: E.name, label: 'Test', season: E.season, custom: true, tr, code: encodeTrack(tr), med: null };
    E.testing = true; edt.hidden = true; edHide();
    if (!startRace(track, { kind: 'test' })) { E.testing = false; edt.hidden = false; edShow(); S.mode = 'edit'; E.dirty = true; view.setTrack(E.T, true); }
  }
  function edSave() {
    const tr = { name: E.name, season: E.season, pieces: E.pieces }, code = encodeTrack(tr);
    const id = E.id || 'c' + Date.now().toString(36), e = P.custom.find(x => x.id === id);
    if (e) { e.name = E.name; e.code = code; } else P.custom.push({ id, name: E.name, code });
    E.id = id; edDraft(); save();
    toast('Saved to Custom tracks', 1400, '#35d684'); audio.play('cp');
  }
  function exportDialog(t, back) {
    panel(`<h2>Share track</h2><div class="sub" style="text-align:left;margin-bottom:.6em">Copy this code and send it. Anyone can paste it into Import.</div><textarea class="code" readonly data-k="code">${esc(t.code)}</textarea><div class="row" style="margin-top:.8em"><button class="pt-b pri" data-a="copy">Copy code</button><button class="pt-b" data-a="${back || 'closep'}">Close</button></div>`);
    const ta = scr.querySelector('textarea'); ta.addEventListener('keydown', e => e.stopPropagation()); setTimeout(() => ta.select(), 30);
  }
  function importDialog() {
    S.impFrom = S.mode;
    panel(`<h2>Import track</h2><div class="sub" style="text-align:left;margin-bottom:.6em">Paste one or more track codes (they start with PT).</div><textarea class="code" data-k="code" placeholder="PT..."></textarea><div class="row" style="margin-top:.8em"><button class="pt-b pri" data-a="doimp">Import</button><button class="pt-b" data-a="${S.mode === 'edit' ? 'closep' : 'play'}">Cancel</button></div>`);
    const ta = scr.querySelector('textarea'); ta.addEventListener('keydown', e => e.stopPropagation()); setTimeout(() => ta.focus(), 30);
  }
  function doImport() {
    const ta = scr.querySelector('textarea'), list = String(ta ? ta.value : '').split(/[\s,;]+/).filter(s => s.slice(0, 2) === 'PT');
    const dec = list.map(c => decodeTrack(c)).filter(Boolean);
    if (!dec.length) { toast(list.length ? 'That code is damaged' : 'No track code found', 1800, '#ff7b74'); audio.play('err'); return; }
    let first = null;
    dec.forEach(d => { const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); P.custom.push({ id, name: d.name || 'Imported', code: encodeTrack(d) }); first = first || id; });
    save(); audio.play('cp');
    toast(dec.length + (dec.length > 1 ? ' tracks imported' : ' track imported'), 1600, '#35d684');
    if (S.impFrom === 'edit') { hideScr(); openEditor(first); }
    else { S.tab = 3; S.sel = first; show('select'); }
  }
  function edClick(a, b, e) {
    switch (a) {
      case 'copy': { const ta = scr.querySelector('textarea'); if (ta) { ta.select(); const ok = () => toast('Code copied', 1200, '#35d684'); try { navigator.clipboard.writeText(ta.value).then(ok, () => { document.execCommand('copy'); ok(); }); } catch (x) { try { document.execCommand('copy'); ok(); } catch (y) {} } } return true; }
      case 'doimp': doImport(); return true;
    }
    if (a.slice(0, 2) !== 'e-' || !E) return false;
    switch (a) {
      case 'e-menu': goMenu(); break;
      case 'e-pick': E.sel = +b.dataset.i; E.erase = false; E.dirty = true; break;
      case 'e-season': edPush(); E.season = (E.season + 1) % 3; E.dirty = true; break;
      case 'e-undo': edUndo(); break;
      case 'e-redo': edRedo(); break;
      case 'e-erase': E.erase = !E.erase; E.dirty = true; break;
      case 'e-rot': E.cur.r = (E.cur.r + 1) & 3; break;
      case 'e-lvm': E.cur.lv = Math.max(0, E.cur.lv - 1); E.dirty = true; break;
      case 'e-lvp': E.cur.lv = Math.min(40, E.cur.lv + 1); E.dirty = true; break;
      case 'e-test': edTest(); break;
      case 'e-save': edSave(); break;
      case 'e-share': exportDialog({ name: E.name, code: encodeTrack({ name: E.name, season: E.season, pieces: E.pieces }) }); break;
      case 'e-new': panel(`<h2>New track?</h2><div class="sub">The current track is replaced. You can still undo it.</div><div class="row" style="margin-top:1em"><button class="pt-b red" data-a="e-new2">New track</button><button class="pt-b" data-a="closep">Cancel</button></div>`); break;
      case 'e-new2': edPush(); E.pieces = [[DEF.sa.idx, 0, 0, 0, 0]]; E.id = null; E.name = 'My Track'; edt.querySelector('input[data-k=ename]').value = E.name; E.cur = edCur(); E.dirty = true; E.cam.t = [0, 0, 0]; hideScr(); break;
      default: return false;
    }
    return true;
  }
  function edKey(e) {
    if (!E || E.testing || S.screen) return;
    const k = e.code, ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && k === 'KeyZ') { e.shiftKey ? edRedo() : edUndo(); e.preventDefault(); return; }
    if (ctrl && k === 'KeyY') { edRedo(); e.preventDefault(); return; }
    if (ctrl) return;
    switch (k) {
      case 'KeyR': E.cur.r = (E.cur.r + (e.shiftKey ? 3 : 1)) & 3; break;
      case 'KeyQ': case 'PageDown': E.cur.lv = Math.max(0, E.cur.lv - 1); E.dirty = true; break;
      case 'KeyE': case 'PageUp': E.cur.lv = Math.min(40, E.cur.lv + 1); E.dirty = true; break;
      case 'KeyX': E.erase = !E.erase; E.dirty = true; break;
      case 'Delete': case 'Backspace': edDelete(E.del >= 0 ? E.del : E.pieces.length - 1); break;
      case 'Enter': case 'Space': if (!E.erase) edPlace(E.cur.cx, E.cur.cz, E.cur.lv, E.cur.r); break;
      case 'KeyT': edTest(); break;
      case 'BracketLeft': case 'BracketRight': { const n = PIECES.length, d = k === 'BracketLeft' ? -1 : 1; E.sel = (E.sel + d + n) % n; E.erase = false; E.dirty = true; break; }
    }
  }
  function edRay() {
    if (!E.mouse) return null;
    const rc = EG.rc; EG.v2.set(E.mouse[0], E.mouse[1]); rc.setFromCamera(EG.v2, view.cam);
    return rc.ray;
  }
  function edHover() {
    E.hov = null; E.del = -1;
    if (!E.mouseIn) return;
    const ray = edRay(); if (!ray) return;
    const o = ray.origin, d = ray.direction;
    if (E.erase) {
      let bt = 1e9, bi = -1;
      for (let i = 0; i < E.pieces.length; i++) {
        for (const c of cellsOfPiece(E.pieces[i])) {
          const lo = [c[0] * CELL - HALF, c[1] * HU, c[2] * CELL - HALF], hi = [c[0] * CELL + HALF, c[1] * HU + HU + 8, c[2] * CELL + HALF];
          let t0 = 0, t1 = 1e9, ok = true;
          const oo = [o.x, o.y, o.z], dd = [d.x, d.y, d.z];
          for (let k = 0; k < 3; k++) {
            if (Math.abs(dd[k]) < 1e-9) { if (oo[k] < lo[k] || oo[k] > hi[k]) { ok = false; break; } }
            else { let a = (lo[k] - oo[k]) / dd[k], b = (hi[k] - oo[k]) / dd[k]; if (a > b) { const t = a; a = b; b = t; } t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) { ok = false; break; } }
          }
          if (ok && t0 < bt) { bt = t0; bi = i; }
        }
      }
      E.del = bi;
      return;
    }
    const y0 = E.cur.lv * HU;
    if (d.y > -1e-4) return;
    const t = (y0 - o.y) / d.y; if (t < 0) return;
    E.hov = { cx: Math.round((o.x + d.x * t) / CELL), cz: Math.round((o.z + d.z * t) / CELL) };
  }
  function edFrame(dt) {
    if (!E || E.testing) return;
    const cm = E.cam, cam = view.cam;
    const ae = document.activeElement, typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
    if (!typing && !S.screen) {
      const sp = cm.dist * 0.9 * dt * (KEYS.has('ShiftLeft') ? 2.2 : 1), fx = -Math.sin(cm.yaw), fz = -Math.cos(cm.yaw), rx = Math.cos(cm.yaw), rz = -Math.sin(cm.yaw);
      const f = (kd('KeyW') || kd('ArrowUp') ? 1 : 0) - (kd('KeyS') || kd('ArrowDown') ? 1 : 0), r = (kd('KeyD') || kd('ArrowRight') ? 1 : 0) - (kd('KeyA') || kd('ArrowLeft') ? 1 : 0);
      cm.t[0] += (fx * f + rx * r) * sp; cm.t[2] += (fz * f + rz * r) * sp;
      if (kd('KeyF')) { const c = E.cur; cm.t[0] += (c.cx * CELL - cm.t[0]) * Math.min(1, dt * 6); cm.t[2] += (c.cz * CELL - cm.t[2]) * Math.min(1, dt * 6); cm.t[1] += (c.lv * HU - cm.t[1]) * Math.min(1, dt * 6); }
    }
    if (E.dirty) edRebuild();
    const cp = Math.cos(cm.pitch);
    cam.position.set(cm.t[0] + cm.dist * cp * Math.sin(cm.yaw), cm.t[1] + cm.dist * Math.sin(cm.pitch), cm.t[2] + cm.dist * cp * Math.cos(cm.yaw));
    cam.up.set(0, 1, 0); cam.lookAt(cm.t[0], cm.t[1], cm.t[2]); cam.updateMatrixWorld();
    view.followLight(cm.t);
    edHover();
    const g = EG, c = E.cur, d = PIECES[E.sel];
    g.grid.visible = true; g.grid.position.set(Math.round(cm.t[0] / CELL) * CELL, GY + 0.06, Math.round(cm.t[2] / CELL) * CELL);
    const hv = E.hov, at = hv || { cx: c.cx, cz: c.cz };
    g.pm.visible = !E.erase; g.dm.visible = E.del >= 0;
    if (!E.erase) {
      const pc = [E.sel, at.cx, at.cz, c.lv, c.r], bad = edValid(pc);
      if (g.pm.geometry !== edGeo(E.sel)) g.pm.geometry = edGeo(E.sel);
      g.pm.position.set(at.cx * CELL, c.lv * HU, at.cz * CELL); g.pm.rotation.y = -c.r * PI / 2;
      g.pm.material.color.set(bad ? 0xff5a5a : 0x66ff99); g.pm.material.emissive.set(bad ? 0x501414 : 0x143a22);
      g.box.visible = true; g.box.position.set(at.cx * CELL, c.lv * HU, at.cz * CELL);
      g.stem.visible = c.lv > 0; g.stem.position.set(at.cx * CELL, c.lv * HU, at.cz * CELL); g.stem.scale.y = c.lv * HU;
      g.box2.visible = !!hv && (hv.cx !== c.cx || hv.cz !== c.cz); g.box2.position.set(c.cx * CELL, c.lv * HU, c.cz * CELL);
    } else {
      g.box.visible = false; g.box2.visible = false; g.stem.visible = false;
      if (E.del >= 0) { const p = E.pieces[E.del]; if (g.dm.geometry !== edGeo(p[0])) g.dm.geometry = edGeo(p[0]); g.dm.position.set(p[1] * CELL, p[3] * HU, p[2] * CELL); g.dm.rotation.y = -p[4] * PI / 2; }
    }
  }
  let edBound = false;
  function edBind() {
    if (edBound) return; edBound = true;
    const ptr = new Map();
    const ndc = e => { const r = canvas.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1]; };
    const live = () => S.mode === 'edit' && E && !E.testing && !S.screen;
    canvas.addEventListener('contextmenu', e => { if (S.mode === 'edit') e.preventDefault(); });
    canvas.addEventListener('pointerdown', e => {
      if (!live()) return;
      audio.wake(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, moved: 0, btn: e.button, shift: e.shiftKey });
      E.mouse = ndc(e); E.mouseIn = true;
    });
    canvas.addEventListener('pointermove', e => {
      if (!live()) return;
      if (e.pointerType === 'mouse' || ptr.size) { E.mouse = ndc(e); E.mouseIn = true; }
      const p = ptr.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y, cm = E.cam, hh = canvas.clientHeight || 400;
      if (ptr.size >= 2) {
        const o = [...ptr.entries()].find(([k]) => k !== e.pointerId)[1], d0 = Math.hypot(p.x - o.x, p.y - o.y), d1 = Math.hypot(e.clientX - o.x, e.clientY - o.y);
        if (d0 > 8) cm.dist = clamp(cm.dist * d0 / Math.max(8, d1), 25, 700);
        p.moved += 99;
        const k = cm.dist / hh * 1.2;
        cm.t[0] -= (Math.cos(cm.yaw) * dx / 2) * k; cm.t[2] -= (-Math.sin(cm.yaw) * dx / 2) * k;
        cm.t[0] += (-Math.sin(cm.yaw) * dy / 2) * k; cm.t[2] += (-Math.cos(cm.yaw) * dy / 2) * k;
      } else {
        p.moved += Math.abs(dx) + Math.abs(dy);
        if (p.moved >= 6) {
          if (p.btn === 2 || p.shift) {
            const k = cm.dist / hh * 1.2;
            cm.t[0] -= Math.cos(cm.yaw) * dx * k; cm.t[2] += Math.sin(cm.yaw) * dx * k;
            cm.t[0] += -Math.sin(cm.yaw) * dy * k; cm.t[2] += -Math.cos(cm.yaw) * dy * k;
          } else { cm.yaw -= dx * 0.006; cm.pitch = clamp(cm.pitch + dy * 0.006, 0.12, 1.5); }
        }
      }
      p.x = e.clientX; p.y = e.clientY;
    });
    const up = e => {
      const p = ptr.get(e.pointerId); if (!p) return;
      const n = ptr.size; ptr.delete(e.pointerId);
      if (!live() || e.type === 'pointercancel') return;
      if (n === 1 && p.moved < 6 && p.btn === 0 && !p.shift) {
        E.mouse = ndc(e); E.mouseIn = true; edHover();
        if (E.erase) { if (E.del >= 0) edDelete(E.del); }
        else if (E.hov) edPlace(E.hov.cx, E.hov.cz, E.cur.lv, E.cur.r);
      }
      if (e.pointerType !== 'mouse') E.mouseIn = false;
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && E) E.mouseIn = false; });
    canvas.addEventListener('wheel', e => {
      if (!live()) return; e.preventDefault();
      if (e.shiftKey) { E.cur.lv = clamp(E.cur.lv + (e.deltaY < 0 ? 1 : -1), 0, 40); E.dirty = true; }
      else E.cam.dist = clamp(E.cam.dist * Math.exp(e.deltaY * 0.0012), 25, 700);
    }, { passive: false });
  }
  let netHooked = false;
  const meId = () => api.net.id;
  function leaveNet() {
    if (net) { clearTimeout(net.tm); try { api.net.close(); } catch (e) {} }
    net = null;
  }
  function goOnline() {
    if (!api.net) { toast('Online is not available here', 2000, '#ff7b74'); return; }
    if (S.mode === 'edit') edLeave();
    clearTimeout(net && net.tm);
    S.mode = 'menu';
    if (!R || R.kind !== 'demo') { endRace(); startDemo(); }
    S.mode = 'net'; hideScr(); audio.music(true);
    if (!netHooked) hookNet();
    net = null;
    api.net.room({ title: 'PolyTrack', sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 8, min: 2, max: 8, bots: true }).then(r => {
      if (!api.alive) return;
      if (!r) { if (S.mode === 'net') goMenu(); return; }
      net = { role: r.role, players: r.players.slice(), bots: !!r.bots, size: +r.size || r.players.length, rd: 0, fin: {}, roster: [], st: 'wait', track: null, first: 0, msg: null, tm: 0 };
      if (r.role === 'host') hubPick();
      else panel('<h2>Online</h2><div class="sub">Connected. Waiting for the host to pick a track.</div><div class="row" style="margin-top:1em"><button class="pt-b red" data-a="n-leave">Leave</button></div>');
    });
  }
  function hubPick() {
    if (!net) return;
    net.st = 'pick'; S.mode = 'net';
    if (R && R.kind === 'online') endRace();
    if (!R) startDemo();
    api.net.send({ t: 'pick' });
    show('select');
  }
  function hubStart(track) {
    const n = net; if (!n) return;
    let T; try { T = compiled(track); } catch (e) { T = null; }
    if (!T || !T.ok) { toast('This track cannot be raced', 2000, '#ff7b74'); return; }
    n.rd++; n.fin = {}; n.st = 'race'; n.first = 0; clearTimeout(n.tm);
    const ro = n.players.map((p, i) => ({ id: p.id, name: p.name, ci: i }));
    if (n.bots) { const nb = Math.max(0, Math.min(7, n.size - ro.length)); for (let k = 0; k < nb; k++) ro.push({ id: 'b' + k, name: RIVALS[k][0], ci: ro.length, bot: 1, skill: SKILL[k + 1] }); }
    const code = track.code || encodeTrack({ name: track.name, season: track.season, pieces: track.tr.pieces });
    n.msg = { t: 'trk', rd: n.rd, id: track.id, name: track.name, label: track.label, season: track.season, code, med: track.med, ro: ro.map(x => [x.id, x.name, x.ci, x.bot ? 1 : 0, x.skill || 0]) };
    api.net.send(n.msg);
    beginOnline(track, ro, n.rd, true, false);
  }
  function beginOnline(track, ro, rd, hub, late) {
    const n = net; if (!n) return;
    n.st = 'race'; n.track = track; n.rd = rd; n.roster = ro; if (!late) n.fin = {};
    if (!startRace(track, { kind: 'online', cd: late ? 0.25 : hub ? 3.4 : 3.2, ghost: 0 })) { toast('Track error', 2000, '#ff7b74'); leaveNet(); goMenu(); return; }
    S.mode = 'race';
    const r = R; r.peers = new Map();
    const me = meId();
    ro.forEach(x => {
      if (x.id === me) return;
      const col = NETCOL[x.ci % 8];
      if (hub && x.bot) { const v = addRival(r, x.name, col, x.skill || 0.9); v.id = x.id; return; }
      const pe = { id: x.id, name: x.name, col, bot: !!x.bot, m: view.mkCar(col, '#f4f4f8', true, x.name, col), tp: null, tv: [0, 0, 0], tq: [0, 0, 0, 1], p: r.T.start.p.slice(), q: r.T.start.q.slice(), pr: 0, fin: null, spd: 0, ts: 0, sp: [0, 0, 0, 0], spin: 0, raw: null };
      pe.m.set(pe.p, pe.q, 0, null, null); r.peers.set(x.id, pe);
    });
    r.net = { go() {}, botFin(v) { if (net && net.role === 'host') { net.fin[v.id] = v.fin; syncFins(); hubTally(); } } };
    hk.rank.hidden = false;
  }
  function syncFins() {
    const r = R, n = net; if (!r || !n || !r.peers) return;
    r.peers.forEach(pe => { pe.fin = n.fin[pe.id] != null ? n.fin[pe.id] : null; });
  }
  function onlineFinished(ms, info) {
    const n = net; if (!n) return;
    info.title = 'Finish!';
    const pos = 1 + Object.keys(n.fin).filter(k => k !== meId() && n.fin[k] < ms).length;
    info.sub = `<b>Position ${pos}</b> Waiting for the others`;
    n.fin[meId()] = ms;
    if (n.role === 'host') { syncFins(); hubTally(); } else api.net.send({ t: 'fin', rd: n.rd, ms });
  }
  function hubTally() {
    const n = net; if (!n || n.role !== 'host' || n.st !== 'race') return;
    api.net.send({ t: 'rs', rd: n.rd, f: n.fin });
    if (n.roster.every(x => n.fin[x.id] != null || x.gone)) { hubEnd(); return; }
    if (!n.first) {
      n.first = Date.now();
      const w = Math.min(...Object.values(n.fin));
      n.tm = setTimeout(hubEnd, Math.max(20000, w * 0.8));
    }
  }
  function hubEnd() {
    const n = net; if (!n || n.st !== 'race') return;
    clearTimeout(n.tm); n.st = 'results';
    api.net.send({ t: 'end', rd: n.rd, f: n.fin, ro: n.msg.ro, tn: n.track.name });
    showResults();
  }
  function showResults() {
    const n = net; if (!n) return;
    const me = meId(), hub = n.role === 'host';
    const rows = n.roster.map(x => ({ x, t: n.fin[x.id] })).sort((a, b) => a.t != null && b.t != null ? a.t - b.t : a.t != null ? -1 : b.t != null ? 1 : a.x.ci - b.x.ci);
    finEl.hidden = true;
    panel(`<h2>Results</h2><div class="sub" style="margin-bottom:.6em">${esc(n.track ? n.track.name : n.tn || '')}</div>${rows.map((r, i) => `<div class="pl-row"><span><i style="background:${NETCOL[r.x.ci % 8]}"></i>${i + 1}. ${esc(r.x.name)}${r.x.id === me ? ' (you)' : ''}${r.x.bot ? ' <small style="opacity:.6">AI</small>' : ''}</span><b>${r.t != null ? fmtT(r.t) : 'DNF'}</b></div>`).join('')}<div class="row" style="margin-top:1em">${hub ? '<button class="pt-b go" data-a="n-again">Race again</button><button class="pt-b pri" data-a="n-new">New track</button><button class="pt-b" data-a="n-lobby">Lobby</button>' : '<span class="sub">Waiting for the host...</span>'}<button class="pt-b red" data-a="n-leave">Leave</button></div>`);
  }
  function netClick(a) {
    switch (a) {
      case 'nstart': hubStart(trackById(S.sel)); return true;
      case 'nlobby': case 'n-lobby': endRace(); goOnline(); return true;
      case 'n-again': if (net && net.track) hubStart(net.track); return true;
      case 'n-new': endRace(); hubPick(); return true;
      case 'n-leave': leaveNet(); goMenu(); return true;
    }
    return false;
  }
  const pose = r => { const c = r.car, f = (v, k) => +v.toFixed(k); return [meId(), f(c.p[0], 2), f(c.p[1], 2), f(c.p[2], 2), f(c.q[0], 3), f(c.q[1], 3), f(c.q[2], 3), f(c.q[3], 3), f(len3(c.v), 1), f(r.prog, 3), r.nextCp]; };
  function applyPose(r, a) {
    const pe = r.peers.get(a[0]); if (!pe) return;
    const now = performance.now(), p = [a[1], a[2], a[3]];
    if (pe.tp) {
      const dt = (now - pe.ts) / 1000;
      if (dt > 0.004 && dt < 0.6) { const k = 0.5; pe.tv = [lerp(pe.tv[0], (p[0] - pe.tp[0]) / dt, k), lerp(pe.tv[1], (p[1] - pe.tp[1]) / dt, k), lerp(pe.tv[2], (p[2] - pe.tp[2]) / dt, k)]; }
      else if (dt >= 0.6) { pe.tv = [0, 0, 0]; pe.p = p.slice(); }
    }
    pe.tp = p; pe.tq = [a[4], a[5], a[6], a[7]]; pe.ts = now; pe.spd = a[8]; pe.pr = a[9];
  }
  function drawPeers(r, dt) {
    const now = performance.now();
    r.peers.forEach(pe => {
      if (pe.tp) {
        const age = Math.min(0.12, (now - pe.ts) / 1000), g = [pe.tp[0] + pe.tv[0] * age, pe.tp[1] + pe.tv[1] * age, pe.tp[2] + pe.tv[2] * age], k = Math.min(1, dt * 14);
        if (Math.hypot(g[0] - pe.p[0], g[1] - pe.p[1], g[2] - pe.p[2]) > 25) pe.p = g.slice();
        else { pe.p[0] += (g[0] - pe.p[0]) * k; pe.p[1] += (g[1] - pe.p[1]) * k; pe.p[2] += (g[2] - pe.p[2]) * k; }
        pe.q = qSlerp(pe.q, pe.tq, k);
        pe.spin += pe.spd / 0.45 * dt; pe.sp.fill(pe.spin);
        pe.m.set(pe.p, pe.q, 0, pe.sp, null);
      }
      pe.m.g.visible = true;
    });
    if (net && net.role === 'host') r.riv.forEach(v => { v.m.g.visible = true; });
  }
  function onData(d, from) {
    const n = net; if (!d || !n) return;
    if (n.role === 'host') {
      if (d.t === 'p' && d.rd === n.rd && R && R.peers) { const pe = R.peers.get(from); if (pe) { d.a[0] = from; applyPose(R, d.a); pe.raw = d.a; } }
      else if (d.t === 'fin' && d.rd === n.rd && n.st === 'race') { if (n.fin[from] == null && +d.ms > 0) { n.fin[from] = +d.ms; syncFins(); hubTally(); } }
      return;
    }
    switch (d.t) {
      case 'trk': {
        if (d.rd < n.rd) return;
        const dec = decodeTrack(d.code); if (!dec) return;
        const track = { id: d.id, name: d.name, label: d.label || 'Online', season: dec.season, custom: true, tr: { name: dec.name, season: dec.season, pieces: dec.pieces }, code: d.code, med: d.med || null };
        track.custom = String(d.id)[0] === 'c' || d.id === '__test';
        const ro = d.ro.map(x => ({ id: x[0], name: x[1], ci: x[2], bot: x[3], skill: x[4] }));
        beginOnline(track, ro, d.rd, false, !!d.late);
        break;
      }
      case 'pick': if (n.st !== 'pick') { n.st = 'pick'; if (R && R.kind === 'online') endRace(); S.mode = 'net'; if (!R) startDemo(); panel('<h2>Online</h2><div class="sub">The host is picking a track.</div><div class="row" style="margin-top:1em"><button class="pt-b red" data-a="n-leave">Leave</button></div>'); } break;
      case 'ps': if (d.rd === n.rd && R && R.peers) { const me = meId(); for (const a of d.a) if (a[0] !== me) applyPose(R, a); } break;
      case 'rs': if (d.rd === n.rd) { n.fin = d.f; syncFins(); } break;
      case 'end': if (d.rd >= n.rd) { n.rd = d.rd; n.fin = d.f; if (!n.roster.length || !n.track) n.roster = d.ro.map(x => ({ id: x[0], name: x[1], ci: x[2], bot: x[3] })); n.tn = d.tn; n.st = 'results'; syncFins(); showResults(); } break;
    }
  }
  function hookNet() {
    netHooked = true;
    api.net.on('data', onData);
    api.net.on('leave', pl => {
      const n = net; if (!n || n.role !== 'host' || !pl) return;
      n.players = n.players.filter(p => p.id !== pl.id);
      const x = n.roster.find(q => q.id === pl.id);
      if (x) { x.gone = 1; toast((pl.name || 'A player') + ' left', 1600); }
      if (R && R.peers && R.peers.has(pl.id)) { const pe = R.peers.get(pl.id); pe.m.dispose(); R.peers.delete(pl.id); }
      if (n.st === 'race') hubTally();
    });
    api.net.on('rejoin', pl => {
      const n = net; if (!n || n.role !== 'host' || !pl) return;
      if (n.st === 'race' && n.msg) { api.net.sendTo(pl.id, Object.assign({}, n.msg, { late: 1 })); api.net.sendTo(pl.id, { t: 'rs', rd: n.rd, f: n.fin }); }
      else if (n.st === 'results' && n.msg) api.net.sendTo(pl.id, { t: 'end', rd: n.rd, f: n.fin, ro: n.msg.ro, tn: n.track.name });
      else if (n.st === 'pick') api.net.sendTo(pl.id, { t: 'pick' });
    });
    api.net.on('lobby', () => { if (net && net.role === 'guest') { endRace(); goOnline(); } });
    api.net.on('close', why => {
      if (!net) return;
      clearTimeout(net.tm); net = null;
      endRace(); S.mode = 'menu';
      panel(`<h2>${why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'}</h2><div class="sub">The online race has ended.</div><div class="row" style="margin-top:1em"><button class="pt-b pri" data-a="menu">Menu</button></div>`);
      startDemo();
    });
    api.interval(() => {
      const n = net; if (!n || !R || R.kind !== 'online' || R.st === 'count' || !R.peers) return;
      if (n.role === 'guest') api.net.send({ t: 'p', rd: n.rd, a: pose(R) }, true);
    }, 33);
    api.interval(() => {
      const n = net; if (!n || n.role !== 'host' || !R || R.kind !== 'online' || !R.peers || R.st === 'count') return;
      const a = [pose(R)];
      R.peers.forEach(pe => { if (pe.raw) a.push(pe.raw); });
      R.riv.forEach(v => { const c = v.car, f = (x, k) => +x.toFixed(k); a.push([v.id, f(c.p[0], 2), f(c.p[1], 2), f(c.p[2], 2), f(c.q[0], 3), f(c.q[1], 3), f(c.q[2], 3), f(c.q[3], 3), f(len3(c.v), 1), f(v.bot.progress || 0, 3), 0]); });
      api.net.send({ t: 'ps', rd: n.rd, a }, true);
    }, 50);
  }
  api.loop(dt => {
    view.clouds();
    if (S.mode === 'edit' && E && !E.testing) edFrame(dt);
    else if (R) { stepRace(dt); drawRace(dt); }
    view.render();
  });
  api.on(window, 'blur', () => { pressed.up = pressed.dn = pressed.lf = pressed.rt = 0; });
  api.on(document, 'visibilitychange', () => { if (document.hidden) audio.drive(0, 0, 0, 0, 0, false); });
  if (api.net && api.net.invite) goOnline();
  else { S.mode = 'menu'; startDemo(); show('menu'); applyPrefs(); }
  return () => {
    clearTimeout(saveT); api.save(P);
    if (net) leaveNet();
    endRace(); audio.close(); view.dispose();
  };
}

Ameplay.register({
  id: ID, title: 'PolyTrack', category: '3D', tint: '#4b8de8',
  blurb: 'Low-poly time-trial racer: drift through loops and wall rides, chase gold and your ghost, build tracks and race up to 8 online.',
  help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows drive · <kbd>Space</kbd> handbrake · <kbd>R</kbd> back to checkpoint · <kbd>Enter</kbd> restart · <kbd>C</kbd> camera · <kbd>G</kbd> ghost · Editor: click place, <kbd>R</kbd> rotate, <kbd>Q</kbd>/<kbd>E</kbd> level, <kbd>X</kbd> erase, drag orbit · touch: pedals left, steering right',
  better: 'high', width: 960,
  format: v => v + ' pts',
  icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 52C8 38 22 36 28 30S34 14 46 12"/><path d="M14 56c0-12 12-14 18-20s6-18 20-22" opacity=".45"/><path d="M44 8v14M44 8h12l-3 4 3 4H44"/><circle cx="14" cy="50" r="3"/></svg>',
  css: CSS,
  mount(root, api) {
    const wrap = document.createElement('div'); wrap.className = 'stage'; root.append(wrap);
    let cleanup = null;
    const narrow = root.clientWidth && root.clientWidth < 560;
    api.gl(narrow ? 600 : 960, narrow ? 900 : 600).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v); });
    return { destroy() { if (cleanup) cleanup(); } };
  }
});

Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ptc-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7fe0"/><stop offset=".6" stop-color="#9fd0ff"/><stop offset="1" stop-color="#e3f1ff"/></linearGradient><linearGradient id="ptc-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c7389"/><stop offset="1" stop-color="#454b62"/></linearGradient></defs><rect width="400" height="300" fill="url(#ptc-s)"/><path d="M0 168l60-52 50 34 70-66 90 80 60-40 70 56v120H0z" fill="#6fb066"/><path d="M0 200l80-34 70 24 90-44 160 60v94H0z" fill="#4c9250"/><g fill="#2f6a4c"><path d="M40 196l10-26 10 26zM72 204l8-22 8 22zM330 188l10-26 10 26z"/></g><path d="M-10 296C70 240 120 250 190 226S300 196 420 150L430 190C330 232 270 250 190 276S60 300 -10 330z" fill="url(#ptc-r)"/><path d="M-6 304C70 250 124 260 194 236S304 206 424 160" fill="none" stroke="#ffd23a" stroke-width="3" stroke-dasharray="18 14"/><path d="M-10 296C70 240 120 250 190 226S300 196 420 150" fill="none" stroke="#d63a3a" stroke-width="5"/><g transform="translate(222 190) rotate(-14)"><ellipse cx="0" cy="26" rx="46" ry="8" fill="#000" opacity=".25"/><path d="M-44 14l12-18h46l22 8 10 10z" fill="#f2c230"/><path d="M-12-14h26l8 14h-40z" fill="#1b2658"/><rect x="-46" y="-18" width="8" height="28" fill="#e5322d"/><rect x="-52" y="-22" width="32" height="6" fill="#d63a3a"/><circle cx="-26" cy="20" r="11" fill="#16161d"/><circle cx="-26" cy="20" r="5" fill="#dcdce6"/><circle cx="28" cy="20" r="11" fill="#16161d"/><circle cx="28" cy="20" r="5" fill="#dcdce6"/></g><g transform="translate(52 40)"><path d="M0 0v54" stroke="#f4f4f8" stroke-width="5"/><path d="M0 2h42l-10 12 10 12H0z" fill="#ffd23a"/></g><text x="200" y="64" text-anchor="middle" font-family="Trebuchet MS,Segoe UI,Arial" font-weight="900" font-style="italic" font-size="52" fill="#0d1540" stroke="#0d1540" stroke-width="9" stroke-linejoin="round">POLYTRACK</text><text x="200" y="64" text-anchor="middle" font-family="Trebuchet MS,Segoe UI,Arial" font-weight="900" font-style="italic" font-size="52" fill="#f2fbff" stroke="#4b6fe0" stroke-width="1.5" stroke-linejoin="round">POLYTRACK</text></svg>`;
})();
