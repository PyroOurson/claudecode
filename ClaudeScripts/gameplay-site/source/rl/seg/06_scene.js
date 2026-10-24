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
