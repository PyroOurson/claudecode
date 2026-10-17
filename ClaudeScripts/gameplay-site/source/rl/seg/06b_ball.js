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
          ballM.visible = ballGlow.visible = arBallSh.visible = !B.hidden;
          { const z = Math.max(0, B.p.z - arBV), k = Math.max(0, 1 - z / 1800), sc = arBV * 2.6 * (1 + z / 1500); arBallSh.position.set(B.p.x, B.p.y, 3); arBallSh.scale.set(sc, sc, 1); arBallSh.material.opacity = 0.62 * k; arBallSh.visible = arBallSh.visible && k > 0 && Math.abs(B.p.x) < CFG.X - 200 && Math.abs(B.p.y) < CFG.Y + 800; }
          ballM.position.set(B.p.x, B.p.y, B.p.z); ballGlow.position.copy(ballM.position);
          const wl = vlen(B.w);
          if (wl > 1e-4) { ax.set(B.w.x / wl, B.w.y / wl, B.w.z / wl); Q.setFromAxisAngle(ax, wl * dt); ballM.quaternion.premultiply(Q); }
        };
