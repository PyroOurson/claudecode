        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xaebccb, 3500, 34000);
        const arSunD = new THREE.Vector3(0.36, -0.3, 0.88).normalize();
        const hemi = new THREE.HemisphereLight(0xcfe0f2, 0x46603a, 0.58); hemi.position.set(0, 0, 1); scene.add(hemi);
        const sun = new THREE.DirectionalLight(0xffe6c2, 1.2);
        sun.position.copy(arSunD).multiplyScalar(11000); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
        Object.assign(sun.shadow.camera, { left: -4750, right: 4000, top: 6950, bottom: -6400, near: 3000, far: 20000 });
        sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 3;
        scene.add(sun, sun.target);

        const arSkyTL = Math.PI * 0.56, arSunA = Math.atan2(arSunD.y, arSunD.x), arSunE = 0.62;
        const skyT = tex(2048, 512, (g, tw, th) => {
          const gr = g.createLinearGradient(0, 0, 0, th);
          [[0, '#123f9c'], [0.25, '#1c56b8'], [0.5, '#2f73cc'], [0.7, '#5592d8'], [0.82, '#82b0e0'], [0.885, '#a9c6e4'], [0.9, '#a7b8c4'], [0.93, '#6f7f6c'], [1, '#3e4c38']].forEach(([o, c]) => gr.addColorStop(o, c));
          g.fillStyle = gr; g.fillRect(0, 0, tw, th);
          const PX = a => ((((a - Math.PI) / TAU) % 1) + 1) % 1 * tw, PY = e => (Math.PI / 2 - e) / arSkyTL * th, kx = tw / TAU, ky = th / arSkyTL;
          const blob = (a, e, rx, ry, c0, c1) => {
            const x = PX(a), y = PY(e), sx = rx * kx / Math.max(0.2, Math.cos(e)), sy = ry * ky;
            for (const ox of [-tw, 0, tw]) {
              if (x + ox + sx < 0 || x + ox - sx > tw) continue;
              g.save(); g.translate(x + ox, y); g.scale(sx, sy);
              const rg = g.createRadialGradient(0, 0, 0, 0, 0, 1); rg.addColorStop(0, c0); rg.addColorStop(1, c1);
              g.fillStyle = rg; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
            }
          };
          const R = rngOf(3);
          for (let c = 0; c < 70; c++) {
            const a = R() * TAU, e = 0.08 + Math.pow(R(), 1.5) * 0.85, w = 0.12 + R() * 0.3, n = 10 + Math.floor(R() * 18), k = 0.55 + R() * 0.45;
            for (let p = 0; p < n; p++) {
              const pa = a + (R() - 0.5) * w, pe = e + (R() - 0.35) * w * 0.16, pr = (0.018 + R() * 0.045) * (0.6 + w * 1.4);
              blob(pa, pe - pr * 0.25, pr * 1.2, pr * 0.8, `rgba(150,168,192,${0.32 * k})`, 'rgba(150,168,192,0)');
              blob(pa, pe, pr * 1.15, pr * 0.85, `rgba(255,255,255,${0.62 * k})`, 'rgba(255,255,255,0)');
            }
          }
          blob(arSunA, arSunE, 0.75, 0.6, 'rgba(255,236,196,.42)', 'rgba(255,230,180,0)');
          blob(arSunA, arSunE, 0.22, 0.2, 'rgba(255,248,226,.85)', 'rgba(255,240,210,0)');
          blob(arSunA, arSunE, 0.045, 0.045, 'rgba(255,255,252,1)', 'rgba(255,255,245,.9)');
        });
        const arSkyM = own(new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
        const sky = new THREE.Mesh(own(new THREE.SphereGeometry(60000, 48, 20, 0, TAU, 0, arSkyTL)), arSkyM);
        sky.rotation.x = Math.PI / 2; scene.add(sky);
        const glowT = tex(64, 64, (g, tw) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.42)'); gr.addColorStop(0.65, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, tw); });
        {
          const sp = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: glowT, color: 0xfff3d6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, opacity: 0.9 })));
          const ce = Math.cos(arSunE);
          sp.position.set(Math.cos(arSunA) * ce * 55000, Math.sin(arSunA) * ce * 55000, Math.sin(arSunE) * 55000); sp.scale.set(15000, 15000, 1); sp.renderOrder = -1; scene.add(sp);
        }
        let arEnv = null;
        try {
          const es = new THREE.Scene(), pm = new THREE.PMREMGenerator(renderer);
          const sm = new THREE.Mesh(own(new THREE.SphereGeometry(50, 32, 12, 0, TAU, 0, arSkyTL)), arSkyM); sm.rotation.x = Math.PI / 2; es.add(sm);
          const gd = new THREE.Mesh(own(new THREE.CircleGeometry(70, 24)), own(new THREE.MeshBasicMaterial({ color: lin(0x46553c) }))); gd.position.z = -4; es.add(gd);
          const lg = own(new THREE.SphereGeometry(2.4, 8, 6)), lm = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 4.8, 4.4) }));
          for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2, m = new THREE.Mesh(lg, lm); m.position.set(Math.cos(a) * 38, Math.sin(a) * 42, 26); es.add(m); }
          const rt = pm.fromScene(es, 0.02); own(rt); arEnv = rt.texture; pm.dispose();
        } catch (e) { arEnv = null; }
        const outside = new THREE.Mesh(own(new THREE.PlaneGeometry(170000, 170000)), own(new THREE.MeshLambertMaterial({ color: lin(0x3f5a35) })));
        outside.position.z = -10; scene.add(outside);

        const arU = x => (x + CFG.X) / (2 * CFG.X), arV = y => (y + GB) / (2 * GB);
        const arFU = { arFC: { value: new THREE.Color(1, 1, 1) }, arFK: { value: 0 } };
        const arFlashable = m => { m.onBeforeCompile = sh => { sh.uniforms.arFC = arFU.arFC; sh.uniforms.arFK = arFU.arFK; sh.fragmentShader = 'uniform vec3 arFC;\nuniform float arFK;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, arFC * (0.15 + 1.6 * max(max(diffuseColor.r, diffuseColor.g), diffuseColor.b)), arFK);'); }; return m; };
        const arHex = (g, w, h, r) => {
          const hw = Math.sqrt(3) * r;
          g.beginPath();
          for (let row = -1; row * 1.5 * r < h + 2 * r; row++) for (let col = -1; col * hw < w + hw; col++) {
            const cx = col * hw + (row & 1) * hw / 2, cy = row * 1.5 * r;
            for (let k = 0; k <= 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
          }
        };
        const arDetT = tex(256, 256, (g, tw, th) => {
          g.fillStyle = '#808080'; g.fillRect(0, 0, tw, th);
          const R = rngOf(5);
          for (let i = 0; i < 6000; i++) { const d = R() < 0.5; g.fillStyle = d ? `rgba(30,30,30,${0.12 + R() * 0.2})` : `rgba(235,235,235,${0.1 + R() * 0.2})`; g.fillRect(R() * tw, R() * th, 1 + R() * 1.2, 2 + R() * 4); }
        }, true);
        const arGrass = m => { m.onBeforeCompile = sh => { sh.uniforms.arDet = { value: arDetT }; sh.fragmentShader = 'uniform sampler2D arDet;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= 0.6 + 0.8 * texture2D(arDet, vUv * vec2(26.0, 38.0)).r;'); }; return m; };
        const arFL = [], arHeavy = [];
        const arYk = CFG.Y / 5120, arBY0 = 3400 * arYk, arBX = 2560, arGY0 = 4400 * arYk, arGX = 1190, arCR = 1200, arCR0 = 580;
        {
          const ins = 40, k2 = ins * (Math.SQRT2 - 1), WH = [0.5, 0.53, 0.5], TLc = [[0.22, 0.45, 1], [1, 0.4, 0.1]];
          const circ = (cx, cy, r, a0, a1, n) => { const o = []; for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
          for (const s of [-1, 1]) {
            const t = s < 0 ? 0 : 1, Yg = s * (AY - ins);
            arFL.push({ p: [[AX - ins, 0], [AX - ins, s * (V1 - k2)], [V2 - k2, Yg], [-(V2 - k2), Yg], [-(AX - ins), s * (V1 - k2)], [-(AX - ins), 0]], w: 22, c: WH });
            arFL.push({ p: [[-arBX, Yg], [-arBX, s * arBY0], [arBX, s * arBY0], [arBX, Yg]], w: 24, c: WH });
            arFL.push({ p: [[-arGX, Yg], [-arGX, s * arGY0], [arGX, s * arGY0], [arGX, Yg]], w: 20, c: WH });
            const R = 2003, cy = s * (arBY0 - 430 + R), ap = [];
            for (let k = 0; k <= 24; k++) { const x = -1240 + 2480 * k / 24; ap.push([x, cy - s * Math.sqrt(R * R - x * x)]); }
            arFL.push({ p: ap, w: 22, c: WH });
            for (const sx of [-1, 1]) {
              arFL.push({ p: [[sx * 2410, s * (arBY0 - 40)], [sx * 2410, s * 60]], w: 26, c: TLc[t] }, { p: [[sx * 1600, s * (arBY0 - 40)], [sx * 1600, s * 60]], w: 26, c: TLc[t] }, { p: [[sx * 800, s * 2900 * arYk], [sx * 800, s * (arCR + 60)]], w: 26, c: TLc[t] });
              for (let y = 1260; y < 2960 * arYk; y += 240) arFL.push({ p: [[sx * 1000, s * y], [sx * 1000, s * (y + 120)]], w: 18, c: WH });
            }
          }
          arFL.push({ p: [[-(AX - ins), 0], [AX - ins, 0]], w: 22, c: WH });
          arFL.push({ p: circ(0, 0, arCR, 0, TAU, 96), w: 22, c: WH });
        }
        const arChev = (g, s, y0, y1, xw, per, wd) => {
          const a = Math.min(y0, y1) - 2 * xw - per, b = Math.max(y0, y1) + 2 * xw + per;
          for (let c = a; c < b; c += per) for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(0, c); g.lineTo(0, c + wd); g.lineTo(sx * xw, c + wd + s * xw); g.lineTo(sx * xw, c + s * xw); g.closePath(); g.fill(); }
        };
        const fieldT = tex(1024, 2048, (g, tw, th) => {
          const sx = tw / (2 * CFG.X), sy = th / (2 * GB), X0 = -CFG.X, Wd = 2 * CFG.X;
          g.setTransform(sx, 0, 0, -sy, tw / 2, th / 2);
          g.fillStyle = '#2c461b'; g.fillRect(X0, -GB, Wd, 2 * GB);
          const TC = ['#2a4994', '#8e4a1d'], TS = ['#24407a', '#7a4019'], TK = ['rgba(6,14,36,.32)', 'rgba(40,14,2,.32)'];
          for (const s of [-1, 1]) {
            const t = s < 0 ? 0 : 1, yb = s * AY, yg = s * GB;
            g.save(); g.beginPath(); g.rect(-arBX, Math.min(s * arBY0, yb), 2 * arBX, Math.abs(yb - s * arBY0)); g.clip();
            g.fillStyle = TC[t]; arChev(g, s, s * arBY0, yb, arBX, 400, 170); g.restore();
            g.save(); g.beginPath(); g.rect(-arGX, Math.min(s * arGY0, yg), 2 * arGX, Math.abs(yg - s * arGY0)); g.clip();
            g.fillStyle = TS[t]; g.fillRect(-arGX, Math.min(s * arGY0, yg), 2 * arGX, Math.abs(yg - s * arGY0));
            g.fillStyle = TK[t]; arChev(g, s, s * arGY0, yg, arGX, 420, 46); g.restore();
            g.save(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, arCR0, s < 0 ? Math.PI : 0, s < 0 ? TAU : Math.PI); g.closePath(); g.fillStyle = TS[t]; g.fill(); g.restore();
            g.save(); g.beginPath(); g.arc(0, 0, arCR - 40, s < 0 ? Math.PI : 0, s < 0 ? TAU : Math.PI); g.lineTo(0, 0); g.closePath(); g.clip();
            g.beginPath(); g.arc(0, 0, arCR0 + 70, 0, TAU); g.rect(-arCR, -arCR, 2 * arCR, 2 * arCR); g.clip('evenodd');
            g.fillStyle = TC[t]; arChev(g, s, s * 2 * arCR, 0, arCR, 240, 100); g.restore();
          }
          for (let i = 0, y0 = -6400; y0 < GB; i++, y0 += 640) for (let j = 0; j < 14; j++) { g.fillStyle = (i + j) % 2 ? 'rgba(0,0,0,.16)' : 'rgba(255,255,230,.035)'; g.fillRect(X0 - 160 + j * 640, y0, 640, 640); }
          for (let i = 0, y0 = -GB; y0 < GB; i++, y0 += 160) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,220,.03)'; g.fillRect(X0, y0, Wd, 160); }
          const R = rngOf(11);
          for (let i = 0; i < 26000; i++) { const d = R() < 0.5; g.fillStyle = d ? `rgba(0,0,0,${0.05 + R() * 0.08})` : `rgba(210,230,170,${0.025 + R() * 0.04})`; g.fillRect(X0 + R() * Wd, -GB + R() * 2 * GB, 8 + R() * 12, 6 + R() * 10); }
          for (let i = 0; i < 260; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,220,.03)'; const r = 120 + R() * 380; g.beginPath(); g.ellipse(X0 + R() * Wd, -GB + R() * 2 * GB, r, r * (0.6 + R() * 0.5), R() * 3, 0, TAU); g.fill(); }
          g.save(); g.translate(X0, -GB); arHex(g, Wd, 2 * GB, 470); g.strokeStyle = 'rgba(200,230,200,.06)'; g.lineWidth = 12; g.stroke(); g.restore();
        });
        const floorM = arGrass(own(new THREE.MeshStandardMaterial({ map: fieldT, roughness: 0.92, metalness: 0 })));
        {
          const pts = [[AX, -V1], [AX, V1], [V2, AY], [GW, AY], [GW, GB], [-GW, GB], [-GW, AY], [-V2, AY], [-AX, V1], [-AX, -V1], [-V2, -AY], [-GW, -AY], [-GW, -GB], [GW, -GB], [GW, -AY], [V2, -AY]];
          const g = own(new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))));
          const p = g.attributes.position, uv = g.attributes.uv;
          for (let i = 0; i < p.count; i++) uv.setXY(i, arU(p.getX(i)), arV(p.getY(i)));
          const m = new THREE.Mesh(g, floorM); m.receiveShadow = true; scene.add(m);
          const ap = new THREE.Mesh(own(new THREE.ShapeGeometry(new THREE.Shape([[11400, -12000], [11400, 12000], [9000, 14400], [-9000, 14400], [-11400, 12000], [-11400, -12000], [-9000, -14400], [9000, -14400]].map(([x, y]) => new THREE.Vector2(x, y))))), own(new THREE.MeshLambertMaterial({ color: lin(0x6a707a) })));
          ap.position.z = -5; scene.add(ap);
        }

        const arS2 = Math.SQRT1_2;
        const arVV = [[AX, -V1], [AX, V1], [V2, AY], [-V2, AY], [-AX, V1], [-AX, -V1], [-V2, -AY], [V2, -AY]];
        const arNN = [[1, 0], [arS2, arS2], [0, 1], [-arS2, arS2], [-1, 0], [-arS2, -arS2], [0, -1], [arS2, -arS2]];
        const arPath = [];
        for (let i = 0; i < 8; i++) {
          const a = arVV[i], b = arVV[(i + 1) % 8], n = arNN[i], pn = arNN[(i + 7) % 8];
          const a0 = Math.atan2(pn[1], pn[0]); let a1 = Math.atan2(n[1], n[0]); if (a1 < a0) a1 += TAU;
          for (let k = 0; k < 4; k++) { const t = a0 + (a1 - a0) * k / 4; arPath.push([a[0], a[1], Math.cos(t), Math.sin(t)]); }
          const steps = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 420)), ts = [];
          for (let k = 0; k < steps; k++) ts.push(k / steps);
          if (i === 2 || i === 6) for (const gx of [GW, -GW]) ts.push((gx - a[0]) / (b[0] - a[0]));
          ts.sort((x, y) => x - y);
          for (const t of ts) arPath.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, n[0], n[1]]);
        }
        arPath.push(arPath[0]);
        const arPS = [0];
        for (let i = 1; i < arPath.length; i++) { const p = arPath[i], q = arPath[i - 1]; arPS.push(arPS[i - 1] + Math.hypot(p[0] + p[2] * RR - q[0] - q[2] * RR, p[1] + p[3] * RR - q[1] - q[3] * RR)); }
        const arPer = arPS[arPS.length - 1];
        const arAt = (s, inw) => {
          s = ((s % arPer) + arPer) % arPer;
          let i = 1; while (i < arPS.length - 1 && arPS[i] < s) i++;
          const p = arPath[i - 1], q = arPath[i], k = (s - arPS[i - 1]) / Math.max(1e-6, arPS[i] - arPS[i - 1]);
          const nx = p[2] + (q[2] - p[2]) * k, ny = p[3] + (q[3] - p[3]) * k, nl = Math.hypot(nx, ny), r = RR - (inw || 0);
          return [p[0] + (q[0] - p[0]) * k + nx / nl * r, p[1] + (q[1] - p[1]) * k + ny / nl * r, nx / nl, ny / nl];
        };
        const arMouth = (x, y, m) => Math.abs(x) < GW + (m || 0) && Math.abs(y) > AY - 1;
        const arTint = (y, k = 1) => { const t = clamp(y / 2600, -1, 1), a = Math.abs(t); return t < 0 ? [(0.9 - 0.68 * a) * k, (0.92 - 0.42 * a) * k, k] : [k, (0.92 - 0.5 * a) * k, (0.88 - 0.8 * a) * k]; };
        const arAC = CFG.corner - RR * Math.SQRT2, arRf = (x, y) => { const ax = Math.abs(x), ay = Math.abs(y), rb = CFG.rampBack || RR, wb = (ay - AY - Math.max(ax - AX, (ax + ay - arAC) * arS2)) / (CFG.rampBlend || 400) + 0.5; return wb <= 0 ? RR : wb >= 1 ? rb : RR + (rb - RR) * wb; };
        const arFN = CFG.facets || 6;
        const arFil = (cx, cy, nx, ny) => {
          const o = [[0, 0]];
          for (let k = 0; k <= arFN; k++) {
            const th = Math.PI / 2 * k / arFN; let rf = arRf(cx, cy), off = 0;
            for (let it = 0; it < 4; it++) { off = RR - rf * (1 - Math.sin(th)); rf = arRf(cx + nx * off, cy + ny * off); }
            off = RR - rf * (1 - Math.sin(th));
            o.push([off / RR, rf * (1 - Math.cos(th))]);
          }
          return o;
        };
        const arRw = (cx, cy, nx, ny) => arRf(cx + nx * RR, cy + ny * RR);
        const arBand = (rows, uvf, colf, cut) => {
          const pos = [], uv = [], col = [], idx = [], RF = typeof rows === 'function' ? rows : () => rows, nr = RF(...arPath[0]).length;
          for (let i = 0; i < arPath.length; i++) {
            const [cx, cy, nx, ny] = arPath[i], rw = RF(cx, cy, nx, ny);
            for (let r = 0; r < nr; r++) {
              const [cp, z] = rw[r], x = cx + nx * RR * cp, y = cy + ny * RR * cp;
              pos.push(x, y, z); uv.push(...uvf(arPS[i], x, y, z, r)); col.push(...(colf ? colf(x, y, z) : [1, 1, 1]));
            }
          }
          for (let i = 0; i < arPath.length - 1; i++) for (let r = 0; r < nr - 1; r++) {
            const a = i * nr + r, b = a + nr, c = a + 1, d = b + 1;
            if (cut && Math.abs((pos[a * 3] + pos[d * 3]) / 2) < GW && (pos[a * 3 + 2] + pos[d * 3 + 2]) / 2 < GH && Math.abs((pos[a * 3 + 1] + pos[d * 3 + 1]) / 2) > AY - 1) continue;
            idx.push(a, c, b, b, c, d);
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
          g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
          return g;
        };
        const arQuad = (a, b, c, d, uvs, cols) => {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...d], 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs || [0, 0, 1, 0, 1, 1, 0, 1], 2));
          g.setAttribute('color', new THREE.Float32BufferAttribute(cols ? (cols.length === 3 ? [...cols, ...cols, ...cols, ...cols] : cols) : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 3));
          g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
          return g;
        };
        const arCol = (g, c) => { const n = g.index ? g.toNonIndexed() : g; if (n !== g) g.dispose(); const a = new Float32Array(n.attributes.position.count * 3); for (let i = 0; i < a.length; i += 3) { a[i] = c[0]; a[i + 1] = c[1]; a[i + 2] = c[2]; } n.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2)); return n; };
        const arBox = (w, d, h, x, y, z, rz) => GX(new THREE.BoxGeometry(w, d, h), x, y, z, 0, 0, rz || 0);
        {
          const lq = [];
          for (const L of arFL) for (let i = 0; i < L.p.length - 1; i++) {
            const a = L.p[i], b = L.p[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l * L.w / 2, uy = dy / l * L.w / 2;
            lq.push(arQuad([a[0] - ux + uy, a[1] - uy - ux, 0.6], [b[0] + ux + uy, b[1] + uy - ux, 0.6], [b[0] + ux - uy, b[1] + uy + ux, 0.6], [a[0] - ux - uy, a[1] - uy + ux, 0.6], null, L.c));
          }
          lq.push(arCol(GX(new THREE.RingGeometry(70, 92, 32), 0, 0, 0.6), [0.5, 0.53, 0.5]));
          const lm = new THREE.Mesh(mergeG(lq), own(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 })));
          lm.receiveShadow = true; scene.add(lm);
        }
        const arWB = 626, arWT = 610, arBP = arPer / Math.round(arPer / 2048), arHW = arPer / Math.round(arPer / 1247), arHH = 2160;

        {
          const caps = [];
          for (const s of [-1, 1]) for (const sx of [-1, 1]) {
            const pts = [[s * CFG.Y, 0], ...arFil(sx * GW, s * AY, 0, s).map(([cp, z]) => [s * (AY + RR * cp), z])];
            const pos = [], uv = [];
            for (let k = 1; k < pts.length - 1; k++) for (const [y, z] of [pts[0], pts[k], pts[k + 1]]) { pos.push(sx * GW, y, z); uv.push(arU(sx * GW), arV(y)); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
            g.setAttribute('color', new THREE.Float32BufferAttribute(pos.map(() => 0.42), 3)); g.computeVertexNormals(); caps.push(g);
          }
          const rampG = mergeG([arBand(arFil, (s, x, y, z, r) => [s / 640, r / (arFN + 1)], (x, y) => { const t = arTint(y, 1); return [0.62 * (0.7 + 0.3 * t[0]), 0.64 * (0.7 + 0.3 * t[1]), 0.68 * (0.7 + 0.3 * t[2])]; }, true), ...caps]);
          const rampT = tex(256, 256, (g, tw, th) => { g.fillStyle = '#d2d5d9'; g.fillRect(0, 0, tw, th); const R = rngOf(23); for (let i = 0; i < 1400; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.06)'; g.fillRect(R() * tw, R() * th, 2 + R() * 6, 2 + R() * 6); } g.fillStyle = 'rgba(40,44,52,.55)'; g.fillRect(0, 0, 3, th); g.fillRect(tw / 2, 0, 2, th); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(4, 0, 2, th); for (const v of [0.18, 0.62]) { g.fillStyle = 'rgba(30,34,40,.35)'; g.fillRect(0, v * th, tw, 2); } }, true);
          const ramp = new THREE.Mesh(rampG, own(new THREE.MeshStandardMaterial({ map: rampT, vertexColors: true, roughness: 0.5, metalness: 0.15, envMap: arEnv, envMapIntensity: 0.45, side: THREE.DoubleSide })));
          ramp.receiveShadow = true; scene.add(ramp);

          const boardT = tex(1024, 256, (g, tw, th) => {
            const vz = z => (1 - (z - RR) / (arWB - RR)) * th;
            g.fillStyle = '#1a2030'; g.fillRect(0, 0, tw, th);
            const lp = g.createLinearGradient(0, vz(420), 0, vz(RR));
            lp.addColorStop(0, '#2a3246'); lp.addColorStop(1, '#151a26'); g.fillStyle = lp; g.fillRect(0, vz(420), tw, vz(RR) - vz(420));
            g.strokeStyle = 'rgba(140,170,220,.12)'; g.lineWidth = 1.5;
            g.save(); g.beginPath(); g.rect(0, vz(418), tw, vz(RR) - vz(418)); g.clip(); arHex(g, tw, th, 9.25); g.stroke(); g.restore();
            for (let x = 0; x < tw; x += 64) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x, vz(420), 2, vz(RR) - vz(420)); }
            g.fillStyle = '#0c0f17'; g.fillRect(0, vz(431), tw, vz(420) - vz(431));
            g.fillStyle = 'rgba(200,215,240,.35)'; g.fillRect(0, vz(431), tw, 1.5);
            const y0 = vz(arWT), y1 = vz(431), bh = y1 - y0;
            const logo = (cx, cy, r, dark) => {
              g.save(); g.translate(cx, cy);
              g.fillStyle = dark ? '#1d5fd6' : '#2a6ff0'; g.beginPath(); g.moveTo(-r * 0.9, -r * 0.8); g.lineTo(r * 0.9, -r * 0.8); g.lineTo(r * 0.82, r * 0.25); g.quadraticCurveTo(r * 0.5, r * 0.85, 0, r); g.quadraticCurveTo(-r * 0.5, r * 0.85, -r * 0.82, r * 0.25); g.closePath(); g.fill();
              g.strokeStyle = '#fff'; g.lineWidth = r * 0.12; g.stroke();
              g.fillStyle = '#e8eef8'; g.beginPath(); g.arc(-r * 0.32, -r * 0.2, r * 0.3, 0, TAU); g.fill();
              g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-r * 0.75, r * 0.3); g.quadraticCurveTo(0, -r * 0.25, r * 0.78, -r * 0.42); g.quadraticCurveTo(r * 0.2, r * 0.05, -r * 0.4, r * 0.5); g.closePath(); g.fill();
              g.restore();
            };
            for (let b = 0; b < 2; b++) {
              const x0 = b * tw / 2, light = b === 1;
              const gr = g.createLinearGradient(0, y0, 0, y1);
              if (light) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#cfd6e2'); } else { gr.addColorStop(0, '#24314f'); gr.addColorStop(1, '#0d1426'); }
              g.fillStyle = gr; g.fillRect(x0 + 3, y0, tw / 2 - 6, bh);
              g.fillStyle = light ? '#9aa6ba' : '#4c6aa8'; g.fillRect(x0 + 3, y0, tw / 2 - 6, 3);
              for (let k = 0; k < 2; k++) {
                const bx = x0 + tw / 4 * k;
                logo(bx + 58, y0 + bh / 2, bh * 0.3, !light);
                g.fillStyle = light ? '#1b2a4a' : '#ffffff'; g.font = `italic bold ${Math.round(bh * 0.3)}px Arial, Helvetica, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
                g.fillText('ROCKET', bx + 104, y0 + bh * 0.34, 140); g.fillText('LEAGUE', bx + 104, y0 + bh * 0.68, 140);
                g.fillStyle = light ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.12)'; g.fillRect(bx + tw / 4 - 2, y0, 2, bh);
              }
            }
            g.fillStyle = '#0a0d14'; g.fillRect(0, 0, tw, y0);
          }, true);
          const boardG = arBand((cx, cy, nx, ny) => [[1, arRw(cx, cy, nx, ny)], [1, arWB]], (s, x, y, z) => [-s / arBP, (z - RR) / (arWB - RR)], null, true);
          const boards = new THREE.Mesh(own(boardG), own(new THREE.MeshStandardMaterial({ map: boardT, emissive: 0xffffff, emissiveMap: boardT, emissiveIntensity: 0.42, roughness: 0.55, metalness: 0.2, side: THREE.DoubleSide, envMap: arEnv, envMapIntensity: 0.5 })));
          boards.receiveShadow = true; scene.add(boards);

          const cin = 1 - 3 / RR, sL = [];
          sL.push(arBand((cx, cy, nx, ny) => { const r = arRw(cx, cy, nx, ny); return [[cin, r + 1], [cin, r + 15]]; }, () => [0, 0], (x, y) => arTint(y, 1.25), true));
          sL.push(arBand([[cin, arWT + 2], [cin, arWB + 2]], () => [0, 0], (x, y) => arTint(y, 1.25), true));
          for (let s0 = 0; s0 < arPer; s0 += 340) {
            const p = arAt(s0, 2), q = arAt(s0 + 210, 2);
            if (arMouth(p[0], p[1], 60) || arMouth(q[0], q[1], 60) || Math.hypot(q[0] - p[0], q[1] - p[1]) < 170) continue;
            const c = arTint((p[1] + q[1]) / 2, 1.3);
            sL.push(arQuad([q[0], q[1], 350], [p[0], p[1], 350], [p[0], p[1], 368], [q[0], q[1], 368], null, c));
          }
          const strips = new THREE.Mesh(mergeG(sL), arFlashable(own(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }))));
          scene.add(strips);

          const glassT = tex(256, 444, (g, tw, th) => {
            g.fillStyle = 'rgb(26,28,32)'; g.fillRect(0, 0, tw, th);
            arHex(g, tw, th, tw / (2 * Math.sqrt(3)));
            g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 9; g.stroke();
            g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 1.5; g.stroke();
          }, true);
          const gp = [[1, arWB], [1, GH], [1, 1200], [1, HT - RR]];
          for (let k = 1; k <= arFN; k++) { const ph = Math.PI / 2 * k / arFN; gp.push([Math.cos(ph), HT - RR + RR * Math.sin(ph)]); }
          const ceilP = arVV.map(([x, y]) => new THREE.Vector2(x, y)), cg = new THREE.ShapeGeometry(new THREE.Shape(ceilP));
          cg.translate(0, 0, HT);
          { const p = cg.attributes.position, uv = cg.attributes.uv, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { uv.setXY(i, p.getX(i) / arHW, p.getY(i) / arHH); const t = arTint(p.getY(i), 0.55); c[i * 3] = t[0]; c[i * 3 + 1] = t[1]; c[i * 3 + 2] = t[2]; } cg.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
          const glassG = mergeG([arBand(gp, (s, x, y, z, r) => [s / arHW, (r < 4 ? z : HT - RR + (z - HT + RR) * 2.2) / arHH], (x, y) => arTint(y), true), cg]);
          const glass = new THREE.Mesh(glassG, arFlashable(own(new THREE.MeshBasicMaterial({ map: glassT, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false }))));
          glass.renderOrder = 2; scene.add(glass); arHeavy.push(glass);

          const lineT = tex(64, 4, (g, tw, th) => { const gr = g.createLinearGradient(0, 0, tw, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.42, 'rgba(255,255,255,.3)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(0.58, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, th); });
          const pl = [], pn = Math.round(arPer / 950);
          for (let k = 0; k < pn; k++) {
            const s0 = (k + 0.5) * arPer / pn, p = arAt(s0 - 45, 10), q = arAt(s0 + 45, 10);
            if (arMouth(p[0], p[1], 500)) continue;
            const c = (p[1] + q[1]) < 0 ? [0.3, 0.6, 1.6] : [1.6, 0.62, 0.2];
            pl.push(arQuad([p[0], p[1], arWB], [q[0], q[1], arWB], [q[0], q[1], HT - RR], [p[0], p[1], HT - RR], null, c));
          }
          const pillars = new THREE.Mesh(mergeG(pl), arFlashable(own(new THREE.MeshBasicMaterial({ map: lineT, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false }))));
          pillars.renderOrder = 2; scene.add(pillars);

          const chevT = tex(128, 64, (g, tw, th) => {
            g.clearRect(0, 0, tw, th);
            g.fillStyle = 'rgba(8,12,22,.82)'; g.beginPath(); g.moveTo(10, 3); g.lineTo(tw - 10, 3); g.quadraticCurveTo(tw - 3, 3, tw - 3, 10); g.lineTo(tw - 3, th - 10); g.quadraticCurveTo(tw - 3, th - 3, tw - 10, th - 3); g.lineTo(10, th - 3); g.quadraticCurveTo(3, th - 3, 3, th - 10); g.lineTo(3, 10); g.quadraticCurveTo(3, 3, 10, 3); g.fill();
            g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.stroke();
            g.fillStyle = '#ffd23c';
            for (const ox of [34, 70]) { g.beginPath(); g.moveTo(ox, 12); g.lineTo(ox + 24, th / 2); g.lineTo(ox, th - 12); g.lineTo(ox - 13, th - 12); g.lineTo(ox + 11, th / 2); g.lineTo(ox - 13, 12); g.closePath(); g.fill(); }
          });
          const ch = [];
          for (let s0 = 450; s0 < arPer; s0 += 950) {
            const p = arAt(s0 - 115, 8), q = arAt(s0 + 115, 8), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
            if (Math.abs(my) < 900 || arMouth(mx, my, 700)) continue;
            const gy = Math.sign(my) * CFG.Y, fw = (q[0] - p[0]) * (0 - mx) + (q[1] - p[1]) * (gy - my) > 0;
            ch.push(arQuad([p[0], p[1], 668], [q[0], q[1], 668], [q[0], q[1], 788], [p[0], p[1], 788], fw ? [0, 0, 1, 0, 1, 1, 0, 1] : [1, 0, 0, 0, 0, 1, 1, 1]));
          }
          const chev = new THREE.Mesh(mergeG(ch), own(new THREE.MeshBasicMaterial({ map: chevT, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })));
          chev.renderOrder = 3; scene.add(chev);
        }

        const vgT = tex(4, 128, (g, tw, th) => { const gr = g.createLinearGradient(0, th, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, th); });
        const netT = tex(128, 222, (g, tw, th) => { g.clearRect(0, 0, tw, th); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 0, tw, th); arHex(g, tw, th, tw / Math.sqrt(3)); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 7; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2.6; g.stroke(); }, true);
        const arBackT = team => tex(512, 384, (g, tw, th) => {
          const c = TEAMCSS[team], dk = team ? '#1a0d07' : '#060d20';
          const gr = g.createLinearGradient(0, 0, 0, th); gr.addColorStop(0, '#05070c'); gr.addColorStop(0.55, dk); gr.addColorStop(1, team ? '#3a1806' : '#0c2050'); g.fillStyle = gr; g.fillRect(0, 0, tw, th);
          for (let k = 0; k < 7; k++) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, th * (0.1 + k * 0.12), tw, th * 0.05); }
          g.save(); g.globalAlpha = 0.38; arHex(g, tw, th, 18); g.strokeStyle = c; g.lineWidth = 1.6; g.stroke(); g.restore();
          const gl = g.createLinearGradient(0, th, 0, th * 0.55); gl.addColorStop(0, team ? 'rgba(255,120,30,.55)' : 'rgba(40,120,255,.55)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, th * 0.55, tw, th * 0.45);
          g.fillStyle = c; g.fillRect(0, th - 7, tw, 4); g.fillRect(0, 4, tw, 3);
        });
        const arCyl = (r, a, b, seg) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length(), g = new THREE.CylinderGeometry(r, r, L, seg || 12, 1, true); g.applyMatrix4(new THREE.Matrix4().compose(A.add(B).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()), new THREE.Vector3(1, 1, 1))); return g; };
        const arFrame = (r, off, yy, rc, seg) => {
          const xo = GW + off, zo = GH + off, o = [arCyl(r, [-xo, yy, 0], [-xo, yy, zo - rc], seg), arCyl(r, [xo, yy, 0], [xo, yy, zo - rc], seg), arCyl(r, [-(xo - rc), yy, zo], [xo - rc, yy, zo], seg)];
          for (const sx of [1, -1]) { const t = new THREE.TorusGeometry(rc, r, seg || 12, 8, Math.PI / 2); t.rotateX(Math.PI / 2); if (sx < 0) t.rotateZ(Math.PI); o.push(t.translate(sx * (xo - rc), yy, zo - rc)); }
          return o;
        };
        const arGoal = [];
        {
          const metal = [], net = [];
          const metalM = own(new THREE.MeshStandardMaterial({ color: lin(0x8e95a2), roughness: 0.3, metalness: 0.7, envMap: arEnv, envMapIntensity: 1 }));
          const backingM = own(new THREE.MeshBasicMaterial({ color: lin(0x070b16), transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
          const netM = own(new THREE.MeshBasicMaterial({ map: netT, vertexColors: true, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
          for (const s of [-1, 1]) {
            const team = s < 0 ? 0 : 1, col = TEAMC[team], Yl = s * CFG.Y, Yb = s * GB, D = CFG.goalD, nc = arTint(s * 5000, 1.2);
            metal.push(...arFrame(30, 30, s * (CFG.Y + 34), 120, 14));
            for (const sx of [-1, 1]) metal.push(arCyl(18, [sx * (GW + 22), s * (CFG.Y + 60), GH + 22], [sx * (GW + 22), s * (GB + 18), GH + 22], 10), arCyl(18, [sx * (GW + 22), s * (GB + 18), 0], [sx * (GW + 22), s * (GB + 18), GH + 22], 10), arCyl(14, [sx * (GW + 18), s * (CFG.Y + 60), 14], [sx * (GW + 18), s * (GB + 18), 14], 8));
            metal.push(arCyl(18, [-(GW + 22), s * (GB + 18), GH + 22], [GW + 22, s * (GB + 18), GH + 22], 10), arBox(2 * GW, 34, 26, 0, s * (GB + 17), 13));
            const nq = (a, b, c, d, ru, rv) => net.push(arQuad(a, b, c, d, [0, 0, ru, 0, ru, rv, 0, rv], nc));
            for (const sx of [-1, 1]) nq([sx * GW, Yl, 0], [sx * GW, Yb, 0], [sx * GW, Yb, GH], [sx * GW, Yl, GH], D / 104, GH / 180);
            nq([-GW, Yl, GH], [GW, Yl, GH], [GW, Yb, GH], [-GW, Yb, GH], 2 * GW / 104, D / 180);
            const stripM = own(new THREE.MeshBasicMaterial({ color: lin(col, 1.7), toneMapped: false }));
            const sg = [
              ...arFrame(9, 30, s * (CFG.Y - 2), 120, 8), ...arFrame(5, 62, s * (CFG.Y + 34), 120, 6),
              arBox(2 * GW - 60, 26, 6, 0, s * (CFG.Y + 300), GH + 4), arBox(2 * GW - 60, 26, 6, 0, s * (CFG.Y + 620), GH + 4),
              arBox(18, 6, GH - 60, -(GW - 40), s * (GB - 6), GH / 2), arBox(18, 6, GH - 60, GW - 40, s * (GB - 6), GH / 2), arBox(2 * GW - 98, 6, 14, 0, s * (GB - 6), GH - 26),
              GX(new THREE.PlaneGeometry(2 * GW, 26), 0, s * (CFG.Y + 22), 1.2)
            ];
            const strip = new THREE.Mesh(mergeG(sg), stripM); scene.add(strip);
            const backM = own(new THREE.MeshStandardMaterial({ map: arBackT(team), emissive: 0xffffff, emissiveMap: null, roughness: 0.6, metalness: 0.2 }));
            backM.emissiveMap = backM.map; backM.emissiveIntensity = 0.5;
            const back = new THREE.Mesh(own(arQuad([-s * GW, Yb - s, 0], [s * GW, Yb - s, 0], [s * GW, Yb - s, GH], [-s * GW, Yb - s, GH])), backM); scene.add(back);
            const curM = own(new THREE.MeshBasicMaterial({ map: vgT, color: lin(col), transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false }));
            const cur = new THREE.Mesh(own(arQuad([-GW, s * (CFG.Y + 60), 0], [GW, s * (CFG.Y + 60), 0], [GW, s * (CFG.Y + 60), GH], [-GW, s * (CFG.Y + 60), GH])), curM); cur.renderOrder = 4; scene.add(cur);
            const light = new THREE.PointLight(col, 1.5, 3400, 2); light.position.set(0, s * (CFG.Y + 420), 430); scene.add(light);
            arGoal[team] = { stripM, backM, curM, light, col: lin(col, 1.7), lc: new THREE.Color(col) };
          }
          const fm = new THREE.Mesh(mergeG(metal), metalM); fm.castShadow = true; fm.receiveShadow = true; scene.add(fm);
          const bk = new THREE.Mesh(mergeG(net.map(g => g.clone())), backingM); bk.renderOrder = 2; scene.add(bk);
          const nm = new THREE.Mesh(mergeG(net), netM); nm.renderOrder = 3; scene.add(nm);
        }
        const arOct = (ex, ey, ec) => [[ex, -(ec - ex)], [ex, ec - ex], [ec - ey, ey], [-(ec - ey), ey], [-ex, ec - ex], [-ex, -(ec - ex)], [-(ec - ey), -ey], [ec - ey, -ey]];
        const arCrowdT = (bias, cheer) => tex(512, 256, (g, tw, th) => {
          const R = rngOf(31 + bias);
          const pal = bias === 1 ? ['#2f7bff', '#5aa0ff', '#1d4fc4', '#2a5fd8', '#3f8cff', '#c8d8f0'] : bias === 2 ? ['#ff7a1a', '#ffa14d', '#e2560a', '#d8601a', '#ff8a2a', '#f0dcc8'] : null;
          const mix = ['#3f8cff', '#ff8a2a', '#f4f4f4', '#ffd24a', '#5bd18a', '#ff5d7a', '#a07bff', '#7a88a6', '#2f7bff', '#ff7a1a', '#e8e8e8', '#30343c'];
          const skin = ['#f2c9a0', '#d9a273', '#a96f45', '#7a4a2b', '#f6d7b8', '#e0b48c'];
          for (let r = 0; r < 16; r++) {
            const y0 = r * 16;
            g.fillStyle = r % 2 ? '#2a3142' : '#232a3b'; g.fillRect(0, y0, tw, 16);
            g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y0 + 13, tw, 3);
            for (let x = 4; x < tw; x += 8) {
              const c1 = R(), c2 = R(), c3 = R(), c4 = R(), c5 = R(), c6 = R(), c7 = R();
              if (x % 128 < 10 || c7 < 0.04) continue;
              const col = pal && c1 < 0.82 ? pal[Math.floor(c2 * pal.length)] : mix[Math.floor(c2 * mix.length)];
              const up = cheer ? 1.5 + c6 * 2.5 : 0, jx = x + c4 * 2 - 1, jy = y0 + 5 + c5 * 1.5 - up;
              if (cheer && c6 > 0.25) { g.fillStyle = col; g.fillRect(jx - 4.6, jy - 5 - c3 * 2, 1.7, 7.5); g.fillRect(jx + 2.9, jy - 5 - c5 * 2, 1.7, 7.5); }
              g.fillStyle = col; g.fillRect(jx - 3, jy + 2.4, 6, 8 + up);
              g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(jx - 3, jy + 7.5, 6, 2);
              g.fillStyle = skin[Math.floor(c3 * skin.length)]; g.beginPath(); g.arc(jx, jy, 2.6, 0, TAU); g.fill();
              if (c6 > 0.9) { g.fillStyle = pal ? pal[0] : col; g.fillRect(jx - 2.6, jy - 3, 5.2, 1.8); }
              if (cheer && c6 > 0.93) { g.fillStyle = pal ? pal[Math.floor(c1 * 3)] : mix[Math.floor(c1 * 4)]; g.fillRect(jx - 6, jy - 11, 12, 5); }
            }
          }
          g.globalCompositeOperation = 'saturation'; g.fillStyle = 'rgba(128,128,128,.4)'; g.fillRect(0, 0, tw, th); g.globalCompositeOperation = 'source-over';
          for (let x = 0; x < tw; x += 128) {
            g.fillStyle = '#151a26'; g.fillRect(x, 0, 10, th);
            g.fillStyle = 'rgba(200,215,240,.2)'; for (let y = 0; y < th; y += 4) g.fillRect(x + 1, y, 8, 1);
          }
        }, true);
        const arLedT = tex(1024, 64, (g, tw, th) => {
          const C = [['#0f2a66', '#3f8cff', 'ROCKET LEAGUE'], ['#7a2c06', '#ff8a2a', 'DFH STADIUM'], ['#10204a', '#9ec4ff', 'ROCKET LEAGUE'], ['#1a1f2b', '#ffd23c', 'BOOST']];
          const pw = tw / C.length;
          C.forEach(([a, b, name], i) => {
            const gr = g.createLinearGradient(0, 0, 0, th); gr.addColorStop(0, b); gr.addColorStop(0.16, a); gr.addColorStop(1, '#070a12');
            g.fillStyle = gr; g.fillRect(i * pw, 0, pw, th);
            g.font = 'italic bold 30px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = 'rgba(0,0,0,.45)'; g.fillText(name, i * pw + pw / 2 + 2, th / 2 + 4, pw - 64); g.fillStyle = '#fff'; g.fillText(name, i * pw + pw / 2, th / 2 + 2, pw - 64);
            g.fillStyle = b; for (let k = 0; k < 2; k++) for (const sd of [0, 1]) { const ox = sd ? i * pw + pw - 18 - k * 12 : i * pw + 10 + k * 12, d = sd ? -1 : 1; g.beginPath(); g.moveTo(ox, 16); g.lineTo(ox + d * 9, th / 2); g.lineTo(ox, th - 16); g.lineTo(ox + d * 4, th - 16); g.lineTo(ox + d * 13, th / 2); g.lineTo(ox + d * 4, 16); g.fill(); }
            g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(i * pw, 0, 2, th);
          });
        }, true);
        const flashMs = [], arCrowd = [];
        const arLampM = own(new THREE.MeshBasicMaterial({ color: 0xfff8e6, toneMapped: false, side: THREE.DoubleSide }));
        const arStruct = [], arLamp = [], arGlowQ = [], arGold = [], arTree = [], arScrQ = [], arBeams = [];
        {
          const T1i = arOct(4700, 6300, 9300), T1o = arOct(7200, 8600, 13600), T2i = arOct(7700, 9100, 14400), T2o = arOct(10300, 11800, 19600), RFi = arOct(8600, 10100, 16600);
          const CT = [0, 1, 2].map(b => [arCrowdT(b, false), arCrowdT(b, true)]);
          const standM = CT.map(t => own(new THREE.MeshLambertMaterial({ map: t[0], vertexColors: true, side: THREE.DoubleSide })));
          CT.forEach((t, k) => arCrowd.push({ m: standM[k], t, ph: k * 1.7, on: false }));
          const concM = own(new THREE.MeshLambertMaterial({ color: lin(0x8f96a2), side: THREE.DoubleSide }));
          const roofM = own(new THREE.MeshLambertMaterial({ color: lin(0x3c4250), side: THREE.DoubleSide }));
          const ledM = own(new THREE.MeshBasicMaterial({ map: arLedT, color: lin(0xdddddd), toneMapped: false, side: THREE.DoubleSide }));
          const stands = [[], [], []], conc = [], roof = [], led = [];
          const L = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
          const crowd = (A, B, za, zb, edges, k0, k1) => {
            for (const i of edges) {
              const a = A[i], b = A[(i + 1) % 8], c = B[(i + 1) % 8], d = B[i], len = L(a, b), sl = Math.hypot(L(a, d), zb - za);
              const ru = Math.max(1, Math.round(len / 3000)), rv = Math.max(1, Math.round(sl / 1500)), nu = Math.max(2, Math.round(Math.max(len, L(c, d)) / 420)), nv = 3;
              const P = (u, v) => { const x0 = a[0] + (b[0] - a[0]) * u, y0 = a[1] + (b[1] - a[1]) * u, x1 = d[0] + (c[0] - d[0]) * u, y1 = d[1] + (c[1] - d[1]) * u; return [x0 + (x1 - x0) * v, y0 + (y1 - y0) * v, za + (zb - za) * v]; };
              for (let iu = 0; iu < nu; iu++) for (let iv = 0; iv < nv; iv++) {
                const u0 = iu / nu, u1 = (iu + 1) / nu, v0 = iv / nv, v1 = (iv + 1) / nv, k0v = k0 + (k1 - k0) * v0, k1v = k0 + (k1 - k0) * v1;
                const my = (P(u0, v0)[1] + P(u1, v1)[1]) / 2; stands[my < -400 ? 1 : my > 400 ? 2 : 0].push(arQuad(P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1), [u0 * ru, v0 * rv, u1 * ru, v0 * rv, u1 * ru, v1 * rv, u0 * ru, v1 * rv], [k0v, k0v, k0v, k0v, k0v, k0v, k1v, k1v, k1v, k1v, k1v, k1v]));
              }
            }
          };
          const wall = (A, za, zb, edges, list, rep) => { for (const i of edges) { const a = A[i], b = A[(i + 1) % 8], ru = rep ? Math.max(1, Math.round(L(a, b) / rep)) : 1; list.push(arQuad([b[0], b[1], za], [a[0], a[1], za], [a[0], a[1], zb], [b[0], b[1], zb], [0, 0, ru, 0, ru, 1, 0, 1])); } };
          const flat = (A, B, za, zb, edges, list) => { for (const i of edges) { const a = A[i], b = A[(i + 1) % 8], c = B[(i + 1) % 8], d = B[i]; list.push(arQuad([a[0], a[1], za], [b[0], b[1], za], [c[0], c[1], zb], [d[0], d[1], zb])); } };
          const all = [0, 1, 2, 3, 4, 5, 6, 7], main = [0, 2, 4, 6], cor = [1, 3, 5, 7];
          crowd(T1i, T1o, 260, 2050, all, 0.58, 0.42);
          crowd(T2i, T2o, 2600, 5000, main, 0.36, 0.26);
          wall(T1i, 0, 260, all, led, 2600); wall(T2i, 2050, 2600, main, led, 2600);
          flat(T1o, T2i, 2050, 2050, main, conc); wall(T1o, 2050, 2280, cor, conc); wall(T1o, 0, 2050, cor, conc);
          wall(T2o, 5000, 6300, main, roof); flat(T2o, RFi, 6300, 6650, main, roof); wall(RFi, 6650, 7000, main, conc);
          for (const i of main) {
            const a = RFi[i], b = RFi[(i + 1) % 8];
            arLamp.push(arQuad([b[0], b[1], 6650], [a[0], a[1], 6650], [a[0], a[1], 6700], [b[0], b[1], 6700]));
            for (let k = 1; k < 8; k++) {
              const t = k / 8, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], q = [T2o[i][0] + (T2o[(i + 1) % 8][0] - T2o[i][0]) * t, T2o[i][1] + (T2o[(i + 1) % 8][1] - T2o[i][1]) * t];
              const m = [p[0] + (q[0] - p[0]) * 0.3, p[1] + (q[1] - p[1]) * 0.3];
              arLamp.push(GX(new THREE.BoxGeometry(220, 220, 30), m[0], m[1], 6650 - 0.3 * 350 - 20));
            }
          }
          for (const v of all) {
            const P = (A, z) => [A[v][0], A[v][1], z];
            conc.push(arQuad(P(T2i, 2050), P(T2i, 2600), P(T2o, 5000), P(T2o, 2050)));
            conc.push(arQuad(P(T2o, 6300), P(RFi, 6650), P(RFi, 7000), P(T2o, 7000)));
          }
          stands.forEach((list, k) => scene.add(new THREE.Mesh(mergeG(list), standM[k])));
          scene.add(new THREE.Mesh(mergeG(conc), concM), new THREE.Mesh(mergeG(roof), roofM), new THREE.Mesh(mergeG(led), ledM));
          const R2 = rngOf(77);
          for (let k = 0; k < 3; k++) {
            const n = 90, pos = new Float32Array(n * 3);
            for (let q = 0; q < n; q++) {
              const up = R2() < 0.4, A = up ? T2i : T1i, B = up ? T2o : T1o, za = up ? 2600 : 260, zb = up ? 5000 : 2050;
              const i = up ? main[Math.floor(R2() * 4)] : Math.floor(R2() * 8), a = A[i], b = A[(i + 1) % 8], c = B[(i + 1) % 8], d = B[i], u = R2(), t = 0.08 + R2() * 0.85;
              const px = a[0] + (b[0] - a[0]) * u, py = a[1] + (b[1] - a[1]) * u, qx = d[0] + (c[0] - d[0]) * u, qy = d[1] + (c[1] - d[1]) * u;
              pos[q * 3] = px + (qx - px) * t; pos[q * 3 + 1] = py + (qy - py) * t; pos[q * 3 + 2] = za + (zb - za) * t + 60;
            }
            const geo = own(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const mat = own(new THREE.PointsMaterial({ size: 220, map: glowT, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
            const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5; scene.add(pts); flashMs.push(mat);
          }

          const obj = new THREE.Object3D(); obj.up.set(0, 0, 1);
          const place = (g, x, y, z, tx, ty, tz) => { obj.position.set(x, y, z); obj.lookAt(tx, ty, tz); obj.updateMatrix(); return g.applyMatrix4(obj.matrix); };
          for (const [sx, sy] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
            const x = sx * 11400, y = sy * 7700, H = 10400;
            arStruct.push(GX(new THREE.CylinderGeometry(150, 380, H, 4), x, y, H / 2, Math.PI / 2, 0, Math.PI / 4));
            for (let k = 1; k < 6; k++) { const r = 380 - 230 * k / 6; arStruct.push(GX(new THREE.BoxGeometry(r * 1.6, r * 1.6, 70), x, y, H * k / 6, 0, 0, Math.PI / 4)); }
            arStruct.push(place(new THREE.BoxGeometry(2400, 1400, 180), x, y, H + 300, 0, 0, 0));
            arStruct.push(place(new THREE.BoxGeometry(2500, 120, 260).translate(0, -760, 0), x, y, H + 300, 0, 0, 0));
            for (let gx = -2.5; gx <= 2.5; gx++) for (let gy = -1; gy <= 1; gy++) arLamp.push(place(new THREE.BoxGeometry(320, 320, 60).translate(gx * 380, gy * 400, 110), x, y, H + 300, 0, 0, 0));
            arGlowQ.push(place(new THREE.PlaneGeometry(5200, 5200).translate(0, 0, 260), x, y, H + 300, 0, 0, 0));
            const P = new THREE.Vector3(x, y, H + 300), T = new THREE.Vector3(x * 0.15, y * 0.15, 0), dv = P.clone().sub(T), Ln = dv.length();
            const cg = new THREE.CylinderGeometry(500, 3000, Ln, 16, 4, true);
            const cp = cg.attributes.position, cc = new Float32Array(cp.count * 3);
            for (let q = 0; q < cp.count; q++) { const kk = Math.pow(clamp(cp.getY(q) / Ln + 0.5, 0, 1), 1.8); cc[q * 3] = kk; cc[q * 3 + 1] = kk * 0.96; cc[q * 3 + 2] = kk * 0.85; }
            cg.setAttribute('color', new THREE.BufferAttribute(cc, 3));
            cg.applyMatrix4(new THREE.Matrix4().compose(P.clone().add(T).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dv.normalize()), new THREE.Vector3(1, 1, 1)));
            arBeams.push(cg);
          }
          for (const s of [1, -1]) {
            const px = s * 7400, py = s * 8800, face = Math.atan2(px, -py);
            arStruct.push(arBox(2000, 2000, 420, px, py, 210, face), arBox(1500, 1500, 3200, px, py, 2020, face), arBox(1800, 1800, 260, px, py, 3740, face));
            const sh = pts => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
            const ex = (pts, d, bv) => new THREE.ExtrudeGeometry(sh(pts), { depth: d, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 2 }).rotateX(Math.PI / 2).translate(0, d / 2, 0);
            const G1 = [1, 1, 1], G0 = [0.16, 0.13, 0.1];
            const car = [
              arCol(ex([[-46, 7], [-40, 3], [52, 3], [64, 5], [72, 9], [74, 14], [70, 18], [56, 20.5], [40, 23], [24, 26], [-30, 26.5], [-42, 27], [-47, 23]], 66, 4), G1),
              arCol(ex([[34, 22], [26, 28.5], [12, 38], [-20, 38], [-31, 31], [-39, 25], [-30, 22]], 50, 3), [0.55, 0.5, 0.42]),
              arCol(arBox(10, 76, 3, -42, 0, 38), G1), arCol(arBox(3, 3, 9, -40, 22, 31), G1), arCol(arBox(3, 3, 9, -40, -22, 31), G1), arCol(arBox(10, 60, 6, 74, 0, 7), G1)
            ];
            for (const [wx, wr] of [[51, 13], [-34, 15.5]]) for (const wy of [-38, 38]) car.push(arCol(GX(new THREE.CylinderGeometry(wr, wr, 13, 20), wx, wy, wr - 1), G0), arCol(GX(new THREE.CylinderGeometry(wr * 0.6, wr * 0.6, 14.5, 12), wx, wy, wr - 1), G1));
            const cg = mergeG(car);
            cg.scale(26, 26, 26); cg.rotateY(-1.1); cg.computeBoundingBox(); cg.translate(-0.3 * (cg.boundingBox.min.x + cg.boundingBox.max.x), 0, 0); cg.rotateZ(face);
            cg.translate(px, py, 3870 - cg.boundingBox.min.z);
            arGold.push(cg);
            const R3 = rngOf(s > 0 ? 9 : 19);
            for (let k = 0; k < 9; k++) {
              const a = R3() * TAU, d = 1700 + R3() * 1300, tx = px + Math.cos(a) * d, ty = py + Math.sin(a) * d, h = 1500 + R3() * 1200;
              const ax2 = Math.abs(tx), ay2 = Math.abs(ty); if (ax2 + ay2 < 14700 || ay2 - ax2 < -600 || ay2 - ax2 > 3400) continue;
              arTree.push(arCol(GX(new THREE.ConeGeometry(h * 0.27, h, 7), tx, ty, 320 + h / 2, Math.PI / 2), [0.06, 0.2 + R3() * 0.06, 0.07]));
              arTree.push(arCol(GX(new THREE.CylinderGeometry(50, 70, 340, 6), tx, ty, 170, Math.PI / 2), [0.22, 0.14, 0.08]));
            }
          }
          for (const s of [1, -1]) {
            const px = -s * 7100, py = s * 8450;
            arStruct.push(place(new THREE.BoxGeometry(3200, 1900, 160), px, py, 4400, 0, 0, 3000));
            const ux = py / Math.hypot(px, py), uy = -px / Math.hypot(px, py);
            for (const k of [-1, 1]) arStruct.push(arBox(200, 200, 3500, px + ux * k * 1100, py + uy * k * 1100, 1750));
            arScrQ.push(place(new THREE.PlaneGeometry(3000, 1700).translate(0, 0, 90), px, py, 4400, 0, 0, 3000));
          }
          const arGlass = [];
          for (const i of main) {
            const a = RFi[i], b = RFi[(i + 1) % 8], side = i % 4 === 0, k = side ? 0.43 : 0.56, kk = side ? 0.82 : 0.56;
            const ia = side ? [a[0] * k, a[1] * kk] : [a[0] * kk, a[1] * k], ib = side ? [b[0] * k, b[1] * kk] : [b[0] * kk, b[1] * k], z0 = 7000, z1 = 8300;
            const L1 = Math.hypot(b[0] - a[0], b[1] - a[1]), L2 = Math.hypot(ia[0] - a[0], ia[1] - a[1], z1 - z0);
            arGlass.push(arQuad([a[0], a[1], z0], [b[0], b[1], z0], [ib[0], ib[1], z1], [ia[0], ia[1], z1], [0, 0, L1 / 1100, 0, L1 / 1100 * Math.hypot(ib[0] - ia[0], ib[1] - ia[1]) / L1, L2 / 1100, 0, L2 / 1100]));
            const n = Math.round(L1 / 1600);
            for (let q = 0; q <= n; q++) {
              const t = q / n, p0 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z0], p1 = [ia[0] + (ib[0] - ia[0]) * t, ia[1] + (ib[1] - ia[1]) * t, z1];
              arStruct.push(arCyl(55, p0, [p1[0], p1[1], p1[2]], 6), arCyl(30, [p1[0], p1[1], z1], [p1[0] + (p0[0] - p1[0]) * 0.35, p1[1] + (p0[1] - p1[1]) * 0.35, z1 + 600], 5), arCyl(30, [p0[0] + (p1[0] - p0[0]) * 0.65, p0[1] + (p1[1] - p0[1]) * 0.65, z0 + (z1 - z0) * 0.65 + 600], [p0[0], p0[1], z0], 5));
            }
            arStruct.push(arCyl(95, [ia[0], ia[1], z1], [ib[0], ib[1], z1], 8), arCyl(50, [ia[0] + (a[0] - ia[0]) * 0.35, ia[1] + (a[1] - ia[1]) * 0.35, z1 + 600], [ib[0] + (b[0] - ib[0]) * 0.35, ib[1] + (b[1] - ib[1]) * 0.35, z1 + 600], 6));
            const ux = ib[0] - ia[0], uy = ib[1] - ia[1], ul = Math.hypot(ux, uy), nx = -uy / ul, ny = ux / ul, sg = nx * ia[0] + ny * ia[1] > 0 ? 1 : -1, ox = nx * sg * 130, oy = ny * sg * 130;
            const nl = Math.round(ul / 420);
            for (let q = 0; q < nl; q++) {
              const t0 = (q + 0.12) / nl, t1 = (q + 0.88) / nl, P = t => [ia[0] + ux * t, ia[1] + uy * t];
              const A = P(t0), B = P(t1);
              for (const f of [0, 0.3, 0.62]) { const C = [A[0] + (a[0] - ia[0]) * f, A[1] + (a[1] - ia[1]) * f], D = [B[0] + (b[0] - ib[0]) * f, B[1] + (b[1] - ib[1]) * f], zz = z1 + (z0 - z1) * f - 60; arLamp.push(arQuad([C[0] + ox, C[1] + oy, zz], [D[0] + ox, D[1] + oy, zz], [D[0], D[1], zz], [C[0], C[1], zz])); }
            }
          }
          {
            const gT = tex(256, 256, (g, tw, th) => { g.clearRect(0, 0, tw, th); g.fillStyle = 'rgba(120,140,160,.34)'; g.fillRect(0, 0, tw, th); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 0, tw, th * 0.45); g.fillStyle = 'rgba(30,35,44,.92)'; g.fillRect(0, 0, tw, 9); g.fillRect(0, 0, 9, th); g.fillRect(0, th / 2 - 3, tw, 5); g.fillRect(tw / 2 - 3, 0, 5, th); }, true);
            const gm = new THREE.Mesh(mergeG(arGlass), own(new THREE.MeshBasicMaterial({ map: gT, transparent: true, depthWrite: false, side: THREE.DoubleSide })));
            gm.renderOrder = 1; scene.add(gm); arHeavy.push(gm);
          }
          const structM = own(new THREE.MeshStandardMaterial({ color: lin(0x6c7380), roughness: 0.6, metalness: 0.45, envMap: arEnv, envMapIntensity: 0.6 }));
          scene.add(new THREE.Mesh(mergeG(arStruct), structM), new THREE.Mesh(mergeG(arLamp), arLampM));
          const gold = new THREE.Mesh(mergeG(arGold), own(new THREE.MeshStandardMaterial({ color: lin(0xd9a443), vertexColors: true, roughness: 0.28, metalness: 0.9, envMap: arEnv, envMapIntensity: 1.3, emissive: lin(0x2a1a04) })));
          scene.add(gold, new THREE.Mesh(mergeG(arTree), own(new THREE.MeshLambertMaterial({ vertexColors: true }))));
          const gq = new THREE.Mesh(mergeG(arGlowQ), own(new THREE.MeshBasicMaterial({ map: glowT, color: 0xfff2d8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide })));
          gq.renderOrder = 5; scene.add(gq); arHeavy.push(gq);
          const bm = new THREE.Mesh(mergeG(arBeams), own(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })));
          bm.renderOrder = 5; bm.frustumCulled = false; scene.add(bm); arHeavy.push(bm);
        }
        const arScrT = tex(512, 256, () => {});
        const arScrPaint = (s0, s1, clk, gt) => {
          const c = arScrT.image, g = c.getContext('2d'), tw = c.width, th = c.height;
          const bg = g.createLinearGradient(0, 0, 0, th); bg.addColorStop(0, '#13213f'); bg.addColorStop(1, '#05080f'); g.fillStyle = bg; g.fillRect(0, 0, tw, th);
          g.fillStyle = 'rgba(255,255,255,.05)'; for (let y = 0; y < th; y += 4) g.fillRect(0, y, tw, 1);
          g.textAlign = 'center'; g.textBaseline = 'middle';
          if (gt >= 0) {
            const gg = g.createLinearGradient(0, 0, tw, 0); gg.addColorStop(0, gt ? '#7a2c06' : '#0f2a66'); gg.addColorStop(0.5, TEAMCSS[gt]); gg.addColorStop(1, gt ? '#7a2c06' : '#0f2a66');
            g.fillStyle = gg; g.fillRect(0, 40, tw, th - 80);
            g.font = 'italic 900 120px Arial Black, Arial, sans-serif'; g.fillStyle = '#fff'; g.fillText('GOAL!', tw / 2, th / 2 + 6);
          } else {
            g.font = 'italic 900 34px Arial Black, Arial, sans-serif'; g.fillStyle = '#fff'; g.fillText('ROCKET LEAGUE', tw / 2, 36);
            g.fillStyle = '#3f8cff'; g.fillRect(16, 74, 150, 140); g.fillStyle = '#ff8a2a'; g.fillRect(tw - 166, 74, 150, 140);
            g.fillStyle = '#0a0f1d'; g.fillRect(180, 96, tw - 360, 96);
            g.font = '900 104px Arial Black, Arial, sans-serif'; g.fillStyle = '#fff'; g.fillText(String(s0), 91, 148); g.fillText(String(s1), tw - 91, 148);
            g.font = '900 60px Arial, sans-serif'; g.fillText(clk, tw / 2, 146);
            g.font = '900 20px Arial, sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText('BLUE', 91, 236); g.fillText('ORANGE', tw - 91, 236);
          }
          arScrT.needsUpdate = true;
        };
        arScrPaint(0, 0, '5:00', -1);
        { const m = new THREE.Mesh(mergeG(arScrQ), own(new THREE.MeshBasicMaterial({ map: arScrT, toneMapped: false }))); scene.add(m); }
        let arScrK = -1;
        const arScrTick = () => {
          const goal = W.state === 'goal' ? arFl.team : -1, sec = W.ot ? Math.floor(W.otT) : Math.ceil(W.clock);
          const k = W.score[0] * 1e7 + W.score[1] * 1e5 + (W.ot ? 5e4 : 0) + sec * 4 + (goal + 1);
          if (k === arScrK) return;
          arScrK = k; arScrPaint(W.score[0], W.score[1], W.ot ? '+' + mmss(W.otT) : mmss(Math.ceil(W.clock)), goal);
        };
        const arCrowdTick = (dt, t) => {
          const cheer = W.state === 'goal' || arFl.t >= 0;
          for (const c of arCrowd) {
            if (cheer !== c.on) { c.on = cheer; c.m.map = c.t[cheer ? 1 : 0]; }
            c.m.map.offset.y = cheer ? Math.abs(Math.sin(t * 8.5 + c.ph)) * 0.022 : Math.sin(t * 1.1 + c.ph) * 0.004;
          }
          const k0 = cheer ? 4 : 14;
          for (let k = 0; k < flashMs.length; k++) flashMs[k].opacity = Math.pow(Math.max(0, Math.sin(t * (6 + k * 2.3) + k * 2.1)), k0) * (cheer ? 1 : 0.8);
        };
        const arFl = { t: -1, team: 0, c: new THREE.Color() };
        const arGoalFlash = team => {
          team = team ? 1 : 0;
          if (arFl.t >= 0 && arFl.t < 0.6 && arFl.team === team) return;
          arFl.t = 0; arFl.team = team; arFl.c.copy(lin(TEAMC[team], 1));
        };
        const arFlashTick = dt => {
          if (arFl.t < 0) return;
          arFl.t += dt;
          const k = arFl.t / 2.2, hit = arGoal[1 - arFl.team];
          if (k >= 1) {
            arFl.t = -1; arFU.arFK.value = 0;
            for (const G of arGoal) { G.stripM.color.copy(G.col); G.backM.emissiveIntensity = 0.5; G.backM.emissive.setRGB(1, 1, 1); G.curM.opacity = 0.32; G.curM.color.copy(G.lc).convertSRGBToLinear(); G.light.intensity = 1.5; G.light.color.copy(G.lc); }
            return;
          }
          const fade = Math.pow(1 - k, 0.7), p = (0.6 + 0.4 * Math.cos(arFl.t * 15)) * fade;
          arFU.arFC.value.copy(arFl.c); arFU.arFK.value = 0.85 * p;
          hit.stripM.color.copy(arFl.c).multiplyScalar(1.7 + 3 * p); hit.backM.emissive.copy(arFl.c).multiplyScalar(0.4).addScalar(0.6); hit.backM.emissiveIntensity = 0.5 + 2.2 * p;
          hit.curM.color.copy(arFl.c); hit.curM.opacity = 0.32 + 0.6 * p; hit.light.color.set(TEAMC[arFl.team]); hit.light.intensity = 1.5 + 6 * p;
        };

        const padVis = [];
        const arPadU = { t: { value: 0 } };
        const arGN = 'float arh2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat arn2(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(arh2(i), arh2(i + vec2(1.0, 0.0)), f.x), mix(arh2(i + vec2(0.0, 1.0)), arh2(i + vec2(1.0, 1.0)), f.x), f.y); }\n';
        const arPadM = {
          base: own(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.5, envMap: arEnv, envMapIntensity: 0.7 })),
          glow: own(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })),
          dec: own(new THREE.MeshBasicMaterial({ map: glowT, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, toneMapped: false })),
          flame: own(new THREE.ShaderMaterial({
            uniforms: arPadU, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
            vertexShader: 'varying vec2 vU;\nvarying vec3 vC;\nvarying vec3 vP;\nvoid main() {\n  vU = uv; vC = color; vP = position;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}',
            fragmentShader: 'uniform float t;\nvarying vec2 vU;\nvarying vec3 vC;\nvarying vec3 vP;\n' + arGN + 'void main() {\n  if (vC.r < 0.01) discard;\n  float s = vP.x * 0.031 + vP.y * 0.017;\n  float n = arn2(vec2(vU.x * 3.5 + s, vU.y * 2.2 - t * 2.4)) * 0.65 + arn2(vec2(vU.x * 8.0 - s, vU.y * 4.5 - t * 4.0)) * 0.35;\n  float e = smoothstep(0.0, 0.2, vU.x) * smoothstep(1.0, 0.8, vU.x);\n  float a = e * smoothstep(vU.y * 0.9, vU.y * 0.9 + 0.32, n) * (1.0 - vU.y) * smoothstep(0.0, 0.08, vU.y);\n  vec3 c = mix(vec3(1.0, 0.88, 0.5), vec3(1.0, 0.36, 0.04), smoothstep(0.0, 0.75, vU.y));\n  gl_FragColor = vec4(c * vC, a * 0.95);\n}'
          })),
          halo: own(new THREE.SpriteMaterial({ map: glowT, color: 0xffa030, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6, toneMapped: false })),
          orb: own(new THREE.ShaderMaterial({
            uniforms: arPadU,
            vertexShader: 'varying vec3 vN;\nvarying vec3 vV;\nvarying vec3 vO;\nvoid main() {\n  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);\n  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);\n  vO = normal;\n  vV = cameraPosition - wp.xyz;\n  gl_Position = projectionMatrix * viewMatrix * wp;\n}',
            fragmentShader: 'uniform float t;\nvarying vec3 vN;\nvarying vec3 vV;\nvarying vec3 vO;\nfloat arh3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }\nfloat arn3(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(mix(arh3(i), arh3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(arh3(i + vec3(0.0, 1.0, 0.0)), arh3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y), mix(mix(arh3(i + vec3(0.0, 0.0, 1.0)), arh3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(arh3(i + vec3(0.0, 1.0, 1.0)), arh3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z); }\nvoid main() {\n  vec3 n = normalize(vN), v = normalize(vV), q = normalize(vO) * 2.4;\n  float f = 1.0 - abs(dot(n, v));\n  float m = arn3(q + vec3(0.0, 0.0, t * 0.4)) * 0.62 + arn3(q * 2.6 - vec3(t * 0.25)) * 0.38;\n  vec3 c = mix(vec3(0.62, 0.24, 0.03), vec3(1.0, 0.78, 0.22), smoothstep(0.28, 0.66, m));\n  c = mix(c, vec3(1.0, 0.96, 0.72), smoothstep(0.7, 0.92, m) * 0.85);\n  c += vec3(1.0, 0.5, 0.06) * pow(f, 2.0) * 0.85;\n  c += vec3(1.0) * pow(max(dot(reflect(-v, n), normalize(vec3(0.3, -0.4, 0.86))), 0.0), 28.0) * 0.55;\n  gl_FragColor = vec4(c * 1.3, 1.0);\n}'
          }))
        };
        const arPadC = { core: [1.6, 0.86, 0.26], ring: [1.25, 0.44, 0.05], slot: [1.45, 0.62, 0.1], off: [0.07, 0.06, 0.055], dS: [0.5, 0.2, 0.03], dB: [0.7, 0.28, 0.04], on: [1, 1, 1] };
        const arPad = { key: '', base: null, glow: null, dec: null, fl: null, orbs: null, gc: null, dc: null, fc: null };
        const arShp = pts => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
        const arExt = (pts, d, bv) => new THREE.ExtrudeGeometry(arShp(pts), { depth: d, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 1, curveSegments: 4 }).translate(0, 0, bv);
        const arSpin = k => { const o = []; for (let i = 0; i < 120; i++) { const a = i / 120 * TAU, r = (64 + 90 * Math.pow((1 + Math.cos(3 * a)) / 2, 1.6)) * k; o.push([Math.cos(a) * r, Math.sin(a) * r]); } return o; };
        const arTri = (rc, rr) => { const o = []; for (let k = 0; k < 3; k++) { const a = k * TAU / 3; for (let j = 0; j <= 8; j++) { const b = a - Math.PI / 3 + TAU / 3 * j / 8; o.push([Math.cos(a) * rc + Math.cos(b) * rr, Math.sin(a) * rc + Math.sin(b) * rr]); } } return o; };
        const arCurt = (pts, z0, hh, c) => {
          const pos = [], uv = [], col = [], idx = [], n = pts.length;
          pts.forEach(([x, y], i) => { pos.push(x, y, z0, x, y, z0 + hh); uv.push(i / (n - 1), 0, i / (n - 1), 1); col.push(...c, ...c); });
          for (let i = 0; i < n - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
          const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
          return g;
        };
        const arArc = (cx, cy, r, a0, a1, n) => { const o = []; for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
        const syncPads = () => {
          const key = W.pads.map(p => p.x + ',' + p.y + (p.big ? 'b' : 's')).join(';');
          if (key !== arPad.key) {
            for (const k of ['base', 'glow', 'dec', 'fl']) if (arPad[k]) { scene.remove(arPad[k]); arPad[k].geometry.dispose(); }
            if (arPad.orbs) scene.remove(arPad.orbs);
            for (const pv of padVis) if (pv.halo) scene.remove(pv.halo);
            padVis.length = 0; arPad.key = key;
            const bl = [], gl = [], dl = [], fl = [], nb = W.pads.filter(p => p.big).length;
            let gv = 0, dv = 0, fv = 0, bi = 0;
            for (const pd of W.pads) {
              const pv = { big: pd.big, on: null, g0: gv, g1: 0, d0: dv, d1: 0, f0: fv, f1: 0, cols: null, orb: -1, halo: null, k: 1 };
              const rot = Math.atan2(pd.y, pd.x) + (pd.big ? Math.PI / 3 : 0), cr = Math.cos(rot), sr = Math.sin(rot);
              const T = g => g.rotateZ(rot).translate(pd.x, pd.y, 0), TP = ([x, y]) => [pd.x + x * cr - y * sr, pd.y + x * sr + y * cr];
              const parts = [], fls = [];
              if (pd.big) {
                bl.push(arCol(T(arExt(arSpin(1), 8, 4)), [0.2, 0.21, 0.23]), arCol(T(arExt(arSpin(0.84), 12, 3)), [0.022, 0.024, 0.028]));
                parts.push([GX(new THREE.RingGeometry(34, 46, 32), 0, 0, 18.6), 'ring'], [GX(new THREE.CircleGeometry(28, 24), 0, 0, 18.8), 'core']);
                for (let k = 0; k < 3; k++) {
                  const a = k * TAU / 3, ca = Math.cos(a), sa = Math.sin(a);
                  parts.push([arBox(26, 44, 2, ca * 84, sa * 84, 18.4, a), 'slot'], [arBox(22, 32, 2, ca * 120, sa * 120, 18.4, a), 'ring']);
                  fls.push(arCurt([-30, -15, 0, 15, 30].map(q => TP([ca * 120 - sa * q, sa * 120 + ca * q])), 14, 150, arPadC.on), arCurt([-24, -8, 8, 24].map(q => TP([ca * 84 - sa * q, sa * 84 + ca * q])), 16, 120, arPadC.on));
                }
                fls.push(arCurt(arArc(0, 0, 30, 0, TAU, 12).map(TP), 18, 95, arPadC.on));
              } else {
                bl.push(arCol(T(arExt(arTri(60, 36), 2, 2)), [0.012, 0.012, 0.014]), arCol(T(arExt(arTri(60, 29), 5, 2)), [0.5, 0.52, 0.56]));
                parts.push([GX(new THREE.CircleGeometry(20, 20), 0, 0, 9.4), 'core'], [GX(new THREE.RingGeometry(26, 34, 28), 0, 0, 9.3), 'ring'], [GX(new THREE.RingGeometry(40, 44, 28), 0, 0, 9.2), 'ring']);
                for (let k = 0; k < 3; k++) { const a = k * TAU / 3; fls.push(arCurt(arArc(Math.cos(a) * 60, Math.sin(a) * 60, 31, a - 0.95, a + 0.95, 5).map(TP), 6, 54, arPadC.on)); }
              }
              const cols = [];
              for (const [g, kind] of parts) { const n = arCol(T(g), arPadC[kind]); gl.push(n); gv += n.attributes.position.count; const c = arPadC[kind]; for (let q = 0; q < n.attributes.position.count; q++) cols.push(c[0], c[1], c[2]); }
              pv.g1 = gv; pv.cols = new Float32Array(cols);
              for (const g of fls) { const n = g.toNonIndexed(); g.dispose(); fl.push(n); fv += n.attributes.position.count; }
              pv.f1 = fv;
              const ds = pd.big ? 620 : 300;
              dl.push(arQuad([pd.x - ds / 2, pd.y - ds / 2, 1.5], [pd.x + ds / 2, pd.y - ds / 2, 1.5], [pd.x + ds / 2, pd.y + ds / 2, 1.5], [pd.x - ds / 2, pd.y + ds / 2, 1.5], null, pd.big ? arPadC.dB : arPadC.dS).toNonIndexed());
              dv += 6; pv.d1 = dv;
              if (pd.big) {
                pv.orb = bi++;
                pv.halo = new THREE.Sprite(arPadM.halo); pv.halo.scale.set(520, 520, 1); pv.halo.position.set(pd.x, pd.y, 112); pv.halo.renderOrder = 4; scene.add(pv.halo);
              }
              padVis.push(pv);
            }
            arPad.base = new THREE.Mesh(mergeG(bl), arPadM.base); arPad.base.receiveShadow = true;
            arPad.glow = new THREE.Mesh(mergeG(gl), arPadM.glow);
            arPad.dec = new THREE.Mesh(mergeG(dl), arPadM.dec); arPad.dec.renderOrder = 1;
            arPad.fl = new THREE.Mesh(mergeG(fl), arPadM.flame); arPad.fl.renderOrder = 6;
            arPad.gc = arPad.glow.geometry.attributes.color; arPad.dc = arPad.dec.geometry.attributes.color; arPad.fc = arPad.fl.geometry.attributes.color;
            arPad.orbs = new THREE.InstancedMesh(arPad.orbG || (arPad.orbG = own(new THREE.IcosahedronGeometry(44, 3))), arPadM.orb, Math.max(1, nb));
            arPad.orbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); arPad.orbs.frustumCulled = false;
            scene.add(arPad.base, arPad.glow, arPad.dec, arPad.fl, arPad.orbs);
          }
          for (const pv of padVis) pv.on = null;
        };
        const arM4 = new THREE.Matrix4(), arQ4 = new THREE.Quaternion(), arV3 = new THREE.Vector3(), arS3 = new THREE.Vector3(), arEu = new THREE.Euler();
        const arPadTick = (dt, t) => {
          if (!arPad.glow) return;
          arPadU.t.value = t % 1000;
          let dirty = false;
          for (let i = 0; i < padVis.length && i < W.pads.length; i++) {
            const pv = padVis[i], pd = W.pads[i], on = pd.t <= 0;
            if (on !== pv.on) {
              pv.on = on; dirty = true;
              const ga = arPad.gc.array, da = arPad.dc.array, fa = arPad.fc.array, oc = arPadC.off;
              for (let q = pv.g0, j = 0; q < pv.g1; q++, j += 3) { ga[q * 3] = on ? pv.cols[j] : oc[0]; ga[q * 3 + 1] = on ? pv.cols[j + 1] : oc[1]; ga[q * 3 + 2] = on ? pv.cols[j + 2] : oc[2]; }
              const dc = pv.big ? arPadC.dB : arPadC.dS;
              for (let q = pv.d0; q < pv.d1; q++) { da[q * 3] = on ? dc[0] : 0; da[q * 3 + 1] = on ? dc[1] : 0; da[q * 3 + 2] = on ? dc[2] : 0; }
              for (let q = pv.f0 * 3; q < pv.f1 * 3; q++) fa[q] = on ? 1 : 0;
              if (pv.big) { pv.halo.visible = on; if (!on) pv.k = 0; }
            }
            if (pv.big) {
              if (on) {
                pv.k = Math.min(1, pv.k + dt * 4);
                const z = 114 + Math.sin(t * 2.2 + i) * 7, sc = pv.k * (0.97 + 0.03 * Math.sin(t * 6 + i));
                arEu.set(t * 0.5, 0, t * 1.1 + i); arQ4.setFromEuler(arEu); arV3.set(pd.x, pd.y, z); arS3.set(sc, sc, sc);
                pv.halo.position.z = z; arPadM.halo.opacity = 0.5 + 0.1 * Math.sin(t * 5);
                pv.halo.scale.set(520 * pv.k, 520 * pv.k, 1);
              } else { arV3.set(pd.x, pd.y, -500); arS3.set(0.001, 0.001, 0.001); }
              arM4.compose(arV3, arQ4, arS3); arPad.orbs.setMatrixAt(pv.orb, arM4);
            }
          }
          arPad.orbs.instanceMatrix.needsUpdate = true;
          if (dirty) { arPad.gc.needsUpdate = true; arPad.dc.needsUpdate = true; arPad.fc.needsUpdate = true; }
        };
