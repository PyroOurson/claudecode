  {
    const W8 = (k, o) => Object.assign({ key: k, kind: 'gun', auto: false, headMul: 1.45, legMul: 1, spreadHip: 0.03, spreadAds: 0.004, spreadMove: 0.025, spreadAir: 0.05, bloom: 0, bloomMax: 0.03, bloomRec: 0.15, recoil: 0.012, recoilRec: 9, reload: 1.5, swap: 0.35, range: 140, mag: 30, reserve: 120, zoom: 1.3, adsT: 0.16, speedMul: 1, botRange: 16, vkick: 0.5 }, o);
    const WEP = {
      sunny: W8('sunny', { name: 'Sunny Rifle', dmg: 26, rate: 0.105, auto: true, mag: 30, reserve: 240, reload: 1.6, spreadHip: 0.03, spreadAds: 0.005, bloom: 0.005, bloomMax: 0.035, recoil: 0.01, fall0: 12, fall1: 45, fallMin: 0.3, botRange: 16, botAds: true, botAdsR: 18, sound: 'rifle', vkick: 0.45 }),
      poacher: W8('poacher', { name: 'Poacher', dmg: 15, headMul: 1.25, pellets: 10, pelletSpread: 0.085, rate: 0.36, mag: 2, reserve: 24, reload: 1.5, spreadHip: 0.085, spreadAds: 0.07, spreadMove: 0, spreadAir: 0.02, recoil: 0.06, recoilRec: 7, range: 40, fall0: 4, fall1: 16, fallMin: 0.12, zoom: 1.12, botRange: 6, sound: 'shotgun', vkick: 1.4, vroll: 0.1, shake: 0.1 }),
      overeasy: W8('overeasy', { name: 'Over Easy', dmg: 52, headMul: 1.6, rate: 0.3, mag: 15, reserve: 90, reload: 1.7, spreadHip: 0.04, spreadAds: 0.002, spreadMove: 0.03, bloom: 0.012, bloomMax: 0.04, bloomRec: 0.2, recoil: 0.04, recoilRec: 8, fall0: 30, fall1: 90, fallMin: 0.6, zoom: 1.9, adsT: 0.18, botRange: 24, botAds: true, botAdsR: 12, sound: 'marks', vkick: 0.9, shake: 0.03 }),
      benedict: W8('benedict', { name: 'Benedict', dmg: 72, headMul: 2.5, rate: 1.0, mag: 5, reserve: 30, reload: 1.8, spreadHip: 0.12, spreadAds: 0, spreadMove: 0.08, spreadAir: 0.1, recoil: 0.06, recoilRec: 6, zoom: 3, adsT: 0.2, scope: true, adsMove: 0.6, botRange: 30, sound: 'sniper', vkick: 1.6, vroll: 0.15, shake: 0.12, tw: 0.04, tl: 0.15 }),
      whisk: W8('whisk', { name: 'Whisk', dmg: 15, rate: 0.065, auto: true, mag: 40, reserve: 320, reload: 1.4, spreadHip: 0.045, spreadAds: 0.018, spreadMove: 0.015, bloom: 0.003, bloomMax: 0.03, recoil: 0.007, fall0: 8, fall1: 30, fallMin: 0.3, zoom: 1.15, speedMul: 1.06, botRange: 10, sound: 'smg', vkick: 0.3 }),
      souffle: W8('souffle', { name: 'Souffle', kind: 'rocket', dmg: 60, splash: 4.2, splashDmg: 85, projSpeed: 26, projGrav: 0, selfMul: 0.4, knock: 11, rate: 0.8, mag: 1, reserve: 9, reload: 1.6, spreadHip: 0.008, spreadAds: 0, spreadMove: 0.01, recoil: 0.06, recoilRec: 6, speedMul: 0.94, adsT: 0.2, zoom: 1.25, botRange: 14, sound: 'rocket', vkick: 1.3, shake: 0.08 }),
      triple: W8('triple', { name: 'Triple Yolk', dmg: 27, burst: 3, burstGap: 0.065, rate: 0.42, mag: 24, reserve: 192, reload: 1.6, spreadHip: 0.026, spreadAds: 0.003, spreadMove: 0.02, bloom: 0.004, bloomMax: 0.02, recoil: 0.012, fall0: 20, fall1: 60, fallMin: 0.45, zoom: 1.5, botRange: 18, botAds: true, botAdsR: 14, sound: 'burst', vkick: 0.5 }),
      peep: W8('peep', { name: 'Peep 9', dmg: 24, headMul: 1.5, rate: 0.16, mag: 10, reserve: 60, reload: 1.1, swap: 0.25, spreadHip: 0.022, spreadAds: 0.005, spreadMove: 0.02, recoil: 0.02, fall0: 15, fall1: 45, fallMin: 0.5, zoom: 1.15, botRange: 12, sound: 'pistol', vkick: 0.7 }),
      spatula: W8('spatula', { name: 'Spatula', kind: 'melee', dmg: 55, range: 2.3, rate: 0.5, hitAt: 0.12, mag: 0, reserve: 0, swap: 0.2, sound: 'swing' }),
      grenade: W8('grenade', { name: 'Grenade', kind: 'nade', dmg: 0, splash: 5, splashDmg: 115, projSpeed: 15, projGrav: 17, fuse: 2.2, bounce: 0.42, selfMul: 0.5, knock: 9, mag: 0, reserve: 0 })
    };
    const CLS = [
      { key: 'soldier', name: 'Soldier', hp: 100, speed: 1, prim: 'sunny', sec: 'peep', hat: 'helmet', desc: 'Sunny Rifle: steady full-auto, strong up close and in the middle.' },
      { key: 'farmer', name: 'Farmer', hp: 100, speed: 1, prim: 'poacher', sec: 'peep', hat: 'straw', desc: 'Poacher: two shells that crack an egg in one hit up close.' },
      { key: 'ranger', name: 'Ranger', hp: 100, speed: 1, prim: 'overeasy', sec: 'peep', hat: 'beret', desc: 'Over Easy: a fast marksman rifle. Two good hits win.' },
      { key: 'sniper', name: 'Sharpshooter', hp: 100, speed: 1, prim: 'benedict', sec: 'peep', hat: 'bowler', desc: 'Benedict: scope in and hit the middle of the egg for a one-shot crack.' },
      { key: 'chef', name: 'Chef', hp: 100, speed: 1, prim: 'whisk', sec: 'peep', hat: 'chef', desc: 'Whisk: very fast fire, best at short range.' },
      { key: 'baker', name: 'Baker', hp: 100, speed: 1, prim: 'souffle', sec: 'peep', hat: 'hard', desc: 'Souffle: one rocket per load with a big splash.' },
      { key: 'scout', name: 'Scout', hp: 100, speed: 1, prim: 'triple', sec: 'peep', hat: 'band', desc: 'Triple Yolk: three-round bursts, accurate when aimed.' }
    ];
    const EGGC = ['#fff4dc', '#ffd9a0', '#c8f0ff', '#ffd0e4', '#d8ffc8', '#e8d8ff', '#fff0a0', '#ffc8b0', '#d0e8ff', '#f0f0f0', '#ffe0c0', '#d8f8e8'];
    const TEAMC = ['#ffb030', '#3cb8ff'];
    const hbS = [{ z: 1, e: 1, cy: 0.72, rx: 0.46, ry: 0.74 }, { z: 2, e: 1, inner: 1, cy: 0.74, rx: 0.2, ry: 0.27 }];
    const MATS = {
      grass: { color: '#7cc85a', tile: 4, tex: (g, S) => pix(g, S, '#7fca5c', [['#74be52', 0.4], ['#8ad668', 0.3], ['#6ab24a', 0.08]], 4) },
      dirt: { color: '#b98a5a', tile: 3, tex: (g, S) => pix(g, S, '#bc8d5d', [['#ae8052', 0.35], ['#c99a68', 0.25]], 4) },
      barn: { color: '#d8483a', tile: 2, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 2, S); } },
      plank: { color: '#c89660', tile: 1.6, tex: (g, S) => { pix(g, S, '#cc9a64', [['#bd8c58', 0.3], ['#d8a872', 0.2]], 4); g.fillStyle = 'rgba(90,50,20,.3)'; for (let y = 0; y < S; y += 16) g.fillRect(0, y, S, 2); } },
      hay: { color: '#f0cc5a', tile: 1.2, tex: (g, S) => { g.fillStyle = '#f2cf5e'; g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(160,110,20,.35)'; g.lineWidth = 2; for (let i = 0; i < 26; i++) { g.beginPath(); const x = (i * 37) % S, y = (i * 23) % S; g.moveTo(x, y); g.lineTo(x + 10, y + 3); g.stroke(); } } },
      white: { color: '#f4f1ea', tile: 2 },
      roofR: { color: '#8a3a30', tile: 2, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.15)'; for (let y = 0; y < S; y += 8) g.fillRect(0, y, S, 2); } },
      stone: { color: '#b8b4aa', tile: 2.5, tex: (g, S) => { pix(g, S, '#bbb7ad', [['#aeaa9f', 0.3], ['#c8c4ba', 0.25]], 4); } },
      metal: { color: '#a6b4c0', tile: 2, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.1)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 3, S); } },
      cont: { color: '#e05a48', tile: 2.4, tex: (g, S) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 0; x < S; x += 8) g.fillRect(x, 0, 3, S); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 0, S, 3); } },
      water: { color: '#4ab8e8', tile: 4, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(255,255,255,.9)'; g.fillStyle = 'rgba(0,60,120,.12)'; g.fillRect(0, 0, S, S); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect((i * 23) % S, (i * 41) % S, 14, 2); } } },
      dock: { color: '#9a7a5a', tile: 1.6, tex: (g, S) => { pix(g, S, '#9c7c5c', [['#8e6f50', 0.3], ['#aa8a68', 0.2]], 4); g.fillStyle = 'rgba(40,20,10,.35)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 2, S); } },
      tar: { color: '#5a6068', tile: 3, tex: (g, S) => pix(g, S, '#5c6270', [['#535966', 0.35], ['#666c78', 0.25]], 4) },
      brickY: { color: '#e0905a', tile: 2, tex: (g, S) => { pix(g, S, '#e2935e', [['#d68654', 0.3], ['#eca06c', 0.2]], 4); g.fillStyle = 'rgba(120,50,20,.25)'; for (let y = 0; y < S; y += 8) { g.fillRect(0, y, S, 1); for (let x = ((y / 8) % 2) * 8; x < S; x += 16) g.fillRect(x, y, 1, 8); } } },
      tile: { color: '#f4ecd8', tile: 1, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, S, 2); g.fillRect(0, 0, 2, S); g.fillStyle = 'rgba(220,60,60,.25)'; g.fillRect(0, 0, S / 2, S / 2); g.fillRect(S / 2, S / 2, S / 2, S / 2); } },
      glass: { color: '#8cd0f0', tile: 1, tex: (g, S) => { g.fillStyle = '#8cd0f0'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(S * 0.15, S * 0.1, S * 0.14, S * 0.8); } },
      sign: { color: '#ff5a8a', tile: 1, glow: '#ff5a8a' },
      yellow: { color: '#ffd23d', tile: 2 },
      teal: { color: '#38c6b8', tile: 2 },
      dark: { color: '#3c4250', tile: 2 }
    };

    const MAPS = [
      {
        key: 'barnyard', name: 'Barnyard', camY: 15,
        sky: { top: '#58b4ff', mid: '#a8dcff', bot: '#f2fbff', fog: '#d8efff', fogNear: 60, fogFar: 200, sun: '#fff4dc', sunI: 1.0, hemi: 0.7, hemiTop: '#f4fbff', hemiBot: '#a8c48a', sunDir: [-0.4, 1, 0.5], clouds: 1 },
        build(B) {
          B.box(0, -1, 0, 84, 1, 84, 'grass');
          for (const [x, z, sx, sz] of [[0, -38, 76, 1], [0, 38, 76, 1], [-38, 0, 1, 76], [38, 0, 1, 76]]) B.box(x, 0, z, sx, 1.4, sz, 'plank');
          for (const [x, z, sx, sz] of [[0, -40.5, 84, 3], [0, 40.5, 84, 3], [-40.5, 0, 3, 84], [40.5, 0, 3, 84]]) B.box(x, 0, z, sx, 5, sz, 'stone', { nb: 1 });
          B.box(-12, 0, -32.5, 14, 6, 0.8, 'barn'); B.box(-12, 0, -17.5, 14, 6, 0.8, 'barn');
          B.box(-18.6, 0, -25, 0.8, 6, 14.2, 'barn');
          B.box(-5.4, 0, -29.5, 0.8, 6, 5.2, 'barn'); B.box(-5.4, 0, -20.5, 0.8, 6, 5.2, 'barn'); B.box(-5.4, 3.4, -25, 0.8, 2.6, 3.8, 'barn');
          B.box(-12, 6, -25, 14.4, 0.4, 16, 'roofR');
          B.box(-15.2, 2.8, -25, 6, 0.3, 14.2, 'plank'); B.ramp(-10.2, -30.6, 4, 3, 0, 3.1, 1, 'plank', { base: 0 });
          B.box(-15, 0, -21, 1.4, 1.2, 1.4, 'hay', { uv: 1 }); B.box(-15, 0, -29, 1.4, 1.2, 1.4, 'hay');
          B.cyl(-26, 0, -30, 3, 10, 'metal', { seg: 14 }); B.cyl(-26, 10, -30, 3, 1.6, 'roofR', { seg: 14, r2: 0.4, nc: 1 });
          B.cyl(-26, 0, -22, 2.4, 8, 'metal', { seg: 14 }); B.cyl(-26, 8, -22, 2.4, 1.3, 'roofR', { seg: 14, r2: 0.4, nc: 1 });
          building(B, 14, 18, 30, 32, 5, 'white', { roof: 'roofR', trim: 'plank', wy: [1.3], wg: 3.4, rim: 0.25 });
          B.ramp(10, 25, 8, 3, 0, 5, 0, 'plank');
          B.box(18, 5, 25, 4, 0.8, 2, 'brickY');
          B.box(-1, 0, 0, 74, 0.04, 6, 'water', { nc: 1, ns: 1 });
          for (const x of [-30, -16, 14, 28]) { B.box(x, 0, 3.4, 3, 0.25, 0.8, 'stone', { nc: 1 }); B.box(x + 5, 0, -3.4, 2.4, 0.25, 0.8, 'stone', { nc: 1 }); }
          for (const [x, z] of [[-8, -4], [8, 4], [22, -6], [-22, 6]]) { B.box(x, 0, z, 3, 1.1, 1.2, 'hay'); }
          B.box(2.7, 0, -10, 2.8, 1.3, 1.3, 'hay'); B.box(2.7, 1.3, -10, 1.3, 1.3, 1.3, 'hay');
          B.box(-3, 0, 12, 2.8, 1.3, 1.3, 'hay'); B.box(-3, 1.3, 12, 1.3, 1.3, 1.3, 'hay');
          B.box(0, 0, 0, 7, 0.5, 9, 'plank'); B.ramp(0, -6.5, 7, 4, 0, 0.5, 2, 'plank'); B.ramp(0, 6.5, 7, 4, 0, 0.5, 3, 'plank');
          B.box(-3.3, 0.5, 0, 0.3, 0.9, 9, 'plank', { ns: 1 }); B.box(3.3, 0.5, 0, 0.3, 0.9, 9, 'plank', { ns: 1 });
          for (const [x, z, a] of [[20, -20, 0], [-20, 20, 0], [28, -10, 1], [-28, 12, 1]]) { if (a) B.box(x, 0, z, 0.3, 1.1, 8, 'plank', { ns: 1 }); else B.box(x, 0, z, 8, 1.1, 0.3, 'plank', { ns: 1 }); }
          B.box(22, 0, -26, 8, 3, 6, 'plank'); B.box(22, 3, -26, 8.4, 0.3, 6.4, 'roofR'); B.ramp(22, -20.3, 3, 5, 0, 3.3, 3, 'plank');
          B.box(-24, 0, 26, 6, 2, 6, 'stone'); B.ramp(-24, 21, 3, 4, 0, 2, 2, 'stone');
          for (const [x, z] of [[-34, -6], [34, 6], [-6, 34], [6, -34], [12, -14], [-12, 14]]) B.box(x, 0, z, 1.3, 1.3, 1.3, 'hay');
          B.cyl(30, 0, 0, 1.2, 1.6, 'stone', { seg: 10 });
          const S = [[-33, 0, -33], [33, 0, -33], [-33, 0, 33], [33, 0, 33], [0, 0, -34], [0, 0, 34], [-34, 0, 0], [34, 0, 0], [-15, 3.1, -25], [22, 5, 25], [22, 3.3, -26], [-24, 2, 26], [-12, 0, -25], [10, 0, -30], [-10, 0, 30], [14, 0, 10]];
          for (let i = 0; i < S.length; i++) B.spawn(S[i][0], S[i][1], S[i][2], S[i][0] + S[i][2] < 0 ? 0 : 1);
          for (const [x, y, z, k] of [[-12, 0, -25, 'a'], [22, 5, 25, 'n'], [0, 0.5, 0, 'a'], [-24, 2, 26, 'n'], [22, 3.3, -26, 'a'], [30, 0, 12, 'n'], [-30, 0, -12, 'a'], [8, 0, -22, 'a'], [-8, 0, 22, 'a']]) B.pickup(x, y + 0.45, z, k);
          B.zone(0, 0.5, 0, 5, 'The bridge'); B.zone(-12, 0, -25, 5, 'The barn'); B.zone(22, 5, 25, 5, 'Farmhouse roof'); B.zone(22, 3.3, -26, 4, 'The shed'); B.zone(-24, 2, 26, 4, 'The well');
        },
      },
      {
        key: 'docks', name: 'Sunnyside Docks', camY: 15,
        sky: { top: '#3f9ee8', mid: '#9cd4f4', bot: '#fff1d6', fog: '#e4eef4', fogNear: 55, fogFar: 200, sun: '#ffe8c0', sunI: 1.05, hemi: 0.65, hemiTop: '#eaf6ff', hemiBot: '#9fb0b8', sunDir: [0.5, 1, -0.3], clouds: 1, sea: 1 },
        build(B) {
          B.box(0, -1, 0, 80, 1, 80, 'dock');
          for (const [x, z, sx, sz] of [[0, -39, 78, 2], [0, 39, 78, 2], [-39, 0, 2, 78], [39, 0, 2, 78]]) B.box(x, 0, z, sx, 1.1, sz, 'metal');
          const cont = (x, y, z, rot, c) => { const sx = rot ? 2.6 : 6.2, sz = rot ? 6.2 : 2.6; B.box(x, y, z, sx, 2.6, sz, 'cont', { c, uv: 1 }); };
          const CC = [0xe05a48, 0x3a8ce0, 0x48c070, 0xffb030, 0x9a6ae0, 0x38c6b8];
          cont(-14, 0, -12, 0, CC[0]); cont(-14, 2.6, -12, 0, CC[3]); cont(-14, 0, -9.4, 0, CC[1]);
          cont(14, 0, 12, 0, CC[2]); cont(14, 2.6, 12, 0, CC[4]); cont(14, 0, 9.4, 0, CC[5]);
          cont(-6, 0, 16, 1, CC[3]); cont(6, 0, -16, 1, CC[0]); cont(-6, 2.6, 16, 1, CC[1]); cont(6, 2.6, -16, 1, CC[2]);
          cont(-28, 0, 10, 1, CC[4]); cont(28, 0, -10, 1, CC[5]); cont(-25.4, 0, 10, 1, CC[0]); cont(25.4, 0, -10, 1, CC[3]);
          B.ramp(-14, -5.6, 6.2, 5, 0, 2.6, 3, 'metal'); B.ramp(14, 5.6, 6.2, 5, 0, 2.6, 2, 'metal');
          B.ramp(-6, 21, 2.6, 3.8, 0, 2.6, 3, 'metal'); B.ramp(6, -21, 2.6, 3.8, 0, 2.6, 2, 'metal');
          building(B, -36, -36, -20, -24, 6, 'brickY', { roof: 'tar', trim: 'white', wy: [1.4, 3.8], wg: 3.2, rim: 0.25 });
          building(B, 20, 24, 36, 36, 6, 'brickY', { roof: 'tar', trim: 'white', wy: [1.4, 3.8], wg: 3.2, rim: 0.25 });
          B.ramp(-14, -30, 12, 3, 0, 6, 1, 'metal'); B.ramp(14, 30, 12, 3, 0, 6, 0, 'metal');
          B.box(0, 0, 0, 10, 2.2, 16, 'white'); B.box(0, 2.2, 0, 10.6, 0.3, 16.6, 'teal');
          B.ramp(0, -10, 4, 4, 0, 2.2, 2, 'plank'); B.ramp(0, 10, 4, 4, 0, 2.2, 3, 'plank');
          B.box(-3, 2.5, 4, 3, 2.4, 3, 'teal'); B.box(-3, 4.9, 4, 3.4, 0.25, 3.4, 'white');
          B.box(3.8, 2.5, -4, 1.2, 1.1, 3, 'cont', { c: 0xffb030 });
          B.box(4.7, 2.5, 6.5, 0.3, 1.0, 3, 'white', { ns: 1 }); B.box(-4.7, 2.5, -6.5, 0.3, 1.0, 3, 'white', { ns: 1 });
          B.box(0, 0, -32, 1.2, 12, 1.2, 'yellow', { nc: 0 }); B.box(0, 12, -27, 1.4, 1.4, 12, 'yellow', { nc: 1 }); B.box(0, 7, -21.5, 0.15, 5, 0.15, 'dark', { nc: 1, ns: 1 });
          B.box(-32, 0, 26, 1.2, 12, 1.2, 'yellow'); B.box(-26, 12, 26, 12, 1.4, 1.4, 'yellow', { nc: 1 });
          for (const [x, z] of [[-24, -14], [24, 14], [-10, 30], [10, -30], [30, 24], [-30, -24], [-22, 2], [22, -2]]) B.box(x, 0, z, 1.3, 1.3, 1.3, 'plank');
          B.box(-22, 1.3, 2, 1.3, 1.3, 1.3, 'plank'); B.box(22, 1.3, -2, 1.3, 1.3, 1.3, 'plank');
          for (const [x, z] of [[-34, 4], [34, -4], [-4, 34], [4, -34]]) B.cyl(x, 0, z, 0.55, 1, 'dark', { seg: 8 });
          const S = [[-34, 0, -16], [34, 0, 16], [-34, 0, 16], [34, 0, -16], [-16, 0, -34], [16, 0, 34], [-16, 0, 34], [16, 0, -34], [-28, 6, -30], [28, 6, 30], [-14, 2.6, -9.4], [14, 2.6, 9.4], [0, 2.5, -5.5], [0, 2.5, 6.5], [-30, 0, 0], [30, 0, 0]];
          for (const s of S) B.spawn(s[0], s[1], s[2], s[0] - s[2] < 0 ? 0 : 1);
          for (const [x, y, z, k] of [[0, 2.5, 0, 'n'], [-28, 6, -30, 'a'], [28, 6, 30, 'a'], [-14, 2.6, -9.4, 'a'], [14, 2.6, 9.4, 'a'], [-30, 0, 0, 'n'], [30, 0, 0, 'n'], [0, 0, -26, 'a'], [0, 0, 26, 'a']]) B.pickup(x, y + 0.45, z, k);
          B.zone(0, 2.5, 0, 5, 'The deck'); B.zone(-28, 6, -30, 5, 'West warehouse'); B.zone(28, 6, 30, 5, 'East warehouse'); B.zone(-14, 0, -2, 4, 'Red stack'); B.zone(14, 0, 2, 4, 'Green stack');
        }
      },
      {
        key: 'rooftops', name: 'Diner Rooftops', camY: 22,
        sky: { top: '#6a6ad8', mid: '#e89ac8', bot: '#ffd8a8', fog: '#f4c8b8', fogNear: 55, fogFar: 210, sun: '#ffd8b0', sunI: 0.95, hemi: 0.7, hemiTop: '#ffe8f4', hemiBot: '#8a7aa8', sunDir: [-0.6, 0.7, -0.4], clouds: 1, city: 1 },
        build(B) {
          B.box(0, -1, 0, 80, 1, 80, 'tar');
          for (const [x, z, sx, sz] of [[0, -39, 78, 2], [0, 39, 78, 2], [-39, 0, 2, 78], [39, 0, 2, 78]]) B.box(x, 0, z, sx, 12, sz, 'brickY', { nb: 1 });
          const roof = (x0, z0, x1, z1, h, m, o) => building(B, x0, z0, x1, z1, h, m, Object.assign({ roof: 'tar', trim: 'white', wy: [1.4, 3.8, 6.2], wg: 3.2, rim: 0.25 }, o));
          roof(-38, -38, -16, -16, 8, 'brickY'); roof(16, 16, 38, 38, 8, 'brickY');
          roof(16, -38, 38, -16, 6, 'white', { trim: 'teal' }); roof(-38, 16, -16, 38, 6, 'white', { trim: 'teal' });
          roof(-8, -38, 8, -28, 7, 'tile', { trim: 'brickY' }); roof(-8, 28, 8, 38, 7, 'tile', { trim: 'brickY' });
          roof(-38, -8, -28, 8, 7, 'tile', { trim: 'brickY' }); roof(28, -8, 38, 8, 7, 'tile', { trim: 'brickY' });
          roof(-10, -10, 10, 10, 5, 'white', { trim: 'sign', wy: [1.4], wm: 'glass' });
          B.box(0, 5.4, -9.7, 7, 1.4, 0.3, 'sign', { nc: 1 }); B.box(0, 5.4, 9.7, 7, 1.4, 0.3, 'sign', { nc: 1 });
          const P = 'plank';
          B.ramp(-12, -33, 8, 3, 7, 8, 1, P, { base: 6.6 }); B.ramp(12, -33, 8, 3, 6, 7, 1, P, { base: 5.6 });
          B.ramp(-12, 33, 8, 3, 6, 7, 0, P, { base: 5.6 }); B.ramp(12, 33, 8, 3, 7, 8, 0, P, { base: 6.6 });
          B.ramp(-33, -12, 3, 8, 7, 8, 3, P, { base: 6.6 }); B.ramp(-33, 12, 3, 8, 6, 7, 3, P, { base: 5.6 });
          B.ramp(33, -12, 3, 8, 6, 7, 2, P, { base: 5.6 }); B.ramp(33, 12, 3, 8, 7, 8, 2, P, { base: 6.6 });
          B.ramp(0, -19, 3, 18, 5, 7, 3, P, { base: 4.6 }); B.ramp(0, 19, 3, 18, 5, 7, 2, P, { base: 4.6 });
          B.ramp(-19, 0, 18, 3, 5, 7, 1, P, { base: 4.6 }); B.ramp(19, 0, 18, 3, 5, 7, 0, P, { base: 4.6 });
          B.ramp(-15, -6, 10, 3, 0, 5, 0, 'metal'); B.ramp(15, 6, 10, 3, 0, 5, 1, 'metal');
          B.ramp(6, -15, 3, 10, 0, 5, 2, 'metal'); B.ramp(-6, 15, 3, 10, 0, 5, 3, 'metal');
          B.ramp(-25, -14.5, 14, 3, 0, 8, 1, 'metal'); B.ramp(25, 14.5, 14, 3, 0, 8, 0, 'metal');
          B.cyl(-31, 8, -31, 2, 4, 'plank', { seg: 12 }); B.cyl(-31, 12, -31, 2.2, 1.2, 'roofR', { seg: 12, r2: 0.3, nc: 1 });
          B.box(30, 8, 30, 6, 3, 0.3, 'sign', { nc: 1 }); B.box(30, 8, 30.3, 0.3, 3, 0.3, 'dark', { nc: 1 });
          for (const [x, y, z] of [[-24, 8, -24], [24, 8, 24], [27, 6, -27], [-27, 6, 27], [0, 7, -33], [0, 7, 33], [-33, 7, 0], [33, 7, 0], [5, 5, 5], [-5, 5, -5]]) B.box(x, y, z, 2.2, 1.3, 1.6, 'metal');
          for (const [x, z] of [[-22, -4], [22, 4], [-4, -22], [4, 22], [-24, 24], [24, -24], [-12, 22], [12, -22]]) B.box(x, 0, z, 2.6, 1.3, 1.3, 'cont', { c: 0x48c070 });
          const S = [[-30, 8, -24], [30, 8, 24], [27, 6, -30], [-27, 6, 30], [-34, 0, 12], [34, 0, -12], [12, 0, -34], [-12, 0, 34], [-6, 5, 0], [6, 5, 0], [-22, 0, 12], [22, 0, -12], [0, 7, -31], [0, 7, 31], [-31, 7, 4], [31, 7, -4]];
          for (const s of S) B.spawn(s[0], s[1], s[2], s[0] + s[2] < 0 ? 0 : 1);
          for (const [x, y, z, k] of [[0, 5, 0, 'n'], [-28, 8, -28, 'a'], [28, 8, 28, 'a'], [28, 6, -28, 'a'], [-28, 6, 28, 'a'], [-24, 0, 0, 'n'], [24, 0, 0, 'n'], [0, 7, -31, 'a'], [0, 7, 31, 'a']]) B.pickup(x, y + 0.45, z, k);
          B.zone(0, 5, 0, 5, 'Diner roof'); B.zone(0, 7, -33, 4.5, 'North roof'); B.zone(0, 7, 33, 4.5, 'South roof'); B.zone(-22, 0, 0, 5, 'West street'); B.zone(22, 0, 0, 5, 'East street');
        }
      }
    ];

    const ICON = {
      sunny: '<path d="M4 11h26l3-3h9v4h-5l-2 3h-4l-2 6h-5l2-6h-6l-2 4H9l1-4H4z"/>',
      poacher: '<path d="M2 11h34v4H22l-2 2h-6l-2 4H7l2-4H2z"/><path d="M22 15h12v2H22z"/>',
      overeasy: '<path d="M3 11h30l2-2h9v3h-7v3H24l-2 5h-5l1-5H8l-1 3H3z"/><path d="M19 7h7v3h-7z"/>',
      benedict: '<path d="M2 12h34l1-2h9v3h-8v2H24l-2 4h-5l1-4H9l-1 3H3z"/><path d="M16 7h12v4H16z"/>',
      whisk: '<path d="M10 10h20l2-2h5v4h-4v4h-6l-1 6h-5l1-6h-5l-2 3h-4z"/>',
      souffle: '<path d="M4 9h32v7H4z"/><path d="M36 8l7 4.5-7 4.5z"/><path d="M14 16h4v6h-4z"/>',
      triple: '<path d="M4 11h28l2-2h9v4h-6l-2 3h-4l-1 5h-5l1-5h-7l-2 4H9l1-4H4z"/><circle cx="24" cy="9" r="1.6"/><circle cx="28" cy="9" r="1.6"/>',
      peep: '<path d="M16 10h18v4H24l-2 8h-5l2-8h-3z"/>',
      spatula: '<path d="M4 12h20v2H4z"/><path d="M24 8h18v10H24z"/>',
      grenade: '<circle cx="24" cy="14" r="7"/><path d="M22 4h4v4h-4z"/>',
      fall: '<path d="M20 4v14M14 12l6 6 6-6"/><path d="M8 22h24"/>'
    };
    const svgI = k => `<svg viewBox="0 0 48 24" class="wi" fill="currentColor" stroke="none">${ICON[k] || ICON.sunny}</svg>`;

    const SND = {
      rifle: (A, D) => { A.noise(0.08, 0.42, 2000, 0.8, 0, 'bandpass', 700, D); A.tone(260, 110, 0.08, 'square', 0.12, 0, D); A.tone(900, 500, 0.04, 'sine', 0.05, 0, D); },
      smg: (A, D) => { A.noise(0.05, 0.34, 2600, 0.9, 0, 'bandpass', 1100, D); A.tone(330, 150, 0.05, 'square', 0.09, 0, D); },
      burst: (A, D) => { A.noise(0.07, 0.4, 2200, 0.8, 0, 'bandpass', 800, D); A.tone(300, 130, 0.07, 'square', 0.1, 0, D); },
      marks: (A, D) => { A.noise(0.16, 0.6, 1600, 0.6, 0, 'lowpass', 300, D); A.tone(180, 70, 0.14, 'sawtooth', 0.16, 0, D); A.tone(1200, 600, 0.05, 'sine', 0.05, 0, D); },
      sniper: (A, D) => { A.noise(0.32, 0.75, 1200, 0.5, 0, 'lowpass', 200, D); A.tone(120, 40, 0.3, 'sawtooth', 0.26, 0, D); A.tone(1600, 800, 0.08, 'sine', 0.06, 0, D); A.noise(0.08, 0.14, 3000, 4, 0.45, 'bandpass', 0, D); },
      shotgun: (A, D) => { A.noise(0.26, 0.8, 1000, 0.5, 0, 'lowpass', 160, D); A.tone(110, 40, 0.22, 'square', 0.2, 0, D); A.noise(0.06, 0.12, 2400, 5, 0.3, 'bandpass', 0, D); },
      rocket: (A, D) => { A.noise(0.4, 0.45, 800, 0.8, 0, 'bandpass', 2600, D); A.tone(100, 220, 0.3, 'sawtooth', 0.1, 0, D); },
      pistol: (A, D) => { A.noise(0.07, 0.4, 2400, 0.8, 0, 'bandpass', 900, D); A.tone(340, 140, 0.06, 'square', 0.1, 0, D); },
      swing: (A, D) => A.noise(0.16, 0.25, 1100, 1.2, 0, 'bandpass', 3000, D),
      melee: (A, D) => { A.tone(420, 180, 0.1, 'triangle', 0.25, 0, D); A.noise(0.06, 0.25, 1500, 2, 0, 'bandpass', 0, D); },
      hit: (A, D) => { A.tone(1300, 1700, 0.05, 'sine', 0.1, 0, D); },
      head: (A, D) => { A.tone(1900, 2600, 0.08, 'sine', 0.14, 0, D); A.noise(0.04, 0.12, 5000, 3, 0, 'bandpass', 0, D); },
      kill: (A, D) => { A.noise(0.12, 0.5, 4200, 3, 0, 'bandpass', 1800, D); A.noise(0.08, 0.35, 2600, 4, 0.06, 'bandpass', 0, D); A.tone(700, 1400, 0.12, 'sine', 0.08, 0.05, D); },
      hurt: (A, D) => { A.tone(220, 120, 0.12, 'triangle', 0.22, 0, D); A.noise(0.06, 0.2, 3000, 3, 0, 'bandpass', 0, D); },
      reload: (A, D) => { A.noise(0.04, 0.3, 2800, 3, 0, 'bandpass', 0, D); A.tone(600, 450, 0.05, 'square', 0.05, 0.3, D); A.noise(0.05, 0.3, 2000, 3, 0.7, 'bandpass', 0, D); A.tone(800, 1100, 0.05, 'square', 0.05, 0.95, D); },
      swap: (A, D) => { A.noise(0.05, 0.2, 2500, 2, 0, 'bandpass', 0, D); A.tone(700, 900, 0.04, 'sine', 0.05, 0.08, D); },
      dry: (A, D) => A.tone(1700, 1500, 0.03, 'square', 0.06, 0, D),
      jump: (A, D) => { A.tone(300, 520, 0.12, 'sine', 0.05, 0, D); },
      land: (A, D, k) => { A.tone(160, 80, 0.08, 'sine', 0.08 + (k || 0) * 0.15, 0, D); A.noise(0.05, 0.08 + (k || 0) * 0.15, 600, 1, 0, 'lowpass', 0, D); },
      step: (A, D) => A.tone(200, 160, 0.04, 'sine', 0.05, 0, D),
      ric: (A, D) => { A.noise(0.04, 0.14, 3500, 2, 0, 'bandpass', 0, D); if (Math.random() < 0.4) A.tone(2600 + Math.random() * 1200, 1000, 0.1, 'sine', 0.03, 0, D); },
      boom: (A, D) => { A.noise(0.9, 1, 600, 0.5, 0, 'lowpass', 60, D); A.tone(80, 30, 0.7, 'sine', 0.55, 0, D); A.noise(0.25, 0.4, 2200, 0.7, 0, 'bandpass', 400, D); },
      die: (A, D) => { A.noise(0.18, 0.7, 4500, 2, 0, 'bandpass', 1500, D); A.noise(0.12, 0.5, 2500, 3, 0.07, 'bandpass', 900, D); A.noise(0.3, 0.3, 600, 0.8, 0.1, 'lowpass', 200, D); },
      dead: (A, D) => { A.tone(330, 160, 0.5, 'triangle', 0.1, 0, D); A.tone(247, 120, 0.7, 'sine', 0.08, 0.15, D); },
      spawn: (A, D) => { A.tone(520, 1040, 0.2, 'sine', 0.08, 0, D); A.tone(780, 1560, 0.15, 'sine', 0.05, 0.08, D); },
      start: (A, D) => { [587, 740, 880].forEach((f, i) => A.tone(f, f, 0.14, 'triangle', 0.1, i * 0.1, D)); },
      win: (A, D) => { [523, 659, 784, 1047, 880, 1047].forEach((f, i) => A.tone(f, f, 0.22, 'triangle', 0.1, i * 0.12, D)); },
      lose: (A, D) => { [440, 392, 349, 294].forEach((f, i) => A.tone(f, f * 0.98, 0.3, 'triangle', 0.1, i * 0.18, D)); },
      zone: (A, D) => { A.tone(660, 990, 0.2, 'sine', 0.1, 0, D); A.tone(990, 1320, 0.2, 'sine', 0.08, 0.15, D); },
      chat: (A, D) => A.tone(1200, 1500, 0.05, 'sine', 0.05, 0, D),
      award: (A, D) => { [784, 988, 1175, 1568].forEach((f, i) => A.tone(f, f, 0.12, 'triangle', 0.09, i * 0.07, D)); },
      pickup: (A, D) => { A.tone(880, 1320, 0.08, 'sine', 0.1, 0, D); A.tone(1320, 1760, 0.08, 'sine', 0.08, 0.07, D); },
      bounce: (A, D) => A.tone(520, 320, 0.05, 'triangle', 0.12, 0, D),
      throw: (A, D) => A.noise(0.12, 0.15, 1000, 1, 0, 'bandpass', 2400, D),
      slide: (A, D) => A.noise(0.3, 0.1, 600, 0.6, 0, 'bandpass', 1500, D)
    };
    const TI = {
      fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>',
      ads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
      jump: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/><path d="M6 19h12"/></svg>',
      crouch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6l8 12M16 6L8 18"/></svg>',
      reload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12a7 7 0 1 1-2-5"/><path d="M19 4v4h-4"/></svg>',
      swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14l-3-3M20 16H6l3 3"/></svg>',
      nade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"/><path d="M12 8V5h3"/></svg>',
      melee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 18L13 9"/><rect x="12" y="4" width="8" height="8" rx="1" transform="rotate(45 16 8)"/></svg>',
      pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
      sb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'
    };

    function gunParts(k, s) {
      s = s || 1;
      const P = [];
      const b = (c, x, y, z, w, h, d) => P.push(['box', c, [x * s, y * s, z * s], [w * s, h * s, d * s]]);
      const cy = (c, x, y, z, r, l, seg) => P.push([seg || 'cyl', c, [x * s, y * s, z * s], [r * 2 * s, l * s, r * 2 * s], [Math.PI / 2, 0, 0]]);
      const sp = (c, x, y, z, r) => P.push(['sphL', c, [x * s, y * s, z * s], [r * 2 * s, r * 2 * s, r * 2 * s]]);
      let mz = -0.5, mag = null;
      if (k === 'sunny') { b('#ff9a2a', 0, 0, -0.04, 0.085, 0.1, 0.44); cy('#3a3a48', 0, 0.015, -0.38, 0.024, 0.28); b('#ffd23d', 0, 0.065, -0.06, 0.05, 0.035, 0.22); b('#ff9a2a', 0, -0.02, 0.27, 0.07, 0.11, 0.2); b('#3a3a48', 0, -0.085, 0.07, 0.055, 0.12, 0.07); sp('#ffd23d', 0, 0.015, -0.53, 0.03); mag = ['#3a3a48', 0, -0.12, -0.08, 0.055, 0.17, 0.09]; mz = -0.56; }
      else if (k === 'poacher') { b('#2fb8a8', 0, -0.015, 0.2, 0.08, 0.12, 0.28); b('#3a3a48', 0, 0.005, -0.08, 0.09, 0.1, 0.32); cy('#e8e4dc', -0.022, 0.03, -0.42, 0.025, 0.42); cy('#e8e4dc', 0.022, 0.03, -0.42, 0.025, 0.42); b('#2fb8a8', 0, -0.05, -0.34, 0.09, 0.06, 0.18); mz = -0.64; }
      else if (k === 'overeasy') { b('#f04a5a', 0, 0, -0.05, 0.08, 0.1, 0.5); cy('#f4f0e8', 0, 0.015, -0.44, 0.022, 0.34); cy('#3a3a48', 0, 0.1, -0.06, 0.035, 0.2); b('#f4f0e8', 0, -0.02, 0.3, 0.07, 0.12, 0.22); b('#3a3a48', 0, -0.09, 0.08, 0.055, 0.12, 0.07); mag = ['#f4f0e8', 0, -0.1, -0.12, 0.05, 0.12, 0.08]; mz = -0.62; }
      else if (k === 'benedict') { b('#3c6a3a', 0, 0, 0, 0.075, 0.09, 0.64); cy('#2a2a30', 0, 0.015, -0.6, 0.02, 0.56); cy('#e8b830', 0, 0.105, -0.05, 0.042, 0.34); cy('#2a2a30', 0, 0.105, -0.23, 0.05, 0.04); b('#6a4a2a', 0, -0.03, 0.38, 0.065, 0.13, 0.26); b('#2a2a30', 0, -0.09, 0.1, 0.05, 0.11, 0.06); mag = ['#2a2a30', 0, -0.08, -0.12, 0.05, 0.08, 0.08]; mz = -0.88; }
      else if (k === 'whisk') { b('#9a5ae8', 0, 0, 0, 0.08, 0.11, 0.34); cy('#e8e4dc', 0, 0.02, -0.24, 0.03, 0.14, 'cyl6'); b('#ffd23d', 0, 0.07, -0.02, 0.035, 0.03, 0.12); b('#3a3a48', 0, -0.02, 0.22, 0.06, 0.07, 0.12); b('#3a3a48', 0, -0.1, 0.06, 0.055, 0.11, 0.06); mag = ['#ffd23d', 0, -0.13, -0.08, 0.05, 0.2, 0.06]; mz = -0.33; }
      else if (k === 'souffle') { cy('#ffd23d', 0, 0.03, -0.08, 0.085, 0.92); cy('#f04a5a', 0, 0.03, -0.56, 0.095, 0.08); cy('#3a3a48', 0, 0.03, 0.4, 0.09, 0.06); b('#3a3a48', 0, -0.1, 0.02, 0.055, 0.13, 0.07); b('#3a3a48', 0, -0.1, -0.22, 0.055, 0.11, 0.06); b('#f04a5a', 0, 0.13, -0.1, 0.04, 0.06, 0.1); mz = -0.62; }
      else if (k === 'triple') { b('#3a8ce0', 0, 0, -0.05, 0.085, 0.1, 0.46); cy('#3a3a48', 0, 0.015, -0.4, 0.023, 0.26); b('#ffd23d', 0, 0.07, -0.08, 0.04, 0.04, 0.16); sp('#ffd23d', -0.025, 0.07, 0.04, 0.025); sp('#ffd23d', 0.025, 0.07, 0.04, 0.025); b('#3a8ce0', 0, -0.02, 0.28, 0.07, 0.11, 0.2); b('#3a3a48', 0, -0.09, 0.07, 0.055, 0.12, 0.07); mag = ['#3a3a48', 0, -0.12, -0.1, 0.05, 0.16, 0.08]; mz = -0.56; }
      else if (k === 'peep') { b('#ffd23d', 0, 0.015, -0.06, 0.06, 0.07, 0.22); b('#3a3a48', 0, -0.07, 0.03, 0.05, 0.12, 0.065); sp('#ff9a2a', 0, 0.06, -0.15, 0.02); mz = -0.18; }
      else if (k === 'spatula') { b('#3a3a48', 0, 0, 0.06, 0.035, 0.035, 0.24); b('#c8ccd4', 0, 0.01, -0.16, 0.12, 0.012, 0.18); b('#c8ccd4', 0, 0, -0.06, 0.03, 0.01, 0.06); mz = -0.26; }
      return { P, mz: mz * s, mag: mag ? [mag[0], [mag[1] * s, mag[2] * s, mag[3] * s], [mag[4] * s, mag[5] * s, mag[6] * s]] : null };
    }

    let eggGeo = null, shardGeo = null;
    function egg(kit) {
      if (eggGeo) return eggGeo;
      const { THREE } = kit, pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16, y = 1.42 * t, r = 0.47 * Math.pow(Math.sin(Math.PI * t), 0.82) * (1 - 0.2 * t); pts.push(new THREE.Vector2(Math.max(0.001, r), y)); }
      eggGeo = kit.own(new THREE.LatheGeometry(pts, 18).toNonIndexed());
      eggGeo.computeVertexNormals();
      return eggGeo;
    }
    function shards(kit) {
      if (shardGeo) return shardGeo;
      const { THREE } = kit, g = new THREE.BufferGeometry();
      const P = [0, 0.5, 0, -0.45, -0.3, 0.05, 0.5, -0.4, -0.05, 0, 0.5, 0, 0.5, -0.4, -0.05, -0.45, -0.3, 0.05];
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals();
      shardGeo = kit.own(g);
      return shardGeo;
    }

    const Gdef = {
      id: 'yolk-ops', title: 'Yolk Ops', tint: '#ffb020',
      blurb: 'Cartoon egg shooter: pick a weapon class, crack eggs, grab grenades and win the coop.',
      help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · mouse look · click fire · right click or <kbd>Shift</kbd> aim · <kbd>Space</kbd> jump · <kbd>R</kbd> reload · <kbd>E</kbd> or wheel swap to pistol · <kbd>Q</kbd> grenade · <kbd>F</kbd> spatula · <kbd>Tab</kbd> scores · <kbd>Esc</kbd> menu · touch: stick, drag to look, buttons',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8c10 0 18 16 18 28a18 18 0 0 1-36 0C14 24 22 8 32 8z"/><path d="M22 34l5 4 5-6 5 6 5-4"/></svg>',
      font: '"Arial Rounded MT Bold","Nunito","Trebuchet MS",system-ui,sans-serif', pixel: false, exposure: 1.05, mapAO: 0.8,
      phys: { g: 17, jumpV: 8.0, speed: 5.7, accel: 10, airAccel: 2.6, airCap: 1.3, fric: 7, stopSpeed: 2, crouchMul: 1, slideBoost: 1, slideTime: 0, slideFric: 1, slideMin: 1, stepH: 0.45, H: 1.48, HC: 1.48, eye: 1.18, eyeC: 1.18, R: 0.42, maxFall: 30, autoHop: true, maxAir: 1.4, adsMul: 0.75 },
      weapons: WEP, classes: CLS, melee: 'spatula', nade: 'grenade', nades: 1, maxNades: 3,
      keys: { crouch: [], ads: ['ShiftLeft', 'ShiftRight'], swap: ['KeyE'], nade: ['KeyQ', 'KeyG'], melee: ['KeyF', 'KeyV'] },
      modes: [
        { key: 'ffa', name: 'Free for all', teams: 0, time: 300, limit: 25 },
        { key: 'teams', name: 'Teams', teams: 1, time: 360, limit: 40 },
        { key: 'coop', name: 'King of the Coop', teams: 1, zone: 1, time: 360, limit: 150, zoneTime: 50 }
      ],
      teams: ['Sunny Side', 'Cool Shells'],
      maps: MAPS, mats: MATS, sky: MAPS[0].sky,
      respawn: 5, manualSpawn: true, autoSpawn: 25, spawnProt: 2, regenDelay: 5, regenRate: 14, killScore: 100, headScore: 25, assistScore: 25, botSight: 85, hearR: 40, footR: 12, defBots: 6, maxBots: 7, defFov: 75,
      pickupRespawn: 18, scorch: 0,
      botClassW: [3, 1.6, 1.6, 1.2, 1.6, 1, 1.4],
      botNames: ['Sunny', 'Omelette', 'Scrambles', 'Yolko', 'Shelldon', 'Benny', 'Eggbert', 'Poppy', 'Crackers', 'Dotty', 'Huevo', 'Clucky', 'Fritter', 'Nugget', 'Waffles', 'Pancake', 'Muffin', 'Toasty', 'Biscuit', 'Peaches'],
      firstHint: 'Click to aim. Space jumps, Shift aims, Q throws a grenade.',
      zoneMoved: 'The coop moved', headWord: 'Yolk shots', headWord1: 'Yolk shot', mateCol: '#7fe0ff', foeCol: '#ff8a5a', tracer: '#fff2b0', boomCol: '#ffc040',
      headIcon: '<svg viewBox="0 0 24 24" class="hi" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>',
      sounds: SND, touchIcons: TI,
      hitboxes: () => hbS,
      headY: () => 0.78,
      fovFor(p) { const w = p.weps[p.cur]; return w ? 1 + ((w.d.zoom || 1) - 1) * p.adsF : 1; },
      colorFor(p, teams) { return teams ? TEAMC[p.team] : EGGC[p.slot % EGGC.length]; },
      wepIcon: k => svgI(k),
      statBars(c) { const w = WEP[c.prim]; const per = w.kind === 'rocket' ? 145 : w.dmg * (w.pellets || 1) * (w.burst || 1); const dps = w.kind === 'rocket' ? 110 : w.dmg * (w.pellets || 1) * (w.burst || 1) / w.rate; return [['Damage', Math.min(1, per / 150)], ['Fire rate', Math.min(1, dps / 250)], ['Range', w.scope ? 1 : w.pellets ? 0.15 : w.kind === 'rocket' ? 0.45 : Math.min(1, (w.fall1 || 60) / 90)], ['Ammo', Math.min(1, (w.mag + w.reserve) / 280)]]; },
      streakName(n) { return n === 2 ? 'Double crack' : n === 3 ? 'Triple crack' : n === 5 ? 'Egg-cellent! 5 in a row' : n === 10 ? 'Hard boiled! 10 in a row' : n > 3 && n % 5 === 0 ? 'Streak of ' + n : ''; },
      streaks: [
        { n: 3, key: 'fresh', name: 'Fresh Shell: health restored', give(W, p) { p.hp = p.maxHp; } },
        { n: 5, key: 'hard', name: 'Hard Shell: armour on', give(W, p) { p.shield = 60; } },
        { n: 8, key: 'carton', name: 'Full Carton: ammo and grenades', give(W, p) { for (const w of p.weps) if (w.d.mag) { w.mag = w.d.mag; w.res = w.d.reserve; } p.nades = 3; } }
      ],
      pickup(W, p, k) {
        if (k === 'n') { if (p.nades >= 3) return false; p.nades++; return true; }
        let need = false;
        for (const w of p.weps) if (w.d.mag && w.res < w.d.reserve) need = true;
        if (!need) return false;
        for (const w of p.weps) if (w.d.mag) w.res = Math.min(w.d.reserve, w.res + Math.max(w.d.mag, Math.round(w.d.reserve * 0.4)));
        return true;
      },
      pickupName: k => k === 'n' ? '+1 Grenade' : '+Ammo',
      logo: () => `<div class="yo-logo"><span class="egg"></span><span class="a">YOLK</span><span class="b">OPS</span></div><p class="yo-tag">${escH(T('Crack or be cracked.'))}</p>`,
      howHTML: (T, e) => `<ul class="fp-list"><li>${e(T('Move with W A S D (Z Q S D on French keyboards), look with the mouse, click to fire.'))}</li><li>${e(T('Right click or Shift to aim. Aim at the middle of the egg: yolk shots do much more damage.'))}</li><li>${e(T('Space jumps. Eggs jump high, so jump around corners and over cover to dodge.'))}</li><li>${e(T('R reloads, E or the mouse wheel swaps to the Peep 9 pistol, Q throws a grenade, F swings the spatula.'))}</li><li>${e(T('Ammo boxes and grenades lie around the map and come back after a while.'))}</li><li>${e(T('Kill streaks: 3 kills restore your health, 5 give you a hard shell, 8 refill your ammo and grenades.'))}</li><li>${e(T('Free for all: first to 25. Teams: first team to 40. King of the Coop: stand in the coop to score; it moves every 50 seconds.'))}</li></ul>`,
      css: R => `
${R} .fp-wrap{--acc:#ffb020;--acc2:#38c6b8;--ink:#2a2340;font-family:"Arial Rounded MT Bold","Nunito","Trebuchet MS",system-ui,sans-serif;color:var(--ink)}
${R} .fp-card{background:#fff8ea;border:4px solid var(--ink);border-radius:22px;padding:clamp(12px,2.2cqw,24px);box-shadow:0 8px 0 var(--ink),0 20px 50px rgba(0,0,0,.35)}
${R} .fp-card h3{margin:0 0 .6em;font-size:clamp(18px,3cqw,30px);font-weight:900;color:var(--ink)}
${R} .fp-main{width:min(96cqw,860px)}
${R} .yo-logo{display:flex;align-items:center;gap:.15em;font-weight:900;font-size:clamp(30px,6.4cqw,60px);line-height:1;letter-spacing:.01em}
${R} .yo-logo .egg{width:.72em;height:.92em;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 62%,#ffc020 0 28%,#fff 30%);border:4px solid var(--ink);margin-right:.12em}
${R} .yo-logo .a{color:#ffb020;-webkit-text-stroke:3px var(--ink);paint-order:stroke fill;text-shadow:0 4px 0 var(--ink)}${R} .yo-logo .b{color:#38c6b8;-webkit-text-stroke:3px var(--ink);paint-order:stroke fill;text-shadow:0 4px 0 var(--ink)}
${R} .yo-tag{margin:.3em 0 .9em;color:#8a6a40;font-weight:800;font-size:clamp(10px,1.5cqw,14px)}
${R} .fp-lv{display:flex;flex-wrap:wrap;align-items:center;gap:.4em 1em;font-size:clamp(11px,1.4cqw,14px);color:#6a5a4a;margin-bottom:1em}
${R} .fp-lv .lvb{background:var(--ink);color:#ffd23d;font-weight:900;padding:.2em .7em;border-radius:999px}
${R} .fp-lv .lvbar{flex:1;min-width:80px;height:9px;border-radius:9px;background:#eadcc0;overflow:hidden;border:2px solid var(--ink)}
${R} .fp-lv .lvbar i{display:block;height:100%;background:#ffb020}
${R} .fp-opts{display:grid;grid-template-columns:auto 1fr;gap:.5em 1em;align-items:center;margin-bottom:1em;font-size:clamp(11px,1.5cqw,14px)}
${R} .fp-opts label,${R} .fp-lab,${R} .fp-set label{font-weight:900;color:#8a6a40;font-size:.9em}
${R} .fp-seg button{background:#fff;color:var(--ink);padding:.38em .8em;border-radius:999px;font-weight:800;font-size:inherit;border:2.5px solid var(--ink)}
${R} .fp-seg button:hover{background:#fff0c8}
${R} .fp-seg button.on{background:#ffd23d}
${R} .fp-num{gap:.6em}${R} .fp-num small{color:#8a6a40}
${R} .fp-btn{background:#fff;color:var(--ink);padding:.6em 1.2em;border-radius:999px;font-weight:900;font-size:clamp(12px,1.7cqw,16px);border:3px solid var(--ink);box-shadow:0 4px 0 var(--ink)}
${R} .fp-btn:hover{background:#fff0c8}
${R} .fp-btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}
${R} .fp-btn.big{background:#ffb020;font-size:clamp(15px,2.3cqw,22px);padding:.55em 1.6em}
${R} .fp-btn.big:hover{background:#ffc040}
${R} .fp-btn.ghost{background:#f4ead4}
${R} .fp-btn.sm{padding:.15em .7em;font-size:16px}
${R} .fp-btn:disabled{opacity:.45;cursor:default}
${R} .fp-acts{display:flex;flex-wrap:wrap;gap:.7em;margin-top:1em;align-items:center}
${R} .fp-acts.col{flex-direction:column;align-items:stretch}
${R} .fp-cls{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:.1em;background:#fff;border:3px solid #e6d6b6;border-radius:14px;padding:.5em .6em;color:var(--ink);text-align:left;font-size:clamp(10px,1.35cqw,13px)}
${R} .fp-cls:hover{border-color:#c8b48a}
${R} .fp-cls.on{border-color:var(--ink);background:#fff0c0}
${R} .fp-cls .ic{color:#ff8a20;height:1.6em;display:block}${R} .fp-cls .ic svg{height:100%;width:auto}
${R} .fp-cls b{font-weight:900}${R} .fp-cls small{color:#8a7a6a}
${R} .fp-cls kbd{position:absolute;right:.5em;top:.35em;font:800 10px/1 system-ui;color:#b8a888}
${R} .fp-clsg{display:grid;grid-template-columns:repeat(4,1fr);gap:.45em}
${R} .fp-clsd p{color:#5a4a3a}${R} .fp-clsd .bars{color:#8a6a40}
${R} .fp-clsd .bars i{background:linear-gradient(90deg,#38c6b8 var(--v),#eadcc0 var(--v))!important;border:1.5px solid var(--ink);height:7px!important}
${R} .fp-set{width:min(92cqw,520px);display:grid;grid-template-columns:auto 1fr;gap:.7em 1.2em;align-items:center;font-size:clamp(11px,1.6cqw,15px)}
${R} .fp-set h3,${R} .fp-set .fp-acts{grid-column:1/-1}
${R} .fp-how{width:min(92cqw,640px);font-size:clamp(11px,1.6cqw,15px)}
${R} .fp-list{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:.5em;line-height:1.4;color:#4a3a2a}
${R} .fp-pause{width:min(86cqw,380px);text-align:center}
${R} .fp-note{color:#7a6a5a;font-size:clamp(11px,1.5cqw,14px);margin:.3em 0}
${R} .fp-death{width:min(94cqw,580px);text-align:center;background:#fff1e0}
${R} .fp-death h3{color:#e0503a;margin:.1em 0 .2em}
${R} .fp-kick{margin:0;font-weight:900;color:#a08060;font-size:clamp(10px,1.4cqw,13px)}
${R} .fp-rs{font-size:clamp(16px,2.6cqw,26px);font-weight:900;margin:.3em 0 .6em;min-height:1.2em}
${R} .fp-death .fp-acts{justify-content:center}
${R} .fp-over{width:min(96cqw,660px);text-align:center}
${R} .fp-over.win h3{color:#ff9a10}
${R} .fp-ts{font-size:clamp(22px,4cqw,40px);font-weight:900;margin:0 0 .3em}
${R} .fp-ts .t0,${R} tr.t0 td:nth-child(2),${R} .fp-feed b.t0,${R} tr.th.t0 td{color:#e88a00}${R} .fp-ts .t1,${R} tr.t1 td:nth-child(2),${R} .fp-feed b.t1,${R} tr.th.t1 td{color:#1a98e0}
${R} .fp-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:.45em;margin:.6em 0}
${R} .fp-stats div{background:#fff;border:2.5px solid var(--ink);border-radius:14px;padding:.4em .2em;display:flex;flex-direction:column}
${R} .fp-stats b{font-size:clamp(15px,2.4cqw,24px);font-weight:900}${R} .fp-stats small{color:#8a7a6a;font-size:clamp(9px,1.2cqw,12px)}
${R} .fp-lvup{color:#18a090;font-weight:900;margin:.3em 0}
${R} .fp-tbl{max-height:30cqh;overflow:auto;margin-top:.4em}
${R} .fp-tbl table{width:100%;border-collapse:collapse;font-size:clamp(10px,1.4cqw,14px)}
${R} .fp-tbl td,${R} .fp-tbl th{padding:.3em .6em;text-align:right}${R} .fp-tbl td:nth-child(2),${R} .fp-tbl th:nth-child(2){text-align:left}
${R} .fp-tbl th,${R} .fp-sb th{color:#a08a6a;font-weight:900;font-size:.85em}
${R} tr.me td{background:#ffe8a8}
${R} .fp-sbc{background:#fff8eaf0}${R} .fp-sbc h3{font-size:clamp(14px,2cqw,20px)}
${R} .fp-sb tr.th td{text-align:left;font-weight:900;padding-top:.8em}
${R} .fp-hud{font-family:"Arial Rounded MT Bold","Nunito","Trebuchet MS",system-ui,sans-serif;color:#fff}
${R} .fp-hud{--o:0 0 0 transparent}
${R} .yo-hp{position:absolute;left:2cqw;bottom:2cqw;display:flex;align-items:center;gap:1cqw}
${R} .yo-hp .eg{position:relative;width:clamp(38px,6.4cqw,64px);height:clamp(48px,8cqw,80px);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#fff;border:3px solid var(--ink);overflow:hidden;box-shadow:0 4px 0 var(--ink)}
${R} .yo-hp .eg i{position:absolute;left:0;right:0;bottom:0;height:100%;background:linear-gradient(#ffd040,#ff9a10);transform-origin:bottom;transition:transform .15s}
${R} .yo-hp .eg u{position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 4px rgba(140,220,255,.0)}
${R} .yo-hp.sh .eg u{box-shadow:inset 0 0 0 5px rgba(120,210,255,.95)}
${R} .yo-hp.low .eg i{background:linear-gradient(#ff8a7a,#e8402a)}
${R} .yo-hp .n{font-size:clamp(20px,3.8cqw,40px);font-weight:900;-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:0 3px 0 var(--ink)}
${R} .yo-hp .cl{display:block;font-size:clamp(9px,1.25cqw,13px);font-weight:900;color:#fff;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .yo-am{position:absolute;right:2cqw;bottom:2cqw;text-align:right;line-height:1}
${R} .yo-am .n{font-size:clamp(22px,4.6cqw,48px);font-weight:900;-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:0 3px 0 var(--ink)}
${R} .yo-am .r{font-size:clamp(12px,2cqw,22px);font-weight:900;-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill}
${R} .yo-am .n.low{color:#ff6a4a}
${R} .yo-am .wn{display:flex;align-items:center;justify-content:flex-end;gap:.5em;font-size:clamp(10px,1.35cqw,14px);font-weight:900;margin-top:.35em;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .yo-am .wn svg{height:1.6em;width:auto;color:#ffd23d;filter:drop-shadow(0 2px 0 var(--ink))}
${R} .yo-am .nd{display:flex;justify-content:flex-end;gap:4px;margin-bottom:.4em}
${R} .yo-am .nd i{width:clamp(10px,1.6cqw,16px);height:clamp(12px,1.9cqw,19px);border-radius:50%;background:#5a7a3a;border:2px solid var(--ink)}
${R} .yo-am .nd i.off{background:rgba(255,255,255,.25)}
${R} .yo-am .rl{font-size:clamp(10px,1.35cqw,14px);font-weight:900;height:1.3em;color:#ffd23d;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .yo-st{position:absolute;left:50%;bottom:2.2cqw;transform:translateX(-50%);display:flex;gap:5px}
${R} .yo-st i{width:clamp(8px,1.3cqw,14px);height:clamp(10px,1.6cqw,17px);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:rgba(255,255,255,.35);border:2px solid var(--ink)}
${R} .yo-st i.on{background:#ffd23d}${R} .yo-st i.mk{outline:2px solid #fff;outline-offset:1px}
${R} .fp-tc .tm{font-size:clamp(15px,2.4cqw,24px);font-weight:900;background:#fff8ea;color:var(--ink);padding:.15em .7em;border-radius:999px;border:3px solid var(--ink)}
${R} .fp-tc .sc{font-size:clamp(13px,2cqw,20px);font-weight:900;padding:.15em .7em;border-radius:999px;min-width:2.4em;text-align:center;border:3px solid var(--ink);color:#fff;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .fp-tc .sc.t0{background:#ffb020}${R} .fp-tc .sc.t1{background:#3cb8ff}
${R} .fp-tc .ob{font-size:clamp(10px,1.3cqw,13px);font-weight:900;background:rgba(42,35,64,.75);padding:.25em .7em;border-radius:999px;color:#fff}
${R} .fp-tl div{background:rgba(42,35,64,.62);border-radius:999px;font-weight:800}${R} .fp-tl div.me{background:rgba(255,176,32,.85);color:var(--ink)}
${R} .fp-feed div{background:rgba(42,35,64,.7);border-radius:999px;font-weight:800}
${R} .fp-feed div.mine{background:rgba(255,176,32,.9);color:var(--ink)}
${R} .fp-feed b.me{color:#fff}${R} .fp-feed .wi{color:#ffd23d}${R} .fp-feed div.mine .wi{color:var(--ink)}${R} .fp-feed .hi{height:1em;width:1em;color:#ffb020}
${R} .fp-pop div{-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:0 4px 0 var(--ink)}
${R} .fp-pop .st,${R} .fp-pop .aw{color:#ffd23d;font-size:clamp(20px,4cqw,40px)}
${R} .fp-pop .hs{color:#ffb020;font-size:clamp(14px,2.4cqw,24px)}
${R} .fp-pop .el{font-size:clamp(13px,2cqw,20px);color:#fff}
${R} .fp-pop .ov{font-size:clamp(26px,5cqw,52px);color:#fff}
${R} .fp-pop .zn{color:#7fe0ff;font-size:clamp(14px,2.4cqw,24px)}
${R} .fp-sub span{display:block;color:#ffd23d;-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill}
${R} .fp-scope{background:radial-gradient(circle at center,transparent 0,transparent calc(min(40cqw,40cqh) - 4px),#2a2340 calc(min(40cqw,40cqh) - 3px),#2a2340 calc(min(40cqw,40cqh) + 2px),rgba(20,16,30,.92) calc(min(40cqw,40cqh) + 3px))}
${R} .fp-scope::before,${R} .fp-scope::after{content:"";position:absolute;left:50%;top:50%;background:rgba(42,35,64,.9)}
${R} .fp-scope::before{width:min(80cqw,80cqh);height:2px;transform:translate(-50%,-50%)}
${R} .fp-scope::after{height:min(80cqw,80cqh);width:2px;transform:translate(-50%,-50%)}
${R} .fp-ch i{box-shadow:0 0 0 1.5px rgba(42,35,64,.8)}
@container (max-width:620px){${R} .fp-clsg{grid-template-columns:repeat(2,1fr)}${R} .fp-stats{grid-template-columns:repeat(3,1fr)}${R} .fp-opts{grid-template-columns:1fr}}
@container (max-height:430px){${R} .fp-main{padding:10px 14px}${R} .yo-logo{font-size:30px}}
`,
      hudHTML: () => `<div class="yo-hp"><div class="eg"><i></i><u></u></div><div><b class="n">100</b><small class="cl"></small></div></div><div class="yo-st"></div><div class="yo-am"><div class="nd"></div><div class="rl"></div><span class="n">30</span><span class="r"> / 240</span><div class="wn"></div></div>`,
      hudBind(h, H) { H.hp = h.querySelector('.yo-hp'); H.hpN = h.querySelector('.yo-hp .n'); H.hpB = h.querySelector('.yo-hp .eg i'); H.cl = h.querySelector('.yo-hp .cl'); H.amN = h.querySelector('.yo-am .n'); H.amR = h.querySelector('.yo-am .r'); H.wn = h.querySelector('.yo-am .wn'); H.rl = h.querySelector('.yo-am .rl'); H.nd = h.querySelector('.yo-am .nd'); H.st = h.querySelector('.yo-st'); },
      hudUpdate(H, me, W, setT, setS, setH, T, e) {
        const hp = Math.max(0, Math.ceil(me.hp));
        setT(H.hpN, 'hp', String(hp));
        setS(H.hpB, 'hpb', 'transform', `scaleY(${(hp / me.maxHp).toFixed(3)})`);
        if (H.hp.classList.contains('low') !== (hp < 35)) H.hp.classList.toggle('low');
        if (H.hp.classList.contains('sh') !== (me.shield > 0)) H.hp.classList.toggle('sh');
        setT(H.cl, 'cl', T(CLS[me.cls].name));
        setH(H.nd, 'nd', [0, 1, 2].map(i => `<i class="${i < me.nades ? '' : 'off'}"></i>`).join(''));
        const s = me.streak, nxt = s < 3 ? 3 : s < 5 ? 5 : s < 8 ? 8 : 0;
        setH(H.st, 'st', nxt ? Array.from({ length: nxt }, (_, i) => `<i class="${i < s ? 'on' : ''}${i === nxt - 1 ? ' mk' : ''}"></i>`).join('') : '');
        const w = me.weps[me.cur];
        if (!w) return;
        const mel = w.d.kind === 'melee';
        setT(H.amN, 'amn', mel ? '—' : String(w.mag));
        setT(H.amR, 'amr', mel ? '' : ' / ' + w.res);
        if (H.amN.classList.contains('low') !== (!mel && w.mag <= Math.ceil(w.d.mag * 0.25))) H.amN.classList.toggle('low');
        setH(H.wn, 'wn', `${e(T(w.d.name))}${svgI(w.k)}`);
        setT(H.rl, 'rl', me.reloadT > 0 ? T('Reloading') : !mel && w.mag === 0 && w.res === 0 ? T('Out of ammo: find an ammo box') : !mel && w.mag === 0 ? T('Press R to reload') : '');
      },
      hudTop(H, W, me, tl, setH, T, e) {
        const mm = Math.floor(tl / 60), ss = String(tl % 60).padStart(2, '0');
        let html = '';
        if (W.teams) html = `<span class="sc t0">${W.teamScore[0]}</span><span class="tm">${mm}:${ss}</span><span class="sc t1">${W.teamScore[1]}</span>`;
        else { const L = W.players.filter(p => p && p.inGame); const top = Math.max(0, ...L.map(p => p.kills)); html = `<span class="tm">${mm}:${ss}</span><span class="ob">${e(T('First to {n}', { n: W.mode.limit }))} · ${top}</span>`; }
        if (W.mode.zone && W.M.zones.length) { const z = W.M.zones[W.zone.i]; const own = W.zone.own; html += `<span class="ob">${e(T(z.name))}${own === 2 ? ' · ' + e(T('Contested')) : own === me.team ? ' · ' + e(T('Held')) : own >= 0 ? ' · ' + e(T('Enemy')) : ''}</span>`; }
        setH(H.tc, 'tc', html);
      },
      makeSky(kit, sky, D) {
        const { THREE } = kit, g = new THREE.Group();
        const geo = kit.own(new THREE.SphereGeometry(400, 24, 14)), p = geo.attributes.position, cs = [];
        const c0 = kit.lin(sky.bot), c1 = kit.lin(sky.mid), c2 = kit.lin(sky.top), tc = new THREE.Color();
        for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 400, t = clamp(y * 1.3 + 0.05, 0, 1); if (t < 0.3) tc.copy(c0).lerp(c1, t / 0.3); else tc.copy(c1).lerp(c2, (t - 0.3) / 0.7); cs.push(tc.r, tc.g, tc.b); }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
        const m = new THREE.Mesh(geo, kit.own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
        m.renderOrder = -1; g.add(m);
        let s = 11;
        const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
        if (sky.clouds) {
          const L = [];
          for (let i = 0; i < 22; i++) { const a = r() * TAU, d = 160 + r() * 110, y = 55 + r() * 45, w = 6 + r() * 8; for (let j = 0; j < 4; j++) L.push(['sphL', '#ffffff', [Math.cos(a) * d + (j - 1.5) * w * 0.8, y + (j % 2) * w * 0.25, Math.sin(a) * d], [w * 1.4, w * 0.8, w], [0, a, 0]]); }
          g.add(new THREE.Mesh(kit.geo(L), kit.own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }))));
        }
        const far = [];
        for (let i = 0; i < 34; i++) {
          const a = i / 34 * TAU + r() * 0.1, d = 100 + r() * 40;
          if (sky.city) { const h = 14 + r() * 34, w = 8 + r() * 10; far.push(['box', ['#8a6aa8', '#a87aa8', '#6a5a98'][i % 3], [Math.cos(a) * d, h / 2 - 1, Math.sin(a) * d], [w, h, w], [0, a, 0]]); }
          else if (sky.sea) { if (i % 3 === 0) far.push(['box', '#e8e0d0', [Math.cos(a) * d, 1.5, Math.sin(a) * d], [10, 4, 4], [0, a, 0]]); }
          else { const h = 6 + r() * 10, w = 10 + r() * 14; far.push(['sphL', i % 2 ? '#6ab04a' : '#5a9a40', [Math.cos(a) * d, 0, Math.sin(a) * d], [w * 1.6, h * 1.6, w * 1.6], [0, 0, 0]]); }
        }
        if (far.length) g.add(new THREE.Mesh(kit.geo(far), kit.own(new THREE.MeshLambertMaterial({ vertexColors: true }))));
        if (sky.sea || D.key === 'barnyard') {
          const sea = new THREE.Mesh(kit.own(new THREE.PlaneGeometry(900, 900)), kit.own(new THREE.MeshLambertMaterial({ color: sky.sea ? kit.lin('#3aa8e0') : kit.lin('#78c058') })));
          sea.rotation.x = -Math.PI / 2; sea.position.y = sky.sea ? -1.2 : -1.05; g.add(sea);
        }
        return g;
      },
      makeChar(kit, look) {
        const { THREE } = kit;
        const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
        const shell = look.color, ink = '#2a2340';
        const cls = CLS[look.cls] || CLS[0];
        const eggM = new THREE.Mesh(egg(kit), kit.own(new THREE.MeshPhongMaterial({ color: kit.lin(shell), shininess: 45, specular: 0x333333 })));
        eggM.castShadow = true; body.add(eggM);
        const face = [['sph', '#ffffff', [-0.13, 0.98, -0.34], [0.17, 0.2, 0.08]], ['sph', '#ffffff', [0.13, 0.98, -0.34], [0.17, 0.2, 0.08]], ['sph', ink, [-0.12, 0.97, -0.385], [0.08, 0.1, 0.03]], ['sph', ink, [0.12, 0.97, -0.385], [0.08, 0.1, 0.03]], ['box', ink, [-0.14, 1.12, -0.34], [0.13, 0.025, 0.02], [0, 0, 0.18]], ['box', ink, [0.14, 1.12, -0.34], [0.13, 0.025, 0.02], [0, 0, -0.18]], ['box', ink, [0, 0.8, -0.38], [0.1, 0.02, 0.02]], ['sph', '#ffb8b0', [-0.25, 0.85, -0.3], [0.08, 0.05, 0.03]], ['sph', '#ffb8b0', [0.25, 0.85, -0.3], [0.08, 0.05, 0.03]]];
        const team = look.team >= 0 ? TEAMC[look.team] : null, hc = team || '#ff7a3a';
        const hat = [];
        if (cls.hat === 'helmet') hat.push(['sph', team || '#6a8a4a', [0, 1.32, 0], [0.62, 0.36, 0.62]], ['cyl', team || '#5a7a3a', [0, 1.22, 0], [0.7, 0.05, 0.7]]);
        else if (cls.hat === 'straw') hat.push(['cyl', '#f0cc5a', [0, 1.33, 0], [0.5, 0.18, 0.5]], ['cyl', '#f0cc5a', [0, 1.25, 0], [0.95, 0.03, 0.95]], ['cyl', team || '#d8483a', [0, 1.29, 0], [0.52, 0.05, 0.52]]);
        else if (cls.hat === 'beret') hat.push(['sph', team || '#d8483a', [0.05, 1.33, 0.02], [0.6, 0.18, 0.6]], ['sph', ink, [0.05, 1.43, 0.02], [0.06, 0.06, 0.06]]);
        else if (cls.hat === 'bowler') hat.push(['sph', '#3a3040', [0, 1.36, 0], [0.42, 0.3, 0.42]], ['cyl', '#3a3040', [0, 1.27, 0], [0.7, 0.03, 0.7]], ['cyl', team || '#ffd23d', [0, 1.3, 0], [0.44, 0.05, 0.44]]);
        else if (cls.hat === 'chef') hat.push(['cyl', '#ffffff', [0, 1.38, 0], [0.4, 0.3, 0.4]], ['sph', '#ffffff', [0, 1.56, 0], [0.55, 0.24, 0.55]], ['cyl', team || '#ffffff', [0, 1.26, 0], [0.42, 0.06, 0.42]]);
        else if (cls.hat === 'hard') hat.push(['sph', team || '#ffd23d', [0, 1.33, 0], [0.56, 0.34, 0.56]], ['cyl', team || '#ffd23d', [0, 1.24, -0.06], [0.68, 0.03, 0.74]]);
        else hat.push(['cyl', team || '#3a8ce0', [0, 1.2, 0], [0.74, 0.08, 0.74]], ['box', team || '#3a8ce0', [0.06, 1.18, 0.38], [0.06, 0.05, 0.16]]);
        body.add(kit.mesh(face.concat(hat), { shiny: true }));
        const hands = new THREE.Group(); hands.position.set(0, 0.66, 0); body.add(hands);
        hands.add(kit.mesh([['sph', '#ffffff', [0.12, -0.04, -0.42], [0.12, 0.12, 0.12]], ['sph', '#ffffff', [-0.08, -0.02, -0.6], [0.11, 0.11, 0.11]]], { shiny: true }));
        const gunG = new THREE.Group(); gunG.position.set(0.04, 0.02, -0.5); hands.add(gunG);
        const muzzle = new THREE.Object3D(); gunG.add(muzzle);
        let curW = '';
        const setW = k => {
          if (k === curW) return;
          curW = k;
          while (gunG.children.length > 1) gunG.remove(gunG.children[1]);
          const gp = gunParts(k, 0.8);
          const P = gp.P.slice(); if (gp.mag) P.push(['box', gp.mag[0], gp.mag[1], gp.mag[2]]);
          gunG.add(kit.mesh(P, { shiny: true }));
          muzzle.position.set(0, 0.015, gp.mz);
        };
        const ring = new THREE.Mesh(kit.G0.sph, kit.own(new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.28, depthWrite: false })));
        ring.scale.set(1.15, 1.75, 1.15); ring.position.y = 0.72; ring.visible = false; root.add(ring);
        let ph = 0;
        return {
          root, muzzle,
          anim(s) {
            setW(s.wk);
            const dt = s.dt;
            ring.visible = s.prot || s.shield;
            ring.material.color.setHex(s.shield ? 0x60c0ff : 0xffffff);
            if (!s.alive) { body.visible = false; return; }
            body.visible = true;
            const sp = Math.min(1.3, s.spd / 5.7);
            ph += dt * (7 + s.spd * 1.4);
            const bob = s.ground ? Math.abs(Math.sin(ph)) * 0.06 * sp : 0;
            body.position.y = bob;
            body.rotation.z = s.ground ? Math.sin(ph) * 0.07 * sp : 0;
            body.rotation.x = s.ground ? -0.06 * sp : 0.08;
            const sq = s.ground ? 1 : 1.04;
            body.scale.set(2 - sq, sq, 2 - sq);
            hands.rotation.x = s.pitch;
            const rec = s.fire < 0.08 ? (0.08 - s.fire) * 3 : 0, rl = s.reload < 1.2 ? Math.sin(Math.min(1, s.reload / 1.2) * Math.PI) * 0.7 : 0, ml = s.melee < 0.45 ? Math.sin(s.melee / 0.45 * Math.PI) : 0;
            gunG.rotation.x = rec + rl; gunG.position.z = -0.5 + rec * 0.12 - ml * 0.25;
          },
          dispose() {}
        };
      },
      makeView(kit, k) {
        const { THREE } = kit;
        const root = new THREE.Group();
        const gp = gunParts(k, 1);
        root.add(kit.mesh(gp.P, { noShadow: true, shiny: true }));
        let mag = null;
        if (gp.mag) { mag = kit.mesh([['box', gp.mag[0], [0, 0, 0], gp.mag[2]]], { noShadow: true, shiny: true }); mag.position.set(...gp.mag[1]); root.add(mag); }
        const glove = '#ffffff';
        root.add(kit.mesh([['sph', glove, [0.03, -0.075, 0.07], [0.11, 0.11, 0.12]], ['sph', glove, [-0.04, -0.04, -0.2], [0.1, 0.1, 0.11]], ['cyl', '#e8e8f0', [0.03, -0.09, 0.15], [0.09, 0.06, 0.09], [Math.PI / 2, 0, 0]]], { noShadow: true, shiny: true }));
        const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.015, gp.mz); root.add(muzzle);
        const VS = 0.72;
        root.scale.setScalar(VS);
        const sightY = ({ sunny: 0.085, poacher: 0.06, overeasy: 0.1, benedict: 0.105, whisk: 0.085, souffle: 0.155, triple: 0.09, peep: 0.07, spatula: 0 }[k] || 0.08) * VS;
        return {
          root, muzzle, hip: k === 'spatula' ? [0.15, -0.14, -0.32] : k === 'souffle' ? [0.15, -0.16, -0.36] : k === 'peep' ? [0.12, -0.12, -0.3] : [0.13, -0.13, -0.38], aim: k === 'spatula' ? [0.14, -0.14, -0.32] : [0, -sightY, k === 'benedict' ? -0.3 : k === 'peep' ? -0.26 : -0.32], kickZ: k === 'benedict' || k === 'poacher' ? 0.1 : 0.06, kickRot: 0.55, reloadRoll: 0.8, flashS: k === 'poacher' ? 1.4 : k === 'peep' ? 0.8 : 1, noFlash: k === 'spatula' || k === 'souffle',
          anim(s, dt, rl, me) {
            if (mag) { const d = rl >= 0 ? Math.sin(Math.min(1, rl) * Math.PI) : 0; mag.position.y = gp.mag[1][1] - d * 0.25; mag.visible = !(rl > 0.35 && rl < 0.6); }
            if (k === 'spatula') { const m = me >= 0 ? Math.sin(me * Math.PI) : 0; root.rotation.y += m * 0.9; root.rotation.x -= m * 0.5; root.position.z -= m * 0.12; root.position.x -= m * 0.12; }
            else if (me >= 0) { const m = Math.sin(me * Math.PI); root.position.y -= m * 0.2; root.rotation.x += m * 0.5; }
          }
        };
      },
      makeProj(kit, kind) {
        if (kind === 'g') return kit.mesh([['sphL', '#5a7a3a', [0, 0, 0], [0.26, 0.3, 0.26]], ['box', '#3a3a48', [0, 0.17, 0], [0.08, 0.08, 0.08]], ['box', '#ffd23d', [0.05, 0.2, 0], [0.12, 0.02, 0.03]]], { noShadow: true });
        return kit.mesh([['cyl8', '#ffd23d', [0, 0, 0], [0.16, 0.42, 0.16], [Math.PI / 2, 0, 0]], ['cone', '#f04a5a', [0, 0, -0.3], [0.16, 0.18, 0.16], [-Math.PI / 2, 0, 0]]], { noShadow: true });
      },
      makePickup(kit, k) {
        if (k === 'n') return kit.mesh([['sphL', '#5a7a3a', [0, 0, 0], [0.34, 0.4, 0.34]], ['box', '#3a3a48', [0, 0.24, 0], [0.12, 0.1, 0.12]], ['box', '#ffd23d', [0.06, 0.28, 0], [0.16, 0.03, 0.04]]], { shiny: true });
        return kit.mesh([['box', '#4a8a3a', [0, 0, 0], [0.62, 0.38, 0.4]], ['box', '#ffd23d', [0, 0.02, -0.205], [0.3, 0.12, 0.02]], ['box', '#3a5a2a', [0, 0.2, 0], [0.64, 0.04, 0.42]]], { shiny: true });
      },
      makeZone(kit) {
        const { THREE } = kit, g = new THREE.Group();
        const mat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
        const wall = new THREE.Mesh(kit.own(new THREE.CylinderGeometry(1, 1, 2.4, 32, 1, true)), mat); wall.position.y = 1.2; g.add(wall);
        const disc = new THREE.Mesh(kit.own(new THREE.RingGeometry(0.9, 1, 40)), mat); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; g.add(disc);
        const flag = kit.mesh([['cyl', '#ffffff', [0, 1.6, 0], [0.06, 3.2, 0.06]], ['box', '#ffd23d', [0.3, 2.9, 0], [0.6, 0.4, 0.04]]]); flag.scale.set(1, 1, 1); g.add(flag);
        g.userData.mat = mat; g.userData.flag = flag;
        return g;
      },
      zoneColor(zm, own, mt, t) { const m = zm.userData.mat; const c = own === 2 ? 0xffffff : own === mt ? 0x40d0ff : own >= 0 ? 0xff6040 : 0xffd040; m.color.set(c).convertSRGBToLinear(); m.opacity = 0.2 + Math.sin(t * 3) * 0.06; const f = zm.userData.flag; f.scale.set(1 / zm.scale.x, 1, 1 / zm.scale.z); f.rotation.y = t * 0.8; },
      debrisGeo: kit => shards(kit),
      holeTex: (g, S) => { g.fillStyle = 'rgba(42,35,64,.75)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.18, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,220,120,.35)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.32, 0, TAU); g.fill(); },
      splatTex: (g, S) => { const c = S / 2; g.fillStyle = 'rgba(255,255,255,.95)'; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = S * (0.28 + (i % 3) * 0.05); g.beginPath(); g.arc(c + Math.cos(a) * r * 0.7, c + Math.sin(a) * r * 0.7, S * 0.12, 0, TAU); g.fill(); } g.beginPath(); g.arc(c, c, S * 0.3, 0, TAU); g.fill(); g.fillStyle = '#ffb81a'; g.beginPath(); g.arc(c + 4, c - 2, S * 0.17, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(c - 2, c - 8, S * 0.05, 0, TAU); g.fill(); },
      impactFx(view, x, y, z, nx, ny, nz) { view.burst(x, y, z, 4, '#fff0c8', 1.6, 1, 0.35, 9, nx, ny, nz); },
      hitFx(view, x, y, z, v, zone) { view.burst(x, y, z, zone === 2 ? 10 : 6, zone === 2 ? '#ffc020' : '#fff4dc', 2.2, 1.2, 0.45, 9); if (v) view.debris(x, y, z, 2, [Gdef.colorFor(v, view.teams)], 2.2, 0.08, 1, v.y); },
      deathFx(view, v, x, y, z) {
        const c = Gdef.colorFor(v, view.teams);
        view.debris(x, y + 0.7, z, 16, [c, c, '#ffffff'], 3.2, 0.24, 2.6, y);
        view.burst(x, y + 0.8, z, 22, '#ffc020', 3, 3, 0.8, 9);
        view.burst(x, y + 0.8, z, 14, '#ffffff', 2.5, 2.5, 0.7, 9);
        view.splat(x, y + 0.02, z, 0, 1, 0, 1.6 + Math.random() * 0.4);
      },
      makeProp: null, corpseT: 0.1
    };
    Ameplay.register(arenaGame(Gdef));
  }
