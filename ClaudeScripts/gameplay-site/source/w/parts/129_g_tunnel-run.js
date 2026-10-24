(() => {
  'use strict';
  const TAU = Math.PI * 2, N = 8, SIDE = TAU / N, R = 3, RC = R / Math.cos(Math.PI / 8);
  const PR = 2.05, PM = 0.2, ROT = 3.7, DEPTH = 1.3, SPAWN = 130, RING = 12, NR = 12;
  const COLS = ['#ff2a2a', '#ffd400', '#ff2bd6', '#2bff6e', '#22e4ff', '#ff7a1a', '#8a5cff'];
  const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const angN = a => a - TAU * Math.floor((a + Math.PI) / TAU);
  const sideAng = i => -Math.PI / 2 + i * SIDE;
  const ID = 'tunnel-run';

  const CSS = `.gm-${ID} .stage{position:relative;max-width:100%;margin:0 auto;border-radius:var(--r,14px);overflow:hidden;background:#000;touch-action:none;user-select:none;-webkit-user-select:none;container-type:inline-size}
.gm-${ID} .stage canvas{width:100%!important;height:100%!important;aspect-ratio:auto!important;display:block;border-radius:0}
.gm-${ID} .hud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:2.4cqw 3cqw;pointer-events:none;font:700 clamp(12px,2.6cqw,20px)/1 var(--sans,system-ui);color:#fff;font-variant-numeric:tabular-nums}
.fs .gm-${ID} .hud{padding-right:max(3cqw,56px)}
.gm-${ID} .pill{min-width:7.5em;padding:.5em .9em;background:rgba(150,150,160,.28);border:1px solid rgba(255,255,255,.22);border-radius:.3em;text-align:center;letter-spacing:.02em;backdrop-filter:blur(2px)}
.gm-${ID} .pz{pointer-events:auto;width:2.4em;height:2.4em;border-radius:.4em;border:2px solid rgba(255,255,255,.75);background:rgba(120,120,130,.35);display:grid;place-items:center;cursor:pointer;padding:0}
.gm-${ID} .pz i{display:block;width:.9em;height:1em;border-left:.3em solid #fff;border-right:.3em solid #fff;box-sizing:border-box}
.gm-${ID} .panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.2cqw;text-align:center;color:#fff;font-family:var(--sans,system-ui);background:radial-gradient(circle at 50% 45%,rgba(0,0,0,.3),rgba(0,0,0,.78));padding:5cqw}
.gm-${ID} .logo{font:900 clamp(38px,11cqw,96px)/.9 var(--sans,system-ui);letter-spacing:.04em;font-style:italic;text-shadow:0 0 .25em var(--neon,#ff2a2a),0 .06em 0 rgba(0,0,0,.6)}
.gm-${ID} .logo span{display:block;color:var(--neon,#ff2a2a);text-shadow:0 0 .3em var(--neon,#ff2a2a)}
.gm-${ID} .sub{font:800 clamp(12px,2.6cqw,20px)/1.3 var(--sans,system-ui);opacity:.9;letter-spacing:.06em}
.gm-${ID} .big{font:900 clamp(30px,8cqw,64px)/1 var(--sans,system-ui);letter-spacing:.04em}
.gm-${ID} .stat{font:800 clamp(14px,3cqw,24px)/1.4 var(--sans,system-ui);font-variant-numeric:tabular-nums}
.gm-${ID} .stat b{color:#fff;text-shadow:0 0 .5em var(--neon,#ff2a2a)}
.gm-${ID} .go{pointer-events:auto;margin-top:1.5cqw;min-width:8em;height:2.6em;padding:0 1.6em;border:2px solid #fff;border-radius:.4em;background:rgba(255,255,255,.12);color:#fff;font:900 clamp(14px,3cqw,22px)/1 var(--sans,system-ui);letter-spacing:.08em;cursor:pointer}
.gm-${ID} .go:hover{background:rgba(255,255,255,.25)}
.gm-${ID} .blink{animation:trb 1s ease-in-out infinite}
@keyframes trb{50%{opacity:.35}}
.gm-${ID} .lvb{position:absolute;left:0;right:0;top:24%;text-align:center;font:900 clamp(26px,7cqw,60px)/1 var(--sans,system-ui);letter-spacing:.14em;font-style:italic;color:#fff;text-shadow:0 0 .35em var(--neon,#ff2a2a),0 .05em 0 rgba(0,0,0,.6);opacity:0;pointer-events:none}
.gm-${ID} .lvb.on{animation:trl 1.8s ease-out}
@keyframes trl{0%{opacity:0;transform:scale(1.5)}15%{opacity:1;transform:scale(1)}70%{opacity:1}100%{opacity:0}}
.gm-${ID} .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.gm-${ID} .touch{position:absolute;bottom:3cqw;left:0;right:0;display:flex;justify-content:space-between;padding:0 4cqw;pointer-events:none}
.gm-${ID} .touch i{width:16cqw;height:16cqw;max-width:96px;max-height:96px;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);display:grid;place-items:center;font:900 7cqw/1 var(--sans,system-ui);color:rgba(255,255,255,.7);font-style:normal}
.gm-${ID} .touch i.on{background:rgba(255,255,255,.3)}
.gm-${ID} [hidden]{display:none!important}`;

  function makeAudio(api) {
    let ac = null, master = null, next = 0, step = 0, on = false;
    const A = window.AudioContext || window.webkitAudioContext;
    const init = () => {
      if (!A) return null;
      if (!ac) { try { ac = new A(); master = ac.createGain(); master.gain.value = 0.32; master.connect(ac.destination); } catch (e) { ac = null; return null; } }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const env = (t, a, d, v) => { const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); g.connect(master); return g; };
    const osc = (type, f, t, d, v, f2, a) => { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); o.connect(env(t, a || 0.005, d, v)); o.start(t); o.stop(t + d + 0.05); };
    const noise = (t, d, v, hp) => { const n = Math.floor(ac.sampleRate * d), b = ac.createBuffer(1, n, ac.sampleRate), c = b.getChannelData(0); for (let i = 0; i < n; i++) c[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; s.connect(f); f.connect(env(t, 0.002, d, v)); s.start(t); };
    const BASS = [45, 45, 57, 45, 48, 48, 60, 48, 43, 43, 55, 43, 50, 50, 52, 55];
    const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    return {
      init,
      start() { if (!init()) return; on = true; next = ac.currentTime + 0.05; step = 0; },
      stop() { on = false; },
      tick() {
        if (!ac || !on || api.muted) return;
        const S8 = 60 / 128 / 2;
        while (next < ac.currentTime + 0.15) {
          const t = next, i = step % 16;
          if (i % 2 === 0) osc('sine', 150, t, 0.16, 0.9, 45);
          else noise(t, 0.05, 0.18, 7000);
          osc('sawtooth', mf(BASS[(step >> 1) % 16] - 12), t, S8 * 0.9, 0.16);
          if (step % 4 === 2) osc('square', mf(BASS[(step >> 1) % 16] + 12), t, S8 * 0.6, 0.05);
          next += S8; step++;
        }
      },
      sfx(k) {
        if (!init() || api.muted) return;
        const t = ac.currentTime;
        if (k === 'crash') { noise(t, 0.6, 0.9, 200); osc('sawtooth', 220, t, 0.5, 0.4, 30); }
        else if (k === 'pass') noise(t, 0.12, 0.08, 3000);
        else if (k === 'stage') { osc('triangle', 660, t, 0.12, 0.25); osc('triangle', 990, t + 0.1, 0.18, 0.25); }
        else if (k === 'start') osc('triangle', 440, t, 0.2, 0.3, 880);
      },
      close() { if (ac) { try { ac.close(); } catch (e) {} ac = null; } }
    };
  }

  function circuitTex(THREE) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#121214'; g.fillRect(0, 0, 256, 512);
    let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.lineCap = 'square';
    for (let i = 0; i < 70; i++) {
      let x = Math.floor(r() * 16) * 16 + 8, y = Math.floor(r() * 32) * 16 + 8;
      g.strokeStyle = r() < 0.2 ? 'rgba(255,255,255,.34)' : 'rgba(200,200,210,.15)'; g.lineWidth = r() < 0.3 ? 2.4 : 1.3;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        const d = Math.floor(r() * 3), L = (1 + Math.floor(r() * 4)) * 16;
        if (d === 0) y += L; else if (d === 1) { x += L * (r() < 0.5 ? -1 : 1); } else { x += L * (r() < 0.5 ? -1 : 1); y += L; }
        x = Math.max(4, Math.min(252, x)); y = Math.min(508, y);
        g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = g.strokeStyle; g.beginPath(); g.arc(x, y, 3.2, 0, TAU); g.fill();
    }
    for (let i = 0; i < 14; i++) { const x = Math.floor(r() * 14) * 16 + 12, y = Math.floor(r() * 30) * 16 + 12, w = 16 + Math.floor(r() * 3) * 16, h = 16 + Math.floor(r() * 3) * 16; g.fillStyle = 'rgba(30,30,34,.9)'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(210,210,220,.2)'; g.lineWidth = 1.5; g.strokeRect(x + 0.5, y + 0.5, w, h); for (let k = 4; k < w; k += 6) { g.fillStyle = 'rgba(210,210,220,.2)'; g.fillRect(x + k, y - 3, 2, 3); g.fillRect(x + k, y + h + 1, 2, 3); } }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function cover() {
    const oct = (s, col, w, op) => { const p = []; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i + 0.5) * Math.PI / 4; p.push((200 + Math.cos(a) * s).toFixed(1) + ' ' + (130 + Math.sin(a) * s * 0.92).toFixed(1)); } return `<path d="M${p.join('L')}z" fill="none" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`; };
    let rings = '';
    for (const [s, w, o] of [[230, 14, 1], [130, 8, 0.95], [78, 5, 0.85], [48, 3, 0.7], [30, 2, 0.55], [19, 1.5, 0.4]]) rings += oct(s, '#ffffff', w, o);
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#0b0b0d"/><g stroke="#3a3a42" stroke-width="2" fill="none"><path d="M0 300L170 160M400 300L230 160M0 0L170 105M400 0L230 105M60 300l60-70h40M340 300l-50-60M30 40l50 40h40"/></g>${rings}<path d="M150 150l100-34 8 22-100 34z" fill="#ff2a2a"/><path d="M158 172l100-34 4 10-100 34z" fill="#9c1010"/><path d="M196 122l10-4 3 8-10 4zM186 138l8-3 2 6-8 3z" fill="#ff2a2a" opacity=".7"/><g stroke="#ffffff" stroke-opacity=".25" stroke-width="2"><path d="M20 150h60M320 120h60M60 220l40-14M340 210l-40-12"/></g></svg>`;
  }

  Ameplay.register({
    id: ID,
    title: 'Tunnel Rush',
    category: '3D',
    tint: '#ff2a2a',
    better: 'high',
    width: 960,
    format: v => v + ' m',
    blurb: 'Fly down a neon tunnel at insane speed and spin around the obstacles.',
    help: '<kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> spin around the tunnel · touch: hold the left or right side · <kbd>Space</kbd> starts / retries',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M22 4h20l14 14v20L42 52H22L8 38V18z" transform="translate(0 4)"/><path d="M27 21h10l7 7v10l-7 7H27l-7-7V28z"/><path d="M14 34l18-6"/></svg>',
    css: CSS,
    async mount(root, api) {
      const narrow = root.clientWidth > 0 && root.clientWidth < 560;
      const VW = narrow ? 600 : 960, VH = narrow ? 860 : 600;
      const v = await api.gl(VW, VH);
      if (!v) return;
      const { THREE, renderer } = v;
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setClearColor(0x000000, 1);
      const keys = api.keys, audio = makeAudio(api);
      const wrap = document.createElement('div');
      wrap.className = 'stage';
      const cvs = v.canvas.style;
      for (const k of ['width', 'aspectRatio']) {
        let val = cvs[k];
        wrap.style[k] = val;
        Object.defineProperty(cvs, k, { get: () => val, set: x => { val = x; wrap.style[k] = x; } });
      }
      root.append(wrap); wrap.append(v.canvas);
      wrap.insertAdjacentHTML('beforeend', `<div class="hud"><div class="pill sp">0.0m/s</div><button class="pz" aria-label="Pause"><i></i></button><div class="pill ds">0.0m</div></div><div class="flash"></div><div class="lvb"></div><div class="touch"${COARSE ? '' : ' hidden'}><i class="tl">‹</i><i class="tr">›</i></div><div class="panel pm"><div class="logo">TUNNEL<span>RUSH</span></div><div class="sub bm"></div><button class="go gs">PLAY</button><div class="sub blink">${COARSE ? 'Hold left / right to spin' : '← → or A D to spin · Space to start'}</div></div><div class="panel po" hidden><div class="big">GAME OVER</div><div class="stat">Level <b class="ol">1</b> · Distance <b class="od">0</b> m</div><div class="stat">Best <b class="ob">0</b> m</div><button class="go gr">RETRY</button><div class="sub">${COARSE ? 'Tap to retry' : 'Space to retry'}</div></div>`);
      const q = s => wrap.querySelector(s);
      const elHud = q('.hud'), elSp = q('.sp'), elDs = q('.ds'), elFlash = q('.flash'), elLvb = q('.lvb'), pm = q('.pm'), po = q('.po'), tl = q('.tl'), tr = q('.tr');
      const SV = Object.assign({ best: 0 }, api.load() || {});
      const setNeon = c => wrap.style.setProperty('--neon', c);
      q('.bm').textContent = SV.best ? 'Best ' + SV.best + ' m' : '';

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000000, 18, 112);
      const cam = new THREE.PerspectiveCamera(narrow ? 84 : 72, VW / VH, 0.05, 160);
      cam.position.set(0, -1.75, 0); cam.lookAt(0, -1.75 - (narrow ? 2.5 : 4.2), -30);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x303038, 0.5));
      const dl = new THREE.DirectionalLight(0xffffff, 0.75); dl.position.set(0.6, 1, 0.8); scene.add(dl);
      const world = new THREE.Group(); scene.add(world);
      const bin = [], keep = o => (bin.push(o), o);

      const tex = keep(circuitTex(THREE));
      const LEN = 160, Z0 = 6;
      const pos = [], uv = [];
      for (let i = 0; i < N; i++) {
        const a0 = sideAng(i) - SIDE / 2, a1 = sideAng(i) + SIDE / 2;
        const x0 = Math.cos(a0) * RC, y0 = Math.sin(a0) * RC, x1 = Math.cos(a1) * RC, y1 = Math.sin(a1) * RC;
        pos.push(x0, y0, Z0, x1, y1, Z0, x1, y1, Z0 - LEN, x0, y0, Z0, x1, y1, Z0 - LEN, x0, y0, Z0 - LEN);
        const rv = LEN / 5;
        uv.push(0, 0, 2, 0, 2, rv, 0, 0, 2, rv, 0, rv);
      }
      const wg = keep(new THREE.BufferGeometry());
      wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      const wallMat = keep(new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, color: 0xffffff }));
      const walls = new THREE.Mesh(wg, wallMat); world.add(walls);
      const edgeMat = keep(new THREE.LineBasicMaterial({ color: 0x34343c }));
      { const e = []; for (let i = 0; i < N; i++) { const a = sideAng(i) - SIDE / 2; e.push(Math.cos(a) * RC * 0.995, Math.sin(a) * RC * 0.995, Z0, Math.cos(a) * RC * 0.995, Math.sin(a) * RC * 0.995, Z0 - LEN); } const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(e, 3)); world.add(new THREE.LineSegments(g, edgeMat)); }

      const octShape = (r1, r2) => {
        const s = new THREE.Shape(), h = new THREE.Path();
        for (let i = 0; i <= N; i++) { const a = sideAng(i) - SIDE / 2; const f = i ? 'lineTo' : 'moveTo'; s[f](Math.cos(a) * r1, Math.sin(a) * r1); }
        for (let i = N; i >= 0; i--) { const a = sideAng(i) - SIDE / 2; const f = i === N ? 'moveTo' : 'lineTo'; h[f](Math.cos(a) * r2, Math.sin(a) * r2); }
        s.holes.push(h); return s;
      };
      const ringGeo = keep(new THREE.ShapeGeometry(octShape(RC * 0.985, RC * 0.93)));
      const glowGeo = keep(new THREE.ShapeGeometry(octShape(RC * 0.99, RC * 0.86)));
      const ringMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true }));
      const glowMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
      const rings = [];
      for (let i = 0; i < NR; i++) { const g = new THREE.Group(); g.add(new THREE.Mesh(ringGeo, ringMat)); g.add(new THREE.Mesh(glowGeo, glowMat)); g.position.z = -i * RING - 4; world.add(g); rings.push(g); }

      const NS = 70, sPos = new Float32Array(NS * 6), streak = [];
      for (let i = 0; i < NS; i++) streak.push({ a: Math.random() * TAU, r: 1 + Math.random() * 1.9, z: -Math.random() * 90, l: 1.5 + Math.random() * 4 });
      const sGeo = keep(new THREE.BufferGeometry()); sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      const sMat = keep(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
      const streaks = new THREE.LineSegments(sGeo, sMat); streaks.frustumCulled = false; scene.add(streaks);

      const obMat = keep(new THREE.MeshLambertMaterial({ color: 0xff2a2a, emissive: 0x330000 }));
      const obEdge = keep(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
      const barGeo = keep(new THREE.BoxGeometry(RC * 2.05, 0.6, DEPTH));
      const blkGeo = keep(new THREE.BoxGeometry(0.95, 0.95, 0.95));
      const wedgeGeo = (i0, n, rIn) => {
        const s = new THREE.Shape(), pts = [];
        for (let k = 0; k <= n; k++) { const a = sideAng(i0 + k) - SIDE / 2; pts.push([Math.cos(a) * RC * 0.995, Math.sin(a) * RC * 0.995]); }
        s.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) s.lineTo(pts[k][0], pts[k][1]);
        if (rIn > 0) { const a0 = sideAng(i0) - SIDE / 2, a1 = sideAng(i0 + n) - SIDE / 2; for (let k = 12; k >= 0; k--) { const a = a0 + (a1 - a0) * k / 12; s.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn); } }
        else s.lineTo(0, 0);
        const g = new THREE.ExtrudeGeometry(s, { depth: DEPTH, bevelEnabled: false, curveSegments: 1 });
        g.translate(0, 0, -DEPTH / 2); return g;
      };

      let state = 'menu', theta = 0, dist = 0, speed = 24, nextAt = 0, safe = -Math.PI / 2, obs = [], stage = 0, deadT = 0, shake = 0, lastShown = '', ptrDir = 0, T = 0;
      const ptrs = new Map();
      const col = new THREE.Color(COLS[0]), colTo = new THREE.Color(COLS[0]), tint = new THREE.Color();
      const playerAng = () => -Math.PI / 2 - theta;
      const angDist = (a, b) => Math.abs(angN(a - b));

      function clearObs() { for (const o of obs) { world.remove(o.g); for (const gg of o.geos) gg.dispose(); } obs = []; }
      function addBar(o, phi) { const m = new THREE.Mesh(barGeo, obMat); m.rotation.z = phi; o.spin.add(m); o.parts.push({ k: 'bar', a: phi, h: 0.3 }); }
      function spawn(z) {
        const k = Math.min(1, dist / 3200), gapT = Math.max(0.6, 1.2 - dist * 0.00016);
        const turn = Math.min(Math.PI * 0.9, ROT * (gapT - 0.3));
        let s = safe + (Math.random() * 2 - 1) * turn;
        const tA = -z / Math.max(1, speed);
        const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin); g.position.z = z;
        const o = { g, spin, z, parts: [], geos: [], w: 0, p0: 0, passed: false };
        const r = Math.random(), pick = k < 0.15 ? (r < 0.4 ? 'door' : r < 0.7 ? 'wedge' : r < 0.85 ? 'bar' : 'blocks') : (r < 0.2 ? 'door' : r < 0.36 ? 'wedge' : r < 0.52 ? 'bar' : r < 0.66 ? 'cross' : r < 0.8 ? 'fan' : r < 0.9 ? 'blocks' : 'half');
        if (pick === 'door' || pick === 'wedge' || pick === 'half') {
          let si = Math.round(angN(s - sideAng(0)) / SIDE); si = ((si % N) + N) % N;
          if (angDist(sideAng(si), safe) > turn + 0.05) { si -= Math.sign(angN(sideAng(si) - safe)); si = ((si % N) + N) % N; }
          s = sideAng(si);
          const free = new Set([si]);
          if (pick === 'door' && Math.random() < 0.5 - k * 0.3) free.add((si + 1) % N);
          let blocked = [];
          if (pick === 'door') { for (let i = 0; i < N; i++) if (!free.has(i)) blocked.push(i); }
          else if (pick === 'half') { const st = si + 2 + Math.floor(Math.random() * 1); for (let i = 0; i < 4 + Math.floor(Math.random() * 2); i++) blocked.push((st + i) % N); }
          else { const n = 2 + Math.floor(Math.random() * 3), st = si + 1 + Math.floor(Math.random() * (N - n - 1)); for (let i = 0; i < n; i++) blocked.push((st + i) % N); }
          blocked = blocked.filter(i => !free.has(i));
          const rIn = pick === 'wedge' && Math.random() < 0.4 ? 1.25 : 0;
          const runs = []; let cur = null;
          for (let i = 0; i < N; i++) { const b = blocked.includes(i); if (b && !cur) { cur = [i, 1]; runs.push(cur); } else if (b) cur[1]++; else cur = null; }
          if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1][0] + runs[runs.length - 1][1] === N) { const last = runs.pop(); runs[0] = [last[0], last[1] + runs[0][1]]; }
          for (const [i0, n] of runs) { const gg = wedgeGeo(i0, n, rIn); o.geos.push(gg); spin.add(new THREE.Mesh(gg, obMat)); const eg = new THREE.EdgesGeometry(gg); o.geos.push(eg); spin.add(new THREE.LineSegments(eg, obEdge)); o.parts.push({ k: 'sec', a0: sideAng(i0) - SIDE / 2, a1: sideAng(i0 + n) - SIDE / 2, rIn }); }
        } else if (pick === 'bar' || pick === 'cross' || pick === 'fan') {
          const w = pick === 'bar' ? (Math.random() < 0.4 + k * 0.4 ? (Math.random() < 0.5 ? -1 : 1) * (0.5 + k * 1.3) * Math.random() : 0) : (Math.random() < 0.5 ? -1 : 1) * (0.25 + k * 0.7) * Math.random();
          o.w = w;
          const base = s + Math.PI / 2 - w * tA;
          if (pick === 'bar') addBar(o, base);
          else if (pick === 'cross') { addBar(o, base - Math.PI / 4 + Math.PI / 2); addBar(o, base + Math.PI / 4 + Math.PI / 2); }
          else { addBar(o, base); addBar(o, base + Math.PI / 3); addBar(o, base - Math.PI / 3); }
        } else {
          for (let i = 0; i < N; i++) {
            const a = sideAng(i);
            if (angDist(a, s) < 0.9 || Math.random() < 0.35) continue;
            const m = new THREE.Mesh(blkGeo, obMat); m.position.set(Math.cos(a) * 2.45, Math.sin(a) * 2.45, 0); m.rotation.z = a; spin.add(m);
            o.parts.push({ k: 'blk', x: Math.cos(a) * 2.45, y: Math.sin(a) * 2.45, s: 0.5 });
          }
        }
        o.s = s; safe = s; world.add(g); obs.push(o);
        nextAt = z - Math.max(14, speed * gapT);
      }
      function hits(o) {
        const pa = playerAng() - o.spin.rotation.z, px = Math.cos(pa) * PR, py = Math.sin(pa) * PR;
        for (const p of o.parts) {
          if (p.k === 'bar') { if (Math.abs(-Math.sin(p.a) * px + Math.cos(p.a) * py) < p.h + PM) return true; }
          else if (p.k === 'blk') { if (Math.hypot(px - p.x, py - p.y) < p.s + PM) return true; }
          else {
            const mid = (p.a0 + p.a1) / 2, half = (p.a1 - p.a0) / 2;
            if (angDist(pa, mid) < half + PM / PR && PR > p.rIn - PM) return true;
          }
        }
        return false;
      }
      function reset() {
        clearObs(); theta = 0; dist = 0; speed = 24; safe = -Math.PI / 2; stage = 0; shake = 0;
        col.set(COLS[0]); colTo.set(COLS[0]); setNeon(COLS[0]);
        nextAt = -55; while (nextAt > -SPAWN) spawn(nextAt);
      }
      const banner = n => { elLvb.textContent = 'LEVEL ' + n; elLvb.classList.remove('on'); void elLvb.offsetWidth; elLvb.classList.add('on'); };
      function start() {
        audio.init(); reset(); banner(1); state = 'play'; pm.hidden = true; po.hidden = true; elHud.hidden = false; audio.start(); audio.sfx('start'); api.score(0);
      }
      function die() {
        state = 'dead'; deadT = 0; shake = 0.35;
        for (const o of obs) { o.z -= 2.2; o.g.position.z = o.z; } audio.stop(); audio.sfx('crash');
        elFlash.style.transition = 'none'; elFlash.style.opacity = '0.85'; void elFlash.offsetWidth; elFlash.style.transition = 'opacity .5s'; elFlash.style.opacity = '0';
        const m = Math.floor(dist);
        api.score(m); if (m > 0) api.submit(m);
        if (m > SV.best) { SV.best = m; api.save(SV); }
        q('.od').textContent = m; q('.ol').textContent = stage + 1; q('.ob').textContent = SV.best;
        api.timeout(() => { if (state === 'dead') { state = 'over'; po.hidden = false; elHud.hidden = true; } }, 650);
      }
      const act = () => { if (state === 'menu') start(); else if (state === 'over') start(); };
      q('.gs').addEventListener('click', e => { e.stopPropagation(); start(); });
      q('.gr').addEventListener('click', e => { e.stopPropagation(); start(); });
      q('.pz').addEventListener('pointerdown', e => e.stopPropagation());
      q('.pz').addEventListener('click', e => { e.stopPropagation(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true })); });
      api.on(window, 'keydown', e => {
        const c = e.code;
        if (c === 'ArrowLeft' || c === 'ArrowRight' || c === 'KeyA' || c === 'KeyD' || c === 'Space' || c === 'Enter') {
          const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
          e.preventDefault();
          if (state === 'menu' || (state === 'over' && (c === 'Space' || c === 'Enter'))) act();
        }
      });
      const setPtr = () => { let d = 0; for (const x of ptrs.values()) d = x; ptrDir = d; tl.classList.toggle('on', d < 0); tr.classList.toggle('on', d > 0); };
      api.on(wrap, 'pointerdown', e => {
        if (e.target.closest('button')) return;
        e.preventDefault();
        if (state === 'menu' || state === 'over') { act(); return; }
        const r = wrap.getBoundingClientRect();
        ptrs.set(e.pointerId, e.clientX - r.left < r.width / 2 ? -1 : 1); setPtr();
        try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
      });
      const pUp = e => { if (ptrs.delete(e.pointerId)) setPtr(); };
      api.on(wrap, 'pointerup', pUp); api.on(wrap, 'pointercancel', pUp);
      api.on(window, 'blur', () => { ptrs.clear(); setPtr(); });

      reset(); elHud.hidden = true;
      api.score(0);
      api.loop(dt => {
        T += dt;
        if (state === 'play') {
          const kd = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
          const dir = ptrDir || kd;
          speed = Math.min(70, 24 + dist * 0.012);
          const sub = 4, h = dt / sub;
          for (let s = 0; s < sub && state === 'play'; s++) {
            theta -= dir * ROT * h;
            const dz = speed * h; dist += dz; nextAt += dz;
            for (const o of obs) {
              const z0 = o.z; o.z += dz; o.g.position.z = o.z; o.spin.rotation.z += o.w * h;
              if (!o.passed && o.z + DEPTH / 2 > -0.1 && z0 - DEPTH / 2 < 0.1 && hits(o)) { die(); break; }
              if (!o.passed && o.z - DEPTH / 2 > 0.2) { o.passed = true; audio.sfx('pass'); }
            }
          }
          while (nextAt > -SPAWN) spawn(nextAt);
          for (let i = obs.length - 1; i >= 0; i--) if (obs[i].z > 8) { const o = obs[i]; world.remove(o.g); for (const gg of o.geos) gg.dispose(); obs.splice(i, 1); }
          const st = Math.floor(dist / 400);
          if (st !== stage) { stage = st; colTo.set(COLS[st % COLS.length]); setNeon(COLS[st % COLS.length]); audio.sfx('stage'); banner(st + 1); }
          const m = Math.floor(dist); api.score(m);
          audio.tick();
        } else if (state === 'menu') {
          theta += dt * 0.35; speed = 16;
          const dz = speed * dt;
          for (const o of obs) { o.z += dz; o.g.position.z = o.z; o.spin.rotation.z += o.w * dt; }
          for (let i = obs.length - 1; i >= 0; i--) if (obs[i].z > 8) { const o = obs[i]; world.remove(o.g); for (const gg of o.geos) gg.dispose(); obs.splice(i, 1); }
          nextAt += dz; while (nextAt > -SPAWN) spawn(nextAt);
        } else deadT += dt;
        const mv = state === 'play' || state === 'menu' ? speed * dt : 0;
        tex.offset.y -= mv / 5;
        for (const g of rings) { g.position.z += mv; if (g.position.z > 3) g.position.z -= RING * NR; }
        for (let i = 0; i < NS; i++) {
          const s = streak[i]; s.z += mv * 1.6; if (s.z > 4) { s.z -= 95; s.a = Math.random() * TAU; s.r = 1.2 + Math.random() * 1.8; }
          const x = Math.cos(s.a) * s.r, y = Math.sin(s.a) * s.r, L = s.l * (0.4 + speed / 50);
          sPos.set([x, y, s.z, x, y, s.z - L], i * 6);
        }
        sGeo.attributes.position.needsUpdate = true; sMat.opacity = state === 'play' ? 0.12 + speed / 260 : 0.15;
        col.lerp(colTo, Math.min(1, dt * 3));
        obMat.color.copy(col).convertSRGBToLinear(); obMat.emissive.copy(obMat.color).multiplyScalar(0.22);
        tint.copy(col).lerp(new THREE.Color(1, 1, 1), 0.55); wallMat.color.copy(tint);
        glowMat.color.copy(col).lerp(new THREE.Color(1, 1, 1), 0.4);
        world.rotation.z = theta;
        shake = Math.max(0, shake - dt);
        cam.position.x = shake ? (Math.random() - 0.5) * shake * 0.6 : 0;
        cam.position.y = -1.75 + (shake ? (Math.random() - 0.5) * shake * 0.6 : 0);
        const sp = speed.toFixed(1) + 'm/s', ds = dist.toFixed(1) + 'm';
        if (sp + ds !== lastShown) { lastShown = sp + ds; elSp.textContent = sp; elDs.textContent = ds; }
        renderer.render(scene, cam);
      });
      root.__tunnel = { snap: () => { const n = obs.find(o => !o.passed); return { state, dist, speed, theta, obs: obs.length, next: n ? n.s : null, nz: n ? n.z : null }; }, setDist: d => { dist = d; } };
      return {
        destroy() {
          delete root.__tunnel; audio.close(); clearObs();
          for (const o of bin) { try { o.dispose(); } catch (e) {} }
        }
      };
    }
  });
  Ameplay.covers[ID] = cover();
})();
