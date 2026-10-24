(() => {
  'use strict';
const ID = 'among-us';
const PR = 0.27;
const MW = 96, MH = 58;
const TAU = Math.PI * 2;
const COLORS = [
  ['Red', '#c51111', '#7a0838'], ['Blue', '#132ed1', '#09158e'], ['Green', '#117f2d', '#0a4d2e'], ['Pink', '#ed54ba', '#ab2bad'],
  ['Orange', '#ef7d0d', '#b33e15'], ['Yellow', '#f5f557', '#c38823'], ['Black', '#3f474e', '#1e1f26'], ['White', '#d6e0f0', '#8394bf'],
  ['Purple', '#6b2fbb', '#3b177c'], ['Brown', '#71491e', '#5e2615'], ['Cyan', '#38fedc', '#24a8be'], ['Lime', '#50ef39', '#15a742'],
  ['Maroon', '#7a2038', '#4a1226'], ['Rose', '#ecc0d3', '#b78aa6'], ['Tan', '#a39580', '#6a604f']
];
const BOT_NAMES = ['Nova', 'Orbit', 'Pixel', 'Comet', 'Zed', 'Luna', 'Rex', 'Echo', 'Miko', 'Juno', 'Kai', 'Sol', 'Vega', 'Tali', 'Bolt'];
const DEF = { imp: 1, speed: 1, cvis: 1, ivis: 1.5, kcd: 30, krange: 1, common: 1, long: 1, short: 2, disc: 15, vote: 60, emerg: 1, ecd: 15, confirm: 1, anon: 0, bar: 0, vtasks: 1 };
const sec = v => v + 's', xx = v => v + 'x';
const SPEC = [
  ['imp', 'Impostors', [1, 2, 3], null],
  ['speed', 'Player speed', [.5, .75, 1, 1.25, 1.5, 2], xx],
  ['cvis', 'Crewmate vision', [.25, .5, .75, 1, 1.25, 1.5, 2], xx],
  ['ivis', 'Impostor vision', [.5, .75, 1, 1.25, 1.5, 2, 2.5], xx],
  ['kcd', 'Kill cooldown', [10, 15, 20, 25, 30, 35, 40, 45, 60], sec],
  ['krange', 'Kill distance', [0, 1, 2], v => ['Short', 'Normal', 'Long'][v]],
  ['common', 'Common tasks', [0, 1, 2], null],
  ['long', 'Long tasks', [0, 1, 2, 3], null],
  ['short', 'Short tasks', [0, 1, 2, 3, 4, 5], null],
  ['disc', 'Discussion time', [0, 15, 30, 45, 60, 90], sec],
  ['vote', 'Voting time', [15, 30, 45, 60, 90, 120], sec],
  ['emerg', 'Emergency meetings', [0, 1, 2, 3, 5, 9], null],
  ['ecd', 'Emergency cooldown', [0, 5, 10, 15, 20, 30], sec],
  ['confirm', 'Confirm ejects', [0, 1], v => v ? 'On' : 'Off'],
  ['anon', 'Anonymous votes', [0, 1], v => v ? 'On' : 'Off'],
  ['bar', 'Task bar updates', [0, 1, 2], v => ['Always', 'Meetings', 'Never'][v]],
  ['vtasks', 'Visual tasks', [0, 1], v => v ? 'On' : 'Off']
];
const KRANGE = [1.3, 2.0, 3.0];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
const q2 = v => Math.round(v * 100) / 100;
const cleanName = s => String(s == null ? '' : s).replace(/[<>&"']/g, '').slice(0, 16);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fixSettings = o => {
  const r = Object.assign({}, DEF);
  SPEC.forEach(([k, , opts]) => { if (o && o[k] != null && opts.includes(+o[k])) r[k] = +o[k]; });
  return r;
};
const maxImp = n => n >= 9 ? 3 : n >= 7 ? 2 : 1;

const ROOMS = [
  { n: 'Cafeteria', x: 37, y: 3, w: 22, h: 15, a: '#aab6d0', b: '#9ea9c4', t: '#7a86a6' },
  { n: 'Weapons', x: 66, y: 5, w: 12, h: 10, a: '#7d869b', b: '#737c91', t: '#5b647a' },
  { n: 'O2', x: 61, y: 19, w: 8, h: 8, a: '#8aa89a', b: '#7f9c8e', t: '#5f8070' },
  { n: 'Navigation', x: 82, y: 19, w: 12, h: 11, a: '#7388b4', b: '#687da9', t: '#506493' },
  { n: 'Shields', x: 68, y: 38, w: 12, h: 11, a: '#8c7fb2', b: '#8174a8', t: '#65588f' },
  { n: 'Communications', x: 54, y: 46, w: 10, h: 9, a: '#6c8f9a', b: '#628590', t: '#4a6d78' },
  { n: 'Storage', x: 38, y: 42, w: 13, h: 12, a: '#9b8c76', b: '#908169', t: '#75684f' },
  { n: 'Admin', x: 52, y: 27, w: 11, h: 10, a: '#8ba37f', b: '#809876', t: '#627a58' },
  { n: 'Electrical', x: 22, y: 35, w: 12, h: 10, a: '#a39a6e', b: '#988f64', t: '#7b7249' },
  { n: 'Lower Engine', x: 5, y: 40, w: 14, h: 12, a: '#b08c74', b: '#a5806a', t: '#86624c' },
  { n: 'Upper Engine', x: 5, y: 4, w: 14, h: 12, a: '#b08c74', b: '#a5806a', t: '#86624c' },
  { n: 'Security', x: 21, y: 24, w: 10, h: 8, a: '#76809c', b: '#6b7591', t: '#515b78' },
  { n: 'Reactor', x: 2, y: 22, w: 11, h: 12, a: '#a97c80', b: '#9e7175', t: '#80555a' },
  { n: 'MedBay', x: 22, y: 13, w: 11, h: 8, a: '#8dbab8', b: '#82afad', t: '#5f908e' }
];
const CORR = [
  [19, 8, 18, 3], [26, 11, 3, 2], [15, 16, 3, 24], [7, 16, 3, 6], [7, 34, 3, 6], [13, 27, 2, 3], [18, 26, 3, 3], [18, 15, 4, 3],
  [19, 41, 3, 3], [34, 42, 4, 3], [43, 18, 4, 24], [47, 30, 5, 3], [47, 21, 14, 3], [59, 9, 7, 3], [65, 15, 3, 4],
  [78, 9, 8, 3], [83, 12, 3, 7], [88, 30, 3, 14], [80, 41, 11, 3], [64, 46, 4, 3], [51, 48, 3, 3]
];
const OBS = [
  [47, 10, 2, 2, 0, 'btn'], [40, 5, 3, 3, 0, 'table'], [53, 5, 3, 3, 0, 'table'], [40, 13, 3, 3, 0, 'table'], [53, 13, 3, 3, 0, 'table'],
  [70, 8, 3, 3, 0, 'turret'], [66, 23, 2, 2, 0, 'tank'],
  [87, 23, 3, 2, 0, 'navdesk'], [72, 41, 3, 3, 0, 'shieldgen'], [57, 49, 3, 2, 0, 'radio'],
  [39, 46, 3, 2, 0, 'crate'], [47, 46, 2, 2, 0, 'crate'], [48, 51, 2, 2, 0, 'crate'], [41, 50, 3, 2, 0, 'crate'],
  [55, 30, 3, 3, 0, 'holo'], [27, 39, 1, 1, 0, 'pillar'], [31, 39, 1, 1, 0, 'pillar'],
  [8, 7, 6, 4, 1, 'engine'], [8, 43, 6, 4, 1, 'engine'], [5, 26, 4, 3, 1, 'core'],
  [23, 19, 3, 2, 0, 'bed'], [27, 19, 3, 2, 0, 'bed'], [23, 27, 5, 1, 0, 'desk']
];
const ST = {};
const stn = (id, room, label, cx, cy, side) => {
  const v = side === 'n' ? [0, 1.25] : side === 's' ? [0, -1.25] : side === 'w' ? [1.25, 0] : [-1.25, 0];
  ST[id] = { id, room, label, cx, cy, side, x: cx + v[0], y: cy + v[1], r: 1.5 };
  ST[id].nx = ST[id].x; ST[id].ny = ST[id].y;
};
stn('w_cafe', 'Cafeteria', 'Wires', 45, 3.5, 'n');
stn('dl_cafe', 'Cafeteria', 'Data terminal', 58.5, 5.5, 'e');
stn('garb_caf', 'Cafeteria', 'Garbage chute', 58.5, 16, 'e');
stn('emerg', 'Cafeteria', 'Emergency button', 48, 10.5, 'n');
ST.emerg.x = 48; ST.emerg.y = 11; ST.emerg.r = 2.4; ST.emerg.nx = 48; ST.emerg.ny = 12.9;
stn('aster', 'Weapons', 'Weapons console', 70, 5.5, 'n');
stn('dl_weap', 'Weapons', 'Data terminal', 75, 5.5, 'n');
stn('o2f', 'O2', 'Filter', 65, 26.5, 's');
stn('o2_1', 'O2', 'O2 panel', 68.5, 21.5, 'e');
stn('chart', 'Navigation', 'Chart table', 93.5, 22.5, 'e');
stn('steer', 'Navigation', 'Steering', 93.5, 26.5, 'e');
stn('dl_nav', 'Navigation', 'Data terminal', 85, 29.5, 's');
stn('w_nav', 'Navigation', 'Wires', 90, 19.5, 'n');
stn('shield', 'Shields', 'Shield panel', 74, 38.5, 'n');
stn('dl_comm', 'Communications', 'Data terminal', 59, 54.5, 's');
stn('comms', 'Communications', 'Comms console', 54.5, 52.5, 'w');
stn('fuel_stor', 'Storage', 'Fuel canisters', 44.5, 53.5, 's');
stn('garb_stor', 'Storage', 'Garbage chute', 50.5, 44, 'e');
stn('w_stor', 'Storage', 'Wires', 40.5, 42.5, 'n');
stn('swipe', 'Admin', 'Card reader', 62.5, 29, 'e');
stn('up_admin', 'Admin', 'Upload terminal', 62.5, 33.5, 'e');
stn('w_admin', 'Admin', 'Wires', 58, 36.5, 's');
stn('o2_2', 'Admin', 'O2 panel', 55, 27.5, 'n');
stn('admin', 'Admin', 'Admin map', 56, 30.4, 'n');
ST.admin.x = 56.5; ST.admin.y = 34; ST.admin.cx = 56.5; ST.admin.cy = 32.4; ST.admin.nx = 56.5; ST.admin.ny = 34;
stn('calib', 'Electrical', 'Distributor', 28, 35.5, 'n');
stn('dl_elec', 'Electrical', 'Data terminal', 33.5, 38.5, 'e');
stn('w_elec', 'Electrical', 'Wires', 25, 44.5, 's');
stn('lights', 'Electrical', 'Breaker panel', 22.5, 38.5, 'w');
stn('align_ue', 'Upper Engine', 'Engine control', 12, 4.5, 'n');
stn('fuel_ue', 'Upper Engine', 'Fuel intake', 7.5, 4.5, 'n');
stn('align_le', 'Lower Engine', 'Engine control', 12, 51.5, 's');
stn('fuel_le', 'Lower Engine', 'Fuel intake', 7.5, 51.5, 's');
stn('manif', 'Reactor', 'Manifolds', 6, 22.5, 'n');
stn('rstart', 'Reactor', 'Reactor control', 6, 33.5, 's');
stn('reactor1', 'Reactor', 'Reactor panel', 2.5, 24.4, 'w');
stn('reactor2', 'Reactor', 'Reactor panel', 2.5, 31.6, 'w');
stn('scan', 'MedBay', 'Scanner', 28, 17.2, 'n');
ST.scan.x = 28; ST.scan.y = 17.2; ST.scan.cy = 15.4; ST.scan.nx = 28; ST.scan.ny = 17.2;
stn('sample', 'MedBay', 'Sample analyser', 32.5, 16.5, 'e');
stn('cams', 'Security', 'Cameras', 26, 24.5, 'n');
stn('w_sec', 'Security', 'Wires', 24, 31.5, 's');
const VENTS = [
  { x: 7, y: 12.5, g: 0 }, { x: 3.4, y: 23.6, g: 0 }, { x: 7, y: 47.5, g: 1 }, { x: 3.4, y: 32.8, g: 1 },
  { x: 31.4, y: 19.8, g: 2 }, { x: 29.4, y: 26.4, g: 2 }, { x: 32.4, y: 36.6, g: 2 },
  { x: 57, y: 4.6, g: 3 }, { x: 60, y: 35.6, g: 3 }, { x: 45, y: 27, g: 3 },
  { x: 76.4, y: 6.6, g: 4 }, { x: 92.4, y: 21, g: 4 },
  { x: 84, y: 28.6, g: 5 }, { x: 78.4, y: 47.4, g: 5 },
  { x: 62.4, y: 53.4, g: 6 }, { x: 40, y: 52.6, g: 6 }
];
VENTS.forEach((v, i) => { v.id = i; });
VENTS.forEach(v => { v.to = VENTS.filter(o => o.g === v.g && o.id !== v.id).map(o => o.id); });
const DOORS = [
  ['Cafeteria', 36, 8, 1, 3], ['Cafeteria', 59, 9, 1, 3], ['Cafeteria', 43, 18, 4, 1],
  ['Upper Engine', 19, 8, 1, 3], ['Upper Engine', 15, 16, 3, 1], ['Upper Engine', 7, 16, 3, 1],
  ['Lower Engine', 15, 39, 3, 1], ['Lower Engine', 7, 39, 3, 1], ['Lower Engine', 19, 41, 1, 3],
  ['MedBay', 21, 15, 1, 3], ['MedBay', 26, 12, 3, 1],
  ['Security', 20, 26, 1, 3],
  ['Electrical', 21, 41, 1, 3], ['Electrical', 34, 42, 1, 3],
  ['Storage', 43, 41, 4, 1], ['Storage', 37, 42, 1, 3], ['Storage', 51, 48, 1, 3]
].map((d, i) => ({ id: i, room: d[0], x: d[1], y: d[2], w: d[3], h: d[4] }));
const DOOR_ROOMS = ['Cafeteria', 'Upper Engine', 'Lower Engine', 'MedBay', 'Security', 'Electrical', 'Storage'];

const FL = new Uint8Array(MW * MH), RID = new Uint8Array(MW * MH), BLK = new Uint8Array(MW * MH), OPQ = new Uint8Array(MW * MH), DM = new Uint8Array(MW * MH), OBSM = new Uint8Array(MW * MH);
ROOMS.forEach((r, i) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { FL[y * MW + x] = 1; RID[y * MW + x] = i + 1; } });
CORR.forEach(c => { for (let y = c[1]; y < c[1] + c[3]; y++) for (let x = c[0]; x < c[0] + c[2]; x++) FL[y * MW + x] = 1; });
for (let i = 0; i < MW * MH; i++) { BLK[i] = FL[i] ? 0 : 1; OPQ[i] = FL[i] ? 0 : 1; }
OBS.forEach(o => {
  for (let y = Math.floor(o[1] + .01); y < Math.ceil(o[1] + o[3] - .01); y++) for (let x = Math.floor(o[0] + .01); x < Math.ceil(o[0] + o[2] - .01); x++) {
    const i = y * MW + x;
    BLK[i] = 1; OBSM[i] = 1;
    if (o[4]) OPQ[i] = 1;
  }
});
const cellBlk = (cx, cy) => cx < 0 || cy < 0 || cx >= MW || cy >= MH || BLK[cy * MW + cx] === 1 || DM[cy * MW + cx] === 1;
const cellOpq = (cx, cy) => cx < 0 || cy < 0 || cx >= MW || cy >= MH || OPQ[cy * MW + cx] === 1 || DM[cy * MW + cx] === 1;
const roomIdAt = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx < 0 || cy < 0 || cx >= MW || cy >= MH ? 0 : RID[cy * MW + cx]; };
const roomName = (x, y) => { const r = roomIdAt(x, y); return r ? ROOMS[r - 1].n : 'Hallway'; };
const hit = (x, y, r = PR) => {
  const x0 = Math.floor(x - r), x1 = Math.floor(x + r), y0 = Math.floor(y - r), y1 = Math.floor(y + r);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    if (!cellBlk(cx, cy)) continue;
    const px = Math.max(cx, Math.min(x, cx + 1)), py = Math.max(cy, Math.min(y, cy + 1));
    const dx = x - px, dy = y - py;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
};
const moveBy = (o, dx, dy, ghost) => {
  const L = Math.hypot(dx, dy);
  if (!L) return;
  const n = Math.ceil(L / .12), sx = dx / n, sy = dy / n;
  for (let i = 0; i < n; i++) {
    if (ghost) { o.x = clamp(o.x + sx, .5, MW - .5); o.y = clamp(o.y + sy, .5, MH - .5); continue; }
    if (!hit(o.x + sx, o.y)) o.x += sx;
    if (!hit(o.x, o.y + sy)) o.y += sy;
  }
};
const pushOut = o => {
  if (!hit(o.x, o.y)) return;
  for (let r = .15; r < 3; r += .15) for (let k = 0; k < 16; k++) {
    const a = k / 16 * TAU, x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r;
    if (!hit(x, y)) { o.x = x; o.y = y; return; }
  }
};
const castDist = (x, y, a, R) => {
  const dx = Math.cos(a), dy = Math.sin(a);
  let cx = Math.floor(x), cy = Math.floor(y);
  const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
  const tdx = Math.abs(dx) < 1e-9 ? 1e9 : Math.abs(1 / dx), tdy = Math.abs(dy) < 1e-9 ? 1e9 : Math.abs(1 / dy);
  let tmx = Math.abs(dx) < 1e-9 ? 1e9 : (dx > 0 ? cx + 1 - x : x - cx) * tdx;
  let tmy = Math.abs(dy) < 1e-9 ? 1e9 : (dy > 0 ? cy + 1 - y : y - cy) * tdy;
  for (let k = 0; k < 90; k++) {
    let t;
    if (tmx < tmy) { t = tmx; cx += sx; tmx += tdx; } else { t = tmy; cy += sy; tmy += tdy; }
    if (t >= R) return R;
    if (cellOpq(cx, cy)) return t;
  }
  return R;
};
const los = (x0, y0, x1, y1) => {
  const d = Math.hypot(x1 - x0, y1 - y0);
  return d < .01 || castDist(x0, y0, Math.atan2(y1 - y0, x1 - x0), d) >= d - .001;
};
const NAVF = new Map();
const navFree = (cx, cy) => cx >= 0 && cy >= 0 && cx < MW && cy < MH && !BLK[cy * MW + cx];
const field = (tx, ty) => {
  const key = Math.floor(ty) * MW + Math.floor(tx);
  let f = NAVF.get(key);
  if (f) return f;
  f = new Int16Array(MW * MH).fill(-1);
  const qu = new Int32Array(MW * MH);
  let h = 0, t = 0;
  if (navFree(Math.floor(tx), Math.floor(ty))) { f[key] = 0; qu[t++] = key; }
  while (h < t) {
    const c = qu[h++], cx = c % MW, cy = (c / MW) | 0, d = f[c];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (!navFree(nx, ny) || f[ny * MW + nx] >= 0) continue;
      if (dx && dy && (!navFree(cx + dx, cy) || !navFree(cx, cy + dy))) continue;
      f[ny * MW + nx] = d + 1; qu[t++] = ny * MW + nx;
    }
  }
  if (NAVF.size > 160) NAVF.delete(NAVF.keys().next().value);
  NAVF.set(key, f);
  return f;
};
const sweepClear = (x0, y0, x1, y1) => {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / .2);
  for (let i = 1; i <= n; i++) { const t = i / n; if (hit(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, PR + .04)) return false; }
  return true;
};
const flowTarget = (f, x, y) => {
  let cx = Math.floor(x), cy = Math.floor(y);
  if (cx < 0 || cy < 0 || cx >= MW || cy >= MH || f[cy * MW + cx] < 0) return null;
  let best = null;
  for (let step = 0; step < 5; step++) {
    const cur = f[cy * MW + cx];
    if (cur === 0) { best = [cx + .5, cy + .5, 0]; break; }
    let bx = cx, by = cy, bv = cur;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      const v = f[ny * MW + nx];
      if (v < 0 || v >= bv) continue;
      if (dx && dy && (!navFree(cx + dx, cy) || !navFree(cx, cy + dy))) continue;
      bv = v; bx = nx; by = ny;
    }
    if (bv === cur) break;
    cx = bx; cy = by;
    if (step === 0 || sweepClear(x, y, cx + .5, cy + .5)) best = [cx + .5, cy + .5, bv]; else break;
  }
  return best;
};
const SPAWN = i => {
  const a = i / 15 * TAU + .3;
  return [48 + Math.cos(a) * 3.1, 10.5 + Math.sin(a) * 3.1];
};

const TASKS = {
  wires: { n: 'Fix Wiring', len: 'common' }, swipe: { n: 'Swipe Card', len: 'common' },
  download: { n: 'Download Data', len: 'short' }, calib: { n: 'Calibrate Distributor', len: 'short' }, chart: { n: 'Chart Course', len: 'short' },
  steer: { n: 'Stabilize Steering', len: 'short' }, o2f: { n: 'Clean O2 Filter', len: 'short' }, aster: { n: 'Clear Asteroids', len: 'short' },
  shield: { n: 'Prime Shields', len: 'short' }, manif: { n: 'Unlock Manifolds', len: 'short' }, scan: { n: 'Submit Scan', len: 'short' },
  rstart: { n: 'Start Reactor', len: 'short' },
  align: { n: 'Align Engine Output', len: 'long' }, garb: { n: 'Empty Garbage', len: 'long' }, fuel: { n: 'Fuel Engines', len: 'long' }, sample: { n: 'Inspect Sample', len: 'long' }
};
const WIRE_ST = ['w_cafe', 'w_nav', 'w_elec', 'w_stor', 'w_admin', 'w_sec'];
const DL_ST = ['dl_cafe', 'dl_weap', 'dl_nav', 'dl_comm', 'dl_elec'];
const mkTask = (key, steps, ord) => ({ key, ord: !!ord, steps: steps.map(([st, mg]) => ({ st, mg, done: 0 })) });
const blueprint = key => {
  switch (key) {
    case 'wires': return mkTask(key, shuffle(WIRE_ST.slice()).slice(0, 3).map(s => [s, 'wires']), 0);
    case 'swipe': return mkTask(key, [['swipe', 'swipe']], 0);
    case 'download': return mkTask(key, [[pick(DL_ST), 'download'], ['up_admin', 'upload']], 1);
    case 'calib': return mkTask(key, [['calib', 'calib']]);
    case 'chart': return mkTask(key, [['chart', 'chart']]);
    case 'steer': return mkTask(key, [['steer', 'steer']]);
    case 'o2f': return mkTask(key, [['o2f', 'o2f']]);
    case 'aster': return mkTask(key, [['aster', 'aster']]);
    case 'shield': return mkTask(key, [['shield', 'shield']]);
    case 'manif': return mkTask(key, [['manif', 'manif']]);
    case 'scan': return mkTask(key, [['scan', 'scan']]);
    case 'rstart': return mkTask(key, [['rstart', 'rstart']]);
    case 'align': return mkTask(key, shuffle([['align_ue', 'align'], ['align_le', 'align']]), 0);
    case 'garb': return mkTask(key, [['garb_caf', 'garb'], ['garb_stor', 'garb']], 0);
    case 'fuel': {
      const e = pick(['fuel_ue', 'fuel_le']);
      return mkTask(key, [['fuel_stor', 'fuelcan'], [e, 'fuelengine'], ['fuel_stor', 'fuelcan'], [e === 'fuel_ue' ? 'fuel_le' : 'fuel_ue', 'fuelengine']], 1);
    }
    case 'sample': return mkTask(key, [['sample', 'sample1'], ['sample', 'sample2']], 1);
  }
};
const cloneTask = t => ({ key: t.key, ord: t.ord, steps: t.steps.map(s => ({ st: s.st, mg: s.mg, done: s.done ? 1 : 0 })) });
const makeCommon = S => shuffle(['wires', 'swipe']).slice(0, S.common).map(blueprint);
const makePlayerTasks = (S, common) => {
  const out = common.map(cloneTask);
  const pool = len => shuffle(Object.keys(TASKS).filter(k => TASKS[k].len === len));
  pool('long').slice(0, S.long).forEach(k => out.push(blueprint(k)));
  pool('short').slice(0, S.short).forEach(k => out.push(blueprint(k)));
  return out;
};
const taskAvail = (t, si) => !t.steps[si].done && (!t.ord || t.steps.slice(0, si).every(s => s.done));
const taskLabel = t => {
  const n = t.steps.length, d = t.steps.filter(s => s.done).length;
  const next = t.steps.findIndex((s, i) => taskAvail(t, i));
  const room = next < 0 ? ST[t.steps[n - 1].st].room : ST[t.steps[next].st].room;
  return { room, name: TASKS[t.key].n, d, n, done: d === n };
};

const VIS = 5.2;
const visRadius = (S, role, alive, lights) => {
  if (!alive) return 99;
  if (role === 1) return VIS * S.ivis;
  const n = VIS * S.cvis;
  return lights ? Math.min(n, Math.max(1.2, 1.7 * S.cvis)) : n;
};
const CAMS = [[12, 20, 12, 12], [38, 18, 14, 14], [78, 30, 14, 14], [32, 38, 18, 10]];
const inRect = (x, y, r) => x >= r[0] && y >= r[1] && x <= r[0] + r[2] && y <= r[1] + r[3];
const SAB_T = 32;
const chatClean = s => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);

function makeHost(env, init) {
  const S = fixSettings(init.settings);
  const n = init.players.length;
  const H = { S, n, P: [], bodies: [], doors: DOORS.map(() => ({ c: 0, t: 0 })), sab: null, sabCd: 12, doorCd: 12, emCd: S.ecd, phase: 'intro', pt: 4.6, t: 0, snapT: 0, stT: 0, meet: null, tot: 0, done: 0, shown: 0, seq: 0, overInfo: null, overT: 0, ejInfo: null };
  const P = H.P;
  const lightsOut = () => !!(H.sab && H.sab.k === 'lights');
  const visR = p => visRadius(S, p.role, p.alive, lightsOut());
  const out = (i, m, fast) => { const p = P[i]; if (p && !p.bot) env.send(i, m, fast); };
  const all = m => P.forEach(p => { if (!p.bot) env.send(p.i, m); });
  const cname = i => COLORS[P[i].color][0];
  const speedOf = () => 3.4 * S.speed;
  const setDoors = () => { DM.fill(0); H.doors.forEach((s, i) => { if (s.c) { const d = DOORS[i]; for (let y = d.y; y < d.y + d.h; y++) for (let x = d.x; x < d.x + d.w; x++) DM[y * MW + x] = 1; } }); };
  const crewAlive = () => P.filter(p => p.role === 0 && p.alive).length;
  const impAlive = () => P.filter(p => p.role === 1 && p.alive).length;

  const tasksDone = p => p.tasks.map(t => t.steps.map(s => s.done));
  const sendTasks = p => out(p.i, { t: 'tasks', d: tasksDone(p), sa: p.sampleAt ? Math.max(0, Math.ceil(p.sampleAt - H.t)) : 0 });
  const barVal = () => H.tot ? H.done / H.tot : 1;
  const updBar = force => { if (S.bar === 0 || force) H.shown = barVal(); };
  const sabInfo = () => {
    const s = H.sab;
    if (!s) return null;
    return { k: s.k, t: s.t == null ? 0 : Math.ceil(s.t), sw: s.sw, f: s.f, h: s.until ? s.until.map(u => u > H.t ? 1 : 0) : null, c: s.codes };
  };
  const stFor = p => ({ t: 'st', ph: H.phase, dr: H.doors.map(d => d.c), sab: sabInfo(), bar: S.bar === 2 ? -1 : H.shown, em: p.emerg, emcd: Math.ceil(H.emCd), sabcd: Math.ceil(H.sabCd), doorcd: Math.ceil(H.doorCd), kc: Math.ceil(p.kcd) });
  const sendSt = () => P.forEach(p => { if (!p.bot) env.send(p.i, stFor(p)); });
  const cfgFor = p => ({
    t: 'cfg', me: p.i, n, S, players: P.map(q => ({ i: q.i, name: q.name, color: q.color })), role: p.role, alive: p.alive, vent: p.vent, emerg: p.emerg,
    mates: p.role === 1 ? P.filter(q => q.role === 1 && q.i !== p.i).map(q => q.i) : [],
    tasks: p.tasks.map(t => ({ key: t.key, ord: t.ord, steps: t.steps.map(s => ({ st: s.st, mg: s.mg, done: s.done })) })), sa: p.sampleAt ? Math.max(0, Math.ceil(p.sampleAt - H.t)) : 0,
    pos: [p.x, p.y], ph: H.phase, intro: Math.max(0, H.pt)
  });

  const finish = (w, why) => {
    if (H.phase === 'over') return;
    H.phase = 'over'; H.overT = 0; H.sab = null;
    H.overInfo = { w, why, roles: P.map(p => p.role), alive: P.map(p => p.alive ? 1 : 0) };
    all(Object.assign({ t: 'over' }, H.overInfo));
  };
  const checkWin = () => {
    if (H.phase === 'over') return true;
    const im = impAlive(), cr = crewAlive();
    if (im === 0) { finish('crew', 'ejected'); return true; }
    if (im >= cr) { finish('imp', 'majority'); return true; }
    if (H.tot > 0 && H.done >= H.tot) { finish('crew', 'tasks'); return true; }
    return false;
  };

  const dropSab = () => { H.sab = null; };
  const resolveSab = () => {
    if (!H.sab) return;
    const k = H.sab.k;
    H.sab = null; H.sabCd = 30;
    all({ t: 'ev', k: 'fixed', s: k });
    sendSt();
  };
  const startSab = (k, byBot) => {
    if (H.sab) return false;
    const s = { k };
    if (k === 'lights') { s.sw = Array.from({ length: 5 }, () => rnd(2)); if (s.sw.every(v => v)) s.sw[rnd(5)] = 0; if (s.sw.every(v => !v)) s.sw[rnd(5)] = 1; s.f = 0; }
    if (k === 'comms') s.f = 0;
    if (k === 'reactor') { s.t = SAB_T; s.until = [0, 0]; s.who = [-1, -1]; s.both = 0; }
    if (k === 'o2') { s.t = SAB_T; s.f = [0, 0]; s.codes = Array.from({ length: 5 }, () => rnd(10)).join(''); }
    H.sab = s; H.sabCd = 30;
    all({ t: 'ev', k: 'sab', s: k });
    sendSt();
    if (H.bots) H.bots.onSab(k);
    return true;
  };
  const closeDoors = room => {
    let any = false;
    H.doors.forEach((d, i) => { if (DOORS[i].room === room) { d.c = 1; d.t = 10; any = true; } });
    if (!any) return false;
    setDoors();
    P.forEach(p => { if (p.alive && p.vent < 0) { const was = hit(p.x, p.y); if (was) { pushOut(p); p.fix = 1; } } });
    H.doorCd = 30;
    all({ t: 'ev', k: 'doors', r: room });
    sendSt();
    return true;
  };

  const spawnAll = () => {
    let k = 0;
    P.forEach(p => { const s = SPAWN(k++); p.x = s[0]; p.y = s[1]; p.fix = 1; p.vent = -1; p.mv = 0; p.scan = 0; p.ventT = -9; });
  };

  const kill = (ki, vi) => {
    const a = P[ki], b = P[vi];
    if (H.phase !== 'play' || !a || !b || a.role !== 1 || !a.alive || b.role === 1 || !b.alive || a.kcd > 0 || a.vent >= 0 || b.vent >= 0) return false;
    if (dist(a.x, a.y, b.x, b.y) > KRANGE[S.krange] + .7) return false;
    b.alive = false; b.scan = 0;
    H.bodies.push({ i: vi, x: b.x, y: b.y });
    const kx = a.x, ky = a.y;
    a.x = b.x; a.y = b.y; a.fix = 1; a.kcd = S.kcd; a.lastKill = H.t;
    out(vi, { t: 'ev', k: 'killed', by: ki, x: b.x, y: b.y });
    out(ki, { t: 'ev', k: 'kill', v: vi, x: b.x, y: b.y });
    P.forEach(q => {
      if (q.i === ki || q.i === vi || q.bot) return;
      if (!q.alive || dist(q.x, q.y, b.x, b.y) < 9) env.send(q.i, { t: 'ev', k: 'snd', s: 'kill', x: b.x, y: b.y, from: kx });
    });
    if (H.bots) H.bots.onKill(ki, vi, b.x, b.y);
    checkWin();
    return true;
  };
  const ventPos = (p, v) => { p.x = VENTS[v].x; p.y = VENTS[v].y; p.fix = 1; };
  const ventIn = (i, v) => {
    const p = P[i];
    if (H.phase !== 'play' || !p || p.role !== 1 || !p.alive || p.vent >= 0 || !VENTS[v]) return false;
    if (dist(p.x, p.y, VENTS[v].x, VENTS[v].y) > 1.7) return false;
    p.vent = v; p.ventT = H.t; p.ventK = 1; ventPos(p, v);
    if (H.bots) H.bots.onVent(i, v);
    return true;
  };
  const ventOut = i => {
    const p = P[i];
    if (!p || p.vent < 0) return false;
    ventPos(p, p.vent); p.vent = -1; p.ventT = H.t; p.ventK = 2;
    return true;
  };
  const ventMove = (i, v) => {
    const p = P[i];
    if (!p || p.vent < 0 || !VENTS[p.vent].to.includes(v)) return false;
    p.vent = v; ventPos(p, v);
    return true;
  };

  const startMeeting = (caller, bodyIdx) => {
    if (H.phase !== 'play') return;
    const sabWas = H.sab;
    H.phase = 'meet'; H.sab = null;
    H.doors.forEach(d => { d.c = 0; d.t = 0; }); setDoors();
    const bodyName = bodyIdx >= 0 ? bodyIdx : -1;
    const bd0 = H.bodies.find(x => x.i === bodyIdx);
    P.forEach(p => { if (p.vent >= 0) { ventPos(p, p.vent); p.vent = -1; } p.scan = 0; });
    const M = H.meet = { caller, body: bodyName, ph: 'alert', t: 3.4, votes: P.map(() => null), chat: [], last: P.map(() => -9), res: null, bpos: bd0 ? [bd0.x, bd0.y] : null };
    updBar(true);
    H.bodies = [];
    if (caller >= 0 && bodyIdx < 0) P[caller].emerg--;
    all({ t: 'm', k: 'start', caller, body: bodyName, alive: P.map(p => p.alive ? 1 : 0), disc: S.disc, vote: S.vote, bar: S.bar === 2 ? -1 : H.shown, sab: sabWas ? sabWas.k : null });
    if (H.bots) H.bots.onMeeting(M);
  };
  const report = (i, bi) => {
    const p = P[i];
    if (H.phase !== 'play' || !p || !p.alive || p.vent >= 0) return false;
    const b = H.bodies.find(x => x.i === bi);
    if (!b || dist(p.x, p.y, b.x, b.y) > 3.4) return false;
    startMeeting(i, bi);
    return true;
  };
  const emergency = i => {
    const p = P[i];
    if (H.phase !== 'play' || !p || !p.alive || p.vent >= 0 || p.emerg <= 0 || H.emCd > 0) return false;
    if (H.sab && (H.sab.k === 'reactor' || H.sab.k === 'o2')) return false;
    if (dist(p.x, p.y, ST.emerg.x, ST.emerg.y) > ST.emerg.r + .8) return false;
    startMeeting(i, -1);
    return true;
  };
  const chatMsg = (i, text) => {
    const M = H.meet, p = P[i];
    text = chatClean(text);
    if (!M || !p || !text || (M.ph !== 'disc' && M.ph !== 'vote')) return false;
    if (H.t - M.last[i] < 1.0) return false;
    M.last[i] = H.t;
    const dead = !p.alive;
    M.chat.push({ i, text, dead });
    if (M.chat.length > 80) M.chat.shift();
    P.forEach(q => { if (!q.bot && (!dead || !q.alive)) env.send(q.i, { t: 'm', k: 'chat', i, text, dead: dead ? 1 : 0 }); });
    if (H.bots) H.bots.onChat(i, text, dead);
    return true;
  };
  const castVote = (i, tg) => {
    const M = H.meet, p = P[i];
    if (!M || M.ph !== 'vote' || !p || !p.alive || M.votes[i] !== null) return false;
    if (tg !== -1 && (!P[tg] || !P[tg].alive || tg === i)) return false;
    M.votes[i] = tg;
    all({ t: 'm', k: 'voted', i });
    if (P.every(q => !q.alive || M.votes[q.i] !== null)) M.t = Math.min(M.t, 1.2);
    return true;
  };
  const tally = () => {
    const M = H.meet, cnt = new Array(n + 1).fill(0);
    M.votes.forEach((v, i) => { if (v !== null && P[i].alive) cnt[v === -1 ? n : v]++; });
    let top = 0, who = [];
    cnt.forEach((c, i) => { if (c > top) { top = c; who = [i]; } else if (c === top && c > 0) who.push(i); });
    const ej = who.length === 1 && who[0] !== n ? who[0] : -1;
    return { cnt, ej };
  };
  const meetStep = dt => {
    const M = H.meet;
    M.t -= dt;
    if (M.ph !== 'res' && H.bots) H.bots.meetTick(M, dt);
    if (M.ph === 'alert') {
      if (M.t <= 0) { M.ph = S.disc > 0 ? 'disc' : 'vote'; M.t = S.disc > 0 ? S.disc : S.vote; all({ t: 'm', k: 'ph', ph: M.ph, tt: M.t }); }
    } else if (M.ph === 'disc') {
      if (M.t <= 0) { M.ph = 'vote'; M.t = S.vote; all({ t: 'm', k: 'ph', ph: 'vote', tt: M.t }); }
    } else if (M.ph === 'vote') {
      if (M.t <= 0) {
        const r = tally();
        M.res = r; M.ph = 'res'; M.t = 6;
        all({ t: 'm', k: 'res', cnt: r.cnt, votes: S.anon ? null : M.votes, ej: r.ej });
      }
    } else if (M.ph === 'res') {
      if (M.t <= 0) {
        const ej = M.res.ej;
        let info = { i: -1 };
        if (ej >= 0) {
          const e = P[ej];
          e.alive = false;
          const left = impAlive();
          info = { i: ej, name: e.name, color: e.color, imp: S.confirm ? e.role : -1, left: S.confirm ? left : -1 };
        }
        H.ejInfo = info;
        H.phase = 'eject'; H.pt = info.i >= 0 ? 8.2 : 5.2;
        all({ t: 'm', k: 'eject', e: info });
        if (H.bots) H.bots.onEject(info);
      }
    }
  };
  const endEject = () => {
    if (checkWin()) return;
    H.phase = 'play'; H.meet = null;
    spawnAll();
    P.forEach(p => { if (p.role === 1) p.kcd = Math.max(p.kcd, S.kcd); });
    H.emCd = S.ecd; H.sabCd = Math.max(H.sabCd, 12); H.doorCd = Math.max(H.doorCd, 12);
    all({ t: 'm', k: 'end' });
    sendSt();
    if (H.bots) H.bots.onResume();
  };

  const tdone = (i, ti, si) => {
    const p = P[i], t = p && p.tasks[ti];
    if (!p || p.role !== 0 || !t || !t.steps[si] || H.phase !== 'play') return false;
    if (!taskAvail(t, si)) return false;
    const s = t.steps[si], st = ST[s.st];
    if (dist(p.x, p.y, st.x, st.y) > st.r + 1.4) return false;
    if (s.mg === 'sample2' && !(p.sampleAt && H.t >= p.sampleAt - .4)) return false;
    s.done = 1; H.done++; updBar();
    if (s.mg === 'sample1') p.sampleAt = H.t + 28;
    if (s.mg === 'sample2') p.sampleAt = 0;
    sendTasks(p);
    sendSt();
    checkWin();
    return true;
  };
  const nearSt = (p, id, extra) => { const s = ST[id]; return dist(p.x, p.y, s.x, s.y) <= s.r + (extra || 1.2); };
  const fix = (i, m) => {
    const p = P[i], s = H.sab;
    if (!s || !p || H.phase !== 'play' || p.role !== 0 || !p.alive || p.vent >= 0) return false;
    if (m.k === 'lights' && s.k === 'lights') {
      if (!nearSt(p, 'lights') || !(m.s >= 0 && m.s < 5)) return false;
      s.sw[m.s] = s.sw[m.s] ? 0 : 1;
      if (s.sw.every(v => v)) resolveSab(); else sendSt();
      return true;
    }
    if (m.k === 'comms' && s.k === 'comms') {
      if (!nearSt(p, 'comms')) return false;
      resolveSab(); return true;
    }
    if (m.k === 'o2' && s.k === 'o2') {
      const k = m.p | 0;
      if (!(k === 0 || k === 1) || !nearSt(p, k ? 'o2_2' : 'o2_1')) return false;
      s.f[k] = 1;
      if (s.f[0] && s.f[1]) resolveSab(); else sendSt();
      return true;
    }
    if (m.k === 'reactor' && s.k === 'reactor') {
      const k = m.p | 0;
      if (!(k === 0 || k === 1) || !nearSt(p, k ? 'reactor2' : 'reactor1')) return false;
      s.until[k] = m.on ? H.t + 1.1 : 0; s.who[k] = i;
      return true;
    }
    return false;
  };

  const playStep = dt => {
    if (H.bots) H.bots.tick(dt);
    P.forEach(p => {
      if (p.role === 1 && p.kcd > 0) p.kcd = Math.max(0, p.kcd - dt);
      p.allow = Math.min(1.6, (p.allow || 0) + speedOf() * dt * 1.5);
    });
    H.doors.forEach(d => { if (d.c) { d.t -= dt; if (d.t <= 0) { d.c = 0; H.doorsDirty = 1; } } });
    if (H.doorsDirty) { H.doorsDirty = 0; setDoors(); sendSt(); }
    if (H.emCd > 0) H.emCd = Math.max(0, H.emCd - dt);
    if (H.sabCd > 0 && !H.sab) H.sabCd = Math.max(0, H.sabCd - dt);
    if (H.doorCd > 0) H.doorCd = Math.max(0, H.doorCd - dt);
    const s = H.sab;
    if (s && (s.k === 'reactor' || s.k === 'o2')) {
      s.t -= dt;
      if (s.t <= 0) { finish('imp', 'sabotage'); return; }
      if (s.k === 'reactor') {
        if (s.until[0] > H.t && s.until[1] > H.t) { s.both += dt; if (s.both > .6) resolveSab(); } else s.both = 0;
      }
    }
  };

  const botInit = p => { p.bot = true; p.id = null; if (H.bots) H.bots.init(p); };
  const snapFor = p => {
    const R = visR(p) + 2.2, ghost = !p.alive, pl = [];
    P.forEach(q => {
      if (q === p) return;
      let flags = (q.mv ? 1 : 0) | (q.alive ? 0 : 2) | (q.scan ? 16 : 0);
      if (!ghost && !q.alive) return;
      if (q.ventK && H.t - q.ventT < .7) flags |= q.ventK === 1 ? 4 : 8;
      else if (q.vent >= 0) { if (!ghost) return; flags |= 32; }
      if (!ghost && dist(p.x, p.y, q.x, q.y) > R) return;
      pl.push([q.i, q2(q.x), q2(q.y), q.fx, flags]);
    });
    const bd = [];
    H.bodies.forEach(b => { if (ghost || dist(p.x, p.y, b.x, b.y) <= R) bd.push([b.i, q2(b.x), q2(b.y)]); });
    const m = { t: 's', k: ++H.seq, p: pl, b: bd, kc: Math.ceil(p.kcd * 10) / 10, v: p.vent };
    if (p.fix) { m.fix = [q2(p.x), q2(p.y)]; p.fix = 0; }
    if (p.info === 'cams' && !(H.sab && H.sab.k === 'comms')) {
      m.cp = [];
      P.forEach(q => { if (q !== p && q.alive && q.vent < 0 && CAMS.some(r => inRect(q.x, q.y, r))) m.cp.push([q.i, q2(q.x), q2(q.y), q.fx, q.mv ? 1 : 0]); });
    }
    if (p.info === 'admin' && !(H.sab && H.sab.k === 'comms')) {
      m.ad = [];
      P.forEach(q => { if (q.alive && q.vent < 0) m.ad.push([roomIdAt(q.x, q.y), q.color]); });
    }
    return m;
  };

  H.recv = (i, m) => {
    const p = P[i];
    if (!p || !m || typeof m.t !== 'string') return;
    switch (m.t) {
      case 'mv': {
        if (H.phase !== 'play' || p.vent >= 0) return;
        let nx = +m.x, ny = +m.y;
        if (!isFinite(nx) || !isFinite(ny)) return;
        const d = dist(p.x, p.y, nx, ny), lim = (p.allow || 0) + .5;
        if (d > lim) { const k = lim / d; nx = p.x + (nx - p.x) * k; ny = p.y + (ny - p.y) * k; p.fix = 1; }
        p.allow = Math.max(0, (p.allow || 0) - d);
        if (p.alive && hit(nx, ny)) { if (hit(p.x, p.y)) pushOut(p); nx = p.x; ny = p.y; p.fix = 1; }
        p.x = clamp(nx, .3, MW - .3); p.y = clamp(ny, .3, MH - .3); p.fx = m.fx >= 0 ? 1 : -1; p.mv = m.mv ? 1 : 0;
        return;
      }
      case 'kill': kill(i, m.v | 0); return;
      case 'report': report(i, m.b | 0); return;
      case 'emerg': emergency(i); return;
      case 'vent':
        if (m.k === 'in') ventIn(i, m.v | 0); else if (m.k === 'out') ventOut(i); else if (m.k === 'go') ventMove(i, m.v | 0);
        return;
      case 'sab':
        if (H.phase !== 'play' || p.role !== 1) return;
        if (m.k === 'doors') { if (H.doorCd <= 0 && !(H.sab && (H.sab.k === 'reactor' || H.sab.k === 'o2')) && DOOR_ROOMS.includes(m.r)) closeDoors(m.r); return; }
        if (H.sab || H.sabCd > 0 || !['lights', 'comms', 'reactor', 'o2'].includes(m.k)) return;
        startSab(m.k);
        return;
      case 'fix': fix(i, m); return;
      case 'tdone': tdone(i, m.ti | 0, m.si | 0); return;
      case 'tfail': if (p.sampleAt) { p.sampleAt = H.t + 18; sendTasks(p); } return;
      case 'scan': p.scan = m.on && H.phase === 'play' && S.vtasks ? 1 : 0; return;
      case 'info': p.info = m.k === 'cams' || m.k === 'admin' ? m.k : null; return;
      case 'chat': chatMsg(i, m.x); return;
      case 'vote': castVote(i, Number.isInteger(m.v) ? m.v : -1); return;
      case 'sync': H.resend(i); return;
    }
  };
  H.resend = i => {
    const p = P[i];
    if (!p || p.bot) return;
    env.send(i, cfgFor(p));
    env.send(i, stFor(p));
    sendTasks(p);
    if (H.phase === 'meet' && H.meet) {
      const M = H.meet;
      env.send(i, { t: 'm', k: 'sync', caller: M.caller, body: M.body, ph: M.ph, tt: M.t, alive: P.map(q => q.alive ? 1 : 0), voted: M.votes.map(v => v === null ? 0 : 1), chat: M.chat.filter(c => !c.dead || !p.alive), res: M.res ? { cnt: M.res.cnt, votes: S.anon ? null : M.votes, ej: M.res.ej } : null, disc: S.disc, vote: S.vote });
    } else if (H.phase === 'eject') env.send(i, { t: 'm', k: 'eject', e: H.ejInfo, rejoin: 1 });
    else if (H.phase === 'over' && H.overInfo) env.send(i, Object.assign({ t: 'over' }, H.overInfo));
  };
  H.leave = i => { const p = P[i]; if (!p || p.bot) return; botInit(p); H.msg = (p.name + ' left. A bot took the seat.'); all({ t: 'ev', k: 'left', i }); if (H.phase === 'meet' && H.meet && H.meet.ph === 'vote' && H.meet.votes[i] === null && H.bots) H.bots.scheduleVote(p, H.meet); };
  H.dump = () => JSON.parse(JSON.stringify({ phase: H.phase, pt: H.pt, t: H.t, tot: H.tot, done: H.done, shown: H.shown, sab: H.sab, sabCd: H.sabCd, doorCd: H.doorCd, emCd: H.emCd, doors: H.doors, bodies: H.bodies, meet: H.meet, ejInfo: H.ejInfo, overInfo: H.overInfo, overT: H.overT, S, P: P.map(p => Object.assign({}, p, { b: p.b ? Object.assign({}, p.b, { kills: p.b.kills ? Array.from(p.b.kills) : [] }) : undefined })) }));
  H.load = d => {
    ['phase', 'pt', 't', 'tot', 'done', 'shown', 'sab', 'sabCd', 'doorCd', 'emCd', 'doors', 'bodies', 'meet', 'ejInfo', 'overInfo', 'overT'].forEach(k => { H[k] = d[k]; });
    d.P.forEach((q, i) => {
      const p = P[i];
      if (!p) return;
      const keep = { id: p.id, bot: p.bot, name: p.name, color: p.color };
      const nb = q.b;
      Object.assign(p, q, keep);
      if (p.bot && nb) { p.b = nb; p.b.kills = new Set(nb.kills || []); } else if (p.bot) H.bots.init(p);
    });
    setDoors();
  };
  H.step = dt => {
    H.t += dt;
    switch (H.phase) {
      case 'intro':
        H.pt -= dt;
        if (H.pt <= 0) { H.phase = 'play'; P.forEach(p => { if (p.role === 1) p.kcd = Math.min(S.kcd, 10); }); sendSt(); if (H.bots) H.bots.onResume(); }
        break;
      case 'play': playStep(dt); break;
      case 'meet': meetStep(dt); break;
      case 'eject': H.pt -= dt; if (H.pt <= 0) endEject(); break;
      case 'over': H.overT += dt; return;
    }
    H.snapT += dt; H.stT += dt;
    if (H.snapT >= 1 / 15) { H.snapT = 0; P.forEach(p => { if (!p.bot) env.send(p.i, snapFor(p), true); }); }
    if (H.stT >= .5) { H.stT = 0; sendSt(); }
  };
  H.act = { kill, report, emergency, ventIn, ventOut, ventMove, tdone, fix, startSab, closeDoors, castVote, chatMsg, resolveSab, visR, lightsOut, crewAlive, impAlive, checkWin, cname, speedOf, sendTasks };

  const ni = Math.min(S.imp, maxImp(n));
  init.players.forEach((d, i) => {
    P.push({ i, id: d.id || null, name: d.name, color: d.color, bot: !!d.bot, role: 0, alive: true, x: 48, y: 13, fx: 1, mv: 0, vent: -1, ventT: -9, ventK: 0, kcd: 0, tasks: [], emerg: S.emerg, allow: 0, scan: 0, info: null, sampleAt: 0, fix: 0 });
  });
  shuffle(Array.from({ length: n }, (_, i) => i)).slice(0, ni).forEach(i => { P[i].role = 1; });
  if (init.forceImp != null) { P.forEach(p => { p.role = 0; }); init.forceImp.forEach(i => { if (P[i]) P[i].role = 1; }); }
  const common = makeCommon(S);
  P.forEach(p => { p.tasks = makePlayerTasks(S, common); if (p.role === 0) H.tot += p.tasks.reduce((a, t) => a + t.steps.length, 0); });
  H.shown = 0;
  DM.fill(0);
  spawnAll();
  H.bots = makeBots(H, { P, S, n, out, all, visR, lightsOut, act: H.act, tasksDone, sendTasks });
  P.forEach(p => { if (p.bot) H.bots.init(p); });
  P.forEach(p => { if (!p.bot) { env.send(p.i, cfgFor(p)); } });
  sendSt();
  return H;
}

function makeBots(H, E) {
  const { P, S, n } = E;
  const A = E.act;
  const WORK = { wires: 4, swipe: 3.4, download: 6, upload: 5, calib: 5, chart: 4, steer: 3, o2f: 5, aster: 8, shield: 5, manif: 4, scan: 10, rstart: 7, align: 5, garb: 4, fuelcan: 2.5, fuelengine: 5, sample1: 4, sample2: 3 };
  const STIDS = Object.keys(ST).filter(k => k !== 'emerg');
  const M = { acc: [], lastMeta: null };
  const R = (a, b) => a + Math.random() * (b - a);
  const nm = i => P[i].name;
  const cellOf = (x, y) => Math.floor(y) * MW + Math.floor(x);
  const pathLen = (p, st) => { const v = field(st.nx, st.ny)[cellOf(p.x, p.y)]; return v < 0 ? 999 : v; };
  const canSee = (a, v) => dist(a.x, a.y, v.x, v.y) <= E.visR(a) && los(a.x, a.y, v.x, v.y);

  const init = p => {
    p.b = { sus: new Array(n).fill(0), seen: new Array(n).fill(null), goal: null, gw: 0, task: null, work: 0, working: false, job: null, rep: null, repT: 0, react: R(.3, 1.5), perc: R(0, .25), stuck: 0, tgt: -1, tgtT: 0, lost: 0, sabT: R(10, 25), mode: '', flee: 0, lines: [], mt: 0, vAt: -1, vt: 0, said: 0, scape: -1, ventT: 0, hops: 0, doorRoom: null, doorT: 0, selfRep: -1, selfT: 0 };
  };

  const stepTo = (p, gx, gy, dt) => {
    let tx = gx, ty = gy;
    if (!p.alive) { const d = Math.hypot(gx - p.x, gy - p.y); if (d < .05) { p.mv = 0; return true; } const k = Math.min(1, A.speedOf() * dt / d); moveBy(p, (gx - p.x) * k, (gy - p.y) * k, true); p.fx = gx >= p.x ? 1 : -1; p.mv = 1; return true; }
    if (!(los(p.x, p.y, gx, gy) && sweepClear(p.x, p.y, gx, gy))) {
      const w = flowTarget(field(gx, gy), p.x, p.y);
      if (!w) { p.mv = 0; return false; }
      if (w[2] !== 0) { tx = w[0]; ty = w[1]; }
    }
    const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
    if (d < .04) { p.mv = 0; return true; }
    const sp = A.speedOf() * dt, k = Math.min(1, sp / d), ox = p.x, oy = p.y;
    moveBy(p, dx * k, dy * k);
    p.fx = dx >= 0 ? 1 : -1; p.mv = 1;
    return Math.hypot(p.x - ox, p.y - oy) > sp * .2;
  };
  const walk = (p, gx, gy, dt, arrive) => {
    const b = p.b;
    if (dist(p.x, p.y, gx, gy) <= (arrive == null ? .45 : arrive)) { p.mv = 0; b.stuck = 0; return true; }
    if (stepTo(p, gx, gy, dt)) b.stuck = 0; else b.stuck += dt;
    return false;
  };
  const roam = (p, dt) => {
    const b = p.b;
    if (b.gw > 0) { b.gw -= dt; p.mv = 0; return; }
    if (!b.goal || b.stuck > 1.4) { const s = ST[pick(STIDS)]; b.goal = [s.nx, s.ny]; b.stuck = 0; }
    if (walk(p, b.goal[0], b.goal[1], dt)) { b.goal = null; b.gw = R(.5, 3); }
  };

  const perceive = p => {
    const b = p.b;
    if (!p.alive) return;
    const vr = E.visR(p);
    P.forEach(q => {
      if (q === p || !q.alive || q.vent >= 0) return;
      if (dist(p.x, p.y, q.x, q.y) <= vr && los(p.x, p.y, q.x, q.y)) b.seen[q.i] = { t: H.t, x: q.x, y: q.y };
    });
    if (H.phase !== 'play' || b.rep != null) return;
    for (const bd of H.bodies) {
      if (dist(p.x, p.y, bd.x, bd.y) > vr || !los(p.x, p.y, bd.x, bd.y)) continue;
      if (p.role === 0) { b.rep = bd.i; b.react = Math.max(b.react, R(.4, 1.2)); b.task = null; b.working = false; p.scan = 0; }
      else if (Math.random() < (b.kills && b.kills.has(bd.i) ? 0 : .12)) { b.rep = bd.i; b.react = R(.8, 2); }
      else b.rep = -5;
      return;
    }
  };

  const nextTask = p => {
    let best = null, bd = 1e9;
    p.tasks.forEach((t, ti) => t.steps.forEach((s, si) => {
      if (!taskAvail(t, si)) return;
      if (s.mg === 'sample2' && !(p.sampleAt && H.t >= p.sampleAt - .4)) return;
      const d = pathLen(p, ST[s.st]) + Math.random() * 8;
      if (d < bd) { bd = d; best = { ti, si, st: s.st, mg: s.mg }; }
    }));
    return best;
  };
  const doTask = (p, dt) => {
    const b = p.b;
    if (!b.task) { b.task = nextTask(p); b.working = false; if (!b.task) { roam(p, dt); return; } }
    const t = b.task, T = p.tasks[t.ti];
    if (!T || !taskAvail(T, t.si) || (t.mg === 'sample2' && !(p.sampleAt && H.t >= p.sampleAt - .4))) { b.task = null; p.scan = 0; b.working = false; return; }
    const st = ST[t.st];
    if (!walk(p, st.nx, st.ny, dt, .5)) { if (b.stuck > 1.6) { b.task = null; b.stuck = 0; } return; }
    if (!b.working) { b.working = true; b.work = (WORK[t.mg] || 4) * R(1.1, 1.8); if (t.mg === 'scan' && S.vtasks) p.scan = 1; }
    b.work -= dt;
    if (b.work <= 0) { p.scan = 0; b.working = false; A.tdone(p.i, t.ti, t.si); b.task = null; b.react = R(.2, .9); }
  };
  const fake = (p, dt) => {
    const b = p.b;
    if (b.mode === 'flee' && b.flee > 0) {
      b.flee -= dt;
      if (b.goal && walk(p, b.goal[0], b.goal[1], dt, .6)) { b.goal = null; b.gw = 0; b.flee = 0; }
      return;
    }
    if (!b.task) {
      const cand = [];
      p.tasks.forEach((t, ti) => t.steps.forEach((s, si) => { if (!s.done) cand.push({ ti, si, st: s.st, mg: s.mg }); }));
      b.task = cand.length && Math.random() < .8 ? pick(cand) : { ti: -1, si: -1, st: pick(STIDS), mg: 'x' };
      b.working = false;
    }
    const st = ST[b.task.st];
    if (!walk(p, st.nx, st.ny, dt, .5)) { if (b.stuck > 1.6) { b.task = null; b.stuck = 0; } return; }
    if (!b.working) { b.working = true; b.work = (WORK[b.task.mg] || 3) * R(.6, 1.1); }
    b.work -= dt;
    if (b.work <= 0) { b.working = false; b.task = null; }
  };

  const doReport = (p, dt) => {
    const b = p.b;
    if (b.rep === 'emerg') {
      const s = ST.emerg;
      if (H.emCd > 0 || p.emerg <= 0 || (H.sab && (H.sab.k === 'reactor' || H.sab.k === 'o2'))) { if (H.emCd > 0 && p.emerg > 0) { roamHold(p, dt); return; } b.rep = null; return; }
      if (walk(p, s.nx, s.ny, dt, 1.4)) { A.emergency(p.i); b.rep = null; }
      else if (b.stuck > 2) { b.rep = null; b.stuck = 0; }
      return;
    }
    const bd = H.bodies.find(x => x.i === b.rep);
    if (!bd) { b.rep = null; return; }
    if (dist(p.x, p.y, bd.x, bd.y) < 2.3) { p.mv = 0; b.react = 0; A.report(p.i, bd.i); b.rep = null; return; }
    if (!walk(p, bd.x, bd.y, dt, 2.2) && b.stuck > 2.5) { b.rep = null; b.stuck = 0; }
  };
  const roamHold = (p, dt) => { p.mv = 0; };

  const jobFor = (k, st, pn) => ({ k, st, p: pn, delay: R(.6, 3), t: 0, w: 2.2 });
  const doJob = (p, dt) => {
    const b = p.b, j = b.job, s = H.sab;
    if (!s || s.k !== j.k) { b.job = null; return; }
    if (j.delay > 0) { j.delay -= dt; p.mv = 0; return; }
    const st = ST[j.st];
    if (!walk(p, st.nx, st.ny, dt, .5)) { if (b.stuck > 2) { b.job = null; b.stuck = 0; } return; }
    j.t -= dt;
    if (j.k === 'lights') { if (j.t <= 0) { const idx = s.sw.findIndex(v => !v); if (idx >= 0) A.fix(p.i, { k: 'lights', s: idx }); else b.job = null; j.t = .5; } }
    else if (j.k === 'comms') { j.w -= dt; if (j.w <= 0) { A.fix(p.i, { k: 'comms' }); b.job = null; } }
    else if (j.k === 'o2') { j.w -= dt; if (j.w <= 0) { A.fix(p.i, { k: 'o2', p: j.p }); b.job = null; } }
    else if (j.k === 'reactor') { if (j.t <= 0) { A.fix(p.i, { k: 'reactor', p: j.p, on: 1 }); j.t = .4; } }
  };
  const assign = (k, list) => {
    const used = new Set();
    list.forEach(([sid, pn]) => {
      let best = null, bd = 1e9;
      P.forEach(q => {
        if (!q.bot || !q.alive || q.role !== 0 || q.vent >= 0 || used.has(q.i) || (q.b.job && q.b.job.k === k)) return;
        const d = pathLen(q, ST[sid]);
        if (d < bd) { bd = d; best = q; }
      });
      if (best && (k === 'reactor' || k === 'o2' || bd < 60)) { used.add(best.i); best.b.job = jobFor(k, sid, pn); best.b.task = null; best.b.working = false; best.scan = 0; }
    });
  };

  const watchers = (p, v) => {
    let c = 0;
    P.forEach(q => { if (q === p || q === v || !q.alive || q.vent >= 0 || q.role === 1) return; if (canSee(p, q) && dist(p.x, p.y, q.x, q.y) < E.visR(q) + 1) c++; });
    return c;
  };
  const choosePrey = p => {
    let best = -1, bs = 1e9;
    const lowCrew = A.crewAlive() <= A.impAlive() + 2;
    P.forEach(q => {
      if (q.role === 1 || !q.alive || q.vent >= 0 || !canSee(p, q)) return;
      const w = watchers(p, q), sc = dist(p.x, p.y, q.x, q.y) + w * 9 + Math.random() * 3;
      if (w > 0 && !(lowCrew && Math.random() < .5) && Math.random() > .06) return;
      if (sc < bs) { bs = sc; best = q.i; }
    });
    return best;
  };
  const anySees = p => P.some(q => q !== p && q.alive && q.vent < 0 && q.role === 0 && dist(p.x, p.y, q.x, q.y) < E.visR(q) + 1 && los(p.x, p.y, q.x, q.y));
  const afterKill = (p, vi) => {
    const b = p.b;
    (b.kills || (b.kills = new Set())).add(vi);
    b.tgt = -1; b.task = null; b.working = false; b.react = R(.3, .7);
    let vent = -1, vd = 5;
    VENTS.forEach(v => { const d = dist(p.x, p.y, v.x, v.y); if (d < vd) { vd = d; vent = v.id; } });
    b.doorRoom = null;
    const r = Math.random();
    if (vent >= 0 && !anySees(p) && r < .55) { b.mode = 'vent'; b.goalV = vent; b.flee = 6; return; }
    if (r < .78 && !anySees(p)) { b.selfRep = vi; b.selfT = R(1.6, 3); b.mode = 'selfrep'; return; }
    const rn = roomName(p.x, p.y);
    if (DOOR_ROOMS.includes(rn) && H.doorCd <= 0 && Math.random() < .35) { b.doorRoom = rn; b.doorT = 8; }
    const far = STIDS.map(k => ST[k]).filter(s => dist(s.x, s.y, p.x, p.y) > 12);
    const s = pick(far.length ? far : STIDS.map(k => ST[k]));
    b.goal = [s.nx, s.ny]; b.mode = 'flee'; b.flee = 10; b.stuck = 0;
  };
  const ventTick = (p, dt) => {
    const b = p.b;
    p.mv = 0;
    b.ventT -= dt;
    if (b.ventT > 0) return;
    if (b.hops > 0) { A.ventMove(p.i, pick(VENTS[p.vent].to)); b.hops--; b.ventT = R(1, 2.2); return; }
    if (anySees(p)) { b.ventT = .7; return; }
    A.ventOut(p.i);
    b.mode = ''; b.react = R(.4, .9);
  };
  const maybeSab = p => {
    if (H.sab || H.sabCd > 0 || H.phase !== 'play') return;
    if (P.some(q => q.bot && q.role === 1 && q.alive && q.i !== p.i && q.b.sabT < 3 && q.i < p.i)) return;
    const prog = H.tot ? H.done / H.tot : 0;
    const W = [['lights', 4], ['comms', 2], ['reactor', 1.5 + prog * 3], ['o2', 1.5 + prog * 3]];
    if (Math.random() < .55) return;
    let tot = W.reduce((a, w) => a + w[1], 0), r = Math.random() * tot, k = 'lights';
    for (const w of W) { if ((r -= w[1]) <= 0) { k = w[0]; break; } }
    H.act.startSab(k, true);
  };
  const impTick = (p, dt) => {
    const b = p.b;
    if (b.doorRoom) {
      b.doorT -= dt;
      if (roomName(p.x, p.y) !== b.doorRoom) { if (H.doorCd <= 0) A.closeDoors(b.doorRoom); b.doorRoom = null; } else if (b.doorT <= 0) b.doorRoom = null;
    }
    b.sabT -= dt;
    if (b.sabT <= 0) { b.sabT = R(9, 20); maybeSab(p); }
    if (b.rep != null && b.rep !== -5) {
      const bd = H.bodies.find(x => x.i === b.rep);
      if (!bd) { b.rep = null; } else if (dist(p.x, p.y, bd.x, bd.y) < 2.4) { A.report(p.i, bd.i); b.rep = null; return; } else { walk(p, bd.x, bd.y, dt, 2); return; }
    }
    if (b.mode === 'vent') {
      const v = VENTS[b.goalV];
      b.flee -= dt;
      if (b.flee < 0) { b.mode = ''; return; }
      if (dist(p.x, p.y, v.x, v.y) < 1.2) { if (!anySees(p) && A.ventIn(p.i, b.goalV)) { b.mode = 'ventd'; b.hops = rnd(3); b.ventT = R(1.2, 2.6); } else b.mode = ''; return; }
      walk(p, v.x, v.y, dt, 1.1);
      return;
    }
    if (b.mode === 'selfrep') {
      b.selfT -= dt;
      p.mv = 0;
      if (b.selfT <= 0) { const bd = H.bodies.find(x => x.i === b.selfRep); b.mode = ''; if (bd && dist(p.x, p.y, bd.x, bd.y) < 3) A.report(p.i, bd.i); }
      return;
    }
    if (p.kcd > 1.2 && p.kcd > 7) { b.tgt = -1; fake(p, dt); return; }
    b.tgtT -= dt;
    if (b.tgt >= 0) {
      const v = P[b.tgt];
      if (!v.alive || v.vent >= 0) b.tgt = -1;
      else if (!canSee(p, v)) { b.lost += dt; if (b.lost > 2.2) b.tgt = -1; } else b.lost = 0;
    }
    if (b.tgt < 0 && b.tgtT <= 0 && p.kcd <= 1.2) { b.tgtT = .3; b.tgt = choosePrey(p); b.lost = 0; }
    if (b.tgt >= 0) {
      const v = P[b.tgt], d = dist(p.x, p.y, v.x, v.y);
      if (p.kcd <= 0 && d <= KRANGE[S.krange] + .35) {
        if (watchers(p, v) === 0 || Math.random() < .15) { const vi = v.i; if (A.kill(p.i, vi)) afterKill(p, vi); else b.tgt = -1; return; }
        b.tgt = -1; return;
      }
      if (p.kcd <= 0 && d > 3 && watchers(p, v) > 0 && Math.random() < .02) { b.tgt = -1; return; }
      walk(p, v.x, v.y, dt, KRANGE[S.krange] * .6);
      return;
    }
    if (p.kcd <= 7) {
      if (!b.goal || b.stuck > 1.4) {
        let tgt = null, bt = -1;
        b.seen.forEach((s, j) => { if (s && j !== p.i && P[j].alive && P[j].role === 0 && H.t - s.t < 25 && s.t > bt && Math.random() < .6) { bt = s.t; tgt = s; } });
        if (tgt && Math.random() < .6) b.goal = [tgt.x, tgt.y]; else { const s = ST[pick(STIDS)]; b.goal = [s.nx, s.ny]; }
        b.stuck = 0;
      }
      if (walk(p, b.goal[0], b.goal[1], dt, .8)) { b.goal = null; b.seen.forEach((s, j) => { if (s && H.t - s.t < 4) b.seen[j] = null; }); }
      return;
    }
    fake(p, dt);
  };
  const crewTick = (p, dt) => {
    const b = p.b;
    if (b.job && !H.sab) b.job = null;
    if (b.job) { doJob(p, dt); return; }
    if (b.rep != null && b.rep !== -5) { doReport(p, dt); return; }
    doTask(p, dt);
  };
  const ghostTick = (p, dt) => {
    if (p.role === 0) doTask(p, dt); else p.mv = 0;
  };
  const botTick = (p, dt) => {
    const b = p.b;
    if (p.vent >= 0) { ventTick(p, dt); return; }
    b.perc -= dt;
    if (b.perc <= 0) { b.perc = R(.22, .34); perceive(p); }
    if (b.react > 0) { b.react -= dt; p.mv = 0; return; }
    if (!p.alive) { ghostTick(p, dt); return; }
    if (p.role === 1) impTick(p, dt); else crewTick(p, dt);
  };

  const tick = dt => { P.forEach(p => { if (p.bot && p.b) botTick(p, dt); }); };

  const reset = p => { const b = p.b; b.goal = null; b.task = null; b.working = false; b.job = null; b.rep = null; b.tgt = -1; b.mode = ''; b.flee = 0; b.selfRep = -1; b.doorRoom = null; b.react = R(.4, 2); b.stuck = 0; b.gw = 0; p.scan = 0; };
  const onResume = () => P.forEach(p => { if (p.bot && p.b) reset(p); });

  const onKill = (ki, vi, x, y) => {
    P.forEach(q => {
      if (!q.bot || !q.alive || q.i === ki || q.i === vi || q.role === 1 || q.vent >= 0) return;
      if (dist(q.x, q.y, x, y) <= E.visR(q) && los(q.x, q.y, x, y)) {
        q.b.sus[ki] = 100; q.b.rep = vi; q.b.react = R(.3, .9); q.b.task = null; q.b.working = false; q.b.job = null; q.scan = 0;
      }
    });
  };
  const onVent = (i, v) => {
    P.forEach(q => {
      if (!q.bot || !q.alive || q.i === i || q.role === 1) return;
      if (dist(q.x, q.y, VENTS[v].x, VENTS[v].y) <= E.visR(q) && los(q.x, q.y, VENTS[v].x, VENTS[v].y)) {
        q.b.sus[i] = 100;
        if (q.emerg > 0 && Math.random() < .6 && q.b.rep == null) { q.b.rep = 'emerg'; q.b.react = R(.4, 1); q.b.task = null; q.b.working = false; }
      }
    });
  };
  const onSab = k => {
    if (k === 'lights') assign(k, [['lights', 0], ...(Math.random() < .4 ? [['lights', 0]] : [])]);
    else if (k === 'comms') assign(k, [['comms', 0]]);
    else if (k === 'o2') assign(k, [['o2_1', 0], ['o2_2', 1]]);
    else if (k === 'reactor') assign(k, [['reactor1', 0], ['reactor2', 1]]);
  };

  const line = (p, at, text, meta) => { p.b.lines.push({ at, text, meta: meta || null }); };
  const myTask = p => {
    const c = [];
    p.tasks.forEach(t => { if (!t.steps.every(s => s.done)) c.push(taskLabel(t)); });
    return c.length ? pick(c) : null;
  };
  const room = (x, y) => roomName(x, y);
  const onMeeting = Mt => {
    M.acc = new Array(n).fill(0);
    M.lastMeta = null;
    const horizon = 3.4 + Math.max(S.disc, 10) * .8;
    P.forEach(p => {
      if (!p.bot || !p.b) return;
      const b = p.b;
      reset(p);
      b.lines = []; b.mt = 0; b.vAt = -1; b.vt = 0; b.said = 0; b.scape = -1;
      if (!p.alive) return;
      const me = p.i, victim = Mt.body >= 0 ? P[Mt.body] : null, bp = Mt.bpos;
      const near = [];
      if (bp) b.seen.forEach((s, j) => { if (s && j !== me && j !== Mt.body && H.t - s.t < 30 && dist(s.x, s.y, bp[0], bp[1]) < 10) near.push(j); });
      const crewTargets = P.filter(q => q.alive && q.i !== me && q.role === 0);
      if (Mt.caller === me) {
        if (victim) line(p, R(3.6, 4.2), `Found ${victim.name}'s body in ${room(bp[0], bp[1])}.`, { cl: 1 });
        else line(p, R(3.6, 4.4), pick(['Emergency meeting!', 'I had to call this, something is off.', 'Meeting! I saw something weird.']));
      }
      if (p.role === 0) {
        const w = b.sus.findIndex((v, j) => v >= 100 && P[j].alive);
        if (w >= 0) {
          if (victim && bp) line(p, R(4.2, 6), `${nm(w)} killed ${victim.name} in ${room(bp[0], bp[1])}! I saw it. Vote ${nm(w)}!`, { acc: w, w: 1 });
          else line(p, R(4.2, 6), `${nm(w)} just vented! I saw it, vote them out!`, { acc: w, w: 1 });
        } else {
          const cand = near.filter(j => P[j].alive);
          if (cand.length) { const j = pick(cand); const s = b.seen[j]; line(p, R(4.6, horizon * .7), `I saw ${nm(j)} near ${room(s.x, s.y)} not long ago.`, { acc: j }); b.sus[j] += 26; }
          else if (b.seen.some((s, j) => s && P[j].alive && j !== me)) {
            const js = []; b.seen.forEach((s, j) => { if (s && j !== me && P[j].alive && H.t - s.t < 40) js.push(j); });
            if (js.length) { const j = pick(js); line(p, R(4.6, horizon * .7), `I was around ${room(p.x, p.y)}, saw ${nm(j)} in ${room(b.seen[j].x, b.seen[j].y)}. Seemed fine.`, { clear: j }); }
          }
          if (b.said === 0 && !b.lines.length && Mt.caller !== me) line(p, R(5, horizon * .7), pick(['I have no info.', 'No idea, I was doing tasks.', 'Nothing from me. Skip?']));
          if (Math.random() < .35) { const tk = myTask(p); if (tk) line(p, R(horizon * .5, horizon), `I was doing ${tk.name} in ${tk.room}.`); }
        }
      } else {
        const mates = P.filter(q => q.role === 1).map(q => q.i);
        const pool = crewTargets.filter(q => !mates.includes(q.i));
        const nb = pool.filter(q => near.includes(q.i));
        const sc = nb.length ? pick(nb) : pool.length ? pick(pool) : null;
        if (sc) { b.scape = sc.i; }
        const r = Math.random();
        if (sc && r < .6) line(p, R(4.5, horizon * .7), pick([`${sc.name} was acting sus, I saw them near ${room(sc.x, sc.y)}.`, `I think it's ${sc.name}. Saw them close to the body.`, `${sc.name} was alone around here. Sus.`]), { acc: sc.i });
        else if (sc && r < .72) line(p, R(4.5, horizon * .7), `I saw ${sc.name} vent!`, { acc: sc.i, w: .5 });
        else line(p, R(5, horizon * .7), pick(['I have no info.', 'I was doing tasks, saw nothing.', 'Not sure who it is.']));
        if (Math.random() < .5) { const tk = myTask(p); if (tk) line(p, R(horizon * .5, horizon), `I was doing ${tk.name} in ${tk.room}.`); }
      }
      b.lines.sort((a, c) => a.at - c.at);
      for (let k = 1; k < b.lines.length; k++) if (b.lines[k].at - b.lines[k - 1].at < 1.4) b.lines[k].at = b.lines[k - 1].at + 1.4;
    });
  };

  const say = (p, text, meta) => {
    M.lastMeta = meta || null;
    const ok = A.chatMsg(p.i, text);
    M.lastMeta = null;
    if (ok) p.b.said++;
    return ok;
  };
  const hearMeta = (spk, meta) => {
    if (!meta) return;
    if (meta.acc != null && meta.acc >= 0 && P[meta.acc]) {
      M.acc[meta.acc] += meta.w ? 3 : 1;
      P.forEach(q => {
        if (!q.bot || !q.alive || q.i === spk) return;
        if (q.i === meta.acc) {
          if (Math.random() < .8 && q.b.said < 5 && !q.b.reply) q.b.lines.push({ at: q.b.mt + R(1.4, 3.2), text: pick([`That's false, ${nm(spk)}! I was in ${room(q.x, q.y)}.`, `Not me, ${nm(spk)}. I was doing tasks.`, `${nm(spk)}, you're lying. Vote ${nm(spk)}?`]), meta: Math.random() < .35 ? { acc: spk } : null });
          return;
        }
        const trust = q.b.sus[spk] >= 60 ? .1 : 1;
        q.b.sus[meta.acc] += (meta.w === 1 ? 60 : meta.w ? 28 : 14) * trust;
      });
    }
    if (meta.clear != null) P.forEach(q => { if (q.bot && q.i !== spk && q.b) q.b.sus[meta.clear] = Math.max(0, q.b.sus[meta.clear] - 8); });
  };
  const onChat = (i, text, dead) => {
    if (dead || !H.meet) return;
    if (P[i].bot) { hearMeta(i, M.lastMeta); return; }
    const low = ' ' + String(text).toLowerCase() + ' ';
    const acc = /sus|imp|vote|kill|vent|lying|liar|saw|\bit'?s\b|fake/.test(low), clr = /safe|clear|innocent|not (the )?imp|vouch|trust|ok\b/.test(low);
    P.forEach(t => {
      if (!t.alive || t.i === i) return;
      const names = [t.name.toLowerCase(), COLORS[t.color][0].toLowerCase()].filter(s => s.length > 1);
      if (!names.some(s => low.includes(s))) return;
      if (clr && !/sus|imp|kill|vent/.test(low)) { P.forEach(q => { if (q.bot && q.b && q.i !== t.i) q.b.sus[t.i] = Math.max(0, q.b.sus[t.i] - 12); }); return; }
      if (!acc) return;
      M.acc[t.i] += 1;
      P.forEach(q => {
        if (!q.bot || !q.alive || !q.b) return;
        if (q.i === t.i) { if (q.b.said < 5 && Math.random() < .7) q.b.lines.push({ at: q.b.mt + R(1.4, 3), text: pick([`Me? I was in ${room(q.x, q.y)} doing tasks, ${P[i].name}.`, `That's not true, ${P[i].name}. I'm crew.`, `${P[i].name}, why me? Where were you?`]), meta: null }); }
        else q.b.sus[t.i] += 15;
      });
    });
  };
  const decide = p => {
    const b = p.b, cand = P.filter(q => q.alive && q.i !== p.i);
    if (p.role === 0) {
      let best = -1, bs = 0;
      cand.forEach(q => { const s = b.sus[q.i] + M.acc[q.i] * 4; if (s > bs) { bs = s; best = q.i; } });
      return bs >= 45 ? best : -1;
    }
    const crew = cand.filter(q => q.role === 0), mates = cand.filter(q => q.role === 1);
    const top = mates.find(m => M.acc[m.i] >= 3);
    if (top && Math.random() < .4) return top.i;
    let best = -1, bs = 0;
    crew.forEach(q => { const s = M.acc[q.i] * 10 + (q.i === b.scape ? 12 : 0) + Math.random() * 4; if (s > bs) { bs = s; best = q.i; } });
    if (best >= 0 && bs >= 10) return best;
    return Math.random() < .5 && crew.length ? pick(crew).i : -1;
  };
  const scheduleVote = (p, Mt) => { if (p.b) { p.b.vAt = p.b.vt + R(1, 3); } };
  const meetTick = (Mt, dt) => {
    P.forEach(p => {
      if (!p.bot || !p.b || !p.alive) return;
      const b = p.b;
      b.mt += dt;
      if (Mt.ph === 'disc' || Mt.ph === 'vote') {
        if (b.lines.length && b.lines[0].at <= b.mt) {
          const l = b.lines.shift();
          if (b.said < 5 && !say(p, l.text, l.meta)) b.lines.unshift(Object.assign(l, { at: b.mt + 1.1 }));
        }
      }
      if (Mt.ph === 'vote') {
        b.vt += dt;
        if (b.vAt < 0) b.vAt = R(1.5, Math.min(14, S.vote * .5));
        if (b.vt >= b.vAt && Mt.votes[p.i] === null && !b.lines.length) A.castVote(p.i, decide(p));
        else if (b.vt >= b.vAt + 8 && Mt.votes[p.i] === null) A.castVote(p.i, decide(p));
      }
    });
  };
  const onEject = info => {
    P.forEach(p => { if (p.bot && p.b) p.b.sus.forEach((v, j) => { if (v < 100) p.b.sus[j] = v * .5; }); });
  };

  return { init, tick, onKill, onVent, onSab, onMeeting, onChat, meetTick, onEject, onResume, scheduleVote, onMeetingEnd: () => {} };
}

const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (h, k, t) => {
  const a = hexRgb(h), b = hexRgb(k);
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')';
};
const rr = (c, x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); };
const fillStroke = (c, f, s, lw) => { if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw || .05; c.stroke(); } };

const PROP = {
  table(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, x + .1, y + .14, w, h, .5); c.fill();
    [[-1.15, 0], [1.15, 0], [0, -1.15], [0, 1.15]].forEach(([dx, dy]) => { circ(c, cx + dx * w / 2 * 1.0, cy + dy * h / 2 * 1.0, .32); fillStroke(c, '#c9533f', '#3a2a36'); });
    rr(c, x, y, w, h, .9); fillStroke(c, '#e5e9f4', '#4b5470', .06);
    rr(c, x + .25, y + .25, w - .5, h - .5, .7); fillStroke(c, '#cfd6e8', null);
    circ(c, cx - .3, cy - .2, .22); fillStroke(c, '#fff', '#8a93ad', .04);
    circ(c, cx + .5, cy + .4, .18); fillStroke(c, '#f4c84a', '#8a6a1a', .04);
  },
  btn(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    c.fillStyle = 'rgba(0,0,0,.25)'; circ(c, cx + .08, cy + .1, .95); c.fill();
    circ(c, cx, cy, .9); fillStroke(c, '#59627d', '#262c3e', .06);
    circ(c, cx, cy, .62); fillStroke(c, '#c3cbe0', '#262c3e', .04);
    circ(c, cx, cy, .42); fillStroke(c, '#e0283a', '#7a0f1a', .05);
    circ(c, cx - .1, cy - .12, .12); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
  },
  turret(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    c.fillStyle = 'rgba(0,0,0,.25)'; circ(c, cx + .1, cy + .12, 1.25); c.fill();
    circ(c, cx, cy, 1.2); fillStroke(c, '#555e75', '#1d2232', .06);
    circ(c, cx, cy, .85); fillStroke(c, '#7a849d', '#1d2232', .05);
    rr(c, cx - .22, cy - 2.0, .44, 1.9, .12); fillStroke(c, '#3a4156', '#161a28', .05);
    rr(c, cx - .32, cy - 2.12, .64, .34, .1); fillStroke(c, '#c9533f', '#161a28', .05);
    circ(c, cx, cy, .3); fillStroke(c, '#2c3347', null);
  },
  tank(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    c.fillStyle = 'rgba(0,0,0,.22)'; circ(c, cx + .08, cy + .1, .95); c.fill();
    circ(c, cx, cy, .9); fillStroke(c, '#9fb7a9', '#2f4a3c', .06);
    circ(c, cx, cy, .62); fillStroke(c, '#46c97a', '#1f6a40', .05);
    circ(c, cx - .18, cy - .2, .16); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
  },
  navdesk(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, x + .1, y + .14, w, h, .25); c.fill();
    rr(c, x, y, w, h, .25); fillStroke(c, '#2a3248', '#12162a', .06);
    rr(c, x + .2, y + .2, w - .4, h * .5, .12); fillStroke(c, '#3fb0ff', '#0f3a66', .04);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .05; c.beginPath(); c.moveTo(x + .5, y + .9); c.lineTo(x + 1.1, y + .55); c.lineTo(x + 1.7, y + .8); c.lineTo(x + 2.3, y + .45); c.lineTo(x + 2.9, y + .7); c.stroke();
    for (let i = 0; i < 5; i++) { circ(c, x + .5 + i * .6, y + h - .45, .12); fillStroke(c, ['#e5553f', '#f4c84a', '#5ad17a', '#3fb0ff', '#e5553f'][i], null); }
  },
  shieldgen(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    c.fillStyle = 'rgba(0,0,0,.25)'; circ(c, cx + .1, cy + .12, 1.5); c.fill();
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .52; c.lineTo(cx + Math.cos(a) * 1.5, cy + Math.sin(a) * 1.5); } c.closePath(); fillStroke(c, '#41396b', '#171233', .07);
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .52; c.lineTo(cx + Math.cos(a) * 1.0, cy + Math.sin(a) * 1.0); } c.closePath(); fillStroke(c, '#7d6bd6', '#171233', .05);
    circ(c, cx, cy, .42); fillStroke(c, '#d9d1ff', '#5a46b8', .05);
  },
  radio(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, x + .1, y + .14, w, h, .2); c.fill();
    rr(c, x, y, w, h, .2); fillStroke(c, '#2c3a47', '#10181f', .06);
    for (let i = 0; i < 3; i++) { rr(c, x + .25 + i * 1.0, y + .25, .8, .6, .08); fillStroke(c, '#4fe0b0', '#0e3d30', .04); }
    for (let i = 0; i < 4; i++) { circ(c, x + .45 + i * .75, y + 1.4, .17); fillStroke(c, '#c9d3e0', '#10181f', .04); }
  },
  crate(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, x + .1, y + .14, w, h, .1); c.fill();
    rr(c, x, y, w, h, .1); fillStroke(c, '#a9854f', '#4a3718', .06);
    rr(c, x + .18, y + .18, w - .36, h - .36, .06); fillStroke(c, '#c19b60', '#6a5128', .04);
    c.strokeStyle = '#6a5128'; c.lineWidth = .06; c.beginPath(); c.moveTo(x + .18, y + .18); c.lineTo(x + w - .18, y + h - .18); c.moveTo(x + w - .18, y + .18); c.lineTo(x + .18, y + h - .18); c.stroke();
  },
  holo(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    c.fillStyle = 'rgba(0,0,0,.25)'; circ(c, cx + .1, cy + .12, 1.55); c.fill();
    circ(c, cx, cy, 1.5); fillStroke(c, '#33463a', '#0f1a12', .06);
    circ(c, cx, cy, 1.15); fillStroke(c, '#10261c', '#59d98f', .05);
    c.strokeStyle = 'rgba(120,255,190,.8)'; c.lineWidth = .05;
    c.beginPath(); c.moveTo(cx - .9, cy + .3); c.lineTo(cx - .3, cy - .5); c.lineTo(cx + .4, cy - .1); c.lineTo(cx + .9, cy - .6); c.moveTo(cx - .6, cy + .7); c.lineTo(cx + .5, cy + .6); c.stroke();
    circ(c, cx - .3, cy - .5, .08); c.fillStyle = '#9dffd0'; c.fill();
  },
  pillar(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, x + .08, y + .1, w, h, .12); c.fill();
    rr(c, x, y, w, h, .12); fillStroke(c, '#7a7f8c', '#2a2d38', .06);
    rr(c, x + .2, y + .2, w - .4, h - .4, .06); fillStroke(c, '#a4a9b6', null);
  },
  engine(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, x + .14, y + .2, w, h, .9); c.fill();
    rr(c, x, y, w, h, .9); fillStroke(c, '#7f8aa3', '#222838', .07);
    for (let i = 1; i < 5; i++) { c.strokeStyle = '#4b556e'; c.lineWidth = .07; c.beginPath(); c.moveTo(x + i * w / 5, y + .1); c.lineTo(x + i * w / 5, y + h - .1); c.stroke(); }
    rr(c, x + .3, y + .3, w - .6, h * .35, .4); c.fillStyle = 'rgba(255,255,255,.25)'; c.fill();
    circ(c, x + w - .5, y + h / 2, .75); fillStroke(c, '#ff9a3a', '#7a3a08', .06);
    circ(c, x + w - .5, y + h / 2, .4); fillStroke(c, '#ffe08a', null);
    circ(c, x + .5, y + h / 2, .55); fillStroke(c, '#4b556e', '#222838', .05);
  },
  core(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2, k = .74;
    c.fillStyle = 'rgba(0,0,0,.3)'; circ(c, cx + .12, cy + .16, 2.1 * k); c.fill();
    circ(c, cx, cy, 2.0 * k); fillStroke(c, '#6d4a4f', '#241013', .07);
    circ(c, cx, cy, 1.55 * k); fillStroke(c, '#2b1a1e', '#ff7a5c', .06);
    circ(c, cx, cy, 1.0 * k); fillStroke(c, '#ff6a4a', '#7a1f12', .05);
    circ(c, cx, cy, .5 * k); fillStroke(c, '#ffd9a0', null);
    c.strokeStyle = '#ffb08a'; c.lineWidth = .08;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.beginPath(); c.moveTo(cx + Math.cos(a) * 1.6 * k, cy + Math.sin(a) * 1.6 * k); c.lineTo(cx + Math.cos(a) * 1.95 * k, cy + Math.sin(a) * 1.95 * k); c.stroke(); }
  },
  bed(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, x + .08, y + .1, w, h, .2); c.fill();
    rr(c, x, y, w, h, .2); fillStroke(c, '#d9ece9', '#38605e', .06);
    rr(c, x + .12, y + .15, .8, h - .3, .18); fillStroke(c, '#ffffff', '#8fb5b2', .04);
    rr(c, x + 1.1, y + .12, w - 1.25, h - .24, .12); fillStroke(c, '#7fc9c6', '#38605e', .04);
  },
  desk(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, x + .08, y + .1, w, h, .12); c.fill();
    rr(c, x, y, w, h, .12); fillStroke(c, '#3b4560', '#12162a', .06);
    for (let i = 0; i < 3; i++) { rr(c, x + .25 + i * 1.6, y + .18, 1.2, .55, .06); fillStroke(c, '#6fd0ff', '#10304f', .04); }
  },
  locker_unused(c, x, y, w, h) {
    c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, x + .08, y + .1, w, h, .1); c.fill();
    rr(c, x, y, w, h, .1); fillStroke(c, '#6d7794', '#20263a', .06);
    c.strokeStyle = '#20263a'; c.lineWidth = .05; c.beginPath(); c.moveTo(x + w / 2, y + .1); c.lineTo(x + w / 2, y + h - .1); c.stroke();
  }
};

const STACC = { w_: '#f2a33a', dl: '#4fb4ff', up: '#4fb4ff', ga: '#8e9a50', ai: '#ff7a5c', fu: '#e8c33a', sw: '#e5553f', o2: '#5ad17a', re: '#ff5a4a', li: '#ffd84a', co: '#4fe0b0', ca: '#6fd0ff', ad: '#5ad98f', sc: '#6fe3d8', sa: '#c78bff', sh: '#9d8cff', ch: '#3fb0ff', st: '#3fb0ff', ma: '#f2a33a', rs: '#ff5a4a', as: '#ff7a5c', em: '#e0283a' };
const paintStation = (c, s) => {
  const vert = s.side === 'e' || s.side === 'w';
  const w = vert ? .75 : 1.9, h = vert ? 1.9 : .75, x = s.cx - w / 2, y = s.cy - h / 2;
  const acc = STACC[s.id.slice(0, 2)] || '#6fd0ff';
  if (s.id === 'admin' || s.id === 'emerg') return;
  if (s.id === 'scan') {
    circ(c, s.cx, s.y, 1.25); fillStroke(c, '#2d4c4a', '#6fe3d8', .07);
    circ(c, s.cx, s.y, .8); fillStroke(c, 'rgba(111,227,216,.25)', '#6fe3d8', .04);
    return;
  }
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, x + .06, y + .08, w, h, .1); c.fill();
  rr(c, x, y, w, h, .1); fillStroke(c, '#2a3146', '#10131f', .06);
  if (vert) rr(c, s.side === 'w' ? x + .28 : x + .08, y + .2, .4, h - .4, .06); else rr(c, x + .2, s.side === 'n' ? y + .28 : y + .08, w - .4, .4, .06);
  fillStroke(c, acc, null);
  c.fillStyle = 'rgba(255,255,255,.55)';
  if (vert) c.fillRect(s.side === 'w' ? x + .32 : x + .12, y + .26, .12, h * .35); else c.fillRect(x + .28, s.side === 'n' ? y + .32 : y + .12, w * .35, .12);
};
const paintVent = (c, v) => {
  rr(c, v.x - .55, v.y - .45, 1.1, .9, .1); fillStroke(c, '#454d62', '#12151f', .06);
  c.strokeStyle = '#12151f'; c.lineWidth = .06;
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(v.x - .42, v.y + i * .24); c.lineTo(v.x + .42, v.y + i * .24); c.stroke(); }
};

const paintWorld = (c, S, ox, oy, wT, hT, tiny) => {
  c.setTransform(S, 0, 0, S, -ox * S, -oy * S);
  c.fillStyle = '#05070d'; c.fillRect(ox, oy, wT, hT);
  const x0 = Math.max(0, ox), y0 = Math.max(0, oy), x1 = Math.min(MW, ox + wT), y1 = Math.min(MH, oy + hT);
  const fl = (cx, cy) => cx >= 0 && cy >= 0 && cx < MW && cy < MH && FL[cy * MW + cx] === 1;
  for (let cy = y0; cy < y1; cy++) for (let cx = x0; cx < x1; cx++) {
    const i = cy * MW + cx;
    if (FL[i]) {
      const r = RID[i], odd = (cx + cy) & 1;
      c.fillStyle = r ? (odd ? ROOMS[r - 1].b : ROOMS[r - 1].a) : (odd ? '#59627a' : '#525b73');
      c.fillRect(cx, cy, 1, 1);
    }
  }
  c.strokeStyle = 'rgba(0,0,0,.09)'; c.lineWidth = Math.max(1 / S, .02);
  c.beginPath();
  for (let cy = y0; cy < y1; cy++) for (let cx = x0; cx < x1; cx++) if (FL[cy * MW + cx]) { c.moveTo(cx, cy + 1); c.lineTo(cx + 1, cy + 1); c.lineTo(cx + 1, cy); }
  c.stroke();
  for (let cy = y0; cy < y1; cy++) for (let cx = x0; cx < x1; cx++) {
    if (!FL[cy * MW + cx]) continue;
    c.fillStyle = 'rgba(8,10,24,.2)';
    if (!fl(cx, cy - 1)) c.fillRect(cx, cy, 1, .3);
    if (!fl(cx, cy + 1)) c.fillRect(cx, cy + .78, 1, .22);
    if (!fl(cx - 1, cy)) c.fillRect(cx, cy, .26, 1);
    if (!fl(cx + 1, cy)) c.fillRect(cx + .78, cy, .22, 1);
  }
  for (let cy = Math.max(0, y0 - 1); cy < Math.min(MH, y1 + 1); cy++) for (let cx = Math.max(0, x0 - 1); cx < Math.min(MW, x1 + 1); cx++) {
    if (FL[cy * MW + cx]) continue;
    const n = fl(cx, cy - 1), s = fl(cx, cy + 1), w = fl(cx - 1, cy), e = fl(cx + 1, cy);
    const dg = fl(cx - 1, cy - 1) || fl(cx + 1, cy - 1) || fl(cx - 1, cy + 1) || fl(cx + 1, cy + 1);
    if (!(n || s || w || e || dg)) continue;
    c.fillStyle = '#323b52'; c.fillRect(cx, cy, 1, 1);
    c.fillStyle = '#5c6784';
    if (n) c.fillRect(cx, cy, 1, .22);
    if (s) c.fillRect(cx, cy + .78, 1, .22);
    if (w) c.fillRect(cx, cy, .22, 1);
    if (e) c.fillRect(cx + .78, cy, .22, 1);
    c.fillStyle = '#8c98b6';
    if (n) c.fillRect(cx, cy + .14, 1, .08);
    if (s) c.fillRect(cx, cy + .78, 1, .08);
    if (w) c.fillRect(cx + .14, cy, .08, 1);
    if (e) c.fillRect(cx + .78, cy, .08, 1);
    if (!n && !s && !w && !e && dg) {
      c.fillStyle = '#5c6784';
      if (fl(cx - 1, cy - 1)) c.fillRect(cx, cy, .22, .22);
      if (fl(cx + 1, cy - 1)) c.fillRect(cx + .78, cy, .22, .22);
      if (fl(cx - 1, cy + 1)) c.fillRect(cx, cy + .78, .22, .22);
      if (fl(cx + 1, cy + 1)) c.fillRect(cx + .78, cy + .78, .22, .22);
    }
  }
  const vis = (x, y, w, h) => x + w >= ox && x <= ox + wT && y + h >= oy && y <= oy + hT;
  c.save(); c.beginPath(); c.rect(ox, oy, wT, hT); c.clip();
  circ(c, 48, 11, 3.9); c.fillStyle = 'rgba(40,52,92,.22)'; c.fill();
  circ(c, 48, 11, 3.9); c.strokeStyle = 'rgba(40,52,92,.5)'; c.lineWidth = .1; c.stroke();
  circ(c, 28, 17.2, 1.6); c.fillStyle = 'rgba(0,0,0,.12)'; c.fill();
  circ(c, 7, 27.5, 3.1); c.strokeStyle = 'rgba(255,200,40,.55)'; c.lineWidth = .35; c.setLineDash([.6, .6]); c.stroke(); c.setLineDash([]);
  DOORS.forEach(d => {
    if (!vis(d.x - 1, d.y - 1, d.w + 2, d.h + 2)) return;
    c.fillStyle = '#20263a';
    if (d.w === 1) { c.fillRect(d.x, d.y - .06, 1, .16); c.fillRect(d.x, d.y + d.h - .1, 1, .16); } else { c.fillRect(d.x - .06, d.y, .16, 1); c.fillRect(d.x + d.w - .1, d.y, .16, 1); }
    c.fillStyle = 'rgba(255,200,40,.5)';
    if (d.w === 1) c.fillRect(d.x + .42, d.y + .1, .16, d.h - .2); else c.fillRect(d.x + .1, d.y + .42, d.w - .2, .16);
  });
  VENTS.forEach(v => { if (vis(v.x - 1, v.y - 1, 2, 2)) paintVent(c, v); });
  Object.values(ST).forEach(s => { if (vis(s.cx - 2, s.cy - 2, 4, 4)) paintStation(c, s); });
  OBS.forEach(o => { if (vis(o[0] - 1, o[1] - 1, o[2] + 3, o[3] + 3)) { const f = PROP[o[5]]; if (f) f(c, o[0], o[1], o[2], o[3]); } });
  if (!tiny) {
    c.font = '800 0.95px system-ui,Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    ROOMS.forEach(r => {
      if (!vis(r.x, r.y, r.w, r.h)) return;
      c.fillStyle = 'rgba(20,28,56,.22)';
      c.fillText(r.n.toUpperCase(), r.x + r.w / 2, r.n === 'Cafeteria' ? r.y + 1.5 : r.y + r.h - 1.1);
    });
  }
  c.restore();
};

const crewPath = (c, ph, ghost) => {
  const w = .3;
  c.beginPath();
  c.moveTo(-w, ghost ? -.02 : -.2);
  c.lineTo(-w, -.56);
  c.bezierCurveTo(-w, -.84, -.16, -.86, 0, -.86);
  c.bezierCurveTo(.16, -.86, w, -.84, w, -.56);
  c.lineTo(w, ghost ? -.02 : -.2);
  if (ghost) { const k = ph * 3; c.quadraticCurveTo(w * .66, .1 + Math.sin(k) * .05, w * .33, -.04); c.quadraticCurveTo(0, .12 + Math.sin(k + 1.6) * .05, -w * .33, -.04); c.quadraticCurveTo(-w * .66, .1 + Math.sin(k + 3.1) * .05, -w, -.02); }
  c.closePath();
};
const drawCrew = (c, x, y, S, col, o) => {
  const fx = o.fx >= 0 ? 1 : -1, ph = o.walk || 0, ghost = !!o.ghost;
  c.save();
  c.translate(x, y); c.scale(S, S);
  if (ghost) c.globalAlpha = (o.alpha == null ? 1 : o.alpha) * .55; else if (o.alpha != null) c.globalAlpha = o.alpha;
  const sc = o.sc || 1;
  if (sc !== 1) c.scale(sc, sc);
  const bob = o.moving ? -Math.abs(Math.sin(ph)) * .035 : 0;
  c.translate(0, bob);
  if (!ghost) c.fillStyle = 'rgba(0,0,0,.28)', c.beginPath(), c.ellipse(0, -.02, .34, .1, 0, 0, TAU), c.fill();
  const base = col[1], shade = col[2], line = '#0f1220';
  if (!ghost) {
    const l = o.moving ? Math.max(0, Math.sin(ph)) * .12 : 0, r = o.moving ? Math.max(0, -Math.sin(ph)) * .12 : 0;
    [[-.27, l], [.03, r]].forEach(([lx, lift]) => { rr(c, lx, -.3, .24, .3 - lift, .09); fillStroke(c, shade, line, .05); });
  }
  rr(c, fx > 0 ? -.45 : .27, -.62, .18, .46, .07); fillStroke(c, shade, line, .05);
  crewPath(c, ph, ghost);
  fillStroke(c, base, line, .055);
  c.save(); crewPath(c, ph, ghost); c.clip();
  c.fillStyle = shade; c.beginPath(); c.ellipse(-fx * .26, -.02, .46, .38, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.ellipse(fx * .02 - fx * .1, -.7, .16, .08, -.4 * fx, 0, TAU); c.fill();
  c.restore();
  crewPath(c, ph, ghost); c.strokeStyle = line; c.lineWidth = .055; c.stroke();
  rr(c, fx > 0 ? -.02 : -.36, -.7, .38, .22, .11);
  const g = c.createLinearGradient(0, -.7, 0, -.48); g.addColorStop(0, '#e8fbff'); g.addColorStop(1, '#7dc6e0');
  fillStroke(c, g, line, .05);
  rr(c, (fx > 0 ? -.02 : -.36) + .05, -.67, .15, .06, .03); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
  if (o.tint) { c.globalAlpha = .35; crewPath(c, ph, ghost); c.fillStyle = o.tint; c.fill(); }
  c.restore();
};
const drawBody = (c, x, y, S, col, a) => {
  c.save(); c.translate(x, y); c.scale(S, S);
  if (a != null) c.globalAlpha = a;
  const base = col[1], shade = col[2], line = '#0f1220';
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0, 0, .42, .13, 0, 0, TAU); c.fill();
  rr(c, -.45, -.5, .18, .38, .07); fillStroke(c, shade, line, .05);
  rr(c, -.3, -.34, .6, .34, .1); fillStroke(c, base, line, .055);
  c.save(); rr(c, -.3, -.34, .6, .34, .1); c.clip(); c.fillStyle = shade; c.beginPath(); c.ellipse(.15, .06, .5, .24, 0, 0, TAU); c.fill(); c.restore();
  rr(c, -.3, -.34, .6, .34, .1); c.strokeStyle = line; c.lineWidth = .055; c.stroke();
  c.beginPath(); c.ellipse(0, -.34, .3, .09, 0, 0, TAU); fillStroke(c, '#e0508a', line, .04);
  c.beginPath(); c.ellipse(0, -.34, .15, .045, 0, 0, TAU); c.fillStyle = '#f7d8e6'; c.fill();
  c.strokeStyle = line; c.lineWidth = .16; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -.34); c.lineTo(0, -.6); c.stroke();
  c.strokeStyle = '#f6f2e6'; c.lineWidth = .1; c.beginPath(); c.moveTo(0, -.34); c.lineTo(0, -.6); c.stroke();
  [[-.07, -.64], [.07, -.64]].forEach(([bx, by]) => { circ(c, bx, by, .075); fillStroke(c, '#f6f2e6', line, .035); });
  c.restore();
};
const crewIcon = (col, size) => {
  const cv = document.createElement('canvas'), d = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(size * d); cv.height = Math.round(size * 1.1 * d);
  const c = cv.getContext('2d');
  drawCrew(c, cv.width / 2, cv.height * .94, cv.width * .98, col, { fx: 1 });
  cv.style.width = size + 'px'; cv.style.height = size * 1.1 + 'px';
  return cv;
};
const crewSvg = (col, fx) => {
  const b = col[1], s = col[2], l = '#0f1220';
  const f = fx || 1;
  return `<svg viewBox="-0.55 -0.95 1.1 1.05" xmlns="http://www.w3.org/2000/svg" style="display:block;transform:scaleX(${f})"><rect x="-.45" y="-.62" width=".18" height=".46" rx=".07" fill="${s}" stroke="${l}" stroke-width=".05"/><rect x="-.27" y="-.3" width=".24" height=".3" rx=".09" fill="${s}" stroke="${l}" stroke-width=".05"/><rect x=".03" y="-.3" width=".24" height=".3" rx=".09" fill="${s}" stroke="${l}" stroke-width=".05"/><path d="M-.3 -.2V-.56C-.3 -.84 -.16 -.86 0 -.86S.3 -.84 .3 -.56V-.2Z" fill="${b}" stroke="${l}" stroke-width=".055"/><path d="M-.3 -.2V-.12C-.1 .1 .2 .05 .3 -.1V-.2Z" fill="${s}"/><rect x="-.02" y="-.7" width=".38" height=".22" rx=".11" fill="#a9e3f4" stroke="${l}" stroke-width=".05"/><rect x=".03" y="-.67" width=".15" height=".06" rx=".03" fill="#fff" opacity=".85"/></svg>`;
};

const NS = 'http://www.w3.org/2000/svg';
const sv = (p, tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; if (p) p.appendChild(e); return e; };
const mkSvg = b => sv(b, 'svg', { viewBox: '0 0 600 400', class: 'au-svg' });
const spt = (svg, e) => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 400 / r.height]; };
const dragOn = (svg, el, f) => {
  el.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    let p = spt(svg, e);
    if (f.down && f.down(p[0], p[1], e) === false) return;
    const mv = ev => { const q = spt(svg, ev); f.move && f.move(q[0], q[1], ev); };
    const up = ev => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); const q = spt(svg, ev); f.up && f.up(q[0], q[1], ev); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
};
const metal = (svg, w, h) => {
  const d = sv(svg, 'defs', {});
  const g = sv(d, 'linearGradient', { id: 'mg-m', x1: 0, y1: 0, x2: 0, y2: 1 });
  sv(g, 'stop', { offset: 0, 'stop-color': '#4a5568' }); sv(g, 'stop', { offset: 1, 'stop-color': '#2d3646' });
  sv(svg, 'rect', { x: 0, y: 0, width: 600, height: 400, fill: 'url(#mg-m)' });
  [[14, 14], [586, 14], [14, 386], [586, 386]].forEach(([x, y]) => { sv(svg, 'circle', { cx: x, cy: y, r: 6, fill: '#1c222d', stroke: '#6b778a', 'stroke-width': 1.5 }); sv(svg, 'path', { d: `M${x - 3} ${y - 3}l6 6`, stroke: '#6b778a', 'stroke-width': 1.5 }); });
};
const lcd = (svg, x, y, w, h, txt, col) => {
  sv(svg, 'rect', { x, y, width: w, height: h, rx: 6, fill: '#0b1a14', stroke: '#1f3a2e', 'stroke-width': 3 });
  return sv(svg, 'text', { x: x + w / 2, y: y + h / 2 + 7, 'text-anchor': 'middle', fill: col || '#5dffa0', 'font-size': 20, 'font-family': 'monospace', 'font-weight': 700 }, txt);
};
const btn = (svg, x, y, w, h, txt, fill, fn) => {
  const g = sv(svg, 'g', { style: 'cursor:pointer' });
  sv(g, 'rect', { x, y: y + 4, width: w, height: h, rx: 10, fill: '#00000066' });
  const r = sv(g, 'rect', { x, y, width: w, height: h, rx: 10, fill: fill || '#3b82f6', stroke: '#ffffff55', 'stroke-width': 2 });
  const t = sv(g, 'text', { x: x + w / 2, y: y + h / 2 + 7, 'text-anchor': 'middle', fill: '#fff', 'font-size': 22, 'font-weight': 800, 'font-family': 'system-ui,sans-serif', 'pointer-events': 'none' }, txt);
  if (fn) g.addEventListener('pointerdown', e => { e.preventDefault(); fn(e); });
  g.r = r; g.t = t;
  return g;
};
const shuf = a => shuffle(a.slice());

const MG = {};

MG.wires = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const col = ['#e53935', '#1e88e5', '#fdd835', '#d81b60'], L = shuf([0, 1, 2, 3]), Rr = shuf([0, 1, 2, 3]);
  const ys = [70, 155, 240, 325], done = [0, 0, 0, 0];
  sv(svg, 'rect', { x: 20, y: 36, width: 60, height: 328, rx: 10, fill: '#1c222d' });
  sv(svg, 'rect', { x: 520, y: 36, width: 60, height: 328, rx: 10, fill: '#1c222d' });
  const wires = [];
  L.forEach((ci, i) => {
    sv(svg, 'rect', { x: 62, y: ys[i] - 14, width: 22, height: 28, rx: 5, fill: col[ci] });
    const w = sv(svg, 'path', { d: '', fill: 'none', stroke: col[ci], 'stroke-width': 14, 'stroke-linecap': 'round' });
    const w2 = sv(svg, 'path', { d: '', fill: 'none', stroke: '#ffffff44', 'stroke-width': 4, 'stroke-linecap': 'round' });
    const set = (x, y) => { const d = `M72 ${ys[i]} C ${(72 + x) / 2} ${ys[i]}, ${(72 + x) / 2} ${y}, ${x} ${y}`; w.setAttribute('d', d); w2.setAttribute('d', d); };
    const tip = sv(svg, 'circle', { cx: 72, cy: ys[i], r: 18, fill: 'transparent', style: 'cursor:grab' });
    wires.push({ w, w2, set });
    dragOn(svg, tip, {
      down: () => { if (done[ci]) return false; },
      move: (x, y) => { wires[i].set(x, y); },
      up: (x, y) => {
        const ri = Rr.findIndex((rc, k) => rc === ci && Math.hypot(x - 528, y - ys[k]) < 42);
        if (ri >= 0) { done[ci] = 1; wires[i].set(528, ys[ri]); c.sfx('ok'); if (done.every(v => v)) c.win(); }
        else { wires[i].set(72, ys[i]); w.setAttribute('d', ''); w2.setAttribute('d', ''); c.sfx('click'); }
      }
    });
  });
  Rr.forEach((ci, i) => { sv(svg, 'rect', { x: 516, y: ys[i] - 14, width: 22, height: 28, rx: 5, fill: col[ci] }); });
};

MG.swipe = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  sv(svg, 'rect', { x: 60, y: 130, width: 480, height: 150, rx: 22, fill: '#222a38', stroke: '#5b677a', 'stroke-width': 4 });
  sv(svg, 'rect', { x: 100, y: 200, width: 400, height: 22, rx: 11, fill: '#0b0f16' });
  const msg = lcd(svg, 150, 50, 300, 54, 'PLEASE SWIPE CARD');
  const card = sv(svg, 'g', { style: 'cursor:grab' });
  sv(card, 'rect', { x: 0, y: 0, width: 180, height: 112, rx: 12, fill: '#e8edf5', stroke: '#9fb0c8', 'stroke-width': 3 });
  sv(card, 'rect', { x: 0, y: 18, width: 180, height: 22, fill: '#2d3646' });
  sv(card, 'rect', { x: 14, y: 58, width: 34, height: 26, rx: 5, fill: '#e8c74f' });
  sv(card, 'rect', { x: 62, y: 66, width: 96, height: 8, rx: 4, fill: '#9fb0c8' });
  sv(card, 'rect', { x: 62, y: 82, width: 60, height: 8, rx: 4, fill: '#c3cfdf' });
  let x = 70, t0 = 0, drag = false, ok = false;
  const put = () => card.setAttribute('transform', `translate(${x} ${156})`);
  put();
  const bad = (t) => { msg.textContent = t; msg.setAttribute('fill', '#ff6a5d'); c.sfx('bad'); x = 70; put(); };
  let off = 0;
  dragOn(svg, card, {
    down: (px) => { if (ok) return false; off = px - x; drag = true; t0 = 0; msg.textContent = 'PLEASE SWIPE CARD'; msg.setAttribute('fill', '#5dffa0'); },
    move: (px) => { if (!drag) return; x = clamp(px - off, 20, 410); put(); if (!t0 && x > 130) t0 = performance.now(); },
    up: () => {
      drag = false;
      if (x < 400) { bad('BAD READ. TRY AGAIN'); return; }
      const dt = (performance.now() - t0) / 1000;
      if (!t0) bad('BAD READ. TRY AGAIN'); else if (dt < .38) bad('TOO FAST. TRY AGAIN'); else if (dt > 1.15) bad('TOO SLOW. TRY AGAIN');
      else { ok = true; msg.textContent = 'ACCEPTED. THANK YOU'; c.sfx('ok'); c.after(.7, () => c.win()); }
    }
  });
};

const xfer = up => (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const A = up ? 'COMPUTER' : 'SERVER', B = up ? 'SERVER' : 'COMPUTER';
  const win = (x, label, ic) => {
    sv(svg, 'rect', { x, y: 70, width: 170, height: 130, rx: 10, fill: '#e8edf5', stroke: '#9fb0c8', 'stroke-width': 3 });
    sv(svg, 'rect', { x, y: 70, width: 170, height: 26, rx: 10, fill: '#3b82f6' });
    sv(svg, 'text', { x: x + 85, y: 89, 'text-anchor': 'middle', fill: '#fff', 'font-size': 14, 'font-weight': 800, 'font-family': 'sans-serif' }, label);
    sv(svg, 'path', { d: `M${x + 55} 140h24l8 -12h30v50h-62z`, fill: '#f2c14e', stroke: '#b78a1b', 'stroke-width': 3 });
  };
  win(60, A); win(370, B);
  sv(svg, 'path', { d: 'M245 135h110m-14-14l14 14-14 14', fill: 'none', stroke: '#aab6c8', 'stroke-width': 6, 'stroke-linecap': 'round' });
  sv(svg, 'rect', { x: 100, y: 250, width: 400, height: 28, rx: 14, fill: '#0b1a14', stroke: '#6b778a', 'stroke-width': 3 });
  const bar = sv(svg, 'rect', { x: 104, y: 254, width: 0, height: 20, rx: 10, fill: '#5dffa0' });
  const tx = sv(svg, 'text', { x: 300, y: 310, 'text-anchor': 'middle', fill: '#cfe', 'font-size': 20, 'font-family': 'monospace' }, '');
  const files = []; for (let i = 0; i < 4; i++) { const f = sv(svg, 'rect', { x: 0, y: 0, width: 26, height: 32, rx: 4, fill: '#fff', stroke: '#9fb0c8', 'stroke-width': 2, opacity: 0 }); files.push(f); }
  let run = 0, p = 0, go = btn(svg, 220, 330, 160, 48, up ? 'UPLOAD' : 'DOWNLOAD', '#16a34a', () => { if (run) return; run = 1; go.r.setAttribute('fill', '#475569'); go.t.textContent = '...'; c.sfx('click'); });
  const T = up ? 4.2 : 5.5;
  c.tick(dt => {
    if (!run || p >= 1) return;
    p = Math.min(1, p + dt / T);
    bar.setAttribute('width', 392 * p);
    tx.textContent = (up ? 'Uploading' : 'Downloading') + ' ' + Math.round(p * 100) + '%  ' + Math.max(0, Math.ceil((1 - p) * T)) + 's';
    files.forEach((f, i) => { const k = ((p * 6 + i / 4) % 1); f.setAttribute('opacity', k < .9 ? 1 : 0); f.setAttribute('x', 140 + k * 250); f.setAttribute('y', 112 - Math.sin(k * Math.PI) * 38); });
    if (p >= 1) { files.forEach(f => f.setAttribute('opacity', 0)); tx.textContent = 'COMPLETE'; c.sfx('ok'); c.after(.7, () => c.win()); }
  });
};
MG.download = xfer(false);
MG.upload = xfer(true);

MG.calib = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const rows = [], N = 3;
  for (let i = 0; i < N; i++) {
    const y = 40 + i * 105;
    sv(svg, 'rect', { x: 40, y, width: 380, height: 78, rx: 12, fill: '#1c222d', stroke: '#566175', 'stroke-width': 3 });
    const z = 70 + Math.random() * 160, zw = 54;
    sv(svg, 'rect', { x: 60 + z, y: y + 12, width: zw, height: 54, rx: 6, fill: '#1f6f4a' });
    const nd = sv(svg, 'rect', { x: 60, y: y + 8, width: 6, height: 62, rx: 3, fill: '#ffd84a' });
    const lamp = sv(svg, 'circle', { cx: 480, cy: y + 39, r: 22, fill: '#7f1d1d', stroke: '#000', 'stroke-width': 3 });
    const bt = btn(svg, 440, y + 62, 100, 32, 'LOCK', '#2563eb', () => {
      const r = rows[i]; if (r.ok || (i > 0 && !rows[i - 1].ok)) return;
      const x = 60 + r.pos * 350;
      if (x >= 60 + z - 3 && x <= 60 + z + zw + 3) { r.ok = 1; lamp.setAttribute('fill', '#22c55e'); c.sfx('ok'); if (rows.every(q => q.ok)) c.after(.5, () => c.win()); }
      else { lamp.setAttribute('fill', '#ef4444'); c.sfx('bad'); c.after(.35, () => lamp.setAttribute('fill', '#7f1d1d')); }
    });
    rows.push({ nd, ok: 0, pos: Math.random(), ph: Math.random() * 6, sp: 1.6 + i * .5 });
  }
  c.tick(dt => rows.forEach(r => { if (r.ok) return; r.ph += dt * r.sp; r.pos = (Math.sin(r.ph) + 1) / 2; r.nd.setAttribute('x', 60 + r.pos * 350); }));
};

MG.chart = (b, c) => {
  const svg = mkSvg(b);
  sv(svg, 'rect', { x: 0, y: 0, width: 600, height: 400, fill: '#0e2438' });
  for (let i = 0; i < 12; i++) { sv(svg, 'path', { d: `M${i * 50} 0V400`, stroke: '#17405f', 'stroke-width': 1 }); sv(svg, 'path', { d: `M0 ${i * 50}H600`, stroke: '#17405f', 'stroke-width': 1 }); }
  for (let i = 0; i < 40; i++) sv(svg, 'circle', { cx: Math.random() * 600, cy: Math.random() * 400, r: Math.random() * 1.6 + .4, fill: '#9cc8f0', opacity: .7 });
  const pts = [[60, 330], [190, 120], [320, 290], [430, 100], [545, 250]];
  sv(svg, 'path', { d: 'M' + pts.map(p => p.join(' ')).join('L'), fill: 'none', stroke: '#5ec8ff', 'stroke-width': 3, 'stroke-dasharray': '3 10', 'stroke-linecap': 'round' });
  const dots = pts.map((p, i) => sv(svg, 'circle', { cx: p[0], cy: p[1], r: i ? 16 : 6, fill: 'none', stroke: i ? '#ffd84a' : '#5ec8ff', 'stroke-width': 3 }));
  const ship = sv(svg, 'g', { style: 'cursor:grab' });
  sv(ship, 'path', { d: 'M0 -16L12 14L0 8L-12 14Z', fill: '#e8edf5', stroke: '#5ec8ff', 'stroke-width': 3 });
  sv(ship, 'circle', { r: 28, fill: 'transparent' });
  let idx = 0, x = pts[0][0], y = pts[0][1], ang = 0;
  const put = () => ship.setAttribute('transform', `translate(${x} ${y}) rotate(${ang})`);
  put();
  dragOn(svg, ship, {
    move: (px, py) => {
      const dx = px - x, dy = py - y;
      if (Math.hypot(dx, dy) > 2) ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      x = px; y = py; put();
      const n = pts[idx + 1];
      if (n && Math.hypot(x - n[0], y - n[1]) < 20) { idx++; dots[idx].setAttribute('fill', '#ffd84a55'); c.sfx('pop'); if (idx === pts.length - 1) { c.sfx('ok'); c.after(.5, () => c.win()); } }
    },
    up: () => { if (idx < pts.length - 1) { x = pts[idx][0]; y = pts[idx][1]; put(); } }
  });
};

MG.steer = (b, c) => {
  const svg = mkSvg(b);
  sv(svg, 'rect', { width: 600, height: 400, fill: '#0b1530' });
  for (let i = 0; i < 60; i++) sv(svg, 'circle', { cx: Math.random() * 600, cy: Math.random() * 400, r: Math.random() * 1.6 + .4, fill: '#cfe4ff', opacity: .8 });
  const cx = 300, cy = 200;
  sv(svg, 'circle', { cx, cy, r: 26, fill: 'none', stroke: '#38bdf8', 'stroke-width': 4 });
  sv(svg, 'circle', { cx, cy, r: 70, fill: 'none', stroke: '#38bdf855', 'stroke-width': 2, 'stroke-dasharray': '6 8' });
  sv(svg, 'path', { d: `M${cx - 100} ${cy}H${cx - 36}M${cx + 36} ${cy}H${cx + 100}M${cx} ${cy - 100}V${cy - 36}M${cx} ${cy + 36}V${cy + 100}`, stroke: '#38bdf8', 'stroke-width': 3 });
  const a = Math.random() * 6.28, mk = sv(svg, 'g', { style: 'cursor:grab' });
  sv(mk, 'circle', { r: 20, fill: 'none', stroke: '#fbbf24', 'stroke-width': 4 });
  sv(mk, 'path', { d: 'M-30 0H-10M10 0H30M0 -30V-10M0 10V30', stroke: '#fbbf24', 'stroke-width': 4 });
  sv(mk, 'circle', { r: 36, fill: 'transparent' });
  let x = cx + Math.cos(a) * 170, y = cy + Math.sin(a) * 120, ok = 0;
  const put = () => mk.setAttribute('transform', `translate(${x} ${y})`);
  put();
  dragOn(svg, mk, {
    down: () => { if (ok) return false; },
    move: (px, py) => { x = clamp(px, 20, 580); y = clamp(py, 20, 380); put(); },
    up: () => { if (Math.hypot(x - cx, y - cy) < 22) { ok = 1; x = cx; y = cy; put(); c.sfx('ok'); c.after(.6, () => c.win()); } else c.sfx('click'); }
  });
};

MG.o2f = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  sv(svg, 'rect', { x: 50, y: 70, width: 400, height: 260, rx: 30, fill: '#0f2a22', stroke: '#6fbf9a', 'stroke-width': 6 });
  sv(svg, 'rect', { x: 450, y: 170, width: 100, height: 60, fill: '#1c222d' });
  sv(svg, 'text', { x: 500, y: 205, 'text-anchor': 'middle', fill: '#6fbf9a', 'font-size': 18, 'font-family': 'monospace' }, 'OUT');
  sv(svg, 'path', { d: 'M470 150v-20m0 140v20', stroke: '#6fbf9a', 'stroke-width': 3 });
  let left = 6;
  const info = sv(svg, 'text', { x: 300, y: 365, 'text-anchor': 'middle', fill: '#cfe', 'font-size': 20, 'font-family': 'monospace' }, 'LEAVES: 6');
  for (let i = 0; i < 6; i++) {
    const g = sv(svg, 'g', { style: 'cursor:grab' });
    const lf = sv(g, 'path', { d: 'M0 -22C18 -18 22 8 0 24C-22 8 -18 -18 0 -22Z', fill: ['#4caf50', '#7cb342', '#2e7d32'][i % 3], stroke: '#1b5e20', 'stroke-width': 3 });
    sv(g, 'path', { d: 'M0 -18V20', stroke: '#1b5e20', 'stroke-width': 2 });
    sv(g, 'circle', { r: 30, fill: 'transparent' });
    let x = 90 + Math.random() * 310, y = 110 + Math.random() * 190, rot = Math.random() * 180, gone = 0;
    const put = () => g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`);
    put();
    dragOn(svg, g, {
      down: () => { svg.appendChild(g); },
      move: (px, py) => { x = clamp(px, 20, 580); y = clamp(py, 20, 380); rot += 3; put(); },
      up: () => {
        if (x > 465 && !gone) { gone = 1; left--; info.textContent = 'LEAVES: ' + left; c.sfx('pop'); g.setAttribute('opacity', 0); g.setAttribute('pointer-events', 'none'); if (!left) c.after(.5, () => c.win()); }
      }
    });
  }
};

MG.aster = (b, c) => {
  const svg = mkSvg(b);
  sv(svg, 'rect', { width: 600, height: 400, fill: '#050812' });
  for (let i = 0; i < 70; i++) sv(svg, 'circle', { cx: Math.random() * 600, cy: Math.random() * 400, r: Math.random() * 1.5 + .3, fill: '#fff', opacity: Math.random() * .8 + .2 });
  sv(svg, 'rect', { x: 4, y: 4, width: 592, height: 392, rx: 12, fill: 'none', stroke: '#2f6f5a', 'stroke-width': 4 });
  const cnt = sv(svg, 'text', { x: 20, y: 34, fill: '#5dffa0', 'font-size': 22, 'font-family': 'monospace', 'font-weight': 700 }, 'DESTROYED 0/20');
  const aim = sv(svg, 'g', { 'pointer-events': 'none' });
  sv(aim, 'circle', { r: 22, fill: 'none', stroke: '#5dffa0', 'stroke-width': 3 }); sv(aim, 'path', { d: 'M-34 0H-12M12 0H34M0 -34V-12M0 12V34', stroke: '#5dffa0', 'stroke-width': 3 });
  aim.setAttribute('transform', 'translate(300 200)');
  svg.addEventListener('pointermove', e => { const p = spt(svg, e); aim.setAttribute('transform', `translate(${p[0]} ${p[1]})`); });
  const A = []; let n = 0, spawn = 0, flash = [];
  const boom = (x, y) => { const r = sv(svg, 'circle', { cx: x, cy: y, r: 6, fill: '#ffd84a', opacity: 1 }); flash.push({ r, t: 0 }); };
  const mk = () => {
    const r = 18 + Math.random() * 18, g = sv(svg, 'g', { style: 'cursor:crosshair' });
    const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, k = r * (.78 + Math.random() * .3); pts.push((Math.cos(a) * k).toFixed(1) + ' ' + (Math.sin(a) * k).toFixed(1)); }
    sv(g, 'path', { d: 'M' + pts.join('L') + 'Z', fill: '#7a6a5a', stroke: '#4a3d33', 'stroke-width': 3 });
    sv(g, 'circle', { cx: -r * .25, cy: -r * .2, r: r * .22, fill: '#5e5145' });
    sv(g, 'circle', { r: r + 12, fill: 'transparent' });
    const o = { g, x: 640, y: 50 + Math.random() * 300, vx: -(120 + Math.random() * 130), vy: (Math.random() - .5) * 60, r, rot: 0, vr: (Math.random() - .5) * 120 };
    g.addEventListener('pointerdown', e => { e.preventDefault(); if (o.dead) return; o.dead = 1; g.remove(); boom(o.x, o.y); c.sfx('zap'); n++; cnt.textContent = 'DESTROYED ' + n + '/20'; if (n >= 20) { c.sfx('ok'); c.after(.5, () => c.win()); } });
    A.push(o);
  };
  c.tick(dt => {
    spawn -= dt; if (spawn <= 0 && n < 20) { mk(); spawn = .45 + Math.random() * .5; }
    A.forEach(o => { if (o.dead) return; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt; if (o.x < -60) { o.x = 650; o.y = 50 + Math.random() * 300; } o.g.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.rot})`); });
    flash = flash.filter(f => { f.t += dt * 3; f.r.setAttribute('r', 6 + f.t * 40); f.r.setAttribute('opacity', 1 - f.t); if (f.t >= 1) { f.r.remove(); return false; } return true; });
  });
};

MG.shield = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const cen = [[300, 200], [300, 80], [404, 140], [404, 260], [300, 320], [196, 260], [196, 140]], on = cen.map(() => 1);
  const idx = shuf([0, 1, 2, 3, 4, 5, 6]).slice(0, 3 + rnd(3)); idx.forEach(i => { on[i] = 0; });
  const hex = (x, y, r) => 'M' + [0, 1, 2, 3, 4, 5].map(k => (x + Math.cos(k * 1.0472 + .5236) * r).toFixed(1) + ' ' + (y + Math.sin(k * 1.0472 + .5236) * r).toFixed(1)).join('L') + 'Z';
  const els = cen.map(([x, y], i) => {
    const p = sv(svg, 'path', { d: hex(x, y, 58), fill: on[i] ? '#e8edf5' : '#c0392b', stroke: '#1c222d', 'stroke-width': 6, style: 'cursor:pointer' });
    p.addEventListener('pointerdown', e => { e.preventDefault(); if (on[i]) return; on[i] = 1; p.setAttribute('fill', '#e8edf5'); c.sfx('click'); if (on.every(v => v)) { c.sfx('ok'); c.after(.6, () => c.win()); } });
    return p;
  });
};

MG.manif = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const nums = shuf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); let nx = 1;
  const bs = [];
  nums.forEach((v, i) => {
    const x = 60 + (i % 5) * 100, y = 100 + Math.floor(i / 5) * 120;
    const g = btn(svg, x, y, 84, 84, String(v), '#374151', () => {
      if (v === nx) { g.r.setAttribute('fill', '#facc15'); g.t.setAttribute('fill', '#111'); nx++; c.sfx('click'); if (nx > 10) { c.sfx('ok'); c.after(.6, () => c.win()); } }
      else if (nx <= 10) { nx = 1; bs.forEach(q => { q.r.setAttribute('fill', '#374151'); q.t.setAttribute('fill', '#fff'); }); c.sfx('bad'); }
    });
    g.t.setAttribute('font-size', 36); g.t.setAttribute('y', y + 54);
    bs.push(g);
  });
  lcd(svg, 150, 28, 300, 44, 'PRESS IN ORDER 1-10');
};

MG.scan = (b, c) => {
  const svg = mkSvg(b);
  sv(svg, 'rect', { width: 600, height: 400, fill: '#0a1c26' });
  const defs = sv(svg, 'defs', {}), g = sv(defs, 'linearGradient', { id: 'sc-g', x1: 0, y1: 0, x2: 0, y2: 1 });
  sv(g, 'stop', { offset: 0, 'stop-color': '#38bdf800' }); sv(g, 'stop', { offset: .5, 'stop-color': '#38bdf8aa' }); sv(g, 'stop', { offset: 1, 'stop-color': '#38bdf800' });
  sv(svg, 'rect', { x: 200, y: 40, width: 200, height: 320, rx: 16, fill: '#10303f', stroke: '#38bdf8', 'stroke-width': 4 });
  const hold = document.createElement('div');
  hold.style.cssText = 'position:absolute;left:36%;top:14%;width:28%;height:70%;pointer-events:none';
  hold.innerHTML = c.crew();
  b.appendChild(hold);
  const bar = sv(svg, 'rect', { x: 200, y: 40, width: 200, height: 60, fill: 'url(#sc-g)' });
  const tx = sv(svg, 'text', { x: 300, y: 385, 'text-anchor': 'middle', fill: '#5dffa0', 'font-size': 22, 'font-family': 'monospace', 'font-weight': 700 }, 'SCANNING 0%');
  [[40, 120, 'HT'], [40, 170, 'WT'], [40, 220, 'ID']].forEach(([x, y, k]) => sv(svg, 'text', { x, y, fill: '#7fd0f0', 'font-size': 18, 'font-family': 'monospace' }, k + ' ' + (k === 'HT' ? '3\'7"' : k === 'WT' ? '92 lbs' : c.name)));
  let p = 0; c.scanOn(1);
  c.tick(dt => {
    if (p >= 1) return;
    p = Math.min(1, p + dt / 10);
    bar.setAttribute('y', 40 + (Math.abs(((p * 5) % 2) - 1)) * 260);
    tx.textContent = 'SCANNING ' + Math.round(p * 100) + '%';
    if (p >= 1) { tx.textContent = 'SCAN COMPLETE'; c.sfx('ok'); c.scanOn(0); c.after(.7, () => c.win()); }
  });
};

MG.rstart = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const seq = Array.from({ length: 5 }, () => rnd(9)), cells = [], F = [262, 294, 330, 349, 392, 440, 494, 523, 587];
  let lvl = 1, pos = 0, busy = 1;
  const stat = lcd(svg, 150, 20, 300, 44, 'WATCH');
  const lit = (i, on) => cells[i].r.setAttribute('fill', on ? '#fde047' : '#3b82f6');
  for (let i = 0; i < 9; i++) {
    const g = btn(svg, 175 + (i % 3) * 90, 90 + Math.floor(i / 3) * 90, 80, 80, '', '#3b82f6', () => {
      if (busy) return;
      lit(i, 1); c.tone(F[i], .2); c.after(.18, () => lit(i, 0));
      if (seq[pos] === i) { pos++; if (pos === lvl) { pos = 0; if (lvl === 5) { busy = 1; stat.textContent = 'ACCEPTED'; c.sfx('ok'); c.after(.7, () => c.win()); } else { lvl++; busy = 1; stat.textContent = 'WATCH'; c.after(.8, show); } } }
      else { busy = 1; pos = 0; stat.textContent = 'WRONG'; stat.setAttribute('fill', '#ff6a5d'); c.sfx('bad'); c.after(1, () => { stat.setAttribute('fill', '#5dffa0'); stat.textContent = 'WATCH'; show(); }); }
    });
    cells.push(g);
  }
  const show = () => {
    busy = 1; let k = 0;
    const step = () => { if (k >= lvl) { busy = 0; stat.textContent = 'REPEAT'; return; } const i = seq[k++]; lit(i, 1); c.tone(F[i], .3); c.after(.35, () => { lit(i, 0); c.after(.15, step); }); };
    step();
  };
  c.after(.7, show);
};

MG.align = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const target = .15 + Math.random() * .7;
  sv(svg, 'rect', { x: 90, y: 40, width: 40, height: 320, rx: 20, fill: '#0b0f16', stroke: '#6b778a', 'stroke-width': 3 });
  sv(svg, 'rect', { x: 250, y: 60, width: 280, height: 280, rx: 16, fill: '#10161f', stroke: '#566175', 'stroke-width': 3 });
  const ty = 80 + target * 240;
  sv(svg, 'path', { d: `M250 ${ty}H530`, stroke: '#facc15', 'stroke-width': 3, 'stroke-dasharray': '10 8' });
  const beam = sv(svg, 'rect', { x: 262, y: 0, width: 256, height: 10, rx: 5, fill: '#38bdf8' });
  const knob = sv(svg, 'g', { style: 'cursor:grab' });
  sv(knob, 'rect', { x: 70, y: -16, width: 80, height: 32, rx: 8, fill: '#e8edf5', stroke: '#9fb0c8', 'stroke-width': 3 });
  sv(knob, 'rect', { x: 70, y: -40, width: 80, height: 80, fill: 'transparent' });
  let y = 60 + Math.random() * 280, ok = 0;
  const put = () => { knob.setAttribute('transform', `translate(0 ${y})`); beam.setAttribute('y', 80 + (y - 40) / 320 * 240 - 5); const d = Math.abs(beam.getAttribute('y') * 1 + 5 - ty); beam.setAttribute('fill', d < 6 ? '#22c55e' : '#38bdf8'); return d; };
  put();
  dragOn(svg, knob, {
    down: () => { if (ok) return false; },
    move: (px, py) => { y = clamp(py, 40, 360); put(); },
    up: () => { if (put() < 6) { ok = 1; c.sfx('ok'); c.after(.6, () => c.win()); } }
  });
};

MG.garb = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  sv(svg, 'rect', { x: 80, y: 40, width: 260, height: 320, rx: 14, fill: '#10161f', stroke: '#566175', 'stroke-width': 4 });
  const junk = []; for (let i = 0; i < 12; i++) junk.push(sv(svg, 'rect', { x: 100 + Math.random() * 190, y: 60 + Math.random() * 220, width: 22 + Math.random() * 20, height: 18 + Math.random() * 20, rx: 4, fill: ['#8d6e63', '#78909c', '#a1887f', '#90a4ae'][i % 4], transform: `rotate(${rnd(360)} 200 200)` }));
  sv(svg, 'rect', { x: 440, y: 50, width: 26, height: 300, rx: 13, fill: '#0b0f16' });
  const lv = sv(svg, 'g', { style: 'cursor:grab' });
  sv(lv, 'rect', { x: 430, y: -10, width: 46, height: 20, rx: 10, fill: '#ef4444', stroke: '#7f1d1d', 'stroke-width': 3 });
  sv(lv, 'rect', { x: 425, y: -30, width: 56, height: 60, fill: 'transparent' });
  const tx = sv(svg, 'text', { x: 300, y: 385, 'text-anchor': 'middle', fill: '#cfe', 'font-size': 20, 'font-family': 'monospace' }, 'PULL THE LEVER DOWN AND HOLD');
  let y = 70, held = 0, prog = 0, ok = 0;
  const put = () => lv.setAttribute('transform', `translate(0 ${y})`);
  put();
  dragOn(svg, lv, {
    down: () => { if (ok) return false; held = 1; },
    move: (px, py) => { y = clamp(py, 70, 330); put(); },
    up: () => { held = 0; }
  });
  c.tick(dt => {
    if (ok) return;
    if (!held && y > 70) { y = Math.max(70, y - 400 * dt); put(); }
    if (held && y > 300) { prog = Math.min(1, prog + dt / 3.2); junk.forEach((j, i) => { j.setAttribute('opacity', Math.max(0, 1 - Math.max(0, prog * 1.4 - i / 14) * 3)); }); tx.textContent = 'EMPTYING ' + Math.round(prog * 100) + '%'; if (prog >= 1) { ok = 1; c.sfx('ok'); tx.textContent = 'CHUTE CLEAR'; c.after(.7, () => c.win()); } }
  });
};

const holdMg = (label, hint, secs, fillCol, vis) => (b, c) => {
  const svg = mkSvg(b); metal(svg);
  sv(svg, 'rect', { x: 120, y: 60, width: 150, height: 250, rx: 16, fill: '#10161f', stroke: '#566175', 'stroke-width': 4 });
  const lvl = sv(svg, 'rect', { x: 126, y: 304, width: 138, height: 0, rx: 10, fill: fillCol });
  vis(svg);
  const tx = sv(svg, 'text', { x: 300, y: 385, 'text-anchor': 'middle', fill: '#cfe', 'font-size': 20, 'font-family': 'monospace' }, hint);
  let p = 0, held = 0, ok = 0;
  const g = btn(svg, 350, 150, 180, 70, label, '#16a34a', () => { held = 1; });
  const rel = () => { held = 0; };
  svg.addEventListener('pointerup', rel); svg.addEventListener('pointercancel', rel); svg.addEventListener('pointerleave', rel);
  c.tick(dt => {
    if (ok) return;
    if (held) { p = Math.min(1, p + dt / secs); if (Math.random() < dt * 14) c.tone(300 + p * 300, .05, 'sine', .03); }
    lvl.setAttribute('height', 238 * p); lvl.setAttribute('y', 304 - 238 * p);
    tx.textContent = Math.round(p * 100) + '%';
    if (p >= 1) { ok = 1; c.sfx('ok'); c.after(.6, () => c.win()); }
  });
};
MG.fuelcan = holdMg('HOLD TO FILL', 'HOLD THE BUTTON', 3, '#f59e0b', svg => { sv(svg, 'path', { d: 'M170 40h50v20h-50z', fill: '#f59e0b' }); });
MG.fuelengine = holdMg('HOLD TO POUR', 'HOLD THE BUTTON', 4, '#f97316', svg => { sv(svg, 'rect', { x: 390, y: 260, width: 100, height: 70, rx: 10, fill: '#566175' }); sv(svg, 'rect', { x: 360, y: 280, width: 30, height: 20, fill: '#566175' }); });

MG.sample1 = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  for (let i = 0; i < 5; i++) { sv(svg, 'rect', { x: 100 + i * 80, y: 120, width: 44, height: 130, rx: 14, fill: '#cfe8ff44', stroke: '#9fb0c8', 'stroke-width': 3 }); sv(svg, 'rect', { x: 104 + i * 80, y: 170, width: 36, height: 76, rx: 10, fill: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'][i] }); }
  const tx = lcd(svg, 150, 36, 300, 50, 'PLACE SAMPLES');
  let go = btn(svg, 210, 290, 180, 60, 'START ANALYSIS', '#16a34a', () => {
    if (go.d) return; go.d = 1; go.r.setAttribute('fill', '#475569'); tx.textContent = 'ANALYSING...'; c.sfx('click');
    c.after(1.6, () => { tx.textContent = 'RESULT IN ~30S'; c.sfx('ok'); c.after(1.1, () => c.win()); });
  });
};
MG.sample2 = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const odd = rnd(5), tx = lcd(svg, 120, 30, 360, 50, 'SELECT THE ANOMALY');
  for (let i = 0; i < 5; i++) {
    const x = 70 + i * 100, bad = i === odd;
    const g = sv(svg, 'g', { style: 'cursor:pointer' });
    sv(g, 'rect', { x, y: 110, width: 56, height: 150, rx: 18, fill: '#cfe8ff33', stroke: '#9fb0c8', 'stroke-width': 3 });
    const f = sv(g, 'rect', { x: x + 4, y: 170 + (bad ? 4 : 0), width: 48, height: 86 - (bad ? 4 : 0), rx: 14, fill: bad ? '#ef4444' : '#22c55e' });
    sv(g, 'circle', { cx: x + 14 + (bad ? 10 : 0), cy: 196, r: 4, fill: '#ffffff88' });
    const bt = btn(svg, x - 4, 290, 64, 36, 'PICK', '#3b82f6', () => {
      if (bad) { f.setAttribute('fill', '#ef4444'); tx.textContent = 'CORRECT'; c.sfx('ok'); c.after(.7, () => c.win()); }
      else { tx.textContent = 'WRONG. RE-ANALYSING'; tx.setAttribute('fill', '#ff6a5d'); c.sfx('bad'); c.after(1, () => c.fail()); }
    });
    bt.t.setAttribute('font-size', 18);
  }
};

MG.lights = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  lcd(svg, 150, 24, 300, 44, 'FIX THE LIGHTS');
  const sw = [];
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 104;
    sv(svg, 'rect', { x, y: 120, width: 70, height: 190, rx: 12, fill: '#10161f', stroke: '#566175', 'stroke-width': 4 });
    const led = sv(svg, 'circle', { cx: x + 35, cy: 100, r: 9, fill: '#7f1d1d' });
    const lv = sv(svg, 'rect', { x: x + 20, y: 140, width: 30, height: 80, rx: 10, fill: '#e8edf5', stroke: '#9fb0c8', 'stroke-width': 3 });
    const hit = sv(svg, 'rect', { x, y: 120, width: 70, height: 190, fill: 'transparent', style: 'cursor:pointer' });
    hit.addEventListener('pointerdown', e => { e.preventDefault(); c.send({ t: 'fix', k: 'lights', s: i }); c.sfx('click'); });
    sw.push({ led, lv });
  }
  c.onState(() => {
    const s = c.sab();
    if (!s || s.k !== 'lights') return;
    s.sw.forEach((v, i) => { sw[i].lv.setAttribute('y', v ? 140 : 210); sw[i].lv.setAttribute('fill', v ? '#e8edf5' : '#9fb0c8'); sw[i].led.setAttribute('fill', v ? '#22c55e' : '#7f1d1d'); });
  });
};

MG.comms = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  lcd(svg, 150, 24, 300, 44, 'RESTORE COMMS');
  const T = .15 + Math.random() * .7;
  sv(svg, 'rect', { x: 60, y: 160, width: 480, height: 40, rx: 20, fill: '#0b0f16', stroke: '#566175', 'stroke-width': 3 });
  sv(svg, 'rect', { x: 60 + T * 480 - 22, y: 150, width: 44, height: 60, rx: 8, fill: '#22c55e44', stroke: '#22c55e', 'stroke-width': 3 });
  const knob = sv(svg, 'g', { style: 'cursor:grab' });
  sv(knob, 'circle', { r: 20, fill: '#e8edf5', stroke: '#9fb0c8', 'stroke-width': 4 }); sv(knob, 'circle', { r: 40, fill: 'transparent' });
  const wave = sv(svg, 'path', { d: '', fill: 'none', stroke: '#38bdf8', 'stroke-width': 3 });
  let x = 100 + Math.random() * 400, ok = 0, hold = 0, ph = 0;
  const put = () => knob.setAttribute('transform', `translate(${x} 180)`);
  put();
  dragOn(svg, knob, { down: () => { if (ok) return false; }, move: px => { x = clamp(px, 60, 540); put(); } });
  c.tick(dt => {
    if (ok) return;
    ph += dt * 6;
    const err = Math.abs((x - 60) / 480 - T), amp = Math.min(40, err * 200);
    let d = 'M60 290'; for (let i = 0; i <= 48; i++) d += `L${60 + i * 10} ${290 + Math.sin(i * (.3 + err * 6) + ph) * amp}`;
    wave.setAttribute('d', d); wave.setAttribute('stroke', err < .025 ? '#22c55e' : '#38bdf8');
    if (err < .025) { hold += dt; if (hold > .9) { ok = 1; c.sfx('ok'); c.send({ t: 'fix', k: 'comms' }); } } else hold = 0;
  });
};

MG.o2 = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  const code = String(c.sab() && c.sab().c || '00000');
  sv(svg, 'text', { x: 300, y: 54, 'text-anchor': 'middle', fill: '#facc15', 'font-size': 26, 'font-family': 'monospace', 'font-weight': 700 }, 'CODE ' + code);
  const scr = lcd(svg, 180, 76, 240, 54, '');
  let cur = '', lock = 0;
  const upd = () => { scr.textContent = cur.padEnd(5, '-').split('').join(' '); };
  upd();
  '123456789C0E'.split('').forEach((k, i) => {
    const g = btn(svg, 210 + (i % 3) * 66, 148 + Math.floor(i / 3) * 56, 58, 48, k === 'C' ? 'CLR' : k === 'E' ? 'OK' : k, k === 'E' ? '#16a34a' : k === 'C' ? '#b91c1c' : '#374151', () => {
      if (lock) return; c.sfx('click');
      if (k === 'C') cur = '';
      else if (k === 'E') { if (cur === code) { lock = 1; scr.textContent = 'ACCEPTED'; c.sfx('ok'); c.send({ t: 'fix', k: 'o2', p: c.panel }); c.after(.5, () => c.win()); } else { scr.textContent = 'WRONG'; c.sfx('bad'); cur = ''; c.after(.6, upd); return; } }
      else if (cur.length < 5) cur += k;
      upd();
    });
    g.t.setAttribute('font-size', 20);
  });
};

MG.reactor = (b, c) => {
  const svg = mkSvg(b); metal(svg);
  lcd(svg, 120, 24, 360, 44, 'HOLD TO STABILISE');
  const pad = sv(svg, 'g', { style: 'cursor:pointer' });
  const base = sv(pad, 'rect', { x: 200, y: 100, width: 200, height: 200, rx: 24, fill: '#1c222d', stroke: '#38bdf8', 'stroke-width': 5 });
  sv(pad, 'path', { d: 'M260 250v-80q0-12 10-12t10 12v-22q0-12 10-12t10 12v-4q0-12 10-12t10 12v70q0 30-24 40h-28q-18-10-18-34z', fill: '#38bdf855', stroke: '#38bdf8', 'stroke-width': 4 });
  const st = [0, 1].map(i => sv(svg, 'text', { x: 150 + i * 300, y: 345, 'text-anchor': 'middle', fill: '#7f1d1d', 'font-size': 18, 'font-family': 'monospace', 'font-weight': 700 }, 'PANEL ' + (i + 1)));
  let held = 0, acc = 0;
  const send = on => c.send({ t: 'fix', k: 'reactor', p: c.panel, on });
  pad.addEventListener('pointerdown', e => { e.preventDefault(); held = 1; acc = 0; send(1); base.setAttribute('fill', '#0e4a6b'); });
  const rel = () => { if (held) { held = 0; send(0); base.setAttribute('fill', '#1c222d'); } };
  svg.addEventListener('pointerup', rel); svg.addEventListener('pointercancel', rel); svg.addEventListener('pointerleave', rel);
  c.tick(dt => { if (held) { acc += dt; if (acc > .3) { acc = 0; send(1); } } });
  c.onState(() => { const s = c.sab(); if (!s || s.k !== 'reactor' || !s.h) return; s.h.forEach((v, i) => { st[i].textContent = 'PANEL ' + (i + 1) + (v ? ' HELD' : ' OPEN'); st[i].setAttribute('fill', v ? '#22c55e' : '#ef4444'); }); });
  c.onClose(rel);
};

const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const myProfileName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'), n = p && (p.username || p.displayName); if (typeof n === 'string' && n.trim()) return cleanName(n.trim()); } catch (e) {} return 'You'; };
const VIS_MIN = 1.2;
const REASON = { tasks: 'Crewmates completed all tasks', ejected: 'All Impostors were ejected', majority: 'Impostors outnumber the crew', sabotage: 'The ship was destroyed' };

function mountGame(root, api) {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const saved = Object.assign({ color: 0, set: {}, np: 8, wins: 0, games: 0 }, api.load() || {});
  const save = () => api.save(saved);
  const wrap = h('div', 'au-wrap');
  root.append(wrap);
  const cv = h('canvas', 'au-cv');
  wrap.append(cv);
  const ctx = cv.getContext('2d');
  const fogC = document.createElement('canvas'), fogX = fogC.getContext('2d');
  const hud = h('div', 'au-hud');
  const ui = h('div', 'au-ui');
  wrap.append(hud, ui);

  let AC = null, master = null, NBUF = null;
  const audio = () => {
    if (api.muted) return null;
    if (!AC) {
      try {
        AC = new (window.AudioContext || window.webkitAudioContext)();
        master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
        NBUF = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
        const d = NBUF.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { AC = null; return null; }
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  };
  const tone = (f0, f1, dur, type, vol, delay = 0) => {
    const A = audio(); if (!A) return;
    const t = A.currentTime + delay, o = A.createOscillator(), g = A.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .03);
  };
  const noise = (dur, vol, f0, f1, type = 'lowpass', q = .8, delay = 0) => {
    const A = audio(); if (!A) return;
    const t = A.currentTime + delay, s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
    s.buffer = NBUF; f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
  };
  const SND = {
    click: () => tone(900, 700, .04, 'square', .05),
    ok: () => { tone(660, 660, .1, 'triangle', .16); tone(990, 990, .18, 'triangle', .16, .09); },
    bad: () => { tone(220, 110, .28, 'sawtooth', .1); },
    pop: () => tone(500, 900, .08, 'sine', .14),
    zap: () => { noise(.1, .22, 3200, 600); tone(900, 200, .1, 'square', .06); },
    task: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .14, 'triangle', .16, i * .07)); },
    kill: () => { noise(.3, .55, 2200, 180); tone(150, 45, .3, 'sawtooth', .22); },
    vent: () => { noise(.4, .3, 1400, 200, 'bandpass', 2); tone(120, 70, .3, 'square', .08); },
    report: () => { [0, .2, .4].forEach(d => tone(880, 880, .15, 'square', .14, d)); noise(.2, .1, 4000, 800, 'bandpass', 1.5); },
    alarm: () => { tone(520, 520, .22, 'square', .09); tone(390, 390, .22, 'square', .09, .26); },
    sab: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 360 : 480, i % 2 ? 360 : 480, .2, 'sawtooth', .1, i * .24); },
    fixed: () => { [392, 523, 659].forEach((f, i) => tone(f, f, .16, 'triangle', .16, i * .1)); },
    door: () => { noise(.25, .3, 900, 150); tone(90, 60, .2, 'square', .1); },
    chat: () => tone(1250, 1600, .05, 'sine', .07),
    vote: () => { tone(700, 700, .06, 'square', .08); tone(1000, 1000, .08, 'square', .08, .06); },
    whoosh: () => noise(1.2, .35, 300, 3000, 'bandpass', 1),
    boom: () => { noise(1, .6, 1800, 60); tone(90, 28, .8, 'sine', .5); },
    win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, .26, 'triangle', .2, i * .11)); },
    lose: () => { [392, 349, 311, 262].forEach((f, i) => tone(f, f * .96, .34, 'sawtooth', .12, i * .17)); },
    reveal: () => { tone(160, 90, .6, 'sawtooth', .12); noise(.6, .12, 600, 100); },
    start: () => { tone(110, 110, 1.2, 'sawtooth', .1); tone(165, 165, 1.2, 'sawtooth', .06); },
    tick: () => tone(1500, 1500, .03, 'square', .04)
  };
  const snd = k => { if (api.muted) return; try { if (SND[k]) SND[k](); } catch (e) {} };

  let cw = 0, ch = 0, dpr = 1, TP = 40, camX = 48, camY = 12, OXs = 0, OYs = 0;
  const portrait = () => coarse && innerHeight > innerWidth * 1.05;
  const fitWrap = () => {
    const p = portrait(), ar = p ? .6 : 1.6;
    wrap.style.aspectRatio = String(ar);
    wrap.style.width = `min(100%, ${p ? 560 : 1100}px, calc((100dvh - var(--goff, 250px)) * ${ar}))`;
    wrap.classList.toggle('au-port', p);
  };
  const chunks = new Map();
  const CHK = 8;
  const resize = () => {
    fitWrap();
    const r = wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(r.width * dpr), hh = Math.round(r.height * dpr);
    if (w !== cw || hh !== ch) {
      cw = w; ch = hh; cv.width = w; cv.height = hh; fogC.width = w; fogC.height = hh;
      TP = Math.max(12, Math.round(Math.min(hh / 12.5, w / 10)));
      chunks.clear();
    }
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(wrap);
  api.on(window, 'resize', resize);
  api.on(window, 'orientationchange', () => setTimeout(resize, 200));
  fitWrap();

  const getChunk = (cx, cy) => {
    const k = cx + ',' + cy;
    let c = chunks.get(k);
    if (c) { chunks.delete(k); chunks.set(k, c); return c; }
    c = document.createElement('canvas'); c.width = c.height = CHK * TP;
    const g = c.getContext('2d');
    paintWorld(g, TP, cx * CHK, cy * CHK, CHK, CHK, false);
    g.setTransform(1, 0, 0, 1, 0, 0);
    chunks.set(k, c);
    if (chunks.size > 36) chunks.delete(chunks.keys().next().value);
    return c;
  };

  let mode = 'menu';
  const G = { role: 'solo', H: null, ids: [], meIdx: 0, inbox: [], saveT: 0, sess: null, leader: 0, rx: 0, mute: false, botsOn: false };
  const L = { roster: [], S: fixSettings(saved.set), size: saved.np, me: 0, lead: 0, tab: 0 };
  let V = null;
  const keys = new Set();
  let MT = null;
  let overShown = false;

  const meCol = () => V ? V.players[V.me].color : saved.color;
  const sendHost = m => {
    if (G.role === 'guest') api.net.send(m, m.t === 'mv');
    else if (G.H) { G.H.recv(G.meIdx, JSON.parse(JSON.stringify(m))); flushInbox(); }
  };
  const flushInbox = () => {
    while (G.inbox.length) { const m = G.inbox.shift(); try { onMsg(m); } catch (e) { console.error(e); } }
  };
  const hostEnv = {
    send(i, m, fast) {
      if (G.mute) return;
      if (i === G.meIdx) {
        const c = JSON.parse(JSON.stringify(m));
        if (m.t === 's') { const k = G.inbox.findIndex(x => x.t === 's'); if (k >= 0) { if (G.inbox[k].fix && !c.fix) c.fix = G.inbox[k].fix; G.inbox.splice(k, 1); } }
        G.inbox.push(c);
      } else if (G.role === 'host') {
        const id = G.ids[i];
        if (id) api.net.sendTo(id, m, !!fast);
      }
    }
  };


  const layers = {};
  const showLayer = (name, node) => { hideLayer(name); layers[name] = node; ui.append(node); return node; };
  const hideLayer = name => { if (layers[name]) { layers[name].remove(); delete layers[name]; } };
  const hideAllLayers = () => Object.keys(layers).forEach(hideLayer);

  const applyDoors = dr => { if (G.role !== 'guest') return; DM.fill(0); dr.forEach((c, i) => { if (!c) return; const d = DOORS[i]; for (let y = d.y; y < d.y + d.h; y++) for (let x = d.x; x < d.x + d.w; x++) DM[y * MW + x] = 1; }); };
  const lightsOut = () => !!(V && V.st.sab && V.st.sab.k === 'lights');
  const myVis = () => V.alive ? visRadius(V.S, V.role, true, lightsOut()) : 99;
  const sabK = () => V && V.st.sab ? V.st.sab.k : null;
  const stNow = (k, base) => Math.max(0, V.st[k] - (performance.now() - V.stT) / 1000);

  function onCfg(m) {
    closePanel(); closeMap(); hideAllLayers(); MT = null; overShown = false;
    const t = performance.now();
    V = {
      me: m.me, n: m.n, S: m.S, players: m.players, role: m.role, mates: m.mates || [], tasks: m.tasks, sa: m.sa || 0, saT: t,
      px: m.pos[0], py: m.pos[1], fx: 1, mv: 0, walk: 0, alive: m.alive !== false, vent: m.vent >= 0 ? m.vent : -1,
      o: {}, bodies: [], cp: null, ad: null, st: { ph: m.ph, dr: [], sab: null, bar: 0, em: m.emerg, emcd: 0, sabcd: 0, doorcd: 0, kc: 0 }, stT: t,
      kcd: 0, kcT: t, ph: m.ph, introUntil: t + (m.intro || 0) * 1000, lsx: -1, lsy: -1, lsT: 0, over: null, flash: 0, banner: null, bannerT: 0, killer: -1, fxList: [], useT: null, hold: 0
    };
    mode = 'game';
    camX = V.px; camY = V.py;
    L.roster = m.players.map(p => ({ name: p.name, color: p.color }));
    if (m.ph === 'intro') showIntro(); else hideLayer('intro');
    buildHud();
    updHud(true);
  }
  function onSnap(m) {
    if (!V) return;
    const t = performance.now();
    if (m.fix) { V.px = m.fix[0]; V.py = m.fix[1]; camX = V.px; camY = V.py; }
    V.vent = m.v >= 0 ? m.v : -1;
    V.kcd = m.kc; V.kcT = t;
    m.p.forEach(([i, x, y, fx, fl]) => {
      const o = V.o[i] || (V.o[i] = { buf: [], walk: 0, vf: 0, vt: 0, x, y });
      o.buf.push({ t, x, y }); if (o.buf.length > 8) o.buf.shift();
      o.fx = fx; o.fl = fl; o.last = t;
      const vf = fl & 12;
      if (vf && vf !== o.vf) o.vt = t;
      o.vf = vf;
    });
    V.bodies = m.b;
    V.cp = m.cp || null; V.ad = m.ad || null;
  }
  function onSt(m) {
    if (!V) return;
    V.st = m; V.stT = performance.now(); V.ph = m.ph;
    applyDoors(m.dr);
    if (m.ph !== 'intro') hideLayer('intro');
    mgState();
  }
  function onEv(m) {
    if (!V) return;
    const n = i => V.players[i] ? V.players[i].name : '?';
    switch (m.k) {
      case 'sab': snd('sab'); V.banner = m.s === 'lights' ? 'Lights are out' : m.s === 'comms' ? 'Communications sabotaged' : m.s === 'reactor' ? 'Reactor meltdown' : 'O2 depleted'; V.bannerT = performance.now(); V.flash = 1; break;
      case 'fixed': snd('fixed'); V.banner = 'Sabotage fixed'; V.bannerT = performance.now(); if (MGP.el && MGP.info && MGP.info.sab) closePanel(); break;
      case 'doors': snd('door'); break;
      case 'kill': snd('kill'); break;
      case 'killed': snd('kill'); V.alive = false; V.killer = m.by; V.deadT = performance.now(); V.flash = 1; V.vent = -1; closePanel(); closeMap(); break;
      case 'snd': snd('kill'); break;
      case 'left': api.toast(n(m.i) + ' left. A bot took the seat.'); break;
    }
  }
  function onOver(m) {
    if (!V) return;
    V.over = m; V.ph = 'over'; closePanel(); closeMap();
    if (!overShown) { overShown = true; api.timeout(() => showOver(), 900); }
  }

  const oPos = (o, now) => {
    const b = o.buf, T = now - 105;
    if (b.length === 1 || T <= b[0].t) return b[0];
    for (let i = b.length - 1; i > 0; i--) {
      if (b[i - 1].t <= T) {
        const a = b[i - 1], c = b[i];
        if (c.t <= T) return c;
        const k = (T - a.t) / (c.t - a.t);
        if (Math.abs(c.x - a.x) + Math.abs(c.y - a.y) > 3) return k < .5 ? a : c;
        return { x: a.x + (c.x - a.x) * k, y: a.y + (c.y - a.y) * k };
      }
    }
    return b[b.length - 1];
  };

  const bubbleAt = (x, y, txt, fill, tc) => {
    const r = TP * .26;
    ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.lineWidth = Math.max(1.5, TP * .05); ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
    ctx.fillStyle = tc || '#1b1b1b'; ctx.font = `900 ${Math.round(TP * .36)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, x, y + 1);
  };
  const edgeArrow = (x, y, col) => {
    const dx = x - cw / 2, dy = y - ch / 2, m = TP * .8;
    if (x > m && x < cw - m && y > m && y < ch - m) return;
    const k = Math.min((cw / 2 - m) / Math.abs(dx || 1e-6), (ch / 2 - m) / Math.abs(dy || 1e-6)), ex = cw / 2 + dx * k, ey = ch / 2 + dy * k, a = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
    ctx.fillStyle = col; ctx.strokeStyle = 'rgba(0,0,0,.65)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(TP * .34, 0); ctx.lineTo(-TP * .2, -TP * .26); ctx.lineTo(-TP * .05, 0); ctx.lineTo(-TP * .2, TP * .26); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  const seeXY = (x, y, R) => !V.alive || (dist(V.px, V.py, x, y) <= R + .25 && los(V.px, V.py, x, y));

  let menuStars = null;
  const drawBackdrop = (now, dt) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, '#05060f'); g.addColorStop(1, '#0d1030');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    if (!menuStars || menuStars.w !== cw) {
      menuStars = { w: cw, s: Array.from({ length: 140 }, () => ({ x: Math.random() * cw, y: Math.random() * ch, z: Math.random() * .8 + .2 })), f: Array.from({ length: 6 }, (_, i) => ({ x: Math.random() * cw, y: Math.random() * ch, c: i % COLORS.length, r: Math.random() * 6, v: (Math.random() * .4 + .2), s: Math.random() * .5 + .6 })) };
    }
    menuStars.s.forEach(s => { s.x -= s.z * dt * 18 * dpr; if (s.x < 0) { s.x = cw; s.y = Math.random() * ch; } ctx.fillStyle = `rgba(255,255,255,${.3 + s.z * .6})`; ctx.fillRect(s.x, s.y, s.z * 2.2 * dpr, s.z * 2.2 * dpr); });
    menuStars.f.forEach(f => {
      f.x += f.v * dt * 40 * dpr; f.y += Math.sin(now / 1500 + f.c) * .2; f.r += dt * f.v;
      if (f.x > cw + 80) { f.x = -80; f.y = Math.random() * ch; }
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.r); ctx.globalAlpha = .9;
      drawCrew(ctx, 0, TP * f.s * .5, TP * f.s * 1.6, COLORS[f.c], { fx: 1 });
      ctx.restore();
    });
  };

  const drawFog = R => {
    fogX.setTransform(1, 0, 0, 1, 0, 0);
    fogX.globalCompositeOperation = 'source-over';
    fogX.clearRect(0, 0, cw, ch);
    fogX.fillStyle = 'rgba(3,4,10,.975)'; fogX.fillRect(0, 0, cw, ch);
    fogX.globalCompositeOperation = 'destination-out';
    const cx = OXs + V.px * TP, cy = OYs + V.py * TP, Rp = R * TP;
    const g = fogX.createRadialGradient(cx, cy, Rp * .2, cx, cy, Rp);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.7, 'rgba(0,0,0,.96)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    fogX.fillStyle = g; fogX.beginPath();
    const N = R > 5 ? 320 : 220;
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU, d = Math.min(R, castDist(V.px, V.py, a, R) + .38);
      const x = cx + Math.cos(a) * d * TP, y = cy + Math.sin(a) * d * TP;
      if (i) fogX.lineTo(x, y); else fogX.moveTo(x, y);
    }
    fogX.closePath(); fogX.fill();
    fogX.globalCompositeOperation = 'source-over';
    ctx.drawImage(fogC, 0, 0);
  };

  let walkT = 0;
  const useTarget = () => V && V.alive && V.vent < 0 && V.ph === 'play' ? findUse() : null;

  function render(dt, now) {
    if (!cw) return;
    if (mode !== 'game' || !V) { drawBackdrop(now, dt); return; }
    const halfW = cw / 2 / TP, halfH = ch / 2 / TP;
    const tx = clamp(V.px, Math.min(halfW - 1.5, MW / 2), Math.max(MW - halfW + 1.5, MW / 2)), ty = clamp(V.py, Math.min(halfH - 1.5, MH / 2), Math.max(MH - halfH + 1.5, MH / 2));
    const k = Math.min(1, dt * 14);
    camX += (tx - camX) * k; camY += (ty - camY) * k;
    OXs = Math.round(cw / 2 - camX * TP); OYs = Math.round(ch / 2 - camY * TP);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, cw, ch);
    const cx0 = Math.max(0, Math.floor((camX - halfW) / CHK)), cx1 = Math.min(Math.ceil(MW / CHK) - 1, Math.floor((camX + halfW) / CHK));
    const cy0 = Math.max(0, Math.floor((camY - halfH) / CHK)), cy1 = Math.min(Math.ceil(MH / CHK) - 1, Math.floor((camY + halfH) / CHK));
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) ctx.drawImage(getChunk(cx, cy), OXs + cx * CHK * TP, OYs + cy * CHK * TP);
    const sx = x => OXs + x * TP, sy = y => OYs + y * TP;
    const R = myVis();
    DOORS.forEach((d, i) => {
      if (!V.st.dr[i]) return;
      const x = sx(d.x), y = sy(d.y), w = d.w * TP, hh = d.h * TP;
      ctx.fillStyle = '#39425a'; ctx.fillRect(x, y, w, hh);
      ctx.fillStyle = '#e0b020';
      const n = d.w === 1 ? d.h * 2 : d.w * 2, st = d.w === 1 ? hh / n : w / n;
      for (let j = 0; j < n; j += 2) { if (d.w === 1) ctx.fillRect(x, y + j * st, w, st); else ctx.fillRect(x + j * st, y, st, hh); }
      ctx.strokeStyle = '#11141f'; ctx.lineWidth = Math.max(2, TP * .08); ctx.strokeRect(x, y, w, hh);
    });
    const sab = V.st.sab;
    const pulse = .5 + .5 * Math.sin(now / 220);
    if (sabK() !== 'comms' || V.role === 1) {
      V.tasks.forEach(t => t.steps.forEach((s, si) => {
        if (s.done || !taskAvail(t, si)) return;
        const q = ST[s.st], x = sx(q.cx), y = sy(q.cy) - TP * (.9 + .1 * Math.sin(now / 300 + q.cx));
        bubbleAt(x, y, '!', V.role === 1 ? '#c9b24a' : '#ffd84a'); edgeArrow(x, y, '#ffd84a');
      }));
    }
    if (sab && V.alive && V.role === 0) {
      const sts = sab.k === 'lights' ? ['lights'] : sab.k === 'comms' ? ['comms'] : sab.k === 'reactor' ? ['reactor1', 'reactor2'] : ['o2_1', 'o2_2'];
      sts.forEach((id, p) => {
        if (sab.k === 'o2' && sab.f && sab.f[p]) return;
        const s = ST[id], x = sx(s.cx), y = sy(s.cy) - TP * 1.1;
        bubbleAt(x, y, '!', pulse > .5 ? '#ff4b3a' : '#a82418', '#fff'); edgeArrow(x, y, '#ff4b3a');
      });
    }
    if (V.role === 1 && V.alive) {
      VENTS.forEach(v => { if (V.vent >= 0) return; if (dist(V.px, V.py, v.x, v.y) < R) { ctx.strokeStyle = 'rgba(255,60,60,.55)'; ctx.lineWidth = Math.max(2, TP * .06); ctx.strokeRect(sx(v.x - .55), sy(v.y - .45), TP * 1.1, TP * .9); } });
    }
    const ut = useTarget();
    if (ut) {
      const s = ST[ut.id];
      ctx.strokeStyle = `rgba(255,255,255,${.55 + pulse * .4})`; ctx.lineWidth = Math.max(2, TP * .07);
      ctx.beginPath(); ctx.arc(sx(s.cx), sy(s.cy), TP * (s.id === 'emerg' ? 1.5 : .95), 0, TAU); ctx.stroke();
    }
    const seeAll = !V.alive;
    V.bodies.forEach(b => {
      if (!seeAll && !seeXY(b[1], b[2], R)) return;
      drawBody(ctx, sx(b[1]), sy(b[2]) + TP * .15, TP, COLORS[V.players[b[0]].color], V.alive ? 1 : .8);
    });
    const kt = V.role === 1 && V.alive ? killTarget() : -1;
    const list = [];
    Object.keys(V.o).forEach(key => {
      const i = +key, o = V.o[key];
      if (now - o.last > 280) return;
      const p = oPos(o, now);
      o.x = p.x; o.y = p.y;
      const fl = o.fl, ghost = !!(fl & 2);
      if (!seeAll && !seeXY(p.x, p.y, R)) return;
      let alpha = 1;
      const age = now - o.vt;
      if ((fl & 4) && age < 350) alpha = 1 - age / 350; else if ((fl & 8) && age < 350) alpha = age / 350;
      if (fl & 32) alpha = .35;
      const mv = !!(fl & 1);
      if (mv) o.walk += dt * 11;
      list.push({ y: p.y, i, x: p.x, fx: o.fx, ghost, alpha, mv, walk: o.walk, scan: fl & 16 });
    });
    if (V.vent < 0) list.push({ y: V.py, i: V.me, x: V.px, fx: V.fx, ghost: !V.alive, alpha: 1, mv: V.mv, walk: V.walk, scan: 0, me: 1 });
    list.sort((a, b) => a.y - b.y);
    list.forEach(e => {
      const col = COLORS[V.players[e.i].color], x = sx(e.x), y = sy(e.y) + TP * .32;
      if (e.i === kt) { ctx.strokeStyle = '#ff2a2a'; ctx.lineWidth = Math.max(2, TP * .08); ctx.beginPath(); ctx.ellipse(x, y - TP * .02, TP * .5, TP * .17, 0, 0, TAU); ctx.stroke(); }
      if (e.scan) { ctx.strokeStyle = 'rgba(111,227,216,.9)'; ctx.lineWidth = Math.max(2, TP * .06); ctx.beginPath(); ctx.arc(x, y - TP * .5, TP * .7 + Math.sin(now / 150) * TP * .06, 0, TAU); ctx.stroke(); }
      drawCrew(ctx, x, y, TP, col, { fx: e.fx, walk: e.walk, moving: e.mv, ghost: e.ghost, alpha: e.alpha });
      const nm = V.players[e.i].name, imp = V.role === 1 && (V.mates.includes(e.i) || e.i === V.me);
      ctx.font = `800 ${Math.round(TP * .32)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.lineWidth = Math.max(3, TP * .09); ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineJoin = 'round';
      ctx.globalAlpha = e.ghost ? .65 : 1;
      ctx.strokeText(nm, x, y - TP * 1.0); ctx.fillStyle = imp ? '#ff4040' : '#fff'; ctx.fillText(nm, x, y - TP * 1.0);
      ctx.globalAlpha = 1;
    });
    if (V.vent >= 0) {
      const v = VENTS[V.vent];
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(sx(v.x - .5), sy(v.y - .4), TP, TP * .8);
      v.to.forEach(j => {
        const t = VENTS[j], x = sx(t.x), y = sy(t.y) - TP * .85, a = Math.atan2(t.y - V.py, t.x - V.px);
        ctx.save(); ctx.translate(x, y); ctx.fillStyle = `rgba(255,70,70,${.6 + pulse * .4})`; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, TP * .3); ctx.lineTo(-TP * .3, -TP * .15); ctx.lineTo(TP * .3, -TP * .15); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      });
    }
    if (V.alive && V.vent < 0) drawFog(R); else if (V.alive) drawFog(Math.min(R, 3.2));
    else { ctx.fillStyle = 'rgba(40,60,120,.12)'; ctx.fillRect(0, 0, cw, ch); }
    if (sab && (sab.k === 'reactor' || sab.k === 'o2')) { ctx.fillStyle = `rgba(255,0,0,${.05 + pulse * .12})`; ctx.fillRect(0, 0, cw, ch); }
    if (V.flash > 0) { ctx.fillStyle = `rgba(255,40,40,${V.flash * .45})`; ctx.fillRect(0, 0, cw, ch); V.flash = Math.max(0, V.flash - dt * 1.6); }
    if (!V.alive && V.deadT && now - V.deadT < 2600) {
      const a = Math.min(1, (now - V.deadT) / 300) * (1 - Math.max(0, (now - V.deadT - 1900) / 700));
      ctx.fillStyle = `rgba(0,0,0,${a * .55})`; ctx.fillRect(0, 0, cw, ch);
      ctx.globalAlpha = a; ctx.fillStyle = '#ff3a3a'; ctx.font = `900 ${Math.round(TP * 1.4)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('YOU DIED', cw / 2, ch / 2 - TP * .4);
      if (V.killer >= 0) { ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(TP * .5)}px system-ui,sans-serif`; ctx.fillText('Killed by ' + V.players[V.killer].name, cw / 2, ch / 2 + TP * .5); }
      ctx.globalAlpha = 1;
    }
  }


  const HD = {};
  const ICON = {
    use: '<svg viewBox="0 0 32 32"><path d="M10 15V8a2 2 0 014 0v6m0-1.5V6.5a2 2 0 014 0V13m0-1.5V8a2 2 0 014 0v9c0 5-3 9-8 9s-8-3-9-8l-1-4a2 2 0 013-1l3 3" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    report: '<svg viewBox="0 0 32 32"><path d="M6 13l14-6v18L6 19z" fill="#ffe066" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 20l2 7h4l-1.5-6" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 11c2 1.5 2 8.500 0 10M27 8c3.500 3 3.500 13 0 16" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/></svg>',
    kill: '<svg viewBox="0 0 32 32"><path d="M5 27L22 8l3 3-17 18z" fill="#e8e8e8" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 6l6 6 3-3-6-6z" fill="#c0392b" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    vent: '<svg viewBox="0 0 32 32"><rect x="4" y="7" width="24" height="18" rx="3" fill="#8a93a8" stroke="#111" stroke-width="1.6"/><path d="M8 12h16M8 16h16M8 20h16" stroke="#111" stroke-width="2"/></svg>',
    sab: '<svg viewBox="0 0 32 32"><path d="M16 4L29 27H3z" fill="#ff5a4a" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 12v8m0 3v1" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    map: '<svg viewBox="0 0 32 32"><path d="M4 8l8-3 8 3 8-3v19l-8 3-8-3-8 3z" fill="#7cc4ff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 5v19M20 8v19" stroke="#111" stroke-width="1.4"/></svg>',
    menu: '<svg viewBox="0 0 32 32"><path d="M7 9h18M7 16h18M7 23h18" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'
  };
  const mkBtn = (cls, label, ic, fn) => {
    const b = h('button', 'au-b ' + cls, `${ICON[ic]}<span>${label}</span><i></i>`);
    b.type = 'button';
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (b.classList.contains('off')) return; fn(); });
    return b;
  };

  function buildHud() {
    hud.innerHTML = '';
    HD.bar = h('div', 'au-bar', '<div class="au-barf"></div><span>TOTAL TASKS COMPLETED</span>');
    HD.tl = h('div', 'au-tl');
    const tlw = h('div', 'au-tlw');
    tlw.append(HD.bar, HD.tl);
    HD.tlw = tlw;
    HD.tlt = h('button', 'au-tlt', '');
    HD.tlt.addEventListener('pointerdown', e => { e.preventDefault(); tlw.classList.toggle('shut'); });
    tlw.append(HD.tlt);
    HD.map = mkBtn('au-bmap', '', 'map', () => openMap('map'));
    HD.menu = mkBtn('au-bmenu', '', 'menu', () => openPause());
    const top = h('div', 'au-topr'); top.append(HD.map, HD.menu);
    HD.use = mkBtn('au-buse', 'USE', 'use', doUse);
    HD.rep = mkBtn('au-brep', 'REPORT', 'report', doReport);
    HD.kill = mkBtn('au-bkill', 'KILL', 'kill', doKill);
    HD.vent = mkBtn('au-bvent', 'VENT', 'vent', doVent);
    HD.sab = mkBtn('au-bsab', 'SABOTAGE', 'sab', () => openMap('sab'));
    const bt = h('div', 'au-btns'), r1 = h('div', 'au-r'), r2 = h('div', 'au-r');
    r2.append(HD.vent, HD.sab, HD.kill);
    r1.append(HD.rep, HD.use);
    bt.append(r2, r1);
    HD.bt = bt;
    HD.alert = h('div', 'au-alert');
    HD.toast = h('div', 'au-toast');
    HD.joy = h('div', 'au-joy', '<i></i>');
    HD.vig = h('div', 'au-vig');
    hud.append(tlw, top, bt, HD.alert, HD.toast, HD.joy);
    HD.kill.hidden = HD.vent.hidden = HD.sab.hidden = V.role !== 1;
    HD.tl.dataset.s = '';
  }

  function findUse() {
    const x = V.px, y = V.py;
    let best = null, bd = 1e9;
    const tryS = (id, o) => { const s = ST[id], d = dist(x, y, s.x, s.y); if (d <= s.r && d < bd) { bd = d; best = Object.assign({ id }, o); } };
    const sab = V.st.sab, comms = sab && sab.k === 'comms';
    if (V.role === 0) {
      V.tasks.forEach((t, ti) => t.steps.forEach((s, si) => {
        if (!taskAvail(t, si)) return;
        if (s.mg === 'sample2' && saLeft() > 0) return;
        if (comms && s.mg !== 'x') return;
        tryS(s.st, { k: 'task', ti, si, mg: s.mg, label: 'USE' });
      }));
      if (sab && V.alive) {
        if (sab.k === 'lights') tryS('lights', { k: 'lights', label: 'FIX' });
        if (sab.k === 'comms') tryS('comms', { k: 'comms', label: 'FIX' });
        if (sab.k === 'o2') { if (!sab.f[0]) tryS('o2_1', { k: 'o2', p: 0, label: 'FIX' }); if (!sab.f[1]) tryS('o2_2', { k: 'o2', p: 1, label: 'FIX' }); }
        if (sab.k === 'reactor') { tryS('reactor1', { k: 'reactor', p: 0, label: 'FIX' }); tryS('reactor2', { k: 'reactor', p: 1, label: 'FIX' }); }
      }
    }
    if (V.alive) {
      if (!(sab && (sab.k === 'reactor' || sab.k === 'o2')) && V.st.em > 0 && stNow('emcd') <= 0) tryS('emerg', { k: 'emerg', label: 'MEETING' });
      tryS('cams', { k: 'cams', label: 'CAMS' });
      tryS('admin', { k: 'admin', label: 'ADMIN' });
    }
    return best;
  }
  const saLeft = () => Math.max(0, V.sa - (performance.now() - V.saT) / 1000);
  function doUse() {
    if (!V || V.ph !== 'play' || V.vent >= 0) return;
    const u = findUse();
    if (!u) return;
    snd('click');
    if (u.k === 'task') openPanel(u.mg, { title: TASKS[V.tasks[u.ti].key].n, ti: u.ti, si: u.si });
    else if (u.k === 'emerg') sendHost({ t: 'emerg' });
    else if (u.k === 'cams' || u.k === 'admin') { if (sabK() === 'comms') { toast('Communications are down'); return; } sendHost({ t: 'info', k: u.k }); openPanel(u.k, { title: u.k === 'cams' ? 'Security Cameras' : 'Admin Map', view: u.k }); }
    else openPanel(u.k, { title: u.k === 'lights' ? 'Fix Lights' : u.k === 'comms' ? 'Restore Comms' : u.k === 'o2' ? 'Clear O2 Canisters' : 'Reactor Panel', sab: 1, panel: u.p || 0 });
  }
  const killTarget = () => {
    if (!V.alive || V.vent >= 0) return -1;
    const rng = KRANGE[V.S.krange] + .45, now = performance.now();
    let best = -1, bd = 1e9;
    Object.keys(V.o).forEach(k => {
      const o = V.o[k], i = +k;
      if (now - o.last > 280 || (o.fl & 2) || V.mates.includes(i) || o.x == null) return;
      const d = dist(V.px, V.py, o.x, o.y);
      if (d <= rng && d < bd && los(V.px, V.py, o.x, o.y)) { bd = d; best = i; }
    });
    return best;
  };
  function doKill() {
    if (!V || V.ph !== 'play' || V.role !== 1 || !V.alive) return;
    const t = killTarget();
    if (t < 0 || V.kcd - (performance.now() - V.kcT) / 1000 > 0) return;
    sendHost({ t: 'kill', v: t });
  }
  const nearBody = () => {
    if (!V.alive || V.vent >= 0) return null;
    let best = null, bd = 3.1;
    V.bodies.forEach(b => { const d = dist(V.px, V.py, b[1], b[2]); if (d < bd && los(V.px, V.py, b[1], b[2])) { bd = d; best = b; } });
    return best;
  };
  function doReport() {
    if (!V || V.ph !== 'play') return;
    const b = nearBody();
    if (b) sendHost({ t: 'report', b: b[0] });
  }
  const nearVent = () => {
    let best = -1, bd = 1.55;
    VENTS.forEach(v => { const d = dist(V.px, V.py, v.x, v.y); if (d < bd) { bd = d; best = v.id; } });
    return best;
  };
  function doVent() {
    if (!V || V.ph !== 'play' || V.role !== 1 || !V.alive) return;
    snd('vent');
    if (V.vent >= 0) sendHost({ t: 'vent', k: 'out' });
    else { const v = nearVent(); if (v >= 0) sendHost({ t: 'vent', k: 'in', v }); }
  }
  const toast = (txt, ms) => {
    if (!HD.toast) return;
    HD.toast.textContent = txt; HD.toast.classList.add('on');
    clearTimeout(toast.t); toast.t = setTimeout(() => HD.toast.classList.remove('on'), ms || 2200);
  };

  let hudKey = '';
  function updHud(force) {
    if (!V || mode !== 'game' || !HD.bt) return;
    const now = performance.now();
    const play = V.ph === 'play';
    hud.style.visibility = V.ph === 'meet' || V.ph === 'eject' || V.over ? 'hidden' : '';
    const u = play && V.vent < 0 ? findUse() : null;
    HD.use.classList.toggle('off', !u);
    HD.use.querySelector('span').textContent = u ? u.label : 'USE';
    const bb = play ? nearBody() : null;
    HD.rep.classList.toggle('off', !bb);
    if (V.role === 1) {
      const cd = Math.max(0, V.kcd - (now - V.kcT) / 1000), kt = play ? killTarget() : -1;
      HD.kill.classList.toggle('off', !(kt >= 0 && cd <= 0) || !V.alive);
      HD.kill.classList.toggle('cd', cd > 0 && V.alive);
      HD.kill.querySelector('i').textContent = cd > 0 && V.alive ? Math.ceil(cd) : '';
      const nv = play && V.alive && (V.vent >= 0 || nearVent() >= 0);
      HD.vent.classList.toggle('off', !nv);
      HD.vent.querySelector('span').textContent = V.vent >= 0 ? 'EXIT' : 'VENT';
      const sc = stNow('sabcd');
      HD.sab.classList.toggle('off', !(play && V.alive && !V.st.sab && sc <= 0));
      HD.sab.querySelector('i').textContent = !V.st.sab && sc > 0 && V.alive ? Math.ceil(sc) : '';
    }
    const sab = V.st.sab;
    let al = '';
    if (sab) {
      if (sab.k === 'reactor') al = `<b>REACTOR MELTDOWN</b><span>${Math.max(0, Math.ceil(sab.t - (now - V.stT) / 1000))}s</span>`;
      else if (sab.k === 'o2') al = `<b>O2 DEPLETED</b><span>${Math.max(0, Math.ceil(sab.t - (now - V.stT) / 1000))}s</span>`;
      else if (sab.k === 'lights') al = '<b>LIGHTS OUT</b>';
      else al = '<b>COMMS SABOTAGED</b>';
    }
    if (HD.alert.dataset.s !== al) { HD.alert.dataset.s = al; HD.alert.innerHTML = al; HD.alert.classList.toggle('on', !!al); HD.alert.classList.toggle('red', !!sab && (sab.k === 'reactor' || sab.k === 'o2')); }
    if (V.banner && now - V.bannerT < 2400) { HD.toast.textContent = V.banner; HD.toast.classList.add('on'); } else if (V.banner) { V.banner = null; HD.toast.classList.remove('on'); }
    const bar = V.st.bar;
    HD.bar.firstChild.style.width = Math.max(0, bar) * 100 + '%';
    HD.bar.classList.toggle('hid', bar < 0);
    const comms = sab && sab.k === 'comms';
    let tl = '';
    V.tasks.forEach(t => {
      const l = taskLabel(t);
      let extra = '';
      const nx = t.steps.findIndex((s, i) => taskAvail(t, i));
      if (nx >= 0 && t.steps[nx].mg === 'sample2') extra = saLeft() > 0 ? ` <em>wait ${Math.ceil(saLeft())}s</em>` : ' <em>ready</em>';
      tl += `<div class="${l.done ? 'd' : l.d ? 'p' : ''}">${comms && V.role === 0 ? '??: ??' : esc(l.room) + ': ' + esc(l.name)}${t.steps.length > 1 ? ` (${l.d}/${l.n})` : ''}${extra}</div>`;
    });
    const hdr = V.role === 1 ? 'Fake Tasks' : 'Tasks';
    HD.tlt.textContent = hdr;
    tl = `<h4>${hdr}</h4>` + tl;
    if (HD.tl.dataset.s !== tl) { HD.tl.dataset.s = tl; HD.tl.innerHTML = tl; }
    HD.bt.classList.toggle('dead', !V.alive);
    HD.bt.classList.toggle('imp', V.role === 1);
    HD.bt.classList.toggle('hidden', !play || (MGP.el && true));
  }

  const MGP = { el: null, info: null, tick: [], afters: [], closeFns: [], stateFns: [], scan: 0, view: null };
  function closePanel() {
    if (!MGP.el) return;
    MGP.closeFns.forEach(f => { try { f(); } catch (e) {} });
    if (MGP.scan) { sendHost({ t: 'scan', on: 0 }); MGP.scan = 0; }
    if (MGP.view) { sendHost({ t: 'info', k: null }); MGP.view = null; }
    MGP.el.remove(); MGP.el = null; MGP.info = null; MGP.tick = []; MGP.afters = []; MGP.closeFns = []; MGP.stateFns = [];
  }
  function openPanel(kind, info) {
    if (!MG[kind] || MGP.el) return;
    const box = h('div', 'au-mgo'), card = h('div', 'au-mg'), head = h('div', 'au-mgh'), x = h('button', 'au-mgx', '&times;'), body = h('div', 'au-mgb');
    head.innerHTML = `<b>${esc(info.title)}</b>`;
    head.append(x);
    card.append(head, body);
    box.append(card);
    ui.append(box);
    MGP.el = box; MGP.info = info; MGP.tick = []; MGP.afters = []; MGP.closeFns = []; MGP.stateFns = [];
    if (info.view) MGP.view = info.view;
    x.addEventListener('click', () => { snd('click'); closePanel(); });
    box.addEventListener('pointerdown', e => { if (e.target === box) closePanel(); });
    const c = {
      sfx: snd, tone: (f, d, ty, v) => tone(f, f, d, ty || 'sine', v || .14),
      win: () => { if (!MGP.el || MGP.info !== info) return; const a = info; closePanel(); if (a.ti != null) { snd('task'); sendHost({ t: 'tdone', ti: a.ti, si: a.si }); } },
      fail: () => { if (!MGP.el || MGP.info !== info) return; closePanel(); sendHost({ t: 'tfail' }); },
      after: (s, fn) => MGP.afters.push({ t: s, fn }), tick: fn => MGP.tick.push(fn),
      send: m => sendHost(m), sab: () => V.st.sab, onState: fn => { MGP.stateFns.push(fn); fn(); }, onClose: fn => MGP.closeFns.push(fn),
      panel: info.panel || 0, crew: () => crewSvg(COLORS[meCol()], 1), name: V.players[V.me].name,
      scanOn: on => { MGP.scan = on; sendHost({ t: 'scan', on }); }
    };
    MG[kind](body, c);
    if (MG[kind].wide) box.classList.add('wide');
  }
  function mgStep(dt) {
    if (!MGP.el) return;
    const t = MGP.tick.slice();
    t.forEach(f => f(dt));
    MGP.afters.forEach(a => { a.t -= dt; });
    const due = MGP.afters.filter(a => a.t <= 0);
    MGP.afters = MGP.afters.filter(a => a.t > 0);
    due.forEach(a => a.fn());
  }
  function mgState() {
    if (!MGP.el) return;
    MGP.stateFns.forEach(f => f());
    if (MGP.info && MGP.info.sab && !V.st.sab) closePanel();
  }

  MG.cams = (b, c) => {
    b.style.aspectRatio = 'auto'; b.style.padding = '8px';
    const grid = h('div', 'au-cams');
    b.append(grid);
    const names = ['Security Hall', 'Cafeteria South', 'Navigation', 'Storage Hall'];
    const tiles = CAMS.map((r, k) => {
      const w = h('div', 'au-cam'), cvx = document.createElement('canvas');
      cvx.width = 320; cvx.height = 240;
      w.append(cvx, h('span', '', '<i></i>' + names[k]));
      grid.append(w);
      const S = Math.min(320 / r[2], 240 / r[3]), bg = document.createElement('canvas');
      bg.width = 320; bg.height = 240;
      const g = bg.getContext('2d');
      g.fillStyle = '#05070d'; g.fillRect(0, 0, 320, 240);
      paintWorld(g, S, r[0], r[1], r[2], r[3], true);
      g.setTransform(1, 0, 0, 1, 0, 0);
      return { cvx, bg, r, S, g: cvx.getContext('2d') };
    });
    c.tick(() => {
      const off = sabK() === 'comms';
      tiles.forEach(t => {
        const g = t.g;
        g.drawImage(t.bg, 0, 0);
        if (off) { for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .6})`; g.fillRect(Math.random() * 320, Math.random() * 240, 6, 3); } return; }
        (V.cp || []).forEach(q => {
          if (!inRect(q[1], q[2], t.r)) return;
          drawCrew(g, (q[1] - t.r[0]) * t.S, (q[2] - t.r[1]) * t.S, t.S * 1.5, COLORS[V.players[q[0]].color], { fx: q[3], moving: !!q[4], walk: performance.now() / 90 });
        });
        g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < 240; y += 4) g.fillRect(0, y, 320, 1);
      });
    });
  };
  MG.admin = (b, c) => {
    b.style.aspectRatio = 'auto'; b.style.padding = '8px';
    const cvx = document.createElement('canvas');
    cvx.width = 720; cvx.height = 435; cvx.style.cssText = 'width:100%;display:block;border-radius:8px';
    b.append(cvx);
    const g = cvx.getContext('2d'), bg = document.createElement('canvas');
    bg.width = 720; bg.height = 435;
    const bx = bg.getContext('2d');
    paintWorld(bx, 7.5, 0, 0, MW, MH, true); bx.setTransform(1, 0, 0, 1, 0, 0);
    bx.fillStyle = 'rgba(8,16,40,.55)'; bx.fillRect(0, 0, 720, 435);
    c.tick(() => {
      g.drawImage(bg, 0, 0);
      const off = sabK() === 'comms';
      g.font = '700 13px system-ui,sans-serif'; g.textAlign = 'center';
      ROOMS.forEach((r, i) => {
        g.fillStyle = 'rgba(255,255,255,.65)'; g.fillText(r.n.toUpperCase(), (r.x + r.w / 2) * 7.5, (r.y + 1.4) * 7.5);
        if (off) return;
        const list = (V.ad || []).filter(q => q[0] === i + 1);
        list.forEach((q, k) => {
          const cx = (r.x + r.w / 2) * 7.5 + (k - (list.length - 1) / 2) * 20, cy = (r.y + r.h / 2) * 7.5 + 4;
          g.fillStyle = COLORS[q[1]][1]; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 8, 0, TAU); g.fill(); g.stroke();
        });
      });
      if (off) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, 720, 435); g.fillStyle = '#ff6a5d'; g.font = '800 34px system-ui'; g.fillText('COMMS OFFLINE', 360, 225); }
    });
  };

  let mapEl = null;
  let mapImg = null;
  function closeMap() { if (mapEl) { mapEl.remove(); mapEl = null; } }
  function openMap(kind) {
    if (!V || mapEl || V.ph !== 'play' || MGP.el) return;
    if (!mapImg) {
      mapImg = document.createElement('canvas'); mapImg.width = 720; mapImg.height = 435;
      const g = mapImg.getContext('2d');
      paintWorld(g, 7.5, 0, 0, MW, MH, true); g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = 'rgba(10,20,50,.45)'; g.fillRect(0, 0, 720, 435);
      g.font = '800 13px system-ui,sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.75)';
      ROOMS.forEach(r => g.fillText(r.n.toUpperCase(), (r.x + r.w / 2) * 7.5, (r.y + 1.5) * 7.5));
    }
    const box = h('div', 'au-mapo'), card = h('div', 'au-map'), head = h('div', 'au-mgh'), x = h('button', 'au-mgx', '&times;');
    head.innerHTML = `<b>${kind === 'sab' ? 'Sabotage' : 'Ship Map'}</b>`; head.append(x);
    const body = h('div', 'au-mapb');
    const c2 = document.createElement('canvas'); c2.width = 720; c2.height = 435;
    body.append(c2);
    card.append(head, body); box.append(card); ui.append(box);
    mapEl = box;
    const close = () => closeMap();
    x.addEventListener('click', close);
    box.addEventListener('pointerdown', e => { if (e.target === box) close(); });
    const pos = (xx, yy) => `left:${xx / MW * 100}%;top:${yy / MH * 100}%`;
    const g = c2.getContext('2d');
    const dots = [];
    if (kind === 'sab') {
      const mk = (txt, ic, xx, yy, fn, cls) => { const bt = h('button', 'au-sb ' + (cls || ''), `${ICON.sab}<span>${txt}</span>`); bt.style.cssText = pos(xx, yy); bt.addEventListener('pointerdown', e => { e.preventDefault(); if (bt.classList.contains('off')) return; fn(); }); body.append(bt); dots.push(bt); return bt; };
      const rc = n => { const r = ROOMS.find(q => q.n === n); return [r.x + r.w / 2, r.y + r.h / 2]; };
      const sb = (k, xx, yy, txt) => mk(txt, 0, xx, yy, () => { sendHost({ t: 'sab', k }); closeMap(); }, 'sk');
      sb('lights', ST.lights.cx, ST.lights.cy, 'Lights'); sb('comms', ST.comms.cx, ST.comms.cy, 'Comms');
      sb('reactor', rc('Reactor')[0] + 3, rc('Reactor')[1] - 4, 'Reactor'); sb('o2', rc('O2')[0], rc('O2')[1], 'O2');
      DOOR_ROOMS.forEach(n => { const p = rc(n); mk('Doors', 0, p[0], p[1] + 2.5, () => { sendHost({ t: 'sab', k: 'doors', r: n }); closeMap(); }, 'dr').title = n; });
    }
    const upd = () => {
      if (!mapEl || mapEl !== box) return;
      g.drawImage(mapImg, 0, 0);
      const comms = sabK() === 'comms';
      if (!comms && V.role === 0) V.tasks.forEach(t => t.steps.forEach((s, si) => { if (taskAvail(t, si)) { const q = ST[s.st]; g.fillStyle = '#ffd84a'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(q.cx * 7.5, q.cy * 7.5, 6, 0, TAU); g.fill(); g.stroke(); } }));
      if (V.role === 1) V.tasks.forEach(t => t.steps.forEach((s, si) => { if (!s.done) { const q = ST[s.st]; g.fillStyle = '#ffd84a99'; g.beginPath(); g.arc(q.cx * 7.5, q.cy * 7.5, 5, 0, TAU); g.fill(); } }));
      const sb = V.st.sab;
      if (sb) { const ids = sb.k === 'lights' ? ['lights'] : sb.k === 'comms' ? ['comms'] : sb.k === 'reactor' ? ['reactor1', 'reactor2'] : ['o2_1', 'o2_2']; ids.forEach(id => { const q = ST[id]; g.fillStyle = '#ff3a2a'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(q.cx * 7.5, q.cy * 7.5, 8, 0, TAU); g.fill(); g.stroke(); }); }
      const col = COLORS[meCol()][1];
      g.fillStyle = col; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(V.px * 7.5, V.py * 7.5, 8, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.font = '800 12px system-ui'; g.textAlign = 'center'; g.fillText('YOU', V.px * 7.5, V.py * 7.5 - 13);
      if (kind === 'sab') {
        const busy = !!V.st.sab, cd = stNow('sabcd'), dcd = stNow('doorcd');
        dots.forEach(d => { const isDoor = d.classList.contains('dr'); d.classList.toggle('off', busy || (isDoor ? dcd > 0 : cd > 0)); });
      }
      requestAnimationFrame(upd);
    };
    upd();
  }
  api.on(window, 'keydown', e => {
    if (e.target && e.target.closest && e.target.closest('input,textarea')) return;
    const k = e.key.toLowerCase();
    if (!V || mode !== 'game') return;
    if (k === 'm' || k === 'tab') { e.preventDefault(); if (mapEl) closeMap(); else openMap('map'); return; }
    if (k === 'escape') { const ps = document.querySelector('.au-pause'); if (mapEl) closeMap(); else if (MGP.el) closePanel(); else if (ps) ps.remove(); else if (mode === 'game') openPause(); return; }
    if (V.ph !== 'play') return;
    if (k === 'e' || k === ' ') { e.preventDefault(); if (!e.repeat) doUse(); }
    else if (k === 'q') doKill();
    else if (k === 'r') doReport();
    else if (k === 'v') doVent();
    else if (k === 'x' && V.role === 1) openMap('sab');
  });

  function openPause() {
    if (!V || document.querySelector('.au-pause')) return;
    const box = h('div', 'au-pause');
    box.innerHTML = '<div class="au-card"><h3>Game menu</h3><button data-a="r" class="au-bt">Resume</button><button data-a="l" class="au-bt red">Leave game</button></div>';
    ui.append(box);
    box.addEventListener('click', e => { const a = e.target.dataset && e.target.dataset.a; if (a === 'r' || e.target === box) box.remove(); else if (a === 'l') { box.remove(); leaveGame(); } });
  }


  const HELP_TXT = [
    ['Crewmates', 'Finish your tasks around the ship, report bodies and vote out the Impostors. If the task bar fills, the crew wins.'],
    ['Impostors', 'Blend in with fake tasks, kill crewmates when nobody sees you, use vents and sabotage the ship. Win when Impostors equal the crew or a sabotage timer runs out.'],
    ['Controls', 'WASD or arrows move. E or Space uses. Q kills. R reports a body. V vents. X sabotages. M or Tab opens the map. On touch drag anywhere to move.'],
    ['Meetings', 'Report a body or press the emergency button. Chat, then vote. Ties and skips eject nobody.']
  ];
  function showMenu() {
    mode = 'menu'; V = null; MT = null; hideAllLayers(); closePanel(); closeMap();
    hud.innerHTML = '';
    const el = h('div', 'au-menu');
    el.innerHTML = `<div class="au-hero">${crewSvg(COLORS[saved.color], 1)}</div><div class="au-logo"><span>AMONG</span><span>US</span></div><div class="au-tag">Find the impostor. Finish the tasks.</div>
<div class="au-mb"><button class="au-bt" data-a="solo">Play vs Bots</button><button class="au-bt blue" data-a="online">Play Online</button><button class="au-bt ghost" data-a="help">How to play</button></div>
<div class="au-st">${saved.games ? `Games ${saved.games} &middot; Wins ${saved.wins}` : 'Up to 15 players &middot; 19 tasks &middot; 4 sabotages'}</div>`;
    showLayer('menu', el);
    el.addEventListener('click', e => {
      const a = e.target.dataset && e.target.dataset.a;
      if (!a) return;
      snd('click'); audio();
      if (a === 'solo') soloLobby();
      else if (a === 'online') goOnline();
      else if (a === 'help') showHelp();
    });
  }
  function showHelp() {
    const el = h('div', 'au-pause');
    el.innerHTML = `<div class="au-card wide"><h3>How to play</h3>${HELP_TXT.map(x => `<p><b>${x[0]}.</b> ${x[1]}</p>`).join('')}<button class="au-bt" data-a="x">Got it</button></div>`;
    ui.append(el);
    el.addEventListener('click', e => { if (e.target === el || (e.target.dataset && e.target.dataset.a)) el.remove(); });
  }

  const uniq = (name, taken) => { let n = cleanName(name) || 'Player', k = n, i = 2; while (taken.includes(k.toLowerCase())) k = n.slice(0, 13) + ' ' + i++; return k; };
  const freeColor = (used, pref) => { if (pref != null && pref >= 0 && !used.includes(pref)) return pref; const f = shuffle(COLORS.map((c, i) => i).filter(i => !used.includes(i))); return f.length ? f[0] : 0; };
  const botNames = taken => shuffle(BOT_NAMES.slice()).filter(n => !taken.includes(n.toLowerCase()));
  function soloLobby() {
    G.role = 'solo'; G.ids = [null]; G.meIdx = 0;
    L.me = 0; L.lead = 0; L.S = fixSettings(saved.set); L.size = clamp(saved.np, 4, 15);
    L.roster = [{ name: myProfileName(), color: saved.color, bot: 0, id: null }];
    fillBots();
    showLobby();
  }
  function fillBots() {
    const r = L.roster;
    while (r.length > L.size) { const k = r.map((x, i) => x.bot ? i : -1).filter(i => i >= 0).pop(); if (k == null || k < 0) break; r.splice(k, 1); }
    const bn = botNames(r.map(x => x.name.toLowerCase()));
    while (r.length < L.size) {
      const used = r.map(x => x.color);
      r.push({ name: bn.shift() || 'Bot' + r.length, color: freeColor(used), bot: 1, id: null });
    }
  }

  const LB = { cv: null, el: null };
  function showLobby() {
    mode = 'lobby'; V = null; hideAllLayers(); closePanel(); closeMap();
    hud.innerHTML = '';
    const el = h('div', 'au-lobby');
    el.innerHTML = '<div class="au-lst"><canvas></canvas><div class="au-lnote"></div></div><div class="au-lpn"><div class="au-tabs"><button data-t="0">Customize</button><button data-t="1">Game settings</button></div><div class="au-lb"></div><div class="au-lf"></div></div>';
    showLayer('lobby', el);
    LB.el = el; LB.cv = el.querySelector('canvas');
    el.addEventListener('click', lobbyClick);
    renderLobby();
  }
  const amLeader = () => L.me === L.lead;
  function renderLobby() {
    const el = LB.el;
    if (!el || mode !== 'lobby') return;
    el.querySelectorAll('.au-tabs button').forEach(b => b.classList.toggle('on', +b.dataset.t === L.tab));
    const lb = el.querySelector('.au-lb'), lf = el.querySelector('.au-lf'), lead = amLeader();
    if (L.tab === 0) {
      const used = L.roster.map(r => r.color);
      lb.innerHTML = '<div class="au-sws">' + COLORS.map((c, i) => `<button class="au-sw${used[L.me] === i ? ' on' : ''}" data-c="${i}" ${used.some((u, k) => u === i && k !== L.me) ? 'disabled' : ''} title="${c[0]}">${crewSvg(c, 1)}</button>`).join('') + '</div><p class="au-hint">Pick your colour. Colours already taken are greyed out.</p>';
    } else {
      const imp = Math.min(L.S.imp, maxImp(L.roster.length));
      let rows = '';
      if (G.role === 'solo') rows += `<div class="au-row"><span>Players</span><div><button data-p="-1" ${lead ? '' : 'disabled'}>-</button><b>${L.size}</b><button data-p="1" ${lead ? '' : 'disabled'}>+</button></div></div>`;
      else rows += `<div class="au-row"><span>Players</span><div><b>${L.roster.length}</b></div></div>`;
      SPEC.forEach(([k, label, opts, fmt]) => {
        const v = L.S[k];
        rows += `<div class="au-row"><span>${label}</span><div><button data-k="${k}" data-d="-1" ${lead ? '' : 'disabled'}>-</button><b>${fmt ? fmt(v) : v}</b><button data-k="${k}" data-d="1" ${lead ? '' : 'disabled'}>+</button></div></div>`;
      });
      lb.innerHTML = rows + `<p class="au-hint">${lead ? 'You control the settings.' : 'Only the party leader can change settings.'} Impostors in play: ${imp}.</p>`;
    }
    const ok = L.roster.length >= 4;
    lf.innerHTML = `<button class="au-bt" data-a="start" ${lead && ok ? '' : 'disabled'}>${lead ? (ok ? 'Start game' : 'Need 4 players') : 'Waiting for the leader…'}</button><button class="au-bt ghost" data-a="leave">Leave</button>`;
    el.querySelector('.au-lnote').textContent = G.role === 'solo' ? 'Practice with bots' : `Party ${api.net.code || ''}`;
  }
  function lobbyClick(e) {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    snd('click');
    if (b.dataset.t != null) { L.tab = +b.dataset.t; renderLobby(); return; }
    if (b.dataset.c != null) { setMyColor(+b.dataset.c); return; }
    if (b.dataset.p) { L.size = clamp(L.size + +b.dataset.p, 4, 15); saved.np = L.size; save(); fillBots(); lobbyChanged(); return; }
    if (b.dataset.k) {
      const spec = SPEC.find(s => s[0] === b.dataset.k), opts = spec[2], i = opts.indexOf(L.S[spec[0]]), j = clamp(i + +b.dataset.d, 0, opts.length - 1);
      if (G.role === 'guest') api.net.send({ t: 'set', k: spec[0], v: opts[j] }); else { L.S[spec[0]] = opts[j]; saved.set = Object.assign({}, L.S); save(); lobbyChanged(); }
      return;
    }
    const a = b.dataset.a;
    if (a === 'leave') leaveGame();
    else if (a === 'start') { if (G.role === 'guest') api.net.send({ t: 'start' }); else startHostGame(); }
  }
  function setMyColor(c) {
    if (L.roster.some((r, k) => k !== L.me && r.color === c)) return;
    saved.color = c; save();
    if (G.role === 'guest') { api.net.send({ t: 'color', c }); L.roster[L.me].color = c; renderLobby(); } else { L.roster[L.me].color = c; lobbyChanged(); }
  }
  function lobbyChanged() {
    renderLobby();
    if (G.role === 'host') sendLobby();
  }
  function sendLobby(only) {
    const lead = leaderIdx();
    L.lead = lead;
    const base = { t: 'lobby', roster: L.roster.map(r => ({ name: r.name, color: r.color, bot: r.bot ? 1 : 0 })), S: L.S, lead };
    L.roster.forEach((r, i) => { if (i === 0 || r.bot || !r.id) return; if (only != null && only !== i) return; api.net.sendTo(r.id, Object.assign({ me: i }, base)); });
  }
  const leaderIdx = () => { if (G.role !== 'host') return 0; const k = L.roster.findIndex(r => r.id && r.id === api.net.leader); return k < 0 ? 0 : k; };
  function onLobby(m) {
    if (G.role !== 'guest') return;
    L.roster = m.roster.map(r => ({ name: r.name, color: r.color, bot: r.bot })); L.S = m.S; L.me = m.me; L.lead = m.lead;
    if (mode !== 'lobby' || !LB.el) { showLobby(); } else renderLobby();
  }

  function drawLobby(now, dt) {
    const c = LB.cv;
    if (!c || !LB.el || mode !== 'lobby') return;
    const r = c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(r.width * d), hh = Math.round(r.height * d);
    if (!w || !hh) return;
    if (c.width !== w || c.height !== hh) { c.width = w; c.height = hh; }
    const g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, hh);
    bg.addColorStop(0, '#0a0d24'); bg.addColorStop(.62, '#161c42'); bg.addColorStop(.62, '#39425e'); bg.addColorStop(1, '#232a40');
    g.fillStyle = bg; g.fillRect(0, 0, w, hh);
    const hs = k => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${.35 + .45 * Math.abs(Math.sin(now / 700 + i))})`; g.fillRect(hs(i) * w, hs(i + 77) * hh * .6, d * (1 + hs(i + 9)), d * (1 + hs(i + 9))); }
    g.fillStyle = '#4a5578'; g.fillRect(0, hh * .62, w, d * 5);
    const n = L.roster.length, cols = Math.min(n, w / d > 520 ? 8 : 5), rows = Math.ceil(n / cols), S = Math.min(w / (cols + .6), hh * .62 / (rows * 1.1)) * .95;
    L.roster.forEach((p, i) => {
      const row = Math.floor(i / cols), col = i % cols, inRow = row === rows - 1 ? n - row * cols : cols;
      const x = w / 2 + (col - (inRow - 1) / 2) * S * 1.12, y = hh * .7 + row * S * .68 + (rows > 1 ? 0 : S * .2);
      const bob = Math.sin(now / 420 + i) * S * .02;
      drawCrew(g, x, y + bob, S, COLORS[p.color], { fx: i % 2 ? -1 : 1, moving: false });
      g.font = `800 ${Math.round(S * .2)}px system-ui,sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.lineWidth = d * 3; g.strokeStyle = 'rgba(0,0,0,.8)'; g.strokeText(p.name, x, y + S * .24);
      g.fillStyle = i === L.me ? '#ffe066' : '#fff'; g.fillText(p.name, x, y + S * .24);
      if (i === L.lead && G.role !== 'solo') { g.fillStyle = '#ffd84a'; g.font = `800 ${Math.round(S * .14)}px system-ui`; g.fillText('HOST', x, y - S * .98); }
      else if (p.bot) { g.fillStyle = '#9fb0c8'; g.font = `700 ${Math.round(S * .14)}px system-ui`; g.fillText('BOT', x, y - S * .98); }
    });
  }

  function showIntro() {
    const imp = V.role === 1, ni = Math.min(V.S.imp, maxImp(V.n));
    const el = h('div', 'au-intro ' + (imp ? 'imp' : 'crew'));
    const list = imp ? [V.me].concat(V.mates) : V.players.map(p => p.i);
    el.innerHTML = `<div class="au-it">${imp ? 'Impostor' : 'Crewmate'}</div><div class="au-is">${imp ? (ni > 1 ? 'Sabotage and kill the crew with your partners' : 'Sabotage and kill the crew') : `There ${ni === 1 ? 'is 1 Impostor' : 'are ' + ni + ' Impostors'} among us`}</div><div class="au-ir">${list.map(i => `<div>${crewSvg(COLORS[V.players[i].color], 1)}<span>${esc(V.players[i].name)}</span></div>`).join('')}</div>`;
    showLayer('intro', el);
    snd('start');
    api.timeout(() => hideLayer('intro'), Math.max(500, V.introUntil - performance.now() + 250));
  }

  let EJ = null;
  function meetMsg(m) {
    if (!V) return;
    switch (m.k) {
      case 'start': {
        closePanel(); closeMap();
        const old = document.querySelector('.au-pause'); if (old) old.remove();
        V.ph = 'meet'; EJ = null;
        MT = { caller: m.caller, body: m.body, alive: m.alive, ph: 'alert', tEnd: performance.now() + 3400, voted: m.alive.map(() => 0), chat: [], res: null, sel: null, my: null, disc: m.disc, vote: m.vote, anon: V.S.anon };
        V.alive = !!m.alive[V.me];
        V.bodies = [];
        buildMeet();
        snd(m.body >= 0 ? 'report' : 'alarm');
        break;
      }
      case 'sync': {
        V.ph = 'meet';
        MT = { caller: m.caller, body: m.body, alive: m.alive, ph: m.ph, tEnd: performance.now() + m.tt * 1000, voted: m.voted, chat: m.chat || [], res: m.res, sel: null, my: null, disc: m.disc, vote: m.vote, anon: V.S.anon };
        V.alive = !!m.alive[V.me];
        buildMeet(true);
        break;
      }
      case 'ph': if (MT) { MT.ph = m.ph; MT.tEnd = performance.now() + m.tt * 1000; renderMeet(); } break;
      case 'chat': if (MT) { MT.chat.push({ i: m.i, text: m.text, dead: m.dead }); addChat(MT.chat[MT.chat.length - 1]); snd('chat'); } break;
      case 'voted': if (MT) { MT.voted[m.i] = 1; renderMeet(); snd('vote'); } break;
      case 'res': if (MT) { MT.res = m; MT.ph = 'res'; MT.tEnd = performance.now() + 6000; renderMeet(); } break;
      case 'eject': startEject(m.e); break;
      case 'end': V.ph = 'play'; EJ = null; MT = null; hideLayer('meet'); hideLayer('eject'); V.flash = 0; break;
    }
  }

  function buildMeet(quiet) {
    const el = h('div', 'au-meet');
    el.innerHTML = `<div class="au-mhd"><b>Who's the Impostor?</b><span class="au-mt"></span></div>
<div class="au-mbody"><div class="au-mpl"></div><div class="au-mch"><div class="au-mlog"></div><form class="au-mfm"><input maxlength="140" placeholder="Type a message" autocomplete="off"><button type="submit">Send</button></form></div></div>
<div class="au-mft"><button class="au-bt ghost au-skip" type="button">Skip vote</button><span class="au-mstat"></span></div><div class="au-msplash"></div>`;
    showLayer('meet', el);
    const pl = el.querySelector('.au-mpl');
    V.players.forEach(p => {
      const c = h('div', 'au-pc');
      c.dataset.i = p.i;
      c.innerHTML = `<div class="ic">${crewSvg(COLORS[p.color], 1)}</div><div class="nm">${esc(p.name)}</div><div class="stk"></div><div class="vts"></div><div class="cf"><button class="y" type="button">&#10003;</button><button class="n" type="button">&#10005;</button></div>`;
      pl.append(c);
    });
    pl.addEventListener('click', e => {
      const card = e.target.closest('.au-pc');
      if (!card || !MT || MT.ph !== 'vote' || !V.alive || MT.voted[V.me] || MT.my !== null) return;
      const i = +card.dataset.i;
      if (e.target.closest('.y')) { castMyVote(i); return; }
      if (e.target.closest('.n')) { MT.sel = null; renderMeet(); return; }
      if (!MT.alive[i] || i === V.me) return;
      MT.sel = i; snd('click'); renderMeet();
    });
    el.querySelector('.au-skip').addEventListener('click', () => {
      if (!MT || MT.ph !== 'vote' || !V.alive || MT.voted[V.me]) return;
      if (MT.sel === -1) castMyVote(-1); else { MT.sel = -1; renderMeet(); snd('click'); }
    });
    const fm = el.querySelector('.au-mfm'), inp = fm.querySelector('input');
    fm.addEventListener('submit', e => {
      e.preventDefault();
      const t = inp.value.trim();
      if (t && MT && (MT.ph === 'disc' || MT.ph === 'vote')) { sendHost({ t: 'chat', x: t }); inp.value = ''; }
    });
    inp.addEventListener('keydown', e => e.stopPropagation());
    inp.addEventListener('keyup', e => e.stopPropagation());
    MT.chat.forEach(addChat);
    const sp = el.querySelector('.au-msplash');
    if (MT.ph === 'alert' && !quiet) {
      const body = MT.body >= 0, cp = V.players[MT.caller];
      sp.innerHTML = `<div class="sp ${body ? 'body' : ''}"><b>${body ? 'DEAD BODY REPORTED' : 'EMERGENCY MEETING'}</b><div>${cp ? crewSvg(COLORS[cp.color], 1) : ''}</div><span>${cp ? esc(cp.name) : ''}</span></div>`;
      sp.classList.add('on');
    }
    renderMeet();
  }
  function castMyVote(i) {
    MT.my = i; MT.sel = null;
    sendHost({ t: 'vote', v: i });
    snd('vote'); renderMeet();
  }
  function addChat(c) {
    const lg = layers.meet && layers.meet.querySelector('.au-mlog');
    if (!lg) return;
    const p = V.players[c.i];
    const d = h('div', 'cm' + (c.dead ? ' dead' : ''));
    d.innerHTML = `<b style="color:${COLORS[p.color][1]}">${esc(p.name)}</b> ${esc(c.text)}`;
    lg.append(d); lg.scrollTop = lg.scrollHeight;
  }
  function renderMeet() {
    const el = layers.meet;
    if (!el || !MT) return;
    const vote = MT.ph === 'vote' && V.alive && !MT.voted[V.me] && MT.my === null;
    el.querySelectorAll('.au-pc').forEach(c => {
      const i = +c.dataset.i, alive = MT.alive[i];
      c.classList.toggle('dead', !alive);
      c.classList.toggle('me', i === V.me);
      c.classList.toggle('sel', MT.sel === i);
      c.classList.toggle('can', vote && alive && i !== V.me);
      c.classList.toggle('ej', !!(MT.res && MT.res.ej === i));
      const stk = c.querySelector('.stk');
      stk.innerHTML = (MT.voted[i] ? '<i class="vd">I VOTED</i>' : '') + (MT.caller === i ? '<i class="cl">&#128226;</i>' : '');
      const vts = c.querySelector('.vts');
      if (MT.res) {
        let h2 = '';
        if (MT.res.votes) MT.res.votes.forEach((t, v) => { if (t === i && MT.alive[v] !== undefined) h2 += `<s style="background:${COLORS[V.players[v].color][1]}"></s>`; });
        else if (MT.res.cnt[i]) h2 = `<em>${MT.res.cnt[i]}</em>`;
        vts.innerHTML = h2;
      } else vts.innerHTML = '';
    });
    const sk = el.querySelector('.au-skip');
    sk.disabled = !vote;
    sk.classList.toggle('sel', MT.sel === -1);
    sk.textContent = MT.sel === -1 ? 'Confirm skip' : 'Skip vote';
    const stat = el.querySelector('.au-mstat');
    let t = '';
    if (!V.alive) t = 'You are dead. Ghosts can only chat with ghosts.';
    else if (MT.ph === 'vote') t = MT.voted[V.me] || MT.my !== null ? 'Vote cast. Waiting for the others…' : 'Click a player to vote';
    else if (MT.ph === 'disc') t = 'Discuss. Voting opens soon.';
    else if (MT.ph === 'res') { const r = MT.res; t = r && r.cnt ? `Skipped: ${r.cnt[r.cnt.length - 1]}` : ''; }
    stat.textContent = t;
    if (MT.res && el.querySelector('.au-skip') && MT.res.votes) {
      let s = '';
      MT.res.votes.forEach((tg, v) => { if (tg === -1 && MT.alive[v] !== undefined) s += `<s style="background:${COLORS[V.players[v].color][1]}"></s>`; });
      stat.innerHTML = esc(t) + ' <span class="sk">' + s + '</span>';
    }
  }
  function meetTimer(now) {
    const el = layers.meet;
    if (!el || !MT) return;
    const s = Math.max(0, Math.ceil((MT.tEnd - now) / 1000));
    const lab = MT.ph === 'alert' ? '' : MT.ph === 'disc' ? `Discussion ends in ${s}s` : MT.ph === 'vote' ? `Voting ends in ${s}s` : 'Results';
    const t = el.querySelector('.au-mt');
    if (t.textContent !== lab) t.textContent = lab;
    const sp = el.querySelector('.au-msplash');
    if (sp.classList.contains('on') && MT.ph !== 'alert') sp.classList.remove('on');
    const stat = el.querySelector('.au-mstat');
    if (MT.ph === 'alert' && stat.textContent !== '') stat.textContent = '';
  }

  function startEject(info) {
    hideLayer('meet');
    V.ph = 'eject';
    let kind = 'skip';
    if (info.i < 0 && MT && MT.res) {
      const c = MT.res.cnt, top = Math.max.apply(null, c);
      kind = top > 0 && c.filter(x => x === top).length > 1 ? 'tie' : 'skip';
      if (top > 0 && c[c.length - 1] === top && c.filter(x => x === top).length === 1) kind = 'skip';
    }
    const p = info.i >= 0 ? V.players[info.i] : null;
    let l1, l2 = '';
    if (p) {
      if (info.imp >= 0) { l1 = `${p.name} was ${info.imp ? '' : 'not '}an Impostor.`; if (info.left >= 0) l2 = `${info.left} Impostor${info.left === 1 ? '' : 's'} remain${info.left === 1 ? 's' : ''}.`; }
      else l1 = `${p.name} was ejected.`;
    } else l1 = `No one was ejected. (${kind === 'tie' ? 'Tie' : 'Skipped'})`;
    EJ = { info, t0: performance.now(), l1, l2, p, dur: info.i >= 0 ? 8200 : 5200 };
    if (info.i >= 0) snd('whoosh');
    if (V.me === info.i) V.alive = false;
    MT = null;
  }
  function drawEject(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, cw, ch);
    const t = (now - EJ.t0) / 1000;
    if (!menuStars || menuStars.w !== cw) menuStars = { w: cw, s: Array.from({ length: 140 }, () => ({ x: Math.random() * cw, y: Math.random() * ch, z: Math.random() * .8 + .2 })), f: [] };
    menuStars.s.forEach(s => { s.x -= s.z * 3 * dpr * 3; if (s.x < 0) { s.x = cw; s.y = Math.random() * ch; } ctx.fillStyle = `rgba(255,255,255,${.3 + s.z * .6})`; ctx.fillRect(s.x, s.y, s.z * 2.5 * dpr * 2, s.z * 1.2 * dpr); });
    const F = Math.min(TP * 2.4, ch * .26);
    if (EJ.p) {
      const k = clamp((t - .6) / 5.2, 0, 1), x = -F + (cw + F * 2) * k, y = ch * .42 + Math.sin(t * 1.6) * ch * .03;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2.3);
      drawCrew(ctx, 0, F * .43, F, COLORS[EJ.p.color], { fx: 1, ghost: false });
      ctx.restore();
    }
    const show = (txt, t0, yy) => {
      const n = Math.floor(clamp((t - t0) * 26, 0, txt.length));
      if (!n) return;
      ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(Math.min(TP * .9, cw / 18))}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt.slice(0, n), cw / 2, yy);
    };
    const t1 = EJ.p ? 2.2 : .6;
    show(EJ.l1, t1, ch * .8);
    if (EJ.l2) show(EJ.l2, t1 + 1.8, ch * .88);
    const f = t < .5 ? 1 - t / .5 : (EJ.dur / 1000 - t < .6 ? 1 - (EJ.dur / 1000 - t) / .6 : 0);
    if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, cw, ch); }
  }

  function showOver() {
    if (!V || !V.over || layers.over) return;
    const o = V.over, imp = V.role === 1, win = (o.w === 'crew') === !imp;
    saved.games++; if (win) saved.wins++; save();
    api.score(saved.wins);
    if (G.role === 'solo' && win) { try { api.submit(saved.wins); } catch (e) {} }
    snd(win ? 'win' : (o.why === 'sabotage' ? 'boom' : 'lose'));
    const el = h('div', 'au-over ' + (win ? 'win' : 'lose'));
    const rows = V.players.map(p => `<div class="r ${o.roles[p.i] ? 'imp' : ''} ${o.alive[p.i] ? '' : 'dead'}">${crewSvg(COLORS[p.color], 1)}<b>${esc(p.name)}</b><em>${o.roles[p.i] ? 'Impostor' : 'Crewmate'}</em></div>`).join('');
    const lead = G.role === 'solo' || G.role === 'host' ? leaderIdx() === 0 : L.me === L.lead;
    el.innerHTML = `<div class="ot">${win ? 'VICTORY' : 'DEFEAT'}</div><div class="os">${REASON[o.why] || ''}</div><div class="au-orl">${rows}</div><div class="au-ob">${lead ? '<button class="au-bt" data-a="again">Play again</button>' : '<span class="wl">Waiting for the leader…</span>'}${G.role === 'host' ? '<button class="au-bt blue" data-a="party">Party lobby</button>' : ''}<button class="au-bt ghost" data-a="leave">Leave</button></div>`;
    showLayer('over', el);
    el.addEventListener('click', e => {
      const a = e.target.dataset && e.target.dataset.a;
      if (!a) return;
      snd('click');
      if (a === 'leave') leaveGame();
      else if (a === 'again') { if (G.role === 'guest') api.net.send({ t: 'again' }); else backToLobby(); }
      else if (a === 'party') { backToLobby(true); }
    });
  }


  let tok = 0, hooked = false, resumeCand = false;
  const ROOM = { title: 'Among Us', sizes: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], defaultSize: 10, min: 4, max: 15, bots: true };
  const SKEY = () => 'au:' + (api.net.code || '');
  const note = (title, text, btn, fn) => {
    const el = h('div', 'au-pause');
    el.innerHTML = `<div class="au-card"><h3>${esc(title)}</h3><p>${esc(text)}</p><button class="au-bt">${esc(btn)}</button></div>`;
    el.querySelector('button').addEventListener('click', () => { snd('click'); fn(); });
    return el;
  };

  function onMsg(m) {
    if (!m || typeof m.t !== 'string') return;
    switch (m.t) {
      case 'lobby': onLobby(m); break;
      case 'cfg': if (api.net.role === 'guest') G.role = 'guest'; onCfg(m); break;
      case 's': onSnap(m); break;
      case 'st': onSt(m); break;
      case 'tasks':
        if (!V || !Array.isArray(m.d)) break;
        V.tasks.forEach((t, ti) => t.steps.forEach((s, si) => { if (m.d[ti]) s.done = m.d[ti][si] ? 1 : 0; }));
        V.sa = m.sa || 0; V.saT = performance.now(); mgState(); updHud(true);
        break;
      case 'ev': onEv(m); break;
      case 'm': meetMsg(m); break;
      case 'over': onOver(m); break;
    }
  }

  function startHostGame() {
    if (L.roster.length < 4) return;
    if (G.role === 'host') {
      const live = new Set(api.net.players.map(p => p.id));
      L.roster.forEach((r, i) => { if (i && r.id && !live.has(r.id)) { r.id = null; r.bot = 1; } });
    }
    G.ids = L.roster.map(r => r.id || null); G.meIdx = 0; G.inbox.length = 0;
    G.H = makeHost(hostEnv, { players: L.roster.map(r => ({ id: r.id, name: r.name, color: r.color, bot: !!r.bot })), settings: L.S });
    flushInbox();
  }

  function backToLobby(party) {
    const H = G.H;
    if (H) L.roster = H.P.map((p, i) => ({ name: p.name, color: p.color, bot: p.bot ? 1 : 0, id: p.bot ? null : (i ? p.id : (G.role === 'host' ? api.net.id : null)) }));
    G.H = null; V = null; MT = null; EJ = null; G.inbox.length = 0;
    try { sessionStorage.removeItem(SKEY()); } catch (e) {}
    closePanel(); closeMap(); hideAllLayers();
    if (G.role === 'host') {
      if (party) { goOnline(); return; }
      const live = new Set(api.net.players.map(p => p.id));
      L.roster = L.roster.filter((r, i) => !i || !r.id || live.has(r.id));
      L.size = clamp(G.botsOn ? Math.max(L.size, L.roster.length) : L.roster.length, 4, 15);
    }
    fillBots();
    showLobby();
    if (G.role === 'host') sendLobby();
  }

  function leaveGame() {
    const online = G.role === 'host' || G.role === 'guest';
    try { if (G.role === 'host') sessionStorage.removeItem(SKEY()); } catch (e) {}
    tok++;
    G.H = null; V = null; MT = null; EJ = null; G.inbox.length = 0;
    closePanel(); closeMap();
    ui.querySelectorAll('.au-pause').forEach(x => x.remove());
    const was = G.role;
    G.role = 'solo';
    showMenu();
    if (online) { try { api.net.close(); } catch (e) {} }
    return was;
  }

  function hostData(m, from) {
    if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
    const lead = from === api.net.leader;
    if (mode === 'lobby') {
      const k = L.roster.findIndex(r => r.id === from);
      if (k < 0) return;
      if (m.t === 'color') {
        const c = m.c | 0;
        if (c >= 0 && c < COLORS.length && !L.roster.some((r, j) => j !== k && r.color === c)) { L.roster[k].color = c; lobbyChanged(); }
      } else if (m.t === 'set' && lead) {
        const spec = SPEC.find(s => s[0] === m.k);
        if (spec && spec[2].includes(+m.v)) { L.S[spec[0]] = +m.v; saved.set = Object.assign({}, L.S); save(); lobbyChanged(); }
      } else if (m.t === 'start' && lead) startHostGame();
      else if (m.t === 'sync') sendLobby(k);
      return;
    }
    if (mode !== 'game' || !G.H) return;
    const i = G.ids.indexOf(from);
    if (i <= 0 || G.H.P[i].bot) return;
    if (m.t === 'again') { if (lead && V && V.over) backToLobby(); return; }
    G.H.recv(i, m);
  }

  function onLeave(id) {
    if (mode === 'lobby') {
      const k = L.roster.findIndex(r => r.id === id);
      if (k > 0) { L.roster.splice(k, 1); L.size = clamp(G.botsOn ? L.size : L.roster.length, 4, 15); fillBots(); lobbyChanged(); }
      return;
    }
    const i = G.ids.indexOf(id);
    if (G.H && i > 0) { G.ids[i] = null; G.H.leave(i); }
  }
  function onRejoin(id) {
    if (mode === 'lobby') { const k = L.roster.findIndex(r => r.id === id); if (k > 0) sendLobby(k); return; }
    const i = G.ids.indexOf(id);
    if (G.H && i > 0 && !G.H.P[i].bot) G.H.resend(i);
  }

  function hookNet() {
    if (hooked) return;
    hooked = true;
    const n = api.net;
    n.on('data', (m, from) => {
      G.rx = performance.now();
      if (n.role === 'host') hostData(m, from); else onMsg(m);
    });
    n.on('leave', p => { if (p && n.role === 'host') onLeave(p.id); });
    n.on('rejoin', p => { if (p && n.role === 'host') onRejoin(p.id); });
    n.on('lobby', () => { if (n.role !== 'host' && mode !== 'menu') goOnline(); });
    n.on('close', reason => {
      if (G.role !== 'guest' || mode === 'menu') return;
      tok++;
      G.H = null; V = null; MT = null; EJ = null; closePanel(); closeMap(); hideAllLayers();
      mode = 'menu'; G.role = 'solo'; hud.innerHTML = '';
      const t = reason === 'kicked' ? ['Removed', 'The host removed you from the party.'] : reason === 'host-left' ? ['Host left', 'The host ended the game.'] : ['Connection lost', 'The connection to the host was lost.'];
      showLayer('note', note(t[0], t[1], 'Back to menu', () => { hideLayer('note'); showMenu(); }));
    });
  }

  function applyRoom(r) {
    const prev = new Map(L.roster.filter(x => x.id).map(x => [x.id, x]));
    const used = [], ros = [];
    r.players.forEach((p, i) => {
      const o = prev.get(p.id), c = freeColor(used, o ? o.color : i === 0 ? saved.color : -1);
      used.push(c);
      ros.push({ name: uniq(p.name, ros.map(x => x.name.toLowerCase())), color: c, bot: 0, id: p.id });
    });
    L.roster = ros; L.me = 0; L.lead = 0; L.tab = 0; G.botsOn = !!r.bots;
    L.size = clamp(r.bots ? Math.max(+r.size || 0, ros.length) : ros.length, 4, 15);
    L.S = fixSettings(saved.set);
    fillBots();
  }

  function showWait() {
    mode = 'lobby'; V = null; LB.el = null; hideAllLayers(); hud.innerHTML = '';
    showLayer('wait', note('Connected', 'Waiting for the host to open the ship…', 'Leave', leaveGame));
  }

  async function goOnline() {
    hookNet();
    const my = ++tok;
    closePanel(); closeMap(); hideAllLayers(); hud.innerHTML = '';
    mode = 'menu'; V = null; MT = null; EJ = null; G.H = null;
    let r = null;
    try { r = await api.net.room(ROOM); } catch (e) { r = null; }
    if (!api.alive || my !== tok) return;
    if (!r) { G.role = 'solo'; showMenu(); return; }
    G.role = r.role;
    if (r.role !== 'host') {
      if (mode !== 'game' && mode !== 'lobby') showWait();
      return;
    }
    applyRoom(r);
    let sv = null;
    if (resumeCand) {
      try {
        const x = JSON.parse(sessionStorage.getItem(SKEY()) || 'null');
        if (x && x.d && x.d.phase !== 'over' && Date.now() - x.at < 6e5) sv = x;
      } catch (e) {}
    }
    resumeCand = false;
    if (sv) { askResume(sv, r); return; }
    showLobby(); sendLobby();
  }

  function askResume(sv, r) {
    mode = 'menu'; hideAllLayers();
    const hum = sv.pl.filter((p, i) => i && !p.bot).length;
    const el = h('div', 'au-pause');
    el.innerHTML = `<div class="au-card"><h3>Game in progress</h3><p>A saved game was found (${sv.pl.length} players, ${hum} online). Players who are not here will be replaced by bots.</p><button class="au-bt" data-a="go">Resume game</button><button class="au-bt blue" data-a="new">New game</button><button class="au-bt ghost" data-a="leave">Leave</button></div>`;
    showLayer('resume', el);
    el.addEventListener('click', e => {
      const a = e.target.dataset && e.target.dataset.a;
      if (!a) return;
      snd('click');
      if (a === 'go') { hideLayer('resume'); resumeGame(sv, r); } else if (a === 'new') { hideLayer('resume'); try { sessionStorage.removeItem(SKEY()); } catch (x) {} showLobby(); sendLobby(); } else leaveGame();
    });
  }
  function resumeGame(sv, r) {
    const guests = r.players.slice(1), used = new Set(), seat = {};
    sv.pl.forEach((p, i) => { if (i && !p.bot) { const g = guests.find(q => !used.has(q.id) && cleanName(q.name) === p.name); if (g) { used.add(g.id); seat[i] = g; } } });
    sv.pl.forEach((p, i) => { if (i && !p.bot && !seat[i]) { const g = guests.find(q => !used.has(q.id)); if (g) { used.add(g.id); seat[i] = g; } } });
    const players = sv.pl.map((p, i) => i === 0 ? { id: r.players[0].id, name: p.name, color: p.color, bot: false } : seat[i] ? { id: seat[i].id, name: p.name, color: p.color, bot: false } : { id: null, name: p.name, color: p.color, bot: true });
    G.mute = true;
    G.ids = players.map(x => x.id || null); G.meIdx = 0; G.inbox.length = 0;
    try {
      G.H = makeHost(hostEnv, { players, settings: sv.d.S });
      G.H.load(sv.d);
    } catch (e) { console.error(e); G.mute = false; G.H = null; showLobby(); sendLobby(); return; }
    G.mute = false;
    L.S = fixSettings(sv.d.S);
    L.roster = players.map(p => ({ name: p.name, color: p.color, bot: p.bot ? 1 : 0, id: p.id }));
    G.H.P.forEach(p => { if (!p.bot) G.H.resend(p.i); });
    flushInbox();
  }
  function saveDump() {
    const H = G.H;
    if (!H) return;
    try {
      if (H.phase === 'over') sessionStorage.removeItem(SKEY());
      else sessionStorage.setItem(SKEY(), JSON.stringify({ at: Date.now(), pl: H.P.map(p => ({ name: p.name, color: p.color, bot: p.bot ? 1 : 0 })), d: H.dump() }));
    } catch (e) {}
  }

  const PT = { id: -1, touch: false, x0: 0, y0: 0, vx: 0, vy: 0 };
  const ptMove = e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (PT.touch) {
      const R = Math.max(42, r.width * .075);
      let dx = x - PT.x0, dy = y - PT.y0, d = Math.hypot(dx, dy);
      if (d > R) { PT.x0 += dx * (d - R) / d; PT.y0 += dy * (d - R) / d; dx = x - PT.x0; dy = y - PT.y0; d = R; }
      const k = d > R * .16 ? d / R : 0;
      PT.vx = k && d ? dx / d * k : 0; PT.vy = k && d ? dy / d * k : 0;
      if (HD.joy) { HD.joy.style.left = PT.x0 + 'px'; HD.joy.style.top = PT.y0 + 'px'; HD.joy.firstChild.style.transform = `translate(${dx}px,${dy}px)`; }
    } else {
      const dx = x - r.width / 2, dy = y - r.height / 2, d = Math.hypot(dx, dy);
      PT.vx = d > 22 ? dx / d : 0; PT.vy = d > 22 ? dy / d : 0;
    }
  };
  const ptEnd = e => {
    if (e.pointerId !== PT.id) return;
    PT.id = -1; PT.vx = PT.vy = 0;
    if (HD.joy) HD.joy.classList.remove('on');
  };
  cv.addEventListener('pointerdown', e => {
    if (mode !== 'game' || !V || PT.id >= 0 || (e.pointerType === 'mouse' && e.button !== 0)) return;
    audio();
    PT.id = e.pointerId; PT.touch = e.pointerType !== 'mouse';
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    const r = cv.getBoundingClientRect();
    PT.x0 = e.clientX - r.left; PT.y0 = e.clientY - r.top; PT.vx = PT.vy = 0;
    if (PT.touch && HD.joy) HD.joy.classList.add('on');
    ptMove(e);
  });
  cv.addEventListener('pointermove', e => { if (e.pointerId === PT.id) ptMove(e); });
  cv.addEventListener('pointerup', ptEnd);
  cv.addEventListener('pointercancel', ptEnd);
  cv.addEventListener('contextmenu', e => e.preventDefault());

  const MOVEK = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
  api.on(window, 'keydown', e => {
    if (e.target && e.target.closest && e.target.closest('input,textarea')) return;
    const k = e.key.toLowerCase();
    if (MOVEK.has(k) && mode === 'game') { keys.add(k); e.preventDefault(); } else if (k === ' ' && mode === 'game') e.preventDefault();
  });
  api.on(window, 'keyup', e => { keys.delete(e.key.toLowerCase()); });
  api.on(window, 'blur', () => { keys.clear(); PT.id = -1; PT.vx = PT.vy = 0; });

  const kdir = () => {
    let x = 0, y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x--;
    if (keys.has('d') || keys.has('arrowright')) x++;
    if (keys.has('w') || keys.has('arrowup')) y--;
    if (keys.has('s') || keys.has('arrowdown')) y++;
    const l = Math.hypot(x, y);
    return l ? [x / l, y / l] : [0, 0];
  };
  let sendT = 0, lastSent = '';
  function stepMe(dt, now) {
    const can = V.ph === 'play' && V.vent < 0 && !MGP.el && !mapEl && !ui.querySelector('.au-pause');
    let vx = 0, vy = 0;
    if (can) { [vx, vy] = kdir(); if (!vx && !vy && PT.id >= 0) { vx = PT.vx; vy = PT.vy; } }
    const mvg = vx || vy;
    if (mvg) {
      const sp = 3.4 * V.S.speed * dt, o = { x: V.px, y: V.py };
      moveBy(o, vx * sp, vy * sp, !V.alive);
      V.px = o.x; V.py = o.y;
      if (Math.abs(vx) > .1) V.fx = vx > 0 ? 1 : -1;
      V.walk += dt * 11;
    }
    V.mv = mvg ? 1 : 0;
    if (V.ph === 'play' && V.vent < 0 && now - sendT >= 50) {
      const k = q2(V.px) + ',' + q2(V.py) + ',' + V.fx + ',' + V.mv;
      if (k !== lastSent || now - sendT >= 400) { sendT = now; lastSent = k; sendHost({ t: 'mv', x: q2(V.px), y: q2(V.py), fx: V.fx, mv: V.mv }); }
    }
  }

  let hudT = 0, syncT = 0, lastTick = performance.now(), acc = 0;
  api.loop((dt, now) => {
    if (mode !== 'game') EJ = null;
    if (mode === 'game' && V) {
      stepMe(dt, now);
      mgStep(dt);
      if (now - hudT > 100) { hudT = now; updHud(); }
      if (G.role === 'guest' && now - G.rx > 4000 && now - syncT > 4000 && api.net.connected !== false) { syncT = now; api.net.send({ t: 'sync' }); }
    }
    if (EJ && mode === 'game') drawEject(now); else render(dt, now);
    if (MT) meetTimer(now);
    drawLobby(now, dt);
  });
  api.interval(() => {
    const now = performance.now(), d = (now - lastTick) / 1000;
    lastTick = now;
    if (!G.H || (G.role === 'solo' && api.paused)) return;
    acc = Math.min(.5, acc + d);
    let n = 0;
    while (acc >= 1 / 30 && n++ < 15) { G.H.step(1 / 30); acc -= 1 / 30; }
    flushInbox();
  }, 25);
  api.interval(() => { if (G.role === 'host' && G.H && mode === 'game') saveDump(); }, 2000);
  api.interval(() => { if (G.role === 'host' && mode === 'lobby') sendLobby(); }, 2000);

  resize();
  if (api.net && api.net.invite) { resumeCand = api.net.invite === 'NEW'; goOnline(); } else showMenu();
  return {
    destroy() {
      tok++;
      if (ro) ro.disconnect();
      try { if (AC) AC.close(); } catch (e) {}
    }
  };
}


const CSS = `
$ {gap:0}
$ [hidden]{display:none!important}
$ .au-wrap{position:relative;margin:0 auto;border-radius:16px;overflow:hidden;background:#05070d;color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;user-select:none;-webkit-user-select:none;touch-action:none;box-shadow:0 12px 34px rgba(5,8,30,.45);max-width:100%}
$ .au-cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}
$ .au-hud,$ .au-ui{position:absolute;inset:0;pointer-events:none;--u:clamp(8px,1.5cqw,17px);font-size:var(--u)}
$ .au-port .au-hud,$ .au-port .au-ui{--u:clamp(8px,2.7cqw,15px)}
$ .au-wrap{container-type:size}
$ .au-ui>*{pointer-events:auto}
$ button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
$ .au-bt{display:block;width:100%;min-height:2.9em;padding:.55em 1.4em;border:0;border-radius:.9em;background:linear-gradient(#3ddc84,#1fa75c);color:#06240f;font-weight:800;font-size:1.15em;letter-spacing:.02em;box-shadow:0 .25em 0 #11643a,0 .5em 1em rgba(0,0,0,.35);transition:transform .08s,filter .15s}
$ .au-bt:hover:not(:disabled){filter:brightness(1.08)}
$ .au-bt:active:not(:disabled){transform:translateY(.15em);box-shadow:0 .1em 0 #11643a}
$ .au-bt.blue{background:linear-gradient(#5db4ff,#2a7de0);color:#06173a;box-shadow:0 .25em 0 #174f9a,0 .5em 1em rgba(0,0,0,.35)}
$ .au-bt.red{background:linear-gradient(#ff6a5a,#d63a2a);color:#fff;box-shadow:0 .25em 0 #8a1f14,0 .5em 1em rgba(0,0,0,.35)}
$ .au-bt.ghost{background:rgba(255,255,255,.1);color:#fff;box-shadow:inset 0 0 0 .14em rgba(255,255,255,.35)}
$ .au-bt:disabled{opacity:.45;cursor:default;filter:grayscale(.5)}
$ .au-bt.sel{outline:.18em solid #ffd84a}

$ .au-menu{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.9em;text-align:center;padding:2em;background:radial-gradient(ellipse at 50% 40%,rgba(30,40,100,.35),rgba(3,5,15,.7))}
$ .au-hero svg{width:7.5em;height:auto;filter:drop-shadow(0 .6em .8em rgba(0,0,0,.5));animation:aufloat 3.4s ease-in-out infinite}
$ .au-logo{display:flex;flex-direction:column;line-height:.88;font-weight:900;font-size:4.4em;letter-spacing:.04em;color:#e8edf8;text-shadow:0 .06em 0 #5a6896,0 .12em 0 #2a3260,0 .3em .5em rgba(0,0,0,.6)}
$ .au-logo span:last-child{color:#ff4b3a;text-shadow:0 .06em 0 #8e1d14,0 .12em 0 #4e0f0a,0 .3em .5em rgba(0,0,0,.6)}
$ .au-tag{opacity:.8;font-size:1.1em;margin-bottom:.4em}
$ .au-mb{display:flex;flex-direction:column;gap:.7em;width:min(20em,86%)}
$ .au-st{opacity:.65;font-size:.9em}
@keyframes aufloat{50%{transform:translateY(-.5em) rotate(2deg)}}

$ .au-pause{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,4,14,.7);backdrop-filter:blur(2px);z-index:30;padding:1em}
$ .au-card{background:linear-gradient(#1b2347,#121832);border:.15em solid #3a4780;border-radius:1.2em;padding:1.5em 1.6em;width:min(24em,100%);max-height:96%;overflow:auto;display:flex;flex-direction:column;gap:.8em;box-shadow:0 1em 3em rgba(0,0,0,.6)}
$ .au-card.wide{width:min(38em,100%)}
$ .au-card h3{margin:0;font-size:1.6em;text-align:center}
$ .au-card p{margin:0;opacity:.88;line-height:1.45;font-size:1em}

$ .au-lobby{position:absolute;inset:0;display:grid;grid-template-columns:1.4fr 1fr;gap:1em;padding:1em;background:radial-gradient(ellipse at 40% 20%,#1b2350,#060818)}
$ .au-port .au-lobby{grid-template-columns:1fr;grid-template-rows:34% 1fr;gap:.6em;padding:.6em}
$ .au-lst{position:relative;border-radius:1em;overflow:hidden;border:.15em solid #2d3868;min-height:0}
$ .au-lst canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
$ .au-lnote{position:absolute;left:.8em;top:.6em;font-weight:800;font-size:1.05em;text-shadow:0 .1em .3em #000}
$ .au-lpn{display:flex;flex-direction:column;min-height:0;background:linear-gradient(#171e40,#0f1430);border:.15em solid #2d3868;border-radius:1em;padding:.8em;gap:.7em}
$ .au-tabs{display:flex;gap:.4em}
$ .au-tabs button{flex:1;padding:.55em .4em;border-radius:.7em;border:.12em solid #3a4780;background:rgba(255,255,255,.05);color:#cfd6f5;font-weight:700;font-size:1em}
$ .au-tabs button.on{background:#3a4fb8;color:#fff;border-color:#7a8cf0}
$ .au-lb{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:.45em;padding-right:.2em}
$ .au-lf{display:flex;flex-direction:column;gap:.5em}
$ .au-sws{display:grid;grid-template-columns:repeat(5,1fr);gap:.55em}
$ .au-sw{position:relative;aspect-ratio:1;border-radius:.8em;border:.15em solid #2d3868;background:rgba(255,255,255,.05);padding:.3em;display:flex;align-items:center;justify-content:center}
$ .au-sw svg{width:80%;height:auto}
$ .au-sw.on{border-color:#ffd84a;background:rgba(255,216,74,.14);box-shadow:0 0 .8em rgba(255,216,74,.4)}
$ .au-sw:disabled{opacity:.22;cursor:default}
$ .au-row{display:flex;align-items:center;justify-content:space-between;gap:.6em;padding:.35em .6em;border-radius:.7em;background:rgba(255,255,255,.05);font-size:.95em}
$ .au-row div{display:flex;align-items:center;gap:.4em}
$ .au-row b{min-width:3.6em;text-align:center;color:#ffe066}
$ .au-row button{width:1.9em;height:1.9em;border-radius:.5em;border:0;background:#3a4fb8;color:#fff;font-weight:900;font-size:1em;line-height:1}
$ .au-row button:disabled{opacity:.3;cursor:default}
$ .au-hint{margin:.3em 0 0;opacity:.65;font-size:.85em;line-height:1.35}

$ .au-intro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7em;text-align:center;background:radial-gradient(ellipse at center,rgba(20,30,80,.55),rgba(2,3,10,.96));z-index:20;animation:auin .5s ease-out;pointer-events:none}
$ .au-intro.imp{background:radial-gradient(ellipse at center,rgba(120,10,10,.5),rgba(10,2,2,.96))}
$ .au-it{font-size:3.8em;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#7cc4ff;text-shadow:0 .08em 0 #174f9a,0 .3em .6em #000;animation:aupop .7s cubic-bezier(.2,1.6,.4,1)}
$ .au-intro.imp .au-it{color:#ff4b3a;text-shadow:0 .08em 0 #7a120a,0 .3em .6em #000}
$ .au-is{font-size:1.25em;opacity:.9}
$ .au-ir{display:flex;flex-wrap:wrap;gap:.8em 1.2em;justify-content:center;max-width:90%;margin-top:.6em}
$ .au-ir div{display:flex;flex-direction:column;align-items:center;gap:.2em;width:4.8em;animation:aupop .6s cubic-bezier(.2,1.6,.4,1) both}
$ .au-ir div:nth-child(2){animation-delay:.12s}
$ .au-ir div:nth-child(3){animation-delay:.24s}
$ .au-ir svg{width:3.6em;height:auto}
$ .au-ir span{font-size:.85em;font-weight:700;text-shadow:0 .1em .2em #000;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@keyframes auin{from{opacity:0}}
@keyframes aupop{from{transform:scale(.4);opacity:0}}

$ .au-meet{position:absolute;inset:0;z-index:15;display:grid;grid-template-rows:auto 1fr auto;gap:.6em;padding:.9em 1.1em;background:linear-gradient(#10162f,#080b1c);animation:auin .3s}
$ .au-mhd{display:flex;align-items:center;justify-content:space-between;gap:1em;font-size:1.3em}
$ .au-mt{font-size:.8em;font-weight:700;color:#ffe066}
$ .au-mbody{display:grid;grid-template-columns:1.5fr 1fr;gap:.8em;min-height:0}
$ .au-port .au-mbody{grid-template-columns:1fr;grid-template-rows:1.5fr 1fr}
$ .au-mpl{display:grid;grid-template-columns:repeat(2,1fr);gap:.5em;align-content:start;overflow:auto;min-height:0;padding-right:.2em}
$ .au-port .au-mpl{grid-template-columns:repeat(3,1fr)}
$ .au-pc{position:relative;display:flex;align-items:center;gap:.6em;padding:.45em .6em;border-radius:.8em;background:rgba(255,255,255,.07);border:.14em solid transparent;min-height:4em;transition:border-color .15s,background .15s}
$ .au-port .au-pc{flex-direction:column;align-items:flex-start;gap:.1em;min-height:5em;padding:.4em .5em}
$ .au-pc .ic svg{width:2.9em;height:auto;display:block}
$ .au-pc .nm{font-weight:800;font-size:1.1em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
$ .au-pc.me{border-color:rgba(255,216,74,.5)}
$ .au-pc.can{cursor:pointer}
$ .au-pc.can:hover{background:rgba(255,255,255,.14)}
$ .au-pc.sel{border-color:#7cc4ff;background:rgba(124,196,255,.18)}
$ .au-pc.dead{opacity:.4;filter:grayscale(1)}
$ .au-pc.ej{border-color:#ff4b3a;background:rgba(255,75,58,.2);opacity:1;filter:none}
$ .au-pc .stk{position:absolute;right:.4em;top:.3em;display:flex;gap:.3em;align-items:center}
$ .au-pc .stk i{font-style:normal;font-size:.7em;font-weight:900;background:#3ddc84;color:#06240f;border-radius:.5em;padding:.1em .45em}
$ .au-pc .stk i.cl{background:none;font-size:1em;padding:0}
$ .au-pc .vts{position:absolute;right:.4em;bottom:.3em;display:flex;gap:.15em;flex-wrap:wrap;justify-content:flex-end;max-width:70%}
$ .au-pc .vts s,$ .sk s{display:inline-block;width:.85em;height:.85em;border-radius:50%;border:.1em solid #000;text-decoration:none}
$ .au-pc .vts em{font-style:normal;font-weight:900;color:#ffe066}
$ .au-pc .cf{display:none;position:absolute;right:.4em;top:50%;transform:translateY(-50%);gap:.3em}
$ .au-pc.sel.can .cf{display:flex}
$ .au-pc .cf button{width:2em;height:2em;border-radius:.5em;border:0;font-weight:900;font-size:1em;color:#fff}
$ .au-pc .cf .y{background:#25b560}
$ .au-pc .cf .n{background:#d63a2a}
$ .au-mch{display:flex;flex-direction:column;min-height:0;background:rgba(255,255,255,.05);border-radius:.8em;padding:.5em;gap:.5em}
$ .au-mlog{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:.3em;font-size:.95em}
$ .au-mlog .cm{padding:.25em .5em;border-radius:.5em;background:rgba(255,255,255,.07);word-break:break-word;line-height:1.3}
$ .au-mlog .cm.dead{background:rgba(120,140,200,.15);font-style:italic}
$ .au-mfm{display:flex;gap:.4em}
$ .au-mfm input{flex:1;min-width:0;padding:.55em .7em;border-radius:.6em;border:.12em solid #3a4780;background:#0b1024;color:#fff;font:inherit;font-size:1em}
$ .au-mfm button{padding:.5em 1em;border-radius:.6em;border:0;background:#3a4fb8;color:#fff;font-weight:800;font-size:1em}
$ .au-mft{display:flex;align-items:center;gap:1em;min-height:2.6em}
$ .au-mft .au-bt{width:auto;min-height:2.4em;padding:.3em 1.2em;font-size:1em}
$ .au-mstat{opacity:.85;font-size:.95em}
$ .sk{display:inline-flex;gap:.15em;vertical-align:middle}
$ .au-msplash{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(3,4,12,.86)}
$ .au-msplash.on{display:flex}
$ .au-msplash .sp{display:flex;flex-direction:column;align-items:center;gap:.5em;animation:aupop .5s cubic-bezier(.2,1.6,.4,1)}
$ .au-msplash b{font-size:2.8em;font-weight:900;color:#ffe066;text-align:center;text-shadow:0 .08em 0 #7a5a00,0 .3em .5em #000}
$ .au-msplash .body b{color:#ff4b3a;text-shadow:0 .08em 0 #7a120a,0 .3em .5em #000}
$ .au-msplash svg{width:5em;height:auto}
$ .au-msplash span{font-size:1.3em;font-weight:800}

$ .au-over{position:absolute;inset:0;z-index:25;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8em;padding:1em;background:radial-gradient(ellipse at center,rgba(15,25,70,.8),rgba(2,3,10,.96));animation:auin .6s}
$ .au-over.lose{background:radial-gradient(ellipse at center,rgba(90,10,10,.8),rgba(8,2,2,.96))}
$ .au-over .ot{font-size:4.4em;font-weight:900;letter-spacing:.08em;color:#7cc4ff;text-shadow:0 .08em 0 #174f9a,0 .3em .6em #000;animation:aupop .8s cubic-bezier(.2,1.6,.4,1)}
$ .au-over.lose .ot{color:#ff4b3a;text-shadow:0 .08em 0 #7a120a,0 .3em .6em #000}
$ .au-over .os{font-size:1.3em;opacity:.9}
$ .au-orl{display:grid;grid-template-columns:repeat(auto-fit,minmax(11em,1fr));gap:.4em;width:min(52em,96%);max-height:46%;overflow:auto}
$ .au-orl .r{display:flex;align-items:center;gap:.5em;padding:.3em .6em;border-radius:.7em;background:rgba(255,255,255,.07)}
$ .au-orl .r svg{width:1.9em;height:auto}
$ .au-orl .r b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
$ .au-orl .r em{font-style:normal;font-size:.8em;opacity:.8}
$ .au-orl .r.imp{background:rgba(255,75,58,.22)}
$ .au-orl .r.imp em{color:#ff8a7c;opacity:1;font-weight:800}
$ .au-orl .r.dead b{text-decoration:line-through;opacity:.6}
$ .au-ob{display:flex;gap:.7em;flex-wrap:wrap;justify-content:center;width:min(40em,96%)}
$ .au-ob .au-bt{width:auto;flex:1;min-width:9em}
$ .au-ob .wl{opacity:.75;align-self:center}

$ .au-tlw{position:absolute;left:1.1em;top:1.1em;width:min(22em,44%);display:flex;flex-direction:column;gap:.4em;pointer-events:none}
$ .au-bar{position:relative;height:1.9em;border-radius:.6em;background:rgba(5,8,22,.78);border:.14em solid rgba(255,255,255,.5);overflow:hidden}
$ .au-barf{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(#5dffa0,#1fa75c);transition:width .5s}
$ .au-bar span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.72em;font-weight:900;letter-spacing:.05em;text-shadow:0 .1em .2em #000}
$ .au-bar.hid{opacity:.5}
$ .au-tl{background:rgba(5,8,22,.72);border-radius:.7em;padding:.5em .7em;font-size:.88em;line-height:1.5;border-left:.25em solid #ffd84a}
$ .au-tl h4{margin:0 0 .25em;font-size:1em;color:#ffd84a}
$ .au-tl div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
$ .au-tl div.p{color:#ffe066}
$ .au-tl div.d{color:#5dffa0;text-decoration:line-through;opacity:.8}
$ .au-tl em{font-style:normal;opacity:.7;font-size:.9em}
$ .au-tlw.shut .au-tl{display:none}
$ .au-tlt{pointer-events:auto;align-self:flex-start;background:rgba(5,8,22,.72);border:.12em solid rgba(255,255,255,.35);color:#fff;border-radius:.6em;padding:.2em .8em;font-size:.82em;font-weight:700}
$ .au-topr{position:absolute;right:1.1em;top:1.1em;display:flex;gap:.6em}
$ .au-b{position:relative;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1em;width:5.6em;height:5.6em;border-radius:1.2em;border:.16em solid rgba(255,255,255,.5);background:rgba(10,14,34,.78);color:#fff;padding:.2em;font-size:1em;touch-action:none;transition:opacity .15s,filter .15s,transform .08s;backdrop-filter:blur(2px)}
$ .au-b svg{width:3em;height:3em;display:block}
$ .au-b span{font-size:.62em;font-weight:900;letter-spacing:.06em}
$ .au-b span:empty,$ .au-b i:empty{display:none}
$ .au-b i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:2.2em;text-shadow:0 .05em .2em #000}
$ .au-b:active{transform:scale(.94)}
$ .au-bmap,$ .au-bmenu{width:3.4em;height:3.4em;border-radius:.9em}
$ .au-bmap svg,$ .au-bmenu svg{width:2em;height:2em}
$ .au-b.off{opacity:.38;filter:grayscale(.7)}
$ .au-b.cd svg,$ .au-b.cd span{opacity:.3}
$ .au-bkill{border-color:#ff5a4a;background:rgba(80,10,10,.8)}
$ .au-bsab{border-color:#ffb02e}
$ .au-bvent{border-color:#a0a8c0}
$ .au-brep{border-color:#ffe066}
$ .au-buse{border-color:#7cc4ff;width:6.4em;height:6.4em}
$ .au-btns{position:absolute;right:1.1em;bottom:1.1em;display:flex;flex-direction:column;align-items:flex-end;gap:.6em;transition:opacity .2s}
$ .au-btns .au-r{display:flex;gap:.6em;align-items:flex-end}
$ .au-btns.hidden{opacity:0;pointer-events:none}
$ .au-btns.dead .au-bkill,$ .au-btns.dead .au-bvent,$ .au-btns.dead .au-bsab,$ .au-btns.dead .au-brep{display:none}
$ .au-alert{position:absolute;left:50%;top:1em;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;padding:.5em 1.6em;border-radius:.9em;background:rgba(40,30,0,.85);border:.15em solid #ffb02e;font-size:1.05em;text-align:center;pointer-events:none}
$ .au-alert.on{display:flex}
$ .au-alert.red{background:rgba(110,10,10,.9);border-color:#ff4b3a;animation:aupulse .7s infinite alternate}
$ .au-alert span{font-size:1.8em;font-weight:900;color:#ffe066}
@keyframes aupulse{to{background:rgba(180,20,20,.9)}}
$ .au-toast{position:absolute;left:50%;bottom:1.4em;transform:translateX(-50%);max-width:80%;padding:.5em 1.2em;border-radius:2em;background:rgba(10,14,34,.88);border:.12em solid rgba(255,255,255,.4);font-weight:800;opacity:0;transition:opacity .25s;pointer-events:none;text-align:center}
$ .au-toast.on{opacity:1}
$ .au-joy{position:absolute;width:7.5em;height:7.5em;margin:-3.75em 0 0 -3.75em;border-radius:50%;border:.2em solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);display:none;pointer-events:none}
$ .au-joy.on{display:block}
$ .au-joy i{position:absolute;left:50%;top:50%;width:3.2em;height:3.2em;margin:-1.6em 0 0 -1.6em;border-radius:50%;background:rgba(255,255,255,.55)}

$ .au-mgo,$ .au-mapo{position:absolute;inset:0;z-index:12;display:flex;align-items:center;justify-content:center;background:rgba(2,4,14,.62);padding:.6em}
$ .au-mg,$ .au-map{display:flex;flex-direction:column;width:min(46em,100%);max-height:100%;background:#1a2040;border:.16em solid #46549c;border-radius:1em;overflow:hidden;box-shadow:0 1em 3em rgba(0,0,0,.6)}
$ .au-mgo.wide .au-mg{width:min(62em,100%)}
$ .au-map{width:min(54em,100%)}
$ .au-mgh{display:flex;align-items:center;justify-content:space-between;padding:.5em .8em;background:#252d5c;font-size:1.1em}
$ .au-mgx{width:1.8em;height:1.8em;border-radius:.5em;border:0;background:#d63a2a;color:#fff;font-size:1.1em;font-weight:900;line-height:1}
$ .au-mgb{position:relative;aspect-ratio:3/2;min-height:0}
$ .au-svg{display:block;width:100%;height:100%;touch-action:none;user-select:none}
$ .au-mapb{position:relative;aspect-ratio:720/435}
$ .au-mapb canvas{display:block;width:100%;height:100%}
$ .au-sb{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:.3em;padding:.25em .7em .25em .4em;border-radius:2em;border:.12em solid #fff;background:#d63a2a;color:#fff;font-weight:900;font-size:.82em;white-space:nowrap}
$ .au-sb svg{width:1.4em;height:1.4em}
$ .au-sb.dr{background:#c98a10}
$ .au-sb.off{opacity:.4;filter:grayscale(.6)}
$ .au-cams{display:grid;grid-template-columns:1fr 1fr;gap:.4em}
$ .au-cam{position:relative;border-radius:.5em;overflow:hidden;background:#000}
$ .au-cam canvas{display:block;width:100%;height:auto}
$ .au-cam span{position:absolute;left:.4em;bottom:.3em;font-size:.8em;font-weight:800;text-shadow:0 .1em .2em #000;display:flex;align-items:center;gap:.35em}
$ .au-cam i{display:inline-block;width:.6em;height:.6em;border-radius:50%;background:#ff3b30;animation:aupulse2 1s infinite alternate}
@keyframes aupulse2{to{opacity:.2}}
`;

const ICON_SVG = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 26c0-9 6-15 14-15s14 6 14 15v22c0 2-1 4-4 4h-5l-1-8h-8l-1 8h-5c-3 0-4-2-4-4z"/><path d="M26 22h14c3 0 5 2 5 5s-2 5-5 5H26c-3 0-5-2-5-5s2-5 5-5z"/><path d="M18 30h-5c-2 0-3 1-3 3v13c0 2 1 3 3 3h5"/></svg>';

const COVER_SVG = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="auc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060919"/><stop offset="1" stop-color="#1b2352"/></linearGradient>
<linearGradient id="auc-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58627e"/><stop offset="1" stop-color="#3a4259"/></linearGradient>
<linearGradient id="auc-fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d98b2"/><stop offset="1" stop-color="#596480"/></linearGradient>
<radialGradient id="auc-gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff4b3a" stop-opacity=".75"/><stop offset="1" stop-color="#ff4b3a" stop-opacity="0"/></radialGradient>
<radialGradient id="auc-vis" cx=".5" cy=".5" r=".5"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#02030a" stop-opacity=".92"/></radialGradient>
<symbol id="auc-c" viewBox="0 0 100 120"><g stroke="#0f1220" stroke-width="5" stroke-linejoin="round">
<rect x="6" y="40" width="22" height="46" rx="9" fill="currentColor"/><rect x="6" y="40" width="22" height="46" rx="9" fill="#000" fill-opacity=".22"/>
<path d="M22 44C22 20 34 8 52 8s30 12 30 36v44c0 6-4 10-10 10H62c-4 0-6-3-6-7v-3H44v3c0 4-2 7-6 7H32c-6 0-10-4-10-10z" fill="currentColor"/></g>
<path d="M62 14c10 6 16 18 16 34v38c0 4-2 8-6 8h-8c-3 0-4-2-4-5V14z" fill="#000" fill-opacity=".2"/>
<path d="M44 30h30c5 0 9 4 9 9v4c0 5-4 9-9 9H44c-5 0-9-4-9-9v-4c0-5 4-9 9-9z" fill="#9fe6f2" stroke="#0f1220" stroke-width="5"/>
<path d="M48 34h14c2 0 3 1 3 3s-1 3-3 3H48c-2 0-3-1-3-3s1-3 3-3z" fill="#fff" fill-opacity=".75"/></symbol></defs>
<rect width="400" height="300" fill="url(#auc-bg)"/>
<g fill="#fff"><circle cx="30" cy="30" r="1.4"/><circle cx="90" cy="18" r="1"/><circle cx="170" cy="40" r="1.6"/><circle cx="260" cy="22" r="1.1"/><circle cx="340" cy="46" r="1.5"/><circle cx="380" cy="16" r="1"/><circle cx="210" cy="12" r="1"/></g>
<rect x="0" y="62" width="400" height="136" fill="url(#auc-wall)"/>
<g fill="#2b3248"><rect x="14" y="76" width="82" height="100" rx="6"/><rect x="112" y="76" width="82" height="100" rx="6"/><rect x="206" y="76" width="82" height="100" rx="6"/><rect x="304" y="76" width="82" height="100" rx="6"/></g>
<g fill="#4a5470"><rect x="20" y="82" width="70" height="88" rx="4"/><rect x="118" y="82" width="70" height="88" rx="4"/><rect x="212" y="82" width="70" height="88" rx="4"/><rect x="310" y="82" width="70" height="88" rx="4"/></g>
<rect x="124" y="108" width="58" height="34" rx="3" fill="#1a1f2e"/><g stroke="#6b778a" stroke-width="3"><path d="M128 116h50M128 125h50M128 134h50"/></g>
<ellipse cx="153" cy="125" rx="46" ry="40" fill="url(#auc-gl)"/>
<rect x="0" y="198" width="400" height="102" fill="url(#auc-fl)"/>
<path d="M0 198h400" stroke="#2b3248" stroke-width="6"/>
<g stroke="#fff" stroke-opacity=".08" stroke-width="2"><path d="M0 232h400M0 268h400M70 198l-40 102M170 198l-20 102M270 198l20 102M370 198l40 102"/></g>
<ellipse cx="200" cy="284" rx="70" ry="9" fill="#000" fill-opacity=".3"/><ellipse cx="86" cy="264" rx="40" ry="6" fill="#000" fill-opacity=".28"/><ellipse cx="318" cy="268" rx="40" ry="6" fill="#000" fill-opacity=".28"/>
<use href="#auc-c" x="46" y="176" width="82" height="98" style="color:#132ed1"/>
<use href="#auc-c" x="276" y="180" width="82" height="98" style="color:#50ef39;transform-box:fill-box"/>
<use href="#auc-c" x="136" y="146" width="128" height="154" style="color:#c51111"/>
<rect width="400" height="300" fill="url(#auc-vis)"/>
</svg>`;

Ameplay.covers[ID] = COVER_SVG;

Ameplay.register({
  id: ID,
  title: 'Among Us',
  category: 'Action',
  tint: '#c51111',
  blurb: 'Find the impostor on a spaceship you can barely see. Do tasks, vent, sabotage, call meetings and vote. Solo with bots or online with up to 15 players.',
  help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows move · <kbd>E</kbd> / <kbd>Space</kbd> use · <kbd>Q</kbd> kill · <kbd>R</kbd> report · <kbd>V</kbd> vent · <kbd>X</kbd> sabotage · <kbd>M</kbd> map · hold the mouse or drag a finger to walk',
  better: 'high',
  width: 1100,
  format: v => v + ' wins',
  icon: ICON_SVG,
  css: CSS.replace(/\$/g, '.gm-among-us'),
  mount(root, api) { return mountGame(root, api); }
});

})();
