(() => {
  'use strict';
  const ID = 'build-brawl', G = '.gm-' + ID;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const wrapA = a => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const T = (s, o) => {
    let v = s;
    try { if (window.gpI18n && typeof gpI18n.t === 'function') v = gpI18n.t(s) || s; } catch (e) {}
    return o ? String(v).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m)) : v;
  };
  const esc = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

  const TS = 4.8, LH = 3.6, CH = 1.25, WT = 0.24, FT = 0.2;
  const P_H = 1.8, P_HC = 1.25, P_R = 0.36, EYE = 1.6, EYEC = 1.08, STEP_UP = 0.58;
  const RUN = 5.5, CROUCH = 2.6, ADS_RUN = 3.6, GRAV = 24, JUMP_V = 7.75;
  const HALF = 10, MAXL = 14;
  const DT = 1 / 60;
  const RAR = [
    { n: 'Common', c: '#b9bec9' }, { n: 'Uncommon', c: '#5fd25c' }, { n: 'Rare', c: '#45a3ff' }, { n: 'Epic', c: '#c160ff' }, { n: 'Legendary', c: '#ffb23d' }
  ];
  const MATS = [
    { n: 'Wood', hp: 150, s: 90, bt: 1.2, c: '#c98a4b' }, { n: 'Stone', hp: 300, s: 75, bt: 2.6, c: '#9aa3ad' }, { n: 'Metal', hp: 500, s: 60, bt: 4.5, c: '#7c8fa6' }, { n: 'Barrier', hp: 1e9, s: 1e9, bt: 0, c: '#7fe7ff' }
  ];
  const W = [
    { n: 'Pickaxe', k: 'pick', dmg: 20, sd: 50, rate: 1.6, mag: 0, rel: 0, spr: 0, bloom: 0, head: 1, range: 2.9, pel: 1, ads: 0, eq: 0.15 },
    { n: 'Assault Rifle', k: 'ar', dmg: 30, sd: 40, rate: 5.5, mag: 30, rel: 2.3, spr: 0.034, adsSpr: 0.006, bloom: 0.011, bmax: 0.075, head: 1.5, range: 300, pel: 1, ads: 1, zoom: 1.45, fall: [50, 150, 0.7], eq: 0.3, ammo: 'm' },
    { n: 'Pump Shotgun', k: 'sg', dmg: 9.5, sd: 7, rate: 0.95, mag: 5, rel: 0.52, shell: 1, spr: 0.075, adsSpr: 0.06, bloom: 0, bmax: 0, head: 2, range: 60, pel: 10, ads: 1, zoom: 1.15, fall: [5, 22, 0.15], eq: 0.35, ammo: 's' },
    { n: 'SMG', k: 'smg', dmg: 16, sd: 15, rate: 12, mag: 30, rel: 2.0, spr: 0.042, adsSpr: 0.02, bloom: 0.006, bmax: 0.06, head: 1.6, range: 150, pel: 1, ads: 1, zoom: 1.2, fall: [16, 60, 0.6], eq: 0.25, ammo: 'l' },
    { n: 'Sniper Rifle', k: 'sn', dmg: 100, sd: 80, rate: 0.42, mag: 1, rel: 2.5, spr: 0.12, adsSpr: 0, bloom: 0, bmax: 0, head: 2.5, range: 500, pel: 1, ads: 2, zoom: 4, fall: [200, 500, 0.85], eq: 0.45, ammo: 'h' }
  ];
  const PIECES = ['Wall', 'Floor', 'Ramp', 'Cone'];
  const LVL = [
    { n: 'Easy', react: 0.55, err: 0.085, turn: 3.2, bdel: 1.1, wall: 0.25, ramp: 0.15, edit: 0, replace: 0, head: 0, strafe: 0.4, tap: 0.3, pick: 0.6 },
    { n: 'Normal', react: 0.4, err: 0.055, turn: 5, bdel: 0.6, wall: 0.55, ramp: 0.4, edit: 0, replace: 0.3, head: 0.15, strafe: 0.7, tap: 0.5, pick: 0.8 },
    { n: 'Hard', react: 0.3, err: 0.036, turn: 7.5, bdel: 0.32, wall: 0.85, ramp: 0.75, edit: 0.25, replace: 0.7, head: 0.35, strafe: 0.9, tap: 0.75, pick: 0.95 },
    { n: 'Hardest', react: 0.19, err: 0.021, turn: 11, bdel: 0.12, wall: 1, ramp: 1, edit: 1, replace: 1, head: 0.7, strafe: 1, tap: 1, pick: 1 }
  ];
  const HEROES = [
    { n: 'Juno', skin: '#f2c49b', suit: '#ff5d73', trim: '#ffd23f', hair: '#3b2a4f', visor: 0 },
    { n: 'Bolt', skin: '#c98d63', suit: '#3fa7ff', trim: '#e9f6ff', hair: '#1d1d2b', visor: 1 },
    { n: 'Moss', skin: '#e8b48a', suit: '#46c37b', trim: '#24384a', hair: '#7a4b22', visor: 0 },
    { n: 'Rook', skin: '#8f5d3f', suit: '#9b6bff', trim: '#ff9bd2', hair: '#f4f0ff', visor: 1 },
    { n: 'Flint', skin: '#f5d0b0', suit: '#ff9a3d', trim: '#2c2c3a', hair: '#c2412d', visor: 0 },
    { n: 'Nova', skin: '#6e4632', suit: '#2fd3c7', trim: '#fff3a8', hair: '#121218', visor: 1 }
  ];
  const BOT_NAMES = ['Ziggy', 'Pixel', 'Brickbeard', 'Rampage', 'Tilt', 'Lumen', 'Gravel', 'Echo', 'Sprocket', 'Vex', 'Quill', 'Marlo'];
  const MODES = [
    { k: 'build', n: 'Build Fight', d: 'Classic 1v1. Full materials, first to win the rounds takes the match.' },
    { k: 'box', n: 'Box Fight', d: 'Start in a box, edit and fight at close range. Limited materials.' },
    { k: 'ffa', n: 'Free-for-all', d: 'Up to four builders. Eliminations give health and shield back.' },
    { k: 'practice', n: 'Practice', d: 'Free build with unlimited materials and target dummies.' }
  ];

  const OL = c => `text-shadow:0 .08em 0 ${c},.05em 0 0 ${c},-.05em 0 0 ${c},0 -.05em 0 ${c},0 .16em .2em rgba(0,0,0,.35)`;
  const CSS = `
${G} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#7cc7ff;font-family:var(--sans);-webkit-user-select:none;user-select:none;color:#fff;box-shadow:0 22px 44px -30px rgba(31,29,43,.6)}
${G} .stage .g-canvas{border-radius:0;display:block;width:100%;height:100%;background:#7cc7ff}
${G} [hidden]{display:none!important}
${G} .ui{position:absolute;inset:0;pointer-events:none;font-size:clamp(10px,1.65cqw,17px)}
${G} .hud{position:absolute;inset:0;pointer-events:none}
${G} .xh{position:absolute;left:50%;top:50%;width:0;height:0}
${G} .xh i{position:absolute;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.45);border-radius:1px}
${G} .xh .a{width:2px;height:9px;left:-1px}${G} .xh .b{width:9px;height:2px;top:-1px}
${G} .xh .dot{width:3px;height:3px;left:-1.5px;top:-1.5px;border-radius:50%}
${G} .xh .ring{width:var(--rr,40px);height:var(--rr,40px);left:calc(var(--rr,40px)/-2);top:calc(var(--rr,40px)/-2);border-radius:50%;background:none;border:2px solid rgba(255,255,255,.85);box-shadow:0 0 0 1px rgba(0,0,0,.3),inset 0 0 0 1px rgba(0,0,0,.3)}
${G} .hm{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;opacity:0}
${G} .hm::before,${G} .hm::after{content:"";position:absolute;left:12px;top:-2px;width:2px;height:30px;background:#fff;transform:rotate(45deg);box-shadow:0 0 0 1px rgba(0,0,0,.4)}
${G} .hm::after{transform:rotate(-45deg)}
${G} .hm.on{animation:bb-hm .22s ease-out}
${G} .hm.hd::before,${G} .hm.hd::after{background:#ffd84a}
${G} .hm.kl::before,${G} .hm.kl::after{background:#ff4d5e}
@keyframes bb-hm{0%{opacity:1;transform:scale(1.35)}100%{opacity:0;transform:scale(.9)}}
${G} .scope{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent 0,transparent 33cqh,rgba(0,0,0,.92) 33.4cqh);opacity:0;transition:opacity .12s}
${G} .scope.on{opacity:1}
${G} .scope::before,${G} .scope::after{content:"";position:absolute;background:rgba(0,0,0,.85)}
${G} .scope::before{left:50%;top:18%;bottom:18%;width:1px}
${G} .scope::after{top:50%;left:30%;right:30%;height:1px}
${G} .vit{position:absolute;left:2%;bottom:3.2%;width:min(30%,22em);display:flex;flex-direction:column;gap:.35em}
${G} .bar{position:relative;height:1.35em;background:rgba(10,14,40,.55);border-radius:.3em;overflow:hidden;transform:skewX(-12deg);box-shadow:0 .15em 0 rgba(0,0,0,.25)}
${G} .bar i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%;transition:transform .15s}
${G} .bar.hp i{background:linear-gradient(#7dff7a,#2fbf4a)}
${G} .bar.sh i{background:linear-gradient(#8fe0ff,#2f8dff)}
${G} .bar b{position:absolute;left:.6em;top:50%;transform:translateY(-50%) skewX(12deg);font-weight:900;font-size:.92em;${OL('#0a1030')};font-variant-numeric:tabular-nums}
${G} .bar.lo i{animation:bb-lo .8s infinite alternate}
@keyframes bb-lo{to{filter:brightness(1.6)}}
${G} .mats{display:flex;gap:.4em;margin-bottom:.15em}
${G} .mat{display:flex;align-items:center;gap:.3em;padding:.2em .55em;border-radius:.4em;background:rgba(10,14,40,.5);font-weight:900;font-size:.85em;font-variant-numeric:tabular-nums;border:2px solid transparent}
${G} .mat.on{border-color:#ffd84a;background:rgba(40,30,10,.6)}
${G} .mat s{display:block;width:1.05em;height:1.05em;border-radius:.2em;text-decoration:none}
${G} .slots{position:absolute;right:2%;bottom:3.2%;display:flex;flex-direction:column;align-items:flex-end;gap:.45em}
${G} .row{display:flex;gap:.3em}
${G} .sl{position:relative;width:3.6em;height:3.3em;border-radius:.45em;background:rgba(10,14,40,.5);border:2px solid rgba(255,255,255,.12);display:grid;place-items:center;box-sizing:border-box}
${G} .sl.on{border-color:#fff;transform:translateY(-.25em);background:rgba(20,26,70,.75)}
${G} .sl em{position:absolute;left:.25em;top:.1em;font-style:normal;font-weight:900;font-size:.72em;opacity:.85}
${G} .sl u{position:absolute;right:.25em;bottom:.12em;text-decoration:none;font-weight:900;font-size:.78em;font-variant-numeric:tabular-nums}
${G} .sl span{display:grid;place-items:center;width:100%;height:100%}${G} .sl span svg,${G} .sl>svg{width:72%;height:62%}
${G} .sl .rb{position:absolute;left:0;right:0;bottom:0;height:.28em;border-radius:0 0 .3em .3em}
${G} .sl.bd{width:3.1em;height:3.1em}
${G} .sl.bd.on{border-color:#ffd84a}
${G} .ammo{position:absolute;right:2%;bottom:calc(3.2% + 8.4em);font-weight:900;font-size:1.5em;font-variant-numeric:tabular-nums;${OL('#0a1030')}}
${G} .ammo small{font-size:.6em;opacity:.8}
${G} .rel{position:absolute;left:50%;top:58%;transform:translateX(-50%);width:6em;height:.45em;border-radius:.3em;background:rgba(0,0,0,.45);overflow:hidden}
${G} .rel i{display:block;height:100%;background:#fff;transform-origin:0 50%}
${G} .top{position:absolute;left:50%;top:2.4%;transform:translateX(-50%);display:flex;align-items:stretch;gap:.3em;font-weight:900}
${G} .sc{min-width:3.2em;padding:.25em .7em;border-radius:.4em;text-align:center;font-size:1.25em;font-variant-numeric:tabular-nums;background:rgba(10,14,40,.55)}
${G} .sc.me{background:linear-gradient(#3fa7ff,#2369e0)}${G} .sc.op{background:linear-gradient(#ff6b7d,#d8324b)}
${G} .sc small{display:block;font-size:.5em;letter-spacing:.08em;opacity:.9;max-width:9em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${G} .clk{padding:.3em .8em;border-radius:.4em;background:rgba(10,14,40,.7);font-size:1.1em;font-variant-numeric:tabular-nums;display:flex;flex-direction:column;align-items:center;justify-content:center}
${G} .clk small{font-size:.55em;letter-spacing:.12em;opacity:.8}
${G} .feed{position:absolute;right:2%;top:2.4%;display:flex;flex-direction:column;align-items:flex-end;gap:.25em;max-width:40%}
${G} .feed div{padding:.25em .7em;border-radius:.35em;background:rgba(10,14,40,.55);font-weight:800;font-size:.82em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;animation:bb-feed 4.5s ease both}
${G} .feed div b{color:#ffd84a}${G} .feed div.me{background:rgba(47,141,255,.75)}
@keyframes bb-feed{0%{opacity:0;transform:translateX(1em)}6%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
${G} .big{position:absolute;left:0;right:0;top:30%;text-align:center;font-weight:900;font-style:italic;font-size:5.4em;line-height:1;letter-spacing:-.02em;text-transform:uppercase;opacity:0;${OL('#0a1030')}}
${G} .big small{display:block;font-size:.26em;letter-spacing:.14em;margin-top:.5em;font-style:normal}
${G} .big.show{animation:bb-big 1.6s cubic-bezier(.2,1.4,.4,1) both}
${G} .big.y{color:#ffd84a}${G} .big.r{color:#ff5d73}${G} .big.b{color:#8fe0ff}
@keyframes bb-big{0%{opacity:0;transform:scale(2)}14%{opacity:1;transform:scale(1)}80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.92)}}
${G} .dn{position:absolute;left:0;top:0;font-weight:900;font-size:1.35em;pointer-events:none;${OL('#0a1030')};will-change:transform,opacity}
${G} .dn.h{color:#ffd84a;font-size:1.65em}${G} .dn.s{color:#8fe0ff}${G} .dn.p{color:#e8e8e8;font-size:1em}
${G} .tip{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);padding:.35em .9em;border-radius:.4em;background:rgba(10,14,40,.6);font-weight:800;font-size:.9em;white-space:nowrap;opacity:0;transition:opacity .3s}
${G} .tip.on{opacity:1}
${G} .tip kbd,${G} .pan kbd,${G} .pan .kk{font-style:normal;display:inline-block;min-width:1.3em;padding:.05em .35em;border-radius:.3em;background:#fff;color:#14183a;font:900 .85em var(--sans);text-align:center;box-shadow:0 .12em 0 #7c84b8}
${G} .flash{position:absolute;inset:0;background:radial-gradient(circle,transparent 45%,rgba(255,40,60,.55));opacity:0;transition:opacity .35s}
${G} .flash.s{background:radial-gradient(circle,transparent 45%,rgba(60,160,255,.5))}
${G} .scr{position:absolute;inset:0;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-size:clamp(9px,1.6cqw,16px)}
${G} .scr.dim{background:radial-gradient(120% 90% at 50% 40%,rgba(12,16,50,.25),rgba(8,10,34,.78))}
${G} .pan{position:relative;width:min(92%,44em);max-height:92%;overflow:auto;padding:1.4em 1.6em;border-radius:1.1em;background:linear-gradient(160deg,rgba(32,40,110,.96),rgba(18,20,64,.96));box-shadow:0 1.2em 3em rgba(0,0,0,.45),inset 0 0 0 2px rgba(255,255,255,.08);box-sizing:border-box;scrollbar-width:thin}
${G} .pan h2{margin:0 0 .5em;font-weight:900;font-style:italic;font-size:2.1em;line-height:1;text-transform:uppercase;letter-spacing:-.01em;color:#ffd84a;${OL('#0a1030')}}
${G} .pan h3{margin:.9em 0 .4em;font-weight:900;font-size:.85em;letter-spacing:.14em;text-transform:uppercase;opacity:.8}
${G} .pan p{margin:.3em 0;font-weight:700;line-height:1.35;opacity:.92}
${G} .btn{display:inline-flex;align-items:center;justify-content:center;gap:.4em;min-height:44px;padding:.55em 1.3em;border:0;border-radius:.6em;background:linear-gradient(#ffe45c,#ffb21f);color:#2b1a00;font:900 1.1em/1 var(--sans);font-style:italic;text-transform:uppercase;letter-spacing:.02em;cursor:pointer;box-shadow:0 .25em 0 #c27400,0 .5em 1em rgba(0,0,0,.3);transition:transform .15s}
${G} .btn:hover{transform:translateY(-.08em)}${G} .btn:active{transform:translateY(.12em);box-shadow:0 .1em 0 #c27400}
${G} .btn.alt{background:linear-gradient(#ffffff,#d9e0ff);color:#16194a;box-shadow:0 .25em 0 #7f88c4,0 .5em 1em rgba(0,0,0,.3)}
${G} .btn.ghost{background:rgba(255,255,255,.12);color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25)}
${G} .btn:focus-visible,${G} .opt:focus-visible,${G} .mode:focus-visible{outline:3px solid #fff;outline-offset:2px}
${G} .btns{display:flex;flex-wrap:wrap;gap:.6em;margin-top:1em}
${G} .modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6em}
${G} .mode{position:relative;text-align:left;padding:.8em .9em;border:0;border-radius:.8em;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font:inherit;box-shadow:inset 0 0 0 2px rgba(255,255,255,.12);min-height:44px}
${G} .mode b{display:block;font-weight:900;font-style:italic;font-size:1.25em;text-transform:uppercase}
${G} .mode span{display:block;font-weight:700;font-size:.82em;opacity:.8;margin-top:.25em;line-height:1.3}
${G} .mode.on{background:linear-gradient(160deg,#3fa7ff,#2a5fe0);box-shadow:inset 0 0 0 2px #fff}
${G} .mode:hover{background:rgba(255,255,255,.16)}${G} .mode.on:hover{background:linear-gradient(160deg,#4fb2ff,#3368ea)}
${G} .opts{display:flex;flex-wrap:wrap;gap:.35em}
${G} .opt{min-height:36px;padding:.4em .85em;border:0;border-radius:99px;background:rgba(255,255,255,.12);color:#fff;font:800 .9em var(--sans);cursor:pointer}
${G} .opt.on{background:#fff;color:#16194a}
${G} .optrow{display:flex;align-items:center;justify-content:space-between;gap:.8em;margin:.45em 0;flex-wrap:wrap}
${G} .optrow>span{font-weight:800}
${G} .optrow input[type=range]{width:min(14em,60%);accent-color:#ffd84a}
${G} .title{position:absolute;left:4%;top:6%;font-weight:900;font-style:italic;font-size:4.6em;line-height:.85;letter-spacing:-.03em;text-transform:uppercase;color:#ffd84a;transform:rotate(-3deg);transform-origin:0 0;pointer-events:none;${OL('#0a1030')}}
${G} .title small{display:block;color:#fff;font-size:.26em;letter-spacing:.24em;margin-top:.45em;font-style:normal}
${G} .home{position:absolute;right:3.5%;top:3%;bottom:3%;display:flex;align-items:center;width:min(46%,30em)}
${G} .home .pan{width:100%;max-height:100%}
${G} .stats{position:absolute;left:4%;bottom:6%;display:flex;gap:.5em;pointer-events:none}
${G} .stats div{padding:.35em .8em;border-radius:.5em;background:rgba(10,14,40,.55);font-weight:900;font-size:.9em;text-align:center}
${G} .stats b{display:block;font-size:1.5em;font-variant-numeric:tabular-nums}
${G} .heroes{display:flex;gap:.4em;flex-wrap:wrap}
${G} .hero{width:2.6em;height:2.6em;min-width:36px;min-height:36px;border-radius:50%;border:3px solid rgba(255,255,255,.35);cursor:pointer;padding:0}
${G} .hero.on{border-color:#fff;transform:scale(1.12);box-shadow:0 0 0 3px #ffd84a}
${G} .res{display:grid;grid-template-columns:repeat(auto-fit,minmax(7em,1fr));gap:.5em;margin:.8em 0}
${G} .res div{padding:.5em;border-radius:.6em;background:rgba(255,255,255,.08);text-align:center;font-weight:800;font-size:.85em}
${G} .res b{display:block;font-size:1.7em;font-weight:900;font-variant-numeric:tabular-nums}
${G} .keys{display:grid;grid-template-columns:auto 1fr;gap:.35em .9em;align-items:center;font-weight:700;font-size:.92em}
${G} .pz{position:absolute;left:2%;top:2.4%;pointer-events:auto;width:2.7em;height:2.7em;min-width:40px;min-height:40px;border:0;border-radius:.6em;background:rgba(10,14,40,.55);color:#fff;cursor:pointer;display:grid;place-items:center}
${G} .pz i{display:block;width:.85em;height:.95em;border-left:.28em solid #fff;border-right:.28em solid #fff;box-sizing:border-box}
${G} .net{position:absolute;left:calc(2% + 3.4em);top:2.4%;padding:.35em .7em;border-radius:.4em;background:rgba(10,14,40,.55);font-weight:800;font-size:.75em;line-height:1.6}
${G} .net.bad{background:rgba(200,40,60,.75)}
${G} .edit{position:absolute;left:50%;top:66%;transform:translateX(-50%);padding:.35em .9em;border-radius:.4em;background:rgba(47,141,255,.8);font-weight:900;font-size:.95em;letter-spacing:.06em;text-transform:uppercase}
${G} .tc{position:absolute;inset:0;pointer-events:none}
${G} .joy{position:absolute;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:rgba(255,255,255,.16);box-shadow:inset 0 0 0 3px rgba(255,255,255,.45);opacity:0;transition:opacity .2s}
${G} .joy.on{opacity:1}${G} .joy.idle{left:90px;top:calc(100% - 100px);opacity:.4}
${G} .joy i{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(255,255,255,.8)}
${G} .tb{position:absolute;pointer-events:auto;border:0;border-radius:50%;display:grid;place-items:center;font:900 11px var(--sans);color:#fff;background:rgba(10,14,40,.5);box-shadow:inset 0 0 0 2px rgba(255,255,255,.4);touch-action:none;cursor:pointer;width:52px;height:52px;${OL('#0a1030')}}
${G} .tb.on{background:rgba(255,216,74,.7)}
${G} .tb.fire{width:78px;height:78px;background:rgba(255,80,96,.55);font-size:13px}
${G} .tb svg{width:58%;height:58%}
${G} .stage.touch .slots{bottom:auto;top:12%;right:2%}
${G} .stage.touch .ammo{bottom:auto;top:calc(12% + 7.6em)}
${G} .stage.touch .vit{bottom:auto;top:12%;left:calc(2% + 3.6em)}
${G} .stage.touch .tip{bottom:auto;top:24%}
${G} .stage.touch .sl{width:3em;height:2.8em}
${G} .stage.touch .sl.bd{display:none}
${G} .wait{display:flex;align-items:center;gap:.6em;justify-content:center;font-weight:900;font-size:1.2em}
${G} .wait i{width:1em;height:1em;border-radius:50%;border:.2em solid rgba(255,255,255,.3);border-top-color:#fff;animation:bb-spin .8s linear infinite}
@keyframes bb-spin{to{transform:rotate(1turn)}}
@container (max-width:620px){
${G} .title{font-size:2.6em;top:4%}
${G} .home{right:auto;left:3%;top:auto;bottom:2%;width:94%;max-height:76%}
${G} .home .pan{padding:1em}
${G} .stats{display:none}
${G} .modes{grid-template-columns:1fr 1fr}
${G} .mode span{display:none}
${G} .big{font-size:3.2em}
${G} .pan h2{font-size:1.6em}
}
@media (prefers-reduced-motion:reduce){${G} .big.show{animation-duration:2.2s}${G} .feed div{animation:none}}
`;

  function makeAudio(api) {
    let ctx = null, out = null, noiseB = null;
    const ensure = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.5; out.connect(ctx.destination);
        noiseB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
      return ctx;
    };
    const tone = (f0, f1, dur, type, vol, when = 0, pan = 0) => {
      const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      let n = g;
      if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); n = p; }
      o.connect(g); n.connect(out); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (dur, vol, f, q = 1, when = 0, type = 'bandpass', f1 = 0, pan = 0) => {
      const t = ctx.currentTime + when, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseB; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      let n = g;
      if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); n = p; }
      s.connect(fl); fl.connect(g); n.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
    };
    const S = {
      ar: (v, p) => { noise(0.12, 0.5 * v, 1800, 0.7, 0, 'bandpass', 600, p); tone(160, 60, 0.08, 'square', 0.12 * v, 0, p); },
      sg: (v, p) => { noise(0.35, 0.8 * v, 900, 0.5, 0, 'lowpass', 160, p); tone(110, 40, 0.2, 'sawtooth', 0.2 * v, 0, p); noise(0.08, 0.25 * v, 3500, 1, 0.42, 'bandpass', 0, p); noise(0.06, 0.2 * v, 2500, 1, 0.55, 'bandpass', 0, p); },
      smg: (v, p) => { noise(0.07, 0.38 * v, 2600, 0.8, 0, 'bandpass', 900, p); tone(220, 90, 0.05, 'square', 0.08 * v, 0, p); },
      sn: (v, p) => { noise(0.6, 0.9 * v, 1400, 0.5, 0, 'lowpass', 120, p); tone(90, 35, 0.35, 'sawtooth', 0.25 * v, 0, p); noise(0.12, 0.18 * v, 3000, 2, 0.7, 'bandpass', 0, p); },
      pick: (v, p) => { noise(0.1, 0.35 * v, 800, 1.2, 0, 'bandpass', 300, p); },
      empty: () => tone(1400, 1300, 0.04, 'square', 0.04),
      rel: () => { noise(0.05, 0.2, 3000, 2); noise(0.05, 0.2, 2200, 2, 0.12); },
      relEnd: () => { noise(0.06, 0.25, 2600, 2); tone(900, 700, 0.05, 'square', 0.04, 0.04); },
      shell: () => { noise(0.05, 0.25, 2000, 2); tone(600, 500, 0.04, 'triangle', 0.05, 0.02); },
      swap: () => noise(0.06, 0.15, 3500, 1.5),
      build0: (v, p) => { noise(0.12, 0.45 * v, 600, 0.8, 0, 'lowpass', 200, p); tone(220, 140, 0.08, 'triangle', 0.18 * v, 0, p); },
      build1: (v, p) => { noise(0.14, 0.5 * v, 400, 0.8, 0, 'lowpass', 150, p); tone(140, 90, 0.1, 'triangle', 0.2 * v, 0, p); },
      build2: (v, p) => { noise(0.1, 0.35 * v, 2500, 2, 0, 'bandpass', 1500, p); tone(520, 380, 0.16, 'triangle', 0.12 * v, 0, p); tone(1040, 760, 0.12, 'sine', 0.05 * v, 0, p); },
      hit0: (v, p) => noise(0.06, 0.25 * v, 700, 1, 0, 'bandpass', 0, p),
      hit1: (v, p) => noise(0.06, 0.25 * v, 1300, 1.5, 0, 'bandpass', 0, p),
      hit2: (v, p) => { tone(1800, 1500, 0.06, 'triangle', 0.06 * v, 0, p); noise(0.04, 0.15 * v, 4000, 2, 0, 'bandpass', 0, p); },
      brk0: (v, p) => { noise(0.4, 0.6 * v, 500, 0.7, 0, 'lowpass', 120, p); noise(0.2, 0.3 * v, 1800, 1, 0.05, 'bandpass', 600, p); },
      brk1: (v, p) => { noise(0.5, 0.7 * v, 300, 0.7, 0, 'lowpass', 90, p); tone(90, 40, 0.3, 'sine', 0.2 * v, 0, p); },
      brk2: (v, p) => { noise(0.4, 0.5 * v, 3000, 1.5, 0, 'bandpass', 900, p); tone(700, 300, 0.3, 'triangle', 0.1 * v, 0, p); },
      edit: () => { tone(900, 1200, 0.05, 'sine', 0.06); },
      editOk: () => { tone(700, 900, 0.06, 'triangle', 0.1); noise(0.08, 0.2, 900, 1, 0.02); },
      tick: () => { tone(2400, 2400, 0.03, 'square', 0.035); },
      hitMark: () => { tone(1700, 1700, 0.03, 'square', 0.05); tone(2500, 2500, 0.025, 'sine', 0.04, 0.005); },
      head: () => { tone(2900, 2900, 0.06, 'square', 0.06); tone(1450, 1450, 0.08, 'sine', 0.06, 0.01); },
      shBreak: () => { tone(1600, 600, 0.25, 'triangle', 0.1); noise(0.25, 0.2, 5000, 1, 0, 'highpass'); },
      hurt: () => { tone(200, 110, 0.18, 'sawtooth', 0.12); noise(0.1, 0.2, 700, 1); },
      hurtSh: () => { tone(900, 500, 0.14, 'triangle', 0.08); noise(0.1, 0.15, 3000, 1); },
      elim: () => { [523, 659, 784].forEach((f, i) => tone(f, f, 0.14, 'square', 0.06, i * 0.07)); tone(1047, 1047, 0.4, 'square', 0.07, 0.21); },
      dead: () => { tone(330, 150, 0.7, 'sawtooth', 0.09); tone(220, 90, 0.8, 'sawtooth', 0.07, 0.15); },
      jump: () => tone(300, 420, 0.08, 'sine', 0.05),
      land: () => tone(140, 70, 0.07, 'sine', 0.09),
      step: () => noise(0.04, 0.06, 700 + Math.random() * 300, 1),
      beep: () => tone(660, 660, 0.15, 'square', 0.06),
      go: () => { tone(990, 990, 0.4, 'square', 0.07); tone(1320, 1320, 0.4, 'sine', 0.05); },
      win: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.25, 'square', 0.05, i * 0.11)); },
      lose: () => { [392, 370, 349, 262].forEach((f, i) => tone(f, f * 0.98, 0.3, 'sawtooth', 0.05, i * 0.22)); },
      tap: () => tone(700, 900, 0.05, 'sine', 0.05),
      deny: () => tone(240, 200, 0.12, 'square', 0.05)
    };
    return {
      play(n, v = 1, p = 0) { if (api.muted || v < 0.02) return; const c = ensure(); if (!c) return; if (c.state !== 'running') c.resume().catch(() => {}); try { S[n](Math.min(1, v), clamp(p, -1, 1)); } catch (e) {} },
      wake() { if (api.muted) return; const c = ensure(); if (c && c.state !== 'running') c.resume().catch(() => {}); },
      close() { if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
  }

  const DX4 = [1, 0, -1, 0], DZ4 = [0, 1, 0, -1];
  const PK = (slot, x, z, l) => ((slot * 32 + l) * 64 + (x + 32)) * 64 + (z + 32);
  const LOADOUT = { build: [1, 2, 3, 4], box: [1, 2, 3], ffa: [1, 2, 3, 4], practice: [1, 2, 3, 4] };
  const RAR_W = [0.1, 0.2, 0.3, 0.25, 0.15];
  function rollRarity() { let r = Math.random(); for (let i = 0; i < 5; i++) { r -= RAR_W[i]; if (r <= 0) return i; } return 4; }

  function makeSim(cfg) {
    const S = {
      t: 0, mode: cfg.mode, phase: 'count', pt: 3, rt: 0, round: 0, goal: cfg.target || 3, pieces: new Map(), byId: new Map(), nextId: 1,
      pl: [], pts: [0, 0, 0, 0], winner: -1, roundWinner: -1, infinite: cfg.mode === 'practice', rarity: cfg.rarity || 'random', loadR: [0, 0, 0, 0, 0],
      evq: [], evc: 0, quiet: !!cfg.quiet, arena: null, kills: 0, remote: !!cfg.remote, ffaTarget: cfg.ffaTarget || 7, ffaTime: 300, dummy: cfg.mode === 'practice'
    };
    const con = new Map();
    const EVN = 768, DUMMY = { k: '' };
    for (let i = 0; i < EVN; i++) S.evq.push({ k: '', a: 0, b: 0, x: 0, y: 0, z: 0, u: 0, v: 0, w: 0, n: 0, p: null });
    const emit = k => { if (S.quiet || S.evc >= EVN) return DUMMY; const e = S.evq[S.evc++]; e.k = k; e.p = null; e.n = 0; return e; };
    S.emit = emit;
    const bounds = S.mode === 'box' ? [-3, 2, -3, 2, 3] : [-HALF, HALF - 1, -HALF, HALF - 1, MAXL];
    S.bounds = bounds;

    const CK = (k, x, z, l) => ((k * 32 + l) * 64 + (x + 32)) * 64 + (z + 32);
    function conKeys(pc) {
      const { x, z, l } = pc, out = [];
      if (pc.type === 0) {
        if (pc.slot === 0) out.push(CK(0, x, z, l), CK(0, x, z, l + 1), CK(2, x, z, l), CK(2, x + 1, z, l));
        else out.push(CK(1, x, z, l), CK(1, x, z, l + 1), CK(2, x, z, l), CK(2, x, z + 1, l));
      } else if (pc.type === 1 || pc.type === 3) out.push(CK(0, x, z, l), CK(0, x, z + 1, l), CK(1, x, z, l), CK(1, x + 1, z, l));
      else {
        const d = pc.d;
        if (d === 0) out.push(CK(1, x, z, l), CK(1, x + 1, z, l + 1), CK(0, x, z, l), CK(0, x, z + 1, l));
        else if (d === 1) out.push(CK(0, x, z, l), CK(0, x, z + 1, l + 1), CK(1, x, z, l), CK(1, x + 1, z, l));
        else if (d === 2) out.push(CK(1, x + 1, z, l), CK(1, x, z, l + 1), CK(0, x, z, l), CK(0, x, z + 1, l));
        else out.push(CK(0, x, z + 1, l), CK(0, x, z, l + 1), CK(1, x, z, l), CK(1, x + 1, z, l));
      }
      return out;
    }
    const groundKey = k => { const l = ((k / 4096) | 0) % 32, kind = (k / 131072) | 0; return l === 0 && kind < 2; };
    const conAdd = pc => { for (const k of pc.con) { let s = con.get(k); if (!s) con.set(k, s = new Set()); s.add(pc); } };
    const conDel = pc => { for (const k of pc.con) { const s = con.get(k); if (s) { s.delete(pc); if (!s.size) con.delete(k); } } };
    function supported(pc) {
      if (pc.l === 0) return true;
      for (const k of pc.con) { const s = con.get(k); if (s && s.size) return true; }
      return false;
    }
    const slotOf = (type, d) => type === 0 ? d : type === 1 ? 2 : 3;
    function hpOf(pc) { if (pc.mat === 3) return 1e9; const m = MATS[pc.mat], g = m.bt > 0 ? Math.min(1, (S.t - pc.born) / m.bt) : 1; return m.s + (pc.max - m.s) * g - pc.dmg; }
    S.hpOf = hpOf;
    function addPiece(type, x, z, l, d, mat, team, owner, full) {
      const slot = slotOf(type, d), key = PK(slot, x, z, l);
      if (S.pieces.has(key)) return null;
      const pc = { id: S.nextId++, key, slot, type, x, z, l, d: type === 0 ? slot : d, mat, max: MATS[mat].hp, dmg: 0, born: full ? -99 : S.t, team, owner, edit: 0, con: null, rs: 0 };
      pc.con = conKeys(pc);
      S.pieces.set(key, pc); S.byId.set(pc.id, pc); conAdd(pc);
      const e = emit('build'); e.p = pc; e.a = owner;
      return pc;
    }
    S.addPiece = addPiece;
    function removePiece(pc, why) {
      if (!S.pieces.has(pc.key) || S.pieces.get(pc.key) !== pc) return;
      S.pieces.delete(pc.key); S.byId.delete(pc.id); conDel(pc);
      const e = emit('break'); e.p = pc; e.n = why || 0;
      for (const p of S.pl) if (p.sup === pc) p.sup = null;
      collapseFrom(pc);
    }
    S.removePiece = removePiece;
    function neighbours(pc, out) { for (const k of pc.con) { const s = con.get(k); if (s) for (const q of s) if (q !== pc) out.add(q); } }
    function collapseFrom(pc) {
      const start = new Set();
      neighbours(pc, start);
      const done = new Set();
      for (const s of start) {
        if (done.has(s)) continue;
        const comp = [s], seen = new Set([s]);
        let ok = false;
        for (let i = 0; i < comp.length && comp.length < 4000; i++) {
          const q = comp[i];
          if (q.l === 0 || q.mat === 3) { ok = true; break; }
          for (const k of q.con) { const st = con.get(k); if (st) for (const r of st) if (!seen.has(r)) { seen.add(r); comp.push(r); } }
        }
        for (const q of seen) done.add(q);
        if (!ok) for (const q of comp) { if (S.pieces.get(q.key) === q) { S.pieces.delete(q.key); S.byId.delete(q.id); conDel(q); const e = emit('break'); e.p = q; e.n = 2; for (const p of S.pl) if (p.sup === q) p.sup = null; } }
      }
    }
    function damagePiece(pc, amt, by) {
      if (pc.mat === 3 || amt <= 0) return;
      pc.dmg += amt;
      const e = emit('phit'); e.p = pc; e.v = amt; e.a = by ? by.i : -1;
      if (hpOf(pc) <= 0) removePiece(pc, 1);
    }
    S.damagePiece = damagePiece;
    S.clearPieces = keepArena => { for (const pc of Array.from(S.pieces.values())) if (!keepArena || pc.mat !== 3) { S.pieces.delete(pc.key); S.byId.delete(pc.id); conDel(pc); } const e = emit('reset'); };

    const BXN = 1024, BX = new Float32Array(BXN * 6), BP = new Array(BXN), BO = new Uint8Array(BXN), HF = new Array(64);
    let nb = 0, nh = 0;
    function pushBox(pc, x0, x1, y0, y1, z0, z1) { if (nb >= BXN) return; const o = nb * 6; BX[o] = x0; BX[o + 1] = x1; BX[o + 2] = y0; BX[o + 3] = y1; BX[o + 4] = z0; BX[o + 5] = z1; BP[nb] = pc; nb++; }
    function boxesOf(pc) {
      const bx = pc.x * TS, bz = pc.z * TS, by = pc.l * LH, e = pc.edit;
      if (pc.type === 0) {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          if (e >> (r * 3 + c) & 1) continue;
          const y0 = by + r * LH / 3, y1 = y0 + LH / 3;
          if (pc.slot === 0) pushBox(pc, bx + c * TS / 3, bx + (c + 1) * TS / 3, y0, y1, bz - WT / 2, bz + WT / 2);
          else pushBox(pc, bx - WT / 2, bx + WT / 2, y0, y1, bz + c * TS / 3, bz + (c + 1) * TS / 3);
        }
      } else if (pc.type === 1) {
        for (let q = 0; q < 4; q++) { if (e >> q & 1) continue; const qx = q & 1, qz = q >> 1; pushBox(pc, bx + qx * TS / 2, bx + (qx + 1) * TS / 2, by - FT, by, bz + qz * TS / 2, bz + (qz + 1) * TS / 2); }
      }
    }
    function gather(x0, x1, y0, y1, z0, z1) {
      nb = 0; nh = 0;
      const ax = Math.floor(x0 / TS), bx = Math.floor(x1 / TS), az = Math.floor(z0 / TS), bz = Math.floor(z1 / TS);
      const al = Math.max(0, Math.floor(y0 / LH) - 1), bl = Math.min(MAXL, Math.floor(y1 / LH) + 1);
      const P = S.pieces;
      for (let l = al; l <= bl; l++) for (let x = ax; x <= bx + 1; x++) for (let z = az; z <= bz + 1; z++) {
        let pc;
        if (x <= bx && (pc = P.get(PK(0, x, z, l)))) boxesOf(pc);
        if (z <= bz && (pc = P.get(PK(1, x, z, l)))) boxesOf(pc);
        if (x <= bx && z <= bz) {
          if ((pc = P.get(PK(2, x, z, l)))) boxesOf(pc);
          if ((pc = P.get(PK(3, x, z, l))) && nh < 64) HF[nh++] = pc;
        }
      }
    }
    function surf(pc, X, Z) {
      const u = X / TS - pc.x, w = Z / TS - pc.z;
      if (u < 0 || u > 1 || w < 0 || w > 1) return -1e9;
      const base = pc.l * LH;
      if (pc.type === 2) { const d = pc.d, s = d === 0 ? u : d === 1 ? w : d === 2 ? 1 - u : 1 - w; return base + LH * s; }
      const q = (u >= 0.5 ? 1 : 0) + (w >= 0.5 ? 2 : 0);
      if (pc.edit >> q & 1) return -1e9;
      return base + CH * (1 - 2 * Math.max(Math.abs(u - 0.5), Math.abs(w - 0.5)));
    }
    S.surf = surf;
    const inIsland = (x, z) => x > -HALF * TS - 0.01 && x < HALF * TS + 0.01 && z > -HALF * TS - 0.01 && z < HALF * TS + 0.01;
    const ov = (o, x0, x1, y0, y1, z0, z1) => BX[o] < x1 - 1e-4 && BX[o + 1] > x0 + 1e-4 && BX[o + 2] < y1 - 1e-4 && BX[o + 3] > y0 + 1e-4 && BX[o + 4] < z1 - 1e-4 && BX[o + 5] > z0 + 1e-4;
    function markOverlap(p, h) { for (let i = 0; i < nb; i++) BO[i] = ov(i * 6, p.x - P_R, p.x + P_R, p.y, p.y + h, p.z - P_R, p.z + P_R) ? 1 : 0; }
    function blocked(p, x, y, z, h) {
      const x0 = x - P_R, x1 = x + P_R, z0 = z - P_R, z1 = z + P_R;
      for (let i = 0; i < nb; i++) {
        if (BO[i]) continue;
        const o = i * 6;
        if (!ov(o, x0, x1, y, y + h, z0, z1)) continue;
        if (BX[o + 3] <= y + STEP_UP && BX[o + 3] - y < h) { if (!headClear(x, BX[o + 3], z, h)) return true; continue; }
        return true;
      }
      for (let i = 0; i < nh; i++) {
        const pc = HF[i], s = surf(pc, x, z);
        if (s < -1e8) continue;
        if (s - y > STEP_UP + 0.05 && s - 0.32 < y + h) {
          const s0 = surf(pc, p.x, p.z);
          if (s0 > -1e8 && s0 - p.y > STEP_UP + 0.05 && s0 - 0.32 < p.y + h) continue;
          return true;
        }
      }
      return false;
    }
    function headClear(x, y, z, h) {
      const x0 = x - P_R, x1 = x + P_R, z0 = z - P_R, z1 = z + P_R;
      for (let i = 0; i < nb; i++) { if (BO[i]) continue; const o = i * 6; if (BX[o + 2] >= y + 0.01 && ov(o, x0, x1, y, y + h, z0, z1)) return false; }
      return true;
    }
    function support(p, x, z, y) {
      let s = inIsland(x, z) ? 0 : -1e9, sp = null;
      const x0 = x - P_R * 0.92, x1 = x + P_R * 0.92, z0 = z - P_R * 0.92, z1 = z + P_R * 0.92;
      for (let i = 0; i < nb; i++) {
        const o = i * 6;
        if (BX[o] >= x1 || BX[o + 1] <= x0 || BX[o + 4] >= z1 || BX[o + 5] <= z0) continue;
        const top = BX[o + 3];
        if (top <= y + STEP_UP + 0.02 && top > s) { s = top; sp = BP[i]; }
      }
      for (let i = 0; i < nh; i++) {
        const pc = HF[i];
        for (let k = 0; k < 5; k++) {
          const sx = k === 0 ? x : x + (k & 1 ? 0.7 : -0.7) * P_R, sz = k === 0 ? z : z + (k & 2 ? 0.7 : -0.7) * P_R;
          const h = surf(pc, sx, sz);
          if (h <= y + STEP_UP + 0.02 && h > s) { s = h; sp = pc; }
        }
      }
      p.supTmp = sp;
      return s;
    }
    function ceiling(x, z, y, h) {
      let c = 1e9;
      const x0 = x - P_R, x1 = x + P_R, z0 = z - P_R, z1 = z + P_R;
      for (let i = 0; i < nb; i++) {
        if (BO[i]) continue;
        const o = i * 6;
        if (BX[o] >= x1 || BX[o + 1] <= x0 || BX[o + 4] >= z1 || BX[o + 5] <= z0) continue;
        if (BX[o + 2] >= y + h - 0.02 && BX[o + 2] < c) c = BX[o + 2];
      }
      for (let i = 0; i < nh; i++) { const u = surf(HF[i], x, z) - 0.32; if (u > -1e8 && u >= y + h - 0.02 && u < c) c = u; }
      return c;
    }

    function movePlayer(p, dt) {
      const inp = p.inp;
      let h = p.crouch ? P_HC : P_H;
      gather(p.x - 3, p.x + 3, p.y - 2, p.y + 4, p.z - 3, p.z + 3);
      markOverlap(p, h);
      if (p.crouch && !inp.crouch) { if (ceiling(p.x, p.z, p.y, P_HC) >= p.y + P_H) { p.crouch = false; h = P_H; } }
      else if (!p.crouch && inp.crouch && p.onG) { p.crouch = true; h = P_HC; }
      const sp = (p.crouch ? CROUCH : p.ads && p.slot > 0 && p.build < 0 ? ADS_RUN : RUN) * (p.slowT > 0 ? 0.5 : 1);
      let mx = inp.mx, mz = inp.mz;
      const m = Math.hypot(mx, mz); if (m > 1) { mx /= m; mz /= m; }
      const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
      const wx = (fx * mz - fz * mx) * sp, wz = (fz * mz + fx * mx) * sp;
      const acc = p.onG ? 70 : 16;
      const dvx = wx - p.vx, dvz = wz - p.vz, dl = Math.hypot(dvx, dvz), mv = acc * dt;
      if (dl > mv) { p.vx += dvx / dl * mv; p.vz += dvz / dl * mv; } else { p.vx = wx; p.vz = wz; }
      if (inp.jump && p.onG && p.jumpCD <= 0) { p.vy = JUMP_V; p.onG = false; p.jumpCD = 0.25; p.fallY = p.y; const e = emit('jump'); e.a = p.i; }
      p.vy -= GRAV * dt; if (p.vy < -40) p.vy = -40;
      let nx = p.x + p.vx * dt;
      const lim = (bounds[1] + 1) * TS - P_R, lim0 = bounds[0] * TS + P_R, limz = (bounds[3] + 1) * TS - P_R, limz0 = bounds[2] * TS + P_R;
      if (nx > lim) { nx = lim; p.vx = 0; } else if (nx < lim0) { nx = lim0; p.vx = 0; }
      if (!blocked(p, nx, p.y, p.z, h)) p.x = nx; else p.vx = 0;
      let nz = p.z + p.vz * dt;
      if (nz > limz) { nz = limz; p.vz = 0; } else if (nz < limz0) { nz = limz0; p.vz = 0; }
      if (!blocked(p, p.x, p.y, nz, h)) p.z = nz; else p.vz = 0;
      const wasG = p.onG;
      let ny = p.y + p.vy * dt;
      if (p.vy <= 0) {
        const s = support(p, p.x, p.z, p.y);
        if (ny <= s) { ny = s; if (!wasG) land(p, s); p.vy = 0; p.onG = true; p.sup = p.supTmp; }
        else if (wasG && p.y - s < 0.55 && p.jumpCD < 0.2) { ny = s; p.vy = 0; p.onG = true; p.sup = p.supTmp; }
        else { if (wasG) p.fallY = p.y; p.onG = false; p.sup = null; }
      } else {
        const c = ceiling(p.x, p.z, p.y, h);
        if (ny + h > c) { ny = Math.max(p.y, c - h); p.vy = 0; }
        p.onG = false; p.sup = null;
      }
      p.y = ny;
      if (p.y < -30 && !S.client) killPlayer(p, null, 2);
    }
    function land(p, s) {
      const drop = p.fallY - s;
      if (drop > 10.5 && S.phase !== 'count') { const d = Math.min(150, (drop - 10.5) * 6); if (S.client) { if (S.onFall) S.onFall(d); } else hurt(p, d, null, 0, 3); }
      if (drop > 1.2) { const e = emit('land'); e.a = p.i; e.v = drop; }
    }

    const R = { t: 0, kind: 0, pc: null, pl: null, head: false, x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0 };
    S.R = R;
    let stamp = 0;
    function linT(base, K, A, B, C, ox, oy, oz, dx, dy, dz) {
      const den = dy - K * (A * dx + B * dz);
      if (Math.abs(den) < 1e-9) return 1e9;
      return (base + K * (A * ox + B * oz + C) - oy) / den;
    }
    function rayPiece(pc, ox, oy, oz, dx, dy, dz, holes) {
      const bx = pc.x * TS, bz = pc.z * TS, by = pc.l * LH;
      let t = 1e9;
      if (pc.type === 0) {
        if (pc.slot === 0) {
          if (Math.abs(dz) < 1e-9) return 1e9;
          t = (bz - oz) / dz; if (t < 0) return 1e9;
          const u = (ox + dx * t - bx) / TS, v = (oy + dy * t - by) / LH;
          if (u < 0 || u > 1 || v < 0 || v > 1) return 1e9;
          if (!holes && pc.edit && (pc.edit >> (Math.min(2, (v * 3) | 0) * 3 + Math.min(2, (u * 3) | 0)) & 1)) return 1e9;
          R.nx = 0; R.ny = 0; R.nz = dz > 0 ? -1 : 1; R.u = u; R.v = v;
        } else {
          if (Math.abs(dx) < 1e-9) return 1e9;
          t = (bx - ox) / dx; if (t < 0) return 1e9;
          const u = (oz + dz * t - bz) / TS, v = (oy + dy * t - by) / LH;
          if (u < 0 || u > 1 || v < 0 || v > 1) return 1e9;
          if (!holes && pc.edit && (pc.edit >> (Math.min(2, (v * 3) | 0) * 3 + Math.min(2, (u * 3) | 0)) & 1)) return 1e9;
          R.nx = dx > 0 ? -1 : 1; R.ny = 0; R.nz = 0; R.u = u; R.v = v;
        }
        return t;
      }
      if (pc.type === 1) {
        if (Math.abs(dy) < 1e-9) return 1e9;
        t = (by - oy) / dy; if (t < 0) return 1e9;
        const u = (ox + dx * t - bx) / TS, w = (oz + dz * t - bz) / TS;
        if (u < 0 || u > 1 || w < 0 || w > 1) return 1e9;
        if (!holes && pc.edit && (pc.edit >> ((u >= 0.5 ? 1 : 0) + (w >= 0.5 ? 2 : 0)) & 1)) return 1e9;
        R.nx = 0; R.ny = dy > 0 ? -1 : 1; R.nz = 0; R.u = u; R.v = w;
        return t;
      }
      if (pc.type === 2) {
        const d = pc.d, A = d === 0 ? 1 / TS : d === 2 ? -1 / TS : 0, B = d === 1 ? 1 / TS : d === 3 ? -1 / TS : 0, C = d === 0 ? -pc.x : d === 1 ? -pc.z : d === 2 ? 1 + pc.x : 1 + pc.z;
        t = linT(by, LH, A, B, C, ox, oy, oz, dx, dy, dz);
        if (t < 0 || t > 1e8) return 1e9;
        const u = (ox + dx * t - bx) / TS, w = (oz + dz * t - bz) / TS;
        if (u < 0 || u > 1 || w < 0 || w > 1) return 1e9;
        const n = Math.hypot(LH * A, 1, LH * B), sg = (dy - LH * (A * dx + B * dz)) > 0 ? -1 : 1;
        R.nx = -LH * A / n * sg; R.ny = 1 / n * sg; R.nz = -LH * B / n * sg; R.u = u; R.v = w;
        return t;
      }
      let best = 1e9;
      for (let f = 0; f < 4; f++) {
        const A = f === 0 ? -1 / TS : f === 2 ? 1 / TS : 0, B = f === 1 ? -1 / TS : f === 3 ? 1 / TS : 0, C = f === 0 ? 1 + pc.x : f === 1 ? 1 + pc.z : f === 2 ? -pc.x : -pc.z;
        const tt = linT(by, 2 * CH, A, B, C, ox, oy, oz, dx, dy, dz);
        if (tt < 0 || tt >= best) continue;
        const u = (ox + dx * tt - bx) / TS, w = (oz + dz * tt - bz) / TS;
        if (u < 0 || u > 1 || w < 0 || w > 1) continue;
        const au = u - 0.5, aw = w - 0.5;
        const ok = f === 0 ? au >= Math.abs(aw) : f === 1 ? aw >= Math.abs(au) : f === 2 ? -au >= Math.abs(aw) : -aw >= Math.abs(au);
        if (!ok) continue;
        if (!holes && pc.edit && (pc.edit >> ((u >= 0.5 ? 1 : 0) + (w >= 0.5 ? 2 : 0)) & 1)) continue;
        best = tt; R.u = u; R.v = w; R.nx = 0; R.ny = 1; R.nz = 0;
      }
      return best;
    }
    function testCell(cx, cz, cl, ox, oy, oz, dx, dy, dz, best, holes) {
      if (cl < 0 || cl > MAXL) return best;
      const P = S.pieces;
      for (let k = 0; k < 7; k++) {
        const pc = k === 0 ? P.get(PK(0, cx, cz, cl)) : k === 1 ? P.get(PK(0, cx, cz + 1, cl)) : k === 2 ? P.get(PK(1, cx, cz, cl)) : k === 3 ? P.get(PK(1, cx + 1, cz, cl)) : k === 4 ? P.get(PK(2, cx, cz, cl)) : k === 5 ? P.get(PK(2, cx, cz, cl + 1)) : P.get(PK(3, cx, cz, cl));
        if (!pc || pc.rs === stamp) continue;
        pc.rs = stamp;
        const nx = R.nx, ny = R.ny, nz = R.nz, u = R.u, v = R.v;
        const t = rayPiece(pc, ox, oy, oz, dx, dy, dz, holes);
        if (t < best) { best = t; R.pc = pc; R.kind = 2; R.hnx = R.nx; R.hny = R.ny; R.hnz = R.nz; R.hu = R.u; R.hv = R.v; }
        else { R.nx = nx; R.ny = ny; R.nz = nz; R.u = u; R.v = v; }
      }
      return best;
    }
    function rayWorld(ox, oy, oz, dx, dy, dz, max, holes) {
      stamp++; R.kind = 0; R.pc = null; R.pl = null; R.head = false;
      let best = max;
      if (dy < 0) { const t = -oy / dy; if (t < best && inIsland(ox + dx * t, oz + dz * t)) { best = t; R.kind = 1; R.hnx = 0; R.hny = 1; R.hnz = 0; } }
      let cx = Math.floor(ox / TS), cl = Math.floor(oy / LH), cz = Math.floor(oz / TS);
      const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
      const idx = Math.abs(dx) > 1e-9 ? TS / Math.abs(dx) : 1e9, idy = Math.abs(dy) > 1e-9 ? LH / Math.abs(dy) : 1e9, idz = Math.abs(dz) > 1e-9 ? TS / Math.abs(dz) : 1e9;
      let tx = Math.abs(dx) > 1e-9 ? ((cx + (dx > 0 ? 1 : 0)) * TS - ox) / dx : 1e9;
      let ty = Math.abs(dy) > 1e-9 ? ((cl + (dy > 0 ? 1 : 0)) * LH - oy) / dy : 1e9;
      let tz = Math.abs(dz) > 1e-9 ? ((cz + (dz > 0 ? 1 : 0)) * TS - oz) / dz : 1e9;
      for (let n = 0; n < 160; n++) {
        if (cx >= -HALF - 1 && cx <= HALF && cz >= -HALF - 1 && cz <= HALF) best = testCell(cx, cz, cl, ox, oy, oz, dx, dy, dz, best, holes);
        const tn = Math.min(tx, ty, tz);
        if (best <= tn || tn > max) break;
        if (tx === tn) { cx += sx; tx += idx; } else if (ty === tn) { cl += sy; ty += idy; } else { cz += sz; tz += idz; }
        if (cl > MAXL + 1 && sy > 0) break;
        if (cl < -1 && sy < 0) break;
        if ((cx < -HALF - 2 && sx < 0) || (cx > HALF + 1 && sx > 0) || (cz < -HALF - 2 && sz < 0) || (cz > HALF + 1 && sz > 0)) break;
      }
      R.t = best;
      return best;
    }
    S.rayWorld = rayWorld;
    function rayPlayer(q, ox, oy, oz, dx, dy, dz, max) {
      const ht = q.crouch ? 1.12 : 1.58, bt = q.crouch ? 0.92 : 1.38;
      let best = max, head = false;
      const hx = q.x - ox, hy = q.y + ht - oy, hz = q.z - oz, b = hx * dx + hy * dy + hz * dz, c = hx * hx + hy * hy + hz * hz - 0.29 * 0.29;
      if (b > 0 || c < 0) { const disc = b * b - c; if (disc >= 0) { const t = b - Math.sqrt(disc); if (t > 0 && t < best) { best = t; head = true; } } }
      const a = dx * dx + dz * dz;
      if (a > 1e-9) {
        const px = ox - q.x, pz = oz - q.z, bb = px * dx + pz * dz, cc = px * px + pz * pz - 0.43 * 0.43, disc = bb * bb - a * cc;
        if (disc >= 0) {
          const t = (-bb - Math.sqrt(disc)) / a;
          if (t > 0 && t < best) { const y = oy + dy * t - q.y; if (y >= 0 && y <= bt) { best = t; head = false; } }
        }
      }
      return best < max ? (R.head = head, best) : 1e9;
    }
    function rayAll(src, ox, oy, oz, dx, dy, dz, max, holes) {
      let best = rayWorld(ox, oy, oz, dx, dy, dz, max, holes);
      let hp = null, hh = false;
      for (const q of S.pl) {
        if (q === src || !q.alive) continue;
        R.head = false;
        const t = rayPlayer(q, ox, oy, oz, dx, dy, dz, best);
        if (t < best) { best = t; hp = q; hh = R.head; }
      }
      if (hp) { R.kind = 3; R.pl = hp; R.head = hh; R.pc = null; R.t = best; }
      R.x = ox + dx * best; R.y = oy + dy * best; R.z = oz + dz * best; R.t = best;
      return R;
    }
    S.rayAll = rayAll;
    S.losTo = (a, b) => {
      const ox = a.x, oy = a.y + (a.crouch ? EYEC : EYE), oz = a.z;
      for (let k = 0; k < 2; k++) {
        const tx = b.x - ox, ty = b.y + (k ? 0.9 : (b.crouch ? 1.1 : 1.55)) - oy, tz = b.z - oz, d = Math.hypot(tx, ty, tz);
        if (d < 0.01) return true;
        rayWorld(ox, oy, oz, tx / d, ty / d, tz / d, d, false);
        if (R.t >= d - 0.05) return true;
      }
      return false;
    };

    function newPlayer(o, i) {
      return {
        i, name: o.name, hero: o.hero | 0, team: o.team, bot: o.bot == null ? -1 : o.bot, human: !!o.human, pid: o.pid || null, local: !!o.local,
        x: 0, y: 0, z: 0, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, crouch: false, onG: true, sup: null, supTmp: null, fallY: 0, jumpCD: 0,
        hp: 100, sh: 100, alive: true, respT: 0, kills: 0, deaths: 0, dmgDone: 0, slowT: 0,
        slot: 1, build: -1, mat: 0, mats: [500, 500, 500], wep: [], reloadT: 0, fireCD: 0, eqT: 0, bloom: 0, ads: false, lastBuild: 0, bkey: 0, hitT: -9, dmgT: -9, lastAtk: -1, shotT: -9, buildT: -9,
        ax: 0, ay: 0, az: -1, aimSet: false, firePrev: false, turbo: true, rot: 0, editing: false, remote: false,
        inp: { mx: 0, mz: 0, jump: false, crouch: false, fire: false, ads: false },
        ai: null, spawnT: 0
      };
    }
    cfg.players.forEach((o, i) => S.pl.push(newPlayer(o, i)));

    function giveLoadout(p) {
      const list = LOADOUT[S.mode] || LOADOUT.build;
      p.wep = [{ w: 0, r: 0, ammo: 0 }];
      for (const w of list) { const r = S.rarity === 'legend' ? 4 : S.loadR[w]; p.wep.push({ w, r, ammo: W[w].mag }); }
      if (p.slot >= p.wep.length) p.slot = 1;
      p.reloadT = 0; p.fireCD = 0; p.eqT = 0; p.bloom = 0;
    }
    function spawnSpots() {
      const n = S.pl.length;
      if (S.mode === 'box') return [[-1.5 * TS, -0.5 * TS], [1.5 * TS, 0.5 * TS]];
      if (S.mode === 'ffa') return [[-6.5, -6.5], [6.5, 6.5], [6.5, -6.5], [-6.5, 6.5]].map(([a, b]) => [a * TS, b * TS]);
      if (S.mode === 'practice') return [[0.5 * TS, 3.5 * TS], [0.5 * TS, -6.5 * TS], [-4.5 * TS, -5.5 * TS], [5.5 * TS, -5.5 * TS]];
      return n <= 2 ? [[-4.5 * TS, 0.5 * TS], [5.5 * TS, 0.5 * TS]] : [[-6.5, -6.5], [6.5, 6.5], [6.5, -6.5], [-6.5, 6.5]].map(([a, b]) => [a * TS, b * TS]);
    }
    S.spawnSpots = spawnSpots;
    function place(p, i, spot) {
      const s = spot || spawnSpots()[i % 4];
      p.x = s[0]; p.z = s[1]; p.y = 0; p.px = p.x; p.py = 0; p.pz = p.z; p.vx = p.vy = p.vz = 0; p.onG = true; p.sup = null; p.fallY = 0; p.crouch = false;
      p.yaw = Math.atan2(p.x, p.z); p.pitch = 0;
      p.hp = 100; p.sh = S.mode === 'box' ? 50 : 100; p.alive = true; p.respT = 0; p.build = -1; p.ads = false; p.slowT = 0; p.spawnT = S.t;
      p.mats = S.mode === 'box' ? [300, 150, 0] : [500, 500, 500];
      giveLoadout(p);
      p.slot = S.mode === 'box' ? 2 : 1;
      const e = emit('spawn'); e.a = p.i;
    }
    function buildBoxArena() {
      const [x0, x1, z0, z1, top] = bounds;
      for (let l = 0; l < top; l++) {
        for (let x = x0; x <= x1; x++) { addPiece(0, x, z0, l, 0, 3, -1, -1, true); addPiece(0, x, z1 + 1, l, 0, 3, -1, -1, true); }
        for (let z = z0; z <= z1; z++) { addPiece(0, x0, z, l, 1, 3, -1, -1, true); addPiece(0, x1 + 1, z, l, 1, 3, -1, -1, true); }
      }
      const box = (tx, tz) => {
        addPiece(0, tx, tz, 0, 0, 0, -1, -1, true); addPiece(0, tx, tz + 1, 0, 0, 0, -1, -1, true);
        addPiece(0, tx, tz, 0, 1, 0, -1, -1, true); addPiece(0, tx + 1, tz, 0, 1, 0, -1, -1, true);
        addPiece(3, tx, tz, 1, 0, 0, -1, -1, true);
      };
      box(-2, -1); box(1, 0);
      addPiece(0, 0, -2, 0, 1, 0, -1, -1, true); addPiece(0, -1, 2, 0, 1, 0, -1, -1, true);
      addPiece(1, -1, 1, 1, 0, 0, -1, -1, true); addPiece(1, 0, -2, 1, 0, 0, -1, -1, true);
    }
    S.newRound = () => {
      S.round++;
      for (let w = 1; w < 5; w++) S.loadR[w] = rollRarity();
      S.clearPieces(false);
      if (S.mode === 'box') buildBoxArena();
      const spots = spawnSpots();
      S.pl.forEach((p, i) => { place(p, i, spots[i % spots.length]); if (S.mode === 'box') p.yaw = i ? Math.PI / 2 : -Math.PI / 2; });
      if (S.dummy) S.pl.forEach(p => { if (p.bot >= 0) { p.hp = 100; p.sh = 0; } });
      S.phase = S.mode === 'practice' ? 'fight' : 'count'; S.pt = S.round === 1 ? 3.5 : 3; S.rt = S.mode === 'ffa' ? S.ffaTime : S.mode === 'practice' ? 0 : 150;
      const e = emit('round'); e.v = S.round;
    };

    function hurt(q, amt, by, head, kind) {
      if (!q.alive || amt <= 0 || S.phase === 'count' || S.phase === 'round' || S.phase === 'over') return 0;
      if (S.dummy && q.bot >= 0 && q.dummyGod) return 0;
      let a = amt, shDone = 0, hpDone = 0;
      const hadSh = q.sh > 0;
      if (q.sh > 0) { shDone = Math.min(q.sh, a); q.sh -= shDone; a -= shDone; }
      if (a > 0) { hpDone = Math.min(q.hp, a); q.hp -= hpDone; }
      q.dmgT = S.t; if (by) { q.lastAtk = by.i; by.dmgDone += shDone + hpDone; by.hitT = S.t; }
      const e = emit('hurt'); e.a = by ? by.i : -1; e.b = q.i; e.v = Math.round(shDone + hpDone); e.n = (head ? 1 : 0) | (hadSh && q.sh <= 0 ? 2 : 0) | (shDone > 0 && hpDone === 0 ? 4 : 0); e.u = kind || 0;
      if (q.hp <= 0.001) killPlayer(q, by, kind);
      return shDone + hpDone;
    }
    S.hurt = hurt;
    function killPlayer(q, by, kind) {
      if (!q.alive) return;
      if (S.dummy && q.bot >= 0) { const e0 = emit('kill'); e0.a = by ? by.i : -1; e0.b = q.i; e0.n = kind || 0; q.alive = false; q.respT = 2; q.deaths++; if (by && by !== q) by.kills++; return; }
      q.alive = false; q.deaths++; q.respT = 3;
      let killer = by && by !== q ? by : (q.lastAtk >= 0 && S.t - q.dmgT < 6 ? S.pl[q.lastAtk] : null);
      if (killer === q) killer = null;
      if (killer) { killer.kills++; S.kills++; if (S.mode === 'ffa') { let g = 50; const a = Math.min(100 - killer.hp, g); killer.hp += a; g -= a; killer.sh = Math.min(100, killer.sh + g); for (let m = 0; m < 3; m++) killer.mats[m] = Math.min(999, killer.mats[m] + 100); } }
      const e = emit('kill'); e.a = killer ? killer.i : -1; e.b = q.i; e.n = kind || 0;
      if (S.mode === 'ffa') {
        if (killer && killer.kills >= S.ffaTarget) endMatch(killer.team);
      } else if (S.mode !== 'practice' && S.phase === 'fight') {
        const alive = new Set(S.pl.filter(p => p.alive).map(p => p.team));
        if (alive.size <= 1) endRound(alive.size ? [...alive][0] : -1);
      }
    }
    function endRound(team) {
      S.phase = 'round'; S.pt = 3.4; S.roundWinner = team;
      if (team >= 0) S.pts[team]++;
      const e = emit('roundEnd'); e.a = team;
      if (team >= 0 && S.pts[team] >= S.goal) { S.phase = 'over'; S.winner = team; S.pt = 0; const e2 = emit('over'); e2.a = team; }
    }
    function endMatch(team) { S.phase = 'over'; S.winner = team; const e = emit('over'); e.a = team; }

    function aimDir(p) {
      if (p.aimSet) return;
      const cp = Math.cos(p.pitch);
      p.ax = -Math.sin(p.yaw) * cp; p.ay = Math.sin(p.pitch); p.az = -Math.cos(p.yaw) * cp;
    }
    S.aimDir = aimDir;
    const eyeY = p => p.y + (p.crouch ? EYEC : EYE);
    S.eyeY = eyeY;
    function spreadOf(p, w) {
      const D = W[w];
      let s = p.ads && D.ads ? D.adsSpr : D.spr;
      s += p.bloom;
      const v = Math.hypot(p.vx, p.vz);
      if (v > 1) s += D.k === 'sn' ? (p.ads ? 0.03 : 0.05) : 0.008 * (v / RUN);
      if (!p.onG) s += D.k === 'sg' ? 0.01 : 0.03;
      if (p.crouch) s *= 0.75;
      return s;
    }
    S.spreadOf = spreadOf;
    function pDmg(D, r, t, head) {
      let dmg = D.dmg * (1 + 0.06 * r);
      if (D.fall) { const [f0, f1, fm] = D.fall; if (t > f0) dmg *= t >= f1 ? fm : 1 - (1 - fm) * (t - f0) / (f1 - f0); }
      return head ? dmg * D.head : dmg;
    }
    function sDmg(D, t) {
      let sd = D.sd;
      if (D.fall && D.pel > 1) { const [f0, f1, fm] = D.fall; if (t > f0) sd *= t >= f1 ? fm : 1 - (1 - fm) * (t - f0) / (f1 - f0); }
      return sd;
    }
    S.applyClaim = (p, w, r, kind, idx, head, dist) => {
      if (!p.alive || S.phase !== 'fight') return;
      const D = W[w]; if (!D) return;
      if (kind === 0) { const q = S.pl[idx]; if (!q || !q.alive || q === p || q.team === p.team) return; const d = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z); if (Math.abs(d - dist) > 9 || dist > D.range + 2) return; hurt(q, pDmg(D, r, dist, !!head), p, !!head, 1); }
      else { const pc = S.byId.get(idx); if (!pc) return; damagePiece(pc, sDmg(D, dist), p); }
    };
    function shoot(p) {
      const wp = p.wep[p.slot]; if (!wp) return;
      const D = W[wp.w];
      if (p.fireCD > 0 || p.eqT > 0) return;
      if (D.mag) {
        if (p.reloadT > 0) { if (D.shell && wp.ammo > 0) p.reloadT = 0; else return; }
        if (wp.ammo <= 0) { startReload(p); return; }
      }
      aimDir(p);
      const ox = p.x, oy = eyeY(p), oz = p.z;
      const rm = 1 + 0.06 * wp.r;
      const sp = D.mag ? spreadOf(p, wp.w) : 0;
      let ux = p.ax, uy = p.ay, uz = p.az;
      const l0 = Math.hypot(ux, uy, uz) || 1; ux /= l0; uy /= l0; uz /= l0;
      let rx = -uz, rz = ux; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
      const qx = -uy * rz, qy = uz * rx - ux * rz, qz = uy * rx;
      let hitAny = 0;
      const pel = D.pel;
      for (let k = 0; k < pel; k++) {
        let dx = ux, dy = uy, dz = uz;
        if (sp > 0) {
          let a, th;
          if (pel > 1) { a = sp * (k === 0 ? 0 : (0.35 + 0.65 * ((k % 3) + Math.random()) / 3)); th = (k / (pel - 1)) * TAU + Math.random() * 0.5; }
          else { a = sp * Math.sqrt(Math.random()); th = Math.random() * TAU; }
          const ca = Math.cos(th) * Math.tan(a), sa = Math.sin(th) * Math.tan(a);
          dx += rx * ca + qx * sa; dy += qy * sa; dz += rz * ca + qz * sa;
          const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
        }
        rayAll(p, ox, oy, oz, dx, dy, dz, D.range, false);
        const t = R.t;
        if (R.kind === 3) {
          if (S.client) S.claim(0, R.pl.i, R.head ? 1 : 0, t); else hurt(R.pl, pDmg(D, wp.r, t, R.head), p, R.head, 1);
          hitAny |= R.head ? 2 : 1;
        } else if (R.kind === 2) {
          if (S.client) S.claim(1, R.pc.id, 0, t); else damagePiece(R.pc, sDmg(D, t), p);
        }
        if (k < 3 || R.kind === 3) { const e = emit('shot'); e.a = p.i; e.b = wp.w; e.x = R.x; e.y = R.y; e.z = R.z; e.n = R.kind; e.v = k; e.u = R.kind === 2 ? R.hnx : 0; e.w = R.kind === 2 ? R.hnz : 0; e.p = R.kind === 2 ? R.pc : null; }
      }
      p.fireCD = 1 / D.rate; p.shotT = S.t;
      if (D.mag) { wp.ammo--; p.bloom = Math.min(D.bmax, p.bloom + D.bloom); if (wp.ammo <= 0) p.autoRel = 0.25; }
      return hitAny;
    }
    function startReload(p) {
      const wp = p.wep[p.slot]; if (!wp) return;
      const D = W[wp.w];
      if (!D.mag || wp.ammo >= D.mag || p.reloadT > 0 || p.build >= 0) return;
      p.reloadT = D.rel * (1 - 0.05 * wp.r);
      const e = emit('reload'); e.a = p.i;
    }
    S.reload = startReload;
    function weaponTick(p, dt) {
      if (p.fireCD > 0) p.fireCD -= dt;
      if (p.eqT > 0) p.eqT -= dt;
      const wp = p.wep[p.slot];
      if (wp) {
        const D = W[wp.w];
        p.bloom = Math.max(0, p.bloom - dt * (D.bmax ? D.bmax * 2.2 : 1));
        if (p.autoRel > 0) { p.autoRel -= dt; if (p.autoRel <= 0) startReload(p); }
        if (p.reloadT > 0) {
          p.reloadT -= dt;
          if (p.reloadT <= 0) {
            if (D.shell) { wp.ammo++; const e = emit('shell'); e.a = p.i; if (wp.ammo < D.mag) p.reloadT = D.rel * (1 - 0.05 * wp.r); else p.reloadT = 0; }
            else { wp.ammo = D.mag; p.reloadT = 0; const e = emit('reloaded'); e.a = p.i; }
          }
        }
      }
    }
    S.setSlot = (p, s) => {
      if (s < 0 || s >= p.wep.length) return;
      if (p.slot === s && p.build < 0) return;
      p.slot = s; p.build = -1; p.reloadT = 0; p.eqT = W[p.wep[s].w].eq; p.fireCD = Math.max(p.fireCD, 0); p.bloom = 0;
      const e = emit('swap'); e.a = p.i;
    };
    S.setBuild = (p, b) => { if (b < 0 || b > 3) return; if (p.build !== b) { p.build = b; p.reloadT = 0; const e = emit('bsel'); e.a = p.i; } };
    S.cycleMat = p => { p.mat = (p.mat + 1) % 3; };

    const TG = { ok: false, type: 0, x: 0, z: 0, l: 0, d: 0, slot: 0, key: 0, why: '' };
    S.TG = TG;
    function target(p, type, yaw, pitch, rot) {
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      const dir = Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 0 : 2) : (fz > 0 ? 1 : 3);
      let tx = Math.floor(p.x / TS), tz = Math.floor(p.z / TS), lv = Math.max(0, Math.floor((p.y + 0.45) / LH));
      const sp = p.onG ? p.sup : null;
      if (sp && sp.type === 2) {
        tx = sp.x; tz = sp.z; lv = sp.l;
        if (sp.d === dir) { tx += DX4[dir]; tz += DZ4[dir]; lv += 1; }
      }
      const up = pitch > 0.45, down = pitch < -0.62;
      let x = tx, z = tz, l = lv, d = dir;
      TG.type = type;
      if (type === 0) {
        l = lv + (up ? 1 : 0);
        if (dir === 0) { x = tx + 1; z = tz; d = 1; } else if (dir === 2) { x = tx; z = tz; d = 1; } else if (dir === 1) { x = tx; z = tz + 1; d = 0; } else { x = tx; z = tz; d = 0; }
      } else if (type === 1 || type === 3) {
        if (down) { l = lv; } else if (up) { l = lv + 1; } else { x = tx + DX4[dir]; z = tz + DZ4[dir]; }
        if (type === 1 && !down && !up && sp && sp.type === 2 && sp.d === dir) { x = tx; z = tz; }
      } else {
        if (!down) { if (!(sp && sp.type === 2 && sp.d === dir)) { x = tx + DX4[dir]; z = tz + DZ4[dir]; } if (up) l = lv + 1; }
        d = (dir + (rot | 0)) & 3;
      }
      TG.x = x; TG.z = z; TG.l = l; TG.d = d; TG.slot = slotOf(type, d); TG.key = PK(TG.slot, x, z, l);
      TG.ok = validAt(p, type, x, z, l, d);
      return TG;
    }
    S.target = target;
    function validAt(p, type, x, z, l, d) {
      const [x0, x1, z0, z1, top] = bounds;
      TG.why = '';
      if (l < 0 || l >= top) { TG.why = 'high'; return false; }
      if (type === 0) {
        if (d === 0 ? (x < x0 || x > x1 || z < z0 || z > z1 + 1) : (x < x0 || x > x1 + 1 || z < z0 || z > z1)) { TG.why = 'out'; return false; }
      } else if (x < x0 || x > x1 || z < z0 || z > z1) { TG.why = 'out'; return false; }
      const slot = slotOf(type, d), key = PK(slot, x, z, l);
      if (S.pieces.has(key)) { TG.why = 'taken'; return false; }
      if (!S.infinite && p.mats[p.mat] < 10) { TG.why = 'mats'; return false; }
      if (l > 0) {
        const tmp = { type, slot, x, z, l, d };
        const ks = conKeys(tmp);
        let ok = false;
        for (const k of ks) { const s = con.get(k); if (s && s.size) { ok = true; break; } }
        if (!ok) { TG.why = 'air'; return false; }
      }
      return true;
    }
    S.validAt = validAt;
    function tryBuild(p, type, yaw, pitch, rot) {
      if (!p.alive || S.phase === 'over' || S.phase === 'round') return null;
      if (S.t - p.buildT < 0.075) return null;
      const tg = target(p, type, yaw, pitch, rot);
      if (!tg.ok) return null;
      return placeAt(p, type, tg.x, tg.z, tg.l, tg.d);
    }
    function placeAt(p, type, x, z, l, d, mat) {
      const m = mat == null ? p.mat : mat;
      if (!S.infinite && p.mats[m] < 10) return null;
      const pc = addPiece(type, x, z, l, d, m, p.team, p.i, false);
      if (!pc) return null;
      if (!S.infinite) p.mats[m] -= 10;
      p.buildT = S.t;
      return pc;
    }
    S.tryBuild = tryBuild; S.placeAt = placeAt;
    S.applyEdit = (p, pc, mask, dir) => {
      if (!pc || S.pieces.get(pc.key) !== pc || pc.mat === 3) return false;
      if (pc.team >= 0 && pc.team !== p.team) return false;
      const cx = (pc.x + 0.5) * TS, cz = (pc.z + 0.5) * TS;
      if (Math.hypot(cx - p.x, cz - p.z) > TS * 1.9 || Math.abs(pc.l * LH - p.y) > LH * 2.2) return false;
      if (pc.type === 0) { mask &= 511; if (mask === 511) return false; }
      else if (pc.type === 2) { if (dir == null || dir < 0 || dir > 3 || dir === pc.d) return false; conDel(pc); pc.d = dir; pc.con = conKeys(pc); conAdd(pc); mask = 0; }
      else { mask &= 15; if (mask === 15) return false; }
      pc.edit = mask;
      const e = emit('edit'); e.p = pc; e.a = p.i;
      return true;
    };

    S.dropPiece = pc => { if (S.pieces.get(pc.key) !== pc) return; S.pieces.delete(pc.key); S.byId.delete(pc.id); conDel(pc); const e = emit('break'); e.p = pc; e.n = 1; for (const p of S.pl) if (p.sup === pc) p.sup = null; };
    S.rekey = (pc, id) => { S.byId.delete(pc.id); pc.id = id; S.byId.set(id, pc); };
    S.conAdd = conAdd; S.conDel = conDel; S.conKeys = conKeys; S.giveLoadout = giveLoadout; S.killPlayer = killPlayer; S.endRound = endRound;
    S.step = () => {
      S.t += DT;
      if (S.client) {}
      else if (S.phase === 'count') { S.pt -= DT; if (S.pt <= 0) { S.phase = 'fight'; const e = emit('go'); } }
      else if (S.phase === 'round') { S.pt -= DT; if (S.pt <= 0) S.newRound(); }
      else if (S.phase === 'fight' && S.rt > 0) {
        S.rt -= DT;
        if (S.rt <= 0) {
          S.rt = 0;
          if (S.mode === 'ffa') { let b = null; for (const p of S.pl) if (!b || p.kills > b.kills) b = p; endMatch(b ? b.team : -1); }
          else { let b = null, bv = -1, tie = false; for (const p of S.pl) { const v = p.alive ? p.hp + p.sh : 0; if (v > bv) { bv = v; b = p; tie = false; } else if (v === bv) tie = true; } endRound(tie || !b ? -1 : b.team); }
        }
      }
      for (const p of S.pl) {
        p.px = p.x; p.py = p.y; p.pz = p.z;
        if (!p.alive) {
          if ((S.mode === 'ffa' || S.dummy) && S.phase === 'fight') { p.respT -= DT; if (p.respT <= 0) { const sp = spawnSpots(); let best = null, bd = -1; for (const s of sp) { let dmin = 1e9; for (const q of S.pl) if (q !== p && q.alive) dmin = Math.min(dmin, Math.hypot(q.x - s[0], q.z - s[1])); if (dmin > bd) { bd = dmin; best = s; } } place(p, p.i, best); if (S.dummy && p.bot >= 0) p.sh = 0; } }
          continue;
        }
        if (p.jumpCD > 0) p.jumpCD -= DT;
        if (p.slowT > 0) p.slowT -= DT;
        if (p.remote) { if (p.y < -30 && !S.client) killPlayer(p, null, 2); continue; }
        if (S.phase === 'count') { p.inp.mx = p.inp.mz = 0; p.inp.jump = false; }
        movePlayer(p, DT);
        weaponTick(p, DT);
        p.ads = !!p.inp.ads && p.build < 0 && p.slot > 0;
        if (S.phase === 'fight' && p.inp.fire) {
          if (p.build >= 0) { if (!p.editing && (p.turbo || !p.firePrev)) { const pc = tryBuild(p, p.build, p.yaw, p.pitch, p.rot); if (pc && S.onLocalBuild) S.onLocalBuild(p, pc); } }
          else shoot(p);
        }
        p.firePrev = !!p.inp.fire;
      }
    };
    S.shoot = shoot;
    S.weaponTick = weaponTick;
    S.movePlayer = movePlayer;
    S.place = place;
    return S;
  }

  const angTo = (p, ey, x, y, z, o) => { const dx = x - p.x, dy = y - ey, dz = z - p.z; o.yaw = Math.atan2(-dx, -dz); o.pitch = Math.atan2(dy, Math.hypot(dx, dz)); o.d = Math.hypot(dx, dy, dz); return o; };
  const cardYaw = yaw => { const fx = -Math.sin(yaw), fz = -Math.cos(yaw); const dir = Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 0 : 2) : (fz > 0 ? 1 : 3); return [-Math.PI / 2, Math.PI, Math.PI / 2, 0][dir]; };
  function botInit(p) {
    p.ai = {
      lv: LVL[clamp(p.bot, 0, 3)], tgt: null, vis: false, reactT: 0, seenX: 0, seenY: 0, seenZ: 0, seenT: -99, heard: false,
      ay: p.yaw, ap: 0, ey: 0, ep: 0, ety: 0, etp: 0, errT: 0, think: Math.random() * 0.1, strafe: Math.random() < 0.5 ? 1 : -1, strafeT: 0,
      buildT: 0, wantSlot: 1, slotT: 0, rush: 0, rushYaw: 0, rushL: 0, jumpT: 0, stuckT: 0, lx: p.x, lz: p.z, detour: 0, detourT: 0,
      edit: null, editT: 0, headAim: false, aimT: 0, moveX: 0, moveZ: 0, pushT: 0, boxT: 0, low: false, wallFor: 0, keepDist: 0, burst: 0, dummy: false
    };
  }
  const AO = { yaw: 0, pitch: 0, d: 0 };
  function nearestEnemy(S, p) {
    let best = null, bd = 1e9;
    for (const q of S.pl) { if (q === p || !q.alive || q.team === p.team) continue; const d = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z); if (d < bd) { bd = d; best = q; } }
    return best;
  }
  function botThink(S, p) {
    const A = p.ai, L = A.lv, inp = p.inp;
    if (!p.alive) { inp.fire = false; inp.mx = inp.mz = 0; inp.jump = false; return; }
    inp.jump = false;
    if (A.dummy) { dummyThink(S, p); return; }
    A.think -= DT;
    const q = nearestEnemy(S, p);
    const ey = S.eyeY(p);
    if (A.think <= 0) {
      A.think = 0.1;
      if (q !== A.tgt) { A.tgt = q; A.vis = false; }
      if (q) {
        const los = S.losTo(p, q);
        if (los) {
          if (!A.vis) { A.vis = true; A.reactT = S.t + L.react * (0.85 + Math.random() * 0.35); }
          A.seenX = q.x; A.seenY = q.y; A.seenZ = q.z; A.seenT = S.t;
        } else {
          A.vis = false;
          const d = Math.hypot(q.x - p.x, q.z - p.z);
          if ((S.t - q.shotT < 0.4 && d < 90) || (S.t - q.buildT < 0.4 && d < 50) || d < 6) { A.seenX = q.x + (Math.random() - 0.5) * 2; A.seenY = q.y; A.seenZ = q.z + (Math.random() - 0.5) * 2; A.seenT = S.t; }
        }
      }
      decide(S, p, q, ey);
    }
    aimStep(S, p, q, ey);
    moveStep(S, p, q);
  }
  function dummyThink(S, p) {
    const A = p.ai, inp = p.inp;
    A.strafeT -= DT;
    if (A.strafeT <= 0) { A.strafeT = 0.6 + Math.random() * 1.4; A.strafe = Math.random() < 0.3 ? 0 : (Math.random() < 0.5 ? 1 : -1); }
    inp.mx = A.strafe * 0.6; inp.mz = 0; inp.fire = false;
    const me = S.pl.find(x => x.human || x.local) || S.pl[0];
    angTo(p, S.eyeY(p), me.x, me.y + 1.2, me.z, AO); p.yaw = AO.yaw; p.pitch = 0;
    p.dummyGod = false;
  }
  function weaponFor(p, d, L, q, S) {
    const has = k => p.wep.findIndex(w => W[w.w].k === k);
    const ammo = i => i > 0 && (p.wep[i].ammo > 0 || p.reloadT > 0 && p.slot === i);
    const sg = has('sg'), smg = has('smg'), ar = has('ar'), sn = has('sn');
    if (d < 7.5 && sg > 0 && (ammo(sg) || p.wep[sg].ammo > 0)) return sg;
    if (d < 7.5 && smg > 0) return smg;
    if (d < 16 && smg > 0 && ammo(smg)) return L.tap > 0.6 && sg > 0 && d < 10 && p.wep[sg].ammo > 0 ? sg : smg;
    if (d > 60 && sn > 0 && p.wep[sn].ammo > 0 && L.tap > 0.4 && Math.hypot(q.vx, q.vz) < 3) return sn;
    if (ar > 0 && (p.wep[ar].ammo > 0 || p.slot === ar)) return ar;
    if (smg > 0) return smg;
    return Math.max(1, ar);
  }
  function decide(S, p, q, ey) {
    const A = p.ai, L = A.lv;
    A.pushFire = false;
    if (!q) { A.rush = 0; return; }
    const known = S.t - A.seenT < 6;
    const dx = A.seenX - p.x, dz = A.seenZ - p.z, dh = Math.hypot(dx, dz), dy = A.seenY - p.y;
    const toYaw = Math.atan2(-dx, -dz);
    if (S.phase !== 'fight') { A.rush = 0; A.boxQ = null; return; }
    const ws = weaponFor(p, Math.hypot(dh, dy), L, q, S);
    if (ws !== p.slot && S.t > A.slotT && (p.reloadT <= 0 || p.wep[p.slot].ammo > 0 || W[p.wep[p.slot].w].shell)) { S.setSlot(p, ws); A.slotT = S.t + 0.45 + (1 - L.tap) * 0.7; }
    if (p.build >= 0) p.build = -1;
    const wp = p.wep[p.slot];
    if (wp && W[wp.w].mag && wp.ammo === 0 && p.reloadT <= 0) S.reload(p);
    if (wp && W[wp.w].mag && !A.vis && S.t - A.seenT > 1.2 && wp.ammo < W[wp.w].mag * 0.7 && p.reloadT <= 0) S.reload(p);
    const mats = S.infinite || p.mats[0] + p.mats[1] + p.mats[2] >= 10;
    if (!S.infinite && p.mats[p.mat] < 10) p.mat = p.mats[0] >= 10 ? 0 : p.mats[1] >= 10 ? 1 : 2;
    const canBuild = mats && S.t >= A.buildT && S.t - p.buildT >= 0.08;
    if (A.edit) { editStep(S, p, q); return; }
    if (A.boxQ && A.boxQ.length) {
      if (canBuild) { const y = A.boxQ.shift(); const pc = y === 9 ? S.tryBuild(p, 3, p.yaw, 1) : S.tryBuild(p, 0, y, 0); if (pc) A.buildT = S.t + L.bdel * 0.6; }
      return;
    }
    const hurtNow = S.t - p.dmgT < 0.35;
    if (canBuild && A.vis && hurtNow && dh < 70 && A.rush <= 0 && Math.random() < L.wall) {
      const pc = S.tryBuild(p, 0, toYaw, 0);
      if (pc) {
        A.buildT = S.t + L.bdel * (0.7 + Math.random() * 0.6); A.wallFor = S.t;
        if (dy > -1 && dh < 35 && Math.random() < L.ramp * 0.8) { A.rush = 2 + ((Math.random() * 2) | 0); A.rushYaw = cardYaw(toYaw); A.rushL = 0; A.rushEnd = S.t + 4; A.rushWall = false; }
        return;
      }
    }
    if (A.rush <= 0 && canBuild && known && dh < 38 && dh > 4 && dy > 1.2 && Math.random() < L.ramp * 0.6) { A.rush = 3 + ((Math.random() * 4) | 0); A.rushYaw = cardYaw(toYaw); A.rushL = 0; A.rushEnd = S.t + 6; A.rushWall = false; }
    if (A.rush <= 0 && canBuild && known && L.ramp >= 0.75 && dh < 26 && dh > 6 && dy > -2.5 && Math.random() < 0.05 * L.ramp) { A.rush = 2 + ((Math.random() * 3) | 0); A.rushYaw = cardYaw(toYaw); A.rushL = 0; A.rushEnd = S.t + 5; A.rushWall = false; }
    if (A.rush > 0) {
      if (S.t > A.rushEnd || (dy < -2.2 && A.rushL >= 2)) A.rush = 0;
      else if (canBuild) {
        const ry = A.rushYaw;
        if (A.rushWall) { A.rushWall = false; if (S.tryBuild(p, 0, ry, 0.1)) A.buildT = S.t + L.bdel * 0.5; }
        else {
          const pc = S.tryBuild(p, 2, ry, 0);
          if (pc) { A.rushL++; A.rush--; A.buildT = S.t + L.bdel * 0.6; A.rushWall = L.wall >= 0.8; }
          else if (S.TG.why === 'air' || S.TG.why === 'high' || S.TG.why === 'out' || S.TG.why === 'mats') A.rush = 0;
        }
      }
      return;
    }
    if (known && !A.vis && dh < 14 && Math.abs(dy) < 4 && S.t - A.seenT < 2.5 && L.pick > 0.7) {
      const ddx = A.seenX - p.x, ddy = A.seenY + 1.1 - ey, ddz = A.seenZ - p.z, dl = Math.hypot(ddx, ddy, ddz) || 1;
      S.rayWorld(p.x, ey, p.z, ddx / dl, ddy / dl, ddz / dl, dl, false);
      const pc = S.R.kind === 2 ? S.R.pc : null;
      if (pc && pc.mat !== 3) {
        const wpe = p.wep[p.slot], ready = wpe && W[wpe.w].mag && wpe.ammo > 0 && p.fireCD < 0.15 && p.reloadT <= 0;
        if (pc.type === 0 && (pc.team === p.team || pc.team < 0) && L.edit > 0 && ready && dh < 10 && S.t - A.seenT < 0.9 && S.R.t < 6.5 && S.t - A.editT > 1.4 && Math.random() < L.edit * 0.6) {
          A.edit = { pc, ph: 0, t: S.t + 0.1 + (1 - L.edit) * 0.3 + Math.random() * 0.08, mask: dh < 9 ? (1 << 1) | (1 << 4) : (1 << 4) };
          A.editT = S.t;
          return;
        }
        if (pc.team !== p.team) { A.pushFire = true; A.pushX = S.R.x; A.pushY = S.R.y; A.pushZ = S.R.z; }
      }
    }
    if (canBuild && A.vis && p.hp + p.sh < 70 && dh < 20 && L.wall >= 0.8 && S.t - A.boxT > 7 && Math.random() < 0.25 * L.edit + 0.05) {
      A.boxT = S.t;
      A.boxQ = [toYaw, toYaw + Math.PI / 2, toYaw - Math.PI / 2, toYaw + Math.PI, 9];
    }
  }
  function editStep(S, p, q) {
    const A = p.ai, E = A.edit, L = A.lv;
    if (!E.pc || S.pieces.get(E.pc.key) !== E.pc) { A.edit = null; return; }
    if (S.t < E.t) return;
    if (E.ph === 0) {
      if (S.applyEdit(p, E.pc, E.mask, null)) { E.ph = 1; E.t0 = S.t; E.t = S.t + 0.35 + Math.random() * 0.2; A.reactT = Math.min(A.reactT, S.t + L.react * 0.6); }
      else A.edit = null;
    } else {
      const dvis = A.vis && S.t - A.seenT < 0.15;
      if (dvis && S.t < E.t + 0.4 && p.fireCD > 0.2) return;
      if (dvis && S.t < E.t) return;
      S.applyEdit(p, E.pc, 0, null);
      A.edit = null; A.editT = S.t;
    }
  }
  function aimStep(S, p, q, ey) {
    const A = p.ai, L = A.lv, inp = p.inp;
    A.errT -= DT;
    const fightV = q && A.vis && S.phase === 'fight';
    if (A.errT <= 0) {
      A.errT = 0.22 + Math.random() * 0.3;
      const mv = q ? Math.min(1, Math.hypot(q.vx, q.vz) / RUN) : 0, me = Math.min(1, Math.hypot(p.vx, p.vz) / RUN);
      const k = L.err * (1 + 0.7 * mv + 0.4 * me + (p.onG ? 0 : 0.5));
      A.ety = gauss() * k; A.etp = gauss() * k * 0.6;
      A.headAim = Math.random() < L.head;
    }
    A.ey = damp(A.ey, A.ety, 6, DT); A.ep = damp(A.ep, A.etp, 6, DT);
    let ty, tp;
    if (q && (A.vis || S.t - A.seenT < 2)) {
      const hx = A.vis ? q.x : A.seenX, hz = A.vis ? q.z : A.seenZ, hy = A.vis ? q.y : A.seenY;
      const aimH = A.headAim ? (q.crouch ? 1.1 : 1.56) : (q.crouch ? 0.7 : 1.05);
      angTo(p, ey, hx, hy + aimH, hz, AO);
      ty = AO.yaw + A.ey; tp = AO.pitch + A.ep;
    } else if (A.pushFire) { angTo(p, ey, A.pushX, A.pushY, A.pushZ, AO); ty = AO.yaw; tp = AO.pitch; }
    else if (A.rush > 0) { ty = A.rushYaw; tp = 0; }
    else { const mv = Math.hypot(p.vx, p.vz); ty = mv > 0.5 ? Math.atan2(-p.vx, -p.vz) : A.ay; tp = 0; }
    const turn = L.turn * DT;
    const dyaw = wrapA(ty - A.ay), dp = tp - A.ap;
    A.ay += clamp(dyaw * Math.min(1, DT * 18), -turn, turn); A.ap += clamp(dp * Math.min(1, DT * 18), -turn, turn);
    A.ay = wrapA(A.ay); A.ap = clamp(A.ap, -1.45, 1.45);
    p.yaw = A.ay; p.pitch = A.ap; p.aimSet = false;
    inp.fire = false; inp.ads = false;
    if (!fightV && A.pushFire && S.phase === 'fight') {
      angTo(p, ey, A.pushX, A.pushY, A.pushZ, AO);
      const off = Math.hypot(wrapA(AO.yaw - A.ay), AO.pitch - A.ap);
      if (off < 0.08) inp.fire = true;
      return;
    }
    if (fightV && S.t >= A.reactT && p.build < 0 && !(A.edit && A.edit.ph === 0)) {
      const wp = p.wep[p.slot];
      if (!wp) return;
      const D = W[wp.w];
      const d = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z);
      angTo(p, ey, q.x, q.y + (q.crouch ? 0.8 : 1.1), q.z, AO);
      const off = Math.hypot(wrapA(AO.yaw - A.ay) * Math.cos(AO.pitch), AO.pitch - A.ap);
      const tol = Math.atan2(0.55, d) + (D.k === 'sg' ? 0.05 : 0.01);
      if (D.k === 'pick' && d > 3) return;
      if (off < tol * 1.6) {
        inp.ads = D.ads > 0 && d > 12 && L.tap > 0.4;
        if (D.k === 'ar' && d > 22 && L.tap > 0.6 && p.bloom > 0.012) return;
        if (D.k === 'sn' && (!inp.ads || Math.hypot(p.vx, p.vz) > 0.5)) { inp.ads = true; return; }
        inp.fire = true;
      }
    }
  }
  function moveStep(S, p, q) {
    const A = p.ai, L = A.lv, inp = p.inp;
    let wx = 0, wz = 0;
    if (S.phase === 'fight' && q) {
      const known = S.t - A.seenT < 8;
      const dx = (known ? A.seenX : q.x) - p.x, dz = (known ? A.seenZ : q.z) - p.z, dh = Math.hypot(dx, dz) || 1;
      const nx = dx / dh, nz = dz / dh;
      A.strafeT -= DT;
      if (A.strafeT <= 0) { A.strafeT = 0.35 + Math.random() * (0.9 - 0.4 * L.strafe); A.strafe = Math.random() < 0.5 ? 1 : -1; if (Math.random() < 0.15 * L.strafe && p.onG) inp.jump = true; }
      const wp = p.wep[p.slot], k = wp ? W[wp.w].k : 'ar';
      const pref = k === 'sg' ? 3.5 : k === 'smg' ? 9 : k === 'sn' ? 60 : L.tap > 0.6 ? 14 : 22;
      let fwd = 0;
      if (A.rush > 0) { const ry = A.rushYaw; wx = -Math.sin(ry); wz = -Math.cos(ry); if (p.onG && Math.random() < 0.5) inp.jump = true; }
      else {
        if (!A.vis) fwd = 1; else fwd = dh > pref + 3 ? 1 : dh < pref - 3 ? -0.7 : 0;
        if (S.t < A.pushT) fwd = 1;
        const sf = A.vis ? A.strafe * (0.45 + 0.55 * L.strafe) : 0;
        wx = nx * fwd - nz * sf; wz = nz * fwd + nx * sf;
        if (A.detourT > S.t) { const c = Math.cos(A.detour), s = Math.sin(A.detour); const rx = wx * c - wz * s, rz = wx * s + wz * c; wx = rx; wz = rz; }
      }
      const mv = Math.hypot(p.x - A.lx, p.z - A.lz);
      A.stuckT += DT;
      if (A.stuckT > 0.7) {
        if (mv < 0.5 && Math.hypot(wx, wz) > 0.3) {
          if (p.onG) inp.jump = true;
          if (Math.random() < 0.6) { A.detour = (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2; A.detourT = S.t + 0.9; }
          if (!A.vis && L.pick > 0.5) {
            const ey = S.eyeY(p), mx = wx / (Math.hypot(wx, wz) || 1), mz = wz / (Math.hypot(wx, wz) || 1);
            S.rayWorld(p.x, ey - 0.6, p.z, mx, 0, mz, 2.5, false);
            if (S.R.kind === 2 && S.R.pc.mat !== 3) { A.breakPc = S.R.pc; A.breakT = S.t + 1.5; }
          }
        }
        A.stuckT = 0; A.lx = p.x; A.lz = p.z;
      }
      if (A.breakPc && S.t < A.breakT && S.pieces.get(A.breakPc.key) === A.breakPc && !A.vis) {
        const pc = A.breakPc, cx = (pc.x + (pc.type === 0 && pc.slot === 1 ? 0 : 0.5)) * TS, cz = (pc.z + (pc.type === 0 && pc.slot === 0 ? 0 : 0.5)) * TS, cy = pc.l * LH + 1.2;
        angTo(p, S.eyeY(p), cx, cy, cz, AO); p.yaw = A.ay = AO.yaw; p.pitch = A.ap = AO.pitch;
        inp.fire = true;
      } else A.breakPc = null;
      if (p.y > 0.5 && p.onG && A.rush <= 0) {
        const tx = p.x + wx * 0.9, tz = p.z + wz * 0.9;
        const below = S.rayWorld(tx, p.y + 0.3, tz, 0, -1, 0, 30, false);
        if (below > 8 && Math.random() < 0.7) { wx = -wx * 0.3; wz = -wz * 0.3; }
      }
    } else if (S.phase === 'fight') {
      wx = -p.x / (Math.hypot(p.x, p.z) || 1) * 0.5; wz = -p.z / (Math.hypot(p.x, p.z) || 1) * 0.5;
    }
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    inp.mz = wx * fx + wz * fz; inp.mx = -wx * fz + wz * fx;
    inp.crouch = false;
  }

  function makeView(THREE, V, api, quality) {
    const { renderer } = V;
    const bin = [], own = x => (bin.push(x), x);
    const col = hex => new THREE.Color(hex).convertSRGBToLinear();
    const scene = new THREE.Scene();
    const SKY = '#9fd4ff';
    scene.fog = new THREE.Fog(col(SKY), 140, 520);
    const cam = new THREE.PerspectiveCamera(78, V.w / V.h, 0.08, 1400);
    cam.rotation.order = 'YXZ';
    const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = own(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; };
    const noise = (x, w, h, a, n) => { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); } };
    {
      const g = own(new THREE.SphereGeometry(900, 32, 16)), p = g.attributes.position, cs = [];
      const c0 = col('#eaf6ff'), c1 = col('#9fd4ff'), c2 = col('#3e8cf0'), tc = new THREE.Color();
      for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 900, t = clamp(y * 1.5 + 0.05, 0, 1); if (t < 0.3) tc.copy(c0).lerp(c1, t / 0.3); else tc.copy(c1).lerp(c2, (t - 0.3) / 0.7); cs.push(tc.r, tc.g, tc.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
      const sky = new THREE.Mesh(g, own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
      sky.renderOrder = -1; scene.add(sky);
      const cl = own(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false }));
      const cg = own(new THREE.SphereGeometry(1, 10, 8));
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * TAU, r = 420 + Math.random() * 260, gp = new THREE.Group();
        for (let k = 0; k < 4 + (Math.random() * 4 | 0); k++) { const m = new THREE.Mesh(cg, cl); const s = 14 + Math.random() * 22; m.scale.set(s * 1.6, s * 0.7, s); m.position.set((Math.random() - 0.5) * 60, Math.random() * 8, (Math.random() - 0.5) * 30); gp.add(m); }
        gp.position.set(Math.cos(a) * r, 120 + Math.random() * 110, Math.sin(a) * r); gp.lookAt(0, gp.position.y, 0); scene.add(gp);
      }
    }
    const hemi = new THREE.HemisphereLight(col('#d6ecff'), col('#6d8f4f'), 0.85);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(col('#fff2dc'), 1.25);
    sun.position.set(40, 80, 25); sun.castShadow = true;
    sun.shadow.mapSize.set(quality.shadow, quality.shadow);
    const sc = sun.shadow.camera; sc.left = -55; sc.right = 55; sc.top = 55; sc.bottom = -55; sc.near = 1; sc.far = 220;
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
    scene.add(sun); scene.add(sun.target);

    const E = HALF * TS;
    const grass = cv(256, 256, (x, w, h) => {
      x.fillStyle = '#62b34a'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { x.fillStyle = `hsla(${95 + Math.random() * 25},${45 + Math.random() * 20}%,${36 + Math.random() * 18}%,.55)`; const a = Math.random() * w, b = Math.random() * h; x.fillRect(a, b, 2, 4 + Math.random() * 5); }
      noise(x, w, h, 0.08, 500);
      x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 3; x.strokeRect(1.5, 1.5, w - 3, h - 3);
      x.strokeStyle = 'rgba(30,70,20,.25)'; x.lineWidth = 1; x.strokeRect(4, 4, w - 8, h - 8);
    });
    grass.wrapS = grass.wrapT = THREE.RepeatWrapping; grass.repeat.set(HALF * 2, HALF * 2);
    const ground = new THREE.Mesh(own(new THREE.PlaneGeometry(E * 2, E * 2)), own(new THREE.MeshStandardMaterial({ map: grass, roughness: 0.95 })));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const cliffTex = cv(128, 128, (x, w, h) => { x.fillStyle = '#9b7a5a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(${60 + Math.random() * 40},${45 + Math.random() * 30},${30 + Math.random() * 20},.5)`; x.fillRect(0, Math.random() * h, w, 3 + Math.random() * 8); } noise(x, w, h, 0.15, 400); x.fillStyle = '#5aa443'; x.fillRect(0, 0, w, 10); });
    cliffTex.wrapS = THREE.RepeatWrapping; cliffTex.repeat.set(12, 1);
    const cliff = new THREE.Mesh(own(new THREE.CylinderGeometry(E * 1.43, E * 1.2, 14, 4, 1, true)), own(new THREE.MeshStandardMaterial({ map: cliffTex, roughness: 1 })));
    cliff.rotation.y = Math.PI / 4; cliff.position.y = -7.02; scene.add(cliff);
    const water = new THREE.Mesh(own(new THREE.PlaneGeometry(3000, 3000)), own(new THREE.MeshStandardMaterial({ color: col('#2d9fd9'), roughness: 0.25, metalness: 0.1 })));
    water.rotation.x = -Math.PI / 2; water.position.y = -6; scene.add(water);
    const rim = new THREE.Mesh(own(new THREE.BoxGeometry(E * 2 + 0.6, 0.5, E * 2 + 0.6)), own(new THREE.MeshStandardMaterial({ color: col('#5aa443'), roughness: 1 })));
    rim.position.y = -0.27; rim.receiveShadow = true; scene.add(rim);
    {
      const trunk = own(new THREE.CylinderGeometry(0.35, 0.5, 5, 6)), crown = own(new THREE.ConeGeometry(2.6, 6, 7)), rock = own(new THREE.DodecahedronGeometry(2.2, 0));
      const tm = own(new THREE.MeshStandardMaterial({ color: col('#7a5232'), flatShading: true })), cm = own(new THREE.MeshStandardMaterial({ color: col('#2f8f4a'), flatShading: true })), rm = own(new THREE.MeshStandardMaterial({ color: col('#8d8f99'), flatShading: true }));
      const isl = own(new THREE.CylinderGeometry(1, 0.7, 1, 7)), im = own(new THREE.MeshStandardMaterial({ color: col('#62b34a'), flatShading: true }));
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * TAU + Math.random() * 0.3, r = E * 2.3 + Math.random() * 90, s = 18 + Math.random() * 26;
        const g = new THREE.Group(); g.position.set(Math.cos(a) * r, -6, Math.sin(a) * r);
        const base = new THREE.Mesh(isl, im); base.scale.set(s, 7, s); base.position.y = 2; g.add(base);
        for (let k = 0; k < 5; k++) { const t = new THREE.Group(); const tr = new THREE.Mesh(trunk, tm); tr.position.y = 2.5; const cr = new THREE.Mesh(crown, cm); cr.position.y = 7; t.add(tr, cr); const rr = Math.random() * s * 0.7, aa = Math.random() * TAU; t.position.set(Math.cos(aa) * rr, 5.5, Math.sin(aa) * rr); t.scale.setScalar(0.8 + Math.random() * 0.8); g.add(t); }
        const rk = new THREE.Mesh(rock, rm); rk.position.set(s * 0.3, 6, -s * 0.2); rk.scale.setScalar(1 + Math.random()); g.add(rk);
        scene.add(g);
      }
      for (let i = 0; i < 16; i++) {
        const side = i % 4, f = (i / 4 | 0) / 4 + 0.12 + Math.random() * 0.1;
        const t = new THREE.Group(); const tr = new THREE.Mesh(trunk, tm); tr.position.y = 2.5; const cr = new THREE.Mesh(crown, cm); cr.position.y = 7; t.add(tr, cr);
        const off = E + 9 + Math.random() * 6, along = (f * 2 - 1) * E;
        t.position.set(side === 0 ? off : side === 1 ? -off : along, -7.5, side === 2 ? off : side === 3 ? -off : along);
        t.scale.setScalar(1 + Math.random() * 0.5); scene.add(t);
      }
    }

    const frameTex = (base, draw) => cv(256, 256, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); draw(x, w, h); });
    const TEX = [
      frameTex('#c4874a', (x, w, h) => {
        for (let i = 0; i < 6; i++) { const y0 = i * h / 6; x.fillStyle = `hsl(${26 + Math.random() * 6},${48 + Math.random() * 10}%,${46 + Math.random() * 8}%)`; x.fillRect(0, y0, w, h / 6); x.fillStyle = 'rgba(90,45,15,.55)'; x.fillRect(0, y0, w, 3); for (let k = 0; k < 9; k++) { x.strokeStyle = 'rgba(110,60,25,.28)'; x.lineWidth = 1; x.beginPath(); const yy = y0 + 6 + Math.random() * (h / 6 - 10); x.moveTo(0, yy); x.bezierCurveTo(w * 0.3, yy + 3, w * 0.6, yy - 3, w, yy + 1); x.stroke(); } }
        noise(x, w, h, 0.06, 500);
        x.strokeStyle = '#7a461d'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
        x.strokeStyle = 'rgba(255,220,170,.35)'; x.lineWidth = 3; x.strokeRect(15, 15, w - 30, h - 30);
        x.fillStyle = '#5c3414'; for (const [a, b] of [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]]) { x.beginPath(); x.arc(a, b, 4, 0, TAU); x.fill(); }
      }),
      frameTex('#a4acb6', (x, w, h) => {
        const rh = h / 8;
        for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) { const bw = w / 4, ox = c * bw + (r & 1 ? bw / 2 : 0); x.fillStyle = `hsl(210,${6 + Math.random() * 6}%,${58 + Math.random() * 12}%)`; x.fillRect(ox + 2, r * rh + 2, bw - 4, rh - 4); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(ox + 2, r * rh + 2, bw - 4, 3); }
        noise(x, w, h, 0.1, 900);
        x.strokeStyle = '#6c737d'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
      }),
      frameTex('#7f93ab', (x, w, h) => {
        for (let i = 0; i < 4; i++) { const g = x.createLinearGradient(i * w / 4, 0, (i + 1) * w / 4, 0); g.addColorStop(0, '#6d8098'); g.addColorStop(0.5, '#9db0c6'); g.addColorStop(1, '#6d8098'); x.fillStyle = g; x.fillRect(i * w / 4, 0, w / 4, h); }
        x.strokeStyle = 'rgba(40,50,70,.45)'; x.lineWidth = 2; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); }
        x.fillStyle = 'rgba(255,200,40,.85)'; x.fillRect(16, h / 2 - 14, w - 32, 28); x.fillStyle = 'rgba(30,30,40,.85)'; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(16 + i * 28, h / 2 + 14); x.lineTo(30 + i * 28, h / 2 - 14); x.lineTo(42 + i * 28, h / 2 - 14); x.lineTo(28 + i * 28, h / 2 + 14); x.fill(); }
        noise(x, w, h, 0.05, 400);
        x.strokeStyle = '#4b596b'; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16);
        x.fillStyle = '#c9d6e6'; for (let i = 0; i < 4; i++) for (const yy of [18, h - 18]) { x.beginPath(); x.arc(18 + i * (w - 36) / 3, yy, 4, 0, TAU); x.fill(); }
      }),
      cv(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(120,230,255,.18)'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(160,245,255,.9)'; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo(i * w / 8, h); x.stroke(); x.beginPath(); x.moveTo(0, i * h / 8); x.lineTo(w, i * h / 8); x.stroke(); } })
    ];
    const uvoMat = (tex, extra = {}) => {
      const m = own(new THREE.MeshStandardMaterial(Object.assign({ map: tex, roughness: 0.82, metalness: 0.02 }, extra)));
      m.onBeforeCompile = sh => { sh.vertexShader = 'attribute vec3 uvo;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#ifdef USE_UV\n  vUv = ( uvTransform * vec3( uv * uvo.z + uvo.xy, 1.0 ) ).xy;\n#endif'); };
      return m;
    };
    const MM = [uvoMat(TEX[0]), uvoMat(TEX[1]), uvoMat(TEX[2], { metalness: 0.35, roughness: 0.55 }), uvoMat(TEX[3], { transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, emissive: col('#3cc8ff'), emissiveIntensity: 0.35 })];
    const MMs = MM.map((m, i) => i === 3 ? m : (() => { const n = uvoMat(TEX[i], { side: THREE.DoubleSide, metalness: m.metalness, roughness: m.roughness }); return n; })());
    const rl = Math.hypot(TS, LH), ra = Math.atan2(LH, TS);
    const coneQ = (() => {
      const h = TS / 2, g = new THREE.BufferGeometry();
      const P = [-h, 0, -h, 0, CH, 0, 0, 0, -h, -h, 0, -h, -h, 0, 0, 0, CH, 0];
      const U = [0, 0, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0.5, 0.5, 0.5];
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals();
      return g;
    })();
    const GEO = [() => new THREE.BoxGeometry(TS / 3, LH / 3, WT), () => new THREE.BoxGeometry(TS / 2, FT, TS / 2), () => { const g = new THREE.BoxGeometry(TS, 0.22, rl); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * 1.25); return g; }, () => coneQ.clone()];
    const CAP = [4200, 1400, 420, 900];
    const IM = [];
    for (let m = 0; m < 4; m++) {
      IM.push([]);
      for (let k = 0; k < 4; k++) {
        if (m === 3 && k > 0) { IM[m].push(null); continue; }
        const g = own(GEO[k]()); const cap = m === 3 ? 400 : CAP[k];
        g.setAttribute('uvo', new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3));
        const im = new THREE.InstancedMesh(g, k >= 2 ? MMs[m] : MM[m], cap);
        im.setColorAt(0, new THREE.Color(1, 1, 1));
        im.count = 0; im.castShadow = m !== 3; im.receiveShadow = m !== 3; im.frustumCulled = false;
        if (m === 3) im.renderOrder = 2;
        scene.add(im); IM[m].push(im);
      }
    }
    const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E4 = new THREE.Euler(0, 0, 0, 'YXZ'), P4 = new THREE.Vector3(), S4 = new THREE.Vector3(1, 1, 1), C4 = new THREE.Color();
    let dirty = true;
    const growing = new Set();
    const RYAW = [-Math.PI / 2, Math.PI, Math.PI / 2, 0], QYAW = [0, -Math.PI / 2, Math.PI / 2, Math.PI];
    function setInst(im, i, x, y, z, rx, ry, u, v, s) {
      E4.set(rx, ry, 0); Q4.setFromEuler(E4); P4.set(x, y, z); M4.compose(P4, Q4, S4); im.setMatrixAt(i, M4);
      const a = im.geometry.attributes.uvo.array; a[i * 3] = u; a[i * 3 + 1] = v; a[i * 3 + 2] = s;
    }
    function tint(S, pc) {
      if (pc.mat === 3) return C4.setRGB(1, 1, 1);
      const m = MATS[pc.mat], g = m.bt > 0 ? Math.min(1, (S.t - pc.born) / m.bt) : 1, hp = S.hpOf(pc), f = clamp(hp / pc.max, 0, 1);
      const glow = (1 - g) * 0.9;
      const dmg = 1 - f * 0.5 - 0.5 * Math.min(1, hp / (m.s + (pc.max - m.s) * g));
      return C4.setRGB(1 + glow * 0.5 - dmg * 0.25, 1 + glow * 0.75 - dmg * 0.45, 1 + glow * 1.1 - dmg * 0.5);
    }
    function rebuild(S) {
      const n = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      growing.clear();
      for (const pc of S.pieces.values()) {
        const m = pc.mat, bx = pc.x * TS, bz = pc.z * TS, by = pc.l * LH, e = pc.edit;
        const c = tint(S, pc);
        pc.ri = -1;
        if (pc.type === 0) {
          const im = IM[m][0]; pc.ri = n[m][0];
          for (let r = 0; r < 3; r++) for (let cc = 0; cc < 3; cc++) {
            if (e >> (r * 3 + cc) & 1) continue;
            const i = n[m][0]; if (i >= im.instanceMatrix.count) break; n[m][0]++;
            const y = by + (r + 0.5) * LH / 3;
            if (pc.slot === 0) setInst(im, i, bx + (cc + 0.5) * TS / 3, y, bz, 0, 0, cc / 3, r / 3, 1 / 3);
            else setInst(im, i, bx, y, bz + (cc + 0.5) * TS / 3, 0, -Math.PI / 2, cc / 3, r / 3, 1 / 3);
            im.setColorAt(i, c);
          }
          pc.rn = n[m][0] - pc.ri; pc.rk = 0;
        } else if (pc.type === 1) {
          const im = IM[m][1]; pc.ri = n[m][1];
          for (let q = 0; q < 4; q++) { if (e >> q & 1) continue; const i = n[m][1]; if (i >= im.instanceMatrix.count) break; n[m][1]++; const qx = q & 1, qz = q >> 1; setInst(im, i, bx + (qx + 0.5) * TS / 2, by - FT / 2, bz + (qz + 0.5) * TS / 2, 0, 0, qx / 2, qz / 2, 0.5); im.setColorAt(i, c); }
          pc.rn = n[m][1] - pc.ri; pc.rk = 1;
        } else if (pc.type === 2) {
          const im = IM[m][2]; const i = n[m][2]; if (i >= im.instanceMatrix.count) continue; n[m][2]++; pc.ri = i; pc.rn = 1; pc.rk = 2;
          const off = 0.11 / Math.cos(ra);
          setInst(im, i, bx + TS / 2, by + LH / 2 - off, bz + TS / 2, ra, RYAW[pc.d], 0, 0, 1); im.setColorAt(i, c);
        } else {
          const im = IM[m][3]; pc.ri = n[m][3];
          for (let q = 0; q < 4; q++) { if (e >> q & 1) continue; const i = n[m][3]; if (i >= im.instanceMatrix.count) break; n[m][3]++; setInst(im, i, bx + TS / 2, by + 0.01, bz + TS / 2, 0, QYAW[q], (q & 1) * 0.5, (q >> 1) * 0.5, 1); im.setColorAt(i, c); }
          pc.rn = n[m][3] - pc.ri; pc.rk = 3;
        }
        if (pc.mat !== 3 && (S.t - pc.born < MATS[pc.mat].bt || pc.dmg > 0)) growing.add(pc);
      }
      for (let m = 0; m < 4; m++) for (let k = 0; k < 4; k++) { const im = IM[m][k]; if (!im) continue; im.count = n[m][k]; im.instanceMatrix.needsUpdate = true; im.geometry.attributes.uvo.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
      dirty = false;
    }
    function updTint(S) {
      for (const pc of growing) {
        if (pc.ri < 0 || !S.pieces.has(pc.key)) { growing.delete(pc); continue; }
        const im = IM[pc.mat][pc.rk]; if (!im) continue;
        const c = tint(S, pc);
        for (let i = pc.ri; i < pc.ri + pc.rn; i++) im.setColorAt(i, c);
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
        if (S.t - pc.born > MATS[pc.mat].bt + 0.1) growing.delete(pc);
      }
    }

    const GH = (() => {
      const mk = (geo) => { const m = new THREE.Mesh(geo, own(new THREE.MeshBasicMaterial({ color: 0x2f8dff, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }))); const e = new THREE.LineSegments(own(new THREE.EdgesGeometry(geo)), own(new THREE.LineBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.9 }))); m.add(e); m.visible = false; m.renderOrder = 3; scene.add(m); return m; };
      return [mk(own(new THREE.BoxGeometry(TS, LH, 0.12))), mk(own(new THREE.BoxGeometry(TS, 0.12, TS))), mk(own(new THREE.BoxGeometry(TS, 0.12, rl))), mk((() => { const g = new THREE.ConeGeometry(TS / Math.SQRT2, CH, 4, 1, true); g.rotateY(Math.PI / 4); return own(g); })())];
    })();
    const red = new THREE.Color(0xff3b4f), blue = new THREE.Color(0x2f8dff);
    function ghost(tg, show) {
      for (let k = 0; k < 4; k++) GH[k].visible = show && tg && tg.type === k;
      if (!show || !tg) return;
      const g = GH[tg.type], x = tg.x * TS, z = tg.z * TS, y = tg.l * LH;
      g.material.color.copy(tg.ok ? blue : red);
      g.rotation.set(0, 0, 0);
      if (tg.type === 0) { if (tg.d === 0) g.position.set(x + TS / 2, y + LH / 2, z); else { g.position.set(x, y + LH / 2, z + TS / 2); g.rotation.y = Math.PI / 2; } }
      else if (tg.type === 1) g.position.set(x + TS / 2, y, z + TS / 2);
      else if (tg.type === 2) { g.rotation.order = 'YXZ'; g.rotation.set(ra, RYAW[tg.d], 0); g.position.set(x + TS / 2, y + LH / 2, z + TS / 2); }
      else g.position.set(x + TS / 2, y + CH / 2, z + TS / 2);
    }
    const EG = (() => {
      const g = new THREE.Group(); const tiles = [];
      const geo = own(new THREE.PlaneGeometry(1, 1));
      for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(geo, own(new THREE.MeshBasicMaterial({ color: 0x4fb7ff, transparent: true, opacity: 0.35, depthWrite: false, depthTest: false, side: THREE.DoubleSide }))); const e = new THREE.LineSegments(own(new THREE.EdgesGeometry(geo)), own(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthTest: false }))); m.add(e); m.renderOrder = 5; e.renderOrder = 6; g.add(m); tiles.push(m); }
      g.visible = false; scene.add(g);
      return { g, tiles };
    })();
    const selC = new THREE.Color(0xffd84a), keepC = new THREE.Color(0x4fb7ff), hovC = new THREE.Color(0xffffff);
    function editGrid(pc, sel, hov) {
      EG.g.visible = !!pc; if (!pc) return;
      const bx = pc.x * TS, bz = pc.z * TS, by = pc.l * LH;
      const n = pc.type === 0 || pc.type === 2 ? 9 : 4;
      for (let i = 0; i < 9; i++) {
        const t = EG.tiles[i]; t.visible = i < n; if (i >= n) continue;
        const on = (sel >> i) & 1;
        t.material.color.copy(i === hov ? (on ? selC : hovC) : on ? selC : keepC); t.material.opacity = on ? 0.55 : i === hov ? 0.4 : 0.22;
        t.rotation.set(0, 0, 0); t.rotation.order = 'YXZ';
        if (pc.type === 0) {
          const c = i % 3, r = (i / 3) | 0, s = TS / 3 * 0.92, sy = LH / 3 * 0.92; t.scale.set(s, sy, 1);
          if (pc.slot === 0) t.position.set(bx + (c + 0.5) * TS / 3, by + (r + 0.5) * LH / 3, bz);
          else { t.position.set(bx, by + (r + 0.5) * LH / 3, bz + (c + 0.5) * TS / 3); t.rotation.y = -Math.PI / 2; }
        } else if (pc.type === 2) {
          const c = i % 3, r = (i / 3) | 0, s = TS / 3 * 0.92; t.scale.set(s, s, 1);
          const X = bx + (c + 0.5) * TS / 3, Z = bz + (r + 0.5) * TS / 3;
          t.position.set(X, S_surf(pc, X, Z) + 0.08, Z); t.rotation.x = -Math.PI / 2;
        } else {
          const qx = i & 1, qz = i >> 1, s = TS / 2 * 0.92; t.scale.set(s, s, 1);
          const X = bx + (qx + 0.5) * TS / 2, Z = bz + (qz + 0.5) * TS / 2;
          t.position.set(X, by + (pc.type === 3 ? CH * 0.55 : 0) + 0.06, Z); t.rotation.x = -Math.PI / 2;
        }
      }
    }
    let S_surf = () => 0;

    const UG = { box: own(new THREE.BoxGeometry(1, 1, 1)) };
    const matC = new Map();
    const mat = (hex, o) => { const k = hex + (o ? JSON.stringify(o) : ''); if (!matC.has(k)) matC.set(k, own(new THREE.MeshStandardMaterial(Object.assign({ color: col(hex), roughness: 0.68, flatShading: true }, o || {})))); return matC.get(k); };
    const bx = (parent, w, h, d, x, y, z, m, pivotTop) => { const g = UG.box; const o = new THREE.Mesh(g, m); o.scale.set(w, h, d); o.position.set(x, y - (pivotTop ? h / 2 : 0), z); o.castShadow = true; if (pivotTop) { const p = new THREE.Group(); p.position.set(x, y, z); o.position.set(0, -h / 2, 0); p.add(o); parent.add(p); return p; } parent.add(o); return o; };
    const faceTex = new Map();
    function face(hero) {
      if (faceTex.has(hero.n)) return faceTex.get(hero.n);
      const t = cv(64, 64, (x, w, h) => {
        x.fillStyle = hero.skin; x.fillRect(0, 0, w, h);
        x.fillStyle = '#fff'; x.fillRect(12, 22, 14, 14); x.fillRect(38, 22, 14, 14);
        x.fillStyle = '#1b1830'; x.fillRect(17, 25, 8, 10); x.fillRect(41, 25, 8, 10);
        x.fillStyle = '#fff'; x.fillRect(19, 26, 3, 3); x.fillRect(43, 26, 3, 3);
        x.fillStyle = hero.hair; x.fillRect(11, 16, 16, 4); x.fillRect(37, 16, 16, 4);
        x.fillStyle = '#7a2b2b'; x.fillRect(24, 44, 16, 5); x.fillStyle = '#fff'; x.fillRect(26, 44, 12, 2);
        x.fillStyle = 'rgba(255,120,120,.35)'; x.fillRect(8, 38, 9, 5); x.fillRect(47, 38, 9, 5);
      });
      t.magFilter = THREE.NearestFilter; faceTex.set(hero.n, t); return t;
    }
    function weaponModel(k, rc) {
      const g = new THREE.Group();
      const dark = mat('#2b2f3a'), mid = mat('#4a5163'), acc = mat(rc, { emissive: col(rc), emissiveIntensity: 0.25 }), wood = mat('#8a5a33'), steel = mat('#c9d2dc', { metalness: 0.6, roughness: 0.35 });
      if (k === 'pick') { bx(g, 0.06, 0.06, 0.9, 0, 0, -0.25, wood); const h = bx(g, 0.5, 0.08, 0.1, 0, 0.0, -0.68, steel); h.rotation.z = 0; bx(g, 0.12, 0.1, 0.12, 0.25, -0.03, -0.68, acc); bx(g, 0.12, 0.1, 0.12, -0.25, -0.03, -0.68, acc); }
      else if (k === 'ar') { bx(g, 0.09, 0.13, 0.62, 0, 0, -0.25, dark); bx(g, 0.04, 0.04, 0.3, 0, 0.02, -0.68, mid); bx(g, 0.07, 0.16, 0.08, 0, -0.12, -0.2, mid); bx(g, 0.08, 0.11, 0.22, 0, -0.03, 0.12, acc); bx(g, 0.05, 0.05, 0.14, 0, 0.1, -0.3, acc); bx(g, 0.06, 0.12, 0.07, 0, -0.1, -0.05, dark); }
      else if (k === 'sg') { bx(g, 0.08, 0.1, 0.62, 0, 0.01, -0.35, dark); bx(g, 0.1, 0.09, 0.28, 0, -0.07, -0.42, wood); bx(g, 0.09, 0.13, 0.26, 0, -0.04, 0.06, acc); bx(g, 0.06, 0.12, 0.07, 0, -0.1, -0.08, dark); }
      else if (k === 'smg') { bx(g, 0.09, 0.12, 0.38, 0, 0, -0.18, dark); bx(g, 0.05, 0.18, 0.07, 0, -0.14, -0.18, mid); bx(g, 0.035, 0.035, 0.16, 0, 0.02, -0.44, mid); bx(g, 0.07, 0.07, 0.14, 0, 0.0, 0.06, acc); }
      else { bx(g, 0.08, 0.12, 0.7, 0, 0, -0.22, dark); bx(g, 0.035, 0.035, 0.5, 0, 0.02, -0.82, mid); bx(g, 0.07, 0.07, 0.3, 0, 0.12, -0.25, mid); bx(g, 0.09, 0.13, 0.26, 0, -0.03, 0.22, acc); bx(g, 0.05, 0.05, 0.06, 0, 0.12, -0.42, steel); }
      return g;
    }
    function makeChar(hero) {
      const H = HEROES[hero % HEROES.length];
      const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
      const suit = mat(H.suit), trim = mat(H.trim), skin = mat(H.skin), hair = mat(H.hair), boot = mat('#2a2738');
      const hip = new THREE.Group(); hip.position.y = 0.82; body.add(hip);
      const legL = bx(hip, 0.2, 0.8, 0.22, -0.12, 0, 0, suit, true), legR = bx(hip, 0.2, 0.8, 0.22, 0.12, 0, 0, suit, true);
      bx(legL, 0.22, 0.16, 0.28, 0, -0.73, -0.03, boot); bx(legR, 0.22, 0.16, 0.28, 0, -0.73, -0.03, boot);
      const torso = new THREE.Group(); torso.position.y = 0.82; body.add(torso);
      bx(torso, 0.52, 0.56, 0.3, 0, 0.3, 0, suit); bx(torso, 0.54, 0.09, 0.32, 0, 0.1, 0, trim); bx(torso, 0.16, 0.36, 0.02, 0.1, 0.36, -0.16, trim);
      bx(torso, 0.38, 0.42, 0.16, 0, 0.32, 0.22, mat('#3b3f52')); bx(torso, 0.3, 0.08, 0.17, 0, 0.42, 0.23, trim);
      const head = new THREE.Group(); head.position.y = 0.66; torso.add(head);
      const hm = [skin, skin, skin, skin, skin, new THREE.MeshStandardMaterial({ map: face(H), roughness: 0.7 })]; own(hm[5]);
      const hd = new THREE.Mesh(UG.box, [skin, skin, skin, skin, skin, hm[5]]); hd.scale.set(0.42, 0.42, 0.4); hd.position.y = 0.22; hd.castShadow = true; head.add(hd);
      bx(head, 0.46, 0.14, 0.44, 0, 0.46, 0.01, hair); bx(head, 0.46, 0.3, 0.1, 0, 0.32, 0.19, hair);
      if (H.visor) bx(head, 0.46, 0.09, 0.05, 0, 0.27, -0.205, mat('#30e0ff', { emissive: col('#1aa8d8'), emissiveIntensity: 0.6 }));
      const armL = bx(torso, 0.15, 0.6, 0.16, -0.34, 0.54, 0, suit, true), armR = bx(torso, 0.15, 0.6, 0.16, 0.34, 0.54, 0, suit, true);
      bx(armL, 0.16, 0.14, 0.17, 0, -0.58, 0, skin); bx(armR, 0.16, 0.14, 0.17, 0, -0.58, 0, skin);
      bx(armL, 0.17, 0.08, 0.18, 0, -0.38, 0, trim); bx(armR, 0.17, 0.08, 0.18, 0, -0.38, 0, trim);
      const hand = new THREE.Group(); hand.position.set(0, -0.6, 0); hand.rotation.x = -Math.PI / 2; armR.add(hand);
      const guns = {};
      for (const k of ['pick', 'ar', 'sg', 'smg', 'sn']) { const gm = weaponModel(k, RAR[0].c); gm.visible = false; hand.add(gm); guns[k] = gm; }
      const tag = (() => {
        const c = document.createElement('canvas'); c.width = 256; c.height = 64;
        const t = own(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding;
        const s = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true, fog: false })));
        s.scale.set(1.8, 0.45, 1); s.position.y = 2.35; s.visible = false; root.add(s);
        return { c, t, s, txt: '' };
      })();
      scene.add(root);
      return { root, body, hip, torso, head, legL, legR, armL, armR, hand, guns, tag, ph: 0, sw: 0, gunK: '', gunR: -1, rec: 0 };
    }
    function setGun(ch, k, r) {
      if (ch.gunK === k && ch.gunR === r) return;
      for (const g in ch.guns) ch.guns[g].visible = g === k;
      if (ch.gunR !== r || ch.gunK !== k) {
        const gm = ch.guns[k]; if (gm && r >= 0) gm.traverse(o => { if (o.isMesh && o.material && o.material.emissive && o.material.emissiveIntensity > 0.2) o.material = mat(RAR[r].c, { emissive: col(RAR[r].c), emissiveIntensity: 0.25 }); });
      }
      ch.gunK = k; ch.gunR = r;
    }
    function setTag(ch, name, color) {
      const txt = name + '|' + color; if (ch.tag.txt === txt) return; ch.tag.txt = txt;
      const x = ch.tag.c.getContext('2d'); x.clearRect(0, 0, 256, 64);
      x.font = '900 30px Nunito, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineWidth = 7; x.strokeStyle = 'rgba(10,14,40,.85)'; x.strokeText(name, 128, 32); x.fillStyle = color; x.fillText(name, 128, 32);
      ch.tag.t.needsUpdate = true;
    }
    function animChar(ch, p, dt, t, hold) {
      const sp = Math.hypot(p.vx, p.vz);
      ch.ph += dt * (4 + sp * 1.6) * (sp > 0.3 ? 1 : 0); ch.sw = damp(ch.sw, sp > 0.3 && p.onG ? Math.min(1, sp / RUN) : 0, 12, dt);
      const s = Math.sin(ch.ph) * 0.85 * ch.sw;
      const air = !p.onG ? 1 : 0;
      ch.legL.rotation.x = s + air * -0.5; ch.legR.rotation.x = -s + air * 0.3;
      const cr = p.crouch ? 1 : 0;
      ch.body.position.y = damp(ch.body.position.y, -cr * 0.38 + Math.abs(Math.cos(ch.ph)) * 0.05 * ch.sw, 14, dt);
      ch.legL.rotation.x -= cr * 0.9; ch.legR.rotation.x -= cr * 0.9;
      ch.torso.rotation.x = damp(ch.torso.rotation.x, cr * 0.25, 12, dt);
      ch.head.rotation.x = clamp(p.pitch * 0.5, -0.5, 0.5);
      ch.rec = Math.max(0, ch.rec - dt * 8);
      if (hold === 'pick') {
        const sw = ch.swing || 0;
        ch.armR.rotation.x = 0.45 + Math.sin(Math.min(1, sw) * Math.PI) * 1.9 - s * 0.3; ch.armR.rotation.z = 0;
        ch.armL.rotation.x = -s * 0.8; ch.armL.rotation.z = 0;
        ch.swing = Math.max(0, sw - dt * 3.4);
      } else if (hold === 'build') {
        ch.armR.rotation.x = 0.9 + s * 0.2; ch.armL.rotation.x = 0.9 - s * 0.2; ch.armR.rotation.z = -0.15; ch.armL.rotation.z = 0.15;
      } else {
        const a = Math.PI / 2 + p.pitch * 0.92 - ch.rec * 0.25;
        ch.armR.rotation.x = a; ch.armR.rotation.z = -0.04; ch.armL.rotation.x = a - 0.12; ch.armL.rotation.z = 0.62;
      }
    }

    const fxMat = own(new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const tracers = [];
    for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(UG.box, fxMat); m.visible = false; m.frustumCulled = false; scene.add(m); tracers.push({ m, t: 0 }); }
    let tri = 0;
    const flashT = cv(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(0.35, 'rgba(255,200,80,.9)'); g.addColorStop(1, 'rgba(255,120,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const flashes = [];
    for (let i = 0; i < 8; i++) { const s = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: flashT, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }))); s.visible = false; scene.add(s); flashes.push({ s, t: 0 }); }
    let fli = 0;
    const PN = 600, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN);
    const pGeo = own(new THREE.BufferGeometry()); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pts = new THREE.Points(pGeo, own(new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, depthWrite: false })));
    pts.frustumCulled = false; scene.add(pts);
    for (let i = 0; i < PN; i++) pPos[i * 3 + 1] = -999;
    let pi = 0;
    function spark(x, y, z, hex, n, spd) {
      C4.set(hex).convertSRGBToLinear();
      for (let k = 0; k < n; k++) { const i = pi; pi = (pi + 1) % PN; pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z; pVel[i * 3] = (Math.random() - 0.5) * spd; pVel[i * 3 + 1] = Math.random() * spd; pVel[i * 3 + 2] = (Math.random() - 0.5) * spd; pLife[i] = 0.35 + Math.random() * 0.4; pCol[i * 3] = C4.r; pCol[i * 3 + 1] = C4.g; pCol[i * 3 + 2] = C4.b; }
      pGeo.attributes.color.needsUpdate = true;
    }
    const DN = 160, deb = new THREE.InstancedMesh(own(new THREE.BoxGeometry(0.35, 0.35, 0.12)), own(new THREE.MeshStandardMaterial({ roughness: 0.8 })), DN);
    deb.castShadow = true; deb.frustumCulled = false; deb.count = DN; scene.add(deb);
    const dP = new Float32Array(DN * 3), dV = new Float32Array(DN * 3), dR = new Float32Array(DN * 3), dL = new Float32Array(DN);
    for (let i = 0; i < DN; i++) { dP[i * 3 + 1] = -999; deb.setColorAt(i, C4.setRGB(1, 1, 1)); }
    let di = 0;
    function debris(x, y, z, hex, n, sx, sy, sz) {
      C4.set(hex).convertSRGBToLinear();
      for (let k = 0; k < n; k++) { const i = di; di = (di + 1) % DN; dP[i * 3] = x + (Math.random() - 0.5) * sx; dP[i * 3 + 1] = y + (Math.random() - 0.5) * sy; dP[i * 3 + 2] = z + (Math.random() - 0.5) * sz; dV[i * 3] = (Math.random() - 0.5) * 6; dV[i * 3 + 1] = 2 + Math.random() * 5; dV[i * 3 + 2] = (Math.random() - 0.5) * 6; dR[i * 3] = Math.random() * 6; dR[i * 3 + 1] = Math.random() * 6; dR[i * 3 + 2] = 0; dL[i] = 1.2 + Math.random() * 0.8; deb.setColorAt(i, C4); }
      if (deb.instanceColor) deb.instanceColor.needsUpdate = true;
    }
    function tracer(x0, y0, z0, x1, y1, z1, w) {
      const t = tracers[tri]; tri = (tri + 1) % tracers.length;
      const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, l = Math.hypot(dx, dy, dz);
      if (l < 0.5) return;
      const m = t.m; m.visible = true; t.t = w === 4 ? 0.12 : 0.05;
      m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.scale.set(w === 4 ? 0.05 : 0.025, w === 4 ? 0.05 : 0.025, l); m.lookAt(x1, y1, z1);
    }
    function flash(x, y, z, s) { const f = flashes[fli]; fli = (fli + 1) % flashes.length; f.s.visible = true; f.t = 0.045; f.s.position.set(x, y, z); f.s.scale.setScalar(s); f.s.material.rotation = Math.random() * TAU; }
    function fxStep(dt) {
      for (const t of tracers) if (t.m.visible) { t.t -= dt; if (t.t <= 0) t.m.visible = false; }
      for (const f of flashes) if (f.s.visible) { f.t -= dt; if (f.t <= 0) f.s.visible = false; }
      let any = false;
      for (let i = 0; i < PN; i++) { if (pLife[i] <= 0) continue; any = true; pLife[i] -= dt; if (pLife[i] <= 0) { pPos[i * 3 + 1] = -999; continue; } pVel[i * 3 + 1] -= 18 * dt; pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt; }
      if (any) pGeo.attributes.position.needsUpdate = true;
      for (let i = 0; i < DN; i++) {
        if (dL[i] > 0) {
          dL[i] -= dt;
          if (dL[i] <= 0) dP[i * 3 + 1] = -999;
          else { dV[i * 3 + 1] -= 20 * dt; dP[i * 3] += dV[i * 3] * dt; dP[i * 3 + 1] += dV[i * 3 + 1] * dt; dP[i * 3 + 2] += dV[i * 3 + 2] * dt; if (dP[i * 3 + 1] < 0.1 && Math.abs(dP[i * 3]) < E && Math.abs(dP[i * 3 + 2]) < E) { dP[i * 3 + 1] = 0.1; dV[i * 3 + 1] *= -0.3; dV[i * 3] *= 0.6; dV[i * 3 + 2] *= 0.6; } dR[i * 3] += dt * 5; dR[i * 3 + 1] += dt * 4; }
        }
        const s = dL[i] > 0 ? Math.min(1, dL[i] * 2) : 0.0001;
        E4.set(dR[i * 3], dR[i * 3 + 1], 0); Q4.setFromEuler(E4); P4.set(dP[i * 3], dP[i * 3 + 1], dP[i * 3 + 2]); S4.set(s, s, s); M4.compose(P4, Q4, S4); deb.setMatrixAt(i, M4);
      }
      S4.set(1, 1, 1);
      deb.instanceMatrix.needsUpdate = true;
    }
    return {
      scene, cam, sun, IM, ghost, editGrid, set surfFn(f) { S_surf = f; }, rebuild, updTint, makeChar, setGun, setTag, animChar, tracer, flash, spark, debris, fxStep,
      markDirty() { dirty = true; }, markTint(pc) { growing.add(pc); }, get dirty() { return dirty; }, water,
      setShadow(n) { if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } sun.shadow.mapSize.set(n, n); },
      dispose() { for (const x of bin) { try { x.dispose(); } catch (e) {} } for (const m of matC.values()) m.dispose(); }
    };
  }

  const ICON = {
    pick: '<svg viewBox="0 0 48 32"><path d="M8 26 36 8" stroke="#c79a6a" stroke-width="4" stroke-linecap="round"/><path d="M26 4c8-2 16 2 18 8-6-3-12-4-18-2z" fill="#dfe6ee"/></svg>',
    ar: '<svg viewBox="0 0 48 32"><path d="M3 13h30l3-2h9v5H36v3h-6l-2 7h-6l1-7H12l-4 5H4l2-6H3z" fill="#e9edf5"/></svg>',
    sg: '<svg viewBox="0 0 48 32"><path d="M3 12h38v4H18l-2 3h-4l-5 7H3l3-8H3z" fill="#e9edf5"/><path d="M24 17h12v3H24z" fill="#c79a6a"/></svg>',
    smg: '<svg viewBox="0 0 48 32"><path d="M8 11h24v6h-8l-2 10h-5l1-10h-4l-4 5H6l3-6H8z" fill="#e9edf5"/><path d="M32 13h8v2h-8z" fill="#e9edf5"/></svg>',
    sn: '<svg viewBox="0 0 48 32"><path d="M2 15h28l14-1v3H30l-6 2-3 6h-5l2-6H8l-3 4H2z" fill="#e9edf5"/><path d="M14 9h12v4H14z" fill="#9aa3b5"/></svg>',
    p0: '<svg viewBox="0 0 32 32"><rect x="5" y="5" width="22" height="22" rx="2" fill="none" stroke="#fff" stroke-width="3"/><path d="M5 16h22M16 5v22" stroke="#fff" stroke-width="1.5" opacity=".6"/></svg>',
    p1: '<svg viewBox="0 0 32 32"><path d="M4 21 12 11h16l-8 10z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>',
    p2: '<svg viewBox="0 0 32 32"><path d="M4 26h24V8z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M10 26v-5M16 26v-10M22 26V13" stroke="#fff" stroke-width="1.5" opacity=".6"/></svg>',
    p3: '<svg viewBox="0 0 32 32"><path d="M3 24 16 7l13 17z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M16 7v17" stroke="#fff" stroke-width="1.5" opacity=".6"/></svg>',
    edit: '<svg viewBox="0 0 32 32"><path d="M6 26l2-7 13-13 5 5-13 13z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>',
    jump: '<svg viewBox="0 0 32 32"><path d="M16 5 6 17h6v9h8v-9h6z" fill="#fff"/></svg>',
    crouch: '<svg viewBox="0 0 32 32"><path d="M16 27 6 15h6V6h8v9h6z" fill="#fff"/></svg>',
    build: '<svg viewBox="0 0 32 32"><path d="M5 27h22M8 27V12l8-6 8 6v15" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>',
    rel: '<svg viewBox="0 0 32 32"><path d="M25 16a9 9 0 1 1-3-6.7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M24 4v7h-7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    scope: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#fff" stroke-width="3"/><path d="M16 2v8M16 22v8M2 16h8M22 16h8" stroke="#fff" stroke-width="2.5"/></svg>'
  };
  function loadPrefs(api) {
    let s = null;
    try { s = api.load(); } catch (e) { s = null; }
    const o = s && typeof s === 'object' && !Array.isArray(s) ? s : {};
    const num = (v, a, b, d) => (typeof v === 'number' && isFinite(v) && v >= a && v <= b ? v : d);
    const int = (v, a, b, d) => (Number.isInteger(v) && v >= a && v <= b ? v : d);
    return {
      v: 1, hero: int(o.hero, 0, HEROES.length - 1, 0), mode: int(o.mode, 0, MODES.length - 1, 0), lvl: int(o.lvl, 0, 3, 1), goal: [2, 3, 5].includes(o.goal) ? o.goal : 3,
      rarity: o.rarity === 'legend' ? 'legend' : 'random', sens: num(o.sens, 0.2, 3, 1), adsSens: num(o.adsSens, 0.2, 1.5, 0.7), inv: o.inv === true, er: o.er !== false, turbo: o.turbo !== false, fov: int(o.fov, 70, 100, 80),
      wins: int(o.wins, 0, 1e7, 0), losses: int(o.losses, 0, 1e7, 0), elims: int(o.elims, 0, 1e8, 0), streak: int(o.streak, 0, 1e6, 0), best: int(o.best, 0, 1e6, 0), hw: int(o.hw, 0, 1e7, 0)
    };
  }
  const keyName = new Map();
  function keyLabel(code) {
    if (keyName.has(code)) return keyName.get(code);
    return code.replace(/^Key/, '').replace(/^Digit/, '').replace('ShiftLeft', 'Shift').replace('Space', 'Space').replace('Escape', 'Esc');
  }
  try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => { for (const c of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyQ', 'KeyF', 'KeyG', 'KeyR', 'KeyE', 'KeyP']) { const v = m.get(c); if (v) keyName.set(c, v.toUpperCase()); } }).catch(() => {}); } catch (e) {}

  function run(root, wrap, api, V) {
    const { THREE, renderer, canvas } = V;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
    canvas.style.width = '100%'; wrap.append(canvas);
    const quality = { shadow: COARSE ? 1024 : 2048, lvl: 0 };
    const view = makeView(THREE, V, api, quality);
    fitPR(api, V, l => { quality.lvl = l; });
    renderer.toneMappingExposure = 1.05;
    const audio = makeAudio(api);
    const prefs = loadPrefs(api);
    const persist = () => api.save(prefs);
    const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.append(e); return e; };
    const ui = el('div', 'ui', wrap); ui.setAttribute('data-i18n', '');
    const hud = el('div', 'hud', ui); hud.hidden = true;
    const scopeEl = el('div', 'scope', hud), flashEl = el('div', 'flash', hud);
    const xh = el('div', 'xh', hud), xl = [el('i', 'a', xh), el('i', 'a', xh), el('i', 'b', xh), el('i', 'b', xh)], xdot = el('i', 'dot', xh), xring = el('i', 'ring', xh);
    const hm = el('div', 'hm', hud);
    const top = el('div', 'top', hud);
    const scMe = el('div', 'sc me', top, '<small></small><span>0</span>'), clk = el('div', 'clk', top, '<small></small><span>0:00</span>'), scOp = el('div', 'sc op', top, '<small></small><span>0</span>');
    const feed = el('div', 'feed', hud);
    const vit = el('div', 'vit', hud);
    const matsEl = el('div', 'mats', vit), matEls = [0, 1, 2].map(i => el('div', 'mat', matsEl, `<s style="background:${MATS[i].c}"></s><span>0</span>`));
    const barSh = el('div', 'bar sh', vit, '<i></i><b>0</b>'), barHp = el('div', 'bar hp', vit, '<i></i><b>0</b>');
    const ammoEl = el('div', 'ammo', hud);
    const slots = el('div', 'slots', hud), rowW = el('div', 'row', slots), rowB = el('div', 'row', slots);
    const relEl = el('div', 'rel', hud, '<i></i>'); relEl.hidden = true;
    const big = el('div', 'big', hud), tip = el('div', 'tip', hud), editEl = el('div', 'edit', hud, 'Editing'); editEl.hidden = true;
    const pzBtn = el('button', 'pz', hud, '<i></i>'); pzBtn.setAttribute('aria-label', 'Pause');
    const netEl = el('div', 'net', hud); netEl.hidden = true;
    const dns = []; for (let i = 0; i < 18; i++) { const d = el('div', 'dn', hud); d.style.opacity = 0; dns.push({ d, t: 0, x: 0, y: 0, z: 0 }); }
    let dni = 0;
    const slotEls = [], bslotEls = [];
    for (let i = 0; i < 5; i++) { const s = el('div', 'sl', rowW, `<em>${i === 0 ? keyLabel('KeyF') : i}</em><span></span><u></u><i class="rb"></i>`); s.dataset.s = i; slotEls.push(s); }
    const BK = ['KeyZ', 'KeyX', 'KeyC', 'KeyV'];
    for (let i = 0; i < 4; i++) { const s = el('div', 'sl bd', rowB, `<em>${keyLabel(BK[i])}</em>${ICON['p' + i]}`); s.dataset.b = i; bslotEls.push(s); }
    const tc = el('div', 'tc', wrap); tc.hidden = true;
    const joy = el('div', 'joy idle', tc, '<i></i>'), knob = joy.firstChild;
    const tbtn = (cls, html, r, b, lbl) => { const e = el('button', 'tb ' + cls, tc, html); e.style.right = r + 'px'; e.style.bottom = b + 'px'; e.setAttribute('aria-label', lbl); return e; };
    const tFire = tbtn('fire', 'FIRE', 22, 128, 'Fire'), tJump = tbtn('', ICON.jump, 32, 46, 'Jump'), tCrouch = tbtn('', ICON.crouch, 98, 46, 'Crouch'), tBuild = tbtn('', ICON.build, 164, 46, 'Build'), tEdit = tbtn('', ICON.edit, 230, 46, 'Edit'), tRel = tbtn('', ICON.rel, 112, 158, 'Reload'), tScope = tbtn('', ICON.scope, 112, 104 + 0, 'Aim');
    tScope.style.bottom = '104px'; tScope.style.right = '118px'; tRel.style.right = '118px'; tRel.style.bottom = '162px';
    const tPieces = [0, 1, 2, 3].map(i => { const b = tbtn('', ICON['p' + i], 32 + i * 60, 226, PIECES[i]); b.hidden = true; return b; });
    const scr = el('div', 'scr', ui);

    let S = null, me = null, phase = 'home', paused = false, acc = 0, chars = [], spec = null, online = null, matchCfg = null, endT = 0, lastCount = -1, rotR = 0;
    let S_home = null, homeChar = null, homeT = 0;
    const look = { yaw: 0, pitch: 0 };
    const keys = new Set();
    let mouse0 = false, mouse2 = false, locked = false, touchOn = COARSE, tFireOn = false, tAds = false, tCrouchOn = false, lastBuild = 0, wantBuild = -1;
    const joyV = { x: 0, y: 0 };
    let edit = null;
    const stats = { shots: 0, hits: 0, builds: 0, dmg: 0 };
    if (touchOn) wrap.classList.add('touch');

    function heroBtns() { return HEROES.map((h, i) => `<button class="hero${i === prefs.hero ? ' on' : ''}" data-h="${i}" style="background:linear-gradient(135deg,${h.suit} 55%,${h.trim} 55%)" aria-label="${h.n}"></button>`).join(''); }
    function optBtns(key, list) { return list.map(([v, n]) => `<button class="opt${prefs[key] === v ? ' on' : ''}" data-k="${key}" data-v="${typeof v === 'string' ? "'" + v : v}">${n}</button>`).join(''); }
    function setScr(html, cls) {
      scr.className = 'scr' + (cls ? ' ' + cls : '');
      scr.innerHTML = html;
      scr.hidden = !html;
      const f = scr.querySelector('[data-a="play"],[data-a="resume"],[data-a="again"],.btn');
      if (f && !touchOn) try { f.focus({ preventScroll: true }); } catch (e) {}
    }
    function homeHtml() {
      const md = MODES[prefs.mode];
      return `<div class="title">Build<br>Brawl<small>${T('BUILD · EDIT · BRAWL')}</small></div>
      <div class="stats"><div><b>${prefs.wins}</b>${T('Wins')}</div><div><b>${prefs.elims}</b>${T('Eliminations')}</div><div><b>${prefs.best}</b>${T('Best streak')}</div></div>
      <div class="home"><div class="pan">
        <div class="modes">${MODES.map((m, i) => `<button class="mode${i === prefs.mode ? ' on' : ''}" data-m="${i}"><b>${m.n}</b><span>${m.d}</span></button>`).join('')}</div>
        ${md.k !== 'practice' ? `<div class="optrow"><span>Opponents</span><div class="opts">${optBtns('lvl', LVL.map((l, i) => [i, l.n]))}</div></div>` : ''}
        ${md.k === 'build' || md.k === 'box' ? `<div class="optrow"><span>Match</span><div class="opts">${optBtns('goal', [[2, 'First to 2'], [3, 'First to 3'], [5, 'First to 5']])}</div></div>` : ''}
        <div class="optrow"><span>Weapons</span><div class="opts">${optBtns('rarity', [['random', 'Random rarity'], ['legend', 'All legendary']])}</div></div>
        <div class="optrow"><span>Builder</span><div class="heroes">${heroBtns()}</div></div>
        <div class="btns"><button class="btn" data-a="play">Play</button><button class="btn alt" data-a="online">Play online</button><button class="btn ghost" data-a="settings">Settings</button><button class="btn ghost" data-a="controls">Controls</button></div>
      </div></div>`;
    }
    function showHome() {
      phase = 'home'; paused = false; hud.hidden = true; tc.hidden = true; unlock(); endEdit(false);
      setScr(homeHtml(), '');
      if (!S_home) makeHome();
      view.surfFn = (pc, X, Z) => S_home.surf(pc, X, Z); view.markDirty(); if (homeChar) homeChar.root.visible = true;
    }
    function controlsHtml(back) {
      const k = c => `<kbd>${esc(keyLabel(c))}</kbd>`;
      return `<div class="pan"><h2>Controls</h2><div class="keys">
        <span>${k('KeyW')} ${k('KeyA')} ${k('KeyS')} ${k('KeyD')}</span><span>Move</span>
        <span><kbd>Space</kbd></span><span>Jump</span>
        <span><kbd>Shift</kbd></span><span>Crouch</span>
        <span><i class="kk">Mouse</i></span><span>Aim · left click fires or places · right click aims down sights</span>
        <span>${k('KeyF')} <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd></span><span>Pickaxe, assault rifle, shotgun, SMG, sniper</span>
        <span>${k('KeyZ')} ${k('KeyX')} ${k('KeyC')} ${k('KeyV')}</span><span>Wall, floor, ramp, cone</span>
        <span>${k('KeyQ')}</span><span>Switch between building and weapons</span>
        <span><i class="kk">Right click</i></span><span>In build mode: change material (wood, stone, metal)</span>
        <span>${k('KeyR')}</span><span>Reload · in build mode: turn the ramp</span>
        <span>${k('KeyG')}</span><span>Edit the piece you look at: click or drag its tiles, then release or press edit again to confirm. Right click resets it.</span>
        <span><kbd>Esc</kbd> ${k('KeyP')}</span><span>Pause</span>
        <span><i class="kk">Touch</i></span><span>Left stick moves, drag to look, buttons fire, jump, crouch, build, edit and reload</span>
      </div><div class="btns"><button class="btn" data-a="${back}">Back</button></div></div>`;
    }
    function settingsHtml(back) {
      return `<div class="pan"><h2>Settings</h2>
        <div class="optrow"><span>Look sensitivity</span><input type="range" min="0.2" max="3" step="0.05" value="${prefs.sens}" data-r="sens" aria-label="Look sensitivity"></div>
        <div class="optrow"><span>Aim sensitivity</span><input type="range" min="0.2" max="1.5" step="0.05" value="${prefs.adsSens}" data-r="adsSens" aria-label="Aim sensitivity"></div>
        <div class="optrow"><span>Field of view</span><input type="range" min="70" max="100" step="1" value="${prefs.fov}" data-r="fov" aria-label="Field of view"></div>
        <div class="optrow"><span>Invert vertical look</span><div class="opts">${optBtns('inv', [[false, 'Off'], [true, 'On']])}</div></div>
        <div class="optrow"><span>Confirm edit on release</span><div class="opts">${optBtns('er', [[true, 'On'], [false, 'Off']])}</div></div>
        <div class="optrow"><span>Turbo building (hold to keep placing)</span><div class="opts">${optBtns('turbo', [[true, 'On'], [false, 'Off']])}</div></div>
        <div class="btns"><button class="btn" data-a="${back}">Back</button></div></div>`;
    }
    function pauseHtml() {
      const pr = S && S.mode === 'practice';
      return `<div class="pan" style="width:min(92%,26em)"><h2>Paused</h2>${online ? `<p>${T('The match keeps running online.')}</p>` : ''}<div class="btns" style="flex-direction:column">
        <button class="btn" data-a="resume">Resume</button>${!online ? '<button class="btn alt" data-a="restart">Restart match</button>' : ''}${pr ? '<button class="btn alt" data-a="clear">Clear builds</button>' : ''}
        <button class="btn ghost" data-a="psettings">Settings</button><button class="btn ghost" data-a="pcontrols">Controls</button><button class="btn ghost" data-a="quit">${online ? 'Leave match' : 'Quit to menu'}</button></div></div>`;
    }
    api.on(scr, 'click', e => {
      const b = e.target.closest('button'); if (!b) return;
      audio.wake(); audio.play('tap');
      if (b.dataset.m != null) { prefs.mode = +b.dataset.m; persist(); setScr(homeHtml()); return; }
      if (b.dataset.h != null) { prefs.hero = +b.dataset.h; persist(); setScr(homeHtml()); if (homeChar) { homeChar.root.parent && homeChar.root.parent.remove(homeChar.root); homeChar = view.makeChar(prefs.hero); } return; }
      if (b.dataset.k) { const raw = b.dataset.v; const v = raw[0] === "'" ? raw.slice(1) : raw === 'true' ? true : raw === 'false' ? false : +raw; prefs[b.dataset.k] = v; persist(); if (phase === 'home') setScr(homeHtml()); else b.parentNode.querySelectorAll('.opt').forEach(x => x.classList.toggle('on', x === b)); return; }
      const a = b.dataset.a;
      if (a === 'play') startLocal();
      else if (a === 'online') goOnline();
      else if (a === 'settings') setScr(settingsHtml('home'), 'dim');
      else if (a === 'controls') setScr(controlsHtml('home'), 'dim');
      else if (a === 'home') showHome();
      else if (a === 'resume') setPause(false);
      else if (a === 'restart') { setPause(false); startLocal(); }
      else if (a === 'clear') { if (S) { S.clearPieces(true); } setPause(false); }
      else if (a === 'psettings') setScr(settingsHtml('pause'), 'dim');
      else if (a === 'pcontrols') setScr(controlsHtml('pause'), 'dim');
      else if (a === 'pause') setScr(pauseHtml(), 'dim');
      else if (a === 'quit') { setPause(false); leaveMatch(); }
      else if (a === 'again') { if (online) netRematch(); else startLocal(); }
      else if (a === 'menu') leaveMatch();
      else if (a === 'lobby') netLobby();
    });
    api.on(scr, 'input', e => { const r = e.target.dataset && e.target.dataset.r; if (r) { prefs[r] = +e.target.value; persist(); } });
    api.on(pzBtn, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); setPause(true); });

    function setPause(on) {
      if (on && phase !== 'play') return;
      if (on === paused) { if (on) setScr(pauseHtml(), 'dim'); return; }
      paused = on; mouse0 = mouse2 = false; keys.clear(); tFireOn = false;
      if (on) { endEdit(false); setScr(pauseHtml(), 'dim'); unlock(); }
      else { setScr('', ''); scr.hidden = true; }
    }
    const lock = () => { if (touchOn || locked) return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
    const unlock = () => { if (locked) { try { document.exitPointerLock(); } catch (e) {} } };
    const playing = () => phase === 'play' && !paused && S && me;
    const lookMove = (dx, dy, k) => {
      const z = me && me.ads ? prefs.adsSens * (me.wep[me.slot] && W[me.wep[me.slot].w].k === 'sn' ? 0.35 : 0.8) : 1;
      look.yaw -= dx * k * prefs.sens * z; look.pitch = clamp(look.pitch - dy * k * prefs.sens * z * (prefs.inv ? -1 : 1), -1.45, 1.45);
    };
    let joyId = null, camId = null, jx0 = 0, jy0 = 0, lx = 0, ly = 0;
    const scaleOf = () => { const r = wrap.getBoundingClientRect(); return { r, s: r.width / (wrap.offsetWidth || r.width) }; };
    api.on(wrap, 'contextmenu', e => e.preventDefault());
    api.on(wrap, 'pointerdown', e => {
      audio.wake();
      if (e.target.closest('button') || e.target.closest('.pan') || e.target.closest('input')) return;
      if (e.pointerType === 'touch' && !touchOn) { touchOn = true; wrap.classList.add('touch'); if (phase === 'play') tc.hidden = false; }
      if (!playing()) return;
      const sl = e.target.closest('.sl');
      if (sl && touchOn) { if (sl.dataset.s != null) pickSlot(+sl.dataset.s); return; }
      if (e.pointerType === 'mouse') {
        if (!locked) { lock(); return; }
        return;
      }
      const { r, s } = scaleOf(), fx = (e.clientX - r.left) / r.width;
      if (fx < 0.45 && joyId === null) {
        joyId = e.pointerId; jx0 = e.clientX; jy0 = e.clientY;
        joy.style.left = (e.clientX - r.left) / s + 'px'; joy.style.top = (e.clientY - r.top) / s + 'px'; joy.classList.add('on'); joy.classList.remove('idle'); knob.style.transform = '';
      } else if (camId === null) { camId = e.pointerId; lx = e.clientX; ly = e.clientY; }
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
    });
    api.on(wrap, 'pointermove', e => {
      if (e.pointerId === joyId) {
        const { s } = scaleOf(); let dx = (e.clientX - jx0) / s, dy = (e.clientY - jy0) / s; const m = Math.hypot(dx, dy), R0 = 50;
        if (m > R0) { dx *= R0 / m; dy *= R0 / m; }
        joyV.x = dx / R0; joyV.y = dy / R0; knob.style.transform = `translate(${dx}px,${dy}px)`;
      } else if (e.pointerId === camId && playing()) { lookMove(e.clientX - lx, e.clientY - ly, 0.0052); lx = e.clientX; ly = e.clientY; }
    });
    const endPtr = e => { if (e.pointerId === joyId) { joyId = null; joyV.x = joyV.y = 0; joy.classList.remove('on'); joy.classList.add('idle'); joy.style.left = joy.style.top = ''; knob.style.transform = ''; } if (e.pointerId === camId) camId = null; };
    api.on(wrap, 'pointerup', endPtr); api.on(wrap, 'pointercancel', endPtr);
    api.on(document, 'mousedown', e => {
      if (!locked || !playing()) return;
      if (e.button === 0) { mouse0 = true; onFireDown(); }
      else if (e.button === 2) { mouse2 = true; onAltDown(); }
    });
    api.on(window, 'mouseup', e => { if (e.button === 0) { if (mouse0) onFireUp(); mouse0 = false; } else if (e.button === 2) mouse2 = false; });
    api.on(document, 'pointerlockchange', () => { const was = locked; locked = document.pointerLockElement === canvas; if (was && !locked) { mouse0 = mouse2 = false; if (phase === 'play' && !paused) setPause(true); } });
    api.on(document, 'mousemove', e => { if (locked && playing()) lookMove(e.movementX || 0, e.movementY || 0, 0.0022); });
    api.on(wrap, 'wheel', e => { if (!playing()) return; e.preventDefault(); if (me.build >= 0 || edit) return; const n = me.wep.length; let s = me.slot; s = (s + (e.deltaY > 0 ? 1 : -1) + n) % n; pickSlot(s); }, { passive: false });
    api.on(window, 'blur', () => { keys.clear(); mouse0 = mouse2 = false; tFireOn = false; });
    const tHold = (b, on, off) => { api.on(b, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); audio.wake(); b.classList.add('on'); on(); try { b.setPointerCapture(e.pointerId); } catch (x) {} }); for (const t of ['pointerup', 'pointercancel']) api.on(b, t, () => { b.classList.remove('on'); if (off) off(); }); };
    tHold(tFire, () => { if (!playing()) return; tFireOn = true; onFireDown(); }, () => { if (tFireOn) onFireUp(); tFireOn = false; });
    tHold(tJump, () => keys.add('Space'), () => keys.delete('Space'));
    tHold(tCrouch, () => { tCrouchOn = !tCrouchOn; tCrouch.classList.toggle('on', tCrouchOn); });
    tHold(tBuild, () => { if (!playing()) return; if (me.build >= 0) pickSlot(me.slot); else pickBuild(lastBuild); });
    tHold(tEdit, () => { if (playing()) toggleEdit(); });
    tHold(tRel, () => { if (!playing()) return; if (me.build >= 0) rotR = (rotR + 1) & 3; else doReload(); });
    tHold(tScope, () => { tAds = !tAds; });
    tPieces.forEach((b, i) => tHold(b, () => { if (playing()) pickBuild(i); }));

    function pickSlot(s) {
      if (!me || s < 0 || s >= me.wep.length) return;
      endEdit(false);
      if (online && online.role === 'guest') { me.slot = s; me.build = -1; me.reloadT = 0; me.eqT = W[me.wep[s].w].eq; audio.play('swap'); return; }
      S.setSlot(me, s); tAds = false;
    }
    function pickBuild(b) {
      if (!me || !me.alive) return;
      endEdit(false);
      lastBuild = b; S.setBuild(me, b); tAds = false;
    }
    function doReload() { if (!me) return; if (online && online.role === 'guest') { guestReload(); return; } S.reload(me); }
    function onFireDown() {
      if (edit) { editPress(); return; }
    }
    function onFireUp() {
      if (edit && edit.paint >= 0) { edit.paint = -1; if (prefs.er) endEdit(true); }
    }
    function onAltDown() {
      if (edit) { resetEdit(); return; }
      if (me && me.build >= 0) { S.cycleMat(me); audio.play('swap'); }
    }
    api.on(window, 'keydown', e => {
      const c = e.code;
      if (e.metaKey || e.altKey || e.ctrlKey && c !== 'ControlLeft') return;
      if (phase === 'home') { if (c === 'Enter' && !e.target.closest('input')) { const f = document.activeElement; if (!f || !scr.contains(f)) { e.preventDefault(); startLocal(); } } return; }
      if (phase === 'end') { if (c === 'Enter' && !scr.contains(document.activeElement)) { e.preventDefault(); const b = scr.querySelector('[data-a="again"]'); if (b) b.click(); } return; }
      if (phase !== 'play') return;
      if (paused) { if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); if (scr.querySelector('[data-a="resume"]')) setPause(false); else setScr(pauseHtml(), 'dim'); } return; }
      if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); setPause(true); return; }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'ShiftLeft', 'ShiftRight'].includes(c)) e.preventDefault();
      keys.add(c);
      if (e.repeat) return;
      const dg = /^Digit([1-5])$/.exec(c);
      if (dg) { const n = +dg[1]; if (n < me.wep.length) pickSlot(n); return; }
      if (c === 'KeyF') { pickSlot(0); return; }
      const bi = BK.indexOf(c);
      if (bi >= 0) { pickBuild(bi); return; }
      if (c === 'F1' || c === 'F2' || c === 'F3' || c === 'F4') { e.preventDefault(); pickBuild(+c[1] - 1); return; }
      if (c === 'KeyQ') { if (me.build >= 0) pickSlot(me.slot); else pickBuild(lastBuild); return; }
      if (c === 'KeyG') { toggleEdit(); return; }
      if (c === 'KeyR') { if (me.build >= 0) { rotR = (rotR + 1) & 3; audio.play('tap'); } else doReload(); return; }
      if (c === 'KeyE') { if (me.build >= 0) { S.cycleMat(me); audio.play('swap'); } return; }
    });
    api.on(window, 'keyup', e => keys.delete(e.code));

    const AIM = { x: 0, y: 0, z: 0 }, CP = new THREE.Vector3(), CF = new THREE.Vector3();
    function editHover() {
      if (!edit) return -1;
      const pc = edit.pc;
      cam.getWorldDirection(CF);
      const ox = cam.position.x, oy = cam.position.y, oz = cam.position.z, dx = CF.x, dy = CF.y, dz = CF.z;
      const bx = pc.x * TS, bz = pc.z * TS, by = pc.l * LH;
      let u = -1, v = -1;
      if (pc.type === 0) {
        if (pc.slot === 0) { if (Math.abs(dz) < 1e-6) return -1; const t = (bz - oz) / dz; if (t < 0) return -1; u = (ox + dx * t - bx) / TS; v = (oy + dy * t - by) / LH; }
        else { if (Math.abs(dx) < 1e-6) return -1; const t = (bx - ox) / dx; if (t < 0) return -1; u = (oz + dz * t - bz) / TS; v = (oy + dy * t - by) / LH; }
        if (u < 0 || u > 1 || v < 0 || v > 1) return -1;
        return Math.min(2, (v * 3) | 0) * 3 + Math.min(2, (u * 3) | 0);
      }
      const py = pc.type === 2 ? by + LH / 2 : pc.type === 3 ? by + CH * 0.5 : by;
      if (Math.abs(dy) < 1e-6) return -1;
      let t = (py - oy) / dy;
      if (pc.type === 2) {
        for (let k = 0; k < 4; k++) { const X = ox + dx * t, Z = oz + dz * t, s = S.surf(pc, clamp(X, bx + 0.01, bx + TS - 0.01), clamp(Z, bz + 0.01, bz + TS - 0.01)); t = (s - oy) / dy; }
      }
      if (t < 0) return -1;
      u = (ox + dx * t - bx) / TS; v = (oz + dz * t - bz) / TS;
      if (u < 0 || u > 1 || v < 0 || v > 1) return -1;
      if (pc.type === 2) return Math.min(2, (v * 3) | 0) * 3 + Math.min(2, (u * 3) | 0);
      return (u >= 0.5 ? 1 : 0) + (v >= 0.5 ? 2 : 0);
    }
    function toggleEdit() {
      if (!me || !me.alive || S.phase === 'round' || S.phase === 'over') return;
      if (edit) { endEdit(true); return; }
      cam.getWorldDirection(CF);
      S.rayWorld(cam.position.x, cam.position.y, cam.position.z, CF.x, CF.y, CF.z, 60, true);
      const pc = S.R.kind === 2 ? S.R.pc : null;
      if (!pc || pc.mat === 3 || (pc.team >= 0 && pc.team !== me.team)) { audio.play('deny'); flashTip(pc && pc.mat !== 3 ? T('You can only edit your own builds') : T('Look at a build piece to edit it')); return; }
      const cx = (pc.x + 0.5) * TS, cz = (pc.z + 0.5) * TS;
      if (Math.hypot(cx - me.x, cz - me.z) > TS * 1.8 || Math.abs(pc.l * LH - me.y) > LH * 2.1) { audio.play('deny'); flashTip(T('Too far to edit')); return; }
      edit = { pc, sel: pc.type === 2 ? 0 : pc.edit, paint: -1, path: [], hov: -1, back: me.build };
      me.editing = true; me.build = -1;
      audio.play('edit');
    }
    function editPress() {
      if (!edit) return;
      const h = editHover(); if (h < 0) return;
      edit.paint = (edit.sel >> h) & 1 ? 0 : 1;
      edit.path = [h];
      applyPaint(h);
    }
    function applyPaint(h) {
      if (!edit || h < 0) return;
      const b = 1 << h, was = edit.sel;
      if (edit.paint === 1) edit.sel |= b; else edit.sel &= ~b;
      if (edit.sel !== was) audio.play('edit');
      if (edit.path[edit.path.length - 1] !== h) edit.path.push(h);
    }
    function endEdit(confirm) {
      if (!edit) return;
      const E = edit; edit = null;
      if (me) { me.editing = false; if (E.back >= 0) me.build = E.back; }
      view.editGrid(null);
      if (!confirm || !S) return;
      const pc = E.pc;
      if (S.pieces.get(pc.key) !== pc) return;
      let dir = null, mask = E.sel;
      if (pc.type === 2) {
        if (E.path.length < 2) return;
        const a = E.path[0], b = E.path[E.path.length - 1], ax = a % 3, az = (a / 3) | 0, bxx = b % 3, bz = (b / 3) | 0, ddx = bxx - ax, ddz = bz - az;
        if (!ddx && !ddz) return;
        dir = Math.abs(ddx) >= Math.abs(ddz) ? (ddx > 0 ? 0 : 2) : (ddz > 0 ? 1 : 3);
        mask = 0;
      } else if (mask === pc.edit) return;
      if (online && online.role === 'guest') { guestEdit(pc, mask, dir); return; }
      if (S.applyEdit(me, pc, mask, dir)) audio.play('editOk'); else audio.play('deny');
    }
    function resetEdit() {
      if (!edit) return;
      const pc = edit.pc;
      edit.sel = 0; edit.path = [];
      if (pc.type !== 2 && pc.edit) { const E = edit; edit = null; me.editing = false; if (E.back >= 0) me.build = E.back; view.editGrid(null); if (online && online.role === 'guest') guestEdit(pc, 0, null); else if (S.applyEdit(me, pc, 0, null)) audio.play('editOk'); }
      else endEdit(false);
    }
    let tipT = 0;
    function flashTip(t, s = 1.8) { tip.textContent = t; tip.classList.add('on'); tipT = s; }
    const cam = view.cam;

    const myName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); const n = p && (p.username || p.displayName); if (n) return String(n).slice(0, 16); } catch (e) {} return T('You'); };
    function botNames(n, used) { const out = []; const pool = BOT_NAMES.filter(x => !used.includes(x)); for (let i = 0; i < n; i++) out.push(pool.splice((Math.random() * pool.length) | 0, 1)[0] || 'Bot ' + (i + 1)); return out; }
    function startLocal() {
      if (online) { try { api.net.close(); } catch (e) {} online = null; }
      const md = MODES[prefs.mode].k;
      const pls = [{ name: myName(), hero: prefs.hero, team: 0, human: true, local: true }];
      const nb = md === 'ffa' ? 3 : md === 'practice' ? 2 : 1, names = botNames(nb, []);
      for (let i = 0; i < nb; i++) pls.push({ name: md === 'practice' ? T('Target') + ' ' + (i + 1) : names[i], hero: (prefs.hero + 1 + i * 2) % HEROES.length, team: md === 'practice' ? 1 : i + 1, bot: md === 'practice' ? 0 : prefs.lvl });
      startMatch({ mode: md, goal: prefs.goal, rarity: prefs.rarity, players: pls }, 0, {});
    }
    function clearMatch() {
      for (const c of chars) { c.root.parent && c.root.parent.remove(c.root); }
      chars = []; S = null; me = null; edit = null; spec = null; view.ghost(null, false); view.editGrid(null); view.markDirty();
      feed.textContent = ''; big.className = 'big'; flashEl.style.opacity = 0; scopeEl.classList.remove('on');
      for (const d of dns) { d.t = 0; d.d.style.opacity = 0; }
      hudCache.clear();
    }
    function startMatch(cfg, meIdx, o) {
      clearMatch();
      if (homeChar) homeChar.root.visible = false;
      matchCfg = cfg;
      S = makeSim({ mode: cfg.mode, players: cfg.players, target: cfg.goal, rarity: cfg.rarity, ffaTarget: cfg.ffaTarget || 7 });
      S.client = !!o.client;
      S.pl.forEach(p => { if (p.bot >= 0) { botInit(p); if (cfg.mode === 'practice') p.ai.dummy = true; } });
      me = S.pl[meIdx]; me.turbo = prefs.turbo; me.local = true;
      if (o.client) S.pl.forEach(p => { if (p !== me) p.remote = true; });
      if (o.remotes) for (const i of o.remotes) S.pl[i].remote = true;
      if (!o.client) S.newRound();
      chars = S.pl.map(p => view.makeChar(p.hero));
      view.surfFn = (pc, X, Z) => S.surf(pc, X, Z);
      view.markDirty();
      phase = 'play'; paused = false; acc = 0; endT = 0; lastCount = -1; rotR = 0; spec = null;
      hud.hidden = false; tc.hidden = !touchOn; setScr('', ''); scr.hidden = true;
      look.yaw = me.yaw; look.pitch = 0;
      stats.shots = stats.hits = stats.builds = stats.dmg = 0;
      lock();
      if (cfg.mode === 'practice') flashTip(T('Practice: build freely, the targets do not shoot back'), 4);
      else if (prefs.wins + prefs.losses < 2 && !touchOn) flashTip(T('{a} wall · {b} floor · {c} ramp · {d} cone · {e} edit · {f} weapons', { a: keyLabel('KeyZ'), b: keyLabel('KeyX'), c: keyLabel('KeyC'), d: keyLabel('KeyV'), e: keyLabel('KeyG'), f: keyLabel('KeyQ') }), 5);
    }
    function leaveMatch() {
      if (online) { netLeave(); }
      clearMatch(); showHome();
    }
    function finishMatch() {
      if (phase !== 'play' || !S) return;
      phase = 'end'; endEdit(false); unlock();
      const win = S.winner >= 0 && S.winner === me.team;
      if (S.mode !== 'practice') {
        if (win) { prefs.wins++; prefs.streak++; prefs.best = Math.max(prefs.best, prefs.streak); if (!online && prefs.lvl === 3) prefs.hw++; } else { prefs.losses++; prefs.streak = 0; }
        prefs.elims += me.kills; persist();
        if (win) api.submit(prefs.wins);
      }
      audio.play(win ? 'win' : 'lose');
      const opp = S.pl.filter(p => p !== me);
      const acc2 = stats.shots ? Math.round(stats.hits / stats.shots * 100) : 0;
      const host = !online || online.role === 'host';
      setScr(`<div class="pan" style="text-align:center"><h2 style="color:${win ? '#ffd84a' : '#ff7a8a'}">${win ? 'Victory' : S.winner < 0 ? 'Draw' : 'Defeat'}</h2>
        <p>${S.mode === 'ffa' ? esc(T('{n} eliminations', { n: me.kills })) : esc(T('Rounds {a} to {b}', { a: S.pts[me.team], b: Math.max(...opp.map(p => S.pts[p.team])) }))}</p>
        <div class="res"><div><b>${me.kills}</b>${T('Eliminations')}</div><div><b>${Math.round(me.dmgDone)}</b>${T('Damage')}</div><div><b>${acc2}%</b>${T('Accuracy')}</div><div><b>${stats.builds}</b>${T('Builds')}</div></div>
        ${S.mode === 'ffa' ? `<div class="res">${S.pl.slice().sort((a, b) => b.kills - a.kills).map(p => `<div><b>${p.kills}</b>${esc(p.name)}</div>`).join('')}</div>` : ''}
        <div class="btns" style="justify-content:center">${host ? '<button class="btn" data-a="again">Rematch</button>' : `<div class="wait"><i></i>${T('Waiting for the host…')}</div>`}${online && online.role === 'host' ? '<button class="btn alt" data-a="lobby">Back to lobby</button>' : ''}<button class="btn ghost" data-a="menu">${online ? 'Leave' : 'Menu'}</button></div></div>`, 'dim');
    }

    let adsK = 0, fovNow = 80, frameN = 0, stepSnd = 0, camDist = 3;
    const EYEV = new THREE.Vector3(), HW = new THREE.Vector3();
    function controlLocal() {
      const p = me; if (!p) return;
      const inp = p.inp, on = playing() && p.alive;
      let mx = 0, mz = 0;
      if (on) {
        if (keys.has('KeyW') || keys.has('ArrowUp')) mz += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) mz -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
        mx += joyV.x; mz -= joyV.y;
      }
      inp.mx = mx; inp.mz = mz;
      inp.jump = on && keys.has('Space');
      inp.crouch = on && (keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('ControlLeft') || tCrouchOn);
      inp.fire = on && !edit && (mouse0 || tFireOn);
      inp.ads = on && !edit && p.build < 0 && (mouse2 || tAds);
      p.yaw = look.yaw; p.pitch = look.pitch; p.rot = rotR; p.turbo = prefs.turbo;
    }
    function stepOnce() {
      if (me.bot < 0) controlLocal(); else if (!S.client && !online) { look.yaw = me.yaw; look.pitch = me.pitch; }
      if (!S.client) for (const p of S.pl) if (p.bot >= 0) botThink(S, p);
      if (me.bot >= 0) { look.yaw = me.yaw; look.pitch = me.pitch; }
      S.step();
      if (online) netStep();
      if (S.evc > 600 && document.hidden) { S.evc = 0; netEvIdx = 0; }
    }

    const hudCache = new Map();
    const setTxt = (el, k, v) => { if (hudCache.get(k) !== v) { hudCache.set(k, v); el.textContent = v; } };
    const setSty = (el, k, prop, v) => { if (hudCache.get(k) !== v) { hudCache.set(k, v); el.style[prop] = v; } };
    const fmtT = s => { s = Math.max(0, Math.ceil(s)); return ((s / 60) | 0) + ':' + String(s % 60).padStart(2, '0'); };
    function updHud(dt) {
      const p = me; if (!p) return;
      setSty(barHp.firstChild, 'hp', 'transform', `scaleX(${clamp(p.hp / 100, 0, 1)})`); setTxt(barHp.lastChild, 'hpt', String(Math.ceil(p.hp)));
      setSty(barSh.firstChild, 'sh', 'transform', `scaleX(${clamp(p.sh / 100, 0, 1)})`); setTxt(barSh.lastChild, 'sht', String(Math.ceil(p.sh)));
      const lo = p.hp > 0 && p.hp <= 30; if (hudCache.get('lo') !== lo) { hudCache.set('lo', lo); barHp.classList.toggle('lo', lo); }
      for (let i = 0; i < 3; i++) { setTxt(matEls[i].lastChild, 'm' + i, S.infinite ? '∞' : String(p.mats[i])); const on = i === p.mat; if (hudCache.get('mo' + i) !== on) { hudCache.set('mo' + i, on); matEls[i].classList.toggle('on', on); } }
      for (let i = 0; i < 5; i++) {
        const s = slotEls[i], w = p.wep[i];
        const k = w ? w.w * 10 + w.r : -1;
        if (hudCache.get('sk' + i) !== k) { hudCache.set('sk' + i, k); s.hidden = !w; if (w) { s.children[1].innerHTML = ICON[W[w.w].k]; s.lastChild.style.background = w.w ? RAR[w.r].c : 'transparent'; s.style.borderBottomColor = ''; } }
        if (!w) continue;
        setTxt(s.children[2], 'sa' + i, W[w.w].mag ? String(w.ammo) : '');
        const on = p.build < 0 && !edit && p.slot === i; if (hudCache.get('so' + i) !== on) { hudCache.set('so' + i, on); s.classList.toggle('on', on); }
      }
      for (let i = 0; i < 4; i++) { const on = p.build === i; if (hudCache.get('bo' + i) !== on) { hudCache.set('bo' + i, on); bslotEls[i].classList.toggle('on', on); tPieces[i].classList.toggle('on', on); } }
      const bm = p.build >= 0; if (hudCache.get('bm') !== bm) { hudCache.set('bm', bm); tPieces.forEach(b => b.hidden = !bm); tBuild.classList.toggle('on', bm); }
      const wp = p.wep[p.slot], D = wp ? W[wp.w] : null;
      setTxt(ammoEl, 'am', !bm && !edit && D && D.mag ? wp.ammo + ' / ' + D.mag : '');
      const rel = p.reloadT > 0 && D && D.mag;
      if (hudCache.get('rl') !== !!rel) { hudCache.set('rl', !!rel); relEl.hidden = !rel; }
      if (rel) relEl.firstChild.style.transform = `scaleX(${clamp(1 - p.reloadT / (D.rel * (1 - 0.05 * wp.r)), 0, 1)})`;
      const ed = !!edit; if (hudCache.get('ed') !== ed) { hudCache.set('ed', ed); editEl.hidden = !ed; tEdit.classList.toggle('on', ed); }
      if (S.mode === 'ffa') {
        const lead = S.pl.reduce((a, b) => (b !== p && (!a || b.kills > a.kills) ? b : a), null);
        setTxt(scMe.firstChild, 'n0', T('You')); setTxt(scMe.lastChild, 's0', String(p.kills));
        setTxt(scOp.firstChild, 'n1', lead ? lead.name : ''); setTxt(scOp.lastChild, 's1', lead ? String(lead.kills) : '0');
        setTxt(clk.firstChild, 'cl', T('FIRST TO {n}', { n: S.ffaTarget }));
      } else if (S.mode === 'practice') {
        setTxt(scMe.firstChild, 'n0', T('You')); setTxt(scMe.lastChild, 's0', String(p.kills));
        setTxt(scOp.firstChild, 'n1', T('Builds')); setTxt(scOp.lastChild, 's1', String(stats.builds));
        setTxt(clk.firstChild, 'cl', T('PRACTICE'));
      } else {
        const op = S.pl.find(q => q.team !== p.team);
        setTxt(scMe.firstChild, 'n0', T('You')); setTxt(scMe.lastChild, 's0', String(S.pts[p.team]));
        setTxt(scOp.firstChild, 'n1', op ? op.name : ''); setTxt(scOp.lastChild, 's1', op ? String(S.pts[op.team]) : '0');
        setTxt(clk.firstChild, 'cl', T('ROUND {n}', { n: S.round }));
      }
      setTxt(clk.lastChild, 'ct', S.mode === 'practice' ? '∞' : S.phase === 'count' ? fmtT(S.rt) : fmtT(S.rt));
      if (tipT > 0) { tipT -= dt; if (tipT <= 0) tip.classList.remove('on'); }
      if (online) { const bad = online.lost; setTxt(netEl, 'net', bad ? T('Connection lost. Reconnecting…') : (online.role === 'host' ? T('Host') : T('Ping {n} ms', { n: Math.round(api.net.rtt || 0) }))); if (hudCache.get('nb') !== !!bad) { hudCache.set('nb', !!bad); netEl.classList.toggle('bad', !!bad); } netEl.hidden = false; } else netEl.hidden = true;
      const sc = p.ads && D && D.k === 'sn' && adsK > 0.85 && p.alive;
      if (hudCache.get('sc') !== sc) { hudCache.set('sc', sc); scopeEl.classList.toggle('on', sc); xh.style.visibility = sc ? 'hidden' : ''; }
      const vh = wrap.clientHeight || 600, f = vh / 2 / Math.tan(fovNow * Math.PI / 360);
      if (bm || edit || !D) { xl.forEach(x => x.style.display = 'none'); xring.style.display = 'none'; xdot.style.display = ''; }
      else if (D.k === 'sg') { xl.forEach(x => x.style.display = 'none'); xdot.style.display = ''; xring.style.display = ''; const r = Math.max(14, Math.tan(S.spreadOf(p, wp.w)) * f * 2); xring.style.setProperty('--rr', r.toFixed(1) + 'px'); }
      else if (D.k === 'pick') { xl.forEach(x => x.style.display = 'none'); xring.style.display = 'none'; xdot.style.display = ''; }
      else {
        xring.style.display = 'none'; xdot.style.display = D.k === 'sn' ? '' : 'none';
        const g = Math.max(3, Math.tan(S.spreadOf(p, wp.w)) * f);
        xl[0].style.display = xl[1].style.display = xl[2].style.display = xl[3].style.display = '';
        xl[0].style.transform = `translateY(${(-g - 9).toFixed(1)}px)`; xl[1].style.transform = `translateY(${g.toFixed(1)}px)`; xl[2].style.transform = `translateX(${(-g - 9).toFixed(1)}px)`; xl[3].style.transform = `translateX(${g.toFixed(1)}px)`;
      }
      for (const d of dns) {
        if (d.t <= 0) continue;
        d.t -= dt;
        if (d.t <= 0) { d.d.style.opacity = 0; continue; }
        CP.set(d.x, d.y + (0.9 - d.t) * 0.9, d.z).project(cam);
        if (CP.z > 1) { d.d.style.opacity = 0; continue; }
        const w = wrap.clientWidth, h = wrap.clientHeight;
        d.d.style.transform = `translate(${((CP.x + 1) / 2 * w).toFixed(0)}px,${((1 - CP.y) / 2 * h).toFixed(0)}px) translate(-50%,-50%) scale(${(0.8 + d.t * 0.4).toFixed(2)})`;
        d.d.style.opacity = Math.min(1, d.t * 3).toFixed(2);
      }
    }
    function dmgNum(x, y, z, v, cls) { const d = dns[dni]; dni = (dni + 1) % dns.length; d.x = x + (Math.random() - 0.5) * 0.5; d.y = y; d.z = z + (Math.random() - 0.5) * 0.5; d.t = 0.9; d.d.className = 'dn ' + cls; d.d.textContent = v; }
    function banner(txt, cls, sub) { big.className = 'big'; void big.offsetWidth; big.innerHTML = esc(txt) + (sub ? `<small>${esc(sub)}</small>` : ''); big.className = 'big show ' + (cls || ''); }
    function killFeed(html, mine) { const d = el('div', mine ? 'me' : '', feed, html); while (feed.children.length > 5) feed.firstChild.remove(); api.timeout(() => d.remove(), 4600); }
    const sndAt = (n, x, y, z, base = 1) => {
      const dx = x - cam.position.x, dy = y - cam.position.y, dz = z - cam.position.z, d = Math.hypot(dx, dy, dz);
      const v = base * Math.pow(clamp(1 - d / 140, 0, 1), 1.4);
      const pan = d > 0.5 ? (dx * Math.cos(look.yaw) - dz * Math.sin(look.yaw)) / d : 0;
      audio.play(n, v, pan * 0.8);
    };
    let lastPieceSnd = 0;
    function processEvents() {
      if (online) { if (online.role === 'host') hostCollect(); else guestCollect(); }
      const n = S.evc;
      for (let i = 0; i < n; i++) {
        const e = S.evq[i];
        switch (e.k) {
          case 'build': {
            view.markDirty(); const pc = e.p;
            if (pc.owner === me.i) stats.builds++;
            if (pc.mat !== 3 && S.t - lastPieceSnd > 0.03) { lastPieceSnd = S.t; sndAt('build' + pc.mat, (pc.x + 0.5) * TS, pc.l * LH + 1, (pc.z + 0.5) * TS, 0.9); }
            break;
          }
          case 'break': {
            view.markDirty(); const pc = e.p;
            const cx = (pc.x + (pc.type === 0 && pc.slot === 1 ? 0 : 0.5)) * TS, cz = (pc.z + (pc.type === 0 && pc.slot === 0 ? 0 : 0.5)) * TS, cy = pc.l * LH + (pc.type === 0 || pc.type === 2 ? LH / 2 : 0.3);
            view.debris(cx, cy, cz, MATS[pc.mat].c, e.n === 2 ? 4 : 8, pc.type === 0 && pc.slot === 1 ? 0.3 : TS * 0.8, pc.type === 0 || pc.type === 2 ? LH * 0.8 : 0.3, pc.type === 0 && pc.slot === 0 ? 0.3 : TS * 0.8);
            sndAt('brk' + Math.min(2, pc.mat), cx, cy, cz, 1);
            break;
          }
          case 'phit': view.markTint && view.markTint(e.p); if (S.t - lastPieceSnd > 0.05) { lastPieceSnd = S.t; const pc = e.p; sndAt('hit' + Math.min(2, pc.mat), (pc.x + 0.5) * TS, pc.l * LH + 1.5, (pc.z + 0.5) * TS, 0.5); } break;
          case 'edit': view.markDirty(); if (e.a === me.i) audio.play('editOk'); break;
          case 'reset': view.markDirty(); break;
          case 'shot': {
            const p = S.pl[e.a], ch = chars[e.a]; if (!p || !ch) break;
            const D = W[e.b];
            ch.hand.getWorldPosition(HW);
            if (D.k !== 'pick') {
              HW.x += -Math.sin(p.yaw) * 0.55; HW.z += -Math.cos(p.yaw) * 0.55; HW.y += 0.04;
              if (e.v < 3) view.tracer(HW.x, HW.y, HW.z, e.x, e.y, e.z, e.b);
              if (e.v === 0) { view.flash(HW.x, HW.y, HW.z, D.k === 'sg' || D.k === 'sn' ? 0.9 : 0.55); ch.rec = 1; sndAt(D.k, p.x, p.y + 1.4, p.z, p === me ? 0.85 : 1); }
            } else if (e.v === 0) { ch.swing = 1; sndAt('pick', p.x, p.y + 1, p.z, 0.8); }
            if (e.n === 2) view.spark(e.x, e.y, e.z, e.p ? MATS[e.p.mat].c : '#cccccc', 3, 3);
            else if (e.n === 1) view.spark(e.x, e.y + 0.05, e.z, '#8fbf6a', 3, 2.5);
            else if (e.n === 3) view.spark(e.x, e.y, e.z, '#9fe8ff', 4, 3);
            if (p === me && e.v === 0) stats.shots++;
            break;
          }
          case 'hurt': {
            const a = S.pl[e.a], b = S.pl[e.b];
            if (a === me && b !== me) {
              const head = e.n & 1;
              hm.className = 'hm'; void hm.offsetWidth; hm.className = 'hm on' + (head ? ' hd' : '') + (!b.alive ? ' kl' : '');
              dmgNum(b.x, b.y + 2.1, b.z, e.v, head ? 'h' : e.n & 4 ? 's' : '');
              audio.play(head ? 'head' : 'hitMark'); if (e.n & 2) audio.play('shBreak');
              stats.hits++; stats.dmg += e.v;
            }
            if (b === me) { audio.play(e.n & 4 ? 'hurtSh' : 'hurt'); flashEl.className = 'flash' + (e.n & 4 ? ' s' : ''); flashEl.style.transition = 'none'; flashEl.style.opacity = Math.min(1, 0.35 + e.v / 60); void flashEl.offsetWidth; flashEl.style.transition = ''; flashEl.style.opacity = 0; }
            break;
          }
          case 'kill': {
            const a = e.a >= 0 ? S.pl[e.a] : null, b = S.pl[e.b], ch = chars[e.b];
            const H = HEROES[b.hero % HEROES.length];
            if (ch) { view.debris(b.x, b.y + 1, b.z, H.suit, 10, 0.6, 1.6, 0.6); view.debris(b.x, b.y + 1.6, b.z, H.skin, 3, 0.4, 0.4, 0.4); }
            const nm = q => `<b>${esc(q.name)}</b>`;
            const why = e.n === 3 ? T('{a} fell', { a: nm(b) }) : e.n === 2 ? T('{a} fell off the island', { a: nm(b) }) : a ? T('{a} eliminated {b}', { a: nm(a), b: nm(b) }) : T('{a} was eliminated', { a: nm(b) });
            killFeed(why, a === me || b === me);
            if (a === me && b !== me) { audio.play('elim'); if (S.mode !== 'practice') banner(T('Eliminated'), 'y', b.name); }
            if (b === me) { audio.play('dead'); spec = a && a !== me ? a.i : null; banner(T('Eliminated'), 'r', a && a !== me ? T('by {n}', { n: a.name }) : ''); }
            break;
          }
          case 'round': banner(T('Round {n}', { n: e.v }), 'b', S.rarity === 'legend' ? T('All legendary') : T('New loadout')); spec = null; lastCount = -1; break;
          case 'go': banner(T('Fight!'), 'y'); audio.play('go'); break;
          case 'roundEnd': if (S.phase !== 'over') { const w = e.a === me.team; banner(w ? T('Round won') : e.a < 0 ? T('Draw') : T('Round lost'), w ? 'y' : 'r'); } break;
          case 'over': endT = 1.8; break;
          case 'spawn': if (e.a === me.i) { look.yaw = me.yaw; look.pitch = 0; spec = null; if (online && online.role === 'guest') { } } break;
          case 'jump': if (e.a === me.i) audio.play('jump'); break;
          case 'land': if (e.a === me.i) audio.play('land'); break;
          case 'reload': if (e.a === me.i) audio.play('rel'); break;
          case 'reloaded': if (e.a === me.i) audio.play('relEnd'); break;
          case 'shell': if (e.a === me.i) audio.play('shell'); break;
          case 'swap': case 'bsel': if (e.a === me.i) audio.play('swap'); break;
        }
      }
      S.evc = 0; netEvIdx = 0;
    }
    const TMPV = new THREE.Vector3();
    function updChars(alpha, dt) {
      for (let i = 0; i < S.pl.length; i++) {
        const p = S.pl[i], ch = chars[i]; if (!ch) continue;
        const vis = p.alive && !(p === me && (scopeEl.classList.contains('on') || camDist < 1.05));
        ch.root.visible = vis;
        if (!p.alive) continue;
        let x, y, z, yaw;
        if (p.remote && p.net) { x = p.net.x; y = p.net.y; z = p.net.z; yaw = p.net.yaw; }
        else { x = lerp(p.px, p.x, alpha); y = lerp(p.py, p.y, alpha); z = lerp(p.pz, p.z, alpha); yaw = p.yaw; }
        ch.root.position.set(x, y, z); ch.root.rotation.y = yaw;
        const wp = p.wep[p.slot];
        const hold = p.editing || p.build >= 0 ? 'build' : wp ? W[wp.w].k : 'ar';
        view.setGun(ch, hold === 'build' ? '' : hold, wp ? wp.r : 0);
        view.animChar(ch, p, dt, frameN, hold);
        if (p !== me && p.team !== me.team) { view.setTag(ch, p.name, '#ffffff'); ch.tag.s.visible = Math.hypot(x - me.x, z - me.z) < 70; }
        else if (p !== me) { view.setTag(ch, p.name, '#8fe0ff'); ch.tag.s.visible = true; }
      }
    }
    function updCam(alpha, dt) {
      const p = me;
      const wp = p.wep[p.slot], D = wp ? W[wp.w] : null;
      adsK = damp(adsK, p.ads && p.alive ? 1 : 0, 16, dt);
      const scoped = p.ads && D && D.k === 'sn' && adsK > 0.85 && p.alive;
      let tgt = p;
      if (!p.alive && spec != null && S.pl[spec] && S.pl[spec].alive) tgt = S.pl[spec];
      const remote = tgt.remote && tgt.net;
      const px = remote ? tgt.net.x : lerp(tgt.px, tgt.x, alpha), py = remote ? tgt.net.y : lerp(tgt.py, tgt.y, alpha), pz = remote ? tgt.net.z : lerp(tgt.pz, tgt.z, alpha);
      const cy = py + (tgt.crouch ? 1.12 : 1.56);
      let yaw = look.yaw, pitch = look.pitch;
      if (tgt !== p) { yaw = frameN * 0.004; pitch = -0.32; }
      const sy = Math.sin(yaw), cyw = Math.cos(yaw), sp = Math.sin(pitch), cp = Math.cos(pitch);
      const fx = -sy * cp, fy = sp, fz = -cyw * cp, rx = cyw, rz = -sy, ux = -sy * -sp, uy = cp, uz = -cyw * -sp;
      let right = lerp(0.92, 0.6, adsK), up = lerp(0.32, 0.14, adsK), back = lerp(3.3, 1.6, adsK);
      if (tgt !== p) { right = 0; up = 0.4; back = 6.5; }
      if (scoped) { right = 0; up = 0; back = 0; }
      let ox = rx * right + ux * up - fx * back, oy = uy * up - fy * back, oz = rz * right + uz * up - fz * back;
      const L0 = Math.hypot(ox, oy, oz);
      if (L0 > 0.01) {
        let tm = L0 + 0.4;
        for (let k = 0; k < 5; k++) {
          const ex = k === 1 ? rx * 0.28 : k === 2 ? -rx * 0.28 : k === 3 ? ux * 0.22 : k === 4 ? -ux * 0.22 : 0, ez = k === 1 ? rz * 0.28 : k === 2 ? -rz * 0.28 : k === 3 ? uz * 0.22 : k === 4 ? -uz * 0.22 : 0, eyy = k === 3 ? uy * 0.22 : k === 4 ? -uy * 0.22 : 0;
          const tx = ox + ex, ty = oy + eyy, tz = oz + ez, tl = Math.hypot(tx, ty, tz);
          S.rayWorld(px, cy, pz, tx / tl, ty / tl, tz / tl, tl + 0.4, false);
          if (S.R.t < tm) tm = S.R.t;
        }
        if (tm < L0 + 0.4) { const k = Math.max(0.05, tm - 0.4) / L0; ox *= k; oy *= k; oz *= k; }
      }
      let camY = cy + oy; if (camY < 0.25 && Math.abs(px) < HALF * TS && Math.abs(pz) < HALF * TS) camY = 0.25;
      cam.position.set(px + ox, camY, pz + oz);
      cam.rotation.set(pitch, yaw, 0);
      camDist = Math.hypot(ox, oy, oz);
      const fv = scoped ? prefs.fov / 4.2 : prefs.fov / (1 + (D && D.ads ? (D.zoom - 1) * adsK : 0));
      if (Math.abs(fv - fovNow) > 0.01 || cam.aspect !== V.w / V.h && false) { fovNow = fv; cam.fov = fv; cam.updateProjectionMatrix(); }
      if (p.alive && tgt === p) {
        S.rayAll(p, cam.position.x, cam.position.y, cam.position.z, fx, fy, fz, 500, false);
        const t = S.R.t, ey = S.eyeY(p);
        let hx = S.R.x, hy = S.R.y, hz = S.R.z;
        if (t < camDist + 0.6) { hx = cam.position.x + fx * 60; hy = cam.position.y + fy * 60; hz = cam.position.z + fz * 60; }
        const ax = hx - p.x, ay = hy - ey, az = hz - p.z, l = Math.hypot(ax, ay, az) || 1;
        p.ax = ax / l; p.ay = ay / l; p.az = az / l; p.aimSet = true;
      }
      const sc = view.sun;
      sc.position.set(px + 40, py + 80, pz + 25); sc.target.position.set(px, py, pz); sc.target.updateMatrixWorld();
    }
    function makeHome() {
      S_home = makeSim({ mode: 'practice', players: [{ name: '', hero: prefs.hero, team: 0 }], quiet: true });
      S_home.newRound();
      const H = S_home;
      const add = (t, x, z, l, d, m) => H.addPiece(t, x, z, l, d, m, 0, 0, true);
      add(0, 1, 1, 0, 0, 0); add(0, 2, 1, 0, 0, 0); add(2, 1, 0, 0, 0, 1); add(0, 2, 0, 0, 1, 1); add(1, 2, 0, 1, 0, 2); add(0, 2, 0, 1, 0, 2); add(3, 2, 0, 2, 0, 0);
      add(0, -2, -1, 0, 1, 2); add(0, -2, -1, 0, 0, 2); add(2, -2, -2, 0, 3, 0); add(1, -2, -2, 1, 0, 0);
      const pw = H.pieces.get(PK(0, 2, 1, 0)); if (pw) pw.edit = 16;
      homeChar = view.makeChar(prefs.hero);
      view.surfFn = (pc, X, Z) => H.surf(pc, X, Z);
    }
    const FAKE = { vx: 0, vz: 0, onG: true, crouch: false, pitch: 0 };
    function render(dt) {
      frameN++;
      if (S && me) {
        const alpha = clamp(acc / DT, 0, 1);
        if (online && online.role === 'guest') netInterp();
        updChars(alpha, dt);
        if (edit) {
          if (!S.pieces.has(edit.pc.key) || S.pieces.get(edit.pc.key) !== edit.pc || !me.alive) endEdit(false);
          else { const h = editHover(); edit.hov = h; if ((mouse0 || tFireOn) && edit.paint >= 0 && h >= 0) applyPaint(h); view.editGrid(edit.pc, edit.sel, h); }
        }
        updCam(alpha, dt);
        if (me.build >= 0 && me.alive && !edit && phase === 'play' && S.phase !== 'round') { const tg = S.target(me, me.build, look.yaw, look.pitch, rotR); view.ghost(tg, true); }
        else view.ghost(null, false);
        processEvents();
        if (S.phase === 'count' && phase === 'play') { const c = Math.ceil(S.pt); if (c !== lastCount && c > 0 && c <= 3) { lastCount = c; banner(String(c), 'y'); audio.play('beep'); } }
        if (endT > 0) { endT -= dt; if (endT <= 0) finishMatch(); }
        if (!me.alive && S.mode === 'ffa' && S.phase === 'fight') setTxt(tip, 'resp', T('Respawning in {n}', { n: Math.max(1, Math.ceil(me.respT)) })), tip.classList.add('on'), tipT = 0.2;
        if (me.alive && playing()) {
          const v = Math.hypot(me.vx, me.vz);
          if (me.onG && v > 1.5) { stepSnd -= dt * v / 2.2; if (stepSnd <= 0) { stepSnd = 1; audio.play('step', 0.7); } }
        }
        updHud(dt);
        if (view.dirty) view.rebuild(S);
        view.updTint(S);
      } else if (S_home) {
        homeT += dt;
        const a = homeT * 0.12;
        cam.position.set(Math.sin(a) * 13 + 2, 4.2 + Math.sin(homeT * 0.3) * 0.6, Math.cos(a) * 13 + 2);
        cam.lookAt(2.5, 2.2, 2.5);
        if (fovNow !== 60) { fovNow = 60; cam.fov = 60; cam.updateProjectionMatrix(); }
        if (homeChar) {
          homeChar.root.visible = true; homeChar.root.position.set(2.5, 0, 3.6); homeChar.root.rotation.y = Math.atan2(-(cam.position.x - 2.5), -(cam.position.z - 3.6)) + Math.PI;
          FAKE.pitch = Math.sin(homeT) * 0.1;
          view.setGun(homeChar, 'ar', 4); view.animChar(homeChar, FAKE, dt, frameN, 'ar');
        }
        if (view.dirty) view.rebuild(S_home);
        view.sun.position.set(42, 80, 27); view.sun.target.position.set(2, 0, 2); view.sun.target.updateMatrixWorld();
        view.ghost(null, false);
      }
      view.water.position.y = -6 + Math.sin(frameN * 0.01) * 0.08;
      view.fxStep(Math.min(dt, 0.05));
      renderer.render(view.scene, cam);
    }
    api.loop(dt => {
      if (S && (phase === 'play' || phase === 'end')) {
        if (!paused || online) {
          acc += dt;
          let n = 0;
          while (acc >= DT && n < 5) { stepOnce(); acc -= DT; n++; }
          if (acc > DT * 3) acc = 0;
        }
      }
      render(dt);
    });
    api.on(document, 'visibilitychange', () => { if (document.hidden && phase === 'play' && !online && !paused) setPause(true); if (online) netVis(); });

    let netEvIdx = 0, netBound = false, bgW = null, bgI = 0, bgT = 0;
    const NET_O = { title: 'Build Brawl', sizes: [2, 3, 4], defaultSize: 2, min: 2, max: 4, bots: true };
    const PH = ['count', 'fight', 'round', 'over'];
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
        setScr(`<div class="pan" style="text-align:center"><h2>${why === 'kicked' ? 'Removed' : why === 'lost' ? 'Connection lost' : 'Match ended'}</h2><p>${why === 'kicked' ? T('The host removed you from this party.') : why === 'lost' ? T('Lost connection to the party') : T('The host left, so the party ended.')}</p><div class="btns" style="justify-content:center"><button class="btn" data-a="home">Menu</button></div></div>`, 'dim');
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
      online = { role: r.role, r, lost: false, seq: 0, snapN: 0, claims: [], pend: new Map(), buf: new Map(), lastSp: new Map(), shotQ: [] };
      if (r.role === 'host') hostStart(r);
      else setScr(`<div class="pan" style="text-align:center"><div class="wait"><i></i>${T('Waiting for the host…')}</div><div class="btns" style="justify-content:center"><button class="btn ghost" data-a="menu">Leave</button></div></div>`, 'dim');
    }
    function netLeave() { try { api.net.close(); } catch (e) {} online = null; bgStop(); }
    async function netLobby() {
      if (!online || online.role !== 'host') return;
      clearMatch(); phase = 'wait'; hud.hidden = true; tc.hidden = true;
      let r = null;
      try { r = await api.net.room(NET_O); } catch (e) { r = null; }
      if (!api.alive) return;
      if (!r) { online = null; showHome(); return; }
      online.r = r; hostStart(r);
    }
    function netRematch() { if (online && online.role === 'host') hostStart(online.r); }
    function hostStart(r) {
      const hm = MODES[prefs.mode].k;
      const mode = r.size > 2 || r.players.length > 2 ? 'ffa' : hm === 'box' ? 'box' : 'build';
      const pls = r.players.map((p, i) => ({ name: String(p.name || 'Player').slice(0, 16), hero: p.id === api.net.id ? prefs.hero : (i * 2 + 1) % HEROES.length, team: i, human: true, pid: p.id }));
      if (r.bots) { const names = botNames(r.size - pls.length, pls.map(p => p.name)); for (let i = pls.length; i < r.size; i++) pls.push({ name: names[i - r.players.length], hero: (i * 2 + 3) % HEROES.length, team: i, bot: prefs.lvl }); }
      if (pls.length < 2) pls.push({ name: botNames(1, [])[0], hero: 2, team: 1, bot: prefs.lvl });
      const cfg = { mode, goal: prefs.goal, rarity: prefs.rarity, players: pls, ffaTarget: 7 };
      const meIdx = pls.findIndex(p => p.pid === api.net.id);
      startMatch(cfg, Math.max(0, meIdx), { remotes: pls.map((p, i) => p.human && p.pid !== api.net.id ? i : -1).filter(i => i >= 0) });
      online.idx = new Map(); S.pl.forEach((p, i) => { if (p.pid) online.idx.set(p.pid, i); });
      netEvIdx = 0;
      const full = fullState();
      S.pl.forEach((p, i) => { if (p.remote && p.pid) nsendTo(p.pid, { t: 'start', cfg, me: i, full }); });
    }
    function plRow(p) {
      const f = (p.crouch ? 1 : 0) | (p.ads ? 2 : 0) | (p.onG ? 4 : 0) | (p.alive ? 8 : 0) | (p.reloadT > 0 ? 16 : 0) | (p.editing ? 32 : 0);
      return [r2(p.x), r2(p.y), r2(p.z), r2(p.yaw), r2(p.pitch), f, Math.round(p.hp * 10) / 10, Math.round(p.sh * 10) / 10, p.slot, p.build, p.kills, p.deaths, p.mats[0], p.mats[1], p.mats[2], p.spN || 0, p.hero, r2(p.vx), r2(p.vz), p.wep.map(w => w.w * 10 + w.r).join(','), r2(p.respT)];
    }
    function fullState() {
      const pcs = [];
      for (const pc of S.pieces.values()) pcs.push([pc.id, pc.type, pc.x, pc.z, pc.l, pc.d, pc.mat, pc.team, pc.owner, r2(Math.min(99, S.t - pc.born)), Math.round(pc.dmg), pc.edit]);
      return { ph: PH.indexOf(S.phase), pt: r2(S.pt), rt: r2(S.rt), round: S.round, pts: S.pts.slice(), loadR: S.loadR.slice(), pieces: pcs, pl: S.pl.map(plRow), nid: S.nextId, win: S.winner };
    }
    function hostLeave(p) {
      if (!S) return;
      const i = online.idx.get(p.id); if (i == null) return;
      const q = S.pl[i]; if (!q || !q.remote) return;
      q.remote = false; q.bot = Math.max(1, prefs.lvl); botInit(q); q.botFor = p.id;
      killFeed(T('{a} left, a bot takes over', { a: '<b>' + esc(q.name) + '</b>' }), false);
    }
    function hostRejoin(p) {
      if (!S) return;
      const i = online.idx.get(p.id); if (i == null) return;
      const q = S.pl[i];
      if (q.botFor === p.id) { q.bot = -1; q.ai = null; q.remote = true; q.botFor = null; q.inp.fire = false; q.inp.mx = q.inp.mz = 0; }
      nsendTo(p.id, { t: 'start', cfg: matchCfg, me: i, full: fullState() });
    }
    const EVC = { build: 1, break: 1, edit: 1, phit: 1, shot: 1, hurt: 1, kill: 1, round: 1, go: 1, roundEnd: 1, over: 1, reset: 1, spawn: 1 };
    let outEv = [], dmgSet = new Map();
    function hostCollect() {
      for (let i = netEvIdx; i < S.evc; i++) {
        const e = S.evq[i]; if (!EVC[e.k]) continue;
        const pc = e.p;
        switch (e.k) {
          case 'build': outEv.push(['b', pc.id, pc.type, pc.x, pc.z, pc.l, pc.d, pc.mat, pc.team, pc.owner, r2(Math.min(99, S.t - pc.born))]); break;
          case 'break': outEv.push(['x', pc.id, e.n]); dmgSet.delete(pc.id); break;
          case 'edit': outEv.push(['e', pc.id, pc.edit, pc.d]); break;
          case 'phit': dmgSet.set(pc.id, Math.round(pc.dmg)); break;
          case 'shot': if (e.v < 3) outEv.push(['s', e.a, e.b, r2(e.x), r2(e.y), r2(e.z), e.n, e.v, pc ? pc.mat : 0]); break;
          case 'hurt': outEv.push(['h', e.a, e.b, e.v, e.n, e.u]); break;
          case 'kill': outEv.push(['k', e.a, e.b, e.n]); break;
          case 'round': outEv.push(['r', e.v]); break;
          case 'go': outEv.push(['g']); break;
          case 'roundEnd': outEv.push(['re', e.a]); break;
          case 'over': outEv.push(['o', e.a]); break;
          case 'reset': outEv.push(['z']); dmgSet.clear(); break;
          case 'spawn': { const p = S.pl[e.a]; p.spN = (p.spN || 0) + 1; outEv.push(['sp', e.a, r2(p.x), r2(p.z), r2(p.yaw), S.loadR[1], S.loadR[2], S.loadR[3], S.loadR[4], p.spN]); break; }
        }
      }
      netEvIdx = S.evc;
    }
    function netStep() {
      if (!online) return;
      if (online.role === 'host') {
        hostCollect();
        online.snapN++;
        if (online.snapN % 3 === 0) {
          for (const [id, d] of dmgSet) outEv.push(['d', id, d]);
          dmgSet.clear();
          if (outEv.length) { nsend({ t: 'v', e: outEv }); outEv = []; }
          nsend({ t: 's', n: ++online.seq, ph: PH.indexOf(S.phase), pt: r2(S.pt), rt: r2(S.rt), r: S.round, pts: S.pts.slice(0, S.pl.length), w: S.winner, p: S.pl.map(plRow) }, true);
        }
      } else {
        online.snapN++;
        const p = me;
        if (online.snapN % 2 === 0) nsend({ t: 'i', x: r2(p.x), y: r2(p.y), z: r2(p.z), yw: r2(p.yaw), pt: r2(p.pitch), f: (p.crouch ? 1 : 0) | (p.ads ? 2 : 0) | (p.onG ? 4 : 0) | (p.reloadT > 0 ? 16 : 0) | (p.editing ? 32 : 0), sl: p.slot, b: p.build, vx: r2(p.vx), vz: r2(p.vz), sp: online.lastSpN || 0 }, true);
        guestCollect();
        if (online.claims.length || online.shotQ.length) {
          const wp = p.wep[p.slot];
          nsend({ t: 'f', w: wp ? wp.w : 0, r: wp ? wp.r : 0, c: online.claims, e: online.shotQ });
          online.claims = []; online.shotQ = [];
        }
      }
    }
    function guestCollect() {
      for (let i = netEvIdx; i < S.evc; i++) { const e = S.evq[i]; if (e.k === 'shot' && e.a === me.i && e.v < 3) online.shotQ.push([r2(e.x), r2(e.y), r2(e.z), e.n, e.v, e.p ? e.p.mat : 0]); }
      netEvIdx = S.evc;
    }
    function onData(m, from) {
      if (!m || typeof m !== 'object') return;
      if (online && online.role === 'host') { hostData(m, from); return; }
      if (!online) return;
      if (m.t === 'start') { guestStart(m); return; }
      if (!S || !S.client) return;
      if (m.t === 's') guestSnap(m);
      else if (m.t === 'v') guestEvents(m.e);
      else if (m.t === 'bx') { const pc = online.pend.get(m.k); if (pc) { online.pend.delete(m.k); S.dropPiece(pc); if (!S.infinite) me.mats[pc.mat] += 10; } }
      else if (m.t === 'hero') { const p = S.pl[m.i]; if (p && HEROES[m.h]) { p.hero = m.h; remakeChar(m.i); } }
    }
    function remakeChar(i) { const c = chars[i]; if (c) c.root.parent && c.root.parent.remove(c.root); chars[i] = view.makeChar(S.pl[i].hero); }
    function hostData(m, from) {
      if (!S || !online.idx) return;
      const i = online.idx.get(from); if (i == null) return;
      const p = S.pl[i]; if (!p || !p.remote) return;
      if (m.t === 'i') {
        if (!p.alive) return;
        if ((m.sp | 0) !== (p.spN || 0)) return;
        const nx = +m.x, ny = +m.y, nz = +m.z;
        if (!isFinite(nx) || !isFinite(ny) || !isFinite(nz)) return;
        const [x0, x1, z0, z1] = S.bounds;
        p.px = p.x; p.py = p.y; p.pz = p.z;
        p.x = clamp(nx, x0 * TS, (x1 + 1) * TS); p.y = clamp(ny, -40, MAXL * LH + 4); p.z = clamp(nz, z0 * TS, (z1 + 1) * TS);
        p.yaw = +m.yw || 0; p.pitch = clamp(+m.pt || 0, -1.5, 1.5); p.crouch = !!(m.f & 1); p.ads = !!(m.f & 2); p.onG = !!(m.f & 4); p.editing = !!(m.f & 32);
        p.vx = +m.vx || 0; p.vz = +m.vz || 0;
        if (m.sl >= 0 && m.sl < p.wep.length) p.slot = m.sl | 0;
        p.build = m.b >= 0 && m.b < 4 ? m.b | 0 : -1;
        p.reloadT = m.f & 16 ? 0.5 : 0;
        p.netT = performance.now(); pushBuf(p, p.x, p.y, p.z, p.yaw, p.pitch);
      } else if (m.t === 'b') {
        const ty = m.ty | 0, x = m.x | 0, z = m.z | 0, l = m.l | 0, d = m.d | 0, mt = clamp(m.m | 0, 0, 2);
        let ok = false;
        if (p.alive && S.phase !== 'over' && S.phase !== 'round' && ty >= 0 && ty < 4) {
          const cx = (x + 0.5) * TS, cz = (z + 0.5) * TS;
          if (Math.hypot(cx - p.x, cz - p.z) < TS * 2.6 && Math.abs(l * LH - p.y) < LH * 2.5) {
            p.mat = mt;
            if (S.validAt(p, ty, x, z, l, d)) ok = !!S.placeAt(p, ty, x, z, l, d, mt);
          }
        }
        if (!ok) nsendTo(from, { t: 'bx', k: m.k });
      } else if (m.t === 'e') {
        const pc = S.byId.get(m.id); if (pc) S.applyEdit(p, pc, m.m | 0, m.d == null ? null : m.d | 0);
      } else if (m.t === 'f') {
        const w = m.w | 0, r = clamp(m.r | 0, 0, 4); const D = W[w]; if (!D) return;
        const now = S.t;
        p.shotCr = Math.min(3, (p.shotCr == null ? 3 : p.shotCr) + (now - (p.lastShotT || 0)) * D.rate * 1.3);
        p.lastShotT = now;
        if (p.shotCr < 1) return;
        p.shotCr -= 1; p.shotT = now;
        const cl = Array.isArray(m.c) ? m.c.slice(0, D.pel + 2) : [];
        for (const c of cl) if (Array.isArray(c)) S.applyClaim(p, w, r, c[0] | 0, c[1] | 0, c[2] | 0, +c[3] || 0);
        if (Array.isArray(m.e)) for (const s of m.e.slice(0, 3)) { if (!Array.isArray(s)) continue; const e = S.emit('shot'); e.a = i; e.b = w; e.x = +s[0] || 0; e.y = +s[1] || 0; e.z = +s[2] || 0; e.n = s[3] | 0; e.v = s[4] | 0; e.p = null; }
      } else if (m.t === 'fall') { S.hurt(p, clamp(+m.v || 0, 0, 150), null, 0, 3); }
      else if (m.t === 'hero') { if (HEROES[m.h]) { p.hero = m.h | 0; remakeChar(i); nsend({ t: 'hero', i, h: p.hero }); } }
    }
    function pushBuf(p, x, y, z, yaw, pitch) {
      let b = online.buf.get(p.i); if (!b) online.buf.set(p.i, b = []);
      b.push({ t: performance.now(), x, y, z, yaw, pitch });
      if (b.length > 12) b.shift();
    }
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
      const meI = m.me | 0;
      startMatch(cfg, meI, { client: true });
      S.claim = (kind, idx, head, dist) => {
        online.claims.push([kind, idx, head, r2(dist)]);
        if (kind === 0) {
          const q = S.pl[idx], wp = me.wep[me.slot], D = W[wp.w];
          let dmg = D.dmg * (1 + 0.06 * wp.r); if (D.fall) { const [f0, f1, fm] = D.fall; if (dist > f0) dmg *= dist >= f1 ? fm : 1 - (1 - fm) * (dist - f0) / (f1 - f0); } if (head) dmg *= D.head;
          if (q) { hm.className = 'hm'; void hm.offsetWidth; hm.className = 'hm on' + (head ? ' hd' : ''); dmgNum(q.x, q.y + 2.1, q.z, Math.round(dmg), head ? 'h' : ''); audio.play(head ? 'head' : 'hitMark'); stats.hits++; }
        }
      };
      S.onLocalBuild = (p, pc) => { online.pend.set(pc.key, pc); pc.pend = true; nsend({ t: 'b', ty: pc.type, x: pc.x, z: pc.z, l: pc.l, d: pc.d, m: pc.mat, k: pc.key }); };
      S.onFall = d => nsend({ t: 'fall', v: Math.round(d) });
      applyFull(m.full);
      online.lastSpN = me.spN || 0;
      nsend({ t: 'hero', h: prefs.hero });
    }
    function applyFull(F) {
      if (!F) return;
      S.clearPieces(false); S.evc = 0;
      for (const r of F.pieces || []) { const pc = S.addPiece(r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], false); if (pc) { S.rekey(pc, r[0]); pc.born = S.t - r[9]; pc.dmg = r[10] || 0; pc.edit = r[11] || 0; } }
      S.phase = PH[F.ph] || 'count'; S.pt = F.pt; S.rt = F.rt; S.round = F.round; S.pts = F.pts.slice(); S.loadR = F.loadR.slice(); S.winner = F.win;
      (F.pl || []).forEach((row, i) => applyRow(S.pl[i], row, true));
      S.evc = 0; view.markDirty();
    }
    function applyRow(p, row, force) {
      if (!p || !Array.isArray(row)) return;
      const f = row[5];
      const wasAlive = p.alive;
      p.alive = !!(f & 8); p.hp = row[6]; p.sh = row[7]; p.kills = row[10]; p.deaths = row[11]; p.respT = row[20] || 0;
      if (p.hero !== row[16] && HEROES[row[16]]) { p.hero = row[16]; remakeChar(p.i); }
      if (typeof row[19] === 'string' && (p !== me || force) && row[19] !== p.wepStr) { p.wepStr = row[19]; const ws = row[19].split(',').map(Number), old = p.wep; p.wep = ws.map((v, k) => ({ w: (v / 10) | 0, r: v % 10, ammo: old[k] && old[k].w === ((v / 10) | 0) ? old[k].ammo : W[(v / 10) | 0].mag })); }
      if (p === me) {
        if (!online.pend.size) { p.mats[0] = row[12]; p.mats[1] = row[13]; p.mats[2] = row[14]; }
        if ((row[15] || 0) !== (p.spN || 0) || force) { p.spN = row[15] || 0; online.lastSpN = p.spN; p.x = p.px = row[0]; p.y = p.py = row[1]; p.z = p.pz = row[2]; p.vx = p.vy = p.vz = 0; if (force) { p.yaw = row[3]; look.yaw = p.yaw; } }
        return;
      }
      p.crouch = !!(f & 1); p.ads = !!(f & 2); p.onG = !!(f & 4); p.editing = !!(f & 32); p.reloadT = f & 16 ? 0.5 : 0;
      p.slot = row[8]; p.build = row[9]; p.vx = row[17]; p.vz = row[18]; p.pitch = row[4];
      pushBuf(p, row[0], row[1], row[2], row[3], row[4]);
      if (force || !wasAlive && p.alive) { p.x = p.px = row[0]; p.y = p.py = row[1]; p.z = p.pz = row[2]; p.yaw = row[3]; const b = online.buf.get(p.i); if (b) { b.length = 0; pushBuf(p, row[0], row[1], row[2], row[3], row[4]); } }
    }
    function guestSnap(m) {
      if ((m.n | 0) <= (online.lastSnap || 0)) return;
      online.lastSnap = m.n | 0;
      online.lastSnapT = performance.now();
      const ph = PH[m.ph] || S.phase;
      S.phase = ph; S.pt = +m.pt || 0; S.rt = +m.rt || 0; if (Array.isArray(m.pts)) for (let i = 0; i < m.pts.length; i++) S.pts[i] = m.pts[i];
      S.winner = m.w;
      if (Array.isArray(m.p)) m.p.forEach((row, i) => applyRow(S.pl[i], row, false));
    }
    function guestEvents(list) {
      if (!Array.isArray(list)) return;
      for (const r of list) {
        if (!Array.isArray(r)) continue;
        switch (r[0]) {
          case 'b': {
            const [, id, type, x, z, l, d, mat, team, owner, ago] = r;
            const key = PK(type === 0 ? d : type === 1 ? 2 : 3, x, z, l);
            const ex = S.pieces.get(key);
            if (ex && ex.pend) { online.pend.delete(key); ex.pend = false; S.rekey(ex, id); ex.team = team; ex.owner = owner; ex.mat = mat; ex.max = MATS[mat].hp; break; }
            if (ex) S.dropPiece(ex);
            const pc = S.addPiece(type, x, z, l, d, mat, team, owner, false); if (pc) { S.rekey(pc, id); pc.born = S.t - ago; }
            break;
          }
          case 'x': { const pc = S.byId.get(r[1]); if (pc) { const e0 = S.evc; S.dropPiece(pc); if (S.evc > e0) S.evq[S.evc - 1].n = r[2]; if (edit && edit.pc === pc) endEdit(false); } break; }
          case 'e': { const pc = S.byId.get(r[1]); if (pc) { if (pc.type === 2 && pc.d !== r[3]) { S.conDel(pc); pc.d = r[3]; pc.con = S.conKeys(pc); S.conAdd(pc); } pc.edit = r[2]; const e = S.emit('edit'); e.p = pc; e.a = -1; } break; }
          case 'd': { const pc = S.byId.get(r[1]); if (pc) { pc.dmg = r[2]; const e = S.emit('phit'); e.p = pc; e.v = 0; e.a = -1; } break; }
          case 's': { if (r[1] === me.i) break; const e = S.emit('shot'); e.a = r[1]; e.b = r[2]; e.x = r[3]; e.y = r[4]; e.z = r[5]; e.n = r[6]; e.v = r[7]; e.p = r[6] === 2 ? { mat: r[8] } : null; const p = S.pl[r[1]]; if (p) p.shotT = S.t; break; }
          case 'h': { const e = S.emit('hurt'); e.a = r[1]; e.b = r[2]; e.v = r[3]; e.n = r[4]; e.u = r[5]; if (r[1] === me.i) e.a = -2; const b = S.pl[r[2]]; if (b) b.dmgT = S.t; break; }
          case 'k': { const e = S.emit('kill'); e.a = r[1]; e.b = r[2]; e.n = r[3]; const b = S.pl[r[2]]; if (b) { b.alive = false; if (b === me) { endEdit(false); } } break; }
          case 'r': { S.round = r[1]; const e = S.emit('round'); e.v = r[1]; break; }
          case 'g': S.phase = 'fight'; S.emit('go'); break;
          case 're': { S.phase = 'round'; const e = S.emit('roundEnd'); e.a = r[1]; break; }
          case 'o': { S.phase = 'over'; S.winner = r[1]; const e = S.emit('over'); e.a = r[1]; break; }
          case 'z': S.clearPieces(false); online.pend.clear(); if (edit) endEdit(false); break;
          case 'sp': {
            const i = r[1], p = S.pl[i]; if (!p) break;
            S.loadR[1] = r[5]; S.loadR[2] = r[6]; S.loadR[3] = r[7]; S.loadR[4] = r[8];
            if (p === me) { S.place(me, i, [r[2], r[3]]); me.yaw = r[4]; look.yaw = r[4]; look.pitch = 0; me.spN = r[9]; online.lastSpN = r[9]; spec = null; }
            else { p.alive = true; p.x = p.px = r[2]; p.z = p.pz = r[3]; p.y = p.py = 0; p.yaw = r[4]; const b = online.buf.get(i); if (b) b.length = 0; pushBuf(p, r[2], 0, r[3], r[4], 0); }
            break;
          }
        }
      }
    }
    function guestEdit(pc, mask, dir) {
      if (S.applyEdit(me, pc, mask, dir)) audio.play('editOk');
      nsend({ t: 'e', id: pc.id, m: mask, d: dir });
    }
    function guestReload() { S.reload(me); }
    function bgTick() {
      if (!document.hidden || !online || online.role !== 'host' || !S) return;
      const now = performance.now();
      let n = Math.min(60, Math.floor((now - bgT) / (DT * 1000)));
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

    window.__bb = { auto(l) { if (me) { me.bot = l; botInit(me); } }, input(o) { if ('fire' in o) mouse0 = !!o.fire; if ('ads' in o) mouse2 = !!o.ads; }, get S() { return S; }, get me() { return me; }, get phase() { return phase; }, get online() { return online; }, look, prefs, keys, startLocal, makeSim, botInit, botThink, LVL, W, TS, LH, view, get edit() { return edit; }, toggleEdit, pickBuild, pickSlot };
    showHome();
    return () => { bgStop(); audio.close(); unlock(); if (online) { try { api.net.close(); } catch (e) {} } view.dispose(); try { delete window.__bb; } catch (e) {} };
  }

  function fitPR(api, v, hook) {
    const r = v.renderer, c = v.canvas, Q = [1, 0.75, 0.55], sz = new v.THREE.Vector2();
    let lvl = 0, cw = 0, avg = 0.016, t = -2, wait = 8, chk = 0, lf = -1, sf = 0, up = 0;
    const apply = () => {
      const d = Math.min(2, window.devicePixelRatio || 1), B = Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * d * d * 1.05);
      const lw = r.getSize(sz).x || v.w, pr = Math.max(0.5, Math.min(4, d * cw / lw, Math.sqrt(B / (lw * (sz.y || v.h))))) * Q[lvl];
      if (Math.abs(r.getPixelRatio() - pr) > 0.01) r.setPixelRatio(pr);
      r.shadowMap.autoUpdate = lvl < 2;
    };
    const size = () => { const w = c.getBoundingClientRect().width; if (w && Math.abs(w - cw) > Math.max(2, cw * 0.02)) { cw = w; apply(); } };
    const set = n => { lvl = n; t = 0; apply(); if (hook) hook(lvl); };
    r.forceContextLoss = () => {};
    size(); api.on(window, 'resize', size);
    api.loop(dt => {
      const f = r.info.render.frame;
      if (f === lf || !(dt > 0)) return;
      lf = f;
      if (lvl > 1 && (sf ^= 1)) r.shadowMap.needsUpdate = true;
      avg += (dt - avg) * Math.min(1, dt * 1.5); t += dt;
      if (performance.now() - chk > 500) { chk = performance.now(); size(); }
      if (t < 1.5) return;
      if (avg > 0.021 && lvl < Q.length - 1) { if (up && t < 6) wait = Math.min(64, wait * 2); up = 0; set(lvl + 1); }
      else if (avg < 0.0175 && lvl && t > wait) { up = 1; set(lvl - 1); }
    });
  }

  Ameplay.register({
    id: ID, title: 'Build Brawl', category: '3D', tint: '#3fa7ff',
    blurb: 'Build walls, ramps, floors and cones in an instant and outplay your rival in build fights and box fights.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Space</kbd> jump · mouse aim and fire · <kbd>1</kbd>-<kbd>4</kbd> weapons · <kbd>Z</kbd><kbd>X</kbd><kbd>C</kbd><kbd>V</kbd> wall, floor, ramp, cone · <kbd>G</kbd> edit · <kbd>R</kbd> reload · <kbd>Esc</kbd> pause',
    better: 'high', width: 960, ownPause: true,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M8 54h48M12 54V30h20v24M32 54 54 30M12 30l10-12 10 12"/></svg>',
    css: CSS,
    mount(root, api) {
      const wrap = document.createElement('div'); wrap.className = 'stage'; wrap.setAttribute('data-i18n', ''); root.append(wrap);
      let cleanup = null;
      const narrow = root.clientWidth && root.clientWidth < 560;
      api.gl(narrow ? 600 : 960, narrow ? 900 : 600).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v); }).catch(e => { console.error(e); if (api.alive) api.overlay({ kicker: '3D', title: 'WebGL unavailable', text: 'This game needs WebGL, which your browser could not start.', button: null }); });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
})();
