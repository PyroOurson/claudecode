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
        const arBallPat = 'varying vec3 vOP;\nfloat arHexD(vec2 p) { p = abs(p); return max(dot(p, vec2(0.5, 0.8660254)), p.x); }\nvoid arBall(vec3 q, out float seam, out float groove, out float hub, out float hole, out float light, out float rr) {\n  vec3 n = normalize(q), a = abs(n);\n  float m1 = max(a.x, max(a.y, a.z)), m3 = min(a.x, min(a.y, a.z)), m2 = a.x + a.y + a.z - m1 - m3;\n  vec2 uv = a.x >= m1 ? n.yz / a.x : a.y >= m1 ? n.xz / a.y : n.xy / a.z;\n  float d = m1 - m2; rr = length(uv);\n  seam = 1.0 - smoothstep(0.045, 0.058, d);\n  groove = smoothstep(0.052, 0.06, d) * (1.0 - smoothstep(0.064, 0.085, d)) + (1.0 - smoothstep(0.012, 0.02, d)) * 0.6;\n  float ad = abs(abs(uv.x) - abs(uv.y)) / max(rr, 0.001);\n  float arm = (1.0 - smoothstep(0.16, 0.22, ad)) * smoothstep(0.16, 0.19, rr) * (1.0 - smoothstep(0.46, 0.5, rr));\n  float plate = 1.0 - smoothstep(0.19, 0.215, rr);\n  hub = max(arm, plate);\n  vec2 sv = vec2(1.0, 1.7320508), hp0 = uv * 18.0;\n  vec4 hC = floor(vec4(hp0, hp0 - vec2(0.5, 1.0)) / sv.xyxy) + 0.5;\n  vec4 h = vec4(hp0 - hC.xy * sv, hp0 - (hC.zw + 0.5) * sv);\n  vec2 hp = dot(h.xy, h.xy) < dot(h.zw, h.zw) ? h.xy : h.zw;\n  hole = (1.0 - smoothstep(0.34, 0.4, arHexD(hp))) * (1.0 - seam) * (1.0 - hub) * smoothstep(0.09, 0.11, d);\n  light = 1.0 - smoothstep(0.08, 0.095, rr);\n}\n';
        const ballM = (() => {
          const m = own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.55, envMap: arEnv, envMapIntensity: 1.0 }));
          m.extensions = { derivatives: true };
          m.onBeforeCompile = sh => {
            sh.vertexShader = 'varying vec3 vOP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;');
            sh.fragmentShader = arBallPat + sh.fragmentShader
              .replace('#include <map_fragment>', '#include <map_fragment>\nfloat bS, bG, bH, bO, bL, bR;\narBall(vOP, bS, bG, bH, bO, bL, bR);\nvec3 arPc = mix(vec3(0.5, 0.5, 0.45), vec3(0.33, 0.33, 0.3), bO * 0.75);\narPc = mix(arPc, vec3(0.3, 0.31, 0.33), bH * (1.0 - bL));\narPc = mix(arPc, vec3(0.1, 0.11, 0.12), smoothstep(0.095, 0.11, bR) * (1.0 - smoothstep(0.15, 0.17, bR)));\narPc = mix(arPc, vec3(0.8, 0.82, 0.84), bS);\narPc *= 1.0 - 0.6 * clamp(bG, 0.0, 1.0);\ndiffuseColor.rgb *= arPc;')
              .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(mix(0.5, 0.75, bO), 0.26, bS);')
              .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n{ float arH = bS + bH * 0.7 - bO * 0.3 - clamp(bG, 0.0, 1.0) * 0.4; vec3 sX = dFdx(-vViewPosition), sY = dFdy(-vViewPosition); vec3 R1 = cross(sY, normal), R2 = cross(normal, sX); float fD = dot(sX, R1); float hx = dFdx(arH) * 1.4, hy = dFdy(arH) * 1.4; normal = normalize(abs(fD) * normal - sign(fD) * (hx * R1 + hy * R2)); }')
              .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += mix(vec3(0.2, 0.8, 2.6), vec3(2.4, 2.9, 3.2), 1.0 - smoothstep(0.03, 0.075, bR)) * bL * 1.5 + vec3(0.1, 0.45, 1.2) * smoothstep(0.1, 0.12, bR) * (1.0 - smoothstep(0.13, 0.16, bR)) * 0.8;');
          };
          return new THREE.Mesh(own(new THREE.SphereGeometry(arBV, 96, 64)), m);
        })();
        ballM.castShadow = true; scene.add(ballM);
        ballM.add(new THREE.Mesh(own(new THREE.SphereGeometry(arBV * 1.05, 24, 16)), own(new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide, fog: false }))));
        const ballGlow = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: glowT, color: 0xdff0ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.12 })));
        ballGlow.scale.set(330, 330, 1); ballGlow.renderOrder = 4; scene.add(ballGlow);
        const arBallSh = new THREE.Mesh(own(new THREE.PlaneGeometry(1, 1)), own(new THREE.MeshBasicMaterial({ map: glowT, color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 })));
        arBallSh.renderOrder = 1; scene.add(arBallSh);


        const Q = new THREE.Quaternion(), ax = new THREE.Vector3();
        const arBallTick = (dt, t) => {
          const B = W.ball;
          ballM.visible = ballGlow.visible = arBallSh.visible = !B.hidden;
          { const z = Math.max(0, B.p.z - arBV), k = Math.max(0, 1 - z / 1800), sc = arBV * 2.6 * (1 + z / 1500); arBallSh.position.set(B.p.x, B.p.y, 3); arBallSh.scale.set(sc, sc, 1); arBallSh.material.opacity = 0.62 * k; arBallSh.visible = arBallSh.visible && k > 0 && Math.abs(B.p.x) < CFG.X - 200 && Math.abs(B.p.y) < CFG.Y + 800; }
          ballM.position.set(B.p.x, B.p.y, B.p.z); ballGlow.position.copy(ballM.position);
          const wl = vlen(B.w);
          if (wl > 1e-4) { ax.set(B.w.x / wl, B.w.y / wl, B.w.z / wl); Q.setFromAxisAngle(ax, wl * dt); ballM.quaternion.premultiply(Q); }
        };
