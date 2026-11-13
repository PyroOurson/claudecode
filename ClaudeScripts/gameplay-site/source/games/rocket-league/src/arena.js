        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x95704a, 2400, 18000);
        const arSunAz = 0.9, arSunEl = 0.64, arSunD = new THREE.Vector3(Math.cos(arSunEl) * Math.cos(arSunAz), Math.cos(arSunEl) * Math.sin(arSunAz), Math.sin(arSunEl));
        const hemi = new THREE.HemisphereLight(0xa8a8b4, 0x4a3a28, 0.55); hemi.position.set(0, 0, 1); scene.add(hemi);
        const sun = new THREE.DirectionalLight(0xffc890, 1.15);
        sun.position.copy(arSunD).multiplyScalar(15000); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
        Object.assign(sun.shadow.camera, { left: -7200, right: 7200, top: 7200, bottom: -7200, near: 2000, far: 30000 });
        sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 3;
        scene.add(sun, sun.target);

        const arSkyTL = Math.PI * 0.56, arSunA = Math.atan2(arSunD.y, arSunD.x), arSunE = 0.62;
        const skyT = tex(2048, 512, (g, tw, th) => {
          const gr = g.createLinearGradient(0, 0, 0, th);
          [[0, '#111b2c'], [0.3, '#1d2a3e'], [0.55, '#3a3f4a'], [0.7, '#6a5c50'], [0.81, '#9c7a58'], [0.88, '#c29361'], [0.9, '#8c6a48'], [0.93, '#3e3428'], [1, '#262019']].forEach(([o, c]) => gr.addColorStop(o, c));
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
          for (let i = 0; i < 700; i++) { const y = R() * PY(0.5); g.fillStyle = `rgba(255,255,255,${0.25 + R() * 0.6})`; g.fillRect(R() * tw, y, R() < 0.9 ? 1 : 2, 1); }
          for (let c = 0; c < 70; c++) {
            const a = R() * TAU, e = 0.08 + Math.pow(R(), 1.5) * 0.85, w = 0.12 + R() * 0.3, n = 10 + Math.floor(R() * 18), k = 0.55 + R() * 0.45;
            for (let p = 0; p < n; p++) {
              const pa = a + (R() - 0.5) * w, pe = e + (R() - 0.35) * w * 0.16, pr = (0.018 + R() * 0.045) * (0.6 + w * 1.4);
              blob(pa, pe, pr * 1.3, pr * 0.8, `rgba(110,128,146,${0.16 * k})`, 'rgba(110,128,146,0)');
            }
          }
          for (let i = 0; i < 90; i++) {
            const a = R() * TAU, e = 0.12 + R() * 0.42, wd = (0.012 + R() * 0.03) * tw, x0 = PX(a), y0 = PY(e), y1 = PY(-0.02), L = 18 + R() * 30;
            g.fillStyle = `rgb(${L},${L + 8},${L + 16})`; g.fillRect(x0, y0, wd, y1 - y0);
            for (let wy = y0 + 4; wy < y1 - 3; wy += 5) for (let wx = x0 + 2; wx < x0 + wd - 2; wx += 4) if (R() < 0.28) { g.fillStyle = R() < 0.7 ? 'rgba(255,214,150,.55)' : 'rgba(170,210,255,.5)'; g.fillRect(wx, wy, 1.6, 2); }
          }
          blob(arSunAz, 0.25, 1.3, 0.5, 'rgba(255,165,90,.42)', 'rgba(255,140,60,0)'); blob(arSunAz, arSunEl, 0.4, 0.3, 'rgba(255,215,150,.5)', 'rgba(255,170,90,0)'); blob(arSunAz, arSunEl, 0.12, 0.09, 'rgba(255,248,225,1)', 'rgba(255,220,160,0)');
          const hz = g.createLinearGradient(0, PY(0.35), 0, PY(0)); hz.addColorStop(0, 'rgba(160,120,80,0)'); hz.addColorStop(1, 'rgba(200,148,96,.7)'); g.fillStyle = hz; g.fillRect(0, PY(0.3), tw, PY(0) - PY(0.3));
          
        });
        const arSkyM = own(new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
        const sky = new THREE.Mesh(own(new THREE.SphereGeometry(60000, 48, 20, 0, TAU, 0, arSkyTL)), arSkyM);
        sky.rotation.x = Math.PI / 2; scene.add(sky);
        const glowT = tex(64, 64, (g, tw) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.42)'); gr.addColorStop(0.65, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, tw); });
        const arSunG = { position: arSunD.clone().multiplyScalar(50000) };
        const arHaloT = tex(128, 128, (g, tw) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.08, 'rgba(255,255,255,.75)'); gr.addColorStop(0.25, 'rgba(255,255,255,.32)'); gr.addColorStop(0.55, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, tw); });
        const arSunH = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: arHaloT, color: 0xffa868, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5, fog: false, toneMapped: false })));
        arSunH.scale.set(30000, 30000, 1); arSunH.position.copy(arSunD).multiplyScalar(26000); arSunH.renderOrder = 7; scene.add(arSunH);
        const arRingT = tex(128, 128, (g, tw) => { const gr = g.createRadialGradient(64, 64, 30, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.55)'); gr.addColorStop(0.85, 'rgba(255,255,255,.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, tw); });
        const arFlare = [[0.35, 95, 0xffb070, arHaloT, 0.62], [0.7, 55, 0x9fd0ff, arHaloT, 0.58], [1.15, 165, 0xffc890, arRingT, 0.55], [1.5, 36, 0xc8a0ff, arHaloT, 0.6], [1.85, 125, 0x80ffb0, arRingT, 0.42]].map(([f, sz, c, m, o]) => { const sp = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: m, color: c, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: o, fog: false, toneMapped: false }))); sp.visible = false; sp.renderOrder = 9; sp.frustumCulled = false; scene.add(sp); return { sp, f, sz, o }; });
        const arSunC = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: glowT, color: 0xfff0d0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9, fog: false, toneMapped: false }))); arSunC.scale.set(6000, 6000, 1); arSunC.position.copy(arSunG.position); scene.add(arSunC);;
        const arRays = (() => {
          const rp = [], rc = [], S = arSunD.clone().multiplyScalar(30000), RR3 = rngOf(71);
          for (let k = 0; k < 7; k++) {
            const tx = (RR3() - 0.5) * 9000, ty = (RR3() - 0.3) * 9000, w = 500 + RR3() * 900, d = new THREE.Vector3(tx - S.x, ty - S.y, -S.z).normalize(), side = new THREE.Vector3(-d.y, d.x, 0).normalize().multiplyScalar(w);
            rp.push(S.x, S.y, S.z, tx + side.x, ty + side.y, 0, tx - side.x, ty - side.y, 0); rc.push(1, 0.72, 0.4, 0, 0, 0, 0, 0, 0);
          }
          const rg = own(new THREE.BufferGeometry()); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setAttribute('color', new THREE.Float32BufferAttribute(rc, 3));
          const rm = new THREE.Mesh(rg, own(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false })));
          rm.frustumCulled = false; rm.renderOrder = 6; scene.add(rm); return rm;
        })();
        {
          const wT = tex(64, 256, (g, tw, th) => { g.fillStyle = '#3c3a3c'; g.fillRect(0, 0, tw, th); const R = rngOf(83); for (let y = 2; y < th; y += 6) { g.fillStyle = `rgba(240,236,220,${0.25 + R() * 0.55})`; g.fillRect(0, y, tw, 2); if (R() < 0.3) { g.fillStyle = '#3c3a3c'; g.fillRect(R() * tw, y, 8 + R() * 20, 2); } } }, true);
          const bx = [], tp = [], R = rngOf(97);
          for (let k = 0; k < 44; k++) {
            const a = R() * TAU, da = Math.abs(((a - arSunAz + Math.PI) % TAU + TAU) % TAU - Math.PI);
            if (da < 0.35) continue;
            const r = 28000 + R() * 16000, x = Math.cos(a) * r * 1.1, y = Math.sin(a) * r, w = 1600 + R() * 2400, h = 7000 + R() * 13000;
            const dp = w * (0.6 + R() * 0.6), ns = 1 + Math.floor(R() * 3);
            let z0 = -500, ww = w, dd = dp;
            for (let k = 0; k < ns; k++) {
              const hh = (h - z0) * (k === ns - 1 ? 1 : 0.45 + R() * 0.2), g = new THREE.BoxGeometry(ww, dd, hh); g.translate(x, y, z0 + hh / 2);
              const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ww / 2400, uv.getY(i) * hh / 2400);
              bx.push(g); z0 += hh; ww *= 0.72; dd *= 0.72;
            }
            tp.push(x, y, z0 + 80); if (R() < 0.4) bx.push(new THREE.CylinderGeometry(25, 60, 2400, 4).rotateX(Math.PI / 2).translate(x, y, z0 + 1200)), tp.push(x, y, z0 + 2400);
          }
          const bm = new THREE.Mesh(mergeG(bx), own(new THREE.MeshBasicMaterial({ map: wT, color: lin(0xc8a684), fog: false })));
          scene.add(bm);
          const tg = own(new THREE.BufferGeometry()); tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
          const tpt = new THREE.Points(tg, own(new THREE.PointsMaterial({ size: 500, map: glowT, color: 0xff2a1a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false })));
          tpt.frustumCulled = false; scene.add(tpt);
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
        const arFogAdd = m => { const f = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { if (f) f(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <fog_fragment>', '#ifdef USE_FOG\n  gl_FragColor.rgb *= 1.0 - 0.85 * smoothstep(fogNear, fogFar, fogDepth);\n#endif'); }; return m; };
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
        const arFL = [], arHeavy = [arRays];
        const arZY = 3560 * CFG.Y / 5120;
        {
          const k3 = Math.sqrt(3), BL = [0.03, 0.17, 1.2], OR = [1.2, 0.22, 0.02], WH = [0.55, 0.57, 0.6];
          const inF = (x, y, m) => Math.abs(x) < AX - m && Math.abs(y) < AY - m && (Math.abs(x) + Math.abs(y)) < CFG.corner - RR * Math.SQRT2 - m * 1.42;
          const vx = (cx, cy, k, r) => [cx + Math.cos(k * Math.PI / 3) * r, cy + Math.sin(k * Math.PI / 3) * r];
          const R = rngOf(57), H = 1000, inZ = (x, y) => (x / 1180) ** 2 + (y / 1180) ** 2 < 1 || Math.abs(y) > arZY - 60;
          for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) {
            const cx = i * 1.5 * H + 300, cy = (j + (i & 1 ? 0.5 : 0)) * k3 * H;
            for (let k = 0; k < 3; k++) {
              if (R() < 0.16) continue;
              const p = vx(cx, cy, k, H), q = vx(cx, cy, k + 1, H), P = t => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
              let run = [];
              for (let t = 0; t < 1; t += 0.125) {
                const A = P(t), B = P(t + 0.125), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
                const ok = inF(A[0], A[1], 140) && inF(B[0], B[1], 140) && Math.abs(A[1]) > 220 && Math.abs(B[1]) > 220 && Math.sign(A[1]) === Math.sign(B[1]) && !inZ(mx, my);
                if (ok) { if (!run.length) run.push(A); run.push(B); }
                if ((!ok || t >= 0.874) && run.length > 1) { arFL.push({ p: run, w: 30, c: run[0][1] < 0 ? BL : OR }); run = []; } else if (!ok) run = [];
              }
            }
          }
          for (const s of [-1, 1]) for (const sx of [-1, 1]) for (const bx of [1150, 2750]) for (const e of [-1, 1]) {
            const x = sx * bx + e * 205, y1 = s * (bx > 2000 ? arZY - 420 : arZY - 20);
            arFL.push({ p: [[x, s * 1250], [x, y1]], w: 12, c: (s < 0 ? BL : OR).map(v => v * 0.8) });
          }
          for (const s of [-1, 1]) { const xm = Math.min(AX, CFG.corner - RR * Math.SQRT2 - arZY) - 40; arFL.push({ p: [[-xm, s * arZY], [xm, s * arZY]], w: 22, c: WH }); }
          for (let k = 0; k < 72; k += 2) { const a0 = k / 72 * TAU, a1 = (k + 1.1) / 72 * TAU; arFL.push({ p: [[Math.cos(a0) * 1100, Math.sin(a0) * 1100], [Math.cos(a1) * 1100, Math.sin(a1) * 1100]], w: 16, c: WH }); }
        }
        const fieldT = tex(1024, 2048, (g, tw, th) => {
          const sx = tw / (2 * CFG.X), sy = th / (2 * GB), X0 = -CFG.X, Wd = 2 * CFG.X;
          g.setTransform(sx, 0, 0, -sy, tw / 2, th / 2);
          g.fillStyle = '#244222'; g.fillRect(X0, -GB, Wd, 2 * GB);
          for (let i = 0, y0 = -GB; y0 < GB; i++, y0 += 512) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.4)' : 'rgba(200,255,200,.06)'; g.fillRect(X0, y0, Wd, 512); }
          for (let i = -8; i < 8; i++) for (let j = -10; j < 10; j++) { g.fillStyle = (i + j) & 1 ? 'rgba(0,0,0,.11)' : 'rgba(255,255,210,.035)'; g.fillRect(i * 640 + 320, j * 640, 640, 640); }
          const R = rngOf(11);
          for (let i = 0; i < 26000; i++) { const d = R() < 0.5; g.fillStyle = d ? `rgba(0,0,0,${0.05 + R() * 0.08})` : `rgba(210,230,170,${0.025 + R() * 0.04})`; g.fillRect(X0 + R() * Wd, -GB + R() * 2 * GB, 8 + R() * 12, 6 + R() * 10); }
          for (let i = 0; i < 260; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,220,.03)'; const r = 120 + R() * 380; g.beginPath(); g.ellipse(X0 + R() * Wd, -GB + R() * 2 * GB, r, r * (0.6 + R() * 0.5), R() * 3, 0, TAU); g.fill(); }
          const TB = ['rgba(28,72,235,.32)', 'rgba(255,100,20,.27)'];
          for (const s of [-1, 1]) {
            const t = s < 0 ? 0 : 1;
            for (const sx of [-1, 1]) for (const bx of [1150, 2750]) {
              const y0 = s * 1250, y1 = s * (bx > 2000 ? arZY - 420 : arZY - 20);
              g.fillStyle = TB[t]; g.fillRect(sx * bx - 205, Math.min(y0, y1), 410, Math.abs(y1 - y0));
              g.fillStyle = 'rgba(255,255,255,.12)'; for (let y = 1400; y < Math.abs(y1) - 200; y += 260) g.fillRect(sx * bx - 8, s * y, 16, s * 130);
            }
          }
          g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(X0, -10, Wd, 20);
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
        const arWR = CFG.cornerR || RR, arCeR = CFG.ceilR || RR, arXN = CFG.X - arWR, arYN = CFG.Y - arWR, arCN = CFG.corner - arWR * Math.SQRT2, arW1 = arCN - arXN, arW2 = arCN - arYN;
        const arVV = [[arXN, -arW1], [arXN, arW1], [arW2, arYN], [-arW2, arYN], [-arXN, arW1], [-arXN, -arW1], [-arW2, -arYN], [arW2, -arYN]];
        const arNN = [[1, 0], [arS2, arS2], [0, 1], [-arS2, arS2], [-1, 0], [-arS2, -arS2], [0, -1], [arS2, -arS2]];
        const arPath = [];
        for (let i = 0; i < 8; i++) {
          const a = arVV[i], b = arVV[(i + 1) % 8], n = arNN[i], pn = arNN[(i + 7) % 8];
          const a0 = Math.atan2(pn[1], pn[0]); let a1 = Math.atan2(n[1], n[0]); if (a1 < a0) a1 += TAU;
          const nk = Math.max(4, Math.round(arWR * (a1 - a0) / 110));
          for (let k = 0; k < nk; k++) { const t = a0 + (a1 - a0) * k / nk; arPath.push([a[0], a[1], Math.cos(t), Math.sin(t)]); }
          const steps = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 420)), ts = [];
          for (let k = 0; k < steps; k++) ts.push(k / steps);
          if (i === 2 || i === 6) for (const gx of [GW, -GW]) ts.push((gx - a[0]) / (b[0] - a[0]));
          ts.sort((x, y) => x - y);
          for (const t of ts) arPath.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, n[0], n[1]]);
        }
        arPath.push(arPath[0]);
        const arPS = [0];
        for (let i = 1; i < arPath.length; i++) { const p = arPath[i], q = arPath[i - 1]; arPS.push(arPS[i - 1] + Math.hypot(p[0] + p[2] * arWR - q[0] - q[2] * arWR, p[1] + p[3] * arWR - q[1] - q[3] * arWR)); }
        const arPer = arPS[arPS.length - 1];
        const arAt = (s, inw) => {
          s = ((s % arPer) + arPer) % arPer;
          let i = 1; while (i < arPS.length - 1 && arPS[i] < s) i++;
          const p = arPath[i - 1], q = arPath[i], k = (s - arPS[i - 1]) / Math.max(1e-6, arPS[i] - arPS[i - 1]);
          const nx = p[2] + (q[2] - p[2]) * k, ny = p[3] + (q[3] - p[3]) * k, nl = Math.hypot(nx, ny), r = arWR - (inw || 0);
          return [p[0] + (q[0] - p[0]) * k + nx / nl * r, p[1] + (q[1] - p[1]) * k + ny / nl * r, nx / nl, ny / nl];
        };
        const arMouth = (x, y, m) => Math.abs(x) < GW + (m || 0) && Math.abs(y) > AY - 1;
        const arTint = (y, k = 1) => { const t = clamp(y / 2600, -1, 1), a = Math.abs(t); return t < 0 ? [(0.9 - 0.68 * a) * k, (0.92 - 0.42 * a) * k, k] : [k, (0.92 - 0.5 * a) * k, (0.88 - 0.8 * a) * k]; };
        const arAC = CFG.corner - RR * Math.SQRT2, arRf = (x, y) => { const ax = Math.abs(x), ay = Math.abs(y), rb = CFG.rampBack || RR, wb = (ay - AY - Math.max(ax - AX, (ax + ay - arAC) * arS2)) / (CFG.rampBlend || 400) + 0.5; return wb <= 0 ? RR : wb >= 1 ? rb : RR + (rb - RR) * wb; };
        const arFN = CFG.facets || 6;
        const arFil = (cx, cy, nx, ny) => {
          const o = [];
          for (let k = 0; k <= arFN; k++) {
            const th = Math.PI / 2 * k / arFN; let rf = arRf(cx, cy), off = 0;
            for (let it = 0; it < 4; it++) { off = arWR - rf * (1 - Math.sin(th)); rf = arRf(cx + nx * off, cy + ny * off); }
            off = arWR - rf * (1 - Math.sin(th));
            o.push([off / arWR, rf * (1 - Math.cos(th))]);
          }
          return o;
        };
        const arRw = (cx, cy, nx, ny) => arRf(cx + nx * arWR, cy + ny * arWR);
        const arBand = (rows, uvf, colf, cut) => {
          const pos = [], uv = [], col = [], idx = [], RF = typeof rows === 'function' ? rows : () => rows, nr = RF(...arPath[0]).length;
          for (let i = 0; i < arPath.length; i++) {
            const [cx, cy, nx, ny] = arPath[i], rw = RF(cx, cy, nx, ny);
            for (let r = 0; r < nr; r++) {
              const [cp, z] = rw[r], x = cx + nx * arWR * cp, y = cy + ny * arWR * cp;
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
            lq.push(arQuad([a[0] - ux + uy, a[1] - uy - ux, 2], [b[0] + ux + uy, b[1] + uy - ux, 2], [b[0] + ux - uy, b[1] + uy + ux, 2], [a[0] - ux - uy, a[1] - uy + ux, 2], null, L.c));
          }
          lq.push(arCol(GX(new THREE.RingGeometry(70, 92, 32), 0, 0, 2), [0.78, 0.8, 0.82]));
          const lm = new THREE.Mesh(mergeG(lq), own(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 })));
          scene.add(lm);
        }
        {
          const rg = [];
          for (const s of [-1, 1]) rg.push(arCol(GX(new THREE.RingGeometry(300, 318, 48, 1, s < 0 ? Math.PI : 0, Math.PI), 0, 0, 2.8), s < 0 ? [0.03, 0.17, 1.2] : [1.2, 0.22, 0.02]));
          scene.add(new THREE.Mesh(mergeG(rg), own(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }))));
        }
        const arWB = 626, arWT = 610, arBP = arPer / Math.round(arPer / 2048), arHW = arPer / Math.round(arPer / 2100), arHH = arHW * 444 / 256;

        {
          const caps = [];
          for (const s of [-1, 1]) for (const sx of [-1, 1]) {
            const pts = [[s * CFG.Y, 0], ...arFil(sx * GW, s * arYN, 0, s).map(([cp, z]) => [s * (arYN + arWR * cp), z])];
            const pos = [], uv = [];
            for (let k = 1; k < pts.length - 1; k++) for (const [y, z] of [pts[0], pts[k], pts[k + 1]]) { pos.push(sx * GW, y, z); uv.push(arU(sx * GW), arV(y)); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
            g.setAttribute('color', new THREE.Float32BufferAttribute(pos.map(() => 0.42), 3)); g.computeVertexNormals(); caps.push(g);
          }
          const rampG = mergeG([arBand(arFil, (s, x, y, z, r) => [s / 640, (r + 1) / (arFN + 1)], (x, y) => { const t = arTint(y, 1); return [0.4 * (0.75 + 0.25 * t[0]), 0.39 * (0.75 + 0.25 * t[1]), 0.38 * (0.75 + 0.25 * t[2])]; }, true), ...caps]);
          const rampT = tex(256, 256, (g, tw, th) => { g.fillStyle = '#90959c'; g.fillRect(0, 0, tw, th); const R = rngOf(23); for (let i = 0; i < 1400; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)'; g.fillRect(R() * tw, R() * th, 2 + R() * 6, 2 + R() * 6); } const gy = th * 0.8; g.fillStyle = '#2c3037'; g.fillRect(0, gy, tw, th - gy); g.strokeStyle = 'rgba(150,158,170,.55)'; g.lineWidth = 1.4; g.beginPath(); for (let x = -th; x < tw + th; x += 7) { g.moveTo(x, gy); g.lineTo(x + (th - gy), th); g.moveTo(x + (th - gy), gy); g.lineTo(x, th); } g.stroke(); g.fillStyle = 'rgba(20,22,26,.9)'; g.fillRect(0, gy - 3, tw, 4); g.fillStyle = 'rgba(40,44,52,.55)'; g.fillRect(0, 0, 3, gy); g.fillRect(tw / 2, 0, 2, gy); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(4, 0, 2, gy); for (const v of [0.18, 0.5]) { g.fillStyle = 'rgba(30,34,40,.4)'; g.fillRect(0, v * th, tw, 2); } }, true);
          const ramp = new THREE.Mesh(rampG, own(new THREE.MeshStandardMaterial({ map: rampT, vertexColors: true, roughness: 0.5, metalness: 0.15, envMap: arEnv, envMapIntensity: 0.45, side: THREE.FrontSide })));
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
              if (light) { gr.addColorStop(0, '#d8dadd'); gr.addColorStop(1, '#a6aab0'); } else { gr.addColorStop(0, '#3a3c41'); gr.addColorStop(1, '#1d1f23'); }
              g.fillStyle = gr; g.fillRect(x0 + 3, y0, tw / 2 - 6, bh);
              g.fillStyle = light ? '#eef0f2' : '#55585e'; g.fillRect(x0 + 3, y0, tw / 2 - 6, 3);
              logo(x0 + 120, y0 + bh / 2, bh * 0.36, false);
              g.fillStyle = light ? '#2a2c30' : '#f2f3f5'; g.font = `italic 900 ${Math.round(bh * 0.36)}px Arial Black, Arial, Helvetica, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
              g.fillText('ROCKET', x0 + 190, y0 + bh * 0.31, 290); g.fillText('LEAGUE', x0 + 190, y0 + bh * 0.71, 290);
              g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(x0, y0, 3, bh);
            }
            g.fillStyle = '#0a0d14'; g.fillRect(0, 0, tw, y0);
          }, true);
          const boardG = arBand((cx, cy, nx, ny) => [[1, arRw(cx, cy, nx, ny)], [1, arWB]], (s, x, y, z) => [-s / arBP, (z - RR) / (arWB - RR)], null, true);
          const boards = new THREE.Mesh(own(boardG), own(new THREE.MeshStandardMaterial({ map: boardT, emissive: 0xffffff, emissiveMap: boardT, emissiveIntensity: 0.42, roughness: 0.55, metalness: 0.2, side: THREE.FrontSide, envMap: arEnv, envMapIntensity: 0.5 })));
          boards.receiveShadow = true; scene.add(boards);

          const cin = 1 - 3 / arWR, sL = [];
          sL.push(arBand((cx, cy, nx, ny) => { const r = arRw(cx, cy, nx, ny); return [[cin, r + 1], [cin, r + 15]]; }, () => [0, 0], (x, y) => arTint(y, 1.25), true));
          sL.push(arBand([[cin, arWT + 2], [cin, arWB + 2]], () => [0, 0], (x, y) => arTint(y, 1.25), true));
          sL.push(arBand([[1 - 290 / arWR, 2.2], [1 - 272 / arWR, 2.2]], () => [0, 0], (x, y) => y < 0 ? [0.03, 0.17, 1.2] : [1.2, 0.22, 0.02], true));
          for (let s0 = 0; s0 < arPer; s0 += 340) {
            const p = arAt(s0, 2), q = arAt(s0 + 210, 2);
            if (arMouth(p[0], p[1], 60) || arMouth(q[0], q[1], 60) || Math.hypot(q[0] - p[0], q[1] - p[1]) < 170) continue;
            const c = arTint((p[1] + q[1]) / 2, 1.3);
            sL.push(arQuad([q[0], q[1], 350], [p[0], p[1], 350], [p[0], p[1], 368], [q[0], q[1], 368], null, c));
          }
          {
            const dT = tex(128, 16, (g, tw, th) => { g.clearRect(0, 0, tw, th); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(14, 2); g.lineTo(tw - 14, 2); g.arc(tw - 14, th / 2, th / 2 - 2, -Math.PI / 2, Math.PI / 2); g.lineTo(14, th - 2); g.arc(14, th / 2, th / 2 - 2, Math.PI / 2, -Math.PI / 2); g.fill(); }, true);
            const tc = (x, y) => y < 0 ? [0.03, 0.17, 1.2] : [1.2, 0.22, 0.02];
            const rl = mergeG([arBand((cx, cy, nx, ny) => { const f = arFil(cx, cy, nx, ny), l = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; return [l(f[2], f[3], 0.32), l(f[2], f[3], 0.68)]; }, (s0, x, y, z, r) => [s0 / 380, r], tc, true), arBand((cx, cy, nx, ny) => { const f = arFil(cx, cy, nx, ny), l = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; return [l(f[6], f[7], 0.35), l(f[6], f[7], 0.65)]; }, (s0, x, y, z, r) => [s0 / 520 + 0.5, r], tc, true)]);
            const rm = new THREE.Mesh(rl, arFlashable(own(new THREE.MeshBasicMaterial({ map: dT, vertexColors: true, transparent: true, alphaTest: 0.5, toneMapped: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 }))));
            scene.add(rm);
            const lgT = tex(1024, 512, (g, tw, th) => {
              const gr = g.createLinearGradient(0, 0, 0, th); gr.addColorStop(0, '#3a3e45'); gr.addColorStop(1, '#25282d'); g.fillStyle = gr; g.fillRect(0, 0, tw, th);
              g.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < tw; x += 128) g.fillRect(x, 0, 3, th);
              const cx = 250, cy = 250, r = 150;
              g.beginPath(); g.moveTo(cx - r * 0.86, cy - r * 0.8); g.lineTo(cx + r * 0.86, cy - r * 0.8); g.lineTo(cx + r * 0.8, cy + r * 0.2); g.quadraticCurveTo(cx + r * 0.5, cy + r * 0.85, cx, cy + r); g.quadraticCurveTo(cx - r * 0.5, cy + r * 0.85, cx - r * 0.8, cy + r * 0.2); g.closePath();
              g.fillStyle = '#1f63e0'; g.fill(); g.strokeStyle = '#e8ecf2'; g.lineWidth = 12; g.stroke();
              g.fillStyle = '#e8ecf2'; g.beginPath(); g.arc(cx - r * 0.3, cy - r * 0.2, r * 0.3, 0, TAU); g.fill(); g.beginPath(); g.moveTo(cx - r * 0.72, cy + r * 0.32); g.quadraticCurveTo(cx, cy - r * 0.25, cx + r * 0.76, cy - r * 0.42); g.quadraticCurveTo(cx + r * 0.2, cy + r * 0.05, cx - r * 0.38, cy + r * 0.5); g.closePath(); g.fill();
              g.font = 'italic 900 150px Arial Black, Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#e8ecf2'; g.fillText('ROCKET', 430, 175, 560); g.fillText('LEAGUE', 430, 345, 560);
            });
            const dq = [];
            for (const [dx, dy] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
              let sm = 0, bd = -9;
              for (let q = 0; q < arPer; q += 10) { const t = arAt(q); const d = t[2] * dx + t[3] * dy; if (d > bd) { bd = d; sm = q; } }
              const N = 16, pos = [], uv = [];
              for (let k = 0; k <= N; k++) { const t = arAt(sm - 640 + 1280 * k / N, 3); pos.push(t[0], t[1], arWB + 40, t[0], t[1], arWB + 680); uv.push(1 - k / N, 0, 1 - k / N, 1); }
              const g = new THREE.BufferGeometry(), ix = [];
              for (let k = 0; k < N; k++) { const q = k * 2; ix.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
              g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals(); dq.push(g);
            }
            const dm = new THREE.Mesh(mergeG(dq), own(new THREE.MeshStandardMaterial({ map: lgT, roughness: 0.6, metalness: 0.2, side: THREE.FrontSide, envMap: arEnv, envMapIntensity: 0.4 })));
            dm.receiveShadow = true; scene.add(dm);
          }
          const strips = new THREE.Mesh(mergeG(sL), arFlashable(own(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }))));
          scene.add(strips);

          const glassT = tex(256, 444, (g, tw, th) => {
            g.fillStyle = 'rgb(7,8,10)'; g.fillRect(0, 0, tw, th);
            arHex(g, tw, th, tw / (16 * Math.sqrt(3))); g.strokeStyle = 'rgba(255,255,255,.075)'; g.lineWidth = 1; g.stroke();
            arHex(g, tw, th, tw / (2 * Math.sqrt(3)));
            g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 12; g.stroke();
            g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.4; g.stroke();
          }, true);
          const gp = [[1, arWB], [1, GH], [1, 1200], [1, HT - arCeR]];
          for (let k = 1; k <= arFN; k++) { const ph = Math.PI / 2 * k / arFN; gp.push([1 - arCeR * (1 - Math.cos(ph)) / arWR, HT - arCeR + arCeR * Math.sin(ph)]); }
          const ceilP = arPath.slice(0, -1).map(([x, y, nx, ny]) => new THREE.Vector2(x + nx * (arWR - arCeR), y + ny * (arWR - arCeR))), cg = new THREE.ShapeGeometry(new THREE.Shape(ceilP));
          cg.translate(0, 0, HT);
          { const p = cg.attributes.position, uv = cg.attributes.uv, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { uv.setXY(i, p.getX(i) / arHW, p.getY(i) / arHH); const yy = p.getY(i), k = Math.min(1, Math.abs(yy) / 4000); c[i * 3] = 0.22 + (yy < 0 ? -0.17 : 0.38) * k; c[i * 3 + 1] = 0.24 + (yy < 0 ? -0.08 : 0) * k; c[i * 3 + 2] = 0.3 + (yy < 0 ? 0.3 : -0.24) * k; } cg.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
          const glassG = mergeG([arBand(gp, (s, x, y, z, r) => [s / arHW, (r < 4 ? z : HT - arCeR + (z - HT + arCeR) * 2.2) / arHH], (x, y) => { const t = arTint(y, 1); return y < 0 ? [0.055, 0.18, 0.68] : [0.68, 0.27, 0.07]; }, true), cg]);
          const glass = new THREE.Mesh(glassG, arFogAdd(arFlashable(own(new THREE.MeshBasicMaterial({ map: glassT, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true, toneMapped: false })))));
          glass.renderOrder = 2; scene.add(glass); arHeavy.push(glass);


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
          g.fillStyle = '#16181c'; g.fillRect(0, 0, tw, th);
          for (let y = 3; y < th; y += 7) for (let x = 3 + ((y / 7) & 1) * 3.5; x < tw; x += 7) { g.fillStyle = 'rgba(0,0,0,.85)'; g.beginPath(); g.arc(x, y, 2.1, 0, TAU); g.fill(); g.fillStyle = 'rgba(160,170,185,.12)'; g.fillRect(x - 2, y + 2, 4, 1); }
          g.fillStyle = 'rgba(70,76,86,.9)'; for (let x = 0; x < tw; x += 128) g.fillRect(x, 0, 8, th); g.fillRect(0, th * 0.33, tw, 6); g.fillRect(0, th * 0.66, tw, 6);
          for (let x = 64; x < tw; x += 128) for (const y of [0.17, 0.5, 0.83]) { const lg = g.createRadialGradient(x, th * y, 0, x, th * y, 22); lg.addColorStop(0, team ? 'rgba(255,220,170,1)' : 'rgba(200,235,255,1)'); lg.addColorStop(0.3, team ? 'rgba(255,140,50,.6)' : 'rgba(60,150,255,.6)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(x - 22, th * y - 22, 44, 44); }
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
          const metalM = own(new THREE.MeshStandardMaterial({ color: lin(0x8e95a2), roughness: 0.3, metalness: 0.7, side: THREE.DoubleSide, envMap: arEnv, envMapIntensity: 1 }));
          const backingM = own(new THREE.MeshBasicMaterial({ color: lin(0x23262b), transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false }));
          const netM = own(new THREE.MeshBasicMaterial({ map: netT, vertexColors: true, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
          for (const s of [-1, 1]) {
            const team = s < 0 ? 0 : 1, col = TEAMC[team], Yl = s * CFG.Y, Yb = s * GB, D = CFG.goalD, nc = arTint(s * 5000, 1.2);
            metal.push(...arFrame(44, 44, s * (CFG.Y + 46), 150, 16));
            for (const sx of [-1, 1]) metal.push(arCyl(30, [sx * (GW + 60), s * (CFG.Y + 30), GH + 30], [sx * (GW + 520), s * (CFG.Y - 30), arWB + 40], 10), arCyl(30, [sx * (GW + 520), s * (CFG.Y - 30), arWB + 40], [sx * (V2 - 40), s * (CFG.Y - 30), arWB + 40], 10));
            for (const sx of [-1, 1]) metal.push(arCyl(18, [sx * (GW + 22), s * (CFG.Y + 60), GH + 22], [sx * (GW + 22), s * (GB + 18), GH + 22], 10), arCyl(18, [sx * (GW + 22), s * (GB + 18), 0], [sx * (GW + 22), s * (GB + 18), GH + 22], 10), arCyl(14, [sx * (GW + 18), s * (CFG.Y + 60), 14], [sx * (GW + 18), s * (GB + 18), 14], 8));
            metal.push(arCyl(18, [-(GW + 22), s * (GB + 18), GH + 22], [GW + 22, s * (GB + 18), GH + 22], 10), arBox(2 * GW, 34, 26, 0, s * (GB + 17), 13));
            const nq = (a, b, c, d, ru, rv) => net.push(arQuad(a, b, c, d, [0, 0, ru, 0, ru, rv, 0, rv], nc));
            for (const sx of [-1, 1]) { const x = sx * (GW + 2); metal.push(arQuad([x, Yl + s * 60, 0], [x, Yb, 0], [x, Yb, GH], [x, Yl + s * 60, GH]), arQuad([x, Yl + s * 60, GH], [sx * (GW + 120), Yl + s * 60, GH + 20], [sx * (GW + 120), Yl + s * 60, 0], [x, Yl + s * 60, 0])); for (let k = 1; k < 4; k++) metal.push(arBox(14, 10, GH - 40, sx * (GW - 4), Yl + s * (60 + k * (D - 60) / 4), GH / 2)); const wg = new THREE.ExtrudeGeometry(new THREE.Shape([[0, 0], [34, 0], [52, GH * 0.28], [56, GH * 0.62], [44, GH * 0.86], [18, GH - 6], [0, GH - 6]].map(([u, v]) => new THREE.Vector2(u, v))), { depth: 300, bevelEnabled: true, bevelThickness: 8, bevelSize: 6, bevelSegments: 2, curveSegments: 4 }); wg.applyMatrix4(new THREE.Matrix4().set(-sx, 0, 0, sx * GW, 0, 0, s, Yl + s * 120, 0, 1, 0, 0, 0, 0, 0, 1)); metal.push(wg); }
            nq([-GW, Yl, GH], [GW, Yl, GH], [GW, Yb, GH], [-GW, Yb, GH], 2 * GW / 104, D / 180);
            const stripM = own(new THREE.MeshBasicMaterial({ color: lin(col, 1.7), toneMapped: false }));
            const sg = [
              ...arFrame(11, 44, s * (CFG.Y + 3), 150, 8), ...[-1, 1].flatMap(sx => [arCyl(9, [sx * (GW + 60), s * (CFG.Y + 2), GH + 30], [sx * (GW + 520), s * (CFG.Y - 58), arWB + 40], 6), arCyl(9, [sx * (GW + 520), s * (CFG.Y - 58), arWB + 40], [sx * (V2 - 40), s * (CFG.Y - 58), arWB + 40], 6)]), ...arFrame(8, 92, s * (CFG.Y + 46), 150, 6), ...arFrame(6, 44, s * (CFG.Y + 92), 150, 6),
              arBox(2 * GW - 60, 26, 6, 0, s * (CFG.Y + 300), GH + 4), arBox(2 * GW - 60, 26, 6, 0, s * (CFG.Y + 620), GH + 4),
              arBox(18, 6, GH - 60, -(GW - 40), s * (GB - 6), GH / 2), arBox(18, 6, GH - 60, GW - 40, s * (GB - 6), GH / 2), arBox(2 * GW - 98, 6, 14, 0, s * (GB - 6), GH - 26),
              GX(new THREE.PlaneGeometry(2 * GW, 26), 0, s * (CFG.Y + 22), 1.2), ...[-1, 1].flatMap(sx => [GW + 44, GW - 230].map(x => GX(new THREE.CylinderGeometry(34, 34, 70, 12), sx * x, s * (CFG.Y + 50), GH + 128, Math.PI / 2)))
            ];
            const strip = new THREE.Mesh(mergeG(sg), stripM); scene.add(strip);
            const backM = own(new THREE.MeshStandardMaterial({ map: arBackT(team), emissive: 0xffffff, emissiveMap: null, roughness: 0.6, metalness: 0.2 }));
            backM.emissiveMap = backM.map; backM.emissiveIntensity = 0.9;
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
        {
          const penT = team => tex(256, 512, (g, tw, th) => {
            g.clearRect(0, 0, tw, th);
            const c = TEAMCSS[team], lt = team ? '#ffc890' : '#a8d2ff', dk = team ? '#8a3006' : '#0d3a9a', q = 128;
            g.fillStyle = '#b8bcc4'; g.fillRect(8, 16, 6, th - 16);
            g.beginPath(); g.moveTo(14, 26); g.quadraticCurveTo(q * 0.7, 2, q - 6, 30); g.quadraticCurveTo(q - 30, th * 0.36, q - 12, th * 0.74); g.lineTo(14, th * 0.74); g.closePath();
            const gr = g.createLinearGradient(0, 0, q, 0); gr.addColorStop(0, dk); gr.addColorStop(0.5, c); gr.addColorStop(1, lt); g.fillStyle = gr; g.fill();
            g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2.5; g.stroke();
            g.save(); g.translate(q * 0.5, th * 0.27); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-26, -24); g.lineTo(26, -24); g.lineTo(24, 6); g.quadraticCurveTo(14, 24, 0, 30); g.quadraticCurveTo(-14, 24, -24, 6); g.closePath(); g.stroke();
            g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(-8, -6, 8, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-20, 10); g.quadraticCurveTo(0, -6, 22, -12); g.quadraticCurveTo(6, 2, -10, 16); g.closePath(); g.fill(); g.restore();
            g.fillStyle = '#e8eaee'; for (let y = th * 0.5; y < th * 0.72; y += 22) { g.beginPath(); g.moveTo(16, y); g.lineTo(q * 0.5, y + 12); g.lineTo(q - 16, y); g.lineTo(q - 16, y + 7); g.lineTo(q * 0.5, y + 19); g.lineTo(16, y + 7); g.closePath(); g.fill(); }
            g.fillStyle = '#0f131a'; g.fillRect(q + 6, 6, q - 12, q - 12); g.strokeStyle = 'rgba(200,210,225,.45)'; g.lineWidth = 3; g.strokeRect(q + 6, 6, q - 12, q - 12);
            const d = team ? -1 : 1, cx = q * 1.5, cy = q / 2;
            g.fillStyle = '#f4f5f7'; g.beginPath(); g.moveTo(cx - d * 22, cy - 34); g.lineTo(cx + d * 22, cy); g.lineTo(cx - d * 22, cy + 34); g.lineTo(cx - d * 36, cy + 34); g.lineTo(cx + d * 6, cy); g.lineTo(cx - d * 36, cy - 34); g.closePath(); g.fill();
            g.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 12; y < q - 12; y += 6) for (let x = q + 12; x < 2 * q - 12; x += 6) g.fillRect(x, y, 3, 3);
            const bg = g.createLinearGradient(0, 140, 0, th); bg.addColorStop(0, lt); bg.addColorStop(0.5, c); bg.addColorStop(1, dk); g.fillStyle = bg; g.fillRect(q + 8, 140, q - 16, th - 150); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.strokeRect(q + 10, 142, q - 20, th - 154);
            g.save(); g.translate(q * 1.5, 250); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(-32, -30); g.lineTo(32, -30); g.lineTo(30, 8); g.quadraticCurveTo(18, 30, 0, 38); g.quadraticCurveTo(-18, 30, -30, 8); g.closePath(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-10, -8, 9, 0, TAU); g.fill(); g.restore();
            g.fillStyle = '#fff'; g.font = 'italic 900 26px Arial Black, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('ROCKET', q * 1.5, 330, q - 24); g.fillText('LEAGUE', q * 1.5, 360, q - 24);
          });
          const tw = [];
          for (const s of [-1, 1]) {
            const team = s < 0 ? 0 : 1, q = [], y = s * (CFG.Y + 300), w = 250, hh = 950, z0 = 660;
            for (const x of [-3500, -2700, -1900, 1900, 2700, 3500]) {
              const xl = x - s * w / 2, xr = x + s * w / 2, sx = x - Math.sign(x) * 290, sl = sx - s * 110, sr = sx + s * 110;
              q.push(arQuad([xl, y, z0], [xr, y, z0], [xr, y, z0 + hh], [xl, y, z0 + hh], [0, 0, 0.5, 0, 0.5, 1, 0, 1]));
              q.push(arQuad([sl, y + s * 10, 900], [sr, y + s * 10, 900], [sr, y + s * 10, 1100], [sl, y + s * 10, 1100], [0.5, 0.75, 1, 0.75, 1, 1, 0.5, 1]));
            }
            for (const x of [-1360, 1360]) {
              const yy = y - s * 60, xl = x - s * 150, xr = x + s * 150;
              q.push(arQuad([xl, yy, 900], [xr, yy, 900], [xr, yy, 1700], [xl, yy, 1700], [0.53, 0.02, 0.97, 0.02, 0.97, 0.72, 0.53, 0.72]));
              for (const [dx, dy] of [[-110, -60], [110, -60], [-110, 60], [110, 60]]) tw.push(arCyl(13, [x + dx, y + dy, 0], [x + dx, y + dy, 2100], 5));
              for (let z = 300; z < 2100; z += 300) for (const [ax, ay, bx, by] of [[-110, -60, 110, -60], [-110, 60, 110, 60], [-110, -60, -110, 60], [110, -60, 110, 60]]) tw.push(arCyl(7, [x + ax, y + ay, z], [x + bx, y + by, z + 150], 4));
            }
            const m = new THREE.Mesh(mergeG(q), own(new THREE.MeshBasicMaterial({ map: penT(team), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: lin(0xffffff, 0.6) })));
            scene.add(m);
          }
          const twm = new THREE.Mesh(mergeG(tw), own(new THREE.MeshStandardMaterial({ color: lin(0x8a8e96), roughness: 0.5, metalness: 0.6, envMap: arEnv, envMapIntensity: 0.6 }))); scene.add(twm);
        }
        const arOct = (ex, ey, ec) => [[ex, -(ec - ex)], [ex, ec - ex], [ec - ey, ey], [-(ec - ey), ey], [-ex, ec - ex], [-ex, -(ec - ex)], [-(ec - ey), -ey], [ec - ey, -ey]];
        const arCrowdT = (bias, cheer) => tex(512, 256, (g, tw, th) => {
          const R = rngOf(31 + bias);
          const pal = bias === 1 ? ['#2f7bff', '#5aa0ff', '#1d4fc4', '#2a5fd8', '#3f8cff', '#c8d8f0'] : bias === 2 ? ['#ff7a1a', '#ffa14d', '#e2560a', '#d8601a', '#ff8a2a', '#f0dcc8'] : null;
          const mix = ['#3f8cff', '#ff8a2a', '#f0dcc0', '#ffd24a', '#5bd18a', '#ff5d7a', '#a07bff', '#e84a4a', '#7ad0ff', '#ff7a1a', '#e8e8e8', '#9a6bd8'];
          const skin = ['#f2c9a0', '#d9a273', '#a96f45', '#7a4a2b', '#f6d7b8', '#e0b48c'];
          for (let r = 0; r < 16; r++) {
            const y0 = r * 16;
            g.fillStyle = r % 2 ? '#4a4a4c' : '#403f41'; g.fillRect(0, y0, tw, 16);
            g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y0 + 13, tw, 3);
            for (let x = 4 + (r & 1) * 4; x < tw; x += 8) {
              const c1 = R(), c2 = R(), c3 = R(), c4 = R(), c5 = R(), c6 = R(), c7 = R();
              if (x % 128 < 10 || c7 < 0.04) continue;
              const col = pal && c1 < 0.5 ? pal[Math.floor(c2 * pal.length)] : mix[Math.floor(c2 * mix.length)];
              const up = cheer ? 1 + c6 * 3 : 0, jx = x + c4 * 1.6 - 0.8, jy = y0 + 8 + c5 * 1.2 - up, r = 3.6 + c3 * 0.5;
              const sg = g.createRadialGradient(jx - r * 0.35, jy - r * 0.4, 0.3, jx, jy, r); sg.addColorStop(0, 'rgba(255,255,255,.9)'); sg.addColorStop(0.3, col); sg.addColorStop(0.8, col); sg.addColorStop(1, 'rgba(0,0,0,.5)');
              g.fillStyle = sg; g.beginPath(); g.arc(jx, jy, r, 0, TAU); g.fill();
              if (cheer && c6 > 0.9) { g.fillStyle = pal ? pal[Math.floor(c1 * 3)] : mix[Math.floor(c1 * 4)]; g.fillRect(jx - 6, jy - 12, 12, 5); }
            }
          }
          g.globalCompositeOperation = 'saturation'; g.fillStyle = 'rgba(128,128,128,.2)'; g.fillRect(0, 0, tw, th); g.globalCompositeOperation = 'source-over';
          for (let x = 0; x < tw; x += 128) {
            g.fillStyle = '#151a26'; g.fillRect(x, 0, 10, th);
            g.fillStyle = 'rgba(200,215,240,.2)'; for (let y = 0; y < th; y += 4) g.fillRect(x + 1, y, 8, 1);
          }
        }, true);
        const arLedT = tex(1024, 64, (g, tw, th) => {
          const pw = tw / 4;
          for (let i = 0; i < 4; i++) {
            const lt = i % 2 === 0, x0 = i * pw;
            g.fillStyle = lt ? '#e6e8ea' : '#1c1d20'; g.fillRect(x0, 0, pw, th);
            g.fillStyle = lt ? '#c2c6cc' : '#2c2e33'; g.fillRect(x0, th - 6, pw, 6);
            const cx = x0 + 52, cy = th / 2, r = 22;
            g.beginPath(); g.moveTo(cx - r * 0.86, cy - r * 0.8); g.lineTo(cx + r * 0.86, cy - r * 0.8); g.lineTo(cx + r * 0.8, cy + r * 0.2); g.quadraticCurveTo(cx + r * 0.5, cy + r * 0.85, cx, cy + r); g.quadraticCurveTo(cx - r * 0.5, cy + r * 0.85, cx - r * 0.8, cy + r * 0.2); g.closePath(); g.fillStyle = '#1f63e0'; g.fill();
            g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - r * 0.7, cy + r * 0.3); g.quadraticCurveTo(cx, cy - r * 0.25, cx + r * 0.76, cy - r * 0.42); g.quadraticCurveTo(cx + r * 0.2, cy + r * 0.05, cx - r * 0.38, cy + r * 0.5); g.closePath(); g.fill();
            g.font = 'italic 900 22px Arial Black, Arial, Helvetica, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = lt ? '#26282c' : '#f2f3f5';
            g.fillText('ROCKET', x0 + 86, th * 0.32, pw - 100); g.fillText('LEAGUE', x0 + 86, th * 0.7, pw - 100);
            g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x0, 0, 2, th);
          }
        }, true);
        const flashMs = [], arCrowd = [];
        const arLampM = own(new THREE.MeshBasicMaterial({ color: lin(0xffeccc, 0.9), toneMapped: false, side: THREE.DoubleSide }));
        const arStruct = [], arLamp = [], arGlowQ = [], arTree = [], arScrQ = [];
        {
          const T1i = arOct(4700, 6300, 9300), T1o = arOct(7200, 8600, 13600), T2i = arOct(6850, 8250, 13250), T2o = arOct(10300, 11800, 19600), RFi = arOct(8600, 10100, 16600);
          const CT = [0, 1, 2].map(b => [arCrowdT(b, false), arCrowdT(b, true)]);
          const standM = CT.map(t => own(new THREE.MeshLambertMaterial({ map: t[0], vertexColors: true, side: THREE.DoubleSide })));
          CT.forEach((t, k) => arCrowd.push({ m: standM[k], t, ph: k * 1.7, on: false }));
          const concM = own(new THREE.MeshLambertMaterial({ color: lin(0x8f96a2), side: THREE.DoubleSide }));
          const roofM = own(new THREE.MeshLambertMaterial({ color: lin(0x7a756c), side: THREE.DoubleSide }));
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
          crowd(T1i, T1o, 260, 2050, all, 0.5, 0.38);
          crowd(T2i, T2o, 2600, 5000, main, 0.34, 0.25);
          const lip = (A, B, za, zb, edges, v) => { for (const i of edges) { const P = j => [A[j][0] + (B[j][0] - A[j][0]) * v, A[j][1] + (B[j][1] - A[j][1]) * v, za + (zb - za) * v], p = P(i), q = P((i + 1) % 8), ru = Math.max(1, Math.round(L(p, q) / 2600)); led.push(arQuad([q[0], q[1], p[2] - 40], [p[0], p[1], p[2] - 40], [p[0], p[1], p[2] + 170], [q[0], q[1], q[2] + 170], [0, 0, ru, 0, ru, 1, 0, 1])); const d = 180, P2 = j => [P(j)[0] * (1 - d / L([0, 0], P(j))), P(j)[1] * (1 - d / L([0, 0], P(j)))]; const p2 = P2(i), q2 = P2((i + 1) % 8); conc.push(arQuad([p2[0], p2[1], p[2] + 170], [q2[0], q2[1], p[2] + 170], [q[0], q[1], p[2] + 170], [p[0], p[1], p[2] + 170]), arQuad([p2[0], p2[1], p[2] - 40], [q2[0], q2[1], p[2] - 40], [q2[0], q2[1], p[2] + 170], [p2[0], p2[1], p[2] + 170])); } };
          lip(T1i, T1o, 260, 2050, all, 0.5); lip(T2i, T2o, 2600, 5000, main, 0.5);
          {
            const sp = [], RS = rngOf(61);
            const rows = (A, B, za, zb, edges, nr) => { for (const i of edges) for (let r = 1; r < nr; r++) { if (r === nr >> 1) continue; const v = r / nr, P = j => [A[j][0] + (B[j][0] - A[j][0]) * v, A[j][1] + (B[j][1] - A[j][1]) * v], p = P(i), q = P((i + 1) % 8), n = Math.floor(L(p, q) / 260); for (let k = 0; k < n; k++) { if (RS() < 0.25) continue; const t = (k + 0.5) / n; sp.push(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, za + (zb - za) * v + 70); } } };
            rows(T1i, T1o, 260, 2050, all, 9); rows(T2i, T2o, 2600, 5000, main, 10);
            const sg = own(new THREE.BufferGeometry()); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
            const spt = new THREE.Points(sg, own(new THREE.PointsMaterial({ size: 150, map: glowT, color: 0xffe2b0, transparent: true, opacity: 1, fog: false, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
            spt.renderOrder = 3; scene.add(spt); arHeavy.push(spt);
          }
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
          for (const i of main) {
            const A = RFi[i], B = RFi[(i + 1) % 8], Ln = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.floor(Ln / 260);
            for (let k = 1; k < n; k++) {
              const t = k / n, x = (A[0] + (B[0] - A[0]) * t) * 0.975, y = (A[1] + (B[1] - A[1]) * t) * 0.975;
              arLamp.push(place(new THREE.BoxGeometry(105, 60, 24), x, y, 6610, 0, 0, 0));
              if (k % 4 === 2) arGlowQ.push(place(new THREE.PlaneGeometry(1100, 1100), x * 0.99, y * 0.99, 6600, 0, 0, 0));
            }
          }
          for (const s of [1, -1]) {
            const px = s * 7400, py = s * 8800;
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
            arStruct.push(place(new THREE.BoxGeometry(3200, 1900, 160), px, py, 5600, 0, 0, 4200));
            const ux = py / Math.hypot(px, py), uy = -px / Math.hypot(px, py);
            for (const k of [-1, 1]) arStruct.push(arBox(200, 200, 4700, px + ux * k * 1100, py + uy * k * 1100, 2350));
            arScrQ.push(place(new THREE.PlaneGeometry(3000, 1700).translate(0, 0, 90), px, py, 5600, 0, 0, 4200));
          }
          const arFlagQ = [];
          const arFlagT = tex(256, 256, (g, tw) => {
            const F = [['v', '#1f4fc0', '#ffffff', '#d81e2a'], ['h', '#000000', '#dd0000', '#ffce00'], ['v', '#009246', '#ffffff', '#ce2b37'], ['h', '#ffffff', '#1c3faa', '#d52b1e'], ['c', '#c60c30', '#ffffff'], ['h', '#aa151b', '#f1bf00', '#aa151b'], ['d', '#ffffff', '#bc002d'], ['v', '#169b62', '#ffffff', '#ff883e'], ['c', '#006aa7', '#fecc00'], ['h', '#21468b', '#ffffff', '#ae1c28'], ['v', '#000000', '#fdda24', '#ef3340'], ['d', '#009c3b', '#ffdf00'], ['h', '#ffffff', '#ffffff', '#d52b1e'], ['c', '#ba0c2f', '#00205b'], ['v', '#0055a4', '#ffffff', '#ef4135'], ['h', '#ff9933', '#ffffff', '#138808']];
            const q = tw / 4;
            F.forEach((f, k) => {
              const x = (k % 4) * q, y = Math.floor(k / 4) * q, m = 3, w = q - 2 * m, hh = q - 2 * m;
              g.save(); g.translate(x + m, y + m);
              if (f[0] === 'v') for (let i = 0; i < 3; i++) { g.fillStyle = f[1 + i]; g.fillRect(i * w / 3, 0, w / 3 + 1, hh); }
              else if (f[0] === 'h') for (let i = 0; i < 3; i++) { g.fillStyle = f[1 + i]; g.fillRect(0, i * hh / 3, w, hh / 3 + 1); }
              else if (f[0] === 'c') { g.fillStyle = f[1]; g.fillRect(0, 0, w, hh); g.fillStyle = f[2]; g.fillRect(w * 0.3, 0, w * 0.14, hh); g.fillRect(0, hh * 0.43, w, hh * 0.14); }
              else { g.fillStyle = f[1]; g.fillRect(0, 0, w, hh); g.fillStyle = f[2]; g.beginPath(); g.arc(w / 2, hh / 2, hh * 0.24, 0, TAU); g.fill(); }
              g.restore();
            });
          });
          const flag = (x, y, z, dx, dy, k) => {
            const w = 210, h = 140, ux = dx * w / 2, uy = dy * w / 2, u0 = (k % 4) / 4, v0 = 1 - Math.floor(k / 4) / 4, e = 0.012;
            arFlagQ.push(arQuad([x - ux, y - uy, z], [x + ux, y + uy, z], [x + ux, y + uy, z - h], [x - ux, y - uy, z - h], [u0 + e, v0 - e, u0 + 0.25 - e, v0 - e, u0 + 0.25 - e, v0 - 0.25 + e, u0 + e, v0 - 0.25 + e]));
          };
          const FR = rngOf(41);
          for (const sd of [1, -1]) {
            const A = [-7300 * sd, -8800, 6900], B = [7300 * sd, 8800, 6900], N = 30, P = (t, dz) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, 6900 + 4700 * Math.sin(Math.PI * t) + dz];
            for (let k = 0; k < N; k++) {
              const t0 = k / N, t1 = (k + 1) / N;
              arStruct.push(arCyl(80, P(t0, 0), P(t1, 0), 6), arCyl(70, P(t0, -480), P(t1, -480), 6), arCyl(34, P(t0, k & 1 ? 0 : -480), P(t1, k & 1 ? -480 : 0), 5));
            }
            const L2 = Math.hypot(B[0] - A[0], B[1] - A[1]), dx = (B[0] - A[0]) / L2, dy = (B[1] - A[1]) / L2;
            for (let t = 0.04; t < 0.97; t += 0.017) { const p = P(t, -520); flag(p[0], p[1], p[2], dx, dy, Math.floor(FR() * 16)); }
          }
          for (const i of main) {
            const a = RFi[i], b = RFi[(i + 1) % 8], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / L2, dy = (b[1] - a[1]) / L2;
            for (let d = 250; d < L2 - 200; d += 330) flag((a[0] + dx * d) * 0.985, (a[1] + dy * d) * 0.985, 6560, dx, dy, Math.floor(FR() * 16));
          }
          { const fm = new THREE.Mesh(mergeG(arFlagQ), own(new THREE.MeshBasicMaterial({ map: arFlagT, color: lin(0xd8cfc4), side: THREE.DoubleSide }))); scene.add(fm); }
          const structM = own(new THREE.MeshStandardMaterial({ color: lin(0x6c7380), roughness: 0.6, metalness: 0.45, envMap: arEnv, envMapIntensity: 0.6 }));
          scene.add(new THREE.Mesh(mergeG(arStruct), structM), new THREE.Mesh(mergeG(arLamp), arLampM));
          scene.add(new THREE.Mesh(mergeG(arTree), own(new THREE.MeshLambertMaterial({ vertexColors: true }))));
          const gq = new THREE.Mesh(mergeG(arGlowQ), own(new THREE.MeshBasicMaterial({ map: glowT, color: 0xffd8a8, opacity: 0.55, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide })));
          gq.renderOrder = 5; scene.add(gq); arHeavy.push(gq);
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
            g.fillStyle = '#05070b'; g.fillRect(0, 0, tw, th); g.fillStyle = '#c0281e'; g.fillRect(0, 0, tw, 8); g.fillRect(0, th - 8, tw, 8);
            const cx = 130, cy = 104, r = 70;
            g.beginPath(); g.moveTo(cx - r * 0.86, cy - r * 0.8); g.lineTo(cx + r * 0.86, cy - r * 0.8); g.lineTo(cx + r * 0.8, cy + r * 0.2); g.quadraticCurveTo(cx + r * 0.5, cy + r * 0.85, cx, cy + r); g.quadraticCurveTo(cx - r * 0.5, cy + r * 0.85, cx - r * 0.8, cy + r * 0.2); g.closePath();
            g.fillStyle = '#1f63e0'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 7; g.stroke();
            g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - r * 0.3, cy - r * 0.2, r * 0.3, 0, TAU); g.fill(); g.beginPath(); g.moveTo(cx - r * 0.72, cy + r * 0.32); g.quadraticCurveTo(cx, cy - r * 0.25, cx + r * 0.76, cy - r * 0.42); g.quadraticCurveTo(cx + r * 0.2, cy + r * 0.05, cx - r * 0.38, cy + r * 0.5); g.closePath(); g.fill();
            g.textAlign = 'left'; g.font = 'italic 900 62px Arial Black, Arial, sans-serif'; g.fillStyle = '#fff'; g.fillText('ROCKET', 222, 74, 270); g.fillText('LEAGUE', 222, 140, 270);
            g.textAlign = 'center'; g.font = '900 34px Arial, sans-serif'; g.fillStyle = '#5aa0ff'; g.fillText(String(s0), tw / 2 - 120, 214); g.fillStyle = '#fff'; g.fillText(clk, tw / 2, 214); g.fillStyle = '#ff9a3a'; g.fillText(String(s1), tw / 2 + 120, 214);
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
          const k = arFl.t / 1.3, hit = arGoal[1 - arFl.team];
          if (k >= 1) {
            arFl.t = -1; arFU.arFK.value = 0;
            for (const G of arGoal) { G.stripM.color.copy(G.col); G.backM.emissiveIntensity = 0.9; G.backM.emissive.setRGB(1, 1, 1); G.curM.opacity = 0.32; G.curM.color.copy(G.lc).convertSRGBToLinear(); G.light.intensity = 1.5; G.light.color.copy(G.lc); }
            return;
          }
          const fade = Math.exp(-arFl.t * 3.2) * (1 - k), p = (0.65 + 0.35 * Math.cos(arFl.t * 18)) * fade;
          arFU.arFC.value.copy(arFl.c); arFU.arFK.value = 0.5 * p;
          hit.stripM.color.copy(arFl.c).multiplyScalar(1.7 + 3 * p); hit.backM.emissive.copy(arFl.c).multiplyScalar(0.4).addScalar(0.6); hit.backM.emissiveIntensity = 0.9 + 1.6 * p;
          hit.curM.color.copy(arFl.c); hit.curM.opacity = 0.32 + 0.6 * p; hit.light.color.set(TEAMC[arFl.team]); hit.light.intensity = 1.5 + 6 * p;
        };

        const padVis = [];
        const arSwT = tex(128, 128, (g, tw) => {
          g.fillStyle = '#fff'; g.fillRect(0, 0, tw, tw); g.translate(64, 64);
          const gr = g.createRadialGradient(0, 0, 0, 0, 0, 64); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#fff2c0'); gr.addColorStop(0.75, '#e0a050'); gr.addColorStop(0.97, '#b86a20'); gr.addColorStop(1, '#ffffff');
          g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 63, 0, TAU); g.fill();
          g.lineCap = 'round';
          for (let k = 0; k < 3; k++) { g.beginPath(); for (let j = 0; j <= 40; j++) { const f = j / 40, a = k * TAU / 3 + f * 4.2, r = 8 + f * 52; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.strokeStyle = 'rgba(255,255,230,.55)'; g.lineWidth = 5; g.stroke(); g.strokeStyle = 'rgba(150,70,10,.35)'; g.lineWidth = 2; g.stroke(); }
          for (const r of [22, 40, 54]) { g.beginPath(); g.arc(0, 0, r, 0, TAU); g.strokeStyle = 'rgba(160,80,10,.28)'; g.lineWidth = 2; g.stroke(); }
        });
        arSwT.center.set(0.5, 0.5);
        const arPadU = { t: { value: 0 } };
        const arGN = 'float arh2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat arn2(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(arh2(i), arh2(i + vec2(1.0, 0.0)), f.x), mix(arh2(i + vec2(0.0, 1.0)), arh2(i + vec2(1.0, 1.0)), f.x), f.y); }\n';
        const arPadM = {
          base: own(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.5, envMap: arEnv, envMapIntensity: 0.7 })),
          glow: own(new THREE.MeshBasicMaterial({ map: arSwT, vertexColors: true, toneMapped: false })),
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
        const arPadC = { core: [1.6, 0.86, 0.26], ring: [1.25, 0.44, 0.05], slot: [1.45, 0.62, 0.1], lobe: [1.1, 0.58, 0.1], bar: [1.5, 0.7, 0.14], fill: [0.9, 0.38, 0.05], off: [0.07, 0.06, 0.055], dS: [0.5, 0.2, 0.03], dB: [0.7, 0.28, 0.04], on: [1, 1, 1] };
        const arPad = { hm: [], key: '', base: null, glow: null, dec: null, fl: null, orbs: null, gc: null, dc: null, fc: null };
        const arShp = pts => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
        const arExt = (pts, d, bv) => new THREE.ExtrudeGeometry(arShp(pts), { depth: d, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 1, curveSegments: 4 }).translate(0, 0, bv);
        const arY = (Lr, w) => { const o = [], rv = w / Math.sin(Math.PI / 3); for (let k = 0; k < 3; k++) { const a = k * TAU / 3, ux = Math.cos(a), uy = Math.sin(a); o.push([Math.cos(a - Math.PI / 3) * rv, Math.sin(a - Math.PI / 3) * rv]); for (let j = 0; j <= 8; j++) { const f = -Math.PI / 2 + Math.PI * j / 8, d = Lr - w; o.push([ux * d + (ux * Math.cos(f) - uy * Math.sin(f)) * w, uy * d + (uy * Math.cos(f) + ux * Math.sin(f)) * w]); } } return o; };
        const arTri = (Rt, r) => { const o = []; for (let k = 0; k < 3; k++) { const a = k * TAU / 3, cx = Math.cos(a) * (Rt - 2 * r), cy = Math.sin(a) * (Rt - 2 * r); for (let j = 0; j <= 6; j++) { const b = a - Math.PI / 3 + j / 6 * TAU / 3; o.push([cx + Math.cos(b) * r, cy + Math.sin(b) * r]); } } return o; };
        const arUV0 = g => { const u = g.attributes.uv; if (u) for (let i = 0; i < u.count; i++) u.setXY(i, 0.02, 0.02); return g; };
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
              const pv = { pk: 0, big: pd.big, on: null, n: -1, bars: [], g0: gv, g1: 0, d0: dv, d1: 0, f0: fv, f1: 0, cols: null, orb: -1, halo: null, k: 1 };
              const rot = pd.big ? Math.atan2(pd.y, pd.x) + Math.PI / 3 : 0, cr = Math.cos(rot), sr = Math.sin(rot);
              const T = g => g.rotateZ(rot).translate(pd.x, pd.y, 0), TP = ([x, y]) => [pd.x + x * cr - y * sr, pd.y + x * sr + y * cr];
              const parts = [], fls = [];
              if (pd.big) {
                bl.push(arCol(T(arExt(arTri(178, 52), 4, 3)), [0.3, 0.235, 0.14]), arCol(T(arExt(arTri(160, 44), 7, 2)), [0.05, 0.05, 0.056]), arCol(T(arExt(arY(150, 38), 4.5, 2)), [0.12, 0.125, 0.135]), arCol(T(arExt(arArc(0, 0, 60, 0, TAU, 32), 6, 1.5)), [0.36, 0.3, 0.2]));
                parts.push([arUV0(GX(new THREE.RingGeometry(44, 52, 36), 0, 0, 9.8)), 'ring'], [GX(new THREE.CircleGeometry(42, 28), 0, 0, 10), 'core']);
                for (let k = 0; k < 3; k++) {
                  const a = k * TAU / 3, ca = Math.cos(a), sa = Math.sin(a);
                  for (let j = 0; j < 4; j++) parts.push([arUV0(arBox(16, 44, 2, ca * (72 + j * 19), sa * (72 + j * 19), 8.4, a)), 'bar', j]);
                  fls.push(arCurt([-18, -6, 6, 18].map(q => TP([ca * 138 - sa * q, sa * 138 + ca * q])), 12, 60, arPadC.on));
                }
                fls.push(arCurt(arArc(0, 0, 44, 0, TAU, 14).map(TP), 16, 75, arPadC.on));
              } else {
                const lb = [[-47, -20], [-47, 20], [47, -20], [47, 20]], hx = arArc(0, 0, 42, Math.PI / 6, Math.PI / 6 + TAU, 6).map(([x, y]) => [x * 1.12, y * 0.92]);
                bl.push(arCol(T(arExt(hx, 3, 2)), [0.36, 0.27, 0.13]), arCol(T(arExt(arArc(0, 0, 33, 0, TAU, 28), 5, 1.5)), [0.3, 0.22, 0.1]), ...lb.map(([x, y]) => arCol(T(arExt(arArc(x, y, 17, Math.PI / 6, Math.PI / 6 + TAU, 6), 4, 2)), [0.36, 0.27, 0.13])));
                parts.push([GX(new THREE.CircleGeometry(27, 24), 0, 0, 8.6), 'core'], [arUV0(GX(new THREE.RingGeometry(28, 32, 28), 0, 0, 8.5)), 'ring'], ...lb.map(([x, y]) => [arUV0(GX(new THREE.CircleGeometry(11.5, 6), x, y, 8.4)), 'lobe']));
                fls.push(arCurt(arArc(0, 0, 30, 0, TAU, 16).map(TP), 8, 20, arPadC.on));
              }
              const cols = [];
              for (const [g, kind, sg] of parts) { const n = arCol(T(g), arPadC[kind]); gl.push(n); if (kind === 'bar') pv.bars.push([gv, gv + n.attributes.position.count, sg]); gv += n.attributes.position.count; const c = arPadC[kind]; for (let q = 0; q < n.attributes.position.count; q++) cols.push(c[0], c[1], c[2]); }
              pv.g1 = gv; pv.cols = new Float32Array(cols);
              for (const g of fls) { const n = g.toNonIndexed(); g.dispose(); fl.push(n); fv += n.attributes.position.count; }
              pv.f1 = fv;
              const ds = pd.big ? 460 : 190;
              dl.push(arQuad([pd.x - ds / 2, pd.y - ds / 2, 1.5], [pd.x + ds / 2, pd.y - ds / 2, 1.5], [pd.x + ds / 2, pd.y + ds / 2, 1.5], [pd.x - ds / 2, pd.y + ds / 2, 1.5], null, pd.big ? arPadC.dB : arPadC.dS).toNonIndexed());
              dv += 6; pv.d1 = dv;
              if (pd.big) {
                pv.orb = bi++;
                pv.halo = new THREE.Sprite(arPad.hm[pv.orb] || (arPad.hm[pv.orb] = own(arPadM.halo.clone()))); pv.halo.scale.set(380, 380, 1); pv.halo.position.set(pd.x, pd.y, 100); pv.halo.renderOrder = 4; scene.add(pv.halo);
              }
              padVis.push(pv);
            }
            arPad.base = new THREE.Mesh(mergeG(bl), arPadM.base); arPad.base.receiveShadow = true;
            arPad.glow = new THREE.Mesh(mergeG(gl), arPadM.glow);
            arPad.dec = new THREE.Mesh(mergeG(dl), arPadM.dec); arPad.dec.renderOrder = 1;
            arPad.fl = new THREE.Mesh(mergeG(fl), arPadM.flame); arPad.fl.renderOrder = 6;
            arPad.gc = arPad.glow.geometry.attributes.color; arPad.dc = arPad.dec.geometry.attributes.color; arPad.fc = arPad.fl.geometry.attributes.color;
            arPad.orbs = new THREE.InstancedMesh(arPad.orbG || (arPad.orbG = own(new THREE.IcosahedronGeometry(40, 3))), arPadM.orb, Math.max(1, nb));
            arPad.orbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); arPad.orbs.frustumCulled = false;
            scene.add(arPad.base, arPad.glow, arPad.dec, arPad.fl, arPad.orbs);
          }
          for (const pv of padVis) pv.on = null;
        };
        const arM4 = new THREE.Matrix4(), arQ4 = new THREE.Quaternion(), arV3 = new THREE.Vector3(), arS3 = new THREE.Vector3(), arEu = new THREE.Euler();
        let arPadLT = 0;
        const arPadTick = (dt, t) => {
          if (!arPad.glow) return;
          const arNow = performance.now() / 1000, rd = Math.min(0.1, Math.max(0, arNow - (arPadLT || arNow))); arPadLT = arNow;
          arPadU.t.value = t % 1000;
          arSwT.rotation = -t * 1.6; arPadM.glow.color.setScalar(0.9 + 0.1 * Math.sin(t * 3.4));
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
              if (pv.big) pv.n = -1;
              if (!on && pv.on !== null) pv.pk = 1;
            }
            if (pv.big && !on) {
              const n = Math.floor(clamp(1 - pd.t / (pd.cd || 10), 0, 1) * 5);
              if (n !== pv.n) { pv.n = n; dirty = true; const ga = arPad.gc.array, fc = arPadC.fill, oc = arPadC.off; for (const [a0, a1, sg] of pv.bars) { const c = sg < n ? fc : oc; for (let q = a0; q < a1; q++) { ga[q * 3] = c[0]; ga[q * 3 + 1] = c[1]; ga[q * 3 + 2] = c[2]; } } }
            }
            if (pv.pk > 0) {
              pv.pk = Math.max(0, pv.pk - rd * 3.2); dirty = true;
              const da = arPad.dc.array, dc = pv.big ? arPadC.dB : arPadC.dS, f = pv.pk * pv.pk * 5;
              for (let q = pv.d0; q < pv.d1; q++) { da[q * 3] = dc[0] * f; da[q * 3 + 1] = dc[1] * f; da[q * 3 + 2] = dc[2] * f; }
            }
            if (pv.big) {
              pv.halo.visible = on || pv.pk > 0;
              if (!on && pv.pk > 0) { pv.halo.material.opacity = pv.pk * 0.9; const hs = 380 + (1 - pv.pk) * 520; pv.halo.scale.set(hs, hs, 1); }
              if (on) {
                pv.k = Math.min(1, pv.k + dt * 4);
                const z = 100 + Math.sin(t * 2.2 + i) * 6, sc = pv.k * (0.97 + 0.03 * Math.sin(t * 6 + i));
                arEu.set(t * 0.5, 0, t * 1.1 + i); arQ4.setFromEuler(arEu); arV3.set(pd.x, pd.y, z); arS3.set(sc, sc, sc);
                pv.halo.position.z = z; pv.halo.material.opacity = 0.5 + 0.1 * Math.sin(t * 5);
                pv.halo.scale.set(380 * pv.k, 380 * pv.k, 1);
              } else if (pv.pk > 0.55) { const e = (pv.pk - 0.55) / 0.45, sc = e * (1.5 - 0.5 * e); arEu.set(t * 0.5, 0, t * 1.1 + i); arQ4.setFromEuler(arEu); arV3.set(pd.x, pd.y, 100 + (1 - e) * 60); arS3.set(sc, sc, sc); pv.k = 0; }
              else { pv.k = 0; arV3.set(pd.x, pd.y, -500); arS3.set(0.001, 0.001, 0.001); }
              arM4.compose(arV3, arQ4, arS3); arPad.orbs.setMatrixAt(pv.orb, arM4);
            }
          }
          arPad.orbs.instanceMatrix.needsUpdate = true;
          if (dirty) { arPad.gc.needsUpdate = true; arPad.dc.needsUpdate = true; arPad.fc.needsUpdate = true; }
        };
        const crM = typeof crModels === 'object' && crModels ? crModels : {};
        const crB64 = t => { const b = atob(t), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
        const crDec = m => {
          const q = new Uint16Array(crB64(m.p)), n = new Int8Array(crB64(m.n)), ix = m.big ? new Uint32Array(crB64(m.i)) : new Uint16Array(crB64(m.i));
          const pos = new Float32Array(m.nv * 3), nor = new Float32Array(m.nv * 3), uv = new Float32Array(m.nv * 2);
          for (let i = 0; i < m.nv * 3; i++) { const a = i % 3; pos[i] = m.lo[a] + q[i] / 65535 * m.sc[a]; nor[i] = n[i] / 127; }
          if (m.u) { const u = new Uint16Array(crB64(m.u)); for (let i = 0; i < m.nu * 2; i++) { const a = i & 1; uv[i] = m.ulo[a] + u[i] / 65535 * m.usc[a]; } }
          const g = own(new THREE.BufferGeometry());
          g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          g.setIndex(new THREE.BufferAttribute(ix, 1));
          for (const [mi, st, ct] of m.g) g.addGroup(st, ct, mi);
          g.computeBoundingSphere();
          return g;
        };
        const crTL = new THREE.TextureLoader(), crTexs = {};
        const crTex = (url, srgb = true) => {
          const k = (srgb ? 's' : 'l') + url.length + url.slice(-48);
          if (crTexs[k]) return crTexs[k];
          const t = own(crTL.load(url));
          t.flipY = false; t.encoding = srgb ? THREE.sRGBEncoding : THREE.LinearEncoding; t.anisotropy = aniso; t.wrapS = t.wrapT = THREE.RepeatWrapping;
          return crTexs[k] = t;
        };
        const arBV = CFG.ballVis || BR;
        const arBallHub = m => { m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat arTq = clamp((diffuseColor.g - diffuseColor.r) * 5.0 - 0.4, 0.0, 1.0);\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.05, 0.35, 1.0) * (diffuseColor.g + 0.2), arTq);'); }; return m; };
        const ballM = (() => {
          const M = crM.ball;
          if (!M || !M.body) return new THREE.Mesh(own(new THREE.SphereGeometry(arBV, 48, 32)), own(new THREE.MeshStandardMaterial({ color: lin(0xb4bac4), roughness: 0.4, metalness: 0.4, envMap: arEnv })));
          const g = crDec(M.body).scale(arBV, arBV, arBV); g.computeBoundingSphere();
          const map = crTex(M.tex.map), em = crTex(M.tex.em);
          const mats = M.mats.map(q => q.k === 'glow'
            ? own(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.95, 2.4).multiplyScalar(1.8), toneMapped: false }))
            : arBallHub(own(new THREE.MeshPhysicalMaterial({ map, emissiveMap: em, emissive: new THREE.Color(0.3, 0.85, 2.2), emissiveIntensity: 3, color: lin(0xd2d6da, 1.2), roughness: 0.45, metalness: 0.25, clearcoat: 0.4, clearcoatRoughness: 0.3, envMap: arEnv, envMapIntensity: 0.9 }))));
          return new THREE.Mesh(g, mats);
        })();
        ballM.castShadow = true; scene.add(ballM);
        if (crM.ball && crM.ball.body) {
          const hd = new THREE.Vector3(-1, -1, 0).normalize(), hg = mergeG([new THREE.CircleGeometry(arBV * 0.13, 24), new THREE.RingGeometry(arBV * 0.17, arBV * 0.2, 24)]);
          const hm = new THREE.Mesh(hg, own(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1.1, 2.6), toneMapped: false })));
          hm.position.copy(hd).multiplyScalar(arBV * 1.003); hm.lookAt(hd.clone().multiplyScalar(arBV * 2)); ballM.add(hm);
        }
        ballM.add(new THREE.Mesh(own(new THREE.SphereGeometry(arBV * 1.05, 24, 16)), own(new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide, fog: false }))));
        const ballGlow = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: glowT, color: 0xdff0ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.12 })));
        ballGlow.scale.set(330, 330, 1); ballGlow.renderOrder = 4; scene.add(ballGlow);
        const arBallSh = new THREE.Mesh(own(new THREE.PlaneGeometry(1, 1)), own(new THREE.MeshBasicMaterial({ map: glowT, color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 })));
        arBallSh.renderOrder = 1; scene.add(arBallSh);


        const Q = new THREE.Quaternion(), ax = new THREE.Vector3();
        const arBallTick = (dt, t) => {
          const B = W.ball;
          ballM.visible = ballGlow.visible = arBallSh.visible = !B.hidden && !B.scored;
          { const z = Math.max(0, B.p.z - arBV), k = Math.max(0, 1 - z / 1800), sc = arBV * 2.6 * (1 + z / 1500); arBallSh.position.set(B.p.x, B.p.y, 3); arBallSh.scale.set(sc, sc, 1); arBallSh.material.opacity = 0.62 * k; arBallSh.visible = arBallSh.visible && k > 0 && Math.abs(B.p.x) < CFG.X - 200 && Math.abs(B.p.y) < CFG.Y + 800; }
          ballM.position.set(B.p.x, B.p.y, B.p.z); ballGlow.position.copy(ballM.position);
          const wl = vlen(B.w);
          if (wl > 1e-4) { ax.set(B.w.x / wl, B.w.y / wl, B.w.z / wl); Q.setFromAxisAngle(ax, wl * dt); ballM.quaternion.premultiply(Q); }
        };
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
