
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
      CORR: [0, 10, 8, 10, 10]
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
      const L = { def, X, len: X(def.end), objs: [], speeds: [], coins: [], trig: [], cols: [], nid: 0, maxW: 0 };
      const add = (o, k) => { o.id = L.nid++; o.k = k; L.objs.push(o); return o; };
      const item = (p, c) => {
        let m = /^%([SCAUWFNMR])(-?\d+(?:\.\d+)?)?(?:,(\d+(?:\.\d+)?))?(?:,(\d+))?$/.exec(p);
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
    const release = s => { s.held = 0; s.buf = 0; s.ring = 0; };
    const half = s => s.mode === 4 ? (s.mini ? CFG.WAVEMINI : CFG.WAVE) / 2 : (s.mini ? CFG.HITMINI : CFG.HIT) / 2;
    const inner = s => s.mode === 4 ? CFG.WAVEINNER / 2 : (s.mini ? CFG.INNERMINI : CFG.INNER) / 2;
    const jumpV = s => CFG.JUMP[s.spd] * (s.mini ? CFG.MINIJ : 1);

    function setMode(s, m, o) {
      const h0 = half(s);
      s.mode = m;
      if (m === 0) { s.fl = 0; s.ce = 1e9; }
      else {
        const H = CFG.CORR[m], f = o.fl != null ? o.fl : Math.max(0, Math.round(o.y / U - H / 2));
        s.fl = f * U; s.ce = (f + H) * U;
      }
      s.y += (half(s) - h0) * s.g;
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
        const m = 'CSAUW'.indexOf(p);
        if (m !== s.mode) s.vy *= 0.5;
        setMode(s, m, o);
      }
    }

    function useOrb(s, o) {
      s.u2 = s.u1; s.u1 = o.id; s.ring = 0; s.jumps++; s.ev |= 2; s.eo = o.id; s.ground = 0;
      const J = CFG.JUMP[s.spd], G = s.g, m = s.mode, c = o.c, flip = c === 'B' || c === 'G';
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
      s.u2 = s.u1; s.u1 = o.id; s.ev |= 4; s.eo = o.id; s.ground = 0;
      const m = s.mode;
      if (m === 4) { if (o.c === 'b') s.g = -s.g; return; }
      let v = CFG.PAD[o.c][m];
      if (s.mini && (m === 0 || m === 2)) v *= CFG.MINIJ;
      s.vy = s.g * v;
      if (o.c === 'b') s.g = -s.g;
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
      if (m === 0 || m === 2) {
        if (s.ground && s.buf) {
          s.ground = 0; s.ring = 0; s.jumps++; s.ev |= 1;
          if (m === 0) s.vy = G * jumpV(s);
          else { s.vy = G * jumpV(s) * CFG.BALLJ; s.g = -G; s.buf = 0; }
        } else {
          s.vy -= G * (m === 0 ? CFG.GRAV[s.spd] : CFG.FLYG * CFG.BALLG) * F;
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
            else if (m !== 0 && s.vy >= 0 && s.y + hs <= o.y0 + snap) { s.y = o.y0 - hs; s.vy = 0; }
          } else {
            if (s.vy >= 0 && s.y + hs <= o.y0 + snap) { s.y = o.y0 - hs; s.vy = 0; s.ground = 1; }
            else if (m !== 0 && s.vy <= 0 && s.y - hs >= o.y1 - snap) { s.y = o.y1 + hs; s.vy = 0; }
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
      name: 'Stereo Madness', diff: 1, stars: 1, bpm: 160, end: 236, speeds: [[0, 1]], song: 0, proof: [8, 6],
      pal: [['#2a6cff', '#1a46e0'], ['#7a2cff', '#4c1cc8'], ['#2a6cff', '#1a46e0'], ['#c42cff', '#8a1cd6'], ['#ff2c6e', '#c81c4a'], ['#ff3a3a', '#b81c1c']],
      map: `~0
        @6 ^ @10 ^ @14 ^x2
        @18 #0x2 ^x2 #0,2x2 ^x2 #0x2
        @24 ^ @26 ^x2 @28.5 ^
        @31 _1x3 2 _2x3 2 _3x3 -13 3 ^x2 3 ^x2 3 ^x3
        ~1 @40 #0x1 ^x3 #0x1
        @44 ^ @45.5 ^x2
        @48 #0,2x3 ^x2 #0,2x3 ^x2 #0,3x3 ^x3
        ~2 @57 #0x1 _2x5|^x5 ^x2
        @62 ^ @63 ^x2 @65 #0x1 #0,2x2
        ~1 @68 %S 6 #0,2x4|^2x4 6 #7,3x4|v6x4 6 #0,3x4|^3x4 6 #6,4x4|v5x4 6 #0,4x4|^4x4 6 #7,3x4|v6x4
        @86 #0,3x20|#7,3x20 -20 3 ^3 4 v6 4 ^3 4 v6
        @93 #5,5x6|v4x6 5 #0,5x6|^5x6 5 #4,6x4|v3x4
        @101 #0,2x6|^2x6 4 #8,2x6 4 #0,3x4|^3x4 5 %C5,5
        ~2 @110 ^ @112 ^x2
        @116 #0x2 1 #0,2x2 1 #0,3x2|$5 ^x3
        @124 ^ @125.5 ^x2
        ~3 @130 #0,1x3 ^x2 #0,2x3 ^x2 #0,1x3
        @138 ^ @139.5 ^ @141 ^x2
        @144 #0x1 ^x3 #0x1 ^x3 #0x1
        ~2 @150 ^x18 -18 _1x4 2 _2x4 2 _1x4 2 _2x4
        @157 #0,2x2 ^x2 #0,2x2
        @161 ^ @162.5 ^x2
        ~3 @167 ^x14 -14 _1x2 2 _2x2 2 _3x2 2 _3x2 #0,4x2 #0,3x2 #0,2x2|$5 #0,1x2 2 .
        ~4 @181 ^ @182.5 ^x2
        @185 #0x3 ^x2 #0,2x3 ^x2 #0,3x3 ^x3
        @193 ^ @194.5 ^x2 @197 #0x1 #0,2x1
        ~5 @200 %S 6 #0,3x4|^3x4 5 #7,3x4|v6x4 5 #0,4x4|^4x4 5 #6,4x4|v5x4 5
        @211.5 #0,3x14|#7,3x14 -14 3 ^3 4 v6 4 ^3
        @217 #0,4x4|^4x4 5 #6,4x4|v5x4 5
        @224 #8,2x12 #6,2x3|v5x3 4 #6,2x3|v5x3 -6 $6 2 6 #0,2x4|^2x4`
    },
    {
      name: 'Skyline Drift', diff: 2, stars: 3, bpm: 128, end: 160, speeds: [[0, 1]], song: 1, proof: [8, 6],
      pal: [['#00a86b', '#00704a'], ['#ff6a00', '#c84a00'], ['#00b4d8', '#0077a8'], ['#9b2cff', '#6a1cc8'], ['#ff2c5a', '#c81c3e'], ['#00a86b', '#00704a']],
      map: `~0
        @8 ^ @10 ^ @12 ^x2 @14 ^ @15 ^x2
        @16 #0x2 ^x6 -4 Y2.5 3 #0x2
        @20 p 1 #0,2x3 ^x2 #0,2x2 ^x3 #0x2
        @24 ^ @25 ^x2 @26 #0x2 ^x5 -3 Y3 2 #0x3 ^
        @29.5 p 2 ^x3
        ~1 @32 %S 7 #0,3x2|^3x2 5 #7,3x2|v6x2 5 #0,4x2|^4x2 5 #6,4x2|v5x2 5 #0,3x3|^3x3 3 $5.5 2 #7,3x2|v6x2
        @42 #0,2x12|#8,2x12 -12 3 ^2x2 4 v7x2
        @47 #0,4x2|^4x2 5 #5,5x2|v4x2 5 #0,4x2|^4x2 5 #5,5x2|v4x2
        @53 #0,3x16|#7,3x16 -16 2 ^3 3 v6 3 ^3 3 v6 3 ^3
        @58.5 #6,4x2|v5x2 5 #0,4x2|^4x2 4 #5,5x8|v4x8 -8 2 %C2
        ~2 @66 ^ @67 ^x2 @68 y 1.5 #0,4x5 ^x3 #0,3x3 6 ^
        @73 #0x2 Y3|^x3 ^x3 #0x2 Y3|^x3 ^x3 #0x2
        @78 p 1 #0,2x2 p2 1 #0,4x3|$5 ^x2 #0,3x2 ^x2 #0,2x2 3 ^
        @84 ^ @85 ^x2 @86 . @87 ^x2
        @88 #0x2 ^x3 #0,2x2 ^x3 #0,3x2 ^x7 -5 Y5 4 #0,3x4 6 ^
        ~3 @96 %S 7 #0,4x2|^4x2 4 #6,4x2|v5x2 4 #0,4x2|^4x2 4 #6,4x2|v5x2 4 #0,5x2|^5x2 4 #5,5x2|v4x2
        @104.5 #0,3x20|#7,3x20 -20 2 ^3x2 3 v6x2 3 ^3x2 3 v6x2 3 ^3x2
        @109.5 #0,2x2|^2x2 3 #0,4x2|^4x2 3 #0,6x2|^6x2 4 #6,4x2|v5x2 3 #4,6x2|v3x2
        @115 #0,5x2|^5x2 4 #5,5x2|v4x2 4 #0,5x2|^5x2 4 #5,5x2|v4x2
        @121 #0,4x10|#7,3x10 -10 2 ^4 3 v6 3 ^4
        @125 #5,5x8|v4x8 -8 2 %C2
        ~4 @130 ^ @131 ^x2 @132 #0x3 ^x2 #0,2x3 ^x2 #0x3
        @137 y 1.5 #0,4x6 ^ ^|$6 ^ #0,4x3 6 ^ @143 ^x2
        ~5 @145 #0x2 Y3|^x3 ^x2 #0,2x3 4 ^
        @150 ^ @152 ^x2 @154 ^ @156 ^`
    },
    {
      name: 'Gravity Bounce', diff: 3, stars: 5, bpm: 136, end: 184, speeds: [[0, 1], [128, 2], [160, 1]], song: 2, proof: [6, 4],
      pal: [['#ff7a00', '#c85a00'], ['#ff2c6e', '#c81c4e'], ['#7a2cff', '#521cc8'], ['#00b894', '#007a62'], ['#ff2c2c', '#c81c1c'], ['#ffb300', '#c88600']],
      map: `~0
        @8 ^ @10 ^x2 @12 ^ @13 ^x2
        @14 b|#5,2x24 -23 ^x22 -18 v4x2 6 v4x3 4 v4x2 1 %N3.5 3
        @25 ^ @26 ^x2 @27 #0x2 B3|#5,2x14 -13 ^x11 -7 v4x2 5 b4,1 6 #0x2
        ~1 @34 %A 6 ^x2 4 v7x2 4 ^x2 4 v7x3 4 ^x3 4 v7x2 3 ^x2
        @44.2 #0,2x8|#6,2x8 -8 3 ^2x2 3 v5x2 #0,3x2|^3x2 3 #5,3x2|v4x2 3 ^x3 3 v7x3
        @53 #3,2x6 -6 ^5x2 2 v2x2 2 ^5x2 4 ^x2 3 v7x2 3 ^x2 3 v7x2 $4
        @61 ^x3 3 v7x3 3 %C4,4
        ~2 @66 ^ @67 ^x2 @68 %M2,2.5 3 ^ 3 ^x2 3 ^ 2 ^x2
        @72 #0x2 G2.5|#4,1x8 -7 ^x4 -1 b3,1 5 #0x2
        @76 ^x2 2 ^x2 @78 #0x3 B2.5|#5,1x10 -9 ^x7 -5 v4x2 3 b4,1 3 #0x3 %R2.5,2.5
        @85 ^ @86 ^x2 @87 ^ @88 #0x2 Y3|^x3 ^x3 #0x2 P2.5|^x2 ^x2 #0x2 $3
        ~3 @94 %U2,2.5 6 #0,3x2|^3x2 4 #7,3x2|v6x2 4 #0,4x2|^4x2 4 #6,4x2|v5x2 4 #0,3x3|^3x3 4
        @103 #0,2x14|#8,2x14 -14 2 ^2x2 4 v7x2 4 ^2x2
        @108 #0,5x2|^5x2 5 #6,4x2|v5x2 5 #0,5x2|^5x2 3 $7 2 #6,4x2|v5x2
        @116 #0,3x12|#7,3x12 -12 3 ^3 3 v6 3 ^3
        @122 #0,4x2|^4x2 4 #5,5x2|v4x2 4 %A5,5,0
        ~4 @129 ^x2 4 v7x2 4 ^x3 4 v7x3 3 ^x2
        @137 #0,2x10|#6,2x10 -10 2 ^2x2 4 v5x2 2 ^x2 4 v7x2 4 ^x3
        @146 #3,2x5 -5 ^5x2 1 v2x2 4 ^x2 3 v7x2 3 ^x2 4 v7x3
        @155 ^x2 4 %C4,4
        ~5 @162 ^ @163 ^x2 @164 b|#5,2x16 -15 ^x14 -10 v4x2 5 v4x2 1 %N3.5 3
        @172 ^ @173 ^x2 @174 ^ @176 ^x2 @178 ^`
    },
    {
      name: 'Voltage Wave', diff: 4, stars: 7, bpm: 145, end: 208, speeds: [[0, 1], [8, 2], [32, 1], [64, 0], [80, 2], [144, 3], [176, 1]], song: 3, proof: [6, 4],
      pal: [['#ff2cdc', '#b81ca0'], ['#2c8cff', '#1c5ec8'], ['#00e5ff', '#00a0c8'], ['#5a2cff', '#3a1cb8'], ['#ff8a00', '#c86400'], ['#ff2c4a', '#c81c34']],
      map: `~0
        @6 ^ @9 ^x2 @11 ^ @12 ^x2 @14 #0x3 ^x3 #0x3
        @18 ^ @19 ^x2 @20 #0x2 #0,2x2 ^x4 #0,2x2 @24 ^x2 @25 ^ @26 ^x2 @28 ^ @29 ^x2
        ~1 @32 %W2,2.5 6 #0,3x3 4 #7,3x3 4 #0,4x3 4 #6,4x3 4 #0,3x3 3 *6,15 4 #7,3x3 3 *3,15
        @45 #0,3x10|#7,3x10 -10 *5,12 6 *5,12 4 #0,4x3 4 #6,4x3 4 #0,4x3 3 $6
        @53 #0,4x6|#6,4x6 2 #0,2x6|#4,6x6 2 #0,4x6|#6,4x6 2 #0,6x6|#8,2x6
        @60 #0,4x4|#7,3x4 4 %C5,5
        ~2 @66 Y2.5 3 Y3.5 3 ^x2 @70 #0x2 ^ P3|^ ^ #0x2 ^ Y3.5|^x2 ^ #0x2
        @75 #0,2x3 G4|#6,1x9 -8 ^x4 1 v5x2 %N5 4 #0x2 4 ^
        ~3 @82 %S2,2.5 6 *2,15 5 *8,15 5 #0,4x2|^4x2 *8,12 5 #6,4x2|v5x2 *1.5,12 5 #0,5x2|^5x2 5 *7,15
        @94 #0,3x12|#7,3x12 -12 2 *5,10 5 *5,10 5 #0,4x2|^4x2 4 #5,5x2|v4x2 3 $0.5
        @104 *2.5,15 4 *7.5,15 4 *2.5,15 4 *7.5,15 4 #0,4x3|#6,4x3 -3 4 %W5,5,0
        ~4 @116 #0,3x3 3 #7,3x3 3 #0,3x3 3 #7,3x3 3 %M5,5 3 #0,4x2 2 #6,4x2 2 #0,4x2 2 #6,4x2 2 #0,4x2
        @128 #0,4x8|#6,4x8 2 #0,3x8|#5,5x8 2 #0,5x8|#7,3x8 2 %R5,5 #0,4x4|#7,3x4 4 $5 4 %C5,5
        ~5 @146 ^ @147 ^x2 @148 #0x2 ^x3 #0,2x2 ^x3 #0,2x3 Y5|^x3 ^x4 #0,2x2 4 ^
        @156 ^ @157 ^ @158 ^x2 @160 y 1.5 #0,4x6 ^x4 #0,3x4 6 ^ @166 ^x2
        ~1 @168 ^ @169 ^x2 @170 ^ @171 . @172 ^x2
        @176 %W2,2.5 6 #0,4x3 3 #6,4x3 3 #0,4x3 3 #6,4x3 3 *5,12 5 #0,3x3 3 #7,3x3 3 %C5,5
        @200 ^ @202 ^x2`
    }
  ];
  const SCALES = { min: [0, 2, 3, 5, 7, 8, 10], maj: [0, 2, 4, 5, 7, 9, 11], dor: [0, 2, 3, 5, 7, 9, 10] };
  const SONGS = [
    { bpm: 160, root: 57, sc: 'min', prog: [0, 5, 3, 4], lw: 'square', sec: [[2, 'pa'], [6, 'khbpac'], [8, 'khsbpl'], [1, 'paSr'], [10, 'khsBpLc'], [8, 'khsbplc'], [8, 'khsBpl'], [6, 'khsbpL'], [1, 'paSr'], [8, 'khsBpLc'], [1, 'pac']],
      l: '0.4.7.4.9.7.4.2.0.4.7.9.b-9.7...', L: '7.7.9.7.6.4.2.4.7.7.9.a.b-a.9.7.' },
    { bpm: 128, root: 50, sc: 'dor', prog: [0, 6, 5, 6], lw: 'sawtooth', sec: [[2, 'pa'], [6, 'khbpa'], [8, 'khsBpLc'], [4, 'khbpl'], [3, 'khsbpl'], [1, 'paSr'], [8, 'khsBpLc'], [8, 'khsbplc']],
      l: '4-.4.6.7-.6.4.2.4-.4.6.7.9-.7.6.', L: '9.7.9.b.9.7.6.4.6.7.9.7.6-4-2-..' },
    { bpm: 136, root: 52, sc: 'min', prog: [0, 3, 5, 4], lw: 'square', sec: [[2, 'pa'], [6, 'khbpa'], [8, 'khsBpLc'], [6, 'khsbpl'], [2, 'paSr'], [8, 'khsBplc'], [8, 'khsBpLc'], [6, 'khsbpac']],
      l: '0.0.7.0.6.0.4.0.0.0.7.0.9.7.6.4.', L: 'b.a.9.7.9.7.6.4.6.4.2.4.6-7-....' },
    { bpm: 145, root: 54, sc: 'min', prog: [0, 5, 2, 6], lw: 'sawtooth', sec: [[2, 'pa'], [6, 'khsbpa'], [8, 'khsBpLc'], [4, 'Kpa'], [8, 'khsBplc'], [8, 'khsBpLc'], [8, 'khsBplc'], [6, 'khsBpLc'], [2, 'pac']],
      l: '7.9.7.4.7.9.b.9.7.9.7.4.2.4.6.4.', L: 'e.c.b.9.b.9.7.6.7.6.4.2.4-.6-.7.' },
    { bpm: 110, root: 60, sc: 'maj', prog: [0, 4, 5, 3], lw: 'triangle', sec: [[8, 'Khpal'], [8, 'KhpaL']],
      l: '4..2..0.2..4..7.6..4..2.4..2..0.', L: '7..9..7.6..4..2.4..6..4.2..0....' },
    { bpm: 128, root: 55, sc: 'maj', prog: [0, 3, 4, 3], lw: 'square', sec: [[8, 'khbpl'], [8, 'khbpLa']],
      l: '0.4.7.4.0.4.7.9.7.6.4.2.4.2.0...', L: '9.7.9.b.9.7.6.7.6.4.2.4.2.0.-...' }
  ];

  function makeAudio(api) {
    let ac = null, out = null, noise = null, dly = null, bus = null;
    let song = null, secMap = [], step = 0, nextT = 0, d16 = 0.1, playing = false, looping = false, cur = -1;
    const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
    const init = () => {
      if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return true; }
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        const comp = ac.createDynamicsCompressor();
        comp.threshold.value = -14; comp.ratio.value = 5;
        out = ac.createGain(); out.gain.value = 0.75; out.connect(comp); comp.connect(ac.destination);
        noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        dly = ac.createDelay(1.5);
        const fb = ac.createGain(), wet = ac.createGain();
        fb.gain.value = 0.32; wet.gain.value = 0.2;
        dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(out);
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
      play(idx, loop) {
        if (!init()) return;
        A.stop();
        cur = idx; song = SONGS[idx]; looping = !!loop; secMap = [];
        let st = 0;
        for (const [bars, f] of song.sec) { const o = { bars, f, start: st }; for (let i = 0; i < bars; i++) secMap.push(o); st += bars; }
        d16 = 60 / song.bpm / 4; step = 0;
        try { dly.delayTime.setValueAtTime(d16 * 3, ac.currentTime); } catch (e) {}
        A.resume();
      },
      resume() {
        if (!ac || !song) return;
        bus = ac.createGain(); bus.gain.value = 1; bus.connect(out);
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
        out.gain.value = m ? 0 : 0.75;
        if (!playing || !bus || ac.state !== 'running') return;
        const now = ac.currentTime;
        if (nextT < now - 0.25) { const k = Math.ceil((now - nextT) / d16); step += k; nextT += k * d16; }
        while (playing && nextT < now + 0.12) { if (!m) playStep(step, nextT); step++; nextT += d16; }
      },
      sfx(n) {
        if (api.muted || !init() || ac.state !== 'running') return;
        const t = ac.currentTime + 0.005;
        if (n === 'die') { hiss(t, 0.5, 0.55, 2600, 'lowpass', out, 160); tone('square', 240, t, 0.3, 0.1, out, 45, 1600); }
        else if (n === 'coin') { tone('sine', 1320, t, 0.12, 0.16, out); tone('sine', 1760, t + 0.08, 0.3, 0.14, out); }
        else if (n === 'click') tone('sine', 620, t, 0.07, 0.13, out, 980);
        else if (n === 'cp') { tone('triangle', 784, t, 0.09, 0.15, out); tone('triangle', 1175, t + 0.06, 0.14, 0.13, out); }
        else if (n === 'win') { [0, 4, 7, 12, 16, 19, 24].forEach((k, i) => tone('square', mtof(67 + k), t + i * 0.07, 0.35, 0.06, out, 0, 3200)); hiss(t + 0.45, 1.2, 0.14, 4500, 'highpass', out); }
        else if (n === 'best') [0, 7, 12].forEach((k, i) => tone('triangle', mtof(76 + k), t + i * 0.08, 0.25, 0.12, out));
        else if (n === 'portal') hiss(t, 0.25, 0.08, 900, 'bandpass', out, 4000);
      },
      close() { playing = false; if (ac) { try { ac.close(); } catch (e) {} ac = null; } }
    };
    return A;
  }

  const FONT = 'Nunito, system-ui, sans-serif';
  const COLORS = ['#7dff00', '#00ff7d', '#00ffff', '#00b4ff', '#3c64ff', '#8c3cff', '#ff3cff', '#ff3c8c', '#ff3c3c', '#ff8c00', '#ffe600', '#ffffff', '#9a9a9a', '#3a3a3a'];
  const ICON_REQ = [0, 0, 0, 0, 0, 0, 0, 0, ['s', 1], ['s', 4], ['s', 9], ['s', 16], ['c', 1], ['c', 3], ['c', 6], ['c', 9]];
  const DIFF = [['Auto', '#c0c0c0'], ['Easy', '#3ca8ff'], ['Normal', '#3cd860'], ['Hard', '#ffb000'], ['Harder', '#ff4a3a'], ['Insane', '#ff4ad8']];
  const PORTAL_COL = { C: '#4dff6a', S: '#ff5fd2', A: '#ff5a3c', U: '#ffa53b', W: '#3bc8ff', F: '#ffe53b', N: '#3bd1ff', M: '#ff4de1', R: '#4dff6a' };
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
    const box = (a, b, w, hh, col) => { rr(a, b, w, hh, s * 0.03); const bg = x.createLinearGradient(a, b, a, b + hh); bg.addColorStop(0, shade(col, 0.3)); bg.addColorStop(0.55, col); bg.addColorStop(1, shade(col, -0.3)); x.fillStyle = col.length === 7 && col !== K ? bg : col; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke(); };
    const eye = (a, b, w, hh) => { x.fillStyle = K; x.fillRect(a, b, w, hh); };
    const tri = (pts, col) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0] * h, p[1] * h) : x.moveTo(p[0] * h, p[1] * h)); x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke(); };
    const k = s / 30;
    switch (idx) {
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

  function vehicle(x, mode, idx, c1, c2, s, t) {
    const K = '#000', lw = Math.max(1.5, s * 0.07);
    x.lineJoin = 'round';
    const path = (pts, col) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0] * s, p[1] * s) : x.moveTo(p[0] * s, p[1] * s)); x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = lw; x.strokeStyle = K; x.stroke(); };
    if (mode === 0) { cubeIcon(x, idx, c1, c2, s); return; }
    if (mode === 1) {
      const fl = 0.16 + 0.06 * Math.sin((t || 0) * 40);
      x.beginPath(); x.moveTo(-0.7 * s, 0.1 * s); x.lineTo(-(0.95 + fl) * s, 0.2 * s); x.lineTo(-0.7 * s, 0.3 * s); x.closePath(); x.fillStyle = '#ff9a1f'; x.fill();
      x.beginPath(); x.moveTo(-0.7 * s, 0.15 * s); x.lineTo(-(0.82 + fl * 0.7) * s, 0.2 * s); x.lineTo(-0.7 * s, 0.25 * s); x.closePath(); x.fillStyle = '#fff3a0'; x.fill();
      x.save(); x.translate(-0.08 * s, -0.22 * s); cubeIcon(x, idx, c1, c2, s * 0.5); x.restore();
      path([[-0.62, -0.02], [0.32, -0.02], [0.66, 0.12], [0.36, 0.32], [-0.5, 0.32], [-0.72, 0.18]], c1);
      x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(-0.5 * s, 0.0); x.lineTo(0.3 * s, 0.0); x.lineTo(0.4 * s, 0.05 * s); x.lineTo(-0.5 * s, 0.05 * s); x.fill();
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-0.45 * s, 0.26 * s, 0.8 * s, 0.05 * s);
      path([[-0.66, -0.02], [-0.42, -0.02], [-0.56, -0.34], [-0.76, -0.3]], c2);
      path([[-0.2, 0.12], [0.36, 0.12], [0.2, 0.24], [-0.26, 0.24]], c2);
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(-0.5 * s, 0.02 * s, 0.7 * s, 0.05 * s);
      return;
    }
    if (mode === 2) {
      x.beginPath(); x.arc(0, 0, s * 0.5, 0, 7); x.fillStyle = K; x.fill();
      x.beginPath(); x.arc(0, 0, s * 0.5 - lw, 0, 7); x.fillStyle = c1; x.fill();
      for (let i = 0; i < 2; i++) { x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, s * 0.36, i * Math.PI, i * Math.PI + Math.PI / 2); x.closePath(); x.fillStyle = c2; x.fill(); x.lineWidth = lw * 0.7; x.strokeStyle = K; x.stroke(); }
      x.beginPath(); x.arc(0, 0, s * 0.12, 0, 7); x.fillStyle = K; x.fill();
      x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(-s * 0.18, -s * 0.2, s * 0.08, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = lw * 0.6; x.beginPath(); x.arc(0, 0, s * 0.42, Math.PI * 0.9, Math.PI * 1.4); x.stroke();
      x.fillStyle = 'rgba(0,0,0,.2)'; x.beginPath(); x.arc(0, 0, s * 0.46, 0.1, 1.3); x.arc(0, 0, s * 0.36, 1.3, 0.1, true); x.fill();
      return;
    }
    if (mode === 3) {
      x.beginPath(); x.ellipse(0, -0.06 * s, 0.3 * s, 0.32 * s, 0, Math.PI, 0); x.fillStyle = 'rgba(190,240,255,.35)'; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = K; x.stroke();
      x.save(); x.translate(0, -0.15 * s); cubeIcon(x, idx, c1, c2, s * 0.36); x.restore();
      x.beginPath(); x.ellipse(0, 0.08 * s, 0.62 * s, 0.2 * s, 0, 0, 7); x.fillStyle = c1; x.fill(); x.lineWidth = lw; x.strokeStyle = K; x.stroke();
      x.fillStyle = c2; x.fillRect(-0.5 * s, 0.06 * s, s, 0.07 * s);
      x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.ellipse(-0.18 * s, 0.01 * s, 0.22 * s, 0.045 * s, -0.2, 0, 7); x.fill();
      x.fillStyle = 'rgba(0,0,0,.22)'; x.beginPath(); x.ellipse(0, 0.14 * s, 0.56 * s, 0.1 * s, 0, 0, Math.PI); x.fill();
      x.fillStyle = Math.sin(t * 8) > 0 ? '#fff' : c2;
      for (let i = -2; i <= 2; i++) { x.beginPath(); x.arc(i * 0.2 * s, 0.2 * s, 0.035 * s, 0, 7); x.fill(); }
      return;
    }
    path([[0.5, 0], [-0.42, -0.42], [-0.2, 0], [-0.42, 0.42]], c1);
    path([[0.22, 0], [-0.22, -0.2], [-0.1, 0], [-0.22, 0.2]], c2);
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
    blurb: 'Jump, fly and flip to the beat through four neon rhythm levels.',
    help: '<kbd>Space</kbd> <kbd>↑</kbd> <kbd>W</kbd> or click / tap to jump, hold to fly · <kbd>P</kbd> pause · practice: <kbd>Z</kbd> place / <kbd>X</kbd> remove checkpoint',
    better: 'high',
    format: v => v + '%',
    width: 960,
    ownPause: true,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-20 22 28)"><rect x="10" y="16" width="24" height="24" rx="2"/><rect x="16" y="22" width="12" height="12" rx="1"/></g><path d="M36 52l7-13 7 13zM48 52l5-9 5 9zM4 52h56"/><path d="M2 26h5M2 34h8" opacity=".6"/></svg>',
    css: '.gm-dash-cube{touch-action:none}.gm-dash-cube .g-canvas{background:#1a3fd6}',
    mount(root, api) {
      const SIM = rushSim(), { CFG, buildLevel, newState, press, release, step, half } = SIM;
      const U = CFG.U;
      const LV = LEVEL_DEFS.map(buildLevel);
      const narrow = (root.clientWidth || 800) < 640;
      const W = narrow ? 600 : 800, H = 450, SC = 1.4, VW = W / SC, VH = H / SC, PX = VW / 2 - 75, BL = U * SC;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      root.style.touchAction = 'none';
      const music = makeAudio(api);
      const DPR = Math.min(2, window.devicePixelRatio || 1);
      const blank = () => ({ b: 0, pb: 0, a: 0, j: 0, c: 0, d: 0 });
      const sv = Object.assign({ lv: [], icon: 0, c1: 0, c2: 2, li: 0 }, api.load() || {});
      for (let i = 0; i < LV.length; i++) sv.lv[i] = Object.assign(blank(), sv.lv[i] || {});
      sv.li = Math.max(0, Math.min(LV.length - 1, sv.li | 0));
      if (!(sv.icon >= 0 && sv.icon < 16)) sv.icon = 0;
      const persist = () => api.save(sv);
      const totStars = () => sv.lv.reduce((a, r, i) => a + (r.d ? LEVEL_DEFS[i].stars : 0), 0);
      const totCoins = () => sv.lv.reduce((a, r) => a + ((r.c & 1) + ((r.c >> 1) & 1) + ((r.c >> 2) & 1)), 0);
      const unlocked = i => { const q = ICON_REQ[i]; return !q || (q[0] === 's' ? totStars() : totCoins()) >= q[1]; };
      const col1 = () => COLORS[sv.c1] || COLORS[0], col2 = () => COLORS[sv.c2] || COLORS[2];

      const spr = (w, h, fn) => { const c = document.createElement('canvas'); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR); const x = c.getContext('2d'); x.scale(DPR, DPR); fn(x); return c; };
      const tileSpr = (hh) => spr(BL, BL * hh, x => {
        const h = BL * hh;
        x.fillStyle = 'rgba(0,0,0,.88)'; x.fillRect(0, 0, BL, h);
        const g = x.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(0.5, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.fillRect(0, 0, BL, h);
        const rg = x.createRadialGradient(BL / 2, h / 2, 2, BL / 2, h / 2, BL * 0.6); rg.addColorStop(0, 'rgba(255,255,255,.1)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = rg; x.fillRect(0, 0, BL, h);
        x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 1.2; x.strokeRect(5.5, 5.5, BL - 11, Math.max(2, h - 11));
        x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(6.5, h - 5.5); x.lineTo(BL - 5.5, h - 5.5); x.lineTo(BL - 5.5, 6.5); x.stroke();
        x.strokeStyle = 'rgba(255,255,255,.09)'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, BL - 1, h - 1);
        x.fillStyle = 'rgba(255,255,255,.26)'; x.fillRect(1, 1, BL - 2, 1.5);
        x.fillStyle = 'rgba(255,255,255,.22)'; for (const [qx, qy] of [[2, 2], [BL - 5, 2], [2, h - 5], [BL - 5, h - 5]]) x.fillRect(qx, qy, 3, 3);
      });
      const TILE = tileSpr(1), SLAB = tileSpr(0.5);
      const spikeSpr = small => spr(BL, BL, x => {
        const h = small ? BL * 0.47 : BL, y0 = BL;
        x.beginPath(); x.moveTo(2, y0); x.lineTo(BL / 2, y0 - h + 1.5); x.lineTo(BL - 2, y0); x.closePath();
        const g = x.createLinearGradient(0, y0 - h, 0, y0);
        g.addColorStop(0, '#3a3a3a'); g.addColorStop(0.5, '#111'); g.addColorStop(1, '#000');
        x.fillStyle = g; x.fill();
        x.save(); x.shadowColor = 'rgba(255,255,255,.55)'; x.shadowBlur = 6; x.lineJoin = 'round'; x.lineWidth = 2.2; x.strokeStyle = '#fff'; x.stroke(); x.restore();
        x.lineJoin = 'round'; x.lineWidth = 2.2; x.strokeStyle = '#fff'; x.stroke();
        x.beginPath(); x.moveTo(BL * 0.3, y0 - 2); x.lineTo(BL / 2, y0 - h * 0.62); x.lineTo(BL * 0.7, y0 - 2); x.closePath();
        x.fillStyle = 'rgba(255,255,255,.12)'; x.fill();
        x.beginPath(); x.moveTo(BL / 2, y0 - h + 4); x.lineTo(BL * 0.3, y0 - 2); x.lineTo(BL * 0.42, y0 - 2); x.closePath();
        x.fillStyle = 'rgba(255,255,255,.2)'; x.fill();
        x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(2, y0 - 2.4, BL - 4, 1.4);
      });
      const SPK = spikeSpr(false), SPKS = spikeSpr(true);
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
      const objById = new Map();
      for (const l of LV) for (const o of l.objs) objById.set(l.def.name + o.id, o);
      const toast = m => { toastMsg = m; toastT = 2.2; };
      const pct = () => s && L ? Math.max(0, Math.min(100, Math.floor(s.x / L.len * 100))) : 0;
      const sx = x => (x - camX) * SC, sy = y => H - (y - camY) * SC;

      function palAt(x) {
        const tr = L ? L.trig : null, pal = L ? L.def.pal : null;
        if (!tr || !tr.length) return pal ? pal[0] : ['#2a5cff', '#1a3fd6'];
        let i = -1;
        for (let k = 0; k < tr.length; k++) if (tr[k].x <= x) i = k;
        if (i < 0) return pal[tr[0].c] || pal[0];
        const cur = pal[tr[i].c] || pal[0], prev = i > 0 ? pal[tr[i - 1].c] || pal[0] : cur;
        const f = Math.min(1, (x - tr[i].x) / 160);
        return f >= 1 ? cur : [mixHex(prev[0], cur[0], f), mixHex(prev[1], cur[1], f)];
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
        if (practice) { if (music.cur !== 4) music.play(4, true); }
        else music.play(LEVEL_DEFS[li].song, false);
        if (inputHeld) press(s);
        shownPct = pct(); api.score(shownPct);
      }
      function die() {
        scr = 'dead'; deadT = 0; shake = 12; flash = 0.5;
        music.sfx('die');
        if (!practice) music.stop();
        const x = s.x, y = s.y, c1 = col1(), c2 = col2();
        for (let i = 0; i < 24; i++) { const a = rnd(0, 6.3), v = rnd(60, 380); emit(x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(0.4, 0.9), rnd(4, 9), i % 3 ? c1 : c2, -500, 0); }
        for (let i = 0; i < 9; i++) { const a = rnd(0, 6.3), v = rnd(80, 240); emit(x + ((i % 3) - 1) * 9, y + (((i / 3) | 0) - 1) * 9, Math.cos(a) * v, Math.sin(a) * v + 120, rnd(0.6, 1), 10, i & 1 ? c1 : '#000', -700, 0); }
        emit(x, y, 0, 0, 0.45, 70, '#ffffff', 0, 2);
        emit(x, y, 0, 0, 0.3, 40, c1, 0, 2);
        const p = pct(), r = sv.lv[li];
        if (!practice) {
          if (p > r.b) { r.b = p; newBest = { p, t: 0 }; music.sfx('best'); }
          persist();
          if (p > 0) api.submit(p);
        } else if (p > r.pb) { r.pb = p; persist(); }
      }
      function win() {
        scr = 'win'; winT = 0;
        const r = sv.lv[li], first = !r.d;
        doneInfo = { att: attempts, jumps, time: playTime, coins: practice ? 0 : s.coins, stars: !practice && first ? LEVEL_DEFS[li].stars : 0, practice, best: false };
        if (!practice) {
          r.b = 100; r.d = 1; r.c |= s.coins; persist();
          doneInfo.best = api.submit(100);
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
        else { practice = true; cps = []; music.play(4, true); scr = 'play'; acc = 0; }
      }
      function goLevels() { scr = 'levels'; music.stop(); music.play(5, true); release(s || {}); }

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
        if (scr === 'play') {
          acc += dt; playTime += dt;
          while (acc >= 1 / 240) {
            acc -= 1 / 240; levelT += 1 / 240;
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
            music.stop(); music.sfx('win'); flash = 1; shake = 6;
            for (let i = 0; i < 70; i++) { const a = rnd(0, 6.3), v = rnd(100, 520); emit(s.x, s.y, Math.cos(a) * v, Math.sin(a) * v, rnd(0.6, 1.4), rnd(4, 10), ['#fff', col1(), col2(), '#ffe53b'][i % 4], -200, i % 5 ? 0 : 1); }
            emit(s.x, s.y, 0, 0, 0.7, 160, '#ffffff', 0, 2);
          }
          if (winT > 0.8 && Math.random() < dt * 5) { const fx0 = camX + rnd(0.2, 0.8) * VW, fy = camY + rnd(0.45, 0.85) * VH, c = ['#ffe53b', '#ff5fd2', '#3bd1ff', '#43ff5a'][(Math.random() * 4) | 0]; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; emit(fx0, fy, Math.cos(a) * 160, Math.sin(a) * 160, 0.9, 5, c, -120, 1); } }
          if (winT > 2.6) scr = 'done';
        }
        if (scr === 'done' && Math.random() < dt * 3) { const fx0 = camX + rnd(0.1, 0.9) * VW, fy = camY + rnd(0.5, 0.9) * VH, c = ['#ffe53b', '#ff5fd2', '#3bd1ff', '#43ff5a'][(Math.random() * 4) | 0]; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28; emit(fx0, fy, Math.cos(a) * 140, Math.sin(a) * 140, 0.9, 4, c, -120, 1); } }
        if (s && (scr === 'play' || scr === 'dead')) camera(dt);
        if (scr === 'menu' || scr === 'levels' || scr === 'kit') menuTick(dt);
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
        if ((e & 32) && s.mode === 0) for (let i = 0; i < 5; i++) emit(s.x - 10 + rnd(0, 20), s.y - s.g * half(s), rnd(-60, 30), s.g * rnd(20, 80), 0.3, 3.5, 'rgba(255,255,255,.8)', -s.g * 300, 0);
      }
      function fx(dt) {
        const hs = half(s), c1 = col1(), c2 = col2();
        if (s.mode === 0 && s.ground && Math.random() < dt * 30) emit(s.x - hs, s.y - s.g * hs, rnd(-80, -20), s.g * rnd(10, 60), 0.3, rnd(2.5, 4.5), c1, 0, 0);
        if (s.mode === 1 && Math.random() < dt * 50) emit(s.x - hs * 0.9, s.y - s.g * hs * 0.2, rnd(-160, -60), rnd(-30, 30), 0.35, rnd(3, 6), Math.random() < 0.5 ? '#ffd23f' : '#ff7a2a', 0, 1);
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

      function txt(str, x, y, size, fill, align, lw) {
        ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round'; ctx.lineWidth = lw != null ? lw : Math.max(3, size * 0.2); ctx.strokeStyle = '#000';
        if (ctx.lineWidth > 0) ctx.strokeText(str, x, y);
        ctx.fillStyle = fill || '#fff'; ctx.fillText(str, x, y);
      }
      function goldTxt(str, x, y, size) {
        ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = size * 0.26; ctx.strokeStyle = '#000'; ctx.strokeText(str, x, y + size * 0.06);
        const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
        g.addColorStop(0, '#fff7a8'); g.addColorStop(0.45, '#ffd21e'); g.addColorStop(1, '#ff8a00');
        ctx.fillStyle = g; ctx.fillText(str, x, y);
      }
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
        kit: r => { ctx.save(); ctx.rotate(-0.12); cubeIcon(ctx, sv.icon, col1(), col2(), r * 0.95); ctx.restore(); }
      };
      function arrowBtn(x, y, dir, fn) {
        ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
        ctx.beginPath(); ctx.moveTo(-18, -44); ctx.lineTo(22, 0); ctx.lineTo(-18, 44); ctx.lineTo(-6, 0); ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.translate(0, 4); ctx.fill(); ctx.translate(0, -4);
        const g = ctx.createLinearGradient(0, -44, 0, 44); g.addColorStop(0, '#d8ff6a'); g.addColorStop(1, '#3cc800');
        ctx.fillStyle = g; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.stroke();
        ctx.restore();
        hits.push({ x, y, r: 54, fn });
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

      function drawBg(bgc, grc, cx, cy, beat, fl, ce) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, shade(bgc, 0.12)); g.addColorStop(1, shade(bgc, -0.32));
        ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
        for (let k = 0; k < 7; k++) {
          const tw = 120 + k * 37 % 90, th = 140 + (k * 71) % 160, par = 0.05 + (k % 3) * 0.02, bx = ((k * 211 - cx * SC * par) % (W + 400) + W + 400) % (W + 400) - 200, by = H - 20;
          const tg = ctx.createLinearGradient(0, by - th, 0, by); tg.addColorStop(0, 'rgba(255,255,255,.07)'); tg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(bx - tw / 2, by); ctx.lineTo(bx, by - th); ctx.lineTo(bx + tw / 2, by); ctx.closePath(); ctx.fill();
        }
        const T2 = 168, ox = -(((cx * SC * 0.12) % T2) + T2) % T2, oy = ((cy * SC * 0.12) % T2 + T2) % T2;
        const kx = Math.floor(cx * SC * 0.12 / T2), ky = Math.floor(cy * SC * 0.12 / T2);
        for (let i = -1; i * T2 + ox < W + T2; i++) for (let j = -1; j * T2 + oy - T2 < H + T2; j++) {
          const X0 = i * T2 + ox, Y0 = H - (j * T2 - oy) - T2, k = (i + kx + j + ky) & 1;
          ctx.fillStyle = k ? 'rgba(255,255,255,.055)' : 'rgba(0,0,0,.07)';
          ctx.fillRect(X0 + 4, Y0 + 4, T2 - 8, T2 - 8);
          ctx.fillStyle = k ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.02)';
          ctx.fillRect(X0 + 22, Y0 + 22, T2 - 44, T2 - 44);
        }
        if (beat > 0.02) { ctx.fillStyle = `rgba(255,255,255,${beat * 0.05})`; ctx.fillRect(0, 0, W, H); }
        ground(grc, cx, cy, fl, false, beat);
        if (ce < cy + VH + 40) ground(grc, cx, cy, ce, true, beat);
      }
      function ground(grc, cx, cy, wy, top, beat) {
        const y = H - (wy - cy) * SC;
        ctx.save();
        if (top) { ctx.translate(0, y); ctx.scale(1, -1); ctx.translate(0, -y); }
        const h = top ? y + 20 : H - y + 20;
        if ((top && y > -10) || (!top && y < H + 10)) {
          const g = ctx.createLinearGradient(0, y, 0, y + Math.max(60, h));
          g.addColorStop(0, shade(grc, 0.05)); g.addColorStop(1, shade(grc, -0.55));
          ctx.fillStyle = g; ctx.fillRect(-20, y, W + 40, h);
          const T2 = BL * 4, ox = -((cx * SC) % T2 + T2) % T2;
          ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 2;
          ctx.beginPath();
          for (let X0 = ox; X0 < W + T2; X0 += T2) { ctx.moveTo(X0, y); ctx.lineTo(X0, y + h); }
          ctx.moveTo(0, y + T2 * 0.5); ctx.lineTo(W, y + T2 * 0.5);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.06)';
          for (let X0 = ox; X0 < W + T2; X0 += T2) ctx.fillRect(X0 + 3, y + 3, T2 - 6, T2 * 0.5 - 6);
          ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let X0 = ox; X0 < W + T2; X0 += T2) ctx.fillRect(X0 + T2 * 0.5 - 1, y + T2 * 0.5, 2, h);
          const sgp = ctx.createLinearGradient(0, y, 0, y + 28); sgp.addColorStop(0, 'rgba(255,255,255,.22)'); sgp.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sgp; ctx.fillRect(0, y, W, 28);
          const lg = ctx.createLinearGradient(0, 0, W, 0);
          lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, `rgba(255,255,255,${0.9 + beat * 0.1})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = lg; ctx.fillRect(0, y - 1.5, W, 3);
          ctx.globalAlpha = 0.25 + beat * 0.25; ctx.fillRect(0, y - 5, W, 10); ctx.globalAlpha = 1;
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
              ctx.strokeStyle = `rgba(255,255,255,${0.16 + beat * 0.25})`; ctx.lineWidth = 6; ctx.strokeRect(X, Y, w, h);
              ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.strokeRect(X + 1, Y + 1, w - 2, h - 2);
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
          f.t += 1 / 60;
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
        if (mode === 0 || mode === 2) {
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          for (let k = 2; k < trail.length; k += 2) {
            const a = k / trail.length;
            ctx.strokeStyle = c1; ctx.globalAlpha = a * 0.28 * (alpha == null ? 1 : alpha); ctx.lineWidth = a * sz * 0.5;
            ctx.beginPath(); ctx.moveTo(sx(trail[k - 2]) - sz * 0.45, sy(trail[k - 1])); ctx.lineTo(sx(trail[k]) - sz * 0.45, sy(trail[k + 1])); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (alpha == null ? 1 : alpha) * 0.5; ctx.drawImage(glow(c1), sx(x) - sz * 1.3, sy(y) - sz * 1.3, sz * 2.6, sz * 2.6); ctx.restore();
        ctx.save(); ctx.translate(sx(x), sy(y)); ctx.rotate(rot); ctx.globalAlpha = alpha == null ? 1 : alpha;
        if (g < 0 && (mode === 1 || mode === 3)) ctx.scale(1, -1);
        vehicle(ctx, mode, sv.icon, c1, c2, mode === 0 || mode === 2 ? sz : sz * (mode === 4 ? 0.9 : 1.15), T);
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

      function drawPlay() {
        const beat = Math.exp(-((levelT * LEVEL_DEFS[li].bpm / 60) % 1) * 5);
        const pal = palAt(s.x);
        ctx.save();
        if (shake > 0.3) { ctx.translate(rnd(-shake, shake), rnd(-shake, shake)); shake *= 0.9; }
        drawBg(pal[0], pal[1], camX, camY, beat, flV, ceV);
        drawWorld(beat, pal);
        for (const cp of cps) {
          const X = sx(cp.x), Y = sy(cp.y);
          ctx.save(); ctx.translate(X, Y); ctx.globalAlpha = cp.auto ? 0.6 : 1; ico.diamond(30); ctx.restore();
        }
        if (attempts > 0) {
          const ax = sx(spawn.x + 90), ay = sy(Math.max(spawn.y, 15) + 110);
          if (ax > -400) { ctx.globalAlpha = 0.95; txt('Attempt ' + (practice ? attempts : sv.lv[li].a), ax, ay, 44, '#fff', 'left', 7); ctx.globalAlpha = 1; }
        }
        const fx0 = sx(L.len);
        if (fx0 < W + 60) {
          const g = ctx.createLinearGradient(fx0 - 160, 0, fx0 + 40, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.fillRect(fx0 - 160, 0, 200, H);
          for (let k = 0; k < 14; k++) { const ph = (T * 0.7 + k / 14) % 1, yy = H * ((k * 0.37) % 1); ctx.fillStyle = 'rgba(255,255,255,' + (1 - ph) + ')'; ctx.fillRect(fx0 - 10 - ph * 120, yy, 5, 5); }
        }
        drawWaveTrail();
        if (scr === 'play' || (scr === 'win' && winT < 0.8)) drawPlayer(s.x, s.y, s.rot, s.mode, s.mini, s.g, scr === 'win' ? 1 - winT : 1);
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
          goldTxt(practice ? 'Practice Complete!' : 'Level Complete!', 0, 0, narrow ? 50 : 62);
          ctx.restore();
        }
      }
      function hud() {
        const bw = Math.min(360, W * 0.42), p = pct(), x0 = W / 2 - bw / 2;
        ctx.beginPath(); ctx.roundRect(x0, 12, bw, 16, 8); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
        if (p > 0) { ctx.beginPath(); ctx.roundRect(x0 + 3, 15, Math.max(10, (bw - 6) * p / 100), 10, 5); ctx.fillStyle = practice ? '#3bd1ff' : '#7dff3a'; ctx.fill(); }
        txt(p + '%', x0 + bw + 12, 21, 22, '#fff', 'left', 5);
        const px = W - 34, py = 32;
        ctx.save(); ctx.translate(px, py); ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.roundRect(-20, -20, 40, 40, 9); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(-9, -11, 6, 22); ctx.fillRect(3, -11, 6, 22);
        ctx.restore();
        hits.push({ x: px, y: py, r: 30, fn: pause });
        if (practice) {
          btn(48, H - 46, 30, '#2e9a4a', ico.diamond, () => addCp(false));
          btn(118, H - 46, 30, '#9a2e2e', ico.undo, () => { cps.pop(); music.sfx('click'); });
        }
        if (toastT > 0) { ctx.globalAlpha = Math.min(1, toastT * 2); txt(toastMsg, W / 2, H - 30, 22, '#fff', 'center', 5); ctx.globalAlpha = 1; }
      }

      function drawPause() {
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
        const r = sv.lv[li], d = LEVEL_DEFS[li];
        txt(d.name, W / 2, 62, narrow ? 40 : 48, '#fff', 'center', 8);
        const bw = Math.min(420, W - 120);
        bar(W / 2 - bw / 2, 128, bw, 26, r.b, '#7dff3a', 'Normal Mode');
        bar(W / 2 - bw / 2, 206, bw, 26, r.pb, '#3bd1ff', 'Practice Mode');
        const y = 320, gap = narrow ? 120 : 140;
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
        const d = doneInfo, w = Math.min(500, W - 60), h = 250, x = W / 2 - w / 2, y = 150;
        goldTxt(d.practice ? 'Practice Complete!' : 'Level Complete!', W / 2, 72, narrow ? 44 : 56);
        panel(x, y, w, h);
        const m = Math.floor(d.time / 60), sec = Math.floor(d.time % 60);
        txt('Attempts: ' + d.att, W / 2, y + 34, 26, '#fff', 'center', 5);
        txt('Jumps: ' + d.jumps, W / 2, y + 70, 26, '#fff', 'center', 5);
        txt('Time: ' + m + ':' + String(sec).padStart(2, '0'), W / 2, y + 106, 26, '#fff', 'center', 5);
        const got = sv.lv[li].c;
        for (let i = 0; i < 3; i++) coinIcon(ctx, W / 2 - 50 + i * 50, y + 150, 17, ((d.coins | got) >> i) & 1);
        if (d.stars) { star(ctx, W / 2 + w / 2 - 52, y + 46, 22, '#ffe53b'); txt('+' + d.stars, W / 2 + w / 2 - 52, y + 84, 24, '#fff', 'center', 5); }
        if (d.best) txt('New best!', x + 70, y + 46, 18, '#7dff3a', 'center', 4);
        btn(W / 2 - 70, y + h - 10, 36, '#5ad100', ico.retry, () => { music.sfx('click'); startLevel(li, d.practice); });
        btn(W / 2 + 70, y + h - 10, 36, '#5ad100', ico.menu, () => { music.sfx('click'); goLevels(); });
      }

      function drawMenu() {
        const hue = (T * 8) % 360, bgc = hslHex(hue, 0.75, 0.5), grc = hslHex(hue, 0.8, 0.38);
        const beat = Math.exp(-((T * 128 / 60) % 1) * 5);
        camX = menuX; camY = -90;
        drawBg(bgc, grc, menuX, -90, beat, 0, 1e9);
        ctx.save(); ctx.translate(((T * 150) % (W + 120)) - 60, sy(menuCube.y)); ctx.rotate(menuCube.r); cubeIcon(ctx, sv.icon, col1(), col2(), 30 * SC); ctx.restore();
        goldTxt('GEOMETRY DASH', W / 2, 100, narrow ? 50 : 68);
        const y = 238, gap = narrow ? 170 : 200;
        if (!infoOpen) {
        btn(W / 2, y, 74, '#5ad100', r => { ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill(); ico.play(r * 0.95); }, () => { music.sfx('click'); scr = 'levels'; });
        btn(W / 2 - gap, y + 6, 48, '#5ad100', ico.kit, () => { music.sfx('click'); scr = 'kit'; });
        btn(W / 2 + gap, y + 6, 48, '#5ad100', ico.info, () => { music.sfx('click'); infoOpen = !infoOpen; });
        } else {
          const w = Math.min(560, W - 40);
          ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, 160, w, 200, 18); ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fill();
          const lines = ['Tap / click / Space: jump - hold to keep jumping', 'Ship: hold to rise - Ball: tap to flip gravity', 'UFO: tap to flap - Wave: hold up, release down', 'Orbs: tap while touching - Pads bounce you', 'P: pause - Practice: Z place / X remove checkpoint'];
          lines.forEach((l, i) => txt(l, W / 2, 188 + i * 36, narrow ? 15 : 18, '#fff', 'center', 4));
          hits.unshift({ x: W / 2, y: 260, r: 9999, fn: () => { infoOpen = false; } });
        }
        txt('Stars ' + totStars() + '   Coins ' + totCoins(), W / 2, H - 24, 18, '#fff', 'center', 4);
      }
      function hslHex(h, s2, l) {
        const f = n => { const k = (n + h / 30) % 12, a = s2 * Math.min(l, 1 - l), c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
        return '#' + f(0) + f(8) + f(4);
      }
      function drawLevels() {
        const d = LEVEL_DEFS[li], r = sv.lv[li], beat = Math.exp(-((T * 128 / 60) % 1) * 5);
        camX = menuX; camY = -90;
        drawBg(d.pal[0][0], d.pal[0][1], menuX * 0.3, -90, beat, -1000, 1e9);
        btn(40, 40, 28, '#5ad100', ico.back, () => { music.sfx('click'); scr = 'menu'; });
        const cw = Math.min(540, W - 180), ch = 128, cx0 = W / 2 - cw / 2, cy0 = 92;
        ctx.beginPath(); ctx.roundRect(cx0, cy0, cw, ch, 20); ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke();
        face(ctx, cx0 + 66, cy0 + ch / 2 - 6, 40, d.diff);
        txt(DIFF[d.diff][0], cx0 + 66, cy0 + ch - 14, 15, '#fff', 'center', 4);
        { let fs0 = narrow ? 34 : 40; ctx.font = '900 ' + fs0 + 'px ' + FONT; const room = cw - 124 - 80, mw = ctx.measureText(d.name).width; if (mw > room) fs0 = Math.floor(fs0 * room / mw); txt(d.name, cx0 + 124, cy0 + ch / 2 - 4, fs0, '#fff', 'left', Math.max(4, fs0 * 0.18)); }
        star(ctx, cx0 + cw - 40, cy0 + ch / 2 - 18, 18, r.d ? '#ffe53b' : '#8a8a8a');
        txt(String(d.stars), cx0 + cw - 40, cy0 + ch / 2 + 18, 24, '#fff', 'center', 5);
        hits.push({ x: W / 2, y: cy0 + ch / 2, r: ch / 2 + 6, w: cw, fn: () => { music.sfx('click'); startLevel(li, false); } });
        for (let i = 0; i < 3; i++) coinIcon(ctx, cx0 + cw - 110 + i * 38, cy0 + ch + 24, 14, (r.c >> i) & 1);
        const bw = Math.min(400, W - 200);
        bar(W / 2 - bw / 2, 290, bw, 26, r.b, '#7dff3a', 'Normal Mode');
        bar(W / 2 - bw / 2, 362, bw, 26, r.pb, '#3bd1ff', 'Practice Mode');
        if (li > 0) arrowBtn(44, 200, -1, () => { music.sfx('click'); li--; sv.li = li; persist(); });
        if (li < LV.length - 1) arrowBtn(W - 44, 200, 1, () => { music.sfx('click'); li++; sv.li = li; persist(); });
        for (let i = 0; i < LV.length; i++) { ctx.beginPath(); ctx.arc(W / 2 + (i - (LV.length - 1) / 2) * 22, H - 20, 6, 0, 7); ctx.fillStyle = i === li ? '#fff' : 'rgba(255,255,255,.35)'; ctx.fill(); }
        if (r.a) txt('Attempts ' + r.a, cx0 + 16, cy0 + ch + 24, 15, '#fff', 'left', 4);
      }
      function drawKit() {
        camX = menuX; camY = -90;
        drawBg('#3a2a8a', '#2a1f6a', menuX * 0.3, -90, 0, -1000, 1e9);
        btn(40, 40, 28, '#5ad100', ico.back, () => { music.sfx('click'); scr = 'menu'; persist(); });
        txt('Icon Kit', W / 2, 34, 34, '#fff', 'center', 6);
        const pw = Math.min(520, W - 120);
        panel(W / 2 - pw / 2, 62, pw, 84);
        const modes = [0, 1, 2, 3, 4];
        modes.forEach((m, i) => { ctx.save(); ctx.translate(W / 2 + (i - 2) * (pw / 5.3), 104); vehicle(ctx, m, sv.icon, col1(), col2(), m === 0 ? 52 : m === 4 ? 40 : 50, T); ctx.restore(); });
        const cell = narrow ? 58 : 62, gx = W / 2 - cell * 4 + cell / 2;
        for (let i = 0; i < 16; i++) {
          const X = gx + (i % 8) * cell, Y = 186 + ((i / 8) | 0) * cell, ok = unlocked(i);
          ctx.beginPath(); ctx.roundRect(X - cell / 2 + 3, Y - cell / 2 + 3, cell - 6, cell - 6, 10); ctx.fillStyle = i === sv.icon ? 'rgba(125,255,58,.35)' : 'rgba(0,0,0,.28)'; ctx.fill();
          if (i === sv.icon) { ctx.lineWidth = 3; ctx.strokeStyle = '#7dff3a'; ctx.stroke(); }
          ctx.save(); ctx.translate(X, Y); ctx.globalAlpha = ok ? 1 : 0.35; cubeIcon(ctx, i, ok ? col1() : '#aaa', ok ? col2() : '#666', cell * 0.62); ctx.restore();
          if (!ok) { ctx.fillStyle = '#ffe53b'; ctx.beginPath(); ctx.roundRect(X - 8, Y - 2, 16, 12, 2); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.beginPath(); ctx.arc(X, Y - 3, 5, Math.PI, 0); ctx.lineWidth = 3; ctx.stroke(); }
          hits.push({ x: X, y: Y, r: cell / 2, fn: () => { if (ok) { sv.icon = i; persist(); music.sfx('click'); } else { const q = ICON_REQ[i]; toast('Unlock: ' + q[1] + (q[0] === 's' ? ' stars' : ' secret coins')); } } });
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

      function draw() {
        hits = [];
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        if (scr === 'menu') drawMenu();
        else if (scr === 'levels') drawLevels();
        else if (scr === 'kit') drawKit();
        else {
          drawPlay();
          if (scr === 'pause') drawPause();
          if (scr === 'done') drawDone();
        }
      }

      function hitAt(e) {
        const p = toLocal(e);
        for (const h of hits) {
          if (h.w ? Math.abs(p.x - h.x) <= h.w / 2 && Math.abs(p.y - h.y) <= h.r : (p.x - h.x) ** 2 + (p.y - h.y) ** 2 <= h.r * h.r) { h.fn(); return true; }
        }
        return false;
      }
      api.on(root, 'pointerdown', e => {
        if (e.button > 0) return;
        e.preventDefault();
        music.init();
        if (scr === 'menu' && !music.on) music.play(5, true);
        if (scr === 'play' || scr === 'dead') {
          if (hitAt(e)) return;
          ptrs.add(e.pointerId);
          try { root.setPointerCapture(e.pointerId); } catch (err) {}
          onPress();
          return;
        }
        hitAt(e);
      });
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
        if (scr === 'pause') { if (c === 'KeyP' || c === 'Enter' || c === 'Space' || c === 'Escape') { e.preventDefault(); resume(); } return; }
        if (c === 'Escape' && (scr === 'levels' || scr === 'kit')) { e.preventDefault(); scr = 'menu'; persist(); return; }
        if (c === 'Escape' && scr === 'done') { e.preventDefault(); goLevels(); return; }
        if (scr === 'menu') { if (!music.on) music.play(5, true); if (c === 'Enter' || c === 'Space') { infoOpen = false; scr = 'levels'; } return; }
        if (scr === 'levels') {
          if (c === 'ArrowLeft' && li > 0) { li--; sv.li = li; persist(); }
          else if (c === 'ArrowRight' && li < LV.length - 1) { li++; sv.li = li; persist(); }
          else if (c === 'Enter' || c === 'Space') startLevel(li, false);
          return;
        }
        if (scr === 'kit') { if (c === 'Enter' || c === 'Space') scr = 'menu'; return; }
        if (scr === 'done') { if (c === 'Enter' || c === 'Space') goLevels(); else if (c === 'KeyR') startLevel(li, doneInfo.practice); }
      });
      api.on(window, 'keyup', e => { if (isJump(e.code)) { keyHeld = false; onRelease(); } });
      canvas.__rush = { get scr() { return scr; }, get s() { return s; }, get li() { return li; }, sv, start: (i, p) => startLevel(i, p), ff(toggles, upto) { let k = 0; s = newState(L); levelT = 0; scr = 'play'; for (let t = 0; t < upto && scr === 'play'; t++) { while (k < toggles.length && toggles[k] <= t) { if (k % 2 === 0) press(s); else release(s); k++; } levelT += 1 / 240; step(s, L); if (s.ev) events(); if (s.dead) die(); else if (s.win) win(); } camX = Math.min(s.x - PX, L.len + 120 - VW); camY = s.mode ? (s.fl + s.ce) / 2 - VH / 2 : Math.max(-90, s.y - VH * 0.45); flV = s.fl; ceV = s.mode ? s.ce : camY + VH + 80; return { x: s.x, dead: s.dead, win: s.win, scr }; }, pause, kill() { if (scr === 'play') { s.dead = 1; die(); } } };
      api.loop(dt => { update(dt); draw(); });
      return { destroy() { music.close(); } };
    }
  });
  Ameplay.covers['dash-cube'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f72ff"/><stop offset="1" stop-color="#1b3ccf"/></linearGradient><linearGradient id="gr-gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f45e0"/><stop offset="1" stop-color="#0c1f8a"/></linearGradient><linearGradient id="gr-ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><radialGradient id="gr-orb"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#ffe53b"/><stop offset="1" stop-color="#d9a400"/></radialGradient><radialGradient id="gr-glow"><stop offset="0" stop-color="#ffe53b" stop-opacity=".8"/><stop offset="1" stop-color="#ffe53b" stop-opacity="0"/></radialGradient><radialGradient id="gr-pg"><stop offset="0" stop-color="#ff5fd2" stop-opacity=".7"/><stop offset="1" stop-color="#ff5fd2" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#gr-bg)"/><g fill="#fff" opacity=".07"><rect x="-10" y="10" width="92" height="92"/><rect x="186" y="10" width="92" height="92"/><rect x="88" y="108" width="92" height="92"/><rect x="284" y="108" width="92" height="92"/></g><g fill="#000" opacity=".08"><rect x="88" y="10" width="92" height="92"/><rect x="284" y="10" width="92" height="92"/><rect x="-10" y="108" width="92" height="92"/><rect x="186" y="108" width="92" height="92"/></g><ellipse cx="352" cy="150" rx="46" ry="86" fill="url(#gr-pg)"/><ellipse cx="352" cy="160" rx="17" ry="56" fill="#ff5fd2" fill-opacity=".25" stroke="#000" stroke-width="11"/><ellipse cx="352" cy="160" rx="17" ry="56" fill="none" stroke="#ff5fd2" stroke-width="6"/><path d="M332 132l-10 6v44l10 6zM372 132l10 6v44l-10 6z" fill="#c43aa0" stroke="#000" stroke-width="3" stroke-linejoin="round"/><rect y="226" width="400" height="74" fill="url(#gr-gd)"/><path d="M0 263h400M96 226v74M192 226v74M288 226v74" stroke="#000" stroke-opacity=".2" stroke-width="3"/><rect y="223" width="400" height="5" fill="url(#gr-ln)"/><rect y="219" width="400" height="13" fill="url(#gr-ln)" opacity=".25"/><g stroke="#fff" stroke-width="4" stroke-linejoin="round"><rect x="238" y="184" width="42" height="42" fill="#060606"/><rect x="280" y="184" width="42" height="42" fill="#060606"/><rect x="280" y="142" width="42" height="42" fill="#060606"/></g><g fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"><rect x="245" y="191" width="28" height="28"/><rect x="287" y="191" width="28" height="28"/><rect x="287" y="149" width="28" height="28"/></g><g stroke="#fff" stroke-width="4" stroke-linejoin="round" fill="#080808"><path d="M150 226l21-40 21 40z"/><path d="M192 226l21-40 21 40z"/><path d="M291 142l10-20 10 20z"/></g><circle cx="196" cy="110" r="40" fill="url(#gr-glow)"/><circle cx="196" cy="110" r="25" fill="none" stroke="#fff" stroke-width="4" stroke-opacity=".9"/><circle cx="196" cy="110" r="16" fill="url(#gr-orb)" stroke="#000" stroke-width="4"/><path d="M28 196q40-60 82-58" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="10" stroke-linecap="round" stroke-dasharray="1 16"/><g transform="translate(116 124) rotate(28)"><rect x="-27" y="-27" width="54" height="54" rx="4" fill="#000"/><rect x="-23" y="-23" width="46" height="46" rx="3" fill="#7dff00"/><rect x="-20" y="-20" width="40" height="6" fill="#fff" fill-opacity=".35"/><rect x="-13" y="-13" width="26" height="26" rx="2" fill="#00ffff" stroke="#000" stroke-width="3.5"/><rect x="-7.5" y="-6" width="5" height="6.5" fill="#000"/><rect x="2.5" y="-6" width="5" height="6.5" fill="#000"/><rect x="-7.5" y="4" width="15" height="3.4" fill="#000"/></g><g fill="#7dff00"><rect x="64" y="208" width="7" height="7" transform="rotate(20 67 211)"/><rect x="44" y="214" width="5" height="5"/><rect x="82" y="200" width="5" height="5" fill="#00ffff"/></g></svg>`;
})();

