
(() => {
  'use strict';

  function rushSim() {
    const CFG = {
      U: 30, TPS: 240, F: 0.25,
      SPEED: [251.16, 311.58, 387.42, 468, 576],
      JUMP: [10.620032, 11.1800318, 11.420032, 11.230032, 11.230032],
      GRAV: [0.940199, 0.958199024, 0.957199, 0.961199, 0.961199],
      FLYG: 0.9582, MINIJ: 0.8, FALL: 15,
      SHIPUP: 8, SHIPDN: 6.4, MINIFLY: 0.85,
      UFOJ: 7, UFOJMINI: 6.8,
      BALLG: 0.6, BALLJ: 0.3,
      PAD: { y: [16, 16, 9.6, 16], p: [10.4, 5.6, 6.72, 6.4], b: [6.4, 6.4, 3.84, 6.4] },
      HIT: 30, HITMINI: 18, INNER: 9, INNERMINI: 10, WAVE: 10, WAVEMINI: 6, WAVEINNER: 3,
      SNAP: 10, SNAPFLY: 6,
      SPIKE: { '^': [8, 20], v: [10, 22], '.': [3, 9], "'": [21, 27] }, SPIKEW: 6,
      SAWHIT: 0.8, ORBBOX: 36,
      CORR: [0, 10, 8, 10, 10, 0, 9],
      ROBOT: { J: 8, T: 10.6, A: 0.86 }
    };
    const U = CFG.U, F = CFG.F, HALFPI = Math.PI / 2;
    const K_SOLID = 1, K_SPIKE = 2, K_SAW = 3, K_PAD = 4, K_ORB = 5, K_PORTAL = 6, K_COIN = 7;

    function buildLevel(def) {
      const spb = 60 / def.bpm, sp = def.speeds;
      const X = b => {
        let x = 0, t0 = 0, v = CFG.SPEED[sp[0][1]];
        for (let i = 1; i < sp.length && sp[i][0] < b; i++) { x += (sp[i][0] - t0) * spb * v; t0 = sp[i][0]; v = CFG.SPEED[sp[i][1]]; }
        return x + (b - t0) * spb * v;
      };
      const B = x => {
        let t0 = 0, xs = 0, v = CFG.SPEED[sp[0][1]];
        for (let i = 1; i <= sp.length; i++) {
          const nb = i < sp.length ? sp[i][0] : 1e9, sx = xs + (nb - t0) * spb * v;
          if (x <= sx || i === sp.length) return t0 + (x - xs) / (spb * v);
          xs = sx; t0 = nb; v = CFG.SPEED[sp[i][1]];
        }
      };
      const L = { def, X, B, len: X(def.end), objs: [], speeds: [], coins: [], trig: [], cols: [], nid: 0, maxW: 0 };
      const add = (o, k) => { o.id = L.nid++; o.k = k; L.objs.push(o); return o; };
      const item = (p, c) => {
        let m = /^%([SCAUWHDFNMR])(-?\d+(?:\.\d+)?)?(?:,(\d+(?:\.\d+)?))?(?:,(\d+))?$/.exec(p);
        if (m) {
          const row = m[2] ? +m[2] : 1.5, h = (m[3] ? +m[3] : 1.5) * U, x = (c + 0.5) * U, y = row * U;
          add({ t: 'portal', p: m[1], x, y, h, fl: m[4] != null ? +m[4] : null, x0: x - 15, x1: x + 15, y0: y - h, y1: y + h }, K_PORTAL);
          return 1;
        }
        m = /^([#_^v.'*YPBGypb$i~])(-?\d+(?:\.\d+)?)?(?:,(\d+(?:\.\d+)?))?(?:x(\d+))?$/.exec(p);
        if (!m) throw new Error('rush: bad token ' + p);
        const t = m[1], row = m[2] ? +m[2] : 0, a = m[3] != null ? +m[3] : 0, n = m[4] ? +m[4] : 1, x0 = c * U, y0 = row * U;
        if (t === '#') { add({ t: 'block', x0, y0, x1: x0 + n * U, y1: y0 + (a || 1) * U }, K_SOLID); return n; }
        if (t === '_') { add({ t: 'slab', x0, y0, x1: x0 + n * U, y1: y0 + U / 2 }, K_SOLID); return n; }
        if (t === 'i') { add({ t: 'deco', x0, y0, x1: x0 + n * U, y1: y0 + (a || 1) * U }, 0); return n; }
        if (t === '~') { L.trig.push({ x: x0, c: row | 0 }); return 0; }
        if ('^v.\''.includes(t)) {
          const h = CFG.SPIKE[t], w = CFG.SPIKEW / 2;
          for (let i = 0; i < n; i++) {
            const xx = x0 + i * U;
            add({ t: 'spike', s: t, x0: xx, y0, x1: xx + U, y1: y0 + U, hx0: xx + 15 - w, hx1: xx + 15 + w, hy0: y0 + h[0], hy1: y0 + h[1] }, K_SPIKE);
          }
          return n;
        }
        if (t === '*') {
          const r = (a || 10) / 10 * U, x = x0 + U / 2, y = y0 + U / 2;
          add({ t: 'saw', x, y, r, hr: r * CFG.SAWHIT, x0: x - r, x1: x + r, y0: y - r, y1: y + r }, K_SAW);
          return 1;
        }
        if ('YPBG'.includes(t)) {
          const x = x0 + U / 2, y = y0 + U / 2, h = CFG.ORBBOX / 2;
          add({ t: 'orb', c: t, x, y, x0: x - h, x1: x + h, y0: y - h, y1: y + h }, K_ORB);
          return 1;
        }
        if ('ypb'.includes(t)) {
          const up = a === 1;
          add({ t: 'pad', c: t, up, x: x0 + U / 2, y: up ? y0 + U : y0, x0: x0 + 3, x1: x0 + U - 3, y0: up ? y0 + U - 6 : y0, y1: up ? y0 + U : y0 + 6 }, K_PAD);
          return 1;
        }
        if (t === '$') {
          const o = add({ t: 'coin', i: L.coins.length, x: x0 + U / 2, y: y0 + U / 2, x0: x0 + 2, x1: x0 + U - 2, y0: y0 + 2, y1: y0 + U - 2 }, K_COIN);
          L.coins.push(o);
          return 1;
        }
        return 1;
      };
      let cx = 0;
      for (const tok of def.map.trim().split(/\s+/)) {
        if (!tok) continue;
        if (tok[0] === '@') { const nc = X(+tok.slice(1)) / U + 1.5; if (nc < cx - 0.01) (L.warn || (L.warn = [])).push(tok + ' overlaps by ' + (cx - nc).toFixed(1)); cx = nc; continue; }
        if (/^-?\d/.test(tok)) { cx += +tok; continue; }
        let adv = 0;
        for (const part of tok.split('|')) adv = Math.max(adv, item(part, cx));
        cx += adv;
      }
      for (let i = 1; i < sp.length; i++) {
        const x = X(sp[i][0]), y = (sp[i][2] != null ? sp[i][2] : 1.5) * U;
        const o = add({ t: 'speed', s: sp[i][1], x, y, x0: x - 15, x1: x + 15, y0: y - 45, y1: y + 45 }, 0);
        L.speeds.push(o);
      }
      L.objs.sort((a, b) => a.x0 - b.x0);
      for (const o of L.objs) {
        L.maxW = Math.max(L.maxW, o.x1 - o.x0);
        if (!o.k) continue;
        const a = o.k === K_SPIKE ? o.hx0 : o.x0, b = o.k === K_SPIKE ? o.hx1 : o.x1;
        for (let c = Math.floor(a / U); c <= Math.floor((b - 0.001) / U); c++) (L.cols[c] || (L.cols[c] = [])).push(o);
      }
      return L;
    }

    function newState(L) {
      return {
        x: 0, y: 15, vy: 0, g: 1, mode: 0, mini: 0, spd: L.def.speeds[0][1], ground: 1, held: 0, buf: 0, ring: 0,
        fl: 0, ce: 1e9, u1: -1, u2: -1, p1: -1, p2: -1, coins: 0, dead: 0, win: 0, rot: 0, t: 0, jumps: 0, ev: 0, eo: -1
      };
    }
    const press = s => { s.held = 1; s.buf = 1; s.ring = 1; };
    const release = s => { s.held = 0; s.buf = 0; s.ring = 0; s.rt = 0; };
    const half = s => s.mode === 4 ? (s.mini ? CFG.WAVEMINI : CFG.WAVE) / 2 : (s.mini ? CFG.HITMINI : CFG.HIT) / 2;
    const inner = s => s.mode === 4 ? CFG.WAVEINNER / 2 : (s.mini ? CFG.INNERMINI : CFG.INNER) / 2;
    const jumpV = s => CFG.JUMP[s.spd] * (s.mini ? CFG.MINIJ : 1);

    function setMode(s, m, o) {
      const h0 = half(s);
      s.mode = m;
      if (m === 0 || m === 5) { s.fl = 0; s.ce = 1e9; }
      else {
        const H = CFG.CORR[m], f = o.fl != null ? o.fl : Math.max(0, Math.round(o.y / U - H / 2));
        s.fl = f * U; s.ce = (f + H) * U;
      }
      s.y += (half(s) - h0) * s.g;
      if (m === 5 || m === 6) s.rot = 0;
      if (m === 1 || m === 3 || m === 4) {
        s.rot = Math.atan2(Math.sin(s.rot), Math.cos(s.rot));
        if (Math.abs(s.rot) > HALFPI) s.rot = 0;
      }
    }

    function usePortal(s, o) {
      s.p2 = s.p1; s.p1 = o.id; s.ev |= 8; s.eo = o.id;
      const p = o.p;
      if (p === 'F') { if (s.g > 0) { s.g = -1; s.vy *= 0.5; } }
      else if (p === 'N') { if (s.g < 0) { s.g = 1; s.vy *= 0.5; } }
      else if (p === 'M' || p === 'R') {
        const h0 = half(s);
        s.mini = p === 'M' ? 1 : 0;
        s.y += (half(s) - h0) * s.g;
      } else {
        const m = 'CSAUWHD'.indexOf(p);
        if (m !== s.mode) s.vy *= 0.5;
        setMode(s, m, o);
      }
    }

    function useOrb(s, o) {
      s.u2 = s.u1; s.u1 = o.id; s.ring = 0; s.rt = 0; s.jumps++; s.ev |= 2; s.eo = o.id; s.ground = 0;
      const J = CFG.JUMP[s.spd], G = s.g, m = s.mode === 5 ? 0 : s.mode === 6 ? 2 : s.mode, c = o.c, flip = c === 'B' || c === 'G';
      if (m === 4) { if (flip) s.g = -G; return; }
      const y = m === 0 ? J : m === 2 ? 0.7 * J : 8;
      let v;
      if (c === 'Y') v = y;
      else if (c === 'P') v = m === 0 ? 0.72 * J : m === 1 ? 0.37 * 8 : m === 2 ? 0.77 * y : 0.42 * J;
      else if (c === 'B') v = m === 3 ? 0.4 * J : 0.4 * y;
      else v = m === 3 ? -8 : m === 1 ? -5.6 : -y;
      if (s.mini && (m === 0 || m === 2)) v *= CFG.MINIJ;
      s.vy = G * v;
      if (flip) s.g = -G;
    }

    function usePad(s, o) {
      s.u2 = s.u1; s.u1 = o.id; s.ev |= 4; s.eo = o.id; s.ground = 0; s.rt = 0;
      const m = s.mode === 5 ? 0 : s.mode === 6 ? 2 : s.mode;
      if (m === 4) { if (o.c === 'b') s.g = -s.g; return; }
      let v = CFG.PAD[o.c][m];
      if (s.mini && (m === 0 || m === 2)) v *= CFG.MINIJ;
      s.vy = s.g * v;
      if (o.c === 'b') s.g = -s.g;
    }

    function spiderJump(s, L) {
      const hs = half(s), G = s.g, c0 = Math.floor((s.x - hs) / U), c1 = Math.floor((s.x + hs) / U);
      let t = G > 0 ? s.ce : s.fl;
      for (let c = c0; c <= c1; c++) {
        const col = L.cols[c];
        if (!col) continue;
        for (let i = 0; i < col.length; i++) {
          const o = col[i];
          if (o.k !== K_SOLID) continue;
          if (G > 0) { if (o.y0 >= s.y + hs - CFG.SNAP && o.y0 < t) t = o.y0; }
          else if (o.y1 <= s.y - hs + CFG.SNAP && o.y1 > t) t = o.y1;
        }
      }
      s.py = s.y; s.y = G > 0 ? t - hs : t + hs; s.g = -G; s.vy = 0;
    }

    function overlaps(s, hs, o) { return s.x + hs > o.x0 && s.x - hs < o.x1 && s.y + hs > o.y0 && s.y - hs < o.y1; }

    function step(s, L) {
      s.ev = 0; s.t++;
      const xs = CFG.SPEED[s.spd] / 60;
      let hs = half(s);
      if (s.ring) {
        const c0 = Math.floor((s.x - hs - 3) / U), c1 = Math.floor((s.x + hs + 3) / U);
        outer: for (let c = c0; c <= c1; c++) {
          const col = L.cols[c];
          if (col) for (let i = 0; i < col.length; i++) {
            const o = col[i];
            if (o.k === K_ORB && o.id !== s.u1 && o.id !== s.u2 && overlaps(s, hs, o)) { useOrb(s, o); break outer; }
          }
        }
      }
      const G = s.g, m = s.mode;
      if (m === 0 || m === 2 || m === 5 || m === 6) {
        if (s.ground && s.buf) {
          s.ground = 0; s.ring = 0; s.jumps++; s.ev |= 1;
          if (m === 0) s.vy = G * jumpV(s);
          else if (m === 5) { s.vy = G * CFG.ROBOT.J * (s.mini ? CFG.MINIJ : 1); s.rt = CFG.ROBOT.T; }
          else if (m === 6) { spiderJump(s, L); s.buf = 0; s.ev |= 64; }
          else { s.vy = G * jumpV(s) * CFG.BALLJ; s.g = -G; s.buf = 0; }
        } else {
          let gr = m === 2 ? CFG.FLYG * CFG.BALLG : CFG.GRAV[s.spd];
          if (m === 5 && s.held && s.rt > 0 && G * s.vy > 0) { gr -= CFG.ROBOT.A; s.rt -= F; } else s.rt = 0;
          s.vy -= G * gr * F;
          if (G * s.vy < -CFG.FALL) s.vy = -CFG.FALL * G;
        }
      } else if (m === 4) {
        s.vy = G * xs * (s.held ? 1 : -1) * (s.mini ? 2 : 1);
      } else {
        const k = s.mini ? CFG.MINIFLY : 1, falling = G * s.vy < 0;
        if (m === 1) {
          if (s.held) s.vy += G * CFG.FLYG * (falling ? 0.5 : 0.4) / k * F;
          else s.vy -= G * CFG.FLYG * 0.4 * (falling ? 0.8 : 1.2) / k * F;
        } else {
          if (s.ring) {
            s.ring = 0; s.jumps++; s.ev |= 1;
            const v = s.mini ? CFG.UFOJMINI : CFG.UFOJ;
            if (G * s.vy < v) s.vy = G * v;
          } else s.vy -= G * CFG.FLYG * 0.5 * (falling ? 0.8 : 1.2) / k * F;
        }
        const up = CFG.SHIPUP / k, dn = CFG.SHIPDN / k;
        if (G * s.vy > up) s.vy = G * up;
        if (G * s.vy < -dn) s.vy = -G * dn;
      }
      const px = s.x, wasG = s.ground;
      s.x += xs * F;
      s.y += s.vy * F;
      s.ground = 0;
      const g2 = s.g, ib = inner(s), fly = m === 1 || m === 3 || m === 4, snap = fly ? CFG.SNAPFLY : CFG.SNAP;
      if (s.y - hs <= s.fl) { s.y = s.fl + hs; if (s.vy < 0) s.vy = 0; if (g2 > 0) s.ground = 1; }
      if (s.y + hs >= s.ce) { s.y = s.ce - hs; if (s.vy > 0) s.vy = 0; if (g2 < 0) s.ground = 1; }
      const c0 = Math.floor((s.x - hs) / U), c1 = Math.floor((s.x + hs) / U);
      for (let c = c0; c <= c1; c++) {
        const col = L.cols[c];
        if (!col) continue;
        for (let i = 0; i < col.length; i++) {
          const o = col[i];
          if (o.k !== K_SOLID || !overlaps(s, hs, o)) continue;
          if (s.x + ib > o.x0 && s.x - ib < o.x1 && s.y + ib > o.y0 && s.y - ib < o.y1) { s.dead = 1; return; }
          if (g2 > 0) {
            if (s.vy <= 0 && s.y - hs >= o.y1 - snap) { s.y = o.y1 + hs; s.vy = 0; s.ground = 1; }
            else if (m !== 0 && m !== 5 && m !== 6 && s.vy >= 0 && s.y + hs <= o.y0 + snap) { s.y = o.y0 - hs; s.vy = 0; }
          } else {
            if (s.vy >= 0 && s.y + hs <= o.y0 + snap) { s.y = o.y0 - hs; s.vy = 0; s.ground = 1; }
            else if (m !== 0 && m !== 5 && m !== 6 && s.vy <= 0 && s.y - hs >= o.y1 - snap) { s.y = o.y1 + hs; s.vy = 0; }
          }
        }
      }
      hs = half(s);
      for (let c = c0; c <= c1; c++) {
        const col = L.cols[c];
        if (!col) continue;
        for (let i = 0; i < col.length; i++) {
          const o = col[i], k = o.k;
          if (k === K_SPIKE) {
            if (s.x + hs > o.hx0 && s.x - hs < o.hx1 && s.y + hs > o.hy0 && s.y - hs < o.hy1) { s.dead = 1; return; }
          } else if (k === K_SAW) {
            const dx = Math.max(s.x - hs, Math.min(o.x, s.x + hs)) - o.x, dy = Math.max(s.y - hs, Math.min(o.y, s.y + hs)) - o.y;
            if (dx * dx + dy * dy < o.hr * o.hr) { s.dead = 1; return; }
          } else if (k === K_PAD) {
            if (o.id !== s.u1 && o.id !== s.u2 && overlaps(s, hs, o)) usePad(s, o);
          } else if (k === K_PORTAL) {
            if (o.id !== s.p1 && o.id !== s.p2 && overlaps(s, hs, o)) { usePortal(s, o); hs = half(s); }
          } else if (k === K_COIN) {
            if (!(s.coins & (1 << o.i)) && overlaps(s, hs, o)) { s.coins |= 1 << o.i; s.ev |= 16; }
          }
        }
      }
      for (let i = 0; i < L.speeds.length; i++) {
        const o = L.speeds[i];
        if (px < o.x && s.x >= o.x) { s.spd = o.s; s.ev |= 8; s.eo = o.id; }
      }
      if (!wasG && s.ground) s.ev |= 32;
      if (s.y > 2400) { s.dead = 1; return; }
      const mm = s.mode;
      if (mm === 0) {
        if (s.ground) {
          const tr = Math.round(s.rot / HALFPI) * HALFPI;
          s.rot += (tr - s.rot) * 0.3;
        } else {
          const J = jumpV(s), gv = CFG.GRAV[s.spd];
          s.rot += s.g * Math.PI / (2 * J / gv) * F;
        }
      } else if (mm === 2) s.rot += s.g * xs * F / hs;
      else if (mm === 5 || mm === 6) s.rot = 0;
      else {
        const ta = -Math.atan2(s.vy, xs);
        if (mm === 4) s.rot = ta;
        else s.rot += ((mm === 3 ? ta * 0.4 : ta) - s.rot) * (mm === 3 ? 0.04 : 0.15) * F * 4;
      }
      if (s.x >= L.len) s.win = 1;
    }

    return { CFG, buildLevel, newState, press, release, step, half, LEVELS: LEVEL_DEFS };
  }

  const LEVEL_DEFS = [
    {
      name: 'Stereo Madness', diff: 1, stars: 1, bpm: 161.5, end: 234.02, speeds: [[0, 1]], song: 0, th: [0, 1, 2, 3, 4, 5, 6, 7], proof: [8, 6],
      pal: [['#2b0d8b', '#0c004b'], ['#2b0d8b', '#0c004b'], ['#54008a', '#26004b'], ['#84003e', '#440021'], ['#5f0085', '#600092'], ['#810016', '#35000c'], ['#85006c', '#260023'], ['#900010', '#000000']],
      map: `~0 ~1 17 ^0 14 .0 ^0 14 ^0x2 #0 3 #0,2 3 #0,3 5 ~2
        15 ^0x2 5 #0,1x8 3 #0,1x11 -6 ^1 8 #0,2x14 -7 ^2 9 _1 3 _2
        3 _3 3 _4 3 _2 3 #1,1x2 #0,2x20 -16 ^2x4 -3 _3x2 5 ^2x4
        -3 _3x2 5 #0,1x10 -7 _2x4 -4 ^3x4 3 #0,2x5 -1 ^2 ^0 11 _0x4
        -1 ^1 7 ^2 -1 _1 1 _0x5 3 _1 3 _2 3 _3 3 _4
        3 _5 1 #0,3x31 -29 _6 -1 ^7 4 #6,5x5 #5,6x14 #6,5x5 -1 ~3 %S4,1.5,0
        34 #7,3 12 #9 -1 #0 v9x14 -14 ^0x14 #9 -1 #0 12 #0,2 ^0x4
        8 #8,2 v9x4 4 #0 ^0x5 #0,2 ^0x5 #0,3 7 v9x6 #6,4 v9x13 #7,4x15 -15 #0,3x15
        -1 %C4.5 ~4 #0,2x14 3 #0,3 3 #0,4 3 #0,5 3 #0,6 -1 #0,2x8 -8 v8x3
        -1.5 $2.5 8.5 #0,3 3 #0,4 3 #0,5 3 #0,6 3 #0,7 3 #0,8 3 #0,9
        _8 1 _7x2 1 _6x2 1 _5x3 3 _4x2 1 #0,4x3 -3 _4x3 3 #0,3x4
        -4 _3x4 1 _2 1 _1 1 _0 6 ^0x2 -1 ~5 1 #0 2 _1x2
        1 #0,1x3 2 _1x2 2 _2x2 1 #0,1x3 ^0x2 6 ^0x2 -2 #5,1x2 -2 v4x2
        6 ^0x3 -3 #5,1x3 -3 v4x3 5 ^0 -1 #5 -1 v4 6 ^0 -1 #5
        -1 v4 8 ^0x2 #0 3 #0,2 3 #0,3 3 #0,4 _3 1 _2 1 _1
        1 _0 5 ^0x2 6 #2,1x4 -4 v1x4 4 ^0 #0 8 _0x4 3 _1
        3 _2 3 _3 3 _4x3 1 #6 -1 #3 1 #5 -1 #2 1 #4
        -1 #1 1 #0 -1 #3 3.5 _1 1.5 _1 -1 ^2 1.5 _1 2.5 _2x3
        1 _1 1 _0x3 ^0x2 6 ^0x3 -3 #4,1x3 -3 v3x3 9 #0 _0x2 3.5 _0
        3.5 _0x2 #0 #0,2 _1x2 3 _2 1 _1 1 _0x3 3 _1 1 _1
        -1 ^2 1 _1x4 1.4 _1 -1 ^2 1.45 _1 3.15 _2x3 -1 ^3 1 _1x3
        1 %S4,1.5,0 -1 #7,3 -1 #0,3 12 #9 -1 #0 #8,2 -1 #0,2 #7,3x6 -6 #0,3x6
        #8,2 -1 #0,2 #9 -1 #0 3 ~6 5 #0 -1 #9 #0,2 -1 #8,2
        #0,3x6 -6 #7,3x6 #0,2 -1 #8,2 #0 -1 #9 -1 #9,1x68 -68 #5,1x29 -28 ~7
        2 ^6x2 3 #8,2x2 3 ^6 .6 ^6 .6 ^6 5 .6 -1 #1,1x3 -3 #2,3
        .6 .6 -1 #2,3 .6 .6 .6 #5,2 #5,1x8 -8 .6 2 #8,2 3 .6
        #5,2x8 -6 #4,1x6 -6 v3x6 #5,3x10 -5 #3,1x6 -6 v2x6 -6 #4 4 #5,1x11 -11 ^6x2
        -2 #4 3 v8 #7,3x2 v8 -1 #2,1x6 -6 #3,2 2 ^6 #2,1x8 -8 #7,2x2
        -2 #9,1x9 -3 $6.5 #3,3`
    },
    {
      name: 'Back On Track', diff: 1, stars: 2, bpm: 143.5, end: 194.58, speeds: [[0, 1]], song: 1, th: [], proof: [8, 6],
      pal: [['#4b095f', '#1a0020'], ['#4b095f', '#1a0020'], ['#6b2a26', '#2a0d0a'], ['#4a0a30', '#150010'], ['#2f6a29', '#0a2700'], ['#1d4a6a', '#04121c'], ['#3a0050', '#0a000f'], ['#31006f', '#110028'], ['#7a0a0a', '#270000'], ['#5b0736', '#110008'], ['#6a0a6a', '#14001a'], ['#2a1560', '#060010'], ['#5a1a24', '#2d0e11']],
      map: `~0 ~1 13 y0 ^0 24 y0 8 y0 17 #0 29.2 $4.2 26.8 #1
        -1 ^2 13 #1 -1 ^2 1 y0 4 #0,1x3 0.5 #0 0.5 #0 3 #0,2x3
        1 #0,2 -1 ^2 1.5 #0,1x3 0.5 #0 -1 ^1 #0,1x3 -1 y1 4 #0,3
        2 #0,2x2 -1 #0,4 3 #0,5 2 #0,2x3 1 #0,1x2 3.8 #0,2 2.2 #0,3 1 #0,2
        1 ~2 42.5 #0,1x2 3 #0,2 2.8 #0,3x2 1 #0,1x3 2.7 ~3 16 #0 4 #0,2
        1 #0 #0,3 3 #0,4x6 -4 ~4 5 #0,3x3 1 #0,2 -1 y2 1.5 ^0
        1.5 #0,4x2 -2 _4x2 2 #0,6x2 1 #0,5 1 #0,4 1 #0,3x2 0.5 ^0 1.5 #0,2x2
        0.5 #0,2x5 0.5 #0,2x4 -4 ^2 5 #0,3 1.5 ^0 0.5 #0,4 2 ^0 #0,5
        2.5 ^0 1.5 #0,4 2.3 ^0 0.2 #0,4 -1 y4 0.8 ^0 ^0 17.5 ^0x2
        8.2 #0,2 0.4 ^0 0.6 #0,4 -1 y4 2 #0,7x4 1 #0,6x5 -1 ^6 2 #0,4x2
        -2 y4 4 #0,5 -1 p5 1 #0,4 -1 p4 ~5 1 #0,3 -1 y3
        6 #0,3 -1 p3 2 #0,4 -1 %S5.5,1.5,0 22 #7,3x2 4 #0,3x2 -1 ^3 8 #6,4
        5 #5,5x2 3 #6,4x2 -2 v5 6 #0,3 -1 ^3 1 #0,6x2 2 #0,4x2 -2 ^4
        6 #7,3 -1 v6 4 #4,6x2 -1 v3 2 #7,3 -1 v6 3 #0,3x2 -2 ^3
        3 #0,5x2 -2 ^5 2 #0,2 -1 ^2 18 #0,3x22 -18 ^3x3 1 ^3x2 2 ^3
        16 %C5 5 ~6 2 ^0x2 3 ^0 #0,1x3 1 ^0 1 #0,2 1 ^0
        1 #0,3 1 #0,2x2 ^0 2 #0,3 1 #0,1x2 -1 y1 1 ^0 1 ^0
        8 ^0 1 #0 1 ^0 1 #0,2 -1 y2 1 #0,3 -1 ^3 2 ^0
        1 #0 -1 y1 ~7 ^0 1 #0,3 -1 ^3 1 #0,3x2 1 #0,2x2 ^0x2
        1 #0,3 1 #0,1x2 -1 y1 2 ^0x2 10 #1 -1 #3,8 6 #0,2 6 #3
        -1 ^4 -1 #0,2 1 #0,1x5 1 #0,1x5 -3.8 ^1 5.8 #0,1x4 -0.9 ^1 1.9 #0,1x4
        -1 y1 1.4 ^0 0.6 #0,2 0.6 ^0 1.4 #0,3 3 #0,4x5 -0.9 ^4 3.9 ~8
        3 #0,3x5 -0.9 ^3 ^0 7.9 ^0 4 ^0 12 ~9 2 ^0 14 ^0
        0.1 ^0 8 ^0 -0.1 #0,2 1 ~10 6 ^0 #0,2 7.1 ^0 0.9 #0,1x3
        ~11 2 ^0 4 #0,3 2 #0,2 0.7 ^0 2.3 ^0 2 #0,4x3 3 ^0
        4 #0,4 1 #3 -1 ^4 2 #0,2x2 -1 y2 #0,1x2 -2 ^1 ^1 2 ~12`
    },
    {
      name: 'Polargeist', diff: 2, stars: 3, bpm: 156, end: 232.81, speeds: [[0, 1]], song: 2, th: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], proof: [8, 6],
      pal: [['#0ebb06', '#075301'], ['#0ebb06', '#075301'], ['#6daf05', '#314d02'], ['#1ab551', '#0a472b'], ['#920064', '#520043'], ['#02090a', '#031214'], ['#098098', '#066a88'], ['#0a3d63', '#0d5b83'], ['#0a294c', '#0f5781'], ['#0b423e', '#044935'], ['#0ab022', '#0c9709']],
      map: `~0 ~1 12 ^0x4 -2 Y1 12 ^0x4 -2 Y1 13 ^0x6 -4 Y1 3 #0
        3 #0,2 3 Y2.5 3 #1,1x4 4 #0 ^0x2 8 #4,1x2 -2 v3x2 -2 ^0x2
        2 ~2 1 #4,1x2 -2 v3x2 -2 ^0x2 10 ^0 1 #1,1x6 4 #0 3 #1
        -1 ^2 3 ^0 #0,2 3 Y2 4 #0,2 4 #2,3 3 ^0x2 #0 3 #1
        1 #0 3 #1 3 #0,3 1 #1 1 #0,1x2 ^0x3 -1 ~3 7 ^0x2
        3 ^0x2 2 #1 -1 ^2 3 ^0 4 ^0 #4,1x9 -9 v3x9 1 y0
        1 #0,3 -1 ^3 2 Y2 2 Y3 3 Y2 ~4 3 #0,3x4 3 Y2
        3 Y3 3 #0,3x2 -1 y3 4 #0,1x7 -6 Y3.5 2 #5,3 5 Y1.5 3 #2
        1 #1 -1 #5 -1 v4 1 #0,1x3 -3 #4 -1 v3 5 Y1.5 3 #2
        1 #1,1x2 2 #3 1 #2 1 #1,1x2 2 #0,2x3 1 #0,1x5 3 #1 1 #0,1x2
        2 #1 1 #0,1x2 2 #1 1 #0,1x2 2 #1 1 #0,1x2 2 Y1.5 3 Y2.5
        2 ~5 #0,4 -1 #7,3 -1 %S5.5,1.5,0 11 #1 4 #9 3 #0 4 #4
        6 #7 5 #2 -1 #9 4 #0 1 #6 5 #1 2 #7 5 #5
        3 #9 #0 2 #3 5 #9 3 #0 4 #8 2 #3 2 #7
        1 #6 -1 $8 1 #0 #9 3 #3 3 #8 2 #1 4 #7
        2 #9 -1 #0 #8 -1 #1 #7,1x6 -6 #2,1x6 ~6 #0,3 -1 #7,3 -1 %C5
        1 #0,2x4 3 #0,3 4 Y1.5 3 Y2.5 3 #0,2x3 3 Y3 3 #3 1 #2
        -1 #6 -1 v5 1 #1 -1 #5 -1 v4 1 #0 -1 #4 -1 v3
        1 #3 -1 v2 2 ^0 4 ^0 3 .0 .0 .0 -1 Y1 .0
        .0 .0 1 #0,2 1 #0,1x5 -5 ^1x5 -3 Y2 3 #0,3 1 #0,2x2 2 #0,3x3
        3 #0,4 -1 #7,3 4 #0,5 -1 #8,2 3 #0,6 -1 #9 3 #0,7 3 #0,6
        1 #0,5 -1 #8 -1 v7 1 #0,4 -1 #7 -1 v6 1 #0,3 -1 #6
        -1 v5 1 #0,2 -1 #5 -1 v4 1 #0 -1 #4 -1 v3 5 ^0
        4 ^0x2 #0 3 #1 1 #1 -1 ^2 1 #2 3 #3 1 #3
        -1 ^4 1 #4 3 #5 1 #5 -1 ^6 1 #6 2 #0,4x2 -1 #7
        -1 ^8 1 y0 -1 $1.5 1 Y3.5 3 #0,5 1 #0,4x2 4 #0,3 1 #0,2x2
        3 #0,3 1 #0,2x2 3 Y2 4 #0,2 1 #0,1x2 3 #0,2 1 #0,1x2 6 ^0x2
        #0 3 #0,2 3 #0,3 3 #0,4 -1 y4 4 #6 1 #9 -1 v8
        -1 #5 1 #8 -1 v7 -1 #4 1 #7 -1 v6 -1 #3 1 #6
        -1 v5 -1 #2 1 #1 -1 #5 -1 v4 1 #0 -1 #4 -1 v3
        6 #4 -1 v3 -1 #0,2x5 -1 ^2 3 Y2 2 #0,2x2 3 #0,3x2 2 #0,2x7
        -6 #4,2 1 ~7 3 ^2 2 #0 #7,3x14 -14 #5,2 2 #0,2 2 Y2.5
        #0,3 -1 y3 1 $4.5 3 #5,2 2 .0 .0 Y1 -1 .0 .0 .0
        .0 3 .0 .0 Y1 -1 .0 .0 .0 .0 2 ~8 1 ^0 4 ^0
        3 ^0 #0,1x2 3 #0,2 2 #0 3 #0,2 2 #4,1x4 -4 v3x4 -1 #0,2
        2 #0 2 #0,3 -1 #5 -1 v4 3 #0 3 #0,2 3 #0,3 3 #0,4
        3 ~9 #0,5x14 -14 #8,1x11 -11 v7x11 2 ~10 ^5 2 #0,1x5 -1 ^1 ^0
        3 #1 -1 ^2 2 .0 .0 Y1 -1 .0 .0 .0 .0 #0,1x7 -4 ^1
        7 #1,2 4 ^0x2 3 ^0x2 #0,1x3 3 #0,2 2 #0 -1 y1 ^0x4 5 ^0
        #0,2 -1 #4 -1 v3 2 #0 2 #0,3 -1 #5,1x2 -2 v4x2 -1 .0
        .0 .0 -1 Y1 .0 .0 .0 .0 -1 Y1 .0 .0 .0 7 ^0x2
        #0,2 2 #0,4 -1 #6 -1 v5 2 #0,2 2 #0,4 -1 #6 -1 v5
        2 #0,2 2 #0,4 -1 #6 -1 v5 2 #0,2 1 #0,2 -1 _2 -1 ^2.5`
    },
    {
      name: 'Dry Out', diff: 2, stars: 4, bpm: 145.5, end: 194.96, speeds: [[0, 1]], song: 3, th: [], proof: [8, 6],
      pal: [['#8b052b', '#d5002d'], ['#8b052b', '#d5002d'], ['#6b0019', '#b20024'], ['#4f0015', '#5b001c'], ['#3d0022', '#5b002d'], ['#2d012c', '#53034c'], ['#180437', '#450a5e'], ['#080944', '#111d79'], ['#000b45', '#010c5b'], ['#010524', '#01081f'], ['#3b9618', '#5bea24'], ['#1a9245', '#2fff7b'], ['#07915b', '#0ddb8c'], ['#3b9604', '#6cff06'], ['#08984e', '#0fe178'], ['#0bbb4e', '#0ef367'], ['#6cda0f', '#3e7f05'], ['#0cb668', '#17ffa6'], ['#0bbd1d', '#19ff33'], ['#9d001f', '#7d001b'], ['#12bd44', '#01690b'], ['#0fc406', '#01690b'], ['#6bb409', '#01690b'], ['#48ba09', '#01690b'], ['#970067', '#740050'], ['#9a006b', '#470031'], ['#940071', '#430032'], ['#770083', '#4d004d'], ['#6300a9', '#500074']],
      map: `~0 ~1 10 ^0x2 3 #0 -1 ^1 7 ^0x2 #0 3 #0,2 4 #0
        6 ^0 3 #1,2 3 ^0 ~2 7 #0 -1 ^1 4 #0 -1 ^1
        #0 3 #0,2 3 #3,2 3 ^0x2 #0 2 #0,3 2 #0 #4,2 -1 ^0x3
        -1 ~3 6 ^0x2 3 #0 -1 ^1 #1 3 #2,1x3 1 #0,3 -1 ^3
        ~4 2 #0,3 1 #0,2 1 #0 4 #0,2 ^0x3 #0,1x2 4 ~5 ^0x2 #0
        4 #0 3 #1 3 #2 1 #0,1x19 -17 #4,2 1 ~6 ^1 3 #3
        -1 v2 3 ^1 3 #3 -1 v2 5 #0,1x2 ~7 2 #1,1x6 -4 #4,1x3
        -3 v3x3 -2 #0 6 #0,1x3 3 #2,2 2 ^0 4 ^0x2 2 ^0 #0,2
        2 #3 2 #5 2 #7 1 ~8 1 #5,1x3 2 #7 2 #9 4 #8
        1 #7 -1 #11 -1 v10 1 #6 -1 #10 -1 v9 1 #5,1x2 -2 #9
        -1 v8 4 #6 1 #5,1x2 3 $1 -1 #6 y0 #5,1x2 1 y0 1 #6
        1 #5 y0 #4,1x2 1 y0 2 #3 1 #2 -1 #7 -1 v6 1 #1
        -1 #5 -1 v4 1 #0 -1 #4 -1 v3 1 #3 -1 v2 4 ~9
        12 %F2 -1 #4,4 -1 #8,1x139 -138 ~10 16 ~11 2 #6,2 6 #6,2 4 ~12
        v7 4 v7x2 #7 3 #6,2 -1 B4 v7x3 -2 ~13 8 v7x2 #7 v7x3
        ~14 7 v7 4 v7x2 -1 ~15 1 #7 3 #6,2 2 #4,4 -1 B2
        4 #6,2 ~16 2 #7 3 #6,2 3 #5,3 -1 B3 4 #7 4 v7x2
        #7 3 #6,2 1 ~17 1 #4,4 -1 B2 9 v7x2 #6,2 3 #7 3 ~18
        #6,2 -1 B4 v7x4 -3 %N3.5 -1 #0,2x2 1 #0 3 ^0x2 2 ~19 1 ^0
        5 ^0x2 #0 -1 Y1.7 2 #0,3 -1 Y3.7 2 #0,5 -1 Y5.7 ^0x4 7 ^0x2
        #0 1 #2,2 1 ^0x2 7 ^0x2 #0 -1 P1.7 ^0x3 2 y0 .0 .0
        .0 .0 .0 -1 Y1 .0 .0 .0 3 ^0 #0,2 -1 P2.7 2 y0
        ^0x5 3 .0 .0 .0 -1 Y1 .0 .0 .0 #0,2 .0 .0 .0 #0,3
        3 #3,2 ^0 $4 3 ^0 #4 -1 v3 -1 #0,2 1 #0,1x2 3 #0,2
        -1 P2.5 1 #1 -1 ^2 1 #0,2 2 #0 3 #0,2 3 #0,3 -1 P3.5
        1 #2 -1 ^3 1 #0,3 4 #0,3 -1 %S5,1.5,0 8 #0,2x2 ~20 3 #6,2x2
        6 #2,2x2 5 #8,2x2 2 #0,2x2 5 #6,2x2 3 #1,2x2 3 #8,2x2 -1 ~21 6 #4,2x2
        6 #7,3 -1 #0,3 8 #2,2x2 -2 ^4x2 -2 v1x2 10 #6,2x2 -2 ^8x2 -2 v5x2
        3 ~22 5 #2,2x2 -2 ^4x2 -2 v1x2 9 #5,2x2 -2 ^7x2 -2 v4x2 1 $8
        7 #2,2x2 -2 ^4x2 -2 v1x2 8 #7,3x14 -14 #0,3x14 -14 ^3x2 1 ~23 4 v6x2
        4 %C5 #0,2x3 -2 B7 -1 B2 ~24 2 #0,1x2 -1 P1.8 2 #0,3 -1 #6
        -1 v5 1 #0,2 -1 #5 -1 v4 1 #0 -1 #4 -1 v3 3 ^0x2
        4 #0,2 -1 #5 -1 v4 1 ~25 1 #0 -1 P1.3 2 #0,3 -1 #6
        -1 v5 1 #0,2 -1 #5 -1 v4 4 ^0 5 #0,2 -1 P2.7 2 #0
        3 #0,2 -1 P2.7 ^0x3 4 #0,2 2 #0,4 -1 #7 -1 v6 2 #6
        -1 v5 -1 #0,3 -1 _3 2 #0,2 -1 _2 -1 y2.5 ^0x5 2 ^0
        #0,2 -1 #5 -1 v4 1 #0 -1 P1.5 -1 #4 -1 v3 3 ^0x2
        3 ^0x2 4 ^0x3 ~26 #0 -1 P1.5 3 #0,2 -1 #5 -1 v4 1 #0,1x2
        2 #0,3 -1 Y3.6 2 #0,5 1 #0,4 2 ~27 #0,3 -1 P3.7 1 #0,3
        -1 ^3 2 #0,1x6 -5 y1 ^1x4 6 ~28`
    },
    {
      name: 'Geometrical Dominator', diff: 4, stars: 7, bpm: 147.5, end: 236.34, speeds: [[0, 1], [93.259, 2], [157.791, 1], [189.745, 2], [196.979, 0], [205.201, 2], [212.435, 1]], song: 4, th: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], proof: [8, 6],
      pal: [['#4c00a2', '#24003b'], ['#4c00a2', '#24003b'], ['#b03296', '#5f0054'], ['#7a00a2', '#510148'], ['#6b0003', '#9b0025'], ['#660c4d', '#5e0a45'], ['#7f00d9', '#010101'], ['#50008d', '#010101'], ['#3d008e', '#010003'], ['#57000a', '#010003'], ['#350018', '#010003'], ['#180059', '#010003'], ['#8f0088', '#010003'], ['#4d00a2', '#010003'], ['#d50080', '#010003'], ['#4d00a0', '#010003'], ['#a6168b', '#010003'], ['#6a01be', '#010003'], ['#3d0470', '#010101'], ['#2c1e36', '#020003'], ['#55504f', '#464442'], ['#000000', '#050505'], ['#8c2005', '#050000'], ['#700714', '#010101'], ['#8e002a', '#010101'], ['#447f01', '#010000'], ['#483248', '#010101'], ['#6600b6', '#010101'], ['#5b009d', '#000000'], ['#4c0084', '#000000'], ['#8401e4', '#000002']],
      map: `~0 ~1 5 _0 #0,1x3 3 #0,1x4 #0,2 #0,3x4 4 Y3 2 #0,3x4 4 #0,2x2
        -1 *6,10 *5,10 5 #0,2 3 #0,3x2 ~2 2 *0,10 1 *0,8 -1 Y4 3 %H4,1.5,0
        #1,1x6 *0,10 1 #2,1x5 #1,1x2 1 #1,1x4 1 #3,7x3 -3 #0,1x5 ~3 1 *0,10 #1,1x3
        2 _1x3 1 #1,1x4 -1 *6,10 *4,10 #0,1x2 -1 y1 1 *0,10 -1 #4,1x2 #8,3x6
        -5 _5x2 -2 v7x4 P3 -1 *1,8 1 *2,8 P4 -1 *0,10 ~4 2 #3,1x2
        -2 y4 1 _3x3 Y7 -1 _4 _5x2 1 #0,8x12 -12 #12,6x18 -6 #0,7x2 #0,8x5
        ~5 #0,7x4 #0,8x11 -11 #12,6x6 #12,6 #13,5 #14,4x18 -16 %F10 #0,7 #0,6 #0,5 7 Y10.5
        2 v13 2 %N14 2 #0,10x3 -3 #11,1x3 -2 ~6 3 $9.5 -1 P13.5 -1 #0,8x4
        -4 ^8x2 3 Y4 3 %S5.5,1.5,0 6 #4,6x3 ^0x3 #7,3x2 -2 #0,3x2 #8,2x4 -4 #0,3
        -1 _3 #0,4 -1 _4 #0,5x2 ^0x2 #7,3x5 -5 #0,4x2 #0,3 -1 _3 #0,2 -1 _2
        #0 -1 _1 #6,4x2 -1 #0 ~7 1 #5,5x6 -6 v4x6 -6 #0,1x6 -6 _1x6
        -6 ^1x6 2 #5,5 -1 #0 -1 _1 #6,4 -1 #0,2 -1 _2 #7,3 -1 #0,3
        -1 _3 #8,2x3 -3 #0,4 -1 _4 #0,5x2 #0,5x2 -1 #0,5 -1 #8,2 -1 v7
        1 #0,5 -1 ^5 -1 #8,2 1 #0,5 -1 #8,2 -1 v7 1 #0,5 -1 ^5
        -1 #8,2 1 #0,5 -1 #8,2 -1 v7 1 #0,4x6 -6 #7,3x6 -6 v6x6 1 #5,5x8
        -8 #0,1x4 #0,2 -1 #6,4 #0,3 -1 #7,3x3 -2 #0,4x2 %W5.5,1.5,0 -1 #9,1x6 -6 #0,1x3
        -2 ~8 2 #0,2 #0,3 #0,4x2 -1 #9 #0,3 -1 #8,2 #0,2 -1 #7,3 #0,1x8
        -8 #6,4 #5,5x6 #6,4 #7,3 -1 #0,2 #8,2 -1 #0,3 #9,1x2 -2 #0,4x2 #0,3 -1 #8,2
        #0,2 -1 #7,3 #0,1x2 -2 #6,4x2 #0,2 -1 #7,3 #0,3 -1 #8,2 #0,4x2 -2 #9,1x2
        #0,3 -1 #8,2 #0,2 -1 #7,3 #0,1x8 -8 #6,4 #5,5x6 #6,4 #0,2 -1 #7,3 #0,3
        -1 #8,2 #0,4 -1 #9,1x8 -7 #0,5x6 #0,4 #0,3 -1 #8,2 #0,2 -1 #7,3 #0,1x2
        -2 #6,4x2 #0,2 -1 #7,3 #0,3 -1 #8,2 #0,4x2 -2 #9,1x2 #0,3 -1 #8,2 #0,2x2
        -2 #7,3 ~9 #6,4 #0,3 -1 #7,3 #0,4x2 -2 #7,3x3 -1 #0,3 #0,2x2 -2 #6,4x2
        #0,1x2 -2 #5,5 #4,6x2 #0,2x2 -1 y2 4 ~10 Y4.5 3 #0,5x2 -2 #8,2x2 2 #0,4
        -1 #7,3 3 #0,5 -1 #8,2 2 #0,4 -1 #7,3 2 ~11 P6.5 3 #0,4x3
        #8,2 1 #0,4 2 *0,13 -1 Y6 1 Y2 2 *0,13 ~12 P4 4 y0
        7 Y2 4 Y2 #0 #0,2 #0,3x9 -8 %H5.5 5 ~13 2 #0,1x5 -5 .1
        .1 .1 .1 .1 #0,3x6 #0,1x5 -5 .1 .1 .1 .1 .1 #0,3x8 -1 ^3
        -1 #8,2 -1 v7 2 *1,13 -1 B4 1 *2,9 -1 #7,3x28 -27 *0,13 1 *1,9
        3 ~14 v6x4 17 #7,3 -1 v6 -1 #0,2 -1 ^2 6 B9 1 #3,1x3
        8 *0,13 1 P3 1 *1,10 #0,3x7 -2 *3,8 #3 -1 #7,3 1 #0,3x15 -10 ~15
        1 *3,7 1 #3,2 -1 #8,2 6 #0,3 #0,3x2 -2 *3,7 #3 -1 #7,3 1 *7,13
        2 *6,13 -1 Y0.5 8 #0,4 #0,3 *1,9 1 *0,13 #3,1x3 -2 ~16 8 #1,1x2
        15 *2,13 Y5 1 *1,9 1 *1,13 P4.5 1 *2,9 #0 #0,2 %S5,1.5,0 -1 #0
        5 #9 #0,1x11 -11 #8,2 #7,3 #6,4x2 #7,3 ~17 #8,2 #9 5 #0,2 #0,3 #0,4
        #0,5 #0,6 #0,5 #0,4 #0,3 #0,2 #0 6 #3,7x4 5 #0 #0,2 #0,3 #0,4 #0,5x7
        #0,6x2 #0,7 2 #0 #0,2 #0,3 #0,4x2 #1,3 #2 #0,1x5 -5 #8,2 #7,3 #6,4 #5,5x2
        #0,1x5 -5 #7,3 #8,2 #9 2 #0,2 #0,3x2 -2 *4,10 1 #0,4x2 -2 *9,10 1 #0,3x2
        -2 #9 #8,2x2 -1 #0,2x2 -1 #7,3 #0,1x2 -2 #9,1x2 #0,3x4 -4 #7,3x6 -2 #0,2
        #0,1x9 -8 #6,4 #5,5x3 #6,4 #7,3 #9 1 #0,2 #0,3 #0,4 #0,5x2 #0,4 #0,3 #0,2
        #0 -1 #9 #8,2 -1 #0,1x8 -7 #7,3 #6,4 #5,5x3 #6,4 #7,3 #8,2 -1 #0
        #9 -1 #0,2 #0,3 -1 #9,1x9 -8 #0,4 #0,5x2 #0,4 #0,3 #0,2 #0,1x10 -8 #8,2
        #7,3 #6,4 #5,5x2 #9,1x3 #0,4x4 -4 #7,3x4 -2 ~18 5 #0,1x4 -4 #4,6x4 ~19 1 #0,1x2
        -2 #9,1x2 #0,4x4 -4 #7,3x4 #0,1x3 #0,2x4 -4 #5,5x4 #0,1x3 -3 #9,1x3 #0,4x4 -4 #7,3x4
        -2 %C5.5 1 ~20 2 y0 6 y0 1 ~21 5 y0 6 y0 6 y0
        6 y0 6 y0 6 y0 6 y0 6 y0 6 y0 6 y0 6 y0
        6 y0 6 y0 6 y0 6 y0 6 y0 2 Y4 2 Y6 2 Y7
        6 %W5.5,1.5,0 1 ~22 1 #0 -1 #6,4 #0,2 -1 #7,3 #0,3 -1 #8,2 #0,4
        -1 #9,1x2 -1 #0,5 #0,4 -1 #8,2 #0,3 -1 #7,3 #0,2 -1 #6,4 #0 -1 #5,5x3
        -1 #0 #0,2 -1 #6,4 #0,3 -1 #7,3 #0,4 -1 #8,2 #0,5x2 -2 #9,1x8 -6 #0,6
        #0,5x4 #0,4 #0,3 -1 #8,2 #0,2 -1 #7,3 #0,1x8 -8 #6,4 #5,5x6 #6,4 ~23 #0,2
        -1 #7,3 #0,3 -1 #8,2 #0,4 -1 #9 #0,3 #0,2 -1 *8,13 #0 2 G3
        4 #0,3x4 -4 #7,3x4 *8,13 3 *8,13 ~24 4 #0,3x4 -4 #5,5x4 -2 %A4,1.5,1 3 ~25
        #1,2x7 #7,2x8 -1 G4 2 *8,13 1 *8,13 #1,1x4 -2 *8,13 1 #6,3x4 #1,1x3 -2 *8,13
        2 *8,13 1 ~26 1 %S5,1.5,0 -1 #0,3 -1 #7,3 1 %N5 2 #8,2 -1 #0
        #7,3 -1 #0,2x2 -1 #6,4 #5,5x3 -3 #0,3x3 #6,4 -1 #0,4x2 -1 ~27 #7,3 #0,3x2
        -2 #9,1x2 #0,2 #0 4 #9,1x3 -3 v8x3 -3 #0,6x3 1 $1.5 4 #0,2x14 -14 #5,5x14
        -13 v4x5 -2 ~28 3 %H3.5 6 #0,1x5 -3 #1,3 -1 #8,2 2 #0,2x14 -9 #2
        -1 #5,5 4 #2 -1 #5,5 *5,12 2 ~29 #0,1x16 -13 P6.5 1 #3,4 1 #2,1x2
        1 #5,5 4 *6,13 ~30 #0,3x2 -2 #8,2x2 #0,1x2 -1 *7,13 #0,4x3 #0,1x3 -1 *3,13
        #0,4x3 -2 #7,3x2 #0,1x9`
    },
    {
      name: 'Spider Trial', diff: 3, stars: 5, bpm: 140, end: 115.03, speeds: [[0, 1]], song: 5, th: [1, 3], proof: [8, 6],
      pal: [['#1a2d66', '#0d1840'], ['#1a2d66', '#0d1840'], ['#4a1a7a', '#240a45'], ['#7a1a5a', '#450a35'], ['#1a5a66', '#0a3340'], ['#7a2a1a', '#45140a']],
      map: `~0 ~1 18 ^0 4 ^0 5 ^0 -1 ^0x2 5 #0,1x3 1 ^0 ^0
        4 #0,1x2 #0,2x2 #0,3x2 2 ^0x2 4 ~2 %D1.5,1.5,0 7 v8 8 v8 5 ^0
        7 ^0 9 ^0 5 v8x3 3 ^0 9 v8 9 ^0 7 #8 v8
        4 #0 ^0 1 ~3 6 ^0 5 ^0 7 v8 9 #0 ^0 6 #0,2
        6 #0 ^0 8 v8 7 #0 ^0 6 #0 ^0 4 ^0 8 #8
        v8 7 v8x3 8 ~4 %C1.5 9 ^0x2 4 ^0x2 6 #0,1x3 1 ^0 5 #0,2
        1 ^0x2 6 %H1.5 11 #0,2x2 8 #0,3x2 8 #0,2x2 8 ^0x3 7 #0,3x2 4 ^0x2
        6 #0,2 1 #0,3 3 ^0x4 8 #0,2x2 8 ~5 %D1.5,1.5,0 7 ^0x2 6 v8x2
        6 ^0 7 v8x3 5 ^0x2 6 v8 7 v8x2 6 ^0x3 5 v8x2 6 ^0
        11 %C1.5 7 ^0`
    }
  ];
  const SCALES = { min: [0, 2, 3, 5, 7, 8, 10], maj: [0, 2, 4, 5, 7, 9, 11], dor: [0, 2, 3, 5, 7, 9, 10] };
  const SONGS = [
    { bpm: 161.5, root: 57, sc: 'min', prog: [0, 5, 3, 4], lw: 'square',
      l: '0.4.7.4.9.7.4.2.0.4.7.9.b-9.7...', L: '7.7.9.7.6.4.2.4.7.7.9.a.b-a.9.7.' },
    { bpm: 143.5, root: 52, sc: 'min', prog: [0, 5, 3, 6], lw: 'sawtooth',
      l: '7.7.9.b.9.7.4.7.9.9.b.d.b.9.7.4.', L: 'b.b.d.e.d.b.9.b.d.b.9.7.9-7-4...' },
    { bpm: 156, root: 55, sc: 'min', prog: [0, 3, 5, 4], lw: 'sawtooth',
      l: '0.7.0.7.9.7.6.4.0.7.0.7.b.9.7.6.', L: 'e.d.b.9.b.9.7.9.b.9.7.6.7-4-....' },
    { bpm: 145.5, root: 50, sc: 'dor', prog: [0, 6, 5, 6], lw: 'square',
      l: '4-.4.6.7-.6.4.2.4-.4.6.7.9-.7.6.', L: '9.7.9.b.9.7.6.4.6.7.9.7.6-4-2-..' },
    { bpm: 147.5, root: 52, sc: 'min', prog: [0, 5, 2, 6], lw: 'sawtooth',
      l: '7.9.7.4.7.9.b.9.7.9.7.4.2.4.6.4.', L: 'e.c.b.9.b.9.7.6.7.6.4.2.4-.6-.7.' },
    { bpm: 140, root: 48, sc: 'min', prog: [0, 6, 5, 3], lw: 'triangle',
      l: '0.3.7.3.0.3.7.a.7.6.3.2.0.2.3...', L: '7.a.7.6.3.6.7.a.b.a.7.6.3-2-0-..' },
    { bpm: 110, root: 60, sc: 'maj', prog: [0, 4, 5, 3], lw: 'triangle', sec: [[8, 'Khpal'], [8, 'KhpaL']],
      l: '4..2..0.2..4..7.6..4..2.4..2..0.', L: '7..9..7.6..4..2.4..6..4.2..0....' }
  ];
  function autoSec(L) {
    const bars = Math.ceil(L.def.end / 4) + 2, cue = new Set();
    const at = x => Math.floor(L.B(x) / 4);
    for (const t of L.trig) cue.add(at(t.x));
    for (const o of L.objs) if (o.t === 'portal' || o.t === 'speed') cue.add(at(o.x));
    const cs = [...cue].filter(c => c > 2 && c < bars - 3).sort((a, b) => a - b), pts = [0];
    for (const c of cs) if (c - pts[pts.length - 1] >= 4) pts.push(c);
    for (let i = pts.length - 1; i > 0; i--) if (pts[i] - pts[i - 1] > 20) pts.splice(i, 0, pts[i - 1] + 12);
    const ports = L.objs.filter(o => o.t === 'portal' && 'CSAUWHD'.includes(o.p));
    const tiers = ['khbpa', 'khsbpl', 'khsBpLc', 'khsBplc'], sec = [];
    pts.forEach((p, i) => {
      const end = i + 1 < pts.length ? pts[i + 1] : bars - 2, n = end - p, x = L.X(p * 4);
      let m = 0;
      for (const o of ports) if (o.x <= x + 1) m = 'CSAUWHD'.indexOf(o.p);
      let f = tiers[i % 4];
      if (m === 1 || m === 3 || m === 4) f += 'a';
      else if (m === 5 || m === 6) f = 'KhsBpLc';
      else if (m === 2) f = 'khsbpl';
      if (i === 0) f = 'khbpa';
      if (n >= 4 && i + 1 < pts.length) { sec.push([n - 1, f]); sec.push([1, 'paSr']); } else sec.push([n, f]);
    });
    sec.push([2, 'pac']);
    return sec;
  }

  function makeAudio(api) {
    let ac = null, out = null, noise = null, dly = null, bus = null, mg = null, sg = null;
    let song = null, secMap = [], step = 0, nextT = 0, d16 = 0.1, playing = false, looping = false, cur = -1;
    const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
    const init = () => {
      if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return true; }
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        const comp = ac.createDynamicsCompressor();
        comp.threshold.value = -14; comp.ratio.value = 5;
        out = ac.createGain(); out.gain.value = 0.75; out.connect(comp); comp.connect(ac.destination);
        mg = ac.createGain(); mg.connect(out); sg = ac.createGain(); sg.connect(out);
        noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        dly = ac.createDelay(1.5);
        const fb = ac.createGain(), wet = ac.createGain();
        fb.gain.value = 0.32; wet.gain.value = 0.2;
        dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(mg);
        if (ac.state === 'suspended') ac.resume().catch(() => {});
      } catch (e) { ac = null; }
      return !!ac;
    };
    const env = (g, t, a, v, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d); };
    function tone(type, f, t, d, v, dest, f2, lp, det) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (det) o.detune.setValueAtTime(det, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d * 0.6);
      env(g, t, 0.005, v, d);
      if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(lp, t); fl.Q.value = 1.5; o.connect(fl); fl.connect(g); } else o.connect(g);
      g.connect(dest); o.start(t); o.stop(t + d + 0.05);
      return g;
    }
    function hiss(t, d, v, f, type, dest, f2) {
      const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; fl.type = type; fl.frequency.setValueAtTime(f, t);
      if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
      env(g, t, 0.004, v, d); s.connect(fl); fl.connect(g); g.connect(dest);
      s.start(t, Math.random() * 0.4); s.stop(t + d + 0.05);
    }
    function padVoice(n, t, d) {
      for (const det of [-9, 9]) {
        const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(mtof(n), t); o.detune.setValueAtTime(det, t);
        fl.type = 'lowpass'; fl.frequency.setValueAtTime(1300, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.12); g.gain.linearRampToValueAtTime(0.0001, t + d);
        o.connect(fl); fl.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.05);
      }
    }
    function riser(t, d) {
      const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; s.loop = true; fl.type = 'bandpass'; fl.Q.value = 2;
      fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(6000, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + d); g.gain.setValueAtTime(0.0001, t + d + 0.01);
      s.connect(fl); fl.connect(g); g.connect(bus); s.start(t); s.stop(t + d + 0.05);
    }
    function playStep(i, t) {
      let b = i >> 4;
      const s16 = i & 15;
      if (b >= secMap.length) { if (!looping) { playing = false; return; } b %= secMap.length; }
      const sec = secMap[b], f = sec.f, inSec = b - sec.start, sc = SCALES[song.sc], R = song.root;
      const semi = d => 12 * Math.floor(d / 7) + sc[((d % 7) + 7) % 7];
      const cd = song.prog[b % song.prog.length], chord = [semi(cd), semi(cd + 2), semi(cd + 4)], beat = d16 * 4;
      const has = c => f.indexOf(c) >= 0;
      if (has('k') && s16 % 4 === 0) { tone('sine', 150, t, 0.3, 0.9, bus, 42); hiss(t, 0.02, 0.2, 3000, 'highpass', bus); }
      if (has('K') && (s16 === 0 || s16 === 10)) tone('sine', 140, t, 0.3, 0.7, bus, 40);
      if (has('s') && (s16 === 4 || s16 === 12)) { hiss(t, 0.16, 0.4, 1700, 'bandpass', bus); tone('triangle', 200, t, 0.08, 0.2, bus, 120); }
      if (has('S')) {
        const p = (inSec * 16 + s16) / (sec.bars * 16), every = p < 0.5 ? 4 : p < 0.75 ? 2 : 1;
        if (s16 % every === 0) hiss(t, 0.1, 0.12 + p * 0.3, 1800, 'bandpass', bus);
      }
      if (has('h') && s16 % 4 === 2) hiss(t, 0.08, 0.12, 7500, 'highpass', bus);
      if (has('H')) hiss(t, 0.03, s16 % 4 === 2 ? 0.12 : 0.05, 8000, 'highpass', bus);
      if (has('b') && s16 % 4 === 2) { tone('sawtooth', mtof(R - 12 + chord[0]), t, beat * 0.45, 0.18, bus, 0, 600); tone('sine', mtof(R - 24 + chord[0]), t, beat * 0.45, 0.22, bus); }
      if (has('B') && s16 % 2 === 0) { const n = R - 12 + chord[0] + (s16 % 4 === 2 ? 12 : 0); tone('sawtooth', mtof(n), t, d16 * 1.6, 0.16, bus, 0, 800); tone('sine', mtof(n - 12), t, d16 * 1.6, 0.18, bus); }
      if (has('p') && s16 === 0) for (const c of chord) padVoice(R + c, t, beat * 3.9);
      if (has('a')) tone('square', mtof(R + 12 + chord[s16 % 3] + (s16 & 4 ? 12 : 0)), t, 0.09, 0.04, bus, 0, 2600);
      const mel = has('L') ? song.L : has('l') ? song.l : null;
      if (mel) {
        const k = (b % 2) * 16 + s16, ch = mel[k];
        if (ch && ch !== '.' && ch !== '-') {
          let n = 1;
          while (mel[k + n] === '-') n++;
          const f0 = mtof(R + 12 + semi(parseInt(ch, 36))), d = d16 * n * 0.95;
          const g = tone(song.lw, f0, t, d, song.lw === 'triangle' ? 0.16 : 0.09, bus, 0, 3200);
          tone(song.lw, f0, t, d, 0.05, bus, 0, 3000, 12);
          g.connect(dly);
        }
      }
      if (has('c') && s16 === 0 && inSec === 0) hiss(t, 1.4, 0.15, 5000, 'highpass', bus);
      if (has('r') && s16 === 0 && inSec === 0) riser(t, sec.bars * beat * 4);
    }
    const A = {
      get on() { return playing; },
      get cur() { return cur; },
      init,
      vol: { m: 0.8, s: 0.8 },
      play(idx, loop, at) {
        if (!init()) return;
        A.stop();
        cur = idx; song = SONGS[idx]; looping = !!loop; secMap = [];
        let st = 0;
        for (const [bars, f] of song.sec) { const o = { bars, f, start: st }; for (let i = 0; i < bars; i++) secMap.push(o); st += bars; }
        d16 = 60 / song.bpm / 4; step = at > 0 ? Math.floor(at / d16) : 0;
        try { dly.delayTime.setValueAtTime(d16 * 3, ac.currentTime); } catch (e) {}
        A.resume();
      },
      resume() {
        if (!ac || !song) return;
        bus = ac.createGain(); bus.gain.value = 1; bus.connect(mg);
        nextT = ac.currentTime + 0.04; playing = true;
      },
      pause() {
        playing = false;
        if (bus) {
          const b = bus; bus = null;
          try { b.gain.setTargetAtTime(0.0001, ac.currentTime, 0.03); } catch (e) {}
          api.timeout(() => { try { b.disconnect(); } catch (e) {} }, 400);
        }
      },
      stop() { A.pause(); song = null; cur = -1; },
      tick() {
        if (!ac) return;
        const m = api.muted;
        mg.gain.value = m ? 0 : A.vol.m; sg.gain.value = m ? 0 : A.vol.s;
        if (!playing || !bus || ac.state !== 'running') return;
        const now = ac.currentTime;
        if (nextT < now - 0.25) { const k = Math.ceil((now - nextT) / d16); step += k; nextT += k * d16; }
        while (playing && nextT < now + 0.12) { if (!m) playStep(step, nextT); step++; nextT += d16; }
      },
      sfx(n) {
        if (api.muted || !init() || ac.state !== 'running') return;
        const t = ac.currentTime + 0.005;
        if (n === 'die') { hiss(t, 0.5, 0.55, 2600, 'lowpass', sg, 160); tone('square', 240, t, 0.3, 0.1, sg, 45, 1600); }
        else if (n === 'coin') { tone('sine', 1320, t, 0.12, 0.16, sg); tone('sine', 1760, t + 0.08, 0.3, 0.14, sg); }
        else if (n === 'click') tone('sine', 620, t, 0.07, 0.13, sg, 980);
        else if (n === 'cp') { tone('triangle', 784, t, 0.09, 0.15, sg); tone('triangle', 1175, t + 0.06, 0.14, 0.13, sg); }
        else if (n === 'win') { [0, 4, 7, 12, 16, 19, 24].forEach((k, i) => tone('square', mtof(67 + k), t + i * 0.07, 0.35, 0.06, sg, 0, 3200)); hiss(t + 0.45, 1.2, 0.14, 4500, 'highpass', sg); }
        else if (n === 'best') [0, 7, 12].forEach((k, i) => tone('triangle', mtof(76 + k), t + i * 0.08, 0.25, 0.12, sg));
        else if (n === 'portal') hiss(t, 0.25, 0.08, 900, 'bandpass', sg, 4000);
      },
      close() { playing = false; if (ac) { try { ac.close(); } catch (e) {} ac = null; } }
    };
    return A;
  }

  const FONT = 'Nunito, system-ui, sans-serif';
  const COLORS = ['#7dff00', '#00ff7d', '#00ffff', '#00b4ff', '#3c64ff', '#8c3cff', '#ff3cff', '#ff3c8c', '#ff3c3c', '#ff8c00', '#ffe600', '#ffffff', '#9a9a9a', '#3a3a3a'];
  const FORM_REQ = [0, 0, 0, ['s', 3], ['c', 2], ['s', 9]];
  const CTOOLS = ['#', '^', '_', '.', 'Y', 'y', '*', '$', 'S', 'C', 'A', 'U', 'W', 'H', 'D', 'F', 'N', 'x'];
  const ACH = [
    ['First Steps', 'Complete any level', S => S.done >= 1],
    ['Half Way', 'Complete 3 levels', S => S.done >= 3],
    ['Dasher', 'Complete every level', S => S.done >= S.lv.length],
    ['Star Collector', 'Earn 10 stars', S => S.stars >= 10],
    ['Star Hoarder', 'Earn 20 stars', S => S.stars >= 20],
    ['Treasure Hunter', 'Collect 3 secret coins', S => S.coins >= 3],
    ['Coin Master', 'Collect 9 secret coins', S => S.coins >= 9],
    ['Persistent', 'Make 100 attempts', S => S.att >= 100],
    ['Marathon', 'Make 500 attempts', S => S.att >= 500],
    ['Dominator', 'Beat Geometrical Dominator', S => S.lv[4].d],
    ['Spider Sense', 'Beat Spider Trial', S => S.lv[5].d],
    ['Collector', 'Unlock 8 cube icons', S => S.icons >= 8]
  ];
  const ICON_REQ = [0, 0, 0, 0, 0, 0, 0, 0, ['s', 1], ['s', 4], ['s', 9], ['s', 16], ['c', 1], ['c', 3], ['c', 6], ['c', 9]];
  const DIFF = [['Auto', '#c0c0c0'], ['Easy', '#3ca8ff'], ['Normal', '#3cd860'], ['Hard', '#ffb000'], ['Harder', '#ff4a3a'], ['Insane', '#ff4ad8']];
  const PORTAL_COL = { H: '#f2f2f2', D: '#b45cff', C: '#4dff6a', S: '#ff5fd2', A: '#ff5a3c', U: '#ffa53b', W: '#3bc8ff', F: '#ffe53b', N: '#3bd1ff', M: '#ff4de1', R: '#4dff6a' };
  const SPEED_COL = ['#ffa53b', '#3bc8ff', '#4dff6a', '#ff5fd2', '#ff4a3a'];
  const ORB_COL = { Y: '#ffe53b', P: '#ff5fd2', B: '#3bd1ff', G: '#43ff5a', y: '#ffe53b', p: '#ff5fd2', b: '#3bd1ff' };
  const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixHex = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };
  const shade = (h, t) => mixHex(h, t > 0 ? '#ffffff' : '#000000', Math.abs(t));

  function cubeIcon(x, idx, c1, c2, s) {
    const h = s / 2, lw = Math.max(1.5, s * 0.07), K = '#000';
    const rr = (a, b, w, hh, r) => { x.beginPath(); x.roundRect(a, b, w, hh, r); };
    x.lineJoin = 'round'; x.lineCap = 'round';
    rr(-h, -h, s, s, s * 0.08); x.fillStyle = K; x.fill();
    const cg = x.createLinearGradient(-h, -h, h, h); cg.addColorStop(0, shade(c1, 0.3)); cg.addColorStop(0.5, c1); cg.addColorStop(1, shade(c1, -0.32));
    rr(-h + lw, -h + lw, s - lw * 2, s - lw * 2, s * 0.05); x.fillStyle = cg; x.fill();
    x.fillStyle = 'rgba(255,255,255,.34)'; x.fillRect(-h + lw * 1.6, -h + lw * 1.6, s - lw * 3.2, s * 0.1);
    x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(-h + lw * 1.6, h - lw * 1.6 - s * 0.07, s - lw * 3.2, s * 0.07);
    x.fillStyle = 'rgba(255,255,255,.5)'; for (const [qx, qy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) x.fillRect(qx * (h - lw * 2.8) - s * 0.025, qy * (h - lw * 2.8) - s * 0.025, s * 0.05, s * 0.05);
    const box = (a, b, w, hh, col) => { rr(a, b, w, hh, s * 0.03); let bg = col; if (col.length === 7) { bg = x.createLinearGradient(a, b, a, b + hh); bg.addColorStop(0, shade(col, 0.3)); bg.addColorStop(0.55, col); bg.addColorStop(1, shade(col, -0.3)); } x.fillStyle = bg; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke(); };
    const eye = (a, b, w, hh) => { x.fillStyle = K; x.fillRect(a, b, w, hh); };
    const tri = (pts, col) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0] * h, p[1] * h) : x.moveTo(p[0] * h, p[1] * h)); x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke(); };
    const k = s / 30;
    switch (idx - 1) {
      case -1: x.fillStyle = K; x.fillRect(-9 * k, -9 * k, 18 * k, 18 * k); x.fillStyle = c2; x.fillRect(-4.6 * k, -4.6 * k, 9.2 * k, 9.2 * k); x.fillStyle = K; x.fillRect(-1.8 * k, -1.8 * k, 3.6 * k, 3.6 * k); break;
      case 0: box(-9 * k, -9 * k, 18 * k, 18 * k, c2); eye(-5 * k, -4 * k, 3.5 * k, 4.5 * k); eye(1.5 * k, -4 * k, 3.5 * k, 4.5 * k); eye(-5 * k, 3 * k, 10 * k, 2.2 * k); break;
      case 1: eye(-8 * k, -6 * k, 5 * k, 6 * k); eye(3 * k, -6 * k, 5 * k, 6 * k); box(-8 * k, 3 * k, 16 * k, 5 * k, c2); x.fillStyle = K; for (let i = -1; i <= 1; i++) x.fillRect(i * 5 * k - 0.6 * k, 3 * k, 1.2 * k, 5 * k); break;
      case 2: tri([[0, -0.7], [0.7, 0], [0, 0.7], [-0.7, 0]], c2); x.fillStyle = K; x.fillRect(-3 * k, -3 * k, 6 * k, 6 * k); break;
      case 3: x.beginPath(); x.arc(0, 0, 9.5 * k, 0, 7); x.fillStyle = c2; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke(); x.beginPath(); x.arc(0, 0, 4.5 * k, 0, 7); x.fillStyle = K; x.fill(); break;
      case 4: tri([[-0.8, 0.8], [0.8, -0.8], [0.8, 0.8]], c2); break;
      case 5: box(-10 * k, -6 * k, 20 * k, 7 * k, c2); eye(-6 * k, -4 * k, 3.5 * k, 3 * k); eye(2.5 * k, -4 * k, 3.5 * k, 3 * k); eye(-4 * k, 5 * k, 8 * k, 2 * k); break;
      case 6: tri([[-0.86, -0.86], [-0.2, -0.86], [-0.86, -0.2]], c2); tri([[0.86, -0.86], [0.2, -0.86], [0.86, -0.2]], c2); eye(-6 * k, -1 * k, 4 * k, 4 * k); eye(2 * k, -1 * k, 4 * k, 4 * k); tri([[-0.15, 0.4], [0.15, 0.4], [0, 0.55]], K); break;
      case 7: for (const o of [-5, 3]) tri([[o / 15 - 0.25, -0.55], [o / 15 + 0.2, 0], [o / 15 - 0.25, 0.55], [o / 15 - 0.05, 0]], c2); break;
      case 8: x.fillStyle = c2; x.fillRect(-h + lw, -h + lw, h - lw, h - lw); x.fillRect(0, 0, h - lw, h - lw); x.lineWidth = lw * 0.7; x.strokeStyle = K; x.strokeRect(-h + lw, -h + lw, s - lw * 2, s - lw * 2); x.beginPath(); x.moveTo(0, -h + lw); x.lineTo(0, h - lw); x.moveTo(-h + lw, 0); x.lineTo(h - lw, 0); x.stroke(); break;
      case 9: for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(a * 6.5 * k - 3.5 * k, b * 6.5 * k - 3.5 * k, 7 * k, 7 * k, c2); box(-3 * k, -3 * k, 6 * k, 6 * k, K); break;
      case 10: tri([[-0.7, -0.45], [-0.1, -0.2], [-0.7, -0.2]], c2); tri([[0.7, -0.45], [0.1, -0.2], [0.7, -0.2]], c2); eye(-6 * k, -2 * k, 4 * k, 4 * k); eye(2 * k, -2 * k, 4 * k, 4 * k); eye(-6 * k, 6 * k, 12 * k, 2 * k); break;
      case 11: x.lineWidth = 4 * k; x.strokeStyle = K; x.strokeRect(-8.5 * k, -8.5 * k, 17 * k, 17 * k); x.lineWidth = 2.4 * k; x.strokeStyle = c2; x.strokeRect(-8.5 * k, -8.5 * k, 17 * k, 17 * k); x.fillStyle = K; x.fillRect(-1.5 * k, -5 * k, 3 * k, 10 * k); x.fillRect(-5 * k, -1.5 * k, 10 * k, 3 * k); break;
      case 12: for (let i = -1; i <= 1; i++) box(-10 * k, i * 7 * k - 2 * k, 20 * k, 4 * k, c2); break;
      case 13: box(-10 * k, -10 * k, 20 * k, 20 * k, c2); box(-6 * k, -6 * k, 12 * k, 12 * k, c1); box(-2.5 * k, -2.5 * k, 5 * k, 5 * k, c2); break;
      case 14: for (const a of [-1, 1]) { x.beginPath(); x.arc(a * 5 * k, -2 * k, 4.6 * k, 0, 7); x.fillStyle = c2; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke(); x.beginPath(); x.arc(a * 5 * k, -2 * k, 2 * k, 0, 7); x.fillStyle = K; x.fill(); } x.fillStyle = K; for (let i = -2; i <= 2; i++) x.fillRect(i * 3 * k - 1 * k, 5 * k, 2 * k, 4 * k); break;
      default: { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i & 1 ? 0.3 : 0.72; p.push([Math.cos(a) * r, Math.sin(a) * r]); } tri(p, c2); }
    }
  }

  const SHIP_BODY = [
    [[-0.62, -0.02], [0.32, -0.02], [0.66, 0.12], [0.36, 0.32], [-0.5, 0.32], [-0.72, 0.18]],
    [[-0.62, -0.02], [0.3, -0.02], [0.8, 0.17], [0.36, 0.32], [-0.5, 0.32], [-0.72, 0.18]],
    [[-0.62, -0.02], [0.5, -0.02], [0.64, 0.1], [0.5, 0.32], [-0.5, 0.32], [-0.72, 0.18]],
    [[-0.66, -0.04], [0.26, -0.04], [0.6, 0.1], [0.46, 0.32], [-0.54, 0.34], [-0.76, 0.16]],
    [[-0.58, 0.0], [0.2, -0.06], [0.7, 0.14], [0.2, 0.34], [-0.58, 0.32], [-0.7, 0.16]],
    [[-0.7, 0.0], [0.4, 0.0], [0.86, 0.2], [0.4, 0.3], [-0.6, 0.3]]
  ];
  const WAVE_BODY = [
    [[0.5, 0], [-0.42, -0.42], [-0.2, 0], [-0.42, 0.42]],
    [[0.56, 0], [-0.4, -0.26], [-0.18, 0], [-0.4, 0.26]],
    [[0.46, 0], [-0.42, -0.5], [-0.3, 0], [-0.42, 0.5]],
    [[0.5, 0], [-0.42, -0.42], [-0.05, -0.12], [-0.05, 0.12], [-0.42, 0.42]],
    [[0.54, 0], [0.0, -0.4], [-0.1, -0.1], [-0.46, -0.4], [-0.3, 0], [-0.46, 0.4], [-0.1, 0.1], [0.0, 0.4]],
    [[0.5, 0], [-0.1, -0.36], [-0.46, -0.1], [-0.46, 0.1], [-0.1, 0.36]]
  ];
  function vehicle(x, mode, idx, c1, c2, s, t, v, ph, air) {
    const K = '#000', lw = Math.max(1.5, s * 0.07), vv = v || 0;
    x.lineJoin = 'round';
    const path = (pts, col) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0] * s, p[1] * s) : x.moveTo(p[0] * s, p[1] * s)); x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = lw; x.strokeStyle = K; x.stroke(); };
    const limb = (ax, ay, bx, by, w, col) => { x.lineCap = 'round'; x.beginPath(); x.moveTo(ax * s, ay * s); x.lineTo(bx * s, by * s); x.lineWidth = w * s + lw * 1.6; x.strokeStyle = K; x.stroke(); x.lineWidth = w * s; x.strokeStyle = col; x.stroke(); x.lineCap = 'butt'; };
    if (mode === 0) { cubeIcon(x, idx, c1, c2, s); return; }
    if (mode === 1) {
      const fl = 0.16 + 0.06 * Math.sin((t || 0) * 40);
      x.beginPath(); x.moveTo(-0.7 * s, 0.1 * s); x.lineTo(-(0.95 + fl) * s, 0.2 * s); x.lineTo(-0.7 * s, 0.3 * s); x.closePath(); x.fillStyle = '#ff9a1f'; x.fill();
      x.beginPath(); x.moveTo(-0.7 * s, 0.15 * s); x.lineTo(-(0.82 + fl * 0.7) * s, 0.2 * s); x.lineTo(-0.7 * s, 0.25 * s); x.closePath(); x.fillStyle = '#fff3a0'; x.fill();
      x.save(); x.translate(-0.08 * s, -0.22 * s); cubeIcon(x, idx, c1, c2, s * 0.5); x.restore();
      path(SHIP_BODY[vv % 6], c1);
      x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(-0.5 * s, 0.0); x.lineTo(0.3 * s, 0.0); x.lineTo(0.4 * s, 0.05 * s); x.lineTo(-0.5 * s, 0.05 * s); x.fill();
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-0.45 * s, 0.26 * s, 0.8 * s, 0.05 * s);
      path([[-0.66, -0.02], [-0.42, -0.02], [-0.56, vv > 2 ? -0.42 : -0.34], [-0.76, vv > 2 ? -0.38 : -0.3]], c2);
      path([[-0.2, 0.12], [0.36, 0.12], [0.2, 0.24], [-0.26, 0.24]], c2);
      if (vv === 3 || vv === 5) { x.fillStyle = c2; x.fillRect(0.0, 0.0, 0.12 * s, 0.3 * s); x.fillRect(0.22 * s, 0.02, 0.06 * s, 0.28 * s); }
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(-0.5 * s, 0.02 * s, 0.7 * s, 0.05 * s);
      return;
    }
    if (mode === 2) {
      x.beginPath(); x.arc(0, 0, s * 0.5, 0, 7); x.fillStyle = K; x.fill();
      x.beginPath(); x.arc(0, 0, s * 0.5 - lw, 0, 7); x.fillStyle = c1; x.fill();
      if (vv === 1) { x.fillStyle = c2; for (let i = -1; i <= 1; i++) x.fillRect(-0.4 * s, i * 0.2 * s - 0.05 * s, 0.8 * s, 0.1 * s); }
      else if (vv === 2) { x.fillStyle = c2; for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(Math.cos(i * 0.785) * s * 0.3, Math.sin(i * 0.785) * s * 0.3, s * 0.06, 0, 7); x.fill(); } }
      else if (vv === 3) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = (i & 1 ? 0.14 : 0.36) * s; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = c2; x.fill(); x.lineWidth = lw * 0.7; x.strokeStyle = K; x.stroke(); }
      else if (vv === 4) { x.fillStyle = c2; x.fillRect(-0.06 * s, -0.4 * s, 0.12 * s, 0.8 * s); x.fillRect(-0.4 * s, -0.06 * s, 0.8 * s, 0.12 * s); }
      else if (vv === 5) { x.fillStyle = K; for (let i = 0; i < 8; i++) { const a = i * 0.785; x.beginPath(); x.arc(Math.cos(a) * s * 0.46, Math.sin(a) * s * 0.46, s * 0.07, 0, 7); x.fill(); } }
      if (vv < 1) for (let i = 0; i < 2; i++) { x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, s * 0.36, i * Math.PI, i * Math.PI + Math.PI / 2); x.closePath(); x.fillStyle = c2; x.fill(); x.lineWidth = lw * 0.7; x.strokeStyle = K; x.stroke(); }
      x.beginPath(); x.arc(0, 0, s * 0.12, 0, 7); x.fillStyle = K; x.fill();
      x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(-s * 0.18, -s * 0.2, s * 0.08, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = lw * 0.6; x.beginPath(); x.arc(0, 0, s * 0.42, Math.PI * 0.9, Math.PI * 1.4); x.stroke();
      x.fillStyle = 'rgba(0,0,0,.2)'; x.beginPath(); x.arc(0, 0, s * 0.46, 0.1, 1.3); x.arc(0, 0, s * 0.36, 1.3, 0.1, true); x.fill();
      return;
    }
    if (mode === 3) {
      const dh = vv === 2 ? 0.42 : vv === 1 ? 0.22 : 0.32;
      x.beginPath(); x.ellipse(0, -0.06 * s, 0.3 * s, dh * s, 0, Math.PI, 0); x.fillStyle = 'rgba(190,240,255,.35)'; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke();
      x.save(); x.translate(0, -0.15 * s); cubeIcon(x, idx, c1, c2, s * 0.36); x.restore();
      if (vv === 5) { x.beginPath(); x.moveTo(0, -0.34 * s); x.lineTo(0.02 * s, -0.56 * s); x.lineWidth = lw; x.strokeStyle = K; x.stroke(); x.beginPath(); x.arc(0.02 * s, -0.58 * s, s * 0.05, 0, 7); x.fillStyle = c2; x.fill(); }
      x.beginPath(); x.ellipse(0, 0.08 * s, (vv === 1 ? 0.7 : 0.62) * s, (vv === 1 ? 0.15 : 0.2) * s, 0, 0, 7); x.fillStyle = c1; x.fill(); x.lineWidth = lw; x.strokeStyle = K; x.stroke();
      x.fillStyle = c2; x.fillRect(-0.5 * s, 0.06 * s, s, 0.07 * s);
      if (vv === 4) { x.fillStyle = c2; x.fillRect(-0.4 * s, 0.17 * s, 0.8 * s, 0.04 * s); }
      x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.ellipse(-0.18 * s, 0.01 * s, 0.22 * s, 0.045 * s, -0.2, 0, 7); x.fill();
      x.fillStyle = 'rgba(0,0,0,.22)'; x.beginPath(); x.ellipse(0, 0.14 * s, 0.56 * s, 0.1 * s, 0, 0, Math.PI); x.fill();
      x.fillStyle = Math.sin(t * 8) > 0 ? '#fff' : c2;
      const nl = vv === 3 ? 1 : 2;
      for (let i = -nl; i <= nl; i++) { x.beginPath(); x.arc(i * (vv === 3 ? 0.3 : 0.2) * s, 0.2 * s, 0.035 * s, 0, 7); x.fill(); }
      return;
    }
    if (mode === 5) {
      const w = air ? 0.55 : Math.sin(ph || 0);
      [[-0.1, 0.2], [0.14, 0.2]].forEach((h, i) => {
        const q = i ? -1 : 1, th = air ? (i ? -0.5 : 0.35) : w * q * 0.75, kx = h[0] + Math.sin(th) * 0.2, ky = h[1] + Math.cos(th) * 0.2, th2 = air ? th * 0.3 + 0.7 : th * 0.5 - 0.5 - Math.max(0, -w * q) * 0.5, fx = kx + Math.sin(th2) * 0.2, fy = Math.min(0.5, ky + Math.cos(th2) * 0.2);
        limb(h[0], h[1], kx, ky, 0.13, i ? c1 : c2); limb(kx, ky, fx, fy, 0.11, i ? c1 : c2);
        path([[fx - 0.08, fy], [fx + 0.14, fy], [fx + 0.14, fy + 0.06], [fx - 0.08, fy + 0.06]], K);
      });
      path([[-0.3, -0.2], [0.3, -0.2], [0.3, 0.22], [-0.3, 0.22]], c1);
      x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(-0.26 * s, -0.17 * s, 0.52 * s, 0.05 * s);
      path([[-0.4, -0.12], [-0.28, -0.12], [-0.28, 0.12], [-0.4, 0.12]], c2);
      path(vv % 2 ? [[-0.2, -0.52], [0.3, -0.52], [0.3, -0.18], [-0.2, -0.18]] : [[-0.24, -0.5], [0.3, -0.5], [0.34, -0.16], [-0.24, -0.16]], c2);
      x.fillStyle = K; x.fillRect(0.0, -0.4 * s, 0.3 * s, 0.14 * s);
      x.fillStyle = '#fff'; x.fillRect(0.1 * s, -0.37 * s, 0.14 * s, 0.07 * s);
      if (vv > 1) path([[-0.06, -0.5], [0.0, -0.64], [0.06, -0.5]], c1);
      if (vv > 3) path([[0.1, -0.5], [0.16, -0.62], [0.22, -0.5]], c1);
      return;
    }
    if (mode === 6) {
      const w = air ? 1.2 : (ph || 0);
      for (let i = 0; i < 4; i++) {
        const side = i < 2 ? 1 : -1, k = i % 2, a = Math.sin(w + k * 1.9 + (side > 0 ? 0 : 1.2)) * (air ? 0.25 : 0.5), bx = side * (0.18 + k * 0.1), kx = bx + side * (0.2 + Math.max(0, a) * 0.1), ky = -0.12 - k * 0.04 - Math.abs(a) * 0.15, fx = kx + side * 0.14 + a * 0.18, fy = 0.34 - (air ? 0.18 : Math.max(0, -a) * 0.14);
        limb(bx, 0.04, kx, ky, 0.07, c2); limb(kx, ky, fx, fy, 0.06, c2);
      }
      x.beginPath(); x.ellipse(0, 0.06 * s, 0.34 * s, 0.24 * s, 0, 0, 7); x.fillStyle = K; x.fill();
      const sg2 = x.createLinearGradient(0, -0.2 * s, 0, 0.3 * s); sg2.addColorStop(0, shade(c1, 0.3)); sg2.addColorStop(1, shade(c1, -0.3));
      x.beginPath(); x.ellipse(0, 0.06 * s, 0.34 * s - lw, 0.24 * s - lw, 0, 0, 7); x.fillStyle = sg2; x.fill();
      x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.ellipse(-0.06 * s, -0.04 * s, 0.2 * s, 0.06 * s, -0.1, 0, 7); x.fill();
      for (const a of [-1, 1]) {
        x.beginPath(); x.ellipse((0.12 + a * 0.1) * s, -0.02 * s, 0.1 * s, vv % 2 ? 0.07 * s : 0.12 * s, 0, 0, 7); x.fillStyle = '#fff'; x.fill(); x.lineWidth = lw * 0.6; x.strokeStyle = K; x.stroke();
        x.beginPath(); x.arc((0.15 + a * 0.1) * s, 0, 0.045 * s, 0, 7); x.fillStyle = K; x.fill();
      }
      if (vv > 2) { x.fillStyle = c2; for (const a of [-0.1, 0.0, 0.1]) x.fillRect(a * s - 0.02 * s, 0.17 * s, 0.04 * s, 0.1 * s); }
      if (vv > 3) path([[-0.3, -0.02], [-0.18, -0.2], [-0.12, -0.04]], c2);
      return;
    }
    path(WAVE_BODY[vv % 6], c1);
    path(WAVE_BODY[vv % 6].map(p => [p[0] * 0.45, p[1] * 0.45]), c2);
    x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.moveTo(0.4 * s, -0.01 * s); x.lineTo(-0.34 * s, -0.34 * s); x.lineTo(-0.3 * s, -0.28 * s); x.lineTo(0.3 * s, -0.02 * s); x.closePath(); x.fill();
  }

  function face(x, cx, cy, r, d) {
    const col = DIFF[d][1];
    x.save(); x.translate(cx, cy);
    const g = x.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, shade(col, 0.45)); g.addColorStop(1, shade(col, -0.25));
    x.beginPath(); x.arc(0, 0, r, 0, 7); x.fillStyle = g; x.fill();
    x.lineWidth = r * 0.1; x.strokeStyle = '#000'; x.stroke();
    x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineCap = 'round';
    const ey = -r * 0.2;
    for (const a of [-1, 1]) {
      x.beginPath(); x.ellipse(a * r * 0.33, ey, r * 0.13, r * 0.19, 0, 0, 7); x.fill();
      if (d >= 3) { x.lineWidth = r * 0.1; x.beginPath(); x.moveTo(a * r * 0.55, ey - r * (d >= 4 ? 0.42 : 0.36)); x.lineTo(a * r * 0.15, ey - r * (d >= 4 ? 0.25 : 0.32)); x.stroke(); }
    }
    x.lineWidth = r * 0.11; x.beginPath();
    if (d <= 2) x.arc(0, r * 0.1, r * (d === 1 ? 0.45 : 0.38), 0.2 * Math.PI, 0.8 * Math.PI);
    else if (d === 3) { x.moveTo(-r * 0.3, r * 0.42); x.lineTo(r * 0.3, r * 0.42); }
    else x.arc(0, r * 0.75, r * 0.38, 1.2 * Math.PI, 1.8 * Math.PI);
    x.stroke();
    x.restore();
  }

  function star(x, cx, cy, r, fill) {
    x.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i & 1 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    x.closePath(); x.fillStyle = fill; x.fill(); x.lineWidth = Math.max(2, r * 0.18); x.strokeStyle = '#000'; x.lineJoin = 'round'; x.stroke();
  }

  function coinIcon(x, cx, cy, r, got, spin) {
    x.save(); x.translate(cx, cy); x.scale(spin == null ? 1 : Math.max(0.15, Math.abs(Math.cos(spin))), 1);
    x.globalAlpha *= got ? 1 : 0.35;
    const g = x.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, got ? '#fff6b0' : '#e0e0e0'); g.addColorStop(0.5, got ? '#ffc81e' : '#a8a8a8'); g.addColorStop(1, got ? '#c87800' : '#6a6a6a');
    x.beginPath(); x.arc(0, 0, r, 0, 7); x.fillStyle = g; x.fill(); x.lineWidth = Math.max(1.5, r * 0.14); x.strokeStyle = '#000'; x.stroke();
    x.beginPath(); x.arc(0, 0, r * 0.62, 0, 7); x.lineWidth = Math.max(1, r * 0.12); x.strokeStyle = got ? 'rgba(140,80,0,.7)' : 'rgba(60,60,60,.6)'; x.stroke();
    x.fillStyle = got ? '#fff2a0' : '#d8d8d8';
    x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i & 1 ? r * 0.18 : r * 0.42; x.lineTo(Math.cos(a) * q, Math.sin(a) * q); } x.closePath(); x.fill();
    x.restore();
  }

  Ameplay.register({
    id: 'dash-cube',
    title: 'Geometry Rush',
    category: 'Arcade',
    tint: '#2a5cff',
    sim: rushSim,
    blurb: 'Jump, fly, run and flip to the beat through six neon rhythm levels, then build your own.',
    help: '<kbd>Space</kbd> <kbd>↑</kbd> <kbd>W</kbd> or click / tap to jump, hold to fly or boost the robot · tap to flip the spider · <kbd>P</kbd> pause · practice: <kbd>Z</kbd> place / <kbd>X</kbd> remove checkpoint',
    better: 'high',
    format: v => v + '%',
    width: 960,
    ownPause: true,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-20 22 28)"><rect x="10" y="16" width="24" height="24" rx="2"/><rect x="16" y="22" width="12" height="12" rx="1"/></g><path d="M36 52l7-13 7 13zM48 52l5-9 5 9zM4 52h56"/><path d="M2 26h5M2 34h8" opacity=".6"/></svg>',
    css: '.gm-dash-cube{touch-action:none}.gm-dash-cube .g-canvas{background:#1a3fd6}',
    mount(root, api) {
      const SIM = rushSim(), { CFG, buildLevel, newState, press, release, step, half } = SIM;
      const U = CFG.U;
      const NL = LEVEL_DEFS.length;
      const CRD = { name: 'My Level', diff: 0, stars: 0, bpm: 128, end: 40, speeds: [[0, 1]], song: NL + 1, th: [], pal: [['#2a6cff', '#1a46e0']], map: '' };
      const DEFS = LEVEL_DEFS.concat([CRD]);
      const LV = DEFS.map(buildLevel);
      for (let i = 0; i < NL; i++) SONGS[i].sec = autoSec(LV[i]);
      SONGS[NL + 1] = Object.assign({}, SONGS[1], { sec: [[8, 'khbpa']] });
      const MENU = NL;
      const narrow = (root.clientWidth || 800) < 640;
      const W = narrow ? 600 : 800, H = 450, SC = 1.4, VW = W / SC, VH = H / SC, PX = VW / 2 - 75, BL = U * SC;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      root.style.touchAction = 'none';
      const music = makeAudio(api);
      const DPR = Math.min(2, window.devicePixelRatio || 1);
      const blank = () => ({ b: 0, pb: 0, a: 0, j: 0, c: 0, d: 0 });
      const sv = Object.assign({ lv: [], icon: 0, c1: 0, c2: 2, li: 0, ic: [0, 0, 0, 0, 0, 0, 0], tab: 0, vol: { m: 0.8, s: 0.8 }, cr: [], v: 0 }, api.load() || {});
      if (sv.v !== 2) { sv.lv = []; sv.v = 2; }
      if (!Array.isArray(sv.ic) || sv.ic.length < 7) sv.ic = [0, 0, 0, 0, 0, 0, 0];
      if (!sv.vol || typeof sv.vol.m !== 'number') sv.vol = { m: 0.8, s: 0.8 };
      if (!Array.isArray(sv.cr)) sv.cr = [];
      music.vol = sv.vol;
      for (let i = 0; i < LV.length; i++) sv.lv[i] = Object.assign(blank(), sv.lv[i] || {});
      sv.li = Math.max(0, Math.min(NL - 1, sv.li | 0));
      if (!(sv.icon >= 0 && sv.icon < 16)) sv.icon = 0;
      const persist = () => api.save(sv);
      const totStars = () => sv.lv.reduce((a, r, i) => a + (r.d && i < NL ? DEFS[i].stars : 0), 0);
      const totCoins = () => sv.lv.reduce((a, r, i) => a + (i < NL ? (r.c & 1) + ((r.c >> 1) & 1) + ((r.c >> 2) & 1) : 0), 0);
      const reqOk = q => !q || (q[0] === 's' ? totStars() : totCoins()) >= q[1];
      const unlocked = i => reqOk(ICON_REQ[i]);
      const STAR_MAX = DEFS.slice(0, NL).reduce((a, d) => a + d.stars, 0), COIN_MAX = LV.slice(0, NL).reduce((a, l) => a + l.coins.length, 0);
      const col1 = () => COLORS[sv.c1] || COLORS[0], col2 = () => COLORS[sv.c2] || COLORS[2];

      const spr = (w, h, fn) => { const c = document.createElement('canvas'); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR); const x = c.getContext('2d'); x.scale(DPR, DPR); fn(x); return c; };
      const tileSpr = hh => spr(BL, BL * hh, x => {
        const h = BL * hh, lw = Math.max(2.5, BL * 0.075);
        x.fillStyle = '#000'; x.fillRect(0, 0, BL, h);
        const g = x.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(0.55, 'rgba(255,255,255,.03)'); g.addColorStop(1, 'rgba(255,255,255,.07)');
        x.fillStyle = g; x.fillRect(0, 0, BL, h);
        x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = lw; x.strokeRect(lw / 2, lw / 2, BL - lw, h - lw);
        x.strokeStyle = 'rgba(255,255,255,.1)'; x.lineWidth = 1; x.strokeRect(lw + 2.5, lw + 2.5, BL - lw * 2 - 5, Math.max(1, h - lw * 2 - 5));
      });
      const TILE = tileSpr(1), SLAB = tileSpr(0.5);
      const spikeSpr = small => spr(BL, BL, x => {
        const h = small ? BL * 0.47 : BL, y0 = BL, lw = Math.max(2.6, BL * 0.08);
        x.lineJoin = 'miter'; x.miterLimit = 6;
        x.beginPath(); x.moveTo(lw * 0.6, y0 - lw / 2); x.lineTo(BL / 2, y0 - h + lw * 0.9); x.lineTo(BL - lw * 0.6, y0 - lw / 2); x.closePath();
        x.fillStyle = '#000'; x.fill();
        const g = x.createLinearGradient(0, y0 - h, 0, y0); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.fill();
        x.save(); x.shadowColor = 'rgba(255,255,255,.6)'; x.shadowBlur = 5; x.lineWidth = lw; x.strokeStyle = '#fff'; x.stroke(); x.restore();
        x.lineWidth = lw; x.strokeStyle = '#fff'; x.stroke();
      });
      const SPK = spikeSpr(false), SPKS = spikeSpr(true);
      const bgTile = (() => {
        const S = 640; let seed = 90210;
        const rn = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        return spr(S, S, x => {
          const cut = (a, b, w, h, d) => {
            const big = Math.max(w, h);
            if (big < 150 || (d > 1 && rn() < 0.28)) {
              const m = 4, al = 0.05 + rn() * 0.1, dk = rn() < 0.35;
              x.fillStyle = dk ? `rgba(0,0,0,${al * 0.9})` : `rgba(255,255,255,${al})`;
              x.fillRect(a + m, b + m, w - m * 2, h - m * 2);
              x.strokeStyle = dk ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.1)'; x.lineWidth = 2; x.strokeRect(a + m + 1, b + m + 1, w - m * 2 - 2, h - m * 2 - 2);
              return;
            }
            const k = 0.35 + rn() * 0.3;
            if (w >= h) { cut(a, b, w * k, h, d + 1); cut(a + w * k, b, w * (1 - k), h, d + 1); }
            else { cut(a, b, w, h * k, d + 1); cut(a, b + h * k, w, h * (1 - k), d + 1); }
          };
          cut(0, 0, S, S, 0);
        });
      })();
      const glowSpr = {};
      const glow = c => glowSpr[c] || (glowSpr[c] = spr(96, 96, x => { const g = x.createRadialGradient(48, 48, 4, 48, 48, 48); g.addColorStop(0, c); g.addColorStop(0.35, c + '88'); g.addColorStop(1, c + '00'); x.fillStyle = g; x.fillRect(0, 0, 96, 96); }));

      const P = [];
      for (let i = 0; i < 420; i++) P.push({ on: 0, x: 0, y: 0, vx: 0, vy: 0, l: 0, m: 1, s: 1, c: '#fff', g: 0, k: 0, r: 0, vr: 0 });
      let pk = 0;
      const emit = (x, y, vx, vy, l, s, c, g, k) => { const p = P[pk]; pk = (pk + 1) % P.length; p.on = 1; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.l = p.m = l; p.s = s; p.c = c; p.g = g || 0; p.k = k || 0; p.r = Math.random() * 6; p.vr = (Math.random() - 0.5) * 12; };
      const rnd = (a, b) => a + Math.random() * (b - a);

      let shownPct = -1, scr = 'menu', T = 0, hits = [], toastT = 0, toastMsg = '', infoOpen = false;
      let L = null, li = sv.li, s = null, acc = 0, practice = false, cps = [], deadT = 0, winT = 0, levelT = 0, lastCp = 0;
      let attempts = 0, jumps = 0, playTime = 0, camX = -PX, camY = -90, flV = 0, ceV = 900, spawn = { x: 0, y: 15 }, flash = 0, shake = 0;
      let inputHeld = false, keyHeld = false, newBest = null, coinFx = [], doneInfo = null, menuX = 0, menuCube = { y: 15, vy: 0, r: 0 };
      const ptrs = new Set(), trail = [], wave = [];
      let bot = null, botN = 4;
      const sliders = [];
      let sliderDrag = null, resetT = 0, creClr = 0, lastP = null, crePaintOn = false;
      const objById = new Map();
      for (const l of LV) for (const o of l.objs) objById.set(l.def.name + o.id, o);
      const toast = m => { toastMsg = m; toastT = 2.2; };
      const pct = () => s && L ? Math.max(0, Math.min(100, Math.floor(s.x / L.len * 100))) : 0;
      const sx = x => (x - camX) * SC, sy = y => H - (y - camY) * SC;

      function palAt(x) {
        const tr = L ? L.trig : null, pal = L ? L.def.pal : null, th = L && L.def.th ? L.def.th : [];
        if (!tr || !tr.length) return pal ? pal[0].concat(th.indexOf(0) >= 0 ? 1 : 0) : ['#2a5cff', '#1a3fd6', 0];
        let i = -1;
        for (let k = 0; k < tr.length; k++) if (tr[k].x <= x) i = k;
        if (i < 0) return pal[tr[0].c].concat(th.indexOf(tr[0].c) >= 0 ? 1 : 0);
        const ci = tr[i].c, pi = i > 0 ? tr[i - 1].c : ci, cur = pal[ci] || pal[0], prev = pal[pi] || pal[0];
        const f = Math.min(1, (x - tr[i].x) / 160), a = th.indexOf(pi) >= 0 ? 1 : 0, b = th.indexOf(ci) >= 0 ? 1 : 0;
        return f >= 1 ? cur.concat(b) : [mixHex(prev[0], cur[0], f), mixHex(prev[1], cur[1], f), a + (b - a) * f];
      }

      function startLevel(i, prac) {
        music.init();
        L = LV[i]; li = i; sv.li = i; persist();
        practice = !!prac; cps = []; attempts = 0; jumps = 0; playTime = 0; newBest = null;
        respawn();
      }
      function respawn() {
        const cp = practice && cps.length ? cps[cps.length - 1] : null;
        s = cp ? Object.assign({}, cp.s) : newState(L);
        levelT = cp ? cp.t : 0; lastCp = levelT;
        attempts++;
        if (!practice) { sv.lv[li].a++; persist(); }
        spawn = { x: s.x, y: s.y };
        trail.length = 0; wave.length = 0; coinFx = [];
        camX = Math.min(s.x - PX, L.len - VW * 0.7);
        camY = s.mode ? (s.fl + s.ce) / 2 - VH / 2 : Math.max(-90, s.y - VH * 0.45);
        flV = s.fl; ceV = s.mode ? s.ce : camY + VH + 80;
        acc = 0; scr = 'play';
        music.play(DEFS[li].song, false, levelT);
        if (inputHeld) press(s);
        shownPct = pct(); api.score(shownPct);
      }
      function die() {
        scr = 'dead'; deadT = 0; shake = 0; flash = 0.35;
        music.sfx('die');
        if (!practice) music.stop();
        const x = s.x, y = s.y, c1 = col1(), c2 = col2();
        for (let i = 0; i < 24; i++) { const a = rnd(0, 6.3), v = rnd(60, 380); emit(x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(0.4, 0.9), rnd(4, 9), i % 3 ? c1 : c2, -500, 0); }
        for (let i = 0; i < 9; i++) { const a = rnd(0, 6.3), v = rnd(80, 240); emit(x + ((i % 3) - 1) * 9, y + (((i / 3) | 0) - 1) * 9, Math.cos(a) * v, Math.sin(a) * v + 120, rnd(0.6, 1), 10, i & 1 ? c1 : '#000', -700, 0); }
        emit(x, y, 0, 0, 0.45, 70, '#ffffff', 0, 2);
        emit(x, y, 0, 0, 0.3, 40, c1, 0, 2);
        const p = pct(), r = sv.lv[li], cre = li >= NL;
        if (!practice) {
          if (p > r.b && !cre) { r.b = p; newBest = { p, t: 0 }; music.sfx('best'); }
          persist();
          if (p > 0 && !cre) api.submit(p);
        } else if (p > r.pb && !cre) { r.pb = p; persist(); }
      }
      function win() {
        scr = 'win'; winT = 0;
        const r = sv.lv[li], first = !r.d;
        doneInfo = { att: attempts, jumps, time: playTime, coins: practice ? 0 : s.coins, stars: !practice && first ? DEFS[li].stars : 0, practice, best: false };
        if (!practice) {
          r.b = 100; r.d = 1; r.c |= s.coins; persist();
          doneInfo.best = li < NL && api.submit(100);
        } else { r.pb = 100; persist(); }
      }
      function addCp(auto) {
        if (!practice || scr !== 'play') return;
        cps.push({ s: Object.assign({}, s), t: levelT, x: s.x, y: s.y, auto });
        lastCp = levelT;
        if (!auto) music.sfx('cp');
        for (let i = 0; i < 8; i++) emit(s.x, s.y, rnd(-80, 80), rnd(-80, 80), 0.4, 5, '#5dff7a', 0, 1);
      }
      function safeHere() {
        const c0 = Math.floor((s.x - 45) / U), c1 = Math.floor((s.x + 110) / U);
        for (let c = c0; c <= c1; c++) { const col = L.cols[c]; if (col) for (const o of col) if ((o.k === 2 || o.k === 3) && Math.abs(((o.hy0 != null ? (o.hy0 + o.hy1) / 2 : o.y)) - s.y) < 90) return false; }
        return true;
      }
      function pause() { if (scr !== 'play') return; scr = 'pause'; music.pause(); }
      function resume() { if (scr !== 'pause') return; scr = 'play'; acc = 0; music.resume(); }
      function togglePractice() {
        if (practice) { practice = false; cps = []; attempts = 0; jumps = 0; playTime = 0; respawn(); }
        else { practice = true; cps = []; music.play(DEFS[li].song, false, levelT); scr = 'play'; acc = 0; }
      }
      function goLevels() { scr = li >= NL ? 'cre' : 'levels'; music.stop(); music.play(MENU, true); release(s || {}); }

      function onPress() {
        inputHeld = true;
        if (scr === 'play' && s) press(s);
      }
      function onRelease() {
        if (ptrs.size || keyHeld) return;
        inputHeld = false;
        if (s) release(s);
      }

      function update(dt) {
        T += dt;
        music.tick();
        if (toastT > 0) toastT -= dt;
        flash = Math.max(0, flash - dt * 2.5);
        if (newBest) newBest.t += dt;
        for (const f of coinFx) f.t += dt;
        if (scr === 'play') {
          acc += dt; playTime += dt;
          while (acc >= 1 / 240) {
            acc -= 1 / 240; levelT += 1 / 240;
            if (bot) { const hb = bot[(s.t / botN) | 0]; if (hb === 1 && !s.held) press(s); else if (hb === 0 && s.held) release(s); }
            step(s, L);
            if (s.ev) events();
            if (s.dead) { die(); break; }
            if (s.win) { win(); break; }
            if (practice && levelT - lastCp > 2.4 && (s.ground || s.mode) && safeHere()) addCp(true);
          }
          if ((scr === 'play' || scr === 'dead') && pct() !== shownPct) { shownPct = pct(); api.score(shownPct); }
          fx(dt);
        } else if (scr === 'dead') {
          deadT += dt;
          if (deadT > 1) respawn();
        } else if (scr === 'win') {
          winT += dt;
          if (winT < 0.8) { s.x += CFG.SPEED[s.spd] * dt; s.y += ((camY + VH * 0.5) - s.y) * Math.min(1, dt * 4); s.rot += dt * 8; }
          if (winT >= 0.8 && winT - dt < 0.8) {
            music.stop(); music.sfx('win'); flash = 1; shake = 0;
            for (let i = 0; i < 70; i++) { const a = rnd(0, 6.3), v = rnd(100, 520); emit(s.x, s.y, Math.cos(a) * v, Math.sin(a) * v, rnd(0.6, 1.4), rnd(4, 10), ['#fff', col1(), col2(), '#ffe53b'][i % 4], -200, i % 5 ? 0 : 1); }
            emit(s.x, s.y, 0, 0, 0.7, 160, '#ffffff', 0, 2);
          }
          if (winT > 0.8 && Math.random() < dt * 5) { const fx0 = camX + rnd(0.2, 0.8) * VW, fy = camY + rnd(0.45, 0.85) * VH, c = ['#ffe53b', '#ff5fd2', '#3bd1ff', '#43ff5a'][(Math.random() * 4) | 0]; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; emit(fx0, fy, Math.cos(a) * 160, Math.sin(a) * 160, 0.9, 5, c, -120, 1); } }
          if (winT > 2.6) scr = 'done';
        }
        if (scr === 'done' && Math.random() < dt * 3) { const fx0 = camX + rnd(0.1, 0.9) * VW, fy = camY + rnd(0.5, 0.9) * VH, c = ['#ffe53b', '#ff5fd2', '#3bd1ff', '#43ff5a'][(Math.random() * 4) | 0]; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28; emit(fx0, fy, Math.cos(a) * 140, Math.sin(a) * 140, 0.9, 4, c, -120, 1); } }
        if (s && (scr === 'play' || scr === 'dead')) camera(dt);
        if (resetT > 0) resetT -= dt;
        if (creClr > 0) creClr -= dt;
        if (scr !== 'play' && scr !== 'dead' && scr !== 'pause' && scr !== 'win' && scr !== 'done') menuTick(dt);
        for (const p of P) {
          if (!p.on) continue;
          if ((p.l -= dt) <= 0) { p.on = 0; continue; }
          p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
          if (p.k === 1) { p.vx *= 1 - dt * 2; p.vy *= 1 - dt * 2; }
        }
      }
      function events() {
        const e = s.ev;
        if (e & 1) jumps++;
        if (e & 2) { const o = objById.get(L.def.name + s.eo); if (o) { emit(o.x, o.y, 0, 0, 0.35, 34, ORB_COL[o.c], 0, 2); for (let i = 0; i < 10; i++) emit(o.x, o.y, rnd(-150, 150), rnd(-150, 150), 0.4, 4, ORB_COL[o.c], 0, 1); } jumps++; }
        if (e & 4) { const o = objById.get(L.def.name + s.eo); if (o) for (let i = 0; i < 12; i++) emit(o.x + rnd(-12, 12), o.y, rnd(-40, 40), (o.up ? -1 : 1) * rnd(120, 300), 0.45, 4, ORB_COL[o.c], 0, 1); }
        if (e & 8) { const o = objById.get(L.def.name + s.eo); if (o) emit(o.x, o.y, 0, 0, 0.4, 50, o.t === 'speed' ? SPEED_COL[o.s] : PORTAL_COL[o.p], 0, 2); flash = Math.max(flash, 0.18); }
        if (e & 16) { music.sfx('coin'); for (const c of L.coins) if ((s.coins >> c.i) & 1 && !coinFx.some(f => f.i === c.i)) coinFx.push({ i: c.i, x: c.x, y: c.y, t: 0 }); }
        if (e & 64) { const y0 = s.py == null ? s.y : s.py; for (let i = 0; i <= 14; i++) emit(s.x + rnd(-4, 4), y0 + (s.y - y0) * i / 14, rnd(-50, 10), rnd(-30, 30), rnd(0.2, 0.4), 6 - i * 0.2, i & 1 ? col2() : '#fff', 0, 1); emit(s.x, s.y, 0, 0, 0.3, 34, col2(), 0, 2); }
        if ((e & 32) && (s.mode === 0 || s.mode > 4)) for (let i = 0; i < 5; i++) emit(s.x - 10 + rnd(0, 20), s.y - s.g * half(s), rnd(-60, 30), s.g * rnd(20, 80), 0.3, 3.5, 'rgba(255,255,255,.8)', -s.g * 300, 0);
      }
      function fx(dt) {
        const hs = half(s), c1 = col1(), c2 = col2();
        if ((s.mode === 0 || s.mode > 4) && s.ground && Math.random() < dt * 30) emit(s.x - hs, s.y - s.g * hs, rnd(-80, -20), s.g * rnd(10, 60), 0.3, rnd(2.5, 4.5), c1, 0, 0);
        if (s.mode === 1 && Math.random() < dt * 50) emit(s.x - hs * 0.9, s.y - s.g * hs * 0.2, rnd(-160, -60), rnd(-30, 30), 0.35, rnd(3, 6), Math.random() < 0.5 ? '#ffd23f' : '#ff7a2a', 0, 1);
        if (s.mode === 5 && s.held && s.rt > 0 && s.g * s.vy > 0 && Math.random() < dt * 90) emit(s.x - hs * 0.8, s.y - s.g * hs * 0.9, rnd(-70, -10), -s.g * rnd(60, 170), 0.25, rnd(3, 6), Math.random() < 0.5 ? '#ffd23f' : '#ff7a2a', 0, 1);
        if (s.mode === 3 && Math.random() < dt * 25) emit(s.x, s.y - s.g * hs * 0.6, rnd(-60, -10), -s.g * rnd(20, 60), 0.3, 3, c2, 0, 1);
        if (s.mode === 4) {
          const last = wave[wave.length - 1];
          if (!last || Math.abs(last.x - s.x) > 6 || Math.sign(s.vy) !== last.d) wave.push({ x: s.x, y: s.y, d: Math.sign(s.vy) });
          while (wave.length && wave[0].x < camX - 40) wave.shift();
        } else if (wave.length && wave[wave.length - 1].x < camX - 40) wave.length = 0;
        trail.push(s.x, s.y);
        if (trail.length > 40) trail.splice(0, 2);
      }
      function camera(dt) {
        camX = Math.min(s.x - PX, L.len + 120 - VW);
        const bounded = s.mode !== 0;
        let ty = camY;
        if (bounded) ty = (s.fl + s.ce) / 2 - VH / 2;
        else {
          if (s.y > camY + VH * 0.62) ty = s.y - VH * 0.62;
          else if (s.y < camY + VH * 0.3) ty = s.y - VH * 0.3;
          ty = Math.max(-90, ty);
        }
        camY += (ty - camY) * Math.min(1, dt * (bounded ? 4.5 : 3.2));
        flV += (s.fl - flV) * Math.min(1, dt * 7);
        const ct = bounded ? s.ce : camY + VH + 80;
        ceV += (ct - ceV) * Math.min(1, dt * 7);
      }
      function menuTick(dt) {
        menuX += CFG.SPEED[1] * dt;
        menuCube.vy -= CFG.GRAV[1] * 60 * 60 * dt;
        menuCube.y += menuCube.vy * dt;
        if (menuCube.y <= 15) { menuCube.y = 15; menuCube.vy = 0; menuCube.r = Math.round(menuCube.r / (Math.PI / 2)) * Math.PI / 2; if (Math.random() < dt * 2.2) menuCube.vy = CFG.JUMP[1] * 60; }
        else menuCube.r += Math.PI / 0.39 * dt;
      }

      function txtRuns(str, size, plain) {
        const runs = [];
        if (plain || !/[a-z]/.test(str)) runs.push([str, size]);
        else {
          let cur = '', big = true;
          for (const ch of str) {
            const lo = ch >= 'a' && ch <= 'z';
            if (cur && !lo !== big) { runs.push([cur, big ? size : size * 0.78]); cur = ''; }
            big = !lo; cur += lo ? ch.toUpperCase() : ch;
          }
          if (cur) runs.push([cur, big ? size : size * 0.78]);
        }
        let tw = 0;
        for (const r of runs) { ctx.font = `900 ${r[1]}px ${FONT}`; r[2] = ctx.measureText(r[0]).width; tw += r[2]; }
        return { runs, tw };
      }
      function drawTxt(str, x, y, size, fill, align, lw, plain, kind) {
        str = String(str);
        const { runs, tw } = txtRuns(str, size, plain), al = align || 'center';
        const px = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x, by = y + size * 0.36;
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
        let fs = fill || '#fff';
        if (kind) {
          fs = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
          if (kind === 'lime') { fs.addColorStop(0, '#f4ff8a'); fs.addColorStop(0.5, '#9dff1a'); fs.addColorStop(1, '#3fbf00'); }
          else { fs.addColorStop(0, '#fff7a8'); fs.addColorStop(0.45, '#ffd21e'); fs.addColorStop(1, '#ff8a00'); }
        }
        for (let pass = 0; pass < 3; pass++) {
          let cx = px;
          for (const r of runs) {
            ctx.font = `900 ${r[1]}px ${FONT}`;
            if (pass === 0) { if (lw > 0) { ctx.lineWidth = lw * 1.18; ctx.strokeStyle = '#000'; ctx.shadowColor = 'rgba(0,0,0,.38)'; ctx.shadowOffsetY = size > 18 ? size * 0.07 : 0; ctx.strokeText(r[0], cx, by + (kind ? size * 0.05 : 0)); ctx.shadowColor = 'transparent'; ctx.shadowOffsetY = 0; } }
            else if (pass === 1) { ctx.lineWidth = Math.max(0.8, size * 0.055); ctx.strokeStyle = fs; ctx.strokeText(r[0], cx, by); }
            else { ctx.fillStyle = fs; ctx.fillText(r[0], cx, by); }
            cx += r[2];
          }
        }
      }
      function txt(str, x, y, size, fill, align, lw, plain) { drawTxt(str, x, y, size, fill, align, lw != null ? lw : Math.max(3, size * 0.2), plain); }
      function goldTxt(str, x, y, size, kind) { drawTxt(str, x, y, size, null, 'center', size * 0.26, false, kind || 'gold'); }
      function btn(x, y, r, c, icon, fn) {
        ctx.save(); ctx.translate(x, y);
        ctx.beginPath(); ctx.arc(0, r * 0.08, r, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#000'; ctx.fill();
        const g = ctx.createLinearGradient(0, -r, 0, r);
        g.addColorStop(0, shade(c, 0.35)); g.addColorStop(1, shade(c, -0.3));
        ctx.beginPath(); ctx.arc(0, 0, r - Math.max(3, r * 0.09), 0, 7); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.55, r * 0.22, 0, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fill();
        if (icon) icon(r);
        ctx.restore();
        if (fn) hits.push({ x, y, r: r + 6, fn });
      }
      const ico = {
        play: r => { ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.45); ctx.lineTo(r * 0.5, 0); ctx.lineTo(-r * 0.3, r * 0.45); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, r * 0.1); ctx.strokeStyle = '#000'; ctx.stroke(); },
        back: r => { ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.18); ctx.lineTo(-r * 0.05, -r * 0.18); ctx.lineTo(-r * 0.05, -r * 0.45); ctx.lineTo(-r * 0.55, 0); ctx.lineTo(-r * 0.05, r * 0.45); ctx.lineTo(-r * 0.05, r * 0.18); ctx.lineTo(r * 0.45, r * 0.18); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.strokeStyle = '#000'; ctx.stroke(); },
        retry: r => { ctx.lineCap = 'round'; ctx.lineWidth = r * 0.36; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, r * 0.38, -0.3, 4.4); ctx.stroke(); ctx.lineWidth = r * 0.2; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(r * 0.5, -r * 0.42); ctx.lineTo(r * 0.5, r * 0.02); ctx.lineTo(r * 0.08, -r * 0.18); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke(); },
        menu: r => { for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.roundRect(-r * 0.42, i * r * 0.28 - r * 0.08, r * 0.84, r * 0.16, r * 0.08); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke(); } },
        diamond: r => { ctx.beginPath(); ctx.moveTo(0, -r * 0.5); ctx.lineTo(r * 0.38, 0); ctx.lineTo(0, r * 0.5); ctx.lineTo(-r * 0.38, 0); ctx.closePath(); ctx.fillStyle = '#5dff7a'; ctx.fill(); ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.strokeStyle = '#000'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -r * 0.3); ctx.lineTo(r * 0.16, 0); ctx.lineTo(0, r * 0.1); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(); },
        undo: r => { ico.diamond(r); ctx.lineCap = 'round'; ctx.lineWidth = r * 0.14; ctx.strokeStyle = '#ff3c3c'; ctx.beginPath(); ctx.moveTo(-r * 0.32, -r * 0.32); ctx.lineTo(r * 0.32, r * 0.32); ctx.moveTo(r * 0.32, -r * 0.32); ctx.lineTo(-r * 0.32, r * 0.32); ctx.stroke(); },
        info: r => { txt('?', 0, r * 0.04, r * 1.1, '#fff', 'center', r * 0.16); },
        gear: r => { ctx.beginPath(); for (let t = 0; t < 8; t++) for (const [d, q] of [[-0.27, 0.42], [-0.17, 0.58], [0.17, 0.58], [0.27, 0.42]]) { const a = t * Math.PI / 4 + d; ctx.lineTo(Math.cos(a) * r * q, Math.sin(a) * r * q); } ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.strokeStyle = '#000'; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, 7); ctx.fillStyle = '#3b8dff'; ctx.fill(); ctx.stroke(); },
        cup: r => { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(-r * 0.42, -r * 0.5); ctx.lineTo(r * 0.42, -r * 0.5); ctx.lineTo(r * 0.3, r * 0.05); ctx.quadraticCurveTo(0, r * 0.4, -r * 0.3, r * 0.05); ctx.closePath(); ctx.fillStyle = '#ffe53b'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffc21a'; ctx.fillRect(-r * 0.08, r * 0.2, r * 0.16, r * 0.2); ctx.strokeRect(-r * 0.08, r * 0.2, r * 0.16, r * 0.2); ctx.fillRect(-r * 0.3, r * 0.38, r * 0.6, r * 0.14); ctx.strokeRect(-r * 0.3, r * 0.38, r * 0.6, r * 0.14); },
        bars: r => { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff'; [[-0.42, 0.3], [-0.14, 0.55], [0.14, 0.8], [0.42, 1.05]].forEach(([x, h]) => { ctx.beginPath(); ctx.rect(x * r - r * 0.1, r * 0.45 - h * r * 0.9, r * 0.2, h * r * 0.9); ctx.fill(); ctx.stroke(); }); },
        creator: r => { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.rect(-r * 0.55, -r * 0.05, r * 0.5, r * 0.5); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(r * 0.05, r * 0.45); ctx.lineTo(r * 0.3, -r * 0.05); ctx.lineTo(r * 0.55, r * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.38, r * 0.15, 0, 7); ctx.fillStyle = '#ffe53b'; ctx.fill(); ctx.stroke(); },
        kit: r => { ctx.save(); ctx.rotate(-0.12); cubeIcon(ctx, sv.icon, col1(), col2(), r * 0.95); ctx.restore(); }
      };
      function arrowBtn(x, y, dir, fn) {
        ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
        ctx.beginPath(); ctx.moveTo(-18, -44); ctx.lineTo(22, 0); ctx.lineTo(-18, 44); ctx.lineTo(-6, 0); ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.translate(0, 4); ctx.fill(); ctx.translate(0, -4);
        const g = ctx.createLinearGradient(0, -44, 0, 44); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d4d4d4');
        ctx.fillStyle = g; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.stroke();
        ctx.restore();
        hits.push({ x, y, r: 54, fn });
      }
      function decor(top) {
        const bk = (X, Y, c) => { ctx.fillStyle = c; ctx.fillRect(X, Y, 26, 26); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeRect(X, Y, 26, 26); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(X + 3, Y + 3, 20, 4); };
        if (top) {
          const x = W / 2 - 110;
          ctx.fillStyle = '#58d500'; ctx.fillRect(x, -4, 220, 22); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeRect(x, -4, 220, 22);
          ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x + 3, -1, 214, 4);
          bk(W / 2 - 26, -8, '#35e6e6'); bk(x - 14, -8, '#35e6e6'); bk(x + 208, -8, '#35e6e6');
          return;
        }
        for (let sd = 0; sd < 2; sd++) for (let c = 0; c < 3; c++) for (let r = 0; r <= 2 - c; r++) bk(sd ? W - 26 - c * 26 : c * 26, H - 26 - r * 24, (r + c) & 1 ? '#58d500' : '#35e6e6');
      }
      function bar(x, y, w, h, p, c, label) {
        if (label) txt(label, x + w / 2, y - h * 0.9, Math.max(15, h * 0.75), '#fff', 'center', 4);
        ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
        if (p > 0) {
          const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, shade(c, 0.4)); g.addColorStop(1, shade(c, -0.15));
          ctx.beginPath(); ctx.roundRect(x + 3, y + 3, Math.max(h - 6, (w - 6) * p / 100), h - 6, (h - 6) / 2); ctx.fillStyle = g; ctx.fill();
        }
        txt(p + '%', x + w / 2, y + h / 2 + 1, h * 0.7, '#fff', 'center', 3.5);
      }
      function panel(x, y, w, h) {
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();
      }

      function drawBg(bgc, grc, cx, cy, beat, fl, ce, th) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, shade(bgc, 0.04)); g.addColorStop(1, shade(bgc, -0.22));
        ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
        const S = 640, ox = -(((cx * SC * 0.1) % S) + S) % S, oy = (((cy * SC * 0.1) % S) + S) % S;
        for (let X0 = ox - S; X0 < W; X0 += S) for (let Y0 = oy - S; Y0 < H; Y0 += S) if (X0 + S > 0 && Y0 + S > 0) ctx.drawImage(bgTile, X0, Y0, S, S);
        if (beat > 0.02) { ctx.fillStyle = `rgba(255,255,255,${beat * 0.045})`; ctx.fillRect(0, 0, W, H); }
        ground(grc, cx, cy, fl, false, beat, th);
        if (ce < cy + VH + 40) ground(grc, cx, cy, ce, true, beat, th);
      }
      function ground(grc, cx, cy, wy, top, beat, th) {
        const y = H - (wy - cy) * SC;
        ctx.save();
        if (top) { ctx.translate(0, y); ctx.scale(1, -1); ctx.translate(0, -y); }
        const h = top ? y + 20 : H - y + 20;
        if ((top && y > -10) || (!top && y < H + 10)) {
          const g = ctx.createLinearGradient(0, y, 0, y + Math.max(60, h));
          g.addColorStop(0, shade(grc, -0.02)); g.addColorStop(1, shade(grc, -0.5));
          ctx.fillStyle = g; ctx.fillRect(-20, y, W + 40, h);
          const T2 = BL * 4, ox = -((cx * SC) % T2 + T2) % T2;
          ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 2;
          ctx.beginPath();
          for (let X0 = ox; X0 < W + T2; X0 += T2) { ctx.moveTo(X0, y); ctx.lineTo(X0, y + h); }
          ctx.moveTo(0, y + T2 * 0.5); ctx.lineTo(W, y + T2 * 0.5);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.05)';
          for (let X0 = ox; X0 < W + T2; X0 += T2) ctx.fillRect(X0 + 3, y + 3, T2 - 6, T2 * 0.5 - 6);
          if (th > 0.02 && !top) {
            const st = 9, k0 = Math.floor((cx * SC) / st) - 1;
            ctx.beginPath(); ctx.moveTo(-st, y + 2);
            for (let k = k0; k < k0 + W / st + 3; k++) {
              const hh = (3 + ((k * 7919) % 13 + 13) % 13 * 0.9 + (((k * 31) % 5 + 5) % 5) * 1.6) * th;
              ctx.lineTo(k * st - cx * SC + st * 0.5, y - hh); ctx.lineTo(k * st - cx * SC + st, y + 2);
            }
            ctx.lineTo(W + st, y + 4); ctx.lineTo(-st, y + 4); ctx.closePath();
            ctx.fillStyle = '#000'; ctx.fill();
          }
          const lg = ctx.createLinearGradient(0, 0, W, 0);
          lg.addColorStop(0, 'rgba(255,255,255,.5)'); lg.addColorStop(0.5, `rgba(255,255,255,${0.95 + beat * 0.05})`); lg.addColorStop(1, 'rgba(255,255,255,.5)');
          ctx.fillStyle = lg; ctx.fillRect(0, y - 1.5, W, 3);
          const gl = ctx.createLinearGradient(0, y - 12, 0, y + 12); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, `rgba(255,255,255,${0.28 + beat * 0.22})`); gl.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gl; ctx.fillRect(0, y - 12, W, 24);
        }
        ctx.restore();
      }

      function drawWorld(beat, pal) {
        const x0 = camX - 60, x1 = camX + VW + 60, objs = L.objs;
        let lo = 0, hi = objs.length;
        while (lo < hi) { const m = (lo + hi) >> 1; if (objs[m].x0 < x0 - L.maxW) lo = m + 1; else hi = m; }
        const savedCoins = sv.lv[li].c;
        for (let pass = 0; pass < 3; pass++) for (let i = lo; i < objs.length; i++) {
          const o = objs[i];
          if (o.x0 > x1) break;
          if (o.x1 < x0) continue;
          const t = o.t;
          if (pass === 0) {
            if (t === 'deco') {
              const X = sx(o.x0), Y = sy(o.y1), w = (o.x1 - o.x0) * SC, h = (o.y1 - o.y0) * SC;
              const g = ctx.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${0.12 + beat * 0.15})`);
              ctx.fillStyle = g; ctx.fillRect(X, Y, w, h);
            } else if (t === 'block' || t === 'slab') {
              const X = sx(o.x0), Y = sy(o.y1), w = (o.x1 - o.x0) * SC, h = (o.y1 - o.y0) * SC, slab = t === 'slab';
              const nx = Math.round(w / BL), ny = slab ? 1 : Math.round(h / BL), im = slab ? SLAB : TILE, th = slab ? BL / 2 : BL;
              for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) ctx.drawImage(im, X + a * BL, Y + b * th, BL, th);
              ctx.strokeStyle = `rgba(255,255,255,${0.1 + beat * 0.22})`; ctx.lineWidth = 9; ctx.strokeRect(X, Y, w, h);
            }
          } else if (pass === 1) {
            if (t === 'spike') {
              const X = sx(o.x0), Y = sy(o.y1), small = o.s === '.' || o.s === "'", down = o.s === 'v' || o.s === "'";
              if (down) { ctx.save(); ctx.translate(X, Y + BL); ctx.scale(1, -1); ctx.drawImage(small ? SPKS : SPK, 0, 0, BL, BL); ctx.restore(); }
              else ctx.drawImage(small ? SPKS : SPK, X, Y, BL, BL);
            } else if (t === 'saw') {
              const X = sx(o.x), Y = sy(o.y), r = o.r * SC;
              ctx.save(); ctx.translate(X, Y); ctx.rotate(T * 5);
              ctx.beginPath();
              for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, q = k & 1 ? r * 0.8 : r; ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
              ctx.closePath();
              const sgr = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r); sgr.addColorStop(0, '#3a3a44'); sgr.addColorStop(0.7, '#0e0e12'); sgr.addColorStop(1, '#000');
              ctx.fillStyle = sgr; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = '#fff'; ctx.stroke();
              ctx.fillStyle = '#000'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.26; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, r * 0.12, 0, 7); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.stroke(); }
              ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, 7); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
              ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
              for (let k = 0; k < 3; k++) { ctx.rotate(Math.PI * 2 / 3); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(r * 0.25, -2, r * 0.28, 4); }
              ctx.restore();
            }
          } else {
            if (t === 'orb') {
              const X = sx(o.x), Y = sy(o.y), used = s && (o.id === s.u1 || o.id === s.u2), c = ORB_COL[o.c], k = 1 + beat * 0.12;
              const gs = 80 * k;
              ctx.globalAlpha = used ? 0.3 : 0.8; ctx.drawImage(glow(c), X - gs / 2, Y - gs / 2, gs, gs); ctx.globalAlpha = 1;
              ctx.beginPath(); ctx.arc(X, Y, 19 * k, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = used ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.9)'; ctx.stroke();
              const pr = 19 + ((T * 1.6) % 1) * 12;
              ctx.beginPath(); ctx.arc(X, Y, pr, 0, 7); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - (T * 1.6) % 1)})`; ctx.stroke();
              const g = ctx.createRadialGradient(X - 4, Y - 5, 2, X, Y, 14);
              g.addColorStop(0, '#fff'); g.addColorStop(0.35, c); g.addColorStop(1, shade(c, -0.35));
              ctx.beginPath(); ctx.arc(X, Y, 13, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke();
              ctx.beginPath(); ctx.arc(X, Y, 8.5, Math.PI * 1.05, Math.PI * 1.6); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
              ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(X - 4.5, Y - 5, 1.8, 0, 7); ctx.fill();
            } else if (t === 'pad') {
              const X = sx(o.x), Y = sy(o.y), c = ORB_COL[o.c], dir = o.up ? 1 : -1, used = s && (o.id === s.u1 || o.id === s.u2);
              const gg = ctx.createLinearGradient(0, Y, 0, Y + dir * 40);
              gg.addColorStop(0, c + (used ? '55' : 'aa')); gg.addColorStop(1, c + '00');
              ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(X - 18, Y); ctx.lineTo(X - 12, Y + dir * 40); ctx.lineTo(X + 12, Y + dir * 40); ctx.lineTo(X + 18, Y); ctx.fill();
              ctx.beginPath(); ctx.ellipse(X, Y, 18, 7 + beat * 2, 0, o.up ? 0 : Math.PI, o.up ? Math.PI : 0); ctx.closePath();
              const pgd = ctx.createLinearGradient(0, Y - 8, 0, Y + 8); pgd.addColorStop(o.up ? 0 : 1, shade(c, 0.5)); pgd.addColorStop(o.up ? 1 : 0, shade(c, -0.2));
              ctx.fillStyle = pgd; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke();
              ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(X - 9, Y + dir * -2.5 - 1, 18, 2);
              for (let k = 0; k < 3; k++) { const ph = (T * 1.5 + k / 3) % 1; ctx.fillStyle = `rgba(255,255,255,${1 - ph})`; ctx.fillRect(X - 10 + k * 9, Y + dir * ph * 34, 3, 3); }
            } else if (t === 'portal' || t === 'speed') drawPortal(o, beat);
            else if (t === 'coin') {
              if (s && ((s.coins >> o.i) & 1)) continue;
              const X = sx(o.x), Y = sy(o.y);
              ctx.globalAlpha = 0.6; ctx.drawImage(glow('#ffd21e'), X - 34, Y - 34, 68, 68); ctx.globalAlpha = 1;
              ctx.globalAlpha = (savedCoins >> o.i) & 1 ? 0.45 : 1; coinIcon(ctx, X, Y, 15 + beat * 1.5, true, T * 2.5); ctx.globalAlpha = 1;
            }
          }
        }
        for (const f of coinFx) {
          if (f.t > 1) continue;
          ctx.globalAlpha = 1 - f.t; coinIcon(ctx, sx(f.x), sy(f.y + f.t * 90), 16 + f.t * 8, true, T * 12); ctx.globalAlpha = 1;
        }
      }
      function drawPortal(o, beat) {
        const X = sx(o.x), Y = sy(o.y), sp = o.t === 'speed', c = sp ? SPEED_COL[o.s] : PORTAL_COL[o.p];
        ctx.save(); ctx.translate(X, Y);
        if (sp) {
          const n = [1, 1, 2, 3, 4][o.s], dir = o.s === 0 ? -1 : 1;
          ctx.globalAlpha = 0.6; ctx.drawImage(glow(c), -50, -60, 100, 120); ctx.globalAlpha = 1;
          for (let k = 0; k < n; k++) {
            const ox = (k - (n - 1) / 2) * 13 * dir;
            ctx.beginPath(); ctx.moveTo(ox - 9 * dir, -30); ctx.lineTo(ox + 9 * dir, 0); ctx.lineTo(ox - 9 * dir, 30); ctx.lineTo(ox - 1 * dir, 0); ctx.closePath();
            ctx.fillStyle = c; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
            ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
          }
          ctx.restore(); return;
        }
        const small = o.p === 'M' || o.p === 'R', ry = o.h * SC * (small ? 0.75 : 0.98), rx = Math.min(30, (small ? 15 : 19) + (o.h / U - 1.5) * 2.5);
        ctx.globalAlpha = 0.55 + beat * 0.25; ctx.drawImage(glow(c), -rx * 3, -ry * 1.4, rx * 6, ry * 2.8); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7);
        const pgr = ctx.createLinearGradient(-rx, 0, rx, 0); pgr.addColorStop(0, c + '10'); pgr.addColorStop(0.5, c + '55'); pgr.addColorStop(1, c + '10');
        ctx.fillStyle = pgr; ctx.fill();
        ctx.save(); ctx.clip(); ctx.strokeStyle = c + '66'; ctx.lineWidth = 2;
        for (let k = 0; k < 6; k++) { const yy = -ry + ((T * 0.8 + k / 6) % 1) * ry * 2; ctx.beginPath(); ctx.moveTo(-rx, yy); ctx.quadraticCurveTo(0, yy + (k & 1 ? 6 : -6), rx, yy); ctx.stroke(); }
        ctx.restore();
        ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.stroke();
        ctx.lineWidth = 6; ctx.strokeStyle = c; ctx.stroke();
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(0, 0, rx - 3, ry - 3, 0, 0, 7); ctx.stroke();
        for (let k = -1; k <= 1; k += 2) {
          ctx.beginPath(); ctx.moveTo(k * (rx + 2), -ry * 0.55); ctx.lineTo(k * (rx + 11), -ry * 0.38); ctx.lineTo(k * (rx + 11), ry * 0.38); ctx.lineTo(k * (rx + 2), ry * 0.55); ctx.closePath();
          ctx.fillStyle = shade(c, -0.25); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke();
        }
        if (o.p === 'F' || o.p === 'N' || small) {
          const up = o.p === 'F' || o.p === 'M';
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-7, up ? 4 : -4); ctx.lineTo(0, up ? -8 : 8); ctx.lineTo(7, up ? 4 : -4); ctx.closePath(); ctx.fill();
        }
        for (let k = 0; k < 5; k++) { const ph = (T * 0.9 + k / 5) % 1, a = k * 2.4 + T; ctx.fillStyle = `rgba(255,255,255,${ph})`; ctx.fillRect(Math.cos(a) * rx * 2.2 * (1 - ph) - 1.5, Math.sin(a) * ry * (1 - ph) - 1.5, 3, 3); }
        ctx.restore();
      }
      function drawPlayer(x, y, rot, mode, mini, g, alpha) {
        const c1 = col1(), c2 = col2(), sz = (mini ? 18 : 30) * SC;
        {
          if (mode === 1 || mode === 3) {
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            for (let k = 2; k < trail.length; k += 2) {
              const a = k / trail.length;
              ctx.strokeStyle = `rgba(255,255,255,${a * 0.5})`; ctx.lineWidth = a * sz * 0.45;
              ctx.beginPath(); ctx.moveTo(sx(trail[k - 2]) - sz * 0.3, sy(trail[k - 1])); ctx.lineTo(sx(trail[k]) - sz * 0.3, sy(trail[k + 1])); ctx.stroke();
            }
          }
        }
        ctx.save(); ctx.translate(sx(x), sy(y)); ctx.rotate(rot); ctx.globalAlpha = alpha == null ? 1 : alpha;
        if (g < 0 && (mode === 1 || mode === 3 || mode === 5 || mode === 6)) ctx.scale(1, -1);
        vehicle(ctx, mode, sv.icon, c1, c2, mode === 0 || mode === 2 || mode > 4 ? sz : sz * (mode === 4 ? 0.9 : 1.15), T, sv.ic[mode], x / (mode === 6 ? 7 : 9.5), s && !s.ground);
        ctx.restore();
      }
      function drawWaveTrail() {
        if (wave.length < 1 || !s) return;
        ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
        for (const [w, c] of [[s.mini ? 9 : 13, col2()], [s.mini ? 3 : 5, '#fff']]) {
          ctx.beginPath();
          wave.forEach((p, i) => i ? ctx.lineTo(sx(p.x), sy(p.y)) : ctx.moveTo(sx(p.x), sy(p.y)));
          if (s.mode === 4) ctx.lineTo(sx(s.x), sy(s.y));
          ctx.lineWidth = w; ctx.strokeStyle = c; ctx.globalAlpha = c === '#fff' ? 0.9 : 0.85; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      function drawParticles() {
        for (const p of P) {
          if (!p.on) continue;
          const a = p.l / p.m, X = sx(p.x), Y = sy(p.y);
          if (p.k === 2) { ctx.beginPath(); ctx.arc(X, Y, p.s * SC * (1.15 - a) * 1.1, 0, 7); ctx.lineWidth = 6 * a + 1; ctx.strokeStyle = p.c; ctx.globalAlpha = a; ctx.stroke(); ctx.globalAlpha = 1; continue; }
          ctx.globalAlpha = Math.min(1, a * 1.5); ctx.fillStyle = p.c;
          const z = p.s * SC * (p.k === 1 ? a : 0.5 + a * 0.5);
          if (p.k === 1) { ctx.beginPath(); ctx.arc(X, Y, z / 2, 0, 7); ctx.fill(); }
          else { ctx.save(); ctx.translate(X, Y); ctx.rotate(p.r); ctx.fillRect(-z / 2, -z / 2, z, z); ctx.restore(); }
        }
        ctx.globalAlpha = 1;
      }

      function rays(X, Y, t) {
        const a = Math.max(0, 1 - t / 1.7);
        if (a <= 0) return;
        ctx.save(); ctx.translate(X, Y); ctx.globalCompositeOperation = 'lighter';
        const n = 14, R = Math.max(W, H) * 1.1;
        for (let i = 0; i < n; i++) {
          const ang = i / n * Math.PI * 2 + t * 0.5, wd = 0.05 + (i % 3) * 0.025, ca = Math.cos(ang), sa = Math.sin(ang);
          const g = ctx.createLinearGradient(0, 0, ca * R, sa * R);
          g.addColorStop(0, `rgba(255,244,150,${0.75 * a})`); g.addColorStop(1, 'rgba(255,244,150,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang - wd) * R, Math.sin(ang - wd) * R); ctx.lineTo(Math.cos(ang + wd) * R, Math.sin(ang + wd) * R); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      function drawPlay() {
        const beat = Math.exp(-((levelT * DEFS[li].bpm / 60) % 1) * 5);
        const pal = palAt(s.x);
        ctx.save();
        if (shake > 0.3) { ctx.translate(rnd(-shake, shake), rnd(-shake, shake)); shake *= 0.9; }
        drawBg(pal[0], pal[1], camX, camY, beat, flV, ceV, pal[2]);
        drawWorld(beat, pal);
        for (const cp of cps) {
          const X = sx(cp.x), Y = sy(cp.y);
          ctx.save(); ctx.translate(X, Y); ctx.globalAlpha = cp.auto ? 0.6 : 1; ico.diamond(30); ctx.restore();
        }
        if (attempts > 0) {
          const ax = sx(spawn.x + 90), ay = sy(Math.max(spawn.y, 15) + 110);
          if (ax > -400 && scr !== 'pause') { ctx.globalAlpha = 0.95; txt('Attempt ' + (practice ? attempts : sv.lv[li].a), ax, ay, 44, '#fff', 'left', 7); ctx.globalAlpha = 1; }
        }
        const fx0 = sx(L.len);
        if (fx0 < W + 60) {
          const g = ctx.createLinearGradient(fx0 - 160, 0, fx0 + 40, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.fillRect(fx0 - 160, 0, 200, H);
          for (let k = 0; k < 14; k++) { const ph = (T * 0.7 + k / 14) % 1, yy = H * ((k * 0.37) % 1); ctx.fillStyle = 'rgba(255,255,255,' + (1 - ph) + ')'; ctx.fillRect(fx0 - 10 - ph * 120, yy, 5, 5); }
        }
        drawWaveTrail();
        if (scr === 'play' || (scr === 'win' && winT < 0.8)) drawPlayer(s.x, s.y, s.rot, s.mode, s.mini, s.g, scr === 'win' ? 1 - winT : 1);
        if (scr === 'win' && winT > 0.8) rays(sx(s.x), sy(s.y), winT - 0.8);
        drawParticles();
        if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash * 0.6})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
        ctx.restore();
        if (scr === 'play' || scr === 'dead') hud();
        if (newBest && newBest.t < 1.6 && scr === 'dead') {
          const k = Math.min(1, newBest.t * 5);
          ctx.save(); ctx.translate(W / 2, H * 0.4); ctx.scale(0.6 + k * 0.4, 0.6 + k * 0.4);
          goldTxt('New Best!', 0, -36, 40); txt(newBest.p + '%', 0, 20, 64, '#fff', 'center', 9);
          ctx.restore();
        }
        if (scr === 'win' && winT > 0.9) {
          const k = Math.min(1, (winT - 0.9) * 4), b = 1 + Math.sin(Math.min(1, (winT - 0.9) * 3) * Math.PI) * 0.12;
          ctx.save(); ctx.translate(W / 2, H * 0.36); ctx.scale(k * b, k * b);
          goldTxt(practice ? 'Practice Complete!' : 'Level Complete!', 0, 0, narrow ? 50 : 62, 'lime');
          ctx.restore();
        }
      }
      function hud() {
        const bw = Math.min(360, W * 0.42), p = pct(), x0 = W / 2 - bw / 2;
        ctx.beginPath(); ctx.roundRect(x0, 12, bw, 16, 8); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
        if (p > 0) { ctx.beginPath(); ctx.roundRect(x0 + 3, 15, Math.max(10, (bw - 6) * p / 100), 10, 5); ctx.fillStyle = practice ? '#3bd1ff' : '#7dff3a'; ctx.fill(); }
        txt(p + '%', x0 + bw + 12, 21, 22, '#fff', 'left', 5);
        ctx.globalAlpha = 0.8;
        btn(W - 32, 30, 20, '#5ad100', r => { ctx.fillStyle = '#103a00'; ctx.fillRect(-r * 0.42, -r * 0.42, r * 0.28, r * 0.84); ctx.fillRect(r * 0.14, -r * 0.42, r * 0.28, r * 0.84); }, pause);
        ctx.globalAlpha = 1;
        if (practice) {
          ctx.beginPath(); ctx.roundRect(W / 2 - 76, H - 78, 152, 62, 14); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(W / 2, H - 78); ctx.lineTo(W / 2, H - 16); ctx.stroke();
          ctx.save(); ctx.translate(W / 2 - 38, H - 53); ico.diamond(26); ctx.restore();
          ctx.save(); ctx.translate(W / 2 + 38, H - 53); ico.undo(26); ctx.restore();
          txt('Z', W / 2 - 38, H - 26, 14, '#fff', 'center', 3); txt('X', W / 2 + 38, H - 26, 14, '#fff', 'center', 3);
          hits.push({ x: W / 2 - 38, y: H - 47, r: 34, fn: () => addCp(false) });
          hits.push({ x: W / 2 + 38, y: H - 47, r: 34, fn: () => { cps.pop(); music.sfx('click'); } });
        }
        if (toastT > 0) { ctx.globalAlpha = Math.min(1, toastT * 2); txt(toastMsg, W / 2, H - 90, 22, '#fff', 'center', 5); ctx.globalAlpha = 1; }
      }

      function slider(x, y, w, key, label) {
        const v = sv.vol[key];
        txt(label + '  ' + Math.round(v * 100) + '%', x + w / 2, y - 24, 17, '#fff', 'center', 4);
        ctx.beginPath(); ctx.roundRect(x, y - 7, w, 14, 7); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
        if (v > 0.01) { const g = ctx.createLinearGradient(0, y - 7, 0, y + 7); g.addColorStop(0, '#d8ff7a'); g.addColorStop(1, '#4fcf00'); ctx.beginPath(); ctx.roundRect(x + 2, y - 5, Math.max(10, (w - 4) * v), 10, 5); ctx.fillStyle = g; ctx.fill(); }
        const kx = x + w * v;
        ctx.beginPath(); ctx.arc(kx, y, 13, 0, 7); ctx.fillStyle = '#000'; ctx.fill();
        const kg = ctx.createRadialGradient(kx - 3, y - 4, 1, kx, y, 11); kg.addColorStop(0, '#fff'); kg.addColorStop(1, '#bfbfbf');
        ctx.beginPath(); ctx.arc(kx, y, 10.5, 0, 7); ctx.fillStyle = kg; ctx.fill();
        sliders.push({ k: key, x0: x, x1: x + w, y });
      }
      function drawPause() {
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
        const r = sv.lv[li], d = DEFS[li], cre = li >= NL;
        txt(d.name, W / 2, 50, narrow ? 38 : 46, '#fff', 'center', 8);
        const bw = Math.min(420, W - 120);
        if (!cre) {
          bar(W / 2 - bw / 2, 112, bw, 24, r.b, '#7dff3a', 'Normal Mode');
          bar(W / 2 - bw / 2, 170, bw, 24, r.pb, '#3bd1ff', 'Practice Mode');
        }
        const sw = narrow ? 210 : 260, sy0 = cre ? 150 : 246;
        slider(W / 2 - sw - 18, sy0, sw, 'm', 'Music');
        slider(W / 2 + 18, sy0, sw, 's', 'Effects');
        const y = 336, gap = narrow ? 120 : 140;
        btn(W / 2 - gap * 1.5, y, 38, practice ? '#3bd1ff' : '#2e9a4a', ico.diamond, () => { music.sfx('click'); togglePractice(); });
        btn(W / 2 - gap * 0.5, y, 50, '#5ad100', ico.play, () => { music.sfx('click'); resume(); });
        btn(W / 2 + gap * 0.5, y, 38, '#5ad100', ico.retry, () => { music.sfx('click'); cps = []; respawn(); });
        btn(W / 2 + gap * 1.5, y, 38, '#5ad100', ico.menu, () => { music.sfx('click'); goLevels(); });
        txt(practice ? 'Practice: ON' : 'Practice', W / 2 - gap * 1.5, y + 56, 16, '#fff', 'center', 4);
        txt('Resume', W / 2 - gap * 0.5, y + 68, 16, '#fff', 'center', 4);
        txt('Restart', W / 2 + gap * 0.5, y + 56, 16, '#fff', 'center', 4);
        txt('Exit', W / 2 + gap * 1.5, y + 56, 16, '#fff', 'center', 4);
      }
      function drawDone() {
        const d = doneInfo, w = Math.min(500, W - 40), h = 268, x = W / 2 - w / 2, y = 70;
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 0, W, H);
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fillStyle = '#2a0707'; ctx.fill();
        const pg = ctx.createLinearGradient(0, y, 0, y + h); pg.addColorStop(0, 'rgba(255,60,40,.22)'); pg.addColorStop(1, 'rgba(255,60,40,0)');
        ctx.fillStyle = pg; ctx.fill();
        ctx.lineWidth = 15; ctx.strokeStyle = '#000'; ctx.stroke();
        const fg = ctx.createLinearGradient(x, 0, x + w, 0); fg.addColorStop(0, '#46d800'); fg.addColorStop(0.5, '#9dff2a'); fg.addColorStop(1, '#46d800');
        ctx.lineWidth = 9; ctx.strokeStyle = fg; ctx.stroke();
        ctx.fillStyle = '#35e6e6'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
        for (const [qx, qy] of [[x - 4, y - 4], [x + w - 18, y - 4]]) { ctx.fillRect(qx, qy, 22, 14); ctx.strokeRect(qx, qy, 22, 14); }
        goldTxt(d.practice ? 'Practice Complete!' : 'Level Complete!', W / 2, y + 42, narrow ? 38 : 46, 'lime');
        const m = Math.floor(d.time / 60), sec = Math.floor(d.time % 60), cc = '#ffc21a';
        txt('Attempts: ' + d.att, W / 2, y + 88, 24, cc, 'center', 5);
        txt('Jumps: ' + d.jumps, W / 2, y + 120, 24, cc, 'center', 5);
        txt('Time: ' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0'), W / 2, y + 152, 24, cc, 'center', 5);
        const got = sv.lv[li].c;
        for (let i = 0; i < 3; i++) coinIcon(ctx, W / 2 - 54 + i * 54, y + 204, 19, ((d.coins | got) >> i) & 1);
        if (d.stars) { star(ctx, x + w - 50, y + 100, 24, '#ffe53b'); txt('+' + d.stars, x + w - 50, y + 140, 22, '#fff', 'center', 5); }
        if (d.best) txt('New best!', x + 62, y + 100, 17, '#7dff3a', 'center', 4);
        const by = y + h + 6;
        ctx.fillStyle = '#000'; ctx.fillRect(x + 20, by - 12, w - 40, 24);
        ctx.fillStyle = fg; ctx.fillRect(x + 23, by - 9, w - 46, 18);
        ctx.fillStyle = '#35e6e6'; ctx.fillRect(W / 2 - 28, by - 12, 56, 24); ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeRect(W / 2 - 28, by - 12, 56, 24);
        btn(x + 46, by, 34, '#5ad100', ico.retry, () => { music.sfx('click'); startLevel(li, d.practice); });
        btn(x + w - 46, by, 34, '#5ad100', ico.menu, () => { music.sfx('click'); goLevels(); });
      }

      function drawMenu() {
        const hue = (T * 8) % 360, bgc = hslHex(hue, 0.75, 0.5), grc = hslHex(hue, 0.8, 0.38);
        const beat = Math.exp(-((T * 128 / 60) % 1) * 5);
        camX = menuX; camY = -90;
        drawBg(bgc, grc, menuX, -90, beat, 0, 1e9);
        ctx.save(); ctx.translate(((T * 150) % (W + 120)) - 60, sy(menuCube.y)); ctx.rotate(menuCube.r); cubeIcon(ctx, sv.icon, col1(), col2(), 30 * SC); ctx.restore();
        {
          const ls = (narrow ? 50 : 68) * (1 + beat * 0.025), ly = 98 - beat * 2;
          for (let k = 8; k >= 1; k--) drawTxt('GEOMETRY DASH', W / 2, ly + k, ls, '#127a06', 'center', ls * 0.24);
          drawTxt('GEOMETRY DASH', W / 2, ly, ls, null, 'center', ls * 0.2, false, 'lime');
        }
        const y = 232, gap = narrow ? 170 : 200;
        txt('Stars ' + totStars() + '   Coins ' + totCoins(), 14, 20, 16, '#fff', 'left', 4);
        if (!infoOpen) {
          btn(W / 2, y, 74, '#5ad100', r => { ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill(); ico.play(r * 0.95); }, () => { music.sfx('click'); scr = 'levels'; });
          btn(W / 2 - gap, y + 6, 48, '#5ad100', ico.kit, () => { music.sfx('click'); scr = 'kit'; });
          btn(W / 2 + gap, y + 6, 48, '#ffb000', ico.creator, () => { music.sfx('click'); scr = 'cre'; });
          const by = H - 52, bs = narrow ? 70 : 84;
          [['Settings', ico.gear, 'set'], ['Awards', ico.cup, 'ach'], ['Stats', ico.bars, 'stats'], ['Help', ico.info, 'help']].forEach(([n, ic, to], i) => {
            const bx = W / 2 + (i - 1.5) * bs;
            btn(bx, by, 25, '#3b8dff', ic, () => { music.sfx('click'); if (to === 'help') infoOpen = true; else scr = to; });
            txt(n, bx, by + 36, 13, '#fff', 'center', 3.5);
          });
        } else {
          const w = Math.min(560, W - 40);
          ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, 140, w, 262, 18); ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fill();
          const lines = ['Tap / click / Space: jump - hold to keep jumping', 'Ship: hold to rise - Ball: tap to flip gravity', 'UFO: tap to flap - Wave: hold up, release down', 'Robot: hold for a higher jump - Spider: tap to flip', 'Orbs: tap while touching - Pads bounce you', 'P / Esc: pause - Practice: Z place / X remove'];
          lines.forEach((l, i) => txt(l, W / 2, 174 + i * 36, narrow ? 15 : 18, '#fff', 'center', 4, true));
          hits.unshift({ x: W / 2, y: 260, r: 9999, fn: () => { infoOpen = false; } });
        }
      }
      function hslHex(h, s2, l) {
        const f = n => { const k = (n + h / 30) % 12, a = s2 * Math.min(l, 1 - l), c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
        return '#' + f(0) + f(8) + f(4);
      }
      function drawLevels() {
        const d = DEFS[li], r = sv.lv[li], beat = Math.exp(-((T * 128 / 60) % 1) * 5);
        camX = menuX; camY = -90;
        drawBg(d.pal[0][0], d.pal[0][1], menuX * 0.3, -90, beat, -1000, 1e9);
        decor(true); decor(false);
        btn(40, 40, 28, '#5ad100', ico.back, () => { music.sfx('click'); scr = 'menu'; });
        const cw = Math.min(540, W - 180), ch = 128, cx0 = W / 2 - cw / 2, cy0 = 92;
        ctx.beginPath(); ctx.roundRect(cx0, cy0, cw, ch, 20); ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke();
        face(ctx, cx0 + 66, cy0 + ch / 2 - 6, 40, d.diff);
        txt(DIFF[d.diff][0], cx0 + 66, cy0 + ch - 14, 15, '#fff', 'center', 4);
        { let fs0 = narrow ? 34 : 40; const room = cw - 124 - 80, mw = txtRuns(d.name, fs0).tw; if (mw > room) fs0 = Math.floor(fs0 * room / mw); txt(d.name, cx0 + 124, cy0 + ch / 2 - 4, fs0, '#fff', 'left', Math.max(4, fs0 * 0.18)); }
        star(ctx, cx0 + cw - 40, cy0 + ch / 2 - 18, 18, r.d ? '#ffe53b' : '#8a8a8a');
        txt(String(d.stars), cx0 + cw - 40, cy0 + ch / 2 + 18, 24, '#fff', 'center', 5);
        hits.push({ x: W / 2, y: cy0 + ch / 2, r: ch / 2 + 6, w: cw, fn: () => { music.sfx('click'); startLevel(li, false); } });
        for (let i = 0; i < 3; i++) coinIcon(ctx, cx0 + cw - 110 + i * 38, cy0 + ch + 24, 14, (r.c >> i) & 1);
        const bw = Math.min(400, W - 200);
        bar(W / 2 - bw / 2, 290, bw, 26, r.b, '#7dff3a', 'Normal Mode');
        bar(W / 2 - bw / 2, 362, bw, 26, r.pb, '#3bd1ff', 'Practice Mode');
        if (li > 0) arrowBtn(44, 200, -1, () => { music.sfx('click'); li--; sv.li = li; persist(); });
        if (li < NL - 1) arrowBtn(W - 44, 200, 1, () => { music.sfx('click'); li++; sv.li = li; persist(); });
        for (let i = 0; i < NL; i++) { ctx.beginPath(); ctx.arc(W / 2 + (i - (NL - 1) / 2) * 22, H - 20, 6, 0, 7); ctx.fillStyle = i === li ? '#fff' : 'rgba(255,255,255,.35)'; ctx.fill(); }
        if (r.a) txt('Attempts ' + r.a, cx0 + 16, cy0 + ch + 24, 15, '#fff', 'left', 4);
      }
      function lockIcon(X, Y) { ctx.fillStyle = '#ffe53b'; ctx.beginPath(); ctx.roundRect(X - 8, Y - 2, 16, 12, 2); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.beginPath(); ctx.arc(X, Y - 3, 5, Math.PI, 0); ctx.lineWidth = 3; ctx.stroke(); }
      function drawKit() {
        camX = menuX; camY = -90;
        drawBg('#3a2a8a', '#2a1f6a', menuX * 0.3, -90, 0, -1000, 1e9);
        btn(40, 40, 28, '#5ad100', ico.back, () => { music.sfx('click'); scr = 'menu'; persist(); });
        txt('Icon Kit', W / 2, 34, 34, '#fff', 'center', 6);
        const pw = Math.min(580, W - 110), tab = sv.tab, stp = pw / 7.2, KS = [46, 34, 44, 40, 38, 46, 46];
        panel(W / 2 - pw / 2, 62, pw, 84);
        for (let m = 0; m < 7; m++) {
          const X = W / 2 + (m - 3) * stp;
          if (m === tab) { ctx.beginPath(); ctx.roundRect(X - stp / 2 + 2, 66, stp - 4, 76, 12); ctx.fillStyle = 'rgba(125,255,58,.3)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7dff3a'; ctx.stroke(); }
          ctx.save(); ctx.translate(X, 104); vehicle(ctx, m, sv.icon, col1(), col2(), KS[m], T, sv.ic[m], T * 6, m > 4 && Math.floor(T * 0.7) % 2); ctx.restore();
          hits.push({ x: X, y: 104, r: stp / 2, fn: () => { sv.tab = m; persist(); music.sfx('click'); } });
        }
        if (tab === 0) {
          const cell = narrow ? 58 : 62, gx = W / 2 - cell * 4 + cell / 2;
          for (let i = 0; i < 16; i++) {
            const X = gx + (i % 8) * cell, Y = 186 + ((i / 8) | 0) * cell, ok = unlocked(i);
            ctx.beginPath(); ctx.roundRect(X - cell / 2 + 3, Y - cell / 2 + 3, cell - 6, cell - 6, 10); ctx.fillStyle = i === sv.icon ? 'rgba(125,255,58,.35)' : 'rgba(0,0,0,.28)'; ctx.fill();
            if (i === sv.icon) { ctx.lineWidth = 3; ctx.strokeStyle = '#7dff3a'; ctx.stroke(); }
            ctx.save(); ctx.translate(X, Y); ctx.globalAlpha = ok ? 1 : 0.35; cubeIcon(ctx, i, ok ? col1() : '#aaaaaa', ok ? col2() : '#666666', cell * 0.62); ctx.restore();
            if (!ok) lockIcon(X, Y);
            hits.push({ x: X, y: Y, r: cell / 2, fn: () => { if (ok) { sv.icon = i; persist(); music.sfx('click'); } else { const q = ICON_REQ[i]; toast('Unlock: ' + q[1] + (q[0] === 's' ? ' stars' : ' secret coins')); } } });
          }
        } else {
          const cell = narrow ? 70 : 80, gx = W / 2 - cell * 2.5;
          for (let v = 0; v < 6; v++) {
            const X = gx + v * cell, Y = 192, q = FORM_REQ[v], ok = reqOk(q), sel = v === sv.ic[tab];
            ctx.beginPath(); ctx.roundRect(X - cell / 2 + 3, Y - 36, cell - 6, 72, 10); ctx.fillStyle = sel ? 'rgba(125,255,58,.35)' : 'rgba(0,0,0,.28)'; ctx.fill();
            if (sel) { ctx.lineWidth = 3; ctx.strokeStyle = '#7dff3a'; ctx.stroke(); }
            ctx.save(); ctx.translate(X, Y); ctx.globalAlpha = ok ? 1 : 0.35; vehicle(ctx, tab, sv.icon, ok ? col1() : '#aaaaaa', ok ? col2() : '#666666', KS[tab] * (cell / 62), T, v, T * 6, 0); ctx.restore();
            if (!ok) lockIcon(X, Y);
            hits.push({ x: X, y: Y, r: 38, fn: () => { if (ok) { sv.ic[tab] = v; persist(); music.sfx('click'); } else toast('Unlock: ' + q[1] + (q[0] === 's' ? ' stars' : ' secret coins')); } });
          }
          ctx.save(); ctx.translate(W / 2, 270); vehicle(ctx, tab, sv.icon, col1(), col2(), KS[tab] * 1.25, T, sv.ic[tab], T * 7, tab > 4 && Math.floor(T * 0.8) % 2); ctx.restore();
        }
        const sw = narrow ? 36 : 40, cx0 = W / 2 - sw * 7 + sw / 2;
        for (let row = 0; row < 2; row++) {
          const Y = 330 + row * 56, key = row ? 'c2' : 'c1';
          txt(row ? 'Col 2' : 'Col 1', cx0 - sw * 0.9, Y, 15, '#fff', 'right', 4);
          for (let i = 0; i < COLORS.length; i++) {
            const X = cx0 + i * sw;
            ctx.beginPath(); ctx.roundRect(X - sw / 2 + 3, Y - sw / 2 + 3, sw - 6, sw - 6, 7); ctx.fillStyle = COLORS[i]; ctx.fill();
            ctx.lineWidth = sv[key] === i ? 4 : 2.5; ctx.strokeStyle = sv[key] === i ? '#fff' : '#000'; ctx.stroke();
            hits.push({ x: X, y: Y, r: sw / 2, fn: () => { sv[key] = i; persist(); music.sfx('click'); } });
          }
        }
        if (toastT > 0) { ctx.globalAlpha = Math.min(1, toastT * 2); txt(toastMsg, W / 2, H - 22, 20, '#fff', 'center', 5); ctx.globalAlpha = 1; }
      }
      function subBg(title) {
        camX = menuX; camY = -90;
        drawBg('#1f3a8a', '#16286a', menuX * 0.3, -90, 0, -1000, 1e9);
        btn(40, 40, 28, '#5ad100', ico.back, () => { music.sfx('click'); scr = 'menu'; persist(); });
        txt(title, W / 2, 34, 34, '#fff', 'center', 6);
      }
      function drawSettings() {
        subBg('Settings');
        const sw = Math.min(420, W - 160);
        slider(W / 2 - sw / 2, 150, sw, 'm', 'Music');
        slider(W / 2 - sw / 2, 230, sw, 's', 'Effects');
        btn(W / 2, 330, 36, resetT > 0 ? '#ff3c3c' : '#7a7a7a', ico.retry, () => {
          if (resetT > 0) { sv.lv = []; for (let i = 0; i < LV.length; i++) sv.lv[i] = blank(); persist(); resetT = 0; toast('Progress reset'); }
          else resetT = 3;
          music.sfx('click');
        });
        txt(resetT > 0 ? 'Tap again to erase all progress' : 'Reset progress', W / 2, 384, 16, '#fff', 'center', 4);
        if (toastT > 0) { ctx.globalAlpha = Math.min(1, toastT * 2); txt(toastMsg, W / 2, H - 22, 20, '#fff', 'center', 5); ctx.globalAlpha = 1; }
      }
      function progress() {
        const S = { done: 0, stars: totStars(), coins: totCoins(), att: 0, lv: sv.lv.slice(0, NL), icons: 0 };
        for (const r of S.lv) { if (r.d) S.done++; S.att += r.a; }
        for (let i = 0; i < 16; i++) if (unlocked(i)) S.icons++;
        return S;
      }
      function drawStats() {
        subBg('Stats');
        const S = progress(), pw = Math.min(520, W - 80), x0 = W / 2 - pw / 2;
        panel(x0, 66, pw, 128);
        [['Levels completed', S.done + ' / ' + NL], ['Stars', S.stars + ' / ' + STAR_MAX], ['Secret coins', S.coins + ' / ' + COIN_MAX], ['Attempts', S.att]].forEach(([a, b], i) => { txt(a, x0 + 20, 90 + i * 30, 18, '#fff', 'left', 4); txt(String(b), x0 + pw - 20, 90 + i * 30, 18, '#ffe53b', 'right', 4); });
        for (let i = 0; i < NL; i++) {
          const y = 226 + i * 34, r = S.lv[i];
          txt(DEFS[i].name, x0, y, 15, '#fff', 'left', 3.5);
          ctx.beginPath(); ctx.roundRect(x0 + pw * 0.46, y - 9, pw * 0.54 - 56, 18, 9); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke();
          if (r.b > 0) { ctx.beginPath(); ctx.roundRect(x0 + pw * 0.46 + 2, y - 7, Math.max(10, (pw * 0.54 - 60) * r.b / 100), 14, 7); ctx.fillStyle = r.d ? '#ffe53b' : '#7dff3a'; ctx.fill(); }
          txt(r.b + '%', x0 + pw, y, 15, '#fff', 'right', 3.5);
        }
      }
      function drawAch() {
        subBg('Achievements');
        const S = progress(), cw = Math.min(344, (W - 52) / 2), gap = 12, x0 = W / 2 - cw - gap / 2;
        ACH.forEach((a, i) => {
          const ok = a[2](S), X = x0 + (i % 2) * (cw + gap), Y = 66 + ((i / 2) | 0) * 58;
          ctx.globalAlpha = ok ? 1 : 0.5;
          ctx.beginPath(); ctx.roundRect(X, Y, cw, 52, 12); ctx.fillStyle = ok ? 'rgba(255,200,30,.28)' : 'rgba(0,0,0,.4)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ok ? '#ffc21a' : 'rgba(255,255,255,.2)'; ctx.stroke();
          ctx.save(); ctx.translate(X + 26, Y + 26); ctx.scale(0.62, 0.62); ico.cup(30); ctx.restore();
          txt(a[0], X + 54, Y + 17, 16, '#fff', 'left', 4);
          txt(a[1], X + 54, Y + 37, 13, ok ? '#ffe9a0' : '#cfcfcf', 'left', 3, true);
          ctx.globalAlpha = 1;
        });
      }

      const cre = { cx: 0, tool: 0, drag: false };
      const CZ = 34, CRB = H - 62, CROWS = 9;
      function toolIcon(k, X, Y, z) {
        ctx.save(); ctx.translate(X, Y); ctx.lineJoin = 'round';
        const h = z / 2;
        if (k === '#') { ctx.fillStyle = '#000'; ctx.fillRect(-h + 1, -h + 1, z - 2, z - 2); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.strokeRect(-h + 2, -h + 2, z - 4, z - 4); }
        else if (k === '_') { ctx.fillStyle = '#000'; ctx.fillRect(-h + 1, 0, z - 2, h - 1); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.strokeRect(-h + 2, 1, z - 4, h - 3); }
        else if (k === '^' || k === '.') { const t = k === '.' ? 0.15 : -h + 3; ctx.beginPath(); ctx.moveTo(-h + 3, h - 2); ctx.lineTo(0, k === '.' ? 0 : t); ctx.lineTo(h - 3, h - 2); ctx.closePath(); ctx.fillStyle = '#000'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke(); }
        else if (k === 'Y') { ctx.beginPath(); ctx.arc(0, 0, h * 0.62, 0, 7); ctx.fillStyle = '#ffe53b'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, h * 0.85, 0, 7); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); }
        else if (k === 'y') { ctx.beginPath(); ctx.ellipse(0, h - 4, h * 0.7, h * 0.28, 0, Math.PI, 0); ctx.fillStyle = '#ffe53b'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke(); }
        else if (k === '*') { ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = i & 1 ? h * 0.6 : h * 0.88; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = '#111'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, h * 0.18, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); }
        else if (k === '$') coinIcon(ctx, 0, 0, h * 0.7, true);
        else if (k === 'x') { ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(-h * 0.6, -h * 0.6); ctx.lineTo(h * 0.6, h * 0.6); ctx.moveTo(h * 0.6, -h * 0.6); ctx.lineTo(-h * 0.6, h * 0.6); ctx.stroke(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#ff3c3c'; ctx.stroke(); }
        else { const c = PORTAL_COL[k] || '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, h * 0.5, h * 0.92, 0, 0, 7); ctx.fillStyle = c + '66'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke(); txt(k, 0, 1, Math.max(10, z * 0.38), '#fff', 'center', 3, true); }
        ctx.restore();
      }
      function crePaint(p) {
        if (!p || p.y < 56 || p.y > CRB) return;
        const col = Math.floor(p.x / CZ + cre.cx), row = Math.floor((CRB - p.y) / CZ);
        if (col < 0 || row < 0 || row >= CROWS) return;
        const t = CTOOLS[cre.tool], i = sv.cr.findIndex(q => q[1] === col && q[2] === row);
        if (i >= 0) { if (sv.cr[i][0] === t) return; sv.cr.splice(i, 1); }
        if (t !== 'x') { sv.cr.push([t, col, row]); music.sfx('click'); }
      }
      function creDef() {
        const by = {}; let mx = 0;
        for (const [k, c, r] of sv.cr) {
          const cc = c + 6;
          mx = Math.max(mx, cc);
          const tk = '#_^.Yy$'.includes(k) ? k + r : k === '*' ? '*' + r + ',10' : '%' + k + (r + 1.5) + ',1.5,0';
          (by[cc] || (by[cc] = [])).push(tk);
        }
        let cx = 0, map = '';
        for (const c of Object.keys(by).map(Number).sort((a, b) => a - b)) { map += (c - cx) + ' ' + by[c].join('|') + ' '; cx = c + 1; }
        const end = (mx + 14) * U / ((60 / 128) * CFG.SPEED[1]);
        return { name: 'My Level', diff: 0, stars: 0, bpm: 128, end, speeds: [[0, 1]], song: NL + 1, th: [], pal: [['#2a6cff', '#1a46e0']], map };
      }
      function playCre() {
        if (!sv.cr.length) { toast('Place some blocks first'); return; }
        Object.assign(CRD, creDef()); LV[NL] = buildLevel(CRD);
        SONGS[NL + 1].sec = autoSec(LV[NL]);
        for (const o of LV[NL].objs) objById.set(CRD.name + o.id, o);
        startLevel(NL, false);
      }
      function drawCre() {
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2150d8'); g.addColorStop(1, '#0f2a8e');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1; ctx.beginPath();
        const c0 = Math.floor(cre.cx);
        for (let c = c0; c <= c0 + W / CZ + 1; c++) { const X = (c - cre.cx) * CZ; ctx.moveTo(X, 56); ctx.lineTo(X, CRB); }
        for (let r = 0; r <= CROWS; r++) { const Y = CRB - r * CZ; ctx.moveTo(0, Y); ctx.lineTo(W, Y); }
        ctx.stroke();
        ctx.fillStyle = '#0a1c66'; ctx.fillRect(0, CRB, W, H - CRB);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, CRB - 1.5, W, 3);
        for (let c = Math.ceil(cre.cx / 5) * 5; c <= c0 + W / CZ + 1; c += 5) txt(String(c), (c - cre.cx) * CZ + 2, CRB + 12, 11, '#9fb4ff', 'left', 0, true);
        for (const [k, c, r] of sv.cr) {
          const X = (c - cre.cx) * CZ;
          if (X < -CZ || X > W) continue;
          toolIcon(k, X + CZ / 2, CRB - r * CZ - CZ / 2, CZ - 2);
        }
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, 54);
        const ts = Math.min(40, Math.floor((W - 12) / CTOOLS.length)), tx = (W - ts * CTOOLS.length) / 2;
        CTOOLS.forEach((k, i) => {
          const X = tx + i * ts + ts / 2;
          ctx.beginPath(); ctx.roundRect(X - ts / 2 + 1, 6, ts - 2, 42, 7); ctx.fillStyle = i === cre.tool ? 'rgba(125,255,58,.4)' : 'rgba(255,255,255,.08)'; ctx.fill();
          if (i === cre.tool) { ctx.lineWidth = 3; ctx.strokeStyle = '#7dff3a'; ctx.stroke(); }
          toolIcon(k, X, 27, Math.min(ts - 8, 30));
          hits.push({ x: X, y: 27, r: ts / 2, fn: () => { cre.tool = i; music.sfx('click'); } });
        });
        const by = H - 30;
        btn(34, by, 22, '#5ad100', ico.back, () => { music.sfx('click'); scr = 'menu'; persist(); });
        btn(96, by, 20, '#3b8dff', r => ico.back(r), () => { cre.cx = Math.max(0, cre.cx - 6); });
        btn(152, by, 20, '#3b8dff', r => { ctx.scale(-1, 1); ico.back(r); }, () => { cre.cx = Math.min(600, cre.cx + 6); });
        txt('Col ' + Math.round(cre.cx), 214, by, 16, '#fff', 'center', 4, true);
        btn(W - 150, by, 20, creClr > 0 ? '#ff3c3c' : '#7a7a7a', ico.undo, () => { if (creClr > 0) { sv.cr = []; persist(); creClr = 0; } else creClr = 3; music.sfx('click'); });
        txt(creClr > 0 ? 'Tap again' : 'Clear', W - 150, by - 30, 12, '#fff', 'center', 3, true);
        btn(W - 40, by, 24, '#5ad100', ico.play, () => { music.sfx('click'); playCre(); });
        hits.push({ x: W / 2, y: (56 + CRB) / 2, r: (CRB - 56) / 2, w: W, fn: () => { crePaint(lastP); crePaintOn = true; } });
        if (toastT > 0) { ctx.globalAlpha = Math.min(1, toastT * 2); txt(toastMsg, W / 2, H - 70, 20, '#fff', 'center', 5); ctx.globalAlpha = 1; }
      }

      function draw() {
        hits = []; sliders.length = 0;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        if (scr === 'menu') drawMenu();
        else if (scr === 'levels') drawLevels();
        else if (scr === 'kit') drawKit();
        else if (scr === 'set') drawSettings();
        else if (scr === 'ach') drawAch();
        else if (scr === 'stats') drawStats();
        else if (scr === 'cre') drawCre();
        else {
          drawPlay();
          if (scr === 'pause') drawPause();
          if (scr === 'done') drawDone();
        }
      }

      function hitAt(e) {
        const p = toLocal(e);
        lastP = p;
        for (const h of hits) {
          if (h.w ? Math.abs(p.x - h.x) <= h.w / 2 && Math.abs(p.y - h.y) <= h.r : (p.x - h.x) ** 2 + (p.y - h.y) ** 2 <= h.r * h.r) { h.fn(); return true; }
        }
        return false;
      }
      api.on(root, 'pointerdown', e => {
        if (e.button > 0) return;
        e.preventDefault();
        music.init();
        if (scr === 'menu' && !music.on) music.play(MENU, true);
        if (scr === 'play' || scr === 'dead') {
          if (hitAt(e)) return;
          ptrs.add(e.pointerId);
          try { root.setPointerCapture(e.pointerId); } catch (err) {}
          onPress();
          return;
        }
        if (sliderPick(e)) return;
        hitAt(e);
      });
      function sliderSet(p) { const k = sliderDrag; sv.vol[k.k] = Math.max(0, Math.min(1, (p.x - k.x0) / (k.x1 - k.x0))); }
      function sliderPick(e) {
        const p = toLocal(e);
        for (const k of sliders) if (p.x >= k.x0 - 16 && p.x <= k.x1 + 16 && Math.abs(p.y - k.y) <= 20) { sliderDrag = k; sliderSet(p); return true; }
        return false;
      }
      api.on(window, 'pointermove', e => { if (sliderDrag) sliderSet(toLocal(e)); else if (crePaintOn && scr === 'cre') crePaint(toLocal(e)); });
      api.on(window, 'pointerup', () => { if (sliderDrag) { sliderDrag = null; persist(); music.sfx('click'); } if (crePaintOn) { crePaintOn = false; persist(); } });
      const up = e => { if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); onRelease(); };
      api.on(window, 'pointerup', up);
      api.on(window, 'pointercancel', up);
      api.on(window, 'blur', () => { ptrs.clear(); keyHeld = false; onRelease(); });
      const isJump = c => c === 'Space' || c === 'ArrowUp' || c === 'KeyW';
      api.on(window, 'keydown', e => {
        const c = e.code;
        music.init();
        if (scr === 'play' || scr === 'dead') {
          if (isJump(c)) { keyHeld = true; if (!e.repeat) onPress(); return; }
          if ((c === 'KeyP' || c === 'Escape') && scr === 'play') { e.preventDefault(); pause(); return; }
          if (c === 'KeyZ' && !e.repeat) { addCp(false); return; }
          if (c === 'KeyX' && !e.repeat && practice) { cps.pop(); return; }
          return;
        }
        if (e.repeat) return;
        if (scr === 'cre') {
          if (c === 'Escape') { e.preventDefault(); scr = 'menu'; persist(); }
          else if (c === 'ArrowLeft') cre.cx = Math.max(0, cre.cx - 4);
          else if (c === 'ArrowRight') cre.cx = Math.min(600, cre.cx + 4);
          else if (c === 'Enter') playCre();
          return;
        }
        if (scr === 'pause') { if (c === 'KeyP' || c === 'Enter' || c === 'Space' || c === 'Escape') { e.preventDefault(); resume(); } return; }
        if (c === 'Escape' && (scr === 'levels' || scr === 'kit' || scr === 'set' || scr === 'ach' || scr === 'stats')) { e.preventDefault(); scr = 'menu'; persist(); return; }
        if (c === 'Escape' && scr === 'done') { e.preventDefault(); goLevels(); return; }
        if (scr === 'menu') { if (!music.on) music.play(MENU, true); if (c === 'Enter' || c === 'Space') { infoOpen = false; scr = 'levels'; } return; }
        if (scr === 'levels') {
          if (c === 'ArrowLeft' && li > 0) { li--; sv.li = li; persist(); }
          else if (c === 'ArrowRight' && li < NL - 1) { li++; sv.li = li; persist(); }
          else if (c === 'Enter' || c === 'Space') startLevel(li, false);
          return;
        }
        if (scr === 'kit') { if (c === 'Enter' || c === 'Space') scr = 'menu'; return; }
        if (scr === 'done') { if (c === 'Enter' || c === 'Space') goLevels(); else if (c === 'KeyR') startLevel(li, doneInfo.practice); }
      });
      api.on(window, 'keyup', e => { if (isJump(e.code)) { keyHeld = false; onRelease(); } });
      canvas.__rush = { go(n) { scr = n; }, setBot(b, n) { bot = b; botN = n || 4; }, get scr() { return scr; }, get s() { return s; }, get li() { return li; }, sv, start: (i, p) => startLevel(i, p), ff(toggles, upto) { let k = 0; s = newState(L); levelT = 0; scr = 'play'; for (let t = 0; t < upto && scr === 'play'; t++) { while (k < toggles.length && toggles[k] <= t) { if (k % 2 === 0) press(s); else release(s); k++; } levelT += 1 / 240; step(s, L); if (s.ev) events(); if (s.dead) die(); else if (s.win) win(); } camX = Math.min(s.x - PX, L.len + 120 - VW); camY = s.mode ? (s.fl + s.ce) / 2 - VH / 2 : Math.max(-90, s.y - VH * 0.45); flV = s.fl; ceV = s.mode ? s.ce : camY + VH + 80; return { x: s.x, dead: s.dead, win: s.win, scr }; }, pause, kill() { if (scr === 'play') { s.dead = 1; die(); } } };
      api.loop(dt => { update(dt); draw(); });
      return { destroy() { music.close(); } };
    }
  });
  Ameplay.covers['dash-cube'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f72ff"/><stop offset="1" stop-color="#1b3ccf"/></linearGradient><linearGradient id="gr-gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f45e0"/><stop offset="1" stop-color="#0c1f8a"/></linearGradient><linearGradient id="gr-ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><radialGradient id="gr-orb"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#ffe53b"/><stop offset="1" stop-color="#d9a400"/></radialGradient><radialGradient id="gr-glow"><stop offset="0" stop-color="#ffe53b" stop-opacity=".8"/><stop offset="1" stop-color="#ffe53b" stop-opacity="0"/></radialGradient><radialGradient id="gr-pg"><stop offset="0" stop-color="#ff5fd2" stop-opacity=".7"/><stop offset="1" stop-color="#ff5fd2" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#gr-bg)"/><g fill="#fff" opacity=".07"><rect x="-10" y="10" width="92" height="92"/><rect x="186" y="10" width="92" height="92"/><rect x="88" y="108" width="92" height="92"/><rect x="284" y="108" width="92" height="92"/></g><g fill="#000" opacity=".08"><rect x="88" y="10" width="92" height="92"/><rect x="284" y="10" width="92" height="92"/><rect x="-10" y="108" width="92" height="92"/><rect x="186" y="108" width="92" height="92"/></g><ellipse cx="352" cy="150" rx="46" ry="86" fill="url(#gr-pg)"/><ellipse cx="352" cy="160" rx="17" ry="56" fill="#ff5fd2" fill-opacity=".25" stroke="#000" stroke-width="11"/><ellipse cx="352" cy="160" rx="17" ry="56" fill="none" stroke="#ff5fd2" stroke-width="6"/><path d="M332 132l-10 6v44l10 6zM372 132l10 6v44l-10 6z" fill="#c43aa0" stroke="#000" stroke-width="3" stroke-linejoin="round"/><rect y="226" width="400" height="74" fill="url(#gr-gd)"/><path d="M0 263h400M96 226v74M192 226v74M288 226v74" stroke="#000" stroke-opacity=".2" stroke-width="3"/><rect y="223" width="400" height="5" fill="url(#gr-ln)"/><rect y="219" width="400" height="13" fill="url(#gr-ln)" opacity=".25"/><g stroke="#fff" stroke-width="4" stroke-linejoin="round"><rect x="238" y="184" width="42" height="42" fill="#060606"/><rect x="280" y="184" width="42" height="42" fill="#060606"/><rect x="280" y="142" width="42" height="42" fill="#060606"/></g><g fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"><rect x="245" y="191" width="28" height="28"/><rect x="287" y="191" width="28" height="28"/><rect x="287" y="149" width="28" height="28"/></g><g stroke="#fff" stroke-width="4" stroke-linejoin="round" fill="#080808"><path d="M150 226l21-40 21 40z"/><path d="M192 226l21-40 21 40z"/><path d="M291 142l10-20 10 20z"/></g><circle cx="196" cy="110" r="40" fill="url(#gr-glow)"/><circle cx="196" cy="110" r="25" fill="none" stroke="#fff" stroke-width="4" stroke-opacity=".9"/><circle cx="196" cy="110" r="16" fill="url(#gr-orb)" stroke="#000" stroke-width="4"/><path d="M28 196q40-60 82-58" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="10" stroke-linecap="round" stroke-dasharray="1 16"/><g transform="translate(116 124) rotate(28)"><rect x="-27" y="-27" width="54" height="54" rx="4" fill="#000"/><rect x="-23" y="-23" width="46" height="46" rx="3" fill="#7dff00"/><rect x="-20" y="-20" width="40" height="6" fill="#fff" fill-opacity=".35"/><rect x="-13" y="-13" width="26" height="26" rx="2" fill="#00ffff" stroke="#000" stroke-width="3.5"/><rect x="-7.5" y="-6" width="5" height="6.5" fill="#000"/><rect x="2.5" y="-6" width="5" height="6.5" fill="#000"/><rect x="-7.5" y="4" width="15" height="3.4" fill="#000"/></g><g fill="#7dff00"><rect x="64" y="208" width="7" height="7" transform="rotate(20 67 211)"/><rect x="44" y="214" width="5" height="5"/><rect x="82" y="200" width="5" height="5" fill="#00ffff"/></g></svg>`;
})();

