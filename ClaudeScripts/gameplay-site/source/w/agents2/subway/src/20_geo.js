
  const FACES = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
  function mkGB(THREE, white) {
    const tc = new THREE.Color();
    return function GB() {
      const P = [], N = [], C = [], U = [];
      const api = {
        add(geo, color, map, opt) {
          const g = geo.index ? geo.toNonIndexed() : geo;
          if (g !== geo) geo.dispose();
          const pa = g.attributes.position.array, na = g.attributes.normal.array, ua = g.attributes.uv ? g.attributes.uv.array : null;
          const cnt = pa.length / 3;
          let y0 = 1e9, y1 = -1e9;
          for (let i = 0; i < cnt; i++) { const y = pa[i * 3 + 1]; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          const grad = !(opt && opt.flat) && y1 - y0 > 0.35, ih = 1 / Math.max(1e-4, y1 - y0);
          const box = cnt === 36 && map && !Array.isArray(map);
          for (let i = 0; i < cnt; i++) {
            const ny = na[i * 3 + 1];
            let rect = null, col = color;
            if (map) {
              if (Array.isArray(map)) rect = map;
              else if (box) { const e = map[FACES[(i / 6) | 0]]; if (e) { if (typeof e[0] === 'number') rect = e; else { rect = e[0]; if (e[1]) col = e[1]; } } }
            }
            tc.set(col); tc.convertSRGBToLinear();
            let f = ny < -0.5 ? 0.6 : ny > 0.5 ? 1.0 : 0.9;
            if (grad && !rect) f *= 0.74 + 0.26 * (pa[i * 3 + 1] - y0) * ih;
            if (opt && opt.k) f *= opt.k;
            P.push(pa[i * 3], pa[i * 3 + 1], pa[i * 3 + 2]); N.push(na[i * 3], ny, na[i * 3 + 2]);
            C.push(tc.r * f, tc.g * f, tc.b * f);
            if (rect && ua) U.push(rect[0] + ua[i * 2] * (rect[2] - rect[0]), rect[1] + ua[i * 2 + 1] * (rect[3] - rect[1]));
            else U.push(white[0], white[1]);
          }
          g.dispose();
          return api;
        },
        box(w, h, d, x, y, z, color, map, rot, opt) {
          const g = new THREE.BoxGeometry(w, h, d);
          if (rot) { if (rot[0]) g.rotateX(rot[0]); if (rot[1]) g.rotateY(rot[1]); if (rot[2]) g.rotateZ(rot[2]); }
          g.translate(x, y, z);
          return api.add(g, color, map, opt);
        },
        cyl(rt, rb, h, seg, x, y, z, color, rot, opt) {
          const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, false);
          if (rot) { if (rot[0]) g.rotateX(rot[0]); if (rot[1]) g.rotateY(rot[1]); if (rot[2]) g.rotateZ(rot[2]); }
          g.translate(x, y, z);
          return api.add(g, color, null, opt);
        },
        ball(r, x, y, z, color, sx, sy, sz, det) {
          const g = new THREE.IcosahedronGeometry(r, det == null ? 1 : det);
          g.scale(sx || 1, sy || 1, sz || 1); g.translate(x, y, z);
          return api.add(g, color, null, { flat: true });
        },
        quad(a, b, c, d, color, rect, opt) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
          g.computeVertexNormals();
          return api.add(g, color, rect, Object.assign({ flat: true }, opt || {}));
        },
        tri(a, b, c, color) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1], 2));
          g.computeVertexNormals();
          return api.add(g, color, null, { flat: true });
        },
        get size() { return P.length / 3; },
        build() {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
          g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
          g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
          g.computeBoundingSphere();
          return g;
        }
      };
      return api;
    };
  }

  function mkWorld(THREE, AT, city) {
    const { R, uv } = AT;
    const wuv = uv(R.white, 0.5, 0.5, 0.5, 0.5);
    const GB = mkGB(THREE, [wuv[0], wuv[1]]);
    const out = { bin: [] };
    const fin = b => { const g = b.build(); out.bin.push(g); return g; };
    const C = CFG, TW = C.THW * 2, BODY0 = 0.45, RB = 0.5, BODYH = C.ROOF - RB - BODY0;

    function freightCar(liv, lv) {
      const b = GB(), L = C.CAR, zc = -L / 2, side = uv(R.liv[liv]), end = uv(R.ends[liv]), k = lv[3];
      b.box(TW, BODYH, L - 0.1, 0, BODY0 + BODYH / 2, zc, '#ffffff', { px: side, nx: side, pz: end, nz: end, py: [null, shade(lv[0], -0.2)] });
      const top = shade(lv[0], k === 'gon' ? -0.35 : 0.08);
      b.box(TW + 0.06, 0.5, L - 0.1, 0, C.ROOF - 0.25, zc, k === 'gon' ? shade(lv[0], -0.15) : top);
      if (k === 'box') for (let i = 0; i < 7; i++) b.box(TW - 0.12, 0.07, 0.14, 0, C.ROOF + 0.035, zc - L * 0.45 + i * L * 0.15, shade(lv[0], -0.3));
      else if (k === 'cont') { for (let i = 0; i < 12; i++) b.box(TW - 0.2, 0.05, 0.12, 0, C.ROOF + 0.025, zc - L * 0.46 + i * L * 0.084, shade(lv[0], -0.22)); b.box(TW - 0.1, 0.06, 0.2, 0, C.ROOF + 0.03, zc, '#26262c'); }
      else { b.box(TW - 0.34, 0.1, L - 0.7, 0, C.ROOF + 0.05, zc, '#2a2522'); for (let i = 0; i < 14; i++) b.ball(0.2 + (i % 3) * 0.06, ((i * 37) % 7 - 3) * 0.17, C.ROOF + 0.1, zc - L * 0.42 + i * L * 0.06, '#1d1a18', 1, 0.7, 1.2, 0); }
      b.box(TW - 0.5, 0.32, L - 1.6, 0, 0.3, zc, '#2c2d35');
      for (const zz of [-1.6, -L + 1.6]) {
        b.box(1.9, 0.34, 2.4, 0, 0.3, zz, '#3a3b44');
        for (const dz of [-0.75, 0.75]) for (const sx of [-1, 1]) b.cyl(0.3, 0.3, 0.12, 10, sx * 0.86, 0.32, zz + dz, '#1f2026', [0, 0, Math.PI / 2]);
      }
      for (const sx of [-1, 1]) b.box(0.08, 0.1, L - 0.4, sx * (TW / 2 + 0.02), BODY0 + 0.05, zc, '#3a3b44');
      b.box(0.5, 0.14, 0.5, 0, 0.5, -0.1, '#55575f'); b.box(0.5, 0.14, 0.5, 0, 0.5, -L + 0.1, '#55575f');
      return fin(b);
    }
    function deckCar(liv, lv) {
      const b = GB(), L = C.CAR, zc = -L / 2, k = lv[3];
      b.box(TW - 0.3, 0.34, L - 0.1, 0, 0.62, zc, '#2c2d35');
      for (const zz of [-1.6, -L + 1.6]) {
        b.box(1.9, 0.34, 2.4, 0, 0.3, zz, '#3a3b44');
        for (const dz of [-0.75, 0.75]) for (const sx of [-1, 1]) b.cyl(0.3, 0.3, 0.12, 10, sx * 0.86, 0.32, zz + dz, '#1f2026', [0, 0, Math.PI / 2]);
      }
      if (k === 'flat') {
        b.box(TW, 0.18, L - 0.1, 0, 0.86, zc, '#6a5a44');
        for (const zz of [zc + L * 0.25, zc - L * 0.25]) {
          const ch = C.ROOF - 0.95;
          b.box(TW - 0.24, ch, L * 0.42, 0, 0.95 + ch / 2, zz, '#b9853f');
          for (let i = 0; i < 5; i++) b.box(TW - 0.18, 0.12, L * 0.43, 0, 1.3 + i * 0.5, zz, '#8a6128');
          for (const dz of [-0.14, 0.14]) b.box(TW - 0.16, ch + 0.02, 0.12, 0, 0.95 + ch / 2, zz + L * dz, '#2a2a30');
          b.box(TW - 0.3, 0.04, L * 0.42, 0, C.ROOF + 0.02, zz, '#a07430');
        }
        for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) b.box(0.08, 1.2, 0.1, sx * (TW / 2 - 0.02), 1.5, zc - L * 0.45 + i * L * 0.3, '#3a3b44');
      } else {
        const r = TW / 2, cy = C.ROOF - r;
        b.box(TW * 0.86, cy - 0.45 + 0.6, L - 1.2, 0, (cy + 0.15 + 0.45) / 2, zc, '#2c2d35');
        const g = new THREE.CylinderGeometry(r, r, L - 0.7, 20, 1, false); g.rotateX(Math.PI / 2); g.translate(0, cy, zc); b.add(g, lv[0]);
        for (const dz of [-0.34, 0, 0.34]) { const g2 = new THREE.CylinderGeometry(r + 0.025, r + 0.025, 0.4, 20, 1, false); g2.rotateX(Math.PI / 2); g2.translate(0, cy, zc + dz * L); b.add(g2, lv[1], null, { flat: true }); }
        { const g3 = new THREE.CylinderGeometry(r + 0.02, r + 0.02, 1.3, 20, 1, false); g3.rotateX(Math.PI / 2); g3.translate(0, cy, zc); b.add(g3, '#f2f2f2', null, { flat: true }); }
        b.box(0.5, 0.05, L - 1.4, 0, C.ROOF + 0.02, zc, '#7a808a');
        b.cyl(0.3, 0.3, 0.24, 10, 0, C.ROOF + 0.1, zc + L * 0.2, '#c9ccd2');
        b.cyl(0.3, 0.3, 0.24, 10, 0, C.ROOF + 0.1, zc - L * 0.2, '#c9ccd2');
        for (const zz of [-0.15, -L + 0.15]) for (const sx of [-0.7, 0.7]) b.box(0.06, 2.0, 0.06, sx, cy, zz, '#3a3b44');
      }
      b.box(0.5, 0.14, 0.5, 0, 0.5, -0.1, '#55575f'); b.box(0.5, 0.14, 0.5, 0, 0.5, -L + 0.1, '#55575f');
      return fin(b);
    }
    function car(liv, kind) {
      const tl = trainsOf(city)[liv];
      if (tl[3] === 'tank' || tl[3] === 'flat') return deckCar(liv, tl);
      if (tl[3]) return freightCar(liv, tl);
      const b = GB(), L = C.CAR, zc = -L / 2;
      const side = uv(R.liv[liv]);
      const faceN = kind === 'front' ? uv(R.front[liv]) : kind === 'lit' ? uv(R.frontLit[liv]) : uv(R.ends[liv]);
      b.box(TW, BODYH, L - 0.1, 0, BODY0 + BODYH / 2, zc, '#ffffff', { px: side, nx: side, pz: faceN, nz: uv(R.ends[liv]), py: [null, '#b9bec6'] });
      const lv = city.trains[liv], roofC = lv[2] === 'low' ? shade(lv[1], 0.08) : shade(lv[0], 0.12);
      { const g = new THREE.CylinderGeometry(TW / 2, TW / 2, L - 0.1, 18, 1, false, -Math.PI / 2, Math.PI); g.rotateX(-Math.PI / 2); g.scale(1, RB / (TW / 2), 1); g.translate(0, C.ROOF - RB, zc); b.add(g, roofC, null, { flat: true }); }
      b.box(TW + 0.04, 0.08, L - 0.06, 0, C.ROOF - RB, zc, shade(lv[0], -0.35));
      b.box(0.9, 0.16, 2.0, 0, C.ROOF + 0.02, zc - L * 0.28, '#8f959e');
      b.box(0.9, 0.16, 2.0, 0, C.ROOF + 0.02, zc + L * 0.28, '#8f959e');
      b.box(TW - 0.5, 0.32, L - 1.6, 0, 0.3, zc, '#2c2d35');
      for (const zz of [-1.6, -L + 1.6]) {
        b.box(1.9, 0.34, 2.4, 0, 0.3, zz, '#3a3b44');
        for (const dz of [-0.75, 0.75]) for (const sx of [-1, 1]) b.cyl(0.3, 0.3, 0.12, 10, sx * 0.86, 0.32, zz + dz, '#1f2026', [0, 0, Math.PI / 2]);
      }
      if (kind !== 'mid') {
        b.box(TW - 0.2, 0.22, 0.24, 0, 0.55, -0.02, '#2a2a33');
        b.box(0.5, 0.18, 0.4, 0, 0.36, 0.1, '#55575f');
      } else b.box(1.0, 1.9, 0.5, 0, 1.5, 0.2, '#30323a');
      return fin(b);
    }
    out.car = { front: [], lit: [], mid: [] };
    for (let i = 0; i < trainsOf(city).length; i++) { out.car.front.push(car(i, 'front')); out.car.lit.push(car(i, 'lit')); out.car.mid.push(car(i, 'mid')); }

    {
      const b = GB(), L = C.RAMP, w = 2.2, top = C.ROOF + 0.02, r = uv(R.ramp), sd = uv(R.rampSide);
      b.quad([-w / 2, 0.04, 0], [w / 2, 0.04, 0], [w / 2, top, -L], [-w / 2, top, -L], '#ffffff', r);
      for (const s of [-1, 1]) {
        const x = s * w / 2;
        if (s > 0) b.quad([x, 0, 0], [x, 0, -L], [x, top, -L], [x, 0.04, 0], '#8b8f98');
        else b.quad([x, 0, -L], [x, 0, 0], [x, 0.04, 0], [x, top, -L], '#8b8f98');
        b.box(0.12, 0.12, Math.hypot(L, top), x, top / 2 + 0.06, -L / 2, '#ffcf1f', null, [Math.atan2(top, L), 0, 0]);
        for (let k = 1; k < 4; k++) { const z = -L * k / 4, hh = top * k / 4; b.box(0.14, hh, 0.14, x * 0.9, hh / 2, z, '#6b6f78'); }
      }
      b.quad([-w / 2, 0, -L], [w / 2, 0, -L], [w / 2, top, -L], [-w / 2, top, -L], '#55585f');
      b.box(w + 0.1, 0.1, 0.3, 0, 0.05, -0.1, '#26222e');
      out.ramp = fin(b);
    }
    {
      const b = GB(), lw = 2.1, st = uv(R.low), ch = uv(R.chev);
      for (const sg of [-1, 1]) {
        b.box(0.1, 0.98, 0.1, sg * (lw / 2 - 0.08), 0.52, 0, '#f2f2f2');
        b.box(0.12, 0.42, 0.1, sg * (lw / 2 - 0.08), 0.21, 0.24, '#d6d9de', null, [0.7, 0, 0]);
      }
      b.box(lw + 0.3, 0.08, 0.9, 0, 0.04, 0.05, '#5fb4ec');
      b.box(lw + 0.2, 0.05, 0.8, 0, 0.09, 0.05, '#bfe4fb');
      b.box(lw, 0.34, 0.09, 0, 0.82, 0, '#ffffff', { pz: st, nz: st });
      b.box(lw * 0.82, 0.42, 0.06, 0, 0.42, 0, '#ffffff', { pz: ch, nz: ch });
      out.low = fin(b);
    }
    {
      const b = GB(), lw = 2.2, st = uv(R.low), ch = uv(R.chev);
      for (const sg of [-1, 1]) {
        b.box(0.14, C.HIGH_T, 0.14, sg * (lw / 2 - 0.02), C.HIGH_T / 2, 0, '#f2f2f2');
        b.box(0.5, 0.1, 0.6, sg * (lw / 2), 0.05, 0, '#5fb4ec');
      }
      b.box(lw, 0.42, 0.12, 0, C.HIGH_B + 0.28, 0, '#ffffff', { pz: st, nz: st });
      b.box(lw * 0.9, 0.8, 0.08, 0, C.HIGH_B + 0.9, 0, '#ffffff', { pz: ch, nz: ch });
      b.box(lw, 0.42, 0.12, 0, C.HIGH_T - 0.28, 0, '#ffffff', { pz: st, nz: st });
      out.high = fin(b);
      const lb = GB();
      for (const sx of [-1, 1]) for (const yy of [C.HIGH_B + 0.28, C.HIGH_T - 0.28]) lb.ball(0.16, sx * (lw / 2 + 0.05), yy, 0.02, '#3fa0ff', 1, 1, 0.8);
      out.highLamp = fin(lb);
    }
    {
      const b = GB(), wy = 7.6;
      for (let l = 0; l < 3; l++) { b.box(0.04, 0.04, C.CHUNK, LX(l), wy, -C.CHUNK / 2, '#2a2a30'); b.box(0.03, 0.03, C.CHUNK, LX(l), wy + 0.55, -C.CHUNK / 2, '#2a2a30'); }
      for (const z of [-10, -30]) {
        b.box(9.6, 0.05, 0.05, 0, wy + 0.85, z, '#2a2a30');
        for (let l = 0; l < 3; l++) b.box(0.03, 0.55, 0.03, LX(l), wy + 0.28, z, '#2a2a30');
      }
      for (const sg of [-1, 1]) { b.box(0.22, wy + 1.2, 0.22, sg * 5.0, (wy + 1.2) / 2, -10, '#5a5f6a'); b.box(0.22, wy + 1.2, 0.22, sg * 5.0, (wy + 1.2) / 2, -30, '#5a5f6a'); }
      out.wires = fin(b);
    }

    const T = city.tree;
    const lift = (b, dy) => ({ box: (w, h, d, x, y, z, ...q) => b.box(w, h, d, x, y + dy, z, ...q), cyl: (t, u, h, n, x, y, z, ...q) => b.cyl(t, u, h, n, x, y + dy, z, ...q), ball: (r, x, y, z, ...q) => b.ball(r, x, y + dy, z, ...q), add: (g, ...q) => { g.translate(0, dy, 0); return b.add(g, ...q); } });
    function signal(b, x, z) {
      const su = uv(R.sig);
      b.box(0.14, 4.4, 0.14, x, 2.2, z, '#ffffff', { px: su, nx: su, pz: su, nz: su });
      b.box(0.5, 0.12, 0.5, x, 0.06, z, '#4a4e58');
      b.box(0.5, 1.0, 0.36, x, 4.7, z, '#e8323a');
      b.box(0.58, 0.08, 0.42, x, 5.22, z, '#b81f22');
      b.box(0.26, 0.26, 0.04, x, 4.92, z + 0.19, '#5aff7a', null, null, { k: 1.4 }); b.box(0.26, 0.26, 0.04, x, 4.5, z + 0.19, '#5a1414');
    }
    function tree(b, x, z, s) {
      s = s || 1;
      const L = city.leaf;
      if (T === 'palm') {
        let px = x, py = 0;
        const lean = rnd(-0.2, 0.2);
        for (let k = 0; k < 5; k++) { b.cyl(0.16 * s, 0.2 * s, 1.5 * s, 6, px, py + 0.75 * s, z, '#8a6a44', [0, 0, lean * k * 0.3]); px -= Math.sin(lean * k * 0.3) * 1.5 * s; py += 1.45 * s; }
        for (let k = 0; k < 7; k++) {
          const a = k * TAU / 7;
          const g = new THREE.BoxGeometry(2.6 * s, 0.06, 0.6 * s); g.translate(1.3 * s, 0, 0); g.rotateZ(-0.45); g.rotateY(a); g.translate(px, py, z);
          b.add(g, k % 2 ? L[0] : L[1], null, { flat: true });
        }
        b.ball(0.35 * s, px, py, z, '#6b4a2a');
      } else if (T === 'cypress') {
        b.cyl(0.12, 0.16, 1, 5, x, 0.5, z, '#6b4a2a');
        b.cyl(0.12 * s, 0.75 * s, 5.5 * s, 7, x, 1 + 2.75 * s, z, L[0]);
        b.cyl(0.5 * s, 0.7 * s, 1.6 * s, 7, x, 1.4 + 0.8 * s, z, L[1]);
      } else if (T === 'bare') {
        b.cyl(0.14, 0.24, 3.4 * s, 6, x, 1.7 * s, z, L[0]);
        for (let k = 0; k < 5; k++) { const a = k * 1.3, h = 2 + k * 0.4; const g = new THREE.CylinderGeometry(0.04, 0.09, 1.8 * s, 4); g.translate(0, 0.9 * s, 0); g.rotateZ(0.8); g.rotateY(a); g.translate(x, h * s, z); b.add(g, L[1]); }
      } else {
        b.cyl(0.14 * s, 0.2 * s, 2.2 * s, 6, x, 1.1 * s, z, '#7a5434');
        const lc = T === 'blossom' ? ['#ffb3d1', '#f28ab4', '#ffd6e6'] : [L[0], L[1], shade(L[0], 0.15)];
        b.ball(1.3 * s, x, 2.9 * s, z, lc[0]);
        b.ball(0.95 * s, x + 0.7 * s, 2.4 * s, z + 0.4 * s, lc[1]);
        b.ball(0.9 * s, x - 0.6 * s, 3.4 * s, z - 0.3 * s, lc[2]);
      }
    }
    function bush(b, x, z) { const c = T === 'blossom' ? '#ff9ac4' : city.leaf[0]; b.ball(0.8, x, 0.45, z, c, 1.2, 0.7, 1.1); b.ball(0.6, x + 0.6, 0.4, z + 0.5, shade(c, -0.12), 1, 0.8, 1); }
    function prop(b, sg, x, z) {
      const P = city.props;
      if (P === 'pumpkin') { b.ball(0.42, x, 0.36, z, '#ff7a1a', 1.2, 0.85, 1.2); b.box(0.08, 0.2, 0.08, x, 0.78, z, '#3a7a2a'); b.box(0.36, 0.1, 0.02, x, 0.36, z + sg * 0, '#3a1a0a'); }
      else if (P === 'london') { b.box(0.9, 2.4, 0.9, x, 1.2, z, '#d8282c'); b.box(0.92, 0.2, 0.92, x, 2.45, z, '#b81f22'); b.box(0.02, 1.2, 0.6, x - sg * 0.46, 1.4, z, '#bfe0f0'); }
      else if (P === 'tokyo') { b.cyl(0.06, 0.06, 3, 5, x, 1.5, z, '#3a3a40'); b.ball(0.32, x, 2.6, z, '#e8323a', 1, 1.3, 1); b.ball(0.32, x, 1.9, z, '#ffd23f', 1, 1.3, 1); }
      else if (P === 'paris') { b.cyl(0.07, 0.1, 3.6, 6, x, 1.8, z, '#2f4a3a'); b.box(0.36, 0.5, 0.36, x, 3.8, z, '#2f4a3a'); b.box(0.26, 0.34, 0.26, x, 3.78, z, '#fff3b0'); }
      else if (P === 'rome') { b.cyl(0.35, 0.4, 2.6, 10, x, 1.3, z, '#efe2c4'); b.box(0.9, 0.25, 0.9, x, 2.7, z, '#e2d4b4'); }
      else if (P === 'cairo') { b.box(0.7, 0.4, 0.7, x, 0.2, z, '#cdb07a'); b.cyl(0.12, 0.32, 4, 4, x, 2.4, z, '#e6c48a', [0, Math.PI / 4, 0]); }
      else if (P === 'beach') { b.cyl(0.05, 0.05, 2.4, 5, x, 1.2, z, '#eee'); b.cyl(0.05, 1.3, 0.5, 8, x, 2.5, z, pick(['#ff5a7a', '#ffd23f', '#3ad1ff'])); }
      else { b.box(0.36, 0.7, 0.36, x, 0.35, z, '#e8323a'); b.box(0.5, 0.12, 0.2, x, 0.5, z, '#c42a2a'); }
    }
    function lamp(b, sg, x, z) {
      b.cyl(0.07, 0.09, 4.6, 6, x, 2.3, z, '#4a4e58');
      b.box(1.1, 0.08, 0.08, x - sg * 0.5, 4.55, z, '#4a4e58');
      b.box(0.4, 0.14, 0.24, x - sg * 1.0, 4.48, z, '#fff3c4');
    }
    function pole(b, sg, x, z) {
      b.cyl(0.13, 0.17, 7.5, 6, x, 3.75, z, '#7a5a3c');
      b.box(0.12, 0.12, 1.8, x, 7.0, z, '#6a4a2c', null, [0, 0, 0]);
      b.box(1.6, 0.1, 0.1, x, 6.6, z, '#6a4a2c');
      for (const d of [-0.6, 0.6]) b.box(0.08, 0.16, 0.08, x + d, 6.72, z, '#d9dde6');
    }
    function building(b, sg, x0, z0, len, h, k) {
      const dep = 9, fr = R.fac[k % R.fac.length], cx = sg * (x0 + dep / 2), cz = z0 - len / 2;
      const crop = Math.min(1, h / 15);
      const fu = uv(fr, 0, 1 - crop, 1, 1);
      const col = city.bld[k % city.bld.length];
      const m = sg < 0 ? { px: fu, pz: fu, nz: fu, py: [null, col[1]] } : { nx: fu, pz: fu, nz: fu, py: [null, col[1]] };
      b.box(dep, h, len, cx, h / 2, cz, '#ffffff', m);
      const st = city.roof, rc = col[1];
      if (st === 'mansard' || st === 'tile') {
        const rh = st === 'mansard' ? 2.6 : 2.0, ins = st === 'mansard' ? 1.0 : dep / 2 - 0.2, c2 = st === 'mansard' ? '#5d6b80' : '#c4553a';
        const xa = cx - dep / 2, xb = cx + dep / 2, za = cz + len / 2, zb = cz - len / 2, y = h, y2 = h + rh;
        const ia = xa + ins, ib = xb - ins, ja = za - Math.min(ins, len / 2 - 0.2), jb = zb + Math.min(ins, len / 2 - 0.2);
        b.quad([xa, y, za], [xb, y, za], [ib, y2, ja], [ia, y2, ja], c2);
        b.quad([xb, y, zb], [xa, y, zb], [ia, y2, jb], [ib, y2, jb], c2);
        b.quad([xb, y, za], [xb, y, zb], [ib, y2, jb], [ib, y2, ja], c2);
        b.quad([xa, y, zb], [xa, y, za], [ia, y2, ja], [ia, y2, jb], c2);
        if (st === 'mansard') { b.quad([ia, y2, ja], [ib, y2, ja], [ib, y2, jb], [ia, y2, jb], '#4a5568'); for (let q = 0; q < Math.floor(len / 3); q++) b.box(0.9, 1.1, 0.9, sg < 0 ? xb - 0.6 : xa + 0.6, h + 1.0, za - 1.5 - q * 3, '#e9e4d8'); }
      } else {
        b.box(dep, 0.5, 0.3, cx, h + 0.25, cz + len / 2 - 0.15, rc);
        b.box(dep, 0.5, 0.3, cx, h + 0.25, cz - len / 2 + 0.15, rc);
        b.box(0.3, 0.5, len, cx - sg * (dep / 2 - 0.15), h + 0.25, cz, rc);
        if (st === 'chimney') for (let q = 0; q < 2; q++) { b.box(0.8, 1.6, 0.8, cx + rnd(-2, 2), h + 0.8, cz + rnd(-len / 3, len / 3), '#8a4a3a'); }
        if (city.props === 'city' && chance(0.45)) {
          const tx = cx + rnd(-1.5, 1.5), tz = cz + rnd(-len / 4, len / 4);
          for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) b.box(0.12, 1.6, 0.12, tx + dx, h + 0.8, tz + dz, '#4a3a30');
          b.cyl(1.2, 1.2, 2.2, 10, tx, h + 2.7, tz, '#9a6a44');
          b.cyl(0.05, 1.35, 0.9, 10, tx, h + 4.25, tz, '#6a4a34');
        }
        if (chance(0.5)) b.box(1.4, 0.8, 1.2, cx + rnd(-2, 2), h + 0.4, cz + rnd(-len / 3, len / 3), '#a9adb5');
      }
      if (st === 'flat' && city.style === 'modern' && chance(0.6)) {
        b.box(0.2, 3.2, 1.6, sg * (x0 - 0.15), h * 0.55, cz + rnd(-len / 4, len / 4), '#ffffff', sg < 0 ? { px: uv(R.neon), nx: uv(R.neon) } : { nx: uv(R.neon), px: uv(R.neon) });
      }
    }
    function buildingRow(b, sg, x0) {
      let z = 0;
      let k = rint(0, 9);
      while (z > -C.CHUNK) {
        const len = Math.min(rnd(7, 13), C.CHUNK + z);
        if (len < 3) break;
        const h = city.style === 'modern' ? rnd(12, 26) : city.style === 'favela' ? rnd(5, 9) : rnd(8, 17);
        building(b, sg, x0 + (city.style === 'favela' ? rnd(0, 3) : rnd(0, 1.2)), z, len, h, k++);
        if (city.style === 'favela') building(b, sg, x0 + 7, z - 1, len, h + rnd(2, 5), k++);
        z -= len + (chance(0.3) ? rnd(1, 3) : 0);
      }
    }
    function ground(b, sg, x1) {
      b.box(1.7, 0.1, C.CHUNK, sg * (3.75 + 0.85), -0.03, -C.CHUNK / 2, city.side);
      b.box(x1 - 5.45, 0.14, C.CHUNK, sg * (5.45 + (x1 - 5.45) / 2), 0.0, -C.CHUNK / 2, city.walk);
      b.box(60, 0.1, C.CHUNK, sg * (x1 + 30), -0.02, -C.CHUNK / 2, shade(city.walk, -0.08));
    }

    function clutter(b, x, z, far) {
      const k = rint(0, far ? 1 : 4);
      if (k === 0) { b.box(1.7, 1.1, 0.95, x, 0.65, z, pick(['#2f6f4a', '#3a5f8a', '#6a4a2a'])); b.box(1.8, 0.12, 1.05, x, 1.24, z, '#1f2f28'); b.box(0.3, 0.3, 0.04, x, 0.75, z + 0.5, '#ffffff'); }
      else if (k === 1) { for (let i = 0; i < 3; i++) b.box(0.8, 0.8, 0.8, x - Math.sign(x) * (i === 1 ? 0.85 : 0), 0.4 + (i === 2 ? 0.8 : 0), z + (i === 1 ? 0.08 : 0), shade('#a9773f', i * 0.06 - 0.08)); }
      else if (k === 2) { for (let i = 0; i < 2; i++) { const zz = z + i * 0.9; b.box(0.5, 0.06, 0.5, x, 0.03, zz, '#26262c'); b.cyl(0.04, 0.2, 0.72, 8, x, 0.42, zz, '#ff7a1a'); b.cyl(0.115, 0.145, 0.1, 8, x, 0.46, zz, '#ffffff'); } }
      else if (k === 3) { b.cyl(0.38, 0.38, 0.95, 10, x, 0.48, z, pick(['#2f6fd9', '#d8322c', '#3a3f4a'])); b.cyl(0.39, 0.39, 0.08, 10, x, 0.7, z, '#1f2a4a'); b.cyl(0.39, 0.39, 0.08, 10, x, 0.28, z, '#1f2a4a'); }
      else { b.cyl(0.17, 0.2, 0.62, 8, x, 0.31, z, '#e8323a'); b.ball(0.19, x, 0.68, z, '#e8323a'); b.box(0.5, 0.12, 0.12, x, 0.45, z, '#e8323a'); b.box(0.22, 0.08, 0.22, x, 0.82, z, '#b81f22'); }
    }
    function sideChunk(sg, kind) {
      const b = GB(), f = GB();
      const fence = (x, h, z0, z1) => {
        const r = [0, 0, Math.abs(z1 - z0) / 2.5, h / 2.5];
        const g = new THREE.PlaneGeometry(Math.abs(z1 - z0), h); g.rotateY(Math.PI / 2); g.translate(x, h / 2 + 0.2, (z0 + z1) / 2);
        const ua = g.attributes.uv.array; for (let i = 0; i < ua.length; i += 2) { ua[i] *= r[2]; ua[i + 1] *= r[3]; }
        f.add(g, '#ffffff', [0, 0, 1, 1], { flat: true });
      };
      ground(b, sg, 9.5);
      if (kind < 4 && hash(sg * 3.1 + kind * 7.7 + city.light * 11) < 0.6) { const z = -rnd(6, 34); signal(b, sg * 4.15, z); }
      if (kind === 0) {
        const wx = sg * 5.7;
        for (let s = 0; s < 2; s++) {
          const z0 = -s * C.CHUNK / 2, gr = uv(R.graf[(s + rint(0, 3)) % 4]);
          b.box(0.4, 2.9, C.CHUNK / 2, wx, 1.45, z0 - C.CHUNK / 4, city.wall, sg < 0 ? { px: gr } : { nx: gr });
        }
        b.box(0.6, 0.18, C.CHUNK, wx, 2.95, -C.CHUNK / 2, city.wallTop);
        for (let z = 0; z > -C.CHUNK; z -= 10) b.box(0.6, 3.0, 0.5, wx - sg * 0.05, 1.5, z - 0.25, city.wallTop);
        if (city.props === 'pumpkin') for (let z = -4; z > -C.CHUNK; z -= rnd(6, 12)) { b.ball(0.38, wx, 3.35, z, '#ff7a1a', 1.2, 0.85, 1.2); b.box(0.06, 0.16, 0.06, wx, 3.72, z, '#3a7a2a'); }
        tree(b, sg * 7.6, -rnd(8, 14), rnd(0.9, 1.2)); tree(b, sg * 7.8, -rnd(26, 34), rnd(0.9, 1.2));
        buildingRow(b, sg, 10);
      } else if (kind === 1) {
        const fx = sg * 5.6;
        b.box(0.3, 0.3, C.CHUNK, fx, 0.15, -C.CHUNK / 2, '#a9a9a9');
        for (let z = 0; z >= -C.CHUNK; z -= 5) { b.cyl(0.07, 0.07, 2.7, 6, fx, 1.35, z, '#8f949c'); }
        b.box(0.08, 0.08, C.CHUNK, fx, 2.6, -C.CHUNK / 2, '#8f949c');
        fence(fx, 2.4, 0, -C.CHUNK);
        for (let z = -3; z > -C.CHUNK; z -= rnd(6, 10)) { if (chance(0.55)) tree(b, sg * rnd(6.8, 8.4), z, rnd(0.8, 1.15)); else bush(b, sg * rnd(6.5, 8), z); }
        prop(b, sg, sg * 8.7, -rnd(5, 35));
        buildingRow(b, sg, 10.5);
      } else if (kind === 2) {
        const px0 = 4.05, px1 = 10, ph = 1.15, cx = sg * (px0 + px1) / 2;
        b.box(px1 - px0, ph, C.CHUNK, cx, ph / 2, -C.CHUNK / 2, '#cfcac0');
        b.box(0.5, 0.04, C.CHUNK, sg * (px0 + 0.4), ph + 0.01, -C.CHUNK / 2, '#ffcf1f');
        for (let z = -4; z > -C.CHUNK; z -= 9) {
          b.box(0.34, 3.4, 0.34, sg * 8.2, ph + 1.7, z, '#5a6170');
          b.box(1.8, 0.45, 0.6, sg * 7.4, ph + 0.42, z - 3.5, '#3f86d9');
          b.box(1.8, 0.1, 0.6, sg * 7.4, ph + 0.2, z - 3.5, '#4a4e58');
        }
        b.box(6.4, 0.25, C.CHUNK, sg * 7.4, ph + 3.5, -C.CHUNK / 2, '#e9e6de');
        b.box(6.6, 0.1, C.CHUNK, sg * 7.4, ph + 3.66, -C.CHUNK / 2, '#d8282c');
        const sgu = uv(R.sign);
        b.box(0.16, 0.9, 2.6, sg * 5.2, ph + 2.75, -C.CHUNK / 2, '#ffffff', { px: sgu, nx: sgu });
        b.box(0.05, 0.6, 0.05, sg * 5.2, ph + 3.3, -C.CHUNK / 2 - 0.8, '#3a3a40'); b.box(0.05, 0.6, 0.05, sg * 5.2, ph + 3.3, -C.CHUNK / 2 + 0.8, '#3a3a40');
        const gr = uv(R.graf[rint(0, 3)]);
        b.box(0.4, 4.6, C.CHUNK, sg * 10.2, 2.3, -C.CHUNK / 2, city.wall, sg < 0 ? { px: gr } : { nx: gr });
        buildingRow(b, sg, 10.6);
      } else if (kind === 4) {
        const wx = sg * 5.9, ah = 6.4, a = city.arch || city.wall, au = uv(R.arch);
        for (let s = 0; s < 2; s++) b.box(0.8, ah, C.CHUNK / 2, wx, ah / 2, -s * C.CHUNK / 2 - C.CHUNK / 4, a, sg < 0 ? { px: au } : { nx: au });
        for (let s = 0; s <= 6; s++) { const z = -s * C.CHUNK / 6; b.box(0.5, ah + 0.1, 0.9, wx - sg * 0.5, (ah + 0.1) / 2, z, shade(a, 0.06)); }
        b.box(1.6, 0.35, C.CHUNK, wx + sg * 0.2, ah + 0.17, -C.CHUNK / 2, shade(a, -0.1));
        for (let z = -1.5; z > -C.CHUNK; z -= rnd(2.4, 3.6)) bush(lift(b, ah + 0.2), wx + sg * rnd(0.4, 1.4), z);
        for (let z = -4; z > -C.CHUNK; z -= rnd(7, 11)) tree(lift(b, ah - 0.6), sg * rnd(8, 9.5), z, rnd(1.1, 1.5));
        buildingRow(b, sg, 12);
      } else {
        const wx = sg * 5.6;
        b.box(0.5, 1.0, C.CHUNK, wx, 0.5, -C.CHUNK / 2, city.wall);
        b.box(0.6, 0.1, C.CHUNK, wx, 1.03, -C.CHUNK / 2, city.wallTop);
        pole(b, sg, sg * 4.6, -6); pole(b, sg, sg * 4.6, -26);
        lamp(b, sg, sg * 6.4, -16); lamp(b, sg, sg * 6.4, -36);
        for (let z = -2; z > -C.CHUNK; z -= rnd(5, 9)) { if (chance(0.7)) tree(b, sg * rnd(7, 9), z, rnd(0.85, 1.25)); else prop(b, sg, sg * rnd(7, 8.5), z); }
        buildingRow(b, sg, 11);
      }
      if (kind !== 2 && kind !== 4) for (let i = 0; i < 3; i++) clutter(b, sg * rnd(4.65, 5.05), -rnd(3, 37), false);
      if (kind === 5 || kind === 3 || kind === 1) for (let i = 0; i < 2; i++) clutter(b, sg * rnd(6.8, 8), -rnd(3, 37), true);
      const geo = fin(b);
      const fg = f.size ? fin(f) : null;
      return { geo, fence: fg };
    }
    out.side = { L: [], R: [] };
    for (let k = 0; k < 5; k++) for (let v = 0; v < 2; v++) { out.side.L.push(sideChunk(-1, k)); out.side.R.push(sideChunk(1, k)); }

    {
      const b = GB(), tu = uv(R.tunnel, 0, 0, 1, 1), L = C.CHUNK;
      for (const sg of [-1, 1]) {
        b.box(0.8, 6.2, L, sg * 4.55, 3.1, -L / 2, shade(city.wall, -0.45), sg < 0 ? { px: [tu, '#ffffff'] } : { nx: [tu, '#ffffff'] });
        b.box(1.7, 0.1, L, sg * (3.75 + 0.85), -0.03, -L / 2, shade(city.side, -0.3));
        for (let z = -5; z > -L; z -= 10) b.box(0.5, 6.2, 0.6, sg * 4.05, 3.1, z, shade(city.wall, -0.45));
      }
      const n = 8, r = 4.75, cy = 6.0;
      for (let k = 0; k < n; k++) {
        const a0 = Math.PI * k / n, a1 = Math.PI * (k + 1) / n, am = (a0 + a1) / 2;
        const w = 2 * r * Math.sin(Math.PI / n / 2) + 0.05;
        b.box(w, 0.6, L, Math.cos(am) * (r + 0.3), cy + Math.sin(am) * (r + 0.3), -L / 2, shade(city.wall, -0.5), null, [0, 0, am - Math.PI / 2]);
      }
      out.tunnel = fin(b);
      const lb = GB();
      for (let z = -2; z > -L; z -= 8) { lb.box(0.5, 0.12, 3.2, 0, cy + r - 0.05, z, '#fff6d6'); for (const sg of [-1, 1]) lb.box(0.1, 0.3, 1.4, sg * 4.1, 4.4, z - 4, '#ffd27a'); }
      out.tunnelLamp = fin(lb);
      const p = GB(), pu = uv(R.portal);
      p.box(9, 13, 2.0, -9.2, 6.5, -1, city.wall, { pz: pu });
      p.box(9, 13, 2.0, 9.2, 6.5, -1, city.wall, { pz: pu });
      for (let x = -4.6; x < 4.6; x += 0.46) { const xm = x + 0.23, yb = 6.0 + Math.sqrt(Math.max(0, 5.0 * 5.0 - xm * xm)); p.box(0.47, 13 - yb, 2.0, xm, (13 + yb) / 2, -1, city.wall); }
      for (let k = 0; k < 9; k++) { const a = Math.PI * (k + 0.5) / 9; p.box(1.6, 1.1, 2.2, Math.cos(a) * 5.3, 6.0 + Math.sin(a) * 4.9, -1, shade(city.wallTop, -0.1), null, [0, 0, a - Math.PI / 2]); }
      for (const sg of [-1, 1]) p.box(1.1, 6.2, 2.2, sg * 5.25, 3.1, -1, shade(city.wallTop, -0.1));
      p.box(28, 0.6, 2.4, 0, 13.2, -1, city.wallTop);
      out.portal = fin(p);
    }
    {
      const b = GB();
      for (const sg of [-1, 1]) { b.box(0.35, 7.2, 0.35, sg * 4.5, 3.6, 0, '#6a707c'); b.box(0.7, 0.3, 0.7, sg * 4.5, 0.15, 0, '#4a4e58'); }
      b.box(9.4, 0.4, 0.4, 0, 7.0, 0, '#6a707c');
      b.box(9.4, 0.12, 0.12, 0, 6.6, 0, '#6a707c');
      for (let l = 0; l < 3; l++) { b.box(0.6, 1.0, 0.4, LX(l), 6.3, 0.05, '#2a2a33'); }
      out.gantry = fin(b);
      const lb = GB();
      for (let l = 0; l < 3; l++) { lb.box(0.26, 0.26, 0.05, LX(l), 6.55, 0.27, l === 1 ? '#3aff6a' : '#ff4a3a'); lb.box(0.26, 0.26, 0.05, LX(l), 6.12, 0.27, '#3a3a40'); }
      out.gantryLamp = fin(lb);
    }
    {
      const b = GB();
      for (let l = 0; l < 3; l++) for (const s of [-1, 1]) {
        const x = LX(l) + s * 0.62;
        b.box(0.1, 0.14, 320, x, 0.07, -140, '#7c818b', { py: [null, '#e6e9ef'] }, null, { flat: true });
        b.box(0.18, 0.03, 320, x, 0.015, -140, '#5a5d66', null, null, { flat: true });
      }
      out.rails = fin(b);
    }
    return out;
  }
