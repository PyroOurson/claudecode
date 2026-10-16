  let REGOK = false;
  function initRegistry() {
    if (REGOK) return;
    finalizeBlocks();
    for (const t of TT) if (t.cmodel) for (let k = 0; k < t.n; k++) cmodelTids(t.cmodel(t.base + k, 0));
    REGOK = true;
  }
  function run(root, api, keys, glc) {
    initRegistry();
    const { THREE, renderer } = glc, canvas = glc.canvas;
    const wrap = document.createElement('div');
    wrap.className = 'bc-wrap';
    canvas.removeAttribute('style'); canvas.className = 'bc-gl';
    const hud = cv(16, 16); hud.className = 'bc-hud';
    const inp = document.createElement('input');
    inp.className = 'bc-in'; inp.maxLength = 256; inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocapitalize', 'off'); inp.spellcheck = false; inp.hidden = true;
    wrap.append(canvas, hud, inp); root.append(wrap);
    const g = hud.getContext('2d');
    let touch = false;
    try { touch = matchMedia('(pointer: coarse)').matches; } catch (e) { }
    renderer.outputEncoding = THREE.LinearEncoding; renderer.toneMapping = THREE.NoToneMapping; renderer.shadowMap.enabled = false; renderer.autoClear = false;
    if (touch) renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.5));
    let SV = api.load(); if (!SV || typeof SV !== 'object') SV = {};
    const s0 = SV.set || {};
    const SET = { rd: clamp(s0.rd | 0 || (touch ? CFG.RD_TOUCH : CFG.RD), 2, 12), fancy: s0.fancy != null ? !!s0.fancy : !touch, fov: clamp(+s0.fov || CFG.FOV, 30, 110), sens: clamp(+s0.sens || 1, .1, 3), music: s0.music !== false, sound: s0.sound !== false, gam: s0.gam != null ? clamp(+s0.gam, 0, 1) : .5, clouds: s0.clouds !== false, bob: s0.bob !== false, gui: s0.gui | 0, smooth: s0.smooth !== false, particles: s0.particles != null ? s0.particles | 0 : 2 };
    const persistSet = () => { SV.set = SET; api.save(SV); };
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(CFG.FOV, 1.6, .05, 1200);
    cam.rotation.order = 'YXZ';
    const hScene = new THREE.Scene(), hCam = new THREE.PerspectiveCamera(70, 1.6, .01, 10);
    const trash = [], keep = o => { trash.push(o); return o; };
    const tex = (c, rep, flip) => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = !!flip; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return keep(t); };
    const atlasC = cv(ATL, ATL), atlasG = atlasC.getContext('2d');
    const atlasImg = atlasG.createImageData(ATL, ATL);
    function putTile(t, d) { const tx = (t & 63) * 16, ty = (t >> 6) * 16; for (let y = 0; y < 16; y++) atlasImg.data.set(d.subarray(y * 64, y * 64 + 64), ((ty + y) * ATL + tx) * 4); }
    for (let i = 0; i < TEXN.length; i++) putTile(i, get(TEXN[i]));
    for (let k = 0; k < ANIMS.length; k++) { const n = ANIMS[k], base = (ANIM_ROW0 + (k >> 2)) * 64 + (k & 3) * 16, fn = ANIMP[n]; for (let f = 0; f < 16; f++) putTile(base + f, fn ? fn(f) : get(n)); }
    atlasG.putImageData(atlasImg, 0, 0);
    const AVG = new Map();
    const tileAvg = t => { let a = AVG.get(t); if (a) return a; let r = 0, gg = 0, b = 0, n = 0; const tx = (t & 63) * 16, ty = (t >> 6) * 16; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const o = ((ty + y) * ATL + tx + x) * 4; if (atlasImg.data[o + 3] > 100) { r += atlasImg.data[o]; gg += atlasImg.data[o + 1]; b += atlasImg.data[o + 2]; n++; } } a = n ? [r / n, gg / n, b / n] : [128, 128, 128]; AVG.set(t, a); return a; };
    const tilePx = t => { const tx = (t & 63) * 16, ty = (t >> 6) * 16; for (let k = 0; k < 8; k++) { const o = ((ty + ri(16)) * ATL + tx + ri(16)) * 4; if (atlasImg.data[o + 3] > 100) return [atlasImg.data[o], atlasImg.data[o + 1], atlasImg.data[o + 2]]; } return tileAvg(t); };
    const atlasTex = tex(atlasC, false, false);
    const U = { sky: { value: 1 }, gam: { value: SET.gam }, frame: { value: 0 }, fogC: { value: new THREE.Color() }, fogN: { value: 60 }, fogF: { value: 100 }, map: { value: atlasTex }, dark: { value: 0 } };
    const CVS = `attribute vec4 lgt; attribute vec4 tnt; varying vec2 vUv; varying vec4 vL; varying vec3 vT; varying float vD; uniform float uFrame;
      void main(){ vec2 uv = uv; float fl = floor(lgt.w * 255.0 + .5); if (mod(fl, 2.0) > .5) uv.x += uFrame * ${(16 / ATL).toFixed(6)}; vUv = uv; vL = lgt; vT = tnt.rgb; vec4 wp = modelMatrix * vec4(position, 1.0); vD = length(wp.xz - cameraPosition.xz); gl_Position = projectionMatrix * viewMatrix * wp; }`;
    const CFS = trans => `uniform sampler2D map; uniform float uSky; uniform float uGam; uniform vec3 fogC; uniform float fogN; uniform float fogF; uniform float uDark; varying vec2 vUv; varying vec4 vL; varying vec3 vT; varying float vD;
      void main(){ vec4 c = texture2D(map, vUv); ${trans ? 'if (c.a < .02) discard;' : 'if (c.a < .5) discard;'}
        float fl = floor(vL.w * 255.0 + .5); bool mk = abs(c.a - .9804) < .004; bool ta = mod(floor(fl / 2.0), 2.0) > .5;
        vec3 col = (mk || ta) ? c.rgb * vT : c.rgb;
        float sl = vL.y * uSky, bl = vL.z;
        vec3 Ls = vec3(sl / (4.0 - 3.0 * sl)) * mix(vec3(.55, .62, 1.0), vec3(1.0), clamp(uSky * 1.4 - .2, 0.0, 1.0));
        float lb = bl / (4.0 - 3.0 * bl); vec3 Lb = vec3(lb, lb * .9, lb * .76);
        vec3 L = max(Ls, Lb); L = mix(L, 1.0 - pow(1.0 - L, vec3(4.0)), uGam); L = L * (.94 - uDark * .3) + .06 * (1.0 - uDark);
        col *= vL.x * L;
        float ff = clamp((vD - fogN) / max(1.0, fogF - fogN), 0.0, 1.0);
        gl_FragColor = vec4(mix(col, fogC, ff), ${trans ? 'c.a' : '1.0'}); }`;
    const mkMat = trans => keep(new THREE.ShaderMaterial({ uniforms: { map: U.map, uSky: U.sky, uGam: U.gam, uFrame: U.frame, fogC: U.fogC, fogN: U.fogN, fogF: U.fogF, uDark: U.dark }, vertexShader: CVS, fragmentShader: CFS(trans), transparent: trans, depthWrite: !trans, side: trans ? THREE.DoubleSide : THREE.FrontSide }));
    const solidMat = mkMat(false), transMat = mkMat(true);
    const bright = (sk, bl) => { const s = sk / 15 * U.sky.value, b = bl / 15; let L = Math.max(s / (4 - 3 * s), b / (4 - 3 * b)); L = lerp(L, 1 - (1 - L) ** 4, U.gam.value); return L * .94 + .06; };
    const lightAt = (x, y, z) => getL(Math.floor(x), Math.floor(y), Math.floor(z));
    const brAt = (x, y, z) => { const L = lightAt(x, y, z); return bright(L >> 4, L & 15); };
    function buildGeo(M) {
      const gq = new THREE.BufferGeometry();
      const a1 = new THREE.BufferAttribute(M.p.slice(0, M.nv * 3), 3), a2 = new THREE.BufferAttribute(M.u.slice(0, M.nv * 2), 2), a3 = new THREE.BufferAttribute(M.l.slice(0, M.nv * 4), 4, true), a4 = new THREE.BufferAttribute(M.t.slice(0, M.nv * 4), 4, true);
      const free = function () { this.array = null; };
      for (const a of [a1, a2, a3, a4]) a.onUpload(free);
      gq.setAttribute('position', a1); gq.setAttribute('uv', a2); gq.setAttribute('lgt', a3); gq.setAttribute('tnt', a4);
      const ia = M.nv < 65536 ? new Uint16Array(M.i.subarray(0, M.ni)) : M.i.slice(0, M.ni);
      const ib = new THREE.BufferAttribute(ia, 1); ib.onUpload(free); gq.setIndex(ib);
      return gq;
    }
    function setSecMesh(c, sy) {
      const old = c.m[sy];
      if (old) { for (const k of ['o', 't']) if (old[k]) { scene.remove(old[k]); old[k].geometry.dispose(); } }
      c.m[sy] = null;
      if (!MO.nv && !MESHT.nv) return;
      const r = { o: null, t: null };
      for (const [k, M, mat, ro] of [['o', MO, solidMat, 0], ['t', MESHT, transMat, 1]]) {
        if (!M.nv) continue;
        const gq = buildGeo(M);
        gq.boundingSphere = new THREE.Sphere(new THREE.Vector3(8, sy * 16 + 8, 8), 14);
        const m = new THREE.Mesh(gq, mat);
        m.position.set(c.cx * 16, 0, c.cz * 16); m.matrixAutoUpdate = false; m.updateMatrix(); m.renderOrder = ro;
        scene.add(m); r[k] = m;
      }
      c.m[sy] = r;
    }
    function unloadCol(c, k) { for (let s = 0; s < NSEC; s++) { const r = c.m[s]; if (r) for (const kk of ['o', 't']) if (r[kk]) { scene.remove(r[kk]); r[kk].geometry.dispose(); } } W.cols.delete(k); W.dirty.delete(c); W.lastK = -1; }
    const skyU = { top: { value: new THREE.Color() }, fog: { value: new THREE.Color() }, glow: { value: new THREE.Color(1, .5, .2) }, glowA: { value: 0 }, sun: { value: new THREE.Vector3(1, 0, 0) }, day: { value: 1 }, rain: { value: 0 } };
    const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(500, 24, 12)), keep(new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 fog; uniform vec3 glow; uniform float glowA; uniform vec3 sun; uniform float day; uniform float rain; varying vec3 vP;
        void main(){ vec3 d = normalize(vP); float h = clamp(d.y * 2.6 + .04, 0.0, 1.0); vec3 c = mix(fog, top, h * h * (3.0 - 2.0 * h));
        float s = max(dot(normalize(d.xz + 1e-4), normalize(sun.xz + 1e-4)), 0.0);
        c = mix(c, glow, glowA * s * s * s * clamp(1.0 - abs(d.y - .06) * 3.0, 0.0, 1.0) * (1.0 - rain));
        if (d.y < -.05) c = mix(c, fog * .6, clamp(-d.y * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0); }`
    })));
    sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
    const sgeo = new THREE.BufferGeometry(), spos = [], scol = [], sr = rng(42);
    for (let i = 0; i < 1500; i++) { const u = sr() * 2 - 1, a = sr() * Math.PI * 2, r = Math.sqrt(1 - u * u), k = sr(), br2 = k < .06 ? 1 : .35 + k * .5; spos.push(Math.cos(a) * r * 400, u * 400, Math.sin(a) * r * 400); scol.push(br2, br2, br2); }
    sgeo.setAttribute('position', new THREE.Float32BufferAttribute(spos, 3)); sgeo.setAttribute('color', new THREE.Float32BufferAttribute(scol, 3));
    const starMat = keep(new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false, vertexColors: true }));
    const stars = new THREE.Points(keep(sgeo), starMat); stars.frustumCulled = false;
    const sunC = cv(32, 32), sc2 = sunC.getContext('2d');
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const d = Math.max(Math.abs(x - 15.5), Math.abs(y - 15.5)); if (d > 15) continue; const c = d > 13 ? [255, 190, 80, .25] : d > 11 ? [255, 220, 120, .55] : d > 8 ? [255, 244, 170, 1] : [255, 255, 230, 1]; sc2.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`; sc2.fillRect(x, y, 1, 1); }
    const moonC = cv(32, 32), mc = moonC.getContext('2d');
    for (let y = 8; y < 24; y++) for (let x = 8; x < 24; x++) { const v = 200 + hash3(x >> 1, y >> 1, 9) * 40 - ((x - 8 + y - 8) > 18 ? 30 : 0) - (hash3(x >> 2, y >> 2, 10) > .75 ? 40 : 0); mc.fillStyle = `rgb(${v | 0},${v | 0},${v + 15 | 0})`; mc.fillRect(x, y, 1, 1); }
    const sunM = new THREE.Mesh(keep(new THREE.PlaneGeometry(90, 90)), keep(new THREE.MeshBasicMaterial({ map: tex(sunC), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
    const moonM = new THREE.Mesh(keep(new THREE.PlaneGeometry(60, 60)), keep(new THREE.MeshBasicMaterial({ map: tex(moonC), transparent: true, depthWrite: false, fog: false })));
    sunM.position.y = 380; sunM.rotation.x = Math.PI / 2; moonM.position.y = -380; moonM.rotation.x = -Math.PI / 2;
    const celest = new THREE.Group(); celest.add(stars, sunM, moonM); scene.add(celest);
    const cloudC = cv(256, 256), ccx = cloudC.getContext('2d'), cimg = ccx.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = sn(x / 16, y / 16, 16, 1) * .6 + sn(x / 16, y / 16, 48, 2) * .4; if (v > .58) cimg.data.set([255, 255, 255, 255], (y * 256 + x) * 4); }
    ccx.putImageData(cimg, 0, 0);
    const cloudU = { map: { value: tex(cloudC, true, true) }, off: { value: new THREE.Vector2() }, col: { value: new THREE.Color(1, 1, 1) }, far: { value: 200 } };
    const cloudMat = keep(new THREE.ShaderMaterial({
      uniforms: cloudU, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
      vertexShader: 'varying vec2 vW; varying float vY; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; vY = position.y; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform sampler2D map; uniform vec2 off; uniform vec3 col; uniform float far; varying vec2 vW; varying float vY; void main(){ float vD = length(vW - cameraPosition.xz); vec4 t = texture2D(map, (vW + off) / 3072.0); if (t.a < .5) discard; gl_FragColor = vec4(col * (vY > 0.5 ? 1.0 : .82), .8 * (1.0 - smoothstep(far * .55, far, vD))); }'
    }));
    const cloudG = new THREE.Group();
    const clouds = new THREE.Mesh(keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 1, 0)), cloudMat);
    const clouds2 = new THREE.Mesh(keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), cloudMat);
    clouds.scale.set(1600, 4, 1600); clouds2.scale.set(1600, 4, 1600); clouds.frustumCulled = clouds2.frustumCulled = false; clouds.renderOrder = clouds2.renderOrder = 2;
    cloudG.add(clouds, clouds2); scene.add(cloudG);
    const outline = new THREE.LineSegments(keep(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1))), keep(new THREE.LineBasicMaterial({ color: 0, transparent: true, opacity: .45 })));
    const crackC = cv(160, 16), cg = crackC.getContext('2d'), segs = [];
    { const R = rng(77); for (let k = 0; k < 9; k++) { let x = 8, y = 8; const a = k / 9 * Math.PI * 2 + R() * .5; for (let s = 0; s < 10; s++) { const an = a + (R() - .5) * 1.3; x += Math.cos(an) * 1.05; y += Math.sin(an) * 1.05; segs.push([x | 0, y | 0, s]); } } }
    for (let st = 0; st < 10; st++) for (const [x, y, s] of segs) if (s <= st && x >= 0 && y >= 0 && x < 16 && y < 16) { cg.fillStyle = s % 3 ? 'rgba(0,0,0,.6)' : 'rgba(40,40,40,.5)'; cg.fillRect(st * 16 + x, y, 1, 1); }
    const crackTex = tex(crackC, false, true); crackTex.repeat.set(.1, 1);
    const crack = new THREE.Mesh(keep(new THREE.BoxGeometry(1.004, 1.004, 1.004)), keep(new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
    outline.visible = crack.visible = false; scene.add(outline, crack);
    const PNN = 600, pd = new Float32Array(PNN * 10), M4 = new THREE.Matrix4(), tc = new THREE.Color();
    const pm = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(1, 1, 1)), keep(new THREE.MeshBasicMaterial({ toneMapped: false })), PNN);
    pm.frustumCulled = false; M4.makeScale(0, 0, 0);
    for (let i = 0; i < PNN; i++) { pm.setMatrixAt(i, M4); pm.setColorAt(i, tc.setRGB(1, 1, 1)); }
    scene.add(pm);
    let pNext = 0, pAlive = 0;
    function particle(x, y, z, vx, vy, vz, rgb, life, size, grav, emit) {
      if (!SET.particles && !emit) return;
      const k = pNext++ % PNN, o = k * 10, b = emit ? 1 : Math.max(brAt(x, y, z), brAt(x, y + 1, z), brAt(x + .7, y, z), brAt(x - .7, y, z), brAt(x, y, z + .7), brAt(x, y, z - .7));
      pd[o] = x; pd[o + 1] = y; pd[o + 2] = z; pd[o + 3] = vx; pd[o + 4] = vy; pd[o + 5] = vz; pd[o + 6] = life; pd[o + 7] = size; pd[o + 8] = grav; pd[o + 9] = life;
      pm.setColorAt(k, tc.setRGB(rgb[0] / 255 * b, rgb[1] / 255 * b, rgb[2] / 255 * b));
      pm.instanceColor.needsUpdate = true; pAlive = 2;
    }
    function burst(x, y, z, s, n, sp) {
      const t = TIL[s * 6 + 4] >= 0 ? TIL[s * 6 + 4] : MOD[s] && MOD[s][0] && MOD[s][0].f.find(Boolean) ? MOD[s][0].f.find(Boolean).tid : 0;
      const tk = TNT[s];
      for (let i = 0; i < n * (SET.particles === 1 ? .5 : 1); i++) {
        const c = tilePx(t), j = .85 + RNG() * .2;
        const tt = tk === 1 ? [140, 190, 90] : tk === 2 || tk === 6 ? [90, 160, 60] : [255, 255, 255];
        particle(x + RNG(), y + RNG(), z + RNG(), (RNG() - .5) * (sp || 3), RNG() * 3 + 1, (RNG() - .5) * (sp || 3), [c[0] * j * tt[0] / 255, c[1] * j * tt[1] / 255, c[2] * j * tt[2] / 255], .5 + RNG() * .6, .06 + RNG() * .07, 18);
      }
    }
    function updParticles(dt) {
      if (pAlive <= 0) return;
      pAlive -= dt;
      for (let k = 0; k < PNN; k++) {
        const o = k * 10;
        if (pd[o + 6] <= 0) continue;
        pd[o + 6] -= dt; pd[o + 4] -= pd[o + 8] * dt;
        const ny = pd[o + 1] + pd[o + 4] * dt;
        if (pd[o + 8] > 0 && solidAt(Math.floor(pd[o]), Math.floor(ny - .03), Math.floor(pd[o + 2]))) { pd[o + 4] = 0; pd[o + 3] *= .6; pd[o + 5] *= .6; } else pd[o + 1] = ny;
        pd[o] += pd[o + 3] * dt; pd[o + 2] += pd[o + 5] * dt;
        const s = pd[o + 6] > 0 ? pd[o + 7] * Math.min(1, pd[o + 6] * 5) : 0;
        M4.makeScale(s, s, s).setPosition(pd[o], pd[o + 1], pd[o + 2]); pm.setMatrixAt(k, M4);
        pAlive = 2;
      }
      pm.instanceMatrix.needsUpdate = true;
    }
    const geoCache = new Map();
    function blockGeom(s, size) {
      const key = s * 100 + Math.round(size * 50);
      if (geoCache.has(key)) return geoCache.get(key);
      PB.fill(0); PL.fill(0xF0); TGc.fill(0); TFc.fill(0); TWc.fill(0);
      biomeColors(); for (let i = 0; i < PSS; i++) { const b = BIOC[0]; TGc.set(b.g, i * 3); TFc.set(b.f, i * 3); TWc.set(b.w, i * 3); }
      const p = pof(0, 0, 0);
      PB[p] = s;
      MO.nv = MO.ni = MESHT.nv = MESHT.ni = 0;
      const shp = SHP[s];
      let SRC = MO;
      if (shp === 1) { grow(MO); for (let f = 0; f < 6; f++) { const tk = TNT[s]; if (tk) setTint(tk, 0, 0, s); else TR = TG2 = TB = 255; const t = !FANCY && LEAF[s] && TILF[s] !== undefined ? TILF[s] : TIL[s * 6 + f]; cubeFace(MO, s, f, 0, 0, 0, p, t, TRT[s * 6 + f], ANIMF[s] ? 1 : 0); } }
      else if (shp === 2 || shp === 3) { if (TNT[s]) setTint(TNT[s], 0, 0, s); else TR = TG2 = TB = 255; grow(MO); crossQuads(MO, TIL[s * 6], 0, 0, 0, 0xF0, 0, 0, shp === 3, 0, 230, 1); }
      else if (shp === 5) { grow(MO); grow(MESHT); modelBoxes(MO, MO, MOD[s], s, 0, 0, 0, p, TNT[s]); }
      else if (shp === 6) { grow(MO); grow(MESHT); modelBoxes(MO, MO, cmodelFor(s, () => 0), s, 0, 0, 0, p, TNT[s]); }
      else if (shp === 4) { liquid(MO, s, 0, 0, 0, p, 0, 0); if (MESHT.nv) SRC = MESHT; }
      const pos = SRC.p.slice(0, SRC.nv * 3);
      for (let i = 0; i < pos.length; i += 3) { pos[i] = (pos[i] - .5) * size; pos[i + 1] = (pos[i + 1] - .5) * size; pos[i + 2] = (pos[i + 2] - .5) * size; }
      const gq = new THREE.BufferGeometry();
      gq.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gq.setAttribute('uv', new THREE.BufferAttribute(SRC.u.slice(0, SRC.nv * 2), 2));
      const col = new Float32Array(SRC.nv * 3);
      for (let i = 0; i < SRC.nv; i++) { const sh = SRC.l[i * 4] / 255; col[i * 3] = sh * SRC.t[i * 4] / 255; col[i * 3 + 1] = sh * SRC.t[i * 4 + 1] / 255; col[i * 3 + 2] = sh * SRC.t[i * 4 + 2] / 255; }
      gq.setAttribute('color', new THREE.BufferAttribute(col, 3));
      gq.setIndex(new THREE.BufferAttribute(SRC.i.slice(0, SRC.ni), 1));
      gq.computeBoundingSphere();
      geoCache.set(key, keep(gq));
      return gq;
    }
    const ITA = cv(1024, 1024), itaG = ITA.getContext('2d'), itaImg = itaG.createImageData(1024, 1024), ITIDX = new Map();
    function itemSpriteData(it) {
      const t = it.block ? TN[it.block] : null;
      let d = null;
      if (it.tex) d = get(it.tex);
      else if (t && t.icon && !t.icon3) d = get(t.icon);
      else if (t && (t.shape === 'cross' || t.shape === 'crop')) d = get(typeof t.tex === 'string' ? t.tex : 'missing');
      if (!d) return null;
      if (it.tintC || it.eggC || (t && t.tint)) {
        d = new Uint8ClampedArray(d);
        const tc2 = it.tintC ? DYE[it.tintC] : t && (t.tint === 1 || t.tint === 2) ? [124, 189, 75] : t && t.tint === 7 ? [32, 128, 48] : t && t.tint === 8 ? [100, 180, 50] : null;
        for (let i = 0; i < 1024; i += 4) {
          if (!d[i + 3]) continue;
          if (it.eggC) { const l = d[i] / 255, c = l > .5 ? it.eggC[0] : it.eggC[1], k = l > .5 ? .75 + l * .3 : 1; d[i] = Math.min(255, c[0] * k); d[i + 1] = Math.min(255, c[1] * k); d[i + 2] = Math.min(255, c[2] * k); }
          else if (tc2) { d[i] = d[i] * tc2[0] / 255; d[i + 1] = d[i + 1] * tc2[1] / 255; d[i + 2] = d[i + 2] * tc2[2] / 255; if (d[i + 3] === 250) d[i + 3] = 255; }
        }
      }
      return d;
    }
    let itaN = 0;
    const flatIt = new Uint8Array(IT.length);
    for (const it of IT) {
      const d = itemSpriteData(it);
      if (!d) continue;
      flatIt[it.idx] = 1;
      const k = itaN++, ox = (k & 63) * 16, oy = (k >> 6) * 16;
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const o = (y * 16 + x) * 4, q = ((oy + y) * 1024 + ox + x) * 4; itaImg.data[q] = d[o]; itaImg.data[q + 1] = d[o + 1]; itaImg.data[q + 2] = d[o + 2]; itaImg.data[q + 3] = d[o + 3] > 127 ? 255 : 0; }
      ITIDX.set(it.idx, k);
    }
    itaG.putImageData(itaImg, 0, 0);
    const itemTex = tex(ITA, false, false);
    function itemGeom(id, s) {
      const key = -(id * 100 + Math.round(s * 50) + 1);
      if (geoCache.has(key)) return geoCache.get(key);
      const k = ITIDX.get(id), cx = (k & 63) * 16, cy = (k >> 6) * 16, q = s / 16, hh = q * .5, pos = [], uvs = [], cols = [], ix = [];
      const solid = (i, j) => i >= 0 && j >= 0 && i < 16 && j < 16 && itaImg.data[((cy + j) * 1024 + cx + i) * 4 + 3] > 127;
      const u0 = cx / 1024, v0 = cy / 1024, du = 16 / 1024, hs = s / 2;
      const quad = (pts, u, v, kk) => { const n = pos.length / 3; for (let i = 0; i < 4; i++) { pos.push(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]); uvs.push(u[i], v[i]); cols.push(kk, kk, kk); } ix.push(n, n + 1, n + 2, n, n + 2, n + 3); };
      quad([-hs, -hs, hh, hs, -hs, hh, hs, hs, hh, -hs, hs, hh], [u0, u0 + du, u0 + du, u0], [v0 + du, v0 + du, v0, v0], 1);
      quad([hs, -hs, -hh, -hs, -hs, -hh, -hs, hs, -hh, hs, hs, -hh], [u0 + du, u0, u0, u0 + du], [v0 + du, v0 + du, v0, v0], .8);
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        if (!solid(i, j)) continue;
        const xl = (i - 8) * q, xr = xl + q, yt = (8 - j) * q, yb = yt - q, u = (cx + i + .5) / 1024, v = (cy + j + .5) / 1024, u4 = [u, u, u, u], v4 = [v, v, v, v];
        if (!solid(i - 1, j)) quad([xl, yb, -hh, xl, yb, hh, xl, yt, hh, xl, yt, -hh], u4, v4, .7);
        if (!solid(i + 1, j)) quad([xr, yb, hh, xr, yb, -hh, xr, yt, -hh, xr, yt, hh], u4, v4, .7);
        if (!solid(i, j - 1)) quad([xl, yt, hh, xr, yt, hh, xr, yt, -hh, xl, yt, -hh], u4, v4, .94);
        if (!solid(i, j + 1)) quad([xl, yb, -hh, xr, yb, -hh, xr, yb, hh, xl, yb, hh], u4, v4, .58);
      }
      const gq = new THREE.BufferGeometry();
      gq.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gq.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); gq.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gq.setIndex(ix);
      gq.computeBoundingSphere();
      geoCache.set(key, keep(gq));
      return gq;
    }
    const blockMatE = keep(new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: .5, toneMapped: false }));
    const itemMatE = keep(new THREE.MeshBasicMaterial({ map: itemTex, vertexColors: true, alphaTest: .5, toneMapped: false, side: THREE.DoubleSide }));
    function iconS(t) { let s = t.base + (t.iconState || 0); if (t.pk.facing !== undefined && t.props[t.pk.facing][1].includes('south')) s = sw(s, 'facing', 'south'); return s; }
    const isFlat = id => !!flatIt[id] || !IT[id].block;
    function itemMesh(id, size) {
      const it = IT[id];
      if (isFlat(id)) return new THREE.Mesh(itemGeom(id, size * 1.4), itemMatE.clone());
      return new THREE.Mesh(blockGeom(iconS(TN[it.block]), size), blockMatE.clone());
    }
    const ICS = 32, ICN = 48, ICON = cv(ICS * ICN, ICS * Math.ceil(IT.length / ICN)), icG = ICON.getContext('2d');
    icG.imageSmoothingEnabled = false;
    function buildIcons() {
      const rt = new THREE.WebGLRenderTarget(64, 64), oc = new THREE.OrthographicCamera(-.82, .82, .82, -.82, .1, 10), sc3 = new THREE.Scene(), buf = new Uint8Array(64 * 64 * 4);
      oc.position.set(2.2, 1.8, 2.2); oc.lookAt(0, 0, 0);
      const tmpC = cv(64, 64), tg = tmpC.getContext('2d'), tim = tg.createImageData(64, 64);
      const mat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: .5, toneMapped: false, side: THREE.DoubleSide });
      const prevRT = renderer.getRenderTarget(), prevPR = renderer.getPixelRatio();
      for (const it of IT) {
        const ox = (it.idx % ICN) * ICS, oy = (it.idx / ICN | 0) * ICS;
        const k = ITIDX.get(it.idx);
        if (k !== undefined) { icG.drawImage(ITA, (k & 63) * 16, (k >> 6) * 16, 16, 16, ox, oy, ICS, ICS); continue; }
        if (!it.block) continue;
        const t = TN[it.block], s = iconS(t);
        const gq = blockGeom(s, 1);
        const m = new THREE.Mesh(gq, mat);
        sc3.add(m);
        renderer.setRenderTarget(rt); renderer.setClearColor(0, 0); renderer.clear(); renderer.render(sc3, oc);
        renderer.readRenderTargetPixels(rt, 0, 0, 64, 64, buf);
        sc3.remove(m);
        for (let y = 0; y < 64; y++) tim.data.set(buf.subarray((63 - y) * 256, (63 - y) * 256 + 256), y * 256);
        tg.putImageData(tim, 0, 0);
        icG.drawImage(tmpC, ox, oy, ICS, ICS);
      }
      renderer.setRenderTarget(prevRT); renderer.setPixelRatio(prevPR); mat.dispose(); rt.dispose();
    }
