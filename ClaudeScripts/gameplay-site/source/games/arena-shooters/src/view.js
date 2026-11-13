  const COARSE = matchMedia('(pointer: coarse)').matches;
  function fitPR(api, v, hook) {
    const r = v.renderer, c = v.canvas, Q = [1, 0.8, 0.62, 0.5], sz = new v.THREE.Vector2();
    let lvl = 0, cw = 0, avg = 0.016, t = -2, wait = 8, chk = 0, lf = -1, sf = 0, up = 0;
    const apply = () => {
      const d = Math.min(2, window.devicePixelRatio || 1), B = Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * d * d * 1.05);
      const lw = r.getSize(sz).x || v.w, pr = Math.max(0.45, Math.min(4, d * cw / lw, Math.sqrt(B / (lw * (sz.y || v.h))))) * Q[lvl];
      if (Math.abs(r.getPixelRatio() - pr) > 0.01) r.setPixelRatio(pr);
      r.shadowMap.autoUpdate = lvl < 2;
    };
    const size = () => { const w = c.getBoundingClientRect().width; if (w && Math.abs(w - cw) > Math.max(2, cw * 0.02)) { cw = w; apply(); } };
    const set = n => { lvl = n; t = 0; apply(); if (hook) hook(lvl); };
    r.forceContextLoss = () => {};
    size(); api.on(window, 'resize', size);
    const F = { get lvl() { return lvl; }, force: -1, set };
    api.loop(dt => {
      const f = r.info.render.frame;
      if (f === lf || !(dt > 0)) return;
      lf = f;
      if (lvl > 1 && (sf ^= 1)) r.shadowMap.needsUpdate = true;
      avg += (dt - avg) * Math.min(1, dt * 1.5); t += dt;
      if (performance.now() - chk > 500) { chk = performance.now(); size(); }
      if (F.force >= 0) { if (lvl !== F.force) set(F.force); return; }
      if (t < 1.5) return;
      if (avg > 0.021 && lvl < Q.length - 1) { if (up && t < 6) wait = Math.min(64, wait * 2); up = 0; set(lvl + 1); }
      else if (avg < 0.0172 && lvl && t > wait) { up = 1; set(lvl - 1); }
    });
    return F;
  }

  function mkKit(THREE, own) {
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const G0 = {
      box: own(new THREE.BoxGeometry(1, 1, 1).toNonIndexed()),
      cyl: own(new THREE.CylinderGeometry(0.5, 0.5, 1, 12, 1).toNonIndexed()),
      cyl6: own(new THREE.CylinderGeometry(0.5, 0.5, 1, 6, 1).toNonIndexed()),
      cyl8: own(new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1).toNonIndexed()),
      sph: own(new THREE.SphereGeometry(0.5, 14, 10).toNonIndexed()),
      sphL: own(new THREE.SphereGeometry(0.5, 8, 6).toNonIndexed()),
      cone: own(new THREE.ConeGeometry(0.5, 1, 10, 1).toNonIndexed()),
      cone4: own(new THREE.ConeGeometry(0.5, 1, 4, 1).toNonIndexed())
    };
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), nm = new THREE.Matrix3();
    const matV = own(new THREE.MeshLambertMaterial({ vertexColors: true }));
    const matVS = own(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 60, specular: 0x444444 }));
    const extra = {};
    function geo(list) {
      const P = [], N = [], Cc = [];
      for (const it of list) {
        const [shape, col, p = [0, 0, 0], k = [1, 1, 1], r = [0, 0, 0]] = it;
        const g = typeof shape === 'string' ? (G0[shape] || extra[shape]) : shape;
        m4.compose(v.set(p[0], p[1], p[2]), q.setFromEuler(e.set(r[0], r[1], r[2], it[6] || 'XYZ')), sc.set(k[0], k[1], k[2]));
        nm.getNormalMatrix(m4);
        const pa = g.attributes.position.array, na = g.attributes.normal.array, c = lin(col);
        for (let i = 0; i < pa.length; i += 3) {
          v.set(pa[i], pa[i + 1], pa[i + 2]).applyMatrix4(m4); P.push(v.x, v.y, v.z);
          v.set(na[i], na[i + 1], na[i + 2]).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z);
          const sh = it[5] ? 1 - it[5] * (0.5 - pa[i + 1]) : 1;
          Cc.push(c.r * sh, c.g * sh, c.b * sh);
        }
      }
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
      out.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
      out.computeBoundingSphere();
      return own(out);
    }
    function mesh(list, o) {
      const m = new THREE.Mesh(geo(list), o && o.shiny ? matVS : matV);
      m.castShadow = !(o && o.noShadow); m.receiveShadow = !!(o && o.recv);
      return m;
    }
    const limb = (col, a, b, t, shape) => { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz); return [shape || 'box', col, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [t, t, L], [-Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(dx, dz), 0], 0, 'YXZ']; };
    return { THREE, lin, geo, mesh, G0, extra, matV, matVS, own, limb };
  }

  function canvasTex(THREE, own, S, draw, o) {
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    draw(g, S);
    const t = own(new THREE.CanvasTexture(c));
    t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (o && o.pixel) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; }
    t.anisotropy = 4;
    return t;
  }

  function buildMapMeshes(THREE, own, M, G) {
    const groups = new Map();
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const tmpC = new THREE.Color();
    const grp = k => { let g = groups.get(k); if (!g) groups.set(k, g = { P: [], N: [], U: [], C: [], ns: false }); return g; };
    const MT = G.mats;
    const quad = (g, a, b, c, d, n, ua, ub, uc, ud, col, sa, sb, sc2, sd) => {
      g.P.push(...a, ...b, ...c, ...a, ...c, ...d);
      for (let i = 0; i < 6; i++) g.N.push(n[0], n[1], n[2]);
      g.U.push(...ua, ...ub, ...uc, ...ua, ...uc, ...ud);
      const S = [sa, sb, sc2, sa, sc2, sd];
      for (let i = 0; i < 6; i++) g.C.push(col.r * S[i], col.g * S[i], col.b * S[i]);
    };
    const tri = (g, a, b, c, n, ua, ub, uc, col, s) => {
      g.P.push(...a, ...b, ...c);
      for (let i = 0; i < 3; i++) g.N.push(n[0], n[1], n[2]);
      g.U.push(...ua, ...ub, ...uc);
      for (let i = 0; i < 3; i++) g.C.push(col.r * s, col.g * s, col.b * s);
    };
    const fy = M.floorY, ao = G.mapAO == null ? 0.72 : G.mapAO;
    const aoAt = y => y <= fy + 0.01 ? ao : 1;
    const addBox = s => {
      const mt = MT[s.m] || MT.default, g = grp(s.m + (s.ns ? '|ns' : '') + (s.glow ? '|gl' : ''));
      g.ns = s.ns; g.glow = s.glow;
      const col = lin(s.c != null ? s.c : mt.color), ts = (mt.tile || 2) * (s.uv || 1);
      const { x0, y0, z0, x1, y1, z1 } = s;
      const sb = aoAt(y0);
      quad(g, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], [x0 / ts, z1 / ts], [x1 / ts, z1 / ts], [x1 / ts, z0 / ts], [x0 / ts, z0 / ts], col, 1, 1, 1, 1);
      if (y0 > fy + 0.01) quad(g, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], [x0 / ts, z0 / ts], [x1 / ts, z0 / ts], [x1 / ts, z1 / ts], [x0 / ts, z1 / ts], col, 0.8, 0.8, 0.8, 0.8);
      quad(g, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], [x0 / ts, y0 / ts], [x1 / ts, y0 / ts], [x1 / ts, y1 / ts], [x0 / ts, y1 / ts], col, sb, sb, 1, 1);
      quad(g, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], [-x1 / ts, y0 / ts], [-x0 / ts, y0 / ts], [-x0 / ts, y1 / ts], [-x1 / ts, y1 / ts], col, sb, sb, 1, 1);
      quad(g, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], [-z1 / ts, y0 / ts], [-z0 / ts, y0 / ts], [-z0 / ts, y1 / ts], [-z1 / ts, y1 / ts], col, sb, sb, 1, 1);
      quad(g, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], [z0 / ts, y0 / ts], [z1 / ts, y0 / ts], [z1 / ts, y1 / ts], [z0 / ts, y1 / ts], col, sb, sb, 1, 1);
    };
    const addRamp = s => {
      const mt = MT[s.m] || MT.default, g = grp(s.m + (s.ns ? '|ns' : '')), col = lin(s.c != null ? s.c : mt.color), ts = (mt.tile || 2) * (s.uv || 1);
      const { x0, z0, x1, z1, ya, yb, y0 } = s;
      const H = (x, z) => rampH(s, x, z);
      const a = [x0, H(x0, z1), z1], b = [x1, H(x1, z1), z1], c = [x1, H(x1, z0), z0], d = [x0, H(x0, z0), z0];
      const ux = s.dir < 2, len = ux ? x1 - x0 : z1 - z0, sl = (yb - ya) / len;
      const ax = s.dir === 0 ? 1 : s.dir === 1 ? -1 : 0, az = s.dir === 2 ? 1 : s.dir === 3 ? -1 : 0;
      let nx = -ax * sl, ny = 1, nz = -az * sl; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const uvf = p => ux ? [p[2] / ts, (s.dir === 0 ? p[0] - x0 : x1 - p[0]) * Math.sqrt(1 + sl * sl) / ts] : [p[0] / ts, (s.dir === 2 ? p[2] - z0 : z1 - p[2]) * Math.sqrt(1 + sl * sl) / ts];
      quad(g, a, b, c, d, [nx, ny, nz], uvf(a), uvf(b), uvf(c), uvf(d), col, 1, 1, 1, 1);
      const side = (p0, p1, n) => {
        const lo0 = [p0[0], y0, p0[2]], lo1 = [p1[0], y0, p1[2]];
        const u = q => n[0] ? [q[2] / ts, q[1] / ts] : [q[0] / ts, q[1] / ts];
        if (p0[1] - y0 > 1e-3 || p1[1] - y0 > 1e-3) quad(g, lo0, lo1, p1, p0, n, u(lo0), u(lo1), u(p1), u(p0), col, aoAt(y0), aoAt(y0), 1, 1);
      };
      side(b, a, [0, 0, 1]); side(d, c, [0, 0, -1]); side(c, b, [1, 0, 0]); side(a, d, [-1, 0, 0]);
    };
    for (const s of M.solids) { if (s.inv) continue; if (s.t === 1) addRamp(s); else addBox(s); }
    for (const s of M.deco) addBox(s);
    for (const c of M.cyl) {
      const mt = MT[c.m] || MT.default, g = grp(c.m + (c.ns ? '|ns' : '')), col = lin(c.c != null ? c.c : mt.color), ts = (mt.tile || 2);
      const n = c.seg;
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
        const p0 = [c.x + Math.cos(a0) * c.r, c.y, c.z + Math.sin(a0) * c.r], p1 = [c.x + Math.cos(a1) * c.r, c.y, c.z + Math.sin(a1) * c.r];
        const q0 = [c.x + Math.cos(a0) * c.r2, c.y + c.h, c.z + Math.sin(a0) * c.r2], q1 = [c.x + Math.cos(a1) * c.r2, c.y + c.h, c.z + Math.sin(a1) * c.r2];
        const u0 = i / n * c.r * TAU / ts, u1 = (i + 1) / n * c.r * TAU / ts;
        quad(g, p1, p0, q0, q1, [Math.cos(am), 0, Math.sin(am)], [u1, c.y / ts], [u0, c.y / ts], [u0, (c.y + c.h) / ts], [u1, (c.y + c.h) / ts], col, aoAt(c.y), aoAt(c.y), 1, 1);
        if (c.cap) tri(g, [c.x, c.y + c.h, c.z], q1, q0, [0, 1, 0], [c.x / ts, c.z / ts], [q1[0] / ts, q1[2] / ts], [q0[0] / ts, q0[2] / ts], col, 1);
      }
    }
    const out = [];
    for (const [k, g] of groups) {
      const mk = k.split('|')[0], mt = MT[mk] || MT.default;
      const geo = own(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.Float32BufferAttribute(g.P, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.N, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.U, 2));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(g.C, 3));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mt.mat);
      mesh.castShadow = !g.ns; mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false; mesh.updateMatrix();
      out.push(mesh);
    }
    return out;
  }

  function mkAudio(api, G) {
    let ctx = null, out = null, noiseB = null, lx = 0, ly = 0, lz = 0, lyaw = 0, vol = 1, live = 0, liveT = 0;
    const ensure = () => {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.5;
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; out.connect(comp); comp.connect(ctx.destination);
        noiseB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
      return ctx;
    };
    const dest = (x, y, z, near) => {
      if (x == null) return { g: 1, d: out };
      const dx = x - lx, dz = z - lz, dist = Math.hypot(dx, y - ly, dz);
      const g = 1 / (1 + Math.max(0, dist - (near || 2)) * 0.11);
      if (g < 0.03) return null;
      const n = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (n) { const ang = Math.atan2(-dx, -dz) - lyaw; n.pan.value = clamp(-Math.sin(ang) * Math.min(1, dist / 4), -0.85, 0.85); n.connect(out); }
      return { g, d: n || out };
    };
    const A = {
      tone(f0, f1, dur, type, v, when, D) {
        const t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v * D.g * vol), t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(D.d); o.start(t); o.stop(t + dur + 0.03);
      },
      noise(dur, v, f, Q, when, type, f1, D) {
        const t = ctx.currentTime + (when || 0), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = noiseB; fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = Q || 1;
        g.gain.setValueAtTime(Math.max(0.0002, v * D.g * vol), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(fl); fl.connect(g); g.connect(D.d); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
      },
      play(name, x, y, z, k) {
        if (api.muted || !ensure() || !G.sounds[name]) return;
        const now = ctx.currentTime;
        if (now - liveT > 0.05) { live = 0; liveT = now; }
        if (++live > 14) return;
        const D = dest(x, y, z);
        if (!D) return;
        try { G.sounds[name](A, D, k); } catch (e) {}
      },
      listener(x, y, z, yaw) { lx = x; ly = y; lz = z; lyaw = yaw; },
      unlock() { ensure(); },
      set vol(v) { vol = v; },
      close() { if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
    return A;
  }

  function mkView(api, V, G, wrap) {
    const { THREE, renderer, canvas } = V;
    const bin = [], own = x => (bin.push(x), x);
    const kit = mkKit(THREE, own);
    const lin = kit.lin;
    renderer.toneMappingExposure = G.exposure || 1;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(75, V.w / V.h, 0.05, 600);
    cam.rotation.order = 'YXZ';
    const vScene = new THREE.Scene(), vCam = new THREE.PerspectiveCamera(58, V.w / V.h, 0.01, 10);
    vScene.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.75));
    const vSun = new THREE.DirectionalLight(0xffffff, 0.75); vSun.position.set(-0.4, 1, 0.6); vScene.add(vSun);
    const vFlash = new THREE.PointLight(0xffc860, 0, 2.2); vScene.add(vFlash);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 0.6); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.castShadow = true; scene.add(sun, sun.target);
    const flash = new THREE.PointLight(0xffc070, 0, 9); scene.add(flash);
    const boomL = new THREE.PointLight(0xff9a40, 0, 16); scene.add(boomL);
    G.mats.default = G.mats.default || { color: '#aaaaaa' };
    for (const k in G.mats) {
      const mt = G.mats[k];
      const tex = mt.tex ? canvasTex(THREE, own, mt.res || 64, mt.tex, { pixel: G.pixel }) : null;
      mt.mat = own(mt.lambert === false ? new THREE.MeshPhongMaterial({ map: tex, vertexColors: true, shininess: mt.shine || 20 }) : new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, emissive: mt.glow ? lin(mt.glow) : 0x000000, emissiveIntensity: mt.glow ? 1 : 0 }));
    }
    let mapMeshes = [], mapGroup = new THREE.Group(), skyG = null, curMap = null;
    scene.add(mapGroup);
    function setMap(M) {
      if (curMap === M) return;
      curMap = M;
      for (const m of mapMeshes) mapGroup.remove(m);
      while (mapGroup.children.length) mapGroup.remove(mapGroup.children[0]);
      mapMeshes = buildMapMeshes(THREE, own, M, G);
      for (const m of mapMeshes) mapGroup.add(m);
      const D = M.def, sky = D.sky || G.sky;
      if (skyG) scene.remove(skyG);
      skyG = G.makeSky(kit, sky, D);
      scene.add(skyG);
      scene.fog = new THREE.Fog(lin(sky.fog), sky.fogNear || 60, sky.fogFar || 260);
      renderer.setClearColor(lin(sky.fog));
      hemi.color.copy(lin(sky.hemiTop || '#ffffff')); hemi.groundColor.copy(lin(sky.hemiBot || '#888888')); hemi.intensity = sky.hemi == null ? 0.62 : sky.hemi;
      sun.color.copy(lin(sky.sun || '#fff3dd')); sun.intensity = sky.sunI == null ? 0.95 : sky.sunI;
      const cx = (M.x0 + M.x1) / 2, cz = (M.z0 + M.z1) / 2, span = Math.max(M.x1 - M.x0, M.z1 - M.z0) * 0.62 + 4;
      const sd = sky.sunDir || [-0.45, 1, 0.35], sl = Math.hypot(...sd);
      sun.position.set(cx + sd[0] / sl * 80, sd[1] / sl * 80, cz + sd[2] / sl * 80); sun.target.position.set(cx, 0, cz);
      const S = COARSE ? 1024 : 2048, sc = sun.shadow.camera;
      sun.shadow.mapSize.set(S, S); sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 10; sc.far = 200; sc.updateProjectionMatrix();
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
      renderer.shadowMap.needsUpdate = true;
      for (const pr of M.props) { const o = G.makeProp && G.makeProp(kit, pr); if (o) { o.position.set(pr.x, pr.y, pr.z); o.rotation.y = pr.a; mapGroup.add(o); } }
      pickMeshes.forEach(m => scene.remove(m)); pickMeshes.length = 0;
      zoneMesh.visible = false;
    }

    const chars = [];
    function charFor(slot, look) {
      let c = chars[slot];
      const key = look.team + '|' + look.cls + '|' + look.color;
      if (c && c.key === key) return c;
      if (c) { scene.remove(c.root); c.dispose && c.dispose(); }
      c = G.makeChar(kit, look);
      c.key = key; c.slot = slot;
      c.tag = mkTag();
      c.root.add(c.tag.spr);
      scene.add(c.root);
      chars[slot] = c;
      return c;
    }
    function dropChar(slot) { const c = chars[slot]; if (c) { scene.remove(c.root); c.dispose && c.dispose(); chars[slot] = null; } }
    function mkTag() {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
      const tex = own(new THREE.CanvasTexture(cv)); tex.encoding = THREE.sRGBEncoding;
      const spr = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false, sizeAttenuation: false })));
      spr.scale.set(0.2, 0.05, 1); spr.renderOrder = 10; spr.visible = false;
      let last = '';
      return {
        spr,
        set(name, col, hp, show) {
          const k = name + col + Math.round(hp * 20);
          if (k !== last) {
            last = k;
            const g = cv.getContext('2d');
            g.clearRect(0, 0, 256, 64);
            g.font = '700 26px ' + (G.font || 'system-ui, sans-serif'); g.textAlign = 'center'; g.textBaseline = 'middle';
            g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.65)'; g.strokeText(name, 128, 22); g.fillStyle = col; g.fillText(name, 128, 22);
            if (hp >= 0) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(58, 44, 140, 10); g.fillStyle = hp > 0.5 ? '#5fe36a' : hp > 0.25 ? '#ffc93c' : '#ff4b4b'; g.fillRect(60, 46, 136 * clamp(hp, 0, 1), 6); }
            tex.needsUpdate = true;
          }
          spr.visible = show;
        }
      };
    }

    const viewModels = new Map();
    let vmCur = null, vmKey = '';
    const vmRoot = new THREE.Group(); vScene.add(vmRoot);
    function viewFor(k) {
      if (vmKey === k && vmCur) return vmCur;
      if (vmCur) vmRoot.remove(vmCur.root);
      let m = viewModels.get(k);
      if (!m) { m = G.makeView(kit, k); viewModels.set(k, m); }
      vmCur = m; vmKey = k; vmRoot.add(m.root);
      return m;
    }

    const trGeo = own(new THREE.BoxGeometry(1, 1, 1)); trGeo.translate(0, 0, 0.5);
    const trMat = own(new THREE.MeshBasicMaterial({ color: lin(G.tracer || '#ffe9a0'), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const TRN = 48, trMesh = new THREE.InstancedMesh(trGeo, trMat, TRN); trMesh.frustumCulled = false; trMesh.count = 0; scene.add(trMesh);
    const trs = Array.from({ length: TRN }, () => ({ on: false, ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0, t: 0, life: 0.07, w: 0.025 }));
    let trI = 0;
    const PN = 700, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN), pMax = new Float32Array(PN), pGr = new Float32Array(PN);
    const pGeo = own(new THREE.BufferGeometry());
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const dotTex = canvasTex(THREE, own, 32, (g, S) => { if (G.pixel) { g.fillStyle = '#fff'; g.fillRect(6, 6, S - 12, S - 12); } else { const r = g.createRadialGradient(S / 2, S / 2, 1, S / 2, S / 2, S / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.55, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S); } });
    const pMat = own(new THREE.PointsMaterial({ size: 0.12, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, alphaTest: 0.05 }));
    const pts = new THREE.Points(pGeo, pMat); pts.frustumCulled = false; scene.add(pts);
    for (let i = 0; i < PN; i++) pPos[i * 3 + 1] = -999;
    let pI = 0;
    const tc = new THREE.Color();
    function burst(x, y, z, n, col, spd, up, life, grav, nx, ny, nz) {
      tc.copy(lin(col));
      for (let k = 0; k < n; k++) {
        const i = pI; pI = (pI + 1) % PN;
        pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
        let vx = (Math.random() - 0.5) * 2, vy = (Math.random() - 0.5) * 2, vz = (Math.random() - 0.5) * 2;
        if (nx != null) { vx += nx * 1.3; vy += ny * 1.3; vz += nz * 1.3; }
        pVel[i * 3] = vx * spd; pVel[i * 3 + 1] = vy * spd + (up || 0); pVel[i * 3 + 2] = vz * spd;
        const s = 0.75 + Math.random() * 0.4;
        pCol[i * 3] = tc.r * s; pCol[i * 3 + 1] = tc.g * s; pCol[i * 3 + 2] = tc.b * s;
        pLife[i] = pMax[i] = life * (0.6 + Math.random() * 0.6); pGr[i] = grav == null ? 9 : grav;
      }
    }
    const DN = 72, dGeo = own(new THREE.PlaneGeometry(1, 1));
    const holeTex = canvasTex(THREE, own, 32, G.holeTex || ((g, S) => { g.fillStyle = 'rgba(20,18,16,.9)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.2, 0, TAU); g.fill(); g.fillStyle = 'rgba(20,18,16,.3)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.36, 0, TAU); g.fill(); }));
    const dMat = own(new THREE.MeshBasicMaterial({ map: holeTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    const dMesh = new THREE.InstancedMesh(dGeo, dMat, DN); dMesh.count = 0; dMesh.frustumCulled = false; scene.add(dMesh);
    let dI = 0, dCount = 0;
    const SN = 24, sTex = canvasTex(THREE, own, 128, G.splatTex || ((g, S) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, TAU); g.fill(); }));
    const sMat = own(new THREE.MeshLambertMaterial({ map: sTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    const sMesh = new THREE.InstancedMesh(dGeo, sMat, SN); sMesh.count = 0; sMesh.frustumCulled = false; scene.add(sMesh);
    let sI = 0, sCount = 0;
    const o3 = new THREE.Object3D(), nV = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1);
    function decal(mesh, idx, x, y, z, nx, ny, nz, size, spin) {
      o3.position.set(x + nx * 0.01, y + ny * 0.01, z + nz * 0.01);
      nV.set(nx, ny, nz);
      o3.quaternion.setFromUnitVectors(up, nV);
      o3.rotateZ(spin == null ? Math.random() * TAU : spin);
      o3.scale.set(size, size, size);
      o3.updateMatrix();
      mesh.setMatrixAt(idx, o3.matrix);
      mesh.instanceMatrix.needsUpdate = true;
    }
    const DBN = 120, dbGeo = G.debrisGeo ? G.debrisGeo(kit) : kit.G0.box;
    const dbMat = own(new THREE.MeshLambertMaterial({ vertexColors: false, color: 0xffffff }));
    const dbMesh = new THREE.InstancedMesh(dbGeo, dbMat, DBN); dbMesh.castShadow = false; dbMesh.frustumCulled = false; dbMesh.count = DBN;
    const dbs = Array.from({ length: DBN }, () => ({ on: false, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, wx: 0, wy: 0, wz: 0, s: 0.1, life: 0, floor: 0 }));
    let dbI = 0;
    o3.scale.set(0, 0, 0); o3.position.set(0, -99, 0); o3.updateMatrix();
    for (let i = 0; i < DBN; i++) { dbMesh.setMatrixAt(i, o3.matrix); dbMesh.setColorAt(i, tc.set(0xffffff)); }
    scene.add(dbMesh);
    function debris(x, y, z, n, cols, spd, size, life, floorY) {
      for (let k = 0; k < n; k++) {
        const d = dbs[dbI]; dbMesh.setColorAt(dbI, tc.copy(lin(cols[k % cols.length]))); dbI = (dbI + 1) % DBN;
        d.on = true; d.x = x + (Math.random() - 0.5) * 0.4; d.y = y + Math.random() * 0.8; d.z = z + (Math.random() - 0.5) * 0.4;
        d.vx = (Math.random() - 0.5) * spd * 2; d.vy = Math.random() * spd * 1.2 + 1.5; d.vz = (Math.random() - 0.5) * spd * 2;
        d.rx = Math.random() * TAU; d.ry = Math.random() * TAU; d.rz = Math.random() * TAU; d.wx = (Math.random() - 0.5) * 14; d.wy = (Math.random() - 0.5) * 14; d.wz = (Math.random() - 0.5) * 14;
        d.s = size * (0.6 + Math.random() * 0.8); d.life = life * (0.8 + Math.random() * 0.4); d.floor = floorY;
      }
      if (dbMesh.instanceColor) dbMesh.instanceColor.needsUpdate = true;
    }
    const boomGeo = own(new THREE.SphereGeometry(1, 16, 12));
    const booms = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(boomGeo, own(new THREE.MeshBasicMaterial({ color: lin(G.boomCol || '#ffb040'), transparent: true, opacity: 0, depthWrite: false, fog: false }))); m.visible = false; scene.add(m); return { m, t: 9, r: 1 }; });
    let bI = 0, shake = 0, boomT = 9;
    function boom(x, y, z, r) {
      const b = booms[bI]; bI = (bI + 1) % booms.length;
      b.m.position.set(x, y, z); b.t = 0; b.r = r; b.m.visible = true;
      boomL.position.set(x, y + 0.5, z); boomT = 0;
      burst(x, y + 0.2, z, 28, G.boomCol || '#ffb040', 5, 3, 0.6, 3);
      burst(x, y + 0.2, z, 20, '#555555', 3, 2, 1.2, 1);
    }
    const pickMeshes = [];
    const zoneMesh = G.makeZone ? G.makeZone(kit) : new THREE.Group(); zoneMesh.visible = false; scene.add(zoneMesh);
    const projMeshes = new Map();
    function projMesh(id, kind) {
      let m = projMeshes.get(id);
      if (!m) { m = G.makeProj(kit, kind); m.userData.kind = kind; projMeshes.set(id, m); scene.add(m); }
      return m;
    }
    function dropProj(id) { const m = projMeshes.get(id); if (m) { scene.remove(m); projMeshes.delete(id); } }

    const mfTex = canvasTex(THREE, own, 64, (g, S) => {
      const r = g.createRadialGradient(S / 2, S / 2, 1, S / 2, S / 2, S / 2); r.addColorStop(0, 'rgba(255,255,230,1)'); r.addColorStop(0.3, 'rgba(255,210,90,.9)'); r.addColorStop(1, 'rgba(255,140,20,0)');
      g.fillStyle = r; g.beginPath();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = i % 2 ? S * 0.18 : S * 0.5; g.lineTo(S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr); }
      g.fill();
    });
    const mfMat = own(new THREE.SpriteMaterial({ map: mfTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    const vmFlash = new THREE.Sprite(mfMat); vmFlash.scale.set(0.22, 0.22, 1); vmFlash.visible = false; vmFlash.renderOrder = 5; vScene.add(vmFlash);
    const vmFlashP = new THREE.Vector3();

    const tmpM = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts3 = new THREE.Vector3(), tpos = new THREE.Vector3(), dirV = new THREE.Vector3();
    function frameFx(dt) {
      let n = 0;
      for (const t of trs) {
        if (!t.on) continue;
        t.t += dt;
        if (t.t > t.life) { t.on = false; continue; }
        const k = t.t / t.life, sx = t.ax + (t.bx - t.ax) * k * 0.6, sy = t.ay + (t.by - t.ay) * k * 0.6, sz = t.az + (t.bz - t.az) * k * 0.6;
        dirV.set(t.bx - sx, t.by - sy, t.bz - sz);
        const len = dirV.length();
        if (len < 0.05) { t.on = false; continue; }
        dirV.divideScalar(len);
        tq.setFromUnitVectors(up, dirV);
        tmpM.compose(tpos.set(sx, sy, sz), tq, ts3.set(t.w * (1 - k * 0.5), t.w * (1 - k * 0.5), len));
        trMesh.setMatrixAt(n++, tmpM);
      }
      trMesh.count = n; if (n) trMesh.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < PN; i++) {
        if (pLife[i] <= 0) continue;
        pLife[i] -= dt;
        if (pLife[i] <= 0) { pPos[i * 3 + 1] = -999; continue; }
        pVel[i * 3 + 1] -= pGr[i] * dt;
        pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
        const f = Math.min(1, pLife[i] / pMax[i] * 2.5);
        if (f < 1) { pCol[i * 3] *= 0.97; pCol[i * 3 + 1] *= 0.97; pCol[i * 3 + 2] *= 0.97; }
      }
      pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
      let any = false;
      for (let i = 0; i < DBN; i++) {
        const d = dbs[i];
        if (!d.on) continue;
        any = true;
        d.life -= dt;
        if (d.life <= 0) { d.on = false; o3.position.set(0, -99, 0); o3.scale.set(0, 0, 0); o3.updateMatrix(); dbMesh.setMatrixAt(i, o3.matrix); continue; }
        d.vy -= 14 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
        if (d.y < d.floor + d.s * 0.3) { d.y = d.floor + d.s * 0.3; d.vy = Math.abs(d.vy) * 0.3; d.vx *= 0.6; d.vz *= 0.6; d.wx *= 0.6; d.wy *= 0.6; d.wz *= 0.6; }
        d.rx += d.wx * dt; d.ry += d.wy * dt; d.rz += d.wz * dt;
        const s = d.s * Math.min(1, d.life * 2);
        o3.position.set(d.x, d.y, d.z); o3.rotation.set(d.rx, d.ry, d.rz); o3.scale.set(s, s, s); o3.updateMatrix();
        dbMesh.setMatrixAt(i, o3.matrix);
      }
      if (any) dbMesh.instanceMatrix.needsUpdate = true;
      for (const b of booms) {
        if (b.t > 0.5) { if (b.m.visible) b.m.visible = false; continue; }
        b.t += dt;
        const k = b.t / 0.5;
        b.m.scale.setScalar(b.r * (0.25 + 0.9 * Math.sqrt(k)));
        b.m.material.opacity = Math.max(0, 0.9 * (1 - k));
      }
      boomT += dt;
      boomL.intensity = boomT < 0.3 ? 4 * (1 - boomT / 0.3) : 0;
      if (flash.intensity > 0) flash.intensity = Math.max(0, flash.intensity - dt * 40);
      if (vFlash.intensity > 0) vFlash.intensity = Math.max(0, vFlash.intensity - dt * 30);
    }
    function tracer(ax, ay, az, bx, by, bz, w, life) {
      const t = trs[trI]; trI = (trI + 1) % TRN;
      t.on = true; t.ax = ax; t.ay = ay; t.az = az; t.bx = bx; t.by = by; t.bz = bz; t.t = 0; t.w = w || 0.025; t.life = life || 0.07;
    }
    function hole(x, y, z, nx, ny, nz) { decal(dMesh, dI, x, y, z, nx, ny, nz, 0.14 + Math.random() * 0.05); dI = (dI + 1) % DN; dCount = Math.min(DN, dCount + 1); dMesh.count = dCount; }
    function splat(x, y, z, nx, ny, nz, size) { decal(sMesh, sI, x, y, z, nx, ny, nz, size); sI = (sI + 1) % SN; sCount = Math.min(SN, sCount + 1); sMesh.count = sCount; }
    function clearFx() {
      for (const t of trs) t.on = false;
      for (let i = 0; i < PN; i++) { pLife[i] = 0; pPos[i * 3 + 1] = -999; }
      for (const d of dbs) if (d.on) d.life = 0.001;
      dCount = 0; dMesh.count = 0; sCount = 0; sMesh.count = 0;
      for (const id of [...projMeshes.keys()]) dropProj(id);
    }

    const VS = { bob: 0, bobA: 0, swayX: 0, swayY: 0, kick: 0, kickR: 0, land: 0, prevYaw: 0, prevPit: 0, lastFire: -9, fireT: 9 };
    function drawView(s, dt) {
      vmRoot.visible = s.show;
      if (!s.show) { vmFlash.visible = false; return; }
      const m = viewFor(s.wk);
      const ads = s.ads;
      const hip = m.hip, aim = m.aim;
      const sp = s.spd;
      VS.bobA += dt * (s.ground ? 7 + sp * 0.9 : 0) * (s.slide ? 0 : 1);
      const bAmt = s.ground && !s.slide ? Math.min(1, sp / 6) * (1 - ads * 0.85) : 0;
      VS.bob = damp(VS.bob, bAmt, 10, dt);
      const dy = angD(s.yaw, VS.prevYaw), dp = s.pitch - VS.prevPit;
      VS.prevYaw = s.yaw; VS.prevPit = s.pitch;
      VS.swayX = damp(VS.swayX, clamp(-dy * 1.6, -0.06, 0.06) * (1 - ads * 0.8), 9, dt);
      VS.swayY = damp(VS.swayY, clamp(-dp * 1.6, -0.05, 0.05) * (1 - ads * 0.8), 9, dt);
      VS.kick = damp(VS.kick, 0, m.kickRec || 14, dt); VS.kickR = damp(VS.kickR, 0, 12, dt);
      VS.land = damp(VS.land, 0, 8, dt);
      const bx = Math.sin(VS.bobA) * 0.018 * VS.bob, by = -Math.abs(Math.cos(VS.bobA)) * 0.02 * VS.bob;
      const rl = s.reload, sw = s.swap, me = s.melee;
      const rDip = rl >= 0 ? Math.sin(Math.min(1, rl) * Math.PI) : 0;
      const sDip = sw > 0 ? sw : 0;
      const slideT = s.slide ? 1 : 0;
      VS.sl = damp(VS.sl || 0, slideT, 8, dt);
      const x = lerp(hip[0], aim[0], ads) + bx + VS.swayX - VS.sl * 0.04;
      const y = lerp(hip[1], aim[1], ads) + by + VS.swayY - rDip * 0.12 - sDip * 0.35 - VS.land * 0.04 - VS.sl * 0.03;
      const z = lerp(hip[2], aim[2], ads) + VS.kick * (m.kickZ || 0.08);
      vmRoot.position.set(x, y, z);
      vmRoot.rotation.set(VS.kick * (m.kickRot || 0.6) + rDip * 0.5 + sDip * 0.8, VS.swayX * 2, VS.kickR + rDip * (m.reloadRoll || 0.6) + VS.sl * 0.35);
      if (m.anim) m.anim(s, dt, rl, me);
      vmFlash.visible = s.fireT < 0.05 && !m.noFlash;
      if (vmFlash.visible) { m.muzzle.getWorldPosition(vmFlashP); vmFlash.position.copy(vmFlashP); vmFlash.material.rotation = Math.random() * TAU; const k = 0.09 + Math.random() * 0.05; vmFlash.scale.set(k * (m.flashS || 1), k * (m.flashS || 1), 1); vFlash.position.copy(vmFlashP); }
    }
    function kickView(k, roll) { VS.kick += k; VS.kickR += (Math.random() - 0.5) * (roll || 0.05); vFlash.intensity = 2.5; }
    function landView(k) { VS.land += k; }

    const raycastV = new THREE.Vector3();
    function render(camS) {
      cam.position.set(camS.x, camS.y, camS.z);
      cam.rotation.set(camS.pitch, camS.yaw, camS.roll || 0);
      const fov = camS.fov;
      if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
      if (Math.abs(vCam.fov - camS.vfov) > 0.01) { vCam.fov = camS.vfov; vCam.updateProjectionMatrix(); }
      if (skyG) skyG.position.set(camS.x, 0, camS.z);
      renderer.autoClear = true;
      renderer.render(scene, cam);
      if (vmRoot.visible || vmFlash.visible) {
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(vScene, vCam);
        renderer.autoClear = true;
      }
    }
    function flashAt(x, y, z) { flash.position.set(x, y, z); flash.intensity = 2.2; }

    return {
      THREE, kit, scene, cam, vCam, renderer, setMap, charFor, dropChar, chars, burst, debris, boom, tracer, hole, splat, frameFx, drawView, kickView, landView, render, projMesh, dropProj, projMeshes, zoneMesh, pickMeshes, clearFx, flashAt, own, lin,
      get shake() { return shake; }, set shake(v) { shake = v; },
      dispose() { for (const o of bin) { try { o.dispose(); } catch (e) {} } bin.length = 0; }
    };
  }
