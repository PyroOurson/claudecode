
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const wrapA = a => ((a % TAU) + TAU) % TAU;
  const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const rng = s => () => {
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  function mergeParts(THREE, list) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    const P = [], N = [], U = [], Cc = [];
    for (const [g, p = [0, 0, 0], r = [0, 0, 0], k = [1, 1, 1], shade] of list) {
      const t = g.index ? g.toNonIndexed() : g.clone();
      m.compose(v.set(p[0], p[1], p[2]), q.setFromEuler(e.set(r[0], r[1], r[2])), sc.set(k[0], k[1], k[2]));
      t.applyMatrix4(m);
      const pos = t.attributes.position.array;
      P.push(pos); N.push(t.attributes.normal.array); U.push(t.attributes.uv.array);
      if (shade) {
        const c = new Float32Array(pos.length), lo = -0.5, hi = 0.5;
        for (let i = 0; i < pos.length; i += 3) { const u = clamp((pos[i + 1] - lo) / (hi - lo), 0, 1), s = shade[0] + (shade[1] - shade[0]) * u; c[i] = c[i + 1] = c[i + 2] = s; }
        Cc.push(c);
      }
      t.dispose();
    }
    const cat = (arr, n) => {
      const out = new Float32Array(arr.reduce((t, a) => t + a.length, 0));
      let o = 0;
      for (const a of arr) { out.set(a, o); o += a.length; }
      return new THREE.BufferAttribute(out, n);
    };
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', cat(P, 3)); geo.setAttribute('normal', cat(N, 3)); geo.setAttribute('uv', cat(U, 2));
    if (Cc.length === list.length) geo.setAttribute('color', cat(Cc, 3));
    return geo;
  }

  const COARSE = matchMedia('(pointer: coarse)').matches;
  function fitPR(api, v) {
    if (!COARSE) return;
    const fit = () => { const cw = v.canvas.clientWidth; if (cw && !document.fullscreenElement) v.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / v.w); };
    fit(); api.on(window, 'resize', fit);
  }

  const STAGE_CSS = id => `
.gm-${id} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;box-shadow:0 22px 44px -28px rgba(31,29,43,.55)}
.gm-${id} .stage canvas{border-radius:0}
.gm-${id} .pop{position:absolute;font:900 clamp(15px,5cqw,26px)/1 var(--sans);color:#fff;white-space:nowrap;pointer-events:none;text-shadow:0 2px 0 rgba(31,29,43,.28),0 4px 14px rgba(31,29,43,.25)}`;

  const mount3d = (size, game) => (root, api) => {
    let stop = null;
    const [w, h] = size(root);
    api.gl(w, h).then(gl => { if (gl && api.alive) { stop = game(root, api, gl); fitPR(api, gl); } }).catch(e => {
      console.error(e);
      if (api.alive) api.overlay({ kicker: '3D', title: 'WebGL unavailable', text: 'This game needs WebGL, which your browser could not start.', button: null });
    });
    return { destroy() { if (stop) stop(); } };
  };

  function stage(root, canvas, html) {
    const el = document.createElement('div');
    el.className = 'stage';
    el.style.width = canvas.style.width;
    canvas.style.width = '100%';
    root.append(el);
    el.append(canvas);
    el.insertAdjacentHTML('beforeend', html);
    return el;
  }

  function pop(st, text, x, y, color) {
    const el = document.createElement('div');
    el.className = 'pop';
    el.textContent = text;
    el.style.left = x + '%'; el.style.top = y + '%';
    if (color) el.style.color = color;
    st.append(el);
    el.animate([
      { transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 },
      { transform: 'translate(-50%,-110%) scale(1.15)', opacity: 1, offset: .22 },
      { transform: 'translate(-50%,-280%) scale(1)', opacity: 0 }
    ], { duration: 950, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => el.remove();
  }

  function skyDome(THREE, keep, r) {
    const cv = document.createElement('canvas');
    cv.width = 4; cv.height = 256;
    const tex = keep(new THREE.CanvasTexture(cv));
    tex.encoding = THREE.sRGBEncoding;
    const mesh = new THREE.Mesh(keep(new THREE.SphereGeometry(r, 32, 24)), keep(new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })));
    mesh.renderOrder = -1;
    return {
      mesh,
      paint(stops) {
        const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
        for (const [elev, col] of stops) g.addColorStop(clamp(.5 - elev / 180, 0, 1), col);
        x.fillStyle = g; x.fillRect(0, 0, 4, 256);
        tex.needsUpdate = true;
      }
    };
  }

  function particles(THREE, scene, keep, max) {
    const mesh = new THREE.InstancedMesh(keep(new THREE.IcosahedronGeometry(1, 0)), keep(new THREE.MeshStandardMaterial({ roughness: .5, flatShading: true, emissive: 0x202020 })), max);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    const P = [], o = new THREE.Object3D(), white = new THREE.Color(1, 1, 1);
    for (let i = 0; i < max; i++) {
      mesh.setColorAt(i, white);
      P.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, size: 1, g: 1, r: 0, c: new THREE.Color() });
    }
    mesh.count = 0;
    scene.add(mesh);
    let n = 0;
    return {
      emit(x, y, z, vx, vy, vz, size, life, color, g = 1) {
        if (n >= max) return;
        const p = P[n++];
        p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz;
        p.size = size; p.life = p.max = life; p.g = g; p.r = Math.random() * 6; p.c.copy(color);
      },
      update(dt, G) {
        let j = 0;
        for (let i = 0; i < n; i++) {
          const p = P[i];
          if ((p.life -= dt) <= 0) continue;
          p.vy -= G * p.g * dt;
          p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.r += dt * 5;
          if (i !== j) { P[i] = P[j]; P[j] = p; }
          const s = p.size * Math.min(1, 2.2 * p.life / p.max);
          o.position.set(p.x, p.y, p.z); o.rotation.set(p.r, p.r * .7, 0); o.scale.set(s, s, s); o.updateMatrix();
          mesh.setMatrixAt(j, o.matrix); mesh.setColorAt(j, p.c);
          j++;
        }
        n = j; mesh.count = n;
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
      },
      clear() { n = 0; mesh.count = 0; }
    };
  }

  const HX = { SEG: 12, RIN: .62, ROUT: 2.7, TH: .36, GAP: 3.3, BR: .3, BZ: 1.68, G: 34, BOUNCE: 10.6, VMAX: 18 };
  const HX_SLOT = TAU / HX.SEG;
  const HX_PAL = [
    { top: '#4fb8ff', bot: '#e3f6ff', plat: '#ffc83d', ball: '#ff4f8b', pole: '#fff8ec' },
    { top: '#ff7fbf', bot: '#ffeaf5', plat: '#7a5cff', ball: '#ffc83d', pole: '#ffffff' },
    { top: '#3fd6a8', bot: '#e7fff5', plat: '#3d8bfd', ball: '#ff7a3d', pole: '#ffffff' },
    { top: '#9c7cff', bot: '#f2ecff', plat: '#21c7a8', ball: '#ff4f8b', pole: '#ffffff' },
    { top: '#ff9f50', bot: '#fff0de', plat: '#5b7cfa', ball: '#22c55e', pole: '#ffffff' },
    { top: '#38c4dc', bot: '#e2fbff', plat: '#a3e635', ball: '#7a5cff', pole: '#ffffff' }
  ];

  function hxLevel(L) {
    const r = rng(L * 7919 + 17), n = Math.min(9 + L * 3, 39), out = [];
    for (let i = 0; i < n; i++) {
      const s = new Array(HX.SEG).fill(1);
      const gl = L < 3 ? 3 : r() < .5 ? 2 : 3;
      const g0 = i === 0 ? Math.floor(r() * 5) : Math.floor(r() * HX.SEG);
      for (let k = 0; k < gl; k++) s[(g0 + k) % HX.SEG] = 0;
      if (L >= 4 && i > 1 && r() < .3) s[(g0 + gl + 3 + Math.floor(r() * 4)) % HX.SEG] = 0;
      let d = i < 2 ? 0 : Math.min(6, Math.round((L * .55 + .1) * (.4 + r())));
      for (let tries = 0; d > 0 && tries < 50; tries++) {
        const j = Math.floor(r() * HX.SEG);
        if (s[j] !== 1) continue;
        s[j] = 2; d--;
        if (d > 0 && L >= 3 && r() < .45 && s[(j + 1) % HX.SEG] === 1) { s[(j + 1) % HX.SEG] = 2; d--; }
      }
      const p = { slots: s, spin: 0, osc: 0, mover: null };
      if (L >= 3 && i > 1 && r() < Math.min(.45, (L - 2) * .12)) p.spin = (r() < .5 ? -1 : 1) * (.45 + r() * .35 + L * .04);
      if (L >= 6 && p.spin && r() < .4) { p.osc = Math.sign(p.spin) * (.7 + r() * .4); p.spin = 0; }
      if (L >= 4 && i > 1 && r() < Math.min(.4, (L - 3) * .12)) {
        for (let j = 0; j < HX.SEG; j++) {
          if (s[j] !== 1 || s[(j + HX.SEG - 1) % HX.SEG] === 1) continue;
          let m = 0;
          while (m < HX.SEG && s[(j + m) % HX.SEG] === 1) m++;
          if (m >= 3) { p.mover = { base: (j + m / 2) * HX_SLOT, amp: (m - 1) / 2 * HX_SLOT, spd: 1.3 + r() * .8 }; break; }
        }
      }
      out.push(p);
    }
    return out;
  }

  function helixGame(root, api, gl) {
    const { THREE, renderer, canvas } = gl;
    renderer.toneMapping = THREE.NoToneMapping;
    const bin = [], keep = o => (bin.push(o), o), lin = h => new THREE.Color(h).convertSRGBToLinear();
    const keys = api.keys;
    const st = stage(root, canvas, '<div class="hud"><div class="lv"><b class="a">1</b><span class="bar"><i></i></span><b class="b">2</b></div><div class="sc">0</div></div><div class="flash"></div>');
    const elA = st.querySelector('.a'), elB = st.querySelector('.b'), elBar = st.querySelector('.bar i'), elSc = st.querySelector('.sc'), elFlash = st.querySelector('.flash');

    const scene = new THREE.Scene();
    const sky = skyDome(THREE, keep, 60);
    const sunTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.14, 'rgba(255,252,230,.95)'); g.addColorStop(0.2, 'rgba(255,240,200,.55)'); g.addColorStop(0.5, 'rgba(255,235,190,.16)'); g.addColorStop(1, 'rgba(255,235,190,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
      return keep(t);
    })();
    const sunSpr = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: sunTex, fog: false, depthWrite: false, transparent: true, toneMapped: false })));
    sunSpr.scale.setScalar(70); sunSpr.position.set(-80, 70, -105);
    sky.mesh.add(sunSpr);
    scene.add(sky.mesh);
    scene.fog = new THREE.Fog(0xffffff, 15, 34);
    const cam = new THREE.PerspectiveCamera(44, 560 / 760, .1, 100);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xa898cc, .6);
    const sun = new THREE.DirectionalLight(0xffffff, .62);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -4.6, right: 4.6, top: 4.6, bottom: -4.6, near: 1, far: 32 });
    sun.shadow.bias = -.0008; sun.shadow.normalBias = .02;
    scene.add(hemi, sun, sun.target);

    const tower = new THREE.Group();
    scene.add(tower);
    const mPole = keep(new THREE.MeshStandardMaterial({ roughness: .4 }));
    const mPlat = keep(new THREE.MeshStandardMaterial({ roughness: .38 }));
    const mDanger = keep(new THREE.MeshStandardMaterial({ color: lin('#ef233c'), roughness: .22, emissive: lin('#4a000e') }));
    const mFin = keep(new THREE.MeshStandardMaterial({ color: lin('#ffffff'), roughness: .35 }));
    const mBall = keep(new THREE.MeshStandardMaterial({ roughness: .2 }));
    const mSplat = keep(new THREE.MeshStandardMaterial({ roughness: .3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    const MATS = [null, mPlat, mDanger];
    const pole = new THREE.Mesh(keep(new THREE.CylinderGeometry(HX.RIN - .03, HX.RIN - .03, 1, 32)), mPole);
    pole.castShadow = pole.receiveShadow = true;
    tower.add(pole);

    const segGeos = [];
    const segGeo = n => segGeos[n] || (segGeos[n] = keep(makeSeg(n)));
    function makeSeg(n) {
      const a = n * HX_SLOT, s = new THREE.Shape();
      s.absarc(0, 0, HX.ROUT, 0, a, false);
      s.absarc(0, 0, HX.RIN, a, 0, true);
      const g = new THREE.ExtrudeGeometry(s, { depth: HX.TH - .1, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 2, curveSegments: Math.max(3, n * 4) });
      g.rotateX(-Math.PI / 2);
      g.translate(0, -(HX.TH - .05), 0);
      return g;
    }
    const splatGeos = [0, 1, 2].map(k => {
      const r = rng(k * 31 + 5), shapes = [], main = new THREE.Shape(), N = 18;
      for (let i = 0; i < N; i++) {
        const a = i / N * TAU, d = .22 + r() * .09 + (i % 4 === 0 ? .08 : 0);
        i ? main.lineTo(Math.cos(a) * d, Math.sin(a) * d) : main.moveTo(Math.cos(a) * d, Math.sin(a) * d);
      }
      shapes.push(main);
      for (let i = 0; i < 4; i++) {
        const a = r() * TAU, d = .4 + r() * .16, s = new THREE.Shape();
        s.absarc(Math.cos(a) * d, Math.sin(a) * d, .035 + r() * .04, 0, TAU, false);
        shapes.push(s);
      }
      return keep(new THREE.ShapeGeometry(shapes, 3));
    });

    const ball = new THREE.Mesh(keep(new THREE.SphereGeometry(HX.BR, 32, 20)), mBall);
    ball.castShadow = true;
    ball.position.z = HX.BZ;
    scene.add(ball);
    const fx = particles(THREE, scene, keep, 280);

    let state = 'idle', L = 1, score = 0, plats = [], next = 0, by = 0, vy = 0, streak = 0, squash = 0, shake = 0, lt = 0;
    let camY = 0, camT = 0, finY = 0, prog = -1, pal = HX_PAL[0], drag = null, lastX = 0;
    const debris = [], v3 = new THREE.Vector3(), cBall = new THREE.Color(), cPlat = new THREE.Color(), cWhite = new THREE.Color(1, 1, 1);
    const cFire = ['#fff3a0', '#ffc83d', '#ff7a1a', '#ff3d2e'].map(lin), cConf = C.hues.map(lin);

    function seg(grp, mat, s0, n) {
      const m = new THREE.Mesh(segGeo(n), mat);
      m.rotation.y = s0 * HX_SLOT;
      m.userData.mid = (s0 + n / 2) * HX_SLOT;
      m.castShadow = m.receiveShadow = true;
      grp.add(m);
      return m;
    }
    function makePlat(d, i) {
      const grp = new THREE.Group(), s = d.slots;
      grp.position.y = -i * HX.GAP;
      if (s[0] === 3) for (let k = 0; k < HX.SEG; k++) seg(grp, k % 2 ? mFin : mPlat, k, 1);
      else {
        let s0 = s.findIndex((t, k) => t !== s[(k + HX.SEG - 1) % HX.SEG]);
        if (s0 < 0) s0 = 0;
        for (let k = 0; k < HX.SEG;) {
          const t = s[(s0 + k) % HX.SEG];
          let n = 1;
          while (k + n < HX.SEG && s[(s0 + k + n) % HX.SEG] === t) n++;
          if (t) seg(grp, MATS[t], (s0 + k) % HX.SEG, n);
          k += n;
        }
      }
      let mover = null;
      if (d.mover) {
        const m = seg(grp, mDanger, 0, 1);
        m.scale.y = 1.4; m.position.y = .09;
        mover = { ...d.mover, mesh: m, ang: d.mover.base };
      }
      tower.add(grp);
      return { y: -i * HX.GAP, slots: s, spin: d.spin, osc: d.osc, rot: 0, mover, grp, splats: [], broken: false, bt: 0 };
    }

    function build(n) {
      for (const p of plats) tower.remove(p.grp);
      debris.length = 0; fx.clear();
      L = n; pal = HX_PAL[(n - 1) % HX_PAL.length];
      sky.paint([[0, pal.top], [-10, pal.top], [-55, pal.bot], [-90, pal.bot]]);
      scene.fog.color.copy(lin(pal.bot));
      mPole.color.copy(lin(pal.pole)); mPlat.color.copy(lin(pal.plat)); mBall.color.copy(lin(pal.ball)); mSplat.color.copy(mBall.color);
      cBall.copy(mBall.color); cPlat.copy(mPlat.color);
      st.style.setProperty('--hx', pal.ball);
      st.style.setProperty('--hp', pal.plat);
      const data = hxLevel(n);
      plats = data.map(makePlat);
      plats.push(makePlat({ slots: new Array(HX.SEG).fill(3), spin: 0, osc: 0, mover: null }, data.length));
      finY = plats[plats.length - 1].y;
      const top = HX.GAP * 1.4, bot = finY - 1.2;
      pole.scale.y = top - bot; pole.position.y = (top + bot) / 2;
      tower.rotation.y = 0;
      next = 0; streak = 0; lt = 0; squash = 0; shake = 0;
      by = HX.BR + 1.8; vy = 0; camY = camT = HX.BR; prog = -1;
      mBall.emissive.setRGB(0, 0, 0);
      elA.textContent = n; elB.textContent = n + 1;
    }

    function burst(x, y, z, n, col, sp, size, up = 1) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, s = sp * (.4 + Math.random() * .8);
        fx.emit(x, y, z, Math.cos(a) * s, up * (1 + Math.random() * 3), Math.sin(a) * s, size * (.6 + Math.random() * .7), .5 + Math.random() * .5, col);
      }
    }
    function screenPos() {
      v3.copy(ball.position).project(cam);
      return [(v3.x + 1) * 50, (1 - v3.y) * 50];
    }
    function shatter(p, power) {
      p.broken = true; p.bt = 0;
      for (const m of p.grp.children) {
        const a = m.userData.mid, sp = power * (2.2 + Math.random() * 2.4);
        m.userData.v = [Math.cos(a) * sp, power * (1 + Math.random() * 2.5), -Math.sin(a) * sp];
        m.userData.s = (Math.random() - .5) * 1.6;
        m.userData.k = m.scale.x;
      }
      debris.push(p);
    }
    function splat(p, local, big) {
      const m = new THREE.Mesh(splatGeos[(Math.random() * 3) | 0], mSplat);
      m.rotation.set(-Math.PI / 2, 0, Math.random() * TAU);
      m.scale.setScalar((big ? 1.6 : 1) * (.8 + Math.random() * .4));
      m.position.set(HX.BZ * Math.cos(local), .006, -HX.BZ * Math.sin(local));
      m.userData.mid = local;
      p.grp.add(m); p.splats.push(m);
      if (p.splats.length > 5) p.grp.remove(p.splats.shift());
    }

    function passed(p) {
      next++; streak++;
      const pts = L * streak;
      score += pts; api.score(score); elSc.textContent = score;
      shatter(p, 1);
      const [x, y] = screenPos();
      pop(st, '+' + pts, x + 12, y - 4);
      if (streak === 3) { pop(st, 'Fireball!', 50, 30, '#ffd23f'); api.sfx('good'); }
      else api.sfx('pop');
    }
    function smash(p) {
      next++; streak = 0;
      const pts = L * 2;
      score += pts; api.score(score); elSc.textContent = score;
      shatter(p, 1.8);
      burst(0, p.y + .1, HX.BZ, 26, cPlat, 6, .13, 1.4);
      for (let i = 0; i < 14; i++) burst(0, p.y + .1, HX.BZ, 1, cFire[i % 4], 5, .1, 1.6);
      shake = .35;
      const [x, y] = screenPos();
      pop(st, 'SMASH +' + pts, x, y - 6, '#ffd23f');
      api.sfx('hit');
    }
    function land(p) {
      const local = wrapA(-Math.PI / 2 - tower.rotation.y - p.rot);
      let t = p.slots[Math.floor(local / HX_SLOT) % HX.SEG];
      if (t === 1 && p.mover && Math.abs(angDiff(local, p.mover.ang)) < HX_SLOT / 2) t = 2;
      if (t === 0) { passed(p); return false; }
      by = p.y + HX.BR;
      if (t === 3) { vy = 0; finish(); return true; }
      if (streak >= 3) { smash(p); vy = HX.BOUNCE; return true; }
      if (t === 2) { vy = 0; die(p, local); return true; }
      vy = HX.BOUNCE; streak = 0; squash = 1;
      splat(p, local, false);
      burst(0, p.y + .05, HX.BZ, 7, cBall, 2.6, .07, .8);
      if (state === 'play') api.sfx('tap');
      return true;
    }
    function physics(dt) {
      const prev = by;
      vy = Math.max(vy - HX.G * dt, -HX.VMAX);
      by += vy * dt;
      while (next < plats.length) {
        const p = plats[next];
        if (!(vy < 0 && prev - HX.BR >= p.y - 1e-4 && by - HX.BR <= p.y)) break;
        if (land(p)) break;
      }
    }

    function die(p, local) {
      state = 'dead'; squash = 1; streak = 0;
      splat(p, local, true);
      burst(0, p.y + .1, HX.BZ, 30, cBall, 4.5, .1, 1.2);
      shake = .5;
      elFlash.animate([{ opacity: .5 }, { opacity: 0 }], { duration: 550, easing: 'ease-out' });
      api.sfx('lose');
      api.timeout(gameOver, 1000);
    }
    function gameOver() {
      const isBest = api.submit(score);
      api.overlay({
        kicker: isBest ? 'New best!' : 'Game over',
        title: 'Splat!',
        text: 'You hit a red segment. Fall through three floors in a row to smash through them instead.',
        stats: [['Score', score], ['Level', L], ['Best', api.best ?? '—']],
        button: 'Play again',
        onAction: newGame
      });
    }
    function finish() {
      state = 'clear';
      const bonus = L * 10;
      score += bonus; api.score(score); elSc.textContent = score;
      squash = 1;
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * TAU, s = 2 + Math.random() * 4;
        fx.emit(Math.cos(a) * 1.4, finY + .3, Math.sin(a) * 1.4 + .6, Math.cos(a) * s, 5 + Math.random() * 6, Math.sin(a) * s, .09 + Math.random() * .07, 1 + Math.random() * .6, cConf[i % cConf.length], .6);
      }
      pop(st, 'Level clear! +' + bonus, 50, 38, '#fff');
      api.sfx('win');
      api.timeout(() => api.overlay({
        kicker: 'Level ' + L + ' complete',
        title: 'Nice drop!',
        text: L >= 2 ? 'Next up: more red, and some floors start to spin.' : 'Next up: a taller tower with more red.',
        stats: [['Score', score], ['Level', L + 1]],
        button: 'Next level',
        onAction: () => { build(L + 1); state = 'play'; }
      }), 1000);
    }
    function newGame() {
      score = 0; api.score(0); elSc.textContent = 0;
      build(1);
      state = 'play';
    }

    api.on(canvas, 'pointerdown', e => {
      if (state !== 'play') return;
      drag = e.pointerId; lastX = e.clientX;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    api.on(canvas, 'pointermove', e => {
      if (e.pointerId !== drag || state !== 'play') return;
      tower.rotation.y += (e.clientX - lastX) / canvas.getBoundingClientRect().width * 4.4;
      lastX = e.clientX;
    });
    const endDrag = e => { if (e.pointerId === drag) drag = null; };
    api.on(window, 'pointerup', endDrag);
    api.on(window, 'pointercancel', endDrag);

    api.loop(dt => {
      lt += dt;
      if (state === 'play') {
        const k = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
        if (k) tower.rotation.y += k * 3.4 * dt;
      }
      for (let i = 0; i < plats.length; i++) {
        const p = plats[i];
        p.grp.visible = p.broken || (i >= next - 1 && i <= next + 7);
        if (!p.grp.visible || p.broken) continue;
        if (p.spin || p.osc) { p.rot = p.spin * lt + p.osc * Math.sin(lt * 1.7); p.grp.rotation.y = p.rot; }
        if (p.mover) {
          const m = p.mover;
          m.ang = m.base + m.amp * Math.sin(lt * m.spd);
          m.mesh.rotation.y = m.ang - HX_SLOT / 2; m.mesh.userData.mid = m.ang;
        }
      }
      if (state === 'play' || state === 'idle') physics(dt);

      for (let i = debris.length - 1; i >= 0; i--) {
        const p = debris[i];
        p.bt += dt;
        const k = Math.max(.001, 1 - Math.max(0, p.bt - .15) * 2);
        for (const m of p.grp.children) {
          const v = m.userData.v;
          v[1] -= 20 * dt;
          m.position.x += v[0] * dt; m.position.y += v[1] * dt; m.position.z += v[2] * dt;
          m.rotation.y += m.userData.s * dt;
          m.scale.setScalar(m.userData.k * k);
        }
        if (p.bt > .65) { tower.remove(p.grp); debris.splice(i, 1); }
      }

      const fire = streak >= 3 && state === 'play';
      if (fire) {
        mBall.emissive.copy(cFire[2]).multiplyScalar(.75 + .25 * Math.sin(lt * 30));
        for (let i = 0; i < 3; i++) fx.emit((Math.random() - .5) * .3, by + (Math.random() - .3) * .3, HX.BZ + (Math.random() - .5) * .3, (Math.random() - .5) * 1.5, 2 + Math.random() * 3, (Math.random() - .5) * 1.5, .07 + Math.random() * .08, .3 + Math.random() * .25, cFire[(Math.random() * 4) | 0], -.5);
      } else if (state !== 'dead') mBall.emissive.setRGB(0, 0, 0);

      if (state !== 'dead') squash = Math.max(0, squash - dt * 5);
      const sq = state === 'dead' ? .75 : Math.sin(squash * Math.PI * .5), str = clamp(-vy / HX.VMAX, 0, 1) * .2;
      ball.scale.set((1 + .26 * sq) * (1 - str * .5), (1 - .36 * sq) * (1 + str), (1 + .26 * sq) * (1 - str * .5));
      ball.position.y = by - HX.BR * .36 * sq;

      if (state !== 'dead') camT = Math.min(camT, by);
      camY = Math.min(damp(camY, camT, 8, dt), camT + 1.1);
      shake *= Math.exp(-7 * dt);
      cam.position.set((Math.random() - .5) * shake, camY + 6 + (Math.random() - .5) * shake, 11.4);
      cam.lookAt(0, camY - .5, 0);
      sky.mesh.position.copy(cam.position);
      sun.position.set(-3.5, camY + 10, 6.5);
      sun.target.position.set(0, camY - 2.5, 0);

      const pr = Math.round(clamp((HX.BR - Math.min(by, camT)) / (HX.BR - finY), 0, 1) * 200) / 2;
      if (pr !== prog) { prog = pr; elBar.style.width = pr + '%'; }

      fx.update(dt, 18);
      renderer.render(scene, cam);
    });

    build(1);
    api.overlay({
      kicker: '3D',
      title: 'Helix Jump',
      text: 'Spin the tower so the ball drops through the gaps. Red is deadly, unless you fall three floors without bouncing and become a fireball.',
      button: 'Play',
      onAction: newGame
    });

    return () => { for (const o of bin) o.dispose(); };
  }

  const MP = (() => {
    const R = .5, G = 24, JUMP = 8.4, ACC = 15, ACC_AIR = 7, DRAG = 1.6, BRAKE = 3, DRAG_AIR = .1;
    const cl = (v, a, b) => v < a ? a : v > b ? b : v;

    function orient(o) {
      const cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch), m = o.m;
      m[0] = cy; m[1] = sy * sp; m[2] = sy * cp;
      m[3] = 0; m[4] = cp; m[5] = -sp;
      m[6] = -sy; m[7] = cy * sp; m[8] = cy * cp;
    }
    function obb(x, y, z, hx, hy, hz, yaw = 0, pitch = 0) {
      const o = { c: [x, y, z], h: [hx, hy, hz], m: [1, 0, 0, 0, 1, 0, 0, 0, 1], yaw, pitch, v: [0, 0, 0], dp: [0, 0, 0], w: 0, piv: null, bounce: .25, kind: 'box', cam: 0 };
      orient(o);
      return o;
    }
    function hit(b, o) {
      const m = o.m, h = o.h, p = b.p;
      const dx = p[0] - o.c[0], dy = p[1] - o.c[1], dz = p[2] - o.c[2];
      const lx = m[0] * dx + m[3] * dy + m[6] * dz, ly = m[1] * dx + m[4] * dy + m[7] * dz, lz = m[2] * dx + m[5] * dy + m[8] * dz;
      if (lx > h[0] + R || lx < -h[0] - R || ly > h[1] + R || ly < -h[1] - R || lz > h[2] + R || lz < -h[2] - R) return;
      let nx = lx - cl(lx, -h[0], h[0]), ny = ly - cl(ly, -h[1], h[1]), nz = lz - cl(lz, -h[2], h[2]), pen;
      const d2 = nx * nx + ny * ny + nz * nz;
      if (d2 > R * R) return;
      if (d2 > 1e-10) { const d = Math.sqrt(d2); nx /= d; ny /= d; nz /= d; pen = R - d; }
      else {
        const ex = h[0] - Math.abs(lx), ey = h[1] - Math.abs(ly), ez = h[2] - Math.abs(lz);
        nx = ny = nz = 0;
        if (ey <= ex && ey <= ez) { ny = ly < 0 ? -1 : 1; pen = ey + R; }
        else if (ex <= ez) { nx = lx < 0 ? -1 : 1; pen = ex + R; }
        else { nz = lz < 0 ? -1 : 1; pen = ez + R; }
      }
      const wx = m[0] * nx + m[1] * ny + m[2] * nz, wy = m[3] * nx + m[4] * ny + m[5] * nz, wz = m[6] * nx + m[7] * ny + m[8] * nz;
      p[0] += wx * pen; p[1] += wy * pen; p[2] += wz * pen;
      let sx = o.v[0], sz = o.v[2];
      if (o.w) { sx += o.w * (p[2] - o.piv[2]); sz -= o.w * (p[0] - o.piv[0]); }
      const floor = wy > .6, vn = (b.v[0] - sx) * wx + (b.v[1] - o.v[1]) * wy + (b.v[2] - sz) * wz;
      if (vn < 0) {
        const j = -(1 + (floor ? (vn < -7 ? .3 : 0) : o.bounce)) * vn;
        b.v[0] += j * wx; b.v[1] += j * wy; b.v[2] += j * wz;
        if (floor) b.land = Math.max(b.land, -vn); else b.bump = Math.max(b.bump, -vn);
      }
      if (floor) b.ground = o;
    }
    function step(b, cols, ax, az, dt) {
      const g0 = b.ground;
      if (g0 && g0.kind === 'mover') { b.p[0] += g0.dp[0]; b.p[2] += g0.dp[2]; }
      const n = Math.min(10, Math.max(2, Math.ceil(Math.hypot(b.v[0], b.v[1], b.v[2]) * dt / (R * .35)))), h = dt / n;
      b.land = 0; b.bump = 0;
      for (let s = 0; s < n; s++) {
        const on = !!b.ground, acc = on ? ACC : ACC_AIR, f = Math.exp(-(on ? (ax || az ? DRAG : BRAKE) : DRAG_AIR) * h);
        b.v[0] = (b.v[0] + ax * acc * h) * f;
        b.v[2] = (b.v[2] + az * acc * h) * f;
        b.v[1] = Math.max(b.v[1] - G * h, -40);
        b.p[0] += b.v[0] * h; b.p[1] += b.v[1] * h; b.p[2] += b.v[2] * h;
        b.ground = null;
        for (let i = 0; i < cols.length; i++) hit(b, cols[i]);
        b.air = b.ground ? 0 : b.air + h;
      }
    }

    function course(def) {
      const cols = [], cps = [], cur = { cam: 0 }, out = { cols, cps, goal: null, start: null, minY: 0 };
      const add = (o, kind) => { o.kind = kind; o.cam = cur.cam; cols.push(o); out.minY = Math.min(out.minY, o.c[1] - o.h[1]); return o; };
      def({
        cam: d => { cur.cam = d * Math.PI / 180; },
        B: (x, z, w, d, y = 0, h = 1.4) => add(obb(x, y - h / 2, z, w / 2, h / 2, d / 2), 'box'),
        R: (x0, z0, x1, z1, w, y0, y1, h = .8) => {
          const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), dy = y1 - y0;
          const o = obb(0, 0, 0, w / 2, h / 2, Math.hypot(L, dy) / 2, Math.atan2(-dx, -dz), Math.atan2(dy, L)), m = o.m;
          o.c[0] = (x0 + x1) / 2 - m[1] * h / 2; o.c[1] = (y0 + y1) / 2 - m[4] * h / 2; o.c[2] = (z0 + z1) / 2 - m[7] * h / 2;
          return add(o, 'ramp');
        },
        M: (x, z, w, d, y, ax, ay, az, spd, ph = 0, h = .6) => {
          const o = add(obb(x, y - h / 2, z, w / 2, h / 2, d / 2), 'mover');
          o.base = [x, y - h / 2, z]; o.amp = [ax, ay, az]; o.spd = spd; o.ph = ph;
          return o;
        },
        bar: (x, z, y, len, spd, arm = false) => {
          add(arm ? obb(x, y - 1.5, z, .3, 2.5, .3) : obb(x, y + .48, z, .26, .48, .26), 'post');
          const o = add(obb(x, y + .5, z, len / 2, .26, .26), 'bar');
          o.piv = [x, y + .5, z]; o.arm = arm; o.spd = spd; o.bounce = .5;
          return o;
        },
        cp: (x, z, y = 0) => { cps.push({ x, y, z, cam: cur.cam }); },
        goal: (x, z, y = 0) => { out.goal = { x, y, z, cam: cur.cam }; },
        start: (x, z, y = 0) => { out.start = { x, y, z, cam: cur.cam }; }
      });
      return out;
    }
    function update(cs, t) {
      for (const o of cs.cols) {
        if (o.kind === 'mover') {
          const a = t * o.spd + o.ph, s = Math.sin(a), c = Math.cos(a) * o.spd;
          for (let k = 0; k < 3; k++) { const v = o.base[k] + o.amp[k] * s; o.dp[k] = v - o.c[k]; o.c[k] = v; o.v[k] = o.amp[k] * c; }
        } else if (o.kind === 'bar') {
          o.yaw = t * o.spd; o.w = o.spd; orient(o);
          if (o.arm) { const r = o.h[0] + .15; o.c[0] = o.piv[0] + Math.cos(o.yaw) * r; o.c[2] = o.piv[2] - Math.sin(o.yaw) * r; }
        }
      }
    }
    return { R, G, JUMP, obb, hit, step, course, update };
  })();

  const MR_LEVELS = [
    { name: 'First Roll', pal: 0, def: c => {
      c.start(0, 2); c.cam(0);
      c.B(0, 0, 6, 8);
      c.B(0, -10, 4, 12.2);
      c.R(0, -16, 0, -24, 4, 0, 2);
      c.B(0, -28, 7, 8.2, 2);
      c.cp(0, -28, 2);
      c.cam(-90);
      c.B(9, -29.5, 11.2, 3, 2);
      c.R(14.5, -29.5, 22.5, -29.5, 3, 2, 0);
      c.B(26.5, -29.5, 8.2, 8);
      c.goal(27.5, -29.5);
    } },
    { name: 'Narrow Ways', pal: 1, def: c => {
      c.start(0, 1.5); c.cam(0);
      c.B(0, 0, 6, 6);
      c.B(0, -9, 2, 12.2);
      c.B(0, -20.6, 4, 6);
      c.cp(0, -20.6);
      c.cam(90);
      c.B(-6.6, -21.5, 10, 1.8);
      c.cam(0);
      c.B(-12.5, -26.5, 1.8, 11.8);
      c.B(-12.5, -36, 6, 7.4);
      c.goal(-12.5, -37);
    } },
    { name: 'Ups and Downs', pal: 2, def: c => {
      c.start(0, 1.5); c.cam(0);
      c.B(0, 0, 6, 6);
      c.R(0, -3, 0, -11, 4, 0, 3);
      c.B(0, -14, 4, 6.2, 3);
      c.B(0, -24, 4, 6, 1.5);
      c.R(0, -27, 0, -33, 4, 1.5, 0);
      c.B(0, -37, 6, 8.2);
      c.cp(0, -37);
      c.M(0, -47, 3.6, 3.6, 0, 0, 0, 3.75, .9);
      c.B(0, -58, 6, 10);
      c.cp(0, -57);
      c.cam(90);
      c.B(-8, -59, 10.2, 2.2);
      c.R(-13, -59, -19, -59, 2.2, 0, 2);
      c.B(-23, -59, 8.2, 8, 2);
      c.goal(-24, -59, 2);
    } },
    { name: 'Sweepers', pal: 3, def: c => {
      c.start(0, 1.5); c.cam(0);
      c.B(0, 0, 6, 6);
      c.B(0, -11, 8, 16.2);
      c.bar(0, -11, 0, 7, 1.5);
      c.B(0, -22.6, 5, 7);
      c.cp(0, -22.6);
      c.B(0, -34, 2.2, 16);
      c.bar(2, -29.5, 0, 3.7, 1.5, true);
      c.bar(-2, -38.5, 0, 3.7, -1.6, true);
      c.B(0, -46, 6, 8);
      c.cp(0, -46);
      c.cam(-90);
      c.B(8, -46, 10, 3);
      c.B(17.5, -46, 9, 9);
      c.bar(17.5, -46, 0, 7.6, 2.2);
      c.B(25.5, -46, 7, 7);
      c.goal(26.5, -46);
    } },
    { name: 'Shuttles', pal: 4, def: c => {
      c.start(0, 1.5); c.cam(0);
      c.B(0, 0, 6, 6);
      c.R(0, -3, 0, -10, 3, 0, 2.5);
      c.B(0, -12, 3, 4.2, 2.5);
      c.M(0, -16, 3, 3, 2.5, 3, 0, 0, 1.2, 0);
      c.M(0, -19.5, 3, 3, 2.5, 3, 0, 0, 1.2, .8);
      c.M(0, -23, 3, 3, 2.5, 3, 0, 0, 1.2, 1.6);
      c.B(0, -28, 4, 6.2, 2.5);
      c.cp(0, -28, 2.5);
      c.B(0, -38, 4, 6, 1);
      c.M(0, -42.6, 3, 3, 2.5, 0, 1.5, 0, .9, -1.5708);
      c.B(0, -49, 4, 9.6, 4);
      c.cp(0, -50, 4);
      c.cam(-90);
      c.B(7, -51, 10.4, 2, 4);
      c.M(14, -53.6, 3, 3, 4, 0, 0, 2.6, 1.2);
      c.B(19.6, -51, 8, 2, 4);
      c.B(27.5, -51, 8, 8, 4);
      c.goal(28, -51, 4);
    } },
    { name: 'Gauntlet', pal: 5, def: c => {
      c.start(0, 1.5); c.cam(0);
      c.B(0, 0, 6, 6);
      c.R(0, -2.5, -5, -11.5, 1.8, 0, 0);
      c.B(-5, -12.5, 3, 3);
      c.R(-5, -13.5, 0, -22, 1.8, 0, 0);
      c.B(0, -23.5, 4, 4);
      c.cp(0, -23.5);
      c.B(0, -31, 4, 6, .8);
      c.B(0, -42, 8, 16, .8);
      c.bar(-1.8, -38, .8, 4, 2.6);
      c.bar(1.8, -45, .8, 4, -2.6);
      c.B(0, -53, 4, 6.2, .8);
      c.cp(0, -53, .8);
      c.cam(-90);
      c.M(9.75, -53, 3, 3, .8, 6.15, 0, 0, .8, -1.5708);
      c.B(21, -53, 7, 4, .8);
      c.bar(21, -50.2, .8, 4.6, 1.8, true);
      c.R(24.4, -53, 32, -53, 1.8, .8, 3.5);
      c.B(36, -53, 8, 6, 3.5);
      c.goal(36.5, -53, 3.5);
    } }
  ];

  const MR_PAL = [
    { sky: ['#3fa6ff', '#d4f0ff', '#eaf8ff'], tiles: ['#8be08f', '#78d47e'], side: '#f3d9a8', lip: '#5cbf62', rock: '#c39a72' },
    { sky: ['#ff7fa8', '#ffe1c4', '#fff1e3'], tiles: ['#ffd27a', '#ffc35a'], side: '#c8678a', lip: '#ffad42', rock: '#9e5a74' },
    { sky: ['#2f8fff', '#bdf2ff', '#e1fbff'], tiles: ['#86ecf2', '#6fdce6'], side: '#3d6fd6', lip: '#e9fcff', rock: '#2f56a8' },
    { sky: ['#b57cff', '#ffdcf3', '#fff0fa'], tiles: ['#ffb6dc', '#ffa3d0'], side: '#7a5cff', lip: '#ffffff', rock: '#5b43c7' },
    { sky: ['#1fbfae', '#dcfff1', '#effff8'], tiles: ['#dcf56f', '#cbeb58'], side: '#2a9d8f', lip: '#f4ffd1', rock: '#22796f' },
    { sky: ['#4b3a9a', '#ffab86', '#ffd7c2'], tiles: ['#bcaaff', '#a995ff'], side: '#3a3070', lip: '#ffd6a5', rock: '#2c2556' }
  ];
  const fmtS = v => v == null ? '—' : v.toFixed(1) + ' s';

  function marbleGame(root, api, gl) {
    const { THREE, renderer, canvas, w, h } = gl;
    renderer.toneMapping = THREE.NoToneMapping;
    const bin = [], keep = o => (bin.push(o), o), lin = x => new THREE.Color(x).convertSRGBToLinear();
    let lvBin = [];
    const lk = o => (lvBin.push(o), o);
    const keys = api.keys;
    const st = stage(root, canvas, `<div class="hud"><div class="pill">Course <b class="lv">1</b>/6</div><div class="clock">0.0</div><div class="pill">Best <b class="bst">—</b></div></div><div class="msg"></div><div class="stick"><i></i></div><button class="jump" type="button" aria-label="Jump"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg></button>`);
    const elLv = st.querySelector('.lv'), elClock = st.querySelector('.clock'), elBest = st.querySelector('.bst'), elMsg = st.querySelector('.msg'), knob = st.querySelector('.stick i'), jumpBtn = st.querySelector('.jump');

    const scene = new THREE.Scene();
    const sky = skyDome(THREE, keep, 170);
    scene.add(sky.mesh);
    scene.fog = new THREE.Fog(0xffffff, 50, 150);
    const cam = new THREE.PerspectiveCamera(w > h ? 55 : 64, w / h, .1, 400);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x9aa0c8, .62);
    const sun = new THREE.DirectionalLight(0xffffff, .78);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
    sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
    scene.add(hemi, sun, sun.target);

    const cv = (a, b) => Object.assign(document.createElement('canvas'), { width: a, height: b });
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const tex = (c, rep) => {
      const t = keep(new THREE.CanvasTexture(c));
      t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso;
      if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    };
    function paintTile(c, a, b) {
      const x = c.getContext('2d'), n = c.width / 2;
      x.fillStyle = a; x.fillRect(0, 0, n * 2, n * 2);
      x.fillStyle = b; x.fillRect(n, 0, n, n); x.fillRect(0, n, n, n);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const g = x.createLinearGradient(i * n, j * n, i * n + n, j * n + n);
        g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.1)');
        x.fillStyle = g; x.fillRect(i * n, j * n, n, n);
      }
      for (let k = 0; k < 90; k++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.06)'; x.fillRect(Math.random() * n * 2, Math.random() * n * 2, 1 + Math.random() * 2, 1 + Math.random() * 2); }
      x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 4;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) x.strokeRect(i * n + 3, j * n + 3, n - 6, n - 6);
      x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 2;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) x.strokeRect(i * n + 6, j * n + 6, n - 12, n - 12);
    }
    function paintSide(c, lip, side) {
      const x = c.getContext('2d'), H = c.height, g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, side); g.addColorStop(1, '#' + new THREE.Color(side).multiplyScalar(.62).getHexString());
      x.fillStyle = g; x.fillRect(0, 0, c.width, H);
      x.fillStyle = lip; x.fillRect(0, 0, c.width, H * .16);
      x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(0, 0, c.width, H * .03);
      x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, H * .16, c.width, H * .025);
      x.fillStyle = 'rgba(255,255,255,.1)'; x.fillRect(0, H * .4, c.width, H * .02); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, H * .66, c.width, H * .03);
    }
    const tileCv = cv(128, 128), sideCv = cv(8, 128), tileT = tex(tileCv, true), sideT = tex(sideCv, true);
    const mvTileCv = cv(128, 128), mvSideCv = cv(8, 128);
    paintTile(mvTileCv, '#ffd84a', '#ffc72a'); paintSide(mvSideCv, '#fff1b0', '#ff8a3d');
    const mTop = keep(new THREE.MeshStandardMaterial({ map: tileT, roughness: .75 }));
    const mSide = keep(new THREE.MeshStandardMaterial({ map: sideT, roughness: .85 }));
    const mRock = keep(new THREE.MeshStandardMaterial({ roughness: .95, flatShading: true }));
    const mMvTop = keep(new THREE.MeshStandardMaterial({ map: tex(mvTileCv, true), roughness: .6 }));
    const mMvSide = keep(new THREE.MeshStandardMaterial({ map: tex(mvSideCv, true), roughness: .7 }));
    const boxMats = [mSide, mSide, mTop, mRock, mSide, mSide], mvMats = [mMvSide, mMvSide, mMvTop, mRock, mMvSide, mMvSide];
    const barCv = cv(8, 64), bx = barCv.getContext('2d');
    bx.fillStyle = '#ff4757'; bx.fillRect(0, 0, 8, 64); bx.fillStyle = '#ffffff'; bx.fillRect(0, 0, 8, 32);
    const mBar = keep(new THREE.MeshStandardMaterial({ map: tex(barCv, true), roughness: .35 }));
    const mPost = keep(new THREE.MeshStandardMaterial({ color: lin('#eef0f8'), roughness: .4 }));
    const mRockV = keep(new THREE.MeshStandardMaterial({ roughness: .95, flatShading: true, vertexColors: true }));
    const rockGeo = keep(mergeParts(THREE, [
      [new THREE.ConeGeometry(1, 1, 7, 1), [0, 0, 0], [Math.PI, 0, 0], [1, 1, 1], [0.62, 1]],
      [new THREE.ConeGeometry(0.34, 0.6, 5, 1), [0.55, 0.2, 0.15], [Math.PI, 0.4, 0.1], [1, 1, 1], [0.7, 1]],
      [new THREE.ConeGeometry(0.28, 0.5, 5, 1), [-0.5, 0.25, -0.3], [Math.PI, 0.9, -0.12], [1, 1, 1], [0.7, 1]],
      [new THREE.ConeGeometry(0.22, 0.38, 5, 1), [0.1, 0.31, -0.62], [Math.PI, 0.2, 0.1], [1, 1, 1], [0.7, 1]]
    ]));

    function boxGeo(bw, bh, bd, c) {
      const g = new THREE.BoxGeometry(bw, bh, bd), uv = g.attributes.uv;
      const su = [bd, bd, bw, bw, bw, bw];
      for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
        const i = f * 4 + k, u = uv.getX(i), v = uv.getY(i);
        if (f === 2 && c) uv.setXY(i, (u * bw - bw / 2 + c[0]) / 2, (v * bd - bd / 2 - c[2]) / 2);
        else if (f === 2 || f === 3) uv.setXY(i, u * bw / 2, v * bd / 2);
        else uv.setXY(i, u * su[f] / 2, v);
      }
      return g;
    }

    const ballCv = cv(512, 256), bc = ballCv.getContext('2d'), brn = rng(17);
    const bg = bc.createLinearGradient(0, 0, 0, 256);
    bg.addColorStop(0, '#a08cff'); bg.addColorStop(0.5, '#7058f0'); bg.addColorStop(1, '#4a36d0');
    bc.fillStyle = bg; bc.fillRect(0, 0, 512, 256);
    bc.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x0 = brn() * 512, y0 = brn() * 256;
      bc.strokeStyle = i % 3 ? `rgba(255,255,255,${.06 + brn() * .12})` : `rgba(40,20,150,${.1 + brn() * .15})`; bc.lineWidth = 3 + brn() * 14;
      for (const dx of [-512, 0, 512]) { bc.beginPath(); bc.moveTo(x0 + dx, y0); bc.bezierCurveTo(x0 + dx + 60 + brn() * 80, y0 - 50 + brn() * 100, x0 + dx + 120 + brn() * 80, y0 - 50 + brn() * 100, x0 + dx + 200 + brn() * 100, y0 - 30 + brn() * 60); bc.stroke(); }
    }
    bc.fillStyle = '#ffffff'; bc.fillRect(0, 108, 512, 40);
    bc.fillStyle = 'rgba(80,60,200,.22)'; bc.fillRect(0, 108, 512, 6); bc.fillRect(0, 142, 512, 6);
    bc.fillStyle = '#ffd23f'; bc.fillRect(0, 100, 512, 8); bc.fillRect(0, 148, 512, 8);
    for (let i = 0; i < 6; i++) {
      for (const [cx, cy] of [[i * 86 + 40, i % 2 ? 48 : 208]]) {
        bc.fillStyle = '#ffffff'; bc.beginPath();
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 7 : 18; bc.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        bc.closePath(); bc.fill();
        bc.fillStyle = '#ffd23f'; bc.beginPath(); bc.arc(cx, cy, 5, 0, TAU); bc.fill();
      }
    }
    for (let i = 0; i < 40; i++) { bc.fillStyle = `rgba(255,255,255,${.3 + brn() * .5})`; bc.beginPath(); bc.arc(brn() * 512, brn() * 256, 1 + brn() * 1.8, 0, TAU); bc.fill(); }
    const mBall = keep(new THREE.MeshPhysicalMaterial({ map: tex(ballCv), metalness: .3, roughness: .16, clearcoat: 1, clearcoatRoughness: .04 }));
    const pm = new THREE.PMREMGenerator(renderer), envSc = new THREE.Scene(), envSky = skyDome(THREE, keep, 40);
    envSky.paint([[90, '#5aa9ff'], [20, '#cfeaff'], [0, '#ffffff'], [-8, '#9db3c8'], [-90, '#4b5870']]);
    envSc.add(envSky.mesh);
    const panelMat = keep(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    panelMat.color.setScalar(3);
    const panel = new THREE.Mesh(keep(new THREE.PlaneGeometry(26, 10)), panelMat);
    panel.position.set(-12, 22, 10); panel.lookAt(0, 0, 0);
    envSc.add(panel);
    const envRT = keep(pm.fromScene(envSc, .02));
    pm.dispose();
    mBall.envMap = envRT.texture;
    const ball = new THREE.Mesh(keep(new THREE.SphereGeometry(MP.R, 40, 28)), mBall);
    ball.castShadow = true;
    const halo = new THREE.Mesh(keep(new THREE.SphereGeometry(MP.R * 1.12, 28, 18)), keep(new THREE.MeshBasicMaterial({ color: lin('#b9aaff'), transparent: true, opacity: .22, side: THREE.BackSide, depthWrite: false })));
    ball.add(halo);
    scene.add(ball);

    const cloudGeo = keep(new THREE.IcosahedronGeometry(1, 2));
    const mCloud = keep(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: .3 }));
    const clouds = new THREE.Group(), cr = rng(99), CPUFF = 6, cloudMesh = new THREE.InstancedMesh(cloudGeo, mCloud, 22 * CPUFF), cd = new THREE.Object3D(), cc = new THREE.Color();
    let ci = 0;
    for (let i = 0; i < 22; i++) {
      const a = cr() * TAU, d = 22 + cr() * 60, gs = 1.6 + cr() * 1.6, gx = Math.cos(a) * d, gy = -21 + cr() * 9, gz = Math.sin(a) * d;
      for (let k = 0; k < CPUFF; k++) {
        const lx = (k - (CPUFF - 1) / 2) * 1.3 + cr() * .6, ly = cr() * .7 + (k % 2 ? .35 : 0), lz = (cr() - .5) * 1.4, sc = 1.3 + cr() * 1.0 - Math.abs(k - (CPUFF - 1) / 2) * .28;
        cd.position.set(gx + lx * gs, gy + ly * gs, gz + lz * gs); cd.scale.set(sc * gs, sc * gs * .78, sc * gs); cd.updateMatrix();
        cloudMesh.setMatrixAt(ci, cd.matrix); cloudMesh.setColorAt(ci++, cc.setScalar(.82 + Math.min(.18, ly * .3 + .08)));
      }
    }
    cloudMesh.frustumCulled = false;
    clouds.add(cloudMesh);
    scene.add(clouds);

    const ringGeo = keep(new THREE.TorusGeometry(1.05, .09, 10, 40));
    const padGeo = keep(new THREE.CylinderGeometry(1.5, 1.5, .1, 40));
    const poleGeo = keep(new THREE.CylinderGeometry(.06, .06, 3.2, 10));
    const knobGeo = keep(new THREE.SphereGeometry(.15, 16, 10));
    const flagGeo = keep(new THREE.PlaneGeometry(1.3, .85, 12, 4));
    flagGeo.translate(.65, 0, 0);
    const flagBase = Float32Array.from(flagGeo.attributes.position.array);
    const mCp = keep(new THREE.MeshStandardMaterial({ color: lin('#ffffff'), emissive: lin('#8fd3ff'), emissiveIntensity: .4, roughness: .3 }));
    const mCpOn = keep(new THREE.MeshStandardMaterial({ color: lin('#5dffa0'), emissive: lin('#22b07d'), emissiveIntensity: .8, roughness: .3 }));
    const chkCv = cv(64, 64), chx = chkCv.getContext('2d');
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { chx.fillStyle = (i + j) % 2 ? '#1f1d2b' : '#ffffff'; chx.fillRect(i * 8, j * 8, 8, 8); }
    const mPad = keep(new THREE.MeshStandardMaterial({ map: tex(chkCv), roughness: .5 }));
    const mGold = keep(new THREE.MeshStandardMaterial({ color: lin('#ffd23f'), metalness: .6, roughness: .25, emissive: lin('#7a5200'), emissiveIntensity: .5 }));
    const flagCv = cv(128, 84), fcx = flagCv.getContext('2d');
    {
      const g = fcx.createLinearGradient(0, 0, 0, 84);
      g.addColorStop(0, '#ff6aa0'); g.addColorStop(1, '#e83a78');
      fcx.fillStyle = g; fcx.fillRect(0, 0, 128, 84);
      fcx.fillStyle = 'rgba(255,255,255,.2)'; fcx.fillRect(0, 0, 128, 8);
      fcx.fillStyle = '#ffd23f'; fcx.fillRect(0, 74, 128, 10); fcx.fillStyle = '#fff'; fcx.fillRect(0, 70, 128, 4);
      fcx.fillStyle = '#ffffff'; fcx.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 9 : 22; fcx.lineTo(64 + Math.cos(a) * r, 36 + Math.sin(a) * r); }
      fcx.closePath(); fcx.fill();
    }
    const mFlag = keep(new THREE.MeshStandardMaterial({ map: tex(flagCv), side: THREE.DoubleSide, roughness: .6 }));
    const beamCv = cv(4, 128), bmx = beamCv.getContext('2d');
    {
      const g = bmx.createLinearGradient(0, 128, 0, 0);
      g.addColorStop(0, 'rgba(255,240,170,.75)'); g.addColorStop(0.5, 'rgba(255,240,170,.22)'); g.addColorStop(1, 'rgba(255,240,170,0)');
      bmx.fillStyle = g; bmx.fillRect(0, 0, 4, 128);
    }
    const beamGeo = keep(new THREE.CylinderGeometry(1.1, 1.3, 7, 28, 1, true));
    const mBeam = keep(new THREE.MeshBasicMaterial({ map: tex(beamCv), transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    const cpPadGeo = keep(new THREE.CylinderGeometry(1.25, 1.3, .05, 32));
    const mCpPad = keep(new THREE.MeshBasicMaterial({ color: lin('#bfeaff'), transparent: true, opacity: .4, depthWrite: false }));
    const starGeo = keep(new THREE.OctahedronGeometry(.2, 0));
    const decoGeo = keep(mergeParts(THREE, [
      [new THREE.OctahedronGeometry(.2, 0), [0, .25, 0], [0, .3, 0], [.7, 1.6, .7]],
      [new THREE.OctahedronGeometry(.14, 0), [.2, .17, .05], [0, .1, .2], [.7, 1.5, .7]],
      [new THREE.OctahedronGeometry(.12, 0), [-.18, .15, -.07], [0, .8, -.2], [.7, 1.4, .7]]
    ]));
    const mDeco = keep(new THREE.MeshStandardMaterial({ roughness: .25, flatShading: true, emissive: 0x303030, emissiveIntensity: .6 }));
    const bushGeo = keep(mergeParts(THREE, [
      [new THREE.IcosahedronGeometry(.2, 1), [0, .14, 0], [0, 0, 0], [1.2, .8, 1.2]],
      [new THREE.IcosahedronGeometry(.15, 1), [.2, .1, .08], [0, 0, 0], [1.1, .8, 1.1]],
      [new THREE.IcosahedronGeometry(.13, 1), [-.18, .1, -.06], [0, 0, 0], [1.1, .8, 1.1]]
    ]));
    const mBush = keep(new THREE.MeshStandardMaterial({ roughness: .9, flatShading: true }));
    const fx = particles(THREE, scene, keep, 320);
    const cWhite = new THREE.Color(1, 1, 1), cConf = C.hues.map(lin), cSpark = ['#fff3a0', '#ffd23f', '#5dffa0'].map(lin);

    const saved = api.load();
    const bests = saved && Array.isArray(saved.lv) ? saved.lv.slice(0, 6) : [];
    const b = { p: [0, 0, 0], v: [0, 0, 0], ground: null, air: 1, land: 0, bump: 0 };
    let state = 'idle', lvl = 0, course = null, cGroup = null, cpMarks = [], cpIdx = -1, goalGrp = null, flag = null;
    let ct = 0, T = 0, lvTime = 0, total = 0, falls = 0, started = false, clockTxt = '', jumpBuf = 0, bumpCd = 0;
    let camYaw = 0, yawT = 0, lastGroundY = 0, snap = true, stickId = null, sx0 = 0, sy0 = 0, stX = 0, stY = 0;
    const camPos = new THREE.Vector3(), look = new THREE.Vector3(), q = new THREE.Quaternion(), axis = new THREE.Vector3();

    function colMesh(o) {
      const [hx, hy, hz] = o.h;
      let m;
      if (o.kind === 'bar') {
        const g = lk(new THREE.CylinderGeometry(hy, hy, hx * 2, 16, 1)), uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * hx * 2);
        g.rotateZ(Math.PI / 2);
        m = new THREE.Mesh(g, mBar);
      } else if (o.kind === 'post') m = new THREE.Mesh(lk(new THREE.CylinderGeometry(hx * .85, hx, hy * 2, 16)), mPost);
      else {
        m = new THREE.Mesh(lk(boxGeo(hx * 2, hy * 2, hz * 2, o.yaw || o.pitch ? null : o.c)), o.kind === 'mover' ? mvMats : boxMats);
        if (o.kind === 'box' && hx > 1.4 && hz > 1.4) {
          const r = new THREE.Mesh(rockGeo, mRockV), d = 2 + Math.min(hx, hz) * .9;
          r.scale.set(hx * .9, d, hz * .9);
          r.position.set(o.c[0], o.c[1] - hy - d / 2 + .01, o.c[2]);
          r.rotation.y = o.c[0] * 1.7 + o.c[2];
          cGroup.add(r);
        }
      }
      m.position.set(o.c[0], o.c[1], o.c[2]);
      m.rotation.set(o.pitch, o.yaw, 0, 'YXZ');
      m.castShadow = m.receiveShadow = true;
      return m;
    }

    function loadLevel(i) {
      if (cGroup) { scene.remove(cGroup); for (const o of lvBin) o.dispose(); lvBin = []; }
      lvl = i;
      const P = MR_PAL[MR_LEVELS[i].pal];
      paintTile(tileCv, P.tiles[0], P.tiles[1]); tileT.needsUpdate = true;
      paintSide(sideCv, P.lip, P.side); sideT.needsUpdate = true;
      mRock.color.copy(lin(P.rock));
      mRockV.color.copy(lin(P.rock));
      sky.paint([[90, P.sky[0]], [12, P.sky[0]], [-12, P.sky[1]], [-40, P.sky[2]], [-90, P.sky[2]]]);
      scene.fog.color.copy(lin(P.sky[1]));
      course = MP.course(MR_LEVELS[i].def);
      ct = 0; MP.update(course, 0);
      for (const o of course.cols) o.dp.fill(0);
      cGroup = new THREE.Group();
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const o of course.cols) {
        o.mesh = colMesh(o); cGroup.add(o.mesh);
        x0 = Math.min(x0, o.c[0]); x1 = Math.max(x1, o.c[0]); z0 = Math.min(z0, o.c[2]); z1 = Math.max(z1, o.c[2]);
      }
      const dsl = [], dr = rng(lvl * 13 + 7);
      for (const o of course.cols) {
        if (o.kind !== 'box' || o.yaw || o.pitch || o.h[0] < 1.4 || o.h[2] < 1.4) continue;
        const nd = Math.min(6, Math.round(o.h[0] + o.h[2]));
        for (let k = 0; k < nd; k++) {
          const sg = dr() < .5 ? -1 : 1, t = (dr() * 2 - 1) * .8, ex = o.h[0] - .2, ez = o.h[2] - .2;
          const px = o.c[0] + (o.h[0] >= o.h[2] ? t * ex : sg * ex), pz = o.c[2] + (o.h[0] >= o.h[2] ? sg * ez : t * ez);
          dsl.push([px, o.c[1] + o.h[1], pz, dr() < .5 ? 0 : 1, .8 + dr() * .7, dr() * TAU]);
        }
      }
      let nc = 0, nb = 0;
      for (const d of dsl) if (d[3]) nb++; else nc++;
      const crysM = lk(new THREE.InstancedMesh(decoGeo, mDeco, Math.max(1, nc))), bushM = lk(new THREE.InstancedMesh(bushGeo, mBush, Math.max(1, nb)));
      const dd = new THREE.Object3D(), dcol = new THREE.Color(), pal = [lin(P.lip), lin(P.tiles[0]), lin('#ffffff')];
      let ic = 0, ib = 0;
      for (const d of dsl) {
        dd.position.set(d[0], d[1], d[2]); dd.rotation.set(0, d[5], 0); dd.scale.setScalar(d[4]); dd.updateMatrix();
        if (d[3]) { bushM.setMatrixAt(ib, dd.matrix); bushM.setColorAt(ib++, dcol.copy(lin(P.tiles[1])).multiplyScalar(.75)); }
        else { crysM.setMatrixAt(ic, dd.matrix); crysM.setColorAt(ic, dcol.copy(pal[ic % 3]).multiplyScalar(1.05)); ic++; }
      }
      crysM.count = nc; bushM.count = nb;
      crysM.castShadow = bushM.castShadow = true;
      cGroup.add(crysM, bushM);
      clouds.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
      cpMarks = course.cps.map(p => {
        const m = new THREE.Mesh(ringGeo, mCp);
        m.rotation.x = Math.PI / 2; m.position.set(p.x, p.y + .08, p.z);
        cGroup.add(m);
        const cpad = new THREE.Mesh(cpPadGeo, mCpPad); cpad.position.set(p.x, p.y + .03, p.z); cGroup.add(cpad);
        return m;
      });
      const gp = course.goal;
      goalGrp = new THREE.Group();
      goalGrp.position.set(gp.x, gp.y, gp.z);
      const pad = new THREE.Mesh(padGeo, mPad); pad.position.y = .05; pad.receiveShadow = true;
      const ring = new THREE.Mesh(ringGeo, mGold); ring.rotation.x = Math.PI / 2; ring.position.y = .12; ring.scale.setScalar(1.42);
      const pole = new THREE.Mesh(poleGeo, mPost); pole.position.set(0, 1.6, 0); pole.castShadow = true;
      const knobM = new THREE.Mesh(knobGeo, mGold); knobM.position.y = 3.25; knobM.scale.setScalar(.8);
      flag = new THREE.Mesh(flagGeo, mFlag); flag.position.set(.05, 2.7, 0); flag.castShadow = true;
      const beam = new THREE.Mesh(beamGeo, mBeam); beam.position.y = 3.6;
      const starTop = new THREE.Mesh(starGeo, mGold); starTop.position.set(0, 3.55, 0); starTop.scale.setScalar(1.1);
      const base = new THREE.Mesh(padGeo, mGold); base.position.y = .02; base.scale.set(1.12, .5, 1.12);
      goalGrp.add(base, pad, ring, pole, knobM, flag, beam, starTop);
      goalGrp.rotation.y = gp.cam;
      cGroup.add(goalGrp);
      scene.add(cGroup);
      cpIdx = -1; fx.clear();
      reset(course.start);
      elLv.textContent = i + 1;
      elBest.textContent = fmtS(bests[i]);
    }
    function reset(p) {
      b.p[0] = p.x; b.p[1] = p.y + MP.R + .05; b.p[2] = p.z;
      b.v.fill(0); b.ground = null; b.air = 1;
      camYaw = yawT = p.cam; lastGroundY = p.y; snap = true;
    }
    function msg(text, color) {
      elMsg.textContent = text;
      elMsg.style.color = color || '#fff';
      elMsg.animate([
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1.08)', offset: .18 },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .7 },
        { opacity: 0, transform: 'translate(-50%,-70%) scale(1)' }
      ], { duration: 1300, easing: 'ease-out' });
    }
    function puff(n, sp) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU;
        fx.emit(b.p[0] + Math.cos(a) * .4, b.p[1] - .42, b.p[2] + Math.sin(a) * .4, Math.cos(a) * sp, .6 + Math.random(), Math.sin(a) * sp, .1 + Math.random() * .08, .45 + Math.random() * .3, cWhite, .2);
      }
    }
    function sparkle(x, y, z, n, cols, sp) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, s = sp * (.3 + Math.random() * .7);
        fx.emit(x, y, z, Math.cos(a) * s, 3 + Math.random() * 5, Math.sin(a) * s, .08 + Math.random() * .07, .8 + Math.random() * .7, cols[i % cols.length], .5);
      }
    }
    function begin() { if (!started) { started = true; } }
    function doJump() {
      const g = b.ground;
      b.v[1] = MP.JUMP + (g ? Math.max(0, g.v[1]) : 0);
      b.air = 1; b.ground = null; jumpBuf = 0;
      api.sfx('tap'); puff(5, 1.2);
    }
    function tryJump() {
      if (state !== 'play') return;
      begin();
      if (b.air < .12) doJump(); else jumpBuf = .15;
    }
    function play() {
      state = 'play'; started = false; lvTime = 0; clockTxt = ''; jumpBuf = 0;
      msg(MR_LEVELS[lvl].name);
    }
    function newRun() {
      total = 0; falls = 0;
      api.score(0);
      loadLevel(0); play();
    }
    function respawn() {
      falls++; lvTime += 2;
      reset(cpIdx >= 0 ? course.cps[cpIdx] : course.start);
      msg('+2 s', '#ffd23f');
      api.sfx('bad');
    }
    function complete() {
      state = 'done';
      const t = Math.round(lvTime * 10) / 10;
      total = Math.round((total + t) * 10) / 10;
      api.score(total);
      const nb = bests[lvl] == null || t < bests[lvl];
      if (nb) { bests[lvl] = t; api.save({ lv: bests }); elBest.textContent = fmtS(t); }
      const g = course.goal;
      sparkle(g.x, g.y + .5, g.z, 90, cConf, 5);
      msg('Clear!');
      api.sfx('win');
      api.timeout(() => {
        if (lvl < MR_LEVELS.length - 1) {
          api.overlay({
            kicker: nb ? 'New course best!' : `Course ${lvl + 1} of ${MR_LEVELS.length}`,
            title: 'Course clear!',
            text: 'Next: ' + MR_LEVELS[lvl + 1].name + '.',
            stats: [['Time', fmtS(t)], ['Course best', fmtS(bests[lvl])], ['Total', fmtS(total)]],
            button: 'Next course',
            onAction: () => { loadLevel(lvl + 1); play(); }
          });
        } else {
          const isBest = api.submit(total);
          api.overlay({
            kicker: isBest ? 'New best!' : 'All courses clear',
            title: 'Finished!',
            text: `${falls ? `You fell ${falls} time${falls === 1 ? '' : 's'}.` : 'Not a single fall.'} Every course best is saved.`,
            stats: [['Total', fmtS(total)], ['Best', fmtS(api.best)], ['Falls', falls]],
            button: 'Play again',
            onAction: newRun
          });
        }
      }, 1300);
    }

    api.on(window, 'keydown', e => { if (e.code === 'Space' && !e.repeat) tryJump(); });
    api.on(jumpBtn, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); st.classList.add('touch'); tryJump(); });
    api.on(st, 'pointerdown', e => {
      if (state !== 'play' || stickId !== null) return;
      if (e.pointerType === 'touch') st.classList.add('touch');
      stickId = e.pointerId; sx0 = e.clientX; sy0 = e.clientY; stX = stY = 0;
      st.classList.add('drag');
      try { st.setPointerCapture(e.pointerId); } catch (err) {}
    });
    api.on(st, 'pointermove', e => {
      if (e.pointerId !== stickId) return;
      let dx = (e.clientX - sx0) / 46, dy = (e.clientY - sy0) / 46;
      const l = Math.hypot(dx, dy);
      if (l > 1) { dx /= l; dy /= l; }
      stX = dx; stY = dy;
      knob.style.transform = `translate(${dx * 80}%,${dy * 80}%)`;
      if (l > .15) begin();
    });
    const endStick = e => {
      if (e.pointerId !== stickId) return;
      stickId = null; stX = stY = 0;
      knob.style.transform = '';
      st.classList.remove('drag');
    };
    api.on(window, 'pointerup', endStick);
    api.on(window, 'pointercancel', endStick);

    api.loop(dt => {
      T += dt;
      ct += dt; MP.update(course, ct);
      for (const o of course.cols) {
        if (o.kind === 'mover') o.mesh.position.set(o.c[0], o.c[1], o.c[2]);
        else if (o.kind === 'bar') { o.mesh.position.set(o.c[0], o.c[1], o.c[2]); o.mesh.rotation.y = o.yaw; }
      }
      if (state === 'play' || state === 'done') {
        let ix = 0, iy = 0;
        if (state === 'play') {
          ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
          iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
          if (stickId !== null && stX * stX + stY * stY > .0225) { ix += stX; iy -= stY; }
          const l = Math.hypot(ix, iy);
          if (l > 1) { ix /= l; iy /= l; }
          if (l) begin();
          if (jumpBuf > 0) { jumpBuf -= dt; if (b.air < .12) doJump(); }
        } else { const f = Math.exp(-6 * dt); b.v[0] *= f; b.v[2] *= f; }
        const sy = Math.sin(camYaw), cy = Math.cos(camYaw);
        const ox = b.p[0], oz = b.p[2], g0 = b.ground, carryX = g0 && g0.kind === 'mover' ? g0.dp[0] : 0, carryZ = g0 && g0.kind === 'mover' ? g0.dp[2] : 0;
        MP.step(b, course.cols, cy * ix - sy * iy, -sy * ix - cy * iy, dt);
        const dx = b.p[0] - ox - carryX, dz = b.p[2] - oz - carryZ, d = Math.hypot(dx, dz);
        if (d > 1e-5) { axis.set(dz / d, 0, -dx / d); q.setFromAxisAngle(axis, d / MP.R); ball.quaternion.premultiply(q); }
        if (b.land > 6.5) { puff(9, 2); api.sfx('hit'); }
        bumpCd -= dt;
        if (b.bump > 3 && bumpCd <= 0) { api.sfx('hit'); bumpCd = .25; }
        if (b.ground) { lastGroundY = b.p[1] - MP.R; if (state === 'play') yawT = b.ground.cam; }
        if (state === 'play') {
          if (started) lvTime += dt;
          const ctx = lvTime.toFixed(1);
          if (ctx !== clockTxt) { clockTxt = ctx; elClock.textContent = ctx; api.score(Math.round((total + lvTime) * 10) / 10); }
          for (let k = cpIdx + 1; k < course.cps.length; k++) {
            const p = course.cps[k];
            if (Math.hypot(b.p[0] - p.x, b.p[2] - p.z) < 1.5 && Math.abs(b.p[1] - p.y - MP.R) < 1) {
              for (let j = 0; j <= k; j++) cpMarks[j].material = mCpOn;
              cpIdx = k; msg('Checkpoint', '#5dffa0'); api.sfx('good');
              sparkle(p.x, p.y + .3, p.z, 30, cSpark, 3);
            }
          }
          const g = course.goal;
          if (Math.hypot(b.p[0] - g.x, b.p[2] - g.z) < 1.35 && Math.abs(b.p[1] - g.y - MP.R) < .9) complete();
          else if (b.p[1] < course.minY - 9) respawn();
        }
      }
      if (state === 'idle') yawT = course.start.cam + Math.sin(T * .3) * .7;
      camYaw += angDiff(yawT, camYaw) * (1 - Math.exp(-(state === 'idle' ? 6 : 3.2) * dt));
      const fxw = -Math.sin(camYaw), fzw = -Math.cos(camYaw), py = Math.max(b.p[1], lastGroundY - 2.5);
      const tx = b.p[0] - fxw * 7.4, ty = py + 3.8, tz = b.p[2] - fzw * 7.4;
      if (snap) { camPos.set(tx, ty, tz); look.set(b.p[0] + fxw * 2.4, py + .4, b.p[2] + fzw * 2.4); snap = false; }
      camPos.x = damp(camPos.x, tx, 7, dt); camPos.y = damp(camPos.y, ty, 4.5, dt); camPos.z = damp(camPos.z, tz, 7, dt);
      look.x = damp(look.x, b.p[0] + fxw * 2.4, 10, dt); look.y = damp(look.y, py + .4, 8, dt); look.z = damp(look.z, b.p[2] + fzw * 2.4, 10, dt);
      cam.position.copy(camPos); cam.lookAt(look);
      sky.mesh.position.copy(camPos);
      ball.position.set(b.p[0], b.p[1], b.p[2]);
      sun.position.set(b.p[0] - 7, b.p[1] + 15, b.p[2] + 6);
      sun.target.position.set(b.p[0], b.p[1], b.p[2]);

      const pos = flagGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) { const x = flagBase[i * 3]; pos.setZ(i, Math.sin(x * 4 - T * 7) * .13 * x); }
      pos.needsUpdate = true; flagGeo.computeVertexNormals();
      for (let i = 0; i < cpMarks.length; i++) cpMarks[i].position.y = course.cps[i].y + .1 + Math.sin(T * 3 + i) * .04;
      if (Math.random() < dt * 8) { const g = course.goal, a = Math.random() * TAU; fx.emit(g.x + Math.cos(a) * 1.4, g.y + .2, g.z + Math.sin(a) * 1.4, 0, 1.5 + Math.random(), 0, .06, 1, cSpark[1], -.1); }
      clouds.rotation.y += dt * .004;
      fx.update(dt, 14);
      renderer.render(scene, cam);
    });

    loadLevel(0);
    api.overlay({
      kicker: '3D',
      title: 'Marble Roll',
      text: 'Roll through 6 floating courses to the flag as fast as you can. The clock starts when you move; falling off costs 2 seconds.',
      stats: [['Best total', fmtS(api.best)], ['Courses', MR_LEVELS.length]],
      button: 'Play',
      onAction: newRun
    });

    return () => { for (const o of bin.concat(lvBin)) o.dispose(); };
  }

  Ameplay.register({
    id: 'marble-3d',
    title: 'Marble Roll',
    category: '3D',
    blurb: 'Roll a shiny marble across floating courses to the flag.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows to roll · <kbd>Space</kbd> jump · drag or on-screen stick on touch',
    better: 'low',
    format: fmtS,
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="40" r="11"/><path d="M13.5 35q8.5 6 17 0"/><path d="M4 55h56"/><path d="M48 55V10l11 5.5L48 21"/></svg>',
    css: STAGE_CSS('marble-3d') + `
.gm-marble-3d .hud{position:absolute;left:0;right:0;top:0;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:clamp(8px,2cqw,16px);pointer-events:none}
.gm-marble-3d .pill{padding:clamp(5px,1.2cqw,8px) clamp(9px,2cqw,14px);border-radius:999px;background:rgba(255,255,255,.88);font:800 clamp(10px,2.2cqw,13px)/1 var(--sans);color:var(--muted);white-space:nowrap;box-shadow:0 6px 16px -8px rgba(31,29,43,.4)}
.gm-marble-3d .pill b{color:var(--ink);font-weight:900;font-variant-numeric:tabular-nums}
.gm-marble-3d .clock{min-width:3.2em;padding:.18em .5em;border-radius:999px;background:rgba(31,29,43,.62);font:900 clamp(20px,4.6cqw,36px)/1 var(--sans);color:#fff;text-align:center;font-variant-numeric:tabular-nums;box-shadow:0 8px 20px -10px rgba(31,29,43,.6)}
.gm-marble-3d .msg{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);font:900 clamp(22px,6cqw,44px)/1 var(--sans);color:#fff;white-space:nowrap;opacity:0;pointer-events:none;text-shadow:0 3px 0 rgba(31,29,43,.2),0 8px 22px rgba(31,29,43,.3)}
.gm-marble-3d .stick{position:absolute;left:clamp(12px,3cqw,26px);bottom:clamp(12px,3cqw,26px);width:clamp(76px,16cqw,120px);aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.7);opacity:0;pointer-events:none;transition:opacity .2s}
.gm-marble-3d .stick i{position:absolute;left:30%;top:30%;width:40%;height:40%;border-radius:50%;background:#fff;box-shadow:0 4px 12px -2px rgba(31,29,43,.35)}
.gm-marble-3d .stage.touch .stick,.gm-marble-3d .stage.drag .stick{opacity:1}
.gm-marble-3d .jump{position:absolute;right:clamp(12px,3cqw,26px);bottom:clamp(12px,3cqw,26px);width:clamp(60px,12cqw,86px);aspect-ratio:1;border:0;border-radius:50%;background:rgba(255,255,255,.9);color:var(--accent);display:none;place-items:center;padding:0;cursor:pointer;touch-action:none;box-shadow:0 8px 20px -8px rgba(31,29,43,.45)}
.gm-marble-3d .jump svg{width:46%;height:46%}
.gm-marble-3d .stage.touch .jump{display:grid}
@media (pointer:coarse){.gm-marble-3d .stick{opacity:1}.gm-marble-3d .jump{display:grid}}`,
    mount: mount3d(root => root.clientWidth && root.clientWidth < 560 ? [600, 720] : [960, 600], marbleGame)
  });
})();

