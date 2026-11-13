  {
    const W8 = (k, o) => Object.assign({ key: k, kind: 'gun', auto: false, headMul: 1.5, legMul: 0.85, spreadHip: 0.03, spreadAds: 0.002, spreadMove: 0.03, spreadAir: 0.06, bloom: 0, bloomMax: 0.03, bloomRec: 0.15, recoil: 0.01, recoilRec: 10, reload: 1.2, swap: 0.3, range: 160, mag: 30, reserve: 9999, zoom: 1.35, adsT: 0.15, speedMul: 1, botRange: 18, vkick: 0.5 }, o);
    const WEP = {
      rifle: W8('rifle', { name: 'Assault Rifle', dmg: 23, rate: 0.11, auto: true, mag: 30, reload: 1.25, spreadHip: 0.032, spreadAds: 0.003, spreadMove: 0.028, bloom: 0.006, bloomMax: 0.035, recoil: 0.011, fall0: 30, fall1: 90, fallMin: 0.75, speedMul: 0.95, botRange: 22, botAds: true, botAdsR: 22, sound: 'rifle', vkick: 0.45, shake: 0.02 }),
      sniper: W8('sniper', { name: 'Sniper Rifle', dmg: 100, headMul: 1.5, legMul: 1, rate: 0.9, mag: 3, reload: 1.5, spreadHip: 0.11, spreadAds: 0, spreadMove: 0.08, spreadAir: 0.1, recoil: 0.05, recoilRec: 6, zoom: 2.7, adsT: 0.17, scope: true, adsMove: 0.6, botRange: 34, sound: 'sniper', vkick: 1.6, vroll: 0.15, shake: 0.12, tw: 0.035, tl: 0.14 }),
      smg: W8('smg', { name: 'SMG', dmg: 18, rate: 0.085, auto: true, mag: 30, reload: 1.1, spreadHip: 0.042, spreadAds: 0.014, spreadMove: 0.02, bloom: 0.004, bloomMax: 0.03, recoil: 0.008, fall0: 14, fall1: 45, fallMin: 0.6, speedMul: 1.04, zoom: 1.2, botRange: 12, sound: 'smg', vkick: 0.35 }),
      shotgun: W8('shotgun', { name: 'Shotgun', dmg: 14, headMul: 1.25, pellets: 8, pelletSpread: 0.075, rate: 0.42, mag: 2, reload: 1.05, spreadHip: 0.075, spreadAds: 0.06, spreadMove: 0, spreadAir: 0.02, recoil: 0.05, recoilRec: 7, range: 45, fall0: 5, fall1: 20, fallMin: 0.25, zoom: 1.15, botRange: 7, sound: 'shotgun', vkick: 1.4, vroll: 0.1, shake: 0.1 }),
      revolver: W8('revolver', { name: 'Revolver', dmg: 66, rate: 0.4, mag: 6, reload: 1.35, spreadHip: 0.02, spreadAds: 0.001, spreadMove: 0.025, recoil: 0.06, recoilRec: 7, fall0: 40, fall1: 100, fallMin: 0.7, botRange: 18, botAds: true, botAdsR: 18, sound: 'revolver', vkick: 1.2, vroll: 0.12, shake: 0.05 }),
      lmg: W8('lmg', { name: 'Machine Gun', dmg: 17, rate: 0.12, auto: true, mag: 60, reload: 3.1, spreadHip: 0.05, spreadAds: 0.01, spreadMove: 0.03, bloom: 0.004, bloomMax: 0.04, recoil: 0.01, fall0: 35, fall1: 100, fallMin: 0.75, speedMul: 0.82, adsT: 0.22, swap: 0.5, botRange: 22, botAds: true, botAdsR: 18, sound: 'lmg', vkick: 0.5, shake: 0.03 }),
      rocket: W8('rocket', { name: 'Rocket Launcher', kind: 'rocket', dmg: 55, splash: 4.2, splashDmg: 90, projSpeed: 34, projGrav: 0, selfMul: 0.35, knock: 14, rate: 0.95, mag: 3, reload: 2.1, spreadHip: 0.008, spreadAds: 0, spreadMove: 0.01, recoil: 0.05, recoilRec: 6, speedMul: 0.9, adsT: 0.2, zoom: 1.25, botRange: 16, sound: 'rocket', vkick: 1.3, shake: 0.08 }),
      pistol: W8('pistol', { name: 'Pistol', dmg: 25, headMul: 1.6, rate: 0.15, mag: 10, reload: 0.95, swap: 0.22, spreadHip: 0.02, spreadAds: 0.004, spreadMove: 0.02, recoil: 0.02, fall0: 20, fall1: 60, fallMin: 0.6, zoom: 1.2, botRange: 14, sound: 'pistol', vkick: 0.7 }),
      knife: W8('knife', { name: 'Knife', kind: 'melee', dmg: 50, range: 2.3, rate: 0.42, hitAt: 0.1, mag: 0, reserve: 0, swap: 0.18, speedMul: 1.12, botRange: 1.5, sound: 'swing' })
    };
    const CLS = [
      { key: 'rifleman', name: 'Rifleman', hp: 100, speed: 1, prim: 'rifle', sec: 'pistol', hat: 'cap', desc: 'Steady assault rifle for every range.' },
      { key: 'scout', name: 'Scout', hp: 60, speed: 1.08, prim: 'sniper', sec: 'pistol', hat: 'hood', desc: 'One shot from the sniper rifle, but only 60 health.' },
      { key: 'dasher', name: 'Dasher', hp: 100, speed: 1.15, prim: 'smg', sec: null, hat: 'band', desc: 'Fastest gun class with a quick SMG.' },
      { key: 'heavy', name: 'Heavy', hp: 170, speed: 0.88, prim: 'lmg', sec: null, hat: 'helmet', desc: 'Huge health and a 60 round machine gun, but slow.' },
      { key: 'brawler', name: 'Brawler', hp: 100, speed: 1, prim: 'shotgun', sec: 'pistol', hat: 'mohawk', desc: 'Two shell shotgun that wins every close fight.' },
      { key: 'gunslinger', name: 'Gunslinger', hp: 100, speed: 1.02, prim: 'revolver', sec: null, hat: 'cowboy', desc: 'Six heavy revolver shots. Two body shots win.' },
      { key: 'blaster', name: 'Blaster', hp: 130, speed: 0.88, prim: 'rocket', sec: 'pistol', hat: 'goggles', desc: 'Rockets with splash damage. Rocket jump with them.' },
      { key: 'runner', name: 'Runner', hp: 120, speed: 1.22, prim: 'knife', sec: null, hat: 'none', desc: 'Only a knife, but the fastest feet in the game.' }
    ];
    const HUE = ['#ff6b3d', '#3d9bff', '#ffd23d', '#55d66b', '#b46bff', '#ff5fa8', '#3de0d0', '#f0f0f0', '#ff9a3d', '#7a8cff', '#c0e050', '#e05050'];
    const TEAMC = ['#ff5a4a', '#3d8bff'];
    const hb = { s: null, c: null };
    const mkHB = h => [{ z: 0, rx: 0.22, y0: 0, y1: h * 0.42 }, { z: 1, rx: 0.3, y0: h * 0.42, y1: h - 0.4 }, { z: 2, rx: 0.21, y0: h - 0.4, y1: h + 0.02 }];
    const MATS = {
      road: { color: '#8a8682', tile: 2, tex: (g, S) => pix(g, S, '#9a9590', [['#8b8681', 0.35], ['#a7a29c', 0.25], ['#7e7975', 0.12]], 2, (g, S) => { g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < S; i += 16) { g.fillRect(0, i, S, 1); g.fillRect(((i / 16) % 2) * 8 + 0, i, 1, 16); g.fillRect(((i / 16) % 2) * 8 + 16, i, 1, 16); g.fillRect(((i / 16) % 2) * 8 + 32, i, 1, 16); g.fillRect(((i / 16) % 2) * 8 + 48, i, 1, 16); } }) },
      brick: { color: '#c46a4e', tile: 2, tex: (g, S) => { pix(g, S, '#c9714f', [['#b8603f', 0.3], ['#d4805d', 0.2]], 2); g.fillStyle = 'rgba(70,30,20,.35)'; for (let y = 0; y < S; y += 8) { g.fillRect(0, y, S, 1); for (let x = ((y / 8) % 2) * 8; x < S; x += 16) g.fillRect(x, y, 1, 8); } } },
      plaster: { color: '#e9dcc2', tile: 3, tex: (g, S) => pix(g, S, '#ece2cc', [['#e0d4bb', 0.3], ['#f4ecdc', 0.2]], 4) },
      wood: { color: '#a8743f', tile: 1.5, tex: (g, S) => { pix(g, S, '#b07a44', [['#9c6a38', 0.35], ['#c08a52', 0.2]], 2); g.fillStyle = 'rgba(60,30,10,.35)'; for (let y = 0; y < S; y += 16) g.fillRect(0, y, S, 2); } },
      crate: { color: '#c08a4a', tile: 1.2, uvBox: true, tex: (g, S) => { pix(g, S, '#c4904f', [['#b07c40', 0.3], ['#d4a060', 0.2]], 2); g.strokeStyle = '#7a5226'; g.lineWidth = 6; g.strokeRect(3, 3, S - 6, S - 6); g.beginPath(); g.moveTo(4, 4); g.lineTo(S - 4, S - 4); g.stroke(); } },
      metal: { color: '#8f9aa6', tile: 2, tex: (g, S) => { pix(g, S, '#98a3ae', [['#8a95a0', 0.3], ['#a8b2bc', 0.2]], 4); g.fillStyle = 'rgba(0,0,0,.2)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 2, S); } },
      roof: { color: '#5b6270', tile: 2, tex: (g, S) => pix(g, S, '#636a78', [['#5a616e', 0.35], ['#6d7482', 0.2]], 2) },
      stone: { color: '#a9a398', tile: 2.5, tex: (g, S) => { pix(g, S, '#b0aa9e', [['#a19b90', 0.35], ['#bcb6ab', 0.2]], 4); g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < S; y += 32) { g.fillRect(0, y, S, 2); for (let x = ((y / 32) % 2) * 16; x < S; x += 32) g.fillRect(x, y, 2, 32); } } },
      grass: { color: '#6fae4a', tile: 3, tex: (g, S) => pix(g, S, '#73b24c', [['#68a543', 0.35], ['#82c058', 0.25], ['#5c9a3c', 0.1]], 2) },
      glass: { color: '#5d8fb5', tile: 1, tex: (g, S) => { g.fillStyle = '#5d8fb5'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(S * 0.15, S * 0.1, S * 0.12, S * 0.8); g.fillRect(S * 0.35, S * 0.1, S * 0.06, S * 0.8); } },
      trim: { color: '#f2f2ee', tile: 2 },
      dark: { color: '#3a3f4a', tile: 2 },
      snow: { color: '#eef3f7', tile: 3, tex: (g, S) => pix(g, S, '#f1f5f8', [['#e3eaf0', 0.35], ['#ffffff', 0.25]], 4) },
      ice: { color: '#bfe3f2', tile: 2, tex: (g, S) => pix(g, S, '#c3e5f3', [['#b2dbeb', 0.3], ['#d8f0fa', 0.25]], 4) },
      sand: { color: '#e2c48a', tile: 3, tex: (g, S) => pix(g, S, '#e4c78e', [['#d9b97c', 0.35], ['#eed49e', 0.25]], 2) },
      sandstone: { color: '#d8a868', tile: 2, tex: (g, S) => { pix(g, S, '#dcad6d', [['#cf9e5e', 0.3], ['#e6bb7e', 0.2]], 2); g.fillStyle = 'rgba(110,60,20,.22)'; for (let y = 0; y < S; y += 16) g.fillRect(0, y, S, 1); } },
      cloth: { color: '#d8433a', tile: 1, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 8, S); } },
      cont: { color: '#c84a3a', tile: 2.4, tex: (g, S) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.16)'; for (let x = 0; x < S; x += 8) g.fillRect(x, 0, 3, S); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, S, 3); g.fillRect(0, S - 3, S, 3); } },
      lamp: { color: '#fff2b0', tile: 1, glow: '#ffe080' }
    };
    const MAPS = [
      {
        key: 'brickyard', name: 'Brickyard', camY: 18,
        sky: { top: '#5aa6ff', mid: '#9fd0ff', bot: '#e8f4ff', fog: '#cfe6fb', fogNear: 70, fogFar: 230, sun: '#fff1d6', sunI: 1.0, hemi: 0.62, hemiTop: '#e8f3ff', hemiBot: '#b89c7a', sunDir: [-0.5, 1, 0.3], clouds: 1 },
        build(B) {
          B.box(0, -1, 0, 92, 1, 92, 'road');
          for (const [x, z, sx, sz] of [[0, -44, 90, 2], [0, 44, 90, 2], [-44, 0, 2, 86], [44, 0, 2, 86]]) B.box(x, 0, z, sx, 7, sz, 'brick');
          building(B, -40, -40, -19, -19, 6, 'brick', { roof: 'roof', arch: { ax: 'x', c: -29.5, w: 4, h: 3.2 } });
          building(B, 19, -40, 40, -19, 6, 'plaster', { roof: 'roof', trim: 'brick', arch: { ax: 'z', c: -29.5, w: 4, h: 3.2 } });
          building(B, -40, 19, -19, 40, 6, 'plaster', { roof: 'roof', trim: 'brick', arch: { ax: 'z', c: 29.5, w: 4, h: 3.2 } });
          building(B, 19, 19, 40, 40, 6, 'brick', { roof: 'roof', arch: { ax: 'x', c: 29.5, w: 4, h: 3.2 } });
          building(B, -7, -40, 7, -27, 6, 'stone', { roof: 'roof', wy: [1.4] });
          building(B, -7, 27, 7, 40, 6, 'stone', { roof: 'roof', wy: [1.4] });
          building(B, -40, -6, -28, 6, 4.5, 'wood', { roof: 'roof', trim: 'dark', wy: [1.4] });
          building(B, 28, -6, 40, 6, 4.5, 'wood', { roof: 'roof', trim: 'dark', wy: [1.4] });
          B.ramp(-17.5, -27, 3, 14, 0, 6, 3, 'wood'); B.box(-17.5, 0, -19.6, 3, 0.2, 1.2, 'wood', { nc: 1 });
          B.ramp(17.5, 27, 3, 14, 0, 6, 2, 'wood');
          B.ramp(-27, 17.5, 14, 3, 0, 6, 1, 'wood');
          B.ramp(27, -17.5, 14, 3, 0, 6, 0, 'wood');
          B.ramp(-34, 7.5, 6, 3, 0, 4.5, 1, 'wood'); B.ramp(34, -7.5, 6, 3, 0, 4.5, 0, 'wood');
          for (const [x0, x1, z] of [[-19, -7, -33.5], [7, 19, -33.5], [-19, -7, 33.5], [7, 19, 33.5]]) { B.box((x0 + x1) / 2, 5.6, z, x1 - x0, 0.4, 3, 'wood'); B.box((x0 + x1) / 2, 6, z - 1.45, x1 - x0, 0.9, 0.1, 'metal', { ns: 1 }); B.box((x0 + x1) / 2, 6, z + 1.45, x1 - x0, 0.9, 0.1, 'metal', { ns: 1 }); }
          for (const [z0, z1, x] of [[-19, -6, -34], [6, 19, -34], [-19, -6, 34], [6, 19, 34]]) { const top = 4.5, far = 6; B.ramp(x, (z0 + z1) / 2, 3, z1 - z0, top, far, z0 < 0 ? 3 : 2, 'wood', { base: top - 0.4 }); }
          B.box(0, 0, 0, 12, 1, 12, 'stone');
          B.ramp(0, -7.5, 4, 3, 0, 1, 2, 'stone'); B.ramp(0, 7.5, 4, 3, 0, 1, 3, 'stone'); B.ramp(-7.5, 0, 3, 4, 0, 1, 0, 'stone'); B.ramp(7.5, 0, 3, 4, 0, 1, 1, 'stone');
          B.box(0, 1, 0, 3.6, 9, 3.6, 'brick'); B.box(0, 10, 0, 4.4, 0.6, 4.4, 'trim'); B.box(0, 10.6, 0, 3.2, 2.6, 3.2, 'plaster'); B.box(0, 13.2, 0, 3.8, 0.4, 3.8, 'roof');
          for (const [x, z, ry] of [[0, -1.85, 0], [0, 1.85, 0], [-1.85, 0, 1], [1.85, 0, 1]]) { B.box(x, 11.1, z, ry ? 0.08 : 1.8, 1.8, ry ? 1.8 : 0.08, 'trim', { nc: 1, ns: 1 }); B.box(x * 1.02, 11.9, z * 1.02, ry ? 0.08 : 0.12, 0.9, ry ? 0.12 : 0.08, 'dark', { nc: 1, ns: 1 }); }
          for (const [x, z] of [[-4.6, -4.6], [4.6, -4.6], [-4.6, 4.6], [4.6, 4.6]]) { B.box(x, 1, z, 2.2, 1.1, 0.5, 'stone'); B.box(x, 1, z, 0.5, 1.1, 2.2, 'stone'); }
          crate(B, -11, 0, -12, 1.2); crate(B, -11, 0, -10.8, 1.2); crate(B, -11, 1.2, -11.4, 1.2);
          crate(B, 11, 0, 12, 1.2); crate(B, 11, 0, 10.8, 1.2); crate(B, 11, 1.2, 11.4, 1.2);
          crate(B, 12, 0, -11, 1.0); crate(B, -12, 0, 11, 1.0);
          crate(B, -24, 0, 0, 1.2); crate(B, -24, 0, 1.2, 1.2); crate(B, 24, 0, 0, 1.2); crate(B, 24, 0, -1.2, 1.2);
          crate(B, 0, 0, -22, 1.1); crate(B, 1.1, 0, -22, 1.1); crate(B, 0, 0, 22, 1.1); crate(B, -1.1, 0, 22, 1.1);
          B.box(-13, 0, -24, 5, 1.1, 1.2, 'metal'); B.box(13, 0, 24, 5, 1.1, 1.2, 'metal');
          B.box(-24, 0, -13, 1.2, 1.1, 5, 'metal'); B.box(24, 0, 13, 1.2, 1.1, 5, 'metal');
          for (const [x, z] of [[-15, -15], [15, -15], [-15, 15], [15, 15]]) { B.cyl(x, 0, z, 0.18, 4.2, 'dark', { seg: 6 }); B.box(x, 4.2, z, 0.5, 0.4, 0.5, 'lamp', { nc: 1, ns: 1 }); }
          B.box(-41.2, 0, -10, 1.4, 1.2, 4, 'wood'); B.box(41.2, 0, 10, 1.4, 1.2, 4, 'wood');
          B.box(-10, 0, 41.2, 4, 1.2, 1.4, 'wood'); B.box(10, 0, -41.2, 4, 1.2, 1.4, 'wood');
          for (const [x, z] of [[-30, -10], [30, 10], [-10, 30], [10, -30]]) B.box(x, 0, z, 2, 0.05, 2, 'grass', { nc: 1, ns: 1 });
          const S = [[-41, 0, -15, 0, 1.57], [-41, 0, 15, 1, 1.57], [41, 0, -15, 0, -1.57], [41, 0, 15, 1, -1.57], [-15, 0, -41, 0, 3.14], [15, 0, -41, 1, 3.14], [-15, 0, 41, 0, 0], [15, 0, 41, 1, 0], [-29.5, 6, -29.5, 0, null], [29.5, 6, 29.5, 1, null], [29.5, 6, -29.5, 1, null], [-29.5, 6, 29.5, 0, null], [-34, 4.5, 0, 0, null], [34, 4.5, 0, 1, null], [0, 6, -33.5, 0, null], [0, 6, 33.5, 1, null]];
          for (const s of S) B.spawn(s[0], s[1], s[2], s[3], s[4]);
          B.zone(0, 1, 0, 6.5, 'Plaza'); B.zone(-29.5, 6, -29.5, 6, 'Bank roof'); B.zone(29.5, 6, 29.5, 6, 'Mill roof'); B.zone(-20, 0, 0, 5, 'West street'); B.zone(20, 0, 0, 5, 'East street');
        }
      },
      {
        key: 'frostbyte', name: 'Frostbyte', camY: 16,
        sky: { top: '#7ea7d8', mid: '#b9d2ee', bot: '#eef4fb', fog: '#dde9f4', fogNear: 50, fogFar: 190, sun: '#ffffff', sunI: 0.85, hemi: 0.7, hemiTop: '#f2f7ff', hemiBot: '#9fb2c6', sunDir: [0.4, 1, -0.5], clouds: 2, snow: 1 },
        build(B) {
          B.box(0, -1, 0, 88, 1, 88, 'snow');
          for (const [x, z, sx, sz] of [[0, -42, 86, 2], [0, 42, 86, 2], [-42, 0, 2, 82], [42, 0, 2, 82]]) B.box(x, 0, z, sx, 6, sz, 'metal');
          const cont = (x, y, z, rot, c) => { const sx = rot ? 2.5 : 6, sz = rot ? 6 : 2.5; B.box(x, y, z, sx, 2.6, sz, 'cont', { c, uv: 1 }); };
          const CC = [0xc8463a, 0x2f7fc8, 0x3aa35a, 0xe0a030, 0x7a5ac8];
          cont(-12, 0, -14, 0, CC[0]); cont(-12, 2.6, -14, 0, CC[1]); cont(-4, 0, -14, 0, CC[2]);
          cont(12, 0, 14, 0, CC[3]); cont(12, 2.6, 14, 0, CC[0]); cont(4, 0, 14, 0, CC[4]);
          cont(-14, 0, 6, 1, CC[1]); cont(14, 0, -6, 1, CC[2]); cont(-14, 2.6, 6, 1, CC[3]); cont(14, 2.6, -6, 1, CC[4]);
          cont(-26, 0, -30, 1, CC[3]); cont(-23, 0, -30, 1, CC[0]); cont(26, 0, 30, 1, CC[1]); cont(23, 0, 30, 1, CC[2]);
          cont(-30, 0, 22, 0, CC[4]); cont(30, 0, -22, 0, CC[3]);
          building(B, -40, -40, -28, -18, 7, 'metal', { roof: 'roof', trim: 'dark', wy: [1.4, 4.2], wg: 3 });
          building(B, 28, 18, 40, 40, 7, 'metal', { roof: 'roof', trim: 'dark', wy: [1.4, 4.2], wg: 3 });
          building(B, -8, -40, 8, -30, 5, 'brick', { roof: 'roof', wy: [1.4] });
          building(B, -8, 30, 8, 40, 5, 'brick', { roof: 'roof', wy: [1.4] });
          B.ramp(-26, -24, 4, 12, 0, 7, 3, 'metal'); B.ramp(26, 24, 4, 12, 0, 7, 2, 'metal');
          B.ramp(-10.5, -27, 3, 6, 0, 2.6, 3, 'metal'); B.ramp(10.5, 27, 3, 6, 0, 2.6, 2, 'metal');
          B.ramp(10, -35, 4, 6, 0, 5, 1, 'wood'); B.ramp(-10, 35, 4, 6, 0, 5, 0, 'wood');
          B.box(0, 0, 0, 8, 4.2, 8, 'brick'); B.box(0, 4.2, 0, 8.6, 0.4, 8.6, 'trim');
          B.ramp(-6.5, 0, 5, 3, 0, 4.2, 0, 'metal'); B.ramp(6.5, 0, 5, 3, 0, 4.2, 1, 'metal');
          B.box(0, 4.6, -3.9, 8, 1, 0.3, 'metal', { ns: 1 }); B.box(0, 4.6, 3.9, 8, 1, 0.3, 'metal', { ns: 1 });
          B.box(-4, 0, -14, 0.6, 5.2, 0.6, 'dark'); B.box(4, 0, 14, 0.6, 5.2, 0.6, 'dark');
          for (const [x, z] of [[-20, 0], [20, 0], [0, -20], [0, 20]]) { B.box(x, 0, z, 3, 1.1, 1, 'ice'); }
          for (const [x, z] of [[-30, -5], [30, 5], [-5, 26], [5, -26], [-34, 32], [34, -32]]) crate(B, x, 0, z, 1.2);
          crate(B, -30, 1.2, -5, 1.2); crate(B, 30, 1.2, 5, 1.2);
          B.box(0, 9, -20, 1, 1, 34, 'dark', { nc: 1 }); B.box(0, 0, -36, 1, 9, 1, 'dark', { nc: 1 }); B.box(0, 7, -6, 0.2, 2, 0.2, 'dark', { nc: 1, ns: 1 });
          for (const [x, z] of [[-36, 0], [36, 0]]) { B.cyl(x, 0, z, 2.2, 5, 'metal', { seg: 10 }); B.cyl(x, 5, z, 2.2, 0.8, 'snow', { seg: 10, r2: 0.6, nc: 1 }); }
          const S = [[-38, 0, -8, 0], [-38, 0, 8, 0], [38, 0, -8, 1], [38, 0, 8, 1], [-20, 0, -38, 0], [20, 0, -38, 1], [-20, 0, 38, 0], [20, 0, 38, 1], [-34, 7, -29, 0], [34, 7, 29, 1], [0, 5, -35, 0], [0, 5, 35, 1], [-24, 0, 14, 0], [24, 0, -14, 1], [-12, 5.2, -14, 0], [12, 5.2, 14, 1]];
          for (const s of S) B.spawn(s[0], s[1], s[2], s[3]);
          B.zone(0, 4.2, 0, 4.5, 'Pump house'); B.zone(-34, 7, -29, 5, 'West depot'); B.zone(34, 7, 29, 5, 'East depot'); B.zone(0, 0, -22, 6, 'North yard'); B.zone(0, 0, 22, 6, 'South yard');
        }
      },
      {
        key: 'dunepost', name: 'Dunepost', camY: 16,
        sky: { top: '#3f8fe0', mid: '#8ec5ef', bot: '#f6e3c0', fog: '#f1dfbd', fogNear: 60, fogFar: 220, sun: '#ffe6b8', sunI: 1.1, hemi: 0.55, hemiTop: '#eaf4ff', hemiBot: '#c99a5a', sunDir: [0.5, 1, 0.45], clouds: 0 },
        build(B) {
          B.box(0, -1, 0, 92, 1, 92, 'sand');
          for (const [x, z, sx, sz] of [[0, -44, 90, 2], [0, 44, 90, 2], [-44, 0, 2, 86], [44, 0, 2, 86]]) B.box(x, 0, z, sx, 6, sz, 'sandstone');
          B.box(0, -1, 0, 1, 1, 1, 'sand', { nc: 1 });
          const mk = (x0, z0, x1, z1, h, o) => building(B, x0, z0, x1, z1, h, 'sandstone', Object.assign({ roof: 'sand', trim: 'plaster', wm: 'dark', wy: [1.6], wg: 4 }, o));
          mk(-40, -40, -24, -24, 5.5); mk(24, 24, 40, 40, 5.5); mk(24, -40, 40, -26, 4); mk(-40, 26, -24, 40, 4);
          mk(-14, -40, 14, -32, 3.2, { arch: { ax: 'x', c: 0, w: 5, h: 2.8 }, rim: 0 }); B.box(0, 3.2, -36, 28, 0.6, 8, 'plaster');
          mk(-14, 32, 14, 40, 3.2, { arch: { ax: 'x', c: 0, w: 5, h: 2.8 }, rim: 0 }); B.box(0, 3.2, 36, 28, 0.6, 8, 'plaster');
          B.box(0, -0.01, 0, 22, 0.02, 22, 'stone', { nc: 1 });
          for (const [x, z] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) { B.box(x, 0, z, 4, 2.6, 4, 'sandstone'); B.box(x, 2.6, z, 4.4, 0.25, 4.4, 'plaster'); }
          for (const [x, z, r] of [[-3.5, 0, 1], [3.5, 0, 1], [0, -3.5, 0], [0, 3.5, 0]]) B.box(x, 0, z, r ? 0.8 : 4, 1.1, r ? 4 : 0.8, 'sandstone');
          for (const [x, z, c] of [[-16, -6, 0xd8433a], [16, 6, 0x2f7fc8], [-6, 16, 0x3aa35a], [6, -16, 0xe0a030]]) { B.box(x, 0, z, 4, 0.9, 2, 'wood'); B.box(x, 2.4, z, 4.6, 0.12, 3, 'cloth', { c, nc: 1 }); for (const ox of [-2.1, 2.1]) B.box(x + ox, 0, z - 1.3, 0.15, 2.4, 0.15, 'wood', { nc: 1, ns: 1 }); }
          B.ramp(-22, -32, 4, 10, 0, 5.5, 3, 'sandstone'); B.ramp(22, 32, 4, 10, 0, 5.5, 2, 'sandstone');
          B.ramp(17, -30, 10, 3, 0, 3.8, 0, 'sandstone'); B.ramp(-17, 30, 10, 3, 0, 3.8, 1, 'sandstone');
          B.ramp(-16, -36, 4, 6, 0, 3.8, 1, 'wood', {}); B.ramp(16, 36, 4, 6, 0, 3.8, 0, 'wood');
          for (const [x, z] of [[-30, -6], [30, 6], [-30, 8], [30, -8], [-6, -26], [6, 26]]) crate(B, x, 0, z, 1.2);
          crate(B, -30, 1.2, -6, 1.2); crate(B, 30, 1.2, 6, 1.2);
          for (const [x, z] of [[-34, 0], [34, 0], [0, -24], [0, 24]]) { B.cyl(x, 0, z, 0.35, 6, 'wood', { seg: 6 }); B.box(x, 6, z, 3.6, 0.2, 0.6, 'grass', { nc: 1, ns: 1 }); B.box(x, 6, z, 0.6, 0.2, 3.6, 'grass', { nc: 1, ns: 1 }); }
          B.box(-36, 0, 14, 6, 1.5, 6, 'sandstone'); B.ramp(-36, 18.5, 4, 3, 0, 1.5, 3, 'sandstone');
          B.box(36, 0, -14, 6, 1.5, 6, 'sandstone'); B.ramp(36, -18.5, 4, 3, 0, 1.5, 2, 'sandstone');
          const S = [[-41, 0, -12, 0], [-41, 0, 12, 0], [41, 0, -12, 1], [41, 0, 12, 1], [-20, 0, -41, 0], [20, 0, -20, 1], [-20, 0, 20, 0], [20, 0, 41, 1], [-32, 5.5, -32, 0], [32, 5.5, 32, 1], [0, 3.8, -36, 0], [0, 3.8, 36, 1], [-36, 1.5, 14, 0], [36, 1.5, -14, 1], [32, 4, -33, 1], [-32, 4, 33, 0]];
          for (const s of S) B.spawn(s[0], s[1], s[2], s[3]);
          B.zone(0, 0, 0, 6, 'Market'); B.zone(0, 3.8, -36, 5, 'North gate'); B.zone(0, 3.8, 36, 5, 'South gate'); B.zone(-32, 5.5, -32, 5, 'Watch house'); B.zone(32, 5.5, 32, 5, 'Store house');
        }
      }
    ];

    const ICON = {
      rifle: '<path d="M3 13h28l2-2h12v3h-6l-2 2h-3l-1 5h-5l1-5H16l-2 4H9l1-4H3z"/>',
      sniper: '<path d="M2 13h34l1-2h10v2h-9v2H24l-2 4h-5l1-4H9l-1 3H3z"/><path d="M18 9h10v3H18z"/>',
      smg: '<path d="M8 12h22l2-2h6v3h-4v3h-6l-1 6h-5l1-6h-6l-2 3H9z"/>',
      shotgun: '<path d="M2 12h36v3H22l-1 2h-6l-2 3H8l1-3H2z"/><path d="M24 15h10v2H24z"/>',
      revolver: '<path d="M14 11h20v3h-4v2h-9l-2 6h-5l2-7h-2z"/><circle cx="24" cy="15" r="2.5"/>',
      lmg: '<path d="M2 12h34l2-2h8v3h-6l-2 3H26l-2 6h-5l1-6h-4l-1 4h-5l1-4H2z"/><path d="M17 16h6v5h-6z"/>',
      rocket: '<path d="M4 10h34v6H4z"/><path d="M38 9l6 4-6 4z"/><path d="M14 16h4v6h-4zM24 16h3v4h-3z"/>',
      pistol: '<path d="M16 11h18v3H24l-2 8h-5l2-8h-3z"/>',
      knife: '<path d="M6 14h14l2-2h20l-4 4H22l-2-1H6z"/>',
      fall: '<path d="M20 4v14M14 12l6 6 6-6"/><path d="M8 22h24"/>'
    };
    const svgI = (k, small) => `<svg viewBox="0 0 48 24" class="wi" fill="currentColor" stroke="none">${ICON[k] || ICON.rifle}</svg>`;

    const SND = {
      rifle: (A, D, k) => { A.noise(0.09, 0.5, 1800, 0.7, 0, 'bandpass', 600, D); A.tone(170, 60, 0.1, 'square', 0.18, 0, D); A.noise(0.03, 0.4, 5000, 1, 0, 'highpass', 0, D); },
      smg: (A, D) => { A.noise(0.06, 0.4, 2400, 0.8, 0, 'bandpass', 900, D); A.tone(220, 90, 0.06, 'square', 0.12, 0, D); },
      sniper: (A, D) => { A.noise(0.35, 0.8, 1200, 0.5, 0, 'lowpass', 180, D); A.tone(110, 38, 0.32, 'sawtooth', 0.3, 0, D); A.noise(0.05, 0.6, 6000, 1, 0, 'highpass', 0, D); A.noise(0.08, 0.15, 3000, 4, 0.42, 'bandpass', 0, D); A.noise(0.05, 0.12, 2000, 4, 0.55, 'bandpass', 0, D); },
      shotgun: (A, D) => { A.noise(0.28, 0.85, 900, 0.5, 0, 'lowpass', 140, D); A.tone(90, 35, 0.25, 'square', 0.25, 0, D); A.noise(0.06, 0.12, 2500, 5, 0.32, 'bandpass', 0, D); },
      revolver: (A, D) => { A.noise(0.2, 0.75, 1500, 0.6, 0, 'lowpass', 250, D); A.tone(140, 45, 0.18, 'sawtooth', 0.22, 0, D); A.noise(0.03, 0.4, 7000, 1, 0, 'highpass', 0, D); },
      lmg: (A, D) => { A.noise(0.11, 0.55, 1300, 0.6, 0, 'bandpass', 400, D); A.tone(120, 45, 0.12, 'square', 0.22, 0, D); },
      rocket: (A, D) => { A.noise(0.45, 0.5, 700, 0.8, 0, 'bandpass', 2400, D); A.tone(80, 160, 0.3, 'sawtooth', 0.12, 0, D); },
      pistol: (A, D) => { A.noise(0.08, 0.45, 2200, 0.7, 0, 'bandpass', 700, D); A.tone(260, 100, 0.07, 'square', 0.12, 0, D); },
      swing: (A, D) => A.noise(0.16, 0.25, 1200, 1.2, 0, 'bandpass', 3200, D),
      melee: (A, D) => { A.tone(160, 70, 0.1, 'triangle', 0.3, 0, D); A.noise(0.06, 0.3, 900, 1, 0, 'bandpass', 0, D); },
      hit: (A, D) => A.tone(1500, 1500, 0.04, 'square', 0.07, 0, D),
      head: (A, D) => { A.tone(2200, 2200, 0.07, 'sine', 0.14, 0, D); A.tone(3300, 3300, 0.05, 'sine', 0.06, 0.01, D); },
      kill: (A, D) => { A.tone(880, 880, 0.07, 'square', 0.08, 0, D); A.tone(1320, 1320, 0.12, 'square', 0.08, 0.07, D); },
      hurt: (A, D) => { A.tone(150, 80, 0.14, 'triangle', 0.25, 0, D); A.noise(0.08, 0.2, 500, 1, 0, 'lowpass', 0, D); },
      reload: (A, D) => { A.noise(0.04, 0.3, 3000, 3, 0, 'bandpass', 0, D); A.tone(700, 500, 0.04, 'square', 0.05, 0.25, D); A.noise(0.05, 0.35, 2000, 3, 0.55, 'bandpass', 0, D); A.tone(900, 1200, 0.05, 'square', 0.05, 0.75, D); },
      swap: (A, D) => { A.noise(0.05, 0.2, 2500, 2, 0, 'bandpass', 0, D); A.tone(600, 800, 0.04, 'square', 0.04, 0.08, D); },
      dry: (A, D) => A.tone(1800, 1600, 0.03, 'square', 0.06, 0, D),
      jump: (A, D) => A.noise(0.08, 0.12, 800, 1, 0, 'lowpass', 300, D),
      land: (A, D, k) => { A.noise(0.08, 0.15 + (k || 0) * 0.3, 400, 1, 0, 'lowpass', 120, D); A.tone(90, 50, 0.08, 'sine', 0.1 + (k || 0) * 0.2, 0, D); },
      step: (A, D) => A.noise(0.05, 0.09, 700, 1.2, 0, 'bandpass', 250, D),
      slide: (A, D) => A.noise(0.5, 0.22, 600, 0.6, 0, 'bandpass', 1800, D),
      ric: (A, D) => { if (Math.random() < 0.5) A.tone(2400 + Math.random() * 1500, 900, 0.12, 'sine', 0.04, 0, D); A.noise(0.04, 0.15, 3500, 2, 0, 'bandpass', 0, D); },
      boom: (A, D) => { A.noise(0.9, 1, 600, 0.5, 0, 'lowpass', 60, D); A.tone(70, 28, 0.7, 'sine', 0.6, 0, D); A.noise(0.3, 0.5, 2000, 0.6, 0, 'bandpass', 300, D); },
      die: (A, D) => { A.tone(300, 120, 0.25, 'triangle', 0.15, 0, D); },
      dead: (A, D) => { A.tone(220, 110, 0.6, 'sawtooth', 0.08, 0, D); A.tone(165, 82, 0.8, 'sine', 0.1, 0.1, D); },
      spawn: (A, D) => { A.tone(500, 900, 0.18, 'sine', 0.08, 0, D); },
      start: (A, D) => { [523, 659, 784].forEach((f, i) => A.tone(f, f, 0.14, 'square', 0.06, i * 0.1, D)); },
      win: (A, D) => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => A.tone(f, f, 0.22, 'square', 0.07, i * 0.12, D)); },
      lose: (A, D) => { [392, 349, 311, 262].forEach((f, i) => A.tone(f, f * 0.98, 0.3, 'triangle', 0.1, i * 0.18, D)); },
      zone: (A, D) => { A.tone(660, 990, 0.2, 'sine', 0.1, 0, D); A.tone(990, 1320, 0.2, 'sine', 0.08, 0.15, D); },
      chat: (A, D) => A.tone(1200, 1500, 0.05, 'sine', 0.05, 0, D),
      award: (A, D) => { [784, 988, 1175, 1568].forEach((f, i) => A.tone(f, f, 0.12, 'square', 0.06, i * 0.07, D)); },
      pickup: (A, D) => { A.tone(900, 1400, 0.1, 'sine', 0.1, 0, D); },
      bounce: (A, D) => A.tone(500, 300, 0.05, 'triangle', 0.1, 0, D),
      throw: (A, D) => A.noise(0.12, 0.15, 1000, 1, 0, 'bandpass', 2400, D)
    };

    const TI = {
      fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>',
      ads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
      jump: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/><path d="M6 19h12"/></svg>',
      crouch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/><path d="M6 4h12"/></svg>',
      reload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12a7 7 0 1 1-2-5"/><path d="M19 4v4h-4"/></svg>',
      swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14l-3-3M20 16H6l3 3"/></svg>',
      nade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"/><path d="M12 8V5h3"/></svg>',
      melee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 19L17 7l2-3-3 2L4 18z"/></svg>',
      pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
      sb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'
    };

    function gunParts(k, s) {
      s = s || 1;
      const D = '#2d313a', M = '#4a505c', L = '#6b7280', O = '#ff7a1a', W = '#8a5a32', Bk = '#1c1e24';
      const P = [];
      const b = (c, x, y, z, w, h, d) => P.push(['box', c, [x * s, y * s, z * s], [w * s, h * s, d * s]]);
      const cy = (c, x, y, z, r, l) => P.push(['cyl8', c, [x * s, y * s, z * s], [r * 2 * s, l * s, r * 2 * s], [Math.PI / 2, 0, 0]]);
      let mz = -0.5, mag = null;
      if (k === 'rifle') { b(M, 0, 0, -0.05, 0.07, 0.09, 0.5); b(D, 0, 0.01, -0.38, 0.05, 0.05, 0.3); cy(Bk, 0, 0.01, -0.58, 0.018, 0.2); b(D, 0, -0.025, 0.28, 0.06, 0.1, 0.2); b(O, 0, 0.06, -0.08, 0.035, 0.03, 0.16); b(D, 0, -0.08, 0.06, 0.05, 0.11, 0.06); mag = [D, 0, -0.1, -0.1, 0.05, 0.16, 0.08]; mz = -0.69; }
      else if (k === 'sniper') { b(D, 0, 0, 0, 0.07, 0.08, 0.6); cy(Bk, 0, 0.01, -0.55, 0.018, 0.6); cy(M, 0, 0.09, -0.06, 0.035, 0.32); b(O, 0, 0.09, -0.06, 0.08, 0.02, 0.04); b(W, 0, -0.03, 0.36, 0.06, 0.12, 0.26); b(D, 0, -0.08, 0.1, 0.05, 0.1, 0.05); mag = [D, 0, -0.08, -0.12, 0.05, 0.08, 0.08]; mz = -0.86; }
      else if (k === 'smg') { b(M, 0, 0, 0, 0.07, 0.1, 0.36); cy(Bk, 0, 0.015, -0.26, 0.02, 0.14); b(D, 0, -0.01, 0.22, 0.05, 0.06, 0.14); b(O, 0, 0.065, -0.02, 0.03, 0.025, 0.1); b(D, 0, -0.09, 0.06, 0.05, 0.1, 0.05); mag = [D, 0, -0.12, -0.08, 0.045, 0.2, 0.06]; mz = -0.34; }
      else if (k === 'shotgun') { b(W, 0, -0.02, 0.24, 0.07, 0.11, 0.26); b(D, 0, 0, -0.08, 0.08, 0.09, 0.36); cy(Bk, 0, 0.025, -0.45, 0.028, 0.45); cy(M, 0, -0.03, -0.38, 0.026, 0.34); b(O, 0, 0.055, -0.1, 0.03, 0.02, 0.06); b(W, 0, -0.05, -0.32, 0.08, 0.06, 0.16); mz = -0.68; }
      else if (k === 'revolver') { b(M, 0, 0.01, -0.12, 0.05, 0.06, 0.26); cy(D, 0, 0, -0.02, 0.045, 0.09); b(W, 0, -0.09, 0.06, 0.05, 0.14, 0.07); b(O, 0, 0.05, -0.22, 0.015, 0.02, 0.02); mz = -0.26; }
      else if (k === 'lmg') { b(D, 0, 0, -0.05, 0.1, 0.12, 0.6); cy(Bk, 0, 0.02, -0.55, 0.03, 0.4); b(M, 0, 0.08, -0.05, 0.08, 0.04, 0.3); b(D, 0, -0.02, 0.36, 0.07, 0.12, 0.22); b(O, 0, 0.11, -0.15, 0.03, 0.03, 0.08); b(D, 0, -0.1, 0.1, 0.05, 0.11, 0.06); mag = [O, 0.07, -0.06, -0.08, 0.1, 0.14, 0.14]; mz = -0.76; }
      else if (k === 'rocket') { cy('#4f6b3a', 0, 0.02, -0.1, 0.075, 0.95); cy(D, 0, 0.02, -0.58, 0.085, 0.06); cy(D, 0, 0.02, 0.37, 0.085, 0.05); b(O, 0, 0.11, -0.12, 0.04, 0.05, 0.12); b(D, 0, -0.1, 0.0, 0.05, 0.12, 0.06); b(D, 0, -0.1, -0.22, 0.05, 0.1, 0.05); mz = -0.62; }
      else if (k === 'pistol') { b(M, 0, 0.015, -0.06, 0.05, 0.06, 0.2); b(D, 0, -0.07, 0.02, 0.045, 0.12, 0.06); b(O, 0, 0.05, 0.02, 0.015, 0.015, 0.02); mz = -0.17; }
      else if (k === 'knife') { b('#c9d0d8', 0, 0.02, -0.16, 0.012, 0.045, 0.22); b(D, 0, 0, 0.02, 0.03, 0.05, 0.12); b(O, 0, 0, -0.045, 0.05, 0.06, 0.02); mz = -0.28; }
      return { P, mz: mz * s, mag: mag ? [mag[0], [mag[1] * s, mag[2] * s, mag[3] * s], [mag[4] * s, mag[5] * s, mag[6] * s]] : null };
    }

    const Gdef = {
      id: 'hopfire', title: 'Hopfire', tint: '#ff7a1a',
      blurb: 'Fast low-poly arena shooter: slide, bunny hop and frag bots or friends online.',
      help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · mouse look · click fire · right click aim · <kbd>Space</kbd> jump (hold to bunny hop) · <kbd>Shift</kbd> crouch, slide while running · <kbd>R</kbd> reload · <kbd>Q</kbd> or wheel swap · <kbd>V</kbd> knife · <kbd>Tab</kbd> scores · <kbd>Esc</kbd> menu · touch: stick, drag to look, buttons',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="18"/><path d="M32 6v12M32 46v12M6 32h12M46 32h12"/><circle cx="32" cy="32" r="3" fill="currentColor"/></svg>',
      font: '"Trebuchet MS", system-ui, sans-serif', pixel: true, exposure: 1.0,
      phys: { g: 24, jumpV: 7.7, speed: 7.2, accel: 11, airAccel: 2.4, airCap: 1.1, fric: 7, stopSpeed: 2.5, crouchMul: 0.45, slideBoost: 1.5, slideTime: 0.75, slideFric: 0.75, slideMin: 0.6, slideSteer: 2.4, slideCd: 0.3, stepH: 0.5, H: 1.8, HC: 1.15, eye: 1.62, eyeC: 1.0, R: 0.34, maxFall: 40, autoHop: true, maxAir: 1.9, adsMul: 0.7 },
      weapons: WEP, classes: CLS, melee: 'knife', nade: null, nades: 0,
      modes: [
        { key: 'ffa', name: 'Free for all', teams: 0, time: 240, limit: 25 },
        { key: 'tdm', name: 'Team deathmatch', teams: 1, time: 300, limit: 50 },
        { key: 'hp', name: 'Hardpoint', teams: 1, zone: 1, time: 300, limit: 200, zoneTime: 60 }
      ],
      teams: ['Red team', 'Blue team'],
      maps: MAPS, mats: MATS, sky: MAPS[0].sky,
      respawn: 3, manualSpawn: false, spawnProt: 1.5, regenDelay: 4.5, regenRate: 24, killScore: 100, headScore: 50, assistScore: 25, botSight: 95, hearR: 45, footR: 16, defBots: 6, maxBots: 7, defFov: 80,
      botClassW: [3, 1.6, 2, 1.3, 1.6, 1.2, 1, 0.8],
      botNames: ['Ziggy', 'Pixel', 'Nova', 'Rook', 'Blitz', 'Mango', 'Jinx', 'Vortex', 'Echo', 'Kappa', 'Dash', 'Orbit', 'Sparky', 'Turbo', 'Quill', 'Fizz', 'Glitch', 'Pepper', 'Ronin', 'Volt'],
      firstHint: 'Click to aim. Hold Space to bunny hop, Shift while running to slide.',
      zoneMoved: 'The hardpoint moved', headWord: 'Headshots', headWord1: 'Headshot', mateCol: '#7fd3ff', foeCol: '#ff6a5a', tracer: '#ffe7a0', boomCol: '#ffa030',
      headIcon: '<svg viewBox="0 0 24 24" class="hi" fill="currentColor"><circle cx="12" cy="10" r="6"/><rect x="9" y="15" width="6" height="5"/></svg>',
      sounds: SND, touchIcons: TI,
      hitboxes(p, h) { return h > 1.5 ? (hb.s || (hb.s = mkHB(h))) : (hb.c || (hb.c = mkHB(h))); },
      headY: h => h - 0.2,
      fovFor(p) { const w = p.weps[p.cur]; return w ? 1 + ((w.d.zoom || 1) - 1) * p.adsF : 1; },
      colorFor(p, teams) { return teams ? TEAMC[p.team] : HUE[p.slot % HUE.length]; },
      wepIcon: (k, s) => svgI(k, s),
      statBars(c) { const w = WEP[c.prim]; const dps = w.kind === 'melee' ? 90 : w.kind === 'rocket' ? 120 : w.dmg * (w.pellets || 1) / w.rate; return [['Health', c.hp / 170], ['Speed', (c.speed - 0.8) / 0.45], ['Damage', Math.min(1, (w.kind === 'rocket' ? 145 : w.dmg * (w.pellets || 1)) / 110)], ['Fire rate', Math.min(1, dps / 260)]]; },
      streakName(n) { return n === 2 ? 'Double kill' : n === 3 ? 'Triple kill' : n === 5 ? 'Rampage! 5 in a row' : n === 10 ? 'Unstoppable! 10 in a row' : n === 15 ? 'Legendary! 15 in a row' : n > 3 && n % 5 === 0 ? 'Streak of ' + n : ''; },
      streaks: null,
      pickup: () => false, pickupName: () => '',
      logo: () => `<div class="hf-logo"><span class="a">HOP</span><span class="b">FIRE</span></div><p class="hf-tag">${escH(T('Slide. Hop. Frag.'))}</p>`,
      howHTML: (T, e) => `<ul class="fp-list"><li>${e(T('Move with W A S D (Z Q S D on French keyboards), look with the mouse, click to fire and right click to aim.'))}</li><li>${e(T('Hold Space to bunny hop: you keep your speed as long as you jump the moment you land.'))}</li><li>${e(T('Press Shift (or C) while running to slide. Jump out of a slide to keep its speed. Slides down ramps go even faster.'))}</li><li>${e(T('R reloads, Q or the mouse wheel swaps to your pistol, V swings the knife. Your health comes back after a few seconds out of the fight.'))}</li><li>${e(T('Free for all: first to 25 kills or the best score after 4 minutes. Team deathmatch: first team to 50. Hardpoint: hold the glowing zone; it moves every minute.'))}</li><li>${e(T('Pick a class before you spawn. Each class has its own gun, health and speed.'))}</li></ul>`,
      css: R => `
${R} .fp-wrap{--acc:#ff7a1a;--acc2:#2ad4c4;--pan:rgba(14,18,30,.86);font-family:"Trebuchet MS",system-ui,sans-serif;color:#fff}
${R} .fp-card{background:var(--pan);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:clamp(12px,2.2cqw,24px);box-shadow:0 20px 60px rgba(0,0,0,.45);backdrop-filter:blur(6px)}
${R} .fp-card h3{margin:0 0 .6em;font-size:clamp(18px,3cqw,30px);font-weight:900;letter-spacing:.02em;text-transform:uppercase}
${R} .fp-main{width:min(96cqw,860px)}
${R} .hf-logo{font-weight:900;font-size:clamp(30px,7cqw,64px);line-height:.9;letter-spacing:-.02em;font-style:italic;text-shadow:0 4px 0 rgba(0,0,0,.35)}
${R} .hf-logo .a{color:#fff}${R} .hf-logo .b{color:var(--acc)}
${R} .hf-tag{margin:.2em 0 .8em;color:var(--acc2);font-weight:800;letter-spacing:.2em;text-transform:uppercase;font-size:clamp(10px,1.4cqw,13px)}
${R} .fp-lv{display:flex;flex-wrap:wrap;align-items:center;gap:.4em 1em;font-size:clamp(11px,1.4cqw,14px);color:#c8d0e0;margin-bottom:1em}
${R} .fp-lv .lvb{background:var(--acc);color:#1a0d00;font-weight:900;padding:.15em .6em;border-radius:6px}
${R} .fp-lv .lvbar{flex:1;min-width:80px;height:6px;border-radius:3px;background:rgba(255,255,255,.15);overflow:hidden}
${R} .fp-lv .lvbar i{display:block;height:100%;background:var(--acc2)}
${R} .fp-opts{display:grid;grid-template-columns:auto 1fr;gap:.5em 1em;align-items:center;margin-bottom:1em;font-size:clamp(11px,1.5cqw,14px)}
${R} .fp-opts label,${R} .fp-lab,${R} .fp-set label{font-weight:800;color:#9aa6bd;text-transform:uppercase;letter-spacing:.08em;font-size:.85em}
${R} .fp-seg button{background:rgba(255,255,255,.08);color:#e8ecf4;padding:.4em .8em;border-radius:7px;font-weight:700;font-size:inherit}
${R} .fp-seg button:hover{background:rgba(255,255,255,.16)}
${R} .fp-seg button.on{background:var(--acc);color:#1a0d00}
${R} .fp-num{gap:.6em}${R} .fp-num small{color:#9aa6bd}
${R} .fp-btn{background:rgba(255,255,255,.12);color:#fff;padding:.65em 1.2em;border-radius:9px;font-weight:800;font-size:clamp(12px,1.7cqw,16px);text-transform:uppercase;letter-spacing:.04em}
${R} .fp-btn:hover{background:rgba(255,255,255,.2)}
${R} .fp-btn.big{background:var(--acc);color:#1a0d00;font-size:clamp(15px,2.3cqw,22px);padding:.6em 1.6em;box-shadow:0 5px 0 #b34e00}
${R} .fp-btn.big:hover{filter:brightness(1.08)}
${R} .fp-btn.big:active{transform:translateY(3px);box-shadow:0 2px 0 #b34e00}
${R} .fp-btn.ghost{background:transparent;border:2px solid rgba(255,255,255,.22)}
${R} .fp-btn.sm{padding:.25em .7em;font-size:16px}
${R} .fp-btn:disabled{opacity:.45;cursor:default}
${R} .fp-acts{display:flex;flex-wrap:wrap;gap:.6em;margin-top:1em;align-items:center}
${R} .fp-acts.col{flex-direction:column;align-items:stretch}
${R} .fp-clsg{display:grid;grid-template-columns:repeat(4,1fr);gap:.5em}
${R} .fp-cls{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:.1em;background:rgba(255,255,255,.06);border:2px solid transparent;border-radius:10px;padding:.5em .6em;color:#fff;text-align:left;font-size:clamp(10px,1.35cqw,13px)}
${R} .fp-cls:hover{background:rgba(255,255,255,.12)}
${R} .fp-cls.on{border-color:var(--acc);background:rgba(255,122,26,.16)}
${R} .fp-cls .ic{color:var(--acc);height:1.6em;display:block}${R} .fp-cls .ic svg{height:100%;width:auto}
${R} .fp-cls b{font-weight:900;text-transform:uppercase}${R} .fp-cls small{color:#9aa6bd}
${R} .fp-cls kbd{position:absolute;right:.5em;top:.4em;font:700 10px/1 system-ui;color:#6b778f}
${R} .fp-clsd p{color:#c8d0e0}${R} .fp-clsd .bars{color:#8b96ab}${R} .fp-cls .bars{display:flex;flex-direction:column;gap:2px;width:100%;margin-top:.3em}
${R} .fp-cls .bars span{display:flex;align-items:center;gap:.4em;font-size:.82em;color:#8b96ab}
${R} .fp-cls .bars em{font-style:normal;width:4.8em}
${R} .fp-cls .bars i{flex:1;height:4px;border-radius:2px;background:linear-gradient(90deg,var(--acc2) var(--v),rgba(255,255,255,.12) var(--v))}
${R} .fp-clsg.sm{grid-template-columns:repeat(4,1fr)}${R} .fp-clsg.sm .fp-cls{padding:.35em .5em}
${R} .fp-set{width:min(92cqw,520px);display:grid;grid-template-columns:auto 1fr;gap:.7em 1.2em;align-items:center;font-size:clamp(11px,1.6cqw,15px)}
${R} .fp-set h3,${R} .fp-set .fp-acts{grid-column:1/-1}
${R} .fp-how{width:min(92cqw,620px);font-size:clamp(11px,1.6cqw,15px)}
${R} .fp-list{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:.5em;line-height:1.4;color:#dfe5f0}
${R} .fp-pause{width:min(86cqw,360px);text-align:center}
${R} .fp-note{color:#a8b3c7;font-size:clamp(11px,1.5cqw,14px);margin:.3em 0}
${R} .fp-death{width:min(94cqw,560px);text-align:center;background:rgba(40,8,8,.72)}
${R} .fp-death h3{color:#ff6a5a;margin:.1em 0 .2em}
${R} .fp-kick{margin:0;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:#c9a0a0;font-size:clamp(10px,1.4cqw,13px)}
${R} .fp-rs{font-size:clamp(16px,2.6cqw,26px);font-weight:900;margin:.3em 0 .6em;min-height:1.2em}
${R} .fp-death .fp-acts{justify-content:center}
${R} .fp-over{width:min(96cqw,640px);text-align:center}
${R} .fp-over.win h3{color:var(--acc)}
${R} .fp-ts{font-size:clamp(22px,4cqw,40px);font-weight:900;margin:0 0 .3em}
${R} .fp-ts .t0,${R} tr.t0 td:nth-child(2),${R} .fp-feed b.t0,${R} tr.th.t0 td{color:#ff7a6a}${R} .fp-ts .t1,${R} tr.t1 td:nth-child(2),${R} .fp-feed b.t1,${R} tr.th.t1 td{color:#6aaeff}
${R} .fp-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:.4em;margin:.6em 0}
${R} .fp-stats div{background:rgba(255,255,255,.06);border-radius:8px;padding:.4em .2em;display:flex;flex-direction:column}
${R} .fp-stats b{font-size:clamp(15px,2.4cqw,24px);font-weight:900}${R} .fp-stats small{color:#9aa6bd;font-size:clamp(9px,1.2cqw,12px);text-transform:uppercase}
${R} .fp-lvup{color:var(--acc2);font-weight:900;margin:.3em 0}
${R} .fp-tbl{max-height:30cqh;overflow:auto;margin-top:.4em}
${R} .fp-tbl table{width:100%;border-collapse:collapse;font-size:clamp(10px,1.4cqw,14px)}
${R} .fp-tbl td,${R} .fp-tbl th{padding:.3em .6em;text-align:right}${R} .fp-tbl td:nth-child(2),${R} .fp-tbl th:nth-child(2){text-align:left}
${R} .fp-tbl th,${R} .fp-sb th{color:#8b96ab;font-weight:800;text-transform:uppercase;font-size:.8em}
${R} tr.me td{background:rgba(255,122,26,.18)}
${R} .fp-sbc{background:rgba(10,14,24,.82)}${R} .fp-sbc h3{font-size:clamp(14px,2cqw,20px)}
${R} .fp-sb tr.th td{text-align:left;font-weight:900;padding-top:.8em}
${R} .fp-hud{font-family:"Trebuchet MS",system-ui,sans-serif;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.45)}
${R} .hf-hp{position:absolute;left:2cqw;bottom:2.4cqw;width:min(30cqw,300px)}
${R} .hf-hp .row{display:flex;align-items:flex-end;gap:.6cqw;margin-bottom:.4cqw}
${R} .hf-hp b{font-size:clamp(18px,3.6cqw,38px);font-weight:900;line-height:1}
${R} .hf-hp small{font-size:clamp(9px,1.2cqw,13px);font-weight:800;color:#c8d0e0;text-transform:uppercase;letter-spacing:.1em;padding-bottom:.3em}
${R} .hf-hp .bar{height:clamp(7px,1.1cqw,12px);border-radius:3px;background:rgba(0,0,0,.45);overflow:hidden;box-shadow:inset 0 0 0 2px rgba(0,0,0,.3)}
${R} .hf-hp .bar i{display:block;height:100%;width:100%;background:linear-gradient(#7af08a,#2fb84a);transform-origin:left;transition:transform .12s}
${R} .hf-hp.low .bar i{background:linear-gradient(#ff8a7a,#e0342a)}
${R} .hf-am{position:absolute;right:2cqw;bottom:2.4cqw;text-align:right;line-height:1}
${R} .hf-am .n{font-size:clamp(22px,4.6cqw,48px);font-weight:900}${R} .hf-am .r{font-size:clamp(12px,2cqw,22px);font-weight:800;color:#c8d0e0}
${R} .hf-am .n.low{color:#ff6a5a}
${R} .hf-am .wn{display:flex;align-items:center;justify-content:flex-end;gap:.5em;font-size:clamp(10px,1.3cqw,14px);font-weight:800;color:#c8d0e0;text-transform:uppercase;margin-top:.3em}
${R} .hf-am .wn svg{height:1.6em;width:auto;color:var(--acc)}
${R} .hf-am .rl{font-size:clamp(10px,1.3cqw,14px);color:var(--acc);font-weight:900;text-transform:uppercase;height:1.2em}
${R} .fp-tc .tm{font-size:clamp(15px,2.4cqw,24px);font-weight:900;background:rgba(0,0,0,.4);padding:.15em .6em;border-radius:7px}
${R} .fp-tc .sc{font-size:clamp(13px,2cqw,20px);font-weight:900;padding:.15em .6em;border-radius:7px;min-width:2.4em;text-align:center}
${R} .fp-tc .sc.t0{background:rgba(255,80,60,.75)}${R} .fp-tc .sc.t1{background:rgba(60,130,255,.75)}
${R} .fp-tc .ob{font-size:clamp(10px,1.3cqw,13px);font-weight:800;background:rgba(0,0,0,.4);padding:.2em .6em;border-radius:6px;color:#ffd9a8}
${R} .fp-tl div{background:rgba(0,0,0,.35);border-radius:5px;font-weight:700}${R} .fp-tl div.me{background:rgba(255,122,26,.55)}
${R} .fp-feed div{background:rgba(0,0,0,.42);border-radius:6px;font-weight:700}
${R} .fp-feed div.mine{background:rgba(255,122,26,.42)}
${R} .fp-feed b.me{color:#ffd23d}${R} .fp-feed .wi{color:#fff}${R} .fp-feed .hi{height:1em;width:1em;color:#ff6a5a}
${R} .fp-pop .st,${R} .fp-pop .aw{color:var(--acc);font-size:clamp(20px,4cqw,40px);text-transform:uppercase;font-style:italic}
${R} .fp-pop .hs{color:#ff6a5a;font-size:clamp(14px,2.4cqw,24px);text-transform:uppercase}
${R} .fp-pop .el{font-size:clamp(13px,2cqw,20px);color:#fff}
${R} .fp-pop .ov{font-size:clamp(26px,5cqw,52px);text-transform:uppercase}
${R} .fp-pop .zn{color:var(--acc2);font-size:clamp(14px,2.4cqw,24px)}
${R} .fp-sub span{display:block;color:#ffd23d}
${R} .fp-scope{background:radial-gradient(circle at center,transparent 0,transparent calc(min(42cqw,42cqh) - 2px),#000 calc(min(42cqw,42cqh)));transition:opacity .06s}
${R} .fp-scope::before,${R} .fp-scope::after{content:"";position:absolute;left:50%;top:50%;background:#000}
${R} .fp-scope::before{width:min(84cqw,84cqh);height:2px;transform:translate(-50%,-50%)}
${R} .fp-scope::after{height:min(84cqw,84cqh);width:2px;transform:translate(-50%,-50%)}
@container (max-width:620px){${R} .fp-clsg{grid-template-columns:repeat(2,1fr)}${R} .fp-cls .bars{display:none}${R} .fp-stats{grid-template-columns:repeat(3,1fr)}${R} .fp-opts{grid-template-columns:1fr}}
@container (max-height:430px){${R} .fp-cls .bars{display:none}${R} .fp-main{padding:10px 14px}${R} .hf-logo{font-size:30px}}
`,
      hudHTML: () => `<div class="hf-hp"><div class="row"><b class="n">100</b><small class="cl"></small></div><div class="bar"><i></i></div></div><div class="hf-am"><div class="rl"></div><span class="n">30</span><span class="r"> / ∞</span><div class="wn"></div></div>`,
      hudBind(h, H) { H.hp = h.querySelector('.hf-hp'); H.hpN = h.querySelector('.hf-hp .n'); H.hpB = h.querySelector('.hf-hp .bar i'); H.cl = h.querySelector('.hf-hp .cl'); H.am = h.querySelector('.hf-am'); H.amN = h.querySelector('.hf-am .n'); H.amR = h.querySelector('.hf-am .r'); H.wn = h.querySelector('.hf-am .wn'); H.rl = h.querySelector('.hf-am .rl'); },
      hudUpdate(H, me, W, setT, setS, setH, T, e) {
        const hp = Math.max(0, Math.ceil(me.hp));
        setT(H.hpN, 'hp', String(hp));
        setS(H.hpB, 'hpb', 'transform', `scaleX(${(hp / me.maxHp).toFixed(3)})`);
        if (H.hp.classList.contains('low') !== (hp < me.maxHp * 0.35)) H.hp.classList.toggle('low');
        setT(H.cl, 'cl', T(CLS[me.cls].name));
        const w = me.weps[me.cur];
        if (!w) return;
        const mel = w.d.kind === 'melee';
        setT(H.amN, 'amn', mel ? '—' : String(w.mag));
        setT(H.amR, 'amr', mel ? '' : w.res > 999 ? ' / ∞' : ' / ' + w.res);
        if (H.amN.classList.contains('low') !== (!mel && w.mag <= Math.ceil(w.d.mag * 0.25))) H.amN.classList.toggle('low');
        setH(H.wn, 'wn', `${e(T(w.d.name))}${svgI(w.k)}`);
        setT(H.rl, 'rl', me.reloadT > 0 ? T('Reloading') : !mel && w.mag === 0 ? T('Press R to reload') : '');
      },
      hudTop(H, W, me, tl, setH, T, e) {
        const mm = Math.floor(tl / 60), ss = String(tl % 60).padStart(2, '0');
        const lim = W.mode.limit;
        let html = '';
        if (W.teams) html = `<span class="sc t0">${W.teamScore[0]}</span><span class="tm">${mm}:${ss}</span><span class="sc t1">${W.teamScore[1]}</span>`;
        else { const L = W.players.filter(p => p && p.inGame); const top = Math.max(0, ...L.map(p => p.kills)); html = `<span class="tm">${mm}:${ss}</span><span class="ob">${e(T('First to {n}', { n: lim }))} · ${top}</span>`; }
        if (W.mode.zone && W.M.zones.length) { const z = W.M.zones[W.zone.i]; const own = W.zone.own; html += `<span class="ob">${e(T(z.name))}${own === 2 ? ' · ' + e(T('Contested')) : own === me.team ? ' · ' + e(T('Held')) : own >= 0 ? ' · ' + e(T('Enemy')) : ''}</span>`; }
        setH(H.tc, 'tc', html);
      },
      makeSky(kit, sky) {
        const { THREE } = kit, g = new THREE.Group();
        const geo = kit.own(new THREE.SphereGeometry(400, 24, 14)), p = geo.attributes.position, cs = [];
        const c0 = kit.lin(sky.bot), c1 = kit.lin(sky.mid), c2 = kit.lin(sky.top), tc = new THREE.Color();
        for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 400, t = clamp(y * 1.3 + 0.05, 0, 1); if (t < 0.3) tc.copy(c0).lerp(c1, t / 0.3); else tc.copy(c1).lerp(c2, (t - 0.3) / 0.7); cs.push(tc.r, tc.g, tc.b); }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
        const m = new THREE.Mesh(geo, kit.own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
        m.renderOrder = -1; g.add(m);
        if (sky.clouds) {
          const L = [];
          let s = 7;
          const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
          for (let i = 0; i < 26; i++) { const a = r() * TAU, d = 150 + r() * 120, y = 60 + r() * 40, w = 14 + r() * 24; L.push(['box', sky.clouds === 2 ? '#e8eef6' : '#ffffff', [Math.cos(a) * d, y, Math.sin(a) * d], [w, 3 + r() * 3, w * (0.4 + r() * 0.4)], [0, a, 0]]); L.push(['box', '#ffffff', [Math.cos(a) * d + 3, y + 2.5, Math.sin(a) * d], [w * 0.55, 3, w * 0.35], [0, a, 0]]); }
          const cm = new THREE.Mesh(kit.geo(L), kit.own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
          g.add(cm);
        }
        const far = [];
        let s2 = 99;
        const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 40; i++) { const a = i / 40 * TAU + r2() * 0.1, d = 110 + r2() * 40, h = 10 + r2() * 30, w = 8 + r2() * 14; far.push(['box', sky.snow ? '#c9d6e4' : sky.clouds ? '#8fa6c2' : '#d9b98a', [Math.cos(a) * d, h / 2 - 1, Math.sin(a) * d], [w, h, w], [0, a, 0]]); }
        const fm = new THREE.Mesh(kit.geo(far), kit.own(new THREE.MeshLambertMaterial({ vertexColors: true })));
        g.add(fm);
        return g;
      },
      makeChar(kit, look) {
        const { THREE } = kit;
        const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
        const C = look.color, skin = '#f0c39a', dark = '#2b2f3a', boot = '#3a2f28', pants = '#3d4658';
        const cls = CLS[look.cls] || CLS[0];
        const hip = new THREE.Group(); hip.position.y = 0.8; body.add(hip);
        const mkLeg = x => { const g = new THREE.Group(); g.position.set(x, 0, 0); g.add(kit.mesh([['box', pants, [0, -0.3, 0], [0.2, 0.62, 0.22]], ['box', boot, [0, -0.7, -0.03], [0.22, 0.2, 0.28]]])); hip.add(g); return g; };
        const legL = mkLeg(-0.12), legR = mkLeg(0.12);
        const torso = new THREE.Group(); hip.add(torso);
        torso.add(kit.mesh([['box', C, [0, 0.32, 0], [0.52, 0.62, 0.3]], ['box', dark, [0, 0.02, 0], [0.54, 0.1, 0.32]], ['box', '#ffffff', [0, 0.42, -0.16], [0.18, 0.12, 0.02]]]));
        const head = new THREE.Group(); head.position.y = 0.66; torso.add(head);
        const hp = [['box', skin, [0, 0.18, 0], [0.36, 0.36, 0.36]], ['box', dark, [0, 0.2, -0.185], [0.3, 0.09, 0.02]], ['box', '#ffffff', [-0.07, 0.2, -0.19], [0.05, 0.04, 0.01]], ['box', '#ffffff', [0.07, 0.2, -0.19], [0.05, 0.04, 0.01]]];
        const hat = cls.hat;
        if (hat === 'cap') hp.push(['box', C, [0, 0.38, 0.02], [0.38, 0.1, 0.38]], ['box', C, [0, 0.34, -0.24], [0.34, 0.03, 0.14]]);
        else if (hat === 'hood') hp.push(['box', '#4a5a3a', [0, 0.3, 0.04], [0.4, 0.28, 0.36]], ['box', '#4a5a3a', [0, 0.06, 0.16], [0.4, 0.3, 0.1]]);
        else if (hat === 'band') hp.push(['box', C, [0, 0.31, 0], [0.38, 0.07, 0.38]], ['box', C, [0.05, 0.28, 0.22], [0.06, 0.04, 0.12]]);
        else if (hat === 'helmet') hp.push(['box', '#5a6070', [0, 0.36, 0], [0.42, 0.16, 0.42]], ['box', '#5a6070', [0, 0.27, 0], [0.46, 0.04, 0.46]]);
        else if (hat === 'mohawk') hp.push(['box', C, [0, 0.4, 0.02], [0.08, 0.12, 0.34]]);
        else if (hat === 'cowboy') hp.push(['box', '#7a4a24', [0, 0.38, 0], [0.3, 0.14, 0.3]], ['box', '#7a4a24', [0, 0.33, 0], [0.62, 0.03, 0.62]]);
        else if (hat === 'goggles') hp.push(['box', '#ffb020', [0, 0.22, -0.19], [0.34, 0.1, 0.04]], ['box', '#222', [0, 0.27, 0], [0.38, 0.05, 0.38]]);
        else hp.push(['box', '#3b2a1e', [0, 0.37, 0.02], [0.37, 0.04, 0.37]]);
        head.add(kit.mesh(hp));
        const aim = new THREE.Group(); aim.position.set(0, 0.52, 0); torso.add(aim);
        aim.add(kit.mesh([['box', C, [-0.3, -0.05, -0.08], [0.14, 0.14, 0.34]], ['box', C, [0.3, -0.05, -0.08], [0.14, 0.14, 0.34]], ['box', skin, [-0.2, -0.08, -0.3], [0.1, 0.1, 0.16]], ['box', skin, [0.14, -0.1, -0.24], [0.1, 0.1, 0.14]]]));
        const gunG = new THREE.Group(); gunG.position.set(0.05, -0.06, -0.3); aim.add(gunG);
        const muzzle = new THREE.Object3D(); gunG.add(muzzle);
        let curW = '';
        const setW = k => {
          if (k === curW) return;
          curW = k;
          while (gunG.children.length > 1) gunG.remove(gunG.children[1]);
          const gp = gunParts(k, 0.85);
          const P = gp.P.slice(); if (gp.mag) P.push(['box', gp.mag[0], gp.mag[1], gp.mag[2]]);
          gunG.add(kit.mesh(P));
          muzzle.position.set(0, 0.01, gp.mz);
        };
        const ring = new THREE.Mesh(kit.G0.sph, kit.own(new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.25, depthWrite: false })));
        ring.scale.set(1.1, 2.1, 1.1); ring.position.y = 0.95; ring.visible = false; root.add(ring);
        let ph = 0;
        return {
          root, muzzle,
          anim(s) {
            setW(s.wk);
            const dt = s.dt;
            ring.visible = s.prot;
            if (!s.alive) {
              const k = Math.min(1, s.deadT / 0.45);
              body.rotation.x = k * 1.45; body.position.y = Math.max(-0.3, -s.deadT * 0.1); body.position.z = k * 0.4;
              body.scale.setScalar(s.deadT > 1.1 ? Math.max(0.01, 1 - (s.deadT - 1.1) / 0.5) : 1);
              return;
            }
            body.rotation.x = 0; body.position.set(0, 0, 0); body.scale.setScalar(1);
            const sp = Math.min(1.4, s.spd / 7);
            ph += dt * (6 + s.spd * 1.3);
            const sw = s.ground && !s.slide ? Math.sin(ph) * 0.8 * sp : s.ground ? 0 : 0.35;
            legL.rotation.x = sw; legR.rotation.x = s.ground ? -sw : -0.5;
            const cr = s.crouch ? (s.slide ? 0.5 : 0.42) : 0;
            hip.position.y = 0.8 - cr * 0.9;
            if (s.crouch && !s.slide) { legL.rotation.x = -1.1 + sw * 0.3; legR.rotation.x = 0.5 - sw * 0.3; }
            if (s.slide) { legL.rotation.x = -1.3; legR.rotation.x = -1.0; torso.rotation.x = 0.45; } else torso.rotation.x = s.crouch ? 0.25 : 0;
            aim.rotation.x = s.pitch - torso.rotation.x;
            head.rotation.x = s.pitch * 0.5;
            const rec = s.fire < 0.08 ? (0.08 - s.fire) * 3 : 0, rl = s.reload < 1 ? Math.sin(Math.min(1, s.reload) * Math.PI) * 0.6 : 0, ml = s.melee < 0.4 ? Math.sin(s.melee / 0.4 * Math.PI) : 0;
            gunG.rotation.x = rec + rl; gunG.position.z = -0.3 + rec * 0.1 - ml * 0.25;
          },
          dispose() {}
        };
      },
      makeView(kit, k) {
        const { THREE } = kit;
        const root = new THREE.Group();
        const gp = gunParts(k, 1);
        const gun = kit.mesh(gp.P, { noShadow: true });
        root.add(gun);
        let mag = null;
        if (gp.mag) { mag = kit.mesh([['box', gp.mag[0], [0, 0, 0], gp.mag[2]]], { noShadow: true }); mag.position.set(...gp.mag[1]); root.add(mag); }
        const sl = '#2a3550', gl = '#f0c39a';
        const arms = kit.mesh([['box', sl, [0.06, -0.14, 0.24], [0.09, 0.09, 0.36], [0.25, 0, 0]], ['box', gl, [0.02, -0.09, 0.07], [0.07, 0.07, 0.09]], ['box', sl, [-0.12, -0.16, -0.02], [0.08, 0.08, 0.4], [0.3, 0.45, 0]], ['box', gl, [-0.03, -0.06, -0.2], [0.065, 0.06, 0.08]]], { noShadow: true });
        if (k !== 'knife' && k !== 'pistol' && k !== 'revolver') root.add(arms);
        else root.add(kit.mesh([['box', sl, [0.04, -0.15, 0.24], [0.09, 0.09, 0.36], [0.3, 0, 0]], ['box', gl, [0.01, -0.08, 0.06], [0.07, 0.07, 0.09]]], { noShadow: true }));
        const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.012, gp.mz); root.add(muzzle);
        const VS = 0.7;
        root.scale.setScalar(VS);
        const sightY = ({ rifle: 0.078, sniper: 0.09, smg: 0.078, shotgun: 0.06, revolver: 0.06, lmg: 0.125, rocket: 0.135, pistol: 0.058, knife: 0 }[k] || 0.07) * VS;
        const out = {
          root, muzzle, hip: k === 'knife' ? [0.16, -0.15, -0.32] : k === 'rocket' ? [0.15, -0.15, -0.36] : k === 'pistol' || k === 'revolver' ? [0.12, -0.12, -0.3] : [0.12, -0.13, -0.38], aim: k === 'knife' ? [0.14, -0.14, -0.32] : [0, -sightY, k === 'sniper' ? -0.3 : k === 'pistol' || k === 'revolver' ? -0.26 : -0.32], kickZ: k === 'sniper' || k === 'shotgun' ? 0.1 : 0.06, kickRot: 0.5, reloadRoll: 0.7, flashS: k === 'shotgun' || k === 'lmg' ? 1.4 : k === 'pistol' ? 0.8 : 1, noFlash: k === 'knife' || k === 'rocket',
          anim(s, dt, rl, me) {
            if (mag) { const d = rl >= 0 ? Math.sin(Math.min(1, rl) * Math.PI) : 0; mag.position.y = gp.mag[1][1] - d * 0.25; mag.visible = !(rl > 0.35 && rl < 0.6); }
            if (k === 'knife') { const m = me >= 0 ? Math.sin(me * Math.PI) : 0; root.rotation.y += m * 0.9; root.rotation.x -= m * 0.4; root.position.z -= m * 0.12; root.position.x -= m * 0.12; }
            else if (me >= 0) { const m = Math.sin(me * Math.PI); root.position.y -= m * 0.2; root.rotation.x += m * 0.5; }
          }
        };
        return out;
      },
      makeProj(kit, kind) {
        const m = kit.mesh([['cyl8', '#4f6b3a', [0, 0, 0], [0.12, 0.45, 0.12], [Math.PI / 2, 0, 0]], ['cone', '#ff7a1a', [0, 0, -0.3], [0.12, 0.16, 0.12], [-Math.PI / 2, 0, 0]], ['box', '#ffd060', [0, 0, 0.26], [0.08, 0.08, 0.08]]], { noShadow: true });
        return m;
      },
      makePickup(kit) { return new kit.THREE.Group(); },
      makeZone(kit) {
        const { THREE } = kit, g = new THREE.Group();
        const mat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
        const wall = new THREE.Mesh(kit.own(new THREE.CylinderGeometry(1, 1, 3, 32, 1, true)), mat); wall.position.y = 1.5; g.add(wall);
        const disc = new THREE.Mesh(kit.own(new THREE.RingGeometry(0.92, 1, 40)), mat); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; g.add(disc);
        g.userData.mat = mat;
        return g;
      },
      zoneColor(zm, own, mt, t) { const m = zm.userData.mat; const c = own === 2 ? 0xffffff : own === mt ? 0x40d0ff : own >= 0 ? 0xff5040 : 0xffd040; m.color.set(c).convertSRGBToLinear(); m.opacity = 0.18 + Math.sin(t * 3) * 0.05; },
      debrisGeo: kit => kit.G0.box,
      impactFx(view, x, y, z, nx, ny, nz) { view.burst(x, y, z, 4, '#d8cfc0', 1.6, 1, 0.35, 9, nx, ny, nz); },
      hitFx(view, x, y, z, v, zone) { const c = v ? Gdef.colorFor(v, view.teams) : '#ff4040'; view.burst(x, y, z, zone === 2 ? 9 : 5, zone === 2 ? '#ffffff' : '#ff4a3a', 2, 1, 0.4, 9); view.debris(x, y, z, 2, [c], 2.5, 0.07, 1.2, v ? v.y : y - 1); },
      deathFx(view, v, x, y, z) { view.debris(x, y + 0.8, z, 12, [Gdef.colorFor(v, view.teams), '#f0c39a', '#3d4658'], 3.5, 0.13, 2.2, y); view.burst(x, y + 1, z, 16, '#ffffff', 2.5, 2, 0.6, 4); },
      makeProp: null
    };
    Ameplay.register(arenaGame(Gdef));
  }
