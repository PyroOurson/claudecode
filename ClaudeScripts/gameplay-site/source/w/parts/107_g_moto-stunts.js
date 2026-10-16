
(() => {
  'use strict';

  function motoSim() {
    const TAU = Math.PI * 2, HP = Math.PI / 2;
    const sin = x => {
      x -= Math.round(x / TAU) * TAU;
      if (x > HP) x = Math.PI - x; else if (x < -HP) x = -Math.PI - x;
      const x2 = x * x;
      return x * (1 - x2 / 6 * (1 - x2 / 20 * (1 - x2 / 42 * (1 - x2 / 72 * (1 - x2 / 110 * (1 - x2 / 156 * (1 - x2 / 210)))))));
    };
    const cos = x => sin(x + HP);
    const CFG = {
      DT: 1 / 240, G: 900, FLIP: 1, FLIP_TOL: 0.5, PLANK_DELAY: 0.14, BOOST_V: 1150, BOOST_ACC: 5200,
      TRAMP_V: 820, CRASH_T: 1.35, DEEP: 1500, CELL: 128,
      MC: 10, IC: 5200, MW: 1.4, AY: 15, WB: 66, CS: 85, TRAVEL: 9, KB: 26000, KP: 36000, CP: 320,
      BRAKE: 150000, REV: 0.35, DRAG: 0.00012,
      HEAD: [4, -50, 9], TORSO: [-8, -30, 9], SKID: [2, 17, 6], CORE: [0, 0, 12]
    };
    const BIKES = [
      { id: 'dirt', name: 'Dirt Rider', need: 0, r: 17, vmax: 780, tq: 200000, spin: 10.5, sacc: 66, tg: 165000, mu: 1.25, ks: 1000, body: '#e8452c', trim: '#ffffff', suit: '#d8362a', helm: '#e8452c', visor: '#1d1b26' },
      { id: 'dune', name: 'Dune Racer', need: 10, r: 17, vmax: 880, tq: 220000, spin: 10, sacc: 60, tg: 150000, mu: 1.15, ks: 1100, body: '#2fa84f', trim: '#f4f4f4', suit: '#1d1b26', helm: '#2fa84f', visor: '#ffb020' },
      { id: 'flip', name: 'Flip Master', need: 22, r: 16, vmax: 820, tq: 205000, spin: 13, sacc: 88, tg: 185000, mu: 1.2, ks: 950, body: '#8e44e8', trim: '#4fe0ff', suit: '#ff4f9a', helm: '#4fe0ff', visor: '#1d1b26' },
      { id: 'big', name: 'Big Wheel', need: 34, r: 21, vmax: 850, tq: 235000, spin: 10, sacc: 62, tg: 175000, mu: 1.45, ks: 900, body: '#ff8a1f', trim: '#1d1b26', suit: '#c0392b', helm: '#f4f4f4', visor: '#2a64d0' }
    ];
    const IW = B => CFG.MW * B.r * B.r * 0.7;
    const ITOT = CFG.IC + 2 * CFG.MW * (CFG.WB / 2) * (CFG.WB / 2);

    function build(def, idx) {
      const L = { idx, name: def.name, stars: def.stars, segs: [], grounds: [], rects: [], ramps: [], loops: [], pads: [], objs: [], flags: [], deco: [], finish: 0, deathY: 0, grid: new Map(), start: { x: 60, y: 0 }, maxX: 0, drops: [] };
      let cx = 0, cy = 0, poly = [[-700, 0], [0, 0]], maxY = 0;
      const pt = (x, y) => { poly.push([x, y]); if (y > maxY) maxY = y; };
      const seg = (ax, ay, bx, by, o) => {
        const dx = bx - ax, dy = by - ay, l = Math.sqrt(dx * dx + dy * dy);
        if (l < 0.01) return null;
        const s = Object.assign({ ax, ay, bx, by, l2: l * l, nx: dy / l, ny: -dx / l, one: 0, lp: -1, grp: 0, mat: 0 }, o || {});
        L.segs.push(s); return s;
      };
      const endPoly = () => { if (poly.length > 1) L.grounds.push(poly); };
      const b = {
        get x() { return cx; }, get y() { return cy; },
        flat(n) { cx += n; pt(cx, cy); return b; },
        line(n, dy) { cx += n; cy += dy; pt(cx, cy); return b; },
        hill(n, dy, k) {
          k = k || Math.max(6, Math.round(n / 28));
          const x0 = cx, y0 = cy;
          for (let i = 1; i <= k; i++) pt(x0 + n * i / k, y0 + dy * (1 - cos(Math.PI * i / k)) / 2);
          cx += n; cy += dy; return b;
        },
        kick(n, h, k) {
          k = k || 10;
          const x0 = cx, y0 = cy;
          for (let i = 1; i <= k; i++) { const u = i / k; pt(x0 + n * u, y0 - h * u * u); }
          cx += n; cy -= h; return b;
        },
        land(n, h, k) {
          k = k || 10;
          const x0 = cx, y0 = cy;
          for (let i = 1; i <= k; i++) { const u = i / k; pt(x0 + n * u, y0 + h * (1 - (1 - u) * (1 - u))); }
          cx += n; cy += h; return b;
        },
        gap(n, dy) {
          pt(cx, cy + CFG.DEEP); endPoly();
          cx += n; cy += dy || 0;
          poly = [[cx, cy + CFG.DEEP], [cx, cy]]; if (cy > maxY) maxY = cy;
          return b;
        },
        loop(R) {
          const lx = cx + R + 40, ly = cy - R, li = L.loops.length;
          L.loops.push({ x: lx, y: ly, R });
          const N = 44, a0 = 80 * Math.PI / 180, a1 = -260 * Math.PI / 180;
          let px = lx + R * cos(a0), py = ly + R * sin(a0);
          for (let i = 1; i <= N; i++) {
            const th = a0 + (a1 - a0) * i / N, qx = lx + R * cos(th), qy = ly + R * sin(th);
            const mth = a0 + (a1 - a0) * (i - 0.5) / N;
            const s = seg(px, py, qx, qy, { one: 1, lp: li, grp: mth > -Math.PI / 2 ? 1 : mth > -Math.PI ? 2 : 3 });
            if (s) { s.nx = -cos(mth); s.ny = -sin(mth); }
            px = qx; py = qy;
          }
          return b.flat(2 * R + 80);
        },
        box(dx, dy, w, h, st) { L.rects.push({ x: cx + dx, y: cy + dy, w, h, st: st || 'wood' }); return b; },
        crate(dx, n) { for (let i = 0; i < (n || 1); i++) b.box(dx, -44 * (i + 1), 44, 44, 'crate'); return b; },
        ramp(dx, w, h, dir, st, dy) {
          const x0 = cx + dx, y0 = cy + (dy || 0), k = 10, top = [];
          dir = dir || 1;
          for (let i = 0; i <= k; i++) {
            const u = i / k, f = dir > 0 ? u * u * 0.55 + u * 0.45 : 1 - ((1 - u) * (1 - u) * 0.55 + (1 - u) * 0.45);
            top.push([x0 + w * u, y0 - h * f]);
          }
          L.ramps.push({ top, x0, y0, w, h, dir, st: st || 'wood' });
          return b;
        },
        bridge(dx, w, n, dy) {
          n = n || Math.round(w / 46);
          const pw = w / n, y = cy + (dy || 0);
          for (let i = 0; i < n; i++) L.objs.push({ k: 'plank', x: cx + dx + pw * (i + 0.5), y: y + 7, hw: pw / 2 - 1, hh: 7 });
          return b;
        },
        spikes(dx, w, dy) { L.objs.push({ k: 'spike', x: cx + dx + w / 2, x0: cx + dx, x1: cx + dx + w, y: cy + (dy || 0), h: 24, r: w / 2 }); return b; },
        spikejump(w, h) { return b.ramp(0, 210, h || 80).flat(210).spikes(0, w || 170).flat(Math.max(420, (w || 170) + 260)); },
        tnt(dx, dy) { L.objs.push({ k: 'tnt', x: cx + dx, y: cy + (dy || 0) - 21, r: 19 }); return b; },
        saw(dx, dy, r, mx, my, per, ph) { L.objs.push({ k: 'saw', x: cx + dx, y: cy + dy, r: r || 36, mx: mx || 0, my: my || 0, per: per || 2, ph: ph || 0 }); return b; },
        swing(dx, dy, len, amp, per, ph) { L.objs.push({ k: 'swing', x: cx + dx, y: cy + dy, len, amp, per: per || 2.4, ph: ph || 0, r: 30 }); return b; },
        roll(dx, dy, r, trig, vx) { L.objs.push({ k: 'roll', x: cx + dx, y: cy + dy - r, r: r || 30, trig: cx + trig, vx: vx || -120 }); return b; },
        drop(dx, dy, w, h, trig) { const o = { k: 'drop', x: cx + dx + w / 2, y: cy + dy + h / 2, hw: w / 2, hh: h / 2, trig: cx + trig, land: 0 }; L.objs.push(o); L.drops.push(o); return b; },
        crusher(dx, w, h, top, per, ph) { L.objs.push({ k: 'crush', x: cx + dx + w / 2, y: cy - top - h / 2, hw: w / 2, hh: h / 2, d: top, per: per || 2.4, ph: ph || 0 }); return b; },
        mover(dx, dy, w, ax, ay, per, ph) { L.objs.push({ k: 'mover', x: cx + dx + w / 2, y: cy + dy + 9, hw: w / 2, hh: 9, ax, ay, per: per || 3, ph: ph || 0 }); return b; },
        tramp(dx, w, dy) { w = w || 74; const x = cx + dx, y = cy + (dy || 0); L.pads.push({ k: 'tramp', x, y, w }); seg(x, y - 7, x + w, y - 7, { mat: 1 }); return b; },
        boost(dx, w) { w = w || 130; const x = cx + dx; L.pads.push({ k: 'boost', x, y: cy, w }); seg(x, cy - 1, x + w, cy - 1, { mat: 2 }); return b; },
        flag() { L.flags.push({ x: cx, y: cy }); return b.flat(600); },
        deco(dx, kind) { L.deco.push({ x: cx + dx, y: cy, kind }); return b; },
        finish() { L.finish = cx; return b; },
        jump(gw, h, w) { h = h || 90; w = w || 240; return b.ramp(0, w, h).flat(w).gap(gw); },
        plat(w, h) { return b.ramp(0, 200, h).flat(200).box(0, -h, w, h, 'wood').flat(w); }
      };
      def.build(b);
      b.flat(900);
      pt(cx, cy + CFG.DEEP); endPoly();
      L.maxX = cx;
      for (const g of L.grounds) for (let i = 1; i < g.length; i++) seg(g[i - 1][0], g[i - 1][1], g[i][0], g[i][1]);
      for (const r of L.rects) {
        seg(r.x, r.y, r.x + r.w, r.y); seg(r.x + r.w, r.y, r.x + r.w, r.y + r.h);
        seg(r.x + r.w, r.y + r.h, r.x, r.y + r.h); seg(r.x, r.y + r.h, r.x, r.y);
      }
      for (const r of L.ramps) {
        for (let i = 1; i < r.top.length; i++) seg(r.top[i - 1][0], r.top[i - 1][1], r.top[i][0], r.top[i][1]);
        const e = r.dir > 0 ? r.top[r.top.length - 1] : r.top[0];
        if (r.dir > 0) seg(e[0], e[1], e[0], r.y0); else seg(e[0], r.y0, e[0], e[1]);
      }
      const C = CFG.CELL;
      for (const s of L.segs) {
        const x0 = Math.floor((Math.min(s.ax, s.bx) - 4) / C), x1 = Math.floor((Math.max(s.ax, s.bx) + 4) / C);
        const y0 = Math.floor((Math.min(s.ay, s.by) - 4) / C), y1 = Math.floor((Math.max(s.ay, s.by) + 4) / C);
        for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) {
          const key = gx * 4096 + gy;
          let a = L.grid.get(key); if (!a) L.grid.set(key, a = []);
          a.push(s);
        }
      }
      for (const o of L.drops) o.land = rayDown(L, o.x, o.y + o.hh, o.hw) - o.hh;
      L.deathY = maxY + 420;
      L.solid = []; L.haz = [];
      L.objs.forEach((o, i) => { if (o.k === 'plank' || o.k === 'mover' || o.k === 'crush' || o.k === 'drop') L.solid.push(i); else L.haz.push(i); });
      return L;
    }

    function rayDown(L, x, y, hw) {
      let best = 1e9;
      for (const s of L.segs) {
        if (s.one || s.mat) continue;
        for (const xx of [x - hw * 0.9, x, x + hw * 0.9]) {
          const lo = Math.min(s.ax, s.bx), hi = Math.max(s.ax, s.bx);
          if (xx < lo || xx > hi || hi - lo < 0.01) continue;
          const yy = s.ay + (s.by - s.ay) * (xx - s.ax) / (s.bx - s.ax);
          if (yy >= y - 1 && yy < best) best = yy;
        }
      }
      return best;
    }

    const mkW = () => ({ x: 0, y: 0, vx: 0, vy: 0, s: 0, ra: 0, c: 0 });
    function initObj(o) {
      if (o.k === 'plank') return { cx: o.x, cy: o.y, a: 0, vx: 0, vy: 0, w: 0, trig: -1, gone: 0 };
      if (o.k === 'drop') return { cx: o.x, cy: o.y, a: 0, vx: 0, vy: 0, w: 0, fall: 0 };
      if (o.k === 'mover' || o.k === 'crush') return { cx: o.x, cy: o.y, a: 0, vx: 0, vy: 0, w: 0 };
      if (o.k === 'tnt') return { boom: 0 };
      if (o.k === 'roll') return { x: o.x, y: o.y, vx: 0, vy: 0, on: 0, ra: 0, gone: 0 };
      return { x: o.x, y: o.y, a: 0 };
    }
    function place(L, B, st, x, y) {
      const r = B.r, sag = (CFG.MC * CFG.G / 2) / B.ks;
      st.x = x; st.y = y - r - CFG.AY + sag; st.a = 0; st.vx = st.vy = st.w = 0;
      for (let i = 0; i < 2; i++) { const W = st.wh[i]; W.x = x + (i ? 1 : -1) * CFG.WB / 2; W.y = y - r; W.vx = W.vy = W.s = 0; W.c = 0; }
      st.air = 0; st.rot = 0;
    }
    function newState(L, B) {
      const st = { t: 0, time: 0, bonus: 0, run: 0, cp: -1, fin: 0, crash: 0, ck: '', ct: 0, air: 0, rot: 0, lean: 0, thr: 0, x: 0, y: 0, a: 0, vx: 0, vy: 0, w: 0, wh: [mkW(), mkW()], o: L.objs.map(initObj), lp: L.loops.map(() => 0), ev: [], flips: 0 };
      place(L, B, st, L.start.x, L.start.y);
      return st;
    }
    function respawn(L, B, st) {
      const f = st.cp >= 0 ? L.flags[st.cp] : { x: L.start.x, y: L.start.y };
      st.o = L.objs.map(initObj); st.lp = L.loops.map(() => 0);
      L.objs.forEach((o, i) => {
        if (o.trig == null || o.trig > f.x) return;
        const s = st.o[i];
        if (o.k === 'roll') s.gone = 1; else { s.fall = 2; s.cy = o.land; }
      });
      st.crash = 0; st.ck = ''; st.ct = 0; st.lean = 0;
      place(L, B, st, f.x, f.y);
    }
    function clone(st) {
      const c = Object.assign({}, st);
      c.wh = [Object.assign({}, st.wh[0]), Object.assign({}, st.wh[1])];
      c.o = st.o.map(o => Object.assign({}, o));
      c.lp = st.lp.slice(); c.ev = [];
      return c;
    }

    function updObjs(L, st, dt) {
      const t = st.t, G = CFG.G;
      for (let i = 0; i < L.objs.length; i++) {
        const o = L.objs[i], s = st.o[i];
        switch (o.k) {
          case 'plank':
            if (s.gone) break;
            if (s.trig >= 0) {
              s.trig += dt;
              if (s.trig > CFG.PLANK_DELAY) { s.vy += G * dt; s.cy += s.vy * dt; s.w = (i % 2 ? 1 : -1) * 1.4; s.a += s.w * dt; if (s.cy > o.y + 900) s.gone = 1; }
            }
            break;
          case 'mover': {
            const k = 2 * Math.PI / o.per, ph = k * t + o.ph * 2 * Math.PI, raw = 0.5 - cos(ph), u = raw < 0 ? 0 : raw > 1 ? 1 : raw, du = raw < 0 || raw > 1 ? 0 : sin(ph) * k;
            s.cx = o.x + o.ax * u; s.cy = o.y + o.ay * u; s.vx = o.ax * du; s.vy = o.ay * du;
            break;
          }
          case 'crush': {
            const u = ((t / o.per + o.ph) % 1 + 1) % 1;
            let p, v;
            if (u < 0.45) { p = 0; v = 0; } else if (u < 0.55) { const q = (u - 0.45) / 0.1; p = q * q; v = 2 * q / (0.1 * o.per); } else if (u < 0.75) { p = 1; v = 0; } else { p = 1 - (u - 0.75) / 0.25; v = -1 / (0.25 * o.per); }
            s.cy = o.y + o.d * p; s.vy = o.d * v;
            break;
          }
          case 'drop':
            if (!s.fall && st.x > o.trig && !st.crash) s.fall = 1;
            if (s.fall === 1) { s.vy += G * 1.3 * dt; s.cy += s.vy * dt; if (s.cy >= o.land) { s.cy = o.land; s.vy = 0; s.fall = 2; st.ev.push(['thud', s.cx, s.cy + o.hh]); } }
            break;
          case 'saw': {
            const k = 2 * Math.PI / o.per, ph = k * t + o.ph * 2 * Math.PI;
            s.x = o.x + o.mx * sin(ph); s.y = o.y + o.my * sin(ph); s.a = t * 14;
            break;
          }
          case 'swing': {
            const a = o.amp * sin(2 * Math.PI * t / o.per + o.ph * 2 * Math.PI);
            s.a = a; s.x = o.x + sin(a) * o.len; s.y = o.y + cos(a) * o.len;
            break;
          }
          case 'roll':
            if (s.gone) break;
            if (!s.on && st.x > o.trig && !st.crash) { s.on = 1; s.vx = o.vx; }
            if (s.on) {
              s.vy += G * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.ra += s.vx / o.r * dt;
              circleStatic(L, s, o.r);
              if (s.y > L.deathY) s.gone = 1;
            }
            break;
        }
      }
    }
    let stamp = 1;
    function circleStatic(L, s, r) {
      const C = CFG.CELL, gx0 = Math.floor((s.x - r) / C), gx1 = Math.floor((s.x + r) / C), gy0 = Math.floor((s.y - r) / C), gy1 = Math.floor((s.y + r) / C);
      stamp++;
      for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
        const a = L.grid.get(gx * 4096 + gy); if (!a) continue;
        for (const sg of a) {
          if (sg.mk === stamp || sg.one) continue; sg.mk = stamp;
          if (!segHit(s.x, s.y, r, sg)) continue;
          s.x += H.nx * H.pen; s.y += H.ny * H.pen;
          const vn = s.vx * H.nx + s.vy * H.ny;
          if (vn < 0) { s.vx -= vn * 1.15 * H.nx; s.vy -= vn * 1.15 * H.ny; }
        }
      }
    }
    const H = { nx: 0, ny: 0, pen: 0, qx: 0, qy: 0 };
    function segHit(px, py, r, s) {
      const ex = s.bx - s.ax, ey = s.by - s.ay;
      let u = ((px - s.ax) * ex + (py - s.ay) * ey) / s.l2;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const qx = s.ax + ex * u, qy = s.ay + ey * u, dx = px - qx, dy = py - qy, d2 = dx * dx + dy * dy;
      if (d2 >= r * r) return false;
      if (s.one && (px - s.ax) * s.nx + (py - s.ay) * s.ny < 0) return false;
      const d = Math.sqrt(d2);
      if (d < 1e-6) { H.nx = s.nx; H.ny = s.ny; } else { H.nx = dx / d; H.ny = dy / d; }
      H.pen = r - d; H.qx = qx; H.qy = qy;
      return true;
    }
    function obbHit(px, py, r, o, s) {
      const c = cos(s.a), sn = sin(s.a), rx = px - s.cx, ry = py - s.cy;
      const lx = rx * c + ry * sn, ly = -rx * sn + ry * c;
      const qx = lx < -o.hw ? -o.hw : lx > o.hw ? o.hw : lx, qy = ly < -o.hh ? -o.hh : ly > o.hh ? o.hh : ly;
      let nlx, nly, pen;
      if (qx === lx && qy === ly) {
        const ex = o.hw - Math.abs(lx), ey = o.hh - Math.abs(ly);
        if (ex < ey) { nlx = lx < 0 ? -1 : 1; nly = 0; pen = ex + r; } else { nlx = 0; nly = ly < 0 ? -1 : 1; pen = ey + r; }
      } else {
        const dx = lx - qx, dy = ly - qy, d2 = dx * dx + dy * dy;
        if (d2 >= r * r) return false;
        const d = Math.sqrt(d2); nlx = dx / d; nly = dy / d; pen = r - d;
      }
      H.nx = nlx * c - nly * sn; H.ny = nlx * sn + nly * c; H.pen = pen;
      H.qx = s.cx + qx * c - qy * sn; H.qy = s.cy + qx * sn + qy * c;
      return true;
    }
    function loopOff(st, sg) { if (sg.lp < 0) return false; const p = st.lp[sg.lp]; return sg.grp === 1 ? p === 2 : sg.grp === 3 ? (p === 0 || p === 3) : false; }

    function wheelCol(L, B, st, W) {
      const r = B.r, m = CFG.MW, I = IW(B), C = CFG.CELL;
      W.c = 0;
      const gx0 = Math.floor((W.x - r) / C), gx1 = Math.floor((W.x + r) / C), gy0 = Math.floor((W.y - r) / C), gy1 = Math.floor((W.y + r) / C);
      stamp++;
      for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
        const a = L.grid.get(gx * 4096 + gy); if (!a) continue;
        for (let i = 0; i < a.length; i++) {
          const sg = a[i];
          if (sg.mk === stamp) continue; sg.mk = stamp;
          if (loopOff(st, sg) || !segHit(W.x, W.y, r, sg)) continue;
          wheelContact(B, st, W, r, m, I, 0, 0, sg.mat);
        }
      }
      for (let j = 0; j < L.solid.length; j++) {
        const i = L.solid[j], o = L.objs[i], s = st.o[i];
        if (s.gone || Math.abs(s.cx - W.x) > o.hw + o.hh + r) continue;
        if (!obbHit(W.x, W.y, r, o, s)) continue;
        if (o.k === 'plank' && s.trig < 0) s.trig = 0;
        if (o.k === 'crush' && H.ny > 0.3) { if (s.vy > 60) crash(st, 'crush'); continue; }
        wheelContact(B, st, W, r, m, I, s.vx - s.w * (H.qy - s.cy), s.vy + s.w * (H.qx - s.cx), 0);
      }
    }
    function wheelContact(B, st, W, r, m, I, svx, svy, mat) {
      const nx = H.nx, ny = H.ny;
      W.x += nx * H.pen; W.y += ny * H.pen;
      W.c = 1;
      const rvx = W.vx - svx, rvy = W.vy - svy, vn = rvx * nx + rvy * ny;
      let jn = 0;
      if (mat === 1) {
        if (!st.trc) {
          st.trc = 0.35;
          const tv = Math.max(CFG.TRAMP_V, -vn * 0.85);
          st.vy = Math.min(st.vy, -tv); st.w *= 0.3;
          for (const w of st.wh) w.vy = Math.min(w.vy, -tv);
          st.ev.push(['tramp', W.x, W.y]);
        }
        return;
      }
      if (vn < 0) { jn = -vn * m * 1.0; W.vx += jn / m * nx; W.vy += jn / m * ny; }
      const tx = -ny, ty = nx;
      if (mat === 2) {
        const vt = st.vx * tx + st.vy * ty;
        if (vt < CFG.BOOST_V) {
          const dv = Math.min(CFG.BOOST_V - vt, CFG.BOOST_ACC * CFG.DT);
          st.vx += dv * tx; st.vy += dv * ty;
          for (const w of st.wh) { w.vx += dv * tx; w.vy += dv * ty; }
          if (!st.bst) st.ev.push(['boost', W.x, W.y]);
          st.bst = 0.3;
        }
      }
      const slip = (rvx * tx + rvy * ty) - W.s * r;
      let jt = -slip / (1 / m + r * r / I);
      const lim = B.mu * jn;
      jt = jt > lim ? lim : jt < -lim ? -lim : jt;
      W.vx += jt / m * tx; W.vy += jt / m * ty; W.s -= jt * r / I;
    }
    function bodyPt(st, lx, ly) {
      const c = cos(st.a), s = sin(st.a);
      P.x = st.x + c * lx - s * ly; P.y = st.y + s * lx + c * ly;
      return P;
    }
    const P = { x: 0, y: 0 };
    function touches(L, st, px, py, r) {
      const C = CFG.CELL, gx0 = Math.floor((px - r) / C), gx1 = Math.floor((px + r) / C), gy0 = Math.floor((py - r) / C), gy1 = Math.floor((py + r) / C);
      for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
        const a = L.grid.get(gx * 4096 + gy); if (!a) continue;
        for (let i = 0; i < a.length; i++) { const sg = a[i]; if (!sg.mat && !sg.one && segHit(px, py, r, sg)) return true; }
      }
      for (let j = 0; j < L.solid.length; j++) {
        const i = L.solid[j], o = L.objs[i], s = st.o[i];
        if (!s.gone && Math.abs(s.cx - px) < o.hw + o.hh + r && obbHit(px, py, r, o, s) && !(o.k === 'crush' && H.ny > 0.3)) return true;
      }
      return false;
    }
    const FRAME = [[-36, -10, 9], [30, -20, 9], [0, 2, 12], [-18, -26, 8], [26, -34, 7]];
    function skid(L, st) { const q = CFG.SKID; contactPt(L, st, q[0], q[1], q[2], 0.4); }
    function contactPt(L, st, lx, ly, r, mu) {
      const p = bodyPt(st, lx, ly), px = p.x, py = p.y;
      if (!touches(L, st, px, py, r)) return;
      const nx = H.nx, ny = H.ny, pen = H.pen;
      st.x += nx * pen * 0.8; st.y += ny * pen * 0.8;
      const rx = px - st.x, ry = py - st.y;
      const vpx = st.vx - st.w * ry, vpy = st.vy + st.w * rx, vn = vpx * nx + vpy * ny;
      if (vn >= 0) return;
      const rn = rx * ny - ry * nx, K = 1 / CFG.MC + rn * rn / CFG.IC, j = -vn / K;
      st.vx += j * nx / CFG.MC; st.vy += j * ny / CFG.MC; st.w += rn * j / CFG.IC;
      const tx = -ny, ty = nx, vt = vpx * tx + vpy * ty, rt = rx * ty - ry * tx, Kt = 1 / CFG.MC + rt * rt / CFG.IC;
      let jt = -vt / Kt; const lim = mu * j; jt = jt > lim ? lim : jt < -lim ? -lim : jt;
      st.vx += jt * tx / CFG.MC; st.vy += jt * ty / CFG.MC; st.w += rt * jt / CFG.IC;
    }
    function crash(st, kind) {
      if (st.crash || st.fin) return;
      st.crash = 1; st.ck = kind; st.ct = 0;
      st.ev.push(['crash', st.x, st.y, kind]);
    }
    function hazards(L, B, st) {
      const parts = PARTS;
      const c = cos(st.a), sn = sin(st.a);
      let n = 0;
      for (const q of [CFG.HEAD, CFG.TORSO, CFG.CORE]) { parts[n++] = st.x + c * q[0] - sn * q[1]; parts[n++] = st.y + sn * q[0] + c * q[1]; parts[n++] = q[2]; }
      for (const W of st.wh) { parts[n++] = W.x; parts[n++] = W.y; parts[n++] = B.r; }
      for (let j = 0; j < L.haz.length; j++) {
        const i = L.haz[j], o = L.objs[i], s = st.o[i];
        let hx, hy, hr;
        if (o.k === 'spike') {
          if (Math.abs(o.x - st.x) > o.r + 200) continue;
          for (let k = 0; k < n; k += 3) { const px = parts[k], py = parts[k + 1], pr = parts[k + 2] * 0.8; if (px + pr > o.x0 + 4 && px - pr < o.x1 - 4 && py + pr > o.y - o.h + 4 && py - pr < o.y) { crash(st, 'spike'); return; } }
          continue;
        }
        if (o.k === 'tnt') { if (s.boom) continue; hx = o.x; hy = o.y; hr = o.r; }
        else if (o.k === 'roll') { if (!s.on || s.gone) continue; hx = s.x; hy = s.y; hr = o.r * 0.92; }
        else { hx = s.x; hy = s.y; hr = o.r * 0.86; }
        if (Math.abs(hx - st.x) > 160 + hr) continue;
        for (let k = 0; k < n; k += 3) {
          const dx = parts[k] - hx, dy = parts[k + 1] - hy, rr = parts[k + 2] + hr;
          if (dx * dx + dy * dy < rr * rr) {
            if (o.k === 'tnt') {
              s.boom = 1; st.ev.push(['boom', hx, hy]);
              const d = Math.sqrt((st.x - hx) * (st.x - hx) + (st.y - hy) * (st.y - hy)) || 1, ix = (st.x - hx) / d * 500, iy = -650;
              st.vx += ix; st.vy += iy; st.w += (ix > 0 ? 1 : -1) * 6;
              for (const W of st.wh) { W.vx += ix; W.vy += iy; }
              crash(st, 'boom');
            } else crash(st, o.k);
            return;
          }
        }
      }
      for (let j = 0; j < L.solid.length; j++) {
        const i = L.solid[j], o = L.objs[i], s = st.o[i];
        if (!(o.k === 'drop' && s.fall === 1) && !(o.k === 'crush' && s.vy > 60)) continue;
        if (Math.abs(s.cx - st.x) > o.hw + 120) continue;
        for (let k = 0; k < n; k += 3) if (obbHit(parts[k], parts[k + 1], parts[k + 2], o, s) && (k < 9 || H.ny > 0.3)) { crash(st, o.k); return; }
      }
    }
    const PARTS = new Float64Array(15);

    function step(L, B, st, inp) {
      const dt = CFG.DT, G = CFG.G, r = B.r, I = IW(B);
      st.t += dt;
      if (st.bst) st.bst = Math.max(0, st.bst - dt);
      if (st.trc) st.trc = Math.max(0, st.trc - dt);
      const alive = !st.crash && !st.fin;
      const up = alive && (inp & 1), dn = alive && (inp & 2), lb = alive && (inp & 4), lf = alive && (inp & 8);
      if ((up || dn) && !st.run) st.run = 1;
      if (st.run && !st.fin) st.time += dt;
      if (st.crash) st.ct += dt;
      st.thr = up ? 1 : dn ? -1 : 0;
      const lean = (lf ? 1 : 0) - (lb ? 1 : 0);
      st.lean += (lean - st.lean) * Math.min(1, dt * 14);
      updObjs(L, st, dt);
      const R = st.wh[0], F = st.wh[1], smax = B.vmax / r;
      if (up) R.s += B.tq * Math.max(0, 1 - R.s / smax) / I * dt;
      else if (dn) {
        const fwd = st.vx * cos(st.a) + st.vy * sin(st.a), bd = CFG.BRAKE / I * dt;
        if (fwd > 40) { for (const W of st.wh) { const q = W === F ? bd * 0.45 : bd; W.s = W.s > q ? W.s - q : W.s < -q ? W.s + q : 0; } }
        else if (R.s > -smax * CFG.REV) R.s -= B.tq * 0.6 / I * dt;
      } else { const bd = CFG.BRAKE * 0.22 / I * dt; for (const W of st.wh) W.s = W.s > bd ? W.s - bd : W.s < -bd ? W.s + bd : 0; }
      const ground = st.air < 0.06;
      let tq;
      if (ground) tq = lean * B.tg;
      else if (lean) { tq = (lean * B.spin - st.w) * ITOT / dt; const lim = ITOT * B.sacc; tq = tq > lim ? lim : tq < -lim ? -lim : tq; }
      else tq = -st.w * ITOT * 0.9;
      if (!alive) tq = 0;
      st.w += tq / CFG.IC * dt;
      st.vy += G * dt; R.vy += G * dt; F.vy += G * dt;
      const ca = cos(st.a), sa = sin(st.a), ux = -sa, uy = ca;
      for (let i = 0; i < 2 && !st.crash; i++) {
        const W = st.wh[i], lx = i ? CFG.WB / 2 : -CFG.WB / 2, ly = CFG.AY;
        const rx = ca * lx - sa * ly, ry = sa * lx + ca * ly, Ax = st.x + rx, Ay = st.y + ry;
        const dx = W.x - Ax, dy = W.y - Ay, du = dx * ux + dy * uy, dp = dx * ca + dy * sa;
        const rvx = W.vx - (st.vx - st.w * ry), rvy = W.vy - (st.vy + st.w * rx), rvu = rvx * ux + rvy * uy, rvp = rvx * ca + rvy * sa;
        let fu = -(B.ks * du + CFG.CS * rvu);
        if (du < -CFG.TRAVEL) fu -= CFG.KB * (du + CFG.TRAVEL);
        else if (du > CFG.TRAVEL) fu -= CFG.KB * (du - CFG.TRAVEL);
        const fp = -(CFG.KP * dp + CFG.CP * rvp);
        const fx = fu * ux + fp * ca, fy = fu * uy + fp * sa;
        W.vx += fx / CFG.MW * dt; W.vy += fy / CFG.MW * dt;
        st.vx -= fx / CFG.MC * dt; st.vy -= fy / CFG.MC * dt;
        st.w -= (rx * fy - ry * fx) / CFG.IC * dt;
      }
      const sp = Math.sqrt(st.vx * st.vx + st.vy * st.vy), dr = 1 - CFG.DRAG * sp * dt;
      st.vx *= dr; st.vy *= dr;
      st.x += st.vx * dt; st.y += st.vy * dt; st.a += st.w * dt;
      for (const W of st.wh) { W.x += W.vx * dt; W.y += W.vy * dt; W.ra += W.s * dt; }
      wheelCol(L, B, st, R); wheelCol(L, B, st, F);
      skid(L, st);
      if (st.crash) { for (const q of FRAME) contactPt(L, st, q[0], q[1], q[2], 0.55); st.w *= 1 - 0.6 * dt; }
      for (let i = 0; i < L.loops.length; i++) {
        const lp = L.loops[i];
        const p = st.lp[i];
        if (p === 0) { if (st.x > lp.x && st.y < lp.y - lp.R * 0.3 && st.x < lp.x + lp.R) st.lp[i] = 1; }
        else if (p === 1) { if (st.x < lp.x - lp.R * 0.2 && st.y < lp.y) st.lp[i] = 2; else if (st.y > lp.y + lp.R * 0.4) st.lp[i] = 0; }
        else if (p === 2) { if (st.x > lp.x + lp.R + 160) st.lp[i] = 3; else if (st.x < lp.x - lp.R - 220) st.lp[i] = 0; }
        else if (st.x < lp.x - lp.R - 220) st.lp[i] = 0;
      }
      if (R.c || F.c) {
        if (st.air > 0.2 && !st.crash) {
          const n = Math.floor((Math.abs(st.rot) + CFG.FLIP_TOL) / (2 * Math.PI));
          if (n > 0 && !st.fin) {
            st.bonus += n * CFG.FLIP; st.flips += n; st.ev.push(['flip', n, st.rot > 0 ? 1 : -1]);
            const c2 = cos(st.a), s2 = sin(st.a), kb = Math.min(320, 150 + 70 * n);
            st.vx += c2 * kb; st.vy += s2 * kb; for (const W of st.wh) { W.vx += c2 * kb; W.vy += s2 * kb; }
            st.bst = Math.max(st.bst || 0, 0.55 + 0.15 * n);
          }
          if (st.air > 0.35) st.ev.push(['land', st.x, st.y, Math.min(1, st.air)]);
        }
        st.air = 0; st.rot = 0;
      } else { st.air += dt; st.rot += st.w * dt; }
      if (alive) {
        for (const q of [CFG.HEAD, CFG.TORSO]) {
          const p = bodyPt(st, q[0] - st.lean * 6, q[1] + Math.abs(st.lean) * 4);
          if (touches(L, st, p.x, p.y, q[2])) { crash(st, 'head'); break; }
        }
        if (!st.crash) hazards(L, B, st);
        if (st.y > L.deathY) crash(st, 'fall');
        if (!st.crash) {
          while (st.cp + 1 < L.flags.length && st.x > L.flags[st.cp + 1].x) { st.cp++; st.ev.push(['cp', st.cp]); }
          if (st.x > L.finish) { st.fin = 1; st.ev.push(['fin']); }
        }
      }
    }
    const progress = (L, st) => { let p = st.x; for (let i = 0; i < L.loops.length; i++) p += (st.lp[i] === 1 ? 3 : st.lp[i] > 1 ? 6 : 0) * L.loops[i].R; return p; };
    const score = st => Math.max(0, st.time - st.bonus);
    const starsFor = (L, t) => t <= L.stars[0] ? 3 : t <= L.stars[1] ? 2 : 1;
    return { CFG, BIKES, LEVELS, progress, build, newState, step, respawn, clone, score, starsFor, bodyPt, IW, touches, H };
  }


  const LEVELS = [
    { name: 'Dusty Start', stars: [24, 34, 51], build: b => b
      .flat(650).deco(250, 'cactus').deco(520, 'sign')
      .ramp(0, 240, 70).flat(240).flat(700).deco(400, 'rock')
      .hill(280, -80).hill(280, 80).flat(250).flag()
      .flat(250).deco(120, 'sign').jump(280, 95, 260).flat(450).deco(200, 'cactus')
      .plat(420, 60).flat(400).flag()
      .hill(240, -60).hill(240, 60).hill(240, -60).hill(240, 60).flat(300).deco(150, 'sign').jump(240, 80).flat(300).deco(200, 'cactus')
      .kick(220, 70).gap(200, 10).land(400, 160).flat(300).deco(100, 'rock').flag()
      .plat(300, 50).flat(150).jump(300, 90, 240).flat(200).hill(300, -90).hill(300, 90).flat(500).finish() },
    { name: 'Flip Hill', stars: [28, 39, 58], build: b => b
      .flat(600).deco(300, 'sign')
      .kick(260, 110).gap(220, 30).land(520, 220).flat(500).flag()
      .ramp(0, 230, 85).flat(230).flat(160).tnt(0).flat(500).deco(300, 'cactus')
      .kick(240, 100).gap(240, -20).flat(200).deco(100, 'cactus').land(420, 160).flat(400).flag()
      .ramp(0, 240, 90).flat(240).flat(120).tnt(0).tnt(40).flat(600)
      .kick(300, 140).gap(300, 40).land(600, 260).flat(300).flag()
      .hill(500, -200).flat(100).kick(200, 60).gap(260, 20).land(600, 280).flat(200).ramp(0, 230, 85).flat(230).flat(150).tnt(0).flat(500).finish() },
    { name: 'Timber Bridge', stars: [19, 27, 40], build: b => b
      .flat(600).deco(300, 'sign').bridge(0, 440).gap(440).flat(500).flag()
      .ramp(0, 250, 90).flat(250).bridge(0, 480, 10, -90).gap(480).box(0, -90, 260, 90, 'wood').flat(260).flat(500).deco(200, 'cactus')
      .flag().jump(300, 70, 220).flat(200).bridge(0, 400).gap(400).flat(300).hill(400, -120).bridge(0, 360).gap(360).hill(300, 120).flat(400).flag()
      .plat(200, 80).bridge(0, 520, 11, -80).gap(520).box(0, -80, 200, 80, 'wood').flat(200).flat(300).bridge(0, 300).gap(300).flat(200).bridge(0, 300).gap(300).flat(500).finish() },
    { name: 'Loop Town', stars: [19, 27, 40], build: b => b
      .flat(500).boost(150).flat(500).loop(110).flat(400).flag()
      .jump(300).flat(300).boost(0).flat(300).loop(120).flat(300).flag()
      .jump(320, 100, 260).land(400, 120).flat(300).boost(0).flat(260).loop(115).flat(300).flag()
      .boost(0).flat(200).loop(110).flat(100).jump(280).flat(200).boost(0).flat(250).loop(125).flat(500).finish() },
    { name: 'Saw Mill', stars: [19, 27, 40], build: b => b
      .flat(600).ramp(0, 240, 90).flat(240).saw(120, -30, 36).flat(600).flag()
      .jump(320, 90, 240).saw(-160, 70, 40, 0, 50, 2).flat(300)
      .spikejump(170, 80).saw(150, -150, 40).saw(400, -150, 40).flat(600).flag()
      .jump(300, 90, 240).saw(-150, -150, 34, 0, 80, 2.4).flat(400)
      .saw(200, -170, 44).flat(400).ramp(0, 160, 60).flat(160).saw(110, -34, 34).flat(500).flag()
      .saw(150, -150, 40).saw(350, -150, 40).saw(550, -150, 40).flat(700).jump(300, 90, 240).saw(-150, 70, 40, 0, 50, 1.7).flat(600).finish() },
    { name: 'Spring Fling', stars: [23, 32, 48], build: b => b
      .flat(600).deco(300, 'sign').tramp(0).flat(74).flat(200).box(0, -170, 900, 170, 'metal').flat(900).flat(500).flag()
      .tramp(0).flat(74).gap(500).flat(700).deco(300, 'cactus').flag()
      .tramp(0).flat(74).flat(150).box(0, -150, 900, 150, 'wood').tramp(760, 74, -150).flat(900).gap(460).flat(800).flag()
      .tramp(0).flat(74).gap(420).flat(500).ramp(0, 230, 85).flat(230).flat(140).tnt(0).flat(700).finish() },
    { name: 'Crusher Alley', stars: [21, 30, 45], build: b => b
      .flat(700).crusher(0, 90, 120, 150, 2.4, 0).flat(500).crusher(0, 90, 120, 150, 2.4, 0.3).flat(500).flag()
      .crusher(0, 90, 120, 150, 2.2, 0.5).crusher(300, 90, 120, 150, 2.2, 0.7).flat(600).jump(300).flat(300).flag()
      .plat(700, 70).crusher(-560, 90, 120, 220, 2.6, 0.2).crusher(-260, 90, 120, 220, 2.6, 0.45).flat(500).flag()
      .crusher(0, 120, 120, 150, 2, 0).crusher(240, 120, 120, 150, 2, 0.15).crusher(480, 120, 120, 150, 2, 0.3).flat(900).jump(300).flat(600).finish() },
    { name: 'Swing Time', stars: [16, 23, 34], build: b => b
      .flat(700).swing(0, -300, 240, 0.9, 2.6, 0).flat(500).swing(0, -300, 240, 0.9, 2.6, 0).flat(500).flag()
      .bridge(0, 480).swing(240, -300, 240, 0.8, 2.4, 0.25).gap(480).flat(500).jump(300).flat(300).flag()
      .swing(100, -320, 250, 1, 3, 0).swing(800, -320, 250, 1, 3, 0).flat(1100).flag()
      .plat(600, 70).swing(-300, -380, 240, 0.9, 2.5, 0.3).flat(300).jump(300).swing(-150, -320, 200, 1.1, 2.2, 0).flat(600).finish() },
    { name: 'Rockfall', stars: [15, 21, 32], build: b => b
      .flat(700).drop(0, -420, 80, 80, -150).flat(500).drop(0, -420, 80, 80, -150).flat(500).flag()
      .jump(300).flat(200).drop(100, -460, 90, 90, -120).drop(400, -460, 90, 90, 150).flat(700).flag()
      .drop(0, -400, 120, 60, -250).flat(500).bridge(0, 400).drop(200, -420, 80, 80, -150).gap(400).flat(500).flag()
      .drop(100, -440, 80, 80, -100).drop(300, -440, 80, 80, 60).drop(500, -440, 80, 80, 260).flat(800).jump(300).flat(600).finish() },
    { name: 'Log Jam', stars: [18, 25, 38], build: b => b
      .flat(600).ramp(0, 240, 90).flat(240).roll(500, 0, 30, -700, -260).flat(700).flag()
      .ramp(0, 260, 100).flat(260).roll(600, 0, 32, -900, -300).roll(900, 0, 32, -900, -300).flat(900).flag()
      .hill(500, -160).flat(300).hill(500, 160).flat(200).ramp(0, 240, 90).flat(240).roll(450, 0, 30, -500, -300).flat(600).flag()
      .ramp(0, 240, 90).flat(240).roll(450, 0, 28, -600, -350).flat(800).ramp(0, 240, 90).flat(240).roll(450, 0, 28, -600, -350).flat(800).finish() },
    { name: 'Lift Off', stars: [44, 62, 93], build: b => b
      .flat(600).mover(0, 0, 420, 150, 0, 3.6).gap(570).flat(500).flag()
      .mover(0, 0, 160, 0, -160, 3).flat(160).box(0, -160, 500, 160, 'metal').flat(500).flat(400).flag()
      .jump(300).flat(300).mover(0, 0, 420, 160, 0, 3.6, 0.5).gap(580).flat(500).flag().mover(0, 0, 160, 0, -200, 3).flat(160).box(0, -200, 340, 200, 'metal').flat(340).gap(220).flat(400).jump(280).flat(200).mover(0, 0, 400, 170, 0, 3.2, 0.25).gap(570).flat(600).finish() },
    { name: 'TNT Canyon', stars: [20, 28, 42], build: b => b
      .flat(600).ramp(0, 240, 90).flat(240).flat(180).tnt(0).tnt(40).tnt(80).flat(500).flag()
      .jump(300).flat(400).spikejump(180, 85).ramp(0, 180, 60).tnt(330).flat(700).flag()
      .ramp(0, 240, 95).flat(240).flat(170).tnt(0).tnt(40).flat(420).ramp(0, 220, 85).flat(220).flat(120).tnt(0).tnt(40).flat(600).flag()
      .kick(240, 100).gap(260, -10).flat(200).land(500, 180).flat(300).ramp(0, 230, 85).flat(230).flat(140).tnt(0).tnt(40).tnt(80).flat(600).finish() },
    { name: 'Double Loop', stars: [17, 24, 36], build: b => b
      .flat(500).boost(100).flat(400).loop(110).loop(120).flat(400).flag()
      .jump(300).flat(400).boost(0).flat(200).loop(125).flat(300).flag()
      .boost(0).flat(250).loop(110).loop(115).loop(120).flat(300).jump(300).flat(600).finish() },
    { name: 'Ladder Works', stars: [14, 20, 30], build: b => b
      .flat(600).ramp(0, 260, 120, 1, 'ladder').flat(260).box(0, -120, 400, 120, 'metal').flat(400).flat(400).flag().spikejump(160, 80)
      .ramp(0, 220, 80, 1, 'ladder').flat(220).box(0, -80, 260, 80, 'wood').ramp(60, 200, 80, 1, 'ladder', -80).flat(260).box(0, -160, 300, 160, 'metal').flat(300).flat(500).flag()
      .ramp(0, 240, 100, 1, 'ladder').flat(240).box(0, -100, 200, 100, 'metal').ramp(40, 160, 60, 1, 'wood', -100).flat(200).gap(190).box(0, -100, 300, 100, 'metal').flat(300).flat(600).finish() },
    { name: 'Gauntlet', stars: [23, 32, 48], build: b => b
      .flat(600).bridge(0, 400).gap(400).flat(300).saw(200, -150, 40).flat(400).flag()
      .crusher(0, 90, 120, 150, 2.4, 0.2).flat(400).boost(0).flat(300).loop(115).flat(300).spikejump(180, 85).flag()
      .ramp(0, 230, 85).flat(230).flat(140).tnt(0).tnt(40).flat(500).swing(100, -300, 240, 0.9, 2.6, 0).flat(600).flag().drop(100, -440, 80, 80, -100).flat(300).jump(300, 90, 240).saw(-150, 70, 40, 0, 50, 2).flat(200).bridge(0, 400).gap(400).flat(200).crusher(0, 100, 120, 150, 2.2, 0.4).flat(500).tramp(0).flat(74).gap(420).flat(600).finish() },
    { name: 'Grand Finale', stars: [34, 48, 72], build: b => b
      .flat(600).tramp(0).flat(74).gap(400).flat(400).swing(200, -300, 240, 0.9, 2.6, 0).flat(500).flag()
      .boost(0).flat(300).loop(115).flat(300).drop(100, -420, 80, 80, -150).flat(500).flag()
      .jump(300).flat(300).bridge(0, 400).gap(400).flat(400).flag().crusher(0, 100, 120, 150, 2.2, 0).crusher(260, 100, 120, 150, 2.2, 0.2).flat(600).saw(150, -150, 40).saw(380, -150, 40).flat(500).ramp(0, 230, 85).flat(230).flat(140).tnt(0).tnt(40).flat(500).flag().roll(700, 0, 30, -100, -300).ramp(0, 240, 90).flat(240).flat(600).boost(0).flat(250).loop(115).loop(120).flat(200).kick(260, 110).gap(240, 30).land(500, 200).flat(600).flat(200).spikejump(200, 90).finish() }
  ];

  function makeAudio(api) {
    let ac = null, master = null, sfxBus = null, musBus = null, gtr = null, noise = null, eng = null, nextT = 0, stepI = 0;
    const BPM = 152, S16 = 60 / BPM / 4;
    const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
    const init = () => {
      if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return true; }
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 4;
        master = ac.createGain(); master.gain.value = 0; master.connect(comp); comp.connect(ac.destination);
        sfxBus = ac.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
        musBus = ac.createGain(); musBus.gain.value = 0.32; musBus.connect(master);
        noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 6); }
        const sh = ac.createWaveShaper(); sh.curve = curve;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.8;
        gtr = ac.createGain(); gtr.gain.value = 0.5; gtr.connect(sh); sh.connect(lp); lp.connect(musBus);
        const o1 = ac.createOscillator(), o2 = ac.createOscillator(), es = ac.createWaveShaper(), ef = ac.createBiquadFilter(), eg = ac.createGain(), pre = ac.createGain();
        o1.type = 'sawtooth'; o2.type = 'square'; es.curve = curve; ef.type = 'lowpass'; ef.frequency.value = 900; ef.Q.value = 2; eg.gain.value = 0; pre.gain.value = 0.35;
        o1.connect(pre); o2.connect(pre); pre.connect(es); es.connect(ef); ef.connect(eg); eg.connect(master);
        o1.start(); o2.start();
        eng = { o1, o2, ef, eg };
        if (ac.state === 'suspended') ac.resume().catch(() => {});
      } catch (e) { ac = null; }
      return !!ac;
    };
    const env = (g, t, a, v, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d); };
    function tone(type, f, t, d, v, dest, f2) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      env(g, t, 0.004, v, d); o.connect(g); g.connect(dest || sfxBus); o.start(t); o.stop(t + d + 0.05);
    }
    function hiss(t, d, v, f, type, f2, dest) {
      const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f, t);
      if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
      env(g, t, 0.003, v, d); s.connect(fl); fl.connect(g); g.connect(dest || sfxBus);
      s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
    }
    const RIFF = [40, 40, 40, 43, 40, 40, 45, 40, 40, 40, 40, 43, 40, 47, 45, 43];
    const ROOTS = [40, 40, 36, 38, 40, 40, 43, 45];
    const ACC = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0];
    const LEAD = [64, 0, 67, 0, 69, 0, 67, 64, 62, 0, 64, 0, 0, 0, 0, 0, 64, 0, 67, 0, 71, 0, 69, 67, 69, 0, 67, 64, 62, 64, 0, 0];
    function musicStep(i, t) {
      const bar = (i >> 4) % 8, s = i % 16, root = ROOTS[bar], sec = (i >> 7) % 2;
      if (s % 4 === 0 || s === 10 || (s === 7 && bar % 2)) tone('sine', 120, t, 0.14, 0.5, musBus, 45);
      if (s === 4 || s === 12) { hiss(t, 0.16, 0.32, 1800, 'bandpass', 900, musBus); tone('triangle', 200, t, 0.08, 0.18, musBus, 140); }
      if (s % 2 === 0) hiss(t, 0.035, 0.08, 7000, 'highpass', 0, musBus);
      if (bar === 7 && s >= 12) hiss(t, 0.08, 0.2, 2400, 'bandpass', 1200, musBus);
      const n = bar < 4 ? RIFF[s] - 40 + root : root, acc = ACC[s], dur = acc ? 0.22 : 0.07;
      for (const iv of [0, 7, 12]) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sawtooth'; o.frequency.value = mtof(n + iv + 12); o.detune.value = iv ? 6 : -4;
        env(g, t, 0.003, acc ? 0.22 : 0.13, dur); o.connect(g); g.connect(gtr); o.start(t); o.stop(t + dur + 0.03);
      }
      if (s % 2 === 0) tone('triangle', mtof(root), t, S16 * 1.8, 0.28, musBus);
      if (sec) { const ln = LEAD[i % 32]; if (ln) tone('square', mtof(ln), t, S16 * 1.9, 0.045, musBus); }
    }
    return {
      init,
      get ok() { return !!ac; },
      update(playing, rpm, thr, musicOn) {
        if (!ac) return;
        const t = ac.currentTime, m = api.muted;
        master.gain.setTargetAtTime(m ? 0 : 0.85, t, 0.03);
        eng.eg.gain.setTargetAtTime(playing && !m ? 0.07 + 0.05 * thr : 0, t, 0.05);
        const f = 34 + rpm * 92 + thr * 6;
        eng.o1.frequency.setTargetAtTime(f, t, 0.04); eng.o2.frequency.setTargetAtTime(f * 0.5 + 1.5, t, 0.04);
        eng.ef.frequency.setTargetAtTime(500 + rpm * 1400 + thr * 300, t, 0.05);
        if (musicOn && !m && ac.state === 'running') {
          if (nextT < t) nextT = t + 0.05;
          while (nextT < t + 0.2) { musicStep(stepI++, nextT); nextT += S16; }
        } else nextT = 0;
      },
      sfx(name, k) {
        if (!ac || api.muted || ac.state !== 'running') return;
        const t = ac.currentTime + 0.005;
        switch (name) {
          case 'crash': hiss(t, 0.45, 0.6, 1400, 'lowpass', 200); tone('triangle', 130, t, 0.3, 0.5, null, 50); break;
          case 'boom': hiss(t, 1.1, 0.9, 2600, 'lowpass', 90); tone('sine', 90, t, 0.6, 0.8, null, 30); break;
          case 'flip': [0, 4, 7, 12].forEach((s, i) => tone('square', mtof(76 + s + (k > 1 ? 5 : 0)), t + i * 0.055, 0.12, 0.09)); break;
          case 'cp': tone('sine', 880, t, 0.12, 0.25); tone('sine', 1320, t + 0.1, 0.25, 0.25); break;
          case 'fin': [0, 4, 7, 12, 16].forEach((s, i) => tone('square', mtof(67 + s), t + i * 0.09, 0.22, 0.12)); tone('sine', mtof(91), t + 0.45, 0.6, 0.15); break;
          case 'land': hiss(t, 0.12, 0.25 * (k || 1), 500, 'lowpass', 120); break;
          case 'boost': hiss(t, 0.5, 0.35, 600, 'bandpass', 3500); break;
          case 'tramp': tone('sine', 180, t, 0.35, 0.4, null, 720); break;
          case 'thud': tone('sine', 70, t, 0.3, 0.6, null, 35); hiss(t, 0.2, 0.3, 400, 'lowpass', 100); break;
          case 'star': tone('sine', mtof(84 + (k || 0) * 4), t, 0.3, 0.2); tone('triangle', mtof(96 + (k || 0) * 4), t, 0.2, 0.06); break;
          case 'tap': tone('sine', 660, t, 0.06, 0.15); break;
          case 'start': tone('square', 440, t, 0.12, 0.1); tone('square', 880, t + 0.12, 0.2, 0.1); break;
        }
      },
      close() { try { if (ac) ac.close(); } catch (e) {} ac = null; }
    };
  }

  const fmtT = v => { v = Math.max(0, v); const m = Math.floor(v / 60), s = v - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); };
  const LEVEL_NEED = i => i === 0 ? 0 : Math.floor(i * 1.5);
  const FONT = (w, s) => `${w} ${s}px Nunito, system-ui, sans-serif`;

  function mount(root, api) {
    const SIM = motoSim(), { CFG, BIKES, build, newState, step, respawn, score, starsFor, touches, H } = SIM;
    const narrow = (root.clientWidth || 880) < 600;
    const W = narrow ? 420 : 880, HH = narrow ? 600 : 495;
    const { canvas, ctx, toLocal } = api.canvas(W, HH);
    canvas.style.touchAction = 'none'; root.style.touchAction = 'none';
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const ZB = narrow ? 0.62 : 0.84;
    const audio = makeAudio(api), KEYS = api.keys;
    const NL = LEVELS.length;
    const sv = Object.assign({ lv: [], bike: 0 }, api.load() || {});
    if (!Array.isArray(sv.lv)) sv.lv = [];
    for (let i = 0; i < NL; i++) sv.lv[i] = Object.assign({ t: 0, s: 0 }, sv.lv[i] || {});
    if (!(sv.bike >= 0 && sv.bike < BIKES.length)) sv.bike = 0;
    const totStars = () => sv.lv.reduce((a, r) => a + (r.s || 0), 0);
    const unlocked = i => i === 0 || (sv.lv[i - 1].s > 0 && totStars() >= LEVEL_NEED(i));
    const bikeOk = i => totStars() >= BIKES[i].need;
    if (!bikeOk(sv.bike)) sv.bike = 0;
    api.score(totStars());
    const persist = () => api.save(sv);

    const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR); const x = c.getContext('2d'); x.scale(DPR, DPR); fn(x, w, h); return c; };
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const LW = 1200;
    const THEMES = [
      { sky: ['#46b6ee', '#9fdcf5', '#ffe3a8'], orb: 'sun', layers: [[0.56, 90, '#f6c08a', '#f0a76c', '#fbd7a6', 'mesa'], [0.66, 110, '#e08a4f', '#c96a37', '#f2a865', 'mesa'], [0.8, 50, '#b8572c', '#9c4423', null, 'near']], dirt: ['#8f4f2a', '#7d4223', 'rgba(60,25,10,.35)', 'rgba(240,170,110,.22)'], edge: ['#5e2f14', '#e8ae5e', '#fbd896'], grass: ['#7a8f3a', '#b8913e'], pebble: '#9b6a45', plant: 'cactus', dust: '#e2b27a' },
      { sky: ['#2c2a6e', '#b0507e', '#ffb067'], orb: 'dusk', layers: [[0.55, 100, '#a8577a', '#86406a', '#d47c8e', 'mesa'], [0.67, 120, '#743456', '#5c2746', '#9a4a6a', 'mesa'], [0.8, 50, '#3e1a36', '#2c1228', null, 'near']], dirt: ['#6e3b33', '#5c2f2a', 'rgba(40,10,10,.35)', 'rgba(255,170,140,.18)'], edge: ['#341614', '#d0805c', '#f6b184'], grass: ['#9a7a54', '#b48a5c'], pebble: '#7a4a3e', plant: 'cactus', dust: '#d29a7a' },
      { sky: ['#4fb2f0', '#a6dcf7', '#e6f7df'], orb: 'sun', layers: [[0.5, 70, '#a9d4b2', '#8cbf98', null, 'hills'], [0.6, 70, '#66a86b', '#4f8f56', null, 'pines'], [0.72, 30, '#2f6d3a', '#245a2e', null, 'pines']], dirt: ['#7a5232', '#694529', 'rgba(40,20,10,.35)', 'rgba(200,160,110,.2)'], edge: ['#38260f', '#58a838', '#92d65c'], grass: ['#3e8f2a', '#6cc23c'], pebble: '#8a8478', plant: 'pine', dust: '#b99a6a' },
      { sky: ['#070b26', '#1e2766', '#4c3f86'], orb: 'moon', stars: 1, layers: [[0.5, 110, '#2b3064', '#22275a', null, 'peaks'], [0.6, 80, '#1b1e46', '#14173a', null, 'city'], [0.72, 30, '#101230', '#0b0c24', null, 'pines']], dirt: ['#3b3654', '#312d48', 'rgba(10,8,30,.4)', 'rgba(160,150,255,.12)'], edge: ['#141228', '#6c63b0', '#b0a6ff'], grass: ['#4c4c80', '#5e5ea0'], pebble: '#5a5878', plant: 'lamp', dust: '#8c86b8' },
      { sky: ['#73bdf0', '#c6e6fa', '#f5fbff'], orb: 'sun', layers: [[0.48, 130, '#e4eef8', '#c9d8ec', '#ffffff', 'peaks'], [0.6, 100, '#b3c8e0', '#9bb2ce', '#f4f8ff', 'peaks'], [0.72, 30, '#5b7d98', '#486882', null, 'pines']], dirt: ['#7e8898', '#6d7787', 'rgba(30,40,60,.3)', 'rgba(255,255,255,.25)'], edge: ['#3a4452', '#e6f0fb', '#ffffff'], grass: ['#ffffff', '#dfeaf6'], pebble: '#9aa6b6', plant: 'snowpine', dust: '#ffffff' }
    ];
    const themeOf = i => Math.min(THEMES.length - 1, Math.floor(i * THEMES.length / Math.max(1, LEVELS.length)));
    const layer = (hBase, amp, col1, col2, top, kind) => mk(LW, HH, (x, w, h) => {
      const g = x.createLinearGradient(0, h * hBase - amp, 0, h);
      g.addColorStop(0, col1); g.addColorStop(1, col2);
      x.fillStyle = g;
      const base = h * hBase + 30, pts = [[0, base]];
      let px = 0;
      const mesas = [], peaks = [];
      if (kind === 'city') {
        x.fillRect(0, base, w, h - base);
        while (px < w) {
          const bw = 40 + rnd() * 70, bh = 40 + rnd() * amp * 1.4;
          x.fillStyle = g; x.fillRect(px, base - bh, bw - 6, bh + 2);
          if (rnd() < 0.3) x.fillRect(px + bw * 0.4, base - bh - 18, 4, 18);
          x.fillStyle = 'rgba(255,214,120,.55)';
          for (let wy = base - bh + 8; wy < base - 8; wy += 12) for (let wx = px + 6; wx < px + bw - 14; wx += 10) if (rnd() < 0.32) x.fillRect(wx, wy, 4, 5);
          px += bw;
        }
        return;
      }
      while (px < w - 60) {
        if (kind === 'mesa') {
          const ww = 80 + rnd() * 160, hh = h * hBase - rnd() * amp, sl = 14 + rnd() * 20;
          pts.push([px, base], [px + sl, hh], [px + ww - sl, hh], [px + ww, base]);
          mesas.push([px, ww, hh, sl]);
          px += ww + rnd() * 60;
        } else {
          const ww = (kind === 'hills' ? 140 : 60) + rnd() * 120, py = h * hBase - rnd() * amp;
          pts.push([px + ww / 2, py]); peaks.push([px + ww / 2, py, ww]);
          px += ww;
        }
      }
      pts.push([w, base]);
      x.beginPath(); x.moveTo(0, h);
      if (kind === 'hills') { x.lineTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; x.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); } x.lineTo(w, base); }
      else for (const p of pts) x.lineTo(Math.min(w, p[0]), p[1]);
      x.lineTo(w, h); x.closePath(); x.fill();
      if (kind === 'peaks') {
        for (const [qx, qy, ww] of peaks) {
          x.fillStyle = 'rgba(0,0,30,.12)'; x.beginPath(); x.moveTo(qx, qy); x.lineTo(qx + ww * 0.5, base); x.lineTo(qx + ww * 0.12, base); x.closePath(); x.fill();
          if (top) { const d = Math.min(40, (base - qy) * 0.35); x.fillStyle = top; x.beginPath(); x.moveTo(qx, qy); x.lineTo(qx + d * 0.9, qy + d); x.lineTo(qx + d * 0.35, qy + d * 0.8); x.lineTo(qx, qy + d * 1.05); x.lineTo(qx - d * 0.4, qy + d * 0.75); x.lineTo(qx - d * 0.9, qy + d); x.closePath(); x.fill(); }
        }
      }
      if (kind === 'pines') {
        for (let i = 0; i < 46; i++) {
          const cx = rnd() * w, cy = h * hBase + 22 + rnd() * 26, s = 0.6 + rnd() * 0.8;
          x.fillStyle = i & 1 ? col2 : col1;
          for (let k = 0; k < 3; k++) { const yy = cy - 18 * s - k * 13 * s, ww = (20 - k * 5) * s; x.beginPath(); x.moveTo(cx, yy - 20 * s); x.lineTo(cx + ww, yy + 6 * s); x.lineTo(cx - ww, yy + 6 * s); x.closePath(); x.fill(); }
          x.fillRect(cx - 2.5 * s, cy - 14 * s, 5 * s, 16 * s);
        }
      }
      for (const [mx, mw, mh, ms] of mesas) {
        x.fillStyle = 'rgba(110,40,10,.2)'; x.beginPath(); x.moveTo(mx + mw * 0.6, mh); x.lineTo(mx + mw - ms, mh); x.lineTo(mx + mw, base); x.lineTo(mx + mw * 0.68, base); x.closePath(); x.fill();
        x.fillStyle = 'rgba(255,235,190,.16)'; x.beginPath(); x.moveTo(mx + ms, mh); x.lineTo(mx + ms + 14, mh); x.lineTo(mx + 14, base); x.lineTo(mx, base); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(120,50,20,.14)'; x.lineWidth = 2;
        for (let k = 0; k < 4; k++) { const yy = mh + 12 + k * 20 + (mw % 7); if (yy > base - 6) break; const dx = ms * (yy - mh) / (base - mh); x.beginPath(); x.moveTo(mx + dx + 3, yy); x.lineTo(mx + mw - dx - 3, yy + (k % 2 ? 2 : -1)); x.stroke(); }
        x.fillStyle = 'rgba(255,235,190,.2)'; x.fillRect(mx + ms, mh, mw - 2 * ms, 3);
      }
      if (top && kind === 'mesa') {
        x.strokeStyle = top; x.lineWidth = 3; x.beginPath();
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if (Math.abs(a[1] - b[1]) < 1 && a[1] < base - 2 && b[0] - a[0] > 4) { x.moveTo(a[0], a[1] + 1.5); x.lineTo(b[0], b[1] + 1.5); } }
        x.stroke();
        x.fillStyle = 'rgba(255,255,255,.08)';
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if (Math.abs(a[1] - b[1]) < 1 && a[1] < base - 2 && b[0] - a[0] > 4) for (let k = 1; k < 4; k++) x.fillRect(a[0] + 4 + k * 3, a[1] + k * 18, b[0] - a[0] - 8 - k * 6, 4); }
      }
      if (kind === 'near') {
        x.strokeStyle = col2; x.lineCap = 'round';
        for (let i = 0; i < 9; i++) {
          const cx = 30 + rnd() * (w - 60), cy = h * hBase + 10 + rnd() * 30, s = 0.7 + rnd() * 0.6;
          const arms = () => { x.beginPath(); x.moveTo(cx, cy - 25 * s); x.lineTo(cx - 16 * s, cy - 25 * s); x.lineTo(cx - 16 * s, cy - 45 * s); x.moveTo(cx, cy - 35 * s); x.lineTo(cx + 15 * s, cy - 35 * s); x.lineTo(cx + 15 * s, cy - 52 * s); x.stroke(); };
          x.strokeStyle = shade(col2, -22); x.lineWidth = 12 * s; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx, cy - 60 * s); x.stroke();
          x.lineWidth = 8 * s; arms();
          x.strokeStyle = 'rgba(255,190,140,.2)'; x.lineWidth = 2.4 * s; x.beginPath(); x.moveTo(cx - 3.4 * s, cy - 2 * s); x.lineTo(cx - 3.4 * s, cy - 58 * s); x.stroke();
          x.strokeStyle = col2;
        }
      }
    });
    let LAYERS = [], dirtPat = null, sky = null, TH = THEMES[0], curTheme = -1;
    const sunX = W * 0.78, sunY = HH * 0.2;
    let sunG = null;
    function applyTheme(ti) {
      if (ti === curTheme) return;
      curTheme = ti; TH = THEMES[ti]; seed = 7 + ti * 131;
      LAYERS = TH.layers.map((q, i) => ({ c: layer(q[0], q[1], q[2], q[3], q[4], q[5]), f: [0.06, 0.14, 0.3][i], dy: [0.02, 0.04, 0.08][i] }));
      const D = TH.dirt;
      const dirt = mk(96, 96, (x, w, h) => {
        x.fillStyle = D[0]; x.fillRect(0, 0, w, h);
        x.fillStyle = D[1]; x.fillRect(0, 30, w, 10); x.fillRect(0, 72, w, 7);
        for (let i = 0; i < 60; i++) { x.fillStyle = rnd() < 0.5 ? D[2] : D[3]; const r = 1 + rnd() * 3.5; x.beginPath(); x.ellipse(rnd() * w, rnd() * h, r * 1.4, r, 0, 0, 7); x.fill(); }
      });
      dirtPat = ctx.createPattern(dirt, 'repeat');
      if (dirtPat && dirtPat.setTransform && window.DOMMatrix) dirtPat.setTransform(new DOMMatrix([1 / DPR, 0, 0, 1 / DPR, 0, 0]));
      sky = ctx.createLinearGradient(0, 0, 0, HH);
      sky.addColorStop(0, TH.sky[0]); sky.addColorStop(0.55, TH.sky[1]); sky.addColorStop(1, TH.sky[2]);
      const oy = TH.orb === 'dusk' ? HH * 0.42 : sunY, rad = TH.orb === 'dusk' ? 170 : 120;
      sunG = ctx.createRadialGradient(sunX, oy, 10, sunX, oy, rad);
      const gc = TH.orb === 'moon' ? '220,230,255' : TH.orb === 'dusk' ? '255,200,140' : '255,240,180';
      sunG.addColorStop(0, `rgba(${gc},.9)`); sunG.addColorStop(0.3, `rgba(${gc},.4)`); sunG.addColorStop(1, `rgba(${gc},0)`);
    }
    applyTheme(0);

    let scr = 'title', T = 0, L = null, li = 0, st = null, B = BIKES[sv.bike], acc = 0, shake = 0, finishY = 0;
    let contReq = false, rag = null, finT = 0, finInfo = null, popups = [], btns = [], hoverSel = 0, lastCp = -1, menuSel = 0, crashes = 0, menuX = 0;
    let touchMode = matchMedia('(pointer: coarse)').matches;
    const cam = { x: 0, y: 0, z: ZB };
    const ptrs = new Map();
    const P = [];
    for (let i = 0; i < 360; i++) P.push({ on: 0 });
    let pk = 0;
    const emit = (x, y, vx, vy, life, size, col, g, kind) => { const p = P[pk]; pk = (pk + 1) % P.length; p.on = 1; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.l = p.m = life; p.s = size; p.c = col; p.g = g; p.k = kind || 0; p.r = Math.random() * 6; p.vr = (Math.random() - 0.5) * 10; };
    const R = (a, b) => a + Math.random() * (b - a);

    function startLevel(i) {
      li = i; B = BIKES[sv.bike]; applyTheme(themeOf(i));
      L = build(LEVELS[i], i); st = newState(L, B); acc = 0; rag = null; finInfo = null; popups = []; lastCp = -1; crashes = 0; finT = 0;
      cam.x = st.x - W * 0.36 / ZB; cam.y = st.y - HH * 0.56 / ZB; cam.z = ZB;
      for (const p of P) p.on = 0;
      finishY = 0;
      for (const g of L.grounds) for (let k = 1; k < g.length; k++) { const a = g[k - 1], b = g[k]; if (a[0] <= L.finish && b[0] >= L.finish && b[0] - a[0] > 0.5) finishY = a[1] + (b[1] - a[1]) * (L.finish - a[0]) / (b[0] - a[0]); }
      ptrs.clear();
      scr = 'play';
      audio.init(); audio.sfx('start');
    }
    function popup(text, col, big) { popups.push({ text, col, t: 0, big }); if (popups.length > 3) popups.shift(); }

    function touchBtns() {
      const s = narrow ? 80 : 92, m = 12, y = HH - s - m;
      return [
        { x: m, y, w: s, h: s, bit: 4, ic: 'l' }, { x: m * 2 + s, y, w: s, h: s, bit: 8, ic: 'r' },
        { x: W - m * 2 - s * 2, y, w: s, h: s, bit: 2, ic: 'brake' }, { x: W - m - s, y, w: s, h: s, bit: 1, ic: 'gas' }
      ];
    }
    const TB = touchBtns();
    function inputBits() {
      const k = KEYS;
      let b = 0;
      if (k.has('ArrowUp') || k.has('KeyW')) b |= 1;
      if (k.has('ArrowDown') || k.has('KeyS')) b |= 2;
      if (k.has('ArrowLeft') || k.has('KeyA')) b |= 4;
      if (k.has('ArrowRight') || k.has('KeyD')) b |= 8;
      for (const p of ptrs.values()) for (const tb of TB) if (p.x >= tb.x - 6 && p.x <= tb.x + tb.w + 6 && p.y >= tb.y - 10 && p.y <= tb.y + tb.h + 10) b |= tb.bit;
      return b;
    }

    function handleEvents() {
      for (const e of st.ev) {
        switch (e[0]) {
          case 'crash':
            crashes++; shake = 10; audio.sfx('crash'); contReq = false;
            for (const W of st.wh) { W.vx += R(-120, 120) + st.vx * 0.2; W.vy -= R(120, 260); W.s += R(-20, 20); }
            makeRag();
            for (let i = 0; i < 18; i++) emit(e[1], e[2], R(-200, 200), R(-300, 0), R(0.4, 0.9), R(3, 7), '#d9a066', 700, 0);
            break;
          case 'boom':
            shake = 22; audio.sfx('boom');
            for (let i = 0; i < 40; i++) { const a = R(0, 6.28), v = R(80, 520); emit(e[1], e[2], Math.cos(a) * v, Math.sin(a) * v - 120, R(0.4, 1), R(6, 16), i % 3 ? '#ffb02e' : '#ff5a1f', -60, 1); }
            for (let i = 0; i < 16; i++) emit(e[1], e[2], R(-300, 300), R(-500, -100), R(0.8, 1.6), R(4, 8), '#4a2a1a', 900, 2);
            break;
          case 'flip': {
            const n = e[1];
            popup((n > 1 ? n + 'x ' : '') + (e[2] > 0 ? 'FRONT' : 'BACK') + ' FLIP  -' + (n * CFG.FLIP) + 's  BOOST!', '#ffd23f', true); audio.sfx('flip', n); audio.sfx('boost');
            break;
          }
          case 'cp': if (e[1] > lastCp) { lastCp = e[1]; popup('CHECKPOINT', '#5fe08a'); audio.sfx('cp'); } break;
          case 'fin': audio.sfx('fin'); finT = 0; onFinish(); break;
          case 'land': audio.sfx('land', e[3]); for (let i = 0; i < 8; i++) emit(e[1] + R(-40, 40), e[2] + 30, R(-120, 120), R(-140, -40), R(0.3, 0.6), R(4, 9), TH.dust, 400, 0); break;
          case 'boost': audio.sfx('boost'); break;
          case 'tramp': audio.sfx('tramp'); break;
          case 'thud': audio.sfx('thud'); shake = Math.max(shake, 8); for (let i = 0; i < 10; i++) emit(e[1] + R(-40, 40), e[2], R(-150, 150), R(-160, -40), R(0.4, 0.7), R(4, 9), '#c9a27a', 500, 0); break;
        }
      }
      st.ev.length = 0;
    }

    function pose(l) {
      const sh = [-6 + 13 * l, -42 + 5 * Math.abs(l)];
      return { hip: [-14, -18], sh, head: [sh[0] + 5 + 7 * l, sh[1] - 11], hand: [21, -31], elbow: [(sh[0] + 21) / 2 + 2, (sh[1] - 31) / 2 + 9], knee: [5, -10 + 2 * l], foot: [-4, 5] };
    }
    function toW(lx, ly) { const c = Math.cos(st.a), s = Math.sin(st.a); return [st.x + c * lx - s * ly, st.y + s * lx + c * ly]; }
    function makeRag() {
      const p = pose(st.lean), names = ['head', 'sh', 'hip', 'knee', 'foot', 'elbow', 'hand'];
      const pts = names.map(n => { const w = toW(p[n][0], p[n][1]), rx = w[0] - st.x, ry = w[1] - st.y, vx = st.vx - st.w * ry, vy = st.vy + st.w * rx; return { x: w[0], y: w[1], px: w[0] - vx / 120, py: w[1] - vy / 120 }; });
      const d = (a, b) => Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
      rag = { pts, cons: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [0, 2]].map(([a, b]) => [a, b, d(a, b)]) };
    }
    function stepRag(dt) {
      if (!rag) return;
      const sub = 2, h = dt / sub, g = CFG.G * h * h;
      for (let s = 0; s < sub; s++) {
        for (const p of rag.pts) { const vx = (p.x - p.px) * 0.998, vy = (p.y - p.py) * 0.998; p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + g; }
        for (let it = 0; it < 3; it++) {
          for (const [a, b, l] of rag.cons) {
            const A = rag.pts[a], Bp = rag.pts[b], dx = Bp.x - A.x, dy = Bp.y - A.y, d = Math.hypot(dx, dy) || 1, k = (d - l) / d * 0.5;
            A.x += dx * k; A.y += dy * k; Bp.x -= dx * k; Bp.y -= dy * k;
          }
          for (const p of rag.pts) if (touches(L, st, p.x, p.y, 6)) {
            p.x += H.nx * H.pen; p.y += H.ny * H.pen;
            const vx = p.x - p.px, vy = p.y - p.py, vn = vx * H.nx + vy * H.ny;
            if (vn < 0) { const tx = vx - vn * H.nx, ty = vy - vn * H.ny; p.px = p.x - tx * 0.8 + vn * H.nx * 0.25; p.py = p.y - ty * 0.8 + vn * H.ny * 0.25; }
          }
        }
      }
    }

    function onFinish() {
      const t = score(st), stars = starsFor(L, t), r = sv.lv[li], prevTot = totStars();
      const best = !r.t || t < r.t;
      if (best) r.t = +t.toFixed(2);
      r.s = Math.max(r.s, stars);
      persist();
      const tot = totStars();
      api.score(tot);
      const nb = api.submit(tot);
      const newBikes = BIKES.filter(b => b.need > prevTot && b.need <= tot).map(b => b.name);
      finInfo = { t, stars, best, bestT: r.t, flips: st.flips, crashes, nb, newBikes, shown: 0 };
    }

    function camera(dt) {
      const sp = Math.hypot(st.vx, st.vy);
      const tz = ZB * (1 - Math.min(0.16, sp / 6000));
      cam.z += (tz - cam.z) * Math.min(1, dt * 2);
      const vw = W / cam.z, vh = HH / cam.z;
      const tx = st.x - vw * (narrow ? 0.36 : 0.34) + Math.max(-60, Math.min(160, st.vx * 0.2)), ty = st.y - vh * (narrow ? 0.6 : 0.56) + Math.max(-80, Math.min(110, st.vy * 0.12));
      cam.x += (tx - cam.x) * Math.min(1, dt * 5);
      cam.y += (ty - cam.y) * Math.min(1, dt * (st.crash ? 2 : 4));
    }

    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    function bolt(x, y, r) { ctx.fillStyle = '#4a2c14'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,230,180,.55)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, 7); ctx.fill(); }
    function rivet(x, y, r) { ctx.fillStyle = '#3b444d'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, 7); ctx.fill(); }
    function woodBox(x, y, w, h) {
      const wg = ctx.createLinearGradient(0, y, 0, y + h); wg.addColorStop(0, '#d99a52'); wg.addColorStop(0.5, '#c98642'); wg.addColorStop(1, '#a96a32');
      ctx.fillStyle = wg; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#e8b06a'; ctx.fillRect(x, y, w, Math.min(h, 6));
      ctx.strokeStyle = '#94592a'; ctx.lineWidth = 2; ctx.beginPath();
      for (let yy = y + 16; yy < y + h - 2; yy += 16) { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); }
      for (let i = 0, yy = y; yy < y + h - 2; yy += 16, i++) for (let xx = x + (i % 2 ? 40 : 80); xx < x + w - 4; xx += 120) { ctx.moveTo(xx, yy); ctx.lineTo(xx, Math.min(y + h, yy + 16)); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,230,180,.28)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let yy = y + 5, i = 0; yy < y + h - 2; yy += 16, i++) { const o = (i * 37) % 60; ctx.moveTo(x + 8 + o, yy + 4); ctx.bezierCurveTo(x + 40 + o, yy + 2, x + 70 + o, yy + 6, x + Math.min(w - 6, 110 + o), yy + 4); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(80,40,10,.3)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let yy = y + 12, i = 0; yy < y + h - 2; yy += 16, i++) { const o = (i * 53) % 70; ctx.moveTo(x + 14 + o, yy); ctx.bezierCurveTo(x + 30 + o, yy - 1.5, x + 60 + o, yy + 1.5, x + Math.min(w - 8, 90 + o), yy); }
      ctx.stroke();
      ctx.strokeStyle = '#6e3f1c'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x + 3, y + h - 6, w - 6, 3);
      bolt(x + 7, y + Math.min(8, h / 2), 3); bolt(x + w - 7, y + Math.min(8, h / 2), 3); if (h > 30) { bolt(x + 7, y + h - 8, 3); bolt(x + w - 7, y + h - 8, 3); }
    }
    function metalBox(x, y, w, h) {
      const mg = ctx.createLinearGradient(0, y, 0, y + h); mg.addColorStop(0, '#8593a0'); mg.addColorStop(1, '#5c6874');
      ctx.fillStyle = mg; ctx.fillRect(x, y, w, h);
      if (h > 24) {
        ctx.strokeStyle = '#4c5762'; ctx.lineWidth = 5; ctx.beginPath();
        const n = Math.max(1, Math.round(w / Math.max(40, h)));
        for (let i = 0; i < n; i++) { const a = x + w * i / n, b = x + w * (i + 1) / n; ctx.moveTo(a + 6, y + 6); ctx.lineTo(b - 6, y + h - 6); ctx.moveTo(b - 6, y + 6); ctx.lineTo(a + 6, y + h - 6); }
        ctx.stroke();
      }
      ctx.fillStyle = '#a8b4bf'; ctx.fillRect(x, y, w, 7); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, y, w, 2); ctx.fillStyle = '#56626d'; ctx.fillRect(x, y + h - 6, w, 6); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, y + h - 2, w, 2);
      ctx.strokeStyle = '#38414a'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      for (let xx = x + 8; xx < x + w - 4; xx += 26) { rivet(xx, y + 4, 2.2); if (h > 24) rivet(xx, y + h - 4, 2.2); }
    }
    function crateBox(x, y, w, h) {
      const cg = ctx.createLinearGradient(0, y, 0, y + h); cg.addColorStop(0, '#e6b068'); cg.addColorStop(1, '#c48a46');
      ctx.fillStyle = cg; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(120,70,20,.3)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 1; k < 5; k++) { ctx.moveTo(x + 6, y + h * k / 5); ctx.lineTo(x + w - 6, y + h * k / 5 + 1); } ctx.stroke();
      ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 6; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + w - 6, y + h - 6); ctx.stroke();
      ctx.strokeStyle = '#5e3a18'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      bolt(x + 6, y + 6, 2.5); bolt(x + w - 6, y + 6, 2.5); bolt(x + 6, y + h - 6, 2.5); bolt(x + w - 6, y + h - 6, 2.5);
    }
    function drawRamp(r) {
      const top = r.top, metal = r.st === 'metal', ladder = r.st === 'ladder', x0 = top[0][0], x1 = top[top.length - 1][0];
      ctx.beginPath(); ctx.moveTo(x0, r.y0);
      for (const p of top) ctx.lineTo(p[0], p[1]);
      ctx.lineTo(x1, r.y0); ctx.closePath();
      if (ladder) ctx.fillStyle = 'rgba(90,50,20,.16)';
      else { const rg = ctx.createLinearGradient(0, Math.min(...top.map(q => q[1])), 0, r.y0); rg.addColorStop(0, metal ? '#8493a0' : '#d08a48'); rg.addColorStop(1, metal ? '#56626d' : '#9c6128'); ctx.fillStyle = rg; }
      ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = metal ? '#4c5762' : ladder ? '#7a4a22' : '#8e5527'; ctx.lineWidth = ladder ? 6 : 5; ctx.beginPath();
      for (let x = x0 + 26; x < x1; x += 34) { ctx.moveTo(x, r.y0); ctx.lineTo(x, r.y0 - r.h - 10); }
      if (!ladder) for (let x = x0 - 68; x < x1; x += 68) { ctx.moveTo(x, r.y0); ctx.lineTo(x + 68, r.y0 - 70); }
      ctx.stroke(); ctx.restore();
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); for (const p of top) ctx.lineTo(p[0], p[1]);
      ctx.strokeStyle = metal ? '#38414a' : '#6a3b16'; ctx.lineWidth = 11; ctx.stroke();
      ctx.strokeStyle = metal ? '#a7b3be' : '#e0a565'; ctx.lineWidth = 5; ctx.stroke();
      const e = r.dir > 0 ? top[top.length - 1] : top[0];
      ctx.strokeStyle = metal ? '#38414a' : '#6a3b16'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(e[0], r.y0); ctx.stroke();
      for (let i = 1; i < top.length - 1; i += 3) (metal ? rivet : bolt)(top[i][0], top[i][1] + 1, 2.4);
    }
    function drawLoop(lp) {
      const { x, y, R: Rr } = lp, a0 = 80 * Math.PI / 180, a1 = -260 * Math.PI / 180;
      ctx.lineCap = 'butt';
      ctx.lineCap = 'round'; ctx.strokeStyle = '#4c5762'; ctx.lineWidth = 9;
      ctx.beginPath();
      for (const sd of [-1, 1]) { ctx.moveTo(x + sd * (Rr + 14), y + Rr * 0.1); ctx.lineTo(x + sd * (Rr + 46), y + Rr); ctx.moveTo(x + sd * (Rr + 10), y + Rr * 0.55); ctx.lineTo(x + sd * (Rr + 40), y + Rr * 0.55); }
      ctx.stroke(); ctx.lineCap = 'butt';
      ctx.fillStyle = '#38414a'; for (const sd of [-1, 1]) ctx.fillRect(x + sd * (Rr + 46) - 14, y + Rr - 6, 28, 6);
      ctx.beginPath(); ctx.arc(x, y, Rr + 9, a1, a0, false);
      ctx.strokeStyle = '#38414a'; ctx.lineWidth = 22; ctx.stroke();
      ctx.strokeStyle = '#7f8c98'; ctx.lineWidth = 16; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, Rr + 3, a1, a0, false); ctx.strokeStyle = '#c4ced6'; ctx.lineWidth = 4; ctx.stroke();
      for (let a = a1 + 0.15; a < a0 - 0.05; a += 0.28) rivet(x + Math.cos(a) * (Rr + 11), y + Math.sin(a) * (Rr + 11), 2.4);
    }
    function drawGround(x0, x1) {
      for (const g of L.grounds) {
        if (g[g.length - 1][0] < x0 || g[0][0] > x1) continue;
        ctx.beginPath(); ctx.moveTo(g[0][0], g[0][1]);
        for (let i = 1; i < g.length; i++) ctx.lineTo(g[i][0], g[i][1]);
        ctx.closePath();
        ctx.fillStyle = dirtPat || '#8f4f2a'; ctx.fill();
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath();
        let open = false;
        for (let i = 1; i < g.length; i++) { const a = g[i - 1], b = g[i]; if (Math.abs(b[0] - a[0]) < 0.5) { open = false; continue; } if (!open) { ctx.moveTo(a[0], a[1]); open = true; } ctx.lineTo(b[0], b[1]); }
        ctx.strokeStyle = TH.edge[0]; ctx.lineWidth = 16; ctx.stroke();
        ctx.strokeStyle = TH.edge[1]; ctx.lineWidth = 9; ctx.stroke();
        ctx.save(); ctx.translate(0, -2.5); ctx.strokeStyle = TH.edge[2]; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        ctx.beginPath();
        for (let i = 1; i < g.length; i++) { const a = g[i - 1], b = g[i]; if (Math.abs(b[0] - a[0]) < 0.5) { ctx.moveTo(a[0], Math.min(a[1], b[1])); ctx.lineTo(b[0], Math.max(a[1], b[1])); } }
        ctx.strokeStyle = TH.edge[0]; ctx.lineWidth = 8; ctx.stroke();
        ctx.lineCap = 'round';
        for (let i = 1; i < g.length; i++) {
          const a = g[i - 1], b = g[i], dx = b[0] - a[0];
          if (dx < 0.5 || b[0] < x0 || a[0] > x1 || Math.abs(b[1] - a[1]) > 0.7 * dx) continue;
          const n = Math.floor(dx / 44);
          for (let k = 0; k < n; k++) {
            const t = (k + 0.5) / n, gx = a[0] + dx * t, gy = a[1] + (b[1] - a[1]) * t, h1 = Math.abs(Math.sin(gx * 0.0713)) % 1;
            if (h1 < 0.5) continue;
            ctx.strokeStyle = h1 > 0.85 ? TH.grass[0] : TH.grass[1]; ctx.lineWidth = 1.8; ctx.beginPath();
            for (let q = -2; q <= 2; q++) { ctx.moveTo(gx + q * 2.4, gy - 3); ctx.quadraticCurveTo(gx + q * 3.6, gy - 8 - (3 - Math.abs(q)) * 2, gx + q * 5.4, gy - 9 - (3 - Math.abs(q)) * 1.5); }
            ctx.stroke();
            if (h1 > 0.72) { ctx.fillStyle = TH.pebble; ctx.beginPath(); ctx.ellipse(gx + 18, gy - 3, 5, 3, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(gx + 16.5, gy - 4.4, 2.2, 1, 0, 0, 7); ctx.fill(); }
          }
        }
      }
    }
    function drawDeco(d) {
      ctx.save(); ctx.translate(d.x, d.y);
      if (d.kind === 'cactus' && TH.plant !== 'cactus') {
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(6, 1, 30, 5, 0, 0, 7); ctx.fill();
        if (TH.plant === 'lamp') {
          ctx.fillStyle = '#2a2840'; ctx.fillRect(-4, -96, 8, 96); ctx.fillRect(-4, -96, 30, 6);
          ctx.fillStyle = '#4a4870'; ctx.fillRect(-2, -94, 3, 92);
          const lg = ctx.createRadialGradient(24, -86, 2, 24, -86, 60); lg.addColorStop(0, 'rgba(255,230,150,.75)'); lg.addColorStop(1, 'rgba(255,230,150,0)');
          ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(14, -88); ctx.lineTo(34, -88); ctx.lineTo(62, 0); ctx.lineTo(-14, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.ellipse(24, -88, 9, 4, 0, 0, 7); ctx.fill();
        } else {
          ctx.fillStyle = '#5a3a22'; ctx.fillRect(-5, -22, 10, 22);
          const snow = TH.plant === 'snowpine';
          for (let k = 0; k < 4; k++) {
            const yy = -20 - k * 22, ww = 34 - k * 7;
            ctx.fillStyle = k & 1 ? '#2f7a3c' : '#276a33'; ctx.beginPath(); ctx.moveTo(0, yy - 34); ctx.lineTo(ww, yy + 4); ctx.lineTo(-ww, yy + 4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(0, yy - 34); ctx.lineTo(-ww, yy + 4); ctx.lineTo(-ww * 0.4, yy + 4); ctx.closePath(); ctx.fill();
            if (snow) { ctx.fillStyle = '#f6fbff'; ctx.beginPath(); ctx.moveTo(0, yy - 34); ctx.lineTo(ww * 0.45, yy - 15); ctx.lineTo(ww * 0.15, yy - 18); ctx.lineTo(-ww * 0.1, yy - 13); ctx.lineTo(-ww * 0.45, yy - 15); ctx.closePath(); ctx.fill(); }
          }
        }
      } else if (d.kind === 'cactus') {
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(10, 1, 28, 5, 0, 0, 7); ctx.fill();
        const arms = () => { ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(-22, -34); ctx.lineTo(-22, -60); ctx.moveTo(0, -46); ctx.lineTo(20, -46); ctx.lineTo(20, -70); ctx.stroke(); };
        ctx.lineCap = 'round'; ctx.strokeStyle = '#1f5c2a'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke(); ctx.lineWidth = 14; arms();
        ctx.strokeStyle = '#2f7d3a'; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke(); ctx.lineWidth = 11; arms();
        ctx.strokeStyle = '#4fa456'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(-3, -78); ctx.stroke(); ctx.save(); ctx.translate(-2, 0); ctx.lineWidth = 3; arms(); ctx.restore();
        ctx.strokeStyle = 'rgba(20,70,30,.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(3, -4); ctx.lineTo(3, -76); ctx.stroke();
        ctx.fillStyle = '#f7f0d0'; for (const [qx, qy] of [[-2, -20], [3, -34], [-2, -50], [3, -64], [-22, -48], [20, -58]]) { ctx.fillRect(qx - 1, qy, 2, 2); }
        ctx.fillStyle = '#ff6fa0'; ctx.beginPath(); ctx.arc(0, -84, 4.4, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, -84, 1.8, 0, 7); ctx.fill();
      } else if (d.kind === 'rock') {
        ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(6, 2, 46, 6, 0, 0, 7); ctx.fill();
        const rg = ctx.createLinearGradient(0, -38, 0, 2); rg.addColorStop(0, '#b8845c'); rg.addColorStop(1, '#7c5238');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(-40, 2); ctx.lineTo(-30, -26); ctx.lineTo(-6, -38); ctx.lineTo(22, -30); ctx.lineTo(40, 2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#5a3a26'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.fillStyle = '#d6a173'; ctx.beginPath(); ctx.moveTo(-30, -26); ctx.lineTo(-6, -38); ctx.lineTo(4, -20); ctx.lineTo(-20, -12); ctx.fill();
        ctx.fillStyle = 'rgba(60,30,15,.3)'; ctx.beginPath(); ctx.moveTo(22, -30); ctx.lineTo(40, 2); ctx.lineTo(10, 2); ctx.lineTo(4, -20); ctx.fill();
        ctx.strokeStyle = 'rgba(60,30,15,.5)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(4, -20); ctx.lineTo(8, -8); ctx.lineTo(2, 2); ctx.stroke();
        ctx.fillStyle = '#8fb04a'; ctx.beginPath(); ctx.ellipse(-14, -33, 6, 2.4, -0.3, 0, 7); ctx.fill();
      } else if (d.kind === 'sign') {
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(8, 1, 22, 4, 0, 0, 7); ctx.fill();
        const pg = ctx.createLinearGradient(-4, 0, 4, 0); pg.addColorStop(0, '#9a6a36'); pg.addColorStop(1, '#5e3a18');
        ctx.fillStyle = pg; ctx.fillRect(-4, -64, 8, 64);
        const bg = ctx.createLinearGradient(0, -78, 0, -46); bg.addColorStop(0, '#f0b66a'); bg.addColorStop(1, '#c98642');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-30, -78); ctx.lineTo(18, -78); ctx.lineTo(34, -62); ctx.lineTo(18, -46); ctx.lineTo(-30, -46); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6a3b16'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.strokeStyle = 'rgba(106,59,22,.35)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-28, -68); ctx.lineTo(10, -68); ctx.moveTo(-28, -56); ctx.lineTo(10, -56); ctx.stroke();
        ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.moveTo(-16, -66); ctx.lineTo(6, -66); ctx.lineTo(6, -72); ctx.lineTo(18, -62); ctx.lineTo(6, -52); ctx.lineTo(6, -58); ctx.lineTo(-16, -58); ctx.fill();
        ctx.strokeStyle = '#6a3b16'; ctx.lineWidth = 1.6; ctx.stroke();
        bolt(-26, -74, 1.8); bolt(-26, -50, 1.8);
      }
      ctx.restore();
    }
    function drawFlag(f, i) {
      const on = st.cp >= i;
      ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(f.x + 8, f.y, 22, 4, 0, 0, 7); ctx.fill();
      const pg = ctx.createLinearGradient(f.x - 3, 0, f.x + 3, 0); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#b8c2cc');
      ctx.fillStyle = pg; ctx.fillRect(f.x - 3, f.y - 110, 6, 110);
      const bgd = ctx.createLinearGradient(0, f.y - 6, 0, f.y); bgd.addColorStop(0, '#7a8793'); bgd.addColorStop(1, '#46515b');
      ctx.fillStyle = bgd; ctx.beginPath(); ctx.roundRect(f.x - 9, f.y - 7, 18, 7, 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(f.x + 3, f.y - 108);
      for (let k = 0; k <= 6; k++) ctx.lineTo(f.x + 3 + k * 9, f.y - 108 + Math.sin(T * 6 + k * 0.8) * 3 * k / 6 + k * 1.5);
      for (let k = 6; k >= 0; k--) ctx.lineTo(f.x + 3 + k * 9, f.y - 74 + Math.sin(T * 6 + k * 0.8) * 3 * k / 6 - k * 1.5);
      ctx.closePath();
      const fg = ctx.createLinearGradient(0, f.y - 108, 0, f.y - 70); fg.addColorStop(0, on ? '#6ee690' : '#ff7a6a'); fg.addColorStop(1, on ? '#25a64f' : '#c92f22');
      ctx.fillStyle = fg; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.clip();
      ctx.fillStyle = 'rgba(0,0,0,.16)';
      for (let k = 0; k < 6; k += 2) { ctx.beginPath(); ctx.moveTo(f.x + 3 + k * 9, f.y - 112); ctx.lineTo(f.x + 3 + (k + 1) * 9, f.y - 112); ctx.lineTo(f.x + 3 + (k + 1) * 9, f.y - 60); ctx.lineTo(f.x + 3 + k * 9, f.y - 60); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x + 22, f.y - 91 + Math.sin(T * 6 + 2) * 1.2, 5.5, 0, 7); ctx.fill();
      ctx.fillStyle = on ? '#25a64f' : '#c92f22'; if (on) { ctx.beginPath(); ctx.moveTo(f.x + 19.5, f.y - 91); ctx.lineTo(f.x + 21.5, f.y - 89); ctx.lineTo(f.x + 25, f.y - 94); ctx.lineWidth = 2; ctx.strokeStyle = '#25a64f'; ctx.stroke(); } else { ctx.beginPath(); ctx.arc(f.x + 22, f.y - 91, 2.2, 0, 7); ctx.fill(); }
      const bg = ctx.createRadialGradient(f.x - 1, f.y - 113, 1, f.x, f.y - 112, 6); bg.addColorStop(0, '#fff3a0'); bg.addColorStop(1, '#e0a010');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(f.x, f.y - 112, 5.4, 0, 7); ctx.fill(); ctx.strokeStyle = '#a06a00'; ctx.lineWidth = 1.4; ctx.stroke();
    }
    function drawFinishGate(x, y) {
      ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(x, y, 100, 6, 0, 0, 7); ctx.fill();
      for (const s of [-1, 1]) {
        const g = ctx.createLinearGradient(x + s * 70 - 7, 0, x + s * 70 + 7, 0); g.addColorStop(0, '#5b6670'); g.addColorStop(0.4, '#98a5b1'); g.addColorStop(1, '#38414a');
        ctx.fillStyle = g; ctx.fillRect(x + s * 70 - 7, y - 170, 14, 170);
        ctx.fillStyle = '#ffc928'; for (let yy = y - 10; yy > y - 160; yy -= 28) ctx.fillRect(x + s * 70 - 7, yy - 8, 14, 8);
        ctx.fillStyle = '#1d1b26'; for (let yy = y - 10; yy > y - 160; yy -= 28) ctx.fillRect(x + s * 70 - 7, yy - 16, 14, 8);
        ctx.fillStyle = '#38414a'; ctx.fillRect(x + s * 70 - 12, y - 8, 24, 8); rivet(x + s * 70 - 7, y - 4, 2); rivet(x + s * 70 + 7, y - 4, 2);
        const on = Math.sin(T * 8 + s) > 0;
        ctx.fillStyle = on ? '#ff5a4a' : '#7a2a22'; ctx.beginPath(); ctx.arc(x + s * 70, y - 176, 6, 0, 7); ctx.fill();
        if (on) { ctx.fillStyle = 'rgba(255,90,70,.3)'; ctx.beginPath(); ctx.arc(x + s * 70, y - 176, 13, 0, 7); ctx.fill(); }
      }
      const bw = 160, bh = 34, bx = x - 80, by = y - 186;
      ctx.fillStyle = '#38414a'; ctx.fillRect(bx - 4, by - 5, bw + 8, bh + 10);
      for (let i = 0; i < 16; i++) for (let j = 0; j < 3; j++) { ctx.fillStyle = (i + j) % 2 ? '#1d1b26' : '#fff'; ctx.fillRect(bx + i * bw / 16, by + j * bh / 3, bw / 16 + 0.5, bh / 3 + 0.5); }
      ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(bx - 4, by - 5, bw + 8, 2);
      const fl = Math.sin(T * 6) * 3;
      for (const s of [-1, 1]) { ctx.fillStyle = s < 0 ? '#ef4b3c' : '#3ccf6a'; ctx.beginPath(); ctx.moveTo(x + s * 70, y - 196); ctx.lineTo(x + s * 70 + s * (26 + fl), y - 190); ctx.lineTo(x + s * 70, y - 182); ctx.closePath(); ctx.fill(); }
    }
    function sawShape(r) {
      ctx.beginPath();
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, b = (i + 0.6) / 16 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82); ctx.lineTo(Math.cos(b) * r, Math.sin(b) * r); }
      ctx.closePath();
    }
    function stripes(x, y, w, h, c1, c2) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.fillStyle = c1; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = c2;
      for (let xx = x - h * 2; xx < x + w; xx += h * 2) { ctx.beginPath(); ctx.moveTo(xx, y + h); ctx.lineTo(xx + h, y); ctx.lineTo(xx + h * 2, y); ctx.lineTo(xx + h, y + h); ctx.fill(); }
      ctx.restore();
    }
    function drawObj(o, s) {
      switch (o.k) {
        case 'spike': {
          const n = Math.max(2, Math.round((o.x1 - o.x0) / 22)), sw = (o.x1 - o.x0) / n;
          ctx.fillStyle = '#2d3238'; ctx.fillRect(o.x0 - 4, o.y - 7, o.x1 - o.x0 + 8, 9);
          ctx.fillStyle = '#5b636c'; ctx.fillRect(o.x0 - 4, o.y - 7, o.x1 - o.x0 + 8, 3);
          for (let i = 0; i < n; i++) {
            const x = o.x0 + i * sw, g = ctx.createLinearGradient(x, 0, x + sw, 0);
            g.addColorStop(0, '#eef2f5'); g.addColorStop(0.5, '#a6b0ba'); g.addColorStop(1, '#5d6670');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 1, o.y - 6); ctx.lineTo(x + sw / 2, o.y - o.h - 6); ctx.lineTo(x + sw - 1, o.y - 6); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();
            ctx.fillStyle = '#d83a2a'; ctx.beginPath(); ctx.moveTo(x + sw / 2 - 2.6, o.y - o.h + 1); ctx.lineTo(x + sw / 2, o.y - o.h - 6); ctx.lineTo(x + sw / 2 + 2.6, o.y - o.h + 1); ctx.closePath(); ctx.fill();
          }
          break;
        }
        case 'plank': if (s.gone) return; ctx.save(); ctx.translate(s.cx, s.cy); ctx.rotate(s.a); woodBox(-o.hw, -o.hh, o.hw * 2, o.hh * 2); ctx.restore(); break;
        case 'mover': {
          ctx.strokeStyle = 'rgba(56,65,74,.35)'; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.ax, o.y + o.ay); ctx.stroke(); ctx.setLineDash([]);
          const x = s.cx - o.hw, y = s.cy - o.hh;
          metalBox(x, y, o.hw * 2, o.hh * 2 + 12);
          stripes(x + 3, y + o.hh * 2 + 2, o.hw * 2 - 6, 7, '#1d1b26', '#ffd23f');
          ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 2, y, o.hw * 2 - 4, 4);
          break;
        }
        case 'crush': {
          const x = s.cx - o.hw, y = s.cy - o.hh;
          ctx.fillStyle = '#4c5762'; ctx.fillRect(s.cx - 9, y - 700, 18, 700); ctx.fillStyle = '#a7b3be'; ctx.fillRect(s.cx - 4, y - 700, 4, 700);
          metalBox(x, y, o.hw * 2, o.hh * 2);
          stripes(x, y + o.hh * 2 - 16, o.hw * 2, 16, '#1d1b26', '#ffc928');
          break;
        }
        case 'drop': {
          const x = s.cx - o.hw, y = s.cy - o.hh;
          if (!s.fall) { ctx.strokeStyle = '#38414a'; ctx.lineWidth = 4; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(s.cx, y - 600); ctx.lineTo(s.cx, y); ctx.stroke(); ctx.setLineDash([]); }
          ctx.fillStyle = '#9b8b7a'; ctx.fillRect(x, y, o.hw * 2, o.hh * 2);
          ctx.fillStyle = '#b5a693'; ctx.fillRect(x, y, o.hw * 2, 8);
          ctx.strokeStyle = '#6d6052'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, o.hw * 2 - 3, o.hh * 2 - 3);
          ctx.beginPath(); ctx.moveTo(x + o.hw * 0.4, y + 4); ctx.lineTo(x + o.hw * 0.7, y + o.hh); ctx.lineTo(x + o.hw * 0.5, y + o.hh * 1.6); ctx.stroke();
          break;
        }
        case 'tnt': {
          if (s.boom) return;
          const x = o.x, y = o.y, r = o.r;
          ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(x + 3, y + r + 2, r * 1.2, 4, 0, 0, 7); ctx.fill();
          const g = ctx.createLinearGradient(x - r, 0, x + r, 0); g.addColorStop(0, '#f0604e'); g.addColorStop(0.45, '#d8342b'); g.addColorStop(1, '#9c1f1a');
          ctx.fillStyle = g; rr(x - r, y - r - 2, r * 2, r * 2 + 4, 6); ctx.fill(); ctx.strokeStyle = '#5a1410'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x - r + 4, y - r, 4, r * 2);
          ctx.fillStyle = '#3b2a22'; ctx.fillRect(x - r, y - r + 4, r * 2, 5); ctx.fillRect(x - r, y + r - 9, r * 2, 5);
          ctx.fillStyle = '#7a6a5c'; ctx.fillRect(x - r, y - r + 4, r * 2, 1.4); ctx.fillRect(x - r, y + r - 9, r * 2, 1.4);
          ctx.fillStyle = '#fff'; ctx.font = FONT(900, 12); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TNT', x, y + 1);
          ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - r - 2); ctx.quadraticCurveTo(x + 3, y - r - 10, x + 9, y - r - 9); ctx.stroke();
          const fl = 3 + Math.abs(Math.sin(T * 25)) * 2;
          ctx.fillStyle = '#ff9a1f'; ctx.beginPath(); ctx.arc(x + 9, y - r - 10, fl, 0, 7); ctx.fill(); ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(x + 9, y - r - 10, fl * 0.5, 0, 7); ctx.fill();
          break;
        }
        case 'saw': {
          if (o.mx || o.my) { ctx.strokeStyle = 'rgba(56,65,74,.5)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(o.x - o.mx, o.y - o.my); ctx.lineTo(o.x + o.mx, o.y + o.my); ctx.stroke(); }
          else { ctx.fillStyle = '#4c5762'; ctx.fillRect(o.x - 5, o.y - 900, 10, 900); }
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a);
          const sgr = ctx.createRadialGradient(-o.r * 0.3, -o.r * 0.3, o.r * 0.1, 0, 0, o.r); sgr.addColorStop(0, '#f2f6fa'); sgr.addColorStop(0.6, '#c3ccd4'); sgr.addColorStop(1, '#8d99a6');
          sawShape(o.r); ctx.fillStyle = sgr; ctx.fill(); ctx.strokeStyle = '#59636e'; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.strokeStyle = 'rgba(89,99,110,.5)'; ctx.lineWidth = 1.4; for (const k of [0.62, 0.74]) { ctx.beginPath(); ctx.arc(0, 0, o.r * k, 0, 7); ctx.stroke(); }
          ctx.fillStyle = '#9aa6b1'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.55, 0, 7); ctx.fill();
          ctx.fillStyle = '#6c7885'; for (let k = 0; k < 6; k++) { const q = k / 6 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(q) * o.r * 0.4, Math.sin(q) * o.r * 0.4, o.r * 0.06, 0, 7); ctx.fill(); }
          ctx.fillStyle = '#e94b3c'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.22, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-o.r * 0.06, -o.r * 0.07, o.r * 0.07, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.42, 0.3, 1.6); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'swing': drawLog(s.x, s.y, o.r, s.a * 2, o.x, o.y); break;
        case 'roll': if (!s.gone) drawLog(s.x, s.y, o.r, s.ra); break;
      }
    }
    function drawLog(x, y, r, a, px, py) {
      if (px != null) {
        ctx.strokeStyle = '#38414a'; ctx.lineWidth = 6; ctx.setLineDash([7, 4]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#38414a'; ctx.fillRect(px - 30, py - 10, 60, 12); rivet(px, py, 5);
      }
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = '#4a2c14';
      for (let i = 0; i < 8; i++) { const q = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(q - 0.14) * r, Math.sin(q - 0.14) * r); ctx.lineTo(Math.cos(q) * (r + 9), Math.sin(q) * (r + 9)); ctx.lineTo(Math.cos(q + 0.14) * r, Math.sin(q + 0.14) * r); ctx.fill(); }
      ctx.fillStyle = '#6b4226'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.fillStyle = '#e2b67a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 7); ctx.fill();
      ctx.strokeStyle = '#b98547'; ctx.lineWidth = 2;
      for (const k of [0.6, 0.4, 0.2]) { ctx.beginPath(); ctx.arc(1, -1, r * k, 0, 7); ctx.stroke(); }
      ctx.strokeStyle = '#6b4226'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.7, r * 0.2); ctx.stroke();
      ctx.restore();
    }
    function drawPad(p) {
      if (p.k === 'tramp') {
        ctx.fillStyle = '#38414a'; ctx.fillRect(p.x + 4, p.y - 8, 6, 8); ctx.fillRect(p.x + p.w - 10, p.y - 8, 6, 8);
        ctx.strokeStyle = '#7f8c98'; ctx.lineWidth = 3; ctx.beginPath();
        for (let k = 0; k < 4; k++) { const xx = p.x + 16 + k * (p.w - 32) / 3; ctx.moveTo(xx - 5, p.y - 1); ctx.lineTo(xx + 5, p.y - 4); ctx.lineTo(xx - 5, p.y - 7); }
        ctx.stroke();
        ctx.fillStyle = '#e8402f'; rr(p.x, p.y - 13, p.w, 7, 3); ctx.fill();
        ctx.fillStyle = '#fff'; for (let x = p.x + 8; x < p.x + p.w - 8; x += 16) ctx.fillRect(x, p.y - 12, 8, 5);
      } else {
        ctx.fillStyle = '#2a2730'; rr(p.x, p.y - 5, p.w, 8, 3); ctx.fill();
        const off = (T * 160) % 26;
        ctx.save(); ctx.beginPath(); ctx.rect(p.x + 2, p.y - 5, p.w - 4, 8); ctx.clip();
        ctx.fillStyle = '#ffd23f';
        for (let x = p.x - 26 + off; x < p.x + p.w; x += 26) { ctx.beginPath(); ctx.moveTo(x, p.y - 5); ctx.lineTo(x + 9, p.y - 5); ctx.lineTo(x + 15, p.y - 1); ctx.lineTo(x + 9, p.y + 3); ctx.lineTo(x, p.y + 3); ctx.lineTo(x + 6, p.y - 1); ctx.fill(); }
        ctx.restore();
        const g = ctx.createLinearGradient(0, p.y - 40, 0, p.y - 5); g.addColorStop(0, 'rgba(255,210,63,0)'); g.addColorStop(1, 'rgba(255,210,63,.35)');
        ctx.fillStyle = g; ctx.fillRect(p.x, p.y - 40, p.w, 35);
      }
    }
    function wheel(x, y, r, a) {
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(1.5, 2, r + 1, 0, 7); ctx.fill();
      ctx.rotate(a);
      const tg = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r); tg.addColorStop(0, '#3c3944'); tg.addColorStop(0.8, '#26232c'); tg.addColorStop(1, '#17151b');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.fillStyle = '#4a4652'; for (let i = 0; i < 14; i++) { ctx.save(); ctx.rotate(i / 14 * Math.PI * 2); ctx.fillRect(-2.6, -r - 1.5, 5.2, 4.5); ctx.fillStyle = '#2c2931'; ctx.fillRect(-2.6, -r + 1.5, 5.2, 1.5); ctx.fillStyle = '#4a4652'; ctx.restore(); }
      ctx.strokeStyle = '#59555f'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, 7); ctx.stroke();
      const rg = ctx.createLinearGradient(-r * 0.7, -r * 0.7, r * 0.7, r * 0.7); rg.addColorStop(0, '#f2f5f8'); rg.addColorStop(0.5, '#aeb7c1'); rg.addColorStop(1, '#e6eaee');
      ctx.strokeStyle = rg; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, 7); ctx.stroke();
      ctx.strokeStyle = '#8d99a6'; ctx.lineWidth = 1.3; ctx.beginPath(); for (let i = 0; i < 12; i++) { const q = i / 12 * Math.PI * 2; ctx.moveTo(Math.cos(q) * r * 0.22, Math.sin(q) * r * 0.22); ctx.lineTo(Math.cos(q + 0.22) * r * 0.64, Math.sin(q + 0.22) * r * 0.64); } ctx.stroke();
      ctx.strokeStyle = '#d9dfe4'; ctx.lineWidth = 0.8; ctx.beginPath(); for (let i = 0; i < 12; i++) { const q = i / 12 * Math.PI * 2 + 0.26; ctx.moveTo(Math.cos(q) * r * 0.22, Math.sin(q) * r * 0.22); ctx.lineTo(Math.cos(q - 0.2) * r * 0.64, Math.sin(q - 0.2) * r * 0.64); } ctx.stroke();
      ctx.strokeStyle = 'rgba(255,215,63,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0.4, 2.3); ctx.stroke();
      const hg = ctx.createRadialGradient(-1, -1, 0.5, 0, 0, r * 0.22); hg.addColorStop(0, '#f2f5f8'); hg.addColorStop(1, '#6c7885');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a3640'; ctx.beginPath(); ctx.arc(0, 0, r * 0.08, 0, 7); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.translate(x, y); ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 3.5, 4.4); ctx.stroke(); ctx.restore();
    }
    function limb(a, b, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    function drawRider(p, bk, world) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const dk = shade(bk.suit, -50), lt = shade(bk.suit, 38);
      limb(p.hip, p.knee, 11, '#1d1b26'); limb(p.knee, p.foot, 10, '#1d1b26');
      limb(p.hip, p.knee, 8, bk.suit); limb(p.knee, p.foot, 7, '#34303c');
      limb(p.hip, p.knee, 2.5, lt);
      ctx.fillStyle = dk; ctx.beginPath(); ctx.arc(p.knee[0], p.knee[1], 5.2, 0, 7); ctx.fill();
      ctx.fillStyle = '#e9edf1'; ctx.beginPath(); ctx.arc(p.knee[0] + 1, p.knee[1] - 1, 2.4, 0, 7); ctx.fill();
      limb(p.knee, p.foot, 2, '#e9edf1');
      ctx.fillStyle = '#1d1b26'; ctx.beginPath(); ctx.ellipse(p.foot[0] + 3, p.foot[1] + 1, 8, 4.8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#34303c'; ctx.beginPath(); ctx.ellipse(p.foot[0] + 3, p.foot[1], 7, 3.6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#e9edf1'; ctx.fillRect(p.foot[0] - 3, p.foot[1] + 3, 12, 1.6);
      ctx.fillStyle = bk.trim; ctx.fillRect(p.foot[0] + 4, p.foot[1] - 2, 4, 2);
      limb(p.hip, p.sh, 16, '#1d1b26'); limb(p.hip, p.sh, 13, bk.suit);
      limb({ 0: p.hip[0] - 3, 1: p.hip[1] - 2 }, { 0: p.sh[0] - 3, 1: p.sh[1] + 2 }, 3, dk);
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.hip[0] + 3, p.hip[1] - 4); ctx.lineTo(p.sh[0] + 3, p.sh[1] + 3); ctx.stroke();
      ctx.strokeStyle = bk.trim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.hip[0] - 1, p.hip[1] - 6); ctx.lineTo(p.sh[0] - 1, p.sh[1] + 5); ctx.stroke();
      ctx.fillStyle = '#e9edf1'; ctx.beginPath(); ctx.arc((p.hip[0] + p.sh[0]) / 2 - 4, (p.hip[1] + p.sh[1]) / 2 - 1, 2.6, 0, 7); ctx.fill();
      ctx.fillStyle = '#1d1b26'; ctx.fillRect((p.hip[0] + p.sh[0]) / 2 - 4.4, (p.hip[1] + p.sh[1]) / 2 - 2.4, 1.6, 4.4);
      limb(p.sh, p.elbow, 9, '#1d1b26'); limb(p.elbow, p.hand, 8, '#1d1b26');
      limb(p.sh, p.elbow, 6.5, bk.suit); limb(p.elbow, p.hand, 6, bk.suit);
      limb(p.sh, p.elbow, 2, lt);
      ctx.fillStyle = '#1d1b26'; ctx.beginPath(); ctx.arc(p.hand[0], p.hand[1], 4.6, 0, 7); ctx.fill();
      ctx.fillStyle = bk.trim; ctx.beginPath(); ctx.arc(p.hand[0], p.hand[1], 3.4, 0, 7); ctx.fill();
      ctx.fillStyle = '#34303c'; ctx.beginPath(); ctx.arc(p.hand[0] - 0.6, p.hand[1] + 0.8, 2.2, 0, 7); ctx.fill();
      const ha = world ? Math.atan2(p.head[1] - p.sh[1], p.head[0] - p.sh[0]) + Math.PI / 2 : 0;
      ctx.save(); ctx.translate(p.head[0], p.head[1]); ctx.rotate(ha);
      ctx.fillStyle = '#e8b890'; ctx.fillRect(-5, 6, 7, 6);
      ctx.fillStyle = '#1d1b26'; ctx.beginPath(); ctx.arc(0, 0, 11.5, 0, 7); ctx.fill();
      const hg = ctx.createRadialGradient(-3, -4, 1, 0, 0, 10); hg.addColorStop(0, shade(bk.helm, 70)); hg.addColorStop(0.5, bk.helm); hg.addColorStop(1, shade(bk.helm, -60));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill();
      ctx.fillStyle = bk.body; ctx.fillRect(-10, -2.5, 9, 3.4);
      ctx.fillStyle = bk.visor; ctx.beginPath(); ctx.moveTo(0.5, -4); ctx.lineTo(10.5, -3); ctx.lineTo(10, 4.4); ctx.lineTo(1.5, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(2.5, -3); ctx.lineTo(7, -2.7); ctx.lineTo(5, 2.5); ctx.lineTo(2.2, 2.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8b890'; ctx.beginPath(); ctx.ellipse(8, 7, 3.2, 2.2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = bk.helm; ctx.beginPath(); ctx.moveTo(4, -9.5); ctx.lineTo(16, -7.5); ctx.lineTo(9, -3.2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = '#1d1b26'; ctx.beginPath(); ctx.roundRect(5.5, 5, 6, 5.5, 2); ctx.fill(); ctx.strokeStyle = '#8d99a6'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(7, 6.2); ctx.lineTo(7, 9.3); ctx.moveTo(9, 6.2); ctx.lineTo(9, 9.3); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 8.2, 3.6, 4.5); ctx.stroke();
      ctx.restore();
    }
    function drawBikeFrame(bk, wr, wf, lean, withRider) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2b2730'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(wr[0], wr[1]); ctx.stroke();
      ctx.strokeStyle = '#9aa3ae'; ctx.lineWidth = 4.4; ctx.stroke();
      ctx.strokeStyle = '#d9dfe4'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-4, 4.8); ctx.lineTo(wr[0], wr[1] - 1.2); ctx.stroke();
      ctx.strokeStyle = '#2b2730'; ctx.lineWidth = 8.5; ctx.beginPath(); ctx.moveTo(24, -22); ctx.lineTo(wf[0], wf[1]); ctx.stroke();
      ctx.strokeStyle = '#f0b429'; ctx.lineWidth = 5.4; ctx.beginPath(); ctx.moveTo(wf[0] + (24 - wf[0]) * 0.5, wf[1] + (-22 - wf[1]) * 0.5); ctx.lineTo(wf[0], wf[1]); ctx.stroke();
      ctx.strokeStyle = '#e4e9ee'; ctx.lineWidth = 5.4; ctx.beginPath(); ctx.moveTo(24, -22); ctx.lineTo(wf[0] + (24 - wf[0]) * 0.5, wf[1] + (-22 - wf[1]) * 0.5); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(23, -23); ctx.lineTo(wf[0] - 1, wf[1] - 1); ctx.stroke();
      const sx0 = -22, sy0 = -16;
      ctx.strokeStyle = '#2b2730'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(-14, 2); ctx.stroke();
      ctx.strokeStyle = '#f0b429'; ctx.lineWidth = 3.4; ctx.stroke();
      ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = 0; i < 5; i++) { const t = (i + 0.6) / 5, px = sx0 + (-14 - sx0) * t, py = sy0 + (2 - sy0) * t; ctx.moveTo(px - 3, py - 1.5); ctx.lineTo(px + 3, py + 1.5); } ctx.stroke();
      const eg = ctx.createLinearGradient(0, -8, 0, 14); eg.addColorStop(0, '#6c6875'); eg.addColorStop(1, '#2f2c36');
      ctx.fillStyle = eg; rr(-12, -6, 25, 19, 4); ctx.fill(); ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = '#9aa3ae'; ctx.fillRect(-8, -3, 17, 2.4); ctx.fillRect(-8, 2, 17, 2.4); ctx.fillRect(-8, 7, 17, 2.4);
      ctx.fillStyle = '#e4e9ee'; ctx.beginPath(); ctx.arc(2, 5, 4.2, 0, 7); ctx.fill(); ctx.fillStyle = '#6c7885'; ctx.beginPath(); ctx.arc(2, 5, 1.7, 0, 7); ctx.fill();
      ctx.strokeStyle = '#2b2730'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(10, 8); ctx.quadraticCurveTo(24, 16, 14, 16); ctx.stroke();
      ctx.strokeStyle = '#a0a8b2'; ctx.lineWidth = 3.8; ctx.beginPath(); ctx.moveTo(-6, 9); ctx.quadraticCurveTo(-24, 11, -35, -6); ctx.stroke();
      ctx.strokeStyle = '#d9dfe4'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-6, 8); ctx.quadraticCurveTo(-24, 10, -35, -7); ctx.stroke();
      const mg = ctx.createLinearGradient(0, -12, 0, -4); mg.addColorStop(0, '#d9dfe4'); mg.addColorStop(0.6, '#8d99a6'); mg.addColorStop(1, '#c9a24a');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(-36, -8, 8, 4.2, -0.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#38414a'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = '#1d1b26';
      ctx.beginPath(); ctx.moveTo(-50, -22); ctx.lineTo(-24, -18); ctx.lineTo(-6, -24); ctx.lineTo(18, -30); ctx.lineTo(32, -26); ctx.lineTo(30, -14); ctx.lineTo(12, -6); ctx.lineTo(-10, -6); ctx.lineTo(-26, -10); ctx.lineTo(-44, -14); ctx.closePath(); ctx.fill();
      const bg = ctx.createLinearGradient(0, -30, 0, -6); bg.addColorStop(0, shade(bk.body, 55)); bg.addColorStop(0.45, bk.body); bg.addColorStop(1, shade(bk.body, -55));
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(-47, -20); ctx.lineTo(-24, -16); ctx.lineTo(-6, -22); ctx.lineTo(17, -28); ctx.lineTo(29, -24); ctx.lineTo(27, -16); ctx.lineTo(11, -8); ctx.lineTo(-10, -8); ctx.lineTo(-26, -12); ctx.lineTo(-43, -15); ctx.closePath(); ctx.fill();
      ctx.fillStyle = bk.trim; ctx.beginPath(); ctx.moveTo(-6, -19); ctx.lineTo(16, -25); ctx.lineTo(22, -18); ctx.lineTo(4, -12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(-4, -20); ctx.lineTo(15, -25.5); ctx.lineTo(17, -23.5); ctx.lineTo(-2, -18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1d1b26'; rr(-30, -24, 26, 6.4, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-27, -23, 18, 1.6);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-44, -19.5, 18, 2.2);
      ctx.fillStyle = '#e9edf1'; ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(-42, -28, 11, 11, 2.5); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = bk.body; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-38.5, -25); ctx.lineTo(-36.6, -26.5); ctx.lineTo(-36.6, -19.5); ctx.stroke();
      const fg = ctx.createLinearGradient(0, wf[1] - 28, 0, wf[1] - 14); fg.addColorStop(0, shade(bk.body, 50)); fg.addColorStop(1, shade(bk.body, -40));
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(wf[0] - 15, wf[1] - 20); ctx.quadraticCurveTo(wf[0], wf[1] - 28, wf[0] + 15, wf[1] - 17); ctx.lineTo(wf[0] + 10, wf[1] - 15); ctx.quadraticCurveTo(wf[0], wf[1] - 22, wf[0] - 12, wf[1] - 17); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#fff6c8'; ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(25, -39, 10, 14, 3.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = bk.trim; ctx.beginPath(); ctx.roundRect(26, -38, 5, 12, 2.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,230,120,.16)'; ctx.beginPath(); ctx.moveTo(35, -35); ctx.lineTo(64, -42); ctx.lineTo(64, -22); ctx.lineTo(35, -29); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2b2730'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(24, -24); ctx.lineTo(21, -33); ctx.lineTo(14, -34); ctx.stroke();
      ctx.strokeStyle = '#8d99a6'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(24, -24.5); ctx.lineTo(21, -33.5); ctx.lineTo(14.5, -34.5); ctx.stroke();
      ctx.fillStyle = '#1d1b26'; ctx.beginPath(); ctx.roundRect(8, -37, 8, 5, 2.4); ctx.fill();
      ctx.strokeStyle = '#d83a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(15, -32); ctx.lineTo(19, -29); ctx.stroke();
      ctx.fillStyle = '#ff4a3a'; ctx.beginPath(); ctx.roundRect(-52, -22, 4, 5, 1.5); ctx.fill();
      if (withRider) drawRider(pose(lean), bk, false);
    }
    function drawBike() {
      const c = Math.cos(st.a), s = Math.sin(st.a);
      const loc = q => { const dx = q.x - st.x, dy = q.y - st.y; return [c * dx + s * dy, -s * dx + c * dy]; };
      wheel(st.wh[0].x, st.wh[0].y, B.r, st.wh[0].ra); wheel(st.wh[1].x, st.wh[1].y, B.r, st.wh[1].ra);
      ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.a);
      drawBikeFrame(B, st.crash ? [-CFG.WB / 2, CFG.AY] : loc(st.wh[0]), st.crash ? [CFG.WB / 2, CFG.AY] : loc(st.wh[1]), st.lean, !rag);
      ctx.restore();
      if (rag) {
        const q = rag.pts;
        drawRider({ head: [q[0].x, q[0].y], sh: [q[1].x, q[1].y], hip: [q[2].x, q[2].y], knee: [q[3].x, q[3].y], foot: [q[4].x, q[4].y], elbow: [q[5].x, q[5].y], hand: [q[6].x, q[6].y] }, B, true);
      }
    }
    function drawParticles(dt) {
      for (const p of P) {
        if (!p.on) continue;
        p.l -= dt; if (p.l <= 0) { p.on = 0; continue; }
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        const k = p.l / p.m;
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.fillStyle = p.c;
        if (p.k >= 2) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); if (p.k === 2) ctx.fillRect(-p.s, -p.s / 3, p.s * 2, p.s / 1.5); else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (p.k === 1 ? 0.6 + k * 0.6 : 0.5 + (1 - k) * 0.8), 0, 7); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
    function drawBackdrop(cx, cy) {
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HH);
      const orb = TH.orb, oy = orb === 'dusk' ? HH * 0.42 : sunY;
      if (TH.stars) { ctx.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) { const qx = (i * 137.5 + 31) % W, qy = (i * 71.3) % (HH * 0.6); ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(T * 1.3 + i)); ctx.fillRect(qx, qy, i % 5 ? 1.5 : 2.5, i % 5 ? 1.5 : 2.5); } ctx.globalAlpha = 1; }
      ctx.fillStyle = sunG; ctx.fillRect(sunX - 170, oy - 170, 340, 340);
      if (orb === 'sun') {
        ctx.save(); ctx.translate(sunX, sunY); ctx.rotate(T * 0.03); ctx.fillStyle = 'rgba(255,250,220,.07)';
        for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, -HH * 1.4); ctx.lineTo(18, -HH * 1.4); ctx.fill(); }
        ctx.restore();
      }
      const sg2 = ctx.createRadialGradient(sunX - 9, oy - 9, 3, sunX, oy, orb === 'dusk' ? 52 : 30);
      if (orb === 'moon') { sg2.addColorStop(0, '#ffffff'); sg2.addColorStop(1, '#cfd8ff'); } else if (orb === 'dusk') { sg2.addColorStop(0, '#fff3c0'); sg2.addColorStop(1, '#ff8a4a'); } else { sg2.addColorStop(0, '#ffffff'); sg2.addColorStop(1, '#ffeaa0'); }
      ctx.fillStyle = sg2; ctx.beginPath(); ctx.arc(sunX, oy, orb === 'dusk' ? 52 : orb === 'moon' ? 26 : 30, 0, 7); ctx.fill();
      if (orb === 'moon') { ctx.fillStyle = 'rgba(120,130,190,.35)'; for (const [mx, my, mr] of [[-8, -6, 6], [7, 5, 4], [4, -10, 3]]) { ctx.beginPath(); ctx.arc(sunX + mx, oy + my, mr, 0, 7); ctx.fill(); } }
      ctx.globalAlpha = orb === 'moon' ? 0.25 : orb === 'dusk' ? 0.6 : 1;
      for (let i = 0; i < 4; i++) {
        const span = W + 300, x = ((i * 330 - cx * 0.03 - T * 8) % span + span) % span - 150, y = 40 + (i * 27) % 70;
        const cl = () => { ctx.beginPath(); ctx.ellipse(x, y, 46, 13, 0, 0, 7); ctx.ellipse(x + 26, y - 9, 28, 14, 0, 0, 7); ctx.ellipse(x - 24, y - 4, 22, 10, 0, 0, 7); ctx.fill(); };
        ctx.fillStyle = 'rgba(150,175,215,.4)'; ctx.save(); ctx.translate(0, 5); cl(); ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.9)'; cl();
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.ellipse(x + 14, y - 15, 13, 5, -0.3, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(60,40,40,.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 0; i < (orb === 'moon' ? 0 : 3); i++) {
        const bx = ((i * 290 + T * (14 + i * 3) - cx * 0.04) % (W + 200) + W + 200) % (W + 200) - 100, by = 60 + i * 24 + Math.sin(T * 0.8 + i * 2) * 8, f = Math.sin(T * 7 + i * 2) * 3;
        ctx.beginPath(); ctx.moveTo(bx - 10, by - 3 - f); ctx.quadraticCurveTo(bx - 4, by - 7 + f * 0.3, bx, by); ctx.quadraticCurveTo(bx + 4, by - 7 + f * 0.3, bx + 10, by - 3 - f); ctx.stroke();
      }
      for (const ly of LAYERS) {
        const off = ((cx * ly.f) % LW + LW) % LW, oy = Math.max(-60, Math.min(80, -cy * ly.dy - 10));
        for (let x = -off; x < W; x += LW) ctx.drawImage(ly.c, x, oy, LW, HH);
      }
    }
    const behind = o => o.k === 'crush' || o.k === 'drop' || o.k === 'swing' || (o.k === 'saw' && !o.mx && !o.my);
    function drawWorld(dt) {
      const z = cam.z;
      const sx = shake > 0 ? R(-shake, shake) : 0, sy = shake > 0 ? R(-shake, shake) : 0;
      drawBackdrop(cam.x, cam.y);
      ctx.save();
      ctx.translate(sx, sy); ctx.scale(z, z); ctx.translate(-cam.x, -cam.y);
      const x0 = cam.x - 200, x1 = cam.x + W / z + 200;
      for (const d of L.deco) if (d.x > x0 && d.x < x1) drawDeco(d);
      for (const lp of L.loops) if (lp.x + lp.R > x0 && lp.x - lp.R < x1) drawLoop(lp);
      for (let i = 0; i < L.objs.length; i++) { const o = L.objs[i]; if (behind(o) && o.x > x0 - 300 && o.x < x1 + 300) drawObj(o, st.o[i]); }
      drawGround(x0, x1);
      for (const r of L.ramps) if (r.x0 + r.w > x0 && r.x0 < x1) drawRamp(r);
      for (const r of L.rects) if (r.x + r.w > x0 && r.x < x1) (r.st === 'metal' ? metalBox : r.st === 'crate' ? crateBox : woodBox)(r.x, r.y, r.w, r.h);
      for (const p of L.pads) if (p.x + p.w > x0 && p.x < x1) drawPad(p);
      L.flags.forEach((f, i) => { if (f.x > x0 && f.x < x1) drawFlag(f, i); });
      if (L.finish > x0 - 100 && L.finish < x1 + 100) drawFinishGate(L.finish, finishY);
      for (let i = 0; i < L.objs.length; i++) { const o = L.objs[i]; if (!behind(o) && o.x > x0 - 400 && o.x < x1 + 400) drawObj(o, st.o[i]); }
      drawBike();
      drawParticles(dt);
      ctx.restore();
    }

    function txt(s, x, y, size, col, align, stroke, w) {
      ctx.font = FONT(w || 900, size); ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
      if (stroke !== 0) { ctx.lineJoin = 'round'; ctx.strokeStyle = stroke || '#3a1f0c'; ctx.lineWidth = Math.max(3, size * 0.22); ctx.strokeText(s, x, y); }
      ctx.fillStyle = col || '#fff'; ctx.fillText(s, x, y);
    }
    function star(x, y, r, on) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
      ctx.closePath();
      if (on) { const sg = ctx.createLinearGradient(0, y - r, 0, y + r); sg.addColorStop(0, '#fff2a0'); sg.addColorStop(0.5, '#ffd23f'); sg.addColorStop(1, '#f09a10'); ctx.fillStyle = sg; } else ctx.fillStyle = 'rgba(40,25,10,.35)';
      ctx.fill();
      ctx.lineJoin = 'round'; ctx.strokeStyle = on ? '#b86e00' : 'rgba(40,25,10,.4)'; ctx.lineWidth = Math.max(2, r * 0.16); ctx.stroke();
      if (on) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.25, r * 0.18, 0, 7); ctx.fill(); }
    }
    function lock(x, y, s) {
      ctx.strokeStyle = '#e9edf1'; ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.3, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#e9edf1'; rr(x - s * 0.45, y - s * 0.2, s * 0.9, s * 0.7, s * 0.12); ctx.fill();
      ctx.fillStyle = '#5b6670'; ctx.beginPath(); ctx.arc(x, y + 0.1 * s, s * 0.1, 0, 7); ctx.fill();
    }
    function shade(hex, d) {
      const n = parseInt(hex.slice(1), 16), cl = v => Math.max(0, Math.min(255, v));
      return '#' + ((cl((n >> 16) + d) << 16) | (cl(((n >> 8) & 255) + d) << 8) | cl((n & 255) + d)).toString(16).padStart(6, '0');
    }
    function button(x, y, w, h, label, col, act, size, sel) {
      ctx.fillStyle = 'rgba(40,20,5,.35)'; rr(x, y + 5, w, h, h * 0.3); ctx.fill();
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, shade(col, 40)); g.addColorStop(1, col);
      ctx.fillStyle = g; rr(x, y, w, h, h * 0.3); ctx.fill();
      ctx.strokeStyle = sel ? '#fff' : shade(col, -70); ctx.lineWidth = sel ? 4 : 3; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; rr(x + 6, y + 4, w - 12, h * 0.32, h * 0.15); ctx.fill();
      if (typeof label === 'function') label(x + w / 2, y + h / 2);
      else txt(label, x + w / 2, y + h / 2 + 1, size || Math.min(26, h * 0.46), '#fff', 'center', shade(col, -90));
      if (act) btns.push({ x, y, w, h, act });
    }
    function panel(x, y, w, h) {
      ctx.fillStyle = 'rgba(40,20,5,.4)'; rr(x, y + 8, w, h, 22); ctx.fill();
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#f2b866');
      ctx.fillStyle = g; rr(x, y, w, h, 22); ctx.fill();
      ctx.strokeStyle = '#7a4314'; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; rr(x + 7, y + 7, w - 14, h - 14, 16); ctx.stroke();
    }
    const iconPause = (x, y) => { ctx.fillStyle = '#fff'; ctx.fillRect(x - 7, y - 9, 5, 18); ctx.fillRect(x + 2, y - 9, 5, 18); };
    const iconRestart = (x, y) => { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, 8, -0.6, 4.4); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 9, y - 13); ctx.lineTo(x + 11, y - 2); ctx.lineTo(x + 1, y - 6); ctx.fill(); };

    function brush(x, y, w, h, sd) {
      let q = sd * 9301 + 49297;
      const rn = () => (q = (q * 16807) % 2147483647) / 2147483647;
      ctx.fillStyle = '#121014'; ctx.beginPath(); ctx.moveTo(x + 6, y + 2);
      for (let k = 1; k <= 10; k++) ctx.lineTo(x + w * k / 10 + (k === 10 ? rn() * 14 : 0), y + rn() * 4);
      ctx.lineTo(x + w + 4 + rn() * 10, y + h * 0.35); ctx.lineTo(x + w - 6 + rn() * 12, y + h * 0.7); ctx.lineTo(x + w + rn() * 8, y + h);
      for (let k = 9; k >= 0; k--) ctx.lineTo(x + w * k / 10, y + h - rn() * 5);
      ctx.lineTo(x - 4 - rn() * 8, y + h * 0.6); ctx.lineTo(x + rn() * 6, y + h * 0.3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.07)'; for (let k = 0; k < 5; k++) ctx.fillRect(x + rn() * w, y + 3 + rn() * (h - 8), 10 + rn() * 26, 1.5);
    }
    const fmtR = v => { v = Math.max(0, v); const m = Math.floor(v / 60), sec = v - m * 60, t = (sec < 10 ? '0' : '') + sec.toFixed(2); return m ? m + ':' + t : t; };
    function watch(x, y) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y + 1, 9, 0, 7); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, y - 12, 6, 3); ctx.fillRect(x - 1, y - 10, 2, 3);
      ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x + 5, y - 4); ctx.stroke();
    }
    function drawHUD() {
      const bh = narrow ? 34 : 38, ty = 6, fz = narrow ? 20 : 22;
      brush(-10, ty, narrow ? 92 : 104, bh, 3);
      iconRestart(22, ty + bh / 2); txt('#' + (crashes + 1), 40, ty + bh / 2 + 1, fz, '#fff', 'left');
      btns.push({ x: 0, y: 0, w: narrow ? 90 : 100, h: bh + 12, act: () => startLevel(li) });
      const tw = narrow ? 122 : 140, tx0 = W / 2 - tw / 2;
      brush(tx0, ty, tw, bh, 7); watch(tx0 + 24, ty + bh / 2); txt(fmtR(score(st)), tx0 + 42, ty + bh / 2 + 1, fz, '#fff', 'left');
      brush(W - (narrow ? 70 : 80), ty, narrow ? 84 : 94, bh, 11); iconPause(W - (narrow ? 38 : 44), ty + bh / 2);
      btns.push({ x: W - 84, y: 0, w: 84, h: bh + 12, act: () => pause() });
      txt('LEVEL ' + (li + 1), 18, ty + bh + 16, 14, '#fff', 'left', 'rgba(0,0,0,.6)');
      if (st.crash && st.ct > 0.5) {
        const cw = narrow ? 300 : 380, cx0 = W / 2 - cw / 2, cy0 = HH - (touchMode ? 170 : 70);
        ctx.globalAlpha = Math.min(1, (st.ct - 0.5) * 4);
        brush(cx0, cy0, cw, 40, 5); txt(touchMode ? 'Tap to continue' : 'Press SPACE to continue', W / 2, cy0 + 21, narrow ? 18 : 21, '#fff');
        ctx.globalAlpha = 1;
      }
      let yy = HH * 0.28;
      for (const p of popups) {
        const k = Math.min(1, p.t * 6), a = p.t > 1.1 ? Math.max(0, 1 - (p.t - 1.1) * 3) : 1;
        ctx.globalAlpha = a;
        txt(p.text, W / 2, yy - p.t * 18, (p.big ? (narrow ? 30 : 36) : 24) * (0.6 + 0.4 * k + (p.t < 0.25 ? Math.sin(p.t * 12.5) * 0.15 : 0)), p.col);
        ctx.globalAlpha = 1;
        yy += p.big ? 44 : 34;
      }
      if (!st.run && !st.crash) {
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(T * 5);
        txt(touchMode ? 'Hold GAS to ride!' : 'Hold UP to ride!', W / 2, HH * 0.42, narrow ? 24 : 30, '#fff');
        ctx.globalAlpha = 1;
      }
      if (touchMode) {
        const bits = inputBits();
        for (const tb of TB) {
          const on = bits & tb.bit;
          ctx.fillStyle = on ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.3)'; rr(tb.x, tb.y, tb.w, tb.h, 18); ctx.fill();
          ctx.strokeStyle = 'rgba(60,30,10,.45)'; ctx.lineWidth = 3; ctx.stroke();
          const cx = tb.x + tb.w / 2, cy = tb.y + tb.h / 2, s = tb.w * 0.24;
          ctx.fillStyle = tb.ic === 'gas' ? '#5fe08a' : tb.ic === 'brake' ? '#ff6a5a' : '#fff'; ctx.strokeStyle = 'rgba(60,30,10,.75)'; ctx.lineWidth = 3;
          ctx.beginPath();
          if (tb.ic === 'l') { ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s * 0.6, cy - s); ctx.lineTo(cx + s * 0.6, cy + s); }
          else if (tb.ic === 'r') { ctx.moveTo(cx + s, cy); ctx.lineTo(cx - s * 0.6, cy - s); ctx.lineTo(cx - s * 0.6, cy + s); }
          else if (tb.ic === 'gas') { ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy + s * 0.7); ctx.lineTo(cx - s, cy + s * 0.7); }
          else { ctx.moveTo(cx, cy + s); ctx.lineTo(cx + s, cy - s * 0.7); ctx.lineTo(cx - s, cy - s * 0.7); }
          ctx.closePath(); ctx.stroke(); ctx.fill();
        }
      }
    }

    function menuBackdrop(dt) {
      menuX += dt * 90;
      drawBackdrop(menuX * 6, 0);
      const gy = HH * 0.86;
      ctx.fillStyle = dirtPat || '#8f4f2a'; ctx.fillRect(0, gy, W, HH - gy);
      ctx.fillStyle = TH.edge[0]; ctx.fillRect(0, gy - 4, W, 9); ctx.fillStyle = TH.edge[1]; ctx.fillRect(0, gy - 4, W, 5);
    }
    function drawTitle(dt) {
      menuBackdrop(dt);
      const cx = W / 2, ty = narrow ? 104 : 96;
      ctx.save(); ctx.translate(cx, ty); ctx.rotate(-0.05 + Math.sin(T * 2) * 0.012);
      txt('MOTO', 0, -30, narrow ? 64 : 72, '#ffd23f', 'center', '#7a2a0c');
      txt('X3M', 0, narrow ? 30 : 34, narrow ? 64 : 72, '#ff7a1f', 'center', '#7a2a0c');
      ctx.restore();
      const bk = BIKES[sv.bike], gy = HH * 0.86, bz = narrow ? 1.3 : 1.6, bx = narrow ? cx : cx + 220;
      ctx.save(); ctx.translate(bx, gy - (16 + bk.r) * bz - 30 * bz * Math.max(0, Math.sin(T * 2.2))); ctx.scale(bz, bz); ctx.rotate(-0.2 - 0.25 * Math.max(0, Math.sin(T * 2.2)));
      wheel(-33, 16, bk.r, T * 12); wheel(33, 16, bk.r, T * 12);
      drawBikeFrame(bk, [-33, 16], [33, 16], -0.6, true);
      ctx.restore();
      const bw = narrow ? 220 : 240, bxx = narrow ? cx - bw / 2 : cx - 300;
      const y0 = narrow ? HH * 0.34 : HH * 0.44;
      button(bxx, y0, bw, 66, 'PLAY', '#4cc35a', () => { scr = 'levels'; hoverSel = highestUnlocked(); }, 34, menuSel === 0);
      button(bxx, y0 + 82, bw, 54, 'GARAGE', '#ff9a1f', () => { scr = 'garage'; }, 26, menuSel === 1);
      ctx.save(); star(bxx + bw / 2 - 52, y0 + 168, 11, true); ctx.restore();
      txt(totStars() + ' / ' + NL * 3, bxx + bw / 2 + 12, y0 + 169, 22, '#fff');
    }
    function drawLevels(dt) {
      menuBackdrop(dt);
      txt('SELECT LEVEL', W / 2, 34, narrow ? 30 : 34, '#ffd23f', 'center', '#7a2a0c');
      const cols = 4, rows = Math.ceil(NL / cols), gap = narrow ? 10 : 12;
      const cw = narrow ? 86 : 104, ch = narrow ? 96 : 80;
      const gw = cols * cw + (cols - 1) * gap, x0 = (W - gw) / 2, y0 = 64;
      for (let i = 0; i < NL; i++) {
        const x = x0 + (i % cols) * (cw + gap), y = y0 + Math.floor(i / cols) * (ch + gap), ok = unlocked(i), sel = hoverSel === i;
        const bx = x + cw / 2, byc = y + ch * 0.4, br = Math.min(cw, ch) * 0.36;
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(bx, byc + br + 3, br * 0.9, 5, 0, 0, 7); ctx.fill();
        ctx.beginPath();
        for (let k = 0; k < 28; k++) { const an = k / 28 * Math.PI * 2, rr2 = br * (k & 1 ? 0.9 : 1.12 + ((k * 7 + i) % 3) * 0.04); ctx.lineTo(bx + Math.cos(an) * rr2, byc + Math.sin(an) * rr2); }
        ctx.closePath(); ctx.fillStyle = ok ? '#141217' : '#3b3f45'; ctx.fill();
        ctx.strokeStyle = sel ? '#ffb020' : ok ? '#4a4450' : '#5c636b'; ctx.lineWidth = sel ? 4 : 2; ctx.stroke();
        ctx.fillStyle = ok ? '#2a262e' : '#4d535a'; ctx.beginPath(); ctx.arc(bx, byc, br * 0.72, 0, 7); ctx.fill();
        if (ok) {
          txt((i < 9 ? '0' : '') + (i + 1), bx, byc + 1, narrow ? 26 : 24, '#ff9a1f', 'center', '#000');
          for (let k = 0; k < 3; k++) star(bx + (k - 1) * 20, y + ch * 0.9, 8, sv.lv[i].s > k);
          btns.push({ x, y, w: cw, h: ch, act: () => startLevel(i) });
        } else {
          lock(bx, byc - 2, 22);
          const need = LEVEL_NEED(i);
          if (totStars() < need) { star(x + cw / 2 - 14, y + ch * 0.78, 8, true); txt(String(need), x + cw / 2 + 8, y + ch * 0.79, 16, '#fff', 'center', '#3f474f'); }
        }
      }
      const by = Math.min(HH - 60, y0 + rows * (ch + gap) + 4);
      button(narrow ? 16 : x0, by, 120, 46, 'BACK', '#4fa3e8', () => { scr = 'title'; }, 22);
      star(W - (narrow ? 20 : x0) - 74, by + 23, 11, true);
      txt(totStars() + ' / ' + NL * 3, W - (narrow ? 20 : x0), by + 24, 22, '#fff', 'right');
    }
    function drawGarage(dt) {
      menuBackdrop(dt);
      txt('GARAGE', W / 2, 34, narrow ? 30 : 34, '#ffd23f', 'center', '#7a2a0c');
      const n = BIKES.length, cols = narrow ? 2 : 4, gap = 12;
      const cw = narrow ? 188 : 196, ch = narrow ? 228 : 330, gw = cols * cw + (cols - 1) * gap, x0 = (W - gw) / 2, y0 = 62;
      const lim = { vmax: [720, 900], tq: [170000, 240000], spin: [7.5, 11], mu: [1.1, 1.5] };
      for (let i = 0; i < n; i++) {
        const bk = BIKES[i], x = x0 + (i % cols) * (cw + gap), y = y0 + Math.floor(i / cols) * (ch + gap), ok = bikeOk(i), cur = sv.bike === i;
        ctx.fillStyle = 'rgba(40,20,5,.35)'; rr(x, y + 5, cw, ch, 16); ctx.fill();
        const g = ctx.createLinearGradient(0, y, 0, y + ch); g.addColorStop(0, cur ? '#fff3c4' : '#ffe2a8'); g.addColorStop(1, cur ? '#ffd36b' : '#f2b866');
        ctx.fillStyle = g; rr(x, y, cw, ch, 16); ctx.fill();
        ctx.strokeStyle = cur ? '#2fa84f' : '#7a4314'; ctx.lineWidth = cur ? 5 : 3; ctx.stroke();
        txt(bk.name, x + cw / 2, y + 22, 19, '#fff', 'center', '#7a4314');
        const sc = narrow ? 0.85 : 1.0;
        ctx.save(); ctx.translate(x + cw / 2, y + (narrow ? 82 : 92)); ctx.scale(sc, sc);
        if (!ok) ctx.globalAlpha = 0.35;
        wheel(-33, 16, bk.r, 0); wheel(33, 16, bk.r, 0); drawBikeFrame(bk, [-33, 16], [33, 16], 0, true);
        ctx.restore(); ctx.globalAlpha = 1;
        const stats = [['SPEED', (bk.vmax - lim.vmax[0]) / (lim.vmax[1] - lim.vmax[0])], ['POWER', (bk.tq - lim.tq[0]) / (lim.tq[1] - lim.tq[0])], ['FLIP', (bk.spin - lim.spin[0]) / (lim.spin[1] - lim.spin[0])], ['GRIP', (bk.mu - lim.mu[0]) / (lim.mu[1] - lim.mu[0])]];
        const sy = y + (narrow ? 124 : 150), sh = narrow ? 13 : 26;
        stats.forEach(([k, v], j) => {
          const yy = sy + j * sh;
          if (!narrow) txt(k, x + 14, yy, 12, '#7a4314', 'left', 0);
          const bx = narrow ? x + 18 : x + 72, bw = narrow ? cw - 36 : cw - 88;
          ctx.fillStyle = 'rgba(122,67,20,.25)'; rr(bx, yy - 4, bw, 8, 4); ctx.fill();
          ctx.fillStyle = ['#ff7a1f', '#e8452c', '#8e44e8', '#2fa84f'][j]; rr(bx, yy - 4, Math.max(8, bw * (0.15 + 0.85 * Math.max(0, Math.min(1, v)))), 8, 4); ctx.fill();
        });
        const byy = y + ch - 56;
        if (ok) button(x + 16, byy, cw - 32, 42, cur ? 'RIDING' : 'SELECT', cur ? '#2fa84f' : '#ff9a1f', () => { sv.bike = i; B = BIKES[i]; persist(); }, 18);
        else { ctx.fillStyle = 'rgba(60,40,20,.5)'; rr(x + 16, byy, cw - 32, 42, 12); ctx.fill(); lock(x + cw / 2 - 30, byy + 23, 18); star(x + cw / 2 + 2, byy + 21, 9, true); txt(String(bk.need), x + cw / 2 + 26, byy + 22, 18, '#fff', 'center', '#3f474f'); }
      }
      const by = Math.min(HH - 58, y0 + Math.ceil(n / cols) * (ch + gap));
      button(narrow ? 16 : x0, by, 120, 46, 'BACK', '#4fa3e8', () => { scr = 'title'; }, 22);
      star(W - (narrow ? 20 : x0) - 44, by + 23, 11, true);
      txt(String(totStars()), W - (narrow ? 20 : x0), by + 24, 22, '#fff', 'right');
    }
    function pause() { if (scr !== 'play' || st.fin) return; scr = 'pause'; menuSel = 0; ptrs.clear(); }
    function drawPause() {
      ctx.fillStyle = 'rgba(20,10,0,.45)'; ctx.fillRect(0, 0, W, HH);
      const pw = 280, ph = 300, px = (W - pw) / 2, py = (HH - ph) / 2;
      panel(px, py, pw, ph);
      txt('PAUSED', W / 2, py + 44, 36, '#fff', 'center', '#7a4314');
      button(px + 40, py + 84, pw - 80, 54, 'RESUME', '#4cc35a', () => { scr = 'play'; }, 24, menuSel === 0);
      button(px + 40, py + 150, pw - 80, 50, 'RESTART', '#4fa3e8', () => startLevel(li), 22, menuSel === 1);
      button(px + 40, py + 212, pw - 80, 50, 'LEVELS', '#ff9a1f', () => { scr = 'levels'; hoverSel = li; }, 22, menuSel === 2);
    }
    const hasNext = () => li + 1 < NL && unlocked(li + 1);
    function drawFinishScreen(dt) {
      const f = finInfo; f.shown += dt;
      ctx.fillStyle = 'rgba(20,10,0,' + Math.min(0.45, f.shown) + ')'; ctx.fillRect(0, 0, W, HH);
      const pw = narrow ? 384 : 440, ph = 410, px = (W - pw) / 2, py = (HH - ph) / 2 - 4;
      const k = Math.min(1, f.shown * 4), e = 1 + Math.sin(k * Math.PI) * 0.06;
      ctx.save(); ctx.translate(W / 2, HH / 2); ctx.scale(k * e, k * e); ctx.translate(-W / 2, -HH / 2);
      panel(px, py, pw, ph);
      txt('LEVEL ' + (li + 1) + ' COMPLETE!', W / 2, py + 40, narrow ? 27 : 32, '#fff', 'center', '#7a4314');
      for (let i = 0; i < 3; i++) {
        const show = f.shown > 0.45 + i * 0.3, on = i < f.stars && show;
        if (show && !f['s' + i]) { f['s' + i] = 1; if (i < f.stars) audio.sfx('star', i); }
        const pop = show ? Math.min(1, (f.shown - 0.45 - i * 0.3) * 6) : 0;
        star(W / 2 + (i - 1) * 74, py + 102 - (i === 1 ? 10 : 0), 30 * (on ? 0.7 + 0.3 * pop + (pop < 1 ? 0.25 * Math.sin(pop * Math.PI) : 0) : 0.8), on);
      }
      const rows = [['TIME', fmtT(f.t)], ['BEST', fmtT(f.bestT)], ['FLIPS', String(f.flips)]];
      if (f.stars < 3) rows.push([(f.stars + 1) + ' STARS', 'under ' + fmtT(L.stars[2 - f.stars])]);
      rows.forEach(([a, b], i) => { const yy = py + 156 + i * 32; txt(a, px + 46, yy, 19, '#7a4314', 'left', 0); txt(b, px + pw - 46, yy, 22, '#fff', 'right', '#7a4314'); });
      if (f.newBikes.length) txt('New bike: ' + f.newBikes.join(', ') + '!', W / 2, py + ph - 100, 18, '#fff', 'center', '#c0392b');
      else if (f.best) txt('NEW BEST TIME!', W / 2, py + ph - 100, 20, '#fff', 'center', '#2fa84f');
      const bw = (pw - 60) / 3, by = py + ph - 72;
      button(px + 15, by, bw, 52, 'MENU', '#4fa3e8', () => { scr = 'levels'; hoverSel = li; }, 20, menuSel === 0);
      button(px + 30 + bw, by, bw, 52, 'RETRY', '#ff9a1f', () => startLevel(li), 20, menuSel === 1);
      if (hasNext()) button(px + 45 + bw * 2, by, bw, 52, 'NEXT', '#4cc35a', () => startLevel(li + 1), 22, menuSel === 2);
      else { ctx.fillStyle = 'rgba(60,40,20,.35)'; rr(px + 45 + bw * 2, by, bw, 52, 15); ctx.fill(); lock(px + 45 + bw * 2.5, by + 27, 20); }
      ctx.restore();
    }

    function frame(dt) {
      T += dt;
      btns = [];
      shake = Math.max(0, shake - dt * 40);
      if (scr === 'play' || scr === 'pause' || scr === 'finish') {
        if (scr !== 'pause') {
          acc += dt;
          let n = 0;
          while (acc >= CFG.DT && n < 24) {
            step(L, B, st, scr === 'play' ? inputBits() : 0);
            handleEvents();
            acc -= CFG.DT; n++;
            if (st.crash && (st.ct > 3.4 || (st.ct > 0.55 && contReq))) { contReq = false; respawn(L, B, st); rag = null; lastCp = st.cp; cam.x = st.x - W * 0.36 / cam.z; cam.y = st.y - HH * 0.55 / cam.z; }
          }
          if (n >= 24) acc = 0;
          if (st.fin && scr === 'play') { finT += dt; if (finT > 1.1) { scr = 'finish'; menuSel = hasNext() ? 2 : 1; } }
          stepRag(dt);
          for (const p of popups) p.t += dt;
          popups = popups.filter(p => p.t < 1.5);
          camera(dt);
          const rw = st.wh[0];
          if (!st.crash && rw.c && Math.abs(rw.vx) > 150 && Math.random() < 0.5) emit(rw.x - 8, rw.y + B.r * 0.8, R(-120, -20) - st.vx * 0.1, R(-80, -20), R(0.3, 0.6), R(3, 7), 'rgba(226,178,122,.8)', 200, 0);
          if (st.bst && Math.random() < 0.8) emit(st.x - 40, st.y + R(-10, 20), -st.vx * 0.3, R(-30, 30), 0.35, R(3, 6), '#ffd23f', 0, 1);
          if (st.fin && finT < 1.2 && Math.random() < 0.7) emit(L.finish + R(-80, 80), finishY - 190, R(-150, 150), R(-200, 50), R(1, 2), R(4, 8), ['#ffd23f', '#e8452c', '#4fa3e8', '#4cc35a', '#fff'][Math.floor(Math.random() * 5)], 300, 3);
        }
        drawWorld(scr === 'pause' ? 0 : dt);
        if (scr !== 'finish') drawHUD();
        if (scr === 'pause') drawPause();
        if (scr === 'finish') drawFinishScreen(dt);
      } else if (scr === 'title') drawTitle(dt);
      else if (scr === 'levels') drawLevels(dt);
      else drawGarage(dt);
      const play = scr === 'play' && !st.crash && !st.fin;
      const rpm = play ? Math.min(1.3, Math.abs(st.wh[0].s) * B.r / B.vmax) : 0;
      audio.update(play, rpm, play ? Math.max(0, st.thr) : 0, true);
    }

    const highestUnlocked = () => { let h = 0; for (let i = 0; i < NL; i++) if (unlocked(i)) h = i; return h; };
    hoverSel = highestUnlocked();
    function hit(p) {
      for (let i = btns.length - 1; i >= 0; i--) { const b = btns[i]; if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) { audio.sfx('tap'); b.act(); return true; } }
      return false;
    }
    api.on(canvas, 'pointerdown', e => {
      e.preventDefault();
      audio.init();
      if (e.pointerType === 'touch') touchMode = true;
      const p = toLocal(e);
      if (scr === 'finish' && finInfo.shown < 0.4) return;
      if (hit(p)) return;
      if (scr === 'play' && st.crash) contReq = true;
      if (scr === 'play') { ptrs.set(e.pointerId, p); try { canvas.setPointerCapture(e.pointerId); } catch (er) {} }
      else if (scr === 'title') { scr = 'levels'; hoverSel = highestUnlocked(); }
    });
    api.on(canvas, 'pointermove', e => { if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, toLocal(e)); });
    const up = e => ptrs.delete(e.pointerId);
    api.on(canvas, 'pointerup', up); api.on(canvas, 'pointercancel', up); api.on(canvas, 'lostpointercapture', up);
    api.on(canvas, 'contextmenu', e => e.preventDefault());
    api.on(window, 'keydown', e => {
      audio.init();
      const c = e.code, enter = c === 'Enter' || c === 'Space';
      if (scr === 'play') {
        if (c === 'KeyP') pause();
        else if (c === 'KeyR') startLevel(li);
        else if (st.crash && !e.repeat && (enter || c === 'ArrowUp' || c === 'KeyW')) contReq = true;
      } else if (scr === 'title') {
        if (c === 'ArrowUp' || c === 'ArrowDown' || c === 'KeyW' || c === 'KeyS') menuSel = 1 - menuSel;
        else if (enter) { audio.sfx('tap'); if (menuSel) scr = 'garage'; else { scr = 'levels'; hoverSel = highestUnlocked(); } }
      } else if (scr === 'levels') {
        const mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4, KeyA: -1, KeyD: 1, KeyW: -4, KeyS: 4 }[c];
        if (mv) hoverSel = Math.max(0, Math.min(NL - 1, hoverSel + mv));
        else if (enter && unlocked(hoverSel)) startLevel(hoverSel);
        else if (c === 'Backspace') scr = 'title';
      } else if (scr === 'garage') {
        const mv = { ArrowLeft: -1, ArrowRight: 1, KeyA: -1, KeyD: 1 }[c];
        if (mv) { let i = sv.bike; do { i = (i + mv + BIKES.length) % BIKES.length; } while (!bikeOk(i)); sv.bike = i; B = BIKES[i]; persist(); audio.sfx('tap'); }
        else if (enter || c === 'Backspace') scr = 'title';
      } else if (scr === 'pause') {
        if (c === 'ArrowUp' || c === 'KeyW') menuSel = (menuSel + 2) % 3;
        else if (c === 'ArrowDown' || c === 'KeyS') menuSel = (menuSel + 1) % 3;
        else if (c === 'KeyP') scr = 'play';
        else if (enter) [() => { scr = 'play'; }, () => startLevel(li), () => { scr = 'levels'; hoverSel = li; }][menuSel]();
      } else if (scr === 'finish') {
        if (finInfo.shown < 0.5) return;
        if (c === 'ArrowLeft' || c === 'KeyA') menuSel = Math.max(0, menuSel - 1);
        else if (c === 'ArrowRight' || c === 'KeyD') menuSel = Math.min(hasNext() ? 2 : 1, menuSel + 1);
        else if (c === 'KeyR') startLevel(li);
        else if (enter) { if (menuSel === 2 && hasNext()) startLevel(li + 1); else if (menuSel === 1) startLevel(li); else { scr = 'levels'; hoverSel = li; } }
      }
    });
    api.on(window, 'blur', () => { ptrs.clear(); if (scr === 'play') pause(); });
    api.loop(frame);
    return { destroy() { audio.close(); } };
  }

  Ameplay.register({
    id: 'moto-stunts', title: 'Moto Stunts', category: 'Racing', tint: '#f2992e',
    blurb: 'Ride, flip and survive 16 stunt courses through desert, dusk canyon, forest, night city and snow.',
    help: '<kbd>↑</kbd>/<kbd>W</kbd> gas · <kbd>↓</kbd>/<kbd>S</kbd> brake · <kbd>←</kbd><kbd>→</kbd> lean &amp; flip · <kbd>P</kbd> pause · <kbd>R</kbd> restart · touch pedals',
    better: 'high', format: v => v + ' stars', width: 900,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="44" r="9"/><circle cx="48" cy="44" r="9"/><path d="M16 44l10-14h14l8 14M26 30l-4-8h-6M40 30l4-10h6M30 30l4 6"/><circle cx="34" cy="14" r="4"/></svg>',
    sim: motoSim,
    mount
  });
  Ameplay.covers['moto-stunts'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mst-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb0ea"/><stop offset=".6" stop-color="#a5def5"/><stop offset="1" stop-color="#ffe0a0"/></linearGradient><linearGradient id="mst-m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b27a"/><stop offset="1" stop-color="#e99a5e"/></linearGradient><linearGradient id="mst-m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9773f"/><stop offset="1" stop-color="#bf5f2c"/></linearGradient><radialGradient id="mst-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#fff2b8" stop-opacity=".7"/><stop offset="1" stop-color="#fff2b8" stop-opacity="0"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#mst-sky)"/><circle cx="320" cy="62" r="70" fill="url(#mst-sun)"/><circle cx="320" cy="62" r="24" fill="#fff8d8"/>
<g fill="#fff" opacity=".9"><ellipse cx="80" cy="50" rx="34" ry="10"/><ellipse cx="98" cy="42" rx="20" ry="11"/><ellipse cx="220" cy="32" rx="26" ry="8"/></g>
<path d="M0 190 L10 140 H70 L80 190 L95 150 H150 L162 190 L180 128 H250 L262 190 L285 155 H350 L362 190 L372 145 H400 V300 H0Z" fill="url(#mst-m1)"/>
<path d="M0 215 L18 170 H60 L74 215 L120 180 H170 L186 215 L300 215 L316 172 H372 L386 215 H400 V300 H0Z" fill="url(#mst-m2)"/>
<g fill="none" stroke-linecap="butt"><path d="M278 238 A62 62 0 1 1 352 238" stroke="#38414a" stroke-width="22"/><path d="M278 238 A62 62 0 1 1 352 238" stroke="#7f8c98" stroke-width="15"/><path d="M285 233 A55 55 0 1 1 345 233" stroke="#c4ced6" stroke-width="4"/></g>
<path d="M0 248 H150 V300 H0Z" fill="#8f4f2a"/><path d="M0 248 H150" stroke="#e8ae5e" stroke-width="9"/><path d="M150 248 V300" stroke="#5e2f14" stroke-width="7"/>
<path d="M60 248 Q120 246 150 196 V248Z" fill="#b9773a"/><path d="M60 248 Q120 246 150 196" fill="none" stroke="#6a3b16" stroke-width="9" stroke-linecap="round"/><path d="M60 248 Q120 246 150 196" fill="none" stroke="#e0a565" stroke-width="4" stroke-linecap="round"/><g stroke="#8e5527" stroke-width="5"><path d="M100 248 V236M124 248 V224M146 248 V204"/></g>
<path d="M262 248 H400 V300 H262Z" fill="#8f4f2a"/><path d="M262 248 H400" stroke="#e8ae5e" stroke-width="9"/><path d="M262 248 V300" stroke="#5e2f14" stroke-width="7"/>
<g transform="translate(232 216) rotate(30)"><path d="M17.6 0.0 L24.3 5.8 L16.3 6.7 L20.2 14.7 L12.4 12.4 L13.1 21.3 L6.7 16.3 L3.9 24.7 L0.0 17.6 L-5.8 24.3 L-6.7 16.3 L-14.7 20.2 L-12.4 12.4 L-21.3 13.1 L-16.3 6.7 L-24.7 3.9 L-17.6 0.0 L-24.3 -5.8 L-16.3 -6.7 L-20.2 -14.7 L-12.4 -12.4 L-13.1 -21.3 L-6.7 -16.3 L-3.9 -24.7 L-0.0 -17.6 L5.8 -24.3 L6.7 -16.3 L14.7 -20.2 L12.4 -12.4 L21.3 -13.1 L16.3 -6.7 L24.7 -3.9Z" fill="#c3ccd4" stroke="#59636e" stroke-width="2.5"/><circle r="13" fill="#9aa6b1"/><circle r="5" fill="#e94b3c"/></g>
<g transform="translate(200 118) rotate(-38) scale(1.25)"><g stroke="#2b2730" stroke-width="7" stroke-linecap="round"><path d="M-4 6 L-34 18M24 -22 L34 18"/></g><circle cx="-34" cy="18" r="17" fill="#1f1d24"/><circle cx="-34" cy="18" r="11" fill="none" stroke="#c9d1d8" stroke-width="3"/><circle cx="34" cy="18" r="17" fill="#1f1d24"/><circle cx="34" cy="18" r="11" fill="none" stroke="#c9d1d8" stroke-width="3"/><rect x="-12" y="-6" width="24" height="18" rx="4" fill="#3a3640"/><path d="M-50 -22 L-24 -18 L-6 -24 L18 -30 L32 -26 L30 -14 L12 -6 L-10 -6 L-26 -10 L-44 -14Z" fill="#1d1b26"/><path d="M-47 -20 L-24 -16 L-6 -22 L17 -28 L29 -24 L27 -16 L11 -8 L-10 -8 L-26 -12 L-43 -15Z" fill="#e8452c"/><path d="M-6 -19 L16 -25 L22 -18 L4 -12Z" fill="#ffd23f"/><g stroke-linecap="round" fill="none"><path d="M-14 -18 L-2 -42" stroke="#1d1b26" stroke-width="15"/><path d="M-14 -18 L-2 -42" stroke="#2a64d0" stroke-width="11"/><path d="M-14 -18 L5 -10 L-4 5" stroke="#1d1b26" stroke-width="9"/><path d="M-2 -42 L12 -30 L21 -31" stroke="#1d1b26" stroke-width="8"/><path d="M-2 -42 L12 -30 L21 -31" stroke="#2a64d0" stroke-width="5"/></g><circle cx="5" cy="-55" r="11" fill="#1d1b26"/><circle cx="5" cy="-55" r="9.5" fill="#ffd23f"/><path d="M6 -58 L15 -57 L14 -51 L7 -51Z" fill="#1d1b26"/></g>
<g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"><path d="M150 92 A70 70 0 0 0 140 160"/><path d="M262 70 A80 80 0 0 1 280 130"/></g><path d="M268 122 L284 134 L290 116Z" fill="#fff" opacity=".85"/>
<g transform="translate(386 248)"><rect x="-3" y="-80" width="6" height="80" fill="#e9edf1"/><path d="M3 -78 L40 -70 L3 -56Z" fill="#3ccf6a"/></g>
</svg>`;
})();

