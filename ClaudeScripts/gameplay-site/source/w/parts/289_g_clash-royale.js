(() => {
  'use strict';
  const ID = 'clash-royale';
  const W = 432, H = 910, T = 24, AY = 30, TRY = 798, AW = 18, AH = 32;
  const RV0 = 15, RV1 = 17, BRX = [4, 14], BRG = [[2.5, 5.5], [12.5, 15.5]];
  const STEP = 1 / 30, REG = 180, OVT = 120, ONLINE_LV = 5, MAXLV = 9;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const TAU = Math.PI * 2;
  const OUT = '#2a2035';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lm = L => Math.pow(1.1, L - 1);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtT = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  const D0 = { dep: 1, sight: 5.5, rd: .45, ms: 5, cnt: 1, air: 0, fl: 0, bo: 0, sr: 0, rg: .4, b: 0, hs: 1, sp: 1, pj: 0, dmg: 0, hp: 1, c: 0 };
  const RAW = {
    knight: { n: 'Sir Dent', k: 't', c: 3, r: 'c', hp: 690, dmg: 79, hs: 1.2, sp: 1, rd: .5, ms: 6, d: 'A sturdy swordsman who takes every dent as a compliment.' },
    archers: { n: 'Twin Bows', k: 't', c: 3, r: 'c', cnt: 2, form: [[-.6, 0], [.6, 0]], hp: 125, dmg: 33, hs: 1.2, sp: 1, rg: 5, air: 1, pj: 13, rd: .35, ms: 3, d: 'Two sisters, two bows, zero patience. Hits air and ground.' },
    giant: { n: 'Brickhead', k: 't', c: 5, r: 'r', hp: 1930, dmg: 120, hs: 1.5, sp: .75, bo: 1, rd: .75, ms: 18, rg: .5, d: 'Slow, huge and only interested in buildings. Soaks up everything.' },
    musketeer: { n: 'Rifle Ranger', k: 't', c: 4, r: 'r', hp: 340, dmg: 100, hs: 1, sp: 1, rg: 6, air: 1, pj: 18, rd: .4, ms: 5, d: 'Long-range sharpshooter with a very big hat and a very big rifle.' },
    minipekka: { n: 'Mini Crusher', k: 't', c: 4, r: 'r', hp: 600, dmg: 325, hs: 1.8, sp: 1.5, rd: .5, ms: 9, d: 'Small iron fighter who hits like a truck. Fast and ground-only.' },
    skeletons: { n: 'Bone Pack', k: 't', c: 1, r: 'c', cnt: 3, form: [[0, -.5], [-.55, .35], [.55, .35]], hp: 32, dmg: 32, hs: 1, sp: 1.5, rd: .3, ms: 2, d: 'Three rattling skeletons for one elixir. Great at cycling and stopping tanks.' },
    goblins: { n: 'Sneaky Gremlins', k: 't', c: 2, r: 'c', cnt: 3, form: [[0, -.5], [-.55, .35], [.55, .35]], hp: 80, dmg: 50, hs: 1.1, sp: 2, rd: .35, ms: 3, d: 'Three green gremlins with sharp knives and very quick feet.' },
    spears: { n: 'Dart Imps', k: 't', c: 2, r: 'c', cnt: 3, form: [[0, -.5], [-.55, .35], [.55, .35]], hp: 52, dmg: 24, hs: 1.3, sp: 2, rg: 5, air: 1, pj: 14, rd: .33, ms: 2, d: 'Three imps with long darts. They hit air and ground from far away.' },
    minions: { n: 'Buzz Bats', k: 't', c: 3, r: 'c', cnt: 3, fl: 1, air: 1, form: [[0, -.5], [-.55, .35], [.55, .35]], hp: 90, dmg: 40, hs: 1, sp: 1.5, rg: 1.6, rd: .35, ms: 2, d: 'Three flying bats that dive on anything. Fragile against splash.' },
    dragon: { n: 'Puff Drake', k: 't', c: 4, r: 'e', hp: 800, dmg: 100, hs: 1.8, sp: 1.5, fl: 1, air: 1, sr: 1.5, rg: 3.5, pj: 12, rd: .6, ms: 8, d: 'A chubby flying drake whose fire splashes everything below.' },
    valkyrie: { n: 'Whirl Maiden', k: 't', c: 4, r: 'r', hp: 880, dmg: 120, hs: 1.5, sp: 1, sr: 1.9, rd: .5, ms: 7, d: 'Spins her giant axe in a full circle. Excellent against swarms.' },
    hog: { n: 'Boar Jockey', k: 't', c: 4, r: 'r', hp: 800, dmg: 110, hs: 1.6, sp: 2, bo: 1, jump: 1, rd: .55, ms: 8, d: 'Rides a very fast boar straight at your buildings, jumping the river.' },
    wizard: { n: 'Spark Mage', k: 't', c: 5, r: 'r', hp: 340, dmg: 130, hs: 1.4, sp: 1, rg: 5, air: 1, sr: 1.5, pj: 13, rd: .45, ms: 5, d: 'Throws splashing fireballs at air and ground troops.' },
    bomber: { n: 'Bomb Pal', k: 't', c: 3, r: 'c', hp: 190, dmg: 150, hs: 1.8, sp: 1, rg: 4.5, sr: 1.5, pj: 8, ar: 1, rd: .4, ms: 3, d: 'Tosses bombs that splash ground troops. Cannot hit air.' },
    prince: { n: 'Lance Knight', k: 't', c: 5, r: 'e', hp: 920, dmg: 200, hs: 1.5, sp: 1, ch: 1, rd: .55, ms: 10, d: 'Charges at full speed and deals double damage on the first hit.' },
    pekka: { n: 'Iron Behemoth', k: 't', c: 7, r: 'e', hp: 2150, dmg: 450, hs: 1.8, sp: .75, rd: .7, ms: 20, d: 'A walking tank of armor with a sword that ends big troops in two hits.' },
    golem: { n: 'Stone Colossus', k: 't', c: 8, r: 'e', hp: 3200, dmg: 195, hs: 2.5, sp: .75, bo: 1, rd: .85, ms: 30, dth: 'golem', d: 'Enormous, slow, and breaks into two little golemites when it falls.' },
    barbarians: { n: 'Brawler Squad', k: 't', c: 5, r: 'c', cnt: 4, form: [[-.6, -.5], [.6, -.5], [-.6, .5], [.6, .5]], hp: 262, dmg: 75, hs: 1.3, sp: 1, rd: .4, ms: 5, d: 'Four fierce brawlers with horned helmets. Strong ground push.' },
    balloon: { n: 'Skybomber', k: 't', c: 5, r: 'e', hp: 990, dmg: 390, hs: 3, sp: .9, fl: 1, bo: 1, rg: .5, rd: .6, ms: 6, dth: 'bomb', d: 'A floating bomb basket that flies over the river and targets buildings.' },
    witch: { n: 'Hex Witch', k: 't', c: 5, r: 'e', hp: 440, dmg: 75, hs: .7, sp: 1, rg: 5, air: 1, sr: 1.5, pj: 12, rd: .45, ms: 5, spw: ['skel1', 7, 3, 2.5], d: 'Summons skeletons and zaps enemies with splashing magic.' },
    icespirit: { n: 'Frost Wisp', k: 't', c: 1, r: 'c', hp: 190, dmg: 43, hs: 1, sp: 2, air: 1, sr: 1.5, rg: .3, kz: 1, frz: 1, rd: .35, ms: 2, d: 'Leaps at enemies and freezes everything around it for a moment.' },
    fireball: { n: 'Blaze Orb', k: 's', c: 4, r: 'r', rad: 2.5, dmg: 325, tf: .25, kb: 1.2, d: 'A big burning orb. Damages and pushes back troops in a wide area.' },
    arrows: { n: 'Arrow Rain', k: 's', c: 3, r: 'c', rad: 4, dmg: 115, tf: .26, d: 'A volley that covers a huge area. Great against swarms.' },
    zap: { n: 'Zap Bolt', k: 's', c: 2, r: 'c', rad: 3, dmg: 80, tf: .3, stun: .5, d: 'Instant shock. Stuns troops and resets their attack.' },
    poison: { n: 'Toxic Cloud', k: 's', c: 4, r: 'e', rad: 3.5, dmg: 57, tf: .35, dur: 8, d: 'A green cloud that hurts everything inside for eight seconds.' },
    log: { n: 'Rolling Timber', k: 's', c: 2, r: 'l', rad: 1.9, dmg: 80, tf: .3, kb: 1.8, len: 11, d: 'A log that rolls down the lane knocking ground troops back.' },
    cannon: { n: 'Iron Cannon', k: 'b', c: 3, r: 'c', hp: 410, dmg: 83, hs: .8, rg: 5.5, pj: 16, life: 30, rd: .9, ms: 99, d: 'A cannon that shoots ground troops. It decays over 30 seconds.' },
    tesla: { n: 'Spark Tower', k: 'b', c: 4, r: 'c', hp: 450, dmg: 94, hs: 1.1, rg: 5.5, air: 1, pj: 40, life: 30, rd: .9, ms: 99, d: 'Zaps air and ground troops with lightning for 30 seconds.' },
    mortar: { n: 'Lobber', k: 'b', c: 4, r: 'c', hp: 600, dmg: 133, hs: 5, rg: 11.5, mn: 3.5, sr: 1.5, pj: 6, ar: 1, life: 30, rd: .9, ms: 99, sight: 11.5, d: 'Lobs shells across the arena. Cannot hit air or anything close.' },
    tomb: { n: 'Grave Marker', k: 'b', c: 3, r: 'r', hp: 300, dmg: 0, life: 40, rd: .9, ms: 99, spw: ['skel1', 3.1, 1, 1.5], dth: 'tomb', d: 'Spawns skeletons over time and releases four more when destroyed.' },
    skel1: { n: 'Skeleton', k: 'x', hp: 32, dmg: 32, hs: 1, sp: 1.5, rd: .3, ms: 2 },
    golemite: { n: 'Golemite', k: 'x', hp: 480, dmg: 40, hs: 2.5, sp: .75, bo: 1, rd: .5, ms: 12 },
    pt: { n: 'Princess Tower', k: 'w', hp: 1400, dmg: 50, hs: .8, rg: 7.5, sight: 7.5, air: 1, pj: 20, rd: 1.5, hw: 1.5, ms: 999, b: 1 },
    kt: { n: 'King Tower', k: 'w', hp: 2400, dmg: 50, hs: 1, rg: 7, sight: 7, air: 1, pj: 18, rd: 2, hw: 2, ms: 999, b: 1 }
  };
  const DEF = {};
  Object.keys(RAW).forEach(k => { const d = Object.assign({}, D0, RAW[k]); d.key = k; if (d.k === 'b' || d.k === 'w') d.b = 1; DEF[k] = d; });
  const KEYS = Object.keys(DEF);
  const KIDX = {};
  KEYS.forEach((k, i) => { KIDX[k] = i; });
  const CARD_KEYS = KEYS.filter(k => DEF[k].k === 't' || DEF[k].k === 's' || DEF[k].k === 'b');
  CARD_KEYS.sort((a, b) => DEF[a].c - DEF[b].c);
  const STARTERS = ['knight', 'archers', 'skeletons', 'giant', 'musketeer', 'minipekka', 'fireball', 'arrows'];
  const RAR = { c: { n: 'Common', col: '#6fb7ff', col2: '#3c7fd4', cp: 1 }, r: { n: 'Rare', col: '#ffb54a', col2: '#e0791a', cp: .5 }, e: { n: 'Epic', col: '#d58bff', col2: '#8d3fd8', cp: .25 }, l: { n: 'Legendary', col: '#ffe36b', col2: '#ff6fcf', cp: .1 } };
  const COPIES = [2, 4, 10, 20, 50, 100, 200, 400];
  const GOLDUP = [5, 20, 50, 150, 400, 1000, 2000, 4000];
  const copiesFor = (key, lv) => Math.max(1, Math.ceil(COPIES[lv - 1] * RAR[DEF[key].r].cp));
  const goldFor = lv => GOLDUP[lv - 1];
  const SPD = sp => sp <= .8 ? 'Slow' : sp <= 1.05 ? 'Medium' : sp <= 1.6 ? 'Fast' : 'Very fast';
  const ARENAS = [
    { n: 'Pebble Meadow', t: 0, th: 'meadow' },
    { n: 'Frostpeak Pass', t: 300, th: 'frost' },
    { n: 'Sandstone Ruins', t: 700, th: 'sand' },
    { n: 'Ember Hollow', t: 1200, th: 'ember' }
  ];
  const THEMES = {
    meadow: { g1: '#7fcf4f', g2: '#74c346', riv: '#3da5e8', riv2: '#7ad0ff', path: '#a9de72', plat: '#b9b2a6', plat2: '#a39c90', deco: '#2f8f3a', dk: '#4e9a2d' },
    frost: { g1: '#dff1fb', g2: '#d0e8f6', riv: '#58b4e6', riv2: '#a6e3ff', path: '#f1fbff', plat: '#aab6c4', plat2: '#97a4b4', deco: '#6ba3a0', dk: '#9cc3da' },
    sand: { g1: '#e8c97c', g2: '#dfbd6c', riv: '#35b0b4', riv2: '#80e1de', path: '#f2dc9c', plat: '#c9a97a', plat2: '#b89867', deco: '#7a9b3d', dk: '#bb9448' },
    ember: { g1: '#6a5a58', g2: '#5f504e', riv: '#ff7a2f', riv2: '#ffc15a', path: '#7e6c68', plat: '#4a4048', plat2: '#3d343c', deco: '#b9452a', dk: '#463836' }
  };
  const BOTDECKS = [
    { n: 'Boar Cycle', d: ['hog', 'knight', 'archers', 'icespirit', 'skeletons', 'cannon', 'log', 'zap'] },
    { n: 'Giant Beatdown', d: ['giant', 'witch', 'musketeer', 'minions', 'minipekka', 'zap', 'fireball', 'spears'] },
    { n: 'Colossus Push', d: ['golem', 'dragon', 'witch', 'minions', 'icespirit', 'zap', 'poison', 'barbarians'] },
    { n: 'Sky Raid', d: ['balloon', 'dragon', 'minions', 'tesla', 'archers', 'arrows', 'icespirit', 'knight'] },
    { n: 'Siege Camp', d: ['mortar', 'tomb', 'knight', 'archers', 'skeletons', 'arrows', 'icespirit', 'musketeer'] },
    { n: 'Swarm Bait', d: ['goblins', 'spears', 'skeletons', 'bomber', 'barbarians', 'arrows', 'valkyrie', 'cannon'] },
    { n: 'Iron Bridge', d: ['pekka', 'prince', 'minipekka', 'goblins', 'bomber', 'zap', 'fireball', 'wizard'] },
    { n: 'Royal Hog', d: ['hog', 'valkyrie', 'musketeer', 'tesla', 'fireball', 'log', 'skeletons', 'wizard'] }
  ];
  const CHESTS = {
    wood: { n: 'Wooden Chest', s: 60, g: [25, 45], cards: [4, 6], dist: [2, 3], rw: [76, 22, 2, 0], col: '#b9783a', col2: '#7a4620' },
    silver: { n: 'Silver Chest', s: 180, g: [50, 90], cards: [9, 14], dist: [3, 4], rw: [68, 27, 5, 0], col: '#c9d3e0', col2: '#7c8aa0' },
    gold: { n: 'Golden Chest', s: 420, g: [140, 220], cards: [20, 30], dist: [4, 5], rw: [58, 32, 9, 1], col: '#ffd24a', col2: '#c38a14' },
    magic: { n: 'Magical Chest', s: 720, g: [320, 520], cards: [45, 65], dist: [5, 7], rw: [44, 36, 17, 3], col: '#b27cff', col2: '#5f2fb8' },
    crown: { n: 'Crown Chest', s: 0, g: [100, 180], cards: [14, 20], dist: [3, 5], rw: [40, 38, 18, 4], col: '#ffcf33', col2: '#d6740f' }
  };
  const DIFFS = [
    { n: 'Rookie', pe: 9, lv: -2, rt: 2.2, tk: .9, er: 0, win: 14, loss: 0, gold: 14, err: .35 },
    { n: 'Fighter', pe: 8, lv: -1, rt: 1.3, tk: .55, er: .35, win: 25, loss: 10, gold: 22, err: .15 },
    { n: 'Veteran', pe: 7, lv: 0, rt: .75, tk: .35, er: .7, win: 32, loss: 20, gold: 30, err: .05 },
    { n: 'Champion', pe: 6, lv: 1, rt: .35, tk: .2, er: 1, win: 40, loss: 26, gold: 40, err: 0 }
  ];
  const towerDef = (key, lv) => { const d = DEF[key], m = lm(lv); return { hp: Math.round(d.hp * m), dmg: Math.round(d.dmg * m) }; };

  const TPOS = [[3.5, 25.5], [14.5, 25.5], [9, 29.4]];
  const sideY = y => y > RV1 ? 0 : y < RV0 ? 1 : 2;
  const inBridge = (x, r) => (x - r * .5 >= BRG[0][0] && x + r * .5 <= BRG[0][1]) || (x - r * .5 >= BRG[1][0] && x + r * .5 <= BRG[1][1]);
  const lvOf = (S, s, key) => (S.lv[s] && S.lv[s][key]) || S.kl[s];
  const elixVal = D => D.c ? D.c / D.cnt : D.key === 'golemite' ? .8 : .35;

  function newSim(o) {
    const S = { t: 0, per: 'reg', left: REG, intro: o.intro == null ? 2.5 : o.intro, el: [5, 5], over: 0, win: -1, cr: [0, 0], units: [], projs: [], zones: [], logs: [], ev: [], nid: 1, kl: o.kl, lv: o.lv, hands: [], act: [0, 0], names: o.names || ['You', 'Opponent'], mult: 1, spent: [0, 0], dec: o.decks, m: new Map(), bots: [null, null], me: o.me || 0 };
    for (let s = 0; s < 2; s++) {
      const dk = o.decks[s], ord = shuf(dk.map((_, i) => i));
      S.hands.push({ deck: dk.slice(), slots: ord.slice(0, 4), next: ord[4], queue: ord.slice(5) });
      for (let i = 0; i < 3; i++) {
        const key = i === 2 ? 'kt' : 'pt', tp = TPOS[i], lv = S.kl[s], td = towerDef(key, lv);
        const u = mkUnit(S, key, s, tp[0], s === 0 ? tp[1] : AH - tp[1], lv);
        u.hp = u.mhp = td.hp; u.dm = td.dmg; u.dep = 0; u.ti = i;
        S.units.push(u); S.m.set(u.id, u);
      }
    }
    return S;
  }
  function mkUnit(S, key, s, x, y, lv) {
    const d = DEF[key], m = lm(lv), hp = Math.round(d.hp * m);
    return { id: S.nid++, key, s, x, y, px: x, py: y, hp, mhp: hp, dm: Math.round(d.dmg * m), lv, dep: d.dep, cd: 0, tg: 0, rt: Math.random() * .2, atk: 0, hit: 0, stun: 0, frz: 0, ch: 0, w: Math.random() * 6, fx: 1, kx: 0, ky: 0, d: 0, sp: d.spw ? d.spw[3] : 0, life: d.life || 0, D: d };
  }
  function addUnit(S, u) { S.units.push(u); S.m.set(u.id, u); return u; }
  function rebuild(S) {
    S.m = new Map(); S.bots = [null, null];
    S.units.forEach(u => { u.D = DEF[u.key]; S.m.set(u.id, u); });
  }
  const saveReplacer = (k, v) => (k === 'D' || k === 'm' || k === 'bots') ? undefined : v;

  function edge(a, b) {
    const bd = b.D, ar = a.D.hw ? 0 : a.D.rd;
    if (bd.hw) { const dx = Math.max(Math.abs(a.x - b.x) - bd.hw, 0), dy = Math.max(Math.abs(a.y - b.y) - bd.hw, 0); return Math.hypot(dx, dy) - ar; }
    return Math.hypot(a.x - b.x, a.y - b.y) - bd.rd - ar;
  }
  const AIM = { x: 0, y: 0 };
  function aim(u, t) {
    if (t.D.hw) { AIM.x = clamp(u.x, t.x - t.D.hw, t.x + t.D.hw); AIM.y = clamp(u.y, t.y - t.D.hw, t.y + t.D.hw); }
    else { AIM.x = t.x; AIM.y = t.y; }
    return AIM;
  }
  function pathLen(u, gx, gy) {
    if (u.D.fl || u.D.jump) return Math.hypot(gx - u.x, gy - u.y);
    const us = sideY(u.y), gs = sideY(gy);
    if (us === gs || us === 2 || gs === 2) return Math.hypot(gx - u.x, gy - u.y);
    let best = 1e9;
    for (const bx of BRX) {
      const ya = us === 0 ? RV1 : RV0, yb = us === 0 ? RV0 : RV1;
      best = Math.min(best, Math.hypot(u.x - bx, u.y - ya) + RV1 - RV0 + Math.hypot(bx - gx, yb - gy));
    }
    return best;
  }
  const WP = { x: 0, y: 0 };
  function waypoint(u, gx, gy) {
    WP.x = gx; WP.y = gy;
    if (u.D.fl || u.D.jump) return WP;
    const us = sideY(u.y), gs = sideY(gy);
    if (us === 2) {
      if (gs === 2) return WP;
      WP.x = Math.abs(u.x - BRX[0]) < Math.abs(u.x - BRX[1]) ? BRX[0] : BRX[1];
      WP.y = gs === 1 ? RV0 - 1 : RV1 + 1;
      return WP;
    }
    if (us === gs || gs === 2) return WP;
    let bi = 0, bb = 1e9;
    for (let i = 0; i < 2; i++) {
      const ya = us === 0 ? RV1 : RV0, yb = us === 0 ? RV0 : RV1;
      const c = Math.hypot(u.x - BRX[i], u.y - ya) + Math.hypot(BRX[i] - gx, yb - gy);
      if (c < bb) { bb = c; bi = i; }
    }
    const bx = BRX[bi], ya = us === 0 ? RV1 : RV0;
    if (Math.abs(u.x - bx) < 1 && Math.abs(u.y - ya) < 3.5) { WP.x = bx; WP.y = us === 0 ? RV0 - 1 : RV1 + 1; }
    else { WP.x = bx; WP.y = ya + (us === 0 ? 1.4 : -1.4); }
    return WP;
  }
  function canHit(u, t) {
    if (t.d || t.hp <= 0) return false;
    if (u.D.bo && !t.D.b) return false;
    if (t.D.fl && !u.D.air) return false;
    return true;
  }
  function findTarget(S, u) {
    let best = null, bd = 1e9;
    const D = u.D;
    for (const t of S.units) {
      if (t.s === u.s || !canHit(u, t)) continue;
      if (D.bo) {
        const a = aim(u, t), pd = pathLen(u, a.x, a.y);
        if (pd < bd) { bd = pd; best = t; }
      } else {
        const e = edge(u, t);
        if (e <= D.sight && e < bd) {
          if (D.mn && Math.hypot(u.x - t.x, u.y - t.y) < D.mn) continue;
          bd = e; best = t;
        }
      }
    }
    return best;
  }
  function objective(S, u) {
    let best = null, bd = 1e9;
    for (const t of S.units) {
      if (t.s === u.s || t.d || t.D.k !== 'w') continue;
      const a = aim(u, t), pd = pathLen(u, a.x, a.y);
      if (pd < bd) { bd = pd; best = t; }
    }
    return best;
  }
  let OB = [];
  function segHit(x0, y0, x1, y1, cx, cy, m) {
    const dx = x1 - x0, dy = y1 - y0;
    let t0 = 0, t1 = 1;
    if (Math.abs(dx) < 1e-9) { if (x0 <= cx - m || x0 >= cx + m) return false; }
    else { let a = (cx - m - x0) / dx, b = (cx + m - x0) / dx; if (a > b) { const q = a; a = b; b = q; } t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 >= t1) return false; }
    if (Math.abs(dy) < 1e-9) { if (y0 <= cy - m || y0 >= cy + m) return false; }
    else { let a = (cy - m - y0) / dy, b = (cy + m - y0) / dy; if (a > b) { const q = a; a = b; b = q; } t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 >= t1) return false; }
    return true;
  }
  function detour(u, w) {
    const r = u.D.rd;
    let bx = 0, by = 0, bl = 1e9;
    for (const t of OB) {
      if (t === u) continue;
      const m = t.D.hw + r + .12;
      if (Math.abs(w.x - t.x) < m && Math.abs(w.y - t.y) < m) continue;
      if (Math.abs(u.x - t.x) < m - .25 && Math.abs(u.y - t.y) < m - .25) continue;
      if (!segHit(u.x, u.y, w.x, w.y, t.x, t.y, m - .03)) continue;
      for (let i = 0; i < 4; i++) {
        const cx = t.x + (i & 1 ? m : -m), cy = t.y + (i & 2 ? m : -m);
        if (cx < r || cx > AW - r || cy < r || cy > AH - r) continue;
        const l = Math.hypot(cx - u.x, cy - u.y) + Math.hypot(w.x - cx, w.y - cy);
        if (l < bl) { bl = l; bx = cx; by = cy; }
      }
    }
    if (bl < 1e9) { w.x = bx; w.y = by; }
    return w;
  }
  function moveTo(u, gx, gy, dt) {
    const w = waypoint(u, gx, gy);
    if (!u.D.fl && !u.D.jump) detour(u, w);
    const dx = w.x - u.x, dy = w.y - u.y, d = Math.hypot(dx, dy);
    if (d < 1e-4) return 0;
    let sp = u.D.sp;
    if (u.D.ch && u.ch >= 3.5) sp *= 2;
    const st = Math.min(d, sp * dt);
    u.x += dx / d * st; u.y += dy / d * st;
    if (Math.abs(dx) > .02) u.fx = dx > 0 ? 1 : -1;
    u.w += st * 2.4;
    if (u.D.ch) u.ch += st;
    return st;
  }
  function hurt(S, u, dm) {
    if (u.d || dm <= 0) return;
    u.hp -= dm; u.hit = .14;
    if (u.key === 'kt') S.act[u.s] = 1;
  }
  function splash(S, side, x, y, r, dm, air, tf, o) {
    for (const t of S.units) {
      if (t.s === side || t.d || t.hp <= 0) continue;
      if (t.D.fl && !air) continue;
      let e;
      if (t.D.hw) e = Math.hypot(Math.max(Math.abs(x - t.x) - t.D.hw, 0), Math.max(Math.abs(y - t.y) - t.D.hw, 0));
      else e = Math.hypot(x - t.x, y - t.y) - t.D.rd;
      if (e > r) continue;
      hurt(S, t, t.D.k === 'w' ? Math.round(dm * tf) : dm);
      if (o) {
        if (o.stun && t.hp > 0) { t.stun = Math.max(t.stun, o.stun); t.cd = Math.max(t.cd, t.D.hs); t.ch = 0; }
        if (o.frz && t.hp > 0) { t.frz = Math.max(t.frz, o.frz); t.ch = 0; }
        if (o.kb && !t.D.b) knock(t, x, y, o.kb);
      }
    }
  }
  function knock(t, ox, oy, dist) {
    const f = clamp(1 - t.D.ms / 22, 0, 1);
    if (f <= 0) return;
    let dx = t.x - ox, dy = t.y - oy, d = Math.hypot(dx, dy);
    if (d < .05) { dx = 0; dy = t.s === 0 ? 1 : -1; d = 1; }
    const v = dist * f * 6;
    t.kx += dx / d * v; t.ky += dy / d * v;
  }
  function shoot(S, u, t) {
    const D = u.D;
    S.projs.push({ id: S.nid++, s: u.s, k: u.key, x: u.x, y: u.y, x0: u.x, y0: u.y, tx: t.x, ty: t.y, tg: t.id, sp: D.pj, dm: u.dm, sr: D.sr, air: D.air, home: D.ar ? 0 : 1, ar: D.ar || 0, t: 0, done: 0 });
  }
  function attack(S, u, t) {
    const D = u.D;
    let dm = u.dm;
    u.cd = D.hs; u.atk = .3;
    if (t.x !== u.x) u.fx = t.x > u.x ? 1 : -1;
    if (D.ch && u.ch >= 3.5) dm *= 2;
    u.ch = 0;
    if (D.kz) {
      splash(S, u.s, u.x, u.y, D.sr, dm, 1, 1, D.frz ? { frz: 1.1 } : null);
      S.ev.push(['x', u.x, u.y, D.sr, 'ice']);
      u.hp = 0; u.kzd = 1;
    } else if (D.pj) shoot(S, u, t);
    else if (D.sr) {
      splash(S, u.s, u.x, u.y, D.sr, dm, D.air, 1, null);
      S.ev.push(['x', u.x, u.y, D.sr, 'spin']);
    } else {
      hurt(S, t, dm);
      S.ev.push(['h', t.x, t.y, u.s]);
    }
  }
  function spawnMany(S, u, key, n) {
    const lv = u.lv;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, r = u.D.rd + .3;
      const x = clamp(u.x + Math.cos(a) * r, .6, AW - .6), y = u.y + Math.sin(a) * r;
      const c = mkUnit(S, key, u.s, x, y, lv);
      c.dep = .4;
      addUnit(S, c);
    }
  }
  function think(S, u, dt) {
    const D = u.D;
    u.cd = Math.max(0, u.cd - dt); u.atk = Math.max(0, u.atk - dt); u.hit = Math.max(0, u.hit - dt);
    if (u.life) {
      u.hp -= u.mhp / D.life * dt;
      if (u.hp <= 0) { u.life = -1; return; }
    }
    if (u.stun > 0) { u.stun -= dt; if (u.stun <= 0) u.cd = Math.max(u.cd, D.hs * .6); return; }
    if (u.frz > 0) { u.frz -= dt; if (u.frz <= 0) u.cd = Math.max(u.cd, D.hs * .6); return; }
    if (u.dep > 0) { u.dep -= dt; return; }
    if (D.spw) {
      u.sp -= dt;
      if (u.sp <= 0) { u.sp += D.spw[1]; spawnMany(S, u, D.spw[0], D.spw[2]); }
    }
    if (D.dmg <= 0) return;
    if (u.key === 'kt' && !S.act[u.s]) return;
    u.rt -= dt;
    let t = u.tg ? S.m.get(u.tg) : null;
    let ok = !!t && canHit(u, t);
    if (ok && !D.bo && edge(u, t) > D.sight + 1) ok = false;
    const inRange = ok && edge(u, t) <= D.rg + 1e-3 && (!D.mn || Math.hypot(u.x - t.x, u.y - t.y) >= D.mn);
    if (!ok || (!inRange && u.rt <= 0)) {
      const nt = findTarget(S, u);
      if (nt && nt.id !== u.tg) u.cd = Math.max(u.cd, D.hs * .35);
      t = nt; u.tg = t ? t.id : 0; u.rt = .2;
    }
    if (D.b) { if (t) attackIfReady(S, u, t); return; }
    if (t) {
      const e = edge(u, t);
      if (e <= D.rg + 1e-3) { if (t.x !== u.x) u.fx = t.x > u.x ? 1 : -1; attackIfReady(S, u, t); return; }
      const a = aim(u, t);
      moveTo(u, a.x, a.y, dt);
    } else {
      const o = objective(S, u);
      if (o) { const a = aim(u, o); moveTo(u, a.x, a.y, dt); }
    }
  }
  function attackIfReady(S, u, t) {
    const D = u.D;
    if (D.mn && Math.hypot(u.x - t.x, u.y - t.y) < D.mn) return;
    if (edge(u, t) > D.rg + 1e-3) { u.tg = 0; return; }
    if (u.cd <= 0) attack(S, u, t);
  }
  function impact(S, p, t) {
    if (p.sr) { splash(S, p.s, p.tx, p.ty, p.sr, p.dm, p.air, 1, null); S.ev.push(['x', p.tx, p.ty, p.sr, p.k === 'mortar' ? 'shell' : 'boom']); }
    else if (t && !t.d) { hurt(S, t, p.dm); S.ev.push(['h', p.tx, p.ty, p.s]); }
  }
  function detonate(S, p) {
    const D = DEF[p.key];
    if (p.key === 'poison') {
      S.zones.push({ id: S.nid++, s: p.s, x: p.tx, y: p.ty, r: D.rad, left: D.dur, tk: .25, dm: Math.round(p.dm * .5), tf: D.tf, t: 0, done: 0 });
      S.ev.push(['x', p.tx, p.ty, D.rad, 'gas']);
      return;
    }
    splash(S, p.s, p.tx, p.ty, D.rad, p.dm, 1, D.tf, { stun: D.stun || 0, kb: D.kb || 0 });
    S.ev.push(['x', p.tx, p.ty, D.rad, p.key]);
  }
  function castSpell(S, s, key, x, y) {
    const D = DEF[key], m = lm(lvOf(S, s, key)), dm = Math.round(D.dmg * m);
    if (key === 'log') {
      S.logs.push({ id: S.nid++, s, x, y, dir: s === 0 ? -1 : 1, trav: 0, len: D.len, dm, r: D.rad, hit: [], done: 0 });
      S.ev.push(['l', x, y, s]);
      return;
    }
    const kg = S.units.find(u => u.s === s && u.key === 'kt');
    const sx = kg ? kg.x : 9, sy = kg ? kg.y : (s === 0 ? 29 : 3);
    const d = Math.hypot(x - sx, y - sy);
    const dur = key === 'zap' ? .12 : key === 'fireball' ? .45 + d / 24 : key === 'arrows' ? .35 + d / 30 : .5 + d / 30;
    S.projs.push({ id: S.nid++, s, k: 'spell', key, x: sx, y: sy, x0: sx, y0: sy, tx: x, ty: y, dur, t: 0, dm, done: 0 });
    S.ev.push(['s', x, y, s, key, D.rad]);
  }
  function freeAt(S, x, y) {
    if (x < .5 || x > AW - .5 || y < .5 || y > AH - .5) return false;
    if (y > RV0 - .6 && y < RV1 + .6) return false;
    for (const t of S.units) if (t.D.hw && !t.d && Math.abs(x - t.x) < t.D.hw + .35 && Math.abs(y - t.y) < t.D.hw + .35) return false;
    return true;
  }
  function zoneOK(S, s, x, y) {
    if (x < .6 || x > AW - .6) return false;
    if (s === 0) {
      if (y > RV1 + .5 && y <= AH - .6) return true;
      const tw = S.units.find(u => u.s === 1 && u.ti === (x < 9 ? 0 : 1));
      return !!(tw && tw.d && y >= 9.6 && y < RV0 - .6);
    }
    if (y < RV0 - .5 && y >= .6) return true;
    const tw = S.units.find(u => u.s === 0 && u.ti === (x < 9 ? 0 : 1));
    return !!(tw && tw.d && y <= AH - 9.6 && y > RV1 + .6);
  }
  function placeOK(S, s, key, x, y) {
    const D = DEF[key];
    if (!isFinite(x) || !isFinite(y)) return null;
    if (D.k === 's') return { x: clamp(x, 0, AW), y: clamp(y, 0, AH) };
    if (!zoneOK(S, s, x, y) || !freeAt(S, x, y)) return null;
    if (D.k === 'b') for (const u of S.units) if (u.D.k === 'b' && !u.d && Math.hypot(u.x - x, u.y - y) < 1.7) return null;
    return { x, y };
  }
  function spawnCard(S, s, key, x, y) {
    const D = DEF[key];
    if (D.k === 's') { castSpell(S, s, key, x, y); return; }
    const lv = lvOf(S, s, key);
    if (D.k === 'b') { addUnit(S, mkUnit(S, key, s, x, y, lv)); S.ev.push(['d', x, y, s, key]); return; }
    for (let i = 0; i < D.cnt; i++) {
      const o = D.form ? D.form[i] : [0, 0];
      let px = clamp(x + o[0], .6, AW - .6), py = y + o[1] * (s === 0 ? 1 : -1);
      if (!freeAt(S, px, py)) { px = x; py = y; }
      addUnit(S, mkUnit(S, key, s, px, py, lv));
    }
    S.ev.push(['d', x, y, s, key]);
  }
  function play(S, s, slot, x, y) {
    if (S.over || S.intro > 0) return false;
    const h = S.hands[s], di = h.slots[slot];
    if (di == null) return false;
    const key = h.deck[di], D = DEF[key];
    if (S.el[s] < D.c - 1e-6) return false;
    const p = placeOK(S, s, key, x, y);
    if (!p) return false;
    S.el[s] -= D.c; S.spent[s] += D.c;
    h.slots[slot] = h.next; h.next = h.queue.shift(); h.queue.push(di);
    spawnCard(S, s, key, p.x, p.y);
    S.ev.push(['p', s, key]);
    return true;
  }
  function endMatch(S, win) {
    if (S.over) return;
    S.over = 1; S.win = win;
    S.ev.push(['end', win]);
  }
  function die(S, u) {
    u.d = 1;
    const D = u.D;
    if (D.k === 'w') {
      S.ev.push(['td', u.x, u.y, u.s, u.key]);
      if (u.key === 'kt') { S.cr[1 - u.s] = 3; S.ev.push(['cr', 1 - u.s, 3]); endMatch(S, S.cr[u.s] >= 3 ? 2 : 1 - u.s); }
      else { S.cr[1 - u.s]++; S.ev.push(['cr', 1 - u.s, S.cr[1 - u.s]]); }
      S.act[u.s] = 1;
      return;
    }
    S.ev.push(['k', u.x, u.y, u.s, u.key]);
    if (D.dth === 'golem') {
      for (let i = 0; i < 2; i++) { const c = mkUnit(S, 'golemite', u.s, clamp(u.x + (i ? .5 : -.5), .6, AW - .6), u.y, u.lv); c.dep = .2; addUnit(S, c); }
      splash(S, u.s, u.x, u.y, 2, Math.round(70 * lm(u.lv)), 0, 1, null);
      S.ev.push(['x', u.x, u.y, 2, 'boom']);
    } else if (D.dth === 'bomb') {
      splash(S, u.s, u.x, u.y, 3, Math.round(126 * lm(u.lv)), 0, 1, null);
      S.ev.push(['x', u.x, u.y, 3, 'boom']);
    } else if (D.dth === 'tomb') {
      for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + .6, c = mkUnit(S, 'skel1', u.s, clamp(u.x + Math.cos(a) * 1.1, .6, AW - .6), u.y + Math.sin(a) * 1.1, u.lv); c.dep = .3; addUnit(S, c); }
    }
  }
  function reap(S) {
    let any = false;
    for (const u of S.units) if (!u.d && u.hp <= 0) { die(S, u); any = true; }
    if (any) S.units = S.units.filter(u => { if (u.d && u.D.k !== 'w') { S.m.delete(u.id); return false; } return true; });
  }
  function resolve(S) {
    const us = S.units, n = us.length;
    for (let i = 0; i < n; i++) {
      const a = us[i];
      if (a.d || a.D.b) continue;
      for (let j = i + 1; j < n; j++) {
        const b = us[j];
        if (b.d || b.D.b || a.D.fl !== b.D.fl) continue;
        const dx = b.x - a.x, dy = b.y - a.y, m = a.D.rd + b.D.rd;
        if (Math.abs(dx) >= m || Math.abs(dy) >= m) continue;
        let d = Math.hypot(dx, dy);
        if (d >= m) continue;
        let nx, ny;
        if (d < 1e-4) { nx = Math.cos(a.id); ny = Math.sin(a.id); d = 0; } else { nx = dx / d; ny = dy / d; }
        const ov = (m - d) * .5, ta = a.D.ms + b.D.ms, wa = b.D.ms / ta, wb = a.D.ms / ta;
        const la = a.stun > 0 || a.dep > 0 && a.D.ms > 10 ? 0.15 : 1, lb = b.stun > 0 || b.dep > 0 && b.D.ms > 10 ? 0.15 : 1;
        a.x -= nx * ov * 2 * wa * la; a.y -= ny * ov * 2 * wa * la;
        b.x += nx * ov * 2 * wb * lb; b.y += ny * ov * 2 * wb * lb;
      }
    }
    for (const a of us) {
      if (a.d || a.D.b) continue;
      const r = a.D.rd;
      a.x = clamp(a.x, r, AW - r);
      a.y = clamp(a.y, r, AH - r);
      if (a.D.fl) continue;
      for (const t of us) {
        if (t === a || t.d || !t.D.b) continue;
        const hw = t.D.hw;
        if (hw) {
          const dx = a.x - t.x, dy = a.y - t.y, ox = hw + r - Math.abs(dx), oy = hw + r - Math.abs(dy);
          if (ox > 0 && oy > 0) { if (ox < oy) a.x += dx >= 0 ? ox : -ox; else a.y += dy >= 0 ? oy : -oy; }
        } else {
          const dx = a.x - t.x, dy = a.y - t.y, d = Math.hypot(dx, dy), m = t.D.rd + r;
          if (d < m) { if (d < 1e-4) a.y += 1; else { a.x = t.x + dx / d * m; a.y = t.y + dy / d * m; } }
        }
      }
      if (a.D.jump) continue;
      if (a.y > RV0 - r && a.y < RV1 + r) {
        if (a.y > RV0 && a.y < RV1) {
          const b = BRG[a.x < 9 ? 0 : 1];
          a.x = clamp(a.x, b[0] + r * .5, b[1] - r * .5);
        } else if (!inBridge(a.x, r * 2)) {
          a.y = a.y < 16 ? RV0 - r : RV1 + r;
        }
      }
    }
  }
  function step(S, dt) {
    if (S.over) return;
    if (S.intro > 0) { S.intro -= dt; return; }
    S.t += dt;
    S.left -= dt;
    if (S.per === 'reg') {
      S.mult = S.left <= 60 ? 2 : 1;
      if (S.left <= 0) {
        if (S.cr[0] !== S.cr[1]) endMatch(S, S.cr[0] > S.cr[1] ? 0 : 1);
        else { S.per = 'ot'; S.left = OVT; S.mult = 2; S.ev.push(['ot']); }
      }
    } else if (S.per === 'ot') {
      S.mult = 2;
      if (S.left <= 0) { S.per = 'tb'; S.left = 0; S.ev.push(['tb']); }
    } else {
      S.mult = 2;
      for (const u of S.units) if (u.D.k === 'w' && !u.d) u.hp -= 80 * lm(S.kl[u.s]) * dt;
    }
    for (let s = 0; s < 2; s++) S.el[s] = Math.min(10, S.el[s] + dt * S.mult / 2.8);
    for (let s = 0; s < 2; s++) if (S.bots[s]) S.bots[s].tick(S, dt);
    for (const u of S.units) { u.px = u.x; u.py = u.y; }
    OB = S.units.filter(b => b.D.b && b.D.hw && !b.d);
    const n = S.units.length;
    for (let i = 0; i < n; i++) { const u = S.units[i]; if (!u.d) think(S, u, dt); }
    for (const u of S.units) {
      if (u.d) continue;
      if (u.kx || u.ky) {
        u.x += u.kx * dt; u.y += u.ky * dt;
        const f = Math.max(0, 1 - 6 * dt);
        u.kx *= f; u.ky *= f;
        if (Math.abs(u.kx) < .05 && Math.abs(u.ky) < .05) { u.kx = 0; u.ky = 0; }
      }
    }
    for (const p of S.projs) {
      p.t += dt;
      if (p.k === 'spell') {
        const a = Math.min(1, p.t / p.dur);
        p.x = p.x0 + (p.tx - p.x0) * a; p.y = p.y0 + (p.ty - p.y0) * a;
        if (p.t >= p.dur) { p.done = 1; detonate(S, p); }
        continue;
      }
      let t = null;
      if (p.home && p.tg) { t = S.m.get(p.tg); if (t && !t.d) { p.tx = t.x; p.ty = t.y; } else t = null; }
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), st = p.sp * dt;
      const reach = t && t.D.hw ? t.D.hw * .8 : 0;
      if (d <= st + .05 + reach) { impact(S, p, t); p.done = 1; }
      else { p.x += dx / d * st; p.y += dy / d * st; }
    }
    S.projs = S.projs.filter(p => !p.done);
    for (const z of S.zones) {
      z.left -= dt; z.tk -= dt; z.t += dt;
      if (z.tk <= 0) { z.tk += .5; splash(S, z.s, z.x, z.y, z.r, z.dm, 1, z.tf, null); }
      if (z.left <= 0) z.done = 1;
    }
    S.zones = S.zones.filter(z => !z.done);
    for (const L of S.logs) {
      const st = 8 * dt;
      L.y += L.dir * st; L.trav += st;
      for (const u of S.units) {
        if (u.s === L.s || u.d || u.D.fl || L.hit.indexOf(u.id) >= 0) continue;
        const hw = u.D.hw || u.D.rd;
        if (Math.abs(u.x - L.x) - hw <= L.r && Math.abs(u.y - L.y) - hw <= .4) {
          L.hit.push(u.id);
          hurt(S, u, u.D.k === 'w' ? Math.round(L.dm * DEF.log.tf) : L.dm);
          if (!u.D.b) knock(u, u.x, L.y - L.dir, DEF.log.kb);
          S.ev.push(['h', u.x, u.y, L.s]);
        }
      }
      if (L.trav >= L.len) L.done = 1;
    }
    S.logs = S.logs.filter(L => !L.done);
    resolve(S);
    reap(S);
    if (!S.over && S.per !== 'reg' && S.cr[0] !== S.cr[1]) endMatch(S, S.cr[0] > S.cr[1] ? 0 : 1);
    if (!S.over && S.per === 'tb' && S.cr[0] === S.cr[1] && S.units.filter(u => u.D.k === 'w' && !u.d).length === 0) endMatch(S, 2);
  }

  const myBack = me => me === 0 ? 28.6 : AH - 28.6;
  function tryPlay(S, me, slot, x, y) {
    const offs = [[0, 0], [0, me === 0 ? -1 : 1], [1, 0], [-1, 0], [0, me === 0 ? 1 : -1], [1.5, 1], [-1.5, 1], [2, 0], [-2, 0]];
    for (const o of offs) if (play(S, me, slot, clamp(x + o[0], .8, AW - .8), y + o[1])) return true;
    return false;
  }
  function botThreats(S, B, df, me) {
    const lanes = [0, 1].map(i => ({ i, n: 0, ev: 0, air: 0, bo: 0, tank: 0, sw: 0, x: 0, y: me === 0 ? 99 : -1, deep: 0, hp: 0, ranged: 0 }));
    for (const u of S.units) {
      if (u.s === me || u.d || u.D.b) continue;
      const front = me === 0 ? u.y >= RV0 - 4 : u.y <= RV1 + 4;
      if (!front) continue;
      if (B.seen[u.id] == null) B.seen[u.id] = S.t;
      if (S.t - B.seen[u.id] < df.rt) continue;
      const L = lanes[u.x < 9 ? 0 : 1];
      L.n++; L.ev += elixVal(u.D); L.x += u.x; L.hp = Math.max(L.hp, u.hp);
      if (u.D.fl) L.air++;
      if (u.D.bo || u.D.jump) L.bo++;
      if (u.hp >= 1400) L.tank++;
      if (u.hp < 220) L.sw++;
      if (u.D.rg >= 4) L.ranged++;
      L.y = me === 0 ? Math.min(L.y, u.y) : Math.max(L.y, u.y);
      L.deep = Math.max(L.deep, me === 0 ? u.y - RV1 : RV0 - u.y);
    }
    lanes.forEach(L => { if (L.n) L.x /= L.n; });
    return lanes.filter(L => L.n);
  }
  function spellScore(S, me, c, cx, cy) {
    const D = c.D, dm = D.dmg * lm(lvOf(S, me, c.key)) * (D.dur || 1);
    let sc = 0;
    for (const u of S.units) {
      if (u.s === me || u.d) continue;
      if (u.D.hw) {
        const e = Math.hypot(Math.max(Math.abs(cx - u.x) - u.D.hw, 0), Math.max(Math.abs(cy - u.y) - u.D.hw, 0));
        if (e <= D.rad) sc += clamp(dm * D.tf / u.hp, 0, 1) * (u.hp <= dm * D.tf ? 3.5 : 1.2);
        continue;
      }
      if (u.D.k === 'b' && !D.dur) continue;
      if (Math.hypot(u.x - cx, u.y - cy) - u.D.rd > D.rad) continue;
      let k = clamp(dm / Math.max(1, u.hp), 0, 1);
      if (c.key === 'zap' && u.D.ch) k = Math.max(k, .6);
      sc += elixVal(u.D) * k;
    }
    return sc;
  }
  function botSpell(S, B, me, hand, el, df) {
    let best = null, bs = 0;
    const E = S.units.filter(u => u.s !== me && !u.d);
    for (const c of hand) {
      const D = c.D;
      if (D.k !== 's' || D.c > el + 1e-6) continue;
      const need = D.c * (.95 + df.err * 1.2);
      if (c.key === 'log') {
        for (const lx of [4, 14]) {
          const ly = me === 0 ? RV1 + 1 : RV0 - 1;
          let sc = 0;
          for (const u of E) {
            if (u.D.fl || u.D.hw || u.D.b) continue;
            if (Math.abs(u.x - lx) > 2.4 || (me === 0 ? u.y > ly : u.y < ly) || Math.abs(u.y - ly) > D.len) continue;
            sc += elixVal(u.D) * clamp(D.dmg * lm(lvOf(S, me, 'log')) / u.hp, 0, 1);
          }
          if (sc >= need && sc > bs) { bs = sc; best = { i: c.i, x: lx, y: ly }; }
        }
        continue;
      }
      for (const u of E) {
        const sc = spellScore(S, me, c, u.x, u.y);
        if (sc >= need && sc - D.c * .2 > bs) { bs = sc - D.c * .2; best = { i: c.i, x: u.x, y: u.y }; }
      }
    }
    return best;
  }
  function counterScore(c, L) {
    const D = c.D;
    if (D.k === 's') return -99;
    let sc = 0;
    const dps = D.dmg * D.cnt / D.hs, tough = D.hp * D.cnt;
    if (L.air) sc += D.air ? 3 : -7;
    if (L.bo) {
      if (D.k === 'b') sc += c.key === 'mortar' ? -6 : 5;
      else if (c.key === 'skeletons' || c.key === 'icespirit') sc += 3;
      else if (c.key === 'minipekka' || c.key === 'pekka') sc += 4;
      else sc += clamp(dps / 90, 0, 2.5);
      if (D.bo) sc -= 4;
    }
    if (L.tank) { sc += clamp(dps / 100, 0, 3); if (c.key === 'minipekka' || c.key === 'pekka') sc += 3; if (D.bo) sc -= 3; }
    if (L.sw) { if (D.sr) sc += 4; else if (D.cnt === 1 && D.hp > 600) sc += 1; }
    if (!L.bo && !L.tank && !L.sw) sc += clamp(dps / 100, 0, 2) + clamp(tough / 900, 0, 2);
    if (D.k === 'b' && !L.bo) sc -= 1.5;
    if (D.bo && !L.bo) sc -= 4;
    sc -= Math.max(0, D.c - L.ev - .8) * .9;
    return sc;
  }
  function counterPos(c, L, me) {
    const D = c.D;
    if (D.k === 'b') return { x: L.bo ? 9 + (L.x < 9 ? -.6 : .6) : clamp(L.x, 3, 15), y: me === 0 ? 21.4 : AH - 21.4 };
    if (D.rg >= 4) return { x: clamp(L.x + (L.x < 9 ? 1.2 : -1.2), 2, 16), y: me === 0 ? clamp(L.y + 5, 21.5, 26.5) : clamp(L.y - 5, AH - 26.5, AH - 21.5) };
    if (L.bo && D.cnt > 1) return { x: clamp(L.x, 2, 16), y: me === 0 ? clamp(L.y + 2.5, 19, 24) : clamp(L.y - 2.5, AH - 24, AH - 19) };
    return { x: clamp(L.x, 2, 16), y: me === 0 ? clamp(L.y + 3.5, 19, 23.5) : clamp(L.y - 3.5, AH - 23.5, AH - 19) };
  }
  function botTick(S, B, df, dt) {
    const me = B.side, op = 1 - me, di = DIFFS.indexOf(df);
    B.oe = Math.min(10, B.oe + dt * S.mult / 2.8);
    if (S.spent[op] > B.lastOp) { B.oe = Math.max(0, B.oe - (S.spent[op] - B.lastOp)); B.lastOp = S.spent[op]; }
    B.th -= dt;
    if (B.th > 0 || S.over || S.intro > 0) return;
    B.th = df.tk * rnd(.8, 1.25);
    const h = S.hands[me], el = S.el[me];
    const hand = h.slots.map((d, i) => ({ i, key: h.deck[d], D: DEF[h.deck[d]] }));
    const cheap = Math.min.apply(null, hand.map(c => c.D.c));
    if (el < cheap) return;
    const lanes = botThreats(S, B, df, me).sort((a, b) => b.ev - a.ev);
    const sp = botSpell(S, B, me, hand, el, df);
    if (sp && Math.random() > df.err * .5 && tryPlay(S, me, sp.i, sp.x, sp.y)) return;
    for (const L of lanes) {
      if (!(L.ev >= 2.4 || (L.ev >= 1 && L.deep > 3) || (L.n >= 3 && L.ev >= 1.4))) continue;
      if (Math.random() < df.err * .6) break;
      let best = null, bs = -50;
      for (const c of hand) {
        if (c.D.c > el + 1e-6) continue;
        const sc = counterScore(c, L) + rnd(0, .4);
        if (sc > bs) { bs = sc; best = c; }
      }
      if (best && bs > -1) {
        const p = counterPos(best, L, me);
        if (tryPlay(S, me, best.i, p.x, p.y)) { B.lastDef = S.t; return; }
      }
    }
    if (S.t < B.nextOpen) return;
    const pushEl = df.pe - (B.oe < el - 3 ? 1 : 0);
    if (el < pushEl && el < 9.7) return;
    if (S.t - B.lastPush < df.rt + 2 && el < 9.7) return;
    if (Math.random() < df.err * .5) return;
    let lane = B.lane;
    const twL = S.units.find(u => u.s === op && u.ti === 0), twR = S.units.find(u => u.s === op && u.ti === 1);
    if (Math.random() < .55 && twL && twR) lane = (twL.d ? 0 : twL.hp) < (twR.d ? 0 : twR.hp) ? 0 : 1;
    else if (Math.random() < .5) lane = 1 - lane;
    B.lane = lane;
    const lx = BRX[lane];
    const pushers = S.units.filter(u => u.s === me && !u.d && !u.D.b && (u.D.bo || u.hp >= 900) && (me === 0 ? u.y < 22 : u.y > AH - 22));
    const supp = hand.filter(c => c.D.k === 't' && !c.D.bo && c.D.c <= el && c.D.hp * c.D.cnt >= 100);
    if (pushers.length && supp.length) {
      const c = supp.slice().sort((a, b) => b.D.dmg * b.D.cnt - a.D.dmg * a.D.cnt)[0], u = pushers[0];
      if (tryPlay(S, me, c.i, clamp(u.x + rnd(-.8, .8), 1.5, 16.5), u.y + (me === 0 ? 3 : -3))) { B.lastPush = S.t; return; }
    }
    const tanks = hand.filter(c => c.D.k === 't' && (c.D.bo || c.D.hp >= 1500) && c.D.c <= el);
    if (tanks.length && el >= 6) {
      const c = tanks[0];
      const bridge = c.key === 'hog' && (B.oe < 6 || di === 3);
      if (tryPlay(S, me, c.i, lx, bridge ? (me === 0 ? RV1 + 1.4 : RV0 - 1.4) : myBack(me))) { B.lastPush = S.t; return; }
    }
    const trs = hand.filter(c => c.D.k !== 's' && c.D.c <= el && !(c.D.k === 'b' && c.key !== 'mortar' && c.key !== 'tomb')).sort((a, b) => b.D.c - a.D.c);
    for (const c of trs) {
      let x = lx, y = myBack(me);
      if (c.key === 'mortar') { x = 9; y = me === 0 ? 19 : AH - 19; }
      else if (c.key === 'tomb') { x = 9; y = me === 0 ? 18.6 : AH - 18.6; }
      else if (c.D.c <= 2 && di >= 2 && B.oe < el - 2) y = me === 0 ? RV1 + 1.4 : RV0 - 1.4;
      if (tryPlay(S, me, c.i, x, y)) { B.lastPush = S.t; return; }
    }
    if (el >= 9.7) {
      const any = hand.filter(c => c.D.c <= el && c.D.k !== 's').sort((a, b) => a.D.c - b.D.c)[0];
      if (any) tryPlay(S, me, any.i, lx, myBack(me));
    }
  }
  function makeBot(side, di) {
    const df = DIFFS[di];
    const B = { side, th: 1, seen: {}, oe: 5, lastOp: 0, nextOpen: 1.5 + df.rt * 1.4 + rnd(0, 2), lane: ri(0, 1), lastPush: -99, lastDef: -99 };
    B.tick = (S, dt) => botTick(S, B, df, dt);
    return B;
  }

  function el(g, x, y, rx, ry, f, o) {
    g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, TAU);
    if (f) { g.fillStyle = f; g.fill(); }
    if (o !== 0) { g.lineWidth = o || 1.4; g.strokeStyle = OUT; g.stroke(); }
  }
  function rr(g, x, y, w, h, r, f, o) {
    g.beginPath(); g.roundRect(x, y, w, h, r);
    if (f) { g.fillStyle = f; g.fill(); }
    if (o !== 0) { g.lineWidth = o || 1.4; g.strokeStyle = OUT; g.stroke(); }
  }
  function pl(g, pts, f, o) {
    g.beginPath();
    pts.forEach((p, i) => { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); });
    g.closePath();
    if (f) { g.fillStyle = f; g.fill(); }
    if (o !== 0) { g.lineWidth = o || 1.4; g.strokeStyle = OUT; g.lineJoin = 'round'; g.stroke(); }
  }
  function ln(g, x1, y1, x2, y2, c, w) {
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.stroke();
  }
  function arc(g, x, y, r, a0, a1, f, o) {
    g.beginPath(); g.arc(x, y, r, a0, a1); g.closePath();
    if (f) { g.fillStyle = f; g.fill(); }
    if (o !== 0) { g.lineWidth = o || 1.4; g.strokeStyle = OUT; g.stroke(); }
  }
  function eyes(g, x, y, sp, r, look) {
    for (const s of [-1, 1]) {
      el(g, x + s * sp, y, r, r * 1.25, '#fff', .8);
      el(g, x + s * sp + (look || 0) * .4, y + .3, r * .55, r * .8, '#1c1424', 0);
    }
  }
  function legs(g, a, c, w, h) {
    w = w || 5; h = h || 7;
    const lo = Math.sin(a.w) * 2;
    rr(g, -w - .5, -h + lo * .6, w, h - lo * .3, 2, c);
    rr(g, .5, -h - lo * .6, w, h + lo * .3, 2, c);
  }
  function head(g, x, y, r, sk) {
    el(g, x, y, r, r * .95, sk);
    eyes(g, x, y + .5, r * .38, r * .2);
    el(g, x - r * .62, y + r * .35, r * .18, r * .12, 'rgba(255,90,90,.35)', 0);
    el(g, x + r * .62, y + r * .35, r * .18, r * .12, 'rgba(255,90,90,.35)', 0);
  }
  function swing(g, a, x, y, r0, r1, fn) {
    g.save(); g.translate(x * a.f, y); g.scale(a.f, 1); g.rotate(r0 + (r1 - r0) * a.sw); fn(); g.restore();
  }
  const SKIN = '#f6c9a2';
  const PAINT = {};
  PAINT.knight = (g, a) => {
    const b = a.b;
    legs(g, a, '#4a3b56');
    swing(g, a, -11, -12 + b, 0, 0, () => { rr(g, -4, -8, 8, 13, 3, '#d9544a'); rr(g, -4, -8, 8, 3, 2, '#f1d16a'); });
    rr(g, -8, -20 + b, 16, 15, 5, '#7fa1e3');
    rr(g, -8, -9 + b, 16, 3, 1, '#7a4a22');
    rr(g, -2, -9 + b, 4, 3, 1, '#f1d16a', 1);
    el(g, -9.5, -18 + b, 4, 3.2, '#c4cde6'); el(g, 9.5, -18 + b, 4, 3.2, '#c4cde6');
    head(g, 0, -26 + b, 7.5, SKIN);
    g.beginPath(); g.arc(0, -27 + b, 8.4, Math.PI, 0); g.lineTo(8.4, -24 + b); g.lineTo(-8.4, -24 + b); g.closePath();
    g.fillStyle = '#c9d3ea'; g.fill(); g.lineWidth = 1.4; g.strokeStyle = OUT; g.stroke();
    rr(g, -1.2, -30 + b, 2.4, 7, 1, '#8f9bb9', 0.8);
    el(g, 0, -37 + b, 2.7, 5, '#e0413a');
    swing(g, a, 11, -13 + b, -.5, 1.9, () => { rr(g, -1.7, -21, 3.4, 21, 1.4, '#eef3fa'); rr(g, -5, -2.5, 10, 3.6, 1.5, '#d8aa2c'); rr(g, -1.6, 1, 3.2, 5, 1.5, '#7a4a22'); });
  };
  PAINT.archers = (g, a) => {
    const b = a.b;
    legs(g, a, '#5a4a36', 4, 6);
    rr(g, -6.5, -17 + b, 13, 12, 5, '#58b560');
    rr(g, -6.5, -9 + b, 13, 2.6, 1, '#7a4a22');
    head(g, 0, -23 + b, 6.8, SKIN);
    el(g, 0, -29 + b, 8, 4.2, '#e8527f');
    arc(g, 0, -27 + b, 7.4, Math.PI, 0, '#e8527f');
    el(g, -9 * a.f, -24 + b, 3, 6, '#e8527f', 1);
    swing(g, a, 9, -13 + b, 0, 0, () => {
      g.beginPath(); g.arc(0, 0, 10, -1.3 - a.sw * .2, 1.3 + a.sw * .2); g.lineWidth = 2.4; g.strokeStyle = '#8b5a2b'; g.stroke();
      ln(g, Math.cos(-1.3) * 10, Math.sin(-1.3) * 10, Math.cos(1.3) * 10, Math.sin(1.3) * 10, '#f5f0d0', .9);
      if (a.sw < .3) ln(g, -4, 0, 9, 0, '#e8dcc0', 1.3);
    });
  };
  PAINT.giant = (g, a) => {
    const b = a.b;
    legs(g, a, '#6b4a30', 8, 10);
    rr(g, -13, -33 + b, 26, 25, 9, '#d78a45');
    rr(g, -13, -16 + b, 26, 4, 1, '#7a4a22');
    rr(g, -11, -31 + b, 22, 8, 4, '#e9a763', 0);
    el(g, -15, -26 + b + a.sw * 3, 6, 8, '#f0b07a'); el(g, 15, -26 + b + a.sw * 3, 6, 8, '#f0b07a');
    rr(g, -17, -22 + b + a.sw * 3, 6, 6, 3, '#6b4a30'); rr(g, 11, -22 + b + a.sw * 3, 6, 6, 3, '#6b4a30');
    head(g, 0, -41 + b, 9, '#f0b07a');
    pl(g, [[-9, -46 + b], [9, -46 + b], [10, -50 + b], [4, -47 + b], [0, -52 + b], [-4, -47 + b], [-10, -50 + b]], '#7c3d18');
    el(g, 0, -33 + b, 6, 2.2, '#7c3d18', 0);
    el(g, 0, -34 + b, 3.4, 1.3, '#f0b07a', 0);
  };
  PAINT.musketeer = (g, a) => {
    const b = a.b;
    legs(g, a, '#4a3b56', 4.6, 7);
    rr(g, -7, -19 + b, 14, 13, 5, '#a2554f');
    rr(g, -7, -11 + b, 14, 2.6, 1, '#f1d16a');
    head(g, 0, -25 + b, 7, SKIN);
    el(g, 0, -29.5 + b, 11.5, 3.8, '#6a4a8d');
    rr(g, -6.4, -39 + b, 12.8, 10.5, 4, '#7d58a6');
    rr(g, -6.4, -32 + b, 12.8, 2.4, 0, '#f1d16a', .8);
    el(g, 0, -36 + b, 1, 1, '#fff', 0);
    el(g, -3.8, -22.5 + b, 3.2, 2, '#b04a2a', 0); el(g, 3.8, -22.5 + b, 3.2, 2, '#b04a2a', 0);
    swing(g, a, 8, -12 + b, -.1, -.35, () => { rr(g, -2, -5, 21, 3.6, 1.6, '#8b5a2b'); rr(g, 9, -6.4, 14, 2.8, 1.2, '#4d5566'); if (a.sw > .4) el(g, 25, -5, 3, 3, '#ffd24a', 0); });
  };
  PAINT.minipekka = (g, a) => {
    const b = a.b;
    legs(g, a, '#4d5a72', 5.6, 7);
    rr(g, -9, -21 + b, 18, 16, 6, '#5d79b6');
    rr(g, -6, -17 + b, 12, 6, 3, '#8aa6e4', 0);
    el(g, 0, -13 + b, 2, 2, '#ffd24a', 0);
    el(g, -10, -17 + b, 4, 4, '#4d5a72'); el(g, 10, -17 + b, 4, 4, '#4d5a72');
    el(g, 0, -28 + b, 8.5, 8, '#6a7fa8');
    pl(g, [[-3, -35 + b], [-8, -41 + b], [-1, -36 + b]], '#5d79b6'); pl(g, [[3, -35 + b], [8, -41 + b], [1, -36 + b]], '#5d79b6');
    rr(g, -6.5, -30 + b, 13, 4, 2, '#1c1424', 0);
    el(g, -3, -28 + b, 1.8, 1.4, '#7df0ff', 0); el(g, 3, -28 + b, 1.8, 1.4, '#7df0ff', 0);
    swing(g, a, 12, -14 + b, -.6, 2.1, () => { rr(g, -2.4, -22, 4.8, 22, 1.4, '#dfe6f2'); rr(g, -5, -1.8, 10, 3.6, 1.5, '#4d5a72'); });
  };
  PAINT.skel1 = (g, a) => {
    const b = a.b;
    const lo = Math.sin(a.w) * 1.6;
    rr(g, -3.4, -5 + lo * .3, 2, 5 - lo * .3, 1, '#e9e4d2', 1); rr(g, 1.4, -5 - lo * .3, 2, 5 + lo * .3, 1, '#e9e4d2', 1);
    rr(g, -4, -12 + b, 8, 8, 3, '#e9e4d2');
    for (let i = 0; i < 3; i++) ln(g, -3, -10.5 + i * 2.3 + b, 3, -10.5 + i * 2.3 + b, '#9a937c', .8);
    el(g, 0, -17 + b, 5.4, 5, '#f3efe0');
    el(g, -2, -17 + b, 1.5, 1.8, '#2a2035', 0); el(g, 2, -17 + b, 1.5, 1.8, '#2a2035', 0);
    rr(g, -2, -13.6 + b, 4, 1.6, 0, '#2a2035', 0);
    swing(g, a, 6, -9 + b, -.5, 1.8, () => { rr(g, -1, -10, 2, 10, 1, '#b9c3d6'); rr(g, -2.4, -.5, 4.8, 1.8, 1, '#7a4a22'); });
  };
  PAINT.skeletons = PAINT.skel1;
  PAINT.goblins = (g, a) => {
    const b = a.b;
    legs(g, a, '#5a7b34', 3.6, 5);
    rr(g, -5.5, -13 + b, 11, 9, 4, '#8a5a2b');
    pl(g, [[-7, -22 + b], [-12, -26 + b], [-7, -19 + b]], '#6fc04a'); pl(g, [[7, -22 + b], [12, -26 + b], [7, -19 + b]], '#6fc04a');
    el(g, 0, -20 + b, 7, 6.2, '#79cf52');
    eyes(g, 0, -20.5 + b, 2.6, 1.5, 0);
    pl(g, [[-1.4, -17 + b], [1.4, -17 + b], [0, -14 + b]], '#f5f0d0', .8);
    swing(g, a, 8, -9 + b, -.4, 1.9, () => { rr(g, -1, -9, 2, 9, 1, '#d7dde8'); rr(g, -2, -.5, 4, 2, 1, '#7a4a22'); });
  };
  PAINT.spears = (g, a) => {
    const b = a.b;
    legs(g, a, '#5a7b34', 3.6, 5);
    rr(g, -5.5, -13 + b, 11, 9, 4, '#4f8fcf');
    pl(g, [[-7, -22 + b], [-12, -26 + b], [-7, -19 + b]], '#6fc04a'); pl(g, [[7, -22 + b], [12, -26 + b], [7, -19 + b]], '#6fc04a');
    el(g, 0, -20 + b, 7, 6.2, '#79cf52');
    eyes(g, 0, -20.5 + b, 2.6, 1.5, 0);
    swing(g, a, 7, -10 + b, -1.2 + a.sw * .0, -.85, () => { rr(g, -.9, -17, 1.8, 20, 1, '#9b6a33', .8); pl(g, [[0, -22], [-2, -16.5], [2, -16.5]], '#e8eef8', .8); });
  };
  PAINT.minions = (g, a) => {
    const b = a.b + Math.sin(a.t * 9 + a.w) * 1.6;
    const fl = Math.sin(a.t * 22 + a.w) * .5;
    el(g, -9, -17 + b, 6.5, 4 + fl * 3, '#7c9fe0'); el(g, 9, -17 + b, 6.5, 4 - fl * 3, '#7c9fe0');
    el(g, 0, -15 + b, 6.5, 7, '#4c63a8');
    el(g, 0, -13 + b, 3.6, 4.4, '#7c8fd0', 0);
    el(g, 0, -22 + b, 6.4, 5.8, '#5b73c0');
    pl(g, [[-3.5, -26 + b], [-6, -32 + b], [-1, -27 + b]], '#4c63a8'); pl(g, [[3.5, -26 + b], [6, -32 + b], [1, -27 + b]], '#4c63a8');
    eyes(g, 0, -22.5 + b, 2.4, 1.5, 0);
    pl(g, [[-2, -18.8 + b], [2, -18.8 + b], [0, -16.6 + b]], '#f5f0d0', .7);
    ln(g, -2, -9 + b, -3, -4 + b + a.sw * 3, '#2a2035', 1.4); ln(g, 2, -9 + b, 3, -4 + b + a.sw * 3, '#2a2035', 1.4);
  };
  PAINT.dragon = (g, a) => {
    const b = a.b + Math.sin(a.t * 6 + a.w) * 2.2;
    const fl = Math.sin(a.t * 14 + a.w);
    pl(g, [[-6, -18 + b], [-22, -30 + b + fl * 4], [-19, -14 + b + fl * 2], [-6, -11 + b]], '#7ee0a0');
    pl(g, [[6, -18 + b], [22, -30 + b + fl * 4], [19, -14 + b + fl * 2], [6, -11 + b]], '#7ee0a0');
    pl(g, [[4, -8 + b], [14, -3 + b], [11, -9 + b], [15, -12 + b], [4, -11 + b]], '#4cb872');
    el(g, 0, -15 + b, 10, 9.5, '#4cb872');
    el(g, 0, -11 + b, 6.5, 6, '#c8f0a8', 0);
    el(g, 0, -26 + b, 8.5, 7.5, '#5fc982');
    pl(g, [[-5, -31 + b], [-7, -38 + b], [-2, -32 + b]], '#f1d16a'); pl(g, [[5, -31 + b], [7, -38 + b], [2, -32 + b]], '#f1d16a');
    eyes(g, 0, -27 + b, 3.2, 1.9, 0);
    el(g, 0, -22.5 + b, 3.6, 2.4, '#8de7aa'); el(g, -1.2, -22.5 + b, .6, .7, '#2a2035', 0); el(g, 1.2, -22.5 + b, .6, .7, '#2a2035', 0);
    if (a.sw > .2) el(g, 0, -17 + b, 5 * a.sw + 1, 3 * a.sw + 1, '#ffb03a', 0);
  };
  PAINT.valkyrie = (g, a) => {
    const b = a.b;
    legs(g, a, '#7a4a30', 4.6, 7);
    rr(g, -8, -20 + b, 16, 14, 6, '#e0733a');
    rr(g, -8, -10 + b, 16, 3, 1, '#7a4a22');
    pl(g, [[-8, -8 + b], [8, -8 + b], [10, -3 + b], [-10, -3 + b]], '#f09a52', 1);
    head(g, 0, -26 + b, 7.3, SKIN);
    arc(g, 0, -27 + b, 8.2, Math.PI, 0, '#ff9a2e');
    el(g, -8.5, -22 + b, 3.4, 8, '#ff9a2e'); el(g, 8.5, -22 + b, 3.4, 8, '#ff9a2e');
    g.save(); g.translate(0, -14 + b); g.rotate(a.sw * 6.28);
    rr(g, -15, -2, 30, 3.4, 1.6, '#8b5a2b');
    pl(g, [[10, -9], [18, -2], [10, 5], [13, -2]], '#dfe6f2'); pl(g, [[-10, -9], [-18, -2], [-10, 5], [-13, -2]], '#dfe6f2');
    g.restore();
  };
  PAINT.hog = (g, a) => {
    const b = a.b + Math.abs(Math.sin(a.w * 1.4)) * -1.4;
    const lo = Math.sin(a.w * 1.4) * 2;
    rr(g, -12, -7 + lo * .3, 4.4, 7 - lo * .3, 2, '#a8643a'); rr(g, 8, -7 - lo * .3, 4.4, 7 + lo * .3, 2, '#a8643a'); rr(g, -5, -7 - lo * .3, 4.4, 7 + lo * .3, 2, '#9a5a32'); rr(g, 2, -7 + lo * .3, 4.4, 7 - lo * .3, 2, '#9a5a32');
    el(g, 0, -13 + b, 15, 9, '#d58a55');
    el(g, 12, -15 + b, 6.5, 6.5, '#e29a66');
    el(g, 17, -14 + b, 3.4, 3, '#f2b68a'); el(g, 16, -14 + b, .7, .8, '#2a2035', 0); el(g, 18.2, -14 + b, .7, .8, '#2a2035', 0);
    pl(g, [[10, -20 + b], [13, -25 + b], [14, -19 + b]], '#e29a66');
    el(g, 11, -17.5 + b, 1.2, 1.4, '#2a2035', 0);
    pl(g, [[-15, -14 + b], [-19, -17 + b], [-16, -11 + b]], '#d58a55');
    rr(g, -4, -23 + b, 9, 11, 4, '#4f6fc4');
    head(g, 1, -29 + b, 6, SKIN);
    el(g, 1, -33 + b, 7.4, 3.4, '#5a3a22');
    rr(g, -4, -36 + b, 10, 4.2, 2, '#5a3a22');
    swing(g, a, 8, -19 + b, -.4, 1.6, () => { rr(g, -1.6, -17, 3.2, 17, 1.4, '#8b5a2b'); rr(g, -4, -23, 8, 7, 3, '#b9c3d6'); });
  };
  PAINT.wizard = (g, a) => {
    const b = a.b;
    legs(g, a, '#4a3b56', 4.4, 6);
    pl(g, [[-7.5, -4 + b], [7.5, -4 + b], [5.5, -19 + b], [-5.5, -19 + b]], '#8a4fd0');
    rr(g, -6, -12 + b, 12, 2.4, 1, '#f1d16a', 1);
    head(g, 0, -24 + b, 6.8, SKIN);
    el(g, 0, -17.2 + b, 4.4, 4, '#f4f0f0', 1);
    el(g, 0, -29 + b, 10.5, 3.2, '#6b37b3');
    pl(g, [[-7, -29 + b], [0, -46 + b], [7, -29 + b]], '#8a4fd0');
    el(g, 0, -31 + b, 7, 1.7, '#f1d16a', 0);
    swing(g, a, 9, -12 + b, -.2, -.7, () => { rr(g, -1.3, -18, 2.6, 22, 1.2, '#8b5a2b'); el(g, 0, -20, 3.8, 3.8, '#ff6a3a'); el(g, 0, -20, 1.6, 1.6, '#ffe08a', 0); });
  };
  PAINT.bomber = (g, a) => {
    const b = a.b;
    legs(g, a, '#4a3b56', 4.6, 6);
    rr(g, -7, -18 + b, 14, 12, 5, '#6f8ed8');
    head(g, 0, -24 + b, 7, '#9be0e0');
    rr(g, -7.5, -31 + b, 15, 6, 3, '#3a4a6e');
    el(g, 0, -29 + b, 5, 1.6, '#ffd24a', 0);
    swing(g, a, 9, -14 + b, 0, -1.2, () => { el(g, 0, -4, 5.4, 5.4, '#2a2540'); el(g, -1.6, -5.4, 1.5, 1.5, 'rgba(255,255,255,.5)', 0); ln(g, 0, -9.4, 2, -12.4, '#c9a227', 1.2); el(g, 2.4, -13, 1.6 + Math.sin(a.t * 30), 1.6, '#ffb03a', 0); });
  };
  PAINT.prince = (g, a) => {
    const b = a.b;
    pl(g, [[-9, -18 + b], [9, -18 + b], [13, -2], [-13, -2]], '#c33f4c');
    legs(g, a, '#4a3b56', 5, 7);
    rr(g, -8.5, -21 + b, 17, 15, 6, '#e6c057');
    rr(g, -8.5, -10 + b, 17, 3, 1, '#7a4a22');
    el(g, -10, -19 + b, 4.2, 3.4, '#f3dc8a'); el(g, 10, -19 + b, 4.2, 3.4, '#f3dc8a');
    head(g, 0, -27 + b, 7.5, SKIN);
    g.beginPath(); g.arc(0, -28 + b, 8.4, Math.PI, 0); g.lineTo(8.4, -25 + b); g.lineTo(-8.4, -25 + b); g.closePath(); g.fillStyle = '#e6c057'; g.fill(); g.lineWidth = 1.4; g.strokeStyle = OUT; g.stroke();
    pl(g, [[-6, -35 + b], [-4, -42 + b], [0, -36 + b], [4, -42 + b], [6, -35 + b]], '#f3dc8a');
    el(g, 0, -37 + b, 1.4, 1.4, '#e0413a', 0);
    swing(g, a, 12, -16 + b, -.2, -1.2, () => { rr(g, -1, -33, 2, 34, 1, '#8b5a2b'); pl(g, [[0, -41], [-3, -32], [3, -32]], '#eef3fa'); });
  };
  PAINT.pekka = (g, a) => {
    const b = a.b;
    legs(g, a, '#3a4256', 7, 9);
    rr(g, -14, -31 + b, 28, 24, 8, '#4a5a82');
    rr(g, -11, -27 + b, 22, 9, 4, '#6a7fb2', 0);
    rr(g, -14, -14 + b, 28, 4, 1, '#c9a227');
    el(g, 0, -22 + b, 3, 3, '#7df0ff', 0);
    el(g, -16, -25 + b, 6, 6, '#3a4256'); el(g, 16, -25 + b, 6, 6, '#3a4256');
    el(g, 0, -39 + b, 10.5, 9.5, '#59688f');
    pl(g, [[-5, -47 + b], [-12, -56 + b], [-2, -48 + b]], '#4a5a82'); pl(g, [[5, -47 + b], [12, -56 + b], [2, -48 + b]], '#4a5a82');
    rr(g, -8, -41 + b, 16, 5, 2.4, '#1c1424', 0);
    el(g, -3.4, -38.5 + b, 2.3, 1.7, '#ff3a5a', 0); el(g, 3.4, -38.5 + b, 2.3, 1.7, '#ff3a5a', 0);
    swing(g, a, 17, -22 + b, -.5, 2, () => { rr(g, -3, -34, 6, 34, 2, '#dfe6f2'); rr(g, -7, -3, 14, 5, 2, '#3a4256'); });
  };
  PAINT.golem = (g, a) => {
    const b = a.b;
    rr(g, -12, -11, 10, 11, 3, '#6d6a74'); rr(g, 2, -11, 10, 11, 3, '#6d6a74');
    rr(g, -17, -41 + b, 34, 32, 9, '#8a8794');
    rr(g, -13, -37 + b, 14, 11, 4, '#9d9aa8', 0); rr(g, 3, -23 + b, 11, 9, 4, '#7a7784', 0);
    ln(g, -6, -18 + b, -2, -12 + b, '#5e5b68', 1.4); ln(g, 8, -37 + b, 11, -30 + b, '#5e5b68', 1.4);
    rr(g, -24, -35 + b + a.sw * 4, 9, 20, 4, '#7a7784'); rr(g, 15, -35 + b + a.sw * 4, 9, 20, 4, '#7a7784');
    rr(g, -9, -53 + b, 18, 14, 5, '#9d9aa8');
    rr(g, -7, -49 + b, 14, 4, 2, '#1c1424', 0);
    el(g, -3, -47 + b, 1.8, 1.4, '#ffb03a', 0); el(g, 3, -47 + b, 1.8, 1.4, '#ffb03a', 0);
    el(g, 0, -28 + b, 4, 4, '#ffb03a', 0); el(g, 0, -28 + b, 2, 2, '#fff1b0', 0);
  };
  PAINT.golemite = (g, a) => {
    g.save(); g.scale(.55, .55); PAINT.golem(g, a); g.restore();
  };
  PAINT.barbarians = (g, a) => {
    const b = a.b;
    legs(g, a, '#5a4a36', 4.6, 7);
    rr(g, -7, -19 + b, 14, 13, 5, '#d9a043');
    rr(g, -7, -9 + b, 14, 2.6, 1, '#7a4a22');
    head(g, 0, -25 + b, 7, SKIN);
    arc(g, 0, -26 + b, 8, Math.PI, 0, '#f2cf52');
    pl(g, [[-7.8, -27 + b], [-13, -33 + b], [-6, -30 + b]], '#f5f0d0'); pl(g, [[7.8, -27 + b], [13, -33 + b], [6, -30 + b]], '#f5f0d0');
    pl(g, [[-5, -21 + b], [5, -21 + b], [3, -17 + b], [-3, -17 + b]], '#e0a03a', .8);
    swing(g, a, 10, -13 + b, -.5, 1.9, () => { rr(g, -1.5, -15, 3, 15, 1.4, '#9b6a33'); rr(g, -3.4, -19, 6.8, 6, 2.5, '#dfe6f2'); });
  };
  PAINT.balloon = (g, a) => {
    const b = a.b + Math.sin(a.t * 3 + a.w) * 2;
    rr(g, -7, -9 + b, 14, 9, 3, '#8b5a2b');
    for (let i = 0; i < 4; i++) ln(g, -6 + i * 4, -9 + b, -9 + i * 6, -22 + b, '#5a3a22', 1);
    el(g, 0, -32 + b, 14, 15, '#e7473f');
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.ellipse(i * 6, -32 + b, 3.4, 14.4, 0, 0, TAU); g.strokeStyle = '#f7d36a'; g.lineWidth = 2.6; g.stroke(); }
    el(g, 0, -32 + b, 14, 15, null, 1.4);
    el(g, -5, -39 + b, 3.2, 4.5, 'rgba(255,255,255,.35)', 0);
    el(g, 0, -6 + b, 5, 4, '#6a6a7a');
    el(g, -2, -9 + b, 1.2, 1.2, '#fff', 0); el(g, 2, -9 + b, 1.2, 1.2, '#fff', 0);
  };
  PAINT.witch = (g, a) => {
    const b = a.b;
    pl(g, [[-8, -3 + b], [8, -3 + b], [6, -19 + b], [-6, -19 + b]], '#5a3a9a');
    rr(g, -6, -12 + b, 12, 2.4, 1, '#38c9a4', 1);
    head(g, 0, -25 + b, 6.8, '#e7d0f0');
    el(g, 0, -29 + b, 11, 3.2, '#2a2540');
    pl(g, [[-6.5, -29 + b], [3, -42 + b], [6.5, -29 + b]], '#3a2f6e');
    rr(g, -6.5, -32 + b, 13, 2.2, 0, '#38c9a4', .8);
    el(g, -8, -21 + b, 3, 7, '#2a2540'); el(g, 8, -21 + b, 3, 7, '#2a2540');
    swing(g, a, 9, -12 + b, -.2, -.8, () => { rr(g, -1.2, -17, 2.4, 22, 1.2, '#5a3a22'); el(g, 0, -19, 3.4, 3.4, '#8cf0c0'); el(g, 0, -19, 1.4, 1.4, '#fff', 0); });
  };
  PAINT.icespirit = (g, a) => {
    const b = a.b + Math.sin(a.t * 8 + a.w) * 1.2;
    pl(g, [[-6, -8 + b], [0, 0 + b], [6, -8 + b], [0, -4 + b]], '#bfeaff', 0);
    el(g, 0, -13 + b, 8.5, 9.5, '#9fe0ff');
    el(g, -2.5, -17 + b, 3, 4, 'rgba(255,255,255,.55)', 0);
    pl(g, [[-3, -21 + b], [0, -29 + b], [3, -21 + b]], '#d6f4ff');
    pl(g, [[-7, -17 + b], [-13, -21 + b], [-8, -13 + b]], '#bfeaff'); pl(g, [[7, -17 + b], [13, -21 + b], [8, -13 + b]], '#bfeaff');
    eyes(g, 0, -13 + b, 2.8, 1.6, 0);
    el(g, 0, -8.5 + b, 1.8, 1.2, '#2a2035', 0);
  };
  PAINT.cannon = (g, a) => {
    el(g, 0, -2, 16, 6, '#6b6470');
    rr(g, -14, -12, 28, 12, 5, '#8a8394');
    el(g, -10, -2, 5, 5, '#4a3b56'); el(g, 10, -2, 5, 5, '#4a3b56');
    el(g, -10, -2, 2, 2, '#c9a227', 0); el(g, 10, -2, 2, 2, '#c9a227', 0);
    g.save(); g.translate(0, -14); g.rotate(a.ang || 0);
    rr(g, -4 - a.sw * 3, -9, 8, 22, 3, '#4d5566');
    rr(g, -5.5 - a.sw * 3, 9, 11, 4, 2, '#3a4256');
    g.restore();
    el(g, 0, -14, 7, 6, '#6b6470');
    el(g, 0, -14, 2.6, 2.6, '#c9a227', 0);
  };
  PAINT.tesla = (g, a) => {
    el(g, 0, -1, 14, 5, '#6b6470');
    rr(g, -10, -8, 20, 8, 3, '#8a8394');
    rr(g, -7, -26, 14, 20, 4, '#5e7ca8');
    rr(g, -7, -20, 14, 3, 0, '#f1d16a', 1);
    rr(g, -9, -30, 18, 6, 3, '#4d5566');
    const ch = .5 + .5 * Math.sin(a.t * 12);
    el(g, 0, -35, 5 + ch, 5 + ch, '#7df0ff'); el(g, 0, -35, 2.4, 2.4, '#fff', 0);
    ln(g, -5, -30, -7, -38, '#7df0ff', 1.4); ln(g, 5, -30, 7, -38, '#7df0ff', 1.4);
  };
  PAINT.mortar = (g, a) => {
    el(g, 0, -2, 16, 6, '#6b6470');
    rr(g, -13, -9, 26, 9, 4, '#8a8394');
    g.save(); g.translate(0, -10); g.rotate(-.35);
    pl(g, [[-7, 4], [7, 4], [10, -18], [-10, -18]], '#6a7388');
    rr(g, -11, -22, 22, 6, 3, '#4d5566');
    el(g, 0, -20, 6, 2.2, '#1c1424', 0);
    g.restore();
    el(g, -8, -3, 4, 4, '#4a3b56'); el(g, 8, -3, 4, 4, '#4a3b56');
  };
  PAINT.tomb = (g, a) => {
    el(g, 0, -1, 15, 5, '#5c5864');
    rr(g, -12, -9, 24, 9, 3, '#7c7a86');
    g.beginPath(); g.moveTo(-9, -9); g.lineTo(-9, -26); g.arc(0, -26, 9, Math.PI, 0); g.lineTo(9, -9); g.closePath();
    g.fillStyle = '#a3a1b0'; g.fill(); g.lineWidth = 1.4; g.strokeStyle = OUT; g.stroke();
    rr(g, -1.4, -26, 2.8, 12, 1, '#6a6876', 0); rr(g, -5, -22, 10, 2.8, 1, '#6a6876', 0);
    el(g, -9, -3, 3, 2, '#4f8f3a', 0); el(g, 10, -4, 2.4, 1.6, '#4f8f3a', 0);
  };
  const SPELLP = {};
  SPELLP.fireball = (g, a) => {
    for (let i = 0; i < 5; i++) { const t = i / 5; el(g, -t * 12, t * 12, 9 - t * 6, 9 - t * 6, `rgba(255,${150 - i * 24},40,${.5 - t * .4})`, 0); }
    el(g, 0, 0, 12, 12, '#ff7a1c');
    el(g, 0, 0, 8, 8, '#ffb02e', 0);
    el(g, -1, -1, 4, 4, '#fff1a8', 0);
    for (let i = 0; i < 4; i++) { const an = a.t * 6 + i * 1.57; pl(g, [[Math.cos(an) * 10, Math.sin(an) * 10], [Math.cos(an + .3) * 17, Math.sin(an + .3) * 17], [Math.cos(an + .6) * 10, Math.sin(an + .6) * 10]], '#ff9a2e', 0); }
  };
  SPELLP.arrows = (g) => {
    for (const [x, y, r] of [[-9, 6, -.5], [0, 0, -.35], [9, -5, -.2], [-3, 10, -.4], [7, 5, -.3]]) {
      g.save(); g.translate(x, y); g.rotate(r + .5);
      ln(g, -2, 12, 0, -10, '#8b5a2b', 2); pl(g, [[0, -16], [-3.4, -8], [3.4, -8]], '#dfe6f2', 1);
      pl(g, [[-1, 10], [-5, 15], [-1, 13]], '#e8527f', .8); pl(g, [[-1, 10], [3, 15], [-1, 13]], '#e8527f', .8);
      g.restore();
    }
  };
  SPELLP.zap = (g) => {
    el(g, 0, 0, 15, 15, 'rgba(125,240,255,.35)', 0);
    pl(g, [[3, -17], [-8, 2], [-1, 2], [-4, 17], [9, -4], [2, -4], [8, -17]], '#ffe35a', 1.6);
  };
  SPELLP.poison = (g) => {
    for (const [x, y, r] of [[-7, 3, 9], [6, 4, 8], [0, -6, 10], [-1, 8, 7]]) el(g, x, y, r, r * .85, 'rgba(120,214,70,.9)');
    el(g, -3, -8, 2.4, 2.4, 'rgba(255,255,255,.5)', 0);
    el(g, 5, -2, 3, 3, '#2a8a2a', 0); el(g, -7, 4, 2, 2, '#2a8a2a', 0);
    rr(g, -4, -17, 8, 8, 2, '#d9f7b8', 1.2); rr(g, -5, -19, 10, 3, 1, '#7a4a22', 1.2);
  };
  SPELLP.log = (g) => {
    g.save(); g.rotate(-.35);
    rr(g, -20, -6, 40, 12, 6, '#a96a34');
    el(g, 20, 0, 4, 6, '#d8a566'); el(g, 20, 0, 2, 3.4, '#a96a34', .8);
    ln(g, -14, -2, 10, -3, '#7a4620', 1.2); ln(g, -10, 3, 14, 3, '#7a4620', 1.2);
    g.restore();
  };
  function drawUnitArt(g, key, x, y, s, a) {
    const D = DEF[key];
    g.save(); g.translate(x, y); g.scale(s, s);
    if (D.k === 's') SPELLP[key](g, a);
    else {
      const sz = a.sz || 1;
      const ps = D.fl ? [[0, -6]] : [[0, 0]];
      if (!a.single && D.cnt > 1) {
        const fm = D.form;
        g.save();
        const order = fm.map((f, i) => i).sort((p, q) => fm[p][1] - fm[q][1]);
        for (const i of order) {
          g.save(); g.translate(fm[i][0] * 17 * .9, fm[i][1] * 17 * .55 + (D.fl ? -4 : 0)); (PAINT[key])(g, a); g.restore();
        }
        g.restore();
      } else (PAINT[key])(g, a);
    }
    g.restore();
  }
  const ART = {};
  function portrait(key, w, h) {
    const id = key + w;
    if (ART[id]) return ART[id];
    const dpr = 2, c = document.createElement('canvas');
    c.width = w * dpr; c.height = h * dpr;
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    const D = DEF[key], R = RAR[D.r];
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, R.col); gr.addColorStop(1, R.col2);
    g.fillStyle = gr; g.beginPath(); g.roundRect(0, 0, w, h, 9); g.fill();
    const rg = g.createRadialGradient(w / 2, h * .55, 2, w / 2, h * .55, w * .62);
    rg.addColorStop(0, 'rgba(255,255,255,.55)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
    const sc = D.k === 's' ? w / 52 : D.k === 'b' ? w / 48 : (D.cnt > 1 ? w / 66 : D.rd > .6 ? w / 80 : w / 50);
    const oy = D.k === 's' ? h * .5 : D.k === 'b' ? h * .78 : D.fl ? h * .72 : h * .8;
    drawUnitArt(g, key, w / 2, oy, sc * (D.rd > .6 && D.k === 't' ? 1 : 1), { b: 0, f: 1, sw: 0, w: 0, t: 0, s: 0, sz: 1 });
    g.lineWidth = 2; g.strokeStyle = 'rgba(30,20,50,.85)'; g.beginPath(); g.roundRect(1, 1, w - 2, h - 2, 9); g.stroke();
    ART[id] = c;
    return c;
  }
  function dropIcon(g, x, y, r) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.moveTo(0, -r * 1.25); g.bezierCurveTo(r * .9, -r * .2, r * 1.0, r * .5, 0, r); g.bezierCurveTo(-r * 1.0, r * .5, -r * .9, -r * .2, 0, -r * 1.25);
    const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#e75cff'); gr.addColorStop(1, '#a31fd0');
    g.fillStyle = gr; g.fill(); g.lineWidth = 1.4; g.strokeStyle = '#3d0a52'; g.stroke();
    el(g, -r * .3, -r * .2, r * .22, r * .34, 'rgba(255,255,255,.65)', 0);
    g.restore();
  }

  let FL = 0;
  const SX = x => (FL ? AW - x : x) * T;
  const SY = y => AY + (FL ? AH - y : y) * T;
  const BLUE = '#3d8bff', RED = '#ff4d55';
  function seeded(n) { let s = n | 0 || 1; return () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) % 10000) / 10000; }; }
  function txt(g, s, x, y, size, col, al, st) {
    g.font = `900 ${size}px ${FONT}`; g.textAlign = al || 'center'; g.textBaseline = 'middle';
    if (st) { g.lineWidth = Math.max(2, size * .22); g.strokeStyle = st; g.lineJoin = 'round'; g.strokeText(s, x, y); }
    g.fillStyle = col; g.fillText(s, x, y);
  }
  function crownIcon(g, x, y, s, on) {
    g.save(); g.translate(x, y); g.scale(s, s);
    pl(g, [[-9, 6], [-10, -5], [-4, 0], [0, -8], [4, 0], [10, -5], [9, 6]], on ? '#ffd23a' : 'rgba(255,255,255,.18)', on ? 1.4 : 0);
    if (on) { rr(g, -9, 4, 18, 3.4, 1.2, '#ff9a1c', 1); el(g, 0, -9, 1.8, 1.8, '#ff4d55', .8); }
    g.restore();
  }
  function buildArena(th) {
    const P = THEMES[th], sc = 2, c = document.createElement('canvas');
    c.width = W * sc; c.height = AH * T * sc;
    const g = c.getContext('2d');
    g.scale(sc, sc);
    const rnd2 = seeded(7);
    for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) { g.fillStyle = (x + y) % 2 ? P.g1 : P.g2; g.fillRect(x * T, y * T, T, T); }
    const pathR = (x, y, w, h) => { g.fillStyle = P.path; g.beginPath(); g.roundRect(x * T, y * T, w * T, h * T, 10); g.fill(); };
    const half = (flip) => {
      g.save();
      if (flip) { g.translate(W, AH * T); g.rotate(Math.PI); }
      pathR(2.5, 17.3, 3, 7);
      pathR(12.5, 17.3, 3, 7);
      pathR(2.5, 23.5, 13, 3);
      pathR(7, 25.5, 4, 5.5);
      g.restore();
    };
    half(0); half(1);
    const bank = (y0, y1) => { g.fillStyle = P.dk; g.fillRect(0, y0 * T, W, (y1 - y0) * T); };
    bank(14.55, 15); bank(17, 17.45);
    const gr = g.createLinearGradient(0, RV0 * T, 0, RV1 * T);
    gr.addColorStop(0, P.riv); gr.addColorStop(.5, P.riv2); gr.addColorStop(1, P.riv);
    g.fillStyle = gr; g.fillRect(0, RV0 * T, W, 2 * T);
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.4;
    for (let i = 0; i < 26; i++) { const x = rnd2() * W, y = (RV0 + .25 + rnd2() * 1.5) * T; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y - 3, x + 12, y); g.stroke(); }
    for (const [b0, b1] of BRG) {
      const x = b0 * T, w = (b1 - b0) * T, y = 14.6 * T, h = 2.8 * T;
      g.fillStyle = 'rgba(0,40,80,.28)'; g.fillRect(x + 3, y + 5, w, h);
      g.fillStyle = '#b98147'; g.fillRect(x, y, w, h);
      for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#c48c50' : '#ad7740'; g.fillRect(x, y + i * h / 12, w, h / 12); }
      g.strokeStyle = '#6b4220'; g.lineWidth = 1.2;
      for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(x, y + i * h / 12); g.lineTo(x + w, y + i * h / 12); g.stroke(); }
      for (const xx of [x - 4, x + w - 2]) { g.fillStyle = '#7a4a22'; g.fillRect(xx, y - 3, 6, h + 6); g.fillStyle = '#9b6330'; g.fillRect(xx, y - 3, 6, 4); g.fillRect(xx, y + h - 1, 6, 4); }
    }
    const plat = (cx, cy, s) => {
      g.save(); g.translate(cx * T, cy * T);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.roundRect(-s * T / 2 - 4, -s * T / 2 - 2, s * T + 8, s * T + 10, 12); g.fill();
      g.fillStyle = P.plat; g.beginPath(); g.roundRect(-s * T / 2, -s * T / 2, s * T, s * T, 10); g.fill();
      g.strokeStyle = P.plat2; g.lineWidth = 1.4;
      const n = Math.round(s);
      for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(-s * T / 2 + i * T, -s * T / 2); g.lineTo(-s * T / 2 + i * T, s * T / 2); g.stroke(); g.beginPath(); g.moveTo(-s * T / 2, -s * T / 2 + i * T); g.lineTo(s * T / 2, -s * T / 2 + i * T); g.stroke(); }
      g.restore();
    };
    for (const [x, y, s] of [[3.5, 25.5, 4], [14.5, 25.5, 4], [9, 29.4, 6], [3.5, 6.5, 4], [14.5, 6.5, 4], [9, 2.6, 6]]) plat(x, y, s);
    const deco = (flip) => {
      g.save();
      if (flip) { g.translate(W, AH * T); g.rotate(Math.PI); }
      const rd = seeded(flip ? 99 : 99);
      for (let i = 0; i < 46; i++) {
        const x = rd() * AW, y = 17.8 + rd() * 14;
        if ((x > 2 && x < 6 && y < 25) || (x > 12 && x < 16 && y < 25) || (y > 22 && y < 27 && x > 2 && x < 16) || (x > 6.5 && x < 11.5 && y > 24)) continue;
        g.fillStyle = ['#fff', '#ffe36b', '#ff9ec7', '#c7a8ff'][i % 4];
        g.beginPath(); g.arc(x * T, y * T, 1.8, 0, TAU); g.fill();
        g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x * T - .5, y * T + 2, 1, 3);
      }
      for (const [x, y, r] of [[.6, 19.5, 18], [17.4, 21, 20], [.5, 27.2, 16], [17.5, 30, 15], [.4, 23.8, 14], [17.6, 25.4, 12]]) {
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x * T + 3, y * T + 12, r, r * .5, 0, 0, TAU); g.fill();
        g.fillStyle = '#6b4a2a'; g.fillRect(x * T - 2, y * T, 4, 12);
        g.fillStyle = P.deco; g.beginPath(); g.arc(x * T, y * T - 2, r, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(x * T - r * .3, y * T - r * .4, r * .45, 0, TAU); g.fill();
        g.lineWidth = 1.4; g.strokeStyle = 'rgba(30,20,50,.55)'; g.beginPath(); g.arc(x * T, y * T - 2, r, 0, TAU); g.stroke();
      }
      for (const [x, y] of [[6.2, 20.6], [11.8, 21.2], [1.4, 25.6], [16.4, 28.4], [8, 31.2]]) {
        g.fillStyle = '#9a9aa6'; g.beginPath(); g.ellipse(x * T, y * T, 9, 6, 0, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(x * T - 2, y * T - 2, 4, 2.4, 0, 0, TAU); g.fill();
        g.lineWidth = 1.2; g.strokeStyle = 'rgba(30,20,50,.5)'; g.beginPath(); g.ellipse(x * T, y * T, 9, 6, 0, 0, TAU); g.stroke();
      }
      g.restore();
    };
    deco(0); deco(1);
    g.strokeStyle = 'rgba(20,30,10,.55)'; g.lineWidth = 3; g.strokeRect(0, 0, W, AH * T);
    return c;
  }
  function drawRubble(g, u, o) {
    g.save();
    g.translate(SX(u.x), SY(u.y));
    const k = u.key === 'kt' ? 1.25 : 1;
    g.scale(k, k);
    el(g, 0, 4, 30, 15, 'rgba(40,30,30,.55)', 0);
    const rd = seeded(u.id * 31);
    for (let i = 0; i < 9; i++) { const x = (rd() - .5) * 46, y = (rd() - .5) * 20; rr(g, x - 7, y - 5, 12 + rd() * 6, 9 + rd() * 4, 3, ['#8a8594', '#706b7c', '#a29cb0'][i % 3], 1); }
    pl(g, [[-8, 2], [-4, -10], [2, -2], [8, -12], [12, 2]], '#5a5566', 1);
    const sm = o.now / 1000;
    for (let i = 0; i < 3; i++) { const p = (sm * .5 + i / 3) % 1; el(g, Math.sin(i * 3 + sm) * 5, -8 - p * 26, 5 + p * 7, 4 + p * 5, `rgba(90,85,100,${.4 * (1 - p)})`, 0); }
    g.restore();
  }
  function hpBar(g, x, y, w, hp, mhp, col, num) {
    const f = clamp(hp / mhp, 0, 1);
    g.save(); g.translate(x, y);
    rr(g, -w / 2 - 1, -4, w + 2, num ? 12 : 7, 4, 'rgba(20,14,38,.85)', 0);
    rr(g, -w / 2 + 1, -2, Math.max(1, (w - 2) * f), num ? 8 : 3.4, 3, col, 0);
    rr(g, -w / 2 + 1, -2, Math.max(1, (w - 2) * f), num ? 3 : 1.6, 2, 'rgba(255,255,255,.35)', 0);
    if (num) txt(g, String(Math.max(0, Math.ceil(hp))), 0, 2, 8.5, '#fff', 'center', 'rgba(20,14,38,.9)');
    g.restore();
  }
  function drawTower(g, u, R, o) {
    if (u.d) { drawRubble(g, u, o); return; }
    const king = u.key === 'kt', mine = u.s === o.me, col = mine ? BLUE : RED, col2 = mine ? '#1f5fd0' : '#c42a35';
    const cx = SX(u.x), cy = SY(u.y);
    g.save(); g.translate(cx, cy);
    const sleeping = king && !R.act[u.s];
    const hurt = u.hit > 0;
    if (u.tg && R.m) { const tt = R.m.get(u.tg); if (tt) u.ang = Math.atan2(SY(tt.y) - SY(u.y), SX(tt.x) - SX(u.x)); }
    el(g, 0, 18, king ? 46 : 34, king ? 17 : 13, 'rgba(0,0,0,.28)', 0);
    if (king) {
      rr(g, -38, -34, 76, 58, 9, '#bdb7cc');
      rr(g, -38, -34, 20, 58, 9, '#a39db6', 0);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) ln(g, -36 + i * 16 + (j % 2) * 8, -26 + j * 17, -26 + i * 16 + (j % 2) * 8, -26 + j * 17, 'rgba(60,50,80,.28)', 1);
      rr(g, -38, -14, 76, 11, 1, col, 1.2);
      for (let i = 0; i < 5; i++) rr(g, -38 + i * 15.6, -42, 11, 11, 2, '#cfc9dc');
      rr(g, -11, 0, 22, 24, 11, '#3a2f50');
      rr(g, -4, 4, 8, 20, 4, '#5a4a6e', 0);
      for (const sx of [-1, 1]) { rr(g, sx * 40 - 8, -36, 16, 50, 6, '#c9c3d8'); rr(g, sx * 40 - 8, -36, 16, 9, 4, col, 1.2); rr(g, sx * 40 - 6, -44, 12, 9, 2, '#d8d2e4'); }
      if (sleeping) {
        el(g, 0, -34, 13, 9, '#7a5a3a'); el(g, 0, -34, 13, 9, null, 1.2);
        txt(g, 'z', 14, -46 - Math.sin(o.now / 400) * 2, 12, '#fff', 'center', '#2a2035'); txt(g, 'Z', 22, -56 - Math.sin(o.now / 400 + 1) * 2, 14, '#fff', 'center', '#2a2035');
        el(g, 0, -40, 9, 8.5, SKIN); rr(g, -9, -42, 18, 3, 1, 'rgba(0,0,0,.2)', 0);
        ln(g, -4, -40, -1.5, -40, OUT, 1.2); ln(g, 1.5, -40, 4, -40, OUT, 1.2);
      } else {
        el(g, 0, -34, 14, 10, '#8a2a3a'); el(g, 0, -34, 14, 10, null, 1.2);
        el(g, 0, -42, 9.5, 9, SKIN);
        eyes(g, 0, -43, 3.6, 1.9, 0);
        pl(g, [[-7, -38], [-2, -37], [0, -39.5], [2, -37], [7, -38], [3, -34], [-3, -34]], '#8a5a2b', 1);
        const cd = u.cd > 0 && u.atk > 0 ? 1 : 0;
        if (cd) el(g, (u.ang || 0) * 8, -44, 3, 3, '#ffb03a', 0);
      }
      const topK = cy < 130;
      crownIcon(g, 0, (topK ? -49 : -56) + (sleeping ? 0 : Math.sin(o.now / 300) * 1.2), topK ? 1.55 : 2.2, true);
    } else {
      rr(g, -28, -30, 56, 52, 8, '#bdb7cc');
      rr(g, -28, -30, 15, 52, 8, '#a39db6', 0);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) ln(g, -26 + i * 14 + (j % 2) * 7, -22 + j * 15, -18 + i * 14 + (j % 2) * 7, -22 + j * 15, 'rgba(60,50,80,.28)', 1);
      rr(g, -28, -12, 56, 9, 1, col, 1.2);
      for (let i = 0; i < 4; i++) rr(g, -28 + i * 15.4, -38, 10.5, 10, 2, '#cfc9dc');
      rr(g, -8, 2, 16, 20, 8, '#3a2f50');
      el(g, 0, -30, 20, 6, '#7a5a3a'); el(g, 0, -30, 20, 6, null, 1.2);
      const bx = Math.cos(u.ang || 0) * 5, by = Math.sin(u.ang || 0) * 2.5;
      rr(g, -6, -44, 12, 14, 5, col2);
      el(g, 0, -47, 6.6, 6.6, SKIN);
      el(g, 0, -50, 7.4, 4.4, '#ffd23a'); rr(g, -6, -49, 12, 6, 3, '#ffd23a', 0);
      pl(g, [[-5, -54], [-3, -59], [0, -54], [3, -59], [5, -54]], '#ffcf33', 1);
      eyes(g, 0, -47, 2.4, 1.2, bx * .2);
      g.save(); g.translate(bx * 1.4, -41 + by);
      g.beginPath(); g.arc(0, 0, 6, -1.2, 1.2); g.lineWidth = 1.8; g.strokeStyle = '#8b5a2b'; g.stroke();
      g.restore();
    }
    if (hurt) { rr(g, king ? -38 : -28, king ? -34 : -30, king ? 76 : 56, king ? 58 : 52, 8, 'rgba(255,255,255,.4)', 0); }
    if (u.frz > 0) { rr(g, king ? -40 : -30, king ? -36 : -32, king ? 80 : 60, king ? 62 : 56, 8, 'rgba(160,230,255,.5)', 1.4); }
    g.restore();
    if (u.hp < u.mhp || (king && R.act[u.s])) hpBar(g, cx, cy + (king ? 36 : 31), king ? 56 : 46, u.hp, u.mhp, col, 1);
  }
  function drawProj(g, p, R, o) {
    const x = SX(p.x), y = SY(p.y), k = p.k;
    g.save();
    if (k === 'spell') {
      const f = clamp(p.t / p.dur, 0, 1), key = p.key, D = DEF[key];
      const tx = SX(p.tx), ty = SY(p.ty), rad = D.rad ? D.rad * T : 0;
      g.beginPath(); g.arc(tx, ty, rad, 0, TAU);
      g.fillStyle = key === 'poison' ? 'rgba(120,214,70,.14)' : 'rgba(255,255,255,.12)'; g.fill();
      g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeStyle = key === 'poison' ? 'rgba(90,200,50,.9)' : 'rgba(255,255,255,.85)'; g.lineDashOffset = -o.now / 60; g.stroke(); g.setLineDash([]);
      if (key === 'arrows') {
        g.globalAlpha = .9;
        for (let i = 0; i < 12; i++) {
          const a2 = i * 2.4, rr2 = (i % 4) / 4 * rad * .85, ax = tx + Math.cos(a2) * rr2, ay = ty + Math.sin(a2) * rr2 * .8;
          const fall = clamp((f * 1.1 - (i % 5) * .04), 0, 1), yy = ay - (1 - fall) * 200;
          g.save(); g.translate(ax, yy); g.rotate(.25);
          ln(g, 0, 8, 0, -8, '#8b5a2b', 1.8); pl(g, [[0, 13], [-3, 6], [3, 6]], '#dfe6f2', .8); pl(g, [[0, -8], [-3, -12], [0, -10], [3, -12]], '#e8527f', .6);
          g.restore();
        }
      } else if (key === 'zap') {
        g.globalAlpha = .9; pl(g, [[tx + 3, ty - rad], [tx - 8, ty], [tx, ty], [tx - 4, ty + rad]], '#ffe35a', 0);
      } else {
        const h = Math.sin(f * Math.PI) * 120;
        g.translate(x, y - h);
        g.scale(.85, .85);
        SPELLP[key === 'poison' ? 'poison' : key](g, { t: o.now / 1000 });
      }
      g.restore(); return;
    }
    let dx = SX(p.tx) - x, dy = SY(p.ty) - y;
    const ang = Math.atan2(dy, dx);
    if (k === 'tesla') {
      g.strokeStyle = '#bff8ff'; g.lineWidth = 2.4; g.shadowColor = '#7df0ff'; g.shadowBlur = 8;
      g.beginPath(); const sx0 = SX(p.x0), sy0 = SY(p.y0) - 30; g.moveTo(sx0, sy0);
      const n = 6; for (let i = 1; i <= n; i++) g.lineTo(sx0 + (x - sx0) * i / n + (i < n ? Math.sin(o.now / 20 + i) * 6 : 0), sy0 + (y - sy0) * i / n + (i < n ? Math.cos(o.now / 25 + i) * 6 : 0));
      g.stroke(); g.restore(); return;
    }
    if (p.ar) {
      const tot = Math.hypot(p.tx - p.x0, p.ty - p.y0) || 1, fr = clamp(1 - Math.hypot(p.tx - p.x, p.ty - p.y) / tot, 0, 1);
      const h = Math.sin(fr * Math.PI) * (k === 'mortar' ? 110 : 46);
      el(g, x, y, 5, 2.5, 'rgba(0,0,0,.25)', 0);
      g.translate(x, y - h);
      if (k === 'mortar') { el(g, 0, 0, 6, 6, '#3a4256'); el(g, -1.5, -1.5, 2, 2, 'rgba(255,255,255,.5)', 0); }
      else { el(g, 0, 0, 5, 5, '#2a2540'); ln(g, 0, -4.5, 1.6, -7, '#c9a227', 1.2); el(g, 1.8, -7.6, 1.6, 1.6, '#ffb03a', 0); }
      g.restore(); return;
    }
    g.translate(x, y - (DEF[k] && DEF[k].k === 'b' ? 10 : 12));
    g.rotate(ang);
    if (k === 'archers' || k === 'spears' || k === 'pt' || k === 'kt') {
      ln(g, -9, 0, 5, 0, k === 'spears' ? '#9b6a33' : '#8b5a2b', 1.8); pl(g, [[9, 0], [4, -2.6], [4, 2.6]], '#eef3fa', .8); pl(g, [[-9, 0], [-12, -2.4], [-10, 0], [-12, 2.4]], k === 'pt' || k === 'kt' ? '#ffd23a' : '#e8527f', .6);
    } else if (k === 'musketeer') { el(g, 0, 0, 3.6, 2.6, '#ffd24a'); ln(g, -12, 0, -3, 0, 'rgba(255,230,120,.6)', 2); }
    else if (k === 'cannon') { el(g, 0, 0, 5, 5, '#2a2540'); el(g, -1.4, -1.4, 1.6, 1.6, 'rgba(255,255,255,.5)', 0); }
    else if (k === 'wizard') { el(g, 0, 0, 5.6, 5.6, '#ff7a1c'); el(g, 0, 0, 2.8, 2.8, '#ffe08a', 0); ln(g, -12, 0, -4, 0, 'rgba(255,150,40,.5)', 3); }
    else if (k === 'witch') { el(g, 0, 0, 5.4, 5.4, '#8cf0c0'); el(g, 0, 0, 2.6, 2.6, '#fff', 0); el(g, -6, 0, 3, 3, 'rgba(180,120,255,.6)', 0); }
    else if (k === 'dragon') { el(g, 0, 0, 7, 5, '#ff9a2e'); el(g, 1, 0, 3.6, 2.6, '#ffe08a', 0); ln(g, -14, 0, -5, 0, 'rgba(255,120,30,.55)', 4); }
    else { el(g, 0, 0, 3.6, 3.6, '#fff'); }
    g.restore();
  }
  function drawUnit(g, u, R, o) {
    const D = u.D, mine = u.s === o.me, col = mine ? BLUE : RED;
    const px = SX(u.rx), py = SY(u.ry);
    g.save(); g.translate(px, py);
    const rpx = D.rd * T;
    el(g, 0, 2, rpx * 1.05, rpx * .5, 'rgba(0,0,0,.26)', 0);
    if (D.k !== 'b') { g.beginPath(); g.ellipse(0, 2, rpx * .95, rpx * .5, 0, 0, TAU); g.lineWidth = 2; g.strokeStyle = col; g.globalAlpha = .75; g.stroke(); g.globalAlpha = 1; }
    else { g.beginPath(); g.ellipse(0, 2, rpx * 1.1, rpx * .55, 0, 0, TAU); g.lineWidth = 2.4; g.strokeStyle = col; g.stroke(); }
    const lift = D.fl ? 14 : 0;
    g.translate(0, -lift);
    const dep = u.dep > 0 ? clamp(u.dep / D.dep, 0, 1) : 0;
    const a = { b: -Math.abs(Math.sin(u.w)) * 1.6, f: FL ? -u.fx : u.fx, sw: u.atk > 0 ? Math.sin((1 - u.atk / .3) * Math.PI) : 0, w: u.w, t: o.now / 1000, s: u.s, ang: 0, single: 1 };
    if (D.jump && u.ry > RV0 - 1.2 && u.ry < RV1 + 1.2) { const q = clamp((u.ry - (RV0 - 1.2)) / (RV1 - RV0 + 2.4), 0, 1); g.translate(0, -Math.sin(q * Math.PI) * 12); }
    if (D.key === 'cannon') {
      const t = u.tg && R.m ? R.m.get(u.tg) : null;
      if (t) { const dx = SX(t.rx != null ? t.rx : t.x) - px, dy = SY(t.ry != null ? t.ry : t.y) - py; u.ang = Math.atan2(dx, -dy); }
      a.ang = u.ang || 0;
    }
    if (u.d) g.globalAlpha = .5;
    if (dep > 0) { g.globalAlpha = .55; const s = .75 + .25 * (1 - dep); g.scale(s, s); }
    if (u.stun > 0 || u.frz > 0) { a.sw = 0; }
    PAINT[u.key](g, a);
    g.globalAlpha = 1;
    if (u.hit > 0) { el(g, 0, -13, rpx * 1.1, rpx * 1.5, 'rgba(255,255,255,.5)', 0); }
    if (u.frz > 0) { rr(g, -rpx, -rpx * 2.6, rpx * 2, rpx * 2.7, 6, 'rgba(160,230,255,.55)', 1.4); }
    if (u.stun > 0) for (let i = 0; i < 3; i++) { const an = o.now / 90 + i * 2.1; el(g, Math.cos(an) * rpx * .8, -rpx * 2.7 + Math.sin(an) * 3, 2.2, 2.2, '#ffe35a', 0); }
    g.translate(0, lift);
    if (dep > 0) { g.beginPath(); g.arc(0, -rpx - 8 - lift, 9, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - dep)); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); }
    if (u.hp < u.mhp) hpBar(g, 0, -(D.fl ? 56 : D.rd * T * 2.1 + 26 + (D.rd > .6 ? 8 : 0)), clamp(D.rd * 46, 22, 40), u.hp, u.mhp, col, 0);
    g.restore();
  }
  function drawZone(g, z, o) {
    const x = SX(z.x), y = SY(z.y), r = z.r * T;
    g.save();
    const gr = g.createRadialGradient(x, y, r * .2, x, y, r);
    gr.addColorStop(0, 'rgba(120,214,70,.55)'); gr.addColorStop(1, 'rgba(70,160,40,.25)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.lineWidth = 2.4; g.strokeStyle = 'rgba(70,170,40,.85)'; g.stroke();
    const tt = o.now / 600;
    for (let i = 0; i < 9; i++) { const a2 = i * 2.4 + tt * .6, rr2 = (.25 + (i % 4) * .18) * r, p = (tt + i * .37) % 1; el(g, x + Math.cos(a2) * rr2, y + Math.sin(a2) * rr2 * .8 - p * 12, 3 + (i % 3), 3 + (i % 3), `rgba(200,255,150,${.5 * (1 - p)})`, 0); }
    g.restore();
  }
  function drawLog(g, L, o) {
    const x = SX(L.x), y = SY(L.y);
    g.save(); g.translate(x, y);
    el(g, 0, 10, 40, 8, 'rgba(0,0,0,.2)', 0);
    g.rotate(((L.trav * 2.2) % TAU));
    g.save(); g.scale(1, .0001); g.restore();
    g.restore();
    g.save(); g.translate(x, y - 6);
    rr(g, -L.r * T, -7, L.r * 2 * T, 14, 7, '#a96a34');
    for (let i = 0; i < 5; i++) { const xx = -L.r * T + 6 + i * (L.r * 2 * T - 12) / 4; ln(g, xx, -5, xx + 3, 5, '#7a4620', 1.4); }
    el(g, -L.r * T + 2, 0, 5, 7, '#d8a566'); el(g, -L.r * T + 2, 0, 2.4, 3.4, '#a96a34', .8);
    g.restore();
    for (let i = 0; i < 4; i++) el(g, x + Math.sin(o.now / 80 + i) * L.r * T, y + 4 - L.dir * (FL ? -1 : 1) * (6 + i * 5), 4 + i, 3, `rgba(220,200,160,${.35 - i * .07})`, 0);
  }
  function fxMake(o, e) {
    const P = o.fx.parts;
    const ring = (x, y, r, col, life, fill) => P.push({ k: 'ring', x, y, r, col, t: 0, life: life || .45, fill });
    const sparks = (x, y, n, col, sp, life) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = (.4 + Math.random()) * (sp || 4); P.push({ k: 'sp', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, col, t: 0, life: (life || .5) * (.6 + Math.random() * .7), r: 2 + Math.random() * 2.4 }); } };
    const puff = (x, y, n, col, big) => { for (let i = 0; i < n; i++) P.push({ k: 'pf', x: x + (Math.random() - .5), y: y + (Math.random() - .5) * .6, vx: (Math.random() - .5) * 1.5, vy: -Math.random() * 1.2, col, t: 0, life: .55 + Math.random() * .4, r: (big ? 13 : 8) + Math.random() * 5 }); };
    switch (e[0]) {
      case 'd': puff(e[1], e[2], 6, 'rgba(235,225,200,.8)'); ring(e[1], e[2], 1.1, 'rgba(255,255,255,.8)', .35); o.snd('dep'); break;
      case 'x': {
        const kind = e[4], r = e[3];
        if (kind === 'ice') { ring(e[1], e[2], r, 'rgba(150,230,255,.95)', .5, 'rgba(180,240,255,.35)'); sparks(e[1], e[2], 14, '#d6f4ff', 5); o.snd('ice'); }
        else if (kind === 'gas') { ring(e[1], e[2], r, 'rgba(120,214,70,.9)', .5, 'rgba(120,214,70,.3)'); o.snd('gas'); }
        else if (kind === 'spin') ring(e[1], e[2], r, 'rgba(255,255,255,.8)', .25);
        else if (kind === 'arrows') { ring(e[1], e[2], r, 'rgba(255,255,255,.8)', .3); sparks(e[1], e[2], 12, '#e8d9a8', 4); o.snd('arrows'); }
        else if (kind === 'zap') { ring(e[1], e[2], r, 'rgba(255,240,120,.95)', .35, 'rgba(255,240,120,.4)'); sparks(e[1], e[2], 16, '#ffe35a', 6); o.snd('zap'); o.shake = Math.max(o.shake, 2); }
        else if (kind === 'fireball') { ring(e[1], e[2], r, 'rgba(255,150,40,.95)', .55, 'rgba(255,170,60,.5)'); sparks(e[1], e[2], 22, '#ff9a2e', 7); puff(e[1], e[2], 7, 'rgba(70,50,50,.55)', 1); o.snd('boom'); o.shake = Math.max(o.shake, 5); }
        else { ring(e[1], e[2], r, 'rgba(255,170,60,.9)', .4, 'rgba(255,170,60,.35)'); sparks(e[1], e[2], 10, '#ffb03a', 5); o.snd('boom'); o.shake = Math.max(o.shake, 2.5); }
        break;
      }
      case 'h': sparks(e[1], e[2], 4, '#fff', 3, .25); o.snd('hit'); break;
      case 'k': puff(e[1], e[2], 4, 'rgba(240,235,245,.85)'); sparks(e[1], e[2], 5, '#ffe35a', 3, .4); o.snd('pop'); break;
      case 'td':
        puff(e[1], e[2], 14, 'rgba(110,100,120,.8)', 1); sparks(e[1], e[2], 30, '#ffb03a', 8, .8); ring(e[1], e[2], 3.4, 'rgba(255,200,100,.9)', .6, 'rgba(255,200,100,.3)');
        o.shake = 12; o.snd('tower'); break;
      case 'cr': o.fx.banner = { s: e[1] === o.me ? 'Crown!' : 'Enemy crown', col: e[1] === o.me ? '#ffd23a' : '#ff6a6a', t: 0, life: 1.3 }; break;
      case 'ot': o.fx.banner = { s: 'Overtime!', col: '#ffd23a', t: 0, life: 2.2 }; o.snd('alarm'); break;
      case 'tb': o.fx.banner = { s: 'Tiebreaker!', col: '#ff6a6a', t: 0, life: 2.4 }; o.snd('alarm'); break;
      case 'p': if (e[1] !== o.me) o.snd('enemy'); break;
      case 's': break;
      case 'l': o.snd('log'); break;
      default: break;
    }
  }
  function fxDraw(g, o, dt) {
    const P = o.fx.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.t += dt;
      if (p.t >= p.life) { P.splice(i, 1); continue; }
      const f = p.t / p.life, x = SX(p.x), y = SY(p.y);
      if (p.k === 'ring') {
        g.beginPath(); g.arc(x, y, p.r * T * (.25 + .75 * Math.min(1, f * 2.2)), 0, TAU);
        if (p.fill) { g.globalAlpha = (1 - f) * .8; g.fillStyle = p.fill; g.fill(); }
        g.globalAlpha = 1 - f; g.lineWidth = 3 * (1 - f) + 1; g.strokeStyle = p.col; g.stroke(); g.globalAlpha = 1;
      } else if (p.k === 'sp') {
        p.x += p.vx * dt * (FL ? -1 : 1) * .6; p.y += p.vy * dt * .6; p.vy += 6 * dt;
        g.globalAlpha = 1 - f; el(g, x, y, p.r * (1 - f * .5), p.r * (1 - f * .5), p.col, 0); g.globalAlpha = 1;
      } else if (p.k === 'pf') {
        p.x += p.vx * dt * (FL ? -1 : 1) * .5; p.y += p.vy * dt * .5;
        g.globalAlpha = (1 - f) * .85; el(g, x, y - f * 8, p.r * (.6 + f * .9), p.r * (.5 + f * .7), p.col, 0); g.globalAlpha = 1;
      }
    }
  }
  function drawRiver(g, o) {
    g.save();
    g.beginPath(); g.rect(0, AY + RV0 * T, W, 2 * T); g.clip();
    g.strokeStyle = 'rgba(255,255,255,.38)'; g.lineWidth = 2;
    const t = o.now / 1000;
    for (let r = 0; r < 4; r++) for (let i = -1; i < 9; i++) {
      const x = ((i * 58 + t * (18 + r * 4) + r * 17) % (W + 60)) - 30, y = AY + (RV0 + .3 + r * .45) * T + Math.sin(t * 2 + i + r) * 2;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 4, x + 16, y); g.stroke();
    }
    g.restore();
  }
  function zoneShade(g, R, me, key) {
    g.save();
    g.beginPath(); g.rect(0, AY, W, AH * T); g.clip();
    g.fillStyle = 'rgba(200,30,40,.2)';
    const mineTop = FL ? 0 : 1;
    const fullTop = (yy0, yy1) => g.fillRect(0, AY + yy0 * T, W, (yy1 - yy0) * T);
    fullTop(0, RV0 + (RV1 - RV0) / 2 + 1);
    fullTop(RV1 + 0, AH);
    g.restore();
    g.save();
    g.beginPath(); g.rect(0, AY, W, AH * T); g.clip();
    g.fillStyle = 'rgba(255,255,255,.07)';
    for (let yy = 0; yy < AH; yy++) for (let xx = 0; xx < AW; xx++) if (zoneOK(R, me, xx + .5, yy + .5) && (xx + yy) % 2 === 0) g.fillRect(SX(FL ? AW - xx - 1 : xx), SY(FL ? AH - yy - 1 : yy), T, T);
    g.restore();
  }
  const TRAYX = i => 74 + i * 89, CARDW = 80, CARDH = 78, CARDY = 804;
  function trayHit(x, y) {
    if (y < CARDY - 12 || y > CARDY + CARDH + 4) return -1;
    for (let i = 0; i < 4; i++) if (x >= TRAYX(i) - 2 && x <= TRAYX(i) + CARDW + 2) return i;
    return -1;
  }
  function drawCard(g, key, x, y, w, h, cost, afford, sel, lvl) {
    const D = DEF[key];
    g.save();
    if (sel) { g.shadowColor = 'rgba(255,230,120,.95)'; g.shadowBlur = 14; }
    g.drawImage(portrait(key, 80, 78), x, y, w, h);
    g.shadowBlur = 0;
    if (!afford) { rr(g, x, y, w, h, 9, 'rgba(15,10,35,.55)', 0); }
    if (sel) { g.lineWidth = 3; g.strokeStyle = '#ffe36b'; g.beginPath(); g.roundRect(x, y, w, h, 9); g.stroke(); }
    if (cost != null) { dropIcon(g, x + 11, y + 12, 11 * w / 80); txt(g, String(cost), x + 11, y + 15 * w / 80, 14 * w / 80, '#fff', 'center', '#3d0a52'); }
    if (lvl) txt(g, 'Lv' + lvl, x + w - 5, y + h - 8, 10 * w / 80, '#fff', 'right', 'rgba(20,14,38,.9)');
    g.restore();
  }
  function drawTray(g, R, me, o) {
    const gr = g.createLinearGradient(0, TRY, 0, H);
    gr.addColorStop(0, '#2c2f6b'); gr.addColorStop(1, '#171a45');
    g.fillStyle = gr; g.fillRect(0, TRY, W, H - TRY);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, TRY, W, 2);
    const h = R.hands[me], el10 = R.el[me];
    if (!h || !h.slots) return;
    txt(g, 'NEXT', 36, CARDY + 4, 10, '#b9c0ff', 'center');
    g.save(); g.globalAlpha = .9; g.drawImage(portrait(h.deck[h.next], 80, 78), 10, CARDY + 14, 52, 50); g.restore();
    for (let i = 0; i < 4; i++) {
      const key = h.deck[h.slots[i]], D = DEF[key];
      const sel = o.ui.sel === i, ts = o.ui.slotT[i] || 0, age = clamp((o.now - ts) / 260, 0, 1);
      const lift = sel ? -9 : 0, sc = .65 + .35 * (1 - Math.pow(1 - age, 3));
      const cx = TRAYX(i) + CARDW / 2, cy = CARDY + CARDH / 2 + lift;
      g.save(); g.translate(cx, cy); g.scale(sc, sc);
      drawCard(g, key, -CARDW / 2, -CARDH / 2, CARDW, CARDH, D.c, el10 >= D.c - 1e-6, sel, 0);
      g.restore();
      if (el10 < D.c - 1e-6) {
        const f = clamp(el10 / D.c, 0, 1);
        rr(g, TRAYX(i) + 6, CARDY + CARDH - 6, (CARDW - 12) * f, 3, 1.5, '#e75cff', 0);
      }
      txt(g, String(i + 1), TRAYX(i) + CARDW - 9, CARDY + 10 + lift, 10, 'rgba(255,255,255,.6)', 'center');
    }
    const by = 887, bx = 40, bw = W - bx - 10, bh = 17;
    rr(g, bx, by, bw, bh, 8, 'rgba(8,6,28,.85)', 0);
    const f = clamp(el10 / 10, 0, 1);
    if (f > 0) {
      const gg = g.createLinearGradient(0, by, 0, by + bh);
      gg.addColorStop(0, R.mult > 1 ? '#ff7bf0' : '#f08aff'); gg.addColorStop(1, R.mult > 1 ? '#c21fd8' : '#a223d0');
      rr(g, bx + 1.5, by + 1.5, Math.max(8, (bw - 3) * f), bh - 3, 7, gg, 0);
      rr(g, bx + 3, by + 3, Math.max(4, (bw - 6) * f), 3, 2, 'rgba(255,255,255,.35)', 0);
    }
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1;
    for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(bx + bw * i / 10, by + 2); g.lineTo(bx + bw * i / 10, by + bh - 2); g.stroke(); }
    dropIcon(g, 22, by + bh / 2 + 1, 13);
    txt(g, String(Math.floor(el10 + 1e-6)), 22, by + bh / 2 + 3, 14, '#fff', 'center', '#3d0a52');
    if (R.mult > 1) txt(g, R.mult + 'x', W - 24, by + bh / 2 + 1, 11, '#fff', 'right', 'rgba(70,0,100,.9)');
  }
  function drawTop(g, R, me, o) {
    const gr = g.createLinearGradient(0, 0, 0, AY);
    gr.addColorStop(0, '#2c2f6b'); gr.addColorStop(1, '#1d2050');
    g.fillStyle = gr; g.fillRect(0, 0, W, AY);
    const opp = 1 - me;
    txt(g, R.names[opp], 8, 9, 11, '#ffb0b8', 'left');
    for (let i = 0; i < 3; i++) crownIcon(g, 14 + i * 20, 22, .9, R.cr[opp] > i);
    txt(g, R.names[me], W - 8, 9, 11, '#a9ccff', 'right');
    for (let i = 0; i < 3; i++) crownIcon(g, W - 14 - i * 20, 22, .9, R.cr[me] > 2 - i);
    let s, col = '#fff';
    if (R.intro > 0) s = '0:00';
    else if (R.per === 'reg') { s = fmtT(R.left); if (R.left <= 10) col = '#ff7b7b'; }
    else if (R.per === 'ot') { s = fmtT(R.left); col = '#ffd23a'; }
    else { s = 'TIEBREAK'; col = '#ff7b7b'; }
    txt(g, s, W / 2, 14, R.per === 'tb' ? 15 : 20, col, 'center', 'rgba(10,8,30,.9)');
    const lab = R.per === 'ot' ? 'OVERTIME' : R.per === 'tb' ? 'SUDDEN DEATH' : R.mult > 1 ? 'DOUBLE ELIXIR' : '';
    if (lab) txt(g, lab, W / 2, 26, 8, R.mult > 1 ? '#f7a2ff' : '#ffd23a', 'center');
  }
  function drawBattle(g, R, o) {
    FL = o.me === 1 ? 1 : 0;
    const sh = o.shake > .3 ? [(Math.random() - .5) * o.shake, (Math.random() - .5) * o.shake] : null;
    g.save();
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#171a45'; g.fillRect(0, 0, W, H);
    if (sh) g.translate(sh[0], sh[1]);
    g.save();
    g.beginPath(); g.rect(0, AY, W, AH * T); g.clip();
    g.drawImage(o.arena, 0, AY, W, AH * T);
    drawRiver(g, o);
    if (o.ui.sel != null && o.ui.sel >= 0) {
      const key = R.hands[o.me].deck[R.hands[o.me].slots[o.ui.sel]];
      if (DEF[key].k !== 's') zoneShade(g, R, o.me, key);
    }
    for (const z of R.zones) drawZone(g, z, o);
    const gl = [], fl = [];
    for (const u of R.units) { if (u.d && u.D.k !== 'w') continue; (u.D.fl ? fl : gl).push(u); }
    const ordv = u => FL ? -u.ry : u.ry;
    for (const u of gl) if (u.D.k === 'w') drawTower(g, u, R, o);
    for (const L of R.logs) drawLog(g, L, o);
    gl.sort((a, b) => ordv(a) - ordv(b));
    for (const u of gl) if (u.D.k !== 'w') drawUnit(g, u, R, o);
    fxDraw(g, o, o.dt);
    fl.sort((a, b) => ordv(a) - ordv(b));
    for (const u of fl) drawUnit(g, u, R, o);
    for (const p of R.projs) drawProj(g, p, R, o);
    const ui = o.ui;
    if (ui.sel != null && ui.sel >= 0 && ui.ptr) {
      const hnd = R.hands[o.me], key = hnd.deck[hnd.slots[ui.sel]], D = DEF[key];
      const wx = FL ? AW - ui.ptr.x / T : ui.ptr.x / T, wy = FL ? AH - (ui.ptr.y - AY) / T : (ui.ptr.y - AY) / T;
      const okp = placeOK(R, o.me, key, wx, wy);
      const gx = ui.ptr.x, gy = ui.ptr.y;
      if (D.k === 's') {
        const r = D.rad * T;
        g.beginPath(); g.arc(gx, gy, r, 0, TAU); g.fillStyle = key === 'poison' ? 'rgba(120,214,70,.22)' : 'rgba(255,255,255,.2)'; g.fill();
        g.setLineDash([7, 5]); g.lineDashOffset = -o.now / 50; g.lineWidth = 2.4; g.strokeStyle = '#fff'; g.stroke(); g.setLineDash([]);
        g.beginPath(); g.moveTo(gx - 6, gy); g.lineTo(gx + 6, gy); g.moveTo(gx, gy - 6); g.lineTo(gx, gy + 6); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
        if (key === 'log') { g.globalAlpha = .45; g.fillStyle = '#fff'; g.fillRect(gx - D.rad * T, gy + (FL ? 0 : -D.len * T), D.rad * 2 * T, D.len * T); g.globalAlpha = 1; }
      } else {
        g.save(); g.translate(gx, gy);
        if (!okp) { g.beginPath(); g.arc(0, 0, 16, 0, TAU); g.fillStyle = 'rgba(255,60,70,.35)'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = '#ff4a55'; g.stroke(); ln(g, -8, -8, 8, 8, '#ff4a55', 3); ln(g, 8, -8, -8, 8, '#ff4a55', 3); }
        else {
          g.beginPath(); g.arc(0, 2, 15, 0, TAU); g.fillStyle = 'rgba(255,255,255,.22)'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke();
          g.globalAlpha = .75;
          drawUnitArt(g, key, 0, 0, 1, { b: 0, f: 1, sw: 0, w: 0, t: o.now / 1000, s: 0 });
          g.globalAlpha = 1;
        }
        g.restore();
      }
    }
    g.restore();
    drawTop(g, R, o.me, o);
    drawTray(g, R, o.me, o);
    for (const u of R.units) if (u.D.k === 'w' && !u.d) { }
    if (R.intro > 0) {
      const f = clamp(1 - R.intro / 2.5, 0, 1);
      g.fillStyle = `rgba(10,8,40,${.5 * (1 - f)})`; g.fillRect(0, AY, W, AH * T);
      g.save(); g.translate(W / 2, AY + AH * T / 2); const sc = 1 + (1 - f) * .3; g.scale(sc, sc);
      txt(g, R.intro > 1.1 ? 'Get ready!' : 'Battle!', 0, 0, 44, '#ffd23a', 'center', '#2a2035');
      g.restore();
    }
    const bn = o.fx.banner;
    if (bn) {
      bn.t += o.dt;
      if (bn.t >= bn.life) o.fx.banner = null;
      else {
        const f = bn.t / bn.life, s = f < .15 ? f / .15 : f > .8 ? (1 - f) / .2 : 1;
        g.save(); g.globalAlpha = clamp(s, 0, 1); g.translate(W / 2, AY + AH * T * .5); g.scale(.7 + .3 * clamp(s, 0, 1), .7 + .3 * clamp(s, 0, 1));
        rr(g, -150, -32, 300, 64, 18, 'rgba(20,14,50,.78)', 0);
        txt(g, bn.s, 0, 2, 38, bn.col, 'center', '#2a2035');
        g.restore();
      }
    }
    g.restore();
    o.shake *= Math.pow(.02, o.dt);
  }

  const MAXCH = 4, CYCLE = ['wood', 'wood', 'silver', 'wood', 'gold', 'silver', 'wood', 'magic', 'silver', 'gold'];
  const KINDN = { t: 'Troop', s: 'Spell', b: 'Building' };
  function newProfile() {
    const cards = {};
    STARTERS.forEach(k => { cards[k] = { lv: 1, n: 0 }; });
    return { v: 1, tr: 0, hi: 0, gold: 150, cards, deck: STARTERS.slice(), ch: [{ t: 'wood', st: 0 }, null, null, null], cyc: 0, w: 0, l: 0, d: 0, cw: 0, crowns: 0, diff: 1, hint: 0 };
  }
  function loadProfile(api) {
    const P0 = newProfile(), s = api.load();
    if (!s || s.v !== 1 || !s.cards || !Array.isArray(s.deck)) return P0;
    const P = Object.assign(P0, s);
    const ok = {};
    for (const k of Object.keys(P.cards)) if (DEF[k] && DEF[k].c && P.cards[k] && P.cards[k].lv >= 1) ok[k] = { lv: clamp(P.cards[k].lv | 0, 1, MAXLV), n: Math.max(0, P.cards[k].n | 0) };
    P.cards = ok;
    STARTERS.forEach(k => { if (!P.cards[k]) P.cards[k] = { lv: 1, n: 0 }; });
    let dk = P.deck.filter((k, i) => P.cards[k] && P.deck.indexOf(k) === i);
    if (dk.length !== 8) dk = STARTERS.slice();
    P.deck = dk;
    P.ch = Array.from({ length: MAXCH }, (_, i) => { const c = P.ch && P.ch[i]; return c && CHESTS[c.t] ? { t: c.t, st: +c.st || 0 } : null; });
    P.diff = clamp(P.diff | 0, 0, DIFFS.length - 1);
    return P;
  }
  const arenaOf = tr => { let a = 0; ARENAS.forEach((r, i) => { if (tr >= r.t) a = i; }); return a; };
  const deckAvg = P => P.deck.reduce((a, k) => a + P.cards[k].lv, 0) / 8;
  const deckKL = P => clamp(Math.round(deckAvg(P)), 1, MAXLV);
  const deckElix = P => P.deck.reduce((a, k) => a + DEF[k].c, 0) / 8;
  function chestLeft(c) { return c && c.st ? Math.max(0, c.st + CHESTS[c.t].s * 1000 - Date.now()) : 0; }
  function chestRoll(type) {
    const C = CHESTS[type], total = ri(C.cards[0], C.cards[1]), nd = ri(C.dist[0], C.dist[1]), gold = ri(C.g[0], C.g[1]);
    const byR = { c: [], r: [], e: [], l: [] };
    CARD_KEYS.forEach(k => byR[DEF[k].r].push(k));
    const out = {}, order = [];
    for (let i = 0; i < nd; i++) {
      let roll = Math.random() * 100, r = 'c';
      for (let j = 0; j < 4; j++) { roll -= C.rw[j]; if (roll < 0) { r = 'crel'[j]; break; } }
      const pool = byR[r].filter(k => !out[k]);
      if (!pool.length) continue;
      const k = pick(pool);
      out[k] = 1; order.push(k);
    }
    const amts = {}, wt = order.map(k => 1 / Math.max(.1, RAR[DEF[k].r].cp * 1.6));
    const sw = wt.reduce((a, b) => a + b, 0);
    let left = Math.max(order.length, total);
    order.forEach((k, i) => { const a = i === order.length - 1 ? left : clamp(Math.round(total * wt[i] / sw), 1, left - (order.length - 1 - i)); amts[k] = Math.max(1, a); left -= amts[k]; });
    return { gold, cards: order.map(k => ({ k, n: amts[k] })) };
  }
  function chestApply(P, roll) {
    const res = [{ k: 'gold', n: roll.gold }];
    P.gold += roll.gold;
    roll.cards.forEach(c => {
      const e = P.cards[c.k];
      if (!e) { P.cards[c.k] = { lv: 1, n: c.n }; res.push({ k: c.k, n: c.n, nw: 1, before: 0, lv: 1 }); }
      else { const b = e.n; e.n += c.n; res.push({ k: c.k, n: c.n, nw: 0, before: b, lv: e.lv }); }
    });
    return res;
  }
  function statRows(key, lv) {
    const D = DEF[key], m = lm(lv), rows = [];
    const tg = D.k === 's' ? 'Ground and air' : D.bo ? 'Buildings' : D.air ? 'Air and ground' : 'Ground only';
    if (D.k === 's') {
      const dm = Math.round(D.dmg * m);
      rows.push(['Damage', D.dur ? Math.round(dm * .5) * (D.dur / .5) + ' over ' + D.dur + 's' : dm]);
      rows.push(['Radius', D.rad.toFixed(1) + ' tiles']);
      if (D.stun) rows.push(['Stun', D.stun + 's']);
      rows.push(['Tower damage', Math.round(D.tf * 100) + '%']);
      rows.push(['Targets', tg]);
    } else {
      rows.push(['Hitpoints', Math.round(D.hp * m) + (D.cnt > 1 ? ' x' + D.cnt : '')]);
      if (D.dmg > 0) { rows.push(['Damage', Math.round(D.dmg * m) + (D.cnt > 1 ? ' x' + D.cnt : '')]); rows.push(['DPS', Math.round(D.dmg * m / D.hs)]); }
      rows.push(['Targets', tg]);
      if (D.k === 't') rows.push(['Speed', SPD(D.sp)]);
      rows.push(['Range', D.mn ? D.mn + ' to ' + D.rg + ' tiles' : D.rg > 1 ? D.rg + ' tiles' : 'Melee']);
      if (D.sr && D.k !== 's') rows.push(['Splash', D.sr + ' tiles']);
      if (D.life) rows.push(['Lifetime', D.life + 's']);
      rows.push(['Deploy', D.dep + 's']);
    }
    return rows;
  }
  function drawChest(g, x, y, s, type, open, t, glow) {
    const C = CHESTS[type];
    g.save(); g.translate(x, y); g.scale(s, s);
    el(g, 0, 32, 54, 12, 'rgba(0,0,0,.3)', 0);
    if (open) {
      const gr = g.createRadialGradient(0, -10, 4, 0, -10, 110);
      gr.addColorStop(0, 'rgba(255,240,150,.95)'); gr.addColorStop(1, 'rgba(255,200,60,0)');
      g.fillStyle = gr; g.fillRect(-130, -130, 260, 260);
    } else if (glow) {
      const gr = g.createRadialGradient(0, 0, 10, 0, 0, 90);
      gr.addColorStop(0, 'rgba(255,240,170,' + (.5 * glow) + ')'); gr.addColorStop(1, 'rgba(255,200,60,0)');
      g.fillStyle = gr; g.fillRect(-120, -120, 240, 240);
    }
    if (t) g.rotate(Math.sin(t) * .06);
    rr(g, -44, -6, 88, 40, 8, C.col2);
    for (let i = 1; i < 4; i++) ln(g, -44, -6 + i * 10, 44, -6 + i * 10, 'rgba(0,0,0,.25)', 1.2);
    rr(g, -44, -6, 88, 10, 6, 'rgba(255,255,255,.12)', 0);
    for (const bx of [-30, 20]) { rr(g, bx, -8, 10, 44, 3, '#e9edf3'); rr(g, bx, -8, 10, 7, 3, '#fff', 0); rr(g, bx + 2, 4, 2, 2, 1, '#8a93a6', 0); rr(g, bx + 6, 20, 2, 2, 1, '#8a93a6', 0); }
    if (open) {
      el(g, 0, -6, 41, 8, '#2a1a10');
      g.save(); g.translate(0, -8); g.scale(1, -.62);
      pl(g, [[-44, 0], [-44, -16], [-30, -34], [0, -42], [30, -34], [44, -16], [44, 0]], C.col);
      rr(g, -30, -34, 10, 34, 2, '#e9edf3'); rr(g, 20, -34, 10, 34, 2, '#e9edf3');
      g.restore();
    } else {
      g.beginPath(); g.moveTo(-44, -6); g.lineTo(-44, -20); g.quadraticCurveTo(-40, -44, 0, -46); g.quadraticCurveTo(40, -44, 44, -20); g.lineTo(44, -6); g.closePath();
      g.fillStyle = C.col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = OUT; g.stroke();
      el(g, -16, -32, 14, 4, 'rgba(255,255,255,.35)', 0);
      for (const bx of [-30, 20]) { g.beginPath(); g.moveTo(bx, -6); g.lineTo(bx, -22); g.quadraticCurveTo(bx + 5, -45, bx + 10, -45); g.lineTo(bx + 10, -6); g.closePath(); g.fillStyle = '#e9edf3'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = OUT; g.stroke(); }
    }
    rr(g, -9, open ? 4 : -8, 18, 17, 4, '#ffd23a');
    el(g, 0, open ? 10 : -3, 2.6, 2.6, '#7a4a10', 0); rr(g, -1, open ? 11 : -2, 2, 6, 1, '#7a4a10', 0);
    g.restore();
  }
  const IMG = {};
  function dataUrl(id, w, h, fn) {
    if (IMG[id]) return IMG[id];
    const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2;
    const g = c.getContext('2d'); g.scale(2, 2); fn(g, w, h);
    return (IMG[id] = c.toDataURL('image/png'));
  }
  const cardImg = key => dataUrl('c' + key, 80, 78, (g, w, h) => g.drawImage(portrait(key, 80, 78), 0, 0, w, h));
  const chestImg = (type, open) => dataUrl('ch' + type + (open ? 'o' : ''), 110, 100, (g, w, h) => drawChest(g, w / 2, h * .56, .98, type, open));
  const arenaImg = th => dataUrl('ar' + th, 216, 380, (g, w, h) => g.drawImage(buildArena(th), 0, 0, w, h));
  const IC = {
    trophy: '<svg viewBox="0 0 24 24"><path d="M6 3h12v5a6 6 0 0 1-12 0z" fill="#ffd23a" stroke="#2a2035" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 5H2.5c0 4 1.5 6 4 6.4M18 5h3.5c0 4-1.5 6-4 6.4" fill="none" stroke="#2a2035" stroke-width="1.6" stroke-linecap="round"/><path d="M12 14v4M8 21h8l-1.2-3H9.2z" fill="#ffb02e" stroke="#2a2035" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    gold: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#ffd23a" stroke="#2a2035" stroke-width="1.8"/><circle cx="12" cy="12" r="5.4" fill="none" stroke="#c98d0e" stroke-width="1.8"/><path d="M7 8a7 7 0 0 1 5-2.5" stroke="#fff6c0" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    crown: '<svg viewBox="0 0 24 24"><path d="M3 18l-1-11 6 5 4-8 4 8 6-5-1 11z" fill="#ffd23a" stroke="#2a2035" stroke-width="1.7" stroke-linejoin="round"/><rect x="3" y="17" width="18" height="4" rx="1.5" fill="#ff9a1c" stroke="#2a2035" stroke-width="1.5"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 2c4 5.6 7 8.6 7 12.4a7 7 0 0 1-14 0C5 10.6 8 7.6 12 2z" fill="#d94cf0" stroke="#3d0a52" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="9.2" cy="13" rx="1.5" ry="2.6" fill="#fff" opacity=".6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
    swords: '<svg viewBox="0 0 24 24" fill="none" stroke="#2a2035" stroke-width="1.6" stroke-linejoin="round"><path d="M4 3l9 9-2 2L2 5z" fill="#e8edf5"/><path d="M20 3l-9 9 2 2 9-9z" fill="#e8edf5"/><path d="M3 18l3 3M21 18l-3 3M6 14l4 4M18 14l-4 4" stroke-linecap="round"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="#2a2035" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="6" width="11" height="15" rx="2" fill="#6fb7ff" transform="rotate(-12 8 13)"/><rect x="9" y="3" width="11" height="15" rx="2" fill="#ffb54a" transform="rotate(10 14 10)"/></svg>'
  };
  function makeAudio(api) {
    let ac = null, mg = null, armed = false;
    const last = {};
    const ctx = () => {
      if (!armed) return null;
      if (ac === null) {
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          mg = ac.createGain(); mg.gain.value = .55;
          const cm = ac.createDynamicsCompressor();
          mg.connect(cm); cm.connect(ac.destination);
        } catch (e) { ac = 0; }
      }
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
      return ac || null;
    };
    const tone = (f0, f1, d, type, v, dl) => {
      const a = ctx(); if (!a) return;
      const t0 = a.currentTime + (dl || 0), o = a.createOscillator(), gn = a.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + d);
      gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(v, t0 + .008); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      o.connect(gn); gn.connect(mg); o.start(t0); o.stop(t0 + d + .02);
    };
    const noise = (d, v, f0, f1, dl) => {
      const a = ctx(); if (!a) return;
      const t0 = a.currentTime + (dl || 0), n = Math.max(1, Math.floor(a.sampleRate * d)), b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0);
      for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource(); s.buffer = b;
      const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + d);
      const gn = a.createGain(); gn.gain.setValueAtTime(v, t0); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      s.connect(fl); fl.connect(gn); gn.connect(mg); s.start(t0);
    };
    const SND = {
      tap: () => tone(700, 920, .05, 'square', .05),
      sel: () => tone(520, 800, .07, 'triangle', .1),
      err: () => { tone(220, 150, .13, 'square', .07); },
      dep: () => { tone(240, 110, .13, 'triangle', .2); noise(.1, .1, 1400, 300); },
      hit: () => tone(320, 140, .05, 'square', .035),
      pop: () => tone(520, 980, .1, 'sine', .08),
      boom: () => { noise(.38, .32, 1900, 110); tone(130, 40, .32, 'sine', .4); },
      zap: () => { tone(1500, 260, .16, 'sawtooth', .1); noise(.12, .12, 5000, 800); },
      arrows: () => noise(.28, .1, 3200, 1100),
      ice: () => { tone(1900, 900, .26, 'sine', .1); tone(2500, 1200, .2, 'triangle', .06, .05); },
      gas: () => noise(.45, .09, 700, 260),
      log: () => { tone(120, 70, .45, 'sawtooth', .1); noise(.4, .12, 900, 200); },
      tower: () => { noise(.95, .5, 1000, 60); tone(95, 28, .85, 'sine', .55); },
      alarm: () => { tone(660, 660, .14, 'square', .06); tone(880, 880, .14, 'square', .06, .18); tone(660, 660, .14, 'square', .06, .36); },
      enemy: () => tone(340, 250, .12, 'triangle', .07),
      crown: () => { tone(780, 1180, .12, 'triangle', .12); tone(1040, 1560, .16, 'triangle', .12, .1); },
      win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, f, .22, 'triangle', .14, i * .13)); tone(1046, 1046, .6, 'sine', .1, .52); },
      lose: () => { [440, 392, 330, 262].forEach((f, i) => tone(f, f * .97, .26, 'triangle', .12, i * .17)); },
      chest: () => { tone(200, 90, .3, 'sine', .3); noise(.25, .15, 800, 100); },
      open: () => { tone(300, 900, .35, 'sawtooth', .08); [880, 1175, 1568, 2093].forEach((f, i) => tone(f, f, .3, 'sine', .08, .12 + i * .07)); },
      card: () => { tone(900, 1400, .12, 'sine', .1); tone(1400, 1800, .1, 'sine', .07, .06); },
      coin: () => { tone(1300, 1300, .06, 'square', .05); tone(1750, 1750, .12, 'square', .05, .06); },
      up: () => { [600, 800, 1000, 1300].forEach((f, i) => tone(f, f, .12, 'triangle', .1, i * .07)); },
      ready: () => tone(1000, 1500, .08, 'sine', .06)
    };
    const MIN = { hit: .07, dep: .05, pop: .05, enemy: .12, boom: .08, tap: .03 };
    return {
      arm() { armed = true; ctx(); },
      play(k) {
        if (api.muted || !SND[k]) return;
        const now = performance.now();
        if (last[k] && now - last[k] < (MIN[k] || 0) * 1000) return;
        last[k] = now;
        try { SND[k](); } catch (e) {}
      },
      close() { try { if (ac) ac.close(); } catch (e) {} ac = 0; }
    };
  }

  function mountGame(root, api) {
    const coarse = matchMedia('(pointer: coarse)').matches;
    const wrap = document.createElement('div');
    wrap.className = 'cr-wrap';
    root.append(wrap);
    const cv = document.createElement('canvas');
    cv.className = 'cr-cv';
    wrap.append(cv);
    const g = cv.getContext('2d');
    const ui = document.createElement('div');
    ui.className = 'cr-ui';
    wrap.append(ui);
    const pn = document.createElement('div');
    pn.className = 'cr-pn';
    pn.hidden = true;
    wrap.append(pn);
    const mb = document.createElement('button');
    mb.className = 'cr-mb'; mb.type = 'button'; mb.setAttribute('aria-label', 'Menu'); mb.hidden = true;
    mb.innerHTML = IC.menu;
    wrap.append(mb);
    const tip = document.createElement('div');
    tip.className = 'cr-toast'; tip.hidden = true;
    wrap.append(tip);
    const P = loadProfile(api);
    const au = makeAudio(api);
    const persist = () => api.save(P);
    let RS = 2;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      RS = Math.max(1.5, dpr);
      const w = Math.round(W * RS), h = Math.round(H * RS);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
    resize();
    let view = 'home', tab = 'battle', B = null, CH = null, swap = null, sheetKey = null, lastBD = null;
    const o = { me: 0, now: 0, dt: 0, fx: { parts: [], banner: null }, shake: 0, arena: null, ui: { sel: -1, ptr: null, slotT: [0, 0, 0, 0], last: [-1, -1, -1, -1], kc: false }, snd: k => au.play(k) };
    const ARC = {};
    const arenaCv = th => ARC[th] || (ARC[th] = buildArena(th));
    let toastT = 0;
    function toast(s) {
      tip.textContent = s; tip.hidden = false;
      clearTimeout(toastT);
      toastT = setTimeout(() => { tip.hidden = true; }, 2200);
    }
    const fmtClock = ms => {
      const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60;
      return h ? h + ':' + String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0') : m + ':' + String(r).padStart(2, '0');
    };
    const fmtDur = s => s >= 3600 ? Math.round(s / 3600) + ' h' : s >= 60 ? Math.round(s / 60) + ' min' : s + ' s';
    const NAMES = ['Mira', 'Bruno', 'Kiko', 'Tess', 'Otto', 'Nova', 'Rex', 'Lumi', 'Pip', 'Zara', 'Moss', 'Juno'];

    let pfn = [];
    function panel(p) {
      pfn = [];
      const btns = (p.buttons || []).filter(Boolean).map((b, i) => { pfn.push(b[1]); return `<button type="button" class="cr-b ${b[2] || ''}" data-a="p" data-i="${i}">${b[0]}</button>`; }).join('');
      pn.innerHTML = `<div class="cr-back" data-a="pback"></div><div class="cr-pan ${p.cls || ''}">${p.kicker ? `<p class="k">${p.kicker}</p>` : ''}${p.title ? `<h3 style="${p.col ? 'color:' + p.col : ''}">${p.title}</h3>` : ''}${p.html ? `<div class="bd">${p.html}</div>` : ''}${p.text ? `<p class="tx">${p.text}</p>` : ''}<div class="btns">${btns}</div></div>`;
      pn.hidden = false;
      pn._cancel = p.cancel === undefined ? true : p.cancel;
      pn._onClose = p.onClose || null;
    }
    function closePanel(run) {
      pn.hidden = true; pn.innerHTML = ''; pfn = [];
      const f = pn._onClose; pn._onClose = null;
      if (run !== false && f) f();
    }
    api.on(pn, 'click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      au.arm();
      if (b.dataset.a === 'pback') { if (pn._cancel) { au.play('tap'); closePanel(); } return; }
      if (b.dataset.a === 'p') {
        au.play('tap');
        const f = pfn[+b.dataset.i];
        pn._onClose = null;
        closePanel(false);
        if (f) f();
      }
    });

    const cardHtml = (k, p2) => {
      p2 = p2 || {};
      const D = DEF[k], e = P.cards[k], lk = !e;
      const need = e && e.lv < MAXLV ? copiesFor(k, e.lv) : 0;
      const can = e && need && e.n >= need && P.gold >= goldFor(e.lv);
      return `<div class="cr-cw${p2.cls || ''}"><div class="cr-card r-${D.r}${lk ? ' lk' : ''}" data-a="${p2.a || 'card'}" data-k="${k}"${p2.i != null ? ` data-i="${p2.i}"` : ''}><img src="${cardImg(k)}" alt=""><i class="cost">${D.c}</i>${e ? `<b class="lv">Lv ${e.lv}</b>` : '<b class="lv lkd">?</b>'}${p2.bar && e ? `<u class="bar${need && e.n >= need ? ' ok' : ''}"><s style="width:${need ? Math.min(100, e.n / need * 100) : 100}%"></s><em>${need ? e.n + '/' + need : 'MAX'}</em></u>` : ''}${can ? '<span class="up"></span>' : ''}</div>${p2.nm ? `<span class="nm">${lk ? '?' : esc(D.n)}</span>` : ''}</div>`;
    };
    const hdHtml = () => `<div class="cr-hd"><div class="pill">${IC.trophy}<b>${P.tr}</b></div><div class="logo">Clash Royale</div><div class="pill">${IC.gold}<b>${P.gold}</b></div></div>`;
    function chestHtml() {
      return `<div class="cr-chests">${P.ch.map((c, i) => {
        if (!c) return '<div class="cr-ch empty"><span>Empty slot</span></div>';
        const left = chestLeft(c), st = c.st ? (left <= 0 ? 'ready' : 'run') : 'lock';
        return `<button type="button" class="cr-ch ${st}" data-a="chest" data-i="${i}"><img src="${chestImg(c.t, 0)}" alt=""><b>${CHESTS[c.t].n.replace(' Chest', '')}</b><em data-ct="${i}">${st === 'ready' ? 'Open!' : st === 'run' ? fmtClock(left) : fmtDur(CHESTS[c.t].s)}</em></button>`;
      }).join('')}</div>`;
    }
    function homeHtml() {
      const ai = arenaOf(P.tr), A = ARENAS[ai], nx = ARENAS[ai + 1];
      const prog = nx ? clamp((P.tr - A.t) / (nx.t - A.t), 0, 1) : 1;
      return `<div class="cr-page"><div class="cr-hero" style="background-image:url(${arenaImg(A.th)})"><div class="shade"></div><div class="cr-an"><small>Arena ${ai + 1}</small><b>${esc(A.n)}</b></div><div class="cr-road"><div class="rb"><s style="width:${prog * 100}%"></s></div><span>${nx ? P.tr + ' / ' + nx.t + ' ' + IC.trophy : 'Top arena reached'}</span></div><button type="button" class="cr-go" data-a="battle"><span>Battle</span><small>vs ${esc(DIFFS[P.diff].n)} bot</small></button></div>
<div class="cr-row"><span>Opponent</span><div class="cr-seg">${DIFFS.map((d, i) => `<button type="button" data-a="diff" data-v="${i}" class="${i === P.diff ? 'on' : ''}">${d.n}</button>`).join('')}</div></div>
<button type="button" class="cr-b blue wide" data-a="online">${IC.swords}<span>Friendly battle online</span></button>
<h4>Chests <span>Win battles to earn chests</span></h4>${chestHtml()}
<p class="cr-rec">Wins ${P.w} &middot; Losses ${P.l} &middot; Draws ${P.d} &middot; Three-crown wins ${P.cw} &middot; Best ${P.hi}</p></div>`;
    }
    function cardsHtml() {
      const have = CARD_KEYS.filter(k => P.cards[k]), lock = CARD_KEYS.filter(k => !P.cards[k]);
      const ord = (a, b) => DEF[a].c - DEF[b].c || DEF[a].n.localeCompare(DEF[b].n);
      have.sort(ord); lock.sort(ord);
      return `<div class="cr-page"><h4>Battle deck <span>Average elixir ${deckElix(P).toFixed(1)}</span></h4>
<div class="cr-deck">${P.deck.map((k, i) => cardHtml(k, { a: 'dslot', i, bar: 1, cls: swap ? ' pulse' : '' })).join('')}</div>
${swap ? `<p class="cr-hint">Tap a card in your deck to replace it with <b>${esc(DEF[swap].n)}</b> <button type="button" class="cr-link" data-a="cancelswap">Cancel</button></p>` : '<p class="cr-hint">Tap a card to see its stats. Cards you own: ' + have.length + ' of ' + CARD_KEYS.length + '</p>'}
<h4>Collection</h4><div class="cr-grid">${have.concat(lock).map(k => cardHtml(k, { nm: 1, bar: 1, cls: P.deck.indexOf(k) >= 0 ? ' indeck' : '' })).join('')}</div></div>`;
    }
    function render() {
      if (view !== 'home') return;
      const sc = ui.querySelector('.cr-body');
      const st = sc ? sc.scrollTop : 0;
      ui.hidden = false;
      ui.innerHTML = `${hdHtml()}<div class="cr-body">${tab === 'battle' ? homeHtml() : cardsHtml()}</div><div class="cr-nav"><button type="button" data-a="tab" data-t="battle" class="${tab === 'battle' ? 'on' : ''}">${IC.swords}<span>Battle</span></button><button type="button" data-a="tab" data-t="cards" class="${tab === 'cards' ? 'on' : ''}">${IC.cards}<span>Cards</span>${P.deck.some(k => { const e = P.cards[k]; return e.lv < MAXLV && e.n >= copiesFor(k, e.lv) && P.gold >= goldFor(e.lv); }) ? '<i class="dot"></i>' : ''}</button></div>`;
      const nb = ui.querySelector('.cr-body');
      if (nb) nb.scrollTop = st;
    }
    function showHome() {
      view = 'home'; B = null; CH = null; mb.hidden = true; closePanel(false);
      api.label('Trophies'); api.score(P.tr);
      o.ui.sel = -1; o.ui.ptr = null;
      render();
    }
    function sheet(k) {
      const D = DEF[k], e = P.cards[k], lv = e ? e.lv : 1;
      const need = e && e.lv < MAXLV ? copiesFor(k, e.lv) : 0, cost = e && e.lv < MAXLV ? goldFor(e.lv) : 0;
      const can = e && need && e.n >= need && P.gold >= cost, inDeck = P.deck.indexOf(k) >= 0;
      const rows = statRows(k, lv).map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
      const R = RAR[D.r];
      const lvl = !e ? '<p class="tx">Not unlocked yet. Open chests to find this card.</p>' : e.lv >= MAXLV ? '<p class="tx">Maximum level reached.</p>' : '';
      const btns = [];
      if (e && e.lv < MAXLV) btns.push(['Upgrade to level ' + (e.lv + 1) + `<span class="cst">${IC.gold}${cost}</span>`, () => doUpgrade(k), can ? 'green' : 'dis']);
      if (e && !inDeck) btns.push(['Use in deck', () => { swap = k; render(); }, 'blue']);
      if (e && inDeck) btns.push(['In your deck', null, 'dis']);
      btns.push(['Close', () => {}, '']);
      panel({
        cls: 'sheet',
        html: `<div class="cr-sh-top"><div class="cr-cw big"><div class="cr-card r-${D.r}${e ? '' : ' lk'}"><img src="${cardImg(k)}" alt=""><i class="cost">${D.c}</i>${e ? `<b class="lv">Lv ${lv}</b>` : ''}</div></div><div><h3>${esc(D.n)}</h3><em style="color:${R.col}">${R.n} ${KINDN[D.k]}</em><p>${esc(D.d)}</p></div></div><div class="cr-stats">${rows}</div>${lvl}${e && e.lv < MAXLV ? `<div class="cr-prog${e.n >= need ? ' ok' : ''}"><s style="width:${Math.min(100, e.n / need * 100)}%"></s><em>${e.n} / ${need} cards</em></div>` : ''}`,
        buttons: btns
      });
    }
    function doUpgrade(k) {
      const e = P.cards[k];
      if (!e || e.lv >= MAXLV) return;
      const need = copiesFor(k, e.lv), cost = goldFor(e.lv);
      if (e.n < need) { toast('Not enough cards yet'); au.play('err'); sheet(k); return; }
      if (P.gold < cost) { toast('Not enough gold'); au.play('err'); sheet(k); return; }
      e.n -= need; e.lv++; P.gold -= cost; persist();
      au.play('up'); toast(DEF[k].n + ' is now level ' + e.lv);
      render(); sheet(k);
    }
    function chestTap(i) {
      const c = P.ch[i];
      if (!c) return;
      const left = chestLeft(c);
      if (c.st && left <= 0) { openChest(i); return; }
      const C = CHESTS[c.t], busy = P.ch.some(x => x && x.st && chestLeft(x) > 0);
      const cost = Math.max(5, Math.ceil((c.st ? left : C.s * 1000) / 6000));
      panel({
        kicker: C.n, title: c.st ? 'Unlocking' : 'Locked',
        html: `<div class="cr-chimg"><img src="${chestImg(c.t, 0)}" alt=""></div><p class="tx" data-pc="${i}">${c.st ? fmtClock(left) + ' left' : 'Unlock time ' + fmtDur(C.s)}</p>${!c.st && busy ? '<p class="tx sm">Another chest is already unlocking.</p>' : ''}`,
        buttons: [
          !c.st && !busy ? ['Start unlock', () => { c.st = Date.now(); persist(); au.play('chest'); render(); }, 'green'] : null,
          [`Open now<span class="cst">${IC.gold}${cost}</span>`, () => {
            if (P.gold < cost) { toast('Not enough gold'); au.play('err'); return; }
            P.gold -= cost; c.st = Date.now() - C.s * 1000 - 5; persist(); openChest(i);
          }, P.gold >= cost ? 'gold' : 'dis'],
          ['Close', () => {}, '']
        ]
      });
    }
    function openChest(i) {
      const c = P.ch[i];
      if (!c) return;
      const roll = chestRoll(c.t), res = chestApply(P, roll);
      P.ch[i] = null; persist();
      CH = { type: c.t, res, t0: performance.now(), phase: 'drop', pt: 0, idx: -1, shown: 0, rays: 0 };
      view = 'chest'; ui.hidden = true; mb.hidden = true; closePanel(false);
      au.play('chest');
    }
    function chestTapScene() {
      if (!CH) return;
      if (CH.phase === 'wait') { CH.phase = 'burst'; CH.pt = 0; au.play('open'); return; }
      if (CH.phase === 'rew') {
        if (CH.shown < .5) return;
        CH.idx++; CH.shown = 0;
        if (CH.idx >= CH.res.length) { CH.phase = 'done'; showHome(); return; }
        const r = CH.res[CH.idx];
        au.play(r.k === 'gold' ? 'coin' : 'card');
      }
    }
    function act(a, d) {
      au.arm();
      if (a === 'tab') { tab = d.t; au.play('tap'); swap = null; render(); }
      else if (a === 'battle') { au.play('tap'); startSolo(); }
      else if (a === 'online') { au.play('tap'); goOnline(); }
      else if (a === 'diff') { P.diff = +d.v; persist(); au.play('tap'); render(); }
      else if (a === 'chest') { au.play('tap'); chestTap(+d.i); }
      else if (a === 'card') { au.play('tap'); sheet(d.k); }
      else if (a === 'dslot') {
        if (swap) {
          const i = +d.i;
          P.deck[i] = swap; swap = null; persist(); au.play('up'); render();
        } else { au.play('tap'); sheet(d.k); }
      } else if (a === 'cancelswap') { swap = null; render(); }
    }
    api.on(ui, 'click', e => {
      const b = e.target.closest('[data-a]');
      if (b) act(b.dataset.a, b.dataset);
    });
    api.interval(() => {
      if (view !== 'home' || !pn.hidden && !pn.querySelector('[data-pc]')) return;
      let reflow = false;
      P.ch.forEach((c, i) => {
        if (!c || !c.st) return;
        const left = chestLeft(c), t = ui.querySelector(`[data-ct="${i}"]`), p = pn.querySelector(`[data-pc="${i}"]`);
        if (left <= 0) { if (t && t.textContent !== 'Open!') reflow = true; if (p) closePanel(false); }
        else { if (t) t.textContent = fmtClock(left); if (p) p.textContent = fmtClock(left) + ' left'; }
      });
      if (reflow) { au.play('ready'); render(); }
    }, 1000);

    function startSolo() {
      const df = DIFFS[P.diff];
      const bd = pick(BOTDECKS.filter(d => d !== lastBD));
      lastBD = bd;
      const kl0 = deckKL(P), kl1 = clamp(kl0 + df.lv, 1, MAXLV), lv0 = {};
      P.deck.forEach(k => { lv0[k] = P.cards[k].lv; });
      const S = newSim({ decks: [P.deck.slice(), bd.d.slice()], kl: [kl0, kl1], lv: [lv0, {}], names: ['You', pick(NAMES)], me: 0 });
      S.bots[1] = makeBot(1, P.diff);
      beginBattle(S, 0, 'solo', { th: ARENAS[arenaOf(P.tr)].th, di: P.diff });
    }
    function beginBattle(S, me, mode, ex) {
      B = Object.assign({ S, me, mode, acc: 0, k: 0, evq: [], over: 0, overAt: 0, paused: false, shown: false, res: null, R: null }, ex);
      o.me = me; o.arena = arenaCv(B.th); o.fx = { parts: [], banner: null }; o.shake = 0;
      o.ui.sel = -1; o.ui.ptr = null; o.ui.kc = false; o.ui.last = [-1, -1, -1, -1]; o.ui.slotT = [0, 0, 0, 0];
      view = 'battle'; ui.hidden = true; closePanel(false); mb.hidden = false;
      drag = null;
    }
    function applyResult(S) {
      const win = S.win, df = DIFFS[B.di], cr = S.cr;
      const r = { win, cr: cr.slice(), tr: 0, gold: 0, chest: null, lost: null, up: '' };
      const a0 = arenaOf(P.tr);
      if (win === 0) {
        r.tr = df.win + (cr[0] === 3 ? 5 : 0); r.gold = df.gold + 4 * cr[0];
        P.w++; if (cr[0] === 3) P.cw++;
        const typ = CYCLE[P.cyc % CYCLE.length]; P.cyc++;
        const sl = P.ch.findIndex(c => !c);
        if (sl >= 0) { P.ch[sl] = { t: typ, st: 0 }; r.chest = typ; } else r.lost = typ;
      } else if (win === 1) {
        r.tr = -Math.min(P.tr, df.loss); r.gold = 2 * cr[0]; P.l++;
      } else { P.d++; r.gold = 3; }
      P.tr += r.tr; P.hi = Math.max(P.hi, P.tr); P.gold += r.gold; P.crowns += cr[0]; api.score(P.tr); api.submit(P.hi);
      const a1 = arenaOf(P.tr);
      if (a1 > a0) r.up = ARENAS[a1].n;
      persist();
      return r;
    }
    function crownRow(n) { return [0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}">${IC.crown}</i>`).join(''); }
    function showResults() {
      B.shown = true;
      const S = B.S, me = B.me, R = B.R || S, win = R.win != null ? R.win : S.win;
      const mine = win === me, draw = win === 2;
      const cr = R.cr || S.cr;
      au.play(draw ? 'tap' : mine ? 'win' : 'lose');
      let rows = '', btns;
      if (B.mode === 'solo') {
        const r = B.res;
        rows = `<div class="rw">${IC.trophy}<span>Trophies</span><b class="${r.tr > 0 ? 'pos' : r.tr < 0 ? 'neg' : ''}">${r.tr > 0 ? '+' : ''}${r.tr}</b></div><div class="rw">${IC.gold}<span>Gold</span><b class="pos">+${r.gold}</b></div>`;
        if (r.chest) rows += `<div class="rw ch"><img src="${chestImg(r.chest, 0)}" alt=""><span>${CHESTS[r.chest].n} earned</span><b class="pos">New</b></div>`;
        if (r.lost) rows += '<p class="tx sm">Your chest slots are full, so this chest was lost. Open one first.</p>';
        if (r.up) rows += `<p class="tx up">New arena unlocked: ${esc(r.up)}</p>`;
        btns = [['Battle again', startSolo, 'green'], ['Home', showHome, '']];
      } else {
        rows = '<p class="tx sm">Friendly battles do not change trophies or chests.</p>';
        btns = B.mode === 'host'
          ? [['Rematch', rematch, 'green'], ['Back to lobby', toLobby, 'blue'], ['Leave', leaveOnline, '']]
          : [['Ask for rematch', askRematch, 'green'], ['Leave', leaveOnline, '']];
      }
      panel({
        cls: 'result', cancel: false, kicker: B.mode === 'solo' ? DIFFS[B.di].n + ' bot' : 'Friendly battle',
        title: draw ? 'Draw' : mine ? 'Victory!' : 'Defeat', col: draw ? '#fff' : mine ? '#ffd23a' : '#ff7b7b',
        html: `<div class="cr-crowns"><div class="you">${crownRow(cr[me])}</div><span>vs</span><div class="opp">${crownRow(cr[1 - me])}</div></div>${rows}${B.mode === 'guest' ? '<p class="tx sm" data-rm></p>' : ''}`,
        buttons: btns
      });
    }
    function surrender() {
      if (!B || B.over) return;
      B.paused = false;
      if (B.mode === 'guest') api.net.send({ t: 'sur' });
      else endMatch(B.S, 1 - B.me);
    }
    function battleMenu() {
      if (!B || B.over || view !== 'battle') return;
      au.arm();
      if (B.mode === 'solo') B.paused = true;
      const resume = () => { if (B) B.paused = false; };
      panel({
        kicker: 'Battle', title: B.mode === 'solo' ? 'Paused' : 'Menu', onClose: resume,
        buttons: [
          ['Resume', resume, 'green'],
          ['Surrender', () => panel({ title: 'Surrender?', text: B.mode === 'solo' ? 'You lose this battle and the trophies that go with it.' : 'The match ends with a loss for you.', onClose: resume, buttons: [['Keep fighting', resume, 'green'], ['Surrender', surrender, 'red']] }), 'red'],
          B.mode !== 'solo' ? ['Leave game', () => leaveOnline(), ''] : ['Quit to home', () => { B = null; showHome(); }, '']
        ]
      });
    }
    api.on(mb, 'click', battleMenu);

    function evFx(e) {
      if (e[0] === 'end') {
        const w = e[1], mine = w === o.me;
        o.fx.banner = { s: w === 2 ? 'Draw' : mine ? 'Victory!' : 'Defeat', col: w === 2 ? '#fff' : mine ? '#ffd23a' : '#ff6a6a', t: 0, life: 3.6 };
        return;
      }
      fxMake(o, e);
    }
    function stepOnce() {
      const S = B.S;
      step(S, STEP); B.k++;
      if (S.ev.length) {
        for (const e of S.ev) { evFx(e); if (B.mode === 'host') B.evq.push(e); }
        S.ev.length = 0;
      }
      if (B.mode === 'host') netTick();
      if (S.over && !B.over) {
        B.over = 1; B.overAt = o.now;
        if (B.mode === 'solo') B.res = applyResult(S);
        if (B.mode === 'host') netEnd();
        clearSave();
      }
    }
    const curHand = () => B ? (B.mode === 'guest' ? (B.R && B.R.hands[B.me]) : B.S.hands[B.me]) : null;
    function doPlace(slot, wx, wy) {
      const h = curHand();
      if (!h || !h.slots) return false;
      const di = h.slots[slot], key = h.deck[di], D = DEF[key];
      const R = B.mode === 'guest' ? B.R : B.S;
      if (!R || R.intro > 0) return false;
      if (R.el[B.me] < D.c - 1e-6) { toast('Not enough elixir'); au.play('err'); return false; }
      if (!placeOK(R, B.me, key, wx, wy)) { au.play('err'); return false; }
      if (B.mode === 'guest') {
        api.net.send({ t: 'p', d: di, x: +wx.toFixed(2), y: +wy.toFixed(2) });
        au.play('tap');
        o.fx.parts.push({ k: 'ring', x: wx, y: wy, r: 1, col: 'rgba(255,255,255,.8)', t: 0, life: .3 });
        return true;
      }
      if (!play(B.S, B.me, slot, wx, wy)) { au.play('err'); return false; }
      if (P.hint < 3) { P.hint = 3; persist(); }
      return true;
    }
    let drag = null;
    const cpos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    const w2 = (x, y) => ({ x: B.me === 1 ? AW - x / T : x / T, y: B.me === 1 ? AH - (y - AY) / T : (y - AY) / T });
    function setPtr(p, touch) {
      o.ui.ptr = { x: clamp(p.x, 2, W - 2), y: clamp(touch ? p.y - 26 : p.y, AY + 2, TRY - 2) };
      o.ui.kc = false;
    }
    function tryPlace() {
      const U = o.ui;
      if (U.sel < 0 || !U.ptr) return false;
      const wp = w2(U.ptr.x, U.ptr.y);
      if (doPlace(U.sel, wp.x, wp.y)) { U.sel = -1; U.ptr = null; return true; }
      return false;
    }
    api.on(cv, 'pointerdown', e => {
      au.arm();
      if (view === 'chest') { e.preventDefault(); chestTapScene(); return; }
      if (view !== 'battle' || !B || B.over || !pn.hidden) return;
      e.preventDefault();
      const p = cpos(e), U = o.ui, h = curHand();
      if (!h) return;
      const hi = trayHit(p.x, p.y), touch = e.pointerType !== 'mouse';
      if (hi >= 0) {
        const was = U.sel === hi;
        U.sel = hi; U.ptr = null; U.kc = false;
        drag = { kind: 'card', id: e.pointerId, sx: p.x, sy: p.y, moved: false, was, touch };
        au.play('sel');
        try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      } else if (U.sel >= 0 && p.y >= AY && p.y < TRY) {
        drag = { kind: 'place', id: e.pointerId, sx: p.x, sy: p.y, moved: true, touch };
        setPtr(p, touch);
        try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      }
    });
    api.on(cv, 'pointermove', e => {
      if (view !== 'battle' || !B) return;
      const p = cpos(e), U = o.ui;
      if (drag && drag.id === e.pointerId) {
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 6) drag.moved = true;
        if (p.y >= AY && p.y < TRY - 4 && (drag.kind === 'place' || drag.moved)) setPtr(p, drag.touch);
        else if (p.y >= TRY - 4 && drag.kind === 'card') U.ptr = null;
      } else if (!drag && e.pointerType === 'mouse' && U.sel >= 0) {
        if (p.y >= AY && p.y < TRY - 4) setPtr(p, false);
        else if (!U.kc) U.ptr = null;
      }
    });
    const upEnd = e => {
      if (!drag || drag.id !== e.pointerId) return;
      const d = drag; drag = null;
      if (!B || B.over || view !== 'battle') return;
      const p = cpos(e), U = o.ui, inA = p.y >= AY && p.y < TRY - 2;
      if (d.kind === 'card') {
        if (d.moved && inA) { setPtr(p, d.touch); if (!tryPlace()) { U.sel = -1; U.ptr = null; } }
        else if (d.moved) { U.sel = -1; U.ptr = null; }
        else if (d.was) { U.sel = -1; U.ptr = null; }
      } else if (inA) { setPtr(p, d.touch); tryPlace(); }
    };
    api.on(cv, 'pointerup', upEnd);
    api.on(cv, 'pointercancel', e => { if (drag && drag.id === e.pointerId) drag = null; });
    api.on(cv, 'contextmenu', e => e.preventDefault());
    api.on(window, 'keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const k = e.key;
      if (view === 'chest' && (k === ' ' || k === 'Enter')) { e.preventDefault(); au.arm(); chestTapScene(); return; }
      if (view !== 'battle' || !B || B.over || !pn.hidden) return;
      const U = o.ui;
      if (k >= '1' && k <= '4') {
        au.arm();
        const i = +k - 1;
        U.sel = U.sel === i ? -1 : i;
        if (U.sel >= 0 && !U.ptr) U.ptr = { x: W / 2, y: 640 };
        if (U.sel < 0) U.ptr = null;
        U.kc = true; au.play('sel'); e.preventDefault();
      } else if (U.sel >= 0 && U.ptr && /^(Arrow(Left|Right|Up|Down)|[wasdWASD])$/.test(k)) {
        const st = e.shiftKey ? 30 : 10, dx = /Left|a|A/.test(k) ? -1 : /Right|d|D/.test(k) ? 1 : 0, dy = /Up|w|W/.test(k) ? -1 : /Down|s|S/.test(k) ? 1 : 0;
        U.ptr = { x: clamp(U.ptr.x + dx * st, 4, W - 4), y: clamp(U.ptr.y + dy * st, AY + 4, TRY - 4) };
        U.kc = true; e.preventDefault();
      } else if ((k === ' ' || k === 'Enter') && U.sel >= 0 && U.ptr) { e.preventDefault(); tryPlace(); }
    });

    function hintDraw(R) {
      if (P.hint >= 3 || B.mode !== 'solo' || R.intro > 0 || B.over) return;
      const s = o.ui.sel >= 0 ? 'Now tap or drag it onto your side of the arena' : 'Pick a card, then drop it on your side';
      g.save();
      g.globalAlpha = .75 + .25 * Math.sin(o.now / 300);
      rr(g, 36, TRY - 34, 360, 26, 13, 'rgba(20,14,50,.82)', 0);
      txt(g, s, W / 2, TRY - 21, 12.5, '#fff', 'center');
      g.restore();
    }
    function battleFrame(dt, now) {
      let R;
      if (B.mode === 'guest') R = guestFrame(now);
      else {
        if (!B.paused) {
          B.acc += dt;
          let n = 0;
          while (B.acc >= STEP && n < 5) { B.acc -= STEP; stepOnce(); n++; }
          if (n === 5) B.acc = 0;
        }
        const a = clamp(B.acc / STEP, 0, 1);
        R = B.S;
        for (const u of R.units) { u.rx = u.px + (u.x - u.px) * a; u.ry = u.py + (u.y - u.py) * a; }
        if (B.mode === 'host') hostSave(now);
      }
      if (!R) { g.setTransform(RS, 0, 0, RS, 0, 0); g.fillStyle = '#171a45'; g.fillRect(0, 0, W, H); txt(g, 'Waiting for the host...', W / 2, H / 2, 22, '#fff'); return; }
      const h = R.hands[B.me];
      if (h && h.slots) for (let i = 0; i < 4; i++) if (o.ui.last[i] !== h.slots[i]) { o.ui.last[i] = h.slots[i]; o.ui.slotT[i] = now; }
      if (o.ui.sel >= 0 && h && h.slots && R.intro <= 0) {
        const D = DEF[h.deck[h.slots[o.ui.sel]]];
        if (!D) o.ui.sel = -1;
      }
      g.setTransform(RS, 0, 0, RS, 0, 0);
      drawBattle(g, R, o);
      hintDraw(R);
      if (B.over && !B.shown && now - B.overAt > 2300) showResults();
    }

    function chestFrame(dt, now) {
      const C = CH;
      g.setTransform(RS, 0, 0, RS, 0, 0);
      const cx = W / 2, cy = 400;
      const bg = g.createRadialGradient(cx, cy, 20, cx, cy, 640);
      bg.addColorStop(0, '#6a45c0'); bg.addColorStop(1, '#190f42');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      if (C.phase === 'burst' || C.phase === 'rew') {
        C.rays += dt * .35;
        for (let i = 0; i < 12; i++) {
          const a = C.rays + i * TAU / 12;
          g.beginPath(); g.moveTo(cx, C.phase === 'rew' ? 170 : cy);
          g.lineTo(cx + Math.cos(a - .09) * 900, (C.phase === 'rew' ? 170 : cy) + Math.sin(a - .09) * 900);
          g.lineTo(cx + Math.cos(a + .09) * 900, (C.phase === 'rew' ? 170 : cy) + Math.sin(a + .09) * 900);
          g.closePath(); g.fillStyle = 'rgba(255,225,130,.1)'; g.fill();
        }
      }
      const sd = seeded(5);
      for (let i = 0; i < 26; i++) {
        const x = sd() * W, y0 = sd() * H, sp = 6 + sd() * 18, y = (y0 + now / 1000 * sp) % H, r = 1 + sd() * 2;
        g.globalAlpha = .25 + .35 * Math.abs(Math.sin(now / 500 + i)); el(g, x, y, r, r, '#ffe9a8', 0);
      }
      g.globalAlpha = 1;
      if (C.phase === 'drop') {
        C.pt += dt;
        const f = Math.min(1, C.pt / .9), yy = cy - (1 - f) * (1 - f) * 520 - Math.abs(Math.sin(f * Math.PI * 2.5)) * (1 - f) * 70;
        drawChest(g, cx, yy, 2.4, C.type, false, 0, 0);
        if (C.pt > 1.05) { C.phase = 'wait'; C.pt = 0; }
      } else if (C.phase === 'wait') {
        C.pt += dt;
        drawChest(g, cx, cy, 2.4 + Math.sin(now / 260) * .04, C.type, false, Math.sin(now / 70) * (.6 + .4 * Math.sin(now / 400)), .6 + .4 * Math.sin(now / 300));
        g.globalAlpha = .6 + .4 * Math.sin(now / 250);
        txt(g, 'Tap to open', cx, 640, 26, '#fff', 'center', '#2a2035');
        g.globalAlpha = 1;
        txt(g, CHESTS[C.type].n, cx, 190, 30, '#fff', 'center', '#2a2035');
      } else if (C.phase === 'burst') {
        C.pt += dt;
        const f = clamp(C.pt / .9, 0, 1);
        drawChest(g, cx, cy, 2.4 + f * .3, C.type, C.pt > .22, C.pt < .22 ? Math.sin(now / 30) * 1.2 : 0, 0);
        for (let i = 0; i < 22; i++) {
          const a = i * TAU / 22 + .3, d = f * (160 + (i % 5) * 50);
          g.globalAlpha = 1 - f; el(g, cx + Math.cos(a) * d, cy - 40 + Math.sin(a) * d * .8 - f * 40, 5, 5, i % 2 ? '#ffe35a' : '#fff', 0);
        }
        g.globalAlpha = 1;
        if (C.pt < .6) { g.fillStyle = `rgba(255,255,255,${(.6 - C.pt) / .6})`; g.fillRect(0, 0, W, H); }
        if (C.pt > .95) { C.phase = 'rew'; C.idx = 0; C.shown = 0; au.play('coin'); }
      } else if (C.phase === 'rew') {
        C.shown += dt;
        drawChest(g, cx, 170, 1.2, C.type, true, 0, 0);
        const r = C.res[C.idx];
        const f = clamp(C.shown / .4, 0, 1), pop = 1 + (1 - Math.pow(1 - f, 3)) * 0 + Math.sin(f * Math.PI) * .12;
        const sc = (f < 1 ? 1 - Math.pow(1 - f, 3) : 1) * pop;
        g.save(); g.translate(cx, 440); g.scale(sc, sc);
        if (r.k === 'gold') {
          el(g, 0, -10, 78, 78, '#ffd23a', 4);
          el(g, 0, -10, 52, 52, null, 5); g.strokeStyle = '#c98d0e'; g.stroke();
          pl(g, [[-34, -34], [-20, -52], [10, -58], [-18, -40]], 'rgba(255,255,255,.55)', 0);
          txt(g, '+' + Math.round(r.n * Math.min(1, C.shown / .9)), 0, 120, 52, '#ffe36b', 'center', '#2a2035');
          txt(g, 'Gold', 0, 170, 26, '#fff', 'center', '#2a2035');
        } else {
          const D = DEF[r.k], Rr = RAR[D.r];
          g.save(); g.shadowColor = Rr.col; g.shadowBlur = 26;
          g.drawImage(portrait(r.k, 160, 156), -110, -150, 220, 214);
          g.restore();
          dropIcon(g, -92, -128, 18); txt(g, String(D.c), -92, -123, 24, '#fff', 'center', '#3d0a52');
          txt(g, D.n, 0, 100, 30, '#fff', 'center', '#2a2035');
          txt(g, Rr.n.toUpperCase(), 0, 130, 15, Rr.col, 'center', '#2a2035');
          if (r.nw) { g.save(); g.translate(86, -130); g.rotate(.2); rr(g, -50, -14, 100, 28, 8, '#ff4d6d', 2); txt(g, 'NEW CARD!', 0, 1, 15, '#fff', 'center'); g.restore(); }
          txt(g, 'x' + r.n, 0, 178, 46, '#ffe36b', 'center', '#2a2035');
          const lv = r.lv, need = lv < MAXLV ? copiesFor(r.k, lv) : 0;
          if (need) {
            const af = clamp((C.shown - .35) / .7, 0, 1), have = r.before + r.n, cur = (r.before + (have - r.before) * af) / need;
            rr(g, -130, 206, 260, 22, 11, 'rgba(10,6,34,.8)', 2);
            rr(g, -127, 209, Math.max(8, 254 * Math.min(1, cur)), 16, 8, have >= need ? '#7be34a' : '#e75cff', 0);
            txt(g, Math.min(have, 99999) + ' / ' + need, 0, 218, 14, '#fff', 'center', '#2a2035');
            if (have >= need) txt(g, 'Ready to upgrade!', 0, 250, 16, '#9bff7a', 'center', '#2a2035');
          }
        }
        g.restore();
        if (C.shown > .5) {
          g.globalAlpha = .6 + .4 * Math.sin(now / 250);
          txt(g, C.idx >= C.res.length - 1 ? 'Tap to finish' : 'Tap to continue', cx, 800, 20, '#fff', 'center', '#2a2035');
          g.globalAlpha = 1;
        }
        txt(g, (C.idx + 1) + ' / ' + C.res.length, cx, 40, 16, 'rgba(255,255,255,.7)', 'center');
      }
    }

    const N = { role: null, gid: null, hooked: false, gdeck: null, gname: 'Guest', players: [], wait: false, to: 0, rm: 0 };
    const RO = { title: 'Clash Royale', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true };
    const SK = 'gameplay:crsave';
    const rd = v => Math.round(v * 100) / 100;
    const myName = () => { const m = api.net.players && api.net.players.find(p => p.id === api.net.id); return m ? String(m.name).slice(0, 16) : 'You'; };
    const validDeck = d => Array.isArray(d) && d.length === 8 && d.every((k, i) => typeof k === 'string' && DEF[k] && DEF[k].c && d.indexOf(k) === i);
    function clearSave() { try { sessionStorage.removeItem(SK); } catch (e) {} }
    function hostSave(now) {
      if (!B || B.mode !== 'host' || !B.S || B.over || now - (B.saveAt || 0) < 2000) return;
      B.saveAt = now;
      try { sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), th: B.th, S: JSON.stringify(B.S, saveReplacer) })); } catch (e) {}
    }
    function loadSave() {
      try {
        const x = JSON.parse(sessionStorage.getItem(SK) || 'null');
        if (x && x.code && x.code === api.net.code && x.S && Date.now() - x.at < 432e5) return x;
      } catch (e) {}
      return null;
    }
    function waitPanel(title, text, withLeave) {
      view = 'wait'; ui.hidden = true; mb.hidden = true;
      panel({ cls: 'wait', kicker: 'Online', title, text, cancel: false, buttons: withLeave === false ? [] : [['Leave', leaveOnline, '']] });
    }
    async function goOnline() {
      if (!N.hooked) hookNet();
      B = null; N.role = null; N.wait = false; clearTimeout(N.to);
      view = 'wait'; ui.hidden = true; mb.hidden = true; closePanel(false);
      const r = await api.net.room(RO);
      if (!api.alive) return;
      if (!r) { showHome(); return; }
      N.role = r.role; N.players = r.players || [];
      if (r.role === 'host') {
        N.gid = N.players[1] ? N.players[1].id : null;
        N.gdeck = null; N.gname = N.players[1] ? String(N.players[1].name).slice(0, 16) : 'Guest';
        waitPanel('Get ready', N.gid ? 'Waiting for your opponent...' : 'Starting against a bot...');
        if (N.gid) { N.wait = true; N.to = setTimeout(() => { if (api.alive && N.wait) hostStart(); }, 2500); } else hostStart();
      } else {
        waitPanel('Connected', 'Waiting for the host to start...');
        api.net.send({ t: 'hi', deck: P.deck.slice(), name: myName() });
      }
    }
    function hostStart() {
      N.wait = false; clearTimeout(N.to);
      const sv = loadSave();
      if (!sv) { newOnline(); return; }
      view = 'wait'; ui.hidden = true;
      panel({
        cls: 'wait', cancel: false, kicker: 'Online', title: 'Battle in progress',
        text: 'A saved battle from this party was found. Resume it, or start a new one.',
        buttons: [['Resume game', () => resumeOnline(sv), 'green'], ['New battle', () => { clearSave(); newOnline(); }, 'blue'], ['Leave', leaveOnline, '']]
      });
    }
    function sendCfg(to) {
      if (!B || !B.S || !N.gid) return;
      api.net.sendTo(to || N.gid, { t: 'cfg', me: 1, names: B.S.names, deck: B.S.hands[1].deck, th: B.th });
    }
    function newOnline() {
      N.rm = 0;
      const bot = !N.gid, bd = bot ? pick(BOTDECKS) : null;
      const gd = !bot && validDeck(N.gdeck) ? N.gdeck.slice() : STARTERS.slice();
      const gp = !bot && api.net.players && api.net.players.find(p => p.id === N.gid);
      if (gp && gp.name) N.gname = String(gp.name).replace(/[<>&"']/g, '').slice(0, 16);
      const names = [myName(), bot ? pick(NAMES) + ' (bot)' : N.gname];
      const S = newSim({ decks: [P.deck.slice(), bot ? bd.d.slice() : gd], kl: [ONLINE_LV, ONLINE_LV], lv: [{}, {}], names, me: 0 });
      if (bot) S.bots[1] = makeBot(1, P.diff);
      beginBattle(S, 0, 'host', { th: ARENAS[arenaOf(P.tr)].th });
      sendCfg();
    }
    function resumeOnline(sv) {
      N.players = N.players || [];
      const S = JSON.parse(sv.S);
      rebuild(S);
      S.ev = [];
      N.rm = 0;
      if (!N.gid) { S.bots[1] = makeBot(1, P.diff); if (!/\(bot\)$/.test(S.names[1])) S.names[1] += ' (bot)'; }
      beginBattle(S, 0, 'host', { th: sv.th });
      B.k = 0;
      sendCfg(); netSnap(true);
      toast('Battle resumed');
    }
    function netTick() {
      if (!N.gid || B.over) { B.evq.length = 0; return; }
      if (B.k % 2 === 0) netSnap(false);
    }
    function netEnd() { if (N.gid) netSnap(true); }
    function netSnap(full) {
      if (!B || B.mode !== 'host' || !B.S || !N.gid) return;
      const S = B.S, h = S.hands[1], ev = B.evq;
      B.evq = [];
      const u = S.units.map(x => [x.id, KIDX[x.key], x.s, rd(x.x), rd(x.y), Math.max(0, Math.round(x.hp)), x.mhp, rd(x.dep), (x.d ? 1 : 0) | (x.stun > 0 ? 2 : 0) | (x.frz > 0 ? 4 : 0), x.fx, x.atk > 0 ? 1 : 0, x.hit > 0 ? 1 : 0, x.ti == null ? -1 : x.ti, x.tg || 0, x.lv, rd(x.cd)]);
      const p = S.projs.map(q => [q.id, q.k, q.key || 0, q.s, rd(q.x), rd(q.y), rd(q.tx), rd(q.ty), rd(q.x0), rd(q.y0), q.ar || 0, rd(q.t), rd(q.dur || 1)]);
      const z = S.zones.map(q => [q.id, q.s, rd(q.x), rd(q.y), q.r]);
      const l = S.logs.map(q => [q.id, q.s, rd(q.x), rd(q.y), q.dir, rd(q.trav), q.r]);
      const m = { t: 's', k: B.k, per: S.per, left: rd(S.left), mult: S.mult, intro: rd(S.intro), cr: S.cr, act: S.act, el: rd(S.el[1]), h: h.slots.concat([h.next]), u, p, z, l, ev: ev.map(e => e.map(v => typeof v === 'number' ? rd(v) : v)) };
      if (S.over) { m.ov = 1; m.win = S.win; }
      api.net.sendTo(N.gid, m, !m.ev.length && !S.over && !full);
    }
    function guestStart(d) {
      if (!d || !validDeck(d.deck)) return;
      closePanel(false);
      beginBattle(null, d.me | 0, 'guest', { th: THEMES[d.th] ? d.th : 'meadow', G: { buf: [], off: null, lastK: -1, deck: d.deck.slice(), names: (d.names || ['Host', 'You']).map(s => String(s).slice(0, 24)), vu: new Map(), fr: 0 } });
    }
    function guestSnap(d) {
      if (!B || B.mode !== 'guest' || !d || !Array.isArray(d.u)) return;
      const G = B.G;
      if (d.k <= G.lastK) return;
      G.lastK = d.k;
      const rtm = performance.now(), ts = d.k * STEP * 1000, ofs = rtm - ts;
      G.off = G.off == null ? ofs : Math.min(ofs, G.off + .4);
      const um = new Map(), pm = new Map();
      for (const t of d.u) um.set(t[0], t);
      for (const t of d.p) pm.set(t[0], t);
      G.buf.push({ ts, rtm, per: d.per, left: d.left, mult: d.mult, intro: d.intro, cr: d.cr, act: d.act, el: d.el, h: d.h, um, pm, z: d.z, l: d.l, ev: d.ev || [], ov: d.ov, win: d.win, fired: 0 });
      if (G.buf.length > 14) G.buf.shift();
    }
    function guestFrame(now) {
      const G = B.G;
      if (!G.buf.length) return null;
      const rt = now - G.off - 110, buf = G.buf, me = B.me;
      for (const s of buf) if (!s.fired && s.ts <= rt) { s.fired = 1; for (const e of s.ev) evFx(e); }
      while (buf.length > 2 && buf[1].ts <= rt) buf.shift();
      let a = buf[0], b = buf[1] || null;
      if (b && b.ts <= rt) { a = b; b = null; }
      const f = b ? clamp((rt - a.ts) / (b.ts - a.ts), 0, 1) : 0, base = f < .5 || !b ? a : b;
      let R = B.R;
      if (!R) {
        R = B.R = { units: [], projs: [], zones: [], logs: [], hands: [], el: [0, 0], cr: [0, 0], per: 'reg', left: 0, mult: 1, intro: 2.5, names: G.names, act: [0, 0], m: new Map(), over: 0, win: -1 };
        R.hands[me] = { deck: G.deck, slots: [0, 1, 2, 3], next: 4, queue: [] };
        R.hands[1 - me] = { deck: [], slots: null, next: 0, queue: [] };
      }
      G.fr++;
      R.units.length = 0; R.m.clear();
      for (const [id, t] of base.um) {
        let u = G.vu.get(id);
        const key = KEYS[t[1]];
        if (!u) { u = { id, key, s: t[2], D: DEF[key], w: Math.random() * 6, lx: t[3], ly: t[4], x: t[3], y: t[4], rx: t[3], ry: t[4], px: t[3], py: t[4], kx: 0, ky: 0, sp: 0, life: 0, rt: 0, ch: 0 }; G.vu.set(id, u); }
        const ta = a.um.get(id), tb = b ? b.um.get(id) : null;
        let x = t[3], y = t[4];
        if (ta && tb) { x = ta[3] + (tb[3] - ta[3]) * f; y = ta[4] + (tb[4] - ta[4]) * f; }
        u.seen = G.fr;
        u.w += Math.hypot(x - u.lx, y - u.ly) * 2.4; u.lx = x; u.ly = y;
        u.x = u.rx = x; u.y = u.ry = y;
        u.hp = t[5]; u.mhp = t[6]; u.dep = t[7]; u.d = t[8] & 1; u.stun = t[8] & 2 ? .5 : 0; u.frz = t[8] & 4 ? 1 : 0;
        u.fx = t[9]; u.atk = t[10] ? .15 : 0; u.hit = t[11] ? .1 : 0;
        u.ti = t[12] < 0 ? undefined : t[12]; u.tg = t[13]; u.lv = t[14]; u.cd = t[15];
        R.units.push(u); R.m.set(id, u);
      }
      if (G.fr % 30 === 0) for (const [id, u] of G.vu) if (u.seen !== G.fr) G.vu.delete(id);
      R.projs.length = 0;
      for (const [id, t] of base.pm) {
        const ta = a.pm.get(id), tb = b ? b.pm.get(id) : null;
        let x = t[4], y = t[5];
        if (ta && tb) { x = ta[4] + (tb[4] - ta[4]) * f; y = ta[5] + (tb[5] - ta[5]) * f; }
        R.projs.push({ id, k: t[1], key: t[2], s: t[3], x, y, tx: t[6], ty: t[7], x0: t[8], y0: t[9], ar: t[10], t: t[11], dur: t[12] });
      }
      R.zones.length = 0;
      for (const t of base.z) R.zones.push({ id: t[0], s: t[1], x: t[2], y: t[3], r: t[4] });
      R.logs.length = 0;
      for (const t of base.l) R.logs.push({ id: t[0], s: t[1], x: t[2], y: t[3], dir: t[4], trav: t[5], r: t[6] });
      R.per = a.per; R.mult = a.mult; R.cr = a.cr; R.act = a.act;
      R.left = b ? a.left + (b.left - a.left) * f : a.left;
      R.intro = a.intro;
      const h = R.hands[me];
      h.slots = a.h.slice(0, 4); h.next = a.h[4];
      R.el[me] = Math.min(10, a.el + (a.intro > 0 ? 0 : Math.max(0, rt - a.ts) / 1000 * a.mult / 2.8));
      if (a.ov && !B.over) { B.over = 1; B.overAt = now; R.win = a.win; R.over = 1; }
      return R;
    }
    function rematch() {
      if (!B || B.mode !== 'host') return;
      closePanel(false);
      newOnline();
    }
    function toLobby() {
      clearSave(); B = null;
      goOnline();
    }
    function askRematch() {
      api.net.send({ t: 'rm' });
      const el2 = pn.querySelector('[data-rm]');
      if (el2) el2.textContent = 'Rematch requested. Waiting for the host...';
    }
    function leaveOnline() {
      clearSave(); clearTimeout(N.to); N.wait = false;
      try { api.net.close(); } catch (e) {}
      N.role = null; N.gid = null; B = null;
      showHome();
    }
    function hookNet() {
      N.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || typeof d !== 'object') return;
        if (N.role === 'host') {
          if (d.t === 'hi') {
            N.gdeck = validDeck(d.deck) ? d.deck.slice() : null;
            if (d.name) N.gname = String(d.name).replace(/[<>&"']/g, '').slice(0, 16);
            if (N.wait) hostStart();
            else if (B && B.mode === 'host' && from === N.gid) { sendCfg(); netSnap(true); }
          } else if (d.t === 'p') {
            if (!B || B.mode !== 'host' || !B.S || B.over || from !== N.gid) return;
            const S = B.S, slot = S.hands[1].slots.indexOf(d.d | 0);
            if (slot >= 0 && typeof d.x === 'number' && typeof d.y === 'number') play(S, 1, slot, d.x, d.y);
          } else if (d.t === 'sur') {
            if (B && B.mode === 'host' && B.S && !B.over && from === N.gid) endMatch(B.S, 0);
          } else if (d.t === 'rm') {
            N.rm = 1;
            if (B && B.over) { toast(N.gname + ' wants a rematch'); au.play('ready'); }
          }
        } else if (N.role === 'guest') {
          if (d.t === 'cfg') guestStart(d);
          else if (d.t === 's') guestSnap(d);
        }
      });
      api.net.on('leave', pl => {
        if (N.role !== 'host' || !pl || pl.id !== N.gid) return;
        N.gid = null;
        if (B && B.mode === 'host' && B.S && !B.over) {
          B.S.bots[1] = makeBot(1, P.diff);
          if (!/\(bot\)$/.test(B.S.names[1])) B.S.names[1] += ' (bot)';
          toast(pl.name + ' left. A bot takes over.');
        } else toast(pl.name + ' left the party.');
      });
      api.net.on('rejoin', pl => {
        if (N.role !== 'host' || !pl) return;
        if (B && B.mode === 'host' && B.S) {
          N.gid = pl.id; B.S.bots[1] = null;
          B.S.names[1] = B.S.names[1].replace(/ \(bot\)$/, '');
          sendCfg(); netSnap(true);
        }
      });
      api.net.on('lobby', () => { if (N.role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (!N.role) return;
        const role = N.role;
        N.role = null; N.gid = null; clearTimeout(N.to); N.wait = false;
        if (B && B.mode === 'solo') return;
        B = null; view = 'wait'; ui.hidden = true; mb.hidden = true;
        au.play('lose');
        panel({
          cls: 'wait', cancel: false, kicker: 'Online',
          title: why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost',
          text: why === 'host-left' ? 'The host ended the online game.' : why === 'kicked' ? 'The host removed you from the party.' : 'The connection to the host was lost.',
          buttons: [['New party', () => goOnline(), 'green'], ['Home', showHome, '']]
        });
        if (role === 'host') clearSave();
      });
    }

    api.loop((dt, now) => {
      o.now = now; o.dt = dt;
      if (view === 'battle' && B) battleFrame(dt, now);
      else if (view === 'chest' && CH) chestFrame(dt, now);
      else if (view === 'wait') {
        g.setTransform(RS, 0, 0, RS, 0, 0);
        const bg = g.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#2c2f6b'); bg.addColorStop(1, '#171a45');
        g.fillStyle = bg; g.fillRect(0, 0, W, H);
      }
    });
    ENG.live = () => ({ view, B, P, N, CH, o, tab });
    ENG.api = api;
    root.__eng = ENG;
    if (api.net.invite) goOnline();
    else showHome();
    return {
      destroy() {
        ENG.live = null; ENG.api = null;
        clearTimeout(N.to); clearTimeout(toastT);
        au.close();
      }
    };
  }

  const ENG = { DIFFS, newSim, step, play, makeBot, DEF, BOTDECKS, CARD_KEYS, placeOK, live: null, api: null };
  const u = n => `calc(var(--u)*${n})`;
  const CSS = `.gm-clash-royale{gap:0}
.gm-clash-royale .cr-wrap{position:relative;width:min(100%,560px,calc((100dvh - var(--goff,250px))*.4747));aspect-ratio:432/910;margin:0 auto;container-type:inline-size;--u:calc(100cqw/432);overflow:hidden;background:#171a45;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:var(--r,12px);box-shadow:0 0 0 1px rgba(0,0,0,.35);font-family:Nunito,"Arial Rounded MT Bold","Trebuchet MS",system-ui,sans-serif;font-weight:800;color:#fff}
.gm-clash-royale .cr-wrap button{font-family:inherit;font-weight:900;color:inherit}
.gm-clash-royale .cr-wrap button:focus-visible{outline:3px solid #fff;outline-offset:2px}
.gm-clash-royale .cr-cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.gm-clash-royale .cr-ui{position:absolute;inset:0;display:flex;flex-direction:column;background:linear-gradient(#2c2f6b,#171a45)}
.gm-clash-royale .cr-ui[hidden],.gm-clash-royale .cr-pn[hidden],.gm-clash-royale .cr-mb[hidden],.gm-clash-royale .cr-toast[hidden]{display:none}
.gm-clash-royale .cr-hd{flex:none;height:${u(52)};display:flex;align-items:center;justify-content:space-between;padding:0 ${u(10)};background:rgba(0,0,0,.28);border-bottom:${u(2)} solid #0f0d33}
.gm-clash-royale .cr-hd .pill{display:flex;align-items:center;gap:${u(5)};background:rgba(0,0,0,.4);border-radius:999px;padding:${u(4)} ${u(13)} ${u(4)} ${u(7)};border:${u(2)} solid #0f0d33}
.gm-clash-royale .cr-hd .pill svg{width:${u(22)};height:${u(22)}}
.gm-clash-royale .cr-hd .pill b{font-size:${u(17)};line-height:1}
.gm-clash-royale .cr-hd .logo{font:900 italic ${u(19)}/1 Nunito,"Arial Rounded MT Bold",system-ui,sans-serif;letter-spacing:.02em;color:#ffd23a;text-shadow:0 ${u(2)} 0 #6b3d00,0 0 ${u(10)} rgba(255,200,60,.45)}
.gm-clash-royale .cr-body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:${u(10)} ${u(12)} ${u(14)};scrollbar-width:none;touch-action:pan-y}
.gm-clash-royale .cr-body::-webkit-scrollbar{display:none}
.gm-clash-royale .cr-nav{flex:none;display:flex;height:${u(62)};background:#0f0d33;border-top:${u(2)} solid #3a3f8a}
.gm-clash-royale .cr-nav button{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${u(2)};border:0;background:none;cursor:pointer;opacity:.6;font-size:${u(12)}}
.gm-clash-royale .cr-nav button.on{opacity:1;background:linear-gradient(rgba(255,210,58,.0),rgba(255,210,58,.22));box-shadow:inset 0 ${u(3)} 0 #ffd23a}
.gm-clash-royale .cr-nav svg{width:${u(26)};height:${u(26)}}
.gm-clash-royale .cr-nav .dot{position:absolute;top:${u(8)};right:calc(50% - ${u(26)});width:${u(11)};height:${u(11)};border-radius:50%;background:#ff4d55;border:${u(2)} solid #0f0d33}
.gm-clash-royale .cr-hero{position:relative;height:${u(262)};border-radius:${u(16)};background-size:cover;background-position:center;border:${u(3)} solid #0f0d33;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:${u(12)};box-shadow:0 ${u(4)} 0 rgba(0,0,0,.35)}
.gm-clash-royale .cr-hero .shade{position:absolute;inset:0;background:linear-gradient(rgba(10,8,40,.15),rgba(10,8,40,.85))}
.gm-clash-royale .cr-hero>*{position:relative}
.gm-clash-royale .cr-hero .shade{position:absolute}
.gm-clash-royale .cr-an small{display:block;font-size:${u(12)};letter-spacing:.1em;text-transform:uppercase;color:#cfd4ff;text-shadow:0 ${u(2)} 0 rgba(0,0,0,.6)}
.gm-clash-royale .cr-an b{font-size:${u(28)};line-height:1.1;text-shadow:0 ${u(3)} 0 rgba(0,0,0,.6)}
.gm-clash-royale .cr-road{display:flex;align-items:center;gap:${u(8)}}
.gm-clash-royale .cr-road .rb{flex:1;height:${u(14)};border-radius:999px;background:rgba(0,0,0,.55);border:${u(2)} solid #0f0d33;overflow:hidden}
.gm-clash-royale .cr-road .rb s{display:block;height:100%;background:linear-gradient(#ffe36b,#f0a81c);border-radius:999px}
.gm-clash-royale .cr-road span{display:flex;align-items:center;gap:${u(4)};font-size:${u(13)}}
.gm-clash-royale .cr-road svg{width:${u(18)};height:${u(18)}}
.gm-clash-royale .cr-go{display:flex;flex-direction:column;align-items:center;gap:${u(1)};width:100%;padding:${u(10)} ${u(10)} ${u(9)};border:${u(4)} solid #0f0d33;border-radius:${u(16)};background:linear-gradient(#ffe36b,#f2a81b);color:#4a2a00!important;cursor:pointer;box-shadow:0 ${u(5)} 0 #8a5600,0 ${u(8)} ${u(14)} rgba(0,0,0,.4),inset 0 ${u(3)} 0 rgba(255,255,255,.55)}
.gm-clash-royale .cr-go span{font-size:${u(30)};line-height:1;letter-spacing:.02em;text-shadow:0 ${u(2)} 0 rgba(255,255,255,.5)}
.gm-clash-royale .cr-go small{font-size:${u(12)};opacity:.8}
.gm-clash-royale .cr-go:active{transform:translateY(${u(3)})}
.gm-clash-royale .cr-row{display:flex;align-items:center;justify-content:space-between;gap:${u(8)};margin:${u(12)} 0}
.gm-clash-royale .cr-row>span{font-size:${u(13)};color:#b9c0ff;text-transform:uppercase;letter-spacing:.06em}
.gm-clash-royale .cr-seg{display:flex;background:rgba(0,0,0,.4);border-radius:999px;padding:${u(3)};border:${u(2)} solid #0f0d33}
.gm-clash-royale .cr-seg button{border:0;background:none;font-size:${u(12)};padding:${u(7)} ${u(10)};border-radius:999px;cursor:pointer;color:#b9c0ff}
.gm-clash-royale .cr-seg button.on{background:#ffd23a;color:#3a2200}
.gm-clash-royale .cr-b{display:flex;align-items:center;justify-content:center;gap:${u(8)};width:100%;padding:${u(11)} ${u(14)};border:${u(3)} solid #0f0d33;border-radius:${u(13)};font-size:${u(17)};line-height:1.1;background:linear-gradient(#a2a7d8,#5f64a4);box-shadow:0 ${u(4)} 0 #0f0d33,inset 0 ${u(2)} 0 rgba(255,255,255,.35);text-shadow:0 ${u(2)} 0 rgba(0,0,0,.4);cursor:pointer}
.gm-clash-royale .cr-b:active{transform:translateY(${u(3)});box-shadow:0 ${u(1)} 0 #0f0d33}
.gm-clash-royale .cr-b.green{background:linear-gradient(#80f263,#2fae35)}
.gm-clash-royale .cr-b.blue{background:linear-gradient(#69b4ff,#2a6fe0)}
.gm-clash-royale .cr-b.gold{background:linear-gradient(#ffe36b,#f0a81c);color:#4a2a00;text-shadow:none}
.gm-clash-royale .cr-b.red{background:linear-gradient(#ff7b82,#cf2c37)}
.gm-clash-royale .cr-b.dis{filter:grayscale(.85) brightness(.85)}
.gm-clash-royale .cr-b svg{width:${u(24)};height:${u(24)};flex:none}
.gm-clash-royale .cr-b .cst{display:inline-flex;align-items:center;gap:${u(4)};margin-left:${u(8)};background:rgba(0,0,0,.35);padding:${u(2)} ${u(9)} ${u(2)} ${u(5)};border-radius:999px;font-size:${u(14)}}
.gm-clash-royale .cr-b .cst svg{width:${u(18)};height:${u(18)}}
.gm-clash-royale .cr-b.wide{margin:0 0 ${u(4)}}
.gm-clash-royale h4{margin:${u(16)} 0 ${u(8)};font-size:${u(13)};text-transform:uppercase;letter-spacing:.07em;color:#b9c0ff;display:flex;justify-content:space-between;align-items:baseline}
.gm-clash-royale h4 span{font-size:${u(11)};text-transform:none;letter-spacing:0;color:#8e95d8;font-weight:800}
.gm-clash-royale .cr-chests{display:grid;grid-template-columns:repeat(4,1fr);gap:${u(7)}}
.gm-clash-royale .cr-ch{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:${u(6)} ${u(2)} ${u(6)};min-height:${u(112)};background:rgba(0,0,0,.32);border:${u(2)} solid #0f0d33;border-radius:${u(12)};cursor:pointer;font-size:${u(11)};line-height:1.2}
.gm-clash-royale .cr-ch img{width:88%;display:block}
.gm-clash-royale .cr-ch em{font-style:normal;font-size:${u(12)};margin-top:auto;color:#cfd4ff}
.gm-clash-royale .cr-ch.run{border-color:#3d8bff}
.gm-clash-royale .cr-ch.run em{color:#8fc0ff}
.gm-clash-royale .cr-ch.ready{border-color:#ffd23a;background:rgba(255,210,58,.18);animation:cr-glow 1s ease-in-out infinite alternate}
.gm-clash-royale .cr-ch.ready em{color:#ffe36b}
.gm-clash-royale .cr-ch.empty{border-style:dashed;border-color:rgba(255,255,255,.2);justify-content:center;cursor:default;color:#7d84c4}
@keyframes cr-glow{to{box-shadow:0 0 ${u(14)} rgba(255,210,58,.8)}}
.gm-clash-royale .cr-rec{text-align:center;font-size:${u(11)};color:#8e95d8;margin:${u(14)} 0 0}
.gm-clash-royale .cr-deck,.gm-clash-royale .cr-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:${u(10)} ${u(8)}}
.gm-clash-royale .cr-deck{padding-bottom:${u(8)}}
.gm-clash-royale .cr-cw{display:flex;flex-direction:column;align-items:center;min-width:0}
.gm-clash-royale .cr-card{position:relative;width:100%;aspect-ratio:80/78;cursor:pointer;margin-bottom:${u(9)}}
.gm-clash-royale .cr-card img{width:100%;height:100%;display:block;border-radius:${u(10)};box-shadow:0 ${u(3)} 0 rgba(0,0,0,.35)}
.gm-clash-royale .cr-card .cost{position:absolute;left:${u(-4)};top:${u(-5)};width:${u(25)};height:${u(28)};border-radius:50% 50% 50% 50%/62% 62% 38% 38%;background:linear-gradient(#e75cff,#a31fd0);border:${u(2)} solid #3d0a52;font:900 ${u(14)}/${u(24)} Nunito,system-ui,sans-serif;text-align:center;color:#fff;text-shadow:0 ${u(1)} 0 #3d0a52}
.gm-clash-royale .cr-card .lv{position:absolute;right:${u(4)};bottom:${u(3)};font-size:${u(10)};text-shadow:-1px -1px 0 #1b1340,1px -1px 0 #1b1340,-1px 1px 0 #1b1340,1px 1px 0 #1b1340}
.gm-clash-royale .cr-card .lkd{font-size:${u(16)}}
.gm-clash-royale .cr-card .bar{position:absolute;left:${u(4)};right:${u(4)};bottom:${u(-9)};height:${u(13)};border-radius:999px;background:#0f0d33;border:${u(2)} solid #0f0d33;overflow:hidden;text-decoration:none}
.gm-clash-royale .cr-card .bar s{position:absolute;inset:0 auto 0 0;background:linear-gradient(#d86bff,#9a28cc)}
.gm-clash-royale .cr-card .bar.ok s{background:linear-gradient(#80f263,#2fae35)}
.gm-clash-royale .cr-card .bar em{position:absolute;inset:0;font-style:normal;font-size:${u(9)};line-height:${u(10)};text-align:center;text-shadow:0 ${u(1)} 0 #0f0d33}
.gm-clash-royale .cr-card.lk img{filter:grayscale(1) brightness(.42)}
.gm-clash-royale .cr-card .up{position:absolute;right:${u(-4)};top:${u(-5)};width:${u(17)};height:${u(17)};border-radius:50%;background:#5be04a;border:${u(2)} solid #0f0d33}
.gm-clash-royale .cr-card .up::after{content:"";position:absolute;left:${u(3)};top:${u(3)};border:${u(4)} solid transparent;border-bottom:${u(6)} solid #fff;border-top:0}
.gm-clash-royale .cr-cw.indeck .cr-card{opacity:.5}
.gm-clash-royale .cr-cw.pulse .cr-card{animation:cr-pulse .7s ease-in-out infinite alternate}
@keyframes cr-pulse{to{transform:scale(1.06);filter:brightness(1.25)}}
.gm-clash-royale .cr-cw .nm{font-size:${u(10)};text-align:center;line-height:1.1;color:#cfd4ff;margin-top:${u(2)};max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-clash-royale .cr-hint{font-size:${u(12)};color:#b9c0ff;margin:${u(8)} 0 0;text-align:center}
.gm-clash-royale .cr-hint b{color:#ffe36b}
.gm-clash-royale .cr-link{border:0;background:none;color:#8fc0ff;text-decoration:underline;font-size:${u(12)};cursor:pointer}
.gm-clash-royale .cr-pn{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:${u(12)}}
.gm-clash-royale .cr-back{position:absolute;inset:0;background:rgba(8,6,28,.74)}
.gm-clash-royale .cr-pan{position:relative;width:min(100%,${u(372)});max-height:100%;overflow:auto;scrollbar-width:none;background:linear-gradient(#3b4090,#272b6c);border:${u(3)} solid #0f0d33;border-radius:${u(18)};padding:${u(16)} ${u(16)} ${u(14)};text-align:center;box-shadow:0 ${u(10)} ${u(30)} rgba(0,0,0,.55),inset 0 ${u(3)} 0 rgba(255,255,255,.18);animation:cr-in .18s ease-out}
.gm-clash-royale .cr-pan::-webkit-scrollbar{display:none}
@keyframes cr-in{from{transform:scale(.92);opacity:0}}
.gm-clash-royale .cr-pan .k{margin:0;font-size:${u(11)};letter-spacing:.12em;text-transform:uppercase;color:#aeb5f5}
.gm-clash-royale .cr-pan h3{margin:${u(2)} 0 ${u(8)};font-size:${u(30)};line-height:1.1;text-shadow:0 ${u(3)} 0 rgba(0,0,0,.45)}
.gm-clash-royale .cr-pan .tx{margin:${u(6)} 0;font-size:${u(14)};color:#dfe3ff;line-height:1.35}
.gm-clash-royale .cr-pan .tx.sm{font-size:${u(12)};color:#aeb5f5}
.gm-clash-royale .cr-pan .tx.up{color:#9bff7a;font-size:${u(15)}}
.gm-clash-royale .cr-pan .btns{display:flex;flex-direction:column;gap:${u(9)};margin-top:${u(14)}}
.gm-clash-royale .cr-chimg img{width:${u(130)}}
.gm-clash-royale .sheet{text-align:left}
.gm-clash-royale .cr-sh-top{display:flex;gap:${u(12)};align-items:flex-start}
.gm-clash-royale .cr-sh-top .cr-cw{width:${u(96)};flex:none}
.gm-clash-royale .cr-sh-top .cr-card{margin-bottom:0}
.gm-clash-royale .cr-sh-top h3{font-size:${u(22)};margin:0}
.gm-clash-royale .cr-sh-top em{font-style:normal;font-size:${u(12)};text-transform:uppercase;letter-spacing:.05em}
.gm-clash-royale .cr-sh-top p{margin:${u(6)} 0 0;font-size:${u(12)};color:#dfe3ff;font-weight:700;line-height:1.35}
.gm-clash-royale .cr-stats{display:grid;grid-template-columns:1fr 1fr;gap:${u(5)} ${u(10)};margin:${u(12)} 0 ${u(8)}}
.gm-clash-royale .cr-stats div{display:flex;justify-content:space-between;gap:${u(6)};background:rgba(0,0,0,.28);border-radius:${u(8)};padding:${u(5)} ${u(8)};font-size:${u(12)}}
.gm-clash-royale .cr-stats span{color:#aeb5f5}
.gm-clash-royale .cr-prog{position:relative;height:${u(22)};border-radius:999px;background:#0f0d33;border:${u(2)} solid #0f0d33;overflow:hidden;margin:${u(6)} 0 ${u(2)}}
.gm-clash-royale .cr-prog s{position:absolute;inset:0 auto 0 0;background:linear-gradient(#d86bff,#9a28cc)}
.gm-clash-royale .cr-prog.ok s{background:linear-gradient(#80f263,#2fae35)}
.gm-clash-royale .cr-prog em{position:absolute;inset:0;font-style:normal;text-align:center;line-height:${u(18)};font-size:${u(12)};text-shadow:0 ${u(1)} 0 #0f0d33}
.gm-clash-royale .result h3{font-size:${u(38)}}
.gm-clash-royale .cr-crowns{display:flex;align-items:center;justify-content:center;gap:${u(14)};margin:${u(4)} 0 ${u(10)}}
.gm-clash-royale .cr-crowns span{font-size:${u(13)};color:#aeb5f5}
.gm-clash-royale .cr-crowns div{display:flex;gap:${u(2)}}
.gm-clash-royale .cr-crowns i{display:block;width:${u(40)};height:${u(40)};filter:grayscale(1) brightness(.55);opacity:.5}
.gm-clash-royale .cr-crowns i.on{filter:none;opacity:1}
.gm-clash-royale .cr-crowns .you i.on{filter:drop-shadow(0 0 ${u(6)} rgba(80,160,255,.9))}
.gm-clash-royale .cr-crowns .opp i.on{filter:drop-shadow(0 0 ${u(6)} rgba(255,90,90,.9))}
.gm-clash-royale .cr-crowns svg{width:100%;height:100%}
.gm-clash-royale .rw{display:flex;align-items:center;gap:${u(8)};background:rgba(0,0,0,.28);border-radius:${u(10)};padding:${u(6)} ${u(12)};margin:${u(5)} 0;font-size:${u(16)};text-align:left}
.gm-clash-royale .rw svg{width:${u(26)};height:${u(26)}}
.gm-clash-royale .rw span{flex:1}
.gm-clash-royale .rw img{width:${u(44)}}
.gm-clash-royale .rw .pos{color:#9bff7a}
.gm-clash-royale .rw .neg{color:#ff8a8a}
.gm-clash-royale .cr-mb{position:absolute;z-index:3;top:${u(36)};right:${u(5)};width:${u(30)};height:${u(30)};border-radius:50%;border:${u(2)} solid rgba(255,255,255,.4);background:rgba(20,14,50,.62);display:grid;place-items:center;padding:0;cursor:pointer}
.gm-clash-royale .cr-mb svg{width:${u(16)};height:${u(16)}}
.gm-clash-royale .cr-toast{position:absolute;z-index:8;left:50%;bottom:${u(130)};transform:translateX(-50%);background:rgba(20,14,50,.92);border:${u(2)} solid rgba(255,255,255,.25);border-radius:999px;padding:${u(8)} ${u(16)};font-size:${u(14)};white-space:nowrap;pointer-events:none}`;
  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 46L7 22l14 11 11-19 11 19 14-11-3 24z"/><path d="M10 52h44"/><circle cx="32" cy="10" r="3"/></svg>';
  const COVER = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="crv-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86d65a"/><stop offset="1" stop-color="#5fb43a"/></linearGradient><linearGradient id="crv-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3da5e8"/><stop offset=".5" stop-color="#7ad0ff"/><stop offset="1" stop-color="#3da5e8"/></linearGradient><radialGradient id="crv-v" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1c1450" stop-opacity=".45"/></radialGradient></defs><rect width="400" height="300" fill="url(#crv-g)"/><g opacity=".1" fill="#000"><rect x="0" y="0" width="40" height="40"/><rect x="80" y="0" width="40" height="40"/><rect x="160" y="0" width="40" height="40"/><rect x="240" y="0" width="40" height="40"/><rect x="320" y="0" width="40" height="40"/><rect x="40" y="40" width="40" height="40"/><rect x="120" y="40" width="40" height="40"/><rect x="200" y="40" width="40" height="40"/><rect x="280" y="40" width="40" height="40"/><rect x="360" y="40" width="40" height="40"/></g><rect y="128" width="400" height="44" fill="url(#crv-w)"/><path d="M20 146q12-6 24 0M120 158q12-6 24 0M230 144q12-6 24 0M330 156q12-6 24 0" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/><g stroke="#2a2035" stroke-width="3"><rect x="62" y="122" width="62" height="56" fill="#b98147"/><rect x="276" y="122" width="62" height="56" fill="#b98147"/></g><g stroke="#6b4220" stroke-width="2"><path d="M62 136h62M62 150h62M62 164h62M276 136h62M276 150h62M276 164h62"/></g><g stroke="#2a2035" stroke-width="3" stroke-linejoin="round"><rect x="164" y="14" width="72" height="62" rx="9" fill="#bdb7cc"/><rect x="164" y="40" width="72" height="12" fill="#ff4d55"/><rect x="164" y="6" width="14" height="14" rx="3" fill="#cfc9dc"/><rect x="193" y="6" width="14" height="14" rx="3" fill="#cfc9dc"/><rect x="222" y="6" width="14" height="14" rx="3" fill="#cfc9dc"/><rect x="62" y="54" width="48" height="52" rx="8" fill="#bdb7cc"/><rect x="62" y="74" width="48" height="10" fill="#ff4d55"/><rect x="290" y="54" width="48" height="52" rx="8" fill="#bdb7cc"/><rect x="290" y="74" width="48" height="10" fill="#ff4d55"/><rect x="164" y="224" width="72" height="62" rx="9" fill="#bdb7cc"/><rect x="164" y="250" width="72" height="12" fill="#3d8bff"/><rect x="164" y="216" width="14" height="14" rx="3" fill="#cfc9dc"/><rect x="193" y="216" width="14" height="14" rx="3" fill="#cfc9dc"/><rect x="222" y="216" width="14" height="14" rx="3" fill="#cfc9dc"/><rect x="62" y="194" width="48" height="52" rx="8" fill="#bdb7cc"/><rect x="62" y="214" width="48" height="10" fill="#3d8bff"/><rect x="290" y="194" width="48" height="52" rx="8" fill="#bdb7cc"/><rect x="290" y="214" width="48" height="10" fill="#3d8bff"/></g><g stroke="#2a2035" stroke-width="3" stroke-linejoin="round"><path d="M178 8l-2-14 12 9 12-16 12 16 12-9-2 14z" fill="#ffd23a" transform="translate(0 6)"/><path d="M178 218l-2-14 12 9 12-16 12 16 12-9-2 14z" fill="#ffd23a" transform="translate(0 -4)"/></g><g stroke="#2a2035" stroke-width="3"><circle cx="150" cy="190" r="13" fill="#3d8bff"/><circle cx="196" cy="192" r="11" fill="#3d8bff"/><circle cx="250" cy="188" r="13" fill="#3d8bff"/><circle cx="200" cy="106" r="13" fill="#ff4d55"/><circle cx="148" cy="100" r="11" fill="#ff4d55"/></g><path d="M200 146l20 0" stroke="none"/><g stroke="#3d0a52" stroke-width="3"><path d="M26 262c10 14 20 24 20 32a20 20 0 0 1-40 0c0-8 10-18 20-32z" transform="translate(4 -28) scale(1.1)" fill="#d94cf0"/></g><rect width="400" height="300" fill="url(#crv-v)"/></svg>`;

  Ameplay.register({
    id: ID,
    title: 'Clash Royale',
    category: 'Strategy',
    tint: '#3d6fe0',
    blurb: 'Real-time card battles. Drop troops, spells and buildings with elixir and take down the enemy towers.',
    help: 'Drag a card onto your side of the arena, or tap it and tap the arena &middot; <kbd>1</kbd>-<kbd>4</kbd> pick a card, <kbd>&larr;</kbd><kbd>&rarr;</kbd><kbd>&uarr;</kbd><kbd>&darr;</kbd> aim, <kbd>Space</kbd> deploy &middot; online: friendly 1v1',
    better: 'high',
    format: v => v + ' trophies',
    width: 560,
    engine: ENG,
    icon: ICON,
    css: CSS,
    mount: mountGame
  });
  Ameplay.covers[ID] = COVER;
})();
