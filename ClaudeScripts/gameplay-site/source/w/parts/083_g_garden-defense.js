
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const OL = '#26190d';
  const CFG = {
    hz: 100, lawnX: 40, cellW: 80, lawnY: 80, cellH: 100, foot: 88,
    sunStart: 50, sunFirst: 150, sunCap: 9990,
    skyFirst: [250, 450], skyBase: 380, skyStep: 10, skyMax: 950, skyRange: 275,
    skyX: [100, 649], skyY: 60, skyVy: 0.67, skyGround: [300, 549], sunLife: 750, sunBlink: 300,
    flowerFirst: [300, 1250], flowerRate: [2350, 2500], popG: 0.09,
    peaSpeed: 3.33, peaDmg: 20, chill: 1000, chillMul: 0.5,
    eatDmg: 4, eatTicks: 4, eatOverlap: 20,
    firstWave: 1300, firstWave2: 3500, waveGap: 2500, waveRange: 600, waveFast: 200, waveMinAge: 400,
    hugeWave: 750, bowlFlagGap: 4500, healthNext: [0.5, 0.65],
    mowerX: -21, mowerSpeed: 3.33, houseX: -43,
    boom: 1800, cherryFuse: 100, cherryR: 115, potatoArm: 1500, potatoRise: 50, potatoR: 60, nutBoomR: 90,
    chompBite: 70, chompDigest: 4000, chompSwallow: 70, vault: 110, gasp: 160,
    bowlSpeed: 1.25, bowlVy: 2, bowlHit: 1800, bowlHelm: 900, bowlPaper: 400,
    slots: 6, beltMax: 8, beltSpeed: 0.008, initRefresh: { 5000: 3500, 3000: 2000 },
    squashAim: 45, squashJump: 55, squashR: 50, jalaFuse: 100, spikeRate: 100, spikeDmg: 20, smash: 70, smashEnd: 115, impFly: 70,
    waves: [5, 8, 10, 10, 8, 12, 16, 16, 20, 20, 20, 20, 20, 24, 30]
  };
  const ORDER = ['peashooter', 'sunflower', 'cherrybomb', 'wallnut', 'potatomine', 'snowpea', 'chomper', 'repeater', 'squash', 'spikeweed', 'jalapeno', 'torchwood', 'threepeater', 'tallnut', 'puffshroom'];
  const PL = {
    peashooter: { name: 'Peashooter', cost: 100, refresh: 750, hp: 300, rate: 150, desc: 'Shoots peas at zombies in its lane. Each pea does 20 damage.' },
    sunflower: { name: 'Sunflower', cost: 50, refresh: 750, hp: 300, rate: 2500, desc: 'Makes 25 extra sun about every 24 seconds. Plant plenty of them early!' },
    cherrybomb: { name: 'Cherry Bomb', cost: 150, refresh: 5000, hp: 300, desc: 'Blows up every zombie in the 3x3 area around it.' },
    wallnut: { name: 'Wall-nut', cost: 50, refresh: 3000, hp: 4000, desc: 'A tough shell that keeps zombies busy while your shooters work.' },
    potatomine: { name: 'Potato Mine', cost: 25, refresh: 3000, hp: 300, desc: 'Explodes under the first zombie to step on it, but takes 15 seconds to arm.' },
    snowpea: { name: 'Snow Pea', cost: 175, refresh: 750, hp: 300, rate: 150, desc: 'Frozen peas hurt zombies and slow them to half speed.' },
    chomper: { name: 'Chomper', cost: 150, refresh: 750, hp: 300, desc: 'Gulps down a whole zombie, then chews for about 40 seconds.' },
    repeater: { name: 'Repeater', cost: 200, refresh: 750, hp: 300, rate: 150, desc: 'Fires two peas at a time. Twice the punch of a Peashooter.' },
    squash: { name: 'Squash', cost: 50, refresh: 3000, hp: 300, desc: 'Leaps onto the first zombie that gets close and squashes it flat.' },
    spikeweed: { name: 'Spikeweed', cost: 100, refresh: 750, hp: 300, rate: 100, desc: 'Pops tyres and hurts every zombie that walks over it. Zombies cannot eat it.' },
    jalapeno: { name: 'Jalapeno', cost: 125, refresh: 5000, hp: 300, desc: 'Explodes in a wall of fire that burns every zombie in its lane.' },
    torchwood: { name: 'Torchwood', cost: 175, refresh: 750, hp: 300, desc: 'Peas that pass through it turn into fireballs that do double damage.' },
    threepeater: { name: 'Threepeater', cost: 325, refresh: 750, hp: 300, rate: 150, desc: 'Shoots peas in three lanes at once.' },
    tallnut: { name: 'Tall-nut', cost: 125, refresh: 3000, hp: 8000, desc: 'A towering wall twice as tough as a Wall-nut. Pole vaulters cannot jump over it.' },
    puffshroom: { name: 'Puff-shroom', cost: 0, refresh: 750, hp: 300, rate: 150, desc: 'Free to plant. Spits short-range spores at zombies in its lane, up to three tiles ahead.' },
    bowlnut: { name: 'Wall-nut', cost: 0, refresh: 0, hp: 4000 },
    boomnut: { name: 'Explode-o-nut', cost: 0, refresh: 0, hp: 4000 }
  };
  const ZD = {
    zombie: { name: 'Zombie', body: 270, spt: 4.7, value: 1, weight: 4000, wave: 1, vary: 1 },
    flag: { name: 'Flag Zombie', body: 270, spt: 3.7, value: 1, weight: 0, wave: 1 },
    cone: { name: 'Conehead Zombie', body: 270, helm: 370, helmType: 'cone', spt: 4.7, value: 2, weight: 4000, wave: 1, vary: 1 },
    pole: { name: 'Pole Vaulting Zombie', body: 500, spt: 2.5, after: 4.7, value: 2, weight: 2000, wave: 5 },
    bucket: { name: 'Buckethead Zombie', body: 270, helm: 1100, helmType: 'bucket', spt: 4.7, value: 4, weight: 3000, wave: 1, vary: 1 },
    news: { name: 'Newspaper Zombie', body: 270, paper: 150, spt: 4.7, mad: 1.8, value: 2, weight: 1000, wave: 1, vary: 1 },
    screen: { name: 'Screen Door Zombie', body: 270, door: 1100, spt: 4.7, value: 4, weight: 2000, wave: 2, vary: 1 },
    football: { name: 'Football Zombie', body: 270, helm: 1400, helmType: 'football', spt: 2.5, value: 6, weight: 2000, wave: 3, vary: 1, steady: 1 },
    garg: { name: 'Gargantuar', body: 3000, spt: 7.2, value: 10, weight: 1200, wave: 6 },
    imp: { name: 'Imp', body: 70, spt: 2.8, value: 2, weight: 0, wave: 1 }
  };
  const ALL = [0, 1, 2, 3, 4];
  const DAY = ['zombie', 'cone', 'pole', 'bucket', 'news', 'screen'];
  const LV = [
    { rows: [1, 2, 3], roll: [1, 3], z: ['zombie'], seeds: ORDER.slice(0, 2), award: 'cherrybomb', tut: 1 },
    { rows: ALL, roll: [0, 4], z: ['zombie', 'cone'], seeds: ORDER.slice(0, 3), award: 'wallnut', intro: 'cone' },
    { rows: ALL, z: ['zombie', 'cone'], seeds: ORDER.slice(0, 4), award: 'potatomine' },
    { rows: ALL, z: ['zombie', 'cone', 'pole'], seeds: ORDER.slice(0, 5), award: 'shovel', intro: 'pole' },
    { rows: ALL, z: ['zombie', 'cone'], bowl: 1, seeds: [], award: 'snowpea' },
    { rows: ALL, z: ['zombie', 'cone', 'pole', 'bucket'], seeds: ORDER.slice(0, 6), award: 'chomper', intro: 'bucket' },
    { rows: ALL, z: ['zombie', 'cone', 'pole', 'bucket', 'news'], seeds: ORDER.slice(0, 7), award: 'repeater', intro: 'news' },
    { rows: ALL, z: ['zombie', 'cone', 'bucket', 'news', 'screen'], seeds: ORDER.slice(0, 8), award: 'squash', intro: 'screen', slots: 7 },
    { rows: ALL, z: DAY, seeds: ORDER.slice(0, 9), award: 'spikeweed', slots: 7 },
    { rows: ALL, z: DAY, belt: 1, seeds: [], award: 'jalapeno' },
    { rows: ALL, z: [...DAY, 'football'], seeds: [...ORDER.slice(0, 11), 'puffshroom'], award: 'torchwood', intro: 'football', slots: 7, dusk: 1 },
    { rows: ALL, z: [...DAY, 'football'], seeds: [...ORDER.slice(0, 12), 'puffshroom'], award: 'threepeater', slots: 8, dusk: 1 },
    { rows: ALL, z: [...DAY, 'football'], seeds: [...ORDER.slice(0, 13), 'puffshroom'], award: 'tallnut', slots: 8, dusk: 1 },
    { rows: ALL, z: [...DAY, 'football', 'garg'], seeds: [...ORDER.slice(0, 14), 'puffshroom'], award: 'note', intro: 'garg', slots: 8, dusk: 1 },
    { rows: ALL, z: [...DAY, 'football', 'garg'], seeds: [...ORDER.slice(0, 14), 'puffshroom'], award: 'trophy', slots: 8, dusk: 1 }
  ];
  const NLV = LV.length;
  const lvName = i => i < 10 ? '1-' + (i + 1) : '2-' + (i - 9);
  const BELT10 = [['peashooter', 18], ['cherrybomb', 16], ['wallnut', 14], ['repeater', 18], ['snowpea', 10], ['chomper', 5], ['potatomine', 10], ['squash', 9]];
  const AWARD = {
    shovel: { name: 'Shovel', head: 'You got the Shovel!', desc: 'Dig up any plant to make room for a better one. Find it next to your seed packets.' },
    note: { name: 'A Note', head: 'You found a note!', desc: '"Dear homeowner, we have a really big friend coming over for dinner. Yours truly, the zombies"' },
    trophy: { name: 'Golden Trophy', head: 'You saved the garden!', desc: 'Every daytime and dusk attack has been pushed back. You are a true zombie-proof gardener!' }
  };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const ease = k => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
  const ov = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0);
  const mulberry = s => () => {
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  function makeGame(li, opt) {
    opt = opt || {};
    const L = LV[li], rows = L.rows;
    const R = mulberry(opt.seed == null ? Math.random() * 2147483647 | 0 : opt.seed);
    const rnd = k => Math.floor(R() * k);
    const rr = (a, b) => a + rnd(b - a + 1);
    const rf = (a, b) => a + R() * (b - a);
    const sfx = opt.sfx || (() => {});
    const n = CFG.waves[li], perFlag = n < 10 ? n : 10;
    const isFlag = w => li > 0 && w % perFlag === perFlag - 1;
    const rowTop = r => CFG.lawnY + r * CFG.cellH;
    const foot = r => rowTop(r) + CFG.foot;
    const spd = (s, a, b) => 80 / (s * 100) * rf(a, b);
    const mkCards = list => list.map(type => { const d = PL[type], cd = CFG.initRefresh[d.refresh] || 0; return { type, cd, max: cd || d.refresh, fl: 0 }; });
    const G = {
      li, L, rows, n, isFlag, rowTop, foot, t: 0, uid: 0,
      sun: li === 0 ? CFG.sunFirst : li >= 10 ? 75 : CFG.sunStart,
      grid: ALL.map(() => new Array(9).fill(null)),
      plants: [], zombies: [], peas: [], suns: [], nuts: [], parts: [],
      mowers: rows.map(r => ({ row: r, x: CFG.mowerX, st: 'ready', t: 0 })),
      cards: mkCards(opt.seeds || L.seeds), belt: [], beltCd: 200,
      wave: 0, waves: [], zc: li === 1 ? CFG.firstWave2 : CFG.firstWave, zcStart: 0, hugeCd: 0, hpNext: -1, hpStart: 0,
      sunCd: rr(CFG.skyFirst[0], CFG.skyFirst[1]), sunsFallen: 0, sunGot: 0, finalSnd: 0,
      msg: null, award: null, state: 'play', loser: null, lostDone: false,
      lastDeath: { x: 600, y: 300 }, shake: 0, kills: 0, heat: [0, 0, 0, 0, 0],
      tut: L.tut ? 1 : 0, sunDest: { x: 46, y: 32 }
    };
    G.zcStart = G.zc;
    G.setSeeds = list => { G.cards = mkCards(list); };
    const dead = z => z.st === 'die' || z.st === 'burn' || z.st === 'mow' || z.gone;
    const alive = z => !dead(z) && z.head;
    G.dead = dead; G.alive = alive;
    const part = o => { if (G.parts.length < 280) { o.t = 0; o.rot = o.rot || 0; G.parts.push(o); } return o; };
    const sweep = a => { let j = 0; for (let i = 0; i < a.length; i++) if (!a[i].gone) a[j++] = a[i]; a.length = j; };

    function pickType(pts, w) {
      let tot = 0; const c = [];
      for (const t of L.z) { const d = ZD[t]; if (d.weight && w + 1 >= d.wave && pts >= d.value) { c.push(t); tot += d.weight; } }
      if (!c.length) return 'zombie';
      let k = R() * tot;
      for (const t of c) { k -= ZD[t].weight; if (k < 0) return t; }
      return c[c.length - 1];
    }
    for (let w = 0; w < n; w++) {
      const list = []; let pts = Math.floor(w / 3) + 1;
      const put = t => { list.push(t); pts -= ZD[t].value; };
      const fin = w === n - 1;
      if (isFlag(w)) { const plain = Math.min(pts, 8); pts = Math.floor(pts * 2.5); for (let i = 0; i < plain; i++) put('zombie'); put('flag'); }
      if (L.bowl) pts *= 4;
      if (L.intro && (w === n >> 1 || fin)) put(L.intro);
      if (fin) for (const t of L.z) if (ZD[t].weight && !list.includes(t)) put(t);
      while (pts > 0 && list.length < 50) put(pickType(pts, w));
      G.waves.push(list);
    }

    function pickRow() {
      let tot = 0; const w = [];
      for (const r of rows) { const v = 1 / (1 + 1.6 * G.heat[r]); w.push(v); tot += v; }
      let k = R() * tot, i = 0;
      while (i < w.length - 1 && k >= w[i]) { k -= w[i]; i++; }
      const r = rows[i];
      for (const q of rows) G.heat[q] *= 0.62;
      G.heat[r] += 1;
      return r;
    }
    function addZombie(type, row, wave, x) {
      const d = ZD[type];
      const z = {
        id: ++G.uid, type, row, wave, by: foot(row),
        x: x != null ? x : type === 'pole' ? 927 + rnd(10) : 837 + rnd(40) + (isFlag(wave) ? 40 : 0),
        hp: d.body, hpMax: d.body, helm: d.helm || 0, helmMax: d.helm || 0, helmType: d.helmType || null,
        paper: d.paper || 0, door: d.door || 0, doorMax: d.door || 1, pole: type === 'pole', mad: false, thrown: false, big: type === 'garg',
        sp: type === 'pole' ? spd(d.spt, 0.985, 1.015) : d.vary ? spd(d.spt, 0.836, 1.164) : spd(d.spt, 1, 1),
        st: 'walk', t: 0, ph: R() * TAU, age: 0, arm: true, head: true, chill: 0, flash: 0, eatT: 0, target: null,
        alt: 0, groan: 300 + rnd(1200), x0: 0, x1: 0, poleX: 0, dir: 1
      };
      G.zombies.push(z);
      return z;
    }
    G.addZombie = addZombie;
    function waveHealth(w) {
      let h = 0;
      for (const z of G.zombies) if (z.wave === w && alive(z)) h += z.hp + z.helm + z.paper + z.door;
      return h;
    }
    function nextWaveComing() {
      if (G.wave + 1 === n) { G.msg = { k: 'final', t: 0 }; G.finalSnd = 60; }
      if (G.wave === 0) { sfx('awooga'); if (li === 0) G.msg = { k: 'first', t: 0 }; }
      else if (isFlag(G.wave)) sfx('siren');
    }
    function spawnWave() {
      for (const t of G.waves[G.wave]) addZombie(t, pickRow(), G.wave);
      G.wave++;
    }
    function updWaves() {
      if (G.tut === 1 || G.award) return;
      if (G.finalSnd > 0 && --G.finalSnd === 0) sfx('final');
      if (G.hugeCd > 0) {
        G.hugeCd--;
        if (G.hugeCd === 0) { nextWaveComing(); G.zc = 1; }
        else { if (G.hugeCd === 725) sfx('hugewave'); return; }
      }
      if (G.wave >= n) return;
      G.zc--;
      if (G.zc > CFG.waveFast && G.zcStart - G.zc > CFG.waveMinAge && waveHealth(G.wave - 1) <= G.hpNext) G.zc = CFG.waveFast;
      if (G.zc === 5) {
        if (isFlag(G.wave)) { G.msg = { k: 'huge', t: 0 }; G.hugeCd = CFG.hugeWave; return; }
        nextWaveComing();
      }
      if (G.zc <= 0) {
        spawnWave();
        G.hpStart = waveHealth(G.wave - 1);
        if (L.bowl && isFlag(G.wave)) { G.hpNext = 0; G.zc = CFG.bowlFlagGap; }
        else { G.hpNext = rf(CFG.healthNext[0], CFG.healthNext[1]) * G.hpStart; G.zc = CFG.waveGap + rnd(CFG.waveRange); }
        G.zcStart = G.zc;
      }
    }
    G.progress = () => {
      if (G.wave >= n) return 1;
      const f = G.zcStart > 0 ? clamp(1 - Math.max(0, G.zc) / G.zcStart, 0, 1) : 0;
      return clamp((G.wave + (G.hugeCd > 0 ? 1 : f) * 0.98) / n, 0, 1);
    };

    function addSun(x, y, kind, gy) {
      const s = kind === 'sky'
        ? { x, y, gy, vx: 0, vy: CFG.skyVy, st: 'fall', v: 25, sc: 1, t: 0, rot: R() * TAU }
        : { x, y, gy, vx: rf(-0.4, 0.4), vy: -1.7 - rf(0, 1.7), st: 'pop', v: 25, sc: 0.4, t: 0, rot: R() * TAU };
      G.suns.push(s);
      return s;
    }
    function updSky() {
      if (L.bowl || L.belt || G.award || G.tut === 1) return;
      if (--G.sunCd > 0) return;
      G.sunsFallen++;
      G.sunCd = Math.min(CFG.skyMax, CFG.skyBase + G.sunsFallen * CFG.skyStep) + rnd(CFG.skyRange);
      addSun(rr(CFG.skyX[0], CFG.skyX[1]) + 40, CFG.skyY + 40, 'sky', rr(CFG.skyGround[0], CFG.skyGround[1]) + 40);
    }
    function updBelt() {
      if (!L.bowl && !L.belt) return;
      for (let i = 0; i < G.belt.length; i++) { const b = G.belt[i]; if (b.pos > i) b.pos = Math.max(i, b.pos - CFG.beltSpeed); }
      if (G.award || --G.beltCd > 0) return;
      const k = G.belt.length;
      G.beltCd = k > 8 ? 1000 : k > 6 ? 500 : k > 4 ? 425 : 400;
      if (k >= CFG.beltMax) return;
      let type;
      if (L.bowl) type = R() < 0.85 ? 'bowlnut' : 'boomnut';
      else { let r = R() * 100; type = BELT10[0][0]; for (const [t, wt] of BELT10) { r -= wt; if (r < 0) { type = t; break; } } }
      G.belt.push({ type, pos: CFG.beltMax + 0.3, id: ++G.uid });
    }

    function dirt(x, y, k) {
      for (let i = 0; i < k; i++) part({ k: 'dirt', x: x + rf(-18, 18), y: y - rf(0, 6), vx: rf(-1.2, 1.2), vy: rf(-3.2, -1.2), g: 0.16, life: 40 + rnd(20), r: rf(2, 4.5), gy: y + rf(0, 4) });
    }
    G.canPlant = (type, col, row) => {
      if (G.state !== 'play' || G.award) return false;
      if (col < 0 || col > 8 || !rows.includes(row)) return false;
      if (type === 'bowlnut' || type === 'boomnut') return col <= 2;
      return !G.grid[row][col];
    };
    function addPlant(type, col, row) {
      const px = CFG.lawnX + col * CFG.cellW;
      if (type === 'bowlnut' || type === 'boomnut') {
        G.nuts.push({ type, row, x: px, y: foot(row), st: 'roll', rot: 0, gone: false });
        sfx('bowl');
        return;
      }
      const d = PL[type];
      const p = { id: ++G.uid, type, col, row, px, by: foot(row), hp: d.hp, hpMax: d.hp, t: rnd(600), lc: 0, st: '', cd: 0, sh: 0, flash: 0, gone: false };
      if (d.rate) p.lc = type === 'sunflower' ? rr(CFG.flowerFirst[0], CFG.flowerFirst[1]) : rnd(d.rate + 1);
      if (type === 'cherrybomb') { p.cd = CFG.cherryFuse; sfx('fuse'); }
      if (type === 'potatomine') { p.st = 'arm'; p.cd = CFG.potatoArm; }
      if (type === 'chomper') p.st = 'ready';
      if (type === 'squash') p.st = 'idle';
      if (type === 'jalapeno') { p.cd = CFG.jalaFuse; sfx('fuse'); }
      G.grid[row][col] = p; G.plants.push(p);
      dirt(px + 40, p.by, 7);
      sfx('plant');
      if (G.tut === 1) G.tut = 2;
    }
    G.plantCard = (i, col, row) => {
      const c = G.cards[i];
      if (!c) return false;
      const d = PL[c.type];
      if (c.cd > 0 || G.sun < d.cost || !G.canPlant(c.type, col, row)) return false;
      G.sun -= d.cost; c.cd = c.max = d.refresh;
      addPlant(c.type, col, row);
      return true;
    };
    G.plantBelt = (i, col, row) => {
      const b = G.belt[i];
      if (!b || b.pos > CFG.beltMax - 1 || !G.canPlant(b.type, col, row)) return false;
      G.belt.splice(i, 1);
      addPlant(b.type, col, row);
      return true;
    };
    function killPlant(p) { p.gone = true; if (G.grid[p.row][p.col] === p) G.grid[p.row][p.col] = null; }
    G.dig = (col, row) => {
      const p = G.grid[row] && G.grid[row][col];
      if (!p || G.state !== 'play') return false;
      killPlant(p);
      for (let i = 0; i < 6; i++) part({ k: 'leaf', x: p.px + 40 + rf(-10, 10), y: p.by - rf(10, 40), vx: rf(-1.5, 1.5), vy: rf(-3, -1), g: 0.12, life: 50, r: 5, vr: rf(-0.2, 0.2), gy: p.by });
      dirt(p.px + 40, p.by, 5);
      sfx('dig');
      return true;
    };
    G.collect = s => { if (s.st === 'col' || G.state !== 'play') return false; s.st = 'col'; sfx('sun'); return true; };
    G.collectAward = () => { if (!G.award || G.award.st === 'col') return false; G.award.st = 'col'; G.award.t = 0; G.state = 'won'; sfx('award'); return true; };

    function hasTarget(p, row, rng) {
      const r = row == null ? p.row : row;
      for (const z of G.zombies) if (z.row === r && !dead(z) && z.x + 21 > p.px + 60 && z.x - 21 < (rng ? p.px + rng : 800)) return true;
      return false;
    }
    function fire(p) {
      if (!hasTarget(p)) return;
      p.sh = 18;
      G.peas.push({ x: p.px + 76, y: p.by - 52, row: p.row, snow: p.type === 'snowpea', fire: false, gone: false });
      sfx(p.type === 'snowpea' ? 'shootsnow' : 'shoot');
    }
    function firePuff(p) {
      if (!hasTarget(p, null, 320)) return;
      p.sh = 18;
      G.peas.push({ x: p.px + 62, y: p.by - 22, row: p.row, snow: false, fire: false, spore: true, xr: p.px + 62 + 250, gone: false });
      sfx('shoot');
    }
    function fire3(p) {
      const rs = [p.row - 1, p.row, p.row + 1].filter(r => rows.includes(r));
      if (!rs.some(r => hasTarget(p, r))) return;
      p.sh = 18;
      for (const r of rs) G.peas.push({ x: p.px + 76, y: p.by - 52, ty: foot(r) - 52, row: r, snow: false, fire: false, gone: false });
      sfx('shoot');
    }
    function squashTarget(p) {
      let best = null;
      for (const z of G.zombies) {
        if (z.row !== p.row || !alive(z) || z.st === 'vault' || z.st === 'fly') continue;
        if (z.x - 21 < p.px + 140 && z.x + 21 > p.px - 10 && (!best || z.x < best.x)) best = z;
      }
      return best;
    }
    function explode(cx, row, r, span, kind) {
      for (const z of G.zombies) {
        if (dead(z) || Math.abs(z.row - row) > span) continue;
        if (Math.abs(z.x - cx) < r + 21) hurt(z, CFG.boom, 'boom');
      }
      G.shake = Math.max(G.shake, kind === 'cherry' ? 28 : 18);
    }
    function chompTarget(p) {
      const ext = p.st === 'bite' ? 60 : 0;
      let best = null;
      for (const z of G.zombies) {
        if (z.row !== p.row || !alive(z) || z.big || z.st === 'fly') continue;
        const e = ext || (z.st === 'eat' ? 60 : 0);
        if (ov(z.x - 21, z.x + 21, p.px + 80, p.px + 120 + e) > 0 && (!best || z.x < best.x)) best = z;
      }
      return best;
    }
    function potatoTarget(p) {
      for (const z of G.zombies) {
        if (z.row !== p.row || !alive(z) || z.st === 'vault' || z.st === 'fly' || (z.type === 'pole' && z.pole)) continue;
        if (ov(z.x - 21, z.x + 21, p.px, p.px + 55) > 0) return z;
      }
      return null;
    }
    function updPlant(p) {
      p.t++;
      if (p.flash > 0) p.flash--;
      switch (p.type) {
        case 'peashooter': case 'snowpea': case 'repeater':
          if (p.sh > 0) p.sh--;
          if (--p.lc <= 0) { p.lc = PL[p.type].rate - rnd(15); fire(p); }
          else if (p.lc === 25 && p.type === 'repeater') fire(p);
          break;
        case 'puffshroom':
          if (p.sh > 0) p.sh--;
          if (--p.lc <= 0) { p.lc = PL[p.type].rate - rnd(15); firePuff(p); }
          break;
        case 'threepeater':
          if (p.sh > 0) p.sh--;
          if (--p.lc <= 0) { p.lc = PL[p.type].rate - rnd(15); fire3(p); }
          break;
        case 'squash':
          if (p.st === 'idle') { const z = squashTarget(p); if (z) { p.st = 'aim'; p.cd = CFG.squashAim; p.tx = z.x; p.dir = z.x < p.px + 40 ? -1 : 1; sfx('hmm'); } }
          else if (p.st === 'aim') { const z = squashTarget(p); if (z) p.tx = z.x; if (--p.cd <= 0) { p.st = 'jump'; p.cd = CFG.squashJump; p.x0 = p.px + 40; } }
          else if (p.st === 'jump') {
            if (--p.cd <= 0) {
              for (const z of G.zombies) if (z.row === p.row && !dead(z) && z.st !== 'fly' && Math.abs(z.x - p.tx) < CFG.squashR + 21) hurt(z, CFG.boom, 'crush');
              dirt(p.tx, p.by, 16); G.shake = Math.max(G.shake, 14); sfx('squash');
              killPlant(p);
            }
          }
          break;
        case 'jalapeno':
          if (--p.cd <= 0) {
            for (const z of G.zombies) if (z.row === p.row && !dead(z) && z.x < 830) hurt(z, CFG.boom, 'boom');
            for (let k = 0; k < 10; k++) part({ k: 'fire', x: CFG.lawnX + k * 80 + 20, y: p.by - 10, life: 90, r: 60, d: k * 2 });
            G.shake = Math.max(G.shake, 22); sfx('fireboom');
            killPlant(p);
          }
          break;
        case 'spikeweed':
          if (p.sh > 0) p.sh--;
          if (--p.lc <= 0) {
            p.lc = CFG.spikeRate;
            let any = false;
            for (const z of G.zombies) if (z.row === p.row && !dead(z) && !z.alt && z.st !== 'fly' && ov(z.x - 21, z.x + 21, p.px + 4, p.px + 76) > 0) { hurt(z, CFG.spikeDmg, 'spike'); any = true; }
            if (any) { p.sh = 12; sfx('spike'); }
          }
          break;
        case 'sunflower':
          if (G.award) break;
          if (--p.lc <= 0) { p.lc = rr(CFG.flowerRate[0], CFG.flowerRate[1]); addSun(p.px + 40, p.by - 48, 'plant', p.by - 33 + rnd(20)); sfx('spawnsun'); }
          break;
        case 'cherrybomb':
          if (--p.cd <= 0) {
            explode(p.px + 40, p.row, CFG.cherryR, 1, 'cherry');
            part({ k: 'boom', x: p.px + 40, y: p.by - 40, life: 70, r: 120 });
            sfx('boom');
            killPlant(p);
          }
          break;
        case 'potatomine':
          if (p.st === 'arm') { if (--p.cd <= 0) { p.st = 'rise'; p.cd = CFG.potatoRise; dirt(p.px + 40, p.by, 8); sfx('rise'); } }
          else if (p.st === 'rise') { if (--p.cd <= 0) p.st = 'armed'; }
          else if (potatoTarget(p)) {
            explode(p.px + 20, p.row, CFG.potatoR, 0, 'potato');
            part({ k: 'spud', x: p.px + 40, y: p.by - 20, life: 60, r: 80 });
            dirt(p.px + 40, p.by, 14);
            sfx('spud');
            killPlant(p);
          }
          break;
        case 'chomper':
          if (p.st === 'ready') { if (chompTarget(p)) { p.st = 'bite'; p.cd = CFG.chompBite; } }
          else if (p.st === 'bite') {
            if (--p.cd <= 0) {
              sfx('bigchomp');
              const z = chompTarget(p);
              if (z && z.st !== 'vault' && !(z.type === 'pole' && z.pole)) {
                z.gone = true; z.st = 'die'; G.kills++;
                G.lastDeath = { x: p.px + 60, y: p.by };
                p.st = 'chew'; p.cd = CFG.chompDigest;
              } else { p.st = 'miss'; p.cd = 40; }
            }
          } else if (p.st === 'chew') { if (--p.cd <= 0) { p.st = 'swallow'; p.cd = CFG.chompSwallow; sfx('gulp'); } }
          else if (--p.cd <= 0) p.st = 'ready';
          break;
      }
    }

    function hurt(z, dmg, kind) {
      if (dead(z)) return;
      z.flash = 25;
      let d = dmg;
      if (z.door > 0) {
        if (kind === 'pea') { z.door -= d; if (z.door <= 0) dropDoor(z); return; }
        if (kind === 'boom' || kind === 'crush') { z.door = Math.max(0, z.door - d); if (z.door <= 0) dropDoor(z); }
      }
      if (z.paper > 0) {
        const a = Math.min(z.paper, d); z.paper -= a; d -= a;
        if (z.paper <= 0) loseNewspaper(z);
      }
      if (d > 0 && z.helm > 0) {
        const a = Math.min(z.helm, d); z.helm -= a; d -= a;
        if (z.helm <= 0) dropHelm(z);
      }
      if (d > 0) bodyDamage(z, d, kind);
    }
    G.hurt = hurt;
    function bodyDamage(z, d, kind) {
      z.hp -= d;
      if (z.arm && z.hp < z.hpMax * 2 / 3 && z.hp > 0) {
        z.arm = false;
        part({ k: 'arm', x: z.x - 24, y: z.by - 70 - z.alt, vx: rf(-0.6, 0.4), vy: rf(-2.2, -1), g: 0.13, life: 160, vr: rf(-0.12, 0.12), gy: z.by - 4, type: z.type, chill: z.chill > 0 });
      }
      if (z.head && z.hp < z.hpMax / 3) {
        z.head = false;
        if (z.st === 'eat') { z.st = 'walk'; z.target = null; }
        if (kind !== 'boom') part({ k: 'head', x: z.x - 8, y: z.by - 112 - z.alt, vx: rf(-0.3, 1.2), vy: rf(-3.2, -2), g: 0.16, life: 170, vr: rf(-0.18, 0.08), gy: z.by - 12, type: z.type, chill: z.chill > 0, mad: z.mad });
        G.lastDeath = { x: z.x, y: z.by };
      }
      if (z.hp <= 0) kill(z, kind === 'boom' ? 'burn' : kind === 'crush' ? 'flat' : 'die');
    }
    function kill(z, how) {
      if (dead(z)) return;
      z.st = how; z.t = 0; z.dir = R() < 0.7 ? 1 : -1;
      G.kills++;
      G.lastDeath = { x: z.x, y: z.by };
      if (how === 'burn') { z.head = true; z.arm = true; }
    }
    function dropDoor(z) {
      z.door = 0;
      part({ k: 'door', x: z.x - 34, y: z.by - 60, vx: rf(-1.2, 0.2), vy: rf(-2.4, -1.2), g: 0.13, life: 150, vr: rf(-0.08, 0.02), gy: z.by - 8 });
      sfx('metal');
    }
    function dropHelm(z) {
      part({ k: 'helm', x: z.x - 6, y: z.by - 140 - z.alt, vx: rf(0.2, 1.4), vy: rf(-2.6, -1.4), g: 0.15, life: 150, vr: rf(0.04, 0.16), gy: z.by - 6, type: z.helmType });
      z.helmType = null;
    }
    function loseNewspaper(z) {
      for (let i = 0; i < 6; i++) part({ k: 'paper', x: z.x - 32 + rf(-8, 8), y: z.by - 80 + rf(-12, 12), vx: rf(-1.4, 1.2), vy: rf(-2.4, -0.6), g: 0.06, life: 90, vr: rf(-0.2, 0.2), gy: z.by, r: rf(5, 9) });
      z.st = 'gasp'; z.t = CFG.gasp; z.target = null;
      sfx('paper');
    }
    function findPlant(z, vault) {
      const row = G.grid[z.row];
      for (let c = 0; c < 9; c++) {
        const p = row[c];
        if (!p || p.gone) continue;
        if (!vault && p.type === 'potatomine' && p.st !== 'arm' && !z.big) continue;
        if (p.type === 'spikeweed' && !z.big) continue;
        if (p.type === 'squash' && p.st === 'jump') continue;
        if (ov(z.x - 37, z.x + 13, p.px + 10, p.px + 70) >= CFG.eatOverlap) return p;
      }
      return null;
    }
    function mow(z) {
      if (dead(z)) return;
      z.st = 'mow'; z.t = 0; G.kills++;
      G.lastDeath = { x: z.x, y: z.by };
      for (let i = 0; i < 6; i++) part({ k: 'dot', x: z.x, y: z.by - rf(10, 90), vx: rf(-1, 2.5), vy: rf(-3, -0.5), g: 0.12, life: 40, r: rf(3, 5), c: i % 2 ? '#8c9a74' : '#6a4d36' });
    }
    function updZombie(z) {
      z.age++;
      if (z.flash > 0) z.flash--;
      if (z.st === 'die' || z.st === 'burn' || z.st === 'mow' || z.st === 'flat') {
        z.t++;
        if (z.st === 'burn' && z.t === 70) for (let i = 0; i < 14; i++) part({ k: 'dot', x: z.x + rf(-16, 16), y: z.by - rf(0, 110), vx: rf(-0.6, 0.6), vy: rf(-0.6, 0.3), g: 0.05, life: 50 + rnd(30), r: rf(2.5, 5), c: '#1e1712', gy: z.by });
        if (z.t >= (z.st === 'die' ? 160 : z.st === 'burn' ? 90 : z.st === 'flat' ? 120 : 50)) z.gone = true;
        return;
      }
      if (z.st === 'fly') {
        z.t++;
        const k = clamp(z.t / CFG.impFly, 0, 1);
        z.x = z.x0 + (z.x1 - z.x0) * k; z.alt = Math.sin(k * Math.PI) * 150;
        if (k >= 1) { z.st = 'walk'; z.alt = 0; dirt(z.x, z.by, 5); }
        return;
      }
      if (z.st === 'smash') {
        z.t++;
        if (z.t === CFG.smash) { const p = z.target; if (p && !p.gone) { killPlant(p); dirt(p.px + 40, p.by, 12); } G.shake = Math.max(G.shake, 16); sfx('smash'); }
        if (z.t >= CFG.smashEnd) { z.st = 'walk'; z.target = null; }
        return;
      }
      if (z.st === 'throw') {
        z.t++;
        if (z.t === 40) {
          const imp = addZombie('imp', z.row, z.wave, z.x - 30);
          imp.st = 'fly'; imp.t = 0; imp.x0 = z.x - 30; imp.x1 = Math.max(CFG.lawnX + 60, z.x - 330); imp.alt = 0;
          sfx('vault');
        }
        if (z.t >= 75) z.st = 'walk';
        return;
      }
      if (z.chill > 0) z.chill--;
      const slow = z.chill > 0 ? CFG.chillMul : 1;
      if (!z.head) {
        z.hp -= z.hpMax >= 500 ? 3 : 1;
        if (z.hp <= 0) { kill(z, 'die'); return; }
      }
      if (z.head && --z.groan <= 0) {
        z.groan = 500 + rnd(1000);
        if (rnd(Math.max(1, G.zombies.length)) === 0 && !G.award) sfx('groan');
      }
      if (z.st === 'gasp') {
        z.ph += 0.02;
        if (--z.t <= 0) { z.st = 'walk'; z.mad = true; z.sp = spd(ZD.news.mad, 0.99, 1.01); if (z.head) sfx('rarrgh'); }
        return;
      }
      if (z.st === 'vault') {
        z.t++;
        const k = ease((z.t / CFG.vault - 0.3) / 0.55);
        z.x = z.x0 + (z.x1 - z.x0) * k;
        z.alt = Math.sin(k * Math.PI) * 80;
        if (z.t >= CFG.vault) { z.st = 'walk'; z.alt = 0; z.sp = spd(ZD.pole.after, 0.836, 1.164); }
        return;
      }
      if (z.st === 'eat') {
        const p = z.target;
        if (!p || p.gone || !z.head || ov(z.x - 37, z.x + 13, p.px + 10, p.px + 70) <= 0) { z.st = 'walk'; z.target = null; }
        else {
          z.eatT++;
          if (z.eatT % CFG.eatTicks === 0 && !(z.chill > 0 && (z.eatT / CFG.eatTicks) % 2 === 1)) {
            if (p.type !== 'cherrybomb') {
              p.hp -= CFG.eatDmg; p.flash = 10;
              if (p.hp <= 0) { killPlant(p); sfx('gulp'); z.st = 'walk'; z.target = null; }
            }
          }
          if (z.eatT % 44 === 1) sfx('chomp');
          return;
        }
      }
      if (z.big && z.head && !z.thrown && z.hp < z.hpMax / 2 && z.x > 400) { z.thrown = true; z.st = 'throw'; z.t = 0; return; }
      if (z.head) {
        if (z.type === 'pole' && z.pole) {
          const p = findPlant(z, true);
          if (p && p.type === 'tallnut') { z.pole = false; z.sp = spd(ZD.pole.after, 0.836, 1.164); z.x = Math.max(z.x, p.px + 78); dirt(p.px + 60, p.by, 6); sfx('plastic'); return; }
          if (p) { z.st = 'vault'; z.t = 0; z.x0 = z.x; z.x1 = p.px - 13; z.poleX = p.px + 46; z.pole = false; sfx('vault'); return; }
        } else if (z.big) {
          const p = findPlant(z, false);
          if (p) { z.st = 'smash'; z.t = 0; z.target = p; sfx('rarrgh'); return; }
        } else {
          const p = findPlant(z, false);
          if (p) { z.st = 'eat'; z.target = p; z.eatT = 0; return; }
        }
      }
      const base = z.sp * slow;
      const run = (z.type === 'pole' && z.pole) || z.type === 'football';
      z.ph += base * (run ? 0.11 : z.big ? 0.12 : 0.157);
      z.x -= run || z.mad || z.type === 'imp' ? base : base * (1 + 0.8 * Math.sin(2 * z.ph));
      if (z.x < CFG.houseX) {
        if (!z.head) { kill(z, 'die'); return; }
        G.state = 'lost'; G.loser = z; sfx('lose');
      }
    }
    function peaHit(z, q) {
      sfx(q.fire ? 'firehit' : z.door > 0 ? 'metal' : z.paper > 0 ? 'paperhit' : z.helm > 0 ? (z.helmType === 'bucket' || z.helmType === 'football' ? 'metal' : 'plastic') : 'splat');
      const shield = z.door > 0;
      hurt(z, q.fire ? CFG.peaDmg * 2 : CFG.peaDmg, 'pea');
      if (q.fire && !dead(z)) z.chill = 0;
      if (q.snow && !shield && !dead(z)) { if (z.chill === 0) sfx('freeze'); z.chill = CFG.chill; }
      const col = q.fire ? '#ffb02e' : q.snow ? '#bff0ff' : q.spore ? '#c98ae8' : '#8ed14a';
      for (let i = 0; i < 5; i++) part({ k: 'dot', x: q.x + 4, y: q.y, vx: rf(-1.6, 0.4), vy: rf(-1.6, 1.2), g: 0.05, life: 16 + rnd(8), r: rf(2, 3.6), c: col });
      part({ k: 'splat', x: q.x + 6, y: q.y, life: 12, c: q.fire ? '#ff7a1a' : q.snow ? '#9be3f5' : q.spore ? '#a45ccf' : '#7bd13a' });
    }
    function updNut(u) {
      u.x += CFG.bowlSpeed;
      u.rot += CFG.bowlSpeed / 30;
      if (u.x > 800) { u.gone = true; return; }
      if (u.st === 'up') u.y -= CFG.bowlVy; else if (u.st === 'down') u.y += CFG.bowlVy;
      const dy = foot(u.row) - u.y;
      if (dy < -2 || dy > 2) return;
      let ns = u.st;
      if (u.st === 'up' && u.row <= 0) ns = 'down';
      else if (u.st === 'down' && u.row >= 4) ns = 'up';
      let hit = null;
      for (const z of G.zombies) if (z.row === u.row && !dead(z) && ov(z.x - 21, z.x + 21, u.x, u.x + 60) > 0 && (!hit || z.x < hit.x)) hit = z;
      if (hit) {
        if (u.type === 'boomnut') {
          explode(u.x + 40, u.row, CFG.nutBoomR, 1, 'nut');
          part({ k: 'boom', x: u.x + 40, y: u.y - 36, life: 60, r: 95 });
          sfx('boom'); u.gone = true; return;
        }
        sfx('bowl'); G.shake = Math.max(G.shake, 6);
        if (hit.paper > 0) { const a = Math.min(hit.paper, CFG.bowlPaper); hit.paper -= a; hit.flash = 25; if (hit.paper <= 0) loseNewspaper(hit); }
        else if (hit.helm > 0) { sfx(hit.helmType === 'bucket' ? 'metal' : 'plastic'); hit.flash = 25; hit.helm = Math.max(0, hit.helm - CFG.bowlHelm); if (hit.helm <= 0) dropHelm(hit); }
        else hurt(hit, CFG.bowlHit, 'pea');
        ns = u.row === 4 || u.st === 'down' ? 'up' : u.row === 0 || u.st === 'up' ? 'down' : R() < 0.5 ? 'up' : 'down';
      }
      if (ns === 'up') { u.row--; u.st = 'up'; } else if (ns === 'down') { u.row++; u.st = 'down'; }
    }
    function updMowers() {
      for (const m of G.mowers) {
        if (m.st === 'ready') {
          for (const z of G.zombies) if (z.row === m.row && !dead(z) && z.head && z.st !== 'fly' && ov(z.x - 21, z.x + 21, m.x, m.x + 50) > 0) { m.st = 'run'; sfx('mower'); break; }
        }
        if (m.st === 'run') {
          m.x += CFG.mowerSpeed; m.t++;
          for (const z of G.zombies) if (z.row === m.row && !dead(z) && ov(z.x - 21, z.x + 21, m.x, m.x + 50) > 0) mow(z);
          if (m.x > 820) m.st = 'gone';
        }
      }
    }
    function updSuns() {
      for (const s of G.suns) {
        s.t++;
        s.rot += 0.01;
        if (s.st === 'fall') { s.y += CFG.skyVy; if (s.y >= s.gy) { s.y = s.gy; s.st = 'land'; s.t = 0; } }
        else if (s.st === 'pop') { s.vy += CFG.popG; s.x += s.vx; s.y += s.vy; if (s.vy > 0 && s.y >= s.gy) { s.y = s.gy; s.st = 'land'; s.t = 0; } }
        else if (s.st === 'land') { if (s.t >= CFG.sunLife) s.gone = true; }
        else if (s.st === 'col') {
          const dx = G.sunDest.x - s.x, dy = G.sunDest.y - s.y;
          s.x += dx / 21; s.y += dy / 21;
          if (dx * dx + dy * dy < 64) { s.gone = true; G.sun = Math.min(CFG.sunCap, G.sun + s.v); G.sunGot++; }
        }
        if (s.sc < 1) s.sc = Math.min(1, s.sc + 0.025);
      }
    }
    function updParts() {
      for (const q of G.parts) {
        q.t++;
        if (q.vx) q.x += q.vx;
        if (q.vy) q.y += q.vy;
        if (q.g) q.vy += q.g;
        if (q.vr) q.rot += q.vr;
        if (q.gy != null && q.y > q.gy && q.vy > 0) {
          q.y = q.gy; q.vy *= -0.35; q.vx = (q.vx || 0) * 0.6; q.vr = (q.vr || 0) * 0.5;
          if (Math.abs(q.vy) < 0.5) { q.vy = 0; q.g = 0; q.vx = 0; q.vr = 0; }
        }
        if (q.t >= q.life) q.gone = true;
      }
    }
    function checkWin() {
      if (G.award || G.wave < n || G.hugeCd > 0) return;
      for (const z of G.zombies) if (alive(z)) return;
      const x = clamp(G.lastDeath.x, 80, 720), y = clamp(G.lastDeath.y - 30, 140, 540);
      G.award = { type: L.award, x, y: y - 50, gy: y, vy: -2.6, st: 'drop', t: 0 };
      G.msg = null;
    }
    G.tick = () => {
      G.t++;
      if (G.shake > 0) G.shake--;
      if (G.msg && ++G.msg.t > 600) G.msg = null;
      if (G.state === 'lost') {
        const z = G.loser;
        if (z && !G.lostDone) { const v = Math.max(z.sp * 2.2, 0.38); z.ph += v * 0.157; z.x -= v; z.st = 'walk'; if (z.x < -150) G.lostDone = true; }
        updParts(); sweep(G.parts);
        return;
      }
      updSky(); updWaves(); updBelt();
      for (const c of G.cards) { if (c.cd > 0 && --c.cd === 0) c.fl = 30; if (c.fl > 0) c.fl--; }
      for (const p of G.plants) if (!p.gone) updPlant(p);
      for (const z of G.zombies) if (!z.gone) { updZombie(z); if (G.state === 'lost') break; }
      for (const q of G.peas) {
        q.x += CFG.peaSpeed;
        if (q.ty != null) { q.y += (q.ty - q.y) * 0.14; if (Math.abs(q.ty - q.y) < 0.5) { q.y = q.ty; q.ty = null; } }
        if (q.x > 830 || q.xr && q.x > q.xr) { q.gone = true; continue; }
        const tc = Math.floor((q.x - CFG.lawnX) / CFG.cellW), tp = tc >= 0 && tc < 9 ? G.grid[q.row][tc] : null;
        if (tp && tp.type === 'torchwood' && !q.spore && !tp.gone && q.tw !== tp.id && Math.abs(q.x - (tp.px + 40)) < 12) { q.tw = tp.id; if (q.snow) q.snow = false; else q.fire = true; }
        let hit = null;
        for (const z of G.zombies) if (z.row === q.row && !dead(z) && z.st !== 'fly' && z.x - 21 < q.x + 8 && z.x + 21 > q.x - 8 && z.x - 21 < 800 && (!hit || z.x < hit.x)) hit = z;
        if (hit) { q.gone = true; peaHit(hit, q); }
      }
      for (const u of G.nuts) if (!u.gone) updNut(u);
      updMowers(); updSuns(); updParts();
      if (G.award && G.award.st === 'drop') { G.award.vy += 0.1; G.award.y += G.award.vy; if (G.award.y >= G.award.gy) { G.award.y = G.award.gy; G.award.st = 'wait'; } }
      if (G.award) G.award.t++;
      sweep(G.plants); sweep(G.zombies); sweep(G.peas); sweep(G.nuts); sweep(G.suns); sweep(G.parts);
      checkWin();
    };
    return G;
  }

  const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const p = hx(a), q = hx(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const ZBASE = {
    skin: '#b4c29c', skinD: '#8c9a74', jacket: '#6a4d36', jacketD: '#4c3626', pants: '#46425e', pantsD: '#34304a', shoe: '#2c221a',
    shirt: '#eeebe0', tie: '#c4302c', eye: '#fffbe9', pupil: '#1b1410', mouth: '#4b1c1c', teeth: '#f1ebc9', hair: '#2e2b22',
    vest: '#7d8a5a', vestD: '#5c6640', tank: '#f2f2ea', stripe: '#2f9e8f', band: '#d84c3a', paper: '#f4f1e6',
    cone: '#f38b26', coneD: '#c2621a', pail: '#aab3bd', pailD: '#727c87', pole: '#d8b15c', flag: '#b52a2f', glass: '#d6ecf5'
  };
  const zpal = (chill, flash) => { const o = {}; for (const k in ZBASE) { let v = ZBASE[k]; if (chill) v = mix(v, '#6fb4ff', 0.4); if (flash) v = mix(v, '#ffffff', 0.32); o[k] = v; } return o; };
  const ZPAL = [zpal(0, 0), zpal(0, 1), zpal(1, 0), zpal(1, 1)];
  const ZBURN = {};
  for (const k in ZBASE) ZBURN[k] = '#1f1813';
  ZBURN.eye = '#f4efe0'; ZBURN.teeth = '#f4efe0'; ZBURN.pupil = '#000';
  const PPAL = {
    peashooter: { head: '#74c93a', headL: '#c4f27a', headD: '#3a8a1f', stem: '#4f9e2c', leaf: '#5db534', hole: '#1f3d12' },
    repeater: { head: '#5bb52d', headL: '#a9e464', headD: '#2b7016', stem: '#468f27', leaf: '#4fa62b', hole: '#173210' },
    snowpea: { head: '#8fd9f2', headL: '#e9fbff', headD: '#3a8fbe', stem: '#5aa9c9', leaf: '#7cc8e4', hole: '#1b4560' }
  };

  function makeArt(c, off) {
    const cache = {};
    const cg = (k, f) => cache[k] || (cache[k] = f());
    const SPR = new Map(), sub = { cv: null, ctx: null, art: null };
    let SC = 1, spx = 0;
    const setScale = v => { v = Math.round(clamp(v || 1, 1, 2) * 4) / 4; if (v !== SC) { SC = v; SPR.clear(); spx = 0; sub.cv = null; } };
    const sprite = (key, b, fn) => {
      let s = SPR.get(key);
      if (!s) {
        if (spx > 3.5e7) { SPR.clear(); spx = 0; }
        if (!sub.cv) { sub.cv = document.createElement('canvas'); sub.cv.width = Math.ceil(260 * SC); sub.cv.height = Math.ceil(230 * SC); sub.ctx = sub.cv.getContext('2d'); sub.art = makeArt(sub.ctx, true); }
        const o = sub.ctx, w = Math.ceil(b[2] * SC), h = Math.ceil(b[3] * SC);
        o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, w, h);
        o.setTransform(SC, 0, 0, SC, -b[0] * SC, -b[1] * SC);
        fn(sub.art);
        s = document.createElement('canvas'); s.width = w; s.height = h;
        s.getContext('2d').drawImage(sub.cv, 0, 0, w, h, 0, 0, w, h);
        SPR.set(key, s); spx += w * h;
      }
      c.drawImage(s, b[0], b[1], s.width / SC, s.height / SC);
    };
    const E = (x, y, rx, ry, r) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), r || 0, 0, TAU); };
    const F = (f, lw) => { c.fillStyle = f; c.fill(); if (lw !== 0) { c.lineWidth = lw || 2.2; c.strokeStyle = OL; c.stroke(); } };
    const lg = (x0, y0, x1, y1, s) => { const g = c.createLinearGradient(x0, y0, x1, y1); s.forEach((v, i) => g.addColorStop(i / (s.length - 1), v)); return g; };
    const rg = (x, y, r0, r1, s) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); s.forEach((v, i) => g.addColorStop(i / (s.length - 1), v)); return g; };
    const RR = (x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
    const limb = (x1, y1, x2, y2, x3, y3, w, col) => {
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); if (x3 != null) c.lineTo(x3, y3);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = OL; c.lineWidth = w + 4.2; c.stroke();
      c.strokeStyle = col; c.lineWidth = w; c.stroke();
      if (w >= 6) {
        const ex = (x3 != null ? x3 : x2) - x1, ey = (y3 != null ? y3 : y2) - y1, ln = Math.hypot(ex, ey) || 1;
        let nx = -ey / ln, ny = ex / ln; if (nx + ny < 0) { nx = -nx; ny = -ny; }
        c.save(); c.translate(nx * w * 0.24, ny * w * 0.24); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = w * 0.5; c.stroke(); c.translate(-nx * w * 0.52, -ny * w * 0.52); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = w * 0.26; c.stroke(); c.restore();
      }
    };
    const T = (s, x, y, size, fill, stroke, align, lw) => {
      c.font = '900 ' + size + 'px Nunito, system-ui, sans-serif';
      c.textAlign = align || 'center'; c.textBaseline = 'middle';
      if (stroke) { c.lineJoin = 'round'; c.lineWidth = lw || Math.max(2.5, size * 0.2); c.strokeStyle = stroke; c.strokeText(s, x, y); }
      c.fillStyle = fill; c.fillText(s, x, y);
    };
    const leaf = (x, y, len, w, a, col) => {
      c.save(); c.translate(x, y); c.rotate(a);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.45, -w, len, 0); c.quadraticCurveTo(len * 0.45, w * 0.85, 0, 0); F(col, 2);
      c.beginPath(); c.moveTo(3, 0); c.quadraticCurveTo(len * 0.5, -w * 0.12, len * 0.82, 0); c.strokeStyle = 'rgba(15,50,10,.35)'; c.lineWidth = 1.3; c.stroke();
      c.restore();
    };
    const stem = (h, sw, col) => {
      c.beginPath(); c.moveTo(-3.5, 0); c.quadraticCurveTo(-5 + sw * 0.3, -h * 0.55, -2.5 + sw, -h); c.lineTo(3.5 + sw, -h); c.quadraticCurveTo(1 + sw * 0.3, -h * 0.55, 3.5, 0); c.closePath(); F(col, 2);
    };

    function shooter(kind, t, sh) {
      const P = PPAL[kind];
      const sw = Math.sin(t * 0.045) * 1.6, bob = Math.sin(t * 0.09);
      leaf(-2, -1, 25, 7.5, Math.PI + 0.22, P.leaf); leaf(2, -1, 25, 7.5, -0.22, P.leaf); leaf(0, -1, 17, 6, -Math.PI / 2 - 0.9, P.leaf);
      stem(38, sw, P.stem);
      c.save(); c.translate(sw - sh * 5, -50 + bob);
      if (kind === 'repeater') { leaf(-12, -10, 17, 6, Math.PI + 0.95, P.leaf); leaf(-15, -3, 19, 6.5, Math.PI + 0.35, P.leaf); }
      else if (kind === 'snowpea') {
        c.beginPath(); c.moveTo(-10, -14); c.lineTo(-26, -20); c.lineTo(-16, -8); c.lineTo(-30, -6); c.lineTo(-16, 0); c.lineTo(-27, 8); c.lineTo(-12, 6); c.closePath(); F('#e4f7ff', 1.8);
      } else leaf(-13, -10, 15, 5.5, Math.PI + 0.75, P.leaf);
      const sl = 22 + sh * 7;
      leaf(-3, -15, 14, 4.6, -Math.PI / 2 - 0.55, P.leaf); leaf(3, -16, 13, 4.4, -Math.PI / 2 + 0.35, P.leaf);
      RR(8, -9, sl, 17, 7); F(cg('bar' + kind, () => lg(0, -9, 0, 8, [P.headL, P.head, P.headD])), 2);
      c.fillStyle = 'rgba(255,255,255,.34)'; RR(12, -7, sl - 6, 3.4, 1.7); c.fill();
      RR(5 + sl * 0.45, -10, 4, 19, 2); F(P.headD, 1.4);
      E(8 + sl, -0.5, 6.5, 10.5); F(cg('rim' + kind, () => lg(0, -11, 0, 10, [P.head, P.headD])), 2);
      E(9 + sl, -0.5, 3.6, 7); F(P.hole, 0); E(10 + sl, 1.5, 1.8, 3.4); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill();
      E(0, 0, 19, 19); F(cg('sh' + kind, () => rg(-6, -8, 2, 22, [P.headL, P.head, P.headD])), 2.2);
      E(-6, -10, 6, 3.6, -0.6); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill();
      c.beginPath(); c.arc(0, 0, 16.5, 0.35 * Math.PI, 0.95 * Math.PI); c.strokeStyle = 'rgba(0,50,0,.22)'; c.lineWidth = 3; c.stroke();
      E(4, -6, 6.2, 7.4); F('#fffef2', 1.8); E(6.4, -5.4, 3.3, 4.4); F('#111', 0); E(7.4, -7.4, 1.3, 1.6); c.fillStyle = '#fff'; c.fill();
      c.beginPath(); c.moveTo(-3, -15.5); c.quadraticCurveTo(5, -18.5, 12, -13); c.strokeStyle = OL; c.lineWidth = 2; c.lineCap = 'round'; c.stroke();
      if (kind === 'repeater') { limb(-2, -15, 12, -11, null, null, 2.2, '#1d3a0e'); }
      if (kind === 'snowpea') { E(-12, 6, 3, 2); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); }
      c.restore();
    }
    function sunflower(t, glow) {
      const sw = Math.sin(t * 0.05) * 0.09;
      leaf(-2, -6, 23, 7.5, Math.PI + 0.45, '#5db534'); leaf(2, -13, 23, 7.5, -0.5, '#5db534');
      stem(38, sw * 20, '#4f9e2c');
      c.save(); c.translate(sw * 20, -50); c.rotate(sw);
      if (glow > 0) { E(0, 0, 44, 44); c.fillStyle = cg('sglow', () => rg(0, 0, 8, 44, ['rgba(255,246,160,.9)', 'rgba(255,230,90,0)'])); c.globalAlpha = glow; c.fill(); c.globalAlpha = 1; }
      for (let i = 0; i < 14; i++) { c.save(); c.rotate((i + 0.5) / 14 * TAU); E(0, -22, 6.6, 11.8); F('#e8960f', 1.5); c.restore(); }
      for (let i = 0; i < 14; i++) { c.save(); c.rotate(i / 14 * TAU); E(0, -21, 6.2, 11.5); F(cg('petal', () => lg(0, -33, 0, -9, ['#fff27a', '#ffc61f', '#f6a410'])), 1.6); c.beginPath(); c.moveTo(0, -12); c.lineTo(0, -28); c.strokeStyle = 'rgba(190,110,0,.35)'; c.lineWidth = 1; c.stroke(); c.restore(); }
      E(0, 0, 15, 15); F(cg('sface', () => rg(-4, -5, 2, 17, ['#f1b04a', '#d98a2b', '#a9611b'])), 2);
      for (let i = 0; i < 24; i++) { const r = 9.6 + 4 * Math.sqrt(i / 24), a = i * 2.4; E(Math.cos(a) * r, Math.sin(a) * r, 1.2, 0.9, a); c.fillStyle = i % 3 ? 'rgba(80,40,10,.4)' : 'rgba(255,220,150,.35)'; c.fill(); }
      E(-5, -3, 2.6, 4); F('#1a1008', 0); E(5, -3, 2.6, 4); F('#1a1008', 0);
      E(-4.3, -4.6, 0.9, 1.3); c.fillStyle = '#fff'; c.fill(); E(5.7, -4.6, 0.9, 1.3); c.fill();
      c.beginPath(); c.arc(0, 2, 7, 0.2 * Math.PI, 0.8 * Math.PI); c.strokeStyle = '#3b1d08'; c.lineWidth = 2; c.lineCap = 'round'; c.stroke();
      E(-9, 4, 3, 2); c.fillStyle = 'rgba(255,120,90,.45)'; c.fill(); E(9, 4, 3, 2); c.fill();
      E(-6, -9, 5, 2.6, -0.5); c.fillStyle = 'rgba(255,255,255,.28)'; c.fill();
      c.restore();
    }
    function cherry(t, k) {
      const s = 1 + k * 0.45, j = k > 0 ? Math.sin(t * 2.3) * k * 2.5 : 0;
      c.save(); c.translate(j, 0); c.scale(s, s);
      c.beginPath(); c.moveTo(-12, -30); c.quadraticCurveTo(-9, -48, 2, -56); c.moveTo(12, -28); c.quadraticCurveTo(11, -46, 2, -56);
      c.lineCap = 'round'; c.strokeStyle = OL; c.lineWidth = 6.5; c.stroke(); c.strokeStyle = '#3d7a24'; c.lineWidth = 3; c.stroke();
      leaf(2, -56, 16, 6, -0.3, '#5db534');
      const red = k > 0.5 ? cg('chr2', () => rg(-5, -6, 2, 19, ['#ffb08a', '#ff3b22', '#c0140c'])) : cg('chr', () => rg(-5, -6, 2, 19, ['#ff9d8c', '#e8322a', '#9e0f17']));
      for (const [x, y, r] of [[-13, -20, 16], [13, -17, 17]]) {
        c.save(); c.translate(x, y);
        E(0, 0, r, r); F(red, 2.2);
        E(-5, -7, 4.5, 3, -0.5); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
        E(-5, -1, 3.6, 4.2); F('#fff', 1.2); E(5, -1, 3.6, 4.2); F('#fff', 1.2);
        E(-4, 0, 1.6, 1.8); F('#111', 0); E(4, 0, 1.6, 1.8); F('#111', 0);
        limb(-9, -7, -2, -4, null, null, 1.4, '#111'); limb(9, -7, 2, -4, null, null, 1.4, '#111');
        limb(-4, 7, 4, 7, null, null, 1, '#3a0808');
        c.restore();
      }
      c.restore();
    }
    function wallnut(t, st, boom) {
      const sq = Math.sin(t * 0.04) * 0.7;
      E(0, -36, 27, 36 + sq); F(boom ? cg('wnb', () => rg(-8, -48, 4, 46, ['#ff9a7a', '#e2412f', '#9a1d12'])) : cg('wn', () => rg(-8, -48, 4, 46, ['#e7b26a', '#c3843c', '#8a561f'])), 2.4);
      c.strokeStyle = boom ? 'rgba(90,10,0,.2)' : 'rgba(90,50,10,.22)'; c.lineWidth = 1.6;
      for (const gx of [-16, -6, 6, 16]) { c.beginPath(); c.moveTo(gx * 0.7, -68); c.quadraticCurveTo(gx * 1.3, -36, gx * 0.8, -4); c.stroke(); }
      E(-14, -52, 5.5, 13, -0.25); c.fillStyle = 'rgba(255,255,255,.24)'; c.fill();
      c.strokeStyle = boom ? 'rgba(90,10,0,.35)' : 'rgba(90,50,10,.35)'; c.lineWidth = 2;
      c.beginPath(); c.arc(-10, -50, 12, 3.7, 5.1); c.stroke();
      c.beginPath(); c.arc(-14, -20, 10, 2.2, 3.4); c.stroke();
      c.beginPath(); c.arc(14, -16, 9, 5.9, 7.1); c.stroke();
      const worried = st >= 1;
      E(1, -46, 6.8, 8.6); F('#fff', 1.6); E(15, -46, 5.8, 8); F('#fff', 1.6);
      E(3.5, -45, 2.4, 3); F('#111', 0); E(17, -45, 2.2, 2.8); F('#111', 0);
      if (worried || boom) { limb(-5, -57 + (boom ? 3 : 0), 6, -55 - (boom ? 0 : 3), null, null, 1.6, OL); limb(11, -55 - (boom ? 0 : 3), 20, -57 + (boom ? 3 : 0), null, null, 1.6, OL); }
      if (st >= 2 || boom) { c.beginPath(); c.arc(9, -26, 5, 1.15 * Math.PI, 1.85 * Math.PI); c.strokeStyle = OL; c.lineWidth = 2; c.stroke(); }
      if (st >= 1) {
        c.beginPath(); c.moveTo(16, -71); c.lineTo(10, -62); c.lineTo(15, -56); c.lineTo(9, -50); c.moveTo(-20, -60); c.lineTo(-13, -54); c.lineTo(-16, -46);
        c.strokeStyle = '#4a2a0c'; c.lineWidth = 2; c.stroke();
      }
      if (st >= 2) {
        c.beginPath(); c.moveTo(4, -73); c.lineTo(14, -62); c.lineTo(24, -60); c.quadraticCurveTo(22, -70, 4, -73); F('#6a3d12', 1.6);
        c.beginPath(); c.moveTo(-24, -30); c.lineTo(-15, -26); c.lineTo(-18, -16); c.moveTo(20, -30); c.lineTo(12, -22); c.lineTo(18, -12);
        c.strokeStyle = '#4a2a0c'; c.lineWidth = 2; c.stroke();
      }
    }
    function potato(t, st, k) {
      const h = st === 'arm' ? 0 : st === 'rise' ? k : 1;
      E(0, -3, 25, 8); F('#7a5a33', 2);
      c.save(); c.beginPath(); c.rect(-40, -90, 80, 87); c.clip();
      const y = -6 - 14 * h + (1 - h) * 8;
      E(0, y, 21, 15); F(cg('pot', () => rg(-6, -26, 2, 26, ['#ead09a', '#c9a160', '#8f6a35'])), 2.2);
      E(-9, y - 2, 2.2, 1.6); F('#8f6a35', 0); E(11, y + 5, 2, 1.5); F('#8f6a35', 0); E(-3, y + 8, 1.8, 1.2); F('#8f6a35', 0);
      if (h > 0.4) {
        E(-3, y - 4, 3.2, 4); F('#fff', 1.2); E(7, y - 4, 3, 3.8); F('#fff', 1.2);
        E(-2, y - 3.5, 1.4, 1.8); F('#111', 0); E(8, y - 3.5, 1.3, 1.7); F('#111', 0);
        c.beginPath(); c.arc(3, y + 3, 4, 0.15 * Math.PI, 0.85 * Math.PI); c.strokeStyle = OL; c.lineWidth = 1.6; c.stroke();
      }
      const ah = 8 + 12 * h;
      limb(0, y - 14, 0, y - 14 - ah, null, null, 2, '#6b6b6b');
      const on = st === 'armed' && Math.sin(t * 0.12) > 0;
      E(0, y - 16 - ah, 4.6, 4.6); F(on ? '#ff3b2f' : st === 'armed' ? '#a52620' : '#6a2a22', 1.6);
      if (on) { E(0, y - 16 - ah, 9, 9); c.fillStyle = 'rgba(255,80,60,.3)'; c.fill(); }
      c.restore();
      c.beginPath(); c.ellipse(0, -2, 25, 6, 0, 0, Math.PI); F('#5e4426', 0);
    }
    function chomper(t, st, k) {
      leaf(-4, -2, 30, 9, Math.PI + 0.25, '#5db534'); leaf(4, -2, 30, 9, -0.25, '#5db534');
      c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-14, -26, -8, -46); c.lineTo(-1, -46); c.quadraticCurveTo(-6, -26, 4, 0); c.closePath(); F('#4f9e2c', 2);
      const sw = Math.sin(t * 0.05) * 2;
      c.save(); c.translate(-6 + sw, -62);
      if (st === 'chew' || st === 'swallow') {
        const ch = st === 'chew' ? Math.sin(t * 0.25) * 0.07 : 0;
        c.scale(1 + ch, 1 - ch);
        E(6, 0, 30, 24); F(cg('chc', () => rg(-2, -10, 4, 34, ['#c784ea', '#9a45cc', '#5e1f8a'])), 2.4);
        E(-6, -12, 4, 3); c.fillStyle = '#d9a9f2'; c.fill(); E(14, -14, 3.5, 2.6); c.fill(); E(22, 4, 3, 2.4); c.fill();
        c.beginPath(); c.moveTo(-14, 6); c.quadraticCurveTo(10, 14, 34, 2); c.strokeStyle = OL; c.lineWidth = 2.2; c.stroke();
        c.beginPath(); c.moveTo(-14, 6); c.quadraticCurveTo(10, 12, 34, 2); c.strokeStyle = '#eef2b8'; c.lineWidth = 1.2; c.stroke();
      } else {
        const o = st === 'bite' ? 1 - ease(k * 1.4) : st === 'miss' ? ease(k) : 0.85 + Math.sin(t * 0.06) * 0.15;
        const lunge = st === 'bite' ? Math.sin(Math.min(1, k * 1.2) * Math.PI) * 26 : 0;
        c.translate(lunge, 0);
        const ux = 36, uy = -6 - 18 * o, lx = 34, ly = 6 + 16 * o;
        c.beginPath(); c.moveTo(-14, 0); c.lineTo(ux, uy); c.lineTo(lx, ly); c.closePath(); F('#5b0f2e', 0);
        c.beginPath(); c.moveTo(-14, -1); c.bezierCurveTo(-24, -32, 24, -40 - 6 * o, ux, uy); c.lineTo(-14, -1); F(cg('chu', () => rg(0, -18, 4, 40, ['#c784ea', '#9a45cc', '#5e1f8a'])), 2.4);
        c.beginPath(); c.moveTo(-14, 2); c.bezierCurveTo(-20, 28, 22, 30 + 4 * o, lx, ly); c.lineTo(-14, 2); F(cg('chl', () => rg(0, 14, 4, 36, ['#b86ee0', '#8a3bbd', '#561c80'])), 2.4);
        c.fillStyle = '#fff';
        for (let i = 1; i < 6; i++) {
          const a = i / 6, x0 = -14 + (ux + 14) * a, y0 = uy * a, x1 = -14 + (lx + 14) * a, y1 = 2 + (ly - 2) * a;
          c.beginPath(); c.moveTo(x0 - 3, y0 - 0.5); c.lineTo(x0 + 3, y0); c.lineTo(x0, y0 + 5); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(x1 - 3, y1 + 0.5); c.lineTo(x1 + 3, y1); c.lineTo(x1, y1 - 5); c.closePath(); c.fill();
        }
        limb(-14, -1, ux, uy, null, null, 1.6, '#eef2b8'); limb(-14, 2, lx, ly, null, null, 1.6, '#eef2b8');
        E(-4, -22, 4, 3); c.fillStyle = '#d9a9f2'; c.fill(); E(12, -26, 3.6, 2.6); c.fill(); E(2, 20, 3.4, 2.4); c.fill();
      }
      c.restore();
    }
    function peaHead(P, sh, kind) {
      const sl = 22 + sh * 7;
      leaf(-13, -10, 15, 5.5, Math.PI + 0.75, P.leaf);
      leaf(-3, -15, 14, 4.6, -Math.PI / 2 - 0.55, P.leaf); leaf(3, -16, 13, 4.4, -Math.PI / 2 + 0.35, P.leaf);
      RR(8, -9, sl, 17, 7); F(cg('bar' + kind, () => lg(0, -9, 0, 8, [P.headL, P.head, P.headD])), 2);
      c.fillStyle = 'rgba(255,255,255,.34)'; RR(12, -7, sl - 6, 3.4, 1.7); c.fill();
      E(8 + sl, -0.5, 6.5, 10.5); F(cg('rim' + kind, () => lg(0, -11, 0, 10, [P.head, P.headD])), 2);
      E(9 + sl, -0.5, 3.6, 7); F(P.hole, 0);
      E(0, 0, 19, 19); F(cg('sh' + kind, () => rg(-6, -8, 2, 22, [P.headL, P.head, P.headD])), 2.2);
      E(-6, -10, 6, 3.6, -0.6); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill();
      E(4, -6, 6.2, 7.4); F('#fffef2', 1.8); E(6.4, -5.4, 3.3, 4.4); F('#111', 0); E(7.4, -7.4, 1.3, 1.6); c.fillStyle = '#fff'; c.fill();
      c.beginPath(); c.moveTo(-3, -15.5); c.quadraticCurveTo(5, -18.5, 12, -13); c.strokeStyle = OL; c.lineWidth = 2; c.lineCap = 'round'; c.stroke();
    }
    function threepeater(t, sh) {
      const P = PPAL.peashooter, sw = Math.sin(t * 0.045) * 1.6;
      leaf(-2, -1, 26, 8, Math.PI + 0.22, P.leaf); leaf(2, -1, 26, 8, -0.22, P.leaf);
      stem(34, sw, P.stem);
      c.beginPath(); c.moveTo(sw - 2, -34); c.quadraticCurveTo(sw - 18, -40, sw - 20, -56); c.moveTo(sw + 2, -34); c.quadraticCurveTo(sw + 18, -40, sw + 20, -56);
      c.strokeStyle = OL; c.lineWidth = 8; c.lineCap = 'round'; c.stroke(); c.strokeStyle = P.stem; c.lineWidth = 4; c.stroke();
      for (const [hx, hy, s2] of [[-20, -62, 0.78], [20, -62, 0.78], [0, -76, 0.86]]) {
        c.save(); c.translate(sw + hx - sh * 4, hy + Math.sin(t * 0.09 + hx) * 1.2); c.scale(s2, s2); peaHead(P, sh, 'peashooter'); c.restore();
      }
    }
    function squash(t, st, dir) {
      const aim = st === 'aim', sq = aim ? 0.94 + Math.sin(t * 0.5) * 0.02 : 1 + Math.sin(t * 0.05) * 0.015;
      leaf(-6, -2, 22, 7, Math.PI + 0.25, '#5db534'); leaf(6, -2, 22, 7, -0.25, '#5db534');
      c.save(); c.scale(1 / sq, sq);
      c.beginPath(); c.moveTo(-27, -6); c.bezierCurveTo(-36, -30, -31, -66, -12, -72); c.quadraticCurveTo(0, -76, 12, -72); c.bezierCurveTo(31, -66, 36, -30, 27, -6); c.quadraticCurveTo(0, 5, -27, -6); c.closePath();
      F(cg('sqs', () => rg(-10, -48, 4, 46, ['#b6e27a', '#6fae3a', '#3f7a22'])), 2.4);
      c.strokeStyle = 'rgba(30,70,15,.35)'; c.lineWidth = 2;
      for (const gx of [-14, 0, 14]) { c.beginPath(); c.moveTo(gx * 0.9, -70); c.quadraticCurveTo(gx * 1.6, -36, gx, -2); c.stroke(); }
      E(-14, -52, 5, 12, -0.3); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill();
      c.beginPath(); c.moveTo(-2, -72); c.quadraticCurveTo(2, -86, 12, -84); c.strokeStyle = OL; c.lineWidth = 7; c.lineCap = 'round'; c.stroke(); c.strokeStyle = '#7a5a2a'; c.lineWidth = 3.5; c.stroke();
      const ex = (aim ? dir * 4 : 0);
      E(-10, -42, 7, 6); F('#fff', 1.6); E(10, -42, 7, 6); F('#fff', 1.6);
      E(-9 + ex, -41, 3, 3); F('#111', 0); E(11 + ex, -41, 3, 3); F('#111', 0);
      limb(-19, -54, -3, -47, null, null, 2.6, '#2a4a12'); limb(19, -54, 3, -47, null, null, 2.6, '#2a4a12');
      c.beginPath(); c.moveTo(-9, -22); c.quadraticCurveTo(0, -30, 9, -22); c.strokeStyle = OL; c.lineWidth = 2.4; c.stroke();
      c.restore();
    }
    function jalapeno(t, k) {
      const j = k > 0 ? Math.sin(t * 2.1) * k * 3 : 0, s = 1 + k * 0.4;
      c.save(); c.translate(j, 0); c.scale(s, s);
      c.beginPath(); c.moveTo(-6, -70); c.bezierCurveTo(-22, -62, -20, -24, -8, -4); c.quadraticCurveTo(0, 4, 6, -6); c.bezierCurveTo(16, -30, 18, -60, 6, -70); c.closePath();
      F(k > 0.6 ? cg('jal2', () => rg(-6, -40, 3, 40, ['#ffb36a', '#ff3b1a', '#a3120a'])) : cg('jal', () => rg(-6, -46, 3, 40, ['#ff8c7a', '#e0261c', '#8e0e0a'])), 2.4);
      E(-6, -52, 3.2, 10, 0.15); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
      c.beginPath(); c.moveTo(-10, -68); c.quadraticCurveTo(0, -78, 10, -68); c.quadraticCurveTo(0, -64, -10, -68); F('#3d8a22', 2);
      limb(0, -72, 4, -84, null, null, 3, '#3d7a24');
      E(-6, -50, 3.6, 4.2); F('#fff', 1.2); E(4, -50, 3.6, 4.2); F('#fff', 1.2);
      E(-5, -49, 1.7, 2); F('#111', 0); E(5, -49, 1.7, 2); F('#111', 0);
      limb(-11, -57, -2, -53, null, null, 1.6, '#3a0808'); limb(9, -57, 1, -53, null, null, 1.6, '#3a0808');
      c.beginPath(); c.arc(0, -38, 4.5, 1.1 * Math.PI, 1.9 * Math.PI); c.strokeStyle = '#3a0808'; c.lineWidth = 2; c.stroke();
      c.restore();
    }
    function spikeweed(t, sh) {
      const ext = sh > 0 ? 1 + sh / 12 * 0.5 : 1;
      E(0, -4, 34, 9); F(cg('spb', () => lg(0, -12, 0, 4, ['#4f8a2a', '#2f5a18'])), 2.2);
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.42, bx = Math.cos(a + Math.PI / 2) * 0 + (i - 3) * 9, by = -8 - Math.abs(i - 3) * -1;
        const L = (14 - Math.abs(i - 3) * 1.8) * ext;
        c.beginPath(); c.moveTo(bx - 4, by); c.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); c.lineTo(bx + 4, by); c.closePath(); F('#dfe8c8', 1.6);
      }
      E(-8, -9, 3, 2.2); F('#fff', 1); E(6, -9, 3, 2.2); F('#fff', 1);
      E(-7.5, -8.6, 1.3, 1.2); F('#111', 0); E(6.5, -8.6, 1.3, 1.2); F('#111', 0);
      limb(-12, -12, -5, -11, null, null, 1.2, OL); limb(10, -12, 3, -11, null, null, 1.2, OL);
    }
    function torchwood(t) {
      c.beginPath(); c.moveTo(-24, -2); c.lineTo(-22, -54); c.quadraticCurveTo(0, -62, 22, -54); c.lineTo(24, -2); c.quadraticCurveTo(0, 4, -24, -2); c.closePath();
      F(cg('tw', () => lg(-24, 0, 24, 0, ['#8a5428', '#b27740', '#6a3c18'])), 2.4);
      c.strokeStyle = 'rgba(60,30,10,.4)'; c.lineWidth = 1.6;
      for (const gx of [-13, -4, 6, 15]) { c.beginPath(); c.moveTo(gx, -50); c.quadraticCurveTo(gx + 2, -26, gx - 1, -4); c.stroke(); }
      E(0, -55, 22, 6); F('#5a3214', 2);
      for (let i = 0; i < 6; i++) {
        const fx = -14 + i * 5.6, h = 18 + Math.sin(t * 0.25 + i * 1.7) * 6 + (i % 2 ? 6 : 0);
        c.beginPath(); c.moveTo(fx - 6, -55); c.quadraticCurveTo(fx - 4, -55 - h * 0.6, fx + Math.sin(t * 0.3 + i) * 2, -55 - h); c.quadraticCurveTo(fx + 4, -55 - h * 0.6, fx + 6, -55); c.closePath();
        c.fillStyle = i % 2 ? '#ffb52e' : '#ff6a1a'; c.fill();
      }
      E(0, -58, 12, 5); c.fillStyle = '#fff3a0'; c.fill();
      E(-8, -34, 4, 5); F('#ffe9a0', 1.4); E(8, -34, 4, 5); F('#ffe9a0', 1.4);
      E(-8, -33, 2, 2.4); F('#3a1a08', 0); E(8, -33, 2, 2.4); F('#3a1a08', 0);
      limb(-13, -42, -4, -39, null, null, 2, '#3a1a08'); limb(13, -42, 4, -39, null, null, 2, '#3a1a08');
      c.beginPath(); c.arc(0, -18, 5, 1.15 * Math.PI, 1.85 * Math.PI); c.strokeStyle = '#3a1a08'; c.lineWidth = 2; c.stroke();
    }
    function tallnut(t, st) {
      const sq = Math.sin(t * 0.04) * 0.7;
      c.beginPath(); c.moveTo(-26, -6); c.bezierCurveTo(-34, -40, -30, -102, -6, -110 - sq); c.quadraticCurveTo(14, -112, 24, -100); c.bezierCurveTo(34, -70, 34, -30, 26, -6); c.quadraticCurveTo(0, 4, -26, -6); c.closePath();
      F(cg('tn', () => rg(-8, -70, 4, 70, ['#e7b26a', '#c3843c', '#8a561f'])), 2.4);
      c.strokeStyle = 'rgba(90,50,10,.22)'; c.lineWidth = 1.6;
      for (const gx of [-14, -4, 8, 18]) { c.beginPath(); c.moveTo(gx * 0.6, -104); c.quadraticCurveTo(gx * 1.3, -56, gx * 0.8, -6); c.stroke(); }
      E(-14, -80, 5, 18, -0.2); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill();
      E(-2, -72, 6.5, 8.4); F('#fff', 1.6); E(13, -72, 5.6, 7.8); F('#fff', 1.6);
      E(0.5, -71, 2.4, 3); F('#111', 0); E(15, -71, 2.2, 2.8); F('#111', 0);
      limb(-9, -84, 3, -82, null, null, 1.8, OL); limb(9, -82, 19, -84, null, null, 1.8, OL);
      c.beginPath(); c.arc(6, -52, 5, 0.2 * Math.PI, 0.8 * Math.PI); c.strokeStyle = OL; c.lineWidth = 2; c.stroke();
      if (st >= 1) { c.beginPath(); c.moveTo(14, -104); c.lineTo(8, -92); c.lineTo(14, -86); c.moveTo(-22, -40); c.lineTo(-14, -34); c.lineTo(-18, -24); c.strokeStyle = '#4a2a0c'; c.lineWidth = 2; c.stroke(); }
      if (st >= 2) { c.beginPath(); c.moveTo(-4, -110); c.lineTo(8, -96); c.lineTo(22, -98); c.quadraticCurveTo(14, -110, -4, -110); F('#6a3d12', 1.6); c.beginPath(); c.moveTo(20, -50); c.lineTo(12, -40); c.lineTo(20, -30); c.strokeStyle = '#4a2a0c'; c.lineWidth = 2; c.stroke(); }
    }
    const PQ = {
      peashooter: [140, 12, 5, [-44, -88, 110, 96]], snowpea: [140, 12, 5, [-44, -88, 110, 96]], repeater: [140, 12, 5, [-44, -88, 110, 96]],
      threepeater: [140, 12, 5, [-52, -112, 128, 122]], sunflower: [126, 12, 5, [-50, -98, 100, 102]],
      wallnut: [157, 4, 0, [-32, -78, 64, 84]], tallnut: [157, 4, 0, [-40, -116, 80, 124]]
    };
    function puffshroom(t, sh) {
      const bob = Math.sin(t * 0.07) * 0.8, k = 1 - sh * 0.1;
      leaf(-3, -1, 14, 4.6, Math.PI + 0.25, '#5db534'); leaf(3, -1, 14, 4.6, -0.25, '#5db534');
      c.beginPath(); c.moveTo(-8, -1); c.quadraticCurveTo(-11, -14, -7, -23); c.lineTo(7, -23); c.quadraticCurveTo(11, -14, 8, -1); c.quadraticCurveTo(0, 4, -8, -1); c.closePath();
      F(cg('pfs', () => lg(-10, 0, 10, 0, ['#fbf3d6', '#e8d9a8', '#b9a56e'])), 2.2);
      E(-1, -23 + bob, 14, 5); F('#e7d49c', 1.6);
      E(-3, -17, 3.4, 4.3); F('#fff', 1.2); E(5, -17, 3.1, 4); F('#fff', 1.2);
      E(-2.4 + sh, -16.5, 1.5, 2); F('#111', 0); E(5.6 + sh, -16.5, 1.4, 1.9); F('#111', 0);
      c.beginPath(); c.arc(1, -9, 2.6 + sh * 2, 0.15 * Math.PI, 0.85 * Math.PI); c.strokeStyle = OL; c.lineWidth = 1.5; c.stroke();
      c.save(); c.translate(0, -26 + bob); c.scale(1 / k, k);
      c.beginPath(); c.moveTo(-19, 2); c.bezierCurveTo(-24, -22, 22, -24, 19, 2); c.quadraticCurveTo(0, 8, -19, 2); c.closePath();
      F(cg('pfc', () => rg(-6, -12, 2, 26, ['#d6a0ee', '#9a4fc6', '#5a2380'])), 2.2);
      for (const [x, y, r] of [[-8, -8, 2.6], [5, -12, 2.2], [10, -4, 2], [-1, -4, 1.8]]) { E(x, y, r, r * 0.8); c.fillStyle = 'rgba(240,210,255,.8)'; c.fill(); }
      E(-8, -14, 5, 2.2, -0.5); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
      c.restore();
    }
    function plant(type, t, p) {
      p = p || {};
      const q = PQ[type];
      if (q && !off) {
        const st = p.hp != null ? (p.hp < p.hpMax / 3 ? 2 : p.hp < p.hpMax * 2 / 3 ? 1 : 0) : 0;
        const qt = Math.floor(((t % q[0]) + q[0]) % q[0] / q[0] * q[1]);
        const ex = type === 'sunflower' ? (p.lc != null && p.lc < 100 ? Math.round((1 - p.lc / 100) * q[2]) : 0) : q[2] ? Math.round((p.sh || 0) / 18 * q[2]) : st;
        const qp = type === 'sunflower' ? { lc: ex ? 100 - ex / q[2] * 100 : 100 } : q[2] ? { sh: ex / q[2] * 18 } : { hp: [1, 0.5, 0.2][st], hpMax: 1 };
        sprite(type + qt + '_' + ex, q[3], a => a.plantRaw(type, qt * q[0] / q[1], qp));
        return;
      }
      plantRaw(type, t, p);
    }
    function plantRaw(type, t, p) {
      switch (type) {
        case 'threepeater': threepeater(t, (p.sh || 0) / 18); break;
        case 'squash': squash(t, p.st || 'idle', p.dir || 1); break;
        case 'puffshroom': puffshroom(t, (p.sh || 0) / 18); break;
        case 'jalapeno': jalapeno(t, p.cd != null ? 1 - p.cd / CFG.jalaFuse : 0); break;
        case 'spikeweed': spikeweed(t, p.sh || 0); break;
        case 'torchwood': torchwood(t); break;
        case 'tallnut': tallnut(t, p.hp != null ? (p.hp < p.hpMax / 3 ? 2 : p.hp < p.hpMax * 2 / 3 ? 1 : 0) : 0); break;
        case 'peashooter': case 'snowpea': case 'repeater': shooter(type, t, (p.sh || 0) / 18); break;
        case 'sunflower': sunflower(t, p.lc != null && p.lc < 100 ? 1 - p.lc / 100 : 0); break;
        case 'cherrybomb': cherry(t, p.cd != null ? 1 - p.cd / CFG.cherryFuse : 0); break;
        case 'wallnut': case 'bowlnut': case 'boomnut': wallnut(t, p.hp != null ? (p.hp < p.hpMax / 3 ? 2 : p.hp < p.hpMax * 2 / 3 ? 1 : 0) : 0, type === 'boomnut'); break;
        case 'potatomine': potato(t, p.st || 'armed', p.st === 'rise' ? 1 - p.cd / CFG.potatoRise : 1); break;
        case 'chomper': chomper(t, p.st || 'ready', p.st === 'bite' ? 1 - p.cd / CFG.chompBite : p.st === 'miss' ? 1 - p.cd / 40 : 0); break;
      }
    }

    function zombie(z, P, idle, tm) {
      const tp = z.type, st = z.st;
      const eat = st === 'eat', gasp = st === 'gasp', vault = st === 'vault';
      const run = (tp === 'pole' && z.pole && !vault) || (tp === 'football' && st === 'walk');
      const s = Math.sin(z.ph), co = Math.cos(z.ph);
      const still = eat || gasp || idle || st === 'smash' || st === 'throw';
      const str = run ? 19 : 12;
      const sx = still ? Math.sin(tm * 2 + z.id) * 1.5 : s * str;
      const bob = still ? 0 : Math.abs(co) * (run ? 4 : 2.2);
      const lean = run ? -0.24 : eat ? -0.14 : vault ? -0.1 : -0.07;
      const jaw = eat ? (Math.sin(z.eatT * 0.16) + 1) / 2 : gasp ? 1 : z.mad ? 0.8 : 0.22 + 0.1 * Math.sin(tm * 3 + z.id);
      const ea = eat ? Math.sin(z.eatT * 0.16) * 4 : 0;
      const hy = -46 - bob;
      const bare = tp === 'pole' || tp === 'imp' || tp === 'garg';
      const foot = tp === 'football';
      const jk = foot ? '#b8312a' : tp === 'news' ? P.vest : P.jacket;
      const sleeve = tp === 'news' ? P.vest : foot ? '#b8312a' : bare ? P.skin : P.jacket;
      const leg = (hx, fx, col) => {
        limb(hx, hy, (hx + fx) / 2 - 4, hy * 0.5, fx, -5, 10, col);
        E(fx - 6, -4, 10, 5.5); F(P.shoe, 2);
      };
      const armLimb = (sx0, sy0, ex, ey, hx2, hy2) => {
        limb(sx0, sy0, ex, ey, null, null, 9, sleeve);
        limb(ex, ey, hx2, hy2, null, null, 6.5, P.skin);
        E(hx2, hy2, 4.6, 4.6); F(P.skin, 1.8);
      };
      leg(7, 7 + sx, foot ? '#e9e4d2' : P.pantsD);
      c.save(); c.translate(0, -bob); c.rotate(lean);
      if (tp === 'garg') {
        const sm = st === 'smash' ? z.t : -1, up = sm >= 0 ? (sm < CFG.smash ? ease(sm / CFG.smash) : 1 - ease((sm - CFG.smash) / 20)) : 0;
        const ang = -0.4 - up * 2.2;
        c.save(); c.translate(10, -86); c.rotate(ang);
        RR(-5, -112, 12, 124, 4); F(cg('gpole', () => lg(-5, 0, 7, 0, ['#9a6a3a', '#6a421f'])), 2.2);
        c.fillStyle = 'rgba(40,20,5,.35)'; for (let k = -100; k < 0; k += 18) c.fillRect(-4, k, 10, 2);
        c.restore();
        armLimb(9, -86, 14 + up * 4, -96 - up * 18, 10, -98 - up * 26);
      } else if (tp === 'imp') armLimb(9, -86, 7 + co * 3, -67, -2 + co * 5, -53);
      else
      if (tp === 'flag') {
        limb(12, -58, 18, -182, null, null, 3, '#7a5530');
        c.beginPath(); c.moveTo(18, -180); c.lineTo(58, -176 + Math.sin(tm * 4) * 3); c.lineTo(52, -164); c.lineTo(60, -152 + Math.sin(tm * 4 + 1) * 3); c.lineTo(18, -148); c.closePath(); F(P.flag, 2);
        E(37, -164, 8, 6); F('#f0a4b4', 1.4);
        c.beginPath(); c.moveTo(31, -164); c.quadraticCurveTo(37, -159, 43, -164); c.strokeStyle = '#b5566b'; c.lineWidth = 1.2; c.stroke();
        armLimb(9, -86, 16, -104, 14, -118);
      } else if (tp === 'news' && !z.mad && z.paper > 0) armLimb(9, -86, -8, -82, -26, -86);
      else if (run) armLimb(9, -86, 2, -70, -8, -72);
      else if (eat) armLimb(9, -86, -10, -90, -28, -96 + ea);
      else armLimb(9, -86, 7 + co * 3, -67, -2 + co * 5, -53);
      c.restore();
      leg(-3, -3 - sx, foot ? '#f2eee0' : P.pants);
      c.save(); c.translate(0, -bob); c.rotate(lean);
      if (tp === 'garg' || tp === 'imp') {
        c.beginPath(); c.moveTo(-15, -44); c.lineTo(-17, -88); c.quadraticCurveTo(0, -98, 16, -86); c.lineTo(14, -44); c.closePath(); F(tp === 'garg' ? '#d9d2bd' : P.tank, 2.2);
        c.fillStyle = 'rgba(80,60,30,.25)'; for (const [x0, y0] of [[-8, -70], [4, -60], [-2, -80]]) { E(x0, y0, 4, 3); c.fill(); }
        c.beginPath(); c.moveTo(-15, -50); c.lineTo(-10, -44); c.lineTo(-5, -50); c.lineTo(0, -44); c.lineTo(5, -50); c.lineTo(10, -44); c.lineTo(14, -50); c.lineTo(14, -44); c.lineTo(-15, -44); c.closePath(); F(P.pants, 1.4);
        if (tp === 'garg' && !z.thrown) {
          c.save(); c.translate(16, -96); c.scale(0.5, 0.5);
          E(0, -20, 19, 21); F(P.skin, 2.2); E(-8, -24, 6, 7); F(P.eye, 1.4); E(4, -26, 5, 6); F(P.eye, 1.4); E(-9, -23, 2, 2); F(P.pupil, 0); E(3, -25, 1.8, 1.8); F(P.pupil, 0);
          E(-10, -6, 5, 3); F(P.mouth, 1.2);
          c.restore();
        }
      } else if (bare) {
        c.beginPath(); c.moveTo(-13, -44); c.lineTo(-13, -88); c.quadraticCurveTo(0, -95, 13, -86); c.lineTo(12, -44); c.closePath(); F(P.tank, 2.2);
        c.beginPath(); c.moveTo(-13, -70); c.lineTo(13, -66); c.lineTo(13, -58); c.lineTo(-13, -62); c.closePath(); F(P.stripe, 0);
        c.fillStyle = P.pants; c.fillRect(-13, -50, 25, 7);
      } else if (foot) {
        c.beginPath(); c.moveTo(-13, -42); c.lineTo(-15, -90); c.quadraticCurveTo(0, -98, 14, -88); c.lineTo(13, -42); c.closePath(); F(jk, 2.2);
        c.save(); c.clip(); c.fillStyle = '#fff'; c.fillRect(-20, -66, 40, 4); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(5, -100, 20, 70); c.restore();
        A_T('Z', 0, -74, 15, '#fff');
        E(-14, -90, 11, 7, -0.3); F('#c93a32', 2); E(12, -88, 10, 7, 0.3); F('#c93a32', 2);
      } else {
        c.beginPath(); c.moveTo(-13, -42); c.lineTo(-15, -90); c.quadraticCurveTo(0, -98, 14, -88); c.lineTo(13, -42);
        c.lineTo(8, -38); c.lineTo(4, -43); c.lineTo(-2, -38); c.lineTo(-7, -43); c.closePath();
        const jc = tp === 'news' ? P.vest : P.jacket;
        F(cg('jk' + jc, () => lg(-15, 0, 14, 0, [mix(jc, '#ffffff', 0.16), jc, mix(jc, '#000000', 0.3)])), 2.2);
        c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(5, -100, 20, 70); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(-20, -100, 10, 70); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-20, -48, 40, 10); c.restore();
        c.beginPath(); c.moveTo(-11, -90); c.lineTo(1, -91); c.lineTo(-6, -64); c.closePath(); F(P.shirt, 1.5);
        if (tp === 'news') { c.beginPath(); c.moveTo(-10, -89); c.lineTo(-5, -86); c.lineTo(-1, -89); c.lineTo(-1, -84); c.lineTo(-5, -86); c.lineTo(-10, -84); c.closePath(); F(P.tie, 1.2); }
        else { c.beginPath(); c.moveTo(-6, -88); c.lineTo(-3, -88); c.lineTo(-2, -71); c.lineTo(-5, -66); c.lineTo(-8, -71); c.closePath(); F(P.tie, 1.3); }
        limb(-12, -58, -3, -60, null, null, 1.2, P.jacketD);
        for (const by of [-64, -54]) { E(5, by, 1.9, 1.9); F(tp === 'news' ? P.vestD : P.jacketD, 1); E(4.5, by - 0.6, 0.6, 0.6); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); }
        limb(1, -90, 8, -66, null, null, 1.1, tp === 'news' ? P.vestD : P.jacketD);
      }
      if (z.head) {
        c.save(); c.translate(-5, -93); c.rotate(eat ? -0.12 + jaw * 0.08 : gasp ? 0.18 : z.mad ? -0.08 : Math.sin(z.ph * 0.5) * 0.05);
        head(z, P, jaw);
        c.restore();
      } else { E(-5, -93, 6.5, 4); F(P.skinD, 1.8); E(-5, -94, 3.5, 2); F('#7a2a22', 0); }
      if (tp === 'news' && z.paper > 0 && !z.mad) {
        c.save(); c.translate(-36, -82); c.rotate(-0.1);
        const torn = z.paper < 75;
        c.beginPath(); c.moveTo(-15, -24); c.lineTo(13, -24); c.lineTo(15, torn ? 2 : 18); if (torn) { c.lineTo(8, 6); c.lineTo(2, 14); } c.lineTo(-14, 18); c.closePath(); F(P.paper, 1.8);
        c.fillStyle = '#7d7a70'; c.fillRect(-11, -20, 22, 5);
        c.fillStyle = '#b7b3a6';
        for (let i = 0; i < 5; i++) c.fillRect(-11, -11 + i * 5, i === 4 && torn ? 10 : 22, 2);
        c.restore();
      }
      if (run && tp === 'pole') limb(-84, -78, 50, -68, null, null, 4, P.pole);
      if (z.door > 0) {
        const k = z.door / z.doorMax, stg = k > 2 / 3 ? 0 : k > 1 / 3 ? 1 : 2;
        c.save(); c.translate(-34, -66); c.rotate(-0.05 + stg * 0.03);
        RR(-20, -46, 40, 92, 3); F('#7d8790', 2.4);
        c.save(); RR(-15, -41, 30, 82, 2); c.clip();
        c.fillStyle = 'rgba(160,190,205,.55)'; c.fillRect(-15, -41, 30, 82);
        c.strokeStyle = 'rgba(40,50,60,.45)'; c.lineWidth = 1;
        for (let gx = -15; gx < 16; gx += 4) { c.beginPath(); c.moveTo(gx, -41); c.lineTo(gx, 41); c.stroke(); }
        for (let gy = -41; gy < 42; gy += 4) { c.beginPath(); c.moveTo(-15, gy); c.lineTo(15, gy); c.stroke(); }
        if (stg >= 1) { E(6, -18, 7, 9); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); }
        if (stg >= 2) { E(-6, 16, 8, 10); c.fillStyle = 'rgba(0,0,0,.4)'; c.fill(); }
        c.restore();
        RR(-20, -4, 40, 6, 2); F('#9aa3ab', 1.6);
        E(14, 4, 2.4, 2.4); F('#d8c25a', 1.2);
        c.restore();
      }
      if (z.arm) {
        if (z.door > 0) armLimb(-8, -88, -24, -78, -34, -72);
        else if (tp === 'garg' && st === 'throw') armLimb(-8, -88, 4, -110, 14, -128 + Math.min(1, z.t / 40) * 30);
        else if (tp === 'news' && !z.mad && z.paper > 0) armLimb(-8, -88, -24, -76, -38, -80);
        else if (run) armLimb(-8, -88, -18, -70, -30, -74);
        else if (eat) armLimb(-8, -88, -24, -92, -40, -100 - ea);
        else if (z.mad) armLimb(-8, -88, -24, -82, -40, -84);
        else if (vault) armLimb(-8, -88, -20, -100, -26, -116);
        else armLimb(-8, -88, -20 - co * 3, -72, -32 - co * 4, -66);
      } else {
        limb(-8, -88, -14, -78, null, null, 9, sleeve);
        c.beginPath(); c.moveTo(-18, -82); c.lineTo(-15, -74); c.lineTo(-11, -79); c.lineTo(-9, -73); c.strokeStyle = OL; c.lineWidth = 1.4; c.stroke();
      }
      c.restore();
    }
    function head(z, P, jaw) {
      const tp = z.type;
      E(13, -18, 4, 6); F(P.skinD, 1.6);
      E(-3, -20, 19, 21); F(cg('hd' + P.skin, () => rg(-10, -30, 3, 30, [mix(P.skin, '#ffffff', 0.28), P.skin, P.skinD])), 2.2);
      c.beginPath(); c.moveTo(-20, -12); c.quadraticCurveTo(-16, 2 + jaw * 3, -2, 2 + jaw * 2); c.quadraticCurveTo(8, 0, 12, -8); c.strokeStyle = 'rgba(60,70,40,.35)'; c.lineWidth = 2; c.stroke();
      E(-15, -6 + jaw * 2, 5.6, 2 + jaw * 4); F(P.mouth, 1.4);
      c.fillStyle = P.teeth; c.fillRect(-18.5, -8 + jaw * 0.5, 2.6, 3); c.fillRect(-14, -8 + jaw * 0.5, 2.6, 2.6);
      const mad = z.mad;
      E(-9, 8, 5, 2.6); c.fillStyle = 'rgba(70,80,50,.28)'; c.fill(); E(6, -6, 5.5, 3.6); c.fillStyle = 'rgba(80,100,60,.3)'; c.fill();
      E(-12, -17, 6.5, 2.4); c.fillStyle = 'rgba(70,55,85,.3)'; c.fill(); E(-1, -19, 4.6, 2); c.fill();
      E(-12, -24, 7, 8); F(P.eye, 1.6); E(-1, -26, 5.2, 6.2); F(P.eye, 1.4);
      c.beginPath(); c.moveTo(-17, -22); c.lineTo(-14, -23); c.moveTo(-8, -20); c.lineTo(-10, -22); c.moveTo(-5, -25); c.lineTo(-3, -26); c.strokeStyle = 'rgba(190,40,40,.55)'; c.lineWidth = 0.9; c.stroke();
      E(-14, -23, 2, 2); F(mad ? '#d6281d' : P.pupil, 0); E(-3, -25, 1.7, 1.7); F(mad ? '#d6281d' : P.pupil, 0);
      E(-14.6, -23.8, 0.7, 0.7); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
      if (!tp || tp === 'basic') { c.beginPath(); c.moveTo(3, -38); c.lineTo(9, -34); c.moveTo(4, -35); c.lineTo(8, -38); c.strokeStyle = 'rgba(60,40,30,.7)'; c.lineWidth = 1.2; c.stroke(); }
      if (mad) { limb(-20, -34, -8, -29, null, null, 2, OL); limb(-6, -33, 3, -35, null, null, 2, OL); }
      else { limb(-19, -33, -7, -34, null, null, 1.5, 'rgba(40,40,30,.8)'); }
      if (tp === 'news') {
        c.beginPath(); c.arc(-12, -24, 8.5, 0, TAU); c.moveTo(4.6, -26); c.arc(-1, -26, 6.6, 0, TAU);
        c.strokeStyle = OL; c.lineWidth = 2; c.stroke();
        limb(-3.5, -25, -5.5, -25, null, null, 1, OL);
        E(10, -30, 6, 4); F('#d9d6cc', 1.4); E(-16, -38, 7, 4); F('#d9d6cc', 1.4);
      } else if (tp === 'pole') {
        c.beginPath(); c.moveTo(-21, -30); c.quadraticCurveTo(-3, -36, 15, -28); c.lineTo(15, -22); c.quadraticCurveTo(-3, -30, -22, -24); c.closePath(); F(P.band, 1.6);
        limb(14, -25, 22, -18, null, null, 3, P.band);
      } else if (!z.helmType) {
        c.beginPath(); c.moveTo(-6, -40); c.quadraticCurveTo(-2, -48, 4, -46); c.moveTo(0, -40); c.quadraticCurveTo(6, -46, 10, -42); c.moveTo(-12, -39); c.quadraticCurveTo(-12, -46, -6, -46);
        c.strokeStyle = P.hair; c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke();
      }
      if (z.helmType && z.helm > 0) helmet(z.helmType, z.helm / z.helmMax, P);
    }
    function helmet(type, k, P) {
      const stage = k > 2 / 3 ? 0 : k > 1 / 3 ? 1 : 2;
      if (type === 'football') {
        c.save(); c.translate(-3, -30); c.rotate(-0.06 + stage * 0.04);
        c.beginPath(); c.arc(0, -4, 23, Math.PI * 0.95, Math.PI * 2.05); c.lineTo(22, 6); c.lineTo(-22, 8); c.closePath();
        F(cg('fbh', () => lg(-22, -24, 18, 8, ['#4a4f5a', '#24272e', '#101114'])), 2.2);
        c.save(); c.clip(); c.fillStyle = '#c93a32'; c.fillRect(-4, -30, 8, 40); c.restore();
        c.strokeStyle = '#d9dde2'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-22, 2); c.lineTo(-30, 6); c.lineTo(-28, 16); c.lineTo(-14, 16); c.moveTo(-30, 10); c.lineTo(-16, 10); c.stroke();
        E(-10, -16, 5, 3, -0.4); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
        if (stage >= 1) { c.beginPath(); c.moveTo(10, -18); c.lineTo(5, -10); c.lineTo(11, -4); c.strokeStyle = '#8a8f98'; c.lineWidth = 1.6; c.stroke(); }
        if (stage >= 2) { E(12, -6, 5, 4); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); }
        c.restore();
      } else if (type === 'cone') {
        c.save(); c.translate(-4, -35); c.rotate(-0.12 + stage * 0.07);
        c.beginPath(); c.moveTo(-2 + stage * 2, -44 + stage * 5); c.lineTo(-23, 2); c.lineTo(19, 3); c.closePath();
        F(cg('cone', () => lg(-20, 0, 18, 0, ['#ffb35a', '#f38b26', '#c2621a'])), 2.2);
        c.beginPath(); c.moveTo(-9, -24); c.lineTo(5, -24); c.lineTo(8, -15); c.lineTo(-13, -15); c.closePath(); F('#fff1dc', 1.3);
        c.beginPath(); c.moveTo(-12, -9); c.lineTo(9, -9); c.lineTo(11, -4); c.lineTo(-15, -4); c.closePath(); F('#fff1dc', 1.2);
        c.beginPath(); c.moveTo(-6, -36); c.lineTo(-17, -4); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
        if (stage >= 1) { c.beginPath(); c.moveTo(8, -30); c.lineTo(2, -26); c.lineTo(10, -21); c.strokeStyle = OL; c.lineWidth = 1.6; c.stroke(); }
        if (stage >= 2) { c.beginPath(); c.moveTo(-14, -12); c.lineTo(-8, -8); c.lineTo(-15, -3); c.moveTo(-6, -36); c.lineTo(-2, -32); c.stroke(); }
        E(-2, 3, 23, 5); F(P.coneD, 2);
        c.restore();
      } else {
        c.save(); c.translate(-3, -38); c.rotate(stage * 0.05);
        c.beginPath(); c.moveTo(-19, -22); c.lineTo(17, -22); c.lineTo(22, 8); c.lineTo(-25, 8); c.closePath();
        F(cg('pail', () => lg(-24, 0, 22, 0, ['#d6dde3', '#a3adb7', '#6d7781'])), 2.2);
        E(-1, -22, 18, 4.5); F(P.pailD, 1.8);
        RR(-26, 3, 49, 7, 2); F(P.pailD, 1.8);
        c.beginPath(); c.moveTo(-23, -2); c.quadraticCurveTo(-1, 24, 21, -2); c.strokeStyle = '#555c63'; c.lineWidth = 1.6; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-14, -18, 4, 22); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(12, -18, 6, 24);
        c.beginPath(); c.arc(-1, -22, 17, Math.PI, 0); c.strokeStyle = '#4a5058'; c.lineWidth = 2; c.stroke();
        for (const rx of [-18, 16]) { E(rx, -3, 1.6, 1.6); c.fillStyle = '#d6dde3'; c.fill(); }
        if (stage >= 1) { c.beginPath(); c.moveTo(6, -18); c.lineTo(10, -10); c.lineTo(4, -4); c.strokeStyle = OL; c.lineWidth = 1.6; c.stroke(); E(-8, -6, 4, 3); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill(); }
        if (stage >= 2) { E(10, 0, 5, 4); c.fillStyle = 'rgba(0,0,0,.22)'; c.fill(); c.beginPath(); c.moveTo(-18, -16); c.lineTo(-12, -8); c.stroke(); }
        c.restore();
      }
    }
    const ZB = {
      zombie: [-65, -148, 96, 157], cone: [-65, -179, 96, 188], bucket: [-65, -178, 96, 187], news: [-74, -142, 105, 151],
      screen: [-77, -148, 108, 157], football: [-72, -155, 110, 164], pole: [-110, -141, 152, 150], flag: [-65, -194, 121, 202]
    };
    function zsprite(z, P, idle, tm) {
      const b = ZB[z.type];
      if (off || !b || z.flash > 12) return zombie(z, P, idle, tm);
      const eat = z.st === 'eat', N = 24, ang = TAU / N;
      const q = eat ? Math.floor(((z.eatT * 0.16) % TAU + TAU) % TAU / ang) : Math.floor(((z.ph % TAU) + TAU) % TAU / ang);
      const hs = z.helmType && z.helm > 0 ? 1 + (z.helm / z.helmMax > 2 / 3 ? 0 : z.helm / z.helmMax > 1 / 3 ? 1 : 2) : 0;
      const ds = z.door > 0 ? 1 + (z.door / z.doorMax > 2 / 3 ? 0 : z.door / z.doorMax > 1 / 3 ? 1 : 2) : 0;
      const key = z.type + z.st + q + (idle ? 'i' : '') + (z.pole ? 'p' : '') + (z.mad ? 'm' : '') + (z.head ? 'h' : '') + (z.arm ? 'a' : '') + (z.chill > 0 ? 'c' : '') + hs + ds + (z.paper > 0 ? (z.paper < 75 ? 2 : 1) : 0);
      sprite(key, b, a => {
        const o = Object.assign({}, z, { id: 0 });
        if (eat) { o.eatT = (q + 0.5) * ang / 0.16; o.ph = 0; a.zombie(o, P, false, 0); }
        else { o.ph = (q + 0.5) * ang; a.zombie(o, P, idle, o.ph / 2); }
      });
    }
    function zombieAt(z, x, y, tm, idle) {
      let P = z.st === 'burn' ? ZBURN : ZPAL[(z.chill > 0 ? 2 : 0) + (z.flash > 12 ? 1 : 0)];
      c.save(); c.translate(x, y);
      let a = 1;
      E(0, 0, 26, 7); c.fillStyle = 'rgba(0,0,0,.22)'; c.fill();
      if (z.st === 'die') {
        const k = ease(z.t / 55);
        c.rotate(z.dir * k * 1.45);
        if (z.t > 110) a = 1 - (z.t - 110) / 50;
      } else if (z.st === 'burn') { if (z.t > 60) a = 1 - (z.t - 60) / 30; }
      else if (z.st === 'mow') { const k = z.t / 50; c.scale(1 + k * 0.3, 1 - k * 0.9); a = 1 - k; }
      else if (z.st === 'flat') { const k = clamp(z.t / 8, 0, 1); c.scale(1 + k * 0.35, 1 - k * 0.82); if (z.t > 80) a = 1 - (z.t - 80) / 40; }
      if (z.alt) c.translate(0, -z.alt);
      if (z.big) c.scale(1.5, 1.5); else if (z.type === 'imp') c.scale(0.72, 0.72);
      if (z.st === 'fly') c.rotate(-Math.sin(clamp(z.t / CFG.impFly, 0, 1) * Math.PI) * 0.9);
      if (z.st === 'vault') c.rotate(-Math.sin(clamp((z.t / CFG.vault - 0.3) / 0.55, 0, 1) * Math.PI) * 0.5);
      c.globalAlpha = clamp(a, 0, 1);
      zsprite(z, P, idle, tm);
      c.globalAlpha = 1;
      c.restore();
    }
    function zHead(type, chill, mad) {
      const P = ZPAL[chill ? 2 : 0];
      head({ type, mad, helmType: null, helm: 0, helmMax: 1 }, P, 0.6);
    }
    function zArm(type, chill) {
      const P = ZPAL[chill ? 2 : 0], sl = type === 'news' ? P.vest : type === 'pole' ? P.skin : P.jacket;
      limb(0, 0, -10, 12, null, null, 9, sl); limb(-10, 12, -18, 22, null, null, 6.5, P.skin); E(-18, 22, 4.6, 4.6); F(P.skin, 1.8);
    }
    function mower(x, y, run, t) {
      c.save(); c.translate(x, y + (run ? Math.sin(t * 1.4) * 1.2 : 0));
      E(28, -2, 30, 6); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
      limb(10, -28, -12, -56, null, null, 3.5, '#8e959c'); limb(-16, -58, -8, -54, null, null, 4, '#2c2c2c');
      RR(2, -36, 52, 26, 8); F(cg('mow', () => lg(0, -36, 0, -10, ['#ff6a52', '#d92c1f', '#94160f'])), 2.2);
      RR(14, -50, 24, 16, 5); F('#a9b1b8', 2); RR(18, -54, 12, 6, 2); F('#5f666d', 1.6);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(8, -32, 30, 4);
      c.fillStyle = '#2a1410'; c.fillRect(48, -30, 5, 14); c.fillStyle = 'rgba(255,255,255,.4)'; for (let gy = -28; gy < -16; gy += 3) c.fillRect(48, gy, 5, 1);
      E(54, -33, 2.8, 3.2); F('#ffe9a0', 1.2);
      for (const wx of [12, 46]) {
        E(wx, -9, 9, 9); F('#2a2a2a', 2); E(wx, -9, 5.4, 5.4); F('#8c949b', 0);
        c.strokeStyle = '#d6dce0'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4 + (run ? t * 6 : 0); c.moveTo(wx + Math.cos(a) * 5, -9 + Math.sin(a) * 5); c.lineTo(wx - Math.cos(a) * 5, -9 - Math.sin(a) * 5); } c.stroke();
        E(wx, -9, 1.6, 1.6); F('#2a2a2a', 0);
      }
      if (run) { for (let i = 0; i < 3; i++) { const k = ((t * 3 + i / 3) % 1); E(-6 - k * 22, -34 - k * 14, 3 + k * 5, 3 + k * 5); c.fillStyle = 'rgba(190,190,190,' + (0.45 * (1 - k)).toFixed(2) + ')'; c.fill(); } }
      if (run) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -20); c.lineTo(-22, -20); c.moveTo(-6, -30); c.lineTo(-18, -30); c.stroke(); }
      c.restore();
    }
    function sun(x, y, sc, rot, a) {
      c.save(); c.translate(x, y); c.scale(sc, sc); c.globalAlpha = a;
      E(0, 0, 44, 44); c.fillStyle = cg('sung', () => rg(0, 0, 10, 44, ['rgba(255,244,150,.75)', 'rgba(255,220,80,0)'])); c.fill();
      c.rotate(rot);
      c.beginPath();
      for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU, a1 = a0 + TAU / 24, a2 = a0 + TAU / 12; c.lineTo(Math.cos(a0) * 21, Math.sin(a0) * 21); c.lineTo(Math.cos(a1) * 34, Math.sin(a1) * 34); c.lineTo(Math.cos(a2) * 21, Math.sin(a2) * 21); }
      c.closePath(); c.fillStyle = '#ffd43b'; c.fill(); c.strokeStyle = '#f0a51c'; c.lineWidth = 1.6; c.stroke();
      E(0, 0, 22, 22); c.fillStyle = cg('sunc', () => rg(-6, -7, 2, 24, ['#fffbe0', '#ffe25a', '#f7a823'])); c.fill(); c.strokeStyle = '#e8961a'; c.lineWidth = 2; c.stroke();
      c.globalAlpha = 1;
      c.restore();
    }
    function pea(x, y, snow, fire, t, spore) {
      if (spore) {
        c.save(); c.translate(x, y);
        E(-9, 0, 8, 3); c.fillStyle = 'rgba(190,130,230,.3)'; c.fill();
        E(0, 0, 6.5, 6.5); F(cg('spore', () => rg(-2, -2, 1, 7, ['#f0d2ff', '#b06ad8', '#6a2f93'])), 1.6);
        E(-2, -2.4, 2, 1.4, -0.6); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
        c.restore();
        return;
      }
      if (fire) {
        c.save(); c.translate(x, y);
        for (let i = 0; i < 4; i++) { const k = i / 4, w = Math.sin((t || 0) * 0.4 + i) * 2; E(-10 - k * 18, w * k, 10 - k * 6, 7 - k * 4); c.fillStyle = i % 2 ? 'rgba(255,120,30,.55)' : 'rgba(255,200,60,.55)'; c.fill(); }
        E(0, 0, 10, 9); F(cg('peaf', () => rg(-3, -3, 1, 11, ['#fff7c0', '#ffb02e', '#e8451a'])), 1.8);
        c.restore();
        return;
      }
      c.save(); c.translate(x, y);
      if (snow) { E(-10, 0, 10, 5); c.fillStyle = 'rgba(200,240,255,.5)'; c.fill(); }
      E(-13, 0, 11, 3.8); c.fillStyle = snow ? 'rgba(190,235,255,.28)' : 'rgba(150,230,80,.26)'; c.fill();
      E(0, 0, 9, 9); F(snow ? cg('peas', () => rg(-3, -3, 1, 10, ['#f2fdff', '#9fe1f6', '#3d97c6'])) : cg('pea', () => rg(-3, -3, 1, 10, ['#d9ff9a', '#86d63f', '#3f8f1f'])), 1.8);
      E(-3.2, -3.4, 2.6, 1.7, -0.6); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
      c.restore();
    }
    function packet(type, x, y, w, h, o) {
      const s = Math.min(w / 50, h / 70);
      c.save(); c.translate(x + (w - 50 * s) / 2, y + (h - 70 * s) / 2); c.scale(s, s);
      RR(0, 0, 50, 70, 5); F(type === 'boomnut' ? '#d98a6e' : '#d6b46e', 2);
      const ih = o.cost != null ? 47 : 63;
      RR(3.5, 3.5, 43, ih, 3); F(cg('pk' + ih, () => lg(0, 4, 0, 3.5 + ih, ['#f6fbe2', '#bde088'])), 1.2);
      c.save(); RR(3.5, 3.5, 43, ih, 3); c.clip(); c.translate(25, (type === 'potatomine' ? 40 : type === 'spikeweed' ? 36 : 47) + ih - 47); const ps = { chomper: 0.42, wallnut: 0.5, bowlnut: 0.5, boomnut: 0.5, tallnut: 0.36, threepeater: 0.44, squash: 0.5, jalapeno: 0.5, spikeweed: 0.62, torchwood: 0.52, puffshroom: 1 }[type] || 0.54; c.scale(ps, ps);
      plant(type, 0, { st: type === 'potatomine' ? 'armed' : type === 'chomper' ? 'ready' : '' });
      c.restore();
      if (o.cost != null) {
        RR(3.5, 53, 43, 14, 3); F('#fbf5df', 1.2);
        c.font = '900 ' + (o.big ? 14 : 12) + 'px Nunito, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1d1407'; c.fillText(String(o.cost), 25, 60.5);
      }
      if (o.cd > 0) { c.fillStyle = 'rgba(20,14,6,.55)'; c.fillRect(1, 1, 48, 68 * o.cd); }
      if (o.dim) { RR(0, 0, 50, 70, 5); c.fillStyle = 'rgba(20,14,6,.42)'; c.fill(); }
      if (o.fl) { RR(0, 0, 50, 70, 5); c.fillStyle = 'rgba(255,255,255,' + (o.fl / 30 * 0.7).toFixed(2) + ')'; c.fill(); }
      if (o.sel) { RR(-2, -2, 54, 74, 7); c.strokeStyle = '#fff6a0'; c.lineWidth = 3; c.stroke(); }
      c.restore();
    }
    function shovel(x, y, s, a) {
      c.save(); c.translate(x, y); c.scale(s, s); c.rotate(a || 0);
      limb(-16, -16, 6, 6, null, null, 5, '#9a6a3a');
      RR(-24, -24, 12, 7, 3); F('#7a4f28', 1.8);
      c.save(); c.translate(10, 10); c.rotate(Math.PI / 4);
      c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, -4); c.lineTo(8, 10); c.quadraticCurveTo(0, 22, -8, 10); c.closePath(); F(cg('shv', () => lg(-8, 0, 8, 0, ['#e6ebef', '#a7b0b8', '#6f7880'])), 2);
      c.restore();
      c.restore();
    }
    function award(type, x, y, s, t) {
      c.save(); c.translate(x, y); c.scale(s, s);
      c.save(); c.rotate(t * 0.01);
      c.fillStyle = 'rgba(255,255,220,.55)';
      for (let i = 0; i < 10; i++) { c.rotate(TAU / 10); c.beginPath(); c.moveTo(0, 0); c.lineTo(-9, -70); c.lineTo(9, -70); c.closePath(); c.fill(); }
      c.restore();
      E(0, 0, 46, 46); c.fillStyle = cg('awg', () => rg(0, 0, 4, 46, ['rgba(255,255,255,.9)', 'rgba(255,255,200,0)'])); c.fill();
      if (PL[type]) packet(type, -25, -35, 50, 70, { cost: PL[type].cost });
      else if (type === 'shovel') { RR(-30, -30, 60, 60, 10); F('#c69a5a', 2); shovel(0, 0, 1.2, 0); }
      else if (type === 'note') { c.rotate(-0.08); RR(-24, -30, 48, 60, 3); F('#fbf3d6', 2); c.fillStyle = '#7a6a50'; for (let i = 0; i < 6; i++) c.fillRect(-16, -20 + i * 8, i === 5 ? 18 : 32, 2.4); }
      else trophy();
      c.restore();
    }
    function trophy() {
      c.beginPath(); c.moveTo(-22, -26); c.lineTo(22, -26); c.quadraticCurveTo(22, 2, 6, 8); c.lineTo(6, 18); c.lineTo(16, 24); c.lineTo(-16, 24); c.lineTo(-6, 18); c.lineTo(-6, 8); c.quadraticCurveTo(-22, 2, -22, -26); c.closePath();
      F(cg('tro', () => lg(-22, 0, 22, 0, ['#fff2a8', '#f6c736', '#b8860b'])), 2.2);
      c.beginPath(); c.arc(-22, -14, 9, 0.5 * Math.PI, 1.5 * Math.PI); c.moveTo(22, -23); c.arc(22, -14, 9, -0.5 * Math.PI, 0.5 * Math.PI); c.strokeStyle = OL; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#f6c736'; c.lineWidth = 2; c.stroke();
      c.save(); c.translate(0, -10); c.scale(0.38, 0.38); for (let i = 0; i < 12; i++) { c.save(); c.rotate(i / 12 * TAU); E(0, -21, 6, 11); F('#ffe36a', 2); c.restore(); } E(0, 0, 15, 15); F('#c98a2b', 2); c.restore();
    }
    function part(q) {
      const k = q.life ? q.t / q.life : 0;
      switch (q.k) {
        case 'dot': E(q.x, q.y, q.r, q.r); c.fillStyle = q.c; c.globalAlpha = 1 - k * 0.6; c.fill(); c.globalAlpha = 1; break;
        case 'dirt': E(q.x, q.y, q.r, q.r * 0.8); c.fillStyle = '#6b4a24'; c.globalAlpha = 1 - k; c.fill(); c.globalAlpha = 1; break;
        case 'leaf': c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = 1 - k; leaf(0, 0, 12, 4, 0, '#5db534'); c.restore(); c.globalAlpha = 1; break;
        case 'splat': {
          c.save(); c.translate(q.x, q.y); c.globalAlpha = 1 - k; c.fillStyle = q.c;
          for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; E(Math.cos(a) * (5 + k * 8), Math.sin(a) * (5 + k * 8), 4 - k * 2, 4 - k * 2); c.fill(); }
          E(0, 0, 6 - k * 3, 7 - k * 3); c.fill(); c.restore(); c.globalAlpha = 1; break;
        }
        case 'arm': c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; zArm(q.type, q.chill); c.restore(); c.globalAlpha = 1; break;
        case 'head': c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; c.translate(3, 20); zHead(q.type, q.chill, q.mad); c.restore(); c.globalAlpha = 1; break;
        case 'helm': c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; c.translate(4, 36); helmet(q.type, 0.2, ZPAL[0]); c.restore(); c.globalAlpha = 1; break;
        case 'paper': c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = 1 - k; RR(-q.r, -q.r * 0.7, q.r * 2, q.r * 1.4, 1); F('#f4f1e6', 1.2); c.restore(); c.globalAlpha = 1; break;
        case 'door': c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; RR(-20, -46, 40, 92, 3); F('#7d8790', 2); RR(-15, -41, 30, 82, 2); c.fillStyle = 'rgba(160,190,205,.5)'; c.fill(); c.restore(); c.globalAlpha = 1; break;
        case 'fire': {
          const kk = clamp((q.t - (q.d || 0)) / 60, 0, 1);
          if (q.t < (q.d || 0)) break;
          c.save(); c.translate(q.x, q.y); c.globalAlpha = kk < 0.7 ? 1 : (1 - kk) / 0.3;
          for (let i = 0; i < 5; i++) {
            const fx = -30 + i * 15, h = q.r * (0.6 + 0.4 * Math.sin(q.t * 0.3 + i * 2)) * (kk < 0.2 ? kk / 0.2 : 1);
            c.beginPath(); c.moveTo(fx - 12, 0); c.quadraticCurveTo(fx - 8, -h * 0.6, fx, -h); c.quadraticCurveTo(fx + 8, -h * 0.6, fx + 12, 0); c.closePath();
            c.fillStyle = i % 2 ? 'rgba(255,190,50,.9)' : 'rgba(255,90,20,.9)'; c.fill();
          }
          E(0, -8, 34, 10); c.fillStyle = 'rgba(255,240,150,.7)'; c.fill();
          c.restore(); c.globalAlpha = 1; break;
        }
        case 'boom': case 'spud': {
          const r = q.r * (0.35 + 0.65 * ease(k * 2.2)), a = k < 0.5 ? 1 : 1 - (k - 0.5) * 2;
          c.save(); c.translate(q.x, q.y); c.globalAlpha = clamp(a, 0, 1);
          const cols = q.k === 'boom' ? ['#fff6c0', '#ffc23a', '#f2621c', '#7a2a12'] : ['#fff1c8', '#e7b55a', '#a9662a', '#5a3a1c'];
          for (let i = 0; i < 9; i++) { const an = i / 9 * TAU + q.x; E(Math.cos(an) * r * 0.55, Math.sin(an) * r * 0.42, r * 0.42, r * 0.36); c.fillStyle = cols[3]; c.fill(); }
          E(0, 0, r * 0.82, r * 0.62); c.fillStyle = cols[2]; c.fill();
          E(0, 0, r * 0.6, r * 0.45); c.fillStyle = cols[1]; c.fill();
          E(0, 0, r * 0.32, r * 0.24); c.fillStyle = cols[0]; c.fill();
          c.restore(); c.globalAlpha = 1; break;
        }
      }
    }
    return { E, F, lg, rg, RR, T, limb, leaf, cg, plant, plantRaw, setScale, zombieAt, zombie, mower, sun, pea, packet, shovel, award, part, wallnut, sunflower, trophy };
    function A_T(s, x, y, size, fill) { c.font = '900 ' + size + 'px Nunito, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fill; c.fillText(s, x, y); }
  }

  function paintBg(b, L, sod, w) {
    const R = mulberry(11);
    const E = (x, y, rx, ry) => { b.beginPath(); b.ellipse(x, y, rx, ry, 0, 0, TAU); };
    const LG = (x0, y0, x1, y1, cs) => { const g = b.createLinearGradient(x0, y0, x1, y1); cs.forEach((s, i) => g.addColorStop(i / (cs.length - 1), s)); return g; };
    const slab = (x, y, ww, hh, base) => {
      b.fillStyle = base || '#f3ebc8'; b.fillRect(x, y, ww, hh);
      b.fillStyle = 'rgba(255,255,240,.55)'; b.fillRect(x + 1, y + 1, ww - 2, 2); b.fillRect(x + 1, y + 1, 2, hh - 2);
      b.fillStyle = 'rgba(120,100,60,.22)'; b.fillRect(x, y + hh - 3, ww, 3); b.fillRect(x + ww - 3, y, 3, hh);
      b.strokeStyle = '#a99a72'; b.lineWidth = 1.2; b.strokeRect(x + 0.5, y + 0.5, ww - 1, hh - 1);
      for (let i = 0; i < 3; i++) { b.fillStyle = 'rgba(150,130,90,.35)'; E(x + 4 + R() * (ww - 8), y + 4 + R() * (hh - 8), 1.2, 1.2); b.fill(); }
      if (R() < 0.3) { b.strokeStyle = 'rgba(110,95,60,.5)'; b.lineWidth = 1; b.beginPath(); let cx = x + R() * ww, cy = y; b.moveTo(cx, cy); for (let k = 0; k < 4; k++) { cx += (R() - 0.5) * 14; cy += hh / 4; b.lineTo(clamp(cx, x, x + ww), cy); } b.stroke(); }
    };
    b.fillStyle = LG(0, 0, 0, 80, ['#3b82d6', '#78b4ec']); b.fillRect(-220, 0, w, 80);
    for (const [cx, cy, s] of [[90, 14, 1], [330, 8, 0.8], [560, 18, 1.1], [760, 10, 0.9], [1010, 16, 1], [1240, 8, 0.8]]) {
      b.fillStyle = 'rgba(255,255,255,.75)';
      E(cx, cy, 30 * s, 9 * s); b.fill(); E(cx - 16 * s, cy + 2, 16 * s, 7 * s); b.fill(); E(cx + 14 * s, cy - 3, 18 * s, 9 * s); b.fill();
      b.fillStyle = 'rgba(170,200,235,.5)'; E(cx + 4, cy + 5 * s, 26 * s, 4 * s); b.fill();
    }
    for (let x = -10; x < 900; x += 22 + R() * 18) {
      const r = 18 + R() * 16, y = 50 + R() * 12;
      E(x, y, r, r * 0.85); b.fillStyle = R() < 0.5 ? '#6e9b37' : '#7fa843'; b.fill();
      E(x - r * 0.25, y - r * 0.35, r * 0.55, r * 0.4); b.fillStyle = 'rgba(200,225,120,.45)'; b.fill();
    }
    b.fillStyle = '#5f8a2e'; b.fillRect(-10, 66, 900, 14);
    const pick = (x, top, ww, tilt) => {
      b.beginPath(); b.moveTo(x, 82); b.lineTo(x + tilt, top + 8); b.lineTo(x + ww / 2 + tilt, top); b.lineTo(x + ww + tilt, top + 8); b.lineTo(x + ww, 82); b.closePath();
    };
    for (const ry of [28, 54]) {
      b.fillStyle = LG(0, ry, 0, ry + 9, ['#e9e6e3', '#b9b4b3']); b.fillRect(20, ry, 790, 9);
      b.strokeStyle = '#7b7880'; b.lineWidth = 1.2; b.strokeRect(20, ry + 0.5, 790, 9);
    }
    for (let x = 22; x < 800; x += 30) {
      const top = 2 + R() * 12, tilt = (R() - 0.5) * 5, ww = 22;
      b.fillStyle = 'rgba(40,50,60,.2)'; pick(x + 4, top + 4, ww, tilt); b.fill();
      b.fillStyle = LG(x, 0, x + ww, 0, ['#fbfaf8', '#e3e0dc', '#bcb7b6']); pick(x, top, ww, tilt); b.fill();
      b.strokeStyle = '#77737a'; b.lineWidth = 1.5; b.stroke();
      b.strokeStyle = 'rgba(120,115,120,.4)'; b.lineWidth = 1; b.beginPath(); b.moveTo(x + 7, top + 16); b.lineTo(x + 7 + tilt * 0.5, 74); b.moveTo(x + 15, top + 22); b.lineTo(x + 15, 60); b.stroke();
      b.fillStyle = '#8a8890'; E(x + 11, 32, 1.4, 1.4); b.fill(); E(x + 11, 58, 1.4, 1.4); b.fill();
    }
    b.fillStyle = LG(-220, 0, -8, 0, ['#d9c7a0', '#f1e4c4', '#e7d6b0']); b.fillRect(-220, 0, 212, 600);
    for (let i = 0; i < 260; i++) { b.fillStyle = R() < 0.5 ? 'rgba(255,255,245,.35)' : 'rgba(150,120,80,.18)'; E(-220 + R() * 212, R() * 600, 1 + R() * 2, 1 + R() * 1.5); b.fill(); }
    b.save(); b.beginPath(); b.moveTo(-220, 0); b.lineTo(-30, 0); b.lineTo(-60, 46); b.lineTo(-220, 60); b.closePath(); b.clip();
    b.fillStyle = '#b5431c'; b.fillRect(-220, 0, 200, 70);
    for (let ry = -6; ry < 64; ry += 14) for (let rx = -224 + (ry / 14 % 2 ? 9 : 0); rx < -20; rx += 18) {
      b.fillStyle = LG(0, ry, 0, ry + 14, ['#f07a45', '#d4562a', '#a8401a']); b.beginPath(); b.moveTo(rx, ry); b.lineTo(rx + 17, ry); b.lineTo(rx + 16, ry + 13); b.quadraticCurveTo(rx + 8, ry + 16, rx + 1, ry + 13); b.closePath(); b.fill();
      b.strokeStyle = '#6e2a10'; b.lineWidth = 1.2; b.stroke();
    }
    b.restore();
    b.fillStyle = '#f6f1e4'; b.beginPath(); b.moveTo(-220, 60); b.lineTo(-60, 46); b.lineTo(-56, 54); b.lineTo(-220, 70); b.closePath(); b.fill(); b.strokeStyle = OL; b.lineWidth = 1.5; b.stroke();
    b.fillStyle = 'rgba(80,50,20,.18)'; b.beginPath(); b.moveTo(-220, 70); b.lineTo(-56, 54); b.lineTo(-56, 64); b.lineTo(-220, 84); b.closePath(); b.fill();
    const win = (x, y, ww, hh) => {
      b.fillStyle = '#e7b34a'; b.fillRect(x - 7, y - 7, ww + 14, hh + 14); b.strokeStyle = OL; b.lineWidth = 2; b.strokeRect(x - 7, y - 7, ww + 14, hh + 14);
      b.fillStyle = '#f6d27a'; b.fillRect(x - 7, y - 7, ww + 14, 3);
      b.fillStyle = LG(x, y, x + ww, y + hh, ['#b7d8ee', '#5d8db4', '#3c6a92']); b.fillRect(x, y, ww, hh);
      b.fillStyle = 'rgba(255,255,255,.4)'; b.beginPath(); b.moveTo(x + 6, y + hh - 6); b.lineTo(x + ww * 0.45, y + 6); b.lineTo(x + ww * 0.62, y + 6); b.lineTo(x + 16, y + hh - 6); b.fill();
      b.fillStyle = '#e7b34a'; b.fillRect(x + ww / 2 - 3, y, 6, hh); b.fillRect(x, y + hh / 2 - 3, ww, 6);
      b.strokeStyle = 'rgba(60,40,10,.6)'; b.lineWidth = 1; b.strokeRect(x, y, ww, hh);
      b.fillStyle = '#d9cfb8'; b.fillRect(x - 12, y + hh + 7, ww + 24, 8); b.strokeStyle = OL; b.lineWidth = 1.5; b.strokeRect(x - 12, y + hh + 7, ww + 24, 8);
    };
    win(-196, 96, 66, 84); win(-196, 440, 66, 84);
    b.fillStyle = '#cdb88c'; b.beginPath(); b.moveTo(-118, 400); b.lineTo(-118, 210); b.arc(-60, 210, 58, Math.PI, 0); b.lineTo(-2, 400); b.closePath(); b.fill(); b.strokeStyle = OL; b.lineWidth = 2; b.stroke();
    b.fillStyle = '#e8dcbc'; b.beginPath(); b.moveTo(-110, 400); b.lineTo(-110, 210); b.arc(-60, 210, 50, Math.PI, 0); b.lineTo(-10, 400); b.closePath(); b.fill();
    b.fillStyle = '#3a2412'; b.beginPath(); b.moveTo(-104, 204); b.arc(-60, 204, 44, Math.PI, 0); b.closePath(); b.fill();
    b.fillStyle = 'rgba(255,220,140,.5)'; for (let k = 0; k < 4; k++) { b.beginPath(); b.moveTo(-60, 204); b.arc(-60, 204, 38, Math.PI + k * Math.PI / 4 + 0.06, Math.PI + (k + 1) * Math.PI / 4 - 0.06); b.closePath(); b.fill(); }
    b.fillStyle = LG(-104, 0, -16, 0, ['#a7703f', '#8a5a32', '#6b4223']); b.fillRect(-104, 204, 88, 188); b.strokeStyle = OL; b.lineWidth = 2; b.strokeRect(-104, 204, 88, 188);
    for (let px = -104 + 22; px < -16; px += 22) { b.fillStyle = 'rgba(40,20,5,.35)'; b.fillRect(px - 1, 206, 2, 184); }
    b.fillStyle = 'rgba(255,230,190,.16)'; b.fillRect(-104, 204, 10, 188);
    b.fillStyle = '#3d3a36'; for (const hy of [226, 366]) { b.fillRect(-104, hy, 34, 6); E(-74, hy + 3, 4, 4); b.fill(); }
    E(-26, 302, 5, 5); b.fillStyle = '#e4bf4a'; b.fill(); b.strokeStyle = OL; b.lineWidth = 1.5; b.stroke(); E(-27, 301, 1.6, 1.6); b.fillStyle = '#fff3b0'; b.fill();
    b.fillStyle = '#3d3a36'; b.fillRect(-146, 188, 4, 22); b.fillRect(-146, 186, 14, 4);
    b.fillStyle = '#2d2a28'; b.beginPath(); b.moveTo(-150, 208); b.lineTo(-126, 208); b.lineTo(-130, 238); b.lineTo(-146, 238); b.closePath(); b.fill();
    b.fillStyle = 'rgba(255,236,160,.9)'; b.fillRect(-144, 212, 12, 22); b.fillStyle = 'rgba(255,240,170,.22)'; E(-138, 222, 22, 22); b.fill();
    b.fillStyle = '#9b8a6a'; b.fillRect(-124, 392, 128, 12); b.fillStyle = '#b3a37f'; b.fillRect(-124, 392, 128, 3); b.strokeStyle = OL; b.lineWidth = 1.5; b.strokeRect(-124, 392, 128, 12);
    b.fillStyle = '#c9a24e'; b.fillRect(-100, 406, 82, 26); b.strokeStyle = '#6e5222'; b.lineWidth = 2; b.strokeRect(-97, 409, 76, 20);
    b.font = '900 10px Nunito, system-ui, sans-serif'; b.textAlign = 'center'; b.textBaseline = 'middle'; b.fillStyle = '#5b4018'; b.fillText('WELCOME', -59, 420);
    b.fillStyle = 'rgba(0,0,0,.18)'; b.fillRect(-10, 0, 6, 600);
    for (let y = -10; y < 600; y += 46) slab(-8, y + (R() * 6 | 0), 42, 46);
    for (let x = -8; x < 780; x += 52) slab(x, 580, 52, 26);
    for (let r = 0; r < 5; r++) {
      const y = 80 + r * 100, s = sod.includes(r);
      for (let col = 0; col < 9; col++) {
        const x = 40 + col * 80, x0 = col === 0 ? 34 : x, x1 = col === 8 ? 772 : x + 80;
        if (s) {
          b.fillStyle = (r + col) % 2 ? '#2ea92b' : '#3dbb37'; b.fillRect(x0, y, x1 - x0, 100);
          const tg = b.createLinearGradient(0, y, 0, y + 100); tg.addColorStop(0, 'rgba(255,255,210,.1)'); tg.addColorStop(0.5, 'rgba(255,255,210,.02)'); tg.addColorStop(1, 'rgba(10,60,10,.06)');
          b.fillStyle = tg; b.fillRect(x0, y, x1 - x0, 100);
          for (let i = 0; i < 7; i++) { const fx = x0 + 8 + R() * (x1 - x0 - 16), fy = y + 8 + R() * 84; b.fillStyle = R() < 0.5 ? 'rgba(170,240,120,.32)' : 'rgba(10,90,20,.28)'; for (let q = 0; q < 3; q++) { E(fx + Math.cos(q * 2.1) * 3, fy + Math.sin(q * 2.1) * 3, 3, 2.4); b.fill(); } }
          if (R() < 0.22) { const fx = x0 + 10 + R() * (x1 - x0 - 20), fy = y + 14 + R() * 76; b.fillStyle = R() < 0.5 ? '#ff6f7a' : R() < 0.5 ? '#fffbe8' : '#ffd84a'; for (let q = 0; q < 5; q++) { const an = q / 5 * TAU; E(fx + Math.cos(an) * 2.2, fy + Math.sin(an) * 2.2, 1.6, 1.6); b.fill(); } b.fillStyle = '#e6a020'; E(fx, fy, 1.3, 1.3); b.fill(); }
          for (let i = 0; i < 24; i++) {
            const gx = x0 + R() * (x1 - x0), gy = y + 6 + R() * 92;
            b.strokeStyle = R() < 0.5 ? 'rgba(220,255,170,.2)' : 'rgba(10,70,10,.2)'; b.lineWidth = 1.6;
            b.beginPath(); b.moveTo(gx, gy); b.lineTo(gx + R() * 4 - 2, gy - 4 - R() * 5); b.stroke();
          }
        } else {
          b.fillStyle = (col % 2) ? '#ad8158' : '#b78a60'; b.fillRect(x0, y, x1 - x0, 100);
          const dg = b.createLinearGradient(0, y, 0, y + 100); dg.addColorStop(0, 'rgba(255,230,170,.08)'); dg.addColorStop(1, 'rgba(60,30,0,.12)'); b.fillStyle = dg; b.fillRect(x0, y, x1 - x0, 100);
          for (let i = 0; i < 9; i++) { E(x0 + R() * (x1 - x0), y + 8 + R() * 86, 2.5 + R() * 4, 2 + R() * 2.5); b.fillStyle = R() < 0.5 ? '#8c6440' : '#d3ae82'; b.fill(); }
        }
      }
      if (!s) { b.fillStyle = 'rgba(80,50,20,.25)'; b.fillRect(34, y + 98, 738, 3); }
      else for (const ex of [34, 772]) for (let ty = y + 4; ty < y + 100; ty += 9) { b.fillStyle = R() < 0.5 ? '#2ea92b' : '#249a24'; b.beginPath(); b.moveTo(ex, ty - 5); b.lineTo(ex + (ex < 100 ? -6 : 6) - R() * 3, ty); b.lineTo(ex, ty + 5); b.fill(); }
    }
    for (let x = 34; x < 772; x += 8) {
      if (sod.includes(0)) { b.fillStyle = R() < 0.5 ? '#2ea92b' : '#3dbb37'; b.beginPath(); b.moveTo(x, 84); b.lineTo(x + 4, 74 + R() * 4); b.lineTo(x + 8, 84); b.fill(); }
      if (sod.includes(4)) { b.fillStyle = R() < 0.5 ? '#2ea92b' : '#249a24'; b.beginPath(); b.moveTo(x, 578); b.lineTo(x + 4, 586 + R() * 4); b.lineTo(x + 8, 578); b.fill(); }
    }
    const sg = b.createLinearGradient(0, 80, 0, 116); sg.addColorStop(0, 'rgba(10,40,10,.28)'); sg.addColorStop(1, 'rgba(10,40,10,0)'); b.fillStyle = sg; b.fillRect(34, 80, 738, 36);
    if (L.bowl) { b.fillStyle = '#d8322b'; b.fillRect(277, 80, 6, 500); b.fillStyle = 'rgba(255,255,255,.3)'; b.fillRect(278, 80, 2, 500); }
    for (let y = -20; y < 600; y += 58) { slab(772, y, 48, 58); slab(820, y + 29, 48, 58); }
    b.fillStyle = LG(866, 0, 884, 0, ['#e9dfba', '#b8ab84', '#6f6a5c']); b.fillRect(866, 0, 18, 600);
    for (let y = 0; y < 600; y += 58) { b.fillStyle = 'rgba(80,70,50,.45)'; b.fillRect(866, y, 18, 1.5); }
    b.fillStyle = LG(884, 0, 1340, 0, ['#4f5b70', '#5f6c83', '#56627a']); b.fillRect(884, 0, w - 884 - 220, 600);
    for (let i = 0; i < 900; i++) { b.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,20,.12)'; E(884 + R() * 516, R() * 600, 1 + R() * 2, 1 + R() * 1.4); b.fill(); }
    b.fillStyle = 'rgba(0,0,0,.22)'; b.fillRect(884, 0, 8, 600);
    for (let y = 6; y < 600; y += 74) { b.fillStyle = '#e8ecf2'; b.beginPath(); b.moveTo(1100, y); b.lineTo(1114, y); b.lineTo(1116, y + 42); b.lineTo(1102, y + 42); b.closePath(); b.fill(); b.fillStyle = 'rgba(120,130,150,.35)'; b.fillRect(1103, y + 6, 4, 30); }
    E(948, 36, 26, 11); b.fillStyle = '#7d8696'; b.fill(); b.strokeStyle = '#3a404c'; b.lineWidth = 2; b.stroke(); E(948, 36, 18, 7); b.strokeStyle = 'rgba(40,45,55,.5)'; b.lineWidth = 1.5; b.stroke();
    const grate = (x, y) => { b.fillStyle = '#4a4e57'; b.fillRect(x, y, 26, 56); b.strokeStyle = '#25272c'; b.lineWidth = 2; b.strokeRect(x, y, 26, 56); b.fillStyle = '#1b1c20'; for (let k = 0; k < 6; k++) b.fillRect(x + 4, y + 5 + k * 8.4, 18, 4); };
    grate(894, 300); grate(1300, 150);
    b.strokeStyle = '#262a33'; b.lineWidth = 1.6; b.beginPath();
    for (let k = 0; k < 7; k++) { const an = k / 7 * TAU, x0 = 1230, y0 = 420; b.moveTo(x0, y0); let cx = x0, cy = y0; for (let q = 0; q < 4; q++) { cx += Math.cos(an + (R() - 0.5)) * 14; cy += Math.sin(an + (R() - 0.5)) * 10; b.lineTo(cx, cy); } }
    b.stroke();
    b.fillStyle = LG(1330, 0, 1346, 0, ['#6f6a5c', '#b8ab84', '#e9dfba']); b.fillRect(1330, 0, 16, 600);
    b.fillStyle = '#5e9a36'; b.fillRect(1346, 0, 60, 600);
    for (let y = 0; y < 600; y += 14) { b.fillStyle = R() < 0.5 ? '#4f8a2c' : '#73b046'; E(1352 + R() * 40, y, 10, 8); b.fill(); }
    for (let y = 20; y < 600; y += 90) { b.fillStyle = '#9aa1ab'; b.fillRect(1358, y, 5, 40); }
    b.fillStyle = '#c3c8cf'; b.fillRect(1356, 0, 4, 600);
    for (const [tx, ty, r] of [[1390, 30, 60], [1340, 6, 44], [1395, 90, 40]]) { E(tx, ty, r, r * 0.8); b.fillStyle = '#5f8a2e'; b.fill(); E(tx - r * 0.3, ty - r * 0.3, r * 0.5, r * 0.35); b.fillStyle = 'rgba(190,220,110,.5)'; b.fill(); }
    if (L.dusk) {
      const dg2 = b.createLinearGradient(0, 0, 0, 600); dg2.addColorStop(0, 'rgba(255,120,60,.22)'); dg2.addColorStop(1, 'rgba(90,40,120,.18)');
      b.fillStyle = dg2; b.fillRect(-220, 0, w, 600);
    }
  }

  function makeAudio(api) {
    let ac = null, out = null, mus = null, nb = null, next = 0, step = 0, loopN = 0;
    const last = Object.create(null);
    const init = () => {
      if (ac) return true;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ac = new AC();
        out = ac.createGain(); out.gain.value = 0.5; out.connect(ac.destination);
        mus = ac.createGain(); mus.gain.value = 0.17; mus.connect(out);
        nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = nb.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return true;
      } catch (e) { ac = null; return false; }
    };
    const osc = (f, d, type, v, f2, at, dest) => {
      const t = ac.currentTime + (at || 0), o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(dest || out); o.start(t); o.stop(t + d + 0.03);
    };
    const noise = (d, v, type, f, f2, at, q, dest) => {
      const t = ac.currentTime + (at || 0), s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; s.loop = true;
      fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); fl.Q.value = q || 1;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(fl); fl.connect(g); g.connect(dest || out); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.03);
    };
    const S = {
      shoot: () => { noise(0.06, 0.22, 'bandpass', 1500, 700, 0, 2); osc(380, 0.07, 'sine', 0.16, 140); },
      shootsnow: () => { noise(0.06, 0.2, 'bandpass', 2200, 900, 0, 2); osc(520, 0.08, 'sine', 0.13, 200); },
      splat: () => { noise(0.1, 0.32, 'lowpass', 1800, 300); osc(170, 0.07, 'sine', 0.13, 70); },
      paperhit: () => { noise(0.08, 0.28, 'highpass', 2500, 0, 0, 1); },
      plastic: () => { osc(720, 0.07, 'square', 0.06, 360); noise(0.06, 0.18, 'bandpass', 2600, 0, 0, 3); },
      metal: () => { osc(1480, 0.24, 'triangle', 0.09); osc(2260, 0.2, 'sine', 0.05); noise(0.05, 0.18, 'highpass', 3200); },
      chomp: () => { noise(0.07, 0.3, 'bandpass', 760, 320, 0, 1.6); noise(0.07, 0.28, 'bandpass', 640, 280, 0.09, 1.6); },
      gulp: () => { osc(320, 0.2, 'sine', 0.16, 90); },
      plant: () => { osc(170, 0.15, 'sine', 0.28, 60); noise(0.13, 0.24, 'lowpass', 900, 200); },
      sun: () => { osc(988, 0.12, 'sine', 0.11); osc(1480, 0.2, 'sine', 0.09, 0, 0.06); },
      spawnsun: () => { osc(640, 0.16, 'sine', 0.05, 980); },
      seed: () => { osc(880, 0.05, 'square', 0.035, 620); },
      buzz: () => { osc(150, 0.2, 'square', 0.06); osc(157, 0.2, 'square', 0.06); },
      fuse: () => { noise(0.9, 0.12, 'bandpass', 3000, 6000, 0, 4); },
      boom: () => { noise(1.1, 0.8, 'lowpass', 1600, 50); osc(95, 0.8, 'sine', 0.5, 28); },
      spud: () => { noise(0.8, 0.7, 'lowpass', 2200, 70); osc(130, 0.6, 'sine', 0.45, 30); },
      rise: () => { noise(0.25, 0.25, 'lowpass', 500, 1400); },
      awooga: () => { for (const a of [0, 0.62]) { osc(180, 0.5, 'sawtooth', 0.11, 300, a); osc(182, 0.5, 'square', 0.05, 305, a); } },
      siren: () => { const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(420, t); for (let i = 0; i < 3; i++) { o.frequency.linearRampToValueAtTime(860, t + i * 0.9 + 0.45); o.frequency.linearRampToValueAtTime(420, t + i * 0.9 + 0.9); } g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.1); g.gain.setValueAtTime(0.06, t + 2.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8); o.connect(g); g.connect(out); o.start(t); o.stop(t + 2.9); },
      hugewave: () => { for (const [f, a] of [[147, 0], [175, 0.25], [220, 0.5]]) osc(f, 0.6, 'sawtooth', 0.08, 0, a); noise(0.4, 0.3, 'lowpass', 400, 60); },
      final: () => { osc(98, 1.2, 'sawtooth', 0.12, 73); osc(147, 1.2, 'sawtooth', 0.07, 110); noise(0.6, 0.4, 'lowpass', 500, 60); },
      mower: () => { const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 85; l.frequency.value = 28; lg.gain.value = 0.04; l.connect(lg); lg.connect(g.gain); g.gain.setValueAtTime(0.07, t); g.gain.linearRampToValueAtTime(0.0001, t + 2.4); o.connect(g); g.connect(out); o.start(t); l.start(t); o.stop(t + 2.5); l.stop(t + 2.5); },
      groan: () => { const t = ac.currentTime, o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; const f0 = 95 + Math.random() * 40; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * 1.25, t + 0.35); o.frequency.linearRampToValueAtTime(f0 * 0.8, t + 0.9); f.type = 'bandpass'; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(800, t + 0.4); f.frequency.linearRampToValueAtTime(400, t + 0.9); f.Q.value = 3; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 1); },
      dig: () => { noise(0.18, 0.3, 'lowpass', 1200, 300); osc(220, 0.1, 'triangle', 0.08, 120); },
      bigchomp: () => { noise(0.2, 0.5, 'lowpass', 1000, 150); osc(120, 0.16, 'square', 0.1, 50); },
      rarrgh: () => { osc(150, 0.6, 'sawtooth', 0.12, 110); noise(0.5, 0.2, 'bandpass', 700, 400, 0, 2); },
      paper: () => { noise(0.3, 0.3, 'highpass', 1800, 4000, 0, 1); },
      freeze: () => { osc(2400, 0.14, 'sine', 0.05, 3400); },
      bowl: () => { osc(110, 0.2, 'sine', 0.3, 50); noise(0.15, 0.3, 'lowpass', 700, 120); },
      vault: () => { noise(0.25, 0.18, 'bandpass', 900, 2000, 0, 2); },
      award: () => { [523, 659, 784, 1046].forEach((f, i) => osc(f, 0.3, 'sine', 0.1, 0, i * 0.08)); },
      tap: () => { osc(600, 0.05, 'sine', 0.06); },
      squash: () => { noise(0.35, 0.7, 'lowpass', 900, 60); osc(80, 0.3, 'sine', 0.5, 35); },
      hmm: () => { osc(210, 0.25, 'triangle', 0.08, 170); },
      fireboom: () => { noise(1.2, 0.7, 'bandpass', 900, 200, 0, 0.7); noise(0.9, 0.4, 'lowpass', 2400, 80); osc(70, 0.9, 'sine', 0.45, 30); },
      spike: () => { noise(0.05, 0.2, 'highpass', 3600, 0, 0, 2); },
      smash: () => { noise(0.4, 0.8, 'lowpass', 700, 40); osc(60, 0.4, 'sine', 0.6, 25); },
      firehit: () => { noise(0.12, 0.3, 'bandpass', 1200, 400, 0, 1); osc(220, 0.08, 'sine', 0.12, 90); },
      ready: () => { osc(523, 0.25, 'square', 0.05); },
      set: () => { osc(659, 0.25, 'square', 0.05); },
      go: () => { osc(784, 0.5, 'square', 0.06); osc(1046, 0.5, 'sine', 0.06); },
      win: () => { [523, 659, 784, 659, 784, 1046].forEach((f, i) => { osc(f, 0.32, 'triangle', 0.1, 0, i * 0.13); osc(f / 2, 0.32, 'sine', 0.06, 0, i * 0.13); }); },
      lose: () => { noise(0.9, 0.18, 'bandpass', 1400, 3000, 0.1, 3); osc(620, 0.9, 'sawtooth', 0.05, 900, 0.1); },
      brains: () => { [392, 370, 349, 330, 220].forEach((f, i) => osc(f, i === 4 ? 1.2 : 0.4, 'triangle', 0.1, 0, i * 0.38)); }
    };
    const BASS = [[38, 45, 50, 45], [34, 41, 46, 41], [31, 38, 43, 38], [33, 40, 45, 49]];
    const MEL = [
      [74, 0, 77, 76, 74, 0, 69, 0, 70, 0, 74, 72, 70, 0, 65, 0, 67, 0, 70, 69, 67, 70, 74, 0, 76, 0, 73, 0, 69, 0, 0, 0],
      [74, 0, 77, 76, 74, 0, 69, 0, 70, 0, 74, 72, 70, 0, 65, 0, 67, 0, 70, 69, 67, 70, 74, 77, 76, 73, 76, 79, 76, 0, 73, 0]
    ];
    const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    const mnote = (f, t, d, v, type) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(mus); o.start(t); o.stop(t + d + 0.02); };
    return {
      unlock() { if (init() && ac.state === 'suspended') ac.resume().catch(() => {}); },
      play(name) {
        if (api.muted || !ac || ac.state !== 'running' || !S[name]) return;
        const now = ac.currentTime;
        if (last[name] && now - last[name] < (name === 'groan' ? 0.6 : name === 'chomp' ? 0.12 : 0.045)) return;
        last[name] = now;
        try { S[name](); } catch (e) {}
      },
      music(on, hot) {
        if (!ac || ac.state !== 'running') return;
        if (api.muted || !on) { if (mus.gain.value > 0.001) { mus.gain.cancelScheduledValues(ac.currentTime); mus.gain.setValueAtTime(0.0001, ac.currentTime); } next = 0; return; }
        if (mus.gain.value < 0.1) { mus.gain.cancelScheduledValues(ac.currentTime); mus.gain.setValueAtTime(0.17, ac.currentTime); }
        const dur = 60 / 104 / 2;
        if (next < ac.currentTime) { next = ac.currentTime + 0.05; step = 0; }
        while (next < ac.currentTime + 0.25) {
          const bar = step >> 3 & 3, i = step & 31;
          if (step % 2 === 0) mnote(mf(BASS[bar][(step >> 1) & 3]), next, dur * 1.7, 0.5, 'triangle');
          const m = MEL[loopN & 1][i];
          if (m) { mnote(mf(m), next, 0.32, 0.3, 'sine'); mnote(mf(m) * 4, next, 0.05, 0.06, 'sine'); }
          if (step % 2 === 1) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(0.12, next); g.gain.exponentialRampToValueAtTime(0.0001, next + 0.04); s.connect(f); f.connect(g); g.connect(mus); s.start(next, Math.random() * 0.5); s.stop(next + 0.05); }
          if (hot && step % 2 === 0) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, next); o.frequency.exponentialRampToValueAtTime(45, next + 0.15); g.gain.setValueAtTime(0.6, next); g.gain.exponentialRampToValueAtTime(0.0001, next + 0.18); o.connect(g); g.connect(mus); o.start(next); o.stop(next + 0.2); }
          next += dur; step++;
          if ((step & 31) === 0) loopN++;
        }
      },
      close() { try { if (ac) ac.close(); } catch (e) {} ac = null; }
    };
  }

  Ameplay.register({
    id: 'garden-defense',
    title: 'Garden Defense',
    category: 'Action',
    tint: '#5fb336',
    blurb: 'Defend your house from the zombie horde across 15 levels with 15 plants and 10 kinds of zombies.',
    help: '<kbd>Click</kbd> a seed packet, then a lawn tile · click sun to collect · <kbd>1</kbd>–<kbd>8</kbd> seeds · <kbd>S</kbd> shovel · <kbd>F</kbd> game speed · <kbd>P</kbd> pause · tap on touch',
    format: v => v <= 10 ? 'Level 1-' + v : 'Level 2-' + (v - 10),
    width: 940,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="22" r="11"/><path d="M33 17h13v9H33"/><path d="M46 15v13"/><circle cx="27" cy="19" r="1.6" fill="currentColor"/><path d="M24 33v23"/><path d="M24 50c-5-6-13-5-15-1 5 4 11 4 15 1zM24 50c5-6 13-5 15-1-5 4-11 4-15 1z"/></svg>',
    sim: { makeGame, LV, PL, ZD, CFG, ORDER },
    mount(root, api) {
      const coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
      const PORT = coarse && window.innerHeight > window.innerWidth;
      const W = PORT ? 800 : 920, H = PORT ? 760 : 600, BGW = 1620, CX = W / 2, CAM0 = PORT ? -30 : -120, PANX = 1400 - W, UX = (W - 800) / 2;
      const cv = api.canvas(W, H);
      const c = cv.ctx, canvas = cv.canvas;
      canvas.style.touchAction = 'none';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const A = makeArt(c);
      const snd = makeAudio(api);
      const play = n => snd.play(n);
      const loaded = api.load();
      const sv = { lv: 1, pick: null, speed: 1 };
      if (loaded && typeof loaded === 'object') { if (loaded.lv >= 1 && loaded.lv <= NLV + 1) sv.lv = loaded.lv | 0; if (Array.isArray(loaded.pick)) sv.pick = loaded.pick.filter(t => ORDER.includes(t)); if ([1, 1.5, 2].includes(loaded.speed)) sv.speed = loaded.speed; }
      let nSlots = 6;
      const LAY = PORT ? {
        bank: { x: 0, y: 600, w: 800, h: 160 },
        sun: { x: 8, y: 608, w: 92, h: 144 }, sunDest: { x: 54, y: 652 },
        card: i => { const cw = Math.min(84, 504 / nSlots); return { x: 104 + i * cw, y: 608, w: cw - 4, h: 144 }; },
        shovel: { x: 612, y: 608, w: 86, h: 144 }, menu: { x: 702, y: 608, w: 90, h: 144 }, speed: { x: 700, y: 8, w: 92, h: 40 },
        belt: { x: 8, y: 608, w: 596, h: 144 }, slot: 72
      } : {
        bank: { x: 4, y: -8, w: 430, h: 94 },
        sun: { x: 12, y: 4, w: 68, h: 80 }, sunDest: { x: 46, y: 32 },
        card: i => ({ x: 86 + i * 56, y: 8, w: 50, h: 70 }),
        get shovel() { return { x: 100 + nSlots * 56, y: -8, w: 72, h: 86 }; }, menu: { x: W - 116, y: 4, w: 108, h: 38 }, speed: { x: W - 116, y: 48, w: 108, h: 34 },
        belt: { x: 8, y: -8, w: 430, h: 94 }, slot: 52
      };
      let scr = 'title', G = null, li = 0, camX = CAM0, ph = '', phT = 0, held = null, drag = null, paused = false;
      let acc = 0, time = 0, lostT = 0, awardT = 0, wonInfo = null, preview = [], choose = null, rollK = 1, touchMode = coarse;
      let btns = [], submitted = false, lastScore = null, screamed = false;
      const mouse = { x: -999, y: -999 };
      const bgs = {};
      const bgFor = (L, sod) => {
        const key = LV.indexOf(L) + ':' + sod.join('');
        if (bgs[key]) return bgs[key];
        const cnv = document.createElement('canvas');
        cnv.width = Math.round(BGW * dpr); cnv.height = Math.round(600 * dpr);
        const b = cnv.getContext('2d');
        b.setTransform(dpr, 0, 0, dpr, 220 * dpr, 0);
        paintBg(b, L, sod, BGW);
        bgs[key] = cnv;
        return cnv;
      };
      const drawBg = (cnv, cx) => { c.drawImage(cnv, (cx + 220) * dpr, 0, W * dpr, 600 * dpr, 0, 0, W, 600); };
      const L = () => LV[li];
      const preSod = Lv => Lv.rows.filter(r => !(Lv.roll || []).includes(r));
      const score = v => { if (v !== lastScore) { lastScore = v; api.score(v); } };
      const seedsFor = i => LV[i].seeds;
      const slotsFor = i => LV[i].slots || CFG.slots;
      const needChoose = i => seedsFor(i).length > slotsFor(i);

      function startLevel(i) {
        li = clamp(i, 0, NLV - 1); nSlots = slotsFor(li);
        G = makeGame(li, { sfx: play });
        G.sunDest = { x: LAY.sunDest.x + CAM0, y: LAY.sunDest.y };
        for (const m of G.mowers) m.x = -160;
        held = null; drag = null; paused = false; acc = 0; lostT = 0; awardT = 0; wonInfo = null; submitted = false; screamed = false;
        camX = CAM0; ph = 'pan'; phT = 0; rollK = L().roll ? 0 : 1;
        if (needChoose(li)) {
          const avail = seedsFor(li);
          const pick = (sv.pick || []).filter(t => avail.includes(t)).slice(0, nSlots);
          for (const t of avail) if (pick.length < nSlots && !pick.includes(t)) pick.push(t);
          choose = { sel: pick };
          G.setSeeds(pick);
        } else choose = null;
        const kinds = [];
        for (const w of G.waves) for (const t of w) if (t !== 'flag' && !kinds.includes(t)) kinds.push(t);
        preview = [];
        const R = mulberry(li * 31 + 5);
        const cnt = Math.min(10, 3 + kinds.length * 2);
        for (let k = 0; k < cnt; k++) {
          const t = kinds[k % kinds.length];
          preview.push({ type: t, x: 930 + R() * 360, by: 150 + R() * 430, ph: R() * TAU, st: 'walk', id: k, head: true, arm: true, helm: ZD[t].helm || 0, helmMax: ZD[t].helm || 1, helmType: ZD[t].helmType || null, paper: ZD[t].paper || 0, door: ZD[t].door || 0, doorMax: ZD[t].door || 1, big: t === 'garg', thrown: false, pole: t === 'pole', mad: false, chill: 0, flash: 0, alt: 0, eatT: 0, t: 0 });
        }
        preview.sort((a, b) => a.by - b.by);
        score(li + 1);
        scr = 'intro';
      }
      function endIntro() { ph = 'ready'; phT = 0; play('ready'); }
      function toPlay() { scr = 'play'; ph = ''; }
      function toTitle() { scr = 'title'; G = null; held = null; paused = false; camX = CAM0; }
      function toLost() {
        scr = 'lost'; lostT = 0; held = null;
        if (!submitted) { submitted = true; api.submit(li); }
      }
      function toWon() {
        scr = 'won';
        const a = L().award;
        wonInfo = { type: a, t: 0 };
        sv.lv = Math.max(sv.lv, li + 2);
        api.save(sv);
        if (!submitted) { submitted = true; api.submit(li + 1); }
        play('win');
      }
      function pause(on) { if (scr !== 'play') return; paused = on; held = on ? null : held; if (on) play('tap'); }

      function cellAt(x, y) {
        const col = Math.floor((x + camX - CFG.lawnX) / CFG.cellW), row = Math.floor((y - CFG.lawnY) / CFG.cellH);
        if (y > 600 || col < 0 || col > 8 || row < 0 || row > 4) return null;
        return { col, row };
      }
      function selectCard(i) {
        if (!G || scr !== 'play' || paused) return false;
        const Lv = L();
        if (Lv.bowl || Lv.belt) {
          const b = G.belt[i];
          if (!b || b.pos > CFG.beltMax - 1) return false;
          if (held && held.src === 'belt' && held.id === b.id) { held = null; return true; }
          held = { src: 'belt', id: b.id, type: b.type }; play('seed'); return true;
        }
        const cd = G.cards[i];
        if (!cd) return false;
        if (held && held.src === 'card' && held.i === i) { held = null; return true; }
        if (cd.cd > 0) { play('buzz'); return false; }
        if (G.sun < PL[cd.type].cost) { play('buzz'); G.sunFlash = 40; return false; }
        held = { src: 'card', i, type: cd.type }; play('seed'); return true;
      }
      function useHeld(col, row) {
        if (!held) return false;
        if (held.src === 'shovel') { if (G.dig(col, row)) { held = null; return true; } return false; }
        if (held.src === 'card') { if (G.plantCard(held.i, col, row)) { held = null; return true; } return false; }
        const i = G.belt.findIndex(b => b.id === held.id);
        if (i >= 0 && G.plantBelt(i, col, row)) { held = null; return true; }
        return false;
      }
      const inR = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      function down(x, y) {
        for (let i = btns.length - 1; i >= 0; i--) { const b = btns[i]; if (inR(b, x, y)) { b.fn(); return true; } }
        if (scr === 'title') return false;
        if (scr === 'intro') { if (ph === 'pan' || ph === 'hold') { ph = 'back'; phT = 0; } else if (ph === 'ready') { phT = Math.max(phT, 1.2); } return true; }
        if (scr !== 'play' || paused) return false;
        const aw = G.award;
        if (aw && aw.st !== 'col' && Math.hypot(x + camX - aw.x, y - aw.y) < (touchMode ? 70 : 50)) { G.collectAward(); awardT = 0; held = null; return true; }
        const rad = touchMode ? 58 : 44;
        for (let i = G.suns.length - 1; i >= 0; i--) {
          const s = G.suns[i];
          if (s.st !== 'col' && Math.hypot(x + camX - s.x, y - s.y) < rad * s.sc) { G.collect(s); return true; }
        }
        const cell = cellAt(x, y);
        if (held) {
          if (cell && useHeld(cell.col, cell.row)) return true;
          if (!cell) held = null;
          return true;
        }
        return false;
      }

      api.on(canvas, 'pointerdown', e => {
        e.preventDefault();
        snd.unlock();
        if (e.pointerType === 'touch' || e.pointerType === 'pen') touchMode = true; else if (e.pointerType === 'mouse') touchMode = false;
        const p = cv.toLocal(e);
        mouse.x = p.x; mouse.y = p.y;
        if (e.button === 2) { held = null; return; }
        const before = held;
        drag = null;
        down(p.x, p.y);
        if (held && held !== before) drag = { x: p.x, y: p.y, moved: false, id: e.pointerId };
      });
      api.on(canvas, 'pointermove', e => {
        const p = cv.toLocal(e);
        mouse.x = p.x; mouse.y = p.y;
        if (drag && Math.hypot(p.x - drag.x, p.y - drag.y) > 14) drag.moved = true;
      });
      const up = e => {
        if (!drag || drag.id !== e.pointerId) return;
        const d = drag; drag = null;
        if (!d.moved || !held || scr !== 'play' || paused) return;
        const p = cv.toLocal(e);
        const cell = cellAt(p.x, p.y);
        if (cell) useHeld(cell.col, cell.row);
      };
      api.on(canvas, 'pointerup', up);
      api.on(canvas, 'pointercancel', () => { drag = null; });
      api.on(canvas, 'pointerleave', () => { if (!touchMode) { mouse.x = -999; mouse.y = -999; } });
      api.on(canvas, 'contextmenu', e => { e.preventDefault(); held = null; });
      api.on(window, 'keydown', e => {
        snd.unlock();
        const k = e.code;
        if (scr === 'title') { if (k === 'Enter' || k === 'Space') startLevel(Math.min(sv.lv, NLV) - 1); return; }
        if (scr === 'intro') {
          if (k === 'Enter' || k === 'Space') { if (ph === 'choose') { if (choose && choose.sel.length === nSlots) letsGo(); } else if (ph === 'pan' || ph === 'hold') { ph = 'back'; phT = 0; } }
          return;
        }
        if (scr === 'lost') { if (lostT > 3 && (k === 'Enter' || k === 'Space')) startLevel(li); return; }
        if (scr === 'won') { if (wonInfo && wonInfo.t > 1 && (k === 'Enter' || k === 'Space')) { if (li < NLV - 1) startLevel(li + 1); else toTitle(); } return; }
        if (scr !== 'play') return;
        if (k === 'KeyP' || k === 'Space') { pause(!paused); return; }
        if (paused) { if (k === 'Enter') pause(false); return; }
        if (k.startsWith('Digit')) { const d = +k.slice(5); if (d >= 1 && d <= 8) selectCard(d - 1); return; }
        if (k === 'KeyF') { cycleSpeed(); return; }
        if (k === 'KeyS' && hasShovel()) { held = held && held.src === 'shovel' ? null : { src: 'shovel' }; play('seed'); }
      });
      api.on(window, 'blur', () => { if (scr === 'play' && !paused) pause(true); });
      const hasShovel = () => li >= 4 && !L().bowl;
      function letsGo() {
        if (!choose || choose.sel.length !== nSlots) return;
        G.setSeeds(choose.sel.slice());
        sv.pick = choose.sel.slice(); api.save(sv);
        ph = 'back'; phT = 0; play('go');
      }

      function cycleSpeed() { sv.speed = sv.speed === 1 ? 1.5 : sv.speed === 1.5 ? 2 : 1; api.save(sv); play('tap'); }
      function update(dt) {
        time += dt;
        if (scr === 'intro') {
          phT += dt;
          if (ph === 'pan') { camX = CAM0 + (PANX - CAM0) * ease(phT / 1.2); if (phT >= 1.2) { ph = choose ? 'choose' : 'hold'; phT = 0; } }
          else if (ph === 'hold') { if (phT > 1.6) { ph = 'back'; phT = 0; } }
          else if (ph === 'back') { camX = CAM0 + (PANX - CAM0) * (1 - ease(phT / 1.1)); if (phT >= 1.1) { camX = CAM0; ph = L().roll ? 'roll' : 'mow'; phT = 0; } }
          else if (ph === 'roll') { rollK = ease(phT / 1.7); if (phT >= 1.7) { rollK = 1; ph = 'mow'; phT = 0; } }
          else if (ph === 'mow') { for (const m of G.mowers) m.x = -160 + (CFG.mowerX + 160) * ease(phT / 0.8); if (phT >= 0.8) { for (const m of G.mowers) m.x = CFG.mowerX; endIntro(); } }
          else if (ph === 'ready') {
            if (phT >= 0.6 && phT - dt < 0.6) play('set');
            if (phT >= 1.2 && phT - dt < 1.2) play('go');
            if (phT >= 1.9) toPlay();
          }
        } else if (scr === 'play' && !paused) {
          acc += dt * CFG.hz * sv.speed;
          let k = 0;
          while (acc >= 1 && k < 14) { G.tick(); acc -= 1; k++; if (G.state === 'lost') break; }
          if (acc > 14) acc = 0;
          if (G.sunFlash > 0) G.sunFlash -= 1;
          if (G.state === 'lost') toLost();
          else if (G.award && G.award.st === 'col') { awardT += dt; if (awardT > 3.3) toWon(); }
        } else if (scr === 'lost') {
          lostT += dt;
          camX = CAM0 - (PORT ? 200 : 100) * ease(lostT / 1.8);
          acc += dt * CFG.hz;
          let k = 0;
          while (acc >= 1 && k < 6) { G.tick(); acc -= 1; k++; }
          if (G.lostDone && !screamed) { screamed = true; G.lostAt = lostT; play('brains'); }
        } else if (scr === 'won' && wonInfo) wonInfo.t += dt;
        const hot = G && scr === 'play' && (G.hugeCd > 0 || (G.msg && G.msg.k === 'final' && G.msg.t < 400));
        snd.music((scr === 'play' && !paused) || scr === 'intro', hot);
      }

      const bankG = () => A.cg('bank', () => A.lg(0, -8, 0, 86, ['#95501f', '#61300f']));
      const btn = (x, y, w, h, label, fn, o) => {
        o = o || {};
        const dis = o.dis, r = Math.min(18, h * 0.28);
        c.save(); c.translate(x, y);
        A.RR(0, 4, w, h, r); c.fillStyle = 'rgba(0,0,0,.28)'; c.fill();
        A.RR(0, 0, w, h, r);
        A.F(dis ? '#8c8c84' : o.col === 'red' ? A.cg('btnr' + h, () => A.lg(0, 0, 0, h, ['#ff8a6a', '#d5371f'])) : o.col === 'menu' ? A.cg('btnm' + h, () => A.lg(0, 0, 0, h, ['#5d7182', '#2a3540'])) : o.col === 'stone' ? A.cg('btns' + h, () => A.lg(0, 0, 0, h, ['#aab1bc', '#6f7783'])) : A.cg('btng' + h, () => A.lg(0, 0, 0, h, ['#8fe04a', '#3f8f1e'])), 2.6);
        if (!dis) { A.RR(4, 3, w - 8, h * 0.4, r * 0.7); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill(); }
        A.T(label, w / 2, h / 2 + 1, o.size || Math.min(26, h * 0.5), dis ? '#d8d8d0' : o.col === 'menu' ? '#5cff3c' : '#fff', OL);
        c.restore();
        if (!dis) btns.push({ x, y: y - 4, w, h: h + 8, fn });
      };
      const panel = (x, y, w, h) => {
        c.save(); c.translate(x, y);
        A.RR(0, 8, w, h, 22); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill();
        A.RR(0, 0, w, h, 22); A.F(A.cg('pan' + h, () => A.lg(0, 0, 0, h, ['#8a6640', '#5e4227'])), 3);
        A.RR(10, 10, w - 20, h - 20, 16); c.strokeStyle = 'rgba(255,230,180,.35)'; c.lineWidth = 2; c.stroke();
        c.restore();
      };

      function drawScene() {
        const Lv = L();
        c.save();
        c.beginPath(); c.rect(0, 0, W, 600); c.clip();
        let sx = 0, sy = 0;
        if (G.shake > 0 && scr === 'play') { const m = Math.min(6, G.shake * 0.3); sx = (Math.random() - 0.5) * m; sy = (Math.random() - 0.5) * m; c.translate(sx, sy); }
        const done = scr !== 'intro' || (ph !== 'pan' && ph !== 'hold' && ph !== 'choose' && ph !== 'back' && ph !== 'roll') ;
        const sodNow = done || rollK >= 1 ? Lv.rows : preSod(Lv);
        drawBg(bgFor(Lv, sodNow), camX);
        c.translate(-camX, 0);
        if (scr === 'intro' && ph === 'roll' && Lv.roll) {
          const full = bgFor(Lv, Lv.rows), xr = 34 + 738 * rollK;
          for (const r of Lv.roll) {
            const y = 80 + r * 100;
            c.drawImage(full, (34 + 220) * dpr, y * dpr, (xr - 34) * dpr, 100 * dpr, 34, y, xr - 34, 100);
            c.save(); c.translate(xr, y + 50);
            A.E(0, 0, 14 + (1 - rollK) * 10, 50); A.F(A.cg('roll', () => A.lg(-20, 0, 20, 0, ['#4a8f2a', '#7bcf4a', '#3a7a20'])), 2.4);
            A.E(0, 0, 8, 40); c.strokeStyle = 'rgba(90,60,20,.6)'; c.lineWidth = 3; c.stroke();
            c.restore();
          }
        }
        if (scr === 'lost') {
          c.fillStyle = '#140c06'; c.fillRect(-104, 204, 88, 188);
          c.save(); c.translate(-104, 204); c.transform(0.35, -0.12, 0, 1, 0, 0);
          c.fillStyle = '#8a5a32'; c.fillRect(0, 0, 88, 188); c.strokeStyle = OL; c.lineWidth = 2; c.strokeRect(0, 0, 88, 188);
          c.restore();
        }
        const tm = time;
        for (let r = 0; r < 5; r++) {
          for (const m of G.mowers) if (m.row === r && m.st !== 'gone') A.mower(m.x + 16, G.foot(r), m.st === 'run', G.t);
          const row = G.grid[r];
          const jumps = [];
          for (let col = 0; col < 9; col++) {
            const p = row[col];
            if (!p) continue;
            if (p.type === 'squash' && p.st === 'jump') { jumps.push(p); continue; }
            c.save(); c.translate(p.px + 40, p.by);
            A.E(0, -2, 26, 7); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill();
            const hov = held && held.src === 'shovel' && !touchMode && cellAt(mouse.x, mouse.y);
            if (hov && hov.col === col && hov.row === r) c.globalAlpha = 0.6 + 0.3 * Math.sin(tm * 10);
            A.plant(p.type, p.t, p);
            c.globalAlpha = 1;
            c.restore();
          }
          for (const u of G.nuts) if (Math.round((u.y - 168) / 100) === r) {
            c.save(); c.translate(u.x + 40, u.y);
            A.E(0, -2, 24, 6); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill();
            c.translate(0, -36); c.rotate(u.rot); c.translate(0, 36);
            A.wallnut(0, 0, u.type === 'boomnut');
            c.restore();
          }
          const zs = G.zombies.filter(z => z.row === r).sort((a, b) => b.x - a.x);
          for (const z of zs) {
            if (z.st === 'vault' && z.t < CFG.vault * 0.72) {
              const hx = z.x - 14, hy = z.by - 72 - z.alt;
              A.limb(z.poleX, z.by - 2, hx, hy, null, null, 4, ZBASE.pole);
            }
            if (scr === 'lost' && z === G.loser && z.x < -110) c.globalAlpha = clamp((z.x + 150) / 40, 0, 1);
            A.zombieAt(z, z.x, z.by, tm, false);
            c.globalAlpha = 1;
          }
          for (const p of jumps) {
            const k = clamp(1 - p.cd / CFG.squashJump, 0, 1), x = p.x0 + (p.tx - p.x0) * ease(k * 1.25), y = p.by - Math.sin(Math.min(1, k * 1.25) * Math.PI) * 110 + (k > 0.8 ? 0 : 0);
            c.save(); c.translate(x, y); if (k > 0.8) c.scale(1.15, 0.85); A.plant('squash', p.t, { st: 'aim', dir: p.dir }); c.restore();
          }
          if (scr === 'intro') for (const z of preview) if (Math.round((z.by - 168) / 100) === r) { z.ph = tm * 2 + z.id; A.zombieAt(z, z.x, z.by, tm, true); }
          for (const q of G.peas) if (q.row === r) A.pea(q.x, q.y, q.snow, q.fire, G.t, q.spore);
        }
        for (const q of G.parts) A.part(q);
        if (held && held.src !== 'shovel' && scr === 'play' && !paused) {
          const cell = !touchMode && cellAt(mouse.x, mouse.y);
          if (cell && G.canPlant(held.type, cell.col, cell.row)) {
            c.save(); c.translate(CFG.lawnX + cell.col * 80 + 40, G.foot(cell.row)); c.globalAlpha = 0.45; A.plant(held.type, 0, {}); c.restore(); c.globalAlpha = 1;
          }
          if (touchMode) {
            c.fillStyle = 'rgba(255,255,255,' + (0.1 + 0.06 * Math.sin(tm * 6)).toFixed(3) + ')';
            for (const r of G.rows) for (let col = 0; col < 9; col++) if (G.canPlant(held.type, col, r)) { A.RR(CFG.lawnX + col * 80 + 4, 80 + r * 100 + 4, 72, 92, 10); c.fill(); }
          }
        }
        for (const s of G.suns) {
          const a = s.st === 'land' && s.t > CFG.sunLife - CFG.sunBlink ? (Math.floor(s.t / 15) % 2 ? 0.45 : 1) : s.st === 'col' ? 0.9 : 1;
          A.sun(s.x, s.y, s.sc * (s.st === 'col' ? 0.85 : 1), s.rot, a);
        }
        if (G.award) {
          const aw = G.award;
          if (aw.st === 'col') {
            const k = ease(awardT / 2.4);
            A.award(aw.type, aw.x + (CX + camX - aw.x) * k, aw.y + (290 - aw.y) * k, 1 + k * 1.6, G.t * 3);
          } else A.award(aw.type, aw.x, aw.y + Math.sin(time * 3) * 4, 1, G.t);
        }
        c.restore();
        if (scr === 'play' && G.award && G.award.st === 'col') { c.fillStyle = 'rgba(255,255,255,' + clamp((awardT - 1.6) / 1.5, 0, 1).toFixed(3) + ')'; c.fillRect(0, 0, W, H); }
      }

      function drawBank() {
        const Lv = L(), conv = Lv.bowl || Lv.belt;
        if (PORT) {
          c.fillStyle = A.cg('tray', () => A.lg(0, 600, 0, 760, ['#8a5a2c', '#5a3818'])); c.fillRect(0, 600, 800, 160);
          c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 600, 800, 4);
        } else {
          const b = conv ? LAY.belt : LAY.bank;
          A.RR(b.x, b.y, conv ? b.w : 92 + nSlots * 56, b.h, 10); A.F(bankG(), 2.6);
        }
        if (conv) {
          const b = LAY.belt, sl = LAY.slot;
          const bx = b.x + 8, by = b.y + (PORT ? 8 : 14), bw = sl * CFG.beltMax, bh = b.h - (PORT ? 16 : 22);
          A.RR(bx - 2, by, bw + 4, bh, 8); A.F('#3b3b40', 2);
          c.save(); A.RR(bx - 2, by, bw + 4, bh, 8); c.clip();
          c.fillStyle = '#4c4c52';
          const off = (G.t * (PORT ? 0.5 : 0.35)) % 16;
          for (let x = bx - 16 + 16 - off; x < bx + bw + 16; x += 16) c.fillRect(x, by + bh - 8, 8, 6);
          for (let i = 0; i < G.belt.length; i++) {
            const it = G.belt[i], x = bx + it.pos * sl;
            if (x > bx + bw) continue;
            const r = { x: x + 2, y: by + 3, w: sl - 4, h: bh - 12 };
            A.packet(it.type, r.x, r.y, r.w, r.h, { sel: held && held.id === it.id, dim: held && held.id === it.id, big: PORT });
            if (scr === 'play' && !paused && it.pos <= CFG.beltMax - 1) { const ii = i; btns.push({ x: r.x, y: r.y, w: r.w, h: r.h, fn: () => { selectCard(ii); } }); }
          }
          c.restore();
        } else {
          const sb = LAY.sun;
          A.RR(sb.x, sb.y, sb.w, sb.h, 8); A.F('rgba(60,35,15,.45)', 0);
          A.sun(sb.x + sb.w / 2, sb.y + (PORT ? 52 : 30), PORT ? 0.95 : 0.62, time * 0.4, 1);
          const nb = PORT ? { x: sb.x + 6, y: sb.y + sb.h - 46, w: sb.w - 12, h: 38 } : { x: sb.x + 4, y: sb.y + 58, w: sb.w - 8, h: 20 };
          A.RR(nb.x, nb.y, nb.w, nb.h, 6); A.F(G.sunFlash > 0 && Math.floor(G.sunFlash / 6) % 2 ? '#ff6b5a' : '#fbf3d6', 1.8);
          A.T(String(G.sun), nb.x + nb.w / 2, nb.y + nb.h / 2 + 1, PORT ? 30 : 17, '#1d1407');
          for (let i = 0; i < nSlots; i++) {
            const r = LAY.card(i);
            A.RR(r.x - 2, r.y - 2, r.w + 4, r.h + 4, 6); A.F('rgba(40,22,8,.45)', 0);
            const cd = G.cards[i];
            if (!cd) continue;
            const cost = PL[cd.type].cost;
            const isHeld = held && held.src === 'card' && held.i === i;
            A.packet(cd.type, r.x, r.y, r.w, r.h, { cost, cd: cd.cd > 0 ? cd.cd / cd.max : 0, dim: (G.sun < cost && cd.cd <= 0) || isHeld || scr !== 'play', sel: isHeld, fl: cd.fl, big: PORT });
            if (scr === 'play' && !paused) { const ii = i; btns.push({ x: r.x, y: r.y, w: r.w, h: r.h, fn: () => { selectCard(ii); } }); }
            else if (scr === 'intro' && ph === 'choose') { const ii = i; btns.push({ x: r.x, y: r.y, w: r.w, h: r.h, fn: () => { choose.sel.splice(ii, 1); G.setSeeds(choose.sel); play('tap'); } }); }
          }
        }
        if (hasShovel()) {
          const s = LAY.shovel;
          if (!PORT) { A.RR(s.x, s.y, s.w, s.h, 10); A.F(bankG(), 2.6); }
          A.RR(s.x + 6, s.y + (PORT ? 6 : 14), s.w - 12, s.h - (PORT ? 12 : 20), 8); A.F('rgba(40,22,8,.5)', 0);
          if (!(held && held.src === 'shovel')) A.shovel(s.x + s.w / 2, s.y + s.h / 2 + (PORT ? 0 : 4), PORT ? 1.5 : 1, 0);
          if (scr === 'play' && !paused) btns.push({ x: s.x, y: s.y, w: s.w, h: s.h, fn: () => { held = held && held.src === 'shovel' ? null : { src: 'shovel' }; play('seed'); } });
        }
        const m = LAY.menu, sp = LAY.speed, spl = sv.speed === 1 ? 'Speed 1x' : sv.speed === 1.5 ? 'Speed 1.5x' : 'Speed 2x';
        if (PORT) {
          btn(m.x, m.y + 30, m.w, 84, 'II', () => pause(true), { size: 30, col: 'menu' });
        } else btn(m.x, m.y, m.w, m.h, 'Menu', () => pause(true), { size: 20, col: 'menu' });
        if (scr === 'play' && !paused) btn(sp.x, sp.y, sp.w, sp.h, spl, cycleSpeed, { size: PORT ? 17 : 15, col: sv.speed > 1 ? 'red' : 'stone' });
      }
      function drawProgress() {
        const n = G.n, bw = 150, bh = 16, bx = W - 172, by = 572;
        A.T('Level ' + lvName(li), bx - 10, by + bh / 2 + 1, 19, '#ffd84a', OL, 'right');
        A.RR(bx - 3, by - 3, bw + 6, bh + 6, 10); A.F('#56637a', 2); A.RR(bx, by, bw, bh, 7); A.F('#1f2633', 1);
        const f = G.progress();
        if (f > 0) { A.RR(bx + bw - bw * f, by + 2, bw * f, bh - 4, 6); c.fillStyle = A.cg('prog', () => A.lg(0, by, 0, by + bh, ['#a5f05c', '#4ca52a'])); c.fill(); }
        for (let w = 0; w < n; w++) {
          if (!G.isFlag(w)) continue;
          const fx = bx + bw - (w + 1) / n * bw + 3, up = G.wave > w ? 8 : 0;
          A.limb(fx, by + bh, fx, by - 12 - up, null, null, 1.6, '#e8e0d0');
          c.beginPath(); c.moveTo(fx, by - 12 - up); c.lineTo(fx + 11, by - 8 - up); c.lineTo(fx, by - 4 - up); c.closePath(); A.F('#c52b2b', 1.4);
        }
        c.save(); c.translate(bx + bw - bw * f, by + 4); c.scale(0.42, 0.42);
        A.E(-3, -20, 19, 21); A.F(ZBASE.skin, 3); A.E(-12, -24, 6, 7); A.F('#fff', 2); A.E(-13, -23, 2, 2); A.F('#111', 0);
        c.restore();
      }
      function drawMsgs() {
        if (!G.msg) return;
        const m = G.msg, t = m.t;
        if (m.k === 'huge' && t < 420) {
          const s = 1 + Math.sin(t * 0.08) * 0.03, a = clamp(Math.min(t / 30, (420 - t) / 40), 0, 1);
          c.save(); c.globalAlpha = a; c.translate(CX, 300); c.scale(s, s);
          A.T('A huge wave of zombies', 0, -20, 38, '#ff3a2a', OL, 'center', 8);
          A.T('is approaching!', 0, 24, 38, '#ff3a2a', OL, 'center', 8);
          c.restore(); c.globalAlpha = 1;
        }
        if (m.k === 'first' && t < 260) {
          const a = clamp(Math.min(t / 25, (260 - t) / 40), 0, 1);
          c.save(); c.globalAlpha = a; c.translate(CX, 250 + (1 - ease(t / 25)) * 12);
          A.T('The zombies are coming!', 0, 0, 40, '#ff3a2a', OL, 'center', 8);
          c.restore(); c.globalAlpha = 1;
        }
        if (m.k === 'final' && t < 300) {
          const k = clamp(t / 22, 0, 1), s = 3 - 2 * ease(k), a = t > 240 ? 1 - (t - 240) / 60 : k;
          c.save(); c.globalAlpha = clamp(a, 0, 1); c.translate(CX, 300); c.scale(s, s);
          A.T('FINAL WAVE', 0, 0, 62, '#ff3a2a', OL, 'center', 11);
          c.restore(); c.globalAlpha = 1;
        }
      }
      function drawAdvice() {
        if (!G || li !== 0 || scr !== 'play') return;
        let msg = '';
        const v = touchMode ? 'Tap' : 'Click';
        if (G.tut === 1) msg = held ? v + ' the grass to plant your Peashooter!' : v + ' the seed packet to pick up a Peashooter!';
        else if (G.sunGot === 0 && G.suns.some(s => s.st === 'fall' || s.st === 'land')) msg = v + ' the falling sun to collect it!';
        else if (G.sunGot > 0 && G.sunGot < 3 && G.wave === 0) msg = 'Collect sun to plant more Peashooters. Zombies are coming!';
        if (!msg) return;
        A.RR(90 + UX, 516, 620, 52, 14); c.fillStyle = 'rgba(10,8,4,.62)'; c.fill();
        A.T(msg, CX, 543, 22, '#fff2a8', OL, 'center', 5);
      }
      function drawHeldCursor() {
        if (!held || touchMode || scr !== 'play' || paused || mouse.x < -900) return;
        c.save(); c.translate(mouse.x, mouse.y);
        if (held.src === 'shovel') A.shovel(8, -6, 1.1, 0);
        else { c.translate(0, 34); c.globalAlpha = 0.85; A.plant(held.type, time * 60, {}); c.globalAlpha = 1; }
        c.restore();
      }
      function drawReady() {
        if (scr !== 'intro' || ph !== 'ready') return;
        const words = ['Ready...', 'Set...', 'PLANT!'], i = Math.min(2, Math.floor(phT / 0.6)), k = (phT - i * 0.6) / 0.6;
        const s = i === 2 ? 1.4 - 0.4 * ease(k * 3) : 1 + 0.15 * (1 - ease(k * 3));
        c.save(); c.translate(CX, 300); c.scale(s, s);
        A.T(words[i], 0, 0, i === 2 ? 84 : 60, '#ff3324', OL, 'center', 12);
        c.restore();
      }
      function drawChooser() {
        if (scr !== 'intro' || ph !== 'choose') return;
        const avail = seedsFor(li);
        const px = PORT ? 30 : 20, py = PORT ? 92 : 96, pw = PORT ? 740 : 600, phh = PORT ? 640 : 490;
        panel(px, py, pw, phh);
        A.T('Choose your seeds!', px + pw / 2, py + 40, PORT ? 40 : 30, '#ffe9a8', OL);
        A.T(choose.sel.length + ' / ' + nSlots + ' slots', px + pw / 2, py + (PORT ? 82 : 72), PORT ? 26 : 18, '#f4e3c0', OL);
        const cols = PORT ? 5 : 6, cw = PORT ? 140 : 92, chh = PORT ? 140 : 108, gx = px + (pw - cols * cw) / 2, gy = py + (PORT ? 104 : 88);
        avail.forEach((t, i) => {
          const x = gx + (i % cols) * cw + 6, y = gy + Math.floor(i / cols) * chh + 4, w = cw - 12, h = chh - 12;
          const on = choose.sel.includes(t);
          A.packet(t, x, y, w, h, { cost: PL[t].cost, dim: on, big: PORT });
          btns.push({ x, y, w, h, fn: () => {
            const j = choose.sel.indexOf(t);
            if (j >= 0) choose.sel.splice(j, 1); else if (choose.sel.length < nSlots) choose.sel.push(t); else { play('buzz'); return; }
            G.setSeeds(choose.sel); play('tap');
          } });
        });
        const ok = choose.sel.length === nSlots;
        btn(px + pw / 2 - (PORT ? 170 : 110), py + phh - (PORT ? 94 : 78), PORT ? 340 : 220, PORT ? 76 : 56, "LET'S GO!", letsGo, { dis: !ok, col: 'red', size: PORT ? 36 : 26 });
      }
      function drawPause() {
        if (scr !== 'play' || !paused) return;
        c.fillStyle = 'rgba(10,8,20,.45)'; c.fillRect(0, 0, W, H);
        const w = PORT ? 560 : 380, h = PORT ? 560 : 420, x = CX - w / 2, y = (PORT ? 380 : 300) - h / 2;
        panel(x, y, w, h);
        A.T('Paused', CX, y + (PORT ? 60 : 48), PORT ? 48 : 36, '#ffe9a8', OL);
        const bw = PORT ? 420 : 280, bh = PORT ? 86 : 58, gap = PORT ? 108 : 76, by = y + (PORT ? 110 : 86);
        btn(CX - bw / 2, by, bw, bh, 'Back to game', () => pause(false), { size: PORT ? 34 : 24 });
        btn(CX - bw / 2, by + gap, bw, bh, 'Game speed: ' + sv.speed + 'x', cycleSpeed, { size: PORT ? 30 : 22, col: 'red' });
        btn(CX - bw / 2, by + gap * 2, bw, bh, 'Restart level', () => startLevel(li), { size: PORT ? 34 : 24, col: 'stone' });
        btn(CX - bw / 2, by + gap * 3, bw, bh, 'Main menu', toTitle, { size: PORT ? 34 : 24, col: 'stone' });
      }
      function drawLost() {
        if (scr !== 'lost' || G.lostAt == null) return;
        const t = lostT - G.lostAt;
        c.fillStyle = 'rgba(0,0,0,' + clamp(t / 1.2, 0, 0.55).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
        const k = ease(t / 0.8), s = 0.3 + 0.7 * k, cy = PORT ? 300 : 250;
        c.save(); c.translate(CX, cy); c.scale(s, s); c.rotate(Math.sin(t * 3) * 0.02);
        const lines = ['THE ZOMBIES', 'MUNCHED YOUR', 'BRAINS!'];
        lines.forEach((ln, i) => {
          const y = -86 + i * 80;
          A.T(ln, 0, y, 70, '#8ee04a', '#1c2a0c', 'center', 14);
          c.fillStyle = '#6cc232';
          for (let d = 0; d < 6; d++) { const dx = -170 + d * 68 + (i * 23 % 40), dl = 6 + ((d * 7 + i * 5) % 9) * 2 * clamp(t - 0.6, 0, 1.4); A.E(dx, y + 34 + dl / 2, 4.5, 4 + dl / 2); c.fill(); }
        });
        c.restore();
        if (t > 1.6) {
          const bw = PORT ? 300 : 230, bh = PORT ? 84 : 58, y = PORT ? 520 : 470;
          btn(CX - bw - 12, y, bw, bh, 'Try again', () => startLevel(li), { size: PORT ? 34 : 24 });
          btn(CX + 12, y, bw, bh, 'Main menu', toTitle, { size: PORT ? 34 : 24, col: 'stone' });
        }
      }
      function drawWon() {
        if (scr !== 'won' || !wonInfo) return;
        c.fillStyle = '#fffdf2'; c.fillRect(0, 0, W, H);
        c.fillStyle = A.cg('wonbg', () => A.rg(CX, H / 2, 40, 520, ['#fff7d0', '#f2dca0'])); c.fillRect(0, 0, W, H);
        const a = wonInfo.type, pl = PL[a], info = pl ? { head: 'You got a new plant!', name: pl.name, desc: pl.desc } : Object.assign({ }, AWARD[a]);
        const k = ease(wonInfo.t / 0.6);
        c.save(); c.globalAlpha = k;
        const pw = PORT ? 720 : 560, phh = PORT ? 640 : 520, px = CX - pw / 2, py = (H - phh) / 2;
        A.RR(px, py, pw, phh, 26); A.F(A.cg('parch', () => A.lg(0, py, 0, py + phh, ['#f9eccb', '#e9d1a0'])), 3);
        A.RR(px + 12, py + 12, pw - 24, phh - 24, 18); c.strokeStyle = 'rgba(120,80,30,.35)'; c.lineWidth = 3; c.stroke();
        A.T(info.head, CX, py + (PORT ? 62 : 52), PORT ? 44 : 36, '#ffd23f', OL, 'center', 8);
        const fx = CX, fy = py + (PORT ? 250 : 210), fr = PORT ? 120 : 96;
        A.RR(fx - fr, fy - fr * 0.9, fr * 2, fr * 1.8, 18); A.F(A.cg('frame', () => A.lg(0, fy - fr, 0, fy + fr, ['#bfe6ff', '#8fd06a'])), 3);
        c.save(); c.beginPath(); c.roundRect(fx - fr, fy - fr * 0.9, fr * 2, fr * 1.8, 18); c.clip();
        A.E(fx, fy + fr * 0.62, fr * 0.9, 18); c.fillStyle = '#5a9a34'; c.fill();
        c.translate(fx, fy + fr * 0.62);
        const s = PORT ? 2.1 : 1.7;
        c.scale(s, s);
        if (pl) A.plant(a, time * 60, { st: a === 'potatomine' ? 'armed' : a === 'chomper' ? 'ready' : '' });
        else if (a === 'shovel') A.shovel(0, -36, 1.6, 0);
        else if (a === 'note') A.award('note', 0, -36, 1, 0);
        else { c.translate(0, -34); c.scale(1.3, 1.3); A.trophy(); }
        c.restore();
        A.T(info.name, CX, fy + fr * 0.9 + (PORT ? 44 : 36), PORT ? 40 : 32, '#fff', OL, 'center', 7);
        c.font = '800 ' + (PORT ? 27 : 19) + 'px Nunito, system-ui, sans-serif'; c.fillStyle = '#4a3418'; c.textAlign = 'center'; c.textBaseline = 'middle';
        const words = info.desc.split(' '), lines = []; let ln = '';
        for (const w of words) { const t2 = ln ? ln + ' ' + w : w; if (c.measureText(t2).width > pw - 90) { lines.push(ln); ln = w; } else ln = t2; }
        if (ln) lines.push(ln);
        lines.forEach((l, i) => c.fillText(l, CX, fy + fr * 0.9 + (PORT ? 96 : 76) + i * (PORT ? 34 : 25)));
        c.restore();
        if (wonInfo.t > 0.8) {
          const bw = PORT ? 300 : 220, bh = PORT ? 84 : 56, y = py + phh - (PORT ? 112 : 84);
          if (li < NLV - 1) {
            btn(CX - bw - 10, y, bw, bh, 'Next level!', () => startLevel(li + 1), { size: PORT ? 34 : 24 });
            btn(CX + 10, y, bw, bh, 'Main menu', toTitle, { size: PORT ? 34 : 24, col: 'stone' });
          } else btn(CX - bw / 2, y, bw, bh, 'Main menu', toTitle, { size: PORT ? 34 : 24 });
        }
      }
      const titleZ = { type: 'cone', st: 'walk', ph: 0, id: 3, head: true, arm: true, helm: 370, helmMax: 370, helmType: 'cone', paper: 0, pole: false, mad: false, chill: 0, flash: 0, alt: 0, eatT: 0, t: 0 };
      const titleZ2 = { type: 'zombie', st: 'walk', ph: 0, id: 7, head: true, arm: true, helm: 0, helmMax: 1, helmType: null, paper: 0, pole: false, mad: false, chill: 0, flash: 0, alt: 0, eatT: 0, t: 0 };
      function drawTitle() {
        drawBg(bgFor(LV[5], ALL), CAM0);
        c.fillStyle = A.cg('tsky', () => A.lg(0, 0, 0, 260, ['rgba(110,190,255,.95)', 'rgba(170,220,255,.6)', 'rgba(170,220,255,0)'])); c.fillRect(0, 0, W, 260);
        if (PORT) { c.fillStyle = A.cg('ttray', () => A.lg(0, 540, 0, 760, ['#4f9a2d', '#2f6a1a'])); c.fillRect(0, 540, 800, 220); }
        c.fillStyle = 'rgba(255,255,255,.75)';
        for (const [x, y, s] of [[120, 50, 1], [640, 40, 1.3], [400, 26, 0.8]]) { const xx = (x + time * 8 * s) % 900 - 50; A.E(xx, y, 40 * s, 14 * s); c.fill(); A.E(xx + 24 * s, y - 8 * s, 26 * s, 14 * s); c.fill(); }
        const ty = 40;
        c.save(); c.translate(CX, ty + 72); c.rotate(-0.025);
        A.RR(-250, -66, 500, 140, 22); A.F(A.cg('tboard', () => A.lg(0, -66, 0, 74, ['#9a6a3a', '#6a421f'])), 4);
        A.limb(-200, 74, -200, 140, null, null, 12, '#6a421f'); A.limb(200, 74, 200, 140, null, null, 12, '#6a421f');
        const word = (s, y, size, fill, wob) => {
          c.font = '900 ' + size + 'px Nunito, system-ui, sans-serif';
          let w = 0; for (const ch of s) w += c.measureText(ch).width + 2;
          let x = -w / 2;
          for (let i = 0; i < s.length; i++) {
            const ch = s[i], cw = c.measureText(ch).width;
            c.save(); c.translate(x + cw / 2, y + Math.sin(i * 1.7 + time * 2) * wob); c.rotate(Math.sin(i * 2.3) * 0.08);
            A.T(ch, 0, 0, size, fill, OL, 'center', size * 0.22);
            c.restore();
            x += cw + 2;
          }
        };
        word('PLANTS', -22, 64, '#8fe04a', 2);
        word('VS ZOMBIES', 40, 50, '#c9d4b6', 1.5);
        c.restore();
        const gy = PORT ? 300 : 226;
        c.save(); c.translate(CX, gy);
        const pulse = 1 + Math.sin(time * 3) * 0.02;
        c.scale(pulse, pulse);
        c.beginPath(); c.moveTo(-130, 150); c.lineTo(-130, 10); c.quadraticCurveTo(-130, -70, 0, -70); c.quadraticCurveTo(130, -70, 130, 10); c.lineTo(130, 150); c.closePath();
        A.F(A.cg('stone', () => A.lg(-130, 0, 130, 0, ['#b9bfc8', '#8c94a0', '#6b7380'])), 4);
        c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-112, 140); c.lineTo(-112, 10); c.quadraticCurveTo(-112, -52, 0, -52); c.stroke();
        A.T('ADVENTURE', 0, 18, 36, '#f2f4f6', '#3d434c', 'center', 7);
        const lvTxt = sv.lv > NLV ? 'All done! Replay any level' : 'Level ' + lvName(Math.min(sv.lv, NLV) - 1);
        A.T(lvTxt, 0, 66, 24, '#ffe28a', '#3d434c', 'center', 5);
        A.T(touchMode ? 'Tap to play' : 'Click or press Enter', 0, 112, 18, '#e6e9ee', '#3d434c', 'center', 4);
        c.restore();
        btns.push({ x: CX - 130, y: gy - 70, w: 260, h: 220, fn: () => startLevel(Math.min(sv.lv, NLV) - 1) });
        c.save(); c.translate(150, PORT ? 490 : 480); c.scale(1.5, 1.5); A.E(0, -2, 26, 7); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); A.plant('sunflower', time * 60, { lc: 999 }); c.restore();
        c.save(); c.translate(90, PORT ? 520 : 520); c.scale(1.6, 1.6); A.E(0, -2, 26, 7); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); A.plant('peashooter', time * 60, {}); c.restore();
        titleZ.ph = time * 2.4; titleZ2.ph = time * 2 + 1;
        c.save(); c.translate(690 + 2 * UX, PORT ? 530 : 470); c.scale(1.5, 1.5); A.zombie(titleZ2, ZPAL[0], false, time); c.restore();
        c.save(); c.translate(610 + 2 * UX, PORT ? 500 : 440); c.scale(1.35, 1.35); A.zombie(titleZ, ZPAL[0], false, time); c.restore();
        const tw = PORT ? 140 : 62, th = PORT ? 64 : 42, gp = PORT ? 10 : 8, cols = PORT ? 5 : 10, gx = CX - (cols * (tw + gp) - gp) / 2, ly = PORT ? 530 : 496;
        for (let i = 0; i < NLV; i++) {
          const x = gx + (i % cols) * (tw + gp), y = ly + Math.floor(i / cols) * (th + 10);
          const open = i + 1 <= sv.lv, done = i + 1 < sv.lv;
          A.RR(x, y, tw, th, 12); A.F(open ? (done ? '#6fc23e' : '#ffd23f') : '#7a7f88', 2.4);
          A.T(lvName(i), x + tw / 2, y + th / 2 + 1, PORT ? 30 : 18, open ? '#fff' : '#c9ccd2', OL, 'center', PORT ? 6 : 4);
          if (open) btns.push({ x, y, w: tw, h: th, fn: () => startLevel(i) });
        }
      }

      function render() {
        btns = [];
        A.setScale(c.getTransform().a);
        c.clearRect(0, 0, W, H);
        if (scr === 'title') { drawTitle(); return; }
        if (scr === 'won') { drawWon(); return; }
        drawScene();
        if (scr !== 'lost') {
          drawBank();
          drawProgress();
          drawMsgs();
          drawAdvice();
          drawReady();
          drawChooser();
          drawHeldCursor();
          drawPause();
        } else { if (PORT) { c.fillStyle = '#3a2410'; c.fillRect(0, 600, 800, 160); } drawLost(); }
      }

      root._gd = { info: () => ({ scr, ph, li, paused, held: held && held.src, port: PORT }), G: () => G, start: i => startLevel(i), ff: k => { for (let i = 0; i < k && G && G.state === 'play' && scr === 'play'; i++) G.tick(); } };
      api.loop(dt => { update(dt); render(); });
      score(Math.min(sv.lv, NLV));
      return { destroy() { snd.close(); } };
    }
  });
  Ameplay.covers['garden-defense'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gdf-h" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#c4f27a"/><stop offset=".55" stop-color="#74c93a"/><stop offset="1" stop-color="#3a8a1f"/></radialGradient><radialGradient id="gdf-s" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffe25a"/><stop offset="1" stop-color="#f7a823"/></radialGradient><radialGradient id="gdf-p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d9ff9a"/><stop offset="1" stop-color="#3f8f1f"/></radialGradient><linearGradient id="gdf-c" x1="0" x2="1"><stop offset="0" stop-color="#ffb35a"/><stop offset=".5" stop-color="#f38b26"/><stop offset="1" stop-color="#c2621a"/></linearGradient><radialGradient id="gdf-f" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f1b04a"/><stop offset="1" stop-color="#a9611b"/></radialGradient></defs>
<rect width="400" height="300" fill="#5fb336"/><path d="M0 60h80v80H0zM160 60h80v80h-80zM320 60h80v80h-80zM80 140h80v80H80zM240 140h80v80h-80zM0 220h80v80H0zM160 220h80v80h-80zM320 220h80v80h-80z" fill="#72c545"/>
<path d="M0 0h400v58H0z" fill="#e9cf9c"/><path d="M24 0v50M50 0v50M76 0v50M102 0v50M128 0v50M154 0v50M180 0v50M206 0v50M232 0v50M258 0v50M284 0v50M310 0v50M336 0v50M362 0v50M388 0v50" stroke="#b08a52" stroke-width="3"/>
<g fill="#3f8a2a"><circle cx="10" cy="62" r="20"/><circle cx="44" cy="58" r="20"/><circle cx="80" cy="62" r="20"/><circle cx="116" cy="58" r="20"/><circle cx="152" cy="62" r="20"/><circle cx="188" cy="58" r="20"/><circle cx="224" cy="62" r="20"/><circle cx="260" cy="58" r="20"/><circle cx="296" cy="62" r="20"/><circle cx="332" cy="58" r="20"/><circle cx="368" cy="62" r="20"/><circle cx="400" cy="58" r="20"/></g>
<g stroke="#26190d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<ellipse cx="70" cy="214" rx="26" ry="7" fill="#000" opacity=".2" stroke="none"/><path d="M66 212q-6-30 2-60h8q-6 30 0 60z" fill="#2f7a1a"/><path d="M70 190q-24-14-34 0 16 10 34 0z" fill="#3d9422"/>
<g transform="translate(72 140)" fill="#ffd23f"><ellipse cx="0" cy="-26" rx="8" ry="14"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(40)"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(80)"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(120)"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(160)"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(200)"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(240)"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(280)"/><ellipse cx="0" cy="-26" rx="8" ry="14" transform="rotate(320)"/><circle r="19" fill="url(#gdf-f)"/></g>
<g stroke="none" fill="#1a1008"><ellipse cx="65" cy="136" rx="3" ry="5"/><ellipse cx="79" cy="136" rx="3" ry="5"/></g><path d="M64 146q8 7 16 0" fill="none"/>
<ellipse cx="150" cy="272" rx="40" ry="10" fill="#000" opacity=".22" stroke="none"/><path d="M150 268q-40-26-58-6 26 18 58 6zM150 268q40-26 58-6-26 18-58 6z" fill="#3d9422"/><path d="M144 270q-8-40 0-74h12q-6 36 2 74z" fill="#2f7a1a"/>
<path d="M120 168q-30-14-36 6 18 8 36-6z" fill="#3d9422"/><rect x="158" y="170" width="54" height="30" rx="12" fill="#74c93a"/><ellipse cx="212" cy="185" rx="11" ry="18" fill="#3a8a1f"/><ellipse cx="214" cy="185" rx="6" ry="12" fill="#1f3d12" stroke="none"/>
<circle cx="146" cy="180" r="34" fill="url(#gdf-h)"/><ellipse cx="156" cy="170" rx="7" ry="11" fill="#101010" stroke="none"/><circle cx="158" cy="165" r="3" fill="#fff" stroke="none"/><ellipse cx="134" cy="164" rx="10" ry="6" fill="#fff" opacity=".4" stroke="none" transform="rotate(-30 134 164)"/>
<path d="M232 172h-14M240 186h-20M232 198h-12" stroke="#fff" stroke-width="4" opacity=".8"/>
<circle cx="246" cy="184" r="12" fill="url(#gdf-p)"/><circle cx="284" cy="180" r="12" fill="url(#gdf-p)"/>
<ellipse cx="335" cy="282" rx="38" ry="9" fill="#000" opacity=".22" stroke="none"/>
<path d="M342 226l10 52M328 226l-14 50" stroke="#26190d" stroke-width="18"/><path d="M342 226l10 52M328 226l-14 50" stroke="#46425e" stroke-width="12"/><ellipse cx="346" cy="280" rx="14" ry="7" fill="#2c221a"/><ellipse cx="306" cy="278" rx="14" ry="7" fill="#2c221a"/>
<path d="M314 232l-4-64q22-12 46-2l2 66-10-6-8 6-8-6-8 6z" fill="#6a4d36"/><path d="M318 170h18l-10 40z" fill="#eeebe0"/><path d="M322 172h6l2 30-5 8-5-8z" fill="#c4302c"/>
<path d="M318 180l-24 24-16 8" stroke="#26190d" stroke-width="18" fill="none"/><path d="M318 180l-24 24" stroke="#6a4d36" stroke-width="13" fill="none"/><path d="M294 204l-16 8" stroke="#b4c29c" stroke-width="10" fill="none"/><circle cx="276" cy="213" r="8" fill="#b4c29c"/>
<ellipse cx="350" cy="138" rx="6" ry="9" fill="#8c9a74"/><ellipse cx="330" cy="136" rx="30" ry="32" fill="#b4c29c"/><ellipse cx="316" cy="128" rx="11" ry="12" fill="#fffbe9"/><ellipse cx="335" cy="125" rx="8" ry="9" fill="#fffbe9"/><circle cx="313" cy="130" r="3.5" fill="#1b1410" stroke="none"/><circle cx="332" cy="127" r="3" fill="#1b1410" stroke="none"/><ellipse cx="316" cy="154" rx="9" ry="7" fill="#4b1c1c"/><path d="M311 148h4v5h-4zM318 148h4v4h-4z" fill="#f1ebc9" stroke-width="1.5"/>
<path d="M334 50l-34 58 64 4z" fill="url(#gdf-c)"/><path d="M328 70l14 1 5 14-26-1z" fill="#fff1dc" stroke-width="2"/><ellipse cx="332" cy="110" rx="36" ry="8" fill="#c2621a"/>
</g>
<g transform="translate(236 92)"><circle r="40" fill="#fff4a0" opacity=".45"/><path d="M0-34l6 13 13-7-3 14 14 2-11 9 11 9-14 2 3 14-13-7-6 13-6-13-13 7 3-14-14-2 11-9-11-9 14-2-3-14 13 7z" fill="#ffd43b" stroke="#f0a51c" stroke-width="2"/><circle r="17" fill="url(#gdf-s)" stroke="#e8961a" stroke-width="2.5"/></g>
</svg>`;
})();

