
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
    help: '<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> switch lane · <kbd>↑</kbd>/<kbd>W</kbd> jump · <kbd>↓</kbd>/<kbd>S</kbd> roll · <kbd>Space</kbd> hoverboard · <kbd>P</kbd> pause · swipe and double-tap on touch',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="10" r="5"/><path d="M37 18l-7 14 8 7v11M30 32l-9 4h-5M26 22l11-4 6 8 8-1"/><path d="M8 60l10-20M56 60L46 40M18 50h28"/></svg>',
    css: CSS,
    core: { CFG, newWorld, newRun, step, act, gen, supportAt, speedAt },
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
      wrap.className = 'ss-stage';
      wrap.style.width = v.canvas.style.width;
      wrap.style.aspectRatio = v.canvas.style.aspectRatio;
      v.canvas.style.width = '100%';
      root.append(wrap);
      wrap.append(v.canvas);
      wrap.insertAdjacentHTML('beforeend', HTML);
      const q = s => wrap.querySelector(s);
      const E = {
        hud: q('.ss-hud'), sv: q('.ss-sv'), cv: q('.ss-cv'), kv: q('.ss-kv'), keyp: q('.ss-keyp'), mult: q('.ss-mult'), pus: q('.ss-pus'), hb: q('.ss-hb'), hbn: q('.ss-hbn'),
        hint: q('.ss-hint'), banner: q('.ss-banner'), big: q('.ss-big'), toast: q('.ss-toast'), pause: q('.ss-pause'),
        home: q('.ss-home'), panel: q('.ss-panel'), ptitle: q('.p-title'), pbody: q('.p-body'), save: q('.ss-save'), over: q('.ss-over'), pausep: q('.ss-pausep'),
        hbest: q('.h-best'), hcoins: q('.h-coins'), hkeys: q('.h-keys'), hboards: q('.h-boards'), hmult: q('.h-mult'), tname: q('.t-name'), tsub: q('.t-sub'),
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
        chars: Array.isArray(loaded.chars) ? loaded.chars : ['jake'], char: loaded.char || 'jake', city: loaded.city | 0, runs: loaded.runs | 0, best: loaded.best | 0
      };
      if (!CHARS.find(c => c.id === save.char)) save.char = 'jake';
      save.city = clamp(save.city, 0, CITIES.length - 1);
      const persist = () => api.save(save);
      const au = mkAudio(api);

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(portrait ? 70 : 60, VW / VH, 0.1, 520);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
      const sun = new THREE.DirectionalLight(0xffffff, 0.8);
      sun.position.set(-0.45, 1, 0.5);
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

      function buildCity(i) {
        if (ENV) { ENV.dispose(); }
        const city = CITIES[i];
        const AT = T.atlas(city);
        const WG = mkWorld(THREE, AT, city);
        const trackTex = T.track(city), skyTex = T.sky(city), skylineTex = T.skyline(city);
        atlasMat.map = AT.tex; atlasMat.needsUpdate = true;
        trackMat.map = trackTex; trackMat.needsUpdate = true;
        skyMat.map = skylineTex; skyMat.needsUpdate = true;
        scene.background = skyTex;
        scene.fog.color.set(city.fog).convertSRGBToLinear();
        farMat.color.set(shade(city.walk, -0.12)).convertSRGBToLinear();
        hemi.color.set(city.hemi[0]).convertSRGBToLinear(); hemi.groundColor.set(city.hemi[1]).convertSRGBToLinear();
        sun.color.set(city.sun).convertSRGBToLinear();
        if (rails) scene.remove(rails);
        rails = new THREE.Mesh(WG.rails, railMat); scene.add(rails);
        ENV = { city, AT, WG, light: city.light, dispose() { AT.tex.dispose(); trackTex.dispose(); skyTex.dispose(); skylineTex.dispose(); WG.bin.forEach(g => g.dispose()); } };
        clearChunks(); clearObsMeshes();
      }

      const chunks = new Map();
      function clearChunks() { for (const arr of chunks.values()) for (const m of arr) scene.remove(m); chunks.clear(); }
      function chunkKind(i, side) { if (i >= -2 && i <= 0) return side < 0 ? 0 : 1; const h = hash(i * 7.31 + side * 13.7 + save.city * 3.3); return h < 0.34 ? 0 : h < 0.62 ? 1 : h < 0.76 ? 2 : 3; }
      function makeChunk(i) {
        const arr = [], s0 = i * CFG.CHUNK, z = -s0, WG = ENV.WG;
        const add = (geo, mat, zz) => { const m = new THREE.Mesh(geo, mat); m.position.set(0, 0, zz); m.matrixAutoUpdate = false; m.updateMatrix(); scene.add(m); arr.push(m); };
        const tun = W.tunnels.find(t => s0 >= t.s0 && s0 < t.s1);
        if (tun) { add(WG.tunnel, atlasMat, z); add(WG.tunnelLamp, lampMat, z); if (s0 === tun.s0) add(WG.portal, atlasMat, z); }
        else {
          const kl = chunkKind(i, -1) * 2 + (i & 1), kr = chunkKind(i, 1) * 2 + ((i >> 1) & 1);
          const L = WG.side.L[kl], Rr = WG.side.R[kr];
          add(L.geo, atlasMat, z); if (L.fence) add(L.fence, fenceMat, z);
          add(Rr.geo, atlasMat, z); if (Rr.fence) add(Rr.fence, fenceMat, z);
          if (((i % 3) + 3) % 3 === 1) { add(WG.gantry, atlasMat, z - 20); add(WG.gantryLamp, lampMat, z - 20); }
        }
        return arr;
      }
      function syncChunks(s) {
        const i0 = Math.floor((s - 50) / CFG.CHUNK), i1 = Math.floor((s + 215) / CFG.CHUNK);
        for (const [i, arr] of chunks) if (i < i0 || i > i1) { for (const m of arr) scene.remove(m); chunks.delete(i); }
        for (let i = i0; i <= i1; i++) if (!chunks.has(i)) chunks.set(i, makeChunk(i));
      }

      function obsMesh(o) {
        const WG = ENV.WG, g = new THREE.Group();
        if (o.k === 'train') {
          for (let c = 0; c < o.cars; c++) {
            const geo = c === 0 ? (o.moving ? WG.car.lit[o.liv] : WG.car.front[o.liv]) : WG.car.mid[o.liv];
            const m = new THREE.Mesh(geo, atlasMat); m.position.z = -c * (CFG.CAR + CFG.CGAP); g.add(m);
          }
          if (o.moving) for (const sx of [-0.73, 0.73]) { const sp = new THREE.Sprite(GM.w); sp.scale.set(2.2, 2.2, 1); sp.position.set(sx, 1.0, 0.25); g.add(sp); }
        } else if (o.k === 'ramp') g.add(new THREE.Mesh(WG.ramp, atlasMat));
        else if (o.k === 'low') { const m = new THREE.Mesh(WG.low, atlasMat); m.position.z = -CFG.BAR_D; g.add(m); }
        else if (o.k === 'high') { const m = new THREE.Mesh(WG.high, atlasMat); m.position.z = -CFG.BAR_D; g.add(m); const l = new THREE.Mesh(WG.highLamp, lampMat); l.position.z = -CFG.BAR_D; g.add(l); }
        g.position.set(LX(o.lane), 0, -o.s0);
        scene.add(g); o.mesh = g;
      }
      function dropMesh(o) { if (o.mesh) { scene.remove(o.mesh); o.mesh = null; } }
      function clearObsMeshes() { if (W) { for (const o of W.obs) dropMesh(o); for (const it of W.items) dropMesh(it); } }

      const coinGeo = keep(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 22)); coinGeo.rotateX(Math.PI / 2);
      const coinFace = keep(T.coin());
      const coinMats = [keep(new THREE.MeshLambertMaterial({ color: new THREE.Color('#ffb31a').convertSRGBToLinear(), emissive: new THREE.Color('#5a3200') })), keep(new THREE.MeshLambertMaterial({ map: coinFace, emissive: new THREE.Color('#3a2400') })), keep(new THREE.MeshLambertMaterial({ map: coinFace, emissive: new THREE.Color('#3a2400') }))];
      const MAXC = 480;
      const coinIM = new THREE.InstancedMesh(coinGeo, coinMats, MAXC); coinIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); coinIM.frustumCulled = false; coinIM.count = 0; scene.add(coinIM);
      const dummy = new THREE.Object3D();

      const sparks = [];
      for (let i = 0; i < 14; i++) { const sp = new THREE.Sprite(GM.y); sp.visible = false; sp.userData.t = 0; scene.add(sp); sparks.push(sp); }
      let sparkI = 0;
      function spark(x, y, z, k, s) { const sp = sparks[sparkI++ % sparks.length]; sp.material = GM[k || 'y']; sp.position.set(x, y, z); sp.visible = true; sp.userData.t = 0; sp.userData.s = s || 1.4; }

      const IM = {};
      const itemModel = k => {
        const g = new THREE.Group(), M = CH.M, m = CH.mesh, rb = CH.rbox, cy = CH.cyl;
        if (k === 'jet') { for (const s of [-1, 1]) { m(cy(0.17, 0.17, 0.62, 12), M('#ff4a2a'), s * 0.2, 0.31, 0, g); m(CH.ball(0.17, 10), M('#ff4a2a'), s * 0.2, 0.31, 0, g); m(cy(0.1, 0.15, 0.14, 10), M('#c9ccd2'), s * 0.2, -0.31, 0, g); } m(rb(0.18, 0.5, 0.12), M('#ffd23f'), 0, 0.05, 0, g); }
        else if (k === 'sneak') { m(rb(0.34, 0.24, 0.66, 0.5), M('#3ad16b'), 0, 0.05, 0, g); m(rb(0.38, 0.1, 0.72, 0.5), M('#ffffff'), 0, -0.1, 0, g); m(rb(0.3, 0.3, 0.3, 0.5), M('#2fa84a'), 0, 0.2, 0.2, g); for (const s of [-1, 1]) { const w = m(rb(0.06, 0.24, 0.36, 0.5), M('#ffffff'), s * 0.22, 0.25, 0.15, g); w.rotation.x = 0.5; } }
        else if (k === 'mag') { const t = new THREE.Mesh(CH.G('magT', () => new THREE.TorusGeometry(0.32, 0.12, 8, 18, Math.PI)), M('#e8343a')); t.rotation.z = Math.PI; g.add(t); for (const s of [-1, 1]) { m(cy(0.12, 0.12, 0.26, 10), M('#e8343a'), s * 0.32, 0.26, 0, g); m(cy(0.125, 0.125, 0.16, 10), M('#e6e9ef'), s * 0.32, 0.4, 0, g); } g.position.y = 0; }
        else if (k === 'x2') { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 : 0.5; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const ge = CH.G('star', () => { const e = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 }); e.translate(0, 0, -0.08); return e; }); g.add(new THREE.Mesh(ge, M('#ffc21a'))); const lt = keep(T.label('2X', '#ffffff', null, 128, 64, 52)); const pl = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.62, 0.31)), keep(new THREE.MeshBasicMaterial({ map: lt, transparent: true }))); pl.position.z = 0.15; g.add(pl); const pl2 = pl.clone(); pl2.rotation.y = Math.PI; pl2.position.z = -0.15; g.add(pl2); }
        else if (k === 'key') { const t = new THREE.Mesh(CH.G('keyT', () => new THREE.TorusGeometry(0.17, 0.06, 8, 16)), M('#ff3d3d')); t.position.y = 0.25; g.add(t); m(cy(0.055, 0.055, 0.5, 8), M('#ff3d3d'), 0, 0.1, 0, g); m(rb(0.16, 0.07, 0.06), M('#ff3d3d'), 0.08, -0.28, 0, g); m(rb(0.12, 0.07, 0.06), M('#ff3d3d'), 0.06, -0.16, 0, g); }
        else if (k === 'mbox') { const lt = keep(T.label('?', '#ffd23f', '#8a2fe8', 128, 128, 96)); g.add(new THREE.Mesh(CH.G('mbox', () => new THREE.BoxGeometry(0.75, 0.75, 0.75)), keep(new THREE.MeshLambertMaterial({ map: lt })))); }
        return g;
      };
      const ITEM_GLOW = { jet: 'r', sneak: 'g', mag: 'r', x2: 'y', key: 'r', mbox: 'p' };
      function itemMesh(it) {
        if (!IM[it.k]) IM[it.k] = itemModel(it.k);
        const g = new THREE.Group(); g.add(IM[it.k].clone());
        const sp = new THREE.Sprite(GM[ITEM_GLOW[it.k]]); sp.scale.set(2.1, 2.1, 1); g.add(sp);
        g.position.set(it.x, it.y, -it.s); scene.add(g); it.mesh = g;
      }

      let hero = null, heroBlob = mkBlob(1.0);
      function buildHero() {
        if (hero) scene.remove(hero.root);
        hero = CH.hero(CHARS.find(c => c.id === save.char) || CHARS[0]);
        scene.add(hero.root);
      }
      const guard = CH.guard(), dog = CH.dog();
      scene.add(guard.root, dog.root);
      const gBlob = mkBlob(1.3), dBlob = mkBlob(0.9);

      let W = null, R = null, state = 'home', acc = 0, introT = 0, saveT = 0, overShown = false, hudScore = -1, hudCoins = -1, hudMult = -1, cullT = 0, tunK = 0, shake = 0;
      let gd = 30, gx = 0, gy = 0, dgx = 0, homeT = 0, sprayT = 0, leanZ = 0, prevX = 0, airW = 0, bannerT = 0, bigT = 0, toastT = 0, hintI = 0, msnap = null, saveCost = 1, runKeys = 0, runBonus = 0;
      const camP = new THREE.Vector3(), camL = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
      let camY = 0, noBlink = false;

      function resetWorld() {
        clearObsMeshes();
        W = newWorld(); R = newRun();
        addTrain(W, 0, -16, 3, 0);
        W.genS = 36;
        clearChunks();
        gen(W, R);
        acc = 0; gd = 30; leanZ = 0; airW = 0; camY = 0;
        msnap = Object.assign({}, R.st);
      }

      function hudBoards() { E.hbn.textContent = save.boards; E.hb.classList.toggle('none', save.boards <= 0); }
      function refreshHome() {
        E.hbest.textContent = fmt(save.best); E.hcoins.textContent = fmt(save.coins); E.hkeys.textContent = save.keys; E.hboards.textContent = save.boards;
        E.hmult.textContent = 'x' + save.ms.lvl;
        const c = CITIES[save.city]; E.tname.textContent = c.name; E.tsub.textContent = c.sub;
      }
      function show(el, on) { el.classList.toggle('on', !!on); }
      function toHome() {
        state = 'home';
        resetWorld();
        show(E.home, 1); show(E.over, 0); show(E.save, 0); show(E.pausep, 0); show(E.panel, 0);
        E.hud.classList.add('off');
        refreshHome();
        au.music(true); au.jet(false);
        homeT = 0;
        api.score(0);
      }
      function startRun() {
        if (state !== 'home') return;
        au.unlock(); au.play('ui');
        show(E.home, 0); show(E.panel, 0);
        E.hud.classList.remove('off');
        state = 'intro'; introT = 0; R.chase = CFG.START_CHASE; gd = 4.2; gx = 0;
        hudScore = hudCoins = hudMult = -1; runKeys = 0; runBonus = 0; saveCost = 1;
        hudBoards(); updPU(true);
        hintI = save.runs < 3 ? 0 : 99;
        au.music(true);
        if (window.Ameplay && Ameplay.analytics) try { Ameplay.analytics.track('subway_start', { city: CITIES[save.city].id }); } catch (e) {}
      }
      function playAgain() { show(E.over, 0); toHome(); startRun(); }

      function useBoard() {
        if ((state !== 'run' && state !== 'intro') || R.dead || R.board > 0 || save.boards <= 0) return;
        save.boards--; R.board = CFG.BOARD_T; R.st.board++; R.ghost = Math.max(R.ghost, 0.3);
        au.play('board_on'); hudBoards(); persist();
        flash('HOVERBOARD!', 'blue');
      }

      function flash(text, cls) { E.banner.textContent = text; E.banner.className = 'ss-banner on' + (cls ? ' ' + cls : ''); bannerT = 1.6; }
      function toast(text) { E.toast.textContent = text; E.toast.classList.add('on'); toastT = 1.8; }
      function big(text) { E.big.textContent = text; E.big.classList.add('on'); bigT = 0.9; }

      const msets = () => missionSet(save.ms.lvl);
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
        set.forEach((m, i) => {
          if (!save.ms.done[i] && mprog(i, m) >= m.n) { save.ms.done[i] = true; au.play('mission'); flash('Mission complete!'); }
          if (!save.ms.done[i]) all = false;
        });
        if (all) {
          const lvl = save.ms.lvl;
          if (lvl < 30) save.ms.lvl++;
          save.ms.base = [0, 0, 0]; save.ms.done = [false, false, false];
          msnap = Object.assign({}, R.st);
          const reward = 100 + lvl * 50;
          save.coins += reward; if (lvl % 3 === 0) save.keys++;
          flash('Multiplier x' + save.ms.lvl + '!  +' + reward, 'gold');
          E.mult.classList.add('pop'); setTimeout(() => E.mult.classList.remove('pop'), 300);
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

      const puState = {};
      function updPU(force) {
        const act = ['jet', 'sneak', 'mag', 'x2'].filter(k => R[k] > 0);
        if (R.board > 0) act.push('board');
        const key = act.join(',');
        if (force || key !== puState.key) {
          puState.key = key;
          E.pus.innerHTML = act.map(k => `<div class="ss-pu" data-k="${k}">${ic(k === 'board' ? 'board' : k)}<i><b></b></i></div>`).join('');
          puState.els = act.map(k => [k, E.pus.querySelector(`[data-k="${k}"]`)]);
        }
        for (const [k, el] of puState.els || []) {
          const f = k === 'board' ? R.board / CFG.BOARD_T : R[k] / (R[k + 'D'] || 1);
          el.querySelector('b').style.width = (clamp(f, 0, 1) * 100).toFixed(1) + '%';
          el.classList.toggle('low', f < 0.25);
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
        for (const e of R.ev) {
          if (e === 'coin') { au.play('coin'); spark(R.x, R.y + 1.0, -R.s - 0.6, 'y', 1.1); }
          else if (e.startsWith('pu_')) {}
          else if (e === 'crash') { au.play('crash'); shake = 0.5; }
          else if (e === 'caught') { au.play('bump'); au.play('caught'); }
          else if (e === 'bump') { au.play('bump'); shake = 0.25; }
          else if (e === 'board_break') { au.play('board_break'); shake = 0.3; spark(R.x, R.y + 0.3, -R.s, 'p', 4); hudBoards(); }
          else if (e === 'board_end') au.play('board_end');
          else if (e === 'jet_end') au.play('jet_end');
          else au.play(e);
        }
        R.ev.length = 0;
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
        clearObsDone();
        state = 'run'; big('GO!');
      }
      function clearObsDone() { for (const o of W.obs) if (o.done) dropMesh(o); }
      function gameOver() {
        if (state === 'over') return;
        state = 'over'; show(E.save, 0);
        au.jet(false); au.music(false);
        const sc = Math.floor(R.score);
        bankMissions();
        save.coins += R.coins; save.runs++;
        const isBest = sc > save.best; if (isBest) save.best = sc;
        persist();
        api.score(sc); api.submit(sc);
        q('.o-title').textContent = R.dead === 'caught' ? 'Caught!' : 'Crashed!';
        q('.o-new').innerHTML = isBest && sc > 0 ? '<span class="ss-new">NEW HIGH SCORE!</span>' : '';
        q('.o-score').textContent = fmt(sc); q('.o-best').textContent = fmt(save.best); q('.o-coins').textContent = fmt(R.coins + runBonus);
        q('.o-ms').innerHTML = missionRows();
        show(E.over, 1);
        E.hud.classList.add('off');
        if (window.Ameplay && Ameplay.analytics) try { Ameplay.analytics.track('subway_over', { score: sc, coins: R.coins, city: CITIES[save.city].id, t: Math.round(R.t) }); } catch (e) {}
      }
      function pause() {
        if (state !== 'run' && state !== 'intro') return;
        state = 'pause'; au.jet(false); au.music(false);
        q('.pz-ms').innerHTML = missionRows();
        show(E.pausep, 1);
      }
      function resume() { if (state !== 'pause') return; show(E.pausep, 0); state = 'run'; au.music(true); big('GO!'); }

      let panelKind = '', shopTab = 'up';
      function openPanel(kind) {
        panelKind = kind; au.unlock(); au.play('ui');
        renderPanel();
        show(E.panel, 1);
      }
      function renderPanel() {
        const k = panelKind;
        if (k === 'missions') {
          E.ptitle.textContent = 'Missions';
          E.pbody.innerHTML = `<div class="ss-multi">Score multiplier <b>x${save.ms.lvl}</b></div><div class="ss-list">${missionRows()}</div><p class="ss-small">Complete all three missions to raise your multiplier by +1 (up to x30) and win coins.</p>`;
        } else if (k === 'shop') {
          E.ptitle.textContent = 'Shop';
          let body = `<div class="ss-tabs"><button data-tab="up" class="${shopTab === 'up' ? 'on' : ''}">Upgrades</button><button data-tab="it" class="${shopTab === 'it' ? 'on' : ''}">Items</button></div><div class="ss-multi">${ic('coin')}<b>${fmt(save.coins)}</b></div><div class="ss-list">`;
          if (shopTab === 'up') {
            for (const pk of ['jet', 'sneak', 'mag', 'x2']) {
              const lvl = save.upg[pk], maxed = lvl >= UPG_COST.length, cost = UPG_COST[lvl];
              body += `<div class="ss-row">${ic(pk)}<div class="t"><b>${PU[pk].name}</b><small>Lasts ${puDur(lvl)} s${maxed ? '' : ' → ' + puDur(lvl + 1) + ' s'}</small><div class="ss-pips">${UPG_COST.map((_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div></div>${maxed ? '<button class="ss-btn dis">MAX</button>' : `<button class="ss-btn g${save.coins < cost ? ' dis' : ''}" data-buy="${pk}">${ic('coin')}${fmt(cost)}</button>`}</div>`;
            }
          } else {
            body += `<div class="ss-row">${ic('board')}<div class="t"><b>Hoverboard</b><small>Double tap or Space. Lasts 30 s and saves you from one crash. You have ${save.boards}.</small></div><button class="ss-btn g${save.coins < 300 ? ' dis' : ''}" data-buy="board">${ic('coin')}300</button></div>`;
            body += `<div class="ss-row">${ic('mbox')}<div class="t"><b>Mystery Box</b><small>Coins, keys, hoverboards or a jackpot!</small></div><button class="ss-btn g${save.coins < 500 ? ' dis' : ''}" data-buy="mbox">${ic('coin')}500</button></div>`;
            body += `<div class="ss-row">${ic('key')}<div class="t"><b>Key</b><small>Use keys to keep running after a crash (Save me). You have ${save.keys}.</small></div><button class="ss-btn g${save.coins < 2000 ? ' dis' : ''}" data-buy="key">${ic('coin')}2,000</button></div>`;
          }
          E.pbody.innerHTML = body + '</div>';
        } else if (k === 'chars') {
          E.ptitle.textContent = 'Surfers';
          E.pbody.innerHTML = `<div class="ss-multi">${ic('coin')}<b>${fmt(save.coins)}</b></div><div class="ss-chars">${CHARS.map(c => { const own = save.chars.includes(c.id), sel = save.char === c.id; return `<div class="ss-char${sel ? ' sel' : ''}" data-c="${c.id}"><span class="av"></span><b>${c.name}</b>${sel ? '<button class="ss-btn dis">Selected</button>' : own ? `<button class="ss-btn" data-sel="${c.id}">Select</button>` : `<button class="ss-btn g${save.coins < c.price ? ' dis' : ''}" data-unl="${c.id}">${ic('coin')}${fmt(c.price)}</button>`}</div>`; }).join('')}</div>`;
          E.pbody.querySelectorAll('.ss-char').forEach(el => el.querySelector('.av').replaceWith(avatar(CHARS.find(c => c.id === el.dataset.c))));
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
      api.on(E.panel, 'click', e => {
        const t = e.target.closest('button');
        if (e.target === E.panel || (t && t.classList.contains('x'))) { show(E.panel, 0); au.play('ui'); return; }
        if (!t) return;
        if (t.dataset.tab) { shopTab = t.dataset.tab; au.play('ui'); renderPanel(); }
        else if (t.dataset.buy) buy(t.dataset.buy);
        else if (t.dataset.sel) { save.char = t.dataset.sel; persist(); buildHero(); au.play('ui'); renderPanel(); }
        else if (t.dataset.unl) { const c = CHARS.find(x => x.id === t.dataset.unl); if (c && save.coins >= c.price) { save.coins -= c.price; save.chars.push(c.id); save.char = c.id; persist(); buildHero(); au.play('buy'); renderPanel(); refreshHome(); } }
      });
      api.on(q('.ss-menu'), 'click', e => { const b = e.target.closest('[data-o]'); if (b) openPanel(b.dataset.o); });
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
        if (state === 'run' || state === 'intro') {
          if (KM[k]) { e.preventDefault(); if (!e.repeat) input(KM[k]); }
          else if (k === 'Space') { e.preventDefault(); if (!e.repeat) useBoard(); }
          else if (k === 'KeyP') pause();
        } else if (state === 'home') {
          if (E.panel.classList.contains('on')) { if (k === 'Escape') show(E.panel, 0); return; }
          if (k === 'Space' || k === 'Enter' || k === 'ArrowUp' || k === 'KeyW') { e.preventDefault(); startRun(); }
          else if (k === 'ArrowLeft') city(-1); else if (k === 'ArrowRight') city(1);
        } else if (state === 'over') { if (k === 'Space' || k === 'Enter') { e.preventDefault(); playAgain(); } }
        else if (state === 'pause') { if (k === 'KeyP' || k === 'Space' || k === 'Enter') { e.preventDefault(); resume(); } }
        else if (state === 'save') { if (k === 'Space' || k === 'Enter') { e.preventDefault(); useSave(); } }
      });
      let pd = null, lastTap = 0, lastTapX = 0, lastTapY = 0;
      api.on(wrap, 'pointerdown', e => {
        if (e.target.closest('button') || e.target.closest('.ss-card')) return;
        au.unlock();
        pd = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), fired: false };
      });
      api.on(wrap, 'pointermove', e => {
        if (!pd || pd.id !== e.pointerId || pd.fired) return;
        const dx = e.clientX - pd.x, dy = e.clientY - pd.y, th = Math.max(16, wrap.clientWidth * 0.035);
        if (Math.max(Math.abs(dx), Math.abs(dy)) < th) return;
        pd.fired = true;
        input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      });
      const pend = e => {
        if (!pd || pd.id !== e.pointerId) return;
        const p = pd; pd = null;
        if (p.fired) return;
        const now = performance.now();
        if (state === 'home' && e.type === 'pointerup' && !E.panel.classList.contains('on')) { startRun(); return; }
        if ((state === 'run' || state === 'intro') && now - p.t < 300) {
          if (now - lastTap < 330 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 60) { useBoard(); lastTap = 0; }
          else { lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY; }
        }
      };
      api.on(wrap, 'pointerup', pend);
      api.on(wrap, 'pointercancel', pend);
      api.on(document, 'visibilitychange', () => { if (document.hidden) pause(); });

      const HINTS = COARSE ? [['Swipe left or right', 'to switch lanes'], ['Swipe up to jump', 'swipe down to roll'], ['Double tap', 'to use a hoverboard']] : [['← → to switch lanes', 'or A / D'], ['↑ jump  ·  ↓ roll', 'roll in the air to drop fast'], ['Space: hoverboard', 'it saves you from one crash']];
      function hintTick() {
        if (hintI >= HINTS.length) return;
        const at = 1.0 + hintI * 3.4, t = R.t;
        if (t > at && t < at + 3.0) { if (!E.hint.classList.contains('on')) { E.hint.innerHTML = HINTS[hintI][0] + '<small>' + HINTS[hintI][1] + '</small>'; E.hint.classList.add('on'); } }
        else if (t >= at + 3.0) { E.hint.classList.remove('on'); hintI++; }
      }

      function syncWorld(dt, t) {
        const s = R.s;
        syncChunks(s);
        const ts = Math.floor(s / 4) * 4;
        track.position.z = -ts; rails.position.z = -ts;
        far.position.set(0, -0.08, -s - 200);
        for (const o of W.obs) {
          if (o.done) { dropMesh(o); continue; }
          if (!o.mesh && o.s0 < s + 215) obsMesh(o);
          if (o.mesh && o.moving) o.mesh.position.z = -o.s0;
        }
        for (const it of W.items) {
          if (it.got) { dropMesh(it); continue; }
          if (!it.mesh && it.s < s + 190) itemMesh(it);
          if (it.mesh) { it.mesh.children[0].rotation.y = t * 2.4; it.mesh.position.y = it.y + Math.sin(t * 3 + it.s) * 0.12; const sp = it.mesh.children[1]; const k = 1.9 + 0.25 * Math.sin(t * 6); sp.scale.set(k, k, 1); }
        }
        const spin = t * 3.2;
        let n = 0;
        for (const c of W.coins) {
          if (c.got) continue;
          const ds = c.s - s;
          if (ds > 180 || ds < -6) continue;
          dummy.position.set(c.x, c.y, -c.s); dummy.rotation.set(0, spin, 0); dummy.updateMatrix();
          coinIM.setMatrixAt(n++, dummy.matrix);
          if (n >= MAXC) break;
        }
        coinIM.count = n; coinIM.instanceMatrix.needsUpdate = true;
        for (const sp of sparks) if (sp.visible) { sp.userData.t += dt; const f = sp.userData.t / 0.3; if (f >= 1) sp.visible = false; else { const k = sp.userData.s * (0.4 + f); sp.scale.set(k, k, 1); sp.material.opacity = 1 - f; } }
      }

      function syncHero(dt, t) {
        const H = hero;
        const xv = (R.x - prevX) / Math.max(dt, 1e-3); prevX = R.x;
        leanZ = damp(leanZ, clamp(-xv * 0.018, -0.38, 0.38), 14, dt);
        airW = damp(airW, R.grounded || R.jet > 0 ? 0 : 1, 16, dt);
        let mode = 'run';
        if (state === 'home') mode = 'idle';
        else if (R.dead) mode = R.dead === 'caught' ? 'caught' : 'dead';
        else if (R.jet > 0) mode = 'jet';
        else if (R.board > 0) mode = 'board';
        const st = { mode, speed: R.speed, air: airW, vy: R.vy, roll: R.rollT > 0 ? 1 : 0, rollP: R.rollT > 0 ? 1 - R.rollT / R.rollD : 0, stumble: R.stumbleT / 0.45, leanZ: mode === 'run' || mode === 'board' ? leanZ : 0, spray: false, can: false, deadT: R.deadT };
        if (state === 'home') { sprayT += dt; st.spray = (sprayT % 7) > 3.5; st.can = true; }
        CH.animHero(H, st, dt, t);
        H.root.position.set(R.x, R.y, -R.s);
        let yaw = 0;
        if (state === 'home') yaw = st.spray ? 0.95 : 0.12 + 0.08 * Math.sin(t * 0.8);
        else if (state === 'intro') yaw = lerp(0.6, 0, ease(clamp(introT / 0.5, 0, 1)));
        else if (mode === 'run') yaw = clamp(-xv * 0.012, -0.35, 0.35);
        H.root.rotation.y = damp(H.root.rotation.y, yaw, 12, dt);
        if (mode === 'dead') { const k = clamp(R.deadT * 5, 0, 1); H.root.position.z += 0.6 * k; H.body.rotation.x = lerp(0, 1.25, ease(k)); H.root.position.y = R.y + 0.1 * Math.sin(k * Math.PI); }
        else H.body.rotation.x = 0;
        H.root.visible = noBlink || !(R.ghost > 0 && R.jet <= 0 && !R.dead && Math.floor(t * 12) % 3 === 0);
        const sup = R.jet > 0 ? supportAt(W, laneOf(R.x), R.s) : supportAt(W, laneOf(R.x), R.s);
        const hgt = Math.max(0, R.y - sup);
        heroBlob.position.set(R.x, sup + 0.03, -R.s);
        const bs = clamp(1 - hgt * 0.1, 0.35, 1);
        heroBlob.scale.set(0.95 * bs, 1, 1.1 * bs);
      }

      function syncGuard(dt, t) {
        let target = 30, vis = true;
        if (state === 'home') { target = 40; }
        else if (R.dead === 'caught' || R.dead === 'crash') target = R.dead === 'caught' ? 1.25 : 1.9;
        else if (R.jet > 0) target = 40;
        else if (R.chase > 0) target = 2.25;
        const k = target < gd ? (R.dead ? 4 : 2.6) : 0.7;
        gd = damp(gd, target, k, dt);
        if (gd > 20) vis = false;
        guard.root.visible = dog.root.visible = gBlob.visible = dBlob.visible = vis;
        if (!vis) return;
        gx = damp(gx, R.x + (R.dead ? 0.15 : R.x > 0.5 ? -0.6 : 0.6), 5, dt);
        const gs = R.s - gd;
        const sup = supportAt(W, laneOf(gx), gs);
        gy = damp(gy, sup, 10, dt);
        const run = !(R.dead && gd < target + 0.25);
        const sp = R.dead ? (run ? 9 : 0) : R.speed;
        guard.grab = !!R.dead;
        CH.animGuard(guard, sp, dt, t, run ? 'run' : 'grab');
        guard.root.position.set(gx, gy, -gs);
        guard.root.rotation.y = 0;
        gBlob.position.set(gx, gy + 0.03, -gs);
        dgx = damp(dgx, R.x + (gx > R.x ? -0.75 : 0.75), 6, dt);
        const ds = gs + (R.dead ? 0.2 : 1.1);
        const dsup = supportAt(W, laneOf(dgx), ds);
        CH.animDog(dog, sp * 1.05, dt, t, run ? 'run' : 'bark');
        dog.root.position.set(dgx, dsup, -ds);
        dBlob.position.set(dgx, dsup + 0.03, -ds);
      }

      function camRun(out, look, dt) {
        const tun = inTunnel(W, R.s + 2);
        const sp0 = supportAt(W, laneOf(R.x), R.s), yT = R.jet > 0 || R.grounded ? R.y : lerp(sp0, R.y, 0.6);
        camY = damp(camY, yT, R.jet > 0 ? 3 : 6, dt);
        const base = portrait ? 4.6 : 3.95, back = portrait ? 6.9 : 5.8;
        let cy = base + camY * 0.88;
        if (tun) cy = Math.min(cy, 8.2);
        out.set(R.x * 0.72, cy, -R.s + back);
        look.set(R.x * 0.9, 1.05 + camY * 0.85, -R.s - (portrait ? 9 : 10));
      }
      function camHome(out, look) {
        out.set(portrait ? 0.55 : 1.05, portrait ? 1.7 : 1.55, -R.s - (portrait ? 4.6 : 3.7));
        look.set(portrait ? 0.05 : -0.55, portrait ? 1.25 : 1.12, -R.s + 0.2);
      }

      function frameUI(dt) {
        const sc = Math.floor(R.score);
        if (sc !== hudScore) { hudScore = sc; E.sv.textContent = fmt(sc); if (state === 'run') api.score(sc); }
        if (R.coins !== hudCoins) { hudCoins = R.coins; E.cv.textContent = fmt(R.coins); }
        const m = save.ms.lvl * (R.x2 > 0 ? 2 : 1);
        if (m !== hudMult) { hudMult = m; E.mult.textContent = 'x' + m; E.mult.classList.toggle('x2', R.x2 > 0); }
        updPU(false);
        E.hb.classList.toggle('on', R.board > 0);
        if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) E.banner.classList.remove('on'); }
        if (bigT > 0) { bigT -= dt; if (bigT <= 0) E.big.classList.remove('on'); }
        if (toastT > 0) { toastT -= dt; if (toastT <= 0) E.toast.classList.remove('on'); }
      }

      let perfN = 0, perfT = 0, perfCool = 2;
      function perf(dt) {
        perfCool -= dt;
        if (state !== 'run' || perfCool > 0) { perfN = 0; perfT = 0; return; }
        perfN++; perfT += dt;
        if (perfN >= 90) {
          const avg = perfT / perfN;
          if (avg > 1 / 50 && prCap > 0.8) { prCap = Math.max(0.8, prCap * 0.82); renderer.setPixelRatio(prCap); perfCool = 2.5; }
          perfN = 0; perfT = 0;
        }
      }

      buildHero();
      buildCity(save.city);
      toHome();
      try { if (document.fonts && !document.fonts.check('40px "Lilita One"')) document.fonts.load('40px "Lilita One"').then(() => { if (api.alive && state === 'home' && document.fonts.check('40px "Lilita One"')) { buildCity(save.city); resetWorld(); } }).catch(() => {}); } catch (e) {}
      camHome(camP, camL);

      api.loop((dt, t) => {
        t /= 1000;
        capPR(); perf(dt);
        if (state === 'run' || state === 'intro') {
          acc += dt;
          let n = 0;
          const ctx = { mult: save.ms.lvl };
          if (R.dead) { step(W, R, dt, ctx); acc = 0; }
          else while (acc >= CFG.STEP && n++ < 10) { step(W, R, CFG.STEP, ctx); acc -= CFG.STEP; if (R.dead) break; }
          if (n >= 10) acc = 0;
          collect(W, R, dt, 0, onItem);
          if (!R.dead) gen(W, R);
          cullT -= dt;
          if (cullT <= 0) { cullT = 0.3; cull(W, R, dropMesh); W.coins = W.coins.filter(c => !c.got && c.s > R.s - CFG.BEHIND); }
          handleEvents();
          checkMissions();
          hintTick();
          au.jet(R.jet > 0 && !R.dead);
          if (state === 'intro') { introT += dt; if (introT >= 1.0) state = 'run'; }
          if (R.dead && R.dead !== 'quit' && R.deadT > 1.1) { if (R.dead === 'crash' || R.dead === 'caught') showSave(); }
          frameUI(dt);
        } else if (state === 'save') {
          saveT += dt;
          step(W, R, dt, { mult: save.ms.lvl });
          const f = clamp(saveT / 4.5, 0, 1);
          E.sarc.style.strokeDashoffset = (276.5 * f).toFixed(1);
          if (f >= 1) gameOver();
        } else if (state === 'over') step(W, R, dt, { mult: 1 });
        else if (state === 'home') homeT += dt;
        syncWorld(dt, t);
        syncHero(dt, t);
        syncGuard(dt, t);
        const tun = inTunnel(W, R.s);
        tunK = damp(tunK, tun ? 1 : 0, 4, dt);
        const L = ENV.light;
        hemi.intensity = (0.95 - 0.42 * tunK) * L; sun.intensity = (0.72 - 0.5 * tunK) * L;
        if (state === 'home') camHome(tmpP, tmpL);
        else if (state === 'intro') { camHome(camP, camL); camRun(tmpP, tmpL, dt); const k = ease(clamp(introT / 1.0, 0, 1)); tmpP.lerpVectors(camP, tmpP, k); tmpL.lerpVectors(camL, tmpL, k); }
        else if (state === 'pause') {}
        else camRun(tmpP, tmpL, dt);
        if (state !== 'pause') {
          if (state === 'run' || state === 'save' || state === 'over') { camP.x = damp(camP.x, tmpP.x, 9, dt); camP.y = damp(camP.y, tmpP.y, 7, dt); camP.z = tmpP.z; camL.x = damp(camL.x, tmpL.x, 9, dt); camL.y = damp(camL.y, tmpL.y, 7, dt); camL.z = tmpL.z; }
          else { camP.copy(tmpP); camL.copy(tmpL); }
        }
        cam.position.copy(camP);
        if (shake > 0) { shake = Math.max(0, shake - dt); cam.position.x += (Math.random() - 0.5) * shake * 0.6; cam.position.y += (Math.random() - 0.5) * shake * 0.6; }
        cam.lookAt(camL);
        skyPlane.position.set(cam.position.x * 0.9, 52, cam.position.z - 340);
        sunSprite.position.set(cam.position.x - 120, 150, cam.position.z - 330);
        sun.position.set(cam.position.x - 20, 40, cam.position.z + 25); sun.target.position.set(cam.position.x, 0, cam.position.z - 10);
        au.tick();
        renderer.render(scene, cam);
      });

      wrap._ss = { get W() { return W; }, get R() { return R; }, get state() { return state; }, save, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, pr: renderer.getPixelRatio(), geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures }), act: a => input(a), set noBlink(v) { noBlink = v; }, clearChunks: () => clearChunks(), give(k) { if (state === 'run') onItem({ k, x: R.x, y: R.y, s: R.s }); }, city: d => city(d) };
      return {
        destroy() {
          au.close();
          if (ENV) ENV.dispose();
          const all = new Set(bin);
          scene.traverse(o => { if (o.geometry) all.add(o.geometry); const m = o.material; if (m) for (const x of Array.isArray(m) ? m : [m]) { all.add(x); if (x.map) all.add(x.map); } });
          for (const k in IM) IM[k].traverse(o => { if (o.geometry) all.add(o.geometry); });
          all.forEach(x => { try { x.dispose && x.dispose(); } catch (e) {} });
        }
      };
    }
  });
