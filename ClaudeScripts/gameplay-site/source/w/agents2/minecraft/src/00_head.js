(() => {
  'use strict';
  const CFG = {
    TPS: 20, H: 320, NSEC: 20, SEA: 126, YOFF: 64,
    WALK: 0.1, SPRINT: 0.13, AIR_ACC: 0.02, AIR_ACC_SPRINT: 0.026, SNEAK_MUL: 0.3, INPUT_MUL: 0.98,
    GROUND_DRAG: 0.546, AIR_DRAG: 0.91, GRAVITY: 0.08, VDRAG: 0.98, JUMP: 0.42, SPRINT_JUMP: 0.2, JUMP_TICKS: 10,
    FLY_ACC: 0.05, FLY_V: 0.15, FLY_VDRAG: 0.6, STEP: 0.6,
    SWIM_ACC: 0.02, WATER_DRAG: 0.8, WATER_GRAV: 0.02, WATER_UP: 0.04, LAVA_DRAG: 0.5,
    PW: 0.6, PH: 1.8, EYE: 1.62, EYE_SNEAK: 1.27, PH_SNEAK: 1.5,
    REACH: 4.5, REACH_CREATIVE: 5, MOB_REACH: 3,
    FALL_SAFE: 3, DOUBLE_TAP: 7, INVULN: 10,
    DAY: 24000,
    BREAK_DELAY: 5, USE_DELAY: 4, EAT_TICKS: 32, SMELT_TICKS: 200, SWING_TICKS: 6,
    EXH_SPRINT: 0.1, EXH_JUMP: 0.05, EXH_SPRINT_JUMP: 0.2, EXH_SWIM: 0.01, EXH_MINE: 0.005, EXH_ATTACK: 0.1, EXH_REGEN: 6, EXH_HURT: 0.1, REGEN_TICKS: 80, AIR_MAX: 300,
    HOSTILE_CAP: 14, PASSIVE_CAP: 10, DESPAWN: 128,
    RD: 6, RD_TOUCH: 4, SENS: 0.15 * Math.PI / 180, FOV: 70, CLOUD_Y: 256
  };
  const H = CFG.H, NSEC = CFG.NSEC, SEA = CFG.SEA;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const rng = a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hash3 = (x, y, z) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1442695041) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
  const lerp = (a, b, t) => a + t * (b - a);
  const title = s => s.split('_').map(w => w === 'of' || w === 'the' || w === 'on' || w === 'a' || w === 'with' || w === 'and' || w === 'o' ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/^./, c => c.toUpperCase());
  const RNG = Math.random;
  const ri = n => RNG() * n | 0;
  const rr = (a, b) => a + (RNG() * (b - a + 1) | 0);
  const FACE4 = ['north', 'east', 'south', 'west'];
  const DIR6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const F4D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const F4FACE = [5, 0, 4, 1];
  const OPP6 = [1, 0, 3, 2, 5, 4];
  const COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
  const DYE = { white: [249, 255, 254], orange: [249, 128, 29], magenta: [199, 78, 189], light_blue: [58, 179, 218], yellow: [254, 216, 61], lime: [128, 199, 31], pink: [243, 139, 170], gray: [71, 79, 82], light_gray: [157, 157, 151], cyan: [22, 156, 156], purple: [137, 50, 184], blue: [60, 68, 170], brown: [131, 84, 50], green: [94, 124, 22], red: [176, 46, 38], black: [29, 29, 33] };
