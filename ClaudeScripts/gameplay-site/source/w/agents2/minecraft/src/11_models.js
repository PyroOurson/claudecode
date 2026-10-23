    const BIPED = (arms, legs, tw, th, layers, slim) => {
      const aw = slim ? 3 : arms;
      const P = [
        { n: 'body', pv: [0, 0, 0], b: [[-4, 0, -2, 8, 12, 4, 16, 16]].concat(layers ? [[-4, 0, -2, 8, 12, 4, 16, 32, .25]] : []) },
        { n: 'head', pv: [0, 0, 0], b: [[-4, -8, -4, 8, 8, 8, 0, 0], [-4, -8, -4, 8, 8, 8, 32, 0, .5]] },
        { n: 'rarm', pv: [-5, 2, 0], b: [[arms === 2 ? -1 : -aw + 1 - (slim ? 0 : 0) - (arms === 2 ? 0 : 2), -2, arms === 2 ? -1 : -2, arms === 2 ? 2 : aw, 12, arms === 2 ? 2 : 4, 40, 16]].concat(layers ? [[-aw + 1 - 2, -2, -2, aw, 12, 4, 40, 32, .25]] : []) },
        { n: 'larm', pv: [5, 2, 0], b: [[-1, -2, arms === 2 ? -1 : -2, arms === 2 ? 2 : aw, 12, arms === 2 ? 2 : 4, th === 64 && layers !== 2 ? 32 : 40, th === 64 && layers !== 2 ? 48 : 16, 0, th !== 64]].concat(layers ? [[-1, -2, -2, aw, 12, 4, 48, 48, .25]] : []) },
        { n: 'rleg', pv: [legs === 2 ? -2 : -1.9, 12, 0], b: [[legs === 2 ? -1 : -2, 0, legs === 2 ? -1 : -2, legs === 2 ? 2 : 4, 12, legs === 2 ? 2 : 4, 0, 16]].concat(layers ? [[-2, 0, -2, 4, 12, 4, 0, 32, .25]] : []) },
        { n: 'lleg', pv: [legs === 2 ? 2 : 1.9, 12, 0], b: [[legs === 2 ? -1 : -2, 0, legs === 2 ? -1 : -2, legs === 2 ? 2 : 4, 12, legs === 2 ? 2 : 4, th === 64 && layers !== 2 ? 16 : 0, th === 64 && layers !== 2 ? 48 : 16, 0, th !== 64]].concat(layers ? [[-2, 0, -2, 4, 12, 4, 0, 48, .25]] : []) }
      ];
      return { tw, th, parts: P, y0: 24 };
    };
    const MDL = {
      pig: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 12, -6], b: [[-4, -4, -8, 8, 8, 8, 0, 0], [-2, 0, -9, 4, 3, 1, 16, 16]] }, { n: 'body', pv: [0, 11, 2], r: [Math.PI / 2, 0, 0], b: [[-5, -10, -7, 10, 16, 8, 28, 8]] }, { n: 'leg0', pv: [-3, 18, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg1', pv: [3, 18, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg2', pv: [-3, 18, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg3', pv: [3, 18, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }] },
      cow: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 4, -8], b: [[-4, -4, -6, 8, 8, 6, 0, 0], [-5, -5, -4, 1, 3, 1, 22, 0], [4, -5, -4, 1, 3, 1, 22, 0]] }, { n: 'body', pv: [0, 5, 2], r: [Math.PI / 2, 0, 0], b: [[-6, -10, -7, 12, 18, 10, 18, 4], [-2, 2, -8, 4, 6, 1, 52, 0]] }, { n: 'leg0', pv: [-4, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg1', pv: [4, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg2', pv: [-4, 12, -6], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg3', pv: [4, 12, -6], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }] },
      sheep: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 6, -8], b: [[-3, -4, -6, 6, 6, 8, 0, 0]] }, { n: 'body', pv: [0, 5, 2], r: [Math.PI / 2, 0, 0], b: [[-4, -10, -7, 8, 16, 6, 28, 8]] }, { n: 'leg0', pv: [-3, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg1', pv: [3, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg2', pv: [-3, 12, -5], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg3', pv: [3, 12, -5], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }] },
      sheep_wool: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 6, -8], b: [[-3, -4, -4, 6, 6, 6, 0, 0, .6]] }, { n: 'body', pv: [0, 5, 2], r: [Math.PI / 2, 0, 0], b: [[-4, -10, -7, 8, 16, 6, 28, 8, 1.75]] }, { n: 'leg0', pv: [-3, 12, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }, { n: 'leg1', pv: [3, 12, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }, { n: 'leg2', pv: [-3, 12, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }, { n: 'leg3', pv: [3, 12, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }] },
      chicken: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 15, -4], b: [[-2, -6, -2, 4, 6, 3, 0, 0], [-2, -4, -4, 4, 2, 2, 14, 0], [-1, -2, -3, 2, 2, 2, 14, 4]] }, { n: 'body', pv: [0, 16, 0], r: [Math.PI / 2, 0, 0], b: [[-3, -4, -3, 6, 8, 6, 0, 9]] }, { n: 'leg0', pv: [-2, 19, 1], b: [[-1, 0, -3, 3, 5, 3, 26, 0]] }, { n: 'leg1', pv: [1, 19, 1], b: [[-1, 0, -3, 3, 5, 3, 26, 0]] }, { n: 'wing0', pv: [-4, 13, 0], b: [[0, 0, -3, 1, 4, 6, 24, 13]] }, { n: 'wing1', pv: [4, 13, 0], b: [[-1, 0, -3, 1, 4, 6, 24, 13]] }] },
      creeper: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 6, 0], b: [[-4, -8, -4, 8, 8, 8, 0, 0]] }, { n: 'body', pv: [0, 6, 0], b: [[-4, 0, -2, 8, 12, 4, 16, 16]] }, { n: 'leg0', pv: [-2, 18, 4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg1', pv: [2, 18, 4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg2', pv: [-2, 18, -4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg3', pv: [2, 18, -4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }] },
      spider: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 15, -3], b: [[-4, -4, -8, 8, 8, 8, 32, 4]] }, { n: 'neck', pv: [0, 15, 0], b: [[-3, -3, -3, 6, 6, 6, 0, 0]] }, { n: 'body', pv: [0, 15, 9], b: [[-5, -4, -6, 10, 8, 12, 0, 12]] }].concat([0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ n: 'leg' + i, pv: [i & 1 ? 4 : -4, 15, 2 - (i >> 1)], b: [[i & 1 ? -1 : -15, -1, -1, 16, 2, 2, 18, 0]] }))) },
      enderman: { tw: 64, th: 32, y0: 24, parts: [{ n: 'body', pv: [0, -14, 0], b: [[-4, 0, -2, 8, 12, 4, 32, 16]] }, { n: 'head', pv: [0, -14, 0], b: [[-4, -8, -4, 8, 8, 8, 0, 0]] }, { n: 'rarm', pv: [-3, -12, 0], b: [[-1, -2, -1, 2, 30, 2, 56, 0]] }, { n: 'larm', pv: [5, -12, 0], b: [[-1, -2, -1, 2, 30, 2, 56, 0, 0, 1]] }, { n: 'rleg', pv: [-2, -2, 0], b: [[-1, 0, -1, 2, 30, 2, 56, 0]] }, { n: 'lleg', pv: [2, -2, 0], b: [[-1, 0, -1, 2, 30, 2, 56, 0, 0, 1]] }] },
      slime: { tw: 64, th: 32, parts: [{ n: 'body', pv: [0, 16, 0], b: [[-3, 3, -3, 6, 6, 6, 0, 16], [-3.3, 1, -3.5, 2, 2, 2, 32, 0], [1.3, 1, -3.5, 2, 2, 2, 32, 4], [0, 5, -3.5, 1, 1, 1, 32, 8]] }, { n: 'outer', pv: [0, 16, 0], b: [[-4, 0, -4, 8, 8, 8, 0, 0]] }] },
      zombie: BIPED(4, 4, 64, 64, 1), skeleton: BIPED(2, 2, 64, 32, 0), steve: BIPED(4, 4, 64, 64, 2), alex: BIPED(4, 4, 64, 64, 2, 1)
    };
    MDL.skeleton.parts[2].b = [[-1, -2, -1, 2, 12, 2, 40, 16]]; MDL.skeleton.parts[3].b = [[-1, -2, -1, 2, 12, 2, 40, 16, 0, 1]];
    MDL.skeleton.parts[4].b = [[-1, 0, -1, 2, 12, 2, 0, 16]]; MDL.skeleton.parts[5].b = [[-1, 0, -1, 2, 12, 2, 0, 16, 0, 1]];
    MDL.zombie.parts[2].b = [[-3, -2, -2, 4, 12, 4, 40, 16]]; MDL.zombie.parts[3].b = [[-1, -2, -2, 4, 12, 4, 32, 48]];
    MDL.zombie.parts[4].b = [[-2, 0, -2, 4, 12, 4, 0, 16]]; MDL.zombie.parts[5].b = [[-2, 0, -2, 4, 12, 4, 16, 48]];
    MDL.zombie.parts[0].b = [[-4, 0, -2, 8, 12, 4, 16, 16]];
    for (const k of ['steve', 'alex']) { const sl = k === 'alex', aw = sl ? 3 : 4; MDL[k].parts[2].b = [[-aw + 1, -2, -2, aw, 12, 4, 40, 16], [-aw + 1, -2, -2, aw, 12, 4, 40, 32, .25]]; MDL[k].parts[3].b = [[-1, -2, -2, aw, 12, 4, 32, 48], [-1, -2, -2, aw, 12, 4, 48, 48, .25]]; MDL[k].parts[2].pv = [-5, sl ? 2.5 : 2, 0]; MDL[k].parts[3].pv = [5, sl ? 2.5 : 2, 0]; }
    function boxGeo(B, tw, th, PZ) {
      const [x0, y0, z0, w, h, d, u, v, inf, mir] = B, I2 = inf || 0;
      const X0 = -(x0 - I2), X1 = -(x0 + w + I2), Y0 = -(y0 - I2), Y1 = -(y0 + h + I2), Z0 = z0 - I2, Z1 = z0 + d + I2;
      const xa = Math.min(X0, X1), xb = Math.max(X0, X1), ya = Math.min(Y0, Y1), yb = Math.max(Y0, Y1);
      const pos = [], uv = [], col = [];
      const R = (uu, vv, ww, hh) => [uu / tw, vv / th, (uu + ww) / tw, (vv + hh) / th];
      const faces = [
        [[xb, ya, Z1], [xb, ya, Z0], [xb, yb, Z0], [xb, yb, Z1], R(u, v + d, d, h), .76],
        [[xa, ya, Z0], [xa, ya, Z1], [xa, yb, Z1], [xa, yb, Z0], R(u + d + w, v + d, d, h), .76],
        [[xb, yb, Z0], [xa, yb, Z0], [xa, yb, Z1], [xb, yb, Z1], R(u + d, v, w, d), 1],
        [[xb, ya, Z1], [xa, ya, Z1], [xa, ya, Z0], [xb, ya, Z0], R(u + d + w, v, w, d), .5],
        [[xa, ya, Z1], [xb, ya, Z1], [xb, yb, Z1], [xa, yb, Z1], R(u + 2 * d + w, v + d, w, h), .82],
        [[xb, ya, Z0], [xa, ya, Z0], [xa, yb, Z0], [xb, yb, Z0], R(u + d, v + d, w, h), .9]
      ];
      if (mir) { const t = faces[0][4]; faces[0][4] = faces[1][4]; faces[1][4] = t; for (const f of faces) { const r = f[4]; f[4] = [r[2], r[1], r[0], r[3]]; } }
      for (const [a, b, c, dd, r, sh] of faces) {
        for (const p of [a, b, c, a, c, dd]) pos.push(p[0] / 16, p[1] / 16, p[2] / 16);
        const top = r[1], bot = r[3], l = r[0], rr2 = r[2];
        const isTop = sh === 1 || sh === .5;
        const UVs = isTop ? [[l, bot], [rr2, bot], [rr2, top], [l, top]] : [[l, bot], [rr2, bot], [rr2, top], [l, top]];
        const o = [0, 1, 2, 0, 2, 3];
        for (const k of o) uv.push(UVs[k][0], 1 - UVs[k][1]);
        for (let k = 0; k < 6; k++) col.push(sh, sh, sh);
      }
      return { pos, uv, col };
    }
    function buildModel(name) {
      const M = MDL[name], geo = {};
      for (const p of M.parts) {
        const pos = [], uv = [], col = [];
        for (const B of p.b) { const g2 = boxGeo(B, M.tw, M.th); pos.push(...g2.pos); uv.push(...g2.uv); col.push(...g2.col); }
        const gq = new THREE.BufferGeometry();
        gq.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gq.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gq.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        gq.computeBoundingSphere();
        geo[p.n] = keep(gq);
      }
      return geo;
    }
    const MGEO = {};
    function instModel(name, mat) {
      const M = MDL[name], geo = MGEO[name] || (MGEO[name] = buildModel(name)), root = new THREE.Group(), parts = {};
      const y0 = M.y0 ?? 24;
      for (const p of M.parts) {
        const piv = new THREE.Group(), m = new THREE.Mesh(geo[p.n], mat);
        piv.position.set(-p.pv[0] / 16, (y0 - p.pv[1]) / 16, p.pv[2] / 16);
        if (p.r) piv.rotation.set(-p.r[0], -p.r[1], p.r[2]);
        piv.userData.r0 = p.r ? [-p.r[0], -p.r[1], p.r[2]] : [0, 0, 0];
        piv.add(m); root.add(piv); parts[p.n] = piv;
      }
      return { root, parts };
    }
    const SKINS = {};
    const SKC = (t, f) => { const c = cv(64, MDL[t] ? MDL[t].th : 64), x = c.getContext('2d'); f(x, c); return tex(c, false, false); };
    function paintSkin(name, painter, th) {
      const M = MDL[name.split(':')[0]] || MDL[name], c = cv(M.tw, th || M.th), x = c.getContext('2d');
      const R = rng(hstr(name));
      const FS = { top: 1.05, bottom: .7, front: 1, back: .9, r: .94, l: .9 };
      for (const p of M.parts) for (const B of p.b) {
        const [, , , w, h, d, u, v] = B;
        const rects = { r: [u, v + d, d, h], front: [u + d, v + d, w, h], l: [u + d + w, v + d, d, h], back: [u + 2 * d + w, v + d, w, h], top: [u + d, v, w, d], bottom: [u + d + w, v, w, d] };
        for (const f in rects) { const [rx, ry, rw, rh] = rects[f]; for (let py = 0; py < rh; py++) for (let px = 0; px < rw; px++) { const cc = painter(p.n, f, px, py, rw, rh, B); if (!cc) continue; const k = cc[3] === 2 ? 1 : FS[f] * (.96 + R() * .06); x.fillStyle = cc[3] === 0 ? 'rgba(0,0,0,0)' : `rgb(${Math.min(255, cc[0] * k) | 0},${Math.min(255, cc[1] * k) | 0},${Math.min(255, cc[2] * k) | 0})`; x.fillRect(rx + px, ry + py, 1, 1); } }
      }
      return c;
    }
    const mk = (cc, k) => [cc[0] * k, cc[1] * k, cc[2] * k];
    const vn2 = (px, py, p, s) => sn(px * 16 / p, py * 16 / p, 1, s);
    const PAINTERS = {
      pig: (part, f, px, py, fw, fh, B) => {
        const PINK = [240, 164, 164], PINKD = [214, 128, 134], PINKL = [250, 192, 190], h = hash3(px, py, f.length * 17 + part.length);
        if (part === 'head' && B[3] === 4) { if (f === 'front') return py === 1 && (px === 1 || px === 2) ? [110, 50, 56, 2] : mk([236, 140, 146], py === 0 ? 1.06 : .96); return mk([232, 136, 142], .94 + h * .06); }
        if (part === 'head') { if (f === 'front') { if (py === 3 && (px === 1 || px === 6)) return [240, 240, 244, 2]; if (py === 3 && (px === 2 || px === 5)) return [26, 18, 28, 2]; if (py === 2 && (px === 1 || px === 2 || px === 5 || px === 6)) return mk(PINKD, .98); if (py === 7) return mk(PINKD, .96); return mk(PINK, .96 + h * .07); } return mk(PINK, .93 + h * .08); }
        if (part.startsWith('leg')) { if (f === 'bottom') return [118, 78, 70]; if (py >= fh - 2) return mk([126, 82, 76], py === fh - 1 ? .9 : 1.04); return mk(PINK, .95 + h * .07); }
        if (f === 'bottom') return mk(PINKL, .92);
        return mk(vn2(px, py, 5, 21) > .7 ? PINKD : PINK, .95 + h * .06);
      },
      cow: (part, f, px, py, fw, fh, B) => {
        const BL = [62, 48, 42], WH = [236, 234, 228], PK = [226, 176, 164], h = hash3(px, py, f.length * 19 + part.length * 5);
        if (part === 'head' && B[3] === 1) return mk([226, 216, 190], py === 0 ? 1.1 : .94);
        if (part === 'head') { if (f === 'front') { if (py === 3 && (px === 1 || px === 6)) return [14, 12, 14, 2]; if (py === 3 && (px === 0 || px === 7)) return [244, 244, 240, 2]; if (py >= 5) return mk(PK, py === 6 && (px === 2 || px === 5) ? .7 : .96); if (px >= 3 && px <= 4) return mk(WH, .97); return mk(BL, .9 + h * .2); } if (f === 'top') return mk(px >= 3 && px <= 4 ? WH : BL, .95 + h * .12); if (f === 'bottom') return mk(PK, .85); return mk(py >= 4 ? WH : BL, .92 + h * .12); }
        if (part === 'body' && B[4] === 6) return mk([238, 170, 168], .9 + h * .08);
        if (part.startsWith('leg')) { if (f === 'bottom') return [34, 28, 26]; if (py >= fh - 2) return mk([46, 38, 34], py === fh - 1 ? .8 : 1); return mk(vn2(px + part.length * 3, py, 4, 31) > .55 ? WH : BL, .94 + h * .1); }
        const wh = vn2(px + (f === 'back' ? 11 : f === 'l' ? 7 : f === 'r' ? 19 : f === 'top' ? 3 : 0), py, 5, 32) > .52;
        return wh ? mk(WH, .94 + h * .08) : mk(BL, .88 + h * .2);
      },
      sheep: (part, f, px, py, fw, fh) => { const S = [214, 182, 160], h = hash3(px, py, f.length * 7 + part.length); if (part === 'head') { if (f === 'front') { if (py === 2 && (px === 0 || px === 5)) return [230, 230, 230, 2]; if (py === 2 && (px === 1 || px === 4)) return [30, 26, 24, 2]; if (py === 4 && (px === 2 || px === 3)) return mk([180, 130, 120], 1); return mk(S, .95 + h * .06); } return mk(S, .9 + h * .08); } if (part.startsWith('leg')) { if (py >= fh - 2) return mk([110, 90, 80], 1); return mk(S, .92 + h * .06); } return mk([232, 232, 232], .92 + h * .08); },
      sheep_wool: (part, f, px, py, fw, fh) => { const h = hash3(px, py, f.length * 13 + part.length * 3); const v = vn2(px, py, 3, 41) * .5 + h * .5; return mk([255, 255, 255], .82 + v * .2 + ((px + py) % 3 === 0 ? .04 : 0)); },
      chicken: (part, f, px, py, fw, fh, B) => {
        const W2 = [236, 236, 236], h = hash3(px, py, f.length * 11 + part.length);
        if (part === 'head' && B[3] === 4 && B[4] === 2) return f === 'bottom' ? [196, 150, 30] : [250, 196, 40];
        if (part === 'head' && B[3] === 2) return [220, 30, 30];
        if (part === 'head') { if (f === 'front' && py === 2 && (px === 0 || px === 3)) return [30, 30, 30, 2]; return mk(W2, .95 + h * .06); }
        if (part.startsWith('leg')) { if (py < 2 && f !== 'bottom') return null; return [244, 180, 40]; }
        return mk(W2, .9 + h * .08 - (f === 'bottom' ? .05 : 0));
      },
      creeper: (part, f, px, py, fw, fh) => {
        const h = hash3(px, py, f.length * 23 + part.length * 7), v = vn2(px + part.length * 5, py + f.length * 3, 3, 51);
        const G = v > .66 ? [168, 220, 140] : v > .45 ? [90, 180, 70] : v > .28 ? [70, 150, 56] : [42, 104, 34];
        if (part === 'head' && f === 'front') { const D = [16, 20, 14, 2]; if ((py === 2 || py === 3) && (px === 1 || px === 2 || px === 5 || px === 6)) return D; if ((py === 4) && (px === 3 || px === 4)) return D; if (py === 5 && px >= 2 && px <= 5) return D; if (py === 6 && (px === 2 || px === 5)) return D; if (py === 6 && (px === 3 || px === 4)) return D; }
        if (part.startsWith('leg') && f === 'bottom') return [30, 60, 24];
        return mk(G, .92 + h * .1);
      },
      spider: (part, f, px, py, fw, fh) => {
        const h = hash3(px, py, f.length * 29 + part.length * 3), B2 = [52, 45, 39], D = [36, 31, 27];
        if (part === 'head' && f === 'front') { if ((py === 2 || py === 3) && (px === 1 || px === 2 || px === 5 || px === 6)) return [200, 20, 20, 2]; if (py === 1 && (px === 3 || px === 4)) return [220, 30, 30, 2]; if (py === 4 && (px === 0 || px === 7)) return [180, 18, 18, 2]; }
        if (part.startsWith('leg')) return mk(px % 3 === 0 ? D : B2, .9 + h * .14);
        if (part === 'body' && f === 'top') return mk(vn2(px, py, 3, 61) > .6 ? [80, 66, 56] : B2, .9 + h * .12);
        return mk(h < .2 ? D : B2, .92 + h * .1);
      },
      enderman: (part, f, px, py) => { const h = hash3(px, py, f.length * 31 + part.length); if (part === 'head' && f === 'front' && py === 4 && px >= 1 && px <= 6 && px !== 3 && px !== 4) return px === 1 || px === 6 ? [204, 0, 250, 2] : [230, 120, 255, 2]; return mk([22, 22, 22], .9 + h * .25); },
      slime: (part, f, px, py, fw, fh, B) => { if (part === 'outer') return [120, 200, 100, 1]; if (B[3] === 2) return [30, 60, 25, 2]; if (B[3] === 1) return [40, 80, 32, 2]; return [100, 180, 80]; }
    };
    PAINTERS.zombie = (part, f, px, py, fw, fh, B) => {
      if (B[8]) return null;
      const SK = [92, 142, 66], SKD = [66, 106, 48], HAIR = [52, 76, 40], SH = [30, 150, 150], SHD = [22, 120, 124], PA = [58, 60, 160], PAD = [44, 46, 126], SHOE = [62, 62, 70], h = hash3(px, py, f.length * 11 + part.length);
      if (part === 'head') { if (f === 'top') return mk(HAIR, .9 + h * .3); if (f === 'bottom') return SKD; if (f === 'back') return py < 4 ? mk(HAIR, .95 + h * .15) : mk(SK, .9 + h * .1); if (f === 'front') { if (py === 0 || (py === 1 && h < .45)) return mk(HAIR, .9 + h * .2); if (py === 4 && (px === 1 || px === 6)) return [20, 26, 20, 2]; if (py === 4 && (px === 2 || px === 5)) return [12, 16, 12, 2]; if (py === 5 && (px === 3 || px === 4)) return mk(SKD, .9); if (py === 6 && px >= 2 && px <= 5) return [28, 40, 28, 2]; return mk(SK, .93 + h * .1); } if (py < 2) return mk(HAIR, .95 + h * .15); return mk(SK, .92 + h * .1); }
      if (part === 'body') { if (f === 'top') return SH; if (f === 'bottom') return mk(PA, .9); if (py >= fh - 2) return mk(PA, 1); return mk(hash3(px >> 1, py >> 1, 7) < .13 ? SHD : SH, .94 + h * .1); }
      if (part.includes('arm')) { if (f === 'top') return SH; if (f === 'bottom') return [SK[0] * 1.2, SK[1] * 1.2, SK[2] * 1.2, 2]; if (py <= 3) return mk(h < .12 ? SHD : SH, .94 + h * .1); return mk(h < .08 ? SKD : SK, .92 + h * .12); }
      if (f === 'top') return PA; if (f === 'bottom') return mk(SHOE, .85); if (py >= fh - 3) return mk(SHOE, 1.1 - (py - fh + 3) * .12); return mk(h < .07 ? PAD : PA, .92 + h * .12);
    };
    PAINTERS.skeleton = (part, f, px, py, fw, fh, B) => {
      if (B[8]) return null;
      const BO = [200, 200, 194], BOD = [150, 150, 144], BOL = [230, 230, 224], h = hash3(px, py, f.length * 13 + part.length);
      if (part === 'head') { if (f === 'front') { if (py >= 3 && py <= 4 && (px === 1 || px === 2 || px === 5 || px === 6)) return [30, 28, 30, 2]; if (py === 5 && (px === 3 || px === 4)) return [62, 62, 66, 2]; if (py === 6) return px % 2 ? [74, 74, 78, 2] : mk(BOL, 1); if (py === 7) return mk(BOD, px % 2 ? .85 : 1); return mk(BO, .95 + h * .1); } return mk(BO, .92 + h * .1); }
      if (part === 'body') { if (f === 'top' || f === 'bottom') return BO; const sp = px === 3 || px === 4; if (py >= 9) return py === 9 ? (sp ? BOL : [48, 48, 52, 0]) : mk(BO, .95); if (sp) return mk(BOL, py % 2 ? .9 : 1.04); return py % 3 === 2 ? [44, 44, 48, 0] : mk(BO, py % 3 === 0 ? 1.04 : .88); }
      if (py === 0 || py === fh - 1) return mk(BOL, 1); if (py === 5 || py === 6) return mk(BOD, .82); return mk(BO, .9 + h * .08);
    };
    const playerPainter = (shirt, pants, hair, skin, eyes, alex) => (part, f, px, py, fw, fh, B) => {
      if (B[8]) { if (part === 'head' && (f === 'top' || (py < 2 && f !== 'bottom'))) return alex ? mk(hair, .95) : null; return null; }
      const h = hash3(px, py, f.length * 17 + part.length * 3);
      if (part === 'head') {
        if (f === 'top') return mk(hair, .9 + h * .2);
        if (f === 'bottom') return mk(skin, .8);
        if (f === 'back') return py < (alex ? 8 : 5) ? mk(hair, .9 + h * .15) : mk(skin, .92);
        if (f === 'front') { if (py < 2 || (py === 2 && (px === 0 || px === 7))) return mk(hair, .9 + h * .1); if (py === 4 && (px === 1 || px === 6)) return [255, 255, 255, 2]; if (py === 4 && (px === 2 || px === 5)) return eyes; if (py === 6 && px >= 3 && px <= 4) return mk(skin, .75); if (py === 7 && px >= 2 && px <= 5) return mk(hair, .7); return mk(skin, .97 + h * .05); }
        return py < (alex ? 6 : 3) ? mk(hair, .9 + h * .1) : mk(skin, .93);
      }
      if (part === 'body') { if (f === 'bottom') return pants; if (py >= 10) return mk(pants, .95); if (f === 'front' && py < 2 && px >= 3 && px <= 4) return mk(skin, .95); return mk(shirt, .93 + h * .08); }
      if (part.includes('arm')) { if (py < 4 && f !== 'bottom') return mk(shirt, .92 + h * .08); return mk(skin, .93 + h * .06); }
      if (f === 'bottom' || py >= fh - 2) return [70, 70, 76]; return mk(pants, .92 + h * .08);
    };
    PAINTERS.steve = playerPainter([0, 175, 175], [60, 58, 160], [70, 46, 24], [200, 140, 100], [80, 60, 160, 2]);
    PAINTERS.alex = playerPainter([110, 150, 60], [100, 66, 40], [228, 140, 50], [240, 200, 160], [40, 120, 40, 2], 1);
    function skinTex(name) {
      if (SKINS[name]) return SKINS[name];
      const base = name.split(':')[0];
      const pt = PAINTERS[name] || PAINTERS[base];
      const c = paintSkin(base, pt || (() => [200, 0, 200]));
      return SKINS[name] = tex(c, false, true);
    }
    function playerSkinTex(seedName) {
      const k = 'p:' + seedName;
      if (SKINS[k]) return SKINS[k];
      const h = hstr(seedName), R = rng(h);
      if (seedName === '') return SKINS[k] = skinTex('steve');
      const alex = R() < .4, sh = [R() * 200 + 30, R() * 200 + 30, R() * 200 + 30], pa = [R() * 120 + 20, R() * 120 + 20, R() * 160 + 40], hr = [[70, 46, 24], [228, 140, 50], [30, 26, 22], [220, 200, 120], [120, 70, 40]][R() * 5 | 0], sk = [[200, 140, 100], [240, 200, 160], [150, 100, 70], [110, 70, 50]][R() * 4 | 0];
      const c = paintSkin(alex ? 'alex' : 'steve', playerPainter(sh, pa, hr, sk, [R() * 120 | 0, R() * 120 + 60 | 0, R() * 160 + 60 | 0, 2], alex));
      return SKINS[k] = { t: tex(c, false, true), alex };
    }
