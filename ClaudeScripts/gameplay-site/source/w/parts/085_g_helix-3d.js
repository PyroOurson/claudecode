
(() => {
  'use strict';
  const ID = 'helix-3d';
  const CFG = {
    HZ: 120,
    SEG: 12,
    RIN: 1.02, ROUT: 2.5, TH: .46, GAP: 3.1,
    BR: .3, BZ: 1.76,
    BOUNCE_H: 1.55, BOUNCE_T: .62,
    VMAX: 17,
    FIRE: 3,
    DRAG: 1.65 * Math.PI,
    KEY_ROT: 4.2,
    CONT_T: 5,
    RINGS: L => Math.min(10 + Math.floor(L * 1.6), 42)
  };
  CFG.G = 8 * CFG.BOUNCE_H / (CFG.BOUNCE_T * CFG.BOUNCE_T);
  CFG.BOUNCE = 4 * CFG.BOUNCE_H / CFG.BOUNCE_T;
  const TAU = Math.PI * 2, SLOT = TAU / CFG.SEG;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const wrapA = a => ((a % TAU) + TAU) % TAU;
  const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const rng = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  const PAL = [
    { top: '#6e6e76', bot: '#e2e2e6', pole: '#ffffff', plat: '#26262b', ball: '#ffb21a' },
    { top: '#8fd3ff', bot: '#eaf7ff', pole: '#fff6ea', plat: '#ffc23a', ball: '#ff4f86' },
    { top: '#ffb3d1', bot: '#fff1f7', pole: '#fffaf4', plat: '#8a78ff', ball: '#ffc83a' },
    { top: '#94ecc4', bot: '#ecfff6', pole: '#ffffff', plat: '#3d9cff', ball: '#ff7a3a' },
    { top: '#c6b0ff', bot: '#f6f1ff', pole: '#fffbe8', plat: '#25c2a2', ball: '#ff4f7a' },
    { top: '#ffcf9f', bot: '#fff6ec', pole: '#ffffff', plat: '#6a88ff', ball: '#22b866' },
    { top: '#9fe6f0', bot: '#effdff', pole: '#fff8f0', plat: '#a6d83a', ball: '#8a5cff' },
    { top: '#ffc0c8', bot: '#fff4f2', pole: '#fffaf0', plat: '#36aecb', ball: '#ffae1a' },
    { top: '#cff3a4', bot: '#f8ffee', pole: '#ffffff', plat: '#b067ff', ball: '#2f8cff' }
  ];
  const RED = '#ec2440';

  function GEN(L) {
    const r = rng(L * 7919 + 101), n = CFG.RINGS(L), out = [], S = CFG.SEG;
    let prevGap = null, prevSpin = false;
    for (let i = 0; i < n; i++) {
      const s = new Array(S).fill(1);
      const gl = L <= 2 ? 3 : r() < .55 ? 2 : 3;
      let g0 = Math.floor(r() * S);
      if (i === 0) g0 = (9 + 3 + Math.floor(r() * 4)) % S;
      for (let k = 0; k < gl; k++) s[(g0 + k) % S] = 0;
      if (L >= 5 && i > 1 && r() < .25) { const g2 = (g0 + gl + 3 + Math.floor(r() * 4)) % S; s[g2] = 0; s[(g2 + 1) % S] = 0; }
      let red = i < 2 ? 0 : Math.min(5, Math.round((.25 + L * .2) * (.4 + r())));
      if (L === 1 && i < 4) red = 0;
      if (prevSpin) red = Math.min(red, 2);
      const banned = new Set();
      if (i === 0) [8, 9, 10].forEach(k => banned.add(k));
      if (prevGap && !prevSpin) prevGap.forEach(k => { banned.add(k); banned.add((k + 1) % S); banned.add((k + S - 1) % S); });
      for (let tries = 0; red > 0 && tries < 60; tries++) {
        const j = Math.floor(r() * S);
        if (s[j] !== 1 || banned.has(j)) continue;
        s[j] = 2; red--;
        if (red > 0 && L >= 3 && r() < .5 && s[(j + 1) % S] === 1 && !banned.has((j + 1) % S)) { s[(j + 1) % S] = 2; red--; }
      }
      if (s.filter(v => v === 1).length < 2) for (let j = 0; j < S; j++) if (s[j] === 2) { s[j] = 1; break; }
      const p = { slots: s, spin: 0, osc: 0, mover: null };
      if (L >= 4 && i > 1 && r() < Math.min(.5, (L - 3) * .09)) p.spin = (r() < .5 ? -1 : 1) * (.45 + r() * .3 + Math.min(.4, L * .02));
      if (L >= 7 && p.spin && r() < .4) { p.osc = Math.sign(p.spin) * (.8 + r() * .4); p.spin = 0; }
      if (p.spin || p.osc) { let n2 = 0; for (let j = 0; j < S; j++) if (s[j] === 2 && ++n2 > 3) s[j] = 1; }
      if (L >= 6 && i > 1 && !p.spin && !p.osc && r() < Math.min(.45, (L - 5) * .08)) {
        for (let j0 = 0; j0 < S; j0++) {
          const j = (j0 + Math.floor(r() * S)) % S;
          if (s[j] !== 1 || s[(j + S - 1) % S] === 1) continue;
          let m = 0;
          while (m < S && s[(j + m) % S] === 1) m++;
          if (m >= 4) { p.mover = { base: (j + m / 2) * SLOT, amp: (m - 1.2) / 2 * SLOT, spd: 1.2 + r() * .8 }; break; }
        }
      }
      prevGap = []; for (let j = 0; j < S; j++) if (s[j] === 0) prevGap.push(j);
      prevSpin = !!(p.spin || p.osc);
      out.push(p);
    }
    return out;
  }
  const ringRot = (p, t) => p.spin * t + p.osc * Math.sin(t * 1.7);
  const moverAng = (m, t) => m.base + m.amp * Math.sin(t * m.spd);
  function slotAt(p, rot, t) {
    const local = wrapA(-Math.PI / 2 - rot - ringRot(p, t));
    if (p.fin) return { k: 3, local };
    let k = p.slots[Math.floor(local / SLOT) % CFG.SEG];
    if (k === 1 && p.mover && Math.abs(angDiff(local, moverAng(p.mover, t))) < SLOT * .55) k = 2;
    return { k, local };
  }
  function physStep(s, rings, dt, t) {
    const prev = s.by;
    s.vy = Math.max(s.vy - CFG.G * dt, -CFG.VMAX);
    s.by += s.vy * dt;
    if (s.next >= rings.length) return null;
    const p = rings[s.next];
    if (!(s.vy < 0 && prev - CFG.BR >= p.y - 1e-6 && s.by - CFG.BR <= p.y)) return null;
    const { k, local } = slotAt(p, s.rot, t);
    if (k === 0) { s.next++; s.streak++; return { type: 'pass', p, local }; }
    s.by = p.y + CFG.BR;
    if (k === 3) { s.vy = 0; return { type: 'finish', p, local }; }
    if (s.streak >= CFG.FIRE) { s.next++; s.streak = 0; s.vy = CFG.BOUNCE; return { type: 'smash', p, local }; }
    if (k === 2) { s.vy = 0; return { type: 'die', p, local }; }
    s.vy = CFG.BOUNCE; s.streak = 0;
    return { type: 'bounce', p, local };
  }
  function layout(L) {
    const rings = GEN(L).map((d, i) => ({ ...d, y: -i * CFG.GAP }));
    rings.push({ slots: new Array(CFG.SEG).fill(1), spin: 0, osc: 0, mover: null, fin: true, y: -rings.length * CFG.GAP });
    return rings;
  }

  const CSS = `.gm-${ID} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;user-select:none;-webkit-user-select:none;background:linear-gradient(180deg,var(--top,#8fd3ff),var(--bot,#eaf7ff));box-shadow:0 22px 44px -28px rgba(31,29,43,.55);cursor:grab}
.gm-${ID} .stage:active{cursor:grabbing}
.gm-${ID} .stage::after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 50% 38%,rgba(255,255,255,.28),rgba(255,255,255,0) 55%),radial-gradient(130% 100% at 50% 50%,rgba(0,0,0,0) 62%,rgba(31,29,43,.2))}
.gm-${ID} .hud,.gm-${ID} .panel{z-index:1}
.gm-${ID} .stage canvas{border-radius:0;background:transparent;display:block}
.gm-${ID} .hud{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;align-items:center;gap:1.6cqw;padding:3.6cqw 4cqw 0;pointer-events:none;font-family:var(--sans)}
.gm-${ID} .lv{display:flex;align-items:center;gap:1.6cqw;width:min(82%,340px)}
.gm-${ID} .lv b{flex:none;display:grid;place-items:center;width:clamp(26px,8cqw,40px);aspect-ratio:1;border-radius:50%;background:#fff;color:var(--ink);font:900 clamp(12px,3.6cqw,18px)/1 var(--sans);box-shadow:0 3px 10px -3px rgba(31,29,43,.35)}
.gm-${ID} .lv b.a{background:var(--ball);color:#fff}
.gm-${ID} .bar{flex:1;height:clamp(10px,3cqw,15px);border-radius:99px;background:rgba(255,255,255,.75);overflow:hidden;box-shadow:inset 0 1px 3px rgba(31,29,43,.15)}
.gm-${ID} .bar i{display:block;height:100%;width:0;border-radius:inherit;background:var(--ball)}
.gm-${ID} .sc{font:600 clamp(34px,13cqw,70px)/1 var(--sans);color:#38383e;font-variant-numeric:tabular-nums}
.gm-${ID} .pop{position:absolute;font:900 clamp(15px,6cqw,30px)/1 var(--sans);color:#fff;white-space:nowrap;pointer-events:none;text-shadow:0 2px 0 rgba(31,29,43,.25),0 4px 14px rgba(31,29,43,.2)}
.gm-${ID} .pop.x{color:var(--ball);font-size:clamp(13px,4.6cqw,24px);text-shadow:0 2px 0 #fff,0 0 8px #fff}
.gm-${ID} .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.gm-${ID} .panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.6cqw;text-align:center;font-family:var(--sans);color:#fff;pointer-events:none;padding:6cqw}
.gm-${ID} .p-menu{justify-content:space-between;padding:12cqw 6cqw 9cqw}
.gm-${ID} .p-menu .grp{display:flex;flex-direction:column;align-items:center;gap:2cqw}
.gm-${ID} .panel.dim{background:rgba(31,29,43,.35)}
.gm-${ID} .logo{font:900 clamp(40px,15cqw,84px)/.92 var(--sans);letter-spacing:-.02em;color:#fff;text-shadow:0 .06em 0 var(--ball),0 .12em .3em rgba(31,29,43,.25)}
.gm-${ID} .big{font:900 clamp(26px,10cqw,54px)/1 var(--sans);text-shadow:0 .06em 0 rgba(31,29,43,.22)}
.gm-${ID} .mid{font:900 clamp(15px,5cqw,26px)/1.1 var(--sans);text-shadow:0 2px 0 rgba(31,29,43,.2)}
.gm-${ID} .sm{font:800 clamp(12px,3.6cqw,17px)/1.3 var(--sans);opacity:.95;text-shadow:0 1px 0 rgba(31,29,43,.25)}
.gm-${ID} .tap{font:900 clamp(15px,5cqw,24px)/1 var(--sans);animation:hxp 1.1s ease-in-out infinite;text-shadow:0 2px 0 rgba(31,29,43,.25)}
@keyframes hxp{50%{transform:scale(1.08);opacity:.8}}
.gm-${ID} .hand{width:clamp(44px,14cqw,70px);height:clamp(44px,14cqw,70px);animation:hxh 1.6s ease-in-out infinite}
@keyframes hxh{0%,100%{transform:translateX(-40%)}50%{transform:translateX(40%)}}
.gm-${ID} .btn{pointer-events:auto;min-width:9em;height:2.8em;padding:0 1.6em;border:0;border-radius:99px;background:#fff;color:var(--ink);font:900 clamp(14px,4.4cqw,20px)/1 var(--sans);cursor:pointer;box-shadow:0 .25em 0 rgba(31,29,43,.2)}
.gm-${ID} .btn.go{background:var(--ball);color:#fff}
.gm-${ID} .btn.ghost{background:transparent;color:#fff;box-shadow:none;text-decoration:underline;min-width:0;height:2.4em}
.gm-${ID} .ring{position:relative;width:clamp(90px,30cqw,150px);aspect-ratio:1}
.gm-${ID} .ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.gm-${ID} .ring b{position:absolute;inset:0;display:grid;place-items:center;font:900 clamp(30px,11cqw,56px)/1 var(--sans)}
.gm-${ID} .nb{background:#fff;color:var(--ball);padding:.35em .9em;border-radius:99px;font:900 clamp(12px,3.6cqw,16px)/1 var(--sans);letter-spacing:.08em}
.gm-${ID} .stats{display:flex;gap:7cqw}
.gm-${ID} .stats span{display:block;font:900 clamp(10px,3cqw,13px)/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.gm-${ID} .stats b{display:block;font:900 clamp(24px,8cqw,42px)/1.1 var(--sans);font-variant-numeric:tabular-nums}
.gm-${ID} [hidden]{display:none!important}`;

  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M28.5 4v56M35.5 4v56"/><path d="M12 22c0 3 9 5.5 20 5.5s20-2.5 20-5.5"/><path d="M12 38c0 3 9 5.5 20 5.5 7 0 13-1 16.5-2.5"/><path d="M12 54c0 3 9 5.5 20 5.5s20-2.5 20-5.5"/><circle cx="44" cy="12" r="5"/></svg>';
  const HAND = '<svg class="hand" viewBox="0 0 64 64"><path d="M26 30V12a4 4 0 0 1 8 0v14l14 3c4 1 6 4 5 8l-3 13c-1 4-4 6-8 6H30c-3 0-5-1-7-4l-9-12c-2-3 2-7 6-4l6 5z" fill="#fff" stroke="rgba(31,29,43,.3)" stroke-width="2"/></svg>';

  Ameplay.register({
    id: ID,
    title: 'Helix Drop',
    category: '3D',
    tint: '#ff4f86',
    blurb: 'Spin the helix tower, bounce down through the gaps, never touch red.',
    help: 'Drag left / right (mouse or finger) or <kbd>←</kbd> <kbd>→</kbd> to spin the tower · drop through gaps, avoid red · 3 floors in a row = fireball',
    better: 'high',
    width: 640,
    icon: ICON,
    css: CSS,
    _gen: GEN, _layout: layout, _phys: physStep, _slotAt: slotAt, _cfg: CFG,
    async mount(root, api) {
      const keys = api.keys;
      const v = await api.gl(560, 780, { alpha: true });
      if (!v) return;
      const { THREE, renderer, canvas } = v;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;

      const st = document.createElement('div');
      st.className = 'stage';
      st.style.width = canvas.style.width; st.style.aspectRatio = canvas.style.aspectRatio;
      canvas.style.width = '100%';
      root.append(st); st.append(canvas);
      st.insertAdjacentHTML('beforeend', `
<div class="hud" hidden><div class="lv"><b class="a">1</b><span class="bar"><i></i></span><b class="b">2</b></div><div class="sc">0</div></div>
<div class="flash"></div>
<div class="panel p-menu"><div class="grp"><div class="logo">HELIX<br>JUMP</div><div class="mid m-lv"></div></div><div class="grp">${HAND}<div class="tap">Drag to play</div><div class="sm m-best"></div><button class="btn ghost m-reset" hidden>Start again from level 1</button></div></div>
<div class="panel dim p-cont" hidden><div class="big">Continue?</div><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="9"/><circle class="c-arc" cx="50" cy="50" r="44" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><b class="c-n">5</b></div><button class="btn go c-yes">Continue</button><button class="btn ghost c-no">No thanks</button></div>
<div class="panel dim p-over" hidden><div class="mid o-lv"></div><div class="big o-pc"></div><div class="nb o-nb" hidden>NEW BEST</div><div class="stats"><div><span>Score</span><b class="o-sc">0</b></div><div><span>Best</span><b class="o-bs">0</b></div></div><div class="tap">Tap to restart</div></div>
<div class="panel dim p-clear" hidden><div class="mid k-lv"></div><div class="big">Level passed!</div><div class="stats"><div><span>Score</span><b class="k-sc">0</b></div><div><span>Bonus</span><b class="k-bn">0</b></div></div><div class="tap">Tap to continue</div></div>`);
      const $ = s => st.querySelector(s);
      const elHud = $('.hud'), elA = $('.lv .a'), elB = $('.lv .b'), elBar = $('.bar i'), elSc = $('.sc'), elFlash = $('.flash');
      const P = { menu: $('.p-menu'), cont: $('.p-cont'), over: $('.p-over'), clear: $('.p-clear') };
      const showP = k => { for (const n in P) P[n].hidden = n !== k; panelAt = performance.now(); };

      const saved = api.load() || {};
      let level = clamp(saved.level | 0 || 1, 1, 999);
      const persist = () => api.save({ level });

      const bin = [], keep = o => (bin.push(o), o), lin = h => new THREE.Color(h).convertSRGBToLinear();
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(44, 560 / 780, .1, 80);
      const hemi = new THREE.HemisphereLight(0xffffff, 0xb8a8d8, .72);
      const sun = new THREE.DirectionalLight(0xffffff, .55);
      const rimL = new THREE.DirectionalLight(0xcfe8ff, .45);
      rimL.position.set(4, 3, -6); scene.add(rimL);
      sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
      Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 30 });
      sun.shadow.bias = -.0008; sun.shadow.normalBias = .02;
      scene.add(hemi, sun, sun.target);
      const tower = new THREE.Group(); scene.add(tower);
      const tex = (w, h, fn, wrap) => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        fn(c.getContext('2d'), w, h);
        const t = keep(new THREE.CanvasTexture(c));
        t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
        if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
        return t;
      };
      const poleTex = tex(128, 128, (g, w, h) => {
        g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
      }, true);
      const platTex = tex(256, 256, (g, w, h) => {
        g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
        const sc = w / (2 * CFG.ROUT);
        const ring = (r, lw, col) => { g.strokeStyle = col; g.lineWidth = lw * sc; g.beginPath(); g.arc(w / 2, h / 2, r * sc, 0, TAU); g.stroke(); };
        ring(2.44, .05, 'rgba(255,255,255,.22)');
      });
      const redTex = tex(128, 128, (g, w, h) => {
        g.fillStyle = '#ff3a22'; g.fillRect(0, 0, w, h);
      }, true);
      redTex.repeat.set(2.4, 2.4);
      const mPole = keep(new THREE.MeshPhongMaterial({ map: poleTex, shininess: 55, specular: 0x777777 }));
      const mPlat = keep(new THREE.MeshPhongMaterial({ map: platTex, vertexColors: true, shininess: 48, specular: 0x555555 }));
      const mRed = keep(new THREE.MeshPhongMaterial({ map: redTex, vertexColors: true, color: lin('#ffffff'), emissive: lin('#3a0008'), shininess: 70, specular: 0x886666 }));
      const mFin = keep(new THREE.MeshPhongMaterial({ vertexColors: true, color: lin('#ffffff'), shininess: 60, specular: 0x555555 }));
      const mCollar = keep(new THREE.MeshPhongMaterial({ shininess: 80, specular: 0x888888 }));
      const mBall = keep(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 130, specular: 0xffffff }));
      const mSplat = keep(new THREE.MeshPhongMaterial({ shininess: 90, specular: 0x999999, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      const mTrail = keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: .32, depthWrite: false }));
      const mRim = keep(new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(1, 1, 1) }, uK: { value: .75 } },
        vertexShader: 'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
        fragmentShader: 'uniform vec3 uColor;uniform float uK;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),2.6);float l=.55+.45*max(dot(normalize(vN),normalize(vec3(.7,.6,-.4))),0.);gl_FragColor=vec4(uColor,f*uK*l);}'
      }));
      const pole = new THREE.Mesh(keep(new THREE.CylinderGeometry(CFG.RIN - .02, CFG.RIN - .02, 1, 40)), mPole);
      pole.receiveShadow = true; tower.add(pole);
      const collarGeo = keep(new THREE.LatheGeometry([[.5, -.1], [.6, -.1], [.66, -.06], [.68, -.02], [.66, .04], [.62, .09], [.56, .12], [.5, .12]].map(q => new THREE.Vector2(q[0], q[1])), 28));
      const collars = new THREE.InstancedMesh(collarGeo, mCollar, 64);
      collars.count = 0; collars.frustumCulled = false; collars.visible = false; tower.add(collars);
      const uvGen = {
        generateTopUV: (g, v, a, b, c) => [a, b, c].map(i => new THREE.Vector2(v[i * 3] / (2 * CFG.ROUT) + .5, v[i * 3 + 1] / (2 * CFG.ROUT) + .5)),
        generateSideWallUV: () => [0, 1, 2, 3].map(() => new THREE.Vector2(.02, .02))
      };
      const ss = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
      const segGeos = [];
      const segGeo = n => segGeos[n] || (segGeos[n] = keep((() => {
        const a = n * SLOT, s = new THREE.Shape();
        s.absarc(0, 0, CFG.ROUT, 0, a, false); s.absarc(0, 0, CFG.RIN, a, 0, true);
        const g = new THREE.ExtrudeGeometry(s, { depth: CFG.TH - .1, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3, curveSegments: Math.max(3, n * 5), UVGenerator: uvGen });
        g.rotateX(-Math.PI / 2); g.translate(0, -(CFG.TH - .05), 0);
        const pa = g.attributes.position, na = g.attributes.normal, col = new Float32Array(pa.count * 3);
        for (let i = 0; i < pa.count; i++) {
          const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), ny = na.getY(i), r = Math.hypot(x, z);
          let b;
          if (ny > .93) b = .84 + .16 * ss(CFG.RIN, CFG.ROUT, r);
          else if (ny > .1) b = 1.12;
          else if (ny < -.5) b = .5;
          else b = .62 + .3 * ss(-.32, 0, y);
          col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = b;
        }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        return g;
      })()));
      const splatGeos = [0, 1, 2].map(k => {
        const r = rng(k * 31 + 5), shapes = [], main = new THREE.Shape(), N = 30;
        for (let i = 0; i < N; i++) { const a = i / N * TAU, d = .2 + r() * .07 + (r() < .3 ? .05 + r() * .12 : 0); i ? main.lineTo(Math.cos(a) * d, Math.sin(a) * d) : main.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
        shapes.push(main);
        for (let i = 0; i < 14; i++) { const a = r() * TAU, d = .3 + r() * .3, s = new THREE.Shape(); s.absarc(Math.cos(a) * d, Math.sin(a) * d, .015 + r() * .04, 0, TAU, false); shapes.push(s); }
        return keep(new THREE.ShapeGeometry(shapes, 4));
      });
      const ballGeo = keep(new THREE.SphereGeometry(CFG.BR, 40, 26));
      {
        const pa = ballGeo.attributes.position, col = new Float32Array(pa.count * 3);
        for (let i = 0; i < pa.count; i++) {
          const ny = pa.getY(i) / CFG.BR, nz = pa.getZ(i) / CFG.BR, b = .62 + .38 * ss(-1, .8, ny) + .08 * nz;
          col[i * 3] = b; col[i * 3 + 1] = b * (.97 + .03 * ny); col[i * 3 + 2] = b;
        }
        ballGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      }
      const ball = new THREE.Mesh(ballGeo, mBall); ball.castShadow = true; ball.position.z = CFG.BZ; scene.add(ball);
      const rimShell = new THREE.Mesh(keep(new THREE.SphereGeometry(CFG.BR * 1.02, 32, 20)), mRim); ball.add(rimShell);
      const mGloss = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, depthWrite: false }));
      const mGloss2 = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .32, depthWrite: false }));
      const upV = new THREE.Vector3(0, 1, 0);
      const glossCap = (th, dir, m) => {
        const c = new THREE.Mesh(keep(new THREE.SphereGeometry(CFG.BR * 1.025, 16, 6, 0, TAU, 0, th)), m);
        c.quaternion.setFromUnitVectors(upV, dir.normalize()); ball.add(c);
      };
      glossCap(.34, new THREE.Vector3(-.5, .62, .6), mGloss);
      glossCap(.12, new THREE.Vector3(-.12, .86, .5), mGloss);
      glossCap(.3, new THREE.Vector3(.55, -.62, .56), mGloss2);
      const trailGeo = keep(new THREE.CylinderGeometry(0, CFG.BR * .92, 1.3, 14, 1, true).translate(0, .65, 0));
      const trail = [];
      for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(trailGeo, mTrail); m.visible = false; scene.add(m); trail.push({ m, life: 0 }); }
      const BUBN = 40, BUBH = 28;
      const bubMesh = new THREE.InstancedMesh(keep(new THREE.CircleGeometry(1, 28)), keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: .6, depthWrite: false })), BUBN);
      bubMesh.frustumCulled = false; bubMesh.renderOrder = -1; scene.add(bubMesh);
      const BUB = [];
      { const r = rng(77); for (let i = 0; i < BUBN; i++) BUB.push({ x: (r() - .5) * 13, y: r() * BUBH, z: -5 - r() * 7, s: .05 + r() * r() * .14, p: r() * TAU, w: .2 + r() * .4, tint: r() < .4 }); }
      let trailT = 0;

      const tmpO = new THREE.Object3D(), bubTint = new THREE.Color();
      const FXN = 320;
      const fxMesh = new THREE.InstancedMesh(keep(new THREE.IcosahedronGeometry(1, 0)), keep(new THREE.MeshLambertMaterial({ emissive: 0x222222 })), FXN);
      fxMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); fxMesh.frustumCulled = false; scene.add(fxMesh);
      const FX = [], white = new THREE.Color(1, 1, 1);
      for (let i = 0; i < FXN; i++) { fxMesh.setColorAt(i, white); FX.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, size: 1, g: 1, r: 0, c: new THREE.Color() }); }
      fxMesh.count = 0;
      let fxN = 0;
      function emit(x, y, z, vx, vy, vz, size, life, color, g = 1) {
        if (fxN >= FXN) return;
        const p = FX[fxN++]; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.size = size; p.life = p.max = life; p.g = g; p.r = Math.random() * 6; p.c.copy(color);
      }
      function fxUpdate(dt) {
        let j = 0;
        for (let i = 0; i < fxN; i++) {
          const p = FX[i];
          if ((p.life -= dt) <= 0) continue;
          p.vy -= 18 * p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.r += dt * 5;
          if (i !== j) { FX[i] = FX[j]; FX[j] = p; }
          const s = p.size * Math.min(1, 2.2 * p.life / p.max);
          tmpO.position.set(p.x, p.y, p.z); tmpO.rotation.set(p.r, p.r * .7, 0); tmpO.scale.set(s, s, s); tmpO.updateMatrix();
          fxMesh.setMatrixAt(j, tmpO.matrix); fxMesh.setColorAt(j, p.c); j++;
        }
        fxN = j; fxMesh.count = j; fxMesh.instanceMatrix.needsUpdate = true; if (fxMesh.instanceColor) fxMesh.instanceColor.needsUpdate = true;
      }
      function burst(y, n, col, sp, size, up = 1, g = 1) {
        for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = sp * (.4 + Math.random() * .8); emit((Math.random() - .5) * .2, y, CFG.BZ, Math.cos(a) * s, up * (1 + Math.random() * 3), Math.sin(a) * s, size * (.6 + Math.random() * .7), .45 + Math.random() * .45, col, g); }
      }

      let ac = null, master = null;
      function au() {
        if (api.muted) return null;
        if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination); } catch (e) { ac = null; return null; } }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function tone(t0, f0, f1, d, type, vol) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + d);
        g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .005); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
        o.connect(g).connect(master); o.start(t0); o.stop(t0 + d + .05);
      }
      function noise(t0, d, f0, f1, vol) {
        const len = Math.ceil(ac.sampleRate * d), b = ac.createBuffer(1, len, ac.sampleRate), x = b.getChannelData(0);
        for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = b; f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + d);
        g.gain.value = vol; s.connect(f).connect(g).connect(master); s.start(t0);
      }
      const NOTES = [523, 587, 659, 784, 880, 988, 1047, 1175, 1319, 1568];
      function sfx(n, k = 0) {
        if (!au()) return;
        const t = ac.currentTime;
        try {
          if (n === 'bounce') { tone(t, 330, 180, .12, 'sine', .22); noise(t, .06, 900, 400, .12); }
          else if (n === 'pass') { tone(t, NOTES[Math.min(k, 9)], NOTES[Math.min(k, 9)] * 1.01, .18, 'triangle', .14); noise(t, .12, 3000, 1200, .1); }
          else if (n === 'smash') { noise(t, .35, 2500, 200, .4); tone(t, 160, 60, .3, 'sine', .3); }
          else if (n === 'die') { noise(t, .25, 700, 150, .35); tone(t, 220, 70, .4, 'sawtooth', .08); }
          else if (n === 'win') [523, 659, 784, 1047, 1319].forEach((f, i) => tone(t + i * .08, f, f, .3, 'triangle', .12));
          else if (n === 'tick') tone(t, 900, 900, .05, 'square', .04);
          else if (n === 'fire') { noise(t, .5, 300, 2400, .2); tone(t, 200, 600, .4, 'sawtooth', .05); }
        } catch (e) {}
      }

      let state = 'menu', rings = [], meshes = [], pal = PAL[0], score = 0, levelStart = 0, lt = 0, acc = 0;
      const s = { by: 0, vy: 0, next: 0, streak: 0, rot: 0 };
      let squash = 0, shake = 0, camY = 0, camT = 0, prog = -1, contUsed = false, contT = 0, deathP = null, panelAt = 0, drag = null, lastX = 0, dieT = 0, submitted = false, clearT = 0;
      const debris = [];
      const cBall = new THREE.Color(), cPlat = new THREE.Color(), cRed = lin(RED), cFire = ['#fff3a0', '#ffc83d', '#ff7a1a', '#ff3d2e'].map(lin), cConf = ['#ff4f86', '#ffc23a', '#3d9cff', '#25c2a2', '#8a78ff', '#ff7a3a'].map(lin);

      function seg(grp, mat, s0, n) {
        const m = new THREE.Mesh(segGeo(n), mat);
        m.rotation.y = s0 * SLOT; m.userData.mid = (s0 + n / 2) * SLOT;
        m.castShadow = false; m.receiveShadow = true; grp.add(m);
        return m;
      }
      function buildRingMesh(p) {
        const grp = new THREE.Group(); grp.position.y = p.y;
        const sl = p.slots;
        if (p.fin) for (let k = 0; k < CFG.SEG; k++) seg(grp, k % 2 ? mFin : mPlat, k, 1);
        else {
          let s0 = sl.findIndex((t, k) => t !== sl[(k + CFG.SEG - 1) % CFG.SEG]); if (s0 < 0) s0 = 0;
          for (let k = 0; k < CFG.SEG;) {
            const t = sl[(s0 + k) % CFG.SEG]; let n = 1;
            while (k + n < CFG.SEG && sl[(s0 + k + n) % CFG.SEG] === t) n++;
            if (t) seg(grp, t === 2 ? mRed : mPlat, (s0 + k) % CFG.SEG, n);
            k += n;
          }
        }
        let mover = null;
        if (p.mover) { mover = seg(grp, mRed, 0, 1); mover.scale.y = 1.25; mover.position.y = .05; }
        tower.add(grp);
        return { grp, mover, splats: [], broken: false, bt: 0 };
      }
      function clearScene() {
        for (const m of meshes) tower.remove(m.grp);
        for (const d of debris) tower.remove(d.grp);
        meshes = []; debris.length = 0; fxN = 0; fxMesh.count = 0;
        for (const t of trail) { t.life = 0; t.m.visible = false; }
      }
      function build(L) {
        clearScene();
        level = L; pal = PAL[(L - 1) % PAL.length];
        st.style.setProperty('--top', pal.top); st.style.setProperty('--bot', pal.bot); st.style.setProperty('--ball', pal.ball);
        mPole.color.copy(lin(pal.pole)); mPlat.color.copy(lin(pal.plat)); mBall.color.copy(lin(pal.ball)); mSplat.color.copy(mBall.color); mTrail.color.copy(mBall.color);
        mCollar.color.copy(lin(pal.pole)).lerp(lin(pal.plat), .22);
        mRim.uniforms.uColor.value.setRGB(1, 1, 1);
        bubTint.copy(lin(pal.ball)).lerp(white, .45);
        cBall.copy(mBall.color); cPlat.copy(mPlat.color);
        rings = layout(L); meshes = rings.map(buildRingMesh);
        const finY = rings[rings.length - 1].y, top = CFG.GAP * 1.6, bot = finY - 1.4;
        pole.scale.y = top - bot; pole.position.y = (top + bot) / 2;
        poleTex.repeat.set(1, (top - bot) / 1.6); poleTex.needsUpdate = true;
        collars.count = rings.length;
        for (let i = 0; i < rings.length; i++) { tmpO.position.set(0, rings[i].y, 0); tmpO.rotation.set(0, 0, 0); tmpO.scale.set(1, 1, 1); tmpO.updateMatrix(); collars.setMatrixAt(i, tmpO.matrix); }
        collars.instanceMatrix.needsUpdate = true;
        s.by = CFG.BR + 1.5; s.vy = 0; s.next = 0; s.streak = 0; s.rot = 0; tower.rotation.y = 0;
        camY = camT = CFG.BR; prog = -1; lt = 0; acc = 0; squash = 0; shake = 0; contUsed = false; levelStart = score;
        elA.textContent = L; elB.textContent = L + 1; elBar.style.width = '0%';
        mBall.emissive.setRGB(0, 0, 0);
      }
      function pop(text, x, y, cls) {
        const el = document.createElement('div');
        el.className = 'pop' + (cls ? ' ' + cls : ''); el.textContent = text;
        el.style.left = x + '%'; el.style.top = y + '%'; st.append(el);
        el.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 }, { transform: 'translate(-50%,-110%) scale(1.15)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-260%) scale(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => el.remove();
      }
      const v3 = new THREE.Vector3();
      const ballScreen = () => { v3.copy(ball.position).project(cam); return [(v3.x + 1) * 50, (1 - v3.y) * 50]; };
      function setScore(v) { score = v; api.score(score); elSc.textContent = score; }
      function shatter(i, power) {
        const m = meshes[i]; m.broken = true; m.bt = 0;
        for (const c of m.grp.children) {
          const a = c.userData.mid != null ? c.userData.mid : Math.random() * TAU, sp = power * (2.4 + Math.random() * 2.6);
          c.userData.v = [Math.cos(a) * sp, power * (1.5 + Math.random() * 3), -Math.sin(a) * sp];
          c.userData.sv = (Math.random() - .5) * 3; c.userData.k = c.scale.x; c.userData.ky = c.scale.y;
        }
        debris.push(m);
      }
      function splat(i, local, big) {
        const m = meshes[i], d = new THREE.Mesh(splatGeos[(Math.random() * 3) | 0], mSplat);
        d.rotation.set(-Math.PI / 2, 0, Math.random() * TAU);
        d.scale.setScalar((big ? 1.5 : 1) * (.8 + Math.random() * .4));
        d.position.set(CFG.BZ * Math.cos(local), .012, -CFG.BZ * Math.sin(local));
        d.userData.mid = local;
        m.grp.add(d); m.splats.push(d);
        if (m.splats.length > 6) m.grp.remove(m.splats.shift());
      }
      function onEvent(e) {
        const i = rings.indexOf(e.p);
        if (e.type === 'pass') {
          const pts = level * s.streak;
          setScore(score + pts);
          shatter(i, 1);
          const [x, y] = ballScreen();
          pop('+' + pts, x + 14, y - 4);
          if (s.streak >= 2) pop('x' + s.streak, x - 14, y - 10, 'x');
          sfx('pass', s.streak);
          if (s.streak === CFG.FIRE) sfx('fire');
        } else if (e.type === 'smash') {
          const pts = level * (CFG.FIRE + 1);
          setScore(score + pts);
          shatter(i, 1.8);
          burst(e.p.y + .1, 22, cPlat, 6, .14, 1.4);
          for (let k = 0; k < 16; k++) burst(e.p.y + .1, 1, cFire[k % 4], 5, .1, 1.6);
          shake = .35; squash = 1;
          const [x, y] = ballScreen(); pop('+' + pts, x + 12, y - 6);
          sfx('smash');
        } else if (e.type === 'bounce') {
          squash = 1; splat(i, e.local, false);
          burst(e.p.y + .05, 6, cBall, 2.4, .07, .8);
          sfx('bounce');
        } else if (e.type === 'die') {
          state = 'dying'; dieT = 0; squash = 1; deathP = i;
          splat(i, e.local, true);
          burst(e.p.y + .1, 26, cBall, 4.5, .1, 1.2);
          shake = .5;
          elFlash.style.background = '#ff2d55';
          elFlash.animate([{ opacity: .45 }, { opacity: 0 }], { duration: 500, easing: 'ease-out' });
          sfx('die');
        } else if (e.type === 'finish') {
          state = 'clear'; clearT = 0; squash = 1;
          const bonus = level * 10;
          setScore(score + bonus);
          for (let k = 0; k < 90; k++) { const a = Math.random() * TAU, sp = 2 + Math.random() * 4.5; emit(Math.cos(a) * 1.2, e.p.y + .3, Math.sin(a) * 1.2 + .5, Math.cos(a) * sp, 6 + Math.random() * 7, Math.sin(a) * sp, .09 + Math.random() * .07, 1.2 + Math.random() * .6, cConf[k % cConf.length], .55); }
          splat(i, e.local, true);
          elFlash.style.background = '#fff';
          elFlash.animate([{ opacity: .6 }, { opacity: 0 }], { duration: 600, easing: 'ease-out' });
          sfx('win');
          $('.k-lv').textContent = 'Level ' + level; $('.k-sc').textContent = score; $('.k-bn').textContent = '+' + bonus;
          level++; persist();
          api.timeout(() => { if (state === 'clear') showP('clear'); }, 900);
        }
      }
      function startPlay() {
        showP(null); elHud.hidden = false; state = 'play';
      }
      function newRun() {
        setScore(0); submitted = false;
        build(level); startPlay();
      }
      function nextLevel() { build(level); startPlay(); }
      function offerContinue() {
        if (contUsed) return gameOver();
        state = 'cont'; contT = CFG.CONT_T; showP('cont'); lastTickN = 99;
      }
      let lastTickN = 99;
      function doContinue() {
        contUsed = true;
        const i = deathP;
        if (i != null && meshes[i] && !meshes[i].broken) { shatter(i, 1.4); s.next = i + 1; }
        s.vy = CFG.BOUNCE * .6; s.streak = 0;
        state = 'play'; showP(null);
      }
      function gameOver() {
        state = 'over';
        let nb = false;
        if (!submitted) { submitted = true; nb = api.submit(score); }
        const pc = Math.round(clamp(s.next / (rings.length - 1), 0, 1) * 100);
        $('.o-lv').textContent = 'Level ' + level; $('.o-pc').textContent = pc + '% completed';
        $('.o-sc').textContent = score; $('.o-bs').textContent = api.best ?? score;
        $('.o-nb').hidden = !nb;
        showP('over');
      }
      function primary() {
        if (performance.now() - panelAt < 450) return;
        if (state === 'menu') newRun();
        else if (state === 'over') newRun();
        else if (state === 'clear' && !P.clear.hidden) nextLevel();
        else if (state === 'cont') doContinue();
      }
      function showMenu() {
        state = 'menu'; elHud.hidden = true;
        build(level);
        $('.m-lv').textContent = 'Level ' + level;
        $('.m-best').textContent = api.best != null ? 'Best score ' + api.best : 'Spin the tower, fall through the gaps';
        $('.m-reset').hidden = level <= 1;
        showP('menu');
      }
      $('.c-yes').addEventListener('pointerdown', e => { e.stopPropagation(); if (state === 'cont') doContinue(); });
      $('.c-no').addEventListener('pointerdown', e => { e.stopPropagation(); if (state === 'cont') gameOver(); });
      $('.m-reset').addEventListener('pointerdown', e => { e.stopPropagation(); level = 1; persist(); showMenu(); });

      api.on(st, 'pointerdown', e => {
        au();
        if (state === 'menu') { panelAt = 0; newRun(); }
        else if (state === 'over' || (state === 'clear' && !P.clear.hidden)) { primary(); return; }
        if (state !== 'play') return;
        drag = e.pointerId; lastX = e.clientX;
        try { st.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      api.on(st, 'pointermove', e => {
        if (e.pointerId !== drag || state !== 'play') return;
        const w = st.getBoundingClientRect().width || 1;
        s.rot += (e.clientX - lastX) / w * CFG.DRAG; lastX = e.clientX;
        tower.rotation.y = s.rot;
      });
      const endDrag = e => { if (e.pointerId === drag) drag = null; };
      api.on(st, 'pointerup', endDrag); api.on(st, 'pointercancel', endDrag);
      api.on(window, 'keydown', e => {
        au();
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'KeyA' || e.code === 'KeyD') { if (state === 'menu') newRun(); return; }
        if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); if (state === 'menu') newRun(); else primary(); return; }
        if (state === 'menu' && !e.repeat && e.key && e.key.length === 1) newRun();
      });

      const STEP = 1 / CFG.HZ, fireOn = () => s.streak >= CFG.FIRE && state === 'play';
      api.loop(dt => {
        if (state === 'play') {
          const k = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
          if (k) { s.rot += k * CFG.KEY_ROT * dt; tower.rotation.y = s.rot; }
          acc += dt;
          while (acc >= STEP && state === 'play') { acc -= STEP; lt += STEP; const e = physStep(s, rings, STEP, lt); if (e) onEvent(e); }
        } else if (state === 'menu') {
          lt += dt; s.vy = Math.max(s.vy - CFG.G * dt, -CFG.VMAX); s.by += s.vy * dt;
          if (s.by <= CFG.BR) { s.by = CFG.BR; s.vy = CFG.BOUNCE; squash = 1; }
          s.rot += dt * .4; tower.rotation.y = s.rot;
        } else lt += dt * (state === 'clear' ? 1 : 0);
        if (state === 'dying') { dieT += dt; if (dieT > .9) offerContinue(); }
        if (state === 'cont') {
          contT -= dt;
          const n = Math.max(0, Math.ceil(contT));
          if (n !== lastTickN) { lastTickN = n; $('.c-n').textContent = n; if (n > 0) sfx('tick'); }
          $('.c-arc').style.strokeDashoffset = (276.5 * (1 - contT / CFG.CONT_T)).toFixed(1);
          if (contT <= 0) gameOver();
        }
        if (state === 'clear') clearT += dt;

        for (let i = 0; i < rings.length; i++) {
          const p = rings[i], m = meshes[i];
          if (!m || m.broken) continue;
          m.grp.visible = i >= s.next - 1 && i <= s.next + 7;
          if (!m.grp.visible) continue;
          if (p.spin || p.osc) m.grp.rotation.y = ringRot(p, lt);
          if (m.mover) { const a = moverAng(p.mover, lt); m.mover.rotation.y = a - SLOT / 2; m.mover.userData.mid = a; }
        }
        for (let i = debris.length - 1; i >= 0; i--) {
          const m = debris[i]; m.bt += dt;
          const k = Math.max(.001, 1 - Math.max(0, m.bt - .2) * 2.2);
          for (const c of m.grp.children) {
            const vv = c.userData.v; if (!vv) continue;
            vv[1] -= 22 * dt; c.position.x += vv[0] * dt; c.position.y += vv[1] * dt; c.position.z += vv[2] * dt;
            c.rotation.y += c.userData.sv * dt; c.rotation.x += c.userData.sv * .5 * dt;
            c.scale.set(c.userData.k * k, (c.userData.ky || 1) * k, c.userData.k * k);
          }
          if (m.bt > .7) { tower.remove(m.grp); debris.splice(i, 1); }
        }

        const fire = fireOn();
        if (fire) {
          mBall.emissive.copy(cFire[2]).multiplyScalar(.7 + .3 * Math.sin(lt * 30));
          for (let i = 0; i < 3; i++) emit((Math.random() - .5) * .3, s.by + (Math.random() - .2) * .3, CFG.BZ + (Math.random() - .5) * .3, (Math.random() - .5) * 1.5, 2 + Math.random() * 3, (Math.random() - .5) * 1.5, .07 + Math.random() * .09, .3 + Math.random() * .25, cFire[(Math.random() * 4) | 0], -.4);
          mRim.uniforms.uColor.value.copy(cFire[1]); mRim.uniforms.uK.value = 1.2;
        } else {
          if (state !== 'dying') mBall.emissive.setRGB(0, 0, 0);
          mRim.uniforms.uColor.value.setRGB(1, 1, 1); mRim.uniforms.uK.value = .75;
        }
        mRed.emissive.setRGB(.2 + .14 * Math.sin(lt * 6), .01, .03);
        for (let i = 0; i < BUBN; i++) {
          const b = BUB[i], yy = camY + (((b.y - camY * .78) % BUBH) + BUBH) % BUBH - BUBH * .5 - 2;
          tmpO.position.set(b.x + Math.sin(lt * b.w + b.p) * .5, yy, b.z); tmpO.rotation.set(0, 0, 0); tmpO.scale.setScalar(b.s); tmpO.updateMatrix();
          bubMesh.setMatrixAt(i, tmpO.matrix); bubMesh.setColorAt(i, b.tint ? bubTint : white);
        }
        bubMesh.instanceMatrix.needsUpdate = true; if (bubMesh.instanceColor) bubMesh.instanceColor.needsUpdate = true;
        trailT -= dt;
        if (state === 'play' && s.vy < -CFG.BOUNCE * .7 && trailT <= 0) {
          trailT = .025;
          const t = trail.find(q => q.life <= 0) || trail[0];
          t.life = .22; t.m.visible = true; t.m.position.set(0, s.by + CFG.BR * .3, CFG.BZ);
        }
        for (const t of trail) { if (t.life > 0) { t.life -= dt; const k = Math.max(.01, t.life / .22) * .85; t.m.scale.set(k, k * (.7 + 1.1 * clamp(-s.vy / CFG.VMAX, 0, 1)), k); if (t.life <= 0) t.m.visible = false; } }

        if (state !== 'dying' && state !== 'cont') squash = Math.max(0, squash - dt * 5);
        const sq = state === 'dying' || state === 'cont' ? .8 : Math.sin(squash * Math.PI * .5), str = clamp(-s.vy / CFG.VMAX, 0, 1) * .22;
        ball.scale.set((1 + .3 * sq) * (1 - str * .45), (1 - .4 * sq) * (1 + str), (1 + .3 * sq) * (1 - str * .45));
        ball.position.y = s.by - CFG.BR * .4 * sq;

        if (state === 'play' || state === 'menu') camT = Math.min(camT, s.by);
        camY = Math.min(camY + (camT - camY) * (1 - Math.exp(-9 * dt)), camT + 1.2);
        shake *= Math.exp(-7 * dt);
        cam.position.set((Math.random() - .5) * shake, camY + 5.4 + (Math.random() - .5) * shake, 9.6);
        cam.lookAt(0, camY - .9, 0);
        sun.position.set(-2.5, camY + 9, 5); sun.target.position.set(0, camY - 2, 0);

        if (state !== 'menu' && rings.length) {
          const pr = Math.round(clamp(s.next / (rings.length - 1), 0, 1) * 100);
          if (pr !== prog) { prog = pr; elBar.style.width = pr + '%'; }
        }
        fxUpdate(dt);
        renderer.render(scene, cam);
      });

      root.__hx = { get state() { return state; }, s, get rings() { return rings; }, get level() { return level; }, set level(v) { level = v; }, get score() { return score; }, slotAt: (p, t) => slotAt(p, s.rot, t), get lt() { return lt; }, build, showMenu };
      showMenu();
      api.score(0);
      return {
        destroy() {
          clearScene();
          for (const o of bin) { try { o.dispose(); } catch (e) {} }
          if (ac) { try { ac.close(); } catch (e) {} ac = null; }
          delete root.__hx;
        }
      };
    }
  });

  const COVER = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hxc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa8cc"/><stop offset="1" stop-color="#fff0f6"/></linearGradient><linearGradient id="hxc-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8dccf"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#d9cbbd"/></linearGradient><radialGradient id="hxc-ball" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffe680"/><stop offset=".55" stop-color="#ffc23a"/><stop offset="1" stop-color="#e08a00"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#hxc-bg)"/>
<rect x="176" y="0" width="48" height="300" fill="url(#hxc-pole)"/>
<g>
<path d="M60 70a140 34 0 0 0 280 0v14a140 34 0 0 1-280 0z" fill="#5a4ad8"/>
<path d="M60 70a140 34 0 0 1 140-34 140 34 0 0 1 140 34 140 34 0 0 1-140 34 140 34 0 0 1-140-34z" fill="#8a78ff"/>
<path d="M200 70l-70 28a140 34 0 0 1-70-28 140 34 0 0 1 22-18z" fill="#ffa8cc"/>
<path d="M200 70l118-18a140 34 0 0 1 22 18 140 34 0 0 1-28 21z" fill="#ec2440"/>
<ellipse cx="200" cy="70" rx="24" ry="6" fill="url(#hxc-pole)"/>
</g>
<g>
<path d="M60 170a140 34 0 0 0 280 0v14a140 34 0 0 1-280 0z" fill="#5a4ad8"/>
<path d="M60 170a140 34 0 0 1 140-34 140 34 0 0 1 140 34 140 34 0 0 1-140 34 140 34 0 0 1-140-34z" fill="#8a78ff"/>
<path d="M200 170l40 33a140 34 0 0 1-110-5z" fill="#ffd0e2"/>
<path d="M200 170l-118-18a140 34 0 0 0-22 18 140 34 0 0 0 30 22z" fill="#ec2440"/>
<ellipse cx="200" cy="170" rx="24" ry="6" fill="url(#hxc-pole)"/>
</g>
<g fill="#ffc23a"><path d="M228 182c10-6 24-4 26 4 10 2 10 12 0 14-4 8-20 6-22-2-10 0-12-12-4-16z"/><circle cx="262" cy="178" r="4"/><circle cx="220" cy="198" r="3"/></g>
<g fill="#ffffff" opacity=".9"><path d="M296 128l18-6-4 12z"/><path d="M110 120l-16-10 18 2z"/><path d="M286 104l14 4-12 6z"/></g>
<g opacity=".35" fill="#ffc23a"><circle cx="232" cy="96" r="14"/><circle cx="232" cy="78" r="11"/><circle cx="232" cy="62" r="8"/></g>
<ellipse cx="236" cy="183" rx="22" ry="6" fill="#5a4ad8" opacity=".35"/>
<circle cx="232" cy="122" r="22" fill="url(#hxc-ball)"/>
<ellipse cx="224" cy="113" rx="7" ry="4" fill="#fff" opacity=".7"/>
<path d="M60 270a140 34 0 0 0 280 0v14a140 34 0 0 1-280 0z" fill="#5a4ad8"/><ellipse cx="200" cy="270" rx="140" ry="34" fill="#8a78ff"/><path d="M200 270l-100 24a140 34 0 0 0 70 9z" fill="#ec2440"/><ellipse cx="200" cy="270" rx="24" ry="6" fill="url(#hxc-pole)"/>
</svg>`;
  Ameplay.covers[ID] = COVER;
  try { Object.defineProperty(Ameplay.covers, ID, { get: () => COVER, set() {}, enumerable: true, configurable: true }); } catch (e) {}
})();

