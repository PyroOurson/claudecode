
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const rand = (a, b) => a + Math.random() * (b - a);
  const damp = (k, dt) => 1 - Math.exp(-k * dt);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  function stageFor(root, canvas, w, h, extra) {
    const st = el('div', 'stage');
    st.style.width = `min(100%, ${w}px, calc((100dvh - ${250 + extra}px) * ${(w / h).toFixed(4)}))`;
    canvas.style.width = '100%';
    root.prepend(st);
    st.append(canvas);
    return st;
  }
  function glowTex(THREE, stops, size = 64) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function mergeParts(THREE, list) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    const P = [], N = [], U = [];
    for (const [g, p = [0, 0, 0], r = [0, 0, 0], k = [1, 1, 1]] of list) {
      const t = g.index ? g.toNonIndexed() : g.clone();
      m.compose(v.set(p[0], p[1], p[2]), q.setFromEuler(e.set(r[0], r[1], r[2])), sc.set(k[0], k[1], k[2]));
      t.applyMatrix4(m);
      P.push(t.attributes.position.array); N.push(t.attributes.normal.array); U.push(t.attributes.uv.array);
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
    return geo;
  }

  function cubeNew(n) {
    const m = n - 1, cubies = [];
    for (let x = -m; x <= m; x += 2) for (let y = -m; y <= m; y += 2) for (let z = -m; z <= m; z += 2) {
      const pos = [x, y, z], st = [];
      for (let a = 0; a < 3; a++) if (Math.abs(pos[a]) === m) st.push([a, pos[a] > 0 ? 1 : -1]);
      cubies.push({ pos, rot: [1, 0, 0, 0, 1, 0, 0, 0, 1], st });
    }
    return { n, m, cubies };
  }
  function rotOf(axis, d) {
    if (axis === 0) return [1, 0, 0, 0, 0, -d, 0, d, 0];
    if (axis === 1) return [0, 0, d, 0, 1, 0, -d, 0, 0];
    return [0, -d, 0, d, 0, 0, 0, 0, 1];
  }
  function cubeTurn(cube, axis, layer, d) {
    const R = rotOf(axis, d);
    for (const c of cube.cubies) {
      if (c.pos[axis] !== layer) continue;
      const p = c.pos, q = c.rot, o = [];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o.push(R[i * 3] * q[j] + R[i * 3 + 1] * q[3 + j] + R[i * 3 + 2] * q[6 + j]);
      c.pos = [0, 1, 2].map(i => R[i * 3] * p[0] + R[i * 3 + 1] * p[1] + R[i * 3 + 2] * p[2]);
      c.rot = o;
    }
  }
  function cubeSolved(cube) {
    const face = [-1, -1, -1, -1, -1, -1];
    for (const c of cube.cubies) for (const [a, s] of c.st) {
      const w0 = c.rot[a] * s, w1 = c.rot[3 + a] * s, w2 = c.rot[6 + a] * s;
      const f = w0 ? (w0 > 0 ? 0 : 1) : w1 ? (w1 > 0 ? 2 : 3) : (w2 > 0 ? 4 : 5), home = a * 2 + (s > 0 ? 0 : 1);
      if (face[f] < 0) face[f] = home; else if (face[f] !== home) return false;
    }
    return true;
  }
  function cubeScramble(m, len) {
    const out = [];
    let last = -1;
    while (out.length < len) {
      const axis = Math.random() * 3 | 0;
      if (axis === last) continue;
      last = axis;
      out.push({ axis, layer: Math.random() < 0.5 ? -m : m, dir: Math.random() < 0.5 ? -1 : 1 });
    }
    return out;
  }

  const dragTurn = (fa, s, t, sg) => { const r = 3 - fa - t; return { axis: r, dir: s * sg * (fa === (r + 1) % 3 ? 1 : -1) }; };

  const FACES = { KeyU: [1, 1, -1], KeyD: [1, -1, 1], KeyR: [0, 1, -1], KeyL: [0, -1, 1], KeyF: [2, 1, -1], KeyB: [2, -1, 1], KeyM: [0, 0, 1], KeyE: [1, 0, 1], KeyS: [2, 0, -1] };
  const fmtT = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

  function roundedBox(THREE, size, radius, B) {
    const S = 2 * (B + 1), g = new THREE.BoxGeometry(1, 1, 1, S, S, S);
    const r = radius / size, inner = 0.5 - r;
    const lv = m => m === 0 ? 0 : m === 1 ? inner : inner + r * Math.tan((m - 1) / B * Math.PI / 4);
    const P = g.attributes.position.array, N = g.attributes.normal.array, q = [0, 0, 0];
    for (let i = 0; i < P.length; i += 3) {
      let dl = 0;
      for (let k = 0; k < 3; k++) {
        const idx = Math.round((P[i + k] + 0.5) * S) - S / 2;
        q[k] = Math.sign(idx) * lv(Math.abs(idx));
        N[i + k] = q[k] - clamp(q[k], -inner, inner);
        dl += N[i + k] * N[i + k];
      }
      dl = Math.sqrt(dl) || 1;
      for (let k = 0; k < 3; k++) { N[i + k] /= dl; P[i + k] = clamp(q[k], -inner, inner) + N[i + k] * r; }
    }
    g.scale(size, size, size);
    return g;
  }
  function stickerGeo(THREE, a, rr) {
    const bs = 0.014, h = a / 2 - bs, r = rr - bs, s = new THREE.Shape();
    s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false);
    s.lineTo(h, h - r); s.absarc(h - r, h - r, r, 0, Math.PI / 2, false);
    s.lineTo(-h + r, h); s.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(-h, -h + r); s.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.012, bevelSize: bs, bevelSegments: 2, curveSegments: 5 });
    g.translate(0, 0, 0.012);
    return g;
  }

  Ameplay.register({
    id: 'cube-3d',
    title: "Rubik's Cube",
    category: '3D',
    blurb: "Scramble a 3D Rubik's Cube, then solve it in the fewest moves.",
    help: 'Drag a sticker to turn its layer · drag the background to look around · <kbd>U</kbd> <kbd>D</kbd> <kbd>L</kbd> <kbd>R</kbd> <kbd>F</kbd> <kbd>B</kbd> turn faces (<kbd>Shift</kbd> reverses) · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo',
    better: 'low',
    format: v => v + ' moves',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8l22 12v24L32 56 10 44V20z"/><path d="M10 20l22 12 22-12M32 32v24"/><path d="M17.3 24v24M24.7 28v24M39.3 28v24M46.7 24v24M10 28l22 12 22-12M10 36l22 12 22-12M17.3 16l22 12M24.7 12l22 12M46.7 16l-22 12M39.3 12l-22 12"/></svg>',
    css: `
.gm-cube-3d .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:radial-gradient(110% 90% at 50% 36%,#ffffff 0%,#f3f0ff 42%,#dcd3fb 100%)}
.gm-cube-3d .stage canvas{background:transparent;cursor:grab}
.gm-cube-3d .stage canvas:active{cursor:grabbing}
.gm-cube-3d .hud{position:absolute;left:14px;top:12px;display:flex;gap:8px;pointer-events:none}
.gm-cube-3d .chip{display:flex;flex-direction:column;align-items:flex-start;min-width:74px;padding:7px 14px;border-radius:14px;background:rgba(255,255,255,.8);box-shadow:0 8px 20px -12px rgba(60,40,140,.55)}
.gm-cube-3d .chip span{font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.gm-cube-3d .chip b{font-size:21px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.15}
.gm-cube-3d .tag{position:absolute;right:14px;top:14px;padding:7px 13px;border-radius:999px;background:rgba(255,255,255,.8);box-shadow:0 8px 20px -12px rgba(60,40,140,.55);font-size:12.5px;font-weight:900;color:var(--accent);pointer-events:none}
.gm-cube-3d .seg{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:var(--sunk)}
.gm-cube-3d .seg button{height:30px;padding:0 15px;border:0;border-radius:999px;background:transparent;font:800 13.5px var(--sans);color:var(--muted);cursor:pointer}
.gm-cube-3d .seg button.on{background:#fff;color:var(--ink);box-shadow:0 2px 8px -3px rgba(31,29,43,.35)}
@media (max-width:560px){.gm-cube-3d .hud{left:8px;top:8px;gap:5px}.gm-cube-3d .chip{min-width:0;padding:4px 9px;border-radius:10px}.gm-cube-3d .chip b{font-size:15px}.gm-cube-3d .tag{top:auto;right:auto;left:50%;bottom:8px;transform:translateX(-50%);padding:4px 10px;font-size:11px;white-space:nowrap}}
@media (pointer:coarse){.gm-cube-3d .seg button,.gm-cube-3d .g-btn.sm{height:40px}}
`,
    mount(root, api) {
      const bin = [];
      const own = o => { bin.push(o); return o; };
      boot().catch(e => console.error(e));
      return { destroy() { for (const o of bin) { try { o.dispose(); } catch (e) {} } bin.length = 0; } };

      async function boot() {
        const v = await api.gl(960, 600, { alpha: true });
        if (!v) return;
        const { THREE, renderer, canvas, w, h, toLocal } = v;
        const col = hex => new THREE.Color(hex).convertSRGBToLinear();
        renderer.toneMappingExposure = 0.95;
        const stage = stageFor(root, canvas, w, h, 60);
        const hud = el('div', 'hud', '<div class="chip"><span>Moves</span><b>0</b></div><div class="chip"><span>Time</span><b>0:00.0</b></div>');
        const [mvEl, tmEl] = hud.querySelectorAll('b');
        const tag = el('div', 'tag');
        stage.append(hud, tag);
        const ctl = el('div', 'g-row', '<div class="seg"><button data-n="2">2x2</button><button data-n="3">3x3</button></div><button class="g-btn sm">Scramble</button><button class="g-btn sm ghost">Undo</button>');
        root.append(ctl);
        const segBtns = ctl.querySelectorAll('.seg button'), [scrBtn, undoBtn] = ctl.querySelectorAll('.g-btn');

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);

        const pm = own(new THREE.PMREMGenerator(renderer));
        const env = new THREE.Scene();
        env.background = new THREE.Color(0.11, 0.1, 0.14);
        const panel = own(new THREE.PlaneGeometry(1, 1));
        for (const [x, y, z, sx, sy, r, g, b] of [[0, 7, 0, 9, 9, 2.6, 2.6, 2.6], [-7, 2, 4, 4, 7, 1.1, 1.05, 1.4], [7, 1, -3, 4, 7, 1.4, 1.1, 0.8], [0, 1, 8, 7, 2.5, 0.8, 0.8, 0.9]]) {
          const p = new THREE.Mesh(panel, own(new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), side: THREE.DoubleSide })));
          p.position.set(x, y, z); p.scale.set(sx, sy, 1); p.lookAt(0, 0, 0); env.add(p);
        }
        scene.environment = own(pm.fromScene(env, 0.03)).texture;
        renderer.setClearColor(0x000000, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x8f86c4, 0.25));
        const key = new THREE.DirectionalLight(0xffffff, 1.15);
        key.position.set(2.5, 9, 4); key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004;
        Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 22 });
        key.shadow.camera.updateProjectionMatrix();
        scene.add(key);
        const floorMat = own(new THREE.ShadowMaterial({ opacity: 0.17 }));
        const floor = new THREE.Mesh(own(new THREE.PlaneGeometry(40, 40)), floorMat);
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

        const stand = new THREE.Group();
        const standTop = new THREE.Mesh(own(new THREE.CylinderGeometry(2.9, 3.0, 0.2, 72)), own(new THREE.MeshStandardMaterial({ color: col('#e9e3ff'), roughness: 0.28, metalness: 0.05 })));
        standTop.position.y = -0.11; standTop.receiveShadow = true;
        const standRing = new THREE.Mesh(own(new THREE.TorusGeometry(2.55, 0.03, 8, 96)), own(new THREE.MeshBasicMaterial({ color: col('#9b8cff'), toneMapped: false })));
        standRing.rotation.x = Math.PI / 2; standRing.position.y = 0.002;
        const standRing2 = new THREE.Mesh(own(new THREE.TorusGeometry(1.9, 0.014, 6, 96)), own(new THREE.MeshBasicMaterial({ color: col('#c9bfff'), toneMapped: false })));
        standRing2.rotation.x = Math.PI / 2; standRing2.position.y = 0.002;
        const standBase = new THREE.Mesh(own(new THREE.CylinderGeometry(3.05, 3.2, 0.34, 72)), own(new THREE.MeshStandardMaterial({ color: col('#b7a9f2'), roughness: 0.5, metalness: 0.1 })));
        standBase.position.y = -0.38;
        stand.add(standTop, standRing, standRing2, standBase);
        scene.add(stand);
        const bodyGeo = own(roundedBox(THREE, 0.96, 0.12, 3));
        const stickGeo = own(stickerGeo(THREE, 0.8, 0.13));
        const plastic = own(new THREE.MeshPhysicalMaterial({ color: col('#16171c'), roughness: 0.34, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.25 }));

        const smat = ['#e8283a', '#ff8a1c', '#f7f7f2', '#ffd21f', '#14b85c', '#1f6bff'].map(c => own(new THREE.MeshPhysicalMaterial({ color: col(c), roughness: 0.28, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.1 })));
        const cubeRoot = new THREE.Group();
        scene.add(cubeRoot);

        const CN = 170, cf = new Float32Array(CN * 12), dummy = new THREE.Object3D();
        const conf = new THREE.InstancedMesh(own(new THREE.PlaneGeometry(0.1, 0.17)), own(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false })), CN);
        const confCols = [...C.hues, '#ffd21f', '#ff8fab', '#06d6a0'].map(col);
        for (let i = 0; i < CN; i++) conf.setColorAt(i, confCols[i % confCols.length]);
        conf.frustumCulled = false; conf.visible = false; scene.add(conf);
        let confT = -1;

        const saved = api.load() || {};
        let n = saved.n === 2 ? 2 : 3, cube = null, pieces = [], meshes = [];
        let state = 'free', moves = 0, hist = [], queue = [], anim = null, t0 = 0, lastShown = '';
        let yaw = 0.62, pitch = 0.48, vyaw = 0, vpitch = 0, camDist = 10.4, camD = 10.4, spin = -1, drag = null;
        const Z = new THREE.Vector3(0, 0, 1), tv = new THREE.Vector3(), lp = new THREE.Vector3(), pa = new THREE.Vector3(), pb = new THREE.Vector3();
        const AX = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
        const rm = new THREE.Matrix4(), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

        function sync(i) {
          const c = cube.cubies[i], r = c.rot, p = c.pos, g = pieces[i].g;
          g.matrix.set(r[0], r[1], r[2], p[0] / 2, r[3], r[4], r[5], p[1] / 2, r[6], r[7], r[8], p[2] / 2, 0, 0, 0, 1);
          g.matrixWorldNeedsUpdate = true;
        }
        function build() {
          pieces.forEach(p => cubeRoot.remove(p.g));
          cube = cubeNew(n); pieces = []; meshes = []; queue = []; anim = null;
          cube.cubies.forEach((c, i) => {
            const g = new THREE.Group();
            g.matrixAutoUpdate = false;
            const body = new THREE.Mesh(bodyGeo, plastic);
            body.castShadow = true; body.userData.i = i; g.add(body); meshes.push(body);
            for (const [a, s] of c.st) {
              const m = new THREE.Mesh(stickGeo, smat[a * 2 + (s > 0 ? 0 : 1)]);
              tv.set(0, 0, 0).setComponent(a, s);
              m.quaternion.setFromUnitVectors(Z, tv); m.position.copy(tv).multiplyScalar(0.468);
              m.userData.i = i; g.add(m); meshes.push(m);
            }
            cubeRoot.add(g);
            pieces.push({ g, base: new THREE.Matrix4() });
            sync(i);
          });
          floor.position.y = -(n * 0.5 + 0.8);
          stand.position.y = floor.position.y - 0.012;
          camDist = n === 3 ? 10.4 : 7.8;
        }
        function setMoves(v) { moves = v; mvEl.textContent = v; api.score(v); }
        function setTag() {
          tag.textContent = `${n}x${n} · ${{ free: 'Free play', scrambling: 'Scrambling…', ready: 'Timer starts on first turn', solving: 'Solving', won: 'Solved!' }[state]}`;
        }
        function resetRun(st) { state = st; hist = []; setMoves(0); tmEl.textContent = '0:00.0'; lastShown = ''; setTag(); }
        function scrambleMoves() { for (const s of cubeScramble(cube.m, n === 3 ? 20 : 12)) queue.push({ ...s, kind: 'scramble' }); }
        function scramble() {
          build(); resetRun('scrambling'); scrambleMoves(); api.sfx('pop');
        }
        function userMove(axis, layer, dir) {
          if (state === 'scrambling' || state === 'won') return;
          if (state === 'ready') { state = 'solving'; t0 = performance.now(); setTag(); }
          queue.push({ axis, layer, dir, kind: 'user' });
          hist.push({ axis, layer, dir });
          if (anim) anim.dur = Math.min(anim.dur, 0.1);
          setMoves(moves + 1); api.sfx('tick');
        }
        function undo() {
          if (state === 'scrambling' || state === 'won' || !hist.length) return;
          const m = hist.pop();
          queue.push({ axis: m.axis, layer: m.layer, dir: -m.dir, kind: 'undo' });
          if (anim) anim.dur = Math.min(anim.dur, 0.1);
          setMoves(Math.max(0, moves - 1)); api.sfx('tap');
        }
        function win() {
          state = 'won'; setTag();
          const secs = (performance.now() - t0) / 1000;
          let isNew, best;
          if (n === 3) { isNew = api.submit(moves); best = api.best; }
          else {
            const s = api.load() || {};
            isNew = !s.best2 || moves < s.best2;
            if (isNew) api.save({ ...s, best2: moves });
            best = isNew ? moves : s.best2;
          }
          spin = 0; confetti(); api.sfx('win');
          const ov = {
            kicker: isNew ? 'New best!' : 'Solved!', title: 'Cube solved',
            text: n === 3 ? 'Every face is one colour again. Can you do it in fewer moves?' : '2x2 records are kept apart from the 3x3 leaderboard.',
            stats: [['Moves', moves], ['Time', fmtT(secs)], [`${n}x${n} best`, best == null ? '—' : best]],
            button: 'Scramble again', onAction: scramble, secondary: 'Free play', onSecondary: () => resetRun('free')
          };
          api.timeout(() => { if (state === 'won') api.overlay(ov); }, 1500);
        }
        function stepTurns(dt) {
          if (!anim && queue.length) {
            const m = queue.shift(), list = [];
            cube.cubies.forEach((c, i) => { if (c.pos[m.axis] === m.layer) { list.push(i); pieces[i].base.copy(pieces[i].g.matrix); } });
            cubeTurn(cube, m.axis, m.layer, m.dir);
            anim = { m, list, t: 0, dur: m.kind === 'scramble' ? 0.075 : queue.length ? 0.1 : 0.2 };
          }
          if (!anim) return;
          anim.t += dt;
          const k = Math.min(1, anim.t / anim.dur), e = 1 - Math.pow(1 - k, 3);
          rm.makeRotationAxis(AX[anim.m.axis], e * anim.m.dir * Math.PI / 2);
          for (const i of anim.list) { const g = pieces[i].g; g.matrix.multiplyMatrices(rm, pieces[i].base); g.matrixWorldNeedsUpdate = true; }
          if (k < 1) return;
          const m = anim.m;
          anim.list.forEach(i => sync(i));
          anim = null;
          if (m.kind === 'scramble' && !queue.length) {
            if (cubeSolved(cube)) scrambleMoves();
            else { state = 'ready'; setTag(); api.sfx('pop'); }
          } else if (state === 'solving' && !queue.length && cubeSolved(cube)) win();
        }
        function confetti() {
          confT = 0; conf.visible = true;
          for (let i = 0; i < CN; i++) {
            const o = i * 12, a = rand(0, TAU), up = rand(0.2, 1), sp = rand(3, 7.5);
            cf[o] = Math.cos(a) * 0.6; cf[o + 1] = rand(-0.5, 0.8); cf[o + 2] = Math.sin(a) * 0.6;
            cf[o + 3] = Math.cos(a) * sp * (1 - up * 0.5); cf[o + 4] = up * sp * 1.1 + 2; cf[o + 5] = Math.sin(a) * sp * (1 - up * 0.5);
            for (let k = 6; k < 9; k++) cf[o + k] = rand(0, TAU);
            for (let k = 9; k < 12; k++) cf[o + k] = rand(-9, 9);
          }
        }
        function stepConfetti(dt) {
          if (confT < 0) return;
          confT += dt;
          const dr = Math.exp(-1.4 * dt);
          for (let i = 0; i < CN; i++) {
            const o = i * 12;
            cf[o + 3] *= dr; cf[o + 4] = cf[o + 4] * dr - 7 * dt; cf[o + 5] *= dr;
            for (let k = 0; k < 3; k++) { cf[o + k] += cf[o + 3 + k] * dt; cf[o + 6 + k] += cf[o + 9 + k] * dt; }
            dummy.position.set(cf[o], cf[o + 1], cf[o + 2]);
            dummy.rotation.set(cf[o + 6], cf[o + 7], cf[o + 8]);
            dummy.scale.setScalar(confT > 2.6 ? Math.max(0, 1 - (confT - 2.6) * 2.5) : 1);
            dummy.updateMatrix();
            conf.setMatrixAt(i, dummy.matrix);
          }
          conf.instanceMatrix.needsUpdate = true;
          if (confT > 3) { confT = -1; conf.visible = false; }
        }

        api.on(canvas, 'pointerdown', e => {
          if (drag || e.button > 0) return;
          try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
          drag = { id: e.pointerId, kind: 'orbit', x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, lt: e.timeStamp };
          vyaw = vpitch = 0;
          if (state === 'scrambling' || state === 'won') return;
          const p = toLocal(e);
          ndc.set(p.nx, p.ny); ray.setFromCamera(ndc, camera);
          const hit = ray.intersectObjects(meshes, false)[0];
          if (!hit) return;
          const i = hit.object.userData.i, c = cube.cubies[i];
          lp.copy(hit.point); pieces[i].g.worldToLocal(lp);
          let la = 0;
          if (Math.abs(lp.y) > Math.abs(lp.getComponent(la))) la = 1;
          if (Math.abs(lp.z) > Math.abs(lp.getComponent(la))) la = 2;
          const ls = lp.getComponent(la) > 0 ? 1 : -1;

          const wn = [c.rot[la] * ls, c.rot[3 + la] * ls, c.rot[6 + la] * ls], fa = wn[0] ? 0 : wn[1] ? 1 : 2;
          Object.assign(drag, { kind: 'turn', i, fa, s: wn[fa] });
        });
        api.on(canvas, 'pointermove', e => {
          if (!drag || e.pointerId !== drag.id) return;
          if (drag.kind === 'orbit') {
            const k = 3.4 / canvas.getBoundingClientRect().width, dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
            const dt = Math.max(0.008, (e.timeStamp - drag.lt) / 1000);
            yaw -= dx * k; pitch = clamp(pitch + dy * k, -1.35, 1.35);
            vyaw = vyaw * 0.4 - dx * k / dt * 0.6; vpitch = vpitch * 0.4 + dy * k / dt * 0.6;
            drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = e.timeStamp;
          } else if (drag.kind === 'turn') {
            const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            if (dx * dx + dy * dy < 64) return;
            const c = cube.cubies[drag.i];
            pa.set(c.pos[0] / 2, c.pos[1] / 2, c.pos[2] / 2);
            pa.setComponent(drag.fa, pa.getComponent(drag.fa) + drag.s * 0.5);
            pb.copy(pa).project(camera);
            const ox = pb.x * w / 2, oy = -pb.y * h / 2;
            let best = -1, bt = 0, bs = 1;
            for (let t = 0; t < 3; t++) {
              if (t === drag.fa) continue;
              pb.copy(pa).setComponent(t, pa.getComponent(t) + 0.5).project(camera);
              const sx = pb.x * w / 2 - ox, sy = -pb.y * h / 2 - oy, d = (dx * sx + dy * sy) / (Math.hypot(sx, sy) || 1);
              if (Math.abs(d) > best) { best = Math.abs(d); bt = t; bs = d > 0 ? 1 : -1; }
            }
            const mv = dragTurn(drag.fa, drag.s, bt, bs);
            drag.kind = 'done';
            userMove(mv.axis, c.pos[mv.axis], mv.dir);
          }
        });
        const endDrag = e => {
          if (!drag || e.pointerId !== drag.id) return;
          if (drag.kind !== 'orbit' || e.timeStamp - drag.lt > 90) vyaw = vpitch = 0;
          drag = null;
        };
        api.on(canvas, 'pointerup', endDrag);
        api.on(canvas, 'pointercancel', endDrag);
        api.on(canvas, 'lostpointercapture', endDrag);
        api.on(window, 'keydown', e => {
          if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
          if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          if (e.code === 'Backspace') { e.preventDefault(); undo(); return; }
          const f = FACES[e.code];
          if (f) {
            if (!e.repeat && !(f[1] === 0 && n === 2)) userMove(f[0], f[1] * cube.m, e.shiftKey ? -f[2] : f[2]);
            return;
          }
          if (e.code === 'ArrowLeft') vyaw += 2.6;
          else if (e.code === 'ArrowRight') vyaw -= 2.6;
          else if (e.code === 'ArrowUp') vpitch -= 2;
          else if (e.code === 'ArrowDown') vpitch += 2;
        });
        const paintSeg = () => segBtns.forEach(b => b.classList.toggle('on', +b.dataset.n === n));
        segBtns.forEach(b => api.on(b, 'click', () => {
          b.blur();
          n = +b.dataset.n;
          api.save({ ...(api.load() || {}), n });
          build(); resetRun('free'); paintSeg();
        }));
        api.on(scrBtn, 'click', () => { scrBtn.blur(); api.hideOverlay(); scramble(); });
        api.on(undoBtn, 'click', () => { undoBtn.blur(); undo(); });

        build(); paintSeg(); resetRun('free');
        api.overlay({
          kicker: '3D', title: "Rubik's Cube",
          text: 'Drag a sticker to turn its layer and drag the background to look around. Scramble it, then solve it in as few moves as you can.',
          button: 'Scramble', onAction: scramble, secondary: 'Free play'
        });

        api.loop(dt => {
          stepTurns(dt);
          if (!drag || drag.kind !== 'orbit') {
            yaw += vyaw * dt; pitch += vpitch * dt;
            const f = Math.exp(-3.2 * dt);
            vyaw *= f; vpitch *= f;
            if (Math.abs(pitch) > 1.35) { pitch = clamp(pitch, -1.35, 1.35); vpitch = 0; }
          }
          camD += (camDist - camD) * damp(6, dt);
          const cp = Math.cos(pitch);
          camera.position.set(camD * cp * Math.sin(yaw), camD * Math.sin(pitch), camD * cp * Math.cos(yaw));
          camera.lookAt(0, -0.05, 0);
          floorMat.opacity = 0.17 * clamp((pitch - 0.12) / 0.3, 0, 1);
          floor.visible = floorMat.opacity > 0;
          stand.visible = pitch > -0.12;
          if (spin >= 0) {
            spin += dt / 1.6;
            const k = Math.min(1, spin), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
            cubeRoot.rotation.y = e * TAU;
            cubeRoot.position.y = Math.sin(k * Math.PI) * 0.35;
            cubeRoot.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.08);
            if (k >= 1) { spin = -1; cubeRoot.rotation.y = 0; cubeRoot.position.y = 0; }
          }
          stepConfetti(dt);
          if (state === 'solving') { const s = fmtT((performance.now() - t0) / 1000); if (s !== lastShown) tmEl.textContent = lastShown = s; }
          renderer.render(scene, camera);
        });
      }
    }
  });

  function rockGeo(THREE, k) {
    const g = new THREE.IcosahedronGeometry(1, 2).toNonIndexed(), p = g.attributes.position.array, cache = new Map();
    const ncr = 7 + k, cr = [];
    for (let i = 0; i < ncr; i++) {
      const a = rand(0, TAU), z = rand(-1, 1), r = Math.sqrt(1 - z * z);
      cr.push([Math.cos(a) * r, z, Math.sin(a) * r, rand(0.26, 0.58)]);
    }
    const ph = [rand(0, 6), rand(0, 6), rand(0, 6)], col = new Float32Array(p.length);
    for (let i = 0; i < p.length; i += 3) {
      const key = Math.round(p[i] * 1e4) + ',' + Math.round(p[i + 1] * 1e4) + ',' + Math.round(p[i + 2] * 1e4);
      let o = cache.get(key);
      if (!o) {
        const l = Math.hypot(p[i], p[i + 1], p[i + 2]), x = p[i] / l, y = p[i + 1] / l, z = p[i + 2] / l;
        let f = 0.93 + Math.random() * 0.1 + 0.1 * Math.sin(x * 2.6 + ph[0]) * Math.cos(y * 2.1 + ph[1]) + 0.07 * Math.sin(z * 4.3 + x * 1.7 + ph[2]), sh = 1 + (Math.random() - 0.5) * 0.12;
        for (const c of cr) {
          const d = Math.acos(clamp(x * c[0] + y * c[1] + z * c[2], -1, 1)), t = d / c[3];
          if (t < 1) { f -= 0.17 * (1 - t * t); sh *= 0.62 + 0.38 * t; if (t > 0.8) sh *= 1.12; }
          else if (t < 1.22) { f += 0.05 * (1 - (t - 1) / 0.22); sh *= 1.06; }
        }
        f = clamp(f, 0.6, 1.2);
        o = { x: x * f, y: y * f, z: z * f, sh };
        cache.set(key, o);
      }
      p[i] = o.x; p[i + 1] = o.y; p[i + 2] = o.z;
      col[i] = col[i + 1] = col[i + 2] = o.sh;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sq = [[1.15, 0.85, 1], [0.95, 1.05, 1.2], [1.2, 1, 0.82]][k];
    g.scale(sq[0], sq[1], sq[2]);
    g.computeVertexNormals();
    return g;
  }

  Ameplay.register({
    id: 'asteroids-3d',
    title: 'Asteroid Field',
    category: '3D',
    blurb: 'Fly a starfighter through an endless asteroid field and blast rocks.',
    help: 'Mouse, touch, arrows or <kbd>A</kbd> <kbd>D</kbd> to steer · <kbd>W</kbd> / <kbd>S</kbd> speed up / slow down (<kbd>Z</kbd> / <kbd>S</kbd> on AZERTY) · click or <kbd>Space</kbd> to fire · hold <kbd>Shift</kbd> to boost',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M35 7l13 5 7 11-2 13-10 7-13-1-8-10 2-14z"/><path d="M31 19l5 3-1 6M44 29l-4 5"/><path d="M10 58l7-13 7 13-7-4z"/><path d="M17 39v-4M17 30v-3"/></svg>',
    css: `
.gm-asteroids-3d .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:radial-gradient(42% 46% at 50% 40%,#3b2268 0%,rgba(59,34,104,0) 100%),radial-gradient(55% 60% at 18% 26%,rgba(222,64,170,.5) 0%,rgba(222,64,170,0) 100%),radial-gradient(55% 60% at 84% 20%,rgba(70,112,255,.5) 0%,rgba(70,112,255,0) 100%),radial-gradient(50% 50% at 74% 92%,rgba(40,210,200,.26) 0%,rgba(40,210,200,0) 100%),radial-gradient(45% 45% at 12% 90%,rgba(255,140,70,.22) 0%,rgba(255,140,70,0) 100%),linear-gradient(#0c0922,#1f1342 55%,#2a1446)}
.gm-asteroids-3d .stage canvas{background:transparent;cursor:crosshair}
.gm-asteroids-3d .hud{position:absolute;left:14px;right:14px;top:12px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;color:#fff;pointer-events:none}
.gm-asteroids-3d .bars{display:flex;flex-direction:column;gap:7px;padding:9px 13px;border-radius:14px;background:rgba(12,8,30,.5)}
.gm-asteroids-3d .bar{display:flex;align-items:center;gap:10px}
.gm-asteroids-3d .bar span{width:50px;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;opacity:.8}
.gm-asteroids-3d .bar i{display:block;width:150px;height:9px;border-radius:9px;background:rgba(255,255,255,.14);overflow:hidden}
.gm-asteroids-3d .bar b{display:block;height:100%;border-radius:inherit;transform-origin:0 50%;background:linear-gradient(90deg,#33e0ff,#7af7c9)}
.gm-asteroids-3d .bar.bo b{background:linear-gradient(90deg,#ff9a4a,#ffd36b)}
.gm-asteroids-3d .bar.th b{background:linear-gradient(90deg,#9b7bff,#e08bff)}
.gm-asteroids-3d .bar.low b{background:linear-gradient(90deg,#ff3b5c,#ff8a65)}
.gm-asteroids-3d .info{display:flex;gap:8px}
.gm-asteroids-3d .info div{display:flex;flex-direction:column;align-items:flex-end;min-width:70px;padding:7px 13px;border-radius:14px;background:rgba(12,8,30,.5)}
.gm-asteroids-3d .info span{font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;opacity:.75}
.gm-asteroids-3d .info b{font-size:19px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.15}
.gm-asteroids-3d .banner{position:absolute;left:0;right:0;top:27%;text-align:center;color:#fff;pointer-events:none;opacity:0}
.gm-asteroids-3d .banner b{display:block;font-size:clamp(30px,6vw,58px);font-weight:900;letter-spacing:-.03em;line-height:1.05;text-shadow:0 4px 26px rgba(130,100,255,.95)}
.gm-asteroids-3d .banner span{display:block;margin-top:6px;font-size:clamp(11px,1.6vw,14px);font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:#9ff3ff}
.gm-asteroids-3d .banner.go{animation:gmAfBanner 2.3s var(--ease) both}
@keyframes gmAfBanner{0%{opacity:0;transform:scale(.7)}12%{opacity:1;transform:scale(1.05)}20%{transform:scale(1)}78%{opacity:1}100%{opacity:0;transform:translateY(-14px)}}
.gm-asteroids-3d .hurt{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,rgba(255,40,80,0) 45%,rgba(255,40,80,.6) 100%)}
.gm-asteroids-3d .pop{position:absolute;transform:translate(-50%,-50%);font-size:19px;font-weight:900;color:#fff;text-shadow:0 2px 12px rgba(255,120,60,.95);pointer-events:none;white-space:nowrap;animation:gmAfPop .85s var(--ease) forwards}
@keyframes gmAfPop{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}20%{opacity:1;transform:translate(-50%,-60%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-170%) scale(1)}}
.gm-asteroids-3d .boost{display:none;position:absolute;right:14px;bottom:14px;width:76px;height:76px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(255,154,74,.38);color:#fff;font:900 12.5px var(--sans);letter-spacing:.08em;text-transform:uppercase;touch-action:none;-webkit-user-select:none;user-select:none}
.gm-asteroids-3d .boost.on{background:rgba(255,154,74,.75)}
@media (hover:none) and (pointer:coarse){.gm-asteroids-3d .boost{display:block}}
.gm-asteroids-3d .stage.touch .boost{display:block}
@media (max-width:560px){.gm-asteroids-3d .hud{left:8px;right:8px;top:8px}.gm-asteroids-3d .bars{gap:4px;padding:6px 9px;border-radius:10px}.gm-asteroids-3d .bar{gap:6px}.gm-asteroids-3d .bar span{width:auto;font-size:8.5px}.gm-asteroids-3d .bar i{width:64px;height:6px}.gm-asteroids-3d .info div{min-width:0;padding:4px 9px;border-radius:10px}.gm-asteroids-3d .info span{font-size:8.5px}.gm-asteroids-3d .info b{font-size:14px}.gm-asteroids-3d .boost{width:60px;height:60px;right:8px;bottom:8px}}
`,
    mount(root, api) {
      const bin = [];
      const own = o => { bin.push(o); return o; };
      const keys = api.keys;
      boot().catch(e => console.error(e));
      return { destroy() { for (const o of bin) { try { o.dispose(); } catch (e) {} } bin.length = 0; } };

      async function boot() {
        const v = await api.gl(960, 600, { alpha: true });
        if (!v) return;
        const { THREE, renderer, canvas, w, h, toLocal } = v;
        const col = hex => new THREE.Color(hex).convertSRGBToLinear();
        renderer.setClearColor(0x000000, 0);
        const BX = 21, BY = 12, FAR = 290, RN = 330, BN = 48, EN = 40, PN = 1400, BOLT_V = 260;

        const stage = stageFor(root, canvas, w, h, 0);
        const hud = el('div', 'hud', '<div class="bars"><div class="bar sh"><span>Shield</span><i><b></b></i></div><div class="bar bo"><span>Boost</span><i><b></b></i></div><div class="bar th"><span>Speed</span><i><b></b></i></div></div><div class="info"><div><span>Wave</span><b>1</b></div><div><span>Distance</span><b>0.00 km</b></div></div>');
        const [shB, boB, thB] = hud.querySelectorAll('.bar b'), shBar = hud.querySelector('.bar.sh'), [wvEl, dsEl] = hud.querySelectorAll('.info b');
        const banner = el('div', 'banner'), hurt = el('div', 'hurt'), boostBtn = el('button', 'boost', 'Boost');
        hud.hidden = true;
        stage.append(hud, banner, hurt, boostBtn);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x2c1a55, 0.0068);
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 800);
        scene.add(new THREE.HemisphereLight(col('#b9a8ff'), col('#2a1a40'), 0.95));
        const sun = new THREE.DirectionalLight(col('#fff0dc'), 2.3);
        sun.position.set(-6, 9, 4); scene.add(sun);
        const rim = new THREE.DirectionalLight(col('#56d8ff'), 1.5);
        rim.position.set(5, -2, -8); scene.add(rim);

        const glowT = own(glowTex(THREE, [[0, 'rgba(255,255,255,1)'], [0.22, 'rgba(255,255,255,.8)'], [0.5, 'rgba(255,255,255,.22)'], [1, 'rgba(255,255,255,0)']]));

        const ADD = { blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, depthWrite: false, transparent: true, toneMapped: false };
        const WHITE = new THREE.Color(1, 1, 1), tv = new THREE.Vector3(), vP = new THREE.Vector3(), vS = new THREE.Vector3(), m4 = new THREE.Matrix4(), qT = new THREE.Quaternion(), cT = new THREE.Color();
        const K = {
          flame: col('#ff9a4a'), boostFlame: col('#7fe8ff'), cyan: col('#5ee7ff'), red: col('#ff3b5c'), lock: col('#ff4fd8'),
          dust1: col('#b8a48f'), dust2: col('#6e6476'), fire1: col('#ffd36b'), fire2: col('#ff5a2a'), spark1: col('#ffffff'), spark2: col('#8ff3ff'),
          boom: col('#ffb36b'), green: col('#59ffb0'), purple: col('#b48cff')
        };

        const planetTex = (() => {
          const c = document.createElement('canvas'); c.width = 512; c.height = 256;
          const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256);
          [[0, '#7b4fd6'], [0.2, '#d96bd0'], [0.34, '#ffb7a1'], [0.5, '#a468e0'], [0.68, '#e07ac6'], [0.84, '#5f46c4'], [1, '#3a2a8a']].forEach(([o, cl]) => gr.addColorStop(o, cl));
          x.fillStyle = gr; x.fillRect(0, 0, 512, 256);
          for (let i = 0; i < 70; i++) {
            const y = rand(0, 256), hgt = rand(2, 12);
            x.fillStyle = Math.random() < 0.5 ? `rgba(255,255,255,${rand(0.05, 0.16)})` : `rgba(40,10,80,${rand(0.06, 0.2)})`;
            x.beginPath(); x.ellipse(rand(0, 512), y, rand(40, 200), hgt, 0, 0, TAU); x.fill();
          }
          return own(new THREE.CanvasTexture(c));
        })();
        const ringTex = (() => {
          const c = document.createElement('canvas'); c.width = 256; c.height = 4;
          const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 256, 0);
          [[0, 'rgba(255,220,250,0)'], [0.12, 'rgba(255,214,246,.7)'], [0.34, 'rgba(210,170,255,.35)'], [0.46, 'rgba(255,214,246,.0)'], [0.55, 'rgba(255,230,250,.6)'], [0.85, 'rgba(210,170,255,.5)'], [1, 'rgba(255,220,250,0)']].forEach(([o, cl]) => gr.addColorStop(o, cl));
          x.fillStyle = gr; x.fillRect(0, 0, 256, 4);
          return own(new THREE.CanvasTexture(c));
        })();
        const planet = new THREE.Group();
        planet.position.set(-150, 92, -440); planet.rotation.set(0.3, 0, -0.35);
        const pMesh = new THREE.Mesh(own(new THREE.SphereGeometry(60, 40, 28)), own(new THREE.MeshStandardMaterial({ map: planetTex, color: col('#bba8d4'), roughness: 1, metalness: 0, fog: false })));
        const ringGeo = own(new THREE.RingGeometry(78, 118, 72, 1));
        { const uv = ringGeo.attributes.uv, pos = ringGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.hypot(pos.getX(i), pos.getY(i)) - 78) / 40, 0.5); }
        const pRing = new THREE.Mesh(ringGeo, own(new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, toneMapped: false })));
        pRing.rotation.x = Math.PI / 2 - 0.08;
        const pGlow = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: glowT, color: col('#e07af0'), opacity: 0.5, fog: false, ...ADD })));
        pGlow.scale.setScalar(230);
        planet.add(pGlow, pMesh, pRing);
        scene.add(planet);
        const moon = new THREE.Mesh(own(new THREE.SphereGeometry(10, 20, 14)), own(new THREE.MeshStandardMaterial({ color: col('#cfc6dc'), roughness: 1, fog: false })));
        moon.position.set(210, 128, -380); scene.add(moon);

        const SN = 1600, sP = new Float32Array(SN * 3), sC = new Float32Array(SN * 3), tints = ['#ffffff', '#cfe0ff', '#ffd9f2', '#fff1c9'].map(col);
        for (let i = 0; i < SN; i++) {
          tv.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(450);
          tv.toArray(sP, i * 3);
          cT.copy(tints[i % 4]).multiplyScalar(rand(0.25, 1)).toArray(sC, i * 3);
        }
        const starGeo = own(new THREE.BufferGeometry());
        starGeo.setAttribute('position', new THREE.BufferAttribute(sP, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(sC, 3));
        const starMat = own(new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, depthWrite: false, toneMapped: false }));
        starMat.fog = false;
        const stars = new THREE.Points(starGeo, starMat);
        stars.frustumCulled = false; scene.add(stars);

        const DN = 150, dS = new Float32Array(DN * 3), dP = new Float32Array(DN * 6);
        for (let i = 0; i < DN; i++) { dS[i * 3] = rand(-34, 34); dS[i * 3 + 1] = rand(-20, 20); dS[i * 3 + 2] = rand(-160, 12); }
        const dustGeo = own(new THREE.BufferGeometry());
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dP, 3));
        const dust = new THREE.LineSegments(dustGeo, own(new THREE.LineBasicMaterial({ color: col('#cfe0ff'), opacity: 0.5, ...ADD })));
        dust.frustumCulled = false; scene.add(dust);

        const M = {
          hull: own(new THREE.MeshStandardMaterial({ color: col('#e8ebf5'), roughness: 0.38, metalness: 0.3, flatShading: true })),
          wing: own(new THREE.MeshStandardMaterial({ color: col('#6c5ce7'), roughness: 0.45, metalness: 0.2, flatShading: true })),
          trim: own(new THREE.MeshStandardMaterial({ color: col('#ff8a3d'), roughness: 0.5, metalness: 0.1, flatShading: true })),
          dark: own(new THREE.MeshStandardMaterial({ color: col('#2b2a3d'), roughness: 0.55, metalness: 0.45, flatShading: true })),
          glass: own(new THREE.MeshStandardMaterial({ color: col('#7fe3ff'), emissive: col('#1b6c9a'), roughness: 0.1, metalness: 0.4 })),
          hot: own(new THREE.MeshBasicMaterial({ color: col('#ffc58a'), toneMapped: false }))
        };
        const ship = new THREE.Group(), model = new THREE.Group();
        ship.add(model); scene.add(ship);
        const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(own(geo), mat); m.position.set(x, y, z); model.add(m); return m; };
        const rx = (g, a) => { g.rotateX(a); return g; };
        part(rx(new THREE.LatheGeometry([[0.001, -1.2], [0.36, -1.2], [0.47, -0.95], [0.47, -0.2], [0.39, 0.5], [0.27, 0.95], [0.2, 1.2]].map(([x, y]) => new THREE.Vector2(x, y)), 8), -Math.PI / 2), M.hull, 0, 0, 0.1);
        part(rx(new THREE.ConeGeometry(0.2, 0.8, 6), -Math.PI / 2), M.trim, 0, 0, -1.5);
        part(new THREE.SphereGeometry(0.3, 12, 8).scale(0.85, 0.7, 2), M.glass, 0, 0.24, -0.35);
        for (const sx of [-1, 1]) {
          const s = new THREE.Shape();
          s.moveTo(0.3 * sx, -0.25); s.lineTo(2.0 * sx, 0.65); s.lineTo(2.1 * sx, 1.0); s.lineTo(0.35 * sx, 1.05); s.closePath();
          part(rx(new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false }), Math.PI / 2), M.wing, 0, 0.03, 0);
          part(new THREE.BoxGeometry(0.06, 0.48, 0.42), M.trim, 2.07 * sx, 0.17, 0.84);
          part(rx(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), Math.PI / 2), M.dark, 0.62 * sx, -0.06, -0.55);
          part(rx(new THREE.CylinderGeometry(0.2, 0.25, 1.0, 8), Math.PI / 2), M.dark, 0.5 * sx, 0, 1.0);
          part(new THREE.CircleGeometry(0.17, 14), M.hot, 0.5 * sx, 0, 1.51);
        }
        const fin = new THREE.Shape();
        fin.moveTo(0.35, 0.2); fin.lineTo(1.25, 0.2); fin.lineTo(1.3, 0.95); fin.lineTo(1.0, 0.95); fin.closePath();
        part(new THREE.ExtrudeGeometry(fin, { depth: 0.06, bevelEnabled: false }).rotateY(-Math.PI / 2), M.wing, 0.03, 0, 0);
        M.neon = own(new THREE.MeshBasicMaterial({ color: col('#5ee7ff'), toneMapped: false }));
        M.navR = own(new THREE.MeshBasicMaterial({ color: col('#ff4b5c'), toneMapped: false }));
        M.navG = own(new THREE.MeshBasicMaterial({ color: col('#4bff9a'), toneMapped: false }));
        const lead = sx => [new THREE.BoxGeometry(1.95, 0.05, 0.05), [1.15 * sx, 0.07, 0.2], [0, -sx * 0.487, 0], [1, 1, 1]];
        part(mergeParts(THREE, [-1, 1].map(sx => lead(sx))), M.neon, 0, 0, 0);
        part(mergeParts(THREE, [
          [new THREE.CylinderGeometry(0.12, 0.17, 0.05, 6), [0, 0.43, 0.5], [0, 0, 0], [1, 1, 1]],
          [new THREE.BoxGeometry(0.52, 0.04, 0.3), [0, 0.1, -0.9], [0, 0, 0], [1, 1, 1]],
          [new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4), [0.15, 0.62, 1.0], [-0.3, 0, 0.2], [1, 1, 1]],
          [new THREE.BoxGeometry(0.12, 0.4, 0.08), [0, -0.38, 0.4], [0, 0, 0], [1, 1, 1]],
          [new THREE.BoxGeometry(0.46, 0.04, 0.05), [0, 0.27, 0.12], [0, 0, 0], [1, 1, 1]]
        ].concat([-1, 1].map(sx => [new THREE.BoxGeometry(0.5, 0.03, 0.34), [0.82 * sx, 0.04, -0.55], [0, -sx * 0.5, 0], [1, 1, 1]]))), M.trim, 0, 0, 0);
        part(mergeParts(THREE, [-1, 1].map(sx => [new THREE.BoxGeometry(0.3, 0.07, 0.22), [0.72 * sx, 0.03, 0.4], [0, 0, 0], [1, 1, 1]]).concat([-1, 1].map(sx => [new THREE.TorusGeometry(0.2, 0.035, 6, 12), [0.5 * sx, 0, 1.52], [0, 0, 0], [1, 1, 1]]))), M.dark, 0, 0, 0);
        part(mergeParts(THREE, [-1, 1].map(sx => [new THREE.TorusGeometry(0.06, 0.018, 5, 10), [0.62 * sx, -0.06, -1.07], [0, 0, 0], [1, 1, 1]])), M.neon, 0, 0, 0);
        part(new THREE.SphereGeometry(0.06, 8, 6), M.navR, -2.1, 0.45, 0.95);
        part(new THREE.SphereGeometry(0.06, 8, 6), M.navG, 2.1, 0.45, 0.95);
        part(new THREE.SphereGeometry(0.05, 8, 6), M.neon, 0, 0.8, 0.95);
        const flameMat = own(new THREE.SpriteMaterial({ map: glowT, color: K.flame, ...ADD }));
        const coneMat = own(new THREE.MeshBasicMaterial({ color: K.flame, opacity: 0.55, ...ADD }));
        const coneGeo = own(rx(new THREE.ConeGeometry(0.17, 1.4, 10, 1, true), Math.PI / 2).translate(0, 0, 0.7));
        const flames = [], cones = [];
        for (const sx of [-0.5, 0.5]) {
          const f = new THREE.Sprite(flameMat); f.position.set(sx, 0, 1.7); model.add(f); flames.push(f);
          const c = new THREE.Mesh(coneGeo, coneMat); c.position.set(sx, 0, 1.5); model.add(c); cones.push(c);
        }
        const shieldMat = own(new THREE.MeshBasicMaterial({ color: K.cyan, wireframe: true, opacity: 0, ...ADD }));
        const bubble = new THREE.Mesh(own(new THREE.IcosahedronGeometry(1, 1)), shieldMat);
        bubble.scale.set(2.5, 1.25, 2.6); ship.add(bubble);

        const retC = document.createElement('canvas'); retC.width = retC.height = 128;
        { const x = retC.getContext('2d'); x.strokeStyle = '#fff'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.arc(64, 64, 36, 0, TAU); x.stroke(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; x.beginPath(); x.moveTo(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46); x.lineTo(64 + Math.cos(a) * 60, 64 + Math.sin(a) * 60); x.stroke(); } }
        const ret = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: own(new THREE.CanvasTexture(retC)), color: K.cyan, opacity: 0.75, depthTest: false, depthWrite: false, transparent: true, toneMapped: false })));
        ret.renderOrder = 5; ret.scale.setScalar(2.4); scene.add(ret);

        const rockMat = own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.05, flatShading: true, vertexColors: true }));
        const rockMeshes = [0, 1, 2].map(k => {
          const im = new THREE.InstancedMesh(own(rockGeo(THREE, k)), rockMat, RN);
          for (let i = 0; i < RN; i++) im.setColorAt(i, WHITE);
          im.frustumCulled = false; im.count = 0; scene.add(im);
          return im;
        });
        const ROCK_COLS = ['#8c7d72', '#9d8d80', '#77707f', '#a5948a', '#806f66', '#b39b80', '#6d6878'].map(col);
        const rocks = Array.from({ length: RN }, () => ({ on: false, v: 0, tier: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 1, hp: 1, age: 0, flash: 0, w: 0, q: new THREE.Quaternion(), ax: new THREE.Vector3(), col: new THREE.Color() }));
        const rcnt = [0, 0, 0];

        const inst = (geo, mat, n) => { const m = new THREE.InstancedMesh(own(geo), own(mat), n); m.frustumCulled = false; m.count = 0; scene.add(m); return m; };
        const boltCore = inst(new THREE.BoxGeometry(0.08, 0.08, 2.6), new THREE.MeshBasicMaterial({ color: col('#e6fdff'), toneMapped: false }), BN);
        const boltGlow = inst(new THREE.BoxGeometry(0.34, 0.34, 3.4), new THREE.MeshBasicMaterial({ color: col('#2fd4ff'), opacity: 0.5, ...ADD }), BN);
        const bolts = Array.from({ length: BN }, () => ({ on: false, x: 0, y: 0, z: 0, life: 0 }));
        const ebCore = inst(new THREE.IcosahedronGeometry(0.26, 1), new THREE.MeshBasicMaterial({ color: col('#fff0e0'), toneMapped: false }), EN);
        const ebGlow = inst(new THREE.IcosahedronGeometry(0.62, 1), new THREE.MeshBasicMaterial({ color: K.red, opacity: 0.55, ...ADD }), EN);
        const ebs = Array.from({ length: EN }, () => ({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 }));

        const pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pBase = new Float32Array(PN * 3), pLife = new Float32Array(PN), pMax = new Float32Array(PN).fill(1);
        const pGeo = own(new THREE.BufferGeometry());
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
        const pMat = own(new THREE.PointsMaterial({ size: 0.75, map: glowT, vertexColors: true, ...ADD }));
        pMat.fog = false;
        const partsP = new THREE.Points(pGeo, pMat);
        partsP.frustumCulled = false; scene.add(partsP);
        let pNext = 0;
        const flashes = Array.from({ length: 12 }, () => {
          const mat = own(new THREE.SpriteMaterial({ map: glowT, color: 0xffffff, ...ADD }));
          const s = new THREE.Sprite(mat); s.visible = false; scene.add(s);
          return { s, t: 1, size: 1 };
        });
        let fNext = 0;

        const dGeo = {
          body: own(new THREE.OctahedronGeometry(0.9, 0).scale(1.3, 0.75, 1.3)),
          ring: own(mergeParts(THREE, [[new THREE.TorusGeometry(1.25, 0.11, 6, 22)]].concat(Array.from({ length: 8 }, (_, i) => [new THREE.BoxGeometry(0.2, 0.2, 0.26), [Math.cos(i / 8 * TAU) * 1.25, Math.sin(i / 8 * TAU) * 1.25, 0], [0, 0, i / 8 * TAU], [1, 1, 1]])))),
          eye: own(new THREE.SphereGeometry(0.34, 12, 8)),
          fin: own(new THREE.BoxGeometry(0.9, 0.12, 0.5)),
          armor: own(mergeParts(THREE, [
            [new THREE.ConeGeometry(0.17, 0.7, 5), [0, 0.95, 0.1], [0, 0, 0], [1, 1, 1]],
            [new THREE.ConeGeometry(0.17, 0.7, 5), [0, -0.95, 0.1], [Math.PI, 0, 0], [1, 1, 1]],
            [new THREE.CylinderGeometry(0.025, 0.025, 0.9, 5), [0.45, 1.15, -0.2], [0, 0, -0.25], [1, 1, 1]],
            [new THREE.SphereGeometry(0.07, 6, 5), [0.55, 1.6, -0.2], [0, 0, 0], [1, 1, 1]],
            [new THREE.BoxGeometry(0.7, 0.2, 0.2), [0, 0.1, 0.95], [0.4, 0, 0], [1, 1, 1]],
            [new THREE.BoxGeometry(0.55, 0.14, 0.7), [0, -0.05, -0.85], [0, 0, 0], [1, 1, 1]]
          ].concat([-1, 1].map(sx => [new THREE.ConeGeometry(0.22, 0.9, 5), [sx * 1.9, 0, 0.1], [Math.PI / 2, 0, 0], [1, 1, 1]]))))
        };
        const dMat = {
          body: own(new THREE.MeshStandardMaterial({ color: col('#3a3654'), roughness: 0.35, metalness: 0.6, flatShading: true })),
          armor: own(new THREE.MeshStandardMaterial({ color: col('#4d4872'), roughness: 0.4, metalness: 0.5, flatShading: true })),
          ring: own(new THREE.MeshBasicMaterial({ color: col('#ff3b6b'), toneMapped: false })),
          eye: own(new THREE.MeshBasicMaterial({ color: col('#fff1c4'), toneMapped: false })),
          glow: own(new THREE.SpriteMaterial({ map: glowT, color: col('#ff3b6b'), opacity: 0.8, ...ADD }))
        };
        const drones = Array.from({ length: 6 }, () => {
          const g = new THREE.Group();
          g.add(new THREE.Mesh(dGeo.body, dMat.body));
          const ring = new THREE.Mesh(dGeo.ring, dMat.ring); g.add(ring);
          const eye = new THREE.Mesh(dGeo.eye, dMat.eye); eye.position.z = 0.72; g.add(eye);
          g.add(new THREE.Mesh(dGeo.armor, dMat.armor));
          for (const sx of [-1, 1]) { const f = new THREE.Mesh(dGeo.fin, dMat.body); f.position.x = sx * 1.45; g.add(f); }
          const gl = new THREE.Sprite(dMat.glow); gl.scale.setScalar(3.4); gl.position.z = -0.4; g.add(gl);
          g.visible = false; scene.add(g);
          return { g, ring, on: false, x: 0, y: 0, z: 0, bx: 0, by: 0, hp: 0, t: 0, mode: 0, hold: -40, stay: 10, fire: 0, ph: 0, hit: 0 };
        });

        const pk = new THREE.Group();
        pk.add(new THREE.Mesh(own(new THREE.IcosahedronGeometry(0.62, 1)), own(new THREE.MeshBasicMaterial({ color: col('#9dffc8'), toneMapped: false }))));
        pk.add(new THREE.Mesh(own(new THREE.IcosahedronGeometry(1.3, 0)), own(new THREE.MeshBasicMaterial({ color: K.green, wireframe: true, opacity: 0.9, ...ADD }))));
        { const s = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: glowT, color: K.green, opacity: 0.85, ...ADD }))); s.scale.setScalar(5); pk.add(s); }
        pk.visible = false; scene.add(pk);
        const pkS = { on: false, x: 0, y: 0, z: 0 };

        let state = 'attract', T = 0, timeScale = 1, speed = 24, dist = 0, wave = 1, kills = 0, score = 0, shownScore = -1;
        let shield = 100, boost = 100, invuln = 0, hurtT = 0, hurtShown = -1, shake = 0, fireCd = 0, gun = 1, firing = false, boostHeld = false, boosting = false;
        let thr = 1, kbHold = 0, mAcc = 0, keyLbl = { w: 'W', a: 'A', s: 'S', d: 'D' };
        let tx = 0, ty = 0, sx = 0, sy = 0, svx = 0, svy = 0, droneT = 0, pkT = 20, dieT = 0, hudT = 0, bubbleA = 0, pops = 0;

        const target = () => Math.min(RN - 30, 150 + wave * 16);
        const corridor = () => Math.min(0.8, 0.52 + wave * 0.04);
        const freeRock = () => { for (const r of rocks) if (!r.on) return r; return null; };
        function spawnRock(r, tier, x, y, z) {
          r.on = true; r.tier = tier; r.v = Math.random() * 3 | 0;
          r.r = tier === 3 ? rand(2.4, 3.6) : tier === 2 ? rand(1.35, 1.8) : rand(0.75, 1.0);
          r.hp = tier === 3 ? 4 : tier === 2 ? 2 : 1;
          r.x = x; r.y = y; r.z = z; r.vx = rand(-1.2, 1.2); r.vy = rand(-0.8, 0.8); r.vz = rand(0, 5);
          r.ax.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
          r.q.setFromAxisAngle(r.ax, rand(0, TAU));
          r.ax.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
          r.w = rand(0.3, 1.8) / Math.sqrt(r.r);
          r.col.copy(ROCK_COLS[Math.random() * ROCK_COLS.length | 0]);
          r.flash = 0; r.age = 0;
          return r;
        }
        function spawnField(z) {
          const r = freeRock();
          if (!r) return;
          if (Math.random() < corridor()) {
            const t = Math.random();
            spawnRock(r, t < 0.35 ? 3 : t < 0.7 ? 2 : 1, rand(-BX - 3, BX + 3), rand(-BY - 2.5, BY + 2.5), z);
          } else {
            const a = rand(0, TAU), d = rand(27, 60);
            spawnRock(r, 3, Math.cos(a) * d * 1.4, Math.sin(a) * d * 0.85, z);
            r.r = rand(3, 7.5); r.hp = 6;
          }
        }
        function burst(x, y, z, n, c1, c2, spd, life) {
          for (let k = 0; k < n; k++) {
            const i = pNext, j = i * 3;
            pNext = (pNext + 1) % PN;
            const dx = Math.random() * 2 - 1, dy = Math.random() * 2 - 1, dz = Math.random() * 2 - 1;
            const s = spd * (0.25 + Math.random() * 0.75) / (Math.sqrt(dx * dx + dy * dy + dz * dz) || 1), t = Math.random();
            pPos[j] = x; pPos[j + 1] = y; pPos[j + 2] = z;
            pVel[j] = dx * s; pVel[j + 1] = dy * s; pVel[j + 2] = dz * s;
            pBase[j] = c1.r + (c2.r - c1.r) * t; pBase[j + 1] = c1.g + (c2.g - c1.g) * t; pBase[j + 2] = c1.b + (c2.b - c1.b) * t;
            pLife[i] = pMax[i] = life * (0.45 + Math.random() * 0.55);
          }
        }
        function flash(x, y, z, size, c) {
          const f = flashes[fNext];
          fNext = (fNext + 1) % flashes.length;
          f.s.position.set(x, y, z); f.s.material.color.copy(c); f.t = 0; f.size = size; f.s.visible = true;
        }
        function popup(x, y, z, text) {
          if (pops > 7) return;
          tv.set(x, y, z).project(camera);
          if (tv.z > 1) return;
          const d = el('div', 'pop', text);
          d.style.left = ((tv.x + 1) * 50).toFixed(1) + '%'; d.style.top = ((1 - tv.y) * 50).toFixed(1) + '%';
          stage.append(d); pops++;
          api.timeout(() => { d.remove(); pops--; }, 850);
        }
        function showBanner(t, sub) {
          banner.innerHTML = `<b>${t}</b>${sub ? `<span>${sub}</span>` : ''}`;
          banner.classList.remove('go'); void banner.offsetWidth; banner.classList.add('go');
        }
        function killRock(r, scored) {
          const { x, y, z, tier, vz } = r, rad = r.r;
          r.on = false;
          const n = Math.round(10 + rad * 8);
          burst(x, y, z, n, K.dust1, K.dust2, 5 + rad * 2.5, 1.1);
          burst(x, y, z, Math.round(n * 0.7), K.fire1, K.fire2, 8 + rad * 2, 0.6);
          flash(x, y, z, rad * 3.4, K.boom);
          if (z > -60) shake = Math.max(shake, 0.25 + rad * 0.08);
          if (!scored) return;
          const pts = tier === 3 ? 20 : tier === 2 ? 50 : 100;
          kills += pts; popup(x, y, z, '+' + pts); api.sfx('pop');
          if (tier < 2) return;
          const k = tier === 3 ? 3 : 2;
          for (let j = 0; j < k; j++) {
            const c = freeRock();
            if (!c) break;
            const a = j / k * TAU + rand(-0.4, 0.4);
            spawnRock(c, tier - 1, x + Math.cos(a) * rad * 0.5, y + Math.sin(a) * rad * 0.5, z - rand(0, 1));
            c.vx = Math.cos(a) * rand(3, 6); c.vy = Math.sin(a) * rand(2.5, 5); c.vz = vz + rand(-3, 2); c.age = 0.3;
          }
        }
        function hitRock(r, x, y, z) {
          r.hp--; r.flash = 1;
          burst(x, y, z, 7, K.spark1, K.spark2, 10, 0.35);
          if (r.hp <= 0) killRock(r, true); else api.sfx('hit');
        }
        function killDrone(d, scored) {
          d.on = false; d.g.visible = false;
          burst(d.x, d.y, d.z, 60, K.fire1, K.red, 14, 0.9);
          burst(d.x, d.y, d.z, 30, K.spark1, K.purple, 18, 0.5);
          flash(d.x, d.y, d.z, 7, K.red);
          shake = Math.max(shake, 0.45);
          if (scored) { kills += 250; popup(d.x, d.y, d.z, '+250'); api.sfx('pop'); }
        }
        function damage(v) {
          shield -= v; invuln = 0.75; hurtT = 1; bubbleA = 0.9;
          shake = Math.max(shake, 0.7);
          if (shield <= 0) die(); else api.sfx('bad');
        }
        function die() {
          shield = 0; state = 'dying'; dieT = 0; firing = false;
          ship.visible = false; ret.visible = false;
          burst(sx, sy, 0, 170, K.fire1, K.fire2, 20, 1.4);
          burst(sx, sy, 0, 90, K.spark1, K.purple, 28, 0.9);
          flash(sx, sy, 0, 10, K.boom); flash(sx, sy, -1, 16, K.fire2);
          shake = 1.5; api.sfx('lose');
        }
        function gameOver() {
          state = 'over'; timeScale = 1; hud.hidden = true;
          const isNew = api.submit(score);
          api.overlay({
            kicker: isNew ? 'New best!' : 'Game over', title: 'Ship destroyed',
            text: wave >= 2 ? 'The field got the better of you. Fly again?' : 'Shoot the rocks in your path and dodge the rest.',
            stats: [['Score', score], ['Wave', wave], ['Distance', (dist / 1000).toFixed(2) + ' km']],
            button: 'Play again', onAction: startGame
          });
        }
        function shoot() {
          fireCd = 0.12; gun = -gun;
          let b = null;
          for (const o of bolts) if (!o.on) { b = o; break; }
          if (!b) return;
          const bank = model.rotation.z;
          b.on = true; b.life = 1.25; b.z = -1.6;
          b.x = sx + gun * 0.62 * Math.cos(bank); b.y = sy - 0.06 + gun * 0.62 * Math.sin(bank);
          flash(b.x, b.y, -1.2, 1.3, K.cyan);
          api.sfx('tap');
        }
        function enemyShoot(d) {
          let b = null;
          for (const o of ebs) if (!o.on) { b = o; break; }
          if (!b) return;
          const ax = sx + svx * 0.35 - d.x, ay = sy + svy * 0.35 - d.y, az = -d.z - 0.9, l = Math.sqrt(ax * ax + ay * ay + az * az) || 1, sp = 34 + wave * 2.5;
          b.on = true; b.life = 4; b.x = d.x; b.y = d.y; b.z = d.z + 0.9;
          b.vx = ax / l * sp; b.vy = ay / l * sp; b.vz = az / l * sp;
          flash(b.x, b.y, b.z, 2, K.red);
        }
        function spawnDrone() {
          let d = null;
          for (const o of drones) if (!o.on) { d = o; break; }
          if (!d) return;
          d.on = true; d.g.visible = true;
          d.x = rand(-BX, BX); d.y = rand(-BY, BY) * 0.7; d.z = -240; d.bx = d.x * 0.7; d.by = d.y;
          d.hp = wave >= 5 ? 4 : 3; d.t = 0; d.mode = 0; d.hold = rand(-52, -36); d.stay = rand(9, 13); d.fire = rand(0.8, 1.6); d.ph = rand(0, TAU); d.hit = 0;
        }
        function hitTest(b, z1) {
          for (const r of rocks) {
            if (!r.on || r.z + r.r < b.z || r.z - r.r > z1) continue;
            const cz = r.z < b.z ? b.z : r.z > z1 ? z1 : r.z, dx = r.x - b.x, dy = r.y - b.y, dz = r.z - cz, rr = r.r * 0.95 + 0.3;
            if (dx * dx + dy * dy + dz * dz < rr * rr) { hitRock(r, b.x, b.y, r.z + r.r * 0.6); return true; }
          }
          for (const d of drones) {
            if (!d.on || d.z + 1.6 < b.z || d.z - 1.6 > z1) continue;
            const dx = d.x - b.x, dy = d.y - b.y;
            if (dx * dx + dy * dy < 4) {
              d.hp--; d.hit = 1; burst(b.x, b.y, d.z + 1, 10, K.spark1, K.red, 12, 0.4);
              if (d.hp <= 0) killDrone(d, true); else api.sfx('hit');
              return true;
            }
          }
          return false;
        }
        function reset() {
          for (const r of rocks) r.on = false;
          for (const b of bolts) b.on = false;
          for (const b of ebs) b.on = false;
          for (const d of drones) { d.on = false; d.g.visible = false; }
          pkS.on = false; pk.visible = false;
          pLife.fill(0);
          const n = target();
          for (let k = 0; k < n; k++) spawnField(rand(-FAR, -45));
          for (const r of rocks) if (r.on) r.age = 9;
        }
        function updateHud() {
          score = kills + Math.floor(dist / 5);
          if (score !== shownScore) { shownScore = score; api.score(score); }
          dsEl.textContent = (dist / 1000).toFixed(2) + ' km';
          shB.style.transform = `scaleX(${(shield / 100).toFixed(3)})`;
          boB.style.transform = `scaleX(${(boost / 100).toFixed(3)})`;
          thB.style.transform = `scaleX(${((thr - .55) / (1.6 - .55)).toFixed(3)})`;
          shBar.classList.toggle('low', shield < 30);
        }
        function startGame() {
          wave = 1; reset();
          state = 'play'; dist = 0; kills = 0; score = 0; shownScore = -1; shield = 100; boost = 100; invuln = 1.4; timeScale = 1;
          sx = sy = tx = ty = svx = svy = 0; speed = 30; thr = 1; kbHold = 0; droneT = 5; pkT = 18; firing = false;
          ship.visible = true; ret.visible = true; hud.hidden = false; wvEl.textContent = '1';
          updateHud(); showBanner('Wave 1', 'Clear a path');
        }
        function newWave() {
          wvEl.textContent = wave;
          shield = Math.min(100, shield + 15);
          showBanner('Wave ' + wave, wave === 2 ? 'Drones incoming' : wave % 3 === 0 ? 'Dense field ahead' : 'Speed rising');
          api.sfx('good');
        }

        const steerFrom = e => { const p = toLocal(e); tx = clamp(p.nx * 1.15, -1, 1); ty = clamp(p.ny * 1.25 + 0.1, -1, 1); };
        api.on(canvas, 'pointermove', e => {
          if (state !== 'play' || !(e.pointerType === 'mouse' || e.buttons)) return;
          if (e.pointerType === 'mouse' && kbHold > 0) { mAcc += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0); if (mAcc < 40) return; kbHold = 0; }
          mAcc = 0; steerFrom(e);
        });
        let fireId = null;
        api.on(canvas, 'pointerdown', e => {
          if (e.pointerType === 'touch') stage.classList.add('touch');
          if (state !== 'play' || e.button > 0) return;
          try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
          if (e.pointerType !== 'mouse') steerFrom(e);
          firing = true; fireId = e.pointerId;
          if (fireCd <= 0) shoot();
        });
        const stopFire = e => { if (!e || e.type === 'blur' || e.pointerId === fireId) firing = false; };
        api.on(window, 'pointerup', stopFire);
        api.on(canvas, 'pointercancel', stopFire);
        api.on(window, 'blur', stopFire);
        api.on(window, 'keydown', e => { if (e.code === 'Space' && !e.repeat && state === 'play' && fireCd <= 0) shoot(); });
        const boostOn = e => { e.preventDefault(); boostHeld = true; boostBtn.classList.add('on'); };
        const boostOff = () => { boostHeld = false; boostBtn.classList.remove('on'); };
        api.on(boostBtn, 'pointerdown', boostOn);
        for (const t of ['pointerup', 'pointercancel', 'pointerleave']) api.on(boostBtn, t, boostOff);

        reset();
        const intro = () => api.overlay({
          kicker: '3D', title: 'Asteroid Field',
          text: `Steer with the mouse, touch, the arrow keys or <kbd>${keyLbl.a}</kbd> <kbd>${keyLbl.d}</kbd>. <kbd>${keyLbl.w}</kbd> / <kbd>${keyLbl.s}</kbd> speed up and slow down. Click or hold <kbd>Space</kbd> to fire, hold <kbd>Shift</kbd> to boost. Faster flying scores more distance. Big rocks split apart and drones join the hunt from wave 2.`,
          button: 'Play', onAction: startGame
        });
        intro();
        const fr = /^(fr|be)/i.test(navigator.language || '');
        if (fr) { keyLbl = { w: 'Z', a: 'Q', s: 'S', d: 'D' }; intro(); }
        if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => {
          const g = c => (m.get(c) || '').toUpperCase();
          if (g('KeyW') && g('KeyA')) { keyLbl = { w: g('KeyW'), a: g('KeyA'), s: g('KeyS'), d: g('KeyD') }; if (state === 'attract' && api.alive) intro(); }
        }).catch(() => {});

        api.loop(rdt => {
          if (state === 'dying') { dieT += rdt; timeScale = 0.3 + Math.min(1, dieT / 1.6) * 0.7; if (dieT > 1.6) gameOver(); }
          const dt = rdt * timeScale, play = state === 'play';
          T += dt;

          if (play) {
            const kx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
            const ky = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0);
            if (kx || ky) { tx = clamp(tx + kx * 1.5 * rdt, -1, 1); ty = clamp(ty + ky * 1.6 * rdt, -1, 1); kbHold = 1; mAcc = 0; }
            const kt = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
            if (kt) thr = clamp(thr + kt * .7 * rdt, .55, 1.6);
          } else if (state === 'attract') { tx = Math.sin(T * 0.5) * 0.55; ty = Math.sin(T * 0.37 + 1) * 0.35; }
          const ox = sx, oy = sy;
          sx += (tx * BX - sx) * damp(7, dt); sy += (ty * BY - sy) * damp(7, dt);
          if (dt > 0) { svx += ((sx - ox) / dt - svx) * damp(10, dt); svy += ((sy - oy) / dt - svy) * damp(10, dt); }

          boosting = play && boost > 0 && (boostHeld || keys.has('ShiftLeft') || keys.has('ShiftRight'));
          boost = boosting ? Math.max(0, boost - 34 * dt) : Math.min(100, boost + 12 * dt);
          const base = play ? Math.min(88, 30 + dist * 0.011) : 24;
          speed += (base * (play ? thr : 1) * (boosting ? 1.75 : 1) - speed) * damp(3, dt);
          if (play) {
            dist += speed * dt;
            const nw = 1 + Math.floor(dist / 1000);
            if (nw > wave) { wave = nw; newWave(); }
            if (invuln > 0) invuln -= dt;
            if (shield < 100) shield = Math.min(100, shield + 1.2 * dt);
          }

          let active = 0, lock = false;
          for (const r of rocks) {
            if (!r.on) continue;
            r.x += r.vx * dt; r.y += r.vy * dt; r.z += (speed + r.vz) * dt; r.age += dt;
            if (r.flash > 0) r.flash = Math.max(0, r.flash - dt * 5);
            qT.setFromAxisAngle(r.ax, r.w * dt); r.q.multiply(qT);
            if (r.z > 18) { r.on = false; continue; }
            active++;
            if (state !== 'play') continue;
            const dx = r.x - sx, dy = r.y - sy, dxy = dx * dx + dy * dy;
            if (r.z > -110 && r.z < 0 && dxy < (r.r + 0.35) * (r.r + 0.35)) lock = true;
            if (invuln <= 0 && Math.abs(r.z) < r.r + 1.6) {
              const rr = r.r * 0.8 + 0.75;
              if (dxy + r.z * r.z < rr * rr) { killRock(r, false); damage(14 + r.r * 7); }
            }
          }
          for (let k = 0, need = target() - active; k < 3 && need > 0; k++, need--) spawnField(rand(-FAR - 50, -FAR));

          if (fireCd > 0) fireCd -= dt;
          if (state === 'play' && (firing || keys.has('Space')) && fireCd <= 0) shoot();
          let bc = 0;
          for (const b of bolts) {
            if (!b.on) continue;
            b.z -= BOLT_V * dt; b.life -= dt;
            if (b.life <= 0 || hitTest(b, b.z + (BOLT_V + speed + 5) * dt)) { b.on = false; continue; }
            m4.makeTranslation(b.x, b.y, b.z);
            boltCore.setMatrixAt(bc, m4); boltGlow.setMatrixAt(bc, m4); bc++;
          }
          boltCore.count = boltGlow.count = bc;
          boltCore.instanceMatrix.needsUpdate = boltGlow.instanceMatrix.needsUpdate = true;

          let dl = 0;
          for (const d of drones) {
            if (!d.on) continue;
            dl++; d.t += dt; d.hit = Math.max(0, d.hit - dt * 4);
            if (d.mode === 0) { d.z += (speed * 0.5 + 40) * dt; if (d.z >= d.hold) { d.mode = 1; d.t = 0; } }
            else if (d.mode === 1) {
              d.z += (d.hold - d.z) * damp(3, dt);
              if (d.t > d.stay || state !== 'play') d.mode = 2;
              d.fire -= dt;
              if (d.fire <= 0 && state === 'play') { d.fire = rand(1.3, 2.3) * Math.max(0.5, 1.1 - wave * 0.06); enemyShoot(d); }
            } else {
              d.z += (speed + 25) * dt; d.by += 7 * dt;
              if (d.z > 20) { d.on = false; d.g.visible = false; continue; }
            }
            const gx = d.bx + Math.sin(d.t * 1.1 + d.ph) * 4.2, gy = d.by + Math.sin(d.t * 0.8 + d.ph * 1.7) * 2;
            d.x += (gx - d.x) * damp(3, dt); d.y += (gy - d.y) * damp(3, dt);
            d.g.position.set(d.x, d.y, d.z);
            d.ring.rotation.z += dt * 4;
            d.g.rotation.y = Math.sin(d.t * 1.3) * 0.35; d.g.rotation.z = (d.x - gx) * 0.15;
            d.g.scale.setScalar(1.35 + d.hit * 0.45);
            if (state === 'play' && invuln <= 0 && Math.abs(d.z) < 2) {
              const dx = d.x - sx, dy = d.y - sy;
              if (dx * dx + dy * dy < 4.8) { killDrone(d, false); damage(22); }
            }
          }
          if (state === 'play' && wave >= 2) {
            droneT -= dt;
            if (droneT <= 0 && dl < Math.min(4, wave - 1)) { spawnDrone(); droneT = Math.max(2.5, rand(5, 8) - wave * 0.4); }
          }

          let ec = 0;
          for (const b of ebs) {
            if (!b.on) continue;
            b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.life -= dt;
            if (b.life <= 0 || b.z > 14) { b.on = false; continue; }
            if (state === 'play' && invuln <= 0) {
              const dx = b.x - sx, dy = b.y - sy;
              if (dx * dx + dy * dy + b.z * b.z < 1.1) { b.on = false; burst(b.x, b.y, b.z, 18, K.spark1, K.red, 9, 0.5); damage(12); continue; }
            }
            m4.makeTranslation(b.x, b.y, b.z);
            ebCore.setMatrixAt(ec, m4); ebGlow.setMatrixAt(ec, m4); ec++;
          }
          ebCore.count = ebGlow.count = ec;
          ebCore.instanceMatrix.needsUpdate = ebGlow.instanceMatrix.needsUpdate = true;

          if (state === 'play') {
            pkT -= dt;
            if (pkT <= 0 && !pkS.on) { pkT = rand(18, 26); pkS.on = true; pkS.x = rand(-BX, BX) * 0.8; pkS.y = rand(-BY, BY) * 0.8; pkS.z = -FAR * 0.7; pk.visible = true; }
          }
          if (pkS.on) {
            pkS.z += speed * dt;
            pk.position.set(pkS.x, pkS.y, pkS.z); pk.rotation.x += dt; pk.rotation.y += dt * 1.4;
            const dx = pkS.x - sx, dy = pkS.y - sy;
            if (state === 'play' && dx * dx + dy * dy + pkS.z * pkS.z < 6.5) {
              pkS.on = false; pk.visible = false;
              shield = Math.min(100, shield + 35); boost = 100; bubbleA = 0.7;
              burst(pkS.x, pkS.y, pkS.z, 50, K.green, K.spark1, 10, 0.7);
              popup(pkS.x, pkS.y + 1, pkS.z, 'Shield +35'); api.sfx('good');
            } else if (pkS.z > 16) { pkS.on = false; pk.visible = false; }
          }

          rcnt[0] = rcnt[1] = rcnt[2] = 0;
          for (const r of rocks) {
            if (!r.on) continue;
            const im = rockMeshes[r.v], i = rcnt[r.v]++, s = r.r * Math.min(1, r.age / 0.6);
            vP.set(r.x, r.y, r.z); vS.set(s, s, s);
            im.setMatrixAt(i, m4.compose(vP, r.q, vS));
            cT.copy(r.col);
            if (r.flash > 0) cT.lerp(WHITE, r.flash * 0.85);
            im.setColorAt(i, cT);
          }
          for (let k = 0; k < 3; k++) {
            const im = rockMeshes[k];
            im.count = rcnt[k]; im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
          }

          const drg = Math.exp(-1.8 * dt), flow = speed * 0.9 * dt;
          for (let i = 0; i < PN; i++) {
            const j = i * 3;
            if (pLife[i] <= 0) { if (pCol[j] || pCol[j + 1] || pCol[j + 2]) pCol[j] = pCol[j + 1] = pCol[j + 2] = 0; continue; }
            pLife[i] -= dt;
            const k = Math.max(0, pLife[i] / pMax[i]), f = k * k * 1.6;
            pVel[j] *= drg; pVel[j + 1] *= drg; pVel[j + 2] *= drg;
            pPos[j] += pVel[j] * dt; pPos[j + 1] += pVel[j + 1] * dt; pPos[j + 2] += pVel[j + 2] * dt + flow;
            pCol[j] = pBase[j] * f; pCol[j + 1] = pBase[j + 1] * f; pCol[j + 2] = pBase[j + 2] * f;
          }
          pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
          for (const f of flashes) {
            if (!f.s.visible) continue;
            f.t += dt / 0.35;
            if (f.t >= 1) { f.s.visible = false; continue; }
            f.s.scale.setScalar(f.size * (0.6 + f.t * 1.6)); f.s.material.opacity = 1 - f.t; f.s.position.z += flow;
          }

          const len = 0.4 + speed * (boosting ? 0.07 : 0.035);
          for (let i = 0; i < DN; i++) {
            const j = i * 3, o = i * 6;
            dS[j + 2] += speed * dt;
            if (dS[j + 2] > 12) { dS[j] = rand(-34, 34); dS[j + 1] = rand(-20, 20); dS[j + 2] -= 172; }
            dP[o] = dP[o + 3] = dS[j]; dP[o + 1] = dP[o + 4] = dS[j + 1]; dP[o + 2] = dS[j + 2]; dP[o + 5] = dS[j + 2] - len;
          }
          dustGeo.attributes.position.needsUpdate = true;

          ship.position.set(sx, sy, 0);
          model.rotation.z += (clamp(-svx * 0.075, -0.9, 0.9) - model.rotation.z) * damp(10, dt);
          model.rotation.x = clamp(svy * 0.04, -0.4, 0.4);
          model.rotation.y = clamp(-svx * 0.02, -0.3, 0.3);
          model.visible = !play || invuln <= 0 || (T * 14 | 0) % 2 === 0;
          const fl = (boosting ? 1.9 : 1.1) + Math.sin(T * 60) * 0.08 + Math.random() * 0.08;
          for (const f of flames) f.scale.setScalar(fl);
          for (const c of cones) c.scale.set(1, 1, (boosting ? 2.4 : 1) * (0.85 + Math.random() * 0.3));
          flameMat.color.copy(boosting ? K.boostFlame : K.flame); coneMat.color.copy(flameMat.color);
          bubbleA = Math.max(0, bubbleA - rdt * 1.8);
          shieldMat.opacity = bubbleA * 0.8; bubble.visible = bubbleA > 0; bubble.rotation.y += rdt;
          if (play) {
            ret.position.set(sx, sy - 0.06, -34);
            ret.material.color.copy(lock ? K.lock : K.cyan);
            ret.scale.setScalar(ret.scale.x + ((lock ? 1.9 : 2.4) - ret.scale.x) * damp(14, rdt));
          }

          camera.fov += ((boosting ? 72 : 60) - camera.fov) * damp(4, rdt);
          camera.updateProjectionMatrix();
          shake = Math.max(0, shake - rdt * 2.2);
          const sk = shake * shake * 0.7;
          camera.position.set(sx * 0.86 + rand(-sk, sk), sy * 0.82 + 2.7 + rand(-sk, sk), 9.5);
          camera.lookAt(sx * 0.93, sy * 0.9 + 0.5, -16);
          camera.rotateZ(model.rotation.z * 0.25);
          stars.position.copy(camera.position);

          hurtT = Math.max(0, hurtT - rdt * 2.2);
          const hs = Math.round(hurtT * 20) / 20;
          if (hs !== hurtShown) { hurtShown = hs; hurt.style.opacity = hs; }
          if (play && (hudT += rdt) > 0.1) { hudT = 0; updateHud(); }

          renderer.render(scene, camera);
        });
      }
    }
  });
})();

