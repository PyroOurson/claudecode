        const crPI = Math.PI;
        let crEnvT = null;
        const crEnv = () => {
          if (crEnvT) return crEnvT;
          const t = tex(256, 128, (g, w, h) => {
            const im = g.createImageData(w, h), d = im.data;
            for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
              const lat = (0.5 - (py + 0.5) / h) * crPI, lon = ((px + 0.5) / w - 0.5) * TAU, cl = Math.cos(lat);
              const dx = Math.cos(lon) * cl, dy = Math.sin(lat), up = Math.sin(lon) * cl, az = Math.atan2(dy, dx);
              let r, gg, b;
              if (up > 0) {
                const k = Math.pow(up, 0.6), sd = up < 0.3 ? 1 - up / 0.3 : 0, L = Math.pow(Math.max(0, Math.cos(az * 4)), 60) * Math.exp(-Math.pow(up - 0.45, 2) / 0.003);
                r = (235 - 125 * k) * (1 - sd * 0.62) + 255 * L; gg = (242 - 90 * k) * (1 - sd * 0.58) + 250 * L; b = (255 - 30 * k) * (1 - sd * 0.45) + 235 * L;
              } else { const k = Math.min(1, -up * 3); r = 74 - 44 * k; gg = 118 - 64 * k; b = 76 - 42 * k; }
              const o = (py * w + px) * 4;
              d[o] = Math.min(255, r); d[o + 1] = Math.min(255, gg); d[o + 2] = Math.min(255, b); d[o + 3] = 255;
            }
            g.putImageData(im, 0, 0);
          });
          const pg = new THREE.PMREMGenerator(renderer);
          crEnvT = own(pg.fromEquirectangular(t)).texture;
          pg.dispose();
          return crEnvT;
        };
        const crRar = [['Common', '#c3cad6'], ['Uncommon', '#8fe0a0'], ['Rare', '#5f9dff'], ['Very Rare', '#a57bff'], ['Import', '#ff5a5a'], ['Exotic', '#ffd24a'], ['Black Market', '#ff4fd8']];
        const crTeam = [{ p: '#0a58fa', a: '#1b1c20' }, { p: '#fb9c0a', a: '#1b1c20' }], crOldP = { '#0866f0': '#0a58fa', '#ff6406': '#fb9c0a' }, crTeamL = ['#7fb0fd', '#fdb233'];
        const crCat = {
          decal: [
            { id: 'none', n: 'None', t: 0, r: 0 },
            { id: 'flames', n: 'Flames', b: 'octane', t: 9, r: 2 }, { id: 'flutterby', n: 'Flutterby', b: 'octane', t: 46, r: 4 }, { id: 'bolt', n: 'Lightning', b: 'octane', t: 19, r: 3 }, { id: 'lockjaw', n: 'Lockjaw', b: 'octane', t: 6, r: 3 }, { id: 'skulls', n: 'Skulls', b: 'octane', t: 14, r: 3 }, { id: 'stars', n: 'Stars', b: 'octane', t: 16, r: 2 }, { id: 'stripes', n: 'Stripes', b: 'octane', t: 2, r: 2 }, { id: 'tech', n: 'Tech', b: 'octane', t: 26, r: 3 }, { id: 'tiger', n: 'Tiger Claw', b: 'octane', t: 33, r: 4 }, { id: 'owings', n: 'Wings', b: 'octane', t: 36, r: 4 },
            { id: 'hex', n: 'Hexed', b: 'fennec', t: 4, r: 2 }, { id: 'splat', n: 'Paint Splat', b: 'fennec', t: 13, r: 3 }, { id: 'pixel', n: 'Pixel Camo', b: 'fennec', t: 23, r: 3 }, { id: 'eight', n: 'Lucky 8', b: 'fennec', t: 37, r: 4 },
            { id: 'chevron', n: 'Chevron', b: 'dominus', t: 7, r: 2 }, { id: 'wings', n: 'Wings', b: 'dominus', t: 17, r: 3 }, { id: 'shark', n: 'Lockjaw', b: 'dominus', t: 29, r: 4 }, { id: 'checker', n: 'Checkered', b: 'dominus', t: 41, r: 5 },
            { id: 'bstripes', n: 'Stripes', b: 'breakout', t: 2, r: 2 }, { id: 'bflames', n: 'Flames', b: 'breakout', t: 9, r: 2 }, { id: 'vector', n: 'Vector', b: 'breakout', t: 24, r: 3 },
            { id: 'mstripes', n: 'Stripes', b: 'merc', t: 2, r: 2 }, { id: 'mflames', n: 'Flames', b: 'merc', t: 9, r: 2 }, { id: 'mdots', n: 'Paint Party', b: 'merc', t: 32, r: 3 },
            { id: 'vstripes', n: 'Stripes', b: 'venom', t: 2, r: 2 }, { id: 'vflames', n: 'Flames', b: 'venom', t: 9, r: 2 }, { id: 'vwings', n: 'Wings', b: 'venom', t: 40, r: 3 }
          ],
          wheel: [
            { id: 'stock', n: 'OEM', t: 0, r: 0 }, { id: 'rough', n: 'Bender', t: 35, r: 4 }, { id: 'tri', n: 'Invader', t: 27, r: 4 }, { id: 'turbine', n: 'Jet Engine', t: 43, r: 5 },
            { id: 'dish', n: 'Ripper', t: 21, r: 3 }, { id: 'mesh', n: 'Spacerocker', t: 11, r: 3 }, { id: 'star', n: 'Stern', t: 3, r: 2 }, { id: 'neon', n: 'Zeta', t: 48, r: 6 }
          ],
          boost: [
            { id: 'std', n: 'Standard', t: 0, r: 0, o: null }, { id: 'ice', n: 'Bubbles', t: 5, r: 2, o: [0x2fc4ff, 0xf2ffff, 0x9ae8ff], p: [[0.45, 0.88, 1], [0.95, 1, 1]], sm: [0.78, 0.9, 0.98], sp: 1 },
            { id: 'neon', n: 'Interdimensional', t: 14, r: 3, o: [0x1cff5a, 0xeaffd8, 0x60ff90], p: [[0.2, 1, 0.35], [0.8, 1, 0.55]], sm: [0.3, 0.6, 0.3] },
            { id: 'plasma', n: 'Plasma', t: 22, r: 3, o: [0x9a3cff, 0xffd8ff, 0xc070ff], p: [[0.62, 0.25, 1], [1, 0.62, 1]], sm: [0.36, 0.22, 0.5] },
            { id: 'hell', n: 'Flamethrower', t: 30, r: 4, o: [0xff2a08, 0xffd040, 0xff4a10], p: [[1, 0.24, 0.02], [1, 0.72, 0.12]], sm: [0.1, 0.09, 0.09], dense: 1 },
            { id: 'gold', n: 'Sun Ray', t: 38, r: 5, o: [0xffa818, 0xfff6c8, 0xffd060], p: [[1, 0.72, 0.16], [1, 0.95, 0.6]], sm: [0.62, 0.54, 0.38], sp: 1 },
            { id: 'spark', n: 'Battle-Stars', t: 44, r: 5, o: [0xffd040, 0xffffff, 0xfff0a0], p: [[1, 0.82, 0.3], [1, 1, 0.9]], sm: null, sp: 2 },
            { id: 'rainbow', n: 'Lightning', t: 49, r: 6, o: [0x5fc8ff, 0xffffff, 0xaee8ff], p: [[0.5, 0.82, 1], [1, 1, 1]], sm: null, sp: 1 }
          ],
          trail: [
            { id: 'std', n: 'Classic', t: 0, r: 0, c: [0.42, 0.22, 1] }, { id: 'flame', n: 'Hot Rocks', t: 8, r: 2, c: [1, 0.45, 0.08], w: 1.35, j: 0.15 }, { id: 'neon', n: 'S10 - Silver', t: 18, r: 3, c: [0.9, 0.93, 1], w: 0.8, glow: 1 },
            { id: 'bolt', n: 'Lightning', t: 28, r: 4, c: [0.55, 0.8, 1], w: 0.75, j: 1 }, { id: 'shadow', n: 'Triangulate', t: 39, r: 5, c: [1, 0.25, 0.85], w: 1.3, j: 0.25 }, { id: 'rainbow', n: 'Rainbow Road', t: 47, r: 6, c: [1, 1, 1], w: 1.2, rb: 1 }
          ],
          ant: [{ id: 'none', n: 'None', t: 0, r: 0 }, { id: 'ball', n: 'Soccer Ball', t: 0, r: 1 }, { id: 'smiley', n: 'Smiley', t: 0, r: 1 }, { id: 'flag', n: 'Rocket Flag', t: 0, r: 1 }, { id: 'leaf', n: 'Green Leaf', t: 0, r: 2 }, { id: 'macaron', n: 'Macaron', t: 0, r: 2 }, { id: 'skull', n: 'Skull', t: 0, r: 2 }],
          top: [{ id: 'none', n: 'None', t: 0, r: 0 }, { id: 'cone', n: 'Fez', t: 10, r: 2 }, { id: 'party', n: 'Deerstalker', t: 15, r: 3 }, { id: 'tophat', n: 'Solar Shields', t: 25, r: 3 }, { id: 'halo', n: 'Halo', t: 34, r: 4 }, { id: 'crown', n: 'Royal Crown', t: 45, r: 5 }],
          fin: [
            { id: 'gloss', n: 'Glossy', t: 0, r: 0, m: 0.3, ro: 0.25, cc: 0.4, ccr: 0.03, e: 0.3 }, { id: 'matte', n: 'Matte', t: 1, r: 1, m: 0, ro: 0.78, cc: 0, ccr: 0.5, e: 0.25 },
            { id: 'metal', n: 'Metallic', t: 12, r: 2, m: 0.72, ro: 0.3, cc: 0.75, ccr: 0.04, e: 0.6 }, { id: 'satin', n: 'Satin', t: 20, r: 3, m: 0.35, ro: 0.55, cc: 0.25, ccr: 0.3, e: 0.35 },
            { id: 'pearl', n: 'Pearlescent', t: 31, r: 4, m: 0.45, ro: 0.22, cc: 1, ccr: 0.02, e: 0.6 }, { id: 'chrome', n: 'Chrome', t: 42, r: 5, m: 1, ro: 0.07, cc: 1, ccr: 0.01, e: 1 }
          ]
        };
        const crTitles = ['Rocketeer', 'Sky Captain', 'Supersonic Legend', 'Goal Machine', 'Aerial Ace', 'Boost Junkie', 'Ballchaser'];
        const crGXT = [6, 16, 26, 36, 46, 50], crTierN = 50, crTierXP = 600;
        const crGXF = [['classic', 'Classic'], ['fireworks', 'Fireworks'], ['ring', 'Shockwave'], ['vortex', 'Black Hole'], ['bolt', 'Thunderstruck'], ['confetti', 'Confetti Party']];
        const crGXN = () => typeof fxGX !== 'undefined' && Array.isArray(fxGX) && fxGX.length > 0;
        const crGXPlay = (id, p, team) => {
          if (typeof fire === 'undefined' || !p) return;
          const x = p.x, y = p.y, z = Math.max(p.z, 120), TC = team ? [1, 0.45, 0.08] : [0.2, 0.55, 1], rr = () => Math.random() - 0.5, at = (ms, f) => api.timeout(() => { if (!dead) f(); }, ms);
          const ball = (cx, cy, cz, n, sp, c, sz, life, g) => { for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * TAU, q = Math.sqrt(1 - u * u), v = sp * (0.75 + Math.random() * 0.25); fire.emit(cx, cy, cz, Math.cos(a) * q * v, Math.sin(a) * q * v, u * v, life * (0.7 + Math.random() * 0.5), c[0], c[1], c[2], sz, sz * 0.2, g, 1.6); } };
          if (id === 'fireworks') { const C = [[1, 0.2, 0.3], [0.3, 1, 0.4], [1, 0.85, 0.2], [0.4, 0.6, 1], [1, 0.4, 1], TC]; for (let k = 0; k < 6; k++) at(k * 260, () => { const c = C[k], cx = x + rr() * 1400, cy = y + (y > 0 ? -1 : 1) * (300 + Math.random() * 900), cz = 500 + Math.random() * 700; ball(cx, cy, cz, 110, 900, c, 60, 1.3, 260); ball(cx, cy, cz, 30, 300, [1, 1, 1], 90, 0.4, 0); }); }
          else if (id === 'ring') { for (let w = 0; w < 3; w++) at(w * 180, () => { for (let i = 0; i < 180; i++) { const a = i / 180 * TAU, v = 2600 + w * 700; fire.emit(x, y, z * 0.6, Math.cos(a) * v, Math.sin(a) * v, rr() * 120, 0.9, w ? TC[0] : 1, w ? TC[1] : 1, w ? TC[2] : 1, 120, 40, 0, 1.2); } }); ball(x, y, z, 120, 1500, [1, 1, 1], 140, 0.5, 0); }
          else if (id === 'vortex') { for (let i = 0; i < 260; i++) { const u = Math.random() * 2 - 1, a = Math.random() * TAU, q = Math.sqrt(1 - u * u), r = 900 + Math.random() * 500; fire.emit(x + Math.cos(a) * q * r, y + Math.sin(a) * q * r, z + u * r, -Math.cos(a) * q * r * 1.4 - Math.sin(a) * 600, -Math.sin(a) * q * r * 1.4 + Math.cos(a) * 600, -u * r * 1.4, 0.7, 0.55, 0.2, 1, 70, 10, 0, 0); } for (let i = 0; i < 40; i++) smoke.emit(x + rr() * 200, y + rr() * 200, z + rr() * 200, rr() * 300, rr() * 300, rr() * 300, 1.6, 0.08, 0.02, 0.14, 300, 700, 0, 1); at(650, () => { ball(x, y, z, 220, 3200, [0.75, 0.4, 1], 110, 0.9, 0); ball(x, y, z, 60, 900, [1, 1, 1], 200, 0.4, 0); }); }
          else if (id === 'bolt') { for (let k = 0; k < 4; k++) at(k * 140, () => { let bx = x + rr() * 1200, by = y + rr() * 600, bz = 1900; while (bz > z) { const nx = bx + rr() * 260, ny = by + rr() * 260, nz = bz - 90 - Math.random() * 80; for (let j = 0; j < 4; j++) { const t = j / 4; fire.emit(bx + (nx - bx) * t, by + (ny - by) * t, bz + (nz - bz) * t, 0, 0, 0, 0.35, 0.6, 0.85, 1, 90, 30, 0, 0); } bx = nx; by = ny; bz = nz; } ball(bx, by, z, 50, 1400, [0.8, 0.95, 1], 80, 0.5, 0); }); }
          else if (id === 'confetti') { const C = [[1, 0.2, 0.3], [0.2, 1, 0.4], [1, 0.9, 0.2], [0.3, 0.6, 1], [1, 0.4, 1], [1, 1, 1]]; for (let i = 0; i < 420; i++) { const c = C[i % 6], a = Math.random() * TAU, v = 600 + Math.random() * 1800; fire.emit(x + rr() * 80, y + rr() * 80, z, Math.cos(a) * v * 0.6, Math.sin(a) * v * 0.6, 600 + Math.random() * 1600, 2.4 + Math.random() * 1.5, c[0], c[1], c[2], 34, 26, 650, 2.6); } }
        };
        let crGXC = null;
        const crGX = () => {
          if (crGXC) return crGXC;
          const L = crGXN() ? fxGX.filter(x => Array.isArray(x) && typeof x[0] === 'string') : crGXF;
          let k = 0;
          crGXC = L.map(([id, n], i) => ({ id, n: String(n || id), t: i ? crGXT[k++] || 0 : 0, r: i ? Math.min(6, 2 + Math.floor(i / 1.4)) : 0 })).filter(x => x.t || x.id === L[0][0]);
          return crGXC;
        };
        const crList = k => k === 'gx' ? crGX() : crCat[k] || [];
        const crItem = (k, id) => crList(k).find(x => x.id === id) || null;
        let crPassC = null;
        const crPass = () => {
          if (crPassC) return crPassC;
          const T = Array.from({ length: crTierN }, () => null);
          for (const k of ['decal', 'wheel', 'boost', 'trail', 'top', 'fin', 'gx']) for (const it of crList(k)) if (it.t > 0 && it.t <= crTierN && !T[it.t - 1]) T[it.t - 1] = { k, id: it.id, it };
          let q = 0;
          for (let i = 0; i < crTierN; i++) if (!T[i]) { const n = crTitles[q++ % crTitles.length]; T[i] = { k: 'title', id: n, it: { id: n, n, t: i + 1, r: Math.min(6, 2 + Math.floor(i / 10)) } }; }
          return crPassC = T;
        };
        const crHex = s => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s) ? s.toLowerCase() : null;
        const crLdDef = () => ({ p0: crTeam[0].p, p1: crTeam[1].p, a: crTeam[0].a, fin: 'gloss', decal: 'none', wheel: 'stock', boost: 'std', gx: crGX()[0].id, trail: 'std', top: 'none', ant: 'none' });
        const crLdClean = (o, body) => {
          const d = crLdDef(), x = o && typeof o === 'object' ? o : {};
          for (const k of ['p0', 'p1', 'a']) d[k] = crOldP[crHex(x[k])] || crHex(x[k]) || d[k];
          for (const [k, c] of [['fin', 'fin'], ['decal', 'decal'], ['wheel', 'wheel'], ['boost', 'boost'], ['trail', 'trail'], ['top', 'top'], ['ant', 'ant']]) { const it = crItem(c, x[k]); if (it && (c !== 'decal' || !it.b || !body || it.b === body)) d[k] = it.id; }
          if (typeof x.gx === 'string' && /^[\w-]{1,24}$/.test(x.gx) && (typeof fxGX === 'undefined' || crItem('gx', x.gx))) d.gx = x.gx;
          return d;
        };
        const crCosOf = (ld, team) => { const L = ld || crLdDef(); return { p: team ? L.p1 : L.p0, a: L.a, fin: L.fin, decal: L.decal, wheel: L.wheel, boost: L.boost, gx: L.gx, trail: L.trail, top: L.top, ant: L.ant || 'none' }; };
        const crCosClean = (o, team, body) => { if (!o || typeof o !== 'object') return crCosOf(null, team); const L = crLdClean(Object.assign({}, o, { p0: o.p, p1: o.p }), body); return crCosOf(L, team); };
        const crBotCos = (team, body, rnd) => {
          const R = rnd || Math.random, pick = l => l[Math.floor(R() * l.length)].id, L = crLdDef();
          if (R() < 0.6) L.wheel = pick(crCat.wheel);
          const ds = crCat.decal.filter(d => !d.b || d.b === body); if (R() < 0.7) L.decal = pick(ds);
          if (R() < 0.3) L.boost = pick(crCat.boost);
          if (R() < 0.15) L.top = pick(crCat.top);
          if (R() < 0.3) L.ant = pick(crCat.ant);
          return crCosOf(L, team);
        };
        let crCosV = 0;
        const crFl = (() => {
          const ft = tex(32, 128, (g, w, h) => {
            const gr = g.createLinearGradient(0, h, 0, 0);
            gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,.9)'); gr.addColorStop(0.55, 'rgba(255,255,255,.38)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = gr; g.fillRect(0, 0, w, h);
          });
          const gt = tex(64, 64, (g, w) => {
            const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
            gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = gr; g.fillRect(0, 0, w, w);
          });
          return { ft, gt, cone: own(new THREE.ConeGeometry(1, 1, 14, 1, true).rotateZ(crPI / 2).translate(-0.5, 0, 0)), plume: own(new THREE.CylinderGeometry(1, 0.55, 1, 16, 1, true).rotateZ(crPI / 2).translate(-0.5, 0, 0)) };
        })();
        const crFlMs = {};
        const crFlM = (id, team) => {
          const B = crItem('boost', id) || crCat.boost[0], key = B.id + (B.o ? '' : team);
          if (crFlMs[key]) return crFlMs[key];
          const o = B.o || [0xff7a30, 0xfff4dc, 0xffa050];
          const M = (c, op) => own(new THREE.MeshBasicMaterial({ color: c, map: crFl.ft, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
          return crFlMs[key] = { o: M(o[0], 0.85), c: M(o[1], 1), g: own(new THREE.SpriteMaterial({ map: crFl.gt, color: o[2], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false })), B };
        };
        const crFCT = [[[1, 0.34, 0.05], [1, 0.78, 0.3]], [[1, 0.34, 0.05], [1, 0.78, 0.3]]], crFSM = [[1.2, 0.5, 0.1], [1.2, 0.5, 0.1]];
        const crRbC = [1, 0, 0];
        const crHue = (h, o) => { const f = k => { const x = (k + h * 6) % 6; return Math.max(0, Math.min(1, Math.abs(x - 3) - 1)); }; o[0] = f(0); o[1] = f(4); o[2] = f(2); return o; };
        const crBoostCol = c => {
          const cv = c && visOf(c), B = cv && cv.bs || crCat.boost[0], t = c ? c.team : 0;
          if (B.rb) { crHue(performance.now() / 1600 % 1, crRbC); return { a: crRbC, b: [1, 1, 1], smoke: null, B }; }
          return B.p ? { a: B.p[0], b: B.p[1], smoke: B.sm, B } : { a: crFCT[t][0], b: crFCT[t][1], smoke: crFSM[t], B };
        };
        const crTrM = own(new THREE.MeshBasicMaterial({
          map: tex(8, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
          vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false
        }));
        const crTrail = () => {
          const N = 26, g = own(new THREE.BufferGeometry()), pos = new Float32Array(N * 12), col = new Float32Array(N * 12), uv = new Float32Array(N * 8), idx = [];
          for (let i = 0; i < N; i++) { const u = i / (N - 1); uv.set([u, 0, u, 1, u, 0, u, 1], i * 8); }
          for (let i = 0; i < N - 1; i++) for (let s = 0; s < 2; s++) { const a = i * 4 + s * 2, b = a + 4; idx.push(a, a + 1, b, a + 1, b + 1, b); }
          g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
          g.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
          g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          g.setIndex(idx);
          const m = new THREE.Mesh(g, crTrM); m.frustumCulled = false; m.renderOrder = 6; m.visible = false; scene.add(m);
          return { m, g, pos, col, N, hx: new Float32Array(N), hy: new Float32Array(N), hz: new Float32Array(N), ht: new Float32Array(N), hs: new Float32Array(N), n: 0, head: 0 };
        };
        const crTags = {};
        const crTagMat = (name, team) => {
          const key = team + ':' + name;
          if (crTags[key]) return crTags[key];
          const t = tex(512, 128, (g, w, h) => {
            const txt = String(name || '').toUpperCase().slice(0, 18);
            g.font = '700 58px Arial, "Helvetica Neue", "Segoe UI", sans-serif';
            const tw = Math.min(360, g.measureText(txt).width), y0 = 16, bh = 92, r = bh / 2, ic = bh * 0.3, bw = Math.max(150, tw + bh + 34), x0 = (w - bw) / 2, ym = y0 + bh / 2, cx = x0 + r + 4;
            g.beginPath(); g.moveTo(x0 + r, y0); g.arcTo(x0 + bw, y0, x0 + bw, y0 + bh, r); g.arcTo(x0 + bw, y0 + bh, x0, y0 + bh, r); g.arcTo(x0, y0 + bh, x0, y0, r); g.arcTo(x0, y0, x0 + bw, y0, r); g.closePath();
            g.fillStyle = team ? 'rgba(240,112,24,.94)' : 'rgba(40,104,240,.94)'; g.fill();
            g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke();
            g.save(); g.beginPath(); g.arc(cx, ym, ic, 0, TAU); g.clip(); g.fillStyle = team ? '#ffb070' : '#6f9cff'; g.fillRect(cx - ic, ym - ic, ic * 2, ic * 2); g.fillStyle = '#fff'; g.fillRect(cx - ic, ym + ic * 0.25, ic * 2, ic); g.restore();
            g.beginPath(); g.arc(cx, ym, ic, 0, TAU); g.lineWidth = 5; g.strokeStyle = '#fff'; g.stroke();
            g.textAlign = 'center'; g.textBaseline = 'middle'; const tx = x0 + bh + 6 + (bw - bh - 26) / 2; g.fillStyle = 'rgba(0,0,0,.22)'; g.fillText(txt, tx + 2, ym + 5, 360);
            g.fillStyle = '#fff'; g.fillText(txt, tx, ym + 3, 360);
          });
          return crTags[key] = own(new THREE.SpriteMaterial({ map: t, depthTest: false, depthWrite: false, transparent: true, fog: false, toneMapped: false }));
        };
        const crCredits = [
          'Octane - Rocket League Car by fairlight51, https://sketchfab.com/3d-models/octane-rocket-league-car-9910f0a5d158425bbc7deb60c7a81f69, CC BY 4.0',
          'Fennec - Rocket League Car by fairlight51, https://sketchfab.com/3d-models/fennec-rocket-league-car-5b43b50b6eeb4a12a29671df3418f57a, CC BY 4.0',
          'Dominus - Rocket League Car by fairlight51, https://sketchfab.com/3d-models/dominus-rocket-league-car-f592f249a65f41cd81a0e5aa3d418cb2, CC BY 4.0',
          'Ball - Rocket League by fairlight51, https://sketchfab.com/3d-models/ball-rocket-league-2c8911aa1dcd4c53bad842f2d354dfe2, CC BY 4.0'
        ];
        const crMD = {};
        const crModel = id => {
          if (crMD[id] !== undefined) return crMD[id];
          const m = crM[id];
          if (!m || !m.body || !m.wheel) return crMD[id] = null;
          return crMD[id] = { m, body: crDec(m.body), wheel: crDec(m.wheel) };
        };
        const crPick = id => crModel(id) ? id : BODIES[id] && BODIES[id].mdl && crModel(BODIES[id].mdl) ? BODIES[id].mdl : ['octane', 'fennec', 'dominus', ...Object.keys(crM)].find(k => k !== 'ball' && crModel(k)) || null;
        const crFits = {};
        const crFit = (mid, bid) => {
          const key = mid + '|' + bid;
          if (crFits[key]) return crFits[key];
          const MD = crModel(mid), B = BODIES[bid] || BODIES[BODY_IDS[0]], zf = -(B.rz || CFG.carRest), [f, r] = MD.m.wh;
          const s = (B.wf[0] - B.wb[0]) / (f[0] - r[0]), tx = B.wf[0] - s * f[0], tz = (B.wf[2] + zf - s * f[2] + B.wb[2] + zf - s * r[2]) / 2;
          const geo = own(MD.body.clone()).applyMatrix4(new THREE.Matrix4().makeScale(s, s, s).setPosition(tx, 0, tz));
          geo.computeBoundingBox(); geo.computeBoundingSphere();
          const bb = geo.boundingBox, P = geo.attributes.position.array, L = bb.max.x - bb.min.x, xa = bb.min.x + L * 0.3, xb = bb.min.x + L * 0.72;
          let rz = -1e9, rx = 0, rn = 0;
          for (let i = 0; i < P.length; i += 3) if (Math.abs(P[i + 1]) < 12 && P[i] > xa && P[i] < xb && P[i + 2] > rz - 1.5) { if (P[i + 2] > rz + 1.5) { rz = P[i + 2]; rx = 0; rn = 0; } rx += P[i]; rn++; }
          const ax = (rn ? rx / rn : 0) - L * 0.2, ay = (bb.max.y - bb.min.y) * 0.12; let az = -1e9;
          for (let i = 0; i < P.length; i += 3) if (Math.abs(P[i] - ax) < 4 && Math.abs(P[i + 1] - ay) < 4 && P[i + 2] > az) az = P[i + 2];
          return crFits[key] = { geo, B, s, bb, ant: [ax, ay, az > -1e8 ? az - 0.5 : bb.max.z], roof: [rn ? rx / rn : 0, 0, rz > -1e8 ? rz : bb.max.z], nz: MD.m.nz.map(([x, y, z, q]) => [x * s + tx, y * s, z * s + tz, q * s]), tz: bb.max.z + 20, cx: (bb.min.x + bb.max.x) / 2 };
        };
        const crPals = {};
        const crPal = (mid, team) => {
          const key = mid + team;
          if (crPals[key]) return crPals[key];
          const M = crModel(mid).m, env = crEnv(), T = crTeam[team], tx = M.tex || {};
          const mk = (q, o) => own(new (o.clearcoat ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)(Object.assign({ roughness: q.r, metalness: q.m, envMap: env, envMapIntensity: 1 }, o)));
          return crPals[key] = M.mats.map(q => {
            if (q.k === 'body') return mk(q, { color: lin(T.p), metalness: Math.min(q.m, 0.2), roughness: Math.max(0.34, q.r), clearcoat: Math.max(0.45, q.cc), clearcoatRoughness: 0.05, envMapIntensity: 0.9 });
            if (q.k === 'paint') return mk(q, { color: lin(T.a), metalness: Math.min(q.m, 0.4), roughness: Math.min(Math.max(0.35, q.r), 0.6), clearcoat: 0.5, clearcoatRoughness: 0.1 });
            if (q.k === 'chassis') return mk(q, Object.assign(tx.mr ? { map: crTex(tx.chassis), metalnessMap: crTex(tx.mr, false), roughnessMap: crTex(tx.mr, false), metalness: 0.7, roughness: q.r * 1.1 } : { map: crTex(tx.chassis), metalness: Math.min(q.m, 0.55), roughness: Math.max(0.4, q.r) }, tx.em ? { emissiveMap: crTex(tx.em), emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 2.2 } : {}));
            if (q.k === 'glass') return mk(q, { color: lin('#2a2622'), metalness: 0.1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 0.8 });
            if (q.k === 'light') return own(new THREE.MeshBasicMaterial({ color: lin(q.hex || '#fff4e6', 1.6), toneMapped: false }));
            return mk(q, { color: lin(q.hex || '#3a3d44') });
          });
        };
        const crDV = 'varying vec3 vDP;\nvarying vec3 vDN;\n';
        const crDF = `if (dOn > 0.5) {
vec3 dn = normalize(vDN); vec3 an = abs(dn);
float ws = an.y * an.y * an.y + an.x * an.x * an.x * 0.5, wt = an.z * an.z * an.z;
float du = clamp((vDP.x - dBox.x) * dBox.y, 0.0, 1.0), dz = clamp((vDP.z - dBox.z) * dBox.w, 0.0, 1.0), dy = clamp(vDP.y * dWy * 0.5 + 0.5, 0.0, 1.0);
vec3 mk = (texture2D(dTex, vec2(du, 0.504 + 0.492 * dz)).rgb * ws + texture2D(dTex, vec2(du, 0.004 + 0.492 * dy)).rgb * wt) / max(ws + wt, 1e-4);
float ww = min(mk.r, mk.b);
vec3 dc = diffuseColor.rgb;
dc = mix(dc, dA, clamp(mk.r - ww, 0.0, 1.0)); dc = mix(dc, dT, mk.g); dc = mix(dc, dK, clamp(mk.b - ww, 0.0, 1.0)); dc = mix(dc, dW, ww);
diffuseColor.rgb = dc;
}
`;
        const crDecalMat = o => {
          const m = own(new THREE.MeshPhysicalMaterial(o)), U = { dTex: { value: null }, dOn: { value: 0 }, dBox: { value: new THREE.Vector4(-70, 1 / 150, 0, 1 / 60) }, dWy: { value: 1 / 36 }, dA: { value: new THREE.Color() }, dT: { value: new THREE.Color() }, dK: { value: lin('#0c0d11') }, dW: { value: lin('#f3f5f8') } };
          m.userData.du = U;
          m.onBeforeCompile = sh => {
            Object.assign(sh.uniforms, U);
            sh.vertexShader = crDV + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvDP = position; vDN = objectNormal;');
            sh.fragmentShader = crDV + 'uniform sampler2D dTex; uniform float dOn; uniform vec4 dBox; uniform float dWy; uniform vec3 dA; uniform vec3 dT; uniform vec3 dK; uniform vec3 dW;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + crDF);
          };
          m.customProgramCacheKey = () => 'crDecal1';
          return m;
        };
        const crDP = (() => {
          const A = '#ff0000', T = '#00ff00', K = '#0000ff', Wh = '#ff00ff', X = u => u * 512, Y = v => 256 * (1 - v), Z = v => 256 + 256 * (1 - v);
          const poly = (g, pts, c, f) => { g.beginPath(); pts.forEach(([u, v], i) => { const x = X(u), y = f(v); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); g.fillStyle = c; g.fill(); };
          const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
          const flame = (g, f, u0, u1, v0, v1, n, c, R) => {
            g.beginPath(); g.moveTo(X(u1), f(v0));
            for (let i = 0; i <= n; i++) { const t = i / n, v = v0 + (v1 - v0) * t, len = (u1 - u0) * (0.55 + 0.45 * Math.sin(t * 9.4 + 1.3) * Math.sin(t * 3.1)) * (0.75 + R() * 0.25); g.quadraticCurveTo(X(u1 - len * 0.6), f(v - (v1 - v0) / n * 0.9), X(u1 - len), f(v - (v1 - v0) / n * 0.2)); g.quadraticCurveTo(X(u1 - len * 0.5), f(v + (v1 - v0) / n * 0.3), X(u1 - (u1 - u0) * 0.2), f(v + (v1 - v0) / n * 0.5)); }
            g.lineTo(X(u1), f(v1)); g.closePath(); g.fillStyle = c; g.fill();
          };
          return {
            stripes: g => { poly(g, [[0, 0.355], [1, 0.355], [1, 0.455], [0, 0.455]], T, Z); poly(g, [[0, 0.545], [1, 0.545], [1, 0.645], [0, 0.645]], T, Z); },
            flames: g => { flame(g, Y, 0.04, 1.02, 0.14, 0.66, 7, T, rnd(7)); flame(g, Z, 0.42, 1.02, 0.06, 0.42, 4, T, rnd(9)); flame(g, Z, 0.42, 1.02, 0.58, 0.94, 4, T, rnd(9)); },
            bolt: g => { poly(g, [[0.06, 0.5], [0.42, 0.64], [0.37, 0.5], [0.72, 0.62], [0.67, 0.46], [1.02, 0.54], [0.62, 0.34], [0.67, 0.47], [0.33, 0.36], [0.38, 0.49], [0.08, 0.4]], T, Y); poly(g, [[0.36, 0.4], [0.6, 0.62], [0.58, 0.5], [0.84, 0.7], [0.81, 0.56], [1.02, 0.66], [1.02, 0.5], [0.76, 0.38], [0.79, 0.5], [0.54, 0.32], [0.56, 0.44]], T, Z); },
            lockjaw: g => {
              const K0 = '#000000';
              poly(g, [[0.58, -0.02], [1.02, -0.02], [1.02, 0.62], [0.9, 0.54], [0.78, 0.46], [0.66, 0.38], [0.58, 0.3]], T, Y);
              for (let i = 0; i < 7; i++) { const u = 0.64 + i * 0.055, v = 0.4 + (u - 0.64) * 0.62; poly(g, [[u, v + 0.01], [u + 0.05, v + 0.04], [u + 0.022, v - 0.12]], K0, Y); poly(g, [[u + 0.01, 0.06], [u + 0.05, 0.06], [u + 0.03, 0.18]], K0, Y); }
              for (let i = 0; i < 9; i++) { const u = 0.1 + i * 0.055; poly(g, [[u, 0.44], [u + 0.045, 0.44], [u + 0.022, 0.56]], T, Y); }
              poly(g, [[0.84, 0.0], [1.02, 0.0], [1.02, 1.0], [0.84, 1.0], [0.9, 0.5]], T, Z);
              for (let i = 0; i < 8; i++) { const v = 0.08 + i * 0.12; poly(g, [[0.86, v], [0.86, v + 0.09], [0.96, v + 0.045]], K0, Z); }
            },
            skulls: g => {
              const K0 = '#000000', R = rnd(17);
              const blob = (f, u0, u1, v0, v1, top) => { g.beginPath(); g.moveTo(X(u0), f(v0)); for (let i = 0; i <= 24; i++) { const u = u0 + (u1 - u0) * i / 24; g.lineTo(X(u), f(top + Math.sin(i * 1.7) * 0.04 + R() * 0.05)); } g.lineTo(X(u1), f(v0)); g.closePath(); g.fillStyle = T; g.fill(); };
              blob(Y, -0.02, 1.02, -0.02, 1, 0.68); blob(Z, 0.3, 1.02, 0.04, 1, 0.96);
              const sk = (x, y, s) => { g.fillStyle = K0; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); g.fillRect(x - s * 0.55, y + s * 0.4, s * 1.1, s * 0.8); g.fillStyle = T; g.beginPath(); g.ellipse(x - s * 0.4, y + s * 0.05, s * 0.28, s * 0.34, 0, 0, TAU); g.ellipse(x + s * 0.4, y + s * 0.05, s * 0.28, s * 0.34, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x, y + s * 0.35); g.lineTo(x - s * 0.12, y + s * 0.6); g.lineTo(x + s * 0.12, y + s * 0.6); g.fill(); for (let i = -1; i < 2; i++) g.fillRect(x + i * s * 0.3 - s * 0.05, y + s * 0.85, s * 0.1, s * 0.4); };
              for (let i = 0; i < 4; i++) sk(X(0.16 + i * 0.22), Y(0.36 + (i % 2) * 0.1), 30 + R() * 8);
              sk(X(0.72), Z(0.5), 42); sk(X(0.48), Z(0.22), 26); sk(X(0.48), Z(0.78), 26);
            },
            stars: g => {
              const K0 = '#000000', R = rnd(41);
              const st = (x, y, r, c, a) => { g.beginPath(); for (let k = 0; k < 10; k++) { const q = a + k * crPI / 5, rr = k % 2 ? r * 0.42 : r; g.lineTo(x + Math.sin(q) * rr, y - Math.cos(q) * rr); } g.closePath(); g.fillStyle = c; g.fill(); };
              g.fillStyle = T; g.beginPath(); g.moveTo(X(-0.02), Y(-0.02)); for (let i = 0; i <= 30; i++) g.lineTo(X(i / 30 * 1.04 - 0.02), Y(0.3 + i / 30 * 0.12 + Math.sin(i * 1.3) * 0.03)); g.lineTo(X(1.02), Y(-0.02)); g.closePath(); g.fill();
              g.beginPath(); g.moveTo(X(1.02), Z(-0.02)); for (let i = 0; i <= 20; i++) g.lineTo(X(0.72 + Math.sin(i * 1.1) * 0.03 + Math.abs(i - 10) * 0.012), Z(i / 20 * 1.04 - 0.02)); g.lineTo(X(1.02), Z(1.02)); g.closePath(); g.fill();
              for (let i = 0; i < 6; i++) st(X(0.1 + i * 0.16), Y(0.18 + (i % 2) * 0.08), 18 + R() * 8, K0, R());
              for (let i = 0; i < 5; i++) st(X(0.86 + (i % 2) * 0.06), Z(0.12 + i * 0.19), 14 + R() * 6, K0, R());
              for (let i = 0; i < 7; i++) st(X(0.2 + R() * 0.7), Y(0.48 + R() * 0.12), 7 + R() * 8, T, R());
            },
            tech: g => {
              const R = rnd(29), s = 6;
              for (let q = 0; q < 2; q++) for (let y = q * 256; y < q * 256 + 256; y += s) for (let x = 0; x < 512; x += s) {
                const u = x / 512, v = q ? 1 - (y - 256) / 256 : 1 - y / 256, n = Math.sin(x * 0.031 + y * 0.017) + Math.sin(x * 0.011 - y * 0.043) * 0.8 + Math.sin((x + y) * 0.07) * 0.3 + R() * 0.7;
                const lim = q ? (u > 0.3 ? 0.35 - u * 0.4 : 9) : (v < 0.62 ? 0.15 : 9);
                if (n > lim) { g.fillStyle = T; g.fillRect(x, y, s, s); }
              }
            },
            owings: g => {
              for (let q = 0; q < 2; q++) {
                const f = q ? Y : Z, sides = q ? [1] : [1, -1];
                for (const sg of sides) for (let i = 0; i < 6; i++) {
                  const ax = 0.9, av = q ? 0.46 : 0.5 + sg * 0.1, l = 0.78 - i * 0.09, dv = q ? 0.22 - i * 0.04 : sg * (0.08 + i * 0.06);
                  g.beginPath(); g.moveTo(X(ax), f(av)); g.quadraticCurveTo(X(ax - l * 0.45), f(av + dv + (q ? 0.08 : sg * 0.08)), X(ax - l), f(av + dv)); g.quadraticCurveTo(X(ax - l * 0.55), f(av + dv * 0.45), X(ax + 0.02), f(av - (q ? 0.03 : sg * 0.03))); g.closePath(); g.fillStyle = T; g.fill();
                }
              }
            },
            flutterby: g => {
              const R = rnd(53);
              const bf = (x, y, s, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = T; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * s * 0.55, -s * 0.35, s * 0.55, s * 0.42, sx * 0.5, 0, TAU); g.ellipse(sx * s * 0.42, s * 0.42, s * 0.34, s * 0.28, -sx * 0.4, 0, TAU); g.fill(); } g.restore(); };
              for (let q = 0; q < 2; q++) { const f = q ? Y : Z; for (let i = 0; i < 26; i++) bf(X(R()), f(q ? 0.12 + R() * 0.6 : 0.05 + R() * 0.9), 9 + R() * 8, R() * 1.6 - 0.8); }
            },
            tiger: g => { const R = rnd(11); for (let i = 0; i < 11; i++) { const u = 0.05 + i * 0.085 + R() * 0.02, w = 0.03 + R() * 0.02, l = 0.18 + R() * 0.16; poly(g, [[u, 1.02], [u + w, 1.02], [u + w * 0.2 - 0.03, 1 - l]], K, Y); poly(g, [[u + 0.04, -0.02], [u + 0.04 + w, -0.02], [u + 0.01, l * 0.9 + 0.12]], K, Y); poly(g, [[u, 0], [u + w, 0], [u - 0.03, l + 0.12]], K, Z); poly(g, [[u, 1], [u + w, 1], [u - 0.03, 0.88 - l]], K, Z); } },
            hex: g => { const R = rnd(5), s = 0.035; for (let q = 0; q < 2; q++) { const f = q ? Z : Y; for (let i = 0; i < 30; i++) for (let j = 0; j < 16; j++) { const u = i * s * 1.5, v = j * s * 1.73 / 0.5 * 0.5 + (i % 2) * s * 0.87; if (R() > (1 - u) * 1.2 || u > 0.95) continue; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k * crPI / 3, x = X(u + Math.cos(a) * s * 0.78), y = f(v) + Math.sin(a) * s * 0.78 * 512 / 2; if (k) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fillStyle = R() < 0.3 ? A : T; g.fill(); } } },
            splat: g => { const R = rnd(21); for (let q = 0; q < 2; q++) { const f = q ? Z : Y; for (let i = 0; i < 9; i++) { const u = 0.1 + R() * 0.8, v = 0.2 + R() * 0.6, r = 18 + R() * 30, c = R() < 0.5 ? A : T; g.fillStyle = c; g.beginPath(); g.arc(X(u), f(v), r, 0, TAU); g.fill(); for (let k = 0; k < 9; k++) { const a = R() * TAU, d = r * (1.1 + R() * 1.4); g.beginPath(); g.arc(X(u) + Math.cos(a) * d, f(v) + Math.sin(a) * d * 0.7, 3 + R() * 7, 0, TAU); g.fill(); } } } },
            pixel: g => { const R = rnd(33), s = 16; for (let y = 0; y < 512; y += s) for (let x = 0; x < 512; x += s) { const n = Math.sin(x * 0.021 + y * 0.013) + Math.sin(x * 0.007 - y * 0.029) + R() * 0.9; if (n > 0.9) { g.fillStyle = K; g.fillRect(x, y, s, s); } else if (n > 0.35) { g.fillStyle = A; g.fillRect(x, y, s, s); } else if (n < -1.1) { g.fillStyle = T; g.fillRect(x, y, s, s); } } },
            eight: g => { g.fillStyle = Wh; g.beginPath(); g.ellipse(X(0.5), Y(0.47), 46, 66, 0, 0, TAU); g.fill(); g.lineWidth = 9; g.strokeStyle = T; g.stroke(); g.fillStyle = K; g.font = '900 96px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', X(0.5), Y(0.47) + 4); poly(g, [[0, 0.44], [1, 0.44], [1, 0.56], [0, 0.56]], T, Z); poly(g, [[0, 0.41], [1, 0.41], [1, 0.43], [0, 0.43]], Wh, Z); poly(g, [[0, 0.57], [1, 0.57], [1, 0.59], [0, 0.59]], Wh, Z); poly(g, [[0.04, 0.24], [0.96, 0.24], [0.96, 0.28], [0.04, 0.28]], A, Y); },
            chevron: g => { for (let i = 0; i < 6; i++) { const u = 0.18 + i * 0.11; poly(g, [[u, 0.62], [u + 0.06, 0.62], [u + 0.12, 0.44], [u + 0.06, 0.26], [u, 0.26], [u + 0.06, 0.44]], i % 2 ? A : T, Y); } for (let i = 0; i < 4; i++) { const u = 0.55 + i * 0.1; poly(g, [[u, 0.15], [u + 0.05, 0.15], [u + 0.12, 0.5], [u + 0.05, 0.85], [u, 0.85], [u + 0.07, 0.5]], T, Z); } },
            wings: g => { for (let i = 0; i < 6; i++) { const v = 0.3 + i * 0.05, u1 = 0.85 - i * 0.07; g.beginPath(); g.moveTo(X(0.12), Y(0.36)); g.quadraticCurveTo(X(0.4), Y(v + 0.18), X(u1), Y(v + 0.12)); g.quadraticCurveTo(X(u1 - 0.05), Y(v + 0.02), X(0.14), Y(0.33)); g.closePath(); g.fillStyle = i % 2 ? T : A; g.fill(); } g.lineWidth = 10; g.strokeStyle = T; g.beginPath(); g.moveTo(X(0.1), Z(0.5)); g.lineTo(X(0.98), Z(0.5)); g.stroke(); },
            shark: g => { const m = [[1.01, 0.48], [0.82, 0.42], [0.74, 0.3], [0.86, 0.2], [1.01, 0.2]]; poly(g, m, K, Y); for (let i = 0; i < 6; i++) { const u = 0.77 + i * 0.04; poly(g, [[u, 0.4 - i * 0.004], [u + 0.035, 0.4 - i * 0.004], [u + 0.017, 0.32]], Wh, Y); poly(g, [[u + 0.01, 0.215], [u + 0.045, 0.215], [u + 0.028, 0.28]], Wh, Y); } g.fillStyle = K; g.beginPath(); g.arc(X(0.8), Y(0.55), 11, 0, TAU); g.fill(); g.fillStyle = Wh; g.beginPath(); g.arc(X(0.802), Y(0.565), 4, 0, TAU); g.fill(); for (let i = 0; i < 3; i++) poly(g, [[0.55 + i * 0.03, 0.48], [0.57 + i * 0.03, 0.48], [0.55 + i * 0.03, 0.34]], K, Y); poly(g, [[0.15, 0.5], [0.35, 0.47], [0.48, 0.5], [0.35, 0.53]], T, Z); },
            checker: g => { const s = 20; for (let q = 0; q < 2; q++) for (let x = 0; x < 512; x += s) for (let y = q * 256; y < q * 256 + 256; y += s) { const u = x / 512, h = ((x * 73 + y * 151) % 101) / 101; if (h < u * 1.6 - 0.25) continue; g.fillStyle = ((x + y) / s) % 2 ? Wh : K; g.fillRect(x, y, s, s); } }
          };
        })();
        Object.assign(crDP, { shark: crDP.lockjaw, bstripes: crDP.stripes, bflames: crDP.flames, vector: crDP.chevron, mstripes: crDP.stripes, mflames: crDP.flames, mdots: crDP.splat, vstripes: crDP.stripes, vflames: crDP.flames, vwings: crDP.wings });
        const crDTs = {};
        const crDecalTex = id => crDTs[id] || (crDTs[id] = tex(512, 512, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512); if (crDP[id]) crDP[id](g); }));
        const crPM = (o, mid, bid) => {
          const key = mid + '|' + bid;
          if (!o.pms) o.pms = {};
          if (o.pms[key]) return o.pms[key];
          const M = crModel(mid).m, base = crPal(mid, 0), bb = crFit(mid, bid).bb, env = crEnv();
          let body = null, paint = null;
          const arr = M.mats.map((q, i) => {
            if (q.k === 'body') return body = crDecalMat({ color: lin(crTeam[0].p), metalness: 0.2, roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.05, envMap: env, envMapIntensity: 0.9 });
            if (q.k === 'paint') return paint = own(base[i].clone());
            return base[i];
          });
          if (body) { const U = body.userData.du; U.dBox.value.set(bb.min.x, 1 / (bb.max.x - bb.min.x), bb.min.z, 1 / (bb.max.z - bb.min.z)); U.dWy.value = 1 / Math.max(bb.max.y, 1); }
          return o.pms[key] = { arr, body, paint };
        };
        const crWPals = {};
        const crWSh = (m, f) => { m.onBeforeCompile = sh => { sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = position;'); sh.fragmentShader = 'varying vec3 vWP;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + f); }; m.customProgramCacheKey = () => f; return m; };
        const crWRim = 'float wr = length(vWP.xz); diffuseColor.rgb *= mix(0.1, 1.0, smoothstep(0.25, 0.36, vWP.y)) * mix(1.0, 0.3, smoothstep(0.52, 0.58, wr));';
        const crWTread = 'float wr = length(vWP.xz), wa = atan(vWP.z, vWP.x), wf = fract(wa * 12.7324 + abs(vWP.y) * 3.4), wg = smoothstep(0.03, 0.12, wf) * smoothstep(0.66, 0.57, wf), ws = smoothstep(0.93, 0.97, wr); diffuseColor.rgb *= mix(1.0, mix(0.45, 1.75, wg), ws * smoothstep(0.43, 0.36, abs(vWP.y)));';
        const crWMid = mid => crModel('octane') ? 'octane' : mid;
        const crWPal = mid => {
          mid = crWMid(mid);
          if (crWPals[mid]) return crWPals[mid];
          const M = crModel(mid).m, env = crEnv(), tx = M.tex || {};
          return crWPals[mid] = M.wmats.map(q => {
            if (q.k === 'rim') return own(crWSh(new THREE.MeshPhysicalMaterial(Object.assign({ metalness: 0.6, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.1, envMap: env, envMapIntensity: 0.5 }, tx.rim ? { map: crTex(tx.rim) } : { color: lin('#6a655e') })), crWRim));
            return own(crWSh(new THREE.MeshStandardMaterial({ color: lin('#222226'), roughness: 0.85, metalness: 0, envMap: env, envMapIntensity: 0.5 }), crWTread));
          });
        };
        const crGroups = parts => {
          const by = [[], [], [], []];
          for (const [g, mi] of parts) by[mi].push(g);
          const ms = by.map(l => l.length ? mergeG(l) : null), out = own(new THREE.BufferGeometry());
          let n = 0; for (const m of ms) if (m) n += m.attributes.position.count;
          const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
          let o = 0;
          ms.forEach((m, i) => { if (!m) return; const c = m.attributes.position.count; pos.set(m.attributes.position.array, o * 3); nor.set(m.attributes.normal.array, o * 3); out.addGroup(o, c, i); o += c; m.dispose(); });
          out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
          out.computeBoundingSphere();
          return out;
        };
        const crGlowMs = {};
        const crGlowM = c => crGlowMs[c] || (crGlowMs[c] = own(new THREE.MeshBasicMaterial({ color: lin(c, 1.5), toneMapped: false })));
        const crStdM = {};
        const crMat = (c, m, r, cc) => { const k = c + m + r + (cc || 0); return crStdM[k] || (crStdM[k] = own(new THREE.MeshPhysicalMaterial({ color: lin(c), metalness: m, roughness: r, clearcoat: cc || 0, clearcoatRoughness: 0.1, envMap: crEnv(), envMapIntensity: 1 }))); };
        const crWG = {};
        const crWheelGeo = id => {
          if (crWG[id]) return crWG[id];
          const P = [], add = (g, mi) => P.push([g, mi]), rough = id === 'rough';
          const prof = [[0.69, -0.43], [0.84, -0.446], [0.94, -0.43], [0.99, -0.37], [1, -0.22], [1, 0.22], [0.99, 0.37], [0.94, 0.43], [0.84, 0.446], [0.69, 0.43], [0.685, 0.2], [0.685, -0.2], [0.69, -0.43]].map(([r, y]) => new THREE.Vector2(r * (rough ? 0.94 : 1), y));
          add(new THREE.LatheGeometry(prof, 40), 1);
          if (rough) for (let i = 0; i < 26; i++) add(new THREE.BoxGeometry(0.12, i % 2 ? 0.36 : 0.26, 0.17).translate(0.96, i % 2 ? 0.1 : -0.12, 0).rotateY(i * TAU / 26), 1);
          add(new THREE.CylinderGeometry(0.69, 0.69, 0.03, 28).translate(0, -0.05, 0), 1);
          const lip = (r, t, y, mi) => add(new THREE.TorusGeometry(r, t, 6, 36).rotateX(crPI / 2).translate(0, y, 0), mi);
          const hub = (r, y, mi) => add(new THREE.CylinderGeometry(r, r * 1.12, 0.12, 14).translate(0, y, 0), mi);
          const spokes = (n, w, t, y, tw, mi, len = 0.56, r0 = 0.42) => { for (let i = 0; i < n; i++) add(new THREE.BoxGeometry(len, t, w).rotateY(tw).translate(r0, y, 0).rotateY(i * TAU / n), mi); };
          const disc = () => { add(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 28).translate(0, 0.08, 0), 3); for (let i = 0; i < 8; i++) add(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 10).translate(0.28, 0.08, 0).rotateY(i * TAU / 8), 0); };
          const bar = (a, b, w, t, y, mi) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); add(new THREE.BoxGeometry(l + w, t, w).rotateY(-Math.atan2(dz, dx)).translate((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2), mi); };
          if (id === 'star') { disc(); lip(0.68, 0.03, 0.4, 0); hub(0.13, 0.38, 0); spokes(5, 0.07, 0.07, 0.37, 0, 0, 0.56, 0.4); }
          else if (id === 'mesh') { lip(0.68, 0.035, 0.4, 0); for (let i = 0; i < 5; i++) { const a = i * TAU / 5, b = a + TAU / 10, c = a + TAU / 5, P1 = [Math.cos(a) * 0.66, Math.sin(a) * 0.66], P2 = [Math.cos(b) * 0.3, Math.sin(b) * 0.3], P3 = [Math.cos(c) * 0.66, Math.sin(c) * 0.66]; bar(P1, P2, 0.08, 0.07, 0.38, 0); bar(P2, P3, 0.08, 0.07, 0.38, 0); bar([0, 0], P2, 0.05, 0.06, 0.36, 0); } add(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 5).translate(0, 0.39, 0), 0); for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8).translate(0.1, 0.44, 0).rotateY(i * TAU / 5 + 0.6), 1); }
          else if (id === 'dish') { lip(0.69, 0.05, 0.41, 0); add(new THREE.CylinderGeometry(0.67, 0.67, 0.05, 32).translate(0, 0.37, 0), 0); add(new THREE.TorusGeometry(0.52, 0.025, 6, 32).rotateX(crPI / 2).translate(0, 0.4, 0), 1); for (let i = 0; i < 16; i++) add(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6).translate(0.6, 0.41, 0).rotateY(i * TAU / 16), 3); add(new THREE.ConeGeometry(0.2, 0.42, 20).translate(0, 0.6, 0), 3); }
          else if (id === 'tri') { disc(); lip(0.68, 0.035, 0.4, 0); hub(0.17, 0.38, 0); spokes(3, 0.22, 0.08, 0.37, 0.45, 0, 0.6, 0.38); add(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 6).translate(0, 0.46, 0), 3); }
          else if (id === 'rough') { lip(0.64, 0.05, 0.4, 0); spokes(5, 0.13, 0.1, 0.36, 0.2, 0, 0.5, 0.36); hub(0.17, 0.38, 0); for (let i = 0; i < 10; i++) add(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 6).translate(0.6, 0.43, 0).rotateY(i * TAU / 10), 3); }
          else if (id === 'turbine') { add(new THREE.CylinderGeometry(0.66, 0.66, 0.05, 32).translate(0, 0.2, 0), 2); for (let i = 0; i < 22; i++) add(new THREE.BoxGeometry(0.5, 0.025, 0.11).rotateX(0.7).translate(0.4, 0.3, 0).rotateY(i * TAU / 22), 0); add(new THREE.SphereGeometry(0.17, 16, 10).scale(1, 0.8, 1).translate(0, 0.36, 0), 1); add(new THREE.TorusGeometry(0.06, 0.018, 6, 16).rotateX(crPI / 2).translate(0, 0.5, 0), 2); }
          else { disc(); lip(0.68, 0.03, 0.4, 0); spokes(4, 0.08, 0.07, 0.36, 0, 0, 0.56, 0.4); hub(0.12, 0.38, 0); for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.06, 0.04, 0.09).translate(0.66, 0.42, 0).rotateY(i * TAU / 4), 2); add(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12).translate(0, 0.46, 0), 2); }
          return crWG[id] = crGroups(P);
        };
        let crTyreM = null;
        const crTyre = () => crTyreM || (crTyreM = own(crWSh(new THREE.MeshStandardMaterial({ color: lin('#222226'), roughness: 0.85, metalness: 0, envMap: crEnv(), envMapIntensity: 0.5 }), crWTread)));
        const crWMs = {};
        const crWheelMat = (id, team) => {
          const k = id + team;
          if (crWMs[k]) return crWMs[k];
          const jet = id === 'turbine', rub = jet ? crMat('#e9eaec', 0.1, 0.35, 0.8) : crTyre(), gl = id === 'neon' ? crGlowM('#8fe6ff') : jet ? crMat('#1a1b1e', 0.4, 0.4) : crGlowM(crTeamL[team]), dc = crMat('#b9bdc3', 0.9, 0.3);
          const rim = { star: crMat('#1d1e22', 0.5, 0.35, 0.5), mesh: crMat('#7d6c52', 0.7, 0.4, 0.3), dish: crMat('#2a2b30', 0.6, 0.45, 0.3), tri: crMat('#26272c', 0.6, 0.32, 0.6), rough: crMat('#222327', 0.5, 0.45), turbine: crMat('#2c2e33', 0.7, 0.3, 0.4), neon: crMat('#1b1c20', 0.5, 0.35, 0.5) }[id] || crMat('#888', 0.8, 0.3);
          return crWMs[k] = [rim, rub, gl, dc];
        };
        const crTG = {};
        const crTopGeo = id => {
          if (crTG[id]) return crTG[id];
          const P = [], add = (g, mi) => P.push([g, mi]);
          if (id === 'cone') { add(new THREE.CylinderGeometry(8.2, 10.5, 17, 24).translate(0, 8.5, 0), 0); add(new THREE.CylinderGeometry(0.5, 0.5, 4, 6).translate(0, 18.5, 0), 1); add(new THREE.CylinderGeometry(0.9, 0.3, 9, 8).translate(0, -4.5, 0).rotateZ(-0.9).translate(0, 19.5, 0), 1); add(new THREE.SphereGeometry(1.4, 8, 6).translate(7.3, 13.5, 0), 1); }
          else if (id === 'party') { add(new THREE.SphereGeometry(11, 20, 10, 0, TAU, 0, crPI / 2).scale(1.05, 0.85, 1), 0); add(new THREE.SphereGeometry(13.5, 20, 6, 0, TAU, 1.35, 0.25).scale(1.05, 0.6, 1).translate(0, -0.6, 0), 0); for (const s of [1, -1]) add(new THREE.BoxGeometry(5, 9, 10).translate(0, 3.5, s * 9.5), 1); add(new THREE.BoxGeometry(5, 1.4, 1.4).translate(0, 9.6, 0), 1); add(new THREE.SphereGeometry(1.5, 8, 6).translate(0, 9.8, 0), 1); }
          else if (id === 'tophat') { for (const s of [1, -1]) { add(new THREE.CylinderGeometry(8, 8, 1.6, 26).rotateZ(crPI / 2).translate(1, 7, s * 9), 1); add(new THREE.TorusGeometry(8, 1, 6, 26).rotateY(crPI / 2).translate(1.4, 7, s * 9), 0); add(new THREE.BoxGeometry(14, 1.6, 1.6).translate(-6, 9, s * 16.5), 0); } add(new THREE.BoxGeometry(2, 2.4, 4).translate(1.4, 9, 0), 0); }
          else if (id === 'halo') { add(new THREE.TorusGeometry(15, 1.7, 10, 40).rotateX(crPI / 2).translate(0, 14, 0), 2); }
          else { add(new THREE.SphereGeometry(10.5, 18, 8, 0, TAU, 0, crPI / 2).scale(1, 1.15, 1).translate(0, 2, 0), 1); add(new THREE.CylinderGeometry(12, 11, 9, 20, 1, true).translate(0, 5, 0), 0); add(new THREE.CylinderGeometry(11.6, 11.6, 1.2, 20).translate(0, 1, 0), 0); add(new THREE.TorusGeometry(11.2, 1.1, 6, 24).rotateX(crPI / 2).translate(0, 1.5, 0), 3); for (let i = 0; i < 6; i++) { add(new THREE.ConeGeometry(3, 9, 8).translate(11.5, 14, 0).rotateY(i * TAU / 6), 0); add(new THREE.SphereGeometry(1.8, 8, 6).translate(12.2, 5, 0).rotateY(i * TAU / 6 + 0.52), 2); } add(new THREE.SphereGeometry(2.2, 10, 8).translate(0, 15, 0), 0); add(new THREE.BoxGeometry(1.2, 5, 1.2).translate(0, 18.5, 0), 0); add(new THREE.BoxGeometry(4, 1.2, 1.2).translate(0, 18.5, 0), 0); }
          if (id === 'tophat') for (const [q] of P) q.rotateZ(0.9);
          const k = { crown: 1.35, party: 1.3, tophat: 1.15 }[id] || 1, g = crGroups(P).scale(k, k, k).rotateX(crPI / 2); g.computeBoundingSphere();
          return crTG[id] = g;
        };
        const crAG = {};
        const crAntGeo = id => {
          if (crAG[id]) return crAG[id];
          const P = [], add = (g, mi) => P.push([g, mi]), H = 44;
          add(new THREE.CylinderGeometry(1.3, 1.6, 2.2, 10).translate(0, 1.1, 0), 0);
          add(new THREE.CylinderGeometry(0.32, 0.42, H, 6).translate(0, H / 2 + 2, 0), 0);
          const T = H + 2;
          if (id === 'ball') { add(new THREE.SphereGeometry(6, 18, 12).translate(0, T + 5.5, 0), 1); const ic = new THREE.IcosahedronGeometry(1, 0), v = ic.attributes.position, seen = new Set(); for (let i = 0; i < v.count; i++) { const x = v.getX(i), y = v.getY(i), z = v.getZ(i), k = [x, y, z].map(q => q.toFixed(2)).join(); if (seen.has(k)) continue; seen.add(k); const d = new THREE.Vector3(x, y, z).normalize(), c = new THREE.CylinderGeometry(2.1, 2.1, 0.6, 5).rotateX(crPI / 2); c.lookAt(d); add(c.translate(d.x * 5.75, T + 5.5 + d.y * 5.75, d.z * 5.75), 2); } }
          else if (id === 'smiley') { add(new THREE.SphereGeometry(6.2, 18, 12).translate(0, T + 5.8, 0), 1); for (const s of [1, -1]) add(new THREE.SphereGeometry(0.75, 8, 6).scale(0.6, 1.8, 1).translate(5.9, T + 7.4, s * 2), 2); add(new THREE.TorusGeometry(3.4, 0.55, 6, 14, crPI * 0.8).rotateZ(crPI * 1.1).rotateY(crPI / 2).translate(5.5, T + 6.2, 0), 2); }
          else if (id === 'flag') { add(new THREE.BoxGeometry(14, 9, 0.5).translate(7, T - 3.5, 0), 3); add(new THREE.BoxGeometry(4.6, 9.05, 0.55).translate(7, T - 3.5, 0), 1); add(new THREE.SphereGeometry(0.9, 8, 6).translate(0, T + 1, 0), 0); }
          else if (id === 'leaf') { add(new THREE.SphereGeometry(5, 14, 10).scale(0.55, 1.9, 0.12).rotateZ(-0.35).translate(2.6, T + 8, 0), 3); add(new THREE.CylinderGeometry(0.25, 0.3, 17, 5).rotateZ(-0.35).translate(2.6, T + 8, 0.5), 2); }
          else if (id === 'macaron') { for (const y of [2.4, 7]) add(new THREE.SphereGeometry(6, 18, 8).scale(1, 0.38, 1).translate(0, T + y, 0), 1); add(new THREE.CylinderGeometry(5.4, 5.4, 2.4, 18).translate(0, T + 4.7, 0), 2); }
          else if (id === 'skull') { add(new THREE.SphereGeometry(5.5, 16, 12).scale(1, 1.05, 1.08).translate(0, T + 7, 0), 1); add(new THREE.BoxGeometry(5.4, 3.6, 6.2).translate(1.4, T + 2.6, 0), 1); for (const s of [1, -1]) add(new THREE.SphereGeometry(1.5, 8, 6).translate(5.2, T + 6.4, s * 2.1), 2); add(new THREE.ConeGeometry(0.8, 1.6, 4).rotateX(crPI).translate(5.6, T + 4.6, 0), 2); }
          const g = crGroups(P).rotateX(crPI / 2); g.computeBoundingSphere();
          return crAG[id] = g;
        };
        const crAntMat = (id, team) => {
          const pole = crMat('#a7abb2', 0.85, 0.3);
          if (id === 'ball') return [pole, crMat('#f4f4f2', 0, 0.45, 0.4), crMat('#141416', 0, 0.5), pole];
          if (id === 'smiley') return [pole, crMat('#ffd21a', 0, 0.4, 0.5), crMat('#141416', 0, 0.6), pole];
          if (id === 'flag') return [pole, crMat('#f4f4f4', 0, 0.7), pole, crMat(crTeam[team].p, 0, 0.6)];
          if (id === 'leaf') return [pole, pole, crMat('#4d7a23', 0, 0.7), crMat('#6cae2c', 0, 0.55, 0.3)];
          if (id === 'macaron') return [pole, crMat('#f6a8c4', 0, 0.75), crMat('#fbeef0', 0, 0.6), pole];
          return [pole, crMat('#ece7da', 0, 0.55), crMat('#1a1716', 0, 0.8), pole];
        };
        let crCheckM = null;
        const crCheck = () => crCheckM || (crCheckM = own(crWSh(new THREE.MeshStandardMaterial({ color: lin('#b39466'), roughness: 0.9, metalness: 0, envMap: crEnv(), envMapIntensity: 0.4 }), 'float cka = step(0.62, fract(vWP.x * 0.33)), ckb = step(0.62, fract(vWP.y * 0.33 + vWP.z * 0.33)); diffuseColor.rgb *= 1.0 - 0.38 * max(cka, ckb) - 0.15 * cka * ckb;')));
        const crTopMat = (id, team) => {
          const gl = crGlowM('#ffe28a');
          if (id === 'cone') return [crMat('#b5121b', 0.05, 0.75), crMat('#141416', 0, 0.8), gl];
          if (id === 'party') return [crCheck(), crMat('#6e5536', 0, 0.85), gl];
          if (id === 'tophat') return [crMat('#141418', 0.3, 0.4, 0.5), crMat('#d01a1a', 0.2, 0.08, 1), gl];
          if (id === 'halo') return [crMat('#f2e2b0', 0.9, 0.3), crMat('#fff', 0, 0.5), crGlowM('#fff1c4')];
          return [crMat('#e6b43a', 1, 0.22, 1), crMat('#8e0d1e', 0, 0.8), crMat('#2a6cff', 0.2, 0.1, 1), crMat('#f4f4f4', 0, 0.6)];
        };
        let crDK = null;
        const crDisc = () => crDK || (crDK = { g: own(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 28).translate(0, 0.12, 0)), m: own(new THREE.MeshStandardMaterial({ color: lin('#c4c6ca'), metalness: 0.75, roughness: 0.4, envMap: crEnv(), envMapIntensity: 0.6, map: tex(128, 128, (g, w) => { const c = w / 2; g.fillStyle = '#9ea2a8'; g.fillRect(0, 0, w, w); g.fillStyle = '#e6e8ec'; g.beginPath(); g.arc(c, c, c * 0.98, 0, TAU); g.fill(); g.fillStyle = '#5a5d63'; g.beginPath(); g.arc(c, c, c * 0.5, 0, TAU); g.fill(); g.fillStyle = '#2a2b2f'; g.beginPath(); g.arc(c, c, c * 0.3, 0, TAU); g.fill(); g.fillStyle = '#3a3c40'; for (let k = 0; k < 3; k++) for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + k * 0.12, r = c * (0.62 + k * 0.11); g.beginPath(); g.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 2.6, 0, TAU); g.fill(); } }) })) });
        let crFB = null;
        const crFallback = () => crFB || (crFB = { body: own(new THREE.BoxGeometry(110, 76, 30).translate(8, 0, 6)), wheel: own(new THREE.CylinderGeometry(1, 1, 0.8, 16)), mat: own(new THREE.MeshStandardMaterial({ color: lin('#5a6170'), roughness: 0.5, metalness: 0.3 })) });
        const crFlames = (o, nz) => nz.map(([x, y, z, r]) => {
          const g = new THREE.Group(); g.position.set(x, y, z); g.visible = false; o.bg.add(g);
          const FM = crFlM('std', o.team || 0), out = new THREE.Mesh(crFl.plume, FM.o), core = new THREE.Mesh(crFl.cone, FM.c), glow = new THREE.Sprite(FM.g);
          out.renderOrder = 7; core.renderOrder = 8; glow.renderOrder = 8; g.add(out, core, glow);
          return { g, o: out, c: core, s: glow, x, y, z, r };
        });
        const crApplyCos = (o, cos) => {
          const team = o.team || 0, C = cos || crCosOf(null, team), P = o.pm, MD = o.mid ? crModel(o.mid) : null;
          if (P && P.body) {
            const F = crItem('fin', C.fin) || crCat.fin[0], U = P.body.userData.du, D = C.decal !== 'none' && crItem('decal', C.decal);
            P.body.color.copy(lin(crHex(C.p) || crTeam[team].p, 0.72)); if (D && D.id === 'flutterby') P.body.color.lerp(lin(crTeamL[team], 0.72), 0.35); P.body.metalness = F.m; P.body.roughness = F.ro; P.body.clearcoat = F.cc; P.body.clearcoatRoughness = F.ccr; P.body.envMapIntensity = F.e || 0.3;
            U.dOn.value = D ? 1 : 0; U.dTex.value = D ? crDecalTex(D.id) : null; const dc = crHex(C.a) && crHex(C.a) !== crTeam[team].a ? C.a : crTeamL[team]; U.dA.value.copy(lin(dc)); U.dT.value.copy(lin(dc));
          }
          if (P && P.paint) P.paint.color.copy(lin(crHex(C.a) || crTeam[team].a));
          const wid = crItem('wheel', C.wheel) ? C.wheel : 'stock', st = wid === 'stock' || !MD;
          for (const w of o.wheels) { w.m.geometry = st ? (MD ? crModel(crWMid(o.mid)).wheel : crFallback().wheel) : crWheelGeo(wid); w.m.material = st ? (MD ? crWPal(o.mid) : crFallback().mat) : crWheelMat(wid, team); if (w.dk) w.dk.visible = st && !!MD; }
          if (o.top) { o.bg.remove(o.top); o.top = null; }
          const tid = crItem('top', C.top) ? C.top : 'none';
          if (tid !== 'none' && o.roof) { const m = new THREE.Mesh(crTopGeo(tid), crTopMat(tid, team)); m.position.set(o.roof[0], o.roof[1], o.roof[2] - 1.5); m.castShadow = true; o.bg.add(m); o.top = m; }
          if (o.ant) { o.bg.remove(o.ant); o.ant = null; }
          const aid = crItem('ant', C.ant) ? C.ant : 'none';
          if (aid !== 'none' && o.antP) { const m = new THREE.Mesh(crAntGeo(aid), crAntMat(aid, team)); m.position.set(o.antP[0], o.antP[1], o.antP[2]); m.castShadow = true; o.bg.add(m); o.ant = m; }
          o.tz = o.tz0 + (o.top ? 26 : 0);
          o.bs = crItem('boost', C.boost) || crCat.boost[0];
          const FM = crFlM(o.bs.id, team);
          for (const f of o.fl) { f.o.material = FM.o; f.c.material = FM.c; f.s.material = FM.g; }
          o.ts = crItem('trail', C.trail) || crCat.trail[0];
          const pc = lin(crHex(C.p) || crTeam[team].p), pk = 1 / Math.max(pc.r, pc.g, pc.b, 0.05); o.pcol = [pc.r * pk, pc.g * pk, pc.b * pk];
          o.cosRef = cos; o.cosV = crCosV;
        };
        const crAssemble = (o, id, team, flames) => {
          const B = BODIES[id] || BODIES[BODY_IDS[0]], mid = crPick(id), F = mid ? crFit(mid, id) : null, FB = mid ? null : crFallback();
          for (const w of o.wheels || []) o.g.remove(w.piv);
          while (o.bg.children.length) o.bg.remove(o.bg.children[0]);
          o.top = null; o.ant = null; o.team = team; o.mid = mid;
          o.pm = F ? crPM(o, mid, id) : null;
          const mb = new THREE.Mesh(F ? F.geo : FB.body, F ? o.pm.arr : FB.mat); mb.castShadow = true; o.bg.add(mb);
          o.wheels = [];
          for (const [Wd, front] of [[B.wf, true], [B.wb, false]]) for (const s of [1, -1]) {
            const piv = new THREE.Group(); piv.position.set(Wd[0], Wd[1] * s, Wd[2] - (B.rz || CFG.carRest)); o.g.add(piv);
            const spin = new THREE.Group(); piv.add(spin);
            const m = new THREE.Mesh(crFallback().wheel, crFallback().mat); m.scale.set(Wd[2], Wd[2] * s, Wd[2]); m.castShadow = true; spin.add(m);
            const dk = new THREE.Mesh(crDisc().g, crDisc().m); dk.visible = false; m.add(dk);
            o.wheels.push({ piv, spin, m, dk, front, z: Wd[2] - (B.rz || CFG.carRest) });
          }
          o.rf = B.wf[2]; o.rb = B.wb[2]; o.tr = [B.wb[0] - 2, B.wb[1], B.wb[2] * 0.12 - (B.rz || CFG.carRest)]; o.tz0 = o.tz = F ? F.tz : 60; o.body = id; o.roof = F ? F.roof : [0, 0, 40]; o.antP = F ? F.ant : [-30, 10, 36];
          o.fl = flames ? crFlames(o, F ? F.nz : [[-48, 0, 4, 6]]) : [];
          if (o.sh) { o.sh.position.set(F ? F.cx : 8, 0, 0.6 - (B.rz || CFG.carRest)); o.sh.scale.set(F ? (F.bb.max.x - F.bb.min.x) * 1.08 : 130, F ? (F.bb.max.y - F.bb.min.y) * 1.25 : 90, 1); }
          crApplyCos(o, o.car && o.car.cos || o.cos || null);
        };
        const crSetBody = (cv, id) => { if (!BODIES[id]) id = BODIES.octane ? 'octane' : BODY_IDS[0]; if (cv.body !== id) crAssemble(cv, id, cv.team, true); };
        const crSync = cv => { const c = cv.car; if (c && (cv.cosRef !== c.cos || cv.cosV !== crCosV)) crApplyCos(cv, c.cos || null); };
        const crSh = { g: own(new THREE.PlaneGeometry(1, 1)), m: own(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false, fog: false, map: tex(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.55, 'rgba(255,255,255,.75)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }) })) };
        const crNps = () => { const v = typeof saved === 'object' && saved && saved.ifx ? +saved.ifx.nps : 100; return Number.isFinite(v) ? Math.max(0.5, Math.min(1.5, v / 100)) : 1; };
        const carVis = [];
        for (let team = 0; team < 2; team++) for (let slot = 0; slot < 3; slot++) {
          const g = new THREE.Group(); g.matrixAutoUpdate = false; g.visible = false; scene.add(g);
          const bg = new THREE.Group(); g.add(bg);
          const sh = new THREE.Mesh(crSh.g, crSh.m); sh.visible = false; sh.renderOrder = 1; g.add(sh);
          const tag = new THREE.Sprite(crTagMat('', team)); tag.center.set(0.5, 0); tag.renderOrder = 9; tag.frustumCulled = false; tag.visible = false; scene.add(tag);
          tag.onBeforeRender = (r, s, cam) => { const d = cam.position.distanceTo(tag.position), hh = d < 160 ? 0.001 : Math.min(300, Math.max(24, d * 0.05)), ns = crNps(); tag.scale.set(hh * 4 * ns, hh * ns, 1); tag.updateMatrix(); tag.matrixWorld.copy(tag.matrix); };
          carVis.push({ team, slot, g, bg, tag, sh, body: null, wheels: [], fl: [], tr: [0, 0, 0], tz: 60, tz0: 60, rf: 12.5, rb: 15, trails: [crTrail(), crTrail()], car: null, bs: crCat.boost[0], ts: crCat.trail[0], s: { reset: true, vx: 0, vy: 0, vz: 0, px: 0, py: 0, pz: 0, vu: 0, gr: true, z: 0, zv: 0, pi: 0, pv: 0, ro: 0, rv: 0, ws: 0, af: 0, ab: 0, sa: 0, wd: 0, sw: [0, 0, 0, 0], bt: 0, ea: 0, es: 0, pt: 0 } });
        }
        const visOf = c => carVis[c.team * 3 + c.slot];
        const bindCars = () => {
          carVis.forEach(cv => { cv.car = null; cv.g.visible = false; cv.tag.visible = false; cv.trails.forEach(t => { t.n = 0; t.m.visible = false; }); cv.fl.forEach(f => { f.g.visible = false; }); cv.s.reset = true; cv.s.bt = 0; });
          for (const c of W.cars) {
            const cv = visOf(c);
            if (!cv) continue;
            const vi = active().findIndex(v => v.car === c);
            cv.car = c; cv.g.visible = true; crSetBody(cv, c.body); crSync(cv);
            cv.tag.material = crTagMat(c.name, c.team); cv.tag.layers.set(vi < 0 ? 1 : 2 + vi);
          }
        };
        let crTS = null;
        const crThumbs = {};
        const crSnapEnv = () => {
          if (crTS) return crTS;
          const s = new THREE.Scene();
          s.add(new THREE.HemisphereLight(0xeef4ff, 0x3a4048, 0.85));
          const dl = new THREE.DirectionalLight(0xffffff, 1.25); dl.position.set(160, 260, 420); s.add(dl);
          const dl2 = new THREE.DirectionalLight(0xbcd2ff, 0.45); dl2.position.set(-300, -200, 120); s.add(dl2);
          const cam = new THREE.PerspectiveCamera(24, 240 / 140, 1, 5000); cam.up.set(0, 0, 1);
          const rt = own(new THREE.WebGLRenderTarget(480, 280)); rt.texture.encoding = THREE.sRGBEncoding;
          crTS = { s, cam, rt, px: new Uint8Array(480 * 280 * 4), o: { g: new THREE.Group(), bg: new THREE.Group(), wheels: [], fl: [], team: 0 }, x: new THREE.Group() };
          crTS.o.g.add(crTS.o.bg); s.add(crTS.o.g, crTS.x);
          return crTS;
        };
        const crSnap = () => {
          const { s, cam, rt, px } = crTS;
          const pt = renderer.getRenderTarget(), pc = renderer.getClearColor(new THREE.Color()), pa = renderer.getClearAlpha(), ps = renderer.getScissorTest();
          renderer.setScissorTest(false); renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(s, cam);
          renderer.readRenderTargetPixels(rt, 0, 0, 480, 280, px);
          renderer.setRenderTarget(pt); renderer.setClearColor(pc, pa); renderer.setScissorTest(ps);
          const c1 = document.createElement('canvas'); c1.width = 480; c1.height = 280;
          const g1 = c1.getContext('2d'), im = g1.createImageData(480, 280);
          for (let y = 0; y < 280; y++) im.data.set(px.subarray((279 - y) * 1920, (280 - y) * 1920), y * 1920);
          g1.putImageData(im, 0, 0);
          const c2 = document.createElement('canvas'); c2.width = 240; c2.height = 140;
          const g2 = c2.getContext('2d'); g2.imageSmoothingQuality = 'high'; g2.drawImage(c1, 0, 0, 240, 140);
          return c2.toDataURL('image/png');
        };
        const crCosKey = c => c ? [c.p, c.a, c.fin, c.decal, c.wheel, c.top, c.ant].join(',') : '';
        const crThumb = (body, team = 0, cos = null, view = 0) => {
          if (!BODIES[body]) body = BODIES.octane ? 'octane' : BODY_IDS[0];
          team = team ? 1 : 0;
          const key = body + team + view + crCosKey(cos);
          if (crThumbs[key]) return crThumbs[key];
          try {
            const { cam, o, x } = crSnapEnv(), mid = crPick(body);
            o.cos = cos; o.g.visible = true; x.visible = false;
            crAssemble(o, body, team, false);
            const cx = mid ? crFit(mid, body).cx : 8, a = view ? 1.5708 : 0.62, el = view ? 0.12 : 0.3, dist = view ? 282 : 232;
            cam.fov = 24; cam.updateProjectionMatrix();
            cam.position.set(cx + dist * Math.cos(a) * Math.cos(el), dist * Math.sin(a) * Math.cos(el), 8 + dist * Math.sin(el)); cam.lookAt(cx, 0, view ? 10 : 4);
            return crThumbs[key] = crSnap();
          } catch (e) { return ''; }
        };
        const crIcon = (k, id, team = 0) => {
          const key = k + ':' + id + team;
          if (crThumbs[key]) return crThumbs[key];
          try {
            const { cam, o, x } = crSnapEnv();
            o.g.visible = false; x.visible = true;
            while (x.children.length) x.remove(x.children[0]);
            let m;
            if (k === 'wheel') {
              const MD = crModel(crPick('octane'));
              m = new THREE.Mesh(id === 'stock' ? MD ? MD.wheel : crFallback().wheel : crWheelGeo(id), id === 'stock' ? MD ? crWPal(crPick('octane')) : crFallback().mat : crWheelMat(id, team));
              m.scale.setScalar(64); m.rotation.z = 0.5; cam.fov = 30; cam.position.set(0, 300, 50); cam.lookAt(0, 0, 0);
            } else if (k === 'ant') {
              m = new THREE.Mesh(crAntGeo(id), crAntMat(id, team)); const cx = id === 'flag' ? 7 : 0, cz = id === 'flag' ? 44 : id === 'leaf' ? 54 : 52; cam.fov = 30; cam.position.set(cx + 30, 14, cz + 8); cam.lookAt(cx, 0, cz);
            } else {
              m = new THREE.Mesh(crTopGeo(id), crTopMat(id, team)); cam.fov = 30; cam.position.set(78, 50, 52); cam.lookAt(0, 0, 13);
            }
            cam.updateProjectionMatrix(); x.add(m);
            return crThumbs[key] = crSnap();
          } catch (e) { return ''; }
        };
