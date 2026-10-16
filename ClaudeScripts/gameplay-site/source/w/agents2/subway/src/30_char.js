
  function mkChars(THREE, toonMap, bin) {
    const mats = new Map();
    const M = (hex, o) => {
      const k = hex + (o ? JSON.stringify(o) : '');
      if (!mats.has(k)) { const m = new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(hex).convertSRGBToLinear(), gradientMap: toonMap }, o || {})); mats.set(k, m); bin.add(m); }
      return mats.get(k);
    };
    const geos = new Map();
    const G = (k, f) => { if (!geos.has(k)) { const g = f(); geos.set(k, g); bin.add(g); } return geos.get(k); };
    const rbox = (w, h, d, n) => G(`rb${w},${h},${d},${n}`, () => {
      const g = new THREE.SphereGeometry(1, 16, 12), p = g.attributes.position;
      const e = n == null ? 0.45 : n;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        p.setXYZ(i, Math.sign(x) * Math.pow(Math.abs(x), e) * w / 2, Math.sign(y) * Math.pow(Math.abs(y), e) * h / 2, Math.sign(z) * Math.pow(Math.abs(z), e) * d / 2);
      }
      g.computeVertexNormals();
      return g;
    });
    const cyl = (rt, rb, h, seg) => G(`cy${rt},${rb},${h},${seg}`, () => { const g = new THREE.CylinderGeometry(rt, rb, h, seg || 10); g.translate(0, -h / 2, 0); return g; });
    const ball = (r, s) => G(`ba${r},${s}`, () => new THREE.SphereGeometry(r, s || 12, Math.max(6, (s || 12) * 0.7 | 0)));
    const mesh = (geo, mat, x, y, z, parent, sx, sy, sz) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0);
      if (sx) m.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz);
      if (parent) parent.add(m);
      return m;
    };
    const grp = (x, y, z, parent) => { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(g); return g; };

    function limb(parent, x, y, len1, len2, r1, r2, c1, c2, endGeo, endMat, endPos, flare) {
      const f = flare || 0.9;
      const top = grp(x, y, 0, parent);
      mesh(cyl(r1, r1 * 0.92, len1, 12), M(c1), 0, 0, 0, top);
      mesh(ball(r1 * 1.02, 12), M(c1), 0, 0, 0, top);
      const mid = grp(0, -len1, 0, top);
      mesh(ball(r1 * 0.95, 12), M(c2), 0, 0, 0, mid);
      mesh(cyl(r2 * (f > 1 ? 0.95 : 1), r2 * f, len2, 12), M(c2), 0, 0, 0, mid);
      const end = grp(0, -len2, 0, mid);
      if (endGeo) mesh(endGeo, endMat, endPos[0], endPos[1], endPos[2], end);
      return { top, mid, end };
    }

    function hero(P) {
      const root = new THREE.Group();
      const body = grp(0, 0, 0, root);
      const spin = grp(0, 0.55, 0, body);
      const pelvis = grp(0, 0.33, 0, spin);
      mesh(rbox(0.5, 0.3, 0.34, 0.75), M(P.pants), 0, 0.02, 0, pelvis);
      mesh(rbox(0.52, 0.07, 0.36, 0.8), M(shade(P.pants, -0.3)), 0, 0.14, 0, pelvis);
      const torso = grp(0, 0.06, 0, pelvis);
      mesh(rbox(0.56, 0.6, 0.38, 0.72), M(P.top), 0, 0.28, 0, torso);
      mesh(rbox(0.58, 0.12, 0.4, 0.8), M(shade(P.top, -0.12)), 0, 0.02, 0, torso);
      if (P.vest) {
        for (const sx of [-1, 1]) mesh(rbox(0.2, 0.52, 0.08, 0.75), M(P.vest), sx * 0.16, 0.29, -0.16, torso);
        mesh(rbox(0.54, 0.54, 0.08, 0.75), M(P.vest), 0, 0.29, 0.165, torso);
        for (const sx of [-1, 1]) mesh(rbox(0.08, 0.52, 0.34, 0.75), M(P.vest), sx * 0.26, 0.29, 0, torso);
      }
      mesh(rbox(0.12, 0.4, 0.05, 0.8), M(P.under), 0, 0.3, -0.18, torso);
      mesh(rbox(0.44, 0.3, 0.24, 0.8), M(P.top), 0, 0.53, 0.16, torso);
      mesh(rbox(0.3, 0.18, 0.12, 0.8), M(shade(P.top, -0.25)), 0, 0.56, 0.2, torso);
      for (const sx of [-1, 1]) mesh(cyl(0.012, 0.012, 0.16, 5), M('#ffffff'), sx * 0.06, 0.5, -0.19, torso);
      mesh(rbox(0.32, 0.14, 0.07, 0.8), M(shade(P.top, -0.08)), 0, 0.13, -0.18, torso);
      const neck = grp(0, 0.56, 0, torso);
      mesh(cyl(0.08, 0.09, 0.08, 10), M(P.skin), 0, 0.06, 0, neck);
      const head = grp(0, 0.04, 0, neck);
      head.scale.setScalar(1.22);
      mesh(rbox(0.44, 0.46, 0.42, 0.82), M(P.skin), 0, 0.22, 0, head);
      mesh(ball(0.12, 12), M(P.skin), 0, 0.12, -0.08, head, 1.4, 0.8, 1.1);
      for (const sx of [-1, 1]) {
        mesh(ball(0.065, 10), M(P.skin), sx * 0.215, 0.2, 0.02, head, 0.55, 1, 0.9);
        mesh(ball(0.06, 12), M('#ffffff'), sx * 0.085, 0.25, -0.185, head, 1, 1.3, 0.55);
        mesh(ball(0.032, 10), M('#3a2a1a'), sx * 0.085, 0.245, -0.212, head, 1, 1.2, 0.5);
        mesh(ball(0.012, 6), M('#ffffff'), sx * 0.075, 0.26, -0.225, head);
        const br = mesh(rbox(0.1, 0.028, 0.035, 0.8), M(P.hair), sx * 0.09, 0.335, -0.195, head); br.rotation.z = -sx * 0.18;
      }
      mesh(ball(0.05, 10), M(shade(P.skin, -0.06)), 0, 0.18, -0.215, head, 1, 0.9, 1);
      const mo = mesh(G('mouth', () => new THREE.TorusGeometry(0.05, 0.014, 6, 12, Math.PI)), M('#7a2a2a'), 0, 0.12, -0.2, head); mo.rotation.z = Math.PI;
      mesh(rbox(0.46, 0.26, 0.4, 0.8), M(P.hair), 0, 0.31, 0.045, head);
      for (const sx of [-1, 1]) mesh(rbox(0.06, 0.14, 0.12, 0.8), M(P.hair), sx * 0.2, 0.27, -0.06, head);
      if (P.extra === 'pony') { mesh(rbox(0.17, 0.36, 0.17, 0.8), M(P.hair), 0, 0.18, 0.27, head); }
      if (P.hood) {
        mesh(rbox(0.46, 0.2, 0.2, 0.8), M(P.hood), 0, 0.0, 0.17, head);
        mesh(rbox(0.36, 0.2, 0.2, 0.8), M(P.hood), 0, 0.5, 0.2, torso);
      }
      if (P.scarf) { mesh(rbox(0.34, 0.12, 0.14, 0.8), M(P.scarf), 0, 0.555, -0.13, torso); const sc = mesh(rbox(0.16, 0.16, 0.05, 0.6), M(P.scarf), 0, 0.47, -0.2, torso); sc.rotation.z = Math.PI / 4; }
      if (P.extra === 'phones') { const t = new THREE.Mesh(G('torus', () => new THREE.TorusGeometry(0.17, 0.035, 6, 16)), M('#2f2f3a')); t.rotation.x = Math.PI / 2; t.position.set(0, 0.0, 0); neck.add(t); for (const s of [-1, 1]) mesh(rbox(0.08, 0.12, 0.12), M('#ff4fa3'), s * 0.17, 0.0, -0.02, neck); }
      if (P.hat === 'cap') {
        const dome = G('dome', () => new THREE.SphereGeometry(0.245, 20, 10, 0, TAU, 0, Math.PI / 2));
        mesh(dome, M(P.hatA), 0, 0.33, 0.015, head, 1, 0.9, 1.05);
        const fr = mesh(rbox(0.3, 0.17, 0.08, 0.8), M(P.hatB), 0, 0.42, -0.19, head); fr.rotation.x = -0.35;
        mesh(rbox(0.1, 0.05, 0.02, 0.8), M(P.hatA), 0, 0.43, -0.235, head).rotation.x = -0.35;
        const brim = mesh(rbox(0.4, 0.04, 0.3, 0.8), M(P.hatA), 0, 0.345, -0.3, head);
        brim.rotation.x = -0.14;
        mesh(cyl(0.25, 0.25, 0.04, 20), M(shade(P.hatA, -0.2)), 0, 0.355, 0.015, head);
        mesh(ball(0.03, 8), M(P.hatA), 0, 0.555, 0.015, head);
      } else if (P.hat === 'beanie') {
        const dome = G('dome2', () => new THREE.SphereGeometry(0.24, 16, 8, 0, TAU, 0, Math.PI / 2));
        mesh(dome, M(P.hatA), 0, 0.31, 0.02, head, 1, 1.05, 1);
        mesh(cyl(0.245, 0.245, 0.09, 16), M(P.hatB), 0, 0.36, 0.02, head);
        mesh(ball(0.07, 8), M(P.hatB), 0, 0.58, 0.02, head);
      } else if (P.hat === 'alien') {
        const dome = G('dome3', () => new THREE.SphereGeometry(0.24, 16, 8, 0, TAU, 0, Math.PI / 2));
        mesh(dome, M(P.hatA), 0, 0.31, 0.02, head, 1.05, 1.0, 1.05);
        for (const s of [-1, 1]) { const a = mesh(cyl(0.015, 0.015, 0.22, 5), M(P.hatA), s * 0.1, 0.72, 0.02, head); a.rotation.z = s * 0.4; mesh(ball(0.045, 8), M(P.hatB), s * 0.19, 0.74, 0.02, head); }
      }
      const handG = ball(0.095, 12), handM = M(P.skin);
      const armR = limb(torso, 0.33, 0.47, 0.27, 0.25, 0.092, 0.085, P.top, P.top, handG, handM, [0, -0.03, 0], 1.08);
      const armL = limb(torso, -0.33, 0.47, 0.27, 0.25, 0.092, 0.085, P.top, P.top, handG, handM, [0, -0.03, 0], 1.08);
      const can = grp(0, -0.06, -0.02, armR.end);
      mesh(cyl(0.05, 0.05, 0.2, 10), M('#e8323a'), 0, 0.1, 0, can);
      mesh(cyl(0.035, 0.05, 0.04, 10), M('#d9dde6'), 0, 0.14, 0, can);
      mesh(cyl(0.012, 0.012, 0.03, 6), M('#1d1b26'), 0, 0.17, 0, can);
      can.rotation.x = Math.PI / 2;
      can.visible = false;
      const shoe = (a, b) => {
        const g = grp(0, 0, 0);
        mesh(rbox(0.22, 0.16, 0.38, 0.72), M(a), 0, -0.03, -0.07, g);
        mesh(rbox(0.24, 0.07, 0.4, 0.75), M('#ffffff'), 0, -0.11, -0.07, g);
        mesh(rbox(0.2, 0.09, 0.12, 0.8), M('#ffffff'), 0, -0.05, -0.22, g);
        mesh(rbox(0.16, 0.09, 0.14, 0.8), M(b), 0, 0.03, 0.04, g);
        for (let k = 0; k < 3; k++) mesh(rbox(0.12, 0.018, 0.025, 0.8), M('#ffffff'), 0, 0.04 - k * 0.012, -0.08 - k * 0.05, g);
        return g;
      };
      const legR = limb(pelvis, 0.13, -0.02, 0.38, 0.35, 0.13, 0.12, P.pants, P.pants, null, null, null, 1.18);
      const legL = limb(pelvis, -0.13, -0.02, 0.38, 0.35, 0.13, 0.12, P.pants, P.pants, null, null, null, 1.18);
      for (const lg of [legR, legL]) mesh(cyl(0.15, 0.15, 0.06, 12), M(shade(P.pants, 0.15)), 0, 0.05, 0, lg.end);
      legR.end.add(shoe(P.shoeA, P.shoeB)); legL.end.add(shoe(P.shoeA, P.shoeB));
      const board = grp(0, 0.06, 0, root);
      mesh(rbox(0.66, 0.08, 1.6, 0.35), M('#ff4fa3'), 0, 0, 0, board);
      mesh(rbox(0.56, 0.03, 1.42, 0.35), M('#ffd23f'), 0, 0.045, 0, board);
      mesh(rbox(0.3, 0.032, 0.5, 0.35), M('#3ad1ff'), 0, 0.05, -0.2, board);
      mesh(rbox(0.5, 0.05, 1.3, 0.4), M('#7afcff', { emissive: new THREE.Color('#3ad1ff') }), 0, -0.06, 0, board);
      board.visible = false;
      const jet = grp(0, 0.26, 0.2, torso);
      for (const s of [-1, 1]) {
        mesh(cyl(0.1, 0.1, 0.42, 12), M('#7cd23a'), s * 0.12, 0.25, 0, jet);
        mesh(ball(0.1, 10), M('#ff8a1a'), s * 0.12, 0.27, 0, jet);
        mesh(cyl(0.06, 0.09, 0.1, 10), M('#9aa0aa'), s * 0.12, -0.17, 0, jet);
        const fl = mesh(G('flame', () => { const g = new THREE.ConeGeometry(0.09, 0.5, 8); g.rotateX(Math.PI); g.translate(0, -0.25, 0); return g; }), M('#ffb31a', { emissive: new THREE.Color('#ff7a1a') }), s * 0.12, -0.27, 0, jet);
        fl.name = 'fl';
      }
      mesh(rbox(0.12, 0.3, 0.1), M('#c9ccd2'), 0, 0.12, 0, jet);
      jet.visible = false;
      const R = { root, body, spin, pelvis, torso, neck, head, armL, armR, legL, legR, board, jet, can, ph: 0, lean: 0 };
      return R;
    }

    function guard() {
      const root = new THREE.Group();
      const body = grp(0, 0, 0, root);
      const pelvis = grp(0, 0.72, 0, body);
      const ol = '#7c8a3a', ol2 = '#5f6c2c', skin = '#e8a77c';
      mesh(rbox(0.7, 0.34, 0.54, 0.78), M(ol2), 0, 0, 0, pelvis);
      mesh(rbox(0.72, 0.08, 0.56, 0.8), M('#3a2a1e'), 0, 0.14, 0, pelvis);
      mesh(rbox(0.13, 0.09, 0.04, 0.8), M('#ffd23f'), 0, 0.14, -0.28, pelvis);
      const torso = grp(0, 0.06, 0, pelvis);
      mesh(rbox(0.86, 0.72, 0.66, 0.74), M(ol), 0, 0.34, 0, torso);
      mesh(ball(0.4, 18), M(ol), 0, 0.2, -0.16, torso, 1.08, 0.95, 1);
      for (let k = 0; k < 3; k++) mesh(ball(0.03, 8), M('#ffd23f'), 0, 0.44 - k * 0.16, -0.5 + Math.abs(k - 1) * 0.05, torso);
      for (const sx of [-1, 1]) { mesh(rbox(0.2, 0.14, 0.05, 0.8), M(ol2), sx * 0.22, 0.52, -0.33, torso); mesh(rbox(0.24, 0.08, 0.26, 0.8), M(ol2), sx * 0.4, 0.68, 0, torso); }
      mesh(rbox(0.12, 0.14, 0.04, 0.8), M('#ffd23f'), -0.22, 0.42, -0.36, torso);
      mesh(rbox(0.3, 0.12, 0.08, 0.8), M('#e8d9b0'), 0, 0.7, -0.24, torso);
      const neck = grp(0, 0.72, 0, torso);
      const head = grp(0, 0, 0, neck);
      head.scale.setScalar(1.1);
      mesh(rbox(0.48, 0.46, 0.46, 0.84), M(skin), 0, 0.2, 0, head);
      mesh(ball(0.17, 12), M(skin), 0, 0.06, -0.06, head, 1.45, 0.8, 1.15);
      mesh(ball(0.085, 12), M('#d98a66'), 0, 0.18, -0.245, head, 1, 0.95, 1);
      const mu = mesh(rbox(0.34, 0.08, 0.1, 0.7), M('#3a2416'), 0, 0.1, -0.23, head); mu.rotation.x = 0.1;
      for (const sx of [-1, 1]) { const m2 = mesh(rbox(0.14, 0.07, 0.08, 0.7), M('#3a2416'), sx * 0.17, 0.07, -0.21, head); m2.rotation.z = sx * 0.5; }
      for (const sx of [-1, 1]) { mesh(ball(0.042, 10), M('#ffffff'), sx * 0.09, 0.27, -0.2, head, 1, 1.15, 0.6); mesh(ball(0.022, 8), M('#1d1b26'), sx * 0.09, 0.27, -0.225, head); const br = mesh(rbox(0.14, 0.045, 0.04, 0.8), M('#3a2416'), sx * 0.09, 0.335, -0.205, head); br.rotation.z = sx * 0.3; mesh(ball(0.065, 10), M(skin), sx * 0.24, 0.2, 0, head, 0.55, 1, 0.9); }
      mesh(cyl(0.27, 0.25, 0.14, 20), M(ol), 0, 0.46, 0.01, head);
      mesh(rbox(0.6, 0.13, 0.58, 0.85), M(ol), 0, 0.55, 0.02, head);
      mesh(cyl(0.272, 0.272, 0.05, 20), M('#3a2a1e'), 0, 0.38, 0.01, head);
      const vz = mesh(rbox(0.4, 0.04, 0.22, 0.8), M('#16140f'), 0, 0.36, -0.25, head); vz.rotation.x = -0.18;
      mesh(rbox(0.12, 0.1, 0.03, 0.8), M('#ffd23f'), 0, 0.5, -0.29, head);
      const handG = ball(0.11, 12), handM = M(skin);
      const armR = limb(torso, 0.5, 0.58, 0.3, 0.27, 0.12, 0.11, ol, ol, handG, handM, [0, -0.03, 0]);
      const armL = limb(torso, -0.5, 0.58, 0.3, 0.27, 0.12, 0.11, ol, ol, handG, handM, [0, -0.03, 0]);
      const boot = () => { const g = grp(0, 0, 0); mesh(rbox(0.24, 0.16, 0.38, 0.75), M('#3a2416'), 0, -0.03, -0.07, g); mesh(rbox(0.26, 0.05, 0.4, 0.8), M('#22160e'), 0, -0.1, -0.07, g); return g; };
      const legR = limb(pelvis, 0.18, -0.04, 0.32, 0.3, 0.15, 0.13, ol2, ol2, null, null, null, 1.05);
      const legL = limb(pelvis, -0.18, -0.04, 0.32, 0.3, 0.15, 0.13, ol2, ol2, null, null, null, 1.05);
      legR.end.add(boot()); legL.end.add(boot());
      return { root, body, pelvis, torso, head, neck, armL, armR, legL, legR, ph: 0 };
    }

    function dog() {
      const root = new THREE.Group();
      const body = grp(0, 0.52, 0, root);
      const c = '#d9b07a', c2 = '#a87a4a', cream = '#f6ead2';
      mesh(rbox(0.36, 0.36, 0.82, 0.8), M(c), 0, 0, 0, body);
      mesh(rbox(0.3, 0.2, 0.56, 0.8), M(cream), 0, -0.1, -0.06, body);
      mesh(ball(0.2, 14), M(c), 0, 0.04, -0.3, body, 1, 1.05, 1);
      const col = mesh(G('collar', () => new THREE.TorusGeometry(0.15, 0.03, 6, 16)), M('#e8323a'), 0, 0.14, -0.4, body); col.rotation.x = 1.1;
      mesh(ball(0.035, 8), M('#ffd23f'), 0, 0.04, -0.52, body);
      const head = grp(0, 0.22, -0.46, body);
      mesh(rbox(0.32, 0.3, 0.32, 0.85), M(c), 0, 0.06, 0, head);
      mesh(rbox(0.2, 0.16, 0.24, 0.85), M(cream), 0, -0.02, -0.2, head);
      mesh(ball(0.05, 10), M('#1d1b26'), 0, 0.04, -0.33, head, 1.2, 0.9, 1);
      for (const sx of [-1, 1]) { mesh(ball(0.035, 8), M('#ffffff'), sx * 0.08, 0.13, -0.15, head); mesh(ball(0.022, 6), M('#1d1b26'), sx * 0.08, 0.13, -0.175, head); const e = mesh(rbox(0.1, 0.22, 0.14, 0.85), M(c2), sx * 0.16, 0.06, 0.04, head); e.rotation.z = sx * 0.35; }
      mesh(rbox(0.08, 0.03, 0.12, 0.85), M('#ff6a8a'), 0, -0.1, -0.27, head);
      const tail = grp(0, 0.12, 0.4, body);
      mesh(cyl(0.05, 0.03, 0.36, 8), M(c2), 0, 0, 0, tail); mesh(ball(0.05, 8), M(cream), 0, -0.36, 0, tail);
      tail.rotation.x = -2.3;
      const legs = [];
      for (const [x, z] of [[-0.12, -0.28], [0.12, -0.28], [-0.12, 0.28], [0.12, 0.28]]) {
        const l = grp(x, -0.08, z, body);
        mesh(ball(0.08, 10), M(c), 0, 0, 0, l);
        mesh(cyl(0.07, 0.055, 0.42, 10), M(c), 0, 0, 0, l);
        mesh(ball(0.07, 10), M(cream), 0, -0.43, -0.03, l, 1, 0.7, 1.3);
        legs.push(l);
      }
      return { root, body, head, tail, legs, ph: 0 };
    }

    function hoverboardModel() {
      const g = new THREE.Group();
      mesh(rbox(0.66, 0.08, 1.6, 0.35), M('#ff4fa3'), 0, 0, 0, g);
      mesh(rbox(0.56, 0.03, 1.42, 0.35), M('#ffd23f'), 0, 0.045, 0, g);
      return g;
    }

    function animHero(R, st, dt, t) {
      const L = R.legL, Rr = R.legR, AL = R.armL, AR = R.armR;
      const sp = st.speed || 0;
      if (st.mode === 'run' || st.mode === 'board') R.ph += dt * TAU * (1.55 + sp * 0.05);
      const ph = R.ph, s = Math.sin(ph), c = Math.cos(ph);
      let lL = 0, lR = 0, kL = 0, kR = 0, aL = 0, aR = 0, eL = 0.3, eR = 0.3, tor = 0, tw = 0, bob = 0, hx = 0, spinX = 0, spinY = 0.55, pelY = 0.33, lz = 0, lzr = 0, azL = 0.12, azR = -0.12, hy = 0;
      if (st.mode === 'run') {
        lL = 0.95 * s; lR = -0.95 * s;
        kL = -0.15 - 1.45 * Math.max(0, c); kR = -0.15 - 1.45 * Math.max(0, -c);
        aL = -0.85 * s; aR = 0.85 * s; eL = 1.25 + 0.25 * s; eR = 1.25 - 0.25 * s;
        tor = -0.28; tw = 0.18 * s; bob = 0.06 * Math.abs(c); hx = 0.12;
      } else if (st.mode === 'idle') {
        const b = Math.sin(t * 2.1);
        lL = 0.05; lR = -0.12; kL = -0.08; kR = -0.2; aL = 0.1 + 0.03 * b; aR = st.spray ? 1.5 + 0.1 * Math.sin(t * 9) : 0.35; eL = 0.25; eR = st.spray ? 0.25 : 1.2; azR = st.spray ? -0.25 : -0.15;
        tor = 0.02 * b; tw = st.spray ? -0.25 : 0.12; hy = Math.sin(t * 0.7) * 0.35 + (st.spray ? -0.4 : 0); bob = 0.012 * b; hx = -0.05;
      } else if (st.mode === 'board') {
        lL = 0.35 + 0.08 * s; lR = -0.25 - 0.08 * s; kL = -0.7; kR = -0.6; aL = 0.4; aR = -0.2; eL = 0.6; eR = 0.8; azL = 1.0; azR = -1.0; tor = -0.15; bob = 0.03 * s; tw = 0.0; pelY = 0.2;
      } else if (st.mode === 'jet') {
        lL = 0.25 + 0.1 * Math.sin(t * 6); lR = -0.15 - 0.1 * Math.sin(t * 6); kL = -0.7; kR = -0.9; aL = 0.9; aR = 0.9; eL = 1.6; eR = 1.6; azL = 0.25; azR = -0.25; tor = -0.55; hx = 0.4;
      } else if (st.mode === 'dead') {
        lL = 0.5; lR = 0.2; kL = -0.6; kR = -0.3; aL = 2.4; aR = 2.6; eL = 0.3; eR = 0.3; azL = 0.9; azR = -0.9; tor = 0.25; hx = -0.3;
      } else if (st.mode === 'caught') {
        lL = 0.1; lR = -0.1; kL = -0.1; kR = -0.1; aL = 0.3; aR = 0.3; eL = 1.6; eR = 1.6; azL = 0.5; azR = -0.5; tor = 0.15; hx = -0.2; hy = 0.5 * Math.sin(t * 3);
      }
      const w = st.air || 0;
      if (w > 0 && st.mode !== 'jet' && st.mode !== 'board') {
        const up = st.vy > 0 ? 1 : 0.6;
        lL = lerp(lL, 0.9 * up + 0.2, w); kL = lerp(kL, -1.7, w); lR = lerp(lR, -0.35, w); kR = lerp(kR, -1.0, w);
        aL = lerp(aL, 2.5, w); aR = lerp(aR, -0.6, w); eL = lerp(eL, 0.4, w); eR = lerp(eR, 0.9, w); azL = lerp(azL, 0.45, w); azR = lerp(azR, -0.5, w);
        tor = lerp(tor, -0.1, w); bob = lerp(bob, 0, w);
      } else if (w > 0 && st.mode === 'board') { kL = lerp(kL, -1.3, w); kR = lerp(kR, -1.2, w); lL = lerp(lL, 0.8, w); lR = lerp(lR, 0.2, w); }
      const r = st.roll || 0;
      if (r > 0) {
        const k = Math.min(1, Math.min(r, 1 - st.rollP) * 6 + (st.rollP < 1 ? 0.0 : 0));
        lL = lerp(lL, 2.0, k); lR = lerp(lR, 2.0, k); kL = lerp(kL, -2.4, k); kR = lerp(kR, -2.4, k);
        aL = lerp(aL, 1.3, k); aR = lerp(aR, 1.3, k); eL = lerp(eL, 1.9, k); eR = lerp(eL, 1.9, k); azL = lerp(azL, 0.2, k); azR = lerp(azR, -0.2, k);
        tor = lerp(tor, -0.75, k); hx = lerp(hx, 0.5, k);
        spinX = -TAU * ease(clamp(st.rollP, 0, 1)); spinY = lerp(0.55, 0.42, k); pelY = lerp(pelY, 0.12, k); bob = 0;
      }
      if (st.stumble > 0) { const q = st.stumble; tor += 0.5 * q; aL += 1.6 * q * Math.sin(t * 30); aR += 1.6 * q * Math.cos(t * 30); hy += 0.4 * q * Math.sin(t * 25); }
      R.legL.top.rotation.x = lL; R.legR.top.rotation.x = lR; R.legL.mid.rotation.x = kL; R.legR.mid.rotation.x = kR;
      R.legL.end.rotation.x = -0.25 * Math.max(0, -kL - 0.6); R.legR.end.rotation.x = -0.25 * Math.max(0, -kR - 0.6);
      R.legL.top.rotation.z = st.mode === 'board' ? -0.22 : -0.04; R.legR.top.rotation.z = st.mode === 'board' ? 0.22 : 0.04;
      R.armL.top.rotation.x = aL; R.armR.top.rotation.x = aR; R.armL.mid.rotation.x = eL; R.armR.mid.rotation.x = eR;
      R.armL.top.rotation.z = -azL; R.armR.top.rotation.z = -azR;
      R.torso.rotation.x = tor; R.torso.rotation.y = tw; R.head.rotation.x = hx; R.head.rotation.y = hy;
      R.spin.rotation.x = spinX; R.spin.position.y = spinY; R.pelvis.position.y = pelY + bob;
      R.body.rotation.z = st.leanZ || 0; R.body.rotation.x = st.mode === 'dead' ? -st.deadT * 0 : 0;
      R.board.visible = st.mode === 'board';
      R.board.rotation.z = st.mode === 'board' ? 0.06 * Math.sin(t * 5) : 0;
      R.board.position.y = st.mode === 'board' ? 0.1 + 0.04 * Math.sin(t * 6) : 0.06;
      R.body.position.y = st.mode === 'board' ? 0.16 + 0.04 * Math.sin(t * 6) : 0;
      R.body.rotation.y = st.mode === 'board' ? 0.55 : 0;
      R.jet.visible = st.mode === 'jet';
      if (R.jet.visible) for (const ch of R.jet.children) if (ch.name === 'fl') ch.scale.set(0.8, 0.5 + 0.35 * Math.random(), 0.8);
      R.can.visible = !!st.can;
    }
    function animGuard(Gd, sp, dt, t, mode) {
      if (mode === 'run') Gd.ph += dt * TAU * (1.7 + sp * 0.05);
      const s = Math.sin(Gd.ph), c = Math.cos(Gd.ph);
      if (mode === 'run') {
        Gd.legL.top.rotation.x = 0.8 * s; Gd.legR.top.rotation.x = -0.8 * s;
        Gd.legL.mid.rotation.x = -0.2 - 1.2 * Math.max(0, c); Gd.legR.mid.rotation.x = -0.2 - 1.2 * Math.max(0, -c);
        Gd.armL.top.rotation.x = -0.8 * s; Gd.armR.top.rotation.x = 0.8 * s + (Gd.grab ? 1.2 : 0);
        Gd.armL.mid.rotation.x = 1.2; Gd.armR.mid.rotation.x = 1.2;
        Gd.armL.top.rotation.z = 0.35; Gd.armR.top.rotation.z = -0.35;
        Gd.torso.rotation.x = -0.2; Gd.pelvis.position.y = 0.72 + 0.06 * Math.abs(c);
        Gd.head.rotation.y = 0;
      } else {
        Gd.legL.top.rotation.x = 0; Gd.legR.top.rotation.x = 0; Gd.legL.mid.rotation.x = 0; Gd.legR.mid.rotation.x = 0;
        Gd.armR.top.rotation.x = 1.9 + 0.2 * Math.sin(t * 8); Gd.armR.mid.rotation.x = 0.4; Gd.armL.top.rotation.x = 0.2; Gd.armL.top.rotation.z = 0.5; Gd.armL.mid.rotation.x = 1.6;
        Gd.torso.rotation.x = 0.05; Gd.pelvis.position.y = 0.72; Gd.head.rotation.y = 0.3 * Math.sin(t * 4);
      }
    }
    function animDog(D, sp, dt, t, mode) {
      if (mode === 'run') D.ph += dt * TAU * (2.2 + sp * 0.06);
      const s = Math.sin(D.ph), c = Math.cos(D.ph);
      if (mode === 'run') {
        D.legs[0].rotation.x = 0.9 * s; D.legs[1].rotation.x = 0.9 * Math.sin(D.ph + 0.4);
        D.legs[2].rotation.x = -0.9 * s; D.legs[3].rotation.x = -0.9 * Math.sin(D.ph + 0.4);
        D.body.position.y = 0.52 + 0.08 * Math.abs(c); D.body.rotation.x = 0.12 * c;
        D.tail.rotation.x = -2.0 + 0.3 * s; D.head.rotation.x = -0.1 * c;
      } else {
        for (const l of D.legs) l.rotation.x = 0;
        D.body.position.y = 0.52 + 0.12 * Math.abs(Math.sin(t * 9)); D.tail.rotation.x = -2.3; D.tail.rotation.z = 0.6 * Math.sin(t * 14); D.head.rotation.x = -0.3;
      }
    }
    return { hero, guard, dog, hoverboardModel, animHero, animGuard, animDog, M, G, rbox, mesh, grp, ball, cyl };
  }
