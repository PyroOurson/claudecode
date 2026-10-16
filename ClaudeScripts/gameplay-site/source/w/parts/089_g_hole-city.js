
(() => {
  'use strict';
  const ID = 'hole-city';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const COARSE = matchMedia('(pointer: coarse)').matches;

  const CFG = {
    blocks: 7, pitch: 40, road: 9, walk: 3, lane: 1.35,
    classicHoles: 8, battleHoles: 20, roundTime: 120, respawn: 5, shield: 2.5,
    r0: 1, grow: 1.22, levelK: 4, levelExp: 3.4,
    speedBase: 6.5, speedPerR: 1.5,
    eatRatio: 1.12, holeGain: 0.5,
    gravity: 30, step: 1 / 60,
    carSpeed: 7.5, busSpeed: 6.5, walkSpeed: 1.25,
    cars: 40, buses: 7, walkers: 5,
    fov: 40, camTilt: 1.0, camBase: 16, camPerR: 10, menuCam: 75,
    seed: 20180601
  };

  const NAMES = ['Rex', 'Mimi', 'Zed', 'Kiki', 'Bolt', 'Nova', 'Pixel', 'Taco', 'Ziggy', 'Bubbles', 'Ace', 'Luna', 'Duke', 'Chip', 'Mochi', 'Rio', 'Jojo', 'Bean', 'Sparky', 'Noodle', 'Waffle', 'Gizmo', 'Pepper', 'Blaze', 'Coco', 'Yeti', 'Dash', 'Moxie'];
  const HCOL = ['#ff4d6d', '#ff9f1c', '#ffd60a', '#2ec4b6', '#9b5de5', '#f15bb5', '#00bbf9', '#7bd88f', '#ff6b35', '#c77dff', '#06d6a0', '#ef476f', '#4cc9f0', '#a7c957', '#ffb703', '#e85d75', '#43aa8b', '#f9844a', '#577590', '#f94144'];
  const ME = '#3d8bff';
  const MODES = {
    classic: { name: 'Classic', desc: '2 minutes. Swallow the city and be the biggest hole. Bigger holes eat smaller ones!' },
    battle: { name: 'Battle', desc: '20 holes, no respawns. Eat the others and be the last hole standing!' },
    solo: { name: 'Solo', desc: 'Just you and the city. Eat 100% of it as fast as you can in 2 minutes!' }
  };
  const MODE_KEYS = ['classic', 'battle', 'solo'];

  const BCOL = ['#ff8a80', '#ffd166', '#80d8ff', '#b39ddb', '#a5d6a7', '#ffab91', '#f48fb1', '#fff1d6', '#90caf9', '#ffcc80', '#c5e1a5', '#e1bee7', '#ffe082', '#80cbc4'];
  const CCOL = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#f5f5f5', '#3949ab', '#00acc1', '#ec407a', '#6d4c41'];
  const SCOL = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#ff7043', '#26c6da', '#ec407a', '#ffffff', '#8d6e63', '#7e57c2', '#9ccc65'];
  const GLASS = '#a6dcff', GLASS2 = '#7fc4ef', TRIM = '#f6f3ec', DARK = '#3a3f4b';
  const GC = { grass: '#86cf5e', road: '#6b717d', line: '#f4f4f4', walk: '#dcdee3', curb: '#bcc0c8', conc: '#ebe7de', park: '#8fd463', path: '#efdcb2', lot: '#757b87', sand: '#f3e0a6', plaza: '#f1e5d1', plaza2: '#e3d4bb', yard: '#95d66a', pool: '#5cc8f0', sea: '#4fb6ea' };

  function rng(a) {
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function merge(THREE, parts) {
    let n = 0;
    const list = parts.map(([g, c, t]) => { const ng = g.index ? g.toNonIndexed() : g; if (ng !== g) g.dispose(); n += ng.attributes.position.count; return [ng, c, t]; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), tin = new Float32Array(n);
    const tc = new THREE.Color();
    let o = 0;
    for (const [g, c, t] of list) {
      const cnt = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3);
      nor.set(g.attributes.normal.array, o * 3);
      tc.set(c).convertSRGBToLinear();
      for (let i = 0; i < cnt; i++) { const k = (o + i) * 3; col[k] = tc.r; col[k + 1] = tc.g; col[k + 2] = tc.b; tin[o + i] = t; }
      o += cnt;
      g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    out.setAttribute('aTint', new THREE.BufferAttribute(tin, 1));
    out.computeBoundingSphere();
    return out;
  }

  function makeKit(THREE) {
    let parts = [];
    const put = (g, c, t) => { parts.push([g, c, t ? 1 : 0]); };
    const flat = g => { const n = g.index ? g.toNonIndexed() : g; if (n !== g) g.dispose(); n.computeVertexNormals(); return n; };
    const up = c => (c === GLASS ? '#d4f1ff' : '#b3e0fa');
    let wn = 0;
    const K = {
      box(w, h, d, x, y, z, c, t, ry) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, c, t); },
      cyl(rt, rb, h, s, x, y, z, c, t, ax) {
        let g = new THREE.CylinderGeometry(rt, rb, h, s);
        if (ax === 'x') g.rotateZ(Math.PI / 2); else if (ax === 'z') g.rotateX(Math.PI / 2);
        if (s <= 8) g = flat(g);
        g.translate(x, y, z); put(g, c, t);
      },
      frus(bx, bz, k, h, x, y, z, c, t) { let g = new THREE.CylinderGeometry(1.4142 * k, 1.4142, h, 4, 1); g.rotateY(Math.PI / 4); g.scale(bx, 1, bz); g = flat(g); g.translate(x, y, z); put(g, c, t); },
      ico(r, x, y, z, c, sy) { const g = flat(new THREE.IcosahedronGeometry(r, 0)); if (sy) g.scale(1, sy, 1); g.translate(x, y, z); put(g, c, 0); },
      quad(w, h, x, y, z, ry, c, t) { const g = new THREE.PlaneGeometry(w, h); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, c, t); },
      flatq(w, d, x, y, z, c, t, ry) { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); if (ry) g.rotateY(ry); g.translate(x, y, z); put(g, c, t); },
      roof(len, wd, ht, x, y, z, c) {
        const r = wd / 1.732;
        let g = new THREE.CylinderGeometry(r, r, len, 3, 1, false, Math.PI / 2);
        g.rotateZ(Math.PI / 2); g.scale(1, ht / (1.5 * r), 1); g = flat(g);
        g.translate(x, y + ht / 3, z); put(g, c, 0);
      },
      win(w, d, ys, nc, ww, wh, c, skipFront, sill) {
        for (let s = 0; s < 4; s++) {
          if (skipFront && s === 0) continue;
          const span = s < 2 ? w : d, off = (s < 2 ? d : w) / 2;
          for (const y of ys) for (let k = 0; k < nc; k++) {
            const u = (k + 0.5) / nc * span - span / 2, lit = (++wn * 5 + s) % 11 === 0;
            const at = (o, h) => s === 0 ? [u, h, o, 0] : s === 1 ? [-u, h, -o, Math.PI] : s === 2 ? [o, h, -u, Math.PI / 2] : [-o, h, u, -Math.PI / 2];
            let p = at(off + 0.025, y);
            K.quad(ww + 0.16, wh + 0.16, p[0], p[1], p[2], p[3], TRIM);
            p = at(off + 0.045, y - wh / 4);
            K.quad(ww, wh / 2, p[0], p[1], p[2], p[3], lit ? '#ffcf7a' : c);
            p = at(off + 0.045, y + wh / 4);
            K.quad(ww, wh / 2, p[0], p[1], p[2], p[3], lit ? '#ffe6a8' : up(c));
            p = at(off + 0.05, y);
            K.quad(ww, 0.05, p[0], p[1], p[2], p[3], TRIM);
            if (sill) { p = at(off + 0.1, y - wh / 2 - 0.06); K.box(ww + 0.3, 0.07, 0.2, p[0], p[1], p[2], '#e9e4d8', 0, p[3]); }
          }
        }
      },
      wheels(xs, zw, r, wd) {
        for (const x of xs) for (const z of [-zw, zw]) {
          K.cyl(r, r, wd, 10, x, r, z, '#2a2c33', 0, 'z');
          for (const e of [-1, 1]) { const g = new THREE.CircleGeometry(r * 0.55, 6); if (e < 0) g.rotateY(Math.PI); g.translate(x, r, z + e * (wd / 2 + 0.01)); put(g, '#cfd3dc', 0); }
        }
      },
      ac(x, y, z, s) { K.box(0.9 * s, 0.4 * s, 0.7 * s, x, y + 0.2 * s, z, '#cfd3db'); K.cyl(0.25 * s, 0.25 * s, 0.05, 6, x, y + 0.42 * s, z, '#4a505e'); K.box(0.9 * s, 0.1 * s, 0.7 * s, x, y + 0.05 * s, z, '#9aa1b2'); },
      tank(x, y, z) { K.cyl(0.6, 0.6, 1.1, 8, x, y + 1.1, z, '#b9805a'); K.cyl(0.0, 0.66, 0.4, 8, x, y + 1.85, z, '#7d4f38'); for (const a of [-0.35, 0.35]) for (const b of [-0.35, 0.35]) K.box(0.08, 0.6, 0.08, x + a, y + 0.3, z + b, '#6a4a3a'); },
      done() {
        const g = merge(THREE, parts); parts = [];
        const p = g.attributes.position, n = g.attributes.normal, c = g.attributes.color;
        for (let i = 0; i < p.count; i++) {
          if (Math.abs(n.getY(i)) > 0.6) continue;
          const k = 0.74 + 0.26 * clamp(p.getY(i) / 1.3, 0, 1);
          c.setXYZ(i, c.getX(i) * k, c.getY(i) * k, c.getZ(i) * k);
        }
        return g;
      }
    };
    return K;
  }

  function buildTypes(THREE) {
    const K = makeKit(THREE), T = {};
    const def = (name, w, d, h, pts, colors, fr, build) => {
      build(K);
      T[name] = { name, geo: K.done(), w, d, h, pts, colors, bld: h > 4.5 && pts >= 45, fr: fr || (0.42 * Math.max(w, d) + 0.18 * Math.min(w, d) + 0.06 * h), r: Math.hypot(w, d) / 2, count: 0, mesh: null, dirty: false };
    };
    const person = (skin, pants, hair, pack, hairStyle) => k => {
      for (const z of [-0.09, 0.09]) k.box(0.14, 0.7, 0.14, 0, 0.37, z, pants);
      k.box(0.24, 0.5, 0.4, 0, 1.08, 0, '#ffffff', 1);
      for (const z of [-0.25, 0.25]) { k.box(0.11, 0.28, 0.11, 0, 1.2, z, '#ffffff', 1); k.box(0.09, 0.24, 0.09, 0, 0.94, z, skin); }
      k.box(0.26, 0.26, 0.26, 0, 1.55, 0, skin);
      k.box(0.29, 0.1, 0.29, -0.005, 1.7, 0, hair);
      if (hairStyle) k.box(0.07, 0.24, 0.29, -0.11, 1.56, 0, hair);
      for (const z of [-0.06, 0.06]) k.quad(0.04, 0.05, 0.132, 1.58, z, Math.PI / 2, '#25272e');
      if (pack) k.box(0.1, 0.34, 0.26, -0.18, 1.12, 0, pack);
    };
    def('man', 0.45, 0.3, 1.75, 1, SCOL, 0, person('#f3c9a5', '#3b4a6b', '#4a3426', '#e07a3a', 0));
    def('man2', 0.45, 0.3, 1.75, 1, SCOL, 0, person('#b47b57', '#2d2f36', '#1f1a17', null, 1));
    def('cone', 0.42, 0.42, 0.7, 1, null, 0, k => {
      k.box(0.44, 0.05, 0.44, 0, 0.025, 0, '#3a3f4b');
      k.cyl(0.03, 0.17, 0.6, 8, 0, 0.35, 0, '#ff7a1a');
      k.cyl(0.082, 0.098, 0.1, 8, 0, 0.42, 0, '#ffffff');
      k.cyl(0.115, 0.135, 0.09, 6, 0, 0.22, 0, '#ffffff');
    });
    def('hydrant', 0.42, 0.42, 0.75, 1, null, 0, k => {
      k.cyl(0.2, 0.2, 0.06, 8, 0, 0.03, 0, '#c62f3c');
      k.cyl(0.13, 0.15, 0.5, 8, 0, 0.31, 0, '#e63946');
      k.cyl(0.05, 0.16, 0.14, 6, 0, 0.62, 0, '#e63946');
      k.ico(0.07, 0, 0.74, 0, '#ffd23f');
      k.box(0.44, 0.1, 0.1, 0, 0.42, 0, '#c62f3c');
    });
    def('bin', 0.56, 0.56, 0.95, 1, null, 0, k => {
      k.cyl(0.26, 0.21, 0.85, 8, 0, 0.425, 0, '#3f8f5a');
      k.cyl(0.27, 0.27, 0.07, 8, 0, 0.62, 0, '#ffffff');
      k.cyl(0.29, 0.29, 0.08, 8, 0, 0.89, 0, '#2f6e44');
      k.box(0.2, 0.05, 0.02, 0, 0.76, 0.265, '#245238');
    });
    def('mailbox', 0.5, 0.45, 1.05, 1, null, 0, k => {
      k.box(0.12, 0.35, 0.12, 0, 0.17, 0, DARK);
      k.box(0.5, 0.6, 0.45, 0, 0.65, 0, '#2f6fd6');
      k.cyl(0.225, 0.225, 0.5, 8, 0, 0.95, 0, '#2f6fd6', 0, 'x');
      k.box(0.3, 0.04, 0.02, 0, 0.8, 0.23, '#1d3f80');
      k.box(0.04, 0.2, 0.04, 0.27, 0.95, 0.12, '#e63946');
      k.box(0.14, 0.1, 0.02, 0, 0.55, 0.23, '#f4f4f4');
    });
    def('bush', 0.9, 0.9, 0.9, 1, null, 0, k => {
      k.ico(0.46, 0, 0.4, 0, '#4fa83e', 0.85);
      k.ico(0.34, 0.24, 0.55, 0.12, '#5bb547');
      k.ico(0.3, -0.2, 0.5, -0.12, '#6fc957');
      for (const [x, z, c] of [[0.1, 0.18, '#ff8fb1'], [-0.2, 0.05, '#ffe066'], [0.28, -0.12, '#ff8fb1']]) k.flatq(0.1, 0.1, x, 0.78, z, c);
    });
    def('bench', 1.8, 0.5, 0.9, 2, null, 0, k => {
      for (const z of [-0.08, 0.1]) k.box(1.7, 0.05, 0.18, 0, 0.46, z, '#c98a4b');
      k.box(1.7, 0.2, 0.05, 0, 0.72, -0.2, '#d89a58');
      for (const x of [-0.72, 0.72]) { k.box(0.08, 0.45, 0.42, x, 0.22, 0, '#474c58'); k.box(0.07, 0.07, 0.4, x, 0.62, 0, '#474c58'); }
    });
    def('fence', 2.4, 0.12, 1.05, 1, null, 0, k => {
      k.box(2.4, 0.08, 0.05, 0, 0.35, 0, '#ffffff');
      k.box(2.4, 0.08, 0.05, 0, 0.78, 0, '#ffffff');
      for (let i = 0; i < 4; i++) k.box(0.15, 1.05, 0.06, -0.9 + i * 0.6, 0.52, 0.03, '#fbfbfb');
    });
    def('hedge', 2.4, 0.75, 0.95, 2, null, 1.2, k => {
      k.box(2.4, 0.8, 0.75, 0, 0.4, 0, '#4fae46');
      k.box(2.2, 0.15, 0.6, 0, 0.86, 0, '#5fbf52');
    });
    def('lamp', 0.4, 1, 4.6, 2, null, 0.42, k => {
      k.cyl(0.16, 0.2, 0.3, 6, 0, 0.15, 0, '#4d5566');
      k.cyl(0.06, 0.08, 4.4, 6, 0, 2.2, 0, '#4d5566');
      k.box(0.07, 0.07, 0.9, 0, 4.35, 0.42, '#4d5566');
      k.box(0.3, 0.16, 0.52, 0, 4.27, 0.82, '#4d5566');
      k.box(0.34, 0.04, 0.56, 0, 4.36, 0.82, '#3a4252');
      k.box(0.22, 0.04, 0.42, 0, 4.18, 0.82, '#fff3b0');
    });
    def('tlight', 0.4, 1, 4.2, 3, null, 0.55, k => {
      k.cyl(0.07, 0.09, 3.9, 6, 0, 1.95, 0, '#3e4452');
      k.cyl(0.13, 0.13, 0.12, 6, 0, 0.1, 0, '#2f3440');
      k.box(0.08, 0.08, 2.6, 0, 3.8, 1.3, '#3e4452');
      k.box(0.34, 0.95, 0.3, 0, 3.3, 2.4, '#2b2f38');
      k.box(0.46, 1.05, 0.06, 0, 3.3, 2.24, '#e9ebf0');
      k.box(0.36, 0.2, 0.1, 0, 3.62, 2.25, '#ff4d4d');
      k.box(0.36, 0.2, 0.1, 0, 3.32, 2.25, '#ffc93c');
      k.box(0.36, 0.2, 0.1, 0, 3.02, 2.25, '#3ddc84');
      k.box(0.3, 0.5, 0.05, 0.1, 2.9, 0.1, '#3ddc84');
    });
    def('tree', 2.1, 2.1, 3.1, 3, null, 0.62, k => {
      k.cyl(0.12, 0.17, 1.4, 6, 0, 0.7, 0, '#8b5a3c');
      k.ico(1.0, 0, 1.95, 0, '#4fa83a', 0.9);
      k.ico(0.78, 0.5, 2.4, 0.25, '#62bb45', 0.92);
      k.ico(0.58, -0.4, 2.7, -0.2, '#7fd05c');
    });
    def('pine', 2, 2, 3.6, 3, null, 0.72, k => {
      k.cyl(0.12, 0.15, 0.9, 6, 0, 0.45, 0, '#7d5037');
      k.cyl(0.01, 1.0, 1.4, 7, 0, 1.45, 0, '#2f8a45');
      k.cyl(0.01, 0.8, 1.3, 7, 0, 2.2, 0, '#3f9e52');
      k.cyl(0.01, 0.58, 1.2, 7, 0, 2.95, 0, '#4fb560');
    });
    def('booth', 0.95, 0.95, 2.3, 3, null, 0, k => {
      k.box(0.95, 2.2, 0.95, 0, 1.1, 0, '#e63946');
      k.box(1.0, 0.12, 1.0, 0, 2.26, 0, '#b8212f');
      k.box(0.4, 0.2, 0.05, 0, 2.05, 0.48, '#ffffff');
      k.quad(0.62, 1.2, 0, 1.2, 0.48, 0, GLASS);
      k.quad(0.62, 1.2, 0.48, 1.2, 0, Math.PI / 2, GLASS);
      k.quad(0.62, 1.2, -0.48, 1.2, 0, -Math.PI / 2, GLASS);
      k.quad(0.62, 0.05, 0, 1.2, 0.485, 0, TRIM);
      k.box(0.3, 0.1, 0.05, 0, 0.45, 0.48, '#b8212f');
    });
    def('kiosk', 2.1, 1.9, 2.5, 8, BCOL, 0, k => {
      k.box(2.0, 2.1, 1.8, 0, 1.05, 0, '#ffffff', 1);
      k.box(2.3, 0.16, 2.1, 0, 2.18, 0, TRIM);
      k.quad(1.5, 0.8, 0, 1.25, 0.91, 0, GLASS);
      k.quad(1.5, 0.4, 0, 1.45, 0.915, 0, '#d4f1ff');
      k.box(2.1, 0.07, 0.6, 0, 1.82, 1.15, '#ffffff', 1);
      for (let i = 0; i < 5; i++) k.box(0.42, 0.06, 0.62, -0.84 + i * 0.42, 1.83, 1.15, i % 2 ? '#ffffff' : '#ff6f61');
      k.box(1.8, 0.1, 0.4, 0, 0.9, 1.0, TRIM);
      k.box(0.5, 0.22, 0.02, 0, 2.0, 0.92, '#2ec4b6');
      k.cyl(0.18, 0.18, 0.5, 6, 0.6, 2.5, -0.5, '#c9ccd3');
    });
    def('fountain', 4.2, 4.2, 2.0, 15, null, 0, k => {
      k.cyl(2.0, 2.1, 0.6, 12, 0, 0.3, 0, '#d8d2c4');
      k.cyl(2.1, 2.1, 0.1, 12, 0, 0.62, 0, '#eee8d9');
      k.cyl(1.82, 1.82, 0.05, 12, 0, 0.58, 0, '#5ec8f2');
      k.cyl(1.2, 1.2, 0.02, 12, 0, 0.61, 0, '#8ae0ff');
      k.cyl(0.25, 0.35, 1.3, 8, 0, 0.95, 0, '#d8d2c4');
      k.cyl(0.75, 0.3, 0.28, 10, 0, 1.6, 0, '#d8d2c4');
      k.cyl(0.62, 0.62, 0.04, 10, 0, 1.73, 0, '#5ec8f2');
      k.cyl(0.08, 0.16, 0.45, 6, 0, 1.95, 0, '#bfe9fb');
      k.ico(0.2, 0, 2.25, 0, '#e4f7ff');
      for (let a = 0; a < 6; a++) { const t = a / 6 * Math.PI * 2; k.ico(0.1, Math.cos(t) * 1.1, 0.7, Math.sin(t) * 1.1, '#d6f3ff'); }
    });
    def('statue', 1.7, 1.7, 3.6, 12, null, 0, k => {
      k.box(1.7, 1.2, 1.7, 0, 0.6, 0, '#d9d2c2');
      k.box(1.9, 0.15, 1.9, 0, 1.2, 0, '#c9c1ae');
      k.box(1.5, 0.1, 1.5, 0, 0.12, 0, '#c9c1ae');
      k.box(0.36, 0.9, 0.5, 0, 1.75, 0, '#6fa596');
      k.box(0.3, 1.0, 0.6, 0, 2.6, 0, '#6fa596');
      k.ico(0.22, 0, 3.27, 0, '#6fa596');
      k.box(0.12, 0.8, 0.12, 0, 3.0, 0.42, '#6fa596');
      k.box(0.12, 0.6, 0.12, 0, 2.6, -0.4, '#6fa596');
      k.box(0.8, 0.2, 0.04, 0, 0.7, 0.86, '#a39b88');
    });
    const carBody = (k, col, cabin) => {
      k.box(4.1, 0.5, 1.8, 0, 0.46, 0, col, 1);
      k.box(1.1, 0.16, 1.74, 1.45, 0.78, 0, col, 1);
      k.box(0.7, 0.16, 1.74, -1.6, 0.78, 0, col, 1);
      k.frus(1.0, 0.82, cabin ? 0.74 : 0.8, 0.56, -0.2, 1.1, 0, GLASS);
      k.frus(0.9, 0.78, 0.82, 0.07, -0.2, 1.41, 0, col, 1);
      k.box(0.12, 0.2, 1.74, 2.06, 0.3, 0, '#3a3f4b');
      k.box(0.12, 0.2, 1.74, -2.06, 0.3, 0, '#3a3f4b');
      k.quad(0.7, 0.14, 2.115, 0.54, 0, Math.PI / 2, '#2a2c33');
      for (const z of [-0.93, 0.93]) k.box(0.16, 0.1, 0.1, 0.75, 0.96, z, col, 1);
      for (const z of [-0.6, 0.6]) { k.quad(0.34, 0.14, 2.062, 0.64, z, Math.PI / 2, '#fff6c8'); k.quad(0.34, 0.14, -2.062, 0.64, z, -Math.PI / 2, '#ff4d4d'); }
    };
    def('car', 4.2, 1.85, 1.5, 10, CCOL, 0, k => {
      carBody(k, '#ffffff', true);
      k.box(0.7, 0.03, 1.2, -1.58, 0.87, 0, '#2a2c33');
      k.wheels([-1.3, 1.3], 0.82, 0.33, 0.26);
    });
    def('taxi', 4.2, 1.85, 1.75, 10, null, 0, k => {
      carBody(k, '#ffc93c', false);
      k.box(0.7, 0.24, 0.36, -0.25, 1.57, 0, '#ffffff');
      k.box(0.5, 0.1, 0.38, -0.25, 1.57, 0, '#2a2c33');
      for (let i = 0; i < 6; i++) for (const z of [-0.905, 0.905]) k.quad(0.3, 0.07, -1.0 + i * 0.4, 0.62, z, z < 0 ? Math.PI : 0, i % 2 ? '#2a2c33' : '#ffffff');
      k.wheels([-1.3, 1.3], 0.82, 0.33, 0.26);
    });
    def('van', 4.8, 2, 2.3, 14, CCOL, 0, k => {
      k.box(4.7, 1.6, 1.96, 0, 1.1, 0, '#ffffff', 1);
      k.box(4.7, 0.16, 1.96, 0, 1.98, 0, '#ffffff', 1);
      k.box(0.05, 0.62, 1.7, 2.37, 1.5, 0, GLASS);
      k.box(1.1, 0.5, 1.98, 1.55, 1.6, 0, GLASS);
      k.box(1.0, 0.2, 1.98, 1.55, 1.76, 0, '#d4f1ff');
      k.box(4.72, 0.22, 1.98, 0, 0.45, 0, '#2a2c33');
      k.box(0.14, 0.26, 2.0, 2.4, 0.3, 0, '#3a3f4b');
      k.box(0.14, 0.26, 2.0, -2.4, 0.3, 0, '#3a3f4b');
      for (const z of [-0.985, 0.985]) { const ry = z < 0 ? Math.PI : 0; k.quad(0.04, 1.2, -0.4, 1.05, z, ry, '#7a8194'); k.quad(0.04, 1.2, 0.9, 1.05, z, ry, '#7a8194'); k.quad(1.2, 0.05, -1.4, 1.2, z, ry, '#aab0bd'); k.box(0.16, 0.1, 0.08, 1.0, 1.3, z * 1.02, '#2a2c33'); }
      for (const z of [-0.7, 0.7]) { k.box(0.06, 0.16, 0.36, 2.37, 0.7, z, '#fff6c8'); k.box(0.06, 0.16, 0.36, -2.37, 0.7, z, '#ff4d4d'); }
      k.box(0.7, 0.14, 0.9, -1.3, 2.1, 0, '#c9ccd3');
      k.box(0.03, 0.8, 1.7, -2.36, 1.4, 0, '#7fc4ef');
      k.wheels([-1.5, 1.5], 0.9, 0.36, 0.26);
    });
    def('truck', 9, 2.5, 3.4, 30, CCOL, 0, k => {
      k.box(2.2, 2.0, 2.4, 3.3, 1.4, 0, '#ffffff', 1);
      k.box(1.4, 0.2, 2.4, 3.6, 2.5, 0, '#ffffff', 1);
      k.box(0.05, 0.9, 2.1, 4.41, 1.95, 0, GLASS);
      k.box(0.05, 0.4, 2.1, 4.41, 2.5, 0, '#d4f1ff');
      for (const z of [-1.21, 1.21]) { k.box(1.2, 0.9, 0.04, 3.4, 1.95, z, GLASS); k.box(0.1, 0.5, 0.2, 4.0, 2.0, z * 1.05, '#2a2c33'); }
      k.box(6.4, 3.0, 2.5, -1.05, 1.95, 0, '#f4f4f4');
      k.box(6.42, 0.5, 2.52, -1.05, 2.9, 0, '#ffffff', 1);
      for (let i = 0; i < 7; i++) for (const z of [-1.27, 1.27]) k.box(0.08, 2.9, 0.05, -3.9 + i * 0.95, 1.95, z, '#d5d8e0');
      for (const z of [-1.27, 1.27]) k.box(4.4, 0.8, 0.05, -1.0, 2.0, z, '#ffffff', 1);
      k.box(8.9, 0.3, 2.2, -0.05, 0.42, 0, '#2a2c33');
      k.box(0.3, 0.3, 2.5, 4.55, 0.4, 0, '#3a3f4b');
      k.cyl(0.08, 0.08, 1.4, 6, 2.5, 2.3, 1.1, '#9aa1b2');
      k.box(0.06, 0.2, 0.4, 4.43, 0.9, 0.8, '#fff6c8'); k.box(0.06, 0.2, 0.4, 4.43, 0.9, -0.8, '#fff6c8');
      k.wheels([-3.2, -2.1, 3.2], 1.05, 0.45, 0.35);
    });
    def('bus', 11, 2.5, 3.1, 40, ['#e53935', '#fbc02d', '#1e88e5', '#43a047', '#fb8c00'], 0, k => {
      k.box(10.8, 2.45, 2.46, 0, 1.6, 0, '#ffffff', 1);
      k.box(9.6, 0.92, 2.48, -0.3, 2.08, 0, '#2d3340');
      for (let i = 0; i < 9; i++) for (const z of [-1.245, 1.245]) { k.box(0.95, 0.42, 0.03, -4.6 + i * 1.05, 2.22, z, GLASS); k.box(0.95, 0.4, 0.03, -4.6 + i * 1.05, 1.82, z, GLASS2); }
      k.box(0.05, 1.3, 2.2, 5.41, 1.95, 0, GLASS);
      k.box(0.05, 0.3, 2.2, 5.43, 2.55, 0, '#2a2c33');
      k.box(0.06, 0.18, 1.2, 5.44, 2.55, 0, '#ffb703');
      k.box(10.82, 0.2, 2.48, 0, 1.2, 0, '#ffffff');
      k.box(10.3, 0.15, 2.2, 0, 2.9, 0, '#eef0f4');
      k.box(1.6, 0.3, 1.2, -2.5, 3.05, 0, '#c9ccd3'); k.box(1.0, 0.3, 1.2, 1.5, 3.05, 0, '#c9ccd3');
      for (const z of [-1.245, 1.245]) { k.box(1.0, 1.9, 0.04, 3.5, 1.65, z, '#2d3340'); k.box(0.04, 1.8, 0.05, 3.5, 1.65, z, '#ffffff'); k.box(10.8, 0.1, 0.04, 0, 0.75, z, '#2a2c33'); }
      k.box(0.3, 0.3, 2.5, 5.5, 0.55, 0, '#3a3f4b'); k.box(0.3, 0.3, 2.5, -5.5, 0.55, 0, '#3a3f4b');
      for (const z of [-0.9, 0.9]) { k.box(0.06, 0.2, 0.4, 5.43, 0.9, z, '#fff6c8'); k.box(0.06, 0.2, 0.4, -5.43, 0.9, z, '#ff4d4d'); }
      k.wheels([-3.6, 3.4], 1.1, 0.48, 0.3);
    });
    def('house', 4.6, 4.6, 4.6, 45, BCOL, 0, k => {
      k.box(4.4, 2.8, 4.4, 0, 1.4, 0, '#ffffff', 1);
      k.box(4.55, 0.2, 4.55, 0, 0.1, 0, '#c9ccd3');
      k.roof(5.0, 5.0, 1.8, 0, 2.8, 0, '#e2574c');
      k.roof(5.0, 5.0, 0.3, 0, 2.78, 0, '#b8453d');
      k.box(0.55, 1.1, 0.55, 1.2, 3.8, -0.8, '#b0574a');
      k.box(0.7, 0.1, 0.7, 1.2, 4.38, -0.8, '#8c4338');
      k.quad(0.9, 1.6, 0.9, 0.8, 2.22, 0, '#8b5a3c');
      k.quad(0.9, 0.08, 0.9, 1.62, 2.225, 0, TRIM);
      k.ico(0.05, 1.2, 0.8, 2.26, '#ffd23f');
      k.box(1.3, 0.1, 0.8, 0.9, 1.7, 2.5, '#d8d2c4');
      k.box(0.08, 0.9, 0.08, 0.35, 1.2, 2.8, '#ffffff'); k.box(0.08, 0.9, 0.08, 1.45, 1.2, 2.8, '#ffffff');
      k.box(1.6, 0.14, 0.9, 0.9, 0.08, 2.65, '#c9ccd3');
      k.quad(1.1, 0.9, -1.0, 1.65, 2.22, 0, GLASS);
      k.win(4.4, 4.4, [1.65], 2, 0.9, 0.9, GLASS, true, true);
    });
    def('house2', 4.8, 4.8, 6.6, 70, BCOL, 0, k => {
      k.box(4.6, 4.8, 4.6, 0, 2.4, 0, '#ffffff', 1);
      k.box(4.75, 0.2, 4.75, 0, 0.1, 0, '#c9ccd3');
      k.roof(5.2, 5.2, 1.8, 0, 4.8, 0, '#56627d');
      k.roof(5.2, 5.2, 0.3, 0, 4.78, 0, '#434d66');
      k.box(4.7, 0.14, 4.7, 0, 2.4, 0, TRIM);
      k.box(0.5, 1.0, 0.5, -1.3, 5.9, -0.6, '#9c6a5a');
      k.quad(0.9, 1.7, 0, 0.85, 2.32, 0, '#8b5a3c');
      k.box(1.5, 0.1, 0.7, 0, 1.75, 2.6, '#d8d2c4');
      k.box(0.1, 1.0, 0.1, -0.7, 1.2, 2.8, '#ffffff'); k.box(0.1, 1.0, 0.1, 0.7, 1.2, 2.8, '#ffffff');
      k.box(1.3, 0.1, 0.4, 0, 3.75, 2.45, '#d8d2c4');
      k.box(1.3, 0.35, 0.04, 0, 3.95, 2.62, '#c9ccd3');
      k.win(4.6, 4.6, [1.4, 3.6], 2, 0.9, 0.95, GLASS, true, true);
      for (const [x, y] of [[-1.3, 3.6], [1.3, 3.6], [-1.3, 1.4], [1.3, 1.4]]) { k.quad(1.06, 1.11, x, y, 2.325, 0, TRIM); k.quad(0.9, 0.48, x, y - 0.24, 2.33, 0, GLASS); k.quad(0.9, 0.48, x, y + 0.24, 2.33, 0, '#d4f1ff'); k.box(1.2, 0.07, 0.2, x, y - 0.56, 2.4, '#e9e4d8'); }
    });
    def('shop', 6, 6, 4.8, 80, BCOL, 0, k => {
      k.box(6, 4.2, 6, 0, 2.1, 0, '#ffffff', 1);
      k.box(6.1, 0.3, 6.1, 0, 4.35, 0, TRIM);
      k.box(6.2, 0.14, 6.2, 0, 4.55, 0, '#c9ccd3');
      k.quad(4.4, 2.0, -0.4, 1.3, 3.02, 0, GLASS);
      k.quad(4.4, 0.9, -0.4, 1.85, 3.025, 0, '#d4f1ff');
      for (const x of [-1.5, -0.4, 0.7]) k.quad(0.06, 2.0, x, 1.3, 3.03, 0, TRIM);
      k.quad(0.9, 2.0, 2.4, 1.0, 3.02, 0, '#7a4c33');
      k.quad(0.7, 0.9, 2.4, 1.5, 3.03, 0, GLASS);
      for (let i = 0; i < 6; i++) k.box(1.0, 0.1, 1.2, -2.5 + i, 2.65, 3.55, i % 2 ? '#ffffff' : '#ff6f61');
      for (let i = 0; i < 6; i++) k.box(1.0, 0.3, 0.05, -2.5 + i, 2.48, 4.13, i % 2 ? '#ffffff' : '#ff6f61');
      k.box(4.0, 0.7, 0.12, 0, 3.5, 3.07, '#ffffff');
      k.box(3.0, 0.3, 0.13, 0, 3.5, 3.08, '#ff6f61');
      for (let i = 0; i < 5; i++) k.box(0.4, 0.14, 0.14, -1.1 + i * 0.55, 3.5, 3.1, '#ffffff');
      k.box(1.2, 0.6, 1.0, -1.2, 4.8, -1, '#c9ccd3');
      k.ac(1.6, 4.62, 1.2, 1); k.tank(-2, 4.62, 1.8);
      k.win(6, 6, [2.4], 2, 1.1, 1.2, GLASS, true);
    });
    def('apt', 7, 7, 10.6, 200, BCOL, 0, k => {
      k.box(7, 10, 7, 0, 5, 0, '#ffffff', 1);
      k.box(7.2, 0.35, 7.2, 0, 10.1, 0, TRIM);
      k.box(7.3, 0.6, 7.3, 0, 0.3, 0, '#c9ccd3');
      for (const [x, z] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) k.box(0.3, 10, 0.3, x, 5, z, TRIM);
      k.win(7, 7, [1.9, 5.1, 8.3], 3, 1.3, 1.45, GLASS);
      for (const y of [4.25, 7.45]) for (const x of [-2.33, 0, 2.33]) { k.box(1.7, 0.12, 0.6, x, y, 3.8, TRIM); k.box(1.7, 0.4, 0.04, x, y + 0.24, 4.09, '#c9ccd3'); }
      k.cyl(0.8, 0.8, 1.3, 8, 1.6, 10.9, -1.4, '#c58b5a');
      k.cyl(0.0, 0.9, 0.5, 8, 1.6, 11.8, -1.4, '#8a5a3a');
      k.box(1.4, 0.7, 1.1, -1.8, 10.6, 1.2, '#c9ccd3');
      k.ac(-1.5, 10.28, -1.8, 0.9); k.ac(2.2, 10.28, 1.6, 0.8);
      k.box(1.2, 2.3, 0.04, 0, 1.15, 3.52, '#7fc4ef');
      k.box(1.5, 0.15, 0.7, 0, 2.45, 3.8, '#e2574c');
    });
    def('store', 12, 7, 7.6, 260, BCOL, 0, k => {
      k.box(12, 6.6, 7, 0, 3.3, 0, '#ffffff', 1);
      k.box(12.2, 0.4, 7.2, 0, 6.7, 0, TRIM);
      k.box(12.3, 0.2, 7.3, 0, 7.05, 0, '#c9ccd3');
      k.quad(11, 2.5, 0, 1.5, 3.52, 0, GLASS);
      k.quad(11, 1.1, 0, 2.15, 3.525, 0, '#d4f1ff');
      for (let i = -4; i <= 4; i++) k.quad(0.08, 2.5, i * 1.25, 1.5, 3.53, 0, TRIM);
      k.box(12.1, 0.3, 1.2, 0, 3.0, 3.9, TRIM);
      for (let i = 0; i < 12; i++) k.box(1.0, 0.12, 1.2, -5.5 + i, 3.03, 3.92, i % 2 ? '#ffffff' : '#2ec4b6');
      k.box(6, 1.3, 0.2, 0, 7.4, 3.2, '#ffffff');
      k.box(5, 0.5, 0.22, 0, 7.4, 3.21, '#2ec4b6');
      for (let i = 0; i < 6; i++) k.box(0.5, 0.28, 0.24, -1.9 + i * 0.76, 7.4, 3.22, '#ffffff');
      k.win(12, 7, [4.7], 5, 1.5, 1.2, GLASS, false, true);
      k.box(1.6, 0.8, 1.4, -3, 7.5, -1.5, '#c9ccd3'); k.box(1.6, 0.8, 1.4, 2.5, 7.5, -1.2, '#c9ccd3');
      k.ac(-3, 7.9, -1.5, 0.8); k.ac(2.5, 7.9, -1.2, 0.8); k.tank(4.6, 7.2, 1);
    });
    def('office', 9, 9, 18.6, 480, BCOL, 0, k => {
      k.box(9, 18, 9, 0, 9, 0, '#ffffff', 1);
      k.box(9.25, 0.5, 9.25, 0, 18.15, 0, TRIM);
      k.box(9.1, 0.3, 9.1, 0, 3.4, 0, TRIM);
      k.box(9.3, 0.7, 9.3, 0, 0.35, 0, '#c9ccd3');
      for (const [x, z] of [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]]) k.box(0.4, 18, 0.4, x, 9, z, TRIM);
      k.win(9, 9, [5.3, 8.6, 11.9, 15.2], 3, 2.3, 2.0, GLASS2);
      k.quad(6, 2.4, 0, 1.4, 4.53, 0, GLASS2);
      k.quad(6, 1.0, 0, 2.0, 4.535, 0, '#d4f1ff');
      k.box(0.1, 2.4, 0.06, 0, 1.4, 4.55, TRIM);
      k.box(2.5, 1.2, 2.5, 1.5, 18.9, -1.5, '#c9ccd3');
      k.ac(-2.5, 18.4, 2.2, 1.1); k.ac(2.8, 18.4, 2.8, 1); k.tank(-2.5, 18.4, -2.5);
      k.cyl(0.05, 0.05, 2.4, 6, 3.4, 19.6, 3.4, '#9aa1b2');
      k.box(9.4, 0.5, 0.6, 0, 3.0, 4.7, '#ff6f61');
    });
    def('tower', 10, 10, 34, 900, BCOL, 0, k => {
      k.box(10, 30, 10, 0, 15, 0, '#ffffff', 1);
      k.box(10.3, 1.4, 10.3, 0, 0.7, 0, '#c9ccd3');
      k.win(10, 10, [5, 7.7, 10.4, 13.1, 15.8, 18.5, 21.2, 23.9, 26.6], 3, 2.2, 1.9, GLASS2);
      for (const [x, z] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) k.box(0.5, 30, 0.5, x, 15, z, TRIM);
      for (const y of [2.4, 12, 21.5, 29.6]) k.box(10.3, 0.3, 10.3, 0, y, 0, TRIM);
      k.box(10.2, 0.4, 10.2, 0, 2.2, 0, TRIM);
      k.box(8, 2.6, 8, 0, 31.3, 0, TRIM);
      for (let i = 0; i < 4; i++) k.quad(1.6, 1.4, -2.7 + i * 1.8, 31.3, 4.03, 0, GLASS2);
      k.box(4.5, 1.4, 4.5, 0, 33.3, 0, '#d5d8e0');
      k.cyl(0.12, 0.12, 3.4, 6, 1.2, 35.7, 1.2, '#9aa1b2');
      k.ac(-2.8, 32.6, 2.8, 1); k.ac(2.8, 32.6, -2.8, 1);
      k.cyl(0.04, 0.04, 2, 6, -1.4, 35, -1.4, '#9aa1b2');
      k.ico(0.12, 1.2, 37.5, 1.2, '#ff5d5d');
    });
    def('sky', 12, 12, 50, 1600, BCOL, 0, k => {
      k.box(12, 30, 12, 0, 15, 0, '#ffffff', 1);
      k.box(9, 16, 9, 0, 38, 0, '#ffffff', 1);
      k.box(12.3, 0.5, 12.3, 0, 30.1, 0, TRIM);
      k.box(12.4, 1.2, 12.4, 0, 0.6, 0, '#c9ccd3');
      k.box(9.3, 0.4, 9.3, 0, 38, 0, TRIM);
      k.box(6, 4, 6, 0, 48, 0, '#e8e8f0');
      k.box(6.3, 0.4, 6.3, 0, 46, 0, TRIM);
      k.cyl(0.18, 0.18, 6, 6, 0, 53, 0, '#9aa1b2');
      k.cyl(0.3, 0.3, 0.3, 6, 0, 56, 0, '#ff5d5d');
      k.cyl(0.0, 0.5, 1.2, 6, 0, 54.6, 0, '#c9ccd3');
      const ys = []; for (let i = 0; i < 9; i++) ys.push(2.6 + i * 3.1);
      k.win(12, 12, ys, 3, 3.2, 1.9, GLASS2);
      k.win(9, 9, [32, 35.2, 38.4, 41.6, 44.8], 3, 2.4, 1.9, GLASS2);
      for (const [x, z] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) k.box(0.5, 30, 0.5, x, 15, z, TRIM);
      for (const [x, z] of [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]]) k.box(0.4, 16, 0.4, x, 38, z, TRIM);
      k.ac(-3, 30.4, 3, 1.2); k.ac(3, 30.4, -3, 1.2); k.ac(-2.4, 46.4, 2, 1);
      k.box(2.4, 0.2, 2.4, 3.6, 30.4, 3.6, '#ffd23f');
    });
    return T;
  }

  const kitCss = g => `${g} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;font-family:var(--sans);box-shadow:0 22px 44px -30px rgba(31,29,43,.6);-webkit-user-select:none;user-select:none}
${g} .stage .g-canvas{border-radius:0}
${g} .lbs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
${g} .lb{position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:center;white-space:nowrap;font-weight:900;font-size:clamp(11px,2.3cqw,17px);line-height:1;text-shadow:0 1px 0 #fff,0 -1px 0 #fff,1px 0 0 #fff,-1px 0 0 #fff,0 2px 4px rgba(0,0,0,.35);will-change:transform}
${g} .lb svg{width:1.6em;height:1.1em;margin-bottom:.1em;display:none;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
${g} .lb.king svg{display:block}
${g} .lb.hide{display:none}
${g} .hud{position:absolute;inset:0;pointer-events:none;font-size:clamp(11px,2.2cqw,19px);color:#1f1d2b}
${g} .hud.off{display:none}
${g} .top{position:absolute;left:50%;top:2.2%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.45em}
${g} .pill{display:inline-flex;align-items:center;gap:.45em;padding:.4em .95em .4em .6em;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 .3em .9em -.3em rgba(31,29,43,.5);font-weight:900;font-size:1.25em;line-height:1;font-variant-numeric:tabular-nums}
${g} .pill.hot{color:#ef3b4f;animation:gm-hc-pulse .5s ease-in-out infinite alternate}
@keyframes gm-hc-pulse{to{transform:scale(1.1)}}
${g} .clock{width:1em;height:1em;border-radius:50%;border:.16em solid currentColor;position:relative;box-sizing:border-box}
${g} .clock:after{content:'';position:absolute;left:42%;top:12%;width:.13em;height:.38em;background:currentColor;border-radius:1px;transform-origin:50% 100%;transform:rotate(40deg)}
${g} .holei{width:1em;height:1em;border-radius:50%;background:#14151c;box-shadow:0 0 0 .14em #3d8bff}
${g} .pct{display:flex;align-items:center;gap:.5em;padding:.35em .6em;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 .3em .9em -.3em rgba(31,29,43,.5);font-weight:900}
${g} .pct div{width:9em;height:.75em;border-radius:9px;background:#e4e7ee;overflow:hidden}
${g} .pct u{display:block;height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,#3d8bff,#6fc3ff)}
${g} .board{position:absolute;right:2%;top:2.2%;min-width:9.5em;padding:.45em .55em;border-radius:.8em;background:rgba(255,255,255,.88);box-shadow:0 .3em .9em -.35em rgba(31,29,43,.5);font-weight:900;font-size:.9em}
${g} .board .r{display:flex;align-items:center;gap:.45em;padding:.14em .2em;border-radius:.4em;line-height:1.1}
${g} .board .r.me{background:rgba(61,139,255,.14)}
${g} .board .r.dead{opacity:.4}
${g} .board b{width:1.2em;text-align:right;color:#8a8a9a}
${g} .board span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:6.5em}
${g} .board em{font-style:normal;color:#55556a;font-variant-numeric:tabular-nums}
${g} .board .h{font-size:.8em;letter-spacing:.08em;text-transform:uppercase;color:#8a8a9a;padding:0 .2em .2em}
${g} .msg{position:absolute;left:0;right:0;top:40%;text-align:center;font-weight:900;font-size:1.7em;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.25),0 0 14px rgba(0,0,0,.35);opacity:0;transition:opacity .25s}
${g} .msg.on{opacity:1}
${g} .msg small{display:block;font-size:.6em;margin-top:.3em}
${g} .joy{position:absolute;left:0;top:0;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.55);pointer-events:none;display:none}
${g} .joy.on{display:block}
${g} .joy i{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 3px 8px rgba(0,0,0,.25)}
${g} .menu,${g} .end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.2%;text-align:center;font-size:clamp(12px,2.2cqw,20px)}
${g} .menu{background:linear-gradient(180deg,rgba(20,30,60,.38),rgba(20,30,60,0) 40%,rgba(20,30,60,0) 60%,rgba(20,30,60,.45))}
${g} .menu.off,${g} .end.off{display:none}
${g} .logo{font-weight:900;font-size:4.2em;line-height:1;color:#fff;letter-spacing:-.02em;text-shadow:0 .06em 0 #1d2a55,0 .12em .25em rgba(0,0,0,.35);display:flex;align-items:center;gap:.04em}
${g} .logo i{display:inline-block;width:.68em;height:.68em;border-radius:50%;background:radial-gradient(circle at 50% 60%,#000 0 55%,#1d1f2a 75%);box-shadow:0 0 0 .07em #3d8bff,0 .06em 0 .07em #1d2a55;margin:0 .02em;transform:translateY(.08em)}
${g} .logo .sp{width:.3em}
${g} .tabs{display:flex;gap:.4em;padding:.35em;border-radius:999px;background:rgba(255,255,255,.9);box-shadow:0 .4em 1em -.4em rgba(0,0,0,.4)}
${g} .tabs button{font:900 1.05em/1 var(--sans);padding:.75em 1.2em;min-height:44px;border:0;border-radius:999px;background:transparent;color:#4a4a5e;cursor:pointer}
${g} .tabs button.on{background:#3d8bff;color:#fff;box-shadow:0 .25em .6em -.2em rgba(61,139,255,.8)}
${g} .desc{max-width:22em;margin:0 1em;padding:.5em 1em;border-radius:1em;background:rgba(20,26,50,.55);font-weight:800;color:#fff;line-height:1.35}
${g} .play,${g} .end button{font:900 1.5em/1 var(--sans);padding:.65em 2.2em;min-height:48px;border:0;border-radius:999px;background:linear-gradient(#4fd16b,#2fae4e);color:#fff;cursor:pointer;box-shadow:0 .25em 0 #1f8a3a,0 .5em 1em -.3em rgba(0,0,0,.4);text-shadow:0 1px 0 rgba(0,0,0,.2)}
${g} .play:active,${g} .end button:active{transform:translateY(.15em);box-shadow:0 .1em 0 #1f8a3a}
${g} .best{margin:0;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}
${g} .hint{margin:0;font-weight:800;font-size:.85em;color:rgba(255,255,255,.85);text-shadow:0 1px 3px rgba(0,0,0,.5)}
${g} .end{background:rgba(18,22,40,.55);font-size:clamp(11px,1.75cqw,17px)}
${g} .card{width:min(90%,26em);max-height:94%;overflow:hidden;box-sizing:border-box;padding:.9em 1.2em 1em;border-radius:1.2em;background:#fff;box-shadow:0 1em 2.4em -.8em rgba(0,0,0,.6);color:#1f1d2b}
${g} .card .k{margin:0;font-weight:900;font-size:.85em;letter-spacing:.12em;text-transform:uppercase;color:#8a8a9a}
${g} .card .k.nb{color:#f5a300}
${g} .card h2{margin:.05em 0 0;font-size:3em;line-height:1;font-weight:900;color:#3d8bff}
${g} .card .s{margin:.1em 0 .45em;font-weight:900;font-size:1.25em}
${g} .card .list{display:flex;flex-direction:column;gap:.15em;margin:0 0 .6em;font-weight:900;font-size:.95em;text-align:left}
${g} .card .list .r{display:flex;gap:.5em;padding:.12em .5em;border-radius:.45em;background:#f3f4f7}
${g} .card .list .r.me{background:#e1edff}
${g} .card .list b{width:1.5em;color:#8a8a9a}
${g} .card .list span{flex:1}
${g} .card .list em{font-style:normal;color:#55556a}
${g} .card .st{display:flex;justify-content:center;gap:.5em;margin:0 0 .7em;flex-wrap:wrap}
${g} .card .st div{padding:.35em .7em;border-radius:.6em;background:#f3f4f7;font-weight:800;font-size:.85em;color:#55556a}
${g} .card .st b{display:block;font-size:1.3em;color:#1f1d2b}
${g} .btns{display:flex;gap:.6em;justify-content:center;flex-wrap:wrap;align-items:center}
${g} .end button{font-size:1.3em;padding:.6em 1.6em}
${g} .end button.alt{background:#eef0f5;color:#3a3a4e;box-shadow:0 .25em 0 #cfd3de;text-shadow:none;font-size:1.1em}
`;

  const CROWN = '<svg viewBox="0 0 24 16"><path d="M2 14L1 3l6 5 5-7 5 7 6-5-1 11z" fill="#ffc83d" stroke="#c98a00" stroke-width="1.3" stroke-linejoin="round"/></svg>';

  Ameplay.register({
    id: ID,
    title: 'Hole City',
    category: '3D',
    tint: '#3d8bff',
    better: 'high',
    width: 960,
    format: v => v.toLocaleString('en-US'),
    blurb: 'Be the hole! Swallow the city and grow bigger than every rival.',
    help: 'Mouse to steer · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows · drag anywhere on touch',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="44" rx="22" ry="9"/><ellipse cx="32" cy="44" rx="15" ry="5.5" fill="currentColor"/><rect x="24" y="12" width="12" height="24" rx="1"/><path d="M28 18h4M28 24h4M28 30h4M42 26l6-6 6 6v10H42z"/></svg>',
    css: kitCss('.gm-' + ID),
    async mount(root, api) {
      const keys = api.keys;
      const portrait = root.clientWidth && root.clientWidth < 560;
      const v = await api.gl(...(portrait ? [600, 880] : [960, 600]), { stencil: true });
      if (!v) return;
      const { THREE, renderer, w, h } = v;
      renderer.toneMapping = THREE.NoToneMapping;
      if (COARSE) {
        const fit = () => { const cw = v.canvas.clientWidth; if (cw && !document.fullscreenElement) renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / w); };
        api.timeout(fit, 30); api.on(window, 'resize', fit);
      }

      const stage = document.createElement('div');
      stage.className = 'stage';
      stage.style.width = v.canvas.style.width;
      stage.style.aspectRatio = v.canvas.style.aspectRatio;
      v.canvas.style.width = '100%';
      root.append(stage);
      stage.append(v.canvas);
      stage.insertAdjacentHTML('beforeend', `<div class="lbs"></div>
<div class="hud off"><div class="top"><div class="pill tm"><i class="clock"></i><b>2:00</b></div><div class="pct"><div><u></u></div><b>0%</b></div></div><div class="board"></div><div class="msg"></div></div>
<div class="joy"><i></i></div>
<div class="menu"><div class="logo"><span>H</span><i></i><span>le.io</span></div><div class="tabs">${MODE_KEYS.map(m => `<button data-m="${m}">${MODES[m].name}</button>`).join('')}</div><p class="desc"></p><button class="play">Play</button><p class="best"></p><p class="hint">${COARSE ? 'Drag anywhere to move' : 'Move the mouse or use WASD / arrows'}</p></div>
<div class="end off"><div class="card"><p class="k"></p><h2></h2><p class="s"></p><div class="list"></div><div class="st"></div><div class="btns"><button class="again">Play again</button><button class="alt tomenu">Menu</button></div></div></div>`);
      const $ = s => stage.querySelector(s);
      const elLbs = $('.lbs'), elHud = $('.hud'), elTm = $('.tm'), elTmI = $('.tm i'), elTmB = $('.tm b'), elPct = $('.pct'), elPctU = $('.pct u'), elPctB = $('.pct b');
      const elBoard = $('.board'), elMsg = $('.msg'), elJoy = $('.joy'), elJoyK = $('.joy i'), elMenu = $('.menu'), elEnd = $('.end');

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#8fd3f5');
      const cam = new THREE.PerspectiveCamera(CFG.fov, w / h, 0.5, 1600);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xa9b9cc, 0.78));
      const sun = new THREE.DirectionalLight(0xffffff, 0.72);
      sun.castShadow = true;
      sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 500;
      scene.add(sun, sun.target);
      const SUN_DIR = new THREE.Vector3(-0.42, 1, 0.3).normalize();

      const seeU = { value: new THREE.Vector4() }, camU = { value: new THREE.Vector3() };
      const patch = see => sh => {
        sh.uniforms.uSee = seeU; sh.uniforms.uCamP = camU;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nattribute float aTint;\nvarying vec3 vWP;')
          .replace('#include <color_vertex>', '#include <color_vertex>\n#ifdef USE_INSTANCING_COLOR\nvColor.xyz = color.xyz * mix(vec3(1.0), instanceColor.xyz, aTint);\n#endif')
          .replace('#include <project_vertex>', '#include <project_vertex>\n{ vec4 hw = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nhw = instanceMatrix * hw;\n#endif\nvWP = (modelMatrix * hw).xyz; }');
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform vec4 uSee;\nuniform vec3 uCamP;\nvarying vec3 vWP;')
          .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb *= clamp(1.0 + vWP.y * 0.42, 0.0, 1.0);');
        if (see) sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() {\nif (uSee.w > 0.0 && vWP.y > 0.8 && vWP.y < uCamP.y && length(vWP.xz - uSee.xz) > uSee.y) {\n  vec2 g = uCamP.xz + (vWP.xz - uCamP.xz) * (uCamP.y / (uCamP.y - vWP.y));\n  if (length(g - uSee.xz) < uSee.w && mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y), 2.0) < 1.0) discard;\n}');
      };
      const propMat = new THREE.MeshLambertMaterial({ vertexColors: true }), propMatC = propMat.clone(), propMatB = propMat.clone();
      propMat.onBeforeCompile = propMatC.onBeforeCompile = patch(false);
      propMatB.onBeforeCompile = patch(true);
      propMatB.customProgramCacheKey = () => 'see';
      const groundMat = new THREE.MeshLambertMaterial({ vertexColors: true, stencilWrite: true, stencilWriteMask: 0, stencilFunc: THREE.NotEqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xff });
      const maskMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
      const pitMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
      const seaMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(GC.sea).convertSRGBToLinear(), stencilWrite: true, stencilWriteMask: 0, stencilFunc: THREE.NotEqualStencilFunc, stencilRef: 1, stencilFuncMask: 0xff });
      const disposables = [propMat, propMatC, propMatB, groundMat, maskMat, pitMat, seaMat];

      const N = CFG.blocks, P = CFG.pitch, RW = CFG.road, SW = CFG.walk, BS = P - RW, HALF = N * P / 2, LANE = CFG.lane;
      const roadAt = i => i * P - HALF;
      const LIMIT = HALF + 18, EDGE = HALF + 36;
      const TYPES = buildTypes(THREE);
      for (const k in TYPES) disposables.push(TYPES[k].geo);
      const OBJ = [], MOVERS = [];
      const CELL = 10, EXT = 190, GN = Math.ceil(EXT * 2 / CELL), MAXR = 8.6;
      const grid = Array.from({ length: GN * GN }, () => []);
      const cellOf = x => clamp(Math.floor((x + EXT) / CELL), 0, GN - 1);

      const gPos = [], gCol = [];
      const tcol = new THREE.Color();
      const rect = (x0, z0, x1, z1, y, hex) => {
        tcol.set(hex).convertSRGBToLinear();
        gPos.push(x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0);
        for (let i = 0; i < 6; i++) gCol.push(tcol.r, tcol.g, tcol.b);
      };
      const disc = (cx, cz, r, y, hex, seg) => {
        tcol.set(hex).convertSRGBToLinear();
        for (let i = 0; i < seg; i++) {
          const a0 = i / seg * TAU, a1 = (i + 1) / seg * TAU;
          gPos.push(cx, y, cz, cx + Math.cos(a1) * r, y, cz + Math.sin(a1) * r, cx + Math.cos(a0) * r, y, cz + Math.sin(a0) * r);
          for (let k = 0; k < 3; k++) gCol.push(tcol.r, tcol.g, tcol.b);
        }
      };

      function genCity() {
        const rnd = rng(CFG.seed);
        const rr = (a, b) => a + rnd() * (b - a);
        const drnd = rng(CFG.seed + 99);
        const pick = a => a[(rnd() * a.length) | 0];
        const place = (tn, x, z, yaw, mv) => {
          const T = TYPES[tn];
          const o = { t: T, i: T.count++, x, z, x0: x, z0: z, yaw: yaw || 0, yaw0: yaw || 0, ty: yaw || 0, y: 0, st: 0, ta: 0, tv: 0, ux: 0, uz: 1, rx: 0, rz: 0, vin: 0, vy: 0, h: null, mv: mv || null, mv0: mv ? Object.assign({}, mv) : null, act: false, wt: 0, col: T.colors ? pick(T.colors) : null };
          OBJ.push(o);
          if (mv) MOVERS.push(o); else grid[cellOf(z) * GN + cellOf(x)].push(o);
          return o;
        };
        const O = HALF + RW / 2;
        const MHC = ['#4b505b', '#5a6070'];
        rect(-EDGE, -EDGE, EDGE, EDGE, 0, GC.grass);
        for (const s of [-1, 1]) {
          rect(-EDGE - 9, s > 0 ? EDGE : -EDGE - 9, EDGE + 9, s > 0 ? EDGE + 9 : -EDGE, 0, GC.sand);
          rect(s > 0 ? EDGE : -EDGE - 9, -EDGE, s > 0 ? EDGE + 9 : -EDGE, EDGE, 0, GC.sand);
        }
        rect(-O - SW, -O - SW, O + SW, -O, 0.04, GC.walk); rect(-O - SW, O, O + SW, O + SW, 0.04, GC.walk);
        rect(-O - SW, -O, -O, O, 0.04, GC.walk); rect(O, -O, O + SW, O, 0.04, GC.walk);
        for (let i = 0; i <= N; i++) {
          const c = roadAt(i);
          rect(c - RW / 2, -O, c + RW / 2, O, 0.02, GC.road);
          rect(-O, c - RW / 2, O, c + RW / 2, 0.02, GC.road);
          for (let k = 0; k < N; k++) {
            const a = roadAt(k) + RW / 2 + 4, b = roadAt(k + 1) - RW / 2 - 4;
            for (let s = a; s + 2.4 <= b; s += 5) { rect(c - 0.13, s, c + 0.13, s + 2.4, 0.05, GC.line); rect(s, c - 0.13, s + 2.4, c + 0.13, 0.05, GC.line); }
            for (const e of [-1, 1]) {
              rect(c + e * (RW / 2 - 0.45) - 0.06, a, c + e * (RW / 2 - 0.45) + 0.06, b, 0.05, '#aab0bd');
              rect(a, c + e * (RW / 2 - 0.45) - 0.06, b, c + e * (RW / 2 - 0.45) + 0.06, 0.05, '#aab0bd');
            }
          }
        }
        for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
          const cx = roadAt(i), cz = roadAt(j), a = RW / 2 + 0.6, b = RW / 2 + 3.2;
          for (let q = -3.6; q <= 3.61; q += 1.2) {
            if (j > 0) rect(cx + q - 0.35, cz - b, cx + q + 0.35, cz - a, 0.05, GC.line);
            if (j < N) rect(cx + q - 0.35, cz + a, cx + q + 0.35, cz + b, 0.05, GC.line);
            if (i > 0) rect(cx - b, cz + q - 0.35, cx - a, cz + q + 0.35, 0.05, GC.line);
            if (i < N) rect(cx + a, cz + q - 0.35, cx + b, cz + q + 0.35, 0.05, GC.line);
          }
        }

        for (let k = 0; k < 40; k++) {
          const ri = (drnd() * (N + 1)) | 0, along = (drnd() - 0.5) * 2 * (HALF - 8), off = (drnd() < 0.5 ? -1 : 1) * LANE, ax = drnd() < 0.5;
          if (Math.abs(((along + HALF) % P) - P / 2) > 12) continue;
          const px = ax ? along : roadAt(ri) + off, pz = ax ? roadAt(ri) + off : along;
          disc(px, pz, 0.5, 0.055, MHC[0], 8); disc(px, pz, 0.34, 0.058, MHC[1], 8);
        }
        for (const s of [-1, 1]) for (let t = -O + 4; t <= O - 4; t += 7) {
          const d = O + SW + 4 + rnd() * 2, d2 = O + SW + 11 + rnd() * 6;
          const tn = rnd() < 0.5 ? 'pine' : 'tree';
          place(tn, t, s * d, rr(0, TAU)); place(tn, s * d, t, rr(0, TAU));
          if (rnd() < 0.6) { place(pick(['tree', 'pine', 'bush']), t + 3, s * d2, rr(0, TAU)); place(pick(['tree', 'pine', 'bush']), s * d2, t + 3, rr(0, TAU)); }
          if (rnd() < 0.3) { place('bench', t + 2, s * (O + SW - 0.7), s > 0 ? Math.PI : 0); }
          if (rnd() < 0.5) { place('lamp', t + 3.5, s * (O + 0.6), s > 0 ? Math.PI : 0); place('lamp', s * (O + 0.6), t + 3.5, s > 0 ? -Math.PI / 2 : Math.PI / 2); }
        }
        for (const s of [-1, 1]) for (let t = -O; t <= O; t += 2.5) { place('fence', t, s * (EDGE - 2), 0); place('fence', s * (EDGE - 2), t, Math.PI / 2); }

        for (let bj = 0; bj < N; bj++) for (let bi = 0; bi < N; bi++) {
          const x0 = roadAt(bi) + RW / 2, z0 = roadAt(bj) + RW / 2, x1 = x0 + BS, z1 = z0 + BS;
          const ring = Math.max(Math.abs(bi - 3), Math.abs(bj - 3)), q = rnd();
          let type = ring === 0 ? 'park' : ring === 1 ? 'down' : ring === 2 ? 'comm' : 'res';
          if (ring === 1 && q < 0.25) type = 'plaza';
          if (ring === 2) type = q < 0.12 ? 'park' : q < 0.24 ? 'parking' : type;
          if (ring === 3) type = q < 0.1 ? 'park' : q < 0.17 ? 'parking' : q < 0.32 ? 'comm' : type;
          rect(x0, z0, x1, z1, 0.04, GC.curb);
          rect(x0 + 0.25, z0 + 0.25, x1 - 0.25, z1 - 0.25, 0.06, GC.walk);
          for (let t = 2.5; t < BS - 1; t += 2.5) {
            rect(x0 + t - 0.03, z0 + 0.25, x0 + t + 0.03, z0 + SW, 0.065, '#c6c9d1'); rect(x0 + t - 0.03, z1 - SW, x0 + t + 0.03, z1 - 0.25, 0.065, '#c6c9d1');
            rect(x0 + 0.25, z0 + t - 0.03, x0 + SW, z0 + t + 0.03, 0.065, '#c6c9d1'); rect(x1 - SW, z0 + t - 0.03, x1 - 0.25, z0 + t + 0.03, 0.065, '#c6c9d1');
          }
          const ix0 = x0 + SW, iz0 = z0 + SW, ix1 = x1 - SW, iz1 = z1 - SW, IS = ix1 - ix0, cx = (ix0 + ix1) / 2, cz = (iz0 + iz1) / 2;
          rect(ix0, iz0, ix1, iz1, 0.08, { park: GC.park, res: GC.yard, parking: GC.lot, plaza: GC.plaza }[type] || GC.conc);
          const sides = [
            (t, n) => [x0 + t, z0 + n, Math.PI],
            (t, n) => [x0 + t, z1 - n, 0],
            (t, n) => [x0 + n, z0 + t, -Math.PI / 2],
            (t, n) => [x1 - n, z0 + t, Math.PI / 2]
          ];
          for (const S of sides) {
            for (const t of [5, 15.5, 26]) { const p = S(t, 0.6); place('lamp', p[0], p[1], p[2]); }
            for (const t of [10.2, 20.8]) { const p = S(t + rr(-0.5, 0.5), 0.8); place(type === 'down' && rnd() < 0.4 ? 'bush' : 'tree', p[0], p[1], rr(0, TAU)); }
            if (rnd() < 0.55) { const p = S(rr(7, 8.5), 2.65); place('bench', p[0], p[1], p[2]); }
            if (rnd() < 0.5) { const p = S(6.3, 0.55); place('bin', p[0], p[1], 0); }
            if (rnd() < 0.35) { const p = S(rr(12, 14), 0.5); place('hydrant', p[0], p[1], rr(0, TAU)); }
            if (rnd() < 0.25) { const p = S(rr(22.5, 24), 0.6); place('mailbox', p[0], p[1], p[2]); }
            if (type !== 'res' && rnd() < 0.5) { const p = S(rr(12, 19), 2.65); place('bush', p[0], p[1], rr(0, TAU)); }
            if (rnd() < 0.14) { const t = rr(16, 21); for (let k = 0; k < 3; k++) { const p = S(t + k * 0.9, 1.0 + (k % 2) * 0.6); place('cone', p[0], p[1], rr(0, TAU)); } }
            if (type !== 'res' && rnd() < 0.18) { const p = S(rr(17, 19), 2.4); place(rnd() < 0.5 ? 'booth' : 'kiosk', p[0], p[1], p[2]); }
          }
          place('tlight', x0 + 0.7, z0 + 0.7, Math.PI);
          place('tlight', x1 - 0.7, z1 - 0.7, 0);
          for (let k = 0; k < CFG.walkers; k++) {
            const rect0 = [x0 + 2, z0 + 2, x1 - 2, z1 - 2];
            place(rnd() < 0.5 ? 'man' : 'man2', 0, 0, 0, { kind: 'walk', r: rect0, s: rnd() * 108, dir: rnd() < 0.5 ? 1 : -1, spd: CFG.walkSpeed * rr(0.8, 1.2), ph: rnd() * TAU });
          }
          if (type === 'down') {
            for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
              const ccx = ix0 + 6.25 + a * 12.5, ccz = iz0 + 6.25 + b * 12.5, kind = pick(['sky', 'sky', 'tower', 'tower', 'office', 'office', 'apt']);
              place(kind, ccx, ccz, b === 0 ? Math.PI : 0);
              if (kind === 'office' || kind === 'apt') {
                const e = kind === 'office' ? 5.4 : 4.4;
                place('bush', ccx - e, ccz - e, 0); place('bush', ccx + e, ccz + e, 0);
                if (kind === 'apt') { place('tree', ccx + e, ccz - e, 0); place('bench', ccx - e, ccz + e - 0.4, b === 0 ? Math.PI : 0); }
              }
            }
          } else if (type === 'comm') {
            for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
              const ccx = ix0 + 6.25 + a * 12.5, ccz = iz0 + 6.25 + b * 12.5, yaw = b === 0 ? Math.PI : 0, kind = pick(['apt', 'shops', 'store', 'office', 'shops', 'apt']);
              const fz = b === 0 ? -1 : 1;
              if (kind === 'shops') { place('shop', ccx - 3.1, ccz + fz * 1.5, yaw); place('shop', ccx + 3.1, ccz + fz * 1.5, yaw); place('bush', ccx - 4.5, ccz - fz * 4.6, 0); place('bin', ccx + 4.8, ccz - fz * 4.8, 0); place('bush', ccx, ccz - fz * 4.6, 0); }
              else if (kind === 'store') { place('store', ccx, ccz + fz * 2.2, yaw); place('bench', ccx - 3, ccz - fz * 3.4, yaw); place('bush', ccx + 3, ccz - fz * 3.8, 0); place('tree', ccx + 5, ccz - fz * 4, 0); place('tree', ccx - 5.2, ccz - fz * 4.2, 0); }
              else if (kind === 'apt') { place('apt', ccx, ccz + fz * 1.2, yaw); place('tree', ccx - 4.9, ccz - fz * 4.3, 0); place('tree', ccx + 4.9, ccz - fz * 4.3, 0); place('bush', ccx - 5, ccz + fz * 3, 0); place('bush', ccx + 5, ccz + fz * 3, 0); }
              else { place('office', ccx, ccz, yaw); place('bush', ccx - 5.5, ccz - 5.5, 0); place('bush', ccx + 5.5, ccz + 5.5, 0); }
            }
          } else if (type === 'res') {
            const cs = IS / 3;
            for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
              const ccx = ix0 + cs * (a + 0.5), ccz = iz0 + cs * (b + 0.5);
              if (a === 1 && b === 1) {
                rect(ccx - 2.6, ccz - 1.8, ccx + 2.6, ccz + 1.8, 0.1, '#ffffff'); rect(ccx - 2.3, ccz - 1.5, ccx + 2.3, ccz + 1.5, 0.12, GC.pool);
                place('tree', ccx - 3.2, ccz + 2.8, 0); place('bush', ccx + 3.3, ccz - 2.9, 0); place('bush', ccx + 3.3, ccz + 3, 0);
                continue;
              }
              let yaw = 0, fx = 0, fz = 0;
              if (b === 0) { yaw = Math.PI; fz = -1; } else if (b === 2) { yaw = 0; fz = 1; } else if (a === 0) { yaw = -Math.PI / 2; fx = -1; } else { yaw = Math.PI / 2; fx = 1; }
              place(rnd() < 0.7 ? 'house' : 'house2', ccx + fx * 0.6, ccz + fz * 0.6, yaw);
              const bx = ccx - fx * 3.2 + (fz ? rr(-2.5, 2.5) : 0), bz = ccz - fz * 3.2 + (fx ? rr(-2.5, 2.5) : 0);
              place(rnd() < 0.6 ? 'tree' : 'pine', bx, bz, rr(0, TAU));
              if (rnd() < 0.7) place('bush', ccx + fx * 3.3 + (fz ? 2.6 : 0), ccz + fz * 3.3 + (fx ? 2.6 : 0), 0);
              if (rnd() < 0.25) place('mailbox', ccx + fx * 3.6 - (fz ? 1.4 : 0), ccz + fz * 3.6 - (fx ? 1.4 : 0), yaw);
            }
            for (let k = 0; k < 4; k++) for (let t = 1.3; t < IS - 1; t += 2.5) {
              const cell = Math.floor(t / cs), mid = (cell + 0.5) * cs;
              if (Math.abs(t - mid) < 1.4) continue;
              if (k === 0) place('fence', ix0 + t, iz0 + 0.2, 0);
              else if (k === 1) place('fence', ix0 + t, iz1 - 0.2, 0);
              else if (k === 2) place('fence', ix0 + 0.2, iz0 + t, Math.PI / 2);
              else place('fence', ix1 - 0.2, iz0 + t, Math.PI / 2);
            }
          } else if (type === 'park') {
            const pi = 3.5, pw = 1.1;
            for (let a = 1; a < 8; a += 2) rect(ix0, iz0 + a * IS / 8, ix1, iz0 + (a + 1) * IS / 8, 0.085, '#98dd6c');
            rect(ix0 + pi - pw, iz0 + pi - pw, ix1 - pi + pw, iz0 + pi + pw, 0.1, GC.path);
            rect(ix0 + pi - pw, iz1 - pi - pw, ix1 - pi + pw, iz1 - pi + pw, 0.1, GC.path);
            rect(ix0 + pi - pw, iz0 + pi - pw, ix0 + pi + pw, iz1 - pi + pw, 0.1, GC.path);
            rect(ix1 - pi - pw, iz0 + pi - pw, ix1 - pi + pw, iz1 - pi + pw, 0.1, GC.path);
            rect(cx - 1.2, iz0 - 0.1, cx + 1.2, iz1 + 0.1, 0.1, GC.path);
            rect(ix0 - 0.1, cz - 1.2, ix1 + 0.1, cz + 1.2, 0.1, GC.path);
            disc(cx, cz, 4.6, 0.12, GC.path, 20);
            for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; disc(cx + Math.cos(a) * 5.4, cz + Math.sin(a) * 5.4, 0.28, 0.125, ['#ff8fb1', '#ffe066', '#ffffff', '#c77dff'][(drnd() * 4) | 0], 6); }
            place(ring === 0 || rnd() < 0.6 ? 'fountain' : 'statue', cx, cz, 0);
            const pts = [];
            for (let tries = 0; tries < 400 && pts.length < 18; tries++) {
              const x = rr(ix0 + 1.2, ix1 - 1.2), z = rr(iz0 + 1.2, iz1 - 1.2);
              const onPath = Math.abs(x - cx) < 2.4 || Math.abs(z - cz) < 2.4 || Math.hypot(x - cx, z - cz) < 6 || (Math.abs(x - ix0 - pi) < 2.2 || Math.abs(x - ix1 + pi) < 2.2 || Math.abs(z - iz0 - pi) < 2.2 || Math.abs(z - iz1 + pi) < 2.2);
              if (onPath || pts.some(p => Math.hypot(p[0] - x, p[1] - z) < 2.8)) continue;
              pts.push([x, z]);
              place(rnd() < 0.62 ? 'tree' : rnd() < 0.6 ? 'pine' : 'bush', x, z, rr(0, TAU));
            }
            for (const [bx, bz, yaw] of [[cx - 6, iz0 + pi + 1.9, 0], [cx + 6, iz0 + pi + 1.9, 0], [cx - 6, iz1 - pi - 1.9, Math.PI], [cx + 6, iz1 - pi - 1.9, Math.PI], [ix0 + pi + 1.9, cz - 6, Math.PI / 2], [ix1 - pi - 1.9, cz + 6, -Math.PI / 2]]) place('bench', bx, bz, yaw);
            for (const [lx, lz] of [[ix0 + pi, iz0 + pi], [ix1 - pi, iz0 + pi], [ix0 + pi, iz1 - pi], [ix1 - pi, iz1 - pi]]) place('lamp', lx, lz, rr(0, TAU));
            for (let k = 0; k < 6; k++) place(rnd() < 0.5 ? 'man' : 'man2', 0, 0, 0, { kind: 'walk', r: [ix0 + pi, iz0 + pi, ix1 - pi, iz1 - pi], s: rnd() * 72, dir: rnd() < 0.5 ? 1 : -1, spd: CFG.walkSpeed * rr(0.7, 1.1), ph: rnd() * TAU });
            for (let k = 0; k < 3; k++) { const a = rnd() * TAU; place(rnd() < 0.5 ? 'man' : 'man2', cx + Math.cos(a) * 3.2, cz + Math.sin(a) * 3.2, -a); }
          } else if (type === 'plaza') {
            for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) if ((a + b) % 2) rect(ix0 + a * 2.5, iz0 + b * 2.5, ix0 + a * 2.5 + 2.5, iz0 + b * 2.5 + 2.5, 0.1, GC.plaza2);
            disc(cx, cz, 4.4, 0.12, '#d9c7a7', 20);
            place(rnd() < 0.5 ? 'statue' : 'fountain', cx, cz, 0);
            for (const [kx, kz] of [[-7.5, -7.5], [7.5, 7.5]]) place('kiosk', cx + kx, cz + kz, kz < 0 ? Math.PI : 0);
            for (const [kx, kz] of [[-7.5, 7.5], [7.5, -7.5]]) place('tree', cx + kx, cz + kz, 0);
            for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + 0.39; place('bench', cx + Math.cos(a) * 6.2, cz + Math.sin(a) * 6.2, Math.PI / 2 - a + Math.PI); }
            for (const [kx, kz] of [[-10.5, 0], [10.5, 0], [0, -10.5], [0, 10.5]]) place('bush', cx + kx, cz + kz, 0);
            for (let k = 0; k < 7; k++) { const a = rnd() * TAU, d = rr(5, 10.5); place(rnd() < 0.5 ? 'man' : 'man2', cx + Math.cos(a) * d, cz + Math.sin(a) * d, rnd() * TAU); }
            for (let k = 0; k < 5; k++) place(rnd() < 0.5 ? 'man' : 'man2', 0, 0, 0, { kind: 'walk', r: [ix0 + 1.5, iz0 + 1.5, ix1 - 1.5, iz1 - 1.5], s: rnd() * 88, dir: rnd() < 0.5 ? 1 : -1, spd: CFG.walkSpeed * rr(0.7, 1.1), ph: rnd() * TAU });
          } else if (type === 'parking') {
            for (const zc of [iz0 + 3.0, iz0 + 7.8, iz0 + 17.2, iz0 + 22.0]) {
              for (let k = 0; k <= 9; k++) { const xl = ix0 + 0.25 + k * 2.7; rect(xl - 0.07, zc - 2.3, xl + 0.07, zc + 2.3, 0.1, GC.line); }
              for (let k = 0; k < 9; k++) if (rnd() < 0.72) place(pick(['car', 'car', 'car', 'taxi', 'van']), ix0 + 1.6 + k * 2.7, zc, (zc < cz ? 1 : -1) * Math.PI / 2 + rr(-0.05, 0.05));
            }
            place('booth', ix1 - 1, cz, 0);
            place('lamp', ix0 + 0.4, cz, Math.PI / 2); place('lamp', ix1 - 0.4, cz - 3, -Math.PI / 2);
            for (let k = 0; k < 3; k++) place('cone', ix0 + 9 + k * 3, cz, 0);
          }
        }

        for (let i = 0; i <= N; i++) for (let k = 0; k < N; k++) for (const sd of [-1, 1]) {
          const c = roadAt(i), a = roadAt(k) + RW / 2 + 4.5, b = roadAt(k + 1) - RW / 2 - 4.5;
          for (let s = a + 2.2; s < b - 2; s += rr(5.2, 9)) {
            if (rnd() < 0.45) continue;
            const tn = pick(['car', 'car', 'car', 'taxi', 'van', 'car']);
            place(tn, s, c + sd * 3.45, sd > 0 ? 0 : Math.PI);
            if (rnd() < 0.55) place(pick(['car', 'car', 'taxi', 'van']), c + sd * 3.45, s + 1, sd > 0 ? -Math.PI / 2 : Math.PI / 2);
          }
        }

        const lanes = [];
        for (let k = 0; k < CFG.cars + CFG.buses; k++) {
          const bus = k >= CFG.cars;
          for (let tries = 0; tries < 30; tries++) {
            const axis = rnd() < 0.5 ? 0 : 1, dir = rnd() < 0.5 ? 1 : -1, ri = (rnd() * (N + 1)) | 0;
            const lane = roadAt(ri) + LANE * (axis === 0 ? dir : -dir);
            const seg = (rnd() * N) | 0, p = roadAt(seg) + P / 2 + rr(-8, 8);
            if (lanes.some(L => L[0] === axis && Math.abs(L[1] - lane) < 0.1 && Math.abs(L[2] - p) < 16)) continue;
            lanes.push([axis, lane, p]);
            const ci = dir > 0 ? seg + 1 : seg;
            place(bus ? 'bus' : pick(['car', 'car', 'car', 'taxi', 'van', 'truck', 'car']), 0, 0, 0, { kind: 'car', axis, dir, lane, p, ci, plan: 0, tp: 0, spd: bus ? CFG.busSpeed : CFG.carSpeed, v: 0 });
            break;
          }
        }
      }
      genCity();

      const groundGeo = new THREE.BufferGeometry();
      groundGeo.setAttribute('position', new THREE.Float32BufferAttribute(gPos, 3));
      const gNor = new Float32Array(gPos.length); for (let i = 1; i < gNor.length; i += 3) gNor[i] = 1;
      groundGeo.setAttribute('normal', new THREE.BufferAttribute(gNor, 3));
      groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(gCol, 3));
      gPos.length = 0; gCol.length = 0;
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.receiveShadow = true;
      scene.add(ground);
      const seaGeo = new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2).translate(0, -0.4, 0);
      scene.add(new THREE.Mesh(seaGeo, seaMat));
      disposables.push(groundGeo, seaGeo);

      let TOTAL = 0;
      const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _qy = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _ax = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _zero = new THREE.Matrix4().makeScale(0, 0, 0);
      for (const k in TYPES) {
        const T = TYPES[k];
        if (!T.count) continue;
        const m = new THREE.InstancedMesh(T.geo, T.bld ? propMatB : T.colors ? propMatC : propMat, T.count);
        m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true;
        m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        T.mesh = m; scene.add(m);
      }
      function writeObj(o) {
        const T = o.t;
        if (o.st === 3) T.mesh.setMatrixAt(o.i, _zero);
        else {
          _qy.setFromAxisAngle(_up, o.yaw);
          if (o.ta) { _ax.set(-o.uz, 0, o.ux); _q.setFromAxisAngle(_ax, o.ta).multiply(_qy); } else _q.copy(_qy);
          _p.set(o.x, o.y, o.z);
          _m.compose(_p, _q, _s);
          T.mesh.setMatrixAt(o.i, _m);
        }
        T.dirty = true;
      }
      for (const o of OBJ) {
        TOTAL += o.t.pts;
        if (o.col) { tcol.set(o.col).convertSRGBToLinear(); o.t.mesh.setColorAt(o.i, tcol); }
      }

      const yawOf = (axis, dir) => axis === 0 ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      function planCar(m, rnd) {
        const c = roadAt(m.ci);
        const ro = m.lane - LANE * (m.axis === 0 ? m.dir : -m.dir), ri = Math.round((ro + HALF) / P);
        const opts = [];
        if (m.dir > 0 ? m.ci < N : m.ci > 0) opts.push(0, 0);
        const R = [[1, 1], [0, -1], [1, -1], [0, 1]], L = [[1, -1], [0, 1], [1, 1], [0, -1]];
        const rd = m.axis === 0 ? (m.dir > 0 ? R[0] : R[2]) : (m.dir > 0 ? R[1] : R[3]);
        const ld = m.axis === 0 ? (m.dir > 0 ? L[0] : L[2]) : (m.dir > 0 ? L[1] : L[3]);
        if (rd[1] > 0 ? ri < N : ri > 0) opts.push(1);
        if (ld[1] > 0 ? ri < N : ri > 0) opts.push(2);
        m.plan = opts[(rnd() * opts.length) | 0];
        m.nd = m.plan === 1 ? rd : m.plan === 2 ? ld : null;
        m.tp = m.plan === 1 ? c - m.dir * LANE : m.plan === 2 ? c + m.dir * LANE : c + m.dir * (RW / 2 + 0.5);
        m.c = c; m.ri = ri;
      }
      const mrnd = rng(CFG.seed + 7);
      function resetCity() {
        for (const o of OBJ) {
          o.x = o.x0; o.z = o.z0; o.yaw = o.ty = o.yaw0; o.y = 0; o.st = 0; o.ta = 0; o.tv = 0; o.act = false; o.wt = 0; o.h = null;
          if (o.mv) { Object.assign(o.mv, o.mv0); if (o.mv.kind === 'car') planCar(o.mv, mrnd); placeMover(o, 0); o.yaw = o.ty; }
          writeObj(o);
        }
        active.length = 0;
        for (const k in TYPES) { const T = TYPES[k]; if (T.mesh) { T.mesh.instanceMatrix.needsUpdate = true; if (T.mesh.instanceColor) T.mesh.instanceColor.needsUpdate = true; } T.dirty = false; }
      }
      function placeMover(o, dt) {
        const m = o.mv;
        if (m.kind === 'car') {
          if (m.axis === 0) { o.x = m.p; o.z = m.lane; } else { o.x = m.lane; o.z = m.p; }
          o.ty = yawOf(m.axis, m.dir);
        } else {
          const r = m.r, W = r[2] - r[0], H = r[3] - r[1], L = 2 * (W + H);
          let s = ((m.s % L) + L) % L, hx, hz;
          if (s < W) { o.x = r[0] + s; o.z = r[1]; hx = 1; hz = 0; }
          else if (s < W + H) { o.x = r[2]; o.z = r[1] + s - W; hx = 0; hz = 1; }
          else if (s < 2 * W + H) { o.x = r[2] - (s - W - H); o.z = r[3]; hx = -1; hz = 0; }
          else { o.x = r[0]; o.z = r[3] - (s - 2 * W - H); hx = 0; hz = -1; }
          o.ty = Math.atan2(-hz * m.dir, hx * m.dir);
          if (o.st === 0) o.y = Math.abs(Math.sin(m.ph)) * 0.09;
        }
        if (dt) { let d = o.ty - o.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); o.yaw += d * Math.min(1, dt * 9); }
      }
      function moveMovers(dt) {
        for (const o of MOVERS) {
          if (o.st >= 2) continue;
          const m = o.mv;
          if (m.kind === 'walk') { m.s += m.dir * m.spd * dt; m.ph += dt * 7.5 * m.spd; placeMover(o, dt); continue; }
          let gap = 1e9;
          for (const q of MOVERS) {
            if (q === o || q.st >= 2 || q.mv.kind !== 'car' || q.mv.axis !== m.axis || q.mv.dir !== m.dir || Math.abs(q.mv.lane - m.lane) > 0.3) continue;
            const g = (q.mv.p - m.p) * m.dir;
            if (g > 0 && g < gap) gap = g;
          }
          const want = gap < 7 ? 0 : gap < 16 ? m.spd * (gap - 7) / 9 : m.spd;
          m.v += clamp(want - m.v, -14 * dt, 5 * dt);
          m.p += m.dir * m.v * dt;
          if ((m.p - m.tp) * m.dir >= 0) {
            if (m.plan === 0) { m.ci += m.dir; }
            else {
              const na = m.nd[0], nd = m.nd[1], ol = m.lane;
              m.axis = na; m.dir = nd; m.lane = m.tp; m.p = ol; m.ci = m.ri + nd;
            }
            planCar(m, mrnd);
          }
          placeMover(o, dt);
        }
      }

      const RL = [], TL = [0];
      for (let L = 0; L < 60; L++) { RL[L] = CFG.r0 * Math.pow(CFG.grow, L); TL[L + 1] = TL[L] + CFG.levelK * Math.pow(RL[L], CFG.levelExp); }
      const maskGeo = new THREE.CircleGeometry(1, 56).rotateX(-Math.PI / 2).translate(0, 0.005, 0);
      const pitGeo = (() => {
        const wall = new THREE.CylinderGeometry(1, 1, 6, 56, 12, true).translate(0, -3, 0);
        const bot = new THREE.CircleGeometry(1, 56).rotateX(Math.PI / 2).translate(0, -6, 0);
        const g = merge(THREE, [[wall, '#0a0b10', 0], [bot, '#000000', 0]]);
        const pos = g.attributes.position, col = g.attributes.color;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i), t = clamp(-y / 3.4, 0, 1), k = Math.pow(1 - t, 1.9) * (1 + (Math.round(-y * 2) % 2 === 0 ? 0.3 : 0));
          col.setXYZ(i, 0.05 * k, 0.07 * k, 0.15 * k);
        }
        return g;
      })();
      const ringGeo = new THREE.RingGeometry(0, 1.36, 64, 1).rotateX(-Math.PI / 2);
      disposables.push(maskGeo, pitGeo, ringGeo);
      const ringVS = 'varying vec2 vP;void main(){vP=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
      const ringFS = 'uniform vec3 uC;uniform float uP;uniform float uA;uniform float uF;varying vec2 vP;void main(){float d=length(vP);if(d<1.0){float g=smoothstep(0.4,1.0,d);gl_FragColor=vec4(uC*(0.5+0.5*g)+uF*0.3,(g*g*0.5+uF*0.12)*uA);return;}if(d>1.15){float s=1.0-smoothstep(1.15,1.34,d);gl_FragColor=vec4(0.02,0.04,0.12,s*s*0.3*uA);return;}float a=atan(vP.x,-vP.y);if(a<0.0)a+=6.2831853;float on=step(a,uP*6.2831853);vec3 c=mix(vec3(1.0),uC,on);c=mix(c,vec3(1.0),uF);float e=abs(d-1.075)/0.075;c*=1.0-0.38*smoothstep(0.55,1.0,e);float hl=clamp(dot(normalize(vP),vec2(-0.55,-0.83)),0.0,1.0);c=c*(0.9+0.14*hl)+0.12*hl*(1.0-smoothstep(0.0,0.6,e));gl_FragColor=vec4(c,mix(0.82,1.0,on)*uA);}';
      const HOLES = [];
      for (let k = 0; k < CFG.battleHoles; k++) {
        const g = new THREE.Group();
        const mask = new THREE.Mesh(maskGeo, maskMat); mask.renderOrder = -1; mask.frustumCulled = false;
        const pit = new THREE.Mesh(pitGeo, pitMat); pit.frustumCulled = false;
        const rm = new THREE.ShaderMaterial({ vertexShader: ringVS, fragmentShader: ringFS, uniforms: { uC: { value: new THREE.Color() }, uP: { value: 0 }, uA: { value: 1 }, uF: { value: 0 } }, transparent: true, depthWrite: false });
        const ring = new THREE.Mesh(ringGeo, rm); ring.renderOrder = 3; ring.frustumCulled = false;
        g.add(mask, pit, ring); g.visible = false; scene.add(g);
        disposables.push(rm);
        const el = document.createElement('div');
        el.className = 'lb hide'; el.innerHTML = CROWN + '<span></span>';
        elLbs.append(el);
        HOLES.push({ k, g, ring, rm, el, sp: el.lastChild, on: false, bot: true, name: '', color: '#fff', x: 0, z: 0, vx: 0, vz: 0, ang: 0, R: 1, mass: 0, level: 0, alive: false, prot: 0, dieT: 0, by: null, resp: 0, think: 0, tx: 0, tz: 0, skill: 0.5, spdK: 0.95, aggr: 0.5, eaten: 0, kills: 0, pulse: 0, flash: 0, Rd: 1, peak: 0, ix: 0, iz: 0, mag: 0, rank: 0 });
      }
      let holes = [];
      const speedOf = R => CFG.speedBase + CFG.speedPerR * R;
      const canEat = (a, b) => RL[a.level] > RL[b.level] * CFG.eatRatio;

      function setupHole(H, name, color, bot, x, z) {
        H.on = true; H.bot = bot; H.name = name; H.color = color; H.x = x; H.z = z; H.vx = H.vz = 0; H.ang = Math.random() * TAU;
        H.mass = 0; H.level = 0; H.R = RL[0]; H.alive = true; H.prot = mode === 'battle' ? 0 : 1.2; H.dieT = 0; H.by = null; H.resp = 0; H.think = Math.random() * 0.5;
        H.tx = x; H.tz = z; H.eaten = 0; H.kills = 0; H.pulse = 0; H.flash = 0; H.peak = 0; H.mag = 0; H.dead = false;
        H.skill = 0.35 + Math.random() * 0.6; H.spdK = 0.9 + H.skill * 0.08; H.aggr = Math.random();
        H.rm.uniforms.uC.value.set(color); H.rm.uniforms.uP.value = 0;
        H.g.visible = true; H.el.style.color = color; H.sp.textContent = name; H.el.classList.remove('hide');
      }
      function spawnPoint(minD) {
        let best = null, bd = -1;
        for (let t = 0; t < 40; t++) {
          const x = roadAt((Math.random() * (N + 1)) | 0) + (Math.random() - 0.5) * 2, z = (Math.random() - 0.5) * 2 * HALF;
          const sw = Math.random() < 0.5;
          const px = sw ? z : x, pz = sw ? x : z;
          let d = 1e9;
          for (const o of holes) if (o.on && o.alive) d = Math.min(d, Math.hypot(o.x - px, o.z - pz) - o.R * 2);
          if (d > bd) { bd = d; best = [px, pz]; }
          if (d > minD) break;
        }
        return best;
      }
      function addMass(H, v) {
        H.mass += v; H.peak = Math.max(H.peak, H.mass);
        let up = false;
        while (H.mass >= TL[H.level + 1]) { H.level++; up = true; }
        if (up) { H.flash = 1; if (H === player && phase === 'play') sfx('level'); }
      }

      let mode = 'classic', phase = 'menu', sel = 0, player = null, roundT = 0, elapsed = 0, attractT = 0, endT = 0, endInfo = null;
      let eatenPts = 0, eatenObjs = 0, scoreShown = -1, boardT = 0, msgT = 0, auto = false, timeScale = 1;
      const active = [];
      const save = api.load() || {};
      save.best = save.best || {};
      if (typeof save.mode === 'number') sel = clamp(save.mode, 0, 2);

      let ac = null, master = null, lastPop = 0;
      function audio() {
        if (api.muted) return null;
        if (!ac) {
          try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination); } catch (e) { ac = null; return null; }
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function tone(f0, f1, dur, type, vol, delay) {
        const a = audio(); if (!a) return;
        const t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
        o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
      }
      function sfx(n, pts) {
        if (api.muted) return;
        const now = performance.now();
        if (n === 'pop') {
          if (now - lastPop < 45) return; lastPop = now;
          if (pts >= 200) { tone(140, 40, 0.6, 'sine', 0.35); tone(320, 90, 0.35, 'triangle', 0.12); }
          else if (pts >= 30) { tone(220, 70, 0.32, 'sine', 0.3); tone(500, 200, 0.12, 'triangle', 0.08); }
          else if (pts >= 8) tone(380 + Math.random() * 80, 120, 0.16, 'sine', 0.22);
          else tone(700 + Math.random() * 500, 260, 0.08, 'sine', 0.13);
        } else if (n === 'level') { [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, 0.14, 'triangle', 0.13, i * 0.06)); }
        else if (n === 'gulp') { tone(160, 520, 0.22, 'square', 0.08); [784, 988, 1175].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.12, 0.15 + i * 0.07)); }
        else if (n === 'eaten') { tone(420, 60, 0.7, 'sawtooth', 0.1); tone(300, 50, 0.7, 'sine', 0.2); }
        else if (n === 'tick') tone(1200, 1200, 0.05, 'square', 0.05);
        else if (n === 'win') { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.15, i * 0.11)); }
        else if (n === 'lose') { [523, 440, 349, 262].forEach((f, i) => tone(f, f * 0.98, 0.25, 'triangle', 0.13, i * 0.14)); }
        else if (n === 'tap') tone(660, 880, 0.06, 'triangle', 0.1);
      }

      function touch(o) { if (!o.act) { o.act = true; active.push(o); } }
      function interact(H, o) {
        const dx = o.x - H.x, dz = o.z - H.z, lim = H.R + o.t.r;
        const d2 = dx * dx + dz * dz;
        if (d2 > lim * lim) return;
        const d = Math.sqrt(d2) || 1e-4, R = H.R;
        if (o.t.fr < R * 0.98) {
          if (d < R) {
            o.st = 2; o.h = H; o.rx = dx; o.rz = dz; o.vin = 0; o.vy = 0; o.ux = dx / d; o.uz = dz / d;
            touch(o); return;
          }
          const f = clamp((R + o.t.r - d) / (o.t.r * 2), 0, 1), want = 0.5 * f;
          if (want > o.wt) { o.wt = want; o.ux = dx / d; o.uz = dz / d; }
        } else {
          const f = clamp((R + o.t.r - d) / (2 * Math.min(R, o.t.r)), 0, 1), want = 0.2 * f * Math.min(1, R / o.t.fr);
          if (want > o.wt) { o.wt = want; o.ux = dx / d; o.uz = dz / d; }
        }
        if (o.st === 0) o.st = 1;
        touch(o);
      }
      function swallow(o) {
        const H = o.h;
        o.st = 3; o.h = null; writeObj(o);
        if (!H || !H.alive || phase === 'end') return;
        addMass(H, o.t.pts); H.eaten++; H.pulse = Math.min(1, H.pulse + 0.25 + o.t.pts / 200);
        if (H === player) { eatenPts += o.t.pts; eatenObjs++; if (phase === 'play') sfx('pop', o.t.pts); }
      }
      function activeStep(dt) {
        let n = 0;
        for (let k = 0; k < active.length; k++) {
          const o = active[k];
          if (o.st === 3) { o.act = false; continue; }
          if (o.st === 2) {
            const H = o.h;
            if (!H || !H.alive) { o.st = 3; o.h = null; writeObj(o); o.act = false; continue; }
            const R = H.R;
            let d = Math.hypot(o.rx, o.rz);
            const ux = d > 1e-4 ? o.rx / d : o.ux, uz = d > 1e-4 ? o.rz / d : o.uz;
            const e = o.t.fr * Math.cos(Math.min(o.ta, 1.5));
            if (d + e * 0.85 - R > 0 && o.y > -o.t.h * 0.6 - 0.4) {
              o.tv += (5 + 14 / (0.5 + o.t.fr)) * dt;
              o.vin += (3 + R * 0.6) * dt;
              d = Math.max(0, d - o.vin * dt);
              const ny = -Math.sin(Math.min(o.ta, 1.5)) * e * 0.6 - 0.02;
              o.vy = Math.min(0, (ny - o.y) / dt); o.y = ny;
            } else {
              o.vy -= CFG.gravity * dt; o.y += o.vy * dt;
              o.tv += 2.5 * dt;
              d = Math.max(0, Math.min(d - o.vin * dt * 0.4, R - e * 0.85));
            }
            o.ta = Math.min(o.ta + o.tv * dt, 1.45);
            o.rx = ux * d; o.rz = uz * d; o.ux = ux; o.uz = uz;
            o.x = H.x + o.rx; o.z = H.z + o.rz;
            if (o.y < -(o.t.h + R * 1.1 + 1)) { swallow(o); o.act = false; continue; }
            active[n++] = o;
            continue;
          }
          o.tv += ((o.wt - o.ta) * 90 - o.tv * 7) * dt;
          o.ta += o.tv * dt;
          if (o.ta < 0 && o.wt === 0 && Math.abs(o.tv) < 0.4) { o.ta = 0; o.tv = 0; }
          o.y = (o.mv && o.mv.kind === 'walk' ? Math.abs(Math.sin(o.mv.ph)) * 0.09 : 0) - Math.max(0, o.ta) * o.t.r * 0.25;
          if (o.wt === 0 && Math.abs(o.ta) < 0.002 && Math.abs(o.tv) < 0.02) { o.ta = 0; o.tv = 0; o.y = 0; o.st = 0; o.act = false; writeObj(o); continue; }
          o.wt = 0;
          active[n++] = o;
        }
        active.length = n;
      }
      function interactAll() {
        for (const H of holes) {
          if (!H.on || !H.alive) continue;
          const reach = H.R + MAXR;
          const i0 = cellOf(H.x - reach), i1 = cellOf(H.x + reach), j0 = cellOf(H.z - reach), j1 = cellOf(H.z + reach);
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
            const c = grid[j * GN + i];
            for (let k = 0; k < c.length; k++) { const o = c[k]; if (o.st < 2) interact(H, o); }
          }
          for (const o of MOVERS) if (o.st < 2) interact(H, o);
        }
      }

      function decide(H) {
        const Rt = RL[H.level];
        let threat = null, td = 1e9;
        for (const o of holes) {
          if (o === H || !o.on || !o.alive || !canEat(o, H)) continue;
          const d = Math.hypot(o.x - H.x, o.z - H.z) - RL[o.level];
          if (d < 5 + Rt * 2 + 9 * H.skill && d < td) { td = d; threat = o; }
        }
        if (threat && Math.random() < 0.45 + 0.55 * H.skill) {
          let ax = H.x - threat.x, az = H.z - threat.z;
          const l = Math.hypot(ax, az) || 1, j = (Math.random() - 0.5) * 1.2;
          ax /= l; az /= l;
          const c = Math.cos(j), s = Math.sin(j);
          let tx = H.x + (ax * c - az * s) * 40, tz = H.z + (ax * s + az * c) * 40;
          if (Math.abs(tx) > LIMIT - 10) tx = H.x - (tx - H.x) * 0.3 + (Math.random() - 0.5) * 60;
          if (Math.abs(tz) > LIMIT - 10) tz = H.z - (tz - H.z) * 0.3 + (Math.random() - 0.5) * 60;
          H.tx = tx; H.tz = tz; return;
        }
        const late = mode === 'battle' ? Math.min(1, elapsed / 150) : 0;
        let prey = null, pd = 1e9;
        for (const o of holes) {
          if (o === H || !o.on || !o.alive || o.prot > 0 || !canEat(H, o)) continue;
          const d = Math.hypot(o.x - H.x, o.z - H.z), lim = 14 + Rt * 3 + 26 * H.aggr + 120 * late;
          if (d < lim && d < pd) { pd = d; prey = o; }
        }
        if (prey) { H.tx = prey.x + prey.vx * 0.35; H.tz = prey.z + prey.vz * 0.35; return; }
        const R = Rt * 0.97, rc = Math.min(5, 2 + Math.floor(Rt / 2.5)), ci = cellOf(H.x), cj = cellOf(H.z);
        let best = 0, bx = 0, bz = 0;
        for (let dj = -rc; dj <= rc; dj++) for (let di = -rc; di <= rc; di++) {
          const i = ci + di, j = cj + dj;
          if (i < 0 || j < 0 || i >= GN || j >= GN) continue;
          const c = grid[j * GN + i];
          let sum = 0;
          for (let k = 0; k < c.length; k++) { const o = c[k]; if (o.st < 2 && o.t.fr < R) sum += o.t.pts; }
          if (!sum) continue;
          const cx = (i + 0.5) * CELL - EXT, cz = (j + 0.5) * CELL - EXT;
          const sc = sum / (Math.hypot(cx - H.x, cz - H.z) + 10 + Rt * 2) * (0.7 + Math.random() * 0.6);
          if (sc > best) { best = sc; bx = cx; bz = cz; }
        }
        if (best > 0) { H.tx = bx + (Math.random() - 0.5) * 6; H.tz = bz + (Math.random() - 0.5) * 6; }
        else { H.tx = (Math.random() - 0.5) * 2 * HALF; H.tz = (Math.random() - 0.5) * 2 * HALF; }
      }
      function steerBot(H, dt) {
        H.think -= dt;
        const dx = H.tx - H.x, dz = H.tz - H.z, d = Math.hypot(dx, dz);
        if (H.think <= 0 || d < Math.max(1.5, H.R * 0.5)) { decide(H); H.think = 0.85 - 0.5 * H.skill + Math.random() * 0.25; }
        const want = Math.atan2(H.tz - H.z, H.tx - H.x);
        let da = want - H.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
        const tr = (3 + 4 * H.skill) * dt;
        H.ang += clamp(da, -tr, tr);
        H.ix = Math.cos(H.ang); H.iz = Math.sin(H.ang); H.mag = 1;
      }

      const ptr = { on: false, nx: 0, ny: 0 };
      const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
      const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
      function playerInput(H) {
        let kx = 0, kz = 0;
        if (keys.has('KeyW') || keys.has('ArrowUp')) kz -= 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) kz += 1;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) kx -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) kx += 1;
        if (kx || kz) { const l = Math.hypot(kx, kz); H.ix = kx / l; H.iz = kz / l; H.mag = 1; return; }
        if (joy.id !== null) {
          const dx = joy.x - joy.ox, dy = joy.y - joy.oy, l = Math.hypot(dx, dy);
          if (l < 5) { H.mag = 0; return; }
          H.ix = dx / l; H.iz = dy / l; H.mag = clamp((l - 5) / 35, 0, 1); return;
        }
        if (ptr.on) {
          ndc.set(ptr.nx, ptr.ny); ray.setFromCamera(ndc, cam);
          if (ray.ray.intersectPlane(plane, hit)) {
            const dx = hit.x - H.x, dz = hit.z - H.z, l = Math.hypot(dx, dz);
            if (l > 0.01) { H.ix = dx / l; H.iz = dz / l; H.mag = clamp((l - H.R * 0.35) / (H.R * 1.6 + 2), 0, 1); return; }
          }
        }
        H.mag = 0;
      }
      const local = e => { const r = stage.getBoundingClientRect(), k = stage.offsetWidth / (r.width || 1); return [(e.clientX - r.left) * k, (e.clientY - r.top) * k, r]; };
      api.on(stage, 'pointerdown', e => {
        audio();
        if (e.target.closest('button')) return;
        if (phase === 'menu') { startMode(MODE_KEYS[sel]); }
        else if (phase === 'end') return;
        const [x, y, r] = local(e);
        if (e.pointerType === 'mouse') { ptr.on = true; ptr.nx = (e.clientX - r.left) / r.width * 2 - 1; ptr.ny = -((e.clientY - r.top) / r.height * 2 - 1); return; }
        joy.id = e.pointerId; joy.ox = joy.x = x; joy.oy = joy.y = y;
        elJoy.style.transform = `translate(${x}px,${y}px)`; elJoyK.style.transform = ''; elJoy.classList.add('on');
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      api.on(stage, 'pointermove', e => {
        if (e.pointerType === 'mouse') {
          const r = stage.getBoundingClientRect();
          ptr.on = true; ptr.nx = (e.clientX - r.left) / r.width * 2 - 1; ptr.ny = -((e.clientY - r.top) / r.height * 2 - 1);
          return;
        }
        if (e.pointerId !== joy.id) return;
        const [x, y] = local(e);
        joy.x = x; joy.y = y;
        let dx = x - joy.ox, dy = y - joy.oy; const l = Math.hypot(dx, dy);
        if (l > 40) { dx *= 40 / l; dy *= 40 / l; }
        elJoyK.style.transform = `translate(${dx}px,${dy}px)`;
      });
      const endJoy = e => { if (e.pointerId === joy.id) { joy.id = null; elJoy.classList.remove('on'); } };
      api.on(stage, 'pointerup', endJoy);
      api.on(stage, 'pointercancel', endJoy);
      api.on(stage, 'pointerleave', e => { if (e.pointerType === 'mouse') ptr.on = false; });
      api.on(stage, 'contextmenu', e => e.preventDefault());
      api.on(window, 'keydown', e => {
        if (phase === 'menu') {
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') { sel = (sel + 2) % 3; renderMenu(); sfx('tap'); return; }
          if (e.code === 'ArrowRight' || e.code === 'KeyD') { sel = (sel + 1) % 3; renderMenu(); sfx('tap'); return; }
          if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') { sel = +e.code.slice(5) - 1; renderMenu(); }
          if (e.code === 'Tab' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS' || e.metaKey || e.ctrlKey || e.altKey) return;
          audio(); startMode(MODE_KEYS[sel]);
        } else if (phase === 'end' && performance.now() - endT > 900 && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); startMode(mode); }
      });
      elMenu.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; sel = MODE_KEYS.indexOf(b.dataset.m); renderMenu(); sfx('tap'); });
      elMenu.querySelector('.play').addEventListener('click', () => { audio(); startMode(MODE_KEYS[sel]); });
      elEnd.querySelector('.again').addEventListener('click', () => { if (phase === 'end') startMode(mode); });
      elEnd.querySelector('.tomenu').addEventListener('click', () => { if (phase === 'end') toMenu(); });

      const fmtT = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
      function renderMenu() {
        elMenu.querySelectorAll('[data-m]').forEach((b, i) => b.classList.toggle('on', i === sel));
        const m = MODE_KEYS[sel];
        elMenu.querySelector('.desc').textContent = MODES[m].desc;
        const b = save.best[m];
        elMenu.querySelector('.best').textContent = b ? 'Best: ' + b.toLocaleString('en-US') + (m === 'battle' && save.wins ? ' · Wins: ' + save.wins : '') : '';
      }
      function shuffledNames() { const a = NAMES.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
      function spawnSet(nBots, withPlayer) {
        for (const H of HOLES) { H.on = false; H.alive = false; H.g.visible = false; H.el.classList.add('hide'); }
        holes = [];
        const names = shuffledNames();
        const total = nBots + (withPlayer ? 1 : 0);
        for (let k = 0; k < total; k++) {
          const H = HOLES[k], a = k / total * TAU + 0.4, rad = HALF * (0.35 + 0.5 * ((k * 0.618) % 1));
          let x = Math.cos(a) * rad, z = Math.sin(a) * rad;
          if (Math.abs(x) < Math.abs(z)) x = roadAt(Math.round((x + HALF) / P)); else z = roadAt(Math.round((z + HALF) / P));
          holes.push(H);
          if (withPlayer && k === 0) setupHole(H, 'You', ME, false, roadAt(3) + P / 2, roadAt(4));
          else setupHole(H, names[k % names.length], HCOL[k % HCOL.length], true, x, z);
        }
        player = withPlayer ? holes[0] : null;
        if (player) player.prot = mode === 'battle' ? 1.5 : CFG.shield;
      }
      function startMode(m) {
        mode = m; sel = MODE_KEYS.indexOf(m); save.mode = sel; api.save(save);
        resetCity();
        spawnSet(m === 'solo' ? 0 : m === 'battle' ? CFG.battleHoles - 1 : CFG.classicHoles - 1, true);
        phase = 'play'; roundT = CFG.roundTime; elapsed = 0; eatenPts = 0; eatenObjs = 0; scoreShown = -1; endInfo = null; lastTick = -1;
        elMenu.classList.add('off'); elEnd.classList.add('off'); elHud.classList.remove('off');
        elTmI.className = m === 'battle' ? 'holei' : 'clock'; elTm.classList.remove('hot');
        elPct.style.display = m === 'solo' ? 'flex' : 'none';
        elBoard.style.display = m === 'solo' ? 'none' : 'block';
        elMsg.classList.remove('on');
        camD = CFG.camBase + CFG.camPerR * RL[0];
        camX = player.x; camZ = player.z;
        api.score(0);
        boardT = 0;
      }
      function toMenu() {
        phase = 'menu'; mode = MODE_KEYS[sel];
        resetCity();
        spawnSet(CFG.classicHoles, false);
        attractT = 0;
        elMenu.classList.remove('off'); elEnd.classList.add('off'); elHud.classList.add('off'); elJoy.classList.remove('on'); joy.id = null;
        renderMenu();
      }
      function ranked() { return holes.filter(o => o.on).sort((a, b) => b.mass - a.mass); }
      function endRound(kind) {
        if (phase !== 'play') return;
        phase = 'end'; endT = performance.now();
        joy.id = null; elJoy.classList.remove('on');
        let rank = 1, score = Math.round(player.mass);
        const list = mode === 'battle' ? battleOrder() : ranked();
        if (mode !== 'solo') rank = list.indexOf(player) + 1;
        if (mode === 'solo' && kind === 'cleared') score += Math.round(roundT * 100);
        score = Math.max(1, score);
        const nb = api.submit(score);
        if (!save.best[mode] || score > save.best[mode]) save.best[mode] = score;
        if (mode === 'battle' && rank === 1) save.wins = (save.wins || 0) + 1;
        api.save(save);
        api.score(score);
        endInfo = { kind, rank, score, nb, list };
        sfx(rank === 1 || kind === 'cleared' ? 'win' : 'lose');
        api.timeout(showEnd, kind === 'eaten' ? 1300 : 900);
      }
      function battleOrder() {
        const alive = holes.filter(o => o.on && o.alive).sort((a, b) => b.mass - a.mass);
        const dead = holes.filter(o => o.on && !o.alive).sort((a, b) => (b.deathAt || 0) - (a.deathAt || 0));
        return alive.concat(dead);
      }
      function showEnd() {
        if (phase !== 'end' || !endInfo) return;
        const { kind, rank, score, nb, list } = endInfo;
        const c = elEnd.querySelector('.card');
        const k = c.querySelector('.k');
        k.textContent = nb ? 'New best!' : kind === 'time' ? "Time's up!" : kind === 'eaten' ? 'You got eaten!' : kind === 'cleared' ? 'City cleared!' : 'Round over';
        k.classList.toggle('nb', !!nb);
        const pct = Math.floor(eatenPts / TOTAL * 1000) / 10;
        if (mode === 'solo') {
          c.querySelector('h2').textContent = pct + '%';
          c.querySelector('.s').textContent = kind === 'cleared' ? 'You ate the whole city!' : 'of the city eaten';
          c.querySelector('.list').innerHTML = '';
        } else {
          c.querySelector('h2').textContent = '#' + rank;
          c.querySelector('.s').textContent = 'You are #' + rank + (rank === 1 ? '!' : '');
          const rows = list.slice(0, 5);
          if (!rows.includes(player)) rows.push(player);
          c.querySelector('.list').innerHTML = rows.map(o => `<div class="r${o === player ? ' me' : ''}"><b>${list.indexOf(o) + 1}</b><span style="color:${o.color}">${o.name}</span><em>${Math.round(o.mass).toLocaleString('en-US')}</em></div>`).join('');
        }
        const st = [['Score', score.toLocaleString('en-US')], ['Eaten', eatenObjs.toLocaleString('en-US')]];
        if (mode !== 'solo') st.push(['Holes eaten', player.kills]); else st.push(['Size', player.level + 1]);
        c.querySelector('.st').innerHTML = st.map(([a, b]) => `<div>${a}<b>${b}</b></div>`).join('');
        elEnd.classList.remove('off'); elHud.classList.add('off');
        for (const H of holes) H.el.classList.add('hide');
      }
      function msg(html, t) { elMsg.innerHTML = html; elMsg.classList.add('on'); msgT = t; }

      function eatHole(big, small) {
        small.alive = false; small.dieT = 0; small.by = big; small.Rd = small.R; small.deathAt = elapsed;
        big.kills++;
        addMass(big, Math.round(small.mass * CFG.holeGain) + 15 * (small.level + 1));
        if (mode !== 'battle' || phase === 'menu') small.mass = 0;
        big.pulse = 1;
        if (big === player && phase === 'play') { sfx('gulp'); msg('You ate ' + small.name + '!', 1.6); }
        if (small === player && phase === 'play') {
          sfx('eaten');
          if (mode === 'battle') { msg('Eaten by ' + big.name + '!', 3); endRound('eaten'); }
          else msg('Eaten by ' + big.name + '!<small>Respawning…</small>', CFG.respawn);
        }
        if (mode === 'battle' && phase === 'play' && player.alive && holes.every(o => o === player || !o.alive)) endRound('win');
      }
      function holeEats() {
        for (let i = 0; i < holes.length; i++) {
          const a = holes[i];
          if (!a.on || !a.alive) continue;
          for (let j = i + 1; j < holes.length; j++) {
            const b = holes[j];
            if (!b.on || !b.alive || !a.alive) continue;
            let big, small;
            if (canEat(a, b)) { big = a; small = b; } else if (canEat(b, a)) { big = b; small = a; } else continue;
            if (small.prot > 0) continue;
            if (Math.hypot(a.x - b.x, a.z - b.z) + small.R * 0.4 < big.R) eatHole(big, small);
          }
        }
      }
      function holeStep(H, dt) {
        if (!H.alive) {
          if (H.dieT < 1) {
            H.dieT = Math.min(1, H.dieT + dt / 0.4);
            const t = H.dieT, b = H.by;
            H.R = H.Rd * (1 - t); if (b) { H.x += (b.x - H.x) * Math.min(1, dt * 10); H.z += (b.z - H.z) * Math.min(1, dt * 10); }
            if (t >= 1) { H.g.visible = false; H.el.classList.add('hide'); H.dead = true; H.resp = CFG.respawn; }
          } else if (phase === 'menu' || (phase === 'play' && mode !== 'battle')) {
            H.resp -= dt;
            if (H === player && phase === 'play') { const s = Math.max(1, Math.ceil(H.resp)), sm = elMsg.querySelector('small'); if (sm && sm.dataset.s !== '' + s) { sm.dataset.s = s; sm.textContent = 'Respawning in ' + s + '…'; } }
            if (H.resp <= 0) {
              const p = spawnPoint(30);
              H.x = p[0]; H.z = p[1]; H.mass = 0; H.level = 0; H.R = RL[0]; H.alive = true; H.dead = false; H.prot = CFG.shield; H.vx = H.vz = 0;
              H.g.visible = true; H.el.classList.remove('hide');
              if (H === player) { elMsg.classList.remove('on'); camD = CFG.camBase + CFG.camPerR * RL[0]; }
            }
          }
          return;
        }
        if (H.prot > 0) H.prot -= dt;
        const live = phase === 'play' || (phase === 'menu' && H.bot);
        if (!live) H.mag = 0;
        else if (H.bot || auto) steerBot(H, dt);
        else playerInput(H);
        const sp = speedOf(H.R) * H.mag * (H.bot ? H.spdK : 1), k = 1 - Math.exp(-14 * dt);
        H.vx += (H.ix * sp - H.vx) * k; H.vz += (H.iz * sp - H.vz) * k;
        if (!H.mag) { H.vx *= 0.8; H.vz *= 0.8; }
        H.x += H.vx * dt; H.z += H.vz * dt;
        const lim = LIMIT - H.R * 0.5;
        H.x = clamp(H.x, -lim, lim); H.z = clamp(H.z, -lim, lim);
        H.R += (RL[H.level] - H.R) * (1 - Math.exp(-5 * dt));
        H.pulse = Math.max(0, H.pulse - dt * 2.5); H.flash = Math.max(0, H.flash - dt * 2);
      }
      let lastTick = -1;
      function step(dt) {
        moveMovers(dt);
        for (const H of holes) if (H.on) holeStep(H, dt);
        interactAll();
        activeStep(dt);
        if (phase === 'play' || phase === 'menu') holeEats();
        if (phase === 'play') {
          elapsed += dt;
          if (mode !== 'battle') {
            roundT -= dt;
            if (roundT <= 0) { roundT = 0; endRound('time'); }
          }
          if (mode === 'solo' && eatenPts >= TOTAL * 0.999) endRound('cleared');
        } else if (phase === 'menu') {
          attractT += dt;
          if (attractT > 110) { resetCity(); spawnSet(CFG.classicHoles, false); attractT = 0; }
        }
      }

      let camX = 0, camZ = 0, camD = 40, shadowExt = 0;
      const _v = new THREE.Vector3();
      function updateCamera(dt) {
        let fx = 0, fz = 0, R = 1;
        if (player && phase !== 'menu') { fx = player.x; fz = player.z; R = player.alive ? player.R : RL[0]; }
        else {
          let b = null;
          for (const H of holes) if (H.on && H.alive && (!b || H.mass > b.mass)) b = H;
          if (b) { fx = b.x; fz = b.z; }
          R = (CFG.menuCam - CFG.camBase) / CFG.camPerR;
        }
        const k = 1 - Math.exp(-(phase === 'menu' ? 1.5 : 10) * dt);
        camX += (fx - camX) * k; camZ += (fz - camZ) * k;
        const wantD = (CFG.camBase + CFG.camPerR * R) * (w > h ? 0.92 : 1.18);
        camD += (wantD - camD) * (1 - Math.exp(-2.5 * dt));
        const t = CFG.camTilt;
        cam.position.set(camX, camD * Math.sin(t), camZ + camD * Math.cos(t));
        cam.lookAt(camX, 0, camZ);
        const nr = Math.max(0.5, camD * 0.05);
        if (Math.abs(nr - cam.near) > 0.05) { cam.near = nr; cam.updateProjectionMatrix(); }
        const ext = Math.ceil((camD * 0.75 + 12) / 4) * 4;
        if (ext !== shadowExt) {
          shadowExt = ext;
          const sc = sun.shadow.camera;
          sc.left = -ext; sc.right = ext; sc.top = ext * 1.15; sc.bottom = -ext * 0.85; sc.far = 300 + ext; sc.updateProjectionMatrix();
        }
        const fh = player && phase !== 'menu' ? player : null;
        if (fh && fh.alive) { seeU.value.set(fh.x, fh.R * 0.95, fh.z, fh.R * 1.3 + 1.5); camU.value.copy(cam.position); } else seeU.value.w = 0;
        sun.target.position.set(camX, 0, camZ - camD * 0.12);
        sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 200);
      }
      function updateHoles() {
        let king = null;
        if (mode !== 'solo') for (const H of holes) if (H.on && H.alive && H.mass > 0 && (!king || H.mass > king.mass)) king = H;
        const cw = stage.offsetWidth, ch = stage.offsetHeight;
        for (const H of holes) {
          if (!H.on) continue;
          const R = Math.max(0.001, H.R * (1 + H.pulse * 0.05));
          H.g.position.set(H.x, 0, H.z);
          H.g.scale.set(R, R, R);
          H.ring.position.y = 0.14 / R;
          const span = TL[H.level + 1] - TL[H.level];
          H.rm.uniforms.uP.value = clamp((H.mass - TL[H.level]) / span, 0, 1);
          H.rm.uniforms.uF.value = H.flash * 0.8;
          H.rm.uniforms.uA.value = H.prot > 0 && phase !== 'menu' ? 0.45 + 0.55 * (Math.sin(elapsed * 18) > 0 ? 1 : 0) : 1;
          if ((!H.alive && H.dieT >= 1) || !elEnd.classList.contains('off') || phase === 'menu') { H.el.classList.add('hide'); continue; }
          _v.set(H.x, 0, H.z - H.R * 1.12 - 0.4).project(cam);
          if (_v.z > 1 || Math.abs(_v.x) > 1.2 || Math.abs(_v.y) > 1.2) { H.el.classList.add('hide'); continue; }
          H.el.classList.remove('hide');
          H.el.classList.toggle('king', H === king);
          H.el.style.transform = `translate(${((_v.x + 1) / 2 * cw).toFixed(1)}px,${((1 - _v.y) / 2 * ch).toFixed(1)}px) translate(-50%,-100%)`;
        }
      }
      function updateHud(dt) {
        if (phase !== 'play') return;
        const s = Math.round(player.mass);
        if (s !== scoreShown) { scoreShown = s; api.score(s); }
        if (mode === 'battle') {
          const t = holes.filter(o => o.on && o.alive).length + ' left';
          if (elTmB.textContent !== t) elTmB.textContent = t;
        } else {
          const t = fmtT(roundT);
          if (elTmB.textContent !== t) elTmB.textContent = t;
          const hot = roundT <= 10;
          elTm.classList.toggle('hot', hot);
          const sec = Math.ceil(roundT);
          if (hot && sec !== lastTick && sec > 0) { lastTick = sec; sfx('tick'); }
        }
        if (mode === 'solo') {
          const p = eatenPts / TOTAL * 100;
          elPctU.style.width = p.toFixed(2) + '%';
          elPctB.textContent = (p < 10 ? p.toFixed(1) : Math.floor(p)) + '%';
        }
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) elMsg.classList.remove('on'); }
        boardT -= dt;
        if (boardT <= 0 && mode !== 'solo') {
          boardT = 0.25;
          const list = mode === 'battle' ? battleOrder() : ranked();
          const rows = list.slice(0, 5);
          if (!rows.includes(player)) rows.push(player);
          elBoard.innerHTML = rows.map(o => `<div class="r${o === player ? ' me' : ''}${o.alive ? '' : ' dead'}"><b>${list.indexOf(o) + 1}</b><span style="color:${o.color}">${o.name}</span><em>${Math.round(o.mass).toLocaleString('en-US')}</em></div>`).join('');
        }
      }

      toMenu();
      let acc = 0;
      api.loop(dt => {
        acc += dt * timeScale;
        let n = 0;
        while (acc >= CFG.step && n < 8) { step(CFG.step); acc -= CFG.step; n++; }
        if (n === 8) acc = 0;
        for (const o of MOVERS) if (o.st < 3) writeObj(o);
        for (const o of active) writeObj(o);
        for (const k in TYPES) { const T = TYPES[k]; if (T.dirty && T.mesh) { T.mesh.instanceMatrix.needsUpdate = true; T.dirty = false; } }
        updateCamera(dt);
        updateHoles();
        updateHud(dt);
        renderer.render(scene, cam);
      });

      root.__hc = {
        get phase() { return phase; }, get mode() { return mode; }, get player() { return player; }, get holes() { return holes; },
        get pct() { return eatenPts / TOTAL; }, get total() { return TOTAL; }, get objs() { return OBJ.length; }, get list() { return OBJ; }, get active() { return active.length; },
        start: startMode, menu: toMenu, bench: n => { const t = performance.now(); for (let i = 0; i < n; i++) step(CFG.step); return performance.now() - t; }, set auto(b) { auto = b; }, set speed(s) { timeScale = s; }, end: () => { roundT = 0.01; }, RL, TL
      };

      return {
        destroy() {
          for (const d of disposables) d.dispose();
          for (const k in TYPES) if (TYPES[k].mesh) TYPES[k].mesh.dispose && TYPES[k].mesh.dispose();
          if (ac) { try { ac.close(); } catch (e) {} ac = null; }
        }
      };
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="hcy-h" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#000"/><stop offset=".75" stop-color="#05060a"/><stop offset="1" stop-color="#22253a"/></radialGradient>
<clipPath id="hcy-c"><ellipse cx="196" cy="196" rx="84" ry="50"/></clipPath>
<linearGradient id="hcy-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad9ff"/><stop offset="1" stop-color="#6fc0f2"/></linearGradient></defs>
<rect width="400" height="300" fill="#86cf5e"/>
<rect x="0" y="118" width="400" height="16" fill="#dcdee3"/><rect x="0" y="246" width="400" height="16" fill="#dcdee3"/>
<rect x="0" y="134" width="400" height="112" fill="#6b717d"/>
<path d="M14 190h34M78 190h34M290 190h34M354 190h34" stroke="#f4f4f4" stroke-width="5"/>
<g fill="#f4f4f4"><rect x="332" y="140" width="9" height="100"/><rect x="350" y="140" width="9" height="100"/><rect x="368" y="140" width="9" height="100"/><rect x="386" y="140" width="9" height="100"/></g>
<g><rect x="18" y="20" width="70" height="100" fill="#ff8a80"/><rect x="18" y="8" width="70" height="16" fill="#ffb3ab"/>
<g fill="url(#hcy-s)"><rect x="28" y="34" width="20" height="16"/><rect x="58" y="34" width="20" height="16"/><rect x="28" y="62" width="20" height="16"/><rect x="58" y="62" width="20" height="16"/><rect x="28" y="90" width="20" height="16"/><rect x="58" y="90" width="20" height="16"/></g>
<rect x="104" y="58" width="62" height="62" fill="#ffd166"/><rect x="104" y="46" width="62" height="16" fill="#ffe29a"/>
<g fill="url(#hcy-s)"><rect x="112" y="70" width="46" height="18"/><rect x="112" y="96" width="20" height="16"/><rect x="138" y="96" width="20" height="16"/></g>
<path d="M104 92h62l-6 10h-50z" fill="#ff6f61"/>
<rect x="246" y="-4" width="84" height="124" fill="#80d8ff"/><rect x="246" y="-4" width="84" height="12" fill="#b6eaff"/>
<g fill="#4fa8e0"><rect x="256" y="16" width="64" height="12"/><rect x="256" y="40" width="64" height="12"/><rect x="256" y="64" width="64" height="12"/><rect x="256" y="88" width="64" height="12"/></g>
<rect x="344" y="44" width="56" height="76" fill="#b39ddb"/><rect x="344" y="34" width="56" height="12" fill="#d3c4f0"/>
<g fill="url(#hcy-s)"><rect x="352" y="56" width="16" height="16"/><rect x="376" y="56" width="16" height="16"/><rect x="352" y="84" width="16" height="16"/><rect x="376" y="84" width="16" height="16"/></g></g>
<g><circle cx="190" cy="96" r="22" fill="#62bb45"/><circle cx="198" cy="88" r="13" fill="#77cf58"/><rect x="187" y="112" width="6" height="12" fill="#8b5a3c"/></g>
<g transform="translate(40 266)"><rect x="-26" y="-6" width="52" height="22" rx="4" fill="#1e88e5"/><rect x="-14" y="-16" width="28" height="12" rx="3" fill="#a6dcff"/><circle cx="-14" cy="16" r="6" fill="#2a2c33"/><circle cx="14" cy="16" r="6" fill="#2a2c33"/></g>
<g><circle cx="356" cy="282" r="20" fill="#62bb45"/><circle cx="362" cy="276" r="11" fill="#77cf58"/></g>
<ellipse cx="196" cy="196" rx="94" ry="58" fill="#fff" opacity=".9"/>
<path d="M196 138a94 58 0 0 1 89 76" fill="none" stroke="#3d8bff" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="196" cy="196" rx="84" ry="50" fill="url(#hcy-h)"/>
<g clip-path="url(#hcy-c)">
<g transform="translate(232 196) rotate(-38)"><rect x="-34" y="-14" width="68" height="28" rx="5" fill="#e53935"/><rect x="-18" y="-24" width="34" height="14" rx="3" fill="#a6dcff"/><rect x="-18" y="-26" width="34" height="4" fill="#e53935"/><circle cx="-20" cy="14" r="8" fill="#2a2c33"/><circle cx="20" cy="14" r="8" fill="#2a2c33"/></g>
<g transform="translate(160 214) rotate(30)" opacity=".85"><circle r="16" fill="#3f8a33"/><circle cx="6" cy="-6" r="9" fill="#4f9e3f"/></g>
</g>
<g transform="translate(150 176) rotate(-24)"><rect x="-4" y="-2" width="8" height="12" fill="#3b4a6b"/><rect x="-5" y="-12" width="10" height="11" fill="#ffca28"/><rect x="-4" y="-20" width="8" height="8" fill="#f3c9a5"/></g>
<g transform="translate(206 166) rotate(16)"><path d="M-7 8h14l-5-20h-4z" fill="#ff7a1a"/><rect x="-5" y="-3" width="10" height="3" fill="#fff"/></g>
<g fill="#fff" opacity=".9"><circle cx="118" cy="150" r="3"/><circle cx="284" cy="150" r="3.5"/><circle cx="274" cy="244" r="2.5"/><circle cx="110" cy="232" r="2.5"/></g>
<ellipse cx="330" cy="200" rx="30" ry="18" fill="#ff9f1c"/><ellipse cx="330" cy="200" rx="25" ry="14.5" fill="url(#hcy-h)"/>
<path d="M318 172l-3-12 8 6 7-9 7 9 8-6-3 12z" fill="#ffc83d" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/>
</svg>`;
})();

