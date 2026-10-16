
(() => {
  'use strict';
  const C = Ameplay.colors;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const easeOut = t => 1 - (1 - t) * (1 - t) * (1 - t);
  const easeIn = t => t * t * t;
  const smooth = t => t * t * (3 - 2 * t);
  const backOut = t => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
  const damp = (k, dt) => 1 - Math.exp(-k * dt);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(6.2832 * Math.random());
  const FONT = 'Nunito, system-ui, sans-serif';

  const css3d = id => {
    const g = '.gm-' + id;
    return `
${g}{gap:0}
${g} .w3{position:relative;width:min(100%,960px,calc((100dvh - 250px) * 1.6));aspect-ratio:960/600;border-radius:var(--r);overflow:hidden;background:#bcd6ee;box-shadow:0 22px 44px -28px rgba(31,29,43,.6);touch-action:none}
${g} .w3>canvas{position:absolute;inset:0;width:100%;height:100%;border-radius:0;background:none}
${g} .hud{position:absolute;inset:0;pointer-events:none;color:#fff;font-family:var(--sans);font-weight:900}
${g} .pill{position:absolute;display:flex;align-items:center;gap:10px;padding:7px 15px;border-radius:999px;background:rgba(16,18,36,.46);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font-size:15px;line-height:1.1;white-space:nowrap;box-shadow:0 8px 20px -12px rgba(0,0,0,.6)}
${g} .pill small{font-size:10px;letter-spacing:.12em;text-transform:uppercase;opacity:.75}
${g} .pill b{font-size:20px;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
${g} .tl{left:12px;top:12px}
${g} .tr{right:12px;top:12px}
${g} .tc{left:50%;top:12px;transform:translateX(-50%)}
${g} .ban{position:absolute;left:50%;top:36%;font-size:clamp(30px,7.4vw,76px);letter-spacing:-.035em;line-height:1;white-space:nowrap;text-align:center;opacity:0;transform:translate(-50%,-50%);text-shadow:0 3px 0 rgba(0,0,0,.16),0 10px 34px rgba(0,0,0,.4)}
${g} .ban small{display:block;margin-top:10px;font-size:clamp(12px,1.9vw,18px);letter-spacing:.01em}
${g} .ban.on{animation:${id}-ban 1.7s cubic-bezier(.2,.9,.3,1.2) both}
${g} .pop{position:absolute;font-size:clamp(14px,2.4vw,23px);line-height:1;text-align:center;white-space:nowrap;text-shadow:0 2px 0 rgba(0,0,0,.25),0 4px 14px rgba(0,0,0,.45);animation:${id}-pop .95s ease-out both}
${g} .pop small{display:block;margin-top:3px;font-size:.55em;letter-spacing:.08em}
${g} .hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);max-width:92%;padding:7px 14px;border-radius:999px;background:rgba(16,18,36,.42);font-size:12.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${g} .hint:empty{display:none}
@keyframes ${id}-ban{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}24%{transform:translate(-50%,-50%) scale(1)}78%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-64%) scale(.98)}}
@keyframes ${id}-pop{0%{opacity:0;transform:translate(-50%,-40%) scale(.6)}14%{opacity:1;transform:translate(-50%,-70%) scale(1.12)}100%{opacity:0;transform:translate(-50%,-210%) scale(1)}}
@media (max-width:560px){${g} .pill{padding:5px 10px;gap:6px;font-size:12px}${g} .pill b{font-size:15px}${g} .pill small{font-size:8.5px}${g} .tl{left:8px;top:8px}${g} .tr{right:8px;top:8px}${g} .tc{top:8px}${g} .hint{font-size:10.5px;bottom:8px;padding:5px 10px}}
`;
  };

  function kit(THREE) {
    const texs = [];
    return {
      tex(w, h, draw, rep) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        draw(c.getContext('2d'), w, h);
        const t = new THREE.CanvasTexture(c);
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = 8;
        if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
        texs.push(t);
        return t;
      },
      dispose(scene) {
        const seen = new Set();
        scene.traverse(o => {
          if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
          const m = o.material;
          if (m) (Array.isArray(m) ? m : [m]).forEach(x => { if (!seen.has(x)) { seen.add(x); x.dispose(); } });
        });
        texs.forEach(t => t.dispose());
      }
    };
  }

  const uvScale = (geo, su, sv) => {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    return geo;
  };

  const mergeGeo = (THREE, list) => {
    const P = [], N = [], U = [];
    for (const [g, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0] of list) {
      const q = g.index ? g.toNonIndexed() : g.clone();
      if (rx) q.rotateX(rx);
      if (rz) q.rotateZ(rz);
      q.scale(sx, sy, sz); q.translate(x, y, z);
      P.push(q.attributes.position.array); N.push(q.attributes.normal.array); U.push(q.attributes.uv.array);
      q.dispose();
    }
    const cat = (arr, n) => {
      const out = new Float32Array(arr.reduce((t, a) => t + a.length, 0));
      let o = 0;
      for (const a of arr) { out.set(a, o); o += a.length; }
      return new THREE.BufferAttribute(out, n);
    };
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', cat(P, 3)); geo.setAttribute('normal', cat(N, 3)); geo.setAttribute('uv', cat(U, 2));
    return geo;
  };

  function skyDome(THREE, K, scene, top, mid, low, clouds) {
    const t = K.tex(1024, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, top); g.addColorStop(0.24, top); g.addColorStop(0.47, mid); g.addColorStop(0.5, mid); g.addColorStop(1, low);
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < clouds; i++) {
        const cx = Math.random() * w, cy = h * rnd(0.3, 0.44), s = rnd(26, 60);
        for (let k = 0; k < 8; k++) {
          const px = cx + rnd(-2.2, 2.2) * s, py = cy + rnd(-0.2, 0.2) * s, r = s * rnd(0.5, 1.05);
          for (const off of [-w, 0, w]) {
            x.save(); x.translate(px + off, py); x.scale(1, 0.42);
            const rg = x.createRadialGradient(0, 0, 0, 0, 0, r);
            rg.addColorStop(0, 'rgba(255,255,255,.62)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = rg; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill(); x.restore();
          }
        }
      }
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(330, 32, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
    m.renderOrder = -1;
    scene.add(m);
    return m;
  }

  function particles(THREE, scene, max, geo, mat, floor = 0, shadow = true) {
    const mesh = new THREE.InstancedMesh(geo, mat, max), d = new THREE.Object3D(), col = new THREE.Color(), ps = [];
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.castShadow = shadow;
    d.scale.setScalar(0); d.updateMatrix();
    for (let i = 0; i < max; i++) {
      ps.push({ on: false, l: 0, m: 1, s: 1, g: 0, dr: 0, gr: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), w: new THREE.Vector3() });
      mesh.setMatrixAt(i, d.matrix);
      mesh.setColorAt(i, col.set(0xffffff));
    }
    scene.add(mesh);
    let k = 0, n = 0;
    return {
      spawn(p, vx, vy, vz, color, life, size, g = 9.8, dr = 0, gr = 0) {
        const q = ps[k];
        mesh.setColorAt(k, col.set(color));
        k = (k + 1) % max;
        if (!q.on) n++;
        q.on = true; q.l = q.m = life; q.s = size; q.g = g; q.dr = dr; q.gr = gr;
        q.p.copy(p); q.v.set(vx, vy, vz);
        q.r.set(rnd(0, 6), rnd(0, 6), rnd(0, 6)); q.w.set(rnd(-14, 14), rnd(-14, 14), rnd(-14, 14));
        mesh.instanceColor.needsUpdate = true;
      },
      update(dt) {
        if (!n) return;
        for (let i = 0; i < max; i++) {
          const q = ps[i];
          if (!q.on) continue;
          q.l -= dt;
          if (q.l <= 0) {
            q.on = false; n--;
            d.position.set(0, 0, 0); d.rotation.set(0, 0, 0); d.scale.setScalar(0);
          } else {
            q.v.y -= q.g * dt;
            if (q.dr) q.v.multiplyScalar(Math.max(0, 1 - q.dr * dt));
            q.p.addScaledVector(q.v, dt);
            q.s += q.gr * dt;
            if (q.p.y < floor) { q.p.y = floor; if (q.v.y < 0) q.v.y *= -0.3; q.v.x *= 0.6; q.v.z *= 0.6; q.w.multiplyScalar(0.6); }
            q.r.x += q.w.x * dt; q.r.y += q.w.y * dt; q.r.z += q.w.z * dt;
            d.position.copy(q.p); d.rotation.copy(q.r); d.scale.setScalar(Math.max(0, q.s) * Math.min(1, q.l / q.m * 4));
          }
          d.updateMatrix();
          mesh.setMatrixAt(i, d.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    };
  }

  function makeUi(api, root, canvas) {
    const wrap = document.createElement('div');
    wrap.className = 'w3';
    canvas.removeAttribute('style');
    root.append(wrap);
    wrap.append(canvas);
    const hud = document.createElement('div');
    hud.className = 'hud';
    wrap.append(hud);
    const el = (cls, html = '', parent = hud) => { const e = document.createElement('div'); e.className = cls; e.innerHTML = html; parent.append(e); return e; };
    const ban = el('ban');
    return {
      wrap, hud, el,
      banner(t, sub, color) {
        ban.innerHTML = t + (sub ? `<small>${sub}</small>` : '');
        ban.style.color = color || '#fff';
        ban.classList.remove('on'); void ban.offsetWidth; ban.classList.add('on');
      },
      pop(t, x, y, color) {
        const p = el('pop', t);
        p.style.left = x + '%'; p.style.top = y + '%'; p.style.color = color || '#fff';
        api.timeout(() => p.remove(), 1000);
      }
    };
  }

  function boot(api, run) {
    let dead = false, cleanup = null;
    api.gl(960, 600).then(gl => { if (gl && !dead && api.alive) cleanup = run(gl); }).catch(e => {
      if (dead || !api.alive) return;
      console.error('[gameplay 3D]', e);
      api.overlay({ kicker: '3D', title: '3D unavailable', text: 'This game needs WebGL. Try enabling hardware acceleration or another browser.', button: null });
    });
    return { destroy() { dead = true; if (cleanup) { const c = cleanup; cleanup = null; c(); } } };
  }



  function penalty(root, api, gl) {
    const { THREE, renderer, canvas } = gl, V3 = THREE.Vector3;
    const K = kit(THREE), ui = makeUi(api, root, canvas), keys = api.keys;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const GW = 3.66, GH = 2.44, GZ = -11, BR = 0.11, PR = 0.06, G = 9.81, KD = 0.011, KM = 0.0062, ND = 2, NT = 0.8, WMAX = 110, KZ = GZ + 0.4, L = 2.2;
    renderer.toneMappingExposure = 0.9;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcfe0ee, 70, 220);
    skyDome(THREE, K, scene, '#3e8ad8', '#cfe5f8', '#dce8f0', 12);
    const cam = new THREE.PerspectiveCamera(38, 1.6, 0.1, 600);
    const CAM0 = new V3(0, 1.5, 4.4), LOOK0 = new V3(0, 1.05, GZ), camPos = CAM0.clone(), camLook = LOOK0.clone(), camT = new V3(), lookT = new V3();
    cam.position.copy(CAM0); cam.lookAt(LOOK0);
    let shake = 0;

    scene.add(new THREE.HemisphereLight(0xe6f1ff, 0x4f8a3c, 0.62));
    const sun = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sun.position.set(-8, 20, 10); sun.target.position.set(0, 0, -5);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 2, far: 60 });
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sun, sun.target);

    const d = new THREE.Object3D(), col = new THREE.Color();
    const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7 }, o));
    const add = (geo, mat, x, y, z, parent = scene, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };


    const grass = K.tex(1024, 1024, (x, w, h) => {
      for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#3f9b3f' : '#4dad49'; x.fillRect(0, i * h / 8, w, h / 8); }
      for (let i = 0; i < 30000; i++) {
        const l = rnd(-1, 1);
        x.fillStyle = l > 0 ? `rgba(210,255,160,${l * 0.11})` : `rgba(10,55,15,${-l * 0.16})`;
        x.fillRect(Math.random() * w, Math.random() * h, 1.5, rnd(2, 5));
      }
    }, [3, 3]);
    const pitch = add(new THREE.PlaneGeometry(132, 132), M(0xffffff, { map: grass, roughness: 0.95 }), 0, 0, GZ, scene, false);
    pitch.rotation.x = -Math.PI / 2;
    const lineM = M(0xf6f8f2, { roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const line = (x0, z0, x1, z1) => { const m = add(new THREE.PlaneGeometry(Math.abs(x1 - x0) + 0.12, Math.abs(z1 - z0) + 0.12), lineM, (x0 + x1) / 2, 0.004, (z0 + z1) / 2, scene, false); m.rotation.x = -Math.PI / 2; };
    line(-34, GZ, 34, GZ);
    line(-9.16, GZ, -9.16, GZ + 5.5); line(9.16, GZ, 9.16, GZ + 5.5); line(-9.16, GZ + 5.5, 9.16, GZ + 5.5);
    line(-20.16, GZ, -20.16, GZ + 16.5); line(20.16, GZ, 20.16, GZ + 16.5); line(-20.16, GZ + 16.5, 20.16, GZ + 16.5);
    add(new THREE.CircleGeometry(0.14, 24), lineM, 0, 0.004, 0, scene, false).rotation.x = -Math.PI / 2;


    const white = M(0xffffff, { roughness: 0.3, metalness: 0.05 }), tube = M(0xd5d9e3, { roughness: 0.5, metalness: 0.3 });
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(PR, PR, GH + PR, 20), white, s * (GW + PR), (GH + PR) / 2, GZ);
    add(new THREE.CylinderGeometry(PR, PR, 2 * (GW + 2 * PR), 20), white, 0, GH + PR, GZ).rotation.z = Math.PI / 2;
    const rod = (a, b) => { const dv = b.clone().sub(a), m = add(new THREE.CylinderGeometry(0.025, 0.025, dv.length(), 8), tube, 0, 0, 0); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), dv.normalize()); };
    for (const s of [-1, 1]) {
      rod(new V3(s * GW, GH, GZ), new V3(s * GW, GH, GZ - NT));
      rod(new V3(s * GW, GH, GZ - NT), new V3(s * GW, 0, GZ - ND));
      rod(new V3(s * GW, 0.02, GZ), new V3(s * GW, 0.02, GZ - ND));
    }
    rod(new V3(-GW, 0.02, GZ - ND), new V3(GW, 0.02, GZ - ND));
    rod(new V3(-GW, GH, GZ - NT), new V3(GW, GH, GZ - NT));


    const netM = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.78 });
    const grid = (nu, nv, f) => {
      const pos = new Float32Array((nu + 1) * (nv + 1) * 3), idx = [], v = new V3();
      for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
        const k = j * (nu + 1) + i;
        f(i / nu, j / nv, v); pos[k * 3] = v.x; pos[k * 3 + 1] = v.y; pos[k * 3 + 2] = v.z;
        if (i < nu) idx.push(k, k + 1);
        if (j < nv) idx.push(k, k + nu + 1);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
      const m = new THREE.LineSegments(geo, netM); scene.add(m); return m;
    };
    const NU = 48, NV = 18;
    const back = grid(NU, NV, (u, v, o) => o.set(lerp(-GW, GW, u), v * GH, lerp(GZ - ND, GZ - NT, v)));
    const backBase = back.geometry.attributes.position.array.slice();
    for (const s of [-1, 1]) grid(12, NV, (u, v, o) => o.set(s * GW, v * GH, GZ - u * lerp(ND, NT, v)));
    grid(NU, 5, (u, v, o) => o.set(lerp(-GW, GW, u), GH, GZ - v * NT));
    const NN = new V3(0, ND - NT, -GH).normalize();
    let wob = null;
    const netHit = (p, sp) => { wob = { u: clamp((p.x + GW) / (2 * GW), 0, 1), v: clamp(p.y / GH, 0, 1), a: clamp(sp * 0.035, 0.1, 0.6), t: 0 }; };
    function netUpdate(dt) {
      if (!wob) return;
      wob.t += dt;
      const arr = back.geometry.attributes.position.array, k = wob.a * Math.exp(-wob.t * 2.4) * Math.cos(wob.t * 12);
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
        const du = (i / NU - wob.u) * 7.32, dv = (j / NV - wob.v) * 2.6, n = (j * (NU + 1) + i) * 3;
        const f = k * Math.exp(-(du * du + dv * dv) / 1.4) * Math.sin(Math.PI * i / NU) * Math.sin(Math.PI * j / NV);
        arr[n] = backBase[n] + NN.x * f; arr[n + 1] = backBase[n + 1] + NN.y * f; arr[n + 2] = backBase[n + 2] + NN.z * f;
      }
      back.geometry.attributes.position.needsUpdate = true;
      if (wob.t > 3) wob = null;
    }


    const adTex = K.tex(1024, 64, (x, w, h) => {
      [['#6c5ce7', 'gameplay'], ['#ff8a3d', 'PLAY FREE'], ['#1f1d2b', '3D GAMES'], ['#22b07d', 'PENALTY KICK']].forEach(([bg, t], i) => {
        x.fillStyle = bg; x.fillRect(i * 256, 0, 256, h);
        x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(i * 256, 0, 256, h / 2);
        x.fillStyle = '#fff'; x.font = `900 ${t.length > 9 ? 27 : 34}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(t, i * 256 + 128, h / 2 + 2);
      });
    }, [4.6, 1]);
    const adSide = M(0x23263a), adM = new THREE.MeshBasicMaterial({ map: adTex });
    add(new THREE.BoxGeometry(70, 0.9, 0.15), [adSide, adSide, adSide, adSide, adM, adSide], 0, 0.45, GZ - 5);


    const ROWS = 12, RD = 1.2, RH = 0.6, Z0 = -19, Y0 = 1.1;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(0, Y0);
    for (let r = 0, y = Y0; r < ROWS; r++) { shape.lineTo((r + 1) * RD, y); y += RH; shape.lineTo((r + 1) * RD, y); }
    shape.lineTo(ROWS * RD + 1, Y0 + ROWS * RH); shape.lineTo(ROWS * RD + 1, 0); shape.lineTo(0, 0);
    const stand = add(new THREE.ExtrudeGeometry(shape, { depth: 96, bevelEnabled: false }), M(0x8e98b0, { roughness: 0.95 }), -48, 0, Z0, scene, false);
    stand.rotation.y = Math.PI / 2;
    const topY = Y0 + ROWS * RH, backZ = Z0 - ROWS * RD - 1;
    const roofM = M(0x2c3044, { metalness: 0.2 });
    add(new THREE.BoxGeometry(96, 14, 0.6), M(0x3a4058), 0, 7, backZ, scene, false);
    add(new THREE.BoxGeometry(96, 0.5, 10), roofM, 0, topY + 3.6, backZ + 4.5, scene, false);
    add(new THREE.BoxGeometry(96, 1.1, 0.35), M(C.accent, { roughness: 0.5 }), 0, topY + 3.4, backZ + 9.5, scene, false);
    const lampM = new THREE.MeshBasicMaterial({ color: 0xfff6dc });
    for (let x = -44; x <= 44; x += 4) add(new THREE.BoxGeometry(1.4, 0.12, 0.4), lampM, x, topY + 3.3, backZ + 8.6, scene, false);
    for (const x of [-30, -12, 12, 30]) add(new THREE.BoxGeometry(0.4, 3.6, 0.4), roofM, x, topY + 1.8, backZ + 1.5, scene, false);

    const boardTex = K.tex(1024, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#1b1840'); g.addColorStop(0.5, '#2c2470'); g.addColorStop(1, '#1b1840');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ffd24a'; x.fillRect(0, 0, w, 10); x.fillRect(0, h - 10, w, 10);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `900 76px ${FONT}`; x.fillStyle = '#fff'; x.fillText('PENALTY KICK', w / 2, 92);
      x.font = `900 40px ${FONT}`; x.fillStyle = '#9be15d'; x.fillText('SHOOT-OUT', w / 2, 170);
      x.fillStyle = 'rgba(0,0,0,.28)';
      for (let i = 0; i < w; i += 4) x.fillRect(i, 0, 1, h);
      for (let i = 0; i < h; i += 4) x.fillRect(0, i, w, 1);
    });
    add(new THREE.BoxGeometry(12.6, 3.0, 0.3), M(0x15132b, { roughness: 0.5 }), 0, 10.0, backZ + 0.45, scene, false);
    add(new THREE.PlaneGeometry(12, 2.5), new THREE.MeshBasicMaterial({ map: boardTex }), 0, 10.0, backZ + 0.62, scene, false);
    for (const sx of [-1, 1]) for (const k of [0, 1, 2]) add(new THREE.BoxGeometry(0.55, 0.55, 0.12), lampM, sx * (9.6 + k * 0.9), 10.0 + (k - 1) * 0.0, backZ + 0.45, scene, false);
    const seats = [];
    for (let r = 0; r < ROWS; r++) for (let x = -46; x <= 46; x += 0.62) if (Math.random() < 0.9) seats.push([x + rnd(-0.07, 0.07), Y0 + r * RH, Z0 - (r + 0.55) * RD]);
    const NC = seats.length, bodyGeo = new THREE.BoxGeometry(0.44, 0.56, 0.3), headGeo = new THREE.SphereGeometry(0.13, 10, 8);
    bodyGeo.translate(0, 0.28, 0); headGeo.translate(0, 0.7, 0);
    const crowdM = M(0xffffff, { roughness: 0.85 });
    const bodies = new THREE.InstancedMesh(bodyGeo, crowdM, NC), heads = new THREE.InstancedMesh(headGeo, crowdM, NC);
    const baseY = new Float32Array(NC), ph = new Float32Array(NC), fq = new Float32Array(NC), am = new Float32Array(NC);
    const SHIRTS = ['#e8414f', '#f4f4f4', '#3d7bfd', '#ffc84a', '#6c5ce7', '#22b07d', '#ff8a3d', '#2a2840'], SKIN = ['#f1c7a5', '#e0a37a', '#c68642', '#8d5524', '#ffdbb4'];
    seats.forEach(([x, y, z], i) => {
      d.position.set(x, y, z); d.rotation.set(0, rnd(-0.25, 0.25), 0); d.scale.setScalar(rnd(0.9, 1.08)); d.updateMatrix();
      bodies.setMatrixAt(i, d.matrix); heads.setMatrixAt(i, d.matrix);
      bodies.setColorAt(i, col.set(x < -9 ? pick(['#e8414f', '#e8414f', '#f4f4f4']) : x > 9 ? pick(['#3d7bfd', '#3d7bfd', '#f4f4f4']) : pick(SHIRTS)));
      heads.setColorAt(i, col.set(Math.random() < 0.14 ? pick(['#2a2233', '#e8414f', '#3d7bfd', '#ffc84a']) : pick(SKIN)));
      baseY[i] = y; ph[i] = rnd(0, 6.28); fq[i] = rnd(7, 11); am[i] = rnd(0.4, 1);
    });
    scene.add(bodies, heads);
    let exc = 0.12;
    function crowd(t) {
      const a = bodies.instanceMatrix.array, b = heads.instanceMatrix.array, e = exc * 0.42;
      for (let i = 0; i < NC; i++) { const o = Math.max(0, Math.sin(t * fq[i] + ph[i])) * e * am[i]; a[i * 16 + 13] = b[i * 16 + 13] = baseY[i] + o; }
      bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
    }


    const ballTex = K.tex(512, 256, (x, w, h) => {
      x.fillStyle = '#f7f7f3'; x.fillRect(0, 0, w, h);
      const phi = (1 + Math.sqrt(5)) / 2, a = new V3(), b = new V3(), n = new V3(), q = new V3();
      const toUV = v => [((Math.atan2(v.z, -v.x) / (2 * Math.PI)) + 1) % 1 * w, Math.acos(clamp(v.y, -1, 1)) / Math.PI * h];
      for (const [vx, vy, vz] of [[0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi], [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0], [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]]) {
        n.set(vx, vy, vz).normalize();
        a.set(0, 1, 0); if (Math.abs(n.y) > 0.9) a.set(1, 0, 0);
        a.cross(n).normalize(); b.crossVectors(n, a);
        const pts = [];
        for (let k = 0; k < 50; k++) {
          const ang = k / 50 * Math.PI * 2, rr = 0.36 * Math.cos(Math.PI / 5) / Math.cos((ang % (2 * Math.PI / 5)) - Math.PI / 5);
          q.copy(n).multiplyScalar(Math.cos(rr)).addScaledVector(a, Math.sin(rr) * Math.cos(ang)).addScaledVector(b, Math.sin(rr) * Math.sin(ang));
          pts.push(toUV(q));
        }
        let lo = w, hi = 0;
        pts.forEach(p => { lo = Math.min(lo, p[0]); hi = Math.max(hi, p[0]); });
        const wrapX = hi - lo > w / 2;
        if (wrapX) pts.forEach(p => { if (p[0] < w / 2) p[0] += w; });
        for (const off of wrapX ? [0, -w] : [0]) {
          x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0] + off, p[1]) : x.moveTo(p[0] + off, p[1])); x.closePath();
          x.fillStyle = '#23212f'; x.fill();
        }
      }
    });
    const ball = add(new THREE.SphereGeometry(BR, 32, 20), M(0xffffff, { map: ballTex, roughness: 0.42 }), 0, BR, 0);


    const JERSEYS = [0x8fe01c, 0xff6a14, 0xff3d8b, 0x12c4dc, 0xffc400, 0x9b45f5];
    const numTex = K.tex(128, 128, (x, w, h) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(0,0,0,.07)'; for (let i = 0; i < 6; i++) x.fillRect(i * 24 + 4, 0, 10, h);
      x.fillStyle = '#d7d7d7'; x.beginPath(); x.moveTo(42, 0); x.lineTo(64, 24); x.lineTo(86, 0); x.fill();
      x.font = `900 66px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(25,25,35,.6)'; x.fillText('1', 64, 76);
      x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, 108, w, 20); x.fillStyle = 'rgba(0,0,0,.2)'; x.beginPath(); x.arc(28, 36, 9, 0, 7); x.fill();
    });
    const gloveTex = K.tex(64, 64, (x, w, h) => {
      x.fillStyle = '#f7f7fa'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#d9dbe6'; for (const fx of [14, 26, 38, 50]) x.fillRect(fx, 38, 1.5, 26);
      x.fillStyle = '#2b2d44'; x.fillRect(0, 0, w, 12);
      x.fillStyle = '#ff7a45'; x.beginPath(); x.moveTo(10, 18); x.lineTo(32, 32); x.lineTo(54, 18); x.lineTo(54, 25); x.lineTo(32, 39); x.lineTo(10, 25); x.fill();
    });
    const faceTex = K.tex(128, 96, (x, w, h) => {
      x.fillStyle = '#fff'; for (const ex of [0.33, 0.67]) { x.beginPath(); x.ellipse(w * ex, h * 0.46, 8.5, 6.5, 0, 0, 7); x.fill(); }
      x.fillStyle = '#3a2a22'; for (const ex of [0.34, 0.68]) { x.beginPath(); x.arc(w * ex, h * 0.47, 4.3, 0, 7); x.fill(); }
      x.fillStyle = '#fff'; for (const ex of [0.35, 0.69]) { x.beginPath(); x.arc(w * ex, h * 0.45, 1.4, 0, 7); x.fill(); }
      x.strokeStyle = '#3b2416'; x.lineWidth = 3; x.lineCap = 'round';
      x.beginPath(); x.moveTo(w * 0.24, h * 0.3); x.quadraticCurveTo(w * 0.33, h * 0.25, w * 0.42, h * 0.3); x.stroke();
      x.beginPath(); x.moveTo(w * 0.58, h * 0.3); x.quadraticCurveTo(w * 0.67, h * 0.25, w * 0.76, h * 0.3); x.stroke();
      x.strokeStyle = '#8a3b2e'; x.lineWidth = 2.4;
      x.beginPath(); x.moveTo(w * 0.4, h * 0.78); x.quadraticCurveTo(w * 0.5, h * 0.86, w * 0.6, h * 0.78); x.stroke();
      x.fillStyle = 'rgba(255,110,110,.22)'; for (const ex of [0.24, 0.76]) { x.beginPath(); x.ellipse(w * ex, h * 0.64, 8, 5, 0, 0, 7); x.fill(); }
      x.fillStyle = 'rgba(120,60,40,.2)'; x.beginPath(); x.ellipse(w * 0.5, h * 0.62, 3.5, 2.5, 0, 0, 7); x.fill();
    });
    const shirt = M(JERSEYS[0], { roughness: 0.65 }), shirtF = M(JERSEYS[0], { map: numTex, roughness: 0.65 });
    const shortsM = M(0x23213a, { roughness: 0.7 }), skinM = M(0xe0a47c, { roughness: 0.6 }), gloveM = M(0xffffff, { map: gloveTex, roughness: 0.5 }), bootM = M(0x1d1d24, { roughness: 0.35, metalness: 0.1 }), hairM = M(0x3b2416, { roughness: 0.9 }), cuffM = M(C.accent, { roughness: 0.5 });
    const trimM = M(0xf4f4f8, { roughness: 0.55 }), soleM = M(0xf2f2f2, { roughness: 0.6 }), faceM = new THREE.MeshStandardMaterial({ map: faceTex, transparent: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
    const kp = grp(scene, 0, 0, KZ), hips = grp(kp, 0, 0.95, 0);
    const torsoGeo = new THREE.BoxGeometry(0.46, 0.62, 0.26), tpos = torsoGeo.attributes.position;
    for (let i = 0; i < tpos.count; i++) { const y = tpos.getY(i) / 0.31; tpos.setX(i, tpos.getX(i) * (1 + y * 0.07)); tpos.setZ(i, tpos.getZ(i) * (1 + y * 0.03)); }
    torsoGeo.computeVertexNormals();
    const torso = add(torsoGeo, [shirt, shirt, shirt, shirt, shirtF, shirt], 0, 0.35, 0, hips);
    const shortsMesh = add(new THREE.BoxGeometry(0.47, 0.24, 0.28), shortsM, 0, -0.02, 0, hips);
    add(mergeGeo(THREE, [[new THREE.TorusGeometry(0.078, 0.016, 8, 20), 0, 0.655, 0.01, 1, 1, 1, Math.PI / 2]]), trimM, 0, 0, 0, hips, false);
    add(new THREE.BoxGeometry(0.49, 0.035, 0.29), cuffM, 0, 0.1, 0, hips, false);
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), skinM, 0, 0.7, 0, hips);
    const head = add(new THREE.SphereGeometry(0.13, 18, 14), skinM, 0, 0.84, 0, hips);
    add(new THREE.SphereGeometry(0.138, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM, 0, 0.012, -0.012, head);
    add(new THREE.SphereGeometry(0.1345, 16, 8, Math.PI / 2 - 1.05, 2.1, 0, 1.12), hairM, 0, 0.012, 0, head, false);
    add(new THREE.SphereGeometry(0.1325, 20, 12, Math.PI / 2 - 0.9, 1.8, 0.9, 1.2), faceM, 0, 0, 0, head, false);
    add(mergeGeo(THREE, [[new THREE.SphereGeometry(0.03, 8, 6), 0.13, -0.005, 0, 0.6, 1.2, 1], [new THREE.SphereGeometry(0.03, 8, 6), -0.13, -0.005, 0, 0.6, 1.2, 1], [new THREE.SphereGeometry(0.026, 8, 6), 0, -0.02, 0.13, 1, 0.9, 1.1]]), skinM, 0, 0, 0, head, false);
    add(mergeGeo(THREE, [[new THREE.SphereGeometry(0.05, 8, 6), 0, 0.01, -0.1, 1, 0.8, 0.9], [new THREE.SphereGeometry(0.03, 8, 6), 0.09, 0.0, 0.0], [new THREE.SphereGeometry(0.03, 8, 6), -0.09, 0.0, 0.0]]), hairM, 0, 0.05, -0.03, head, false);
    const arms = {}, legs = {};
    const fingerGeo = mergeGeo(THREE, [-0.04, -0.013, 0.013, 0.04].map((x, i) => [new THREE.CylinderGeometry(0.0155, 0.0155, 0.07, 6), x, -0.095 - (i === 1 || i === 2 ? 0.008 : 0), 0.0, 1, 1, 1]).concat([[new THREE.CylinderGeometry(0.0165, 0.0165, 0.07, 6), 0.07, -0.03, 0, 1, 1, 1, 0, 0.5]]));
    const bootGeo = mergeGeo(THREE, [[new THREE.BoxGeometry(0.105, 0.075, 0.2), 0, 0.01, -0.02], [new THREE.SphereGeometry(0.0525, 10, 8), 0, -0.004, 0.1, 1, 0.75, 1.15]]);
    const soleGeo = mergeGeo(THREE, [[new THREE.BoxGeometry(0.108, 0.02, 0.2), 0, -0.037, -0.02], [new THREE.CylinderGeometry(0.0545, 0.0545, 0.02, 12), 0, -0.037, 0.08, 1, 1, 1.15]]);
    const shortLegGeo = new THREE.CylinderGeometry(0.099, 0.094, 0.25, 10), sockBandGeo = new THREE.CylinderGeometry(0.073, 0.07, 0.035, 10), kneeGeo = new THREE.SphereGeometry(0.068, 10, 8), shoulderGeo = new THREE.SphereGeometry(0.075, 10, 8), sleeveGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.03, 10);
    for (const s of [-1, 1]) {
      const sh = grp(hips, s * 0.29, 0.6, 0), upper = add(new THREE.CylinderGeometry(0.065, 0.055, 0.3, 10), shirt, 0, -0.15, 0, sh);
      add(shoulderGeo, shirt, 0, 0, 0, sh, false);
      add(sleeveGeo, cuffM, 0, -0.27, 0, sh, false);
      const el = grp(sh, 0, -0.3, 0), fore = add(new THREE.CylinderGeometry(0.052, 0.045, 0.26, 10), skinM, 0, -0.13, 0, el);
      add(new THREE.BoxGeometry(0.12, 0.05, 0.085), cuffM, 0, -0.26, 0, el);
      const glove = add(new THREE.BoxGeometry(0.13, 0.17, 0.075), gloveM, 0, -0.34, 0, el);
      add(fingerGeo, gloveM, 0, -0.34 - 0.085, 0, el, false);
      arms[s] = { sh, el, upper, fore, glove };
      const hp = grp(hips, s * 0.12, -0.08, 0), thigh = add(new THREE.CylinderGeometry(0.088, 0.072, 0.43, 10), skinM, 0, -0.215, 0, hp);
      add(shortLegGeo, shortsM, 0, 0.09, 0, thigh, false);
      const kn = grp(hp, 0, -0.43, 0), shin = add(new THREE.CylinderGeometry(0.07, 0.055, 0.43, 10), shirt, 0, -0.215, 0, kn);
      add(kneeGeo, skinM, 0, 0, 0, kn, false);
      add(sockBandGeo, trimM, 0, -0.38, 0, kn, false);
      add(new THREE.CylinderGeometry(0.056, 0.058, 0.035, 10), trimM, 0, -0.06, 0, kn, false);
      const boot = add(bootGeo, bootM, 0, -0.46, 0.05, kn);
      add(soleGeo, soleM, 0, 0, 0, boot, false);
      legs[s] = { hp, kn, thigh, shin, boot };
    }
    const KS = [[arms[-1].glove, 0.15, 1], [arms[1].glove, 0.15, 1], [arms[-1].fore, 0.09], [arms[1].fore, 0.09], [arms[-1].upper, 0.09], [arms[1].upper, 0.09], [head, 0.16], [torso, 0.24, 0, 0.14], [torso, 0.24, 0, -0.14], [shortsMesh, 0.2], [legs[-1].thigh, 0.11], [legs[1].thigh, 0.11], [legs[-1].shin, 0.09], [legs[1].shin, 0.09], [legs[-1].boot, 0.1], [legs[1].boot, 0.1]]
      .map(([o, r, g, oy]) => ({ o, r, glove: !!g, off: new V3(0, oy || 0, 0), c: new V3() }));
    const P = { x: 0, y: 0, rot: 0, hip: 0.95, arm: 0.8, elb: 0.55, th: -0.36, kn: 0.62, sp: 0.18 }, IP = Object.assign({}, P);
    function applyPose() {
      kp.position.set(P.x, P.y, KZ); kp.rotation.z = P.rot; hips.position.y = P.hip;
      for (const s of [-1, 1]) {
        arms[s].sh.rotation.z = s * P.arm; arms[s].el.rotation.z = s * P.elb;
        legs[s].hp.rotation.set(P.th, 0, s * P.sp); legs[s].kn.rotation.x = P.kn;
      }
    }
    const dive = { on: false, type: 'dive', t0: 0, dur: 0.5, x0: 0, d: 0, side: 1, th: 0, lift: 0 };
    function keeperPose(t) {
      if (!dive.on) {
        const amp = 0.25 + Math.min(0.15, round * 0.03);
        Object.assign(IP, { x: amp * Math.sin(t * 1.3), y: 0, rot: 0, hip: 0.95 + 0.02 * Math.sin(t * 7), arm: 0.8 + 0.1 * Math.sin(t * 3.4), elb: 0.55, th: -0.36, kn: 0.62, sp: 0.18 });
        for (const k in IP) P[k] += (IP[k] - P[k]) * 0.16;
      } else {
        const u = (shotT - dive.t0) / dive.dur, b = easeOut(clamp(u, 0, 1)), f = smooth(clamp((shotT - dive.t0 - dive.dur - 0.2) / 0.4, 0, 1));
        P.x = dive.x0 + dive.d * b;
        if (dive.type === 'dive') {
          const th = lerp(dive.th, Math.max(dive.th, 1.48), f);
          Object.assign(P, { rot: -dive.side * th * b, y: lerp(dive.lift * Math.sin(b * Math.PI / 2), 0.17, f), hip: lerp(0.95, 1.0, b), arm: lerp(0.8, Math.PI - 0.2, b), elb: lerp(0.55, 0.05, b), th: lerp(-0.36, 0.1, b), kn: lerp(0.62, 0.25, b), sp: lerp(0.18, 0.32, b) });
        } else if (dive.type === 'up') {
          Object.assign(P, { rot: -dive.d * 0.15 * b, y: dive.lift * Math.sin(b * Math.PI / 2) * (1 - f), hip: 1.0, arm: lerp(0.8, Math.PI - 0.15, b), elb: lerp(0.55, 0.05, b), th: lerp(-0.36, 0, b), kn: lerp(0.62, 0.15, b), sp: 0.12 });
        } else if (dive.type === 'block') {
          Object.assign(P, { rot: 0, y: 0, hip: lerp(0.95, 0.7, b), arm: lerp(0.8, 1.3, b), elb: lerp(0.55, 0.1, b), th: lerp(-0.36, -0.9, b), kn: lerp(0.62, 1.5, b), sp: lerp(0.18, 0.45, b) });
        } else {
          Object.assign(P, { rot: 0, y: 0, hip: 0.95, arm: 0.8, elb: 0.55, th: -0.36, kn: 0.62, sp: 0.18 });
        }
      }
      applyPose();
    }
    function updSpheres() { kp.updateMatrixWorld(true); for (const s of KS) s.c.copy(s.off).applyMatrix4(s.o.matrixWorld); }
    const setJersey = r => { const c = JERSEYS[(r - 1) % JERSEYS.length]; shirt.color.setHex(c); shirtF.color.setHex(c); };


    const ringM = M(0xffc84a, { emissive: 0xff9a1f, emissiveIntensity: 0.65, roughness: 0.3, metalness: 0.4 }), ringGeo = new THREE.TorusGeometry(0.44, 0.045, 10, 40);
    const rings = [0, 1].map(() => { const m = add(ringGeo, ringM, 0, 1, GZ); m.visible = false; return { m, on: false, x: 0, y: 0 }; });
    const SPOTS = [[-1, 1], [1, 1], [-1, 0], [1, 0]];
    function setRings() {
      const sp = SPOTS.slice().sort(() => Math.random() - 0.5), n = round >= 3 ? 2 : 1;
      rings.forEach((r, i) => {
        r.on = i < n;
        r.m.visible = r.on;
        if (!r.on) return;
        r.x = sp[i][0] * (GW - 0.62); r.y = sp[i][1] ? GH - 0.58 : 0.62;
        r.m.position.set(r.x, r.y, GZ);
      });
    }


    const retM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, depthTest: false });
    const ret = new THREE.Group(), retArrow = new THREE.Mesh(new THREE.CircleGeometry(0.11, 3), retM);
    [new THREE.Mesh(new THREE.RingGeometry(0.26, 0.32, 40), retM), new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), retM), retArrow].forEach(m => { m.renderOrder = 10; ret.add(m); });
    scene.add(ret);


    const TRN = 26, trail = new THREE.InstancedMesh(new THREE.SphereGeometry(BR * 0.75, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false }), TRN);
    trail.frustumCulled = false; scene.add(trail);
    const trP = Array.from({ length: TRN }, () => new V3());
    let trN = 0, trK = 0, trAcc = 0;
    const chips = particles(THREE, scene, 420, new THREE.BoxGeometry(1, 0.25, 1.3), M(0xffffff, { roughness: 0.6, side: THREE.DoubleSide }));


    let round = 1, score = 0, st = 'intro', shotN = 0, goalsR = 0, res = [], goals = 0, shotsTot = 0, ringsHit = 0, skill = null;
    let shotT = 0, resT = 0, inGoal = false, crossed = false, touched = false, caught = false, postHit = 0, shot = null;
    let kbMode = false, aimX = 0, aimY = 1.3, curl = 0, charging = false, chargeT = 0, power = 0, path = null, pid = null;
    const ringHits = [], plan = { guess: false, gx: 0, gy: 0 };
    const bp = new V3(0, BR, 0), bv = new V3(), bw = new V3(), tv = new V3(), tmp = new V3(), acc = new V3(), cross = new V3(), sp0 = new V3(), sv0 = new V3(), sw0 = new V3(), axis = new V3(), tq = new THREE.Quaternion(), pv = new V3();
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const skillFor = r => { const l = r - 1; return { react: Math.max(0.14, 0.3 - l * 0.03), dur: Math.max(0.34, 0.5 - l * 0.03), reach: Math.min(1.6, 0.95 + l * 0.12), lift: Math.min(1.1, 0.7 + l * 0.08), noise: Math.max(0.2, 0.55 - l * 0.07), read: Math.min(0.75, l * 0.14), guess: Math.min(0.32, l * 0.07), catchV: 15 + l * 1.5 }; };
    skill = skillFor(1);

    const sw = ui.el('sw', '<svg viewBox="0 0 960 600" preserveAspectRatio="none"><polyline points=""/></svg>'), poly = sw.querySelector('polyline');
    const hR = ui.el('pill tl'), hD = ui.el('pill tc dots', '<i></i>'.repeat(5)), hS = ui.el('pill tr'), hint = ui.el('hint'), pw = ui.el('pw', '<i></i><s></s>');
    hud();
    function hud() { hR.innerHTML = `<small>Round</small><b>${round}</b>`; hS.innerHTML = `<small>Score</small><b>${score}</b>`; }
    function updDots() { [...hD.children].forEach((e, i) => { e.className = i < res.length ? (res[i] ? 'g' : 'x') : i === res.length && st !== 'over' && st !== 'intro' ? 'c' : ''; }); }

    const FRAME = [[-GW - PR, 0, -GW - PR, GH + PR], [GW + PR, 0, GW + PR, GH + PR], [-GW - PR, GH + PR, GW + PR, GH + PR]].map(([x0, y0, x1, y1]) => {
      const a = new V3(x0, y0, GZ), dd = new V3(x1 - x0, y1 - y0, 0);
      return { a, d: dd, l2: dd.lengthSq() };
    });

    function integrate(p, v, w, h) {
      const s = v.length();
      acc.set(-KD * s * v.x + KM * (w.y * v.z - w.z * v.y), -KD * s * v.y + KM * (w.z * v.x - w.x * v.z) - G, -KD * s * v.z + KM * (w.x * v.y - w.y * v.x));
      v.addScaledVector(acc, h); p.addScaledVector(v, h); w.multiplyScalar(1 - 0.2 * h);
    }
    function solve(tx, ty, S, w) {
      let ax = tx, ay = ty;
      for (let k = 0; k < 6; k++) {
        sv0.set(ax, ay - BR, GZ).normalize().multiplyScalar(S);
        sp0.set(0, BR, 0); tv.copy(sv0); sw0.copy(w);
        let i = 0;
        while (sp0.z > GZ && i++ < 900) integrate(sp0, tv, sw0, 1 / 240);
        ax += tx - sp0.x; ay += ty - sp0.y;
      }
      return sv0.set(ax, ay - BR, GZ).normalize().multiplyScalar(S);
    }
    function hitSeg(s) {
      tv.subVectors(bp, s.a);
      tmp.copy(s.a).addScaledVector(s.d, clamp(tv.dot(s.d) / s.l2, 0, 1));
      tv.subVectors(bp, tmp);
      const dd = tv.length(), m = BR + PR;
      if (dd >= m || dd < 1e-6) return;
      tv.multiplyScalar(1 / dd); bp.copy(tmp).addScaledVector(tv, m);
      const vn = bv.dot(tv);
      if (vn >= 0) return;
      bv.addScaledVector(tv, -1.6 * vn); bw.multiplyScalar(0.5);
      if (-vn > 2 && st === 'flight') {
        postHit++; api.sfx('hit'); shake = 0.3;
        for (let i = 0; i < 12; i++) chips.spawn(bp, rnd(-2, 2), rnd(0, 3), rnd(-1, 2), '#ffffff', rnd(0.4, 0.8), rnd(0.02, 0.04));
      }
    }
    function physStep(h, live) {
      const pz = bp.z;
      integrate(bp, bv, bw, h);
      if (bp.y < BR) {
        bp.y = BR;
        if (bv.y < 0) bv.y = bv.y < -1 ? -bv.y * 0.5 : 0;
        bv.x *= 1 - 1.6 * h; bv.z *= 1 - 1.6 * h; bw.multiplyScalar(1 - 4 * h);
      }
      for (const s of FRAME) hitSeg(s);
      if (pz > GZ && bp.z <= GZ) {
        cross.copy(bp); crossed = true;
        if (live) for (const r of rings) if (r.on && Math.hypot(bp.x - r.x, bp.y - r.y) < 0.4) ringHits.push(r);
        if (Math.abs(bp.x) < GW && bp.y < GH) inGoal = true;
        else if (live) resolve('miss');
      }
      if (inGoal && bp.z > GZ) inGoal = false;
      if (inGoal) {
        if (live && bp.z < GZ - BR) resolve('goal');
        const bz = lerp(GZ - ND, GZ - NT, clamp(bp.y / GH, 0, 1)) + BR;
        if (bp.z < bz) { bp.z = bz; if (bv.z < -1.5) netHit(bp, -bv.z); if (bv.z < 0) { bv.z *= -0.12; bv.x *= 0.45; bv.y *= 0.6; } }
        if (bp.x < -GW + BR) { bp.x = -GW + BR; bv.x = Math.abs(bv.x) * 0.2; } else if (bp.x > GW - BR) { bp.x = GW - BR; bv.x = -Math.abs(bv.x) * 0.2; }
        if (bp.y > GH - BR) { bp.y = GH - BR; if (bv.y > 0) bv.y *= -0.2; }
      } else if (pz >= GZ - 4.9 + BR && bp.z < GZ - 4.9 + BR && bp.y < 0.95 && Math.abs(bp.x) < 34) { bp.z = GZ - 4.9 + BR; bv.z *= -0.35; bv.x *= 0.6; }
    }
    function keeperHit() {
      for (const s of KS) {
        tv.subVectors(bp, s.c);
        const dd = tv.length(), m = BR + s.r;
        if (dd >= m || dd < 1e-6) continue;
        tv.multiplyScalar(1 / dd);
        const vn = bv.dot(tv);
        if (vn >= 0) continue;
        bp.copy(s.c).addScaledVector(tv, m);
        const b = dive.on ? clamp((shotT - dive.t0) / dive.dur, 0, 1) : 0;
        if (s.glove && bv.length() < skill.catchV && b > 0.55) { caught = true; bv.set(0, 0, 0); bw.set(0, 0, 0); resolve('save'); return; }
        bv.addScaledVector(tv, -1.5 * vn).multiplyScalar(0.62); bv.x += rnd(-1, 1); bv.y += rnd(0.5, 2);
        bw.multiplyScalar(0.3); touched = true; api.sfx('hit'); shake = 0.15;
        for (let i = 0; i < 8; i++) chips.spawn(bp, rnd(-2, 2), rnd(0, 2.5), rnd(0, 2), '#ffffff', rnd(0.3, 0.6), rnd(0.015, 0.03));
        if (bv.z > -2) resolve('save');
        return;
      }
    }
    function startDive(tx, ty, type) {
      const x0 = P.x, dx = tx - x0, D = Math.abs(dx), side = dx < 0 ? -1 : 1;
      Object.assign(dive, { on: true, t0: shotT, x0, side, type: type || 'dive', dur: skill.dur, th: 0, lift: 0 });
      if (type === 'watch') { dive.d = clamp(dx, -0.4, 0.4); return; }
      if (D < 0.6) {
        dive.d = dx;
        if (ty > 1.6) { dive.type = 'up'; dive.lift = clamp(ty - L, 0, skill.lift * 0.6); } else dive.type = 'block';
        return;
      }
      const th = clamp(Math.atan2(D, Math.max(0.15, ty - 0.2)), 0.3, 1.5);
      dive.th = th;
      dive.d = side * clamp(D - L * Math.sin(th), 0, skill.reach);
      dive.lift = clamp(ty - L * Math.cos(th), 0.15 * Math.sin(th), skill.lift);
    }
    function think() {
      if (dive.on) return;
      if (plan.guess && shotT >= 0.05) return startDive(plan.gx, plan.gy);
      if (shotT < skill.react) return;
      const tc = Math.max(0.01, (bp.z - GZ) / Math.max(1, -bv.z));
      let px = bp.x + bv.x * tc, py = bp.y + bv.y * tc - 0.5 * G * tc * tc;
      px = lerp(px, shot.tx, skill.read) + gauss() * skill.noise;
      py = lerp(py, shot.ty, skill.read) + gauss() * skill.noise * 0.6;
      if (Math.abs(px) > GW + 0.6 || py > GH + 0.6) return startDive(clamp(px, -1, 1) * 0.3, 1, 'watch');
      startDive(clamp(px, -GW - 0.2, GW + 0.2), clamp(py, 0.15, GH + 0.2));
    }

    function newShot() {
      st = 'aim';
      bp.set(0, BR, 0); bv.set(0, 0, 0); bw.set(0, 0, 0); ball.visible = true;
      inGoal = crossed = touched = caught = false; postHit = 0; shotT = 0; dive.on = false; trN = 0;
      ringHits.length = 0;
      setRings(); updDots();
      hint.textContent = round === 1 && shotN < 2 ? (coarse ? 'Swipe from the ball to the goal · curve the swipe to bend it' : 'Swipe from the ball to the goal, or aim with arrows and hold Space') : '';
    }
    function kick(tx, ty, pw0, c) {
      if (st !== 'aim') return;
      const S = 17 + pw0 * 15, sig = 0.07 + Math.max(0, pw0 - 0.6) * 1.15;
      tx += gauss() * sig; ty = Math.max(0.15, ty + gauss() * sig * 0.75);
      bw.set(0, c * WMAX, 0);
      bv.copy(solve(tx, ty, S, bw)); bp.set(0, BR, 0);
      shot = { tx, ty, S, c };
      plan.guess = Math.random() < skill.guess; plan.gx = (Math.random() < 0.5 ? -1 : 1) * rnd(1.4, 3.2); plan.gy = rnd(0.3, 2);
      st = 'flight'; shotT = 0; shotN++; shotsTot++;
      api.sfx('tap'); shake = 0.06; hint.textContent = '';
      for (let i = 0; i < 16; i++) chips.spawn(bp, rnd(-1.4, 1.4), rnd(1, 3.2), rnd(-0.5, 1.6), pick(['#3d9a3f', '#5bb553', '#2f7d33', '#7cc867']), rnd(0.5, 0.9), rnd(0.03, 0.05));
    }
    function resolve(kind) {
      if (st !== 'flight') return;
      st = 'result'; resT = 0;
      const ok = kind === 'goal';
      res.push(ok);
      let pts = 0, label, sub = '', color = '#fff';
      tmp.copy(bp).project(cam);
      const sx = (tmp.x + 1) * 50, sy = (1 - tmp.y) * 50;
      if (ok) {
        goals++; goalsR++; pts = 100;
        const bonus = [];
        for (const r of ringHits) { pts += 150; ringsHit++; bonus.push('Ring +150'); r.on = false; r.m.visible = false; for (let i = 0; i < 26; i++) chips.spawn(r.m.position, rnd(-3, 3), rnd(-1, 4), rnd(-2, 2), pick(['#ffc84a', '#ffe08a', '#ff9a1f']), rnd(0.6, 1.1), rnd(0.03, 0.06), 6); }
        if (Math.abs(cross.x) > GW - 0.9 && cross.y > GH - 0.75) { pts += 50; bonus.push('Top corner +50'); }
        if (Math.abs(shot.c) > 0.55) { pts += 25; bonus.push('Curler +25'); }
        if (postHit) { pts += 25; bonus.push('In off the post +25'); }
        if (shot.S > 29) { pts += 25; bonus.push('Rocket +25'); }
        label = 'GOAL!'; sub = bonus.join(' · ');
        exc = 1; shake = Math.max(shake, 0.12); api.sfx('good');
        for (let i = 0; i < 140; i++) tmp.set(rnd(-6, 6), rnd(3, 5.5), GZ - rnd(1, 3)), chips.spawn(tmp, rnd(-2, 2), rnd(0, 3), rnd(0, 3), pick(api.colors.hues), rnd(2, 3.4), rnd(0.06, 0.09), 1.6, 1.4);
      } else if (kind === 'save') {
        label = caught ? 'CAUGHT!' : 'SAVED!'; color = '#ffe08a'; exc = 0.35; api.sfx('bad');
      } else {
        label = postHit ? 'POST!' : !crossed ? 'MISSED!' : cross.y >= GH ? 'OVER!' : 'WIDE!'; color = '#ffd0d0'; exc = 0.2; api.sfx('bad');
      }
      score += pts; hud(); api.score(score);
      ui.banner(label, sub, color);
      if (pts) ui.pop('+' + pts, clamp(sx, 8, 92), clamp(sy, 15, 85), '#ffe08a');
      updDots();
    }
    function afterShot() {
      if (shotN - goalsR > 2) return gameOver();
      if (shotN >= 5) {
        round++; shotN = 0; goalsR = 0; res = []; skill = skillFor(round); setJersey(round); hud();
        ui.banner('Round ' + round, 'The keeper gets sharper', '#ffe08a'); api.sfx('win');
      }
      newShot();
    }
    function gameOver() {
      st = 'over'; updDots(); ret.visible = false;
      const nb = api.submit(score);
      api.sfx('lose');
      api.overlay({ kicker: nb ? 'New best!' : '3D', title: 'Full time', text: `You reached round ${round}. Score 3 of 5 to beat each round.`, stats: [['Score', score], ['Goals', goals + '/' + shotsTot], ['Round', round], ['Rings', ringsHit]], button: 'Play again', onAction: reset });
    }
    function reset() {
      round = 1; score = 0; shotN = goalsR = goals = shotsTot = ringsHit = 0; res = []; skill = skillFor(1); setJersey(1);
      hud(); api.score(0); newShot();
    }


    const screenY = y => { tmp.set(0, y, GZ).project(cam); return (1 - tmp.y) * 300; };
    function unproject(px, py, out) {
      ndc.set(px / 480 - 1, 1 - py / 300); ray.setFromCamera(ndc, cam);
      const o = ray.ray.origin, dd = ray.ray.direction, k = (GZ - o.z) / Math.min(-1e-3, dd.z);
      return out.set(o.x + dd.x * k, o.y + dd.y * k, GZ);
    }
    function swipeShot(p) {
      const s = p[0], e = p[p.length - 1], dx = e.x - s.x, dy = e.y - s.y, len = Math.hypot(dx, dy);
      if (len < 40 || dy > -25) return;
      let j = p.length - 1;
      while (j > 0 && e.t - p[j - 1].t < 120) j--;
      if (j === p.length - 1 && j > 0) j--;
      const q = p[j], fl = Math.hypot(e.x - q.x, e.y - q.y) / 600, ft = Math.max(16, e.t - q.t) / 1000;
      const pw0 = clamp((fl / ft - 0.8) / 3.2, 0, 1);
      let dev = 0;
      for (const r of p) { const c = (dx * (r.y - s.y) - dy * (r.x - s.x)) / len; if (Math.abs(c) > Math.abs(dev)) dev = c; }
      const c = Math.abs(dev / len) < 0.05 ? 0 : clamp(dev / len * 3.2, -1, 1);
      const yb = screenY(0), yt = screenY(GH), minY = yb - (yb - yt) * 0.15;
      let ex = e.x, ey = e.y;
      if (ey > minY) { const k = (minY - s.y) / dy; ex = s.x + dx * k; ey = minY; }
      unproject(ex, ey, pv);
      kick(clamp(pv.x, -9, 9), clamp(pv.y, 0.2, 5), pw0, c);
    }
    const drawSwipe = () => poly.setAttribute('points', path.map(q => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' '));
    function release() { const p = path; path = null; sw.classList.add('fade'); if (p && p.length > 1) swipeShot(p); }
    api.on(canvas, 'pointerdown', e => {
      if (st !== 'aim' || charging) return;
      e.preventDefault();
      kbMode = false;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      const l = gl.toLocal(e);
      path = [{ x: l.x, y: l.y, t: e.timeStamp }]; pid = e.pointerId;
      sw.classList.remove('fade'); drawSwipe();
    });
    api.on(canvas, 'pointermove', e => {
      if (!path || e.pointerId !== pid) return;
      const l = gl.toLocal(e), last = path[path.length - 1];
      if (Math.hypot(l.x - last.x, l.y - last.y) < 3) return;
      path.push({ x: l.x, y: l.y, t: e.timeStamp }); drawSwipe();
      if (l.y < 4) release();
    });
    api.on(canvas, 'pointerup', e => {
      if (!path || e.pointerId !== pid) return;
      const l = gl.toLocal(e);
      path.push({ x: l.x, y: l.y, t: e.timeStamp });
      release();
    });
    api.on(canvas, 'pointercancel', () => { path = null; sw.classList.add('fade'); });


    api.on(window, 'keydown', e => {
      if (st !== 'aim') return;
      if (e.code === 'Space') { e.preventDefault(); if (!e.repeat && !charging && !path) { charging = true; chargeT = 0; power = 0; kbMode = true; } }
      else if (e.code === 'KeyA' || e.code === 'KeyD') { curl = clamp(curl + (e.code === 'KeyA' ? 0.5 : -0.5), -1, 1); kbMode = true; }
      else if (e.code.startsWith('Arrow')) kbMode = true;
    });
    api.on(window, 'keyup', e => {
      if (e.code !== 'Space' || !charging) return;
      charging = false; pw.classList.remove('on');
      if (st === 'aim') kick(aimX, aimY, power, curl);
    });

    newShot(); st = 'intro'; updDots();
    api.overlay({ kicker: '3D', title: 'Penalty Kick', text: 'Swipe from the ball toward the goal: a faster swipe is a harder shot, a curved swipe bends the ball. Score 3 of 5 to beat each round, and thread the gold rings for bonus points.', button: 'Play', onAction: reset });

    api.loop((dt, now) => {
      const t = now / 1000;
      if (st === 'aim') {
        aimX = clamp(aimX + ((keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)) * 3.2 * dt, -GW - 0.8, GW + 0.8);
        aimY = clamp(aimY + ((keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)) * 2.4 * dt, 0.2, GH + 0.8);
        if (charging) { chargeT += dt; const u = chargeT / 0.95 % 2; power = u < 1 ? u : 2 - u; }
        keeperPose(t);
      } else if (st === 'flight') {
        const n = Math.max(4, Math.ceil(dt * 300)), h = dt / n;
        for (let i = 0; i < n && st === 'flight'; i++) {
          shotT += h; think(); keeperPose(t); updSpheres(); physStep(h, true);
          if (st === 'flight' && !caught) keeperHit();
          if (st === 'flight' && (shotT > 3 || bp.z > 8 || (postHit && !inGoal && bv.z > 0.5) || (bp.y <= BR + 1e-3 && bv.lengthSq() < 0.3))) resolve(touched ? 'save' : 'miss');
        }
      } else if (st === 'result') {
        resT += dt; shotT += dt; keeperPose(t);
        if (caught) { kp.updateMatrixWorld(true); arms[-1].glove.getWorldPosition(tv); arms[1].glove.getWorldPosition(tmp); bp.addVectors(tv, tmp).multiplyScalar(0.5); bp.z += 0.12; }
        else if (ball.visible) { const n = Math.max(4, Math.ceil(dt * 300)), h = dt / n; for (let i = 0; i < n; i++) physStep(h, false); if (bp.z < -19 || bp.z > 12) ball.visible = false; }
        if (resT > 1.9) afterShot();
      } else keeperPose(t);


      ball.position.copy(bp);
      if (st === 'flight' || st === 'result') {
        const k = bp.y <= BR + 0.01 ? 1 / BR : 0.3 / BR;
        axis.set(bv.z * k + bw.x, bw.y, -bv.x * k + bw.z);
        const a = axis.length();
        if (a > 1e-4 && !caught) ball.quaternion.premultiply(tq.setFromAxisAngle(axis.multiplyScalar(1 / a), a * dt));
        trAcc += dt;
        if (st === 'flight' && trAcc > 0.012) { trAcc = 0; trP[trK].copy(bp); trK = (trK + 1) % TRN; trN = Math.min(TRN, trN + 1); }
        if (st === 'result' && trAcc > 0.03) { trAcc = 0; trN = Math.max(0, trN - 1); }
      }
      for (let i = 0; i < TRN; i++) {
        const j = (trK - 1 - i + TRN * 2) % TRN;
        d.position.copy(trP[j]); d.rotation.set(0, 0, 0); d.scale.setScalar(i < trN && st !== 'aim' ? 1 - i / TRN : 0); d.updateMatrix();
        trail.setMatrixAt(i, d.matrix);
      }
      trail.instanceMatrix.needsUpdate = true;

      exc = lerp(exc, 0.12, damp(0.7, dt));
      crowd(t);
      netUpdate(dt);
      chips.update(dt);
      rings.forEach((r, i) => { if (r.on) { r.m.rotation.y = Math.sin(t * 2 + i) * 0.35; r.m.scale.setScalar(1 + 0.05 * Math.sin(t * 6 + i)); } });
      ret.visible = st === 'aim' && kbMode;
      if (ret.visible) {
        ret.position.set(aimX, aimY, GZ + 0.05);
        retArrow.visible = curl !== 0;
        retArrow.position.set(curl < 0 ? 0.48 : -0.48, 0, 0);
        retArrow.rotation.z = curl < 0 ? 0 : Math.PI;
        retArrow.scale.setScalar(0.8 + Math.abs(curl) * 0.5);
      }
      pw.classList.toggle('on', charging);
      if (charging) pw.style.setProperty('--p', (power * 100).toFixed(1) + '%');


      if (st === 'flight' || st === 'result') {
        camT.set(bp.x * 0.28, 1.45 + Math.max(0, bp.y - 1.2) * 0.25, clamp(bp.z + 7, GZ + 7.5, CAM0.z));
        lookT.set(bp.x * 0.5, lerp(LOOK0.y, bp.y, 0.4), Math.min(lerp(LOOK0.z, bp.z, 0.3), camT.z - 4));
      } else {
        camT.set(CAM0.x + Math.sin(t * 0.4) * 0.05, CAM0.y + Math.sin(t * 0.6) * 0.025, CAM0.z);
        lookT.copy(LOOK0);
      }
      const ck = st === 'aim' ? 4.5 : 2.6;
      camPos.lerp(camT, damp(ck, dt)); camLook.lerp(lookT, damp(ck + 1, dt));
      shake *= Math.exp(-6 * dt);
      cam.position.copy(camPos); cam.position.x += rnd(-1, 1) * shake * 0.3; cam.position.y += rnd(-1, 1) * shake * 0.3;
      cam.lookAt(camLook);
      renderer.render(scene, cam);
    });

    return () => K.dispose(scene);
  }

  Ameplay.register({
    id: 'penalty-3d',
    title: 'Penalty Kick',
    category: '3D',
    blurb: 'Bend it past a sharper keeper. Score 3 of 5 to advance.',
    help: 'Swipe from the ball to the goal (faster = harder, curve the swipe to bend it) · or <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> aim, <kbd>A</kbd> <kbd>D</kbd> curl, hold and release <kbd>Space</kbd> to shoot',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 46V14h50v32"/><path d="M7 14l7 7h36l7-7M14 21v25M50 21v25M24 21v25M32 21v25M40 21v25" opacity=".4"/><circle cx="32" cy="48" r="8"/><path d="M28.5 45l3.5-2 3.5 2-1.3 4h-4.4z"/></svg>',
    css: css3d('penalty-3d') + `
.gm-penalty-3d .dots{gap:7px;padding:9px 13px}
.gm-penalty-3d .dots i{width:13px;height:13px;border-radius:50%;background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 2px rgba(255,255,255,.55)}
.gm-penalty-3d .dots i.g{background:#22b07d;box-shadow:inset 0 0 0 2px rgba(255,255,255,.85)}
.gm-penalty-3d .dots i.x{background:#ef4f4f;box-shadow:inset 0 0 0 2px rgba(255,255,255,.85)}
.gm-penalty-3d .dots i.c{background:#fff;animation:penalty-3d-blink 1s ease-in-out infinite}
@keyframes penalty-3d-blink{50%{transform:scale(.72);opacity:.65}}
.gm-penalty-3d .pw{position:absolute;right:16px;top:50%;width:16px;height:46%;transform:translateY(-50%);border-radius:999px;background:rgba(16,18,36,.45);box-shadow:inset 0 0 0 2px rgba(255,255,255,.55);overflow:hidden;opacity:0}
.gm-penalty-3d .pw.on{opacity:1}
.gm-penalty-3d .pw i{position:absolute;inset:0;background:linear-gradient(to top,#22b07d,#9be15d 45%,#ffc84a 64%,#ef4f4f 88%);clip-path:inset(calc(100% - var(--p,0%)) 0 0 0)}
.gm-penalty-3d .pw s{position:absolute;left:0;right:0;bottom:60%;height:2px;background:#fff}
.gm-penalty-3d .sw{position:absolute;inset:0}
.gm-penalty-3d .sw svg{display:block;width:100%;height:100%}
.gm-penalty-3d .sw polyline{fill:none;stroke:#fff;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;opacity:.9;vector-effect:non-scaling-stroke}
.gm-penalty-3d .sw.fade polyline{opacity:0;transition:opacity .45s}
`,
    mount(root, api) { return boot(api, gl => penalty(root, api, gl)); }
  });



  function range(root, api, gl) {
    const { THREE, renderer, canvas } = gl, V3 = THREE.Vector3;
    const K = kit(THREE), ui = makeUi(api, root, canvas), keys = api.keys;
    const fine = matchMedia('(pointer: fine)').matches, lockable = 'requestPointerLock' in canvas;
    renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xdde7ee, 80, 300);
    skyDome(THREE, K, scene, '#4a93df', '#d7eaf8', '#e9ddc8', 16);
    const cam = new THREE.PerspectiveCamera(55, 1.6, 0.03, 600);
    cam.rotation.order = 'YXZ'; cam.position.set(0, 1.6, 0); scene.add(cam);
    scene.add(new THREE.HemisphereLight(0xdcecff, 0xc9a873, 0.85));
    const sun = new THREE.DirectionalLight(0xfff0d6, 1.65);
    sun.position.set(-14, 26, 12); sun.target.position.set(0, 0, -16);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 2, far: 95 });
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sun, sun.target);

    const d = new THREE.Object3D(), col = new THREE.Color(), env = [];
    const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85 }, o));
    const add = (geo, mat, x, y, z, o = {}) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true;
      (o.parent || scene).add(m);
      if (o.fx) { m.userData.fx = o.fx; env.push(m); }
      return m;
    };
    const SAND = '#d4b585', WOOD = '#7a5636';

    const sandTex = K.tex(512, 512, (x, w, h) => {
      x.fillStyle = '#d8ba8c'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        const px = Math.random() * w, py = Math.random() * h, r = rnd(30, 90), dark = Math.random() < 0.5;
        const g = x.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, dark ? 'rgba(150,110,60,.16)' : 'rgba(255,240,210,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
      }
      for (let i = 0; i < 30000; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(120,88,48,.2)' : 'rgba(255,246,222,.25)'; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
      for (let i = 0; i < 260; i++) {
        const px = Math.random() * w, py = Math.random() * h, r = rnd(1, 3);
        x.fillStyle = pick(['#a58a66', '#8f7a63', '#b9a083']); x.beginPath(); x.ellipse(px, py, r * 1.3, r, rnd(0, 3), 0, 7); x.fill();
        x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(px - r * 0.5, py - r * 0.6, r * 0.6, r * 0.4);
      }
    }, [80, 80]);
    add(new THREE.PlaneGeometry(600, 600), M(0xffffff, { map: sandTex, roughness: 1 }), 0, 0, 0, { cast: false, fx: SAND }).rotation.x = -Math.PI / 2;

    const plankTex = K.tex(512, 256, (x, w, h) => {
      const n = 8, pw = w / n;
      for (let i = 0; i < n; i++) {
        x.fillStyle = `hsl(${rnd(24, 32)},${rnd(38, 52)}%,${rnd(38, 50)}%)`; x.fillRect(i * pw, 0, pw, h);
        for (let k = 0; k < 18; k++) {
          const gx = i * pw + rnd(3, pw - 3);
          x.strokeStyle = `rgba(70,40,15,${rnd(0.08, 0.22)})`; x.lineWidth = rnd(0.6, 1.6);
          x.beginPath(); x.moveTo(gx, 0); x.bezierCurveTo(gx + rnd(-6, 6), h * 0.3, gx + rnd(-6, 6), h * 0.7, gx + rnd(-3, 3), h); x.stroke();
        }
        x.fillStyle = 'rgba(40,20,8,.55)'; x.fillRect(i * pw, 0, 2.5, h);
        x.fillStyle = 'rgba(255,240,210,.14)'; x.fillRect(i * pw + 2.5, 0, 2, h);
        x.fillStyle = '#3b2b1e'; for (const ny of [18, h - 18]) { x.beginPath(); x.arc(i * pw + pw / 2, ny, 2.2, 0, 7); x.fill(); }
      }
    }, [1, 1]);
    const woodM = M(0xffffff, { map: plankTex }), darkWoodM = M(0x6b4a2f, { roughness: 0.9 }), steelM = M(0x7d848f, { roughness: 0.35, metalness: 0.7 }), concreteM = M(0xa7a9ad, { roughness: 0.95 });


    const postGeo = new THREE.BoxGeometry(0.3, 3.3, 0.3);
    const postList = [];
    for (const s of [-1, 1]) {
      add(uvScale(new THREE.BoxGeometry(0.3, 3, 48), 23, 1), woodM, s * 17, 1.5, -22, { fx: WOOD });
      for (let z = 1; z > -46; z -= 4) postList.push([postGeo, s * 16.8, 1.65, z]);
    }
    add(mergeGeo(THREE, postList), darkWoodM, 0, 0, 0, { fx: WOOD });
    const flagShape = new THREE.Shape();
    flagShape.moveTo(-0.17, 0); flagShape.lineTo(0.17, 0); flagShape.lineTo(0, -0.4); flagShape.closePath();
    const NF = 44, flags = new THREE.InstancedMesh(new THREE.ShapeGeometry(flagShape), M(0xffffff, { roughness: 0.8, side: THREE.DoubleSide }), NF), strPos = [];
    let fi = 0;
    for (const s of [-1, 1]) for (let i = 0; i < 22; i++) {
      const z = 0.5 - i * 2.1, sag = 0.16 * Math.sin(((i % 2) ? 0.75 : 0.25) * Math.PI), y = 3.12 - sag * 0.6;
      d.position.set(s * 16.62, y, z); d.rotation.set(0, Math.PI / 2, rnd(-0.12, 0.12)); d.scale.setScalar(1); d.updateMatrix();
      flags.setMatrixAt(fi, d.matrix); flags.setColorAt(fi++, col.set(pick(['#ef4f4f', '#ffc93f', '#3d8bfd', '#f6f2e6', '#22b07d', '#ff7a45'])));
      strPos.push(s * 16.62, 3.15 - sag * 0.2, z + 1.05, s * 16.62, 3.15 - sag * 0.2, z - 1.05);
    }
    scene.add(flags);
    const strGeo = new THREE.BufferGeometry();
    strGeo.setAttribute('position', new THREE.Float32BufferAttribute(strPos, 3));
    scene.add(new THREE.LineSegments(strGeo, new THREE.LineBasicMaterial({ color: 0x3b2b1e })));
    add(new THREE.SphereGeometry(1, 48, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0xb89a70, { map: sandTex, roughness: 1 }), 0, 0, -50, { fx: SAND }).scale.set(36, 7.5, 9);
    const hillGeo = new THREE.IcosahedronGeometry(1, 3), hp = hillGeo.attributes.position, hv = new V3();
    for (let i = 0; i < hp.count; i++) { hv.fromBufferAttribute(hp, i); const f = 1 + 0.08 * Math.sin(hv.x * 5.1 + hv.z * 2.3) + 0.06 * Math.cos(hv.z * 6.7 - hv.y * 3.1); hp.setXYZ(i, hv.x * f, hv.y * f, hv.z * f); }
    hillGeo.computeVertexNormals();
    const hills = new THREE.InstancedMesh(hillGeo, M(0xffffff, { roughness: 1, flatShading: true }), 9);
    for (let i = 0; i < 9; i++) {
      d.position.set(lerp(-180, 180, i / 8) + rnd(-15, 15), -rnd(4, 10), rnd(-125, -180)); d.rotation.set(0, rnd(0, 6), 0); d.scale.set(rnd(34, 58), rnd(18, 32), rnd(24, 36)); d.updateMatrix();
      hills.setMatrixAt(i, d.matrix); hills.setColorAt(i, col.set(pick(['#7fb35b', '#6da24f', '#93bd68', '#a3a865', '#86ad5e'])));
    }
    scene.add(hills);
    const coneGeo = new THREE.ConeGeometry(1, 1, 7), trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1, 6);
    coneGeo.translate(0, 0.5, 0); trunkGeo.translate(0, 0.5, 0);
    const NT = 36, trees = new THREE.InstancedMesh(coneGeo, M(0xffffff, { flatShading: true }), NT), trunks = new THREE.InstancedMesh(trunkGeo, darkWoodM, NT);
    for (let i = 0; i < NT; i++) {
      const x = (i % 2 ? 1 : -1) * rnd(19.5, 50), z = rnd(6, -80), h = rnd(4.5, 9), r = h * rnd(0.26, 0.34);
      d.rotation.set(0, rnd(0, 6), 0);
      d.position.set(x, 0, z); d.scale.set(1, h * 0.3, 1); d.updateMatrix(); trunks.setMatrixAt(i, d.matrix);
      d.position.set(x, h * 0.25, z); d.scale.set(r, h * 0.8, r); d.updateMatrix(); trees.setMatrixAt(i, d.matrix);
      trees.setColorAt(i, col.set(pick(['#3f7d3a', '#4b8f45', '#356b35', '#5a9a4a'])));
    }
    trees.castShadow = trunks.castShadow = true;
    scene.add(trees, trunks);


    add(uvScale(new THREE.BoxGeometry(2.8, 0.08, 0.7), 2, 0.3), woodM, 0, 1.08, -0.75, { fx: WOOD });
    add(uvScale(new THREE.BoxGeometry(2.8, 1.04, 0.06), 2, 1), woodM, 0, 0.52, -1.08, { fx: WOOD });
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.14, 2.8, 0.14), darkWoodM, s * 1.55, 1.4, -1.15, { fx: WOOD });
    add(uvScale(new THREE.BoxGeometry(3.6, 0.12, 2.6), 3, 1), woodM, 0, 2.82, -0.2, { fx: WOOD });
    const benchTrim = [];
    for (const rx of [-1.3, -0.45, 0.45, 1.3]) benchTrim.push([new THREE.BoxGeometry(0.1, 0.16, 2.5), rx, 2.7, -0.2]);
    for (const sx of [-1, 1]) {
      benchTrim.push([new THREE.BoxGeometry(0.08, 0.7, 0.08), sx * 1.38, 2.5, -1.1, 1, 1, 1, 0, sx * 0.7]);
      benchTrim.push([new THREE.BoxGeometry(0.1, 0.1, 0.9), sx * 1.55, 0.06, -0.75]);
    }
    benchTrim.push([new THREE.BoxGeometry(3.7, 0.18, 0.08), 0, 2.74, 1.14], [new THREE.BoxGeometry(2.8, 0.1, 0.1), 0, 0.1, -1.1]);
    add(mergeGeo(THREE, benchTrim), darkWoodM, 0, 0, 0, { fx: WOOD });
    add(new THREE.BoxGeometry(0.2, 0.09, 0.13), M(0xc8a24a, { roughness: 0.6 }), -1.15, 1.165, -0.6, { cast: false });
    add(new THREE.BoxGeometry(0.22, 0.09, 0.14), M(0x3f5530, { roughness: 0.6 }), -0.95, 1.165, -0.85);
    for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8), M(0xd9a441, { roughness: 0.3, metalness: 0.85 }), -0.5 + i * 0.05, 1.135, -0.6 - i * 0.03).rotation.z = Math.PI / 2;


    for (const dz of [10, 20, 30]) {
      const t = K.tex(128, 64, (x, w, h) => {
        x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d64545'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
        x.fillStyle = '#2a2633'; x.font = `900 34px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(dz + ' m', w / 2, h / 2 + 2);
      });
      const fm = M(0xffffff, { map: t, roughness: 0.7 });
      for (const s of [-1, 1]) {
        add(new THREE.BoxGeometry(1.1, 0.55, 0.05), [darkWoodM, darkWoodM, darkWoodM, darkWoodM, fm, darkWoodM], s * 15.6, 2.3, -dz, { fx: WOOD });
        add(new THREE.BoxGeometry(0.08, 2.1, 0.08), darkWoodM, s * 15.6, 1.05, -dz - 0.05, { fx: WOOD });
      }
    }
    const barrelGeo = mergeGeo(THREE, [[new THREE.CylinderGeometry(0.4, 0.4, 0.9, 16), 0, 0.45, 0], [new THREE.CylinderGeometry(0.415, 0.415, 0.05, 16), 0, 0.22, 0], [new THREE.CylinderGeometry(0.415, 0.415, 0.05, 16), 0, 0.68, 0]]);
    const barrels = new THREE.InstancedMesh(barrelGeo, M(0xffffff, { roughness: 0.55, metalness: 0.2 }), 7);
    [[-15.6, -3.2, '#c0392b'], [-15.1, -4.4, '#2f6fb5'], [15.5, -3.6, '#2f6fb5'], [15.9, -5.0, '#c0392b'], [15.2, -11.5, '#2e8b57'], [-15.7, -13.5, '#2e8b57'], [-15.2, -29, '#c0392b']].forEach(([x, z, c], i) => {
      d.position.set(x, 0, z); d.rotation.set(0, rnd(0, 6), 0); d.scale.setScalar(1); d.updateMatrix(); barrels.setMatrixAt(i, d.matrix); barrels.setColorAt(i, col.set(c));
    });
    barrels.castShadow = true; barrels.receiveShadow = true; scene.add(barrels);
    const crateGeo = mergeGeo(THREE, [[new THREE.BoxGeometry(0.8, 0.8, 0.8), 0, 0.4, 0], [new THREE.BoxGeometry(0.86, 0.08, 0.86), 0, 0.04, 0], [new THREE.BoxGeometry(0.86, 0.08, 0.86), 0, 0.76, 0], [new THREE.BoxGeometry(0.08, 0.8, 0.86), -0.39, 0.4, 0], [new THREE.BoxGeometry(0.08, 0.8, 0.86), 0.39, 0.4, 0]]);
    const crates = add(crateGeo, M(0x9b7a4c, { roughness: 0.85 }), 14.6, 0, -8.2);
    add(crateGeo, M(0x8a6a40, { roughness: 0.85 }), -14.8, 0, -7.3).rotation.y = 0.5;
    crates.rotation.y = -0.3;
    const crate2 = add(crateGeo, M(0x9b7a4c, { roughness: 0.85 }), 14.9, 0.8, -8.6); crate2.scale.setScalar(0.8); crate2.rotation.y = 0.4;
    const bagGeo = new THREE.SphereGeometry(0.3, 10, 8), bags = new THREE.InstancedMesh(bagGeo, M(0xb9a27a, { roughness: 1 }), 36);
    let bi = 0;
    for (const s of [-1, 1]) for (const [ox, oz] of [[1.35, -0.6], [1.35, 0], [1.35, 0.6], [0.65, 1.3], [0, 1.3], [-0.65, 1.3], [0.65, -1.3], [0, -1.3], [-0.65, -1.3]]) for (let lv = 0; lv < 2; lv++) {
      const alongZ = Math.abs(ox) > 1;
      d.position.set(s * 14.3 + s * ox, 0.16 + lv * 0.2, -17.5 + oz); d.rotation.set(0, (alongZ ? Math.PI / 2 : 0) + rnd(-0.15, 0.15), 0); d.scale.set(1, 0.55, 0.75); d.updateMatrix();
      bags.setMatrixAt(bi++, d.matrix);
    }
    bags.castShadow = true; bags.receiveShadow = true; scene.add(bags);
    const sockTex = K.tex(64, 128, (x, w, h) => {
      for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#ff6a1f'; x.fillRect(0, i * h / 6, w, h / 6); }
    });
    const sockM = new THREE.MeshStandardMaterial({ map: sockTex, roughness: 0.8, side: THREE.DoubleSide });
    const windsock = new THREE.Group(); windsock.position.set(-19.5, 0, -9); scene.add(windsock);
    add(new THREE.CylinderGeometry(0.05, 0.08, 5.4, 8), steelM, 0, 2.7, 0, { parent: windsock });
    add(new THREE.TorusGeometry(0.3, 0.02, 6, 16), steelM, 0.32, 5.35, 0, { parent: windsock, cast: false }).rotation.y = Math.PI / 2;
    const sockCone = add(new THREE.CylinderGeometry(0.3, 0.13, 1.6, 12, 4, true), sockM, 1.1, 5.25, 0, { parent: windsock, cast: false });
    sockCone.rotation.z = -Math.PI / 2 - 0.15;
    const bushGeo = new THREE.IcosahedronGeometry(1, 1), bushes = new THREE.InstancedMesh(bushGeo, M(0xffffff, { roughness: 1, flatShading: true }), 26);
    for (let i = 0; i < 26; i++) {
      const sd = i % 2 ? 1 : -1, r = rnd(0.45, 1.1);
      d.position.set(sd * rnd(18.2, 21), r * 0.5, rnd(2, -44)); d.rotation.set(rnd(0, 6), rnd(0, 6), 0); d.scale.set(r * 1.3, r * 0.8, r * 1.1); d.updateMatrix();
      bushes.setMatrixAt(i, d.matrix); bushes.setColorAt(i, col.set(pick(['#5f8f3f', '#4d8036', '#76a04a', '#6d9142'])));
    }
    bushes.castShadow = true; scene.add(bushes);
    const slotM = new THREE.MeshBasicMaterial({ color: 0x1b1a20 });
    for (const s of [-1, 1]) {
      add(new THREE.BoxGeometry(1.8, 1.1, 1.8), concreteM, s * 14.3, 0.55, -17.5, { fx: '#c9c4bb' });
      add(new THREE.BoxGeometry(2, 0.12, 2), darkWoodM, s * 14.3, 1.16, -17.5, { fx: WOOD });
      add(new THREE.PlaneGeometry(0.9, 0.32), slotM, s * (14.3 - 0.91), 0.75, -17.5, { cast: false }).rotation.y = -s * Math.PI / 2;
    }


    const R = 0.7, RINGS = [[1, '#f6f2e6'], [0.8, '#2b2a35'], [0.6, '#3d8bfd'], [0.4, '#ef4f4f'], [0.2, '#ffc93f']], RING_COL = ['#ffc93f', '#ef4f4f', '#3d8bfd', '#2b2a35', '#f6f2e6'];
    const faceTex = K.tex(256, 256, (x, w) => {
      const c = w / 2;
      RINGS.forEach(([r, cl]) => { x.fillStyle = cl; x.beginPath(); x.arc(c, c, r * c - 1, 0, 7); x.fill(); });
      x.lineWidth = 1.2;
      [0.9, 0.7, 0.5, 0.3, 0.1].forEach((r, i) => { x.strokeStyle = i ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)'; x.beginPath(); x.arc(c, c, r * c, 0, 7); x.stroke(); });
      x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 1.6;
      RINGS.forEach(([r]) => { x.beginPath(); x.arc(c, c, r * c - 1, 0, 7); x.stroke(); });
      x.strokeStyle = '#2b2a35'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(c - 5, c); x.lineTo(c + 5, c); x.moveTo(c, c - 5); x.lineTo(c, c + 5); x.stroke();
      for (let i = 0; i < 2500; i++) { x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(Math.random() * w, Math.random() * w, 1, 1); }
    });
    const faceGeo = new THREE.CylinderGeometry(R, R, 0.06, 48);
    faceGeo.rotateX(Math.PI / 2);
    const faceMats = [M(0x5a3d26), M(0xffffff, { map: faceTex, roughness: 0.8 }), woodM];
    const legGeo = new THREE.BoxGeometry(0.07, 1.25, 0.05), holeGeo = new THREE.CircleGeometry(0.035, 10), holeM = new THREE.MeshBasicMaterial({ color: 0x17120e });
    const rimGeo = mergeGeo(THREE, [[new THREE.TorusGeometry(R + 0.01, 0.035, 8, 40), 0, 1.55, 0.02], [new THREE.TorusGeometry(R + 0.01, 0.035, 8, 40), 0, 1.55, -0.02], [new THREE.BoxGeometry(0.64, 0.07, 0.04), 0, 1.0, -0.05], [new THREE.BoxGeometry(0.64, 0.07, 0.04), 0, 0.35, -0.05], [new THREE.BoxGeometry(0.12, 0.1, 0.07), 0, 0.85, 0.0]]);
    const boards = [], swings = [];
    function board(x, z, kind) {
      const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
      const hinge = new THREE.Group(); g.add(hinge);
      const face = add(faceGeo, faceMats, 0, 1.55, 0, { parent: hinge });
      add(rimGeo, darkWoodM, 0, 0, 0, { parent: hinge });
      for (const s of [-1, 1]) add(legGeo, darkWoodM, s * 0.32, 0.62, -0.06, { parent: hinge });
      const T = { kind, g, hinge, face, st: 'down', t: 0, life: 0, hit: false, holes: [], mult: kind === 'pop' ? 1 : 2 };
      face.userData.t = T; hinge.rotation.x = -Math.PI / 2; g.visible = false;
      boards.push(T);
      return T;
    }
    const SLOTS = [[-7, -10], [-2.5, -11.5], [3, -10.5], [7.8, -12], [-10, -16.5], [-5, -17.5], [0.5, -16.5], [5.5, -18], [10.5, -17], [-7.5, -24], [-2, -25], [3.5, -23.5], [8.5, -25.5], [-12, -27]];
    const barrierGeo = uvScale(new THREE.BoxGeometry(1.9, 0.58, 0.14), 2.2, 0.35);
    const pops = SLOTS.map(([x, z]) => { add(barrierGeo, woodM, x, 0.29, z + 0.6, { fx: WOOD }); return board(x, z, 'pop'); });
    const RAILS = [{ z: -14, a: 8.5, w: 0.42, ph: 0 }, { z: -21.5, a: 10, w: -0.5, ph: 2 }];
    for (const r of RAILS) {
      add(uvScale(new THREE.BoxGeometry(2 * r.a + 3, 0.62, 0.16), 12, 0.35), woodM, 0, 0.31, r.z + 0.6, { fx: WOOD });
      add(new THREE.CylinderGeometry(0.04, 0.04, 2 * r.a + 2.4, 8), steelM, 0, 0.32, r.z, { fx: '#d0d4da' }).rotation.z = Math.PI / 2;
      r.T = board(0, r.z, 'rail');
    }
    const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6);
    for (const [sx, sz] of [[-10.5, -19.5], [10.8, -22]]) {
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.14, 4.6, 0.14), darkWoodM, sx + s * 1.25, 2.3, sz, { fx: WOOD });
      add(new THREE.BoxGeometry(2.7, 0.16, 0.16), darkWoodM, sx, 4.55, sz, { fx: WOOD });
      const pivot = new THREE.Group(); pivot.position.set(sx, 4.45, sz); scene.add(pivot);
      const inner = new THREE.Group(); pivot.add(inner);
      for (const s of [-1, 1]) add(chainGeo, steelM, s * 0.35, -0.7, 0, { parent: inner });
      const face = add(faceGeo, faceMats, 0, -2.1, 0, { parent: inner });
      add(rimGeo, darkWoodM, 0, -3.65, 0, { parent: inner });
      const S = { kind: 'swing', pivot, inner, face, on: false, fold: 1, ph: rnd(0, 6), spin: 0, holes: [], mult: 2 };
      face.userData.t = S; swings.push(S);
    }
    const clayGeo = new THREE.LatheGeometry([[0, -0.045], [0.1, -0.045], [0.17, -0.04], [0.21, -0.012], [0.242, 0.012], [0.246, 0.026], [0.2, 0.03], [0.12, 0.04], [0.06, 0.056], [0, 0.058]].map(([x, y]) => new THREE.Vector2(x, y)), 28), clayM = M(0xff7a2e, { roughness: 0.4 }), hbGeo = new THREE.SphereGeometry(0.5, 8, 6), hbM = new THREE.MeshBasicMaterial({ visible: false });
    const clays = Array.from({ length: 6 }, () => {
      const m = add(clayGeo, clayM, 0, -5, 0), hb = new THREE.Mesh(hbGeo, hbM);
      m.visible = false; m.add(hb);
      const c = { kind: 'clay', m, hb, on: false, v: new V3() };
      hb.userData.t = c;
      return c;
    });


    const gun = new THREE.Group(); gun.scale.setScalar(0.72); cam.add(gun);
    const gunSteel = M(0x434a55, { roughness: 0.28, metalness: 0.5, emissive: 0x0d1118 }), gunDark = M(0x1d2026, { roughness: 0.5, metalness: 0.5 }), gloveM = M(0x34343f, { roughness: 0.9 });
    const roundBox = (w, h, len, r) => {
      const s = new THREE.Shape(), x = w / 2 - r, y = h / 2 - r;
      s.moveTo(-x, -h / 2); s.lineTo(x, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -y); s.lineTo(w / 2, y); s.quadraticCurveTo(w / 2, h / 2, x, h / 2);
      s.lineTo(-x, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, y); s.lineTo(-w / 2, -y); s.quadraticCurveTo(-w / 2, -h / 2, -x, -h / 2);
      const g = new THREE.ExtrudeGeometry(s, { depth: len - 2 * r, bevelEnabled: true, bevelSize: r * 0.5, bevelThickness: r, bevelSegments: 2, curveSegments: 3 });
      g.translate(0, 0, -(len - 2 * r) / 2);
      return g;
    };
    const gp = (geo, mat, x, y, z, rx = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.x = rx; gun.add(m); return m; };
    const slide = gp(roundBox(0.046, 0.05, 0.27, 0.008), gunSteel, 0, 0.045, -0.1);
    for (let k = 0; k < 6; k++) gp(new THREE.BoxGeometry(0.05, 0.03, 0.003), gunDark, 0, 0.047, 0.005 - k * 0.008);
    gp(new THREE.BoxGeometry(0.02, 0.006, 0.05), gunDark, 0.012, 0.069, -0.07);
    gp(new THREE.BoxGeometry(0.05, 0.006, 0.17), M(C.accent, { roughness: 0.4, metalness: 0.3 }), 0, 0.03, -0.125);
    gp(roundBox(0.042, 0.032, 0.2, 0.007), gunDark, 0, 0.006, -0.085);
    gp(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 12), gunDark, 0, 0.045, -0.24, Math.PI / 2);
    gp(roundBox(0.04, 0.062, 0.13, 0.012), M(0x2c2622, { roughness: 0.95 }), 0, -0.06, 0.015, 0.28 - Math.PI / 2);
    gp(new THREE.TorusGeometry(0.022, 0.005, 6, 14, Math.PI), gunDark, 0, -0.012, -0.06, Math.PI).rotation.y = Math.PI / 2;
    gp(new THREE.BoxGeometry(0.008, 0.012, 0.01), gunDark, 0, 0.078, -0.225);
    gp(new THREE.BoxGeometry(0.03, 0.012, 0.012), gunDark, 0, 0.078, 0.025);
    gp(roundBox(0.072, 0.085, 0.1, 0.02), gloveM, 0.004, -0.065, 0.028, 0.28 - Math.PI / 2);
    gp(roundBox(0.022, 0.024, 0.075, 0.009), gloveM, -0.035, -0.01, -0.02, 0.1);
    const sleeveM = M(0x3a4963, { roughness: 0.85 }), cuffTrim = M(0xe9e6df, { roughness: 0.8 }), dotM = new THREE.MeshBasicMaterial({ color: 0xfff6dc });
    const sleeve = gp(new THREE.CylinderGeometry(0.046, 0.056, 0.26, 14), sleeveM, 0.012, -0.17, 0.115, 0.7);
    const cuff = gp(new THREE.CylinderGeometry(0.049, 0.049, 0.03, 14), cuffTrim, 0.01, -0.092, 0.07, 0.7);
    for (const fy of [-0.036, -0.062, -0.088]) gp(new THREE.CylinderGeometry(0.0125, 0.0125, 0.05, 8), gloveM, 0.006, fy, -0.026, 0).rotation.z = Math.PI / 2;
    gp(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), gloveM, -0.028, -0.025, -0.012, Math.PI / 2 - 0.2);
    gp(new THREE.BoxGeometry(0.006, 0.022, 0.012), gunDark, 0, -0.026, -0.04);
    gp(new THREE.BoxGeometry(0.046, 0.007, 0.07), gunDark, 0, -0.018, -0.12);
    gp(new THREE.SphereGeometry(0.0042, 8, 6), dotM, 0, 0.0825, -0.2255);
    gp(new THREE.BoxGeometry(0.012, 0.004, 0.012), dotM, 0.006, 0.0825, 0.025);
    gp(new THREE.BoxGeometry(0.012, 0.004, 0.012), dotM, -0.006, 0.0825, 0.025);
    const flashTex = K.tex(128, 128, (x, w) => {
      const c = w / 2, g = x.createRadialGradient(c, c, 0, c, c, c);
      g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.25, 'rgba(255,220,120,.9)'); g.addColorStop(0.6, 'rgba(255,140,40,.3)'); g.addColorStop(1, 'rgba(255,100,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, w);
      x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,230,160,.8)';
      for (let i = 0; i < 6; i++) { x.save(); x.translate(c, c); x.rotate(i / 6 * Math.PI * 2 + rnd(-0.2, 0.2)); x.beginPath(); x.moveTo(0, -5); x.lineTo(c * rnd(0.75, 0.98), 0); x.lineTo(0, 5); x.fill(); x.restore(); }
    });
    const flashM = new THREE.MeshBasicMaterial({ map: flashTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    const flash = new THREE.Group(); flash.position.set(0, 0.045, -0.3); gun.add(flash);
    flash.add(new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), flashM));
    const f2 = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.16), flashM); f2.rotation.y = Math.PI / 2; f2.position.z = -0.08; flash.add(f2);
    flash.visible = false;
    const flashLight = new THREE.PointLight(0xffb45a, 0, 7, 2); flashLight.position.set(0, 0.06, -0.35); gun.add(flashLight);
    const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.045, -0.26); gun.add(muzzle);
    const port = new THREE.Object3D(); port.position.set(0.03, 0.06, -0.06); gun.add(port);
    const tracerGeo = new THREE.BoxGeometry(0.012, 0.012, 1); tracerGeo.translate(0, 0, 0.5);
    const tracerM = new THREE.MeshBasicMaterial({ color: 0xfff1b8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const tracer = new THREE.Mesh(tracerGeo, tracerM); tracer.frustumCulled = false; tracer.visible = false; scene.add(tracer);

    const chips = particles(THREE, scene, 360, new THREE.BoxGeometry(1, 0.35, 0.6), M(0xffffff, { roughness: 0.7 }));
    const dust = particles(THREE, scene, 140, new THREE.IcosahedronGeometry(1, 0), M(0xffffff, { roughness: 1, flatShading: true }), 0, false);
    const shells = particles(THREE, scene, 24, new THREE.CylinderGeometry(0.0065, 0.0065, 0.024, 8), M(0xd9a441, { roughness: 0.3, metalness: 0.85 }), 1.12, false);


    const hT = ui.el('pill tl', '<small>Time</small><b>60</b><small></small>'), hS = ui.el('pill tr', '<small>Score</small><b>0</b><small></small>');
    const hK = ui.el('pill tc stk'), hA = ui.el('ammo', '<i></i>'.repeat(8) + '<em></em>'), xh = ui.el('xh', '<i></i><i></i><i></i><i></i><b></b>'), hm = ui.el('hm'), hint = ui.el('hint');
    const [, tB, tS] = hT.children, [, sB, sA] = hS.children, bullets = [...hA.children].slice(0, 8), rlBar = hA.lastChild;
    const STAGES = [['Stage 1', 'Pop-up boards'], ['Stage 2', 'Moving targets · double points'], ['Stage 3', 'Clay discs · pull!']], SHORT = ['Pop-ups', 'Movers', 'Clays'];


    let st = 'intro', time = 60, score = 0, shots = 0, hits = 0, bulls = 0, claysHit = 0, claysN = 0, streak = 0, bestStreak = 0, ammo = 8, reloadT = 0, autoT = 0, stage = -1, popT = 0, clayT = 0, dbl = 0, lastSec = -1;
    let yaw = 0, pitch = 0, kick = 0, heat = 0, rec = 0, swayX = 0, swayY = 0, flashT = 0, tracerT = 0, locked = false, lockFails = 0, lockFailed = !lockable, drag = null, lastShot = null, lastFire = -1;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ndc2 = new THREE.Vector2(), tv = new V3(), tv2 = new V3(), tv3 = new V3(), list = [];

    const updScore = () => { sB.textContent = score; sA.textContent = shots ? Math.round(hits / shots * 100) + '%' : ''; api.score(score); };
    const updAmmo = () => bullets.forEach((b, i) => b.classList.toggle('e', i >= ammo));
    const updStreak = () => { hK.classList.toggle('on', streak >= 3); if (streak >= 3) hK.innerHTML = `<small>Streak</small><b>${streak}</b>`; };
    function updHint() {
      hint.textContent = st !== 'play' || locked ? '' : !fine ? 'Tap a target to shoot · drag to look around' : !lockFailed ? 'Click the range to aim with your mouse' : 'Click a target to shoot · drag to look around';
    }
    function requestLock() {
      if (lockFailed || !lockable || !fine) return;
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(lockErr); } catch (e) { lockErr(); }
      api.timeout(() => { if (!locked && st === 'play') lockErr(); }, 800);
    }
    function lockErr() {
      if (lockFailed) return;
      lockFailed = true; lockFails++;
      if (lockFails < 2) api.timeout(() => { lockFailed = false; updHint(); }, 1500);
      updHint();
    }
    const releaseLock = () => { if (document.pointerLockElement === canvas) document.exitPointerLock(); };
    api.on(document, 'pointerlockchange', () => {
      const was = locked;
      locked = document.pointerLockElement === canvas;
      if (locked) lockFails = 0;
      if (was && !locked && st === 'play') pause();
      updHint();
    });
    api.on(document, 'pointerlockerror', lockErr);

    function raise(T, life) { T.g.visible = true; T.st = 'rise'; T.t = 0; T.life = life; T.hit = false; T.holes.forEach(h => T.face.remove(h)); T.holes.length = 0; }
    function drop(T, hit) { T.st = 'fall'; T.t = 0; T.hit = hit; }
    function hittable(T) {
      if (T.kind === 'swing') return T.on && T.fold < 0.25 && T.spin <= 0;
      return T.st === 'up' || (T.st === 'rise' && T.t > 0.12);
    }
    function updBoard(T, dt) {
      T.t += dt;
      if (T.st === 'rise') { const u = Math.min(1, T.t / 0.3); T.hinge.rotation.x = -Math.PI / 2 * (1 - backOut(u)); if (u >= 1) { T.st = 'up'; T.t = 0; } }
      else if (T.st === 'up') { T.hinge.rotation.x = Math.sin(T.t * 16) * 0.05 * Math.exp(-T.t * 4); if (T.life && T.t > T.life) drop(T, false); }
      else if (T.st === 'fall') { const u = Math.min(1, T.t / (T.hit ? 0.28 : 0.35)); T.hinge.rotation.x = -Math.PI / 2 * (T.hit ? easeOut(u) : easeIn(u)); if (u >= 1) { T.st = 'down'; T.t = 0; T.g.visible = false; } }
      else if (T.kind === 'rail' && stage === 1 && st === 'play' && T.t > 1) raise(T, 0);
    }
    function setStage(s) {
      stage = s;
      ui.banner(STAGES[s][0], STAGES[s][1]); api.sfx('good');
      tS.textContent = SHORT[s];
      for (const r of RAILS) if (s === 1) raise(r.T, 0); else if (r.T.st !== 'down') drop(r.T, false);
      for (const S of swings) { S.on = s === 1; S.holes.forEach(h => S.face.remove(h)); S.holes.length = 0; }
    }
    function launch() {
      const c = clays.find(q => !q.on);
      if (!c) return;
      const side = Math.random() < 0.5 ? -1 : 1;
      c.on = true; c.m.visible = true; claysN++;
      c.m.position.set(side * 13.3, 1.1, rnd(-16, -19));
      c.v.set(-side * rnd(6.5, 9.5), rnd(8.5, 10.5), rnd(-2.2, 0.4));
      c.m.rotation.set(rnd(-0.3, 0.3), 0, side * rnd(0.1, 0.3));
      api.sfx('tap');
      for (let i = 0; i < 4; i++) dust.spawn(c.m.position, rnd(-1, 1) - side, rnd(0.3, 1), rnd(-0.5, 0.5), '#e9e2d6', rnd(0.5, 0.8), rnd(0.12, 0.2), -0.4, 2.5, 0.5);
    }
    function burst(p, n, cols, sp, life, size) {
      for (let i = 0; i < n; i++) chips.spawn(p, rnd(-sp, sp), rnd(0, sp * 1.3), rnd(-sp, sp * 0.4) + sp * 0.3, pick(cols), rnd(life * 0.6, life), rnd(size * 0.5, size));
    }
    function puff(p, color, n = 5) { for (let i = 0; i < n; i++) dust.spawn(p, rnd(-0.6, 0.6), rnd(0.2, 1.2), rnd(-0.2, 0.8), color, rnd(0.5, 0.9), rnd(0.06, 0.13), -0.3, 3, 0.35); }
    function cast(v) {
      ray.setFromCamera(v, cam);
      list.length = 0;
      for (const T of boards) if (hittable(T)) list.push(T.face);
      for (const S of swings) if (hittable(S)) list.push(S.face);
      for (const c of clays) if (c.on) list.push(c.hb);
      for (const m of env) list.push(m);
      return ray.intersectObjects(list, false)[0] || null;
    }
    function marker(x, y, bull) {
      hm.style.left = x + '%'; hm.style.top = y + '%';
      hm.className = 'hm'; void hm.offsetWidth; hm.className = bull ? 'hm b on' : 'hm on';
    }
    function fire(nx, ny, assist, mx, my) {
      const now = performance.now() / 1000;
      if (st !== 'play' || reloadT > 0 || now - lastFire < 0.12) return;
      if (ammo <= 0) { api.sfx('tick'); startReload(); return; }
      lastFire = now; ammo--; shots++; updAmmo();
      if (!ammo) autoT = 0.25;
      const center = nx === 0 && ny === 0, spread = center ? 0.002 + heat * 0.012 : 0;
      heat = Math.min(1, heat + 0.3); rec = 1; kick += 0.022; flashT = 0.05;
      flash.rotation.z = rnd(0, 6.3); flash.scale.setScalar(rnd(0.8, 1.2)); flash.visible = true; flashLight.intensity = 3;
      api.sfx('hit');
      cam.updateMatrixWorld(true);
      port.getWorldPosition(tv3); tv.set(1, 0, 0).applyQuaternion(cam.quaternion); tv2.set(0, 1, 0).applyQuaternion(cam.quaternion);
      shells.spawn(tv3, tv.x * rnd(1.4, 2.2) + tv2.x * rnd(1.6, 2.4), tv.y * rnd(1.4, 2.2) + tv2.y * rnd(1.6, 2.4), tv.z * rnd(1.4, 2.2) + tv2.z * rnd(1.6, 2.4), '#d9a441', 1.6, 1, 9.8);
      ndc.set(nx + gauss() * spread, ny + gauss() * spread);
      let h = cast(ndc);
      if (assist && !(h && h.object.userData.t)) for (let k = 0; k < 8; k++) {
        const a = k / 8 * Math.PI * 2;
        ndc2.set(ndc.x + Math.cos(a) * assist, ndc.y + Math.sin(a) * assist * 1.6);
        const h2 = cast(ndc2);
        if (h2 && h2.object.userData.t) { h = h2; break; }
      }
      muzzle.getWorldPosition(tv3);
      if (h) tv.copy(h.point); else tv.copy(ray.ray.direction).multiplyScalar(150).add(ray.ray.origin);
      tracer.position.copy(tv3); tracer.lookAt(tv); tracer.scale.set(1, 1, tv3.distanceTo(tv)); tracer.visible = true; tracerT = 0.07;
      const T = h && h.object.userData.t, s0 = streak;
      lastShot = { t: now, miss: !T, s0 };
      if (!T) {
        streak = 0; updStreak(); updScore();
        if (h) { if (h.object.userData.fx === SAND) puff(h.point, '#e3cfa8', 6); else { puff(h.point, '#d8cdbd', 3); burst(h.point, 6, [h.object.userData.fx || WOOD], 2, 0.6, 0.035); } }
        return;
      }
      hits++; streak++; bestStreak = Math.max(bestStreak, streak);
      let pts, label = '', color = '#fff', bull = false;
      if (T.kind === 'clay') {
        pts = 75; claysHit++; label = 'CLAY'; color = '#ffc08a';
        T.on = false; T.m.visible = false;
        tv.copy(T.v).multiplyScalar(0.35);
        for (let i = 0; i < 18; i++) chips.spawn(T.m.position, tv.x + rnd(-3, 3), tv.y + rnd(-1, 3), tv.z + rnd(-2, 2), pick(['#ff7a2e', '#ffb27a', '#e85d1a', '#3a2f2a']), rnd(0.6, 1.1), rnd(0.03, 0.07));
        puff(T.m.position, '#efe6da', 5);
      } else {
        tv.copy(h.point); T.face.worldToLocal(tv);
        const ring = Math.min(4, Math.floor(Math.hypot(tv.x, tv.y) / R * 5));
        pts = [100, 50, 30, 20, 10][ring] * T.mult;
        bull = ring === 0;
        if (bull) { bulls++; label = 'BULLSEYE'; color = '#ffd45c'; }
        const hole = new THREE.Mesh(holeGeo, holeM); hole.position.set(tv.x, tv.y, 0.032); T.face.add(hole); T.holes.push(hole);
        burst(h.point, 14, [RING_COL[ring], RING_COL[ring], '#c8a070', WOOD], 2.4, 0.8, 0.05);
        if (T.kind === 'swing') T.spin = 0.65; else drop(T, true);
      }
      const bonus = streak >= 3 ? Math.min(50, (streak - 2) * 5) : 0;
      pts += bonus; score += pts;
      updScore(); updStreak();
      tv.copy(h.point).project(cam);
      ui.pop('+' + pts + (label ? `<small>${label}</small>` : ''), clamp((tv.x + 1) * 50, 6, 94), clamp((1 - tv.y) * 50, 12, 88), color);
      marker(mx, my, bull);
      api.sfx(bull ? 'good' : 'pop');
    }
    function startReload() {
      if (reloadT > 0 || ammo === 8 || st !== 'play') return;
      reloadT = 1.1; autoT = 0; api.sfx('tap');
    }
    function pause() {
      if (st !== 'play') return;
      st = 'paused'; drag = null; updHint();
      api.overlay({ kicker: 'Paused', title: 'Target Range', text: 'The clock is stopped. Resume to keep shooting.', button: 'Resume', onAction: () => { st = 'play'; requestLock(); updHint(); } });
    }
    function startRound() {
      time = 60; score = shots = hits = bulls = claysHit = claysN = streak = bestStreak = 0; ammo = 8; reloadT = autoT = 0; stage = -1; popT = 0.5; clayT = 0.8; dbl = 0; lastSec = -1;
      yaw = pitch = kick = heat = 0;
      for (const T of boards) { T.st = 'down'; T.t = 0; T.g.visible = false; T.hinge.rotation.x = -Math.PI / 2; T.holes.forEach(h => T.face.remove(h)); T.holes.length = 0; }
      for (const c of clays) { c.on = false; c.m.visible = false; }
      st = 'play';
      hT.classList.remove('low');
      updScore(); updAmmo(); updStreak(); updHint();
      setStage(0);
    }
    function endRound() {
      st = 'over'; drag = null;
      releaseLock(); updHint();
      hK.classList.remove('on'); hT.classList.remove('low');
      const nb = api.submit(score), acc = shots ? Math.round(hits / shots * 100) : 0;
      api.sfx('win');
      api.overlay({ kicker: nb ? 'New best!' : '3D', title: 'Range closed', text: `${hits} hits from ${shots} shots · best streak ${bestStreak}.`, stats: [['Score', score], ['Accuracy', acc + '%'], ['Bullseyes', bulls], ['Clays', claysHit + '/' + claysN]], button: 'Play again', onAction: () => { startRound(); requestLock(); } });
    }


    const clampLook = () => { yaw = clamp(yaw, -1, 1); pitch = clamp(pitch, -0.4, 0.55); };
    api.on(document, 'mousemove', e => {
      if (!locked || st !== 'play') return;
      const mx = clamp(e.movementX, -150, 150), my = clamp(e.movementY, -150, 150);
      yaw -= mx * 0.0022; pitch -= my * 0.0022; clampLook();
      swayX = clamp(swayX - mx * 0.00006, -0.02, 0.02); swayY = clamp(swayY + my * 0.00006, -0.02, 0.02);
    });
    api.on(canvas, 'pointerdown', e => {
      if (st !== 'play') return;
      e.preventDefault();
      if (locked) { if (e.button === 0) fire(0, 0, 0, 50, 50); return; }
      if (e.pointerType === 'mouse' && fine && !lockFailed) { requestLock(); return; }
      const l = gl.toLocal(e), w = canvas.getBoundingClientRect().width || 960;
      fire(l.nx, l.ny, e.pointerType === 'touch' ? 34 / w : 0, l.x / 9.6, l.y / 6);
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, refunded: false };
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });
    api.on(canvas, 'pointermove', e => {
      if (!drag || e.pointerId !== drag.id || locked || st !== 'play') return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved < 12) return;
      if (!drag.refunded && lastShot && lastShot.miss && performance.now() / 1000 - lastShot.t < 0.6) {
        drag.refunded = true; ammo = Math.min(8, ammo + 1); shots = Math.max(0, shots - 1); streak = lastShot.s0; lastShot = null;
        if (ammo > 0) autoT = 0;
        updAmmo(); updScore(); updStreak();
      }
      const k = 1.6 / (canvas.getBoundingClientRect().width || 960);
      yaw -= dx * k; pitch -= dy * k; clampLook();
    });
    const endDrag = e => { if (drag && e.pointerId === drag.id) drag = null; };
    api.on(canvas, 'pointerup', endDrag);
    api.on(canvas, 'pointercancel', endDrag);
    api.on(hA, 'pointerdown', e => { e.preventDefault(); startReload(); });
    api.on(window, 'keydown', e => {
      if (st !== 'play') return;
      if ((e.code === 'Space' || e.code === 'KeyF') && !e.repeat) { e.preventDefault(); fire(0, 0, 0, 50, 50); }
      else if (e.code === 'KeyR') startReload();
    });


    [1, 4, 6, 10, 12].forEach(i => { pops[i].st = 'up'; pops[i].g.visible = true; pops[i].hinge.rotation.x = 0; pops[i].life = 0; });
    api.overlay({ kicker: '3D', title: 'Target Range', text: 'Sixty seconds, three stages: pop-up boards, moving targets, then clay discs. Center hits score more and streaks add bonus points. Click the range to aim with your mouse, or tap targets on touch.', button: 'Play', onAction: () => { startRound(); requestLock(); } });

    api.loop((dt, now) => {
      const t = now / 1000;
      if (st === 'play') {
        time -= dt;
        const sec = Math.ceil(time);
        if (sec !== lastSec) {
          lastSec = sec; tB.textContent = Math.max(0, sec);
          if (sec <= 5 && sec > 0) { hT.classList.add('low'); api.sfx('tick'); }
        }
        if (time <= 0) endRound();
      }
      if (st === 'play') {
        const ns = time > 40 ? 0 : time > 20 ? 1 : 2;
        if (ns !== stage) setStage(ns);
        const prog = clamp((60 - time) / 20, 0, 1);
        popT -= dt;
        if (popT <= 0) {
          popT = stage === 0 ? lerp(0.9, 0.62, prog) : stage === 1 ? 2.1 : 2.8;
          const up = pops.filter(T => T.st !== 'down').length;
          if (up < (stage === 0 ? 4 : 2)) { const free = pops.filter(T => T.st === 'down'); if (free.length) raise(pick(free), stage === 0 ? lerp(2.7, 2.0, prog) : 2.1); }
        }
        if (stage === 2) {
          clayT -= dt;
          if (clayT <= 0) { clayT = rnd(1.0, 1.4); launch(); if (Math.random() < 0.35) dbl = 0.28; }
          if (dbl > 0 && (dbl -= dt) <= 0) launch();
        }
        if (autoT > 0 && (autoT -= dt) <= 0) startReload();
        if (reloadT > 0) {
          reloadT -= dt;
          rlBar.style.setProperty('--r', (1 - Math.max(0, reloadT) / 1.1).toFixed(3));
          if (reloadT <= 0) { reloadT = 0; ammo = 8; updAmmo(); api.sfx('tap'); rlBar.style.setProperty('--r', 0); }
        }
        const kx = (keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0), ky = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0);
        if (kx || ky) { yaw += kx * 1.4 * dt; pitch += ky * 1.1 * dt; clampLook(); }
        for (const c of clays) {
          if (!c.on) continue;
          c.v.y -= 7 * dt; c.m.position.addScaledVector(c.v, dt); c.m.rotation.y += 15 * dt;
          if (c.m.position.y < 0.05) { c.on = false; c.m.visible = false; puff(c.m.position, '#e3cfa8', 3); }
        }
      }
      if (st !== 'paused') {
        for (const T of boards) updBoard(T, dt);
        for (const r of RAILS) { r.ph += dt * r.w; r.T.g.position.x = Math.sin(r.ph) * r.a; }
        for (const S of swings) {
          S.fold += ((S.on ? 0 : 1) - S.fold) * damp(5, dt);
          S.ph += dt * 1.9;
          S.pivot.rotation.set(-Math.PI / 2 * S.fold, 0, Math.sin(S.ph) * 0.55 * (1 - S.fold));
          if (S.spin > 0) S.spin -= dt;
          S.inner.rotation.y = S.spin > 0 ? (1 - S.spin / 0.65) * Math.PI * 2 : 0;
        }
        chips.update(dt); dust.update(dt); shells.update(dt);
      }


      kick *= Math.exp(-10 * dt); heat = Math.max(0, heat - dt * 1.4); rec *= Math.exp(-13 * dt);
      swayX *= Math.exp(-8 * dt); swayY *= Math.exp(-8 * dt);
      cam.rotation.set(pitch + kick, yaw, 0);
      const rl = reloadT > 0 ? Math.sin(Math.PI * (1 - reloadT / 1.1)) : 0;
      gun.position.set(0.14 + swayX, -0.17 + Math.sin(t * 1.7) * 0.003 + swayY - rl * 0.08, -0.36 + rec * 0.045);
      gun.rotation.set(rec * 0.32 - rl * 0.8, 0.07 + swayX * 2, rl * 0.45);
      slide.position.z = -0.1 + rec * 0.035;
      if (flashT > 0 && (flashT -= dt) <= 0) { flash.visible = false; flashLight.intensity = 0; }
      if (tracerT > 0) { tracerT -= dt; tracerM.opacity = Math.max(0, tracerT / 0.07) * 0.85; if (tracerT <= 0) tracer.visible = false; }
      xh.style.setProperty('--g', (7 + heat * 16 + rec * 6).toFixed(1) + 'px');
      renderer.render(scene, cam);
    });

    return () => { releaseLock(); K.dispose(scene); };
  }

  Ameplay.register({
    id: 'target-range-3d',
    title: 'Target Range',
    category: '3D',
    blurb: 'Pop-ups, movers and clay discs: 60 seconds on a sunny range.',
    help: 'Click the range to lock the mouse, move to aim, click to fire · <kbd>R</kbd> reload · <kbd>Esc</kbd> pauses · touch: tap targets, drag to look, tap the ammo to reload · <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> + <kbd>Space</kbd> work too',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="11"/><circle cx="32" cy="32" r="3" fill="currentColor"/><path d="M32 4v10M32 50v10M4 32h10M50 32h10"/></svg>',
    css: css3d('target-range-3d') + `
.gm-target-range-3d .w3{cursor:crosshair}
.gm-target-range-3d .tl b{min-width:2ch;text-align:center}
.gm-target-range-3d .tl.low b{color:#ffb4b4;animation:target-range-3d-beat 1s ease-in-out infinite}
.gm-target-range-3d .stk{top:60px;background:rgba(108,92,231,.82);opacity:0}
.gm-target-range-3d .stk.on{opacity:1}
.gm-target-range-3d .ammo{position:absolute;right:14px;bottom:14px;display:flex;align-items:flex-end;gap:4px;padding:10px 12px 13px;border-radius:14px;background:rgba(16,18,36,.46);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);pointer-events:auto;cursor:pointer;touch-action:none}
.gm-target-range-3d .ammo::before{content:'';position:absolute;inset:-8px}
.gm-target-range-3d .ammo i{width:7px;height:22px;border-radius:4px 4px 2px 2px;background:linear-gradient(90deg,#c58b2a,#ffe08a 45%,#c58b2a)}
.gm-target-range-3d .ammo i.e{opacity:.2}
.gm-target-range-3d .ammo em{position:absolute;left:12px;right:12px;bottom:5px;height:3px;border-radius:2px;background:#fff;transform-origin:left;transform:scaleX(var(--r,0))}
.gm-target-range-3d .xh{position:absolute;left:50%;top:50%;--g:7px}
.gm-target-range-3d .xh i{position:absolute;background:#fff;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.gm-target-range-3d .xh i:nth-child(1){left:-1px;bottom:var(--g);width:2px;height:10px}
.gm-target-range-3d .xh i:nth-child(2){left:-1px;top:var(--g);width:2px;height:10px}
.gm-target-range-3d .xh i:nth-child(3){top:-1px;right:var(--g);width:10px;height:2px}
.gm-target-range-3d .xh i:nth-child(4){top:-1px;left:var(--g);width:10px;height:2px}
.gm-target-range-3d .xh b{position:absolute;left:-2px;top:-2px;width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.gm-target-range-3d .hm{position:absolute;left:50%;top:50%;width:28px;height:28px;margin:-14px 0 0 -14px;opacity:0}
.gm-target-range-3d .hm::before,.gm-target-range-3d .hm::after{content:'';position:absolute;left:13px;top:0;width:2.5px;height:28px;border-radius:2px;background:linear-gradient(#fff 0 32%,transparent 32% 68%,#fff 68%);transform:rotate(45deg)}
.gm-target-range-3d .hm::after{transform:rotate(-45deg)}
.gm-target-range-3d .hm.b::before,.gm-target-range-3d .hm.b::after{background:linear-gradient(#ffc93f 0 32%,transparent 32% 68%,#ffc93f 68%)}
.gm-target-range-3d .hm.on{animation:target-range-3d-hm .3s ease-out}
@keyframes target-range-3d-hm{0%{opacity:1;transform:scale(1.5)}100%{opacity:0;transform:scale(1)}}
@keyframes target-range-3d-beat{50%{transform:scale(1.15)}}
@media (max-width:560px){.gm-target-range-3d .hint{left:8px;transform:none;max-width:calc(100% - 110px)}.gm-target-range-3d .ammo{right:8px;bottom:8px;padding:7px 9px 10px;gap:3px}.gm-target-range-3d .ammo i{width:5px;height:15px}.gm-target-range-3d .stk{top:44px}}
`,
    mount(root, api) { return boot(api, gl => range(root, api, gl)); }
  });
})();

