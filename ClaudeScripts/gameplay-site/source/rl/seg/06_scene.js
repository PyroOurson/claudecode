        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xcfe0ef, 11000, 75000);
        const arSunD = new THREE.Vector3(0.36, -0.3, 0.88).normalize();
        const hemi = new THREE.HemisphereLight(0xdcebff, 0x4f6a3d, 0.62); hemi.position.set(0, 0, 1); scene.add(hemi);
        const sun = new THREE.DirectionalLight(0xfff1dc, 1.1);
        sun.position.copy(arSunD).multiplyScalar(11000); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
        Object.assign(sun.shadow.camera, { left: -4750, right: 4000, top: 6950, bottom: -6400, near: 3000, far: 20000 });
        sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 3;
        scene.add(sun, sun.target);

        const arSkyTL = Math.PI * 0.56, arSunA = Math.atan2(arSunD.y, arSunD.x), arSunE = 0.62;
        const skyT = tex(2048, 512, (g, tw, th) => {
          const gr = g.createLinearGradient(0, 0, 0, th);
          [[0, '#1f55b4'], [0.22, '#2f6cc6'], [0.45, '#5390da'], [0.68, '#8fbde9'], [0.82, '#bcd8f0'], [0.885, '#d9e7f2'], [0.9, '#c9d6d6'], [0.93, '#7f8f78'], [1, '#4a5841']].forEach(([o, c]) => gr.addColorStop(o, c));
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
        const arFL = [];
        {
          const ins = 46, k2 = ins * (Math.SQRT2 - 1), WH = [0.62, 0.66, 0.6], TLc = [[0.3, 0.55, 1], [1, 0.45, 0.12]];
          const circ = (cx, cy, r, a0, a1, n) => { const o = []; for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
          for (const s of [-1, 1]) {
            const t = s < 0 ? 0 : 1, Yg = s * (AY - ins), Gx = GW - ins;
            arFL.push({ p: [[AX - ins, 0], [AX - ins, s * (V1 - k2)], [V2 - k2, Yg], [Gx, Yg], [Gx, s * CFG.Y], [-Gx, s * CFG.Y], [-Gx, Yg], [-(V2 - k2), Yg], [-(AX - ins), s * (V1 - k2)], [-(AX - ins), 0]], w: 40, c: TLc[t], g: t });
            arFL.push({ p: [[-2000, Yg], [-2000, s * 3520], [2000, s * 3520], [2000, Yg]], w: 48, c: TLc[t], g: t });
            arFL.push({ p: [[-1180, Yg], [-1180, s * 4300], [1180, s * 4300], [1180, Yg]], w: 48, c: TLc[t], g: t });
            arFL.push({ p: circ(0, s * 3520, 760, s > 0 ? Math.PI : 0, s > 0 ? TAU : Math.PI, 40), w: 48, c: TLc[t], g: t });
          }
          arFL.push({ p: [[-(AX - ins), 0], [AX - ins, 0]], w: 44, c: WH, g: -1 });
          arFL.push({ p: circ(0, 0, 1040, 0, TAU, 96), w: 40, c: WH, g: -1 });
        }
        const fieldT = tex(1024, 2048, (g, tw, th) => {
          const sx = tw / (2 * CFG.X), sy = th / (2 * GB), X0 = -CFG.X, Wd = 2 * CFG.X;
          g.setTransform(sx, 0, 0, -sy, tw / 2, th / 2);
          for (let i = 0, y0 = -5632; y0 < GB; i++, y0 += 512) for (let j = 0; j < 16; j++) { g.fillStyle = (i + j) % 2 ? '#1a4116' : '#23511d'; g.fillRect(X0 + j * 512, y0, 512, 512); }
          for (let i = 0; i < 64; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.02)'; g.fillRect(X0 + i * 128, -GB, 128, 2 * GB); }
          const R = rngOf(11);
          for (let i = 0; i < 9000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(18,55,14,.07)' : 'rgba(170,220,120,.05)'; g.fillRect(X0 + R() * Wd, -GB + R() * 2 * GB, 10 + R() * 14, 14 + R() * 22); }
          for (const s of [-1, 1]) {
            const gr = g.createLinearGradient(0, 0, 0, s * GB);
            const c = s < 0 ? '30,95,255' : '255,110,20';
            gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.3, `rgba(${c},.05)`); gr.addColorStop(0.85, `rgba(${c},.17)`); gr.addColorStop(1, `rgba(${c},.24)`);
            g.fillStyle = gr; g.fillRect(X0, s < 0 ? -GB : 0, Wd, GB);
          }
          const TG = ['rgba(60,140,255,.24)', 'rgba(255,130,40,.26)'];
          g.lineJoin = 'round'; g.lineCap = 'round';
          for (const s of [-1, 1]) {
            const t = s < 0 ? 0 : 1;
            g.save(); g.beginPath(); g.rect(X0, s < 0 ? -GB : 0, Wd, GB); g.clip();
            g.strokeStyle = TG[t]; g.lineWidth = 150;
            for (const L of arFL) if (L.g === t) { g.beginPath(); L.p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
            g.fillStyle = s < 0 ? 'rgba(40,110,255,.2)' : 'rgba(255,128,40,.2)';
            g.beginPath(); g.ellipse(0, 0, 1040, 1040, 0, s > 0 ? 0 : Math.PI, s > 0 ? Math.PI : TAU); g.fill();
            g.restore();
            g.fillStyle = s < 0 ? 'rgba(20,50,120,.5)' : 'rgba(120,48,10,.5)'; g.fillRect(-GW, s > 0 ? CFG.Y : -GB, 2 * GW, CFG.goalD);
            g.save(); g.beginPath(); g.rect(-GW, s > 0 ? CFG.Y : -GB, 2 * GW, CFG.goalD); g.clip();
            g.strokeStyle = s < 0 ? 'rgba(120,180,255,.35)' : 'rgba(255,170,100,.35)'; g.lineWidth = 12;
            g.translate(-GW, s * CFG.Y); arHex(g, 2 * GW, s * CFG.goalD, 120); g.stroke(); g.restore();
          }
          g.fillStyle = 'rgba(255,255,255,.12)';
          for (const [x, y] of CFG.small) { g.beginPath(); g.ellipse(x, y, 130, 130, 0, 0, TAU); g.fill(); }
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
          lq.push(arCol(GX(new THREE.CircleGeometry(46, 24), 0, 0, 0.6), [0.62, 0.66, 0.6]));
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
            g.setAttribute('color', new THREE.Float32BufferAttribute(pos.map(() => 1), 3)); g.computeVertexNormals(); caps.push(g);
          }
          const rampG = mergeG([arBand(arFil, (s, x, y) => [arU(x), arV(y)], null, true), ...caps]);
          const ramp = new THREE.Mesh(rampG, arGrass(own(new THREE.MeshStandardMaterial({ map: fieldT, color: lin(0xd0d8cc), roughness: 0.92, side: THREE.DoubleSide }))));
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
            g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 9; g.stroke();
            g.strokeStyle = 'rgba(255,255,255,.32)'; g.lineWidth = 2; g.stroke();
          }, true);
          const gp = [[1, arWB], [1, GH], [1, 1200], [1, HT - RR]];
          for (let k = 1; k <= arFN; k++) { const ph = Math.PI / 2 * k / arFN; gp.push([Math.cos(ph), HT - RR + RR * Math.sin(ph)]); }
          const ceilP = arVV.map(([x, y]) => new THREE.Vector2(x, y)), cg = new THREE.ShapeGeometry(new THREE.Shape(ceilP));
          cg.translate(0, 0, HT);
          { const p = cg.attributes.position, uv = cg.attributes.uv, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { uv.setXY(i, p.getX(i) / arHW, p.getY(i) / arHH); const t = arTint(p.getY(i), 0.55); c[i * 3] = t[0]; c[i * 3 + 1] = t[1]; c[i * 3 + 2] = t[2]; } cg.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
          const glassG = mergeG([arBand(gp, (s, x, y, z, r) => [s / arHW, (r < 4 ? z : HT - RR + (z - HT + RR) * 2.2) / arHH], (x, y) => arTint(y), true), cg]);
          const glass = new THREE.Mesh(glassG, arFlashable(own(new THREE.MeshBasicMaterial({ map: glassT, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false }))));
          glass.renderOrder = 2; scene.add(glass);

          const lineT = tex(64, 4, (g, tw, th) => { const gr = g.createLinearGradient(0, 0, tw, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.42, 'rgba(255,255,255,.3)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(0.58, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, th); });
          const pl = [], pn = Math.round(arPer / 1300);
          for (let k = 0; k < pn; k++) {
            const s0 = (k + 0.5) * arPer / pn, p = arAt(s0 - 45, 10), q = arAt(s0 + 45, 10);
            if (arMouth(p[0], p[1], 500)) continue;
            const c = arTint((p[1] + q[1]) / 2, 0.9);
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
          const c = TEAMCSS[team], dk = team ? '#1e0f08' : '#081026';
          const gr = g.createLinearGradient(0, 0, 0, th); gr.addColorStop(0, dk); gr.addColorStop(1, '#07090f'); g.fillStyle = gr; g.fillRect(0, 0, tw, th);
          g.save(); g.globalAlpha = 0.28; arHex(g, tw, th, 22); g.strokeStyle = c; g.lineWidth = 2; g.stroke(); g.restore();
          const shield = (cx, cy, r, a) => {
            g.save(); g.translate(cx, cy); g.globalAlpha = a;
            g.beginPath(); g.moveTo(-r * 0.86, -r * 0.92); g.lineTo(r * 0.86, -r * 0.92); g.lineTo(r * 0.8, r * 0.2); g.quadraticCurveTo(r * 0.55, r * 0.8, 0, r * 1.05); g.quadraticCurveTo(-r * 0.55, r * 0.8, -r * 0.8, r * 0.2); g.closePath();
            const sg = g.createLinearGradient(0, -r, 0, r); sg.addColorStop(0, team ? '#ffb15c' : '#6fb0ff'); sg.addColorStop(1, team ? '#c4480a' : '#1446b8');
            g.fillStyle = sg; g.fill(); g.lineWidth = r * 0.09; g.strokeStyle = '#ffffff'; g.stroke();
            g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(-r * 0.25, -r * 0.25, r * 0.3, 0, TAU); g.fill();
            g.beginPath(); g.moveTo(-r * 0.68, r * 0.36); g.quadraticCurveTo(0, -r * 0.2, r * 0.72, -r * 0.42); g.quadraticCurveTo(r * 0.25, r * 0.12, -r * 0.3, r * 0.62); g.closePath(); g.fill();
            g.restore();
          };
          shield(tw / 2, th * 0.5, th * 0.34, 1); shield(tw * 0.16, th * 0.56, th * 0.17, 0.55); shield(tw * 0.84, th * 0.56, th * 0.17, 0.55);
          g.fillStyle = c; g.fillRect(0, 6, tw, 5); g.fillRect(0, th - 11, tw, 5);
        });
        const arGoal = [];
        {
          const metal = [], net = [];
          const metalM = own(new THREE.MeshStandardMaterial({ color: lin(0x3a3f4a), roughness: 0.32, metalness: 0.75, envMap: arEnv, envMapIntensity: 1 }));
          const backingM = own(new THREE.MeshBasicMaterial({ color: lin(0x070b16), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
          const netM = own(new THREE.MeshBasicMaterial({ map: netT, vertexColors: true, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
          for (const s of [-1, 1]) {
            const team = s < 0 ? 0 : 1, col = TEAMC[team], Yl = s * CFG.Y, Yb = s * GB, D = CFG.goalD, nc = arTint(s * 5000, 1.2);
            metal.push(arBox(70, 90, GH + 70, -(GW + 35), s * (CFG.Y + 47), (GH + 70) / 2), arBox(70, 90, GH + 70, GW + 35, s * (CFG.Y + 47), (GH + 70) / 2), arBox(2 * GW + 140, 90, 70, 0, s * (CFG.Y + 47), GH + 35));
            for (const sx of [-1, 1]) metal.push(arBox(40, D, 40, sx * (GW + 20), s * (CFG.Y + D / 2), GH + 20), arBox(40, 40, GH + 40, sx * (GW + 20), s * (GB + 20), (GH + 40) / 2), arBox(36, D, 30, sx * (GW + 18), s * (CFG.Y + D / 2), 15));
            metal.push(arBox(2 * GW + 80, 40, 40, 0, s * (GB + 20), GH + 20), arBox(2 * GW, 34, 26, 0, s * (GB + 17), 13));
            const nq = (a, b, c, d, ru, rv) => net.push(arQuad(a, b, c, d, [0, 0, ru, 0, ru, rv, 0, rv], nc));
            for (const sx of [-1, 1]) nq([sx * GW, Yl, 0], [sx * GW, Yb, 0], [sx * GW, Yb, GH], [sx * GW, Yl, GH], D / 104, GH / 180);
            nq([-GW, Yl, GH], [GW, Yl, GH], [GW, Yb, GH], [-GW, Yb, GH], 2 * GW / 104, D / 180);
            const stripM = own(new THREE.MeshBasicMaterial({ color: lin(col, 1.7), toneMapped: false }));
            const sg = [
              arBox(24, 4, GH + 26, -(GW + 14), s * (CFG.Y - 1), (GH + 26) / 2), arBox(24, 4, GH + 26, GW + 14, s * (CFG.Y - 1), (GH + 26) / 2), arBox(2 * GW + 4, 4, 24, 0, s * (CFG.Y - 1), GH + 14),
              arBox(4, 50, GH, -(GW + 1.5), s * (CFG.Y + 30), GH / 2), arBox(4, 50, GH, GW + 1.5, s * (CFG.Y + 30), GH / 2), arBox(2 * GW, 50, 4, 0, s * (CFG.Y + 30), GH + 1.5),
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
        const arLampM = own(new THREE.MeshBasicMaterial({ color: 0xfff8e6, toneMapped: false }));
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
          crowd(T1i, T1o, 260, 2050, all, 0.8, 0.68);
          crowd(T2i, T2o, 2600, 5000, main, 0.68, 0.5);
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
          const structM = own(new THREE.MeshStandardMaterial({ color: lin(0x6c7380), roughness: 0.6, metalness: 0.45, envMap: arEnv, envMapIntensity: 0.6 }));
          scene.add(new THREE.Mesh(mergeG(arStruct), structM), new THREE.Mesh(mergeG(arLamp), arLampM));
          const gold = new THREE.Mesh(mergeG(arGold), own(new THREE.MeshStandardMaterial({ color: lin(0xd9a443), vertexColors: true, roughness: 0.28, metalness: 0.9, envMap: arEnv, envMapIntensity: 1.3, emissive: lin(0x2a1a04) })));
          scene.add(gold, new THREE.Mesh(mergeG(arTree), own(new THREE.MeshLambertMaterial({ vertexColors: true }))));
          const gq = new THREE.Mesh(mergeG(arGlowQ), own(new THREE.MeshBasicMaterial({ map: glowT, color: 0xfff2d8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide })));
          gq.renderOrder = 5; scene.add(gq);
          const bm = new THREE.Mesh(mergeG(arBeams), own(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })));
          bm.renderOrder = 5; bm.frustumCulled = false; scene.add(bm);
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
        const arPadM = {
          base: own(new THREE.MeshStandardMaterial({ color: lin(0x6e747d), roughness: 0.4, metalness: 0.55, envMap: arEnv, envMapIntensity: 0.8, side: THREE.DoubleSide })),
          glow: own(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })),
          dec: own(new THREE.MeshBasicMaterial({ map: glowT, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, toneMapped: false })),
          ring: own(new THREE.MeshBasicMaterial({ color: lin(0xff7a1a, 1.3), toneMapped: false, side: THREE.DoubleSide })),
          halo: own(new THREE.SpriteMaterial({ map: glowT, color: 0xff9a2a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8, toneMapped: false })),
          orb: own(new THREE.ShaderMaterial({
            vertexShader: 'varying vec3 vN;\nvarying vec3 vV;\nvoid main() {\n  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);\n  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);\n  vV = cameraPosition - wp.xyz;\n  gl_Position = projectionMatrix * viewMatrix * wp;\n}',
            fragmentShader: 'varying vec3 vN;\nvarying vec3 vV;\nvoid main() {\n  float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));\n  vec3 c = mix(vec3(1.0, 0.95, 0.72), vec3(1.0, 0.5, 0.06), smoothstep(0.05, 0.75, f));\n  gl_FragColor = vec4(c * (1.0 + 0.25 * (1.0 - f)), 1.0);\n}'
          }))
        };
        const arPadC = { core: [1.5, 0.78, 0.18], ring: [1.2, 0.42, 0.05], off: [0.08, 0.06, 0.05], dS: [0.55, 0.22, 0.03], dB: [0.75, 0.3, 0.04] };
        const arPad = { key: '', base: null, glow: null, dec: null, orbs: null, gc: null, dc: null };
        const arLathe = (pts, seg) => GX(new THREE.LatheGeometry(pts.map(([r, z]) => new THREE.Vector2(r, z)), seg), 0, 0, 0, Math.PI / 2);
        const syncPads = () => {
          const key = W.pads.map(p => p.x + ',' + p.y + (p.big ? 'b' : 's')).join(';');
          if (key !== arPad.key) {
            for (const k of ['base', 'glow', 'dec']) if (arPad[k]) { scene.remove(arPad[k]); arPad[k].geometry.dispose(); }
            if (arPad.orbs) scene.remove(arPad.orbs);
            for (const pv of padVis) { if (pv.halo) scene.remove(pv.halo); if (pv.ring) { scene.remove(pv.ring); pv.ring.geometry.dispose(); } }
            padVis.length = 0; arPad.key = key;
            const bl = [], gl = [], dl = [], nb = W.pads.filter(p => p.big).length;
            let gv = 0, dv = 0, bi = 0;
            for (const pd of W.pads) {
              const pv = { big: pd.big, on: null, g0: gv, g1: 0, d0: dv, d1: 0, cols: null, orb: -1, halo: null, ring: null, k: 1 };
              const T = g => g.translate(pd.x, pd.y, 0);
              if (pd.big) {
                bl.push(arCol(T(arLathe([[0, 15], [96, 15], [104, 18], [128, 18], [134, 15], [160, 15], [172, 9], [180, 0]], 32)), [1, 1, 1]));
              } else {
                bl.push(arCol(T(arLathe([[0, 9], [44, 9], [50, 7], [62, 7], [68, 9], [74, 9], [84, 4], [90, 0]], 24)), [1, 1, 1]));
              }
              const parts = pd.big
                ? [[GX(new THREE.TorusGeometry(116, 6, 6, 40), 0, 0, 18.5), 'ring'], [GX(new THREE.RingGeometry(88, 94, 40), 0, 0, 15.4), 'ring'], [GX(new THREE.CylinderGeometry(52, 58, 4, 24), 0, 0, 16, Math.PI / 2), 'core']]
                : [[GX(new THREE.RingGeometry(52, 60, 24), 0, 0, 7.6), 'ring'], [GX(new THREE.CylinderGeometry(38, 42, 3, 18), 0, 0, 9.2, Math.PI / 2), 'core'], [GX(new THREE.SphereGeometry(20, 12, 6, 0, TAU, 0, Math.PI / 2), 0, 0, 9.5, Math.PI / 2).scale(1, 1, 0.55).translate(0, 0, 4.5), 'core']];
              const cols = [];
              for (const [g, kind] of parts) { const n = arCol(T(g), arPadC[kind]); gl.push(n); gv += n.attributes.position.count; const c = arPadC[kind]; for (let q = 0; q < n.attributes.position.count; q++) cols.push(c[0], c[1], c[2]); }
              pv.g1 = gv; pv.cols = new Float32Array(cols);
              const ds = pd.big ? 720 : 360;
              dl.push(arQuad([pd.x - ds / 2, pd.y - ds / 2, 1.5], [pd.x + ds / 2, pd.y - ds / 2, 1.5], [pd.x + ds / 2, pd.y + ds / 2, 1.5], [pd.x - ds / 2, pd.y + ds / 2, 1.5], null, pd.big ? arPadC.dB : arPadC.dS).toNonIndexed());
              dv += 6; pv.d1 = dv;
              if (pd.big) {
                pv.orb = bi++;
                pv.halo = new THREE.Sprite(arPadM.halo); pv.halo.scale.set(680, 680, 1); pv.halo.position.set(pd.x, pd.y, 110); pv.halo.renderOrder = 4; scene.add(pv.halo);
                pv.ring = new THREE.Mesh(own(new THREE.RingGeometry(140, 154, 48, 1, Math.PI / 2, TAU)), arPadM.ring); pv.ring.position.set(pd.x, pd.y, 19.5); pv.ring.visible = false; scene.add(pv.ring);
              }
              padVis.push(pv);
            }
            arPad.base = new THREE.Mesh(mergeG(bl), arPadM.base); arPad.base.receiveShadow = true;
            arPad.glow = new THREE.Mesh(mergeG(gl), arPadM.glow);
            arPad.dec = new THREE.Mesh(mergeG(dl), arPadM.dec); arPad.dec.renderOrder = 1;
            arPad.gc = arPad.glow.geometry.attributes.color; arPad.dc = arPad.dec.geometry.attributes.color;
            arPad.orbs = new THREE.InstancedMesh(arPad.orbG || (arPad.orbG = own(new THREE.IcosahedronGeometry(62, 3))), arPadM.orb, Math.max(1, nb));
            arPad.orbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); arPad.orbs.frustumCulled = false;
            scene.add(arPad.base, arPad.glow, arPad.dec, arPad.orbs);
          }
          for (const pv of padVis) pv.on = null;
        };
        const arM4 = new THREE.Matrix4(), arQ4 = new THREE.Quaternion(), arV3 = new THREE.Vector3(), arS3 = new THREE.Vector3(), arEu = new THREE.Euler();
        const arPadTick = (dt, t) => {
          if (!arPad.glow) return;
          let dirty = false;
          for (let i = 0; i < padVis.length && i < W.pads.length; i++) {
            const pv = padVis[i], pd = W.pads[i], on = pd.t <= 0;
            if (on !== pv.on) {
              pv.on = on; dirty = true;
              const ga = arPad.gc.array, da = arPad.dc.array, oc = arPadC.off;
              for (let q = pv.g0, j = 0; q < pv.g1; q++, j += 3) { ga[q * 3] = on ? pv.cols[j] : oc[0]; ga[q * 3 + 1] = on ? pv.cols[j + 1] : oc[1]; ga[q * 3 + 2] = on ? pv.cols[j + 2] : oc[2]; }
              const dc = pv.big ? arPadC.dB : arPadC.dS;
              for (let q = pv.d0; q < pv.d1; q++) { da[q * 3] = on ? dc[0] : 0; da[q * 3 + 1] = on ? dc[1] : 0; da[q * 3 + 2] = on ? dc[2] : 0; }
              if (pv.big) { pv.halo.visible = on; pv.ring.visible = !on; if (!on) pv.k = 0; }
            }
            if (pv.big) {
              if (on) {
                pv.k = Math.min(1, pv.k + dt * 4);
                const z = 122 + Math.sin(t * 2.2 + i) * 10, sc = pv.k * (0.94 + 0.06 * Math.sin(t * 6 + i));
                arEu.set(t * 0.6, 0, t * 1.4); arQ4.setFromEuler(arEu); arV3.set(pd.x, pd.y, z); arS3.set(sc, sc, sc);
                pv.halo.position.z = z; arPadM.halo.opacity = 0.7 + 0.15 * Math.sin(t * 5);
                pv.halo.scale.set(680 * pv.k, 680 * pv.k, 1);
              } else {
                arV3.set(pd.x, pd.y, -500); arS3.set(0.001, 0.001, 0.001);
                const n = Math.floor(48 * clamp(1 - pd.t / (pd.cd || 10), 0, 1));
                pv.ring.geometry.setDrawRange(0, n * 6);
              }
              arM4.compose(arV3, arQ4, arS3); arPad.orbs.setMatrixAt(pv.orb, arM4);
            }
          }
          arPad.orbs.instanceMatrix.needsUpdate = true;
          if (dirty) { arPad.gc.needsUpdate = true; arPad.dc.needsUpdate = true; }
        };

