
  function ensureFont() {
    try {
      if (document.querySelector('link[data-ss-font]')) return;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Lilita+One&display=swap'; l.setAttribute('data-ss-font', '1');
      document.head.append(l);
    } catch (e) {}
  }
  function avatar(P) {
    const c = document.createElement('canvas'); c.width = 120; c.height = 140;
    const g = c.getContext('2d');
    g.fillStyle = P.top; rr(g, 22, 92, 76, 60, 22); g.fill();
    if (P.vest) { g.fillStyle = P.vest; g.fillRect(22, 100, 22, 40); g.fillRect(76, 100, 22, 40); }
    g.fillStyle = P.under; g.fillRect(54, 96, 12, 40);
    g.fillStyle = P.skin; g.beginPath(); g.ellipse(60, 62, 34, 36, 0, 0, TAU); g.fill();
    g.fillStyle = P.hair; g.beginPath(); g.ellipse(60, 44, 34, 20, 0, Math.PI, 0); g.fill();
    if (P.extra === 'pony') { g.beginPath(); g.ellipse(94, 66, 10, 22, 0.3, 0, TAU); g.fill(); }
    g.fillStyle = '#fff'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(60 + s * 13, 62, 8, 10, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#1d1b26'; for (const s of [-1, 1]) { g.beginPath(); g.arc(60 + s * 13, 64, 4.5, 0, TAU); g.fill(); }
    g.strokeStyle = '#7a2a2a'; g.lineWidth = 3; g.beginPath(); g.arc(60, 78, 9, 0.2, Math.PI - 0.2); g.stroke();
    if (P.hat === 'cap') { g.fillStyle = P.hatA; g.beginPath(); g.ellipse(60, 38, 35, 24, 0, Math.PI, 0); g.fill(); g.fillStyle = P.hatB; rr(g, 46, 18, 28, 18, 6); g.fill(); g.fillStyle = P.hatA; rr(g, 30, 34, 62, 9, 4); g.fill(); }
    else if (P.hat === 'beanie') { g.fillStyle = P.hatA; g.beginPath(); g.ellipse(60, 40, 35, 30, 0, Math.PI, 0); g.fill(); g.fillStyle = P.hatB; g.fillRect(25, 34, 70, 10); g.beginPath(); g.arc(60, 9, 8, 0, TAU); g.fill(); }
    else if (P.hat === 'alien') { g.fillStyle = P.hatA; g.beginPath(); g.ellipse(60, 40, 36, 28, 0, Math.PI, 0); g.fill(); g.strokeStyle = P.hatA; g.lineWidth = 3; g.beginPath(); g.moveTo(48, 16); g.lineTo(40, 2); g.moveTo(72, 16); g.lineTo(80, 2); g.stroke(); g.fillStyle = P.hatB; g.beginPath(); g.arc(40, 3, 5, 0, TAU); g.arc(80, 3, 5, 0, TAU); g.fill(); }
    if (P.extra === 'phones') { g.strokeStyle = '#2f2f3a'; g.lineWidth = 6; g.beginPath(); g.arc(60, 100, 26, 0.1, Math.PI - 0.1); g.stroke(); }
    return c;
  }

  Ameplay.register({
    id: ID,
    title: 'Subway Surfers',
    category: '3D',
    tint: '#ffb31a',
    better: 'high',
    width: 960,
    blurb: 'Dash through the subway, surf the trains and outrun the Inspector and his dog.',
    help: '<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> switch lane · <kbd>↑</kbd>/<kbd>W</kbd> jump · <kbd>↓</kbd>/<kbd>S</kbd> roll · <kbd>Space</kbd> hoverboard · <kbd>P</kbd> or <kbd>Esc</kbd> pause · swipe and double-tap on touch',
    ownPause: true,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="10" r="5"/><path d="M37 18l-7 14 8 7v11M30 32l-9 4h-5M26 22l11-4 6 8 8-1"/><path d="M8 60l10-20M56 60L46 40M18 50h28"/></svg>',
    css: CSS,
    core: { CFG, PAT, newWorld, newRun, step, act, gen, collect, cull, revive, givePU, supportAt, speedAt, addTrain, addObs, addBar, addRamp, addCoin, addItem },
    async mount(root, api) {
      ensureFont();
      const portrait = root.clientWidth > 0 && root.clientWidth < 600;
      const VW = portrait ? 600 : 960, VH = portrait ? 900 : 600;
      const v = await api.gl(VW, VH);
      if (!v) return;
      const { THREE, renderer } = v;
      const COARSE = matchMedia('(pointer: coarse)').matches;
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.NoToneMapping;
      let prCap = COARSE ? 1.6 : 2;
      const capPR = () => { if (renderer.getPixelRatio() > prCap + 0.01) renderer.setPixelRatio(prCap); };
      capPR();

      const wrap = document.createElement('div');
      wrap.className = portrait ? 'ss-stage port' : 'ss-stage';
      wrap.style.width = v.canvas.style.width;
      wrap.style.aspectRatio = v.canvas.style.aspectRatio;
      v.canvas.style.width = '100%';
      const setSize0 = renderer.setSize.bind(renderer);
      renderer.setSize = (w, h, u) => {
        const r = setSize0(w, h, u);
        wrap.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
        wrap.style.aspectRatio = `${w} / ${h}`;
        return r;
      };
      root.append(wrap);
      wrap.append(v.canvas);
      wrap.insertAdjacentHTML('beforeend', HTML);
      const q = s => wrap.querySelector(s);
      const E = {
        hud: q('.ss-hud'), sv: q('.ss-sv'), cv: q('.ss-cv'), kv: q('.ss-kv'), keyp: q('.ss-keyp'), mult: q('.ss-mult'), pus: q('.ss-pus'), hb: q('.ss-hb'), hbn: q('.ss-hbn'),
        hint: q('.ss-hint'), near: q('.ss-near'), banner: q('.ss-banner'), big: q('.ss-big'), toast: q('.ss-toast'), pause: q('.ss-pause'),
        home: q('.ss-home'), panel: q('.ss-panel'), ptitle: q('.p-title'), pbody: q('.p-body'), save: q('.ss-save'), over: q('.ss-over'), pausep: q('.ss-pausep'),
        hbest: q('.h-best'), hdaily: q('.ss-daily'), oscore: q('.o-score'), hcoins: q('.h-coins'), hkeys: q('.h-keys'), hboards: q('.h-boards'), hmult: q('.h-mult'), tname: q('.t-name'), tsub: q('.t-sub'),
        sarc: q('.s-arc'), scost: q('.s-cost'), shave: q('.s-have'), sgo: q('.s-go')
      };

      const bin = new Set();
      const keep = x => (bin.add(x), x);
      const T = mkTex(THREE, renderer);
      const toonMap = keep(T.toon());
      const CH = mkChars(THREE, toonMap, bin);

      const loaded = api.load() || {};
      const save = {
        v: 2, coins: loaded.coins | 0, keys: loaded.keys == null ? 2 : loaded.keys | 0, boards: loaded.boards == null ? 3 : loaded.boards | 0,
        upg: Object.assign({ jet: 0, sneak: 0, mag: 0, x2: 0 }, loaded.upg || {}), ms: loaded.ms && loaded.ms.lvl ? loaded.ms : { lvl: 1, base: [0, 0, 0], done: [false, false, false] },
        chars: Array.isArray(loaded.chars) ? loaded.chars : ['jake'], char: loaded.char || 'jake', city: loaded.city | 0, runs: loaded.runs | 0, best: loaded.best | 0,
        mode: MODES.find(m => m.id === loaded.mode) ? loaded.mode : 'classic', mbest: Object.assign({ rush: 0, chill: 0 }, loaded.mbest || {}), how: loaded.how ? 1 : 0, tot: Object.assign({ m: 0, coins: 0, jumps: 0 }, loaded.tot || {}),
        opt: Object.assign({ mus: 1, sfx: 1, q: 'auto', shake: 1 }, loaded.opt || {}), cos: Object.assign({ board: 'classic', trail: 'none', own: [] }, loaded.cos || {}),
        daily: loaded.daily && loaded.daily.day ? loaded.daily : { day: '', g: [], streak: 0, last: '' }
      };
      if (!Array.isArray(save.cos.own)) save.cos.own = [];
      for (const id of ['classic', 'none']) if (!save.cos.own.includes(id)) save.cos.own.push(id);
      if (!BOARDS.find(b => b.id === save.cos.board) || !save.cos.own.includes(save.cos.board)) save.cos.board = 'classic';
      if (!TRAILS.find(b => b.id === save.cos.trail) || !save.cos.own.includes(save.cos.trail)) save.cos.trail = 'none';
      if (!['auto', 'high', 'low'].includes(save.opt.q)) save.opt.q = 'auto';
      if (!Array.isArray(save.daily.g)) save.daily.g = [];
      if (!CHARS.find(c => c.id === save.char)) save.char = 'jake';
      save.city = clamp(save.city, 0, CITIES.length - 1);
      const persist = () => api.save(save);
      const au = mkAudio(api);

      const scene = new THREE.Scene();
      const baseFov = portrait ? 70 : 60, baseAsp = VW / VH;
      const cam = new THREE.PerspectiveCamera(baseFov, baseAsp, 0.1, 520);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
      const sun = new THREE.DirectionalLight(0xffffff, 0.8);
      sun.position.set(-20, 40, 35);
      scene.add(hemi, sun, sun.target);
      scene.fog = new THREE.Fog(0xffffff, 70, 215);

      const blobTex = keep(T.blob());
      const blobMat = keep(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.85 }));
      const blobGeo = keep(new THREE.PlaneGeometry(1, 1)); blobGeo.rotateX(-Math.PI / 2);
      const mkBlob = s => { const m = new THREE.Mesh(blobGeo, blobMat); m.scale.set(s, 1, s * 1.2); m.renderOrder = 1; scene.add(m); return m; };
      const glowTex = { y: keep(T.glow('rgba(255,220,90,.8)')), w: keep(T.glow('rgba(255,255,220,.9)')), p: keep(T.glow('rgba(190,110,255,.8)')), r: keep(T.glow('rgba(255,90,90,.8)')), g: keep(T.glow('rgba(110,255,140,.8)')) };
      const glowMat = k => keep(new THREE.SpriteMaterial({ map: glowTex[k], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      const GM = { y: glowMat('y'), w: glowMat('w'), p: glowMat('p'), r: glowMat('r'), g: glowMat('g') };

      let ENV = null;
      const atlasMat = keep(new THREE.MeshLambertMaterial({ vertexColors: true }));
      const lampMat = keep(new THREE.MeshBasicMaterial({ vertexColors: true }));
      const railMat = keep(new THREE.MeshLambertMaterial({ vertexColors: true }));
      const fenceTex = keep(T.fence());
      const fenceMat = keep(new THREE.MeshLambertMaterial({ map: fenceTex, alphaTest: 0.5, side: THREE.DoubleSide }));
      const trackMat = keep(new THREE.MeshLambertMaterial({ color: 0xffffff }));
      const trackGeo = keep(new THREE.PlaneGeometry(CFG.LANE * 3, 320, 1, 1)); trackGeo.rotateX(-Math.PI / 2); trackGeo.translate(0, 0.005, -140);
      { const ua = trackGeo.attributes.uv.array; for (let i = 1; i < ua.length; i += 2) ua[i] *= 320 / 4; }
      const track = new THREE.Mesh(trackGeo, trackMat); scene.add(track);
      let rails = null;
      const farGeo = keep(new THREE.PlaneGeometry(900, 520)); farGeo.rotateX(-Math.PI / 2);
      const farMat = keep(new THREE.MeshLambertMaterial({ color: 0xffffff }));
      const far = new THREE.Mesh(farGeo, farMat); far.position.y = -0.08; scene.add(far);
      const skyMat = keep(new THREE.MeshBasicMaterial({ transparent: true, fog: false, depthWrite: false }));
      const skyPlane = new THREE.Mesh(keep(new THREE.PlaneGeometry(560, 140)), skyMat); skyPlane.renderOrder = -1; scene.add(skyPlane);
      const sunSprite = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glowTex.w, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending })));
      sunSprite.scale.set(90, 90, 1); scene.add(sunSprite);
      const skyG = T.sky();
      keep(skyG.tex);
      scene.background = skyG.tex;
      const starMat = keep(new THREE.MeshBasicMaterial({ map: keep(T.stars()), transparent: true, fog: false, depthWrite: false, opacity: 0 }));
      const starPlane = new THREE.Mesh(keep(new THREE.PlaneGeometry(820, 205)), starMat); starPlane.renderOrder = -2; starPlane.visible = false; scene.add(starPlane);
      const PAL = PHASES.slice(), dcA = new THREE.Color(), dcB = new THREE.Color();
      let dayI = -1, dayQ = -1, dayHK = 1, daySK = 1, sunY = 150;
      const mix = (a, b, w) => dcA.set(a).lerp(dcB.set(b), w);
      function setDay(i, j, w) {
        const A = PAL[i], B = PAL[j];
        skyG.set('#' + mix(A.sky[0], B.sky[0], w).getHexString(), '#' + mix(A.sky[1], B.sky[1], w).getHexString(), '#' + mix(A.sky[2], B.sky[2], w).getHexString());
        scene.fog.color.copy(mix(A.fog, B.fog, w)).convertSRGBToLinear();
        hemi.color.copy(mix(A.hemi[0], B.hemi[0], w)).convertSRGBToLinear(); hemi.groundColor.copy(mix(A.hemi[1], B.hemi[1], w)).convertSRGBToLinear();
        sun.color.copy(mix(A.sun, B.sun, w)).convertSRGBToLinear();
        skyMat.color.copy(mix(A.line, B.line, w)).convertSRGBToLinear();
        sunSprite.material.color.copy(mix(A.disc, B.disc, w)).convertSRGBToLinear();
        const ds = lerp(A.ds, B.ds, w), st = lerp(A.star, B.star, w);
        sunSprite.scale.set(ds, ds, 1); sunY = lerp(A.dy, B.dy, w);
        starMat.opacity = st; starPlane.visible = st > 0.01;
        dayHK = lerp(A.hk, B.hk, w); daySK = lerp(A.sk, B.sk, w);
        draw = true;
      }
      function dayTick() {
        const u = state === 'home' ? 0 : runT / PHASE_T, i = Math.floor(u) % 4, f = u - Math.floor(u), w = f < 0.7 ? 0 : ease((f - 0.7) / 0.3), qn = Math.round(w * 48);
        if (i === dayI && qn === dayQ) return;
        if (i !== dayI && dayI >= 0 && i > 0 && state === 'run') toast(PAL[i].name);
        dayI = i; dayQ = qn;
        setDay(i, (i + 1) % 4, qn / 48);
      }

      function buildCity(i) {
        if (ENV) { ENV.dispose(); }
        const city = CITIES[i];
        const AT = T.atlas(city);
        const WG = mkWorld(THREE, AT, city);
        const trackTex = T.track(city), skylineTex = T.skyline(city);
        atlasMat.map = AT.tex; atlasMat.needsUpdate = true;
        trackMat.map = trackTex; trackMat.needsUpdate = true;
        skyMat.map = skylineTex; skyMat.needsUpdate = true;
        PAL[0] = { name: 'Day', sky: city.sky, fog: city.fog, hemi: city.hemi, hk: 1, sun: city.sun, sk: 1, line: '#ffffff', disc: '#ffffff', dy: 150, ds: 90, star: 0 };
        dayI = dayQ = -1;
        farMat.color.set(shade(city.walk, -0.12)).convertSRGBToLinear();
        if (rails) scene.remove(rails);
        rails = new THREE.Mesh(WG.rails, railMat); scene.add(rails);
        ENV = { city, AT, WG, light: city.light, dispose() { AT.tex.dispose(); trackTex.dispose(); skylineTex.dispose(); WG.bin.forEach(g => g.dispose()); } };
        clearChunks(); clearObsMeshes();
      }

      const pool = [], sprPool = [], arrPool = [], gantries = [];
      function take(geo, mat, x, y, z, dz) {
        let m = pool.pop();
        if (!m) { m = new THREE.Mesh(geo, mat); m.matrixAutoUpdate = false; scene.add(m); }
        else { m.geometry = geo; m.material = mat; m.visible = true; }
        m.position.set(x, y, z); m.updateMatrix(); m.userData.dz = dz || 0;
        return m;
      }
      function give(m) { m.visible = false; pool.push(m); }
      const chunks = new Map();
      let ci0 = 1, ci1 = 0;
      function dropChunk(arr) { for (let k = 0; k < arr.length; k++) give(arr[k]); arr.length = 0; arrPool.push(arr); }
      function clearChunks() { chunks.forEach(dropChunk); chunks.clear(); gantries.length = 0; ci0 = 1; ci1 = 0; }
      function chunkKind(i, side) { if (i >= -2 && i <= 0) return side < 0 ? 4 : 1; const h = hash(Math.floor(i / 2) * 7.31 + side * 13.7 + save.city * 3.3); return h < 0.36 ? 4 : h < 0.55 ? 0 : h < 0.72 ? 1 : h < 0.84 ? 2 : 3; }
      function makeChunk(i) {
        const arr = arrPool.pop() || [], s0 = i * CFG.CHUNK, z = -s0, WG = ENV.WG;
        const tun = inTunnel(W, s0);
        if (tun) { arr.push(take(WG.tunnel, atlasMat, 0, 0, z), take(WG.tunnelLamp, lampMat, 0, 0, z)); if (s0 === tun.s0) arr.push(take(WG.portal, atlasMat, 0, 0, z)); }
        else {
          const kl = chunkKind(i, -1) * 2 + (i & 1), kr = chunkKind(i, 1) * 2 + ((i >> 1) & 1);
          const L = WG.side.L[kl], Rr = WG.side.R[kr];
          arr.push(take(L.geo, atlasMat, 0, 0, z)); if (L.fence) arr.push(take(L.fence, fenceMat, 0, 0, z));
          arr.push(take(Rr.geo, atlasMat, 0, 0, z)); if (Rr.fence) arr.push(take(Rr.fence, fenceMat, 0, 0, z));
          if (((i % 3) + 3) % 3 === 1) { const ga = take(WG.gantry, atlasMat, 0, 0, z - 20), gb = take(WG.gantryLamp, lampMat, 0, 0, z - 20); arr.push(ga, gb); gantries.push(ga, gb); }
          arr.push(take(WG.wires, atlasMat, 0, 0, z));
        }
        return arr;
      }
      function syncChunks(s) {
        const i0 = Math.floor((s - 50) / CFG.CHUNK), i1 = Math.floor((s + 215) / CFG.CHUNK);
        if (i0 === ci0 && i1 === ci1) return;
        ci0 = i0; ci1 = i1;
        chunks.forEach((arr, i) => { if (i < i0 || i > i1) { for (let k = 0; k < arr.length; k++) { const g = gantries.indexOf(arr[k]); if (g >= 0) gantries.splice(g, 1); } dropChunk(arr); chunks.delete(i); } });
        for (let i = i0; i <= i1; i++) if (!chunks.has(i)) chunks.set(i, makeChunk(i));
      }

      function obsMesh(o) {
        const WG = ENV.WG, x = LX(o.lane), z = -o.s0, a = o.mesh = arrPool.pop() || [], CL = CFG.CAR + CFG.CGAP;
        if (o.k === 'train') {
          for (let c = 0; c < o.cars; c++) a.push(take(c === 0 ? (o.moving ? WG.car.lit[o.liv] : WG.car.front[o.liv]) : WG.car.mid[o.liv], atlasMat, x, 0, z - c * CL, -c * CL));
          if (o.moving) for (let k = -1; k <= 1; k += 2) {
            let sp = sprPool.pop();
            if (!sp) { sp = new THREE.Sprite(GM.w); sp.scale.set(2.2, 2.2, 1); sp.userData.dz = 0.25; scene.add(sp); }
            sp.visible = true; sp.userData.dx = k * 0.73; sp.position.set(x + k * 0.73, 1.0, z + 0.25); a.push(sp);
          }
        } else if (o.k === 'ramp') a.push(take(WG.ramp, atlasMat, x, 0, z));
        else if (o.k === 'low') a.push(take(WG.low, atlasMat, x, 0, z - CFG.BAR_D));
        else a.push(take(WG.high, atlasMat, x, 0, z - CFG.BAR_D), take(WG.highLamp, lampMat, x, 0, z - CFG.BAR_D));
      }
      const itemPool = {};
      function dropMesh(o) {
        const a = o.mesh;
        if (!a) return;
        o.mesh = null;
        if (a.isGroup) { a.visible = false; itemPool[a.userData.k].push(a); return; }
        for (let i = 0; i < a.length; i++) { const m = a[i]; if (m.isSprite) { m.visible = false; sprPool.push(m); } else give(m); }
        a.length = 0; arrPool.push(a);
      }
      function clearObsMeshes() { if (W) { for (const o of W.obs) dropMesh(o); for (const it of W.items) dropMesh(it); } }

      const coinGeo = keep(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24)); coinGeo.rotateX(Math.PI / 2);
      const coinFace = keep(T.coin());
      const coinMats = [keep(new THREE.MeshLambertMaterial({ color: new THREE.Color('#ffb31a').convertSRGBToLinear(), emissive: new THREE.Color('#5a3200') })), keep(new THREE.MeshLambertMaterial({ map: coinFace, emissive: new THREE.Color('#3a2400') })), keep(new THREE.MeshLambertMaterial({ map: coinFace, emissive: new THREE.Color('#3a2400') }))];
      const MAXC = 480;
      const coinIM = new THREE.InstancedMesh(coinGeo, coinMats, MAXC); coinIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); coinIM.frustumCulled = false; coinIM.count = 0; scene.add(coinIM);
      { const M = coinIM.instanceMatrix.array; for (let i = 0; i < MAXC; i++) { M[i * 16 + 5] = 1; M[i * 16 + 15] = 1; } }

      const sparks = [];
      for (let i = 0; i < 14; i++) { const sp = new THREE.Sprite(GM.y); sp.visible = false; sp.userData.t = 0; scene.add(sp); sparks.push(sp); }
      let sparkI = 0;
      function spark(x, y, z, k, s) { const sp = sparks[sparkI++ % sparks.length]; sp.material = GM[k || 'y']; sp.position.set(x, y, z); sp.visible = true; sp.userData.t = 0; sp.userData.s = s || 1.4; }

      const deb = [], debGeo = keep(new THREE.BoxGeometry(0.3, 0.08, 0.45)), debMats = ['#ff4fa3', '#ffd23f', '#3ad1ff'].map(c => keep(new THREE.MeshLambertMaterial({ color: new THREE.Color(c).convertSRGBToLinear(), emissive: new THREE.Color(c).multiplyScalar(0.25) })));
      for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(debGeo, debMats[i % 3]); m.visible = false; scene.add(m); deb.push({ m, v: new THREE.Vector3(), w: new THREE.Vector3(), t: 0 }); }
      const ring = new THREE.Mesh(keep(new THREE.RingGeometry(0.85, 1, 40)), keep(new THREE.MeshBasicMaterial({ color: 0x9afcff, transparent: true, depthWrite: false, side: THREE.DoubleSide })));
      ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
      let ringT = 9;
      function boardBreak(x, y, z) {
        for (const d of deb) { d.m.position.set(x + rnd(-0.3, 0.3), y + 0.3, z + rnd(-0.3, 0.3)); d.v.set(rnd(-4.5, 4.5), rnd(3, 7.5), rnd(-6, 2)); d.w.set(rnd(-10, 10), rnd(-10, 10), rnd(-10, 10)); d.t = 0; d.m.scale.setScalar(rnd(0.7, 1.5)); d.m.visible = true; }
        ringT = 0; ring.position.set(x, y + 0.1, z);
      }
      function updBreak(dt) {
        for (const d of deb) if (d.m.visible) { d.t += dt; d.v.y -= 22 * dt; d.m.position.addScaledVector(d.v, dt); d.m.rotation.x += d.w.x * dt; d.m.rotation.y += d.w.y * dt; d.m.rotation.z += d.w.z * dt; if (d.t > 1.0 || d.m.position.y < -0.2) d.m.visible = false; }
        if (ringT < 0.55) { ringT += dt; const k = ringT / 0.55; ring.visible = true; ring.scale.setScalar(1 + k * 11); ring.material.opacity = 1 - k; } else ring.visible = false;
      }

      const itemModel = k => {
        const g = new THREE.Group(), M = CH.M, m = CH.mesh, rb = CH.rbox, cy = CH.cyl;
        if (k === 'jet') { for (const s of [-1, 1]) { m(cy(0.17, 0.17, 0.62, 12), M('#7cd23a'), s * 0.2, 0.31, 0, g); m(CH.ball(0.17, 10), M('#ff8a1a'), s * 0.2, 0.33, 0, g); m(cy(0.1, 0.15, 0.14, 10), M('#c9ccd2'), s * 0.2, -0.31, 0, g); } m(rb(0.18, 0.5, 0.12), M('#ffd23f'), 0, 0.05, 0, g); }
        else if (k === 'sneak') { m(rb(0.36, 0.26, 0.7, 0.5), M('#ff9a1a'), 0, 0.05, 0, g); m(rb(0.4, 0.12, 0.76, 0.5), M('#ffcf3a'), 0, -0.11, 0, g); m(rb(0.32, 0.36, 0.32, 0.5), M('#ff8a12'), 0, 0.24, 0.18, g); m(rb(0.2, 0.08, 0.26, 0.5), M('#7cd23a'), 0, 0.2, -0.1, g); for (const s of [-1, 1]) { m(rb(0.04, 0.16, 0.08, 0.5), M('#9cff6a', { emissive: new THREE.Color('#2a6a10') }), s * 0.19, 0.22, 0.18, g); m(rb(0.04, 0.08, 0.16, 0.5), M('#9cff6a', { emissive: new THREE.Color('#2a6a10') }), s * 0.19, 0.32, 0.18, g); } }
        else if (k === 'mag') { const t = new THREE.Mesh(CH.G('magT', () => new THREE.TorusGeometry(0.32, 0.12, 8, 18, Math.PI)), M('#e8343a')); t.rotation.z = Math.PI; g.add(t); for (const s of [-1, 1]) { m(cy(0.12, 0.12, 0.26, 10), M('#e8343a'), s * 0.32, 0.26, 0, g); m(cy(0.125, 0.125, 0.16, 10), M('#ffd23f'), s * 0.32, 0.4, 0, g); } g.position.y = 0; }
        else if (k === 'x2') { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 : 0.5; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const ge = CH.G('star', () => { const e = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 }); e.translate(0, 0, -0.08); return e; }); g.add(new THREE.Mesh(ge, M('#ffc21a'))); const lt = keep(T.label('2X', '#ffffff', null, 128, 64, 52)); const pl = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.62, 0.31)), keep(new THREE.MeshBasicMaterial({ map: lt, transparent: true }))); pl.position.z = 0.15; g.add(pl); const pl2 = pl.clone(); pl2.rotation.y = Math.PI; pl2.position.z = -0.15; g.add(pl2); }
        else if (k === 'key') { const t = new THREE.Mesh(CH.G('keyT', () => new THREE.TorusGeometry(0.17, 0.06, 8, 16)), M('#ff3d3d')); t.position.y = 0.25; g.add(t); m(cy(0.055, 0.055, 0.5, 8), M('#ff3d3d'), 0, 0.1, 0, g); m(rb(0.16, 0.07, 0.06), M('#ff3d3d'), 0.08, -0.28, 0, g); m(rb(0.12, 0.07, 0.06), M('#ff3d3d'), 0.06, -0.16, 0, g); }
        else if (k === 'mbox') { const lt = keep(T.label('?', '#ffd23f', '#8a2fe8', 128, 128, 96)); g.add(new THREE.Mesh(CH.G('mbox', () => new THREE.BoxGeometry(0.75, 0.75, 0.75)), keep(new THREE.MeshLambertMaterial({ map: lt })))); }
        return g;
      };
      const ITEM_GLOW = { jet: 'g', sneak: 'y', mag: 'r', x2: 'y', key: 'r', mbox: 'p' };
      function itemMesh(it) {
        const p = itemPool[it.k] || (itemPool[it.k] = []);
        let g = p.pop();
        if (!g) { g = new THREE.Group(); const im = itemModel(it.k); CH.bake(im, []); g.add(im); const sp = new THREE.Sprite(GM[ITEM_GLOW[it.k]]); sp.scale.set(2.1, 2.1, 1); g.add(sp); g.userData.k = it.k; scene.add(g); }
        g.visible = true; g.position.set(it.x, it.y, -it.s); it.mesh = g;
      }
      for (const k in ITEM_GLOW) { const it = { k, x: 0, y: -50, s: 0, mesh: null }; itemMesh(it); dropMesh(it); }

      const patchGeo = keep(new THREE.PlaneGeometry(0.4, 0.34)), patchMat = keep(new THREE.MeshLambertMaterial({ map: keep(T.patch()), transparent: true, alphaTest: 0.3 }));
      let hero = null, heroBlob = mkBlob(1.0);
      function buildHero() {
        if (hero) { scene.remove(hero.root); for (const g of hero.geos) g.dispose(); }
        const P = CHARS.find(c => c.id === save.char) || CHARS[0];
        hero = CH.hero(P, (BOARDS.find(b => b.id === save.cos.board) || BOARDS[0]).c);
        draw = true;
        if (P.vest) { const pm = new THREE.Mesh(patchGeo, patchMat); pm.position.set(0, P.id === 'jake' ? 0.3 : 0.33, P.id === 'jake' ? 0.405 : 0.212); P.id === 'jake' ? pm.scale.setScalar(1.2) : 0; hero.torso.add(pm); }
        hero.root.scale.setScalar(1.15); scene.add(hero.root);
      }
      const TRN = 30, trP = new Float32Array(TRN * 3), trC = new Float32Array(TRN * 3), trV = new Float32Array(TRN * 3), trB = new Float32Array(TRN * 3), trL = new Float32Array(TRN);
      const trailGeo = keep(new THREE.BufferGeometry());
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trP, 3).setUsage(THREE.DynamicDrawUsage)); trailGeo.setAttribute('color', new THREE.BufferAttribute(trC, 3).setUsage(THREE.DynamicDrawUsage));
      const trail = new THREE.Points(trailGeo, keep(new THREE.PointsMaterial({ map: glowTex.w, size: 0.85, sizeAttenuation: true, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
      trail.frustumCulled = false; trail.visible = false; scene.add(trail);
      let trailC = null, trI = 0, trT = 0;
      function setTrail() {
        const t = TRAILS.find(x => x.id === save.cos.trail);
        trailC = t && t.c ? t.c.map(h => new THREE.Color(h).convertSRGBToLinear()) : null;
        trL.fill(0); trC.fill(0); trail.visible = false; trailGeo.attributes.color.needsUpdate = true;
      }
      function updTrail(dt) {
        if (!trailC) return;
        if (state === 'run' && !R.dead && dt > 0 && (R.grounded || R.board > 0 || R.jet > 0)) {
          trT -= dt;
          while (trT <= 0) {
            trT += 0.034;
            const i = trI++ % TRN, k = i * 3, c = trailC[i & 1];
            trP[k] = V.x + rnd(-0.28, 0.28); trP[k + 1] = V.y + rnd(0.1, 0.55); trP[k + 2] = -V.s + rnd(0.2, 0.7);
            trV[k] = rnd(-0.7, 0.7); trV[k + 1] = rnd(0.4, 1.7); trV[k + 2] = rnd(1.5, 4.5);
            trB[k] = c.r; trB[k + 1] = c.g; trB[k + 2] = c.b; trL[i] = 1;
          }
        }
        let any = false;
        for (let i = 0; i < TRN; i++) {
          if (trL[i] <= 0) continue;
          const k = i * 3, l = trL[i] = Math.max(0, trL[i] - dt * 2.4);
          trP[k] += trV[k] * dt; trP[k + 1] += trV[k + 1] * dt; trP[k + 2] += trV[k + 2] * dt;
          trC[k] = trB[k] * l; trC[k + 1] = trB[k + 1] * l; trC[k + 2] = trB[k + 2] * l;
          any = true;
        }
        if (any || trail.visible) { trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true; }
        trail.visible = any;
      }
      const guard = CH.guard(), dog = CH.dog();
      scene.add(guard.root, dog.root);
      const gBlob = mkBlob(1.3), dBlob = mkBlob(0.9);

      let W = null, R = null, state = 'home', acc = 0, introT = 0, saveT = 0, countT = 0, countN = 0, pausedFrom = 'run', hudScore = -1, hudCoins = -1, hudMult = -1, hudT = 0, apiT = 0, msT = 0, cullT = 0, tunK = 0, shake = 0, draw = true, panelOn = false, banked = true;
      let gd = 30, gx = 0, gy = 0, dgx = 0, homeT = 0, sprayT = 0, leanZ = 0, prevX = 0, airW = 0, bannerT = 0, bigT = 0, toastT = 0, nearT = 0, hintI = 0, msnap = null, saveCost = 1, runKeys = 0, runBonus = 0, runT = 0, rollT = 9, rollSc = 0, trackS = NaN, fovK = 0;
      const camP = new THREE.Vector3(), camL = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
      const V = { s: 0, x: 0, y: 0, a: 1 };
      let camY = 0, noBlink = false;

      function resetWorld() {
        clearObsMeshes();
        W = newWorld(); R = newRun();
        const md = modeOf(); R.vk = md.vk; R.vs = md.vs; R.t0 = md.t0; R.mb = md.mb; R.speed = speedAt(R.t0) * md.vs;
        addTrain(W, 0, 5 - trainLen(3), 3, 0);
        W.genS = 36;
        clearChunks();
        gen(W, R);
        acc = 0; gd = 30; leanZ = 0; airW = 0; camY = 0; prevX = 0; fovK = 0; shake = 0; trackS = NaN;
        V.s = 0; V.x = 0; V.y = 0; V.a = 1;
        msnap = Object.assign({}, R.st);
        trL.fill(0); trail.visible = false;
        draw = true;
      }

      const modeOf = () => MODES.find(m => m.id === save.mode) || MODES[0];
      const bestOf = id => id === 'classic' ? save.best : save.mbest[id] | 0;
      function hudBoards() { E.hbn.textContent = save.boards; E.hb.classList.toggle('none', save.boards <= 0); }
      function refreshHome() {
        E.hcoins.textContent = fmt(save.coins); E.hkeys.textContent = save.keys; E.hboards.textContent = save.boards;
        E.hmult.textContent = 'x' + save.ms.lvl;
        const left = dailyLeft();
        E.hdaily.innerHTML = left ? `Daily goals <b>${3 - left}/3</b>` : `Daily goals done <b>streak ${save.daily.streak}</b>`;
        const c = CITIES[save.city]; E.tname.textContent = c.name; E.tsub.textContent = c.sub;
        E.hbest.textContent = fmt(bestOf(save.mode));
        q('.ss-modes').querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.m === save.mode); b.querySelector('small').textContent = fmt(bestOf(b.dataset.m)); });
        q('.ss-msub').textContent = modeOf().sub;
      }
      function show(el, on) { el.classList.toggle('on', !!on); draw = true; }
      function panel(on) { show(E.panel, on); panelOn = !!on; }
      function clearFx() {
        bannerT = bigT = toastT = nearT = 0;
        E.banner.classList.remove('on'); E.big.classList.remove('on'); E.toast.classList.remove('on'); E.near.classList.remove('on'); E.hint.classList.remove('on');
      }
      function toHome() {
        state = 'home';
        rollDaily();
        resetWorld();
        show(E.home, 1); show(E.over, 0); show(E.save, 0); show(E.pausep, 0); panel(0);
        E.hud.classList.add('off');
        clearFx();
        refreshHome();
        au.music(true); au.jet(false);
        homeT = 0;
        api.score(0);
      }
      function startRun() {
        if (state !== 'home') return;
        if (!save.how) { save.how = 1; persist(); openPanel('how'); return; }
        au.unlock(); au.play('ui');
        show(E.home, 0); panel(0);
        E.hud.classList.remove('off');
        state = 'intro'; introT = 0; R.chase = CFG.START_CHASE; gd = 4.2; gx = 0; au.play('whistle');
        hudScore = hudCoins = hudMult = -1; hudT = 0; apiT = 0; runKeys = 0; runBonus = 0; saveCost = 1; runT = 0; banked = false;
        E.kv.textContent = '0'; E.keyp.classList.add('hide');
        clearFx();
        hudBoards(); updPU(true);
        hintI = save.runs < 3 ? 0 : 99;
        au.music(true);
        if (window.Ameplay && Ameplay.analytics) try { Ameplay.analytics.track('subway_start', { city: CITIES[save.city].id, mode: save.mode }); } catch (e) {}
      }
      function playAgain() { show(E.over, 0); toHome(); startRun(); }

      function useBoard() {
        if ((state !== 'run' && state !== 'intro') || R.dead || R.board > 0 || R.jet > 0 || save.boards <= 0) return;
        save.boards--; R.board = CFG.BOARD_T; R.st.board++; R.ghost = Math.max(R.ghost, 0.3);
        au.play('board_on'); hudBoards(); persist();
        flash('HOVERBOARD!', 'blue');
      }

      function flash(text, cls) { E.banner.textContent = text; E.banner.className = 'ss-banner on' + (cls ? ' ' + cls : ''); bannerT = 1.6; }
      function toast(text) { E.toast.textContent = text; E.toast.classList.add('on'); toastT = 1.8; }
      function big(text) { E.big.textContent = text; E.big.classList.add('on'); bigT = 0.9; }
      function nearPop(text, sub) { E.near.innerHTML = text + (sub ? '<small>' + sub + '</small>' : ''); E.near.classList.remove('on'); void E.near.offsetWidth; E.near.classList.add('on'); nearT = 0.9; }

      let mset = null, msetLvl = -1;
      const msets = () => { if (msetLvl !== save.ms.lvl) { msetLvl = save.ms.lvl; mset = missionSet(msetLvl); } return mset; };
      const MKEY = { coins: 'coinsRun', jump: 'jump', roll: 'roll', pu: 'pu', jet: 'jet', magCoins: 'magCoins', board: 'board', bump: 'bump', dodge: 'dodge', roof: 'roof', sneakJump: 'sneakJump', mbox: 'mbox', stumble: 'stumble' };
      function mprog(i, m) {
        if (save.ms.done[i]) return m.n;
        if (!R || state === 'home') return save.ms.base[i];
        if (m.k === 'coinsRun') return R.st.coinsRun;
        if (m.k === 'score') return Math.floor(R.score);
        if (m.k === 'noCoin') return R.st.coinsRun === 0 ? Math.floor(R.score) : 0;
        const key = MKEY[m.k];
        return save.ms.base[i] + (R.st[key] - (msnap[key] || 0));
      }
      function checkMissions() {
        const set = msets();
        let all = true;
        for (let i = 0; i < set.length; i++) {
          const m = set[i];
          if (!save.ms.done[i] && mprog(i, m) >= m.n) { save.ms.done[i] = true; au.play('mission'); flash('Mission complete!'); }
          if (!save.ms.done[i]) all = false;
        }
        if (all) {
          const lvl = save.ms.lvl;
          if (lvl < 30) save.ms.lvl++;
          save.ms.base = [0, 0, 0]; save.ms.done = [false, false, false];
          msnap = Object.assign({}, R.st);
          const reward = 100 + lvl * 50;
          save.coins += reward; if (lvl % 3 === 0) save.keys++;
          flash('Multiplier x' + save.ms.lvl + '!  +' + reward, 'gold');
          E.mult.classList.add('pop'); api.timeout(() => E.mult.classList.remove('pop'), 300);
          persist();
        }
      }
      function bankMissions() {
        const set = msets();
        set.forEach((m, i) => {
          if (save.ms.done[i]) return;
          if (MISSIONS[m.k].run) return;
          const key = MKEY[m.k];
          save.ms.base[i] += R.st[key] - (msnap[key] || 0);
        });
        msnap = Object.assign({}, R.st);
      }
      function missionRows() {
        return msets().map((m, i) => {
          const p = Math.min(m.n, Math.floor(mprog(i, m))), done = save.ms.done[i];
          return `<div class="ss-row${done ? ' done' : ''}"><span class="ss-chk">${done ? ICO.check : ''}</span><div class="t"><b>${MISSIONS[m.k].t(m.n)}</b><div class="ss-prog"><b style="width:${(100 * p / m.n).toFixed(1)}%"></b></div><small>${fmt(p)} / ${fmt(m.n)}</small></div></div>`;
        }).join('');
      }

      const puState = { key: '', els: [] }, PUK = ['jet', 'sneak', 'mag', 'x2'];
      function updPU(force) {
        let key = '';
        for (let i = 0; i < 4; i++) if (R[PUK[i]] > 0) key += PUK[i] + ',';
        if (R.board > 0) key += 'board,';
        if (force || key !== puState.key) {
          puState.key = key;
          const act = key.split(',').filter(Boolean);
          E.pus.innerHTML = act.map(k => `<div class="ss-pu" data-k="${k}">${ic(k)}<i><b></b></i></div>`).join('');
          puState.els = act.map(k => { const el = E.pus.querySelector(`[data-k="${k}"]`); return { k, el, bar: el.querySelector('b'), low: false }; });
        }
        for (let i = 0; i < puState.els.length; i++) {
          const p = puState.els[i], f = clamp(p.k === 'board' ? R.board / CFG.BOARD_T : R[p.k] / (R[p.k + 'D'] || 1), 0, 1);
          p.bar.style.transform = 'scaleX(' + f.toFixed(3) + ')';
          if ((f < 0.25) !== p.low) { p.low = f < 0.25; p.el.classList.toggle('low', p.low); }
        }
      }

      function onItem(it) {
        const lvl = save.upg[it.k] || 0;
        spark(it.x, it.y, -it.s, ITEM_GLOW[it.k] === 'p' ? 'p' : 'y', 3);
        if (it.k === 'key') { save.keys++; runKeys++; au.play('key'); E.kv.textContent = runKeys; E.keyp.classList.remove('hide'); toast('+1 Key'); persist(); return; }
        if (it.k === 'mbox') {
          R.st.mbox++; au.play('mbox');
          const r = Math.random();
          if (r < 0.5) { const c = pick([100, 150, 200, 250, 300, 500]); save.coins += c; runBonus += c; toast(`Mystery Box: +${c} coins`); }
          else if (r < 0.72) { save.boards++; hudBoards(); toast('Mystery Box: +1 Hoverboard'); }
          else if (r < 0.9) { save.keys++; runKeys++; E.kv.textContent = runKeys; E.keyp.classList.remove('hide'); toast('Mystery Box: +1 Key'); }
          else { const c = 1500; save.coins += c; runBonus += c; toast('JACKPOT! +1,500 coins'); }
          persist(); return;
        }
        givePU(W, R, it.k, lvl);
        au.play('pu');
        flash(PU[it.k].name.toUpperCase() + '!', it.k === 'x2' ? 'gold' : it.k === 'jet' ? '' : 'blue');
        updPU(true);
      }

      function handleEvents() {
        const ev = R.ev;
        let coin = false;
        for (let i = 0; i < ev.length; i++) {
          const e = ev[i];
          if (e === 'coin') coin = true;
          else if (e === 'crash') { au.play('crash'); shake = 0.5; }
          else if (e === 'caught') { au.play('bump'); au.play('caught'); }
          else if (e === 'bump') { au.play('bump'); shake = 0.25; }
          else if (e === 'edge') { au.play('edge'); shake = Math.max(shake, 0.1); }
          else if (e === 'near') { au.play('near'); spark(R.x, R.y + 1.2, -R.s + 0.4, 'w', 2.6); nearPop('CLOSE CALL' + (R.nearN > 1 ? ' x' + R.nearN : ''), '+' + fmt(R.nearPts)); }
          else if (e === 'board_break') { au.play('board_break'); shake = 0.45; boardBreak(R.x, R.y, -R.s); spark(R.x, R.y + 0.3, -R.s, 'p', 4); hudBoards(); }
          else if (e === 'board_end') { au.play('board_end'); au.play('power_down'); }
          else if (e === 'jump') au.play(R.sneak > 0 ? 'spring' : 'jump');
          else if (!e.startsWith('pu_')) au.play(e);
        }
        if (coin) { au.play('coin'); spark(R.x, R.y + 1.0, -R.s - 0.6, 'y', 1.1); }
        ev.length = 0;
      }

      function showSave() {
        state = 'save'; saveT = 0;
        E.scost.textContent = saveCost; E.shave.textContent = `You have ${save.keys} key${save.keys === 1 ? '' : 's'}`;
        E.sgo.classList.toggle('dis', save.keys < saveCost);
        show(E.save, 1);
      }
      function useSave() {
        if (state !== 'save' || save.keys < saveCost) return;
        save.keys -= saveCost; saveCost *= 2; persist();
        show(E.save, 0); au.play('key');
        revive(W, R);
        for (const o of W.obs) if (o.done) dropMesh(o);
        acc = 0; V.a = 1;
        pausedFrom = 'run'; state = 'count'; countT = 0; countN = 3; big('3'); au.play('tick');
      }
      function bank() {
        if (banked) return false;
        banked = true;
        const sc = Math.floor(R.score), md = modeOf(), isBest = sc > bestOf(md.id);
        bankMissions();
        checkDaily(); bankDaily();
        save.coins += R.coins; save.runs++;
        if (isBest) { if (md.id === 'classic') save.best = sc; else save.mbest[md.id] = sc; }
        save.tot.m += Math.round(R.s); save.tot.coins += R.coins; save.tot.jumps += R.st.jump;
        persist();
        return isBest;
      }
      function gameOver() {
        if (state === 'over') return;
        state = 'over'; show(E.save, 0);
        au.jet(false); au.music(false);
        const sc = Math.floor(R.score), md = modeOf(), isBest = bank();
        api.score(sc); if (md.id === 'classic') api.submit(sc);
        q('.o-title').textContent = (R.dead === 'caught' ? 'Caught!' : R.dead === 'quit' ? 'Run over' : 'Crashed!') + (md.id === 'classic' ? '' : ' · ' + md.name);
        const mm = Math.floor(runT / 60), ss = Math.floor(runT % 60);
        q('.o-st').innerHTML = [['DISTANCE', fmt(R.s) + ' m'], ['TIME', mm + ':' + String(ss).padStart(2, '0')], ['CLOSE CALLS', R.st.near], ['TOP SPEED', Math.round(R.st.topV * 3.6) + ' km/h']].map(a => `<div><small>${a[0]}</small><b>${a[1]}</b></div>`).join('');
        q('.o-new').innerHTML = isBest && sc > 0 ? '<span class="ss-new">NEW HIGH SCORE!</span>' : '';
        q('.o-score').textContent = '0'; rollT = 0; rollSc = sc; q('.o-best').textContent = fmt(bestOf(md.id)); q('.o-coins').textContent = fmt(R.coins + runBonus);
        q('.o-ms').innerHTML = missionRows();
        show(E.over, 1);
        E.hud.classList.add('off');
        if (window.Ameplay && Ameplay.analytics) try { Ameplay.analytics.track('subway_over', { score: sc, coins: R.coins, city: CITIES[save.city].id, mode: md.id, t: Math.round(runT) }); } catch (e) {}
      }
      function pause() {
        if (state !== 'run' && state !== 'intro' && state !== 'count') return;
        if (R.dead) return;
        if (state !== 'count') pausedFrom = state;
        state = 'pause'; au.jet(false); au.music(false);
        q('.pz-ms').innerHTML = missionRows();
        E.big.classList.remove('on'); bigT = 0;
        show(E.pausep, 1);
      }
      function resume() {
        if (state !== 'pause') return;
        show(E.pausep, 0); panel(0);
        state = 'count'; countT = 0; countN = 3; big('3'); au.play('tick');
      }

      const dval = k => k === 'dist' ? R.s : k === 'coins' ? R.coins : k === 'best' ? R.score : k === 'fast' ? R.st.topV * 3.6 : R.st[k];
      const dprog = g => g.done ? g.n : banked || !R ? g.p : DAILY[g.k].run ? Math.max(g.p, dval(g.k)) : g.p + dval(g.k);
      const dailyLeft = () => save.daily.g.filter(g => !g.done).length;
      function rollDaily() {
        const D = save.daily, today = dayKey(new Date());
        if (D.day === today && Array.isArray(D.g) && D.g.length === 3 && D.g.every(g => DAILY[g.k])) return;
        const y = new Date(); y.setDate(y.getDate() - 1);
        if (D.last !== today && D.last !== dayKey(y)) D.streak = 0;
        D.day = today; D.g = dailySet(today);
        persist();
      }
      const dailyPay = () => Math.round(150 * (1 + Math.min(save.daily.streak, 6) * 0.25));
      function checkDaily() {
        const D = save.daily;
        let left = 0, hit = false;
        for (let i = 0; i < D.g.length; i++) {
          const g = D.g[i];
          if (!g.done && dprog(g) >= g.n) { g.done = true; g.p = g.n; hit = true; const c = dailyPay(); save.coins += c; runBonus += c; au.play('mission'); flash('Daily goal done!  +' + c, 'gold'); }
          if (!g.done) left++;
        }
        if (hit && !left && D.last !== D.day) { D.last = D.day; D.streak++; save.coins += 300; runBonus += 300; save.keys++; toast('All daily goals: +300 coins, +1 key'); }
        if (hit) persist();
      }
      function bankDaily() {
        for (const g of save.daily.g) if (!g.done) g.p = DAILY[g.k].run ? Math.max(g.p, dval(g.k)) : g.p + dval(g.k);
      }
      function dailyRows() {
        return save.daily.g.map(g => {
          const p = Math.min(g.n, Math.floor(dprog(g)));
          return `<div class="ss-row${g.done ? ' done' : ''}"><span class="ss-chk">${g.done ? ICO.check : ''}</span><div class="t"><b>${DAILY[g.k].t(g.n)}</b><div class="ss-prog"><b style="width:${(100 * p / g.n).toFixed(1)}%"></b></div><small>${fmt(p)} / ${fmt(g.n)}</small></div></div>`;
        }).join('');
      }

      const prBase = () => save.opt.q === 'low' ? 0.85 : COARSE ? 1.6 : 2;
      function applyOpt() {
        au.setVol(save.opt.mus ? 1 : 0, save.opt.sfx ? 1 : 0);
        prCap = prBase();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prCap));
        draw = true;
      }

      let panelKind = '', shopTab = 'up', msTab = 'ms';
      function openPanel(kind) {
        panelKind = kind; au.unlock(); au.play('ui');
        renderPanel();
        panel(1);
      }
      const seg = (key, opts) => `<div class="ss-seg">${opts.map(o => `<button data-opt="${key}" data-v="${o[0]}" class="${String(save.opt[key]) === String(o[0]) ? 'on' : ''}">${o[1]}</button>`).join('')}</div>`;
      const sw = c => `<span class="ss-sw" style="background:linear-gradient(135deg,${c[0]} 0 50%,${c[1]} 50% 100%)"></span>`;
      function cosRow(kind, it) {
        const own = save.cos.own.includes(it.id), sel = save.cos[kind] === it.id;
        return `<div class="ss-row${sel ? ' done' : ''}">${it.c ? sw(it.c) : '<span class="ss-sw none"></span>'}<div class="t"><b>${it.name}</b></div>${sel ? '<button class="ss-btn dis">In use</button>' : own ? `<button class="ss-btn" data-cos="${kind}" data-id="${it.id}">Use</button>` : `<button class="ss-btn g${save.coins < it.price ? ' dis' : ''}" data-cos="${kind}" data-id="${it.id}">${ic('coin')}${fmt(it.price)}</button>`}</div>`;
      }
      function renderPanel() {
        const k = panelKind;
        if (k === 'missions') {
          E.ptitle.textContent = 'Goals';
          const left = dailyLeft();
          let body = `<div class="ss-tabs"><button data-mtab="ms" class="${msTab === 'ms' ? 'on' : ''}">Missions</button><button data-mtab="day" class="${msTab === 'day' ? 'on' : ''}">Daily${left ? ' (' + left + ')' : ''}</button></div>`;
          if (msTab === 'ms') body += `<div class="ss-multi">Score multiplier <b>x${save.ms.lvl}</b></div><div class="ss-list">${missionRows()}</div><p class="ss-small">Complete all three missions to raise your multiplier by +1 (up to x30) and win coins.</p><p class="ss-small">${fmt(save.runs)} runs · ${fmt(save.tot.m)} m run · ${fmt(save.tot.coins)} coins collected · ${fmt(save.tot.jumps)} jumps</p>`;
          else {
            const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), mins = Math.max(1, Math.round((mid - now) / 60000));
            body += `<div class="ss-multi">Day streak <b>${save.daily.streak}</b></div><div class="ss-list">${dailyRows()}</div><p class="ss-small">Each goal pays ${dailyPay()} coins. Finish all three for +300 coins, a key and a longer streak; streaks raise the payout.</p><p class="ss-small">New goals in ${Math.floor(mins / 60)} h ${mins % 60} min.</p>`;
          }
          E.pbody.innerHTML = body;
        } else if (k === 'shop') {
          E.ptitle.textContent = 'Shop';
          let body = `<div class="ss-tabs"><button data-tab="up" class="${shopTab === 'up' ? 'on' : ''}">Upgrades</button><button data-tab="it" class="${shopTab === 'it' ? 'on' : ''}">Items</button><button data-tab="st" class="${shopTab === 'st' ? 'on' : ''}">Style</button></div><div class="ss-multi">${ic('coin')}<b>${fmt(save.coins)}</b></div><div class="ss-list">`;
          if (shopTab === 'up') {
            for (const pk of ['jet', 'sneak', 'mag', 'x2']) {
              const lvl = save.upg[pk], maxed = lvl >= UPG_COST.length, cost = UPG_COST[lvl];
              body += `<div class="ss-row">${ic(pk)}<div class="t"><b>${PU[pk].name}</b><small>Lasts ${puDur(lvl)} s${maxed ? '' : ' → ' + puDur(lvl + 1) + ' s'}</small><div class="ss-pips">${UPG_COST.map((_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div></div>${maxed ? '<button class="ss-btn dis">MAX</button>' : `<button class="ss-btn g${save.coins < cost ? ' dis' : ''}" data-buy="${pk}">${ic('coin')}${fmt(cost)}</button>`}</div>`;
            }
          } else if (shopTab === 'it') {
            body += `<div class="ss-row">${ic('board')}<div class="t"><b>Hoverboard</b><small>Double tap or Space. Lasts 30 s and saves you from one crash. You have ${save.boards}.</small></div><button class="ss-btn g${save.coins < 300 ? ' dis' : ''}" data-buy="board">${ic('coin')}300</button></div>`;
            body += `<div class="ss-row">${ic('mbox')}<div class="t"><b>Mystery Box</b><small>Coins, keys, hoverboards or a jackpot!</small></div><button class="ss-btn g${save.coins < 500 ? ' dis' : ''}" data-buy="mbox">${ic('coin')}500</button></div>`;
            body += `<div class="ss-row">${ic('key')}<div class="t"><b>Key</b><small>Use keys to keep running after a crash (Save me). You have ${save.keys}.</small></div><button class="ss-btn g${save.coins < 2000 ? ' dis' : ''}" data-buy="key">${ic('coin')}2,000</button></div>`;
          } else {
            body += '<div class="ss-sec">Board paint</div>' + BOARDS.map(b => cosRow('board', b)).join('') + '<div class="ss-sec">Trail</div>' + TRAILS.map(t => cosRow('trail', t)).join('');
          }
          E.pbody.innerHTML = body + '</div>';
        } else if (k === 'chars') {
          E.ptitle.textContent = 'Surfers';
          E.pbody.innerHTML = `<div class="ss-multi">${ic('coin')}<b>${fmt(save.coins)}</b></div><div class="ss-chars">${CHARS.map(c => { const own = save.chars.includes(c.id), sel = save.char === c.id; return `<div class="ss-char${sel ? ' sel' : ''}" data-c="${c.id}"><span class="av"></span><b>${c.name}</b>${sel ? '<button class="ss-btn dis">Selected</button>' : own ? `<button class="ss-btn" data-sel="${c.id}">Select</button>` : `<button class="ss-btn g${save.coins < c.price ? ' dis' : ''}" data-unl="${c.id}">${ic('coin')}${fmt(c.price)}</button>`}</div>`; }).join('')}</div>`;
          E.pbody.querySelectorAll('.ss-char').forEach(el => el.querySelector('.av').replaceWith(avatar(CHARS.find(c => c.id === el.dataset.c))));
        } else if (k === 'set') {
          E.ptitle.textContent = 'Settings';
          E.pbody.innerHTML = `<div class="ss-list"><div class="ss-row"><div class="t"><b>Music</b></div>${seg('mus', [[1, 'On'], [0, 'Off']])}</div><div class="ss-row"><div class="t"><b>Sound effects</b></div>${seg('sfx', [[1, 'On'], [0, 'Off']])}</div><div class="ss-row"><div class="t"><b>Graphics</b><small>Auto lowers the resolution only when the game runs slowly.</small></div>${seg('q', [['auto', 'Auto'], ['high', 'Sharp'], ['low', 'Fast']])}</div><div class="ss-row"><div class="t"><b>Screen shake</b></div>${seg('shake', [[1, 'On'], [0, 'Off']])}</div></div>${api.muted ? '<p class="ss-small">Sound is muted for the whole site. Use the speaker button above the game to turn it on.</p>' : ''}<p class="ss-small">${COARSE ? 'Swipe to move, double tap for the hoverboard.' : 'Arrows or WASD to move, Space for the hoverboard, P or Esc to pause.'}</p>`;
        } else if (k === 'how') {
          E.ptitle.textContent = 'How to play';
          const S = COARSE ? [['Switch lanes', 'Swipe left or right'], ['Jump and roll', 'Swipe up to jump over, down to roll under'], ['Power-ups', 'Grab coins, Magnet, Jetpack, 2X and Super Sneakers'], ['Hoverboard', 'Double tap: it saves you from one crash']] : [['Switch lanes', '← → or A / D'], ['Jump and roll', '↑ / W to jump, ↓ / S to roll'], ['Power-ups', 'Grab coins, Magnet, Jetpack, 2X and Super Sneakers'], ['Hoverboard', 'Space: it saves you from one crash']];
          E.pbody.innerHTML = `<div class="ss-how">${S.map((s, i) => `<div class="ss-step"><i>${i + 1}</i>${howSvg[i]}<b>${s[0]}</b><small>${s[1]}</small></div>`).join('')}</div><p class="ss-small">Trains hurt. Ramps take you onto the roofs. Stumble twice and the guard catches you; keys buy a second chance. Dodge a train at the last moment for a close call bonus. ${COARSE ? 'The pause button' : 'P or Esc'} pauses.</p><button class="ss-btn g ss-howgo" data-go="1">${ic('play')}${state === 'pause' ? 'Resume' : 'Let’s go!'}</button>`;
        }
      }
      function buy(what) {
        if (what === 'board') { if (save.coins < 300) return; save.coins -= 300; save.boards++; }
        else if (what === 'mbox') {
          if (save.coins < 500) return; save.coins -= 500;
          const r = Math.random(); let msg;
          if (r < 0.45) { const c = pick([200, 300, 400, 600, 800]); save.coins += c; msg = `+${c} coins`; }
          else if (r < 0.7) { save.boards += 2; msg = '+2 Hoverboards'; }
          else if (r < 0.92) { save.keys++; msg = '+1 Key'; }
          else { save.coins += 2500; msg = 'JACKPOT! +2,500 coins'; }
          toast('Mystery Box: ' + msg);
        } else if (what === 'key') { if (save.coins < 2000) return; save.coins -= 2000; save.keys++; }
        else if (PU[what]) { const l = save.upg[what], c = UPG_COST[l]; if (l >= UPG_COST.length || save.coins < c) return; save.coins -= c; save.upg[what]++; }
        au.play('buy'); persist(); renderPanel(); refreshHome();
      }
      function cosPick(kind, id) {
        const it = (kind === 'board' ? BOARDS : TRAILS).find(x => x.id === id);
        if (!it) return;
        if (!save.cos.own.includes(id)) { if (save.coins < it.price) return; save.coins -= it.price; save.cos.own.push(id); au.play('buy'); } else au.play('ui');
        save.cos[kind] = id; persist();
        if (kind === 'board') buildHero(); else setTrail();
        renderPanel(); refreshHome();
      }
      api.on(E.panel, 'click', e => {
        const t = e.target.closest('button');
        if (e.target === E.panel || (t && t.classList.contains('x'))) { closePanel(); au.play('ui'); return; }
        if (!t || t.classList.contains('dis')) return;
        if (t.dataset.go) { panel(0); if (state === 'pause') resume(); else startRun(); return; }
        if (t.dataset.tab) { shopTab = t.dataset.tab; au.play('ui'); renderPanel(); }
        else if (t.dataset.mtab) { msTab = t.dataset.mtab; au.play('ui'); renderPanel(); }
        else if (t.dataset.opt) { const k = t.dataset.opt, v = t.dataset.v; save.opt[k] = k === 'q' ? v : +v; persist(); applyOpt(); au.play('ui'); renderPanel(); }
        else if (t.dataset.cos) cosPick(t.dataset.cos, t.dataset.id);
        else if (t.dataset.buy) buy(t.dataset.buy);
        else if (t.dataset.sel) { save.char = t.dataset.sel; persist(); buildHero(); au.play('ui'); renderPanel(); }
        else if (t.dataset.unl) { const c = CHARS.find(x => x.id === t.dataset.unl); if (c && save.coins >= c.price) { save.coins -= c.price; save.chars.push(c.id); save.char = c.id; persist(); buildHero(); au.play('buy'); renderPanel(); refreshHome(); } }
      });
      function closePanel() { panel(0); if (state === 'pause') show(E.pausep, 1); }
      const setMode = id => { if (!MODES.find(m => m.id === id) || save.mode === id) return; save.mode = id; persist(); au.unlock(); au.play('ui'); resetWorld(); refreshHome(); };
      api.on(q('.ss-modes'), 'click', e => { const b = e.target.closest('[data-m]'); if (b) setMode(b.dataset.m); });
      api.on(q('.pz-how'), 'click', () => { show(E.pausep, 0); openPanel('how'); });
      api.on(q('.pz-set'), 'click', () => { show(E.pausep, 0); openPanel('set'); });
      api.on(E.home, 'click', e => { const b = e.target.closest('[data-o]'); if (!b) return; if (b.dataset.o === 'daily') { msTab = 'day'; openPanel('missions'); } else { if (b.dataset.o === 'missions') msTab = 'ms'; openPanel(b.dataset.o); } });
      const city = d => { save.city = (save.city + d + CITIES.length) % CITIES.length; persist(); au.unlock(); au.play('ui'); buildCity(save.city); resetWorld(); refreshHome(); };
      api.on(q('.t-prev'), 'click', () => city(-1));
      api.on(q('.t-next'), 'click', () => city(1));
      api.on(E.sgo, 'click', () => useSave());
      api.on(q('.s-skip'), 'click', () => { au.play('ui'); gameOver(); });
      api.on(q('.o-play'), 'click', () => { au.play('ui'); playAgain(); });
      api.on(q('.o-home'), 'click', () => { au.play('ui'); toHome(); });
      api.on(q('.o-shop'), 'click', () => { toHome(); openPanel('shop'); });
      api.on(q('.pz-go'), 'click', () => resume());
      api.on(q('.pz-home'), 'click', () => { au.play('ui'); show(E.pausep, 0); R.dead = 'quit'; gameOver(); toHome(); });
      api.on(E.pause, 'click', e => { E.pause.blur(); pause(); });
      api.on(E.hb, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); useBoard(); });

      function input(a) {
        if (state !== 'run' && state !== 'intro') return;
        act(W, R, a);
      }
      const KM = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down' };
      api.on(window, 'keydown', e => {
        const k = e.code;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (state === 'run' || state === 'intro') {
          if (KM[k]) { e.preventDefault(); if (!e.repeat) input(KM[k]); }
          else if (k === 'Space') { e.preventDefault(); if (!e.repeat) useBoard(); }
          else if (k === 'KeyP' || k === 'Escape') { e.preventDefault(); if (!e.repeat) pause(); }
        } else if (state === 'count') {
          if (KM[k] || k === 'Space') e.preventDefault();
          else if ((k === 'KeyP' || k === 'Escape') && !e.repeat) { e.preventDefault(); pause(); }
        } else if (state === 'home') {
          if (panelOn) { if (k === 'Escape') { e.preventDefault(); panel(0); } else if (panelKind === 'how' && (k === 'Space' || k === 'Enter')) { e.preventDefault(); panel(0); startRun(); } return; }
          if (k === 'KeyM') { const i = MODES.findIndex(m => m.id === save.mode); setMode(MODES[(i + 1) % MODES.length].id); return; }
          if (k === 'Space' || k === 'Enter' || k === 'ArrowUp' || k === 'KeyW') { e.preventDefault(); if (!e.repeat) startRun(); }
          else if (k === 'ArrowLeft') city(-1); else if (k === 'ArrowRight') city(1);
        } else if (state === 'over') {
          if (e.repeat) return;
          if (k === 'Space' || k === 'Enter') { e.preventDefault(); playAgain(); }
          else if (k === 'Escape') { e.preventDefault(); toHome(); }
        } else if (state === 'pause') {
          if (e.repeat) return;
          if (panelOn) { if (k === 'Escape') { e.preventDefault(); closePanel(); } else if (k === 'KeyP' || k === 'Space' || k === 'Enter') { e.preventDefault(); resume(); } return; }
          if (k === 'KeyP' || k === 'Space' || k === 'Enter' || k === 'Escape') { e.preventDefault(); resume(); }
        } else if (state === 'save') {
          if (e.repeat) return;
          if (k === 'Space' || k === 'Enter') { e.preventDefault(); useSave(); }
          else if (k === 'Escape') { e.preventDefault(); gameOver(); }
        }
      });
      let pd = null, lastTap = 0, lastTapX = 0, lastTapY = 0;
      const swipeTh = () => clamp(wrap.clientWidth * 0.04, 14, 28);
      const swipeDir = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      api.on(wrap, 'pointerdown', e => {
        if (e.target.closest('button') || e.target.closest('.ss-card')) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        au.unlock();
        pd = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, n: 0, dir: '' };
        try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
      });
      api.on(wrap, 'pointermove', e => {
        if (!pd || pd.id !== e.pointerId) return;
        if (state !== 'run' && state !== 'intro') return;
        const dx = e.clientX - pd.x, dy = e.clientY - pd.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < swipeTh() * (pd.n ? 1.5 : 1)) return;
        const dir = swipeDir(dx, dy);
        pd.x = e.clientX; pd.y = e.clientY;
        if (dir === pd.dir) return;
        pd.dir = dir; pd.n++;
        input(dir);
      });
      const pend = e => {
        if (!pd || pd.id !== e.pointerId) return;
        const p = pd; pd = null;
        if (p.n) return;
        if (e.type !== 'pointerup') return;
        if (state === 'home') { if (!panelOn) startRun(); return; }
        if (state !== 'run' && state !== 'intro') return;
        const now = e.timeStamp, dx = e.clientX - p.x, dy = e.clientY - p.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) >= swipeTh() * 0.6 && now - p.t < 350) { input(swipeDir(dx, dy)); return; }
        if (now - p.t < 300) {
          if (now - lastTap < 380 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 70) { useBoard(); lastTap = 0; }
          else { lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY; }
        }
      };
      api.on(wrap, 'pointerup', pend);
      api.on(wrap, 'pointercancel', pend);
      api.on(document, 'visibilitychange', () => { if (document.hidden) pause(); else draw = true; });
      api.on(window, 'blur', () => pause());

      const HINTS = COARSE ? [['Swipe left or right', 'to switch lanes'], ['Swipe up to jump', 'swipe down to roll'], ['Double tap', 'to use a hoverboard']] : [['← → to switch lanes', 'or A / D'], ['↑ jump  ·  ↓ roll', 'roll in the air to drop fast'], ['Space: hoverboard', 'it saves you from one crash']];
      const hintDone = [() => R.lane !== 1, () => R.st.jump + R.st.roll > 0, () => R.st.board > 0];
      function hintTick() {
        if (hintI >= HINTS.length) return;
        if (R.dead) { E.hint.classList.remove('on'); return; }
        const at = 1.0 + hintI * 3.4, t = R.t;
        if (hintDone[hintI]()) { E.hint.classList.remove('on'); hintI++; return; }
        if (t > at && t < at + 3.0) { if (!E.hint.classList.contains('on')) { E.hint.innerHTML = HINTS[hintI][0] + '<small>' + HINTS[hintI][1] + '</small>'; E.hint.classList.add('on'); } }
        else if (t >= at + 3.0) { E.hint.classList.remove('on'); hintI++; }
      }

      function syncWorld(dt, t) {
        const s = V.s;
        syncChunks(s);
        const ts = Math.floor(s / 4) * 4;
        if (ts !== trackS) { trackS = ts; track.position.z = -ts; rails.position.z = -ts; }
        far.position.z = -s - 200;
        const O = W.obs;
        for (let i = 0; i < O.length; i++) {
          const o = O[i];
          if (o.done) { if (o.mesh) dropMesh(o); continue; }
          if (!o.mesh) { if (o.s0 < s + 215) obsMesh(o); else continue; }
          if (o.act) {
            const a = o.mesh, z = -lerp(o.ps0, o.s0, V.a);
            for (let j = 0; j < a.length; j++) { const m = a[j]; m.position.z = z + m.userData.dz; if (!m.isSprite) m.updateMatrix(); }
          }
        }
        const I = W.items;
        for (let i = 0; i < I.length; i++) {
          const it = I[i];
          if (it.got) { if (it.mesh) dropMesh(it); continue; }
          if (!it.mesh) { if (it.s < s + 190) itemMesh(it); else continue; }
          const g = it.mesh, k = 1.9 + 0.25 * Math.sin(t * 6);
          g.children[0].rotation.y = t * 2.4; g.position.y = it.y + Math.sin(t * 3 + it.s) * 0.12; g.children[1].scale.set(k, k, 1);
        }
        const C = W.coins, M = coinIM.instanceMatrix.array, cs = Math.cos(t * 3.2), sn = Math.sin(t * 3.2);
        let n = 0;
        for (let i = 0; i < C.length && n < MAXC; i++) {
          const c = C[i];
          if (c.got) continue;
          const ds = c.s - s;
          if (ds > 180) break;
          if (ds < -6) continue;
          const b = n * 16;
          M[b] = cs; M[b + 2] = -sn; M[b + 8] = sn; M[b + 10] = cs; M[b + 12] = c.x; M[b + 13] = c.y; M[b + 14] = -c.s;
          n++;
        }
        coinIM.count = n; coinIM.instanceMatrix.needsUpdate = true;
        updBreak(dt);
        updTrail(dt);
        for (let i = 0; i < sparks.length; i++) { const sp = sparks[i]; if (sp.visible) { sp.userData.t += dt; const f = sp.userData.t / 0.3; if (f >= 1) sp.visible = false; else { const k = sp.userData.s * (0.4 + f); sp.scale.set(k, k, 1); sp.material.opacity = 1 - f; } } }
      }

      const HS = { mode: 'run', speed: 0, air: 0, vy: 0, roll: 0, rollP: 0, stumble: 0, leanZ: 0, spray: false, can: false, deadT: 0 };
      function syncHero(dt, t) {
        const H = hero;
        const xv = dt > 0 ? (V.x - prevX) / dt : 0; prevX = V.x;
        leanZ = damp(leanZ, clamp(-xv * 0.018, -0.38, 0.38), 14, dt);
        airW = damp(airW, R.grounded || R.jet > 0 ? 0 : 1, 16, dt);
        let mode = 'run';
        if (state === 'home') mode = 'idle';
        else if (R.dead) mode = R.dead === 'caught' ? 'caught' : 'dead';
        else if (R.jet > 0) mode = 'jet';
        else if (R.board > 0) mode = 'board';
        const st = HS;
        st.mode = mode; st.speed = R.speed; st.air = airW; st.vy = R.vy; st.roll = R.rollT > 0 ? 1 : 0; st.rollP = R.rollT > 0 ? 1 - R.rollT / R.rollD : 0; st.stumble = R.stumbleT / 0.45; st.leanZ = mode === 'run' || mode === 'board' ? leanZ : 0; st.spray = false; st.can = false; st.deadT = R.deadT;
        if (state === 'home') { sprayT += dt; st.spray = (sprayT % 7) > 3.5; st.can = true; }
        CH.animHero(H, st, dt, t);
        if (mode === 'run' && R.grounded && dt > 0) { const sp = Math.floor(H.ph / Math.PI); if (sp !== H.lastStep) { H.lastStep = sp; au.play(R.y > 3 ? 'step_roof' : 'step'); } }
        const ex = R.edgeT > 0 ? R.edgeDir * 0.26 * Math.sin(Math.PI * (1 - R.edgeT / 0.24)) : 0;
        H.root.position.set(V.x + ex, V.y, -V.s);
        let yaw = 0;
        if (state === 'home') yaw = st.spray ? 0.95 : 0.12 + 0.08 * Math.sin(t * 0.8);
        else if (state === 'intro') yaw = lerp(0.6, 0, ease(clamp(introT / 0.5, 0, 1)));
        else if (mode === 'run') yaw = clamp(-xv * 0.012, -0.35, 0.35);
        H.root.rotation.y = damp(H.root.rotation.y, yaw, 12, dt);
        if (mode === 'dead') { const k = clamp(R.deadT * 4, 0, 1), bn = Math.abs(Math.sin(R.deadT * 8)) * 0.5 * Math.exp(-R.deadT * 3.4); H.root.position.z += 0.75 * ease(k); H.body.rotation.x = lerp(0, 1.45, ease(k)); H.body.rotation.y = 0.8 * ease(k); H.root.position.y = V.y + bn + 0.2 * Math.sin(k * Math.PI); }
        else if (mode === 'board' && CFG.BOARD_T - R.board < 0.7) { const q = clamp((CFG.BOARD_T - R.board) / 0.7, 0, 1); H.body.rotation.y += TAU * ease(q); H.root.position.y += 0.5 * Math.sin(q * Math.PI); H.body.rotation.x = 0; }
        else H.body.rotation.x = 0;
        H.root.visible = noBlink || !(R.ghost > 0 && R.jet <= 0 && !R.dead && Math.floor(t * 12) % 3 === 0);
        const sup = supportAt(W, laneOf(V.x), V.s);
        const hgt = Math.max(0, V.y - sup);
        heroBlob.position.set(V.x + ex, sup + 0.03, -V.s);
        const bs = clamp(1 - hgt * 0.1, 0.35, 1);
        heroBlob.scale.set(0.95 * bs, 1, 1.1 * bs);
      }

      function syncGuard(dt, t) {
        let target = 30, vis = true;
        if (state === 'home') { target = 40; }
        else if (R.dead === 'caught' || R.dead === 'crash') target = R.dead === 'caught' ? 1.25 : 1.9;
        else if (R.jet > 0) target = 40;
        else if (R.chase > 0) target = 2.5;
        const k = target < gd ? (R.dead ? 4 : 2.6) : 0.7;
        gd = damp(gd, target, k, dt);
        if (gd > 20) vis = false;
        if (guard.root.visible !== vis) guard.root.visible = dog.root.visible = gBlob.visible = dBlob.visible = vis;
        if (!vis) return;
        gx = damp(gx, V.x + (R.dead ? 0.15 : V.x > 0.5 ? -0.85 : 0.85), 5, dt);
        const gs = V.s - gd;
        const sup = supportAt(W, laneOf(gx), gs);
        gy = damp(gy, sup, 10, dt);
        const run = !(R.dead && gd < target + 0.25);
        const sp = R.dead ? (run ? 9 : 0) : R.speed;
        guard.grab = !!R.dead;
        CH.animGuard(guard, sp, dt, t, run ? 'run' : 'grab');
        guard.root.position.set(gx, gy, -gs);
        gBlob.position.set(gx, gy + 0.03, -gs);
        dgx = damp(dgx, V.x + (gx > V.x ? -0.75 : 0.75), 6, dt);
        const ds = gs + (R.dead ? 0.2 : 1.1);
        const dsup = supportAt(W, laneOf(dgx), ds);
        CH.animDog(dog, sp * 1.05, dt, t, run ? 'run' : 'bark');
        dog.root.position.set(dgx, dsup, -ds);
        dBlob.position.set(dgx, dsup + 0.03, -ds);
      }

      const camBack = portrait ? 7.2 : 6.2, camBase = portrait ? 6.7 : 5.8;
      function camRun(out, look, dt) {
        const tun = inTunnel(W, V.s + 2) || inTunnel(W, V.s - camBack - 1);
        const yT = R.jet > 0 || R.grounded ? V.y : lerp(supportAt(W, laneOf(V.x), V.s), V.y, 0.6);
        camY = damp(camY, yT, R.jet > 0 ? 3 : 6, dt);
        let cy = camBase + camY * 0.9;
        if (tun) cy = Math.min(cy, 8.6);
        out.set(V.x * 0.62, cy, -V.s + camBack);
        look.set(V.x * 0.85, 0.9 + camY * 0.88, -V.s - (portrait ? 6.5 : 7));
      }
      function camHome(out, look) {
        out.set(portrait ? 0.55 : 1.05, portrait ? 1.7 : 1.55, -V.s - (portrait ? 4.6 : 3.7));
        look.set(portrait ? 0.05 : -0.55, portrait ? 1.25 : 1.12, -V.s + 0.2);
      }
      function camIntro(out, look, k) {
        camHome(camP, camL);
        const hx = camP.x, hy = camP.y, hz = camP.z + V.s;
        const a0 = Math.atan2(hx, -hz), r0 = Math.hypot(hx, hz), a = lerp(a0, Math.PI, k), r = lerp(r0, camBack, k) - 1.1 * Math.sin(Math.PI * k);
        out.set(Math.sin(a) * r + tmpP.x * k, lerp(hy, tmpP.y, k * k), -V.s - Math.cos(a) * r);
        look.lerpVectors(camL, tmpL, k);
      }

      function frameUI(dt) {
        hudT -= dt;
        if (hudT <= 0) {
          hudT = 0.1;
          const sc = Math.floor(R.score);
          if (sc !== hudScore) { hudScore = sc; E.sv.textContent = String(sc).padStart(6, '0'); }
          const m = (save.ms.lvl + R.mb) * (R.x2 > 0 ? 2 : 1);
          if (m !== hudMult) { hudMult = m; E.mult.textContent = 'x' + m; E.mult.classList.toggle('x2', R.x2 > 0); }
          updPU(false);
          const on = R.board > 0;
          if (on !== hbOn) { hbOn = on; E.hb.classList.toggle('on', on); }
          apiT -= 0.1;
          if (apiT <= 0 && state === 'run') { apiT = 0.3; api.score(sc); }
        }
        if (R.coins !== hudCoins) { hudCoins = R.coins; E.cv.textContent = fmt(R.coins); }
        fxTick(dt);
      }
      let hbOn = false;
      function fxTick(dt) {
        if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) E.banner.classList.remove('on'); }
        if (bigT > 0) { bigT -= dt; if (bigT <= 0) E.big.classList.remove('on'); }
        if (toastT > 0) { toastT -= dt; if (toastT <= 0) E.toast.classList.remove('on'); }
        if (nearT > 0) { nearT -= dt; if (nearT <= 0) E.near.classList.remove('on'); }
      }

      let perfN = 0, perfT = 0, perfCool = 2;
      function perf(dt) {
        perfCool -= dt;
        if (state !== 'run' || perfCool > 0 || save.opt.q !== 'auto') { perfN = 0; perfT = 0; return; }
        perfN++; perfT += dt;
        if (perfN >= 90) {
          const avg = perfT / perfN;
          if (avg > 1 / 50 && prCap > 0.8) { prCap = Math.max(0.8, prCap * 0.82); renderer.setPixelRatio(prCap); perfCool = 2.5; }
          perfN = 0; perfT = 0;
        }
      }

      applyOpt();
      setTrail();
      buildHero();
      buildCity(save.city);
      toHome();
      try { if (document.fonts && !document.fonts.check('40px "Lilita One"')) document.fonts.load('40px "Lilita One"').then(() => { if (api.alive && state === 'home' && document.fonts.check('40px "Lilita One"')) { buildCity(save.city); resetWorld(); } }).catch(() => {}); } catch (e) {}
      camHome(camP, camL);
      try { renderer.compile(scene, cam); } catch (e) {}

      const ctx = { mult: 1 };
      function simulate(dt) {
        ctx.mult = save.ms.lvl;
        if (R.dead) { step(W, R, dt, ctx); acc = 0; V.a = 1; return; }
        runT += dt; acc += dt;
        const s0 = R.s;
        let n = 0;
        while (acc >= CFG.STEP && n++ < 10) {
          step(W, R, CFG.STEP, ctx); acc -= CFG.STEP;
          if (R.dead) { acc = 0; break; }
          collect(W, R, CFG.STEP, onItem);
        }
        if (n > 10) acc = 0;
        if (dayI === 2) R.st.night += R.s - s0;
        V.a = R.dead ? 1 : acc / CFG.STEP;
      }

      let tsc = 1, tvirt = 0, lastW = 0, lastH = 0, lastAsp = 0, lastFov = 0, idleT = 0;
      function frame(dt) {
        dt *= tsc;
        const cw = renderer.domElement.width, chh = renderer.domElement.height;
        if (cw !== lastW || chh !== lastH) { lastW = cw; lastH = chh; draw = true; }
        const frozen = state === 'pause' || panelOn || (state === 'over' && rollT >= 0.9 && R.deadT > 2.6);
        if (frozen) { au.tick(); fxTick(dt); idleT += dt; if (idleT > 1) draw = true; if (!draw) return; idleT = 0; dt = 0; }
        draw = false;
        tvirt += dt;
        const t = tvirt;
        capPR(); perf(dt);
        let adt = dt;
        if (state === 'run' || state === 'intro') {
          simulate(dt);
          if (!R.dead) gen(W, R);
          cullT -= dt;
          if (cullT <= 0) { cullT = 0.3; cull(W, R, dropMesh); }
          handleEvents();
          msT -= dt;
          if (msT <= 0) { msT = 0.2; checkMissions(); checkDaily(); au.tempo(clamp((R.speed - CFG.V0) / (CFG.VMAX - CFG.V0), 0, 1)); }
          hintTick();
          au.jet(R.jet > 0 && !R.dead);
          if (state === 'intro') { introT += dt; if (introT >= 1.0) state = 'run'; }
          if (R.dead && R.dead !== 'quit' && R.deadT > 1.1) showSave();
          frameUI(dt);
        } else if (state === 'count') {
          countT += dt; adt = 0;
          const n = 3 - Math.floor(countT / 0.42);
          if (n !== countN) {
            countN = n;
            if (n > 0) { big(String(n)); au.play('tick'); }
            else { state = pausedFrom; acc = 0; big('GO!'); au.play('go'); au.music(true); }
          }
          fxTick(dt);
        } else if (state === 'save') {
          saveT += dt;
          step(W, R, dt, ctx);
          const f = clamp(saveT / 4.5, 0, 1);
          E.sarc.style.strokeDashoffset = (276.5 * f).toFixed(1);
          if (f >= 1) gameOver();
        } else if (state === 'over') { step(W, R, dt, ctx); if (rollT < 0.9) { rollT += dt; E.oscore.textContent = fmt(rollSc * ease(clamp(rollT / 0.9, 0, 1))); } }
        else if (state === 'home') homeT += dt;
        const a = V.a;
        V.s = R.ps + (R.s - R.ps) * a; V.x = R.px + (R.x - R.px) * a; V.y = R.py + (R.y - R.py) * a;
        syncWorld(adt, t);
        syncHero(adt, t);
        syncGuard(adt, t);
        const tun = inTunnel(W, V.s);
        tunK = damp(tunK, tun ? 1 : 0, 4, dt);
        const L = ENV.light;
        dayTick();
        hemi.intensity = (0.95 - 0.42 * tunK) * L * dayHK; sun.intensity = (0.72 - 0.5 * tunK) * L * daySK;
        if (state === 'home') { camHome(camP, camL); }
        else if (state === 'intro') { camRun(tmpP, tmpL, dt); camIntro(tmpP, tmpL, ease(clamp(introT / 1.0, 0, 1))); camP.copy(tmpP); camL.copy(tmpL); }
        else {
          camRun(tmpP, tmpL, adt);
          camP.x = damp(camP.x, tmpP.x, 9, adt); camP.y = damp(camP.y, tmpP.y, 7, adt); camP.z = tmpP.z; camL.x = damp(camL.x, tmpL.x, 9, adt); camL.y = damp(camL.y, tmpL.y, 7, adt); camL.z = tmpL.z;
        }
        fovK = damp(fovK, state === 'home' ? 0 : clamp((R.speed - CFG.V0) / (CFG.VMAX - CFG.V0), 0, 1) * 5 + (R.jet > 0 ? 3 : 0), 2.5, dt);
        const ca = cw / Math.max(1, chh), bf = baseFov + fovK;
        if (Math.abs(ca - lastAsp) > 1e-4 || Math.abs(bf - lastFov) > 0.02) {
          lastAsp = ca; lastFov = bf;
          cam.aspect = ca; cam.fov = ca < baseAsp ? 2 * Math.atan(Math.tan(bf * Math.PI / 360) * baseAsp / ca) * 180 / Math.PI : bf; cam.updateProjectionMatrix();
        }
        cam.position.copy(camP);
        if (shake > 0) { shake = Math.max(0, shake - dt); if (save.opt.shake) cam.position.x += (Math.random() - 0.5) * shake * 0.6; cam.position.y += (Math.random() - 0.5) * shake * 0.6; }
        cam.lookAt(camL);
        for (let i = 0; i < gantries.length; i++) { const m = gantries[i], dz = cam.position.z - m.position.z; m.visible = !(dz > -0.6 && dz < 2 && cam.position.y > 5.2 && cam.position.y < 7.8); }
        skyPlane.position.set(cam.position.x * 0.9, 52, cam.position.z - 340);
        sunSprite.position.set(cam.position.x - 120, sunY, cam.position.z - 330);
        if (starPlane.visible) starPlane.position.set(cam.position.x * 0.9, 120, cam.position.z - 346);
        au.tick();
        renderer.render(scene, cam);
      }
      let hold = false;
      api.loop(dt => { if (!hold) frame(dt); });

      wrap._ss = {
        get W() { return W; }, get R() { return R; }, get V() { return V; }, get state() { return state; }, save,
        info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, pr: renderer.getPixelRatio(), geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures, objs: scene.children.length, pool: pool.length, frame: renderer.info.render.frame }),
        act: a => input(a), set noBlink(v) { noBlink = v; }, set ts(v) { tsc = v; }, set runT(v) { runT = v; }, set hold(v) { hold = v; }, set pr(v) { prCap = v; renderer.setPixelRatio(v); draw = true; }, clearChunks: () => clearChunks(),
        give(k) { if (state === 'run') onItem({ k, x: R.x, y: R.y, s: R.s }); },
        pat(k, d) { for (const o of W.obs) o.done = true; for (const c of W.coins) c.got = true; W.free = [-1e9, -1e9, -1e9]; const v = R.speed * 1.03, end = PAT[k](W, R.s + 26, v, d || 0, Math.max(13, v * (0.95 - 0.2 * (d || 0)))); W.coins.sort((a, b) => a.s - b.s); W.genS = Math.max(end, R.s) + 30; return end; }, city: d => city(d), frame,
        bench(n, dt) {
          const gl = renderer.getContext(), keys = ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced'], old = {};
          for (const k of keys) { old[k] = gl[k]; gl[k] = () => {}; }
          const a = [], B = 10, T0 = performance.now();
          for (let i = 0; i < n; i += B) { const t0 = performance.now(); for (let j = 0; j < B; j++) frame(dt); a.push((performance.now() - t0) / B); }
          const tot = performance.now() - T0;
          for (const k of keys) gl[k] = old[k];
          a.sort((x, y) => x - y);
          const m = a.length;
          return { avg: tot / n, p50: a[m >> 1], p90: a[Math.floor(m * 0.9)], max: a[m - 1], min: a[0] };
        }
      };
      return {
        destroy() {
          try { if (!banked && R && R.t > 1) bank(); } catch (e) {}
          au.close();
          if (ENV) ENV.dispose();
          const all = new Set(bin);
          scene.traverse(o => { if (o.geometry) all.add(o.geometry); const m = o.material; if (m) for (const x of Array.isArray(m) ? m : [m]) { all.add(x); if (x.map) all.add(x.map); } });
          all.forEach(x => { try { x.dispose && x.dispose(); } catch (e) {} });
        }
      };
    }
  });
