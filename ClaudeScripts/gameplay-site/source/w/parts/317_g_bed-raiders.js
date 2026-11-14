(() => {
  'use strict';
  const ID = 'bed-raiders', G = '.gm-' + ID;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const wrapA = a => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const T = (s, o) => {
    let v = s;
    try { if (window.gpI18n && typeof gpI18n.t === 'function') v = gpI18n.t(s) || s; } catch (e) {}
    return o ? String(v).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m)) : v;
  };
  const esc = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
  const DT = 1 / 60;
  const WX = 96, WY = 48, WZ = 96, BASE = 20, TOPY = 38;
  const P_W = 0.6, P_H = 1.8, P_HS = 1.5, EYE = 1.62, EYES = 1.32;
  const WALK = 4.32, SPRINT = 5.61, SNEAK = 1.31, GRAV = 32, JUMP_V = 8.9, REACH = 4.5, HIT = 3.0;
  const TEAMS = [
    { n: 'Red', c: '#ff4a4a', d: '#b8282e', k: 'R' }, { n: 'Blue', c: '#3f8cff', d: '#2050b8', k: 'B' }, { n: 'Green', c: '#45d65e', d: '#23913a', k: 'G' }, { n: 'Yellow', c: '#ffd23f', d: '#c79a12', k: 'Y' }
  ];
  const B = {
    AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, COBBLE: 4, LOG: 5, LEAVES: 6, PLANKS: 7, SAND: 8, BRICKS: 9, WOOL: 11, CLAY: 16, GLASS: 20, HARD: 21, OBSID: 23, IRONB: 24, GOLDB: 25, DIAB: 26, EMEB: 27, BED: 28, LANTERN: 37, SNOW: 38
  };
  const BD = [];
  const bdef = (id, o) => { BD[id] = Object.assign({ id, solid: true, hard: -1, tool: 'any', blast: 2, cut: false, h: 1, light: false }, o); };
  bdef(0, { solid: false, n: 'Air' });
  bdef(1, { n: 'Grass Block' }); bdef(2, { n: 'Dirt' }); bdef(3, { n: 'Stone' }); bdef(4, { n: 'Cobblestone' }); bdef(5, { n: 'Oak Log' }); bdef(6, { n: 'Leaves', cut: true }); bdef(7, { n: 'Oak Planks', hard: 2, tool: 'axe', blast: 0 });
  bdef(8, { n: 'Sand' }); bdef(9, { n: 'Stone Bricks' });
  for (let t = 0; t < 4; t++) { bdef(11 + t, { n: 'Wool', hard: 0.8, tool: 'shears', blast: 0, team: t }); bdef(16 + t, { n: 'Clay', hard: 1.25, tool: 'pick', blast: 0, team: t }); bdef(28 + t * 2, { n: 'Bed', bed: t, h: 0.5625, hard: 0.2, foot: true }); bdef(29 + t * 2, { n: 'Bed', bed: t, h: 0.5625, hard: 0.2 }); }
  bdef(20, { n: 'Blast-Proof Glass', hard: 0.3, tool: 'pick', blast: 2, cut: true }); bdef(21, { n: 'Hard Stone', hard: 3, tool: 'pick', blast: 1 }); bdef(23, { n: 'Obsidian', hard: 50, tool: 'pick', blast: 2 });
  bdef(24, { n: 'Iron Block' }); bdef(25, { n: 'Gold Block' }); bdef(26, { n: 'Diamond Block' }); bdef(27, { n: 'Emerald Block' }); bdef(37, { n: 'Lantern', light: true }); bdef(38, { n: 'Snow' });
  const RES = [{ k: 'iron', n: 'Iron', c: '#e8e8ef' }, { k: 'gold', n: 'Gold', c: '#ffd23f' }, { k: 'dia', n: 'Diamond', c: '#4fe6ff' }, { k: 'eme', n: 'Emerald', c: '#3ddc6a' }];
  const SWORDS = [{ n: 'Wooden Sword', d: 5 }, { n: 'Stone Sword', d: 6 }, { n: 'Iron Sword', d: 7 }, { n: 'Diamond Sword', d: 8 }];
  const ARMOR = [{ n: 'Leather Armor', p: 7 }, { n: 'Chainmail Armor', p: 9 }, { n: 'Iron Armor', p: 11 }, { n: 'Diamond Armor', p: 13 }];
  const PICKS = [null, { n: 'Wooden Pickaxe', s: 2, e: 1 }, { n: 'Iron Pickaxe', s: 6, e: 2 }, { n: 'Golden Pickaxe', s: 12, e: 3 }, { n: 'Diamond Pickaxe', s: 8, e: 3 }];
  const AXES = [null, { n: 'Wooden Axe', s: 2, e: 1 }, { n: 'Stone Axe', s: 4, e: 1 }, { n: 'Iron Axe', s: 6, e: 2 }, { n: 'Diamond Axe', s: 8, e: 3 }];
  const SHOP = [
    { k: 'Blocks', items: [
      { id: 'wool', n: 'Wool', q: 16, c: [0, 4], b: 11 }, { id: 'clay', n: 'Clay', q: 16, c: [0, 12], b: 16 }, { id: 'glass', n: 'Blast-Proof Glass', q: 4, c: [0, 12], b: 20 },
      { id: 'hard', n: 'Hard Stone', q: 12, c: [0, 24], b: 21 }, { id: 'planks', n: 'Oak Planks', q: 16, c: [1, 4], b: 7 }, { id: 'obsid', n: 'Obsidian', q: 4, c: [3, 4], b: 23 }] },
    { k: 'Melee', items: [{ id: 'sw1', n: 'Stone Sword', c: [0, 10] }, { id: 'sw2', n: 'Iron Sword', c: [1, 7] }, { id: 'sw3', n: 'Diamond Sword', c: [3, 4] }, { id: 'kb', n: 'Knockback Stick', c: [1, 5] }] },
    { k: 'Armor', items: [{ id: 'ar1', n: 'Chainmail Armor', c: [0, 24], d: 'Kept after death' }, { id: 'ar2', n: 'Iron Armor', c: [1, 12], d: 'Kept after death' }, { id: 'ar3', n: 'Diamond Armor', c: [3, 6], d: 'Kept after death' }] },
    { k: 'Tools', items: [{ id: 'pick', n: 'Pickaxe', c: null }, { id: 'axe', n: 'Axe', c: null }, { id: 'shears', n: 'Shears', c: [0, 20], d: 'Kept after death' }] },
    { k: 'Ranged', items: [{ id: 'bow', n: 'Bow', c: [1, 12] }, { id: 'bow2', n: 'Power Bow', c: [1, 20] }, { id: 'arrow', n: 'Arrows', q: 8, c: [1, 2] }] },
    { k: 'Utility', items: [{ id: 'gapple', n: 'Golden Apple', c: [1, 3] }, { id: 'fire', n: 'Fireball', c: [0, 40] }, { id: 'tnt', n: 'TNT', c: [1, 4] }, { id: 'pearl', n: 'Warp Pearl', c: [3, 4] }, { id: 'egg', n: 'Bridge Egg', c: [3, 1] }] }
  ];
  const PICK_COST = [null, [0, 10], [0, 10], [1, 3], [1, 6]], AXE_COST = [null, [0, 10], [0, 10], [1, 3], [1, 6]];
  const UPG = [
    { id: 'sharp', n: 'Sharpened Swords', d: 'Your team gets Sharpness I on all swords.', c: [4], max: 1 },
    { id: 'prot', n: 'Reinforced Armor', d: 'Protection on your team’s armor.', c: [2, 4, 8, 16], max: 4 },
    { id: 'haste', n: 'Maniac Miner', d: 'Your team mines faster.', c: [2, 4], max: 2 },
    { id: 'forge', n: 'Forge', d: 'Faster iron and gold, then emeralds at your base.', c: [2, 4, 6, 8], max: 4 },
    { id: 'heal', n: 'Heal Pool', d: 'Regeneration near your base.', c: [1], max: 1 },
    { id: 'trap', n: 'Alarm Trap', d: 'The next enemy who comes near your bed is slowed and revealed.', c: [1], max: 1 }
  ];
  const LVL = [
    { n: 'Easy', react: 0.55, err: 0.2, turn: 4, cps: 4, bridge: 0.75, layers: 1, buy: 0.5, crit: 0, gap: 0, dia: 0, strafe: 0.3, wtap: 0, early: 45, clutch: 0, rushB: 16 },
    { n: 'Normal', react: 0.4, err: 0.13, turn: 6, cps: 6, bridge: 0.5, layers: 1, buy: 0.8, crit: 0.1, gap: 0.4, dia: 0.3, strafe: 0.6, wtap: 0.3, early: 32, clutch: 0, rushB: 20 },
    { n: 'Hard', react: 0.3, err: 0.085, turn: 8, cps: 8, bridge: 0.36, layers: 2, buy: 1, crit: 0.3, gap: 0.8, dia: 0.7, strafe: 0.85, wtap: 0.6, early: 26, clutch: 0.3, rushB: 24 },
    { n: 'Hardest', react: 0.2, err: 0.05, turn: 11, cps: 10, bridge: 0.26, layers: 3, buy: 1, crit: 0.6, gap: 1, dia: 1, strafe: 1, wtap: 1, early: 24, clutch: 1, rushB: 28 }
  ];
  const EVENTS = [[300, 'dia2', 'Diamond II'], [480, 'eme2', 'Emerald II'], [660, 'dia3', 'Diamond III'], [840, 'eme3', 'Emerald III'], [1020, 'beds', 'Bed destruction'], [1260, 'sudden', 'Sudden death'], [1500, 'end', 'Game end']];
  const NAMES = ['Pebble', 'Mossy', 'Tinker', 'Clank', 'Fern', 'Bramble', 'Sootie', 'Dusk', 'Ember', 'Wisp', 'Quartz', 'Rusty', 'Juniper', 'Flick'];
  const HEROES = [
    { n: 'Alex', skin: '#f0c39a', hair: '#6b3e1e', eye: '#3b6fd6', shirt: '#2fa8a0', pants: '#3b3f7a' },
    { n: 'Rowan', skin: '#c48b62', hair: '#1e1a1a', eye: '#3a2a1a', shirt: '#e3e3e3', pants: '#4a4a52' },
    { n: 'Ivy', skin: '#f6d2b5', hair: '#d9932e', eye: '#2e8a3e', shirt: '#9b59d0', pants: '#2b2b3a' },
    { n: 'Kofi', skin: '#7a4a2e', hair: '#141010', eye: '#2a1a10', shirt: '#ff8a3d', pants: '#36404f' },
    { n: 'Mei', skin: '#f3d0ae', hair: '#232030', eye: '#202030', shirt: '#ff6fa8', pants: '#5b3f2e' },
    { n: 'Sven', skin: '#f5d6c0', hair: '#f2e6a0', eye: '#4a8ad6', shirt: '#4a7a3a', pants: '#6a5038' }
  ];

  const OL = c => `text-shadow:.08em .08em 0 ${c}`;
  const CSS = `
${G} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#8ec7ff;font-family:var(--sans);-webkit-user-select:none;user-select:none;color:#fff;box-shadow:0 22px 44px -30px rgba(31,29,43,.6)}
${G} .stage .g-canvas{border-radius:0;display:block;width:100%;height:100%;background:#8ec7ff}
${G} [hidden]{display:none!important}
${G} .ui{position:absolute;inset:0;pointer-events:none;font-size:clamp(9px,1.55cqw,16px);image-rendering:pixelated}
${G} .px{font-family:"Pixelify Sans","Press Start 2P",ui-monospace,Consolas,monospace;font-weight:700;letter-spacing:.02em}
${G} .xh{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;mix-blend-mode:difference}
${G} .xh::before,${G} .xh::after{content:"";position:absolute;background:#fff}
${G} .xh::before{left:8px;top:0;width:2px;height:18px}${G} .xh::after{top:8px;left:0;height:2px;width:18px}
${G} .hb{position:absolute;left:50%;bottom:1.2%;transform:translateX(-50%);display:flex;gap:0;padding:.18em;background:rgba(20,20,20,.55);border:.18em solid rgba(0,0,0,.6)}
${G} .hs{position:relative;width:3.1em;height:3.1em;border:.18em solid #8b8b8b;border-top-color:#373737;border-left-color:#373737;background:rgba(139,139,139,.45);box-sizing:border-box;display:grid;place-items:center}
${G} .hs.on{border:.24em solid #fff;box-shadow:0 0 0 .1em #000;z-index:1}
${G} .hs canvas{width:76%;height:76%;image-rendering:pixelated}
${G} .hs b{position:absolute;right:.12em;bottom:0;font-size:.95em;${OL('#3a3a3a')};font-variant-numeric:tabular-nums}
${G} .hs i{position:absolute;left:.15em;right:.15em;bottom:.12em;height:.22em;background:#000}
${G} .hs i u{display:block;height:100%;background:#4cff4c}
${G} .stat{position:absolute;left:50%;bottom:calc(1.2% + 3.9em);transform:translateX(-50%);width:28.3em;display:flex;justify-content:space-between;align-items:flex-end}
${G} .hearts{display:flex;flex-wrap:wrap;width:13.5em;gap:0 .05em}
${G} .hearts i,${G} .armr i{display:block;width:1.3em;height:1.2em;background-size:100% 100%;image-rendering:pixelated}
${G} .armr{display:flex;width:13.5em;gap:0 .05em;justify-content:flex-end}
${G} .hearts.flash{animation:br-hf .25s steps(2) 2}
@keyframes br-hf{50%{filter:brightness(2.2)}}
${G} .resb{position:absolute;left:calc(50% + 15.8em);bottom:1.4%;display:flex;flex-direction:column;gap:.15em}
${G} .resb div{display:flex;align-items:center;gap:.35em;font-size:.95em;${OL('#222')}}
${G} .resb canvas{width:1.5em;height:1.5em;image-rendering:pixelated}
${G} .sb{position:absolute;right:.8%;top:50%;transform:translateY(-50%);min-width:13em;padding:.5em .7em;background:rgba(0,0,0,.42);font-size:.92em;line-height:1.5}
${G} .sb h4{margin:0 0 .3em;text-align:center;color:#ffd23f;font-size:1.05em;letter-spacing:.06em}
${G} .sb .r{display:flex;justify-content:space-between;gap:1em;white-space:nowrap}
${G} .sb .r em{font-style:normal}
${G} .sb .g{color:#7dff7d}${G} .sb .x{color:#ff5c5c}${G} .sb .me{text-decoration:underline}
${G} .chat{position:absolute;left:.6%;bottom:calc(1.2% + 9.5em);display:flex;flex-direction:column;gap:.1em;max-width:46%;font-size:.95em}
${G} .chat div{padding:.08em .4em;background:rgba(0,0,0,.4);animation:br-chat 7s linear both}
@keyframes br-chat{0%,85%{opacity:1}100%{opacity:0}}
${G} .ttl{position:absolute;left:0;right:0;top:27%;text-align:center;pointer-events:none;opacity:0;transition:opacity .25s}
${G} .ttl.on{opacity:1}
${G} .ttl b{display:block;font-size:4em;line-height:1.1;${OL('#3a1010')}}
${G} .ttl span{display:block;font-size:1.5em;margin-top:.4em;${OL('#222')}}
${G} .act{position:absolute;left:50%;bottom:calc(1.2% + 8.2em);transform:translateX(-50%);font-size:1.05em;white-space:nowrap;${OL('#222')};opacity:0;transition:opacity .3s}
${G} .act.on{opacity:1}
${G} .hurt{position:absolute;inset:0;background:radial-gradient(circle,transparent 50%,rgba(255,0,0,.45));opacity:0;transition:opacity .4s}
${G} .vig{position:absolute;inset:0;background:radial-gradient(circle,transparent 60%,rgba(0,0,0,.35))}
${G} .gens{position:absolute;inset:0;pointer-events:none}
${G} .gens div{position:absolute;left:0;top:0;transform:translate(-50%,-100%);text-align:center;font-size:.9em;white-space:nowrap;${OL('#111')}}
${G} .scr{position:absolute;inset:0;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-size:clamp(9px,1.6cqw,16px)}
${G} .scr.dim{background:rgba(10,10,20,.55)}
${G} .pan{position:relative;width:min(94%,46em);max-height:94%;overflow:auto;padding:1.1em 1.3em;background:#c6c6c6;color:#2b2b2b;border:.25em solid #000;box-shadow:inset .2em .2em 0 #fff,inset -.2em -.2em 0 #555;box-sizing:border-box;scrollbar-width:thin}
${G} .pan h2{margin:0 0 .5em;font-size:1.6em;color:#3a3a3a}
${G} .pan h3{margin:.8em 0 .35em;font-size:.95em;color:#555}
${G} .pan p{margin:.3em 0;line-height:1.35}
${G} .btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:.45em 1.2em;border:.2em solid #000;background:#8b8b8b;color:#fff;font:inherit;font-size:1.05em;cursor:pointer;box-shadow:inset .18em .18em 0 #c6c6c6,inset -.18em -.18em 0 #555;${OL('#3a3a3a')}}
${G} .btn:hover,${G} .btn:focus-visible{background:#7f9bff;outline:none}
${G} .btn.go{background:#4caf50}${G} .btn.go:hover{background:#5cd160}
${G} .btns{display:flex;flex-wrap:wrap;gap:.5em;margin-top:.9em}
${G} .opts{display:flex;flex-wrap:wrap;gap:.3em}
${G} .opt{min-height:34px;padding:.3em .8em;border:.15em solid #000;background:#8b8b8b;color:#fff;font:inherit;cursor:pointer;box-shadow:inset .14em .14em 0 #c6c6c6,inset -.14em -.14em 0 #555}
${G} .opt.on{background:#3f8cff}
${G} .optrow{display:flex;align-items:center;justify-content:space-between;gap:.8em;margin:.4em 0;flex-wrap:wrap}
${G} .optrow input[type=range]{width:min(14em,60%)}
${G} .title{position:absolute;left:0;right:0;top:6%;text-align:center;font-size:4.6em;line-height:1;color:#ffd23f;${OL('#5a3a00')};pointer-events:none}
${G} .title small{display:block;font-size:.28em;color:#fff;margin-top:.5em;${OL('#222')}}
${G} .home{position:absolute;left:50%;bottom:5%;transform:translateX(-50%);width:min(94%,40em)}
${G} .home .pan{width:100%}
${G} .stats{position:absolute;left:2%;top:3%;display:flex;flex-direction:column;gap:.2em;font-size:.95em;${OL('#222')};pointer-events:none}
${G} .heroes{display:flex;gap:.35em;flex-wrap:wrap}
${G} .hero{width:2.4em;height:2.4em;min-width:34px;min-height:34px;border:.18em solid #000;cursor:pointer;padding:0;image-rendering:pixelated;background-size:100% 100%}
${G} .hero.on{outline:.2em solid #fff;box-shadow:0 0 0 .35em #3f8cff}
${G} .shop{width:min(96%,52em)}
${G} .tabs{display:flex;flex-wrap:wrap;gap:.25em;margin-bottom:.6em}
${G} .tab{padding:.35em .7em;border:.15em solid #000;background:#8b8b8b;color:#fff;font:inherit;cursor:pointer;min-height:34px}
${G} .tab.on{background:#555}
${G} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.4em,1fr));gap:.4em}
${G} .it{position:relative;display:flex;flex-direction:column;align-items:center;gap:.15em;padding:.45em .3em;border:.15em solid #373737;background:#8b8b8b;color:#fff;font:inherit;cursor:pointer;min-height:44px;text-align:center}
${G} .it canvas{width:2.6em;height:2.6em;image-rendering:pixelated}
${G} .it b{font-size:.85em;line-height:1.15}
${G} .it span{font-size:.8em}
${G} .it.no{filter:grayscale(.6) brightness(.8)}
${G} .it.no span{color:#ff8a8a}
${G} .it.own{background:#4c7a4c}
${G} .it small{font-size:.7em;opacity:.85}
${G} .it:hover{background:#9ea6ff}
${G} .rr{display:flex;gap:1em;flex-wrap:wrap;margin:.4em 0;font-size:.95em}
${G} .rr span{display:flex;align-items:center;gap:.3em}
${G} .rr canvas{width:1.4em;height:1.4em;image-rendering:pixelated}
${G} .keys{display:grid;grid-template-columns:auto 1fr;gap:.3em .9em;align-items:center;font-size:.92em}
${G} kbd,${G} .kk{font-style:normal;display:inline-block;min-width:1.2em;padding:.05em .3em;border:.12em solid #000;background:#eee;color:#222;font:inherit;text-align:center}
${G} .pz{position:absolute;left:.8%;top:1.2%;pointer-events:auto;width:2.6em;height:2.6em;min-width:40px;min-height:40px;border:.15em solid #000;background:rgba(80,80,80,.7);color:#fff;cursor:pointer;display:grid;place-items:center}
${G} .pz i{display:block;width:.8em;height:.9em;border-left:.26em solid #fff;border-right:.26em solid #fff;box-sizing:border-box}
${G} .shopb{position:absolute;left:50%;top:62%;transform:translateX(-50%);pointer-events:auto;padding:.4em 1em;border:.15em solid #000;background:rgba(60,140,60,.85);color:#fff;font:inherit;cursor:pointer;min-height:40px}
${G} .tc{position:absolute;inset:0;pointer-events:none}
${G} .joy{position:absolute;width:116px;height:116px;margin:-58px 0 0 -58px;border-radius:50%;background:rgba(255,255,255,.15);box-shadow:inset 0 0 0 3px rgba(255,255,255,.45);opacity:0}
${G} .joy.on{opacity:1}${G} .joy.idle{left:88px;top:calc(100% - 150px);opacity:.4}
${G} .joy i{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px 0 0 -25px;border-radius:50%;background:rgba(255,255,255,.8)}
${G} .tb{position:absolute;pointer-events:auto;width:50px;height:50px;border:.15em solid rgba(0,0,0,.7);background:rgba(60,60,60,.55);color:#fff;font:inherit;font-size:11px;touch-action:none;cursor:pointer}
${G} .tb.on{background:rgba(255,210,63,.7)}
${G} .tb.big{width:62px;height:62px;font-size:12px}
${G} .stage.touch .hb{bottom:1%}
${G} .stage.touch .hs{width:2.7em;height:2.7em}
${G} .stage.touch .sb{top:2%;transform:none;font-size:.78em;min-width:10em}
${G} .stage.touch .resb{left:auto;right:.8%;bottom:auto;top:calc(2% + 11em)}
${G} .net{position:absolute;left:calc(.8% + 3.2em);top:1.2%;padding:.25em .6em;background:rgba(0,0,0,.45);font-size:.8em}
${G} .net.bad{background:rgba(180,30,30,.8)}
${G} .wait{display:flex;align-items:center;gap:.6em;justify-content:center;font-size:1.1em}
${G} .wait i{width:1em;height:1em;border:.2em solid #888;border-top-color:#222;animation:br-spin .8s steps(8) infinite}
@keyframes br-spin{to{transform:rotate(1turn)}}
@container (max-width:620px){
${G} .title{font-size:2.6em;top:3%}
${G} .home{bottom:2%}
${G} .stats{display:none}
${G} .ttl b{font-size:2.6em}
${G} .stat{width:24em}${G} .hearts,${G} .armr{width:11.5em}${G} .hearts i,${G} .armr i{width:1.1em;height:1em}
}
`;

  function makeAudio(api) {
    let ctx = null, out = null, noiseB = null;
    const ensure = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.5; out.connect(ctx.destination); noiseB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } catch (e) { ctx = null; }
      return ctx;
    };
    const node = (g, pan) => { if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); return p; } return g; };
    const tone = (f0, f1, dur, type, vol, when = 0, pan = 0) => {
      const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); node(g, pan).connect(out); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (dur, vol, f, q = 1, when = 0, type = 'bandpass', f1 = 0, pan = 0) => {
      const t = ctx.currentTime + when, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseB; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(g); node(g, pan).connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
    };
    const S = {
      place: (v, p) => { noise(0.09, 0.4 * v, 500, 0.8, 0, 'lowpass', 150, p); tone(180, 120, 0.06, 'triangle', 0.12 * v, 0, p); },
      dig: (v, p) => noise(0.05, 0.25 * v, 800 + Math.random() * 400, 1, 0, 'bandpass', 0, p),
      wool: (v, p) => noise(0.12, 0.35 * v, 900, 0.6, 0, 'lowpass', 300, p),
      brk: (v, p) => { noise(0.18, 0.5 * v, 600, 0.7, 0, 'lowpass', 120, p); noise(0.08, 0.25 * v, 1800, 1, 0.02, 'bandpass', 0, p); },
      glass: (v, p) => { tone(2400, 1800, 0.18, 'triangle', 0.08 * v, 0, p); noise(0.2, 0.3 * v, 5000, 1, 0, 'highpass', 0, p); },
      hit: (v, p) => { noise(0.08, 0.5 * v, 900, 0.8, 0, 'lowpass', 300, p); tone(220, 140, 0.08, 'square', 0.08 * v, 0, p); },
      crit: (v, p) => { noise(0.1, 0.5 * v, 2500, 1.2, 0, 'bandpass', 900, p); tone(500, 300, 0.1, 'square', 0.08 * v, 0, p); },
      hurt: () => { tone(260, 180, 0.12, 'square', 0.1); tone(190, 120, 0.15, 'sawtooth', 0.06, 0.04); },
      swing: (v, p) => noise(0.08, 0.12 * v, 1500, 0.7, 0, 'bandpass', 600, p),
      step: (v, p) => noise(0.04, 0.07 * v, 450 + Math.random() * 300, 1, 0, 'bandpass', 0, p),
      jump: () => noise(0.05, 0.06, 600, 1),
      land: () => noise(0.08, 0.15, 300, 1, 0, 'lowpass'),
      pop: (v, p) => { tone(1100 + Math.random() * 300, 1600, 0.06, 'sine', 0.1 * v, 0, p); },
      bow: (v, p) => { noise(0.15, 0.3 * v, 1200, 1, 0, 'bandpass', 500, p); tone(400, 200, 0.12, 'triangle', 0.06 * v, 0, p); },
      arrowHit: (v, p) => noise(0.06, 0.3 * v, 1400, 1.5, 0, 'bandpass', 0, p),
      ding: () => { tone(1568, 1568, 0.2, 'sine', 0.1); tone(2093, 2093, 0.3, 'sine', 0.06, 0.05); },
      boom: (v, p) => { noise(1.2, 0.9 * v, 400, 0.5, 0, 'lowpass', 40, p); tone(70, 30, 0.8, 'sine', 0.35 * v, 0, p); },
      fuse: (v, p) => noise(0.4, 0.15 * v, 3000, 1, 0, 'highpass', 0, p),
      fire: (v, p) => { noise(0.4, 0.35 * v, 600, 0.6, 0, 'lowpass', 1600, p); },
      eat: () => { for (let i = 0; i < 4; i++) noise(0.07, 0.18, 1100 + Math.random() * 300, 1.2, i * 0.18); },
      burp: () => tone(140, 90, 0.25, 'sawtooth', 0.08),
      buy: () => { tone(988, 988, 0.08, 'square', 0.05); tone(1319, 1319, 0.14, 'square', 0.05, 0.08); },
      deny: () => tone(220, 180, 0.15, 'square', 0.05),
      bedBreak: () => { [880, 660, 440].forEach((f, i) => tone(f, f * 0.9, 0.25, 'sawtooth', 0.07, i * 0.15)); noise(0.6, 0.3, 500, 0.7, 0, 'lowpass', 100); },
      bedAlarm: () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 660 : 880, i % 2 ? 660 : 880, 0.18, 'square', 0.07, i * 0.2); },
      kill: () => { tone(784, 784, 0.1, 'square', 0.06); tone(1047, 1047, 0.2, 'square', 0.06, 0.1); },
      dead: () => { tone(300, 120, 0.6, 'sawtooth', 0.08); },
      tick: () => tone(1200, 1200, 0.05, 'square', 0.04),
      upgrade: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.07)); },
      win: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.25, 'square', 0.05, i * 0.11)); },
      lose: () => { [392, 370, 349, 262].forEach((f, i) => tone(f, f * 0.98, 0.3, 'sawtooth', 0.05, i * 0.22)); },
      tap: () => tone(700, 900, 0.05, 'sine', 0.05),
      tele: () => { tone(300, 1200, 0.3, 'sine', 0.08); noise(0.3, 0.2, 2000, 1, 0, 'bandpass', 600); }
    };
    return {
      play(n, v = 1, p = 0) { if (api.muted || v < 0.02) return; const c = ensure(); if (!c) return; if (c.state !== 'running') c.resume().catch(() => {}); try { S[n](Math.min(1, v), clamp(p, -1, 1)); } catch (e) {} },
      wake() { if (api.muted) return; const c = ensure(); if (c && c.state !== 'running') c.resume().catch(() => {}); },
      close() { if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
  }

  const IDX = (x, y, z) => (y * WZ + z) * WX + x;
  const SLOTS = [[80, 48, -1, 0], [16, 48, 1, 0], [48, 80, 0, -1], [48, 16, 0, 1]];
  const wool = t => 11 + t, clayOf = t => 16 + t;
  const isWool = id => id >= 11 && id <= 15, isClay = id => id >= 16 && id <= 19, isBed = id => id >= 28 && id <= 35;
  const HAND_D = { sword: 0, kb: 1, pick: [0, 2, 4, 2, 5], axe: [0, 3, 4, 5, 6] };
  function makeSim(cfg) {
    const nT = clamp(cfg.teams | 0, 2, 4);
    const S = {
      t: 0, phase: 'count', pt: 4, nT, vox: new Uint8Array(WX * WY * WZ), plc: new Uint8Array(WX * WY * WZ), pl: [], teams: [], gens: [], npcs: [], ents: [], winner: -1, over: false,
      evq: [], evc: 0, quiet: !!cfg.quiet, nextEv: 0, evName: '', evT: 0, dTier: 0, eTier: 0, sudden: false, dirty: [], client: false, heads: []
    };
    const EVN = 1024, DUMMY = { k: '' };
    for (let i = 0; i < EVN; i++) S.evq.push({ k: '', a: 0, b: 0, x: 0, y: 0, z: 0, v: 0, n: 0, s: '' });
    const emit = k => { if (S.quiet || S.evc >= EVN) return DUMMY; const e = S.evq[S.evc++]; e.k = k; e.n = 0; e.s = ''; return e; };
    S.emit = emit;
    const V = S.vox, PL = S.plc;
    const get = (x, y, z) => (x < 0 || x >= WX || z < 0 || z >= WZ || y < 0 || y >= WY) ? 0 : V[IDX(x, y, z)];
    S.get = get;
    const solidAt = (x, y, z) => { const b = get(x, y, z); return b !== 0 && BD[b].solid; };
    S.solidAt = solidAt;
    function setB(x, y, z, id, placed) {
      if (x < 0 || x >= WX || z < 0 || z >= WZ || y < 0 || y >= WY) return;
      const i = IDX(x, y, z); V[i] = id; PL[i] = placed ? 1 : 0;
      if (!S.quiet) S.dirty.push(x, y, z);
      if (S.log && !S.quiet) { S.log.set(i, id | (placed ? 256 : 0)); S.netDirty.push(x, y, z); }
    }
    S.setB = setB;
    S.placed = (x, y, z) => (x < 0 || x >= WX || z < 0 || z >= WZ || y < 0 || y >= WY) ? 0 : PL[IDX(x, y, z)];

    function genMap() {
      const isl = (cx, cz, fx, fz, rad, cut, top, depth) => {
        const rx = -fz, rz = fx;
        for (let a = -rad; a <= rad; a++) for (let b = -rad; b <= rad; b++) {
          if (Math.abs(a) + Math.abs(b) > cut) continue;
          const x = cx + a * fx + b * rx, z = cz + a * fz + b * rz;
          for (let k = 0; k < depth; k++) {
            const r2 = cut - Math.max(0, k - 2) * 2, m = rad - Math.max(0, k - 3);
            if (Math.abs(a) + Math.abs(b) > r2 || Math.max(Math.abs(a), Math.abs(b)) > m) break;
            const y = top - k;
            setB(x, y, z, k === 0 ? B.GRASS : k < 3 ? B.DIRT : B.STONE, false);
          }
        }
      };
      const L = (cx, cz, fx, fz) => (a, b) => [cx + a * fx + b * -fz, cz + a * fz + b * fx];
      const tree = (x, y, z, h) => { for (let k = 0; k < h; k++) setB(x, y + k, z, B.LOG, false); for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = h - 2; dy <= h + 1; dy++) { const r = Math.abs(dx) + Math.abs(dz) + Math.max(0, dy - h + 1) * 2; if (r > 3 || (dx === 0 && dz === 0 && dy < h)) continue; if (!get(x + dx, y + dy, z + dz)) setB(x + dx, y + dy, z + dz, B.LEAVES, false); } };
      for (let t = 0; t < nT; t++) {
        const [cx, cz, fx, fz] = SLOTS[t], P = L(cx, cz, fx, fz);
        isl(cx, cz, fx, fz, 7, 11, BASE, 9);
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const [x, z] = P(a, b); setB(x, BASE, z, B.PLANKS, false); }
        for (let a = -6; a <= -4; a++) for (let b = -1; b <= 1; b++) { const [x, z] = P(a, b); setB(x, BASE, z, a === -5 && b === 0 ? B.IRONB : B.BRICKS, false); }
        for (const b of [-7, 7]) for (let a = -3; a <= 3; a++) { const [x, z] = P(a, b); if (get(x, BASE, z)) setB(x, BASE, z, B.BRICKS, false); }
        const [gx, gz] = P(-5, 0);
        S.gens.push({ type: 0, x: gx + 0.5, y: BASE + 1, z: gz + 0.5, team: t, t: 0.5, n: 0 }, { type: 1, x: gx + 0.5, y: BASE + 1, z: gz + 0.5, team: t, t: 4, n: 0 }, { type: 3, x: gx + 0.5, y: BASE + 1, z: gz + 0.5, team: t, t: 0, n: 0, forge: true });
        const [fx0, fz0] = P(3, 0), [hx0, hz0] = P(4, 0);
        setB(fx0, BASE + 1, fz0, 28 + t * 2, false); setB(hx0, BASE + 1, hz0, 29 + t * 2, false);
        const [sx, sz] = P(0, 0), [ix, iz] = P(0, -5), [ux, uz] = P(0, 5);
        const yawF = Math.atan2(-fx, -fz);
        S.teams.push({ i: t, bed: true, bedF: [fx0, BASE + 1, fz0], bedH: [hx0, BASE + 1, hz0], spawn: [sx + 0.5, BASE + 1, sz + 0.5], yaw: yawF, f: [fx, fz], up: { sharp: 0, prot: 0, haste: 0, forge: 0, heal: 0, trap: 0 }, center: [cx + 0.5, cz + 0.5], gen: [gx + 0.5, gz + 0.5], elim: false });
        S.npcs.push({ kind: 'shop', team: t, x: ix + 0.5, y: BASE + 1, z: iz + 0.5, yaw: 0 }, { kind: 'upg', team: t, x: ux + 0.5, y: BASE + 1, z: uz + 0.5, yaw: 0 });
        const n1 = S.npcs[S.npcs.length - 2], n2 = S.npcs[S.npcs.length - 1];
        n1.yaw = Math.atan2(-(sx - ix), -(sz - iz)); n2.yaw = Math.atan2(-(sx - ux), -(sz - uz));
        const [t1x, t1z] = P(-5, -5), [t2x, t2z] = P(-5, 5);
        tree(t1x, BASE + 1, t1z, 4); tree(t2x, BASE + 1, t2z, 5);
        for (const b of [-4, 4]) { const [x, z] = P(6, b); setB(x, BASE + 1, z, B.BRICKS, false); setB(x, BASE + 2, z, B.LANTERN, false); }
      }
      for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const cx = 48 + dx * 22, cz = 48 + dz * 22;
        isl(cx, cz, 1, 0, 3, 5, BASE, 6);
        setB(cx, BASE, cz, B.DIAB, false);
        for (const [a, b] of [[2, 2], [-2, -2]]) { if (get(cx + a, BASE, cz + b)) { setB(cx + a, BASE + 1, cz + b, B.COBBLE, false); } }
        S.gens.push({ type: 2, x: cx + 0.5, y: BASE + 1, z: cz + 0.5, team: -1, t: 15, n: 0 });
      }
      isl(48, 48, 1, 0, 6, 10, BASE + 1, 9);
      for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) setB(48 + a, BASE + 2, 48 + b, B.BRICKS, false);
      const em = nT > 2 ? [[2, 2], [-2, -2], [2, -2], [-2, 2]] : [[2, 0], [-2, 0]];
      for (const [a, b] of em) { setB(48 + a, BASE + 2, 48 + b, B.EMEB, false); S.gens.push({ type: 3, x: 48 + a + 0.5, y: BASE + 3, z: 48 + b + 0.5, team: -1, t: 30, n: 0 }); }
      for (const [a, b] of [[5, 0], [-5, 0], [0, 5], [0, -5]]) { for (let k = 2; k < 5; k++) setB(48 + a, BASE + k, 48 + b, k === 4 ? B.LANTERN : B.BRICKS, false); }
      tree(48 + 4, BASE + 2, 48 + 4, 5);
    }
    genMap();
    S.dirty.length = 0; S.log = new Map(); S.netDirty = [];

    function newPlayer(o, i) {
      return {
        i, name: o.name, team: o.team, hero: o.hero | 0, bot: o.bot == null ? -1 : o.bot, human: !!o.human, pid: o.pid || null, local: !!o.local, remote: false,
        x: 0, y: 0, z: 0, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, onG: false, sneak: false, sprint: false, hurtT: 0, invT: 0, kbT: 0,
        hp: 20, abs: 0, regenT: 0, alive: false, respT: 0, final: false, kills: 0, finals: 0, beds: 0, deaths: 0, lastAtk: -1, lastAtkT: -99,
        res: [0, 0, 0, 0], armor: 0, sword: 0, pick: 0, axe: 0, shears: false, hot: [null, null, null, null, null, null, null, null, null], sel: 0,
        mine: { x: -1, y: -1, z: -1, p: 0 }, eatT: 0, bowT: 0, useCD: 0, atkCD: 0, swingT: 0, slowT: 0, glowT: 0, fallY: 0, jumpCD: 0, spN: 0,
        inp: { mx: 0, mz: 0, jump: false, sneak: false, sprint: false, atk: false, use: false }, atkPrev: false, usePrev: false, ai: null
      };
    }
    cfg.players.forEach((o, i) => S.pl.push(newPlayer(o, i)));
    const teamOf = p => S.teams[p.team];
    function addItem(p, k, n) {
      const max = typeof k === 'number' || k === 'arrow' ? 64 : k === 'fire' || k === 'tnt' || k === 'gapple' || k === 'pearl' || k === 'egg' ? 16 : 1;
      let left = n;
      for (const s of p.hot) if (s && s.k === k && s.n < max) { const a = Math.min(max - s.n, left); s.n += a; left -= a; if (!left) return true; }
      while (left > 0) { const i = p.hot.indexOf(null); if (i < 0) return left < n; const a = Math.min(max, left); p.hot[i] = { k, n: a }; left -= a; }
      return true;
    }
    S.addItem = addItem;
    const hasRoom = (p, k) => p.hot.indexOf(null) >= 0 || p.hot.some(s => s && s.k === k && s.n < (typeof k === 'number' || k === 'arrow' ? 64 : 16));
    S.hasRoom = hasRoom;
    const putTool = (p, k) => { if (p.hot.some(s => s && s.k === k)) return true; const i = p.hot.indexOf(null); if (i < 0) return false; p.hot[i] = { k, n: 1 }; return true; };
    function takeItem(p, k, n) {
      const sel = p.hot[p.sel];
      if (sel && sel.k === k) { const a = Math.min(sel.n, n); sel.n -= a; n -= a; if (sel.n <= 0) p.hot[p.sel] = null; }
      for (let i = 0; i < 9 && n > 0; i++) { const s = p.hot[i]; if (!s || s.k !== k) continue; const a = Math.min(s.n, n); s.n -= a; n -= a; if (s.n <= 0) p.hot[i] = null; }
    }
    S.takeItem = takeItem;
    const count = (p, k) => { let n = 0; for (const s of p.hot) if (s && s.k === k) n += s.n; return n; };
    S.count = count;
    function loadout(p, fresh) {
      const old = p.hot;
      p.hot = [null, null, null, null, null, null, null, null, null];
      const at = k => { const i = old.findIndex(s => s && s.k === k); return i > 0 ? i : -1; };
      p.hot[0] = { k: 'sword', n: 1 };
      if (fresh) { p.pick = 0; p.axe = 0; p.shears = false; p.armor = 0; }
      else { if (p.pick > 1) p.pick--; if (p.axe > 1) p.axe--; }
      p.sword = 0;
      for (const k of ['pick', 'axe', 'shears']) { if (!(k === 'shears' ? p.shears : p[k])) continue; const i = at(k); if (i > 0 && !p.hot[i]) p.hot[i] = { k, n: 1 }; else putTool(p, k); }
      p.sel = 0;
    }
    function spawn(p, fresh) {
      const tm = teamOf(p), [sx, sy, sz] = tm.spawn;
      const off = S.pl.filter(q => q.team === p.team).indexOf(p);
      p.x = sx + (off ? 0.6 : 0); p.y = sy; p.z = sz; p.px = p.x; p.py = p.y; p.pz = p.z; p.vx = p.vy = p.vz = 0; p.yaw = tm.yaw; p.pitch = 0;
      p.hp = 20; p.abs = 0; p.alive = true; p.respT = 0; p.onG = true; p.fallY = p.y; p.hurtT = 0; p.invT = 1; p.eatT = 0; p.bowT = 0; p.mine.p = 0; p.slowT = 0; p.kbT = 0;
      loadout(p, fresh);
      p.spN++;
      const e = emit('spawn'); e.a = p.i;
    }
    S.spawn = spawn;
    S.start = () => { for (const p of S.pl) { p.res = [0, 0, 0, 0]; spawn(p, true); } S.phase = 'count'; S.pt = 4; };

    function aabbHit(minx, miny, minz, maxx, maxy, maxz) {
      const x0 = Math.floor(minx), x1 = Math.floor(maxx - 1e-7), y0 = Math.floor(miny), y1 = Math.floor(maxy - 1e-7), z0 = Math.floor(minz), z1 = Math.floor(maxz - 1e-7);
      for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
        const b = get(x, y, z); if (!b || !BD[b].solid) continue;
        if (y + BD[b].h > miny + 1e-6) return true;
      }
      return false;
    }
    S.aabbHit = aabbHit;
    function topUnder(minx, minz, maxx, maxz, y) {
      let best = -1e9;
      const x0 = Math.floor(minx), x1 = Math.floor(maxx - 1e-7), z0 = Math.floor(minz), z1 = Math.floor(maxz - 1e-7), yy = Math.floor(y + 0.6);
      for (let yc = yy; yc >= yy - 2; yc--) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { const b = get(x, yc, z); if (b && BD[b].solid) { const t = yc + BD[b].h; if (t <= y + 0.6 && t > best) best = t; } }
      return best;
    }
    function movePlayer(p, dt) {
      const inp = p.inp, hw = P_W / 2;
      const h = p.sneak ? P_HS : P_H;
      p.sneak = !!inp.sneak && p.alive;
      if (!p.sneak && h !== P_H && aabbHit(p.x - hw, p.y, p.z - hw, p.x + hw, p.y + P_H, p.z + hw)) p.sneak = true;
      let mx = inp.mx, mz = inp.mz; const m = Math.hypot(mx, mz); if (m > 1) { mx /= m; mz /= m; }
      if (p.eatT > 0 || p.bowT > 0) { mx *= 0.3; mz *= 0.3; }
      p.sprint = !!inp.sprint && mz > 0.5 && !p.sneak && p.eatT <= 0 && p.bowT <= 0 && p.hunger !== 0;
      const sp = (p.sneak ? SNEAK : p.sprint ? SPRINT : WALK) * (p.slowT > 0 ? 0.6 : 1) * (p.speedT > 0 ? 1.4 : 1);
      const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
      const wx = (fx * mz - fz * mx) * sp, wz = (fz * mz + fx * mx) * sp;
      const acc = (p.onG ? 60 : 9) * (p.kbT > 0 ? 0.25 : 1);
      const dvx = wx - p.vx, dvz = wz - p.vz, dl = Math.hypot(dvx, dvz), mv = acc * dt;
      if (dl > mv) { p.vx += dvx / dl * mv; p.vz += dvz / dl * mv; } else { p.vx = wx; p.vz = wz; }
      if (p.kbT > 0) p.kbT -= dt;
      if (inp.jump && p.onG && p.jumpCD <= 0) { p.vy = JUMP_V; p.onG = false; p.jumpCD = 0.08; if (p.sprint) { p.vx += fx * 1.4; p.vz += fz * 1.4; } const e = emit('jump'); e.a = p.i; }
      if (p.jumpCD > 0) p.jumpCD -= dt;
      p.vy -= GRAV * dt; if (p.vy < -60) p.vy = -60;
      const sneakEdge = p.sneak && p.onG;
      let nx = p.x + p.vx * dt;
      if (aabbHit(nx - hw, p.y, p.z - hw, nx + hw, p.y + h, p.z + hw)) {
        if (p.onG && !aabbHit(nx - hw, p.y + 0.6, p.z - hw, nx + hw, p.y + 0.6 + h, p.z + hw) && topUnder(nx - hw, p.z - hw, nx + hw, p.z + hw, p.y) - p.y <= 0.6) { p.x = nx; p.y = topUnder(nx - hw, p.z - hw, nx + hw, p.z + hw, p.y); }
        else { p.vx = 0; p.blockX = true; }
      } else if (sneakEdge && topUnder(nx - hw, p.z - hw, nx + hw, p.z + hw, p.y) < p.y - 0.6) p.vx = 0;
      else p.x = nx;
      let nz = p.z + p.vz * dt;
      if (aabbHit(p.x - hw, p.y, nz - hw, p.x + hw, p.y + h, nz + hw)) {
        if (p.onG && !aabbHit(p.x - hw, p.y + 0.6, nz - hw, p.x + hw, p.y + 0.6 + h, nz + hw) && topUnder(p.x - hw, nz - hw, p.x + hw, nz + hw, p.y) - p.y <= 0.6) { p.z = nz; p.y = topUnder(p.x - hw, nz - hw, p.x + hw, nz + hw, p.y); }
        else { p.vz = 0; p.blockZ = true; }
      } else if (sneakEdge && topUnder(p.x - hw, nz - hw, p.x + hw, nz + hw, p.y) < p.y - 0.6) p.vz = 0;
      else p.z = nz;
      const ny = p.y + p.vy * dt, wasG = p.onG;
      if (p.vy <= 0) {
        if (aabbHit(p.x - hw, ny, p.z - hw, p.x + hw, ny + h, p.z + hw)) {
          const top = topUnder(p.x - hw, p.z - hw, p.x + hw, p.z + hw, p.y);
          p.y = top > -1e8 && top <= p.y + 1e-3 ? top : p.y; if (!wasG) land(p); p.vy = 0; p.onG = true;
        } else { p.y = ny; if (wasG) p.fallY = Math.max(p.fallY, p.y); p.onG = false; }
      } else {
        if (aabbHit(p.x - hw, ny, p.z - hw, p.x + hw, ny + h, p.z + hw)) { p.vy = 0; } else p.y = ny;
        p.onG = false;
      }
      if (p.onG) { p.fallY = p.y; if (!p.inp.mx && !p.inp.mz) { p.vx *= Math.pow(0.0005, dt); p.vz *= Math.pow(0.0005, dt); } }
      if (p.y < -12) die(p, null, 'void');
      if (p.y > TOPY + 30) p.y = TOPY + 30;
    }
    function land(p) {
      const d = p.fallY - p.y;
      if (d > 3.5 && S.phase === 'play') hurt(p, Math.floor(d - 3), null, 'fall');
      if (d > 1.5) { const e = emit('land'); e.a = p.i; }
      p.fallY = p.y;
    }

    const RB = { hit: false, x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0, t: 0, id: 0 };
    S.RB = RB;
    function rayBlock(ox, oy, oz, dx, dy, dz, max) {
      RB.hit = false;
      let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
      const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
      const tdx = Math.abs(dx) > 1e-9 ? Math.abs(1 / dx) : 1e9, tdy = Math.abs(dy) > 1e-9 ? Math.abs(1 / dy) : 1e9, tdz = Math.abs(dz) > 1e-9 ? Math.abs(1 / dz) : 1e9;
      let tx = Math.abs(dx) > 1e-9 ? ((dx > 0 ? x + 1 - ox : ox - x)) * tdx : 1e9, ty = Math.abs(dy) > 1e-9 ? ((dy > 0 ? y + 1 - oy : oy - y)) * tdy : 1e9, tz = Math.abs(dz) > 1e-9 ? ((dz > 0 ? z + 1 - oz : oz - z)) * tdz : 1e9;
      let t = 0, nx = 0, ny = 0, nz = 0;
      for (let n = 0; n < 200 && t <= max; n++) {
        const b = get(x, y, z);
        if (b && BD[b].solid) {
          const h = BD[b].h;
          if (h >= 1) { RB.hit = true; RB.x = x; RB.y = y; RB.z = z; RB.nx = nx; RB.ny = ny; RB.nz = nz; RB.t = t; RB.id = b; return true; }
          const top = y + h;
          const py = oy + dy * t;
          if (py <= top) { RB.hit = true; RB.x = x; RB.y = y; RB.z = z; RB.nx = nx; RB.ny = ny; RB.nz = nz; RB.t = t; RB.id = b; return true; }
          if (dy < 0) { const tt = (top - oy) / dy, tn = Math.min(tx, ty, tz); if (tt <= tn && tt <= max) { RB.hit = true; RB.x = x; RB.y = y; RB.z = z; RB.nx = 0; RB.ny = 1; RB.nz = 0; RB.t = tt; RB.id = b; return true; } }
        }
        if (tx < ty && tx < tz) { t = tx; tx += tdx; x += sx; nx = -sx; ny = 0; nz = 0; }
        else if (ty < tz) { t = ty; ty += tdy; y += sy; nx = 0; ny = -sy; nz = 0; }
        else { t = tz; tz += tdz; z += sz; nx = 0; ny = 0; nz = -sz; }
      }
      return false;
    }
    S.rayBlock = rayBlock;
    function rayBox(ox, oy, oz, dx, dy, dz, x0, y0, z0, x1, y1, z1) {
      let tmin = 0, tmax = 1e9;
      for (let a = 0; a < 3; a++) {
        const o = a === 0 ? ox : a === 1 ? oy : oz, d = a === 0 ? dx : a === 1 ? dy : dz, lo = a === 0 ? x0 : a === 1 ? y0 : z0, hi = a === 0 ? x1 : a === 1 ? y1 : z1;
        if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return -1; continue; }
        let t1 = (lo - o) / d, t2 = (hi - o) / d; if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
        if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2; if (tmin > tmax) return -1;
      }
      return tmin;
    }
    S.rayBox = rayBox;
    const eyeY = p => p.y + (p.sneak ? EYES : EYE);
    S.eyeY = eyeY;
    const look = (p, o) => { const cp = Math.cos(p.pitch); o[0] = -Math.sin(p.yaw) * cp; o[1] = Math.sin(p.pitch); o[2] = -Math.cos(p.yaw) * cp; return o; };
    const LD = [0, 0, 0];
    S.lookDir = p => look(p, LD);
    function rayPlayers(src, ox, oy, oz, dx, dy, dz, max) {
      let best = max, hit = null;
      for (const q of S.pl) { if (q === src || !q.alive) continue; const hw = 0.33, h = q.sneak ? P_HS : P_H; const t = rayBox(ox, oy, oz, dx, dy, dz, q.x - hw, q.y, q.z - hw, q.x + hw, q.y + h + 0.1, q.z + hw); if (t >= 0 && t < best) { best = t; hit = q; } }
      return hit ? (S.rpT = best, hit) : null;
    }
    S.rayPlayers = rayPlayers;
    S.los = (ax, ay, az, bx, by, bz) => { const dx = bx - ax, dy = by - ay, dz = bz - az, d = Math.hypot(dx, dy, dz); if (d < 0.01) return true; return !rayBlock(ax, ay, az, dx / d, dy / d, dz / d, d - 0.05); };

    function breakable(p, x, y, z) {
      const b = get(x, y, z); if (!b) return false;
      if (isBed(b)) return BD[b].bed !== p.team;
      return !!S.placed(x, y, z);
    }
    S.breakable = breakable;
    function breakTime(p, b) {
      const D = BD[b]; if (D.hard < 0) return 1e9;
      let sp = 1;
      if (D.tool === 'shears' && p.shears) sp = 5;
      else if (D.tool === 'pick' && p.pick) { const T0 = PICKS[p.pick]; sp = T0.s + T0.e * T0.e + 1; }
      else if (D.tool === 'axe' && p.axe) { const T0 = AXES[p.axe]; sp = T0.s + T0.e * T0.e + 1; }
      const ok = sp > 1 || D.tool === 'any' || D.tool === 'shears' || isBed(b);
      let t = D.hard * (ok ? 1.5 : 5) / sp;
      if (isWool(b) && !p.shears) t = D.hard * 1.5;
      t /= 1 + 0.2 * teamOf(p).up.haste;
      if (!p.onG) t *= 5;
      return Math.max(0.05, t);
    }
    S.breakTime = breakTime;
    function breakBlock(p, x, y, z) {
      const b = get(x, y, z);
      if (!b || !breakable(p, x, y, z)) return false;
      if (isBed(b)) { destroyBed(BD[b].bed, p); return true; }
      setB(x, y, z, 0, false);
      const e = emit('brk'); e.a = p ? p.i : -1; e.x = x; e.y = y; e.z = z; e.v = b;
      return true;
    }
    S.breakBlock = breakBlock;
    function destroyBed(t, by) {
      const tm = S.teams[t]; if (!tm.bed) return;
      tm.bed = false;
      for (const c of [tm.bedF, tm.bedH]) setB(c[0], c[1], c[2], 0, false);
      if (by) by.beds++;
      const e = emit('bed'); e.a = t; e.b = by ? by.i : -1; e.x = tm.bedF[0]; e.y = tm.bedF[1]; e.z = tm.bedF[2];
      checkWin();
    }
    S.destroyBed = destroyBed;
    function canPlaceAt(p, x, y, z) {
      if (x < 1 || x >= WX - 1 || z < 1 || z >= WZ - 1 || y < 1 || y > TOPY) return false;
      if (get(x, y, z)) return false;
      if (!(solidAt(x + 1, y, z) || solidAt(x - 1, y, z) || solidAt(x, y + 1, z) || solidAt(x, y - 1, z) || solidAt(x, y, z + 1) || solidAt(x, y, z - 1))) return false;
      const ex = p.x, ey = eyeY(p), ez = p.z;
      const cx = clamp(ex, x, x + 1), cy = clamp(ey, y, y + 1), cz = clamp(ez, z, z + 1);
      if (Math.hypot(cx - ex, cy - ey, cz - ez) > REACH + 0.3) return false;
      for (const q of S.pl) { if (!q.alive) continue; const hw = 0.3, h = q.sneak ? P_HS : P_H; if (q.x + hw > x && q.x - hw < x + 1 && q.z + hw > z && q.z - hw < z + 1 && q.y + h > y && q.y < y + 1) return false; }
      for (const n of S.npcs) if (Math.floor(n.x) === x && Math.floor(n.z) === z && (y === n.y || y === n.y + 1)) return false;
      for (const g of S.gens) if (g.team < 0 && Math.abs(g.x - 0.5 - x) <= 0 && Math.abs(g.z - 0.5 - z) <= 0 && y >= g.y && y <= g.y + 1) return false;
      return true;
    }
    S.canPlaceAt = canPlaceAt;
    function placeBlock(p, x, y, z, id) {
      if (!p.alive || S.phase !== 'play') return false;
      if (count(p, id) <= 0 || !canPlaceAt(p, x, y, z)) return false;
      takeItem(p, id, 1);
      setB(x, y, z, id, true);
      const e = emit('place'); e.a = p.i; e.x = x; e.y = y; e.z = z; e.v = id;
      return true;
    }
    S.placeBlock = placeBlock;

    function armorRed(q) {
      const pts = ARMOR[q.armor].p, prot = teamOf(q).up.prot;
      return 1 - (1 - pts * 0.04) * (1 - Math.min(0.8, prot * 0.16));
    }
    function hurt(q, amt, by, why, kbx, kbz, kby) {
      if (!q.alive || amt <= 0 || S.phase !== 'play') return false;
      if (q.invT > 0 && why !== 'void' && why !== 'wither') return false;
      let d = why === 'fall' || why === 'void' || why === 'wither' ? amt : amt * (1 - armorRed(q));
      if (q.abs > 0) { const a = Math.min(q.abs, d); q.abs -= a; d -= a; }
      q.hp -= d;
      q.invT = why === 'fall' || why === 'wither' ? 0 : 0.5; q.hurtT = 0.4; q.eatT = 0;
      if (by && by !== q) { q.lastAtk = by.i; q.lastAtkT = S.t; }
      if (kbx != null) { q.vx = kbx; q.vz = kbz; q.vy = Math.max(q.vy * 0.4, kby); q.onG = false; q.kbT = 0.35; }
      const e = emit('hurt'); e.a = by ? by.i : -1; e.b = q.i; e.v = amt; e.s = why || '';
      if (q.hp <= 0.001) die(q, by, why);
      return true;
    }
    S.hurt = hurt;
    function die(q, by, why) {
      if (!q.alive) return;
      q.alive = false; q.deaths++; q.hp = 0;
      let killer = by && by !== q ? by : (q.lastAtk >= 0 && S.t - q.lastAtkT < 10 ? S.pl[q.lastAtk] : null);
      if (killer && killer.team === q.team) killer = null;
      const tm = teamOf(q), fin = !tm.bed;
      if (killer) { killer.kills++; if (fin) killer.finals++; if (why !== 'void' || true) for (let r = 0; r < 4; r++) { killer.res[r] += q.res[r]; } if (q.res.some(v => v > 0)) { const e1 = emit('loot'); e1.a = killer.i; e1.b = q.i; } }
      q.res = [0, 0, 0, 0];
      q.final = fin; q.respT = fin ? 0 : 5;
      q.mine.p = 0; q.eatT = 0; q.bowT = 0;
      const e = emit('death'); e.a = killer ? killer.i : -1; e.b = q.i; e.s = why || ''; e.n = fin ? 1 : 0;
      checkWin();
    }
    S.die = die;
    function teamAlive(tm) { return S.pl.some(p => p.team === tm.i && (p.alive || (!p.final && (tm.bed || p.respT > 0)) && !p.gone)); }
    function checkWin() {
      if (S.over) return;
      const alive = S.teams.filter(tm => { const a = teamAlive(tm); if (!a && !tm.elim) { tm.elim = true; const e = emit('elim'); e.a = tm.i; } return a; });
      if (alive.length <= 1) { S.over = true; S.phase = 'over'; S.winner = alive.length ? alive[0].i : -1; const e = emit('over'); e.a = S.winner; }
    }
    S.checkWin = checkWin;
    function meleeDmg(p, slot) {
      const k = slot ? slot.k : null;
      let d = 1;
      if (k === 'sword') d = SWORDS[p.sword].d + (teamOf(p).up.sharp ? 1.25 : 0);
      else if (k === 'pick') d = HAND_D.pick[p.pick];
      else if (k === 'axe') d = HAND_D.axe[p.axe];
      return d;
    }
    function attack(p, q, extra) {
      if (!p.alive || !q.alive || q.team === p.team || S.phase !== 'play') return false;
      const ex = p.x, ey = eyeY(p), ez = p.z, hw = 0.3, h = q.sneak ? P_HS : P_H;
      const cx = clamp(ex, q.x - hw, q.x + hw), cy = clamp(ey, q.y, q.y + h), cz = clamp(ez, q.z - hw, q.z + hw);
      if (Math.hypot(cx - ex, cy - ey, cz - ez) > HIT + 0.25 + (extra || 0)) return false;
      if (!S.los(ex, ey, ez, cx, cy, cz)) return false;
      const slot = p.hot[p.sel];
      let d = meleeDmg(p, slot);
      const crit = !p.onG && p.vy < -0.5;
      if (crit) d *= 1.5;
      const dx = q.x - p.x, dz = q.z - p.z, dl = Math.hypot(dx, dz) || 1;
      let kb = 6.2 + (p.sprint ? 3.6 : 0), ky = 5.6;
      if (slot && slot.k === 'kb') { kb += 9; ky += 1.5; }
      const ok = hurt(q, d, p, 'melee', dx / dl * kb, dz / dl * kb, ky);
      if (ok) { p.sprint = false; p.sprintCut = 0.12; const e = emit('hit'); e.a = p.i; e.b = q.i; e.n = crit ? 1 : 0; }
      return ok;
    }
    S.attack = attack;
    function explode(x, y, z, r, power, by, level) {
      const e = emit('boom'); e.x = x; e.y = y; e.z = z; e.v = r;
      const ri = Math.ceil(r);
      for (let dy = -ri; dy <= ri; dy++) for (let dz = -ri; dz <= ri; dz++) for (let dx = -ri; dx <= ri; dx++) {
        if (dx * dx + dy * dy + dz * dz > r * r) continue;
        const bx = Math.floor(x) + dx, by2 = Math.floor(y) + dy, bz = Math.floor(z) + dz, b = get(bx, by2, bz);
        if (!b || !S.placed(bx, by2, bz)) continue;
        if (BD[b].blast <= level) { setB(bx, by2, bz, 0, false); const e2 = emit('brk'); e2.a = -2; e2.x = bx; e2.y = by2; e2.z = bz; e2.v = b; }
      }
      for (const q of S.pl) {
        if (!q.alive) continue;
        const dx = q.x - x, dy = q.y + 0.9 - y, dz = q.z - z, d = Math.hypot(dx, dy, dz);
        if (d > r * 1.6) continue;
        const f = 1 - d / (r * 1.6), dl = Math.hypot(dx, dz) || 1;
        const kb = power * f;
        q.invT = 0;
        if (q === by) { q.vx += dx / dl * kb * 0.9; q.vz += dz / dl * kb * 0.9; q.vy = Math.max(q.vy, kb * 0.75); q.onG = false; q.kbT = 0.3; hurt(q, level === 1 ? 4 * f : 1.5 * f, null, 'blast'); }
        else hurt(q, (level === 1 ? 9 : 4) * f, by, 'blast', dx / dl * kb, dz / dl * kb, kb * 0.6);
      }
    }
    function throwEnt(p, type, speed, grav) {
      const d = look(p, [0, 0, 0]);
      const en = { type, x: p.x + d[0] * 0.5, y: eyeY(p) - 0.1 + d[1] * 0.5, z: p.z + d[2] * 0.5, vx: d[0] * speed, vy: d[1] * speed, vz: d[2] * speed, g: grav, o: p.i, t: 0, id: ++S.entId, team: p.team };
      S.ents.push(en);
      const e = emit('throw'); e.a = p.i; e.s = type;
      return en;
    }
    S.entId = 0;
    function useItem(p, slot) {
      if (!slot || p.useCD > 0) return;
      const k = slot.k;
      if (k === 'fire') { takeItem(p, 'fire', 1); throwEnt(p, 'fire', 16, 0); p.useCD = 0.5; }
      else if (k === 'pearl') { takeItem(p, 'pearl', 1); throwEnt(p, 'pearl', 24, 14); p.useCD = 0.6; }
      else if (k === 'egg') { takeItem(p, 'egg', 1); const en = throwEnt(p, 'egg', 15, 1.2); en.lx = -9; en.lz = -9; p.useCD = 0.6; }
    }
    S.useItem = useItem;
    function placeTnt(p, x, y, z) {
      if (count(p, 'tnt') <= 0 || !canPlaceAt(p, x, y, z)) return false;
      takeItem(p, 'tnt', 1);
      S.ents.push({ type: 'tnt', x: x + 0.5, y, z: z + 0.5, vx: 0, vy: 0, vz: 0, g: 0, o: p.i, t: 0, fuse: 2.6, id: ++S.entId, team: p.team });
      const e = emit('fuse'); e.x = x + 0.5; e.y = y; e.z = z + 0.5;
      return true;
    }
    S.placeTnt = placeTnt;
    function entStep(dt) {
      for (let i = S.ents.length - 1; i >= 0; i--) {
        const en = S.ents[i]; en.t += dt;
        if (en.type === 'tnt') { en.fuse -= dt; if (en.fuse <= 0) { S.ents.splice(i, 1); explode(en.x, en.y + 0.5, en.z, 3.4, 13, S.pl[en.o], 1); } continue; }
        en.vy -= en.g * dt;
        const sp = Math.hypot(en.vx, en.vy, en.vz) || 1, step = sp * dt;
        const nx = en.vx / sp, ny = en.vy / sp, nz = en.vz / sp;
        let hitP = null, tB = 1e9;
        if (rayBlock(en.x, en.y, en.z, nx, ny, nz, step)) tB = RB.t;
        const src = S.pl[en.o];
        const q = rayPlayers(en.t < 0.15 ? src : null, en.x, en.y, en.z, nx, ny, nz, Math.min(step, tB));
        if (q && (q !== src || en.t > 0.15)) hitP = q;
        if (hitP || tB < 1e9 || en.t > 6 || en.y < -20) {
          const tt = hitP ? S.rpT : tB < 1e9 ? tB : 0;
          const hx = en.x + nx * tt, hy = en.y + ny * tt, hz = en.z + nz * tt;
          S.ents.splice(i, 1);
          if (en.type === 'arrow') {
            if (hitP && hitP.team !== en.team) { const d = Math.max(1, Math.round(en.dmg)); const kl = Math.hypot(en.vx, en.vz) || 1; hurt(hitP, d, src, 'arrow', en.vx / kl * 3.5, en.vz / kl * 3.5, 3); if (src) { const e = emit('ahit'); e.a = src.i; e.b = hitP.i; } }
            else { const e = emit('aland'); e.x = hx; e.y = hy; e.z = hz; }
          } else if (en.type === 'fire') explode(hx - nx * 0.3, hy - ny * 0.3, hz - nz * 0.3, 2.4, 16, src, 0);
          else if (en.type === 'pearl') { if (src && src.alive && en.t < 6 && en.y > -20) { const ty = tB < 1e9 && RB.ny > 0 ? RB.y + 1 : hy; src.x = hx - nx * 0.4; src.y = ty; src.z = hz - nz * 0.4; src.vx = src.vy = src.vz = 0; src.fallY = src.y; hurt(src, 2.5, null, 'fall'); const e = emit('tele'); e.a = src.i; } }
          continue;
        }
        en.x += en.vx * dt; en.y += en.vy * dt; en.z += en.vz * dt;
        if (en.type === 'egg') {
          const bx = Math.floor(en.x), by2 = Math.floor(en.y) - 2, bz = Math.floor(en.z);
          if ((bx !== en.lx || bz !== en.lz) && en.t > 0.12 && en.t < 1.5) {
            en.lx = bx; en.lz = bz;
            if (by2 > 1 && by2 < TOPY && !get(bx, by2, bz)) { setB(bx, by2, bz, wool(en.team), true); const e = emit('place'); e.a = -1; e.x = bx; e.y = by2; e.z = bz; e.v = wool(en.team); }
          }
        }
      }
    }
    function shootArrow(p, charge) {
      if (count(p, 'arrow') <= 0) return;
      takeItem(p, 'arrow', 1);
      const c = clamp(charge, 0.1, 1), en = throwEnt(p, 'arrow', 12 + 40 * c, 20);
      en.dmg = (1 + 8 * c * c) * (p.bow === 2 ? 1.25 : 1);
      const e = emit('bow'); e.a = p.i;
    }
    S.shootArrow = shootArrow;

    function buy(p, id) {
      const tm = teamOf(p);
      const near = S.npcs.some(n => n.team === p.team && Math.hypot(n.x - p.x, n.z - p.z) < 5.5 && Math.abs(n.y - p.y) < 3);
      if (!p.alive || !near || S.phase !== 'play') return 'far';
      let cost = null, give = null;
      const u = UPG.find(x => x.id === id);
      if (u) {
        const lv = tm.up[id]; if (lv >= u.max) return 'max';
        cost = [2, u.c[lv]];
        if (p.res[2] < cost[1]) return 'poor';
        p.res[2] -= cost[1]; tm.up[id] = lv + 1;
        const e = emit('upg'); e.a = p.i; e.b = p.team; e.s = id; e.v = lv + 1;
        return 'ok';
      }
      let it = null; for (const c of SHOP) for (const x of c.items) if (x.id === id) it = x;
      if (!it) return 'bad';
      if (id === 'pick') { if (p.pick >= 4) return 'max'; cost = PICK_COST[p.pick + 1]; }
      else if (id === 'axe') { if (p.axe >= 4) return 'max'; cost = AXE_COST[p.axe + 1]; }
      else cost = it.c;
      const [ci, cn] = cost;
      if (p.res[ci] < cn) return 'poor';
      if (/^sw[123]$/.test(id)) { const tier = +id[2]; if (p.sword >= tier) return 'own'; give = () => { p.sword = tier; }; }
      else if (/^ar[123]$/.test(id)) { const tier = +id[2]; if (p.armor >= tier) return 'own'; give = () => { p.armor = tier; }; }
      else if (id === 'pick') { give = () => { if (!putTool(p, 'pick')) return false; p.pick++; }; }
      else if (id === 'axe') { give = () => { if (!putTool(p, 'axe')) return false; p.axe++; }; }
      else if (id === 'shears') { if (p.shears) return 'own'; give = () => { if (!putTool(p, 'shears')) return false; p.shears = true; }; }
      else if (id === 'bow' || id === 'bow2') { const tier = id === 'bow' ? 1 : 2; if (p.bow >= tier) return 'own'; give = () => { if (!putTool(p, 'bow')) return false; p.bow = tier; }; }
      else if (id === 'kb') { if (p.hot.some(s => s && s.k === 'kb')) return 'own'; give = () => putTool(p, 'kb'); }
      else if (it.b) { const bid = it.b === 11 ? wool(p.team) : it.b === 16 ? clayOf(p.team) : it.b; if (!hasRoom(p, bid)) return 'full'; give = () => addItem(p, bid, it.q); }
      else { const k = id; if (!hasRoom(p, k)) return 'full'; give = () => addItem(p, k, it.q || 1); }
      if (give() === false) return 'full';
      p.res[ci] -= cn;
      const e = emit('buy'); e.a = p.i; e.s = id;
      return 'ok';
    }
    S.buy = buy;

    function genStep(dt) {
      for (const g of S.gens) {
        let iv = 0, cap = 0;
        if (g.team >= 0) {
          const f = S.teams[g.team].up.forge, mul = [1, 1.5, 2, 2, 3][f];
          if (g.type === 0) { iv = 1.3 / mul; cap = 48; } else if (g.type === 1) { iv = 8 / mul; cap = 12; } else { if (f < 3) continue; iv = f === 4 ? 30 : 50; cap = 2; }
        } else if (g.type === 2) { iv = [30, 23, 12][S.dTier]; cap = 4; } else { iv = [65, 50, 35][S.eTier]; cap = 2; }
        g.iv = iv;
        g.t -= dt;
        if (g.t <= 0) { g.t += iv; if (g.n < cap) { g.n++; const e = emit('drop'); e.a = S.gens.indexOf(g); } }
        if (g.n > 0) {
          let taker = null, bd = 9;
          for (const p of S.pl) { if (!p.alive) continue; const d = Math.hypot(p.x - g.x, p.z - g.z); if (d < 1.4 && p.y > g.y - 1.2 && p.y < g.y + 2 && d < bd) { bd = d; taker = p; } }
          if (taker) {
            taker.res[g.type] += g.n;
            if (g.team >= 0) for (const q of S.pl) if (q !== taker && q.alive && q.team === taker.team && Math.hypot(q.x - g.x, q.z - g.z) < 3.2) q.res[g.type] += g.n;
            const e = emit('pick'); e.a = taker.i; e.b = g.type; e.v = g.n; g.n = 0;
          }
        }
      }
    }
    function timeline() {
      const ev = EVENTS[S.nextEv];
      if (!ev) return;
      S.evName = ev[2]; S.evT = ev[0] - S.gt;
      if (S.gt >= ev[0]) {
        S.nextEv++;
        if (ev[1] === 'dia2') S.dTier = 1; else if (ev[1] === 'dia3') S.dTier = 2; else if (ev[1] === 'eme2') S.eTier = 1; else if (ev[1] === 'eme3') S.eTier = 2;
        else if (ev[1] === 'beds') { for (const tm of S.teams) if (tm.bed) destroyBed(tm.i, null); }
        else if (ev[1] === 'sudden') S.sudden = true;
        else if (ev[1] === 'end') { const al = S.teams.map(tm => S.pl.filter(p => p.team === tm.i && p.alive).length); const mx = Math.max(...al); const w = al.filter(v => v === mx).length === 1 ? al.indexOf(mx) : -1; S.over = true; S.phase = 'over'; S.winner = w; const e2 = emit('over'); e2.a = w; }
        const e = emit('tl'); e.s = ev[1];
      }
    }
    S.gt = 0;
    S.step = () => {
      S.t += DT;
      if (!S.client) {
        if (S.phase === 'count') { S.pt -= DT; if (S.pt <= 0) { S.phase = 'play'; emit('go'); } }
        else if (S.phase === 'play') { S.gt += DT; timeline(); genStep(DT); entStep(DT); }
      } else if (S.phase === 'play') S.gt += DT;
      for (const p of S.pl) {
        p.px = p.x; p.py = p.y; p.pz = p.z;
        if (!p.alive) {
          if (!S.client && !p.final && p.respT > 0 && S.phase === 'play') { p.respT -= DT; if (p.respT <= 0) { if (teamOf(p).bed || true) spawn(p, false); } }
          continue;
        }
        if (p.invT > 0) p.invT -= DT;
        if (p.hurtT > 0) p.hurtT -= DT;
        if (p.useCD > 0) p.useCD -= DT;
        if (p.atkCD > 0) p.atkCD -= DT;
        if (p.slowT > 0) p.slowT -= DT;
        if (p.glowT > 0) p.glowT -= DT;
        if (p.swingT > 0) p.swingT -= DT;
        if (p.sprintCut > 0) { p.sprintCut -= DT; p.inp.sprint = false; }
        if (p.remote) { if (!S.client && p.y < -12) die(p, null, 'void'); continue; }
        if (S.phase === 'count') { p.inp.mx = p.inp.mz = 0; p.inp.jump = false; }
        movePlayer(p, DT);
        if (S.client && !p.local) continue;
        actStep(p);
        if (!S.client && S.phase === 'play') {
          const tm = teamOf(p);
          if (p.regen > 0) { p.regen -= DT; p.hp = Math.min(20, p.hp + DT * 2); }
          p.natT = (p.natT || 0) + DT; if (p.natT > 3.5) { p.natT = 0; if (p.hp < 20 && !S.sudden) p.hp = Math.min(20, p.hp + 1); if (S.sudden) hurt(p, 1, null, 'wither'); }
          if (tm.up.heal && Math.hypot(p.x - tm.center[0], p.z - tm.center[1]) < 10) { p.hp = Math.min(20, p.hp + DT * 0.5); }
          for (const t2 of S.teams) if (t2.i !== p.team && t2.up.trap && t2.bed && Math.hypot(p.x - t2.bedF[0], p.z - t2.bedF[2]) < 8 && Math.abs(p.y - t2.bedF[1]) < 6) { t2.up.trap = 0; p.slowT = 6; p.glowT = 10; const e = emit('trap'); e.a = p.i; e.b = t2.i; }
        }
      }
    };
    function actStep(p) {
      const inp = p.inp, slot = p.hot[p.sel];
      if (S.phase !== 'play') { p.atkPrev = inp.atk; p.usePrev = inp.use; return; }
      const d = look(p, LD), ex = p.x, ey = eyeY(p), ez = p.z;
      if (inp.atk) {
        if (!p.atkPrev || p.atkCD <= 0) {
          const q = rayPlayers(p, ex, ey, ez, d[0], d[1], d[2], HIT + 0.3);
          const bt = rayBlock(ex, ey, ez, d[0], d[1], d[2], REACH) ? RB.t : 1e9;
          if (q && S.rpT < bt) { if (!p.atkPrev || p.atkCD <= 0) { p.swingT = 0.25; p.atkCD = 1 / (p.cps || 12); if (S.client) { if (S.onClaim) S.onClaim(q); } else attack(p, q); p.mine.p = 0; } }
          else if (!p.atkPrev) { p.swingT = 0.25; const e = emit('swing'); e.a = p.i; }
        }
        if (rayBlock(ex, ey, ez, d[0], d[1], d[2], REACH) && breakable(p, RB.x, RB.y, RB.z)) {
          const m = p.mine;
          if (m.x !== RB.x || m.y !== RB.y || m.z !== RB.z) { m.x = RB.x; m.y = RB.y; m.z = RB.z; m.p = 0; m.t0 = S.t; }
          m.p += DT / breakTime(p, RB.id); p.swingT = 0.25;
          if (((S.t * 5) | 0) !== (((S.t - DT) * 5) | 0)) { const e = emit('dig'); e.a = p.i; e.x = m.x; e.y = m.y; e.z = m.z; }
          if (m.p >= 1) { m.p = 0; if (S.client) { if (S.onBreak) S.onBreak(m.x, m.y, m.z); } else breakBlock(p, m.x, m.y, m.z); }
        } else p.mine.p = 0;
      } else p.mine.p = 0;
      if (slot && slot.k === 'gapple' && inp.use) { p.eatT += DT; if (((p.eatT * 5) | 0) !== (((p.eatT - DT) * 5) | 0)) { const e = emit('eat'); e.a = p.i; } if (p.eatT >= 1.6) { p.eatT = 0; if (S.client) { if (S.onUse) S.onUse('gapple'); } else { takeItem(p, 'gapple', 1); p.regen = 5; p.abs = 4; const e = emit('ate'); e.a = p.i; } } }
      else p.eatT = 0;
      if (slot && slot.k === 'bow' && count(p, 'arrow') > 0) { if (inp.use) p.bowT += DT; else if (p.bowT > 0) { const c = Math.min(1, p.bowT); p.bowT = 0; if (S.client) { if (S.onUse) S.onUse('arrow', c); } else shootArrow(p, c); } }
      else p.bowT = 0;
      if (inp.use && !p.usePrev && slot) {
        if (typeof slot.k === 'number' || slot.k === 'tnt') {
          if (rayBlock(ex, ey, ez, d[0], d[1], d[2], REACH)) {
            const x = RB.x + RB.nx, y = RB.y + RB.ny, z = RB.z + RB.nz;
            if (slot.k === 'tnt') { if (S.client) { if (S.onPlace) S.onPlace(x, y, z, 'tnt'); } else placeTnt(p, x, y, z); }
            else if (S.client) { if (canPlaceAt(p, x, y, z) && S.onPlace) S.onPlace(x, y, z, slot.k); }
            else placeBlock(p, x, y, z, slot.k);
          }
        } else if (slot.k === 'fire' || slot.k === 'pearl' || slot.k === 'egg') { if (S.client) { if (S.onUse) S.onUse(slot.k); } else useItem(p, slot); }
      }
      if (inp.use && p.usePrev && slot && typeof slot.k === 'number' && p.placeRep !== undefined) {
        p.placeRep -= DT;
        if (p.placeRep <= 0 && rayBlock(ex, ey, ez, d[0], d[1], d[2], REACH)) { p.placeRep = 0.2; const x = RB.x + RB.nx, y = RB.y + RB.ny, z = RB.z + RB.nz; if (S.client) { if (canPlaceAt(p, x, y, z) && S.onPlace) S.onPlace(x, y, z, slot.k); } else placeBlock(p, x, y, z, slot.k); }
      } else p.placeRep = 0.25;
      p.atkPrev = inp.atk; p.usePrev = inp.use;
    }
    S.movePlayer = movePlayer;
    S.teamOf = teamOf;
    return S;
  }

  const AO = { yaw: 0, pitch: 0, d: 0 };
  const angTo = (ex, ey, ez, x, y, z, o) => { const dx = x - ex, dy = y - ey, dz = z - ez; o.yaw = Math.atan2(-dx, -dz); o.pitch = Math.atan2(dy, Math.hypot(dx, dz)); o.d = Math.hypot(dx, dy, dz); return o; };
  function botInit(p, S) {
    const mates = S.pl.filter(q => q.team === p.team);
    p.ai = {
      lv: LVL[clamp(p.bot, 0, 3)], plan: 'farm', think: Math.random() * 0.2, tgt: null, vis: false, reactT: 0, ay: p.yaw, ap: 0, ey: 0, ep: 0, ety: 0, etp: 0, errT: 0,
      strafe: 1, strafeT: 0, placeT: 0, stuckT: 0, lx: p.x, lz: p.z, detour: 0, detourT: 0, role: mates.indexOf(p) === 1 ? 'def' : 'rush', rushAt: 0, target: -1, buyT: 0, shopKind: '', jumpT: 0, lastBlockT: 0,
      wantMine: null, eat: false, goal: null, gx: 0, gy: 0, gz: 0, edge: 0, critT: 0, layer: 0, defT: 0, fireT: 0, path: 0, lastSeenX: 0, lastSeenZ: 0, lastHp: 20
    };
  }
  const blocksOf = (S, p) => { let n = 0; for (const s of p.hot) if (s && typeof s.k === 'number') n += s.n; return n; };
  function pickBlock(S, p, prefer) {
    let best = -1;
    for (let i = 0; i < p.hot.length; i++) { if (!p.hot[i]) continue; const k = p.hot[i].k; if (typeof k !== 'number') continue; if (prefer && prefer(k)) return i; if (best < 0 || isWool(k)) best = best < 0 || !isWool(p.hot[best].k) ? i : best; }
    return best;
  }
  function slotOf(p, k) { return p.hot.findIndex(s => s && s.k === k); }
  function bedCells(S, tm, layer) {
    const bed = [tm.bedF, tm.bedH], set = new Set(bed.map(c => c.join(','))), l1 = [], l2 = [];
    const N = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0]];
    for (const c of bed) for (const [a, b, d] of N) { const x = c[0] + a, y = c[1] + b, z = c[2] + d, k = x + ',' + y + ',' + z; if (set.has(k)) continue; set.add(k); l1.push([x, y, z]); }
    if (layer < 2) return l1;
    for (const c of l1) for (const [a, b, d] of N) { const x = c[0] + a, y = c[1] + b, z = c[2] + d, k = x + ',' + y + ',' + z; if (set.has(k)) continue; set.add(k); if (y >= BASE + 1) l2.push([x, y, z]); }
    if (layer < 3) return l1.concat(l2);
    const l3 = [];
    for (const c of l2) for (const [a, b, d] of N) { const x = c[0] + a, y = c[1] + b, z = c[2] + d, k = x + ',' + y + ',' + z; if (set.has(k)) continue; set.add(k); if (y >= BASE + 1) l3.push([x, y, z]); }
    return l1.concat(l2, l3);
  }
  function nearestEnemy(S, p, r) {
    let best = null, bd = r;
    for (const q of S.pl) { if (!q.alive || q.team === p.team) continue; const d = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z); if (d < bd) { bd = d; best = q; } }
    return best;
  }
  function wants(S, p) {
    const L = p.ai.lv, tm = S.teamOf(p), r = p.res, out = [];
    const bl = blocksOf(S, p);
    if (bl < 32 && r[0] >= 4) out.push(['shop', 'wool']);
    if (L.layers >= 2 && S.gt < 60 && r[0] >= 12 && S.count(p, clayOf(p.team)) < 1 && bl >= 16 && p.ai.layer < 2) out.push(['shop', 'clay']);
    if (L.layers >= 3 && S.gt < 150 && r[0] >= 24 && S.count(p, B.HARD) < 1 && p.ai.layer === 2) out.push(['shop', 'hard']);
    if (L.buy >= 0.8 && p.sword < 1 && r[0] >= 10 + (bl < 16 ? 4 : 0)) out.push(['shop', 'sw1']);
    if (L.buy >= 1 && !p.shears && r[0] >= 20 && p.armor >= 1) out.push(['shop', 'shears']);
    if (L.buy >= 0.8 && p.armor < 1 && r[0] >= 24) out.push(['shop', 'ar1']);
    if (L.buy >= 1 && p.pick < 1 && r[0] >= 10 && p.armor >= 1) out.push(['shop', 'pick']);
    if (L.buy >= 0.8 && p.sword < 2 && r[1] >= 7) out.push(['shop', 'sw2']);
    if (L.buy >= 0.8 && p.armor < 2 && r[1] >= 12) out.push(['shop', 'ar2']);
    if (L.gap > 0.5 && S.count(p, 'gapple') < 2 && r[1] >= 3 && p.armor >= 2) out.push(['shop', 'gapple']);
    if (L.layers >= 2 && r[0] >= 12 && S.count(p, clayOf(p.team)) < 8 && p.armor >= 1) out.push(['shop', 'clay']);
    if (L.crit > 0.5 && S.count(p, 'fire') < 1 && r[0] >= 40) out.push(['shop', 'fire']);
    if (L.dia > 0.5) {
      if (!tm.up.sharp && r[2] >= 4) out.push(['upg', 'sharp']);
      if (tm.up.prot < 2 && r[2] >= [2, 4][tm.up.prot]) out.push(['upg', 'prot']);
      if (tm.up.forge < 1 && r[2] >= 2) out.push(['upg', 'forge']);
      if (p.armor < 3 && r[3] >= 6) out.push(['shop', 'ar3']);
      if (p.sword < 3 && r[3] >= 4) out.push(['shop', 'sw3']);
    }
    return out;
  }
  function botThink(S, p) {
    const A = p.ai, L = A.lv, inp = p.inp;
    inp.atk = false; inp.use = false; inp.jump = false; inp.sneak = false;
    if (!p.alive || S.phase !== 'play') { inp.mx = inp.mz = 0; A.goal = null; return; }
    if (L.clutch > 0 && !p.onG && p.vy < -2 && S.t > A.placeT && p.y > 2) {
      const fx = Math.floor(p.x), fz = Math.floor(p.z), by = Math.floor(p.y) - 1;
      if (!S.solidAt(fx, by, fz) && !S.solidAt(fx, by - 1, fz) && !S.solidAt(fx, by - 2, fz) && S.canPlaceAt(p, fx, by, fz) && Math.random() < L.clutch * 0.5) {
        const si = pickBlock(S, p); if (si >= 0) { p.sel = si; A.lookAt = [fx + 0.5, by + 0.5, fz + 0.5]; if (S.placeBlock(p, fx, by, fz, p.hot[si].k)) A.placeT = S.t + 0.3; }
      }
    }
    const tm = S.teamOf(p), ey = S.eyeY(p);
    A.think -= DT;
    if (A.think <= 0) {
      A.think = 0.15;
      const q = nearestEnemy(S, p, 26);
      let vis = false;
      if (q) vis = Math.hypot(q.x - p.x, q.z - p.z) < 5 || S.los(p.x, ey, p.z, q.x, S.eyeY(q), q.z);
      if (q && A.ign && A.ign[q.i] > S.t) vis = false;
      if (q && vis && q !== A.tgt) { A.tgt = q; A.reactT = S.t + L.react * (0.85 + Math.random() * 0.35); A.tgtT = S.t; A.xT = S.t; }
      if (!vis) A.tgt = null;
      if (A.tgt && (p.invT > 0 || A.tgt.invT > 0)) A.xT = S.t;
      if (A.tgt && S.t - A.xT > 7) { A.ign = A.ign || {}; A.ign[A.tgt.i] = S.t + 12; A.tgt = null; vis = false; }
      A.vis = vis;
      const dq = q ? Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) : 99;
      const nearBed = q && tm.bed && Math.hypot(q.x - tm.bedF[0], q.z - tm.bedF[2]) < 12;
      const home = Math.hypot(p.x - tm.center[0], p.z - tm.center[1]) < 9;
      let plan = A.plan;
      const raid = L.layers >= 3 && tm.bed && (A.role === 'def' || !S.pl.some(x => x !== p && x.team === p.team && x.alive)) && S.pl.some(x => x.alive && x.team !== p.team && Math.hypot(x.x - tm.bedF[0], x.z - tm.bedF[2]) < (A.role === 'def' ? 18 : 10) && Math.abs(x.y - tm.bedF[1]) < 6) && Math.hypot(p.x - tm.bedF[0], p.z - tm.bedF[2]) < 34;
      if (q && vis && (dq < 9 + L.strafe * 4 || nearBed && dq < 30)) plan = 'fight';
      else if (raid) plan = 'guard';
      else if (L.layers >= 3 && A.role === 'def' && tm.bed) {
        let iv = null, bd = 30;
        for (const x of S.pl) { if (!x.alive || x.team === p.team) continue; const d = Math.hypot(x.x - tm.center[0], x.z - tm.center[1]); if (d > 7 && d < bd) { bd = d; iv = x; } }
        if (iv) { const dx = iv.x - tm.center[0], dz = iv.z - tm.center[1], dl = Math.hypot(dx, dz) || 1; A.ivX = tm.center[0] + dx / dl * 5.5; A.ivZ = tm.center[1] + dz / dl * 5.5; plan = 'intercept'; }
      }
      else {
        const w = wants(S, p);
        if (home && w.length && S.t > A.buyT) { plan = 'shop'; A.shopKind = w[0][0]; }
        else if (tm.bed && blocksOf(S, p) >= 4 && A.layer < L.layers + (A.role === 'def' ? 1 : 0) && (A.role === 'def' || S.gt < 120 || A.defT < S.gt - 200)) plan = 'defend';
        else if (A.role === 'rush' && blocksOf(S, p) >= L.rushB && S.gt > L.early && (L.buy < 1 || p.shears || p.res[0] < 20)) {
          if (A.target < 0 || !S.teams[A.target].bed && !S.pl.some(x => x.team === A.target && x.alive)) A.target = pickTarget(S, p);
          plan = A.target >= 0 ? 'rush' : 'farm';
        } else if (A.role === 'def' && L.dia > 0.5 && L.layers < 3 && p.res[2] < 4 && S.gt > 90 && blocksOf(S, p) >= 16 && !S.pl.some(x => x.alive && x.team !== p.team && Math.hypot(x.x - tm.center[0], x.z - tm.center[1]) < 22)) plan = 'dia';
        else plan = 'farm';
        if (A.plan === 'rush' && plan !== 'rush' && blocksOf(S, p) >= 2 && !home && A.target >= 0) plan = 'rush';
        if (A.plan === 'rush' && blocksOf(S, p) < 2 && !home) plan = 'home';
        if (A.plan === 'home' && !home) plan = 'home';
      }
      A.plan = plan;
    }
    aim(S, p, ey);
    act(S, p, ey, tm);
  }
  function pickTarget(S, p) {
    let best = -1, bd = 1e9;
    for (const t2 of S.teams) { if (t2.i === p.team || t2.elim) continue; const d = Math.hypot(t2.center[0] - p.x, t2.center[1] - p.z) + (t2.bed ? 0 : 40); if (d < bd) { bd = d; best = t2.i; } }
    return best;
  }
  function aim(S, p, ey) {
    const A = p.ai, L = A.lv;
    A.errT -= DT;
    if (A.errT <= 0) { A.errT = 0.2 + Math.random() * 0.3; const q = A.tgt, mv = q ? Math.min(1, Math.hypot(q.vx, q.vz) / SPRINT) : 0; const k = L.err * (1 + mv * 0.8 + (p.onG ? 0 : 0.4)); A.ety = gauss() * k; A.etp = gauss() * k * 0.6; }
    A.ey = damp(A.ey, A.ety, 7, DT); A.ep = damp(A.ep, A.etp, 7, DT);
    let ty = A.ay, tp = A.ap;
    if (A.lookAt) { angTo(p.x, ey, p.z, A.lookAt[0], A.lookAt[1], A.lookAt[2], AO); ty = AO.yaw; tp = AO.pitch; }
    else if (A.tgt && A.plan === 'fight') { const q = A.tgt; angTo(p.x, ey, p.z, q.x + q.vx * 0.05, q.y + (q.sneak ? 1.1 : 1.3), q.z + q.vz * 0.05, AO); ty = AO.yaw + A.ey; tp = AO.pitch + A.ep; }
    else if (Math.hypot(p.vx, p.vz) > 0.5) { ty = Math.atan2(-p.vx, -p.vz); tp = -0.15; }
    const turn = L.turn * DT * (A.lookAt ? 1.6 : 1);
    A.ay = wrapA(A.ay + clamp(wrapA(ty - A.ay) * Math.min(1, DT * 20), -turn, turn)); A.ap = clamp(A.ap + clamp((tp - A.ap) * Math.min(1, DT * 20), -turn, turn), -1.5, 1.5);
    p.yaw = A.ay; p.pitch = A.ap;
    A.lookAt = null;
  }
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  function steer(S, p, gx, gy, gz, o) {
    const A = p.ai, L = A.lv, inp = p.inp;
    const dx = gx - p.x, dz = gz - p.z, dl = Math.hypot(dx, dz);
    if (dl < (o.stop || 0.6)) { setMove(p, 0, 0); return true; }
    let nx = dx / dl, nz = dz / dl;
    if (A.detourT > S.t) { const c = Math.cos(A.detour), s = Math.sin(A.detour); const rx = nx * c - nz * s, rz = nx * s + nz * c; nx = rx; nz = rz; }
    const fy = Math.floor(p.y + 0.01), cx = Math.floor(p.x), cz = Math.floor(p.z);
    const ax = Math.floor(p.x + nx * 0.8), az = Math.floor(p.z + nz * 0.8);
    const groundAhead = S.solidAt(ax, fy - 1, az) || S.solidAt(ax, fy - 2, az) || S.solidAt(ax, fy, az) || (gy < fy - 0.5 && S.solidAt(ax, fy - 3, az));
    if (!groundAhead && p.onG) {
      if (!o.bridge || blocksOf(S, p) <= 0) { setMove(p, 0, 0); return false; }
      let ax0 = A.bax;
      if (ax0 == null || (ax0 === 0 && Math.abs(dz) > Math.abs(dx) + 1.2) || (ax0 === 1 && Math.abs(dx) > Math.abs(dz) + 1.2) || (ax0 === 0 ? Math.abs(dx) < 0.6 : Math.abs(dz) < 0.6)) ax0 = A.bax = Math.abs(dx) > Math.abs(dz) ? 0 : 1;
      const ad = ax0 === 0 ? (dx > 0 ? 0 : 2) : (dz > 0 ? 1 : 3), [sx, sz] = DIRS[ad];
      const tx = cx + sx, tz = cz + sz;
      if (S.solidAt(cx, fy - 1, cz) && !S.get(tx, fy - 1, tz)) {
        inp.sneak = true;
        A.lookAt = [tx + 0.5 - sx * 0.5, fy - 0.5, tz + 0.5 - sz * 0.5];
        if (S.t > A.placeT) {
          const si = pickBlock(S, p); if (si >= 0) { p.sel = si; if (S.placeBlock(p, tx, fy - 1, tz, p.hot[si].k)) { A.placeT = S.t + L.bridge * (0.8 + Math.random() * 0.4); A.lastBlockT = S.t; } else if (!S.canPlaceAt(p, tx, fy - 1, tz)) A.placeT = S.t + 0.3; }
        }
        const lat = sx ? (cz + 0.5 - p.z) : (cx + 0.5 - p.x);
        setMove(p, sx ? 0.05 * sx : lat * 1.4, sz ? 0.05 * sz : lat * 1.4, true);
        return false;
      }
      setMove(p, sx * 0.4 + (sx ? 0 : (cx + 0.5 - p.x)), sz * 0.4 + (sz ? 0 : (cz + 0.5 - p.z)), true); inp.sneak = true;
      return false;
    }
    const wallAhead = S.solidAt(ax, fy, az) && S.get(ax, fy, az) && BD[S.get(ax, fy, az)].h > 0.6;
    if (wallAhead && p.onG) {
      const two = S.solidAt(ax, fy + 1, az) || S.solidAt(cx, fy + 2, cz);
      if (!two) inp.jump = true;
      else if (S.breakable(p, ax, fy + (S.solidAt(ax, fy + 1, az) && S.breakable(p, ax, fy + 1, az) ? 1 : 0), az)) { const yy = S.solidAt(ax, fy + 1, az) && S.breakable(p, ax, fy + 1, az) ? fy + 1 : fy; mineAt(S, p, ax, yy, az); setMove(p, 0, 0); return false; }
      else if (A.detourT < S.t) { A.detour = (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2; A.detourT = S.t + 1.2; }
    }
    if (gy > fy + 0.5 && dl < 1.6 && p.onG && o.bridge && !S.solidAt(cx, fy + 2, cz)) {
      const si = pickBlock(S, p);
      if (si >= 0 && S.t > A.placeT) { inp.jump = true; if (p.vy < 2 && p.y > fy + 0.9) { p.sel = si; A.lookAt = [cx + 0.5, fy - 0.5, cz + 0.5]; if (S.placeBlock(p, cx, fy, cz, p.hot[si].k)) A.placeT = S.t + L.bridge; } }
    }
    setMove(p, nx, nz, false);
    A.stuckT += DT;
    if (A.stuckT > 0.8) { if (Math.hypot(p.x - A.lx, p.z - A.lz) < 0.4 && dl > 1.2) { if (p.onG) inp.jump = true; if (Math.random() < 0.5) { A.detour = (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2; A.detourT = S.t + 0.8; } } A.stuckT = 0; A.lx = p.x; A.lz = p.z; }
    return false;
  }
  function setMove(p, wx, wz, slow) {
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), inp = p.inp;
    inp.mz = wx * fx + wz * fz; inp.mx = -wx * fz + wz * fx;
    inp.sprint = !slow && Math.hypot(wx, wz) > 0.5 && inp.mz > 0.5;
  }
  function mineAt(S, p, x, y, z) {
    const A = p.ai, b = S.get(x, y, z);
    A.lookAt = [x + 0.5, y + (b && BD[b].h < 1 ? 0.3 : 0.5), z + 0.5];
    const D = BD[b] || BD[0];
    let want = -1;
    if (D.tool === 'shears') want = slotOf(p, 'shears'); else if (D.tool === 'pick') want = slotOf(p, 'pick'); else if (D.tool === 'axe') want = slotOf(p, 'axe');
    if (want < 0 && isBed(b)) want = slotOf(p, 'sword');
    if (want >= 0) p.sel = want;
    const ey = S.eyeY(p), d = S.lookDir(p);
    if (S.rayBlock(p.x, ey, p.z, d[0], d[1], d[2], REACH) && S.RB.x === x && S.RB.y === y && S.RB.z === z) p.inp.atk = true;
    else if (Math.hypot(x + 0.5 - p.x, y + 0.5 - ey, z + 0.5 - p.z) < REACH && S.rayBlock(p.x, ey, p.z, d[0], d[1], d[2], REACH) && S.breakable(p, S.RB.x, S.RB.y, S.RB.z)) p.inp.atk = true;
  }
  function act(S, p, ey, tm) {
    const A = p.ai, L = A.lv, inp = p.inp;
    const swordI = slotOf(p, 'sword');
    if (A.plan === 'fight' && A.tgt) {
      const q = A.tgt;
      if (!q.alive) { A.tgt = null; A.plan = 'farm'; return; }
      if (swordI >= 0) p.sel = swordI;
      const dx = q.x - p.x, dz = q.z - p.z, dh = Math.hypot(dx, dz) || 1;
      A.strafeT -= DT; if (A.strafeT <= 0) { A.strafeT = 0.4 + Math.random() * 0.7; A.strafe = Math.random() < 0.5 ? 1 : -1; }
      const fy = Math.floor(p.y + 0.01);
      if (q.y - p.y > 2.2 && dh < 4.5 && p.onG !== null) {
        const si = pickBlock(S, p), cx = Math.floor(p.x), cz = Math.floor(p.z);
        setMove(p, (cx + 0.5 - p.x) * 1.5, (cz + 0.5 - p.z) * 1.5, true);
        if (si >= 0 && !S.solidAt(cx, fy + 2, cz)) { if (p.onG) inp.jump = true; if (!p.onG && p.y > fy + 0.95 && S.t > A.placeT) { p.sel = si; A.lookAt = [cx + 0.5, fy + 0.5, cz + 0.5]; if (S.placeBlock(p, cx, fy, cz, p.hot[si].k)) A.placeT = S.t + 0.2; } }
        return;
      }
      if (dh > 3.6 || Math.abs(q.y - p.y) > 2.5) { const yaw0 = p.yaw; steer(S, p, q.x, q.y, q.z, { bridge: true, stop: 2.2 }); p.yaw = yaw0; }
      else {
        let fwd = dh > 2.4 ? 1 : dh < 1.6 ? -0.3 : 0.15;
        if (S.t < A.backT) fwd = 0;
        const sf = A.strafe * L.strafe * 0.6;
        let wx = dx / dh * fwd - dz / dh * sf, wz = dz / dh * fwd + dx / dh * sf;
        const ax = Math.floor(p.x + wx * 0.9), az = Math.floor(p.z + wz * 0.9);
        if (p.onG && !S.solidAt(ax, fy - 1, az) && !S.solidAt(ax, fy - 2, az) && !S.solidAt(ax, fy - 3, az)) { wx = dx / dh * Math.max(0, fwd) * 0.5; wz = dz / dh * Math.max(0, fwd) * 0.5; const bx = Math.floor(p.x + wx * 1.6), bz = Math.floor(p.z + wz * 1.6); if (!S.solidAt(bx, fy - 1, bz)) { wx = 0; wz = 0; } }
        setMove(p, wx, wz, false);
      }
      if (p.onG && dh > 3.5 && S.solidAt(Math.floor(p.x + dx / dh * 0.8), fy, Math.floor(p.z + dz / dh * 0.8))) inp.jump = true;
      if (L.crit > 0 && dh < 3.2 && p.onG && S.t > A.critT && Math.random() < L.crit * 0.08) { inp.jump = true; A.critT = S.t + 0.9; }
      if (p.hp < 9 && L.gap > 0 && S.count(p, 'gapple') > 0 && (dh > 4 || L.gap >= 1 && p.hp < 6) && !A.eat && Math.random() < L.gap) A.eat = true;
      if (A.eat) { const gi = slotOf(p, 'gapple'); if (gi < 0 || p.hp >= 16) A.eat = false; else { p.sel = gi; inp.use = true; setMove(p, -dx / dh * 0.4, -dz / dh * 0.4, true); return; } }
      if (L.crit > 0.5 && dh > 6 && dh < 22 && S.count(p, 'fire') > 0 && S.t > A.fireT && !q.onG === false && Math.abs(q.y - p.y) < 4) {
        const fi = slotOf(p, 'fire'); const qx = Math.floor(q.x), qz = Math.floor(q.z), qy = Math.floor(q.y);
        const onBridge = !S.solidAt(qx + 2, qy - 1, qz) || !S.solidAt(qx - 2, qy - 1, qz) || !S.solidAt(qx, qy - 1, qz + 2) || !S.solidAt(qx, qy - 1, qz - 2);
        if (fi >= 0 && onBridge && S.t >= A.reactT) { p.sel = fi; angTo(p.x, ey, p.z, q.x, q.y + 0.8, q.z, AO); if (Math.abs(wrapA(AO.yaw - p.yaw)) < 0.12) { S.useItem(p, p.hot[fi]); A.fireT = S.t + 4; } return; }
      }
      if (S.t >= A.reactT && dh < HIT + 0.6 && p.atkCD <= 0) {
        if (L.crit > 0 && !p.onG && p.vy > 0.5 && dh < 3) return;
        const d = S.lookDir(p), q2 = S.rayPlayers(p, p.x, ey, p.z, d[0], d[1], d[2], HIT + 0.2);
        if (q2 === q || dh < 1.2) { inp.atk = true; p.atkCD = 1 / L.cps * (0.8 + Math.random() * 0.4); if (L.wtap > 0 && Math.random() < L.wtap) A.backT = S.t + 0.08; }
      }
      return;
    }
    if (A.plan === 'shop') {
      const npc = S.npcs.find(n => n.team === p.team && n.kind === (A.shopKind === 'upg' ? 'upg' : 'shop'));
      if (!npc) { A.plan = 'farm'; return; }
      if (Math.hypot(npc.x - p.x, npc.z - p.z) >= 2.6 && Math.hypot(npc.x - p.x, npc.z - p.z) > 4) { route(S, p, npc.x, npc.y, npc.z); return; }
      if (Math.hypot(npc.x - p.x, npc.z - p.z) < 2.6) {
        setMove(p, 0, 0);
        let n = 0;
        for (const [k, id] of wants(S, p)) { if (k !== A.shopKind) continue; if (S.buy(p, id) === 'ok') n++; if (n > 3) break; }
        A.buyT = S.t + 3 + Math.random() * 2; A.plan = 'farm';
      } else steer(S, p, npc.x, npc.y, npc.z, { stop: 2 });
      return;
    }
    if (A.plan === 'defend') {
      const cells = bedCells(S, tm, A.layer + 1 > L.layers + 1 ? L.layers : Math.min(2, A.layer + 1));
      const todo = cells.filter(c => !S.get(c[0], c[1], c[2]));
      if (!todo.length) { A.layer++; A.defT = S.gt; A.plan = 'farm'; return; }
      const bx = (tm.bedF[0] + tm.bedH[0]) / 2 + 0.5, bz = (tm.bedF[2] + tm.bedH[2]) / 2 + 0.5;
      const back = [tm.center[0] - tm.f[0] * 0.5, tm.center[1] - tm.f[1] * 0.5];
      const sx = bx - tm.f[0] * 2.6, sz = bz - tm.f[1] * 2.6;
      if (Math.hypot(sx - p.x, sz - p.z) > 1) { if (Math.hypot(sx - p.x, sz - p.z) > 4) route(S, p, sx, BASE + 1, sz); else steer(S, p, sx, BASE + 1, sz, { stop: 0.8 }); return; }
      setMove(p, 0, 0);
      let c = null; for (const cc of todo) if (S.canPlaceAt(p, cc[0], cc[1], cc[2])) { c = cc; break; }
      if (!c) { setMove(p, (back[0] - p.x) * 0.3, (back[1] - p.z) * 0.3); if (S.t > A.placeT + 2) { A.layer++; A.plan = 'farm'; } return; }
      A.lookAt = [c[0] + 0.5, c[1] + 0.5, c[2] + 0.5];
      if (S.t > A.placeT) {
        const layer2 = !bedCells(S, tm, 1).some(x => x[0] === c[0] && x[1] === c[1] && x[2] === c[2]);
        const si = pickBlock(S, p, layer2 ? k => isClay(k) || k === B.HARD : k => isWool(k));
        if (si >= 0) { p.sel = si; if (S.placeBlock(p, c[0], c[1], c[2], p.hot[si].k)) A.placeT = S.t + L.bridge * 0.9; else A.placeT = S.t + 0.25; }
      }
      return;
    }
    if (A.plan === 'rush') {
      const t2 = S.teams[A.target];
      if (!t2) { A.plan = 'farm'; return; }
      if (t2.bed) {
        const bx = t2.bedF[0], by = t2.bedF[1], bz = t2.bedF[2];
        const dh = Math.hypot(bx + 0.5 - p.x, bz + 0.5 - p.z);
        if (dh < 3.6 && Math.abs(by - p.y) < 3) {
          setMove(p, 0, 0);
          const targets = [t2.bedF, t2.bedH];
          let done = false;
          for (const c of targets) {
            const cx = c[0] + 0.5, cy = c[1] + 0.3, cz = c[2] + 0.5, dx = cx - p.x, dy = cy - ey, dz = cz - p.z, dl = Math.hypot(dx, dy, dz);
            if (dl > REACH) continue;
            S.rayBlock(p.x, ey, p.z, dx / dl, dy / dl, dz / dl, REACH);
            if (S.RB.hit && S.breakable(p, S.RB.x, S.RB.y, S.RB.z)) { mineAt(S, p, S.RB.x, S.RB.y, S.RB.z); done = true; break; }
          }
          if (!done) { A.lookAt = [bx + 0.5, by + 1.5, bz + 0.5]; const top = [bx, by + 1, bz]; if (S.breakable(p, top[0], top[1], top[2])) mineAt(S, p, top[0], top[1], top[2]); else { const side = A.detourT > S.t ? A.detour : 0; setMove(p, Math.cos(S.t) * 0.5, Math.sin(S.t) * 0.5); } }
          return;
        }
        const fx = t2.f[0], fz = t2.f[1];
        const ex = bx + 0.5 + fx * 1.6, ez = bz + 0.5 + fz * 1.6;
        route(S, p, ex, BASE + 1, ez);
        return;
      }
      const q = S.pl.find(x => x.team === A.target && x.alive);
      if (q) { route(S, p, q.x, q.y, q.z); return; }
      A.target = pickTarget(S, p); if (A.target < 0) A.plan = 'farm';
      return;
    }
    if (A.plan === 'dia') {
      let g = null, bd = 1e9; for (const x of S.gens) if (x.type === 2) { const d = Math.hypot(x.x - p.x, x.z - p.z); if (d < bd) { bd = d; g = x; } }
      if (!g) { A.plan = 'farm'; return; }
      if (bd < 1) { setMove(p, 0, 0); if (p.res[2] >= 4) A.plan = 'home'; return; }
      route(S, p, g.x, g.y, g.z);
      return;
    }
    if (A.plan === 'intercept') { route(S, p, A.ivX, BASE + 1, A.ivZ); return; }
    if (A.plan === 'guard') { if (Math.hypot(tm.bedF[0] + 0.5 - p.x, tm.bedF[2] + 0.5 - p.z) < 3) { A.plan = 'farm'; return; } route(S, p, tm.bedF[0] + 0.5 - tm.f[0] * 2, BASE + 1, tm.bedF[2] + 0.5 - tm.f[1] * 2); return; }
    if (A.plan === 'home') { const [hx, hz] = tm.center; if (Math.hypot(hx - p.x, hz - p.z) < 3) { A.plan = 'farm'; return; } route(S, p, hx, BASE + 1, hz); return; }
    const [gx, gz] = tm.gen;
    if (Math.hypot(gx - p.x, gz - p.z) > 8) { route(S, p, gx, BASE + 1, gz); return; }
    steer(S, p, gx + Math.sin(S.t * 0.7 + p.i) * 0.4, BASE + 1, gz + Math.cos(S.t * 0.6 + p.i) * 0.4, { stop: 0.3 });
  }
  const standable = (S, x, y, z) => S.solidAt(x, y - 1, z) && !S.solidAt(x, y, z) && !S.solidAt(x, y + 1, z);
  function bfs(S, p, gx, gz, maxN) {
    const sx = Math.floor(p.x), sz = Math.floor(p.z), sy = Math.floor(p.y + 0.01);
    if (!standable(S, sx, sy, sz)) return null;
    const seen = new Map(), qx = [sx], qy = [sy], qz = [sz], par = [-1];
    seen.set(sx * 4096 + sz, 0);
    let best = 0, bd = Math.hypot(gx - sx - 0.5, gz - sz - 0.5);
    for (let h = 0; h < qx.length && qx.length < maxN; h++) {
      const x = qx[h], y = qy[h], z = qz[h];
      const d = Math.hypot(gx - x - 0.5, gz - z - 0.5);
      if (d < bd) { bd = d; best = h; if (d < 1) break; }
      for (let k = 0; k < 4; k++) {
        const nx = x + DIRS[k][0], nz = z + DIRS[k][1], key = nx * 4096 + nz;
        if (seen.has(key)) continue;
        let ny = -1;
        for (const yy of [y, y + 1, y - 1, y - 2, y - 3]) { if (standable(S, nx, yy, nz) && (yy <= y || !S.solidAt(x, y + 2, z))) { ny = yy; break; } }
        if (ny < 0) continue;
        seen.set(key, qx.length); qx.push(nx); qy.push(ny); qz.push(nz); par.push(h);
      }
    }
    const path = [];
    for (let h = best; h > 0; h = par[h]) path.push([qx[h], qy[h], qz[h]]);
    path.reverse();
    return { path, reach: bd < 2.2, bd };
  }
  function route(S, p, gx, gy, gz) {
    const A = p.ai;
    if (S.t > (A.navT || 0) || Math.hypot(gx - A.navGx, gz - A.navGz) > 2.5) { A.navT = S.t + 0.6 + Math.random() * 0.3; A.navGx = gx; A.navGz = gz; A.nav = p.onG ? bfs(S, p, gx, gz, 2600) : A.nav; }
    const N = A.nav;
    if (N && N.path.length) {
      while (N.path.length && Math.hypot(p.x - N.path[0][0] - 0.5, p.z - N.path[0][2] - 0.5) < 0.45) N.path.shift();
      if (N.path.length) { const w = N.path[0]; steer(S, p, w[0] + 0.5, w[1], w[2] + 0.5, { bridge: false, stop: 0.2 }); return; }
    }
    steer(S, p, gx, gy, gz, { bridge: true, stop: 0.7 });
  }

  const TILE = {};
  const TL = ['grassT', 'grassS', 'dirt', 'stone', 'cobble', 'logS', 'logT', 'leaves', 'planks', 'sand', 'bricks', 'w0', 'w1', 'w2', 'w3', 'w4', 'c0', 'c1', 'c2', 'c3', 'glass', 'hard', 'obsid', 'ironb', 'goldb', 'diab', 'emeb', 'bf0', 'bh0', 'bf1', 'bh1', 'bf2', 'bh2', 'bf3', 'bh3', 'bs0', 'bs1', 'bs2', 'bs3', 'lantern', 'k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'snow', 'tntS', 'tntT', 'bedU'];
  TL.forEach((n, i) => { TILE[n] = i; });
  function rngS(s) { return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function drawAtlas() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    const R = rngS(7);
    const tile = (n, f) => { const i = TILE[n], ox = (i % 16) * 16, oy = ((i / 16) | 0) * 16; f((px, py, col, a = 1) => { if (!a) return; const [r, g, b] = typeof col === 'string' ? hexRgb(col) : col; x.fillStyle = `rgba(${r},${g},${b},${a})`; x.fillRect(ox + px, oy + py, 1, 1); }); };
    const vary = (base, amt) => { const [r, g, b] = hexRgb(base), k = (R() - 0.5) * amt; return [clamp(r + k, 0, 255) | 0, clamp(g + k, 0, 255) | 0, clamp(b + k, 0, 255) | 0]; };
    const fill = (n, base, amt, extra) => tile(n, px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) px(i, j, vary(base, amt)); if (extra) extra(px); });
    fill('grassT', '#6cb33f', 46, px => { for (let k = 0; k < 30; k++) px((R() * 16) | 0, (R() * 16) | 0, '#4f9a2c'); });
    fill('dirt', '#8a5d3b', 40, px => { for (let k = 0; k < 18; k++) px((R() * 16) | 0, (R() * 16) | 0, '#6b442a'); });
    tile('grassS', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const g = j < 3 || (j < 5 && R() < 0.5); px(i, j, g ? vary('#6cb33f', 40) : vary('#8a5d3b', 40)); } });
    fill('stone', '#8a8a8a', 30, px => { for (let k = 0; k < 14; k++) { const a = (R() * 15) | 0, b = (R() * 16) | 0; px(a, b, '#6f6f6f'); px(a + 1, b, '#6f6f6f'); } });
    tile('cobble', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const edge = (i + ((j / 4) | 0) * 3) % 5 === 0 || j % 4 === 0; px(i, j, edge ? vary('#555555', 18) : vary('#8f8f8f', 36)); } });
    tile('logS', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) px(i, j, i % 4 === 0 || R() < 0.1 ? vary('#4a3620', 18) : vary('#6b4f2e', 28)); });
    tile('logT', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const d = Math.max(Math.abs(i - 7.5), Math.abs(j - 7.5)); px(i, j, d > 6.5 ? vary('#5a4126', 20) : ((d | 0) % 2 ? vary('#b5905a', 20) : vary('#9c784a', 20))); } });
    tile('leaves', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { if (R() < 0.18) continue; px(i, j, vary(R() < 0.3 ? '#2f7a25' : '#3f9a32', 40)); } });
    tile('planks', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const seam = j % 4 === 3 || (i === ((j / 4 | 0) % 2 ? 4 : 11) && j % 4 !== 3); px(i, j, seam ? vary('#7a5a30', 14) : vary('#b89060', 24)); } });
    fill('sand', '#dbcf9a', 24);
    tile('bricks', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const m = j % 8 === 7 || (i % 8 === ((j / 8 | 0) % 2 ? 3 : 7)); px(i, j, m ? vary('#5d5d5d', 10) : vary('#7e7e80', 26)); } });
    const woolC = TEAMS.map(t => t.c).concat('#f2f2f2');
    woolC.forEach((c, k) => tile('w' + k, px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const st = ((i + j * 2) % 6 === 0); px(i, j, vary(c, st ? 46 : 26)); } }));
    TEAMS.forEach((t, k) => tile('c' + k, px => { const [r, g, b] = hexRgb(t.c); const base = '#' + [r * 0.62 + 50, g * 0.55 + 45, b * 0.5 + 40].map(v => (clamp(v, 0, 255) | 0).toString(16).padStart(2, '0')).join(''); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) px(i, j, vary(base, 14)); }));
    tile('glass', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const e = i === 0 || j === 0 || i === 15 || j === 15; if (e) px(i, j, '#d6f0ff'); else if ((i === j + 3 || i === j + 4) && i > 3 && i < 12) px(i, j, '#ffffff', 0.9); } });
    fill('hard', '#e6e1a8', 22, px => { for (let k = 0; k < 20; k++) px((R() * 16) | 0, (R() * 16) | 0, '#c9c38a'); });
    fill('obsid', '#1a1226', 18, px => { for (let k = 0; k < 16; k++) px((R() * 16) | 0, (R() * 16) | 0, '#4a2a6e'); });
    const metal = (n, base, hi) => tile(n, px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const e = i === 0 || j === 0 || i === 15 || j === 15; px(i, j, e ? vary(base, 10) : (i + j) % 7 === 0 ? hi : vary(base, 16)); } });
    metal('ironb', '#d8d8d8', '#ffffff'); metal('goldb', '#f2c230', '#fff2a0'); metal('diab', '#4fe0e8', '#d8ffff'); metal('emeb', '#2fbf5a', '#a8ffc0');
    TEAMS.forEach((t, k) => {
      tile('bf' + k, px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) px(i, j, j === 0 || j === 15 || i === 0 || i === 15 ? vary(t.d, 10) : vary(t.c, 24)); });
      tile('bh' + k, px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const pil = j > 1 && j < 7 && i > 2 && i < 13; px(i, j, pil ? vary('#f4f4f4', 10) : (j === 0 || i === 0 || i === 15) ? vary(t.d, 10) : vary(t.c, 24)); } });
      tile('bs' + k, px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { if (j < 7) { px(i, j, 0, 0); continue; } px(i, j, j < 9 ? vary('#f4f4f4', 8) : j < 13 ? vary(t.c, 20) : vary('#7a5230', 16)); } });
    });
    tile('bedU', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) px(i, j, vary('#7a5230', 16)); });
    tile('lantern', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const e = i < 2 || i > 13 || j < 2 || j > 13; px(i, j, e ? vary('#3a3a3a', 10) : vary('#ffd36a', 30)); } });
    for (let s = 0; s < 10; s++) tile('k' + s, px => { const r2 = rngS(100 + s); const n = 6 + s * 9; for (let k = 0; k < n; k++) { let a = 7 + ((r2() - 0.5) * 6) | 0, b = 7 + ((r2() - 0.5) * 6) | 0; const len = 2 + (r2() * (3 + s)) | 0, dx = r2() < 0.5 ? 1 : -1, dy = r2() < 0.5 ? 1 : -1; for (let q = 0; q < len; q++) { if (a >= 0 && a < 16 && b >= 0 && b < 16) px(a, b, '#000000', 0.75); if (r2() < 0.5) a += dx; else b += dy; } } });
    fill('snow', '#f4f8ff', 10);
    tile('tntS', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const band = j > 5 && j < 10; px(i, j, band ? '#f2f2f2' : vary(i % 4 === 0 ? '#9a2a1e' : '#d8392b', 16)); } [[3, 7], [4, 7], [5, 7], [4, 8], [7, 7], [7, 8], [8, 7], [9, 8], [9, 7], [11, 7], [12, 7], [13, 7], [12, 8]].forEach(([a, b]) => px(a, b, '#222222')); });
    tile('tntT', px => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) px(i, j, (Math.abs(i - 7.5) < 2 && Math.abs(j - 7.5) < 2) ? '#5a5a5a' : vary('#c8352a', 16)); });
    return c;
  }
  function faceTile(id, f) {
    switch (id) {
      case 1: return f === 0 ? TILE.grassT : f === 1 ? TILE.dirt : TILE.grassS;
      case 2: return TILE.dirt; case 3: return TILE.stone; case 4: return TILE.cobble; case 5: return f < 2 ? TILE.logT : TILE.logS; case 6: return TILE.leaves; case 7: return TILE.planks; case 8: return TILE.sand; case 9: return TILE.bricks;
      case 20: return TILE.glass; case 21: return TILE.hard; case 23: return TILE.obsid; case 24: return TILE.ironb; case 25: return TILE.goldb; case 26: return TILE.diab; case 27: return TILE.emeb; case 37: return TILE.lantern; case 38: return TILE.snow;
    }
    if (id >= 11 && id <= 15) return TILE['w' + (id - 11)];
    if (id >= 16 && id <= 19) return TILE['c' + (id - 16)];
    if (id >= 28 && id <= 35) { const t = (id - 28) >> 1, foot = !((id - 28) & 1); return f === 0 ? TILE[(foot ? 'bf' : 'bh') + t] : f === 1 ? TILE.bedU : TILE['bs' + t]; }
    return TILE.stone;
  }
  const opaque = id => id !== 0 && !BD[id].cut && BD[id].h >= 1;
  const SPR = {};
  function sprite(key) {
    if (SPR[key]) return SPR[key];
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; const x = c.getContext('2d');
    const px = (a, b, col) => { if (a < 0 || a > 15 || b < 0 || b > 15) return; x.fillStyle = col; x.fillRect(a, b, 1, 1); };
    const tierC = ['#a8794a', '#8f8f8f', '#e6e6e6', '#ffd23f', '#5fe8e8'];
    const [k, a1] = key.split(':'), tc = a1 != null ? +a1 : 0;
    const stick = (x0, y0, n) => { for (let i = 0; i < n; i++) { px(x0 - i, y0 + i, '#7a5230'); px(x0 - i + 1, y0 + i, '#4a3018'); } };
    if (k === 'sword') {
      const bl = ['#c49a62', '#9a9a9a', '#f0f0f0', '#7ff0f0'][tc], bd = ['#7a5a30', '#5f5f5f', '#a8a8a8', '#2fb0b0'][tc];
      for (let i = 0; i < 9; i++) { px(6 + i, 9 - i, bl); px(7 + i, 9 - i, bd); px(6 + i, 8 - i, bd); }
      px(15, 0, bd); [[3, 8], [4, 9], [5, 10], [6, 11], [7, 12]].forEach(([a, b]) => px(a, b, '#4a3018'));
      [[5, 11], [4, 12], [3, 13], [2, 14]].forEach(([a, b]) => px(a, b, '#7a5230')); px(1, 15, '#4a3018'); px(2, 15, '#4a3018');
    } else if (k === 'pick' || k === 'axe') {
      const hc = tierC[[0, 0, 2, 3, 4][tc] || 0], hd = '#3a3a3a';
      stick(11, 4, 11);
      if (k === 'pick') { for (let i = 0; i < 12; i++) { const yy = 2 + Math.round(Math.pow((i - 5.5) / 5.5, 2) * 3); px(3 + i, yy, hc); px(3 + i, yy - 1, hd); } px(2, 6, hd); px(15, 6, hd); }
      else { for (let j = 0; j < 6; j++) for (let i = 0; i < 4; i++) if (!(i === 3 && (j === 0 || j === 5))) px(9 + i + (j < 3 ? 0 : 0), 1 + j, i === 0 ? hd : hc); }
    } else if (k === 'shears') {
      for (let i = 0; i < 8; i++) { px(7 + i, 8 - i, '#d8d8d8'); px(7 + i, 9 - i, '#9a9a9a'); px(8 - i + 1, 8 - i, '#d8d8d8'); }
      for (const [a, b] of [[2, 12], [3, 13], [4, 12], [3, 11], [10, 12], [11, 13], [12, 12], [11, 11], [4, 10], [10, 10]]) px(a, b, '#c0392b');
    } else if (k === 'bow') {
      for (let i = 0; i < 14; i++) { const t2 = i / 13, xx = Math.round(3 + Math.sin(t2 * Math.PI) * 9); px(xx, 1 + i, '#8a5a30'); px(xx + 1, 1 + i, '#5a3a18'); }
      for (let i = 0; i < 14; i++) px(3, 1 + i, '#e6e6e6');
    } else if (k === 'arrow') {
      for (let i = 0; i < 11; i++) px(3 + i, 12 - i, '#8a5a30');
      for (const [a, b] of [[13, 1], [14, 1], [14, 2], [12, 1], [14, 3]]) px(a, b, '#8f8f8f');
      for (const [a, b] of [[1, 13], [2, 14], [1, 14], [2, 12], [3, 14], [1, 12]]) px(a, b, '#f0f0f0');
    } else if (k === 'gapple') {
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const d = Math.hypot(i - 7.5, (j - 9) * 1.1); if (d < 6) px(i, j, d < 3 && i < 7 && j < 8 ? '#fff2a0' : d > 5 ? '#b8860b' : '#ffd23f'); }
      px(8, 2, '#5a3a18'); px(8, 3, '#5a3a18'); px(9, 2, '#3ea83e'); px(10, 1, '#3ea83e'); px(10, 2, '#2c8a2c');
    } else if (k === 'fire') {
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const d = Math.hypot(i - 7.5, j - 7.5); if (d < 7) px(i, j, d < 2.5 ? '#fff6a0' : d < 4.5 ? '#ffb020' : d < 6 ? '#e8501a' : '#5a1a08'); }
    } else if (k === 'pearl') {
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const d = Math.hypot(i - 7.5, j - 7.5); if (d < 6) px(i, j, d < 2 ? '#7fffd4' : d < 4.5 ? '#1f8a76' : '#0e4a40'); }
      px(5, 5, '#e8fff8');
    } else if (k === 'egg') {
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const d = Math.hypot((i - 7.5) * 1.2, (j - 8.5) * (j < 8 ? 0.9 : 1.05)); if (d < 6.5) px(i, j, d > 5.6 ? '#bfb8a8' : '#f4f0e6'); }
      const tcol = TEAMS[tc % 4].c; for (const [a, b] of [[6, 6], [9, 9], [7, 11], [10, 5]]) { px(a, b, tcol); px(a + 1, b, tcol); }
    } else if (k === 'kb') {
      stick(12, 2, 12);
      for (const [a, b] of [[13, 1], [12, 3], [6, 8], [4, 11], [9, 5]]) px(a, b, '#d7a8ff');
    } else if (k === 'res') {
      if (tc < 2) { const c1 = tc ? '#ffd23f' : '#e8e8ef', c2 = tc ? '#b8860b' : '#9a9aa6', c3 = tc ? '#fff6c0' : '#ffffff'; for (let j = 6; j < 12; j++) for (let i = 2; i < 14; i++) { const sl = j - 6; if (i < 2 + sl * 0.5 || i > 13 - sl * 0.5 + 2) continue; px(i, j, j === 6 ? c3 : j > 9 ? c2 : c1); } }
      else if (tc === 2) { for (let j = 2; j < 15; j++) for (let i = 1; i < 15; i++) { const d = Math.abs(i - 7.5) / 6.5 + Math.abs(j - (j < 6 ? 5.5 : 6)) / (j < 6 ? 3.5 : 8.5); if (d < 1) px(i, j, j < 6 ? '#bffcff' : i < 8 ? '#4fe6ff' : '#2bb8d0'); } }
      else { for (let j = 1; j < 15; j++) for (let i = 3; i < 13; i++) { const d = Math.max(Math.abs(i - 7.5) / 4.5, Math.abs(j - 7.5) / 6.5 + Math.abs(i - 7.5) / 12); if (d < 1) px(i, j, i < 7 && j < 8 ? '#a8ffc0' : d > 0.8 ? '#1a8a3e' : '#3ddc6a'); } }
    }
    SPR[key] = c;
    return c;
  }
  const ICONS = {};
  function itemKey(p, s) { if (!s) return ''; const k = s.k; if (k === 'sword') return 'sword:' + p.sword; if (k === 'pick') return 'pick:' + p.pick; if (k === 'axe') return 'axe:' + p.axe; if (k === 'egg') return 'egg:' + p.team; if (typeof k === 'number') return 'b:' + k; if (k === 'tnt') return 'b:tnt'; return k; }
  function iconCanvas(key, atlas) {
    if (ICONS[key]) return ICONS[key];
    const c = document.createElement('canvas'); c.width = 32; c.height = 32; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    if (key.startsWith('b:')) {
      const id = key === 'b:tnt' ? -1 : +key.slice(2);
      const t0 = id < 0 ? TILE.tntT : faceTile(id, 0), t1 = id < 0 ? TILE.tntS : faceTile(id, 2);
      const tx = i => [(i % 16) * 16, ((i / 16) | 0) * 16];
      const [ax, ay] = tx(t0), [bx2, by2] = tx(t1);
      x.save(); x.setTransform(1, 0.5, -1, 0.5, 16, 1); x.drawImage(atlas, ax, ay, 16, 16, 0, 0, 15, 15); x.restore();
      x.save(); x.setTransform(1, 0.5, 0, 1, 1, 8.5); x.drawImage(atlas, bx2, by2, 16, 16, 0, 0, 15, 15); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, 0, 15, 15); x.restore();
      x.save(); x.setTransform(1, -0.5, 0, 1, 16, 16); x.drawImage(atlas, bx2, by2, 16, 16, 0, 0, 15, 15); x.fillStyle = 'rgba(0,0,0,.36)'; x.fillRect(0, 0, 15, 15); x.restore();
    } else { const s = sprite(key); x.drawImage(s, 0, 0, 32, 32); }
    ICONS[key] = c;
    return c;
  }

  function makeView(THREE, Vw, api) {
    const { renderer } = Vw;
    const bin = [], own = x => (bin.push(x), x);
    const col = hex => new THREE.Color(hex).convertSRGBToLinear();
    const scene = new THREE.Scene();
    scene.background = col('#8ec7ff');
    scene.fog = new THREE.Fog(col('#a9d4ff'), 60, 150);
    const cam = new THREE.PerspectiveCamera(70, Vw.w / Vw.h, 0.05, 400);
    cam.rotation.order = 'YXZ';
    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const sunL = new THREE.DirectionalLight(0xffffff, 0.55); sunL.position.set(0.4, 1, 0.3); scene.add(sunL);
    const atlasC = drawAtlas();
    const atlas = own(new THREE.CanvasTexture(atlasC)); atlas.magFilter = THREE.NearestFilter; atlas.minFilter = THREE.NearestFilter; atlas.generateMipmaps = false; atlas.encoding = THREE.sRGBEncoding;
    const chunkMat = own(new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true, alphaTest: 0.5 }));
    {
      const sky = new THREE.Mesh(own(new THREE.SphereGeometry(300, 16, 12)), own(new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: {}, vertexShader: 'varying vec3 vp; void main(){ vp = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: 'varying vec3 vp; void main(){ float h = normalize(vp).y; vec3 top = vec3(0.32,0.58,0.98); vec3 mid = vec3(0.66,0.83,1.0); vec3 bot = vec3(0.10,0.12,0.24); vec3 c = h > 0.0 ? mix(mid, top, clamp(h*1.6,0.0,1.0)) : mix(mid, bot, clamp(-h*2.2,0.0,1.0)); gl_FragColor = vec4(c,1.0); }' })));
      sky.renderOrder = -1; scene.add(sky);
      const sun = new THREE.Mesh(own(new THREE.PlaneGeometry(24, 24)), own(new THREE.MeshBasicMaterial({ color: 0xfff6c8, fog: false })));
      sun.position.set(120, 180, 60); sun.lookAt(0, 0, 0); scene.add(sun);
      const cc = document.createElement('canvas'); cc.width = 64; cc.height = 64; const cx = cc.getContext('2d'); const r = rngS(3);
      for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = Math.sin(i * 0.31 + r() * 0.2) + Math.cos(j * 0.27) + Math.sin((i + j) * 0.13) * 1.3; if (v > 1.1) { cx.fillStyle = 'rgba(255,255,255,.92)'; cx.fillRect(i, j, 1, 1); } }
      const ct = own(new THREE.CanvasTexture(cc)); ct.magFilter = THREE.NearestFilter; ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(3, 3);
      const clouds = new THREE.Mesh(own(new THREE.PlaneGeometry(700, 700)), own(new THREE.MeshBasicMaterial({ map: ct, transparent: true, opacity: 0.85, depthWrite: false, fog: false, side: THREE.DoubleSide })));
      clouds.rotation.x = -Math.PI / 2; clouds.position.set(48, 70, 48); scene.add(clouds);
      var cloudM = clouds;
    }
    const CS = 16, NCX = WX / CS, NCY = WY / CS, NCZ = WZ / CS;
    const chunks = [];
    for (let i = 0; i < NCX * NCY * NCZ; i++) chunks.push({ mesh: null, dirty: true });
    let SIM = null;
    const AOL = [0.5, 0.66, 0.82, 1];
    const FACES = [
      { n: [0, 1, 0], s: 1, c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], f: 0 },
      { n: [0, -1, 0], s: 0.5, c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], f: 1 },
      { n: [1, 0, 0], s: 0.8, c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], f: 2 },
      { n: [-1, 0, 0], s: 0.8, c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], f: 2 },
      { n: [0, 0, 1], s: 0.65, c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], f: 2 },
      { n: [0, 0, -1], s: 0.65, c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], f: 2 }
    ];
    const POS = [], UV = [], COL = [], IDXA = [];
    function buildChunk(ci) {
      const S = SIM, ch = chunks[ci];
      const cxi = ci % NCX, czi = ((ci / NCX) | 0) % NCZ, cyi = (ci / (NCX * NCZ)) | 0;
      POS.length = 0; UV.length = 0; COL.length = 0; IDXA.length = 0;
      const g = S.get;
      const occ = (x, y, z) => { const b = g(x, y, z); return b !== 0 && opaque(b) ? 1 : 0; };
      for (let y = cyi * CS; y < cyi * CS + CS; y++) for (let z = czi * CS; z < czi * CS + CS; z++) for (let x = cxi * CS; x < cxi * CS + CS; x++) {
        const id = g(x, y, z); if (!id) continue;
        const D = BD[id], h = D.h;
        for (let f = 0; f < 6; f++) {
          const F = FACES[f], nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2], nb = g(nx, ny, nz);
          if (nb && opaque(nb) && !(f === 0 && h < 1)) continue;
          if (nb && nb === id && D.cut && id !== 6) continue;
          const tile = faceTile(id, F.f), tu = (tile % 16) * 16, tv = ((tile / 16) | 0) * 16;
          const base = POS.length / 3;
          for (let k = 0; k < 4; k++) {
            const c = F.c[k];
            let vy = c[1] * h;
            POS.push(x + c[0], y + vy, z + c[2]);
            let u, v;
            if (F.f < 2) { u = c[0]; v = c[2]; } else { u = F.n[0] !== 0 ? (F.n[0] > 0 ? 1 - c[2] : c[2]) : (F.n[2] > 0 ? c[0] : 1 - c[0]); v = c[1] * h; }
            const U = (tu + 0.02 + u * 15.96) / 256, Vv = 1 - (tv + 0.02 + (F.f < 2 ? v : 1 - v) * 15.96) / 64;
            UV.push(U, Vv);
            let ao = 3;
            if (h >= 1) {
              const ax = F.n[0] !== 0 ? 0 : c[0] * 2 - 1, ay = F.n[1] !== 0 ? 0 : c[1] * 2 - 1, az = F.n[2] !== 0 ? 0 : c[2] * 2 - 1;
              let s1, s2, cr;
              if (F.n[1] !== 0) { s1 = occ(nx + ax, ny, nz); s2 = occ(nx, ny, nz + az); cr = occ(nx + ax, ny, nz + az); }
              else if (F.n[0] !== 0) { s1 = occ(nx, ny + ay, nz); s2 = occ(nx, ny, nz + az); cr = occ(nx, ny + ay, nz + az); }
              else { s1 = occ(nx + ax, ny, nz); s2 = occ(nx, ny + ay, nz); cr = occ(nx + ax, ny + ay, nz); }
              ao = s1 && s2 ? 0 : 3 - (s1 + s2 + cr);
            }
            const l = F.s * AOL[ao] * (D.light ? 1.25 : 1);
            COL.push(l, l, l);
          }
          IDXA.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }
      }
      if (ch.mesh) { scene.remove(ch.mesh); ch.mesh.geometry.dispose(); ch.mesh = null; }
      if (IDXA.length) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(POS, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(COL, 3));
        geo.setIndex(IDXA); geo.computeBoundingSphere();
        const m = new THREE.Mesh(geo, chunkMat); m.matrixAutoUpdate = false; scene.add(m); ch.mesh = m;
      }
      ch.dirty = false;
    }
    function markBlock(x, y, z) {
      const mk = (a, b, c) => { if (a < 0 || b < 0 || c < 0 || a >= WX || b >= WY || c >= WZ) return; chunks[((b / CS) | 0) * NCX * NCZ + ((c / CS) | 0) * NCX + ((a / CS) | 0)].dirty = true; };
      mk(x, y, z); mk(x + 1, y, z); mk(x - 1, y, z); mk(x, y + 1, z); mk(x, y - 1, z); mk(x, y, z + 1); mk(x, y, z - 1);
    }
    function syncWorld(S, budget) {
      if (SIM !== S) { SIM = S; for (const c of chunks) c.dirty = true; budget = 999; }
      const d = S.dirty;
      for (let i = 0; i < d.length; i += 3) markBlock(d[i], d[i + 1], d[i + 2]);
      d.length = 0;
      let n = 0;
      for (let i = 0; i < chunks.length && n < budget; i++) if (chunks[i].dirty) { buildChunk(i); n++; }
      return n;
    }

    const hl = new THREE.LineSegments(own(new THREE.EdgesGeometry(own(new THREE.BoxGeometry(1.004, 1.004, 1.004)))), own(new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 })));
    hl.visible = false; scene.add(hl);
    const crackG = own(new THREE.BoxGeometry(1.006, 1.006, 1.006));
    const crackM = own(new THREE.MeshBasicMaterial({ map: atlas, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    const crack = new THREE.Mesh(crackG, crackM); crack.visible = false; scene.add(crack);
    let crackStage = -1;
    function setCrack(x, y, z, p, h) {
      if (p <= 0) { crack.visible = false; return; }
      crack.visible = true; crack.position.set(x + 0.5, y + h / 2, z + 0.5); crack.scale.set(1, h, 1);
      const st = Math.min(9, (p * 10) | 0);
      if (st !== crackStage) { crackStage = st; const t = TILE['k' + st], tu = (t % 16) * 16, tv = ((t / 16) | 0) * 16; const uv = crackG.attributes.uv; for (let i = 0; i < uv.count; i++) { const u0 = i % 2 === 0 ? 0 : 1, v0 = ((i % 4) < 2) ? 1 : 0; uv.setXY(i, (tu + 0.02 + u0 * 15.96) / 256, 1 - (tv + 0.02 + (1 - v0) * 15.96) / 64); } uv.needsUpdate = true; }
    }

    function skinCanvas(hero, team, armor) {
      const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
      const H = HEROES[hero % HEROES.length], tcol = team >= 0 ? TEAMS[team].c : '#7a5230';
      const R = rngS(hero * 31 + 7);
      const rect = (a, b, w, h, cl, n = 10) => { const [r, g, bb] = hexRgb(cl); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const k = (R() - 0.5) * n; x.fillStyle = `rgb(${clamp(r + k, 0, 255) | 0},${clamp(g + k, 0, 255) | 0},${clamp(bb + k, 0, 255) | 0})`; x.fillRect(a + i, b + j, 1, 1); } };
      const box = (u, v, w, h, d, cl) => { rect(u + d, v, w, d, cl); rect(u + d + w, v, w, d, cl); rect(u, v + d, d + w + d + w, h, cl); };
      box(0, 0, 8, 8, 8, H.skin);
      rect(8, 0, 8, 8, H.hair); rect(0, 8, 32, 2, H.hair); rect(24, 8, 8, 6, H.hair); rect(0, 8, 2, 5, H.hair); rect(14, 8, 4, 4, H.hair);
      rect(9, 12, 2, 1, '#ffffff', 0); rect(13, 12, 2, 1, '#ffffff', 0); rect(10, 12, 1, 1, H.eye, 0); rect(13, 12, 1, 1, H.eye, 0);
      rect(11, 14, 2, 1, '#8a5a4a', 0); rect(10, 15, 4, 1, '#a0605a', 4);
      const shirt = armor >= 0 ? tcol : H.shirt, legs = armor <= 0 ? (armor < 0 ? H.pants : tcol) : ['#000', '#8a8a8a', '#d8d8d8', '#5fe8e8'][armor];
      box(16, 16, 8, 12, 4, shirt); box(40, 16, 4, 12, 4, shirt); box(32, 48, 4, 12, 4, shirt);
      rect(44, 26, 4, 2, H.skin); rect(40, 26, 16, 2, H.skin); rect(32, 58, 16, 2, H.skin); rect(48, 16, 4, 4, H.skin); rect(40, 52, 4, 4, H.skin);
      box(0, 16, 4, 12, 4, legs); box(16, 48, 4, 12, 4, legs);
      rect(0, 28, 16, 0, '#000'); rect(4, 26, 12, 2, '#3a2a1a'); rect(16, 58, 16, 2, '#3a2a1a');
      if (armor >= 0) { rect(20, 26, 8, 1, TEAMS[Math.max(0, team)].d, 0); rect(18, 20, 4, 4, '#ffffff', 30); }
      if (team < 0) { rect(20, 20, 8, 8, '#e8d8b0'); rect(16, 28, 0, 0, '#000'); rect(8, 0, 8, 8, '#3a8a3a'); rect(0, 8, 32, 1, '#3a8a3a'); }
      return c;
    }
    const boxUV = (geo, u, v, w, h, d) => {
      const r = (a, b, ww, hh) => [a / 64, 1 - b / 64, (a + ww) / 64, 1 - (b + hh) / 64];
      const F = [r(u, v + d, d, h), r(u + d + w, v + d, d, h), r(u + d, v, w, d), r(u + d + w, v, w, d), r(u + d + w + d, v + d, w, h), r(u + d, v + d, w, h)];
      const uv = geo.attributes.uv;
      for (let f = 0; f < 6; f++) { const [a, b, c2, d2] = F[f]; uv.setXY(f * 4, a, b); uv.setXY(f * 4 + 1, c2, b); uv.setXY(f * 4 + 2, a, d2); uv.setXY(f * 4 + 3, c2, d2); }
      uv.needsUpdate = true;
      return geo;
    };
    const PX = 1.8 / 32;
    const partG = {
      head: own(boxUV(new THREE.BoxGeometry(8 * PX, 8 * PX, 8 * PX), 0, 0, 8, 8, 8)), body: own(boxUV(new THREE.BoxGeometry(8 * PX, 12 * PX, 4 * PX), 16, 16, 8, 12, 4)),
      armR: own(boxUV(new THREE.BoxGeometry(4 * PX, 12 * PX, 4 * PX), 40, 16, 4, 12, 4)), armL: own(boxUV(new THREE.BoxGeometry(4 * PX, 12 * PX, 4 * PX), 32, 48, 4, 12, 4)),
      legR: own(boxUV(new THREE.BoxGeometry(4 * PX, 12 * PX, 4 * PX), 0, 16, 4, 12, 4)), legL: own(boxUV(new THREE.BoxGeometry(4 * PX, 12 * PX, 4 * PX), 16, 48, 4, 12, 4))
    };
    Object.values(partG).forEach(g => g.translate(0, 0, 0));
    const itemGeo = new Map();
    function itemMesh(key) {
      if (itemGeo.has(key)) return itemGeo.get(key);
      let geo;
      if (key.startsWith('b:')) {
        const id = key === 'b:tnt' ? -1 : +key.slice(2);
        geo = new THREE.BoxGeometry(1, 1, 1);
        const uv = geo.attributes.uv;
        for (let f = 0; f < 6; f++) { const tile = id < 0 ? (f === 2 || f === 3 ? TILE.tntT : TILE.tntS) : faceTile(id, f === 2 ? 0 : f === 3 ? 1 : 2), tu = (tile % 16) * 16, tv = ((tile / 16) | 0) * 16; for (let k = 0; k < 4; k++) { const u0 = k % 2, v0 = k < 2 ? 0 : 1; uv.setXY(f * 4 + k, (tu + 0.02 + u0 * 15.96) / 256, 1 - (tv + 0.02 + v0 * 15.96) / 64); } }
        geo = { geo: own(geo), mat: own(new THREE.MeshLambertMaterial({ map: atlas, alphaTest: 0.5 })), block: true };
      } else {
        const sp = sprite(key), d = sp.getContext('2d').getImageData(0, 0, 16, 16).data, P = [], C = [], N = [];
        const op = (i, j) => i >= 0 && j >= 0 && i < 16 && j < 16 && d[(j * 16 + i) * 4 + 3] > 128;
        const q = (a, b, c2, dd, n, cl) => { for (const v of [a, b, c2, a, c2, dd]) { P.push(...v); N.push(...n); C.push(...cl); } };
        for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
          if (!op(i, j)) continue;
          const o = (j * 16 + i) * 4, cl = new THREE.Color(`rgb(${d[o]},${d[o + 1]},${d[o + 2]})`).convertSRGBToLinear(), c3 = [cl.r, cl.g, cl.b], dk = [cl.r * 0.7, cl.g * 0.7, cl.b * 0.7];
          const x0 = i / 16 - 0.5, x1 = (i + 1) / 16 - 0.5, y0 = 0.5 - (j + 1) / 16, y1 = 0.5 - j / 16, z0 = -1 / 32, z1 = 1 / 32;
          q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], c3);
          q([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], c3);
          if (!op(i - 1, j)) q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], dk);
          if (!op(i + 1, j)) q([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], dk);
          if (!op(i, j - 1)) q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], dk);
          if (!op(i, j + 1)) q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], dk);
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
        geo = { geo: own(g), mat: null, block: false };
      }
      itemGeo.set(key, geo);
      return geo;
    }
    const itemMat = own(new THREE.MeshLambertMaterial({ vertexColors: true }));
    function makeItemObj(key) {
      const g = itemMesh(key);
      const m = new THREE.Mesh(g.geo, g.mat || itemMat);
      return m;
    }
    function makeChar(hero, team, armor, npc) {
      const tex = own(new THREE.CanvasTexture(skinCanvas(hero, team, armor))); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.encoding = THREE.sRGBEncoding;
      const mat = own(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5 }));
      const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
      const part = (g, x, y, z, pivotY) => { const gp = new THREE.Group(); gp.position.set(x, y, z); const m = new THREE.Mesh(g, mat); m.position.y = -pivotY; gp.add(m); body.add(gp); return gp; };
      const legR = part(partG.legR, 2 * PX, 12 * PX, 0, 6 * PX), legL = part(partG.legL, -2 * PX, 12 * PX, 0, 6 * PX);
      const torso = new THREE.Group(); torso.position.y = 12 * PX; body.add(torso);
      const bm = new THREE.Mesh(partG.body, mat); bm.position.y = 6 * PX; torso.add(bm);
      const tp = (g, x, y, pivotY) => { const gp = new THREE.Group(); gp.position.set(x, y, 0); const m = new THREE.Mesh(g, mat); m.position.y = -pivotY; gp.add(m); torso.add(gp); return gp; };
      const armR = tp(partG.armR, 6 * PX, 11 * PX, 5 * PX), armL = tp(partG.armL, -6 * PX, 11 * PX, 5 * PX);
      const head = new THREE.Group(); head.position.y = 12 * PX; torso.add(head);
      const hm = new THREE.Mesh(partG.head, mat); hm.position.y = 4 * PX; head.add(hm);
      const hand = new THREE.Group(); hand.position.set(0, -10 * PX, -1 * PX); armR.add(hand);
      const tagC = document.createElement('canvas'); tagC.width = 256; tagC.height = 48;
      const tagT = own(new THREE.CanvasTexture(tagC)); tagT.minFilter = THREE.LinearFilter;
      const tag = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: tagT, depthTest: true, transparent: true, fog: false })));
      tag.scale.set(1.6, 0.3, 1); tag.position.y = npc ? 2.35 : 2.15; root.add(tag);
      scene.add(root);
      return { root, body, torso, head, armR, armL, legR, legL, hand, mat, tex, tag, tagC, tagT, tagTxt: '', held: null, heldKey: '', ph: 0, sw: 0, hero, team, armor };
    }
    function setTag(ch, txt, color, sub) {
      const k = txt + color + (sub || ''); if (ch.tagTxt === k) return; ch.tagTxt = k;
      const x = ch.tagC.getContext('2d'); x.clearRect(0, 0, 256, 48);
      x.font = '700 26px "Pixelify Sans", Consolas, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const w = Math.min(250, x.measureText(txt).width + 14); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(128 - w / 2, sub ? 0 : 8, w, sub ? 26 : 32);
      x.fillStyle = color; x.fillText(txt, 128, sub ? 13 : 24);
      if (sub) { x.font = '700 18px "Pixelify Sans", Consolas, monospace'; x.fillStyle = '#ffd23f'; x.fillText(sub, 128, 38); }
      ch.tagT.needsUpdate = true;
    }
    function setSkin(ch, hero, team, armor) {
      if (ch.hero === hero && ch.team === team && ch.armor === armor) return;
      ch.hero = hero; ch.team = team; ch.armor = armor;
      ch.tex.image = skinCanvas(hero, team, armor); ch.tex.needsUpdate = true;
    }
    function setHeld(ch, key) {
      if (ch.heldKey === key) return; ch.heldKey = key;
      if (ch.held) { ch.hand.remove(ch.held); ch.held = null; }
      if (!key) return;
      const m = makeItemObj(key);
      if (key.startsWith('b:')) { m.scale.setScalar(0.28); m.position.set(0, -0.05, -0.12); m.rotation.set(0.3, 0.8, 0); }
      else { m.scale.setScalar(0.62); m.position.set(0, 0.0, -0.22); m.rotation.set(-Math.PI / 2 + 0.2, Math.PI / 2, 0); if (key.startsWith('bow')) m.rotation.set(-Math.PI / 2, Math.PI / 2, -0.5); }
      ch.hand.add(m); ch.held = m;
    }
    function animChar(ch, p, dt) {
      const sp = Math.hypot(p.vx, p.vz);
      ch.ph += dt * sp * 2.2; ch.sw = damp(ch.sw, sp > 0.3 && p.onG ? Math.min(1, sp / WALK) : 0, 12, dt);
      const s = Math.sin(ch.ph) * 0.9 * ch.sw;
      ch.legR.rotation.x = s; ch.legL.rotation.x = -s;
      const sn = p.sneak ? 1 : 0;
      ch.torso.rotation.x = damp(ch.torso.rotation.x, sn * 0.45, 14, dt); ch.body.position.y = damp(ch.body.position.y, -sn * 0.12, 14, dt);
      ch.head.rotation.x = clamp(p.pitch, -1.4, 1.4) - ch.torso.rotation.x;
      const swing = p.swingT > 0 ? Math.sin((0.25 - p.swingT) / 0.25 * Math.PI) : 0;
      ch.armR.rotation.x = -s * 0.8 + swing * 1.4 + (ch.heldKey ? 0.3 : 0) + (p.bowT > 0 ? 1.4 : 0) + (p.eatT > 0 ? 1.1 + Math.sin(p.eatT * 20) * 0.15 : 0);
      ch.armL.rotation.x = s * 0.8 + (p.bowT > 0 ? 1.4 : 0); ch.armL.rotation.z = p.bowT > 0 ? -0.4 : 0;
      ch.armR.rotation.z = 0.05; if (p.bowT <= 0) ch.armL.rotation.z = -0.05;
    }

    const fp = new THREE.Scene();
    fp.add(new THREE.AmbientLight(0xffffff, 0.75)); const fl = new THREE.DirectionalLight(0xffffff, 0.45); fl.position.set(0.3, 1, 0.5); fp.add(fl);
    const fpCam = new THREE.PerspectiveCamera(70, Vw.w / Vw.h, 0.01, 10);
    const fpArm = new THREE.Group(); fp.add(fpArm);
    let fpMat = null, fpArmMesh = null, fpItem = null, fpKey = '?', fpSkinK = '';
    function fpSetup(hero, team, armor) {
      const k = hero + ':' + team + ':' + armor; if (k === fpSkinK) return; fpSkinK = k;
      if (!fpMat) { const t = own(new THREE.CanvasTexture(skinCanvas(hero, team, armor))); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.encoding = THREE.sRGBEncoding; fpMat = own(new THREE.MeshLambertMaterial({ map: t })); fpArmMesh = new THREE.Mesh(partG.armR, fpMat); fpArm.add(fpArmMesh); }
      else { fpMat.map.image = skinCanvas(hero, team, armor); fpMat.map.needsUpdate = true; }
    }
    function fpHeld(key) {
      if (key === fpKey) return; fpKey = key;
      if (fpItem) { fpArm.remove(fpItem); fpItem = null; }
      if (fpArmMesh) fpArmMesh.visible = !key;
      if (!key) return;
      const m = makeItemObj(key);
      if (key.startsWith('b:')) { m.scale.setScalar(0.26); m.rotation.set(0.12, 0.78, 0); }
      else if (key === 'bow') { m.scale.setScalar(0.6); m.rotation.set(0, -0.5, 0.8); }
      else if (key === 'gapple' || key === 'fire' || key === 'pearl' || key.startsWith('egg')) { m.scale.setScalar(0.36); m.rotation.set(0, -0.5, 0); }
      else { m.scale.setScalar(0.58); m.rotation.set(0, -0.6, 1.2); }
      fpArm.add(m); fpItem = m;
    }
    function fpPose(p, dt, bob, swing, place) {
      const sw = Math.sin(swing * Math.PI), sw2 = Math.sin(Math.sqrt(swing) * Math.PI);
      const key = fpKey;
      if (!key) { fpArm.position.set(0.42 - sw2 * 0.2, -0.46 + Math.sin(bob * 2) * 0.012 - sw * 0.1, -0.62 - sw * 0.25); fpArm.rotation.set(-1.0 + sw * 0.6, -0.1 + sw2 * 0.6, 0.18); fpArmMesh.position.set(0, 0, 0); return; }
      const bx = Math.sin(bob) * 0.02, by = -Math.abs(Math.cos(bob)) * 0.02;
      if (key.startsWith('b:')) { fpArm.position.set(0.52 + bx - sw2 * 0.15, -0.46 + by - place * 0.1 - sw * 0.1, -0.86 - sw * 0.15); fpArm.rotation.set(sw * -0.6, -sw2 * 0.4, 0); }
      else if (key === 'bow') { const d = Math.min(1, p.bowT); fpArm.position.set(0.4 - d * 0.2, -0.42 + d * 0.06, -0.85 + d * 0.1); fpArm.rotation.set(0, 0.2, 0.3 - d * 0.3); }
      else if (p.eatT > 0) { fpArm.position.set(0.15, -0.32 + Math.sin(p.eatT * 22) * 0.02, -0.5); fpArm.rotation.set(0.2, 0.6, 0.2); }
      else { fpArm.position.set(0.56 + bx - sw2 * 0.25, -0.5 + by - sw * 0.1, -0.92 - sw * 0.15); fpArm.rotation.set(-sw * 1.1, sw2 * 0.6, sw * 0.2); }
    }
    const NI = 160;
    const resIM = [0, 1, 2, 3].map(r => { const g = itemMesh('res:' + r); const im = new THREE.InstancedMesh(g.geo, itemMat, NI); im.count = 0; im.frustumCulled = false; scene.add(im); return im; });
    const genBlocks = [];
    const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E4 = new THREE.Euler(), P4 = new THREE.Vector3(), S4 = new THREE.Vector3(1, 1, 1);
    function drawGens(S, t) {
      const n = [0, 0, 0, 0];
      for (const g of S.gens) {
        if (!g.n) continue;
        const im = resIM[g.type];
        for (let k = 0; k < Math.min(g.n, 5); k++) {
          if (n[g.type] >= NI) break;
          const a = t * 1.6 + k * 1.3, r = k ? 0.25 : 0;
          E4.set(0, a, 0); Q4.setFromEuler(E4); P4.set(g.x + Math.cos(k * 2.1) * r, g.y + 0.3 + Math.sin(t * 2 + k) * 0.06 + k * 0.04, g.z + Math.sin(k * 2.1) * r); S4.setScalar(0.45); M4.compose(P4, Q4, S4); im.setMatrixAt(n[g.type]++, M4);
        }
      }
      S4.setScalar(1);
      resIM.forEach((im, i) => { im.count = n[i]; im.instanceMatrix.needsUpdate = true; });
      for (const gb of genBlocks) { gb.m.rotation.y = t * 1.2; gb.m.position.y = gb.y + Math.sin(t * 1.5) * 0.15; }
    }
    function setupGens(S) {
      for (const gb of genBlocks) scene.remove(gb.m);
      genBlocks.length = 0;
      for (const g of S.gens) if (g.team < 0) { const m = makeItemObj('b:' + (g.type === 2 ? 26 : 27)); m.scale.setScalar(0.6); m.position.set(g.x, g.y + 2.4, g.z); scene.add(m); genBlocks.push({ m, y: g.y + 2.4, g }); }
    }
    const ENTS = new Map();
    function syncEnts(S, t) {
      const seen = new Set();
      for (const en of S.ents) {
        seen.add(en.id);
        let o = ENTS.get(en.id);
        if (!o) {
          let m;
          if (en.type === 'tnt') { m = makeItemObj('b:tnt'); m.position.set(en.x, en.y + 0.5, en.z); }
          else if (en.type === 'arrow') { m = makeItemObj('arrow'); m.scale.setScalar(0.6); }
          else { m = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: own(new THREE.CanvasTexture(sprite(en.type === 'fire' ? 'fire' : en.type === 'pearl' ? 'pearl' : 'egg:' + en.team))), transparent: true }))); m.material.map.magFilter = THREE.NearestFilter; m.scale.setScalar(en.type === 'fire' ? 0.9 : 0.35); }
          scene.add(m); o = { m }; ENTS.set(en.id, o);
        }
        if (en.type !== 'tnt') { o.m.position.set(en.x, en.y, en.z); if (en.type === 'arrow') { const sp = Math.hypot(en.vx, en.vz); o.m.rotation.set(0, Math.atan2(en.vx, en.vz) + Math.PI / 2, 0); o.m.rotateZ(Math.atan2(en.vy, sp) - Math.PI / 4); } }
        else { const f = en.fuse < 1 ? (Math.sin(t * 30) > 0) : (Math.sin(t * 10) > 0.6); o.m.scale.setScalar(1 + (en.fuse < 0.4 ? (0.4 - en.fuse) * 0.4 : 0)); o.m.material.emissive && o.m.material.emissive.setScalar(f ? 0.6 : 0); }
      }
      for (const [id, o] of ENTS) if (!seen.has(id)) { scene.remove(o.m); ENTS.delete(id); }
    }
    const PN = 700, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN);
    const pGeo = own(new THREE.BufferGeometry()); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pts = new THREE.Points(pGeo, own(new THREE.PointsMaterial({ size: 0.12, vertexColors: true })));
    pts.frustumCulled = false; scene.add(pts);
    for (let i = 0; i < PN; i++) pPos[i * 3 + 1] = -999;
    let pi = 0;
    const C4 = new THREE.Color();
    const tileAvg = new Map();
    function blockColor(id) {
      if (tileAvg.has(id)) return tileAvg.get(id);
      const t = faceTile(id, 2), x = atlasC.getContext('2d').getImageData((t % 16) * 16, ((t / 16) | 0) * 16, 16, 16).data; let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < x.length; i += 4) if (x[i + 3] > 100) { r += x[i]; g += x[i + 1]; b += x[i + 2]; n++; }
      const c = '#' + [r, g, b].map(v => ((v / Math.max(1, n)) | 0).toString(16).padStart(2, '0')).join('');
      tileAvg.set(id, c); return c;
    }
    function burst(x, y, z, hex, n, spd, life) {
      C4.set(hex).convertSRGBToLinear();
      for (let k = 0; k < n; k++) { const i = pi; pi = (pi + 1) % PN; pPos[i * 3] = x + (Math.random() - 0.5) * 0.6; pPos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.6; pPos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.6; pVel[i * 3] = (Math.random() - 0.5) * spd; pVel[i * 3 + 1] = Math.random() * spd; pVel[i * 3 + 2] = (Math.random() - 0.5) * spd; pLife[i] = (life || 0.5) * (0.6 + Math.random() * 0.6); const v = 0.8 + Math.random() * 0.3; pCol[i * 3] = C4.r * v; pCol[i * 3 + 1] = C4.g * v; pCol[i * 3 + 2] = C4.b * v; }
      pGeo.attributes.color.needsUpdate = true;
    }
    function fxStep(dt) {
      let any = false;
      for (let i = 0; i < PN; i++) { if (pLife[i] <= 0) continue; any = true; pLife[i] -= dt; if (pLife[i] <= 0) { pPos[i * 3 + 1] = -999; continue; } pVel[i * 3 + 1] -= 14 * dt; pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt; }
      if (any) pGeo.attributes.position.needsUpdate = true;
    }
    return {
      scene, cam, fp, fpCam, syncWorld, hl, setCrack, makeChar, setTag, setSkin, setHeld, animChar, fpSetup, fpHeld, fpPose, drawGens, setupGens, syncEnts, burst, blockColor, fxStep, atlasC, clouds: cloudM,
      resetWorld() { SIM = null; for (const c of chunks) { if (c.mesh) { scene.remove(c.mesh); c.mesh.geometry.dispose(); c.mesh = null; } c.dirty = true; } for (const [id, o] of ENTS) scene.remove(o.m); ENTS.clear(); },
      dispose() { this.resetWorld(); for (const x of bin) { try { x.dispose(); } catch (e) {} } }
    };
  }

  function loadPrefs(api) {
    let s = null; try { s = api.load(); } catch (e) { s = null; }
    const o = s && typeof s === 'object' && !Array.isArray(s) ? s : {};
    const num = (v, a, b, d) => (typeof v === 'number' && isFinite(v) && v >= a && v <= b ? v : d), int = (v, a, b, d) => (Number.isInteger(v) && v >= a && v <= b ? v : d);
    return { v: 1, hero: int(o.hero, 0, HEROES.length - 1, 0), teams: int(o.teams, 2, 4, 4), size: int(o.size, 1, 2, 1), lvl: int(o.lvl, 0, 3, 1), sens: num(o.sens, 0.2, 3, 1), inv: o.inv === true, fov: int(o.fov, 60, 100, 75), autoSprint: o.autoSprint !== false, bob: o.bob !== false, wins: int(o.wins, 0, 1e7, 0), games: int(o.games, 0, 1e7, 0), finals: int(o.finals, 0, 1e8, 0), beds: int(o.beds, 0, 1e8, 0), kills: int(o.kills, 0, 1e8, 0), hw: int(o.hw, 0, 1e7, 0) };
  }
  const heartURL = (() => {
    const mk = f => { const c = document.createElement('canvas'); c.width = 9; c.height = 9; const x = c.getContext('2d'); f(x); return c.toDataURL(); };
    const H = ['..##.##..', '.#..#..#.', '#.......#', '#.......#', '#.......#', '.#.....#.', '..#...#..', '...#.#...', '....#....'];
    const draw = (x, fillL, fillR, out, hi) => { for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const ch = H[j][i]; const inside = (() => { if (ch === '#') return 2; let l = H[j].indexOf('#'), r = H[j].lastIndexOf('#'); return i > l && i < r ? 1 : 0; })(); if (!inside) continue; x.fillStyle = inside === 2 ? out : (i < 5 ? fillL : fillR); if (inside === 1 && (!fillL && i < 5 || !fillR && i >= 5)) continue; x.fillRect(i, j, 1, 1); } if (hi && fillL) { x.fillStyle = hi; x.fillRect(2, 2, 1, 1); x.fillRect(3, 2, 1, 1); } };
    return {
      full: mk(x => draw(x, '#e8282b', '#e8282b', '#1a0000', '#ff9a9a')), half: mk(x => draw(x, '#e8282b', '#3a1a1a', '#1a0000', '#ff9a9a')), empty: mk(x => draw(x, '#3a1a1a', '#3a1a1a', '#1a0000')),
      gold: mk(x => draw(x, '#f2c230', '#f2c230', '#3a2a00', '#fff2a0')), goldH: mk(x => draw(x, '#f2c230', '#3a2a00', '#3a2a00', '#fff2a0')),
      armF: mk(x => { x.fillStyle = '#1a1a1a'; x.fillRect(1, 0, 7, 9); x.fillStyle = '#d8d8d8'; x.fillRect(2, 1, 5, 7); x.fillStyle = '#1a1a1a'; x.fillRect(4, 0, 1, 2); }),
      armH: mk(x => { x.fillStyle = '#1a1a1a'; x.fillRect(1, 0, 7, 9); x.fillStyle = '#d8d8d8'; x.fillRect(2, 1, 2, 7); x.fillStyle = '#3a3a3a'; x.fillRect(5, 1, 2, 7); }),
      armE: mk(x => { x.fillStyle = '#1a1a1a'; x.fillRect(1, 0, 7, 9); x.fillStyle = '#3a3a3a'; x.fillRect(2, 1, 5, 7); })
    };
  })();
  const keyName = new Map();
  try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => { for (const c of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyV', 'KeyQ']) { const v = m.get(c); if (v) keyName.set(c, v.toUpperCase()); } }).catch(() => {}); } catch (e) {}
  const keyLabel = c => keyName.get(c) || c.replace(/^Key/, '').replace(/^Digit/, '');

  function run(root, wrap, api, Vw) {
    const { THREE, renderer, canvas } = Vw;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
    canvas.style.width = '100%'; wrap.append(canvas);
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.NoToneMapping;
    const view = makeView(THREE, Vw, api);
    fitPR(api, Vw);
    renderer.autoClear = true;
    const audio = makeAudio(api);
    const prefs = loadPrefs(api);
    const persist = () => api.save(prefs);
    const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.append(e); return e; };
    const ui = el('div', 'ui px', wrap); ui.setAttribute('data-i18n', '');
    const hud = el('div', 'hud', ui); hud.hidden = true;
    const hurtEl = el('div', 'hurt', hud), xh = el('div', 'xh', hud), gensEl = el('div', 'gens', hud);
    const stat = el('div', 'stat', hud), hearts = el('div', 'hearts', stat), armr = el('div', 'armr', stat);
    const heartEls = [], armEls = [];
    for (let i = 0; i < 12; i++) { const h = el('i', '', hearts); heartEls.push(h); }
    for (let i = 0; i < 10; i++) armEls.push(el('i', '', armr));
    const hb = el('div', 'hb', hud), slots = [];
    for (let i = 0; i < 9; i++) { const s = el('div', 'hs', hb); s.dataset.i = i; const c = document.createElement('canvas'); c.width = 32; c.height = 32; s.append(c); const b = el('b', '', s); slots.push({ s, c, b, key: '', n: -1 }); }
    const resb = el('div', 'resb', hud), resEls = RES.map((r, i) => { const d = el('div', '', resb); const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.getContext('2d').drawImage(sprite('res:' + i), 0, 0); d.append(c); const b = el('b', '', d, '0'); return { d, b }; });
    const sb = el('div', 'sb', hud), chat = el('div', 'chat', hud), ttl = el('div', 'ttl', hud, '<b></b><span></span>'), act = el('div', 'act', hud);
    const pzBtn = el('button', 'pz', hud, '<i></i>'); pzBtn.setAttribute('aria-label', 'Pause');
    const shopBtn = el('button', 'shopb', hud, 'Shop'); shopBtn.hidden = true;
    const netEl = el('div', 'net', hud); netEl.hidden = true;
    const gl = []; for (let i = 0; i < 8; i++) { const d = el('div', '', gensEl); d.hidden = true; gl.push(d); }
    const tc = el('div', 'tc', wrap); tc.hidden = true;
    const joy = el('div', 'joy idle', tc, '<i></i>'), knob = joy.firstChild;
    const tb = (txt, r, b, cls) => { const e = el('button', 'tb ' + (cls || ''), tc, txt); e.style.right = r + 'px'; e.style.bottom = b + 'px'; return e; };
    const tAtk = tb('Hit', 14, 116, 'big'), tUse = tb('Use', 82, 128, 'big'), tJump = tb('Jump', 14, 58), tSneak = tb('Sneak', 70, 58), tView = tb('View', 126, 58);
    const scr = el('div', 'scr', ui);

    let S = null, me = null, phase = 'home', paused = false, acc = 0, chars = [], npcChars = [], online = null, cfgM = null, endT = 0, view3 = false, shopOpen = '', shopTab = 0, spec = -1, lastHearts = '', camT = 0, homeT = 0, homeS = null;
    const look = { yaw: 0, pitch: 0 };
    const keys = new Set();
    let mouse0 = false, mouse2 = false, locked = false, touchOn = COARSE, tA = false, tU = false, tSn = false, lastW = 0, sprintKey = false, bob = 0, swingV = 0, placeV = 0;
    const joyV = { x: 0, y: 0 };
    if (touchOn) wrap.classList.add('touch');
    const myName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); const n = p && (p.username || p.displayName); if (n) return String(n).slice(0, 16); } catch (e) {} return T('You'); };
    const heroURL = i => { const c = document.createElement('canvas'); c.width = 8; c.height = 8; const x = c.getContext('2d'); const H = HEROES[i]; x.fillStyle = H.skin; x.fillRect(0, 0, 8, 8); x.fillStyle = H.hair; x.fillRect(0, 0, 8, 2); x.fillRect(0, 2, 1, 2); x.fillRect(7, 2, 1, 2); x.fillStyle = '#fff'; x.fillRect(1, 4, 2, 1); x.fillRect(5, 4, 2, 1); x.fillStyle = H.eye; x.fillRect(2, 4, 1, 1); x.fillRect(5, 4, 1, 1); x.fillStyle = '#8a5a4a'; x.fillRect(3, 6, 2, 1); return c.toDataURL(); };
    const HURL = HEROES.map((h, i) => heroURL(i));
    function setScr(html, cls) { scr.className = 'scr' + (cls ? ' ' + cls : ''); scr.innerHTML = html; scr.hidden = !html; const f = scr.querySelector('.btn.go,.btn'); if (f && !touchOn) try { f.focus({ preventScroll: true }); } catch (e) {} }
    const opt = (k, list) => list.map(([v, n]) => `<button class="opt${prefs[k] === v ? ' on' : ''}" data-k="${k}" data-v="${typeof v === 'string' ? "'" + v : v}">${n}</button>`).join('');
    function homeHtml() {
      return `<div class="title">Bed Raiders<small>${T('PROTECT YOUR BED · BREAK THEIRS')}</small></div>
      <div class="stats"><span>${T('Wins')}: ${prefs.wins}</span><span>${T('Final kills')}: ${prefs.finals}</span><span>${T('Beds broken')}: ${prefs.beds}</span></div>
      <div class="home"><div class="pan">
        <div class="optrow"><span>Teams</span><div class="opts">${opt('teams', [[2, '2 teams'], [3, '3 teams'], [4, '4 teams']])}</div></div>
        <div class="optrow"><span>Players per team</span><div class="opts">${opt('size', [[1, 'Solo'], [2, 'Duos']])}</div></div>
        <div class="optrow"><span>Bots</span><div class="opts">${opt('lvl', LVL.map((l, i) => [i, l.n]))}</div></div>
        <div class="optrow"><span>Skin</span><div class="heroes">${HEROES.map((h, i) => `<button class="hero${i === prefs.hero ? ' on' : ''}" data-h="${i}" style="background-image:url(${HURL[i]})" aria-label="${h.n}"></button>`).join('')}</div></div>
        <div class="btns"><button class="btn go" data-a="play">Play</button><button class="btn" data-a="online">Play online</button><button class="btn" data-a="settings">Settings</button><button class="btn" data-a="controls">Controls</button></div>
      </div></div>`;
    }
    function controlsHtml(back) {
      const k = c => `<kbd>${esc(keyLabel(c))}</kbd>`;
      return `<div class="pan"><h2>Controls</h2><div class="keys">
        <span>${k('KeyW')} ${k('KeyA')} ${k('KeyS')} ${k('KeyD')}</span><span>Move</span><span><kbd>Space</kbd></span><span>Jump</span>
        <span><kbd>Shift</kbd></span><span>Sneak: you cannot fall off edges while sneaking, which keeps you safe when bridging</span>
        <span><kbd>Ctrl</kbd></span><span>Sprint (or double tap forward)</span>
        <span><i class="kk">Left click</i></span><span>Hit, or hold to break a block</span><span><i class="kk">Right click</i></span><span>Place a block, use an item, talk to a shopkeeper</span>
        <span><kbd>1</kbd>-<kbd>9</kbd> <i class="kk">Wheel</i></span><span>Choose a hotbar slot</span>
        <span>${k('KeyE')}</span><span>Open the shop when you stand near a shopkeeper</span>
        <span><kbd>F5</kbd> ${k('KeyV')}</span><span>First or third person</span><span><kbd>Esc</kbd></span><span>Pause</span>
        <span><i class="kk">Touch</i></span><span>Left stick moves, drag to look, Hit and Use buttons, tap the hotbar</span>
      </div><div class="btns"><button class="btn go" data-a="${back}">Back</button></div></div>`;
    }
    function settingsHtml(back) {
      return `<div class="pan"><h2>Settings</h2>
        <div class="optrow"><span>Mouse sensitivity</span><input type="range" min="0.2" max="3" step="0.05" value="${prefs.sens}" data-r="sens" aria-label="Mouse sensitivity"></div>
        <div class="optrow"><span>Field of view</span><input type="range" min="60" max="100" step="1" value="${prefs.fov}" data-r="fov" aria-label="Field of view"></div>
        <div class="optrow"><span>Invert mouse</span><div class="opts">${opt('inv', [[false, 'Off'], [true, 'On']])}</div></div>
        <div class="optrow"><span>Auto sprint</span><div class="opts">${opt('autoSprint', [[true, 'On'], [false, 'Off']])}</div></div>
        <div class="optrow"><span>View bobbing</span><div class="opts">${opt('bob', [[true, 'On'], [false, 'Off']])}</div></div>
        <div class="btns"><button class="btn go" data-a="${back}">Back</button></div></div>`;
    }
    const pauseHtml = () => `<div class="pan" style="width:min(92%,24em);text-align:center"><h2>Game menu</h2>${online ? `<p>${T('The match keeps running online.')}</p>` : ''}<div class="btns" style="flex-direction:column"><button class="btn go" data-a="resume">Back to game</button><button class="btn" data-a="psettings">Settings</button><button class="btn" data-a="pcontrols">Controls</button><button class="btn" data-a="quit">${online ? 'Leave match' : 'Quit to menu'}</button></div></div>`;
    function showHome() {
      phase = 'home'; paused = false; hud.hidden = true; tc.hidden = true; unlock(); shopOpen = '';
      setScr(homeHtml(), '');
      if (!homeS) { homeS = makeSim({ teams: 4, players: [], quiet: false }); }
      view.resetWorld(); view.setupGens(homeS); clearChars();
      npcChars = homeS.npcs.map(n => { const c = view.makeChar(n.kind === 'shop' ? 2 : 4, -1, -1, true); c.root.position.set(n.x, n.y, n.z); c.root.rotation.y = n.yaw; view.setTag(c, n.kind === 'shop' ? T('ITEM SHOP') : T('TEAM UPGRADES'), '#ffffff', T('RIGHT CLICK')); return c; });
    }
    function clearChars() { for (const c of chars) c.root.parent && c.root.parent.remove(c.root); for (const c of npcChars) c.root.parent && c.root.parent.remove(c.root); chars = []; npcChars = []; }
    api.on(scr, 'click', e => {
      const b = e.target.closest('button'); if (!b) return;
      audio.wake(); audio.play('tap');
      if (b.dataset.h != null) { prefs.hero = +b.dataset.h; persist(); setScr(homeHtml()); return; }
      if (b.dataset.k) { const raw = b.dataset.v; prefs[b.dataset.k] = raw[0] === "'" ? raw.slice(1) : raw === 'true' ? true : raw === 'false' ? false : +raw; persist(); if (phase === 'home') setScr(homeHtml()); else b.parentNode.querySelectorAll('.opt').forEach(x => x.classList.toggle('on', x === b)); return; }
      if (b.dataset.buy) { doBuy(b.dataset.buy); return; }
      if (b.dataset.tab != null) { shopTab = +b.dataset.tab; renderShop(); return; }
      const a = b.dataset.a;
      if (a === 'play') startLocal();
      else if (a === 'online') goOnline();
      else if (a === 'settings') setScr(settingsHtml('home'), 'dim');
      else if (a === 'controls') setScr(controlsHtml('home'), 'dim');
      else if (a === 'home') showHome();
      else if (a === 'resume') setPause(false);
      else if (a === 'psettings') setScr(settingsHtml('pause'), 'dim');
      else if (a === 'pcontrols') setScr(controlsHtml('pause'), 'dim');
      else if (a === 'pause') setScr(pauseHtml(), 'dim');
      else if (a === 'quit') { setPause(false); leaveMatch(); }
      else if (a === 'closeshop') closeShop();
      else if (a === 'again') { if (online) netRematch(); else startLocal(); }
      else if (a === 'menu') leaveMatch();
      else if (a === 'lobby') netLobby();
    });
    api.on(scr, 'input', e => { const r = e.target.dataset && e.target.dataset.r; if (r) { prefs[r] = +e.target.value; persist(); } });
    api.on(pzBtn, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); setPause(true); });
    api.on(shopBtn, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); const n = nearNpc(); if (n) openShop(n.kind); });
    function setPause(on) {
      if (on && phase !== 'play') return;
      if (shopOpen && on) { closeShop(); return; }
      if (on === paused) { if (on) setScr(pauseHtml(), 'dim'); return; }
      paused = on; mouse0 = mouse2 = false; keys.clear(); tA = tU = false;
      if (on) { setScr(pauseHtml(), 'dim'); unlock(); } else { setScr('', ''); lock(); }
    }
    const lock = () => { if (touchOn || locked || phase !== 'play') return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
    const unlock = () => { if (locked) { try { document.exitPointerLock(); } catch (e) {} } };
    const playing = () => phase === 'play' && !paused && !shopOpen && S && me;
    let joyId = null, camId = null, jx0 = 0, jy0 = 0, lx = 0, ly = 0;
    const scaleOf = () => { const r = wrap.getBoundingClientRect(); return { r, s: r.width / (wrap.offsetWidth || r.width) }; };
    const lookMove = (dx, dy, k) => { look.yaw -= dx * k * prefs.sens; look.pitch = clamp(look.pitch - dy * k * prefs.sens * (prefs.inv ? -1 : 1), -1.55, 1.55); };
    api.on(wrap, 'contextmenu', e => e.preventDefault());
    api.on(wrap, 'pointerdown', e => {
      audio.wake();
      if (e.target.closest('button') || e.target.closest('.pan') || e.target.closest('input')) return;
      if (e.pointerType === 'touch' && !touchOn) { touchOn = true; wrap.classList.add('touch'); if (phase === 'play') tc.hidden = false; }
      if (!playing()) return;
      const hs = e.target.closest('.hs'); if (hs && touchOn) { selSlot(+hs.dataset.i); return; }
      if (e.pointerType === 'mouse') { if (!locked) lock(); return; }
      const { r, s } = scaleOf(), fx = (e.clientX - r.left) / r.width;
      if (fx < 0.45 && joyId === null) { joyId = e.pointerId; jx0 = e.clientX; jy0 = e.clientY; joy.style.left = (e.clientX - r.left) / s + 'px'; joy.style.top = (e.clientY - r.top) / s + 'px'; joy.classList.add('on'); joy.classList.remove('idle'); knob.style.transform = ''; }
      else if (camId === null) { camId = e.pointerId; lx = e.clientX; ly = e.clientY; camT = performance.now(); }
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
    });
    api.on(wrap, 'pointermove', e => {
      if (e.pointerId === joyId) { const { s } = scaleOf(); let dx = (e.clientX - jx0) / s, dy = (e.clientY - jy0) / s; const m = Math.hypot(dx, dy), R0 = 48; if (m > R0) { dx *= R0 / m; dy *= R0 / m; } joyV.x = dx / R0; joyV.y = dy / R0; knob.style.transform = `translate(${dx}px,${dy}px)`; }
      else if (e.pointerId === camId && playing()) { lookMove(e.clientX - lx, e.clientY - ly, 0.006); lx = e.clientX; ly = e.clientY; }
    });
    const endPtr = e => { if (e.pointerId === joyId) { joyId = null; joyV.x = joyV.y = 0; joy.classList.remove('on'); joy.classList.add('idle'); joy.style.left = joy.style.top = ''; knob.style.transform = ''; } if (e.pointerId === camId) { camId = null; if (performance.now() - camT < 220 && playing()) tapUse(); } };
    api.on(wrap, 'pointerup', endPtr); api.on(wrap, 'pointercancel', endPtr);
    function tapUse() { tU = true; api.timeout(() => { tU = false; }, 90); }
    api.on(document, 'mousedown', e => { if (!locked || !playing()) return; if (e.button === 0) mouse0 = true; else if (e.button === 2) { mouse2 = true; const n = lookNpc(); if (n) { mouse2 = false; openShop(n.kind); } } });
    api.on(window, 'mouseup', e => { if (e.button === 0) mouse0 = false; else if (e.button === 2) mouse2 = false; });
    api.on(document, 'pointerlockchange', () => { const was = locked; locked = document.pointerLockElement === canvas; if (was && !locked) { mouse0 = mouse2 = false; if (phase === 'play' && !paused && !shopOpen) setPause(true); } });
    api.on(document, 'mousemove', e => { if (locked && playing()) lookMove(e.movementX || 0, e.movementY || 0, 0.0024); });
    api.on(wrap, 'wheel', e => { if (!playing()) return; e.preventDefault(); selSlot((me.sel + (e.deltaY > 0 ? 1 : -1) + 9) % 9); }, { passive: false });
    api.on(window, 'blur', () => { keys.clear(); mouse0 = mouse2 = false; tA = tU = false; });
    const th = (b, on, off) => { api.on(b, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); audio.wake(); b.classList.add('on'); on(); try { b.setPointerCapture(e.pointerId); } catch (x) {} }); for (const t of ['pointerup', 'pointercancel']) api.on(b, t, () => { b.classList.remove('on'); if (off) off(); }); };
    th(tAtk, () => { tA = true; }, () => { tA = false; }); th(tUse, () => { const n = lookNpc(); if (n) openShop(n.kind); else tU = true; }, () => { tU = false; });
    th(tJump, () => keys.add('Space'), () => keys.delete('Space')); th(tSneak, () => { tSn = !tSn; tSneak.classList.toggle('on', tSn); }); th(tView, () => { view3 = !view3; });
    function selSlot(i) { if (!me) return; if (i >= 0 && i < 9) { me.sel = i; if (me.hot[i]) showAct(itemName(me.hot[i])); else { act.classList.remove('on'); actT = 0; } } }
    let actT = 0;
    function showAct(t, s = 1.6) { act.textContent = t; act.classList.add('on'); actT = s; }
    function itemName(s) {
      if (!s) return ''; const k = s.k;
      if (k === 'sword') return T(SWORDS[me.sword].n); if (k === 'pick') return T(PICKS[me.pick].n); if (k === 'axe') return T(AXES[me.axe].n);
      if (typeof k === 'number') return T(BD[k].n);
      return T({ shears: 'Shears', bow: me.bow === 2 ? 'Power Bow' : 'Bow', arrow: 'Arrows', gapple: 'Golden Apple', fire: 'Fireball', tnt: 'TNT', pearl: 'Warp Pearl', egg: 'Bridge Egg', kb: 'Knockback Stick' }[k] || k);
    }
    api.on(window, 'keydown', e => {
      const c = e.code;
      if (e.metaKey || e.altKey) return;
      if (phase === 'home') { if (c === 'Enter' && !scr.contains(document.activeElement)) { e.preventDefault(); startLocal(); } return; }
      if (phase === 'end') { if (c === 'Enter' && !scr.contains(document.activeElement)) { const b = scr.querySelector('[data-a="again"]'); if (b) { e.preventDefault(); b.click(); } } return; }
      if (phase !== 'play') return;
      if (shopOpen) { if (c === 'Escape' || c === 'KeyE') { e.preventDefault(); closeShop(); } else { const n = /^Digit([1-6])$/.exec(c); if (n && shopOpen === 'shop') { shopTab = +n[1] - 1; renderShop(); } } return; }
      if (paused) { if (c === 'Escape') { e.preventDefault(); if (scr.querySelector('[data-a="resume"]')) setPause(false); else setScr(pauseHtml(), 'dim'); } return; }
      if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); setPause(true); return; }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'F5'].includes(c)) e.preventDefault();
      if (c === 'KeyW' && !e.repeat) { if (performance.now() - lastW < 280) sprintKey = true; lastW = performance.now(); }
      if (c === 'ControlLeft' || c === 'ControlRight') sprintKey = true;
      keys.add(c);
      if (e.repeat) return;
      const dg = /^Digit([1-9])$/.exec(c); if (dg) { selSlot(+dg[1] - 1); return; }
      if (c === 'F5' || c === 'KeyV') { view3 = !view3; return; }
      if (c === 'KeyE') { const n = nearNpc(); if (n) openShop(n.kind); return; }
    });
    api.on(window, 'keyup', e => { keys.delete(e.code); if (e.code === 'KeyW') sprintKey = false; });

    function nearNpc() { if (!S || !me || !me.alive) return null; let b = null, bd = 4.2; for (const n of S.npcs) { if (n.team !== me.team) continue; const d = Math.hypot(n.x - me.x, n.z - me.z); if (d < bd && Math.abs(n.y - me.y) < 3) { bd = d; b = n; } } return b; }
    function lookNpc() {
      if (!S || !me || !me.alive) return null;
      const ey = S.eyeY(me), d = S.lookDir(me);
      for (const n of S.npcs) { if (n.team !== me.team) continue; const t = S.rayBox(me.x, ey, me.z, d[0], d[1], d[2], n.x - 0.4, n.y, n.z - 0.4, n.x + 0.4, n.y + 1.9, n.z + 0.4); if (t >= 0 && t < 4.5) return n; }
      return null;
    }
    const iconTo = (cv, key) => { const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); if (key) { x.imageSmoothingEnabled = false; x.drawImage(iconCanvas(key, view.atlasC), 0, 0, cv.width, cv.height); } };
    const resIcon = i => { const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.getContext('2d').drawImage(sprite('res:' + i), 0, 0); return c; };
    function shopKey(it) {
      if (it.b) return 'b:' + (it.b === 11 ? wool(me.team) : it.b === 16 ? clayOf(me.team) : it.b);
      const m = { sw1: 'sword:1', sw2: 'sword:2', sw3: 'sword:3', kb: 'kb', ar1: 'ar:1', ar2: 'ar:2', ar3: 'ar:3', pick: 'pick:' + Math.min(4, me.pick + 1), axe: 'axe:' + Math.min(4, me.axe + 1), shears: 'shears', bow: 'bow', bow2: 'bow', arrow: 'arrow', gapple: 'gapple', fire: 'fire', tnt: 'b:tnt', pearl: 'pearl', egg: 'egg:' + me.team };
      return m[it.id] || it.id;
    }
    function armorIcon(t) { const k = 'ar:' + t; if (ICONS[k]) return; const c = document.createElement('canvas'); c.width = 32; c.height = 32; const x = c.getContext('2d'); const cl = ['#a0602a', '#8a8a8a', '#d8d8d8', '#5fe8e8'][t]; x.fillStyle = '#1a1a1a'; x.fillRect(4, 2, 24, 28); x.fillStyle = cl; x.fillRect(6, 4, 20, 24); x.fillStyle = '#1a1a1a'; x.fillRect(12, 2, 8, 8); x.fillRect(4, 16, 2, 14); x.fillRect(26, 16, 2, 14); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(8, 6, 4, 18); ICONS[k] = c; }
    [1, 2, 3].forEach(armorIcon);
    function openShop(kind) { if (!me || !me.alive) return; shopOpen = kind; shopTab = 0; mouse0 = mouse2 = false; unlock(); renderShop(); audio.play('tap'); }
    function closeShop() { if (!shopOpen) return; shopOpen = ''; setScr('', ''); scr.hidden = true; lock(); }
    function priceHtml(c) { if (!c) return ''; return `<span>${c[1]} ${T(RES[c[0]].n)}</span>`; }
    function renderShop() {
      if (!shopOpen || !me) return;
      const r = me.res;
      const top = `<div class="rr">${RES.map((x, i) => `<span><canvas data-res="${i}" width="16" height="16"></canvas>${r[i]}</span>`).join('')}</div>`;
      let body = '';
      if (shopOpen === 'upg') {
        const up = S.teamOf(me).up;
        body = `<h2>Team upgrades</h2>${top}<div class="grid">${UPG.map(u => { const lv = up[u.id], max = lv >= u.max, c = max ? null : [2, u.c[lv]], ok = !max && r[2] >= c[1]; return `<button class="it${max ? ' own' : ok ? '' : ' no'}" data-buy="${u.id}"><b>${T(u.n)}${u.max > 1 ? ' ' + ['I', 'II', 'III', 'IV'][Math.min(lv, u.max - 1)] : ''}</b><small>${T(u.d)}</small>${max ? `<span>${T('Unlocked')}</span>` : priceHtml(c)}</button>`; }).join('')}</div>`;
      } else {
        const cat = SHOP[shopTab];
        body = `<h2>Item shop</h2>${top}<div class="tabs">${SHOP.map((c, i) => `<button class="tab${i === shopTab ? ' on' : ''}" data-tab="${i}">${T(c.k)}</button>`).join('')}</div><div class="grid">${cat.items.map(it => {
          let c = it.c, own = false, name = T(it.n);
          if (it.id === 'pick') { if (me.pick >= 4) own = true; else { c = PICK_COST[me.pick + 1]; name = T(PICKS[me.pick + 1].n); } }
          if (it.id === 'axe') { if (me.axe >= 4) own = true; else { c = AXE_COST[me.axe + 1]; name = T(AXES[me.axe + 1].n); } }
          if (/^sw[123]$/.test(it.id) && me.sword >= +it.id[2]) own = true;
          if (/^ar[123]$/.test(it.id) && me.armor >= +it.id[2]) own = true;
          if (it.id === 'shears' && me.shears) own = true;
          if (it.id === 'bow' && me.bow >= 1 || it.id === 'bow2' && me.bow >= 2) own = true;
          const ok = !own && c && r[c[0]] >= c[1];
          return `<button class="it${own ? ' own' : ok ? '' : ' no'}" data-buy="${it.id}"><canvas data-ic="${shopKey(it)}" width="32" height="32"></canvas><b>${name}${it.q ? ' ×' + it.q : ''}</b>${it.d ? `<small>${T(it.d)}</small>` : ''}${own ? `<span>${T('Owned')}</span>` : priceHtml(c)}</button>`;
        }).join('')}</div>`;
      }
      setScr(`<div class="pan shop">${body}<div class="btns"><button class="btn" data-a="closeshop">Close</button></div></div>`, 'dim');
      scr.querySelectorAll('canvas[data-ic]').forEach(c => iconTo(c, c.dataset.ic));
      scr.querySelectorAll('canvas[data-res]').forEach(c => c.getContext('2d').drawImage(sprite('res:' + c.dataset.res), 0, 0));
    }
    const BUY_MSG = { poor: 'You don’t have enough resources!', full: 'Your inventory is full!', own: 'You already have this!', max: 'Already unlocked!', far: 'Too far from the shopkeeper' };
    function doBuy(id) {
      if (!me) return;
      if (online && online.role === 'guest') { guestBuy(id); return; }
      const r = S.buy(me, id);
      if (r === 'ok') { audio.play('buy'); } else { audio.play('deny'); chatLine(`<span style="color:#ff6b6b">${esc(T(BUY_MSG[r] || 'You can’t buy this'))}</span>`); }
      renderShop();
    }
    function chatLine(html) { const d = el('div', '', chat, html); while (chat.children.length > 7) chat.firstChild.remove(); api.timeout(() => d.remove(), 7200); }
    function title(a, b, s = 2.2, cl) { ttl.firstChild.textContent = a; ttl.firstChild.style.color = cl || '#ff5c5c'; ttl.lastChild.textContent = b || ''; ttl.classList.add('on'); ttlT = s; }
    let ttlT = 0;

    function botNames(n, used) { const pool = NAMES.filter(x => !used.includes(x)), out = []; for (let i = 0; i < n; i++) out.push(pool.splice((Math.random() * pool.length) | 0, 1)[0] || 'Bot' + i); return out; }
    function startLocal() {
      if (online) { try { api.net.close(); } catch (e) {} online = null; }
      const nT = prefs.teams, sz = prefs.size, pls = [{ name: myName(), team: 0, hero: prefs.hero, human: true, local: true }];
      const names = botNames(nT * sz, []); let k = 0;
      for (let t = 0; t < nT; t++) for (let j = 0; j < sz; j++) { if (t === 0 && j === 0) continue; pls.push({ name: names[k++], team: t, hero: (prefs.hero + 1 + k) % HEROES.length, bot: prefs.lvl }); }
      startMatch({ teams: nT, players: pls, lvl: prefs.lvl }, 0, {});
    }
    function clearMatch() { clearChars(); S = null; me = null; shopOpen = ''; spec = -1; chat.textContent = ''; ttl.classList.remove('on'); hudC.clear(); view.hl.visible = false; view.setCrack(0, 0, 0, 0, 1); }
    function startMatch(cfg, meIdx, o) {
      clearMatch(); cfgM = cfg;
      S = makeSim({ teams: cfg.teams, players: cfg.players });
      S.client = !!o.client;
      if (!o.client) S.pl.forEach(p => { if (p.bot >= 0) botInit(p, S); });
      me = S.pl[meIdx]; me.local = true;
      if (o.client) S.pl.forEach(p => { if (p !== me) p.remote = true; });
      if (o.remotes) for (const i of o.remotes) S.pl[i].remote = true;
      if (!o.client) S.start();
      view.resetWorld(); view.setupGens(S);
      chars = S.pl.map(p => view.makeChar(p.hero, p.team, p.armor));
      npcChars = S.npcs.map(n => { const c = view.makeChar(n.kind === 'shop' ? 2 : 4, -1, -1, true); c.root.position.set(n.x, n.y, n.z); c.root.rotation.y = n.yaw; view.setTag(c, n.kind === 'shop' ? T('ITEM SHOP') : T('TEAM UPGRADES'), '#ffffff', T('RIGHT CLICK')); return c; });
      phase = 'play'; paused = false; acc = 0; endT = 0; view3 = false; shopOpen = '';
      hud.hidden = false; tc.hidden = !touchOn; setScr('', '');
      look.yaw = me.yaw; look.pitch = 0;
      lock();
      title(T('Bed Raiders'), T('Protect your bed and destroy the enemy beds.'), 3.5, '#ffd23f');
    }
    function leaveMatch() { if (online) netLeave(); clearMatch(); showHome(); }
    function finishMatch() {
      if (phase !== 'play' || !S) return;
      phase = 'end'; unlock(); closeShop();
      const win = S.winner === me.team;
      prefs.games++; if (win) { prefs.wins++; if (!online && cfgM.lvl === 3) prefs.hw++; } prefs.finals += me.finals; prefs.beds += me.beds; prefs.kills += me.kills; persist();
      if (win) api.submit(prefs.wins);
      audio.play(win ? 'win' : 'lose');
      const host = !online || online.role === 'host';
      const wt = S.winner >= 0 ? TEAMS[S.winner] : null;
      setScr(`<div class="pan" style="text-align:center"><h2 style="color:${win ? '#3a8a2a' : '#a02020'}">${win ? 'VICTORY!' : 'GAME OVER!'}</h2>
        <p>${wt ? esc(T('{t} team wins!', { t: T(wt.n) })) : esc(T('Draw'))}</p>
        <div class="keys" style="grid-template-columns:1fr auto;max-width:18em;margin:.6em auto"><span>${T('Kills')}</span><b>${me.kills}</b><span>${T('Final kills')}</span><b>${me.finals}</b><span>${T('Beds broken')}</span><b>${me.beds}</b><span>${T('Deaths')}</span><b>${me.deaths}</b></div>
        <div class="btns" style="justify-content:center">${host ? '<button class="btn go" data-a="again">Play again</button>' : `<div class="wait"><i></i>${T('Waiting for the host…')}</div>`}${online && online.role === 'host' ? '<button class="btn" data-a="lobby">Back to lobby</button>' : ''}<button class="btn" data-a="menu">${online ? 'Leave' : 'Menu'}</button></div></div>`, 'dim');
    }
    function controlLocal() {
      const p = me; if (!p) return;
      const inp = p.inp, on = playing() && p.alive;
      let mx = 0, mz = 0;
      if (on) {
        if (keys.has('KeyW') || keys.has('ArrowUp')) mz += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) mz -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
        mx += joyV.x; mz -= joyV.y;
      }
      inp.mx = mx; inp.mz = mz;
      inp.jump = on && keys.has('Space');
      inp.sneak = on && (keys.has('ShiftLeft') || keys.has('ShiftRight') || tSn);
      inp.sprint = on && (prefs.autoSprint || sprintKey || -joyV.y > 0.85);
      inp.atk = on && (mouse0 || tA);
      inp.use = on && (mouse2 || tU);
      p.yaw = look.yaw; p.pitch = look.pitch;
    }
    function stepOnce() {
      if (me.bot < 0) controlLocal(); else { look.yaw = me.yaw; look.pitch = me.pitch; }
      if (!S.client) for (const p of S.pl) if (p.bot >= 0) botThink(S, p);
      S.step();
      if (online) netStep();
      if (S.evc > 900 && document.hidden) { S.evc = 0; netEvIdx = 0; }
    }
    const hudC = new Map();
    const setT = (e, k, v) => { if (hudC.get(k) !== v) { hudC.set(k, v); e.textContent = v; } };
    let sbT = 0;
    function updHud(dt) {
      const p = me;
      const hk = Math.ceil(p.hp) + ':' + Math.ceil(p.abs) + ':' + p.armor;
      if (hk !== lastHearts) {
        lastHearts = hk; const hp = Math.max(0, Math.ceil(p.hp)), ab = Math.ceil(p.abs);
        for (let i = 0; i < 12; i++) { const e = heartEls[i]; if (i < 10) { e.style.display = ''; e.style.backgroundImage = `url(${hp >= (i + 1) * 2 ? heartURL.full : hp === i * 2 + 1 ? heartURL.half : heartURL.empty})`; } else { const j = i - 10; e.style.display = ab > j * 2 ? '' : 'none'; e.style.backgroundImage = `url(${ab >= (j + 1) * 2 ? heartURL.gold : heartURL.goldH})`; } }
        const ap = ARMOR[p.armor].p; for (let i = 0; i < 10; i++) armEls[i].style.backgroundImage = `url(${ap >= (i + 1) * 2 ? heartURL.armF : ap === i * 2 + 1 ? heartURL.armH : heartURL.armE})`;
      }
      for (let i = 0; i < 9; i++) {
        const s = slots[i], it = p.hot[i], key = itemKey(p, it), n = it ? it.n : 0;
        if (s.key !== key) { s.key = key; iconTo(s.c, key); }
        if (s.n !== n) { s.n = n; s.b.textContent = n > 1 ? String(n) : ''; }
        const on = i === p.sel; if (hudC.get('sl' + i) !== on) { hudC.set('sl' + i, on); s.s.classList.toggle('on', on); }
      }
      for (let i = 0; i < 4; i++) setT(resEls[i].b, 'r' + i, String(p.res[i]));
      sbT -= dt;
      if (sbT <= 0) {
        sbT = 0.25;
        const ev = S.nextEv < EVENTS.length ? EVENTS[S.nextEv] : null, rem = ev ? Math.max(0, ev[0] - S.gt) : 0;
        const tl = ev ? `${esc(T('{e} in', { e: T(ev[2]) }))} <b>${((rem / 60) | 0)}:${String((rem | 0) % 60).padStart(2, '0')}</b>` : '';
        const rows = S.teams.map(tm => { const al = S.pl.filter(q => q.team === tm.i && q.alive).length; const st = tm.bed ? '<em class="g">✓</em>' : al ? `<em class="x">${al}</em>` : '<em class="x">✗</em>'; return `<div class="r${tm.i === me.team ? ' me' : ''}"><span style="color:${TEAMS[tm.i].c}">${TEAMS[tm.i].k}</span> <span>${T(TEAMS[tm.i].n)}${tm.i === me.team ? ' ' + T('(you)') : ''}</span>${st}</div>`; }).join('');
        const html = `<h4>BED RAIDERS</h4><div class="r">${tl}</div><br>${rows}<br><div class="r"><span>${T('Kills')}</span><b>${p.kills}</b></div><div class="r"><span>${T('Final kills')}</span><b>${p.finals}</b></div><div class="r"><span>${T('Beds broken')}</span><b>${p.beds}</b></div>`;
        if (hudC.get('sb') !== html) { hudC.set('sb', html); sb.innerHTML = html; }
      }
      if (ttlT > 0) { ttlT -= dt; if (ttlT <= 0) ttl.classList.remove('on'); }
      if (actT > 0) { actT -= dt; if (actT <= 0) act.classList.remove('on'); }
      if (!p.alive && !S.over) { if (p.final) title(T('YOU DIED!'), T('You are now a spectator'), 0.3); else title(T('YOU DIED!'), T('Respawning in {n}', { n: Math.max(1, Math.ceil(p.respT)) }), 0.3); }
      const near = !!(touchOn && nearNpc()); if (hudC.get('shb') !== near) { hudC.set('shb', near); shopBtn.hidden = !near; }
      if (online) { const bad = online.lost; setT(netEl, 'net', bad ? T('Connection lost. Reconnecting…') : online.role === 'host' ? T('Host') : T('Ping {n} ms', { n: Math.round(api.net.rtt || 0) })); netEl.classList.toggle('bad', !!bad); netEl.hidden = false; } else netEl.hidden = true;
      let gi = 0;
      for (const g of S.gens) {
        if (g.team >= 0 || gi >= gl.length) continue;
        const d = gl[gi++], dist = Math.hypot(g.x - cam.position.x, g.z - cam.position.z);
        P3.set(g.x, g.y + 3.6, g.z).project(cam);
        if (dist > 34 || P3.z > 1) { d.hidden = true; continue; }
        d.hidden = false;
        const w = wrap.clientWidth, h = wrap.clientHeight;
        d.style.transform = `translate(${((P3.x + 1) / 2 * w).toFixed(0)}px,${((1 - P3.y) / 2 * h).toFixed(0)}px) translate(-50%,-100%)`;
        const tier = g.type === 2 ? S.dTier : S.eTier;
        setT(d, 'g' + gi, `${T(g.type === 2 ? 'Diamond' : 'Emerald')} ${['I', 'II', 'III'][tier]}\n${T('Spawns in {n}s', { n: Math.max(0, Math.ceil(g.t)) })}`);
        d.style.whiteSpace = 'pre'; d.style.color = g.type === 2 ? '#7ff0ff' : '#7dff9a';
      }
      for (; gi < gl.length; gi++) gl[gi].hidden = true;
    }
    const P3 = new THREE.Vector3();
    const sndAt = (n, x, y, z, base = 1) => { const dx = x - cam.position.x, dy = y - cam.position.y, dz = z - cam.position.z, d = Math.hypot(dx, dy, dz); const v = base * Math.pow(clamp(1 - d / 40, 0, 1), 1.3); const pan = d > 0.5 ? (dx * Math.cos(look.yaw) - dz * Math.sin(look.yaw)) / d : 0; audio.play(n, v, pan * 0.7); };
    const nm = q => q ? `<span style="color:${TEAMS[q.team].c}">${esc(q.name)}</span>` : '';
    function processEvents() {
      if (online) { if (online.role === 'host') hostCollect(); }
      const n = S.evc;
      for (let i = 0; i < n; i++) {
        const e = S.evq[i];
        switch (e.k) {
          case 'place': sndAt(isWool(e.v) ? 'wool' : 'place', e.x + 0.5, e.y + 0.5, e.z + 0.5); if (e.a === me.i) placeV = 1; break;
          case 'brk': view.burst(e.x + 0.5, e.y + 0.5, e.z + 0.5, view.blockColor(e.v), 14, 4, 0.7); sndAt(e.v === B.GLASS ? 'glass' : isWool(e.v) ? 'wool' : 'brk', e.x + 0.5, e.y + 0.5, e.z + 0.5); break;
          case 'dig': { const b = S.get(e.x, e.y, e.z); if (b) { view.burst(e.x + 0.5, e.y + 0.7, e.z + 0.5, view.blockColor(b), 2, 2, 0.4); sndAt(isWool(b) ? 'wool' : 'dig', e.x + 0.5, e.y + 0.5, e.z + 0.5, 0.7); } break; }
          case 'bed': {
            const tm = TEAMS[e.a], by = e.b >= 0 ? S.pl[e.b] : null;
            view.burst(e.x + 0.5, e.y + 0.4, e.z + 0.5, tm.c, 24, 5, 0.9);
            chatLine(`<b>${T('BED DESTRUCTION')} &gt;</b> <span style="color:${tm.c}">${esc(T('{t} Bed', { t: T(tm.n) }))}</span> ${by ? esc(T('was destroyed by')) + ' ' + nm(by) + '!' : esc(T('was destroyed!'))}`);
            if (e.a === me.team) { title(T('BED DESTROYED!'), T('You will no longer respawn!'), 3); audio.play('bedAlarm'); } else audio.play('bedBreak');
            break;
          }
          case 'hurt': {
            const a = e.a >= 0 ? S.pl[e.a] : null, b = S.pl[e.b];
            if (b === me) { hurtEl.style.transition = 'none'; hurtEl.style.opacity = 0.9; void hurtEl.offsetWidth; hurtEl.style.transition = ''; hurtEl.style.opacity = 0; audio.play('hurt'); hearts.classList.remove('flash'); void hearts.offsetWidth; hearts.classList.add('flash'); }
            else sndAt('hit', b.x, b.y + 1, b.z, 0.8);
            if (e.s === 'melee' || e.s === 'arrow') view.burst(b.x, b.y + 1.2, b.z, '#a01010', 5, 2, 0.4);
            break;
          }
          case 'hit': if (e.n) { const b = S.pl[e.b]; view.burst(b.x, b.y + 1.3, b.z, '#ffffff', 8, 3, 0.4); sndAt('crit', b.x, b.y + 1, b.z); } break;
          case 'swing': if (e.a === me.i) audio.play('swing', 0.6); break;
          case 'death': {
            const a = e.a >= 0 ? S.pl[e.a] : null, b = S.pl[e.b];
            const w = e.s;
            const txt = w === 'void' ? (a ? T('{b} was knocked into the void by {a}.') : T('{b} fell into the void.')) : w === 'arrow' ? T('{b} was shot by {a}.') : w === 'blast' ? (a ? T('{b} was blown up by {a}.') : T('{b} blew up.')) : w === 'fall' ? (a ? T('{b} was knocked off a ledge by {a}.') : T('{b} hit the ground too hard.')) : w === 'wither' ? T('{b} withered away.') : a ? T('{b} was killed by {a}.') : T('{b} died.');
            chatLine(esc(txt).replace('{a}', nm(a)).replace('{b}', nm(b)) + (e.n ? ` <b style="color:#5ce0ff">${esc(T('FINAL KILL!'))}</b>` : ''));
            if (a === me) audio.play('kill');
            if (b === me) { audio.play('dead'); spec = a ? a.i : -1; closeShop(); }
            view.burst(b.x, b.y + 1, b.z, '#cccccc', 14, 3, 0.8);
            break;
          }
          case 'loot': if (e.a === me.i) audio.play('pop'); break;
          case 'pick': if (e.a === me.i) audio.play('pop', 0.8); break;
          case 'upg': { const a = S.pl[e.a]; if (a && a.team === me.team) { chatLine(`${nm(a)} ${esc(T('purchased'))} <b>${esc(T(UPG.find(u => u.id === e.s).n))}</b>`); audio.play('upgrade'); if (shopOpen) renderShop(); } break; }
          case 'trap': if (e.b === me.team) { chatLine(`<b style="color:#ff6b6b">${esc(T('Alarm! An enemy is near your bed!'))}</b>`); audio.play('bedAlarm'); } else if (e.a === me.i) chatLine(esc(T('You set off an alarm trap!'))); break;
          case 'tl': { const M = { dia2: 'Diamond generators are now tier II', dia3: 'Diamond generators are now tier III', eme2: 'Emerald generators are now tier II', eme3: 'Emerald generators are now tier III', beds: 'All beds have been destroyed!', sudden: 'Sudden death! Health no longer regenerates.', end: 'Time is up!' }; chatLine(`<b style="color:#ffd23f">${esc(T(M[e.s] || e.s))}</b>`); if (e.s === 'beds') title(T('BED DESTRUCTION'), T('All beds have been destroyed!'), 3); else if (e.s === 'sudden') title(T('SUDDEN DEATH'), '', 2.5); audio.play('ding'); break; }
          case 'go': title(T('GO!'), '', 1, '#7dff7d'); audio.play('ding'); break;
          case 'elim': chatLine(`<b>${esc(T('TEAM ELIMINATED'))} &gt;</b> <span style="color:${TEAMS[e.a].c}">${esc(T('{t} team has been eliminated!', { t: T(TEAMS[e.a].n) }))}</span>`); break;
          case 'over': endT = 2.5; { const w = e.a === me.team; title(w ? T('VICTORY!') : T('GAME OVER!'), e.a >= 0 ? T('{t} team wins!', { t: T(TEAMS[e.a].n) }) : '', 2.5, w ? '#ffd23f' : '#ff5c5c'); } break;
          case 'throw': { const a = S.pl[e.a]; if (a) sndAt(e.s === 'fire' ? 'fire' : e.s === 'arrow' ? 'bow' : 'swing', a.x, a.y + 1.5, a.z); break; }
          case 'boom': view.burst(e.x, e.y, e.z, '#ffffff', 40, 9, 1); view.burst(e.x, e.y, e.z, '#ff9a30', 20, 6, 0.6); sndAt('boom', e.x, e.y, e.z); break;
          case 'fuse': sndAt('fuse', e.x, e.y, e.z); break;
          case 'tele': if (e.a === me.i) audio.play('tele'); break;
          case 'eat': if (e.a === me.i) audio.play('eat'); break;
          case 'ate': if (e.a === me.i) audio.play('burp'); break;
          case 'ahit': if (e.a === me.i) audio.play('ding'); break;
          case 'aland': sndAt('arrowHit', e.x, e.y, e.z); break;
          case 'spawn': if (e.a === me.i) { look.yaw = me.yaw; look.pitch = 0; spec = -1; ttl.classList.remove('on'); } break;
          case 'jump': if (e.a === me.i) audio.play('jump'); break;
          case 'land': if (e.a === me.i) audio.play('land'); break;
        }
      }
      S.evc = 0; netEvIdx = 0;
    }
    const cam = view.cam, fpCam = view.fpCam;
    let fovNow = 0, stepSnd = 0;
    function updCam(alpha, dt) {
      const p = me;
      let tgt = p;
      if (!p.alive && spec >= 0 && S.pl[spec] && S.pl[spec].alive) tgt = S.pl[spec];
      const rem = tgt.remote && tgt.net;
      const px = rem ? tgt.net.x : lerp(tgt.px, tgt.x, alpha), py = rem ? tgt.net.y : lerp(tgt.py, tgt.y, alpha), pz = rem ? tgt.net.z : lerp(tgt.pz, tgt.z, alpha);
      const ey = py + (tgt.sneak ? EYES : EYE);
      let yaw = look.yaw, pitch = look.pitch;
      const moving = Math.hypot(p.vx, p.vz);
      if (p.onG && moving > 0.5 && p.alive) bob += dt * moving * 1.9; else bob = damp(bob, Math.round(bob / Math.PI) * Math.PI, 8, dt);
      const bobOn = prefs.bob && !view3 && p.alive && tgt === p;
      if (!p.alive && tgt === p) {
        const tm = S.teamOf(p); cam.position.set(tm.center[0] + Math.sin(S.t * 0.2) * 8, BASE + 14, tm.center[1] + Math.cos(S.t * 0.2) * 8); cam.lookAt(tm.center[0], BASE + 1, tm.center[1]);
      } else if (view3 || tgt !== p) {
        if (tgt !== p) { yaw = S.t * 0.25; pitch = -0.35; }
        const cp = Math.cos(pitch), fx = -Math.sin(yaw) * cp, fy = Math.sin(pitch), fz = -Math.cos(yaw) * cp;
        let d = 4.2;
        if (S.rayBlock(px, ey, pz, -fx, -fy, -fz, d + 0.3)) d = Math.max(0.3, S.RB.t - 0.3);
        cam.position.set(px - fx * d, ey - fy * d, pz - fz * d); cam.rotation.set(pitch, yaw, 0);
      } else {
        const bx = bobOn ? Math.sin(bob) * 0.05 : 0, by = bobOn ? -Math.abs(Math.cos(bob)) * 0.07 : 0;
        cam.position.set(px + Math.cos(yaw) * bx, ey + by, pz - Math.sin(yaw) * bx); cam.rotation.set(pitch, yaw, bobOn ? Math.sin(bob) * 0.006 : 0);
      }
      const fv = prefs.fov * (p.sprint && p.alive ? 1.1 : 1) * (p.bowT > 0 ? 1 - Math.min(1, p.bowT) * 0.15 : 1);
      fovNow = fovNow ? damp(fovNow, fv, 10, dt) : fv;
      if (Math.abs(cam.fov - fovNow) > 0.05) { cam.fov = fovNow; cam.updateProjectionMatrix(); }
    }
    function updChars(alpha, dt) {
      for (let i = 0; i < S.pl.length; i++) {
        const p = S.pl[i], ch = chars[i]; if (!ch) continue;
        const vis = p.alive && (p !== me || view3);
        ch.root.visible = vis; if (!vis) continue;
        let x, y, z, yaw;
        if (p.remote && p.net) { x = p.net.x; y = p.net.y; z = p.net.z; yaw = p.net.yaw; } else { x = lerp(p.px, p.x, alpha); y = lerp(p.py, p.y, alpha); z = lerp(p.pz, p.z, alpha); yaw = p.yaw; }
        ch.root.position.set(x, y, z); ch.root.rotation.y = yaw;
        view.setSkin(ch, p.hero, p.team, p.armor);
        view.setHeld(ch, itemKey(p, p.hot[p.sel]));
        view.animChar(ch, p, dt);
        if (p !== me) { view.setTag(ch, (p.team === me.team ? '' : '') + p.name, TEAMS[p.team].c); ch.tag.visible = p.team === me.team || Math.hypot(x - me.x, z - me.z) < 32 || p.glowT > 0; }
        else ch.tag.visible = false;
        if (p.hurtT > 0) ch.mat.color.setRGB(1, 0.45, 0.45); else ch.mat.color.setRGB(1, 1, 1);
      }
      for (const n of npcChars) { n.root.rotation.y = n.root.rotation.y; }
    }
    let hlKey = '';
    function updTarget() {
      if (!me.alive || shopOpen) { view.hl.visible = false; view.setCrack(0, 0, 0, 0, 1); return; }
      const ey = S.eyeY(me), d = S.lookDir(me);
      if (S.rayBlock(me.x, ey, me.z, d[0], d[1], d[2], REACH)) {
        const RB = S.RB, h = BD[RB.id].h;
        view.hl.visible = true; view.hl.position.set(RB.x + 0.5, RB.y + h / 2, RB.z + 0.5); view.hl.scale.set(1, h, 1);
        const m = me.mine; if (m.p > 0 && m.x === RB.x && m.y === RB.y && m.z === RB.z) view.setCrack(RB.x, RB.y, RB.z, m.p, h); else view.setCrack(0, 0, 0, 0, 1);
      } else { view.hl.visible = false; view.setCrack(0, 0, 0, 0, 1); }
    }
    function render(dt) {
      if (S && me) {
        const alpha = clamp(acc / DT, 0, 1);
        if (online && online.role === 'guest') netInterp();
        view.syncWorld(S, 6);
        updChars(alpha, dt);
        updCam(alpha, dt);
        updTarget();
        processEvents();
        view.drawGens(S, S.t);
        view.syncEnts(S, S.t);
        if (endT > 0) { endT -= dt; if (endT <= 0) finishMatch(); }
        if (me.alive && playing() && me.onG) { const v = Math.hypot(me.vx, me.vz); if (v > 1) { stepSnd -= dt * v / 1.9; if (stepSnd <= 0) { stepSnd = 1; audio.play('step', me.sneak ? 0.3 : 0.7); } } }
        updHud(dt);
        placeV = Math.max(0, placeV - dt * 5);
      } else if (homeS) {
        homeT += dt;
        view.syncWorld(homeS, 12);
        const a = homeT * 0.08;
        cam.position.set(48 + Math.sin(a) * 34, BASE + 16, 48 + Math.cos(a) * 34); cam.lookAt(48, BASE + 1, 48);
        if (cam.fov !== 70) { cam.fov = 70; cam.updateProjectionMatrix(); }
        view.drawGens(homeS, homeT);
      }
      view.clouds.position.x = 48 + ((performance.now() / 1000) * 0.6) % 120 - 60;
      view.fxStep(Math.min(dt, 0.05));
      renderer.render(view.scene, cam);
      if (S && me && me.alive && !view3 && phase === 'play') {
        view.fpSetup(me.hero, me.team, me.armor);
        view.fpHeld(itemKey(me, me.hot[me.sel]));
        view.fpPose(me, dt, bob, me.swingT > 0 ? (0.25 - me.swingT) / 0.25 : 0, placeV);
        fpCam.aspect = cam.aspect; fpCam.fov = 70; fpCam.updateProjectionMatrix();
        renderer.autoClear = false; renderer.clearDepth(); renderer.render(view.fp, fpCam); renderer.autoClear = true;
      }
    }
    api.loop(dt => {
      if (S && (phase === 'play' || phase === 'end')) {
        if (!paused || online) {
          acc += dt; let n = 0;
          while (acc >= DT && n < 5) { stepOnce(); acc -= DT; n++; }
          if (acc > DT * 3) acc = 0;
        }
      }
      render(dt);
    });
    api.on(document, 'visibilitychange', () => { if (document.hidden && phase === 'play' && !online && !paused) setPause(true); if (online) netVis(); });

    let netEvIdx = 0, netBound = false, bgW = null, bgI = 0, bgT = 0;
    const NET_O = { title: "Bedwars", sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 4, min: 2, max: 8, bots: true };
    const PH = ['count', 'play', 'over'];
    const r2 = v => Math.round(v * 100) / 100;
    const nsend = (m, fast) => { try { api.net.send(m, fast); } catch (e) {} };
    const nsendTo = (id, m, fast) => { try { return api.net.sendTo(id, m, fast); } catch (e) { return false; } };
    function bindNet() {
      if (netBound) return; netBound = true;
      api.net.on('data', (m, from) => { try { onData(m, from); } catch (e) { console.error(e); } });
      api.net.on('leave', p => { if (online && online.role === 'host') hostLeave(p); });
      api.net.on('rejoin', p => { if (online && online.role === 'host') hostRejoin(p); });
      api.net.on('lobby', () => { if (online && online.role === 'guest') { clearMatch(); goOnline(); } });
      api.net.on('close', why => {
        if (!online || online.role !== 'guest') return;
        online = null; bgStop(); clearMatch(); phase = 'home'; hud.hidden = true; tc.hidden = true; unlock();
        setScr(`<div class="pan" style="text-align:center"><h2>${why === 'kicked' ? 'Removed' : why === 'lost' ? 'Connection lost' : 'Match ended'}</h2><p>${why === 'kicked' ? T('The host removed you from this party.') : why === 'lost' ? T('Lost connection to the party') : T('The host left, so the party ended.')}</p><div class="btns" style="justify-content:center"><button class="btn go" data-a="home">Menu</button></div></div>`, 'dim');
      });
    }
    async function goOnline() {
      clearMatch(); phase = 'wait'; hud.hidden = true; tc.hidden = true; unlock();
      setScr(`<div class="pan" style="text-align:center"><div class="wait"><i></i>${T('Opening party…')}</div></div>`, 'dim');
      bindNet();
      let r = null;
      try { r = await api.net.room(NET_O); } catch (e) { r = null; }
      if (!api.alive) return;
      if (!r) { online = null; showHome(); return; }
      online = { role: r.role, r, lost: false, seq: 0, snapN: 0, buf: new Map(), lastSnap: 0 };
      if (r.role === 'host') hostStart(r);
      else setScr(`<div class="pan" style="text-align:center"><div class="wait"><i></i>${T('Waiting for the host…')}</div><div class="btns" style="justify-content:center"><button class="btn" data-a="menu">Leave</button></div></div>`, 'dim');
    }
    function netLeave() { try { api.net.close(); } catch (e) {} online = null; bgStop(); }
    async function netLobby() {
      if (!online || online.role !== 'host') return;
      clearMatch(); phase = 'wait'; hud.hidden = true; tc.hidden = true;
      let r = null; try { r = await api.net.room(NET_O); } catch (e) { r = null; }
      if (!api.alive) return;
      if (!r) { online = null; showHome(); return; }
      online.r = r; hostStart(r);
    }
    function netRematch() { if (online && online.role === 'host') hostStart(online.r); }
    function hostStart(r) {
      const total = r.bots ? Math.max(r.size, r.players.length) : r.players.length;
      const nT = clamp(total <= 2 ? 2 : total <= 3 ? 3 : total <= 4 ? Math.min(4, prefs.teams === 2 && total === 4 ? 2 : 4) : Math.ceil(total / 2) > 4 ? 4 : Math.ceil(total / 2), 2, 4);
      const per = Math.ceil(total / nT);
      const pls = r.players.map((p, i) => ({ name: String(p.name || 'Player').slice(0, 16), team: i % nT, hero: p.id === api.net.id ? prefs.hero : (i * 2 + 1) % HEROES.length, human: true, pid: p.id }));
      if (r.bots) { const names = botNames(total - pls.length, pls.map(p => p.name)); for (let i = pls.length; i < nT * per && i < 8; i++) pls.push({ name: names[i - r.players.length] || 'Bot', team: i % nT, hero: (i * 3 + 2) % HEROES.length, bot: prefs.lvl }); }
      if (pls.length < 2) pls.push({ name: botNames(1, [])[0], team: 1, hero: 3, bot: prefs.lvl });
      const cfg = { teams: nT, players: pls, lvl: prefs.lvl };
      const meIdx = pls.findIndex(p => p.pid === api.net.id);
      startMatch(cfg, Math.max(0, meIdx), { remotes: pls.map((p, i) => p.human && p.pid !== api.net.id ? i : -1).filter(i => i >= 0) });
      online.idx = new Map(); S.pl.forEach((p, i) => { if (p.pid) online.idx.set(p.pid, i); });
      netEvIdx = 0;
      const full = fullState();
      S.pl.forEach((p, i) => { if (p.remote && p.pid) nsendTo(p.pid, { t: 'start', cfg, me: i, full }); });
    }
    const hotStr = p => p.hot.map(s => s ? (typeof s.k === 'number' ? 'b' + s.k : s.k) + '*' + s.n : '-').join(',');
    function plRow(p) {
      const f = (p.alive ? 1 : 0) | (p.sneak ? 2 : 0) | (p.onG ? 4 : 0) | (p.sprint ? 8 : 0) | (p.final ? 16 : 0) | (p.swingT > 0 ? 32 : 0) | (p.eatT > 0 ? 64 : 0) | (p.bowT > 0 ? 128 : 0) | (p.hurtT > 0 ? 256 : 0) | (p.glowT > 0 ? 512 : 0);
      return [r2(p.x), r2(p.y), r2(p.z), r2(p.yaw), r2(p.pitch), f, r2(p.hp), r2(p.abs), p.armor, p.sword, p.pick, p.axe, p.shears ? 1 : 0, p.bow | 0, p.sel, p.res.join(','), p.kills, p.finals, p.beds, p.deaths, r2(p.respT), p.spN, hotStr(p), p.hero, r2(p.vx), r2(p.vz)];
    }
    function fullState() {
      const log = []; for (const [i, v] of S.log) log.push(i, v);
      return { ph: PH.indexOf(S.phase), pt: r2(S.pt), gt: r2(S.gt), ne: S.nextEv, dT: S.dTier, eT: S.eTier, sd: S.sudden, log, teams: S.teams.map(t => [t.bed ? 1 : 0, t.up.sharp, t.up.prot, t.up.haste, t.up.forge, t.up.heal, t.up.trap, t.elim ? 1 : 0]), gens: S.gens.map(g => [g.n, r2(g.t)]), pl: S.pl.map(plRow) };
    }
    function hostLeave(p) {
      if (!S) return;
      const i = online.idx.get(p.id); if (i == null) return;
      const q = S.pl[i]; if (!q || !q.remote) return;
      q.remote = false; q.bot = Math.max(1, prefs.lvl); botInit(q, S); q.botFor = p.id;
      chatLine(esc(T('{a} left, a bot takes over', { a: q.name })));
    }
    function hostRejoin(p) {
      if (!S) return;
      const i = online.idx.get(p.id); if (i == null) return;
      const q = S.pl[i];
      if (q.botFor === p.id) { q.bot = -1; q.ai = null; q.remote = true; q.botFor = null; q.inp.atk = q.inp.use = false; q.inp.mx = q.inp.mz = 0; }
      nsendTo(p.id, { t: 'start', cfg: cfgM, me: i, full: fullState() });
    }
    const EVS = { place: 1, brk: 1, dig: 1, bed: 1, hurt: 1, hit: 1, death: 1, upg: 1, trap: 1, tl: 1, go: 1, elim: 1, over: 1, throw: 1, boom: 1, fuse: 1, tele: 1, eat: 1, ate: 1, pick: 1, ahit: 1, aland: 1, spawn: 1, loot: 1, swing: 1 };
    let outEv = [];
    function hostCollect() {
      const d = S.netDirty;
      for (let i = 0; i < d.length; i += 3) { const x = d[i], y = d[i + 1], z = d[i + 2]; outEv.push(['b', x, y, z, S.get(x, y, z), S.placed(x, y, z)]); }
      d.length = 0;
      for (let i = netEvIdx; i < S.evc; i++) { const e = S.evq[i]; if (!EVS[e.k]) continue; outEv.push(['e', e.k, e.a, e.b, r2(e.x), r2(e.y), r2(e.z), e.v, e.n, e.s]); }
      netEvIdx = S.evc;
    }
    function netStep() {
      if (!online) return;
      if (online.role === 'host') {
        hostCollect();
        online.snapN++;
        if (online.snapN % 3 === 0) {
          if (outEv.length) { nsend({ t: 'v', e: outEv }); outEv = []; }
          nsend({ t: 's', n: ++online.seq, ph: PH.indexOf(S.phase), pt: r2(S.pt), gt: r2(S.gt), ne: S.nextEv, dT: S.dTier, eT: S.eTier, sd: S.sudden ? 1 : 0, w: S.winner, tm: S.teams.map(t => [t.bed ? 1 : 0, t.up.sharp, t.up.prot, t.up.haste, t.up.forge, t.up.heal, t.up.trap, t.elim ? 1 : 0]), g: S.gens.map(g => [g.n, r2(g.t)]), en: S.ents.map(e => [e.id, e.type, r2(e.x), r2(e.y), r2(e.z), r2(e.vx), r2(e.vy), r2(e.vz), r2(e.fuse || 0), e.team]), p: S.pl.map(plRow) }, true);
        }
      } else {
        online.snapN++;
        const p = me;
        if (online.snapN % 2 === 0) nsend({ t: 'i', x: r2(p.x), y: r2(p.y), z: r2(p.z), yw: r2(p.yaw), pt: r2(p.pitch), f: (p.sneak ? 2 : 0) | (p.onG ? 4 : 0) | (p.sprint ? 8 : 0) | (p.swingT > 0 ? 32 : 0) | (p.eatT > 0 ? 64 : 0) | (p.bowT > 0 ? 128 : 0), sl: p.sel, vx: r2(p.vx), vz: r2(p.vz), sp: p.spN }, true);
      }
    }
    function onData(m, from) {
      if (!m || typeof m !== 'object') return;
      if (online && online.role === 'host') { hostData(m, from); return; }
      if (!online) return;
      if (m.t === 'start') { guestStart(m); return; }
      if (!S || !S.client) return;
      if (m.t === 's') guestSnap(m);
      else if (m.t === 'v') guestEvents(m.e);
      else if (m.t === 'br') { if (m.r === 'ok') audio.play('buy'); else { audio.play('deny'); chatLine(`<span style="color:#ff6b6b">${esc(T(BUY_MSG[m.r] || 'You can’t buy this'))}</span>`); } }
    }
    function hostData(m, from) {
      if (!S || !online.idx) return;
      const i = online.idx.get(from); if (i == null) return;
      const p = S.pl[i]; if (!p || !p.remote) return;
      if (m.t === 'i') {
        if (!p.alive || (m.sp | 0) !== p.spN) return;
        const nx = +m.x, ny = +m.y, nz = +m.z; if (!isFinite(nx) || !isFinite(ny) || !isFinite(nz)) return;
        p.px = p.x; p.py = p.y; p.pz = p.z;
        p.x = clamp(nx, 0, WX); p.y = clamp(ny, -40, TOPY + 30); p.z = clamp(nz, 0, WZ);
        p.yaw = +m.yw || 0; p.pitch = clamp(+m.pt || 0, -1.6, 1.6); p.sneak = !!(m.f & 2); p.onG = !!(m.f & 4); p.sprint = !!(m.f & 8);
        if (m.f & 32) p.swingT = 0.25; p.eatT = m.f & 64 ? Math.max(p.eatT, 0.1) : 0; p.bowT = m.f & 128 ? Math.max(p.bowT, 0.1) : 0;
        p.vx = +m.vx || 0; p.vz = +m.vz || 0;
        if (m.sl >= 0 && m.sl < 9) p.sel = m.sl | 0;
        pushBuf(p, p.x, p.y, p.z, p.yaw, p.pitch);
      } else if (m.t === 'pl') {
        const x = m.x | 0, y = m.y | 0, z = m.z | 0;
        let ok = false;
        if (m.k === 'tnt') ok = S.placeTnt(p, x, y, z);
        else { const k = m.k | 0; ok = S.placeBlock(p, x, y, z, k); }
        if (!ok) nsendTo(from, { t: 'v', e: [['b', x, y, z, S.get(x, y, z), S.placed(x, y, z)]] });
      } else if (m.t === 'brk') {
        const x = m.x | 0, y = m.y | 0, z = m.z | 0;
        const ey = S.eyeY(p), cx = clamp(p.x, x, x + 1), cy = clamp(ey, y, y + 1), cz = clamp(p.z, z, z + 1);
        if (p.alive && Math.hypot(cx - p.x, cy - ey, cz - p.z) < REACH + 1.2 && S.breakable(p, x, y, z)) S.breakBlock(p, x, y, z);
        else nsendTo(from, { t: 'v', e: [['b', x, y, z, S.get(x, y, z), S.placed(x, y, z)]] });
      } else if (m.t === 'atk') {
        const q = S.pl[m.q | 0]; if (q) S.attack(p, q, 0.6);
      } else if (m.t === 'use') {
        const k = m.k;
        if (k === 'gapple') { if (S.count(p, 'gapple') > 0) { S.takeItem(p, 'gapple', 1); p.regen = 5; p.abs = 4; const e = S.emit('ate'); e.a = p.i; } }
        else if (k === 'arrow') { if (p.bow) S.shootArrow(p, clamp(+m.c || 0, 0, 1)); }
        else if (k === 'fire' || k === 'pearl' || k === 'egg') { const s = p.hot.find(x => x && x.k === k); if (s) { p.useCD = 0; S.useItem(p, s); } }
      } else if (m.t === 'buy') { const r = S.buy(p, String(m.id)); nsendTo(from, { t: 'br', r }); }
    }
    function pushBuf(p, x, y, z, yaw, pitch) { let b = online.buf.get(p.i); if (!b) online.buf.set(p.i, b = []); b.push({ t: performance.now(), x, y, z, yaw, pitch }); if (b.length > 12) b.shift(); }
    function netInterp() {
      const now = performance.now() - 110;
      for (const p of S.pl) {
        if (!p.remote) continue;
        const b = online && online.buf.get(p.i); if (!b || !b.length) continue;
        let a = b[0], c = b[b.length - 1];
        for (let k = 0; k < b.length - 1; k++) if (b[k].t <= now && b[k + 1].t >= now) { a = b[k]; c = b[k + 1]; break; }
        const f = c.t > a.t ? clamp((now - a.t) / (c.t - a.t), 0, 1) : 1;
        if (!p.net) p.net = { x: 0, y: 0, z: 0, yaw: 0 };
        p.net.x = lerp(a.x, c.x, f); p.net.y = lerp(a.y, c.y, f); p.net.z = lerp(a.z, c.z, f); p.net.yaw = a.yaw + wrapA(c.yaw - a.yaw) * f;
        if (S.client) { p.x = p.px = p.net.x; p.y = p.py = p.net.y; p.z = p.pz = p.net.z; p.yaw = p.net.yaw; }
      }
    }
    function guestStart(m) {
      const cfg = m.cfg; if (!cfg || !Array.isArray(cfg.players)) return;
      startMatch(cfg, m.me | 0, { client: true });
      S.onPlace = (x, y, z, k) => { if (k !== 'tnt') { S.setB(x, y, z, k, true); S.takeItem(me, k, 1); placeV = 1; audio.play(isWool(k) ? 'wool' : 'place'); } nsend({ t: 'pl', x, y, z, k }); };
      S.onBreak = (x, y, z) => { const b = S.get(x, y, z); if (b && !isBed(b)) { S.setB(x, y, z, 0, false); view.burst(x + 0.5, y + 0.5, z + 0.5, view.blockColor(b), 14, 4, 0.7); } nsend({ t: 'brk', x, y, z }); };
      S.onClaim = q => nsend({ t: 'atk', q: q.i });
      S.onUse = (k, c) => nsend({ t: 'use', k, c });
      applyFull(m.full);
    }
    function applyFull(F) {
      if (!F) return;
      for (let k = 0; k < F.log.length; k += 2) { const i = F.log[k], v = F.log[k + 1]; S.vox[i] = v & 255; S.plc[i] = v >> 8 & 1; }
      view.resetWorld(); view.setupGens(S);
      S.phase = PH[F.ph] || 'count'; S.pt = F.pt; S.gt = F.gt; S.nextEv = F.ne; S.dTier = F.dT; S.eTier = F.eT; S.sudden = !!F.sd;
      applyTeams(F.teams); (F.gens || []).forEach((g, i) => { if (S.gens[i]) { S.gens[i].n = g[0]; S.gens[i].t = g[1]; } });
      (F.pl || []).forEach((row, i) => applyRow(S.pl[i], row, true));
      S.evc = 0;
    }
    function applyTeams(tl) { if (!Array.isArray(tl)) return; tl.forEach((t, i) => { const tm = S.teams[i]; if (!tm) return; tm.bed = !!t[0]; tm.up.sharp = t[1]; tm.up.prot = t[2]; tm.up.haste = t[3]; tm.up.forge = t[4]; tm.up.heal = t[5]; tm.up.trap = t[6]; tm.elim = !!t[7]; }); }
    function parseHot(s) { const out = [null, null, null, null, null, null, null, null, null]; if (!s) return out; s.split(',').slice(0, 9).forEach((x, i) => { if (x === '-' || !x) return; const [k, n] = x.split('*'); out[i] = { k: /^b[0-9]+$/.test(k) ? +k.slice(1) : k, n: +n || 1 }; }); return out; }
    function applyRow(p, row, force) {
      if (!p || !Array.isArray(row)) return;
      const f = row[5], was = p.alive;
      p.alive = !!(f & 1); p.final = !!(f & 16); p.hp = row[6]; p.abs = row[7]; p.armor = row[8]; p.sword = row[9]; p.pick = row[10]; p.axe = row[11]; p.shears = !!row[12]; p.bow = row[13];
      p.res = String(row[15]).split(',').map(Number); p.kills = row[16]; p.finals = row[17]; p.beds = row[18]; p.deaths = row[19]; p.respT = row[20]; p.hero = row[23];
      p.hurtT = f & 256 ? 0.2 : 0; p.glowT = f & 512 ? 1 : 0;
      if (p.hotStr !== row[22]) { p.hotStr = row[22]; p.hot = parseHot(row[22]); if (p.sel >= 9) p.sel = 0; }
      if (p === me) {
        if (row[21] !== p.spN || force) { p.spN = row[21]; p.x = p.px = row[0]; p.y = p.py = row[1]; p.z = p.pz = row[2]; p.vx = p.vy = p.vz = 0; p.yaw = row[3]; look.yaw = p.yaw; look.pitch = 0; p.onG = true; spec = -1; }
        return;
      }
      p.sneak = !!(f & 2); p.onG = !!(f & 4); p.sprint = !!(f & 8); p.swingT = f & 32 ? 0.25 : Math.max(0, p.swingT); p.eatT = f & 64 ? 0.5 : 0; p.bowT = f & 128 ? 0.5 : 0; p.sel = row[14]; p.vx = row[24]; p.vz = row[25]; p.pitch = row[4];
      pushBuf(p, row[0], row[1], row[2], row[3], row[4]);
      if (force || (!was && p.alive)) { p.x = p.px = row[0]; p.y = p.py = row[1]; p.z = p.pz = row[2]; p.yaw = row[3]; const b = online.buf.get(p.i); if (b) { b.length = 0; pushBuf(p, row[0], row[1], row[2], row[3], row[4]); } }
    }
    function guestSnap(m) {
      if ((m.n | 0) <= online.lastSnap) return;
      online.lastSnap = m.n | 0; online.lastSnapT = performance.now();
      S.phase = PH[m.ph] || S.phase; S.pt = +m.pt || 0; S.gt = +m.gt || 0; S.nextEv = m.ne | 0; S.dTier = m.dT | 0; S.eTier = m.eT | 0; S.sudden = !!m.sd; S.winner = m.w;
      applyTeams(m.tm);
      if (Array.isArray(m.g)) m.g.forEach((g, i) => { if (S.gens[i]) { S.gens[i].n = g[0]; S.gens[i].t = g[1]; } });
      if (Array.isArray(m.en)) { const ents = []; for (const e of m.en) { const o = S.ents.find(x => x.id === e[0]) || { id: e[0] }; o.type = e[1]; o.x = e[2]; o.y = e[3]; o.z = e[4]; o.vx = e[5]; o.vy = e[6]; o.vz = e[7]; o.fuse = e[8]; o.team = e[9]; ents.push(o); } S.ents = ents; }
      if (Array.isArray(m.p)) m.p.forEach((row, i) => applyRow(S.pl[i], row, false));
    }
    function guestEvents(list) {
      if (!Array.isArray(list)) return;
      for (const r of list) {
        if (!Array.isArray(r)) continue;
        if (r[0] === 'b') { const [, x, y, z, id, pl] = r; if (S.get(x, y, z) !== id || S.placed(x, y, z) !== pl) S.setB(x, y, z, id | 0, !!pl); continue; }
        if (r[0] !== 'e') continue;
        const [, k, a, b, x, y, z, v, n, s] = r;
        if ((k === 'place' || k === 'swing' || k === 'eat' || k === 'jump' || k === 'land') && a === me.i) continue;
        if (k === 'brk' && a === me.i) continue;
        const e = S.emit(k); e.a = a; e.b = b; e.x = x; e.y = y; e.z = z; e.v = v; e.n = n; e.s = s || '';
        if (k === 'death') { const q = S.pl[b]; if (q) q.alive = false; }
        if (k === 'over') { S.over = true; S.phase = 'over'; S.winner = a; }
      }
    }
    function guestBuy(id) { nsend({ t: 'buy', id }); api.timeout(renderShop, 250); }
    function bgTick() {
      if (!document.hidden || !online || online.role !== 'host' || !S) return;
      const now = performance.now(); let n = Math.min(60, Math.floor((now - bgT) / (DT * 1000)));
      if (n <= 0) return;
      bgT += n * DT * 1000; if (now - bgT > 500) bgT = now;
      while (n-- > 0) stepOnce();
      acc = 0;
    }
    function bgStop() { if (bgW) { try { bgW.terminate(); } catch (e) {} bgW = null; } if (bgI) { clearInterval(bgI); bgI = 0; } }
    function bgStart() {
      bgStop(); bgT = performance.now();
      try { const u = URL.createObjectURL(new Blob(['setInterval(function(){postMessage(0)},33)'], { type: 'text/javascript' })); bgW = new Worker(u); URL.revokeObjectURL(u); bgW.onmessage = bgTick; bgW.onerror = () => { bgW = null; if (!bgI) bgI = setInterval(bgTick, 250); }; }
      catch (e) { bgW = null; bgI = setInterval(bgTick, 250); }
    }
    function netVis() { if (document.hidden && online && online.role === 'host' && S) bgStart(); else bgStop(); }
    api.interval(() => { if (online && online.role === 'guest' && S && S.client && phase === 'play') online.lost = performance.now() - (online.lastSnapT || performance.now()) > 2500; }, 500);
    window.__br = { get S() { return S; }, get me() { return me; }, get phase() { return phase; }, get online() { return online; }, look, prefs, keys, startLocal, makeSim, botInit, botThink, LVL, view, openShop, closeShop, input(o) { if ('atk' in o) mouse0 = !!o.atk; if ('use' in o) mouse2 = !!o.use; }, auto(l) { if (me) { me.bot = l; botInit(me, S); } }, get view3() { return view3; }, set view3(v) { view3 = v; } };
    showHome();
    return () => { bgStop(); audio.close(); unlock(); if (online) { try { api.net.close(); } catch (e) {} } view.dispose(); try { delete window.__br; } catch (e) {} };
  }

  function fitPR(api, v, hook) {
    const r = v.renderer, c = v.canvas, Q = [1, 0.75, 0.55], sz = new v.THREE.Vector2();
    let lvl = 0, cw = 0, avg = 0.016, t = -2, wait = 8, chk = 0, lf = -1, up = 0;
    const apply = () => { const d = Math.min(2, window.devicePixelRatio || 1), B = Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * d * d * 1.05); const lw = r.getSize(sz).x || v.w, pr = Math.max(0.5, Math.min(4, d * cw / lw, Math.sqrt(B / (lw * (sz.y || v.h))))) * Q[lvl]; if (Math.abs(r.getPixelRatio() - pr) > 0.01) r.setPixelRatio(pr); };
    const size = () => { const w = c.getBoundingClientRect().width; if (w && Math.abs(w - cw) > Math.max(2, cw * 0.02)) { cw = w; apply(); } };
    const set = n => { lvl = n; t = 0; apply(); if (hook) hook(lvl); };
    r.forceContextLoss = () => {};
    size(); api.on(window, 'resize', size);
    api.loop(dt => {
      const f = r.info.render.frame; if (f === lf || !(dt > 0)) return; lf = f;
      avg += (dt - avg) * Math.min(1, dt * 1.5); t += dt;
      if (performance.now() - chk > 500) { chk = performance.now(); size(); }
      if (t < 1.5) return;
      if (avg > 0.021 && lvl < Q.length - 1) { if (up && t < 6) wait = Math.min(64, wait * 2); up = 0; set(lvl + 1); }
      else if (avg < 0.0175 && lvl && t > wait) { up = 1; set(lvl - 1); }
    });
  }

  Ameplay.register({
    id: ID, title: "Bedwars", category: '3D', tint: '#e8453c',
    blurb: 'Guard your bed, bridge across the void and break the other teams’ beds. Last team standing wins.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Space</kbd> jump · <kbd>Shift</kbd> sneak · left click hit or break · right click place, use or shop · <kbd>1</kbd>-<kbd>9</kbd> hotbar · <kbd>Esc</kbd> pause',
    better: 'high', width: 960, ownPause: true,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 44V22M8 36h48v8M8 30h14v6M22 30h34v6"/></svg>',
    css: CSS,
    mount(root, api) {
      const wrap = document.createElement('div'); wrap.className = 'stage'; wrap.setAttribute('data-i18n', ''); root.append(wrap);
      let cleanup = null;
      const narrow = root.clientWidth && root.clientWidth < 560;
      api.gl(narrow ? 600 : 960, narrow ? 900 : 600, { antialias: false }).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v); }).catch(e => { console.error(e); if (api.alive) api.overlay({ kicker: '3D', title: 'WebGL unavailable', text: 'This game needs WebGL, which your browser could not start.', button: null }); });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
})();
